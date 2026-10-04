/* =====================================================================
   PRACTICE (generators, part 3): Algebra 1 and Geometry. Same contract as generators.js and generators2.js.
   `distractors` lists numbers that the text shows but the model does not need (a side length the ratio ignores).
   ===================================================================== */
{
  const { make, wrongs, mc, abs, join, pieces, fracTex, NZ } = Practice.kit;
  const { R, rat, gcd, lcm, say } = Practice;
  const sgnN = n => (n < 0 ? `(${n})` : String(n));
  const coefStr = m => (m === 1 ? '' : m === -1 ? '-' : m + '*');
  const joinSigned = parts => parts.filter(x => x).map((t, i) => (i === 0 ? t : t[0] === '-' ? t : '+' + t)).join('');
  /* wrong answers for any answer type (wrongs() in generators.js is for numbers) */
  const wrongsT = (type, cands) => {
    const out = [];
    for (const c of cands) {
      if (!c || !c.wrongAnswer) continue;
      if (out.some(o => Practice.sameValue(type, o.wrongAnswer, c.wrongAnswer))) continue;
      out.push(c);
    }
    return out;
  };
  const dropSame = (type, answer, list) => list.filter(c => c && c.wrongAnswer && !Practice.sameValue(type, c.wrongAnswer, answer));
  const euclid = (r, prims, kLo, kHi) => { const [m, n] = r.pick(prims), k = r.int(kLo, kHi); return [k * (m * m - n * n), k * 2 * m * n, k * (m * m + n * n)]; };
  const PRIM = [[2, 1], [3, 2], [4, 1], [4, 3], [5, 2]];
  const polyTex = (a, b, c) => {
    let s = '';
    const add = (coef, v) => { if (!coef) return; const body = abs(coef) === 1 && v ? v : abs(coef) + v; s += s === '' ? (coef < 0 ? '-' : '') + body : (coef < 0 ? ' - ' : ' + ') + body; };
    add(a, 'x^2'); add(b, 'x'); add(c, '');
    return s || '0';
  };
  const polyPlain = (a, b, c) => {
    const parts = []; const add = (coef, v) => { if (!coef) return; parts.push((coef < 0 ? '-' : '+') + (abs(coef) === 1 && v ? '' : abs(coef) + (v ? '*' : '')) + v); };
    add(a, 'x^2'); add(b, 'x'); add(c, '');
    return parts.join('').replace(/^\+/, '') || '0';
  };

  /* ================= ALGEBRA 1 ================= */
  /* ---- slope from two points ---- */
  make({
    id: 'a1-slope', version: 1, skillId: 'slope-from-two-points', minTimeMs: 3000,
    levels: [{ desc: 'slope.lv1' }, { desc: 'slope.lv2' }, { desc: 'slope.lv3' }, { desc: 'slope.lv4' }, { desc: 'slope.lv5' }],
    build(r, level) {
      let p, q;
      if (level === 1) { p = r.int(1, 4); q = 1; }
      else if (level === 2) { p = -r.int(1, 4); q = 1; }
      else if (level === 3) { p = r.int(1, 5); q = r.int(2, 4); }
      else if (level === 4) { p = -r.int(1, 5); q = r.int(2, 4); }
      else { p = r.int(-5, 5); q = r.pick([1, 1, 2, 3, 4]); }
      if (gcd(abs(p), q) !== 1 && p !== 0) return null;
      if ((level === 3 || level === 4) && q === 1) return null;
      if (p === 0 && q !== 1) return null;
      const k = level <= 2 ? r.int(1, 3) : r.int(1, 2), dx = q * k, dy = p * k, lo = level >= 4 ? -6 : 0;
      if (dx > 8) return null;
      let x1 = r.int(lo, 8), y1 = r.int(lo, 8), x2 = x1 + dx, y2 = y1 + dy;
      if (x2 > 12 || y2 > 14 || y2 < lo - 4) return null;
      if (r.chance(.5)) { [x1, x2] = [x2, x1]; [y1, y2] = [y2, y1]; }
      const m = R(p, q), lv = 'a1-slope', link = 'slope-and-linear-functions', rise = y2 - y1, run = x2 - x1;
      const steps = [say('slope.s1', { rise: `${y2} - ${sgnN(y1)}`, r: rise }), say('slope.s2', { run: `${x2} - ${sgnN(x1)}`, n: run }),
        say('slope.s3', { rise, run, m: fracTex(m) })];
      const hints = [say('slope.h1'), say('slope.h2', { y2, y1: sgnN(y1), x2, x1: sgnN(x1) })];
      const cands = [mc('run-over-rise', lv, rise === 0 ? null : R(run, rise), link), mc('subtracted-in-different-orders', lv, m.n === 0 ? null : R(rise, -run), link), mc('added-the-coordinates', lv, (x1 + x2) === 0 ? null : R(y1 + y2, x1 + x2), link)];
      return { prompt: { html: say('slope.p', { x1, y1, x2, y2 }) }, model: `(${y2}-(${y1}))/(${x2}-(${x1}))`, tags: [], answer: { type: 'number', value: m, form: 'simplified', help: say('ans.slope') },
        hints, steps, misconceptions: wrongs(m, cands), canonical: `slope|${Math.min(x1, x2)},${x1 < x2 ? y1 : y2}|${Math.max(x1, x2)},${x1 < x2 ? y2 : y1}` };
    }
  });

  /* ---- evaluating functions ---- */
  make({
    id: 'a1-evaluate-function', version: 1, skillId: 'evaluate-functions', minTimeMs: 2500,
    levels: [{ desc: 'fn.lv1' }, { desc: 'fn.lv2' }, { desc: 'fn.lv3' }, { desc: 'fn.lv4' }, { desc: 'fn.lv5' }],
    build(r, level) {
      const lv = 'a1-evaluate-function', link = 'what-is-a-function';
      if (level === 5) {
        const m1 = r.pick([2, 3, 4, -2, -3]), b1 = NZ(r, -6, 6), m2 = r.pick([1, 2, 3, -1]), b2 = NZ(r, -6, 6), k = r.int(1, 6), g = m2 * k + b2, ans = m1 * g + b1, back = m2 * (m1 * k + b1) + b2;
        if (abs(ans) > 60) return null;
        const fTex = polyTex(0, m1, b1), gTex = polyTex(0, m2, b2);
        const inner = `${coefStr(m2)}${k}${b2 < 0 ? '-' : '+'}${abs(b2)}`;
        const steps = [say('fn.s.inner', { k, g: `${m2 === 1 ? '' : m2 === -1 ? '-' : m2 + '\\cdot '}${k} ${b2 < 0 ? '-' : '+'} ${abs(b2)}`, v: g }), say('fn.s.outer', { g: sgnN(g), f: `${m1 === 1 ? '' : m1 === -1 ? '-' : m1 + '\\cdot '}${sgnN(g)} ${b1 < 0 ? '-' : '+'} ${abs(b1)}`, v: ans })];
        return { prompt: { html: say('fn.p.comp', { f: fTex, g: gTex, k }) }, model: `${coefStr(m1)}(${inner})${b1 < 0 ? '-' : '+'}${abs(b1)}`, tags: [],
          answer: { type: 'number', value: R(ans), form: 'any', help: say('ans.integer') }, hints: [say('fn.h1.comp'), steps[0]], steps,
          misconceptions: wrongs(R(ans), [mc('composed-in-the-wrong-order', lv, R(back), link)]), canonical: `fn5|${m1},${b1}|${m2},${b2}|${k}` };
      }
      let a = 0, b, c, x;
      if (level === 1) { b = r.int(2, 9); c = NZ(r, -9, 9); x = r.int(1, 9); }
      else if (level === 2) { b = r.pick([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6]); c = NZ(r, -9, 9); x = r.int(-9, -1); }
      else if (level === 3) { a = r.int(1, 3); b = r.int(-5, 5); c = r.int(-9, 9); x = r.int(1, 5); }
      else { a = r.int(1, 3); b = r.int(-5, 5); c = r.int(-9, 9); x = r.int(-5, -1); }
      const val = a * x * x + b * x + c;
      if (abs(val) > 80 || (level >= 3 && b === 0 && c === 0)) return null;
      const subst = joinSigned([a ? `${a < 0 ? '-' : ''}${abs(a) === 1 ? '' : abs(a) + '*'}(${x})^2` : '', b ? `${b < 0 ? '-' : ''}${abs(b) === 1 ? '' : abs(b) + '*'}(${x})` : '', c ? String(c) : '']);
      const texParts = []; [[a, t => `${abs(a) === 1 ? '' : abs(a)}(${x})^2`], [b, t => `${abs(b) === 1 ? '' : abs(b)}(${x})`], [c, t => String(abs(c))]].forEach(([coef, f]) => { if (coef) texParts.push([coef < 0, f()]); });
      const subTex = texParts.map(([neg, body], i) => (i === 0 ? (neg ? '-' : '') + body : (neg ? ' - ' : ' + ') + body)).join('');
      const steps = [say('fn.s.sub', { x, expr: subTex }), say('fn.s.val', { v: val })];
      const hints = [say('fn.h1'), say('fn.h2', { x: sgnN(x) })];
      const cands = [];
      if (x < 0) { cands.push(mc('dropped-the-negative-sign', lv, R(a * x * x + b * abs(x) + c), link)); if (a) cands.push(mc('squared-without-the-brackets', lv, R(-a * x * x + b * x + c), link)); }
      cands.push(mc('added-instead-of-multiplying', lv, R(a ? a + x + b + c : b + x + c), link));
      return { prompt: { html: say('fn.p.eval', { f: polyTex(a, b, c), x }) }, model: subst, tags: [], answer: { type: 'number', value: R(val), form: 'any', help: say('ans.integer') },
        hints, steps, misconceptions: wrongs(R(val), cands), canonical: `fn|${a},${b},${c}|${x}` };
    }
  });

  /* ---- solving quadratics by factoring (the answer is a set) ---- */
  const factorTex = (p, q) => (q === 0 ? 'x' : `(${p === 1 ? '' : p}x ${q < 0 ? '+' : '-'} ${abs(q)})`);
  make({
    id: 'a1-quadratic-roots', version: 1, skillId: 'solve-quadratics-by-factoring', minTimeMs: 4000,
    levels: [{ desc: 'quad.lv1' }, { desc: 'quad.lv2' }, { desc: 'quad.lv3' }, { desc: 'quad.lv4' }, { desc: 'quad.lv5' }],
    build(r, level) {
      const lv = 'a1-quadratic-roots', link = 'quadratics-and-the-parabola';
      let p1 = 1, q1, p2 = 1, q2, lead = 1;
      if (level === 1) { q1 = r.int(1, 8); q2 = r.int(1, 8); }
      else if (level === 2) { q1 = r.int(1, 8); q2 = -r.int(1, 8); }
      else if (level === 3) { q1 = r.int(-8, 8); q2 = r.int(-8, 8); if (q1 > 0 && q2 > 0) return null; }
      else if (level === 4) { q1 = r.int(-6, 6); q2 = r.int(-6, 6); lead = r.int(2, 4); }
      else { p1 = r.int(1, 3); p2 = r.int(2, 3); q1 = NZ(r, -7, 7); q2 = NZ(r, -7, 7); if (gcd(abs(q1), p1) !== 1 || gcd(abs(q2), p2) !== 1) return null; }
      const roots = [R(q1, p1), R(q2, p2)].sort((u, v) => rat.cmp(u, v)), same = rat.eq(roots[0], roots[1]);
      if (level === 3 && q1 === 0 && q2 === 0) return null;
      const a = lead * p1 * p2, b = -lead * (p1 * q2 + p2 * q1), c = lead * q1 * q2;
      if (abs(b) > 40 || abs(c) > 100 || (level >= 2 && same && level !== 3)) return null;
      const ans = same ? [roots[0]] : roots;
      const eq = polyTex(a, b, c), plain = polyPlain(a, b, c) + '=0';
      const fac = `${lead > 1 ? lead : ''}${factorTex(p1, q1)}${factorTex(p2, q2)}`, sol = ans.map(v => `x = ${fracTex(v)}`).join(' \\text{ or } ');
      const steps = [];
      if (lead > 1) steps.push(say('quad.s.divide', { a: lead, eq: polyTex(p1 * p2, -(p1 * q2 + p2 * q1), q1 * q2) + ' = 0' }));
      steps.push(say('quad.s.factor', { fac: factorTex(p1, q1) + factorTex(p2, q2) + ' = 0' }));
      steps.push(say('quad.s.zero', { sol }));
      const hints = [say('quad.h1'), level <= 4 ? say('quad.h2', { prod: q1 * q2, sum: -(q1 + q2) }) : say('quad.h2b', { a: p1 * p2, c: q1 * q2 })];
      const T = 'set', cands = [];
      cands.push({ id: 'signs-of-the-solutions-reversed', wrongAnswer: ans.map(v => rat.neg(v)) });
      if (!same) cands.push({ id: 'gave-only-one-solution', wrongAnswer: [ans[0]] });
      cands.push({ id: 'gave-the-coefficients', wrongAnswer: [R(b), R(c)] });
      if (p1 * p2 > 1 && level === 5) cands.push({ id: 'forgot-to-divide-by-the-coefficient', wrongAnswer: [R(q1), R(q2)] });
      const miscs = dropSame(T, ans, wrongsT(T, cands)).map(m => ({ id: m.id, wrongAnswer: m.wrongAnswer, feedback: say(`${lv}.mc.${m.id}`), lessonLink: link }));
      return { prompt: { html: say('quad.p', { eq }) }, model: plain, ask: 'roots', tags: [], answer: { type: 'set', value: ans, help: say('ans.set') }, hints, steps, misconceptions: miscs, canonical: `quad|${a},${b},${c}` };
    }
  });

  /* ---- sequence terms ---- */
  make({
    id: 'a1-sequence-term', version: 1, skillId: 'sequence-terms', minTimeMs: 3000,
    levels: [{ desc: 'seq.lv1' }, { desc: 'seq.lv2' }, { desc: 'seq.lv3' }, { desc: 'seq.lv4' }, { desc: 'seq.lv5' }],
    build(r, level) {
      const lv = 'a1-sequence-term', link = 'sequences-recursive-and-explicit';
      let text, model, ans, steps, hints, cands, implicit = ['1'], distractors = [];
      if (level <= 2) {
        const a1 = level === 1 ? r.int(1, 12) : r.int(10, 40), d = level === 1 ? r.int(2, 6) : -r.int(2, 5), n = r.int(6, 12), an = a1 + (n - 1) * d;
        if (an < -60) return null;
        const list = r.chance(.5) && level === 1;
        if (list) { text = say('seq.p.list', { list: [0, 1, 2, 3].map(i => a1 + i * d).join(', '), n }); model = `${a1}+(${n}-1)*(${a1 + d}-${a1})`; distractors = [0, 1, 2, 3].map(i => String(abs(a1 + i * d))); }
        else { text = say(d > 0 ? 'seq.p.up' : 'seq.p.down', { a1, d: abs(d), n }); model = `${a1}+(${n}-1)*(${d})`; }
        ans = R(an);
        steps = [say('seq.s.rule', {}), say('seq.s.arith', { a1, n, d: sgnN(d), v: an })];
        hints = [say('seq.h1.arith'), say('seq.h2.arith', { n, nm: n - 1 })];
        cands = [mc('used-n-instead-of-n-minus-1', lv, R(a1 + n * d), link), mc('multiplied-the-first-term', lv, R(a1 * n + d), link), mc('forgot-the-first-term', lv, R((n - 1) * d), link)];
      } else if (level === 3) {
        const d = NZ(r, -6, 7), a1 = r.int(-10, 20), i = r.int(2, 5), j = r.int(i + 2, 10), ai = a1 + (i - 1) * d, aj = a1 + (j - 1) * d;
        text = say('seq.p.diff', { i, ai, j, aj }); model = `(${aj}-(${ai}))/(${j}-${i})`; implicit = []; ans = R(d);
        steps = [say('seq.s.gap', { j, i, g: j - i, gap: aj - ai, aj, ai: sgnN(ai) }), say('seq.s.diff', { gap: aj - ai, g: j - i, d })];
        hints = [say('seq.h1.diff'), say('seq.h2.diff', { g: j - i })];
        cands = [mc('forgot-to-divide-by-the-gap', lv, R(aj - ai), link), mc('divided-by-the-later-term-number', lv, R(aj - ai, j), link)];
      } else if (level === 4) {
        const a1 = r.int(1, 5), rr = r.pick([2, 3, -2]), n = r.int(4, 6), an = a1 * rr ** (n - 1);
        if (abs(an) > 1500) return null;
        text = say('seq.p.geom', { a1, r: rr < 0 ? `negative ${abs(rr)}` : rr, n }); model = `${a1}*${rr < 0 ? `(${rr})` : rr}^(${n}-1)`; ans = R(an);
        steps = [say('seq.s.rule.g', {}), say('seq.s.geom', { a1, r: sgnN(rr), p: n - 1, v: an })];
        hints = [say('seq.h1.geom'), say('seq.h2.geom', { p: n - 1 })];
        cands = [mc('used-the-power-n', lv, R(a1 * rr ** n), link), mc('multiplied-instead-of-using-a-power', lv, R(a1 * rr * (n - 1)), link), mc('added-the-ratio', lv, R(a1 + rr * (n - 1)), link)];
      } else {
        const a1 = r.int(2, 9), d = r.int(2, 7), n = r.int(8, 25), an = a1 + (n - 1) * d;
        text = say('seq.p.which', { a1, d, an }); model = `(${an}-${a1})/${d}+1`; ans = R(n);
        steps = [say('seq.s.which1', { an, a1, g: an - a1 }), say('seq.s.which2', { g: an - a1, d, k: (an - a1) / d, n })];
        hints = [say('seq.h1.which'), say('seq.h2.which', { an, a1 })];
        cands = [mc('forgot-to-add-one', lv, R(n - 1), link), mc('divided-the-term-by-the-difference', lv, R(an, d), link)];
      }
      return { prompt: { html: text }, model, implicit, distractors, tags: [], answer: { type: 'number', value: ans, form: 'any', help: say('ans.integer') }, hints, steps, misconceptions: wrongs(ans, cands), canonical: 'seq|' + level + '|' + model };
    }
  });

  /* ================= GEOMETRY ================= */
  /* ---- angles in triangles and polygons ---- */
  const DEG = ['degrees', 'deg', '°'];
  make({
    id: 'geo-angles', version: 1, skillId: 'angles-in-triangles-and-polygons', minTimeMs: 2500,
    levels: [{ desc: 'ang.lv1' }, { desc: 'ang.lv2' }, { desc: 'ang.lv3' }, { desc: 'ang.lv4' }, { desc: 'ang.lv5' }],
    build(r, level) {
      const lv = 'geo-angles', link = 'angles-in-triangles-and-polygons';
      let text, model, ans, steps, hints, cands, implicit = [];
      if (level === 1) {
        implicit = ['180'];
        const A = r.int(20, 90), B = r.int(20, 120 - 20); if (A + B > 150 || A + B < 50) return null;
        const C = 180 - A - B; text = say('ang.p.tri', { A, B }); model = `180-${A}-${B}`; ans = R(C);
        steps = [say('ang.s.sum'), say('ang.s.tri', { A, B, s: A + B, C })]; hints = [say('ang.h1.tri'), say('ang.h2.tri', { A, B, s: A + B })];
        cands = [mc('added-the-two-angles', lv, R(A + B), link), mc('used-360', lv, R(360 - A - B), link)];
      } else if (level === 2) {
        const apex = 2 * r.int(10, 70), base = (180 - apex) / 2; implicit = ['180', '2'];
        text = say('ang.p.iso', { apex }); model = `(180-${apex})/2`; ans = R(base);
        steps = [say('ang.s.iso1', { apex, rest: 180 - apex }), say('ang.s.iso2', { rest: 180 - apex, base })]; hints = [say('ang.h1.iso'), say('ang.h2.iso', { apex, rest: 180 - apex })];
        cands = [mc('forgot-to-halve', lv, R(180 - apex), link), mc('treated-the-apex-as-a-base-angle', lv, R(180 - 2 * apex), link)];
      } else if (level === 3) {
        const A = r.int(25, 85), B = r.int(25, 85); if (A + B > 160) return null;
        text = say('ang.p.ext', { A, B }); model = `${A}+${B}`; ans = R(A + B);
        steps = [say('ang.s.ext1', { A, B, C: 180 - A - B }), say('ang.s.ext2', { A, B, C: 180 - A - B, e: A + B })]; hints = [say('ang.h1.ext'), say('ang.h2.ext', { A, B })];
        cands = [mc('gave-the-interior-angle', lv, R(180 - A - B), link), mc('used-only-one-angle', lv, R(A), link)];
      } else if (level === 4) {
        const regular = r.chance(.5), n = regular ? r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36]) : r.int(5, 20); implicit = ['180', '2'];
        if (!regular) { text = say('ang.p.sum', { n }); model = `180*(${n}-2)`; ans = R(180 * (n - 2)); steps = [say('ang.s.poly1', { n, t: n - 2 }), say('ang.s.poly2', { t: n - 2, s: 180 * (n - 2) })];
          cands = [mc('forgot-to-subtract-2', lv, R(180 * n), link), mc('used-n-minus-1', lv, R(180 * (n - 1)), link)]; }
        else { if (360 % n !== 0 && (180 * (n - 2)) % n !== 0) return null; text = say('ang.p.reg', { n }); model = `180*(${n}-2)/${n}`; ans = R(180 * (n - 2), n);
          steps = [say('ang.s.poly1', { n, t: n - 2 }), say('ang.s.reg', { s: 180 * (n - 2), n, a: ans.n / ans.d })]; cands = [mc('gave-the-total-not-one-angle', lv, R(180 * (n - 2)), link), mc('used-360-over-n', lv, R(360, n), link)]; }
        hints = [say(regular ? 'ang.h1.reg' : 'ang.h1.poly'), say('ang.h2.poly', { n, t: n - 2 })];
        if (regular && ans.d !== 1) return null;
      } else {
        const n = r.pick([4, 5, 6]), total = 180 * (n - 2), known = []; let left = total;
        for (let i = 0; i < n - 1; i++) { const v = r.int(60, 150); known.push(v); left -= v; }
        if (left < 40 || left > 160) return null;
        text = say('ang.p.missing', { n, list: known.join(', ') }); model = `180*(${n}-2)-(${known.join('+')})`; implicit = ['180', '2', String(n)]; ans = R(left);
        const ks = known.reduce((t, x) => t + x, 0);
        steps = [say('ang.s.poly1', { n, t: n - 2 }), say('ang.s.miss', { total, sum: known.join(' + '), ks, left })]; hints = [say('ang.h1.miss'), say('ang.h2.miss', { n, total })];
        cands = [mc('used-the-triangle-total', lv, ks < 180 ? R(180 - ks) : null, link), mc('forgot-to-subtract-the-known-angles', lv, R(total), link)];
      }
      return { prompt: { html: text }, model, implicit, tags: [], answer: { type: 'number', value: ans, form: 'any', units: DEG, help: say('ans.degrees') }, hints, steps, misconceptions: wrongs(ans, cands), canonical: 'ang|' + level + '|' + model };
    }
  });

  /* ---- circles: answers are the number in front of pi ---- */
  make({
    id: 'geo-circle', version: 1, skillId: 'circles-circumference-and-area', minTimeMs: 3000,
    levels: [{ desc: 'circ.lv1' }, { desc: 'circ.lv2' }, { desc: 'circ.lv3' }, { desc: 'circ.lv4' }, { desc: 'circ.lv5' }],
    build(r, level) {
      const lv = 'geo-circle', link = 'area-of-a-circle', link2 = 'arc-length-and-sectors';
      let text, model, ans, steps, hints, cands, implicit = [], tags = [];
      if (level === 1) { const rad = r.int(2, 30); text = say('circ.p.circ', { r: rad }); model = `2*${rad}`; implicit = ['2']; ans = R(2 * rad);
        steps = [say('circ.s.circ', { r: rad, k: 2 * rad })]; hints = [say('circ.h1.circ'), say('circ.h2.circ', { r: rad })]; cands = [mc('used-the-area-formula', lv, R(rad * rad), link), mc('forgot-the-2', lv, R(rad), link)]; }
      else if (level === 2) { const rad = r.int(2, 25); text = say('circ.p.area', { r: rad }); model = `${rad}^2`; ans = R(rad * rad);
        steps = [say('circ.s.area', { r: rad, k: rad * rad })]; hints = [say('circ.h1.area'), say('circ.h2.area', { r: rad })]; cands = [mc('used-the-circumference-formula', lv, R(2 * rad), link)]; }
      else if (level === 3) {
        const d = 2 * r.int(2, 25), area = r.chance(.5); text = say(area ? 'circ.p.areaD' : 'circ.p.circD', { d }); tags = [];
        if (area) { model = `(${d}/2)^2`; implicit = ['2']; ans = R((d / 2) ** 2); steps = [say('circ.s.half', { d, r: d / 2 }), say('circ.s.area', { r: d / 2, k: (d / 2) ** 2 })]; hints = [say('circ.h1.areaD'), say('circ.h2.areaD', { d, r: d / 2 })]; cands = [mc('used-the-diameter-as-the-radius', lv, R(d * d), link), mc('halved-instead-of-squaring', lv, R(d / 2), link)]; }
        else { model = `${d}`; ans = R(d); steps = [say('circ.s.circD', { d })]; hints = [say('circ.h1.circD'), say('circ.h2.circD', { d })]; cands = [mc('doubled-the-diameter', lv, R(2 * d), link), mc('halved-the-diameter', lv, R(d / 2), link)]; }
      } else if (level === 4) {
        const rad = r.int(2, 14), fromArea = r.chance(.5);
        if (fromArea) { text = say('circ.p.findrA', { k: rad * rad }); model = `sqrt(${rad * rad})`; ans = R(rad); steps = [say('circ.s.findrA', { k: rad * rad, r: rad })]; hints = [say('circ.h1.findrA'), say('circ.h2.findrA', { k: rad * rad })]; cands = [mc('halved-the-area-number', lv, R(rad * rad, 2), link), mc('gave-the-area-number', lv, R(rad * rad), link)]; }
        else { text = say('circ.p.findrC', { k: 2 * rad }); model = `${2 * rad}/2`; implicit = ['2']; ans = R(rad); steps = [say('circ.s.findrC', { k: 2 * rad, r: rad })]; hints = [say('circ.h1.findrC'), say('circ.h2.findrC', { k: 2 * rad })]; cands = [mc('forgot-to-halve', lv, R(2 * rad), link), mc('doubled-instead-of-halving', lv, R(4 * rad), link)]; }
      } else {
        const th = r.pick([30, 45, 60, 90, 120, 180]), rad = r.int(2, 12), arc = r.chance(.5);
        if (arc) { if ((th * rad) % 180 !== 0) return null; const k = th * rad / 180; text = say('circ.p.arc', { th, r: rad }); model = `${th}/360*2*${rad}`; implicit = ['360', '2']; ans = R(k); steps = [say('circ.s.arc', { th, r: rad, k })]; hints = [say('circ.h1.arc'), say('circ.h2.arc', { th })]; cands = [mc('used-the-whole-circumference', lv, R(2 * rad), link2), mc('used-the-sector-area-formula', lv, R(th * rad * rad, 360), link2)]; }
        else { if ((th * rad * rad) % 360 !== 0) return null; const k = th * rad * rad / 360; text = say('circ.p.sector', { th, r: rad }); model = `${th}/360*${rad}^2`; implicit = ['360']; ans = R(k); steps = [say('circ.s.sector', { th, r: rad, k })]; hints = [say('circ.h1.sector'), say('circ.h2.sector', { th })]; cands = [mc('used-the-whole-area', lv, R(rad * rad), link2), mc('used-the-arc-length-formula', lv, R(th * rad, 180), link2)]; }
      }
      return { prompt: { html: text }, model, implicit, tags, answer: { type: 'number', value: ans, form: 'any', display: 'decimal', help: say(level === 4 ? 'ans.number' : 'ans.pi') }, hints, steps, misconceptions: wrongs(ans, cands), canonical: 'circ|' + level + '|' + model };
    }
  });

  /* ---- distance and midpoint ---- */
  make({
    id: 'geo-coordinates', version: 1, skillId: 'distance-and-midpoint', minTimeMs: 3500,
    levels: [{ desc: 'coord.lv1' }, { desc: 'coord.lv2' }, { desc: 'coord.lv3' }, { desc: 'coord.lv4' }, { desc: 'coord.lv5' }],
    build(r, level) {
      const lv = 'geo-coordinates', link = 'distance-and-the-pythagorean-theorem', P = (x, y) => `(${x}, ${y})`;
      let x1 = r.int(-8, 8), y1 = r.int(-8, 8), x2, y2, text, model, steps, hints, cands, ask = 'value', ans, answer, implicit = [];
      const distanceFrom = (dx, dy) => `sqrt((${x2}-(${x1}))^2+(${y2}-(${y1}))^2)`;
      if (level === 1) {
        const len = r.int(2, 12), horiz = r.chance(.5); x2 = horiz ? x1 + len : x1; y2 = horiz ? y1 : y1 + len;
        if (Math.max(abs(x2), abs(y2)) > 14) return null;
        text = say('coord.p.dist', { A: P(x1, y1), B: P(x2, y2) }); model = distanceFrom(); implicit = ['2'];
        steps = [say('coord.s.line', { len })]; hints = [say('coord.h1.line'), say('coord.h2.line')]; ans = R(len);
        cands = [mc('added-the-coordinates', lv, R(abs(x1 + x2 + y1 + y2)), link), mc('counted-one-too-few', lv, R(len - 1), link)];
        answer = { type: 'number', value: ans, form: 'any', help: say('ans.number') };
      } else if (level === 3) {
        const [da, db] = euclid(r, PRIM.slice(0, 4), 1, 2), sx = r.chance(.5) ? 1 : -1, sy = r.chance(.5) ? 1 : -1, swap = r.chance(.5), dx = swap ? db : da, dy = swap ? da : db;
        x2 = x1 + sx * dx; y2 = y1 + sy * dy; if (Math.max(abs(x2), abs(y2)) > 14) return null;
        const c = Math.round(Math.hypot(dx, dy)); if (c * c !== dx * dx + dy * dy) return null;
        text = say('coord.p.dist', { A: P(x1, y1), B: P(x2, y2) }); model = distanceFrom(); implicit = ['2']; ans = R(c);
        steps = [say('coord.s.diff', { dx, dy }), say('coord.s.sqrt', { dx, dy, s: dx * dx + dy * dy, c })]; hints = [say('coord.h1.dist'), say('coord.h2.dist', { dx, dy })];
        cands = [mc('forgot-the-square-root', lv, R(dx * dx + dy * dy), link), mc('added-the-differences', lv, R(dx + dy), link)];
        answer = { type: 'number', value: ans, form: 'any', help: say('ans.number') };
      } else if (level === 2 || level === 4) {
        x2 = r.int(-8, 8); y2 = r.int(-8, 8);
        if (level === 2) { if ((x1 + x2) % 2 || (y1 + y2) % 2) return null; } else if (!((x1 + x2) % 2 || (y1 + y2) % 2)) return null;
        if (x1 === x2 && y1 === y2) return null;
        ask = 'values'; implicit = ['2']; text = say('coord.p.mid', { A: P(x1, y1), B: P(x2, y2) }); model = `(${x1}+(${x2}))/2;(${y1}+(${y2}))/2`;
        ans = [R(x1 + x2, 2), R(y1 + y2, 2)];
        steps = [say('coord.s.midx', { x1: sgnN(x1), x2: sgnN(x2), s: x1 + x2, mx: rat.str(ans[0]) }), say('coord.s.midy', { y1: sgnN(y1), y2: sgnN(y2), s: y1 + y2, my: rat.str(ans[1]) })];
        hints = [say('coord.h1.mid'), say('coord.h2.mid', { x1: sgnN(x1), x2: sgnN(x2) })];
        const cm = [{ id: 'added-without-halving', wrongAnswer: [R(x1 + x2), R(y1 + y2)] }, { id: 'subtracted-instead-of-adding', wrongAnswer: [R(x2 - x1, 2), R(y2 - y1, 2)] }, { id: 'mixed-up-x-and-y', wrongAnswer: [R(y1 + y2, 2), R(x1 + x2, 2)] }];
        cands = dropSame('pair', ans, wrongsT('pair', cm)).map(m => ({ id: m.id, wrongAnswer: m.wrongAnswer, feedback: say(`${lv}.mc.${m.id}`), lessonLink: link }));
        answer = { type: 'pair', value: ans, display: 'decimal', help: say('ans.pair') };
      } else {
        const mx = r.int(-6, 6), my = r.int(-6, 6); x1 = r.int(-8, 8); y1 = r.int(-8, 8); x2 = 2 * mx - x1; y2 = 2 * my - y1;
        if (abs(x2) > 14 || abs(y2) > 14 || (x1 === mx && y1 === my)) return null;
        ask = 'values'; implicit = ['2']; text = say('coord.p.end', { M: P(mx, my), A: P(x1, y1) }); model = `2*(${mx})-(${x1});2*(${my})-(${y1})`; ans = [R(x2), R(y2)];
        steps = [say('coord.s.endx', { mx: sgnN(mx), x1: sgnN(x1), x2 }), say('coord.s.endy', { my: sgnN(my), y1: sgnN(y1), y2 })]; hints = [say('coord.h1.end'), say('coord.h2.end', { mx: sgnN(mx), x1: sgnN(x1) })];
        const cm = [{ id: 'forgot-to-double', wrongAnswer: [R(mx - x1), R(my - y1)] }, { id: 'gave-the-midpoint-back', wrongAnswer: [R(mx), R(my)] }, { id: 'added-the-points', wrongAnswer: [R(mx + x1), R(my + y1)] }];
        cands = dropSame('pair', ans, wrongsT('pair', cm)).map(m => ({ id: m.id, wrongAnswer: m.wrongAnswer, feedback: say(`${lv}.mc.${m.id}`), lessonLink: link }));
        answer = { type: 'pair', value: ans, help: say('ans.pair') };
      }
      const miscs = answer.type === 'number' ? wrongs(ans, cands) : cands;
      return { prompt: { html: text }, model, ask, implicit, tags: [], answer, hints, steps, misconceptions: miscs, canonical: `coord|${level}|${model}` };
    }
  });

  /* ---- volume and surface area ---- */
  make({
    id: 'geo-solids', version: 1, skillId: 'volume-and-surface-area', minTimeMs: 3000,
    levels: [{ desc: 'solid.lv1' }, { desc: 'solid.lv2' }, { desc: 'solid.lv3' }, { desc: 'solid.lv4' }, { desc: 'solid.lv5' }],
    build(r, level) {
      const lv = 'geo-solids', link = 'volume-of-prisms-pyramids-and-cones', link2 = 'nets-and-surface-area';
      let text, model, ans, steps, hints, cands, implicit = [], pi = false;
      const kind = level === 4 ? r.pick(['pyramid', 'cylV']) : level === 5 ? r.pick(['cone', 'cylSA']) : null;
      if (level === 1) { const l = r.int(2, 12), w = r.int(2, 9), h = r.int(2, 9); if (l === w) return null; text = say('solid.p.box', { l, w, h }); model = `${l}*${w}*${h}`; ans = R(l * w * h);
        steps = [say('solid.s.box', { l, w, h, v: l * w * h })]; hints = [say('solid.h1.box'), say('solid.h2.box', { l, w })]; cands = [mc('added-the-edges', lv, R(l + w + h), link), mc('found-one-face', lv, R(l * w), link)]; }
      else if (level === 2) { const l = r.int(2, 10), w = r.int(2, 8), h = r.int(2, 8); if (l === w || w === h) return null; const sa = 2 * (l * w + l * h + w * h); text = say('solid.p.sa', { l, w, h }); model = `2*(${l}*${w}+${l}*${h}+${w}*${h})`; implicit = ['2']; ans = R(sa);
        steps = [say('solid.s.sa1', { l, w, h, a: l * w, b: l * h, c: w * h, s: l * w + l * h + w * h }), say('solid.s.sa2', { s: l * w + l * h + w * h, sa })]; hints = [say('solid.h1.sa'), say('solid.h2.sa', { l, w, h })];
        cands = [mc('found-the-volume', lv, R(l * w * h), link2), mc('forgot-to-double', lv, R(l * w + l * h + w * h), link2)]; }
      else if (level === 3) { const b = 2 * r.int(1, 6), hh = r.int(2, 9), L = r.int(2, 12); text = say('solid.p.tri', { b, h: hh, L }); model = `${b}*${hh}*${L}/2`; implicit = ['2']; ans = R(b * hh * L / 2);
        steps = [say('solid.s.tri1', { b, h: hh, a: b * hh / 2 }), say('solid.s.tri2', { a: b * hh / 2, L, v: b * hh * L / 2 })]; hints = [say('solid.h1.tri'), say('solid.h2.tri', { b, h: hh })]; cands = [mc('forgot-the-half', lv, R(b * hh * L), link), mc('used-the-base-edge-as-the-whole-base', lv, R(b * L), link)]; }
      else if (kind === 'pyramid') { const s = r.int(3, 10), hh = 3 * r.int(1, 5); text = say('solid.p.pyr', { s, h: hh }); model = `${s}^2*${hh}/3`; implicit = ['3']; ans = R(s * s * hh / 3);
        steps = [say('solid.s.pyr1', { s, b: s * s }), say('solid.s.pyr2', { b: s * s, h: hh, v: s * s * hh / 3 })]; hints = [say('solid.h1.pyr'), say('solid.h2.pyr', { s })]; cands = [mc('forgot-the-third', lv, R(s * s * hh), link), mc('used-the-prism-formula-with-half', lv, R(s * s * hh, 2), link)]; }
      else if (kind === 'cylV') { pi = true; const rad = r.int(2, 8), hh = r.int(2, 12); text = say('solid.p.cyl', { r: rad, h: hh }); model = `${rad}^2*${hh}`; ans = R(rad * rad * hh);
        steps = [say('solid.s.cyl', { r: rad, h: hh, k: rad * rad * hh })]; hints = [say('solid.h1.cyl'), say('solid.h2.cyl', { r: rad })]; cands = [mc('forgot-to-square-the-radius', lv, R(rad * hh), link), mc('used-the-diameter', lv, R(4 * rad * rad * hh), link)]; }
      else if (kind === 'cone') { pi = true; const rad = r.int(2, 9), hh = 3 * r.int(1, 4); text = say('solid.p.cone', { r: rad, h: hh }); model = `${rad}^2*${hh}/3`; implicit = ['3']; ans = R(rad * rad * hh / 3);
        steps = [say('solid.s.cone', { r: rad, h: hh, k: rad * rad * hh / 3 })]; hints = [say('solid.h1.cone'), say('solid.h2.cone', { r: rad })]; cands = [mc('forgot-the-third', lv, R(rad * rad * hh), link), mc('forgot-to-square-the-radius', lv, R(rad * hh, 3), link)]; }
      else { pi = true; const rad = r.int(2, 8), hh = r.int(2, 12); text = say('solid.p.cylsa', { r: rad, h: hh }); model = `2*${rad}*(${rad}+${hh})`; implicit = ['2']; ans = R(2 * rad * (rad + hh));
        steps = [say('solid.s.cylsa', { r: rad, h: hh, k: 2 * rad * (rad + hh), side: 2 * rad * hh, ends: 2 * rad * rad })]; hints = [say('solid.h1.cylsa'), say('solid.h2.cylsa', { r: rad })]; cands = [mc('left-out-the-circles', lv, R(2 * rad * hh), link2), mc('found-the-volume', lv, R(rad * rad * hh), link2)]; }
      return { prompt: { html: text }, model, implicit, tags: [], answer: { type: 'number', value: ans, form: 'any', help: say(pi ? 'ans.pi' : 'ans.number') }, hints, steps, misconceptions: wrongs(ans, cands), canonical: 'solid|' + level + '|' + model };
    }
  });

  /* ---- trigonometric ratios in a right triangle ---- */
  make({
    id: 'geo-trig', version: 1, skillId: 'trig-ratios-from-a-triangle', minTimeMs: 3500,
    levels: [{ desc: 'trig.lv1' }, { desc: 'trig.lv2' }, { desc: 'trig.lv3' }, { desc: 'trig.lv4' }, { desc: 'trig.lv5' }],
    build(r, level) {
      const lv = 'geo-trig', link = 'trigonometric-ratios-sine-cosine-tangent';
      if (level === 5) {
        const [a, b, c] = euclid(r, PRIM.slice(0, 4), 1, 1), k = r.int(2, 5), which = r.pick(['sin', 'cos', 'tan']);
        const opp = a, adj = b, hyp = c, num = which === 'sin' ? opp : which === 'cos' ? adj : opp, den = which === 'tan' ? adj : hyp, given = den * k, ans = num * k;
        const wrong = den * den * k / num; 
        const tex = `\\${which} A = \\frac{${num}}{${den}}`;
        const known = which === 'sin' ? 'hypotenuse' : which === 'cos' ? 'hypotenuse' : 'adjacent side', want = which === 'sin' ? 'opposite side' : which === 'cos' ? 'adjacent side' : 'opposite side';
        const steps = [say('trig.s.solve1', { tex, given, known: say('trig.w.' + known.split(' ')[0]) }), say('trig.s.solve2', { num, den, given, k, ans })];
        return { prompt: { html: say('trig.p.solve', { tex, given, known: say('trig.w.' + known.split(' ')[0]), want: say('trig.w.' + want.split(' ')[0]) }) }, model: `${num}/${den}*${given}`, implicit: [], tags: [],
          answer: { type: 'number', value: R(ans), form: 'any', help: say('ans.number') }, hints: [say('trig.h1.solve'), say('trig.h2.solve', { num, den })], steps,
          misconceptions: wrongs(R(ans), [mc('used-the-ratio-upside-down', lv, R(den * den * k, num * 1 === 0 ? 1 : num), link), mc('gave-the-given-side', lv, R(given), link)]), canonical: `trig5|${which}|${num}|${den}|${k}` };
      }
      const [x, y, c] = euclid(r, PRIM.slice(0, level <= 3 ? 4 : 5), 1, level <= 3 ? 3 : 2), swap = r.chance(.5), AC = swap ? x : y, BC = swap ? y : x, AB = c;
      const angle = level === 4 ? r.pick(['A', 'B']) : 'A', which = level === 1 ? 'sin' : level === 2 ? 'cos' : level === 3 ? 'tan' : r.pick(['sin', 'cos', 'tan']);
      const opp = angle === 'A' ? BC : AC, adj = angle === 'A' ? AC : BC, num = which === 'sin' ? opp : which === 'cos' ? adj : opp, den = which === 'tan' ? adj : AB, ans = R(num, den);
      const other = [AC, BC, AB].find(v => v !== num && v !== den), distractors = String(other) === String(num) || String(other) === String(den) ? [] : [String(other)];
      const name = say('trig.name.' + which);
      const steps = [say('trig.s.label', { angle, opp, adj, hyp: AB }), say('trig.s.ratio', { which: name, angle, ans: fracTex(ans), n: num, d: den })];
      const wrongWhich = { sin: ['cos', 'tan'], cos: ['sin', 'tan'], tan: ['sin', 'cos'] }[which];
      const ratioFor = w => (w === 'sin' ? R(opp, AB) : w === 'cos' ? R(adj, AB) : R(opp, adj));
      const cands = [mc('used-a-different-ratio', lv, ratioFor(wrongWhich[0]), link), mc('flipped-the-ratio', lv, R(den, num), link), mc('mixed-up-opposite-and-adjacent', lv, which === 'sin' ? R(adj, AB) : which === 'cos' ? R(opp, AB) : R(adj, opp), link)];
      const text = say('trig.p.ratio', { AC, BC, AB, which: name, angle });
      return { prompt: { html: text }, model: `${num}/${den}`, implicit: [], distractors, tags: [], answer: { type: 'number', value: ans, form: 'simplified', help: say('ans.fraction') },
        hints: [say('trig.h1.' + which), say('trig.h2', { angle })], steps, misconceptions: wrongs(ans, cands), canonical: `trig|${which}|${angle}|${AC}|${BC}` };
    }
  });

  /* ---- similar figures: the missing side, the scale factor, an area ---- */
  make({
    id: 'geo-similar', version: 1, skillId: 'similar-figures-missing-side', minTimeMs: 3500,
    levels: [{ desc: 'sim.lv1' }, { desc: 'sim.lv2' }, { desc: 'sim.lv3' }, { desc: 'sim.lv4' }, { desc: 'sim.lv5' }],
    build(r, level) {
      const lv = 'geo-similar', link = 'similar-triangles-aa-sas-sss';
      if (level === 5) {
        const p = r.int(1, 4), q = p + r.int(1, 3);
        if (gcd(p, q) !== 1) return null;
        const A = q * q * 0 + p * p * r.int(2, 8), big = A * q * q / (p * p);
        return { prompt: { html: say('sim.p.area', { p, q, A }) }, model: `${A}*${q}^2/${p}^2`, implicit: [], tags: [], answer: { type: 'number', value: R(big), form: 'any', help: say('ans.number') },
          hints: [say('sim.h1.area'), say('sim.h2.area', { p, q })], steps: [say('sim.s.area1', { p, q, p2: p * p, q2: q * q }), say('sim.s.area2', { A, p2: p * p, q2: q * q, v: big })],
          misconceptions: wrongs(R(big), [mc('forgot-to-square', lv, R(A * q, p), link), mc('squared-the-wrong-way-round', lv, R(A * p * p, q * q), link)]), canonical: `sim5|${p}|${q}|${A}` };
      }
      let p, q;
      if (level === 1) { q = 1; p = r.int(2, 4); } else if (level === 2) { q = r.pick([2, 2, 3]); p = q + r.int(1, 3); if (gcd(p, q) !== 1) return null; }
      else if (level === 3) { p = r.int(2, 3); q = p + r.int(1, 3); if (gcd(p, q) !== 1) return null; }
      else { p = r.int(2, 5); q = r.int(1, 4); if (p === q || gcd(p, q) !== 1) return null; }
      const u = r.int(1, 4), v = r.int(1, 4);
      let s1 = q * u, s2 = q * v, S1 = p * u, S2 = p * v;
      if (s1 === s2 || s1 * s2 === 0) return null;
      if (level === 4) {
        const k = R(p, q);
        return { prompt: { html: say('sim.p.scale', { s1, S1 }) }, model: `${S1}/${s1}`, implicit: [], tags: [], answer: { type: 'number', value: k, form: 'simplified', help: say('ans.fraction') },
          hints: [say('sim.h1.scale'), say('sim.h2.scale', { s1, S1 })], steps: [say('sim.s.scale', { s1, S1, k: fracTex(k) })],
          misconceptions: wrongs(k, [mc('flipped-the-scale-factor', lv, R(q, p), link), mc('subtracted-the-sides', lv, R(S1 - s1), link)]), canonical: `sim4|${s1}|${S1}` };
      }
      if (level === 3) [s1, s2, S1, S2] = [S1, S2, s1, s2];    /* shrinking: the larger triangle comes first */
      const k = R(S1, s1), ans = R(S2);
      const first = level === 3 ? 'large' : 'small', second = level === 3 ? 'small' : 'large';
      const steps = [say('sim.s.k', { s1, S1, k: fracTex(k) }), say('sim.s.apply', { s2, k: fracTex(k), v: S2 })];
      return { prompt: { html: say('sim.p.side', { first: say('sim.w.' + first), second: say('sim.w.' + second), s1, s2, S1 }) }, model: `${s2}*${S1}/${s1}`, implicit: [], tags: [],
        answer: { type: 'number', value: ans, form: 'any', help: say('ans.number') }, hints: [say('sim.h1.side'), say('sim.h2.side', { s1, S1 })], steps,
        misconceptions: wrongs(ans, [mc('added-the-same-amount', lv, R(s2 + (S1 - s1)), link), mc('used-the-scale-factor-upside-down', lv, R(s2 * s1, S1), link)]), canonical: `sim|${level}|${s1}|${s2}|${S1}` };
    }
  });
}
