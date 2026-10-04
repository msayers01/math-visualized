/* =====================================================================
   SCHOOL — Circle equations and the distance formula
   ===================================================================== */
{
  /* ---------- number and text helpers ---------- */
  const n = v => (v < 0 ? '−' : '') + Math.abs(v);
  const par = v => v < 0 ? `(${n(v)})` : n(v);
  const isSq = v => { const r = Math.round(Math.sqrt(v)); return r * r === v; };
  const dtxt = d2 => isSq(d2) ? String(Math.round(Math.sqrt(d2))) : `√${d2} ≈ ${Math.sqrt(d2).toFixed(2)}`;
  /* (x − 3)², (y + 2)², x² */
  const term = (v, nm) => v === 0 ? `${nm}²` : v > 0 ? `(${nm} − ${v})²` : `(${nm} + ${-v})²`;
  const eqCR = (h, k, r2) => `${term(h, 'x')} + ${term(k, 'y')} = ${r2}`;
  const lin = (b, nm) => b === 0 ? '' : ` ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}${nm}`;
  const gen = (b, c, d) => `x² + y²${lin(b, 'x')}${lin(c, 'y')}${d === 0 ? '' : ` ${d < 0 ? '−' : '+'} ${Math.abs(d)}`} = 0`;
  const sumStr = a => a.map((t, i) => i === 0 ? n(t) : ` ${t < 0 ? '−' : '+'} ${Math.abs(t)}`).join('');
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const rel = (d2, r2) => d2 < r2 ? { w: 'inside', long: 'less than', say: 'T is inside the circle' }
    : d2 === r2 ? { w: 'on the circle', long: 'equal to', say: 'T is on the circle' } : { w: 'outside', long: 'greater than', say: 'T is outside the circle' };

  /* ---------- the plane ---------- */
  const FIELD = 8.4;
  const font = (size, weight = 600) => `${weight} ${size}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`;
  const T = (c, p, str, x, y, { size = 13, color, align = 'center', weight = 600, halo = true } = {}) => {
    c.save(); c.font = font(size, weight); c.textAlign = align; c.textBaseline = 'middle';
    if (halo) { c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(str, x, y); }
    c.fillStyle = color || p.pal.text; c.fillText(str, x, y); c.restore();
  };
  const baseGrid = (c, p) => {
    p.cx = 0; p.cy = 0; p.span = FIELD;
    const pal = p.pal, step = p.scale >= 18 ? 1 : 2;
    p.grid(1);
    for (let v = -9; v <= 9; v += step) {
      if (!v) continue;
      const px = p.X(v), py = p.Y(v);
      if (px > 10 && px < p.w - 10) T(c, p, n(v), px, p.Y(0) + 12, { size: 12, color: pal.muted, weight: 500 });
      if (py > 10 && py < p.h - 10) T(c, p, n(v), p.X(0) - 7, py, { size: 12, color: pal.muted, weight: 500, align: 'right' });
    }
  };
  const ring = (p, h, k, r, o = {}) => {
    const pts = []; for (let i = 0; i <= 120; i++) pts.push([h + r * Math.cos(i * TAU / 120), k + r * Math.sin(i * TAU / 120)]);
    p.path(pts, { close: true, ...o });
  };
  /* label manager: each label tries its candidate spots in order and takes the freest one */
  const labeler = (c, p) => {
    const boxes = [];
    const wd = (s, size) => { c.save(); c.font = font(size); const w = c.measureText(s).width; c.restore(); return w; };
    const rectOf = (s, x, y, size, al) => { const w = wd(s, size); return [(al === 'left' ? x : al === 'right' ? x - w : x - w / 2) - 2, y - size * .62, w + 4, size * 1.24]; };
    const ov = (a, b) => Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]));
    boxes.push([p.X(0) - 30, 0, 30, p.h], [0, p.Y(0), p.w, 17]);   /* the axis number strips */
    return {
      wd,
      reserve(x, y, w, h) { boxes.push([x, y, w, h]); },
      block(x, y, r = 12) { boxes.push([x - r, y - r, 2 * r, 2 * r]); },
      put(s, cands, o = {}) {
        const size = o.size || 13;
        const best = cands.map(([x, y, al], i) => {
          const a = al || 'center', r = rectOf(s, x, y, size, a);
          const out = r[0] < 2 || r[0] + r[2] > p.w - 2 || r[1] < 2 || r[1] + r[3] > p.h - 2 ? 5000 : 0;
          return { x, y, a, r, sc: out + boxes.reduce((t, b) => t + ov(r, b), 0) + i * 8 };
        }).sort((a, b) => a.sc - b.sc)[0];
        boxes.push(best.r); T(c, p, s, best.x, best.y, { ...o, size, align: best.a });
      }
    };
  };
  const around = (x, y, d = 14) => [[x + d, y - d, 'left'], [x - d, y - d, 'right'], [x + d, y + d + 3, 'left'], [x - d, y + d + 3, 'right'], [x, y - d - 10], [x, y + d + 13]];
  const header = (c, p, L, lines) => {
    if (!lines.length) return;
    let mw = 0; lines.forEach((s, i) => { mw = Math.max(mw, L.wd(s, 13)); T(c, p, s, 18, 22 + i * 18, { size: 13, align: 'left' }); });
    L.reserve(8, 8, mw + 20, lines.length * 18 + 8);
  };
  const handle = (p, x, y, live) => p.dot(x, y, 9, p.pal.stage, live ? p.pal.brass : p.pal.text, 3.5);
  const rightMark = (p, v, sx, sy, m) => p.path([[v[0] + sx * m, v[1]], [v[0] + sx * m, v[1] + sy * m], [v[0], v[1] + sy * m]], { stroke: p.pal.text, width: 1.8 });

  /* One scene for the explorer, the predictions and the practice pictures of circles.
     g = drawn geometry (may be mid-animation), s = exact whole numbers for the text, o = options */
  const circleScene = (c, p, g, s, o) => {
    const pal = p.pal; baseGrid(c, p);
    const L = labeler(c, p), fs = clamp(p.scale * .62, 12.5, 15), sc = p.scale, wide = p.w >= 520;
    const px = (x, y) => [p.X(x), p.Y(y)];
    header(c, p, L, o.header || []);
    const dx = s.tx - s.h, dy = s.ty - s.k, d2 = dx * dx + dy * dy, isT = o.showT !== false;
    ring(p, g.h, g.k, g.r, { fill: alpha(pal.blue, .08), stroke: pal.blue, width: 3.5 });
    const Cc = [g.h, g.k], Rr = [g.h + g.r, g.k], Tt = [g.tx, g.ty], Cx = [g.tx, g.k];
    const sxs = Math.sign(g.tx - g.h) || 1, sys = Math.sign(g.ty - g.k) || 1;
    p.path([Cc, Rr], { stroke: pal.violet, width: 3.5 });
    if (isT && o.tri && dx !== 0 && dy !== 0) {
      p.path([Cc, Cx, Tt], { fill: alpha(pal.yellow, .2), close: true });
      p.path([Cc, Cx], { stroke: pal.green, width: 4.5 });
      p.path([Cx, Tt], { stroke: pal.red, width: 4.5 });
      rightMark(p, Cx, -sxs, sys, Math.min(.45, Math.abs(dx) / 3, Math.abs(dy) / 3));
    }
    if (isT && o.showD && d2 > 0) p.path([Cc, Tt], { stroke: pal.blue, width: 3.5, dash: [8, 6] });
    const cp = px(...Cc), rp = px(...Rr), tp = px(...Tt);
    handle(p, ...Rr, o.handles); handle(p, ...Cc, o.handles); if (isT) handle(p, ...Tt, o.handles);
    L.block(cp[0], cp[1]); L.block(rp[0], rp[1]); if (isT) L.block(tp[0], tp[1]);
    if (isT) L.put(wide ? `T (${n(s.tx)}, ${n(s.ty)})${o.status ? ' · ' + rel(d2, s.r * s.r).w : ''}` : `T${o.status ? ': ' + rel(d2, s.r * s.r).w : ''}`, around(tp[0], tp[1]), { size: fs });
    L.put(wide ? `C (${n(s.h)}, ${n(s.k)})` : 'C', [[cp[0] - 12, cp[1] + 19, 'right'], [cp[0] + 12, cp[1] + 19, 'left'], [cp[0] - 12, cp[1] - 17, 'right'], [cp[0], cp[1] + 32]], { size: fs });
    L.put(`r = ${s.r}`, [[rp[0] + 12, rp[1] - 14, 'left'], [rp[0] + 12, rp[1] + 17, 'left'], [rp[0], rp[1] - 25], [rp[0] - 12, rp[1] - 14, 'right']], { size: fs, color: pal.violet });
    if (isT && o.tri && dx !== 0 && dy !== 0) {
      const a = px(...Cc), b = px(...Cx), t = px(...Tt);
      const hx = wide && Math.abs(dx) * sc >= 92 ? `|x − h| = ${Math.abs(dx)}` : String(Math.abs(dx));
      const vy = wide && Math.abs(dy) * sc >= 28 ? `|y − k| = ${Math.abs(dy)}` : String(Math.abs(dy));
      const mx = (a[0] + b[0]) / 2, my = a[1] + (sys > 0 ? 17 : -17);
      L.put(hx, [[mx, my], [mx, 2 * a[1] - my]], { size: fs, color: pal.green });
      const vy0 = (b[1] + t[1]) / 2, vx = b[0] + (sxs > 0 ? 12 : -12), al = sxs > 0 ? 'left' : 'right';
      L.put(vy, [[vx, vy0, al], [2 * b[0] - vx, vy0, al === 'left' ? 'right' : 'left']], { size: fs, color: pal.red });
    }
    if (isT && o.showD && d2 > 0) {
      const a = px(...Cc), t = px(...Tt), m = [(a[0] + t[0]) / 2, (a[1] + t[1]) / 2], l = Math.hypot(t[0] - a[0], t[1] - a[1]), nx = (t[1] - a[1]) / l, ny = -(t[0] - a[0]) / l;
      const cands = [1, -1].map(sg => Math.abs(nx) > .35 ? [m[0] + sg * nx * 14, m[1] + sg * ny * 8, sg * nx > 0 ? 'left' : 'right'] : [m[0] + sg * nx * 24, m[1] + sg * ny * 24, 'center']);
      L.put(isSq(d2) ? `d = ${dtxt(d2)}` : `d ≈ ${Math.sqrt(d2).toFixed(2)}`, cands, { size: fs, color: pal.blue });
    }
  };

  /* ---------- explorer challenges: build the circle from its equation ---------- */
  const CH = [{ h: 2, k: -1, r: 3 }, { h: -3, k: 2, r: 4 }, { h: 0, k: 3, r: 2 }, { h: -1, k: -3, r: 5 }];
  const whyX = (v, nm) => v === 0 ? `${nm}² alone means the center's ${nm}-coordinate is 0`
    : `${term(v, nm)} is zero when ${nm} = ${n(v)}, so the center's ${nm}-coordinate is ${n(v)}`;

  /* ---------- predictions ---------- */
  const PRED = [{ h: 1, k: 1, r: 4, tx: 4, ty: 3 }, { h: 1, k: 1, r: 4, tx: 4, ty: 5 }, { h: -1, k: 0, r: 5, tx: 2, ty: 4 }];

  /* ---------- completing the square ---------- */
  const EQS = [{ b: -6, c: 4, d: -12 }, { b: 4, c: -2, d: -4 }, { b: -8, c: 4, d: 11 }, { b: 6, c: -4, d: -3 }];
  const eqInfo = e => {
    const h = -e.b / 2, k = -e.c / 2, s1 = h * h, s2 = k * k, r2 = -e.d + s1 + s2;
    return { ...e, h, k, s1, s2, r2, r: Math.round(Math.sqrt(r2)) };
  };
  const ORDER = [['sqr', 'half', 'bsq'], ['half', 'bsq', 'sqr'], ['bsq', 'sqr', 'half'], ['half', 'sqr', 'bsq']];
  const ORDER4 = [['ok', 'flip', 'rsq', 'swap'], ['flip', 'ok', 'swap', 'rsq'], ['rsq', 'swap', 'ok', 'flip'], ['swap', 'rsq', 'flip', 'ok']];

  /* ---------- practice ---------- */
  const mk = (type, q, choices, ans, fb) => ({ type, q, choices, ans, fb });
  const PR = [
    mk('Write the equation from a graph', 'The graph shows a circle. C marks its center and P is a point on it. Which equation describes the circle?',
      ['(x + 2)² + (y − 1)² = 9', '(x − 2)² + (y + 1)² = 9', '(x − 2)² + (y + 1)² = 3', '(x − 1)² + (y + 2)² = 9'], 1,
      ['Not quite. The signs are flipped. C = (2, −1). A bracket must be zero at the center: x − 2 = 0 at x = 2, and y + 1 = 0 at y = −1.',
        'Right. C is 2 to the right and 1 down, so h = 2 and k = −1. P is 3 units from C, so r = 3 and r² = 9.',
        'Not quite. The center is right, but the number on the right side is r², not r. With r = 3 it is 3² = 9.',
        'Not quite. The coordinates are swapped. The x-bracket holds the x-coordinate of the center, 2. The y-bracket holds the y-coordinate, −1.']),
    mk('Read the center and radius', 'A circle has the equation (x + 3)² + (y − 2)² = 16. What are its center and radius?',
      ['Center (−3, 2), radius 4', 'Center (3, −2), radius 4', 'Center (−3, 2), radius 16', 'Center (3, −2), radius 16'], 0,
      ['Right. x + 3 is zero at x = −3 and y − 2 is zero at y = 2, so the center is (−3, 2). Also 16 = 4², so r = 4. The graph now shows it.',
        'Not quite. Those are the signs you see in the brackets, but the center has the opposite signs: x + 3 is zero at x = −3.',
        'Not quite. The center is right, but 16 is r². The radius is √16 = 4.',
        'Not quite. Both parts slipped. The center takes the opposite signs of the brackets, (−3, 2), and 16 is r², so r = 4.']),
    mk('Inside, on or outside', 'The circle is (x − 1)² + (y + 2)² = 25. Is the point P (3, −6) inside the circle, on it, or outside it?',
      ['Inside', 'On the circle', 'Outside'], 0,
      ['Right. x − h = 3 − 1 = 2 and y − k = −6 − (−2) = −4. So d² = 2² + (−4)² = 4 + 16 = 20. Since 20 is less than r² = 25, P is inside.',
        'Not quite. On the circle needs d² = 25, but d² = 2² + (−4)² = 4 + 16 = 20.',
        'Not quite. d² = 2² + (−4)² = 4 + 16 = 20, which is less than r² = 25. P is closer to the center than r, so it is inside.']),
    mk('Complete the square', 'Complete the square for x² + y² − 4x − 8y + 11 = 0. Which choice gives the center and radius?',
      ['Center (−2, −4), radius 3', 'Center (2, 4), radius 9', 'Center (−4, −8), radius 3', 'Center (2, 4), radius 3'], 3,
      ['Not quite. The signs are flipped. Half of −4 is −2, and the bracket is (x − 2)², which is zero at x = +2.',
        'Not quite. The center is right, but 9 is r². The radius is √9 = 3.',
        'Not quite. Those are the whole coefficients of x and y. The center uses half of each: 2 and 4.',
        'Right. (x² − 4x + 4) + (y² − 8y + 16) = −11 + 4 + 16 = 9. So (x − 2)² + (y − 4)² = 9, center (2, 4), radius 3. The graph now shows it.']),
    mk('Distance formula to equation', 'A circle has its center at C (1, −1) and passes through P (4, 3). Which equation is the circle?',
      ['(x − 1)² + (y + 1)² = 5', '(x + 1)² + (y − 1)² = 25', '(x − 1)² + (y + 1)² = 25', '(x − 1)² + (y + 1)² = 7'], 2,
      ['Not quite. The distance is 5, but the equation needs r² = 25, not r = 5.',
        'Not quite. Check the signs. The center is (1, −1), so the brackets are (x − 1) and (y + 1).',
        'Right. The legs are 4 − 1 = 3 and 3 − (−1) = 4, so r² = 3² + 4² = 25 and r = 5. The center gives the brackets (x − 1) and (y + 1).',
        'Not quite. 7 is the legs added, 3 + 4. The distance formula squares each leg first: 9 + 16 = 25.']),
    mk('Expand to general form', 'Expand (x − 1)² + (y + 2)² = 4 into the form x² + y² + bx + cy + d = 0. Which choice is correct?',
      ['x² + y² − 2x − 4y + 1 = 0', 'x² + y² − 2x + 4y + 1 = 0', 'x² + y² − 2x + 4y + 5 = 0', 'x² + y² − x + 2y + 1 = 0'], 1,
      ['Not quite. (y + 2)² = y² + 4y + 4 has +4y. The sign of the middle term matches the sign inside the bracket.',
        'Right. (x − 1)² = x² − 2x + 1 and (y + 2)² = y² + 4y + 4, so the left side is x² + y² − 2x + 4y + 5. Subtract 4 from both sides: the constant is 1.',
        'Not quite. You forgot to move the 4 from the right side. 5 − 4 = 1.',
        'Not quite. You halved the middle terms. (x − 1)² = x² − 2x + 1, and the middle term is −2x, not −x.']),
    mk('Which point is on the circle', 'The circle is x² + y² = 25, with its center at the origin. Which point lies on it?',
      ['A (3, 3)', 'B (2, 4)', 'C (−4, 3)', 'D (4, 4)'], 2,
      ['Not quite. 3² + 3² = 18, less than 25, so A is inside.',
        'Not quite. 2² + 4² = 20, less than 25, so B is inside.',
        'Right. (−4)² + 3² = 16 + 9 = 25, so d² = r² and C is on the circle.',
        'Not quite. 4² + 4² = 32, greater than 25, so D is outside.']),
    mk('Perimeter on a coordinate plane', 'Triangle ABC has A (−2, −1), B (2, −1) and C (2, 2). What is its perimeter?',
      ['7', '12', '25', '9'], 1,
      ['Not quite. 4 + 3 = 7 leaves out side AC. Find AC with the distance formula: √(4² + 3²) = 5.',
        'Right. AB = 4 (same row), BC = 3 (same column), and AC = √(4² + 3²) = √25 = 5. The perimeter is 4 + 3 + 5 = 12. (The area of this right triangle is ½ · 4 · 3 = 6.)',
        'Not quite. 25 is AC², the square of a side. A perimeter adds lengths: 4 + 3 + 5.',
        'Not quite. 4 + 5 = 9 leaves out BC = 3.'])
  ];
  const prScene = (c, p, i, done) => {
    const pal = p.pal; baseGrid(c, p);
    const L = labeler(c, p), fs = clamp(p.scale * .62, 12.5, 15), px = (x, y) => [p.X(x), p.Y(y)];
    const hdr = [`Problem ${i + 1} of ${PR.length}: ${PR[i].type}`];
    const pt = (x, y, nm, o = {}) => { handle(p, x, y, false); const q = px(x, y); L.block(q[0], q[1]); L.put(nm, around(q[0], q[1]), { size: fs, ...o }); };
    const rad = (h, k, r) => { p.path([[h, k], [h + r, k]], { stroke: pal.violet, width: 3.5 }); const q = px(h + r / 2, k); L.put(`r = ${r}`, [[q[0], q[1] - 15], [q[0], q[1] + 17]], { size: fs, color: pal.violet }); };
    const ringB = (h, k, r) => ring(p, h, k, r, { fill: alpha(pal.blue, .08), stroke: pal.blue, width: 3.5 });
    const legs = (A, B, Cn) => {   /* right angle at B */
      p.path([A, B, Cn], { fill: alpha(pal.yellow, .2), close: true });
      p.path([A, B], { stroke: pal.green, width: 4.5 }); p.path([B, Cn], { stroke: pal.red, width: 4.5 });
    };
    if (i === 0) {
      hdr.push('C is the center, P is on the circle.');
      header(c, p, L, hdr); ringB(2, -1, 3);
      if (done) rad(2, -1, 3);
      pt(2, -1, done ? 'C (2, −1)' : 'C'); pt(5, -1, done ? 'P (5, −1)' : 'P');
    } else if (i === 1) {
      hdr.push('(x + 3)² + (y − 2)² = 16');
      header(c, p, L, hdr);
      if (done) { ringB(-3, 2, 4); rad(-3, 2, 4); pt(-3, 2, 'C (−3, 2)'); }
    } else if (i === 2) {
      hdr.push('(x − 1)² + (y + 2)² = 25');
      header(c, p, L, hdr); ringB(1, -2, 5);
      if (done) { legs([1, -2], [3, -2], [3, -6]); p.path([[1, -2], [3, -6]], { stroke: pal.blue, width: 3, dash: [8, 6] }); }
      pt(3, -6, 'P (3, −6)'); pt(1, -2, 'C (1, −2)');
      if (done) { const a = px(2, -2), b = px(3, -4); L.put('2', [[a[0], a[1] + (a[1] > 0 ? -16 : 16)], [a[0], a[1] - 16]], { size: fs, color: pal.green }); L.put('4', [[b[0] + 12, b[1], 'left'], [b[0] - 12, b[1], 'right']], { size: fs, color: pal.red }); }
    } else if (i === 3) {
      hdr.push('x² + y² − 4x − 8y + 11 = 0');
      header(c, p, L, hdr);
      if (done) { ringB(2, 4, 3); rad(2, 4, 3); pt(2, 4, 'C (2, 4)'); }
    } else if (i === 4) {
      hdr.push('C (1, −1) and P (4, 3)');
      header(c, p, L, hdr);
      if (done) { ringB(1, -1, 5); legs([1, -1], [4, -1], [4, 3]); p.path([[1, -1], [4, 3]], { stroke: pal.violet, width: 3.5 }); }
      pt(1, -1, 'C'); pt(4, 3, 'P');
      if (done) { const a = px(2.5, -1), b = px(4, 1); L.put('3', [[a[0], a[1] + 17], [a[0], a[1] - 17]], { size: fs, color: pal.green }); L.put('4', [[b[0] + 12, b[1], 'left'], [b[0] - 12, b[1], 'right']], { size: fs, color: pal.red }); const m = px(2.5, 1); L.put('5', [[m[0] - 14, m[1], 'right'], [m[0] + 14, m[1], 'left']], { size: fs, color: pal.violet }); }
    } else if (i === 5) {
      hdr.push('(x − 1)² + (y + 2)² = 4');
      header(c, p, L, hdr); ringB(1, -2, 2);
      if (done) { rad(1, -2, 2); pt(1, -2, 'C (1, −2)'); }
    } else if (i === 6) {
      hdr.push('x² + y² = 25');
      header(c, p, L, hdr); ringB(0, 0, 5);
      pt(0, 0, 'O (0, 0)', {}); pt(3, 3, 'A'); pt(2, 4, 'B'); pt(-4, 3, 'C'); pt(4, 4, 'D');
    } else {
      hdr.push('Triangle ABC');
      header(c, p, L, hdr);
      p.path([[-2, -1], [2, -1], [2, 2]], { fill: alpha(pal.yellow, .2), close: true });
      p.path([[-2, -1], [2, -1]], { stroke: pal.green, width: 4.5 }); p.path([[2, -1], [2, 2]], { stroke: pal.red, width: 4.5 }); p.path([[-2, -1], [2, 2]], { stroke: pal.blue, width: 4.5 });
      rightMark(p, [2, -1], -1, 1, .4);
      pt(-2, -1, 'A (−2, −1)'); pt(2, -1, 'B (2, −1)'); pt(2, 2, 'C (2, 2)');
      if (done) {
        const a = px(0, -1), b = px(2, .5), m = px(0, .5);
        L.put('AB = 4', [[a[0], a[1] + 18], [a[0], a[1] - 18]], { size: fs, color: pal.green });
        L.put('BC = 3', [[b[0] + 12, b[1], 'left'], [b[0] - 12, b[1], 'right']], { size: fs, color: pal.red });
        L.put('AC = 5', [[m[0] - 12, m[1] - 10, 'right'], [m[0] + 12, m[1] + 14, 'left']], { size: fs, color: pal.blue });
      }
    }
  };

  register({
    id: 'circle-equations-and-the-distance-formula', level: 'school',
    title: 'Circle equations and the distance formula',
    blurb: 'Drag a circle\'s center and radius, and see why the distance formula makes (x − h)² + (y − k)² = r².',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 4.9;
      p.grid(1);
      const pts = []; for (let i = 0; i <= 90; i++) pts.push([3 * Math.cos(i * TAU / 90), 3 * Math.sin(i * TAU / 90)]);
      p.path(pts, { close: true, fill: alpha(pal.blue, .1), stroke: pal.blue, width: 2.4 });
      p.path([[0, 0], [2.4, 0], [2.4, 1.8]], { fill: alpha(pal.yellow, .22), close: true });
      p.path([[0, 0], [2.4, 0]], { stroke: pal.green, width: 3 });
      p.path([[2.4, 0], [2.4, 1.8]], { stroke: pal.red, width: 3 });
      p.path([[0, 0], [2.4, 1.8]], { stroke: pal.violet, width: 3 });
      p.dot(0, 0, 4.5, pal.stage, pal.brass, 2); p.dot(2.4, 1.8, 4.5, pal.stage, pal.brass, 2);
    },
    hook: String.raw`A phone tower reaches every point within 5 km. Where exactly does its signal stop, and how could you test, with one calculation and no ruler, whether your house at a given spot is covered?`,
    steps: [
      { title: 'A circle is the points at one distance',
        text: String.raw`<p>A garden sprinkler waters everything within 3 m. The edge of that patch is a <b>circle</b>: all points exactly 3 m from the <b>center</b> C. C is the center, written \((h,k)\). The distance from C to the edge is the <b>radius</b> \(r\) (violet).</p><p>T is a test point. Drag T, or use the sliders. When its distance \(d\) from C equals \(r=3\), T is on the circle.</p>`,
        set: { mode: 'explore', h: 0, k: 0, r: 3, tx: 0, ty: 3, tri: false, chal: 'free' } },
      { title: 'The distance formula is a right triangle',
        text: String.raw`<p>Call the center \(C=(h,k)\) and the test point \(T=(x,y)\). Go 3 right (\(x-h\), green), then 4 up (\(y-k\), red). With \(d\) (blue) these make a right triangle: \(d^2=3^2+4^2=25\), so \(d=5\).</p><p>T is on the circle when \(d=r\), so \((x-h)^2+(y-k)^2=r^2\). Try a <b>Challenge</b> in the panel.</p>`,
        set: { mode: 'explore', h: 1, k: -1, r: 5, tx: 4, ty: 3, tri: true, chal: 'free' } },
      { title: 'Predict: inside, on or outside?',
        text: String.raw`<p>First decide, then look. The circle and T are fixed. Is T inside the circle, on it, or outside? Press a button to commit to a guess.</p><p>Then compare \(d^2\) with \(r^2\). Less than means inside, equal means on, greater than means outside. No square root is needed.</p>`,
        set: { mode: 'predict', pi: 0 } },
      { title: 'Complete the square to find the center',
        text: String.raw`<p>The equation \(x^2+y^2-6x+4y-12=0\) hides its center. Make each group a perfect square to reveal it.</p><p>Use the buttons: group the terms, then choose the number that completes each square. Add it to both sides so the equation stays balanced. Last, read the center and the radius.</p>`,
        set: { mode: 'complete', ei: 0, cs: 0 } }
    ],
    formal: String.raw`
      <p><b>Goal.</b> Describe a circle with one equation, test whether a point is inside, on or outside it, and move between the form \((x-h)^2+(y-k)^2=r^2\) and the form \(x^2+y^2+bx+cy+d=0\).</p>
      <h3>The distance formula, again</h3>
      <p>Take \(A=(x_1,y_1)\) and \(B=(x_2,y_2)\). The point \(C=(x_2,y_1)\) shares a row with A and a column with B, so the angle at C is a right angle. The legs are \(|x_2-x_1|\) and \(|y_2-y_1|\), and the Pythagorean theorem gives
      \[ d^2=(x_2-x_1)^2+(y_2-y_1)^2. \]
      Squaring removes the signs, so the order of the points does not matter.</p>
      <h3>The equation of a circle</h3>
      <p>A circle with center \((h,k)\) and radius \(r\) is the set of all points \((x,y)\) whose distance from \((h,k)\) is exactly \(r\). Put \((x,y)\) and \((h,k)\) into the distance formula and set the distance equal to \(r\):
      \[ \sqrt{(x-h)^2+(y-k)^2}=r \quad\Longleftrightarrow\quad (x-h)^2+(y-k)^2=r^2. \]
      Squaring both sides is safe because both sides are not negative. So the equation of a circle is the distance formula, which is the Pythagorean theorem, with the distance fixed at \(r\). With the center at the origin it becomes \(x^2+y^2=r^2\), the Pythagorean theorem for the point's own coordinates.</p>
      <h3>Inside, on, outside</h3>
      <p>Let \(d^2=(x-h)^2+(y-k)^2\) for a test point \(T=(x,y)\). Distances are not negative, so \(d\) and \(d^2\) put the point in the same order against \(r\) and \(r^2\):
      \[ d^2 &lt; r^2 \text{ (inside)}, \qquad d^2=r^2 \text{ (on the circle)}, \qquad d^2 &gt; r^2 \text{ (outside)}. \]
      For the circle \((x-1)^2+(y-1)^2=16\) and \(T=(4,3)\): \(d^2=9+4=13\), and \(13 &lt; 16\), so T is inside. You never need the square root.</p>
      <h3>Reading and writing the equation</h3>
      <p><b>From an equation.</b> A bracket \((x-h)\) is zero when \(x=h\), so the center takes the opposite sign of the number you see: \((x+3)^2+(y-2)^2=16\) has center \((-3,2)\). The right side is \(r^2\), so \(r=\sqrt{16}=4\), not 16.</p>
      <p><b>From a graph.</b> Read the center \((h,k)\) from the grid. Count the radius from the center to any point on the circle. Then write \((x-h)^2+(y-k)^2=r^2\), with the sign of h and k flipped inside the brackets and \(r\) squared.</p>
      <p><b>From two points.</b> If the center is \(C\) and the circle passes through \(P\), then \(r^2\) is the squared distance \(CP\). For \(C=(1,-1)\) and \(P=(4,3)\): \(r^2=3^2+4^2=25\), so the equation is \((x-1)^2+(y+1)^2=25\).</p>
      <h3>Completing the square</h3>
      <p>Multiplying out \((x-h)^2+(y-k)^2=r^2\) gives \(x^2+y^2+bx+cy+d=0\) with \(b=-2h\), \(c=-2k\) and \(d=h^2+k^2-r^2\). To go back, notice that \((x+\tfrac b2)^2=x^2+bx+\tfrac{b^2}{4}\). So \(x^2+bx\) becomes a perfect square when you add \((\tfrac b2)^2\), and adding the same number to both sides keeps the equation true. The cases here are chosen so that the center is a whole-number point and \(r^2\) is a perfect square.</p>
      <p><b>Example.</b> \(x^2+y^2-6x+4y-12=0\).</p>
      <ol>
        <li>Group and move the constant: \((x^2-6x)+(y^2+4y)=12\).</li>
        <li>Half of \(-6\) is \(-3\), and \((-3)^2=9\). Half of \(4\) is \(2\), and \(2^2=4\). Add both to both sides: \((x^2-6x+9)+(y^2+4y+4)=12+9+4\).</li>
        <li>Factor: \((x-3)^2+(y+2)^2=25\).</li>
        <li>Read: center \((3,-2)\), radius \(5\).</li>
      </ol>
      <p>Check: the point \((8,-2)\) is 5 to the right of the center. In the original equation \(64+4-48-8-12=0\), so it lies on the circle.</p>
      <p><b>Caveat.</b> The right side must come out positive. If it is \(0\), the equation \((x-2)^2+(y+3)^2=0\) has one solution, the single point \((2,-3)\). If it is negative, no point satisfies it, so there is no circle.</p>
      <h3>Why it works, in words</h3>
      <p>Every point of a circle is the same distance from the center. To measure the distance you walk across, then up, and those two walks are the legs of a right triangle whose long side is the distance. The Pythagorean theorem ties the legs to that distance, so "same distance \(r\)" turns into one equation in x and y. Completing the square is the same idea in reverse: it puts the equation back into the shape of that right triangle so you can see the center.</p>
      <h3>Polygons on a coordinate plane</h3>
      <p>The distance formula also gives the side lengths of any polygon whose corners are on a grid, and so its perimeter. For \(A=(-2,-1)\), \(B=(2,-1)\), \(C=(2,2)\): \(AB=4\), \(BC=3\), \(AC=\sqrt{4^2+3^2}=5\), so the perimeter is \(12\). The right angle at B makes the area \(\tfrac12\cdot4\cdot3=6\).</p>`,
    check: [
      { q: String.raw`A circle is given by \((x+2)^2+(y-5)^2=36\). Which statement is true?`,
        choices: ['Center (2, −5), radius 6', 'Center (−2, 5), radius 6', 'Center (−2, 5), radius 36', 'Center (2, −5), radius 36'], answer: 1,
        why: String.raw`The bracket \((x+2)\) is zero when \(x=-2\), and \((y-5)\) is zero when \(y=5\), so the center is \((-2,5)\). The right side is \(r^2=36\), so \(r=6\). Reading the signs as they appear gives the wrong center, and calling 36 the radius forgets the square root.`,
        hint: 'Which x-value makes x + 2 equal 0? Is 36 the radius or the radius squared?' },
      { q: String.raw`A circle has the equation \(x^2+y^2-10x+4y+20=0\). Complete the square. What are its center and radius?`,
        choices: ['Center (−5, 2), radius 3', 'Center (5, −2), radius 7', 'Center (5, −2), radius 9', 'Center (5, −2), radius 3'], answer: 3,
        why: String.raw`Group: \((x^2-10x)+(y^2+4y)=-20\). Half of \(-10\) is \(-5\), squared is \(25\). Half of \(4\) is \(2\), squared is \(4\). So \((x^2-10x+25)+(y^2+4y+4)=-20+25+4=9\), which is \((x-5)^2+(y+2)^2=9\). The center is \((5,-2)\) and \(r=3\). Radius 7 comes from moving the 20 with the wrong sign (\(20+25+4=49\)), and 9 is \(r^2\).`,
        hint: 'Move the 20 to the right side as −20. Add 25 and 4 to both sides.' },
      { q: String.raw`A student tests whether the point \((4,2)\) is inside the circle \((x-1)^2+(y-1)^2=16\). Step 1: \((4-1)^2+(2-1)^2=9+1=10\). Step 2: the radius is 4, and 10 is greater than 4, so the point is outside. Which statement about this work is correct?`,
        choices: ['Step 1 is wrong: the two squares should be multiplied, not added.', 'The work is correct: 10 is greater than 4, so the point is outside.', 'Step 2 is wrong: 10 is d², so it must be compared with r² = 16. Since 10 is less than 16, the point is inside.', 'Step 2 is wrong: the point is on the circle because 10 is close to 16.'], answer: 2,
        why: String.raw`The number 10 is \(d^2\), a squared distance. It has to be compared with \(r^2=16\) (or take \(\sqrt{10}\approx3.2\) and compare with \(r=4\)). Since \(10 &lt; 16\), the point is inside. Comparing \(d^2\) with \(r\) mixes a squared length with an ordinary length. Step 1 is right: the squares of the legs are added.`,
        hint: 'What does the number 10 stand for, a distance or a squared distance? Compare like with like.' }
    ],
    links: { related: ['distance-and-the-pythagorean-theorem', 'inscribed-angles', 'pythagorean-theorem', 'the-unit-circle-and-trig-waves'] },

    mount({ stage, controls: C }) {
      const MODES = ['explore', 'predict', 'complete'];
      const st = { mode: 'explore', h: 0, k: 0, r: 3, tx: 0, ty: 3, tri: false, hideEq: false, chal: 'free' };
      const vis = { h: st.h, k: st.k, r: st.r, tx: st.tx, ty: st.ty };
      const found = [];
      const pd = { i: 0, guess: null };
      const cp = { ei: 0, cs: 0, fb: '' };
      const pr = { i: 0, pick: null, right: 0, done: 0, over: false, practicing: false };
      let cancel = () => {};
      let modeBtns, hS, kS, rS, txS, tyS, triT, hideT, chalSel, eqSel, ro1, ro2, ro3, ro4;
      let predBtns, nextPredB, groupB, choiceB, restartB, nextEqB, prChoice, prNext, prLeave, gMain, gEx, gPred, gComp, gPracStart, gPrac;
      const P = new Plane(stage, { span: FIELD });

      /* ---------- explorer ---------- */
      const chalOf = () => st.chal === 'free' ? null : CH[+st.chal];
      const exHeader = () => {
        const t = chalOf(), out = [];
        if (t) out.push(`Make this circle: ${eqCR(t.h, t.k, t.r * t.r)}`);
        if (!st.hideEq) out.push(eqCR(st.h, st.k, st.r * st.r));
        return out;
      };
      const exploreHTML = () => {
        const { h, k, r, tx, ty } = st, dx = tx - h, dy = ty - k, d2 = dx * dx + dy * dy, r2 = r * r, v = rel(d2, r2), out = [];
        out.push(`<span class="k">Center</span> C (${n(h)}, ${n(k)}) &nbsp; <span class="k">Radius</span> r = ${r}`);
        out.push(st.hideEq ? '<span class="k">Equation</span> hidden. Write it on paper, then uncover it.' : `<span class="k">Equation</span> ${eqCR(h, k, r2)}`);
        out.push(`<span class="k">Test point</span> T (${n(tx)}, ${n(ty)})`);
        out.push(`<span class="k">Legs</span> x − h = ${n(tx)} − ${par(h)} = ${n(dx)}, y − k = ${n(ty)} − ${par(k)} = ${n(dy)}`);
        out.push(`<span class="k">Squares</span> ${par(dx)}² + ${par(dy)}² = ${dx * dx} + ${dy * dy} = ${d2} (this is d²)`);
        out.push(`<span class="k">Distance</span> d = ${dtxt(d2)}`);
        out.push(`<span class="k">Compare</span> d² = ${d2} is ${v.long} r² = ${r2}, so ${v.say}.`);
        const t = chalOf();
        if (t) {
          const hit = h === t.h && k === t.k && r === t.r, i = +st.chal;
          if (hit && !found.includes(i)) found.push(i);
          let m = `<span class="k">Challenge</span> Make the circle ${eqCR(t.h, t.k, t.r * t.r)}.<br>`;
          if (hit) m += `${ok('Yes.')} Center (${n(t.h)}, ${n(t.k)}) and radius ${t.r}. The signs inside the brackets are opposite to the center, and ${t.r * t.r} is r² = ${t.r}². That is ${found.length} of ${CH.length} challenges done.`;
          else {
            const tips = [];
            if (h !== t.h) tips.push(`the x-part: ${whyX(t.h, 'x')}`);
            if (k !== t.k) tips.push(`the y-part: ${whyX(t.k, 'y')}`);
            if (r !== t.r) tips.push(`the radius: the right side ${t.r * t.r} is r², and √${t.r * t.r} = ${t.r}`);
            m += `Not yet. Fix ${tips.join('; ')}.`;
          }
          out.push(m);
        }
        return out.join('<br>');
      };

      /* ---------- predictions ---------- */
      const predHTML = () => {
        const q = PRED[pd.i], dx = q.tx - q.h, dy = q.ty - q.k, d2 = dx * dx + dy * dy, r2 = q.r * q.r, v = rel(d2, r2), out = [];
        out.push(`<b>Prediction ${pd.i + 1} of ${PRED.length}</b><br>Circle: ${eqCR(q.h, q.k, r2)} (center (${n(q.h)}, ${n(q.k)}), radius ${q.r}).<br>Test point T (${n(q.tx)}, ${n(q.ty)}). Is T inside, on, or outside the circle?`);
        if (pd.guess == null) out.push('Commit to a guess with a button. The triangle and the numbers appear after you choose.');
        else {
          const names = ['inside', 'on the circle', 'outside'], right = v.w === names[pd.guess];
          out.push(`<span class="k">You guessed</span> ${names[pd.guess]}. ${right ? ok('Correct.') : no('Not this time.')}`);
          out.push(`<span class="k">Legs</span> x − h = ${n(q.tx)} − ${par(q.h)} = ${n(dx)}, y − k = ${n(q.ty)} − ${par(q.k)} = ${n(dy)}`);
          out.push(`<span class="k">Squares</span> ${par(dx)}² + ${par(dy)}² = ${dx * dx} + ${dy * dy} = ${d2}`);
          out.push(`<span class="k">Compare</span> d² = ${d2} is ${v.long} r² = ${r2}, so ${v.say}.`);
          out.push(pd.i === 2 ? 'Equal squares mean T sits exactly on the circle. A drawing can look close when the numbers are not, so trust the comparison.' : pd.i === 1 ? 'T is 5 away from C and r is 4, so it is outside. The legs 3 and 4 make the familiar 3-4-5 triangle.' : 'The squared distance is smaller than r², so T is closer to the center than r.');
        }
        return out.join('<br>');
      };

      /* ---------- completing the square ---------- */
      const info = () => eqInfo(EQS[cp.ei]);
      const cOpts = () => {
        const e = info(), s = cp.cs;
        if (s === 1 || s === 2) {
          const x = s === 1, co = x ? e.b : e.c, nm = x ? 'x' : 'y', half = co / 2, sq = half * half, ord = ORDER[(cp.ei + s) % 4];
          const val = { sqr: sq, half, bsq: co * co };
          const bin = `(${nm} ${half < 0 ? '−' : '+'} ${Math.abs(half)})²`, ex = `${nm}² ${co < 0 ? '−' : '+'} ${Math.abs(co)}${nm} + ${sq}`;
          const fb = {
            sqr: `Right. ${bin} = ${ex}. The last term is ${par(half)}² = ${sq}, which is (half of ${n(co)}) squared. Add ${sq} to both sides so the equation stays balanced.`,
            half: `Not quite. ${n(half)} is half of ${n(co)}, but the last term of the square is that number squared: ${par(half)}² = ${sq}.`,
            bsq: `Not quite. ${co * co} is ${par(co)}², too big. Half of ${n(co)} is ${n(half)}, and the number to add is its square, ${sq}.`
          };
          return { prompt: `Which number completes the square for the ${nm}-terms?`, labels: ord.map(k => n(val[k])), ans: ord.indexOf('sqr'), fbs: ord.map(k => fb[k]) };
        }
        if (s === 3) {
          const ord = ORDER4[cp.ei % 4], lab = { ok: `Center (${n(e.h)}, ${n(e.k)}), radius ${e.r}`, flip: `Center (${n(-e.h)}, ${n(-e.k)}), radius ${e.r}`, rsq: `Center (${n(e.h)}, ${n(e.k)}), radius ${e.r2}`, swap: `Center (${n(e.k)}, ${n(e.h)}), radius ${e.r}` };
          const fb = {
            ok: `Right. ${term(e.h, 'x')} is zero at x = ${n(e.h)}, and ${term(e.k, 'y')} is zero at y = ${n(e.k)}. The right side ${e.r2} is r², so r = ${e.r}.`,
            flip: `Not quite. The center takes the opposite sign of the number in the bracket: ${term(e.h, 'x')} is zero at x = ${n(e.h)}, not ${n(-e.h)}.`,
            rsq: `Not quite. The center is right, but ${e.r2} is r². The radius is √${e.r2} = ${e.r}.`,
            swap: `Not quite. The x-bracket gives the first coordinate, ${n(e.h)}, and the y-bracket gives the second, ${n(e.k)}.`
          };
          return { prompt: 'Read the center and the radius.', labels: ord.map(k => lab[k]), ans: ord.indexOf('ok'), fbs: ord.map(k => fb[k]) };
        }
        return null;
      };
      const compLines = () => {
        const e = info(), s = cp.cs, out = [gen(e.b, e.c, e.d)];
        if (s >= 1) out.push(`(x²${lin(e.b, 'x')}) + (y²${lin(e.c, 'y')}) = ${n(-e.d)}`);
        if (s >= 2) out.push(`(x²${lin(e.b, 'x')} + ${e.s1}) + (y²${lin(e.c, 'y')}) = ${n(-e.d)} + ${e.s1}`);
        if (s >= 3) out.push(`(x²${lin(e.b, 'x')} + ${e.s1}) + (y²${lin(e.c, 'y')} + ${e.s2}) = ${n(-e.d)} + ${e.s1} + ${e.s2}`);
        if (s >= 3) out.push(eqCR(e.h, e.k, e.r2));
        return out;
      };
      const compHTML = () => {
        const e = info(), s = cp.cs, o = cOpts(), out = [];
        out.push(compLines().map((l, i) => `<span class="k">${['Start', 'Group', 'Add for x', 'Add for y', 'Factor'][i]}</span> ${l}`).join('<br>'));
        if (s === 0) out.push('Step 1: collect the x-terms and the y-terms, and move the plain number to the right side. Press the button.');
        if (o) out.push(`<b>${o.prompt}</b>`);
        if (cp.fb) out.push(cp.fb);
        if (s === 4) {
          const x = e.h + e.r, tot = [x * x, e.k * e.k, e.b * x, e.c * e.k, e.d];
          out.push(`${ok('Done.')} Center (${n(e.h)}, ${n(e.k)}), radius ${e.r}. The graph shows the circle, its center and the two lines x = ${n(e.h)} and y = ${n(e.k)}.`);
          out.push(`<span class="k">Check</span> The point (${n(x)}, ${n(e.k)}) is ${e.r} to the right of the center. In the original equation: ${sumStr(tot)} = ${tot.reduce((a, b) => a + b, 0)}.`);
        }
        return out.join('<br>');
      };
      const compScene = (c, p) => {
        const pal = p.pal, e = info(); baseGrid(c, p);
        const L = labeler(c, p), fs = clamp(p.scale * .62, 12.5, 15), lines = compLines(), hd = [lines[0]];
        if (lines.length > 1) hd.push(lines[lines.length - 1]);
        header(c, p, L, hd);
        if (cp.cs >= 4) {
          ring(p, e.h, e.k, e.r, { fill: alpha(pal.blue, .08), stroke: pal.blue, width: 3.5 });
          const bd = p.bounds();
          p.path([[e.h, bd.y0], [e.h, bd.y1]], { stroke: pal.green, width: 2, dash: [6, 6] });
          p.path([[bd.x0, e.k], [bd.x1, e.k]], { stroke: pal.red, width: 2, dash: [6, 6] });
          p.path([[e.h, e.k], [e.h + e.r, e.k]], { stroke: pal.violet, width: 3.5 });
          const cpx = [p.X(e.h), p.Y(e.k)], rp = [p.X(e.h + e.r / 2), p.Y(e.k)];
          handle(p, e.h, e.k, false); L.block(cpx[0], cpx[1]);
          T(c, p, `x = ${n(e.h)}`, clamp(p.X(e.h) + 6, 30, p.w - 40), p.h - 12, { size: fs, color: pal.green, align: 'left' });
          T(c, p, `y = ${n(e.k)}`, p.w - 8, clamp(p.Y(e.k) - 12, 12, p.h - 12), { size: fs, color: pal.red, align: 'right' });
          L.put(`C (${n(e.h)}, ${n(e.k)})`, [[cpx[0] - 12, cpx[1] + 19, 'right'], [cpx[0] + 12, cpx[1] + 19, 'left'], [cpx[0] - 12, cpx[1] - 17, 'right']], { size: fs });
          L.put(`r = ${e.r}`, [[rp[0], rp[1] - 15], [rp[0], rp[1] + 17]], { size: fs, color: pal.violet });
        }
      };

      /* ---------- drawing ---------- */
      P.onDraw = (c, p) => {
        if (st.mode === 'explore') circleScene(c, p, vis, st, { tri: st.tri, showD: true, handles: true, status: true, header: exHeader() });
        else if (st.mode === 'predict') {
          const q = PRED[pd.i], rv = pd.guess != null;
          circleScene(c, p, q, q, { tri: rv, showD: rv, handles: false, status: rv, header: [eqCR(q.h, q.k, q.r * q.r)] });
        } else if (st.mode === 'complete') compScene(c, p);
        else prScene(c, p, pr.i, pr.pick != null);
      };

      /* ---------- practice ---------- */
      const prHTML = () => {
        const q = PR[pr.i], out = [`<b>Problem ${pr.i + 1} of ${PR.length}</b> &nbsp; ${pr.done === 0 ? 'No answers yet' : `${pr.right} of ${pr.done} right so far`}`, q.q];
        if (pr.pick != null) out.push((pr.pick === q.ans ? ok('Correct. ') : no('Not this time. ')) + q.fb[pr.pick].replace(/^(Right|Not quite)\. /, ''));
        if (pr.over) out.push(`<b>All done: ${pr.right} of ${PR.length} right.</b> Look back at the ones you missed. Each explanation shows the step that matters. Press "Practice again" to retry.`);
        return out.join('<br>');
      };
      const prPick = i => {
        if (pr.pick != null) return;
        pr.pick = i; pr.done++; if (i === PR[pr.i].ans) pr.right++;
        if (pr.done === PR.length) pr.over = true;
        sync();
      };
      const prAdvance = () => {
        if (pr.over) { Object.assign(pr, { i: 0, pick: null, right: 0, done: 0, over: false }); }
        else if (pr.pick != null && pr.i < PR.length - 1) { pr.i++; pr.pick = null; }
        sync();
      };

      /* ---------- controls ---------- */
      const probe = C.readout(), host = probe.parentElement; probe.remove();
      const group = build => {
        const before = new Set(host.children); build();
        const g = h('div', { style: 'display:flex;flex-direction:column;gap:16px;flex:none' });
        [...host.children].filter(e => !before.has(e)).forEach(e => g.append(e));
        host.append(g); return g;
      };
      const small = els => els.forEach(b => Object.assign(b.style, { padding: '6px 12px', minHeight: '40px', fontSize: '.88rem' }));
      const redraw = () => P.draw();
      const setBtn = (b, text, show) => { b.textContent = text; b.style.display = show ? '' : 'none'; };
      const sync = () => {
        const prac = st.mode === 'practice';
        gMain.style.display = prac ? 'none' : 'flex'; gPrac.style.display = prac ? 'flex' : 'none'; gPracStart.style.display = prac ? 'none' : 'flex';
        modeBtns.forEach((b, i) => { b.className = MODES[i] === st.mode ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', MODES[i] === st.mode); });
        gEx.style.display = st.mode === 'explore' ? 'flex' : 'none';
        gPred.style.display = st.mode === 'predict' ? 'flex' : 'none';
        gComp.style.display = st.mode === 'complete' ? 'flex' : 'none';
        if (P.coordEl) P.coordEl.style.display = 'none';
        if (st.mode === 'explore') {
          hS.set(st.h); kS.set(st.k); rS.set(st.r); txS.set(st.tx); tyS.set(st.ty);
          triT.checked = st.tri; hideT.checked = st.hideEq; chalSel.value = st.chal;
          ro1.innerHTML = exploreHTML();
        } else if (st.mode === 'predict') {
          const names = ['Inside', 'On the circle', 'Outside'];
          predBtns.forEach((b, i) => { b.disabled = pd.guess != null; b.textContent = pd.guess === i ? names[i] + ' (your guess)' : names[i]; });
          nextPredB.style.display = pd.guess != null ? '' : 'none';
          nextPredB.textContent = pd.i < PRED.length - 1 ? 'Next prediction' : 'Start the predictions again';
          ro2.innerHTML = predHTML();
        } else if (st.mode === 'complete') {
          const o = cOpts(), s = cp.cs;
          eqSel.value = String(cp.ei);
          groupB.style.display = s === 0 ? '' : 'none';
          choiceB.forEach((b, i) => { const show = !!o && i < o.labels.length; b.style.display = show ? '' : 'none'; if (show) b.textContent = o.labels[i]; });
          restartB.style.display = s > 0 ? '' : 'none';
          nextEqB.style.display = s === 4 ? '' : 'none';
          ro3.innerHTML = compHTML();
        } else {
          const q = PR[pr.i], ans = pr.pick != null;
          prChoice.forEach((b, i) => {
            const show = i < q.choices.length; b.style.display = show ? '' : 'none';
            if (show) { b.textContent = q.choices[i] + (ans && i === q.ans ? '  ✓' : ans && i === pr.pick ? '  ✗' : ''); b.disabled = ans; }
          });
          prNext.style.display = ans ? '' : 'none';
          prNext.textContent = pr.over ? 'Practice again' : 'Next problem';
          ro4.innerHTML = prHTML();
        }
        redraw();
      };
      const setMode = m => {
        cancel(); st.mode = m;
        if (m === 'predict') pd.guess = null;
        sync();
      };

      gMain = group(() => {
        C.title('Explore');
        modeBtns = C.buttons([
          { label: 'Circle explorer', onClick: () => setMode('explore') },
          { label: 'Predict', onClick: () => setMode('predict') },
          { label: 'Complete the square', onClick: () => setMode('complete') }
        ]);
        small(modeBtns);

        gEx = group(() => {
          const slid = (label, key, min, max) => C.slider({ label, min, max, step: 1, value: st[key], format: v => n(Math.round(v)),
            onInput: v => { cancel(); st[key] = vis[key] = Math.round(v); sync(); } });
          hS = slid('Center x (h)', 'h', -3, 3); kS = slid('Center y (k)', 'k', -3, 3); rS = slid('Radius r', 'r', 1, 5);
          txS = slid('Test point x', 'tx', -7, 7); tyS = slid('Test point y', 'ty', -7, 7);
          triT = C.toggle({ label: 'Show the right triangle for T', value: st.tri, onChange: v => { st.tri = v; sync(); } });
          hideT = C.toggle({ label: 'Hide the equation (write it yourself first)', value: st.hideEq, onChange: v => { st.hideEq = v; sync(); } });
          chalSel = C.select({ label: 'Challenge', value: 'free', options: [{ value: 'free', label: 'Free play' }, ...CH.map((t, i) => ({ value: String(i), label: 'Build ' + eqCR(t.h, t.k, t.r * t.r) }))],
            onChange: v => {
              cancel(); st.chal = v;
              if (v !== 'free') { Object.assign(st, { h: 0, k: 0, r: 2, tx: 0, ty: 3 }); Object.assign(vis, { h: 0, k: 0, r: 2, tx: 0, ty: 3 }); }
              sync();
            } });
          ro1 = C.readout();
          C.hint('Drag C (center), the end of the violet radius, or T. They snap to whole numbers. Every drag also has a slider.');
        });

        gPred = group(() => {
          predBtns = C.buttons(['Inside', 'On the circle', 'Outside'].map((t, i) => ({ label: t, primary: true, onClick: () => { if (pd.guess == null) { pd.guess = i; sync(); } } })));
          small(predBtns);
          [nextPredB] = C.buttons([{ label: 'Next prediction', onClick: () => { pd.i = (pd.i + 1) % PRED.length; pd.guess = null; sync(); } }]); small([nextPredB]);
          ro2 = C.readout();
          C.hint('Decide first. Compare d² with r²: less than is inside, equal is on, greater is outside.');
        });

        gComp = group(() => {
          eqSel = C.select({ label: 'Equation', value: '0', options: EQS.map((e, i) => ({ value: String(i), label: gen(e.b, e.c, e.d) })),
            onChange: v => { cp.ei = +v; cp.cs = 0; cp.fb = ''; sync(); } });
          [groupB] = C.buttons([{ label: 'Group the x-terms and y-terms, move the number', primary: true, onClick: () => { cp.cs = 1; cp.fb = `${ok('Done.')} The number d moved to the other side, so it changed sign.`; sync(); } }]);
          choiceB = C.buttons([0, 1, 2, 3].map(i => ({ label: '', primary: true, onClick: () => {
            const o = cOpts(); if (!o) return;
            if (i === o.ans) { cp.cs++; cp.fb = `${ok('Right.')} ` + o.fbs[i].replace(/^Right\. /, ''); } else cp.fb = `${no('Not yet.')} ` + o.fbs[i].replace(/^Not quite\. /, '');
            sync();
          } })));
          small([groupB, ...choiceB]);
          [restartB, nextEqB] = C.buttons([{ label: 'Start over', onClick: () => { cp.cs = 0; cp.fb = ''; sync(); } }, { label: 'Next equation', primary: true, onClick: () => { cp.ei = (cp.ei + 1) % EQS.length; cp.cs = 0; cp.fb = ''; sync(); } }]);
          small([restartB, nextEqB]);
          ro3 = C.readout();
          C.hint('Why add to both sides? It keeps the equation true. Why (b/2)²? Because (x + b/2)² = x² + bx + (b/2)².');
        });
      });

      gPracStart = group(() => {
        C.title('Practice');
        const [startB] = C.buttons([{ label: `Start practice (${PR.length} problems)`, primary: true, onClick: () => { cancel(); st.mode = 'practice'; Object.assign(pr, { i: 0, pick: null, right: 0, done: 0, over: false }); sync(); } }]);
        small([startB]);
        C.hint('Fixed problems with feedback that explains why. Nothing is saved or scored.');
      });
      gPrac = group(() => {
        C.title('Practice');
        ro4 = C.readout();
        prChoice = C.buttons([0, 1, 2, 3].map(i => ({ label: '', primary: true, onClick: () => prPick(i) }))); small(prChoice);
        [prNext, prLeave] = C.buttons([{ label: 'Next problem', primary: true, onClick: prAdvance }, { label: 'Leave practice', onClick: () => { st.mode = 'explore'; sync(); } }]); small([prNext, prLeave]);
      });
      sync();

      draggable(P, {
        hit: (px, py) => {
          if (st.mode !== 'explore') return null;
          const cand = [['T', vis.tx, vis.ty, -6], ['R', vis.h + vis.r, vis.k, -3], ['C', vis.h, vis.k, 0]];
          let best = null, bd = 24;
          for (const [k, x, y, bias] of cand) { const d = Math.hypot(P.X(x) - px, P.Y(y) - py) + bias; if (d < bd) { bd = d; best = k; } }
          return best;
        },
        move: (hd, x, y) => {
          cancel();
          if (hd === 'C') { st.h = vis.h = clamp(Math.round(x), -3, 3); st.k = vis.k = clamp(Math.round(y), -3, 3); }
          else if (hd === 'R') { st.r = vis.r = clamp(Math.round(Math.hypot(x - st.h, y - st.k)), 1, 5); }
          else { st.tx = vis.tx = clamp(Math.round(x), -7, 7); st.ty = vis.ty = clamp(Math.round(y), -7, 7); }
          sync();
        }
      });

      /* ---------- guided steps ---------- */
      const apply = (patch, immediate) => {
        cancel();
        const { mode, tri, chal, pi, ei, cs, ...nums } = patch;
        if (mode !== undefined) st.mode = mode;
        if (tri !== undefined) st.tri = tri;
        if (chal !== undefined) st.chal = chal;
        if (pi !== undefined) { pd.i = pi; pd.guess = null; }
        if (ei !== undefined) { cp.ei = ei; cp.cs = cs || 0; cp.fb = ''; }
        const to = {};
        for (const k of ['h', 'k', 'r', 'tx', 'ty']) if (nums[k] !== undefined) { st[k] = to[k] = nums[k]; }
        if (immediate) Object.assign(vis, to);
        sync();
        if (!immediate && Object.keys(to).length) cancel = animateTo(vis, to, 900, redraw);
      };
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
