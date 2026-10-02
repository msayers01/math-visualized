/* =====================================================================
   SCHOOL — Arithmetic and geometric series
   ===================================================================== */
{
  const FONT = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
  const MI = '−';

  /* ----- exact fractions: {n, d} with d > 0 ----- */
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const Q = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; return { n: n / g, d: d / g }; };
  const qa = (x, y) => Q(x.n * y.d + y.n * x.d, x.d * y.d);
  const qm = (x, y) => Q(x.n * y.n, x.d * y.d);
  const qn = x => Q(-x.n, x.d);
  const qs = (x, y) => qa(x, qn(y));
  const qd = (x, y) => Q(x.n * y.d, x.d * y.n);
  const qp = (x, k) => { let r = Q(1); for (let i = 0; i < k; i++) r = qm(r, x); return r; };
  const qt = x => (x.n < 0 ? MI : '') + Math.abs(x.n) + (x.d === 1 ? '' : '/' + x.d);
  const qv = x => x.n / x.d;
  const qe = (x, y) => x.n === y.n && x.d === y.d;
  const qdec = x => { const v = Math.round(qv(x) * 10000) / 10000; return (v < 0 ? MI : '') + Math.abs(v); };
  const sumQ = L => L.reduce((s, v) => qa(s, v), Q(0));
  const sgn = x => (x.n < 0 ? ` ${MI} ${qt(qn(x))}` : ` + ${qt(x)}`);
  const joinSum = L => L.map((v, i) => (i === 0 ? qt(v) : v.n < 0 ? ` ${MI} ${qt(qn(v))}` : ` + ${qt(v)}`)).join('');

  /* common ratios the student can pick */
  const RK = { '1/2': Q(1, 2), '1/3': Q(1, 3), '2/3': Q(2, 3), '-1/2': Q(-1, 2), '2': Q(2), '3': Q(3), '-1': Q(-1), '-2': Q(-2), '1': Q(1) };
  const RORDER = ['1/2', '1/3', '2/3', '-1/2', '2', '3', '-1', '-2', '1'];
  const RLAB = k => (k === '1' ? '1 (the trap)' : k.replace('-', MI));

  /* ----- a "scene config" cf: { view, kind, a1, d, rk, n, ... } ----- */
  const rOf = cf => RK[cf.rk];
  const termAt = (cf, k) => (cf.view === 'shift' || cf.view === 'inf' || (cf.view === 'running' && cf.kind === 'geom') ? qm(Q(cf.a1), qp(rOf(cf), k - 1)) : Q(cf.a1 + cf.d * (k - 1)));
  const termsOf = (cf, n) => { const t = []; for (let k = 1; k <= n; k++) t.push(termAt(cf, k)); return t; };
  const partials = T => { const S = []; let s = Q(0); T.forEach(v => { s = qa(s, v); S.push(s); }); return S; };
  /* the closed forms the lesson teaches */
  const arithFormula = (a1, d, n) => qd(qm(Q(n), qa(Q(a1), Q(a1 + d * (n - 1)))), Q(2));
  const geomFormula = (a1, r, n) => (qe(r, Q(1)) ? qm(Q(n), Q(a1)) : qd(qm(Q(a1), qs(Q(1), qp(r, n))), qs(Q(1), r)));
  const infLimit = (a1, r) => qd(Q(a1), qs(Q(1), r));
  const settles = r => Math.abs(qv(r)) < 1;

  /* ----- sigma machine expressions ----- */
  const EX = [
    { s: 'k', f: k => Q(k) }, { s: '2k', f: k => Q(2 * k) }, { s: '3k', f: k => Q(3 * k) }, { s: '5k', f: k => Q(5 * k) },
    { s: '2k + 1', f: k => Q(2 * k + 1) }, { s: 'k²', f: k => Q(k * k) }, { s: '2^{k}', f: k => Q(Math.pow(2, k)) },
    { s: '2^{k−1}', f: k => Q(Math.pow(2, k - 1)) }, { s: '(1/2)^{k}', f: k => Q(1, Math.pow(2, k)) }
  ];
  const sgTerms = sg => { const L = []; for (let k = sg.s; k <= sg.e; k++) L.push(EX[sg.ex].f(k)); return L; };
  const TG = [
    { terms: [3, 5, 7, 9, 11], name: '3 + 5 + 7 + 9 + 11' },
    { terms: [2, 4, 8, 16, 32], name: '2 + 4 + 8 + 16 + 32' },
    { terms: [5, 10, 15, 20], name: '5 + 10 + 15 + 20' },
    { terms: [1, 4, 9, 16, 25], name: '1 + 4 + 9 + 16 + 25' }
  ];

  /* ----- small rich-text helper for the canvas (subscripts and superscripts) ----- */
  const parts = s => {
    const out = []; let last = 0;
    s.replace(/([_^])\{([^}]*)\}/g, (m, k, t, i) => { if (i > last) out.push([s.slice(last, i), 0]); out.push([t, k === '_' ? 1 : 2]); last = i + m.length; return m; });
    if (last < s.length) out.push([s.slice(last), 0]);
    return out;
  };
  const richW = (c, s, size, wt) => { size = Math.max(size, 12); let w = 0; parts(s).forEach(([t, m]) => { c.font = `${wt} ${m ? size * .7 : size}px ${FONT}`; w += c.measureText(t).width; }); return w; };
  const rich = (c, s, x, y, size, color, align = 'center', wt = 500) => {
    size = Math.max(size, 12);
    const w = richW(c, s, size, wt); let px = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = color;
    parts(s).forEach(([t, m]) => { c.font = `${wt} ${m ? size * .7 : size}px ${FONT}`; c.fillText(t, px, y + (m === 1 ? size * .22 : m === 2 ? -size * .32 : 0)); px += c.measureText(t).width; });
    return w;
  };
  const fitRich = (c, s, x, y, size, maxW, color, align, wt = 500, min = 12) => { let z = size; while (z > min && richW(c, s, z, wt) > maxW) z -= .5; return rich(c, s, x, y, z, color, align, wt); };
  /* HTML version of the same markup for the panel */
  const rh = s => s.replace(/_\{([^}]*)\}/g, '<sub>$1</sub>').replace(/\^\{([^}]*)\}/g, '<sup>$1</sup>');
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;
  const rect = (c, x, y, w, h2) => c.rect(x, Math.min(y, y + h2), w, Math.abs(h2));

  /* ----- Practice: a fixed list. sc is the picture shown on the canvas. ----- */
  const PRAC = [
    { name: 'Which formula?', sc: { view: 'running', kind: 'geom', a1: 2, rk: '3', n: 5, hide: 1 },
      q: 'Look at the bars: 2 + 6 + 18 + 54 + 162. Which formula fits this sum?', ans: 1,
      ch: [['S = n(a_{1} + a_{n})/2', 'That pairs the two ends, so it needs the same difference every time. Here the differences are 4, 12, 36. They change. The ratios are all 3.'],
        ['S = a_{1}(1 − r^{n})/(1 − r)', 'Each term is 3 times the one before, so r = 3 and the list is geometric. S = 2(1 − 3^{5})/(1 − 3) = 2(−242)/(−2) = 242. Adding directly gives 2 + 6 + 18 + 54 + 162 = 242 too.'],
        ['S = a_{1}/(1 − r)', 'That one is for a sum that goes on forever, and it needs r between −1 and 1. This sum stops after 5 terms and r = 3.'],
        ['S = n · a_{1}', 'That only works when every term is the same (r = 1). These terms grow.']] },
    { name: 'An arithmetic sum', sc: { view: 'running', kind: 'arith', a1: 5, d: 3, n: 9, hide: 1 },
      q: 'Find 5 + 8 + 11 + … + 29. First count the terms, then use the pairs idea.', ans: 2,
      ch: [['306', 'That is 9 × 34. Each pair adds to 34, but 9 pairs counts every term twice (forward and backward). Halve it.'],
        ['136', 'That uses 8 terms: 29 − 5 = 24, and 24 ÷ 3 = 8 steps. Steps are one fewer than terms. There are 9 terms.'],
        ['153', '29 = 5 + 3(n − 1) gives n = 9. Each pair adds 5 + 29 = 34. S = 9 × 34 ÷ 2 = 153.'],
        ['261', 'That is 9 × 29, as if every term were the last term. The terms start small, so the average is (5 + 29)/2 = 17, and 9 × 17 = 153.']] },
    { name: 'Gauss, up to 50', sc: { view: 'gauss', kind: 'arith', a1: 1, d: 1, n: 50, rev: 1, hide: 1 },
      q: 'Add 1 + 2 + 3 + … + 50 the way Gauss did.', ans: 0,
      ch: [['1275', '1 + 50 = 51. There are 50 numbers, so 50 × 51 = 2550 counts everything twice. Half of 2550 is 1275.'],
        ['2550', 'That is 50 × 51, the whole rectangle. The rectangle holds two copies of the sum (forward and backward). Halve it.'],
        ['1225', 'That is 49 × 50 ÷ 2. It adds 1 to 49 only. The last term 50 is missing, so n is 50, not 49.'],
        ['1250', 'That is 50 × 25. The average of the list is (1 + 50)/2 = 25.5, not 25.']] },
    { name: 'A geometric sum', sc: { view: 'shift', kind: 'geom', a1: 3, rk: '2', n: 6, hide: 1 },
      q: 'Find 3 + 6 + 12 + 24 + 48 + 96. It has 6 terms and r = 2.', ans: 2,
      ch: [['192', 'That is the 7th term, 3 × 2^{6} = 192. A sum adds the six terms, and that gives a different number.'],
        ['93', 'That uses 5 terms: 3(2^{5} − 1) = 93. Count again. The list has 6 terms, so the power is 6.'],
        ['189', 'S = 3(1 − 2^{6})/(1 − 2) = 3(−63)/(−1) = 189. Check: 189 = 96 + 93, and 93 is the sum of the first five terms.'],
        ['381', 'That is 3(2^{7} − 1). It uses 7 terms. The sum stops at 96, the 6th term.']] },
    { name: 'The r = 1 trap', sc: { view: 'shift', kind: 'geom', a1: 7, rk: '1', n: 6, hide: 1 },
      q: '7 + 7 + 7 + 7 + 7 + 7 is geometric with r = 1. What is the sum, and what happens if you use a_{1}(1 − r^{n})/(1 − r)?', ans: 1,
      ch: [['0, because 1 − 1^{6} = 0 on top', 'The top is 0, but so is the bottom: 1 − r = 0. You cannot divide by 0, so the formula says nothing here. Just add: 6 sevens.'],
        ['42. The formula divides by 1 − r = 0, so use n · a_{1}', 'With r = 1 every term is 7, so six of them make 6 × 7 = 42. The formula breaks because both the top and the bottom are 0.'],
        ['7, because the terms repeat', 'Repeating does not mean the sum stays the same. Each 7 is added to the total again: 7, 14, 21, 28, 35, 42.'],
        ['49, from 7^{2}', 'Nothing here is squared. Six sevens add to 6 × 7 = 42.']] },
    { name: 'Read a sigma', sc: { view: 'sigma', sg: { s: 3, e: 8, ex: 1 }, hide: 1 },
      q: 'What is the value of the sum from k = 3 to k = 8 of 2k?', ans: 2,
      ch: [['50', 'That has only 5 terms (k = 3 to 7). The number of terms is end − start + 1 = 8 − 3 + 1 = 6, not 8 − 3.'],
        ['72', 'That starts at k = 1: 2 + 4 + … + 16. The bottom of the sigma says k = 3, so the first term is 2 × 3 = 6.'],
        ['66', 'k = 3 to 8 is 6 terms: 6 + 8 + 10 + 12 + 14 + 16 = 66. Check with pairs: 3 pairs of (6 + 16) = 3 × 22 = 66.'],
        ['33', 'That adds k alone (3 + 4 + … + 8). The rule says 2k, so double every term: 2 × 33 = 66.']] },
    { name: 'Write a sigma', sc: { view: 'plain', text: '5 + 10 + 15 + 20 + 25', terms: [5, 10, 15, 20, 25] },
      q: 'Which sigma notation means 5 + 10 + 15 + 20 + 25?', ans: 2,
      ch: [['sum from k = 1 to 4 of 5k', 'That stops one term early: k = 1 to 4 gives 5 + 10 + 15 + 20. The list has 5 terms, so the top is 5.'],
        ['sum from k = 1 to 5 of 5^{k}', '5^{k} means 5, 25, 125, … It is a power of 5, but our list adds 5 each time. The rule is 5 times k.'],
        ['sum from k = 1 to 5 of 5k', 'k = 1, 2, 3, 4, 5 gives 5, 10, 15, 20, 25. There are 5 terms and each is 5 times its k.'],
        ['sum from k = 1 to 5 of (k + 5)', 'That gives 6, 7, 8, 9, 10. It adds 5 to each k instead of multiplying by 5.']] },
    { name: 'Fill in the end', sc: { view: 'sigma', sg: { s: 1, e: 10, ex: 2 }, eText: '?', hide: 1 },
      q: '3 + 6 + 9 + … + 30 is the sum from k = 1 to ? of 3k. What number goes at the top?', ans: 1,
      ch: [['9', 'k = 9 gives 27. The last term is 30 = 3 × 10, so the last k is 10.'],
        ['10', '30 = 3k gives k = 10. The terms go from k = 1 to k = 10, which is 10 − 1 + 1 = 10 terms.'],
        ['11', 'k = 11 would give 33, which is past 30. Stop at the k that makes the last term.'],
        ['30', '30 is the last TERM. The top of the sigma is the last value of k, the index. 3k = 30 gives k = 10.']] },
    { name: 'Forever, but it settles', sc: { view: 'inf', a1: 12, rk: '1/2', n: 8, hide: 1 },
      q: '12 + 6 + 3 + 1.5 + … goes on forever and each term is half the one before. What do the partial sums settle on?', ans: 0,
      ch: [['24', 'r = 1/2 is between −1 and 1, so the partial sums settle on a_{1}/(1 − r) = 12/(1/2) = 24. Check: 12, 18, 21, 22.5, 23.25 creep up toward 24.'],
        ['8', 'That is 12/(1 + 1/2). The bottom is 1 − r, not 1 + r. With r = 1/2, 1 − r = 1/2.'],
        ['18', 'That is only the first two terms, 12 + 6. The later terms add 3, then 1.5, and so on, so the sums keep going past 18.'],
        ['No limit: it keeps growing', 'The terms shrink fast enough that the total stays bounded. The partial sums never pass 24.']] },
    { name: 'When it does not settle', sc: { view: 'inf', a1: 1, rk: '-1', n: 8, hide: 1 },
      q: '1 − 1 + 1 − 1 + … has r = −1. What do its partial sums do?', ans: 3,
      ch: [['They settle on 0, since the terms cancel in pairs', 'Pairs cancel only if you stop after an even number of terms. After 3 terms the sum is 1. The partial sums are 1, 0, 1, 0, …'],
        ['They settle on 1/2, from 1/(1 − (−1))', 'The formula a_{1}/(1 − r) only works when r is between −1 and 1. Here |r| = 1, so it does not apply.'],
        ['They settle on 1, the first term', 'S_{2} = 0, not 1. The partial sums keep switching.'],
        ['They switch between 1 and 0 and never settle', 'S_{1} = 1, S_{2} = 0, S_{3} = 1, S_{4} = 0, … No single number is approached, so this series has no sum.']] },
    { name: 'A bouncing ball', sc: { view: 'ball', H: 8, bk: '1/2', b: 2, hide: 1 },
      q: 'A ball is dropped from 8 m and bounces up to half its last height each time. How far has it travelled at the moment it hits the floor for the third time? (The first hit ends the drop.)', ans: 2,
      ch: [['14 m', 'That is 8 + 4 + 2, the drop and the two ups. Each bounce also comes back down, so every up has a matching down.'],
        ['18 m', '8 + 4 + 4 + 2 = 18 stops one leg early. At the third hit the ball has also fallen back the 2 m.'],
        ['20 m', 'Drop 8. First bounce: up 4 and down 4. Second bounce: up 2 and down 2. Total 8 + 8 + 4 = 20 m.'],
        ['24 m', '24 is where the total settles after infinitely many bounces. At the third hit the ball is still short of it, at 20 m.']] }
  ];

  register({
    id: 'arithmetic-and-geometric-series', level: 'school',
    title: 'Arithmetic and geometric series',
    blurb: 'Add up a whole sequence at once: pair up the ends, shift and subtract, and see when an endless sum settles on a number.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 5.4; p.cy = 3.6; p.span = 4.4;
      p.path([[0, 0], [11, 0]], { stroke: pal['grid-strong'], width: 1.5 });
      let s = 0;
      for (let k = 1; k <= 7; k++) {
        const a = 4 * Math.pow(.5, k - 1) * .5; const x0 = k * 1.4 - .6;
        p.path([[x0, s], [x0 + 1, s], [x0 + 1, s + a], [x0, s + a]], { close: true, fill: alpha(pal.blue, .35), stroke: pal.blue, width: 1.6 });
        s += a;
      }
      p.path([[.4, s], [10.6, s]], { stroke: pal.violet, width: 2, dash: [6, 5] });
    },
    hook: String.raw`Young Gauss was told to add 1 + 2 + 3 + … + 100 and had the answer in seconds. And 1 + 1/2 + 1/4 + … never stops, yet it never passes 2. How can adding forever give a number?`,
    steps: [
      { title: 'A list and its running total',
        text: String.raw`<p>The list \(2, 5, 8, 11, 14\) is a <b>sequence</b>. Add as you go and you get a new list: \(2, 7, 15, 26, 40\). These running totals are <b>partial sums</b>.</p><p>A <b>series</b> is the sum of the terms. Here \(S_5 = 40\), the sum of the first 5 terms. Mathematicians write \(S_5 = \sum_{k=1}^{5} a_k\).</p>`,
        set: { view: 'running', kind: 'arith', a1: 2, d: 3, n: 5 } },
      { title: 'Pair up the ends',
        text: String.raw`<p>Take \(3, 5, 7, 9, 11, 13\). Switch on <b>Stack the reversed copy</b>. Every column now reaches the same height: \(a_1 + a_n = 3 + 13 = 16\).</p><p>There are 6 columns of height 16, so the rectangle holds \(6 \times 16 = 96\). It is two copies of the sum, so \(S_6 = 96 \div 2 = 48\).</p>`,
        set: { view: 'gauss', kind: 'arith', a1: 3, d: 2, n: 6, showRev: false } },
      { title: 'Shift and subtract',
        text: String.raw`<p>Take \(3, 6, 12, 24\) with \(r = 2\). The second row is every term times \(r\), which just slides the list one place.</p><p>All the middle boxes match. Only \(a_1 = 3\) and \(a_5 = 48\) are left, so \(S - 2S = 3 - 48 = -45\). That means \(-S = -45\) and \(S = 45\).</p>`,
        set: { view: 'shift', kind: 'geom', a1: 3, rk: '2', n: 4 } },
      { title: 'Adding forever',
        text: String.raw`<p>Start with \(1 + \tfrac12 + \tfrac14 + \dots\). First predict, using the buttons: do the partial sums settle? Then slide <b>Number of terms n</b>.</p><p>They creep toward 2 but never pass it. With \(r = \tfrac12\) the limit is \(a_1/(1-r) = 1/(1/2) = 2\). Now try \(r = 2\) or \(r = -1\).</p>`,
        set: { view: 'inf', kind: 'geom', a1: 1, rk: '1/2', n: 3 } }
    ],
    formal: String.raw`
      <h3>Sequence versus series</h3>
      <p>A <em>sequence</em> is a list: \(a_1, a_2, a_3, \dots\). A <em>series</em> is what you get by adding terms of the list. The sum of the first \(n\) terms is the <em>partial sum</em>
      \[ S_n = a_1 + a_2 + \dots + a_n = \sum_{k=1}^{n} a_k. \]
      The partial sums themselves form a new sequence \(S_1, S_2, S_3, \dots\), and \(S_n = S_{n-1} + a_n\).</p>
      <h3>Arithmetic series: pair the ends</h3>
      <p>In an arithmetic sequence \(a_k = a_1 + (k-1)d\). Write the sum forwards and then backwards:
      \[ \begin{aligned} S_n &= a_1 + a_2 + \dots + a_n \\ S_n &= a_n + a_{n-1} + \dots + a_1 \end{aligned} \]
      Add the two lines column by column. Going one place right adds \(d\) in the top line and takes \(d\) away in the bottom line, so every column has the same total \(a_1 + a_n\). There are \(n\) columns, so \(2S_n = n(a_1 + a_n)\), and
      \[ S_n = \frac{n(a_1 + a_n)}{2}. \]
      This is "the number of terms times the average of the first and last term". For \(1 + 2 + \dots + 100\): \(n = 100\), \(a_1 + a_n = 101\), so \(S_{100} = 100 \cdot 101 / 2 = 5050\). If you do not know \(n\), count the terms first: \(n = (a_n - a_1)/d + 1\).</p>
      <h3>Geometric series: shift and subtract</h3>
      <p>In a geometric sequence \(a_k = a_1 r^{k-1}\). Multiply the whole sum by \(r\). Each term turns into the next one, so the list slides one place:
      \[ \begin{aligned} S_n &= a_1 + a_1 r + a_1 r^2 + \dots + a_1 r^{n-1} \\ rS_n &= \phantom{a_1 + {}} a_1 r + a_1 r^2 + \dots + a_1 r^{n-1} + a_1 r^{n} \end{aligned} \]
      Subtract. Everything cancels except the first term of the top line and the last term of the bottom line: \(S_n - rS_n = a_1 - a_1 r^n\). Factor both sides: \((1-r)S_n = a_1(1 - r^n)\). If \(r \ne 1\) we may divide by \(1 - r\):
      \[ S_n = \frac{a_1(1 - r^n)}{1 - r}. \]
      <b>The case \(r = 1\).</b> Then \(1 - r = 0\) and we may not divide. We never needed the formula: every term is \(a_1\), so \(S_n = n a_1\). Also watch the power: \(r^n\) uses \(n\), the number of terms, not \(n - 1\).</p>
      <h3>Sigma notation</h3>
      <p>The symbol \(\sum\) (capital sigma) is a machine for adding. In \(\sum_{k=3}^{8} 2k\), the letter \(k\) is the <em>index</em>. The bottom \(k = 3\) says where to start. The top \(8\) says the last value of \(k\). The rule \(2k\) says what to add for each \(k\). To read it, put \(k = 3, 4, \dots, 8\) into the rule and add: \(6 + 8 + 10 + 12 + 14 + 16 = 66\).
      The number of terms is <b>end minus start plus one</b>, here \(8 - 3 + 1 = 6\). Not \(8 - 3\). A sum is the same list whatever you call the index, so \(\sum_{k=1}^{5} 5k\) and \(\sum_{j=0}^{4} 5(j+1)\) are the same sum.
      To write a sigma, find the rule for the \(k\)-th term, then decide where \(k\) starts and stops so that the first and last terms come out right.</p>
      <h3>The infinite geometric series</h3>
      <p>We cannot add infinitely many numbers one by one. What we can do is look at the partial sums \(S_1, S_2, S_3, \dots\) and ask whether they settle on a number. Using the finite formula,
      \[ S_n = \frac{a_1(1 - r^n)}{1 - r} = \frac{a_1}{1-r} - \frac{a_1}{1-r}\, r^n. \]
      If \(|r| &lt; 1\), then \(r^n\) shrinks toward \(0\) as \(n\) grows, so \(S_n\) gets closer and closer to \(\dfrac{a_1}{1-r}\). We say the series <em>converges</em> and write \(\sum_{k=1}^{\infty} a_1 r^{k-1} = \dfrac{a_1}{1-r}\). This is the <em>limit of the partial sums</em>, not a claim that we finished adding.
      The gap between \(S_n\) and the limit is \(\dfrac{a_1}{1-r} r^n\), which shrinks by a factor of \(|r|\) at each step.</p>
      <p>If \(|r| \ge 1\), then \(r^n\) does not shrink. For \(1 + 2 + 4 + \dots\) the partial sums \(1, 3, 7, 15, \dots\) grow without bound. For \(1 - 1 + 1 - 1 + \dots\) they switch between \(1\) and \(0\) forever. In both cases there is no limit, and the series <em>diverges</em>. The formula \(a_1/(1-r)\) must not be used.</p>
      <h3>A small use: a bouncing ball</h3>
      <p>A ball is dropped from 8 m and each bounce rises to half the last height. After the drop it travels up and down the same distance on each bounce, so the total distance after \(b\) bounces is
      \[ D_b = 8 + 2\left(4 + 2 + 1 + \dots\right) = 8 + 2 \sum_{k=1}^{b} 8\left(\tfrac12\right)^k. \]
      With \(a_1 = 4\) and \(r = \tfrac12\), the bounces alone sum toward \(4/(1 - \tfrac12) = 8\), so the total distance never passes \(8 + 2 \cdot 8 = 24\) m. After a finite number of bounces it is always a little less. The ball stops moving after a finite time, so adding forever has a real meaning here.</p>`,
    check: [
      { q: 'A sequence begins 4, 7, 10, 13. Which statement correctly describes the difference between the sequence and the series made from it?',
        choices: ['The series is the sequence continued forever, so it has no last term.',
          String.raw`The sequence is the list 4, 7, 10, 13. The series is a sum of its terms, for example \(S_3 = 4 + 7 + 10 = 21\).`,
          String.raw`They are the same thing. \(S_3\) and \(a_3\) both equal 10.`,
          String.raw`The series is the list of differences 3, 3, 3, and the sequence is its sum.`], answer: 1,
        why: String.raw`A sequence is a list of numbers. A series adds terms of that list. The partial sums are \(4, 11, 21, 34, \dots\), and \(S_3 = 21\) is the sum of the first three terms. \(a_3 = 10\) is only the third term. A series can have a last term (finite) or go on forever.`,
        hint: 'One of them is a list, and the other is a total.' },
      { q: String.raw`Find \(\displaystyle\sum_{k=3}^{9} (2k + 1)\), the sum of \(2k + 1\) for \(k = 3, 4, 5, \dots, 9\).`,
        choices: ['72', '99', '182', '91'], answer: 3,
        why: String.raw`The index runs from 3 to 9, so there are \(9 - 3 + 1 = 7\) terms. The first is \(2(3)+1 = 7\) and the last is \(2(9)+1 = 19\). Then \(S = 7(7 + 19)/2 = 7 \cdot 13 = 91\). The answer 72 counts only 6 terms (\(9 - 3\)), 99 starts at \(k = 1\), and 182 forgets to halve.`,
        hint: 'Count the terms first (end minus start plus one), then find the first and last terms.' },
      { q: String.raw`Sam says: "\(1 + 3 + 9 + 27 + \dots\) goes on forever and each term is 3 times the last, so its sum is \(\dfrac{a_1}{1 - r} = \dfrac{1}{1 - 3} = -\dfrac12\)." What is wrong with this?`,
        choices: [String.raw`Nothing is wrong. The formula works for every \(r\).`,
          String.raw`The formula should be \(1/(1 + 3) = 1/4\).`,
          String.raw`The formula only applies when \(|r| &lt; 1\). Here \(r = 3\) and the partial sums \(1, 4, 13, 40, \dots\) grow without bound, so there is no sum.`,
          String.raw`The sum of a series with positive terms must be a whole number.`], answer: 2,
        why: String.raw`\(a_1/(1-r)\) comes from letting \(r^n\) shrink to 0, and that only happens when \(|r| &lt; 1\). For \(r = 3\), \(r^n\) grows, the partial sums \(1, 4, 13, 40, \dots\) grow without limit, and the series diverges. A negative total from positive terms is also impossible, a good warning sign.`,
        hint: 'What happens to the partial sums 1, 4, 13, 40, …?' }
    ],
    links: { prereq: ['sequences-recursive-and-explicit'], related: ['patterns-and-the-nth-term', 'exponential-growth', 'pascals-triangle-and-the-galton-board', 'fractals-self-similarity-and-dimension', 'percent-change-and-money', 'limits-and-epsilon-delta', 'the-real-number-system', 'exponents-and-scientific-notation'] },

    mount({ stage, controls: C }) {
      const panel = stage.nextElementSibling;
      const P = new Plane(stage, { span: 5 });
      const st = {
        view: 'running', kind: 'arith', a1: 2, d: 3, rk: '2', n: 5, showRev: false, fade: 1,
        sg: { s: 1, e: 6, ex: 4 }, wr: false, tg: 0, wrDone: false,
        H: 8, bk: '1/2', b: 3, pred: {}, practice: false
      };
      let cancel = () => {};
      let pIdx = 0, pFirst = 0, pDone = 0, pSolved = false, pTried = false, pOver = false, curQ = null, curBtns = [];

      const cfg = () => (st.practice ? PRAC[pIdx].sc : st);
      const full = cf => (cf === st ? st : { kind: 'arith', d: 1, showRev: false, ...cf, showRev: !!cf.rev });
      const hidden = cf => !!cf.hide && !(st.practice && pSolved);

      /* =================== drawing =================== */
      const mkChart = (top, bot, vals, fs, force = []) => {
        const all = vals.concat(force);
        const lo = Math.min(0, ...all), hi = Math.max(0, ...all), sp = (hi - lo) || 1;
        const rT = hi > 0 ? fs * 1.35 : 4, rB = lo < 0 ? fs * 1.35 : 4;
        const y = v => bot - rB - (v - lo) / sp * (bot - top - rT - rB);
        return { y, y0: y(0), top, bot };
      };
      const bar = (c, x, w, ya, yb, fill, stroke, lw = 1.6) => {
        c.beginPath(); rect(c, x, ya, w, yb - ya); c.fillStyle = fill; c.fill(); c.strokeStyle = stroke; c.lineWidth = lw; c.stroke();
      };
      const baseline = (c, pal, x0, x1, y) => { c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); };
      const valLabel = (c, s, cx, y, below, size, maxW, color, wt = 600) => fitRich(c, s, cx, below ? y + size * .7 : y - size * .7, size, maxW, color, 'center', wt, 10);

      const drawRunning = (c, p, cf, K) => {
        const { fs, pad, pal } = K, W = p.w, H = p.h, n = cf.n, hide = K.hide;
        const T = termsOf(cf, n), S = partials(T), tv = T.map(qv), sv = S.map(qv);
        const tH = fs * 1.7, kRow = fs * 1.5, free = H - pad * 2 - tH * 2 - kRow - 8;
        const h1 = free * .34, h2 = free * .66;
        const t1 = pad + tH, t2 = t1 + h1 + tH;
        const sw = (W - 2 * pad) / n, bw = Math.min(sw * .72, 70), lab = sw >= fs * 2.6;
        rich(c, 'The list (sequence): a_{1}, a_{2}, a_{3}, …', pad, pad + tH / 2, fs, pal.blue, 'left', 600);
        const A = mkChart(t1, t1 + h1, tv, fs);
        baseline(c, pal, pad, W - pad, A.y0);
        T.forEach((v, i) => {
          const cx = pad + sw * (i + .5), hl = i === n - 1;
          bar(c, cx - bw / 2, bw, A.y0, A.y(tv[i]), alpha(pal.blue, hl ? .32 : .16), pal.blue, hl ? 2.6 : 1.6);
          if (lab || hl) valLabel(c, qt(v), cx, tv[i] >= 0 ? A.y(tv[i]) : A.y(tv[i]), tv[i] < 0, fs * .95, sw * 1.25, pal.text);
        });
        rich(c, hide ? 'The running total (series): S_{k} = a_{1} + … + a_{k}' : 'The running total (series): S_{k} = a_{1} + … + a_{k}', pad, t2 - tH / 2, fs, pal.yellow, 'left', 600);
        const B = mkChart(t2, t2 + h2, [0].concat(sv), fs);
        baseline(c, pal, pad, W - pad, B.y0);
        const stairs = [];
        T.forEach((v, i) => {
          const cx = pad + sw * (i + .5), prev = i ? sv[i - 1] : 0, hl = i === n - 1;
          bar(c, cx - bw / 2, bw, B.y(prev), B.y(sv[i]), alpha(pal.blue, .13 + (i % 2) * .1), alpha(pal.blue, .75), 1.3);
          c.beginPath(); c.strokeStyle = pal.yellow; c.lineWidth = hl ? 4.5 : 3; c.moveTo(cx - bw / 2 - 2, B.y(sv[i])); c.lineTo(cx + bw / 2 + 2, B.y(sv[i])); c.stroke();
          stairs.push([cx, B.y(sv[i])]);
          if ((lab || hl) && !(hide && hl)) valLabel(c, qt(S[i]), cx, B.y(sv[i]), sv[i] < prev && sv[i] < 0 ? true : false, fs * .95, sw * 1.25, pal.yellow, 700);
          c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = pal.muted; c.font = `500 ${fs * .95}px ${FONT}`;
          if (sw >= fs * 1.4 || i === n - 1 || i === 0) c.fillText(String(i + 1), cx, B.bot + 2);
        });
        c.textAlign = 'left'; c.fillStyle = pal.muted; c.font = `500 ${fs * .9}px ${FONT}`; c.textBaseline = 'top';
        c.fillText('k', W - pad - 6, B.bot + 2);
        if (hide) { c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = pal.muted; c.font = `600 ${fs}px ${FONT}`; c.fillText('Total is hidden until you answer.', W / 2, t2 + h2 * .22); }
      };

      const drawGauss = (c, p, cf, K) => {
        const { fs, pad, pal } = K, W = p.w, H = p.h, n = cf.n, hide = K.hide, rev = !!(cf.showRev || cf.rev);
        const T = termsOf(cf, n), tv = T.map(qv), tot = qa(T[0], T[n - 1]), ttv = qv(tot);
        const tH = fs * 3.3, bH = fs * 3.4, top = pad + tH, bot = H - pad - bH - fs * 1.5;
        const vals = rev ? [ttv] : tv;
        const A = mkChart(top, bot, vals.concat(rev ? tv : []), fs, [ttv]);
        const sw = (W - 2 * pad) / n, bw = sw * (sw > 9 ? .8 : 1), lab = sw >= fs * 2.2, thin = sw < 8;
        rich(c, rev ? 'Forwards (blue) and backwards (red), stacked' : 'The sum forwards: a_{1} + a_{2} + … + a_{n}', pad, pad + fs * .7, fs, pal.text, 'left', 600);
        if (rev) fitRich(c, `Every column reaches a_{1} + a_{n} = ${qt(T[0])} + ${qt(T[n - 1])} = ${hide ? '?' : qt(tot)}`, pad, pad + fs * 2.2, fs, W - 2 * pad, pal.violet, 'left', 600, 12);
        else rich(c, 'Switch on “Stack the reversed copy” in the panel.', pad, pad + fs * 2.2, fs * .95, pal.muted, 'left', 500);
        baseline(c, pal, pad, W - pad, A.y0);
        T.forEach((v, i) => {
          const x = pad + sw * i + (sw - bw) / 2, ytop = A.y(tv[i]);
          bar(c, x, bw, A.y0, ytop, alpha(pal.blue, .3), pal.blue, thin ? .6 : 1.6);
          if (rev) { const w = T[n - 1 - i]; bar(c, x, bw, ytop, A.y(tv[i] + qv(w)), alpha(pal.red, .3), pal.red, thin ? .6 : 1.6); }
          if (lab) {
            const hb = Math.abs(A.y(tv[i]) - A.y0);
            if (hb > fs * 1.2) rich(c, qt(v), x + bw / 2, (A.y(tv[i]) + A.y0) / 2, fs * .95, pal.text, 'center', 600);
            if (rev) { const w = T[n - 1 - i], hr = Math.abs(A.y(tv[i] + qv(w)) - ytop); if (hr > fs * 1.2) rich(c, qt(w), x + bw / 2, (ytop + A.y(tv[i] + qv(w))) / 2, fs * .95, pal.text, 'center', 600); }
          }
          if (sw >= fs * 1.3 || i === 0 || i === n - 1) { c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = pal.muted; c.font = `500 ${fs * .9}px ${FONT}`; c.fillText(String(i + 1), x + bw / 2, A.bot + 3); }
        });
        c.save(); c.setLineDash([7, 6]); c.strokeStyle = pal.violet; c.lineWidth = 2; c.beginPath(); c.moveTo(pad, A.y(ttv)); c.lineTo(W - pad, A.y(ttv)); c.stroke(); c.restore();
        if (rev) rich(c, hide ? 'a_{1} + a_{n} = ?' : `a_{1} + a_{n} = ${qt(tot)}`, W - pad, A.y(ttv) - fs * .75, fs * .95, pal.violet, 'right', 700);
        const y0 = H - pad - bH;
        const L = [];
        if (rev) {
          L.push([`${n} columns, each ${hide ? '?' : qt(tot)}: the rectangle is ${hide ? '?' : qt(qm(Q(n), tot))}`, pal.text]);
          L.push([hide ? 'It holds two copies of the sum, so S_{n} = half of it.' : `Two copies of the sum, so S_{${n}} = ${qt(qm(Q(n), tot))} ÷ 2 = ${qt(arithFormula(cf.a1, cf.d, n))}`, pal.yellow]);
        } else {
          L.push([`The dashed line is a_{1} + a_{n} = ${hide ? '?' : qt(tot)}. The blue bars do not reach it.`, pal.muted]);
          L.push(['Turn the list around and stack it on top to fill the gap.', pal.muted]);
        }
        L.forEach(([s, col], i) => fitRich(c, s, W / 2, y0 + fs * (1.0 + i * 1.6), fs, W - 2 * pad, col, 'center', 600, 12));
      };

      const drawShift = (c, p, cf, K) => {
        const { fs, pad, pal } = K, W = p.w, H = p.h, n = cf.n, hide = K.hide, r = rOf(cf), a1 = Q(cf.a1);
        const cols = n + 1, slot = (W - 2 * pad) / cols, bw = slot - 5, bh = clamp(Math.min(slot * .8, H * .13), 42, 70);
        const row = i => qm(a1, qp(r, i));
        const trap = qe(r, Q(1));
        const gp = clamp(H * .045, fs * 2.4, fs * 4.2), y1 = pad + fs * 2.4, y2 = y1 + bh + gp;
        rich(c, 'S = a_{1} + a_{2} + … + a_{n}', pad, pad + fs * .7, fs, pal.text, 'left', 600);
        for (let i = 0; i <= n; i++) {
          const x = pad + slot * i + 2.5;
          if (i < n) {
            const sv = i === 0;
            c.beginPath(); c.roundRect ? c.roundRect(x, y1, bw, bh, 6) : c.rect(x, y1, bw, bh);
            c.fillStyle = alpha(sv ? pal.green : pal.blue, sv ? .24 : .14); c.fill(); c.strokeStyle = sv ? pal.green : pal.blue; c.lineWidth = sv ? 3 : 1.8; c.stroke();
            fitRich(c, qt(row(i)), x + bw / 2, y1 + bh * .62, fs * 1.1, bw - 4, pal.text, 'center', 600, 10);
            rich(c, `a_{${i + 1}}`, x + bw / 2, y1 + bh * .25, fs * .8, pal.muted, 'center');
          }
        }
        const lw = W - 2 * pad, rl = RLAB(cf.rk).replace(' (the trap)', '');
        for (let i = 1; i <= n; i++) {
          const x = pad + slot * i + 2.5, last = i === n;
          c.beginPath(); c.roundRect ? c.roundRect(x, y2, bw, bh, 6) : c.rect(x, y2, bw, bh);
          c.fillStyle = alpha(last ? pal.red : pal.blue, last ? .24 : .14); c.fill(); c.strokeStyle = last ? pal.red : pal.blue; c.lineWidth = last ? 3 : 1.8; c.stroke();
          fitRich(c, qt(row(i)), x + bw / 2, y2 + bh * .62, fs * 1.1, bw - 4, pal.text, 'center', 600, 10);
          rich(c, `r·a_{${i}}`, x + bw / 2, y2 + bh * .25, fs * .78, pal.muted, 'center');
          if (i < n) { c.save(); c.setLineDash([3, 4]); c.strokeStyle = pal.muted; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x + bw / 2, y1 + bh); c.lineTo(x + bw / 2, y2); c.stroke(); c.restore(); }
        }
        { const tx = `r·S: each term times r = ${rl}, so the list slides one place`; let z = fs; while (z > 12 && richW(c, tx, z, 600) > lw) z -= .5;
          const w = richW(c, tx, z, 600); c.fillStyle = pal.stage; c.fillRect(pad - 4, y2 - gp * .5 - z * .8, w + 8, z * 1.6); rich(c, tx, pad, y2 - gp * .5, z, pal.text, 'left', 600); }
        /* the two survivors */
        const first = row(0), lastv = row(n);
        const yE = y2 + bh + fs * 1.8;
        fitRich(c, 'green: a_{1} stays', pad, yE, fs * .95, lw * .4, pal.green, 'left', 600, 12);
        fitRich(c, 'red: a_{1}r^{n} stays', W - pad, yE, fs * .95, lw * .55, pal.red, 'right', 600, 12);
        const L = [];
        const d1 = qs(first, lastv), sf = geomFormula(cf.a1, r, n);
        if (hide) {
          L.push(['S − rS = a_{1} − a_{1}r^{n}, so (1 − r)S = a_{1}(1 − r^{n})', pal.text]);
          L.push([trap ? 'What happens when r = 1?' : 'Now find S.', pal.muted]);
        } else if (trap) {
          L.push([`S − rS = ${qt(first)} − ${qt(lastv)} = 0`, pal.text]);
          L.push([`(1 − r)S = 0·S = 0. Dividing by 1 − r = 0 is not allowed.`, pal.red]);
          L.push([`But every term is ${cf.a1}, so S = n·a_{1} = ${n} × ${cf.a1} = ${qt(sf)}`, pal.yellow]);
        } else {
          L.push([`S − rS = ${qt(first)} − ${qt(lastv)} = ${qt(d1)}`, pal.text]);
          L.push([`(1 − ${qt(r)})S = ${qt(qs(Q(1), r))}·S = ${qt(d1)}`, pal.text]);
          L.push([`S_{${n}} = ${qt(d1)} ÷ ${qt(qs(Q(1), r))} = ${qt(sf)}`, pal.yellow]);
        }
        const y3 = yE + fs * 2.4;
        L.forEach(([s, col], i) => fitRich(c, s, W / 2, y3 + i * fs * 1.9, fs * 1.05, lw, col, 'center', 600, 12));
      };

      const sigmaMachine = (c, p, cf, K, x0, y0, wMax) => {
        const { fs, pal } = K, sg = cf.sg, ex = EX[sg.ex];
        const big = clamp(fs * 3.6, 48, 78), cx = x0 + big * .5;
        c.font = `500 ${big}px "STIX Two Text", "Cambria Math", "Times New Roman", serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = pal.violet;
        c.fillText('Σ', cx, y0 + big * .5);
        rich(c, cf.eText || String(sg.e), cx, y0 - fs * .1, fs * 1.2, pal.red, 'center', 700);
        rich(c, `k = ${sg.s}`, cx, y0 + big + fs * .35, fs * 1.2, pal.green, 'center', 700);
        const ex0 = cx + big * .55;
        fitRich(c, ex.s, ex0, y0 + big * .5, fs * 1.8, x0 + wMax - ex0, pal.text, 'left', 600, 14);
      };

      const drawSigma = (c, p, cf, K) => {
        const { fs, pad, pal } = K, W = p.w, H = p.h, hide = K.hide, sg = cf.sg;
        const big = clamp(fs * 3.6, 48, 78);
        const yM = pad + fs * 2 + H * .04;
        sigmaMachine(c, p, cf, K, pad + 4, yM, W - 2 * pad - 8);
        const L = sgTerms(sg), N = L.length, y1 = yM + big + fs * 2.6 + H * .04;
        if (cf.eText) {
          rich(c, 'The top number is the last value of k.', W / 2, y1 + fs, fs, pal.muted, 'center', 600);
          return;
        }
        const slot = (W - 2 * pad) / Math.max(N, 4), bw = Math.min(slot - 6, 74), bh = clamp(slot * .85, 38, 54);
        const xs = pad + (W - 2 * pad - slot * N) / 2;
        if (hide) {
          rich(c, 'Work out the terms on paper, then answer in the panel.', W / 2, y1 + fs, fs, pal.muted, 'center', 600);
          return;
        }
        L.forEach((v, i) => {
          const x = xs + slot * i + (slot - bw) / 2;
          c.beginPath(); c.roundRect ? c.roundRect(x, y1, bw, bh, 6) : c.rect(x, y1, bw, bh);
          c.fillStyle = alpha(pal.blue, .14); c.fill(); c.strokeStyle = pal.blue; c.lineWidth = 1.8; c.stroke();
          rich(c, `k = ${sg.s + i}`, x + bw / 2, y1 + bh * .26, fs * .8, pal.muted, 'center');
          fitRich(c, qt(v), x + bw / 2, y1 + bh * .67, fs * 1.1, bw - 4, pal.text, 'center', 600, 10);
        });
        const lw = W - 2 * pad, yl = y1 + bh + fs * 1.3;
        const lines = [[`Number of terms = end − start + 1 = ${sg.e} − ${sg.s} + 1 = ${N}`, pal.violet], ['Red: last k. Green: first k. Right: the rule.', pal.muted]];
        if (cf.tgt) lines.push([`Target: ${cf.tgt}`, pal.muted]);
        else lines.push([`Sum = ${joinSum(L)} = ${qt(sumQ(L))}`, pal.yellow]);
        lines.forEach(([s, col], i) => fitRich(c, s, W / 2, yl + i * fs * 1.7, fs * 1.05, lw, col, 'center', 600, 12));
      };

      const drawPlain = (c, p, cf, K) => {
        const { fs, pad, pal } = K, W = p.w, H = p.h;
        fitRich(c, cf.text, W / 2, H * .22, fs * 1.8, W - 2 * pad, pal.text, 'center', 600, 14);
        const N = cf.terms.length, slot = (W - 2 * pad) / Math.max(N, 4), bw = Math.min(slot - 6, 74), bh = clamp(slot * .85, 38, 54), xs = pad + (W - 2 * pad - slot * N) / 2, y1 = H * .38;
        cf.terms.forEach((v, i) => {
          const x = xs + slot * i + (slot - bw) / 2;
          c.beginPath(); c.roundRect ? c.roundRect(x, y1, bw, bh, 6) : c.rect(x, y1, bw, bh);
          c.fillStyle = alpha(pal.blue, .14); c.fill(); c.strokeStyle = pal.blue; c.lineWidth = 1.8; c.stroke();
          rich(c, `term ${i + 1}`, x + bw / 2, y1 + bh * .26, fs * .8, pal.muted, 'center');
          rich(c, String(v), x + bw / 2, y1 + bh * .67, fs * 1.1, pal.text, 'center', 600);
        });
        fitRich(c, 'Find the rule for the k-th term, then the start and the end.', W / 2, y1 + bh + fs * 2, fs, W - 2 * pad, pal.muted, 'center', 600, 12);
      };

      const drawInf = (c, p, cf, K) => {
        const { fs, pad, pal } = K, W = p.w, H = p.h, hide = K.hide, r = rOf(cf), a1 = cf.a1;
        const asked = cf === st ? !!st.pred[st.rk] : true;
        const NN = 12, nShow = asked ? cf.n : Math.min(3, cf.n);
        const T = termsOf({ ...cf, view: 'inf' }, nShow), S = partials(T), sv = S.map(qv);
        const conv = settles(r), L = infLimit(a1, r), Lv = qv(L);
        const showLim = conv && asked && !hide;
        const tH = fs * 3.0, bH = fs * 3.6, top = pad + tH, bot = H - pad - bH - fs * 1.4;
        const A = mkChart(top, bot, [0].concat(sv), fs, showLim ? [Lv] : []);
        const sw = (W - 2 * pad) / NN, bw = Math.min(sw * .74, 56), lab = sw >= fs * 3.3;
        rich(c, `Partial sums S_{n}  for  a_{1} = ${a1},  r = ${RLAB(cf.rk).replace(' (the trap)', '')}`, pad, pad + fs * .7, fs, pal.text, 'left', 600);
        rich(c, asked ? (conv ? 'Look at how the bars approach the dashed line.' : 'Look at the bars as n grows.') : 'Only 3 bars so far. Predict first, then the rest appear.', pad, pad + fs * 2.2, fs * .95, pal.muted, 'left', 500);
        baseline(c, pal, pad, W - pad, A.y0);
        const stair = [];
        S.forEach((v, i) => {
          const cx = pad + sw * (i + .5), hl = i === nShow - 1;
          bar(c, cx - bw / 2, bw, A.y0, A.y(sv[i]), alpha(pal.yellow, hl ? .42 : .22), pal.yellow, hl ? 2.6 : 1.6);
          if (!(hide && hl)) { let tx = qt(v); const fits = richW(c, tx, fs * .9, 600) <= sw * 1.05; if (!fits && hl) tx = '≈ ' + qdec(v).replace(/(\.\d\d)\d+/, '$1'); if (fits || hl) valLabel(c, tx, cx, A.y(sv[i]), sv[i] < 0, fs * .9, sw * 1.5, pal.text, 600); }
        });
        for (let i = 0; i < NN; i++) {
          const cx = pad + sw * (i + .5); c.textAlign = 'center'; c.textBaseline = 'top'; c.fillStyle = pal.muted; c.font = `500 ${fs * .9}px ${FONT}`;
          if (sw >= fs * 1.5 || i % 2 === 0) c.fillText(String(i + 1), cx, A.bot + 3);
        }
        c.textAlign = 'right'; c.fillStyle = pal.muted; c.fillText('n', W - 4, A.bot + 3);
        if (showLim) {
          c.save(); c.setLineDash([8, 6]); c.strokeStyle = pal.violet; c.lineWidth = 2.4; c.beginPath(); c.moveTo(pad, A.y(Lv)); c.lineTo(W - pad, A.y(Lv)); c.stroke(); c.restore();
          rich(c, `limit a_{1}/(1 − r) = ${qt(L)}`, pad, A.y(Lv) - fs * .8, fs, pal.violet, 'left', 700);
        }
        const y0 = H - pad - bH + fs * .4, lw = W - 2 * pad, lines = [];
        if (!asked) lines.push(['What will the partial sums do as n grows?', pal.muted]);
        else if (hide) lines.push(['Partial sums are the running totals S_{1}, S_{2}, S_{3}, …', pal.muted]);
        else {
          const Sn = S[nShow - 1];
          lines.push([`S_{${nShow}} = ${qt(Sn)}${Sn.d === 1 ? '' : ` ≈ ${qdec(Sn)}`}`, pal.text]);
          if (conv) { const gap = qs(L, Sn); lines.push([`Gap to the limit = ${qt(L)} − ${qt(Sn)} = ${qt(gap)}`, pal.violet]); }
          else lines.push([qe(r, Q(-1)) ? 'The sums switch between two values. They never settle.' : qv(r) === 1 ? 'S_{n} = n·a_{1} grows without limit.' : qv(r) > 1 ? 'The sums grow without limit. No sum exists.' : 'The sums swing wider and wider. No sum exists.', pal.red]);
        }
        lines.forEach(([s, col], i) => fitRich(c, s, W / 2, y0 + fs * .5 + i * fs * 1.7, fs * 1.05, lw, col, 'center', 600, 12));
      };

      const ballGeom = cf => { const r = RK[cf.bk]; return { r, H: cf.H, b: cf.b }; };
      const ballDist = cf => { const { r, H: h0, b } = ballGeom(cf); let d = Q(h0); for (let k = 1; k <= b; k++) d = qa(d, qm(Q(2 * h0), qp(r, k))); return d; };
      const ballLimit = cf => { const { r, H: h0 } = ballGeom(cf); return qa(Q(h0), qm(Q(2 * h0), qd(r, qs(Q(1), r)))); };

      const drawBall = (c, p, cf, K) => {
        const { fs, pad, pal } = K, W = p.w, H = p.h, hide = K.hide, { r, H: h0, b } = ballGeom(cf);
        const gy = H * .56, hPx = H * .38, x0 = pad + 18;
        fitRich(c, `Dropped from ${h0} m. Each bounce reaches ${qt(r)} of the last height.`, pad, pad + fs * .7, fs, W - 2 * pad, pal.text, 'left', 600, 12);
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 2; c.beginPath(); c.moveTo(pad, gy); c.lineTo(W - pad, gy); c.stroke();
        /* arcs: width proportional to the square root of the height */
        const wk = k => Math.sqrt(qv(qp(r, k)));
        let tot = 0; for (let k = 1; k <= 8; k++) tot += wk(k);
        const sc = (W - 2 * pad - 44) / tot;
        c.strokeStyle = pal.blue; c.lineWidth = 3; c.setLineDash([]);
        c.beginPath(); c.moveTo(x0, gy - hPx); c.lineTo(x0, gy); c.stroke();
        c.fillStyle = pal.blue; c.beginPath(); c.arc(x0, gy - hPx, 6, 0, TAU); c.fill();
        rich(c, `${h0} m`, x0 + 10, gy - hPx * .55, fs * .95, pal.blue, 'left', 700);
        let x = x0;
        for (let k = 1; k <= b; k++) {
          const w = wk(k) * sc, hk = hPx * qv(qp(r, k));
          c.strokeStyle = pal.blue; c.lineWidth = 3; c.beginPath();
          for (let i = 0; i <= 24; i++) { const u = i / 24, px = x + w * u, py = gy - hk * 4 * u * (1 - u); i ? c.lineTo(px, py) : c.moveTo(px, py); }
          c.stroke();
          if (k <= 3 && w > 26) rich(c, qt(qm(Q(h0), qp(r, k))) + ' m', x + w / 2, gy - hk - fs * .8, fs * .9, pal.text, 'center', 600);
          x += w;
        }
        c.fillStyle = pal.red; c.beginPath(); c.arc(x, gy, 5, 0, TAU); c.fill();
        /* the distance bar */
        const D = ballDist(cf), Lm = ballLimit(cf), by = gy + fs * 2.6, bwx = W - 2 * pad, bhh = fs * 1.5;
        rich(c, 'Distance travelled so far', pad, by - fs * 1.1, fs, pal.muted, 'left', 600);
        c.beginPath(); rect(c, pad, by, bwx, bhh); c.fillStyle = alpha(pal.muted, .1); c.fill();
        let acc = Q(0);
        const segs = [Q(h0)]; for (let k = 1; k <= b; k++) segs.push(qm(Q(2 * h0), qp(r, k)));
        segs.forEach((sv, i) => {
          const x1 = pad + qv(acc) / qv(Lm) * bwx; acc = qa(acc, sv); const x2 = pad + qv(acc) / qv(Lm) * bwx;
          c.beginPath(); rect(c, x1, by, Math.max(x2 - x1, .5), bhh); c.fillStyle = alpha(pal.blue, i % 2 ? .45 : .28); c.fill(); c.strokeStyle = pal.blue; c.lineWidth = 1; c.stroke();
        });
        c.save(); c.setLineDash([6, 5]); c.strokeStyle = pal.violet; c.lineWidth = 2.4; c.beginPath(); c.moveTo(pad + bwx, by - 4); c.lineTo(pad + bwx, by + bhh + 4); c.stroke(); c.restore();
        rich(c, hide ? 'limit: ?' : `limit ${qt(Lm)} m`, pad + bwx, by - fs * 1.1, fs, pal.violet, 'right', 700);
        const ly = by + bhh + fs * 1.5, lines = [];
        if (hide) lines.push(['Count every leg: down, then up and down for each bounce.', pal.muted]);
        else {
          lines.push([`After ${b} bounce${b === 1 ? '' : 's'}: ${qt(Q(h0))} + 2(${segs.slice(1).map(v => qt(qd(v, Q(2)))).join(' + ') || '0'}) = ${qt(D)} m`, pal.text]);
          lines.push([`Always less than the limit ${qt(Lm)} m. Short by ${qt(qs(Lm, D))} m.`, pal.violet]);
        }
        lines.forEach(([s, col], i) => fitRich(c, s, W / 2, ly + i * fs * 1.7, fs * 1.05, bwx, col, 'center', 600, 12));
      };

      P.onDraw = (c, p) => {
        const pal = p.pal, cf = full(cfg()), W = p.w, fs = clamp(W / 30, 13, 16.5), pad = clamp(W * .04, 12, 26);
        const K = { fs, pad, pal, hide: hidden(cf) };
        c.globalAlpha = clamp(st.fade, 0, 1);
        const v = cf.view;
        if (v === 'running') drawRunning(c, p, cf, K);
        else if (v === 'gauss') drawGauss(c, p, cf, K);
        else if (v === 'shift') drawShift(c, p, cf, K);
        else if (v === 'sigma') drawSigma(c, p, { ...cf, sg: cf === st ? sigmaCfg() : cf.sg, tgt: cf === st && st.wr ? TG[st.tg].name : '' }, K);
        else if (v === 'plain') drawPlain(c, p, cf, K);
        else if (v === 'inf') drawInf(c, p, cf, K);
        else if (v === 'ball') drawBall(c, p, cf, K);
        c.globalAlpha = 1;
      };
      const sigmaCfg = () => st.sg;

      /* =================== panel =================== */
      const regs = [];
      const vis = (el, on) => { if (el) el.style.display = on ? '' : 'none'; };
      const mkBtn = (label, onClick, primary, html) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick, ...(html ? { html } : {}) }, html ? null : label);
      const reg = (make, show) => { const ctl = make(); const el = panel.lastElementChild; regs.push([el, show]); return Object.assign(ctl || {}, { el }); };
      const slider = o => { const s = C.slider(o); const el = panel.lastElementChild; s.inp = el.querySelector('input'); s.out = el.querySelector('output'); return s; };
      const setRange = (s, lo, hi, v, fmtv = v => String(v)) => {
        s.inp.min = lo; s.inp.max = hi; s.inp.value = v; s.out.textContent = fmtv(v); s.inp.style.setProperty('--p', ((v - lo) / (hi - lo) * 100) + '%');
      };
      const fixTrack = s => s.inp.addEventListener('input', () => { s.inp.style.setProperty('--p', ((+s.inp.value - s.inp.min) / (s.inp.max - s.inp.min) * 100) + '%'); });

      const nRange = () => {
        const v = st.view;
        if (v === 'running') return st.kind === 'arith' ? [2, 12] : [2, 8];
        if (v === 'gauss') return [2, st.n > 20 ? 100 : 20];
        if (v === 'shift') return [2, 6];
        if (v === 'inf') return [1, 12];
        return [2, 12];
      };
      const geomView = () => st.view === 'shift' || st.view === 'inf' || (st.view === 'running' && st.kind === 'geom');
      const arithView = () => st.view === 'gauss' || (st.view === 'running' && st.kind === 'arith');
      const seqView = () => ['running', 'gauss', 'shift', 'inf'].includes(st.view);

      /* view menu */
      const VIEWS = [['running', 'List and running total'], ['gauss', 'Pair up the ends (arithmetic)'], ['shift', 'Shift and subtract (geometric)'], ['inf', 'Adding forever (infinite)'], ['sigma', 'The sigma machine'], ['ball', 'A bouncing ball']];
      C.title('Explore'); regs.push([panel.lastElementChild, () => true]);
      C.hint('The steps above walk through the ideas. This menu also has the sigma machine and a bouncing ball.'); regs.push([panel.lastElementChild, () => true]);
      const viewSel = reg(() => C.select({ label: 'What to explore', options: VIEWS.map(([v, l]) => ({ value: v, label: l })), value: 'running',
        onChange: v => { cancel(); st.view = v; if (v === 'shift' && st.kind !== 'geom') { st.kind = 'geom'; } fix(); sync(); } }), () => true);
      const kindSel = reg(() => C.select({ label: 'Kind of sequence', options: [{ value: 'arith', label: 'Arithmetic: add d each time' }, { value: 'geom', label: 'Geometric: multiply by r each time' }], value: 'arith',
        onChange: v => { cancel(); st.kind = v; if (v === 'geom' && st.rk === '1' && false) st.rk = '2'; fix(); sync(); } }), () => st.view === 'running');
      const a1S = reg(() => slider({ label: 'First term a₁', min: 1, max: 9, step: 1, value: st.a1, format: v => String(Math.round(v)), onInput: v => { cancel(); st.a1 = v; sync(); } }), () => seqView());
      const dS = reg(() => slider({ label: 'Common difference d', min: 0, max: 6, step: 1, value: st.d, format: v => String(Math.round(v)), onInput: v => { cancel(); st.d = v; sync(); } }), () => arithView());
      const rSel = reg(() => C.select({ label: 'Common ratio r', options: RORDER.map(k => ({ value: k, label: RLAB(k) })), value: st.rk,
        onChange: v => { cancel(); st.rk = v; sync(); } }), () => geomView());
      const nS = reg(() => slider({ label: 'Number of terms n', min: 2, max: 12, step: 1, value: st.n, format: v => String(Math.round(v)), onInput: v => { cancel(); st.n = v; sync(); } }), () => seqView());
      fixTrack(nS);
      const revT = reg(() => C.toggle({ label: 'Stack the reversed copy', value: false, onChange: v => { cancel(); st.showRev = v; sync(); } }), () => st.view === 'gauss');
      const gaussB = reg(() => C.buttons([
        { label: 'Gauss: 1 to 100', onClick: () => { cancel(); Object.assign(st, { a1: 1, d: 1, n: 100, showRev: true }); fix(); sync(); } },
        { label: 'Small example', onClick: () => { cancel(); Object.assign(st, { a1: 3, d: 2, n: 6 }); fix(); sync(); } }]), () => st.view === 'gauss');

      /* predict, then see (infinite view) */
      const prBox = h('div', { style: 'display:flex;flex-direction:column;gap:10px;min-width:0' });
      const prQ = h('p', { class: 'ctl-title' }, 'Predict first');
      const prP = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
      const prB = h('div', { class: 'ctl buttons' }); const prF = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
      prBox.append(prQ, prP, prB, prF); panel.append(prBox); regs.push([prBox, () => st.view === 'inf']);
      const kindOf = rk => { const r = RK[rk], v = qv(r); return settles(r) ? 0 : v >= 1 ? 1 : 2; };
      const PREDS = ['They settle on one number', 'They keep growing in one direction', 'They swing back and forth and never settle'];
      const predFb = rk => {
        const r = RK[rk], k = kindOf(rk), L = infLimit(st.a1, r);
        if (k === 0) return `r = ${RLAB(rk)} is between −1 and 1, so r^{n} shrinks to 0 and the partial sums settle on a_{1}/(1 − r) = ${st.a1}/(${qt(qs(Q(1), r))}) = ${qt(L)}. Slide n and watch the gap close.`;
        if (k === 1) return `r = ${RLAB(rk).replace(' (the trap)', '')} is 1 or more, so r^{n} never shrinks. ${qe(r, Q(1)) ? 'Every term is a_{1}, so S_{n} = n·a_{1} grows without limit.' : 'Each new term is bigger than the last, so the partial sums grow without limit.'} There is no sum.`;
        return qe(r, Q(-1)) ? 'r = −1 makes the terms +a_{1}, −a_{1}, +a_{1}, … so the totals switch between a_{1} and 0 forever. No single number is approached.' : 'r = −2 makes the terms swing between positive and negative, each bigger than the last, so the totals swing wider and wider. No sum exists.';
      };
      const answerPred = i => {
        const rk = st.rk, k = kindOf(rk), ok = i === k;
        st.pred[rk] = 1;
        prF.innerHTML = (ok ? good('Right. ') : bad('Not quite. ')) + rh(predFb(rk));
        sync();
      };
      PREDS.forEach((t, i) => prB.append(mkBtn(t, () => answerPred(i))));

      /* sigma controls */
      const wrT = reg(() => C.toggle({ label: 'Write mode: build a sigma for a target sum', value: false, onChange: v => { cancel(); st.wr = v; st.wrDone = false; wrF.innerHTML = ''; sync(); } }), () => st.view === 'sigma');
      const tgSel = reg(() => C.select({ label: 'Target sum', options: TG.map((t, i) => ({ value: String(i), label: t.name })), value: '0', onChange: v => { st.tg = +v; wrF.innerHTML = ''; sync(); } }), () => st.view === 'sigma' && st.wr);
      const sS = reg(() => slider({ label: 'Start of k', min: 0, max: 5, step: 1, value: st.sg.s, format: v => 'k = ' + Math.round(v), onInput: v => { cancel(); st.sg.s = v; fixSg(); sync(); } }), () => st.view === 'sigma');
      const eS = reg(() => slider({ label: 'End of k', min: 0, max: 12, step: 1, value: st.sg.e, format: v => String(Math.round(v)), onInput: v => { cancel(); st.sg.e = v; fixSg(); sync(); } }), () => st.view === 'sigma');
      const exSel = reg(() => C.select({ label: 'Rule for each term', options: EX.map((e, i) => ({ value: String(i), label: e.s.replace(/\^\{([^}]*)\}/g, '^$1') })), value: String(st.sg.ex),
        onChange: v => { cancel(); st.sg.ex = +v; sync(); } }), () => st.view === 'sigma');
      const wrChk = reg(() => C.buttons([{ label: 'Check my sigma', primary: true, onClick: () => checkSigma() }]), () => st.view === 'sigma' && st.wr);
      const wrF = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); panel.append(wrF); regs.push([wrF, () => st.view === 'sigma' && st.wr]);
      const fixSg = () => {
        const sg = st.sg; if (sg.e < sg.s) sg.e = sg.s; if (sg.e > sg.s + 7) sg.e = sg.s + 7;
        setRange(eS, 0, 12, sg.e, v => String(Math.round(v)));
      };
      const checkSigma = () => {
        const sg = st.sg, mine = sgTerms(sg), want = TG[st.tg].terms.map(v => Q(v)), N = mine.length;
        const ok = N === want.length && mine.every((v, i) => qe(v, want[i]));
        let m;
        if (ok) m = good('Right. ') + `k runs from ${sg.s} to ${sg.e}, so there are ${sg.e} − ${sg.s} + 1 = ${N} terms. The rule ${rh(EX[sg.ex].s)} gives ${mine.map(qt).join(', ')}, which is the target.`;
        else if (N !== want.length) m = bad('Not yet. ') + `Your sigma has ${sg.e} − ${sg.s} + 1 = ${N} terms but the target has ${want.length}. Move the start or the end.`;
        else if (!qe(mine[0], want[0])) m = bad('Not yet. ') + `Your first term is ${qt(mine[0])} but the target starts at ${qt(want[0])}. Check the rule and the start of k.`;
        else m = bad('Not yet. ') + `Your terms are ${mine.map(qt).join(', ')} but the target is ${want.map(qt).join(', ')}. Try a different rule.`;
        wrF.innerHTML = m; st.wrDone = ok;
      };

      /* ball controls */
      const hS = reg(() => slider({ label: 'Drop height (m)', min: 4, max: 16, step: 4, value: st.H, format: v => Math.round(v) + ' m', onInput: v => { cancel(); st.H = v; sync(); } }), () => st.view === 'ball');
      const bkSel = reg(() => C.select({ label: 'Each bounce reaches', options: [{ value: '1/2', label: 'a half of the last height' }, { value: '1/3', label: 'a third of the last height' }], value: '1/2', onChange: v => { cancel(); st.bk = v; sync(); } }), () => st.view === 'ball');
      const bS = reg(() => slider({ label: 'Bounces so far', min: 0, max: 8, step: 1, value: st.b, format: v => String(Math.round(v)), onInput: v => { cancel(); st.b = v; sync(); } }), () => st.view === 'ball');

      const ro = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); panel.append(ro); regs.push([ro, () => true]);

      /* ---------- readout ---------- */
      const roText = () => {
        const v = st.view, L = [];
        if (v === 'running' || v === 'gauss' || v === 'shift' || v === 'inf') {
          const n = v === 'inf' && !st.pred[st.rk] ? Math.min(3, st.n) : st.n, cf = { ...st, n, view: v === 'running' ? 'running' : v }, T = termsOf(cf, n), S = partials(T);
          if (v === 'running' || v === 'gauss' || v === 'shift') L.push(`${kk('Terms')} ${T.slice(0, 12).map(qt).join(', ')}`);
          if (v === 'running') L.push(`${kk('Running totals')} ${S.map(qt).join(', ')}`);
          if (v === 'running' || v === 'gauss' || v === 'shift') {
            L.push(`${kk('Adding directly')} ${rh(`S_{${n}}`)} = ${joinSum(T.slice(0, 12))}${n > 12 ? ' + …' : ''} = ${qt(sumQ(T))}`);
            if ((v === 'running' && st.kind === 'arith') || v === 'gauss') L.push(`${kk('Formula')} n(a₁ + aₙ)/2 = ${n}(${qt(T[0])} + ${qt(T[n - 1])})/2 = ${qt(arithFormula(st.a1, st.d, n))}`);
            else if (qe(rOf(st), Q(1))) L.push(`${kk('Formula')} r = 1: no division allowed, so S = n·a₁ = ${n} × ${st.a1} = ${qt(geomFormula(st.a1, rOf(st), n))}`);
            else L.push(`${kk('Formula')} a₁(1 − rⁿ)/(1 − r) = ${st.a1}(1 − ${qt(qp(rOf(st), n))})/(1 − ${qt(rOf(st))}) = ${qt(geomFormula(st.a1, rOf(st), n))}`);
          }
          if (v === 'inf') {
            if (!st.pred[st.rk]) L.push('Predict in the panel above, then the controls unlock.');
            else {
              const r = rOf(st);
              L.push(`${kk('Partial sum')} ${rh(`S_{${n}}`)} = ${qt(S[n - 1])}${S[n - 1].d === 1 ? '' : ' ≈ ' + qdec(S[n - 1])}`);
              L.push(settles(r) ? `${kk('Limit')} a₁/(1 − r) = ${st.a1}/(${qt(qs(Q(1), r))}) = ${qt(infLimit(st.a1, r))}. This is the limit of the partial sums, not “adding forever”.` : `${kk('Limit')} none. |r| is 1 or more, so the formula a₁/(1 − r) does not apply.`);
            }
          }
        } else if (v === 'sigma') {
          const L2 = sgTerms(st.sg);
          L.push(`${kk('Reading it')} k goes ${st.sg.s}, …, ${st.sg.e}: that is ${st.sg.e} − ${st.sg.s} + 1 = ${L2.length} terms`);
          L.push(`${kk('Terms')} ${L2.map(qt).join(', ')}`);
          if (!st.wr) L.push(`${kk('Sum')} ${qt(sumQ(L2))}`);
          else L.push('Set the start, end and rule so that the terms match the target, then press Check.');
        } else if (v === 'ball') {
          const cf = st, D = ballDist(cf), Lm = ballLimit(cf);
          L.push(`${kk('Distance so far')} ${qt(D)} m after ${st.b} bounce${st.b === 1 ? '' : 's'}`);
          L.push(`${kk('Limit')} ${qt(Lm)} m. It never gets there, but gets as close as you like.`);
        }
        return L.join('<br>');
      };

      /* =================== practice =================== */
      const pBox = h('div', { style: 'display:flex;flex-direction:column;gap:12px;min-width:0' });
      const pTitle = h('p', { class: 'ctl-title' }); const pPrompt = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
      const pBtns = h('div', { class: 'ctl buttons' }); const pFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
      const pNext = mkBtn('Next problem', () => nextProb(), true); const pNextBox = h('div', { class: 'ctl buttons' }, pNext);
      pBox.append(pTitle, pPrompt, pBtns, pFb, pNextBox);
      C.title('Practice');
      C.hint('Eleven short problems. Nothing here is saved or scored.');
      const startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); if (st.practice) { st.practice = false; } else { st.practice = true; loadProb(); } sync(); } }])[0];
            panel.append(pBox);

      const tally = () => { pTitle.textContent = `Problem ${pIdx + 1} of ${PRAC.length}: ${PRAC[pIdx].name}. Right on the first try: ${pFirst} of ${pDone} done`; };
      const loadProb = () => {
        pSolved = false; pTried = false; pNext.disabled = true; pNext.textContent = pIdx === PRAC.length - 1 ? 'Finish' : 'Next problem';
        const pr = PRAC[pIdx]; pPrompt.innerHTML = rh(pr.q); pFb.innerHTML = ''; pBtns.replaceChildren(); pOver = false;
        curBtns = pr.ch.map((o, i) => { const b = mkBtn('', () => choose(i), false, rh(o[0])); b._dead = false; pBtns.append(b); return b; });
        tally();
      };
      const choose = i => {
        const pr = PRAC[pIdx]; if (pSolved || curBtns[i]._dead) return;
        if (i === pr.ans) { pSolved = true; curBtns.forEach(b => { b.disabled = true; }); curBtns[i].classList.add('primary'); pFb.innerHTML = good('Right. ') + rh(pr.ch[i][1]); if (!pTried) pFirst++; pDone++; pNext.disabled = false; tally(); }
        else { pTried = true; curBtns[i]._dead = true; curBtns[i].disabled = true; pFb.innerHTML = bad('Not quite. ') + rh(pr.ch[i][1]) + ' Try another answer.'; }
        sync();
      };
      const nextProb = () => {
        if (pIdx < PRAC.length - 1) { pIdx++; loadProb(); sync(); return; }
        pOver = true; pBtns.replaceChildren(); pPrompt.innerHTML = `You got ${pFirst} of ${PRAC.length} right on the first try. Press Start over to try again, or go back to the lesson.`; pFb.innerHTML = '';
        pTitle.textContent = `Right on the first try: ${pFirst} of ${PRAC.length}`; pNextBox.style.display = 'none';
        pBtns.append(mkBtn('Start over', () => { pIdx = 0; pFirst = 0; pDone = 0; pNextBox.style.display = ''; loadProb(); sync(); }, true));
        sync();
      };

      /* =================== sync =================== */
      const fix = () => {
        const [lo, hi] = nRange();
        if (st.n > hi) st.n = hi; if (st.n < lo) st.n = lo;
        if (st.view === 'shift' && st.kind !== 'geom') st.kind = 'geom';
        setRange(nS, lo, hi, st.n);
      };
      const sync = () => {
        const prac = st.practice;
        regs.forEach(([el, show]) => vis(el, !prac && show()));
        vis(pBox, prac);
        if (!prac) {
          viewSel.value = st.view; kindSel.value = st.kind; a1S.set(st.a1); dS.set(st.d); rSel.value = st.rk; revT.checked = st.showRev; wrT.checked = st.wr;
          nS.inp.disabled = st.view === 'inf' && !st.pred[st.rk];
          const asked = !!st.pred[st.rk];
          [...prB.children].forEach(b => { vis(b, !asked); }); vis(prP, !asked); if (!asked) { prP.textContent = `Adding ${st.a1} + ${qt(termAt({ ...st, view: 'inf' }, 2))} + ${qt(termAt({ ...st, view: 'inf' }, 3))} + … forever, with r = ${RLAB(st.rk).replace(' (the trap)', '')}. What will the partial sums S₁, S₂, S₃, … do?`; prF.innerHTML = ''; }
          if (st.view === 'sigma') { sS.set(st.sg.s); setRange(eS, 0, 12, st.sg.e); exSel.value = String(st.sg.ex); tgSel.value = String(st.tg); }
          if (st.view === 'ball') { hS.set(st.H); bkSel.value = st.bk; bS.set(st.b); }
          if (seqView()) { setRange(nS, ...nRange(), st.n); }
          ro.innerHTML = roText();
        }
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        P.draw();
      };

      const apply = (patch, immediate) => {
        cancel(); st.practice = false;
        const { view, kind, showRev, rk, ...nums } = patch;
        if (view !== undefined) st.view = view; if (kind !== undefined) st.kind = kind; if (showRev !== undefined) st.showRev = showRev; if (rk !== undefined) st.rk = rk;
        Object.assign(st, nums);
        if (view === 'inf') delete st.pred[st.rk];
        fix();
        if (immediate) { st.fade = 1; sync(); } else { st.fade = 0; sync(); cancel = animateTo(st, { fade: 1 }, 450, () => P.draw()); }
      };
      fix(); sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
