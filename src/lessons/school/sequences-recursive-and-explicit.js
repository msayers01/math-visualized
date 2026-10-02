/* =====================================================================
   SCHOOL — Sequences: recursive and explicit
   ===================================================================== */
{
  const FONT = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
  const MI = '−';
  const rd = v => Math.round(v * 1e6) / 1e6;
  const vt = v => num(v);
  const isEx = v => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6;
  const vtx = v => (isEx(v) ? '' : '≈ ') + num(v);
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;
  /* "a_{n-1}" and "r^{n}" become real subscripts and superscripts in HTML */
  const rh = s => s.replace(/_\{([^}]*)\}/g, '<sub>$1</sub>').replace(/\^\{([^}]*)\}/g, '<sup>$1</sup>');
  const ord = k => k + ((k % 100 >= 11 && k % 100 <= 13) ? 'th' : ['th', 'st', 'nd', 'rd'][k % 10 > 3 ? 0 : k % 10]);

  /* ----- small rich-text helper for the canvas (subscripts and superscripts) ----- */
  const parts = s => {
    const out = []; let last = 0;
    s.replace(/([_^])\{([^}]*)\}/g, (m, k, t, i) => { if (i > last) out.push([s.slice(last, i), 0]); out.push([t, k === '_' ? 1 : 2]); last = i + m.length; return m; });
    if (last < s.length) out.push([s.slice(last), 0]);
    return out;
  };
  const richW = (c, s, size, wt) => { let w = 0; parts(s).forEach(([t, m]) => { c.font = `${wt} ${m ? size * .7 : size}px ${FONT}`; w += c.measureText(t).width; }); return w; };
  const rich = (c, s, x, y, size, color, align = 'center', wt = 500) => {
    const w = richW(c, s, size, wt); let px = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = color;
    parts(s).forEach(([t, m]) => { c.font = `${wt} ${m ? size * .7 : size}px ${FONT}`; c.fillText(t, px, y + (m === 1 ? size * .22 : m === 2 ? -size * .32 : 0)); px += c.measureText(t).width; });
    return w;
  };
  const fitRich = (c, s, x, y, size, maxW, color, align, wt = 500, min = 12) => { let z = size; while (z > min && richW(c, s, z, wt) > maxW) z -= .5; return rich(c, s, x, y, z, color, align, wt); };
  const niceStep = v => { const e = Math.pow(10, Math.floor(Math.log10(v))), f = v / e; return (f <= 1.2 ? 1 : f <= 2.4 ? 2 : f <= 6 ? 5 : 10) * e; };

  /* ----- sequences: constructors ----- */
  const sg = d => (d < 0 ? ` ${MI} ${num(-d)}` : ` + ${num(d)}`);
  const mkA = (a1, d, o = {}) => ({ kind: 'arith', a1, d, n0: 1, step: p => rd(p + d), sym: `a_{n-1}${sg(d)}`, sub: p => `${vt(p)}${sg(d)}`, op: (d < 0 ? MI : '+') + num(Math.abs(d)), max: 8, cn: 6, ...o });
  const mkG = (a1, r, o = {}) => { const rs = o.rs || num(r); return { kind: 'geom', a1, r, rs, n0: 1, step: p => rd(p * r), sym: `${rs} · a_{n-1}`, sub: p => `${rs} · ${vt(p)}`, op: '×' + rs, max: 6, cn: 6, ...o }; };
  const mkO = (a1, o) => ({ kind: 'other', a1, n0: 1, max: 7, cn: 6, ...o });
  const mkF = (a1, a2, o = {}) => ({ kind: 'fib', a1, a2, n0: 2, step: (p, q) => rd(p + q), sym: 'a_{n-1} + a_{n-2}', sub: (p, q) => `${vt(p)} + ${vt(q)}`, op: '+', max: 8, cn: 6, ...o });
  const terms = (sq, N) => { const t = [sq.a1]; if (sq.kind === 'fib') t.push(sq.a2); while (t.length < N) { const L = t.length; t.push(sq.step(t[L - 1], t[L - 2])); } return t.slice(0, N); };
  const valAt = (sq, k) => (sq.kind === 'arith' ? rd(sq.a1 + sq.d * (k - 1)) : sq.kind === 'geom' ? rd(sq.a1 * Math.pow(sq.r, k - 1)) : null);
  const lab = (sq, v) => (sq.pre || '') + vt(v);
  const rstart = sq => (sq.kind === 'fib' ? `a_{1} = ${vt(sq.a1)}, a_{2} = ${vt(sq.a2)}` : `a_{1} = ${vt(sq.a1)}`);
  const ruleStr = sq => `${rstart(sq)}, a_{n} = ${sq.sym}`;
  const symAt = (sq, m) => sq.sym.replace('a_{n-1}', `a_{${m - 1}}`).replace('a_{n-2}', `a_{${m - 2}}`);
  const exSym = (sq, zero) => (sq.kind === 'arith' ? (zero ? `${vt(sq.a1)} + ${num(sq.d)}n` : `${vt(sq.a1)} + ${num(sq.d)}(n − 1)`)
    : (zero ? `${vt(sq.a1)} · ${sq.rs}^{n}` : `${vt(sq.a1)} · ${sq.rs}^{n−1}`));
  const diffs = t => t.slice(1).map((v, i) => rd(v - t[i]));
  const ratios = t => t.slice(1).map((v, i) => rd(v / t[i]));
  const allEq = a => a.every(v => Math.abs(v - a[0]) < 1e-9);
  const place = (right, wrongs, seed) => { const o = wrongs.slice(), at = seed % (wrongs.length + 1); o.splice(at, 0, right); return o; };

  /* ----- the lists used in the lesson ----- */
  const S = [
    mkA(5, 3, { name: 'Staircase: 5, 8, 11, …', kmax: 50, ruleAt: 4 }),
    mkG(2, 3, { name: 'Tripling: 2, 6, 18, …', kmax: 10, ruleAt: 4 }),
    mkG(48, .5, { name: 'Halving: 48, 24, 12, …', kmax: 7, ruleAt: 4 }),
    mkO(2, { name: 'Double and add 1: 2, 5, 11, …', step: p => rd(2 * p + 1), sym: '2 · a_{n-1} + 1', sub: p => `2 · ${vt(p)} + 1`, op: '×2 +1', ruleAt: 4 }),
    mkF(1, 1, { name: 'Fibonacci: 1, 1, 2, 3, …', ruleAt: 4 }),
    mkA(100, 50, { name: 'Savings: $100, plus $50 a month', pre: '$', kmax: 50, ruleAt: 3, story: 'You open an account with $100 and add $50 every month.' }),
    mkG(10000, 1.1, { name: 'Town: 10,000 people, +10% a year', max: 5, cn: 5, kmax: 8, ruleAt: 3, story: 'A town has 10,000 people and grows 10% every year.',
      rx: ['a_{1} = 10000, a_{n} = 0.1 · a_{n-1}', 'That keeps only the 10% of growth and throws away the 100% the town already had. Test it: 0.1 · 10000 = 1000, but the second term is 11000. Growing 10% means 100% + 10% = 110% of last year, which is 1.1 times.'] }),
    mkG(100, .6, { name: 'Ball: 100 cm drop, bounces to 60%', max: 5, cn: 5, kmax: 6, ruleAt: 3, story: 'A ball is dropped from 100 cm. Each bounce reaches 60% of the last height.',
      rx: ['a_{1} = 100, a_{n} = 0.4 · a_{n-1}', 'The ball keeps 60% of its height. 0.4 is the 40% it loses. Test it: 0.4 · 100 = 40, but the second term is 60.'] })
  ];

  /* ----- option lists for the questions ----- */
  const ruleOpts = (sq, seed) => {
    const t = terms(sq, 6), j = sq.n0, st0 = rstart(sq);
    const ok = { s: ruleStr(sq), ok: true,
      fb: `It starts at ${lab(sq, t[0])}${sq.kind === 'fib' ? ' and ' + lab(sq, t[1]) : ''}. Then a_{${j + 1}} = ${sq.sub(t[j - 1], t[j - 2])} = ${lab(sq, t[j])}, and a_{${j + 2}} = ${sq.sub(t[j], t[j - 1])} = ${lab(sq, t[j + 1])}. Each term comes from the term${sq.kind === 'fib' ? 's' : ''} just before.` };
    let w = [];
    if (sq.kind === 'arith') {
      w = [{ s: `${st0}, a_{n} = ${num(sq.d)} · a_{n-1}`, fb: `That multiplies by ${num(sq.d)} instead of adding. Test it: ${num(sq.d)} · ${vt(sq.a1)} = ${vt(rd(sq.d * sq.a1))}, but the second term is ${vt(t[1])}.` },
        { s: `a_{1} = ${num(sq.d)}, a_{n} = a_{n-1} + ${vt(sq.a1)}`, fb: `The start and the step are swapped. The list starts at ${vt(sq.a1)}, and each term is ${num(sq.d)} more than the one before.` },
        { s: `a_{n} = a_{n-1}${sg(sq.d)}`, fb: 'This has the step but no starting value. Without a_{1} nobody knows where the chain begins. A recursive rule needs both parts.' }];
    } else if (sq.kind === 'geom') {
      w = [{ s: `${st0}, a_{n} = a_{n-1} + ${sq.rs}`, fb: `That adds ${sq.rs} instead of multiplying. Test it: ${vt(sq.a1)} + ${sq.rs} = ${vt(rd(sq.a1 + sq.r))}, but the second term is ${vt(t[1])}.` },
        { s: `a_{1} = ${sq.rs}, a_{n} = ${vt(sq.a1)} · a_{n-1}`, fb: `The start and the multiplier are swapped. The list starts at ${vt(sq.a1)}, and each term is ${sq.rs} times the one before.` },
        sq.rx ? { s: sq.rx[0], fb: sq.rx[1] } : { s: `a_{n} = ${sq.sym}`, fb: 'This has the multiplier but no starting value. Without a_{1} nobody knows where the chain begins. A recursive rule needs both parts.' }];
    } else if (sq.kind === 'other') {
      w = [{ s: 'a_{1} = 2, a_{n} = 2 · a_{n-1}', fb: 'That leaves out the + 1. Test it: 2 · 2 = 4, but the second term is 5.' },
        { s: 'a_{1} = 2, a_{n} = a_{n-1} + 3', fb: 'This fits the first jump only: 2 + 3 = 5. But then it gives 8, and the list has 11. A rule must work for every step, not just the first.' },
        { s: 'a_{1} = 2, a_{n} = 2 · (a_{n-1} + 1)', fb: 'Here the 1 is added before doubling: 2 · (2 + 1) = 6, but the second term is 5. Double first, then add 1.' }];
    } else {
      w = [{ s: 'a_{1} = 1, a_{n} = a_{n-1} + a_{n-2}', fb: 'One starting value is not enough. To find a_{2} this rule would need a_{0}, and there is no a_{0}. A rule that looks back two terms needs two starting values.' },
        { s: 'a_{1} = 1, a_{2} = 1, a_{n} = 2 · a_{n-1}', fb: 'Doubling gives 1, 1, 2, 4. But the fourth term of the list is 3.' },
        { s: 'a_{1} = 1, a_{2} = 1, a_{n} = a_{n-1} + 1', fb: 'Adding 1 gives 1, 1, 2, 3, 4. But the fifth term of the list is 5.' }];
    }
    return place(ok, w, seed).map(o => ({ label: rh(o.s), ok: !!o.ok, fb: o.fb }));
  };
  const exOpts = (sq, seed) => {
    const t = terms(sq, 3), a1 = vt(sq.a1);
    let ok, w;
    if (sq.kind === 'arith') {
      const d = num(sq.d);
      ok = { s: `a_{n} = ${a1} + ${d}(n − 1)`, fb: `Test n = 1: ${a1} + ${d}(0) = ${a1}. Test n = 2: ${a1} + ${d}(1) = ${vt(t[1])}. Term n has taken n − 1 steps from the start, and each step adds ${d}.` };
      w = [{ s: `a_{n} = ${a1} + ${d}n`, fb: `Test n = 1: ${a1} + ${d} = ${vt(t[1])}, but the first term is ${a1}. Term 1 has taken no steps yet, so the formula needs (n − 1).` },
        { s: `a_{n} = ${d} + ${a1}(n − 1)`, fb: `Test n = 1: you get ${d}, but the first term is ${a1}. The start and the step are swapped.` },
        { s: `a_{n} = ${a1} · ${d}^{n−1}`, fb: `That multiplies by ${d} each step, which is geometric. Test n = 2: ${a1} · ${d} = ${vt(rd(sq.a1 * sq.d))}, but the second term is ${vt(t[1])}.` }];
    } else {
      ok = { s: `a_{n} = ${a1} · ${sq.rs}^{n−1}`, fb: `Test n = 1: ${a1} · ${sq.rs}^{0} = ${a1}. Test n = 2: ${a1} · ${sq.rs} = ${vt(t[1])}. Term n has been multiplied by ${sq.rs} exactly n − 1 times.` };
      w = [{ s: `a_{n} = ${a1} · ${sq.rs}^{n}`, fb: `Test n = 1: ${a1} · ${sq.rs} = ${vt(rd(sq.a1 * sq.r))}, but the first term is ${a1}. Term 1 has not been multiplied yet, so the exponent is n − 1.` },
        { s: `a_{n} = ${a1} + ${sq.rs}(n − 1)`, fb: `That adds ${sq.rs} each step. Test n = 2: ${a1} + ${sq.rs} = ${vt(rd(sq.a1 + sq.r))}, but the second term is ${vt(t[1])}.` },
        { s: `a_{n} = (${a1} · ${sq.rs})^{n−1}`, fb: `Test n = 1: anything to the power 0 is 1, so you get 1, but the first term is ${a1}. Only the multiplier gets the exponent.` }];
    }
    return place(ok, w, seed).map(o => ({ label: rh(o.s), ok: o === ok, fb: o.fb }));
  };

  /* ----- practice problems (a fixed list) ----- */
  const PROBS = [
    { name: 'Next three terms', sq: mkO(3, { step: p => 2 * p + 1, sym: '2 · a_{n-1} + 1', sub: p => `2 · ${vt(p)} + 1`, op: '×2 +1' }), sh: 1, rv: 4, qbox: true,
      q: 'A list has a_{1} = 3 and the rule a_{n} = 2 · a_{n-1} + 1. What are the next three terms, a_{2}, a_{3} and a_{4}?',
      ch: [['6, 12, 24', 'That doubles but forgets the + 1. Test the first one: 2 · 3 + 1 = 7, not 6.'],
           ['7, 15, 31', 'a_{2} = 2 · 3 + 1 = 7, a_{3} = 2 · 7 + 1 = 15, a_{4} = 2 · 15 + 1 = 31. Each new term uses only the one just before it.'],
           ['7, 11, 15', 'The first term is right, 7. Then it adds 4 again, but the rule is not "add 4". Apply it to 7: 2 · 7 + 1 = 15.'],
           ['4, 5, 6', 'That adds 1 each time and forgets the doubling. The rule says double the last term, then add 1.']], ans: 1 },
    { name: 'Write the recursive rule', sq: mkA(20, -3), sh: 4, rv: 4, qbox: false,
      q: 'The list is 20, 17, 14, 11, … Which is its recursive rule?',
      ch: [['a_{1} = 20, a_{n} = a_{n-1} + 3', 'The terms go down, so the step is negative. 20 + 3 = 23 is not the second term, 17.'],
           ['a_{n} = 20 − 3n', 'This jumps to a term using n, so it is explicit, not recursive. It is also off: n = 1 gives 17, but the first term is 20.'],
           ['a_{1} = 20, a_{n} = a_{n-1} − 3', 'It starts at 20 and each term is 3 less than the one before: 20, 17, 14, 11. A recursive rule gives the start and how to get from one term to the next.'],
           ['a_{1} = 20, a_{n} = −3 · a_{n-1}', 'That multiplies by −3: −3 · 20 = −60, but the second term is 17. The differences are all −3, so the step is subtracting 3.']], ans: 2 },
    { name: 'Explicit formula, arithmetic', sq: mkA(4, 5), sh: 4, rv: 4, qbox: false,
      q: 'The list is 4, 9, 14, 19, … Each term is 5 more than the one before. Which explicit formula gives the nth term?',
      ch: [['a_{n} = 4 + 5n', 'Test n = 1: 4 + 5 = 9, but the first term is 4. Term 1 has taken no steps, so the formula needs (n − 1).'],
           ['a_{n} = 5 + 4(n − 1)', 'Test n = 1: you get 5, but the first term is 4. The start (4) and the step (5) are swapped.'],
           ['a_{n} = 4 · 5^{n−1}', 'That multiplies by 5, which is geometric. Test n = 2: 4 · 5 = 20, but the second term is 9.'],
           ['a_{n} = 4 + 5(n − 1)', 'Test n = 1: 4 + 5(0) = 4. Test n = 2: 4 + 5(1) = 9. Term n has taken n − 1 steps of 5 from the start.']], ans: 3 },
    { name: 'Recursive to explicit', sq: mkG(81, 1 / 3, { rs: '(1/3)', op: '×(1/3)' }), sh: 1, rv: 5, qbox: false,
      q: 'A list has a_{1} = 81 and a_{n} = (1/3) · a_{n-1}, so each term is one third of the one before. Which explicit formula matches it?',
      ch: [['a_{n} = 81 · 3^{n−1}', 'This makes the terms grow: 81, 243, 729. The rule shrinks them, because it multiplies by 1/3.'],
           ['a_{n} = 81 · (1/3)^{n−1}', 'Test n = 1: 81 · (1/3)^{0} = 81. Test n = 2: 81 · (1/3) = 27. Term n has been multiplied by 1/3 exactly n − 1 times: 81, 27, 9, 3, 1.'],
           ['a_{n} = 81 · (1/3)^{n}', 'Test n = 1: 81 · (1/3) = 27, but the first term is 81. Term 1 has not been multiplied yet, so the exponent is n − 1.'],
           ['a_{n} = 81 − (1/3)(n − 1)', 'That subtracts a third each step, which is arithmetic. The rule multiplies: 81 becomes 27, not 80.67.']], ans: 1 },
    { name: 'Find the 20th term', sq: mkA(6, 4), sh: 4, rv: 4, qbox: false,
      q: 'The list is 6, 10, 14, 18, … and its explicit formula is a_{n} = 6 + 4(n − 1). What is the 20th term, a_{20}?',
      ch: [['86', 'That is 6 + 4(20): you used n instead of n − 1. Term 20 has taken 19 steps, not 20.'],
           ['80', 'That is 4 · 20. It forgets the starting value 6 and uses n instead of n − 1.'],
           ['82', 'a_{20} = 6 + 4(20 − 1) = 6 + 4(19) = 6 + 76 = 82. One calculation, instead of building 19 more boxes.'],
           ['120', 'That is 6 · 20. The formula adds 4 a number of times, it does not multiply 6 by 20.']], ans: 2 },
    { name: 'Two starting values', sq: mkF(2, 3), sh: 2, rv: 6, qbox: true,
      q: 'A list has a_{1} = 2, a_{2} = 3 and the rule a_{n} = a_{n-1} + a_{n-2}. Each term is the sum of the two before it. What is a_{6}?',
      ch: [['21', 'a_{3} = 3 + 2 = 5, a_{4} = 5 + 3 = 8, a_{5} = 8 + 5 = 13, a_{6} = 13 + 8 = 21. A rule that looks back two terms needs two starting values, here 2 and 3.'],
           ['26', 'That doubles a_{5} = 13. The rule adds the two terms before: a_{5} + a_{4} = 13 + 8.'],
           ['16', 'That is 13 + 3. The 3 is a_{2}, but a_{6} needs the two terms just before it, a_{5} and a_{4}.'],
           ['18', 'That is 13 + 5. The 5 is a_{3}. The two terms just before a_{6} are a_{5} = 13 and a_{4} = 8.']], ans: 0 },
    { name: 'A ball bounces', sq: mkG(200, .6, { max: 5 }), sh: 1, rv: 4, qbox: true,
      q: 'A ball is dropped from 200 cm. Each bounce reaches 60% of the height before it. Let a_{1} = 200 be the drop height, a_{2} the first bounce height, and so on. Which rule fits?',
      ch: [['a_{1} = 200, a_{n} = a_{n-1} − 0.6', 'That takes away 0.6 cm each time. The ball keeps a percent of its height, so each height is multiplied: 0.6 · 200 = 120.'],
           ['a_{1} = 200, a_{n} = 0.6 · a_{n-1}', 'The start is the drop height, 200, and each bounce is 0.6 times the last height: 200, 120, 72, 43.2.'],
           ['a_{1} = 60, a_{n} = 0.6 · a_{n-1}', 'The multiplier is right, but the start is not. The first term is the drop height, 200. The 60% is how the next height is found.'],
           ['a_{1} = 200, a_{n} = 0.4 · a_{n-1}', 'The ball keeps 60%. 0.4 is the 40% it loses. Test it: 0.4 · 200 = 80, but the first bounce is 60% of 200 = 120.']], ans: 1 },
    { name: 'Counting from zero', sq: mkA(6, 4), sh: 4, rv: 4, qbox: false, zero: true,
      q: 'A list is numbered from n = 0: a_{0} = 6, a_{1} = 10, a_{2} = 14, … Each term is 4 more than the one before. Which explicit formula matches this numbering?',
      ch: [['a_{n} = 6 + 4(n − 1)', 'That is the formula for lists that start at n = 1. Here n = 0 gives 6 + 4(−1) = 2, but a_{0} = 6.'],
           ['a_{n} = 10 + 4n', 'Test n = 0: you get 10, but a_{0} = 6. The 10 is a_{1}, not the start.'],
           ['a_{n} = 6 + 4n', 'Test n = 0: 6 + 0 = 6. Test n = 1: 6 + 4 = 10. When the first term is a_{0}, term n has taken n steps, so there is no − 1.'],
           ['a_{n} = 4 + 6n', 'Test n = 0: you get 4, but a_{0} = 6. The start and the step are swapped.']], ans: 2 }
  ];

  register({
    id: 'sequences-recursive-and-explicit', level: 'school',
    title: 'Sequences: recursive and explicit',
    blurb: 'Describe a list of numbers two ways: a step-by-step rule that builds it, and a formula that jumps straight to any term.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 3.6; p.cy = 3.4; p.span = 4.4;
      p.grid(1, { axes: false });
      p.path([[0, 0], [7, 0]], { stroke: pal['grid-strong'], width: 1.5 }); p.path([[0, 0], [0, 6.6]], { stroke: pal['grid-strong'], width: 1.5 });
      p.path([[.6, .9], [6.4, 4.9]], { stroke: alpha(pal.violet, .55), width: 2, dash: [6, 5] });
      for (let n = 1; n <= 6; n++) p.dot(n, .6 + .6 * n, 5.5, pal.blue, pal.stage, 2);
      const pts = []; for (let x = 1; x <= 6.01; x += .1) pts.push([x, .45 * Math.pow(1.55, x - 1)]);
      p.curve(pts, { stroke: alpha(pal.green, .6), width: 2 });
      for (let n = 1; n <= 6; n++) p.dot(n, .45 * Math.pow(1.55, n - 1), 5.5, pal.green, pal.stage, 2);
    },
    hook: String.raw`To find the 50th number in the list 5, 8, 11, 14, … you could add 3 again and again, 49 times. Or you could do one calculation. How can one formula skip all those steps, and when is there no shortcut at all?`,
    steps: [
      { title: 'A chain of boxes',
        text: String.raw`<p>A <b>sequence</b> is a list of numbers in order. Each number is a <b>term</b>: \(a_1\) is the first term, \(a_2\) the second.</p><p>A <b>recursive rule</b> says where to start and how to get from one term to the next. Here \(a_1=5\) and \(a_n=a_{n-1}+3\): each term is the one before plus 3.</p><p>Choose each next term before its box appears.</p>`,
        set: { view: 'chain', seq: 0 } },
      { title: 'Jump straight to a term',
        text: String.raw`<p>To reach the 50th term with the rule, you must build 49 boxes first. An <b>explicit formula</b> jumps there directly: \(a_n=5+3(n-1)\).</p><p>Predict the 10th term, then slide to the 50th. The formula gives \(5+3(49)=152\) in one calculation. Why \(n-1\)? Term \(n\) has taken only \(n-1\) steps from the start.</p>`,
        set: { view: 'jump', seq: 0 } },
      { title: 'Arithmetic, geometric or neither',
        text: String.raw`<p>In an <b>arithmetic</b> list you add the same number each time (a constant difference). In a <b>geometric</b> list you multiply by the same number each time (a constant ratio).</p><p>Here the list is 2, 6, 18, 54, 162, 486. Click neighbouring boxes to find differences and ratios, decide, then write both formulas. The dots lie on a line or on a curve.</p>`,
        set: { view: 'classify', seq: 1 } },
      { title: 'Rules that are neither',
        text: String.raw`<p>Fibonacci adds the <em>two</em> terms before it, so it needs two starting values: \(a_1=1,\ a_2=1\). Others mix steps, like \(a_n=2a_{n-1}+1\).</p><p>Real stories work too: savings that gain $50 a month, a town that grows 10% a year, a ball that bounces to 60% of its height.</p><p>Build the chain, then choose the rule that made it.</p>`,
        set: { view: 'other', seq: 4 } }
    ],
    formal: String.raw`
      <p>A <em>sequence</em> is an ordered list of numbers. The number in position \(n\) is the <em>term</em> \(a_n\), so \(a_1\) is the first term, \(a_2\) the second, and \(a_n\) a general term. There are two main ways to describe the whole list.</p>
      <h3>Recursive formula: a start and a step-by-step rule</h3>
      <p>A <em>recursive formula</em> has two parts: the starting term (or terms) and a rule that gets each new term from the ones before it. Example: \(a_1=5\) and \(a_n=a_{n-1}+3\) gives \(5,8,11,14,\ldots\). Without the start, the rule cannot begin. A rule that looks back two places, like the Fibonacci rule \(a_n=a_{n-1}+a_{n-2}\), needs two starting values, because \(a_2\) would otherwise need a term \(a_0\) that does not exist. The weakness is speed: to find \(a_{50}\) you need \(a_{49}\), which needs \(a_{48}\), and so on back to the start.</p>
      <h3>Explicit formula: a jump straight to any term</h3>
      <p>An <em>explicit formula</em> gives \(a_n\) from \(n\) alone, with no earlier terms. You can find the 50th term with one calculation. Many recursive lists have no simple explicit formula, and then recursion is the natural description.</p>
      <h3>Arithmetic sequences: a constant difference</h3>
      <p>If every term is the one before plus a fixed number \(d\) (the <em>common difference</em>), the sequence is <em>arithmetic</em>:
      \[ a_n=a_{n-1}+d, \qquad a_n=a_1+(n-1)d. \]
      Why \((n-1)\)? To get from \(a_1\) to \(a_n\) you take steps from position 1 to position \(n\), and there are \(n-1\) of them (five fence posts have four gaps between them). Each step adds \(d\), so you add \(d\) exactly \(n-1\) times. For \(5,8,11,\ldots\): \(a_{50}=5+3(49)=152\).</p>
      <p>To test a list, subtract neighbouring terms. If all the differences are equal, it is arithmetic. On a graph of the points \((n,a_n)\), the dots lie on a straight line with slope \(d\), because \(a_n=dn+(a_1-d)\) is a linear function of \(n\), like \(f(x)=mx+b\). Only the whole-number values of \(n\) are dots.</p>
      <h3>Geometric sequences: a constant ratio</h3>
      <p>If every term is the one before times a fixed number \(r\) (the <em>common ratio</em>, not zero), the sequence is <em>geometric</em>:
      \[ a_n=r\,a_{n-1}, \qquad a_n=a_1\,r^{\,n-1}. \]
      The same counting argument applies: term \(n\) has been multiplied by \(r\) exactly \(n-1\) times. For \(2,6,18,\ldots\): \(a_n=2\cdot 3^{n-1}\), so \(a_5=2\cdot 81=162\). To test a list, divide each term by the one before. If all the ratios are equal, it is geometric. The dots lie on an exponential curve: growing if \(r&gt;1\), shrinking toward 0 if \(0&lt;r&lt;1\). A 10% yearly increase multiplies by \(1+0.1=1.1\), and a bounce to 60% of the height multiplies by \(0.6\) (not \(0.4\), which is the part lost).</p>
      <h3>The off-by-one trap</h3>
      <p>Everything above counts from \(n=1\). Some lists count from \(n=0\), starting at \(a_0\). Then term \(n\) has taken \(n\) steps, not \(n-1\), and the formulas become \(a_n=a_0+dn\) and \(a_n=a_0r^{\,n}\). The list is the same, only the labels move: the 50th term in the list is \(a_{49}\) when you start at 0. Always test a formula on the first term before trusting it.</p>
      <h3>Worked example</h3>
      <p>The list is \(3,7,11,15,\ldots\). The differences are all 4, so it is arithmetic with \(d=4\). Recursive: \(a_1=3,\ a_n=a_{n-1}+4\). Explicit: \(a_n=3+4(n-1)=4n-1\). The 20th term is \(a_{20}=3+4(19)=79\). Check with the short form: \(4(20)-1=79\).</p>
      <p>The list is \(5,10,20,40,\ldots\). The ratios are all 2, so it is geometric with \(r=2\). Recursive: \(a_1=5,\ a_n=2a_{n-1}\). Explicit: \(a_n=5\cdot2^{n-1}\). The 8th term is \(5\cdot 2^7=640\).</p>
      <h3>Neither arithmetic nor geometric</h3>
      <p>The list \(2,5,11,23,\ldots\) has differences \(3,6,12\) and ratios \(2.5,\ 2.2,\ 2.09\): neither is constant. It still has a clean recursive rule, \(a_1=2,\ a_n=2a_{n-1}+1\), and so does Fibonacci. These rules combine an operation on the last term with something else, or look back more than one place. In the next course you will learn to find explicit formulas for some of them. For now, recursion describes them well and lets you compute as many terms as you want.</p>`,
    check: [
      { q: 'A recursive formula for a sequence must give which two things?',
        choices: [String.raw`A formula using only the term number \(n\), such as \(a_n=5+3n\)`, 'The common difference and the common ratio', 'The starting term (or terms) and a rule that gets each new term from the term or terms before it', 'The 50th term and the 49th term'], answer: 2,
        why: String.raw`A recursive formula needs a place to start and a rule for the next step, for example \(a_1=5\) and \(a_n=a_{n-1}+3\). A formula that uses only \(n\) is explicit. A list is not both arithmetic and geometric, so it does not have both a difference and a ratio.`,
        hint: 'Think of building the list box by box. Where do you begin, and what do you do to get each next box?' },
      { q: String.raw`A sequence has \(a_1=7\), and each term is 4 more than the term before it. Use the explicit formula to find the 30th term, \(a_{30}\).`,
        choices: ['123', '127', '116', '210'], answer: 0,
        why: String.raw`The sequence is arithmetic with \(d=4\), so \(a_n=7+4(n-1)\). Then \(a_{30}=7+4(29)=7+116=123\). The answer 127 uses \(n\) instead of \(n-1\). The answer 116 forgets the starting 7. The answer 210 is \(7\times30\).`,
        hint: String.raw`Write \(a_n=a_1+(n-1)d\) with \(a_1=7\) and \(d=4\). Term 30 has taken 29 steps.` },
      { q: String.raw`Dana wants an explicit formula for the list 3, 6, 12, 24, … and writes \(a_n=3\cdot2^n\). Which statement is true?`,
        choices: ['Her formula is correct, because the list doubles each time, so the exponent is n.', String.raw`Her formula is wrong: the list adds 3 each time, so it should be \(a_n=3+3(n-1)\).`, String.raw`Her formula is wrong: it should be \(a_n=2\cdot3^{n-1}\).`, String.raw`Her formula is wrong: it gives 6 for \(n=1\), but the first term is 3. It should be \(a_n=3\cdot2^{n-1}\).`], answer: 3,
        why: String.raw`Test the formula on the first term: \(3\cdot2^1=6\), but \(a_1=3\). The first term has been doubled zero times, so the exponent is \(n-1\): \(a_n=3\cdot2^{n-1}\) gives \(3,6,12,24\). The list does not add 3 each time, because the differences are 3, 6, 12. And \(2\cdot3^{n-1}\) swaps the start and the ratio.`,
        hint: String.raw`Put \(n=1\) into her formula. Does it give the first term of the list?` }
    ],
    links: { prereq: ['exponential-growth', 'patterns-and-the-nth-term'], related: ['pascals-triangle-and-the-galton-board', 'what-is-a-function', 'forms-of-a-linear-equation', 'exponents-and-scientific-notation', 'slope-and-linear-functions'] },

    mount({ stage, controls: C }) {
      const st = { view: 'chain', seq: 0, n: 1, last: 0, showRule: true, k: 10, zero: false, jpred: false, cls: 0, pair: 0, pairs: [], shape: 0, pop: 1, fade: 1, practice: false };
      let cancel = () => {}, cancel2 = () => {};
      const panel = stage.nextElementSibling;
      delete stage.dataset.coords;
      const P = new Plane(stage, { span: 5 });
      let hit = [];
      let curQ = null, curBtns = [], curKey = '', carry = '';
      let prIdx = 0, prSolved = false, prTried = false, prFirst = 0, prDone = 0, prOver = false;

      const cur = () => S[st.seq];
      const cnOf = sq => sq.cn;
      const shownJump = () => (st.jpred ? st.k : 4);

      /* ---------------- the picture ---------------- */
      P.onDraw = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, prac = st.practice;
        const pr = prac ? PROBS[prIdx] : null, sq = prac ? pr.sq : cur();
        const view = prac ? 'prac' : st.view;
        const zero = prac ? !!pr.zero : (st.zero && view === 'jump');
        const fs = clamp(W / 38, 13, 17), pad = 14;
        const gap = clamp(W * .045, 12, 32), bw = (view === 'chain' || view === 'other' || view === 'jump') ? clamp(W * .11, 46, 70) : clamp(W * .085, 38, 70), bh = clamp(H * .12, 48, 62), slot = bw + gap, yT = 12;
        const solved = prac && prSolved;
        const fade = .35 + .65 * st.fade;

        /* which terms are on the canvas */
        let N;
        if (view === 'chain' || view === 'other') N = st.n;
        else if (view === 'jump') N = shownJump();
        else if (view === 'classify') N = cnOf(sq);
        else N = solved ? pr.rv : pr.sh;
        const T = terms(sq, Math.max(N, sq.max, 8));
        const jumpOn = view === 'jump' && (sq.kind === 'arith' || sq.kind === 'geom') && st.jpred;
        const tv = i => (view === 'jump' && sq.kind !== 'fib' && sq.kind !== 'other' ? valAt(sq, i) : T[i - 1]);

        /* band A: the chain of boxes */
        let items = [];
        if (view === 'jump' && jumpOn && st.k > 4) {
          for (let i = 1; i <= 3; i++) items.push({ pos: i, v: tv(i), kind: 'term' });
          items.push({ kind: 'gap' }); items.push({ pos: st.k, v: tv(st.k), kind: 'term', hi: true });
        } else {
          for (let i = 1; i <= N; i++) items.push({ pos: i, v: tv(i), kind: 'term', isNew: (view === 'chain' || view === 'other') && i === st.n && st.last === i });
          if ((view === 'chain' || view === 'other') && N < sq.max) items.push({ pos: N + 1, kind: 'q' });
          if (prac && !solved && pr.qbox) items.push({ pos: N + 1, kind: 'q' });
        }
        let ell = false;
        const cap0 = Math.max(3, Math.floor((W - 2 * pad + gap) / slot));
        if (items.length > cap0) { const cap1 = Math.max(3, Math.floor((W - 2 * pad - 16 + gap) / slot)); items = items.slice(items.length - cap1); ell = true; }
        const total = items.length * bw + (items.length - 1) * gap;
        const x0 = Math.max(pad + (ell ? 16 : 0), (W - total) / 2), cyB = yT + bh / 2;
        const showOp = (view === 'chain' || view === 'other') && st.showRule;
        const pairOn = view === 'classify' || view === 'prac';
        hit = [];
        c.globalAlpha = fade;
        if (ell) rich(c, '…', pad + 6, cyB, fs * 1.3, pal.muted);
        items.forEach((it, i) => {
          const x = x0 + i * slot, cxm = x + bw / 2;
          if (it.kind === 'gap') { rich(c, '···', cxm, cyB, fs * 1.4, pal.muted); return; }
          if (it.kind === 'q') {
            c.save(); c.setLineDash([5, 5]); c.strokeStyle = pal.muted; c.lineWidth = 1.8; c.beginPath(); c.rect(x + .5, yT + .5, bw - 1, bh - 1); c.stroke(); c.restore();
            rich(c, `a_{${it.pos - (zero ? 1 : 0)}}`, cxm, yT + bh * .27, fs * .85, pal.muted);
            rich(c, '?', cxm, yT + bh * .66, fs * 1.4, pal.muted, 'center', 600);
            return;
          }
          const sel = pairOn && st.pair && (it.pos === st.pair || it.pos === st.pair + 1);
          const hi = it.hi || sel;
          const sc = it.isNew ? .65 + .35 * st.pop : 1, al = it.isNew ? st.pop : 1;
          c.save(); c.globalAlpha = fade * al; c.translate(cxm, cyB); c.scale(sc, sc);
          c.beginPath(); if (c.roundRect) c.roundRect(-bw / 2, -bh / 2, bw, bh, 7); else c.rect(-bw / 2, -bh / 2, bw, bh);
          c.fillStyle = alpha(hi ? pal.yellow : pal.blue, hi ? .22 : .1); c.fill(); c.strokeStyle = hi ? pal.yellow : pal.blue; c.lineWidth = hi ? 3.5 : 2; c.stroke();
          rich(c, `a_{${it.pos - (zero ? 1 : 0)}}`, 0, -bh * .23, fs * .85, pal.muted);
          fitRich(c, lab(sq, it.v), 0, bh * .17, fs * 1.25, bw - 8, pal.text, 'center', 600, 11);
          c.restore();
          hit.push({ x, w: bw, pos: it.pos });
        });
        /* arrows, operation labels, Fibonacci arcs and checked-pair marks */
        const lastIdx = items.length - 1;
        items.forEach((it, i) => {
          const nx = items[i + 1], x = x0 + i * slot;
          if (!nx || it.kind === 'gap' || nx.kind === 'gap' || nx.pos !== it.pos + 1) return;
          const ax0 = x + bw + 3, ax1 = x + slot - 3;
          c.save(); c.globalAlpha = fade * (nx.isNew ? st.pop : 1); c.strokeStyle = pal.muted; c.fillStyle = pal.muted; c.lineWidth = 1.6;
          if (nx.kind === 'q') c.setLineDash([3, 3]);
          c.beginPath(); c.moveTo(ax0, cyB); c.lineTo(ax1 - 3, cyB); c.stroke(); c.setLineDash([]);
          c.beginPath(); c.moveTo(ax1, cyB); c.lineTo(ax1 - 6, cyB - 3.5); c.lineTo(ax1 - 6, cyB + 3.5); c.closePath(); c.fill();
          c.restore();
          if (showOp && gap >= 22 && sq.kind !== 'fib') rich(c, sq.op, (ax0 + ax1) / 2, cyB - 13, fs * .78, pal.violet, 'center', 600);
          if (pairOn && st.pairs[it.pos]) { c.fillStyle = pal.green; c.beginPath(); c.arc((ax0 + ax1) / 2, yT + bh + 8, 3.4, 0, TAU); c.fill(); }
          if (showOp && sq.kind === 'fib' && i >= 1 && items[i - 1].kind === 'term' && i + 1 === lastIdx) {
            const cx0 = x0 + (i - 1) * slot + bw / 2, cx1 = x0 + (i + 1) * slot + bw / 2;
            {
              c.save(); c.globalAlpha = fade * .8; c.strokeStyle = pal.violet; c.lineWidth = 1.6; c.beginPath(); c.moveTo(cx0, yT + bh); c.quadraticCurveTo((cx0 + cx1) / 2, yT + bh + 20, cx1, yT + bh); c.stroke(); c.restore();
            }
          }
        });

        /* band B: the text lines */
        const lh = clamp(fs * 1.6, 21, 27);
        const L = [];
        const pairLines = () => {
          const t = terms(sq, prac ? pr.rv : cnOf(sq)), i = st.pair, lo = i - (zero ? 1 : 0);
          if (!i) { L.push({ s: prac ? 'Tip: click two neighbouring boxes to compare them.' : 'Click two neighbouring boxes (or use the pair slider) to compare them.', col: pal.muted }); return; }
          const a = t[i - 1], b = t[i], q = b / a;
          L.push({ s: `a_{${i + 1 - (zero ? 1 : 0)}} − a_{${lo}} = ${vt(b)} − ${vt(a)} = ${vt(rd(b - a))}`, col: pal.green, wt: 600 });
          L.push({ s: `a_{${i + 1 - (zero ? 1 : 0)}} ÷ a_{${lo}} = ${vt(b)} ÷ ${vt(a)} ${isEx(q) ? '=' : '≈'} ${vt(q)}`, col: pal.red, wt: 600 });
        };
        let bars = null;
        if (view === 'chain' || view === 'other') {
          if (sq.story) L.push({ s: sq.story, col: pal.muted });
          L.push(st.showRule ? { s: ruleStr(sq), col: pal.violet, wt: 600 } : { s: 'The rule is hidden. Find the pattern.', col: pal.muted });
          const m = st.last;
          if (m && m <= N) L.push({ s: st.showRule ? `a_{${m}} = ${symAt(sq, m)} = ${sq.sub(T[m - 2], T[m - 3])} = ${lab(sq, T[m - 1])}` : `a_{${m}} = ${lab(sq, T[m - 1])}`, col: pal.text });
          L.push(N < sq.max ? { s: `Next: what is a_{${N + 1}}?`, col: pal.muted } : { s: `The chain is complete: ${N} terms.`, col: pal.muted });
        } else if (view === 'jump') {
          if (sq.kind !== 'arith' && sq.kind !== 'geom') L.push({ s: 'No jump formula for this list. You can only build it one term at a time.', col: pal.muted });
          else if (!st.jpred) L.push({ s: 'Predict first: choose the 10th or 5th term in the panel.', col: pal.muted });
          else {
            const k = st.k, v = valAt(sq, k), nm = k - (zero ? 1 : 0);
            L.push({ s: `a_{n} = ${exSym(sq, zero)}`, col: pal.violet, wt: 600 });
            if (sq.kind === 'arith') {
              L.push({ s: zero ? `a_{${nm}} = ${vt(sq.a1)} + ${num(sq.d)}(${nm})` : `a_{${k}} = ${vt(sq.a1)} + ${num(sq.d)}(${k} − 1) = ${vt(sq.a1)} + ${num(sq.d)}(${k - 1})`, col: pal.text });
              L.push({ s: `= ${vt(sq.a1)} + ${vt(rd(sq.d * (k - 1)))} = ${lab(sq, v)}`, col: pal.text, wt: 600 });
            } else {
              L.push({ s: zero ? `a_{${nm}} = ${vt(sq.a1)} · ${sq.rs}^{${nm}}` : `a_{${k}} = ${vt(sq.a1)} · ${sq.rs}^{${k}−1} = ${vt(sq.a1)} · ${sq.rs}^{${k - 1}}`, col: pal.text });
              L.push({ s: Number.isInteger(sq.r) ? `= ${vt(sq.a1)} · ${vt(Math.pow(sq.r, k - 1))} = ${vtx(v)}` : `= ${vtx(v)}`, col: pal.text, wt: 600 });
            }
            bars = { k, mx: sq.kmax };
          }
        } else if (view === 'classify') {
          pairLines();
          const t = terms(sq, cnOf(sq)), D = diffs(t), R = ratios(t);
          L.push({ s: 'Differences: ' + D.map((v, i) => (st.pairs[i + 1] ? vt(v) : '?')).join(', '), col: pal.green });
          L.push({ s: 'Ratios: ' + R.map((v, i) => (st.pairs[i + 1] ? vt(v) : '?')).join(', '), col: pal.red });
        } else pairLines();
        const bB = yT + bh + 24;
        L.forEach((l, i) => fitRich(c, l.s, W / 2, bB + lh * (i + .5), fs * 1.05, W - 2 * pad, l.col, 'center', l.wt || 500, 12));
        let yC = bB + L.length * lh + 6;
        if (bars) {
          const l1 = `Recursion: ${bars.k - 1} step${bars.k - 1 === 1 ? '' : 's'}`, l2 = 'Formula: 1 calculation';
          c.font = `500 ${fs * .95}px ${FONT}`;
          const lw = Math.max(c.measureText(l1).width, c.measureText(l2).width), bx = pad + lw + 10, bm = W - pad - bx;
          [[l1, bars.k - 1, pal.red, 0], [l2, 1, pal.green, 1]].forEach(([tx, ln, col, r]) => {
            const y = yC + lh * (r + .5), len = Math.max(r ? 6 : 3, ln / Math.max(bars.mx - 1, 1) * bm);
            c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = col; c.font = `500 ${fs * .95}px ${FONT}`; c.fillText(tx, pad, y);
            c.fillStyle = alpha(col, .85); c.fillRect(bx, y - 5, len, 10);
          });
          yC += lh * 2 + 4;
        }

        /* band C: the graph of (n, a_n) */
        const gl = clamp(W * .1, 34, 44), gr = W - 16, gtp = yC + 20, gbt = H - 24;
        if (gbt - gtp < 50) { c.globalAlpha = 1; return; }
        let len;
        if (view === 'chain' || view === 'other') len = sq.max; else if (view === 'jump') len = Math.max(st.jpred ? st.k : 4, 4); else if (view === 'classify') len = cnOf(sq); else len = prac ? Math.max(pr.rv, 4) : 4;
        const vals = [];
        if (view === 'jump' && jumpOn) { vals.push(valAt(sq, 1), valAt(sq, len)); } else for (let i = 1; i <= len; i++) vals.push(T[i - 1] !== undefined ? T[i - 1] : 0);
        let yLo = Math.min(0, ...vals), yHi = Math.max(...vals) * 1.15; if (yHi <= yLo) yHi = yLo + 1;
        const XM = len + 1;
        const gx = n => gl + n / XM * (gr - gl), gy = v => gbt - (v - yLo) / (yHi - yLo) * (gbt - gtp);
        const yt = v => (Math.abs(v) >= 10000 ? num(v / 1000) + 'k' : num(v));
        const lf = Math.max(12, fs * .85);
        c.save(); c.lineWidth = 1; c.strokeStyle = pal.grid;
        const ys = niceStep((yHi - yLo) / 4);
        c.font = `500 ${lf}px ${FONT}`;
        for (let v = Math.ceil(yLo / ys) * ys; v <= yHi + 1e-9; v += ys) {
          c.beginPath(); c.moveTo(gl, gy(v)); c.lineTo(gr, gy(v)); c.stroke();
          c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillStyle = pal.muted; c.fillText(yt(rd(v)), gl - 5, gy(v));
        }
        const xs = len <= 12 ? 1 : len <= 24 ? 2 : 10;
        for (let n = 1; n <= len; n += 1) {
          const m = n - (zero ? 1 : 0);
          if (xs === 1 || m % xs === 0) { c.beginPath(); c.moveTo(gx(n), gtp); c.lineTo(gx(n), gbt); c.stroke(); }
          if (xs === 1 || m % xs === 0 || n === 1) { c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = pal.muted; c.fillText(String(m), gx(n), gbt + 5); }
        }
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.6; c.beginPath(); c.moveTo(gl, gtp); c.lineTo(gl, gbt); c.lineTo(gr, gbt); c.stroke();
        c.restore();
        rich(c, 'n', gr - 2, gbt - 12, lf * 1.05, pal.muted, 'right');
        rich(c, 'a_{n}', gl + 6, gtp - 8, lf * 1.05, pal.muted, 'left');
        /* the line or the curve through the dots */
        const shape = view === 'jump' ? (jumpOn ? 1 : 0) : view === 'classify' ? st.shape : 0;
        if (shape > .01) {
          c.save(); c.beginPath(); c.rect(gl, gtp - 4, gr - gl + 4, gbt - gtp + 8); c.clip();
          c.globalAlpha = fade * shape; c.strokeStyle = pal.violet; c.lineWidth = 2.6; c.setLineDash([7, 5]); c.beginPath();
          if (sq.kind === 'arith') { c.moveTo(gx(1), gy(sq.a1)); c.lineTo(gx(XM), gy(sq.a1 + sq.d * (XM - 1))); }
          else if (sq.kind === 'geom') for (let i = 0; i <= 80; i++) { const x = 1 + (XM - 1) * i / 80, y = sq.a1 * Math.pow(sq.r, x - 1); i ? c.lineTo(gx(x), gy(y)) : c.moveTo(gx(x), gy(y)); }
          c.stroke(); c.restore();
          const msg = sq.kind === 'arith' ? 'A straight line: the same difference each step.' : sq.kind === 'geom' ? 'A curve: the same ratio each step.' : 'Not a straight line, and not a ratio curve.';
          c.globalAlpha = fade * shape; fitRich(c, msg, gl + 34, gtp + 8, lf * 1.05, gr - gl - 40, pal.violet, 'left', 600, 12); c.globalAlpha = fade;
        }
        /* the dots */
        const dr = clamp((gr - gl) / XM * .32, 2.6, 6.5);
        const dots = view === 'jump' && jumpOn ? Math.min(st.k, 50) : N;
        for (let i = 1; i <= dots; i++) {
          const v = tv(i); if (v === undefined) continue;
          const isHi = view === 'jump' && jumpOn && i === st.k;
          const isPair = pairOn && st.pair && (i === st.pair || i === st.pair + 1);
          const pop = (view === 'chain' || view === 'other') && i === st.n && st.last === i ? st.pop : 1;
          if (isHi) {
            c.save(); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.setLineDash([4, 5]); c.beginPath(); c.moveTo(gx(i), gbt); c.lineTo(gx(i), gy(v)); c.stroke(); c.restore();
          }
          c.beginPath(); c.arc(gx(i), gy(v), (isHi ? dr * 1.8 : isPair ? dr * 1.4 : dr) * (.5 + .5 * pop), 0, TAU);
          c.fillStyle = isHi || isPair ? pal.yellow : pal.blue; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 1.5; c.stroke();
        }
        if (dots >= 1) {
          const i = view === 'jump' && jumpOn ? st.k : dots, v = tv(i), nm = i - (zero ? 1 : 0);
          if (v !== undefined && !(view === 'classify')) {
            const tx = `a_{${nm}} = ${lab(sq, v)}`, w = richW(c, tx, lf * 1.05, 600), px = clamp(gx(i), gl + w / 2 + 2, gr - w / 2), py = gy(v) - (dr * 2 + 10);
            c.save(); c.lineWidth = 4; c.strokeStyle = pal.stage; c.lineJoin = 'round'; c.restore();
            rich(c, tx, px, Math.max(gtp + 14, py), lf * 1.05, pal.text, 'center', 600);
          }
        }
        c.globalAlpha = 1;
      };

      /* clicking boxes compares neighbouring terms */
      P.canvas.addEventListener('pointerdown', e => {
        if (st.view !== 'classify' && !st.practice) return;
        const r = P.canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        if (y > 8 + 70 + 14) return;
        const b = hit.find(q => x >= q.x - 4 && x <= q.x + q.w + 4);
        if (!b) return;
        const sq = st.practice ? PROBS[prIdx].sq : cur(), nT = st.practice ? (prSolved ? PROBS[prIdx].rv : PROBS[prIdx].sh) : cnOf(sq);
        if (nT < 2) return;
        pickPair(b.pos < nT ? b.pos : b.pos - 1);
      });
      const pickPair = i => { st.pair = i; st.pairs[i] = true; sync(); };

      /* ---------------- panel helpers ---------------- */
      const vis = (el, on) => { if (el) el.style.display = on ? '' : 'none'; };
      const mkBtn = (label, onClick, primary, html) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick, ...(html ? { html } : {}) }, html ? null : label);
      const box = build => { const b = h('div', { style: 'display:flex;flex-direction:column;gap:16px;min-width:0' }); panel.append(b); const n0 = panel.children.length; build(); while (panel.children.length > n0) b.append(panel.children[n0]); return b; };
      /* replace the slider inside a box (its range depends on the list) */
      const swapSlider = (bx, make) => {
        const old = bx.querySelector('.ctl.slider'); if (old) old.remove();
        const s = make(), el = panel.lastElementChild; bx.insertBefore(el, bx.children[1] || null); s.inp = el.querySelector('input'); return s;
      };

      let exBox, exSel, qBox, qTitle, qPrompt, qBtns, qFb, againBox, againBtn, jumpBox, kS, zeroT, clsBox, pairS, roBox, ro, pracBox, startBtn, pnextBox, pnext;

      exBox = box(() => {
        C.title('Sequence');
        C.select({ label: 'Choose a list', options: S.map((s, i) => ({ value: String(i), label: s.name })), value: '0',
          onChange: v => { cancel(); setSeq(+v); sync(); } });
        exSel = panel.lastElementChild.querySelector('select'); exSel.style.minWidth = '0'; exSel.style.width = '100%'; exSel.style.textOverflow = 'ellipsis'; panel.lastElementChild.style.minWidth = '0';
      });
      qBox = h('div', { style: 'display:flex;flex-direction:column;gap:12px;min-width:0' });
      qTitle = h('p', { class: 'ctl-title' }); qPrompt = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
      qBtns = h('div', { class: 'ctl buttons' }); qFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
      qBox.append(qTitle, qPrompt, qBtns, qFb); panel.append(qBox);
      pnext = mkBtn('Next problem', () => nextProb(), true);
      pnextBox = h('div', { class: 'ctl buttons' }, pnext); panel.append(pnextBox);
      againBtn = mkBtn('Build the chain again', () => { cancel(); st.n = cur().n0; st.last = 0; st.showRule = st.view !== 'other'; carry = ''; sync(); });
      againBox = h('div', { class: 'ctl buttons' }, againBtn); panel.append(againBox);
      jumpBox = box(() => {
        C.title('Ask for a term');
        zeroT = C.toggle({ label: 'Count from n = 0 instead of n = 1', value: false, onChange: v => { cancel(); st.zero = v; sync(); } });
      });
      clsBox = box(() => { C.title('Compare two neighbours'); });
      roBox = box(() => { ro = C.readout(); });
      pracBox = box(() => {
        C.title('Practice');
        C.hint('Eight short problems. Nothing here is saved or scored.');
        startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); if (st.practice) { st.practice = false; sync(); } else { st.practice = true; if (!prOver) loadProb(); sync(); } } }])[0];
      });
      panel.append(pracBox);

      const buildK = () => {
        const sq = cur(), mx = sq.kmax || 10;
        kS = swapSlider(jumpBox, () => C.slider({ label: 'Which term in the list?', min: 1, max: mx, step: 1, value: Math.min(st.k, mx), format: v => ord(Math.round(v)) + ' term', onInput: v => { cancel(); st.k = v; sync(); } }));
      };
      const buildPair = () => {
        const sq = cur(), nn = cnOf(sq) - 1;
        pairS = swapSlider(clsBox, () => C.slider({ label: 'Pair of neighbours', min: 1, max: nn, step: 1, value: Math.max(1, st.pair || 1), format: v => `a${Math.round(v)} and a${Math.round(v) + 1}`, onInput: v => { cancel(); pickPair(v); } }));
      };
      let builtFor = -1;

      /* ---------------- state changes ---------------- */
      const setSeq = i => {
        st.seq = i; const sq = S[i];
        st.n = sq.n0; st.last = 0; st.showRule = st.view !== 'other';
        st.k = Math.min(st.k > (sq.kmax || 10) ? 10 : st.k, sq.kmax || 10); st.jpred = false; st.cls = 0; st.pair = 0; st.pairs = []; st.shape = 0; carry = '';
      };
      const popIn = () => { st.pop = 0; cancel(); cancel = animateTo(st, { pop: 1 }, 450, () => P.draw()); };

      /* ---------------- questions ---------------- */
      const nextQ = (sq, n) => {
        const t = terms(sq, n + 1), m = n + 1, pv = t[n - 1], qv = t[n - 2], c = t[n], w = [];
        const add = (v, fb) => { v = rd(v); if (isFinite(v) && v !== c && !w.some(x => x[0] === v) && v > -1e9) w.push([v, fb]); };
        if (sq.kind === 'arith') {
          add(pv, `That is just the last term again. The rule adds ${num(sq.d)}, so the new term must be ${num(sq.d)} more than ${lab(sq, pv)}.`);
          add(pv * sq.d, `That multiplies by ${num(sq.d)}. This rule adds ${num(sq.d)}: ${sq.sub(pv)} = ${lab(sq, c)}.`);
          add(pv + m, `You added the term number, ${m}. The step is always ${num(sq.d)}, whatever the position.`);
        } else if (sq.kind === 'geom') {
          if (!Number.isInteger(sq.r) && sq.r > 1) add(pv * (sq.r - 1), `That is only the growth part. The new term is the whole old amount plus the growth, which is ${sq.rs} times the old amount: ${sq.sub(pv)} = ${lab(sq, c)}.`);
          if (!Number.isInteger(sq.r) && sq.r < 1) add(pv * (1 - sq.r), `That is the part that is lost. The new term is the part that is kept, ${sq.rs} times the old one: ${sq.sub(pv)} = ${lab(sq, c)}.`);
          add(pv * sq.r * sq.r, `That multiplies by ${sq.rs} twice. Each new term is the last term times ${sq.rs}, once.`);
          if (qv !== undefined) add(pv + (pv - qv), `That adds the last jump again. In a geometric list the jumps keep changing, because the same multiplier is applied to a different term each time.`);
          add(pv + sq.r, `That adds ${sq.rs}. This rule multiplies: ${sq.sub(pv)} = ${lab(sq, c)}.`);
        } else if (sq.kind === 'other') {
          add(2 * pv, 'That doubles but forgets the + 1.');
          add(2 * (pv + 1), 'That adds 1 first and then doubles. The rule doubles the last term first, then adds 1.');
          add(pv + 1, 'That only adds 1. The rule also doubles the last term.');
        } else {
          add(2 * pv, 'That doubles the last term. The rule adds the last term and the one before it.');
          if (qv !== undefined) add(pv - qv, 'That subtracts. The rule adds the last two terms.');
          if (t[n - 3] !== undefined) add(pv + t[n - 3], 'That adds the term three places back. The rule adds the two terms just before.');
        }
        let f = 1; while (w.length < 2) { add(c + f, `Check the arithmetic: ${sq.sub(pv, qv)} = ${lab(sq, c)}.`); if (w.length < 2) add(c - f, `Check the arithmetic: ${sq.sub(pv, qv)} = ${lab(sq, c)}.`); f++; }
        const wr = w.slice(0, 3), right = [c, `a_{${m}} = ${sq.sub(pv, qv)} = ${lab(sq, c)}. ${st.showRule ? 'The rule only looks back at the previous term' + (sq.kind === 'fib' ? 's' : '') + '.' : 'That fits the pattern so far.'}`];
        const seed = (m * 2 + st.seq) % (wr.length + 1);
        const all = wr.slice(); all.splice(seed, 0, right);
        return {
          prompt: rh(st.showRule ? `Rule: ${ruleStr(sq)}. What is a_{${m}}?` : `What do you think a_{${m}} is? Look for the pattern in the terms so far.`),
          opts: all.map(o => ({ label: lab(sq, o[0]), ok: o === right, fb: rh(o[1]) })),
          onRight: fb => { carry = fb; st.n = m; st.last = m; popIn(); }
        };
      };
      const ruleQ = sq => {
        const t = terms(sq, st.n);
        return { prompt: rh(`The terms so far are ${t.map(v => lab(sq, v)).join(', ')}. Which rule made this list?`), opts: ruleOpts(sq, st.seq).map(o => ({ ...o, fb: rh(o.fb) })),
          onRight: fb => { carry = fb; st.showRule = true; } };
      };
      const jumpQ = sq => {
        const k0 = sq.kind === 'arith' ? 10 : sq.kind === 'geom' && sq.rs === '0.6' ? 5 : 5, a1 = sq.a1, right = valAt(sq, k0);
        let w;
        if (sq.kind === 'arith') w = [[rd(a1 + sq.d * k0), `That adds ${num(sq.d)} a total of ${k0} times. But term ${k0} has taken only ${k0 - 1} steps from the first term, so you add ${k0 - 1} times.`], [rd(sq.d * k0), `That is ${num(sq.d)} · ${k0}. It forgets the starting value ${vt(a1)}.`]];
        else w = [[rd(a1 * Math.pow(sq.r, k0)), `That multiplies by ${sq.rs} a total of ${k0} times. Term ${k0} has been multiplied only ${k0 - 1} times.`], [rd(a1 * sq.r * (k0 - 1)), `That multiplies ${sq.rs} by ${k0 - 1}. Multiplying by ${sq.rs} again and again, ${k0 - 1} times, is a power: ${sq.rs}^{${k0 - 1}}.`]];
        const all = w.slice(); const rt = [right, `${sq.kind === 'arith' ? `a_{${k0}} = ${vt(a1)} + ${num(sq.d)}(${k0 - 1})` : `a_{${k0}} = ${vt(a1)} · ${sq.rs}^{${k0 - 1}}`} = ${lab(sq, right)}. It took one calculation, not ${k0 - 1} steps.`];
        all.splice((st.seq + 1) % 3, 0, rt);
        return {
          prompt: rh(sq.kind === 'arith' ? `The first term is ${lab(sq, a1)} and every term is ${num(sq.d)} more than the one before. Without building the list, what is the ${ord(k0)} term?` : `The first term is ${lab(sq, a1)} and every term is ${sq.rs} times the one before. Without building the list, what is the ${ord(k0)} term?`),
          opts: all.map(o => ({ label: lab(sq, o[0]), ok: o === rt, fb: rh(o[1]) })),
          onRight: fb => { carry = fb + ' Now slide to any term you like.'; st.jpred = true; st.k = k0; }
        };
      };
      const verdictQ = sq => {
        const t = terms(sq, cnOf(sq)), D = diffs(t), R = ratios(t), A = allEq(D), G = allEq(R), dl = D.map(vt).join(', '), rl = R.map(vt).join(', ');
        const opts = [
          { label: 'Arithmetic: add the same number each time', ok: A, fb: A ? `Every difference is ${vt(D[0])} (${dl}). The difference is constant, so the list is arithmetic. The ratios (${rl}) are not all equal.` : `The differences are ${dl}. They are not all the same, so the list does not add the same number each time.` + (G ? ` The ratios are all ${vt(R[0])}: this list multiplies.` : '') },
          { label: 'Geometric: multiply by the same number each time', ok: G, fb: G ? `Every ratio is ${vt(R[0])} (${rl}). The ratio is constant, so the list is geometric. The differences (${dl}) keep changing.` : `The ratios are ${rl} (rounded). They are not all the same, so the list does not multiply by the same number each time.` + (A ? ` The differences are all ${vt(D[0])}: this list adds.` : '') },
          { label: 'Neither', ok: !A && !G, fb: !A && !G ? `The differences (${dl}) change, and the ratios (${rl}, rounded) change. Neither is constant, so the list is neither arithmetic nor geometric.` : A ? `The differences are all ${vt(D[0])}, which is constant. So it is arithmetic.` : `The ratios are all ${vt(R[0])}, which is constant. So it is geometric.` }
        ];
        return { prompt: 'What kind of list is this? Compare at least three pairs of neighbours first.', opts, gate: () => st.pairs.filter(Boolean).length >= 3,
          onRight: fb => { carry = fb; st.cls = 1; st.shape = 0; cancel2(); cancel2 = animateTo(st, { shape: 1 }, 700, () => P.draw()); } };
      };
      const clsRuleQ = sq => ({ prompt: 'Now write the recursive rule: where does the list start, and how do you get each term from the one before?', opts: ruleOpts(sq, st.seq + 1).map(o => ({ ...o, fb: rh(o.fb) })),
        onRight: fb => { carry = fb; st.cls = (sq.kind === 'arith' || sq.kind === 'geom') ? 2 : 3; } });
      const clsExQ = sq => ({ prompt: 'Now an explicit formula that jumps straight to term n. Test it on n = 1 before you choose.', opts: exOpts(sq, st.seq + 2).map(o => ({ ...o, fb: rh(o.fb) })),
        onRight: fb => { carry = fb; st.cls = 3; } });

      const qFor = () => {
        const sq = cur(), v = st.view;
        if (v === 'chain' || v === 'other') {
          if (st.n < sq.max) {
            if (!st.showRule && st.n >= sq.ruleAt) return ['r' + st.seq, () => ruleQ(sq), 'Find the rule'];
            return [`c${st.seq}:${st.n}:${+st.showRule}`, () => nextQ(sq, st.n), st.showRule ? 'Your move: apply the rule' : 'Predict the next term'];
          }
          return ['cd' + st.seq, null, 'Chain complete'];
        }
        if (v === 'jump') {
          if (sq.kind !== 'arith' && sq.kind !== 'geom') return ['jx', null, 'No jump formula'];
          if (!st.jpred) return ['j' + st.seq, () => jumpQ(sq), 'Predict first'];
          return ['jd' + st.seq, null, 'Explore'];
        }
        if (st.cls === 0) return ['k' + st.seq + ':0', () => verdictQ(sq), 'Decide the kind'];
        if (st.cls === 1) return ['k' + st.seq + ':1', () => clsRuleQ(sq), 'Recursive rule'];
        if (st.cls === 2) return ['k' + st.seq + ':2', () => clsExQ(sq), 'Explicit formula'];
        return ['k' + st.seq + ':3', null, 'Done'];
      };
      const msgFor = key => {
        const sq = cur();
        if (key.startsWith('cd')) return `The chain is complete: ${sq.max} terms, each built from the one before. To reach a_{${sq.max}} you had to build every earlier box. Choose another list, or build it again.`;
        if (key === 'jx') return 'This list has no simple jump formula. Choose the Staircase, Tripling, Halving, Savings, Town or Ball list to use the formula.';
        if (key.startsWith('jd')) return 'Slide to any term. Try the 50th on a list that allows it, then switch on "Count from n = 0" to see how the labels shift but the numbers do not.';
        if (key.startsWith('k')) return (sq.kind === 'arith' || sq.kind === 'geom') ? 'Done: you described this list both ways. Test the explicit formula with n = 1 and n = 2 to see it match the boxes. Then pick another list.'
          : 'Done. This list is neither arithmetic nor geometric, so it has no formula of the form a_{1} + (n − 1)d or a_{1} · r^{n−1}. A recursive rule is the natural way to describe it. Pick another list to compare.';
        return '';
      };
      const probQ = () => {
        const pr = PROBS[prIdx];
        return { prompt: rh(pr.q), opts: pr.ch.map((o, i) => ({ label: rh(o[0]), ok: i === pr.ans, fb: rh(o[1]) })),
          onRight: fb => { prSolved = true; if (!prTried) prFirst++; prDone++; pnext.disabled = false; tally(); },
          onWrong: () => { prTried = true; } };
      };

      const showQ = q => {
        curQ = q; qPrompt.innerHTML = q.prompt; qBtns.replaceChildren(); qFb.innerHTML = carry; carry = '';
        curBtns = q.opts.map((o, i) => { const b = mkBtn('', () => choose(i), false, o.label); b._dead = false; qBtns.append(b); return b; });
      };
      const choose = i => {
        const q = curQ; if (!q || q.done || curBtns[i]._dead) return;
        if (q.gate && !q.gate()) return;
        const o = q.opts[i];
        if (o.ok) { q.done = true; curBtns.forEach(b => { b.disabled = true; }); curBtns[i].classList.add('primary'); const fb = good('Right.') + ' ' + o.fb; qFb.innerHTML = fb; if (q.onRight) q.onRight(fb); }
        else { curBtns[i]._dead = true; curBtns[i].disabled = true; qFb.innerHTML = bad('Not quite.') + ' ' + o.fb + ' Try another answer.'; if (q.onWrong) q.onWrong(); }
        sync();
      };

      /* ---------------- practice ---------------- */
      const tally = () => { qTitle.textContent = `Problem ${prIdx + 1} of ${PROBS.length}: ${PROBS[prIdx].name}. Right first time: ${prFirst} of ${prDone} done`; };
      const loadProb = () => {
        prSolved = false; prTried = false; st.pair = 0; st.pairs = []; pnext.disabled = true; pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem'; curKey = ''; carry = '';
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); sync(); return; }
        prOver = true; sync();
      };

      /* ---------------- readouts and sync ---------------- */
      const roText = () => {
        const sq = cur(), v = st.view, L = [];
        if (v === 'chain' || v === 'other') {
          const t = terms(sq, st.n);
          L.push(`${kk('Terms so far')} ${t.map(x => lab(sq, x)).join(', ')}`);
          L.push(`${kk('Steps taken')} ${st.n - sq.n0}` + (sq.kind === 'fib' ? ' (the first two terms are given)' : ''));
          if (st.showRule) L.push(`${kk('Rule')} ${rh(ruleStr(sq))}`);
        } else if (v === 'jump') {
          if ((sq.kind === 'arith' || sq.kind === 'geom') && st.jpred) {
            const k = st.k, val = valAt(sq, k), nm = k - (st.zero ? 1 : 0);
            L.push(`${kk('Term')} the ${ord(k)} term is ${rh(`a_{${nm}}`)} = ${vtx(val) === vt(val) ? lab(sq, val) : '≈ ' + (sq.pre || '') + vt(val)}`);
            L.push(`${kk('Recursion')} ${k - 1} step${k - 1 === 1 ? '' : 's'}`, `${kk('Formula')} 1 calculation`);
            if (st.zero) L.push(`Counting from 0, the list reads ${rh('a_{0}, a_{1}, a_{2}')}, … so the ${ord(k)} term is ${rh(`a_{${k - 1}}`)}. The numbers are the same. Only the labels moved, and the formula loses its “− 1”.`);
          } else L.push('Predict first, then the slider unlocks.');
        } else {
          const n = st.pairs.filter(Boolean).length;
          L.push(`${kk('Pairs compared')} ${n} of ${cnOf(sq) - 1}` + (st.cls === 0 ? (n >= 3 ? '. You can decide now.' : '. Compare at least 3 before you decide.') : ''));
        }
        return L.join('<br>');
      };
      const sync = () => {
        const prac = st.practice, over = prac && prOver, v = st.view, sq = cur();
        vis(exBox, !prac); vis(roBox, !prac); vis(pnextBox, prac && !over); vis(jumpBox, !prac && v === 'jump'); vis(clsBox, !prac && v === 'classify');
        vis(againBox, !prac && (v === 'chain' || v === 'other') && (st.n > sq.n0)); vis(qBox, true);
        if (!prac && v === 'jump' && builtFor !== st.seq) { buildK(); }
        if (!prac && v === 'classify' && builtFor !== st.seq + 100) { buildPair(); }
        builtFor = !prac ? (v === 'jump' ? st.seq : v === 'classify' ? st.seq + 100 : builtFor) : builtFor;
        /* the question block */
        let key, mk, title;
        if (prac) { if (over) { key = 'over'; mk = null; title = 'All eight problems are done'; } else { key = 'p' + prIdx; mk = probQ; title = ''; } }
        else [key, mk, title] = qFor();
        if (key !== curKey) {
          curKey = key; curQ = null; curBtns = [];
          if (mk) { const q = mk(); showQ(q); if (prac) tally(); }
          else {
            qBtns.replaceChildren();
            if (prac && over) {
              qPrompt.innerHTML = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`; qFb.innerHTML = '';
              qBtns.append(mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; prOver = false; loadProb(); sync(); }, true));
            } else { qPrompt.innerHTML = rh(msgFor(key)); qFb.innerHTML = carry; carry = ''; }
          }
          if (!prac) qTitle.textContent = title;
          else if (over) qTitle.textContent = `Right on the first try: ${prFirst} of ${PROBS.length}`;
        }
        if (curQ && curQ.gate) { const g = curQ.gate(); curBtns.forEach(b => { b.disabled = !g || b._dead || curQ.done; }); }
        if (!prac) {
          if (kS && v === 'jump') { kS.set(Math.min(st.k, kS.inp.max)); kS.inp.disabled = !st.jpred; zeroT.disabled = !st.jpred; }
          if (pairS && v === 'classify') { pairS.set(Math.max(1, st.pair || 1)); }
          ro.innerHTML = roText();
        }
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        if (exSel) exSel.value = String(st.seq);
        zeroT.checked = st.zero;
        P.draw();
      };

      const apply = (patch, immediate) => {
        cancel(); cancel2(); st.practice = false;
        if (patch.view) st.view = patch.view;
        setSeq(patch.seq !== undefined ? patch.seq : st.seq);
        st.zero = false; st.pop = 1; curKey = ''; builtFor = -1;
        if (immediate) { st.fade = 1; sync(); } else { st.fade = 0; sync(); cancel = animateTo(st, { fade: 1 }, 500, () => P.draw()); }
      };
      sync();
      return { destroy: () => { cancel(); cancel2(); P.destroy(); }, apply };
    }
  });
}
