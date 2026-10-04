/* =====================================================================
   PRACTICE (generators, part 2): the easiest skills to build exactly: whole-number division, rectangles, decimals, order of
   operations, integers, percent of a number, and the mean. Same contract as generators.js. `implicit` lists numbers that
   appear in the model but not in the text (the 100 in a percent, the count in a mean), so the verifier can still compare
   the printed numbers with the model's.
   ===================================================================== */
{
  const { make, wrongs, mc, abs, join, pieces, fracTex } = Practice.kit;
  const { R, rat, gcd, say } = Practice;
  const dec = (i, p) => { if (!p) return String(i); const s = String(abs(i)).padStart(p + 1, '0'); return (i < 0 ? '-' : '') + s.slice(0, -p) + '.' + s.slice(-p); };

  /* ---------------- G4: division by a one-digit number (exact) ---------------- */
  make({
    id: 'g4-divide', version: 1, skillId: 'divide-multi-digit', minTimeMs: 2000,
    levels: [
      { desc: 'div.lv1', dLo: 2, dHi: 5, qLo: 11, qHi: 19, zeros: 'none' },
      { desc: 'div.lv2', dLo: 2, dHi: 5, qLo: 21, qHi: 99, zeros: 'none' },
      { desc: 'div.lv3', dLo: 6, dHi: 9, qLo: 21, qHi: 99, zeros: 'none' },
      { desc: 'div.lv4', dLo: 3, dHi: 9, qLo: 101, qHi: 499, zeros: 'none' },
      { desc: 'div.lv5', dLo: 3, dHi: 9, qLo: 101, qHi: 999, zeros: 'inside' }
    ],
    build(r, level, K) {
      const d = r.int(K.dLo, K.dHi), q = r.int(K.qLo, K.qHi), a = q * d, qs = String(q);
      if (K.zeros === 'none' && qs.includes('0')) return null;
      if (K.zeros === 'inside' && !(qs.length === 3 && qs[1] === '0' && qs[2] !== '0')) return null;
      const lv = 'g4-divide', ps = pieces(q), ans = R(q);
      const rows = ps.map(p => `\\(${d} \\times ${p} = ${d * p}\\)`);
      const steps = [say('div.s1', { d, list: join(rows) }), say('div.s2', { a, sum: ps.map(p => d * p).join(' + ') }), say('div.s3', { a, d, sum: ps.join(' + '), q })];
      const hints = [say('div.h1', { d }), say('div.h2', { d, p: ps[0], prod: d * ps[0], left: a - d * ps[0] }), say('div.h3', { list: join(ps.map(p => `\\(${p}\\)`)) })];
      const cands = [mc('multiplied-instead-of-dividing', lv, R(a * d), null), mc('subtracted-instead-of-dividing', lv, R(a - d), null), mc('answer-ten-times-too-big', lv, R(q * 10), null)];
      if (qs.includes('0')) cands.push(mc('dropped-the-zero', lv, R(+qs.replace(/0/g, '')), null));
      const v = r.int(0, 2), text = v === 0 ? say('div.p.eq', { a, d }) : v === 1 ? say('div.p.stickers', { a, d }) : say('div.p.boxes', { a, d });
      return { prompt: { html: text }, model: `${a}/${d}`, tags: v ? ['word-problem'] : [], answer: { type: 'number', value: ans, form: 'any', help: say('ans.whole') }, hints, steps, misconceptions: wrongs(ans, cands), canonical: `div|${a}|${d}` };
    }
  });

  /* ---------------- G4: perimeter and area of rectangles ---------------- */
  const UNITS = ['centimeters', 'meters', 'feet', 'inches'];
  make({
    id: 'g4-rectangle', version: 1, skillId: 'perimeter-area-rectangles', minTimeMs: 2000,
    levels: [
      { desc: 'rect.lv1', kinds: ['area'], lLo: 3, lHi: 9, wLo: 2, wHi: 6 },
      { desc: 'rect.lv2', kinds: ['perim'], lLo: 3, lHi: 9, wLo: 2, wHi: 6 },
      { desc: 'rect.lv3', kinds: ['area', 'perim'], lLo: 8, lHi: 25, wLo: 5, wHi: 15 },
      { desc: 'rect.lv4', kinds: ['missA'], lLo: 3, lHi: 15, wLo: 2, wHi: 12 },
      { desc: 'rect.lv5', kinds: ['missP'], lLo: 5, lHi: 20, wLo: 3, wHi: 14 }
    ],
    build(r, level, K) {
      let l = r.int(K.lLo, K.lHi), w = r.int(K.wLo, K.wHi);
      if (l === w) return null;
      if (level >= 3 && l < w) [l, w] = [w, l];
      const kind = r.pick(K.kinds), u = r.pick(UNITS), A = l * w, P = 2 * (l + w), lv = 'g4-rectangle', link = 'area-by-decomposition';
      let text, model, ans, steps, hints, cands, fig, implicit = [];
      if (kind === 'area') {
        text = say('rect.p.area', { l, w, u }); model = `${l}*${w}`; ans = R(A); fig = { kind: 'rectangle', l, w, unknown: null, center: say('rect.c.area.q') };
        steps = [say('rect.s.area', { l, w, A })]; hints = [say('rect.h1.area'), say('rect.h2.area', { l, w })];
        cands = [mc('added-instead-of-multiplying', lv, R(l + w), link), mc('found-the-perimeter', lv, R(P), link)];
      } else if (kind === 'perim') {
        text = say('rect.p.perim', { l, w, u }); model = `2*(${l}+${w})`; implicit = ['2']; ans = R(P); fig = { kind: 'rectangle', l, w, unknown: null, center: say('rect.c.perim.q') };
        steps = [say('rect.s.perim1', { l, w, s: l + w }), say('rect.s.perim2', { s: l + w, P })]; hints = [say('rect.h1.perim'), say('rect.h2.perim', { l, w })];
        cands = [mc('added-just-two-sides', lv, R(l + w), null), mc('found-the-area', lv, R(A), null)];
      } else if (kind === 'missA') {
        text = say('rect.p.missA', { A, w, u }); model = `${A}/${w}`; ans = R(l); fig = { kind: 'rectangle', l, w, unknown: 'l', center: say('rect.c.area', { A }) };
        steps = [say('rect.s.missA1', { A, w }), say('rect.s.missA2', { A, w, l })]; hints = [say('rect.h1.missA'), say('rect.h2.missA', { A, w })];
        cands = [mc('multiplied-instead-of-dividing', lv, R(A * w), link), mc('subtracted-instead-of-dividing', lv, R(A - w), link)];
      } else {
        text = say('rect.p.missP', { P, l, u }); model = `(${P}-2*${l})/2`; implicit = ['2']; ans = R(w); fig = { kind: 'rectangle', l, w, unknown: 'w', center: say('rect.c.perim', { P }) };
        steps = [say('rect.s.missP1', { P, l, rest: P - 2 * l }), say('rect.s.missP2', { rest: P - 2 * l, w })]; hints = [say('rect.h1.missP'), say('rect.h2.missP', { P, l })];
        cands = [mc('forgot-to-halve', lv, R(P - 2 * l), null), mc('took-away-only-one-length', lv, R(P - l, 2), null)];
      }
      return { prompt: { html: text }, model, implicit, figure: fig, answer: { type: 'number', value: ans, form: 'any', units: ['cm', 'm', 'ft', 'in', 'feet', 'inches', 'centimeters', 'meters', 'square', 'sq', 'units'], help: say('ans.length') },
        hints, steps, misconceptions: wrongs(ans, cands), canonical: `rect|${kind}|${Math.min(l, w)}|${Math.max(l, w)}`, tags: [] };
    }
  });

  /* ---------------- G5: adding and subtracting decimals ---------------- */
  make({
    id: 'g5-decimals', version: 1, skillId: 'add-subtract-decimals', minTimeMs: 2500,
    levels: [
      { desc: 'dec.lv1', ops: ['add'], pa: [1], pb: [1], whole: 0 },
      { desc: 'dec.lv2', ops: ['add'], pa: [2], pb: [2], whole: 0 },
      { desc: 'dec.lv3', ops: ['add'], pa: [1, 2], pb: [1, 2], whole: 9, differ: true },
      { desc: 'dec.lv4', ops: ['sub'], pa: [0, 1, 2], pb: [1, 2], whole: 9, differ: true },
      { desc: 'dec.lv5', ops: ['add', 'sub'], pa: [1, 2, 3], pb: [2, 3], whole: 9, differ: true }
    ],
    build(r, level, K) {
      const pa = r.pick(K.pa), pb = r.pick(K.pb);
      if (K.differ && pa === pb) return null;
      const mk = (p, whole) => { const v = r.int(1, whole * 10 ** p + 10 ** p - 1); return v; };
      let ia = mk(pa, K.whole), ib = mk(pb, K.whole);
      if (pa > 0 && ia % 10 === 0) return null; if (pb > 0 && ib % 10 === 0) return null;   /* no trailing zero */
      if (pa === 0) ia = r.int(2, 9);
      const P = Math.max(pa, pb), sa = ia * 10 ** (P - pa), sb = ib * 10 ** (P - pb), op = r.pick(K.ops);
      if (op === 'sub' && sa <= sb) return null;
      const top = op === 'add' ? sa + sb : sa - sb, ans = R(top, 10 ** P), sym = op === 'add' ? '+' : '-', a = dec(ia, pa), b = dec(ib, pb), lv = 'g5-decimals';
      const unit = say('dec.unit' + P), pad = (i, p) => dec(i * 10 ** (P - p), P);
      const steps = [say('dec.s1', { P, A: pad(ia, pa), B: pad(ib, pb) }), say(op === 'add' ? 'dec.s2add' : 'dec.s2sub', { sa, sb, top, unit }), say('dec.s3', { top, unit, ans: dec(top, P) })];
      const hints = [say('dec.h1'), say('dec.h2', { P, A: pad(ia, pa), B: pad(ib, pb) })];
      const cands = [mc('misplaced-the-decimal-point', lv, rat.mul(ans, R(10)), 'decimals-and-place-value')];
      if (pa !== pb) cands.unshift(mc('added-as-whole-numbers', lv, R(op === 'add' ? ia + ib : abs(ia - ib), 10 ** P), 'decimals-and-place-value'));
      const kind = op === 'add' ? (r.chance(.5) ? 'run' : 'eq') : (r.chance(.5) ? 'board' : 'eq');
      const text = kind === 'eq' ? say(op === 'add' ? 'dec.p.add' : 'dec.p.sub', { a, b }) : say('dec.p.' + kind, { a, b });
      return { prompt: { html: text }, model: `${a}${sym}${b}`, tags: kind === 'eq' ? [] : ['word-problem'], answer: { type: 'number', value: ans, form: 'any', display: 'decimal', help: say('ans.decimal') },
        hints, steps, misconceptions: wrongs(ans, cands), canonical: op === 'add' ? `dadd|${Math.min(sa, sb)}|${Math.max(sa, sb)}|${P}` : `dsub|${sa}|${sb}|${P}` };
    }
  });

  /* ---------------- G5: order of operations ---------------- */
  /* An expression is an array of tokens: numbers, + - * / and ( ). */
  const OO = {
    flat(tk, mode) {     /* evaluate a bracket-free token list; null when it leaves the whole numbers */
      let t = tk.slice();
      if (mode === 'prec') {
        for (let i = 1; i < t.length;) {
          if (t[i] === '*' || t[i] === '/') {
            const v = t[i] === '*' ? t[i - 1] * t[i + 1] : (t[i + 1] !== 0 && t[i - 1] % t[i + 1] === 0 ? t[i - 1] / t[i + 1] : null);
            if (v === null) return null; t.splice(i - 1, 3, v);
          } else i += 2;
        }
      }
      let acc = t[0];
      for (let i = 1; i < t.length; i += 2) {
        const o = t[i], x = t[i + 1];
        acc = o === '+' ? acc + x : o === '-' ? acc - x : o === '*' ? acc * x : (x !== 0 && acc % x === 0 ? acc / x : null);
        if (acc === null || acc < 0) return null;
      }
      return acc;
    },
    value(tk, mode = 'prec') {
      if (mode === 'nobr') tk = tk.filter(x => x !== '(' && x !== ')');
      let t = tk.slice();
      for (;;) {
        const close = t.indexOf(')');
        if (close < 0) break;
        const open = t.lastIndexOf('(', close), v = OO.flat(t.slice(open + 1, close), mode === 'nobr' ? 'prec' : mode);
        if (v === null) return null; t.splice(open, close - open + 1, v);
      }
      return OO.flat(t, mode === 'nobr' ? 'prec' : mode);
    },
    /* one step of the worked solution: [newTokens, kind] */
    reduce(tk) {
      let t = tk.slice();
      const close = t.indexOf(')');
      if (close >= 0) {
        const open = t.lastIndexOf('(', close), inner = t.slice(open + 1, close);
        if (inner.length === 1) { t.splice(open, 3, inner[0]); return [t, 'oo.s.unbracket']; }
        const [r, kind] = OO.reduce(inner); t.splice(open + 1, close - open - 1, ...r); return [t, 'oo.s.brackets-' + kind];
      }
      for (let i = 1; i < t.length; i += 2) if (t[i] === '*' || t[i] === '/') { const v = t[i] === '*' ? t[i - 1] * t[i + 1] : t[i - 1] / t[i + 1]; t.splice(i - 1, 3, v); return [t, 'muldiv']; }
      const v = t[1] === '+' ? t[0] + t[2] : t[0] - t[2]; t.splice(0, 3, v); return [t, 'addsub'];
    },
    tex: tk => tk.map(x => x === '*' ? '\\times' : x === '/' ? '\\div' : x).join(' ').replace(/\( /g, '(').replace(/ \)/g, ')'),
    plain: tk => tk.join('')
  };
  const T_OO = [
    [['n', '+', 'n', '*', 'n'], ['n', '*', 'n', '+', 'n'], ['n', '*', 'n', '-', 'n'], ['n', '-', 'n', '*', 'n']],
    [['n', '-', 'n', '/', 'n'], ['n', '/', 'n', '+', 'n'], ['n', '+', 'n', '/', 'n'], ['n', '*', 'n', '/', 'n', '+', 'n']],
    [['(', 'n', '+', 'n', ')', '*', 'n'], ['n', '*', '(', 'n', '-', 'n', ')'], ['(', 'n', '+', 'n', ')', '/', 'n'], ['n', '+', '(', 'n', '+', 'n', ')', '*', 'n']],
    [['n', '+', 'n', '*', 'n', '-', 'n'], ['n', '*', 'n', '-', 'n', '*', 'n'], ['(', 'n', '+', 'n', ')', '*', 'n', '-', 'n'], ['n', '*', 'n', '+', 'n', '/', 'n']],
    [['n', '*', '(', 'n', '+', 'n', '*', 'n', ')'], ['(', 'n', '+', 'n', ')', '*', '(', 'n', '-', 'n', ')'], ['n', '+', '(', 'n', '-', 'n', ')', '*', 'n', '/', 'n']]
  ];
  make({
    id: 'g5-order-of-operations', version: 1, skillId: 'order-of-operations', minTimeMs: 2500,
    levels: [{ desc: 'oo.lv1' }, { desc: 'oo.lv2' }, { desc: 'oo.lv3' }, { desc: 'oo.lv4' }, { desc: 'oo.lv5' }],
    build(r, level) {
      const tpl = r.pick(T_OO[level - 1]), tk = tpl.map(x => (x === 'n' ? r.int(2, 12) : x));
      const ans = OO.value(tk);
      if (ans === null || ans < 2 || ans > 300) return null;
      const ltr = OO.value(tk, 'ltr'), nobr = tk.includes('(') ? OO.value(tk, 'nobr') : null, lv = 'g5-order-of-operations';
      if ((ltr === null || ltr === ans) && (nobr === null || nobr === ans)) return null;   /* the trap must be real */
      const steps = []; let cur = tk;
      while (cur.length > 1) { const [nx, kind] = OO.reduce(cur); steps.push(say(kind.startsWith('oo.s.') ? kind : 'oo.s.' + kind, kind.startsWith('oo.s.brackets-') ? { expr: OO.tex(nx) } : { expr: OO.tex(nx) })); cur = nx; }
      const hints = [say('oo.h1'), say('oo.h2', { first: say(tk.includes('(') ? 'oo.first.brackets' : tk.some(x => x === '*' || x === '/') ? 'oo.first.muldiv' : 'oo.first.addsub') })];
      if (steps.length > 2) hints.push(steps.slice(0, -1).join(' '));
      const cands = [mc('went-left-to-right', lv, ltr === null ? null : R(ltr), null), mc('ignored-the-brackets', lv, nobr === null ? null : R(nobr), null)];
      return { prompt: { html: say('oo.p', { tex: OO.tex(tk) }) }, model: OO.plain(tk), answer: { type: 'number', value: R(ans), form: 'any', help: say('ans.whole') }, hints, steps, misconceptions: wrongs(R(ans), cands), canonical: 'oo|' + OO.plain(tk), tags: [] };
    }
  });

  /* ---------------- G7: adding and subtracting integers ---------------- */
  const sgnTex = n => (n < 0 ? `(${n})` : String(n));
  make({
    id: 'g7-integers', version: 1, skillId: 'add-subtract-integers', minTimeMs: 2000,
    levels: [{ desc: 'int.lv1' }, { desc: 'int.lv2' }, { desc: 'int.lv3' }, { desc: 'int.lv4' }, { desc: 'int.lv5' }],
    build(r, level) {
      const NZr = (lo, hi) => r.intExcept(lo, hi, 0);
      let t, ops;
      if (level === 1) { t = [r.int(-9, -1), r.int(1, 9)]; ops = ['+']; if (r.chance(.4)) { t = [r.int(1, 9), r.int(-9, -1)]; } }
      else if (level === 2) { t = [r.int(1, 9), r.int(1, 12)]; ops = ['-']; if (t[1] <= t[0]) return null; if (r.chance(.4)) t = [r.int(-9, -1), r.int(1, 9)]; }
      else if (level === 3) { t = [r.int(-9, -1), r.int(-9, -1)]; ops = [r.pick(['+', '-'])]; }
      else if (level === 4) { t = [NZr(-25, 25), NZr(-25, 25)]; ops = [r.pick(['+', '-'])]; }
      else { t = [NZr(-15, 15), NZr(-15, 15), NZr(-15, 15)]; ops = [r.pick(['+', '-']), r.pick(['+', '-'])]; }
      const run = (ts, os, f = x => x) => ts.slice(1).reduce((acc, x, i) => (os[i] === '+' ? acc + f(x) : acc - f(x)), ts[0]);
      const ans = run(t, ops);
      if (ans === 0) return null;
      const tex = t.map((x, i) => (i === 0 ? String(x) : `${ops[i - 1]} ${sgnTex(x)}`)).join(' '), plain = t.map((x, i) => (i === 0 ? String(x) : `${ops[i - 1]}${x < 0 ? '(' + x + ')' : x}`)).join(''), lv = 'g7-integers';
      const steps = []; let acc = t[0];
      t.slice(1).forEach((x, i) => {
        const o = ops[i], right = (o === '+') === (x > 0);
        if (o === '-' && x < 0) steps.push(say('int.s.flip', { t: sgnTex(x), n: abs(x) }));
        const res = o === '+' ? acc + x : acc - x;
        steps.push(say('int.s.move', { acc, dir: say(right ? 'int.right' : 'int.left'), n: abs(x), res }));
        acc = res;
      });
      const o0 = ops[0], x0 = t[1], right0 = (o0 === '+') === (x0 > 0);
      const hints = [say('int.h1'), say('int.h2', { acc: t[0], dir: say(right0 ? 'int.right' : 'int.left'), n: abs(x0) })];
      const cands = [mc('sign-of-the-answer-flipped', lv, R(-ans), 'negative-numbers-and-absolute-value'), mc('ignored-the-negative-signs', lv, R(run(t.map(abs), ops)), 'negative-numbers-and-absolute-value'),
        mc('subtracting-a-negative-as-a-plain-subtract', lv, R(t.slice(1).reduce((a, x, i) => (ops[i] === '+' ? a + x : a - abs(x)), t[0])), 'negative-numbers-and-absolute-value')];
      const word = level <= 2 && t.length === 2 && x0 > 0 && r.chance(.4);
      const text = word ? say(o0 === '+' ? 'int.p.rise' : 'int.p.fall', { a: t[0], b: x0 }) : say('int.p.eval', { tex });
      return { prompt: { html: text }, model: plain, tags: word ? ['word-problem'] : [], answer: { type: 'number', value: R(ans), form: 'any', help: say('ans.integer') }, hints, steps, misconceptions: wrongs(R(ans), cands), canonical: 'int|' + plain };
    }
  });

  /* ---------------- G6: percent of a number, the percent, and the whole ---------------- */
  make({
    id: 'g6-percent', version: 1, skillId: 'percent-of-a-number', minTimeMs: 2500,
    levels: [
      { desc: 'pct.lv1', kind: 'of', ps: [10, 25, 50] }, { desc: 'pct.lv2', kind: 'of', ps: [20, 30, 40, 60, 70, 80, 90] }, { desc: 'pct.lv3', kind: 'of', ps: [5, 15, 35, 45, 75] },
      { desc: 'pct.lv4', kind: 'percent', ps: [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80] }, { desc: 'pct.lv5', kind: 'whole', ps: [10, 20, 25, 30, 40, 50, 60, 75] }
    ],
    build(r, level, K) {
      const p = r.pick(K.ps), n = r.int(2, 40) * 10;
      if ((p * n) % 100 !== 0) return null;
      const part = p * n / 100, lv = 'g6-percent', link = 'percents-on-tape-and-number-lines';
      let text, model, ans, steps, hints, cands, tags = [], v = r.int(0, 1);
      if (K.kind === 'of') {
        text = v ? say(r.chance(.5) ? 'pct.p.class' : 'pct.p.shirt', { p, n }) : say('pct.p.of', { p, n }); if (v) tags = ['word-problem'];
        model = `${p}*${n}/100`; ans = R(part);
        steps = [say('pct.s.of1', { p }), say('pct.s.of2', { n, p, part, frac: `\\frac{${n * p}}{100}` })];
        hints = [say('pct.h1.of'), say('pct.h2.of', { p, n })];
        cands = [mc('forgot-to-divide-by-100', lv, R(p * n), link), mc('divided-by-the-percent-number', lv, R(n, p), link), mc('used-the-percent-as-the-answer', lv, R(p), link)];
      } else if (K.kind === 'percent') {
        text = v ? say('pct.p.walk', { n, part }) : say('pct.p.what', { n, part }); if (v) tags = ['word-problem'];
        model = `${part}/${n}*100`; ans = R(p);
        const g = gcd(part, n);
        steps = [say('pct.s.pc1', { part, n }), say('pct.s.pc2', { p }), say('pct.s.pc3', { p })];
        hints = [say('pct.h1.pc'), say('pct.h2.pc', { part, n })];
        cands = [mc('inverted-the-fraction', lv, R(n * 100, part), link), mc('gave-the-decimal-not-the-percent', lv, R(part, n), link), mc('gave-the-part-as-the-percent', lv, R(part), link)];
      } else {
        text = v ? say('pct.p.sale', { p, part }) : say('pct.p.whole', { p, part }); if (v) tags = ['word-problem'];
        model = `${part}*100/${p}`; ans = R(n);
        steps = [say('pct.s.wh1', { p, part }), say('pct.s.wh2', { part, p, n })];
        hints = [say('pct.h1.wh'), say('pct.h2.wh', { p, part })];
        cands = [mc('found-the-percent-of-the-part', lv, R(part * p, 100), link), mc('divided-by-100-only', lv, R(part, 100), link), mc('used-the-percent-as-the-whole', lv, R(p), link)];
      }
      return { prompt: { html: text }, model, implicit: ['100'], tags, answer: { type: 'number', value: ans, form: 'any', units: ['%', 'percent'], help: say(K.kind === 'percent' ? 'ans.percent' : 'ans.number') }, hints, steps, misconceptions: wrongs(ans, cands), canonical: `pct|${K.kind}|${p}|${n}` };
    }
  });

  /* ---------------- G6: the mean of a data set ---------------- */
  make({
    id: 'g6-mean', version: 1, skillId: 'mean-of-a-data-set', minTimeMs: 3000,
    levels: [
      { desc: 'mean.lv1', n: [3, 3], hi: 20, dev: 5 }, { desc: 'mean.lv2', n: [4, 5], hi: 30, dev: 8 }, { desc: 'mean.lv3', n: [5, 6], hi: 100, dev: 25 },
      { desc: 'mean.lv4', n: [4, 6], hi: 100, dev: 20, missing: true }, { desc: 'mean.lv5', n: [6, 8], hi: 100, dev: 35 }
    ],
    build(r, level, K) {
      const n = r.int(K.n[0], K.n[1]), m = r.int(Math.max(3, Math.floor(K.dev / 2)), K.hi - Math.floor(K.dev / 2));
      let devs = []; for (let i = 0; i < n - 1; i++) devs.push(r.int(-K.dev, K.dev));
      devs.push(-devs.reduce((t, x) => t + x, 0));
      const vals = devs.map(d => m + d);
      if (vals.some(x => x < 0 || x > K.hi + K.dev) || new Set(vals).size < 2) return null;
      for (let i = vals.length - 1; i > 0; i--) { const j = r.int(0, i); [vals[i], vals[j]] = [vals[j], vals[i]]; }
      const sum = vals.reduce((t, x) => t + x, 0), lv = 'g6-mean', link = 'mean-median-and-spread';
      let text, model, ans, steps, hints, cands, tags = [];
      if (K.missing) {
        const known = vals.slice(0, -1), x = vals[vals.length - 1], ks = sum - x;
        text = say('mean.p.missing', { n, m, list: known.join(', ') }); model = `${n}*${m}-(${known.join('+')})`; ans = R(x);
        steps = [say('mean.s.m1', { n, m, total: n * m }), say('mean.s.m2', { sum: known.join(' + '), ks }), say('mean.s.m3', { total: n * m, ks, x })];
        hints = [say('mean.h1.m'), say('mean.h2.m', { n, m })];
        cands = [mc('found-the-mean-of-the-known-scores', lv, R(ks, n - 1), link), mc('forgot-to-subtract-the-known-scores', lv, R(n * m), link)];
      } else {
        const word = r.chance(.5); if (word) tags = ['word-problem'];
        text = word ? say(r.chance(.5) ? 'mean.p.games' : 'mean.p.quiz', { n, list: vals.join(', ') }) : say('mean.p.eq', { list: vals.join(', ') });
        model = `(${vals.join('+')})/${n}`; ans = R(m);
        const sorted = vals.slice().sort((a, b) => a - b), med = n % 2 ? R(sorted[(n - 1) / 2]) : R(sorted[n / 2 - 1] + sorted[n / 2], 2);
        steps = [say('mean.s.a1', { sum: vals.join(' + '), total: sum }), say('mean.s.a2', { total: sum, n, m })];
        hints = [say('mean.h1'), say('mean.h2', { n })];
        cands = [mc('forgot-to-divide', lv, R(sum), link), mc('divided-by-the-wrong-count', lv, R(sum, n - 1), link), mc('gave-the-median', lv, med, link)];
      }
      return { prompt: { html: text }, model, implicit: [String(n)], tags, answer: { type: 'number', value: ans, form: 'any', help: say('ans.number') }, hints, steps, misconceptions: wrongs(ans, cands), canonical: `mean|${K.missing ? 'm' : 'a'}|${vals.slice().sort((a, b) => a - b).join(',')}|${m}` };
    }
  });
}
