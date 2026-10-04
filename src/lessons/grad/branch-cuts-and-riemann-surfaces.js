/* =====================================================================
   GRADUATE (Complex analysis) — Branch cuts and Riemann surfaces
   ===================================================================== */
{
  const PI = Math.PI, TWO_PI = 2 * Math.PI, DEG = Math.PI / 180;
  const EPS_Z = 0.2;             /* keep-out radius around a branch point */
  const ZMAX = 2.5;              /* largest |z| */
  const FONT = '"Hanken Grotesk","Helvetica Neue",Arial,sans-serif';

  /* ---------- complex numbers as [re, im] ---------- */
  const cadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const csub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  const cabs = a => Math.hypot(a[0], a[1]);
  const carg = a => Math.atan2(a[1] === 0 ? 0 : a[1], a[0]);          /* principal Arg in (−π, π] (no −0 surprise) */
  const polar = (r, t) => [r * Math.cos(t), r * Math.sin(t)];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const wrapPi = a => { a = (a + PI) % TWO_PI; if (a < 0) a += TWO_PI; return a - PI; };
  const psqrt = z => { const r = Math.sqrt(cabs(z)), t = carg(z) / 2; return polar(r, t); };
  /* an argument in (al − 2π, al]: the branch whose cut is the ray at angle al */
  const argCut = (z, al) => { let a = carg(z); while (a > al + 1e-12) a -= TWO_PI; while (a <= al - TWO_PI + 1e-12) a += TWO_PI; return a; };

  /* ---------- numbers as text: 2 decimals, true minus, never −0.00 ---------- */
  const f2 = v => { const a = Math.abs(v), s = a < .005 ? '0.00' : a.toFixed(2); return (v < 0 && s !== '0.00' ? '−' : '') + s; };
  const cf = w => {
    const re = f2(w[0]), im = f2(Math.abs(w[1])), zr = re === '0.00', zi = im === '0.00';
    if (zi) return re;
    if (zr) return (w[1] < 0 ? '−' : '') + im + 'i';
    return re + (w[1] < 0 ? ' − ' : ' + ') + im + 'i';
  };
  const piTxt = v => {
    const k2 = v / PI * 2, m2 = Math.round(k2); if (Math.abs(k2 - m2) > .01) return null;
    if (m2 === 0) return '0';
    const s = m2 < 0 ? '−' : '', m = Math.abs(m2);
    return m % 2 ? s + (m === 1 ? '' : m) + 'π/2' : s + (m === 2 ? '' : m / 2) + 'π';
  };
  const dg = v => { const d = Math.round(v / DEG); return (d < 0 ? '−' : '') + Math.abs(d) + '°'; };
  const tn = v => { const t = v / TWO_PI, r = Math.round(t); return Math.abs(t - r) < .005 ? (r < 0 ? '−' : '') + Math.abs(r) : f2(t); };
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;

  /* ---------- the functions ---------- */
  const NAME = { sqrt: '√z', root: n => 'z^(1/' + n + ')', log: 'log z', two: '√(z² − 1)' };
  const nameOf = (fn, n) => fn === 'root' ? NAME.root(n) : NAME[fn];
  const DEF_START = { sqrt: [1, 0], root: [1, 0], log: [1, 0], two: [0, 0] };
  const BPS = fn => fn === 'two' ? [[-1, 0], [1, 0]] : [[0, 0]];
  /* the single-valued branch with its cut on the ray at angle al (for √(z² − 1): the cut [−1, 1]) */
  const branch = (fn, n, z, al) => {
    if (fn === 'two') return cmul(psqrt(csub(z, [1, 0])), psqrt(cadd(z, [1, 0])));
    const a = argCut(z, al);
    if (fn === 'log') return [Math.log(cabs(z)), a];
    return polar(Math.pow(cabs(z), 1 / n), a / n);
  };
  /* continuation: of all values of f(z), the one nearest the previous value */
  const follow = (fn, n, z, prev) => {
    if (fn === 'log') { const A = carg(z), k = Math.round((prev[1] - A) / TWO_PI); return [Math.log(cabs(z)), A + TWO_PI * k]; }
    if (fn === 'two') { const s = branch('two', 2, z, PI), m = [-s[0], -s[1]]; return dist(s, prev) <= dist(m, prev) ? s : m; }
    const m = Math.pow(cabs(z), 1 / n), A = carg(z) / n; let best = null, bd = Infinity;
    for (let k = 0; k < n; k++) { const c = polar(m, A + TWO_PI * k / n), d = dist(c, prev); if (d < bd) { bd = d; best = c; } }
    return best;
  };
  /* the "both" loop of √(z² − 1): star-shaped about 0.5i, pinched in to pass through 0 */
  const bothLoop = t => {
    const f = -PI / 2 + TWO_PI * t, d = Math.min(TWO_PI * t, TWO_PI * (1 - t));
    const R = 1.6 - 1.1 * Math.exp(-Math.pow(d / .436, 2));
    return [R * Math.cos(f), .5 + R * Math.sin(f)];
  };
  const LOOPS = {
    m1: { label: 'Loop around −1 only', z: t => cadd([-1, 0], polar(1, TWO_PI * t)) },
    p1: { label: 'Loop around +1 only', z: t => csub([1, 0], polar(1, TWO_PI * t)) },
    both: { label: 'Loop around both', z: bothLoop },
    none: { label: 'Loop around neither', z: t => csub([0, .6], cmul([0, .6], polar(1, TWO_PI * t))) }
  };

  /* ---------- the Riemann surface, drawn with Canvas 2D (oblique projection, painter's order) ---------- */
  const SHEET_COL = ['blue', 'violet', 'green', 'yellow', 'muted'];
  const VS = .9, VL = 1.15 / TWO_PI, VT = .55;
  const meshCache = new Map();
  const reTwo = z => branch('two', 2, z, PI)[0];
  const mesh = (fn, n, al, kc) => {
    const key = [fn, n, al.toFixed(4), kc].join('|');
    if (meshCache.has(key)) return meshCache.get(key);
    const quads = [], seams = [], labels = [];
    if (fn === 'two') {
      const N = 14, L = 2.5;
      for (const s of [1, -1]) {
        const P = (i, j) => { const x = -L + 2 * L * i / N, y = -L + 2 * L * j / N; return [x, y, s * reTwo([x, y]) * VT]; };
        for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) quads.push({ p: [P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)], s: s > 0 ? 0 : 1 });
        labels.push({ at: [2.3, 2, s * reTwo([2.3, 2]) * VT], t: s > 0 ? 'sheet 1' : 'sheet 2', s: s > 0 ? 0 : 1 });
      }
      const sm = []; for (let i = 0; i <= 20; i++) sm.push([-1 + i / 10, 0, 0]); seams.push(sm);
    } else {
      const sheets = fn === 'log' ? [kc - 1, kc, kc + 1] : [...Array(n).keys()];
      const R = fn === 'log' ? [.2, .7, 1.2, 1.7, 2.1, 2.5] : n > 2 ? [0, .5, 1, 1.5, 2, 2.5] : [0, .4, .8, 1.2, 1.6, 2.05, 2.5];
      const NT = n > 3 ? 14 : n > 2 || fn === 'log' ? 18 : 24, off = fn === 'log' ? kc * TWO_PI * VL : 0;
      const H = (r, t) => fn === 'log' ? t * VL - off : Math.pow(r, 1 / n) * Math.cos(t / n) * VS;
      for (const s of sheets) {
        const t0 = al - TWO_PI + TWO_PI * s, P = (i, j) => { const r = R[i], t = t0 + TWO_PI * j / NT; return [r * Math.cos(t), r * Math.sin(t), H(r, t)]; };
        for (let i = 0; i < R.length - 1; i++) for (let j = 0; j < NT; j++) quads.push({ p: [P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)], s: fn === 'log' ? ((s % 2) + 2) % 2 : s });
        const tm = t0 + PI, rl = 2.75;
        labels.push({ at: [rl * Math.cos(tm), rl * Math.sin(tm), H(rl, tm)], t: fn === 'log' ? 'k = ' + (s < 0 ? '−' : '') + Math.abs(s) : 'sheet ' + (s + 1), s: fn === 'log' ? ((s % 2) + 2) % 2 : s });
      }
      const seamKs = fn === 'log' ? [kc - 1, kc] : [...Array(n).keys()];
      for (const s of seamKs) { const t = al + TWO_PI * s, sm = []; for (let i = 0; i < R.length; i++) sm.push([R[i] * Math.cos(t), R[i] * Math.sin(t), H(R[i], t)]); seams.push(sm); }
    }
    const m = { quads, seams, labels };
    if (meshCache.size > 40) meshCache.clear();
    meshCache.set(key, m); return m;
  };
  /* o: { fn, n, al, kc, psi, pt: [x, y, h] | null, trail: [[x, y, h]], title, fs } */
  const drawSurface = (c, W, H, pal, o) => {
    const el = 32 * DEG, ce = Math.cos(el), se = Math.sin(el), cp = Math.cos(o.psi), sp = Math.sin(o.psi);
    const pj = P => { const X = P[0] * cp - P[1] * sp, d = P[0] * sp + P[1] * cp; return [X, P[2] * ce + d * se, d * ce - P[2] * se]; };
    const M = mesh(o.fn, o.n, o.al, o.kc);
    const top = o.title ? o.fs * 2.6 + 8 : 8, mg = 10;
    /* fit: the projected extent of the surface */
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const q of M.quads) for (const P of q.p) { const v = pj(P); if (v[0] < x0) x0 = v[0]; if (v[0] > x1) x1 = v[0]; if (v[1] < y0) y0 = v[1]; if (v[1] > y1) y1 = v[1]; }
    const sc = Math.min((W - 2 * mg) / (x1 - x0), (H - top - mg) / (y1 - y0)), ox = W / 2 - sc * (x0 + x1) / 2, oy = top + (H - top - mg) / 2 + sc * (y0 + y1) / 2;
    const S = P => { const v = pj(P); return [ox + sc * v[0], oy - sc * v[1], v[2]]; };
    const qs = M.quads.map(q => { const v = q.p.map(S); return { v, d: (v[0][2] + v[1][2] + v[2][2] + v[3][2]) / 4, s: q.s }; });
    qs.sort((a, b) => b.d - a.d);
    c.save(); c.beginPath(); c.rect(0, 0, W, H); c.clip();
    c.lineWidth = 1; c.lineJoin = 'round';
    const sty = SHEET_COL.map(k => { const col = pal[k] || pal.blue; return [alpha(col, .26), alpha(col, .62)]; });
    /* runs of consecutive quads on the same sheet share one path (far to near order is kept between runs) */
    for (let i = 0; i < qs.length;) {
      const sh = qs[i].s, y = sty[sh]; c.beginPath();
      for (; i < qs.length && qs[i].s === sh; i++) { const v = qs[i].v; c.moveTo(v[0][0], v[0][1]); c.lineTo(v[1][0], v[1][1]); c.lineTo(v[2][0], v[2][1]); c.lineTo(v[3][0], v[3][1]); c.closePath(); }
      c.fillStyle = y[0]; c.fill(); c.strokeStyle = y[1]; c.stroke();
    }
    /* seams (the cut) */
    for (const sm of M.seams) { c.beginPath(); sm.forEach((P, i) => { const v = S(P); i ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]); }); c.strokeStyle = pal.red; c.lineWidth = 3; c.lineCap = 'round'; c.stroke(); }
    /* branch points */
    const bdot = P => { const v = S(P); c.beginPath(); c.arc(v[0], v[1], 5, 0, TWO_PI); c.fillStyle = pal.violet; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 1.5; c.stroke(); };
    if (o.fn === 'two') { bdot([-1, 0, 0]); bdot([1, 0, 0]); }
    else if (o.fn === 'log') { const a = S([0, 0, -1.8 * TWO_PI * VL]), b = S([0, 0, 1.8 * TWO_PI * VL]); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.setLineDash([5, 5]); c.strokeStyle = pal.violet; c.lineWidth = 2; c.stroke(); c.setLineDash([]); }
    else bdot([0, 0, 0]);
    /* the path and the point */
    if (o.trail && o.trail.length > 1) {
      c.beginPath(); o.trail.forEach((P, i) => { const v = S(P); i ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]); });
      c.strokeStyle = pal.yellow; c.lineWidth = 2.6; c.lineCap = 'round'; c.stroke();
    }
    const fs = o.fs || 13;
    const txt = (t, x, y, col, al2 = 'left') => { c.font = `600 ${fs}px ${FONT}`; c.textAlign = al2; c.textBaseline = 'middle'; c.lineWidth = 4; c.strokeStyle = pal.stage; c.lineJoin = 'round'; c.strokeText(t, x, y); c.fillStyle = col; c.fillText(t, x, y); };
    for (const lb of M.labels) { const v = S(lb.at); txt(lb.t, clamp(v[0], 40, W - 40), clamp(v[1], top + 6, H - 10), pal[SHEET_COL[lb.s]] || pal.text, 'center'); }
    if (o.pt) {
      const v = S(o.pt);
      c.beginPath(); c.arc(v[0], v[1], 7.5, 0, TWO_PI); c.fillStyle = pal.yellow; c.fill(); c.strokeStyle = pal.text; c.lineWidth = 2; c.stroke();
      if (o.ptLabel) txt(o.ptLabel, v[0] + (v[0] > W * .6 ? -12 : 12), v[1] - 14, pal.text, v[0] > W * .6 ? 'right' : 'left');
    }
    c.restore();
    if (o.title) { txt(o.title, 12, 6 + fs * .7, pal.text); txt(o.sub, 12, 6 + fs * 1.95, pal.muted); }
  };

  /* ---------- predict, then see ---------- */
  const PRED = [
    { setup: { fn: 'sqrt', start: [1, 0], view: 'plane' }, act: { turns: 1 }, ans: 1, ch: ['w = 1', 'w = −1', 'w = i', 'w = −i'],
      q: 'Start at z = 1 with w = 1. z is about to go once around 0, counterclockwise, and come back to z = 1. Where will the followed w be?',
      why: 'On the circle z = e^(iθ) the followed root is w = e^(iθ/2). One turn takes θ from 0 to 2π, so θ/2 goes from 0 to π and w = e^(iπ) = −1: the same z, the other square root. Press +1 turn again and w comes back to 1.' },
    { setup: { fn: 'two', start: [0, 0], view: 'plane' }, act: { loop: 'both' }, ans: 0, ch: ['w = i (unchanged)', 'w = −i (sign flipped)', 'w = 1'],
      q: 'Now f(z) = √(z² − 1), with branch points −1 and 1. Start at z = 0 with w = i. z is about to make one loop that goes around both −1 and 1. Where will w be?',
      why: 'w = √(z − 1)·√(z + 1). Going around 1 flips the sign of the first factor and going around −1 flips the second. Two flips cancel, so w returns as i. That is why the segment [−1, 1] alone is enough as a cut.' },
    { setup: { fn: 'log', start: [1, 0], view: 'plane' }, act: { turns: -2 }, ans: 2, ch: ['w = 0', 'w = −2πi', 'w = −4πi', 'w = 4πi'],
      q: 'Now log z, starting at z = 1 with w = 0. z is about to go around 0 twice, clockwise. Where will w be?',
      why: 'e^w = z forces Re w = ln|z| = 0, and Im w follows the angle of z. Two clockwise turns take the angle from 0 to −4π, so w = −4πi ≈ −12.57i. A logarithm never comes back: each turn adds or removes 2πi.' }
  ];

  /* ---------- practice: a fixed list ---------- */
  const PROB = [
    { kind: 'choice', name: 'three turns', setup: { fn: 'sqrt', start: [2, 0], view: 'plane', cut: 180 }, show: { turns: 3 }, ans: 1,
      q: 'f(z) = √z. Start at z = 2 with w = √2 ≈ 1.41. z goes around 0 three times counterclockwise and returns to z = 2. What is the followed w?',
      ch: [['√2', 'That needs an even number of turns. Each turn adds 2π to θ, so π to θ/2, which multiplies w by e^(iπ) = −1. Three turns give (−1)³√2.'],
           ['−√2', 'Each turn multiplies w by −1, and (−1)³ = −1, so w = −√2 ≈ −1.41. The animation runs the three turns.'],
           ['i√2', 'i√2 is the value at z = −2 after half a turn. Back at z = 2 the followed w must satisfy w² = 2, so w = ±√2.'],
           ['−i√2', '(−i√2)² = −2, not 2. Back at z = 2, w² = 2 forces w = ±√2, and three sign flips give −√2.']] },
    { kind: 'set', name: 'make w = −i', setup: { fn: 'sqrt', start: [1, 0], view: 'plane', cut: 180 }, target: [0, -1],
      q: 'f(z) = √z, starting at z = 1 with w = 1. Move z (drag it, or use the θ and |z| sliders, or the turn buttons) until the followed value is w = −i. Then press Check.',
      tip: 'w = √|z|·e^(iθ/2). For w = −i you need √|z| = 1 and θ/2 = −90° (or 270°).',
      win: 'w = −i needs |z| = 1 and θ = −180° (or 540°), so z = −1. At θ = 180° the same point z = −1 gives w = +i instead: one z, two sheets.' },
    { kind: 'choice', name: 'Log(−1)', setup: { fn: 'log', start: [-1, 0], view: 'plane', cut: 180 }, ans: 2,
      q: 'What is the principal value Log(−1), with Log z = ln|z| + i Arg z and Arg z in (−π, π]?',
      ch: [['π', 'ln|−1| = ln 1 = 0, and Arg(−1) = π goes in the imaginary part. Log(−1) = iπ, not the real number π.'],
           ['−iπ', 'The interval (−π, π] includes π and excludes −π, so Arg(−1) = π. −iπ is a logarithm of −1 too (e^(−iπ) = −1), just not the principal one.'],
           ['iπ', 'ln|−1| = 0 and Arg(−1) = π, so Log(−1) = iπ. Check: e^(iπ) = −1. The readout shows 3.14i.'],
           ['0', '0 is only the real part, ln|−1| = 0. And e^0 = 1, not −1.']] },
    { kind: 'choice', name: 'Log(i)', setup: { fn: 'log', start: [0, 1], view: 'plane', cut: 180 }, ans: 3,
      q: 'What is the principal value Log(i)?',
      ch: [['1 + iπ/2', '|i| = 1, and ln 1 = 0, so the real part is 0, not 1.'],
           ['π/2', 'π/2 is Arg i, the imaginary part. The value is 0 + i·π/2.'],
           ['90i', 'Angles in Log are in radians: 90° is π/2.'],
           ['iπ/2', 'ln|i| = ln 1 = 0 and Arg i = π/2, so Log i = iπ/2 ≈ 1.57i. Check: e^(iπ/2) = i.']] },
    { kind: 'choice', name: 'two turns back', setup: { fn: 'log', start: [-1, 0], view: 'plane', cut: 180 }, show: { turns: -2 }, ans: 0,
      q: 'f(z) = log z, starting at z = −1 with w = Log(−1) = iπ. z goes around 0 twice clockwise and returns to z = −1. What is the followed w?',
      ch: [['−3πi', 'Each clockwise turn subtracts 2πi: iπ − 4πi = −3πi ≈ −9.42i. The real part stays ln 1 = 0, and e^(−3πi) = −1 as it must.'],
           ['iπ', 'That is the principal value Log(−1). The followed value does not reset: it carries the −4πi from the two turns.'],
           ['5πi', 'Clockwise turns subtract 2πi. 5πi = iπ + 4πi would be two counterclockwise turns.'],
           ['−4πi', '−4πi is the change. Add it to the starting value iπ to get −3πi.']] },
    { kind: 'choice', name: 'two branch points', setup: { fn: 'two', start: [0, 0], view: 'plane' }, show: { loop: 'm1' }, ans: 2,
      q: 'f(z) = √(z² − 1), starting at z = 0 with w = i. Which closed loop from z = 0 brings w back as −i?',
      ch: [['A loop around both −1 and 1', 'Going around 1 multiplies w by −1, and so does going around −1. Around both: (−1)(−1) = 1, so w returns as i.'],
           ['A loop around neither', 'With no branch point inside, the loop can shrink to a point without meeting one, so w returns unchanged.'],
           ['A loop around −1 only', 'w = √(z − 1)·√(z + 1). Going around −1 alone flips √(z + 1) and leaves √(z − 1) alone, so w becomes −i. The animation runs this loop.'],
           ['Every closed loop', 'A loop around neither branch point, or around both, returns w = i.']] },
    { kind: 'choice', name: 'where a cut can go', setup: { fn: 'sqrt', start: [1, 0], view: 'plane', cut: 180 }, show: { cut: 90 }, ans: 1,
      q: 'Which set can serve as a branch cut for √z, so that √z has a continuous branch on the rest of C∖{0}?',
      ch: [['The segment from 0 to 1', 'The circle |z| = 2 misses that segment, yet going around it still flips the sign of √z. A cut must block every loop around 0, so it has to run from 0 out to ∞.'],
           ['Any curve from 0 to ∞, for example the positive imaginary axis', 'Removing a curve from 0 to ∞ leaves a region in which no loop goes around 0, so continuation gives one continuous value. The cut slider now shows the ray at 90°.'],
           ['Only the negative real axis', 'The negative real axis gives the principal branch, a convention. Any curve from 0 to ∞ works; try the cut slider.'],
           ['A small circle around 0', 'Removing a circle leaves loops around 0 both inside it and outside it, and each flips the sign.']] },
    { kind: 'choice', name: 'sheets of z^(1/3)', setup: { fn: 'root', n: 3, start: [1, 0], view: 'plane', cut: 180 }, show: { view: 'surface' }, ans: 0,
      q: 'How many sheets does the Riemann surface of z^(1/3) have over C∖{0}?',
      ch: [['3', 'Each turn multiplies w by ω = e^(2πi/3), and ω³ = 1, so w returns after 3 turns. Three sheets, one per cube root, glued in a cycle. The surface is now shown.'],
           ['2', 'Two sheets belong to √z. For z^(1/3) one turn multiplies by e^(2πi/3), which needs 3 turns to return to 1.'],
           ['1', 'One sheet would make z^(1/3) single-valued and continuous on C∖{0}, but a turn multiplies it by e^(2πi/3) ≠ 1.'],
           ['Infinitely many', 'That is log z, where each turn adds 2πi and never returns. ω³ = 1 brings z^(1/3) back after 3 turns.']] },
    { kind: 'choice', name: 'a false identity', setup: { fn: 'log', start: [-1, 0], view: 'plane', cut: 180 }, ans: 2,
      q: 'Is Log(z₁z₂) = Log z₁ + Log z₂ when z₁ = z₂ = −1?',
      ch: [['Yes, both sides are 0', 'Log(−1) = iπ, so the right side is iπ + iπ = 2πi, not 0.'],
           ['Yes, both sides are 2πi', 'The left side is Log((−1)(−1)) = Log 1 = 0. Only the right side is 2πi.'],
           ['No: the left side is 0, the right side is 2πi', 'Log 1 = 0, while Log(−1) + Log(−1) = 2πi. Both are logarithms of 1, but 2π is outside (−π, π], so the sum is not the principal one.'],
           ['No: the left side is 2πi, the right side is 0', 'The sides are swapped: Log 1 = 0 is the left side.']] },
    { kind: 'set', name: 'make w = ln 2 + 2πi', setup: { fn: 'log', start: [1, 0], view: 'plane', cut: 180 }, target: [Math.LN2, TWO_PI],
      q: 'f(z) = log z, starting at z = 1 with w = 0. Move z until the followed value is w = ln 2 + 2πi ≈ 0.69 + 6.28i. Then press Check.',
      tip: 'Re w = ln|z| and Im w is the angle θ of z, followed continuously. You need |z| = 2 and θ = 360°.',
      win: '|z| = 2 gives Re w = ln 2 ≈ 0.69, and one counterclockwise turn gives Im w = 2π. The principal Log 2 is just ln 2: the extra 2πi says which sheet you are on.' }
  ];

  register({
    id: 'branch-cuts-and-riemann-surfaces', level: 'grad',
    title: 'Branch cuts and Riemann surfaces',
    blurb: 'Walk z around 0 and watch √z and log z refuse to come home: a branch cut makes a choice, and the Riemann surface makes the function honest.',
    thumb(c, p) {
      drawSurface(c, p.w, p.h, p.pal, { fn: 'sqrt', n: 2, al: PI, kc: 0, psi: -30 * DEG, pt: null, trail: null, fs: 11 });
    },
    hook: String.raw`Every nonzero complex number has two square roots. Can you pick one of them for every \(z\), so that your pick changes continuously as \(z\) moves? Walk \(z\) once around \(0\) and see which root you come home with.`,
    steps: [
      { title: 'Follow a root around a loop',
        text: String.raw`<p>Start at \(z=1\) with \(w=\sqrt z=1\). As \(z\) moves, let \(w\) follow by continuity: after each small step, take the square root nearest the previous \(w\). This is <em>analytic continuation along the path</em>.</p><p>Make the prediction in the panel, or press <b>+1 turn</b>: \(z\) circles \(0\) and returns to \(1\). Where is \(w\)? Then try <b>Loop that misses 0</b>.</p>`,
        set: { fn: 'sqrt', view: 'plane', reset: true, cut: 180, r: 1, th: 0 } },
      { title: 'A cut makes a choice',
        text: String.raw`<p>The red ray is a <em>branch cut</em>. Off it, the principal root \(\sqrt{|z|}\,e^{i\operatorname{Arg}z/2}\), with \(\operatorname{Arg}z\in(-\pi,\pi]\), is continuous. Here \(z\) moved to \(\theta=210^\circ\), \(z=-0.87-0.50i\), across the cut. The followed value is \(w=-0.26+0.97i\), but the branch value jumped to \(0.26-0.97i\) (red dashes). Turn the <b>cut angle</b>: the cut may be any curve from the branch point \(0\) to \(\infty\).</p>`,
        set: { fn: 'sqrt', view: 'plane', reset: true, cut: 180, r: 1, th: 210 } },
      { title: 'log z climbs forever',
        text: String.raw`<p>For \(\log z\), \(e^w=z\) fixes \(\operatorname{Re}w=\ln|z|\) and lets \(\operatorname{Im}w\) follow the angle. After two turns \(z=1\) again, but \(w=12.57i=4\pi i\). Each turn adds \(2\pi i\), and \(w\) never returns. The principal value \(\operatorname{Log}z=\ln|z|+i\operatorname{Arg}z\) is \(0\) here, so you are on sheet \(k=2\).</p><p>Now choose \(z^{1/n}\): it returns after \(n\) turns, since each turn multiplies it by the root of unity \(e^{2\pi i/n}\).</p>`,
        set: { fn: 'log', view: 'plane', reset: true, cut: 180, r: 1, th: 720 } },
      { title: 'The Riemann surface',
        text: String.raw`<p>Take one slit plane per value of the root and glue each edge of the cut to the opposite edge of the next sheet. On this surface \(w\) is one continuous function. After one turn the point has slid through the red seam onto sheet 2, where \(w=-1\) (height \(\operatorname{Re}w=-1\)). Another turn brings it back. Turn the surface, and try \(\log z\): an endless staircase.</p>`,
        set: { fn: 'sqrt', view: 'surface', reset: true, cut: 180, r: 1, th: 360 } }
    ],
    formal: String.raw`
      <p>Write \(z\neq0\) as \(z=re^{i\theta}\) with \(r=|z|\). Any such \(\theta\) is an <em>argument</em> of \(z\); two arguments differ by a multiple of \(2\pi\). The <em>principal argument</em> \(\operatorname{Arg}z\) is the one in \((-\pi,\pi]\).</p>
      <h3>Continuation along a path</h3>
      <p>Let \(\gamma:[0,1]\to\mathbb{C}\setminus\{0\}\) be continuous. A <em>continuous square root along \(\gamma\)</em> is a continuous \(w:[0,1]\to\mathbb{C}\) with \(w(t)^2=\gamma(t)\) for every \(t\); a <em>continuous logarithm along \(\gamma\)</em> satisfies \(e^{w(t)}=\gamma(t)\) instead.</p>
      <p><b>Lemma (uniqueness).</b> Two continuous square roots \(w_1,w_2\) along \(\gamma\) that agree at \(t=0\) agree for all \(t\).</p>
      <p><i>Proof.</i> Since \(w_2(t)^2=\gamma(t)\neq0\), the quotient \(q=w_1/w_2\) is continuous, and \(q(t)^2=1\), so \(q(t)\in\{1,-1\}\). A continuous map from an interval to a two-point set is constant, and \(q(0)=1\). \(\square\) For logarithms the same argument applies to \((w_1-w_2)/2\pi i\), a continuous integer-valued function.</p>
      <p>Existence: a continuous argument \(\theta(t)\) along \(\gamma\) exists (cover the path by small discs that miss \(0\) and choose \(\operatorname{Arg}\) plus a constant on each). Then \(w(t)=\sqrt{|\gamma(t)|}\,e^{i\theta(t)/2}\) and \(w(t)=\ln|\gamma(t)|+i\theta(t)\) are the continuations. The lesson computes them the way the lemma suggests: in small steps, always taking the value nearest the previous one.</p>
      <h3>No continuous square root on \(\mathbb{C}\setminus\{0\}\)</h3>
      <p><b>Proposition.</b> There is no continuous \(g:\mathbb{C}\setminus\{0\}\to\mathbb{C}\) with \(g(z)^2=z\) for all \(z\), and no continuous \(L\) with \(e^{L(z)}=z\) for all \(z\).</p>
      <p><i>Proof.</i> Suppose \(g\) exists. Replacing \(g\) by \(-g\) if needed, \(g(1)=1\). Along \(\gamma(t)=e^{2\pi it}\) both \(g(\gamma(t))\) and \(e^{\pi it}\) are continuous square roots equal to \(1\) at \(t=0\). By the lemma they agree at \(t=1\), so \(g(1)=e^{\pi i}=-1\), a contradiction. For \(L\): along the same loop \(L(\gamma(t))\) and \(L(1)+2\pi it\) are continuous logarithms that agree at \(t=0\), so \(L(1)=L(1)+2\pi i\). \(\square\)</p>
      <h3>Monodromy and the winding number</h3>
      <p>Along a closed path \(\gamma\), a continuous argument changes by \(2\pi\,n(\gamma,0)\), where \(n(\gamma,0)=\frac{1}{2\pi i}\oint_\gamma\frac{dz}{z}\) is the winding number of \(\gamma\) about \(0\). So after the loop
      \[ \sqrt z\ \text{is multiplied by}\ (-1)^{n(\gamma,0)},\qquad z^{1/n}\ \text{by}\ e^{2\pi i\,n(\gamma,0)/n},\qquad \log z\ \text{gains}\ 2\pi i\,n(\gamma,0). \]
      The factors \(e^{2\pi ik/n}\) are the \(n\)-th roots of unity: \(z^{1/n}\) returns after \(n\) turns, \(\log z\) never does. For \(f(z)=\sqrt{z^2-1}=\sqrt{z-1}\,\sqrt{z+1}\) the factor is \((-1)^{n(\gamma,1)+n(\gamma,-1)}\): a loop around one branch point flips the sign, a loop around both does not.</p>
      <h3>Branch cuts</h3>
      <p>A <em>branch</em> of \(\log\) on an open set \(U\) is a continuous \(L\) on \(U\) with \(e^{L(z)}=z\). It is automatically holomorphic, with \(L'(z)=1/z\) (differentiate the inverse of \(e^w\)). The <em>principal branch</em> is
      \[ \operatorname{Log}z=\ln|z|+i\operatorname{Arg}z,\qquad z\in\mathbb{C}\setminus(-\infty,0], \]
      and the <em>principal square root</em> is \(\sqrt z=e^{\frac12\operatorname{Log}z}=\sqrt{|z|}\,e^{i\operatorname{Arg}z/2}\). The same formulas assign values on the negative axis (where \(\operatorname{Arg}=\pi\)), but no assignment there is continuous: approaching \(-r\) from above gives \(\ln r+i\pi\), from below \(\ln r-i\pi\), a jump of \(2\pi i\); for \(\sqrt z\) the jump is from \(i\sqrt r\) to \(-i\sqrt r\).</p>
      <p>The removed set is the <em>branch cut</em>. Any curve \(C\) from \(0\) to \(\infty\) will do: \(U=\mathbb{C}\setminus C\) is simply connected, so every loop in \(U\) has winding number \(0\) about \(0\), and continuation from a base point gives the same value along every path. A bounded cut never works: a large circle around it lies in \(U\) and winds once around \(0\). This is why both \(0\) and \(\infty\) are <em>branch points</em> of \(\sqrt z\) and \(\log z\) (with \(z=1/u\), a small loop around \(u=0\) is a large loop around \(z=0\)). For \(\sqrt{z^2-1}\) a large loop goes around both \(\pm1\), so \(\infty\) is not a branch point and the bounded cut \([-1,1]\) suffices; the product of principal roots \(\sqrt{z-1}\,\sqrt{z+1}\) is exactly that branch.</p>
      <h3>The Riemann surface</h3>
      <p>Let \(S=\{(z,w)\in\mathbb{C}^2: w^2=z,\ z\neq0\}\). The projection \((z,w)\mapsto z\) is two-to-one onto \(\mathbb{C}\setminus\{0\}\), and \((z,w)\mapsto w\) is a continuous, indeed holomorphic, function on \(S\). The two-valued \(\sqrt z\) becomes an honest function, on a different domain. Over the slit plane \(S\) is two copies (sheets), and crossing the cut moves you from one sheet to the other: the crosswise gluing. Following \(\sqrt z\) along a path in the plane is the same as lifting the path to \(S\), which never jumps.</p>
      <p>The picture uses height \(\operatorname{Re}w\). The sheets seem to pass through each other along the cut only because \(S\) lives in \(\mathbb{C}^2\cong\mathbb{R}^4\); the map \(w\mapsto(w^2,w)\) shows that \(S\) is a copy of \(\mathbb{C}\setminus\{0\}\), with no crossing at all. For \(\log z\) the surface \(\{(z,w):e^w=z\}\) is a copy of the whole \(w\)-plane, drawn with height \(\operatorname{Im}w\) as an endless spiral staircase. For \(z^{1/n}\) there are \(n\) sheets, glued in a cycle.</p>
      <h3>Worked example</h3>
      <p>Follow \(\sqrt z\) along \(z(t)=4e^{it}\), \(0\le t\le3\pi\), from \(w(0)=2\). A continuous argument is \(\theta=t\), so \(w(t)=2e^{it/2}\) and \(w(3\pi)=2e^{3\pi i/2}=-2i\). The endpoint is \(z=4e^{3\pi i}=-4\), whose principal root is \(\sqrt{-4}=2e^{i\pi/2}=2i\). The path crossed the cut once, at \(t=\pi\), and from there on the followed value is the negative of the principal one: it is on the other sheet. Check: \((-2i)^2=-4\).</p>
      <h3>Caveats</h3>
      <ul>
        <li>Identities change across branches. \(\operatorname{Log}(z_1z_2)=\operatorname{Log}z_1+\operatorname{Log}z_2\) holds only up to \(2\pi ik\): for \(z_1=z_2=-1\) the left side is \(0\) and the right side \(2\pi i\). Likewise \(\sqrt{z_1}\sqrt{z_2}=\pm\sqrt{z_1z_2}\), with either sign possible.</li>
        <li>Where the cut goes is a convention. The Riemann surface does not depend on it; moving the cut only changes which part of the surface is called sheet 1.</li>
        <li>Continuation through a branch point is not defined: every root of \(0\) is \(0\), so "the nearest root" cannot tell the branches apart there. That is why the lesson keeps \(|z|\ge0.2\) (and \(|z\mp1|\ge0.2\) for \(\sqrt{z^2-1}\)).</li>
        <li>Numerically, nearest-root tracking is reliable only while each step is small compared with the distance to the branch point; the lesson subdivides every move into small steps.</li>
      </ul>`,
    check: [
      { q: String.raw`Why is there no continuous function \(g\) on \(\mathbb{C}\setminus\{0\}\) with \(g(z)^2=z\) for every \(z\)?`,
        choices: ['Because the square root of a negative real number is not real, so g cannot be defined on the negative real axis.',
                  'Because every nonzero z has two square roots, and a function may only have one value at each point.',
                  'Because 0 has only one square root, so g cannot be continuous at 0.',
                  'Because a continuous square root followed once around a circle about 0 comes back to z = 1 with the value −g(1), so g(1) would equal −g(1), which is impossible since g(1) ≠ 0.'],
        answer: 3,
        why: String.raw`Choosing one value at each point is easy; continuity is the obstruction. By the uniqueness lemma, \(g(e^{2\pi it})\) must equal \(g(1)e^{\pi it}\), which is \(-g(1)\) at \(t=1\). Negative reals do have square roots (\(\sqrt{-4}=2i\)), and \(0\) is not in the domain at all.`,
        hint: String.raw`Follow \(e^{i\theta/2}\) as \(\theta\) goes from \(0\) to \(2\pi\).` },
      { q: String.raw`Follow \(\sqrt z\) continuously along \(z(t)=9e^{it}\), \(0\le t\le5\pi\), starting from \(w(0)=3\). Find the followed value \(w(5\pi)\) and the principal value \(\sqrt{z(5\pi)}\) (with \(\operatorname{Arg}\) in \((-\pi,\pi]\)).`,
        choices: [String.raw`\(w(5\pi)=3i\) and \(\sqrt{-9}=3i\)`, String.raw`\(w(5\pi)=-3i\) and \(\sqrt{-9}=3i\)`, String.raw`\(w(5\pi)=-3\) and \(\sqrt{-9}=3i\)`, String.raw`\(w(5\pi)=3i\) and \(\sqrt{-9}=-3i\)`],
        answer: 0,
        why: String.raw`A continuous argument is \(t\), so \(w(t)=3e^{it/2}\) and \(w(5\pi)=3e^{5\pi i/2}=3e^{i\pi/2}=3i\). The endpoint is \(9e^{5\pi i}=-9\), and \(\sqrt{-9}=3e^{i\pi/2}=3i\) since \(\operatorname{Arg}(-9)=\pi\). They agree: the path crossed the cut twice (at \(t=\pi\) and \(t=3\pi\)), and two sign flips cancel. The answer \(-3\) uses \(e^{5\pi i}\) instead of \(e^{5\pi i/2}\); \(-3i\) as the principal value uses \(\operatorname{Arg}(-9)=-\pi\), which is excluded.`,
        hint: String.raw`Write \(w(t)=3e^{it/2}\) and reduce \(5\pi/2\) modulo \(2\pi\).` },
      { q: String.raw`A student claims that \(\operatorname{Log}(z_1z_2)=\operatorname{Log}z_1+\operatorname{Log}z_2\) for all nonzero \(z_1,z_2\), "because \(e^{\operatorname{Log}z_1+\operatorname{Log}z_2}=e^{\operatorname{Log}z_1}e^{\operatorname{Log}z_2}=z_1z_2\)." Here \(\operatorname{Log}z=\ln|z|+i\operatorname{Arg}z\) with \(\operatorname{Arg}z\) in \((-\pi,\pi]\). Which statement is correct?`,
        choices: ['The claim is correct: the exponential turns sums into products.',
                  String.raw`The claim is wrong: the computation only shows that \(\operatorname{Log}z_1+\operatorname{Log}z_2\) is some logarithm of \(z_1z_2\), which can differ from \(\operatorname{Log}(z_1z_2)\) by \(2\pi ik\). For \(z_1=z_2=-i\) the sum is \(-i\pi\), but \(\operatorname{Log}(-1)=i\pi\).`,
                  String.raw`The claim is wrong because \(e^{a+b}\neq e^ae^b\) for complex \(a\) and \(b\).`,
                  'The claim fails only when z₁ or z₂ is a negative real number.'],
        answer: 1,
        why: String.raw`\(e^{a+b}=e^ae^b\) does hold for complex numbers, so the student's computation is right, but it proves less than claimed: \(e^w=z_1z_2\) has infinitely many solutions \(w\), and only the one with imaginary part in \((-\pi,\pi]\) is \(\operatorname{Log}\). With \(z_1=z_2=-i\): \(\operatorname{Log}(-i)=-i\pi/2\), the sum is \(-i\pi\), while \((-i)^2=-1\) and \(\operatorname{Log}(-1)=i\pi\). Neither \(-i\) is a negative real, so the last choice is false too.`,
        hint: String.raw`Compute \(\operatorname{Log}(-i)\) and \(\operatorname{Log}((-i)(-i))\).` }
    ],
    links: { prereq: ['conformal-maps'], related: ['polar-form-and-roots-of-unity', 'complex-arithmetic-in-the-plane', 'imaginary-numbers-and-the-complex-plane', 'mobius-maps-and-the-hyperbolic-plane'] },

    mount({ stage, controls: C }) {
      stage.classList.add('split');
      const top = h('div', { class: 'pane' }), bot = h('div', { class: 'pane' });
      stage.append(top, bot);
      const P1 = new Plane(top, { span: 2.8 }), P2 = new Plane(bot, { span: 2 });
      P1.canvas.setAttribute('aria-label', 'The z-plane. A handle for z, its path, the branch point and the red branch cut. Arrow keys move z; the angle and |z| sliders in the panel do the same.');
      P2.canvas.setAttribute('aria-label', 'The w-plane or the Riemann surface: the followed value w, its path, the branch value in red, and the other values of the function.');
      /* side by side when the stage is wide, stacked when it is narrow */
      const lay = () => {
        const r = stage.getBoundingClientRect(), row = r.width > r.height * 1.1;
        stage.style.flexDirection = row ? 'row' : 'column';
        bot.style.borderTop = row ? '0' : ''; bot.style.borderLeft = row ? '1px solid var(--line)' : '';
      };
      const lro = new ResizeObserver(lay); lro.observe(stage); lay();

      const st = { fn: 'sqrt', n: 3, cut: 180, view: 'plane', psi: -35, start: [1, 0] };
      const nOf = () => st.fn === 'sqrt' ? 2 : st.n;
      const al = () => st.cut * DEG;
      const T = { z: [1, 0], w: [1, 0], wc: [1, 0], a0: 0, am: 0, ap: 0, i0: 0, im: 0, ip: 0, zs: [], ws: [], jumps: [], loops: [], away: false };

      /* ---------- tracking ---------- */
      const clampZ = z => {
        let x = z[0], y = z[1];
        for (const b of BPS(st.fn)) {
          const dx = x - b[0], dy = y - b[1], d = Math.hypot(dx, dy);
          if (d < EPS_Z) { if (d < 1e-12) { x = b[0] + EPS_Z; y = b[1]; } else { x = b[0] + dx / d * EPS_Z; y = b[1] + dy / d * EPS_Z; } }
        }
        const R = Math.hypot(x, y); if (R > ZMAX) { x *= ZMAX / R; y *= ZMAX / R; }
        if (Math.abs(x) < 1e-9) x = 0; if (Math.abs(y) < 1e-9) y = 0;
        return [x, y];
      };
      const branchNow = z => branch(st.fn, nOf(), z, al());
      const resetTrack = () => {
        const z = clampZ(st.start);
        T.z = z; T.w = branch(st.fn, nOf(), z, PI); T.wc = branchNow(z);
        T.a0 = cabs(z) > 1e-9 ? carg(z) : 0; T.am = carg(cadd(z, [1, 0])); T.ap = carg(csub(z, [1, 0]));
        T.i0 = T.a0; T.im = T.am; T.ip = T.ap;
        T.zs = [z]; T.ws = [T.w]; T.jumps = []; T.loops = []; T.away = false; T.best = null;
      };
      const addJump = (a, b, z) => { T.jumps.push({ a, b, z }); if (T.jumps.length > 4) T.jumps.shift(); };
      const stepTo = zIn => {
        const z = clampZ(zIn), z0 = T.z;
        if (cabs(z0) > 1e-9 && cabs(z) > 1e-9) T.a0 += wrapPi(carg(z) - carg(z0));
        T.am += wrapPi(carg(cadd(z, [1, 0])) - carg(cadd(z0, [1, 0])));
        T.ap += wrapPi(carg(csub(z, [1, 0])) - carg(csub(z0, [1, 0])));
        const w = follow(st.fn, nOf(), z, T.w), wc = branchNow(z);
        const dwc = dist(wc, T.wc), dw = dist(w, T.w);
        if (dwc > .35 * Math.max(cabs(w), .3) && dwc > 5 * dw + .02) addJump(T.wc, wc, z);
        T.z = z; T.w = w; T.wc = wc;
        const lz = T.zs[T.zs.length - 1];
        if (dist(lz, z) > .004 || dist(T.ws[T.ws.length - 1], w) > .004) { T.zs.push(z); T.ws.push(w); if (T.zs.length > 9000) { T.zs.splice(0, 1000); T.ws.splice(0, 1000); } }
        /* the loop tracker: each return to the start point records the winding numbers */
        const s0 = clampZ(st.start), ds = dist(z, s0);
        if (ds > .35) T.away = true;
        if (T.away && ds < .08) {
          if (!T.best || ds < T.best.ds) T.best = { ds, z, w, a0: T.a0, am: T.am, ap: T.ap };
          if (ds < 1e-6) closeLoop();
        } else if (T.best) closeLoop();
      };
      /* a pass close to the start closes a loop: hop the last tiny bit to the start point and record the winding numbers */
      const closeLoop = () => {
        const B = T.best, s0 = clampZ(st.start); T.best = null; T.away = false;
        const turnTo = (a, c) => (a + wrapPi(carg(csub(s0, c)) - carg(csub(B.z, c)))) / TWO_PI;
        T.loops.push({ n0: cabs(s0) > 1e-9 ? turnTo(B.a0, [0, 0]) - T.i0 / TWO_PI : 0, nm: turnTo(B.am, [-1, 0]) - T.im / TWO_PI, np: turnTo(B.ap, [1, 0]) - T.ip / TWO_PI, w: follow(st.fn, nOf(), s0, B.w) });
        if (T.loops.length > 3) T.loops.shift();
      };
      const arcAbout = (c, a, b) => {
        const A = csub(a, c), B = csub(b, c), ra = cabs(A), rb = cabs(B), fa = carg(A), d = wrapPi(carg(B) - fa), lr = Math.log(rb / ra);
        const N = Math.min(3000, Math.max(1, Math.ceil(Math.abs(d) / .03 + Math.abs(lr) / .03)));
        for (let i = 1; i <= N; i++) { const t = i / N; stepTo(cadd(c, polar(ra * Math.exp(lr * t), fa + d * t))); }
      };
      const segDist = (p, a, b) => {
        const ab = csub(b, a), L2 = ab[0] * ab[0] + ab[1] * ab[1]; if (L2 < 1e-18) return dist(p, a);
        const t = clamp(((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / L2, 0, 1); return dist(p, [a[0] + t * ab[0], a[1] + t * ab[1]]);
      };
      const pathTo = zt => {
        zt = clampZ(zt); const z0 = T.z;
        if (dist(zt, z0) < 1e-12) return;
        if (st.fn !== 'two') { arcAbout([0, 0], z0, zt); return; }
        for (const b of BPS('two')) if (segDist(b, z0, zt) < EPS_Z * 1.6 && dist(z0, b) > 1e-9 && dist(zt, b) > 1e-9) { arcAbout(b, z0, zt); return; }
        const N = Math.max(1, Math.ceil(dist(zt, z0) / .02));
        for (let i = 1; i <= N; i++) stepTo([z0[0] + (zt[0] - z0[0]) * i / N, z0[1] + (zt[1] - z0[1]) * i / N]);
      };
      /* along the circle about 0: from the current (|z|, θ) to (r1, th1), θ unwrapped */
      const goPolar = (r1, th1) => {
        const r0 = cabs(T.z), t0 = T.a0, N = Math.min(4000, Math.max(1, Math.ceil(Math.abs(th1 - t0) / .03 + Math.abs(Math.log(r1 / r0)) / .03)));
        for (let i = 1; i <= N; i++) { const t = i / N; stepTo(polar(r0 * Math.pow(r1 / r0, t), t0 + (th1 - t0) * t)); }
      };
      const setCut = deg => {
        st.cut = deg; const wc = branchNow(T.z);
        if (dist(wc, T.wc) > .35 * Math.max(cabs(T.w), .3)) addJump(T.wc, wc, T.z);
        T.wc = wc;
      };

      /* ---------- animations ---------- */
      let stopAnim = () => {};
      const halt = () => { stopAnim(); stopAnim = () => {}; };
      const animPath = (zf, ms, done) => {
        halt(); let last = 0;
        stopAnim = tween(ms, p => {
          const N = Math.max(1, Math.ceil((p - last) * 360));
          for (let i = 1; i <= N; i++) pathTo(zf(last + (p - last) * i / N));
          last = p; sync();
        }, () => { stopAnim = () => {}; sync(); done && done(); });
      };
      const turn = (k, done) => {
        const r = cabs(T.z), t0 = T.a0;
        animPath(t => polar(r, t0 + k * TWO_PI * t), 900 * Math.max(1, Math.abs(k)) * .8, done);
      };
      const missLoop = done => {
        const z = T.z, r = cabs(z), q = r <= 1.2 ? .45 : -.4, c = [z[0] * (1 + q), z[1] * (1 + q)], v = csub(z, c);
        animPath(t => cadd(c, cmul(v, polar(1, TWO_PI * t))), 1400, done);
      };
      const runLoop = (key, done) => {
        halt();
        if (dist(T.z, clampZ(st.start)) > 1e-6) pathTo(st.start);
        animPath(LOOPS[key].z, 1600, done);
      };
      const act = (a, done) => {
        if (a.turns) turn(a.turns, done);
        else if (a.loop) runLoop(a.loop, done);
        else if (a.cut !== undefined) { halt(); const c0 = st.cut; stopAnim = tween(800, p => { setCut(lerp(c0, a.cut, p)); sync(); }, () => { setCut(a.cut); stopAnim = () => {}; sync(); done && done(); }); }
        else if (a.view) { st.view = a.view; sync(); done && done(); }
      };

      /* ---------- drawing: the z-plane ---------- */
      const note = (c, p, s, color, line, right) => {
        const size = clamp(p.w / 34, 12.5, 15);
        c.font = `600 ${size}px ${FONT}`; c.textAlign = right ? 'right' : 'left'; c.textBaseline = 'top';
        const x = right ? p.w - 12 : 12, y = 10 + line * (size + 5);
        c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(s, x, y); c.fillStyle = color; c.fillText(s, x, y);
      };
      const tagAt = (p, s, x, y, dx, dy, color, size) => {
        const c = p.ctx; c.font = `500 ${size * .85}px ${FONT}`;
        const hw = c.measureText(s).width / 2 + 4; let px = p.X(x) + dx, py = p.Y(y) + dy;
        px = clamp(px, hw + 2, p.w - hw - 2); py = clamp(py, 12, p.h - 12);
        p.label(s, ...p.toMath(px, py), { size, italic: false, color });
      };
      P1.onDraw = (c, p) => {
        const pal = p.pal, fs = clamp(p.w / 28, 13.5, 17);
        p.span = 2.8; p.cx = 0; p.cy = 0;
        p.grid(1); p.ticks(1, { size: 14 });
        /* the cut */
        if (st.fn === 'two') p.path([[-1, 0], [1, 0]], { stroke: pal.red, width: 4 });
        else {
          const u = polar(1, al());
          p.path([[0, 0], [u[0] * 12, u[1] * 12]], { stroke: pal.red, width: 4 });
          const nx = -u[1], ny = u[0];
          tagAt(p, 'cut', u[0] * 2, u[1] * 2, -nx * 18, ny * 18, pal.red, fs);
        }
        /* the start point */
        const s0 = clampZ(st.start);
        p.dot(s0[0], s0[1], 6, null, pal.muted, 2);
        /* the path */
        if (T.zs.length > 1) p.path(T.zs, { stroke: alpha(pal.blue, .85), width: 2.6 });
        /* where the branch value jumped */
        for (const j of T.jumps) { const X = p.X(j.z[0]), Y = p.Y(j.z[1]); c.strokeStyle = pal.red; c.lineWidth = 2.5; c.beginPath(); c.moveTo(X - 6, Y - 6); c.lineTo(X + 6, Y + 6); c.moveTo(X - 6, Y + 6); c.lineTo(X + 6, Y - 6); c.stroke(); }
        /* branch points and their keep-out discs */
        for (const b of BPS(st.fn)) {
          p.path(Array.from({ length: 41 }, (_, i) => cadd(b, polar(EPS_Z, TWO_PI * i / 40))), { stroke: alpha(pal.violet, .8), width: 1.5, dash: [4, 4] });
          p.dot(b[0], b[1], 5.5, pal.violet, pal.stage, 1.5);
        }
        if (st.fn !== 'two') tagAt(p, p.h < 240 ? '0' : 'branch point 0', 0, 0, p.h < 240 ? -12 : 0, Math.sin(al()) < -.3 ? -22 : 22, pal.violet, fs * .95);
        else { tagAt(p, '−1', -1, 0, 0, -22, pal.violet, fs); tagAt(p, '+1', 1, 0, 0, -22, pal.violet, fs); }
        if (dist(T.z, s0) > .25) tagAt(p, 'start', s0[0], s0[1], 0, 20, pal.muted, fs * .9);
        /* z */
        p.dot(T.z[0], T.z[1], 8, pal.stage, pal.brass, 3);
        const zr = cabs(T.z) || 1;
        tagAt(p, 'z', T.z[0], T.z[1], (T.z[0] / zr) * 20 + (st.fn === 'two' && cabs(T.z) < .1 ? 18 : 0), -(T.z[1] / zr) * 20 - (st.fn === 'two' && cabs(T.z) < .1 ? 18 : 0), pal.text, fs * 1.15);
        note(c, p, 'z-plane', pal.muted, 0);
        if (st.fn === 'two') note(c, p, `turns around −1: ${tn(T.am - T.im)}, around +1: ${tn(T.ap - T.ip)}`, pal.text, 1);
        else note(c, p, `turns around 0: ${tn(T.a0 - T.i0)}`, pal.text, 1);
      };

      /* ---------- drawing: the w-plane ---------- */
      const drawW = (c, p) => {
        const pal = p.pal, fn = st.fn, n = nOf(), fs = clamp(p.w / 28, 13.5, 17), w = T.w, wc = T.wc;
        if (fn === 'log') { p.span = 4.4; p.cx = -.3; p.cy = w[1]; } else { p.span = fn === 'two' ? 3.1 : 2; p.cx = 0; p.cy = 0; }
        p.grid(1);
        const b = p.bounds();
        if (fn === 'log') {
          for (let k = Math.ceil(b.y0 / TWO_PI); k * TWO_PI <= b.y1; k++) {
            const y = k * TWO_PI; p.path([[b.x0, y], [b.x1, y]], { stroke: alpha(pal.violet, .7), width: 1.5, dash: [6, 5] });
            if (p.Y(y) > (p.h < 240 ? 34 : 56)) p.label('Im w = ' + piTxt(y), b.x0, y, { size: fs * .95, italic: false, color: pal.violet, align: 'left', dx: 8, dy: -11 });
          }
          if (b.y0 < 0 && b.y1 > 0) p.label('Re w', b.x1, 0, { size: fs * .9, italic: false, color: pal.muted, align: 'right', dx: -8, dy: 12 });
          /* the other values ln|z| + i(Arg z + 2πk) */
          const L = Math.log(cabs(T.z)), A = carg(T.z);
          for (let k = Math.floor((b.y0 - A) / TWO_PI); A + k * TWO_PI <= b.y1; k++) p.dot(L, A + k * TWO_PI, 4.5, null, pal.muted, 1.8);
        } else {
          p.ticks(1, { size: 14 });
          /* all values of f(z) */
          const vals = [];
          if (fn === 'two') vals.push(w, [-w[0], -w[1]]);
          else for (let k = 0; k < n; k++) vals.push(cmul(w, polar(1, TWO_PI * k / n)));
          if (n > 2 && fn !== 'two') p.path(vals, { stroke: alpha(pal.violet, .75), width: 1.5, dash: [5, 5], close: true });
          vals.forEach(v => p.dot(v[0], v[1], 4.5, null, pal.muted, 1.8));
        }
        if (T.ws.length > 1) p.path(T.ws, { stroke: alpha(pal.blue, .85), width: 2.6 });
        for (const j of T.jumps) {
          p.path([j.a, j.b], { stroke: pal.red, width: 2, dash: [6, 5] });
          const my = (j.a[1] + j.b[1]) / 2;
          const mx = (j.a[0] + j.b[0]) / 2, mr = Math.hypot(mx, my);
          if (my > b.y0 + .4 && my < b.y1 - .4) tagAt(p, 'jump', mx, my, fn === 'log' || mr < .05 ? 24 : -mx / mr * 26, fn === 'log' || mr < .05 ? 0 : my / mr * 18, pal.red, fs * .9);
        }
        const same = dist(w, wc) < 1e-6, off = wc[1] < b.y0 + .2 ? -1 : wc[1] > b.y1 - .2 ? 1 : 0;
        if (!off) p.dot(wc[0], wc[1], 10, null, pal.red, 2.6);
        else {
          const X = clamp(p.X(wc[0]), 30, p.w - 30), Y = off < 0 ? p.h - 10 : 10;
          c.fillStyle = pal.red; c.beginPath(); c.moveTo(X, Y); c.lineTo(X - 7, Y - off * -12); c.lineTo(X + 7, Y - off * -12); c.closePath(); c.fill();
          p.label('branch value ' + cf(wc) + (off < 0 ? ' is below' : ' is above'), ...p.toMath(X + 12, Y + (off < 0 ? -8 : 8)), { size: fs, italic: false, color: pal.red, align: 'left' });
        }
        p.dot(w[0], w[1], 6.5, pal.yellow, pal.text, 1.5);
        /* labels pushed away from the origin (to the right for log, where the values share a vertical line) */
        const out = v => { const r = cabs(v); return fn === 'log' || r < .05 ? [1, 0] : [v[0] / r, v[1] / r]; };
        const lab = (t, v, col, dy) => { const u = out(v); tagAt(p, t, v[0], v[1], u[0] * 58, -u[1] * 26 + dy, col, fs); };
        if (same) lab('w = branch value', w, pal.text, fn === 'log' ? -16 : 0);
        else { lab('w (followed)', w, pal.text, fn === 'log' ? -16 : 0); if (!off) lab('branch value', wc, pal.red, fn === 'log' ? 16 : 0); }
        note(c, p, 'w-plane: w = ' + nameOf(fn, n), pal.muted, 0);
        if (p.h < 240) return;
        if (fn === 'log') note(c, p, 'Im w steps by 2π per turn', pal.text, 1);
        else if (fn === 'root') note(c, p, `${n} values: w times ${n}th roots of unity`, pal.text, 1);
        else note(c, p, 'two values: w and −w', pal.text, 1);
      };
      const heightOf = (fn, w) => fn === 'log' ? w[1] * VL : fn === 'two' ? w[0] * VT : w[0] * VS;
      P2.onDraw = (c, p) => {
        if (st.view !== 'surface') { drawW(c, p); return; }
        const fn = st.fn, n = nOf(), kc = fn === 'log' ? sheetK() : 0, off = fn === 'log' ? kc * TWO_PI * VL : 0;
        const fs = clamp(p.w / 30, 12.5, 15);
        const tr = []; const step = Math.max(1, Math.floor(T.zs.length / 1500));
        for (let i = 0; i < T.zs.length; i += step) tr.push([T.zs[i][0], T.zs[i][1], heightOf(fn, T.ws[i]) - off]);
        tr.push([T.z[0], T.z[1], heightOf(fn, T.w) - off]);
        const sub = fn === 'log' ? 'height = Im w; red: seams' : 'height = Re w; red: the seams (cut)';
        drawSurface(c, p.w, p.h, p.pal, { fn, n, al: al(), kc, psi: st.psi * DEG, pt: [T.z[0], T.z[1], heightOf(fn, T.w) - off], trail: tr, fs,
          ptLabel: 'w', title: 'Riemann surface of ' + nameOf(fn, n), sub });
      };

      /* sheet of the followed value, relative to the cut branch */
      const sheetK = () => {
        const n = nOf();
        if (st.fn === 'log') return Math.round((T.w[1] - T.wc[1]) / TWO_PI);
        if (st.fn === 'two') return dist(T.w, T.wc) <= dist(T.w, [-T.wc[0], -T.wc[1]]) ? 0 : 1;
        const q = cmul(T.w, [T.wc[0], -T.wc[1]]);
        return ((Math.round(carg(q) * n / TWO_PI) % n) + n) % n;
      };

      /* ---------- the panel ---------- */
      const probe = C.readout(), host = probe.parentNode; probe.remove();
      const rowOf = () => host.lastElementChild;
      const trueOut = (s, el, text) => { const o = el.querySelector('output'); if (o) o.textContent = text; };
      C.title('Function');
      const fnSel = C.select({ label: 'Function f(z)', value: st.fn, options: [{ value: 'sqrt', label: '√z' }, { value: 'root', label: 'z^(1/n)' }, { value: 'log', label: 'log z' }, { value: 'two', label: '√(z² − 1)' }],
        onChange: v => { halt(); st.fn = v; st.start = DEF_START[v]; resetTrack(); sync(); } });
      const nS = C.slider({ label: 'n (for z^(1/n))', min: 2, max: 5, step: 1, value: st.n, format: v => String(Math.round(v)), onInput: v => { halt(); st.n = Math.round(v); resetTrack(); sync(); } });
      const nRow = rowOf();
      C.title('Move z');
      const thS = C.slider({ label: 'Angle θ of z, unwrapped (degrees)', min: -1080, max: 1080, step: 15, value: 0, format: v => dg(v * DEG), onInput: v => { halt(); goPolar(cabs(T.z), v * DEG); sync(); } });
      const thRow = rowOf();
      const rS = C.slider({ label: '|z|', min: .2, max: 2.5, step: .1, value: 1, format: v => f2(v), onInput: v => { halt(); goPolar(v, T.a0); sync(); } });
      const rRow = rowOf();
      const xS = C.slider({ label: 'Re z', min: -2.5, max: 2.5, step: .1, value: 0, format: v => f2(v), onInput: v => { halt(); pathTo([v, T.z[1]]); sync(); } });
      const xRow = rowOf();
      const yS = C.slider({ label: 'Im z', min: -2.5, max: 2.5, step: .1, value: 0, format: v => f2(v), onInput: v => { halt(); pathTo([T.z[0], v]); sync(); } });
      const yRow = rowOf();
      C.buttons([{ label: '+1 turn', primary: true, onClick: () => turn(1) }, { label: '−1 turn', onClick: () => turn(-1) }, { label: 'Loop that misses 0', onClick: () => missLoop() }]);
      const turnRow = rowOf();
      C.buttons(Object.keys(LOOPS).map(k => ({ label: LOOPS[k].label, onClick: () => runLoop(k) })));
      const loopRow = rowOf();
      C.buttons([{ label: 'Start over', onClick: () => { halt(); resetTrack(); sync(); } }]);
      C.title('Branch cut');
      const cutS = C.slider({ label: 'Cut angle α (degrees)', min: -165, max: 180, step: 15, value: st.cut, format: v => dg(v * DEG), onInput: v => { halt(); setCut(v); sync(); } });
      const cutRow = rowOf();
      C.hint('For √(z² − 1) the cut is the segment [−1, 1].');
      const cutHint = rowOf();
      C.title('Second pane');
      const viewSel = C.select({ label: 'Second pane shows', value: st.view, options: [{ value: 'plane', label: 'the w-plane' }, { value: 'surface', label: 'the Riemann surface (3D sketch)' }], onChange: v => { st.view = v; sync(); } });
      const psiS = C.slider({ label: 'Turn the surface (degrees)', min: -180, max: 180, step: 5, value: st.psi, format: v => dg(v * DEG), onInput: v => { st.psi = v; sync(); } });
      const psiRow = rowOf();
      const ro = C.readout();
      C.hint('Drag z in the z-plane, or use the sliders and buttons. z stays at least 0.2 away from each branch point: there all roots meet (every root of 0 is 0), so "the nearest root" could not tell the branches apart.');

      /* ---------- predict, then see ---------- */
      C.title('Predict, then see');
      const prd = h('div', { style: 'display:flex;flex-direction:column;gap:10px;min-width:0' }); host.append(prd);
      const pd = { i: 0, phase: 0, pick: -1, msg: '' };
      const btn = (label, fn, primary, style) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: fn, style: style || '' }, label);
      const choiceStyle = (good, bad, dim) => `justify-content:flex-start;text-align:left;border-radius:10px;padding:10px 14px;width:100%;min-height:44px;line-height:1.35;white-space:normal;${good ? 'border-color:var(--green);color:var(--text);' : ''}${bad ? 'border-color:var(--red);color:var(--muted);' : ''}${dim ? 'opacity:.55;pointer-events:none;' : ''}`;
      const box = html => { const d = h('div', { class: 'ctl readout', style: 'border-top:0;padding-top:0', 'aria-live': 'polite' }); d.innerHTML = html; return d; };
      const renderPred = () => {
        prd.innerHTML = '';
        const P = PRED[pd.i];
        if (pd.phase === 0) { prd.append(h('p', { class: 'hint' }, 'Commit to a guess, then watch the figure answer it.'), btn(`Set up prediction ${pd.i + 1} of ${PRED.length}`, () => { endPractice(); halt(); doPatch(P.setup, true); pd.phase = 1; pd.pick = -1; renderPred(); }, true)); return; }
        prd.append(box(`${kk('Prediction ' + (pd.i + 1) + ' of ' + PRED.length)}<br>${P.q}`));
        P.ch.forEach((t, i) => {
          const done = pd.phase === 2, right = i === P.ans, mine = i === pd.pick;
          const b = btn((done && right ? '✓  ' : done && mine ? '✗  ' : '') + t, () => answerPred(i), false, choiceStyle(done && right, done && mine && !right, done && !mine && !right));
          if (done) b.disabled = true; prd.append(b);
        });
        if (pd.phase === 2) prd.append(box(pd.msg), btn('Next prediction', () => { pd.i = (pd.i + 1) % PRED.length; pd.phase = 0; renderPred(); }, true));
      };
      const answerPred = i => {
        if (pd.phase !== 1) return;
        const P = PRED[pd.i]; pd.pick = i; pd.phase = 2;
        pd.msg = (i === P.ans ? ok('Right. ') : no('Not quite. ') + `You chose ${P.ch[i]}; the answer is ${P.ch[P.ans]}. `) + P.why;
        renderPred();
        act(P.act, () => { pd.msg += ` ${kk('Now')} w = ${cf(T.w)}.`; renderPred(); });
      };

      /* ---------- practice ---------- */
      C.title('Practice');
      const prBox = h('div', { style: 'display:flex;flex-direction:column;gap:10px;min-width:0' }); host.append(prBox);
      const pr = { on: false, i: 0, solved: PROB.map(() => false), first: PROB.map(() => null), wrong: PROB.map(() => []), fb: '' };
      const nP = PROB.length, solvedN = () => pr.solved.filter(Boolean).length, firstN = () => pr.first.filter(v => v === true).length;
      const endPractice = () => { if (pr.on) { pr.on = false; renderPractice(); } };
      const loadProb = i => {
        pr.on = true; pr.i = i; pr.fb = '';
        if (i < nP) { halt(); doPatch(PROB[i].setup, true); }
        pd.phase = 0; renderPred(); renderPractice();
      };
      const pick = idx => {
        const q = PROB[pr.i];
        if (pr.solved[pr.i] || pr.wrong[pr.i].includes(idx)) return;
        if (idx === q.ans) { pr.solved[pr.i] = true; if (pr.first[pr.i] === null) pr.first[pr.i] = true; pr.fb = ok('Right. ') + q.ch[idx][1]; if (q.show) act(q.show); }
        else { pr.wrong[pr.i].push(idx); pr.first[pr.i] = false; pr.fb = no('Not quite. ') + q.ch[idx][1] + ' Try another choice.'; }
        renderPractice();
      };
      const checkSet = () => {
        const q = PROB[pr.i]; if (pr.solved[pr.i]) return;
        if (dist(T.w, q.target) < .06) { pr.solved[pr.i] = true; if (pr.first[pr.i] === null) pr.first[pr.i] = true; pr.fb = ok('Yes. ') + `The followed value is w = ${cf(T.w)}. ` + q.win; }
        else { pr.first[pr.i] = false; pr.fb = no('Not yet. ') + `Now z = ${cf(T.z)}, θ = ${dg(T.a0)}, and the followed w = ${cf(T.w)}, but the target is ${cf(q.target)}. ` + q.tip; }
        renderPractice();
      };
      const renderPractice = () => {
        prBox.innerHTML = '';
        if (!pr.on) {
          const sv = solvedN();
          prBox.append(h('p', { class: 'hint' }, sv ? `Solved ${sv} of ${nP}. Nothing here is saved or scored.` : `${nP} fixed problems with feedback. Nothing here is saved or scored.`),
            btn(sv ? 'Continue practice' : 'Start practice', () => loadProb(Math.min(pr.i, nP - 1)), true));
          return;
        }
        if (pr.i >= nP) {
          prBox.append(box(`${kk('Practice done.')} Solved ${solvedN()} of ${nP}; right on the first try: ${firstN()} of ${nP}.`),
            btn('Start again', () => { pr.solved = PROB.map(() => false); pr.first = PROB.map(() => null); pr.wrong = PROB.map(() => []); loadProb(0); }, true),
            btn('Back to exploring', () => { pr.on = false; pr.i = 0; renderPractice(); }));
          return;
        }
        const q = PROB[pr.i];
        prBox.append(box(`${kk('Problem ' + (pr.i + 1) + ' of ' + nP + ': ' + q.name)} Solved ${solvedN()} of ${nP}, ${firstN()} on the first try<br>${q.q}`));
        if (q.kind === 'choice') q.ch.forEach((ch, i) => {
          const good = pr.solved[pr.i] && i === q.ans, bad = pr.wrong[pr.i].includes(i);
          prBox.append(btn((good ? '✓  ' : bad ? '✗  ' : '') + ch[0], () => pick(i), false, choiceStyle(good, bad, pr.solved[pr.i] && !good)));
        });
        else prBox.append(h('div', { class: 'ctl buttons' }, btn('Check my w', checkSet, true), btn('Start over at the start point', () => { halt(); resetTrack(); sync(); })));
        prBox.append(box(pr.fb));
        const row = h('div', { class: 'ctl buttons' });
        if (pr.i > 0) row.append(btn('Previous problem', () => loadProb(pr.i - 1)));
        row.append(btn(pr.i === nP - 1 ? 'Finish' : 'Next problem', () => loadProb(pr.i + 1), pr.solved[pr.i]));
        row.append(btn('Leave practice', () => { pr.on = false; renderPractice(); }));
        prBox.append(row);
      };

      /* ---------- readout and sync ---------- */
      const roText = () => {
        const fn = st.fn, n = nOf(), k = sheetK(), z = T.z, w = T.w, wc = T.wc;
        let s = `${kk('f(z)')} ${nameOf(fn, n)}<br>${kk('z')} = ${cf(z)}`;
        s += fn === 'two' ? '<br>' : ` (|z| = ${f2(cabs(z))}, θ = ${dg(T.a0)})<br>`;
        s += fn === 'two' ? `${kk('Turns around −1')} ${tn(T.am - T.im)}, ${kk('around +1')} ${tn(T.ap - T.ip)}<br>` : `${kk('Turns around 0')} ${tn(T.a0 - T.i0)}<br>`;
        const pw = fn === 'log' && piTxt(w[1]) && Math.abs(w[1]) > .01 ? ` (Im w = ${piTxt(w[1])})` : '';
        s += `${kk('Followed w')} = ${cf(w)}${pw}<br>`;
        if (fn === 'two') s += `${kk('Branch value')} (cut [−1, 1]) = ${cf(wc)}<br>`;
        else s += `${kk('Branch value')} (cut at α = ${dg(al())}${st.cut === 180 ? ', principal' : ''}) = ${cf(wc)}${fn === 'log' && piTxt(wc[1]) && Math.abs(wc[1]) > .01 ? ` (Im = ${piTxt(wc[1])})` : ''}<br>`;
        if (fn === 'log') s += `${kk('Sheet')} k = ${k < 0 ? '−' : ''}${Math.abs(k)} (k = 0 is the cut branch): w = branch value${k ? (k < 0 ? ' − ' : ' + ') + piTxt(Math.abs(k) * TWO_PI) + 'i' : ''}`;
        else if (fn === 'two' || n === 2) s += `${kk('Sheet')} ${k + 1} of 2: w = ${k ? '−(branch value)' : 'branch value'}`;
        else s += `${kk('Sheet')} ${k + 1} of ${n}: w = ${k ? 'ω' + ['', '', '²', '³', '⁴'][k] + ' × branch value, where ω = e^(2πi/' + n + ')' : 'branch value'}`;
        if (T.loops.length) s += '<br>' + kk('Back at the start') + ' ' + T.loops.map(L => (fn === 'two' ? `turns ${tn(L.nm * TWO_PI)} around −1 and ${tn(L.np * TWO_PI)} around +1` : `${tn(L.n0 * TWO_PI)} turn${Math.abs(Math.round(L.n0)) === 1 ? '' : 's'}`) + ` → w = ${cf(L.w)}`).join('; ');
        return s;
      };
      const show = (el, v) => { el.style.display = v ? '' : 'none'; };
      const sync = () => {
        const two = st.fn === 'two';
        fnSel.value = st.fn; viewSel.value = st.view;
        show(nRow, st.fn === 'root'); show(thRow, !two); show(rRow, !two); show(xRow, two); show(yRow, two);
        show(turnRow, !two); show(loopRow, two); show(cutRow, !two); show(cutHint, two); show(psiRow, st.view === 'surface');
        nS.set(st.n);
        thS.set(clamp(Math.round(T.a0 / DEG), -1080, 1080)); trueOut(thS, thRow, dg(T.a0));
        rS.set(cabs(T.z)); trueOut(rS, rRow, f2(cabs(T.z)));
        xS.set(T.z[0]); trueOut(xS, xRow, f2(T.z[0])); yS.set(T.z[1]); trueOut(yS, yRow, f2(T.z[1]));
        cutS.set(st.cut); trueOut(cutS, cutRow, dg(al()));
        psiS.set(st.psi);
        ro.innerHTML = roText();
        P1.draw(); P2.draw();
      };

      /* ---------- dragging ---------- */
      draggable(P1, {
        hit: (px, py) => near(P1, T.z[0], T.z[1], px, py) ? 'z' : null,
        move: (hd, x, y) => { halt(); pathTo([snap(x, .05), snap(y, .05)]); sync(); }
      });

      /* ---------- step patches ---------- */
      const doPatch = (patch, immediate) => {
        const { fn, view, n, start, reset, th, r, cut, psi } = patch;
        if (n !== undefined) st.n = n;
        if (view) st.view = view;
        if (psi !== undefined) st.psi = psi;
        let fresh = !!reset;
        if (fn && fn !== st.fn) { st.fn = fn; st.start = DEF_START[fn]; fresh = true; }
        if (start) { st.start = start; fresh = true; }
        if (cut !== undefined && (immediate || fresh)) st.cut = cut;
        if (fresh) resetTrack();
        const wantR = r !== undefined ? r : null, wantT = th !== undefined ? th * DEG : null;
        if (immediate || (wantR === null && wantT === null && (cut === undefined || cut === st.cut))) {
          if (cut !== undefined) setCut(cut);
          if (wantR !== null || wantT !== null) goPolar(wantR !== null ? wantR : cabs(T.z), wantT !== null ? wantT : T.a0);
          sync(); return;
        }
        halt();
        const r0 = cabs(T.z), t0 = T.a0, c0 = st.cut, r1 = wantR !== null ? wantR : r0, t1 = wantT !== null ? wantT : t0, c1 = cut !== undefined ? cut : c0;
        sync();
        stopAnim = tween(1200 + 400 * Math.min(3, Math.abs(t1 - t0) / TWO_PI), p => {
          const e = ease(p);
          if (c1 !== c0) setCut(lerp(c0, c1, e));
          goPolar(lerp(r0, r1, e), lerp(t0, t1, e)); sync();
        }, () => { stopAnim = () => {}; if (c1 !== c0) setCut(c1); goPolar(r1, t1); sync(); });
      };
      const apply = (patch, immediate) => {
        halt(); pr.on = false; renderPractice(); pd.phase = 0; renderPred();
        doPatch(patch, immediate);
      };
      resetTrack(); renderPred(); renderPractice(); sync();
      return { destroy: () => { halt(); lro.disconnect(); stage.style.flexDirection = ''; P1.destroy(); P2.destroy(); }, apply };
    }
  });
}
