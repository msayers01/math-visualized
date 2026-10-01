/* =====================================================================
   SCHOOL — Parallel and perpendicular lines
   ===================================================================== */
{
  /* Every slope here is a ratio of whole numbers (rise over run), so slopes are kept and shown as fractions. */
  const zero = v => Math.abs(v) < 1e-6;
  const whole = v => Math.abs(v - Math.round(v)) < 1e-6;
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
  /* n/d as text: "2/3", "−3/2", "4", "0" (a decimal only while a step is still animating) */
  const frac = (n, d) => {
    if (!whole(n) || !whole(d)) return num(n / d);
    n = Math.round(n); d = Math.round(d);
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d); n /= g; d /= g;
    return (n < 0 ? '−' : '') + Math.abs(n) + (d === 1 ? '' : '/' + d);
  };
  /* slope text for a line with this run and rise */
  const sl = (run, rise) => zero(run) ? 'undefined' : frac(rise, run);
  const wrap = s => /[/−]/.test(s) ? '(' + s + ')' : s;
  /* the number in front of x: "", "−", "2", "(2/3)", "−(3/2)" */
  const coef = s => s === '1' ? '' : s === '−1' ? '−' : s.includes('/') ? (s[0] === '−' ? '−(' + s.slice(1) + ')' : '(' + s + ')') : s;
  /* point-slope form of the line through (x, y) with this run and rise */
  const pointSlope = (run, rise, x, y) => {
    if (zero(run)) return 'x = ' + num(x);
    if (zero(rise)) return 'y = ' + num(y);
    const c = coef(sl(run, rise)), lhs = zero(y) ? 'y' : y > 0 ? 'y − ' + num(y) : 'y + ' + num(-y);
    const f = zero(x) ? 'x' : x > 0 ? 'x − ' + num(x) : 'x + ' + num(-x);
    return lhs + ' = ' + (zero(x) ? c + 'x' : c === '' ? f : c === '−' ? '−(' + f + ')' : c + '(' + f + ')');
  };
  /* slope-intercept form of the same line */
  const slopeInt = (run, rise, x, y) => {
    if (zero(run)) return 'x = ' + num(x);
    if (zero(rise)) return 'y = ' + num(y);
    const b = frac(y * run - rise * x, run);
    return 'y = ' + coef(sl(run, rise)) + 'x' + (b === '0' ? '' : b[0] === '−' ? ' − ' + b.slice(1) : ' + ' + b);
  };

  /* Ready-made lines and points: a = a point on the blue line, d = its (run, rise), p = the point P. */
  const PUZ = [
    { a: [-3, -1], d: [3, 2],  p: [3, -1] },
    { a: [-4, 3],  d: [2, -1], p: [-1, -2] },
    { a: [-2, -3], d: [1, 1],  p: [2, 4] },
    { a: [-2, 0],  d: [2, 3],  p: [4, -2] },
    { a: [0, 5],   d: [1, -3], p: [-3, -1] },
    { a: [-4, 2],  d: [3, 0],  p: [3, -1] },
    { a: [-2, -3], d: [0, 3],  p: [2, 1] }
  ];

  register({
    id: 'parallel-and-perpendicular-lines', level: 'school',
    title: 'Parallel and perpendicular lines',
    blurb: 'Build the parallel and the perpendicular through a point, and see why slopes match or multiply to −1.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0.5; p.cy = 0.8; p.span = 5.2;
      p.grid(1);
      const ext = (m, b) => [[-8, -8 * m + b], [8, 8 * m + b]];
      p.path(ext(2 / 3, 1), { stroke: pal.blue, width: 2.6 });
      p.path(ext(2 / 3, -3), { stroke: pal.green, width: 2.6 });
      p.path(ext(-3 / 2, 3.5), { stroke: pal.red, width: 2.6 });
      const fx = 15 / 13, fy = 2 / 3 * fx + 1, s = .62, u1 = [.5547, -.832], u2 = [.832, .5547];
      p.path([[fx, fy], [fx + s * u1[0], fy + s * u1[1]], [fx + s * (u1[0] + u2[0]), fy + s * (u1[1] + u2[1])], [fx + s * u2[0], fy + s * u2[1]]],
        { fill: alpha(pal.violet, .3), stroke: pal.violet, width: 1.8, close: true });
      p.dot(3, -1, 5.5, pal.yellow, pal.stage, 1.5);
    },
    hook: String.raw`You stand beside a straight road. Which straight line through you never meets the road, and which one crosses it in a perfect square corner?`,
    steps: [
      { title: 'Parallel: same slope',
        text: String.raw`<p>The <b>blue</b> line rises \(2\) for every \(3\) it runs, so its slope is \(\tfrac{2}{3}\). The <b>green</b> triangle is a copy of the blue one, moved so that its corner sits on <b>P</b>.</p><p>Your line goes through P too. Drag its ring to the top corner of the green triangle, at \((6,1)\). When the slopes are equal the line turns green: it is <b>parallel</b>, so it never meets the blue line.</p>`,
        set: { ax: -3, ay: -1, dx: 3, dy: 2, px: 3, py: -1, qx: -2, qy: -1, rot: 0, scaf: true, par: false, perp: false, chk: false, goal: 'par', eqp: false } },
      { title: 'Perpendicular: turn the triangle',
        text: String.raw`<p>Now turn the green triangle a quarter turn about P. The <b>red</b> triangle is the result. The old run \(3\) has become a rise of \(3\). The old rise \(2\) has become a run of \(-2\), because the corner is now to the left of P.</p><p>The new slope is \(\tfrac{3}{-2}=-\tfrac{3}{2}\), and \(\tfrac{2}{3}\cdot\left(-\tfrac{3}{2}\right)=-1\). Drag your ring to the red corner, at \((1,2)\). Your line turns red when it is <b>perpendicular</b>.</p>`,
        set: { ax: -3, ay: -1, dx: 3, dy: 2, px: 3, py: -1, qx: 3, qy: 2, rot: 1, scaf: true, par: false, perp: false, chk: false, goal: 'perp', eqp: false } },
      { title: 'Write the equation through P',
        text: String.raw`<p>A line through \((x_1,y_1)\) with slope \(m\) has the equation \(y-y_1=m(x-x_1)\). This is <b>point-slope form</b>.</p><p>Your line starts as the parallel. It passes through \(P=(3,-1)\) with slope \(\tfrac{2}{3}\), so \(y+1=\tfrac{2}{3}(x-3)\). Multiply out to get \(y=\tfrac{2}{3}x-3\). The yellow dot checks it: the line crosses the y-axis at \(-3\).</p><p>Now the perpendicular. Its slope is \(-\tfrac{3}{2}\), from step 2. In the panel, pick the equation that matches. Each choice draws its line, so you can check it on the graph.</p>`,
        set: { ax: -3, ay: -1, dx: 3, dy: 2, px: 3, py: -1, qx: 3, qy: 2, rot: 1, scaf: false, par: false, perp: false, chk: true, goal: null, eqp: true } },
      { title: 'Horizontal and vertical lines',
        text: String.raw`<p>Now the blue line is horizontal: \(y=2\), with slope \(0\). A parallel line is horizontal too: \(y=-1\). The perpendicular is vertical: \(x=3\), with a square corner marked where it meets the blue line.</p><p>A vertical line has no slope, so "slopes multiply to \(-1\)" cannot be used here. Press <b>Vertical</b> to turn the blue line upright. Then the parallel through P is vertical and the perpendicular is horizontal.</p>`,
        set: { ax: -4, ay: 2, dx: 3, dy: 0, px: 3, py: -1, qx: 2, qy: 0, rot: 1, scaf: false, par: true, perp: true, chk: false, goal: null, eqp: false } }
    ],
    formal: String.raw`
      <p>Two different lines in a plane either cross at exactly one point or never meet. Lines that never meet are <em>parallel</em>. Lines that cross at a right angle (\(90^\circ\)) are <em>perpendicular</em>. Both ideas are about slope, so write a non-vertical line as \(y=mx+b\).</p>
      <h3>Parallel lines have equal slopes</h3>
      <p>The lines \(y=m_1x+b_1\) and \(y=m_2x+b_2\) are parallel exactly when \(m_1=m_2\) and \(b_1\neq b_2\). Then the vertical gap between them is \(b_1-b_2\) at every \(x\). It never changes, so it is never \(0\). If the slopes differ, the gap \((m_1-m_2)x+(b_1-b_2)\) changes steadily and is \(0\) at one value of \(x\), where the lines cross.</p>
      <h3>Perpendicular lines have negative reciprocal slopes</h3>
      <p>Two lines that are neither horizontal nor vertical are perpendicular exactly when
      \[ m_1m_2=-1, \qquad\text{that is,}\qquad m_2=-\frac{1}{m_1}. \]
      To get the new slope, flip the fraction (swap rise and run) and change the sign. The slope \(\tfrac{2}{3}\) becomes \(-\tfrac{3}{2}\).</p>
      <p><b>Why.</b> Draw a slope triangle on a line, with run \(a\) and rise \(b\), so the slope is \(m=\tfrac{b}{a}\). Turn the whole picture, triangle and line, a quarter turn counterclockwise about a point on the line. The step "\(a\) right, \(b\) up" becomes "\(b\) left, \(a\) up": a run of \(-b\) and a rise of \(a\). A turn keeps lengths and angles, so the turned line makes a \(90^\circ\) angle with the original. Its slope is
      \[ \frac{a}{-b}=-\frac{a}{b}=-\frac{1}{m}, \qquad\text{and}\qquad \frac{b}{a}\cdot\left(-\frac{a}{b}\right)=-1. \]
      Any line with slope \(-\tfrac{a}{b}\) is parallel to the turned line, so it is perpendicular to the original as well.</p>
      <h3>The line through a given point</h3>
      <p>To build the line through \(P=(x_1,y_1)\) with slope \(m\), use <em>point-slope form</em>:
      \[ y-y_1=m\,(x-x_1). \]
      It says that from \(P\) the change in \(y\) is \(m\) times the change in \(x\). Multiply out and move \(y_1\) to the right side to get slope-intercept form \(y=mx+b\), where \(b=y_1-mx_1\).</p>
      <p>The recipe: read the slope \(m\) of the given line. Use \(m\) for the parallel or \(-\tfrac{1}{m}\) for the perpendicular. Put \(P\) into point-slope form.</p>
      <h3>Worked example</h3>
      <p>Find the lines through \(P=(-1,-2)\) that are parallel and perpendicular to \(y=-\tfrac{1}{2}x+1\).</p>
      <p><b>Parallel.</b> The slope stays \(-\tfrac{1}{2}\). Then \(y+2=-\tfrac{1}{2}(x+1)\), so \(y=-\tfrac{1}{2}x-\tfrac{1}{2}-2=-\tfrac{1}{2}x-\tfrac{5}{2}\).</p>
      <p><b>Perpendicular.</b> Flip \(-\tfrac{1}{2}\) to get \(-2\), then change the sign to get \(2\). Check: \(-\tfrac{1}{2}\cdot 2=-1\). Then \(y+2=2(x+1)\), so \(y=2x+2-2=2x\).</p>
      <h3>Horizontal and vertical lines</h3>
      <p>A horizontal line \(y=c\) has slope \(0\). A vertical line \(x=c\) has no slope, because its run is \(0\) and you cannot divide by \(0\). The rule \(m_1m_2=-1\) does not cover these two cases, so use the picture.<br>
      Given a horizontal line: the parallel through \(P\) is \(y=y_1\), and the perpendicular is the vertical line \(x=x_1\).<br>
      Given a vertical line: the parallel through \(P\) is \(x=x_1\), and the perpendicular is the horizontal line \(y=y_1\).</p>
      <h3>Checking an answer on a graph</h3>
      <p>1. Does the line go through \(P\)? Put the coordinates of \(P\) into your equation.<br>
      2. From \(P\), count the slope. For a parallel, use the same run and rise as the given line. For a perpendicular, the run and rise swap and one sign changes.<br>
      3. Read where your line crosses the y-axis and compare it with \(b\) in your equation.<br>
      4. Look at the corner where the perpendicular meets the given line. It should be a square corner. On a graphing tool, give both axes the same scale, or right angles will not look right.</p>`,
    check: [
      { q: String.raw`A line has slope \(-\frac{2}{5}\). What is the slope of a line perpendicular to it?`,
        choices: [String.raw`\(-\frac{2}{5}\)`, String.raw`\(\frac{2}{5}\)`, String.raw`\(-\frac{5}{2}\)`, String.raw`\(\frac{5}{2}\)`], answer: 3,
        why: String.raw`Flip the fraction to get \(\frac{5}{2}\), then change the sign. Check: \(-\frac{2}{5}\cdot\frac{5}{2}=-1\).`,
        hint: String.raw`Perpendicular slopes multiply to \(-1\). Which choice times \(-\frac{2}{5}\) gives \(-1\)?` },
      { q: String.raw`Which line goes through \((4,1)\) and is parallel to \(y=2x-3\)?`,
        choices: [String.raw`\(y=2x-3\)`, String.raw`\(y=2x-7\)`, String.raw`\(y=-\frac{1}{2}x+3\)`, String.raw`\(y=2x+9\)`], answer: 1,
        why: String.raw`A parallel line keeps the slope \(2\). Point-slope form gives \(y-1=2(x-4)\), so \(y=2x-8+1=2x-7\).`,
        hint: String.raw`Keep the slope \(2\), then put \((4,1)\) into \(y-y_1=m(x-x_1)\). Check that your line really passes through \((4,1)\).` }
    ],
    links: { related: ['slope-and-linear-functions', 'systems-of-equations', 'pythagorean-theorem', 'similarity-and-scaling'] },

    mount({ stage, controls: C }) {
      /* L: the blue line, through A with direction (dx, dy). P: the point. Q = P + (qx, qy): the ring on your line. rot: quarter turn of the copied triangle, 0 to 1. */
      const st = { ax: -3, ay: -1, dx: 3, dy: 2, px: 3, py: -1, qx: -2, qy: -1, rot: 0 };
      const fl = { scaf: true, par: false, perp: false, chk: false, goal: 'par', eqp: false };
      let cancel = () => {}, target = null, msg = '', warn = '', pi = 0, eqPick = -1, eqKey = '', eqOpts = [];
      /* A running animation always ends on its target, so the state stays on whole grid points when the student acts mid-way. */
      const finish = () => { cancel(); if (target) { Object.assign(st, target); target = null; } };
      const run = (patch, ms) => { finish(); target = patch; cancel = animateTo(st, patch, ms, sync, () => { target = null; }); };
      const P = new Plane(stage, { cx: 0, cy: 0, span: 8.6 });
      /* the view always shows x from -6.7 to 6.7 and y from -8.5 to 8.5 at least, with equal scales on both axes */
      const fitView = p => { const sc = Math.min(p.w / 13.4, p.h / 17); p.span = Math.min(p.w, p.h) / (2 * sc); p.cx = 0; p.cy = 0; };
      /* how far the ring on your line may go: the grid points that are on screen */
      const room = () => ({ x: Math.max(4, Math.floor(P.w / (2 * P.scale) - .4)), y: Math.max(4, Math.floor(P.h / (2 * P.scale) - .4)) });

      const kind = () => {
        const cr = st.dx * st.qy - st.dy * st.qx, dt = st.dx * st.qx + st.dy * st.qy;
        return zero(cr) ? 'par' : zero(dt) ? 'perp' : 'none';
      };
      const unit = (x, y) => { const n = Math.hypot(x, y) || 1; return [x / n, y / n]; };
      const foot = () => {
        const { ax, ay, dx, dy, px, py } = st, t = ((px - ax) * dx + (py - ay) * dy) / ((dx * dx + dy * dy) || 1);
        return [ax + t * dx, ay + t * dy];
      };
      /* the part of a line that is on screen */
      const ext = (x, y, ux, uy, bd) => {
        if (Math.hypot(ux, uy) < 1e-9) return null;
        let t0 = -1e9, t1 = 1e9;
        const lim = (p, u, lo, hi) => {
          if (Math.abs(u) < 1e-9) return;
          let a = (lo - p) / u, b = (hi - p) / u; if (a > b) [a, b] = [b, a];
          t0 = Math.max(t0, a); t1 = Math.min(t1, b);
        };
        lim(x, ux, bd.x0, bd.x1); lim(y, uy, bd.y0, bd.y1);
        return t1 > t0 ? [[x + t0 * ux, y + t0 * uy], [x + t1 * ux, y + t1 * uy]] : null;
      };

      /* ---------- drawing helpers ---------- */
      const tri = (p, c0, c1, c2, col, t1, t2, fs, o = {}) => {
        const a = o.a ?? 1, la = o.la ?? 1, pts = [c0, c1, c2];
        p.path(pts, { fill: alpha(col, .13 * a), close: true });
        p.path(pts, { stroke: alpha(col, .95 * a), width: 2.6, dash: [7, 6] });
        const area = Math.abs((c1[0] - c0[0]) * (c2[1] - c1[1]) - (c1[1] - c0[1]) * (c2[0] - c1[0])) / 2;
        const g = [(c0[0] + c1[0] + c2[0]) / 3, (c0[1] + c1[1] + c2[1]) / 3];
        [[c0, c1, t1], [c1, c2, t2]].forEach(([u, v, t]) => {
          if (!t || Math.hypot(v[0] - u[0], v[1] - u[1]) < 1e-6) return;
          const mx = (u[0] + v[0]) / 2, my = (u[1] + v[1]) / 2;
          let n;
          if (area < 1e-6) {   /* flat triangle: put the label beside the leg */
            n = unit(-(p.Y(v[1]) - p.Y(u[1])), p.X(v[0]) - p.X(u[0]));
            if (n[1] > 1e-9 || (Math.abs(n[1]) < 1e-9 && n[0] < 0)) n = [-n[0], -n[1]];
          } else n = unit(p.X(mx) - p.X(g[0]), p.Y(my) - p.Y(g[1]));
          p.label(t, mx, my, { size: fs, italic: false, alpha: la * Math.min(1, a + .3), dx: n[0] * 20, dy: n[1] * 16 });
          if (o.taken && la > .5) o.taken.push([p.X(mx) + n[0] * 20, p.Y(my) + n[1] * 16, t.length * 3.8]);
        });
      };
      const square = (p, x, y, u1, u2, col) => {
        const s = Math.max(.5, 19 / p.scale);
        p.path([[x, y], [x + s * u1[0], y + s * u1[1]], [x + s * (u1[0] + u2[0]), y + s * (u1[1] + u2[1])], [x + s * u2[0], y + s * u2[1]]],
          { fill: alpha(col, .24), stroke: col, width: 2, close: true });
      };
      let taken = [];   /* pixel positions of labels drawn so far in this frame: [x, y, half width] */
      /* slope tag beside a line, near its right-hand end (above it, unless that sits on the tick numbers or on a ring) */
      const tag = (p, e, ux, uy, text, col, fs, avoid) => {
        if (!e) return;
        let [[x0, y0], [x1, y1]] = e;
        if (x0 > x1 + 1e-9 || (Math.abs(x0 - x1) < 1e-9 && y0 > y1)) [[x0, y0], [x1, y1]] = [[x1, y1], [x0, y0]];
        if (ux < -1e-9 || (Math.abs(ux) < 1e-9 && uy < 0)) { ux = -ux; uy = -uy; }
        const L = Math.hypot(ux, uy) || 1, nx = -uy / L, ny = ux / L, vert = Math.abs(nx) > .7;
        const at = (t, side) => [clamp(p.X(x0 + (x1 - x0) * t) + side * nx * 13, 46, p.w - 46), clamp(p.Y(y0 + (y1 - y0) * t) - side * ny * 19, 16, p.h - 16), side];
        const free = ([sx, sy]) => Math.abs(sy - (p.Y(0) + 15)) >= 13 && avoid.every(([rx, ry]) => Math.abs(sx - rx) > 56 || Math.abs(sy - ry) > 20);
        let pos = null;
        for (const t of [.87, .76, .65, .54, .43]) { for (const side of [1, -1]) { const c = at(t, side); if (free(c)) { pos = c; break; } } if (pos) break; }
        if (!pos) pos = at(.87, 1);
        const [mx, my] = p.toMath(pos[0], pos[1]);
        p.label(text, mx, my, { size: fs, italic: false, color: col, align: vert ? (pos[2] * nx < 0 ? 'right' : 'left') : 'center' });
        taken.push([pos[0] + (vert ? (pos[2] * nx < 0 ? -1 : 1) * text.length * 3.8 : 0), pos[1], text.length * 3.8]);
      };
      const dirAng = (ux, uy) => Math.atan2(-uy, ux);
      const mTag = (run, rise) => zero(run) ? 'm undefined' : 'm = ' + frac(rise, run);

      /* a small caption drawn on the canvas, so feedback is next to the drag */
      const banner = (p, rows, x, y, edge, anchor = 'tl') => {
        const c = p.ctx, bf = clamp(p.w / 30, 12.5, 15.5), lh = bf * 1.5, fnt = r => `${r.b ? 600 : 500} ${bf}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`;
        let w = 0; rows.forEach(r => { c.font = fnt(r); w = Math.max(w, c.measureText(r.t).width); });
        w = Math.min(w + 22, p.w - 2 * x); const hh = rows.length * lh + 12, bx = anchor === 'bc' ? (p.w - w) / 2 : x, by = anchor === 'bc' ? p.h - y - hh : y;
        c.save();
        c.beginPath(); if (c.roundRect) c.roundRect(bx, by, w, hh, 8); else c.rect(bx, by, w, hh);
        c.fillStyle = alpha(p.pal.stage, .93); c.fill(); c.strokeStyle = edge; c.lineWidth = 1.6; c.stroke();
        c.textAlign = 'left'; c.textBaseline = 'middle';
        rows.forEach((r, i) => { c.font = fnt(r); c.fillStyle = r.c || p.pal.text; c.fillText(r.t, bx + 11, by + 6 + lh * (i + .5), w - 16); });
        c.restore();
      };
      const shortWhy = k => {
        const { dx, dy, qx, qy } = st, a = sl(dx, dy), b = sl(qx, qy), aV = zero(dx), bV = zero(qx);
        if (k === 'par') return aV ? 'both lines are vertical' : `both slopes are ${a}`;
        if (k === 'perp') return aV || bV ? 'horizontal meets vertical' : `${wrap(a)} × ${wrap(b)} = −1`;
        return aV || bV ? 'one vertical, one slanted' : `slopes ${a} and ${b}: not equal, product ${frac(dy * qy, dx * qx)}`;
      };

      P.onDraw = (c, p) => {
        fitView(p); taken = [];
        const pal = p.pal, bd = p.bounds(), fs = clamp(p.scale * .5, 16.5, 20), k = kind();
        const { ax, ay, dx, dy, px, py, qx, qy, rot } = st;
        p.grid(1); p.ticks(1);

        /* slope triangles: on the blue line, copied to P, and the copy turned a quarter turn */
        if (fl.scaf) {
          tri(p, [ax, ay], [ax + dx, ay], [ax + dx, ay + dy], pal.blue, 'run ' + num(dx), 'rise ' + num(dy), fs, { taken });
          tri(p, [px, py], [px + dx, py], [px + dx, py + dy], pal.green, 'run ' + num(dx), 'rise ' + num(dy), fs, { a: rot > .001 ? .45 : 1, la: rot > .001 ? 0 : 1, taken });
          if (rot > .001) {
            const th = rot * Math.PI / 2, cs = Math.cos(th), sn = Math.sin(th), R = (u, v) => [px + u * cs - v * sn, py + u * sn + v * cs];
            tri(p, [px, py], R(dx, 0), R(dx, dy), pal.red, 'rise ' + num(dx), 'run ' + num(-dy), fs, { la: clamp((rot - .85) / .15, 0, 1), taken });
            if (rot < .98) {
              const a0 = Math.atan2(dy, dx);
              c.beginPath(); c.arc(p.X(px), p.Y(py), 1.1 * p.scale, -a0, -(a0 + th), true);
              c.strokeStyle = pal.violet; c.lineWidth = 2.5; c.stroke();
            } else square(p, px, py, unit(dx, dy), unit(-dy, dx), pal.violet);
          }
        }

        /* the lines */
        const line = (x, y, ux, uy, col, w, dash) => { const e = ext(x, y, ux, uy, bd); if (e) p.path(e, { stroke: col, width: w, dash }); return e; };
        const eL = line(ax, ay, dx, dy, pal.blue, 3.6);
        const eP = fl.par ? line(px, py, dx, dy, pal.green, 3.2) : null;
        const eN = fl.perp ? line(px, py, -dy, dx, pal.red, 3.2) : null;
        const col = k === 'par' ? pal.green : k === 'perp' ? pal.red : pal.text;
        const eQ = line(px, py, qx, qy, col, 3.4);
        if (fl.eqp && eqPick >= 0 && eqOpts[eqPick]) { const o = eqOpts[eqPick]; line(o.x, o.y, o.run, o.rise, pal.violet, 3.4, [11, 8]); }

        /* square corner where the perpendicular meets the blue line */
        if (fl.perp || k === 'perp') { const f = foot(); square(p, f[0], f[1], unit(px - f[0], py - f[1]), unit(dx, dy), pal.violet); }

        /* where your line crosses the y-axis */
        if (fl.chk && !zero(qx)) {
          const b = py - qy / qx * px;
          if (Math.abs(b) < bd.y1 - .3) {
            p.dot(0, b, 7, pal.yellow, pal.stage, 2.5);
            p.label('b = ' + frac(py * qx - qy * px, qx), 0, b, { size: fs, italic: false, align: 'left', dx: 13, dy: -15 });
            taken.push([p.X(0) + 13 + 22, p.Y(b) - 15, 24]);
          }
        }

        /* slope tags */
        const avoid = [[ax, ay], [ax + dx, ay + dy], [px + qx, py + qy], [px, py]].map(([x, y]) => [p.X(x), p.Y(y)]);
        tag(p, eL, dx, dy, mTag(dx, dy), pal.blue, fs, avoid);
        if (eP && k !== 'par') tag(p, eP, dx, dy, mTag(dx, dy), pal.green, fs, avoid);
        if (eN && k !== 'perp') tag(p, eN, -dy, dx, mTag(-dy, dx), pal.red, fs, avoid);
        tag(p, eQ, qx, qy, mTag(qx, qy), k === 'none' ? pal.text : col, fs, avoid);

        /* handles */
        const ring = (x, y, dot) => { p.dot(x, y, 8.5, pal.stage, pal.brass, 3); if (dot) p.dot(x, y, 3.4, dot); };
        ring(ax, ay, pal.blue); ring(ax + dx, ay + dy, pal.blue);
        if (!fl.scaf) {
          p.label('slide', ax, ay, { size: 14, italic: false, color: pal.muted, dy: -19 });
          p.label('tilt', ax + dx, ay + dy, { size: 14, italic: false, color: pal.muted, dy: -19 });
          taken.push([p.X(ax), p.Y(ay) - 19, 16], [p.X(ax + dx), p.Y(ay + dy) - 19, 12]);
        }
        ring(px + qx, py + qy, col);
        p.dot(px, py, 9.5, pal.yellow, pal.brass, 3);

        /* label for P: in the direction farthest from the lines through P (and from the right-hand edge) */
        const angs = [dirAng(qx, qy)]; if (fl.par) angs.push(dirAng(dx, dy)); if (fl.perp) angs.push(dirAng(-dy, dx));
        let best = [-1, -1], bs = -9;
        for (const cd of [[-1, -1], [1, -1], [0, -1], [1, 1], [-1, 1], [0, 1], [-1, 0], [1, 0]]) {
          const ca = Math.atan2(cd[1], cd[0]);
          let m = Math.PI;
          for (const a of angs) { let d = (((ca - a) % Math.PI) + Math.PI) % Math.PI; d = Math.min(d, Math.PI - d); m = Math.min(m, d); }
          m += cd[1] < 0 ? .45 : cd[1] === 0 ? -.2 : 0;
          const lx = p.X(px) + cd[0] * 22, ly = p.Y(py) + cd[1] * (cd[0] === 0 ? 22 : 17);
          if (Math.abs(ly - (p.Y(0) + 15)) < 13) m -= 1.2;     /* on the x-axis numbers */
          if (lx > p.X(0) - 56 && lx < p.X(0) + 4) m -= 1.2;   /* on the y-axis numbers */
          for (const [tx, ty, hw] of taken) if (Math.abs(lx - tx) < hw + 12 && Math.abs(ly - ty) < 15) m -= 1.5;   /* on another label */
          const sx = p.X(px) + cd[0] * 40;
          if (sx < 20 || sx > p.w - 20) m -= 2;
          if (m > bs) { bs = m; best = cd; }
        }
        p.label('P', px, py, { size: fs + 4, align: best[0] > 0 ? 'left' : best[0] < 0 ? 'right' : 'center', dx: best[0] * 14, dy: best[1] * (best[0] === 0 ? 22 : 17) });

        /* feedback captions */
        const word = k === 'par' ? 'Parallel' : k === 'perp' ? 'Perpendicular' : 'Neither';
        const gn = fl.goal === 'par' ? 'parallel' : 'perpendicular';
        const rows = [{ t: word + (fl.goal ? (k === fl.goal ? '. Goal met!' : ` (goal: ${gn})`) : '.'), b: true, c: k === 'none' ? pal.text : col }, { t: shortWhy(k) }];
        banner(p, rows, 18, 18, k === 'none' ? pal['grid-strong'] : col);
        if (warn) banner(p, [{ t: warn, b: true }], 18, 16, pal.yellow, 'bc');
      };

      /* ---------- text ---------- */
      const why = k => {
        const { dx, dy, qx, qy } = st, a = sl(dx, dy), b = sl(qx, qy), aV = zero(dx), bV = zero(qx);
        if (k === 'par') return aV ? 'Both lines are vertical. Neither has a slope, and they never meet.'
          : `Both slopes are ${a}. Equal slopes mean the lines tilt the same way, so they never meet.`;
        if (k === 'perp') return aV || bV ? 'One line is vertical and the other is horizontal, so they meet at a right angle. A vertical line has no slope, so the product rule does not apply.'
          : `The slopes ${a} and ${b} multiply to −1: each is the negative reciprocal of the other.`;
        if (aV || bV) return `One line is vertical and the other has slope ${aV ? b : a}. A vertical line is parallel only to another vertical line, and perpendicular only to a horizontal line.`;
        let s = `The slopes are ${a} and ${b}. They are not equal, so the lines are not parallel. Their product is ${frac(dy * qy, dx * qx)}, not −1, so they are not perpendicular.`;
        if (!zero(dy) && !zero(qy)) {
          if (zero(qy * dy - qx * dx)) s += ' You swapped rise and run but kept the sign. A perpendicular slope changes sign too.';
          else if (zero(qy * dx + qx * dy)) s += ` ${b} is only the opposite of ${a}. That mirrors the line. A perpendicular also swaps rise and run.`;
        }
        return s;
      };
      const answerText = g => {
        const { dx, dy, px, py } = st;
        if (g === 'par') return zero(dx) ? `The blue line is vertical, so the parallel through P is vertical: ${pointSlope(0, 1, px, py)}.`
          : zero(dy) ? `The blue line is horizontal, so the parallel through P is horizontal: ${pointSlope(1, 0, px, py)}.`
          : `The parallel: from P go the same run and rise as the blue line (run ${num(dx)}, rise ${num(dy)}). The slope stays ${sl(dx, dy)}.`;
        return zero(dx) ? `The blue line is vertical, so the perpendicular through P is horizontal: ${pointSlope(1, 0, px, py)}.`
          : zero(dy) ? `The blue line is horizontal, so the perpendicular through P is vertical: ${pointSlope(0, 1, px, py)}.`
          : `The perpendicular: swap rise and run and change one sign (run ${num(-dy)}, rise ${num(dx)}). The slope becomes ${sl(-dy, dx)}.`;
      };
      const lineInfo = (name, run, rise, rel) => {
        const { px, py } = st;
        let s = `<span class="k">${name}</span> `;
        if (zero(run)) return s + `vertical, slope undefined<br>${pointSlope(run, rise, px, py)}`;
        if (zero(rise)) return s + `horizontal, slope 0<br>${pointSlope(run, rise, px, py)}`;
        return s + `slope ${sl(run, rise)}${rel ? ' (' + rel + ')' : ''}<br>${pointSlope(run, rise, px, py)}<br>${slopeInt(run, rise, px, py)}`;
      };
      const upd = () => {
        const { ax, ay, dx, dy, qx, qy } = st, k = kind(), rows = [];
        if (msg) rows.push(`<b>${msg}</b>`);
        if (fl.goal) {
          const gn = fl.goal === 'par' ? 'parallel' : 'perpendicular';
          rows.push(`<span class="k">Goal</span> a line through P that is ${gn} to the blue line.` +
            (k === fl.goal ? ' <b style="color:var(--green)">Goal met.</b>' : k !== 'none' ? ` That one is ${k === 'par' ? 'parallel' : 'perpendicular'}, not ${gn}.` : ''));
        }
        rows.push(k === 'par' ? `<b style="color:var(--green)">Parallel.</b> ${why(k)}` : k === 'perp' ? `<b style="color:var(--red)">Perpendicular.</b> ${why(k)}` : `<b>Neither.</b> ${why(k)}`);
        rows.push(`<span class="k">Point P</span> (${num(st.px)}, ${num(st.py)})`);
        rows.push(`<span class="k">Blue line</span> ${zero(dx) ? 'vertical, slope undefined' : 'slope ' + sl(dx, dy)}${zero(dx) ? '' : ', ' + slopeInt(dx, dy, ax, ay)}`);
        const sg = qx < 0 ? -1 : 1;
        rows.push(lineInfo('Your line', qx, qy, `rise ${num(qy * sg)}, run ${num(qx * sg)}`));
        roA.innerHTML = rows.join('<br>');
        const B = [];
        if (fl.par) B.push(lineInfo('Parallel through P', dx, dy, 'same slope as the blue line'));
        if (fl.perp) {
          const neg = !zero(dx) && !zero(dy) ? `negative reciprocal: ${wrap(sl(dx, dy))} × ${wrap(sl(-dy, dx))} = −1` : '';
          B.push(lineInfo('Perpendicular through P', -dy, dx, neg));
        }
        roB.innerHTML = B.join('<br><br>'); roB.style.display = B.length ? '' : 'none';
        renderEq();
      };
      const sync = () => { upd(); P.draw(); };

      /* ---------- pick-the-equation practice ---------- */
      const eqGoal = () => fl.goal === 'par' ? 'par' : 'perp';
      const buildOpts = g => {
        const [ax, ay, dx, dy, px, py] = [st.ax, st.ay, st.dx, st.dy, st.px, st.py].map(Math.round), par = [dx, dy], perp = [-dy, dx], tdir = g === 'par' ? par : perp, generic = !zero(dx) && !zero(dy);
        const mk = (kind, d, x, y) => ({ kind, run: d[0], rise: d[1], x, y, text: pointSlope(d[0], d[1], x, y) });
        const same = (a, b) => zero(a.run * b.rise - a.rise * b.run) && zero((b.x - a.x) * a.rise - (b.y - a.y) * a.run);
        const ok = mk('ok', tdir, px, py);
        const pool = {
          perp: () => mk('perp', perp, px, py), par: () => mk('par', par, px, py),
          signx: () => mk('wrongpt', tdir, -px, py), signy: () => mk('wrongpt', tdir, px, -py), swap: () => mk('wrongpt', tdir, py, px), blue: () => mk('wrongpt', par, ax, ay),
          recip: () => generic ? mk('recip', [dy, dx], px, py) : null, neg: () => generic ? mk('neg', [dx, -dy], px, py) : null
        };
        const order = g === 'par' ? ['perp', 'signx', 'signy', 'recip', 'neg', 'blue', 'swap'] : ['recip', 'neg', 'signx', 'par', 'signy', 'swap', 'blue'];
        const out = [];
        for (const k of order) { const c = pool[k](); if (c && !same(c, ok) && !out.some(o => same(o, c))) out.push(c); if (out.length === 3) break; }
        out.splice(Math.min(((px * 7 + py * 3 + dx * 5 + dy * 2) % 4 + 4) % 4, out.length), 0, ok);
        return out;
      };
      const eqWhy = (o, g) => {
        const dx = Math.round(st.dx), dy = Math.round(st.dy), a = sl(dx, dy), s = sl(o.run, o.rise), axis = zero(dx) || zero(dy);
        if (o.kind === 'ok') return g === 'par'
          ? (axis ? `The blue line is ${zero(dx) ? 'vertical' : 'horizontal'}, so the parallel is too, and this line passes through P.` : `The slope is the same as the blue line, ${a}, and the line passes through P.`)
          : (axis ? `The perpendicular to a ${zero(dx) ? 'vertical' : 'horizontal'} line is ${zero(dx) ? 'horizontal' : 'vertical'}, and this line passes through P.` : `The slope ${s} is the negative reciprocal of ${a}, and the line passes through P.`);
        if (o.kind === 'perp') return 'That line is perpendicular to the blue line, not parallel. A parallel keeps the same slope.';
        if (o.kind === 'par') return 'That line is parallel to the blue line, not perpendicular. A perpendicular needs the negative reciprocal slope.';
        if (o.kind === 'recip') return `The slope ${s} is the reciprocal of ${a}, but the sign did not change. The dashed line is not perpendicular.`;
        if (o.kind === 'neg') return `The slope ${s} is only the opposite of ${a}. That mirrors the line. A perpendicular also swaps rise and run.`;
        return "The direction is right, but the dashed line misses P. Use P's own coordinates in point-slope form and subtract each one.";
      };
      const resetEq = () => { eqKey = ''; eqPick = -1; };
      const renderEq = () => {
        const on = fl.eqp, still = [st.ax, st.ay, st.dx, st.dy, st.px, st.py].every(whole);
        eqTitle.style.display = eqBox.style.display = on ? '' : 'none';
        eqBox.style.visibility = still ? '' : 'hidden';
        if (!on || !still) return;
        const g = eqGoal(), key = [st.ax, st.ay, st.dx, st.dy, st.px, st.py, g].map(Math.round).join() + g;
        if (key === eqKey) return;
        eqKey = key; eqPick = -1; eqOpts = buildOpts(g);
        const fb = h('div', { 'aria-live': 'polite' }), btns = eqOpts.map((o, i) => h('button', {
          type: 'button', class: 'btn small', style: 'justify-content:flex-start;text-align:left;white-space:normal',
          onclick: () => {
            eqPick = i; const right = o.kind === 'ok';
            btns.forEach((b, j) => { b.style.borderColor = j === i ? (right ? 'var(--green)' : 'var(--red)') : ''; b.style.borderWidth = j === i ? '2px' : ''; });
            fb.innerHTML = `<b style="color:var(--${right ? 'green' : 'red'})">${right ? 'Right.' : 'Not this one.'}</b> ${eqWhy(o, g)}`;
            P.draw();
          }
        }, o.text));
        eqBox.replaceChildren(h('span', { class: 'k' }, `Which equation is the ${g === 'par' ? 'parallel' : 'perpendicular'} through P?`),
          h('div', { style: 'display:flex;flex-direction:column;gap:8px;margin:10px 0' }, btns), fb);
      };

      /* ---------- controls ---------- */
      C.title('Your line through P');
      const roA = C.readout();
      C.title('Pick the equation');
      const eqTitle = roA.nextElementSibling, eqBox = C.readout();
      C.title('Challenge');
      const [bPar, bPerp] = C.buttons([
        { label: 'Make it parallel', onClick: () => startGoal('par') },
        { label: 'Make it perpendicular', onClick: () => startGoal('perp') }
      ]);
      C.buttons([
        { label: 'Show me', onClick: () => showMe() },
        { label: 'New line and point', onClick: () => newPuzzle() }
      ]);
      C.title('Blue line');
      C.buttons([
        { label: 'Horizontal', onClick: () => makeDir(3, 0) },
        { label: 'Vertical', onClick: () => makeDir(0, 3) }
      ]);
      C.title('Show');
      const tg = {};
      const tog = (key, label) => { tg[key] = C.toggle({ label, value: fl[key], onChange: v => { fl[key] = v; sync(); } }); };
      tog('par', 'The parallel through P');
      tog('perp', 'The perpendicular through P');
      tog('scaf', 'Slope triangles');
      tog('chk', 'Where your line crosses the y-axis');
      tog('eqp', 'Pick the equation (practice)');
      const roB = C.readout();
      C.hint('Drag P, the ring on your line, or the two rings on the blue line (one slides it, one tilts it).');

      const setFlag = (k, v) => {
        fl[k] = v;
        if (tg[k]) tg[k].checked = v;
        if (k === 'goal') { bPar.classList.toggle('primary', v === 'par'); bPerp.classList.toggle('primary', v === 'perp'); }
      };

      /* a start direction for your line that is neither parallel nor perpendicular to the blue line */
      const startDir = (dx, dy) => {
        const ok = (x, y, strict) => !zero(dx * y - dy * x) && !zero(dx * x + dy * y) && !(strict && !zero(dx) && !zero(dy) && (zero(y * dy - x * dx) || zero(y * dx + x * dy)));
        const list = [[-2, -1], [-1, 2], [2, -1], [0, -2], [-2, 0], [1, 1], [2, 1], [-1, -2], [-2, 1]];
        for (const strict of [true, false]) for (const [x, y] of list) if (ok(x, y, strict)) return [x, y];
        return [-2, -1];
      };
      const startGoal = g => {
        finish(); msg = ''; warn = ''; resetEq(); setFlag('goal', g); setFlag('par', false); setFlag('perp', false);
        const [x, y] = startDir(st.dx, st.dy);
        run({ qx: x, qy: y }, 500);
      };
      const showMe = () => {
        finish(); const g = fl.goal;
        if (g !== 'perp') setFlag('par', true);
        if (g !== 'par') setFlag('perp', true);
        msg = g ? answerText(g) : answerText('par') + '<br>' + answerText('perp');
        sync();
      };
      /* keep both ends of the blue line on the grid and keep P off it */
      const legal = t => {
        const o = { ...t };
        o.ax = clamp(o.ax, -6 - Math.min(0, o.dx), 6 - Math.max(0, o.dx));
        o.ay = clamp(o.ay, -6 - Math.min(0, o.dy), 6 - Math.max(0, o.dy));
        const bad = (x, y) => zero((st.px - x) * o.dy - (st.py - y) * o.dx);
        if (bad(o.ax, o.ay))
          for (const [u, v] of [[0, 1], [0, -1], [1, 0], [-1, 0], [0, 2], [0, -2], [2, 0], [-2, 0]]) {
            const x = o.ax + u, y = o.ay + v;
            if (Math.abs(x) <= 6 && Math.abs(y) <= 6 && Math.abs(x + o.dx) <= 6 && Math.abs(y + o.dy) <= 6 && !bad(x, y)) { o.ax = x; o.ay = y; break; }
          }
        return o;
      };
      const makeDir = (dx, dy) => {
        finish(); msg = ''; warn = ''; resetEq();
        run(legal({ ax: st.ax, ay: st.ay, dx, dy }), 700);
      };
      const newPuzzle = () => {
        finish(); msg = ''; warn = ''; resetEq(); pi = (pi + 1) % PUZ.length;
        const z = PUZ[pi], [x, y] = startDir(z.d[0], z.d[1]);
        setFlag('par', false); setFlag('perp', false);
        run({ ax: z.a[0], ay: z.a[1], dx: z.d[0], dy: z.d[1], px: z.p[0], py: z.p[1], qx: x, qy: y }, 800);
      };

      /* ---------- dragging ---------- */
      const offL = (x, y, a, b, ux, uy) => !zero((x - a) * uy - (y - b) * ux);
      const fitQ = () => {
        const rm = room(), ok = (x, y) => Math.abs(st.px + x) <= rm.x && Math.abs(st.py + y) <= rm.y;
        if (ok(st.qx, st.qy)) return;
        const g = gcd(st.qx, st.qy), rx = st.qx / g, ry = st.qy / g;
        for (const [x, y] of [[rx, ry], [-rx, -ry]]) if (ok(x, y)) { st.qx = x; st.qy = y; return; }
        st.qx = clamp(st.qx, -rm.x - st.px, rm.x - st.px); st.qy = clamp(st.qy, -rm.y - st.py, rm.y - st.py);
      };
      draggable(P, {
        hit: (mx, my) => {
          let best = null, bd = clamp(P.scale * .55, 14, 20);   /* under half a grid step, so a grab never jumps a point */
          for (const [key, x, y] of [['q', st.px + st.qx, st.py + st.qy], ['p', st.px, st.py], ['b', st.ax + st.dx, st.ay + st.dy], ['a', st.ax, st.ay]]) {
            const d = Math.hypot(P.X(x) - mx, P.Y(y) - my);
            if (d < bd) { bd = d; best = key; }
          }
          return best;
        },
        move: (hd, x, y) => {
          finish();
          const sx = snap(x, 1), sy = snap(y, 1);
          if (hd === 'q') {
            const rm = room(), qx = clamp(sx, -rm.x, rm.x) - st.px, qy = clamp(sy, -rm.y, rm.y) - st.py;
            if (!qx && !qy) return;
            st.qx = qx; st.qy = qy; msg = ''; warn = '';
          } else if (hd === 'p') {
            const nx = clamp(sx, -4, 4), ny = clamp(sy, -4, 4);
            if (!offL(nx, ny, st.ax, st.ay, st.dx, st.dy)) { msg = 'P has to stay off the blue line. On the line, the parallel through P would be the blue line itself.'; warn = 'P must stay off the blue line'; sync(); return; }
            st.px = nx; st.py = ny; msg = ''; warn = ''; fitQ();
          } else if (hd === 'a') {
            const nx = clamp(sx, -6 - Math.min(0, st.dx), 6 - Math.max(0, st.dx)), ny = clamp(sy, -6 - Math.min(0, st.dy), 6 - Math.max(0, st.dy));
            if (!offL(st.px, st.py, nx, ny, st.dx, st.dy)) { msg = 'The blue line cannot pass through P. Keep P off it.'; warn = 'The blue line cannot pass through P'; sync(); return; }
            st.ax = nx; st.ay = ny; msg = ''; warn = '';
          } else {
            const ddx = clamp(sx - st.ax, Math.max(-4, -6 - st.ax), Math.min(4, 6 - st.ax)), ddy = clamp(sy - st.ay, Math.max(-4, -6 - st.ay), Math.min(4, 6 - st.ay));
            if (!ddx && !ddy) return;
            if (!offL(st.px, st.py, st.ax, st.ay, ddx, ddy)) { msg = 'The blue line cannot pass through P. Keep P off it.'; warn = 'The blue line cannot pass through P'; sync(); return; }
            st.dx = ddx; st.dy = ddy; msg = ''; warn = '';
          }
          sync();
        }
      });

      const apply = (patch, immediate) => {
        finish(); msg = ''; warn = ''; resetEq();
        const { scaf, par, perp, chk, goal, eqp, ...rest } = patch;
        for (const [k, v] of Object.entries({ scaf, par, perp, chk, goal, eqp })) if (v !== undefined) setFlag(k, v);
        pi = 0;
        if (immediate) { Object.assign(st, rest); sync(); } else run(rest, 900);
      };
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
