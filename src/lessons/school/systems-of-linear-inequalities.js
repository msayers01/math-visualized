/* =====================================================================
   SCHOOL — Systems of linear inequalities
   ===================================================================== */
{
  const MI = '−';
  const kk = t => `<span class="k">${t}</span>`;
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const LET = ['A', 'B', 'C', 'D'];
  const cols = pal => [pal.blue, pal.red, pal.green, pal.yellow];

  /* ---------- inequalities ----------
     I(left text, left form [a,b,k], op, right text, right form) with form value a*x + b*y + k.
     n is the region written as n . (x, y, 1) >= 0 (or > 0 when strict). */
  const ev = (f, x, y) => f[0] * x + f[1] * y + f[2];
  const I = (lt, lf, op, rt, rf) => {
    const s = (op === '>' || op === '≥') ? 1 : -1;
    return { lt, lf, op, rt, rf, strict: op === '>' || op === '<', n: [0, 1, 2].map(i => (lf[i] - rf[i]) * s + 0) };
  };
  const holds = (q, x, y) => { const v = ev(q.n, x, y); return q.strict ? v > 1e-9 : v > -1e-9; };
  const txt = q => `${q.lt} ${q.op} ${q.rt}`;
  const cst = q => q.rf[0] === 0 && q.rf[1] === 0;
  /* one sentence that tests the point (x, y) in inequality q */
  const test = (q, x, y) => {
    const L = ev(q.lf, x, y), R = ev(q.rf, x, y), ok = holds(q, x, y), eq = Math.abs(L - R) < 1e-9;
    let s = `${q.lt} is ${num(L)} and ${cst(q) ? 'the limit' : q.rt} is ${num(R)}, so ${num(L)} ${q.op} ${num(R)} is ${ok ? good('true') : bad('false')}.`;
    if (eq && q.strict) s += ' Equal is not enough: this symbol has no "or equal" part.';
    if (eq && !q.strict) s += ' Equal counts here: this symbol has an "or equal" part.';
    return { ok, s };
  };

  /* ---------- geometry ---------- */
  const rectOf = b => [[b.x0 - .5, b.y0 - .5], [b.x1 + .5, b.y0 - .5], [b.x1 + .5, b.y1 + .5], [b.x0 - .5, b.y1 + .5]];
  const clip = (poly, q) => {
    const n = q.n, out = [];
    for (let i = 0; i < poly.length; i++) {
      const A = poly[i], B = poly[(i + 1) % poly.length], da = ev(n, A[0], A[1]), db = ev(n, B[0], B[1]);
      const ia = da >= -1e-9, ib = db >= -1e-9;
      if (ia) out.push(A);
      if (ia !== ib) { const t = da / (da - db); out.push([A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])]); }
    }
    return out;
  };
  const meet = cons => b => cons.reduce(clip, rectOf(b));
  /* classify a clipped polygon: empty, a point, a segment, or an area */
  const shape = poly => {
    const pts = [];
    poly.forEach(q => { if (!pts.some(r => Math.hypot(r[0] - q[0], r[1] - q[1]) < 1e-6)) pts.push(q); });
    if (!pts.length) return { kind: 'empty', pts };
    if (pts.length === 1) return { kind: 'point', pts };
    let area = 0;
    for (let i = 0; i < pts.length; i++) { const A = pts[i], B = pts[(i + 1) % pts.length]; area += A[0] * B[1] - B[0] * A[1]; }
    if (Math.abs(area) / 2 < 1e-6) {
      let best = [pts[0], pts[1]], d = -1;
      for (const A of pts) for (const B of pts) { const e = Math.hypot(A[0] - B[0], A[1] - B[1]); if (e > d) { d = e; best = [A, B]; } }
      return { kind: 'segment', pts: best };
    }
    return { kind: 'area', pts, area: Math.abs(area) / 2 };
  };
  /* the line n . (x, y, 1) = 0 across the visible box */
  const lineAcross = (q, b) => {
    const [a, c, k] = q.n;
    if (Math.abs(c) > 1e-9) return [[b.x0 - 1, -(a * (b.x0 - 1) + k) / c], [b.x1 + 1, -(a * (b.x1 + 1) + k) / c]];
    return [[-k / a, b.y0 - 1], [-k / a, b.y1 + 1]];
  };
  /* corners: crossing points of pairs of boundary lines that satisfy every constraint */
  const cornersOf = cons => {
    const out = [];
    for (let i = 0; i < cons.length; i++) for (let j = i + 1; j < cons.length; j++) {
      const [a1, b1, k1] = cons[i].n, [a2, b2, k2] = cons[j].n, d = a1 * b2 - a2 * b1;
      if (Math.abs(d) < 1e-9) continue;
      const x = (-k1 * b2 + k2 * b1) / d + 0, y = (-a1 * k2 + a2 * k1) / d + 0;
      if (!cons.every(q => ev(q.n, x, y) > -1e-9)) continue;
      if (out.some(o => Math.abs(o.x - x) < 1e-7 && Math.abs(o.y - y) < 1e-7)) continue;
      out.push({ x, y, i, j });
    }
    if (out.length > 2) {
      const mx = out.reduce((s, o) => s + o.x, 0) / out.length, my = out.reduce((s, o) => s + o.y, 0) / out.length;
      out.sort((u, v) => Math.atan2(u.y - my, u.x - mx) - Math.atan2(v.y - my, v.x - mx));
    } else out.sort((u, v) => u.x - v.x || u.y - v.y);
    return out;
  };
  const shadeAll = (p, cons, al, rect) => { const pal = p.pal, C = cols(pal); cons.forEach((q, i) => p.path(clip(rect, q), { fill: alpha(C[i % 4], al), close: true })); };
  const paintSol = (p, sh, al = .42) => {
    const pal = p.pal;
    if (sh.kind === 'area') p.path(sh.pts, { fill: alpha(pal.violet, al), close: true });
    else if (sh.kind === 'segment') p.path(sh.pts, { stroke: pal.violet, width: 8 });
    else if (sh.kind === 'point') p.dot(sh.pts[0][0], sh.pts[0][1], 9, pal.violet, pal.stage, 2.5);
  };
  const drawLines = (p, cons, names) => {
    const pal = p.pal, C = cols(pal), b = p.bounds();
    cons.forEach((q, i) => {
      const L = lineAcross(q, b);
      p.path(L, { stroke: C[i % 4], width: 3.4, dash: q.strict ? [11, 8] : undefined });
      if (names) {
        const t = [.2, .8, .5, .65][i % 4], ax = L[0][0] + (L[1][0] - L[0][0]) * t, ay = L[0][1] + (L[1][1] - L[0][1]) * t;
        const inside = ax > b.x0 + .6 && ax < b.x1 - .6 && ay > b.y0 + .6 && ay < b.y1 - .6;
        if (inside) p.label(names[i], ax, ay, { size: 20, italic: false, color: C[i % 4], dy: -14, dx: 10 });
      }
    });
  };
  const legend = (p, rows) => {
    const c = p.ctx, pal = p.pal, fs = clamp(p.scale * .55, 13, 17), lh = fs * 1.5, pad = 8;
    c.font = `500 ${fs}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`; c.textAlign = 'left'; c.textBaseline = 'middle';
    const wd = Math.max(...rows.map(r => c.measureText(r[1]).width)) + 16 + pad * 2.4;
    c.fillStyle = alpha(pal.stage, .92); c.fillRect(6, 6, wd, rows.length * lh + pad); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1; c.strokeRect(6.5, 6.5, wd, rows.length * lh + pad);
    rows.forEach((r, i) => {
      const y = 6 + pad / 2 + lh * (i + .5);
      if (r[0]) { c.fillStyle = r[0]; c.fillRect(6 + pad, y - 5, 12, 10); }
      c.fillStyle = pal.text; c.fillText(r[1], 6 + pad * 1.4 + (r[0] ? 14 : 0), y);
    });
  };
  /* labels pushed away from the middle of the corners, so they sit outside the shape */
  const cornerLabels = (p, V, textOf) => {
    const mx = V.reduce((s, o) => s + p.X(o.x), 0) / (V.length || 1), my = V.reduce((s, o) => s + p.Y(o.y), 0) / (V.length || 1);
    V.forEach((v, i) => {
      let ux = p.X(v.x) - mx, uy = p.Y(v.y) - my, n = Math.hypot(ux, uy);
      if (V.length < 2 || n < 1) { ux = 1; uy = -1; n = 1.41; }
      const t = textOf(v, i), wpx = t.length * 4.6;
      p.label(t, v.x, v.y, { size: 16, italic: false, dx: ux / n * (14 + wpx), dy: uy / n * 18, color: p.pal.text });
    });
  };
  const axisNames = (p, xs = 'x', ys = 'y') => {
    const b = p.bounds(), pal = p.pal;
    p.label(xs, b.x1 - .5, 0, { size: 21, color: pal.muted, dy: -16 }); p.label(ys, 0, b.y1 - .5, { size: 21, color: pal.muted, dx: 14 });
  };

  /* ---------- systems for the explore parts ---------- */
  const Y = [0, 1, 0], X = [1, 0, 0], K = v => [0, 0, v];
  const SYS = [
    { name: 'y > x − 1 and y ≤ −x + 5', q: [I('y', Y, '>', 'x − 1', [1, 0, -1]), I('y', Y, '≤', '−x + 5', [-1, 0, 5])], kind: 'region', pts: [[3, 2]] },
    { name: 'y ≥ 2x − 3 and y < −x + 6', q: [I('y', Y, '≥', '2x − 3', [2, 0, -3]), I('y', Y, '<', '−x + 6', [-1, 0, 6])], kind: 'region', pts: [[3, 3]] },
    { name: 'x + y ≤ 6 and 2x + y ≥ 8', q: [I('x + y', [1, 1, 0], '≤', '6', K(6)), I('2x + y', [2, 1, 0], '≥', '8', K(8))], kind: 'region', pts: [[2, 4]] },
    { name: 'No overlap: y > x + 2 and y < x − 1', q: [I('y', Y, '>', 'x + 2', [1, 0, 2]), I('y', Y, '<', 'x − 1', [1, 0, -1])], kind: 'none', ans: 3, tag: 'No solution',
      why: 'Both boundary lines have slope 1, so they are parallel. A wants the points above the upper line y = x + 2. B wants the points below the lower line y = x − 1. No point is above the upper line and below the lower line at once, so the shadings never overlap.' },
    { name: 'Unbounded: x ≥ 1 and y ≥ 2', q: [I('x', X, '≥', '1', K(1)), I('y', Y, '≥', '2', K(2))], kind: 'open', pts: [[1, 2]], ans: 1, tag: 'Unbounded region, corner included',
      why: 'The two shadings overlap in a corner shape that never closes: x can grow as large as you like, and so can y. The region has one corner, (1, 2), and both lines are solid, so the corner is a solution.' },
    { name: 'Open corner: x > 1 and y > 2', q: [I('x', X, '>', '1', K(1)), I('y', Y, '>', '2', K(2))], kind: 'open', pts: [[1, 2]], ans: 1, tag: 'Unbounded region, corner NOT included',
      why: 'The overlap is the same corner shape as before, and it goes on forever. But both lines are dashed, so the boundary is not included. The corner (1, 2) sits on both dashed lines, so it is NOT a solution of the system.' },
    { name: 'A segment: x ≥ 0, y ≥ 0, x + y ≤ 4, x + y ≥ 4', q: [I('x', X, '≥', '0', K(0)), I('y', Y, '≥', '0', K(0)), I('x + y', [1, 1, 0], '≤', '4', K(4)), I('x + y', [1, 1, 0], '≥', '4', K(4))], kind: 'seg', pts: [[0, 4], [4, 0]], ans: 2, tag: 'A line segment',
      why: 'x + y ≤ 4 keeps the points on or below the line x + y = 4. x + y ≥ 4 keeps the points on or above it. Only the line itself is in both. x ≥ 0 and y ≥ 0 cut that line to the piece from (0, 4) to (4, 0): a segment, with its two end points.' },
    { name: 'A point: x ≥ 4, y ≥ 0, x + y ≤ 4', q: [I('x', X, '≥', '4', K(4)), I('y', Y, '≥', '0', K(0)), I('x + y', [1, 1, 0], '≤', '4', K(4))], kind: 'pt', pts: [[4, 0]], ans: 2, tag: 'A single point',
      why: 'x ≥ 4 and y ≥ 0 force x + y to be at least 4. The third inequality says x + y is at most 4. So x + y must be exactly 4, and that is only possible at x = 4, y = 0. The whole solution is the single point (4, 0).' }
  ];
  const PRED = ['A region with an inside that closes up on every side', 'A region that goes on forever', 'Only a line segment or a single point', 'No common points at all'];

  /* ---------- the build menu (also the bakery limits) ---------- */
  const KM = [I('x', X, '≥', '0', K(0)), I('y', Y, '≥', '0', K(0)), I('x + y', [1, 1, 0], '≤', '6', K(6)), I('2x + y', [2, 1, 0], '≤', '8', K(8))];
  const KE = KM.map(q => `${q.lt} = ${q.rt}`);
  const KA = [[1, 0, 0], [0, 1, 0], [1, 1, 6], [2, 1, 8]];
  const eqTxt = e => { const t = (c, v) => (c === 0 ? '' : (Math.abs(c) === 1 ? '' : Math.abs(c)) + v); const a = t(e[0], 'x'), b = t(e[1], 'y'); return (a && b ? `${e[0] < 0 ? MI : ''}${a} + ${b}` : a || b) + ' = ' + e[2]; };
  const letter = i => 'ABCDEFGH'[i];

  /* ---------- profit enrichment ---------- */
  const PF = (x, y) => 3 * x + 2 * y;

  /* ---------- the bakery story ---------- */
  const PH = {
    cf: { t: 'A cake uses 2 cups of flour.', what: 'the flour one cake uses (2 cups)' },
    pf: { t: 'A pie uses 1 cup of flour.', what: 'the flour one pie uses (1 cup)' },
    ft: { t: 'She has 8 cups of flour.', what: 'the flour she has (8 cups)' },
    ch: { t: 'A cake takes 1 hour in the oven', what: 'the oven time one cake takes (1 hour)' },
    ph: { t: 'and a pie takes 1 hour.', what: 'the oven time one pie takes (1 hour)' },
    ot: { t: 'The oven is free for 6 hours.', what: 'the hours the oven is free (6 hours)' }
  };
  const STORY = ['Maya bakes cakes and pies for the school sale. ', 'cf', ' ', 'pf', ' ', 'ft', ' ', 'ch', ' ', 'ph', ' ', 'ot', ' How many of each can she bake?'];
  const UNK = [
    ['the number of cakes she bakes', 'This is one of the two things she chooses and we do not know it yet.'],
    ['the number of pies she bakes', 'This is the other thing she chooses and we do not know it yet.'],
    ['the cups of flour in her bag', 'The story tells us: 8 cups. A number we are given is not an unknown.'],
    ['the hours the oven is free', 'The story tells us: 6 hours. A number we are given is not an unknown.'],
    ['the cups of flour in one cake', 'The story tells us: 2 cups. A number we are given is not an unknown.']
  ];
  const BEQ = [
    { name: 'Flour', slots: ['cf', 'pf', 'ft'], co: [2, 1, 8], asks: ['the number in front of x: the cups of flour one cake uses', 'the number in front of y: the cups of flour one pie uses', 'the limit on the right: the cups of flour she has'], q: I('2x + y', [2, 1, 0], '≤', '8', K(8)), unit: 'cups of flour', lim: 'The flour she has', word: 'cups' },
    { name: 'Oven time', slots: ['ch', 'ph', 'ot'], co: [1, 1, 6], asks: ['the number in front of x: the hours one cake takes', 'the number in front of y: the hours one pie takes', 'the limit on the right: the hours the oven is free'], q: I('x + y', [1, 1, 0], '≤', '6', K(6)), unit: 'hours of oven time', lim: 'The oven time', word: 'hours' }
  ];
  const symOpts = (u, lim) => [
    ['≤', true, `${lim} is a limit, not a target. She may use up to the limit, or less, so the total can be equal to it or smaller: ≤. A solid boundary line.`],
    ['<', false, 'That would forbid using the whole limit. But using all of it is allowed (the bag can be empty), so the boundary line must be included. Use ≤, not <.'],
    ['≥', false, 'That says she must use at least the limit. But the limit is the most she has, so the total must be at or below it.'],
    ['=', false, 'That says she must use exactly the limit. The story only says she cannot go over it. Using less is fine, and an inequality allows that.']
  ];

  /* ---------- practice problems ---------- */
  const evalE = (e, x, y) => e[0] * x + e[1] * y;
  const PV1 = { cx: 2.5, cy: 2.5, span: 6.5 };
  const PROBS = [
    { kind: 'pts', q: 'A system is  y ≥ x − 1  and  x + y < 6. Which point is a solution of BOTH inequalities?',
      cons: [I('y', Y, '≥', 'x − 1', [1, 0, -1]), I('x + y', [1, 1, 0], '<', '6', K(6))], view: PV1, cands: [[5, 1], [3, 2], [3, 3], [0, -2]], ans: 1, note: {} },
    { kind: 'graphs', q: 'A system is  y ≥ x − 1  (solid line)  and  y < 3  (dashed line). Which graph shows its solution?', ans: 2,
      vs: [
        { cons: [I('y', Y, '≤', 'x − 1', [1, 0, -1]), I('y', Y, '<', '3', K(3))], fb: 'This graph shades BELOW the slanted line, but y ≥ x − 1 means y is at least x − 1, which is the side ABOVE the line.' },
        { cons: [I('y', Y, '≥', 'x − 1', [1, 0, -1]), I('y', Y, '≤', '3', K(3))], fb: 'The side is right, but the flat line is solid here. The symbol in y < 3 is strict, so points with y = 3 are NOT included: that line must be dashed.' },
        { cons: [I('y', Y, '≥', 'x − 1', [1, 0, -1]), I('y', Y, '<', '3', K(3))], fb: 'Above the solid slanted line (y ≥ x − 1) and below the dashed flat line (y < 3). Both sides and both line styles match.' },
        { cons: [I('y', Y, '≥', 'x − 1', [1, 0, -1]), I('y', Y, '>', '3', K(3))], fb: 'The slanted line is right, but this graph shades ABOVE the flat line. y < 3 means y is less than 3, the side BELOW the line.' }] },
    { kind: 'vertex', q: 'The region is x ≥ 0, y ≥ 0, x + y ≤ 5 and x + 2y ≤ 8. One corner is where the lines x + y = 5 and x + 2y = 8 cross. Which point is that corner?',
      cons: [I('x', X, '≥', '0', K(0)), I('y', Y, '≥', '0', K(0)), I('x + y', [1, 1, 0], '≤', '5', K(5)), I('x + 2y', [1, 2, 0], '≤', '8', K(8))],
      eq: [['x + y', [1, 1], 5], ['x + 2y', [1, 2], 8]], view: { cx: 3, cy: 3, span: 5.2 }, cands: [[3, 2], [1, 4], [2, 3], [4, 1]], ans: 2,
      right: 'Subtract the first equation from the second: (x + 2y) − (x + y) = 8 − 5, so y = 3. Then x + 3 = 5, so x = 2. Both lines go through (2, 3).' },
    { kind: 'none', q: 'Which of these systems has NO solution?', ans: 2,
      vs: [
        { t: 'y > x + 1 and y < x + 4', cons: [I('y', Y, '>', 'x + 1', [1, 0, 1]), I('y', Y, '<', 'x + 4', [1, 0, 4])], fb: 'This one has solutions: the strip between the two parallel lines. For example (0, 2) works, since 2 > 1 and 2 < 4.' },
        { t: 'y ≥ x and y ≤ x', cons: [I('y', Y, '≥', 'x', [1, 0, 0]), I('y', Y, '≤', 'x', [1, 0, 0])], fb: 'This one has solutions: the points with y = x. For example (1, 1) works, since 1 ≥ 1 and 1 ≤ 1. Two shadings that meet only along a solid line still share that line.' },
        { t: 'y > x + 1 and y < x − 1', cons: [I('y', Y, '>', 'x + 1', [1, 0, 1]), I('y', Y, '<', 'x − 1', [1, 0, -1])], fb: 'Both lines have slope 1, so they are parallel. y > x + 1 is above the line y = x + 1, and y < x − 1 is below the lower line y = x − 1. Nothing is above the upper line and below the lower line at once.' },
        { t: 'x > 1 and y > 1', cons: [I('x', X, '>', '1', K(1)), I('y', Y, '>', '1', K(1))], fb: 'This one has solutions: every point to the right of x = 1 and above y = 1. For example (2, 2) works.' }] },
    { kind: 'pts', ctx: true, q: 'A coach can buy at most 8 balls and can spend at most $36. Soccer balls (x) cost $4 and basketballs (y) cost $6. The limits are x + y ≤ 8 and 4x + 6y ≤ 36, with x ≥ 0 and y ≥ 0. Only whole numbers of balls make sense. Which plan is allowed?',
      cons: [I('x + y', [1, 1, 0], '≤', '8', K(8)), I('4x + 6y', [4, 6, 0], '≤', '36', K(36)), I('x', X, '≥', '0', K(0)), I('y', Y, '≥', '0', K(0))],
      view: { cx: 4.5, cy: 4.5, span: 6.2 }, cands: [[3, 5], [2.5, 4], [6, 2], [5, 4]], ans: 2, lattice: true, units: ['soccer balls', 'basketballs'],
      note: { '2.5,4': 'It passes both inequalities (6.5 ≤ 8 and 34 ≤ 36), but 2.5 soccer balls is not a whole number, so it is not a plan you can carry out.' } },
    { kind: 'write', q: 'The graph shows a shaded region. The slanted boundary y = x − 2 is dashed. The flat boundary y = 3 is solid. The point T = (1, 1) is inside the shading. Which system does the graph show?',
      cons: [I('y', Y, '>', 'x − 2', [1, 0, -2]), I('y', Y, '≤', '3', K(3))], view: { cx: 2, cy: 1.5, span: 6.5 }, ans: 1,
      names: ['y = x − 2 (dashed)', 'y = 3 (solid)'],
      opts: [
        ['y ≥ x − 2 and y ≤ 3', 'The flat line and its side are right, but the slanted line is dashed on the graph. Dashed means the boundary is NOT included, so the symbol must be > with no "or equal".'],
        ['y > x − 2 and y ≤ 3', 'Test T = (1, 1): 1 > −1 is true (the slanted line at x = 1 has y = −1) and 1 ≤ 3 is true. The dashed line gives >, the solid line gives ≤, and T is in both shadings.'],
        ['y < x − 2 and y ≤ 3', 'Test T = (1, 1): is 1 < −1? No, so T is not in this system. The shading is above the slanted line, which needs >.'],
        ['y > x − 2 and y ≥ 3', 'Test T = (1, 1): is 1 ≥ 3? No, so T is not in this system. The shading is below the flat line, which needs ≤ (solid).']] },
    { kind: 'max', q: 'The region is x ≥ 0, y ≥ 0, 2x + y ≤ 10 and x + y ≤ 7. Its corners are (0, 0), (5, 0), (3, 4) and (0, 7). The profit is P = 4x + 3y. Which corner gives the largest profit?',
      cons: [I('x', X, '≥', '0', K(0)), I('y', Y, '≥', '0', K(0)), I('2x + y', [2, 1, 0], '≤', '10', K(10)), I('x + y', [1, 1, 0], '≤', '7', K(7))],
      view: { cx: 3.5, cy: 3.8, span: 5.6 }, pf: (x, y) => 4 * x + 3 * y, pfT: '4x + 3y', corners: [[0, 0], [5, 0], [3, 4], [0, 7]],
      ch: ['(0, 7), P = 21', '(3, 4), P = 24', '(5, 7), P = 41', '(5, 0), P = 20'], ans: 1,
      fbs: ['4(0) + 3(7) = 21. That is a good corner, but (3, 4) gives 24, which is more. Check every corner before you decide.',
        'Test each corner: (0, 0) gives 0, (5, 0) gives 20, (3, 4) gives 24, (0, 7) gives 21. The largest is 24 at (3, 4). The best value of a straight-line profit is at a corner of the region.',
        'The numbers 5 and 7 are the biggest x and y you saw, but (5, 7) is not in the region: 2(5) + 7 = 17 is more than 10. A corner must satisfy every inequality.',
        '4(5) + 3(0) = 20. It is a corner, but (3, 4) gives 24, which is more.'] }
  ];

  const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
  const pt = (x, y) => `(${num(x)}, ${num(y)})`;

  register({
    id: 'systems-of-linear-inequalities', level: 'school',
    title: 'Systems of linear inequalities',
    blurb: 'Shade two or more inequalities at once: the solution is where every shading overlaps, with corners you can find by solving.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 2.5; p.cy = 2.5; p.span = 4.4;
      p.grid(1, { axes: false });
      const b = p.bounds(), R = rectOf(b), A = SYS[0].q[0], B = SYS[0].q[1];
      p.path(clip(R, A), { fill: alpha(pal.blue, .24), close: true });
      p.path(clip(R, B), { fill: alpha(pal.red, .24), close: true });
      paintSol(p, shape(clip(clip(R, A), B)), .4);
      p.path(lineAcross(A, b), { stroke: pal.blue, width: 3, dash: [9, 7] });
      p.path(lineAcross(B, b), { stroke: pal.red, width: 3 });
      p.dot(3, 2, 6, pal.stage, pal.violet, 3);
    },
    hook: String.raw`One inequality shades half the plane. What if two rules must be true at the same time? Where do you stand if you must be on the correct side of both lines, and what if there is no such place?`,
    steps: [
      { title: 'Where the shadings overlap',
        text: String.raw`<p>Inequality <b>A</b> is blue: \(y>x-1\). Inequality <b>B</b> is red: \(y\le -x+5\). A dashed line is not included, a solid line is.</p><p>Where the colors mix, in violet, both are true. That overlap is the <b>solution</b> of the system. The test point \(P=(2,2)\) is in both. Drag it into only blue, only red, and neither.</p>`,
        set: { part: 'overlap', sys: 0, tx: 2, ty: 2 } },
      { title: 'Build a region and find its corners',
        text: String.raw`<p>Three limits, \(x\ge 0\), \(y\ge 0\) and \(x+y\le 6\), make a triangle: 3 corners, area 18.</p><p>Switch on \(2x+y\le 8\). It cuts the triangle down to 4 corners and area 14. A <b>corner</b> (vertex) is where two boundary lines cross. Pick a corner and find it by solving its two boundary equations.</p>`,
        set: { part: 'build', on: [1, 1, 1, 0] } },
      { title: 'Special cases',
        text: String.raw`<p>Predict first: do \(y>x+2\) and \(y&lt;x-1\) overlap at all? Then see.</p><p>Use the menu to try more: a region that goes on forever, a corner that is left out, and shadings that meet only in a line segment or a single point.</p>`,
        set: { part: 'special', sys: 3, tx: 1, ty: 1 } },
      { title: 'A story with whole numbers',
        text: String.raw`<p>Maya bakes \(x\) cakes and \(y\) pies. Flour gives \(2x+y\le 8\). Oven time gives \(x+y\le 6\).</p><p>Build both inequalities from the story in the panel. Then test a plan. Is 3 cakes and 4 pies allowed? Only whole-number points count. Afterwards, try the enrichment part, Best profit.</p>`,
        set: { part: 'story' } }
    ],
    formal: String.raw`
      <p>A <em>system of inequalities</em> is a list of inequalities in the same variables. A point \((x,y)\) is a <b>solution of the system</b> when it makes <em>every</em> inequality true at the same time.</p>
      <h3>Why the solution is the overlap</h3>
      <p>Each inequality in two variables, such as \(y>x-1\), is true on one side of its boundary line, a half-plane. The word "and" means a point must be on the correct side of every line. So a point is a solution exactly when it lies in all the half-planes, which is where all the shadings overlap. A point in only one shading makes one inequality false, so it is not a solution. To test a point, put it into each inequality in turn.</p>
      <p>Each new inequality can only remove points, never add them. That is why switching on another limit makes the region shrink, never grow, and why the region has straight edges: every edge is part of a boundary line.</p>
      <h3>Solid, dashed and corners</h3>
      <p>For \(\le\) and \(\ge\) the boundary line is solid and is part of the solution. For \(&lt;\) and \(>\) it is dashed and is not. A corner lies on two boundary lines, so it is in the solution only if <em>both</em> inequalities include their lines. In \(x>1\) and \(y>2\) the corner \((1,2)\) is left out. In \(x\ge 1\) and \(y\ge 2\) it is included.</p>
      <h3>Finding a corner</h3>
      <p>A corner is a point on two boundary lines, so it solves the two boundary <em>equations</em> together. Take \(x+y=6\) and \(2x+y=8\). Subtract the first from the second:
      \[ (2x+y)-(x+y)=8-6 \;\Longrightarrow\; x=2. \]
      Then \(2+y=6\) gives \(y=4\). The corner is \((2,4)\). Substitution works too: from \(y=6-x\), \(2x+(6-x)=8\) gives \(x=2\). Check that the corner satisfies the other inequalities as well, because a crossing point of two lines is a corner of the region only if it is in the whole solution.</p>
      <h3>Special cases</h3>
      <p><b>No solution:</b> \(y>x+2\) and \(y&lt;x-1\) have parallel boundaries and want opposite sides, so no point is in both.<br>
      <b>Unbounded:</b> \(x\ge1\) and \(y\ge 2\) overlap in a corner shape that never closes.<br>
      <b>A segment or a point:</b> \(x+y\le 4\) and \(x+y\ge 4\) share only the line \(x+y=4\). Adding \(x\ge0\) and \(y\ge0\) keeps only the piece from \((0,4)\) to \((4,0)\). With \(x\ge 4\), \(y\ge 0\) and \(x+y\le 4\), only \((4,0)\) is left.</p>
      <h3>Whole numbers in a story</h3>
      <p>The overlap contains every real point, but in a story only some points make sense. For cakes and pies, \(x\) and \(y\) must be whole numbers, and not negative. So the answers are the lattice points inside the region. The point \((2.5,1)\) is in the region but is not a plan. The point \((3,4)\) breaks \(x+y\le 6\) because \(3+4=7\).</p>
      <h3>Enrichment: the best value (a teaser, not a proof)</h3>
      <p>Suppose each cake earns \$3 and each pie \$2, so the profit is \(P=3x+2y\). For one value of \(P\) this is a line. Raising \(P\) slides the line parallel to itself. Picture sliding it up until it just leaves the region. The last place it touches is a corner, unless the line is parallel to an edge, and then a whole edge ties. At the corners \((0,0)\), \((4,0)\), \((2,4)\), \((0,6)\) the profit is \(0, 12, 14, 12\), so the best plan is 2 cakes and 4 pies for \$14. This idea is called <em>linear programming</em>. Here we only checked one example; proving that the best value of a linear profit is always at a corner is for a later course.</p>`,
    check: [
      { q: 'A system has two inequalities. Which statement describes its solution?',
        choices: ['The one point where the two boundary lines cross.', 'Every point that is in the shading of at least one of the two inequalities.', 'Every point that is in the shading of both inequalities at the same time.', 'Every point on either boundary line.'], answer: 2,
        why: String.raw`A solution must make every inequality true, so it must be on the correct side of both lines: the overlap of the shadings. The crossing point (A) is the answer to a system of <em>equations</em>, and it may not even belong to the overlap. A point in only one shading (B) makes the other inequality false. A point on a dashed line is not even in its own shading (D).`,
        hint: 'The word "and" means both inequalities must be true for the same point.' },
      { q: 'The region is x ≥ 0, y ≥ 0, x + y ≤ 8 and 3x + y ≤ 14. The boundary lines x + y = 8 and 3x + y = 14 cross at a corner of the region. A profit is P = 2x + y. What is P at that corner?',
        choices: ['11', '13', '14', '8'], answer: 0,
        why: String.raw`Subtract the first equation from the second: \((3x+y)-(x+y)=14-8\), so \(2x=6\) and \(x=3\). Then \(3+y=8\) gives \(y=5\). The corner is \((3,5)\), and \(P=2(3)+5=11\). 13 comes from swapping the coordinates, \(2(5)+3\). 14 is the right side of the second boundary equation, not \(P\). 8 is \(x+y\), not \(P\).`,
        hint: 'Solve the two boundary equations first. Subtract one from the other to cancel y, then find y.' },
      { q: 'Sam tests the point (3, 3) in the system x + y &lt; 6 and y ≥ x − 1. Sam writes: "x + y = 6, so the first inequality is fine. y = 3 and x − 1 = 2, so 3 ≥ 2 is true. Both work, so (3, 3) is a solution." What is wrong?',
        choices: ['Nothing is wrong: (3, 3) is a solution.', 'The first test is wrong: x + y = 6 is not less than 6, so (3, 3) is on the dashed line and is not a solution.', 'The second test is wrong: 3 is not at least 2.', 'Sam should have tested only one of the inequalities.'], answer: 1,
        why: String.raw`The first inequality is strict: \(x+y&lt;6\). At \((3,3)\) the sum is exactly 6, and 6 is not less than 6. The point is on the dashed boundary, which is not included, so the system is not satisfied. The second test is correct: \(3\ge 2\). A point must pass every test.`,
        hint: 'Is 6 less than 6? Look closely at the symbol in the first inequality.' }
    ],
    links: { prereq: ['graphing-linear-inequalities', 'modeling-with-systems'], next: [], related: ['systems-of-equations', 'solving-systems-by-substitution', 'solving-systems-by-elimination', 'solving-linear-inequalities'] },

    mount({ stage, controls: C }) {
      const st = { part: 'overlap', sys: 0, tx: 2, ty: 2, on: [1, 1, 1, 0], pv: 8, practice: false, pred: false, spred: false, ppred: false, vsel: null };
      let cancel = () => {};
      const panel = stage.nextElementSibling;
      const P = new Plane(stage, { cx: 2.5, cy: 2.5, span: 6.5 });
      const BV = { cx: 3, cy: 3, span: 5.2 };
      const view = v => { P.cx = v.cx; P.cy = v.cy; P.span = v.span; };

      /* bakery story state */
      const S = { sx: -1, sy: -1, unkOk: false, stage: 0, eq: 0, pi: 0, built: [false, false], wrong: {}, fb: '', px: 3, py: 4, q: null };
      /* vertex workbench */
      const VB = { stage: 0, fb: '', tried: {}, found: {} };
      /* practice */
      let prIdx = 0, prSolved = false, prTried = false, prFirst = 0, prDone = 0, prOver = false, prShow = -1;

      const activeBuild = () => KM.filter((q, i) => st.on[i]);
      const verts = () => { const idx = KM.map((q, i) => i).filter(i => st.on[i]); const cs = idx.map(i => KM[i]); return cornersOf(cs).map(v => ({ x: v.x, y: v.y, i: idx[v.i], j: idx[v.j] })); };
      const vkey = v => v.x + ',' + v.y;
      const ALLV = cornersOf(KM);

      /* ------------------------------------------------ drawing ------------------------------------------------ */
      const drawExplore = (c, p) => {
        const pal = p.pal, sy = SYS[st.sys], q = sy.q, C4 = cols(pal), b = p.bounds(), rect = rectOf(b);
        p.grid(1); p.ticks(1); axisNames(p);
        const show = st.part === 'overlap' || st.spred;
        const sol = shape(q.reduce(clip, rect));
        if (show) { shadeAll(p, q, q.length > 2 ? .13 : .22, rect); if (sol.kind === 'area') paintSol(p, sol); }
        drawLines(p, q, LET);
        if (show && sol.kind !== 'area') paintSol(p, sol);
        if (show && sy.pts) sy.pts.forEach(cp => {
          const inn = q.every(r => holds(r, cp[0], cp[1]));
          p.dot(cp[0], cp[1], 8, inn ? pal.violet : pal.stage, inn ? pal.stage : pal.violet, inn ? 2.5 : 3.5);
          p.label(`${pt(cp[0], cp[1])} ${inn ? 'in' : 'out'}`, cp[0], cp[1], { size: 15, italic: false, dy: 22, color: pal.text });
        });
        const rows = q.map((r, i) => [C4[i], `${LET[i]}  ${txt(r)}   ${r.strict ? 'dashed' : 'solid'}`]);
        if (show && st.part === 'special') rows.push([null, sy.tag]);
        legend(p, rows);
        if (st.part === 'overlap' || st.spred) {
          const inAll = q.every(r => holds(r, st.tx, st.ty));
          p.dot(st.tx, st.ty, 10, inAll ? alpha(pal.violet, .95) : pal.stage, pal.brass, 3.5);
          p.label(`P ${pt(st.tx, st.ty)}`, st.tx, st.ty, { size: 17, italic: false, dy: -24, color: pal.text });
        }
      };
      const drawBuild = (c, p) => {
        const pal = p.pal, C4 = cols(pal), b = p.bounds(), rect = rectOf(b);
        p.grid(1); p.ticks(1); axisNames(p);
        const act = KM.map((q, i) => i).filter(i => st.on[i]), cons = act.map(i => KM[i]);
        act.forEach(i => p.path(clip(rect, KM[i]), { fill: alpha(C4[i], .1), close: true }));
        const sh = shape(cons.reduce(clip, rect));
        paintSol(p, sh, .4);
        act.forEach(i => { const L = lineAcross(KM[i], b); p.path(L, { stroke: C4[i], width: 3.4 }); });
        const V = verts();
        V.forEach(v => { const sel = st.vsel === vkey(v); p.dot(v.x, v.y, sel ? 10 : 8, pal.yellow, sel ? pal.brass : pal.stage, sel ? 3.5 : 2.5); });
        cornerLabels(p, V, (v, i) => VB.found[vkey(v)] ? `${letter(i)} ${pt(v.x, v.y)}` : `${letter(i)} ?`);
        legend(p, act.map(i => [C4[i], `${txt(KM[i])}   solid`]));
        if (sh.kind === 'empty') p.label('no solution', 3, 3, { size: 22, italic: false, color: pal.text });
      };
      const drawStory = (c, p) => {
        const pal = p.pal, b = p.bounds(), rect = rectOf(b), C4 = cols(pal);
        p.grid(1); p.ticks(1);
        const xs = S.unkOk ? 'x = cakes' : 'x', ys = S.unkOk ? 'y = pies' : 'y';
        p.label(xs, b.x1 - .2, 0, { size: 18, italic: false, color: pal.muted, dy: -16, align: 'right' }); p.label(ys, 0, b.y1 - .6, { size: 18, italic: false, color: pal.muted, dx: 12, align: 'left' });
        const built = [0, 1].filter(i => S.built[i]);
        if (S.stage >= 2) {
          const all = [BEQ[0].q, BEQ[1].q, KM[0], KM[1]];
          p.path(all.reduce(clip, rect), { fill: alpha(pal.violet, .38), close: true });
          [KM[0], KM[1]].forEach(q => p.path(lineAcross(q, b), { stroke: pal.muted, width: 2 }));
        }
        built.forEach(i => p.path(lineAcross(BEQ[i].q, b), { stroke: C4[i], width: 3.4 }));
        if (S.stage >= 2) {
          const all = [BEQ[0].q, BEQ[1].q, KM[0], KM[1]];
          for (let x = 0; x <= 8; x++) for (let y = 0; y <= 8; y++) {
            const ok = all.every(q => holds(q, x, y));
            p.dot(x, y, ok ? 5 : 2.6, ok ? pal.violet : pal.muted, ok ? pal.stage : null, 1.5);
          }
          const ok = all.every(q => holds(q, S.px, S.py));
          p.dot(S.px, S.py, 11, ok ? alpha(pal.violet, .95) : pal.stage, pal.brass, 3.5);
          p.label(`${S.px} cakes, ${S.py} pies`, S.px, S.py, { size: 16, italic: false, dy: -25, color: pal.text });
        }
        const rows = built.map(i => [C4[i], `${BEQ[i].name}  ${txt(BEQ[i].q)}   solid`]);
        if (S.stage >= 2) rows.push([null, 'x ≥ 0 and y ≥ 0 (no negative bakes)']);
        if (rows.length) legend(p, rows);
      };
      const drawProfit = (c, p) => {
        const pal = p.pal, C4 = cols(pal), b = p.bounds(), rect = rectOf(b);
        p.grid(1); p.ticks(1); axisNames(p);
        const sh = shape(KM.reduce(clip, rect));
        paintSol(p, sh, .35);
        KM.forEach((q, i) => p.path(lineAcross(q, b), { stroke: alpha(C4[i], .55), width: 2.4 }));
        const V = ALLV;
        V.forEach(v => p.dot(v.x, v.y, 8, pal.yellow, pal.stage, 2.5));
        cornerLabels(p, V, (v, i) => st.ppred ? `${pt(v.x, v.y)} $${PF(v.x, v.y)}` : letter(i));
        /* the profit line 3x + 2y = P, and its part inside the region */
        const Pv = st.pv, L = [[(Pv - 2 * (b.y0 - 1)) / 3, b.y0 - 1], [(Pv - 2 * (b.y1 + 1)) / 3, b.y1 + 1]];
        p.path(L, { stroke: pal.text, width: 2, dash: [6, 6] });
        const inside = shape(clipLine(L, KM));
        if (inside.kind === 'segment') p.path(inside.pts, { stroke: pal.yellow, width: 7 });
        else if (inside.kind === 'point') p.dot(inside.pts[0][0], inside.pts[0][1], 10, pal.yellow, pal.text, 3);
        legend(p, [[null, 'x = cakes, y = pies'], [pal.yellow, inside.kind === 'empty' ? `3x + 2y = ${Pv}: misses the region` : `3x + 2y = ${Pv}: inside the region`]]);
      };
      /* the part of a segment L that satisfies every constraint */
      const clipLine = (L, cons) => {
        let t0 = 0, t1 = 1; const dx = L[1][0] - L[0][0], dy = L[1][1] - L[0][1];
        for (const q of cons) {
          const a = ev(q.n, L[0][0], L[0][1]), d = q.n[0] * dx + q.n[1] * dy;
          if (Math.abs(d) < 1e-12) { if (a < -1e-9) return []; continue; }
          const t = -a / d;
          if (d > 0) t0 = Math.max(t0, t); else t1 = Math.min(t1, t);
        }
        if (t0 > t1 + 1e-9) return [];
        return [[L[0][0] + t0 * dx, L[0][1] + t0 * dy], [L[0][0] + t1 * dx, L[0][1] + t1 * dy]];
      };

      /* practice drawing: miniature graph for the "choose the graph" problem */
      const mini = (c, p, x, y, w, hh, cons, label) => {
        const pal = p.pal, s = Math.min(w, hh) / 8, ox = x + w / 2, oy = y + hh / 2, cx = 2, cy = 2;
        const X1 = v => ox + (v - cx) * s, Y1 = v => oy - (v - cy) * s;
        const b = { x0: cx - w / 2 / s, x1: cx + w / 2 / s, y0: cy - hh / 2 / s, y1: cy + hh / 2 / s };
        c.save(); c.beginPath(); c.rect(x, y, w, hh); c.clip(); c.fillStyle = pal.stage; c.fillRect(x, y, w, hh);
        c.strokeStyle = pal.grid; c.lineWidth = 1; c.beginPath();
        for (let v = Math.ceil(b.x0); v <= b.x1; v++) { c.moveTo(X1(v), y); c.lineTo(X1(v), y + hh); }
        for (let v = Math.ceil(b.y0); v <= b.y1; v++) { c.moveTo(x, Y1(v)); c.lineTo(x + w, Y1(v)); }
        c.stroke(); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.beginPath(); c.moveTo(X1(0), y); c.lineTo(X1(0), y + hh); c.moveTo(x, Y1(0)); c.lineTo(x + w, Y1(0)); c.stroke();
        const poly = (pts, fill) => { c.beginPath(); pts.forEach((q, i) => i ? c.lineTo(X1(q[0]), Y1(q[1])) : c.moveTo(X1(q[0]), Y1(q[1]))); c.closePath(); c.fillStyle = fill; c.fill(); };
        const rect = rectOf(b), C4 = cols(pal);
        cons.forEach((q, i) => poly(clip(rect, q), alpha(C4[i], .2)));
        const sh = shape(cons.reduce(clip, rect)); if (sh.kind === 'area') poly(sh.pts, alpha(pal.violet, .4));
        cons.forEach((q, i) => {
          const L = lineAcross(q, b); c.strokeStyle = C4[i]; c.lineWidth = 3; c.setLineDash(q.strict ? [8, 6] : []); c.beginPath();
          c.moveTo(X1(L[0][0]), Y1(L[0][1])); c.lineTo(X1(L[1][0]), Y1(L[1][1])); c.stroke(); c.setLineDash([]);
        });
        c.restore(); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.strokeRect(x + .5, y + .5, w - 1, hh - 1);
        const fs = clamp(w * .09, 13, 17); c.font = `600 ${fs}px "Hanken Grotesk", Arial, sans-serif`; c.textAlign = 'left'; c.textBaseline = 'middle';
        const tw = c.measureText(label).width + 12; c.fillStyle = alpha(pal.stage, .92); c.fillRect(x + 4, y + 4, tw, fs * 1.6); c.fillStyle = pal.text; c.fillText(label, x + 10, y + 4 + fs * .8);
      };
      const drawPractice = (c, p) => {
        const pal = p.pal, pr = PROBS[prIdx], b = p.bounds(), rect = rectOf(b), C4 = cols(pal);
        if (prOver) { p.grid(1); p.ticks(1); return; }
        if (pr.kind === 'graphs') {
          const g = 8, w = (p.w - 3 * g) / 2, hh = (p.h - 3 * g) / 2;
          pr.vs.forEach((v, i) => mini(c, p, g + (i % 2) * (w + g), g + Math.floor(i / 2) * (hh + g), w, hh, v.cons, `Graph ${i + 1}`));
          return;
        }
        p.grid(1); p.ticks(1); axisNames(p);
        if (pr.kind === 'none') {
          if (prShow >= 0) {
            const q = pr.vs[prShow].cons; shadeAll(p, q, .22, rect); paintSol(p, shape(q.reduce(clip, rect))); drawLines(p, q);
            legend(p, [[null, `Shown: ${pr.vs[prShow].t}`]]);
          } else legend(p, [[null, 'Pick a system to see its graph']]);
          return;
        }
        const cons = pr.cons, solved = prSolved;
        if (pr.kind === 'write') { shadeAll(p, cons, .22, rect); paintSol(p, shape(cons.reduce(clip, rect))); }
        else if (solved || pr.kind === 'vertex' || pr.kind === 'max') { shadeAll(p, cons, cons.length > 2 ? .13 : .22, rect); paintSol(p, shape(cons.reduce(clip, rect))); }
        drawLines(p, cons);
        if (pr.kind === 'write') {
          const L0 = lineAcross(cons[0], b), L1 = lineAcross(cons[1], b);
          p.label(pr.names[0], 4.2, 2.2, { size: 16, italic: false, color: C4[0], dy: -14, align: 'left' });
          p.label(pr.names[1], -3.9, 3, { size: 16, italic: false, color: C4[1], dy: -14, align: 'left' });
          p.dot(1, 1, 9, alpha(pal.violet, .95), pal.text, 2.5); p.label('T (1, 1)', 1, 1, { size: 16, italic: false, dy: 20, color: pal.text });
        }
        if (pr.lattice && solved) for (let x = 0; x <= 10; x++) for (let y = 0; y <= 9; y++) {
          if (cons.every(q => holds(q, x, y))) p.dot(x, y, 3.6, pal.violet, pal.stage, 1);
        }
        if (pr.cands) pr.cands.forEach((cd, i) => {
          const isAns = solved && i === pr.ans;
          p.dot(cd[0], cd[1], isAns ? 9 : 7, isAns ? alpha(pal.violet, .95) : pal.stage, isAns ? pal.text : pal.text, 2.2);
          p.label(pt(cd[0], cd[1]), cd[0], cd[1], { size: 16, italic: false, dy: i % 2 ? 20 : -19, dx: 0, color: pal.text });
        });
        if (pr.kind === 'max') {
          pr.corners.forEach(cn => { p.dot(cn[0], cn[1], 8, pal.yellow, pal.stage, 2.5); p.label(solved ? `${pt(cn[0], cn[1])} P=${pr.pf(cn[0], cn[1])}` : pt(cn[0], cn[1]), cn[0], cn[1], { size: 16, italic: false, dx: cn[0] > 3 ? 60 : cn[0] === 0 ? 64 : 0, dy: cn[1] === 0 ? -22 : -4, color: pal.text }); });
        }
        if (pr.kind === 'vertex' && solved) { p.dot(2, 3, 9, pal.yellow, pal.text, 2.5); }
        legend(p, cons.map((q, i) => [C4[i], `${txt(q)}   ${q.strict ? 'dashed' : 'solid'}`]).slice(0, pr.kind === 'write' ? 2 : 4));
      };
      P.onDraw = (c, p) => {
        view(st.practice ? ((PROBS[prIdx].view && !prOver) ? PROBS[prIdx].view : PV1) : (st.part === 'overlap' || st.part === 'special') ? PV1 : BV);
        if (st.practice) return drawPractice(c, p);
        if (st.part === 'build') return drawBuild(c, p);
        if (st.part === 'story') return drawStory(c, p);
        if (st.part === 'profit') return drawProfit(c, p);
        return drawExplore(c, p);
      };

      /* ------------------------------------------------ panel helpers ------------------------------------------------ */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const dyn = () => { const e = h('div', { style: 'display:flex;flex-direction:column;gap:10px' }); panel.append(e); return e; };
      const para = (t, s = 'margin:0;font-size:.93rem;line-height:1.5') => h('p', { style: s, html: t });
      const fbBox = () => h('div', { class: 'ctl readout', 'aria-live': 'polite' });
      const optList = (opts, wrong, onPick) => h('div', { class: 'ctl buttons' }, opts.map((o, i) => { const bt = mkBtn(o[0], () => onPick(i)); if (wrong && wrong[i]) bt.disabled = true; return bt; }));
      const S_ = o => { const s = C.slider(o); s.inp = panel.lastElementChild.querySelector('input'); return s; };
      const PTS = pt;

      let partSel, sysSelO, sysSelS, predTitle, predQ, predRow, predFb, txS, tyS, ro1, tg = [], vbox, ro2, sBox, sx2, sy2, profT, ppredQ, ppredRow, pvS, ro3, practBtn;
      let ptally, pq, pch, pfb, pnext;

      const PARTS = [['overlap', '1  Overlap of two shadings'], ['build', '2  Build a region, find corners'], ['special', '3  Special cases'], ['story', '4  Bakery story'], ['profit', '5  Best profit (enrichment)']];
      grp('top', () => {
        C.title('Part');
        partSel = C.select({ label: 'Choose a part', options: PARTS.map(p => ({ value: p[0], label: p[1] })), value: 'overlap', onChange: v => { cancel(); setPart(v); sync(); } });
        C.hint('Dashed line: not included (strict, < or >). Solid line: included (≤ or ≥). Filled dot: in the solution. Open dot: left out.');
      });
      grp('ovsel', () => {
        sysSelO = C.select({ label: 'Choose a system', options: SYS.slice(0, 3).map((s, i) => ({ value: String(i), label: s.name })), value: '0', onChange: v => { cancel(); st.sys = +v; sync(); } });
      });
      grp('spsel', () => {
        sysSelS = C.select({ label: 'Choose a system', options: SYS.slice(3).map((s, i) => ({ value: String(i + 3), label: s.name })), value: '3', onChange: v => { cancel(); st.sys = +v; st.spred = false; renderPred(); sync(); } });
      });
      grp('pred', () => {
        predTitle = h('p', { class: 'ctl-title' }, 'Predict first');
        predQ = h('p', { class: 'hint' }, 'What will the overlap of these shadings look like?');
        predRow = h('div', { class: 'ctl buttons' });
        predFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        panel.append(predTitle, predQ, predRow, predFb);
      });
      grp('pt', () => {
        C.title('Test point P');
        txS = S_({ label: 'P: x', min: -3, max: 8, step: .5, value: st.tx, format: v => num(v), onInput: v => { cancel(); st.tx = v; sync(); } });
        tyS = S_({ label: 'P: y', min: -3, max: 8, step: .5, value: st.ty, format: v => num(v), onInput: v => { cancel(); st.ty = v; sync(); } });
        ro1 = C.readout();
      });
      grp('build', () => {
        C.title('Limits (switch on and off)');
        KM.forEach((q, i) => { tg[i] = C.toggle({ label: txt(q), value: !!st.on[i], onChange: v => { cancel(); st.on[i] = v ? 1 : 0; VB.stage = 0; VB.fb = ''; VB.tried = {}; if (st.vsel && !verts().some(w => vkey(w) === st.vsel)) st.vsel = null; sync(); } }); });
        ro2 = C.readout();
        C.title('Find a corner');
        vbox = dyn();
      });
      grp('story', () => {
        C.title('The bakery');
        sBox = dyn();
        sx2 = S_({ label: 'Cakes', min: 0, max: 6, step: 1, value: S.px, format: v => String(v), onInput: v => { cancel(); S.px = v; sync(); } });
        sy2 = S_({ label: 'Pies', min: 0, max: 8, step: 1, value: S.py, format: v => String(v), onInput: v => { cancel(); S.py = v; sync(); } });
      });
      grp('profit', () => {
        C.title('Best profit (enrichment)');
        C.hint('Maya earns $3 on a cake and $2 on a pie, so the profit is P = 3x + 2y. This is a teaser, not a proof.');
        ppredQ = h('p', { style: 'margin:0;font-size:.93rem;line-height:1.5' }, 'Predict first: which corner of the region earns the most?');
        ppredRow = h('div', { class: 'ctl buttons' });
        ro3 = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        panel.append(ppredQ, ppredRow);
        pvS = S_({ label: 'Profit P', min: 0, max: 18, step: 1, value: st.pv, format: v => '$' + v, onInput: v => { cancel(); st.pv = v; sync(); } });
        panel.append(ro3);
      });

      /* ---------- prediction (special cases) ---------- */
      const renderPred = () => {
        const sy = SYS[st.sys]; predFb.innerHTML = ''; predRow.replaceChildren();
        PRED.forEach((o, i) => predRow.append(mkBtn(o, () => {
          if (st.spred) return;
          st.spred = true;
          Array.from(predRow.children).forEach((b2, j) => { b2.disabled = true; if (j === i) b2.classList.add('primary'); });
          predFb.innerHTML = (i === sy.ans ? good('Yes.') : bad('Not quite.')) + ' The answer is: ' + `<b>${PRED[sy.ans].toLowerCase()}</b>. ` + sy.why;
          sync();
        })));
        if (st.spred) { Array.from(predRow.children).forEach(b2 => { b2.disabled = true; }); }
      };

      /* ---------- explore readout ---------- */
      const exploreRo = () => {
        const sy = SYS[st.sys], q = sy.q, L = [];
        if (st.part === 'special' && !st.spred) return 'Make your prediction first. Then the shading and the test point appear.';
        const res = q.map(r => test(r, st.tx, st.ty));
        L.push(`${kk('P')} ${pt(st.tx, st.ty)}`);
        q.forEach((r, i) => L.push(`${kk(LET[i] + ': ' + txt(r))} ${res[i].s}`));
        const n = res.filter(r => r.ok).length;
        if (n === q.length) L.push(good(q.length === 2 ? 'Both true.' : 'All true.') + ' P is in the overlap, so P is a solution of the system.');
        else if (q.length === 2) L.push(n === 1 ? bad('Only ' + LET[res[0].ok ? 0 : 1] + ' is true.') + ' P is in just one shading, so it is NOT a solution of the system.' : bad('Neither is true.') + ' P is outside both shadings, so it is NOT a solution.');
        else L.push(bad(`${n} of ${q.length} are true.`) + ' A solution must make every inequality true, so P is NOT a solution.');
        return L.join('<br>');
      };

      /* ---------- build part: shape readout and corner workbench ---------- */
      const buildRo = () => {
        const cons = activeBuild(), sh = shape(cons.reduce(clip, rectOf({ x0: -50, x1: 50, y0: -50, y1: 50 }))), V = verts(), L = [];
        const unb = V.length === 0 ? true : shape(cons.reduce(clip, rectOf({ x0: -50, x1: 50, y0: -50, y1: 50 }))).pts.some(q => !V.some(v => Math.hypot(v.x - q[0], v.y - q[1]) < 1e-6));
        L.push(`${kk('Limits on')} ${cons.length ? cons.map(txt).join(', ') : 'none'}`);
        if (!cons.length) L.push('Nothing is limited yet, so every point is a solution.');
        else if (unb) L.push(`${kk('Shape')} unbounded: it goes on forever. ${V.length} corner${V.length === 1 ? '' : 's'}.`);
        else L.push(`${kk('Shape')} closed: ${V.length} corners, area ${num(sh.area)} square units.`);
        return L.join('<br>');
      };
      const selVert = () => { const V = verts(); return V.find(v => vkey(v) === st.vsel); };
      const movesFor = v => {
        const i = v.i, j = v.j, ax = i < 2 ? i : j < 2 ? j : -1;
        if (i < 2 && j < 2) return null;
        if (ax >= 0) {
          const o = ax === i ? j : i, e = KA[o], known = ax === 0 ? 'x = 0' : 'y = 0', c0 = e[2];
          const ok = ax === 0 ? `With x = 0, the other equation ${KE[o]} becomes ${e[1] === 1 ? '' : e[1]}y = ${c0}, so y = ${c0 / e[1]}.` : `With y = 0, the other equation ${KE[o]} becomes ${e[0] === 1 ? '' : e[0]}x = ${c0}, so x = ${c0 / e[0]}.`;
          const sum = [KA[i][0] + KA[j][0], KA[i][1] + KA[j][1], KA[i][2] + KA[j][2]];
          return [[`Substitute: put ${known} into the other equation`, true, ok],
            ['Add the two equations', false, `Adding gives ${eqTxt(sum)}. Nothing cancels: it still has both x and y. Use the fact that one coordinate is already known.`],
            ['Pick any point on one of the lines', false, 'A point on one line need not be on the other. The corner is on BOTH boundary lines, so it must solve both equations.']];
        }
        return [['Subtract Eq 1 from Eq 2 (elimination)', true, `Both have +y, so subtracting cancels y: (2x + y) − (x + y) = 8 − 6, so x = 2. Then 2 + y = 6, so y = 4.`],
          ['Substitute y = 6 − x into Eq 2 (substitution)', true, `Eq 1 gives y = 6 − x. Then 2x + (6 − x) = 8 gives x + 6 = 8, so x = 2, and y = 6 − 2 = 4.`],
          ['Add the equations', false, 'Adding gives 3x + 2y = 14. Nothing cancels, so it still has both x and y. Subtracting would cancel y, because both equations have +y.']];
      };
      const renderVB = () => {
        const V = verts(), els = [];
        if (!V.length) { vbox.replaceChildren(para('With these limits the region has no corner. Switch on more limits.')); return; }
        els.push(para('Corners of the region. Click one on the graph or here.'));
        els.push(h('div', { class: 'ctl buttons' }, V.map((v, i) => { const b2 = mkBtn(VB.found[vkey(v)] ? `${letter(i)} ${pt(v.x, v.y)}` : `Corner ${letter(i)}`, () => { st.vsel = vkey(v); VB.stage = 0; VB.fb = ''; VB.tried = {}; sync(); }, st.vsel === vkey(v)); return b2; })));
        const v = selVert(), vi = V.findIndex(w => vkey(w) === st.vsel);
        if (v) {
          const e1 = KE[v.i], e2 = KE[v.j];
          els.push(fbBox());
          els[els.length - 1].innerHTML = `${kk('Corner ' + letter(vi))} lies on two boundary lines<br>${kk('Line 1')} ${e1}<br>${kk('Line 2')} ${e2}`;
          const mv = movesFor(v);
          if (!mv && !VB.found[vkey(v)]) { VB.found[vkey(v)] = true; VB.fb = good('Both boundaries are axes.') + ' x = 0 and y = 0 cross at the origin (0, 0). Both inequalities include their lines, so this corner belongs to the solution.'; }
          if (VB.found[vkey(v)]) {
            const fb = fbBox(); fb.innerHTML = VB.fb || (good('Found.') + ` Corner ${letter(vi)} is ${pt(v.x, v.y)}.`); els.push(fb);
          } else if (VB.stage === 0) {
            els.push(para('How can you find where the two lines cross?'));
            const order = mv.map((m, k) => k).map(k => (k + vi) % 3);
            els.push(optList(order.map(k => [mv[k][0]]), VB.tried, k2 => {
              const m = mv[order[k2]];
              if (m[1]) { VB.stage = 1; VB.fb = good('Yes.') + ' ' + m[2] + ' Now which point is the corner?'; VB.tried = {}; }
              else { VB.tried[k2] = true; VB.fb = bad('Not that one.') + ' ' + m[2]; }
              sync();
            }));
            if (VB.fb) { const fb = fbBox(); fb.innerHTML = VB.fb; els.push(fb); }
          } else {
            const f2 = fbBox(); f2.innerHTML = VB.fb; els.push(f2);
            const cands = [[v.x, v.y], [v.y, v.x], [v.x + 1, v.y], [v.x, v.y + 1], [v.x + 1, v.y + 1], [v.x + 2, v.y]];
            const seen = new Set(), list = [];
            cands.forEach(cd => { const k2 = cd.join(','); if (!seen.has(k2)) { seen.add(k2); list.push(cd); } });
            const four = list.slice(0, 4), rot = [], sh = (vi + 1) % 4;
            four.forEach((cd, k) => rot[(k + sh) % four.length] = cd);
            els.push(optList(rot.map(cd => [pt(cd[0], cd[1])]), VB.tried, k2 => {
              const cd = rot[k2];
              if (cd[0] === v.x && cd[1] === v.y) {
                VB.found[vkey(v)] = true; VB.fb = good('Right.') + ` Check: at ${pt(v.x, v.y)}, ${KM[v.i].lt} is ${num(KA[v.i][0] * v.x + KA[v.i][1] * v.y)}, matching ${e1}, and ${KM[v.j].lt} is ${num(KA[v.j][0] * v.x + KA[v.j][1] * v.y)}, matching ${e2}. The inequalities are non-strict (≤ or ≥), so the boundary lines are included and this corner belongs to the solution.`;
              } else {
                VB.tried[k2] = true;
                const bads = [v.i, v.j].filter(t => Math.abs(KA[t][0] * cd[0] + KA[t][1] * cd[1] - KA[t][2]) > 1e-9);
                const t = bads[0], val = KA[t][0] * cd[0] + KA[t][1] * cd[1];
                const sw = cd[0] === v.y && cd[1] === v.x ? ' Did you swap x and y?' : '';
                VB.fb = bad('Not that point.') + ` At ${pt(cd[0], cd[1])}, ${KM[t].lt} is ${num(val)}, but the line ${KE[t]} needs ${num(KA[t][2])}.${sw}`;
              }
              sync();
            }));
          }
        }
        vbox.replaceChildren(...els);
      };

      /* ---------- story part ---------- */
      const sPara = t => para(t);
      const renderStory = () => {
        const els = [];
        const storyP = h('p', { style: 'margin:0;font-size:.93rem;line-height:1.9' });
        const clickable = S.stage === 1 && !(S.built[0] && S.built[1]) && S.pi < 3;
        STORY.forEach(s => {
          if (PH[s]) {
            const bt = h('button', { type: 'button', class: 'btn', style: 'display:inline;min-height:0;padding:1px 7px;margin:1px 0;font-size:.9rem;text-align:left', onclick: () => clickPh(s) }, PH[s].t);
            if (!clickable) bt.style.cursor = 'default';
            storyP.append(bt);
          } else storyP.append(s);
        });
        els.push(storyP);
        const fb = fbBox();
        if (S.stage === 0) {
          els.push(C_title('Step 1: name the unknowns'), para('The numbers the story gives you are known. Pick the two things Maya chooses. Each gets a letter.'));
          const mk = (label, key) => { const id = 'sx' + key, sel = h('select', { id }, h('option', { value: -1 }, 'Choose…'), ...UNK.map((o, i) => h('option', { value: i }, o[0]))); sel.value = S[key]; sel.disabled = S.unkOk; sel.addEventListener('change', () => { S[key] = +sel.value; fb.innerHTML = ''; }); return h('div', { class: 'ctl select' }, h('label', { for: id }, label), sel); };
          els.push(mk('Let x be…', 'sx'), mk('Let y be…', 'sy'));
          els.push(h('div', { class: 'ctl buttons' }, mkBtn('Check my unknowns', () => {
            if (S.sx < 0 || S.sy < 0) { S.fb = 'Choose something for both x and y.'; renderStory(); return; }
            const L = [], one = (sel, want, other, nm) => { if (sel === want) L.push(good(nm + ' is right.') + ' ' + UNK[sel][1]); else if (sel === other) L.push(bad(nm + ':') + ` That is one of the two unknowns, but call it ${nm === 'x' ? 'y' : 'x'} so that cakes are on the x axis.`); else L.push(bad(nm + ':') + ' ' + UNK[sel][1]); };
            one(S.sx, 0, 1, 'x'); one(S.sy, 1, 0, 'y');
            if (S.sx === 0 && S.sy === 1) { S.unkOk = true; S.stage = 1; S.pi = 0; S.eq = 0; L.push('x is on the horizontal axis and y on the vertical axis of the graph.'); }
            S.fb = L.join('<br>'); renderStory(); sync();
          }, true)));
        } else if (S.stage === 1) {
          const eq = BEQ[S.eq];
          els.push(C_title('Step 2: build the inequalities'));
          const rows = BEQ.map((e, i) => S.built[i] ? `${kk(e.name)} <b>${txt(e.q)}</b>` : (i === S.eq ? `${kk(e.name)} ${partial(i)}` : '')).filter(Boolean);
          const eb = fbBox(); eb.innerHTML = rows.join('<br>'); els.push(eb);
          if (S.built[0] && S.built[1]) els.push(para('Both inequalities are built. Their lines are on the graph.'), h('div', { class: 'ctl buttons' }, mkBtn('Next: graph the region and test a plan', () => { S.stage = 2; S.fb = ''; renderStory(); sync(); }, true)));
          else if (S.pi < 3) els.push(para(`<b>${eq.name}.</b> Click the phrase in the story for ${eq.asks[S.pi]}.`));
          else {
            els.push(para(`<b>${eq.name}.</b> Which symbol fits "${eq.word === 'cups' ? 'she has' : 'the oven is free for'}" a limit like this?`));
            els.push(optList(symOpts(eq.unit, eq.lim).map(o => [o[0]]), S.wrong, k => {
              const o = symOpts(eq.unit, eq.lim)[k];
              if (o[1]) { S.built[S.eq] = true; S.fb = good('Yes.') + ' ' + o[2] + `<br>${good(eq.name + ' is built:')} ${txt(eq.q)}. Every term is in ${eq.unit}.`; S.eq = Math.min(S.eq + 1, 1); S.pi = S.built[0] && S.built[1] ? 3 : 0; S.wrong = {}; }
              else { S.wrong[k] = true; S.fb = bad('Not that one.') + ' ' + o[2]; }
              renderStory(); sync();
            }));
          }
        } else {
          els.push(C_title('Step 3: graph it and test a plan'));
          const all = [BEQ[0].q, BEQ[1].q, KM[0], KM[1]];
          let n = 0; for (let x = 0; x <= 8; x++) for (let y = 0; y <= 8; y++) if (all.every(q => holds(q, x, y))) n++;
          els.push(para(`The violet region is the overlap of both limits and the two hidden ones, ${good('x ≥ 0')} and ${good('y ≥ 0')} (she cannot bake a negative number). Only the whole-number dots are real plans: there are <b>${n}</b> of them. A point like (2.5, 1) is in the region but means two and a half cakes.`));
          if (S.q === null) {
            els.push(para('<b>Predict first.</b> Is 3 cakes and 4 pies allowed?'));
            els.push(h('div', { class: 'ctl buttons' }, [['Yes, allowed', true], ['No, not allowed', false]].map(o => mkBtn(o[0], () => { S.q = o[1]; S.px = 3; S.py = 4; renderStory(); sync(); }))));
          } else {
            els.push(para(`${S.q ? bad('Not quite.') : good('Right.')} 3 cakes and 4 pies need 2(3) + 4 = 10 cups of flour (limit 8) and 3 + 4 = 7 hours (limit 6). Use the sliders, or drag the point, to test other plans.`));
            const rd = fbBox(); const r = planRo(); rd.innerHTML = r; els.push(rd);
            els.push(h('div', { class: 'ctl buttons' }, mkBtn('Next: best profit (enrichment)', () => { setPart('profit'); sync(); }, true)));
          }
        }
        if (S.fb) { fb.innerHTML = S.fb; els.push(fb); }
        sBox.replaceChildren(...els);
      };
      const partial = i => { const co = BEQ[i].co, g = k => (S.pi > k ? co[k] : '?'); return `<b>${g(0)}x + ${g(1)}y ${S.pi > 2 ? '?' : '?'} ${g(2)}</b>`; };
      const C_title = t => h('p', { class: 'ctl-title' }, t);
      const planRo = () => {
        const f = ev([2, 1, 0], S.px, S.py), o = S.px + S.py, L = [];
        L.push(`${kk('Plan')} ${S.px} cake${S.px === 1 ? '' : 's'} and ${S.py} pie${S.py === 1 ? '' : 's'}`);
        L.push(`${kk('Flour')} 2(${S.px}) + ${S.py} = ${f} cups. Limit 8: ${f <= 8 ? good('ok') : bad('too much')}`);
        L.push(`${kk('Oven')} ${S.px} + ${S.py} = ${o} hours. Limit 6: ${o <= 6 ? good('ok') : bad('too much')}`);
        L.push(f <= 8 && o <= 6 ? good('Allowed.') + ' It is a whole-number point in the violet region.' : bad('Not allowed.') + ` It breaks ${f > 8 && o > 6 ? 'both limits' : f > 8 ? 'the flour limit' : 'the oven limit'}, so it is outside the region.`);
        return L.join('<br>');
      };
      const clickPh = id => {
        if (S.stage !== 1 || S.pi >= 3 || (S.built[0] && S.built[1])) return;
        const eq = BEQ[S.eq];
        if (id === eq.slots[S.pi]) { S.fb = good('Yes.') + ` That phrase gives ${PH[id].what}.`; S.pi++; }
        else S.fb = bad('Not that phrase.') + ` It gives ${PH[id].what}. This spot needs ${eq.asks[S.pi]}.`;
        renderStory();
      };

      /* ---------- profit part ---------- */
      const renderProfPred = () => {
        ppredRow.replaceChildren();
        const V = ALLV;
        V.forEach((v, i) => ppredRow.append(mkBtn(`${letter(i)} ${pt(v.x, v.y)}`, () => { if (st.ppred) return; st.ppred = true; st.pickV = i; sync(); }, st.ppred && st.pickV === i)));
        if (st.ppred) Array.from(ppredRow.children).forEach(b2 => { b2.disabled = true; });
      };
      const profitRo = () => {
        const L = [], V = ALLV, vals = V.map(v => PF(v.x, v.y)), best = Math.max(...vals);
        if (!st.ppred) return 'Pick a corner first. Then the profit slider unlocks.';
        const bi = vals.indexOf(best);
        L.push(st.pickV === bi ? good('Right.') + ` ${pt(V[bi].x, V[bi].y)} earns the most.` : bad('Not quite.') + ` ${pt(V[bi].x, V[bi].y)} earns the most.`);
        L.push(V.map(v => `${pt(v.x, v.y)}: 3(${v.x}) + 2(${v.y}) = $${PF(v.x, v.y)}`).join('<br>'));
        const b = { x0: -3, x1: 9, y0: -3, y1: 9 }, Pv = st.pv, line = [[(Pv - 2 * b.y0) / 3, b.y0], [(Pv - 2 * b.y1) / 3, b.y1]];
        const sh = shape(clipLine(line, KM));
        L.push(`${kk('Slider')} P = $${Pv}: ${sh.kind === 'empty' ? bad('the line misses the region.') + ' No plan earns that much.' : sh.kind === 'point' ? good('the line just touches the region at ' + pt(...sh.pts[0]) + '.') + ' This is the largest P that still has a plan.' : good('the line cuts through the region.') + ' Plans on it earn $' + Pv + '.'}`);
        const wn = []; for (let x = 0; x <= 6; x++) for (let y = 0; y <= 8; y++) if (PF(x, y) === Pv && KM.every(q => holds(q, x, y))) wn.push(`(${x}, ${y})`);
        L.push(`${kk('Whole-number plans on this line')} ${wn.length ? wn.join(', ') : 'none'}`);
        L.push('The best value is at a corner. This is a teaser: we checked one example and did not prove it.');
        return L.join('<br>');
      };

      /* ------------------------------------------------ practice ------------------------------------------------ */
      C.title('Practice');
      C.hint('Seven short problems. Nothing here is saved or scored.');
      practBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); if (st.practice) st.practice = false; else { st.practice = true; if (!prOver) loadProb(); } sync(); } }])[0];
      grp('practice', () => {
        ptally = h('p', { class: 'ctl-title' });
        pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        pch = h('div', { class: 'ctl buttons' });
        pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pnext = mkBtn('Next problem', () => nextProb(), true);
        panel.append(ptally, pq, pch, pfb, h('div', { class: 'ctl buttons' }, pnext));
      });
      const tally = () => { ptally.textContent = `Problem ${prIdx + 1} of ${PROBS.length}. Right on the first try: ${prFirst} of ${prDone} done`; };
      const choiceText = (pr, i) => {
        if (pr.kind === 'graphs') return `Graph ${i + 1}`;
        if (pr.kind === 'none') return pr.vs[i].t;
        if (pr.kind === 'write') return pr.opts[i][0];
        if (pr.kind === 'max') return pr.ch[i];
        return pt(pr.cands[i][0], pr.cands[i][1]);
      };
      const nChoices = pr => (pr.kind === 'graphs' || pr.kind === 'none') ? pr.vs.length : pr.kind === 'write' ? pr.opts.length : pr.kind === 'max' ? pr.ch.length : pr.cands.length;
      const choiceFb = (pr, i) => {
        if (pr.kind === 'graphs' || pr.kind === 'none') return pr.vs[i].fb;
        if (pr.kind === 'write') return pr.opts[i][1];
        if (pr.kind === 'max') return pr.fbs[i];
        const cd = pr.cands[i], key = cd.join(',');
        if (pr.note && pr.note[key]) return pr.note[key];
        if (pr.kind === 'vertex') {
          const ok = pr.eq.map(e => evalE([e[1][0], e[1][1]], cd[0], cd[1]) === e[2]);
          if (i === pr.ans) return pr.right;
          const f = ok.findIndex(v => !v), e = pr.eq[f];
          return `At ${pt(cd[0], cd[1])}: ${e[0]} = ${evalE(e[1], cd[0], cd[1])}, but the line ${e[0]} = ${e[2]} needs ${e[2]}. A corner must be on BOTH lines. This point is on ${ok[0] || ok[1] ? 'only one of them' : 'neither'}.`;
        }
        const cons = pr.cons.filter(q => !(pr.ctx && (q.lt === 'x' || q.lt === 'y')));
        const rs = cons.map(q => ({ q, t: test(q, cd[0], cd[1]) }));
        const badOne = rs.find(r => !r.t.ok);
        if (!badOne) return `Both inequalities are true at ${pt(cd[0], cd[1])}: ` + rs.map(r => `${txt(r.q)}: ${num(ev(r.q.lf, cd[0], cd[1]))} ${r.q.op} ${num(ev(r.q.rf, cd[0], cd[1]))}`).join('; ') + (pr.ctx ? '. Both are whole numbers, so it is a plan the coach can carry out.' : '. It is in both shadings, so it is a solution of the system.');
        return `At ${pt(cd[0], cd[1])}, ${txt(badOne.q)} fails: ${badOne.t.s}`;
      };
      const loadProb = () => {
        const pr = PROBS[prIdx]; prSolved = false; prTried = false; prShow = -1;
        pq.textContent = pr.q; pfb.innerHTML = ''; pch.replaceChildren(); pnext.disabled = true; pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        for (let i = 0; i < nChoices(pr); i++) pch.append(mkBtn(choiceText(pr, i), () => pick(i)));
        tally();
      };
      const pick = i => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        const right = i === pr.ans, btn = pch.children[i], txt2 = choiceFb(pr, i);
        if (pr.kind === 'none') prShow = i;
        if (right) { prSolved = true; if (!prTried) prFirst++; prDone++; Array.from(pch.children).forEach(b2 => { b2.disabled = true; }); btn.classList.add('primary'); pfb.innerHTML = good('Right.') + ' ' + txt2; pnext.disabled = false; }
        else { prTried = true; btn.disabled = true; pfb.innerHTML = bad('Not quite.') + ' ' + txt2 + ' Try another answer.'; }
        tally(); P.draw();
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); P.draw(); return; }
        prOver = true; pq.textContent = 'All seven problems are done.'; pch.replaceChildren(); pnext.disabled = true;
        pfb.innerHTML = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        pch.append(mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; prOver = false; loadProb(); P.draw(); }, true));
        ptally.textContent = `Right on the first try: ${prFirst} of ${PROBS.length}`; P.draw();
      };

      /* ------------------------------------------------ state ------------------------------------------------ */
      const setPart = v => {
        st.part = v; st.practice = false;
        if (v === 'overlap' && st.sys > 2) { st.sys = 0; }
        if (v === 'special' && st.sys < 3) { st.sys = 3; st.spred = false; renderPred(); }
      };
      const sync = () => {
        const prac = st.practice, pa = st.part, ex = pa === 'overlap' || pa === 'special';
        vis(G.top, !prac); vis(G.ovsel, !prac && pa === 'overlap'); vis(G.spsel, !prac && pa === 'special'); vis(G.pred, !prac && pa === 'special');
        vis(G.pt, !prac && ex); vis(G.build, !prac && pa === 'build'); vis(G.story, !prac && pa === 'story'); vis(G.profit, !prac && pa === 'profit'); vis(G.practice, prac);
        partSel.value = pa; sysSelO.value = String(Math.min(st.sys, 2)); sysSelS.value = String(Math.max(st.sys, 3));
        const locked = pa === 'special' && !st.spred;
        txS.set(st.tx); tyS.set(st.ty); txS.inp.disabled = tyS.inp.disabled = locked;
        tg.forEach((t, i) => { t.checked = !!st.on[i]; });
        if (!prac) {
          if (ex) ro1.innerHTML = exploreRo();
          if (pa === 'build') { ro2.innerHTML = buildRo(); renderVB(); }
          if (pa === 'story') { renderStory(); sx2.set(S.px); sy2.set(S.py); sx2.inp.disabled = sy2.inp.disabled = !(S.stage >= 2 && S.q !== null); vis([sx2.inp.closest('.ctl'), sy2.inp.closest('.ctl')], S.stage >= 2 && S.q !== null); }
          if (pa === 'profit') { renderProfPred(); ro3.innerHTML = profitRo(); pvS.set(st.pv); pvS.inp.disabled = !st.ppred; }
        }
        practBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        P.draw();
      };
      renderPred();

      draggable(P, {
        hit: (px, py) => {
          if (st.practice) return null;
          if (st.part === 'overlap' || (st.part === 'special' && st.spred)) return near(P, st.tx, st.ty, px, py, 24) ? 'p' : null;
          if (st.part === 'build') { const V = verts(); const k = V.findIndex(v => near(P, v.x, v.y, px, py, 22)); return k >= 0 ? 'v' + k : null; }
          if (st.part === 'story' && S.stage >= 2 && S.q !== null) return near(P, S.px, S.py, px, py, 24) ? 'q' : null;
          return null;
        },
        move: (hd, x, y) => {
          cancel();
          if (hd === 'p') { st.tx = clamp(snap(x, .5), -3, 8); st.ty = clamp(snap(y, .5), -3, 8); }
          else if (hd === 'q') { S.px = clamp(Math.round(x), 0, 6); S.py = clamp(Math.round(y), 0, 8); }
          else { const v = verts()[+hd.slice(1)]; if (v && st.vsel !== vkey(v)) { st.vsel = vkey(v); VB.stage = 0; VB.fb = ''; VB.tried = {}; } }
          sync();
        }
      });

      const FLAGS = ['part', 'sys', 'on'];
      const apply = (patch, immediate) => {
        cancel();
        const nums = {}; st.practice = false;
        const prevSys = st.sys;
        for (const k in patch) { if (FLAGS.includes(k)) st[k] = Array.isArray(patch[k]) ? patch[k].slice() : patch[k]; else nums[k] = patch[k]; }
        if (patch.part === 'special' || patch.sys !== undefined) { st.spred = false; renderPred(); }
        if (patch.part === 'build') { st.vsel = null; VB.stage = 0; VB.fb = ''; VB.tried = {}; }
        if (patch.part === 'story') { /* keep progress */ }
        if (immediate) { Object.assign(st, nums); sync(); } else { sync(); cancel = animateTo(st, nums, 600, sync); }
      };
      sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
