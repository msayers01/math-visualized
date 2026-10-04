/* =====================================================================
   SCHOOL — Decimals and place value (Grade 5)
   ===================================================================== */
{
  /* ---------- numbers and words ---------- */
  const PL = ['ones', 'tenths', 'hundredths', 'thousandths'];
  const PV = ['1', '0.1', '0.01', '0.001'];
  const FONT = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
  /* a count of thousandths written as a decimal, trailing zeros dropped: 370 -> 0.37 */
  const dstr = t => { const w = Math.floor(t / 1000), f = String(t % 1000).padStart(3, '0').replace(/0+$/, ''); return f ? w + '.' + f : String(w); };
  const hstr = n => dstr(n * 10);                       /* a count of hundredths */
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = (a, b) => `<span class="k">${a}</span> ${b}`;
  const digitsVal = d => d[0] * 1000 + d[1] * 100 + d[2] * 10 + d[3];
  const digitsStr = d => d[0] + '.' + d[1] + d[2] + d[3];
  const pad2 = s => { const [a, b = ''] = s.split('.'); return a + '.' + (b + '00').slice(0, 2); };
  const wordsOf = d => {
    const w = d[0], f = d[1] * 100 + d[2] * 10 + d[3];
    const fw = d[3] ? f + ' thousandths' : d[2] ? (f / 10) + ' hundredths' : d[1] ? d[1] + ' tenths' : '';
    if (!fw) return String(w);
    return w ? w + ' and ' + fw : fw;
  };

  /* pairs to compare, in hundredths (A and B are exactly how the numbers are written) */
  const PAIRS = [
    { a: 40, b: 38, A: '0.4', B: '0.38' },
    { a: 70, b: 65, A: '0.7', B: '0.65' },
    { a: 9, b: 10, A: '0.09', B: '0.1' },
    { a: 50, b: 50, A: '0.5', B: '0.50' }
  ];

  /* ---------- practice problems (a fixed list) ---------- */
  const PROBS = [
    { kind: 'build', target: 62,
      q: 'Shade the grid to show 0.62. Tap a square, or use the buttons. Then press Check.' },
    { kind: 'choice', view: 'p', digits: [3, 8, 4, 6],
      q: 'The number 3.846 is shown in the place value columns. Which digit is in the hundredths place?',
      ch: [['3', 'The 3 is in the ones place, to the left of the point. Hundredths is the second place to the right of the point.'],
           ['8', 'The 8 is in the tenths place. That is the first place to the right of the point.'],
           ['4', 'The places after the point go tenths (8), hundredths (4), thousandths (6). So the 4 is in the hundredths place. It is worth 4 × 0.01 = 0.04.'],
           ['6', 'The 6 is in the thousandths place, the third place after the point. Hundredths is the second.']], ans: 2 },
    { kind: 'choice', view: 'c', pair: { a: 30, b: 27, A: '0.3', B: '0.27' },
      q: 'Which is bigger, 0.3 or 0.27? Pick before you look at the picture.',
      ch: [['0.3 is bigger', '0.3 is 3 tenths. That is the same as 30 hundredths (0.30). 0.27 is only 27 hundredths. 30 is more than 27.'],
           ['0.27 is bigger', '27 looks bigger than 3, but the 3 in 0.3 is in the tenths place. 0.3 = 0.30, which is 30 hundredths. 30 is more than 27.'],
           ['They are equal', '0.3 is 30 hundredths and 0.27 is 27 hundredths. They are close, but not equal.']], ans: 0 },
    { kind: 'build', line: true, target: 80,
      q: 'Put the marker at 0.8 on the number line. Drag it, tap the line, or use the buttons. Then press Check.' },
    { kind: 'digits', target: [5, 2, 0, 7],
      q: 'Make the number 5.207. Use the sliders, or tap the blocks, to set one digit in each column. Then press Check.' },
    { kind: 'choice', view: 'p', digits: [0, 5, 5, 0],
      q: 'In 0.55 both digits are 5. The left 5 is in the tenths place. The right 5 is in the hundredths place. The left 5 is worth how many times the right 5?',
      ch: [['10 times', 'One tenth is 10 hundredths. So 5 tenths is 50 hundredths, and the right 5 is only 5 hundredths. 50 is 10 times 5.'],
           ['2 times', 'Both digits are 5, but they are not worth the same. The left 5 is 50 hundredths. The right 5 is 5 hundredths. 50 is 10 times 5.'],
           ['5 times', 'The digit 5 is the same in both places, so the 5 does not make the jump. The place does: each place is 10 times the place to its right.'],
           ['100 times', '100 times is a jump of two places, such as tenths to thousandths. These two places are next to each other, so the jump is 10 times.']], ans: 0 },
    { kind: 'choice', view: 'c', pair: { a: 45, b: 50, A: '0.45', B: '0.5' },
      q: 'Which is bigger, 0.45 or 0.5? Pick before you look at the picture.',
      ch: [['0.45 is bigger', 'Two digits look bigger than one, but longer does not mean bigger. 0.5 = 0.50, which is 50 hundredths. That is more than 45.'],
           ['0.5 is bigger', 'Write 0.5 as 0.50. Now compare 45 hundredths and 50 hundredths. 50 is more. The shorter number is bigger here.'],
           ['They are equal', '0.5 is 50 hundredths and 0.45 is 45 hundredths. They are not equal.']], ans: 1 },
    { kind: 'digits', target: [0, 3, 0, 5],
      q: 'Make the number 0.305. That is 305 thousandths. Set one digit in each column. Then press Check.' }
  ];
  const NP = PROBS.length;

  register({
    id: 'decimals-and-place-value', level: 'school',
    title: 'Decimals and place value',
    blurb: 'Shade a grid to build 0.37, step the digits in each place, and see why 0.4 beats 0.38.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 5; p.cy = 5; p.span = 6.2;
      for (let i = 0; i < 100; i++) {
        const col = Math.floor(i / 10), row = i % 10;
        if (i < 37) p.path([[col, row], [col + 1, row], [col + 1, row + 1], [col, row + 1]], { fill: alpha(i < 30 ? pal.yellow : pal.green, .85), close: true });
      }
      for (let k = 0; k <= 10; k++) { p.path([[k, 0], [k, 10]], { stroke: pal['grid-strong'], width: 1 }); p.path([[0, k], [10, k]], { stroke: pal['grid-strong'], width: 1 }); }
      p.path([[0, 0], [10, 0], [10, 10], [0, 10]], { stroke: pal.text, width: 2, close: true });
    },
    hook: 'A friend ran 0.4 of a mile. You ran 0.38 of a mile. The number 38 looks bigger than 4. Who ran farther?',
    steps: [
      { title: 'Tenths',
        text: String.raw`<p>Think of grid paper. This grid is <b>one whole</b>. It has 100 small squares.</p><p>Cut it into 10 equal columns. One column is one <b>tenth</b>: 0.1.</p><p>Here 1 column is shaded. That is 10 squares, so the decimal is 0.1. Tap more squares. Two columns make 0.2.</p>`,
        set: { view: 'g', g: 10 } },
      { title: 'Build 0.37',
        text: String.raw`<p>A small square is one <b>hundredth</b>: 0.01. Ten squares make one column.</p><p>3 columns are shaded: 0.3. Now add 7 squares. Tap a square, or press <b>+ 1 hundredth</b> seven times.</p><p>The decimal reads 0.3 now. With 7 more squares, that is 3 tenths and 7 hundredths, 37 squares, and it reads 0.37.</p>`,
        set: { view: 'g', g: 30 } },
      { title: 'Place value',
        text: String.raw`<p>Each digit sits in a column called a <b>place</b>. The places are ones, tenths, hundredths and thousandths.</p><p>Every digit here is 1, yet they are worth 1, 0.1, 0.01 and 0.001. Each place is 10 times the place to its right.</p><p>Step a digit up with a slider, or tap a block.</p>`,
        set: { view: 'p', d: [1, 1, 1, 1] } },
      { title: 'Which is bigger?',
        text: String.raw`<p>A friend ran 0.4 of a mile. You ran 0.38 of a mile. Who ran farther?</p><p>Make a guess first. Pick one of the buttons below.</p><p>Then the picture shows both numbers. Look at the places, one by one, starting at the left.</p>`,
        set: { view: 'c', cmp: 0, rev: false } }
    ],
    formal: String.raw`
      <h3>What a decimal is</h3>
      <p>A decimal is a number with a point in it. The digits to the left of the point count whole things. The digits to the right of the point count parts of one whole.</p>
      <h3>Tenths and hundredths</h3>
      <p>Cut one whole into 10 equal parts. Each part is one <em>tenth</em>. We write it as \(\frac{1}{10} = 0.1\).</p>
      <p>Cut one tenth into 10 equal parts. Each part is one <em>hundredth</em>: \(\frac{1}{100} = 0.01\). On a 10 by 10 grid, a column is a tenth and a small square is a hundredth.</p>
      <p>The decimal 0.37 means 3 tenths and 7 hundredths. That is 37 small squares out of 100, so \(0.37 = \frac{37}{100}\).</p>
      <h3>Place value</h3>
      <p>Each digit has a <em>place</em>, and the place tells you what one of that digit is worth.</p>
      <p>One <b>ones</b> is worth 1.<br>One <b>tenth</b> is worth 0.1.<br>One <b>hundredth</b> is worth 0.01.<br>One <b>thousandth</b> is worth 0.001.</p>
      <p><b>Worked example.</b> In 5.207 the digits are 5 ones, 2 tenths, 0 hundredths and 7 thousandths. So 5.207 = 5 + 0.2 + 0 + 0.007. The 0 is a <em>placeholder</em>. It keeps the 7 in the thousandths place. Without it, 5.27 would have a different value.</p>
      <h3>Why each place is 10 times the place to its right</h3>
      <p>One whole is 10 tenths. One tenth is 10 hundredths. One hundredth is 10 thousandths. So going one place to the left, the pieces get 10 times bigger. Going one place to the right, they get 10 times smaller. For example, \(10 \times 0.01 = 0.1\) and \(10 \times 0.1 = 1\).</p>
      <h3>Comparing decimals</h3>
      <p>1. Line up the decimal points. 2. Add zeros at the end so both numbers have the same number of places. A zero at the end does not change the value: 0.5 = 0.50. 3. Compare place by place, from the left. The first place where the digits differ decides.</p>
      <p><b>Worked example.</b> Compare 0.4 and 0.38. Write 0.4 as 0.40. The ones are both 0. The tenths are 4 and 3, and 4 is more. So 0.4 is bigger than 0.38.</p>
      <p><b>Why it works.</b> 0.4 is 4 tenths, which is 40 hundredths. 0.38 is 38 hundredths. And 40 is more than 38.</p>
      <h3>The trap: longer does not mean bigger</h3>
      <p>With whole numbers, more digits means a bigger number, because the places start at the ones and grow to the left. With decimals, the places start at the point and get smaller to the right. A long string of digits after the point can be a very small number. Another example: 0.305 and 0.35. Write 0.35 as 0.350. The tenths match (3 and 3). The hundredths are 0 and 5, so 0.35 is bigger.</p>`,
    check: [
      { q: 'Which statement is true?',
        choices: ['0.65 is bigger than 0.7, because 65 is bigger than 7.',
                  '0.7 is bigger than 0.65, because 7 tenths is more than 6 tenths.',
                  '0.7 and 0.65 are equal, because both start with a digit and a point.',
                  '0.65 is bigger than 0.7, because it has more digits.'], answer: 1,
        why: '0.7 is 7 tenths, which is 70 hundredths. 0.65 is 65 hundredths. 70 is more than 65. Comparing 65 and 7 as whole numbers is the mistake, because the 7 sits in the tenths place. More digits does not mean a bigger decimal.',
        hint: 'Write 0.7 with two places, as 0.70. Then compare the tenths digits first.' },
      { q: 'Maya shades 3 full columns of a 10 by 10 grid. Then she shades 8 more squares. Then she shades 5 more squares. Each column has 10 squares. What decimal is shaded now?',
        choices: ['0.16', '0.35', '4.3', '0.43'], answer: 3,
        why: '3 columns are 30 squares. 30 + 8 = 38. 38 + 5 = 43. So 43 of the 100 squares are shaded. That is 4 columns and 3 squares, or 0.43. Adding the digits (3 + 8 + 5 = 16) is wrong, because a column is worth 10 squares, not 1.',
        hint: 'Count squares first: one column is 10 squares. Then say how many full columns and extra squares you have.' },
      { q: 'Sam says: "0.4 and 0.38. The number 38 is bigger than 4, so 0.38 is bigger than 0.4." Which sentence finds Sam\'s mistake?',
        choices: ['Sam compared 38 and 4 like whole numbers. The 4 is in the tenths place, so 0.4 is 40 hundredths. That is more than 38 hundredths.',
                  'Sam should have compared only the last digits, 8 and 4.',
                  'Sam is right, because 0.38 has more digits.',
                  'Sam should have added the digits: 3 + 8 = 11 is bigger than 4.'], answer: 0,
        why: 'A decimal is compared place by place from the left, after the points are lined up. Write 0.4 as 0.40. The tenths are 4 and 3, so 0.4 is bigger. The number of digits does not decide the size.',
        hint: 'Add a zero to 0.4 so both numbers have two places after the point.' }
    ],
    links: { related: ['percents-on-tape-and-number-lines', 'rational-numbers-and-decimal-expansions', 'equivalent-fractions-on-a-number-line', 'multiplying-with-area-models', 'area-by-decomposition'] },

    mount({ stage, controls: C }) {
      const P = new Plane(stage, { span: 5 });
      const st = { view: 'g', g: 10, d: [1, 1, 1, 1], cmp: 0, rev: false };
      let guess = null, cfb = '', fresh = false;
      /* practice state */
      let pr = false, pi = 0, pScore = 0, pTried = 0, pDone = false, pSolved = false, pFirst = true, pBtns = [];

      const prob = () => PROBS[pi];
      const hideVal = () => pr && !pDone && prob().kind === 'build';
      const locked = () => pr && (pDone || prob().kind === 'choice');
      const curPair = () => (pr && prob().pair) || PAIRS[st.cmp];

      /* ---------- layout helpers (pixels) ---------- */
      const U = p => clamp(Math.min(p.h / 340, p.w / 380), .85, 1.7);
      const FS = u => Math.max(12, Math.round(13 * u));
      const T = (c, s, x, y, o = {}) => {
        c.font = `${o.w || 500} ${o.size || 14}px ${FONT}`; c.textAlign = o.align || 'left'; c.textBaseline = 'middle';
        c.fillStyle = o.color; c.fillText(s, x, y);
      };
      const PCOL = pal => [pal.blue, pal.yellow, pal.green, pal.red];

      const geoG = p => {
        const u = U(p), m = 14 * u, ly = p.h - m - 22 * u;
        const s = Math.max(8, Math.min((ly - 44 * u - m) / 10, p.w * .58 / 10, 48 * u));
        return { u, m, fs: FS(u), ly, s, gx: m, gy: m, xa: m + 12 * u, xb: p.w - m - 12 * u };
      };
      const geoP = p => {
        const u = U(p), m = 14 * u, fs = FS(u), cw4 = (p.w - 2 * m) / 4;
        const nameY = m + fs * .6, valY = nameY + fs * 1.45, top = valY + fs * 1.1, digH = 50 * u, arH = 48 * u;
        const bot = p.h - m - digH - arH, ch = Math.max(6, (bot - top) / 9), cwid = Math.min(cw4 - 14 * u, 84 * u);
        return { u, m, fs, cw4, nameY, valY, top, bot, ch, cwid, digY: bot + digH * .6, ar1: bot + digH + arH * .28, ar2: bot + digH + arH * .74, cx: k => m + cw4 * (k + .5) };
      };

      /* ---------- drawing ---------- */
      const drawG = (c, p) => {
        const g = geoG(p), pal = p.pal, n = st.g, tn = Math.floor(n / 10), hn = n % 10, { s, gx, gy, u, fs } = g;
        for (let i = 0; i < n; i++) {
          const col = Math.floor(i / 10), row = i % 10;
          c.fillStyle = alpha(i < tn * 10 ? pal.yellow : pal.green, .85);
          c.fillRect(gx + col * s, gy + (9 - row) * s, s, s);
        }
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 1; c.beginPath();
        for (let k = 0; k <= 10; k++) { c.moveTo(gx + k * s, gy); c.lineTo(gx + k * s, gy + 10 * s); c.moveTo(gx, gy + k * s); c.lineTo(gx + 10 * s, gy + k * s); }
        c.stroke(); c.strokeStyle = pal.text; c.lineWidth = 2; c.strokeRect(gx, gy, 10 * s, 10 * s);
        /* info panel */
        const ix = gx + 10 * s + g.m * 1.3, iw = p.w - ix - g.m;
        if (iw > 60) {
          const big = Math.min(48 * u, iw / 3.2), hv = hideVal();
          T(c, hv ? String(n) : hstr(n), ix, gy + big * .6, { size: big, w: 700, color: pal.text });
          T(c, hv ? (n === 1 ? 'square shaded' : 'squares shaded') : n + ' of 100 squares', ix, gy + big * 1.35, { size: fs, color: pal.muted });
          let y = gy + big * 1.35 + fs * 2.4; const sw = 14 * u;
          c.fillStyle = alpha(pal.yellow, .85); c.fillRect(ix, y - sw / 2, sw, sw);
          T(c, hv ? 'full columns' : tn + (tn === 1 ? ' tenth' : ' tenths'), ix + sw + 8, y, { size: fs * 1.1, color: pal.text });
          y += fs * 1.9;
          c.fillStyle = alpha(pal.green, .85); c.fillRect(ix, y - sw / 2, sw, sw);
          T(c, hv ? 'extra squares' : hn + (hn === 1 ? ' hundredth' : ' hundredths'), ix + sw + 8, y, { size: fs * 1.1, color: pal.text });
          y += fs * 2.2;
          T(c, 'column = 0.1', ix, y, { size: fs, color: pal.muted });
          T(c, 'square = 0.01', ix, y + fs * 1.5, { size: fs, color: pal.muted });
        }
        /* number line */
        const { xa, xb, ly } = g, X = k => xa + (xb - xa) * k / 100;
        c.lineCap = 'round'; c.lineWidth = 2; c.strokeStyle = pal['grid-strong'];
        c.beginPath(); c.moveTo(xa, ly); c.lineTo(xb, ly); c.stroke();
        if (n > 0) {
          c.lineWidth = 8 * Math.min(u, 1.3); c.lineCap = 'butt';
          if (tn > 0) { c.strokeStyle = alpha(pal.yellow, .9); c.beginPath(); c.moveTo(xa, ly); c.lineTo(X(tn * 10), ly); c.stroke(); }
          if (hn > 0) { c.strokeStyle = alpha(pal.green, .9); c.beginPath(); c.moveTo(X(tn * 10), ly); c.lineTo(X(n), ly); c.stroke(); }
        }
        c.lineCap = 'round'; c.strokeStyle = pal.muted;
        for (let k = 0; k <= 100; k++) {
          const major = k % 10 === 0; c.lineWidth = major ? 1.6 : 1; c.beginPath();
          c.moveTo(X(k), ly + 5 * u); c.lineTo(X(k), ly + (major ? 12 : 8) * u); c.stroke();
          if (major) T(c, hstr(k), X(k), ly + 24 * u, { size: fs, align: 'center', color: pal.muted });
        }
        const mx = X(n);
        c.beginPath(); c.arc(mx, ly, 11 * u, 0, TAU); c.fillStyle = pal.stage; c.fill();
        c.lineWidth = 3; c.strokeStyle = pal.brass; c.stroke();
        if (!hideVal()) T(c, hstr(n), clamp(mx, g.m + 22 * u, p.w - g.m - 22 * u), ly - 28 * u, { size: fs * 1.3, w: 700, align: 'center', color: pal.text });
      };

      const drawP = (c, p) => {
        const g = geoP(p), pal = p.pal, cols = PCOL(pal), { fs, u, ch, cwid } = g;
        for (let k = 0; k < 4; k++) {
          const cx = g.cx(k);
          T(c, PL[k], cx, g.nameY, { size: fs, w: 700, align: 'center', color: pal.text });
          T(c, PV[k] + ' each', cx, g.valY, { size: fs, align: 'center', color: pal.muted });
          for (let i = 0; i < 9; i++) {
            const y = g.bot - (i + 1) * ch, on = i < st.d[k];
            if (on) { c.fillStyle = alpha(cols[k], .85); c.fillRect(cx - cwid / 2, y, cwid, ch); }
            c.strokeStyle = pal['grid-strong']; c.lineWidth = 1; c.strokeRect(cx - cwid / 2 + .5, y + .5, cwid - 1, ch - 1);
          }
          c.strokeStyle = pal.text; c.lineWidth = 2; c.strokeRect(cx - cwid / 2, g.bot - 9 * ch, cwid, 9 * ch);
          T(c, String(st.d[k]), cx, g.digY, { size: 44 * u, w: 700, align: 'center', color: pal.text });
        }
        T(c, '.', g.m + g.cw4, g.digY + 8 * u, { size: 52 * u, w: 800, align: 'center', color: pal.text });
        for (let k = 0; k < 3; k++) {
          const mx = (g.cx(k) + g.cx(k + 1)) / 2;
          T(c, '← × 10', mx, g.ar1, { size: fs, w: 600, align: 'center', color: pal.violet });
          T(c, '÷ 10 →', mx, g.ar2, { size: fs, align: 'center', color: pal.muted });
        }
      };

      const drawC = (c, p) => {
        const pal = p.pal, u = U(p), fs = FS(u), m = 14 * u, cp = curPair(), { a, b, A, B } = cp;
        if (!st.rev) {
          const y = p.h * .36, big = Math.min(54 * u, p.w / 7);
          T(c, A, p.w * .24, y, { size: big, w: 700, align: 'center', color: pal.text });
          T(c, 'or', p.w * .5, y, { size: fs * 1.4, align: 'center', color: pal.muted });
          T(c, B, p.w * .76, y, { size: big, w: 700, align: 'center', color: pal.text });
          T(c, 'Which is bigger?', p.w / 2, p.h * .6, { size: fs * 1.5, w: 600, align: 'center', color: pal.text });
          T(c, 'Pick a button first. Then the picture shows.', p.w / 2, p.h * .6 + fs * 2, { size: fs, align: 'center', color: pal.muted });
          return;
        }
        const labW = 52 * u, bx = m + labW, bw = p.w - m - bx, cwd = bw / 10, bh = 22 * u;
        let y = m;
        [[A, a], [B, b]].forEach(([s, v], r) => {
          const top = y + r * (bh + 8 * u);
          T(c, s, m, top + bh / 2, { size: fs * 1.15, w: 700, color: pal.text });
          for (let i = 0; i < 10; i++) {
            const amt = clamp(v - 10 * i, 0, 10);
            if (amt > 0) { c.fillStyle = alpha(amt === 10 ? pal.yellow : pal.green, .85); c.fillRect(bx + i * cwd, top, cwd * amt / 10, bh); }
            c.strokeStyle = pal['grid-strong']; c.lineWidth = 1; c.strokeRect(bx + i * cwd + .5, top + .5, cwd - 1, bh - 1);
          }
          c.strokeStyle = pal.text; c.lineWidth = 2; c.strokeRect(bx, top, bw, bh);
        });
        y += 2 * bh + 8 * u + 16 * u;
        /* place value table */
        const tx0 = bx, colW = bw / 3, rowH = 30 * u;
        ['ones', 'tenths', 'hundredths'].forEach((s, k) => T(c, s, tx0 + colW * (k + .5), y, { size: fs, w: 700, align: 'center', color: pal.muted }));
        y += 12 * u;
        const r1 = y + rowH / 2, r2 = r1 + rowH, ta = Math.floor(a / 10), tb = Math.floor(b / 10);
        const dec = a === b ? -1 : ta !== tb ? 1 : 2;
        [[A, a, r1], [B, b, r2]].forEach(([s, v, ry]) => {
          T(c, s, m, ry, { size: fs * 1.15, w: 700, color: pal.text });
          const ds = [Math.floor(v / 100), Math.floor(v / 10) % 10, v % 10], hasH = (s.split('.')[1] || '').length >= 2;
          ds.forEach((d, k) => {
            const cx = tx0 + colW * (k + .5), padded = k === 2 && !hasH;
            T(c, String(d), cx, ry, { size: 24 * u, w: 700, align: 'center', color: padded ? pal.muted : pal.text });
            if (padded) { c.setLineDash([4, 3]); c.strokeStyle = pal.muted; c.lineWidth = 1.5; c.strokeRect(cx - 14 * u, ry - 15 * u, 28 * u, 30 * u); c.setLineDash([]); }
          });
          T(c, '.', tx0 + colW, ry + 5 * u, { size: 30 * u, w: 800, align: 'center', color: pal.text });
        });
        if (dec >= 0) {
          const cx = tx0 + colW * (dec + .5);
          c.strokeStyle = pal.violet; c.lineWidth = 3; c.strokeRect(cx - colW / 2 + 6, r1 - rowH / 2 + 1, colW - 12, 2 * rowH - 2);
        }
        y = r2 + rowH / 2 + 14 * u;
        T(c, dec >= 0 ? 'First place that differs: ' + PL[dec] : 'Every place matches', m, y, { size: fs, w: 600, color: dec >= 0 ? pal.violet : pal.muted });
        y += 20 * u;
        /* zoomed number line */
        const lo = Math.max(0, Math.floor(Math.min(a, b) / 10) * 10 - 10), hi = lo + 30;
        const xa = m + 8 * u, xb = p.w - m - 8 * u, X = v => xa + (xb - xa) * (v - lo) / (hi - lo);
        T(c, 'Zoomed number line, from ' + hstr(lo) + ' to ' + hstr(hi), m, y, { size: fs, color: pal.muted });
        const ly = y + 52 * u;
        c.lineWidth = 2; c.strokeStyle = pal['grid-strong']; c.beginPath(); c.moveTo(xa, ly); c.lineTo(xb, ly); c.stroke();
        c.strokeStyle = pal.muted;
        for (let k = lo; k <= hi; k++) {
          const major = k % 10 === 0; c.lineWidth = major ? 1.6 : 1; c.beginPath();
          c.moveTo(X(k), ly + 3 * u); c.lineTo(X(k), ly + (major ? 11 : 7) * u); c.stroke();
          if (major) T(c, hstr(k), X(k), ly + 22 * u, { size: fs, align: 'center', color: pal.muted });
        }
        const mk = (v, label, dy) => {
          c.beginPath(); c.arc(X(v), ly, 7 * u, 0, TAU); c.fillStyle = pal.blue; c.fill(); c.lineWidth = 2; c.strokeStyle = pal.stage; c.stroke();
          T(c, label, clamp(X(v), m + 20 * u, p.w - m - 20 * u), ly + dy, { size: fs * 1.15, w: 700, align: 'center', color: pal.text });
        };
        if (a === b) mk(a, A + ' = ' + B, -22 * u);
        else { mk(a, A, a > b ? -22 * u : -22 * u); mk(b, B, 40 * u); }
        const vtxt = a === b ? A + ' and ' + B + ' are equal' : (a > b ? A + ' is bigger than ' + B : B + ' is bigger than ' + A);
        T(c, vtxt, p.w / 2, p.h - m - 4 * u, { size: fs * 1.35, w: 700, align: 'center', color: pal.text });
      };

      P.onDraw = (c, p) => { if (st.view === 'g') drawG(c, p); else if (st.view === 'p') drawP(c, p); else drawC(c, p); };

      /* ---------- controls ---------- */
      const mkBtn = (label, fn, cls = 'btn') => h('button', { type: 'button', class: cls, onclick: fn, style: 'min-height:44px' }, label);
      const row = (...kids) => h('div', { class: 'ctl buttons' }, ...kids);
      const setView = v => { st.view = v; guess = null; cfb = ''; sync(); };

      C.title('Explore');
      const modeBtns = C.buttons([
        { label: 'Shade squares', onClick: () => setView('g') },
        { label: 'Place values', onClick: () => setView('p') },
        { label: 'Compare', onClick: () => { st.rev = false; setView('c'); } }]);
      modeBtns.forEach(b => { b.style.minHeight = '44px'; });
      const host = modeBtns[0].parentElement.parentElement;
      const collect = fn => {
        const before = new Set(host.children); fn();
        const w = h('div', { style: 'display:flex;flex-direction:column;gap:10px' });
        w.append(...[...host.children].filter(n => !before.has(n))); host.append(w); return w;
      };

      /* shade group */
      const setG = n => { st.g = clamp(n, 0, 100); sync(); };
      const Gw = collect(() => {
        C.hint('Tap a square or the number line, drag the marker, or use the buttons. Columns fill first.');
        host.append(row(mkBtn('− 1 tenth', () => setG(st.g - 10)), mkBtn('+ 1 tenth', () => setG(st.g + 10))));
        host.append(row(mkBtn('− 1 hundredth', () => setG(st.g - 1)), mkBtn('+ 1 hundredth', () => setG(st.g + 1)), mkBtn('Clear', () => setG(0))));
      });
      /* digit group */
      const sl = [];
      const Pw = collect(() => {
        C.hint('Tap a block in a column, or use a slider. A digit goes from 0 to 9.');
        PL.forEach((nm, k) => { sl[k] = C.slider({ label: nm[0].toUpperCase() + nm.slice(1) + ' digit', min: 0, max: 9, step: 1, value: st.d[k], format: v => String(v), onInput: v => { st.d[k] = v; sync(); } }); });
      });
      /* compare group */
      const gBtns = [];
      const nextPair = () => { st.cmp = (st.cmp + 1) % PAIRS.length; st.rev = false; guess = null; cfb = ''; sync(); };
      const doGuess = k => {
        const { a, b, A, B } = curPair(), right = a > b ? 0 : a < b ? 1 : 2;
        guess = k; st.rev = true;
        const lenA = A.length, lenB = B.length;
        if (k === right) cfb = ok('Right.') + ' ';
        else if (right === 2) cfb = no('Not quite.') + ' A zero at the end of a decimal changes nothing: ' + A + ' = ' + B + '. ';
        else if (k === 2) cfb = no('Not quite.') + ' The two numbers have different values. ';
        else cfb = no('Not quite.') + ' ' + (((k === 0 ? lenA : lenB) > (k === 0 ? lenB : lenA)) ? 'That number has more digits, but longer does not mean bigger. ' : 'Compare place by place, starting at the tenths. ');
        sync();
      };
      const Cw = collect(() => {
        C.hint('Predict first. Pick an answer, then the picture shows the places.');
        const r = row(); [0, 1, 2].forEach(k => { const b = mkBtn('', () => doGuess(k)); gBtns[k] = b; r.append(b); }); host.append(r);
        host.append(row(mkBtn('Next pair', nextPair)));
      });

      const ro = C.readout();

      /* ---------- practice ---------- */
      C.title('Practice');
      C.hint('Eight short problems. Nothing here is saved or scored.');
      const startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { if (pr) leavePractice(); else enterPractice(); } }])[0];
      startBtn.style.minHeight = '44px';
      const Pr = h('div', { style: 'display:none;flex-direction:column;gap:12px' });
      const ptally = h('p', { class: 'ctl-title' });
      const pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
      const pslot = h('div', { style: 'display:flex;flex-direction:column;gap:10px' });
      const pch = h('div', { class: 'choices' });
      const pcheck = mkBtn('Check', () => checkProb(), 'btn primary');
      const pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
      const pnext = mkBtn('Next problem', () => nextProb(), 'btn primary');
      Pr.append(ptally, pq, pslot, pch, row(pcheck), pfb, row(pnext)); host.append(Pr);

      const loadProb = () => {
        const q = prob(); pSolved = false; pFirst = true; pfb.innerHTML = ''; guess = null; cfb = ''; st.rev = false;
        if (q.kind === 'build') { st.view = 'g'; st.g = 0; }
        else if (q.kind === 'digits') { st.view = 'p'; st.d = [0, 0, 0, 0]; }
        else { st.view = q.view; if (q.digits) st.d = q.digits.slice(); }
        pch.innerHTML = ''; pBtns = [];
        if (q.kind === 'choice') q.ch.forEach((c, i) => { const b = h('button', { type: 'button', class: 'choice', onclick: () => answerChoice(i) }, c[0]); pBtns.push(b); pch.append(b); });
      };
      const enterPractice = () => {
        pr = true; pi = 0; pScore = 0; pTried = 0; pDone = false; pslot.append(Gw, Pw); loadProb(); sync();
      };
      const leavePractice = () => {
        pr = false; pDone = false; host.insertBefore(Gw, Cw); host.insertBefore(Pw, Cw); st.rev = false; guess = null; cfb = ''; sync();
      };
      const solved = (first, text) => {
        pSolved = true; pTried++; if (first) pScore++;
        pfb.innerHTML = ok('Right.') + ' ' + text + (first ? '' : ' (Not counted as a first try.)');
        if (prob().kind === 'choice') st.rev = true;
        sync();
      };
      const wrong = text => { pFirst = false; pfb.innerHTML = no('Not quite.') + ' ' + text; sync(); };
      const answerChoice = i => {
        const q = prob(); if (pSolved) return;
        if (i === q.ans) { pBtns[i].classList.add('right'); solved(pFirst, q.ch[i][1]); pBtns.forEach(b => { b.disabled = true; }); }
        else { pBtns[i].classList.add('wrong'); pBtns[i].disabled = true; wrong(q.ch[i][1]); }
      };
      const checkProb = () => {
        const q = prob(); if (pSolved) return;
        if (q.kind === 'build') {
          const n = st.g, t = q.target;
          if (n === t) {
            solved(pFirst, q.line
              ? '0.8 is 8 tenths, so the marker is 8 of the 10 big jumps from 0 to 1. It is also 80 hundredths, or 80 squares.'
              : '0.62 is 6 tenths and 2 hundredths. That is 6 full columns (60 squares) and 2 more squares, 62 in all.');
          } else if (q.line) {
            wrong(n === 8 ? 'The marker is at 0.08. That is only 8 hundredths, less than one tenth. 0.8 is 8 whole tenths: 80 squares.'
              : 'The marker is at ' + hstr(n) + '. 0.8 means 8 tenths: the 8th big mark after 0.');
          } else {
            wrong(n === 26 ? 'You shaded 0.26: 2 columns and 6 squares. In 0.62 the 6 is in the tenths place, so shade 6 full columns first.'
              : 'You shaded ' + n + ' squares, which is ' + hstr(n) + '. 0.62 is 62 squares: 6 full columns and 2 more squares.');
          }
        } else {
          const t = q.target, bad = t.findIndex((v, k) => v !== st.d[k]);
          if (bad < 0) {
            solved(pFirst, t[0] === 5
              ? '5 ones, 2 tenths, 0 hundredths and 7 thousandths make 5.207. The 0 holds the hundredths place, so the 7 stays in the thousandths place.'
              : '3 tenths, 0 hundredths and 5 thousandths make 0.305. The 0 is a placeholder. Without it the 5 would slide into the hundredths place and the number would be 0.35.');
          } else {
            wrong('Your number is ' + digitsStr(st.d) + '. The ' + PL[bad] + ' digit should be ' + t[bad] + ', but it is ' + st.d[bad] + '.' + (t[bad] === 0 ? ' A 0 is needed here to hold the place.' : ''));
          }
        }
      };
      const nextProb = () => {
        if (pDone) { enterPractice(); return; }
        if (pi + 1 >= NP) { pDone = true; sync(); return; }
        pi++; loadProb(); sync();
      };

      /* ---------- readout and sync ---------- */
      const roHtml = () => {
        if (st.view === 'g') {
          const n = st.g, tn = Math.floor(n / 10), hn = n % 10;
          return kk('Shaded', n + ' of 100 squares') + '<br>' + kk('Tenths', tn + (tn === 1 ? ' full column' : ' full columns')) + '<br>' +
            kk('Hundredths', hn + ' extra ' + (hn === 1 ? 'square' : 'squares')) + '<br>' + kk('Decimal', hstr(n));
        }
        if (st.view === 'p') {
          const d = st.d, v = digitsVal(d), trail = d[3] === 0 && v % 1000 !== 0;
          const worth = [d[0] * 1000, d[1] * 100, d[2] * 10, d[3]].map(dstr).join(' + ');
          return kk('Number', dstr(v)) + '<br>' + kk('Worth', worth + ' = ' + dstr(v)) + '<br>' + kk('Read it', wordsOf(d)) +
            (trail ? '<br>' + kk('Note', 'A 0 at the end changes nothing: ' + digitsStr(d) + ' = ' + dstr(v)) : '');
        }
        const { a, b, A, B } = curPair();
        gBtns.forEach((bt, k) => { bt.textContent = k === 0 ? A + ' is bigger' : k === 1 ? B + ' is bigger' : 'They are equal'; });
        if (!st.rev) return 'Which is bigger: ' + A + ' or ' + B + '? Pick one of the buttons.';
        const ta = Math.floor(a / 10), tb = Math.floor(b / 10), big = a > b ? A : B, small = a > b ? B : A;
        let d;
        if (a === b) d = 'Both are ' + a + ' hundredths. A zero at the end of a decimal does not change its value.';
        else {
          const dec = ta !== tb;
          d = 'Write both with two places: ' + pad2(A) + ' and ' + pad2(B) + '. The ' + (dec ? 'tenths differ first: ' + ta + ' and ' + tb : 'tenths match, so the hundredths decide: ' + (a % 10) + ' and ' + (b % 10)) + '. So ' + big + ' is bigger.';
          if (small.length > big.length && !cfb.includes('longer does not')) d += ' ' + small + ' has more digits, but it is smaller. Longer does not mean bigger.';
        }
        return cfb + d;
      };
      const sync = () => {
        P.draw();
        for (let k = 0; k < 4; k++) sl[k].set(st.d[k]);
        const kind = pr && !pDone ? prob().kind : '';
        modeBtns.forEach((b, i) => { b.className = ['g', 'p', 'c'][i] === st.view ? 'btn primary' : 'btn'; b.style.display = pr ? 'none' : ''; });
        Gw.style.display = pr ? (kind === 'build' ? '' : 'none') : st.view === 'g' ? '' : 'none';
        Pw.style.display = pr ? (kind === 'digits' ? '' : 'none') : st.view === 'p' ? '' : 'none';
        Cw.style.display = !pr && st.view === 'c' ? '' : 'none';
        ro.style.display = pr ? 'none' : '';
        if (!pr) ro.innerHTML = roHtml(); else roHtml();
        Pr.style.display = pr ? 'flex' : 'none';
        startBtn.textContent = pr ? 'Back to the lesson' : 'Start practice';
        if (pr) {
          ptally.textContent = pDone ? 'All done' : 'Problem ' + (pi + 1) + ' of ' + NP + '  |  Right the first time: ' + pScore + ' of ' + pTried;
          pq.textContent = pDone ? 'You got ' + pScore + ' of ' + NP + ' right the first time. ' + (pScore === NP ? 'Great work.' : pScore >= NP - 2 ? 'Good work. Try again to fix the ones you missed.' : 'Look back at the steps, then try again. Each place is 10 times the place to its right.') : prob().q;
          pch.style.display = !pDone && kind === 'choice' ? '' : 'none';
          pcheck.parentElement.style.display = kind === 'build' || kind === 'digits' ? '' : 'none';
          pcheck.disabled = pSolved;
          pnext.parentElement.style.display = pDone || pSolved ? '' : 'none';
          pnext.textContent = pDone ? 'Practice again' : pi + 1 >= NP ? 'Finish' : 'Next problem';
          pfb.style.display = pDone ? 'none' : '';
        }
      };

      /* ---------- canvas input ---------- */
      stage.addEventListener('pointerdown', () => { fresh = true; }, true);
      draggable(P, {
        hit: (px, py) => {
          if (locked()) return null;
          if (st.view === 'g') {
            const g = geoG(P);
            if (Math.abs(py - g.ly) < 30 * g.u && px >= g.xa - 16 && px <= g.xb + 16) return 'line';
            if (px >= g.gx && px <= g.gx + 10 * g.s && py >= g.gy && py <= g.gy + 10 * g.s) return 'grid';
            return null;
          }
          if (st.view === 'p') {
            const g = geoP(P);
            for (let k = 0; k < 4; k++) if (Math.abs(px - g.cx(k)) < g.cw4 / 2 && py >= g.top && py <= g.bot + 2) return 'p' + k;
          }
          return null;
        },
        move: (hd, x, y) => {
          const px = P.X(x), py = P.Y(y), was = fresh; fresh = false;
          if (hd === 'line') { const g = geoG(P); st.g = clamp(Math.round((px - g.xa) / (g.xb - g.xa) * 100), 0, 100); }
          else if (hd === 'grid') {
            const g = geoG(P), col = clamp(Math.floor((px - g.gx) / g.s), 0, 9), row = clamp(9 - Math.floor((py - g.gy) / g.s), 0, 9), t = col * 10 + row + 1;
            st.g = was && t === st.g ? t - 1 : t;
          } else {
            const g = geoP(P), k = +hd[1], t = clamp(Math.floor((g.bot - py) / g.ch), 0, 8) + 1;
            st.d[k] = was && t === st.d[k] ? t - 1 : t;
          }
          sync();
        }
      });

      const apply = patch => {
        if (pr) leavePractice();
        if ('view' in patch) st.view = patch.view;
        if ('g' in patch) st.g = patch.g;
        if ('d' in patch) st.d = patch.d.slice();
        if ('cmp' in patch) st.cmp = patch.cmp;
        if ('rev' in patch) st.rev = patch.rev;
        guess = null; cfb = '';
        sync();
      };
      sync();
      return { destroy: () => P.destroy(), apply };
    }
  });
}
