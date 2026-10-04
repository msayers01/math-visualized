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
    this.ptr = null; this.pressed = false; this.dpr = 1; this.interactive = false;
    const cv = this.canvas, rel = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; this.ptr = rel(e); this.requestDraw(); });
    cv.addEventListener('pointerleave', () => { this.ptr = null; this.requestDraw(); });
    cv.addEventListener('pointerdown', e => { this.ptr = rel(e); this.pressed = true; this.touchPtr = e.pointerType === 'touch'; this.requestDraw(); });
    const up = () => { if (!this.pressed) return; this.pressed = false; if (this.touchPtr) this.ptr = null; this.requestDraw(); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    this.handles = []; this.focusIdx = 0; this.kbd = false; this.touched = false; this.pulses = [];
    cv.addEventListener('pointerdown', () => { this.kbd = false; });
    cv.addEventListener('blur', () => { this.kbd = false; this.requestDraw(); });
    this._theme = () => this.draw();
    addEventListener('themechange', this._theme);
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(host);
    this.resize();
  }
  resize() {
    const r = this.host.getBoundingClientRect(), dpr = this.dpr = Math.min(devicePixelRatio || 1, 2.5);
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
    this.dark = lum(this.pal.stage) < .4;
    if (!this.transparent) {
      c.fillStyle = this.pal.stage; c.fillRect(0, 0, this.w, this.h);
      /* a faint centre light and edge falloff give the figure depth without touching the lessons' own colours */
      const g = c.createRadialGradient(this.w / 2, this.h / 2, Math.min(this.w, this.h) * .25, this.w / 2, this.h / 2, Math.hypot(this.w, this.h) * .62);
      g.addColorStop(0, this.dark ? 'rgba(120,150,220,.07)' : 'rgba(255,255,255,.3)');
      g.addColorStop(1, this.dark ? 'rgba(0,0,0,.32)' : 'rgba(70,90,130,.05)');
      c.fillStyle = g; c.fillRect(0, 0, this.w, this.h);
    }
    this.handles = [];
    this.onDraw(c, this);
    this.syncPulses();
  }
  /* idle 'grab me' rings: DOM overlays animated by CSS (compositor only, no canvas redraws); gone after first touch */
  syncPulses() {
    const hs = this.touched || reduceMotion ? [] : this.handles.slice(0, 4);
    while (this.pulses.length > hs.length) this.pulses.pop().remove();
    while (this.pulses.length < hs.length) { const e = h('i', { class: 'hpulse', 'aria-hidden': 'true' }); this.host.append(e); this.pulses.push(e); }
    hs.forEach((q, i) => { const t = `${q.px}px ${q.py}px`; if (this.pulses[i]._t !== t) { this.pulses[i]._t = t; this.pulses[i].style.translate = t; } });
  }
  clearPulses() { this.pulses.forEach(e => e.remove()); this.pulses = []; }
  requestDraw() {
    if (this._raf) return;
    this._raf = requestAnimationFrame(() => { this._raf = null; this.draw(); });
  }
  destroy() {
    this.ro.disconnect(); cancelAnimationFrame(this._raf);
    removeEventListener('themechange', this._theme); this.clearPulses(); this.canvas.remove(); if (this.coordEl) this.coordEl.remove();
  }
  /* soft light bleed around bright strokes in dark mode (cheap: one shadow per path) */
  glow(color, blur = 10) {
    if (!this.dark || this._glowing) return;
    this._glowing = true; this.ctx.save();
    this.ctx.shadowColor = color; this.ctx.shadowBlur = blur * this.dpr;
  }
  unglow() { if (!this._glowing) return; this._glowing = false; this.ctx.restore(); }
  /* primitives */
  path(pts, { stroke, width = 2, fill, close = false, dash } = {}) {
    const c = this.ctx; c.beginPath();
    pts.forEach(([x, y], i) => i ? c.lineTo(this.X(x), this.Y(y)) : c.moveTo(this.X(x), this.Y(y)));
    if (close) c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) {
      c.strokeStyle = stroke; c.lineWidth = width; c.setLineDash(dash || []);
      c.lineJoin = 'round'; c.lineCap = 'round';
      if (width >= 2 && !dash) this.glow(stroke, 8);
      c.stroke(); this.unglow(); c.setLineDash([]);
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
    c.strokeStyle = stroke; c.lineWidth = width; c.lineJoin = 'round'; c.lineCap = 'round';
    if (width >= 1.5) this.glow(stroke, 9);
    c.stroke(); this.unglow();
  }
  arrow(x0, y0, x1, y1, color, width = 3.5) {
    const c = this.ctx, ax = this.X(x0), ay = this.Y(y0), bx = this.X(x1), by = this.Y(y1);
    const ang = Math.atan2(by - ay, bx - ax), len = Math.hypot(bx - ax, by - ay), hl = Math.min(16, len * .45);
    c.strokeStyle = color; c.fillStyle = color; c.lineWidth = width; c.lineCap = 'round'; c.lineJoin = 'round';
    this.glow(color, 8);
    c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx - Math.cos(ang) * hl * .8, by - Math.sin(ang) * hl * .8); c.stroke();
    c.beginPath(); c.moveTo(bx, by);
    c.lineTo(bx - hl * Math.cos(ang - .42), by - hl * Math.sin(ang - .42));
    c.lineTo(bx - hl * Math.cos(ang + .42), by - hl * Math.sin(ang + .42));
    c.closePath(); c.fill(); this.unglow();
  }
  dot(x, y, r, fill, stroke, lw = 2) {
    const c = this.ctx, px = this.X(x), py = this.Y(y);
    if (!isFinite(px + py) || !isFinite(r)) return;
    /* A handle is a hollow stage-coloured disc with a brass rim (the lessons' convention): it gets a soft halo, a
       lift shadow, and grows when the pointer is over it or dragging it. Nothing about the lessons changes. */
    const handle = r >= 7 && lw >= 2.5 && fill === this.pal.stage && stroke === this.pal.brass;
    if (handle) {
      const idx = this.handles.length; if (this.interactive) this.handles.push({ px, py, x, y });
      const hov = this.ptr && Math.hypot(this.ptr[0] - px, this.ptr[1] - py) < r + 12, act = hov && this.pressed;
      const k = act ? 1.18 : hov ? 1.1 : 1, rr = r * k;
      const halo = c.createRadialGradient(px, py, rr * .6, px, py, rr * (act ? 3.1 : hov ? 2.7 : 2.1));
      halo.addColorStop(0, tint(stroke, act ? .38 : hov ? .3 : .2)); halo.addColorStop(1, tint(stroke, 0));
      c.fillStyle = halo; c.beginPath(); c.arc(px, py, rr * 3.2, 0, Math.PI * 2); c.fill();
      c.save(); c.shadowColor = this.dark ? tint(stroke, .55) : 'rgba(20,30,50,.28)'; c.shadowBlur = (act ? 14 : 8) * this.dpr; c.shadowOffsetY = (this.dark ? 0 : 2) * this.dpr;
      c.beginPath(); c.arc(px, py, rr, 0, Math.PI * 2); c.fillStyle = fill; c.fill(); c.restore();
      c.beginPath(); c.arc(px, py, rr, 0, Math.PI * 2); c.strokeStyle = stroke; c.lineWidth = lw; c.stroke();
      if (this.kbd && idx === this.focusIdx) { c.save(); c.setLineDash([4, 4]); c.beginPath(); c.arc(px, py, rr + 7, 0, Math.PI * 2); c.strokeStyle = this.pal.text; c.lineWidth = 1.5; c.stroke(); c.restore(); }
      c.beginPath(); c.arc(px, py, Math.max(1.5, rr * (act ? .5 : .32)), 0, Math.PI * 2); c.fillStyle = stroke; c.globalAlpha = act ? .9 : .55; c.fill(); c.globalAlpha = 1;
      return;
    }
    c.beginPath(); c.arc(px, py, r, 0, Math.PI * 2);
    if (fill) {
      if (r >= 4 && fill !== this.pal.stage) { c.save(); c.shadowColor = this.dark ? tint(fill, .6) : 'rgba(20,30,50,.22)'; c.shadowBlur = (this.dark ? 8 : 4) * this.dpr; c.shadowOffsetY = (this.dark ? 0 : 1) * this.dpr; c.fillStyle = fill; c.fill(); c.restore(); }
      else { c.fillStyle = fill; c.fill(); }
    }
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
  /* Frame the plot area [0,W]x[0,H] with margins {l, r, t, b} (math units) using one uniform scale. */
  fit(W, H, { l = 1, r = 1, t = 1, b = 1 } = {}) {
    const sc = Math.min(this.w / (W + l + r), this.h / (H + t + b));
    this.span = Math.min(this.w, this.h) / (2 * sc);
    this.cx = W / 2 + (r - l) / 2; this.cy = H / 2 + (t - b) / 2;
  }
  /* integer tick numbers along both axes (skips 0); thins out on small screens */
  ticks(step = 1, { size = 15 } = {}) {
    while (this.scale * step < 26) step *= 2;
    const b = this.bounds(), col = this.pal.muted, txt = v => (v < 0 ? '−' : '') + (+Math.abs(v).toFixed(2));
    /* A label whose box would cross the canvas edge is dropped (an end label cut in half reads as a wrong number). */
    const half = t => t.length * size * .85 * .27 + 3, vh = size * .85 * .6 + 2;
    for (let x = Math.ceil(b.x0 / step) * step; x <= b.x1; x += step) {
      const t = txt(x), px = this.X(x);
      if (Math.abs(x) > 1e-9 && px - half(t) >= 1 && px + half(t) <= this.w - 1) this.label(t, x, 0, { size, italic: false, color: col, dy: 15, halo: true });
    }
    for (let y = Math.ceil(b.y0 / step) * step; y <= b.y1; y += step) {
      const t = txt(y), py = this.Y(y);
      if (Math.abs(y) > 1e-9 && py - vh >= 0 && py + vh <= this.h) this.label(t, 0, y, { size, italic: false, color: col, dx: -11, align: 'right', halo: true });
    }
  }
  grid(step = 1, { color, axes = true } = {}) {
    const b = this.bounds(), c = this.ctx, col = color || this.pal.grid, sx = this.scale * step;
    /* faint subdivisions appear once the cells are big enough to read them */
    if (sx >= 64) {
      const sub = step / 4; c.lineWidth = 1; c.strokeStyle = col; c.globalAlpha = .32; c.beginPath();
      for (let x = Math.ceil(b.x0 / sub) * sub; x <= b.x1; x += sub) { if (Math.abs(x / step - Math.round(x / step)) < 1e-6) continue; c.moveTo(this.X(x), 0); c.lineTo(this.X(x), this.h); }
      for (let y = Math.ceil(b.y0 / sub) * sub; y <= b.y1; y += sub) { if (Math.abs(y / step - Math.round(y / step)) < 1e-6) continue; c.moveTo(0, this.Y(y)); c.lineTo(this.w, this.Y(y)); }
      c.stroke(); c.globalAlpha = 1;
    }
    c.lineWidth = 1; c.strokeStyle = col; c.beginPath();
    for (let x = Math.ceil(b.x0 / step) * step; x <= b.x1; x += step) { c.moveTo(Math.round(this.X(x)) + .5, 0); c.lineTo(Math.round(this.X(x)) + .5, this.h); }
    for (let y = Math.ceil(b.y0 / step) * step; y <= b.y1; y += step) { c.moveTo(0, Math.round(this.Y(y)) + .5); c.lineTo(this.w, Math.round(this.Y(y)) + .5); }
    c.stroke();
    if (axes) {
      const ox = this.X(0), oy = this.Y(0), st = this.pal['grid-strong'];
      c.strokeStyle = st; c.fillStyle = st; c.lineWidth = 1.6; c.lineCap = 'round'; c.beginPath();
      c.moveTo(ox, 0); c.lineTo(ox, this.h); c.moveTo(0, oy); c.lineTo(this.w, oy); c.stroke();
      /* small arrowheads where the axes leave the frame (only when the axis is actually on screen) */
      const tri = (x, y, a) => { c.beginPath(); c.moveTo(x, y); c.lineTo(x - 8 * Math.cos(a - .42), y - 8 * Math.sin(a - .42)); c.lineTo(x - 8 * Math.cos(a + .42), y - 8 * Math.sin(a + .42)); c.closePath(); c.fill(); };
      if (ox > 12 && ox < this.w - 12) tri(ox, 2, -Math.PI / 2);
      if (oy > 12 && oy < this.h - 12) tri(this.w - 2, oy, 0);
    }
  }
}
