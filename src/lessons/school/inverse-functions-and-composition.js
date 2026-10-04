/* =====================================================================
   SCHOOL — Inverse functions and composition
   ===================================================================== */
{
  const MI = '−';
  const SUP = ['', '', '²', '³', '⁴'];
  const kk = t => `<span class="k">${t}</span>`;
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  /* numbers with up to three decimals, exact for the values used here (0.125, 3.375, ...) */
  const nf = v => { const r = +Math.abs(v).toFixed(3); return (v < 0 && r !== 0 ? MI : '') + r; };

  /* ---------- machines for composition: coefficients c[i] of x^i, and a text builder ---------- */
  const MC = {
    add1: { t: 'x + 1', c: [1, 1], w: v => `${v} + 1` },
    add3: { t: 'x + 3', c: [3, 1], w: v => `${v} + 3` },
    add4: { t: 'x + 4', c: [4, 1], w: v => `${v} + 4` },
    sub2: { t: 'x − 2', c: [-2, 1], w: v => `${v} − 2` },
    sub3: { t: 'x − 3', c: [-3, 1], w: v => `${v} − 3` },
    sub5: { t: 'x − 5', c: [-5, 1], w: v => `${v} − 5` },
    dbl: { t: '2x', c: [0, 2], w: v => (v === 'x' || v === 'x²') ? `2${v}` : `2(${v})` },
    tri: { t: '3x', c: [0, 3], w: v => (v === 'x' || v === 'x²') ? `3${v}` : `3(${v})` },
    sq: { t: 'x²', c: [0, 0, 1], w: v => v === 'x' ? 'x²' : `(${v})²` }
  };
  const EXPL = ['dbl', 'add3', 'sub2', 'tri', 'sq'];
  const ev = (k, x) => MC[k].c.reduce((s, a, i) => s + a * Math.pow(x, i), 0);
  const pAdd = (a, b) => { const r = []; for (let i = 0; i < Math.max(a.length, b.length); i++) r[i] = (a[i] || 0) + (b[i] || 0); return r; };
  const pMul = (a, b) => { const r = Array(a.length + b.length - 1).fill(0); a.forEach((x, i) => b.forEach((y, j) => { r[i + j] += x * y; })); return r; };
  const pComp = (f, g) => { let r = [0], pw = [1]; f.forEach(fk => { r = pAdd(r, pMul([fk], pw)); pw = pMul(pw, g); }); return r; };
  const pStr = c => {
    let s = '';
    for (let i = c.length - 1; i >= 0; i--) {
      const v = c[i]; if (!v) continue;
      const a = Math.abs(v), body = i === 0 ? String(a) : (a === 1 ? '' : String(a)) + 'x' + SUP[i];
      s += s ? (v < 0 ? ` ${MI} ` : ' + ') + body : (v < 0 ? MI : '') + body;
    }
    return s || '0';
  };
  const nest = (ms, inner) => ms.reduce((acc, m) => `${m.n}(${acc})`, inner);
  const vals = (ms, x) => { const v = [x]; ms.forEach(m => v.push(ev(m.k, v[v.length - 1]))); return v; };
  const laneNum = (ms, x) => {
    const v = vals(ms, x), parts = [];
    for (let i = 0; i < ms.length; i++) parts.push(nest(ms.slice(i), nf(v[i])));
    return parts.join(' = ') + ' = ' + nf(v[v.length - 1]);
  };
  const laneFormula = ms => {
    const raw = ms.reduce((acc, m) => MC[m.k].w(acc), 'x');
    const exp = pStr(ms.reduce((cur, m) => pComp(MC[m.k].c, cur), [0, 1]));
    return `${nest(ms, 'x')} = ${raw}` + (raw === exp ? '' : ` = ${exp}`);
  };
  const laneCoef = ms => ms.reduce((cur, m) => pComp(MC[m.k].c, cur), [0, 1]);
  const NCOL = { f: 'red', g: 'green', h: 'violet' };

  /* ---------- functions for the inverse scene ---------- */
  const FN = {
    lin: { name: 'f(x) = 2x + 1', inv: 'f⁻¹(x) = (x − 1)/2', f: x => 2 * x + 1, g: x => (x - 1) / 2, lo: -Infinity,
      pts: [-3, -2, -1, 0, 1, 2, 3], win: { cx: 0.5, cy: 1, span: 7 }, lt: 2.6,
      roots: c => [(c - 1) / 2], dom: 'all real numbers', rng: 'all real numbers' },
    quad: { name: 'f(x) = x² + 1', inv: 'f⁻¹(x) = √(x − 1)', f: x => x * x + 1, g: x => Math.sqrt(x - 1), lo: 0, rest: true,
      pts: [0, 0.5, 1, 1.5, 2, 2.5, 3], win: { cx: 4, cy: 4, span: 7 }, lt: 2.9,
      roots: (c, r) => (c < 1 ? [] : c === 1 ? [0] : r ? [Math.sqrt(c - 1)] : [-Math.sqrt(c - 1), Math.sqrt(c - 1)]),
      dom: 'x ≥ 0', rng: 'y ≥ 1', domU: 'all real numbers' },
    sqrt: { name: 'f(x) = √x − 1', inv: 'f⁻¹(x) = (x + 1)²', f: x => Math.sqrt(x) - 1, g: x => (x + 1) * (x + 1), lo: 0,
      pts: [0, 0.25, 1, 2.25, 4, 6.25, 9], win: { cx: 3.5, cy: 3.5, span: 6.5 }, lt: 6.25,
      roots: c => (c < -1 ? [] : [(c + 1) * (c + 1)]), dom: 'x ≥ 0', rng: 'y ≥ −1' },
    cube: { name: 'f(x) = x³', inv: 'f⁻¹(x) = ∛x', f: x => x * x * x, g: Math.cbrt, lo: -Infinity,
      pts: [-1.5, -1, -0.5, 0, 0.5, 1, 1.5], win: { cx: 0, cy: 0, span: 4 }, lt: 1.35,
      roots: c => [Math.cbrt(c)], dom: 'all real numbers', rng: 'all real numbers' },
    lin3: { name: 'f(x) = 3x − 6', inv: 'f⁻¹(x) = (x + 6)/3', f: x => 3 * x - 6, g: x => (x + 6) / 3, lo: -Infinity,
      pts: [0, 1, 2, 3, 4, 5, 6], win: { cx: 1, cy: 1, span: 8 }, lt: 4.5, roots: c => [(c + 6) / 3], dom: 'all real numbers', rng: 'all real numbers' },
    quad4: { name: 'f(x) = x² − 4, x ≥ 0', inv: 'f⁻¹(x) = √(x + 4)', f: x => x * x - 4, g: x => Math.sqrt(x + 4), lo: 0,
      pts: [0, 0.5, 1, 1.5, 2, 2.5, 3], win: { cx: 1.5, cy: 1.5, span: 6 }, lt: 3,
      roots: c => (c < -4 ? [] : [Math.sqrt(c + 4)]), dom: 'x ≥ 0', rng: 'y ≥ −4' }
  };
  const EXFN = ['lin', 'quad', 'sqrt', 'cube'];
  const exact = v => Math.abs(v * 8 - Math.round(v * 8)) < 1e-9;
  const xs = v => (exact(v) ? '' : '≈') + nf(v);

  /* ---------- the algebra: swap x and y, then undo the steps in reverse ---------- */
  const ALG = {
    lin: { start: 'y = 2x + 1', swapped: 'x = 2y + 1', final: 'f⁻¹(x) = (x − 1)/2',
      moves: [
        { ask: 'x = 2y + 1. Which move starts to get y alone?', ans: 0, res: 'x − 1 = 2y', opts: [
          ['Subtract 1 from both sides', 'The machine doubled y and then added 1. To run it backward, undo the last step first: take off the 1.'],
          ['Divide both sides by 2', 'This is legal: x/2 = y + 1/2 also works. We undo the machine in reverse order because it avoids fractions. Take off the 1 first.'],
          ['Multiply both sides by 2', 'That makes the right side bigger (4y + 2). To undo doubling you divide, and the + 1 comes off first anyway.']] },
        { ask: 'x − 1 = 2y. What is the last move?', ans: 0, res: 'y = (x − 1)/2', opts: [
          ['Divide both sides by 2', 'Dividing undoes the doubling. Every term on the left is divided too, so the left side becomes (x − 1)/2.'],
          ['Subtract 2 from both sides', 'Subtracting 2 does not undo multiplying by 2. Undo a multiplication with a division.'],
          ['Multiply both sides by 2', 'That gives 2x − 2 = 4y. The y is doubled, so you must divide.']] }
      ],
      check: 'f(f⁻¹(x)) = 2 · (x − 1)/2 + 1 = (x − 1) + 1 = x, and f⁻¹(f(x)) = (2x + 1 − 1)/2 = x. Both come back to x.' },
    quad: { start: 'y = x² + 1,  x ≥ 0', swapped: 'x = y² + 1', final: 'f⁻¹(x) = √(x − 1),  x ≥ 1',
      moves: [
        { ask: 'x = y² + 1. Which move starts to get y alone?', ans: 0, res: 'x − 1 = y²', opts: [
          ['Subtract 1 from both sides', 'The machine squared y and then added 1. Undo the last step first: take off the 1.'],
          ['Take the square root of both sides', 'Too early. The right side is y² + 1, and √(y² + 1) is not y + 1. Subtract the 1 first so only y² is left.'],
          ['Divide both sides by 2', 'There is no 2 multiplying y. The small 2 is an exponent, not a multiplier.']] },
        { ask: 'x − 1 = y². Take the square root. Remember f used only x ≥ 0. Which is f⁻¹?', ans: 0, res: 'y = √(x − 1)', opts: [
          ['y = √(x − 1)  (positive root)', 'In the swapped equation y is the OLD x, and the old x was at least 0. So y is at least 0 and only the positive root fits.'],
          ['y = −√(x − 1)  (negative root)', 'That makes y at most 0. But y plays the role of the old x, which was at least 0. This is the lower half of the sideways parabola.'],
          ['y = ±√(x − 1)  (both roots)', 'Two y values for one x is not a function. The restriction x ≥ 0 tells you to keep only the positive root.']] }
      ],
      check: 'f(f⁻¹(x)) = (√(x − 1))² + 1 = (x − 1) + 1 = x for x ≥ 1. And f⁻¹(f(x)) = √(x² + 1 − 1) = √(x²) = x, because x ≥ 0. Without x ≥ 0 the last step would give |x|, not x.' },
    sqrt: { start: 'y = √x − 1,  x ≥ 0', swapped: 'x = √y − 1', final: 'f⁻¹(x) = (x + 1)²,  x ≥ −1',
      moves: [
        { ask: 'x = √y − 1. Which move starts to get y alone?', ans: 0, res: 'x + 1 = √y', opts: [
          ['Add 1 to both sides', 'The machine took the square root and then subtracted 1. Undo the last step first: add 1.'],
          ['Square both sides', 'Too early. (√y − 1)² is not y − 1. Add 1 first so the square root stands alone.'],
          ['Subtract 1 from both sides', 'That gives x − 1 = √y − 2. The machine subtracted 1, so you undo it by adding 1.']] },
        { ask: 'x + 1 = √y. What is the last move?', ans: 0, res: 'y = (x + 1)²', opts: [
          ['Square both sides', 'Squaring undoes a square root. The left side becomes (x + 1)². Also x + 1 = √y is never negative, so x ≥ −1: that is the domain of f⁻¹.'],
          ['Take the square root of both sides', 'That adds another root. You want to remove the root, and squaring does that.'],
          ['Subtract 1 again', 'The 1 is already handled. What is left is a square root, and a square root is undone by squaring.']] }
      ],
      check: 'f(f⁻¹(x)) = √((x + 1)²) − 1 = (x + 1) − 1 = x, because x + 1 ≥ 0 when x ≥ −1. And f⁻¹(f(x)) = (√x − 1 + 1)² = (√x)² = x.' },
    cube: { start: 'y = x³', swapped: 'x = y³', final: 'f⁻¹(x) = ∛x',
      moves: [
        { ask: 'x = y³. Which move gets y alone?', ans: 0, res: 'y = ∛x', opts: [
          ['Take the cube root of both sides', 'A cube root undoes cubing: ∛(y³) = y. This works for negative numbers too, so f⁻¹ is defined for every x.'],
          ['Take the square root of both sides', 'A square root undoes squaring, not cubing. √(y³) is not y.'],
          ['Divide both sides by 3', 'The 3 is an exponent, not a multiplier. y³ means y · y · y.']] }
      ],
      check: 'f(f⁻¹(x)) = (∛x)³ = x, and f⁻¹(f(x)) = ∛(x³) = x. Both come back to x for every real x.' }
  };

  /* ---------- practice problems (a fixed list) ---------- */
  const BASE = { plan: null, hide: 0, sym: 0, both: 0, ord: 0, run: 1, cpredOn: 0, cpred: 1, ipredOn: 0, ipred: 1, alg: 0, stage: 0, chk: 0,
    hlt: 0, hc: 3, restrict: 1, pshow: 1, invShow: 1, tabdots: 0, fn: 'lin', qi: 4 };
  const tab2 = (xsr, ysr) => {
    const td = 'padding:2px 8px;border-bottom:1px solid var(--line);text-align:right';
    const one = (h1, h2, a, b) => `<table style="border-collapse:collapse;font-size:.85rem;font-variant-numeric:tabular-nums"><tr><th style="${td}">${h1}</th><th style="${td}">${h2}</th></tr>${a.map((v, i) => `<tr><td style="${td}">${nf(v)}</td><td style="${td}">${nf(b[i])}</td></tr>`).join('')}</table>`;
    return `<div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:6px">${one('x', 'f(x)', xsr, ysr)}${one('x', 'f⁻¹(x)', ysr, xsr)}</div>`;
  };
  const PR = [
    { setup: { view: 'comp', plan: [[['g', 'tri'], ['f', 'add4']]], x: 2, hide: 1 }, reveal: { hide: 0 },
      q: 'Two machines: f(x) = x + 4 and g(x) = 3x. Find f(g(2)). The machine g runs first.', ans: 1,
      ch: [['18', 'That is g(f(2)): f first (2 + 4 = 6), then g (3 · 6 = 18). In f(g(2)) the machine g runs first: g(2) = 6, then f(6) = 10.'],
        ['10', 'g(2) = 3 · 2 = 6 first, then f(6) = 6 + 4 = 10. Reading f(g(2)) from the inside out gives the order.'],
        ['6', 'That is only g(2) = 6. The second machine f still has to run: f(6) = 10.'],
        ['12', 'That adds two machine outputs, g(2) + f(2) = 6 + 6. Composition feeds the output of g into f. It does not add them.']] },
    { setup: { view: 'comp', plan: [[['f', 'sq'], ['g', 'sub3']]], x: 2, sym: 1, hide: 0 }, reveal: { sym: 0 },
      q: 'f(x) = x² and g(x) = x − 3. Find a formula for g(f(x)). The machine f runs first, then g.', ans: 3,
      ch: [['(x − 3)²', 'That is f(g(x)): subtract 3 first, then square. Here f runs first, so square first and then subtract 3.'],
        ['x² − 9', 'The 3 is subtracted once after the squaring. It is not squared. Square x (x²), then subtract 3.'],
        ['x² + 3', 'The machine g subtracts 3, so the result is x² − 3, not x² + 3.'],
        ['x² − 3', 'f squares x to get x². Then g subtracts 3 to get x² − 3. Check at x = 2: f(2) = 4, g(4) = 1, and 2² − 3 = 1.']] },
    { setup: { view: 'comp', plan: [[['h', 'sq'], ['g', 'dbl'], ['f', 'add1']]], x: 3, hide: 1 }, reveal: { hide: 0 },
      q: 'Three machines: f(x) = x + 1, g(x) = 2x and h(x) = x². Find f(g(h(3))). Work from the inside out.', ans: 2,
      ch: [['64', 'That runs the machines in the wrong order, f first: f(3) = 4, g(4) = 8, h(8) = 64. In f(g(h(3))) the inner machine h runs first.'],
        ['7', 'That skips h: g(3) = 6, f(6) = 7. All three machines must run, starting with h.'],
        ['19', 'h(3) = 9, then g(9) = 18, then f(18) = 19. Each output becomes the next input.'],
        ['18', 'That stops after g: h(3) = 9 and g(9) = 18. The machine f still adds 1, giving 19.']] },
    { setup: { view: 'inv', fn: 'lin', qi: 5, pshow: 1, invShow: 0 }, reveal: { invShow: 1 },
      q: 'The point P = (2, 5) is on the graph of f(x) = 2x + 1. Which point is on the graph of the inverse f⁻¹?', ans: 0,
      ch: [['(5, 2)', 'f turns 2 into 5, so f⁻¹ turns 5 back into 2. The coordinates trade places: this is the mirror image of P across the line y = x.'],
        ['(−2, −5)', 'That is a half-turn of P around the origin. An inverse swaps the two numbers. It does not change their signs.'],
        ['(2, −5)', 'That is P flipped over the x-axis. The mirror line for an inverse is y = x, not an axis.'],
        ['(1/2, 5)', 'That flips only the first number into a reciprocal. The inverse is not a reciprocal. It swaps the two coordinates: (5, 2).']] },
    { setup: { view: 'inv', fn: 'lin', qi: 5, pshow: 0, invShow: 0, tabdots: 1 }, reveal: { invShow: 1, pshow: 1 },
      q: 'A function f has this table. Inputs x: 0, 1, 2, 3. Outputs f(x): 1, 3, 5, 7. What is f⁻¹(5)?', ans: 3,
      ch: [['11', 'That is f(5) = 2 · 5 + 1, going forward. f⁻¹(5) asks which input gave the output 5.'],
        ['1/5', 'That treats f⁻¹ as a reciprocal. The small −1 means inverse function here, not 1/f.'],
        ['3', 'In the table 3 is the output for the input 1. We need the input whose output is 5.'],
        ['2', 'The inverse table swaps the columns. The output 5 sits next to the input 2, so f⁻¹(5) = 2. Check: f(2) = 5.']],
      extra: tab2([0, 1, 2, 3], [1, 3, 5, 7]) },
    { setup: { view: 'inv', fn: 'lin3', qi: 4, pshow: 0, invShow: 0 }, reveal: { invShow: 1 },
      q: 'Find the inverse of f(x) = 3x − 6. Swap x and y to get x = 3y − 6, then solve for y.', ans: 2,
      ch: [['(x − 6)/3', 'You subtracted 6, but f subtracted 6 after tripling. The backward machine must ADD 6 first: x + 6 = 3y.'],
        ['x/3 − 6', 'That divides first and keeps the −6. Undo in reverse order: add 6 to undo the −6, then divide by 3 to undo the ×3.'],
        ['(x + 6)/3', 'x = 3y − 6. Add 6: x + 6 = 3y. Divide by 3: y = (x + 6)/3. Check: f((x + 6)/3) = (x + 6) − 6 = x. For example f(4) = 6 and f⁻¹(6) = 12/3 = 4.'],
        ['3/(x − 6)', 'Flipping a fraction is not how inverses work. The inverse undoes the steps in reverse order.']] },
    { setup: { view: 'inv', fn: 'quad4', qi: 4, pshow: 0, invShow: 0 }, reveal: { invShow: 1 },
      q: 'f(x) = x² − 4 with the domain x ≥ 0. Swap to x = y² − 4, then solve for y. Which is f⁻¹(x)?', ans: 1,
      ch: [['−√(x + 4)', 'That gives y at most 0. But y plays the role of the old x, which was at least 0. Keep the positive root.'],
        ['√(x + 4)', 'Add 4: x + 4 = y². Take the root: since the old x was at least 0, y is at least 0, so y = √(x + 4). Check: f(√(x + 4)) = (x + 4) − 4 = x.'],
        ['√(x − 4)', 'f subtracted 4, so the inverse adds 4 before taking the root: x + 4, not x − 4.'],
        ['±√(x + 4)', 'Two outputs for one input is not a function. The restriction x ≥ 0 says keep only the positive root.']] },
    { setup: { view: 'inv', fn: 'quad', qi: 4, restrict: 0, hlt: 1, hc: 5, pshow: 0, invShow: 0 }, reveal: { restrict: 1 },
      q: 'The line y = 5 crosses the graph of f(x) = x² + 1 (all real x) at (−2, 5) and (2, 5). What does that tell you?', ans: 1,
      ch: [['f is one-to-one, so f⁻¹ is a function for all x', 'One-to-one means every horizontal line crosses the graph at most once. This line crosses twice.'],
        ['Two inputs give the output 5, so reversing f gives two answers. Restrict the domain first.', 'The backward machine would have to send 5 to both −2 and 2. That is not a function. Keeping x ≥ 0 makes the line cross once.'],
        ['f has no inverse of any kind, even after restricting', 'Restricting to x ≥ 0 fixes it: every horizontal line then crosses once, and f⁻¹(x) = √(x − 1) works.'],
        ['The test should use a vertical line', 'The vertical line test checks that a graph is a function. The horizontal line test checks that its inverse will be one.']] }
  ];

  register({
    id: 'inverse-functions-and-composition', level: 'school',
    title: 'Inverse functions and composition',
    blurb: 'Chain two machines into one, then run a machine backward and see its inverse as a mirror image.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 4;
      p.grid(1);
      p.path([[-4.5, -4.5], [4.5, 4.5]], { stroke: pal.violet, width: 2, dash: [6, 5] });
      const A = [], B = [];
      for (let x = -2.1; x <= 2.1; x += .05) { const y = x * x * x / 4 + x / 2; A.push([x, y]); B.push([y, x]); }
      p.curve(A, { stroke: pal.blue, width: 3 });
      p.curve(B, { stroke: pal.red, width: 3 });
      p.dot(1.6, 1.6 * 1.6 * 1.6 / 4 + .8, 5, pal.blue, pal.stage, 2);
      p.dot(1.6 * 1.6 * 1.6 / 4 + .8, 1.6, 5, pal.red, pal.stage, 2);
    },
    hook: String.raw`Two machines in a row make one new machine. Run a machine backward and you get its inverse. But when can a machine be run backward at all?`,
    steps: [
      { title: 'Two machines in a row',
        text: String.raw`<p>Machine \(g\) adds \(3\). Machine \(f\) doubles. Put \(2\) in: \(g\) makes \(5\), then \(f\) makes \(10\). We write \(f(g(2))=f(5)=10\).</p><p>Read it from the inside out: \(g\) acts first. Press Run, or change \(x\). As one formula, \(f(g(x))=2(x+3)=2x+6\).</p>`,
        set: { view: 'comp', fi: 'dbl', gi: 'add3', ord: 0, both: 0, x: 2, run: 1, cpredOn: 0, cpred: 1 } },
      { title: 'The order matters',
        text: String.raw`<p>Now \(x=4\). Predict first: is \(f(g(4))\) the same as \(g(f(4))\)? Then compare the two rows.</p><p>\(f(g(4))=f(7)=14\) but \(g(f(4))=g(8)=11\). Doubling after adding \(3\) is not adding \(3\) after doubling. Try other pairs: \(x+3\) and \(x-2\) do agree.</p>`,
        set: { view: 'comp', fi: 'dbl', gi: 'add3', ord: 0, both: 0, x: 4, run: 1, cpredOn: 1, cpred: 0 } },
      { title: 'Run a machine backward',
        text: String.raw`<p>The inverse \(f^{-1}\) undoes \(f\). If \(f\) turns \(1\) into \(3\), then \(f^{-1}\) turns \(3\) back into \(1\). So \(P=(1,3)\) on \(f\) pairs with \(Q=(3,1)\) on \(f^{-1}\): the two numbers trade places.</p><p>Predict where \(Q\) lands, then drag \(P\). The tables swap columns, and \(Q\) is always the mirror image of \(P\) in the line \(y=x\).</p>`,
        set: { view: 'inv', fn: 'lin', qi: 4, restrict: 1, hlt: 0, ipredOn: 1, ipred: 0, alg: 0 } },
      { title: 'Find the inverse by algebra',
        text: String.raw`<p>Without a graph: swap \(x\) and \(y\), then solve for \(y\), undoing the steps in reverse order. Use the buttons under Find the inverse.</p><p>The horizontal line test: draw a horizontal line. If it crosses the graph twice, two inputs share one output. Here \(y=5\) meets \(x^2+1\) at \(x=-2\) and \(x=2\). Switch on "Keep only \(x\ge 0\)" and it crosses once, so an inverse function exists.</p>`,
        set: { view: 'inv', fn: 'quad', qi: 4, restrict: 0, hlt: 1, hc: 5, ipredOn: 0, ipred: 1, alg: 1 } }
    ],
    formal: String.raw`
      <h3>Composition: one machine after another</h3>
      <p>The <b>composition</b> of \(f\) and \(g\) is the function \((f\circ g)(x)=f(g(x))\). Put \(x\) into \(g\) first, then put that result into \(f\). The input \(x\) must be allowed in \(g\), and \(g(x)\) must be allowed in \(f\).</p>
      <p>Take \(f(x)=2x\) and \(g(x)=x+3\). Then \(f(g(x))=2(x+3)=2x+6\), but \(g(f(x))=2x+3\). At \(x=4\) these are \(14\) and \(11\). Composition is <b>not commutative</b>: the order matters. With three functions you still work from the inside out, so \(f(g(h(3)))\) with \(h(x)=x^2\), \(g(x)=2x\), \(f(x)=x+1\) is \(f(g(9))=f(18)=19\).</p>
      <h3>The inverse: running a machine backward</h3>
      <p>The inverse function \(f^{-1}\) undoes \(f\): if \(f(a)=b\) then \(f^{-1}(b)=a\). In symbols,
      \[ f^{-1}(f(x))=x \quad\text{and}\quad f(f^{-1}(x))=x. \]
      That is the <b>check by composing</b>: if both equal \(x\), the two functions undo each other. The small \(-1\) means "inverse function", not a reciprocal: \(f^{-1}(x)\) is not \(1/f(x)\).</p>
      <p><b>Why the graph is a mirror image.</b> A point \((a,b)\) is on the graph of \(f\) exactly when \((b,a)\) is on the graph of \(f^{-1}\). Reflecting in the line \(y=x\) swaps the two coordinates of every point, so the graph of \(f^{-1}\) is the reflection of the graph of \(f\). The table of \(f^{-1}\) is the table of \(f\) with its two columns swapped, and the domain and range trade places.</p>
      <h3>When does an inverse function exist?</h3>
      <p>Suppose two different inputs \(a\) and \(c\) give the same output \(b\). The backward machine would have to send \(b\) to both \(a\) and \(c\), and a function may give only one answer. So \(f\) needs a different output for every input: it must be <b>one-to-one</b>. On a graph this is the <b>horizontal line test</b>: every horizontal line crosses the graph at most once. If a graph fails, the mirror image fails the vertical line test.</p>
      <h3>Why "swap x and y, then solve" works</h3>
      <p>The graph of \(f^{-1}\) is all points \((b,a)\) with \(b=f(a)\). Call the new input \(x=b\) and the new output \(y=a\). Then \(b=f(a)\) reads \(x=f(y)\). Solving that equation for \(y\) gives the rule that takes \(x\) back to \(y\).</p>
      <h3>Worked examples</h3>
      <p><b>Linear.</b> \(f(x)=2x+1\). Swap: \(x=2y+1\). Subtract \(1\): \(x-1=2y\). Divide by \(2\): \(y=\dfrac{x-1}{2}\). Check: \(f\!\left(\dfrac{x-1}{2}\right)=(x-1)+1=x\).</p>
      <p><b>Quadratic, with a restricted domain.</b> \(f(x)=x^2+1\) fails the horizontal line test on all of \(\mathbb{R}\), so we keep \(x\ge 0\). Swap: \(x=y^2+1\), so \(y^2=x-1\). Since \(y\) plays the role of the old \(x\), we need \(y\ge 0\), so \(y=\sqrt{x-1}\) with \(x\ge 1\). Check: \(\sqrt{x^2+1-1}=\sqrt{x^2}=|x|=x\) because \(x\ge 0\). Keeping \(x\le 0\) instead would give \(-\sqrt{x-1}\).</p>
      <p><b>Square root.</b> \(f(x)=\sqrt{x}-1\) with \(x\ge 0\). Swap: \(x=\sqrt{y}-1\). Add \(1\): \(x+1=\sqrt{y}\). Square: \(y=(x+1)^2\), with \(x\ge -1\) because \(\sqrt{y}\) is never negative.</p>
      <p><b>Cube.</b> \(f(x)=x^3\) is one-to-one on all of \(\mathbb{R}\). Swap: \(x=y^3\), so \(y=\sqrt[3]{x}\), for every real \(x\).</p>
      <h3>Caveats</h3>
      <p>Undo the steps in the reverse order from the one \(f\) used. Squaring an equation or taking a square root can add or lose a branch, so always say which branch the domain of \(f\) selects. A function with no restriction that fails the horizontal line test has no inverse <em>function</em>, though it still has an inverse <em>relation</em>.</p>`,
    check: [
      { q: 'The point (3, 7) is on the graph of a one-to-one function f. Which statement must be true?',
        choices: ['The point (−3, −7) is on the graph of the inverse f⁻¹.', 'f⁻¹(3) = 1/7.', 'The point (7, 3) is on the graph of the inverse f⁻¹.', 'f⁻¹(7) = 1/3.'], answer: 2,
        why: String.raw`\(f\) turns \(3\) into \(7\), so \(f^{-1}\) turns \(7\) back into \(3\): the point \((7,3)\) is on the graph of \(f^{-1}\). The coordinates trade places, a mirror image in the line \(y=x\). \((-3,-7)\) is a half-turn around the origin. The two reciprocal choices treat \(f^{-1}\) as \(1/f\), but the \(-1\) means inverse function.`,
        hint: 'An inverse undoes the function. What does f⁻¹ do to the output 7?' },
      { q: 'Let f(x) = 2x − 3 and g(x) = x². Find f(g(3)) − g(f(3)).',
        choices: ['24', '6', '−6', '12'], answer: 1,
        why: String.raw`\(g(3)=9\), so \(f(g(3))=f(9)=2\cdot 9-3=15\). \(f(3)=2\cdot 3-3=3\), so \(g(f(3))=g(3)=9\). The difference is \(15-9=6\). The choice \(24\) adds instead of subtracting. \(-6\) subtracts in the wrong order. \(12\) is \(15-3\), which mixes up the two compositions.`,
        hint: 'Find each composition separately, working from the inside out, then subtract.' },
      { q: 'Maya finds the inverse of f(x) = x² + 1, where the domain is x ≥ 0. Step 1: swap, x = y² + 1. Step 2: subtract 1, x − 1 = y². Step 3: take the root, y = ±√(x − 1). She says f⁻¹(x) = ±√(x − 1). Which statement is true?',
        choices: ['Step 1 is wrong: you may not swap x and y.', 'Step 2 is wrong: the 1 should be added, not subtracted.', 'Nothing is wrong, because every square root has two signs.', 'Step 3 is wrong: since f used only x ≥ 0, y must be at least 0, so f⁻¹(x) = √(x − 1) with no ±.'], answer: 3,
        why: String.raw`In the swapped equation \(y\) is the old \(x\), and the old \(x\) was at least \(0\), so only the positive root fits. A test shows the problem: \(f(2)=5\), and \(\pm\sqrt{5-1}=\pm 2\) gives two answers for \(f^{-1}(5)\), so it is not a function. Swapping is exactly how an inverse is found, and subtracting \(1\) from both sides is correct.`,
        hint: 'Check f(2) = 5. What should f⁻¹(5) be, and how many answers does ±√(5 − 1) give?' }
    ],
    links: { related: ['what-is-a-function', 'functions-as-transformations', 'domain-and-range-of-functions', 'quadratics-and-the-parabola', 'square-roots-and-irrational-numbers'] },

    mount({ stage, controls: C }) {
      const st = Object.assign({ view: 'comp', fi: 'dbl', gi: 'add3', x: 2, practice: false }, BASE);
      let cancel = () => {};
      const panel = stage.nextElementSibling;
      const P = new Plane(stage, { cx: 0, cy: 0, span: 6 });
      let prIdx = 0, prSolved = false, prTried = false, prFirst = 0, prDone = 0, prOver = false, snap0 = null;

      const lanes = () => {
        if (st.plan) return st.plan.map(L => L.map(([n, k]) => ({ n, k })));
        const f = { n: 'f', k: st.fi }, g = { n: 'g', k: st.gi };
        return st.both ? [[g, f], [f, g]] : [st.ord ? [f, g] : [g, f]];
      };
      const showInv = () => (st.practice ? !!st.invShow : (!st.ipredOn || !!st.ipred));
      const dLo = () => { const F = FN[st.fn]; return F.rest && !st.restrict ? -Infinity : F.lo; };

      /* ---------- drawing: machines ---------- */
      const rr = (c, x, y, w, hh, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + hh, r); c.arcTo(x + w, y + hh, x, y + hh, r); c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
      const SANS = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif', SERIF = '"STIX Two Text", "Cambria Math", "Times New Roman", serif';
      const drawLane = (c, p, ms, y0, lh) => {
        const pal = p.pal, n = ms.length, W = p.w;
        const mg = 10, gap = n === 3 ? 9 : 14, cwt = st.sym ? 1.3 : 1, bwt = n === 3 ? 1.4 : 1.7;
        const unit = (W - 2 * mg - 2 * n * gap) / ((n + 1) * cwt + n * bwt), cw = unit * cwt, bw = unit * bwt;
        const fs = clamp(W / 28, 12, 19), ymid = y0 + lh * .68, bh = clamp(lh * .42, 34, 72), chh = clamp(lh * .34, 28, 52);
        const v = vals(ms, st.x), cL = [], bL = [];
        let cur = mg;
        for (let i = 0; i <= n; i++) { cL.push(cur); cur += cw + gap; if (i < n) { bL.push(cur); cur += bw + gap; } }
        c.textBaseline = 'middle'; c.textAlign = 'left'; c.fillStyle = pal.text; c.font = `600 ${fs}px ${SANS}`;
        c.fillText(`${nest(ms, 'x')}: ${ms[0].n} acts first`, mg, y0 + lh * .1);
        const arrow = (x0, x1) => {
          c.strokeStyle = pal.muted; c.fillStyle = pal.muted; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, ymid); c.lineTo(x1 - 3, ymid); c.stroke();
          c.beginPath(); c.moveTo(x1, ymid); c.lineTo(x1 - 7, ymid - 4.5); c.lineTo(x1 - 7, ymid + 4.5); c.closePath(); c.fill();
        };
        for (let i = 0; i <= n; i++) {
          /* chip */
          const last = i === n, vis = st.run >= i / n - 1e-6;
          rr(c, cL[i], ymid - chh / 2, cw, chh, 8);
          c.fillStyle = pal.stage; c.fill(); c.strokeStyle = last ? pal.blue : pal['grid-strong']; c.lineWidth = last ? 3 : 1.8; c.stroke();
          let txt = '';
          if (i === 0) txt = st.sym ? 'x' : nf(st.x);
          else if (st.sym) txt = nest(ms.slice(0, i), 'x');
          else txt = (st.hide || !vis) ? '?' : nf(v[i]);
          let f2 = fs + 1; const wmax = cw - 8; c.font = `600 ${f2}px ${SANS}`;
          while (c.measureText(txt).width > wmax && f2 > 11) { f2 -= .5; c.font = `600 ${f2}px ${SANS}`; }
          c.textAlign = 'center'; c.fillStyle = (txt === '?') ? pal.muted : pal.text; c.fillText(txt, cL[i] + cw / 2, ymid + 1);
          if (i < n) {
            arrow(cL[i] + cw + 2, bL[i] - 2);
            const m = ms[i], col = pal[NCOL[m.n] || 'blue'];
            rr(c, bL[i], ymid - bh / 2, bw, bh, 7); c.fillStyle = alpha(col, .14); c.fill(); c.strokeStyle = col; c.lineWidth = 2.6; c.stroke();
            c.fillStyle = col; c.font = `italic 700 ${fs + 4}px ${SERIF}`; c.fillText(m.n, bL[i] + bw / 2, ymid - bh / 2 - 13);
            c.fillStyle = pal.text; c.font = `600 ${fs}px ${SANS}`; c.fillText(MC[m.k].t, bL[i] + bw / 2, ymid + 1);
            arrow(bL[i] + bw + 2, cL[i + 1] - 2);
          }
        }
        if (st.run > 0 && st.run < 1) {
          const xt = lerp(cL[0] + cw / 2, cL[n] + cw / 2, st.run);
          c.beginPath(); c.arc(xt, ymid, 7, 0, Math.PI * 2); c.fillStyle = pal.yellow; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 2; c.stroke();
        }
      };
      const drawComp = (c, p) => {
        const L = lanes(), lh = Math.min(L.length > 1 ? 150 : 170, (p.h - 8) / L.length);
        const top = (p.h - lh * L.length) / 2;
        L.forEach((ms, i) => drawLane(c, p, ms, top + i * lh, lh));
      };

      /* ---------- drawing: graph and mirror image ---------- */
      const drawInv = (c, p) => {
        const pal = p.pal, F = FN[st.fn], w = F.win;
        p.cx = w.cx; p.cy = w.cy; p.span = w.span;
        const bd = p.bounds(), lo = dLo(), a = F.pts[st.qi], b = F.f(a);
        const sz = clamp(p.scale * .5, 15, 18);
        p.grid(1); p.ticks(1, { size: 14 });
        /* mirror line */
        const m1 = Math.max(bd.x0, bd.y0), m2 = Math.min(bd.x1, bd.y1);
        p.path([[m1, m1], [m2, m2]], { stroke: pal.violet, width: 2.2, dash: [8, 6] });
        p.label('y = x', m2 - .5, m2 - .5, { size: sz, italic: false, color: pal.violet, dx: -24, dy: 10 });
        /* the curve of f, sampled across the window, and its reflection */
        const t0 = Math.max(lo, Math.min(bd.x0, bd.y0) - 1), t1 = Math.max(bd.x1, bd.y1) + 1, n = 700, A = [], B = [], A2 = [], B2 = [];
        const fin = isFinite(lo);
        for (let i = 0; i <= n; i++) {
          const s = fin ? Math.pow(i / n, 2) : i / n, t = t0 + (t1 - t0) * s, y = F.f(t);
          A.push([t, y]); B.push([y, t]);
        }
        if (F.rest && !st.restrict) {
          for (let i = 0; i <= 300; i++) { const t = Math.min(bd.x0, bd.y0) - 1 + (0 - (Math.min(bd.x0, bd.y0) - 1)) * i / 300, y = F.f(t); A2.push([t, y]); B2.push([y, t]); }
        }
        if (A2.length) p.curve(A2, { stroke: alpha(pal.blue, .6), width: 3 });
        p.curve(A, { stroke: pal.blue, width: 3.5 });
        const SI = showInv();
        if (SI) {
          if (B2.length) p.curve(B2, { stroke: alpha(pal.red, .6), width: 3 });
          p.curve(B, { stroke: pal.red, width: 3.5 });
        }
        const ly = F.f(F.lt);
        p.label('f', F.lt, ly, { size: 22, color: pal.blue, dx: -14, dy: -12 });
        if (SI) p.label('f⁻¹', ly, F.lt, { size: 22, color: pal.red, dx: 0, dy: -20 });
        if (SI && B2.length) p.label('not a function', F.f(2.4), -2.4, { size: sz, italic: false, color: pal.red, dx: 6, dy: -16, align: 'left' });
        /* tabulated points (practice) */
        if (st.practice && st.tabdots) [0, 1, 2, 3].forEach(x => p.dot(x, F.f(x), 5.5, pal.yellow, pal.stage, 2));
        /* horizontal line test */
        if (st.hlt) {
          const c0 = st.hc, rs = F.roots(c0, !!st.restrict || !F.rest).filter(r => r >= lo - 1e-9);
          p.path([[bd.x0, c0], [bd.x1, c0]], { stroke: pal.yellow, width: 2.4, dash: [9, 6] });
          if (!st.practice) p.dot(p.toMath(p.w - 28, 0)[0], c0, 7.5, pal.stage, pal.brass, 3);
          rs.forEach(r => p.dot(r, c0, 7, pal.yellow, pal.stage, 2.5));
          const k = rs.length;
          p.label(`y = ${nf(c0)}: ${k === 0 ? 'no crossing' : k === 1 ? '1 crossing' : k + ' crossings'}`, bd.x1 - .2, c0, { size: sz, italic: false, align: 'right', dy: -14, color: pal.text });
        }
        /* the tracked point and its mirror image */
        const showP = st.practice ? !!st.pshow : true;
        if (showP) {
          /* keep labels on the canvas: flip sides near the right edge, and below/above near the top/bottom */
          const place = (x, y, dx, dy) => {
            let d = dx, v = dy;
            if (p.X(x) > p.w - 110) d = -Math.abs(dx); else if (p.X(x) < 110) d = Math.abs(dx);
            if (p.Y(y) < 34) v = Math.abs(dy); else if (p.Y(y) > p.h - 34) v = -Math.abs(dy);
            return { dx: d, dy: v, align: d < 0 ? 'right' : 'left' };
          };
          const up = b > a, pl = `P (${nf(a)}, ${nf(b)})`, ql = `Q (${nf(b)}, ${nf(a)})`;
          if (SI) {
            p.path([[a, b], [b, a]], { stroke: alpha(pal.violet, .85), width: 2, dash: [5, 5] });
            p.dot((a + b) / 2, (a + b) / 2, 4.5, pal.stage, pal.violet, 2);
            if (F.rest && !st.restrict && a > 0) p.dot(b, -a, 7, pal.stage, alpha(pal.red, .85), 2.5);
            p.dot(b, a, 8, pal.red, pal.stage, 2.5);
            p.label(ql, b, a, Object.assign({ size: sz, italic: false, color: pal.red }, place(b, a, up ? 12 : -12, up ? 18 : -18)));
          }
          p.dot(a, b, 8.5, pal.blue, pal.brass, 3.2);
          p.label(pl, a, b, Object.assign({ size: sz, italic: false, color: pal.blue }, place(a, b, up ? -12 : 12, up ? -18 : 18)));
        }
      };
      P.onDraw = (c, p) => { if (st.view === 'comp') drawComp(c, p); else drawInv(c, p); };

      /* ---------- panel helpers ---------- */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const S = o => { const s = C.slider(o); s.wrap = panel.lastElementChild; s.inp = s.wrap.querySelector('input'); return s; };
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const addTo = (...els) => panel.append(...els);
      const lines = a => a.filter(Boolean).join('<br>');

      let selF, selG, xS, runBtns, cpQ, cpRow, cpFb, cro;
      let selFn, pS, tgR, tgH, hS, ipQ, ipRow, ipFb, iro, aWork, aAsk, aBtns, aFb;
      let startBtn, ptally, pq, pch, pfb, pnext;

      /* ----- composition controls ----- */
      grp('comp', () => {
        C.title('Two machines');
        selF = C.select({ label: 'Machine f', value: st.fi, options: EXPL.map(k => ({ value: k, label: `f(x) = ${MC[k].t}` })), onChange: v => { cancel(); st.fi = v; sync(); } });
        selG = C.select({ label: 'Machine g', value: st.gi, options: EXPL.map(k => ({ value: k, label: `g(x) = ${MC[k].t}` })), onChange: v => { cancel(); st.gi = v; sync(); } });
        xS = S({ label: 'Input x', min: -5, max: 5, step: 1, value: st.x, format: v => nf(v), onInput: v => { cancel(); st.x = v; st.run = 1; sync(); } });
        runBtns = C.buttons([
          { label: 'Run x through', primary: true, onClick: () => { cancel(); st.run = 0; sync(); cancel = animateTo(st, { run: 1 }, 1400, sync); } },
          { label: 'Swap which machine runs first', onClick: () => { cancel(); st.ord = st.ord ? 0 : 1; sync(); } }
        ]);
      });
      grp('cpred', () => {
        addTo(h('p', { class: 'ctl-title' }, 'Predict first'));
        cpQ = h('p', { class: 'hint' }); cpRow = h('div', { class: 'ctl buttons' }); cpFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        addTo(cpQ, cpRow, cpFb);
      });
      const renderCP = () => {
        cpQ.textContent = 'With f(x) = 2x, g(x) = x + 3 and x = 4: will f(g(4)) and g(f(4)) be the same number?';
        cpFb.innerHTML = ''; cpRow.replaceChildren();
        [['Yes, the same number'], ['No, different numbers']].forEach(([lab], i) => cpRow.append(mkBtn(lab, () => {
          if (st.cpred) return;
          st.cpred = 1; st.both = 1; cancel();
          Array.from(cpRow.children).forEach((b, j) => { b.disabled = true; if (j === i) b.classList.add('primary'); });
          cpFb.innerHTML = (i === 1 ? good('Right.') : bad('Not quite.')) + ' Look at the two rows. f(g(4)) = f(7) = 14, but g(f(4)) = g(8) = 11. Doubling after adding 3 is not the same as adding 3 after doubling.';
          sync();
        })));
      };
      grp('cro', () => { cro = C.readout(); });
      const compRo = () => {
        const L = lanes(), out = [];
        L.forEach(ms => { out.push(`${kk(nest(ms, 'x'))} ${laneNum(ms, st.x)}`); out.push(laneFormula(ms)); });
        if (L.length === 2) {
          const a = vals(L[0], st.x).pop(), b = vals(L[1], st.x).pop();
          const same = laneCoef(L[0]).join() === laneCoef(L[1]).join();
          out.push(`At x = ${nf(st.x)} the two orders give ${nf(a)} and ${nf(b)}: ${a === b ? good('the same') : bad('different')}. As formulas they are ${same ? good('equal for every x') : bad('different formulas')}.`);
        } else out.push('Try Swap which machine runs first.');
        return lines(out);
      };

      /* ----- inverse controls ----- */
      grp('inv', () => {
        C.title('One machine, run backward');
        selFn = C.select({ label: 'Function f', value: st.fn, options: EXFN.map(k => ({ value: k, label: FN[k].name })),
          onChange: v => { cancel(); st.fn = v; st.qi = FN[v].pts.indexOf(FN[v].pts.includes(1) ? 1 : 0); st.restrict = 1; st.stage = 0; st.chk = 0; renderAlg(); sync(); } });
        pS = S({ label: 'Point P on f (slide along the curve)', min: 0, max: 6, step: 1, value: st.qi, format: v => `x = ${nf(FN[st.fn].pts[v])}`, onInput: v => { cancel(); st.qi = v; sync(); } });
        tgR = C.toggle({ label: 'Keep only x ≥ 0 (restrict the domain of f)', value: !!st.restrict, onChange: v => { cancel(); st.restrict = v ? 1 : 0; sync(); } });
        tgR.wrap = panel.lastElementChild;
        tgH = C.toggle({ label: 'Show the horizontal line test', value: !!st.hlt, onChange: v => { cancel(); st.hlt = v ? 1 : 0; sync(); } });
        hS = S({ label: 'Horizontal line at y =', min: -3, max: 8, step: .5, value: st.hc, format: v => nf(v), onInput: v => { cancel(); st.hc = v; sync(); } });
      });
      grp('ipred', () => {
        addTo(h('p', { class: 'ctl-title' }, 'Predict first'));
        ipQ = h('p', { class: 'hint' }); ipRow = h('div', { class: 'ctl buttons' }); ipFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        addTo(ipQ, ipRow, ipFb);
      });
      const IPR = [
        ['(3, 1)', 'The inverse swaps the numbers: f turns 1 into 3, so f⁻¹ turns 3 back into 1. Q = (3, 1) is the mirror image of P = (1, 3) in the line y = x.', true],
        ['(−1, −3)', 'That is P turned halfway around the origin. An inverse swaps the two numbers. It does not change their signs.', false],
        ['(1, −3)', 'That is P flipped over the x-axis, which changes only the sign of y. The mirror line is y = x.', false]];
      const renderIP = () => {
        ipQ.textContent = 'f(x) = 2x + 1 and P = (1, 3) is on f. Where will its partner Q on the inverse f⁻¹ land?';
        ipFb.innerHTML = ''; ipRow.replaceChildren();
        IPR.forEach(([lab, why, ok], i) => ipRow.append(mkBtn(lab, () => {
          if (st.ipred) return;
          st.ipred = 1; cancel();
          Array.from(ipRow.children).forEach((b, j) => { b.disabled = true; if (j === i) b.classList.add('primary'); });
          ipFb.innerHTML = (ok ? good('Right.') : bad('Not quite.')) + ' ' + why + ' Now drag P or slide it.';
          sync();
        })));
      };
      grp('itab', () => { iro = C.readout(); });
      const invRo = () => {
        const F = FN[st.fn], a = F.pts[st.qi], b = F.f(a), L = [];
        const unres = F.rest && !st.restrict;
        L.push(`${kk('P')} (${nf(a)}, ${nf(b)}) is on f.`);
        if (st.ipredOn && !st.ipred) { L.push('Make your prediction to see the inverse.'); return lines(L); }
        L.push(`${kk('Q')} (${nf(b)}, ${nf(a)}) is on f⁻¹.` + (a === b ? ' P sits on the line y = x, so its mirror image is P itself.' : ''));
        L.push(`Check: f(f⁻¹(${nf(b)})) = f(${nf(a)}) = ${nf(b)} and f⁻¹(f(${nf(a)})) = f⁻¹(${nf(b)}) = ${nf(a)}.`);
        L.push(unres ? `f over all real x: domain ${F.domU}, range ${F.rng}. ${bad('Its mirror image fails the vertical line test:')} x = ${nf(b)} gets both y = ${nf(a)} and y = ${nf(-a)}.`
          : `f: domain ${F.dom}, range ${F.rng}. f⁻¹: domain ${F.rng.replace('y', 'x')}, range ${F.dom.replace('x', 'y')}.`);
        if (st.hlt) {
          const rs = F.roots(st.hc, !unres && true).filter(r => r >= dLo() - 1e-9);
          L.push(`Line y = ${nf(st.hc)} crosses f ${rs.length === 0 ? 'nowhere' : `${rs.length} time${rs.length > 1 ? 's' : ''}`}${rs.length ? ' (x = ' + rs.map(xs).join(', ') + ')' : ''}. ` +
            (rs.length > 1 ? bad('More than one: not one-to-one, so no inverse function.') : good('This line crosses at most once. One-to-one needs every horizontal line to do that.')));
        }
        const pts = F.pts, rowsF = pts.map(v => F.f(v));
        const td = 'padding:2px 8px;border-bottom:1px solid var(--line);text-align:right';
        const tb = (h1, h2, A, B) => `<table style="border-collapse:collapse;font-size:.85rem;font-variant-numeric:tabular-nums"><tr><th style="${td}">${h1}</th><th style="${td}">${h2}</th></tr>${A.map((v, i) => `<tr style="${i === st.qi ? 'font-weight:700;background:var(--line)' : ''}"><td style="${td}">${nf(v)}</td><td style="${td}">${nf(B[i])}</td></tr>`).join('')}</table>`;
        L.push(`<div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:6px">${tb('x', 'f(x)', pts, rowsF)}${tb('x', 'f⁻¹(x)', rowsF, pts)}</div>Same numbers, columns swapped.`);
        return lines(L);
      };

      /* ----- algebra ----- */
      grp('alg', () => {
        C.title('Find the inverse');
        aWork = C.readout(); aAsk = h('p', { class: 'hint' }); aBtns = h('div', { class: 'ctl buttons' }); aFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        addTo(aAsk, aBtns, aFb);
      });
      const renderAlg = () => {
        const A = ALG[st.fn]; if (!A) return;
        const m = A.moves, done = st.stage >= 1 + m.length;
        const wl = [A.start]; if (st.stage >= 1) wl.push(A.swapped);
        for (let i = 0; i < m.length; i++) if (st.stage >= 2 + i) wl.push(m[i].res);
        aWork.innerHTML = wl.map((t, i) => `${i === wl.length - 1 && !done ? '<b>' : ''}${t}${i === wl.length - 1 && !done ? '</b>' : ''}`).join('<br>') + (done ? `<br>${good(A.final)}` : '') + (done && st.chk ? `<br><br>${A.check}` : '');
        aBtns.replaceChildren();
        if (st.stage === 0) {
          aAsk.textContent = 'Step 1: swap the roles of x and y.';
          aBtns.append(mkBtn('Swap x and y', () => { st.stage = 1; aFb.innerHTML = 'Swapping x and y matches the mirror image: every point (a, b) becomes (b, a).'; renderAlg(); sync(); }, true));
        } else if (!done) {
          const mv = m[st.stage - 1]; aAsk.textContent = mv.ask;
          mv.opts.forEach(([lab, why], i) => aBtns.append(mkBtn(lab, ev2 => {
            if (i === mv.ans) { st.stage++; aFb.innerHTML = good('Yes.') + ' ' + why; renderAlg(); sync(); }
            else { ev2.currentTarget.disabled = true; aFb.innerHTML = bad('Not quite.') + ' ' + why + ' Try another move.'; }
          })));
        } else {
          aAsk.textContent = st.chk ? 'Done. Both compositions give back x.' : 'You have the inverse. Check it by composing.';
          if (!st.chk) aBtns.append(mkBtn('Check by composing', () => { st.chk = 1; renderAlg(); }, true));
          aBtns.append(mkBtn('Start over', () => { st.stage = 0; st.chk = 0; aFb.innerHTML = ''; renderAlg(); sync(); }));
        }
      };

      /* ----- practice ----- */
      C.title('Practice');
      C.hint('Eight short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => {
        cancel();
        if (st.practice) { st.practice = false; if (snap0) Object.assign(st, snap0); sync(); }
        else { snap0 = Object.assign({}, st); st.practice = true; if (!prOver) loadProb(); sync(); }
      } }])[0];
      grp('practice', () => {
        ptally = h('p', { class: 'ctl-title' });
        pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        pch = h('div', { class: 'ctl buttons' });
        pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pnext = mkBtn('Next problem', () => nextProb(), true);
        addTo(ptally, pq, pch, pfb, h('div', { class: 'ctl buttons' }, pnext));
      });
      const tally = () => { ptally.textContent = `Problem ${prIdx + 1} of ${PR.length}. Right on the first try: ${prFirst} of ${prDone} done`; };
      const loadProb = () => {
        const pr = PR[prIdx]; prSolved = false; prTried = false;
        Object.assign(st, BASE, pr.setup); st.practice = true;
        pq.textContent = pr.q; pfb.innerHTML = ''; pch.replaceChildren(); pnext.disabled = true;
        pnext.textContent = prIdx === PR.length - 1 ? 'Finish' : 'Next problem';
        pr.ch.forEach((o, i) => pch.append(mkBtn(o[0], () => pick(i))));
        tally();
      };
      const pick = i => {
        const pr = PR[prIdx]; if (prSolved) return;
        const btn = pch.children[i], txt = pr.ch[i][1];
        if (i === pr.ans) {
          prSolved = true; if (!prTried) prFirst++; prDone++;
          Array.from(pch.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary');
          Object.assign(st, pr.reveal);
          pfb.innerHTML = good('Right.') + ' ' + txt + (pr.extra || ''); pnext.disabled = false; tally(); sync();
        } else { prTried = true; btn.disabled = true; pfb.innerHTML = bad('Not quite.') + ' ' + txt + ' Try another answer.'; }
      };
      const nextProb = () => {
        if (prOver) { prOver = false; prIdx = 0; prFirst = 0; prDone = 0; loadProb(); sync(); return; }
        if (prIdx === PR.length - 1) {
          prOver = true; pq.textContent = ''; pch.replaceChildren(); pnext.textContent = 'Practice again'; pnext.disabled = false;
          ptally.textContent = `Finished: ${prFirst} of ${PR.length} right on the first try`;
          pfb.innerHTML = prFirst === PR.length ? 'Every problem on the first try. Try the explore mode with a function you pick.' : 'Wrong answers are how the reasons get learned. Practice again, or go back to the lesson and use the mirror and the algebra buttons.';
          sync(); return;
        }
        prIdx++; loadProb(); sync();
      };

      /* ---------- sync ---------- */
      const sync = () => {
        const prac = st.practice, comp = st.view === 'comp', F = FN[st.fn];
        vis(G.comp, !prac && comp); vis(G.cpred, !prac && comp && !!st.cpredOn); vis(G.cro, !prac && comp);
        vis(G.inv, !prac && !comp); vis(G.ipred, !prac && !comp && !!st.ipredOn); vis(G.itab, !prac && !comp);
        vis(G.alg, !prac && !comp && !!st.alg); vis(G.practice, prac);
        if (!prac && !comp) { tgR.wrap.style.display = F.rest ? '' : 'none'; hS.wrap.style.display = st.hlt ? '' : 'none'; }
        selF.value = st.fi; selG.value = st.gi; xS.set(st.x); selFn.value = st.fn; pS.set(st.qi); tgR.checked = !!st.restrict; tgH.checked = !!st.hlt; hS.set(st.hc);
        const lockC = !!st.cpredOn && !st.cpred, lockI = !!st.ipredOn && !st.ipred;
        selF.disabled = selG.disabled = xS.inp.disabled = lockC; runBtns[1].disabled = lockC || !!st.both;
        selFn.disabled = pS.inp.disabled = lockI;
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        if (!prac && comp) cro.innerHTML = compRo();
        if (!prac && !comp) iro.innerHTML = invRo();
        P.draw();
      };
      renderCP(); renderIP(); renderAlg();

      draggable(P, {
        hit: (px, py) => {
          if (st.practice || st.view !== 'inv') return null;
          const F = FN[st.fn], a = F.pts[st.qi];
          if (!(st.ipredOn && !st.ipred) && near(P, a, F.f(a), px, py)) return 'p';
          if (st.hlt && Math.abs(P.Y(st.hc) - py) < 14) return 'h';
          return null;
        },
        move: (hd, x, y) => {
          cancel(); const F = FN[st.fn];
          if (hd === 'p') {
            let bi = st.qi, bdist = 1e9;
            F.pts.forEach((a, i) => { const d = Math.hypot(a - x, F.f(a) - y); if (d < bdist) { bdist = d; bi = i; } });
            st.qi = bi;
          } else st.hc = clamp(snap(y, .5), -3, 8);
          sync();
        }
      });

      const apply = (patch, immediate) => {
        cancel();
        const nums = {}; let prevFn = st.fn;
        st.practice = false; st.plan = null; st.hide = 0; st.sym = 0;
        for (const k in patch) { if (k === 'run') nums.run = patch.run; else st[k] = patch[k]; }
        if (patch.fn !== undefined && patch.fn !== prevFn || patch.alg !== undefined) { st.stage = 0; st.chk = 0; aFb.innerHTML = ''; renderAlg(); }
        if ('cpredOn' in patch) renderCP();
        if ('ipredOn' in patch) renderIP();
        if (immediate || nums.run === undefined) { if (nums.run !== undefined) st.run = nums.run; sync(); }
        else { st.run = 0; sync(); cancel = animateTo(st, nums, 1100, sync); }
      };
      sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
