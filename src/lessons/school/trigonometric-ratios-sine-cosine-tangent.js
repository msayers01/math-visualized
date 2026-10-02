/* =====================================================================
   SCHOOL / GEOMETRY — Trigonometric ratios: sine, cosine, tangent
   ===================================================================== */
{
  const D2R = Math.PI / 180;
  const sinD = a => Math.sin(a * D2R), cosD = a => Math.cos(a * D2R), tanD = a => Math.tan(a * D2R);
  const f2 = v => v.toFixed(2), f3 = v => v.toFixed(3), f1 = v => v.toFixed(1);
  const TBL = [10, 20, 30, 40, 50, 60, 70, 80];
  const MODES = [['size', 'Same angle, any size'], ['names', 'Naming the sides'], ['table', 'Table of ratios'],
    ['rel', 'How the ratios connect'], ['use', 'Using the ratios'], ['prac', 'Practice problems']];
  const HINTS = {
    size: 'Drag the top corner (direction sets the angle, distance sets the size), or use the sliders and buttons.',
    names: 'Drag the top corner, or use the slider and buttons. Choose where θ is with the buttons.',
    table: 'Move the angle with the slider or the buttons, then add it to the table.',
    rel: 'Drag the top corner, or use the slider and buttons. Pick a relationship in the menu.',
    use: 'Choose a task, set the numbers with the sliders, then pick the ratio.',
    prac: 'Answer in the Practice panel below. The picture shows the problem.'
  };
  const ROLE = (side, at) => side === 'ab' ? 'hypotenuse' : (side === 'ac') === (at === 'A') ? 'adjacent' : 'opposite';
  const RCOL = (p, r) => r === 'opposite' ? p.pal.red : r === 'adjacent' ? p.pal.green : p.pal.blue;
  const RWHY = {
    opposite: 'The opposite side is across from the angle. It does not touch the angle.',
    adjacent: 'The adjacent side touches the angle and is not the hypotenuse.',
    hypotenuse: 'The hypotenuse is the side across from the right angle. It is the longest side.'
  };
  const RUSES = { sin: ['opposite', 'hypotenuse'], cos: ['adjacent', 'hypotenuse'], tan: ['opposite', 'adjacent'] };
  const RNAME = { sin: 'Sine', cos: 'Cosine', tan: 'Tangent' };
  const RFORM = { sin: 'opposite ÷ hypotenuse', cos: 'adjacent ÷ hypotenuse', tan: 'opposite ÷ adjacent' };

  /* ---------- drawing helpers ---------- */
  const box = (p, x0, y0, x1, y1, mx, mt, mb) => {
    mx = mx ?? clamp(p.w * .13, 44, 92); mt = mt ?? 44; mb = mb ?? 56;
    const sc = Math.max(1e-3, Math.min((p.w - 2 * mx) / (x1 - x0), (p.h - mt - mb) / (y1 - y0)));
    p.span = Math.min(p.w, p.h) / (2 * sc);
    p.cx = (x0 + x1) / 2; p.cy = (y0 + y1) / 2 + (mt - mb) / (2 * sc);
  };
  const fsz = p => clamp(Math.min(p.w, p.h) * .03, 15, 20);
  const rmark = (p, vx, vy, ux, uy, wx, wy) => {
    const r = 14 / p.scale;
    p.path([[vx + ux * r, vy + uy * r], [vx + (ux + wx) * r, vy + (uy + wy) * r], [vx + wx * r, vy + wy * r]], { stroke: p.pal.text, width: 2 });
  };
  const arc = (p, vx, vy, rpx, a0, a1, col, w = 3.5) => {
    const c = p.ctx; c.beginPath(); c.arc(p.X(vx), p.Y(vy), rpx, -a0, -a1, true);
    c.strokeStyle = col; c.lineWidth = w; c.setLineDash([]); c.lineCap = 'round'; c.stroke();
  };
  const angLab = (p, text, vx, vy, a0, a1, rpx, col, size, italic = false) => {
    const m = (a0 + a1) / 2;
    p.label(text, vx, vy, { dx: Math.cos(m) * rpx, dy: -Math.sin(m) * rpx, color: col, size, italic });
  };
  const edgeLabel = (p, A, B, cen, lines, col, off, size) => {
    if (!Array.isArray(lines)) lines = [lines];
    const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
    let nx = -(B[1] - A[1]), ny = B[0] - A[0]; const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
    if (nx * (mx - cen[0]) + ny * (my - cen[1]) < 0) { nx = -nx; ny = -ny; }
    const lh = size * 1, n = lines.length, hw = Math.max(...lines.map(t => String(t).length)) * size * .24, o = off + Math.abs(ny) * (n - 1) * lh / 2 + Math.abs(nx) * hw;
    lines.forEach((t, i) => p.label(t, mx, my, { size, italic: false, color: col, dx: nx * o, dy: -ny * o + (i - (n - 1) / 2) * lh }));
  };
  const handle = (p, x, y) => p.dot(x, y, 9, p.pal.stage, p.pal.brass, 3.5);
  const caption = (p, lines, cols) => {
    const c = p.ctx; c.font = '600 15px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle';
    lines.forEach((t, i) => { c.fillStyle = cols ? cols[i] : p.pal.text; c.fillText(t, 14, 20 + i * 21); });
  };

  /* Draw the right triangle: A at the origin, right angle at C, B above C. */
  const tri = (p, al, H, o = {}) => {
    const pal = p.pal, ls = fsz(p), a = al * D2R, AC = H * Math.cos(a), BC = H * Math.sin(a), at = o.at || 'A';
    const Pa = [0, 0], Pc = [AC, 0], Pb = [AC, BC], cen = [AC * .66, BC * .33];
    const len = { ac: AC, bc: BC, ab: H }, S = { ac: [Pa, Pc], bc: [Pc, Pb], ab: [Pa, Pb] }, off = { ac: 24, bc: 14, ab: 14 };
    p.path([Pa, Pc, Pb], { fill: alpha(pal.yellow, .16), close: true });
    for (const k of ['ac', 'bc', 'ab']) {
      const role = ROLE(k, at), hl = o.hl && o.hl.includes(k);
      const col = o.neutral ? (hl ? pal.yellow : pal.muted) : RCOL(p, role);
      p.path(S[k], { stroke: col, width: hl ? 6.5 : 4.5 });
      let lab = o.txt && o.txt[k];
      if (!lab || !lab.length) {
        lab = [];
        if (o.names) lab.push(role);
        if (o.nums) lab.push(o.hide && o.hide.includes(k) ? '?' : f2(len[k]));
        if (!lab.length) lab = null;
      }
      if (lab) edgeLabel(p, S[k][0], S[k][1], cen, lab, hl && o.neutral ? pal.text : col, off[k], ls);
    }
    rmark(p, AC, 0, -1, 0, 0, 1);
    const rA = clamp(16 / Math.sin(a / 2), 42, Math.hypot(AC, BC) * p.scale * .55);
    const b0 = Math.PI + a, b1 = 1.5 * Math.PI, rB = clamp(16 / Math.sin((b1 - b0) / 2), 42, Math.hypot(AC, BC) * p.scale * .55);
    const tA = at === 'A' ? (o.th ?? 'θ') : (o.other ?? ''), tB = at === 'B' ? (o.th ?? 'θ') : (o.other ?? '');
    const thCol = pal.text;
    if (tA || at === 'A') { arc(p, 0, 0, 34, 0, a, thCol, at === 'A' ? 3.2 : 2.2); if (tA) angLab(p, tA, 0, 0, 0, a, Math.max(rA, 52) + (tA.length > 3 ? tA.length * 5 : 0), thCol, ls + (tA === 'θ' ? 6 : 0), tA === 'θ'); }
    if (tB || at === 'B') { arc(p, AC, BC, 34, b0, b1, thCol, at === 'B' ? 3.2 : 2.2); if (tB) angLab(p, tB, AC, BC, b0, b1, Math.max(rB, 52) + (tB.length > 3 ? tB.length * 5 : 0), thCol, ls + (tB === 'θ' ? 6 : 0), tB === 'θ'); }
    if (o.verts) {
      p.label('A', 0, 0, { size: ls, italic: false, color: pal.muted, dx: -14, dy: 14 });
      p.label('C', AC, 0, { size: ls, italic: false, color: pal.muted, dx: 14, dy: 14 });
      p.label('B', AC, BC, { size: ls, italic: false, color: pal.muted, dx: 14, dy: -12 });
    }
    if (o.handle) handle(p, AC, BC);
  };

  /* ---------- tasks in "Naming the sides" ---------- */
  const NT = (() => {
    const lab = (tr, at, hlTxt, side, sideTxt) => ({
      at, hl: [side], tr, mark: '?',
      q: `θ is the angle at ${at}. ${hlTxt} What is this side called, relative to θ?`,
      ch: ['opposite', 'adjacent', 'hypotenuse'].map(r => [r,
        r === tr ? `Yes. ${RWHY[r]} ${sideTxt}` : `This side is not the ${r}. ${RWHY[r]} ${sideTxt}`, r === tr ? 1 : 0])
    });
    const rat = (at, hl, tr, known, why) => ({
      at, hl, tr, mark: 'known',
      q: `θ is the angle at ${at}. The two highlighted sides are the ones you know. They are the ${known}. Which ratio uses exactly these two sides?`,
      ch: ['sin', 'cos', 'tan'].map(r => [r === 'sin' ? 'sine' : r === 'cos' ? 'cosine' : 'tangent',
        r === tr ? `Yes. ${RNAME[r]} = ${RFORM[r]}. ${why}` : `${RNAME[r]} = ${RFORM[r]}, which needs the ${RUSES[r][0]} and the ${RUSES[r][1]}. ${why}`, r === tr ? 1 : 0])
    });
    return [
      lab('opposite', 'A', 'The highlighted side is the vertical one on the right.', 'bc', 'From A, the vertical side is across the triangle from the angle.'),
      lab('adjacent', 'B', 'The highlighted side is the same vertical one on the right.', 'bc', 'From B, the vertical side touches the angle, so the roles swapped.'),
      lab('opposite', 'B', 'The highlighted side is the one along the bottom.', 'ac', 'From B, the bottom side is across the triangle from the angle.'),
      rat('A', ['bc', 'ab'], 'sin', 'opposite and the hypotenuse', 'The vertical side is opposite A and the slanted side is the hypotenuse.'),
      rat('B', ['bc', 'ab'], 'cos', 'adjacent and the hypotenuse', 'From B the vertical side touches the angle, so it is adjacent. The slanted side is the hypotenuse.'),
      rat('A', ['bc', 'ac'], 'tan', 'opposite and the adjacent side', 'The vertical side is opposite A and the bottom side is adjacent to A. The hypotenuse is not needed.')
    ];
  })();

  /* ---------- estimates in "Table of ratios" ---------- */
  const EST = [
    { ang: 35, q: 'The table has sin 30° = 0.500 and sin 40° = 0.643. About what is sin 35°?',
      ch: [['About 0.50, the same as 30°', 'Sine grows with the angle, so sin 35° is a little more than sin 30°.'],
        ['About 0.57, in between', 'Yes. Halfway between 0.500 and 0.643 is about 0.57. The true value is 0.574.', 1],
        ['About 0.64, the same as 40°', 'Sine is still growing at 35°, so it has not reached sin 40° yet.'],
        ['About 0.75, far above both', 'A value between two table entries must lie between them. 0.75 is bigger than both.']] },
    { ang: 65, q: 'The table has tan 60° = 1.732 and tan 70° = 2.747. About what is tan 65°?',
      ch: [['About 1.4, below tan 60°', 'Tangent grows with the angle, so tan 65° is more than tan 60° = 1.732.'],
        ['About 2.2, in between', 'Yes. Halfway between 1.732 and 2.747 is about 2.24. The true value is 2.145, a little lower, because tangent climbs faster as the angle grows.', 1],
        ['About 2.9, above tan 70°', 'Tangent at 65° is less than tangent at 70° = 2.747, so it must be below 2.747.'],
        ['About 65, the angle itself', 'The angle is 65 degrees, but tan 65° is a ratio of two sides, not an angle.']] }
  ];

  /* ---------- tasks in "Using the ratios" ---------- */
  const UT = [
    { k: 'side', known: 'hyp', want: 'opp' }, { k: 'side', known: 'hyp', want: 'adj' }, { k: 'side', known: 'adj', want: 'opp' },
    { k: 'side', known: 'opp', want: 'adj' }, { k: 'side', known: 'opp', want: 'hyp' }, { k: 'side', known: 'adj', want: 'hyp' },
    { k: 'ang', a: 'opp', b: 'hyp', va: 7, vb: 10 }, { k: 'ang', a: 'adj', b: 'hyp', va: 8, vb: 10 }, { k: 'ang', a: 'opp', b: 'adj', va: 5, vb: 12 }
  ];
  const SN = { opp: 'opposite', adj: 'adjacent', hyp: 'hypotenuse' };
  const utLabel = t => t.k === 'side' ? `Know the ${SN[t.known]}, want the ${SN[t.want]}`
    : `Find the angle: ${SN[t.a]} ${t.va}, ${SN[t.b]} ${t.vb}`;
  const ratioFor = (x, y) => { const s = [x, y].sort().join(); return s === 'hyp,opp' ? 'sin' : s === 'adj,hyp' ? 'cos' : 'tan'; };
  /* all sides of the task triangle (and the angle) */
  const utNums = (t, al, L) => {
    if (t.k === 'ang') {
      const v = { [t.a]: t.va, [t.b]: t.vb };
      let ang;
      if (v.hyp && v.opp) ang = Math.asin(v.opp / v.hyp) / D2R; else if (v.hyp && v.adj) ang = Math.acos(v.adj / v.hyp) / D2R; else ang = Math.atan(v.opp / v.adj) / D2R;
      return { ang, v };
    }
    const Hr = t.known === 'hyp' ? L : t.known === 'opp' ? L / sinD(al) : L / cosD(al);
    return { ang: al, v: { hyp: Hr, opp: Hr * sinD(al), adj: Hr * cosD(al) } };
  };
  /* feedback for a choice of ratio (side tasks) or inverse (angle tasks) */
  const utWhy = (t, r) => {
    const k = t.k === 'side' ? [t.known, t.want] : [t.a, t.b], u = RUSES[r], need = k.map(x => SN[x]);
    const missing = need.filter(x => !u.includes(x));
    if (!missing.length) return null;
    const nm = t.k === 'ang' ? RNAME[r] + ' (and its inverse)' : RNAME[r];
    return `${nm} compares the ${u[0]} with the ${u[1]}. ${t.k === 'side' ? 'You know the ' + need[0] + ' and want the ' + need[1] : 'You know the ' + need[0] + ' and the ' + need[1]}, so ${missing.length === 2 ? 'neither of them is' : 'the ' + missing[0] + ' is not'} in ${RNAME[r].toLowerCase()}.`;
  };

  /* ---------- practice problems ---------- */
  const PR = [
    { fig: { al: 35, at: 'A', th: 'θ', txt: { ac: ['b'], bc: ['a'], ab: ['c'] }, neutral: true },
      q: 'In a right triangle, θ is one acute angle. Side a is across from θ. Side b touches θ and meets a at the right angle. Side c is the slanted side. Which naming is correct?',
      ch: [['a is adjacent, b is opposite, c is hypotenuse', 'Those two are swapped. The opposite side is across from θ, and that is a.'],
        ['a is opposite, b is adjacent, c is hypotenuse', 'Yes. a is across from θ (opposite), b touches θ (adjacent), and c is across from the right angle (hypotenuse).', 1],
        ['a is opposite, b is hypotenuse, c is adjacent', 'The hypotenuse is always the longest side, across from the right angle. That is c, the slanted side.'],
        ['a is hypotenuse, b is adjacent, c is opposite', 'The hypotenuse is across from the right angle, not a leg. The slanted side c is the hypotenuse.']] },
    { fig: { al: Math.atan(5 / 12) / D2R, at: 'A', th: '', txt: { ac: ['12'], bc: ['5'], ab: ['13'] }, neutral: true },
      q: 'A right triangle has legs 5 and 12 and hypotenuse 13. Angle A is the acute angle across from the leg of length 5. Which line is correct?',
      ch: [['sin A = 12/13, cos A = 5/13, tan A = 12/5', 'These ratios belong to the other acute angle. The 5 is opposite A, so sin A = 5/13.'],
        ['sin A = 5/13, cos A = 12/13, tan A = 5/12', 'Yes. Opposite is 5, adjacent is 12, hypotenuse is 13. So sin A = 5/13, cos A = 12/13, tan A = 5/12.', 1],
        ['sin A = 5/12, cos A = 12/13, tan A = 5/13', 'Sine and tangent are mixed up. Sine uses the hypotenuse (5/13). Tangent uses the two legs (5/12).'],
        ['sin A = 5/13, cos A = 13/12, tan A = 12/5', 'Cosine is adjacent ÷ hypotenuse, with the hypotenuse on the bottom. It cannot be more than 1.']] },
    { fig: { al: 35, at: 'A', th: '35°', txt: { ac: [], bc: ['opposite', '?'], ab: ['hypotenuse', '20'] }, hide: ['bc'], hl: ['bc'], names: true },
      q: 'A right triangle has a 35° angle and hypotenuse 20. How long is the side opposite the 35° angle? Use sin 35° ≈ 0.5736 and cos 35° ≈ 0.8192.',
      ch: [['20 × cos 35° ≈ 16.38', 'Cosine uses the adjacent side. The side you want is opposite the angle, so use sine.'],
        ['20 × sin 35° ≈ 11.47', 'Yes. sin 35° = opposite ÷ 20, so opposite = 20 × 0.5736 ≈ 11.47.', 1],
        ['20 ÷ sin 35° ≈ 34.87', 'That divides. Multiply by the sine to find the opposite side from the hypotenuse. Also, a leg cannot be longer than the hypotenuse 20.'],
        ['20 × tan 35° ≈ 14.00', 'Tangent compares opposite with adjacent, and 20 is the hypotenuse. The ratio that uses the hypotenuse and the opposite is sine.']] },
    { fig: { al: 52, at: 'A', th: '52°', txt: { ac: ['adjacent', '8'], bc: ['opposite', '?'], ab: [] }, hl: ['bc'] },
      q: 'A right triangle has a 52° angle. The side next to the angle (adjacent) is 8. How long is the opposite side? Use tan 52° ≈ 1.2799.',
      ch: [['8 ÷ tan 52° ≈ 6.25', 'That divides. tan 52° = opposite ÷ 8, so the opposite side is 8 × tan 52°. Also 52° is steeper than 45°, so the opposite side must be longer than 8.'],
        ['8 × sin 52° ≈ 6.30', 'Sine needs the hypotenuse, and 8 is not the hypotenuse here. The ratio for opposite and adjacent is tangent.'],
        ['8 × cos 52° ≈ 4.93', 'Cosine involves the adjacent side and the hypotenuse. The opposite side is not part of cosine.'],
        ['8 × tan 52° ≈ 10.24', 'Yes. tan 52° = opposite ÷ 8, so opposite = 8 × 1.2799 ≈ 10.24.', 1]] },
    { fig: { al: Math.asin(.7) / D2R, at: 'A', th: 'θ = ?', txt: { ac: [], bc: ['opposite', '7'], ab: ['hypotenuse', '10'] } },
      q: 'A right triangle has opposite side 7 and hypotenuse 10. What is the angle θ? Choose the inverse button.',
      ch: [['cos⁻¹(7 ÷ 10) ≈ 45.6°', 'Cosine uses the adjacent side. The 7 is the opposite side, so the matching ratio is sine.'],
        ['tan⁻¹(7 ÷ 10) ≈ 35.0°', 'Tangent compares the two legs. The 10 is the hypotenuse, not the adjacent leg.'],
        ['sin⁻¹(10 ÷ 7): no such angle', 'The ratio is upside down. Sine is opposite ÷ hypotenuse, at most 1. The hypotenuse cannot be less than a leg.'],
        ['sin⁻¹(7 ÷ 10) ≈ 44.4°', 'Yes. sin θ = 7 ÷ 10 = 0.7. The inverse sine key answers: which angle has sine 0.7? About 44.4°.', 1]] },
    { fig: { al: 20, at: 'A', th: '20°', other: '70°', txt: { ac: [], bc: [], ab: [] } },
      q: 'In a right triangle the acute angles are 20° and 70°. You know sin 20° ≈ 0.342. What is cos 70°?',
      ch: [['0.342', 'Yes. The side opposite 20° is the side adjacent to 70°, and the hypotenuse is shared. So cos 70° = sin 20° ≈ 0.342.', 1],
        ['0.940', 'That is cos 20°. The question asks about the other angle, 70°. From 70°, the adjacent side is the one that was opposite 20°.'],
        ['0.658', 'That is 1 − 0.342. Subtracting from 1 is not a rule for these ratios.'],
        ['2.747', 'That is tan 70°. Cosine is adjacent ÷ hypotenuse, so it is less than 1.']] },
    { fig: { al: Math.asin(.6) / D2R, at: 'A', th: 'θ', txt: { ac: ['adjacent', '?'], bc: ['opposite', '0.6'], ab: ['hypotenuse', '1'] }, hl: ['ac'] },
      q: 'A right triangle has hypotenuse 1. For the angle θ, sin θ = 0.6. What is cos θ? Use sin² θ + cos² θ = 1.',
      ch: [['0.4', 'That subtracts 0.6 from 1. The identity uses squares: cos² θ = 1 − 0.6².'],
        ['0.64', 'You found cos² θ = 1 − 0.36 = 0.64, but that is the square. Take its square root to get cos θ.'],
        ['0.8', 'Yes. cos² θ = 1 − 0.6² = 0.64, so cos θ = 0.8. Check: 0.6² + 0.8² = 0.36 + 0.64 = 1. This is the 3-4-5 triangle scaled down.', 1],
        ['1.6', 'Cosine of an acute angle in a right triangle is at most 1, because a leg is shorter than the hypotenuse.']] },
    { fig: { al: 40, at: 'A', th: '40°', H: 30, txt: { ac: [], bc: ['opposite', '?'], ab: ['hypotenuse', '30'] }, hl: ['bc'], ghost: [1 / 3] },
      q: 'A right triangle with a 40° angle has hypotenuse 10 and opposite side 6.43, so sin 40° ≈ 0.643. A student says: "A bigger right triangle with a 40° angle has hypotenuse 30, so its sin 40° must be three times as big." Which statement is correct?',
      ch: [['The student is right: the bigger triangle has sin 40° ≈ 1.93', 'The opposite side does get three times as long (about 19.3), but the hypotenuse does too. In the ratio the factor 3 cancels.'],
        ['Not enough information: you would have to measure the bigger triangle', 'No measuring is needed. Both triangles have angles 40°, 50° and 90°, so they are similar, and similar triangles have equal ratios of sides.'],
        ['The student is wrong: sin 40° ≈ 0.643 for any right triangle with a 40° angle', 'Yes. The two triangles are similar (AA), so opposite ÷ hypotenuse is the same. Sine belongs to the angle, not to the size.', 1],
        ['The student is wrong: sin 40° is 6.43, the opposite side', 'The sine is a ratio, opposite ÷ hypotenuse = 6.43 ÷ 10 = 0.643. It is not a length.']] }
  ];

  /* vary the place of the right answer */
  [[1, 1, 3], [2, 1, 2], [3, 2, 3], [6, 2, 3]].forEach(([i, x, y]) => { [PR[i].ch[x], PR[i].ch[y]] = [PR[i].ch[y], PR[i].ch[x]]; });

  register({
    id: 'trigonometric-ratios-sine-cosine-tangent', level: 'school',
    title: 'Trigonometric ratios: sine, cosine, tangent',
    blurb: 'Resize a right triangle and watch three ratios stay put, then name them, tabulate them and use them to find sides and angles.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 2.5; p.cy = 1.15; p.span = 3.6;
      const a = 30 * D2R;
      for (const [f, al] of [[1, .1], [.66, .16], [.34, .26]]) {
        const AC = 5 * f * Math.cos(a), BC = 5 * f * Math.sin(a);
        p.path([[0, 0], [AC, 0], [AC, BC]], { fill: alpha(pal.yellow, al), stroke: alpha(pal.text, .4), width: 1.4, close: true });
      }
      const AC = 5 * Math.cos(a), BC = 5 * Math.sin(a);
      p.path([[0, 0], [AC, 0]], { stroke: pal.green, width: 3 });
      p.path([[AC, 0], [AC, BC]], { stroke: pal.red, width: 3 });
      p.path([[0, 0], [AC, BC]], { stroke: pal.blue, width: 3 });
      p.path([[AC - .3, 0], [AC - .3, .3], [AC, .3]], { stroke: pal.text, width: 1.5 });
      p.label('θ', 1.15, .17, { size: 20, color: pal.text, align: 'left' });
      p.label('sin θ = opp ÷ hyp', 2.55, 3.55, { size: 13, italic: false, color: pal.text });
    },
    hook: String.raw`A ramp rises 1 m over a 4 m run. How steep is it, and does the answer change if the ramp is twice as long?`,
    steps: [
      { title: 'Does the size matter?',
        text: String.raw`<p>A ramp rises 1 m over a 4 m run. Its angle \(\theta\) is about \(14^\circ\). Would a ramp twice as long, built at the same angle, be steeper?</p><p>Predict what happens to opposite \(\div\) hypotenuse when every side doubles, then watch. Then try the <b>Size</b> slider and <b>Show similar copies</b>.</p>`,
        set: { mode: 'size', q: 1, ghost: true, at: 'A', al: 14, size: 4 } },
      { title: 'Opposite, adjacent, hypotenuse',
        text: String.raw`<p>Pick an angle \(\theta\). The <b>opposite</b> side is across from it. The <b>adjacent</b> side touches it. The <b>hypotenuse</b> is across from the right angle. Sine, cosine and tangent are ratios of these sides (SOH CAH TOA).</p><p>Predict what the labels do when \(\theta\) moves to the other acute angle. Then try the label tasks.</p>`,
        set: { mode: 'names', q: 1, at: 'A', nsub: 'explore', al: 35 } },
      { title: 'Build a table',
        text: String.raw`<p>Every angle has its own three ratios. Predict how tangent behaves, then look at the table and the graph for \(10^\circ\) to \(80^\circ\).</p><p>Sine grows from 0 toward 1. Cosine shrinks from 1 toward 0. Tangent keeps growing. Add angles yourself, then estimate a value between two table entries.</p>`,
        set: { mode: 'table', q: 1, at: 'A', al: 30 } },
      { title: 'The ratios are connected',
        text: String.raw`<p>Look at one triangle from its other acute angle. Opposite and adjacent swap, so \(\sin\theta = \cos(90^\circ-\theta)\). Predict, then check.</p><p>Use the <b>Relationship</b> menu for \(\tan\theta = \sin\theta/\cos\theta\) and \(\sin^2\theta + \cos^2\theta = 1\). Then open <b>Using the ratios</b> to find sides and angles.</p>`,
        set: { mode: 'rel', q: 1, rv: 'comp', at: 'A', al: 37 } }
    ],
    formal: String.raw`
      <p>Trigonometry begins with one question: when you know an angle of a right triangle, what do you know about its sides? The answer is that you know their <em>ratios</em>.</p>
      <h3>Why the ratios depend only on the angle</h3>
      <p>Take any two right triangles that share an acute angle \(\theta\). Each has a right angle and an angle \(\theta\), so the third angles are also equal (the angles of a triangle add to \(180^\circ\)). Two triangles with the same three angles are similar (AA). Similar triangles have equal ratios of corresponding sides. So in <em>every</em> right triangle with acute angle \(\theta\), the ratio opposite \(\div\) hypotenuse is the same number, and so are the other two ratios. Making the triangle larger changes the sides but not the ratios. That is why a 1 m rise over a 4 m run, and a 2 m rise over an 8 m run, are the same steepness: both have opposite \(\div\) adjacent \(= 0.25\), an angle of about \(14.04^\circ\).</p>
      <h3>Naming the sides and the three ratios</h3>
      <p>Choose one acute angle \(\theta\). The <em>hypotenuse</em> is the side across from the right angle. The <em>opposite</em> side is across from \(\theta\). The <em>adjacent</em> side touches \(\theta\) and is not the hypotenuse. The names belong to the angle you chose. At the other acute angle the opposite and adjacent sides swap.
      \[ \sin\theta = \frac{\text{opposite}}{\text{hypotenuse}}, \qquad \cos\theta = \frac{\text{adjacent}}{\text{hypotenuse}}, \qquad \tan\theta = \frac{\text{opposite}}{\text{adjacent}}. \]
      The mnemonic SOH CAH TOA lists them: Sine is Opposite over Hypotenuse, Cosine is Adjacent over Hypotenuse, Tangent is Opposite over Adjacent. For a triangle with legs \(5\) and \(12\) and hypotenuse \(13\), the angle \(A\) across from the \(5\) has \(\sin A = \tfrac{5}{13}\), \(\cos A = \tfrac{12}{13}\) and \(\tan A = \tfrac{5}{12}\).</p>
      <h3>What the table shows</h3>
      <p>As \(\theta\) grows from \(0^\circ\) toward \(90^\circ\), the opposite side grows and the adjacent side shrinks, so sine grows from \(0\) to \(1\), cosine shrinks from \(1\) to \(0\), and tangent grows without bound because the adjacent side shrinks toward \(0\). Two values are exact. A \(30^\circ\) angle comes from half of an equilateral triangle, whose short side is half the hypotenuse, so \(\sin 30^\circ = \tfrac12\). A \(45^\circ\) angle has equal legs, so \(\tan 45^\circ = 1\). The sibling lesson on special right triangles uses both. Between table entries you can estimate by going part of the way from one entry to the next. The estimate is close for sine and cosine, and a little high for tangent, because the tangent curve bends upward.</p>
      <h3>Relationships</h3>
      <p><b>Complementary angles.</b> The acute angles of a right triangle add to \(90^\circ\). The side opposite \(\theta\) is the side adjacent to the other angle \(90^\circ - \theta\), and the hypotenuse is the same. So
      \[ \sin\theta = \cos(90^\circ - \theta), \qquad \cos\theta = \sin(90^\circ - \theta). \]
      For example \(\sin 20^\circ = \cos 70^\circ \approx 0.342\). (The name cosine means "complement's sine".)</p>
      <p><b>Tangent as a quotient.</b> Divide the sine by the cosine and the hypotenuse cancels:
      \[ \frac{\sin\theta}{\cos\theta} = \frac{\text{opp}/\text{hyp}}{\text{adj}/\text{hyp}} = \frac{\text{opp}}{\text{adj}} = \tan\theta. \]</p>
      <p><b>The Pythagorean identity.</b> Scale the triangle so the hypotenuse is \(1\). Then the opposite side is \(\sin\theta\) and the adjacent side is \(\cos\theta\), because dividing by \(1\) changes nothing. The Pythagorean theorem gives
      \[ \sin^2\theta + \cos^2\theta = 1. \]
      Check at \(37^\circ\): \(\sin 37^\circ \approx 0.6018\) and \(\cos 37^\circ \approx 0.7986\), so \(0.3622 + 0.6378 = 1.0000\). Because the identity holds, from \(\sin\theta = 0.6\) you get \(\cos^2\theta = 1 - 0.36 = 0.64\) and \(\cos\theta = 0.8\).</p>
      <h3>Using the ratios</h3>
      <p><b>Finding a side.</b> Mark the angle, label the sides opposite, adjacent and hypotenuse for that angle, and choose the ratio that contains the side you know and the side you want. Then solve. With \(35^\circ\) and hypotenuse \(20\), the opposite side is wanted, so \(\sin 35^\circ = \dfrac{x}{20}\) and \(x = 20\sin 35^\circ \approx 11.47\). If the unknown is on the bottom, divide: with \(\cos 40^\circ = \dfrac{12}{h}\), \(h = \dfrac{12}{\cos 40^\circ} \approx 15.66\). A quick check: the hypotenuse must be the longest side.</p>
      <p><b>Finding an angle.</b> The inverse key answers "which angle has this ratio?". If \(\sin\theta = 0.7\), then \(\theta = \sin^{-1}(0.7) \approx 44.4^\circ\). The symbol \(\sin^{-1}\) means the inverse function, not \(1/\sin\). The sibling lesson on special right triangles puts these tools to work in real situations.</p>
      <p><b>Two common errors.</b> (1) The calculator must be in <em>degree</em> mode. In radian mode, \(\sin 35\) gives \(-0.4282\) instead of \(0.5736\). (2) Using the ratio for the wrong angle or the wrong side: always label the sides for the angle you are using, and remember that SOH CAH TOA puts the hypotenuse under sine and cosine only.</p>`,
    check: [
      { q: String.raw`A right triangle has a \(25^\circ\) angle, a hypotenuse of \(10\) and an opposite side of about \(4.23\). A second right triangle also has a \(25^\circ\) angle, but its hypotenuse is \(50\). What is opposite \(\div\) hypotenuse in the second triangle?`,
        choices: [String.raw`About \(21.1\), because the opposite side is five times as long`, String.raw`About \(0.846\), because the triangle is five times as large`,
          String.raw`About \(0.423\), the same as in the first triangle`, 'It cannot be known without measuring the second triangle'], answer: 2,
        why: String.raw`Both triangles have angles \(25^\circ\), \(65^\circ\) and \(90^\circ\), so they are similar. Similar triangles have equal ratios of sides, so opposite \(\div\) hypotenuse is \(4.23/10 \approx 0.423\) in both. The opposite side of the second triangle is about \(21.1\), but dividing by the hypotenuse \(50\) brings the ratio back to \(0.423\).`,
        hint: 'Both triangles have the same angles. What does that say about their sides?' },
      { q: String.raw`You hold a kite string that is \(60\) m long and pulled straight. It makes a \(40^\circ\) angle with level ground. Your hand is \(1.5\) m above the ground. Use \(\sin 40^\circ \approx 0.643\) and \(\cos 40^\circ \approx 0.766\). About how high is the kite above the ground?`,
        choices: ['38.6 m', '94.8 m', '40.1 m', '47.5 m'], answer: 2,
        why: String.raw`The string is the hypotenuse and the height above your hand is opposite the \(40^\circ\) angle, so the height is \(60 \times \sin 40^\circ \approx 60 \times 0.643 = 38.6\) m. The kite is above your hand, so add \(1.5\) m: about \(40.1\) m. The choice 38.6 forgets your hand, 47.5 uses cosine (the horizontal distance) by mistake, and 94.8 divides by sine.`,
        hint: 'Which ratio links the hypotenuse and the opposite side? Do you need to add anything at the end?' },
      { q: String.raw`A student solves: "A right triangle has a \(40^\circ\) angle and the side adjacent to it is \(12\). Find the hypotenuse \(h\). Step 1: \(\cos 40^\circ = 12/h\). Step 2: \(h = 12 \times \cos 40^\circ \approx 12 \times 0.766 = 9.2\)." Which statement is correct?`,
        choices: [String.raw`Step 1 is wrong: it should be sine, because the hypotenuse is involved.`, String.raw`Step 2 is wrong: it should divide, \(h = 12 \div 0.766 \approx 15.7\), and the hypotenuse must be longer than the leg \(12\).`,
          'Both steps are correct, because the answer is positive.', String.raw`Step 2 is wrong: it should be \(h = 0.766 \div 12\).`], answer: 1,
        why: String.raw`Step 1 is right: the adjacent side and the hypotenuse give cosine. In \(\cos 40^\circ = 12/h\) the unknown is on the bottom, so multiply both sides by \(h\) and divide by \(\cos 40^\circ\): \(h = 12/0.766 \approx 15.7\). The wrong answer \(9.2\) is shorter than the leg \(12\), which is impossible for a hypotenuse.`,
        hint: 'Is the answer sensible? Which side must be the longest?' }
    ],
    links: { prereq: ['similar-triangles-aa-sas-sss', 'pythagorean-theorem'], next: ['special-right-triangles-and-trigonometry'],
      related: ['similarity-and-scaling', 'the-unit-circle-and-trig-waves', 'slope-and-linear-functions', 'distance-and-the-pythagorean-theorem', 'square-roots-and-irrational-numbers', 'radians-the-circles-own-angle-unit'] },

    mount({ stage, controls: C }) {
      const st = { al: 30, size: 6, len: 20 };
      const V = { mode: 'size', at: 'A', q: 0, rv: 'comp', nsub: 'explore', ghost: false, pfb: '', pick: -1, tbl: {}, ut: 0, ufb: '', usolved: false, upick: -1 };
      const mkS = n => ({ i: 0, solved: Array(n).fill(false), first: Array(n).fill(false), wrong: Array.from({ length: n }, () => []), fb: Array(n).fill('') });
      const NS = mkS(NT.length), ES = mkS(EST.length), PS = mkS(PR.length);
      let cancel = () => {};
      const P = new Plane(stage, { span: 5 });

      /* ---------- derived numbers ---------- */
      const th = () => V.at === 'A' ? st.al : 90 - st.al;            /* value of the chosen angle theta */
      const ntask = () => V.mode === 'names' && V.nsub === 'tasks' ? NT[NS.i] : null;
      const curAt = () => ntask() ? ntask().at : V.at;
      const usingAng = () => V.mode === 'use' && UT[V.ut].k === 'ang';
      const hpos = () => {                                           /* where the draggable corner sits (math units) */
        const a = st.al * D2R;
        if (V.mode === 'size') return [st.size * Math.cos(a), st.size * Math.sin(a)];
        if (V.mode === 'rel' && V.rv === 'div') return [1, Math.tan(a)];
        if (V.mode === 'rel' && V.rv === 'pyth') return [Math.cos(a), Math.sin(a)];
        if (V.mode === 'names' || V.mode === 'rel') return [10 * Math.cos(a), 10 * Math.sin(a)];
        return null;
      };

      /* ---------- chart for the table ---------- */
      const chart = (c, p) => {
        const pal = p.pal, x0 = clamp(p.w * .1, 38, 56), x1 = p.w - 30, y0 = p.h * .56, y1 = p.h - 30, ymax = 6;
        const X = d => x0 + (x1 - x0) * d / 90, Y = v => y1 - (y1 - y0) * v / ymax, fs = 12;
        c.save(); c.font = `500 ${fs}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`; c.textBaseline = 'middle';
        c.lineWidth = 1;
        for (let v = 0; v <= ymax; v++) {
          c.strokeStyle = v === 0 ? pal['grid-strong'] : pal.grid; c.beginPath(); c.moveTo(x0, Y(v)); c.lineTo(x1, Y(v)); c.stroke();
          c.fillStyle = pal.muted; c.textAlign = 'right'; c.fillText(String(v), x0 - 6, Y(v));
        }
        c.textAlign = 'center';
        [0, 30, 60, 90].forEach(d => { c.fillStyle = pal.muted; c.fillText(d + '°', X(d), y1 + 14); });
        c.strokeStyle = pal.grid; TBL.forEach(d => { c.beginPath(); c.moveTo(X(d), y1); c.lineTo(X(d), y1 + 4); c.stroke(); });
        /* current angle */
        c.setLineDash([5, 5]); c.strokeStyle = pal.muted; c.lineWidth = 1.6; c.beginPath(); c.moveTo(X(st.al), y0 - 4); c.lineTo(X(st.al), y1); c.stroke(); c.setLineDash([]);
        const series = [['sin', sinD, pal.blue, 'c'], ['cos', cosD, pal.green, 's'], ['tan', tanD, pal.violet, 'd']];
        const mark = (shape, x, y, col, full) => {
          c.beginPath();
          if (shape === 'c') c.arc(x, y, 5.5, 0, TAU);
          else if (shape === 's') c.rect(x - 5, y - 5, 10, 10);
          else { c.moveTo(x, y - 7); c.lineTo(x + 6.5, y); c.lineTo(x, y + 7); c.lineTo(x - 6.5, y); c.closePath(); }
          if (full) { c.fillStyle = col; c.fill(); } else { c.fillStyle = pal.stage; c.fill(); c.strokeStyle = col; c.lineWidth = 2; c.stroke(); }
        };
        const have = TBL.filter(d => V.tbl[d]);
        series.forEach(([, fn, col, sh]) => {
          if (have.length > 1) { c.strokeStyle = alpha(col, .45); c.lineWidth = 2; c.beginPath(); have.forEach((d, i) => { i ? c.lineTo(X(d), Y(fn(d))) : c.moveTo(X(d), Y(fn(d))); }); c.stroke(); }
          have.forEach(d => mark(sh, X(d), Y(fn(d)), col, true));
          if (st.al % 10 !== 0 || !V.tbl[st.al]) mark(sh, X(st.al), Y(Math.min(fn(st.al), ymax)), col, false);
        });
        /* legend, with shapes as well as colors */
        let lx = x0 + 10;
        c.textAlign = 'left'; c.font = `600 13px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`;
        series.forEach(([nm, , col, sh]) => { mark(sh, lx + 6, y0 + 12, col, true); c.fillStyle = pal.text; c.fillText(nm + ' θ', lx + 17, y0 + 12); lx += 70; });
        c.fillStyle = pal.muted; c.textAlign = 'left'; c.font = `500 12px "Hanken Grotesk", Arial, sans-serif`; c.fillText('filled = in your table, hollow = this angle', x0 + 10, y0 + 32);
        c.restore();
      };

      /* ---------- scenes ---------- */
      const drawSize = (c, p) => {
        const pal = p.pal, H = st.size, a = st.al * D2R, hide = V.q === 1;
        box(p, 0, 0, Math.max(10 * Math.cos(a), 3), Math.max(10 * Math.sin(a), 3), clamp(p.w * .23, 60, 140), 96, 54);
        p.path([[0, 0], [10 * Math.cos(a) + .2, 0]], { stroke: pal['grid-strong'], width: 1.5 });
        if (V.ghost) for (const f of [.4, .7]) {
          const h2 = H * f;
          p.path([[0, 0], [h2 * Math.cos(a), 0], [h2 * Math.cos(a), h2 * Math.sin(a)]], { stroke: alpha(pal.text, .55), width: 2, dash: [6, 5], close: true });
        }
        tri(p, st.al, H, { at: 'A', names: true, nums: true, handle: true });
        const q = v => hide ? '?' : f3(v);
        caption(p, [`sin θ = opp ÷ hyp = ${q(sinD(st.al))}`, `cos θ = adj ÷ hyp = ${q(cosD(st.al))}`, `tan θ = opp ÷ adj = ${q(tanD(st.al))}`]);
        if (V.ghost) { const c2 = p.ctx; c2.font = '500 13px "Hanken Grotesk", Arial, sans-serif'; c2.fillStyle = pal.muted; c2.textAlign = 'left'; c2.fillText('dashed: similar copies with the same angle', 14, 20 + 3 * 21); }
      };
      const drawNames = (c, p) => {
        const pal = p.pal, a = st.al * D2R, AC = 10 * Math.cos(a), BC = 10 * Math.sin(a), tk = ntask(), rev = tk && NS.solved[NS.i];
        box(p, 0, 0, Math.max(AC, 4), Math.max(BC, 4), clamp(p.w * .23, 60, 140), 46, 62);
        if (tk && !rev) {
          const txt = {}; tk.hl.forEach(k => { txt[k] = [tk.mark]; });
          tri(p, st.al, 10, { at: tk.at, neutral: true, hl: tk.hl, txt, verts: true, handle: true });
        } else {
          const at = curAt();
          tri(p, st.al, 10, { at, names: true, nums: true, verts: true, handle: true });
        }
        const at = curAt();
        caption(p, [`θ is the angle at ${at}`, `θ = ${at === 'A' ? st.al : 90 - st.al}°`], [pal.text, pal.muted]);
      };
      const drawTable = (c, p) => {
        const pal = p.pal, a = st.al * D2R, AC = 10 * Math.cos(a), BC = 10 * Math.sin(a);
        box(p, 0, 0, Math.max(AC, 4), Math.max(BC, 3), clamp(p.w * .23, 60, 140), 30, p.h * .44 + 92);
        tri(p, st.al, 10, { at: 'A', names: true, nums: true });
        caption(p, [`θ = ${st.al}°`]);
        chart(c, p);
      };
      const drawRel = (c, p) => {
        const pal = p.pal, ls = fsz(p), a = st.al * D2R, s = Math.sin(a), co = Math.cos(a), tn = Math.tan(a);
        const T = th(), O = 90 - T;
        if (V.rv === 'comp') {
          const AC = 10 * co, BC = 10 * s;
          box(p, 0, 0, Math.max(AC, 4), Math.max(BC, 4), clamp(p.w * .23, 60, 140), 60, 62);
          tri(p, st.al, 10, { at: V.at, names: true, nums: true, verts: true, handle: true, th: 'θ', other: O + '°' });
          caption(p, V.q === 1 ? [`θ = ${T}°   other angle = ${O}°`] : [`θ = ${T}°   other angle = ${O}°`, `sin ${T}° = ${f3(sinD(T))}   cos ${O}° = ${f3(cosD(O))}`]);
        } else if (V.rv === 'div') {
          box(p, 0, 0, 1, Math.max(tn, .5), clamp(p.w * .3, 60, 160), 56, 64);
          p.path([[0, 0], [1, 0], [1, tn]], { stroke: alpha(pal.text, .55), width: 2, dash: [6, 5], close: true });
          p.path([[1, 0], [1, tn]], { stroke: pal.red, width: 4.5 });
          p.path([[0, 0], [1, 0]], { stroke: pal.green, width: 4.5 });
          p.label('adjacent = 1', 1, 0, { size: ls, italic: false, color: pal.green, dy: 46, align: 'right' });
          p.label('opposite', 1, tn / 2, { size: ls, italic: false, color: pal.red, dx: 10, dy: -10, align: 'left' });
          p.label('tan θ = ' + f3(tn), 1, tn / 2, { size: ls, italic: false, color: pal.red, dx: 10, dy: 10, align: 'left' });
          rmark(p, 1, 0, -1, 0, 0, 1);
          tri(p, st.al, 1, { at: 'A', txt: { ac: ['cos θ'], bc: [], ab: ['1'] }, handle: false });
          p.label('sin θ', co, s / 2, { size: ls, italic: false, color: pal.red, dx: -10, align: 'right' });
          handle(p, 1, tn);
          caption(p, [`sin θ ÷ cos θ = ${f3(s)} ÷ ${f3(co)}`, `tan θ = ${f3(tn)}`]);
        } else {
          box(p, 0, -.5, 1, 1.04, clamp(p.w * .23, 60, 140), 40, 56);
          tri(p, st.al, 1, { at: 'A', txt: { ac: ['cos θ = ' + f3(co)], bc: ['sin θ = ' + f3(s)], ab: ['1'] }, handle: true });
          p.path([[0, -.27], [co * co, -.27]], { stroke: pal.green, width: 12 });
          p.path([[co * co, -.27], [1, -.27]], { stroke: pal.red, width: 12 });
          p.label('cos² θ = ' + f3(co * co), 0, -.27, { size: ls, italic: false, color: pal.green, dy: 26, align: 'left' });
          p.label('sin² θ = ' + f3(s * s), 0, -.27, { size: ls, italic: false, color: pal.red, dy: 48, align: 'left' });
          p.label('whole bar = 1² = 1', 0, -.27, { size: ls, italic: false, color: pal.muted, dy: 70, align: 'left' });
        }
      };
      const useState = () => {
        const t = UT[V.ut], n = utNums(t, st.al, st.len);
        return { t, n };
      };
      const drawUse = (c, p) => {
        const pal = p.pal, { t, n } = useState(), a = n.ang * D2R, AC = 10 * Math.cos(a), BC = 10 * Math.sin(a), sol = V.usolved;
        box(p, 0, 0, Math.max(AC, 4), Math.max(BC, 4), clamp(p.w * .23, 60, 140), 46, 62);
        const txt = {}, val = x => (Math.abs(n.v[x] - Math.round(n.v[x])) < 1e-9 ? String(Math.round(n.v[x])) : f2(n.v[x]));
        const sideKey = { opp: 'bc', adj: 'ac', hyp: 'ab' };
        for (const r of ['opp', 'adj', 'hyp']) txt[sideKey[r]] = [SN[r]];
        let th2 = 'θ';
        if (t.k === 'side') {
          txt[sideKey[t.known]].push(val(t.known));
          txt[sideKey[t.want]].push(sol ? val(t.want) : '?');
        } else {
          txt[sideKey[t.a]].push(String(t.va)); txt[sideKey[t.b]].push(String(t.vb));
          th2 = sol ? 'θ ≈ ' + f1(n.ang) + '°' : 'θ = ?';
        }
        tri(p, n.ang, 10, { at: 'A', txt, th: th2, hl: t.k === 'side' ? [sideKey[t.want]] : [], verts: true });
        caption(p, t.k === 'side' ? [`θ = ${st.al}°`] : [utLabel(t)]);
      };
      const drawPrac = (c, p) => {
        const pr = PR[PS.i], f = pr.fig, a = f.al * D2R, H = f.H || 10, AC = H * Math.cos(a), BC = H * Math.sin(a);
        box(p, 0, 0, Math.max(AC, 4), Math.max(BC, 3.5), clamp(p.w * .23, 60, 140), 50, 62);
        if (f.ghost) for (const k of f.ghost) p.path([[0, 0], [AC * k, 0], [AC * k, BC * k]], { stroke: alpha(p.pal.text, .6), width: 2.5, dash: [6, 5], close: true });
        const opt = { at: f.at, th: f.th, other: f.other, txt: f.txt, neutral: f.neutral, names: f.names, nums: !!f.nums, hl: f.hl, hide: f.hide, verts: true };
        tri(p, f.al, H, opt);
        if (f.ghost) { const c2 = p.ctx; c2.font = '500 13px "Hanken Grotesk", Arial, sans-serif'; c2.fillStyle = p.pal.muted; c2.textAlign = 'left'; c2.fillText('dashed: the first triangle (hypotenuse 10, opposite 6.43)', 14, 20); }
      };

      P.onDraw = (c, p) => { ({ size: drawSize, names: drawNames, table: drawTable, rel: drawRel, use: drawUse, prac: drawPrac })[V.mode](c, p); };

      /* ---------- controls ---------- */
      C.title('Explore');
      const modeSel = C.select({ label: 'Choose a scene', options: MODES.map(([value, label]) => ({ value, label })), value: 'size', onChange: v => go(v) });
      const host = modeSel.parentNode.parentNode, last = () => host.lastElementChild;
      const items = [];
      const reg = (fn, el) => { items.push([fn, el || last()]); };
      const touch = () => { if (V.q > 0) { V.q = 0; V.pfb = ''; vis(); renderPQ(); } };
      const redraw = () => { syncSliders(); P.requestDraw(); upd(); };
      C.hint(HINTS.size); const hintEl = last();

      const relSel = C.select({ label: 'Relationship', options: [{ value: 'comp', label: 'sin θ = cos(90° − θ)' }, { value: 'div', label: 'tan θ = sin θ ÷ cos θ' }, { value: 'pyth', label: 'sin² θ + cos² θ = 1' }], value: 'comp',
        onChange: v => { cancel(); V.rv = v; sync(); } });
      reg(() => V.mode === 'rel', relSel.parentNode);
      const useSel = C.select({ label: 'Task', options: UT.map((t, i) => ({ value: String(i), label: utLabel(t) })), value: '0',
        onChange: v => { cancel(); V.ut = +v; V.ufb = ''; V.usolved = false; V.upick = -1; sync(); } });
      reg(() => V.mode === 'use', useSel.parentNode);

      const angVis = () => V.mode === 'size' || V.mode === 'table' || V.mode === 'rel' || (V.mode === 'names') || (V.mode === 'use' && !usingAng());
      const alS = C.slider({ label: 'Angle (degrees)', min: 5, max: 85, step: 1, value: st.al, format: v => Math.round(v) + '°',
        onInput: v => { cancel(); touch(); st.al = v; redraw(); } });
      reg(angVis);
      const step = d => () => { cancel(); touch(); st.al = clamp(st.al + d, 5, 85); redraw(); };
      const stepB = C.buttons([{ label: '−5°', onClick: step(-5) }, { label: '−1°', onClick: step(-1) }, { label: '+1°', onClick: step(1) }, { label: '+5°', onClick: step(5) }]);
      reg(angVis, stepB[0].parentNode);

      const szS = C.slider({ label: 'Size (hypotenuse length)', min: 2, max: 10, step: .5, value: st.size, format: v => num(v),
        onInput: v => { cancel(); touch(); st.size = v; redraw(); } });
      reg(() => V.mode === 'size');
      const szB = C.buttons([{ label: 'Halve every side', onClick: () => { cancel(); touch(); st.size = clamp(st.size / 2, 2, 10); redraw(); } },
        { label: 'Double every side', onClick: () => { cancel(); touch(); st.size = clamp(st.size * 2, 2, 10); redraw(); } }]);
      reg(() => V.mode === 'size', szB[0].parentNode);
      const ghostT = C.toggle({ label: 'Show similar copies (same angle)', value: false, onChange: v => { V.ghost = v; sync(); } });
      reg(() => V.mode === 'size', ghostT.parentNode);

      const atB = C.buttons([{ label: 'θ is the angle at A', onClick: () => { cancel(); V.at = 'A'; sync(); } }, { label: 'θ is the angle at B', onClick: () => { cancel(); V.at = 'B'; sync(); } }]);
      reg(() => (V.mode === 'names' && V.nsub === 'explore') || (V.mode === 'rel' && V.rv === 'comp'), atB[0].parentNode);
      const subB = C.buttons([{ label: 'Explore', onClick: () => { cancel(); V.nsub = 'explore'; sync(); } }, { label: 'Try the label tasks', onClick: () => { cancel(); V.nsub = 'tasks'; sync(); } }]);
      reg(() => V.mode === 'names', subB[0].parentNode);
      const preB = C.buttons([{ label: 'Set θ = 37°', onClick: () => { cancel(); touch(); st.al = 37; sync(); } }]);
      reg(() => V.mode === 'rel', preB[0].parentNode);

      const lenS = C.slider({ label: 'Known side length', min: 1, max: 20, step: 1, value: st.len, format: v => num(v),
        onInput: v => { cancel(); st.len = v; V.ufb = ''; V.usolved = false; V.upick = -1; renderUse(); redraw(); } });
      reg(() => V.mode === 'use' && !usingAng());

      /* table controls */
      const tbB = C.buttons([
        { label: 'Previous table angle', onClick: () => { cancel(); touch(); st.al = clamp(Math.ceil(st.al / 10) * 10 - 10, 10, 80); sync(); } },
        { label: 'Next table angle', onClick: () => { cancel(); touch(); st.al = clamp(Math.floor(st.al / 10) * 10 + 10, 10, 80); sync(); } }]);
      reg(() => V.mode === 'table' && V.q !== 1, tbB[0].parentNode);
      const tbB2 = C.buttons([
        { label: 'Add this angle to the table', onClick: () => { if (st.al % 10 === 0) V.tbl[st.al] = true; sync(); } },
        { label: 'Fill the table', onClick: () => { TBL.forEach(d => { V.tbl[d] = true; }); sync(); } },
        { label: 'Clear the table', onClick: () => { V.tbl = {}; sync(); } }]);
      reg(() => V.mode === 'table' && V.q !== 1, tbB2[0].parentNode);
      const tblEl = h('div', { class: 'ctl', style: 'overflow-x:auto' });
      host.append(tblEl);
      reg(() => V.mode === 'table' && V.q !== 1, tblEl);
      const renderTbl = () => {
        const cell = 'padding:3px 8px;text-align:right;border-bottom:1px solid var(--line);font-variant-numeric:tabular-nums';
        const rows = TBL.map(d => {
          const on = V.tbl[d], cur = d === st.al, v = x => on ? f3(x) : '?';
          return `<tr style="${cur ? 'font-weight:700;background:rgba(127,127,127,.15)' : ''}"><td style="${cell}">${d}°</td><td style="${cell}">${v(sinD(d))}</td><td style="${cell}">${v(cosD(d))}</td><td style="${cell}">${v(tanD(d))}</td></tr>`;
        }).join('');
        tblEl.innerHTML = `<table style="border-collapse:collapse;width:100%;font-size:.9rem"><caption style="text-align:left;font-size:.8rem;opacity:.75;padding-bottom:4px">Your table of ratios. Each row is read from a triangle at that angle.</caption><thead><tr><th style="${cell}">θ</th><th style="${cell}">sin θ</th><th style="${cell}">cos θ</th><th style="${cell}">tan θ</th></tr></thead><tbody>${rows}</tbody></table>`;
      };
      const boxStyle = 'display:flex;flex-direction:column;gap:8px;border:1px solid var(--line-strong);border-radius:6px;padding:12px';

      /* predict panel */
      const pqEl = h('div', { class: 'ctl', style: boxStyle });
      host.append(pqEl);
      reg(() => V.q > 0 && !!pqDef() && !(V.mode === 'names' && V.nsub === 'tasks'), pqEl);
      const pqDef = () => {
        if (V.mode === 'size') {
          const dbl = st.size * 2 <= 10, H0 = st.size, H1 = dbl ? H0 * 2 : H0 / 2, sA = sinD(st.al);
          return { q: `Predict first. The angle stays ${st.al}°, and every side is about to ${dbl ? 'double' : 'be cut in half'}. Does opposite ÷ hypotenuse change?`, ch: [
            [dbl ? 'It doubles' : 'It halves', `No. The opposite side changes, but so does the hypotenuse. A fraction with top and bottom changed the same way keeps its value, like 1/2 and 2/4.`],
            ['It stays the same', 'Yes. The new triangle has the same angles, so it is similar to the old one (AA), and similar triangles have equal ratios of sides.', 1],
            ['It changes, but I cannot say how', 'It does not change. The two triangles have the same three angles, so all their side ratios match.'],
            ['It depends on how big the triangle is', 'It does not. The ratio belongs to the angle, not to the size of the triangle.']],
          extra: () => `Hypotenuse ${f2(H0)} became ${f2(H1)} and the opposite side ${f2(H0 * sA)} became ${f2(H1 * sA)}, but opposite ÷ hypotenuse is ${f3(sA)} both times.`,
          act: () => { cancel(); cancel = animateTo(st, { size: H1 }, 700, () => { syncSliders(); P.draw(); upd(); }, sync); } };
        }
        if (V.mode === 'names') {
          return { q: 'Predict first. θ is the angle at A, and the vertical side BC is opposite θ. If θ moves to the other acute angle, at B, what is the side BC called?', ch: [
            ['Still opposite', 'No. The vertical side now touches the angle at B, so it is not across from it.'],
            ['Hypotenuse', 'No. The hypotenuse is the slanted side, across from the right angle. It never changes.'],
            ['Adjacent', 'Yes. From B, the side BC touches the angle, so it is adjacent. The names belong to the angle you choose.', 1],
            ['It has no name', 'Every side has a name for every angle you choose. They depend on which angle is θ.']],
          act: () => { V.at = 'B'; sync(); } };
        }
        if (V.mode === 'table') {
          return { q: 'Predict first. The angle grows from 10° to 80°. What does tan θ do?', ch: [
            ['It grows faster and faster, past 5 near 80°', 'Yes. Opposite grows while adjacent shrinks, so opposite ÷ adjacent climbs steeply. Sine and cosine cannot do that, because the hypotenuse is always the longest side.', 1],
            ['It grows and stops at 1, like sine', 'Sine stops below 1 because the opposite side can never beat the hypotenuse. Tangent divides by a leg, which can be tiny.'],
            ['It shrinks toward 0, like cosine', 'Cosine shrinks because the adjacent side shrinks. Tangent has the adjacent side on the bottom, so shrinking makes it larger.'],
            ['It stays near 0.5', 'Tangent is 0.5 only near 27°. At 45° the legs are equal and it is exactly 1, and it keeps growing.']],
          extra: () => 'tan 10° = 0.176, tan 45° = 1 exactly and tan 80° = 5.671.',
          act: () => { TBL.forEach(d => { V.tbl[d] = true; }); sync(); } };
        }
        if (V.mode === 'rel') {
          const T = st.al, O = 90 - T;
          return { q: `Predict first. A right triangle has acute angles ${T}° and ${O}°, and sin ${T}° ≈ ${f3(sinD(T))}. Which of these is also about ${f3(sinD(T))}?`, ch: [
            [`sin ${O}°`, `No. The side opposite ${T}° is the side adjacent to ${O}°, so it appears in cosine of ${O}°, not sine.`],
            [`tan ${O}°`, `Tangent of ${O}° compares two legs. The ratio with the same two sides as sin ${T}° (leg over hypotenuse) is a cosine.`],
            [`1 ÷ cos ${O}°`, `That is the reciprocal. The ratio is opposite ÷ hypotenuse for ${T}°, which is adjacent ÷ hypotenuse for ${O}°, not upside down.`],
            [`cos ${O}°`, `Yes. The side opposite ${T}° is adjacent to ${O}°, and the hypotenuse is shared. So sin ${T}° = cos ${O}° ≈ ${f3(cosD(O))}.`, 1]] };
        }
        return null;
      };
      const renderPQ = () => {
        const d = pqDef(); pqEl.innerHTML = '';
        if (!d || V.q === 0) return;
        pqEl.append(h('p', { class: 'ctl-title', style: 'margin:0' }, d.q));
        const row = h('div', { class: 'ctl buttons', style: 'flex-direction:column;align-items:stretch' });
        d.ch.forEach((ch, i) => row.append(h('button', { type: 'button', class: 'btn' + (V.pick === i ? ' primary' : ''), ...(V.q === 2 ? { disabled: '' } : {}),
          style: 'justify-content:flex-start;text-align:left;white-space:normal',
          onclick: () => {
            V.pick = i;
            V.pfb = (ch[2] ? '<b>Your prediction is right.</b> ' : '<b>Not this time.</b> ') + ch[1].replace(/^Yes\. /, '') + (d.extra ? ' ' + d.extra() : '');
            V.q = 2; if (d.act) d.act();
            vis(); renderPQ(); P.requestDraw(); upd();
          } }, ch[0])));
        pqEl.append(row);
        if (V.q === 2) pqEl.append(h('div', { class: 'ctl readout', 'aria-live': 'polite', html: V.pfb }));
      };

      /* generic multiple-choice panel (tasks, estimates, practice) */
      const quiz = (el, list, S, o) => {
        el.innerHTML = '';
        const i = S.i, pr = list[i], N = list.length, done = S.solved.filter(Boolean).length, ok1 = S.first.filter(Boolean).length;
        el.append(h('p', { class: 'ctl-title', style: 'margin:0' }, `${o.noun} ${i + 1} of ${N}`),
          h('p', { class: 'hint', style: 'margin:0' }, `Right on the first try: ${ok1} of ${done} solved`),
          h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' }, pr.q));
        const col = h('div', { style: 'display:flex;flex-direction:column;gap:8px' });
        pr.ch.forEach((ch, k) => {
          const wrong = S.wrong[i].includes(k), good = S.solved[i] && ch[2];
          col.append(h('button', { type: 'button', class: 'btn' + (good ? ' primary' : ''), ...((wrong || S.solved[i]) && !good ? { disabled: '' } : {}),
            style: 'justify-content:flex-start;text-align:left;border-radius:10px;white-space:normal;padding:8px 14px',
            onclick: () => {
              if (S.solved[i]) return;
              if (ch[2]) { S.solved[i] = true; S.first[i] = S.wrong[i].length === 0; S.fb[i] = '<b>Correct.</b> ' + ch[1].replace(/^Yes\. /, ''); if (o.onSolve) o.onSolve(i); }
              else { S.wrong[i].push(k); S.fb[i] = '<b>Not this one.</b> ' + ch[1] + ' Try another choice.'; }
              o.render(); P.requestDraw(); upd();
            } }, (good ? '✓ ' : wrong ? '✗ ' : '') + ch[0]));
        });
        el.append(col);
        if (S.fb[i]) el.append(h('div', { class: 'ctl readout', 'aria-live': 'polite', html: S.fb[i] }));
        const lastP = i === N - 1;
        el.append(h('div', { class: 'ctl buttons' }, h('button', { type: 'button', class: 'btn primary', ...(S.solved[i] ? {} : { disabled: '' }),
          onclick: () => {
            if (lastP) { S.i = 0; list.forEach((_, j) => { S.solved[j] = false; S.first[j] = false; S.wrong[j] = []; S.fb[j] = ''; }); }
            else S.i++;
            o.render(); P.requestDraw(); upd();
          } }, lastP ? 'Start over' : o.next)));
        if (lastP && S.solved[i]) el.append(h('div', { class: 'ctl readout', html: `<b>All done.</b> You got ${ok1} of ${N} right on the first try.` }));
      };

      const ntEl = h('div', { class: 'ctl', style: boxStyle });
      host.append(ntEl); reg(() => V.mode === 'names' && V.nsub === 'tasks', ntEl);
      const renderNT = () => quiz(ntEl, NT, NS, { noun: 'Task', next: 'Next task', render: () => { renderNT(); } });
      const esEl = h('div', { class: 'ctl', style: boxStyle });
      host.append(esEl); reg(() => V.mode === 'table' && V.q !== 1, esEl);
      const renderES = () => quiz(esEl, EST, ES, { noun: 'Estimate', next: 'Next estimate', render: renderES,
        onSolve: i => { cancel(); cancel = animateTo(st, { al: EST[i].ang }, 700, () => { syncSliders(); P.draw(); upd(); }, sync); } });

      /* "Using the ratios" panel */
      const usEl = h('div', { class: 'ctl', style: boxStyle });
      host.append(usEl); reg(() => V.mode === 'use', usEl);
      const renderUse = () => {
        usEl.innerHTML = '';
        const { t, n } = useState(), ang = t.k === 'ang';
        usEl.append(h('p', { class: 'ctl-title', style: 'margin:0' }, ang ? 'Which inverse button answers this? Think: which ratio do the two given sides make?' : 'Which ratio links the side you know and the side you want?'));
        const row = h('div', { class: 'ctl buttons' });
        ['sin', 'cos', 'tan'].forEach(r => row.append(h('button', { type: 'button', class: 'btn' + (V.upick === r && V.usolved ? ' primary' : ''), ...(V.usolved && V.upick !== r ? { disabled: '' } : {}),
          onclick: () => {
            if (V.usolved) return;
            V.upick = r;
            const need = ang ? ratioFor(t.a, t.b) : ratioFor(t.known, t.want), why = utWhy(t, r);
            if (r === need) {
              V.usolved = true;
              const nm = ang ? RNAME[r] : RNAME[r];
              V.ufb = `<b>Yes, ${ang ? r + '⁻¹' : r}.</b> ${nm} = ${RFORM[r]}, and these are the two sides involved.`;
            } else V.ufb = `<b>Not ${ang ? r + '⁻¹' : r}.</b> ${why} Try another.`;
            if (!V.usolved) V.upick = -1;
            renderUse(); P.requestDraw(); upd();
          } }, ang ? r + '⁻¹' : r)));
        usEl.append(row);
        if (V.ufb) usEl.append(h('div', { class: 'ctl readout', 'aria-live': 'polite', html: V.ufb }));
        usEl.append(h('p', { class: 'hint', style: 'margin:0' }, 'Calculator check: use degree mode, not radian mode.'));
      };

      const ro = C.readout();

      /* practice */
      C.title('Practice');
      const prEl = h('div', { class: 'ctl', style: 'display:flex;flex-direction:column;gap:10px' });
      host.append(prEl);
      const renderPractice = () => {
        prEl.innerHTML = '';
        if (V.mode !== 'prac') {
          prEl.append(h('p', { class: 'hint', style: 'margin:0' }, 'Eight short problems: naming sides, choosing a ratio, finding a side, finding an angle, the complement and the Pythagorean identity, and a trap. Every answer is explained. Nothing is saved or scored.'),
            h('div', { class: 'ctl buttons' }, h('button', { type: 'button', class: 'btn primary', onclick: () => go('prac') }, 'Start practice')));
          return;
        }
        quiz(prEl, PR, PS, { noun: 'Problem', next: 'Next problem', render: renderPractice });
      };

      /* ---------- readout ---------- */
      const upd = () => {
        let html = '';
        if ((V.mode === 'size' || V.mode === 'names' || V.mode === 'table' || V.mode === 'rel') && V.q === 1 && !(V.mode === 'names' && V.nsub === 'tasks')) { ro.innerHTML = '<span class="k">Make your prediction above to see the numbers.</span>'; return; }
        const al = Math.round(st.al);
        if (V.mode === 'size') {
          const H = st.size, o = H * sinD(al), ad = H * cosD(al);
          html = `<span class="k">θ</span> ${al}°. <span class="k">opposite</span> ${f2(o)}, <span class="k">adjacent</span> ${f2(ad)}, <span class="k">hypotenuse</span> ${f2(H)}<br>
            <span class="k">sin θ</span> = opposite ÷ hypotenuse ≈ ${f3(sinD(al))}<br><span class="k">cos θ</span> = adjacent ÷ hypotenuse ≈ ${f3(cosD(al))}<br><span class="k">tan θ</span> = opposite ÷ adjacent ≈ ${f3(tanD(al))}<br>`;
          if (V.ghost) html += `<span class="k">Copies</span> hypotenuse ${f2(H * .4)}: opposite ÷ hypotenuse ≈ ${f3(sinD(al))}; hypotenuse ${f2(H * .7)}: ≈ ${f3(sinD(al))}; yours ${f2(H)}: ≈ ${f3(sinD(al))}<br>`;
          html += '<span class="k">Idea</span> change the size and the ratios stay; change the angle and they change.';
        } else if (V.mode === 'names') {
          const at = curAt(), A = at === 'A', T2 = A ? al : 90 - al, op = 10 * sinD(T2), ad = 10 * cosD(T2);
          html = `<span class="k">θ</span> = ${T2}° at ${at}. <span class="k">opposite</span> ${f2(op)}, <span class="k">adjacent</span> ${f2(ad)}, <span class="k">hypotenuse</span> 10.00<br>
            <span class="k">sin θ</span> = opposite ÷ hypotenuse = ${f3(sinD(T2))}<br><span class="k">cos θ</span> = adjacent ÷ hypotenuse = ${f3(cosD(T2))}<br><span class="k">tan θ</span> = opposite ÷ adjacent = ${f3(tanD(T2))}`;
        } else if (V.mode === 'table') {
          const n = TBL.filter(d => V.tbl[d]).length, sp = { 30: 'sin 30° = 1/2 exactly: a 30° angle is half of an equilateral triangle.', 45: 'tan 45° = 1 exactly: the legs are equal.', 60: 'cos 60° = 1/2 exactly.' };
          html = `<span class="k">θ</span> ${al}°: sin θ ≈ ${f3(sinD(al))}, cos θ ≈ ${f3(cosD(al))}, tan θ ≈ ${f3(tanD(al))}<br><span class="k">Table</span> ${n} of 8 angles filled in`;
          if (sp[al]) html += `<br><span class="k">Exact</span> ${sp[al]}`;
          if (n === 8) html += '<br><span class="k">Pattern</span> sin goes 0.174 to 0.985 (up). cos goes 0.985 to 0.174 (down). tan goes 0.176 to 5.671 (up, faster and faster).';
        } else if (V.mode === 'rel') {
          const T = th(), O = 90 - T, s = sinD(al), co = cosD(al);
          if (V.rv === 'comp') html = `<span class="k">θ</span> = ${T}°, other acute angle ${O}°<br><span class="k">sin θ</span> = opposite ÷ hypotenuse ≈ ${f3(sinD(T))}<br><span class="k">cos(90° − θ)</span> = cos ${O}° ≈ ${f3(cosD(O))}<br>The side opposite θ is the side adjacent to the other angle, so the two ratios are the same number.`;
          else if (V.rv === 'div') html = `<span class="k">sin θ</span> ≈ ${f3(s)}, <span class="k">cos θ</span> ≈ ${f3(co)}<br><span class="k">sin θ ÷ cos θ</span> ≈ ${f3(s / co)}<br><span class="k">tan θ</span> ≈ ${f3(tanD(al))}<br>With the hypotenuse equal to 1, opposite = sin θ and adjacent = cos θ. Scale up until adjacent = 1: the opposite side is then tan θ.`;
          else html = `<span class="k">cos² θ</span> ≈ ${f3(co * co)}<br><span class="k">sin² θ</span> ≈ ${f3(s * s)}<br><span class="k">cos² θ + sin² θ</span> ≈ ${f3(co * co + s * s)}<br>With hypotenuse 1, the legs are cos θ and sin θ, so the Pythagorean theorem says cos² θ + sin² θ = 1².`;
        } else if (V.mode === 'use') {
          const { t, n } = useState();
          if (t.k === 'side') {
            const r = ratioFor(t.known, t.want), K = SN[t.known], W = SN[t.want], v = n.v, L = st.len;
            html = `<span class="k">Known</span> ${K} ${L}, angle ${al}°. <span class="k">Want</span> the ${W}.<br>`;
            if (V.usolved) {
              const fn = r === 'sin' ? sinD(al) : r === 'cos' ? cosD(al) : tanD(al), wantTop = t.want === (r === 'cos' ? 'adj' : 'opp');
              html += `<span class="k">Set up</span> ${r} ${al}° = ${RFORM[r]}<br><span class="k">Solve</span> ` +
                (wantTop ? `${W} = ${L} × ${r} ${al}° ≈ ${L} × ${f4(fn)} ≈ ${f2(v[t.want])}` : `${W} = ${L} ÷ ${r} ${al}° ≈ ${L} ÷ ${f4(fn)} ≈ ${f2(v[t.want])}`);
            } else html += '<span class="k">Pick sin, cos or tan to set up the equation.</span>';
          } else {
            const r = ratioFor(t.a, t.b), x = t.va / t.vb;
            html = `<span class="k">Given</span> ${SN[t.a]} ${t.va}, ${SN[t.b]} ${t.vb}<br>`;
            html += V.usolved ? `<span class="k">Set up</span> ${r} θ = ${t.va} ÷ ${t.vb} ≈ ${f4(x)}<br><span class="k">Inverse</span> θ = ${r}⁻¹(${f4(x)}) ≈ ${f1(n.ang)}°: the angle whose ${RNAME[r].toLowerCase()} is ${f4(x)}`
              : '<span class="k">Pick the ratio that these two sides make. Its inverse gives the angle.</span>';
          }
        } else html = '<span class="k">Work through the problems in the Practice panel.</span>';
        ro.innerHTML = html;
      };
      const f4 = v => v.toFixed(4);

      /* ---------- sync ---------- */
      function syncSliders() { alS.set(st.al); szS.set(st.size); lenS.set(st.len); }
      function vis() { for (const [fn, el] of items) el.style.display = fn() ? '' : 'none'; hintEl.textContent = HINTS[V.mode]; }
      function sync() {
        syncSliders();
        modeSel.value = V.mode; relSel.value = V.rv; useSel.value = String(V.ut); ghostT.checked = V.ghost;
        atB[0].classList.toggle('primary', V.at === 'A'); atB[1].classList.toggle('primary', V.at === 'B');
        subB[0].classList.toggle('primary', V.nsub === 'explore'); subB[1].classList.toggle('primary', V.nsub === 'tasks');
        vis(); renderPQ(); renderNT(); renderES(); renderUse(); renderTbl(); renderPractice(); upd(); P.draw();
      }
      const DEF = { size: { al: 14, size: 4 }, names: { al: 35 }, table: { al: 30 }, rel: { al: 37 }, use: { al: 35, len: 20 } };
      function go(m) {
        cancel(); V.mode = m; V.q = m === 'prac' || m === 'use' ? 0 : 1; V.pfb = ''; V.pick = -1;
        if (m === 'table') V.tbl = {};
        if (m === 'names') V.nsub = 'explore';
        if (m === 'rel') { V.at = 'A'; V.rv = 'comp'; }
        if (m === 'names') V.at = 'A';
        if (DEF[m]) Object.assign(st, DEF[m]);
        sync();
      }

      /* ---------- dragging ---------- */
      draggable(P, {
        hit: (px, py) => { const b = hpos(); return b && near(P, b[0], b[1], px, py) ? 'B' : null; },
        move: (_, x, y) => {
          cancel(); touch();
          st.al = clamp(snap(Math.atan2(y, x) / D2R, 1), 5, 85);
          if (V.mode === 'size') st.size = clamp(snap(Math.hypot(x, y), 1), 2, 10);
          redraw();
        }
      });

      /* ---------- guided steps ---------- */
      const FLAGS = ['mode', 'at', 'q', 'ghost', 'rv', 'nsub'];
      const apply = (patch, immediate) => {
        cancel();
        const nums = {}, fl = {};
        for (const [k, v] of Object.entries(patch)) (FLAGS.includes(k) ? fl : nums)[k] = v;
        Object.assign(V, fl); V.pfb = ''; V.pick = -1;
        if (fl.mode === 'table') V.tbl = {};
        if (immediate || !Object.keys(nums).length) { Object.assign(st, nums); sync(); return; }
        sync();
        cancel = animateTo(st, nums, 700, () => { syncSliders(); P.draw(); upd(); }, sync);
      };

      sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
