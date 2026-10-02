/* =====================================================================
   SCHOOL — The real number system
   ===================================================================== */
{
  const MI = '−';
  const kk = t => `<span class="k">${t}</span>`;
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const lines = a => a.filter(Boolean).join('<br>');
  const SETS = ['N', 'Z', 'Q', 'R'];
  const SETNAME = ['natural numbers', 'integers', 'rational numbers', 'real numbers'];
  const SETCH = ['N', 'Z', 'Q', 'R', 'None yet'];
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; };
  const sg = v => (v < 0 ? MI : '') + (+Math.abs(v).toFixed(6));

  /* ---------- the staircase of equations ---------- */
  /* rank: 0 natural, 1 integer, 2 rational, 3 irrational; ans: the smallest set that holds every solution (4 = none of these yet) */
  const STAIRS = [
    { eq: 'x + 3 = 5', sols: [{ v: 2, rank: 0, lab: '2' }], sol: 'x = 2', ans: 0,
      why: 'x = 5 − 3 = 2. Two is a counting number, a dot on the natural number line, so N is enough.' },
    { eq: 'x + 5 = 2', sols: [{ v: -3, rank: 1, lab: MI + '3' }], sol: 'x = −3', ans: 1,
      why: 'x = 2 − 5 = −3. There is no dot at −3 in N, because N has no negatives. The integers Z add 0 and the negatives, so Z is the smallest set.' },
    { eq: '2x = 3', sols: [{ v: 1.5, rank: 2, lab: '3/2' }], sol: 'x = 3/2', ans: 2,
      why: 'x = 3 ÷ 2 = 3/2, which sits halfway between 1 and 2. No integer is there. Fractions of integers are the rational numbers Q, so Q is the smallest set.' },
    { eq: 'x² = 2', sols: [{ v: -Math.SQRT2, rank: 3, lab: '−√2' }, { v: Math.SQRT2, rank: 3, lab: '√2' }], sol: 'x = √2 or x = −√2', ans: 3,
      why: '√2 ≈ 1.414 is not a fraction of integers (see the square roots lessons), so it falls in a gap between the dots of Q. The real numbers R fill all the gaps, so R is the smallest set.' },
    { eq: 'x² = −1', sols: [], sol: 'no real number', ans: 4,
      why: 'A real number times itself is never negative, so no point on the number line works. Mathematicians invented a new number i with i² = −1. That starts the complex numbers, which are beyond this lesson.' }
  ];
  const DESC = [
    'N = {1, 2, 3, …}: the counting numbers. W = {0, 1, 2, …} is N with 0 added.',
    'Z = {…, −2, −1, 0, 1, 2, …}: N, 0 and the negatives. (W = {0, 1, 2, …} is the part from 0 up.)',
    'Q: every fraction p/q of integers (q not 0). The dots shown have denominators up to 8.',
    'R: every point on the line. The irrational numbers fill the gaps between the fractions.'
  ];

  /* ---------- the twelve numbers of the nested picture ---------- */
  const NUMS = [
    { lab: '7', set: 0, why: '7 is a counting number, so its innermost set is N.' },
    { lab: MI + '4', set: 1, why: 'It is a whole number below zero. N has no negatives, so −4 is not natural. It is an integer, so the innermost set is Z.' },
    { lab: '2/3', set: 2, why: 'It is a fraction of two integers, and it is not a whole number. So it is rational but not an integer: Q.' },
    { lab: '√9', set: 0, why: '√9 = 3, because 3 × 3 = 9. So it is a plain natural number. Writing a square root does not make a number irrational.' },
    { lab: '√2', set: 3, why: '2 is not a perfect square (1 × 1 = 1 and 2 × 2 = 4), so √2 is irrational. It is real but not rational: R.' },
    { lab: '0.25', set: 2, why: '0.25 = 25/100 = 1/4. A decimal that ends is a fraction of integers, so it is rational: Q.' },
    { lab: '0.333…', set: 2, why: 'The 3s repeat forever. A repeating decimal is still a fraction: 0.333… = 1/3. So it is rational: Q. Irrational decimals never repeat.' },
    { lab: 'π', set: 3, why: 'π = 3.14159… never ends and never repeats. It is irrational, so the innermost set is R.' },
    { lab: MI + '√5', set: 3, why: '5 is not a perfect square (2 × 2 = 4 and 3 × 3 = 9), so √5 is irrational, and so is its opposite −√5. Innermost set: R.' },
    { lab: '22/7', set: 2, why: '22/7 is a fraction of two integers, so it is rational: Q. It is close to π (about 3.1429 against 3.1416) but it is not equal to π.' },
    { lab: '0', set: 1, why: '0 is an integer. N starts at 1, so 0 is not natural. (The whole numbers W = {0, 1, 2, …} include 0, but W is not one of the four rings.) Innermost set: Z.' },
    { lab: '3.14', set: 2, why: '3.14 = 314/100 = 157/50, a fraction of integers, so it is rational: Q. It is only an approximation of π, not π itself.' }
  ];
  const PRED = [
    ['22/7', 'Not quite. 22/7 is a fraction of two integers, so it is rational. It only looks like π. The irrational one is √2: 2 is not a perfect square.'],
    ['√9', 'Not quite. √9 = 3, because 3 × 3 = 9. It is a whole number.'],
    ['0.333…', 'Not quite. The 3s repeat, and a repeating decimal is a fraction: 0.333… = 1/3.'],
    ['√2', good('Yes.') + ' 2 is not a perfect square, so √2 is irrational. Now sort all twelve numbers to see where the others belong.']
  ];

  /* ---------- closure examples ---------- */
  const R2 = Math.SQRT2;
  const CL = [
    { t: '1/2 + 1/3', rows: [{ a: [.5, '1/2'], b: [1 / 3, '1/3'], op: '+', res: 5 / 6, rl: '5/6', rat: true }], ans: 0,
      why: 'Fractions add to a fraction: 1/2 + 1/3 = 3/6 + 2/6 = 5/6. Adding two rational numbers always gives a rational number.' },
    { t: '2/3 × 3/4', rows: [{ a: [2 / 3, '2/3'], b: [.75, '3/4'], op: '×', res: .5, rl: '1/2', rat: true }], ans: 0,
      why: 'Multiply the tops and the bottoms: 2/3 × 3/4 = 6/12 = 1/2. A product of two rational numbers is always rational.' },
    { t: '3 + √2', rows: [{ a: [3, '3'], b: [R2, '√2'], op: '+', res: 3 + R2, rl: '3 + √2 ≈ 4.41', rat: false }], ans: 1,
      why: 'Suppose 3 + √2 were rational, say equal to q. Then √2 = q − 3 would be a rational number minus a rational number, which is rational. But √2 is not rational. So 3 + √2 is irrational.' },
    { t: MI + '2 + π', rows: [{ a: [-2, MI + '2'], b: [Math.PI, 'π'], op: '+', res: Math.PI - 2, rl: '−2 + π ≈ 1.14', rat: false }], ans: 1,
      why: 'The same argument works for any rational number r and any irrational number s. If r + s were rational, then s = (r + s) − r would be rational. That is false. So a rational plus an irrational is always irrational.' },
    { t: '√2 + (−√2)', rows: [{ a: [R2, '√2'], b: [-R2, '−√2'], op: '+', res: 0, rl: '0', rat: true }], ans: 0,
      why: 'Each number is irrational, but they are opposites, so they cancel: √2 + (−√2) = 0, and 0 is rational. Two irrational numbers can add to a rational number.' },
    { t: '√2 × √2', rows: [{ a: [R2, '√2'], b: [R2, '√2'], op: '×', res: 2, rl: '2', rat: true }], ans: 0,
      why: '√2 × √2 = 2 by the definition of a square root. So a product of two irrational numbers can be rational.' },
    { t: 'Two irrational numbers, added', rows: [
        { a: [R2, '√2'], b: [-R2, '−√2'], op: '+', res: 0, rl: '0 (rational)', rat: true },
        { a: [R2, '√2'], b: [R2, '√2'], op: '+', res: 2 * R2, rl: '2√2 ≈ 2.83 (irrational)', rat: false }], ans: 2,
      why: 'It depends on the numbers. √2 + (−√2) = 0 is rational, but √2 + √2 = 2√2 is irrational (a nonzero rational times an irrational stays irrational). So no single answer holds for every pair.' },
    { t: '1/2 × √2', rows: [{ a: [.5, '1/2'], b: [R2, '√2'], op: '×', res: R2 / 2, rl: '√2/2 ≈ 0.71', rat: false }], ans: 1,
      why: 'If (1/2) × √2 were a fraction q, then √2 = 2q would be a fraction too, which it is not. So a nonzero rational times an irrational is irrational.' },
    { t: '0 × √2', rows: [{ a: [0, '0'], b: [R2, '√2'], op: '×', res: 0, rl: '0', rat: true }], ans: 0,
      why: 'Zero times anything is 0, and 0 is rational. The rule "rational times irrational is irrational" needs the rational number to be NOT zero.' }
  ];
  const CLCH = ['Rational', 'Irrational', 'It depends'];

  /* ---------- Practice ---------- */
  const TF = ['True', 'False'];
  const PROBS = [
    { kind: 'set', ch: SETCH, head: 'x² = 9', subs: [{ q: 'Solve x² = 9. Which is the smallest set that contains every solution?', ans: 1, chips: ['3', MI + '3'],
      why: 'Both x = 3 and x = −3 work, because (−3)² = 9. They are integers, and −3 is not natural, so Z is the smallest set holding both.' }] },
    { kind: 'set', ch: SETCH, head: 'x² = 7', subs: [{ q: 'Solve x² = 7. Which is the smallest set that contains every solution?', ans: 3, chips: ['√7', MI + '√7'],
      why: '7 is not a perfect square (2 × 2 = 4 and 3 × 3 = 9), so x = √7 or x = −√7, about 2.65 and −2.65. These are irrational real numbers, so the smallest set is R.' }] },
    { kind: 'set', ch: SETCH, head: 'x² = −4', subs: [{ q: 'Solve x² = −4. Which is the smallest set that contains a solution?', ans: 4, chips: [],
      why: 'A real number squared is never negative, so no number in N, Z, Q or R works. The complex numbers add i with i² = −1, and then x = 2i works because (2i)² = 4 × (−1) = −4. That is a teaser here.' }] },
    { kind: 'set', ch: SETCH, head: '3x = 1', subs: [{ q: 'Solve 3x = 1. Which is the smallest set that contains the solution?', ans: 2, chips: ['1/3'],
      why: 'x = 1 ÷ 3 = 1/3, a fraction between 0 and 1. It is not an integer. Fractions of integers form Q, so Q is the smallest set.' }] },
    { kind: 'sort', ch: SETS, head: 'Sort the list', subs: [
      { lab: '0.666…', q: 'Where does 0.666… belong? Choose its innermost set.', ans: 2, why: 'The 6s repeat, and a repeating decimal is a fraction: 0.666… = 2/3. So it is rational: Q. Not irrational.' },
      { lab: '√16', q: 'Where does √16 belong? Choose its innermost set.', ans: 0, why: '√16 = 4, because 4 × 4 = 16. So √16 is a natural number: N. It is not irrational.' },
      { lab: MI + '√9', q: 'Where does −√9 belong? Choose its innermost set.', ans: 1, why: '√9 = 3, so −√9 = −3. It is a negative whole number: Z.' },
      { lab: 'π', q: 'Where does π belong? Choose its innermost set.', ans: 3, why: 'π never ends and never repeats. It is irrational: R.' }] },
    { kind: 'tf', ch: TF, head: 'True or false', subs: [
      { q: 'Every integer is a rational number.', ans: 0, why: 'It is true. Any integer n is the fraction n/1, so every integer is a rational number.' },
      { q: 'Every irrational number is a real number.', ans: 0, why: 'It is true. The real numbers R are all the rational numbers and all the irrational numbers together.' },
      { q: 'Every rational number is an integer.', ans: 1, why: 'It is false. 1/2 is rational but it is not an integer. The rings grow: Z is inside Q, not the other way round.' },
      { q: '0.333… is irrational, because its decimal never ends.', ans: 1, why: 'It is false. The 3s repeat, and 0.333… = 1/3, a fraction. Irrational decimals never end AND never repeat.' }] },
    { kind: 'rows', ch: CLCH, head: 'Rational or irrational?', subs: [
      { q: 'Is 1/2 + √3 rational, irrational, or does it depend?', rows: [{ a: [.5, '1/2'], b: [Math.sqrt(3), '√3'], op: '+', res: .5 + Math.sqrt(3), rl: '1/2 + √3 ≈ 2.23', rat: false }], ans: 1,
        why: 'A rational number plus an irrational number is always irrational. If the sum were rational, then √3 would equal that sum minus 1/2, which would be rational.' },
      { q: 'Is √5 + (−√5) rational, irrational, or does it depend?', rows: [{ a: [Math.sqrt(5), '√5'], b: [-Math.sqrt(5), '−√5'], op: '+', res: 0, rl: '0', rat: true }], ans: 0,
        why: 'The two irrational numbers cancel: the sum is 0, which is rational.' },
      { q: 'Take any two irrational numbers and add them. Is the sum always rational, always irrational, or does it depend?', rows: [
        { a: [R2, '√2'], b: [-R2, '−√2'], op: '+', res: 0, rl: '0 (rational)', rat: true },
        { a: [R2, '√2'], b: [R2, '√2'], op: '+', res: 2 * R2, rl: '2√2 ≈ 2.83 (irrational)', rat: false }], ans: 2,
        why: 'It depends. √2 + (−√2) = 0 is rational, while √2 + √2 = 2√2 is irrational.' }] }
  ];
  PROBS.forEach(pr => { pr.subs.forEach(s => { s.chips = s.chips || []; }); });

  /* ---------- canvas helpers ---------- */
  const font = (size, weight = 500) => `${weight} ${size}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`;
  const T = (c, p, str, x, y, { size = 13, color, align = 'center', weight = 500, a = 1 } = {}) => {
    if (a <= .01) return;
    c.save(); c.globalAlpha = a; c.font = font(size, weight); c.textAlign = align; c.textBaseline = 'middle';
    c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(str, x, y);
    c.fillStyle = color || p.pal.text; c.fillText(str, x, y); c.restore();
  };
  const wrap = (c, str, maxW, size, weight = 500) => {
    c.save(); c.font = font(size, weight);
    const out = []; let cur = '';
    str.split(' ').forEach(w => { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; });
    if (cur) out.push(cur); c.restore(); return out;
  };
  const rr = (c, x, y, w, h, r) => {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  const colsOf = pal => [pal.green, pal.blue, pal.violet, pal.yellow];
  const CHIPH = 24;
  const flowChips = (c, labs, x, y, maxW, size) => {
    c.save(); c.font = font(size, 600);
    let cx = x, cy = y; const out = [];
    labs.forEach(l => {
      const w = c.measureText(l).width + 18;
      if (cx + w > x + maxW && cx > x) { cx = x; cy += CHIPH + 5; }
      out.push({ x: cx, y: cy, w, h: CHIPH }); cx += w + 6;
    });
    c.restore(); return out;
  };
  const drawChip = (c, p, lab, b, color, { fill, size = 13, ring } = {}) => {
    rr(c, b.x, b.y, b.w, b.h, 8); c.fillStyle = fill || p.pal.stage; c.fill();
    c.strokeStyle = color; c.lineWidth = 1.8; c.stroke();
    if (ring) { rr(c, b.x - 3, b.y - 3, b.w + 6, b.h + 6, 10); c.strokeStyle = p.pal.brass; c.lineWidth = 2.4; c.stroke(); }
    c.save(); c.font = font(size, 600); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = p.pal.text; c.fillText(lab, b.x + b.w / 2, b.y + b.h / 2 + .5); c.restore();
  };
  /* nested rectangles: N inside Z inside Q inside R */
  const nestLayout = (W, H, top, bot) => {
    const x0 = 12, x1 = W - 12, y0 = top, y1 = H - bot, avail = y1 - y0;
    const g = clamp(avail * .19, 46, 68), ix = clamp(W * .035, 10, 22), r = [];
    let x = x0, y = y0, xr = x1, yb = y1;
    for (let k = 3; k >= 0; k--) { r[k] = { x, y, w: xr - x, h: yb - y, g }; x += ix; xr -= ix; y += g; yb -= ix * .7; }
    return r;
  };
  const banner = (c, p, text, color, size) => {
    const W = p.w, ls = wrap(c, text, W - 28, size, 700), h0 = ls.length * (size + 6) + 10;
    c.fillStyle = alpha(p.pal.stage, .95); c.fillRect(0, 0, W, h0);
    c.strokeStyle = p.pal['grid-strong']; c.lineWidth = 1; c.beginPath(); c.moveTo(0, h0 + .5); c.lineTo(W, h0 + .5); c.stroke();
    ls.forEach((l, i) => T(c, p, l, W / 2, 8 + (size + 6) * (i + .5) + 2, { size, weight: 700, color: color || p.pal.text }));
    return h0;
  };

  register({
    id: 'the-real-number-system', level: 'school',
    title: 'The real number system',
    blurb: 'See why each new kind of number was invented, sort numbers into the nested sets N, Z, Q and R, and test what stays rational or irrational.',
    thumb(c, p) {
      const pal = p.pal, W = p.w, H = p.h, cols = colsOf(pal), L = ['R', 'Q', 'Z', 'N'];
      const m = 6, dx = W * .085, dy = H * .11;
      for (let i = 0; i < 4; i++) {
        const k = 3 - i, x = m + dx * i, y = m + dy * i, w = W - 2 * (m + dx * i), h = H - 2 * (m + dy * i) + (i ? dy * .35 * i : 0);
        rr(c, x, y, Math.max(w, 10), Math.max(h, 10), 7); c.fillStyle = alpha(cols[k], .16); c.fill(); c.strokeStyle = cols[k]; c.lineWidth = 2; c.stroke();
        c.save(); c.font = font(Math.max(11, H * .13), 700); c.textAlign = 'left'; c.textBaseline = 'top'; c.fillStyle = pal.text; c.fillText(L[i], x + 10, y + 6); c.restore();
      }
    },
    hook: String.raw`Negative numbers, fractions and \(\sqrt2\) were all invented for one reason: an equation had no answer yet. Which equation needs a brand-new kind of number, and how many kinds are there?`,
    steps: [
      { title: 'Equations with no answer yet',
        text: String.raw`<p>The <b>natural numbers</b> \(\mathbb N=\{1,2,3,\dots\}\) are the dots on the line. The equation \(x+3=5\) has the solution \(2\), a dot on the line. Pick the next equation in the list, then press the smallest set that holds its solution. The <b>whole numbers</b> \(\mathbb W=\{0,1,2,\dots\}\) are \(\mathbb N\) with \(0\) added.</p>`,
        set: { view: 'stairs', eq: 0, lvl: 0 } },
      { title: 'Sets inside sets',
        text: String.raw`<p>The sets are nested: every natural number is an integer, every integer is rational, and every rational number is real. First predict which of four numbers is irrational. Then drag each of twelve numbers into its innermost ring, or use the buttons. Finally say which other rings it belongs to.</p>`,
        set: { view: 'nest' } },
      { title: 'Between any two numbers',
        text: String.raw`<p>The window starts at the rational numbers \(1\) and \(2\). Their average, \(1.5\), is rational and lies between them. An irrational number lies between them too. Zoom in as often as you like: both kinds are always there. The fractions still leave gaps, and \(\sqrt2\) sits in one.</p>`,
        set: { view: 'dense', dz: 0 } },
      { title: 'What stays inside a set',
        text: String.raw`<p>If you add or multiply two numbers of one kind, do you stay in that kind? Test each example and choose rational, irrational, or it depends. A rational plus an irrational is always irrational. But two irrational numbers can add to a rational number, like \(\sqrt2+(-\sqrt2)=0\).</p>`,
        set: { view: 'closure', ci: 0 } }
    ],
    formal: String.raw`
      <h3>Why there are several kinds of numbers</h3>
      <p>Each set of numbers was made to solve equations that the smaller set could not:
      \[ \begin{aligned} x+3&=5 &&\Rightarrow\ x=2 &&\in \mathbb N=\{1,2,3,\dots\}\\ x+5&=2 &&\Rightarrow\ x=-3 &&\in \mathbb Z=\{\dots,-2,-1,0,1,2,\dots\}\\ 2x&=3 &&\Rightarrow\ x=\tfrac32 &&\in \mathbb Q\\ x^2&=2 &&\Rightarrow\ x=\pm\sqrt2 &&\in \mathbb R\\ x^2&=-1 &&\Rightarrow\ x=\pm i &&\in \mathbb C \end{aligned} \]
      The <em>whole numbers</em> \(\mathbb W=\{0,1,2,\dots\}\) are the natural numbers together with \(0\). The <em>rational numbers</em> are all fractions \(\tfrac pq\) of integers with \(q\ne0\): \(\mathbb Q=\{\tfrac pq \mid p,q\in\mathbb Z,\ q\ne0\}\). The <em>real numbers</em> \(\mathbb R\) are all the points of the number line: the rational numbers and the irrational numbers together. The last equation has no real solution, because a real number squared is never negative. The <em>complex numbers</em> \(\mathbb C\) add a number \(i\) with \(i^2=-1\). This lesson only names them. Almost every number you meet in this course is real.</p>
      <h3>Nested sets</h3>
      <p>Every natural number is an integer, every integer \(n\) is the fraction \(\tfrac n1\), and every rational number is real:
      \[ \mathbb N\subset\mathbb Z\subset\mathbb Q\subset\mathbb R . \]
      The symbol \(\subset\) means "is inside". So a number can belong to many sets: \(7\) is in \(\mathbb N\), \(\mathbb Z\), \(\mathbb Q\) and \(\mathbb R\). To classify a number, find the <em>smallest</em> set that holds it. Then it is also in every larger set. The irrational numbers are the real numbers that are not rational, so they are \(\mathbb R\) with \(\mathbb Q\) taken out.</p>
      <p>Three traps. First, \(\sqrt9=3\) and \(\sqrt{16}=4\): a square root of a perfect square is a natural number, not an irrational number. Second, \(0.\overline3=\tfrac13\): the digits repeat, so it is rational. Third, \(\tfrac{22}{7}\) and \(3.14\) are rational approximations of \(\pi\), which is irrational. Also \(\sqrt n\) for a positive integer \(n\) is irrational exactly when \(n\) is not a perfect square.</p>
      <h3>Why \(\sqrt2\) is not rational</h3>
      <p>Suppose \(\sqrt2=\tfrac pq\) in lowest terms. Then \(p^2=2q^2\), so \(p^2\) is even, so \(p\) is even, say \(p=2m\). Then \(4m^2=2q^2\), so \(q^2=2m^2\) and \(q\) is even too. But then \(p\) and \(q\) share the factor \(2\), which contradicts lowest terms. So no fraction equals \(\sqrt2\). That is why \(x^2=2\) needs the real numbers. The sibling lesson on the square root of \(2\) gives this proof step by step.</p>
      <h3>Density and gaps</h3>
      <p>Take two rational numbers \(a&lt;b\). The average \(\tfrac{a+b}2\) is rational, and it lies strictly between them. Repeating this gives as many rational numbers between \(a\) and \(b\) as you like. There is also an irrational number between them:
      \[ a+\frac{b-a}{\sqrt2}. \]
      Since \(\sqrt2>1\), the number \(\tfrac{b-a}{\sqrt2}\) is positive and smaller than \(b-a\), so the sum lies between \(a\) and \(b\). It is irrational: if \(r=a+\tfrac{b-a}{\sqrt2}\) were rational, then \(\sqrt2=\tfrac{b-a}{r-a}\) would be a ratio of rational numbers, so rational, which is false. So in every window, however small, there are both rational and irrational numbers. We say each kind is <em>dense</em>.</p>
      <p>Dense does not mean the same thing as "fills the line". The rational numbers leave gaps: \(\sqrt2\) is a point of the number line that is not a fraction. The real numbers have no gaps. A precise statement of this (completeness of \(\mathbb R\)) is beyond this course, and the drawing of dots cannot prove it. What you can trust here is the picture and the arguments above.</p>
      <h3>What stays rational or irrational</h3>
      <p><b>Rational with rational.</b> If \(a=\tfrac pq\) and \(b=\tfrac rs\), then \(a+b=\tfrac{ps+qr}{qs}\) and \(ab=\tfrac{pr}{qs}\). Both are fractions of integers with \(qs\ne0\), so the sum and the product of two rational numbers are rational. We say the rational numbers are <em>closed</em> under addition and multiplication.</p>
      <p><b>Rational plus irrational.</b> Let \(r\) be rational and \(s\) irrational. Suppose \(r+s=q\) were rational. Then \(s=q-r\) would be a difference of rational numbers, so rational, which contradicts \(s\) being irrational. So \(r+s\) is irrational. The same argument shows that \(rs\) is irrational when \(r\ne0\): if \(rs=q\) were rational, then \(s=\tfrac qr\) would be rational.</p>
      <p><b>Irrational with irrational: it depends.</b> \(\sqrt2+(-\sqrt2)=0\) is rational, but \(\sqrt2+\sqrt2=2\sqrt2\) is irrational. Likewise \(\sqrt2\cdot\sqrt2=2\) is rational. So the irrational numbers are not closed under addition or multiplication.</p>
      <h3>Worked example</h3>
      <p>Classify \(-\sqrt{25},\ 0.\overline{6},\ \sqrt{12},\ \tfrac{22}{7}\). Here \(\sqrt{25}=5\), so \(-\sqrt{25}=-5\) is an integer: \(\mathbb Z\). Next \(0.\overline6=\tfrac23\) (let \(x=0.666\dots\); then \(10x-x=6\), so \(x=\tfrac23\)): \(\mathbb Q\). Then \(3^2=9&lt;12&lt;16=4^2\), so \(\sqrt{12}\) is not a whole number, so it is irrational: \(\mathbb R\). Last, \(\tfrac{22}{7}\) is a fraction: \(\mathbb Q\).</p>`,
    check: [
      { q: 'Which statement about the number √16 is correct?',
        choices: ['√16 is irrational, because it is a square root.', '√16 = 4, so it is a natural number. It is also an integer, a rational number and a real number.', '√16 is rational but it is not an integer.', '√16 is real but it is not rational.'], answer: 1,
        why: String.raw`Since \(4\times4=16\), \(\sqrt{16}=4\). That is a counting number, so it is in \(\mathbb N\), and therefore also in \(\mathbb Z\), \(\mathbb Q\) and \(\mathbb R\). A square root is irrational only when the number under it is not a perfect square. 16 is a perfect square.`,
        hint: 'Find the number that multiplies by itself to give 16. Is it a whole number?' },
      { q: 'Solve 2x² − 1 = 15. Which choice names the smallest of the sets N, Z, Q, R that contains every solution?',
        choices: ['Z, because the solutions are 4 and −4', 'N, because the only solution is 8', 'None of these, because a square can never equal 8', 'R, because the solutions are √8 and −√8, which are irrational'], answer: 3,
        why: String.raw`Add \(1\) to both sides: \(2x^2=16\). Divide by \(2\): \(x^2=8\). So \(x=\sqrt8\) or \(x=-\sqrt8\). Since \(2^2=4\) and \(3^2=9\), \(8\) is not a perfect square, so \(\sqrt8\approx2.83\) is irrational. The smallest set holding both solutions is \(\mathbb R\). Getting \(\pm4\) comes from forgetting to divide 16 by 2 before the square root. Squares can be positive, and the equation does have real solutions.`,
        hint: 'Get x² alone first: add 1, then divide by 2. Then ask whether the number is a perfect square.' },
      { q: 'Which statement is always true?',
        choices: ['The sum of two irrational numbers is irrational.', 'The product of a rational number and an irrational number is irrational.', 'The sum of a rational number and an irrational number is irrational.', 'The sum of two irrational numbers is rational.'], answer: 2,
        why: String.raw`If a rational \(r\) plus an irrational \(s\) were a rational \(q\), then \(s=q-r\) would be rational, which is false. So the sum is always irrational. The others fail: \(\sqrt2+(-\sqrt2)=0\) is rational and \(\sqrt2+\sqrt2=2\sqrt2\) is irrational, so two irrational numbers can go either way. And \(0\times\sqrt2=0\) is rational, so the product rule fails when the rational number is zero.`,
        hint: 'Try to find a counterexample for each choice: use √2, −√2 and 0.' }
    ],
    links: { prereq: ['rational-numbers-and-decimal-expansions', 'square-roots-and-irrational-numbers'], next: ['set-and-interval-notation'], related: ['negative-numbers-and-absolute-value', 'why-the-square-root-of-2-is-irrational', 'exponents-and-scientific-notation', 'modular-arithmetic', 'quadratics-and-the-parabola', 'matrices'] },

    mount({ stage, controls: C }) {
      const st = { view: 'stairs', eq: 0, lvl: 0, pk: -1, ap: 1, practice: false, pred: false, cur: 0, sel: [false, false, false, false], dz: 0, ci: 0, drag: null, flash: { k: -1, a: 0 }, pop: { i: -1, a: 1 } };
      let cancel = () => {}, cancel2 = () => {};
      const panel = stage.nextElementSibling;
      stage.style.minHeight = '470px'; stage.style.height = 'min(66vh, 560px)';
      const P = new Plane(stage, { span: 5 });

      /* explore state that is not animated */
      const placed = NUMS.map(() => -1);            /* the ring a number was placed in, or -1 */
      const nTried = NUMS.map(() => false);
      let nFirst = 0;
      const dn = { lo: 1, w: 1, hist: [] };
      const cAns = CL.map(() => -1), cTried = CL.map(() => false);
      let hits = [], lay = null;
      /* practice state */
      let prOver = false, prIdx = 0, prSub = 0, prTried = false, prFirst = 0, prDone = 0, prDoneAll = false, prWrong = -1;
      let prChips = [];

      const lvlOf = () => Math.min(st.lvl, 3);

      /* ================= drawing ================= */
      const drawStairs = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, E = STAIRS[st.eq], L = lvlOf(), a = st.ap;
        const fs = clamp(W / 11, 24, 36);
        T(c, p, E.eq, W / 2, 30, { size: fs, weight: 700 });
        T(c, p, 'Solution: ' + E.sol, W / 2, 30 + fs * .85, { size: clamp(W / 24, 14, 17), color: pal.muted });
        const y0 = 150, Lm = 20, Rm = W - 20, vmax = 5.6, X = v => W / 2 + v * (Rm - Lm) / (2 * vmax);
        c.lineCap = 'round';
        if (L < 3) { c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.2; c.beginPath(); c.moveTo(Lm, y0); c.lineTo(Rm, y0); c.stroke(); }
        else { c.strokeStyle = alpha(pal.blue, .25 + .75 * a); c.lineWidth = 5; c.beginPath(); c.moveTo(Lm, y0); c.lineTo(Rm, y0); c.stroke(); }
        for (let v = -5; v <= 5; v++) {
          c.strokeStyle = pal.muted; c.lineWidth = 1.4; c.beginPath(); c.moveTo(X(v), y0 - 6); c.lineTo(X(v), y0 + 6); c.stroke();
          T(c, p, v < 0 ? MI + Math.abs(v) : String(v), X(v), y0 + 24, { size: 13, color: pal.muted });
        }
        const dot = (v, r, al) => { c.beginPath(); c.arc(X(v), y0, r, 0, TAU); c.fillStyle = alpha(pal.blue, al); c.fill(); };
        for (let v = 1; v <= 5; v++) dot(v, 6.5, L === 0 ? a : 1);
        if (L >= 1) { dot(0, 6.5, L === 1 ? a : 1); for (let v = -5; v <= -1; v++) dot(v, 6.5, L === 1 ? a : 1); }
        if (L >= 2 && L < 3) for (let q = 2; q <= 8; q++) for (let n = Math.ceil(-vmax * q); n <= Math.floor(vmax * q); n++) {
          if (gcd(n, q) !== 1) continue; dot(n / q, 2.4, .75 * a);
        }
        if (L >= 1) { c.beginPath(); c.arc(X(0), y0, 11, 0, TAU); c.strokeStyle = alpha(pal.muted, .9); c.lineWidth = 1.4; c.setLineDash([3, 3]); c.stroke(); c.setLineDash([]); }
        if (L >= 1 && st.eq !== 4) T(c, p, 'W starts at 0', X(0), y0 - 22, { size: 12, color: pal.muted });
        /* the solutions */
        E.sols.forEach((s, i) => {
          const inside = s.rank <= L;
          c.beginPath(); c.arc(X(s.v), y0, 10, 0, TAU);
          if (inside) { c.fillStyle = pal.yellow; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 2.5; c.stroke(); }
          else { c.strokeStyle = pal.red; c.lineWidth = 2.6; c.setLineDash([4, 3]); c.stroke(); c.setLineDash([]); }
          T(c, p, s.lab, X(s.v), y0 - 40, { size: 17, weight: 700, color: inside ? pal.text : pal.red });
        });
        if (st.eq === 4) {
          c.strokeStyle = pal.red; c.lineWidth = 2.4; c.setLineDash([5, 5]); c.beginPath(); c.moveTo(X(0), y0 - 12); c.lineTo(X(0), y0 - 56); c.stroke(); c.setLineDash([]);
          T(c, p, 'i ?', X(0), y0 - 70, { size: 19, weight: 700, color: pal.violet });
        }
        /* the staircase of sets: each step was invented for the equation printed on it */
        {
          const n = 5, sw = (W - 24) / n, base = H - 14, sh = clamp((H - y0 - 190) / 5, 14, 34), names = ['N', 'Z', 'Q', 'R', 'C?'], eqs = ['x+3=5', 'x+5=2', '2x=3', 'x²=2', 'x²=−1'], cols = colsOf(pal);
          for (let i = 0; i < n; i++) {
            const top = base - 30 - i * sh, x = 12 + i * sw, on = (st.pk < 0 ? -1 : st.pk) === i, here = i === Math.min(st.eq, 4);
            c.fillStyle = alpha(i < 4 ? cols[i] : pal.red, on ? .5 : .2); c.fillRect(x + 2, top, sw - 4, base - top);
            c.strokeStyle = i < 4 ? cols[i] : pal.red; c.lineWidth = on ? 3 : 1.6; if (i === 4) c.setLineDash([4, 3]); c.strokeRect(x + 2, top, sw - 4, base - top); c.setLineDash([]);
            T(c, p, names[i], x + sw / 2, top + 14, { size: 15, weight: 700 });
            T(c, p, eqs[i], x + sw / 2, top - 11, { size: clamp(W / 32, 11.5, 14), weight: here ? 700 : 500, color: here ? pal.text : pal.muted });
          }
        }
        /* captions */
        const cs = clamp(W / 26, 13.5, 16), cap = wrap(c, DESC[L], W - 28, cs, 600);
        cap.forEach((l, i) => T(c, p, l, W / 2, y0 + 56 + i * (cs + 6), { size: cs, weight: 600, color: pal.text }));
        let msg, col;
        if (!E.sols.length) { msg = 'No point on this line works. x² = −1 needs a new number, i, with i² = −1 (complex numbers).'; col = pal.red; }
        else {
          const out = E.sols.filter(s => s.rank > L);
          if (!out.length) { msg = `${E.sols.map(s => s.lab).join(' and ')} ${E.sols.length > 1 ? 'are' : 'is'} on this line (yellow dot).`; col = pal.green; }
          else if (L === 2 && E.sols[0].rank === 3) { msg = `${E.sols.map(s => s.lab).join(' and ')} fall in gaps between the dots (red dashed ring). The dots of Q leave gaps.`; col = pal.red; }
          else { msg = `${out.map(s => s.lab).join(' and ')} ${out.length > 1 ? 'are' : 'is'} not in ${SETS[L]} (red dashed ring): there is no dot there.`; col = pal.red; }
        }
        const ml = wrap(c, msg, W - 28, cs, 700), yy = y0 + 56 + cap.length * (cs + 6) + 10;
        ml.forEach((l, i) => T(c, p, l, W / 2, yy + i * (cs + 6), { size: cs, weight: 700, color: col }));
      };

      /* nested rings; o: { top, bottom, chips:[{lab,set,i,sel}], tray:[{lab,i,sel}], on:[k], flash, tint, banner } */
      const drawNest = (c, p, o) => {
        const pal = p.pal, W = p.w, H = p.h, cols = colsOf(pal), fsz = clamp(W / 30, 12, 14.5);
        const trayLabs = o.trayAll || [];
        let bot = o.bottom || 14;
        if (trayLabs.length) { const probe = flowChips(c, trayLabs, 16, 0, W - 32, fsz); bot = 38 + probe[probe.length - 1].y + CHIPH + 6; }
        const rects = nestLayout(W, H, o.top || 14, bot); lay = { rects, bot };
        const wide = W > 520;
        const NM = wide ? ['N  natural numbers 1, 2, 3, …', 'Z  integers …, −2, −1, 0, 1, 2, …', 'Q  rational numbers (fractions of integers)', 'R  real numbers (every point on the line)']
          : ['N  natural numbers', 'Z  integers', 'Q  rational numbers', 'R  real numbers'];
        for (let k = 3; k >= 0; k--) {
          const r = rects[k], on = (o.on || []).includes(k), tint = o.tint === k;
          rr(c, r.x, r.y, r.w, r.h, 12); c.fillStyle = alpha(cols[k], tint ? .38 : on ? .26 : .1); c.fill();
          c.strokeStyle = cols[k]; c.lineWidth = on || tint ? 3.2 : 1.8; c.stroke();
          if (o.flash && o.flash.k === k && o.flash.a > .02) { rr(c, r.x, r.y, r.w, r.h, 12); c.strokeStyle = alpha(pal.red, o.flash.a); c.lineWidth = 4.5; c.stroke(); }
          T(c, p, NM[k], r.x + 10, r.y + 12, { size: fsz, weight: 700, align: 'left', color: pal.text });
        }
        const chips = (o.chips || []);
        const per = [[], [], [], []]; chips.forEach(ch => per[ch.set].push(ch));
        for (let k = 0; k < 4; k++) {
          const r = rects[k], pos = flowChips(c, per[k].map(ch => ch.lab), r.x + 10, r.y + 24, r.w - 20, fsz);
          per[k].forEach((ch, j) => {
            const b = pos[j], ex = o.pop && o.pop.i === ch.i ? o.pop.a : 1;
            c.save(); c.globalAlpha = .25 + .75 * ex; drawChip(c, p, ch.lab, b, cols[k], { size: fsz, ring: ch.sel, fill: alpha(cols[k], .18) }); c.restore();
            if (ch.i >= 0) hits.push({ i: ch.i, x: b.x, y: b.y, w: b.w, h: b.h, tray: false });
          });
        }
        if (trayLabs.length) {
          const ty = H - bot + 8;
          T(c, p, 'Numbers to place: tap one, then drag it into a ring', 16, ty + 6, { size: clamp(W / 30, 12, 14), align: 'left', color: pal.muted });
          if (!(o.tray || []).length) T(c, p, 'All twelve are placed. Tap a number to see which rings hold it.', 16, ty + 28, { size: clamp(W / 30, 12, 14), align: 'left', color: pal.text });
          const tray = o.tray || [], pos = flowChips(c, tray.map(t => t.lab), 16, ty + 22, W - 32, fsz);
          tray.forEach((t, j) => {
            const b = pos[j]; if (!(st.drag && st.drag.i === t.i)) drawChip(c, p, t.lab, b, pal.muted, { size: fsz, ring: t.sel });
            hits.push({ i: t.i, x: b.x, y: b.y, w: b.w, h: b.h, tray: true });
          });
        }
        if (o.drag) {
          const lab = NUMS[o.drag.i].lab; c.font = font(fsz + 1, 700); const w = c.measureText(lab).width + 22, b = { x: o.drag.x - w / 2, y: o.drag.y - 17, w, h: 30 };
          c.save(); c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 10; drawChip(c, p, lab, b, pal.brass, { size: fsz + 1, ring: true }); c.restore();
        }
      };

      /* number line rows for the closure examples; reveal: show the answer */
      const drawRows = (c, p, rows, reveal, top) => {
        const pal = p.pal, W = p.w, H = p.h, n = rows.length, band = Math.min((H - top - 14) / n, 340), fs = clamp(W / 22, 15, 19);
        rows.forEach((r, i) => {
          const yb = top + band * i, y0 = yb + band * (n === 1 ? .5 : .6);
          const vals = [0, r.a[0], r.b[0], r.res].concat(r.op === '+' ? [r.a[0] + r.b[0]] : []);
          let lo = Math.floor(Math.min(...vals) - .6), hi = Math.ceil(Math.max(...vals) + .6);
          while (hi - lo < 5) { hi += .5; lo -= .5; }
          const X = v => 22 + (v - lo) / (hi - lo) * (W - 44);
          c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.6; c.beginPath(); c.moveTo(14, y0); c.lineTo(W - 14, y0); c.stroke();
          for (let v = Math.ceil(lo); v <= Math.floor(hi); v++) {
            c.strokeStyle = pal.muted; c.lineWidth = 1.3; c.beginPath(); c.moveTo(X(v), y0 - 5); c.lineTo(X(v), y0 + 5); c.stroke();
            T(c, p, v < 0 ? MI + Math.abs(v) : String(v), X(v), y0 + 17, { size: 12.5, color: pal.muted });
          }
          const lab = (t, x, y, col) => T(c, p, t, clamp(x, 30, W - 30), y, { size: fs, weight: 700, color: col });
          if (r.op === '+') {
            const s = r.a[0] + r.b[0];
            const arrow = (x1, x2, yy, col) => {
              if (Math.abs(x2 - x1) < .5) return;
              const d = Math.sign(x2 - x1); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 3; c.lineCap = 'round';
              c.beginPath(); c.moveTo(x1, yy); c.lineTo(x2 - d * 6, yy); c.stroke();
              c.beginPath(); c.moveTo(x2, yy); c.lineTo(x2 - d * 11, yy - 6); c.lineTo(x2 - d * 11, yy + 6); c.closePath(); c.fill();
            };
            arrow(X(0), X(r.a[0]), y0 - 20, pal.green); arrow(X(r.a[0]), X(s), y0 - 62, pal.red);
            lab(r.a[1], (X(0) + X(r.a[0])) / 2, y0 - 40, pal.green);
            lab(r.b[1], (X(r.a[0]) + X(s)) / 2, y0 - 82, pal.red);
          } else {
            [[r.a, pal.green, 22], [r.b, pal.red, 44]].forEach(([q, col, dy]) => {
              c.beginPath(); c.arc(X(q[0]), y0, 6.5, 0, TAU); c.fillStyle = col; c.fill();
              c.strokeStyle = col; c.lineWidth = 1.4; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(X(q[0]), y0 - 8); c.lineTo(X(q[0]), y0 - dy + 8); c.stroke(); c.setLineDash([]);
              lab(q[1], X(q[0]), y0 - dy, col);
            });
          }
          const rx = X(r.res);
          c.beginPath(); c.arc(rx, y0, 9.5, 0, TAU);
          if (reveal) { c.fillStyle = r.rat ? pal.blue : pal.yellow; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 2.4; c.stroke(); }
          else { c.strokeStyle = pal.text; c.lineWidth = 2.2; c.setLineDash([4, 3]); c.stroke(); c.setLineDash([]); }
          if (reveal) {
            const str = (r.op === '+' ? 'sum ' : 'product ') + '= ' + r.rl; c.save(); c.font = font(fs, 700); const tw = c.measureText(str).width; c.restore();
            const lx = clamp(rx, tw / 2 + 8, W - tw / 2 - 8);
            T(c, p, str, lx, y0 + 40, { size: fs, weight: 700 }); T(c, p, r.rat ? 'rational' : 'irrational', lx, y0 + 40 + fs + 5, { size: fs, weight: 700, color: r.rat ? pal.blue : pal.yellow });
          }
          else T(c, p, (r.op === '+' ? 'sum' : 'product') + ' = ?', clamp(rx, 40, W - 40), y0 + 40, { size: fs, weight: 700, color: pal.muted });
        });
      };

      const dec = v => { const s = (+v.toFixed(8)).toString(); return s.replace('-', MI); };
      const drawDense = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, lo = dn.lo, w = dn.w, hi = lo + w, fs = clamp(W / 24, 14, 17), y0 = H * .5;
        const X = v => 28 + (v - lo) / w * (W - 56);
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 2; c.beginPath(); c.moveTo(14, y0); c.lineTo(W - 14, y0); c.stroke();
        const D = Math.round(10 * Math.pow(2, dn.hist.length / 2));
        let cnt = 0;
        for (let q = 2; q <= D; q++) for (let n = Math.ceil(lo * q); n <= Math.floor(hi * q); n++) {
          if (gcd(n, q) !== 1 || ++cnt > 600) continue;
          c.beginPath(); c.arc(X(n / q), y0, 2.6, 0, TAU); c.fillStyle = alpha(pal.blue, .7); c.fill();
        }
        T(c, p, `Window ${dec(lo)} to ${dec(hi)}`, W / 2, 26, { size: clamp(W / 18, 17, 24), weight: 700 });
        T(c, p, `Zoom ${dn.hist.length}: the window is ${dn.hist.length ? '1/' + Math.pow(2, dn.hist.length) : '1'} wide`, W / 2, 26 + clamp(W / 18, 17, 24) + 4, { size: fs - 1, color: pal.muted });
        /* the two rational endpoints and their average */
        const mid = lo + w / 2, ir = lo + w / R2;
        [[lo, 'left'], [hi, 'right']].forEach(([v]) => { c.beginPath(); c.arc(X(v), y0, 8, 0, TAU); c.fillStyle = pal.blue; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 2; c.stroke(); });
        T(c, p, dec(lo), clamp(X(lo), 34, W - 34), y0 + 24, { size: fs, weight: 700, color: pal.blue });
        T(c, p, dec(hi), clamp(X(hi), 34, W - 34), y0 + 24, { size: fs, weight: 700, color: pal.blue });
        c.beginPath(); c.arc(X(mid), y0, 8, 0, TAU); c.fillStyle = pal.violet; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 2; c.stroke();
        T(c, p, 'average ' + dec(mid), X(mid), y0 - 28, { size: fs, weight: 700, color: pal.violet });
        c.beginPath(); c.arc(X(ir), y0, 8, 0, TAU); c.fillStyle = pal.yellow; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 2; c.stroke();
        T(c, p, 'irrational ' + (+ir.toFixed(6)), clamp(X(ir), 80, W - 80), y0 + 52, { size: fs, weight: 700, color: pal.yellow });
        if (R2 >= lo && R2 <= hi) {
          c.strokeStyle = pal.red; c.lineWidth = 2; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(X(R2), y0 - 80); c.lineTo(X(R2), y0 + 12); c.stroke(); c.setLineDash([]);
          T(c, p, '√2 ≈ ' + (+R2.toFixed(5)), clamp(X(R2), 55, W - 55), y0 - 92, { size: fs, weight: 700, color: pal.red });
        } else T(c, p, '√2 is outside this window', W / 2, y0 - 92, { size: fs, color: pal.muted });
        const cap = wrap(c, `Blue dots: some of the rational numbers (denominators up to ${D}). Between any two dots there are more.`, W - 28, fs - 1);
        cap.forEach((l, i) => T(c, p, l, W / 2, H - 38 + i * (fs + 2) - (cap.length - 1) * (fs + 2) / 2, { size: fs - 1, color: pal.muted }));
      };

      const drawFor = (c, p) => {
        hits = [];
        const pal = p.pal;
        if (st.practice) {
          const pr = PROBS[prIdx];
          if (prOver) { drawNest(c, p, { top: 6 }); return; }
          const sub = pr.subs[prSub];
          if (pr.kind === 'rows') {
            const h0 = banner(c, p, sub.q, pal.text, clamp(p.w / 24, 15, 19));
            drawRows(c, p, sub.rows, prDoneAll, h0 + 10); return;
          }
          let head = pr.head, color = pal.text, size = clamp(p.w / 12, 22, 32);
          if (pr.kind === 'tf') { head = sub.q; size = clamp(p.w / 24, 16, 21); if (prDoneAll) { head += sub.ans === 0 ? '  (True)' : '  (False)'; color = pal.green; } }
          if (pr.kind === 'sort') head = 'Sort: ' + (prDoneAll ? 'all placed' : sub.lab);
          const h0 = banner(c, p, head, color, size);
          const chips = prChips.map(ch => ({ ...ch, i: -1 }));
          drawNest(c, p, { top: h0 + 8, chips, tint: prDoneAll && pr.kind === 'set' && sub.ans < 4 ? sub.ans : -1, flash: st.flash });
          return;
        }
        if (st.view === 'stairs') drawStairs(c, p);
        else if (st.view === 'dense') drawDense(c, p);
        else if (st.view === 'closure') { const cl = CL[st.ci]; const h0 = banner(c, p, cl.t, pal.text, clamp(p.w / 14, 21, 30)); drawRows(c, p, cl.rows, cAns[st.ci] >= 0 && cAns[st.ci] === cl.ans, h0 + 6); }
        else {
          const chips = [], tray = [], cu = st.cur;
          NUMS.forEach((n, i) => { if (placed[i] >= 0) chips.push({ lab: n.lab, set: placed[i], i, sel: i === cu }); else tray.push({ lab: n.lab, i, sel: i === cu }); });
          const on = []; if (placed[cu] >= 0) for (let k = NUMS[cu].set; k < 4; k++) on.push(k);
          drawNest(c, p, { chips, tray, trayAll: NUMS.map(n => n.lab), on, tint: st.drag && st.drag.moved ? ringAt(st.drag.x, st.drag.y) : -1, flash: st.flash, pop: st.pop, drag: st.drag });
        }
      };
      P.onDraw = (c, p) => drawFor(c, p);

      /* drag a number into a ring */
      const ringAt = (x, y) => { if (!lay) return -1; for (let k = 0; k < 4; k++) { const r = lay.rects[k]; if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return k; } return -1; };
      const cv = P.canvas;
      const posOf = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      cv.addEventListener('pointerdown', e => {
        if (st.practice || st.view !== 'nest') return;
        const [x, y] = posOf(e), hit = hits.find(b => x >= b.x - 3 && x <= b.x + b.w + 3 && y >= b.y - 3 && y <= b.y + b.h + 3);
        if (!hit) return;
        e.preventDefault(); st.cur = hit.i; clearAlso(); nfb.innerHTML = '';
        if (hit.tray && st.pred) { st.drag = { i: hit.i, x, y, moved: false, x0: x, y0: y }; cv.setPointerCapture(e.pointerId); }
        else if (hit.tray) nfb.innerHTML = 'Make your prediction first. Then you can drag the numbers.';
        sync();
      });
      cv.addEventListener('pointermove', e => {
        if (!st.drag) return;
        const [x, y] = posOf(e); st.drag.x = x; st.drag.y = y;
        if (Math.hypot(x - st.drag.x0, y - st.drag.y0) > 6) st.drag.moved = true;
        P.requestDraw();
      });
      const endDrag = e => {
        if (!st.drag) return;
        const d = st.drag; st.drag = null;
        if (d.moved) { const k = ringAt(d.x, d.y); if (k >= 0) { assign(k); return; } nfb.innerHTML = 'Drop the number inside a ring, or use the buttons.'; }
        sync();
      };
      cv.addEventListener('pointerup', endDrag);
      cv.addEventListener('pointercancel', () => { st.drag = null; sync(); });

      /* ================= panel ================= */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const addTo = (...els) => panel.append(...els);
      let selEq, sBtns, sRo, sfb, predQ, predRow, predFb, nRo, nBtns, nfb, prevB, nextB, alT, alBtn, alFb;
      let dRo, dBtns, clQ, clBtns, clFb, clNext, clRo;
      let startBtn, ptally, pq, pch, pfb, pnext;

      /* ----- the staircase ----- */
      grp('stairs', () => {
        C.title('Equations and number sets');
        selEq = C.select({ label: 'Choose an equation', options: STAIRS.map((s, i) => ({ value: String(i), label: s.eq })), value: '0', onChange: v => { st.eq = +v; st.lvl = 0; st.pk = -1; fade(); sfb.innerHTML = ''; sync(); } });
        addTo(h('p', { class: 'hint' }, 'Which is the smallest set that contains every solution? Press it. The number line changes to that set.'));
        sBtns = C.buttons(SETCH.map((l, i) => ({ label: l, onClick: () => pickStairs(i) })));
        sRo = C.readout(); sfb = C.readout();
      });
      const fade = () => { cancel(); st.ap = 0; cancel = animateTo(st, { ap: 1 }, 500, () => P.draw()); };
      const pickStairs = i => {
        const E = STAIRS[st.eq]; st.lvl = Math.min(i, 3); st.pk = i; fade();
        const right = i === E.ans;
        if (right) sfb.innerHTML = good('Right.') + ' ' + E.why;
        else if (E.ans === 4) sfb.innerHTML = bad('Not quite.') + ` ${SETS[i]} cannot hold a solution: there is no real number to put on the line. ` + E.why;
        else if (i === 4) sfb.innerHTML = bad('Not quite.') + ' This equation does have a solution in the sets we know. ' + E.why;
        else if (i < E.ans) sfb.innerHTML = bad('Not quite.') + ` ${SETS[i]} is too small: a solution is missing from it. ` + E.why;
        else sfb.innerHTML = bad('Not the smallest.') + ` ${SETS[i]} does hold the solution, but ${SETS[E.ans]} already does. ` + E.why;
        sync();
      };
      const stairsRo = () => {
        const E = STAIRS[st.eq], L = lvlOf();
        const inn = E.sols.length ? E.sols.map(s => (s.rank <= L ? s.lab + ' is on the line' : s.lab + ' is not on the line')).join('; ') : 'nothing on the line fits';
        return lines([`${kk('Equation')} <b>${E.eq}</b>`, `${kk('Solution')} ${E.sol}`, `${kk('Number line shows')} ${SETS[L]}, the ${SETNAME[L]}`, `${kk('So')} ${inn}.`]);
      };

      /* ----- the nested sets ----- */
      grp('nest', () => {
        C.title('Predict first');
        predQ = h('p', { class: 'hint' }, 'Which of these numbers do you think is irrational?');
        predRow = h('div', { class: 'ctl buttons' }); predFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        addTo(predQ, predRow, predFb);
        PRED.forEach((o, i) => predRow.append(mkBtn(o[0], () => {
          if (st.pred) return; st.pred = true;
          Array.from(predRow.children).forEach((b, j) => { b.disabled = true; if (j === i) b.classList.add('primary'); });
          predFb.innerHTML = o[1]; if (nfb) nfb.innerHTML = ''; sync();
        })));
        C.title('Sort the numbers');
        addTo(h('p', { class: 'hint' }, 'Choose a number, then press the innermost set that holds it. (You can also drag it on the picture.)'));
        const bs = C.buttons([{ label: '◀ Previous number', onClick: () => stepNum(-1) }, { label: 'Next number ▶', onClick: () => stepNum(1) }]); prevB = bs[0]; nextB = bs[1];
        nRo = C.readout();
        nBtns = C.buttons(SETS.map((l, i) => ({ label: l, onClick: () => assign(i) })));
        nfb = C.readout();
        C.title('Also belongs to');
        addTo(h('p', { class: 'hint' }, 'Tick every set that contains the chosen number, then check. Place the number first.'));
        alT = SETS.map((l, k) => C.toggle({ label: `${l}  ${SETNAME[k]}`, value: false, onChange: v => { st.sel[k] = v; alFb.innerHTML = ''; } }));
        alBtn = C.buttons([{ label: 'Check the sets', onClick: () => checkAlso() }])[0];
        alFb = C.readout();
      });
      const clearAlso = () => { st.sel = [false, false, false, false]; alT.forEach(t => { t.checked = false; }); if (alFb) alFb.innerHTML = ''; };
      const stepNum = d => { st.cur = (st.cur + d + NUMS.length) % NUMS.length; clearAlso(); nfb.innerHTML = ''; sync(); };
      const assign = k => {
        if (!st.pred) { nfb.innerHTML = 'Make your prediction first. Then you can place numbers.'; sync(); return; }
        const i = st.cur, n = NUMS[i];
        if (placed[i] >= 0) { nfb.innerHTML = `${n.lab} is already placed in ${SETS[placed[i]]}. Choose another number.`; sync(); return; }
        if (k === n.set) {
          placed[i] = k; if (!nTried[i]) nFirst++;
          nfb.innerHTML = good('Right.') + ' ' + n.why;
          cancel2(); st.pop = { i, a: 0 }; cancel2 = animateTo(st.pop, { a: 1 }, 450, () => P.draw());
          clearAlso();
        } else {
          nTried[i] = true;
          nfb.innerHTML = (k < n.set ? bad('Not quite.') + ` ${n.lab} is not in ${SETS[k]}. ` : bad('Not the innermost set.') + ` ${n.lab} is in ${SETS[k]}, but it also belongs to a smaller set. `) + n.why;
          cancel2(); st.flash = { k, a: 1 }; cancel2 = animateTo(st.flash, { a: 0 }, 900, () => P.draw());
        }
        sync();
      };
      const checkAlso = () => {
        const i = st.cur, n = NUMS[i]; if (placed[i] < 0) return;
        const want = SETS.map((_, k) => k >= n.set), got = st.sel;
        const extra = SETS.filter((_, k) => got[k] && !want[k]), miss = SETS.filter((_, k) => !got[k] && want[k]);
        const ok = SETS.filter((_, k) => want[k]).join(', ');
        if (!extra.length && !miss.length) alFb.innerHTML = good('Right.') + ` ${n.lab} is in ${ok}. Each ring sits inside the next, so a number in one ring is also in every ring around it.`;
        else alFb.innerHTML = bad('Not quite.') + (extra.length ? ` ${n.lab} is not in ${extra.join(' or ')}: it is not that kind of number.` : '') + (miss.length ? ` It is also in ${miss.join(' and ')}, because every ring is inside the next one.` : '') + ` The full answer: ${ok}.`;
      };
      const nestRo = () => {
        const i = st.cur, n = NUMS[i], done = placed.filter(v => v >= 0).length;
        return lines([`${kk('Number')} <b>${n.lab}</b> (${i + 1} of ${NUMS.length})`, placed[i] >= 0 ? `${kk('Placed in')} ${SETS[placed[i]]}, ${SETNAME[placed[i]]}. Which other sets hold it? Tick them below.` : `${kk('Placed in')} nothing yet`,
          `${kk('Sorted')} ${done} of ${NUMS.length}` + (done === NUMS.length ? `. Right on the first try: ${nFirst}.` : '')]);
      };

      /* ----- density ----- */
      grp('dense', () => {
        C.title('Zoom in');
        addTo(h('p', { class: 'hint' }, 'Halve the window as many times as you like. Does it ever stop containing both kinds of number?'));
        dBtns = C.buttons([{ label: 'Left half', onClick: () => zoom('l') }, { label: 'Right half', onClick: () => zoom('r') }, { label: 'Half that holds √2', onClick: () => zoom('s') }, { label: 'Zoom out one step', onClick: () => zoom('o') }]);
        dRo = C.readout();
      });
      const zoom = d => {
        if (d === 'o') { const q = dn.hist.pop(); if (q) { dn.lo = q[0]; dn.w = q[1]; } sync(); return; }
        if (dn.hist.length >= 8) return;
        dn.hist.push([dn.lo, dn.w]);
        const half = dn.w / 2, rightGoes = d === 'r' || (d === 's' && R2 >= dn.lo + half);
        if (rightGoes) dn.lo += half; dn.w = half; sync();
      };
      const denseRo = () => {
        const lo = dn.lo, hi = dn.lo + dn.w, mid = lo + dn.w / 2, ir = lo + dn.w / R2;
        const wt = dn.hist.length ? '1/' + Math.pow(2, dn.hist.length) : '1';
        return lines([`${kk('Window')} ${dec(lo)} to ${dec(hi)}, width ${wt}. Both ends are rational.`,
          `${kk('Average')} (${dec(lo)} + ${dec(hi)}) ÷ 2 = <b>${dec(mid)}</b>, rational, between them.`,
          `${kk('Irrational')} ${dec(lo)} + ${dec(dn.w)} ÷ √2 ≈ <b>${+ir.toFixed(6)}</b>, between them too.`,
          R2 >= lo && R2 <= hi ? `${kk('√2')} ≈ ${+R2.toFixed(6)} is inside this window. It is not one of the blue dots: it sits in a gap.` : `${kk('√2')} is outside this window. Use Zoom out or Half that holds √2.`,
          dn.hist.length >= 8 ? 'You reached the deepest zoom, but the same would happen forever.' : ''].filter(Boolean));
      };

      /* ----- closure ----- */
      grp('closure', () => {
        C.title('Test the example');
        clQ = h('p', { class: 'hint' }); clBtns = []; const row = h('div', { class: 'ctl buttons' });
        CLCH.forEach((l, i) => { const b = mkBtn(l, () => pickCl(i)); clBtns.push(b); row.append(b); });
        clFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        clNext = mkBtn('Next example', () => { st.ci = (st.ci + 1) % CL.length; sync(); }, false);
        addTo(clQ, row, clFb, h('div', { class: 'ctl buttons' }, clNext));
        clRo = C.readout();
      });
      const pickCl = i => {
        const cl = CL[st.ci]; if (cAns[st.ci] === cl.ans) return;
        if (i === cl.ans) { cAns[st.ci] = i; } else { cTried[st.ci] = true; cAns[st.ci] = i; }
        sync();
      };
      const closureText = () => {
        const cl = CL[st.ci], a = cAns[st.ci];
        if (a < 0) return '';
        return a === cl.ans ? good('Right.') + ' ' + cl.why : bad('Not quite.') + ` “${CLCH[a]}” is not correct here. ` + cl.why + ' Try another answer.';
      };

      /* ----- Practice ----- */
      C.title('Practice');
      C.hint('Seven short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); if (st.practice) { st.practice = false; sync(); } else { st.practice = true; if (!prOver) loadProb(); sync(); } } }])[0];
      grp('practice', () => {
        ptally = h('p', { class: 'ctl-title' });
        pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        pch = h('div', { class: 'ctl buttons' });
        pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pnext = mkBtn('Next problem', () => nextProb(), true);
        addTo(ptally, pq, pch, pfb, h('div', { class: 'ctl buttons' }, pnext));
      });
      const tally = () => { ptally.textContent = prOver ? `Right on the first try: ${prFirst} of ${PROBS.length}` : `Problem ${prIdx + 1} of ${PROBS.length}. Right on the first try: ${prFirst} of ${prDone} done`; };
      const loadSub = () => {
        const pr = PROBS[prIdx], sub = pr.subs[prSub];
        pq.textContent = (pr.subs.length > 1 ? `(${prSub + 1} of ${pr.subs.length}) ` : '') + (pr.kind === 'tf' ? 'True or false: ' : '') + sub.q;
        pch.replaceChildren(); pr.ch.forEach((l, i) => pch.append(mkBtn(l, () => pickProb(i))));
      };
      const loadProb = () => {
        const pr = PROBS[prIdx]; prSub = 0; prTried = false; prDoneAll = false; prChips = []; st.flash = { k: -1, a: 0 };
        pfb.innerHTML = ''; pnext.disabled = true; pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        loadSub(); tally();
      };
      const pickProb = i => {
        const pr = PROBS[prIdx], sub = pr.subs[prSub], btn = pch.children[i];
        if (prDoneAll) return;
        if (i === sub.ans) {
          pfb.innerHTML = good('Right.') + ' ' + sub.why;
          if (pr.kind === 'sort') prChips.push({ lab: sub.lab, set: sub.ans });
          if (pr.kind === 'set') sub.chips.forEach(l => prChips.push({ lab: l, set: sub.ans < 4 ? sub.ans : 0 }));
          if (prSub < pr.subs.length - 1) { prSub++; loadSub(); }
          else {
            prDoneAll = true; prDone++; if (!prTried) prFirst++;
            Array.from(pch.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary'); pnext.disabled = false;
            if (pr.kind === 'set' && sub.ans === 4) prChips = [];
          }
        } else {
          prTried = true; btn.disabled = true;
          let pre;
          if (pr.kind === 'set' || pr.kind === 'sort') {
            if (i === 4) pre = 'There is a solution in the sets we know. ';
            else if (sub.ans === 4) pre = `${SETS[i]} cannot hold a solution. `;
            else if (i < sub.ans) pre = `${SETS[i]} is too small: it misses ${pr.kind === 'sort' ? 'this number' : 'a solution'}. `;
            else pre = `${SETS[i]} does hold it, but a smaller set does too. `;
            cancel2(); st.flash = { k: Math.min(i, 3), a: 1 }; cancel2 = animateTo(st.flash, { a: 0 }, 900, () => P.draw());
          } else pre = '';
          pfb.innerHTML = bad('Not quite.') + ' ' + pre + sub.why + ' Try another answer.';
        }
        tally(); sync();
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); sync(); return; }
        prOver = true; pq.textContent = 'All seven problems are done.'; pch.replaceChildren(); pnext.disabled = true;
        pfb.innerHTML = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        pch.append(mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; prOver = false; loadProb(); sync(); }, true));
        tally(); sync();
      };

      /* ----- sync ----- */
      const sync = () => {
        const prac = st.practice;
        vis(G.stairs, !prac && st.view === 'stairs'); vis(G.nest, !prac && st.view === 'nest'); vis(G.dense, !prac && st.view === 'dense');
        vis(G.closure, !prac && st.view === 'closure'); vis(G.practice, prac);
        selEq.value = String(st.eq);
        sBtns.forEach((b, i) => b.classList.toggle('primary', i === st.pk));
        sRo.innerHTML = stairsRo();
        nBtns.forEach(b => { b.disabled = !st.pred || placed[st.cur] >= 0; });
        nRo.innerHTML = nestRo();
        const canAlso = placed[st.cur] >= 0; alT.forEach(t => { t.disabled = !canAlso; }); alBtn.disabled = !canAlso;
        dRo.innerHTML = denseRo();
        dBtns[0].disabled = dBtns[1].disabled = dBtns[2].disabled = dn.hist.length >= 8; dBtns[3].disabled = !dn.hist.length;
        const cl = CL[st.ci]; clQ.textContent = 'Is the result rational, irrational, or does it depend on the numbers?';
        const solved = cAns[st.ci] === cl.ans;
        clBtns.forEach((b, i) => { b.disabled = solved; b.classList.toggle('primary', solved && i === cl.ans); });
        clFb.innerHTML = closureText();
        clRo.innerHTML = lines([`${kk('Example')} ${st.ci + 1} of ${CL.length}: <b>${cl.t}</b>`, `${kk('Solved')} ${cAns.filter((a, i) => a === CL[i].ans).length} of ${CL.length}`]);
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        P.draw();
      };

      const FLAGS = ['view', 'eq', 'lvl', 'dz', 'ci'];
      const apply = (patch, immediate) => {
        cancel(); st.practice = false; st.drag = null;
        for (const k in patch) {
          if (k === 'dz') { dn.lo = 1; dn.w = 1; dn.hist = []; }
          else if (FLAGS.includes(k)) st[k] = patch[k];
        }
        if (patch.eq !== undefined) { sfb.innerHTML = ''; st.pk = -1; }
        if (patch.view === 'nest') nfb.innerHTML = '';
        if (patch.view === 'closure') { /* keep earlier answers */ }
        if (immediate) { st.ap = 1; sync(); } else { st.ap = 0; sync(); cancel = animateTo(st, { ap: 1 }, 600, () => P.draw()); }
      };
      sync();
      return { destroy: () => { cancel(); cancel2(); P.destroy(); }, apply };
    }
  });
}
