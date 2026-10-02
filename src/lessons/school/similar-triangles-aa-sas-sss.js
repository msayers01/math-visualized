/* =====================================================================
   SCHOOL — Similar triangles: AA, SAS and SSS
   ===================================================================== */
{
  const R = Math.PI / 180, DG = 180 / Math.PI;
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const rnd = v => Math.round(v * 100) / 100;
  const angAt = (V, Q, W) => {
    const u = [Q[0] - V[0], Q[1] - V[1]], w = [W[0] - V[0], W[1] - V[1]], m = Math.hypot(...u) * Math.hypot(...w);
    return m < 1e-9 ? 0 : Math.acos(clamp((u[0] * w[0] + u[1] * w[1]) / m, -1, 1)) * DG;
  };
  const dedupe = list => { const out = []; for (const q of list) if (q && !out.some(o => dist(o, q) < .02)) out.push(q); return out; };

  /* ---- solving for the third vertex F, with D = (0,0) and E = (de, 0) ---- */
  const solveAA = (de, a, b) => (a + b >= 179 ? null : (t => [t * Math.cos(a * R), t * Math.sin(a * R)])(de * Math.sin(b * R) / Math.sin((a + b) * R)));
  const solveSAS = (df, a) => [df * Math.cos(a * R), df * Math.sin(a * R)];
  const solveSSS = (de, df, ef) => { const x = (de * de + df * df - ef * ef) / (2 * de), y2 = df * df - x * x; return y2 > 1e-6 ? [x, Math.sqrt(y2)] : null; };
  const solveSSA = (de, ef, a) => {
    const c = Math.cos(a * R), s = Math.sin(a * R), disc = ef * ef - de * de * s * s;
    if (disc < -1e-9) return [];
    const r = Math.sqrt(Math.max(0, disc)), ts = [];
    for (const t of [de * c + r, de * c - r]) if (t > 1e-6 && !ts.some(u => Math.abs(u - t) < 1e-6)) ts.push(t);
    return ts.map(t => [t * c, t * s]);
  };

  /* ---- the four fixed target triangles ABC (A at the origin, B on the x axis) ---- */
  const TG = {
    AA: { AB: 6, C: solveAA(6, 40, 60), marks: { angs: { A: '40°', B: '60°' }, sides: {} } },
    SAS: { AB: 4, C: solveSAS(6, 50), marks: { angs: { A: '50°' }, sides: { AB: '4', AC: '6' } } },
    SSS: { AB: 4, C: solveSSS(4, 6, 5), marks: { angs: {}, sides: { AB: '4', BC: '5', AC: '6' } } },
    SSA: { AB: 6, C: solveSSA(6, 4.5, 40)[0], marks: { angs: { A: '40°' }, sides: { AB: '6', BC: '4.5' } } }
  };
  for (const k in TG) {
    const T = TG[k]; T.B = [T.AB, 0]; T.AC = Math.hypot(...T.C); T.BC = dist(T.B, T.C);
    T.ang = [angAt([0, 0], T.B, T.C), angAt(T.B, [0, 0], T.C), angAt(T.C, [0, 0], T.B)];
  }
  const TESTS = ['AA', 'SAS', 'SSS', 'SSA'];
  const GIVEN = {
    AA: [{ sides: [], angs: ['D', 'E'], txt: 'angle D and angle E' }, { sides: [], angs: ['D'], txt: 'only angle D' }],
    SAS: [{ sides: ['DE', 'DF'], angs: ['D'], txt: 'sides DE and DF, and the angle D between them' }, { sides: ['DE', 'DF'], angs: [], txt: 'sides DE and DF only' }],
    SSS: [{ sides: ['DE', 'DF', 'EF'], angs: [], txt: 'all three sides' }, { sides: ['DE', 'DF'], angs: [], txt: 'sides DE and DF only' }],
    SSA: [{ sides: ['DE', 'EF'], angs: ['D'], txt: 'sides DE and EF, and angle D (not between them)' }]
  };
  const FACTOPT = {
    AA: ['Two angles (D and E)', 'One angle only (D)'],
    SAS: ['Two sides and the angle between them', 'Two sides, no angle'],
    SSS: ['All three sides', 'Two sides only'],
    SSA: ['Two sides and an angle not between them']
  };
  const SL = {   /* field, label, min, max, step, isAngle */
    AA: [['dA', 'Angle D', 20, 110, 5, 1], ['eA', 'Angle E', 20, 110, 5, 1], ['de', 'Side DE', 3, 12, 1.5, 0]],
    SAS: [['de', 'Side DE', 2, 8, 1, 0], ['df', 'Side DF', 3, 12, 1, 0], ['dA', 'Angle D (between DE and DF)', 20, 130, 5, 1]],
    SSS: [['de', 'Side DE', 2, 8, 1, 0], ['df', 'Side DF', 3, 12, 1, 0], ['ef', 'Side EF', 2, 12, .5, 0]],
    SSA: [['de', 'Side DE', 3, 12, 1.5, 0], ['ef', 'Side EF', 2, 12, .5, 0], ['dA', 'Angle D (not between DE and EF)', 20, 90, 5, 1]]
  };
  const DEF = { AA: { dA: 55, eA: 60, de: 9 }, SAS: { de: 6, df: 9, dA: 65 }, SSS: { de: 6, df: 9, ef: 7.5 }, SSA: { de: 6, ef: 4.5, dA: 40 } };
  const FLAGS = ['mode', 'test', 'facts', 'ghosts', 'pred', 'method'];
  let uid = 0;

  /* ---- small drawing helpers ---- */
  const T = (p, s, x, y, o = {}) => p.label(s, x, y, { italic: false, size: 17, ...o });
  const setView = (p, b, rect, pad = 34) => {
    const bw = Math.max(b[1] - b[0], 1e-6), bh = Math.max(b[3] - b[2], 1e-6);
    const sc = Math.min((rect.w - 2 * pad) / bw, (rect.h - 2 * pad) / bh);
    p.span = Math.min(p.w, p.h) / (2 * sc);
    p.cx = (b[0] + b[1]) / 2 - (rect.x + rect.w / 2 - p.w / 2) / sc;
    p.cy = (b[2] + b[3]) / 2 + (rect.y + rect.h / 2 - p.h / 2) / sc;
  };
  const cen = q => q.reduce((s, v) => [s[0] + v[0] / q.length, s[1] + v[1] / q.length], [0, 0]);
  const unit = (a, b) => { const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / d, (b[1] - a[1]) / d]; };
  /* arc between the directions V->Q and V->W (angles drawn on the inside) */
  const arcAt = (p, V, Q, W, r, col, w = 2) => {
    let a0 = Math.atan2(Q[1] - V[1], Q[0] - V[0]), a1 = Math.atan2(W[1] - V[1], W[0] - V[0]);
    if (a0 > a1) [a0, a1] = [a1, a0];
    if (a1 - a0 > Math.PI) { const t = a0 + 2 * Math.PI; a0 = a1; a1 = t; }
    const c = p.ctx; c.beginPath(); c.arc(p.X(V[0]), p.Y(V[1]), r, -a1, -a0); c.strokeStyle = col; c.lineWidth = w; c.setLineDash([]); c.stroke();
  };
  const rightMark = (p, V, u1, u2, s = 11, col) => {
    const x = p.X(V[0]), y = p.Y(V[1]), c = p.ctx, f = (a, b) => [x + (u1[0] * a + u2[0] * b) * s, y - (u1[1] * a + u2[1] * b) * s];
    c.beginPath(); c.moveTo(...f(1, 0)); c.lineTo(...f(1, 1)); c.lineTo(...f(0, 1)); c.strokeStyle = col; c.lineWidth = 1.8; c.setLineDash([]); c.stroke();
  };
  const ptxt = (c, p, s, x, y, size, col, o = {}) => {
    c.font = o.italic ? `italic ${size}px "STIX Two Text", "Times New Roman", serif` : `500 ${size}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`;
    c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
    c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(s, x, y);
    c.fillStyle = col; c.fillText(s, x, y);
  };
  const pathPx = (c, pts, close) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); if (close) c.closePath(); };

  /* the little picture of the target in the corner of the canvas */
  const insetBox = p => p.w >= 560 ? { x: 12, y: 12, w: 156, h: 124 } : p.w >= 420 ? { x: 10, y: 8, w: 150, h: 102 } : { x: 8, y: 6, w: 128, h: 92 };
  const drawInset = (c, p, ib, Tg) => {
    const pal = p.pal;
    c.fillStyle = alpha(pal.stage, .94); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1;
    c.beginPath(); c.rect(ib.x, ib.y, ib.w, ib.h); c.fill(); c.stroke();
    ptxt(c, p, 'Target', ib.x + 8, ib.y + 13, 13, pal.muted, { align: 'left' });
    const pts = [[0, 0], Tg.B, Tg.C], minX = Math.min(0, Tg.C[0]), maxX = Math.max(Tg.AB, Tg.C[0]), bw = maxX - minX, bh = Tg.C[1];
    const ax = ib.x + 24, ay = ib.y + 32, aw = ib.w - 48, ah = ib.h - 32 - 22, sc = Math.min(aw / bw, ah / bh);
    const ox = ax + (aw - bw * sc) / 2 - minX * sc, oy = ay + ah / 2 + bh * sc / 2;
    const px = pts.map(([x, y]) => [ox + x * sc, oy - y * sc]);
    pathPx(c, px, true); c.fillStyle = alpha(pal.blue, .2); c.fill(); c.strokeStyle = pal.blue; c.lineWidth = 2.2; c.setLineDash([]); c.stroke();
    const G = cen(px), names = ['A', 'B', 'C'];
    px.forEach((v, i) => { const u = unit(G, v); ptxt(c, p, names[i], v[0] + u[0] * 13, v[1] + u[1] * 13, 16, pal.text, { italic: true }); });
    const M = Tg.marks;
    const sideAt = (i, j, s) => { const m = [(px[i][0] + px[j][0]) / 2, (px[i][1] + px[j][1]) / 2], u = unit(G, m); ptxt(c, p, s, m[0] + u[0] * 11, m[1] + u[1] * 11, 13, pal.text); };
    if (M.sides.AB) sideAt(0, 1, M.sides.AB); if (M.sides.BC) sideAt(1, 2, M.sides.BC); if (M.sides.AC) sideAt(0, 2, M.sides.AC);
    const angTxt = (i, s) => { const u = unit(px[i], G); ptxt(c, p, s, px[i][0] + u[0] * 27, px[i][1] + u[1] * 27, 12, pal.text); };
    if (M.angs.A) angTxt(0, M.angs.A); if (M.angs.B) angTxt(1, M.angs.B);
  };

  /* ---- draw a labelled triangle (practice figures) ---- */
  const drawTri = (p, tri, rev, ans) => {
    const pal = p.pal, q = tri.pts, G = cen(q), fix = s => (s && rev ? s.replace('?', ans) : s);
    p.path(q, { fill: alpha(tri.col || pal.blue, .18), stroke: tri.col || pal.blue, width: 3, close: true });
    if (tri.alt) {
      p.path([q[0], tri.alt, q[1]], { stroke: pal.violet, width: 2, dash: [5, 5] });
      p.dot(tri.alt[0], tri.alt[1], 5, pal.violet);
      T(p, tri.altLabel, tri.alt[0], tri.alt[1], { size: 15, color: pal.violet, dy: -18 });
    }
    q.forEach((v, i) => {
      const u = unit(G, v);
      if (tri.names) p.label(tri.names[i], v[0], v[1], { size: 22, dx: u[0] * 19, dy: -u[1] * 19 });
      const a = tri.ang && tri.ang[i];
      if (a) { const w = unit(v, G); T(p, a, v[0], v[1], { size: 15, dx: w[0] * 38, dy: -w[1] * 38 }); arcAt(p, v, q[(i + 1) % 3], q[(i + 2) % 3], 18, pal.violet); }
    });
    if (tri.right !== undefined) { const v = q[tri.right]; rightMark(p, v, unit(v, q[(tri.right + 1) % 3]), unit(v, q[(tri.right + 2) % 3]), 12, pal.muted); }
    for (let i = 0; i < 3; i++) {
      const s = fix(tri.side && tri.side[i]); if (!s) continue;
      const a = q[i], b = q[(i + 1) % 3], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], u = unit(G, m);
      T(p, s, m[0], m[1], { size: 17, dx: u[0] * (12 + s.length * 4.4), dy: -u[1] * 20 });
    }
  };

  /* ---- practice figures ---- */
  const triSAS = (ab, ac, a) => [[0, 0], [ab, 0], [ac * Math.cos(a * R), ac * Math.sin(a * R)]];
  const triSSS = (ab, bc, ca) => { const x = (ab * ab + ca * ca - bc * bc) / (2 * ab); return [[0, 0], [ab, 0], [x, Math.sqrt(ca * ca - x * x)]]; };
  const triAA = (a, b, ab) => [[0, 0], [ab, 0], solveAA(ab, a, b)];
  const xf = (pts, { rot = 0, flip = false, s = 1 } = {}) => pts.map(([x, y]) => { x *= flip ? -s : s; y *= s; const c = Math.cos(rot * R), d = Math.sin(rot * R); return [x * c - y * d, x * d + y * c]; });
  const C_ = (t, ok, why) => ({ t, ok, why });

  const PR = [
    { fig: { type: 'pair', tris: [
        { pts: triAA(50, 60, 5), names: ['A', 'B', 'C'], ang: { 0: '50°', 1: '60°' } },
        { pts: xf(triAA(60, 50, 4), { flip: true, rot: -8 }), names: ['P', 'Q', 'R'], ang: { 0: '60°', 2: '70°' } }], note: '' },
      ans: '', parts: [{
        prompt: 'In triangle ABC, A = 50° and B = 60°. In triangle PQR, P = 60° and R = 70°. Which statement is correct?',
        choices: [
          C_('ABC ~ PQR by AA', false, 'AA is the right rule, but the letters are in the wrong order. A = 50° would have to match P, and P is 60°. The order of the letters tells you which vertices match.'),
          C_('ABC ~ QPR by AA', true, 'The third angles are C = 70° and Q = 50°. So A (50°) matches Q, B (60°) matches P, and C (70°) matches R. Two pairs of equal angles prove it, and the letters follow the matches: ABC ~ QPR.'),
          C_('ABC ~ PQR by SAS', false, 'No side lengths are given, so SAS cannot be used. Two angles are enough here, and that is AA.'),
          C_('They are not similar', false, 'They are similar. Find the missing angles: C = 70° and Q = 50°. The two triangles have the same three angles, only named in a different order.')] }] },
    { fig: { type: 'pair', tris: [
        { pts: triSAS(6, 9, 40), names: ['A', 'B', 'C'], side: { 0: '6', 2: '9' }, ang: { 0: '40°' } },
        { pts: xf(triSAS(4, 6, 40), { flip: true }), names: ['D', 'E', 'F'], side: { 0: '4', 2: '6' }, ang: { 0: '40°' } }], note: '' },
      ans: '', parts: [{
        prompt: 'AB = 6, AC = 9 and angle A = 40°. DE = 4, DF = 6 and angle D = 40°. Are the triangles similar, and why?',
        choices: [
          C_('Yes, by AA', false, 'Only one pair of angles is known (A = D = 40°). AA needs two pairs.'),
          C_('No, because 6 is not equal to 4', false, 'Similar triangles do not need equal sides. They need sides in the same ratio.'),
          C_('Yes, by SAS: 6 ÷ 4 = 9 ÷ 6 = 1.5 and the angles between those sides are equal', true, 'Compare the sides that match: AB with DE and AC with DF. Both ratios are 1.5, and the equal 40° angle sits between those two sides. That is SAS, so ABC ~ DEF.'),
          C_('Yes, by SSS', false, 'The third sides BC and EF are not known, so SSS cannot be used.')] }] },
    { fig: { type: 'pair', tris: [
        { pts: triSSS(6, 8, 10), names: ['A', 'B', 'C'], side: { 0: '6', 1: '8', 2: '10' } },
        { pts: xf(triSSS(9, 12, 16), { flip: true }), names: ['D', 'E', 'F'], side: { 0: '9', 1: '12', 2: '16' } }], note: '' },
      ans: '', parts: [{
        prompt: 'Triangle ABC has sides 6, 8 and 10. Triangle DEF has sides 9, 12 and 16. Match the shortest with the shortest, and so on. Are they similar?',
        choices: [
          C_('Yes, by SSS', false, 'Check all three ratios: 9 ÷ 6 = 1.5 and 12 ÷ 8 = 1.5, but 16 ÷ 10 = 1.6. SSS needs all three ratios equal.'),
          C_('No, the ratios 1.5, 1.5 and 1.6 are not all equal', true, 'SSS needs all three ratios to match. Two matching ratios are not enough, and 1.6 breaks the pattern. The triangles are close in shape but not similar.'),
          C_('Yes, by AA, because two ratios match', false, 'Ratios of sides are not angles. Two equal ratios do not prove similarity unless the angle between those sides is also equal.'),
          C_('Yes, by SAS', false, 'SAS also needs an equal angle between the two sides, and no angles are given.')] }] },
    { fig: { type: 'pair', tris: [
        { pts: [[0, 0], [6, 0], solveSSA(6, 4.5, 40)[0]], alt: solveSSA(6, 4.5, 40)[1], altLabel: 'C could be here too', names: ['A', 'B', 'C'], side: { 0: '6', 1: '4.5' }, ang: { 0: '40°' } },
        { pts: [[0, 0], [12, 0], solveSSA(12, 9, 40)[0]], alt: solveSSA(12, 9, 40)[1], altLabel: 'F could be here too', names: ['D', 'E', 'F'], side: { 0: '12', 1: '9' }, ang: { 0: '40°' } }], note: '' },
      ans: '', parts: [{
        prompt: 'AB = 6, BC = 4.5 and angle A = 40°. DE = 12, EF = 9 and angle D = 40°. The sides are in the ratio 2 to 1 and the angles are equal. What can you conclude?',
        choices: [
          C_('Similar by SAS', false, 'SAS needs the equal angle to be between the two proportional sides. Angle A sits between AB and AC, not between AB and BC.'),
          C_('Similar by SSS', false, 'Only two sides are known. The third sides AC and DF are not given.'),
          C_('Not similar', false, 'You cannot say that either. The facts leave room for a similar pair, but they do not force it.'),
          C_('Nothing is guaranteed: this is SSA, and the angle is not between the sides', true, 'With an angle that is not between the sides, the free vertex can land in two places (the dashed ghost shows the other one). So the facts do not force the same shape, and you cannot conclude either way.')] }] },
    { fig: { type: 'pair', tris: [
        { pts: triSSS(8, 10, 6), names: ['A', 'B', 'C'], side: { 0: '8', 1: '10', 2: '6' } },
        { pts: xf(triSSS(12, 15, 9), { flip: true }), names: ['D', 'E', 'F'], side: { 0: '12', 1: 'EF = ?' } }], note: '' },
      ans: '15', parts: [
        { prompt: 'Triangle ABC ~ triangle DEF. AB = 8, BC = 10, CA = 6 and DE = 12. You want EF. Which equation is right?',
          choices: [
            C_('EF ÷ BC = AB ÷ DE', false, 'This one is upside down. DE is the bigger triangle, so the ratio DE ÷ AB is 1.5, and EF ÷ BC must equal that same number.'),
            C_('EF ÷ BC = DE ÷ CA', false, 'DE matches AB, not CA. The letters ABC ~ DEF pair A with D, B with E, C with F, so AB matches DE.'),
            C_('EF ÷ BC = DE ÷ AB', true, 'In ABC ~ DEF, side AB matches DE and side BC matches EF. Matching sides have the same ratio: EF ÷ BC = DE ÷ AB.'),
            C_('EF = BC + (DE − AB)', false, 'Adding the same amount does not keep the shape. Similar triangles are scaled, so you multiply by the same factor.')] },
        { prompt: 'Now solve EF ÷ 10 = 12 ÷ 8. How long is EF?',
          choices: [
            C_('14', false, 'That is 10 + (12 − 8). Adding keeps the difference, but similar triangles keep the ratio. Multiply by 12 ÷ 8 = 1.5.'),
            C_('9', false, 'That is 6 × 1.5, which scales side CA instead of side BC.'),
            C_('6.7', false, 'That is 10 × 8 ÷ 12, with the factor upside down. The larger triangle must give a longer side.'),
            C_('15', true, 'The scale factor is 12 ÷ 8 = 1.5, so EF = 10 × 1.5 = 15.')] }] },
    { fig: { type: 'pair', tris: [
        { pts: [[0, 0], [3, 0], [3, 2]], right: 1, side: { 0: 'shadow 3 m', 1: 'pole 2 m' }, col: null },
        { pts: [[0, 0], [45 / 12, 0], [45 / 12, 30 / 12]], right: 1, side: { 0: 'shadow 45 m', 1: 'h = ?' } }], note: 'Not drawn to scale: the big triangle is shrunk to fit.' },
      ans: '30 m', parts: [
        { prompt: 'A 2 m pole casts a 3 m shadow. At the same moment a building casts a 45 m shadow. Let h be the height of the building. Which equation is right?',
          choices: [
            C_('h ÷ 3 = 45 ÷ 2', false, 'This matches the building with the pole shadow. Height goes with height and shadow with shadow: building height with pole height.'),
            C_('h ÷ 45 = 3 ÷ 2', false, 'The ratios are upside down on one side. Pole height ÷ pole shadow is 2 ÷ 3, so building height ÷ building shadow must be h ÷ 45.'),
            C_('h ÷ 2 = 45 ÷ 3', true, 'Both triangles have a right angle and the same sun angle, so they are similar (AA). Height ÷ height equals shadow ÷ shadow: h ÷ 2 = 45 ÷ 3.'),
            C_('h = 45 − 3 + 2', false, 'Subtracting does not work for similar shapes. The shadows are scaled by a factor, so the heights are scaled by the same factor.')] },
        { prompt: 'Solve h ÷ 2 = 45 ÷ 3. How tall is the building?',
          choices: [
            C_('44 m', false, 'That is 45 − 3 + 2. Use the scale factor instead: 45 ÷ 3 = 15.'),
            C_('67.5 m', false, 'That is 45 × 3 ÷ 2, which turns the ratio upside down. The building shadow is 45 ÷ 3 = 15 times the pole shadow, so multiply the pole height by 15.'),
            C_('135 m', false, 'That is 45 × 3. Divide by the pole shadow, 3, instead of multiplying.'),
            C_('30 m', true, 'The building shadow is 45 ÷ 3 = 15 times the pole shadow, so the building is 15 times the pole: h = 2 × 15 = 30 m.')] }] },
    { fig: { type: 'para', note: '' }, ans: '4.5', parts: [
        { prompt: 'In triangle ABC, segment DE is parallel to BC. D is on AB with AD = 3 and DB = 5. BC = 12. Which equation gives DE?',
          choices: [
            C_('AD ÷ DB = DE ÷ BC', false, 'DB is only the lower part of side AB. The small triangle ADE is compared with the whole triangle ABC, so use AB = AD + DB = 8.'),
            C_('AD ÷ AB = BC ÷ DE', false, 'One side of the equation is upside down. The small triangle is smaller on both sides, so DE ÷ BC must equal AD ÷ AB.'),
            C_('DB ÷ AB = DE ÷ BC', false, 'DB belongs to the lower piece, not to triangle ADE. The side of ADE that matches AB is AD.'),
            C_('AD ÷ AB = DE ÷ BC, with AB = 3 + 5 = 8', true, 'Because DE is parallel to BC, angle ADE equals angle ABC and angle A is shared, so ADE ~ ABC by AA. Matching sides: AD with AB, and DE with BC.')] },
        { prompt: 'Solve 3 ÷ 8 = DE ÷ 12. How long is DE?',
          choices: [
            C_('7.2', false, 'That is 3 ÷ 5 × 12. It uses DB instead of the whole side AB.'),
            C_('4.5', true, 'DE = 12 × 3 ÷ 8 = 4.5. The small triangle is 3 ÷ 8 of the big one.'),
            C_('20', false, 'That is 12 × 5 ÷ 3. The factor is upside down and uses the wrong piece.'),
            C_('7.5', false, 'That is 12 × 5 ÷ 8, which uses DB ÷ AB. DE matches the part AD.')] }] }
  ];

  register({
    id: 'similar-triangles-aa-sas-sss', level: 'school',
    title: 'Similar triangles: AA, SAS and SSS',
    blurb: 'Test how little you need to know to be sure two triangles have the same shape, then use it on shadows, mirrors and parallel lines.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 2.5; p.cy = 2.0; p.span = 2.7;
      const A = [2.6, 3.8], B = [0.2, 0.2], Cc = [4.9, 0.2], t = .45;
      const D = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t], E = [A[0] + (Cc[0] - A[0]) * t, A[1] + (Cc[1] - A[1]) * t];
      p.path([A, B, Cc], { fill: alpha(pal.blue, .2), stroke: pal.blue, width: 2.2, close: true });
      p.path([A, D, E], { fill: alpha(pal.yellow, .4), stroke: pal.yellow, width: 2.2, close: true });
      p.path([D, E], { stroke: pal.green, width: 2.6 });
      p.dot(A[0], A[1], 3.6, pal.stage, pal.brass, 2);
    },
    hook: String.raw`You cannot climb a tree to measure it, but you can measure its shadow. What is the least you need to know to be sure two triangles have the same shape?`,
    steps: [
      { title: 'Two angles are enough (AA)',
        text: String.raw`<p>The blue dashed copy is the target ABC (A = 40°, B = 60°), resized to sit on your side DE. Triangle DEF has D = 40° and E = 60°. So F = 80°, and every side is 1.5 times its partner.</p><p>Move angle D and watch the ratios split. Then choose <b>One angle only</b> and look at the ghosts.</p>`,
        set: { mode: 'crit', test: 'AA', facts: 0, ghosts: true, pred: 0, dA: 40, eA: 60, de: 9 } },
      { title: 'Sides in proportion (SAS)',
        text: String.raw`<p>In ABC, AB = 4, AC = 6 and A = 50°. Here DE = 6, DF = 9 and D = 50°. The ratios are 6 ÷ 4 = 9 ÷ 6 = 1.5, and the equal angle sits <em>between</em> those sides. The third side follows: EF is 1.5 times BC.</p><p>Press <b>SSS</b> in the panel: three equal ratios work too.</p>`,
        set: { mode: 'crit', test: 'SAS', facts: 0, ghosts: true, pred: 0, de: 6, df: 9, dA: 50 } },
      { title: 'A trap: SSA',
        text: String.raw`<p>Predict first. In ABC, AB = 6, BC = 4.5 and A = 40°. DEF has DE = 6, EF = 4.5 and D = 40°. The angle is <em>not</em> between the two sides.</p><p>Will every triangle built like this be similar to ABC? Pick an answer in the panel. Then the ghosts appear.</p>`,
        set: { mode: 'crit', test: 'SSA', facts: 0, ghosts: true, pred: 0, de: 6, ef: 4.5, dA: 40 } },
      { title: 'Measure the unreachable',
        text: String.raw`<p>The sun's rays are parallel, so the stick and the tree make the same sun angle. Here the stick is 1.5 m and its shadow is 2 m. The tree's shadow is 8 m.</p><p>Answer the questions in the panel to find the tree's height. Then try the mirror, the <b>Parallel segment</b> and <b>Practice</b>.</p>`,
        set: { mode: 'shadow', method: 'shadow', sv: 2 } }
    ],
    formal: String.raw`
      <h3>Similar means the same shape</h3>
      <p>Two triangles are <em>similar</em> when one is a scaled copy of the other, possibly turned or flipped. Then matching angles are equal and matching sides are in one ratio. Writing \(\triangle ABC\sim\triangle DEF\) says that \(A\) matches \(D\), \(B\) matches \(E\) and \(C\) matches \(F\). The order of the letters carries information:
      \[ \angle A=\angle D,\quad \angle B=\angle E,\quad \angle C=\angle F,\qquad \frac{AB}{DE}=\frac{BC}{EF}=\frac{CA}{FD}. \]
      You do not have to check all six facts. Three short tests are enough.</p>
      <h3>Three ways to prove it</h3>
      <p><b>AA.</b> Two pairs of equal angles. The third pair is forced, because the angles of a triangle add to \(180^\circ\).<br>
      <b>SAS.</b> Two pairs of sides in the same ratio, and the angles <em>between</em> them equal: \(\frac{AB}{DE}=\frac{AC}{DF}\) and \(\angle A=\angle D\).<br>
      <b>SSS.</b> All three pairs of sides in the same ratio: \(\frac{AB}{DE}=\frac{BC}{EF}=\frac{CA}{FD}\).</p>
      <h3>Why they work, in words</h3>
      <p>Resize \(DEF\) until \(DE\) is as long as \(AB\), then slide it so \(D\) sits on \(A\) and \(E\) on \(B\). We only have to show that \(F\) lands exactly on \(C\).</p>
      <p><b>AA.</b> The angles at \(D\) and \(E\) equal those at \(A\) and \(B\), so side \(DF\) lies along ray \(AC\) and side \(EF\) lies along ray \(BC\). Two rays that start at the ends of a segment and lean the same way cross at only one point. So \(F\) is \(C\).<br>
      <b>SAS.</b> Because \(DF/DE=AC/AB\), resizing so that \(DE=AB\) makes \(DF=AC\), and \(DF\) leaves \(D\) at the same angle as \(AC\) leaves \(A\). A segment with a fixed start, direction and length has a fixed end, so \(F\) is \(C\).<br>
      <b>SSS.</b> \(F\) must be exactly \(AC\) from \(A\) and \(BC\) from \(B\). Two circles like that meet in one point above the line (and one mirror point below it), so \(F\) is \(C\) or its mirror image. A mirror image is still similar.</p>
      <h3>Why SSA is not a test</h3>
      <p>Fix side \(DE\) and the angle at \(D\). Then \(F\) must lie on a ray from \(D\). The side \(EF\) says that \(F\) is a certain distance from \(E\), which is a circle around \(E\). A circle can cut a ray in two places. Example: \(AB=6\), \(BC=4.5\), \(A=40^\circ\) gives \(AC\approx6.91\) or \(AC\approx2.28\). Two different triangles fit the same facts, so SSA proves nothing. (AAA also works, but it is just AA with a free extra check.)</p>
      <h3>Indirect measurement</h3>
      <p>A vertical stick and a vertical tree both make a right angle with the ground, and the sun's parallel rays make the same angle with the ground for both. That is AA. With a 1.5 m stick, a 2 m stick shadow and an 8 m tree shadow:
      \[ \frac{h}{1.5}=\frac{8}{2}\quad\Longrightarrow\quad h=1.5\times 4=6\ \text{m}. \]
      A mirror on the ground works the same way. The light reflects at the same angle it arrives, so the triangles (tree, mirror, tree base) and (eye, mirror, your feet) share a right angle and the mirror angle.</p>
      <h3>A segment parallel to a side</h3>
      <p>If \(D\) is on \(AB\), \(E\) is on \(AC\) and \(DE\parallel BC\), then \(\angle ADE=\angle ABC\) (corresponding angles) and \(\angle A\) is shared. So \(\triangle ADE\sim\triangle ABC\) by AA, and
      \[ \frac{AD}{AB}=\frac{AE}{AC}=\frac{DE}{BC}. \]
      Take care: \(AB=AD+DB\) is the whole side. The ratio \(\frac{AD}{DB}\) compares two pieces of one side, and it equals \(\frac{AE}{EC}\), not \(\frac{DE}{BC}\).</p>
      <p><b>Worked example.</b> \(AD=3\), \(DB=5\), \(BC=12\). Then \(AB=8\) and \(\frac{3}{8}=\frac{DE}{12}\), so \(DE=\frac{3\times12}{8}=4.5\).</p>`,
    check: [
      { q: 'Which set of facts is enough to prove that two triangles are similar?',
        choices: ['One pair of equal angles and one pair of sides in proportion',
                  'Two pairs of sides in proportion',
                  'Two pairs of sides in proportion and an equal angle that is not between them',
                  'Two pairs of equal angles'], answer: 3,
        why: String.raw`Two equal angles force the third (\(180^\circ\) minus the two), so all three angles match. That is AA. One angle plus one side ratio, or two side ratios with no angle, leave the shape free. Two side ratios with an angle that is not between them is SSA, which can fit two different triangles.`,
        hint: 'Only AA, SAS and SSS are tests. Check that each choice matches one of them exactly.' },
      { q: 'Triangle ABC has AB = 6, BC = 8 and angle B = 90°, so AC = 10. Triangle PQR has PQ = 9, QR = 12 and angle Q = 90°. How long is PR?',
        choices: ['12', '15', '6.67', '13.33'], answer: 1,
        why: String.raw`Compare the sides around the equal angles: \(9\div6=\tfrac32\) and \(12\div8=\tfrac32\). The equal ratios and the equal angle between them prove \(\triangle ABC\sim\triangle PQR\) (SAS), with \(B\) matching \(Q\). So \(AC\) matches \(PR\) and \(PR=10\times\tfrac32=15\). Dividing by the ratio (6.67) or using the wrong ratio (13.33) misses, and 12 is just \(QR\).`,
        hint: 'First show the triangles are similar and find which sides match. B matches Q, so AC matches PR. Then multiply by the scale factor.' },
      { q: String.raw`A student writes: "In triangle ABC, AB = 8, BC = 5 and angle A = 30°. In triangle DEF, DE = 12, EF = 7.5 and angle D = 30°. Since 12 ÷ 8 = 7.5 ÷ 5 = 1.5 and the angles are equal, the triangles are similar by SAS." What is wrong with this argument?`,
        choices: ['Nothing is wrong. SAS applies.',
                  'The ratios should both have been 1, not 1.5.',
                  'The 30° angle is not between the two sides. AB and BC meet at B, so this is SSA, which does not prove similarity.',
                  'SAS needs all three sides in proportion.'], answer: 2,
        why: String.raw`In SAS the equal angle must sit between the two proportional sides. Sides \(AB\) and \(BC\) meet at \(B\), but the equal angles are at \(A\) and \(D\). That is the SSA pattern, which can fit two different triangles. The ratios do not have to equal 1, and SAS never needs the third side.`,
        hint: 'Find where sides AB and BC meet. Is the 30° angle at that vertex?' }
    ],
    links: { related: ['similarity-and-scaling', 'pythagorean-theorem', 'the-unit-circle-and-trig-waves', 'scale-drawings-and-proportions', 'rigid-motions-and-congruence', 'angles-in-triangles-and-polygons', 'angle-relationships-and-parallel-lines', 'nets-and-surface-area', 'volume-of-prisms-pyramids-and-cones', 'special-right-triangles-and-trigonometry'] },

    mount({ stage, controls: C }) {
      const st = { mode: 'crit', test: 'AA', facts: 0, ghosts: true, pred: 0, guess: null, method: 'shadow', rev: false,
        dA: 40, eA: 60, de: 9, df: 9, ef: 7.5, sv: 2, ad: 4, ae: 3.2 };
      let cancel = () => {};
      const P = new Plane(stage, { span: 6 });

      /* ====================== geometry for each part ====================== */
      const calc = () => {
        const { test, facts, de, df, ef, dA, eA } = st, Tg = TG[test], k = de / Tg.AB;
        const D = [0, 0], E = [de, 0], Fs = [k * Tg.C[0], k * Tg.C[1]];
        let F = null, cloud = [];
        if (test === 'AA') {
          F = solveAA(de, dA, eA);
          if (facts === 0) cloud = F ? [F] : [];
          else for (let b = 15; b <= 150 && dA + b <= 160; b += 15) cloud.push(solveAA(de, dA, b));
        } else if (test === 'SAS' || test === 'SSS') {
          F = test === 'SAS' ? solveSAS(df, dA) : solveSSS(de, df, ef);
          if (facts === 0) cloud = F ? [F] : [];
          else {
            for (let th = 20; th <= 150; th += 10) cloud.push(solveSAS(df, th));
            if (Math.abs(Math.hypot(...Fs) - df) < .02) cloud.push(Fs);
          }
        } else { const s = solveSSA(de, ef, dA); F = s[0] || null; cloud = s; }
        return { D, E, F, Fs, k, Tg, cloud: dedupe(cloud) };
      };
      const GV = () => { const g = GIVEN[st.test]; return g[Math.min(st.facts, g.length - 1)]; };
      const hidden = () => st.test === 'SSA' && !st.pred;
      const paraGeo = () => {
        const A = [7.5, Math.sqrt(100 - 56.25)], B = [0, 0], Cc = [12, 0];
        const D = [A[0] + (B[0] - A[0]) * st.ad / 10, A[1] + (B[1] - A[1]) * st.ad / 10], E = [A[0] + (Cc[0] - A[0]) * st.ae / 8, A[1] + (Cc[1] - A[1]) * st.ae / 8];
        return { A, B, C: Cc, D, E, par: Math.abs(st.ad * 8 - st.ae * 10) < .01 };
      };

      /* ====================== drawing ====================== */
      const drawCrit = (c, p) => {
        const pal = p.pal, cl = calc(), { D, E, F, Fs, cloud, Tg } = cl, gv = GV(), ib = insetBox(p);
        const rect = p.w >= 560 ? { x: ib.x + ib.w + 16, y: 0, w: p.w - ib.x - ib.w - 16, h: p.h } : { x: 0, y: ib.y + ib.h + 8, w: p.w, h: p.h - ib.y - ib.h - 8 };
        const showG = st.ghosts && !hidden(), pts = [D, E, Fs];
        if (F) pts.push(F);
        if (showG) cloud.forEach(q => pts.push(q));
        const xs = pts.map(v => v[0]), ys = pts.map(v => v[1]);
        const b = [Math.floor(Math.min(...xs, 0) / 2) * 2, Math.ceil(Math.max(...xs) / 2) * 2, -.5, Math.ceil(Math.max(...ys) / 2) * 2];
        setView(p, b, rect, 40);
        /* ghosts: every triangle that fits the given facts */
        if (showG) cloud.forEach(q => {
          p.path([D, E, q], { fill: alpha(pal.violet, cloud.length < 4 ? .16 : .07), stroke: alpha(pal.violet, cloud.length < 4 ? .9 : .55), width: cloud.length < 4 ? 2.4 : 1.6, close: true });
          p.dot(q[0], q[1], cloud.length < 4 ? 6 : 4, alpha(pal.violet, .9));
        });
        /* target, resized to sit on DE */
        p.path([D, E, Fs], { stroke: pal.blue, width: 2.4, dash: [8, 6], close: true });
        p.dot(Fs[0], Fs[1], 10, null, pal.blue, 2.4);
        { const L = p.X(Fs[0]) > p.w * .6; T(p, "target's C", Fs[0], Fs[1], { size: 16, color: pal.blue, dx: L ? -18 : 18, dy: -8, align: L ? 'right' : 'left' }); }
        if (F) {
          const q = [D, E, F], G = cen(q), A = [angAt(D, E, F), angAt(E, D, F), angAt(F, D, E)];
          p.path(q, { fill: alpha(pal.yellow, .2), stroke: pal.yellow, width: 3.4, close: true });
          [['D', D], ['E', E], ['F', F]].forEach(([n, v], i) => {
            const u = unit(G, v), w = unit(v, G), g = gv.angs.includes(n);
            p.label(n, v[0], v[1], { size: 23, dx: u[0] * 20, dy: -u[1] * 20 });
            arcAt(p, v, q[(i + 1) % 3], q[(i + 2) % 3], 17, g ? pal.text : pal.muted, g ? 2.6 : 1.6);
            T(p, Math.round(A[i]) + '°', v[0], v[1], { size: 16, dx: w[0] * 40, dy: -w[1] * 40, color: g ? pal.text : pal.muted });
          });
          [['DE', D, E], ['DF', D, F], ['EF', E, F]].forEach(([n, a, bb]) => {
            const m = [(a[0] + bb[0]) / 2, (a[1] + bb[1]) / 2], u = unit(G, m), g = gv.sides.includes(n);
            T(p, num(rnd(dist(a, bb))), m[0], m[1], { size: 17, dx: u[0] * 20, dy: -u[1] * 20, color: g ? pal.text : pal.muted });
          });
          p.dot(F[0], F[1], 8, pal.stage, pal.brass, 3);
        }
        p.dot(E[0], E[1], 7, pal.stage, pal.brass, 3);
        drawInset(c, p, ib, Tg);
      };

      const drawShadow = (c, p) => {
        const pal = p.pal, mir = st.method === 'mirror', v = st.sv, H = 6, hs = 1.5;
        setView(p, mir ? [-1.5, 16, -2, 7.6] : [-6.8, 13.2, -2, 8.4], { x: 0, y: 0, w: p.w, h: p.h }, 26);
        p.path([[-6, 0], [17, 0]], { stroke: pal['grid-strong'], width: 2 });
        const tree = x => { p.path([[x, 0], [x, H]], { stroke: pal.blue, width: 6 }); const cx = p.X(x), cy = p.Y(H + .6), r = .75 * p.scale, g = p.ctx; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fillStyle = alpha(pal.green, .35); g.fill(); g.strokeStyle = pal.green; g.lineWidth = 2; g.stroke(); };
        tree(0);
        if (!mir) {
          const T1 = 4 * v, sx = -4;
          p.path([[0, 0], [0, H], [T1, 0]], { fill: alpha(pal.blue, .13), stroke: pal.blue, width: 2, close: true, dash: [] });
          p.path([[sx, 0], [sx, hs], [sx + v, 0]], { fill: alpha(pal.yellow, .3), stroke: pal.yellow, width: 2.4, close: true });
          p.path([[sx, 0], [sx, hs]], { stroke: pal.yellow, width: 6 });
          p.path([[0, H], [-1.2, H + 1.2 * H / T1]], { stroke: alpha(pal.text, .5), width: 1.5, dash: [4, 5] });
          p.path([[sx, hs], [sx - 1.2, hs + 1.2 * hs / v]], { stroke: alpha(pal.text, .5), width: 1.5, dash: [4, 5] });
          T(p, "sun's rays", -1.3, H + 1.2 * H / T1 + .1, { size: 15, color: pal.muted, align: 'right' });
          rightMark(p, [0, 0], [0, 1], [1, 0], 11, pal.muted); rightMark(p, [sx, 0], [0, 1], [1, 0], 11, pal.muted);
          const th = (V, a) => { arcAt(p, V, [V[0] - 1, V[1]], a, 22, pal.red, 2.4); };
          th([T1, 0], [0, H]); th([sx + v, 0], [sx, hs]);
          p.label('θ', T1, 0, { size: 20, color: pal.red, dx: -36, dy: -14 }); p.label('θ', sx + v, 0, { size: 20, color: pal.red, dx: -36, dy: -14 });
          p.label(st.rev ? 'h = 6 m' : 'h = ?', 0, H / 2, { size: 22, dx: -14, align: 'right', italic: false, color: pal.text });
          T(p, '1.5 m', sx, hs / 2, { dx: -12, align: 'right' });
          T(p, num(v) + ' m', sx + v / 2, 0, { dy: 22 });
          T(p, num(T1) + ' m', T1 / 2, 0, { dy: 22 });
          T(p, "stick's shadow", sx + v / 2, 0, { dy: 44, size: 14, color: pal.muted });
          T(p, "tree's shadow", T1 / 2, 0, { dy: 44, size: 14, color: pal.muted });
          p.dot(sx + v, 0, 8, pal.stage, pal.brass, 3);
        } else {
          const d = v, m = 4 * d, ex = m + d;
          p.path([[0, 0], [0, H], [m, 0]], { fill: alpha(pal.blue, .13), stroke: pal.blue, width: 2, close: true });
          p.path([[m, 0], [ex, 0], [ex, hs]], { fill: alpha(pal.yellow, .3), stroke: pal.yellow, width: 2.4, close: true });
          p.path([[ex, 0], [ex, hs]], { stroke: pal.yellow, width: 6 });
          p.dot(ex, hs, 6, pal.yellow);
          p.path([[m - .7, 0], [m + .7, 0]], { stroke: pal.violet, width: 7 });
          T(p, 'mirror', m, 0, { dy: 22, size: 15, color: pal.violet });
          rightMark(p, [0, 0], [0, 1], [1, 0], 11, pal.muted); rightMark(p, [ex, 0], [0, 1], [-1, 0], 11, pal.muted);
          arcAt(p, [m, 0], [m - 1, 0], [0, H], 24, pal.red, 2.4); arcAt(p, [m, 0], [m + 1, 0], [ex, hs], 24, pal.red, 2.4);
          p.label('θ', m, 0, { size: 20, color: pal.red, dx: -40, dy: -16 }); p.label('θ', m, 0, { size: 20, color: pal.red, dx: 40, dy: -16 });
          p.label(st.rev ? 'h = 6 m' : 'h = ?', 0, H / 2, { size: 22, dx: 14, align: 'left', italic: false, color: pal.text });
          T(p, '1.5 m', ex, hs / 2, { dx: 12, align: 'left' });
          T(p, 'm = ' + num(m) + ' m', m / 2, 0, { dy: 40 });
          T(p, 'd = ' + num(d) + ' m', m + d / 2, 0, { dy: 40 });
          p.dot(ex, 0, 8, pal.stage, pal.brass, 3);
        }
      };

      const drawPara = (c, p) => {
        const pal = p.pal, g = paraGeo(), { A, B, C: Cc, D, E, par } = g;
        setView(p, [-1.5, 13.5, -1.4, 7.9], { x: 0, y: 0, w: p.w, h: p.h }, 30);
        p.path([A, B, Cc], { fill: alpha(pal.blue, .1), stroke: pal.blue, width: 3, close: true });
        p.path([A, D, E], { fill: alpha(pal.yellow, .3), stroke: pal.yellow, width: 2.6, close: true });
        p.path([D, E], { stroke: par ? pal.green : pal.red, width: 4, dash: par ? [] : [7, 6] });
        arcAt(p, B, A, Cc, 22, pal.violet, 2.2); arcAt(p, D, A, E, 22, pal.violet, 2.2);
        const nm = (s, v, dx, dy) => p.label(s, v[0], v[1], { size: 22, dx, dy });
        nm('A', A, 0, -20); nm('B', B, -18, 12); nm('C', Cc, 18, 12); nm('D', D, -20, 0); nm('E', E, 20, 0);
        const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        T(p, num(st.ad), ...mid(A, D), { dx: -20, dy: -2 }); T(p, num(10 - st.ad), ...mid(D, B), { dx: -22, dy: 4 });
        T(p, num(st.ae), ...mid(A, E), { dx: 20, dy: -2 }); T(p, num(rnd(8 - st.ae)), ...mid(E, Cc), { dx: 22, dy: 4 });
        T(p, '12', 6, 0, { dy: 22 });
        const de = dist(D, E);
        T(p, st.rev && par ? 'DE = ' + num(rnd(de)) : 'DE = ?', ...mid(D, E), { dy: 20, color: par ? pal.green : pal.red });
        T(p, par ? 'DE ∥ BC' : 'not parallel', 6, 0, { dy: 46, size: 15, color: par ? pal.green : pal.red });
        p.dot(D[0], D[1], 8, pal.stage, pal.brass, 3); p.dot(E[0], E[1], 8, pal.stage, pal.brass, 3);
      };

      const drawFig = (c, p) => {
        const pal = p.pal, prob = PR[Math.min(pr.pi, PR.length - 1)], fig = prob.fig, rev = pr.rev, ans = prob.ans;
        if (fig.type === 'para') {
          const A = [4.5, Math.sqrt(64 - 20.25)], B = [0, 0], Cc = [12, 0], t = 3 / 8;
          const D = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t], E = [A[0] + (Cc[0] - A[0]) * t, A[1] + (Cc[1] - A[1]) * t];
          setView(p, [-1, 13, -1.4, 7.8], { x: 0, y: 0, w: p.w, h: p.h }, 34);
          p.path([A, B, Cc], { fill: alpha(pal.blue, .1), stroke: pal.blue, width: 3, close: true });
          p.path([A, D, E], { fill: alpha(pal.yellow, .3), stroke: pal.yellow, width: 2.6, close: true });
          p.path([D, E], { stroke: pal.green, width: 4 });
          const nm = (s, v, dx, dy) => p.label(s, v[0], v[1], { size: 22, dx, dy });
          nm('A', A, 0, -20); nm('B', B, -18, 12); nm('C', Cc, 18, 12); nm('D', D, -20, 0); nm('E', E, 20, 0);
          const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
          T(p, '3', ...mid(A, D), { dx: -18, dy: -4 }); T(p, '5', ...mid(D, B), { dx: -18, dy: 4 }); T(p, '12', 6, 0, { dy: 22 });
          T(p, rev ? 'DE = ' + ans : 'DE = ?', ...mid(D, E), { dy: -22, color: pal.green });
          T(p, 'DE ∥ BC', 6, 0, { dy: 46, size: 15, color: pal.green });
          return;
        }
        const tris = fig.tris.map(t => ({ ...t, pts: t.pts.map(v => v.slice()) }));
        const bbs = tris.map(t => { const xs = t.pts.map(v => v[0]), ys = t.pts.map(v => v[1]); return [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]; });
        const stack = p.w < 560, wd = bbs.map(b => b[1] - b[0]), ht = bbs.map(b => b[3] - b[2]);
        const gap = stack ? .3 * Math.max(...ht) + 1.6 : .16 * Math.max(...wd) + 1.4;
        let x0 = 0, y0 = 0;
        const order = stack ? [1, 0] : [0, 1];
        order.forEach(i => {
          const t = tris[i];
          const dx = stack ? -(bbs[i][0] + wd[i] / 2) : x0 - bbs[i][0], dy = stack ? y0 - bbs[i][2] : -bbs[i][2];
          t.pts = t.pts.map(([x, y]) => [x + dx, y + dy]); if (t.alt) t.alt = [t.alt[0] + dx, t.alt[1] + dy];
          x0 += wd[i] + gap; y0 += ht[i] + gap;
        });
        tris[1].col = pal.yellow;
        const all = tris.flatMap(t => t.pts.concat(t.alt ? [t.alt] : [])), xs = all.map(v => v[0]), ys = all.map(v => v[1]);
        setView(p, [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)], { x: 0, y: 0, w: p.w, h: p.h - (fig.note ? 20 : 0) }, stack ? 58 : 46);
        tris.forEach(t => drawTri(p, t, rev, ans));
        if (fig.note) ptxt(c, p, fig.note, p.w / 2, p.h - 14, 13, pal.muted);
      };

      P.onDraw = (c, p) => { if (st.mode === 'crit') drawCrit(c, p); else if (st.mode === 'shadow') drawShadow(c, p); else if (st.mode === 'para') drawPara(c, p); else drawFig(c, p); };

      /* ====================== side panel ====================== */
      const probe = C.readout(), host = probe.parentElement; probe.remove();
      const group = () => { const g = h('div', { style: 'display:flex;flex-direction:column;gap:16px' }); host.append(g); return g; };
      const small = b => Object.assign(b.style, { padding: '6px 14px', minHeight: '36px', fontSize: '.88rem' });
      const btnRow = (parent, items) => {
        const row = h('div', { class: 'ctl buttons' });
        const els = items.map(it => { const e = h('button', { type: 'button', class: 'btn', onclick: it.onClick }, it.label); small(e); row.append(e); return e; });
        parent.append(row); return els;
      };
      const mark = (els, i) => els.forEach((e, k) => { e.className = k === i ? 'btn primary' : 'btn'; e.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      const mkSlider = (parent, { label, min, max, step, fmtv, onInput }) => {
        const id = 'sts' + (++uid), out = h('output', { for: id }), lab = h('label', { for: id }, label), inp = h('input', { type: 'range', id, min, max, step, value: min });
        const upd = () => { out.textContent = fmtv(+inp.value); inp.style.setProperty('--p', ((+inp.value - min) / (max - min) * 100) + '%'); };
        inp.addEventListener('input', () => { upd(); onInput(Math.round(+inp.value * 100) / 100); });
        const wrap = h('div', { class: 'ctl slider' }, lab, out, inp); parent.append(wrap); upd();
        return { wrap, lab, set(v) { inp.value = v; upd(); }, get: () => +inp.value };
      };
      const mkSelect = (parent, label, onChange) => {
        const id = 'stl' + (++uid), sel = h('select', { id });
        sel.addEventListener('change', () => onChange(sel.value));
        parent.append(h('div', { class: 'ctl select' }, h('label', { for: id }, label), sel)); return sel;
      };
      const show = (el, on) => { el.style.display = on ? '' : 'none'; };
      const hint = (parent, t) => parent.append(h('p', { class: 'hint' }, t));
      const title = (parent, t) => parent.append(h('p', { class: 'ctl-title', style: 'margin:6px 0 8px' }, t));

      /* question card used by the application parts and by Practice */
      const mkCard = parent => {
        const box = h('div', { class: 'ctl', style: 'display:flex;flex-direction:column;gap:10px;border-top:1px solid var(--line);padding-top:14px' });
        const prog = h('div', { class: 'hint', style: 'margin:0' }), qEl = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        const chEl = h('div', { class: 'choices', style: 'flex-direction:column;flex-wrap:nowrap' });
        const fb = h('div', { class: 'q-fb', 'aria-live': 'polite', style: 'margin-top:0' });
        const nx = h('button', { type: 'button', class: 'btn primary', style: 'align-self:flex-start' });
        box.append(prog, qEl, chEl, fb, nx); parent.append(box);
        let solved = false, cur = null;
        const api = {
          get solved() { return solved; },
          ask(q, o) {
            cur = o; solved = false; qEl.innerHTML = q.prompt; fb.className = 'q-fb'; fb.innerHTML = ''; show(nx, false);
            prog.textContent = o.progress ? o.progress() : '';
            chEl.replaceChildren(...q.choices.map(ch => {
              const b = h('button', { type: 'button', class: 'choice', style: 'border-radius:12px;text-align:left;width:100%;line-height:1.4', html: ch.t });
              b.addEventListener('click', () => {
                if (solved) return;
                if (ch.ok) {
                  solved = true; b.classList.add('right'); [...chEl.children].forEach(x => { x.disabled = true; });
                  fb.className = 'q-fb ok'; fb.innerHTML = '<b>Right.</b> ' + ch.why;
                  if (o.nextLabel) { nx.textContent = o.nextLabel; show(nx, true); }
                } else { b.classList.add('wrong'); b.disabled = true; fb.className = 'q-fb no'; fb.innerHTML = '<b>Not quite.</b> ' + ch.why; }
                if (o.onResult) o.onResult(ch.ok);
                if (o.progress) prog.textContent = o.progress();
              });
              return b;
            }));
            nx.onclick = () => { if (cur.onNext) cur.onNext(); };
          },
          say(html, label, fn) {
            solved = true; prog.textContent = ''; qEl.innerHTML = html; chEl.replaceChildren(); fb.className = 'q-fb'; fb.innerHTML = '';
            nx.textContent = label; show(nx, true); nx.onclick = fn;
          }
        };
        return api;
      };
      const makeFlow = (card, getQs, after) => {
        let stage = 0;
        const go = () => {
          const qs = getQs(), q = qs[stage], last = stage === qs.length - 1;
          card.ask(q, { progress: () => `Question ${stage + 1} of ${qs.length}`, nextLabel: last ? 'Start again' : 'Next question',
            onNext: () => { stage = (stage + 1) % qs.length; if (stage === 0) after(false); go(); },
            onResult: ok => { if (ok && last) after(true); } });
        };
        return { start() { stage = 0; after(false); go(); }, refresh() { if (!card.solved) go(); } };
      };

      title(host, 'Explore');
      const partBtns = btnRow(host, [
        { label: 'Criteria', onClick: () => user(() => setMode('crit')) },
        { label: 'Shadows and mirrors', onClick: () => user(() => setMode('shadow')) },
        { label: 'Parallel segment', onClick: () => user(() => setMode('para')) },
        { label: 'Practice', onClick: () => user(() => setMode('prac')) }]);

      /* --- criteria group --- */
      const gCrit = group();
      title(gCrit, 'Build triangle DEF');
      const testBtns = btnRow(gCrit, TESTS.map(t => ({ label: t, onClick: () => user(() => { setTest(t, true); }) })));
      const factsSel = mkSelect(gCrit, 'Facts you give', v => user(() => { st.facts = +v; sync(); }));
      const sliders = {};
      for (const t of TESTS) {
        const g = h('div', { style: 'display:flex;flex-direction:column;gap:16px' }); gCrit.append(g);
        sliders[t] = { g, list: SL[t].map(([k, label, min, max, step, ang]) => mkSlider(g, { label, min, max, step, fmtv: v => ang ? v + '°' : num(v),
          onInput: v => user(() => { st[k] = v; sync(); }) })) };
      }
      const ghostT = h('input', { type: 'checkbox', id: 'stg' }); ghostT.checked = true;
      ghostT.addEventListener('change', () => { st.ghosts = ghostT.checked; P.draw(); updRo(); });
      gCrit.append(h('div', { class: 'ctl toggle' }, ghostT, h('label', { for: 'stg' }, 'Show every triangle that fits the facts')));
      const predBox = h('div', { class: 'ctl', style: 'display:flex;flex-direction:column;gap:10px;margin-top:8px' });
      const predQ = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' }, 'Predict first: will every triangle built from these facts be similar to the target?');
      const predFb = h('div', { class: 'q-fb', 'aria-live': 'polite', style: 'margin-top:0' });
      const predBtns = h('div', { class: 'ctl buttons' });
      const guess = g => user(() => { st.pred = 1; st.guess = g; sync(); });
      [['Yes, always', 1], ['No, not always', 0]].forEach(([l, g]) => { const b = h('button', { type: 'button', class: 'btn', onclick: () => guess(g) }, l); small(b); predBtns.append(b); });
      predBox.append(predQ, predBtns, predFb); gCrit.append(predBox);
      const roC = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); gCrit.append(roC);
      hint(gCrit, 'Drag F or E on the canvas, or use the sliders.');

      /* --- shadow group --- */
      const gShadow = group();
      title(gShadow, 'Indirect measurement');
      const methodSel = mkSelect(gShadow, 'Method', v => user(() => { st.method = v; st.sv = 2; setMode('shadow'); }));
      methodSel.append(h('option', { value: 'shadow' }, 'Shadow of a tree'), h('option', { value: 'mirror' }, 'Mirror on the ground'));
      const svS = mkSlider(gShadow, { label: "Stick's shadow s", min: 1, max: 3, step: .5, fmtv: v => num(v) + ' m', onInput: v => user(() => { st.sv = v; sync(); }) });
      const roS = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); gShadow.append(roS);
      const cardS = mkCard(gShadow);
      const flowS = makeFlow(cardS, () => shadowQs(), ok => { st.rev = ok; P.draw(); updRo(); });
      hint(gShadow, 'Drag the glowing dot on the ground, or use the slider.');

      /* --- parallel group --- */
      const gPara = group();
      title(gPara, 'A segment parallel to BC');
      const adS = mkSlider(gPara, { label: 'Where D sits: AD', min: 1, max: 9, step: 1, fmtv: v => num(v), onInput: v => user(() => { st.ad = v; sync(); }) });
      const aeS = mkSlider(gPara, { label: 'Where E sits: AE', min: .8, max: 7.2, step: .4, fmtv: v => num(v), onInput: v => user(() => { st.ae = v; sync(); }) });
      const roP = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); gPara.append(roP);
      const cardP = mkCard(gPara);
      const flowP = makeFlow(cardP, () => paraQs(), ok => { st.rev = ok; P.draw(); updRo(); });
      hint(gPara, 'Drag D along AB and E along AC, or use the sliders. Make DE parallel to BC.');

      /* --- practice group (after the step controls, under its own heading) --- */
      const gPrac = group();
      title(gPrac, 'Practice');
      const cardX = mkCard(gPrac);
      const pr = { pi: 0, pj: 0, firstAll: true, done: 0, good: 0, fin: false, rev: false };
      const pracShow = () => {
        if (pr.fin) {
          cardX.say(`<b>All ${PR.length} problems done.</b> You were right on the first try for ${pr.good} of ${PR.length}. A problem you missed on the first try is a good one to try again.`, 'Practice again',
            () => { Object.assign(pr, { pi: 0, pj: 0, firstAll: true, done: 0, good: 0, fin: false, rev: false }); pracShow(); });
          P.draw(); return;
        }
        const prob = PR[pr.pi], last = pr.pj === prob.parts.length - 1;
        cardX.ask(prob.parts[pr.pj], {
          progress: () => `Problem ${pr.pi + 1} of ${PR.length}, part ${pr.pj + 1} of ${prob.parts.length}. Right on the first try: ${pr.good} of ${pr.done} finished.`,
          nextLabel: last ? (pr.pi < PR.length - 1 ? 'Next problem' : 'See my score') : 'Next part',
          onNext: () => { if (!last) pr.pj++; else { pr.pi++; pr.pj = 0; pr.firstAll = true; pr.rev = false; if (pr.pi >= PR.length) pr.fin = true; } pracShow(); },
          onResult: ok => {
            if (!ok) pr.firstAll = false;
            else if (last) { pr.done++; if (pr.firstAll) pr.good++; pr.rev = true; P.draw(); }
          } });
        P.draw();
      };
      hint(gPrac, 'Figures are not always drawn to scale. Use the numbers and the letter order.');

      /* ---- the questions of the two application parts ---- */
      const hq = (ok, t, why) => C_(t, ok, why);
      const shadowQs = () => {
        const mir = st.method === 'mirror', v = st.sv, m = 4 * v, T1 = 4 * v, a = num(v);
        const crit = [
          hq(true, 'AA: a right angle and the same angle at the ground', mir
            ? 'Both people stand straight up, so each triangle has a 90° angle. The light reflects at the same angle it arrives, so the angles at the mirror match. Two angles are enough: AA.'
            : 'Both stand straight up, so each triangle has a 90° angle. The sun’s rays are parallel, so they meet the ground at the same angle. Two angles are enough: AA.'),
          hq(false, 'SAS: two sides in proportion and the angle between them', 'We cannot use side ratios to prove similarity here, because the ratio is exactly what we want to use. Angles can be argued without measuring anything.'),
          hq(false, 'SSS: all three sides in proportion', 'The sun’s ray (or the light ray) is not measured, so SSS is not available. AA needs no side lengths.'),
          hq(false, 'No rule applies, they only look alike', 'They are truly similar. Two matching angles are enough to prove it.')];
        const h6 = 6;
        const val = x => (Math.abs(x - h6) < .01 ? 9 : x);
        const eq = mir
          ? [hq(false, `h ÷ 1.5 = ${a} ÷ ${num(m)}`, 'This has the second ratio upside down. The tree is the bigger triangle, so its numbers go on top on both sides.'),
             hq(true, `h ÷ 1.5 = ${num(m)} ÷ ${a}`, `Tree height matches your eye height (1.5), and tree-to-mirror (${num(m)}) matches mirror-to-you (${a}). Matching sides have the same ratio.`),
             hq(false, `h ÷ ${num(m)} = ${a} ÷ 1.5`, 'This matches the tree height with the wrong side. Height goes with height, and distance along the ground with distance along the ground.'),
             hq(false, `h = 1.5 + ${num(m)} − ${a}`, 'Adding and subtracting does not keep the shape. Similar triangles are scaled by one factor.')]
          : [hq(false, `h ÷ 1.5 = ${a} ÷ ${num(T1)}`, 'This has the second ratio upside down. The tree is the bigger triangle, so its numbers go on top on both sides.'),
             hq(false, `h ÷ ${num(T1)} = ${a} ÷ 1.5`, 'This matches the tree height with the stick’s shadow. Height goes with height (tree with stick), shadow with shadow.'),
             hq(true, `h ÷ 1.5 = ${num(T1)} ÷ ${a}`, `Tree height matches stick height (1.5), and tree shadow (${num(T1)}) matches stick shadow (${a}). Matching sides have the same ratio.`),
             hq(false, `h = 1.5 + ${num(T1)} − ${a}`, 'Adding and subtracting does not keep the shape. Similar triangles are scaled by one factor.')];
        const ratio = num(T1 / v);
        const ans = [hq(false, num(val(1.5 + 3 * v)) + ' m', `That adds the difference (${num(T1)} − ${a}) to 1.5. The shapes are scaled, so multiply by ${ratio} instead.`),
                     hq(false, num(rnd(1.5 * v / T1)) + ' m', 'The factor is upside down. The tree is much bigger than the stick, so its height must be larger than 1.5 m.'),
                     hq(true, '6 m', `The scale factor is ${num(T1)} ÷ ${a} = ${ratio}, so h = 1.5 × ${ratio} = 6 m. Slide ${mir ? 'the mirror' : 'the sun'} and check: the height stays 6 m.`),
                     hq(false, num(val(rnd(T1 * v / 1.5))) + ' m', 'That multiplies the two shadows and divides by the stick. The factor ' + ratio + ' multiplies the stick height.')];
        return [{ prompt: mir ? 'The tree and a person both stand straight up and the mirror is flat. Which rule shows that the two triangles are similar?'
                            : 'The tree and the stick both stand straight up. Which rule shows that the two triangles are similar?', choices: crit },
                { prompt: mir ? `Your eye is 1.5 m high, you stand ${a} m from the mirror, and the mirror is ${num(m)} m from the tree. Which equation gives the tree height h?`
                              : `The stick is 1.5 m, its shadow is ${a} m and the tree’s shadow is ${num(T1)} m. Which equation gives the tree height h?`, choices: eq },
                { prompt: 'Solve your equation. How tall is the tree?', choices: ans }];
      };
      const paraQs = () => {
        const ad = st.ad, db = 10 - ad, de = rnd(1.2 * ad), r = num(rnd(ad / 10));
        const tail = ' Assume DE is parallel to BC.';
        const s1 = [hq(true, 'ADE ~ ABC by AA: angle A is shared and angle ADE = angle ABC', 'Because DE is parallel to BC, the angles at D and B are corresponding angles, so they are equal. Angle A is in both triangles. Two pairs of equal angles prove ADE ~ ABC, and D matches B, E matches C.'),
                    hq(false, 'ADE ~ ACB by AA', 'AA is right, but the order is wrong. D matches B and E matches C, so the letters must read A, B, C in the same order as A, D, E.'),
                    hq(false, 'ADE ~ ABC by SSS, because DE and BC are both sides', 'Having sides is not enough. SSS needs all three ratios equal, and we have not shown that. Angles from the parallel lines give AA directly.'),
                    hq(false, 'ADE ~ DBC by AA', 'Triangle DBC does not have the shape of ADE. The small triangle sits inside ABC and shares angle A with it.')];
        const eq = [hq(false, `${num(ad)} ÷ ${num(db)} = DE ÷ 12`, 'DB is only the lower piece of AB. Triangle ADE is compared with the whole triangle ABC, so use AB = 10.'),
                    hq(false, `${num(ad)} ÷ 10 = 12 ÷ DE`, 'The right side is upside down. ADE is smaller than ABC on both sides, so DE ÷ 12 must equal AD ÷ 10.'),
                    hq(true, `${num(ad)} ÷ 10 = DE ÷ 12`, 'AD matches AB (the whole side, AD + DB = 10), and DE matches BC (12). Matching sides have the same ratio.'),
                    hq(false, `${num(db)} ÷ 10 = DE ÷ 12`, `DB (${num(db)}) belongs to the lower piece, not to triangle ADE. The side of ADE that matches AB is AD.`)];
        const wrong1 = rnd(ad / db * 12), wrong2 = rnd(12 * db / 10);
        const ans = [hq(false, num(wrong1), `That is ${num(ad)} ÷ ${num(db)} × 12. It uses the piece DB instead of the whole side AB = 10.`),
                     hq(false, num(wrong2), `That is 12 × ${num(db)} ÷ 10, which uses DB instead of AD.`),
                     hq(true, num(de), `DE = 12 × ${num(ad)} ÷ 10 = ${num(de)}. The small triangle is ${r} of the big one.`),
                     hq(false, num(rnd(10 * ad / 12)), 'That turns the factor upside down (10 ÷ 12 instead of 12 ÷ 10).')];
        const dup = ans.findIndex((x, i) => i !== 2 && x.t === ans[2].t); if (dup >= 0) ans[dup] = hq(false, num(rnd(12 - ad)), 'That subtracts instead of scaling.');
        return [{ prompt: 'Segment DE joins D on AB to E on AC, with DE parallel to BC. Which statement is correct?', choices: s1 },
                { prompt: `AD = ${num(ad)}, DB = ${num(db)}, AB = 10 and BC = 12.${tail} Which equation gives DE?`, choices: eq },
                { prompt: `Solve ${num(ad)} ÷ 10 = DE ÷ 12. How long is DE?`, choices: ans }];
      };

      /* ====================== readouts ====================== */
      const f2 = v => v.toFixed(2);
      const updRo = () => {
        if (st.mode === 'crit') {
          const cl = calc(), { D, E, F, Fs, cloud, Tg } = cl, gv = GV(), lines = [];
          lines.push(`<span class="k">Given</span> ${gv.txt}`);
          if (!F) {
            lines.push(`<b>No triangle fits these measures.</b> ${st.test === 'AA' ? 'The two angles add to 180° or more.' : st.test === 'SSS' ? 'Two sides together must be longer than the third.' : 'Side EF is too short to reach the ray from D.'}`);
          } else {
            const rs = [['DE ÷ AB', st.de, Tg.AB], ['DF ÷ AC', Math.hypot(...F), Tg.AC], ['EF ÷ BC', dist(F, E), Tg.BC]];
            const rv = rs.map(r => r[1] / r[2]);
            lines.push(`<span class="k">Side ratios</span><br>` + rs.map((r, i) => `${r[0]} = ${num(rnd(r[1]))} ÷ ${num(rnd(r[2]))} = <b>${f2(rv[i])}</b>`).join('<br>'));
            const ang = [angAt(D, E, F), angAt(E, D, F), angAt(F, D, E)];
            lines.push(`<span class="k">Angles</span> D ${Math.round(ang[0])}° (A ${Math.round(Tg.ang[0])}°), E ${Math.round(ang[1])}° (B ${Math.round(Tg.ang[1])}°), F ${Math.round(ang[2])}° (C ${Math.round(Tg.ang[2])}°)`);
            const eqr = Math.max(...rv) - Math.min(...rv) < .006, simYours = dist(F, Fs) < .03;
            lines.push(simYours ? '<b>Your triangle is similar to the target</b>' + (eqr ? ': all three ratios are equal.' : '.') : '<b>Your triangle is not similar to the target.</b> The three ratios are not all equal.');
          }
          if (hidden()) lines.push('<span class="k">Ghosts</span> hidden until you predict.');
          else if (F || cloud.length) {
            const sim = cloud.filter(q => dist(q, Fs) < .03).length;
            if (cloud.length === 1) lines.push(sim ? '<b>These facts fix one shape, and it is the target\u2019s shape.</b>' : '<b>These facts fix one shape, but it is not the target\u2019s.</b>');
            else if (cloud.length > 1) lines.push(`<b>Not forced.</b> ${cloud.length} different triangles fit these facts, and ${sim ? 'only ' + sim + (sim === 1 ? ' is' : ' are') : 'none is'} the target\u2019s shape. These facts alone do not prove similarity.`);
          }
          show(predBox, st.test === 'SSA'); show(predBtns, st.test === 'SSA' && !st.pred);
          roC.innerHTML = lines.join('<br>');
          predFb.className = 'q-fb'; predFb.innerHTML = '';
          if (st.test === 'SSA' && st.pred) {
            const right = st.guess === 0;
            predFb.className = 'q-fb ' + (right ? 'ok' : 'no');
            predFb.innerHTML = `<b>${right ? 'Right.' : 'Not this time.'}</b> The violet ghosts show it: with the facts at the target’s values, the angle is outside the two sides and point F can land in two places. Only one of them gives the target’s shape, so SSA does not force similarity.`;
          }
        } else if (st.mode === 'shadow') {
          const mir = st.method === 'mirror', v = st.sv, hh = st.rev ? '6 m' : '?';
          roS.innerHTML = mir
            ? `<span class="k">Eye height</span> 1.5 m<br><span class="k">Mirror to you, d</span> ${num(v)} m<br><span class="k">Tree to mirror, m</span> ${num(4 * v)} m<br><span class="k">Tree height h</span> ${hh}` + (st.rev ? `<br>1.5 ÷ ${num(v)} = 6 ÷ ${num(4 * v)} = ${num(rnd(1.5 / v))}` : '')
            : `<span class="k">Stick</span> 1.5 m, shadow ${num(v)} m<br><span class="k">Tree's shadow</span> ${num(4 * v)} m<br><span class="k">Tree height h</span> ${hh}` + (st.rev ? `<br>1.5 ÷ ${num(v)} = 6 ÷ ${num(4 * v)} = ${num(rnd(1.5 / v))}` : '');
        } else if (st.mode === 'para') {
          const g = paraGeo(), de = dist(g.D, g.E);
          const a1 = angAt(g.B, g.A, g.C), a2 = angAt(g.D, g.A, g.E);
          roP.innerHTML = `<span class="k">AD ÷ AB</span> ${num(st.ad)} ÷ 10 = <b>${f2(st.ad / 10)}</b><br><span class="k">AE ÷ AC</span> ${num(st.ae)} ÷ 8 = <b>${f2(st.ae / 8)}</b><br><span class="k">DE ÷ BC</span> ${f2(de)} ÷ 12 = <b>${f2(de / 12)}</b><br>` +
            `<span class="k">Angle ADE</span> ${Math.round(a2)}° · <span class="k">angle ABC</span> ${Math.round(a1)}°<br>` +
            (g.par ? '<b>DE is parallel to BC.</b> All three ratios are equal and the two angles match, so ADE ~ ABC.' : '<b>DE is not parallel to BC.</b> The ratios differ and the angles differ. Slide E until they match.');
        }
      };

      /* ====================== state glue ====================== */
      const sync = () => {
        for (const t of TESTS) SL[t].forEach(([k], i) => sliders[t].list[i].set(st[k]));
        svS.set(st.sv); adS.set(st.ad); aeS.set(st.ae);
        P.draw(); updRo();
      };
      const refreshFlow = () => { if (st.mode === 'shadow') flowS.refresh(); else if (st.mode === 'para') flowP.refresh(); };
      const user = fn => { cancel(); fn(); refreshFlow(); };
      const setTest = (t, defaults) => {
        st.test = t; st.facts = 0; st.pred = 0; st.guess = null;
        if (defaults) Object.assign(st, DEF[t]);
        factsSel.replaceChildren(...FACTOPT[t].map((s, i) => h('option', { value: String(i) }, s))); factsSel.value = '0';
        TESTS.forEach(x => show(sliders[x].g, x === t)); mark(testBtns, TESTS.indexOf(t));
        show(factsSel.parentElement, FACTOPT[t].length > 1);
        show(predBox, t === 'SSA'); show(predBtns, t === 'SSA' && !st.pred);
        sync();
      };
      const setMode = m => {
        st.mode = m; st.rev = false;
        mark(partBtns, ['crit', 'shadow', 'para', 'prac'].indexOf(m));
        show(gCrit, m === 'crit'); show(gShadow, m === 'shadow'); show(gPara, m === 'para'); show(gPrac, m === 'prac');
        if (m === 'shadow') {
          svS.lab.textContent = st.method === 'mirror' ? 'Your distance from the mirror d' : "Stick's shadow s"; methodSel.value = st.method; flowS.start();
        } else if (m === 'para') flowP.start();
        else if (m === 'prac') { pr.rev = false; pracShow(); }
        sync();
      };
      /* ====================== dragging ====================== */
      const handles = () => {
        if (st.mode === 'crit') { const c = calc(), out = []; if (c.F) out.push(['F', c.F[0], c.F[1]]); out.push(['E', st.de, 0]); return out; }
        if (st.mode === 'para') { const g = paraGeo(); return [['D', ...g.D], ['E', ...g.E]]; }
        if (st.mode === 'shadow') return [['sv', st.method === 'mirror' ? 5 * st.sv : -4 + st.sv, 0]];
        return [];
      };
      const fit = (k, v) => { const r = SL[st.test].find(a => a[0] === k); return clamp(snap(v, r[4]), r[2], r[3]); };
      draggable(P, {
        hit: (px, py) => { let best = null, bd = 22; for (const [id, x, y] of handles()) { const d = Math.hypot(P.X(x) - px, P.Y(y) - py); if (d < bd) { bd = d; best = id; } } return best; },
        move: (hd, x, y) => {
          cancel();
          if (st.mode === 'crit') {
            if (hd === 'E') st.de = fit('de', x);
            else {
              const th = Math.atan2(y, x) * DG, r = Math.hypot(x, y), t = st.test;
              if (t === 'AA') { st.dA = fit('dA', th); st.eA = fit('eA', Math.atan2(y, st.de - x) * DG); }
              else if (t === 'SAS') { st.dA = fit('dA', th); st.df = fit('df', r); }
              else if (t === 'SSS') { st.df = fit('df', r); st.ef = fit('ef', Math.hypot(x - st.de, y)); }
              else { st.dA = fit('dA', th); st.ef = fit('ef', Math.hypot(x - st.de, y)); }
            }
          } else if (st.mode === 'para') {
            const g = paraGeo(), A = g.A;
            if (hd === 'D') { const u = unit(A, g.B); st.ad = clamp(snap((x - A[0]) * u[0] + (y - A[1]) * u[1], 1), 1, 9); }
            else { const u = unit(A, g.C); st.ae = clamp(snap((x - A[0]) * u[0] + (y - A[1]) * u[1], .4), .8, 7.2); st.ae = rnd(st.ae); }
          } else if (st.mode === 'shadow') {
            st.sv = clamp(snap(st.method === 'mirror' ? x / 5 : x + 4, .5), 1, 3);
          }
          sync(); refreshFlow();
        }
      });

      /* ====================== steps ====================== */
      const apply = (patch, immediate) => {
        cancel();
        const rest = {}, fl = {};
        for (const k in patch) (FLAGS.includes(k) ? fl : rest)[k] = patch[k];
        if (fl.test !== undefined) setTest(fl.test, false);
        if (fl.facts !== undefined) { st.facts = fl.facts; factsSel.value = String(fl.facts); }
        if (fl.ghosts !== undefined) { st.ghosts = fl.ghosts; ghostT.checked = fl.ghosts; }
        if (fl.pred !== undefined) { st.pred = fl.pred; st.guess = null; }
        if (fl.method !== undefined) st.method = fl.method;
        if (fl.mode !== undefined) setMode(fl.mode);
        if (immediate) { Object.assign(st, rest); sync(); refreshFlow(); }
        else cancel = animateTo(st, rest, 900, sync, refreshFlow);
      };

      /* start state: hide the groups that are not showing, then let step 1 set the numbers */
      setTest('AA', false); setMode('crit');
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
