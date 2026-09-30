/* =====================================================================
   PLANE: a math-coordinate canvas with drawing primitives
   ===================================================================== */
class Plane {
  constructor(host, opts = {}) {
    this.cx = opts.cx ?? 0; this.cy = opts.cy ?? 0; this.span = opts.span ?? 5;
    this.host = host;
    this.canvas = h('canvas'); host.append(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.onDraw = () => {};
    this.transparent = !!opts.transparent;
    if ('coords' in host.dataset) {
      this.coordEl = h('div', { class: 'coord', 'aria-hidden': 'true' }); host.append(this.coordEl);
      this.canvas.addEventListener('pointermove', e => {
        const r = this.canvas.getBoundingClientRect(), [x, y] = this.toMath(e.clientX - r.left, e.clientY - r.top);
        this.coordEl.textContent = `x ${fmt(x)}    y ${fmt(y)}`; this.coordEl.classList.add('on');
      });
      this.canvas.addEventListener('pointerleave', () => this.coordEl.classList.remove('on'));
    }
    this._theme = () => this.draw();
    addEventListener('themechange', this._theme);
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(host);
    this.resize();
  }
  resize() {
    const r = this.host.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2.5);
    this.w = Math.max(1, r.width); this.h = Math.max(1, r.height);
    this.canvas.width = Math.round(this.w * dpr); this.canvas.height = Math.round(this.h * dpr);
    this.canvas.style.width = this.w + 'px'; this.canvas.style.height = this.h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  }
  get scale() { return Math.min(this.w, this.h) / (2 * this.span); }
  X(x) { return this.w / 2 + (x - this.cx) * this.scale; }
  Y(y) { return this.h / 2 - (y - this.cy) * this.scale; }
  toMath(px, py) { return [(px - this.w / 2) / this.scale + this.cx, -(py - this.h / 2) / this.scale + this.cy]; }
  bounds() { const s = this.scale; return { x0: this.cx - this.w/2/s, x1: this.cx + this.w/2/s, y0: this.cy - this.h/2/s, y1: this.cy + this.h/2/s }; }
  draw() {
    this.pal = palette();
    const c = this.ctx;
    c.clearRect(0, 0, this.w, this.h);
    if (!this.transparent) { c.fillStyle = this.pal.stage; c.fillRect(0, 0, this.w, this.h); }
    this.onDraw(c, this);
  }
  requestDraw() {
    if (this._raf) return;
    this._raf = requestAnimationFrame(() => { this._raf = null; this.draw(); });
  }
  destroy() {
    this.ro.disconnect(); cancelAnimationFrame(this._raf);
    removeEventListener('themechange', this._theme); this.canvas.remove(); if (this.coordEl) this.coordEl.remove();
  }
  /* primitives */
  path(pts, { stroke, width = 2, fill, close = false, dash } = {}) {
    const c = this.ctx; c.beginPath();
    pts.forEach(([x, y], i) => i ? c.lineTo(this.X(x), this.Y(y)) : c.moveTo(this.X(x), this.Y(y)));
    if (close) c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) {
      c.strokeStyle = stroke; c.lineWidth = width; c.setLineDash(dash || []);
      c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); c.setLineDash([]);
    }
  }
  /* polyline that breaks at non-finite points or huge jumps (for singular maps) */
  curve(pts, { stroke, width = 1.5, maxJump = Infinity } = {}) {
    const c = this.ctx; c.beginPath(); let pen = false, lx = 0, ly = 0;
    for (const [x, y] of pts) {
      if (!isFinite(x) || !isFinite(y) || Math.abs(x) > 60 || Math.abs(y) > 60) { pen = false; continue; }
      const px = this.X(x), py = this.Y(y);
      if (pen && Math.hypot(px - lx, py - ly) < maxJump) c.lineTo(px, py); else c.moveTo(px, py);
      pen = true; lx = px; ly = py;
    }
    c.strokeStyle = stroke; c.lineWidth = width; c.lineJoin = 'round'; c.stroke();
  }
  arrow(x0, y0, x1, y1, color, width = 3.5) {
    const c = this.ctx, ax = this.X(x0), ay = this.Y(y0), bx = this.X(x1), by = this.Y(y1);
    const ang = Math.atan2(by - ay, bx - ax), len = Math.hypot(bx - ax, by - ay), hl = Math.min(16, len * .45);
    c.strokeStyle = color; c.fillStyle = color; c.lineWidth = width; c.lineCap = 'round';
    c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx - Math.cos(ang) * hl * .8, by - Math.sin(ang) * hl * .8); c.stroke();
    c.beginPath(); c.moveTo(bx, by);
    c.lineTo(bx - hl * Math.cos(ang - .42), by - hl * Math.sin(ang - .42));
    c.lineTo(bx - hl * Math.cos(ang + .42), by - hl * Math.sin(ang + .42));
    c.closePath(); c.fill();
  }
  dot(x, y, r, fill, stroke, lw = 2) {
    const c = this.ctx; c.beginPath(); c.arc(this.X(x), this.Y(y), r, 0, Math.PI * 2);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); }
  }
  label(text, x, y, { color, size = 20, italic = true, align = 'center', alpha: a = 1, dx = 0, dy = 0, halo = true } = {}) {
    if (a <= .01) return;
    const c = this.ctx; c.globalAlpha = a;
    c.font = italic ? `italic ${size}px "STIX Two Text", "Cambria Math", "Times New Roman", serif` : `500 ${size * .85}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`;
    c.textAlign = align; c.textBaseline = 'middle';
    const px = this.X(x) + dx, py = this.Y(y) + dy;
    if (halo) { c.lineWidth = 4; c.strokeStyle = this.pal.stage; c.lineJoin = 'round'; c.strokeText(text, px, py); }
    c.fillStyle = color || this.pal.text; c.fillText(text, px, py);
    c.globalAlpha = 1;
  }
  grid(step = 1, { color, axes = true } = {}) {
    const b = this.bounds(), c = this.ctx;
    c.lineWidth = 1; c.strokeStyle = color || this.pal.grid; c.beginPath();
    for (let x = Math.ceil(b.x0 / step) * step; x <= b.x1; x += step) { c.moveTo(this.X(x), 0); c.lineTo(this.X(x), this.h); }
    for (let y = Math.ceil(b.y0 / step) * step; y <= b.y1; y += step) { c.moveTo(0, this.Y(y)); c.lineTo(this.w, this.Y(y)); }
    c.stroke();
    if (axes) {
      c.strokeStyle = this.pal['grid-strong']; c.lineWidth = 1.5; c.beginPath();
      c.moveTo(this.X(0), 0); c.lineTo(this.X(0), this.h); c.moveTo(0, this.Y(0)); c.lineTo(this.w, this.Y(0)); c.stroke();
    }
  }
}
