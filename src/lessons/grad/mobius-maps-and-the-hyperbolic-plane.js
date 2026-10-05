/* =====================================================================
   GRADUATE (Complex Analysis) — Möbius maps and the hyperbolic plane
   ===================================================================== */
{
  /* ---------- complex numbers [x, y] and 2x2 complex matrices [a, b, c, d] ---------- */
  /*MATH-START*/
  const INF = null, EPS = 1e-9, MINUS = '−';
  const cadd = (p, q) => [p[0] + q[0], p[1] + q[1]];
  const csub = (p, q) => [p[0] - q[0], p[1] - q[1]];
  const cmul = (p, q) => [p[0] * q[0] - p[1] * q[1], p[0] * q[1] + p[1] * q[0]];
  const cab2 = p => p[0] * p[0] + p[1] * p[1];
  const cabs = p => Math.hypot(p[0], p[1]);
  const cdiv = (p, q) => { const d = cab2(q); return [(p[0] * q[0] + p[1] * q[1]) / d, (p[1] * q[0] - p[0] * q[1]) / d]; };
  const cconj = p => [p[0], -p[1]];
  const cscl = (p, k) => [p[0] * k, p[1] * k];
  const cis = t => [Math.cos(t), Math.sin(t)];
  const csqrt = p => cscl(cis(Math.atan2(p[1], p[0]) / 2), Math.sqrt(cabs(p)));
  const ONE = [1, 0], ZERO = [0, 0];
  const IDM = [ONE, ZERO, ZERO, ONE];
  const mmul = (M, N) => [cadd(cmul(M[0], N[0]), cmul(M[1], N[2])), cadd(cmul(M[0], N[1]), cmul(M[1], N[3])),
    cadd(cmul(M[2], N[0]), cmul(M[3], N[2])), cadd(cmul(M[2], N[1]), cmul(M[3], N[3]))];
  const mdet = M => csub(cmul(M[0], M[3]), cmul(M[1], M[2]));
  const madj = M => [M[3], cscl(M[1], -1), cscl(M[2], -1), M[0]];
  /* the image of z (or of INF) under the Möbius map of M */
  const mob = (M, z) => {
    if (z === INF) return cab2(M[2]) < 1e-20 ? INF : cdiv(M[0], M[2]);
    const den = cadd(cmul(M[2], z), M[3]);
    if (cab2(den) < 1e-22) return INF;
    return cdiv(cadd(cmul(M[0], z), M[1]), den);
  };
  /* scale to determinant 1, with the sign whose trace has a non-negative real part */
  const mnorm = M => { const s = csqrt(mdet(M)); let N = M.map(e => cdiv(e, s)); if (N[0][0] + N[3][0] < 0) N = N.map(e => cscl(e, -1)); return N; };
  const mlerp = (M, t) => { const N = mnorm(M); return IDM.map((e, i) => cadd(cscl(e, 1 - t), cscl(N[i], t))); };

  /* generalized circles: A|z|² + B z̄ + B̄ z + C = 0 with A, C real (A = 0: a line) */
  const hLine = (p, u) => { const n = [-u[1], u[0]]; return { A: 0, B: n, C: -2 * (n[0] * p[0] + n[1] * p[1]) }; };
  const hCirc = (c, r) => ({ A: 1, B: cscl(c, -1), C: cab2(c) - r * r });
  const REAL_AXIS = hLine(ZERO, ONE);
  /* pull back by N: the set of w with N(w) on H, i.e. N* H N */
  const hPull = (H, N) => {
    const [n0, n1, n2, n3] = N, Bb = cconj(H.B);
    const k00 = cadd(cscl(n0, H.A), cmul(H.B, n2)), k01 = cadd(cscl(n1, H.A), cmul(H.B, n3));
    const k10 = cadd(cmul(Bb, n0), cscl(n2, H.C)), k11 = cadd(cmul(Bb, n1), cscl(n3, H.C));
    const A = cadd(cmul(cconj(n0), k00), cmul(cconj(n2), k10))[0];
    const B = cadd(cmul(cconj(n0), k01), cmul(cconj(n2), k11));
    const C = cadd(cmul(cconj(n1), k01), cmul(cconj(n3), k11))[0];
    return { A, B, C };
  };
  /* the image of H under the map M */
  const hImage = (H, M) => hPull(H, madj(M));
  const hDecode = H => {
    const s = Math.max(Math.abs(H.A), cabs(H.B), Math.abs(H.C)); if (!(s > 0)) return null;
    const A = H.A / s, B = cscl(H.B, 1 / s), C = H.C / s;
    if (Math.abs(A) < 1e-10) { const b2 = cab2(B); if (b2 < 1e-20) return null; return { line: true, n: B, p: cscl(B, -C / (2 * b2)) }; }
    const c = cscl(B, -1 / A), rr = cab2(B) / (A * A) - C / A;
    return rr > 0 ? { line: false, c, r: Math.sqrt(rr) } : null;
  };
  /* the map sending z1, z2, z3 to 0, 1, ∞ */
  const threeMap = (z1, z2, z3) => { const u = csub(z2, z3), v = csub(z2, z1); return [u, cscl(cmul(z1, u), -1), v, cscl(cmul(z3, v), -1)]; };
  /* disk automorphism e^{iθ}(z − a)/(1 − ā z) */
  const phiM = (a, th) => { const e = cis(th); return [e, cscl(cmul(e, a), -1), cscl(cconj(a), -1), ONE]; };
  const dH = (p, q) => 2 * Math.atanh(Math.min(cabs(csub(p, q)) / cabs(csub(ONE, cmul(cconj(p), q))), 1 - 1e-15));

  /* the geodesic through u and v in the disk: a diameter, or the circle orthogonal to |z| = 1 */
  const geo = (u, v) => {
    const cr = u[0] * v[1] - u[1] * v[0];
    if (Math.abs(cr) < 1e-12) { const d = cab2(u) > cab2(v) ? u : v; return { line: true, d: cab2(d) > 1e-20 ? d : ONE }; }
    const a1 = (cab2(u) + 1) / 2, a2 = (cab2(v) + 1) / 2;
    const c = [(a1 * v[1] - a2 * u[1]) / cr, (u[0] * a2 - v[0] * a1) / cr];
    return { line: false, c, r: Math.sqrt(Math.max(cab2(c) - 1, 0)) };
  };
  /* reflection in that geodesic (an anti-Möbius isometry) */
  const reflector = (u, v) => {
    const g = geo(u, v);
    if (g.line) { const e2 = cscl(cmul(g.d, g.d), 1 / cab2(g.d)); return w => cmul(e2, cconj(w)); }
    const r2 = g.r * g.r; return w => { const d = csub(w, g.c); return cadd(g.c, cscl(d, r2 / cab2(d))); };
  };
  /* unit tangent at P of the geodesic from P to Q, and the angle at P between the geodesics to Q and to R */
  const tangent = (P, Q) => {
    const g = geo(P, Q); let t;
    if (g.line) t = csub(Q, P);
    else { const rp = csub(P, g.c); t = [-rp[1], rp[0]]; if (t[0] * (Q[0] - P[0]) + t[1] * (Q[1] - P[1]) < 0) t = cscl(t, -1); }
    return cscl(t, 1 / (cabs(t) || 1));
  };
  const angleAt = (P, Q, R) => { const a = tangent(P, Q), b = tangent(P, R); return Math.acos(clamp(a[0] * b[0] + a[1] * b[1], -1, 1)); };

  /* {p, q} tilings: the central regular p-gon, then reflections across edges, all in display coordinates */
  const TILINGS = {
    '54': { p: 5, q: 4, name: '{5, 4}: pentagons, 4 at each corner' },
    '45': { p: 4, q: 5, name: '{4, 5}: squares, 5 at each corner' },
    '73': { p: 7, q: 3, name: '{7, 3}: heptagons, 3 at each corner' },
    '64': { p: 6, q: 4, name: '{6, 4}: hexagons, 4 at each corner' }
  };
  const tileBase = key => {
    const T = TILINGS[key]; if (T.v) return T.v;
    const R = Math.acosh(1 / (Math.tan(Math.PI / T.p) * Math.tan(Math.PI / T.q))), rv = Math.tanh(R / 2);
    T.rv = rv; T.v = []; for (let k = 0; k < T.p; k++) T.v.push(cscl(cis(Math.PI / 2 + TAU * k / T.p), rv));
    return T.v;
  };
  const tiles = (key, M, rmax, cap = 2600) => {
    const base = tileBase(key), p = base.length, c0 = mob(M, ZERO);
    const out = [{ v: base.map(z => mob(M, z)), c: c0, par: 0 }], seen = new Set();
    const kk = c => Math.round(c[0] * 2e5) * 1e6 + Math.round(c[1] * 2e5);
    seen.add(kk(c0));
    for (let i = 0; i < out.length && out.length < cap; i++) {
      const t = out[i];
      for (let k = 0; k < p; k++) {
        const R = reflector(t.v[k], t.v[(k + 1) % p]), nc = R(t.c);
        if (cab2(nc) > rmax * rmax) continue;
        const s = kk(nc); if (seen.has(s)) continue; seen.add(s);
        out.push({ v: t.v.map(R), c: nc, par: 1 - t.par });
      }
    }
    return out;
  };
  /*MATH-END*/

  /* ---------- numbers and words ---------- */
  const nf = (v, d = 2) => { const k = 10 ** d, r = Math.round(v * k) / k; if (r === 0) return '0'; const s = String(Math.abs(r)); return (r < 0 ? MINUS : '') + s; };
  const f2 = v => { const r = Math.round(v * 100) / 100; return (r < 0 ? MINUS : '') + Math.abs(r).toFixed(2); };
  const nfC = z => {
    if (z === INF) return '∞';
    const x = Math.round(z[0] * 100) / 100, y = Math.round(z[1] * 100) / 100;
    if (!y) return nf(x);
    const ys = (Math.abs(y) === 1 ? '' : nf(Math.abs(y))) + 'i';
    if (!x) return (y < 0 ? MINUS : '') + ys;
    return nf(x) + (y < 0 ? ' − ' : ' + ') + ys;
  };
  const isZ = z => Math.abs(z[0]) < 5e-3 && Math.abs(z[1]) < 5e-3;
  /* one coefficient times a variable, as text */
  const term = (k, v) => {
    if (isZ(k)) return '';
    const s = nfC(k), both = Math.abs(Math.round(k[0] * 100)) > 0 && Math.abs(Math.round(k[1] * 100)) > 0;
    if (!v) return both ? '(' + s + ')' : s;
    if (s === '1') return v; if (s === MINUS + '1') return MINUS + v;
    return (both ? '(' + s + ')' : s) + v;
  };
  const sum2 = (t1, t2) => {
    if (!t1) return t2 || '0'; if (!t2) return t1;
    return t2[0] === MINUS ? t1 + ' − ' + t2.slice(1) : t1 + ' + ' + t2;
  };
  /* k1 z + k0, writing a complex constant with a negative real part as "− (…)" */
  const lin = (k1, k0) => {
    const both = Math.abs(Math.round(k0[0] * 100)) > 0 && Math.abs(Math.round(k0[1] * 100)) > 0, t1 = term(k1, 'z');
    if (both && k0[0] < 0 && t1) return t1 + ' − (' + nfC(cscl(k0, -1)) + ')';
    return sum2(t1, term(k0, ''));
  };
  const mobText = M => {
    const num = lin(M[0], M[1]), den = lin(M[2], M[3]);
    if (den === '1') return num;
    return (/[ ]/.test(num) ? '(' + num + ')' : num) + '/' + (/[ ]/.test(den) ? '(' + den + ')' : den);
  };
  const SUB = ['', '₁', '₂', '₃', '₄'];
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;
  const FONT = '"Hanken Grotesk","Helvetica Neue",Arial,sans-serif';
  const deg = r => r * 180 / Math.PI;
  /* state fields that steps animate; everything else in a patch is set at once */
  const ANIM = new Set(['u', 't', 's', 'ax', 'ay', 'th', 'z1x', 'z1y', 'z2x', 'z2y', 'z3x', 'z3y', 'z4x', 'z4y', 'Px', 'Py', 'Qx', 'Qy', 'Rx', 'Ry']);

  /* ---------- the building blocks of step 1, each with a path from the identity ---------- */
  const PIECES = {
    p1: { lab: 'z + 1', M: [ONE, ONE, ZERO, ONE], path: u => [ONE, [u, 0], ZERO, ONE] },
    m1: { lab: 'z − 1', M: [ONE, [-1, 0], ZERO, ONE], path: u => [ONE, [-u, 0], ZERO, ONE] },
    pi: { lab: 'z + i', M: [ONE, [0, 1], ZERO, ONE], path: u => [ONE, [0, u], ZERO, ONE] },
    s2: { lab: '2z', M: [[2, 0], ZERO, ZERO, ONE], path: u => [[2 ** u, 0], ZERO, ZERO, ONE] },
    ri: { lab: 'iz', M: [[0, 1], ZERO, ZERO, ONE], path: u => [cis(Math.PI / 2 * u), ZERO, ZERO, ONE] },
    /* a half-turn of the Riemann sphere about the real axis, ending at 1/z */
    inv: { lab: '1/z', M: [ZERO, ONE, ONE, ZERO], path: u => { const a = Math.PI / 2 * u; return [[Math.cos(a), 0], [0, Math.sin(a)], [0, Math.sin(a)], [Math.cos(a), 0]]; } }
  };
  const PIECE_BTNS = [['p1', 'Shift: z + 1'], ['m1', 'Shift: z − 1'], ['pi', 'Shift: z + i'], ['s2', 'Scale: 2z'], ['ri', 'Turn: iz'], ['inv', 'Invert: 1/z']];

  /* ---------- predict, then see (three points) ---------- */
  const PRED = [
    { z: [[-1, 0], [0, 1], [1, 0], [0, -1]], ans: 0,
      q: 'Here z₁ = −1, z₂ = i, z₃ = 1 and z₄ = −i, all on the unit circle. T sends z₁, z₂, z₃ to 0, 1, ∞. Where does T send z₄?',
      ch: ['T(z₄) = −1', 'T(z₄) = i', 'T(z₄) = ∞', 'T(z₄) = 2'],
      why: 'The unit circle passes through z₃, which goes to ∞, so its image is a line; the line also passes through 0 and 1, so it is the real axis. z₄ is on that circle, so T(z₄) is real: T(−i) = (−i + 1)(i − 1)/((−i − 1)(i + 1)) = 2i/(−2i) = −1. Only z₃ goes to ∞.' },
    { z: [[1, 0], [0, 1], [-1, 0], [0, 0]], ans: 2,
      q: 'Now z₁ = 1, z₂ = i, z₃ = −1 are on the unit circle and z₄ = 0 is its center. Where does T send z₄?',
      ch: ['T(0) = 0', 'T(0) = 1/2, on the real axis', 'T(0) = i, above the real axis', 'T(0) = ∞'],
      why: 'The circle still goes to the real axis, but 0 is not on the circle, so T(0) is not real: T(0) = (0 − 1)(i + 1)/((0 + 1)(i − 1)) = −(1 + i)/(i − 1) = i. The inside of the circle (on your left as you walk z₁ → z₂ → z₃) goes to the upper half-plane (on your left as you walk 0 → 1 → ∞).' },
    { z: [[0, 0], [1, 0], [2, 0], [1, 1]], ans: 1,
      q: 'Now z₁ = 0, z₂ = 1, z₃ = 2 lie on one line, and z₄ = 1 + i. Is the image of the line through z₁, z₂, z₃ a line or a circle?',
      ch: ['A circle, since T is not a translation', 'The real axis, a line', 'A circle through 0 and 1', 'A single point'],
      why: 'The line through z₁, z₂, z₃ is the real axis. Its image passes through T(z₃) = ∞, so it is a line, and it passes through 0 and 1: the real axis again. Here T(z) = −z/(z − 2) has real coefficients, so real numbers stay real. T(1 + i) = −(1 + i)/(−1 + i) = i.' }
  ];

  /* ---------- practice: eight fixed problems ---------- */
  const PRAC = [
    { name: 'where ∞ goes', setup: { view: 1, custom: [[2, 0], ONE, ONE, [-3, 0]], customLab: '(2z + 1)/(z − 3)', u: 0, hl: null, marks: [] }, after: { u: 1 }, ans: 1,
      q: 'f(z) = (2z + 1)/(z − 3). Where does f send ∞, and which point does f send to ∞?',
      ch: [['f(∞) = −1/3 and f(−1/2) = ∞', 'Those are f(0) = −1/3 and the zero of the numerator, where f = 0. For ∞ compare the leading terms: f(∞) = a/c = 2/1 = 2. The pole is where z − 3 = 0.'],
           ['f(∞) = 2 and f(3) = ∞', 'For large z the ratio is about 2z/z, so f(∞) = a/c = 2. The denominator vanishes at z = −d/c = 3, so f(3) = ∞. In the picture every image curve passes through 2.'],
           ['f(∞) = ∞ and f(3) = 2', 'f(∞) = ∞ only when c = 0. Here c = 1, so f(∞) = a/c = 2, and 3 is the pole, which goes to ∞.'],
           ['f(∞) = 2 and f(−3) = ∞', 'The value at ∞ is right, but the pole is where z − 3 = 0, that is z = −d/c = 3, not −3.']] },
    { name: 'line or circle', setup: { view: 1, custom: [ZERO, ONE, ONE, ZERO], customLab: '1/z', u: 0, hl: 'x1', marks: [] }, after: { u: 1 }, ans: 3,
      q: 'f(z) = 1/z. What is the image of the vertical line Re z = 1 (violet)?',
      ch: [['The vertical line Re w = 1', 'Only lines through the pole 0 stay lines. Re z = 1 misses 0, so its image is a circle. It passes through f(∞) = 0.'],
           ['The unit circle |w| = 1', 'Points of the line have |z| ≥ 1, so |1/z| ≤ 1, and only z = 1 lands on the unit circle. The image is a smaller circle inside it.'],
           ['A line through 0', 'It does pass through f(∞) = 0, but the line misses the pole 0, so the image cannot pass through ∞: it is a circle, not a line.'],
           ['The circle with center 1/2 and radius 1/2', 'The line misses the pole 0, so the image is a circle; it contains f(∞) = 0 and f(1) = 1. For w = 1/(1 + iy) = (1 − iy)/(1 + y²) one checks |w − 1/2| = 1/2.']] },
    { name: 'a line through the pole', setup: { view: 1, custom: [ONE, ONE, ONE, [-2, 0]], customLab: '(z + 1)/(z − 2)', u: 0, hl: 'x2', marks: [] }, after: { u: 1 }, ans: 0,
      q: 'f(z) = (z + 1)/(z − 2). Is the image of the vertical line Re z = 2 (violet) a line or a circle?',
      ch: [['A line: Re w = 1', 'The line contains the pole z = 2, so its image passes through ∞ and is a line. It also passes through f(∞) = a/c = 1. On z = 2 + iy, f = (3 + iy)/(iy) = 1 − 3i/y, whose real part is 1.'],
           ['A circle through 1', 'It does pass through f(∞) = 1, but it also passes through f(2) = ∞, because 2 is on the line. A generalized circle through ∞ is a line.'],
           ['A circle centered at 2', '2 is the pole, which goes to ∞; nothing is centered there. The line contains the pole, so its image is a line.'],
           ['A line: Re w = 2', 'It is a line, but f moves it: f(2 + iy) = 1 − 3i/y has real part 1, which matches f(∞) = a/c = 1.']] },
    { name: 'three points', setup: { view: 2, z1x: 0, z1y: 0, z2x: 1, z2y: 0, z3x: -1, z3y: 0, z4x: 0, z4y: 1, t: 0 }, after: { t: 1 }, ans: 2,
      q: 'Which Möbius map sends z₁ = 0, z₂ = 1, z₃ = −1 to 0, 1, ∞?',
      ch: [['T(z) = z/(z + 1)', 'It sends 0 to 0 and −1 to ∞, but T(1) = 1/2, not 1. The factor (z₂ − z₃)/(z₂ − z₁) = 2 fixes that.'],
           ['T(z) = (z + 1)/(2z)', 'This is 1/T: it sends 0 to ∞ and −1 to 0, the reverse of what is asked.'],
           ['T(z) = 2z/(z + 1)', 'T(z) = (z − z₁)(z₂ − z₃)/((z − z₃)(z₂ − z₁)) = z·2/((z + 1)·1). Check: T(0) = 0, T(1) = 2/2 = 1, T(−1) = ∞. Three points fix the map, so it is the only one.'],
           ['T(z) = 2z/(z − 1)', 'The pole must be at z₃ = −1, so the denominator is z + 1. This map sends 1 to ∞ instead.']] },
    { name: 'a distance', setup: { view: 4, ax: 0, ay: 0, th: 0, s: 1, tri: false, seg: [[0, 0], [0.5, 0]], segLab: false, steps: false }, after: { segLab: true, steps: true }, ans: 0,
      q: 'In the Poincaré disk, what is the hyperbolic distance from 0 to 1/2 (the yellow segment)?',
      ch: [['ln 3 ≈ 1.10', 'd(0, r) = 2 artanh r = ln((1 + r)/(1 − r)) = ln(1.5/0.5) = ln 3 ≈ 1.10.'],
           ['1/2', 'That is the Euclidean length. The hyperbolic length element 2|dz|/(1 − |z|²) is at least 2|dz|, so the distance is more than 1. It is ln 3 ≈ 1.10.'],
           ['artanh(1/2) ≈ 0.55', 'This forgets the factor 2 in d(0, r) = 2 artanh r, which comes from ds = 2|dz|/(1 − |z|²). The distance is ln 3 ≈ 1.10.'],
           ['∞', 'Only the boundary circle is infinitely far away. The point 1/2 is inside, at distance ln 3 ≈ 1.10.']] },
    { name: 'an automorphism', setup: { view: 3, ax: 0.5, ay: 0, th: 0, s: 0 }, after: { s: 1 }, ans: 3,
      q: 'Which map is an automorphism of the unit disk that sends 1/2 to 0?',
      ch: [['z − 1/2', 'It sends 1/2 to 0, but it moves the disk off itself: −1 goes to −3/2, outside.'],
           ['(z + 1/2)/(1 + z/2)', 'This is φ with a = −1/2: it sends −1/2 to 0, and 1/2 to 4/5.'],
           ['(z − 1/2)/(1 − 2z)', 'Here ad − bc = 1·1 − (−1/2)(−2) = 0, so this is not a Möbius map at all: it equals −1/2 for every z ≠ 1/2. The denominator should be 1 − āz = 1 − z/2.'],
           ['(z − 1/2)/(1 − z/2)', 'This is φ with a = 1/2 and θ = 0: φ(1/2) = 0, and for |z| = 1 we have |1 − z/2| = |z − 1/2|, so the boundary circle goes to itself.']] },
    { name: 'an angle sum', setup: { view: 4, ax: 0, ay: 0, th: 0, s: 1, tri: true, ang: false, Px: 0, Py: 0, Qx: 0.5, Qy: 0, Rx: 0, Ry: 0.5, seg: null, steps: false }, after: { ang: true }, ans: 1,
      q: 'A hyperbolic triangle has corners 0, 1/2 and i/2 in the Poincaré disk. The angle at 0 is 90°. What is its angle sum?',
      ch: [['Exactly 180°', 'That is the Euclidean rule. The third side is an arc that bows toward the center, which makes the angles at 1/2 and i/2 smaller: about 30.96° each.'],
           ['About 151.93°, less than 180°', 'The sides from 0 are diameters, so the angle at 0 is 90°. The third side bows toward 0, so the other angles are about 30.96° each. The sum is about 151.93°, and the area is π − sum ≈ 0.49.'],
           ['More than 180°', 'Angle sums above 180° belong to the sphere (positive curvature). The hyperbolic plane has curvature −1, so every triangle has angle sum below 180°.'],
           ['It depends on where the triangle sits, so it cannot be found', 'Where it sits does not matter: isometries keep angles. Its shape does, and here the sum is about 151.93°.']] },
    { name: 'disk map or not', setup: { view: 1, custom: [ONE, [-2, 0], [-2, 0], ONE], customLab: '(z − 2)/(1 − 2z)', u: 0, hl: 'unit', marks: [[0, 0]] }, after: { u: 1 }, ans: 2,
      q: 'Is f(z) = (z − 2)/(1 − 2z) an automorphism of the unit disk? (The unit circle is violet; the yellow dot is 0.)',
      ch: [['Yes: it has the form (z − a)/(1 − āz)', 'The form matches with a = 2, but disk automorphisms need |a| < 1. Here f(0) = −2 lies outside the disk.'],
           ['Yes, because ad − bc ≠ 0', 'ad − bc = 1 − 4 = −3 only makes f a Möbius map. It must also send the disk into itself, and f(0) = −2 does not.'],
           ['No: it maps the unit circle to itself but swaps inside and outside', 'For |z| = 1, 1 − 2z = z(z̄ − 2), so |1 − 2z| = |z − 2| and |f(z)| = 1: the circle goes to itself. But f(0) = −2 is outside, so the inside goes to the outside.'],
           ['No: it does not map the unit circle to itself', 'It does: |1 − 2z| = |z − 2| when |z| = 1. What fails is f(0) = −2.']] }
  ];

  register({
    id: 'mobius-maps-and-the-hyperbolic-plane', level: 'grad',
    title: 'Möbius maps and the hyperbolic plane',
    blurb: 'Build maps from shifts, turns and 1/z, pin one down by three points, then slide the Poincaré disk and measure hyperbolic triangles.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 1.08;
      const T = tiles('54', IDM, 0.985, 400), X = z => p.X(z[0]), Y = z => p.Y(z[1]);
      c.save(); c.beginPath(); c.arc(p.X(0), p.Y(0), p.scale, 0, TAU); c.clip();
      const edge = (u, w, move) => {
        const g = geo(u, w); if (move) c.moveTo(X(u), Y(u));
        if (g.line || g.r * p.scale > 2e5) { c.lineTo(X(w), Y(w)); return; }
        const cx = p.X(g.c[0]), cy = p.Y(g.c[1]), a1 = Math.atan2(Y(u) - cy, X(u) - cx), a2 = Math.atan2(Y(w) - cy, X(w) - cx);
        let d = a2 - a1; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; c.arc(cx, cy, g.r * p.scale, a1, a1 + d, d < 0);
      };
      c.beginPath(); T.forEach(t => { if (t.par) t.v.forEach((u, k) => edge(u, t.v[(k + 1) % t.v.length], k === 0)); }); c.fillStyle = alpha(pal.blue, .22); c.fill();
      c.beginPath(); T[0].v.forEach((u, k) => edge(u, T[0].v[(k + 1) % 5], k === 0)); c.fillStyle = alpha(pal.yellow, .55); c.fill();
      c.beginPath(); T.forEach(t => t.v.forEach((u, k) => edge(u, t.v[(k + 1) % t.v.length], true))); c.strokeStyle = alpha(pal.blue, .9); c.lineWidth = 1.2; c.stroke();
      c.restore();
      c.beginPath(); c.arc(p.X(0), p.Y(0), p.scale, 0, TAU); c.strokeStyle = pal.text; c.lineWidth = 2; c.stroke();
    },
    hook: String.raw`M. C. Escher's <em>Circle Limit III</em> tiles a disk with fish that shrink toward the rim, yet in the right geometry every fish is the same size. The maps that move those fish around are fractions \(\frac{az+b}{cz+d}\), the same maps that turn lines into circles. Why do such simple fractions carry a whole geometry where triangles have angle sums less than \(180^\circ\)?`,
    steps: [
      { title: 'Three moves build every Möbius map',
        text: String.raw`<p>A <b>Möbius map</b> is \(f(z)=\frac{az+b}{cz+d}\) with \(ad-bc\neq0\). Each one is a chain of shifts \(z+b\), turn-and-scale maps \(kz\) and the inversion \(1/z\). Here \(f\) is "\(z+1\), then \(1/z\)", so \(f(z)=\frac{1}{z+1}\).</p><p>Every grid line went to a circle or a line. All of them pass through \(f(\infty)=a/c=0\), and the two through the pole \(-d/c=-1\) stay lines (they land on the two axes). Add pieces with the buttons.</p>`,
        set: { view: 1, pieces: ['p1', 'inv'] } },
      { title: 'Three points pin the map',
        text: String.raw`<p>Drag \(z_1,z_2,z_3\). The map \(T(z)=\frac{(z-z_1)(z_2-z_3)}{(z-z_3)(z_2-z_1)}\) sends them to \(0,1,\infty\), and no other Möbius map does. So the violet circle through them must go to the line through \(0\) and \(1\).</p><p><b>Predict first.</b> Here \(z_1=-1\), \(z_2=i\), \(z_3=1\) and \(z_4=-i\). Where does \(T\) send \(z_4\)? Choose in the Predict box.</p>`,
        set: { view: 2, pred: 0 } },
      { title: 'Slide the disk',
        text: String.raw`<p>For \(|a|&lt;1\) the map \(\varphi_a(z)=e^{i\theta}\frac{z-a}{1-\bar a z}\) sends the unit disk onto itself. It sends \(a\) to \(0\), and if \(|z|=1\) then \(|1-\bar a z|=|z-a|\), so the boundary circle goes to itself.</p><p>Here \(a=0.5\) and \(\theta=0\): the point \(a\) has moved to the center (yellow dot, \(\varphi(a)=0\)), and the yellow tile that was centered at \(0\) is now centered at \(-0.5\). The pattern is distorted, but it still fills the disk. Drag \(a\), or press Replay the slide.</p>`,
        set: { view: 3, ax: 0.5, ay: 0, th: 0, s: 1 } },
      { title: 'The Poincaré disk',
        text: String.raw`<p>Read the disk as the <b>hyperbolic plane</b>. The distance from \(0\) is \(d(0,r)=2\,\mathrm{artanh}\,r\), so the marks 1 to 4, one unit apart, crowd toward the rim. <b>Geodesics</b> (shortest paths) are diameters and arcs that meet the rim at right angles.</p><p>The violet triangle has angle sum \(100.95^\circ\) and area \(\pi-\text{sum}=1.38\). Each \(\varphi_a\) is an isometry: slide with \(a\) and these numbers stay. Drag a corner.</p>`,
        set: { view: 4, ax: 0, ay: 0, th: 0, s: 1, Px: -0.5, Py: 0.1, Qx: 0.5, Qy: 0.1, Rx: 0, Ry: 0.75 } }
    ],
    formal: String.raw`
      <h3>Möbius maps on the Riemann sphere</h3>
      <p>A <b>Möbius map</b> is \(f(z)=\frac{az+b}{cz+d}\) with \(a,b,c,d\in\mathbb{C}\) and \(ad-bc\neq0\). It lives on the <b>Riemann sphere</b> \(\hat{\mathbb{C}}=\mathbb{C}\cup\{\infty\}\): if \(c\neq0\) set \(f(-d/c)=\infty\) and \(f(\infty)=a/c\); if \(c=0\) set \(f(\infty)=\infty\). Then \(f\) is a bijection of \(\hat{\mathbb{C}}\) with inverse \(f^{-1}(w)=\frac{dw-b}{-cw+a}\). The matrix \(\begin{pmatrix}a&b\\c&d\end{pmatrix}\) represents \(f\): composing maps multiplies matrices, and multiplying all four entries by \(\lambda\neq0\) gives the same map. The condition \(ad-bc\neq0\) excludes constants, since \(f'(z)=\frac{ad-bc}{(cz+d)^2}\); so \(f\) is conformal wherever it is finite.</p>
      <h3>Three building blocks</h3>
      <p>If \(c=0\), \(f(z)=\frac ad z+\frac bd\) is a turn-and-scale followed by a shift. If \(c\neq0\), divide:
      \[ f(z)=\frac ac+\frac{bc-ad}{c^2}\cdot\frac{1}{z+d/c}. \]
      So \(f=T_2\circ S\circ J\circ T_1\) with \(T_1(z)=z+\frac dc\), \(J(z)=\frac1z\), \(S(z)=\frac{bc-ad}{c^2}z\) and \(T_2(z)=z+\frac ac\). Every Möbius map is a chain of shifts, turn-and-scale maps and one inversion.</p>
      <h3>Circles and lines go to circles and lines</h3>
      <p>Call a circle or a line a <b>generalized circle</b>. Each is a set \(A|z|^2+B\bar z+\bar Bz+C=0\) with \(A,C\) real and \(|B|^2>AC\); \(A=0\) gives a line. On \(\hat{\mathbb{C}}\) a line is a circle through \(\infty\).</p>
      <p><em>Theorem.</em> A Möbius map sends generalized circles to generalized circles. <em>Proof.</em> Shifts and turn-and-scale maps are similarities, so they send circles to circles and lines to lines. For \(J\), put \(z=1/w\) and multiply by \(|w|^2\):
      \[ A+Bw+\bar B\bar w+C|w|^2=0, \]
      the same kind of equation with \(A\) and \(C\) swapped and \(B\) replaced by \(\bar B\); the condition \(|B|^2>AC\) is unchanged. By the decomposition, every Möbius map does the same. \(\square\) The image is a line exactly when \(C=0\) before inverting, that is, when the original passes through \(0\), the pole of \(J\). In general: the image of a generalized circle \(\Gamma\) under \(f\) is a line exactly when \(\Gamma\) passes through the pole \(-d/c\), and the image of a line always passes through \(f(\infty)=a/c\).</p>
      <h3>Three points determine the map</h3>
      <p>For distinct \(z_1,z_2,z_3\) let
      \[ T(z)=\frac{(z-z_1)(z_2-z_3)}{(z-z_3)(z_2-z_1)}, \]
      the <b>cross-ratio</b> of \(z\) with \(z_1,z_2,z_3\). It is Möbius (its \(ad-bc\) is \((z_2-z_3)(z_2-z_1)(z_1-z_3)\neq0\)) and sends \(z_1,z_2,z_3\) to \(0,1,\infty\). <em>Uniqueness.</em> If \(S\) does the same, then \(g=S\circ T^{-1}\) fixes \(0,1,\infty\). Fixing \(\infty\) forces \(c=0\), so \(g(z)=\alpha z+\beta\); then \(g(0)=0\) gives \(\beta=0\) and \(g(1)=1\) gives \(\alpha=1\). So \(S=T\). Consequences: any three distinct points can be sent to any other three (compose two such maps), and \(z_4\) lies on the generalized circle through \(z_1,z_2,z_3\) exactly when \(T(z_4)\) is real, since that circle goes to \(\mathbb{R}\cup\{\infty\}\).</p>
      <p><em>Worked example.</em> For \(z_1=-1,z_2=i,z_3=1\): \(T(z)=\frac{(z+1)(i-1)}{(z-1)(i+1)}=\frac{(z+1)\,i}{z-1}\), since \(\frac{i-1}{i+1}=i\). Then \(T(-i)=\frac{(1-i)\,i}{-i-1}=\frac{1+i}{-(1+i)}=-1\), real, as it must be: \(-i\) is on the unit circle through the three points.</p>
      <h3>Automorphisms of the disk</h3>
      <p>Let \(\mathbb{D}=\{|z|&lt;1\}\). For \(|a|&lt;1\) and real \(\theta\) put \(\varphi(z)=e^{i\theta}\frac{z-a}{1-\bar az}\). <em>Claim.</em> \(\varphi\) maps \(\mathbb{D}\) onto itself. <em>Proof.</em> If \(|z|=1\) then \(1-\bar az=z(\bar z-\bar a)\), so \(|1-\bar az|=|z-a|\) and \(|\varphi(z)|=1\). The pole \(1/\bar a\) lies outside the closed disk, (or is \(\infty\) when \(a=0\)), so \(\varphi(\mathbb{D})\) is connected; it misses the unit circle because \(\varphi\) is injective and already sends the unit circle onto itself; and it contains \(\varphi(a)=0\); hence \(\varphi(\mathbb{D})\subseteq\mathbb{D}\). The inverse \(w\mapsto\frac{e^{-i\theta}w+a}{1+\bar a e^{-i\theta}w}\) has the same form (with \(-ae^{i\theta}\) in place of \(a\)), so it also maps \(\mathbb{D}\) into \(\mathbb{D}\), and \(\varphi\) is onto. \(\square\) The Schwarz lemma shows that these are <em>all</em> the holomorphic bijections of \(\mathbb{D}\); we use that fact without proof.</p>
      <h3>The Poincaré disk</h3>
      <p>Give \(\mathbb{D}\) the length element \(ds=\frac{2|dz|}{1-|z|^2}\): a curve \(\gamma\) has length \(\int\frac{2|\gamma'(t)|}{1-|\gamma(t)|^2}dt\), and the distance \(d(p,q)\) is the least length of a curve from \(p\) to \(q\). This is the <b>Poincaré disk</b>, a model of the hyperbolic plane (curvature \(-1\)).</p>
      <p><em>Isometries.</em> For \(\varphi\) as above, \(|\varphi'(z)|=\frac{1-|a|^2}{|1-\bar az|^2}\), and the identity \(|1-\bar az|^2-|z-a|^2=(1-|a|^2)(1-|z|^2)\) gives \(1-|\varphi(z)|^2=\frac{(1-|a|^2)(1-|z|^2)}{|1-\bar az|^2}\). Dividing, \(\frac{2|\varphi'(z)|}{1-|\varphi(z)|^2}=\frac{2}{1-|z|^2}\): \(\varphi\) preserves \(ds\), so it preserves lengths and distances.</p>
      <p><em>Distance from 0.</em> Along the radius, \(\int_0^r\frac{2\,dx}{1-x^2}=\ln\frac{1+r}{1-r}=2\,\mathrm{artanh}\,r\), and no curve is shorter, since \(|\gamma'|\) is at least the radial speed. Moving \(p\) to \(0\) with \(\varphi_p\) gives
      \[ d(p,q)=2\,\mathrm{artanh}\left|\frac{q-p}{1-\bar pq}\right|. \]
      <em>Worked example.</em> \(d(0,\tfrac12)=\ln 3\approx1.10\), and \(d(\tfrac12,-\tfrac12)=2\,\mathrm{artanh}\frac{1}{5/4}=\ln\frac{1.8}{0.2}=\ln 9\approx2.20=2\ln3\): distances add along the diameter through \(0\).</p>
      <p><em>Geodesics</em> are the diameters and their images under the isometries: arcs of circles that meet the unit circle at right angles (Möbius maps keep angles and keep the unit circle). Such an orthogonal circle is unchanged by inversion in the unit circle, so the geodesic through \(p\) and \(q\) (not on one diameter) is the circle through \(p\), \(q\) and \(p^*=p/|p|^2\).</p>
      <h3>Triangles</h3>
      <p>A geodesic triangle with angles \(\alpha,\beta,\gamma\) has area \(\pi-(\alpha+\beta+\gamma)\) (Gauss–Bonnet for curvature \(-1\); stated here without proof). So every angle sum is below \(\pi\), small triangles have sums close to \(\pi\), and no triangle has area above \(\pi\). For the corners \(0,\tfrac12,\tfrac i2\) the angles are \(90^\circ\) and about \(30.96^\circ\) twice: sum \(151.93^\circ\), area about \(0.49\).</p>
      <h3>Caveats</h3>
      <p>The coefficients \(a,b,c,d\) are fixed only up to a common factor; normalizing \(ad-bc=1\) leaves a sign. Reflections such as \(z\mapsto\bar z\), and inversions in geodesic circles, are also isometries of the disk but reverse orientation; they are not Möbius maps (the tilings in the lesson are built from them). Some books use \(ds=\frac{|dz|}{1-|z|^2}\) (curvature \(-4\)); then \(d(0,r)=\mathrm{artanh}\,r\) and the area formula changes by a factor. The pictures are exact up to pixels, and tiles thinner than a pixel near the rim are not drawn.</p>`,
    check: [
      { q: 'Let f(z) = (az + b)/(cz + d) be a Möbius map with c ≠ 0, and let L be a straight line in the plane. Which statement about the image f(L) is always true?',
        choices: ['f(L) is a straight line, because Möbius maps send lines to lines.',
                  'f(L) is a circle or a line; it is a line exactly when L passes through −d/c, and in every case f(L) passes through a/c.',
                  'f(L) is a circle centered at a/c.',
                  'f(L) is a circle through the origin.'], answer: 1,
        why: String.raw`On the Riemann sphere a line is a circle through \(\infty\), and Möbius maps send generalized circles to generalized circles. Since \(\infty\in L\), \(f(L)\) contains \(f(\infty)=a/c\). And \(f(L)\) contains \(\infty\) (is a line) exactly when \(L\) contains the point sent to \(\infty\), the pole \(-d/c\). "Lines stay lines" holds only for \(c=0\). The point \(a/c\) lies <em>on</em> the image, not at its center. The image passes through \(0\) only when \(a/c=0\), as for \(1/z\).`,
        hint: String.raw`Treat a line as a circle through \(\infty\). Where does \(f\) send \(\infty\), and which point goes to \(\infty\)?` },
      { q: 'In the Poincaré disk the distance between p and q is d(p, q) = 2 artanh( |p − q| / |1 − p̄q| ), where p̄ is the complex conjugate of p, and 2 artanh x = ln((1 + x)/(1 − x)). Find d(1/2, −1/2).',
        choices: ['1, the Euclidean distance', '∞, because |p − q| = 1', 'ln 9 ≈ 2.20', 'ln 3 ≈ 1.10'], answer: 2,
        why: String.raw`\(|p-q|=1\) and \(1-\bar pq=1-\tfrac12\cdot(-\tfrac12)=\tfrac54\), so the ratio is \(\tfrac45\). Then \(d=\ln\frac{1+4/5}{1-4/5}=\ln 9\approx2.20\). This is twice \(d(0,\tfrac12)=\ln3\): \(0\) lies on the geodesic between them, and distances add along a geodesic. \(\ln 3\) is only half the way; \(1\) is the Euclidean length; \(\infty\) forgets the denominator \(|1-\bar pq|\).`,
        hint: String.raw`Compute \(|p-q|\) and \(|1-\bar pq|\) first, then use \(2\,\mathrm{artanh}\,x=\ln\frac{1+x}{1-x}\).` },
      { q: 'A student writes: "φ(z) = i(z − 1/3)/(1 − z/3) is an automorphism of the unit disk, so it is an isometry. Step 1: φ(0) = −i/3 and φ(−1/3) = −0.6i. Step 2: an isometry keeps distances, so |φ(0) − φ(−1/3)| must equal |0 − (−1/3)| = 1/3. Step 3: but |−i/3 + 0.6i| ≈ 0.27, so φ is not an automorphism after all." Which statement is correct?',
        choices: ['The student is right: φ is not an automorphism of the disk.',
                  'Step 1 is wrong: φ(0) = i/3.',
                  'The factor i is the error: with it, φ is no longer an automorphism.',
                  'Step 2 is wrong: φ keeps hyperbolic distance, not Euclidean distance. Both pairs are ln 2 apart in the hyperbolic metric.'], answer: 3,
        why: String.raw`Step 1 is right: \(\varphi(0)=i\cdot(-\tfrac13)=-\tfrac i3\) and \(\varphi(-\tfrac13)=i\cdot\frac{-2/3}{10/9}=-0.6i\). Disk automorphisms preserve \(ds=\frac{2|dz|}{1-|z|^2}\), not \(|dz|\). Indeed \(d(0,-\tfrac13)=2\,\mathrm{artanh}\tfrac13=\ln 2\), and for \(p=-\tfrac i3\), \(q=-0.6i\): \(|p-q|=\tfrac4{15}\), \(1-\bar pq=1-0.2=0.8\), ratio \(\tfrac13\), distance \(\ln2\) again. The rotation factor \(e^{i\theta}=i\) is allowed.`,
        hint: 'Which length element do disk automorphisms preserve: |dz| or 2|dz|/(1 − |z|²)?' }
    ],
    links: { prereq: ['conformal-maps'], related: ['complex-arithmetic-in-the-plane', 'polar-form-and-roots-of-unity', 'imaginary-numbers-and-the-complex-plane', 'linear-transformations', 'determinants-and-inverse-matrices', 'branch-cuts-and-riemann-surfaces'] },

    mount({ stage, controls: C }) {
      const panel = stage.nextElementSibling;
      const P = new Plane(stage, { span: 3.2 });
      if (P.coordEl) P.coordEl.style.display = 'none';
      P.canvas.setAttribute('aria-label', 'The complex plane or the unit disk. Step 1: images of a grid under a Möbius map. Step 2: draggable points z1 to z4 and the map sending z1, z2, z3 to 0, 1, infinity. Step 3: a disk automorphism sliding a tiling. Step 4: a hyperbolic triangle with draggable corners. Every handle also has sliders in the panel.');

      const st = {
        view: 1, pieces: ['p1', 'inv'], custom: null, customLab: '', u: 1, hl: null, marks: [],
        z1x: -1, z1y: 0, z2x: 0, z2y: 1, z3x: 1, z3y: 0, z4x: 0, z4y: -1, t: 0,
        ax: 0.5, ay: 0, th: 0, s: 1, tiling: '54', showTiles: true,
        Px: -0.5, Py: 0.1, Qx: 0.5, Qy: 0.1, Rx: 0, Ry: 0.75, tri: true, ang: true, steps: true, seg: null, segLab: false,
        practice: false
      };
      let cancel = () => {};
      const stop = () => { cancel(); cancel = () => {}; };
      const glide = (patch, ms) => { stop(); let live = true; const c = animateTo(st, patch, ms, sync, () => { live = false; }); cancel = () => { if (live) { live = false; c(); Object.assign(st, patch); } }; };

      /* ---------- the current maps ---------- */
      const zs = () => [[st.z1x, st.z1y], [st.z2x, st.z2y], [st.z3x, st.z3y], [st.z4x, st.z4y]];
      const piecesM = list => list.reduce((M, k) => mmul(PIECES[k].M, M), IDM);
      /* step 1: all pieces, the last one only u of the way along its path */
      const fullF = () => st.custom ? st.custom : piecesM(st.pieces);
      const dispF = () => {
        if (st.custom) return st.u >= 1 ? st.custom : mlerp(st.custom, st.u);
        if (!st.pieces.length || st.u >= 1) return piecesM(st.pieces);
        const last = st.pieces[st.pieces.length - 1];
        return mmul(PIECES[last].path(st.u), piecesM(st.pieces.slice(0, -1)));
      };
      const Tmap = () => { const z = zs(); return threeMap(z[0], z[1], z[2]); };
      const dispT = () => (st.t >= 1 ? Tmap() : mlerp(Tmap(), st.t));
      const aPt = () => [st.ax, st.ay];
      const thR = () => st.th * Math.PI / 180;
      const dispPhi = () => phiM(cscl(aPt(), st.s), thR() * st.s);
      const fullPhi = () => phiM(aPt(), thR());
      /* triangle: stored in "world" coordinates, shown after the slide */
      const triW = () => [[st.Px, st.Py], [st.Qx, st.Qy], [st.Rx, st.Ry]];
      const triD = () => { const M = dispPhi(); return triW().map(z => mob(M, z)); };
      const HL = { x1: hLine([1, 0], [0, 1]), x2: hLine([2, 0], [0, 1]), unit: hCirc(ZERO, 1) };

      /* ---------- drawing helpers ---------- */
      const fs = () => clamp(P.w / 34, 13, 16);
      const note = (c, p, s, color, line) => {
        const size = fs(); c.font = `600 ${size}px ${FONT}`; c.textAlign = 'left'; c.textBaseline = 'top';
        const y = 12 + line * (size + 5); c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(s, 12, y); c.fillStyle = color; c.fillText(s, 12, y);
      };
      const tag = (p, s, z, dx, dy, color) => {
        const size = fs() * 1.18, c = p.ctx; c.font = `500 ${size * .85}px ${FONT}`;
        const hw = c.measureText(s).width / 2 + 6; let px = p.X(z[0]) + dx, py = p.Y(z[1]) + dy;
        px = clamp(px, hw, p.w - hw); py = clamp(py, 12, p.h - 12);
        p.label(s, z[0], z[1], { size, italic: false, color, dx: px - p.X(z[0]), dy: py - p.Y(z[1]) });
      };
      const gcPath = (c, p, g) => {
        if (!g) return false;
        const b = p.bounds(), mid = [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2];
        if (!g.line && g.r * p.scale < 1e6) { c.moveTo(p.X(g.c[0]) + g.r * p.scale, p.Y(g.c[1])); c.arc(p.X(g.c[0]), p.Y(g.c[1]), g.r * p.scale, 0, TAU); return true; }
        let q, d;
        if (g.line) { q = g.p; d = [-g.n[1], g.n[0]]; }
        else { const v = csub(mid, g.c), L = cabs(v) || 1; q = cadd(g.c, cscl(v, g.r / L)); d = [-v[1], v[0]]; }
        const L = 50 * p.span / (cabs(d) || 1), e = cscl(d, L);
        /* move the anchor near the view so long lines stay in a sane pixel range */
        const t0 = ((mid[0] - q[0]) * d[0] + (mid[1] - q[1]) * d[1]) / cab2(d), q0 = cadd(q, cscl(d, t0));
        c.moveTo(p.X(q0[0] - e[0]), p.Y(q0[1] - e[1])); c.lineTo(p.X(q0[0] + e[0]), p.Y(q0[1] + e[1])); return true;
      };
      const strokeGC = (p, g, color, width, dash) => {
        const c = p.ctx; c.beginPath(); if (!gcPath(c, p, g)) return;
        c.strokeStyle = color; c.lineWidth = width; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]);
      };
      /* geodesic arc from u to w (both in the disk), appended to the current path */
      const arcTo = (c, p, u, w, move) => {
        const g = geo(u, w); if (move) c.moveTo(p.X(u[0]), p.Y(u[1]));
        if (g.line || g.r * p.scale > 2e5) { c.lineTo(p.X(w[0]), p.Y(w[1])); return; }
        const cx = p.X(g.c[0]), cy = p.Y(g.c[1]), a1 = Math.atan2(p.Y(u[1]) - cy, p.X(u[0]) - cx), a2 = Math.atan2(p.Y(w[1]) - cy, p.X(w[0]) - cx);
        let d = a2 - a1; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU;
        c.arc(cx, cy, g.r * p.scale, a1, a1 + d, d < 0);
      };
      /* the whole geodesic through u and w, clipped to the disk by the caller */
      const fullGeo = (c, p, u, w) => {
        const g = geo(u, w);
        if (g.line) { const d = cscl(g.d, 1 / cabs(g.d)); c.moveTo(p.X(-d[0]), p.Y(-d[1])); c.lineTo(p.X(d[0]), p.Y(d[1])); }
        else if (g.r * p.scale < 1e6) { c.moveTo(p.X(g.c[0]) + g.r * p.scale, p.Y(g.c[1])); c.arc(p.X(g.c[0]), p.Y(g.c[1]), g.r * p.scale, 0, TAU); }
        else { c.moveTo(p.X(u[0]), p.Y(u[1])); c.lineTo(p.X(w[0]), p.Y(w[1])); }
      };
      let tileCache = { key: '', T: null };
      const drawTiling = (c, p, M, faint) => {
        const pal = p.pal, rmax = 1 - clamp(1.2 / p.scale, .002, .02);
        const key = [st.tiling, ...M.flat().map(v => v.toFixed(6)), rmax.toFixed(4)].join();
        if (tileCache.key !== key) tileCache = { key, T: tiles(st.tiling, M, rmax) };
        const T = tileCache.T, q = TILINGS[st.tiling].q;
        if (q % 2 === 0) {
          c.beginPath(); T.forEach(t => { if (t.par) t.v.forEach((u, k) => arcTo(c, p, u, t.v[(k + 1) % t.v.length], k === 0)); });
          c.fillStyle = alpha(pal.blue, faint ? .07 : .16); c.fill();
        }
        c.beginPath(); T[0].v.forEach((u, k) => arcTo(c, p, u, T[0].v[(k + 1) % T[0].v.length], k === 0));
        c.fillStyle = alpha(pal.yellow, faint ? .18 : .42); c.fill();
        c.beginPath(); T.forEach(t => t.v.forEach((u, k) => arcTo(c, p, u, t.v[(k + 1) % t.v.length], true)));
        c.strokeStyle = alpha(pal.blue, faint ? .35 : .85); c.lineWidth = faint ? 1 : 1.4; c.stroke();
      };
      const handle = (p, z) => p.dot(z[0], z[1], 9, p.pal.stage, p.pal.brass, 3);

      /* ---------- view 1: a Möbius map acting on the grid ---------- */
      const drawCompose = (c, p) => {
        const pal = p.pal, M = dispF(), done = st.u >= 1, small = p.w < 520;
        p.grid(1); p.ticks(1);
        for (let k = -2; k <= 2; k++) {
          strokeGC(p, hDecode(hImage(hLine([k, 0], [0, 1]), M)), alpha(pal.blue, .9), k === 0 ? 3 : 2);
          strokeGC(p, hDecode(hImage(hLine([0, k], [1, 0]), M)), alpha(pal.green, .9), k === 0 ? 3 : 2);
        }
        if (st.hl) strokeGC(p, hDecode(hImage(HL[st.hl], M)), pal.violet, 4.5);
        const inf = mob(M, INF);
        if (inf !== INF && Math.abs(inf[0]) < 50 && Math.abs(inf[1]) < 50) { p.dot(inf[0], inf[1], 7, pal.yellow, pal.text, 1.5); tag(p, 'f(∞)' + (done ? ' = ' + nfC(inf) : ''), inf, 0, -22, pal.text); }
        st.marks.forEach(m => { const w = mob(M, m); if (w === INF) return; p.dot(w[0], w[1], 7, pal.yellow, pal.text, 1.5); tag(p, done ? 'f(' + nfC(m) + ') = ' + nfC(w) : nfC(m), w, 0, 22, pal.text); });
        note(c, p, done ? 'Images of grid lines under f' : st.u <= 0 ? 'Before f: the plain grid' : 'Applying f…', pal.text, 0);
        note(c, p, small ? 'blue: Re z = k' : 'blue: images of Re z = k (k = −2 … 2)', pal.blue, 1);
        note(c, p, small ? 'green: Im z = k' : 'green: images of Im z = k', pal.green, 2);
        if (st.hl) note(c, p, st.hl === 'unit' ? 'violet: image of |z| = 1' : 'violet: image of Re z = ' + (st.hl === 'x1' ? 1 : 2), pal.violet, 3);
      };

      /* ---------- view 2: three points ---------- */
      const drawThree = (c, p) => {
        const pal = p.pal, M = dispT(), z = zs(), T = Tmap(), t = st.t, small = p.w < 520;
        p.grid(1); p.ticks(1);
        for (let k = -2; k <= 2; k++) {
          strokeGC(p, hDecode(hImage(hLine([k, 0], [0, 1]), M)), alpha(pal.blue, .45), 1.6);
          strokeGC(p, hDecode(hImage(hLine([0, k], [1, 0]), M)), alpha(pal.green, .45), 1.6);
        }
        const circ = hPull(REAL_AXIS, T);
        strokeGC(p, hDecode(hImage(circ, M)), pal.violet, 4);
        const names = ['z₁', 'z₂', 'z₃', 'z₄'], goal = ['0', '1', '∞', ''];
        const hidden = predPending();
        z.forEach((zk, i) => {
          const w = mob(M, zk); if (w === INF || Math.abs(w[0]) > 40 || Math.abs(w[1]) > 40) return;
          if (i === 3 && hidden && t > 0) return;
          if (t <= 0) { if (i === 3) p.dot(zk[0], zk[1], 6, pal.red); handle(p, zk); }
          else p.dot(w[0], w[1], 7, i === 3 ? pal.red : pal.yellow, pal.text, 1.5);
          const lab = t <= 0 ? names[i] : t >= 1 ? (i === 3 ? 'T(z₄) = ' + nfC(w) : 'T(' + names[i] + ') = ' + goal[i]) : 'T(' + names[i] + ')';
          tag(p, lab, w, 0, i === 3 ? 24 : -24, i === 3 ? pal.red : pal.text);
        });
        note(c, p, t <= 0 ? (small ? 'Before T: drag the points' : 'Before T: drag z₁, z₂, z₃ and z₄') : t >= 1 ? 'After T: z₁ → 0, z₂ → 1, z₃ → ∞' : 'Applying T…', pal.text, 0);
        note(c, p, t >= 1 ? 'violet: image of that circle' : 'violet: circle through z₁, z₂, z₃', pal.violet, 1);
      };

      /* ---------- views 3 and 4: the disk ---------- */
      const diskFrame = p => { p.cx = 0; p.cy = 0; p.span = p.w < 520 ? 1.06 : 1.1; };
      const clipDisk = (c, p) => { c.save(); c.beginPath(); c.arc(p.X(0), p.Y(0), p.scale, 0, TAU); c.clip(); };
      const rim = (c, p) => { c.beginPath(); c.arc(p.X(0), p.Y(0), p.scale, 0, TAU); c.strokeStyle = p.pal.text; c.lineWidth = 2.5; c.stroke(); };
      const drawSlide = (c, p) => {
        const pal = p.pal, M = dispPhi(), a = aPt();
        diskFrame(p);
        clipDisk(c, p); if (st.showTiles) drawTiling(c, p, M, false); c.restore();
        rim(c, p);
        /* the path of the point a while the slide runs, and 12 marks on the rim */
        const tr = []; for (let i = 0; i <= 40; i++) { const s = i / 40 * st.s, w = mob(phiM(cscl(a, s), thR() * s), a); if (w) tr.push(w); }
        if (tr.length > 1) p.path(tr, { stroke: alpha(pal.yellow, .95), width: 2, dash: [5, 5] });
        for (let k = 0; k < 12; k++) { const w = mob(M, cis(TAU * k / 12)); p.dot(w[0], w[1], k ? 4 : 6, pal.red, pal.stage, 1.5); }
        const w1 = mob(M, ONE), small = p.w < 520; tag(p, 'image of 1', cscl(w1, small ? .84 : 1.1), 0, small ? 22 : 0, pal.red);
        const wa = mob(M, a);
        if (cabs(csub(wa, a)) > .04) { p.dot(wa[0], wa[1], 8, pal.yellow, pal.text, 1.5); tag(p, st.s >= 1 ? 'φ(a) = 0' : 'φ(a)', wa, 0, 24, pal.text); }
        else p.dot(wa[0], wa[1], 6, pal.yellow);
        handle(p, a); tag(p, 'a', a, 18, -18, pal.text);
        note(c, p, small ? 'φ: a → 0' : 'φ slides the disk: a → 0', pal.text, 0);
        note(c, p, small ? 'red: rim points' : 'red: 12 rim points stay on the rim', pal.red, 1);
      };
      const drawPoincare = (c, p) => {
        const pal = p.pal, M = dispPhi(), small = p.w < 520;
        diskFrame(p);
        clipDisk(c, p);
        if (st.showTiles) drawTiling(c, p, M, true);
        let V = null;
        if (st.tri) {
          V = triD();
          c.beginPath(); for (let i = 0; i < 3; i++) fullGeo(c, p, V[i], V[(i + 1) % 3]);
          c.strokeStyle = alpha(pal.violet, .45); c.lineWidth = 1.6; c.setLineDash([6, 5]); c.stroke(); c.setLineDash([]);
          c.beginPath(); for (let i = 0; i < 3; i++) arcTo(c, p, V[i], V[(i + 1) % 3], i === 0); c.closePath();
          c.fillStyle = alpha(pal.violet, .16); c.fill(); c.strokeStyle = pal.violet; c.lineWidth = 3.2; c.stroke();
        }
        if (st.seg) {
          c.beginPath(); arcTo(c, p, st.seg[0], st.seg[1], true); c.strokeStyle = pal.yellow; c.lineWidth = 5; c.stroke();
        }
        c.restore();
        rim(c, p);
        if (st.steps) {
          for (let k = 1; k <= 4; k++) {
            const r = Math.tanh(k / 2), y = -r;
            p.path([[-.035, y], [.035, y]], { stroke: pal.text, width: 2 });
            if (k < 4 || !small) tag(p, String(k), [0, y], -16, 0, pal.text);
          }
          p.path([[0, 0], [0, -1]], { stroke: alpha(pal.text, .5), width: 1.2, dash: [3, 4] });
          p.dot(0, 0, 3.5, pal.text);
          tag(p, 'steps of length 1', [0, -Math.tanh(1.5 / 2)], small ? 58 : 76, 0, pal.muted);
        }
        if (st.seg) {
          tag(p, '0', st.seg[0], -10, 20, pal.text); tag(p, '1/2', st.seg[1], 0, 20, pal.text);
          if (st.segLab) tag(p, 'd = ln 3 ≈ ' + f2(dH(st.seg[0], st.seg[1])), [(st.seg[0][0] + st.seg[1][0]) / 2, 0], 0, -24, pal.text);
        }
        if (V) {
          const names = ['P', 'Q', 'R'];
          V.forEach((v, i) => {
            const t1 = tangent(v, V[(i + 1) % 3]), t2 = tangent(v, V[(i + 2) % 3]), bis = cadd(t1, t2), L = cabs(bis) || 1;
            const near2 = Math.min(cabs(csub(v, V[(i + 1) % 3])), cabs(csub(v, V[(i + 2) % 3]))) * p.scale, off = clamp(near2 * .4, 20, 46);
            if (st.ang) { const A = angleAt(v, V[(i + 1) % 3], V[(i + 2) % 3]); tag(p, f2(deg(A)) + '°', v, bis[0] / L * off, -bis[1] / L * off * .7, pal.violet); }
            handle(p, v); tag(p, names[i], v, -bis[0] / L * 22, bis[1] / L * 22, pal.text);
          });
          const a = aPt(); if (cabs(a) > 1e-9 || st.view === 4) { if (!V.some(v => cabs(csub(v, a)) < .08)) { handle(p, a); tag(p, 'a', a, 16, 16, pal.text); } }
        }
        note(c, p, small ? 'Poincaré disk' : 'Poincaré disk: violet = geodesics', pal.text, 0);
        if (V && st.ang) { const s = triAngles(V).reduce((x, y) => x + y, 0); note(c, p, 'angle sum ' + f2(deg(s)) + '° < 180°', pal.violet, 1); }
      };
      const triAngles = V => [0, 1, 2].map(i => angleAt(V[i], V[(i + 1) % 3], V[(i + 2) % 3]));

      P.onDraw = (c, p) => {
        if (st.view <= 2) { p.cx = 0; p.cy = 0; p.span = st.view === 1 ? 2.4 : 3.2; }
        if (st.view === 1) drawCompose(c, p);
        else if (st.view === 2) drawThree(c, p);
        else if (st.view === 3) drawSlide(c, p);
        else drawPoincare(c, p);
      };

      /* ---------- panel ---------- */
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const choiceStyle = 'justify-content:flex-start;text-align:left;border-radius:10px;padding:10px 14px;width:100%;min-height:44px;line-height:1.35;white-space:normal;';
      const group = fn => { const n0 = panel.children.length; fn(); return [...panel.children].slice(n0); };
      const show = (els, v) => els.forEach(e => { e.style.display = v ? '' : 'none'; });
      const VIEWS = [['1', '1. Build a map from pieces'], ['2', '2. Three points'], ['3', '3. Slide the disk'], ['4', '4. Poincaré disk']];
      let viewSel, uS, tS, aX, aY, thS, sS, hdSel, hX, hY, tileSel, tTiles, tSteps, applyBtn, roEl, prBox;

      const gView = group(() => {
        viewSel = C.select({ label: 'View', value: '1', options: VIEWS.map(o => ({ value: o[0], label: o[1] })), onChange: v => { stop(); abandonPred(); st.view = +v; if (st.view !== 4) { st.seg = null; } if (st.view === 1) { st.custom = null; st.hl = null; st.marks = []; } sync(); } });
      });
      const gCompose = group(() => {
        C.title('Build f from pieces');
        C.hint('Each button adds one piece after the ones already chosen.');
        C.buttons(PIECE_BTNS.map(([k, label]) => ({ label, onClick: () => addPiece(k) })));
        C.buttons([{ label: 'Undo last piece', onClick: () => { stop(); st.custom = null; st.pieces = st.pieces.slice(0, -1); st.u = 1; sync(); } },
                   { label: 'Start over (f(z) = z)', onClick: () => { stop(); st.custom = null; st.hl = null; st.marks = []; st.pieces = []; st.u = 1; sync(); } }]);
        uS = C.slider({ label: 'Progress of the last piece', min: 0, max: 1, step: .01, value: 1, format: v => Math.round(v * 100) + '%', onInput: v => { stop(); st.u = v; sync(); } });
      });
      const gThree = group(() => {
        C.title('Apply the map T');
        tS = C.slider({ label: 'Progress of T', min: 0, max: 1, step: .01, value: 0, format: v => Math.round(v * 100) + '%', onInput: v => { stop(); abandonPred(); st.t = v; sync(); } });
        [applyBtn] = C.buttons([{ label: 'Apply T', primary: true, onClick: () => { abandonPred(); glide({ t: st.t >= 1 ? 0 : 1 }, 1100); } }]);
      });
      const gPred = group(() => {
        C.title('Predict, then see');
        prBox = h('div', { style: 'display:flex;flex-direction:column;gap:8px;min-width:0' }); panel.append(prBox);
      });
      const gSlide = group(() => {
        C.title('The slide φ(z) = e^(iθ)(z − a)/(1 − āz)');
        aX = C.slider({ label: 'Re a', min: -0.9, max: 0.9, step: .05, value: st.ax, format: nf, onInput: v => setA(v, st.ay) });
        aY = C.slider({ label: 'Im a', min: -0.9, max: 0.9, step: .05, value: st.ay, format: nf, onInput: v => setA(st.ax, v) });
        thS = C.slider({ label: 'Turn θ (degrees)', min: -180, max: 180, step: 15, value: st.th, format: v => nf(v) + '°', onInput: v => { stop(); st.th = v; sync(); } });
        sS = C.slider({ label: 'Progress of the slide', min: 0, max: 1, step: .01, value: 1, format: v => Math.round(v * 100) + '%', onInput: v => { stop(); st.s = v; sync(); } });
        C.buttons([{ label: 'Replay the slide', primary: true, onClick: () => { stop(); st.s = 0; sync(); glide({ s: 1 }, 1400); } },
                   { label: 'Reset a = 0, θ = 0', onClick: () => { stop(); st.ax = 0; st.ay = 0; st.th = 0; st.s = 1; sync(); } }]);
        tileSel = C.select({ label: 'Pattern', value: st.tiling, options: Object.keys(TILINGS).map(k => ({ value: k, label: TILINGS[k].name })), onChange: v => { st.tiling = v; sync(); } });
        tTiles = C.toggle({ label: 'Show the pattern', value: true, onChange: v => { st.showTiles = v; sync(); } });
      });
      const gTri = group(() => {
        C.title('Triangle and distances');
        tSteps = C.toggle({ label: 'Show steps of hyperbolic length 1', value: true, onChange: v => { st.steps = v; sync(); } });
      });
      const gMove = group(() => {
        C.title('Move a point without dragging');
        hdSel = C.select({ label: 'Point', value: 'z1', options: [], onChange: () => sync() });
        hX = C.slider({ label: 'Real part', min: -3, max: 3, step: .25, value: 0, format: nf, onInput: v => moveSel(v, null) });
        hY = C.slider({ label: 'Imaginary part', min: -3, max: 3, step: .25, value: 0, format: nf, onInput: v => moveSel(null, v) });
      });
      const gRo = group(() => { roEl = C.readout(); C.hint('Drag the brass rings on the figure, or use the sliders and buttons: every drag has a slider.'); });

      /* the handle select changes its options with the view */
      let hdView = 0;
      const hdOptions = () => {
        if (hdView === st.view) return; hdView = st.view; hdSel.replaceChildren();
        const list = st.view === 2 ? [['z1', 'z₁'], ['z2', 'z₂'], ['z3', 'z₃'], ['z4', 'z₄']] : [['P', 'P'], ['Q', 'Q'], ['R', 'R']];
        list.forEach(([v, l]) => hdSel.append(h('option', { value: v }, l)));
        const lo = st.view === 2 ? -3 : -0.95, hi = -lo, stp = st.view === 2 ? .25 : .05;
        [hX, hY].forEach(s => { const inp = s === hX ? hXi : hYi; inp.min = lo; inp.max = hi; inp.step = stp; });
      };
      const hXi = gMove[2].querySelector('input'), hYi = gMove[3].querySelector('input');
      const selPos = () => {
        const k = hdSel.value;
        if (st.view === 2) { const i = +k.slice(1); return [st['z' + i + 'x'], st['z' + i + 'y']]; }
        const i = 'PQR'.indexOf(k); return triD()[i];
      };
      const moveSel = (x, y) => {
        stop(); const cur = selPos(), z = [x === null ? cur[0] : x, y === null ? cur[1] : y];
        if (st.view === 2) setZ(+hdSel.value.slice(1), z); else setV('PQR'.indexOf(hdSel.value), z);
        sync();
      };
      const setZ = (i, z) => {
        abandonPred();
        z = [clamp(snap(z[0], .25), -3, 3), clamp(snap(z[1], .25), -3, 3)];
        /* keep the three defining points distinct */
        const others = zs().filter((_, j) => j !== i - 1 && j < 3);
        if (i <= 3 && others.some(o => cabs(csub(o, z)) < .2)) return;
        st['z' + i + 'x'] = z[0]; st['z' + i + 'y'] = z[1]; st.t = 0;
      };
      const setV = (i, z) => {
        z = [snap(z[0], .05), snap(z[1], .05)]; const r = cabs(z); if (r > .95) z = cscl(z, .95 / r);
        const D = triD(); if (D.some((o, j) => j !== i && cabs(csub(o, z)) < .04)) return;
        const w = mob(madj(dispPhi()), z), n = 'PQR'[i];
        st[n + 'x'] = w[0]; st[n + 'y'] = w[1];
      };
      const setA = (x, y) => {
        stop(); let a = [snap(x, .05), snap(y, .05)]; const r = cabs(a); if (r > .9) a = cscl(a, .9 / r);
        st.ax = a[0]; st.ay = a[1]; st.s = 1; sync();
      };
      const addPiece = k => {
        stop(); if (st.custom) { st.custom = null; st.hl = null; st.marks = []; st.pieces = []; }
        if (st.pieces.length >= 8) { st.pieces = st.pieces.slice(1); }
        st.pieces = [...st.pieces, k]; st.u = 0; sync(); glide({ u: 1 }, reduceMotion ? 0 : 900);
      };

      /* ---------- predict, then see ---------- */
      let pi = -1, pDone = false, pPick = -1, nextPred = 0;
      const predPending = () => pi >= 0 && !pDone;
      const abandonPred = () => { if (pi >= 0 && !pDone) { pi = -1; renderPred(); } };
      const startPred = n => { stop(); pi = n; pDone = false; pPick = -1; const z = PRED[n].z; z.forEach((q, i) => { st['z' + (i + 1) + 'x'] = q[0]; st['z' + (i + 1) + 'y'] = q[1]; }); st.t = 0; nextPred = (n + 1) % PRED.length; renderPred(); sync(); };
      const answerPred = i => { if (pDone) return; pDone = true; pPick = i; renderPred(); glide({ t: 1 }, 1100); };
      const renderPred = () => {
        prBox.replaceChildren();
        if (pi < 0) {
          prBox.append(h('p', { class: 'hint' }, 'Commit to a guess before T is applied. Each prediction sets the four points for you.'), mkBtn('Try a prediction', () => startPred(nextPred), true));
          return;
        }
        const q = PRED[pi];
        prBox.append(h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' }, `Prediction ${pi + 1} of ${PRED.length}. ${q.q}`));
        q.ch.forEach((t, i) => {
          const right = pDone && i === q.ans, bad = pDone && i === pPick && i !== q.ans;
          const b = h('button', { type: 'button', class: 'btn', style: choiceStyle + (right ? 'border-color:var(--green);' : '') + (bad ? 'border-color:var(--red);' : ''), onclick: () => answerPred(i) }, (right ? '✓  ' : bad ? '✗  ' : '') + t);
          if (pDone) b.disabled = true; prBox.append(b);
        });
        if (pDone) {
          const f = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
          f.innerHTML = (pPick === q.ans ? ok('Your prediction was right. ') : no('Not quite. ') + `The answer is "${q.ch[q.ans]}". `) + q.why;
          prBox.append(f, mkBtn('Another prediction', () => startPred(nextPred), true));
        }
      };

      /* ---------- practice ---------- */
      const exploreEls = [...gView, ...gCompose, ...gThree, ...gPred, ...gSlide, ...gTri, ...gMove, ...gRo];
      const gPracHead = group(() => { C.title('Practice'); C.hint('Eight short problems. Each one sets up the figure; the figure shows the answer once you have it. Nothing is saved or scored.'); });
      const [startBtn] = C.buttons([{ label: 'Start practice', primary: true, onClick: () => togglePractice() }]);
      let pIdx = 0, pFirst = 0, pDoneN = 0, pSolved = false, pTried = false, pOver = false, pLoaded = false, curBtns = [];
      const pBox = h('div', { style: 'display:flex;flex-direction:column;gap:10px;min-width:0' });
      const pTitle = h('p', { class: 'ctl-title' }), pPrompt = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
      const pBtns = h('div', { style: 'display:flex;flex-direction:column;gap:8px' }), pFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
      const pNext = mkBtn('Next problem', () => nextProb(), true), pNextBox = h('div', { class: 'ctl buttons' }, pNext);
      pBox.append(pTitle, pPrompt, pBtns, pFb, pNextBox); panel.append(pBox);
      const tally = () => { pTitle.textContent = `Problem ${pIdx + 1} of ${PRAC.length}: ${PRAC[pIdx].name}. Right on the first try: ${pFirst} of ${pDoneN} done`; };
      const setState = patch => {
        stop(); abandonPred();
        const base = { custom: null, customLab: '', hl: null, marks: [], seg: null, segLab: false, tri: true, ang: true, steps: true, showTiles: true };
        Object.assign(st, base, patch);
        if (st.view === 1 && !patch.pieces) st.pieces = [];
      };
      const loadProb = () => {
        pSolved = false; pTried = false; pOver = false; pNext.disabled = true; pNext.textContent = pIdx === PRAC.length - 1 ? 'Finish' : 'Next problem';
        const pr = PRAC[pIdx]; pPrompt.textContent = pr.q; pFb.innerHTML = ''; pBtns.replaceChildren(); pNextBox.style.display = '';
        curBtns = pr.ch.map((o, i) => { const b = h('button', { type: 'button', class: 'btn', style: choiceStyle, onclick: () => choose(i) }, o[0]); pBtns.append(b); return b; });
        setState(pr.setup); tally();
      };
      const choose = i => {
        const pr = PRAC[pIdx]; if (pSolved || curBtns[i].disabled) return;
        if (i === pr.ans) {
          pSolved = true; curBtns.forEach(b => { b.disabled = true; }); curBtns[i].style.borderColor = 'var(--green)'; curBtns[i].textContent = '✓  ' + pr.ch[i][0];
          pFb.innerHTML = ok('Right. ') + pr.ch[i][1]; if (!pTried) pFirst++; pDoneN++; pNext.disabled = false; tally();
          const nums = {}, flags = {}; for (const k in pr.after) (ANIM.has(k) ? nums : flags)[k] = pr.after[k];
          Object.assign(st, flags); sync(); if (Object.keys(nums).length) glide(nums, 1100);
        } else {
          pTried = true; curBtns[i].disabled = true; curBtns[i].style.borderColor = 'var(--red)'; curBtns[i].textContent = '✗  ' + pr.ch[i][0];
          pFb.innerHTML = no('Not quite. ') + pr.ch[i][1] + ' Try another answer.';
        }
      };
      const nextProb = () => {
        if (pIdx < PRAC.length - 1) { pIdx++; loadProb(); sync(); return; }
        pOver = true; pBtns.replaceChildren(); pFb.innerHTML = ''; pNextBox.style.display = 'none';
        pTitle.textContent = `Right on the first try: ${pFirst} of ${PRAC.length}`;
        pPrompt.textContent = `You got ${pFirst} of ${PRAC.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        pBtns.append(mkBtn('Start over', () => { pIdx = 0; pFirst = 0; pDoneN = 0; loadProb(); sync(); }, true));
        sync();
      };
      const togglePractice = () => {
        stop();
        if (st.practice) { st.practice = false; setState({ view: st.view === 1 ? 1 : st.view }); if (st.view === 1) { st.pieces = ['p1', 'inv']; st.u = 1; } sync(); return; }
        st.practice = true;
        if (pOver || !pLoaded) { pIdx = 0; pFirst = 0; pDoneN = 0; pLoaded = true; loadProb(); } else setState(PRAC[pIdx].setup);
        sync();
      };

      /* ---------- readout ---------- */
      const gridThroughPole = pole => {
        const L = []; for (let k = -2; k <= 2; k++) { if (Math.abs(pole[0] - k) < 1e-9) L.push('Re z = ' + nf(k)); if (Math.abs(pole[1] - k) < 1e-9) L.push('Im z = ' + nf(k)); } return L;
      };
      const roCompose = () => {
        const M = fullF(), D = mdet(M);
        let s = `${kk('Map')} f(z) = ${mobText(M)}<br>`;
        s += `${kk('Pieces, in order')} ${st.custom ? st.customLab : st.pieces.length ? st.pieces.map(k => PIECES[k].lab).join(', then ') : 'none yet (f(z) = z)'}<br>`;
        s += `${kk('Coefficients')} a = ${nfC(M[0])}, b = ${nfC(M[1])}, c = ${nfC(M[2])}, d = ${nfC(M[3])}; ad − bc = ${nfC(D)}<br>`;
        if (isZ(M[2])) s += `${kk('c = 0')} f is a turn-and-scale plus a shift: f(∞) = ∞, so lines stay lines and circles stay circles.`;
        else {
          const inf = cdiv(M[0], M[2]), pole = cscl(cdiv(M[3], M[2]), -1), L = gridThroughPole(pole);
          s += `${kk('Where ∞ goes')} f(∞) = a/c = ${nfC(inf)}; ${kk('pole')} f(−d/c) = f(${nfC(pole)}) = ∞<br>`;
          s += `${kk('Grid')} ${L.length === 1 ? `1 of the 10 grid lines passes through the pole (${L[0]}), so it stays a line` : L.length ? `${L.length} of the 10 grid lines pass through the pole (${L.join(' and ')}), so they stay lines` : 'no grid line passes through the pole, so none stays a line'}; the other ${10 - L.length} become circles through f(∞) = ${nfC(inf)}.`;
        }
        return s;
      };
      const roThree = () => {
        const z = zs(), T = Tmap(), w4 = mob(T, z[3]);
        let s = `${kk('Points')} z₁ = ${nfC(z[0])}, z₂ = ${nfC(z[1])}, z₃ = ${nfC(z[2])}, z₄ = ${nfC(z[3])}<br>`;
        s += `${kk('T(z)')} = ${mobText(T)}, the cross-ratio (z − z₁)(z₂ − z₃)/((z − z₃)(z₂ − z₁))<br>`;
        s += `${kk('Check')} T(z₁) = ${nfC(mob(T, z[0]))}, T(z₂) = ${nfC(mob(T, z[1]))}, T(z₃) = ∞<br>`;
        const circ = hDecode(hPull(REAL_AXIS, T));
        s += `${kk('Through z₁, z₂, z₃')} ${circ && circ.line ? 'a line (it already contains ∞)' : circ ? `the circle with center ${nfC(circ.c)} and radius ${nf(circ.r)}` : ''}<br>`;
        if (predPending()) s += `${kk('T(z₄)')} hidden until you predict`;
        else if (w4 === INF) s += `${kk('T(z₄)')} = ∞ (z₄ = z₃)`;
        else { const real = Math.abs(w4[1]) < 1e-9; s += `${kk('T(z₄)')} = ${nfC(w4)}: ${real ? 'real, so z₄ is on the violet circle' : 'not real, so z₄ is off the violet circle'}`; }
        return s;
      };
      const roSlide = () => {
        const M = fullPhi(), a = aPt(); let dev = 0;
        for (let k = 0; k < 360; k++) dev = Math.max(dev, Math.abs(cabs(mob(M, cis(TAU * k / 360))) - 1));
        let s = `${kk('φ(z)')} = ${mobText(M)}<br>${kk('a')} = ${nfC(a)}, |a| = ${nf(cabs(a))} &lt; 1, θ = ${nf(st.th)}°<br>`;
        s += `${kk('φ(a)')} = ${nfC(mob(M, a))}, ${kk('φ(0)')} = −a·e^(iθ) = ${nfC(mob(M, ZERO))}<br>`;
        s += `${kk('Rim')} |φ(z)| − 1 over 360 points of |z| = 1: largest size ${f2(dev)}<br>`;
        s += `${kk('Hyperbolic distance moved')} d(0, a) = 2 artanh |a| = ${f2(dH(ZERO, a))}`;
        return s;
      };
      const roDisk = () => {
        const M = fullPhi(); let s = `${kk('Slide')} φ(z) = ${mobText(M)}<br>`;
        if (st.tri) {
          const V = triD(), A = triAngles(V), S = A.reduce((x, y) => x + y, 0);
          s += `${kk('Corners')} P = ${nfC(V[0])}, Q = ${nfC(V[1])}, R = ${nfC(V[2])}<br>`;
          s += `${kk('Sides')} PQ = ${f2(dH(V[0], V[1]))}, QR = ${f2(dH(V[1], V[2]))}, RP = ${f2(dH(V[2], V[0]))} (hyperbolic)<br>`;
          s += `${kk('Angles')} ${A.map(x => f2(deg(x)) + '°').join(', ')}<br>${kk('Angle sum')} ${f2(deg(S))}° (below 180°)<br>${kk('Area')} π − sum = ${f2(Math.PI - S)}`;
        }
        s += `<br>${kk('Marks')} r = tanh(k/2) for k = 1, 2, 3, 4: ${[1, 2, 3, 4].map(k => f2(Math.tanh(k / 2))).join(', ')}`;
        return s;
      };

      const sync = () => {
        const v = st.view, prac = st.practice;
        viewSel.value = String(v); hdOptions();
        show(exploreEls, !prac);
        if (!prac) {
          show(gCompose, v === 1); show(gThree, v === 2); show(gPred, v === 2); show(gSlide, v >= 3); show(gTri, v === 4); show(gMove, v === 2 || v === 4);
          uS.set(st.u); tS.set(st.t); aX.set(st.ax); aY.set(st.ay); thS.set(st.th); sS.set(st.s); tileSel.value = st.tiling; tTiles.checked = st.showTiles; tSteps.checked = st.steps;
          applyBtn.textContent = st.t >= 1 ? 'Undo T' : 'Apply T';
          if (v === 2 || (v === 4 && st.tri)) { const q = selPos(); hX.set(q[0]); hY.set(q[1]); }
          roEl.innerHTML = v === 1 ? roCompose() : v === 2 ? roThree() : v === 3 ? roSlide() : roDisk();
        }
        show(gPracHead, !prac); pBox.style.display = prac ? '' : 'none';
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        P.draw();
      };

      /* ---------- dragging ---------- */
      draggable(P, {
        hit: (px, py) => {
          if (st.practice) return null;
          if (st.view === 2) { if (st.t > 0) return null; const z = zs(); for (const i of [3, 0, 1, 2]) if (near(P, z[i][0], z[i][1], px, py)) return 'z' + (i + 1); return null; }
          if (st.view === 4 && st.tri) { const V = triD(); for (let i = 0; i < 3; i++) if (near(P, V[i][0], V[i][1], px, py)) return 'v' + i; }
          if (st.view >= 3 && near(P, st.ax, st.ay, px, py)) return 'a';
          return null;
        },
        move: (hd, x, y) => {
          stop();
          if (hd[0] === 'z') { setZ(+hd[1], [x, y]); hdSel.value = hd; }
          else if (hd[0] === 'v') { setV(+hd[1], [x, y]); hdSel.value = 'PQR'[+hd[1]]; }
          else { setA(x, y); return; }
          sync();
        }
      });

      /* ---------- steps ---------- */
      const apply = (patch, immediate) => {
        stop(); st.practice = false;
        const nums = {}, flags = {};
        for (const k in patch) (ANIM.has(k) ? nums : flags)[k] = patch[k];
        const viewChange = flags.view !== undefined && flags.view !== st.view;
        Object.assign(st, { custom: null, customLab: '', hl: null, marks: [], seg: null, segLab: false, tri: true, ang: true, steps: true, showTiles: true });
        if (flags.view !== undefined) st.view = flags.view;
        if (flags.pred !== undefined) startPred(flags.pred); else abandonPred();
        if (flags.pieces) { st.pieces = flags.pieces.slice(); st.u = immediate ? 1 : 0; if (!immediate) nums.u = 1; }
        if (immediate || viewChange) { Object.assign(st, nums); if (flags.pieces && !immediate) { st.u = 0; sync(); glide({ u: 1 }, 900); return; } sync(); }
        else { sync(); glide(nums, 900); }
      };
      renderPred(); sync();
      return { destroy: () => { stop(); P.destroy(); }, apply };
    }
  });
}
