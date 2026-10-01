/* =====================================================================
   SCHOOL — Distance and the Pythagorean theorem
   ===================================================================== */
{
  /* ---------- number helpers ---------- */
  const sq = v => v * v;
  /* sqrt(n) = k * sqrt(m), with m as small as possible */
  const rad = n => { let k = 1, m = n; for (let i = 2; i * i <= m; i++) while (m % (i * i) === 0) { m /= i * i; k *= i; } return { k, m }; };
  const isSq = n => { const r = Math.round(Math.sqrt(n)); return r * r === n; };
  /* exact value of sqrt(n) as short text: "5", "5√2", "√41" */
  const rtxt = n => { if (n <= 0) return '0'; const { k, m } = rad(n); return m === 1 ? String(k) : (k > 1 ? k : '') + '√' + m; };
  /* full line for the readout: "√25 = 5", "√50 = 5√2 ≈ 7.07", "√41 ≈ 6.40" */
  const droot = n => {
    const { k, m } = n > 0 ? rad(n) : { k: 0, m: 1 }, dec = Math.sqrt(n).toFixed(2);
    if (m === 1) return `√${n} = ${k}`;
    return k > 1 ? `√${n} = ${k}√${m} ≈ ${dec}` : `√${n} ≈ ${dec}`;
  };
  /* label for the canvas: "5", "5√2 ≈ 7.07", "√41 ≈ 6.40" */
  const dshort = n => { const { k, m } = n > 0 ? rad(n) : { k: 0, m: 1 }; return m === 1 ? String(k) : `${k > 1 ? k : ''}√${m} ≈ ${Math.sqrt(n).toFixed(2)}`; };
  const par = v => v < 0 ? `(${num(v)})` : num(v);
  const sub = (b, a) => `${num(b)} − ${par(a)}`;
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const LT = '&lt;';
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  /* every way to write n as p² + q² with 0 <= p, q (ordered pairs) */
  const pairs2 = n => { const out = []; for (let p = 0; p * p <= n; p++) { const r = n - p * p; if (isSq(r)) out.push([p, Math.round(Math.sqrt(r))]); } return out; };
  /* every box l <= w <= h (edges 1..12) with l² + w² + h² = n */
  const triples = n => { const out = []; for (let l = 1; l <= 12; l++) for (let w = l; w <= 12; w++) { const r = n - l * l - w * w; if (r >= w * w && isSq(r) && Math.round(Math.sqrt(r)) <= 12) out.push([l, w, Math.round(Math.sqrt(r))]); } return out; };

  /* ---------- challenges ---------- */
  const PCH = { d4: { n: 16, t: 'AB = 4' }, d5: { n: 25, t: 'AB = 5' }, r13: { n: 13, t: 'AB = √13' }, r50: { n: 50, t: 'AB = √50' }, d10: { n: 100, t: 'AB = 10' } };
  const BCH = { d6: { n: 36, t: '6' }, d9: { n: 81, t: '9' }, d11: { n: 121, t: '11' } };
  const BPRE = { p122: [1, 2, 2], p236: [2, 3, 6], p3412: [3, 4, 12], p234: [2, 3, 4], p224: [2, 2, 4] };

  /* ---------- stories (multi-step contexts) ---------- */
  /* tri stages: unk 'hyp' means the unknown side is the hypotenuse, known = [leg, leg];
     unk 'leg' means the unknown is a leg, known = [leg, hypotenuse]. calc stages are plain arithmetic, run automatically. */
  const STORIES = {
    ladder: {
      name: 'A ladder on a wall',
      q: 'A 25 ft ladder leans on a wall with its foot 7 ft from the wall. Then the top slides 4 ft down the wall. How far does the foot move away from the wall?',
      stages: [
        { kind: 'tri', unk: 'leg', known: [7, 25], what: 'height', hyp: 'the ladder', unit: 'ft', ask: 'How high up the wall does the top of the ladder reach at first?' },
        { kind: 'calc', say: 'The top slides down 4 ft: 24 − 4 = 20, so it is now 20 ft up.' },
        { kind: 'tri', unk: 'leg', known: [20, 25], what: 'distance from the wall', hyp: 'the ladder', unit: 'ft', ask: 'The ladder is still 25 ft long. How far from the wall is its foot now?' },
        { kind: 'calc', say: 'The foot was 7 ft out and is now 15 ft out: 15 − 7 = 8.' }
      ],
      done: 'The foot moves out 8 ft, not 4 ft. Each position is its own right triangle.'
    },
    rod: {
      name: 'Longest rod in a box',
      q: 'The bottom of a box is 3 ft by 4 ft. The longest rod that fits inside, from a bottom corner to the opposite top corner, is 13 ft. How tall is the box?',
      stages: [
        { kind: 'tri', unk: 'hyp', known: [3, 4], what: 'base diagonal', hyp: 'the base diagonal', unit: 'ft', ask: 'First triangle: how long is the diagonal across the bottom of the box?' },
        { kind: 'tri', unk: 'leg', known: [5, 13], what: 'height', hyp: 'the rod', unit: 'ft', ask: 'Second triangle: the base diagonal, the height and the rod. How tall is the box?' }
      ],
      done: 'The box is 3 ft by 4 ft by 12 ft. Check with the space-diagonal formula: 9 + 16 + 144 = 169 = 13².'
    },
    blocks: {
      name: 'Blocks across town',
      q: 'From the library you walk 3 blocks east and 4 blocks north to the school, then 6 blocks east and 8 blocks north to the park. A drone flies straight from the library to the park. How many blocks shorter is its trip than the walk?',
      stages: [
        { kind: 'calc', say: 'In total the park is 3 + 6 = 9 blocks east and 4 + 8 = 12 blocks north of the library.' },
        { kind: 'tri', unk: 'hyp', known: [9, 12], what: 'straight flight', hyp: 'the flight', unit: 'blocks', ask: 'How long is the straight flight from the library to the park?' },
        { kind: 'calc', say: 'The walk is 3 + 4 + 6 + 8 = 21 blocks. The drone saves 21 − 15 = 6 blocks.' }
      ],
      done: 'The drone saves 6 blocks. The walk adds the two legs (21). The flight is the hypotenuse (15).'
    },
    screen: {
      name: 'Diagonal of a screen',
      q: 'A TV is sold as "40 inch", the length of the screen\'s diagonal. The screen is 32 in wide. How tall is it, and what is its area?',
      stages: [
        { kind: 'tri', unk: 'leg', known: [32, 40], what: 'height', hyp: 'the diagonal', unit: 'in', ask: 'How tall is the screen?' },
        { kind: 'calc', say: 'The screen is 32 in by 24 in, so its area is 32 × 24 = 768 square inches.' }
      ],
      done: 'The screen is 24 in tall and has an area of 768 square inches.'
    }
  };
  const triRes = g => Math.round(Math.sqrt(g.unk === 'hyp' ? sq(g.known[0]) + sq(g.known[1]) : sq(g.known[1]) - sq(g.known[0])));
  const triWork = g => {
    const [a, b] = g.known, r = triRes(g), w = cap(g.what);
    return g.unk === 'hyp'
      ? `${w}: c² = ${a}² + ${b}² = ${sq(a)} + ${sq(b)} = ${sq(a) + sq(b)}, so c = ${r} ${g.unit}.`
      : `${w}: x² + ${a}² = ${b}², so x² = ${sq(b)} − ${sq(a)} = ${sq(b) - sq(a)} and x = ${r} ${g.unit}. Check: ${a}² + ${r}² = ${sq(a)} + ${sq(r)} = ${sq(b)} = ${b}².`;
  };
  /* feedback for the wrong operation, with the numbers that show why it fails */
  const triWrong = g => {
    const [a, b] = g.known;
    if (g.unk === 'leg') {   /* the student added */
      const n = sq(a) + sq(b);
      return `${no('Not quite.')} Adding gives √(${a}² + ${b}²) = √${n} ≈ ${Math.sqrt(n).toFixed(1)} ${g.unit}, which is longer than ${g.hyp} itself (${b} ${g.unit}). A leg is always shorter than the hypotenuse, so adding cannot be right. ${cap(g.hyp)} is the hypotenuse, so the highlighted side is a leg: <b>subtract</b> the squares.`;
    }
    const hi = Math.max(a, b), lo = Math.min(a, b), n = sq(hi) - sq(lo);   /* the student subtracted */
    return `${no('Not quite.')} Subtracting gives √(${hi}² − ${lo}²) = √${n} ≈ ${Math.sqrt(n).toFixed(1)} ${g.unit}, which is shorter than a leg (${hi} ${g.unit}). The side opposite the right angle is the longest side, so subtracting cannot be right. The highlighted side is the hypotenuse: <b>add</b> the squares of the legs.`;
  };

  /* ---------- canvas helpers (pixel space) ---------- */
  const font = (size, weight = 600) => `${weight} ${size}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`;
  const T = (c, p, str, x, y, { size = 14, color, align = 'center', weight = 600, a = 1, halo = true } = {}) => {
    if (a <= .01) return;
    c.save(); c.globalAlpha *= a; c.font = font(size, weight); c.textAlign = align; c.textBaseline = 'middle';
    if (halo) { c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(str, x, y); }
    c.fillStyle = color || p.pal.text; c.fillText(str, x, y); c.restore();
  };
  const poly = (c, pts, { stroke, width = 2, fill, close = false, dash } = {}) => {
    c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); if (close) c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = width; c.setLineDash(dash || []); c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); c.setLineDash([]); }
  };
  const band = (c, p, pts, w = 13) => poly(c, pts, { stroke: alpha(p.pal.yellow, .6), width: w });
  const unitv = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  /* right-angle mark at v between the directions toward a and toward b */
  const rmark = (c, p, v, a, b, size, color) => {
    const ua = unitv(v, a), ub = unitv(v, b);
    const p1 = [v[0] + ua[0] * size, v[1] + ua[1] * size], p2 = [v[0] + ub[0] * size, v[1] + ub[1] * size];
    poly(c, [p1, [p1[0] + ub[0] * size, p1[1] + ub[1] * size], p2], { stroke: color, width: 1.8 });
  };
  /* dimension line from a to b with end ticks (the ticks cross the line, so say whether it runs vertically) */
  const dimLine = (c, a, b, color, vertical) => {
    poly(c, [a, b], { stroke: color, width: 2 });
    const t = vertical ? [[-5, 0], [5, 0]] : [[0, -5], [0, 5]];
    for (const q of [a, b]) poly(c, [[q[0] + t[0][0], q[1] + t[0][1]], [q[0] + t[1][0], q[1] + t[1][1]]], { stroke: color, width: 2 });
  };

  /* A right triangle drawn true to proportion in the rectangle r = [x, y, w, h]:
     horizontal leg a, vertical leg b, right angle at the bottom right.
     o: { a, b, la, lb, lh (labels), ca, cb, ch (colors), ua, ub, uh (this side is the unknown), title, work, dim } */
  const flatTri = (c, p, r, o) => {
    const pal = p.pal, [rx, ry, rw, rh] = r;
    const padL = 18, padR = 76, padT = 56, padB = 36;
    const aw = Math.max(20, rw - padL - padR), ah = Math.max(20, rh - padT - padB);
    const s = Math.min(aw / o.a, ah / o.b);
    const x0 = rx + padL + (aw - o.a * s) / 2, yb = ry + padT + (ah + o.b * s) / 2;
    const O = [x0, yb], Q = [x0 + o.a * s, yb], Tp = [Q[0], yb - o.b * s];
    T(c, p, o.title, rx + 12, ry + 17, { size: 12, color: pal.muted, align: 'left', weight: 600 });
    if (o.work) T(c, p, o.work, rx + 12, ry + 37, { size: 13, align: 'left' });
    c.save(); c.globalAlpha = o.dim ? .4 : 1;
    poly(c, [O, Q, Tp], { fill: alpha(pal.yellow, .18), close: true });
    if (o.ua) band(c, p, [O, Q]);
    if (o.ub) band(c, p, [Q, Tp]);
    if (o.uh) band(c, p, [O, Tp]);
    poly(c, [O, Q], { stroke: o.ca, width: 4 });
    poly(c, [Q, Tp], { stroke: o.cb, width: 4 });
    poly(c, [O, Tp], { stroke: o.ch, width: 5 });
    rmark(c, p, Q, O, Tp, Math.min(14, o.a * s / 3, o.b * s / 3), pal.text);
    const fs = 13, M = mid(O, Tp), L = Math.hypot(Tp[0] - O[0], Tp[1] - O[1]), nx = (Tp[1] - O[1]) / L, ny = -(Tp[0] - O[0]) / L;
    T(c, p, o.la, (O[0] + Q[0]) / 2, yb + 18, { size: fs, color: o.ca });
    T(c, p, o.lb, Q[0] + 12, (yb + Tp[1]) / 2, { size: fs, color: o.cb, align: 'left' });
    T(c, p, o.lh, M[0] + nx * 12, M[1] + ny * 12, { size: fs, color: o.ch, align: nx < -.3 ? 'right' : nx > .3 ? 'left' : 'center' });
    c.restore();
  };

  /* A box in oblique projection with the base-diagonal triangle and the space-diagonal triangle,
     plus the same two triangles drawn flat and true to proportion.
     g = { l, w, h } geometry; o = { lab: {l, w, h, f, d}, unk: {l, w, h, f, d}, dim1, dim2, work1, work2, cap } */
  const boxScene = (c, p, g, o) => {
    const pal = p.pal, W = p.w, Hh = p.h, land = W >= Hh * 1.1, unk = o.unk || {};
    const rb = land ? [0, 0, W * .55, Hh] : [0, 0, W, Hh * .5];
    const r1 = land ? [W * .55, 0, W * .45, Hh / 2] : [0, Hh * .5, W / 2, Hh / 2];
    const r2 = land ? [W * .55, Hh / 2, W * .45, Hh / 2] : [W / 2, Hh * .5, W / 2, Hh / 2];
    c.lineWidth = 1.5; c.strokeStyle = pal.grid; c.setLineDash([]);
    c.beginPath();
    if (land) { c.moveTo(W * .55, 0); c.lineTo(W * .55, Hh); c.moveTo(W * .55, Hh / 2); c.lineTo(W, Hh / 2); }
    else { c.moveTo(0, Hh / 2); c.lineTo(W, Hh / 2); c.moveTo(W / 2, Hh / 2); c.lineTo(W / 2, Hh); }
    c.stroke();

    /* the box */
    const kx = .46, ky = .30;
    const padX = land ? 40 : 30, padT = 44, padB = 34;
    const ewU = g.l + g.w * kx, ehU = g.h + g.w * ky;
    const sw = rb[2] - 2 * padX, sh = rb[3] - padT - padB, s0 = Math.min(sw / (12 + 12 * kx), sh / (12 + 12 * ky));
    const s = clamp(Math.min(sw / ewU, sh / ehU), s0, 2.2 * s0);   /* the biggest box fits; small boxes grow a little so they stay readable */
    const ew = ewU * s, eh = ehU * s;
    const ox = rb[0] + (rb[2] - ew) / 2, oy = rb[1] + padT + ((rb[3] - padT - padB) + eh) / 2;
    const P3 = (x, y, z) => [ox + (x + z * kx) * s, oy - (y + z * ky) * s];
    const f0 = P3(0, 0, 0), f1 = P3(g.l, 0, 0), f2 = P3(g.l, g.h, 0), f3 = P3(0, g.h, 0);
    const b0 = P3(0, 0, g.w), b1 = P3(g.l, 0, g.w), b2 = P3(g.l, g.h, g.w), b3 = P3(0, g.h, g.w);
    poly(c, [f0, f1, f2, f3], { fill: alpha(pal.blue, .07), close: true });
    poly(c, [f3, f2, b2, b3], { fill: alpha(pal.blue, .13), close: true });
    poly(c, [f1, b1, b2, f2], { fill: alpha(pal.blue, .10), close: true });
    for (const e of [[f0, b0], [b0, b1], [b0, b3]]) poly(c, e, { stroke: alpha(pal.text, .45), width: 1.6, dash: [5, 5] });
    /* the two right triangles inside the box */
    c.save(); c.globalAlpha = o.dim1 ? .4 : 1;
    poly(c, [f0, f1, b1], { fill: alpha(pal.yellow, .26), close: true });
    c.restore();
    c.save(); c.globalAlpha = o.dim2 ? .4 : 1;
    poly(c, [f0, b1, b2], { fill: alpha(pal.yellow, .18), close: true });
    c.restore();
    for (const e of [[f0, f1], [f1, f2], [f2, f3], [f3, f0], [f1, b1], [f2, b2], [f3, b3], [b1, b2], [b2, b3]]) poly(c, e, { stroke: pal.text, width: 2 });
    if (unk.f) band(c, p, [f0, b1]);
    if (unk.h) band(c, p, [b1, b2]);
    if (unk.d) band(c, p, [f0, b2]);
    if (unk.l) band(c, p, [f0, f1]);
    if (unk.w) band(c, p, [f1, b1]);
    c.save(); c.globalAlpha = o.dim1 ? .5 : 1;
    poly(c, [f0, f1], { stroke: pal.green, width: 4.5 });
    poly(c, [f1, b1], { stroke: pal.red, width: 4.5 });
    poly(c, [f0, b1], { stroke: pal.blue, width: 3.5, dash: [8, 6] });
    c.restore();
    c.save(); c.globalAlpha = o.dim2 ? .5 : 1;
    poly(c, [b1, b2], { stroke: pal.violet, width: 4.5 });
    poly(c, [f0, b2], { stroke: pal.blue, width: 5 });
    c.restore();
    rmark(c, p, f1, f0, b1, 13, pal.text);
    rmark(c, p, b1, f0, b2, 13, pal.text);
    const fs = 15, sym = (t, pt, dx, dy, col, al = 'center') => T(c, p, t, pt[0] + dx, pt[1] + dy, { size: fs, color: col, align: al });
    sym('l', mid(f0, f1), 0, 17, pal.green);
    sym('w', mid(f1, b1), 12, 6, pal.red, 'left');
    sym('h', mid(b1, b2), 12, 0, pal.violet, 'left');
    const uf = unitv(f0, b1);
    sym('f', mid(f0, b1), uf[1] * 14, -uf[0] * 14, pal.blue);
    const md = mid(f0, b2), ud = unitv(f0, b2);
    sym('d', md, ud[1] * 15 - 4, -ud[0] * 15 - 2, pal.blue);
    if (o.cap) T(c, p, o.cap, rb[0] + 28, rb[1] + 28, { size: 12, color: pal.muted, align: 'left' });

    /* the same triangles, flat */
    const lab = o.lab, f = Math.hypot(g.l, g.w);
    flatTri(c, p, r1, { a: g.l, b: g.w, la: `l = ${lab.l}`, lb: `w = ${lab.w}`, lh: `f = ${lab.f}`, ca: pal.green, cb: pal.red, ch: pal.blue,
      ua: unk.l, ub: unk.w, uh: unk.f, title: '1  Triangle on the base', work: o.work1, dim: o.dim1 });
    flatTri(c, p, r2, { a: f, b: g.h, la: `f = ${lab.f}`, lb: `h = ${lab.h}`, lh: `d = ${lab.d}`, ca: pal.blue, cb: pal.violet, ch: pal.blue,
      ua: unk.f2, ub: unk.h, uh: unk.d, title: '2  Upright triangle', work: o.work2, dim: o.dim2 });
  };

  /* ---------- story pictures ---------- */
  const ladderScene = (c, p, stage) => {
    const pal = p.pal, W = p.w, Hh = p.h, wallW = 14, gy = Hh - 98;
    const s = Math.min((W - 150) / 15.5, (gy - 50) / 25.5);
    const wx = clamp(W / 2 + 7.5 * s + 10, 15.5 * s + 30, W - 78);
    const F = ft => [wx - ft * s, gy], Tp = ht => [wx, gy - ht * s], second = stage >= 2, final = stage >= 4;
    c.fillStyle = alpha(pal['grid-strong'], .35); c.fillRect(0, gy, W, Hh - gy); c.fillRect(wx, 18, wallW, gy - 18);
    poly(c, [[0, gy], [W, gy]], { stroke: pal.text, width: 3 });
    poly(c, [[wx, gy], [wx, 18]], { stroke: pal.text, width: 3 });
    if (!second) band(c, p, [Tp(0), Tp(24)]);
    else if (stage < 3) band(c, p, [F(15), Tp(0)]);
    const lad = (ft, ht, al, dash) => {
      const A0 = F(ft), B0 = Tp(ht), u = unitv(A0, B0), n = [-u[1] * 5.5, u[0] * 5.5];
      c.save(); c.globalAlpha = al;
      for (const sg of [-1, 1]) poly(c, [[A0[0] + sg * n[0], A0[1] + sg * n[1]], [B0[0] + sg * n[0], B0[1] + sg * n[1]]], { stroke: pal.blue, width: 3.5, dash });
      for (let i = 1; i < 10; i++) { const m = [A0[0] + (B0[0] - A0[0]) * i / 10, A0[1] + (B0[1] - A0[1]) * i / 10]; poly(c, [[m[0] - n[0], m[1] - n[1]], [m[0] + n[0], m[1] + n[1]]], { stroke: pal.blue, width: 2 }); }
      c.restore();
    };
    if (second) lad(7, 24, .35, [6, 6]); else lad(7, 24, 1);
    if (second) lad(15, 20, 1);
    rmark(c, p, [wx, gy], [wx - 30, gy], [wx, gy - 30], 14, pal.text);
    const A0 = second ? F(15) : F(7), B0 = second ? Tp(20) : Tp(24), u = unitv(A0, B0), m0 = mid(A0, B0);
    T(c, p, '25 ft', m0[0] + u[1] * 24, m0[1] - u[0] * 24, { size: 14, color: pal.blue });
    /* vertical dimension line on the right of the wall */
    const vx = wx + wallW + 10;
    if (!second) {
      dimLine(c, [vx, gy], [vx, Tp(24)[1]], pal.yellow, true);
      T(c, p, '? ft', vx + 9, (gy + Tp(24)[1]) / 2, { size: 14, color: pal.yellow, align: 'left', weight: 700 });
    } else {
      dimLine(c, [vx, gy], [vx, Tp(24)[1]], pal.muted, true);
      dimLine(c, [vx, gy], [vx, Tp(20)[1]], pal.muted, true);
      T(c, p, '20 ft', vx + 9, (gy + Tp(20)[1]) / 2, { size: 14, align: 'left' });
      T(c, p, '4 ft', vx + 9, (Tp(20)[1] + Tp(24)[1]) / 2, { size: 13, color: pal.violet, align: 'left' });
    }
    /* horizontal dimension lines under the ground */
    const hd = (ft0, ft1, y, txt, col, bold) => {
      dimLine(c, [F(ft0)[0], y], [F(ft1)[0], y], col, false);
      T(c, p, txt, (F(ft0)[0] + F(ft1)[0]) / 2, y + 15, { size: 14, color: col === pal.muted ? pal.text : col, weight: bold ? 700 : 600 });
    };
    hd(7, 0, gy + 14, '7 ft', pal.muted);
    if (second) hd(15, 0, gy + 44, stage >= 3 ? '15 ft' : '? ft', stage >= 3 ? pal.muted : pal.yellow, stage < 3);
    if (final) hd(15, 7, gy + 74, 'foot moves 8 ft', pal.violet);
  };

  const blocksScene = (c, p, stage) => {
    const pal = p.pal, W = p.w, Hh = p.h, EW = 9, NH = 12, hypKnown = stage >= 2;
    const u = Math.min((W - 136) / EW, (Hh - 110) / NH);
    const ox = 70 + (W - 136 - EW * u) / 2, oy = Math.min(Hh - 50, Hh / 2 + NH * u / 2 + 8);
    const X = x => ox + x * u, Y = y => oy - y * u;
    c.lineWidth = 1; c.strokeStyle = pal.grid; c.beginPath();
    for (let i = 0; i <= EW; i++) { c.moveTo(X(i), Y(0)); c.lineTo(X(i), Y(NH)); }
    for (let j = 0; j <= NH; j++) { c.moveTo(X(0), Y(j)); c.lineTo(X(EW), Y(j)); }
    c.stroke();
    poly(c, [[X(0), Y(0)], [X(3), Y(0)], [X(3), Y(4)], [X(9), Y(4)], [X(9), Y(12)]], { stroke: pal.muted, width: 3 });
    const O = [X(0), Y(0)], Pk = [X(9), Y(12)];
    poly(c, [O, [X(9), Y(0)], Pk], { fill: alpha(pal.yellow, .14), close: true });
    if (!hypKnown) band(c, p, [O, Pk]);
    poly(c, [O, Pk], { stroke: pal.blue, width: 4, dash: [9, 7] });
    /* totals as dimension lines */
    dimLine(c, [X(0), Y(0) + 18], [X(9), Y(0) + 18], pal.green, false);
    T(c, p, '9 blocks east', X(4.5), Y(0) + 34, { size: 14, color: pal.green });
    dimLine(c, [X(9) + 18, Y(0)], [X(9) + 18, Y(12)], pal.red, true);
    c.save(); c.translate(X(9) + 34, Y(6)); c.rotate(-Math.PI / 2);
    T(c, p, '12 blocks north', 0, 0, { size: 14, color: pal.red });
    c.restore();
    for (const [x, y, nm, al, dx, dy] of [[0, 0, 'Library', 'right', -12, 0], [3, 4, 'School', 'right', -12, 0], [9, 12, 'Park', 'right', -12, -2]]) {
      c.beginPath(); c.arc(X(x), Y(y), 6.5, 0, TAU); c.fillStyle = pal.stage; c.fill(); c.lineWidth = 3; c.strokeStyle = pal.text; c.stroke();
      T(c, p, nm, X(x) + dx, Y(y) + dy, { size: 14, align: al });
    }
    const mh = mid(O, Pk), uh = unitv(O, Pk);
    T(c, p, hypKnown ? '15 blocks' : '? blocks', mh[0] + uh[1] * 40 - 8, mh[1] - uh[0] * 40, { size: 15, color: hypKnown ? pal.blue : pal.yellow, weight: 700 });
    if (stage >= 3) T(c, p, 'walk: 21 blocks', X(6), Y(4) + 17, { size: 13, color: pal.muted });
  };

  const screenScene = (c, p, stage) => {
    const pal = p.pal, W = p.w, Hh = p.h, A = 32, B = 24, hKnown = stage >= 1;
    const s = Math.min((W - 96) / A, (Hh - 150) / B);
    const x0 = 24 + (W - 24 - 64 - A * s) / 2, y1 = (Hh - B * s) / 2 - 8, xr = x0 + A * s, yb = y1 + B * s;
    if (stage >= 2) poly(c, [[x0, y1], [xr, y1], [xr, yb], [x0, yb]], { fill: alpha(pal.yellow, .12), close: true });
    poly(c, [[x0, yb], [xr, yb], [xr, y1]], { fill: alpha(pal.yellow, .2), close: true });
    if (!hKnown) band(c, p, [[xr, yb], [xr, y1]]);
    poly(c, [[x0, y1], [xr, y1], [xr, yb], [x0, yb]], { stroke: pal.text, width: 5, close: true });
    poly(c, [[x0, yb], [xr, yb]], { stroke: pal.green, width: 4 });
    poly(c, [[xr, yb], [xr, y1]], { stroke: pal.red, width: 4 });
    poly(c, [[x0, yb], [xr, y1]], { stroke: pal.blue, width: 5 });
    rmark(c, p, [xr, yb], [x0, yb], [xr, y1], 15, pal.text);
    const mdp = mid([x0, yb], [xr, y1]), ud = unitv([x0, yb], [xr, y1]);
    T(c, p, '40 in', mdp[0] + ud[1] * 22, mdp[1] - ud[0] * 22, { size: 15, color: pal.blue });
    T(c, p, '32 in', (x0 + xr) / 2, yb + 24, { size: 15, color: pal.green });
    T(c, p, hKnown ? '24 in' : '? in', xr + 16, (yb + y1) / 2, { size: 15, color: hKnown ? pal.red : pal.yellow, align: 'left', weight: hKnown ? 600 : 700 });
    if (stage >= 2) T(c, p, '32 × 24 = 768 in²', x0 + A * s * .36, y1 + B * s * .2, { size: 14 });
  };

  register({
    id: 'distance-and-the-pythagorean-theorem', level: 'school',
    title: 'Distance and the Pythagorean theorem',
    blurb: 'Drag two points, then step into a box and a story, and find every distance with the Pythagorean theorem.',
    thumb(c, p) {
      const pal = p.pal; p.cx = -.5; p.cy = 1; p.span = 6.6;
      p.grid(1);
      const sqr = (pts, col) => p.path(pts, { fill: alpha(pal.yellow, .2), stroke: col, width: 1.8, close: true });
      sqr([[-2, -1], [1, -1], [1, -4], [-2, -4]], pal.green);
      sqr([[1, -1], [1, 3], [5, 3], [5, -1]], pal.red);
      sqr([[-2, -1], [1, 3], [-3, 6], [-6, 2]], pal.blue);
      p.path([[-2, -1], [1, -1], [1, 3]], { fill: alpha(pal.blue, .18), close: true });
      p.path([[-2, -1], [1, -1]], { stroke: pal.green, width: 3 });
      p.path([[1, -1], [1, 3]], { stroke: pal.red, width: 3 });
      p.path([[-2, -1], [1, 3]], { stroke: pal.blue, width: 3 });
      p.dot(-2, -1, 4.5, pal.stage, pal.brass, 2); p.dot(1, 3, 4.5, pal.stage, pal.brass, 2);
    },
    hook: String.raw`A taxi has to follow the streets, but a drone flies straight. Two places are 5 blocks east and 12 blocks north apart. How much shorter is the drone's trip, and how can you know without measuring it?`,
    steps: [
      { title: 'Along a row or column: subtract',
        text: String.raw`<p>A and B share a row, so the distance is how far apart their x-coordinates are: \(|3-(-4)| = 7\). Count the 7 unit steps.</p><p>Drag B along the row, or into A's column. Then you subtract y-coordinates instead. Try the <b>Challenge</b> menu: place B so that AB = 4.</p>`,
        set: { mode: 'plane', ax: -4, ay: 2, bx: 3, by: 2, sq: false, chal: 'free' } },
      { title: 'Any two points: build a right triangle',
        text: String.raw`<p>Now A and B are in different rows and columns. A horizontal leg from A and a vertical leg up to B meet at \((1,-1)\) in a right angle.</p><p>The legs are \(|\Delta x| = 3\) (green) and \(|\Delta y| = 4\) (red). Their squares add up: \(9+16=25\), so \(d=\sqrt{25}=5\).</p><p>Drag B anywhere, or pick a <b>Challenge</b>.</p>`,
        set: { mode: 'plane', ax: -2, ay: -1, bx: 1, by: 3, sq: true, chal: 'free' } },
      { title: 'A box needs two triangles',
        text: String.raw`<p>The longest rod in a box runs from a bottom corner to the opposite top corner. It is the long side of a right triangle that lies on no face.</p><p>Triangle 1 is on the base: \(f^2=3^2+4^2=25\), so \(f=5\). Triangle 2 stands upright with legs \(f=5\) and \(h=12\): \(d^2=25+144=169\), so \(d=13\).</p><p>Try another box.</p>`,
        set: { mode: 'box', l: 3, w: 4, h: 12, bchal: 'free' } },
      { title: 'A story with two triangles',
        text: String.raw`<p>A 25 ft ladder leans on a wall, foot 7 ft away. The top slides 4 ft down. How far does the foot move?</p><p>The yellow side is the unknown. Is it a leg or the hypotenuse? Choose <b>Add squares</b> or <b>Subtract squares</b>. A wrong choice shows why it fails.</p>`,
        set: { mode: 'story', story: 'ladder' } }
    ],
    formal: String.raw`
      <p><b>Goal.</b> Find a length that is not given: the distance between two points, the diagonal of a box, an unknown side in a story. The tool is the Pythagorean theorem for a right triangle with legs \(a,b\) and hypotenuse \(c\):
      \[ a^2+b^2=c^2. \]</p>
      <h3>Distance on a line</h3>
      <p>Points with the same y-coordinate lie on a horizontal line, and their distance is the difference of their x-coordinates. Points with the same x-coordinate lie on a vertical line, so subtract the y-coordinates. A distance is never negative and does not depend on which point you name first, so use the absolute value:
      \[ d=|x_2-x_1| \quad\text{or}\quad d=|y_2-y_1|. \]
      For \((-4,2)\) and \((3,2)\): \(d=|3-(-4)|=7\).</p>
      <h3>The distance formula</h3>
      <p>Let \(A=(x_1,y_1)\) and \(B=(x_2,y_2)\) be in different rows and columns. The point \(C=(x_2,y_1)\) is in A's row and B's column. So \(AC\) is horizontal, \(CB\) is vertical, and the angle at \(C\) is a right angle. By the previous section \(AC=|x_2-x_1|\) and \(CB=|y_2-y_1|\). The Pythagorean theorem for triangle \(ACB\) gives
      \[ d^2=|x_2-x_1|^2+|y_2-y_1|^2=(x_2-x_1)^2+(y_2-y_1)^2, \qquad d=\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}. \]
      Squaring removes the sign, so the order of the points does not matter. If the points share a row or a column, one leg is \(0\) and the formula agrees with plain subtraction.
      For \((-2,-1)\) and \((1,3)\): \(d=\sqrt{3^2+4^2}=\sqrt{25}=5\).</p>
      <h3>Answers that are not whole numbers</h3>
      <p>When \(d^2\) is not a perfect square, \(d\) is irrational. Give the exact value with a radical, and a decimal if you need one. To simplify a radical, pull out the largest perfect-square factor:
      \[ \sqrt{50}=\sqrt{25\cdot 2}=\sqrt{25}\,\sqrt{2}=5\sqrt{2}\approx 7.07. \]
      For \((1,1)\) and \((6,6)\) both legs are \(5\), so \(d=\sqrt{25+25}=\sqrt{50}=5\sqrt2\). Some radicals do not simplify: \(41\) has no square factor, so \(\sqrt{41}\approx 6.40\) is as simple as it gets. Keep the radical until the last step so that rounding does not pile up.</p>
      <h3>Finding a leg</h3>
      <p>If you know the hypotenuse \(c\) and one leg \(a\), the other leg satisfies \(b^2=c^2-a^2\). Subtract the squares, then take the root:
      \[ b=\sqrt{c^2-a^2}. \]
      A 13 ft ladder with its foot 5 ft from a wall reaches \(\sqrt{169-25}=\sqrt{144}=12\) ft up the wall. Adding by mistake gives \(\sqrt{169+25}=\sqrt{194}\approx 13.9\), a leg longer than the whole ladder, which cannot happen.</p>
      <h3>Distance in space: the box</h3>
      <p>A box has length \(l\), width \(w\) and height \(h\). The longest straight rod inside runs from one corner to the opposite corner, and two right triangles find it. The diagonal \(f\) of the base is the hypotenuse of a triangle with legs \(l\) and \(w\):
      \[ f^2=l^2+w^2. \]
      The vertical edge of length \(h\) is perpendicular to the base, so it is perpendicular to \(f\). Then \(f\) and \(h\) are the legs of a second right triangle, and its hypotenuse is the space diagonal \(d\):
      \[ d^2=f^2+h^2=l^2+w^2+h^2, \qquad d=\sqrt{l^2+w^2+h^2}. \]
      The number \(f^2\) is a whole number even when \(f\) is irrational, so you can use \(f^2\) directly in the second step. Whole-number boxes: \(1,2,2\) gives \(3\); \(2,3,6\) gives \(7\); \(3,4,12\) gives \(13\). For \(2,3,4\): \(d=\sqrt{4+9+16}=\sqrt{29}\approx 5.39\).</p>
      <h3>A multi-step story</h3>
      <p>A 25 ft ladder has its foot 7 ft from a wall. Its top slides down 4 ft. How far does the foot move? Draw each position as its own right triangle.</p>
      <ol>
        <li>Height at first: \(\sqrt{25^2-7^2}=\sqrt{576}=24\) ft.</li>
        <li>Height after the slide: \(24-4=20\) ft.</li>
        <li>Foot's distance now: \(\sqrt{25^2-20^2}=\sqrt{225}=15\) ft.</li>
        <li>Movement of the foot: \(15-7=8\) ft.</li>
      </ol>
      <p>The foot moves 8 ft, not 4 ft. Check each triangle by putting the answer back into \(a^2+b^2=c^2\): \(7^2+24^2=625=25^2\) and \(15^2+20^2=625=25^2\).</p>
      <h3>Is it a right triangle? The converse</h3>
      <p>If the sides of a triangle satisfy \(a^2+b^2=c^2\), with \(c\) the longest side, then the angle opposite \(c\) is a right angle. For \(7,24,25\): \(49+576=625=25^2\), so it is a right triangle. For \(5,6,8\): \(25+36=61\), but \(8^2=64\), so it is not.</p>
      <h3>Does the answer make sense?</h3>
      <p>The hypotenuse is longer than each leg but shorter than the two legs added, because a straight path beats a detour:
      \[ \max(a,b) &lt; c &lt; a+b. \]
      For the drone, 5 blocks east and 12 north is a 17-block walk and a 13-block flight, and \(12 &lt; 13 &lt; 17\). For a box, \(d\) is longer than every edge and shorter than \(l+w+h\). A leg that comes out longer than the hypotenuse means you added when you should have subtracted.</p>`,
    check: [
      { q: String.raw`What is the distance between \((-4,3)\) and \((5,-9)\)?`,
        choices: ['3', '21', '15', '225'], answer: 2,
        why: String.raw`The legs are \(|5-(-4)|=9\) and \(|-9-3|=12\). Then \(d^2=81+144=225\), so \(d=15\). The answer 21 adds the legs, which is the walk along the grid. The answer 3 subtracts them. The answer 225 is \(d^2\), with no square root.`,
        hint: String.raw`Find the horizontal and vertical gaps, square both, add, then take a square root.` },
      { q: String.raw`What is the length of the longest rod that fits inside a box that is \(4\) by \(5\) by \(20\)?`,
        choices: ['29', 'about 20.4', '441', '21'], answer: 3,
        why: String.raw`The base diagonal has \(f^2=4^2+5^2=41\). The rod has \(d^2=41+20^2=441\), so \(d=21\). The answer 29 adds the edges. The answer 20.4 uses only the 4 and the 20, so it ignores the 5. The answer 441 is \(d^2\).`,
        hint: String.raw`Use two right triangles, or \(d=\sqrt{l^2+w^2+h^2}\).` }
    ],
    links: { related: ['pythagorean-theorem', 'square-roots-and-irrational-numbers', 'slope-and-linear-functions', 'the-unit-circle-and-trig-waves'] },

    mount({ stage, controls: C }) {
      const MODES = ['plane', 'box', 'story'];
      const st = { mode: 'plane', ax: -4, ay: 2, bx: 3, by: 2, sq: false, chal: 'free', l: 3, w: 4, h: 12, bchal: 'free' };
      const vis = { ax: st.ax, ay: st.ay, bx: st.bx, by: st.by, l: st.l, w: st.w, h: st.h };
      const found = { p: [], b: [] };
      const fld = { fx: 10, fy: 6 };
      let sy = { id: 'ladder', stage: 0, fb: '', start: 0 };
      let cancel = () => {};
      let sqT, chalSel, lS, wS, hS, bchalSel, storySel, addB, subB, resetB;
      const P = new Plane(stage, { span: 8 });

      /* ---------- story progress ---------- */
      const advance = () => { const S = STORIES[sy.id].stages; while (sy.stage < S.length && S[sy.stage].kind === 'calc') sy.stage++; };
      const startStory = id => { sy = { id, stage: 0, fb: '', start: 0 }; advance(); sy.start = sy.stage; };
      startStory('ladder');

      /* ---------- drawing ---------- */
      const clampPts = () => {
        let ch = false;
        for (const [k, lim] of [['ax', fld.fx], ['bx', fld.fx], ['ay', fld.fy], ['by', fld.fy]]) {
          const v = clamp(st[k], -lim, lim);
          if (v !== st[k]) { st[k] = v; ch = true; }
          vis[k] = clamp(vis[k], -lim, lim);
        }
        return ch;
      };

      const planeScene = (c, p) => {
        const pal = p.pal, land = p.w >= p.h * 1.15, fx = land ? (p.w >= p.h * 1.5 ? 10 : 8) : 6, fy = land ? 6 : 9;
        fld.fx = fx; fld.fy = fy;
        const sc0 = Math.min(p.w / (2 * fx + 3.2), p.h / (2 * fy + 3.2));
        p.span = Math.min(p.w, p.h) / (2 * sc0); p.cx = 0; p.cy = 0;
        const sc = p.scale;
        if (clampPts()) upd();
        const x0 = -fx - .5, x1 = fx + .5, y0 = -fy - .5, y1 = fy + .5;
        c.lineWidth = 1; c.strokeStyle = pal.grid; c.beginPath();
        for (let x = -fx; x <= fx; x++) { c.moveTo(p.X(x), p.Y(y0)); c.lineTo(p.X(x), p.Y(y1)); }
        for (let y = -fy; y <= fy; y++) { c.moveTo(p.X(x0), p.Y(y)); c.lineTo(p.X(x1), p.Y(y)); }
        c.stroke();
        p.path([[x0, 0], [x1, 0]], { stroke: pal['grid-strong'], width: 2 });
        p.path([[0, y0], [0, y1]], { stroke: pal['grid-strong'], width: 2 });
        p.path([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], { stroke: pal['grid-strong'], width: 1.5, close: true });
        const stepT = sc >= 22 ? 1 : 2, tf = clamp(sc * .3, 11, 14);
        for (let x = -fx; x <= fx; x += stepT) T(c, p, num(x), p.X(x), p.Y(y0) + 13, { size: tf, color: pal.muted, halo: false, weight: 500 });
        for (let y = -fy; y <= fy; y += stepT) T(c, p, num(y), p.X(x0) - 8, p.Y(y), { size: tf, color: pal.muted, align: 'right', halo: false, weight: 500 });

        const A = [vis.ax, vis.ay], B = [vis.bx, vis.by], Cc = [vis.bx, vis.ay];
        const dxs = B[0] - A[0], dys = B[1] - A[1], adx = Math.abs(dxs), ady = Math.abs(dys);
        const same = st.ax === st.bx && st.ay === st.by, lineCase = st.ax === st.bx || st.ay === st.by;
        const sxs = Math.sign(dxs) || 1, sys = Math.sign(dys) || 1;
        const dxi = Math.abs(st.bx - st.ax), dyi = Math.abs(st.by - st.ay), d2 = dxi * dxi + dyi * dyi;
        const fs = clamp(sc * .34, 12, 16), px = pt => [p.X(pt[0]), p.Y(pt[1])];
        /* labels register their boxes so the point names can pick a free spot */
        const boxes = [], tw = (str, size) => { c.save(); c.font = font(size); const w = c.measureText(str).width; c.restore(); return w; };
        const rectOf = (str, x, y, size, align) => { const w = tw(str, size); return [(align === 'left' ? x : align === 'right' ? x - w : x - w / 2) - 2, y - size * .6, w + 4, size * 1.2]; };
        const overlap = (a, b) => Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]));
        const put = (str, x, y, o) => { boxes.push(rectOf(str, x, y, o.size || 14, o.align || 'center')); T(c, p, str, x, y, o); };
        const segBoxes = (P0, Q0) => {
          const a = px(P0), b = px(Q0), n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 8));
          for (let i = 0; i <= n; i++) boxes.push([lerp(a[0], b[0], i / n) - 4, lerp(a[1], b[1], i / n) - 4, 8, 8]);
        };
        const pLo = p.X(x0) + 4, pHi = p.X(x1) - 4, pTop = p.Y(y1) + 3, pBot = p.Y(y0) - 3;
        /* draw the label at the first candidate spot that stays on the paper and clear of other labels (candidates are in order of preference) */
        const pick = (str, o, cands) => {
          const sc2 = cands.map(([x, y, align], i) => {
            const r = rectOf(str, x, y, o.size, align), out = r[0] < pLo || r[0] + r[2] > pHi || r[1] < pTop || r[1] + r[3] > pBot ? 5000 : 0;
            return { x, y, align, r, score: out + boxes.reduce((a, b) => a + overlap(r, b), 0) + i * 12 };
          }).sort((a, b) => a.score - b.score)[0];
          boxes.push(sc2.r); T(c, p, str, sc2.x, sc2.y, { ...o, align: sc2.align });
        };

        if (st.sq && !lineCase) {
          c.save(); c.beginPath(); c.rect(p.X(x0), p.Y(y1), p.X(x1) - p.X(x0), p.Y(y0) - p.Y(y1)); c.clip();
          let nx = -dys, ny = dxs;
          if (nx * (Cc[0] - A[0]) + ny * (Cc[1] - A[1]) > 0) { nx = -nx; ny = -ny; }
          const sqs = [
            { pts: [A, Cc, [Cc[0], Cc[1] - sys * adx], [A[0], A[1] - sys * adx]], col: pal.green, txt: `${dxi}² = ${dxi * dxi}`, short: String(dxi * dxi), side: dxi },
            { pts: [Cc, B, [B[0] + sxs * ady, B[1]], [Cc[0] + sxs * ady, Cc[1]]], col: pal.red, txt: `${dyi}² = ${dyi * dyi}`, short: String(dyi * dyi), side: dyi },
            { pts: [A, B, [B[0] + nx, B[1] + ny], [A[0] + nx, A[1] + ny]], col: pal.blue, txt: `d² = ${d2}`, short: String(d2), side: Math.sqrt(d2) }
          ];
          for (const q of sqs) p.path(q.pts, { fill: alpha(pal.yellow, .14), stroke: alpha(q.col, .9), width: 2.2, close: true });
          for (const q of sqs) for (let k = 0; k < 4; k++) segBoxes(q.pts[k], q.pts[(k + 1) % 4]);
          c.restore();
          for (const q of sqs) {
            const cx = clamp(q.pts.reduce((s, v) => s + v[0], 0) / 4, -fx + 1.2, fx - 1.2), cy = clamp(q.pts.reduce((s, v) => s + v[1], 0) / 4, -fy + .8, fy - .8);
            T(c, p, q.side * sc >= 76 ? q.txt : q.short, p.X(cx), p.Y(cy), { size: fs + 1, color: q.col, weight: 700 });
          }
        }
        if (!lineCase) {
          p.path([A, Cc, B], { fill: alpha(pal.yellow, .2), close: true });
          p.path([A, Cc], { stroke: pal.green, width: 4.5 });
          p.path([Cc, B], { stroke: pal.red, width: 4.5 });
          p.path([A, B], { stroke: pal.blue, width: 4.5 });
          const m = Math.min(.42, adx / 3, ady / 3);
          p.path([[Cc[0] - sxs * m, Cc[1]], [Cc[0] - sxs * m, Cc[1] + sys * m], [Cc[0], Cc[1] + sys * m]], { stroke: pal.text, width: 1.8 });
          /* with the squares on, the leg lengths sit inside the triangle, away from the squares */
          const side = st.sq ? -1 : 1;
          segBoxes(A, Cc); segBoxes(Cc, B); segBoxes(A, B);
          const lx = !st.sq && adx * sc >= 76 ? `|Δx| = ${dxi}` : String(dxi), ly = !st.sq && ady * sc >= 24 ? `|Δy| = ${dyi}` : String(dyi);
          const hx = p.X((A[0] + Cc[0]) / 2), hy = p.Y(A[1]) + side * (sys > 0 ? 19 : -19), vx = p.X(Cc[0]) + side * (sxs > 0 ? 11 : -11), vy = p.Y((Cc[1] + B[1]) / 2);
          const vAl = (sxs > 0) === (side > 0) ? 'left' : 'right';
          pick(lx, { size: fs, color: pal.green }, [[hx, hy, 'center'], [hx, 2 * p.Y(A[1]) - hy, 'center']]);
          pick(ly, { size: fs, color: pal.red }, [[vx, vy, vAl], [2 * p.X(Cc[0]) - vx, vy, vAl === 'left' ? 'right' : 'left']]);
          const mh = px([(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]);
          let nx = -dys, ny = dxs;
          if (nx * (Cc[0] - A[0]) + ny * (Cc[1] - A[1]) > 0) { nx = -nx; ny = -ny; }
          const nl = Math.hypot(nx, ny) || 1, qx = nx / nl, qy = -ny / nl;   /* unit normal in pixels, pointing away from the corner */
          const dl = (sg, t) => {
            const m = [lerp(p.X(A[0]), p.X(B[0]), t), lerp(p.Y(A[1]), p.Y(B[1]), t)];
            return Math.abs(qx) > .3 ? [m[0] + sg * qx * 13, m[1] + sg * qy * 5, sg * qx > 0 ? 'left' : 'right'] : [m[0] + sg * qx * 20, m[1] + sg * qy * 20, 'center'];
          };
          pick(`d = ${dshort(d2)}`, { size: fs + 1, color: pal.blue }, [dl(1, .5), dl(-1, .5), dl(1, .3), dl(1, .7), dl(-1, .3), dl(-1, .7)]);
        } else if (!same) {
          p.path([A, B], { stroke: pal.blue, width: 4.5 });
          segBoxes(A, B);
          const horiz = st.ay === st.by, n = horiz ? dxi : dyi;
          for (let i = 0; i <= n; i++) {
            const q = [A[0] + dxs * i / n, A[1] + dys * i / n], tk = horiz ? [[q[0], q[1] - .12], [q[0], q[1] + .12]] : [[q[0] - .12, q[1]], [q[0] + .12, q[1]]];
            p.path(tk, { stroke: pal.blue, width: 2 });
            if (i > 0 && sc >= 20) {
              const q2 = [A[0] + dxs * (i - .5) / n, A[1] + dys * (i - .5) / n];
              put(String(i), p.X(q2[0]) + (horiz ? 0 : 13), p.Y(q2[1]) + (horiz ? 15 : 0), { size: fs - 1, color: pal.muted, weight: 500, align: horiz ? 'center' : 'left' });
            }
          }
          const mh = px([(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]);
          if (horiz) put(`d = ${n}`, mh[0], mh[1] - 22, { size: fs + 2, color: pal.blue });
          else put(`d = ${n}`, mh[0] - 14, mh[1], { size: fs + 2, color: pal.blue, align: 'right' });
        }
        /* handles and names: try right, left, above, below and keep the freest spot, preferring the side away from the other point */
        const lo = pLo, hi = pHi, top = pTop, bot = pBot;
        for (const P0 of [A, B]) { const q = px(P0); boxes.push([q[0] - 11, q[1] - 11, 22, 22]); }
        const name = (P0, other, str) => {
          const pp = px(P0), w = tw(str, fs), u = same ? [P0 === A ? -1 : 1, 0] : unitv(px(other), pp);
          const cands = [[1, 0], [-1, 0], [0, -1], [0, 1]].map(([dx, dy]) => {
            const x = dx ? pp[0] + dx * 16 : clamp(pp[0], lo + w / 2, hi - w / 2), y = pp[1] + dy * 24, align = dx > 0 ? 'left' : dx < 0 ? 'right' : 'center';
            const r = rectOf(str, x, y, fs, align);
            const out = r[0] < lo || r[0] + r[2] > hi || r[1] < top || r[1] + r[3] > bot ? 5000 : 0;
            return { x, y, align, r, score: out + boxes.reduce((a, b) => a + overlap(r, b), 0) + (1 - (dx * u[0] + dy * u[1])) * 40 + (dy ? 14 : 0) };
          }).sort((a, b) => a.score - b.score);
          boxes.push(cands[0].r); return cands[0];
        };
        const nameA = `A (${num(st.ax)}, ${num(st.ay)})`, nameB = `B (${num(st.bx)}, ${num(st.by)})`;
        const la = name(A, B, nameA), lb = name(B, A, nameB);
        T(c, p, nameA, la.x, la.y, { size: fs, align: la.align });
        T(c, p, nameB, lb.x, lb.y, { size: fs, align: lb.align });
        p.dot(A[0], A[1], 9, pal.stage, pal.brass, 3.5);
        p.dot(B[0], B[1], 9, pal.stage, pal.brass, 3.5);
      };

      const boxModeOpts = () => {
        const n1 = sq(st.l) + sq(st.w), n2 = n1 + sq(st.h);
        return { lab: { l: String(st.l), w: String(st.w), h: String(st.h), f: rtxt(n1), d: rtxt(n2) },
          work1: `f² = ${st.l}² + ${st.w}² = ${n1}`, work2: `d² = ${n1} + ${st.h}² = ${n2}`, cap: `Box ${st.l} × ${st.w} × ${st.h}` };
      };
      const rodOpts = () => {
        const s = sy.stage, fK = s >= 1, hK = s >= 2;
        return { lab: { l: '3', w: '4', h: hK ? '12' : '?', f: fK ? '5' : '?', d: '13' },
          unk: { f: s === 0, f2: false, h: s === 1 },
          dim2: s === 0, work1: fK ? 'f² = 3² + 4² = 25' : 'f² = 3² + 4²', work2: hK ? 'h² = 13² − 5² = 144' : 'h² = 13² − f²', cap: 'Box 3 × 4 × ?  (rod 13)' };
      };
      P.onDraw = (c, p) => {
        if (st.mode === 'plane') planeScene(c, p);
        else if (st.mode === 'box') boxScene(c, p, vis, boxModeOpts());
        else if (sy.id === 'rod') boxScene(c, p, { l: 3, w: 4, h: 12 }, rodOpts());
        else if (sy.id === 'ladder') ladderScene(c, p, sy.stage);
        else if (sy.id === 'blocks') blocksScene(c, p, sy.stage);
        else screenScene(c, p, sy.stage);
      };

      /* ---------- readout ---------- */
      const planeHTML = () => {
        const { ax, ay, bx, by } = st, dx = Math.abs(bx - ax), dy = Math.abs(by - ay), n = dx * dx + dy * dy, out = [];
        out.push(`<span class="k">A</span> (${num(ax)}, ${num(ay)}) &nbsp; <span class="k">B</span> (${num(bx)}, ${num(by)})`);
        if (n === 0) out.push('A and B are the same point, so the distance is 0.');
        else if (dx === 0 || dy === 0) {
          const horiz = dy === 0, len = horiz ? dx : dy;
          out.push(`<span class="k">Same ${horiz ? `row (y = ${num(ay)})` : `column (x = ${num(ax)})`}</span>`);
          out.push(`<span class="k">Distance</span> d = |${horiz ? sub(bx, ax) : sub(by, ay)}| = ${len}`);
          out.push(`Subtract the ${horiz ? 'x' : 'y'}-coordinates. The other leg is 0, so the formula agrees: √(${len}² + 0²) = ${len}.`);
        } else {
          out.push(`<span class="k">Horizontal leg</span> |Δx| = |${sub(bx, ax)}| = ${dx}`);
          out.push(`<span class="k">Vertical leg</span> |Δy| = |${sub(by, ay)}| = ${dy}`);
          out.push(`<span class="k">Squares</span> ${dx}² + ${dy}² = ${dx * dx} + ${dy * dy} = ${n}`);
          out.push(`<span class="k">Distance</span> d = ${droot(n)}`);
          out.push(`<span class="k">Check</span> ${Math.max(dx, dy)} ${LT} ${num(Math.sqrt(n))} ${LT} ${dx + dy} (longest leg ${LT} d ${LT} sum of legs)`);
        }
        const T0 = PCH[st.chal];
        if (T0) {
          const key = dx + ',' + dy, all = pairs2(T0.n), hit = n === T0.n, list = a => a.map(k => `(${k.replace(',', ', ')})`).join(' ');
          if (hit && !found.p.includes(key)) found.p.push(key);
          let m = `<span class="k">Challenge</span> Place B so that ${T0.t}.<br>`;
          if (hit) {
            m += `${ok('Yes.')} ${dx}² + ${dy}² = ${n}, so AB = ${droot(n)}. `;
            m += found.p.length === all.length
              ? `You found all ${all.length} ways to split ${n} into two squares: ${list(found.p)}. Those are the only whole-number leg pairs.`
              : `That is ${found.p.length} of ${all.length} leg pairs (|Δx|, |Δy|): ${list(found.p)}. Try a different pair of legs.`;
          } else {
            m += `Legs ${dx} and ${dy} give ${dx}² + ${dy}² = ${n}, but you need ${T0.n}. ` +
              (n < T0.n ? 'The squares add up to too little: lengthen a leg.' : 'The squares add up to too much: shorten a leg.');
            if (!found.p.length) m += ' Which two square numbers (0 counts) add up to ' + T0.n + '?';
          }
          out.push(m);
        }
        return out.join('<br>');
      };

      const boxHTML = () => {
        const { l, w, h } = st, n1 = l * l + w * w, n2 = n1 + h * h, out = [];
        out.push(`<span class="k">Box</span> l = ${l}, w = ${w}, h = ${h}`);
        out.push(`<span class="k">1. Base</span> f² = ${l}² + ${w}² = ${l * l} + ${w * w} = ${n1}<br>&nbsp;&nbsp;&nbsp;f = ${droot(n1)}`);
        out.push(`<span class="k">2. Space</span> d² = f² + h² = ${n1} + ${h}² = ${n1} + ${h * h} = ${n2}<br>&nbsp;&nbsp;&nbsp;d = ${droot(n2)}`);
        out.push(`<span class="k">One step</span> d² = l² + w² + h² = ${l * l} + ${w * w} + ${h * h} = ${n2}`);
        out.push(`<span class="k">Check</span> ${Math.max(l, w, h)} ${LT} ${num(Math.sqrt(n2))} ${LT} ${l + w + h} (longest edge ${LT} d ${LT} sum of edges)`);
        const T0 = BCH[st.bchal];
        if (T0) {
          const key = [l, w, h].sort((a, b) => a - b).join(','), all = triples(T0.n), hit = n2 === T0.n, list = a => a.map(k => `${k.replace(/,/g, ' × ')}`).join(', ');
          if (hit && !found.b.includes(key)) found.b.push(key);
          let m = `<span class="k">Challenge</span> Find a box whose longest rod is exactly ${T0.t}.<br>`;
          if (hit) {
            m += `${ok('Yes.')} ${l * l} + ${w * w} + ${h * h} = ${n2} = ${Math.round(Math.sqrt(n2))}². `;
            m += all.length === 1 ? 'It is the only box with whole-number edges up to 12.'
              : found.b.length === all.length ? `You found all ${all.length} boxes with edges up to 12: ${list(found.b)}.`
              : `That is ${found.b.length} of ${all.length} boxes with edges up to 12 (${list(found.b)}). Find another.`;
          } else {
            m += `Now l² + w² + h² = ${n2}, but you need ${T0.n} (${T0.t}² = ${T0.n}). ` +
              (n2 < T0.n ? 'The squares add up to too little: lengthen an edge.' : 'The squares add up to too much: shorten an edge.');
          }
          out.push(m);
        }
        return out.join('<br>');
      };

      const storyHTML = () => {
        const S = STORIES[sy.id], out = [`<b>${S.name}</b><br>${S.q}`];
        const work = S.stages.slice(0, sy.stage).map(g => g.kind === 'tri' ? triWork(g) : g.say);
        if (work.length) out.push(`<span class="k">Working</span><br>` + work.join('<br>'));
        if (sy.fb) out.push(sy.fb);
        if (sy.stage < S.stages.length) out.push(`<span class="k">Next</span> ${S.stages[sy.stage].ask}<br>The yellow side is the unknown. Choose the operation that finds it.`);
        else out.push(`${ok('Answer.')} ${S.done}`);
        return out.join('<br>');
      };
      const upd = () => { ro.innerHTML = st.mode === 'plane' ? planeHTML() : st.mode === 'box' ? boxHTML() : storyHTML(); };

      /* ---------- controls ---------- */
      const probe = C.readout(), host = probe.parentElement; probe.remove();
      const group = build => {
        const before = new Set(host.children); build();
        const g = h('div', { style: 'display:flex;flex-direction:column;gap:16px;flex:none' });
        [...host.children].filter(e => !before.has(e)).forEach(e => g.append(e));
        host.append(g); return g;
      };
      const redraw = () => P.draw();
      const sync = () => {
        modeBtns.forEach((b, i) => { b.className = MODES[i] === st.mode ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', MODES[i] === st.mode); });
        gPlane.style.display = st.mode === 'plane' ? 'flex' : 'none';
        gBox.style.display = st.mode === 'box' ? 'flex' : 'none';
        gStory.style.display = st.mode === 'story' ? 'flex' : 'none';
        sqT.checked = st.sq; chalSel.value = st.chal; bchalSel.value = st.bchal; storySel.value = sy.id;
        lS.set(st.l); wS.set(st.w); hS.set(st.h);
        const fin = sy.stage >= STORIES[sy.id].stages.length;
        addB.disabled = subB.disabled = fin;
        resetB.style.display = sy.stage === sy.start && !sy.fb ? 'none' : '';
        if (P.coordEl) P.coordEl.style.display = st.mode === 'plane' ? '' : 'none';
        redraw(); upd();
      };
      const setMode = m => { cancel(); st.mode = m; sync(); };

      C.title('Explore');
      const modeBtns = C.buttons([
        { label: 'Plane', onClick: () => setMode('plane') },
        { label: '3D box', onClick: () => setMode('box') },
        { label: 'Stories', onClick: () => setMode('story') }
      ]);

      const gPlane = group(() => {
        sqT = C.toggle({ label: 'Show squares on the sides', value: st.sq, onChange: v => { st.sq = v; redraw(); } });
        chalSel = C.select({ label: 'Challenge', value: 'free', options: [{ value: 'free', label: 'Free play' }, ...Object.entries(PCH).map(([k, v]) => ({ value: k, label: 'Place B so that ' + v.t }))],
          onChange: v => {
            cancel(); st.chal = v; found.p = [];
            if (v !== 'free') { Object.assign(st, { ax: -3, ay: -2, bx: -1, by: -1 }); Object.assign(vis, { ax: -3, ay: -2, bx: -1, by: -1 }); }
            sync();
          } });
        C.hint('Drag A and B. They snap to whole numbers.');
      });

      const gBox = group(() => {
        const sl = (label, key) => C.slider({ label, min: 1, max: 12, step: 1, value: st[key], format: v => String(Math.round(v)),
          onInput: v => { cancel(); st[key] = Math.round(v); vis[key] = st[key]; if (BPRE[st.bchal]) st.bchal = 'free'; redraw(); upd(); bchalSel.value = st.bchal; } });
        lS = sl('Length l', 'l'); wS = sl('Width w', 'w'); hS = sl('Height h', 'h');
        bchalSel = C.select({ label: 'Try a box', value: 'free', options: [{ value: 'free', label: 'Free play' },
          ...Object.entries(BPRE).map(([k, v]) => ({ value: k, label: 'Preset: ' + v.join(' × ') })),
          ...Object.entries(BCH).map(([k, v]) => ({ value: k, label: 'Challenge: longest rod exactly ' + v.t }))],
          onChange: v => {
            cancel(); st.bchal = v; found.b = [];
            const to = BPRE[v] ? BPRE[v] : BCH[v] ? [2, 3, 4] : null;
            if (to) {
              const [l, w, hh] = to;
              Object.assign(st, { l, w, h: hh });
              if (BCH[v]) Object.assign(vis, { l, w, h: hh }); else cancel = animateTo(vis, { l, w, h: hh }, 600, redraw);
            }
            sync();
          } });
        C.hint('Edges are whole numbers from 1 to 12.');
      });

      const gStory = group(() => {
        storySel = C.select({ label: 'Pick a story', value: sy.id, options: Object.entries(STORIES).map(([k, v]) => ({ value: k, label: v.name })),
          onChange: v => { cancel(); startStory(v); sync(); } });
        [addB, subB, resetB] = C.buttons([
          { label: 'Add squares', primary: true, onClick: () => choose('add') },
          { label: 'Subtract squares', primary: true, onClick: () => choose('sub') },
          { label: 'Start over', onClick: () => { startStory(sy.id); sync(); } }
        ]);
        for (const b of [addB, subB, resetB]) Object.assign(b.style, { padding: '6px 14px', minHeight: '36px', fontSize: '.88rem' });
        C.hint('Is the yellow side a leg or the hypotenuse? That decides whether you add or subtract.');
      });
      const choose = op => {
        const S = STORIES[sy.id], g = S.stages[sy.stage];
        if (!g) return;
        if ((g.unk === 'hyp') === (op === 'add')) {
          sy.stage++; advance();
          sy.fb = `${ok('Right.')} ` + (g.unk === 'hyp' ? 'The unknown side is the hypotenuse, so you add the squares of the legs.' : `The unknown side is a leg and ${g.hyp} is the hypotenuse, so you subtract.`);
        } else sy.fb = triWrong(g);
        sync();
      };

      const ro = C.readout();
      sync();

      draggable(P, {
        hit: (px, py) => {
          if (st.mode !== 'plane') return null;
          const dA = Math.hypot(P.X(vis.ax) - px, P.Y(vis.ay) - py), dB = Math.hypot(P.X(vis.bx) - px, P.Y(vis.by) - py);
          return dB <= 24 && dB <= dA ? 'B' : dA <= 24 ? 'A' : null;
        },
        move: (hd, x, y) => {
          cancel();
          const nx = clamp(Math.round(x), -fld.fx, fld.fx), ny = clamp(Math.round(y), -fld.fy, fld.fy);
          if (hd === 'A') { st.ax = vis.ax = nx; st.ay = vis.ay = ny; } else { st.bx = vis.bx = nx; st.by = vis.by = ny; }
          redraw(); upd();
        }
      });

      /* ---------- guided steps ---------- */
      const apply = (patch, immediate) => {
        cancel();
        const { mode, sq: sqv, chal, bchal, story, ...nums } = patch;
        if (mode !== undefined) st.mode = mode;
        if (sqv !== undefined) st.sq = sqv;
        if (chal !== undefined) { st.chal = chal; found.p = []; }
        if (bchal !== undefined) { st.bchal = bchal; found.b = []; }
        if (story !== undefined) startStory(story);
        const to = {};
        for (const k of ['ax', 'ay', 'bx', 'by', 'l', 'w', 'h']) if (nums[k] !== undefined) { st[k] = to[k] = nums[k]; }
        if (immediate) Object.assign(vis, to);
        sync();
        if (!immediate && Object.keys(to).length) cancel = animateTo(vis, to, 900, redraw);
      };
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
