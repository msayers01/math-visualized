/* =====================================================================
   UNDERGRAD — Derivatives as tangent slopes
   ===================================================================== */
{
  const rnd = v => Math.round(v * 1000) / 1000;
  const n4 = v => (v < 0 ? '−' : '') + (+Math.abs(v).toFixed(4));
  const fm = v => !isFinite(v) ? 'undefined' : Math.abs(v) >= 1000 ? (v < 0 ? '−' : '') + Math.round(Math.abs(v)).toLocaleString('en') : num(v);
  const nice = (span, n) => { const r = span / n, e = Math.pow(10, Math.floor(Math.log10(r))), f = r / e; return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * e; };
  const HS = [1, .5, .1, .01];

  /* the functions: f, its derivative d (NaN where none), plot ranges, and the points where f' fails */
  const FN = {
    sq:   { label: 'x²', tex: 'x²', f: x => x * x, d: x => 2 * x, xr: [-3, 3], yr: [-1, 9.5], dr: [-6.5, 6.5], bad: [] },
    cu:   { label: 'x³', tex: 'x³', f: x => x * x * x, d: x => 3 * x * x, xr: [-2, 2], yr: [-8.5, 8.5], dr: [-1.5, 12.5], bad: [] },
    sin:  { label: 'sin x', tex: 'sin x', f: Math.sin, d: Math.cos, xr: [-4, 4], yr: [-1.6, 1.6], dr: [-1.6, 1.6], bad: [] },
    abs:  { label: '|x|  (corner)', tex: '|x|', f: Math.abs, d: x => x === 0 ? NaN : x < 0 ? -1 : 1, xr: [-3, 3], yr: [-.6, 3.4], dr: [-1.6, 1.6], bad: [0], kind: 'corner' },
    cbrt: { label: 'cube root of x', tex: '∛x', f: Math.cbrt, d: x => x === 0 ? NaN : 1 / (3 * Math.pow(Math.cbrt(x), 2)), xr: [-3, 3], yr: [-1.7, 1.7], dr: [-1, 6], bad: [0], kind: 'vertical' },
    jump: { label: 'a jump at 0', tex: 'g(x)', f: x => .5 * x + (x >= 0 ? 1 : 0), d: x => x === 0 ? NaN : .5, xr: [-3, 3], yr: [-3, 3], dr: [-1, 2], bad: [0], kind: 'jump' }
  };
  const isBad = (F, x) => F.bad.some(b => Math.abs(b - x) < 1e-6);
  const secant = (F, x, h) => (F.f(x + h) - F.f(x)) / h;

  /* what happens to the secant slopes as h shrinks, from the right and from the left */
  const verdict = (F, x) => {
    const R1 = secant(F, x, .01), L1 = secant(F, x, -.01), R2 = secant(F, x, .0001), L2 = secant(F, x, -.0001);
    const grows = (a, b) => Math.abs(b) > 30 && Math.abs(b) > 1.5 * Math.abs(a);
    const gr = grows(R1, R2), gl = grows(L1, L2);
    if (gr && gl && R2 * L2 > 0) return { ok: false, kind: 'vertical', text: `Both sides grow without limit (${fm(R1)} and ${fm(L1)} at h = 0.01). The slope never settles: the tangent would be vertical.` };
    if (gr || gl) return { ok: false, kind: 'jump', text: `One side settles near ${fm(gr ? L2 : R2)}, but the ${gr ? 'right' : 'left'} side keeps growing as h shrinks (${fm(gr ? R1 : L1)} at h = 0.01). There is no single slope.` };
    if (Math.abs(R2 - L2) > .05) return { ok: false, kind: 'corner', text: `The right side settles near ${fm(R2)} and the left side near ${fm(L2)}. They disagree, so there is no single slope.` };
    return { ok: true, kind: 'smooth', text: `Both sides settle near ${fm((R2 + L2) / 2)}. They agree, so the slope here is ${fm((R2 + L2) / 2)}.` };
  };

  /* per-function facts shown after a sketch is checked */
  const WHY = {
    sq: `The parabola is flat at its bottom, x = 0, so f′ = 0 there. To the left it falls (negative slope) and to the right it rises (positive slope), and it gets steeper the farther you go from 0. That is the straight line f′(x) = 2x. The slope keeps growing, so the steepest points in this window are its two ends.`,
    cu: `The curve flattens for an instant at x = 0, so f′(0) = 0. But it never turns around: it rises on both sides, so f′ touches 0 at x = 0 and is positive everywhere else. It is steepest at the ends of the window. That is f′(x) = 3x², a parabola that never goes below the axis.`,
    sin: `The slope is 0 at the peak and trough of the wave (x ≈ ±1.57) and largest, 1, where the wave crosses zero going up (x = 0). Where sin falls it is steepest downhill, slope −1, at x ≈ ±3.14. The slope graph has the same wave shape, shifted: it is cos x.`,
    abs: `Left of 0 the graph falls at a constant rate, slope −1. Right of 0 it rises at slope +1. At the corner x = 0 there is no slope at all, so the true derivative is two flat pieces with a jump and no value at 0. A single connected line is not right here.`,
    cbrt: `The graph always rises, so f′ is positive everywhere it exists. Near 0 the curve is almost vertical, so the slope is huge there, and it flattens as you move away. At x = 0 the slope grows without limit and there is no value.`,
    jump: `The graph is a straight line with slope 0.5 on each side, so f′ = 0.5 everywhere except x = 0. At the jump there is no slope, because the two sides do not even meet.`
  };

  register({
    id: 'derivatives-as-tangent-slopes', level: 'ugrad',
    title: 'Derivatives as tangent slopes',
    blurb: 'Slide two points together until a secant line becomes a tangent, then sketch the slope graph yourself.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 1.6; p.span = 3.6;
      p.grid(1, { axes: false });
      p.path([[-4, 0], [4, 0]], { stroke: pal['grid-strong'], width: 1.4 });
      p.path([[0, -1], [0, 5]], { stroke: pal['grid-strong'], width: 1.4 });
      const pts = []; for (let i = 0; i <= 60; i++) { const x = -2.4 + 4.8 * i / 60; pts.push([x, x * x * .62]); }
      p.curve(pts, { stroke: pal.blue, width: 2.8 });
      p.path([[-.2, -.85], [2.0, 1.86]], { stroke: pal.violet, width: 2.4 });
      p.dot(1, .62, 4.5, pal.yellow, pal.stage, 1.5);
    },
    hook: String.raw`A curve is bending, so it has no single slope. Yet at any one point it points in a definite direction. How do you measure a slope you can only see up close?`,
    steps: [
      { title: 'A secant line',
        text: String.raw`<p>The graph is \(f(x)=x^2\). Point <b>P</b> sits at \(x=1\) and <b>Q</b> sits at \(x+h\) with \(h=1\). The <b>violet</b> line through them is a <em>secant</em>.</p><p>Its slope is rise over run: \((4-1)\div 1=3\). The violet dot in the lower graph plots that slope (3) at \(x=1\).</p>`,
        set: { x: 1, h: 1, fn: 'sq', mode: 'explore', mirror: false, tangent: false, reveal: false } },
      { title: 'Squeeze Q toward P',
        text: String.raw`<p>Now \(h=0.01\), so Q is almost on top of P. The secant slope is \((1.0201-1)\div 0.01=2.01\).</p><p>Look at the table: from the right the slopes go \(3,\ 2.5,\ 2.1,\ 2.01\), and from the left \(1,\ 1.5,\ 1.9,\ 1.99\). Both sides settle on \(2\), the slope of the dashed <b>tangent</b> line. Drag P along the curve to trace out the slope graph.</p>`,
        set: { x: 1, h: .01, fn: 'sq', mode: 'explore', mirror: true, tangent: true, reveal: false } },
      { title: 'Sketch the derivative',
        text: String.raw`<p>Your turn, with \(f(x)=x^3\). P is at \(x=-1\) and the slope there is about \(2.97\), close to \(3\). Drag P, read each slope, and use <b>Pin slope</b> or drag across the lower graph to sketch \(f'\).</p><p>When you are done, press <b>Check my sketch</b>. The lesson overlays the true derivative and explains where yours differs.</p>`,
        set: { x: -1, h: .01, fn: 'cu', mode: 'sketch', mirror: false, tangent: false, reveal: false } },
      { title: 'Where slope fails',
        text: String.raw`<p>The graph is \(|x|\), and P is at its corner, \(x=0\). With \(h=0.5\) the right secant has slope \(1\) and the left secant (the dashed one) has slope \(-1\).</p><p>Shrinking \(h\) does not help: the table stays at \(1\) and \(-1\). When the two sides disagree there is no tangent. Try the cube root and the jump (move P to \(0\) each time), then press <b>Mark this x as bad</b> where you find one.</p>`,
        set: { x: 0, h: .5, fn: 'abs', mode: 'explore', mirror: true, tangent: false, reveal: false } }
    ],
    formal: String.raw`
      <p>A <em>secant</em> line of a function \(f\) through the points at \(x\) and \(x+h\) has slope
      \[ \frac{f(x+h)-f(x)}{h}, \]
      called a <em>difference quotient</em>. It is the average rate of change of \(f\) over the interval of length \(h\). The number \(h\) may be positive or negative, and \(h\neq 0\).</p>
      <h3>Definition of the derivative</h3>
      <p>The <em>derivative</em> of \(f\) at \(x\) is the limit of the difference quotients as \(h\) shrinks to \(0\):
      \[ f'(x)=\lim_{h\to 0}\frac{f(x+h)-f(x)}{h}, \]
      provided this limit exists as a finite number. It is the slope of the tangent line at that point. Leibniz wrote it as \(\dfrac{dy}{dx}\), a limit of \(\Delta y/\Delta x\). The tangent line at \(x=a\) is \(y=f(a)+f'(a)(x-a)\).</p>
      <h3>Worked example: \(f(x)=x^2\)</h3>
      <p>Expand the numerator:
      \[ \frac{(x+h)^2-x^2}{h}=\frac{2xh+h^2}{h}=2x+h \qquad (h\neq 0). \]
      As \(h\to 0\) this tends to \(2x\), so \(f'(x)=2x\). At \(x=1\) the quotient is \(2+h\), which is exactly the table in step 2: \(3,\ 2.5,\ 2.1,\ 2.01\) for \(h=1,\ 0.5,\ 0.1,\ 0.01\), and \(1,\ 1.5,\ 1.9,\ 1.99\) for the negative values. The tangent at \(x=1\) is \(y=1+2(x-1)\).</p>
      <h3>The power rule, as a pattern</h3>
      <p>The same expansion for \(x^3\) gives \((x+h)^3-x^3=3x^2h+3xh^2+h^3\), so the quotient is \(3x^2+3xh+h^2\to 3x^2\). The pattern:
      \[ \frac{d}{dx}\,x^n = n\,x^{n-1}. \]
      Check it: \(n=1\) gives \(1\) (a line of slope 1), \(n=2\) gives \(2x\), \(n=3\) gives \(3x^2\). Test \(n=4\) at \(x=1\): the rule predicts \(4\), and the quotient \((1.01^4-1)/0.01\approx 4.06\) is close. For positive integers \(n\) the binomial theorem proves the rule. It also holds for other exponents when \(x&gt;0\); with \(n=\tfrac13\) it gives \(\tfrac13x^{-2/3}\), which blows up at \(0\), matching the vertical tangent you saw. The derivatives of \(\sin x\) and \(\cos x\) are \(\cos x\) and \(-\sin x\); this lesson only checks them numerically.</p>
      <h3>What differentiable means</h3>
      <p>\(f\) is <em>differentiable at \(a\)</em> if \(f'(a)\) exists as a finite number. That requires the right-hand limit (\(h\to 0^+\)) and the left-hand limit (\(h\to 0^-\)) of the difference quotient to both exist and be equal. The three failures you saw:</p>
      <p>\(|x|\) at \(0\): the quotient is \(1\) for \(h&gt;0\) and \(-1\) for \(h&lt;0\), so the one-sided limits differ (a corner).<br>
      \(\sqrt[3]{x}\) at \(0\): the quotient is \(h^{-2/3}\), which grows without bound from both sides (a vertical tangent, no finite slope).<br>
      A jump: the quotient grows without bound on the side where the function jumps (the function is not even continuous).</p>
      <h3>Differentiable implies continuous, not the reverse</h3>
      <p>If \(f'(a)\) exists, write
      \[ f(a+h)-f(a)=\frac{f(a+h)-f(a)}{h}\cdot h \;\longrightarrow\; f'(a)\cdot 0=0 \quad (h\to 0), \]
      so \(f(a+h)\to f(a)\): \(f\) is continuous at \(a\). Therefore a jump (a discontinuity) can never have a derivative. The converse is false: \(|x|\) is continuous at \(0\) but not differentiable there. Differentiable means "a non-vertical tangent line exists"; continuous only means "no break".</p>
      <h3>What the numbers do and do not show</h3>
      <p>A table of quotients suggests a limit but does not prove one. The algebra above (cancel \(h\), then let \(h\to 0\)) is what proves it.</p>`,
    check: [
      { q: String.raw`Let \(f(x)=x^2\). A secant line is drawn through the graph points at \(x=3\) and \(x=3.1\). What is its slope?`,
        choices: ['6', '6.1', '0.61', '9.61'], answer: 1,
        why: String.raw`\(f(3)=9\) and \(f(3.1)=9.61\), so the rise is \(0.61\) and the run is \(0.1\). The slope is \(0.61\div 0.1=6.1\). The tangent slope at \(x=3\) is exactly \(6\), and this secant is a little steeper because \(h=0.1\) is not yet zero.`,
        hint: String.raw`Slope is rise divided by run. Do not forget to divide by \(h\).` },
      { q: String.raw`For \(f(x)=|x|\), the secant slope between \(x=0\) and \(x=h\) equals \(1\) for every \(h&gt;0\), and equals \(-1\) for every \(h&lt;0\). Which statement is correct?`,
        choices: [String.raw`\(f'(0)=0\), the average of \(1\) and \(-1\)`, String.raw`\(f'(0)=1\), because we usually move to the right`,
                  String.raw`\(f'(0)\) does not exist, even though \(f\) is continuous at \(0\)`, String.raw`\(f'(0)\) does not exist, because \(f\) is not continuous at \(0\)`], answer: 2,
        why: String.raw`The derivative needs one limit, and the two sides give different limits, \(1\) and \(-1\). So \(f'(0)\) does not exist. But \(|x|\) has no break at \(0\) (it is continuous), which shows that continuous does not imply differentiable.`,
        hint: String.raw`A limit must be a single number. Does \(|x|\) have a jump or a gap at \(0\)?` }
    ],
    links: { prereq: ['limits-and-epsilon-delta', 'slope-and-linear-functions'], next: ['the-fundamental-theorem-of-calculus'], related: ['quadratics-and-the-parabola', 'exponential-growth', 'riemann-sums-and-the-integral'] },

    mount({ stage, controls: C }) {
      const st = { x: 1, h: 1 };
      let fnKey = 'sq', mode = 'explore', mirror = false, tangent = false, reveal = false;
      let cancel = () => {}, trail = {}, sk = [], checked = false, fb = '';
      const cur = () => FN[fnKey];
      const cols = () => Math.round((cur().xr[1] - cur().xr[0]) * 10) + 1;
      const colX = i => rnd(cur().xr[0] + i / 10);
      const colOf = x => clamp(Math.round((x - cur().xr[0]) * 10), 0, cols() - 1);

      stage.classList.add('split');
      const top = h('div', { class: 'pane', style: 'flex: 11 1 0' }), bot = h('div', { class: 'pane', style: 'flex: 9 1 0' });
      stage.append(top, bot);
      const P1 = new Plane(top, { span: 5 }), P2 = new Plane(bot, { span: 5 });
      let fr1 = null, fr2 = null;

      /* math coordinates are pixels here (y up from the bottom), so each pane has its own x and y scale */
      const frame = (p, xr, yr) => {
        const L = 46, R = 14, T = 16, B = 28, w = Math.max(10, p.w - L - R), hh = Math.max(10, p.h - T - B);
        p.span = Math.min(p.w, p.h) / 2; p.cx = p.w / 2; p.cy = p.h / 2;
        return { L, R, T, B, w, hh, xr, yr,
          sx: x => L + (x - xr[0]) / (xr[1] - xr[0]) * w, sy: y => B + (y - yr[0]) / (yr[1] - yr[0]) * hh,
          ix: px => xr[0] + (px - L) / w * (xr[1] - xr[0]), iy: py => yr[0] + (py - B) / hh * (yr[1] - yr[0]) };
      };
      const poly = (c, p, pts, col, width, dash) => {
        c.beginPath(); let pen = false;
        for (const q of pts) { if (!q) { pen = false; continue; } if (pen) c.lineTo(q[0], p.h - q[1]); else c.moveTo(q[0], p.h - q[1]); pen = true; }
        c.strokeStyle = col; c.lineWidth = width; c.lineJoin = 'round'; c.lineCap = 'round'; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]);
      };
      const clipTo = (c, p, fr) => { c.save(); c.beginPath(); c.rect(fr.L, p.h - fr.B - fr.hh, fr.w, fr.hh); c.clip(); };
      const drawAxes = (c, p, fr, fs, yname) => {
        const pal = p.pal, { xr, yr } = fr;
        const xs = nice(xr[1] - xr[0], Math.max(3, fr.w / 70)), ys = nice(yr[1] - yr[0], Math.max(3, fr.hh / 45));
        clipTo(c, p, fr);
        for (let x = Math.ceil(xr[0] / xs) * xs; x <= xr[1] + 1e-9; x += xs) poly(c, p, [[fr.sx(x), fr.B], [fr.sx(x), fr.B + fr.hh]], pal.grid, 1.2);
        for (let y = Math.ceil(yr[0] / ys) * ys; y <= yr[1] + 1e-9; y += ys) poly(c, p, [[fr.L, fr.sy(y)], [fr.L + fr.w, fr.sy(y)]], pal.grid, 1.2);
        if (yr[0] < 0 && yr[1] > 0) poly(c, p, [[fr.L, fr.sy(0)], [fr.L + fr.w, fr.sy(0)]], pal['grid-strong'], 2);
        if (xr[0] < 0 && xr[1] > 0) poly(c, p, [[fr.sx(0), fr.B], [fr.sx(0), fr.B + fr.hh]], pal['grid-strong'], 2);
        c.restore();
        const t = v => (v < 0 ? '−' : '') + (+Math.abs(v).toFixed(2));
        for (let x = Math.ceil(xr[0] / xs) * xs; x <= xr[1] + 1e-9; x += xs) p.label(t(x), fr.sx(x), fr.B - 14, { size: fs, italic: false, color: pal.muted, halo: false });
        for (let y = Math.ceil(yr[0] / ys) * ys; y <= yr[1] + 1e-9; y += ys) p.label(t(y), fr.L - 8, fr.sy(y), { size: fs, italic: false, color: pal.muted, align: 'right', halo: false });
        if (yname) p.label(yname, fr.L + 8, fr.B + fr.hh - 8, { size: fs + 4, color: pal.text, align: 'left' });
      };
      const curvePts = (F, fn, fr, ymin, ymax) => {
        const pts = [], N = 400, [x0, x1] = F.xr;
        for (let i = 0; i <= N; i++) {
          const x = x0 + (x1 - x0) * i / N, y = fn(x);
          if (!isFinite(y) || y < ymin - 40 * (ymax - ymin) || y > ymax + 40 * (ymax - ymin)) { pts.push(null); continue; }
          if (F.bad.length && i > 0 && F.bad.some(b => x - (x1 - x0) / N < b && b <= x)) pts.push(null);
          pts.push([fr.sx(x), fr.sy(y)]);
        }
        return pts;
      };
      const cursorX = fr => fr.sx(st.x);

      /* ---------- top pane: f, P, Q, secants ---------- */
      P1.onDraw = (c, p) => {
        const pal = p.pal, F = cur(), fr = fr1 = frame(p, F.xr, F.yr), fs = clamp(p.w / 28, 12, 15);
        drawAxes(c, p, fr, fs, '');
        const { x, h: hh } = st, fx = F.f(x), px = fr.sx(x), py = fr.sy(fx);
        clipTo(c, p, fr);
        const line = (m, col, w, dash) => {
          const a = F.xr[0], b = F.xr[1];
          poly(c, p, [[fr.sx(a), fr.sy(fx + m * (a - x))], [fr.sx(b), fr.sy(fx + m * (b - x))]], col, w, dash);
        };
        poly(c, p, curvePts(F, F.f, fr, F.yr[0], F.yr[1]), pal.blue, 3.5);
        if (fnKey === 'jump') { p.dot(fr.sx(0), fr.sy(0), 5, pal.stage, pal.blue, 2.5); p.dot(fr.sx(0), fr.sy(1), 5, pal.blue, pal.blue, 2); }
        const okh = Math.abs(hh) > 1e-9;
        if (tangent) { const d = F.d(x); if (isFinite(d)) line(d, pal.text, 2, [3, 5]); }
        if (okh && mirror) line(secant(F, x, -hh), alpha(pal.violet, .85), 2.4, [8, 6]);
        if (okh) line(secant(F, x, hh), pal.violet, 3.2);
        /* rise and run legs */
        if (okh) {
          const qx = fr.sx(x + hh), qy = fr.sy(F.f(x + hh));
          if (Math.abs(qx - px) > 24 && Math.abs(qy - py) > 10) {
            poly(c, p, [[px, py], [qx, py]], pal.green, 3); poly(c, p, [[qx, py], [qx, qy]], pal.red, 3);
          }
        }
        poly(c, p, [[px, fr.B], [px, fr.B + fr.hh]], pal['grid-strong'], 1.4, [4, 6]);
        c.restore();
        if (okh) {
          const qx = fr.sx(x + hh), qy = fr.sy(F.f(x + hh)), inside = qx >= fr.L && qx <= fr.L + fr.w;
          if (mirror) { const mx = fr.sx(x - hh), my = fr.sy(F.f(x - hh)); if (mx >= fr.L && mx <= fr.L + fr.w && Math.hypot(mx - px, my - py) > 8) p.dot(mx, my, 6, pal.stage, pal.violet, 2.5); }
          if (inside && Math.hypot(qx - px, qy - py) > 8) p.dot(qx, qy, 7, pal.violet, pal.stage, 2);
          if (inside && Math.hypot(qx - px, qy - py) > 34) p.label('Q', qx, qy, { size: fs + 5, color: pal.violet, dy: qy >= py ? -17 : 17, dx: qx >= px ? 8 : -8 });
        }
        p.dot(px, py, 9, pal.yellow, pal.brass, 3.5);
        p.label('P', px, py, { size: fs + 5, color: pal.text, dx: -14, dy: 17 });
        p.label(fnKey === 'jump' ? 'f has a jump at 0' : 'f(x) = ' + F.tex, F.xr[0] < 0 ? fr.sx(0) + 10 : fr.L + 8, fr.B + fr.hh - 12, { size: fs + 4, color: pal.blue, align: 'left', italic: false });
      };

      /* ---------- bottom pane: the slope graph ---------- */
      P2.onDraw = (c, p) => {
        const pal = p.pal, F = cur(), fr = fr2 = frame(p, F.xr, F.dr), fs = clamp(p.w / 28, 12, 15);
        drawAxes(c, p, fr, fs, mode === 'sketch' ? 'your f′' : 'slope of f');
        const { x } = st, hh = st.h, okh = Math.abs(hh) > 1e-9;
        const showTrue = mode === 'explore' ? reveal : checked;
        clipTo(c, p, fr);
        if (showTrue) {
          poly(c, p, curvePts(F, F.d, fr, F.dr[0], F.dr[1]), pal.blue, 3.5);
          if (fnKey === 'abs') for (const v of [-1, 1]) { c.restore(); p.dot(fr.sx(0), fr.sy(v), 5, pal.stage, pal.blue, 2.5); clipTo(c, p, fr); }
          if (fnKey === 'jump') { c.restore(); p.dot(fr.sx(0), fr.sy(.5), 5, pal.stage, pal.blue, 2.5); clipTo(c, p, fr); }
        }
        if (mode === 'explore') {
          const ks = Object.keys(trail).map(Number).sort((a, b) => a - b), tp = []; let prev = null;
          for (const k of ks) { if (prev !== null && k - prev > 1) tp.push(null); tp.push([fr.sx(k / 10), fr.sy(clamp(trail[k], F.dr[0] - 1, F.dr[1] + 1))]); prev = k; }
          poly(c, p, tp, alpha(pal.violet, .5), 2.5);
          for (const q of tp) if (q) p.dot(q[0], p.h - q[1] === q[1] ? q[1] : q[1], 3, alpha(pal.violet, .6));
        } else {
          const sp = []; let prev = -9;
          sk.forEach((v, i) => { if (v == null) return; if (i - prev > 1) sp.push(null); sp.push([fr.sx(colX(i)), fr.sy(v)]); prev = i; });
          poly(c, p, sp, pal.green, 3.2);
          sk.forEach((v, i) => { if (v != null && (i % 3 === 0 || !checked)) p.dot(fr.sx(colX(i)), fr.sy(v), 3, pal.green); });
          if (checked) bad.forEach((i, k) => { if (k % 2 === 0) p.dot(fr.sx(colX(i)), fr.sy(sk[i]), 5, null, pal.red, 2.5); });
        }
        /* live slope at P */
        poly(c, p, [[cursorX(fr), fr.B], [cursorX(fr), fr.B + fr.hh]], pal['grid-strong'], 1.4, [4, 6]);
        if (okh) {
          const m = secant(F, x, hh), my = clamp(m, F.dr[0] - .3, F.dr[1] + .3);
          if (mirror) { const ml = secant(F, x, -hh); p.dot(cursorX(fr), fr.sy(clamp(ml, F.dr[0] - .3, F.dr[1] + .3)), 6, pal.stage, pal.violet, 2.5); }
          c.restore();
          p.dot(cursorX(fr), fr.sy(my), 7.5, pal.violet, pal.stage, 2);
          const above = fr.sy(my) < fr.B + fr.hh - 30;
          p.label('slope ' + fm(m), cursorX(fr), fr.sy(my), { size: fs + 2, italic: false, color: pal.violet, dy: above ? -18 : 18, dx: cursorX(fr) > fr.L + fr.w - 70 ? -36 : 0 });
        } else c.restore();
        if (mode === 'sketch' && !checked && sk.every(v => v == null))
          p.label('drag here to sketch f′, or pin measured slopes', fr.L + fr.w / 2, fr.B + fr.hh / 2, { size: fs + 3, italic: false, color: pal.muted });
      };

      /* ---------- readouts ---------- */
      const upd = () => {
        const F = cur(), { x } = st, hh = st.h, fx = F.f(x);
        if (Math.abs(hh) < 1e-9) {
          ro.innerHTML = `<span class="k">P</span> (${n4(x)}, ${n4(fx)})<br><span class="k">h = 0</span>: Q lands on P. Rise 0 over run 0 has no value, so there is no secant. Slide h a little.`;
        } else {
          const y1 = F.f(x + hh), m = (y1 - fx) / hh;
          ro.innerHTML = `<span class="k">P</span> (${n4(x)}, ${n4(fx)}) &nbsp; <span class="k">Q</span> (${n4(x + hh)}, ${n4(y1)})<br>
            <span class="k">rise</span> f(x+h) − f(x) = ${n4(y1 - fx)}<br><span class="k">run</span> h = ${num(hh)}<br>
            <span class="k">slope</span> rise ÷ run = <b>${fm(m)}</b>` +
            (mirror ? `<br><span class="k">other side</span> Q′ at x − h, slope ${fm(secant(F, x, -hh))}` : '');
        }
        const v = verdict(F, x);
        tb.innerHTML = `<table style="width:100%;border-collapse:collapse"><tr><td><span class="k">h</span></td><td style="text-align:right"><span class="k">from the right</span></td><td style="text-align:right"><span class="k">from the left</span></td></tr>` +
          HS.map(k => `<tr><td>${k}</td><td style="text-align:right">${fm(secant(F, x, k))}</td><td style="text-align:right">${fm(secant(F, x, -k))}</td></tr>`).join('') +
          `</table><span class="k">Verdict at x = ${num(x)}</span> ${v.text}`;
        fbEl.innerHTML = fb; fbEl.style.display = fb ? '' : 'none';
      };

      const record = () => { const m = secant(cur(), st.x, st.h); if (Math.abs(st.h) > 1e-9 && isFinite(m)) trail[Math.round(st.x * 10)] = m; };
      const sync = () => { xS.set(st.x); hS.set(st.h); P1.draw(); P2.draw(); upd(); };
      const userMoved = () => { cancel(); record(); sync(); };
      const clearFb = () => { fb = ''; };

      /* ---------- controls ---------- */
      C.title('Function');
      const sel = C.select({ label: 'Graph of f', value: fnKey, options: Object.keys(FN).map(k => ({ value: k, label: FN[k].label })), onChange: v => { cancel(); setFn(v); sync(); } });
      C.title('Secant');
      const xS = C.slider({ label: 'Point P at x', min: -4, max: 4, step: .1, value: st.x, format: v => num(v), onInput: v => { st.x = clamp(rnd(v), cur().xr[0], cur().xr[1]); userMoved(); } });
      const hS = C.slider({ label: 'Step h (Q is at x + h)', min: -2, max: 2, step: .01, value: st.h, format: v => (+v).toFixed(2).replace('-', '−'), onInput: v => { st.h = rnd(v); userMoved(); } });
      const ro = C.readout();
      const tb = C.readout();
      const tgT = C.toggle({ label: 'Show the tangent line', value: tangent, onChange: v => { tangent = v; P1.draw(); } });
      const miT = C.toggle({ label: 'Show the other side (x − h)', value: mirror, onChange: v => { mirror = v; sync(); } });
      const reT = C.toggle({ label: 'Show the true slope graph', value: reveal, onChange: v => { reveal = v; P2.draw(); } });
      C.title('Challenges');
      const [bEx, bSk] = C.buttons([
        { label: 'Explore', primary: true, onClick: () => { cancel(); setMode('explore'); sync(); } },
        { label: 'Sketch f′', onClick: () => { cancel(); if (!['sq', 'cu', 'sin', 'abs', 'cbrt', 'jump'].includes(fnKey)) setFn('sq'); setMode('sketch'); sync(); } }
      ]);
      const exRow = C.buttons([
        { label: 'Mark this x as bad', onClick: () => detect(true) },
        { label: 'No bad point', onClick: () => detect(false) }
      ]);
      const skRow = C.buttons([
        { label: 'Pin slope', onClick: () => pin() },
        { label: 'Check my sketch', primary: true, onClick: () => grade() },
        { label: 'Clear', onClick: () => { sk = new Array(cols()).fill(null); checked = false; bad = []; fb = ''; sync(); } }
      ]);
      const fbEl = C.readout(); fbEl.style.display = 'none';
      C.hint('Drag P or Q on the upper graph (or anywhere along it), or use the sliders.');
      const rowOf = els => els[0].parentNode;
      const toggleRow = t => t.parentNode;

      let bad = [];
      const resetSketch = () => { sk = new Array(cols()).fill(null); checked = false; bad = []; };
      function setFn(k) {
        fnKey = k; sel.value = k; trail = {}; resetSketch(); clearFb();
        st.x = clamp(st.x, cur().xr[0], cur().xr[1]);
      }
      function setMode(m) {
        mode = m; checked = false; bad = []; clearFb();
        bEx.className = m === 'explore' ? 'btn primary' : 'btn'; bSk.className = m === 'sketch' ? 'btn primary' : 'btn';
        rowOf(exRow).style.display = m === 'explore' ? '' : 'none'; rowOf(skRow).style.display = m === 'sketch' ? '' : 'none';
        toggleRow(reT).style.display = m === 'explore' ? '' : 'none';
        if (m === 'sketch') resetSketch();
      }
      resetSketch(); setMode('explore');

      /* ---------- challenge: find the bad point ---------- */
      function detect(says) {
        const F = cur(), x = st.x, v = verdict(F, x);
        if (says) {
          if (isBad(F, x)) {
            fb = `<span class="k">Yes.</span> At x = ${num(x)} the slope fails. ${v.text} ` + ({
              corner: 'Why: the graph turns a corner. A tangent line would have to tilt both ways at once.',
              vertical: 'Why: the curve rises almost straight up here, so the secants get steeper and steeper. A vertical line has no slope.',
              jump: 'Why: the graph breaks. Going left from P the secant has to cross the gap, and a gap divided by a tiny h is huge. A function with a jump is not continuous, so it cannot have a derivative.'
            }[F.kind] || '');
          } else if (v.ok) {
            fb = `<span class="k">Not here.</span> At x = ${num(x)} ${v.text} Slide P to look for a place where the two sides stop agreeing as h shrinks.`;
          } else {
            fb = `<span class="k">Close, but not the exact spot.</span> The slopes already look odd at x = ${num(x)}, but the graph has no break here. Move P by 0.1 steps and watch where the verdict changes.`;
          }
        } else {
          fb = F.bad.length
            ? `<span class="k">Not quite.</span> This graph has a point where the left and right secants disagree or blow up. Slide P along it and read the verdict until it says no single slope.`
            : `<span class="k">Right.</span> ${F.label} is smooth: at every x the left and right secant slopes settle on the same number. The graph has a tangent everywhere.`;
        }
        upd();
      }

      /* ---------- challenge: sketch the derivative ---------- */
      function pin() {
        const m = secant(cur(), st.x, st.h);
        if (Math.abs(st.h) < 1e-9 || !isFinite(m)) { fb = 'Choose a small h that is not 0 first.'; upd(); return; }
        const F = cur(); checked = false; bad = [];
        sk[colOf(st.x)] = clamp(m, F.dr[0], F.dr[1]);
        fb = `Pinned slope ${fm(m)} at x = ${num(st.x)}. Move P and pin more, or drag across the lower graph.`; sync();
      }
      function grade() {
        const F = cur(), n = cols(), tol = .07 * (F.dr[1] - F.dr[0]);
        const drawn = []; sk.forEach((v, i) => { if (v != null && !isBad(F, colX(i))) drawn.push(i); });
        const need = Math.round((n - F.bad.length) * .6);
        if (drawn.length < need) {
          fb = `<span class="k">Not enough yet.</span> You have sketched ${drawn.length} of ${n - F.bad.length} x-values. Every x needs a slope, so cover most of the graph. Drag across the lower graph, or pin slopes at more places.`;
          upd(); return;
        }
        const tr = i => clamp(F.d(colX(i)), F.dr[0], F.dr[1]);
        const errs = drawn.map(i => ({ i, e: Math.abs(sk[i] - tr(i)) })), okN = errs.filter(o => o.e <= tol).length;
        bad = errs.filter(o => o.e > tol).map(o => o.i);
        checked = true;
        const runs = []; let run = null;
        const cat = o => { const sv = sk[o.i], dv = tr(o.i); return sv * dv < 0 && Math.abs(dv) > tol / 2 ? (dv > 0 ? 'pos' : 'neg') : Math.abs(sv) > Math.abs(dv) ? 'flat' : 'steep'; };
        for (const o of errs) {
          if (o.e <= tol) continue;
          const k = cat(o);
          if (run && o.i - run.last <= 3 && run.k === k) { run.last = o.i; run.list.push(o); } else { run = { first: o.i, last: o.i, list: [o], k }; runs.push(run); }
        }
        const frac = okN / drawn.length;
        let msg = frac >= .85 ? `<span class="k">Close match.</span> Within tolerance of the true derivative (blue): ${okN} of ${drawn.length} points.`
          : frac >= .5 ? `<span class="k">Partly right.</span> Close to the true derivative (blue): ${okN} of ${drawn.length} points. The red rings mark the rest.`
          : `<span class="k">Not yet.</span> Close to the true derivative (blue): ${okN} of ${drawn.length} points. The red rings mark the misses.`;
        runs.sort((a, b) => b.list.length - a.list.length);
        const notes = runs.slice(0, 3).map(r => {
          const w = r.list.reduce((a, b) => (b.e > a.e ? b : a)), xm = colX(w.i), s = sk[w.i], d = tr(w.i), xa = colX(r.first), xb = colX(r.last);
          const where = r.first === r.last ? `at x = ${num(xa)}` : `from x = ${num(xa)} to x = ${num(xb)}`;
          if (s * d < 0 && Math.abs(d) > tol / 2) return `${where} you drew ${s > 0 ? 'above' : 'below'} the axis, but f is ${d > 0 ? 'rising' : 'falling'} there, so its slope is ${d > 0 ? 'positive' : 'negative'} (at x = ${num(xm)} it is ${fm(d)}).`;
          return `${where} you drew about ${fm(s)}, but at x = ${num(xm)} the tangent slope is ${fm(d)}, so the curve is ${Math.abs(s) > Math.abs(d) ? 'flatter' : 'steeper'} than you drew.`;
        });
        if (notes.length) msg += ' Differences: ' + notes.join(' Also, ');
        else msg += ' Your sketch matches everywhere you drew.';
        fb = msg + ' <br><span class="k">Why the true graph looks like this.</span> ' + WHY[fnKey];
        sync();
      }

      /* ---------- dragging ---------- */
      draggable(P1, {
        hit: (px, py) => {
          if (!fr1) return null;
          const F = cur(), x = st.x, fx = F.f(x), dP = Math.hypot(fr1.sx(x) - px, p1y(fr1.sy(fx)) - py), dQ = Math.hypot(fr1.sx(x + st.h) - px, p1y(fr1.sy(F.f(x + st.h))) - py);
          return dQ < 16 && dQ < dP - 2 && Math.abs(st.h) > 1e-9 ? 'Q' : 'P';
        },
        move: (hd, mx) => {
          const F = cur(), xm = fr1.ix(mx);
          if (hd === 'P') st.x = clamp(rnd(snap(xm, .1)), F.xr[0], F.xr[1]);
          else { let nh = clamp(rnd(snap(xm - st.x, .01)), -2, 2); if (Math.abs(nh) < .005) nh = st.h < 0 ? -.01 : .01; st.h = nh; }
          userMoved();
        }
      });
      const p1y = my => P1.h - my;
      let lastCol = null, lastVal = 0;
      P2.canvas.addEventListener('pointerdown', () => { lastCol = null; });
      draggable(P2, {
        hit: () => 'b',
        move: (_, mx, my) => {
          const F = cur();
          if (mode === 'explore') { st.x = clamp(rnd(snap(fr2.ix(mx), .1)), F.xr[0], F.xr[1]); userMoved(); return; }
          cancel(); checked = false; bad = [];
          const col = colOf(fr2.ix(mx)), val = clamp(fr2.iy(my), F.dr[0], F.dr[1]);
          if (lastCol === null) sk[col] = val;
          else { const a = Math.min(lastCol, col), b = Math.max(lastCol, col); for (let i = a; i <= b; i++) sk[i] = b === a ? val : lerp(lastVal, val, (i - lastCol) / (col - lastCol)); }
          lastCol = col; lastVal = val;
          fb = ''; P2.requestDraw(); upd();
        }
      });

      /* ---------- steps ---------- */
      const apply = (patch, immediate) => {
        cancel();
        const { fn, mode: md, mirror: mi, tangent: tg, reveal: rv, ...rest } = patch;
        if (fn !== undefined && fn !== fnKey) setFn(fn);
        if (md !== undefined) setMode(md);
        if (mi !== undefined) { mirror = mi; miT.checked = mi; }
        if (tg !== undefined) { tangent = tg; tgT.checked = tg; }
        if (rv !== undefined) { reveal = rv; reT.checked = rv; }
        clearFb();
        if (immediate || !Object.keys(rest).length) { Object.assign(st, rest); record(); sync(); }
        else cancel = animateTo(st, rest, 900, sync, () => { record(); sync(); });
      };
      upd();
      return { destroy: () => { cancel(); P1.destroy(); P2.destroy(); }, apply };
    }
  });
}
