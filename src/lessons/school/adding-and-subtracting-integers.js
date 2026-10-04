/* =====================================================================
   SCHOOL — Adding and subtracting integers (Grade 7)
   ===================================================================== */
{
  /* ---------- numbers and words ---------- */
  const MINUS = '−';
  const ab = Math.abs;
  const nf = v => (v < 0 ? MINUS : '') + ab(v);
  const par = v => (v < 0 ? `(${nf(v)})` : String(ab(v)));
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const stepsW = n => `${ab(n)} step${ab(n) === 1 ? '' : 's'}`;
  const dirOf = m => (m < 0 ? 'left' : 'right');
  const resOf = (a, op, b) => (op === 'add' ? a + b : a - b);
  const moveOf = (op, b) => (op === 'add' ? b : -b);
  const exprOf = (a, op, b) => `${nf(a)} ${op === 'add' ? '+' : MINUS} ${par(b)}`;
  const fullEq = (a, op, b, hide) => {
    const r = resOf(a, op, b), e = exprOf(a, op, b);
    if (hide) return `${e} = ?`;
    return op === 'sub' ? `${e} = ${nf(a)} + ${par(-b)} = ${nf(r)}` : `${e} = ${nf(r)}`;
  };
  const moveWords = m => (m === 0 ? 'do not move' : `move ${ab(m)} ${dirOf(m)}`);
  /* why the walker goes the way it goes */
  const whyDir = (op, b) => {
    if (b === 0) return `${op === 'add' ? 'adding' : 'subtracting'} 0 changes nothing`;
    if (op === 'add') return b > 0 ? 'adding a positive number moves right' : 'adding a negative number moves left';
    return b > 0 ? `subtracting ${b} is adding ${nf(-b)}, a negative number, so the walker moves left`
      : `subtracting ${nf(b)} is adding ${-b}, a positive number, so the walker moves right`;
  };
  const chipWords = v => (v === 0 ? 'no chips' : `${ab(v)} ${v > 0 ? 'positive' : 'negative'} chip${ab(v) === 1 ? '' : 's'}`);

  /* ---------- predictions ---------- */
  const PRED = [
    { a: 2, op: 'sub', b: -3, q: 'Predict: what is 2 − (−3)?', choices: [
      { t: '−1', v: -1, why: 'That is 2 + (−3), or 2 − 3. This problem has two minus signs: one says subtract, and one is part of the number −3. Subtracting −3 means adding +3, so the walker moves right.' },
      { t: '5', v: 5, ok: true, why: 'Subtracting −3 is adding its opposite, 3. So 2 − (−3) = 2 + 3 = 5. The walker moves 3 to the right.' },
      { t: '1', v: 1, why: 'That is 3 − 2: it takes the smaller number from the larger and ignores the signs. Subtracting −3 is adding +3, so the walker moves right from 2.' },
      { t: '−5', v: -5, why: 'The sign does not flip like that. Start at 2 and add the opposite of −3, which is +3. That is 3 steps to the right, so you land on 5.' }] },
    { a: -3, op: 'sub', b: -5, q: 'Predict: what is −3 − (−5)?', choices: [
      { t: '−8', v: -8, why: 'That is −3 − 5. But the number being subtracted is −5, so you add its opposite, 5, and move right.' },
      { t: '−2', v: -2, why: 'That is −5 + 3: the right numbers in the wrong order. Start at −3, the first number, and move 5 to the right.' },
      { t: '8', v: 8, why: 'That is 3 + 5. The walker starts at −3, not 3. Move 5 right from −3 and you land on 2.' },
      { t: '2', v: 2, ok: true, why: '−3 − (−5) = −3 + 5. Start at −3 and move 5 to the right. You pass 0 after 3 steps and land on 2.' }] },
    { a: 1, op: 'sub', b: 4, q: 'Predict: what is 1 − 4?', choices: [
      { t: '3', v: 3, why: 'That takes the smaller number from the larger and drops the sign. 1 − 4 = 1 + (−4): move 4 left from 1. You pass 0 and land on −3.' },
      { t: '−3', v: -3, ok: true, why: '1 − 4 = 1 + (−4). Start at 1 and move 4 to the left. One step reaches 0 and 3 more steps go past it, so you land on −3.' },
      { t: '−5', v: -5, why: 'That is −1 − 4. The walker starts at +1, to the right of 0, not at −1.' },
      { t: '5', v: 5, why: 'That is 1 + 4. Subtracting 4 moves the walker left, not right.' }] }
  ];

  /* ---------- drawing helpers ---------- */
  const SANS = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
  const font = (size, weight = 600) => `${weight} ${size}px ${SANS}`;
  const mw = (c, s, size, weight = 600) => { c.font = font(size, weight); return c.measureText(s).width; };
  const T = (c, p, s, x, y, { size = 13, color, align = 'center', weight = 600 } = {}) => {
    c.font = font(size, weight); c.textAlign = align; c.textBaseline = 'middle';
    c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(s, x, y);
    c.fillStyle = color || p.pal.text; c.fillText(s, x, y);
  };
  const line = (c, x0, y0, x1, y1, color, width = 1.5, dash) => {
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.strokeStyle = color; c.lineWidth = width; c.setLineDash(dash || []); c.lineCap = 'round'; c.stroke(); c.setLineDash([]);
  };
  const rrect = (c, x, y, w, hh, r) => {
    r = Math.min(r, w / 2, hh / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + hh, r); c.arcTo(x + w, y + hh, x, y + hh, r); c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  const tri = (c, x, y, dx, dy, s, color) => {
    c.beginPath(); c.moveTo(x + dx * s, y + dy * s); c.lineTo(x - dy * s * .6, y + dx * s * .6); c.lineTo(x + dy * s * .6, y - dx * s * .6); c.closePath(); c.fillStyle = color; c.fill();
  };
  const disc = (c, x, y, r, fill, ring, lw = 2.6) => {
    c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = fill; c.fill(); if (ring) { c.strokeStyle = ring; c.lineWidth = lw; c.stroke(); }
  };
  /* a hop (curved arrow) from x0 to x1 over the line at height y */
  const hop = (c, x0, x1, y, hh, col, dash) => {
    if (Math.abs(x1 - x0) < 2) return;
    const mx = (x0 + x1) / 2;
    c.beginPath(); c.moveTo(x0, y); c.quadraticCurveTo(mx, y - 2 * hh, x1, y);
    c.strokeStyle = col; c.lineWidth = 3.2; c.setLineDash(dash || []); c.lineCap = 'round'; c.stroke(); c.setLineDash([]);
    const dx = x1 - mx, dy = 2 * hh, L = Math.hypot(dx, dy) || 1;
    tri(c, x1 - dx / L * 9, y - dy / L * 9, dx / L, dy / L, 9, col);
  };

  register({
    id: 'adding-and-subtracting-integers', level: 'school',
    title: 'Adding and subtracting integers',
    blurb: 'Walk along a number line and use positive and negative chips to see why subtracting a negative number adds, and how far apart two integers are.',
    thumb(c, p) {
      const pal = p.pal, W = p.w, H = p.h, x0 = W * .08, x1 = W * .92, y = H * .64, fs = Math.max(9, H * .085), X = v => (x0 + x1) / 2 + v * (x1 - x0) / 11.6;
      line(c, x0, y, x1, y, pal.blue, 2.6); tri(c, x0, y, -1, 0, 7, pal.blue); tri(c, x1, y, 1, 0, 7, pal.blue);
      for (let v = -5; v <= 5; v++) {
        line(c, X(v), y - 5, X(v), y + 5, v === 0 ? pal.violet : pal['grid-strong'], v === 0 ? 2.6 : 1.5);
        if (v % 5 === 0 || v === 2 || v === -3) {
          c.font = font(fs, v === 0 ? 800 : 600); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = v === 0 ? pal.violet : pal.muted;
          c.fillText(v < 0 ? MINUS + (-v) : String(v), X(v), y + H * .14);
        }
      }
      const yh = y - H * .1, hh = H * .26, mx = (X(2) + X(-3)) / 2;
      c.beginPath(); c.moveTo(X(2), yh); c.quadraticCurveTo(mx, yh - 2 * hh, X(-3), yh); c.strokeStyle = pal.red; c.lineWidth = 2.8; c.stroke();
      { const dx = X(-3) - mx, dy = 2 * hh, L = Math.hypot(dx, dy); tri(c, X(-3) - dx / L * 7, yh - dy / L * 7, dx / L, dy / L, 7, pal.red); }
      disc(c, X(2), y, 6, pal.yellow, pal.brass, 2.2); disc(c, X(-3), y, 6, pal.stage, pal.red, 2.6);
      c.font = font(fs * 1.25, 700); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = pal.text;
      c.fillText('2 ' + MINUS + ' 5 = ' + MINUS + '3', mx, H * .17);
    },
    hook: String.raw`You have 2 points. Then a referee takes away a 3-point penalty, a score of −3. Do you end up with more points or fewer? How can taking something away make a number bigger?`,
    steps: [
      { title: 'Opposites',
        text: String.raw`<p>Every number has an <b>opposite</b>. The opposite of 3 is −3. They are the same distance from 0, on opposite sides. The dashed arcs show it: flip over 0, then flip back.</p><p>The opposite of the opposite of 3 is 3 again, so −(−3) = 3. Only 0 is its own opposite. Drag the dot. <b>p</b> stands for the number. Try a negative <b>p</b>.</p>`,
        set: { view: 'opp', p: 3 } },
      { title: 'Adding and subtracting are moves',
        text: String.raw`<p>A walker starts at 2. Adding a positive number moves right. Adding a negative number moves left. <b>Subtracting</b> 5 is adding the opposite of 5, which is −5. So 2 − 5 = 2 + (−5), and the walker goes 5 steps left to −3.</p><p>Try the <b>Add</b> button, or drag the end dot. Watch the equation and the words change.</p>`,
        set: { view: 'line', a: 2, op: 'sub', b: 5 } },
      { title: 'How far apart?',
        text: String.raw`<p>How far is −4 from 3? Count 4 steps to reach 0 and 3 more: 7 steps. 3 − (−4) = 7, and −4 − 3 = −7. A distance is never negative.</p><p>The absolute value |x| of a number is its distance from 0, so |−7| = 7. The distance between A and B is |A − B|. Drag A and B.</p>`,
        set: { view: 'dist', A: -4, B: 3 } },
      { title: 'Predict, then see',
        text: String.raw`<p>Predict 2 − (−3) before the walker moves. Pick an answer. A wrong pick shows where it lands, and explains why it misses.</p><p>When you are right, press <b>Check it with chips</b>. A positive chip and a negative chip cancel to 0. Chips show why taking away a negative adds.</p>`,
        set: { view: 'predict', pq: 0 } }
    ],
    formal: String.raw`
      <h3>Opposites</h3>
      <p>The <em>opposite</em> of a number \(p\) is written \(-p\). The numbers \(p\) and \(-p\) are the same distance from \(0\) on the number line, on opposite sides. The opposite of \(3\) is \(-3\). The opposite of \(-3\) is \(3\), so
      \[ -(-3) = 3, \qquad -(-p) = p. \]
      Flipping over \(0\) twice puts you back where you began. The number \(0\) is its own opposite: \(-0 = 0\).</p>
      <h3>Adding is moving</h3>
      <p>To find \(a + b\), start at \(a\). If \(b\) is positive, move \(b\) steps to the right. If \(b\) is negative, move \(|b|\) steps to the left. (The <em>absolute value</em> \(|x|\) of a number is its distance from \(0\), so \(|-7| = 7\).) So \(-2 + 5 = 3\) and \(2 + (-5) = -3\). A number and its opposite add to zero, because the walker goes out and comes straight back: \(4 + (-4) = 0\).</p>
      <h3>Subtracting is adding the opposite</h3>
      <p>For any integers \(p\) and \(q\),
      \[ p - q = p + (-q). \]
      So \(2 - 5 = 2 + (-5) = -3\). And when \(q\) is negative, \(-q\) is positive, so subtracting a negative number is the same as adding a positive number:
      \[ 2 - (-3) = 2 + 3 = 5. \]</p>
      <h3>Why this is true</h3>
      <p>Subtraction answers the question "what do I add to \(q\) to get \(p\)?" Try \(p + (-q)\). Add \(q\) to it:
      \[ q + \bigl(p + (-q)\bigr) = p + \bigl(q + (-q)\bigr) = p + 0 = p. \]
      (When we add, we may regroup and reorder.)
      So \(p + (-q)\) is exactly the number that you add to \(q\) to get \(p\). That is what \(p - q\) means.</p>
      <p>Chips show the same thing. A positive chip and a negative chip together are a <em>zero pair</em>, worth 0. Adding a zero pair to a board does not change its value. To work out \(2 - (-3)\), start with 2 positive chips. You cannot take out 3 negative chips, because there are none. So add 3 zero pairs. The board still has the value 2, but now it has 5 positive chips and 3 negative chips. Take out the 3 negative chips. Five positive chips are left. Taking away 3 negative chips made the total 3 bigger.</p>
      <h3>Distance between two numbers</h3>
      <p>The distance between \(a\) and \(b\) is how many steps it takes to walk from one to the other. It is the absolute value of their difference. Remember that \(|x|\) is the distance of \(x\) from \(0\), so \(|-7| = 7\):
      \[ \text{distance} = |a - b|. \]
      For \(-4\) and \(3\): \(3 - (-4) = 7\) and \(-4 - 3 = -7\). The two differences are opposites, so both have absolute value 7. The order does not matter for a distance: \(|a - b| = |b - a|\). In a story, a temperature that goes from \(-5\) °C to \(4\) °C changes by \(4 - (-5) = 9\) degrees, and the two temperatures are \(|4 - (-5)| = 9\) degrees apart.</p>
      <h3>Traps to avoid</h3>
      <ul>
        <li>A minus sign can mean "subtract" or "negative". In \(2 - (-3)\) it means both, one after the other.</li>
        <li>\(2 - (-3)\) is not \(2 - 3\). Take the opposite of the number you subtract.</li>
        <li>Taking the smaller number from the larger one and dropping the sign is wrong. \(1 - 4 = -3\), not \(3\).</li>
        <li>A distance is never negative. If a difference comes out negative, take its absolute value.</li>
      </ul>
      <h3>What this lesson leaves out</h3>
      <p>This lesson uses integers only. The same rules also work for fractions and decimals, for example \(\tfrac{1}{2} - (-\tfrac{1}{4}) = \tfrac{3}{4}\). Multiplying and dividing integers are separate lessons.</p>`,
    check: [
      { q: String.raw`Which statement about 7 − (−4) is true?`,
        choices: [
          'It equals 3, because you subtract 4 from 7.',
          'It equals 11, because subtracting −4 is the same as adding its opposite, +4.',
          'It equals −11, because both numbers have minus signs.',
          'It equals −3, because the two minus signs make the answer negative.'], answer: 1,
        why: String.raw`Subtracting a number is adding its opposite. The opposite of −4 is 4, so 7 − (−4) = 7 + 4 = 11. On the number line the walker starts at 7 and moves 4 to the right. The answer 3 ignores the minus sign on the 4. The answers −11 and −3 treat the minus signs as if they made the answer negative. They do not: the second minus sign turns the subtraction into an addition.`,
        hint: String.raw`Rewrite 7 − (−4) as 7 plus the opposite of −4. Then decide whether the walker moves left or right.` },
      { q: String.raw`A submarine is at −40 m, which is 40 meters below sea level. It rises 15 meters. Then it dives 28 meters. A buoy floats at +10 m, 10 meters above sea level. How far is the submarine from the buoy at the end?`,
        choices: [
          '43 meters',
          '53 meters',
          '10 meters',
          '63 meters'], answer: 3,
        why: String.raw`Rising 15 meters: −40 + 15 = −25. Diving 28 meters: −25 − 28 = −25 + (−28) = −53. The distance to the buoy is |−53 − 10| = |−63| = 63 meters. Counting agrees: 53 meters up to sea level and 10 more up to the buoy. The answer 43 is |−53 + 10|, which adds the buoy height instead of finding a difference. The answer 53 is only the distance to sea level. The answer 10 is only the height of the buoy.`,
        hint: String.raw`Find the end position first, with two moves. Then take the absolute value of the difference between the buoy and the submarine.` },
      { q: String.raw`Dev works out −5 − (−8) like this. Step 1: −5 − (−8) = −5 − 8. Step 2: −5 − 8 = −13. His answer is −13. Which statement is correct?`,
        choices: [
          'Step 2 is wrong, because −5 − 8 = −3.',
          'There is no mistake, because subtracting a negative number is the same as subtracting a positive number.',
          'Step 1 is wrong. Subtracting −8 is adding its opposite, 8, so −5 − (−8) = −5 + 8 = 3.',
          'Step 1 is wrong. Subtracting means adding the number, so −5 − (−8) = −5 + (−8) = −13.'], answer: 2,
        why: String.raw`Step 2 is fine: −5 − 8 really is −13. The mistake is in Step 1. It changes −(−8) into −8, but subtracting −8 means adding the opposite of −8, which is +8. So −5 − (−8) = −5 + 8 = 3: start at −5 and move 8 to the right. The last answer says to add the number itself, but the rule is to add the opposite of the number you subtract.`,
        hint: String.raw`Check each step. Does Step 1 add the opposite of −8, or does it keep −8 as it is?` }
    ],
    links: { prereq: [], next: [], related: ['negative-numbers-and-absolute-value', 'rational-numbers-and-decimal-expansions', 'variables-and-relationships'] },

    mount({ stage, controls: C }) {
      const P = new Plane(stage, { span: 12 });
      const cv = P.canvas;
      if (P.coordEl) P.coordEl.style.display = 'none';
      cv.tabIndex = 0;
      cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', 'A number line from −12 to 12 or a board of positive and negative chips. Use the left and right arrow keys to move the main dot. The panel beside the picture reads out the numbers.');

      const st = { mode: 'explore', view: 'opp', p: 3, a: 2, op: 'sub', b: 5, A: -4, B: 3, prog: 1, mk: null, ghost: null, br: true, rev: true,
        cp: 0, cn: 0, cdone: false, cfb: '', pq: 0, pdone: false, ppick: {}, pfb: '',
        pi: 0, solved: false, wrongN: 0, picks: {}, fb: '', end: false };
      const tally = { done: 0, right: 0 };
      let cancel = () => {};

      /* ---------- chips ---------- */
      const chipPlan = () => (st.b === 0 ? 'Nothing to do, because b is 0.' : `${st.op === 'add' ? 'Put in' : 'Take out'} ${chipWords(st.b)}.`);
      const chipReset = () => {
        st.cp = Math.max(st.a, 0); st.cn = Math.max(-st.a, 0); st.cdone = false;
        st.cfb = `The board starts with ${chipWords(st.a)}. Plan: ${chipPlan().charAt(0).toLowerCase() + chipPlan().slice(1)}`;
      };
      const chipFinish = () => {
        const r = resOf(st.a, st.op, st.b);
        if (!st.cdone) return '';
        if (st.cp > 0 && st.cn > 0) return ' Some positive and negative chips are paired up. Cancel the zero pairs to read the answer.';
        const extra = st.op === 'sub' && st.b < 0 ? ' You took away negative chips, so the total went up.' : '';
        return ` ${ok('Done.')} ${fullEq(st.a, st.op, st.b)}. ${cap(chipWords(r))} left, the same answer as on the number line.${extra}`;
      };
      const addPair = () => {
        if (st.cp >= 12 || st.cn >= 12) { st.cfb = 'That is plenty of zero pairs. Try taking chips out now.'; sync(); return; }
        st.cp++; st.cn++;
        st.cfb = `You added one zero pair, a positive and a negative chip. It is worth 0, so the value is still ${nf(st.cp - st.cn)}.` + chipFinish();
        sync();
      };
      const cancelPairs = () => {
        const k = Math.min(st.cp, st.cn);
        if (!k) { st.cfb = 'There are no zero pairs to cancel.' + chipFinish(); sync(); return; }
        st.cp -= k; st.cn -= k;
        st.cfb = `You cancelled ${k} zero pair${k === 1 ? '' : 's'}.` + (st.cdone ? chipFinish() : ` ${cap(chipWords(st.cp - st.cn))} left.`);
        sync();
      };
      const doChipOp = () => {
        const n = ab(st.b), pos = st.b > 0, kind = pos ? 'positive' : 'negative';
        if (st.cdone) { st.cfb = 'You already did that move. Press Start over to try again.' + chipFinish(); sync(); return; }
        if (n === 0) { st.cdone = true; st.cfb = 'Nothing changes, because b is 0.' + chipFinish(); sync(); return; }
        if (st.op === 'add') {
          if (pos) st.cp += n; else st.cn += n;
          st.cdone = true; st.cfb = `You put in ${chipWords(st.b)}. The value is now ${nf(st.cp - st.cn)}.` + chipFinish();
        } else {
          const have = pos ? st.cp : st.cn;
          if (have < n) {
            st.cfb = `${no('Not enough chips.')} You must take out ${n} ${kind} chip${n === 1 ? '' : 's'}, but the board has only ${have}. Add zero pairs to get more. Each zero pair puts in one positive and one negative chip, so the value does not change.`;
            sync(); return;
          }
          if (pos) st.cp -= n; else st.cn -= n;
          st.cdone = true;
          st.cfb = `You took out ${chipWords(st.b)}. The value is now ${nf(st.cp - st.cn)}.` + chipFinish();
        }
        sync();
      };

      /* ---------- geometry ---------- */
      const lay = () => {
        const W = P.w || 400, H = P.h || 400, pad = clamp(W * .04, 12, 30), fs = clamp(Math.min(W, H * 1.2) * .036, 12.5, 20);
        const x0 = pad + 8, x1 = W - pad - 8, u = (x1 - x0) / 24, yL = H < 420 ? H * .58 : H * .5 + 20;
        return { W, H, fs, pad, x0, x1, u, X: v => x0 + (v + 12) * u, yL, ey: yL - Math.min(yL - fs * 1.9, 270) };
      };
      const axis = (c, p, g) => {
        const pal = p.pal, { X, yL, u, fs } = g;
        line(c, g.x0 - 8, yL, g.x1 + 8, yL, pal.blue, 3);
        tri(c, g.x0 - 8, yL, -1, 0, 8, pal.blue); tri(c, g.x1 + 8, yL, 1, 0, 8, pal.blue);
        for (let v = -12; v <= 12; v++) {
          const z = v === 0;
          line(c, X(v), yL - (z ? 9 : v % 2 ? 5 : 7), X(v), yL + (z ? 9 : v % 2 ? 5 : 7), z ? pal.violet : pal['grid-strong'], z ? 3 : 1.6);
          if (u >= 34 || (u >= 20 ? v % 2 === 0 : v % 4 === 0)) T(c, p, nf(v), X(v), yL + 22, { size: fs * (z ? 1.08 : 1), color: z ? pal.violet : pal.muted, weight: z ? 800 : 600 });
        }
      };
      /* labels under the line that never overlap: items sorted by x, put on the first free row */
      const stack = (c, p, g, items) => {
        const rows = [[], [], [], []];
        items.slice().sort((a, b) => a.x - b.x).forEach(it => {
          const w = mw(c, it.text, g.fs, 700) + 10;
          let r = 0; while (r < 3 && rows[r].some(([l, rr]) => it.x - w / 2 < rr + 4 && it.x + w / 2 > l - 4)) r++;
          rows[r].push([it.x - w / 2, it.x + w / 2]);
          const lx = clamp(it.x, w / 2 + 2, g.W - w / 2 - 2);
          T(c, p, it.text, lx, g.yL + 46 + r * (g.fs * 1.55), { size: g.fs, weight: 700, color: it.color });
        });
      };

      /* ---------- the four views ---------- */
      const drawLine = (c, p, g) => {
        const pal = p.pal, { X, yL, fs } = g, pr = st.mode === 'practice', pd = st.mode === 'predict';
        const a = st.a, m = moveOf(st.op, st.b), r = a + m, hide = (pr && !st.solved) || (pd && !st.pdone);
        T(c, p, fullEq(a, st.op, st.b, hide), g.W / 2, g.ey, { size: fs * 1.2, weight: 700 });
        axis(c, p, g);
        const col = m > 0 ? pal.green : m < 0 ? pal.red : pal.yellow, labels = [];
        const yh = yL - 14, hh = clamp(ab(m) * g.u * .55, 24, g.H * .3);
        if (st.prog > .01 && m !== 0) {
          const xe = X(a + m * st.prog);
          hop(c, X(a), xe, yh, hh, col);
          if (st.prog > .97) {
            const mx = (X(a) + X(r)) / 2;
            T(c, p, moveWords(m).replace('move', 'Move'), mx, yh - hh - 16 - fs * 1.5, { size: fs * 1.05, color: col, weight: 800 });
            T(c, p, st.op === 'sub' ? `subtract ${nf(st.b)} = add ${nf(-st.b)}` : `add ${nf(st.b)}`, mx, yh - hh - 16, { size: fs * .95, color: pal.muted, weight: 600 });
          }
        } else if (st.prog > .97 && m === 0) T(c, p, 'No move', X(a), yh - 24, { size: fs * 1.05, color: pal.muted, weight: 800 });
        disc(c, X(a), yL, 9, pal.yellow, pal.brass, 2.4);
        labels.push({ x: X(a), text: `start ${nf(a)}`, color: pal.text });
        if (st.mk != null) {
          const big = st.mk === a ? 15 : 11;
          disc(c, X(st.mk), yL, big, st.mk === a ? 'rgba(0,0,0,0)' : pal.yellow, pal.brass, 3.4);
          labels.push({ x: X(st.mk), text: st.mk === a ? 'marker (on start)' : `marker ${nf(st.mk)}`, color: pal.text });
        } else if (st.prog > .97 && !hide) {
          disc(c, X(r), yL, 10, pal.stage, col, 3.2);
          if (r !== a) labels.push({ x: X(r), text: `end ${nf(r)}`, color: col });
          else labels[0].text = `start and end ${nf(a)}`;
        }
        if (st.ghost != null) {
          const gx = X(clamp(st.ghost, -12, 12));
          disc(c, gx, yL, 10, pal.stage, pal.violet, 3.2);
          labels.push({ x: gx, text: `${pd ? 'your guess' : 'your pick'} ${nf(st.ghost)}`, color: pal.violet });
        }
        stack(c, p, g, labels);
      };
      const drawOpp = (c, p, g) => {
        const pal = p.pal, { X, yL, fs } = g, q = st.p, labels = [];
        axis(c, p, g);
        if (st.mode === 'practice' && !st.solved) {
          T(c, p, `The dot is at p = ${nf(q)}.`, g.W / 2, g.ey, { size: fs * 1.15, weight: 700 });
          disc(c, X(q), yL, 9, pal.yellow, pal.brass, 3);
          labels.push({ x: X(q), text: `p = ${nf(q)}`, color: pal.text });
          stack(c, p, g, labels);
          return;
        }
        if (q === 0) T(c, p, `0 is its own opposite: ${MINUS}(0) = 0`, g.W / 2, g.ey, { size: fs * 1.15, weight: 700 });
        else {
          T(c, p, `The opposite of ${nf(q)} is ${nf(-q)}.`, g.W / 2, g.ey, { size: fs * 1.15, weight: 700 });
          if (st.rev) T(c, p, `The opposite of ${nf(-q)} is ${nf(q)}: ${MINUS}(${nf(-q)}) = ${nf(q)}`, g.W / 2, g.ey + fs * 1.7, { size: fs * 1.05, weight: 700, color: pal.violet });
        }
        const yh = yL - 14, hh = clamp(ab(q) * g.u * .45, 20, g.H * .2);
        if (q !== 0) {
          hop(c, X(q), X(-q), yh, hh, pal.green, [7, 5]);
          T(c, p, 'flip 1', X(0), yh - hh - 12, { size: fs * .95, color: pal.green, weight: 700 });
          if (st.rev) {
            const h2 = hh + 34;
            hop(c, X(-q), X(q), yh, h2, pal.violet, [7, 5]);
            T(c, p, 'flip 2', X(0), yh - h2 - 12, { size: fs * .95, color: pal.violet, weight: 700 });
          }
        }
        disc(c, X(q), yL, 9, pal.yellow, pal.brass, 3);
        if (q !== 0) { disc(c, X(-q), yL, 9, pal.stage, pal.violet, 3); labels.push({ x: X(q), text: `p = ${nf(q)}`, color: pal.text }, { x: X(-q), text: `${MINUS}p = ${nf(-q)}`, color: pal.violet }); }
        else labels.push({ x: X(0), text: `p = 0 and ${MINUS}p = 0`, color: pal.text });
        stack(c, p, g, labels);
      };
      const drawDist = (c, p, g) => {
        const pal = p.pal, { X, yL, fs } = g, A = st.A, B = st.B, d = ab(A - B), by = yL - 60 - fs;
        const dv = st.mode === 'practice' && st.dv ? st.dv : null, chg = !!(dv && dv.change);
        const title = chg ? (st.br ? `change = new ${MINUS} old = ${nf(B)} ${MINUS} ${par(A)} = ${nf(B - A)}` : `change = new ${MINUS} old = ?`)
          : st.br ? `distance = |${nf(A)} ${MINUS} ${par(B)}| = |${nf(A - B)}| = ${d}` : `distance = |${nf(A)} ${MINUS} ${par(B)}| = ?`;
        T(c, p, title, g.W / 2, g.ey, { size: fs * 1.1, weight: 700 });
        axis(c, p, g);
        if (st.br) {
          line(c, X(A), by, X(B), by, pal.yellow, 3.4);
          line(c, X(A), by - 7, X(A), by + 7, pal.yellow, 3.4); line(c, X(B), by - 7, X(B), by + 7, pal.yellow, 3.4);
          line(c, X(A), by + 7, X(A), yL - 16, pal.yellow, 1.6, [4, 4]); line(c, X(B), by + 7, X(B), yL - 16, pal.yellow, 1.6, [4, 4]);
          T(c, p, chg ? (d === 0 ? 'no change' : `${d} degrees ${B > A ? 'warmer' : 'colder'}`) : d === 0 ? '0 steps apart' : `${d} steps apart`, (X(A) + X(B)) / 2, by - 16, { size: fs * 1.1, weight: 800 });
        } else {
          line(c, X(A), by, X(B), by, pal.muted, 2.4, [6, 5]);
          T(c, p, chg ? 'old to new: how big a change?' : 'How many steps apart?', (X(A) + X(B)) / 2, by - 16, { size: fs, color: pal.muted, weight: 700 });
        }
        disc(c, X(A), yL, 9, pal.yellow, pal.brass, 3); disc(c, X(B), yL, 9, pal.stage, pal.green, 3.2);
        stack(c, p, g, [{ x: X(A), text: `${dv ? dv.a : 'A'} = ${nf(A)}`, color: pal.text }, { x: X(B), text: `${dv ? dv.b : 'B'} = ${nf(B)}`, color: pal.green }]);
      };
      const chipAt = (c, p, x, y, d, pos) => {
        disc(c, x, y, d / 2, pos ? p.pal.yellow : p.pal.blue, pos ? p.pal.brass : p.pal.text, 1.8);
        c.font = font(d * .8, 800); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = pos ? '#2a2000' : '#ffffff';
        c.fillText(pos ? '+' : MINUS, x, y + d * .04);
      };
      const drawChips = (c, p, g) => {
        const pal = p.pal, { W, H, fs } = g, padX = Math.max(g.pad + 4, 14), avail = W - 2 * padX;
        const cp = st.cp, cn = st.cn, pairs = Math.min(cp, cn), lp = cp - pairs, ln = cn - pairs;
        T(c, p, `Chips: ${exprOf(st.a, st.op, st.b)}`, W / 2, fs * 1.9, { size: fs * 1.2, weight: 700 });
        const lh = fs * 1.8;
        const layout = d => {
          const pw = 2 * d + 10, pcols = Math.max(1, Math.floor((avail + 8) / (pw + 8))), ccols = Math.max(1, Math.floor((avail + 4) / (d + 4)));
          const hgt = lh + (pairs ? Math.ceil(pairs / pcols) * (d + 14) : 4) + (lp ? lh + Math.ceil(lp / ccols) * (d + 4) : 0) + (ln ? lh + Math.ceil(ln / ccols) * (d + 4) : 0);
          return { pw, pcols, ccols, hgt };
        };
        let d = clamp(avail / 11, 22, 46), L = layout(d);
        while (L.hgt > H - fs * 6.2 && d > 14) { d -= 2; L = layout(d); }
        let y = fs * 3.7;
        T(c, p, pairs ? `Zero pairs: ${pairs} (each pair is worth 0)` : 'Zero pairs: none yet', padX, y, { size: fs, align: 'left', color: pal.violet, weight: 700 });
        y += lh * .6;
        for (let i = 0; i < pairs; i++) {
          const x = padX + (i % L.pcols) * (L.pw + 8), yy = y + Math.floor(i / L.pcols) * (d + 14);
          rrect(c, x, yy, L.pw, d + 8, (d + 8) / 2); c.setLineDash([5, 4]); c.strokeStyle = pal.violet; c.lineWidth = 2; c.stroke(); c.setLineDash([]);
          chipAt(c, p, x + 5 + d / 2, yy + 4 + d / 2, d, true); chipAt(c, p, x + 5 + d * 1.5, yy + 4 + d / 2, d, false);
        }
        y += (pairs ? Math.ceil(pairs / L.pcols) * (d + 14) : 4) + lh * .4;
        const rowOf = (n, pos) => {
          T(c, p, `Extra ${pos ? 'positive' : 'negative'} chips: ${n}`, padX, y, { size: fs, align: 'left', weight: 700 }); y += lh * .6;
          for (let i = 0; i < n; i++) chipAt(c, p, padX + d / 2 + (i % L.ccols) * (d + 4), y + d / 2 + Math.floor(i / L.ccols) * (d + 4), d, pos);
          y += Math.ceil(n / L.ccols) * (d + 4) + lh * .4;
        };
        if (lp) rowOf(lp, true);
        if (ln) rowOf(ln, false);
        if (!cp && !cn) T(c, p, 'The board is empty. Its value is 0.', W / 2, y + d, { size: fs * 1.05, color: pal.muted, weight: 700 });
        T(c, p, `${cp} positive, ${cn} negative: value ${nf(cp - cn)}`, W / 2, H - fs * 1.3, { size: fs * 1.1, weight: 800 });
      };
      P.onDraw = (c, p) => {
        const g = lay();
        if (st.view === 'opp') drawOpp(c, p, g); else if (st.view === 'dist') drawDist(c, p, g);
        else if (st.view === 'chips') drawChips(c, p, g); else drawLine(c, p, g);
      };
      const draw = () => P.draw();
      const walk = () => { cancel(); st.prog = 0; draw(); cancel = animateTo(st, { prog: 1 }, 900, draw); };

      /* ---------- dragging, keys ---------- */
      const handles = () => {
        const g = lay(), out = [];
        if (st.mode === 'practice') { if (PR[st.pi].t === 'place' && !st.solved) out.push({ id: 'mk', x: g.X(st.mk) }); return out; }
        if (st.mode === 'predict') return out;
        if (st.view === 'opp') out.push({ id: 'p', x: g.X(st.p) });
        else if (st.view === 'line') out.push({ id: 'a', x: g.X(st.a) }, { id: 'e', x: g.X(st.a + moveOf(st.op, st.b)) });
        else if (st.view === 'dist') out.push({ id: 'A', x: g.X(st.A) }, { id: 'B', x: g.X(st.B) });
        return out;
      };
      const setVal = (id, v) => {
        if (id === 'p') st.p = clamp(v, -8, 8);
        else if (id === 'a') { st.a = clamp(v, -6, 6); }
        else if (id === 'e') st.b = clamp(st.op === 'add' ? v - st.a : st.a - v, -6, 6);
        else if (id === 'A') st.A = clamp(v, -10, 10);
        else if (id === 'B') st.B = clamp(v, -10, 10);
        else if (id === 'mk') { st.mk = clamp(v, -12, 12); st.fb = ''; }
        if (st.view === 'chips') chipReset();
        if (id !== 'mk') st.prog = 1;
        sync();
      };
      const valOf = id => (id === 'p' ? st.p : id === 'a' ? st.a : id === 'e' ? st.b : id === 'A' ? st.A : id === 'B' ? st.B : st.mk);
      let drag = null;
      const ptr = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      const pick = (px, py, touch) => {
        const g = lay(), rad = touch ? 34 : 26; let best = null, bd = 1e9;
        if (ab(py - g.yL) > 90) return null;
        for (const hd of handles()) { const dd = ab(hd.x - px); if (dd < rad && dd <= bd) { best = hd.id; bd = dd; } }
        return best;
      };
      const toVal = px => { const g = lay(); return Math.round((px - g.x0) / g.u - 12); };
      cv.addEventListener('pointerdown', e => {
        const [px, py] = ptr(e), id = pick(px, py, e.pointerType === 'touch');
        if (!id) return;
        drag = id; cv.setPointerCapture(e.pointerId); e.preventDefault(); cancel(); setVal(id, toVal(px));
      });
      cv.addEventListener('pointermove', e => {
        const [px, py] = ptr(e);
        if (drag) setVal(drag, toVal(px)); else cv.style.cursor = pick(px, py, false) ? 'grab' : 'default';
      });
      const endDrag = () => { drag = null; };
      cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);
      cv.addEventListener('keydown', e => {
        const hs = handles(); if (!hs.length) return;
        const hd = hs[hs.length - 1], dv = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
        if (!dv) return;
        e.preventDefault(); cancel();
        if (hd.id === 'e') setVal('e', st.a + moveOf(st.op, st.b) + dv); else setVal(hd.id, valOf(hd.id) + dv);
      });

      /* ---------- the side panel ---------- */
      const probe = C.readout(), host = probe.parentElement; probe.remove();
      const btn = (label, onClick, primary, extra = '') => {
        const b = h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
        b.style.cssText = 'padding:8px 14px;min-height:44px;min-width:44px;font-size:.95rem;' + extra; return b;
      };
      const row = (...kids) => h('div', { style: 'display:flex;flex-wrap:wrap;gap:8px;align-items:center' }, ...kids);
      const group = style => { const g = h('div', { style: 'display:flex;flex-direction:column;gap:12px;flex:none;' + (style || '') }); host.append(g); return g; };
      const choiceList = items => h('div', { style: 'display:flex;flex-direction:column;gap:8px;margin:10px 0 4px' }, items.map(it => {
        const b = h('button', { type: 'button', class: 'choice' + (it.state ? ' ' + it.state : ''), html: it.label, onclick: it.onClick });
        Object.assign(b.style, { borderRadius: '12px', textAlign: 'left', width: '100%', minHeight: '44px' }); b.disabled = !!it.state; return b;
      }));
      const para = (html, style = '') => h('p', { html, style: 'margin:0 0 8px;' + style });
      const sgn = v => (v > 0 ? '+' : '') + nf(v);

      C.title('Explore');
      const modeRow = row(); host.append(modeRow);
      const MODES = [['opp', 'Opposites'], ['line', 'Number line'], ['dist', 'Distance'], ['chips', 'Chips'], ['predict', 'Predict']];
      const modeBtns = MODES.map(([id, name]) => { const b = btn(name, () => goMode(id)); modeRow.append(b); return [id, b]; });

      const gOpp = group(), gNum = group(), gDist = group();
      const mvLast = g => g.append(host.lastElementChild);
      const slP = C.slider({ label: 'p (a number)', min: -8, max: 8, step: 1, value: 3, format: sgn, onInput: v => { cancel(); st.p = v; sync(); } }); mvLast(gOpp);
      const slA = C.slider({ label: 'a (where the walker starts)', min: -6, max: 6, step: 1, value: 2, format: sgn, onInput: v => { cancel(); st.a = v; if (st.view === 'chips') chipReset(); st.prog = 1; sync(); } }); mvLast(gNum);
      const opBtns = C.buttons([
        { label: 'Add (a + b)', onClick: () => setOp('add') }, { label: 'Subtract (a − b)', onClick: () => setOp('sub') }]); mvLast(gNum);
      const slB = C.slider({ label: 'b (the number you add or subtract)', min: -6, max: 6, step: 1, value: 5, format: sgn, onInput: v => { cancel(); st.b = v; if (st.view === 'chips') chipReset(); st.prog = 1; sync(); } }); mvLast(gNum);
      const walkBtn = btn('Walk it again', () => walk()); gNum.append(row(walkBtn));
      const slDA = C.slider({ label: 'A', min: -10, max: 10, step: 1, value: -4, format: sgn, onInput: v => { st.A = v; sync(); } }); mvLast(gDist);
      const slDB = C.slider({ label: 'B', min: -10, max: 10, step: 1, value: 3, format: sgn, onInput: v => { st.B = v; sync(); } }); mvLast(gDist);
      const ro = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); host.append(ro);
      C.title('Practice');
      const gPr = group(); gPr.setAttribute('aria-live', 'polite');

      const setOp = op => { cancel(); st.op = op; if (st.view === 'chips') chipReset(); st.prog = 1; sync(); };
      const enterExplore = view => {
        Object.assign(st, { mode: 'explore', view, prog: 1, mk: null, ghost: null, br: true, rev: true, dv: null, picks: {}, fb: '', end: false });
        if (view === 'chips') chipReset();
      };
      const enterPredict = i => {
        const it = PRED[i];
        Object.assign(st, { mode: 'predict', view: 'line', pq: i, a: it.a, op: it.op, b: it.b, prog: 0, mk: null, ghost: null, pdone: false, ppick: {}, pfb: '', picks: {}, fb: '', end: false });
      };
      const goMode = id => { cancel(); if (id === 'predict') enterPredict(st.pq); else enterExplore(id); sync(); if (id === 'line') walk(); };

      /* ---------- explore text ---------- */
      const oppText = () => {
        const q = st.p;
        if (q === 0) return [`<b>p = 0</b>. The opposite of 0 is 0. Zero is its own opposite.`, 'Move the dot. Every other number has an opposite on the other side of 0.'];
        return [`<b>p = ${nf(q)}</b> and its opposite is <b>${MINUS}p = ${nf(-q)}</b>.`,
          `Each is ${ab(q)} step${ab(q) === 1 ? '' : 's'} from 0, on opposite sides. Flip again and you are back: ${MINUS}(${nf(-q)}) = ${nf(q)}.`,
          q < 0 ? `Here p is negative, so its opposite ${MINUS}p is positive. The minus sign in front of p does not always make a number negative.` : ''];
      };
      const lineText = () => {
        const { a, op, b } = st, m = moveOf(op, b), r = a + m, out = [`<b>${fullEq(a, op, b)}</b>`];
        out.push(`Start at ${nf(a)}. ${cap(whyDir(op, b))}${b === 0 ? '' : op === 'add' ? `, so ${moveWords(m)}` : ` (${stepsW(m)})`}. You land on ${nf(r)}.`);
        if (op === 'sub' && b < 0) out.push('Subtracting a negative number moves the walker right, so the answer is greater than the start.');
        if (op === 'sub' && b > 0) out.push('Subtracting a positive number moves the walker left, so the answer is less than the start.');
        out.push('Drag the start or end dot, use the sliders and the Add and Subtract buttons, or press the arrow keys.');
        return out;
      };
      const distText = () => {
        const { A, B } = st, d = ab(A - B);
        return [`<b>A = ${nf(A)}, B = ${nf(B)}</b>`,
          `A ${MINUS} B = ${nf(A)} ${MINUS} ${par(B)} = ${nf(A - B)}. B ${MINUS} A = ${nf(B)} ${MINUS} ${par(A)} = ${nf(B - A)}.`,
          `The two differences are opposites, so both have absolute value ${d}. The distance is |A ${MINUS} B| = ${d}${d === 0 ? ': the two points are the same spot' : `: it takes ${stepsW(d)} to walk from one to the other`}.`];
      };
      const chipUI = () => {
        const out = [para(`<b>${exprOf(st.a, st.op, st.b)} with chips</b>`)];
        out.push(para(`${kk('Rule')} A positive chip and a negative chip make a zero pair, worth 0. You can add zero pairs without changing the value.`));
        const opL = st.b === 0 ? 'Do the move (b is 0)' : `${st.op === 'add' ? 'Put in' : 'Take out'} ${chipWords(st.b)}`;
        out.push(row(btn(opL, doChipOp, true), btn('Add a zero pair', addPair), btn('Cancel zero pairs', cancelPairs), btn('Start over', () => { chipReset(); sync(); })));
        out.push(para(st.cfb, 'margin-top:8px'));
        out.push(para('Change a and b with the sliders and the Add and Subtract buttons.', 'color:var(--muted)'));
        return out;
      };
      const predictUI = () => {
        const it = PRED[st.pq], out = [para(`<b>${it.q}</b>`)];
        out.push(para(st.pdone ? '' : `${kk('Predict')} Pick one before the walker moves.`));
        out.push(choiceList(it.choices.map((ch, i) => ({ label: ch.t, state: st.ppick[i], onClick: () => {
          cancel(); st.ppick[i] = ch.ok ? 'right' : 'wrong'; st.pfb = (ch.ok ? ok('Yes. ') : no('Not quite. ')) + ch.why;
          if (ch.ok) { st.pdone = true; st.ghost = null; walk(); } else st.ghost = ch.v;
          sync();
        } }))));
        out.push(h('p', { style: 'margin:6px 0 10px;', html: st.pfb }));
        if (st.pdone) out.push(row(btn('Check it with chips', () => { cancel(); enterExplore('chips'); sync(); }, true),
          btn('Next prediction', () => { cancel(); enterPredict((st.pq + 1) % PRED.length); sync(); }), btn('Try your own numbers', () => { cancel(); enterExplore('line'); sync(); walk(); })));
        return out;
      };
      const renderRo = () => {
        if (st.mode === 'predict') return predictUI();
        if (st.view === 'chips') return chipUI();
        const t = st.view === 'opp' ? oppText() : st.view === 'dist' ? distText() : lineText();
        return t.filter(Boolean).map((s, i) => para(s, i === t.length - 1 && st.view !== 'dist' ? 'color:var(--muted)' : ''));
      };

      /* ---------- practice ---------- */
      const choicesOf = arr => arr.map(([t, okk, why, v]) => ({ t, ok: !!okk, why, v }));
      const placeP = (a, op, b, q) => ({ t: 'place', a, op, b, q, setup() { Object.assign(st, { view: 'line', a, op, b, mk: a, prog: 0 }); } });
      const PR = [
        placeP(-3, 'add', 5, 'A walker starts at −3. Add 5: find −3 + 5. Move the marker to where the walker lands, then press Check.'),
        { t: 'pick', q: 'The dot is at −7. What is −(−7), the opposite of −7?', setup() { Object.assign(st, { view: 'opp', p: -7, rev: false }); },
          choices: choicesOf([
            ['7', 1, 'The opposite of −7 is 7: the same distance from 0, on the other side. So −(−7) = 7. It is the same fact as −(−3) = 3.'],
            ['−7', 0, 'That is the number you started with. The opposite is on the other side of 0, so it cannot still be −7.'],
            ['0', 0, 'Only 0 is its own opposite. −7 is 7 steps from 0, so its opposite is 7 steps from 0 on the other side.'],
            ['14', 0, '14 is the distance from −7 to 7, the whole length of the flip. The opposite is the number you land on, which is 7.']]) },
        placeP(3, 'sub', 8, 'A walker starts at 3. Subtract 8: find 3 − 8. Move the marker to where the walker lands, then press Check.'),
        { t: 'pick', q: 'Find −4 − (−6). The walker starts at −4. Where does it land?', setup() { Object.assign(st, { view: 'line', a: -4, op: 'sub', b: -6, mk: null, prog: 0 }); },
          choices: choicesOf([
            ['−10', 0, 'That treats −4 − (−6) as −4 − 6. But subtracting −6 is adding its opposite, +6, which moves right, not left.', -10],
            ['−2', 0, 'That is −6 + 4: the right numbers in the wrong order. Start at −4 and move 6 to the right.', -2],
            ['2', 1, '−4 − (−6) = −4 + 6. The opposite of −6 is 6, a positive number, so the walker moves 6 to the right and lands on 2.', 2],
            ['10', 0, 'That ignores the signs and adds 4 and 6. The walker starts at −4 and moves only 6 steps right, so it reaches 2.', 10]]) },
        { t: 'pick', q: 'A diver is at −12 m, which is 12 meters below sea level. A gull is at +5 m, which is 5 meters above sea level. How far apart are they?', setup() { Object.assign(st, { view: 'dist', A: -12, B: 5, br: false, dv: { a: 'diver', b: 'gull' } }); },
          choices: choicesOf([
            ['7 meters', 0, 'That is −12 + 5 = −7 with the sign dropped. A distance is not a sum. Count 12 steps up to 0 and 5 more: 17.'],
            ['17 meters', 1, 'The distance is |5 − (−12)| = |17| = 17. You can count it too: 12 meters up to sea level, then 5 more.'],
            ['−17 meters', 0, '5 − (−12) = 17 and −12 − 5 = −17 are both correct differences. But a distance is a length and is never negative. Take the absolute value: 17.'],
            ['5 meters', 0, 'That is only the gull\'s height above sea level. The diver is 12 meters below sea level, so you must also cross those 12 meters.']]) },
        { t: 'pick', q: 'Chips: you start with 1 positive chip and want 1 − (−4). That means taking out 4 negative chips, but the board has none. What is the smallest number of zero pairs you can add so you can take out 4 negative chips?', setup() { Object.assign(st, { view: 'chips', a: 1, op: 'sub', b: -4, cp: 1, cn: 0 }); },
          choices: choicesOf([
            ['0 zero pairs', 0, 'You cannot take out chips that are not on the board. Zero pairs make negative chips appear without changing the value.'],
            ['1 zero pair', 0, 'One zero pair brings only 1 negative chip. You need 4 negative chips to take out.'],
            ['3 zero pairs', 0, 'Three zero pairs give 3 negative chips, one short. You need 4 to take out.'],
            ['4 zero pairs', 1, 'Each zero pair brings one negative chip, so 4 pairs give the 4 you need. The board has 5 positive and 4 negative chips, still worth 1. Take out the 4 negative chips and 5 positive chips are left: 1 − (−4) = 5.']]) },
        { t: 'pick', q: 'At 6 am it was −5 °C. At noon it was 4 °C. Which calculation gives the change in temperature from 6 am to noon?', setup() { Object.assign(st, { view: 'dist', A: -5, B: 4, br: false, dv: { a: '6 am', b: 'noon', change: true } }); },
          choices: choicesOf([
            ['−5 − 4 = −9, so it warmed up 9 degrees', 0, '−5 − 4 = −9 would be the change going from 4 °C down to −5 °C, the trip the other way. A change is the new value minus the old value.'],
            ['4 − 5 = −1, so it cooled 1 degree', 0, 'That drops the minus sign on −5. The old temperature is −5, so you subtract −5, which is adding 5.'],
            ['4 − (−5) = 9, so it warmed up 9 degrees', 1, 'Change = new minus old = 4 − (−5) = 4 + 5 = 9. It warmed up 9 degrees: 5 degrees to reach 0 and 4 more.'],
            ['−5 + 4 = −1, so it cooled 1 degree', 0, 'That adds the two temperatures. A change compares them, so you subtract: new minus old.']]) },
        placeP(-2, 'sub', -7, 'A walker starts at −2. Subtract −7: find −2 − (−7). Move the marker to where the walker lands, then press Check.')
      ];
      const startPractice = i => {
        cancel();
        Object.assign(st, { mode: 'practice', pi: i, solved: false, wrongN: 0, picks: {}, fb: '', end: false, ghost: null, mk: null, prog: 0, rev: false, br: false, dv: null });
        PR[i].setup();
        sync();
      };
      const solve = () => {
        if (st.solved) return;
        st.solved = true; tally.done++; if (!st.wrongN) tally.right++;
        st.ghost = null; cancel();
        if (st.view === 'line') cancel = animateTo(st, { prog: 1 }, 800, draw);
        else if (st.view === 'opp') st.rev = true;
        else if (st.view === 'dist') st.br = true;
        else if (st.view === 'chips') { st.cp = 5; st.cn = 4; }
      };
      const pickChoice = i => {
        const q = PR[st.pi], ch = q.choices[i];
        st.picks['c' + i] = ch.ok ? 'right' : 'wrong'; st.fb = (ch.ok ? ok('Yes. ') : no('Not quite. ')) + ch.why;
        if (ch.ok) solve(); else { st.wrongN++; if (ch.v != null) st.ghost = ch.v; }
        sync();
      };
      const checkPlace = () => {
        const q = PR[st.pi], m = moveOf(q.op, q.b), r = q.a + m, mk = st.mk;
        if (mk === r) { st.fb = `${ok('Yes.')} ${fullEq(q.a, q.op, q.b)}. ${cap(whyDir(q.op, q.b))}: ${moveWords(m)}, from ${nf(q.a)} to ${nf(r)}.`; solve(); }
        else {
          st.wrongN++;
          let s = `${no('Not yet.')} The marker is at ${nf(mk)}. `;
          if (mk === q.a) s += 'That is the start, so the walker has not moved. ';
          else if (m !== 0 && mk === q.a - m) s += 'That is the right distance but the wrong way. ';
          else if (q.op === 'sub' && mk === q.a + q.b) s += `That is ${nf(q.a)} + ${par(q.b)}, which adds ${nf(q.b)}. But this problem subtracts. `;
          else s += `That is ${stepsW(mk - q.a)} ${dirOf(mk - q.a)} of the start. `;
          st.fb = s + `Remember: ${whyDir(q.op, q.b)}. So the walker should ${moveWords(m)}.`;
        }
        sync();
      };
      const backToExplore = () => { cancel(); enterExplore('line'); sync(); walk(); };
      const renderPractice = () => {
        const out = [];
        if (st.mode !== 'practice') {
          out.push(para(`${PR.length} problems. Move a marker or pick an answer. Every answer is explained.`));
          out.push(btn('Start practice', () => startPractice(0), true));
          if (tally.done) out.push(para(`So far: ${tally.right} of ${tally.done} right on the first try.`, 'margin-top:8px;color:var(--muted)'));
          return out;
        }
        if (st.end) {
          out.push(para(`<b>Done.</b> You got ${tally.right} of ${PR.length} right on the first try.`));
          out.push(para(tally.right === PR.length ? 'Every one. Subtracting is adding the opposite.' : 'Missed ones are fine. Read the explanations again, then try once more.'));
          out.push(row(btn('Start again', () => { tally.done = 0; tally.right = 0; startPractice(0); }, true), btn('Back to exploring', backToExplore)));
          return out;
        }
        const q = PR[st.pi];
        out.push(para(`${kk(`Problem ${st.pi + 1} of ${PR.length}`)} Tally: ${tally.right} of ${tally.done} right on the first try`));
        out.push(para(`<b>${q.q}</b>`));
        if (q.t === 'place') {
          if (!st.solved) out.push(row(btn('◀ 1 left', () => setVal('mk', st.mk - 1)), btn('1 right ▶', () => setVal('mk', st.mk + 1)), btn('Check', checkPlace, true)));
          out.push(para(`Marker: ${nf(st.mk)}`, 'margin-top:8px;color:var(--muted)'));
        } else out.push(choiceList(q.choices.map((ch, i) => ({ label: ch.t, state: st.picks['c' + i], onClick: () => pickChoice(i) }))));
        out.push(h('p', { style: 'margin:6px 0 10px;', html: st.fb }));
        const acts = [];
        if (st.solved) acts.push(btn(st.pi + 1 < PR.length ? 'Next problem' : 'See my tally', () => { cancel(); if (st.pi + 1 < PR.length) startPractice(st.pi + 1); else { st.end = true; sync(); } }, true));
        acts.push(btn('Back to exploring', backToExplore));
        out.push(row(...acts));
        return out;
      };

      /* ---------- sync everything ---------- */
      const sync = () => {
        const pr = st.mode === 'practice', ex = st.mode === 'explore', v = st.view;
        modeRow.style.display = pr ? 'none' : '';
        gOpp.style.display = ex && v === 'opp' ? 'flex' : 'none';
        gNum.style.display = ex && (v === 'line' || v === 'chips') ? 'flex' : 'none';
        gDist.style.display = ex && v === 'dist' ? 'flex' : 'none';
        walkBtn.parentElement.style.display = v === 'line' ? 'flex' : 'none';
        ro.style.display = pr ? 'none' : '';
        for (const [id, b] of modeBtns) { const on = id === 'predict' ? st.mode === 'predict' : ex && id === v; b.className = on ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', on); }
        opBtns.forEach((b, i) => { const on = (i === 0) === (st.op === 'add'); b.className = on ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', on); });
        slP.set(st.p); slA.set(st.a); slB.set(st.b); slDA.set(st.A); slDB.set(st.B);
        ro.replaceChildren(...renderRo());
        gPr.replaceChildren(...renderPractice());
        draw();
      };

      /* ---------- guided steps ---------- */
      const apply = (patch, immediate) => {
        cancel();
        const { view = 'line', a, op, b, p, A, B, pq } = patch;
        if (a !== undefined) st.a = a;
        if (op !== undefined) st.op = op;
        if (b !== undefined) st.b = b;
        if (p !== undefined) st.p = p;
        if (A !== undefined) st.A = A;
        if (B !== undefined) st.B = B;
        if (view === 'predict') enterPredict(pq || 0); else enterExplore(view);
        sync();
        if (!immediate && view === 'line') walk();
      };
      apply({ view: 'opp', p: 3 }, true);
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
