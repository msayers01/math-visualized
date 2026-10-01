/* =====================================================================
   SCHOOL — Sample spaces and probability
   ===================================================================== */
{
  /* ---------- small helpers ---------- */
  const SANS = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
  const fnt = (size, weight = 600) => `${weight} ${size}px ${SANS}`;
  const txt = (c, p, s, x, y, { size = 13, color, align = 'center', weight = 600, halo = true } = {}) => {
    c.font = fnt(size, weight); c.textAlign = align; c.textBaseline = 'middle';
    if (halo) { c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(s, x, y); }
    c.fillStyle = color || p.pal.text; c.fillText(s, x, y);
  };
  const rr = (c, x, y, w, hh, r) => {
    r = Math.min(r, w / 2, hh / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + hh, r); c.arcTo(x + w, y + hh, x, y + hh, r); c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  const ln = (c, x0, y0, x1, y1, color, width = 1.5, dash) => {
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.strokeStyle = color; c.lineWidth = width; c.setLineDash(dash || []); c.lineCap = 'round'; c.stroke(); c.setLineDash([]);
  };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; };
  const okT = t => `<b style="color:var(--green)">${t}</b>`;
  const noT = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = (a, b) => `<span class="k">${a}</span> ${b}`;
  const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
  const list = a => a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];

  /* a fraction n/d turned into its forms. term = the decimal ends. */
  const conv = (n, d) => {
    const g = gcd(n, d), rn = n / g, rd = d / g, v = n / d;
    let t = rd; while (t % 2 === 0) t /= 2; while (t % 5 === 0) t /= 5;
    const term = t === 1;
    return { rn, rd, v, term, frac: rd === 1 ? String(rn) : `${rn}/${rd}`,
      decT: term ? String(+v.toFixed(6)) : v.toFixed(3) + '… (about ' + v.toFixed(2) + ')',
      decS: term ? String(+v.toFixed(6)) : '≈ ' + v.toFixed(2),
      pctT: term ? String(+(v * 100).toFixed(4)) + '%' : 'about ' + (v * 100).toFixed(1) + '%',
      pctS: term ? String(+(v * 100).toFixed(4)) + '%' : '≈ ' + (v * 100).toFixed(1) + '%' };
  };
  const convLines = (n, d) => {
    const q = conv(n, d);
    return [kk('Fraction', `${n}/${d}` + (q.rd !== d ? ` = ${q.frac}` : '')),
      kk('Decimal', `${n} ÷ ${d} = ${q.decT}`),
      kk('Percent', `${q.term ? q.decT : q.v.toFixed(3) + '…'} × 100 = ${q.pctT}`)].join('<br>');
  };

  /* ---------- the experiments ---------- */
  const mkDie = () => [1, 2, 3, 4, 5, 6].map(v => ({ id: 'd' + v, lab: String(v), name: String(v), pic: 'die', v }));
  const mkCoin = () => [['H', 'heads'], ['T', 'tails']].map(([s, nm]) => ({ id: s, lab: s, name: nm, pic: 'coin', s }));
  const mkTwo = () => ['HH', 'HT', 'TH', 'TT'].map(s => ({ id: s, lab: s, name: s, pic: 'two', s, heads: [...s].filter(x => x === 'H').length }));
  const mkBag = () => ['R1', 'R2', 'R3', 'B1', 'B2', 'G1'].map(s => ({ id: s, lab: s, name: 'marble ' + s, pic: 'marble', col: { R: 'red', B: 'blue', G: 'green' }[s[0]] }));
  const mkDice = () => { const o = []; for (let x = 1; x <= 6; x++) for (let y = 1; y <= 6; y++) o.push({ id: x + '-' + y, x, y, sum: x + y, name: `(${x}, ${y})` }); return o; };

  const SCN = {
    coin: { short: 'Flip a coin', title: 'Flip a coin', kind: 'chips', out: mkCoin(), decoys: [],
      ok: 'A fair coin lands on either side equally often, so the two outcomes are equally likely.' },
    die: { short: 'Roll a die', title: 'Roll a die', kind: 'chips', out: mkDie(), decoys: [],
      ok: 'A fair die lands on each face equally often, so the six outcomes are equally likely.' },
    two: { short: 'Flip two coins', title: 'Flip two coins, one after the other', kind: 'chips', out: mkTwo(),
      decoys: [{ id: 'one', lab: '1 head', pic: 'txt', why: '"1 head" is not one outcome. It can happen in two ways: the first coin is heads (HT) or the second coin is heads (TH). List those two separately.' }],
      ok: 'The coins are flipped one after the other, so HT (heads first) and TH (tails first) are different outcomes. All four are equally likely.' },
    bag: { short: 'Marble bag', title: 'Pick one marble: 3 red, 2 blue, 1 green', kind: 'chips', out: mkBag(),
      decoys: [
        { id: 'cR', lab: 'Red', pic: 'txt', why: '"Red" is not one outcome. You could grab R1, R2 or R3. Colors are not equally likely (3 red marbles, 1 green marble), so list each marble.' },
        { id: 'cB', lab: 'Blue', pic: 'txt', why: '"Blue" is not one outcome. You could grab B1 or B2. List each marble so every outcome has the same chance.' },
        { id: 'cG', lab: 'Green', pic: 'txt', why: 'Listing "Green" next to "Red" would make them look equally likely, but red can happen 3 ways and green only 1. List each marble.' }],
      ok: 'Each marble is equally likely to be the one you grab. Red has 3 of the 6 outcomes and green has only 1, so the colors are not equally likely, but the marbles are.' },
    dice: { short: 'Roll two dice', title: 'Roll two dice, one after the other', kind: 'grid', out: mkDice(), decoys: [],
      ok: 'There are 6 × 6 = 36 pairs, and each pair is equally likely. The sums are not: a sum of 7 has 6 pairs, a sum of 12 has only 1.' }
  };
  const SP = ['coin', 'die', 'two', 'bag', 'dice'];

  /* events for the "choose an event" mode */
  const EV = [
    { sc: 'die', label: 'Die: an even number', q: 'You roll a die. What is the probability of rolling an even number?', test: o => o.v % 2 === 0, rule: 'An even number is 2, 4 or 6. The odd numbers are 1, 3 and 5.' },
    { sc: 'die', label: 'Die: greater than 4', q: 'You roll a die. What is the probability of rolling a number greater than 4?', test: o => o.v > 4, rule: 'Greater than 4 means 5 or 6. The 4 itself is not greater than 4.' },
    { sc: 'two', label: 'Two coins: exactly one head', q: 'You flip two coins. What is the probability of exactly one head?', test: o => o.heads === 1, rule: 'Exactly one head means HT or TH. HH has two heads and TT has none.' },
    { sc: 'bag', label: 'Marbles: red or blue', q: 'You pick one marble from a bag of 3 red, 2 blue and 1 green marble. What is the probability that it is red or blue?', test: o => o.col !== 'green', rule: 'Every red marble and every blue marble counts: R1, R2, R3, B1 and B2. Only G1 is left out.' },
    { sc: 'dice', label: 'Two dice: both the same', q: 'You roll two dice. What is the probability that both show the same number?', test: o => o.x === o.y, rule: 'Both the same means (1, 1), (2, 2), (3, 3), (4, 4), (5, 5) and (6, 6).' },
    { sc: 'dice', label: 'Two dice: first die 5 or 6', q: 'You roll two dice. What is the probability that the first die shows 5 or 6?', test: o => o.x >= 5, rule: 'The first die is the row. Rows 5 and 6 count, and in each of those rows every second-die number counts.' }
  ];
  /* events for the "impossible, certain and opposite" mode */
  const LM = [
    { sc: 'die', label: 'Die: rolling a 7', q: 'You roll a die. What is the probability of rolling a 7?', test: () => false, rule: 'A die only shows 1 to 6, so none of the outcomes is a 7. Tap nothing.' },
    { sc: 'bag', label: 'Marbles: a purple marble', q: 'You pick one marble from a bag of 3 red, 2 blue and 1 green marble. What is the probability that it is purple?', test: () => false, rule: 'There is no purple marble in the bag, so none of the outcomes is purple. Tap nothing.' },
    { sc: 'die', label: 'Die: a number from 1 to 6', q: 'You roll a die. What is the probability of rolling a number from 1 to 6?', test: () => true, rule: 'Every face shows a number from 1 to 6, so every outcome is in the event. Tap them all.' },
    { sc: 'two', label: 'Two coins: at least one head', q: 'You flip two coins. What is the probability of at least one head?', test: o => o.heads >= 1, rule: 'At least one head means one head or two heads: HH, HT or TH. Only TT has no head.' },
    { sc: 'die', label: 'Die: an even number', q: 'You roll a die. What is the probability of rolling an even number?', test: o => o.v % 2 === 0, rule: 'An even number is 2, 4 or 6.' }
  ];
  /* the dart board: 10 by 10 squares. x < a is red, the right part is blue above the line b and green below it. */
  const REG = { red: 'Red', blue: 'Blue', green: 'Green' };
  const areaOf = (r, a, b) => r === 'red' ? 10 * a : r === 'blue' ? (10 - a) * b : (10 - a) * (10 - b);
  const AR = [
    { kind: 'read', label: 'Read the board: green', a: 5, b: 4, region: 'green', q: 'A dart lands at a random spot on a square board. The board is 10 squares wide and 10 squares tall, so it has 100 small squares. What is the probability that the dart lands in the green region?' },
    { kind: 'read', label: 'Read the board: red', a: 2, b: 5, region: 'red', q: 'A dart lands at a random spot on a square board of 100 small squares (10 by 10). What is the probability that the dart lands in the red region?' },
    { kind: 'build', label: 'Build: red is 1/4', a: 5, b: 4, region: 'red', target: 25, q: 'Drag the handles so that a dart lands in the red region with probability 1/4 (25 of the 100 squares).' },
    { kind: 'build', label: 'Build: blue is 20%', a: 5, b: 5, region: 'blue', target: 20, q: 'Drag the handles so that a dart lands in the blue region with probability 20% (20 of the 100 squares).' }
  ];
  const MODES = [{ id: 'space', name: '1 Sample space' }, { id: 'event', name: '2 Events' }, { id: 'area', name: '3 Area' }, { id: 'limits', name: '4 Limits' }];
  const TASKS = { space: SP.map(id => ({ label: SCN[id].short })), event: EV, area: AR, limits: LM };

  /* ---------- the "check my probability" judge ---------- */
  /* n/d is the student's fraction; K is the right numerator, N the right denominator. */
  const judge = (n, d, K, N, x = {}) => {
    if (n * N === K * d) return { right: true };
    const bad = t => ({ right: false, html: noT('Not yet.') + ' ' + t });
    if (n > d) return bad(`A probability is never more than 1, so the numerator cannot be bigger than the denominator. The event is only part of the sample space.`);
    if (K === 0) return bad(`No outcome is in the event, so the numerator is 0. Nothing is shaded, so 0 out of ${N}.`);
    if (K === N) return bad(`Every outcome is in the event, so the event is certain. The numerator and denominator must be the same number: ${N} out of ${N}.`);
    if (x.types && d === x.types && N !== x.types) return bad(`You counted the ${x.types} colors, not the ${N} marbles. A color can happen more than one way. The denominator is all ${N} outcomes in the sample space.`);
    if (d !== N && n === K) {
      if (d === N - K) return bad(`You divided by ${d}, the number of outcomes that are not in the event. The denominator is the size of the whole sample space: ${N}.`);
      if (d === K) return bad(`You divided by ${d}, the size of the event itself. The denominator is the size of the whole sample space: ${N}.`);
      return bad(`The sample space has ${N} outcomes, not ${d}. The denominator is the size of the whole sample space.`);
    }
    if (d === N && x.comp && n === x.other) return bad(`That is the probability that the event does happen. Here you need the outcomes that are not in the event: ${K}.`);
    if (d === N && !x.comp && n === N - K) return bad(`${n} is the number of outcomes that are not in the event. The numerator counts the outcomes that are in the event: ${K}.`);
    if (d === N && n === K - 1) return bad(`You may have forgotten an outcome. The event has ${K} outcomes, not ${n}.`);
    if (d === N && n === K + 1) return bad(`You counted one outcome too many. The event has ${K} outcomes, not ${n}.`);
    if (d === N) return bad(`The denominator ${N} is right. The numerator is the number of outcomes in ${x.comp ? 'the blue group' : 'the event'}: ${K}.`);
    return bad(`Count again. ${x.comp ? 'The blue group' : 'The event'} has ${K} ${K === 1 ? 'outcome' : 'outcomes'} and the sample space has ${N}. The probability is ${K} out of ${N}.`);
  };

  register({
    id: 'sample-spaces-and-probability', level: 'school',
    title: 'Sample spaces and probability',
    blurb: 'List every outcome of a chance experiment, pick out an event, and write its probability as a fraction, a decimal and a percent.',
    thumb(c, p) {
      const pal = p.pal, W = p.w, H = p.h, s = Math.min(W * .12, H * .26), gap = s * .24, x0 = (W - (6 * s + 5 * gap)) / 2, y0 = H * .2;
      const PIPS = { 1: [[.5, .5]], 2: [[.28, .28], [.72, .72]], 3: [[.28, .28], [.5, .5], [.72, .72]], 4: [[.28, .28], [.72, .28], [.28, .72], [.72, .72]], 5: [[.28, .28], [.72, .28], [.5, .5], [.28, .72], [.72, .72]], 6: [[.3, .25], [.3, .5], [.3, .75], [.7, .25], [.7, .5], [.7, .75]] };
      for (let i = 1; i <= 6; i++) {
        const x = x0 + (i - 1) * (s + gap), hit = i > 4;
        rr(c, x, y0, s, s, s * .2); c.fillStyle = hit ? alpha(pal.yellow, .6) : alpha(pal.blue, .08); c.fill();
        c.strokeStyle = hit ? pal.yellow : alpha(pal.blue, .6); c.lineWidth = hit ? 2.5 : 1.5; c.stroke();
        for (const [px, py] of PIPS[i]) { c.beginPath(); c.arc(x + px * s, y0 + py * s, s * .075, 0, Math.PI * 2); c.fillStyle = pal.text; c.fill(); }
      }
      const bx0 = W * .1, bx1 = W * .9, by = H * .72, X = v => bx0 + v * (bx1 - bx0);
      c.fillStyle = alpha(pal.blue, .14); c.fillRect(bx0, by - 5, bx1 - bx0, 10);
      c.fillStyle = alpha(pal.yellow, .6); c.fillRect(bx0, by - 5, X(1 / 3) - bx0, 10);
      c.strokeStyle = pal.blue; c.lineWidth = 2; c.strokeRect(bx0, by - 5, bx1 - bx0, 10);
      c.beginPath(); c.arc(X(1 / 3), by, 6, 0, Math.PI * 2); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.blue; c.lineWidth = 2.5; c.stroke();
      const f = Math.max(9, H * .09); c.font = fnt(f, 700); c.textBaseline = 'middle'; c.fillStyle = pal.muted;
      c.textAlign = 'left'; c.fillText('0', bx0, by + H * .14); c.textAlign = 'right'; c.fillText('1', bx1, by + H * .14);
      c.textAlign = 'center'; c.fillStyle = pal.text; c.fillText('2/6', X(1 / 3), by + H * .14);
    },
    hook: String.raw`Roll two dice and add them. Is a total of 7 as likely as a total of 12? Why would a list of the 11 possible totals fool you?`,
    steps: [
      { title: 'List every outcome',
        text: String.raw`<p>An <b>outcome</b> is one thing that can happen. The <b>sample space</b> is the list of all of them. Here you roll a die.</p><p>Tap each picture in the top row to add it to <b>My sample space</b>, then press Check. Then try the other experiments. Two coins and the bag of marbles need care.</p>`,
        set: { mode: 'space', task: 1 } },
      { title: 'Choose an event',
        text: String.raw`<p>An <b>event</b> is some of the outcomes, such as "an even number". Tap the outcomes that belong to it. They turn yellow.</p><p>The probability is the yellow outcomes over all the outcomes. Pick the numerator and the denominator. The bar at the bottom shows your fraction between 0 and 1.</p>`,
        set: { mode: 'event', task: 0 } },
      { title: 'Chance by area',
        text: String.raw`<p>On a dart board the regions are not the same size. This board has 3 regions, but a dart is not 1/3 likely to land in each one.</p><p>The board has 100 small squares. A dart lands at random, so the chance of a region is its share of the squares. Count the squares in the green region.</p>`,
        set: { mode: 'area', task: 0 } },
      { title: 'Never below 0, never above 1',
        text: String.raw`<p>An event that cannot happen has probability \(0\). An event that always happens has probability \(1\). Every other event is between them.</p><p>Tap the outcomes where you roll a 7. Then find the probability that an event does <em>not</em> happen. It is what is left over.</p>`,
        set: { mode: 'limits', task: 0 } }
    ],
    formal: String.raw`
      <h3>Outcomes and the sample space</h3>
      <p>A chance experiment has several possible results. Each result is an <em>outcome</em>. The <em>sample space</em> is the set of all outcomes, listed once each. Flip two coins one after the other and the sample space is HH, HT, TH, TT. You can list it in a table, as a picture, or as a tree (the next lesson draws trees).</p>
      <p>Choose outcomes that are <em>equally likely</em> when you can. For a bag of 3 red, 2 blue and 1 green marble, the colors are not equally likely, but the 6 marbles are. For two dice, the 11 sums from 2 to 12 are not equally likely, but the 36 ordered pairs are.</p>
      <h3>Probability of an event</h3>
      <p>An <em>event</em> is any group of outcomes. When all outcomes are equally likely,
      \[ P(\text{event}) = \frac{\text{number of outcomes in the event}}{\text{number of outcomes in the sample space}}. \]
      This is a ratio of the size of the event to the size of the sample space. Rolling an even number on a die gives \(\tfrac{3}{6}=\tfrac12\).</p>
      <h3>Fractions, decimals and percents</h3>
      <p>The fraction is a division. \(\tfrac{3}{6}=3\div 6=0.5\), and a percent is the decimal times 100, so \(0.5\times 100 = 50\%\). Some decimals do not end: \(\tfrac{1}{6}=0.1666\ldots\approx 0.17\), which is about \(16.7\%\). Equivalent fractions such as \(\tfrac{3}{6}\) and \(\tfrac{1}{2}\) are the same probability.</p>
      <h3>Probability as a fraction of area</h3>
      <p>When a dart lands at a random spot, equal areas are equally likely, but regions are not equal. Then
      \[ P(\text{region}) = \frac{\text{area of the region}}{\text{area of the whole board}}. \]
      On a board of 100 squares, a region of 30 squares has probability \(\tfrac{30}{100}=0.3=30\%\). Counting regions would give the wrong answer, because the regions are not the same size. Only the area matters, not the shape.</p>
      <h3>Impossible, certain and opposite events</h3>
      <p>No probability is below 0 or above 1. An impossible event has \(P=0\). A certain event has \(P=1\). The opposite of an event is that it does <em>not</em> happen. Together the event and its opposite use every outcome once, so
      \[ P(\text{event}) + P(\text{not the event}) = 1. \]
      For two coins, \(P(\text{at least one head})=\tfrac34\) and \(P(\text{no heads})=\tfrac14\), and \(\tfrac34+\tfrac14=1\).</p>`,
    check: [
      { q: 'A bag holds 2 red marbles, 3 blue marbles and 5 green marbles. You take one marble without looking. What is the probability that it is blue?',
        choices: ['1/3', '3/10', '3/7', '3/5'], answer: 1,
        why: String.raw`There are \(2+3+5=10\) marbles, so the sample space has 10 equally likely outcomes. 3 of them are blue, so the probability is \(\tfrac{3}{10}\). \(\tfrac13\) counts the 3 colors, but the colors are not equally likely. \(\tfrac37\) divides by the marbles that are not blue. \(\tfrac35\) compares blue with green (3 to 5) instead of blue with all the marbles.`,
        hint: 'Count all the marbles first. That number is the denominator.' },
      { q: 'A square dartboard is made of 100 equal small squares. A red region covers 35 small squares, a blue region covers 45 small squares, and a yellow region covers all the rest. A dart lands at a random spot on the board. What is the probability, as a percent, that it lands in the yellow region?',
        choices: ['33%', '80%', '0.2%', '20%'], answer: 3,
        why: String.raw`Red and blue cover \(35+45=80\) squares, so yellow covers \(100-80=20\) squares. The probability is \(\tfrac{20}{100}=0.20=20\%\). \(33\%\) counts the 3 regions as equal, but they are not the same size. \(80\%\) is the chance of not landing in yellow. \(0.2\%\) writes the decimal \(0.20\) as a percent without multiplying by 100.`,
        hint: 'Find how many squares are yellow, then write that number out of 100.' }
    ],
    links: { next: ['compound-events-and-tree-diagrams'], related: ['probability-with-repeated-trials', 'percents-on-tape-and-number-lines', 'pascals-triangle-and-the-galton-board'] },

    mount({ stage, controls: C }) {
      const P = new Plane(stage, { span: 5 });
      const cv = P.canvas;
      if (P.coordEl) P.coordEl.style.display = 'none';
      cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', 'A chance experiment drawn as pictures and tables of outcomes, a probability bar from 0 to 1, or a square dart board. Tap outcomes to choose them. Use the controls beside the picture to answer and check.');
      const st = { mode: 'space', ti: 1, stage: 0, tray: [], sel: {}, n: null, d: null, fb: '', showSums: false, a: 5, b: 4 };
      const hits = [];
      let geo = null, drag = null, modeBtns, taskSel, ro, fbEl = null, liveEl = null, countEl = null, lastLiveBuild = null;

      const cur = () => TASKS[st.mode][st.ti];
      const scn = () => st.mode === 'space' ? SCN[SP[st.ti]] : st.mode === 'area' ? null : SCN[cur().sc];
      const outs = () => scn().out;
      const lastStage = () => st.mode === 'limits' ? 3 : 2;
      const evTarget = () => outs().filter(o => cur().test(o));
      const selCount = () => outs().filter(o => st.sel[o.id]).length;

      /* ---------- drawing helpers ---------- */
      const PIPS = { 1: [[.5, .5]], 2: [[.25, .25], [.75, .75]], 3: [[.25, .25], [.5, .5], [.75, .75]], 4: [[.25, .25], [.75, .25], [.25, .75], [.75, .75]], 5: [[.25, .25], [.75, .25], [.5, .5], [.25, .75], [.75, .75]], 6: [[.27, .22], [.27, .5], [.27, .78], [.73, .22], [.73, .5], [.73, .78]] };
      const fitGrid = (m, aw, ah, gap, smax) => {
        let best = { s: 14, cols: Math.max(1, m) };
        for (let cols = 1; cols <= Math.max(1, m); cols++) {
          const rows = Math.ceil(m / cols), s = Math.min(smax, (aw - (cols - 1) * gap) / cols, (ah - (rows - 1) * gap) / rows);
          if (s > best.s || best.s === 14) best = { s, cols };
        }
        return best;
      };
      const tilePos = (m, i, cols, s, gap, x0, w, y0) => {
        const rows = Math.ceil(m / cols), r = Math.floor(i / cols), inRow = r === rows - 1 ? m - r * cols : cols;
        const rowW = inRow * s + (inRow - 1) * gap;
        return [x0 + (w - rowW) / 2 + (i % cols) * (s + gap), y0 + r * (s + gap)];
      };
      const drawOutcome = (c, p, o, x, y, s, style) => {
        const pal = p.pal;
        let fill = alpha(pal.blue, .07), stroke = alpha(pal.blue, .55), lw = 1.5;
        if (style === 'sel') { fill = alpha(pal.yellow, .55); stroke = pal.yellow; lw = 2.8; }
        else if (style === 'comp') { fill = alpha(pal.blue, .3); stroke = pal.blue; lw = 2.8; }
        else if (style === 'bad') { fill = alpha(pal.red, .13); stroke = pal.red; lw = 2.8; }
        rr(c, x, y, s, s, s * .18); c.fillStyle = fill; c.fill(); c.strokeStyle = stroke; c.lineWidth = lw; c.stroke();
        const cx = x + s / 2, cy = y + s / 2, pic = o.pic;
        if (pic === 'die') {
          for (const [px, py] of PIPS[o.v]) { c.beginPath(); c.arc(x + s * (.12 + .76 * px), y + s * (.12 + .76 * py), s * .075, 0, Math.PI * 2); c.fillStyle = pal.text; c.fill(); }
        } else if (pic === 'coin') {
          c.beginPath(); c.arc(cx, cy, s * .33, 0, Math.PI * 2); c.fillStyle = alpha(pal.blue, .18); c.fill(); c.strokeStyle = pal.blue; c.lineWidth = 2; c.stroke();
          txt(c, p, o.lab, cx, cy + 1, { size: s * .32, halo: false });
        } else if (pic === 'two') {
          for (const [i, px] of [[0, .3], [1, .7]]) {
            c.beginPath(); c.arc(x + s * px, cy, s * .2, 0, Math.PI * 2); c.fillStyle = alpha(pal.blue, .18); c.fill(); c.strokeStyle = pal.blue; c.lineWidth = 1.8; c.stroke();
            txt(c, p, o.lab[i], x + s * px, cy + 1, { size: s * .22, halo: false });
          }
        } else if (pic === 'marble') {
          const col = o.col === 'red' ? pal.red : o.col === 'blue' ? pal.blue : pal.green;
          c.beginPath(); c.arc(cx, cy, s * .34, 0, Math.PI * 2); c.fillStyle = col; c.fill();
          txt(c, p, o.lab, cx, cy + 1, { size: s * .27, color: pal.stage, halo: false, weight: 700 });
        } else {
          txt(c, p, o.lab, cx, cy, { size: clamp(s * .24, 10, 16), halo: false });
        }
      };
      const drawBar = (c, p, g, v, label, over) => {
        const pal = p.pal, x0 = g.padB, x1 = g.W - g.padB, y = g.barY, X = t => x0 + t * (x1 - x0), f = g.fs;
        c.fillStyle = alpha(pal.blue, .12); c.fillRect(x0, y - 8, x1 - x0, 16);
        if (v != null) { c.fillStyle = alpha(pal.yellow, .6); c.fillRect(x0, y - 8, X(clamp(v, 0, 1)) - x0, 16); }
        for (const t of [0, .25, .5, .75, 1]) ln(c, X(t), y - 11, X(t), y + 11, t === 0 || t === 1 ? pal['grid-strong'] : pal.muted, t === 0 || t === 1 ? 2 : 1.2);
        c.strokeStyle = pal.blue; c.lineWidth = 2; c.strokeRect(x0, y - 8, x1 - x0, 16);
        const lab = (s, t, row, al) => txt(c, p, s, t, y + 24 + row * (f + 3), { size: f - 1, color: pal.muted, align: al, halo: false, weight: 600 });
        lab('0', X(0), 0, 'left'); lab('0.5', X(.5), 0, 'center'); lab('1', X(1), 0, 'right');
        lab('0%', X(0), 1, 'left'); lab('50%', X(.5), 1, 'center'); lab('100%', X(1), 1, 'right');
        txt(c, p, 'impossible', X(0), y - 24, { size: f - 1, color: pal.muted, align: 'left', halo: false });
        txt(c, p, 'certain', X(1), y - 24, { size: f - 1, color: pal.muted, align: 'right', halo: false });
        if (v != null) {
          const vx = X(clamp(v, 0, 1)), col = over ? pal.red : pal.blue;
          ln(c, vx, y - 14, vx, y + 14, col, 3);
          c.beginPath(); c.arc(vx, y, 7, 0, Math.PI * 2); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = col; c.lineWidth = 3; c.stroke();
          if (label) {
            c.font = fnt(f, 700); const w = c.measureText(label).width + 16, lx = clamp(vx, x0 + w / 2, x1 - w / 2), ly = y - 24 - (f + 8);
            rr(c, lx - w / 2, ly - (f + 8) / 2, w, f + 8, 6); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = col; c.lineWidth = 1.5; c.stroke();
            txt(c, p, label, lx, ly, { size: f, color: pal.text, halo: false, weight: 700 });
          }
        }
      };

      P.onDraw = (c, p) => {
        const pal = p.pal, W = p.w || 400, H = p.h || 400, fs = clamp(W * .036, 11.5, 17), pad = clamp(W * .05, 14, 40);
        hits.length = 0; geo = null;
        const m = st.mode, S = scn(), t = cur(), hasBar = m !== 'space';
        const barH = hasBar ? clamp(H * .24, 98, 128) : 0;
        const g = { W, fs, padB: pad + 6, barY: H - barH + 56 > H - 44 ? H - 44 : H - barH + 56 };
        g.barY = H - 58;
        /* header */
        txt(c, p, m === 'area' ? 'A dart lands at random on the board' : S.title, W / 2, 22, { size: fs + 2, weight: 700, halo: false });
        const capt = m === 'space' ? (S.kind === 'grid' ? 'Rows are the first die, columns the second die. Tap a cell, or a row or column number.' : 'Tap a picture to add it to your list. Tap one in your list to remove it.')
          : m === 'area' ? (t.kind === 'read' ? 'Count the small squares in the ' + t.region + ' region.' : 'Drag the two round handles. Only the ' + t.region + ' region matters.')
          : st.stage === 0 ? 'Tap the outcomes that belong to the event.' : st.stage === 1 ? 'Yellow: in the event.' + (S.kind === 'grid' ? '' : '') : st.stage === 2 && m === 'limits' ? 'Yellow: the event. Blue: the event does not happen.' : 'Yellow: in the event.';
        txt(c, p, capt, W / 2, 22 + fs + 9, { size: fs - 1, color: pal.muted, weight: 600, halo: false });
        const top = 22 + fs + 9 + 22, bottom = H - barH - 6;

        if (m === 'space' && S.kind === 'chips') {
          const pool = S.out.concat(S.decoys), lh = fs + 8, avail = bottom - top, ph = (avail - 2 * lh - 12) * .46, th = (avail - 2 * lh - 12) * .54;
          const smax = clamp(Math.min(W, H) * .16, 38, 82), gap = clamp(W * .016, 6, 12);
          const fp = fitGrid(pool.length, W - 2 * pad, ph, gap, smax), ft = fitGrid(Math.max(pool.length, st.tray.length, 1), W - 2 * pad - 16, th - 14, gap, smax), s = Math.min(fp.s, ft.s);
          txt(c, p, 'Possible outcomes', pad, top + lh / 2 - 2, { size: fs, align: 'left', color: pal.muted, halo: false });
          const poolW = W - 2 * pad;
          pool.forEach((o, i) => {
            const [x, y] = tilePos(pool.length, i, fp.cols, s, gap, pad, poolW, top + lh);
            drawOutcome(c, p, o, x, y, s, o.pic === 'txt' ? '' : '');
            hits.push({ k: 'pool', i, x, y, w: s, h: s });
          });
          const ty = top + lh + ph + 14;
          txt(c, p, 'My sample space', pad, ty + lh / 2 - 2, { size: fs, align: 'left', weight: 700, halo: false });
          txt(c, p, st.tray.length + (st.tray.length === 1 ? ' outcome' : ' outcomes'), W - pad, ty + lh / 2 - 2, { size: fs, align: 'right', color: pal.muted, halo: false });
          const by = ty + lh;
          rr(c, pad, by, W - 2 * pad, th, 10); c.fillStyle = alpha(pal.blue, .04); c.fill(); c.strokeStyle = alpha(pal.blue, .5); c.lineWidth = 1.5; c.setLineDash([6, 5]); c.stroke(); c.setLineDash([]);
          const counts = {}; st.tray.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
          st.tray.forEach((id, i) => {
            const o = pool.find(q => q.id === id), [x, y] = tilePos(st.tray.length, i, ft.cols, s, gap, pad + 8, W - 2 * pad - 16, by + 8);
            drawOutcome(c, p, o, x, y, s, counts[id] > 1 || S.decoys.some(q => q.id === id) ? 'bad' : '');
            hits.push({ k: 'tray', i, x, y, w: s, h: s });
          });
          if (!st.tray.length) txt(c, p, 'Nothing here yet', W / 2, by + th / 2, { size: fs, color: pal.muted, halo: false });
        } else if (S && S.kind === 'grid') {
          /* the 6 by 6 table of pairs, used for the sample space and for events */
          const hdr = clamp(fs * 1.9, 24, 34), cell = Math.floor(Math.min((W - 2 * pad - hdr) / 6, (bottom - top - hdr - 4) / 6, 74));
          const gx = Math.round((W - (hdr + 6 * cell)) / 2 + hdr), gy = Math.round(top + hdr + 2);
          const inSet = o => m === 'space' ? !!st.sel[o.id] : !!st.sel[o.id];
          for (let j = 0; j < 6; j++) { const x = gx + j * cell + 3, y = gy - hdr + 2; rr(c, x, y, cell - 6, hdr - 6, 6); c.fillStyle = alpha(pal.blue, .1); c.fill(); txt(c, p, String(j + 1), x + (cell - 6) / 2, y + (hdr - 6) / 2, { size: fs, halo: false }); hits.push({ k: 'col', i: j, x, y, w: cell - 6, h: hdr - 6 }); }
          for (let i = 0; i < 6; i++) { const x = gx - hdr + 2, y = gy + i * cell + 3; rr(c, x, y, hdr - 6, cell - 6, 6); c.fillStyle = alpha(pal.blue, .1); c.fill(); txt(c, p, String(i + 1), x + (hdr - 6) / 2, y + (cell - 6) / 2, { size: fs, halo: false }); hits.push({ k: 'row', i, x, y, w: hdr - 6, h: cell - 6 }); }
          const target = m === 'limits' || m === 'event' ? null : null;
          S.out.forEach(o => {
            const x = gx + (o.y - 1) * cell, y = gy + (o.x - 1) * cell, on = inSet(o);
            let style = '';
            if (m === 'space') style = on ? 'sel' : '';
            else style = on ? 'sel' : '';
            rr(c, x + 2, y + 2, cell - 4, cell - 4, 5);
            let fill = alpha(pal.blue, .05), stroke = alpha(pal.blue, .35), lw = 1.2;
            if (m === 'space') { if (on) { fill = alpha(pal.blue, .22); stroke = pal.blue; lw = 1.8; } if (on && st.showSums && (o.sum === 7 || o.sum === 12)) { fill = alpha(o.sum === 7 ? pal.violet : pal.yellow, .6); stroke = o.sum === 7 ? pal.violet : pal.yellow; lw = 2.2; } }
            else if (on) { fill = alpha(pal.yellow, .55); stroke = pal.yellow; lw = 2.4; }
            else if (m === 'limits' && st.stage >= 2) { fill = alpha(pal.blue, .3); stroke = pal.blue; lw = 2.4; }
            c.fillStyle = fill; c.fill(); c.strokeStyle = stroke; c.lineWidth = lw; c.stroke();
            if (m !== 'space' || on) txt(c, p, m === 'space' && st.showSums ? String(o.sum) : o.x + ',' + o.y, x + cell / 2, y + cell / 2, { size: clamp(cell * .3, 10, 16), halo: false, weight: m === 'space' && st.showSums ? 700 : 600, color: pal.text });
            hits.push({ k: 'cell', id: o.id, x, y, w: cell, h: cell });
          });
          const cnt = selCount();
          if (m === 'space') txt(c, p, cnt + ' of 36 pairs in your list', W / 2, Math.min(bottom + 4, gy + 6 * cell + 16), { size: fs, color: pal.muted, halo: false });
          else txt(c, p, 'In the event: ' + cnt + ' of 36', W / 2, Math.min(bottom + 4, gy + 6 * cell + 16), { size: fs, color: pal.muted, halo: false });
        } else if (m === 'event' || m === 'limits') {
          const o = S.out, smax = clamp(Math.min(W, H) * .2, 44, 96), gap = clamp(W * .02, 8, 16);
          const f = fitGrid(o.length, W - 2 * pad, bottom - top - fs - 14, gap, smax), s = f.s, rows = Math.ceil(o.length / f.cols), blockH = rows * s + (rows - 1) * gap, y0 = top + Math.max(0, (bottom - top - fs - 14 - blockH) / 2);
          o.forEach((q, i) => {
            const [x, y] = tilePos(o.length, i, f.cols, s, gap, pad, W - 2 * pad, y0);
            const on = !!st.sel[q.id];
            drawOutcome(c, p, q, x, y, s, on ? 'sel' : (m === 'limits' && st.stage >= 2 ? 'comp' : ''));
            hits.push({ k: 'tile', id: q.id, x, y, w: s, h: s });
          });
          txt(c, p, 'In the event: ' + selCount() + ' of ' + o.length, W / 2, y0 + blockH + fs + 2, { size: fs, color: pal.muted, halo: false });
        } else if (m === 'area') {
          const side = Math.floor(Math.min(W - 2 * (pad + 18), bottom - top - 24)), bx = Math.round((W - side) / 2), by = Math.round(top + 14), u = side / 10;
          geo = { bx, by, u };
          const { a, b } = st, regs = [['red', bx, by, a * u, 10 * u], ['blue', bx + a * u, by, (10 - a) * u, b * u], ['green', bx + a * u, by + b * u, (10 - a) * u, (10 - b) * u]];
          const colOf = r => r === 'red' ? pal.red : r === 'blue' ? pal.blue : pal.green;
          for (const [r, x, y, w, hh] of regs) {
            c.fillStyle = alpha(colOf(r), t.region === r ? .62 : .26); c.fillRect(x, y, w, hh);
          }
          for (let i = 1; i < 10; i++) { ln(c, bx + i * u, by, bx + i * u, by + side, alpha(pal.text, .18), 1); ln(c, bx, by + i * u, bx + side, by + i * u, alpha(pal.text, .18), 1); }
          ln(c, bx + a * u, by, bx + a * u, by + side, pal.text, 2.6); ln(c, bx + a * u, by + b * u, bx + side, by + b * u, pal.text, 2.6);
          c.strokeStyle = pal.text; c.lineWidth = 2.6; c.strokeRect(bx, by, side, side);
          for (const [r, x, y, w, hh] of regs) if (w > fs * 3 && hh > fs * 2) txt(c, p, REG[r], x + w / 2, y + hh / 2, { size: fs + 1, weight: 700, halo: false, color: pal.text });
          if (t.kind === 'build') {
            const ring = (hx, hy, id) => { c.beginPath(); c.arc(hx, hy, 11, 0, Math.PI * 2); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.brass; c.lineWidth = 3.4; c.stroke(); hits.push({ k: id, x: hx - 20, y: hy - 20, w: 40, h: 40 }); };
            ring(bx + a * u, by, 'hA'); ring(bx + side, by + b * u, 'hB');
          }
        }

        /* the probability bar */
        if (hasBar) {
          let v = null, label = '', over = false;
          if (m === 'area' && t.kind === 'build') { const ar = areaOf(t.region, st.a, st.b), q = conv(Math.round(ar * 4), 400); v = ar / 100; label = `${REG[t.region]}: ${+ar.toFixed(2)}/100 = ${q.decS} = ${q.pctS}`; }
          else if (st.n != null && st.d != null) { const q = conv(st.n, st.d); v = st.n / st.d; over = st.n > st.d; label = over ? `${st.n}/${st.d} is more than 1` : `${st.n}/${st.d} = ${q.decS} = ${q.pctS}`; }
          drawBar(c, p, g, v, label, over);
          if (v == null) txt(c, p, 'Your probability will show here', W / 2, g.barY - 46, { size: fs, color: pal.muted, halo: false });
        }
      };
      const draw = () => P.draw();

      /* ---------- panel pieces ---------- */
      const para = (html, style = 'margin:0 0 8px') => h('p', { style, html });
      const btn = (label, fn, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: fn }, label);
      const btnRow = (...b) => h('div', { class: 'ctl buttons' }, b);
      const setFb = html => { st.fb = html; if (fbEl) fbEl.innerHTML = html; };
      const mkSel = (label, lo, hi, key) => {
        const id = 'sp' + Math.random().toString(36).slice(2, 8), opts = [h('option', { value: '' }, '?')];
        for (let i = lo; i <= hi; i++) opts.push(h('option', { value: String(i) }, String(i)));
        const sel = h('select', { id }, opts);
        sel.value = st[key] == null ? '' : String(st[key]);
        sel.addEventListener('change', () => { st[key] = sel.value === '' ? null : +sel.value; updLive(); draw(); });
        return h('div', { class: 'ctl select' }, h('label', { for: id }, label), sel);
      };
      const picker = (maxN, maxD) => [mkSel('Numerator (the top number)', 0, maxN, 'n'), mkSel('Denominator (the bottom number)', 1, maxD, 'd')];
      const updLive = () => {
        if (countEl) countEl.innerHTML = kk('In the event', `${selCount()} of ${outs().length} tiles`);
        if (!liveEl) return;
        if (st.mode === 'area' && cur().kind === 'build') {
          const t = cur(), ar = areaOf(t.region, st.a, st.b), q = conv(Math.round(ar * 4), 400);
          liveEl.innerHTML = kk(REG[t.region], `${+ar.toFixed(2)} of 100 squares`) + '<br>' + kk('Probability', `${+ar.toFixed(2)}/100 = ${q.decS} = ${q.pctS}`);
          return;
        }
        if (st.n == null || st.d == null) { liveEl.innerHTML = '<span style="color:var(--muted)">Choose a numerator and a denominator to see the decimal and the percent.</span>'; return; }
        liveEl.innerHTML = st.n > st.d ? 'The numerator is bigger than the denominator. That is more than 1, which no probability can be.' : convLines(st.n, st.d);
      };

      const render = () => {
        const out = [], t = cur(), m = st.mode, N = m === 'area' ? 100 : outs().length;
        fbEl = null; liveEl = null; countEl = null;
        const fbBlock = () => { fbEl = h('p', { style: 'margin:6px 0 10px', html: st.fb }); return fbEl; };
        if (m === 'space') {
          const S = scn();
          out.push(para(S.kind === 'grid' ? '<b>List every way two dice can land.</b> The first die and the second die both matter, so (2, 5) and (5, 2) are different outcomes. Fill all the cells.' : '<b>List every outcome of the experiment.</b> Each possible result goes in your list once.'));
          const row = [btn('Check my list', checkSpace, true), btn('Clear', () => { st.tray = []; st.sel = {}; st.showSums = false; setFb(''); draw(); })];
          out.push(btnRow(...row));
          if (S.kind === 'grid') out.push(btnRow(btn('Why not list the sums 2 to 12?', sumsWhy)));
          out.push(fbBlock());
        } else if (m === 'area') {
          out.push(para(`<b>${t.q}</b>`));
          if (t.kind === 'read') {
            if (st.stage === 0) { out.push(...picker(100, 100)); liveEl = h('p', { style: 'margin:0 0 8px' }); out.push(liveEl, btnRow(btn('Check my probability', checkFrac, true))); updLive(); }
            else { out.push(para(convLines(st.n, st.d))); }
            out.push(fbBlock());
            if (st.stage > 0) out.push(btnRow(btn('Next question', () => start('area', (st.ti + 1) % AR.length), true)));
          } else {
            liveEl = h('p', { style: 'margin:0 0 8px' }); out.push(liveEl);
            if (st.stage === 0) out.push(btnRow(btn('Check my board', checkBuild, true)));
            out.push(fbBlock());
            if (st.stage > 0) out.push(btnRow(btn('Next question', () => start('area', (st.ti + 1) % AR.length), true)));
            updLive();
          }
        } else {
          /* events and limits */
          out.push(para(`<b>${t.q}</b>`));
          const done = st.stage === lastStage();
          if (st.stage === 0) {
            out.push(para(t.sc === 'dice' ? 'Tap every cell that belongs to the event. A row or column number fills the whole row or column. If none belong, tap nothing.' : 'Tap every outcome that belongs to the event. If none belong, tap nothing.', 'margin:0 0 6px'));
            countEl = h('p', { style: 'margin:0 0 8px' }); out.push(countEl);
            out.push(btnRow(btn('Check my event', checkEvent, true), btn('Clear', () => { st.sel = {}; setFb(''); updLive(); draw(); })));
            updLive();
          } else if (!done) {
            const K = evTarget().length, comp = st.stage === 2;
            out.push(para(comp ? `Now the opposite. Find the probability that the event does <b>not</b> happen. Those outcomes are blue.` : `The sample space has <b>${N}</b> outcomes. The event has <b>${K}</b>. Write the probability as a fraction.`, 'margin:0 0 6px'));
            out.push(...picker(N, N));
            liveEl = h('p', { style: 'margin:0 0 8px' }); out.push(liveEl, btnRow(btn('Check my probability', checkFrac, true))); updLive();
          } else {
            const K = evTarget().length, q = conv(K, N);
            out.push(para(convLines(K, N), 'margin:0 0 8px'));
            if (m === 'limits') {
              const q2 = conv(N - K, N);
              out.push(para(kk('Together', `${K}/${N} + ${N - K}/${N} = ${N}/${N} = 1`) + '<br>' + (K === 0 ? 'The event is impossible. Its probability is 0.' : K === N ? 'The event is certain. Its probability is 1.' : `Event and opposite use every outcome once, so their probabilities add to 1. Here ${q.pctS} + ${q2.pctS} = 100%.`), 'margin:0 0 8px'));
            }
          }
          out.push(fbBlock());
          if (done) out.push(btnRow(btn('Next question', () => start(m, (st.ti + 1) % TASKS[m].length), true)));
        }
        ro.replaceChildren(...out);
      };

      /* ---------- checks ---------- */
      const checkSpace = () => {
        const S = scn();
        if (S.kind === 'grid') {
          const miss = S.out.filter(o => !st.sel[o.id]), have = 36 - miss.length;
          if (!have) return setFb('Your table is empty. Tap the cells, or a row or column number, to fill it.');
          if (miss.length) {
            const rows = [...new Set(miss.map(o => o.x))];
            return setFb(noT('Not yet.') + ` You have ${have} of the 36 pairs. ${rows.length === 1 ? 'Row ' + rows[0] + ' has' : 'Rows ' + list(rows.map(String)) + ' have'} empty cells, for example ${miss.slice(0, 2).map(o => o.name).join(' and ')}. Every pair that can happen must be in the sample space.`);
          }
          setFb(okT('Yes.') + ' All 36 pairs are in your sample space. ' + S.ok + ' Press "Why not list the sums" to see the 7s and the 12.');
          return draw();
        }
        const pool = S.out.concat(S.decoys), tray = st.tray;
        if (!tray.length) return setFb('Your list is empty. Tap the pictures in the top row to add each possible outcome.');
        const dec = S.decoys.find(q => tray.includes(q.id));
        if (dec) return setFb(noT('Not yet.') + ' ' + dec.why);
        const dup = tray.find((id, i) => tray.indexOf(id) !== i);
        if (dup) return setFb(noT('Not yet.') + ` ${cap1(pool.find(q => q.id === dup).name)} is in your list more than once. A sample space lists each outcome once. Tap an extra copy to remove it.`);
        const miss = S.out.filter(o => !tray.includes(o.id));
        if (miss.length) {
          const nm = miss.slice(0, 3).map(o => o.name);
          let extra = '';
          if (S === SCN.two && miss.some(o => o.id === 'HT' || o.id === 'TH')) extra = ' HT and TH are two different outcomes: it matters which coin is heads.';
          return setFb(noT('Not yet.') + ` You have ${tray.length} of the ${S.out.length} outcomes. Something that can happen is missing: ${miss.length > 3 ? nm.join(', ') + ', and more' : list(nm)}. A sample space must include every outcome.` + extra);
        }
        setFb(okT('Yes.') + ` The sample space has ${S.out.length} outcomes. ${S.ok}`);
      };
      const sumsWhy = () => {
        st.showSums = true;
        setFb('There are 11 possible sums (2 to 12), but they are not equally likely. A sum of 7 can happen 6 ways: (1, 6), (2, 5), (3, 4), (4, 3), (5, 2), (6, 1). A sum of 12 can happen only 1 way: (6, 6). To get equal chances, list the 36 pairs instead.' + (selCount() ? ' The 7s are violet and the 12 is yellow in your table.' : ' Fill the table first to see the 7s and the 12 colored.'));
        draw();
      };
      const checkEvent = () => {
        const target = evTarget(), t = cur(), S = scn();
        const miss = target.filter(o => !st.sel[o.id]), extra = outs().filter(o => st.sel[o.id] && !t.test(o));
        if (!miss.length && !extra.length) {
          st.stage = 1; st.n = null; st.d = null;
          setFb(okT('Yes.') + ` The event has ${target.length} ${target.length === 1 ? 'outcome' : 'outcomes'} out of ${outs().length}. ` + t.rule);
          render(); draw(); return;
        }
        let s = noT('Not yet.');
        if (extra.length) s += ` ${list(extra.slice(0, 3).map(o => o.name))} ${extra.length === 1 ? 'does' : 'do'} not belong to the event.`;
        if (miss.length) s += ` ${miss.length} ${miss.length === 1 ? 'outcome belongs' : 'outcomes belong'} to the event but ${miss.length === 1 ? 'is' : 'are'} not yellow yet.`;
        setFb(s + ' ' + t.rule);
      };
      const checkFrac = () => {
        const m = st.mode, t = cur();
        if (st.n == null || st.d == null) return setFb('Choose both the numerator and the denominator first.');
        if (m === 'area') {
          const K = areaOf(t.region, st.a, st.b), N = 100;
          if (st.n * N === K * st.d) {
            const q = conv(K, N);
            st.stage = 1;
            setFb(okT('Yes.') + ` The ${t.region} region covers ${K} of the 100 squares. ` + (st.d !== N ? `Your fraction ${st.n}/${st.d} equals ${K}/100. ` : '') + `Chance follows area, so it is ${K}/100 = ${q.frac} = ${q.decS} = ${q.pctS}. The regions are not the same size, so counting them (1 out of 3) would be wrong.`);
            render(); draw(); return;
          }
          let s = noT('Not yet.');
          const other = ['red', 'blue', 'green'].find(r => r !== t.region && st.n * N === areaOf(r, st.a, st.b) * st.d);
          if (st.n > st.d) s += ' A probability is never more than 1. The numerator cannot be bigger than the denominator.';
          else if (st.n * 3 === st.d) s += ' You counted regions: 1 out of 3. A dart does not land in each region equally, because the regions are not the same size. Count small squares instead.';
          else if (other) s += ` That fraction matches the ${other} region. Check that you counted the squares of the ${t.region} region.`;
          else if (st.d !== N && st.n === K) s += ` The board has 100 small squares in all, so the denominator is 100, not ${st.d}.`;
          else if (st.d === N) s += ` The denominator 100 is right, because the board has 100 squares. The ${t.region} region does not have ${st.n} squares. Count them again, row by row.`;
          else s += ` Count the small squares inside the ${t.region} region. That is the numerator. The whole board has 100 squares, the denominator.`;
          return setFb(s);
        }
        const K0 = evTarget().length, N = outs().length, comp = st.stage === 2, K = comp ? N - K0 : K0;
        const r = judge(st.n, st.d, K, N, { comp, other: K0, types: scn() === SCN.bag ? 3 : 0 });
        if (!r.right) return setFb(r.html);
        const q = conv(K, N);
        const say = K === 0 ? ' No outcome fits, so the event is impossible: probability 0.' : K === N ? ' Every outcome fits, so the event is certain: probability 1.' : '';
        const eqv = st.d !== N ? ` Your ${st.n}/${st.d} is the same as ${K}/${N}.` : '';
        const hold = { n: st.n, d: st.d };
        st.stage += 1;
        const forms = [q.frac === `${K}/${N}` ? null : q.frac, q.decS, q.pctS].filter((v, i, a) => v && a.indexOf(v) === i);
        setFb(okT('Right.') + ` ${K} out of ${N} is ${forms.join(' = ')}. It is between 0 and 1.` + eqv + say);
        if (st.stage < lastStage()) { st.n = null; st.d = null; } else { st.n = hold.n; st.d = hold.d; }
        render(); draw();
      };
      const checkBuild = () => {
        const t = cur(), ar = areaOf(t.region, st.a, st.b);
        const q = conv(Math.round(ar * 4), 400);
        if (Math.abs(ar - t.target) < 1e-6) {
          st.stage = 1;
          const k = Math.round(ar), r2 = conv(k, 100);
          setFb(okT('Yes.') + ` The ${t.region} region covers ${k} of the 100 squares: ${k}/100 = ${r2.frac} = ${r2.decS} = ${r2.pctS}. ` + (t.region === 'blue' ? 'Many different boards work. Only the blue area matters, not its shape.' : 'The region does not need to be a certain shape. Only its area matters.'));
          render(); draw(); return;
        }
        const bigger = ar < t.target;
        setFb(noT('Not yet.') + ` The ${t.region} region covers ${+ar.toFixed(2)} of the 100 squares, which is ${q.pctS}. You need ${t.target}%. Make the ${t.region} region ${bigger ? 'bigger' : 'smaller'}` + (t.region === 'red' ? `: drag the top handle ${bigger ? 'right' : 'left'}.` : '. Either handle can do it.'));
      };

      /* ---------- pointer ---------- */
      const ptr = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      const flip = (ids, on) => ids.forEach(id => { if (on) st.sel[id] = true; else delete st.sel[id]; });
      const selectable = () => st.mode === 'space' || ((st.mode === 'event' || st.mode === 'limits') && st.stage === 0);
      const click = q => {
        const m = st.mode, S = scn();
        if (q.k === 'pool' && m === 'space') {
          st.tray.push(S.out.concat(S.decoys)[q.i].id); setFb('');
        } else if (q.k === 'tray' && m === 'space') {
          st.tray.splice(q.i, 1); setFb('');
        } else if (selectable() && (q.k === 'cell' || q.k === 'tile')) {
          if (st.sel[q.id]) delete st.sel[q.id]; else st.sel[q.id] = true;
          if (m === 'space') st.showSums = st.showSums && selCount() > 0; setFb('');
        } else if (selectable() && (q.k === 'row' || q.k === 'col')) {
          const ids = S.out.filter(o => q.k === 'row' ? o.x === q.i + 1 : o.y === q.i + 1).map(o => o.id), all = ids.every(id => st.sel[id]);
          flip(ids, !all); setFb('');
        } else return;
        updLive(); draw();
      };
      const dragTo = (x, y) => {
        if (!geo) return;
        if (drag === 'hA') st.a = clamp(snap((x - geo.bx) / geo.u, .5), 1, 9);
        else st.b = clamp(snap((y - geo.by) / geo.u, .5), 1, 9);
        updLive(); draw();
      };
      cv.addEventListener('pointerdown', e => {
        const [x, y] = ptr(e);
        for (let i = hits.length - 1; i >= 0; i--) {
          const q = hits[i];
          if (x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h) {
            if (q.k === 'hA' || q.k === 'hB') { if (st.stage > 0) return; drag = q.k; cv.setPointerCapture(e.pointerId); e.preventDefault(); return; }
            click(q); e.preventDefault(); return;
          }
        }
      });
      cv.addEventListener('pointermove', e => {
        const [x, y] = ptr(e);
        if (drag) { dragTo(x, y); return; }
        const hit = hits.find(q => x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h);
        cv.style.cursor = hit && (hit.k === 'hA' || hit.k === 'hB') && st.stage === 0 ? 'grab' : hit && (hit.k === 'pool' || hit.k === 'tray' || selectable()) ? 'pointer' : 'default';
      });
      const endDrag = () => { drag = null; };
      cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);

      /* ---------- the side panel ---------- */
      C.title('Explore');
      modeBtns = C.buttons(MODES.map(md => ({ label: md.name, onClick: () => start(md.id, 0) })));
      taskSel = C.select({ label: 'Question', options: [{ value: '0', label: '…' }], value: '0', onChange: v => start(st.mode, +v) });
      ro = C.readout();

      const syncPanel = () => {
        modeBtns.forEach((b, i) => { b.className = MODES[i].id === st.mode ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', MODES[i].id === st.mode); });
        taskSel.replaceChildren(...TASKS[st.mode].map((t, i) => { const o = h('option', { value: String(i) }, t.label); if (i === st.ti) o.selected = true; return o; }));
        const lab = taskSel.parentElement.querySelector('label'); if (lab) lab.textContent = st.mode === 'space' ? 'Experiment' : 'Question';
        render(); draw();
      };
      const start = (mode, ti) => {
        drag = null;
        Object.assign(st, { mode, ti, stage: 0, tray: [], sel: {}, n: null, d: null, fb: '', showSums: false });
        if (mode === 'area') { st.a = AR[ti].a; st.b = AR[ti].b; }
        syncPanel();
      };

      const apply = (patch, immediate) => { if (patch.mode) start(patch.mode, patch.task || 0); };
      start('space', 1);
      return { destroy: () => { P.destroy(); }, apply };
    }
  });
}
