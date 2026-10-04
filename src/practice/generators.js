/* =====================================================================
   PRACTICE (generators): one pure, deterministic generator per skill.
   generate(seed, level) builds the ANSWER first and the problem around it (backward construction), rejects ugly or trivial cases and
   resamples (capped; hitting the cap is a generator bug and throws), and returns:
     prompt { html }, model (plain ASCII statement the CAS re-reads), ask ('value' | 'solve'), answer { type, value, form?, help, ... },
     hints[], steps[], misconceptions[{ id, wrongAnswer, feedback, lessonLink }], tags[], canonical (for repeat detection), figure?
   Change a generator's output => bump its `version`. The text is looked up in Practice.T (strings.js).
   ===================================================================== */
{
  const { R, rat, gcd, lcm, say } = Practice;
  const CAP = 300, abs = Math.abs;
  const fail = Practice.generators = {};
  const list = Practice.generatorList = [];

  /* ---- shared formatting: TeX for the page, plain ASCII for the model ---- */
  const coefTex = (c, v) => (c === 1 ? '' : c === -1 ? '-' : String(c)) + v;
  /* c v + k  (flip puts the constant first) */
  const linTex = (c, k, v = 'x', flip = false) => {
    if (c === 0) return String(k);
    if (k === 0) return coefTex(c, v);
    if (flip) return `${k} ${c < 0 ? '-' : '+'} ${coefTex(abs(c), v)}`;
    return `${coefTex(c, v)} ${k < 0 ? '-' : '+'} ${abs(k)}`;
  };
  const parenTex = (a, b) => `${a === 1 ? '' : a === -1 ? '-' : a}(x ${b < 0 ? '-' : '+'} ${abs(b)})`;
  const eqTex = (a, b, c, d) => `${linTex(a, b)} = ${linTex(c, d)}`;
  const fracTex = q => q.d === 1 ? String(q.n) : `${q.n < 0 ? '-' : ''}\\frac{${abs(q.n)}}{${q.d}}`;
  const mixedTex = q => { if (q.d === 1 || abs(q.n) < q.d) return fracTex(q); const w = Math.trunc(q.n / q.d), r = abs(q.n) % q.d; return r ? `${w}\\frac{${r}}{${q.d}}` : String(w); };
  const sgn = n => (n < 0 ? `(${n})` : String(n));
  const join = items => items.join(', ');

  /* Wraps a generator definition: seeded stream, constraint resampling with a loud cap, and a uniform result. */
  const make = def => {
    const gen = {
      id: def.id, version: def.version, skillId: def.skillId, levels: def.levels, minTimeMs: def.minTimeMs,
      generate(seed, level) {
        if (!Number.isInteger(level) || level < 1 || level > def.levels.length) throw new Error(`${def.id}: no level ${level}`);
        const r = Practice.rng(seed);
        for (let tries = 0; tries < CAP; tries++) {
          const p = def.build(r, level, def.levels[level - 1]);
          if (p) return Object.assign({ generatorId: def.id, version: def.version, skillId: def.skillId, level, seed, ask: 'value', tags: [], misconceptions: [] }, p);
        }
        throw new Error(`${def.id} level ${level}: resample cap hit (seed ${seed})`);
      }
    };
    fail[def.id] = gen; list.push(gen);
    return gen;
  };
  /* keep only wrong answers that really differ from the right one and from each other */
  const wrongs = (answer, cands) => {
    const out = [];
    for (const c of cands) {
      if (!c || !c.wrongAnswer) continue;
      if (rat.eq(c.wrongAnswer, answer) || out.some(o => rat.eq(o.wrongAnswer, c.wrongAnswer))) continue;
      out.push(c);
    }
    return out;
  };
  const mc = (id, gid, wrongAnswer, lessonLink, params = {}) => ({ id, wrongAnswer, feedback: say(`${gid}.mc.${id}`, params), lessonLink });

  /* =====================================================================
     G4: multiplying multi-digit whole numbers (area model)
     ===================================================================== */
  const pieces = n => { const s = String(n); return s.split('').map((d, i) => +d * 10 ** (s.length - 1 - i)).filter(v => v); };
  const digitSum = n => String(n).split('').reduce((t, d) => t + +d, 0);
  make({
    id: 'g4-multiply', version: 1, skillId: 'multiply-multi-digit', minTimeMs: 1500,
    levels: [
      { desc: 'mult.lv1', aLo: 12, aHi: 29, bLo: 2, bHi: 5 },
      { desc: 'mult.lv2', aLo: 31, aHi: 99, bLo: 3, bHi: 9 },
      { desc: 'mult.lv3', aLo: 112, aHi: 499, bLo: 3, bHi: 9 },
      { desc: 'mult.lv4', aLo: 12, aHi: 35, bLo: 12, bHi: 25 },
      { desc: 'mult.lv5', aLo: 23, aHi: 99, bLo: 21, bHi: 99 },
      { desc: 'mult.lv6', aLo: 112, aHi: 499, bLo: 12, bHi: 45 }
    ],
    build(r, level, K) {
      const a = r.int(K.aLo, K.aHi), b = r.int(K.bLo, K.bHi);
      if (a % 10 === 0 || b % 10 === 0) return null;       /* trailing zeros make it too easy */
      const ans = R(a * b), pa = pieces(a), pb = pieces(b), lv = 'g4-multiply';
      const partial = (x, y) => `\\(${x} \\times ${y} = ${x * y}\\)`;
      const all = []; for (const x of pa) for (const y of pb) all.push([x, y]);
      const sumTex = `${all.map(([x, y]) => x * y).join(' + ')} = ${a * b}`;
      const split = pb.length === 1
        ? say('mult.s1b', { a, b, pa: pa.join(' + ') })
        : say('mult.s1', { a, b, pa: pa.join(' + '), pb: pb.join(' + ') });
      const steps = [split, say('mult.s2', { list: join(all.map(([x, y]) => partial(x, y))) }), say('mult.s3', { sum: sumTex })];
      const hints = [say('mult.h1'), say('mult.h2', { first: partial(all[0][0], all[0][1]) }), say('mult.h3', { list: join(all.map(([x, y]) => `\\(${x * y}\\)`)) })];
      const cands = [];
      if (a < 100 && b > 9 && b < 100) { const p = Math.floor(a / 10), q = a % 10, rr = Math.floor(b / 10), s = b % 10; cands.push(mc('missing-middle-pieces', lv, R(p * rr * 100 + q * s), 'multiplying-with-area-models')); }
      cands.push(mc('digits-without-place-value', lv, R(digitSum(a) * digitSum(b)), 'multiplying-with-area-models'));
      cands.push(mc('left-out-the-ones-piece', lv, R((a - (a % 10)) * b), 'multiplying-with-area-models'));
      const v = r.int(0, 2), text = v === 0 ? say('mult.p.eq', { a, b }) : v === 1 ? say('mult.p.chairs', { a, b }) : say('mult.p.boxes', { a, b });
      return {
        prompt: { html: text }, model: `${a}*${b}`, tags: v ? ['word-problem'] : [],
        answer: { type: 'number', value: ans, form: 'any', help: say('ans.whole') },
        hints, steps, misconceptions: wrongs(ans, cands), canonical: `mult|${Math.min(a, b)}|${Math.max(a, b)}`
      };
    }
  });

  /* =====================================================================
     G5: adding and subtracting fractions with unlike denominators
     ===================================================================== */
  const MULT_PAIRS = [[2, 4], [3, 6], [4, 8], [5, 10], [2, 6], [3, 9], [2, 8]];
  const coprime = (a, b) => gcd(a, b) === 1, divides = (a, b) => a % b === 0 || b % a === 0;
  const properNum = (r, d) => { for (let i = 0; i < 40; i++) { const n = r.int(1, d - 1); if (gcd(n, d) === 1) return n; } return null; };
  make({
    id: 'g5-fraction-sum', version: 1, skillId: 'add-subtract-unlike-fractions', minTimeMs: 3000,
    levels: [
      { desc: 'frac.lv1', dens: 'multiple', ops: ['add'], lt1: true },
      { desc: 'frac.lv2', dens: 'coprime', ops: ['add'], lt1: true },
      { desc: 'frac.lv3', dens: 'unlike', ops: ['add'], lt1: false },
      { desc: 'frac.lv4', dens: 'unlike', ops: ['sub'], lt1: true },
      { desc: 'frac.lv5', dens: 'shared', ops: ['add', 'sub'], lt1: false }
    ],
    build(r, level, K) {
      let d1, d2;
      if (K.dens === 'multiple') { [d1, d2] = r.pick(MULT_PAIRS); if (r.chance(.5)) [d1, d2] = [d2, d1]; }
      else if (K.dens === 'coprime') { d1 = r.int(2, 7); d2 = r.int(2, 7); if (!coprime(d1, d2) || divides(d1, d2)) return null; }
      else if (K.dens === 'unlike') { d1 = r.int(2, 8); d2 = r.int(2, 8); if (d1 === d2 || divides(d1, d2)) return null; }
      else { d1 = r.int(4, 12); d2 = r.int(4, 12); if (d1 === d2 || divides(d1, d2) || coprime(d1, d2)) return null; }
      let n1 = properNum(r, d1), n2 = properNum(r, d2);
      if (!n1 || !n2) return null;
      const op = r.pick(K.ops);
      let f1 = R(n1, d1), f2 = R(n2, d2);
      if (op === 'sub' && rat.cmp(f1, f2) < 0) { [n1, n2, d1, d2] = [n2, n1, d2, d1]; [f1, f2] = [f2, f1]; }
      const ans = op === 'add' ? rat.add(f1, f2) : rat.sub(f1, f2);
      if (ans.d === 1 || rat.cmp(ans, R(0)) <= 0) return null;
      if (K.lt1 && rat.cmp(ans, R(1)) >= 0) return null;
      if (op === 'add' && !K.lt1 && r.chance(.5) && rat.cmp(ans, R(1)) < 0) return null;   /* levels 3 and up: half of the sums are over one */
      const L = lcm(d1, d2), m1 = L / d1, m2 = L / d2, s1 = n1 * m1, s2 = n2 * m2, top = op === 'add' ? s1 + s2 : s1 - s2, sym = op === 'add' ? '+' : '-';
      const T1 = fracTex(f1), T2 = fracTex(f2), lv = 'g5-fraction-sum';
      const steps = [
        say('frac.s1', { d1, d2, L }),
        say('frac.s2', { T1, T2, s1: `\\frac{${s1}}{${L}}`, s2: `\\frac{${s2}}{${L}}`, L }),
        say(op === 'add' ? 'frac.s3add' : 'frac.s3sub', { a: `\\frac{${s1}}{${L}}`, b: `\\frac{${s2}}{${L}}`, r: `\\frac{${top}}{${L}}` })
      ];
      if (gcd(top, L) !== 1 || top > L) steps.push(say('frac.s4', { r: `\\frac{${top}}{${L}}`, ans: mixedTex(ans) }));
      const hints = [say('frac.h1'), say('frac.h2', { d1, d2, L }), say('frac.h3', { T1, T2, s1: `\\frac{${s1}}{${L}}`, s2: `\\frac{${s2}}{${L}}` })];
      const cands = op === 'add'
        ? [mc('added-tops-and-bottoms', lv, R(n1 + n2, d1 + d2), 'adding-fractions-with-unlike-denominators'), mc('forgot-to-rename-the-tops', lv, R(n1 + n2, L), 'adding-fractions-with-unlike-denominators')]
        : [mc('subtracted-tops-and-bottoms', lv, R(n1 - n2, d1 - d2), 'adding-fractions-with-unlike-denominators'), mc('forgot-to-rename-the-tops', lv, R(n1 - n2, L), 'adding-fractions-with-unlike-denominators')];
      const kind = op === 'add' ? (K.lt1 && r.chance(.34) ? 'pizza' : r.chance(.5) ? 'cups' : 'eq') : (r.chance(.5) ? 'ribbon' : 'eq');
      const text = kind === 'eq' ? say(op === 'add' ? 'frac.p.add' : 'frac.p.sub', { T1, T2 }) : say('frac.p.' + kind, { T1, T2 });
      return {
        prompt: { html: text }, model: `${n1}/${d1}${sym}${n2}/${d2}`, tags: kind === 'eq' ? [] : ['word-problem'],
        answer: { type: 'number', value: ans, form: 'simplified', help: say('ans.fraction') },
        hints, steps, misconceptions: wrongs(ans, cands),
        canonical: op === 'add' ? `fsum|${Math.min(n1 / d1, n2 / d2).toFixed(6)}|${Math.max(n1 / d1, n2 / d2).toFixed(6)}` : `fsub|${(n1 / d1).toFixed(6)}|${(n2 / d2).toFixed(6)}`
      };
    }
  });

  /* =====================================================================
     G8: solving one-variable linear equations
     The problem is  A(x + B) = c x + d  or  a x + b = c x + d,  chosen from the solution x.
     ===================================================================== */
  const NZ = (r, lo, hi) => r.intExcept(lo, hi, 0);
  make({
    id: 'g8-linear-equation', version: 1, skillId: 'solve-linear-equations', minTimeMs: 2500,
    levels: [
      { desc: 'lin.lv1' }, { desc: 'lin.lv2' }, { desc: 'lin.lv3' }, { desc: 'lin.lv4' }, { desc: 'lin.lv5' }, { desc: 'lin.lv6' }
    ],
    build(r, level) {
      let x, a, b, c = 0, d, paren = false;
      if (level === 1) { x = r.int(1, 15); a = 1; b = NZ(r, -9, 9); d = x + b; if (d < 1) return null; }
      else if (level === 2) { x = r.int(1, 12); a = r.int(2, 9); b = 0; d = a * x; }
      else if (level === 3) { x = NZ(r, -10, 12); a = r.int(2, 9); b = NZ(r, -15, 15); d = a * x + b; if (abs(d) > 100 || d === 0) return null; }
      else if (level === 4) { x = NZ(r, -10, 10); a = r.int(2, 9); c = r.int(1, 8); if (a === c) return null; b = NZ(r, -12, 12); d = a * x + b - c * x; if (abs(d) > 60 || d === 0) return null; }
      else if (level === 5) { paren = true; x = NZ(r, -9, 12); a = r.int(2, 6); b = NZ(r, -8, 8); d = a * (x + b); if (d === 0 || abs(d) > 80) return null; }
      else { paren = true; x = NZ(r, -8, 8); a = r.pick([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6]); c = NZ(r, -5, 5); if (a === c) return null; b = NZ(r, -8, 8); d = a * (x + b) - c * x; if (abs(d) > 60 || d === 0) return null; }
      const B = paren ? a * b : b, P = a - c, ans = R(x), lv = 'g8-linear-equation';
      if (x + 0 === 0 || (paren && x + b === 0)) return null;
      /* surface form: arrangement of the same equation */
      const plainL = paren ? `${a}*(x${b < 0 ? '-' : '+'}${abs(b)})` : (a === 0 ? '' : `${a === 1 ? '' : a + '*'}x`) + (b === 0 ? '' : `${b < 0 ? '-' : '+'}${abs(b)}`);
      const plainR = (c === 0 ? '' : `${c === 1 ? '' : c === -1 ? '-' : c + '*'}x`) + (c === 0 ? String(d) : d === 0 ? '' : `${d < 0 ? '-' : '+'}${abs(d)}`);
      const flip = !paren && b !== 0 && r.chance(.25), swap = r.chance(.25);
      const L = paren ? parenTex(a, b) : linTex(a, b, 'x', flip), Rr = linTex(c, d, 'x', c !== 0 && r.chance(.25));
      let prompt, tags = [];
      const word = level <= 3 && r.chance(.34);
      if (word) {
        tags = ['word-problem'];
        prompt = level === 1 ? say(b > 0 ? 'lin.w.add' : 'lin.w.sub', { b: abs(b), d }) : level === 2 ? say('lin.w.mul', { a, d }) : say(b > 0 ? 'lin.w.muladd' : 'lin.w.mulsub', { a, b: abs(b), d });
      } else prompt = say('lin.p.solve', { eq: swap ? `${Rr} = ${L}` : `${L} = ${Rr}` });
      /* worked solution */
      const op = n => say(n < 0 ? 'word.add' : 'word.subtract'), steps = [];
      let A = a;
      const k = B;
      if (paren) { steps.push(say('lin.s.distribute', { a, eq: eqTex(a, a * b, c, d) })); }
      if (c !== 0) { steps.push(say('lin.s.xterm', { op: op(c), t: `${abs(c)}x`, eq: eqTex(A - c, k, 0, d) })); A = A - c; }
      if (k !== 0) { steps.push(say('lin.s.const', { op: op(k), t: abs(k), eq: eqTex(A, 0, 0, d - k) })); }
      if (A !== 1) steps.push(say('lin.s.divide', { A, ans: x })); else if (!steps.length) steps.push(say('lin.s.done', { ans: x }));
      const first = paren ? say('lin.h2.distribute', { a }) : c !== 0 ? say('lin.h2.move', { op: op(c), t: `${abs(c)}x` }) : k !== 0 ? say('lin.h2.move', { op: op(k), t: abs(k) }) : say('lin.h2.divide', { A });
      const hints = [say(c !== 0 ? 'lin.h1.both' : paren ? 'lin.h1.paren' : 'lin.h1.one'), first];
      if (A !== 1 && steps.length > 1) hints.push(steps.slice(0, -1).join(' '));
      const cands = [];
      const sol = (num, den) => den === 0 ? null : R(num, den);
      if (b !== 0 && !paren) cands.push(mc('moved-the-number-with-the-wrong-sign', lv, sol(d + b, P), 'solving-equations-with-a-balance'));
      if (paren) cands.push(mc('multiplied-only-the-first-term', lv, sol(d - b, P), 'solving-equations-with-a-balance'));
      if (c !== 0) cands.push(mc('moved-the-x-term-with-the-wrong-sign', lv, sol(d - B, a + c), 'solving-equations-with-a-balance'));
      if (c === 0 && a !== 1 && b !== 0 && !paren) cands.push(mc('divided-only-one-term', lv, R(d, a) && rat.sub(R(d, a), R(b)), 'solving-equations-with-a-balance'));
      if (c === 0 && a !== 1 && !paren) cands.push(mc('forgot-to-divide', lv, R(d - b), 'solving-equations-with-a-balance'));
      if (c === 0 && b === 0 && a !== 1) cands.push(mc('subtracted-instead-of-dividing', lv, R(d - a), 'solving-equations-with-a-balance'));
      const nums = s => (s.match(/\d+(?:\.\d+)?/g) || []);
      return {
        prompt: { html: prompt }, ask: 'solve', tags,
        model: `${plainL}=${plainR}`,
        answer: { type: 'number', value: ans, form: 'any', name: 'x', help: say('ans.number') },
        hints, steps, misconceptions: wrongs(ans, cands),
        canonical: `lin|${[`${a}|${b}|${paren ? 'p' : ''}`, `${c}|${d}`].sort().join('~')}`
      };
    }
  });

  /* =====================================================================
     G8: the Pythagorean theorem (Euclid's formula builds the triples)
     ===================================================================== */
  const PRIM = [[2, 1], [3, 2], [4, 1], [4, 3], [5, 2], [5, 4]];
  make({
    id: 'g8-pythagorean-side', version: 1, skillId: 'pythagorean-side-lengths', minTimeMs: 2500,
    levels: [
      { desc: 'pyth.lv1', prims: 2, kLo: 1, kHi: 1, unknown: 'hyp' },
      { desc: 'pyth.lv2', prims: 2, kLo: 2, kHi: 5, unknown: 'hyp' },
      { desc: 'pyth.lv3', prims: 2, kLo: 1, kHi: 3, unknown: 'leg' },
      { desc: 'pyth.lv4', prims: 6, kLo: 1, kHi: 3, unknown: 'any' },
      { desc: 'pyth.lv5', prims: 3, kLo: 1, kHi: 4, unknown: 'word' }
    ],
    build(r, level, K) {
      const [m, n] = r.pick(PRIM.slice(0, K.prims)), k = r.int(K.kLo, K.kHi);
      let a = k * (m * m - n * n), b = k * 2 * m * n; const c = k * (m * m + n * n);
      if (r.chance(.5)) [a, b] = [b, a];
      if (c > 100 || a === b) return null;
      const unknown = K.unknown === 'hyp' ? 'c' : K.unknown === 'leg' ? r.pick(['a', 'b']) : r.pick(['a', 'b', 'c']);
      const lv = 'g8-pythagorean-side', figure = { kind: 'right-triangle', legs: [a, b], hyp: c, unknown };
      const known = unknown === 'a' ? b : a, ans = R(unknown === 'c' ? c : unknown === 'a' ? a : b);
      const models = unknown === 'c' ? `sqrt(${a}^2+${b}^2)` : `sqrt(${c}^2-${known}^2)`;
      let text, tags = [];
      if (K.unknown === 'word') {
        tags = ['word-problem'];
        const w = r.int(0, 2);
        if (w === 0 && unknown !== 'c') text = say('pyth.p.ladder', { c, a: known });
        else if (w === 1 && unknown === 'c') text = say('pyth.p.tv', { a, b });
        else if (unknown === 'c') text = say('pyth.p.wire', { a, b });
        else text = say('pyth.p.ladder', { c, a: known });
      } else text = unknown === 'c' ? say('pyth.p.hyp', { a, b }) : say('pyth.p.leg', { c, a: known });
      const steps = unknown === 'c'
        ? [say('pyth.s.theorem'), say('pyth.s.hyp1', { a, b }), say('pyth.s.hyp2', { a2: a * a, b2: b * b, sum: a * a + b * b }), say('pyth.s.hyp3', { sum: a * a + b * b, ans: c })]
        : [say('pyth.s.theorem'), say('pyth.s.leg1', { k: known, c }), say('pyth.s.leg2', { k2: known * known, c2: c * c }), say('pyth.s.leg3', { k2: known * known, c2: c * c, diff: c * c - known * known }), say('pyth.s.leg4', { diff: c * c - known * known, ans: ans.n })];
      const hints = [say(unknown === 'c' ? 'pyth.h1.hyp' : 'pyth.h1.leg'), steps[1], steps[2]];
      const cands = unknown === 'c'
        ? [mc('added-the-legs', lv, R(a + b), 'pythagorean-theorem'), mc('forgot-the-square-root', lv, R(a * a + b * b), 'pythagorean-theorem')]
        : [mc('subtracted-the-lengths', lv, R(c - known), 'pythagorean-theorem'), mc('forgot-the-square-root', lv, R(c * c - known * known), 'pythagorean-theorem')];
      return {
        prompt: { html: text }, model: models, tags, figure,
        answer: { type: 'number', value: ans, form: 'any', units: ['units', 'unit', 'ft', 'feet', 'foot', 'cm', 'm', 'meters', 'metres', 'in', 'inches'], help: say('ans.length') },
        hints, steps, misconceptions: wrongs(ans, cands), canonical: `pyth|${Math.min(a, b)}|${Math.max(a, b)}|${unknown === 'c' ? 'c' : 'leg'}`
      };
    }
  });

  /* =====================================================================
     A1: solving a system of two linear equations (the solution point is chosen first)
     ===================================================================== */
  const sysTex = (a, b, c) => `${coefTex(a, 'x')} ${b < 0 ? '-' : '+'} ${coefTex(abs(b), 'y')} = ${c}`;
  const pc = (c, v) => (c === 1 ? v : `${c}*${v}`);
  const sysPlain = (a, b, c) => `${a < 0 ? '-' : ''}${pc(abs(a), 'x')}${b < 0 ? '-' : '+'}${pc(abs(b), 'y')}=${c}`;
  make({
    id: 'a1-system-solve', version: 1, skillId: 'solve-linear-systems', minTimeMs: 4000,
    levels: [{ desc: 'sys.lv1' }, { desc: 'sys.lv2' }, { desc: 'sys.lv3' }, { desc: 'sys.lv4' }, { desc: 'sys.lv5' }],
    build(r, level) {
      let x, y, e1, e2, m, k;
      if (level <= 3) { x = r.int(1, 8); y = r.int(1, 8); } else if (level === 4) { x = NZ(r, -4, 8); y = NZ(r, -4, 8); } else { x = NZ(r, -8, 8); y = NZ(r, -8, 8); }
      if (level === 1) {
        m = NZ(r, -3, 3); k = y - m * x; if (abs(k) > 15 || k === 0) return null;
        const a = r.int(1, 4), b = r.int(1, 4), c = a * x + b * y;
        if (m * b + a === 0 || c > 40) return null;
        e1 = { form: 'slope', m, k }; e2 = { a, b, c };
      } else {
        let a1, b1, a2, b2;
        if (level === 2) { a1 = r.int(1, 5); a2 = r.int(1, 5); b1 = r.int(1, 4); b2 = -b1; }
        else if (level === 3) { a1 = r.int(1, 5); a2 = r.int(1, 5); b1 = r.int(1, 4); b2 = b1 * r.pick([2, 3]); }
        else if (level === 4) { a1 = r.int(1, 5); a2 = r.int(1, 5); b1 = r.int(2, 5); b2 = r.int(2, 5); if (b1 === b2 || b1 % b2 === 0 || b2 % b1 === 0) return null; }
        else { a1 = NZ(r, -6, 6); a2 = NZ(r, -6, 6); b1 = NZ(r, -6, 6); b2 = NZ(r, -6, 6); if (abs(b1) === abs(b2) || abs(b1) === 1 || abs(b2) === 1 || b1 % b2 === 0 || b2 % b1 === 0) return null; }
        if (a1 * b2 - a2 * b1 === 0) return null;
        const c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y;
        if (abs(c1) > 60 || abs(c2) > 60) return null;
        e1 = { a: a1, b: b1, c: c1 }; e2 = { a: a2, b: b2, c: c2 };
      }
      const lv = 'a1-system-solve', swap = r.chance(.5), ans = [R(x), R(y)];
      const eqs = [level === 1 ? { tex: `y = ${linTex(m, k)}`, plain: `y=${m < 0 ? '-' : ''}${pc(abs(m), 'x')}${k < 0 ? '-' : '+'}${abs(k)}` } : { tex: sysTex(e1.a, e1.b, e1.c), plain: sysPlain(e1.a, e1.b, e1.c) },
        { tex: sysTex(e2.a, e2.b, e2.c), plain: sysPlain(e2.a, e2.b, e2.c) }];
      const ordered = swap && level !== 1 ? [eqs[1], eqs[0]] : eqs;
      const prompt = say('sys.p.solve', { e1: ordered[0].tex, e2: ordered[1].tex });
      let steps, hints;
      if (level === 1) {
        const { a, b, c } = e2, A = a + b * m, C = c - b * k;
        const rhs = linTex(m, k);
        steps = [
          say('sys.s.sub1', { rhs: `y = ${rhs}`, eq: `${coefTex(a, 'x')} + ${b === 1 ? '' : b}(${rhs}) = ${c}` }),
          say('sys.s.sub2', { eq: eqTex(A, b * k, 0, c) }),
          say('sys.s.sub3', { eq: `${coefTex(A, 'x')} = ${C}`, x }),
          say('sys.s.sub4', { calc: `y = ${m === 1 ? '' : m === -1 ? '-' : m + '\\cdot '}${sgn(x)}${k === 0 ? '' : (k < 0 ? ' - ' : ' + ') + abs(k)} = ${y}` }),
          say('sys.s.done', { x, y })
        ];
        hints = [say('sys.h1.sub'), steps[0], steps[1]];
      } else {
        const { a: a1, b: b1, c: c1 } = e1, { a: a2, b: b2, c: c2 } = e2, Lc = lcm(abs(b1), abs(b2)), m1 = Lc / abs(b1), m2 = Lc / abs(b2);
        const s1 = { a: a1 * m1, b: b1 * m1, c: c1 * m1 }, s2 = { a: a2 * m2, b: b2 * m2, c: c2 * m2 };
        const add = s1.b === -s2.b, A = add ? s1.a + s2.a : s1.a - s2.a, C = add ? s1.c + s2.c : s1.c - s2.c;
        steps = [
          say('sys.s.pick', { b1, b2, L: Lc }),
          m1 === 1 && m2 === 1 ? say('sys.s.keep', { e1: sysTex(s1.a, s1.b, s1.c), e2: sysTex(s2.a, s2.b, s2.c) })
            : say('sys.s.scale', { m1, m2, e1: sysTex(s1.a, s1.b, s1.c), e2: sysTex(s2.a, s2.b, s2.c) }),
          say(add ? 'sys.s.add' : 'sys.s.subtract', { eq: `${coefTex(A, 'x')} = ${C}`, x }),
          say('sys.s.back', { x, eq: `${coefTex(b1, 'y')} = ${c1 - a1 * x}`, y }),
          say('sys.s.done', { x, y })
        ];
        hints = [say('sys.h1.elim'), steps[1], steps[2].replace(/, so .*$/, '.')];
      }
      const cands = [];
      cands.push({ id: 'swapped-the-order', wrongAnswer: [R(y), R(x)] });
      cands.push({ id: 'sign-slip-on-y', wrongAnswer: [R(x), R(-y)] });
      cands.push({ id: 'sign-slip-on-x', wrongAnswer: [R(-x), R(y)] });
      const miscs = [];
      for (const cd of cands) {
        if (cd.wrongAnswer.every((v, i) => rat.eq(v, ans[i])) || miscs.some(o => o.wrongAnswer.every((v, i) => rat.eq(v, cd.wrongAnswer[i])))) continue;
        miscs.push({ id: cd.id, wrongAnswer: cd.wrongAnswer, feedback: say(`${lv}.mc.${cd.id}`), lessonLink: level === 1 ? 'solving-systems-by-substitution' : 'solving-systems-by-elimination' });
      }
      const key = q => (q.a !== undefined ? `${q.a},${q.b},${q.c}` : `s${q.m},${q.k}`);
      return {
        prompt: { html: prompt }, model: ordered.map(e => e.plain).join(';'),
        answer: { type: 'pair', value: ans, help: say('ans.pair') },
        hints, steps, misconceptions: miscs, canonical: `sys|${[key(e1), key(e2)].sort().join('|')}`
      };
    }
  });
}
