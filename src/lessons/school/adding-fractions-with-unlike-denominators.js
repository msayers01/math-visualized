/* =====================================================================
   SCHOOL — Adding and subtracting fractions with unlike denominators
   ===================================================================== */
{
  /* ---------- numbers and words ---------- */
  const MINUS = '−';
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; };
  const lcm = (a, b) => a / gcd(a, b) * b;
  const F = (n, d) => n + '/' + d;
  const DENS = [2, 3, 4, 5, 6, 8, 10, 12];
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = (a, b) => `<span class="k">${a}</span> ${b}`;
  /* simplest form and mixed number, as words */
  const simplest = (n, d) => { const g = gcd(n, d); return F(n / g, d / g); };
  const mixedWords = (n, d) => { const g = gcd(n, d), a = n / g, b = d / g, w = Math.floor(a / b), r = a % b; return r === 0 ? String(w) : (w ? w + ' and ' + F(r, b) : F(r, b)); };
  /* compare the exact value with the benchmark: 1 for adding, 1/2 for subtracting */
  const sign = v => (v < 0 ? 'less' : v > 0 ? 'more' : 'equal');
  const cmpTo = (op, n1, d1, n2, d2) => op === 'add' ? sign(n1 * d2 + n2 * d1 - d1 * d2) : sign(2 * (n1 * d2 - n2 * d1) - d1 * d2);
  const lessThan = { less: 'less than', equal: 'exactly', more: 'more than' };

  /* ---------- practice problems (a fixed list) ---------- */
  const PR = [
    { kind: 'cut', op: 'add', n1: 1, d1: 3, n2: 1, d2: 4, label: 'Pick the cut size',
      q: '1/3 + 1/4. Which size of piece makes both bars line up? Pick one and watch the cuts.', right: 2,
      choices: [
        { t: 'Sixths', D: 6, why: '1/3 is 2 sixths, so that bar lines up. But 1/4 would be 1 and a half sixths. Its edge lands inside a piece. Try a size that both 3 and 4 go into.' },
        { t: 'Eighths', D: 8, why: '1/4 is 2 eighths, so that bar lines up. But 1/3 would be 2 and two-thirds eighths. Its edge lands inside a piece.' },
        { t: 'Twelfths', D: 12, why: 'Yes. 1/3 is 4 twelfths and 1/4 is 3 twelfths. Both edges land on a cut, because 3 and 4 both go into 12.' }] },
    { kind: 'pred', op: 'add', n1: 3, d1: 4, n2: 1, d2: 2, label: 'Predict: more or less than 1',
      q: 'Predict before you cut. Is 3/4 + 1/2 more or less than 1?', right: 0,
      choices: [
        { t: 'More than 1', why: 'Yes. 1/2 + 1/2 is exactly 1, and 3/4 is more than 1/2. So the sum is more than 1. Cut into fourths: 3/4 + 2/4 = 5/4, which is 1 and 1/4.' },
        { t: 'Less than 1', why: 'Not quite. 3/4 alone is already more than half. Add another half and you pass 1. Cut into fourths: 3/4 + 2/4 = 5/4.' },
        { t: 'Exactly 1', why: 'Not quite. 1/2 + 1/2 would be exactly 1. But 3/4 is bigger than 1/2, so the sum goes past 1.' }] },
    { kind: 'sum', op: 'add', n1: 1, d1: 2, n2: 1, d2: 3, label: 'Add 1/2 + 1/3',
      q: 'The bars show 1/2 and 1/3. What is 1/2 + 1/3?', right: 2,
      choices: [
        { t: '2/5', why: 'This is the trap. It adds the tops (1 + 1) and the bottoms (2 + 3). But 2/5 is less than 1/2 alone, and adding cannot make the amount smaller.' },
        { t: '2/6', why: 'This adds the tops but multiplies the bottoms. 2/6 is just 1/3, which is smaller than 1/2. The sum must be bigger than 1/2.' },
        { t: '5/6', why: 'Yes. Cut both into sixths: 1/2 = 3/6 and 1/3 = 2/6. Then 3 pieces + 2 pieces = 5 pieces, so 5/6.' },
        { t: '1/6', why: 'That is 1/2 − 1/3, the difference. The question asks for the sum, so put the pieces together.' }] },
    { kind: 'sub', op: 'sub', n1: 5, d1: 6, n2: 1, d2: 3, label: 'Subtract 5/6 − 1/3',
      q: 'Start with 5/6 of a bar. Take away 1/3 of a bar. How much is left?', right: 1,
      choices: [
        { t: '4/3', why: 'This subtracts the tops (5 − 1) and the bottoms (6 − 3). 4/3 is more than a whole, but you started with less than a whole and took some away.' },
        { t: '1/2', why: 'Yes. 1/3 is 2 sixths. 5 sixths − 2 sixths = 3 sixths, and 3/6 is the same as 1/2.' },
        { t: '4/6', why: 'This takes away only 1 sixth. But 1/3 is 2 sixths. Cut both into the same size first, then count.' },
        { t: '1/3', why: '1/3 is the amount you took away, not what is left. Left over: 5/6 − 2/6 = 3/6.' }] },
    { kind: 'sum', op: 'add', n1: 2, d1: 3, n2: 3, d2: 4, label: 'Add 2/3 + 3/4',
      q: 'Add 2/3 and 3/4. The sum is more than 1. What is it?', right: 0,
      choices: [
        { t: '17/12 (1 and 5/12)', why: 'Yes. In twelfths, 2/3 = 8/12 and 3/4 = 9/12. Then 8 + 9 = 17, so 17/12. That is 12/12 (one whole) and 5/12 more.' },
        { t: '5/7', why: 'This is the trap again: 2 + 3 on top and 3 + 4 on the bottom. It is less than 1, but 2/3 + 3/4 is more than 1.' },
        { t: '11/12', why: 'This keeps the 3 from 3/4 on top when the bottom changes to 12. But 3/4 is 9 twelfths, not 3 twelfths. Both numbers change together.' },
        { t: '1/12', why: 'This is 9/12 − 8/12, the difference. The question asks for the sum.' }] },
    { kind: 'err', op: 'add', n1: 1, d1: 4, n2: 1, d2: 6, label: 'Spot the mistake',
      q: 'Sam says 1/4 + 1/6 = 2/10. What went wrong?', right: 1,
      choices: [
        { t: 'Nothing. 1 + 1 = 2 and 4 + 6 = 10, so 2/10 is right.', why: 'Not quite. 2/10 is the same as 1/5, which is less than 1/4 alone. A sum cannot be smaller than one of the parts.' },
        { t: 'Sam added the tops and the bottoms, but the pieces are not the same size.', why: 'Yes. Fourths and sixths are different sizes. Cut both into twelfths: 3/12 + 2/12 = 5/12.' },
        { t: 'Sam should have multiplied the two fractions.', why: 'Multiplying is a different job. Adding means putting amounts together, so first cut into the same size pieces.' },
        { t: 'Sam should have cut both bars into tenths.', why: 'Tenths do not work here. 1/4 would be 2 and a half tenths. Twelfths work, because 4 and 6 both go into 12.' }] },
    { kind: 'sub', op: 'sub', n1: 3, d1: 5, n2: 1, d2: 2, label: 'Subtract 3/5 − 1/2',
      q: 'Find 3/5 − 1/2. Cut both bars into tenths first.', right: 2,
      choices: [
        { t: '2/3', why: 'This subtracts the tops (3 − 1) and the bottoms (5 − 2). The pieces were not the same size, so that does not work.' },
        { t: '2/10', why: 'This subtracts the tops (3 − 1) and writes the new bottom, 10. But the tops change too: 3/5 is 6 tenths and 1/2 is 5 tenths.' },
        { t: '1/10', why: 'Yes. 3/5 = 6/10 and 1/2 = 5/10. Take away 5 pieces from 6 pieces. One tenth is left.' },
        { t: '11/10', why: 'That is 6/10 + 5/10, the sum. The question says subtract, so take the pieces away.' }] }
  ];

  /* ---------- drawing helpers (pixel space) ---------- */
  const SANS = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
  const font = (size, weight = 600) => `${weight} ${size}px ${SANS}`;
  const T = (c, p, s, x, y, { size = 13, color, align = 'center', weight = 600, halo = true } = {}) => {
    c.font = font(size, weight); c.textAlign = align; c.textBaseline = 'middle';
    if (halo) { c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(s, x, y); }
    c.fillStyle = color || p.pal.text; c.fillText(s, x, y);
  };
  const line = (c, x0, y0, x1, y1, color, width = 1.5, dash) => {
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.strokeStyle = color; c.lineWidth = width; c.setLineDash(dash || []); c.lineCap = 'round'; c.stroke(); c.setLineDash([]);
  };
  const wrap = (c, s, size, maxW) => {
    c.font = font(size, 600);
    const words = s.split(' '), out = []; let cur = '';
    for (const w of words) { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; }
    if (cur) out.push(cur); return out;
  };

  register({
    id: 'adding-fractions-with-unlike-denominators', level: 'school',
    title: 'Adding and subtracting fractions with unlike denominators',
    blurb: 'Cut two fraction bars into the same size pieces, then add or subtract by counting pieces.',
    thumb(c, p) {
      const pal = p.pal, W = p.w, H = p.h, x0 = W * .1, wd = W * .8, bh = H * .17, fs = Math.max(9, H * .09);
      const row = (y, n, d, col, cuts, cutCol) => {
        c.fillStyle = alpha(col, .55); c.fillRect(x0, y, wd * n / d, bh);
        for (let i = 1; i < d; i++) line(c, x0 + wd * i / d, y, x0 + wd * i / d, y + bh, alpha(pal.text, .5), 1.3);
        c.strokeStyle = col; c.lineWidth = 2; c.strokeRect(x0, y, wd, bh);
        if (cuts) for (let i = 1; i < cuts; i++) line(c, x0 + wd * i / cuts, y - 3, x0 + wd * i / cuts, y + bh + 3, cutCol, 1.2, [3, 3]);
      };
      row(H * .14, 1, 2, pal.blue, 6, pal.violet); row(H * .4, 1, 3, pal.green, 6, pal.violet);
      c.fillStyle = alpha(pal.blue, .55); c.fillRect(x0, H * .68, wd * 3 / 6, bh);
      c.fillStyle = alpha(pal.green, .55); c.fillRect(x0 + wd * 3 / 6, H * .68, wd * 2 / 6, bh);
      for (let i = 1; i < 6; i++) line(c, x0 + wd * i / 6, H * .68, x0 + wd * i / 6, H * .68 + bh, alpha(pal.text, .5), 1.3);
      c.strokeStyle = pal.yellow; c.lineWidth = 2; c.strokeRect(x0, H * .68, wd, bh);
      c.font = font(fs, 700); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = pal.text;
      c.fillText('1/2 + 1/3 = 5/6', W / 2, H * .93);
    },
    hook: 'Mia ate 1/2 of a pizza, then 1/3 more. Why can you not just add the tops and the bottoms? How much did she eat?',
    steps: [
      { title: 'Pieces of different sizes',
        text: String.raw`<p>Mia ate 1/2 of a pizza. Then she ate 1/3 more. The top bar shows 1/2: two big pieces. The next bar shows 1/3: three smaller pieces.</p><p>You cannot count pieces that are different sizes. First, <em>predict</em>: is 1/2 + 1/3 more or less than 1? Pick a guess in the panel.</p>`,
        set: { mode: 'explore', op: 'add', n1: 1, d1: 2, n2: 1, d2: 3, D: 0, pred: null, trap: false } },
      { title: 'Cut into same-size pieces',
        text: String.raw`<p>Cut both bars into sixths. The bottom number of a fraction is its <em>denominator</em>. It says how many equal pieces make a whole. Now both bars have the same denominator, 6.</p><p>1/2 = 3/6 and 1/3 = 2/6. Count the pieces: 3 + 2 = 5. So 1/2 + 1/3 = 5/6. That is less than 1, because 5 pieces is fewer than 6.</p>`,
        set: { mode: 'explore', op: 'add', n1: 1, d1: 2, n2: 1, d2: 3, D: 6, pred: 'less', trap: false } },
      { title: 'The trap',
        text: String.raw`<p>Some people add the tops and add the bottoms: 1/2 + 1/3 = 2/5. Look at the red bar. 2/5 is shorter than 1/2 alone!</p><p>Adding cannot make the amount smaller. When you add, the pieces keep their size, so the bottom number stays 6. Only the number of pieces changes.</p>`,
        set: { mode: 'explore', op: 'add', n1: 1, d1: 2, n2: 1, d2: 3, D: 6, pred: 'less', trap: true } },
      { title: 'Subtract the same way',
        text: String.raw`<p>To subtract, also cut into same-size pieces first. For 3/4 − 1/3, cut into twelfths. 3/4 = 9/12 and 1/3 = 4/12.</p><p>Start with 9 pieces. Take away 4 pieces. 5 pieces are left: 9/12 − 4/12 = 5/12. That is less than 1/2, which is 6/12.</p>`,
        set: { mode: 'explore', op: 'sub', n1: 3, d1: 4, n2: 1, d2: 3, D: 12, pred: 'less', trap: false } }
    ],
    formal: String.raw`
      <h3>What the numbers mean</h3>
      <p>In \(\frac{3}{4}\), the bottom number is the <em>denominator</em>. It tells how many equal pieces make one whole. The top number is the <em>numerator</em>. It tells how many of those pieces you have.</p>
      <h3>Why the pieces must match</h3>
      <p>Adding is counting. You can say "3 apples and 2 apples make 5 apples" because they are the same kind of thing. In the same way, \(3\) sixths plus \(2\) sixths make \(5\) sixths. But \(1\) half plus \(1\) third is not "2 of something", because a half and a third are different sizes.</p>
      <h3>Making the pieces match</h3>
      <p>Cut both bars into the same number of pieces. That number must go evenly into both denominators. For \(\frac{1}{2}\) and \(\frac{1}{3}\), the number \(6\) works, because \(2 \times 3 = 6\). The bottom number is now a <em>common denominator</em>. Cutting a bar into more pieces does not change how much is shaded:
      \[ \frac{1}{2} = \frac{1 \times 3}{2 \times 3} = \frac{3}{6}, \qquad \frac{1}{3} = \frac{1 \times 2}{3 \times 2} = \frac{2}{6}. \]
      The top and the bottom are multiplied by the same number, so the fraction is the same size. If a cut size does not go into a denominator, one bar's edge lands inside a piece and you cannot count whole pieces.</p>
      <h3>Add or subtract</h3>
      <p>With the same denominator, count the pieces and keep the denominator:
      \[ \frac{3}{6} + \frac{2}{6} = \frac{5}{6}, \qquad \frac{9}{12} - \frac{4}{12} = \frac{5}{12}. \]
      The size of a piece does not change, so the bottom number stays. Only the number of pieces changes. Then write the answer in simplest form if you can. For example, \(\frac{3}{6} = \frac{1}{2}\).</p>
      <h3>Worked example</h3>
      <p>Find \(\frac{2}{3} + \frac{3}{4}\). Both \(3\) and \(4\) go into \(12\). So \(\frac{2}{3} = \frac{8}{12}\) and \(\frac{3}{4} = \frac{9}{12}\). Then \(\frac{8}{12} + \frac{9}{12} = \frac{17}{12}\). This is \(\frac{12}{12}\) (one whole) and \(\frac{5}{12}\) more, so it is \(1\frac{5}{12}\).</p>
      <h3>Predict first</h3>
      <p>Before you cut, estimate. Is each fraction more or less than \(\frac{1}{2}\)? Two fractions that are each less than a half add to less than \(1\). If one is more than a half and the other is a half or more, the sum is more than \(1\). Your estimate tells you if your answer makes sense.</p>
      <h3>Why \(\frac{1}{2} + \frac{1}{3} = \frac{2}{5}\) is wrong</h3>
      <p>The answer \(\frac{2}{5}\) is smaller than \(\frac{1}{2}\). But adding more to \(\frac{1}{2}\) cannot give less than \(\frac{1}{2}\). The mistake was adding the denominators. The denominator names the size of the pieces, so adding denominators changes the size of the pieces. That is not what adding means.</p>`,
    check: [
      { q: 'Why do we cut two fractions into the same size pieces before we add them?',
        choices: ['So the bottom number of the answer gets bigger.', 'Because we can only count pieces when they are all the same size.', 'Because the bottom numbers must be added too.', 'Because fractions with different bottom numbers cannot be added at all.'], answer: 1,
        why: 'Adding is counting. 2 sixths and 3 sixths make 5 sixths because the pieces are the same size. A half and a third are different sizes, so we first cut both into pieces of one size. Fractions with different bottoms can be added after that. The bottoms are not added, because the size of the piece stays the same.',
        hint: 'Think about counting apples and oranges. What do the pieces need to be before you can count them together?' },
      { q: 'Ana walks 3/4 of a mile to school. Then she walks 1/6 of a mile to a shop. Cut both into twelfths. How far did she walk in all?',
        choices: ['4/10 of a mile', '4/12 of a mile', '7/12 of a mile', '11/12 of a mile'], answer: 3,
        why: 'In twelfths, 3/4 = 9/12 (because 3 × 3 = 9 and 4 × 3 = 12) and 1/6 = 2/12 (because 1 × 2 = 2 and 6 × 2 = 12). Then 9/12 + 2/12 = 11/12 of a mile. The answer 4/10 adds tops and bottoms. The answer 4/12 adds the tops 3 + 1 but does not change them to twelfths. The answer 7/12 subtracts instead of adding.',
        hint: 'Change each fraction to twelfths first. Multiply the top and the bottom by the same number.' },
      { q: 'A student works out 5/6 − 1/2 like this. Step 1: cut into sixths, so 1/2 = 1/6. Step 2: 5/6 − 1/6 = 4/6. Which statement is true?',
        choices: ['Step 1 is wrong. 1/2 is 3 sixths (3/6), not 1 sixth.', 'Step 2 is wrong. The bottoms should be subtracted too.', 'Step 1 is right, but Step 2 should add 5/6 + 1/6.', 'There is no mistake.'], answer: 0,
        why: 'Half of 6 pieces is 3 pieces, so 1/2 = 3/6. When the bottom is multiplied by 3, the top must be multiplied by 3 too. Then 5/6 − 3/6 = 2/6, which is 1/3. Step 2 is fine for the numbers it was given. The bottoms are never subtracted, because the piece size stays the same.',
        hint: 'Check Step 1 with a bar. Cut a bar in half, then cut each half into 3 pieces. How many sixths is one half?' }
    ],
    links: { related: ['equivalent-fractions-on-a-number-line', 'decimals-and-place-value', 'ratios-and-equivalent-ratios'] },

    mount({ stage, controls: C }) {
      const P = new Plane(stage, { span: 5 });
      if (P.coordEl) P.coordEl.style.display = 'none';
      P.canvas.setAttribute('role', 'img');
      P.canvas.setAttribute('aria-label', 'Two fraction bars, cut into same-size pieces, and a third bar that shows the sum or difference. Use the buttons in the side panel.');
      const st = { mode: 'explore', op: 'add', n1: 1, d1: 2, n2: 1, d2: 3, D: 0, pred: null, predFb: '', trap: false, cutT: 1,
        pi: 0, pick: 0, solved: false, fb: '', wrongTry: false, results: {}, finished: false };
      let cancel = () => {};
      const draw = () => P.requestDraw();

      /* what the canvas shows, for explore and for practice */
      const view = () => {
        if (st.mode === 'explore') return { op: st.op, n1: st.n1, d1: st.d1, n2: st.n2, d2: st.d2, D: st.D, reveal: st.pred !== null, trap: st.trap && st.op === 'add', explore: true };
        const q = PR[st.pi];
        const D = q.kind === 'cut' ? (st.solved ? q.choices[q.right].D : st.pick) : (st.solved ? lcm(q.d1, q.d2) : 0);
        return { op: q.op, n1: q.n1, d1: q.d1, n2: q.n2, d2: q.d2, D, reveal: st.solved, trap: q.kind === 'err', explore: false };
      };
      const geo = v => {
        const k1 = v.D ? v.n1 * v.D / v.d1 : 0, k2 = v.D ? v.n2 * v.D / v.d2 : 0;
        const lined1 = v.D > 0 && Number.isInteger(k1), lined2 = v.D > 0 && Number.isInteger(k2);
        const bad = v.op === 'sub' && v.n2 * v.d1 > v.n1 * v.d2;
        const aligned = lined1 && lined2;
        const K = v.op === 'add' ? k1 + k2 : k1 - k2;
        const axis = v.op === 'add' && v.n1 * v.d2 + v.n2 * v.d1 > v.d1 * v.d2 ? 2 : 1;
        return { k1, k2, lined1, lined2, bad, aligned, K, axis };
      };

      /* ---------- the picture ---------- */
      P.onDraw = (c, p) => {
        const pal = p.pal, v = view(), g = geo(v), w = p.w, hh = p.h;
        const fs = clamp(Math.min(w, hh) / 26, 12, 17), m = clamp(w * .05, 12, 30), x0 = m;
        const wb = (w - 2 * m) / g.axis, rows = v.trap ? 4 : 3;
        const msgLines = 2, bottomH = msgLines * (fs + 4) + 10, axisH = fs + 8;
        const rowH = (hh - 8 - bottomH - axisH) / rows;
        const bh = clamp(rowH - fs - 14 - (v.trap ? fs + 4 : 0), 18, 56);
        const rowY = i => 8 + i * rowH, barY = i => rowY(i) + fs + 8, lblY = i => rowY(i) + fs / 2 + 2;
        const sub = v.op === 'sub';
        const A = F(v.n1, v.d1), B = F(v.n2, v.d2);

        const fracBar = (i, n, d, col, name, lined, kk_) => {
          const y = barY(i), ex = x0 + wb * n / d;
          T(c, p, name, x0, lblY(i), { size: fs, align: 'left', weight: 700, halo: false });
          if (v.D > 0) {
            const sl = lined ? `= ${F(kk_, v.D)}` : 'edge is inside a piece';
            T(c, p, sl, w - m, lblY(i), { size: fs, align: 'right', weight: 700, color: lined ? pal.text : pal.red, halo: false });
          }
          c.fillStyle = alpha(col, .5); c.fillRect(x0, y, wb * n / d, bh);
          for (let k = 1; k < d; k++) line(c, x0 + wb * k / d, y, x0 + wb * k / d, y + bh, alpha(pal.text, .55), 1.6);
          if (v.D > 0 && st.cutT > 0) {
            c.globalAlpha = st.cutT;
            for (let k = 1; k < v.D; k++) line(c, x0 + wb * k / v.D, y - 5, x0 + wb * k / v.D, y + bh + 5, pal.violet, 1.6, [4, 3]);
            c.globalAlpha = 1;
          }
          c.strokeStyle = col; c.lineWidth = 2.2; c.strokeRect(x0, y, wb, bh);
          if (v.D > 0 && !lined) { line(c, ex, y - 8, ex, y + bh + 8, pal.red, 3.5); }
        };
        fracBar(0, v.n1, v.d1, pal.blue, sub ? 'Start: ' + A : 'First: ' + A, g.lined1, g.k1);
        fracBar(1, v.n2, v.d2, pal.green, sub ? 'Take away: ' + B : 'Second: ' + B, g.lined2, g.k2);

        /* the third bar: the result */
        const ys = barY(2), full = w - 2 * m, show = g.aligned && v.reveal && !g.bad;
        T(c, p, sub ? 'What is left' : 'Together', x0, lblY(2), { size: fs, align: 'left', weight: 700, halo: false });
        if (show) {
          const pw = wb / v.D, D = v.D, tot = g.axis * D;
          const cell = (j, col, dash) => {
            c.fillStyle = alpha(col, dash ? .12 : .6); c.fillRect(x0 + j * pw, ys, pw, bh);
          };
          if (!sub) { for (let j = 0; j < g.k1; j++) cell(j, pal.blue); for (let j = g.k1; j < g.k1 + g.k2; j++) cell(j, pal.green); }
          else { for (let j = 0; j < g.K; j++) cell(j, pal.yellow); for (let j = g.K; j < g.k1; j++) cell(j, pal.green, true); }
          for (let j = 1; j < tot; j++) line(c, x0 + j * pw, ys, x0 + j * pw, ys + bh, alpha(pal.text, j % D === 0 ? .8 : .45), j % D === 0 ? 2 : 1.3);
          if (sub) {
            c.setLineDash([5, 4]); c.strokeStyle = pal.green; c.lineWidth = 2;
            c.strokeRect(x0 + g.K * pw + 1, ys + 1, g.k2 * pw - 2, bh - 2); c.setLineDash([]);
            T(c, p, 'taken away', x0 + (g.K + g.k2 / 2) * pw, ys + bh / 2, { size: fs - 1, color: pal.green, weight: 700 });
          }
          if (pw >= 17) {
            const upto = sub ? g.k1 : g.k1 + g.k2;
            for (let j = 0; j < upto; j++) {
              if (sub && j >= g.K) continue;
              T(c, p, String(j + 1), x0 + (j + .5) * pw, ys + bh / 2, { size: fs - 1, halo: false, weight: 700 });
            }
          }
          for (let j = 0; j < g.axis; j++) { c.strokeStyle = pal.yellow; c.lineWidth = 2.2; c.strokeRect(x0 + j * wb, ys, wb, bh); }
          const eq = sub ? `${F(g.k1, D)} ${MINUS} ${F(g.k2, D)} = ${F(g.K, D)}` : `${F(g.k1, D)} + ${F(g.k2, D)} = ${F(g.K, D)}`;
          T(c, p, eq, w - m, lblY(2), { size: fs, align: 'right', weight: 700, halo: false });
        } else {
          c.setLineDash([6, 5]); c.strokeStyle = pal.muted; c.lineWidth = 1.6; c.strokeRect(x0, ys, full, bh); c.setLineDash([]);
          const m1 = g.bad ? 'Take-away is bigger than the start'
            : v.D === 0 ? 'Pick a cut size to see the result'
            : !g.aligned ? 'Cuts do not line up. Pick another size.'
            : 'Predict first, then the result shows';
          T(c, p, m1, x0 + full / 2, ys + bh / 2, { size: fs, color: pal.muted, halo: false });
        }
        /* axis under the third bar */
        for (let j = 0; j <= g.axis; j++) {
          const x = x0 + j * wb;
          line(c, x, ys + bh, x, ys + bh + 5, pal.muted, 1.5);
          T(c, p, String(j), x, ys + bh + 5 + fs / 2 + 2, { size: fs - 1, color: pal.muted, halo: false });
        }
        /* the trap bar */
        if (v.trap) {
          const yt = barY(3), tn = v.n1 + v.n2, td = v.d1 + v.d2, shorter = tn * v.d1 < v.n1 * td;
          T(c, p, 'Trap: ' + F(tn, td), x0, lblY(3), { size: fs, align: 'left', weight: 700, color: pal.red, halo: false });
          T(c, p, shorter ? `shorter than ${A}` : 'tops and bottoms added', w - m, lblY(3), { size: fs, align: 'right', weight: 700, color: pal.red, halo: false });
          c.fillStyle = alpha(pal.red, .45); c.fillRect(x0, yt, wb * tn / td, bh);
          for (let k = 1; k < td; k++) line(c, x0 + wb * k / td, yt, x0 + wb * k / td, yt + bh, alpha(pal.text, .5), 1.4);
          c.strokeStyle = pal.red; c.lineWidth = 2.2; c.strokeRect(x0, yt, wb, bh);
          if (shorter) { const ex = x0 + wb * v.n1 / v.d1; line(c, ex, barY(0) + bh + 2, ex, yt + bh + 6, pal.red, 2, [5, 4]); }
        }
        /* a short line of words at the bottom */
        const msg = g.bad ? 'You cannot take away more than you start with.'
          : v.D === 0 ? 'The pieces are different sizes. Cut both bars into the same size.'
          : !g.aligned ? 'A red mark means that edge falls inside a piece, so you cannot count whole pieces.'
          : v.trap && v.reveal ? 'The red bar is too short. Adding bottoms changes the size of the pieces.'
          : show ? (sub ? `Take ${g.k2} pieces from ${g.k1} pieces. ${g.K} pieces are left.` : `${A} = ${F(g.k1, v.D)} and ${B} = ${F(g.k2, v.D)}. Count the pieces: ${g.k1} + ${g.k2} = ${g.K}.`)
          : 'Both bars have the same size pieces now. Predict to see the result.';
        const lines = wrap(c, msg, fs, w - 2 * m).slice(0, msgLines);
        lines.forEach((s, i) => T(c, p, s, w / 2, hh - bottomH + 6 + i * (fs + 4) + fs / 2, { size: fs, color: pal.text, halo: false, weight: 600 }));
      };

      /* ---------- the side panel ---------- */
      const probe = C.readout(), host = probe.parentElement; probe.remove();
      const group = () => { const g = h('div', { style: 'display:flex;flex-direction:column;gap:14px;flex:none' }); host.append(g); return g; };
      const mkBtn = (label, onClick, primary, extra = {}) => {
        const b = h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
        Object.assign(b.style, { minHeight: '44px', minWidth: '44px', padding: '8px 14px', fontSize: '.92rem' }, extra); return b;
      };
      const btnRow = (parent, els, label) => {
        const r = h('div', { class: 'ctl buttons', style: 'display:flex;flex-wrap:wrap;gap:8px' }, els);
        if (label) parent.append(h('p', { class: 'ctl-title', style: 'margin:0' }, label));
        parent.append(r); return r;
      };
      const mkSlider = (parent, { label, min, max, step, value, onInput }) => {
        const id = 'afu' + Math.random().toString(36).slice(2, 8), out = h('output', { for: id }), inp = h('input', { type: 'range', id, min, max, step, value });
        const lab = h('label', { for: id }, label);
        const upd = () => { out.textContent = inp.value; inp.style.setProperty('--p', ((+inp.value - +inp.min) / Math.max(1, +inp.max - +inp.min) * 100) + '%'); };
        inp.addEventListener('input', () => { upd(); onInput(+inp.value); });
        parent.append(h('div', { class: 'ctl slider' }, lab, out, inp)); upd();
        return { lab, set(v) { inp.max = inp.max; inp.value = v; upd(); }, setMax(mx) { inp.max = mx; upd(); }, get: () => +inp.value };
      };
      const mkSelect = (parent, label, onChange) => {
        const id = 'afs' + Math.random().toString(36).slice(2, 8), sel = h('select', { id }), lab = h('label', { for: id }, label);
        sel.addEventListener('change', () => onChange(+sel.value));
        parent.append(h('div', { class: 'ctl select' }, lab, sel)); return { sel, lab };
      };

      C.title('Choose a mode');
      const modeBtns = C.buttons([{ label: 'Explore', onClick: () => setMode('explore') }, { label: 'Practice', onClick: () => setMode('practice') }]);
      for (const b of modeBtns) Object.assign(b.style, { minHeight: '44px', minWidth: '44px', padding: '8px 18px' });
      const gEx = group(), gPr = group();

      /* explore controls */
      const opBtns = [mkBtn('Add', () => setOp('add')), mkBtn(MINUS + ' Subtract', () => setOp('sub'))];
      btnRow(gEx, opBtns, 'What to do');
      const sl1 = mkSlider(gEx, { label: 'First fraction: top number', min: 1, max: 1, step: 1, value: 1, onInput: v => { st.n1 = v; fracChanged(); } });
      const sel1 = mkSelect(gEx, 'First fraction: bottom number', v => { st.d1 = v; st.n1 = Math.min(st.n1, v - 1); fix2(); fracChanged(); });
      const sl2 = mkSlider(gEx, { label: 'Second fraction: top number', min: 1, max: 1, step: 1, value: 1, onInput: v => { st.n2 = v; fracChanged(); } });
      const sel2 = mkSelect(gEx, 'Second fraction: bottom number', v => { st.d2 = v; st.n2 = Math.min(st.n2, v - 1); fracChanged(); });
      const cutBtns = DENS.map(d => { const b = mkBtn(String(d), () => setD(d)); b.setAttribute('aria-label', `Cut both bars into ${d} equal pieces`); return b; });
      btnRow(gEx, cutBtns, 'Cut each whole into this many equal pieces');
      const trapWrap = h('div', { class: 'ctl toggle' });
      const trapIn = h('input', { type: 'checkbox', id: 'afutrap' });
      trapIn.addEventListener('change', () => { st.trap = trapIn.checked; refresh(); });
      trapWrap.append(trapIn, h('label', { for: 'afutrap' }, 'Show the trap: add the tops and add the bottoms'));
      gEx.append(trapWrap);
      const exOut = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); gEx.append(exOut);

      /* practice controls */
      const prHead = h('p', { class: 'ctl-title', style: 'margin:0' });
      const prTally = h('p', { style: 'margin:0;color:var(--muted)' });
      const prSel = mkSelect(gPr, 'Problem', v => { st.pi = v; resetProb(); refresh(); });
      const prOut = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
      gPr.prepend(prHead, prTally); gPr.append(prOut);
      prSel.sel.replaceChildren(...PR.map((q, i) => h('option', { value: String(i) }, (i + 1) + '. ' + q.label)));

      const resetProb = () => { st.pick = 0; st.solved = false; st.fb = ''; st.wrongTry = false; st.picked = {}; cancel(); st.cutT = 1; };
      resetProb();
      const fix2 = () => {
        const ok2 = DENS.filter(d => lcm(st.d1, d) <= 12);
        if (!ok2.includes(st.d2)) { st.d2 = ok2.find(d => d !== st.d1) || ok2[0]; st.n2 = Math.min(st.n2, st.d2 - 1); }
      };
      const cmpNow = () => cmpTo(st.op, st.n1, st.d1, st.n2, st.d2);
      const fracChanged = () => { st.pred = null; st.predFb = ''; refresh(); };
      const setOp = op => {
        if (op === st.op) return;
        st.op = op;
        if (op === 'sub' && st.n2 * st.d1 > st.n1 * st.d2) { [st.n1, st.d1, st.n2, st.d2] = [st.n2, st.d2, st.n1, st.d1]; }
        if (op === 'add') st.trap = trapIn.checked;
        fracChanged();
      };
      const setD = d => {
        st.D = d; cancel(); st.cutT = 0; draw();
        cancel = animateTo(st, { cutT: 1 }, 500, draw);
        refresh();
      };
      const guess = gz => {
        st.pred = gz;
        const c = cmpNow(), bench = st.op === 'add' ? '1' : '1/2', what = st.op === 'add' ? 'sum' : 'difference';
        st.predFb = gz === 'skip' ? '' : (gz === c ? ok('Right.') : no('Not quite.')) + ` The ${what} is ${lessThan[c]} ${bench}.` + (gz === c ? '' : ' Cut the bars to see why.');
        refresh();
      };
      const setMode = md => { cancel(); st.cutT = 1; st.mode = md; refresh(); };

      /* explore text */
      const exploreText = () => {
        const v = view(), g = geo(v), out = [], sub = v.op === 'sub', A = F(v.n1, v.d1), B = F(v.n2, v.d2), sym = sub ? MINUS : '+';
        const bench = sub ? '1/2' : '1', what = sub ? 'difference' : 'sum';
        out.push(h('p', { style: 'margin:0 0 8px;font-weight:600', html: `${A} ${sym} ${B}` }));
        if (g.bad) { out.push(h('p', { style: 'margin:0', html: no('The take-away bar is longer than the start bar.') + ' Pick a smaller fraction to take away, or pick Add.' })); return out; }
        if (st.pred === null) {
          out.push(h('p', { style: 'margin:0 0 6px', html: `<span class="k">Predict first.</span> Is the ${what} more or less than ${bench}?` }));
          out.push(h('div', { style: 'display:flex;flex-wrap:wrap;gap:8px;margin-bottom:6px' }, [
            mkBtn('Less than ' + bench, () => guess('less')), mkBtn('Exactly ' + bench, () => guess('equal')), mkBtn('More than ' + bench, () => guess('more')),
            mkBtn('Skip', () => guess('skip'), false, { opacity: .75 })]));
        } else if (st.predFb) out.push(h('p', { style: 'margin:0 0 8px', html: st.predFb }));
        if (v.D === 0) {
          out.push(h('p', { style: 'margin:0', html: `${A} has ${v.d1} pieces in a whole and ${B} has ${v.d2}. The pieces are different sizes. Pick a cut size in the panel to cut both bars the same.` }));
        } else if (!g.aligned) {
          const bads = [!g.lined1 && A, !g.lined2 && B].filter(Boolean).join(' and ');
          out.push(h('p', { style: 'margin:0', html: no('The cuts do not line up.') + ` Pieces of size 1/${v.D} cannot make exactly ${bads}, so an edge lands inside a piece. Pick a size that both ${v.d1} and ${v.d2} go into evenly.` }));
        } else {
          const L = lcm(v.d1, v.d2);
          out.push(h('p', { style: 'margin:0 0 8px', html: ok('The cuts line up.') + ` ${A} = ${F(g.k1, v.D)} and ${B} = ${F(g.k2, v.D)}. ` + (v.D === L ? 'No smaller piece size works, so this is the fewest pieces.' : `It works. The pieces of size 1/${L} also work, with fewer pieces to count.`) }));
          if (!v.reveal) out.push(h('p', { style: 'margin:0;color:var(--muted)', html: 'Make your prediction above to see the result.' }));
          else {
            const K = g.K, D = v.D, L2 = [];
            L2.push(kk('Count', `${F(g.k1, D)} ${sym} ${F(g.k2, D)} = ${F(K, D)}`));
            if (K === 0) L2.push('Nothing is left.');
            else {
              if (gcd(K, D) > 1) L2.push(kk('Simplest form', simplest(K, D)));
              if (K > D) L2.push(kk('As a mixed number', mixedWords(K, D)));
              L2.push(sub ? `${K} ${K === 1 ? 'piece' : 'pieces'} vs ${D / 2} pieces (half): the difference is ${lessThan[sign(2 * K - D)]} 1/2.` : `${K} ${K === 1 ? 'piece' : 'pieces'} vs ${D} pieces (one whole): the sum is ${lessThan[sign(K - D)]} 1.`);
            }
            out.push(h('p', { style: 'margin:0', html: L2.join('<br>') }));
          }
        }
        return out;
      };

      /* practice text */
      const practiceText = () => {
        const q = PR[st.pi], out = [], score = Object.values(st.results).filter(Boolean).length;
        if (st.finished) {
          out.push(h('p', { style: 'margin:0 0 8px;font-weight:600', html: `You finished. ${score} of ${PR.length} right on the first try.` }));
          out.push(h('p', { style: 'margin:0 0 10px', html: score === PR.length ? 'Great work. You cut into same-size pieces every time.' : 'Look back at the feedback for the ones you missed. Do each one again with a bar in your head: same-size pieces first, then count.' }));
          out.push(mkBtn('Start again', () => { st.results = {}; st.finished = false; st.pi = 0; prSel.sel.value = '0'; resetProb(); refresh(); }, true));
          return out;
        }
        out.push(h('p', { style: 'margin:0 0 8px;font-weight:600', html: q.q }));
        out.push(h('p', { style: 'margin:0 0 6px;color:var(--muted)', html: q.kind === 'cut' ? 'Each pick shows its cuts on the bars.' : 'Pick the answer. The bars show the cuts once you are right.' }));
        const list = h('div', { style: 'display:flex;flex-direction:column;gap:8px;margin:0 0 8px' }, q.choices.map((ch, i) => {
          const s = st.picked[i], b = h('button', { type: 'button', class: 'choice' + (s ? ' ' + s : ''), html: ch.t, onclick: () => pickAns(i) });
          Object.assign(b.style, { borderRadius: '12px', textAlign: 'left', width: '100%', minHeight: '44px' }); b.disabled = !!s || st.solved; return b;
        }));
        out.push(list);
        if (st.fb) out.push(h('p', { style: 'margin:0 0 10px', html: st.fb }));
        if (st.solved) {
          const last = st.pi === PR.length - 1;
          out.push(mkBtn(last ? 'See my score' : 'Next problem', () => {
            if (last) { st.finished = true; resetProb(); refresh(); return; }
            st.pi++; prSel.sel.value = String(st.pi); resetProb(); refresh();
          }, true));
        }
        return out;
      };
      const pickAns = i => {
        const q = PR[st.pi], ch = q.choices[i], right = i === q.right;
        st.picked[i] = right ? 'right' : 'wrong';
        if (q.kind === 'cut') st.pick = ch.D;
        st.fb = (right ? ok('Right.') + ' ' + ch.why.replace(/^Yes\. /, '') : no('Not quite.') + ' ' + ch.why.replace(/^Not quite\. /, ''));
        if (right) {
          st.solved = true;
          if (st.results[st.pi] === undefined) st.results[st.pi] = !st.wrongTry;
          if (q.kind !== 'cut') { cancel(); st.cutT = 0; cancel = animateTo(st, { cutT: 1 }, 500, draw); }
        } else st.wrongTry = true;
        refresh();
      };

      /* refresh everything that depends on the state */
      const refresh = () => {
        modeBtns.forEach((b, i) => { const on = (i === 0) === (st.mode === 'explore'); b.className = on ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', on); });
        gEx.style.display = st.mode === 'explore' ? 'flex' : 'none';
        gPr.style.display = st.mode === 'practice' ? 'flex' : 'none';
        if (st.mode === 'explore') {
          opBtns.forEach((b, i) => { const on = (i === 0) === (st.op === 'add'); b.className = on ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', on); });
          const sub = st.op === 'sub';
          sl1.lab.textContent = (sub ? 'Start fraction' : 'First fraction') + ': top number';
          sel1.lab.textContent = (sub ? 'Start fraction' : 'First fraction') + ': bottom number';
          sl2.lab.textContent = (sub ? 'Take-away fraction' : 'Second fraction') + ': top number';
          sel2.lab.textContent = (sub ? 'Take-away fraction' : 'Second fraction') + ': bottom number';
          sel1.sel.replaceChildren(...DENS.map(d => h('option', { value: d }, String(d)))); sel1.sel.value = String(st.d1);
          sel2.sel.replaceChildren(...DENS.filter(d => lcm(st.d1, d) <= 12).map(d => h('option', { value: d }, String(d)))); sel2.sel.value = String(st.d2);
          sl1.setMax(st.d1 - 1); sl1.set(st.n1); sl2.setMax(st.d2 - 1); sl2.set(st.n2);
          cutBtns.forEach((b, i) => { const on = DENS[i] === st.D; b.className = on ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', on); });
          trapWrap.style.display = st.op === 'add' ? '' : 'none'; trapIn.checked = st.trap;
          exOut.replaceChildren(...exploreText());
        } else {
          const score = Object.values(st.results).filter(Boolean).length, tried = Object.keys(st.results).length;
          prHead.textContent = 'Practice';
          prTally.textContent = `${score} of ${tried} right so far (${PR.length} problems). Nothing is saved.`;
          prSel.sel.value = String(st.pi);
          prOut.replaceChildren(...practiceText());
        }
        draw();
      };

      /* guided steps */
      const apply = (patch, immediate) => {
        cancel();
        const { mode, op, n1, d1, n2, d2, D, pred, trap } = patch;
        st.mode = mode || 'explore';
        if (op !== undefined) st.op = op;
        if (n1 !== undefined) Object.assign(st, { n1, d1, n2, d2 });
        if (D !== undefined) st.D = D;
        if (pred !== undefined) { st.pred = pred; st.predFb = ''; if (pred && pred !== 'skip') { const c = cmpNow(); st.predFb = ok('Right.') + ` The ${st.op === 'add' ? 'sum' : 'difference'} is ${lessThan[c]} ${st.op === 'add' ? '1' : '1/2'}.`; } }
        if (trap !== undefined) st.trap = trap;
        if (st.D > 0 && !immediate) { st.cutT = 0; cancel = animateTo(st, { cutT: 1 }, 700, draw); } else st.cutT = 1;
        refresh();
      };
      refresh();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
