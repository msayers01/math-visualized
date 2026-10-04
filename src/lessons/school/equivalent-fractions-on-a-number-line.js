/* =====================================================================
   SCHOOL — Equivalent fractions on a number line (Grade 4)
   ===================================================================== */
{
  /* ---------- small helpers ---------- */
  const SANS = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
  const font = (size, weight = 600) => `${weight} ${size}px ${SANS}`;
  const DENS = [2, 3, 4, 6, 8, 12];
  const gcd = (a, b) => { while (b) { const t = a % b; a = b; b = t; } return a; };
  const lcm = (a, b) => a * b / gcd(a, b);
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;
  const isInt = v => Math.abs(v - Math.round(v)) < 1e-9;
  const T = (c, p, s, x, y, { size = 13, color, align = 'center', weight = 600 } = {}) => {
    c.font = font(size, weight); c.textAlign = align; c.textBaseline = 'middle';
    c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(s, x, y);
    c.fillStyle = color || p.pal.text; c.fillText(s, x, y);
  };
  const tw = (c, s, size, weight = 600) => { c.font = font(size, weight); return c.measureText(s).width; };
  const rrect = (c, x, y, w, hh, r) => {
    r = Math.min(r, w / 2, hh / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + hh, r); c.arcTo(x + w, y + hh, x, y + hh, r); c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  const line = (c, x0, y0, x1, y1, color, width = 1.5, dash) => {
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.strokeStyle = color; c.lineWidth = width; c.setLineDash(dash || []); c.lineCap = 'round'; c.stroke(); c.setLineDash([]);
  };
  /* a stacked fraction drawn on the canvas; returns its width */
  const frac = (c, p, x, cy, n, d, size, color, align = 'left') => {
    c.font = font(size, 700);
    const ns = String(n), ds = String(d), w = Math.max(c.measureText(ns).width, c.measureText(ds).width) + 8;
    const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round';
    c.strokeText(ns, x0 + w / 2, cy - size * .62); c.strokeText(ds, x0 + w / 2, cy + size * .62);
    c.fillStyle = color;
    c.fillText(ns, x0 + w / 2, cy - size * .62); c.fillText(ds, x0 + w / 2, cy + size * .62);
    line(c, x0 + 1, cy, x0 + w - 1, cy, color, Math.max(1.6, size * .1));
    return w;
  };
  /* a row made of words and fractions, starting at x */
  const seq = (c, p, x, cy, items, size) => {
    for (const it of items) {
      if (it.f) x += frac(c, p, x, cy, it.f[0], it.f[1], size * 1.1, it.color || p.pal.text) + 5;
      else { T(c, p, it.t, x, cy, { size, align: 'left', color: it.color || p.pal.text, weight: it.weight || 600 }); x += tw(c, it.t, size, it.weight || 600) + 5; }
    }
    return x;
  };

  /* ---------- the fixed content ---------- */
  /* compare pairs: [n, d] against [n, d] */
  const PAIRS = [
    [[3, 4], [5, 6]], [[1, 2], [5, 8]], [[2, 3], [3, 4]],
    [[1, 3], [2, 6]], [[5, 6], [7, 12]], [[3, 4], [5, 8]]
  ];
  const pairText = pr => `${pr[0][0]}/${pr[0][1]} and ${pr[1][0]}/${pr[1][1]}`;
  const PRED = {
    q: 'Strip A has 3 equal parts and 1 is shaded: 1/3. Cut every part in 2, so strip B has 6 equal parts. How many parts of strip B will be shaded?',
    choices: [
      { t: '1 part', why: `${no('Not quite.')} Each shaded third is cut in 2 pieces. So the shaded part becomes 2 pieces, not 1. The shaded length cannot shrink when you cut it.` },
      { t: '2 parts', right: true, why: `${ok('Yes.')} The 1 shaded part is cut into 2 pieces, so 2 parts are shaded. 1 × 2 = 2 and 3 × 2 = 6. So 1/3 = 2/6.` },
      { t: '3 parts', why: `${no('Not quite.')} 3 is the number of parts in strip A. The shaded length is the same, but it is now made of smaller pieces. Look at how long 3 of the 6 parts is: that is half the strip.` },
      { t: '6 parts', why: `${no('Not quite.')} 6 parts is the whole strip B. Only 1 third of the strip is shaded, not all of it.` }
    ]
  };
  /* practice problems: pick (choose a fraction for strip B), place (put a marker on the line), cmp (compare) */
  const PR = [
    { type: 'pick', A: [2, 3], qd: 6,
      q: 'A candy bar has 3 equal pieces. You eat 2 of them: 2/3. Now cut every piece in 2, so the bar has 6 equal pieces. You still ate the same amount. 2/3 = ?/6. How many of the 6 pieces did you eat?',
      choices: [
        { p: 2, q: 6, why: `${no('Not quite.')} You kept the top number. But each piece you ate was cut in 2, so it is 2 pieces now. 2 × 2 = 4, not 2. 2/6 is only a third of the bar.` },
        { p: 4, q: 6, right: true, why: `${ok('Yes.')} Each of the 2 pieces you ate is cut in 2. 2 × 2 = 4 pieces. The bar has 3 × 2 = 6 pieces. So 2/3 = 4/6.` },
        { p: 3, q: 6, why: `${no('Not quite.')} 3/6 is exactly half of the bar, but 2/3 is more than half. Adding 1 to the top does not keep the length. Cutting means you multiply: 2 × 2 = 4.` },
        { p: 6, q: 6, why: `${no('Not quite.')} 6/6 is the whole bar. You ate 2/3, so some of the bar is left.` }
      ] },
    { type: 'place', A: [3, 4], q: 12, target: 9,
      q_: 'A number line goes from 0 to 1. It is cut into 12 equal parts. Where does 3/4 go? Move the marker to 3/4, then press Check.' },
    { type: 'pick', A: [1, 2],
      q: 'Strip A shows 1/2. Which of these fractions is the same length as 1/2?',
      choices: [
        { p: 1, q: 4, why: `${no('Not quite.')} 1/4 is only half as long as 1/2. Four equal parts are smaller than two equal parts.` },
        { p: 2, q: 6, why: `${no('Not quite.')} 2/6 is the same as 1/3. Half of 6 parts is 3 parts, not 2.` },
        { p: 3, q: 8, why: `${no('Not quite.')} 3/8 is a little shorter than half. Half of 8 parts is 4 parts, and 3 is one part short.` },
        { p: 4, q: 8, right: true, why: `${ok('Yes.')} Half of 8 equal parts is 4 parts. Cut each half of strip A into 4 pieces: 1 × 4 = 4 and 2 × 4 = 8. So 1/2 = 4/8.` }
      ] },
    { type: 'cmp', pair: 2,
      q: 'Jo ate 2/3 of a small pizza. Ben ate 3/4 of a pizza of the same size. Who ate more?',
      choices: [
        { t: 'Jo ate more (2/3)', why: `${no('Not quite.')} Thirds are bigger pieces than fourths, so it is a common guess. But Ben ate 3 pieces and Jo only 2. Cut both into 12 equal parts: 2/3 = 8/12 and 3/4 = 9/12. 9 is more than 8.` },
        { t: 'Ben ate more (3/4)', right: true, why: `${ok('Yes.')} Cut both into 12 equal parts. 2/3 = 8/12 (2 × 4 and 3 × 4). 3/4 = 9/12 (3 × 3 and 4 × 3). 9 parts is more than 8 parts, so 3/4 is longer.` },
        { t: 'They ate the same', why: `${no('Not quite.')} They are only equal if they use the same number of equal parts. In twelfths, Jo ate 8/12 and Ben ate 9/12. Ben ate 1 twelfth more.` }
      ] },
    { type: 'pick', A: [6, 8], qd: 4,
      q: 'You ate 6 of 8 equal slices of a pizza: 6/8. Now join the slices in pairs, so the pizza has 4 equal parts. You still ate the same amount. 6/8 = ?/4. How many of the 4 parts did you eat?',
      choices: [
        { p: 1, q: 4, why: `${no('Not quite.')} 1/4 is too short. Every 2 slices join to make 1 part. You ate 6 slices, so that is 3 pairs.` },
        { p: 2, q: 4, why: `${no('Not quite.')} 2/4 is half the pizza. You ate 6 of 8 slices, and half of 8 slices is only 4.` },
        { p: 3, q: 4, right: true, why: `${ok('Yes.')} Join the slices in pairs. 6 slices make 6 ÷ 2 = 3 pairs. 8 slices make 8 ÷ 2 = 4 parts. So 6/8 = 3/4.` },
        { p: 4, q: 4, why: `${no('Not quite.')} 4/4 is the whole pizza. You ate 6/8, which is 2 slices short of the whole pizza.` }
      ] },
    { type: 'cmp', pair: 3,
      q: 'Mia has 1/3 of a ribbon. Sam has 2/6 of a ribbon of the same length. Who has more ribbon?',
      choices: [
        { t: 'Mia has more (1/3)', why: `${no('Not quite.')} Thirds are bigger pieces, but Sam has 2 of his small pieces. Cut each third in 2: 1/3 = 2/6 (1 × 2 and 3 × 2). Neither is longer.` },
        { t: 'Sam has more (2/6)', why: `${no('Not quite.')} 2 is more than 1, but the pieces are different sizes. A sixth is half as long as a third. So 2 sixths = 1 third: 2/6 = 1/3.` },
        { t: 'They have the same', right: true, why: `${ok('Yes.')} Cut each third in 2: 1 × 2 = 2 and 3 × 2 = 6. So 1/3 = 2/6. The two lengths match, so they are equal.` }
      ] },
    { type: 'place', A: [2, 3], q: 6, target: 4,
      q_: 'A number line goes from 0 to 1. It is cut into 6 equal parts. Where does 2/3 go? Move the marker to 2/3, then press Check.' }
  ];

  /* ---------- the scene ---------- */
  register({
    id: 'equivalent-fractions-on-a-number-line', level: 'school',
    title: 'Equivalent fractions on a number line',
    blurb: 'Cut fraction strips into more equal parts and see one length get two names, then compare fractions on a number line.',
    thumb(c, p) {
      const pal = p.pal, W = p.w, H = p.h, x0 = W * .1, x1 = W * .9, X = t => x0 + t * (x1 - x0), fs = Math.max(9, H * .085);
      const strip = (top, hh, d, sh, col) => {
        c.fillStyle = alpha(col, .12); c.fillRect(x0, top, x1 - x0, hh);
        c.fillStyle = alpha(col, .55); c.fillRect(x0, top, X(sh / d) - x0, hh);
        for (let i = 1; i < d; i++) line(c, X(i / d), top, X(i / d), top + hh, col, 1.6);
        c.strokeStyle = col; c.lineWidth = 2; c.strokeRect(x0, top, x1 - x0, hh);
      };
      strip(H * .12, H * .17, 2, 1, pal.blue);
      strip(H * .34, H * .17, 4, 2, pal.green);
      const ly = H * .76;
      line(c, x0, ly, x1, ly, pal.muted, 2.5);
      for (const i of [0, 4]) line(c, X(i / 4), ly - 6, X(i / 4), ly + 6, pal.text, 2);
      line(c, X(.5), H * .12, X(.5), ly, pal.yellow, 2, [4, 3]);
      c.beginPath(); c.arc(X(.5), ly, 6, 0, Math.PI * 2); c.fillStyle = pal.yellow; c.fill(); c.strokeStyle = pal.brass; c.lineWidth = 2.5; c.stroke();
      c.font = font(fs, 700); c.textBaseline = 'middle'; c.fillStyle = pal.text;
      c.textAlign = 'center'; c.fillText('1/2 = 2/4', X(.5), H * .92);
      c.fillStyle = pal.muted; c.textAlign = 'left'; c.fillText('0', x0, ly - H * .1); c.textAlign = 'right'; c.fillText('1', x1, ly - H * .1);
    },
    hook: 'You ate 2 of the 4 slices of a pizza. Your friend ate 1 of the 2 slices of a pizza of the same size. Who ate more?',
    steps: [
      { title: 'Cut it again',
        text: String.raw`<p>Strip A is cut into 2 equal parts. 1 part is shaded: 1/2.</p><p>Now cut every part in 2. Strip B has 4 equal parts, and 2 are shaded: 2/4.</p><p>The shaded length did not change. So 1/2 and 2/4 are <b>equivalent fractions</b>. That means the same amount with a different name.</p>`,
        set: { mode: 'explore', a: 2, n: 1, b: 4 } },
      { title: 'Predict, then see',
        text: String.raw`<p>Strip A has 3 equal parts. 1 part is shaded: 1/3.</p><p>Strip B cuts every part in 2, so it has 6 parts. How many parts of B will be shaded?</p><p>Pick an answer in the side panel first. Then the strip shows you.</p>`,
        set: { mode: 'predict', a: 3, n: 1, b: 6 } },
      { title: 'The same spot on the line',
        text: String.raw`<p>A <b>number line</b> puts fractions in order from 0 to 1. Here 3/4 sits 3 of 4 steps from 0.</p><p>Cut each fourth in 3 pieces. 3 × 3 = 9 and 4 × 3 = 12. So 3/4 = 9/12.</p><p>Both names land on the same spot. A new name never moves the spot. Try other buttons.</p>`,
        set: { mode: 'explore', a: 4, n: 3, b: 12 } },
      { title: 'Which is bigger?',
        text: String.raw`<p>Compare 3/4 and 5/6. The parts are different sizes, so it is hard to see.</p><p>Cut both strips into 12 equal parts. 3/4 = 9/12 and 5/6 = 10/12.</p><p>Now the parts are the same size. 10 parts is more than 9 parts, so 5/6 is bigger. Try the other pairs.</p>`,
        set: { mode: 'compare', pi: 0, cut: 1 } }
    ],
    formal: String.raw`
      <h3>Equivalent fractions</h3>
      <p>Two fractions are <em>equivalent</em> when they name the same amount. They take up the same length on a fraction strip and sit on the same spot on the number line. For example,
      \[ \frac{1}{2} = \frac{2}{4} = \frac{3}{6} = \frac{4}{8}. \]
      The top number counts the shaded parts. The bottom number says how many equal parts make the whole. Both numbers can change while the amount stays the same.</p>
      <h3>Why cutting does not change the amount</h3>
      <p>Start with \(\frac{2}{3}\) of a strip. Cut every part in 2. Each shaded part becomes 2 shaded pieces, so the shaded count is \(2 \times 2 = 4\). The whole strip also has twice as many parts: \(3 \times 2 = 6\). You cut the same shaded length into smaller pieces, so its length did not change. So
      \[ \frac{2}{3} = \frac{2 \times 2}{3 \times 2} = \frac{4}{6}. \]
      If you cut every part in 3 instead, you multiply the top and the bottom by 3. The rule is: multiply (or divide) the top and the bottom by the same number.</p>
      <h3>Going the other way</h3>
      <p>You can also join pieces. In \(\frac{6}{8}\), join the pieces in pairs. 6 pieces make 3 pairs and 8 pieces make 4 pairs. So \(\frac{6}{8} = \frac{6 \div 2}{8 \div 2} = \frac{3}{4}\). You can only join pieces if they group evenly. For \(\frac{3}{8}\), 3 pieces do not make pairs, so you cannot write it with fourths.</p>
      <h3>The number line</h3>
      <p>On a number line from 0 to 1, cut the space into \(d\) equal steps and count \(n\) of them. That is the spot for \(\frac{n}{d}\). A different cut gives a different set of tick marks, but equivalent fractions always land on the same spot. \(\frac{3}{4}\) and \(\frac{9}{12}\) share one point.</p>
      <h3>Comparing fractions</h3>
      <p>Pieces of different sizes are hard to compare. Cut both strips so they have the same number of parts. Then the pieces match, and you only compare the counts. To compare \(\frac{3}{4}\) and \(\frac{5}{6}\), use twelfths:
      \[ \frac{3}{4} = \frac{9}{12} \qquad \frac{5}{6} = \frac{10}{12}. \]
      Since 10 is more than 9, \(\frac{5}{6}\) is bigger.</p>
      <h3>Two traps</h3>
      <p>Adding the same number to the top and the bottom does not keep the amount. \(\frac{1}{2}\) is not equal to \(\frac{2}{3}\), even though \(1 + 1 = 2\) and \(2 + 1 = 3\). A bigger bottom number does not mean a bigger fraction either. Sixths are smaller pieces than thirds, so \(\frac{2}{6}\) is the same as \(\frac{1}{3}\).</p>`,
    check: [
      { q: 'Maya says, "1/2 and 4/8 are different amounts, because the numbers are different." Two bars are the same size. One is cut into 2 equal parts with 1 part shaded. The other is cut into 8 equal parts with 4 parts shaded. Which statement is true?',
        choices: [
          '4/8 is bigger, because 4 and 8 are bigger numbers than 1 and 2.',
          'They are equal. Both shade half of the bar. Each half is cut into 4 smaller pieces.',
          '4/8 is smaller, because eighths are smaller pieces than halves.',
          'They are equal only when the top numbers match.'],
        answer: 1,
        why: 'The shaded part of the second bar is 4 of 8 equal pieces. Four pieces of an eighth fill exactly half of the bar. So 1/2 = 4/8: the same length with a different name. The first answer compares only the size of the numbers. The third answer is half right, because eighths are smaller, but there are more of them. The last answer is wrong: equivalent fractions usually have different top numbers.',
        hint: 'Draw two bars of the same size. Shade 4 of 8 parts. How much of the bar is shaded?' },
      { q: 'Sam and Mia have two pizzas of the same size. Sam cuts his pizza into 8 equal slices and eats 6 slices. Mia cuts her pizza into 4 equal slices and eats 2 slices. Who eats more pizza, and by how much?',
        choices: [
          'Mia, by 1/4 of a pizza',
          'They eat the same amount',
          'Sam, by 4 slices',
          'Sam, by 1/4 of a pizza'],
        answer: 3,
        why: 'Write both in eighths. Mia ate 2/4 = 4/8 (2 × 2 and 4 × 2). Sam ate 6/8. Now the slices are the same size: 6 slices is 2 slices more than 4 slices. That is 2/8 of a pizza, which equals 1/4 (join the eighths in pairs). The answer "4 slices" subtracts 6 − 2, but Sam and Mia cut different slice sizes. The answer "Mia" uses the idea that bigger slices mean more pizza, but she ate fewer total.',
        hint: 'Cut Mia\'s slices in half so both pizzas have 8 equal slices. Then compare the counts.' },
      { q: 'Leo says: "2/3 = 3/4, because I added 1 to the top (2 + 1 = 3) and I added 1 to the bottom (3 + 1 = 4)." What is wrong with Leo\'s reasoning?',
        choices: [
          'Adding to the top and the bottom changes the amount. To keep it, multiply or divide both by the same number. 2/3 = 8/12 and 3/4 = 9/12, so they are different.',
          'Nothing is wrong. He did the same thing to the top and the bottom.',
          'He should have subtracted 1 from both numbers instead.',
          'The bottom number must stay the same, and only the top number may change.'],
        answer: 0,
        why: 'Cutting makes more pieces, and each shaded piece splits too, so both numbers get multiplied. Adding does not match any cut. Check with twelfths: 2/3 = 8/12 (2 × 4 and 3 × 4), and 3/4 = 9/12 (3 × 3 and 4 × 3). 8/12 and 9/12 are different lengths, so 2/3 is not equal to 3/4. Subtracting has the same problem, and the bottom number does change when you cut.',
        hint: 'Write both fractions as twelfths. Are the tops the same?' }
    ],
    links: { related: ['ratios-and-equivalent-ratios', 'area-by-decomposition', 'adding-fractions-with-unlike-denominators', 'decimals-and-place-value', 'multiplying-with-area-models'] },

    mount({ stage, controls: C }) {
      const P = new Plane(stage, { span: 5 });
      const cvEl = P.canvas;
      if (P.coordEl) P.coordEl.style.display = 'none';
      cvEl.tabIndex = 0;
      cvEl.setAttribute('role', 'img');
      cvEl.setAttribute('aria-label', 'Two fraction strips over a number line from 0 to 1. Use the left and right arrow keys to change how many parts are shaded.');
      const st = { mode: 'explore', a: 2, n: 1, b: 4, rv: 1, pair: 0, cut: false, pred: { done: false, ghost: null },
        pi: 0, solved: false, wrongN: 0, picks: {}, ghost: null, mk: 0, fb: '', end: false };
      const tally = { done: 0, right: 0 };
      let cancel = () => {};

      /* ---------- what the canvas shows ---------- */
      const eqVM = () => {
        if (st.mode === 'explore') {
          const { a, n, b } = st, m = n * b / a, land = isInt(m);
          return { A: [n, a], B: { d: b, sh: m, lab: land ? [Math.round(m), b] : null }, ta: a, tb: b, mk: n / a, mkLbl: land ? [Math.round(m), b] : null, tg: n / a, tgLbl: [n, a], hint: land ? '' : 'The shaded end is inside a part of B' };
        }
        if (st.mode === 'predict') {
          const { a, n, b } = st, done = st.pred.done, gh = st.pred.ghost, sh = done ? n * b / a : gh;
          return { A: [n, a], B: { d: b, sh, lab: [sh == null ? '?' : sh, b] }, ta: a, tb: b, mk: sh == null ? null : sh / b, mkLbl: sh == null ? null : [sh, b], tg: done || gh != null ? n / a : null, tgLbl: done ? [n, a] : null, hint: '' };
        }
        const pr = PR[st.pi];
        if (pr.type === 'place') {
          const [n, d] = pr.A, k = st.mk;
          return { A: [n, d], B: { d: pr.q, sh: k, lab: [k, pr.q] }, ta: d, tb: pr.q, mk: k / pr.q, mkLbl: [k, pr.q], tg: st.solved ? n / d : null, tgLbl: st.solved ? [n, d] : null, hint: '', handle: !st.solved };
        }
        const [n, d] = pr.A, gh = st.ghost, right = pr.choices.find(c => c.right);
        if (st.solved) return { A: [n, d], B: { d: right.q, sh: right.p, lab: [right.p, right.q] }, ta: d, tb: right.q, mk: n / d, mkLbl: [right.p, right.q], tg: n / d, tgLbl: [n, d], hint: '' };
        if (gh) return { A: [n, d], B: { d: gh.q, sh: gh.p, lab: [gh.p, gh.q] }, ta: d, tb: gh.q, mk: gh.p / gh.q, mkLbl: [gh.p, gh.q], tg: n / d, tgLbl: null, hint: '' };
        if (pr.qd) return { A: [n, d], B: { d: pr.qd, sh: null, lab: ['?', pr.qd] }, ta: d, tb: pr.qd, mk: null, mkLbl: null, tg: null, tgLbl: null, hint: '' };
        return { A: [n, d], B: null, ta: d, tb: 0, mk: null, mkLbl: null, tg: null, tgLbl: null, hint: '' };
      };

      /* ---------- layout (pixel space) ---------- */
      const lay = extra => {
        const W = P.w || 400, H = P.h || 400, fs = clamp(W * .04, 13, 19), pad = clamp(W * .07, 20, 46), capH = fs * 2.6;
        const g = { W, H, fs, pad, x0: pad, x1: W - pad, capH };
        const sh = clamp((H - capH * 3 - 110 - (extra || 0)) / 2, 30, 74);
        let y = 8;
        g.capA = y + capH / 2; y += capH + 2; g.aT = y; g.aB = y + sh; y += sh + 12;
        g.capB = y + capH / 2; y += capH + 2; g.bT = y; g.bB = y + sh; y += sh + 12;
        g.topLbl = y + capH / 2; y += capH + 12; g.lineY = y; y += 12;
        g.botLbl = y + capH / 2; y += capH + 4; g.vy = y + (extra || 0) / 2; g.end = y + (extra || 0);
        g.dy = Math.max(0, (H - g.end) / 2 - 4);
        return g;
      };
      const X = (g, t) => g.x0 + t * (g.x1 - g.x0);

      const drawStrip = (c, p, g, top, bot, d, sh, col, o = {}) => {
        const x0 = g.x0, x1 = g.x1, rv = o.rv == null ? 1 : o.rv;
        c.save(); rrect(c, x0, top, x1 - x0, bot - top, 6); c.clip();
        c.fillStyle = alpha(col, .1); c.fillRect(x0, top, x1 - x0, bot - top);
        if (sh != null && sh > 0) { c.fillStyle = alpha(col, .5); c.fillRect(x0, top, X(g, clamp(sh / d, 0, 1)) - x0, bot - top); }
        if (o.cutL) for (let i = 1; i < o.cutL; i++) if (i * d % o.cutL) line(c, X(g, i / o.cutL), top, X(g, i / o.cutL), bot, alpha(col, .45), 1.2);
        for (let i = 1; i < d; i++) line(c, X(g, i / d), top, X(g, i / d), top + (bot - top) * rv, col, 2.2);
        c.restore();
        rrect(c, x0, top, x1 - x0, bot - top, 6); c.strokeStyle = col; c.lineWidth = 2.6; c.stroke();
      };
      const drawLine = (c, p, g, o) => {
        const pal = p.pal, y = g.lineY;
        line(c, g.x0, y, g.x1, y, pal.muted, 3);
        if (o.ta) for (let i = 0; i <= o.ta; i++) line(c, X(g, i / o.ta), y, X(g, i / o.ta), y - 10, pal.blue, 2);
        if (o.tb) for (let i = 0; i <= o.tb; i++) line(c, X(g, i / o.tb), y, X(g, i / o.tb), y + 10, pal.green, 2);
        line(c, g.x0, y - 15, g.x0, y + 15, pal.text, 2.6); line(c, g.x1, y - 15, g.x1, y + 15, pal.text, 2.6);
      };
      const endLabels = (c, p, g, marks) => {
        const near = x => marks.some(m => Math.abs(m - x) < g.fs * 1.9);
        if (!near(g.x0)) T(c, p, '0', g.x0, g.botLbl, { size: g.fs * 1.15, weight: 700 });
        if (!near(g.x1)) T(c, p, '1', g.x1, g.botLbl, { size: g.fs * 1.15, weight: 700 });
      };
      const dot = (c, p, x, y, r, handle) => {
        c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = p.pal.yellow; c.fill();
        c.strokeStyle = p.pal.brass; c.lineWidth = handle ? 3.4 : 2.4; c.stroke();
      };
      const lblX = (g, x, w) => clamp(x, g.x0 - 6 + w / 2, g.x1 + 6 - w / 2);

      const drawEqual = (c, p, g) => {
        const vm = eqVM(), pal = p.pal, fs = g.fs, rv = st.mode === 'practice' ? 1 : st.rv;
        /* captions */
        const [an, ad] = vm.A;
        seq(c, p, g.x0, g.capA, [{ t: 'Strip A', color: pal.blue, weight: 700 }, { f: [an, ad], color: pal.blue }, { t: `${an} of ${ad} equal parts shaded`, color: pal.muted }], fs);
        if (vm.B) {
          const items = [{ t: 'Strip B', color: pal.green, weight: 700 }];
          if (vm.B.lab) items.push({ f: vm.B.lab, color: pal.green }, { t: `${vm.B.lab[0]} of ${vm.B.d} equal parts shaded`, color: pal.muted });
          else items.push({ t: `${vm.B.d} equal parts. The shaded end is inside a part`, color: pal.muted });
          seq(c, p, g.x0, g.capB, items, fs);
        } else T(c, p, 'Strip B: pick an answer to see its strip', g.x0, g.capB, { size: fs, align: 'left', color: pal.muted });
        drawStrip(c, p, g, g.aT, g.aB, ad, an, pal.blue);
        if (vm.B) drawStrip(c, p, g, g.bT, g.bB, vm.B.d, vm.B.sh, pal.green, { rv });
        else {
          rrect(c, g.x0, g.bT, g.x1 - g.x0, g.bB - g.bT, 6); c.setLineDash([6, 5]); c.strokeStyle = pal.muted; c.lineWidth = 2; c.stroke(); c.setLineDash([]);
        }
        drawLine(c, p, g, { ta: vm.ta, tb: vm.tb });
        const marks = [];
        if (vm.tg != null) {
          const x = X(g, vm.tg); line(c, x, g.aT - 4, x, g.lineY, alpha(pal.yellow, .95), 2.4, [5, 4]);
          if (vm.tgLbl) { const w = frac(c, p, -999, -999, vm.tgLbl[0], vm.tgLbl[1], fs * 1.1, pal.blue); frac(c, p, lblX(g, x, w), g.topLbl, vm.tgLbl[0], vm.tgLbl[1], fs * 1.1, pal.blue, 'center'); }
          marks.push(x);
        }
        if (vm.mk != null) {
          const x = X(g, vm.mk); dot(c, p, x, g.lineY, 9, vm.handle);
          if (vm.mkLbl) { const w = frac(c, p, -999, -999, vm.mkLbl[0], vm.mkLbl[1], fs * 1.1, pal.green); frac(c, p, lblX(g, x, w), g.botLbl, vm.mkLbl[0], vm.mkLbl[1], fs * 1.1, pal.green, 'center'); }
          marks.push(x);
        } else if (vm.tg != null) { dot(c, p, X(g, vm.tg), g.lineY, 9); }
        endLabels(c, p, g, marks);
        if (vm.hint) T(c, p, vm.hint, g.W / 2, g.vy - 4, { size: fs, color: pal.muted });
      };

      const drawCompare = (c, p, g) => {
        const pal = p.pal, fs = g.fs, pr = st.mode === 'practice' ? PAIRS[PR[st.pi].pair] : PAIRS[st.pair];
        const cut = st.mode === 'practice' ? st.solved : st.cut;
        const [[n1, d1], [n2, d2]] = pr, L = lcm(d1, d2), v1 = n1 / d1, v2 = n2 / d2;
        const cap = (cy, n, d, col, name) => {
          const items = [{ t: name, color: col, weight: 700 }, { f: [n, d], color: col }];
          if (cut) items.push({ t: '=', color: pal.text }, { f: [n * L / d, L], color: col }, { t: `${n * L / d} of ${L} equal parts`, color: pal.muted });
          else items.push({ t: `${n} of ${d} equal parts`, color: pal.muted });
          seq(c, p, g.x0, cy, items, fs);
        };
        cap(g.capA, n1, d1, pal.blue, 'First'); cap(g.capB, n2, d2, pal.green, 'Second');
        drawStrip(c, p, g, g.aT, g.aB, d1, n1, pal.blue, { cutL: cut ? L : 0 });
        drawStrip(c, p, g, g.bT, g.bB, d2, n2, pal.green, { cutL: cut ? L : 0 });
        drawLine(c, p, g, { ta: d1, tb: d2 });
        const x1 = X(g, v1), x2 = X(g, v2), same = Math.abs(v1 - v2) < 1e-9;
        line(c, x1, g.aT - 4, x1, g.lineY, alpha(pal.blue, .8), 2, [5, 4]); line(c, x2, g.bT - 4, x2, g.lineY, alpha(pal.green, .8), 2, [5, 4]);
        if (same) { c.beginPath(); c.arc(x1, g.lineY, 12, 0, Math.PI * 2); c.strokeStyle = pal.yellow; c.lineWidth = 3; c.stroke(); }
        dot(c, p, x1, g.lineY, 7); dot(c, p, x2, g.lineY, 7);
        const lw = frac(c, p, -999, -999, n1, d1, fs * 1.1, pal.blue);
        frac(c, p, lblX(g, x1, lw), g.topLbl, n1, d1, fs * 1.1, pal.blue, 'center');
        frac(c, p, lblX(g, x2, lw), g.botLbl, n2, d2, fs * 1.1, pal.green, 'center');
        endLabels(c, p, g, [x1, x2]);
        if (cut) {
          const s = same ? `${n1}/${d1} and ${n2}/${d2} are equal` : v1 > v2 ? `${n1}/${d1} is bigger than ${n2}/${d2}` : `${n2}/${d2} is bigger than ${n1}/${d1}`;
          T(c, p, s, g.W / 2, g.vy, { size: fs * 1.1, weight: 700 });
        } else T(c, p, 'The parts are different sizes. Cut both to compare.', g.W / 2, g.vy, { size: fs, color: pal.muted });
      };

      P.onDraw = (c, p) => {
        const cmp = st.mode === 'compare' || (st.mode === 'practice' && PR[st.pi].type === 'cmp');
        const g = lay(cmp ? 34 : 0);
        c.save(); c.translate(0, g.dy);
        if (cmp) drawCompare(c, p, g); else drawEqual(c, p, g);
        c.restore();
      };
      const draw = () => P.draw();

      /* ---------- the marker: drag, keys and buttons ---------- */
      const canAdjust = () => st.mode === 'explore' || (st.mode === 'practice' && PR[st.pi].type === 'place' && !st.solved);
      const levels = () => st.mode === 'explore' ? st.a : PR[st.pi].q;
      const setLevel = k => {
        k = clamp(Math.round(k), 0, levels());
        if (st.mode === 'explore') { st.n = k; render(); draw(); } else { st.mk = k; st.fb = ''; render(); draw(); }
      };
      const cur = () => st.mode === 'explore' ? st.n : st.mk;
      const fromPx = px => { const g = lay(), t = (px - g.x0) / (g.x1 - g.x0); return t * levels(); };
      let drag = false;
      const ptr = e => { const r = cvEl.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      const inBand = (py) => { const g = lay(), y = py - g.dy; return y > g.aT - 14 && y < g.lineY + 44; };
      cvEl.addEventListener('pointerdown', e => {
        const [px, py] = ptr(e);
        if (!canAdjust() || !inBand(py)) return;
        drag = true; cvEl.setPointerCapture(e.pointerId); e.preventDefault(); cancel(); setLevel(fromPx(px));
      });
      cvEl.addEventListener('pointermove', e => {
        const [px, py] = ptr(e);
        if (drag) setLevel(fromPx(px)); else cvEl.style.cursor = canAdjust() && inBand(py) ? 'grab' : 'default';
      });
      const endDrag = () => { drag = false; };
      cvEl.addEventListener('pointerup', endDrag); cvEl.addEventListener('pointercancel', endDrag);
      cvEl.addEventListener('keydown', e => {
        if (!canAdjust()) return;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setLevel(cur() - 1); }
        else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setLevel(cur() + 1); }
      });

      /* ---------- the side panel ---------- */
      const probe = C.readout(), host = probe.parentElement; probe.remove();
      const btn = (label, onClick, primary, extra = '') => {
        const b = h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
        b.style.cssText = 'padding:8px 14px;min-height:44px;min-width:44px;font-size:.95rem;' + extra; return b;
      };
      const row = (...kids) => h('div', { style: 'display:flex;flex-wrap:wrap;gap:8px;align-items:center' }, ...kids);
      const lab = t => h('p', { class: 'hint', style: 'margin:0 0 6px' }, t);
      const group = style => { const g = h('div', { style: 'display:flex;flex-direction:column;gap:14px;flex:none;' + (style || '') }); host.append(g); return g; };
      const choiceList = items => h('div', { style: 'display:flex;flex-direction:column;gap:8px;margin:10px 0 4px' }, items.map(it => {
        const b = h('button', { type: 'button', class: 'choice' + (it.state ? ' ' + it.state : ''), html: it.label, onclick: it.onClick });
        Object.assign(b.style, { borderRadius: '12px', textAlign: 'left', width: '100%', minHeight: '44px' }); b.disabled = !!it.state; return b;
      }));
      const para = (html, style = '') => h('p', { html, style: 'margin:0 0 8px;' + style });

      C.title('Explore');
      const modeRow = row(); host.append(modeRow);
      const modeBtns = [['explore', 'Equal strips'], ['compare', 'Compare two']].map(([id, name]) => { const b = btn(name, () => { cancel(); st.mode = id; st.rv = 1; st.pred = { done: false, ghost: null }; sync(); }); modeRow.append(b); return [id, b]; });

      const gEq = group();
      const aBtns = DENS.map(d => btn(String(d), () => { cancel(); st.a = d; st.n = Math.min(st.n, d); sync(); }));
      const bBtns = DENS.map(d => btn(String(d), () => { cancel(); st.b = d; st.rv = 0; sync(); cancel = animateTo(st, { rv: 1 }, 600, draw); }));
      const nOut = h('output', { style: 'min-width:5.5em;text-align:center;font-weight:700' });
      gEq.append(
        h('div', {}, lab('Strip A: cut into this many equal parts'), row(...aBtns)),
        h('div', {}, lab('Strip A: how many parts are shaded?'), row(btn('−', () => { cancel(); setLevel(st.n - 1); }), nOut, btn('+', () => { cancel(); setLevel(st.n + 1); }))),
        h('div', {}, lab('Strip B: cut the same length into this many parts'), row(...bBtns)));
      const gCmp = group();
      const pairSel = h('select', { id: 'ef-pair' }, PAIRS.map((pr, i) => h('option', { value: String(i) }, pairText(pr))));
      pairSel.addEventListener('change', () => { cancel(); st.pair = +pairSel.value; st.cut = false; sync(); });
      const cutBtn = btn('', () => { cancel(); st.cut = !st.cut; sync(); }, true);
      gCmp.append(h('div', { class: 'ctl select' }, h('label', { for: 'ef-pair' }, 'Compare these two fractions'), pairSel), row(cutBtn));
      const ro = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); host.append(ro);
      C.title('Practice');
      const gPr = group();
      gPr.setAttribute('aria-live', 'polite');

      /* ---------- readouts ---------- */
      const exploreText = () => {
        const { a, n, b } = st, m = n * b / a, out = [];
        if (isInt(m)) {
          const M = Math.round(m);
          out.push(`<b>${n}/${a} = ${M}/${b}</b>`);
          if (n === 0) out.push('Nothing is shaded, so both strips show 0.');
          else if (a === b) out.push('Both strips are cut the same way.');
          else if (b % a === 0) { const k = b / a; out.push(`Cut each part of A into ${k} pieces. Top: ${n} × ${k} = ${M}. Bottom: ${a} × ${k} = ${b}.`); }
          else if (a % b === 0 && n % (a / b) === 0) { const k = a / b; out.push(`Join every ${k} parts of A into 1 part. Top: ${n} ÷ ${k} = ${M}. Bottom: ${a} ÷ ${k} = ${b}.`); }
          else out.push('The parts are different sizes, but the shaded length is the same.');
          out.push(`Same spot on the number line: ${n} of the ${a} steps from 0.`);
        } else {
          const f = Math.floor(m);
          out.push(`<b>${n}/${a}</b> ends between ${f} and ${f + 1} parts of strip B, inside a part.`);
          out.push(`No name with ${b} equal parts fits. Pick another number of parts for B.`);
        }
        return out;
      };
      const predictUI = () => {
        const out = [para(`<b>${PRED.q}</b>`), para(st.pred.done ? '' : `${kk('Predict')} Pick one. The strip will show your pick.`)];
        out.push(choiceList(PRED.choices.map((ch, i) => ({ label: ch.t, state: st.picks['p' + i], onClick: () => {
          const m = [1, 2, 3, 6][i];
          st.picks['p' + i] = ch.right ? 'right' : 'wrong'; st.fb = ch.why;
          if (ch.right) st.pred.done = true; st.pred.ghost = m; render(); draw();
        } }))));
        out.push(h('p', { style: 'margin:6px 0 10px;', html: st.fb }));
        if (st.pred.done) out.push(btn('Try your own numbers', () => { cancel(); Object.assign(st, { mode: 'explore', pred: { done: false, ghost: null } }); sync(); }, true));
        return out;
      };
      const compareText = () => {
        const [[n1, d1], [n2, d2]] = PAIRS[st.pair], L = lcm(d1, d2), a = n1 * L / d1, b = n2 * L / d2;
        if (!st.cut) return [`<b>${n1}/${d1}</b> and <b>${n2}/${d2}</b> use parts of different sizes.`, `Press the button to cut both strips into ${L} equal parts.`];
        const r = a === b ? `${a} equals ${b}, so they are equal.` : a > b ? `${a} is more than ${b}, so ${n1}/${d1} is bigger.` : `${b} is more than ${a}, so ${n2}/${d2} is bigger.`;
        return [`<b>${n1}/${d1} = ${a}/${L}</b> (${n1} × ${L / d1} and ${d1} × ${L / d1})`, `<b>${n2}/${d2} = ${b}/${L}</b> (${n2} × ${L / d2} and ${d2} × ${L / d2})`, `Now the parts match. ${r}`];
      };
      const renderRo = () => {
        if (st.mode === 'predict') return predictUI();
        if (st.mode === 'compare') return compareText().map(s => para(s));
        return [...exploreText().map(s => para(s)), para('Drag along the strip or the line, or use the buttons. Equivalent fractions name the same amount.', 'color:var(--muted)')];
      };

      /* ---------- practice ---------- */
      const startPractice = i => {
        cancel(); Object.assign(st, { mode: 'practice', pi: i, solved: false, wrongN: 0, picks: {}, ghost: null, mk: 0, fb: '', end: false, pred: { done: false, ghost: null } });
        sync();
      };
      const solve = () => { if (st.solved) return; st.solved = true; tally.done++; if (st.wrongN === 0) tally.right++; };
      const pickChoice = i => {
        const pr = PR[st.pi], ch = pr.choices[i];
        st.picks['c' + i] = ch.right ? 'right' : 'wrong'; st.fb = ch.why;
        if (ch.right) { solve(); st.ghost = null; } else { st.wrongN++; if (pr.type === 'pick') st.ghost = { p: ch.p, q: ch.q }; }
        render(); draw();
      };
      const check = () => {
        const pr = PR[st.pi], k = st.mk, [n, d] = pr.A, f = pr.q / d;
        if (k === pr.target) { st.fb = `${ok('Yes.')} ${n}/${d} = ${k}/${pr.q}. Each part of strip A is cut into ${f} pieces. So ${n} × ${f} = ${k}.`; solve(); }
        else {
          st.wrongN++;
          const side = k < pr.target ? 'to the right' : 'to the left';
          let s = `${no('Not yet.')} The marker is at ${k}/${pr.q}, which is ${k} of the ${pr.q} steps. Move it ${side}. `;
          if (k === n) s += `The number ${n} is the top of ${n}/${d}, but this line has ${pr.q} parts, not ${d}. `;
          s += `Each part of A is cut into ${f} pieces, so count ${n} × ${f} pieces from 0.`;
          st.fb = s;
        }
        render(); draw();
      };
      const renderPractice = () => {
        const out = [];
        if (st.mode !== 'practice') {
          out.push(para(`${PR.length} problems. Pick an answer or place a marker. Every answer is explained.`));
          out.push(btn('Start practice', () => startPractice(0), true));
          if (tally.done) out.push(para(`So far: ${tally.right} of ${tally.done} right on the first try.`, 'margin-top:8px;color:var(--muted)'));
          return out;
        }
        if (st.end) {
          out.push(para(`<b>Done.</b> You got ${tally.right} of ${PR.length} right on the first try.`));
          out.push(para(tally.right === PR.length ? 'Every one. Cutting a strip again never changes its length.' : 'Missed ones are fine. Read the explanations again, then try once more.'));
          out.push(row(btn('Start again', () => { tally.done = 0; tally.right = 0; startPractice(0); }, true), btn('Back to exploring', backToExplore)));
          return out;
        }
        const pr = PR[st.pi];
        out.push(para(`${kk(`Problem ${st.pi + 1} of ${PR.length}`)} Tally: ${tally.right} of ${tally.done} right on the first try`));
        out.push(para(`<b>${pr.type === 'place' ? pr.q_ : pr.q}</b>`));
        if (pr.type === 'place') {
          if (!st.solved) out.push(row(btn(`◀ 1/${pr.q}`, () => setLevel(st.mk - 1)), btn(`1/${pr.q} ▶`, () => setLevel(st.mk + 1)), btn('Check', check, true)));
          out.push(para(`Marker: ${st.mk}/${pr.q}`, 'margin-top:8px;color:var(--muted)'));
        } else {
          out.push(choiceList(pr.choices.map((ch, i) => ({ label: pr.type === 'pick' ? `${ch.p}/${ch.q}` : ch.t, state: st.picks['c' + i], onClick: () => pickChoice(i) }))));
        }
        out.push(h('p', { style: 'margin:6px 0 10px;', html: st.fb }));
        const acts = [];
        if (st.solved) acts.push(btn(st.pi + 1 < PR.length ? 'Next problem' : 'See my tally', () => { cancel(); if (st.pi + 1 < PR.length) startPractice(st.pi + 1); else { st.end = true; sync(); } }, true));
        acts.push(btn('Back to exploring', backToExplore));
        out.push(row(...acts));
        return out;
      };
      const backToExplore = () => { cancel(); Object.assign(st, { mode: 'explore', rv: 1, pred: { done: false, ghost: null }, ghost: null }); sync(); };

      const render = () => {
        nOut.textContent = `${st.n} of ${st.a} shaded`;
        ro.replaceChildren(...renderRo());
        gPr.replaceChildren(...renderPractice());
      };
      const sync = () => {
        const pr = st.mode === 'practice', ex = st.mode === 'explore', cp = st.mode === 'compare';
        modeRow.style.display = pr ? 'none' : '';
        gEq.style.display = ex ? 'flex' : 'none'; gCmp.style.display = cp ? 'flex' : 'none';
        ro.style.display = pr ? 'none' : '';
        for (const [id, b] of modeBtns) { const on = id === st.mode || (id === 'explore' && st.mode === 'predict'); b.className = on ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', on); }
        aBtns.forEach((b, i) => { b.className = DENS[i] === st.a ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', DENS[i] === st.a); });
        bBtns.forEach((b, i) => { b.className = DENS[i] === st.b ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', DENS[i] === st.b); });
        pairSel.value = String(st.pair);
        cutBtn.textContent = st.cut ? 'Show the original parts' : `Cut both into ${lcm(PAIRS[st.pair][0][1], PAIRS[st.pair][1][1])} equal parts`;
        if (!st.picks) st.picks = {};
        render(); draw();
      };

      /* ---------- guided steps ---------- */
      const apply = (patch, immediate) => {
        cancel();
        const { mode = 'explore', cut, a, n, b, pi } = patch;
        Object.assign(st, { mode, pred: { done: false, ghost: null }, picks: {}, fb: '', ghost: null, rv: 1, end: false });
        if (a !== undefined) st.a = a;
        if (n !== undefined) st.n = n;
        if (b !== undefined) st.b = b;
        if (pi !== undefined) st.pair = pi;
        if (cut !== undefined) st.cut = !!cut;
        if (mode !== 'compare') st.n = Math.min(st.n, st.a);
        sync();
        if (!immediate && (mode === 'explore' || mode === 'predict')) { st.rv = 0; cancel = animateTo(st, { rv: 1 }, 700, draw); }
      };
      sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
