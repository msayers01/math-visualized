/* =====================================================================
   SCHOOL — Compound events and tree diagrams
   ===================================================================== */
{
  /* ---------- small helpers ---------- */
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;
  const key = (i, j) => i + ',' + j;
  const lc = s => s.charAt(0).toLowerCase() + s.slice(1);
  const names = (arr, max = 8) => arr.slice(0, max).join(', ') + (arr.length > max ? ` and ${arr.length - max} more` : '');
  /* "= 0.5 = 50%" when exact, "≈ 0.167 ≈ 16.7%" when rounded */
  const rnd = (v, max, fall) => { for (let d = 0; d <= max; d++) { const r = +v.toFixed(d); if (Math.abs(r - v) < 1e-9) return [String(r), true]; } return [String(+v.toFixed(fall)), false]; };
  const dp = v => { const [a, ea] = rnd(v, 4, 3), [b, eb] = rnd(v * 100, 2, 1); return `${ea ? '=' : '≈'} ${a} ${eb ? '=' : '≈'} ${b}%`; };
  const fracS = (a, b) => { const g = gcd(a, b) || 1; return a === 0 ? '0' : a === b ? '1' : (a / g) + '/' + (b / g); };

  /* ---------- the experiments ---------- */
  const O = (k, nm, c, w) => ({ k, nm, c, w: w || 1 });
  const COIN = () => [O('H', 'Heads', 'blue'), O('T', 'Tails', 'violet')];
  const DIE = () => [1, 2, 3, 4, 5, 6].map(n => O(String(n), String(n), 'text'));
  const BAG = () => [O('R', 'Red', 'red'), O('B', 'Blue', 'blue'), O('G', 'Green', 'green')];
  const heads = (a, b) => (a === 'H' ? 1 : 0) + (b === 'H' ? 1 : 0);
  const hw = n => n + (n === 1 ? ' head' : ' heads');
  const SC = [
    { id: 'coins', name: 'Flip a coin twice', n1: 'First flip', n2: 'Second flip', A: COIN(), B: COIN(), sym: true, reps: ['list', 'table', 'tree'],
      key: 'H = heads, T = tails. HT means heads on the first flip and tails on the second.',
      events: [
        { name: 'At least one head', test: (a, b) => heads(a, b) >= 1, r: (a, b) => hw(heads(a, b)), note: 'Only TT has no head, so it is the one outcome left out.' },
        { name: 'Exactly one head', test: (a, b) => heads(a, b) === 1, r: (a, b) => hw(heads(a, b)), note: 'HT and TH are different outcomes, so both count. That is why one head and one tail is more likely than two heads.' },
        { name: 'Both flips land the same way', test: (a, b) => a === b, r: (a, b) => a === b ? 'both ' + (a === 'H' ? 'heads' : 'tails') : 'the flips differ', note: '' }
      ] },
    { id: 'coindie', name: 'Flip a coin and roll a die', n1: 'Coin', n2: 'Die', A: COIN(), B: DIE(), sym: false, reps: ['list', 'table', 'tree'],
      key: 'H = heads, T = tails. H3 means heads on the coin and a 3 on the die.',
      events: [
        { name: 'Heads and an even number', test: (a, b) => a === 'H' && +b % 2 === 0, r: (a, b) => (a === 'H' ? 'heads' : 'tails') + ', die shows ' + b, note: 'Heads goes with 2, 4 or 6.' },
        { name: 'Tails, or a number greater than 4', test: (a, b) => a === 'T' || +b > 4, r: (a, b) => (a === 'H' ? 'heads' : 'tails') + ', die shows ' + b, note: '"Or" means at least one of the two things is true. All 6 tails outcomes fit, and so do H5 and H6.' },
        { name: 'The die shows a 6', test: (a, b) => b === '6', r: (a, b) => 'die shows ' + b, note: 'The coin can be anything, so both H6 and T6 fit.' }
      ] },
    { id: 'outfit', name: 'Choose an outfit', n1: 'Shirt', n2: 'Pants', A: [O('R', 'Red', 'red'), O('B', 'Blue', 'blue'), O('G', 'Green', 'green')], B: [O('J', 'Jeans', 'violet'), O('S', 'Shorts', 'yellow')], sym: false, reps: ['list', 'table', 'tree'],
      key: 'R, B, G = red, blue, green shirt. J, S = jeans, shorts. RS means the red shirt with shorts.',
      events: [
        { name: 'You wear the blue shirt', test: (a, b) => a === 'B', r: (a, b) => (a === 'B' ? 'blue shirt' : (a === 'R' ? 'red' : 'green') + ' shirt'), note: 'The pants can be anything, so both BJ and BS fit.' },
        { name: 'Shorts with a shirt that is not green', test: (a, b) => b === 'S' && a !== 'G', r: (a, b) => (b === 'S' ? 'shorts' : 'jeans') + ', ' + (a === 'R' ? 'red' : a === 'B' ? 'blue' : 'green') + ' shirt', note: 'Both parts must be true: shorts and a red or blue shirt.' },
        { name: 'You wear jeans or the green shirt', test: (a, b) => b === 'J' || a === 'G', r: (a, b) => (b === 'S' ? 'shorts' : 'jeans') + ', ' + (a === 'R' ? 'red' : a === 'B' ? 'blue' : 'green') + ' shirt', note: 'All 3 jeans outcomes fit, and so do GS (green shirt with shorts).' }
      ] },
    { id: 'dice', name: 'Roll two dice', n1: 'Die 1', n2: 'Die 2', A: DIE(), B: DIE(), sym: true, sep: ',', reps: ['table'],
      key: '4,2 means a 4 on die 1 and a 2 on die 2. These are different from 2,4.',
      events: [
        { name: 'The sum is 7', test: (a, b) => +a + +b === 7, r: (a, b) => a + ' + ' + b + ' = ' + (+a + +b), note: 'The sum 7 can be made 6 ways: 1+6, 2+5, 3+4, 4+3, 5+2, 6+1. The sums 2 to 12 are 11 different totals, but they are not 11 equally likely outcomes. The sum 2 has only 1 cell (1+1), while 7 has 6.' },
        { name: 'The sum is 10 or more', test: (a, b) => +a + +b >= 10, r: (a, b) => a + ' + ' + b + ' = ' + (+a + +b), note: 'Sum 10 has 3 cells, sum 11 has 2 and sum 12 has 1.' },
        { name: 'Doubles (both dice match)', test: (a, b) => a === b, r: (a, b) => a + ' and ' + b, note: 'The matches run down the diagonal of the table.' },
        { name: 'At least one die shows a 6', test: (a, b) => a === '6' || b === '6', r: (a, b) => a + ' and ' + b, note: 'Row 6 and column 6 together have 6 + 6 - 1 = 11 cells, because 6,6 is in both.' }
      ] },
    { id: 'bag', name: 'Two marbles, put back', n1: 'First marble', n2: 'Second marble', A: BAG(), B: BAG(), sym: true, reps: ['list', 'table', 'tree'],
      key: 'A bag holds one red (R), one blue (B) and one green (G) marble. You draw one, look, and put it back. Then you draw again. RB means red first, blue second.',
      events: [
        { name: 'Both marbles are the same color', test: (a, b) => a === b, r: (a, b) => a === b ? 'both ' + a : 'two colors', note: 'Because the first marble goes back, the same marble can come out twice.' },
        { name: 'Exactly one marble is red', test: (a, b) => (a === 'R') !== (b === 'R'), r: (a, b) => (a === 'R' ? 1 : 0) + (b === 'R' ? 1 : 0) + ' red', note: 'RB, RG, BR and GR. Red first and red second are different outcomes.' },
        { name: 'Neither marble is blue', test: (a, b) => a !== 'B' && b !== 'B', r: (a, b) => (a === 'B' || b === 'B' ? 'has blue' : 'no blue'), note: 'Only R and G are allowed in both draws: RR, RG, GR, GG.' }
      ] },
    { id: 'bag2', name: 'Two marbles, not put back', n1: 'First marble', n2: 'Second marble', A: BAG(), B: BAG(), sym: true, norep: true, reps: ['list', 'table', 'tree'],
      key: 'The bag holds one red (R), one blue (B) and one green (G) marble. You keep the first marble out. RB means red first, blue second.',
      events: [
        { name: 'Both marbles are the same color', test: (a, b) => a === b, r: (a, b) => 'two colors', note: 'No outcome fits, because each color is in the bag only once and the first marble stays out. An impossible event has 0 outcomes, so its probability is 0.' },
        { name: 'Exactly one marble is red', test: (a, b) => (a === 'R') !== (b === 'R'), r: (a, b) => (a === 'R' ? 1 : 0) + (b === 'R' ? 1 : 0) + ' red', note: 'RB, RG, BR and GR. Compare this with the bag where the marble is put back.' },
        { name: 'Neither marble is blue', test: (a, b) => a !== 'B' && b !== 'B', r: (a, b) => (a === 'B' || b === 'B' ? 'has blue' : 'no blue'), note: 'Only RG and GR, because RR and GG cannot happen here.' }
      ] },
    { id: 'spin', name: 'A weighted spinner, spun twice', n1: 'First spin', n2: 'Second spin', A: [O('R', 'Red', 'red', 3), O('B', 'Blue', 'blue', 1)], B: [O('R', 'Red', 'red', 3), O('B', 'Blue', 'blue', 1)], sym: true, weighted: true, reps: ['list', 'table', 'tree'],
      key: 'The spinner is red on 3 of 4 equal parts and blue on 1 of 4. RB means red first, blue second.',
      wnote: 'The leaves are not equally likely. RR has chance 3/4 × 3/4 = 9/16, but BB has only 1/4 × 1/4 = 1/16. Counting leaves treats all four as 1/4 each, so it gives the wrong answer here.',
      events: [
        { name: 'Both spins match', test: (a, b) => a === b, r: (a, b) => a === b ? 'both ' + (a === 'R' ? 'red' : 'blue') : 'two colors', note: 'RR and BB fit.' },
        { name: 'At least one spin is blue', test: (a, b) => a === 'B' || b === 'B', r: (a, b) => (a === 'B' ? 1 : 0) + (b === 'B' ? 1 : 0) + ' blue', note: 'RB, BR and BB fit. Only RR has no blue.' },
        { name: 'Both spins are red', test: (a, b) => a === 'R' && b === 'R', r: (a, b) => (a === 'R' ? 1 : 0) + (b === 'R' ? 1 : 0) + ' red', note: 'Only RR fits.' }
      ] }
  ];
  const outs = s => { const o = []; s.A.forEach((a, i) => s.B.forEach((b, j) => { if (!(s.norep && i === j)) o.push([i, j]); })); return o; };
  const valid = (s, i, j) => !(s.norep && i === j);
  const lab = (s, i, j) => s.A[i].k + (s.sep || '') + s.B[j].k;
  const wt = (s, i, j) => s.A[i].w * s.B[j].w;
  const sumW = a => a.reduce((t, o) => t + o.w, 0);
  const totalW = s => outs(s).reduce((t, [i, j]) => t + wt(s, i, j), 0);
  const describe = (s, i, j) => `${lc(s.n1)}: ${s.A[i].nm.toLowerCase()}, ${lc(s.n2)}: ${s.B[j].nm.toLowerCase()}`;
  const countLine = s => {
    const nA = s.A.length, nB = s.B.length, N = outs(s).length;
    return s.norep
      ? `${nA} choices for the ${lc(s.n1)}, then only ${nB - 1} left for the ${lc(s.n2)}: ${nA} × ${nB - 1} = ${N} outcomes.`
      : `${nA} results for the ${lc(s.n1)} and ${nB} for the ${lc(s.n2)}: ${nA} × ${nB} = ${N} outcomes.`;
  };

  /* ---------- canvas helpers (pixel space) ---------- */
  const font = (size, weight = 600) => `${weight} ${size}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`;
  const T = (c, p, str, x, y, { size = 14, color, align = 'center', weight = 600, a = 1, halo = true } = {}) => {
    if (a <= .01) return;
    c.save(); c.globalAlpha *= a; c.font = font(size, weight); c.textAlign = align; c.textBaseline = 'middle';
    if (halo) { c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(str, x, y); }
    c.fillStyle = color || p.pal.text; c.fillText(str, x, y); c.restore();
  };
  const tw = (c, str, size, weight = 600) => { c.save(); c.font = font(size, weight); const w = c.measureText(str).width; c.restore(); return w; };
  const Tfit = (c, p, str, x, y, maxW, o = {}) => {
    let size = o.size || 13;
    while (size > 9 && tw(c, str, size, o.weight || 600) > maxW) size -= .5;
    T(c, p, str, x, y, { ...o, size });
  };
  const seg = (c, x1, y1, x2, y2, color, w = 1.5, dash) => {
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.strokeStyle = color; c.lineWidth = w;
    c.setLineDash(dash || []); c.lineCap = 'round'; c.stroke(); c.setLineDash([]);
  };
  const rr = (c, x, y, w, h, r) => {
    c.beginPath();
    if (w <= 0 || h <= 0) return;
    r = Math.min(r, w / 2, h / 2);
    c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  /* a rounded tag: fill color, outline color, optional label */
  const tag = (c, p, x, y, w, h, label, o = {}) => {
    const pal = p.pal;
    rr(c, x, y, w, h, Math.min(8, h / 2));
    c.fillStyle = pal.stage; c.fill(); c.fillStyle = o.fill || alpha(pal.blue, .12); c.fill();
    c.strokeStyle = o.stroke || pal['grid-strong']; c.lineWidth = o.lw || 1.5; c.setLineDash(o.dash || []); c.stroke(); c.setLineDash([]);
    if (label) Tfit(c, p, label, x + w / 2, y + h / 2 + .5, w - 6, { size: o.size || 14, color: o.color, weight: o.weight || 700, halo: false });
    if (o.cross) { seg(c, x + 6, y + 6, x + w - 6, y + h - 6, pal.red, 2); seg(c, x + w - 6, y + 6, x + 6, y + h - 6, pal.red, 2); }
  };

  /* ---------- the lesson ---------- */
  register({
    id: 'compound-events-and-tree-diagrams', level: 'school',
    title: 'Compound events and tree diagrams',
    blurb: 'Build the sample space for two-step chance experiments as a list, a table and a tree, then tap the outcomes that match an event described in words.',
    thumb(c, p) {
      const pal = p.pal, W = p.w, H = p.h, x0 = W * .1, x1 = W * .46, x2 = W * .82;
      const rootY = H * .5, l1 = [H * .27, H * .73], l2 = [H * .15, H * .39, H * .61, H * .85];
      const cols = [pal.blue, pal.violet];
      l1.forEach((y, i) => {
        seg(c, x0, rootY, x1, y, cols[i], 2.4);
        [0, 1].forEach(k => seg(c, x1, y, x2, l2[i * 2 + k], cols[k], 2));
      });
      const dotR = Math.max(4, W * .028);
      const dot = (x, y, col, r) => { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = col; c.fill(); };
      dot(x0, rootY, pal.text, dotR * 1.1); l1.forEach((y, i) => dot(x1, y, cols[i], dotR * 1.2));
      l2.forEach((y, i) => { const hit = i !== 3; dot(x2, y, hit ? pal.yellow : pal.muted, dotR * 1.5); });
    },
    hook: String.raw`You flip a coin twice. Is it just as likely to get one head and one tail as it is to get two heads?`,
    steps: [
      { title: 'List every outcome',
        text: String.raw`<p>Flip a coin twice. An <b>outcome</b> is one complete result, such as heads on the first flip and tails on the second, written HT. The list of all possible outcomes is the <b>sample space</b>.</p><p>Build an organized list. Tap a first result, then tap a second result to add that outcome. Order matters: HT and TH are different outcomes. Press <b>Check</b> and the lesson tells you what is missing or repeated. Then try the <b>Table</b> and <b>Tree</b> buttons to build the same sample space two more ways.</p>`,
        set: { scn: 0, rep: 'list', task: 'build', ev: 0, fill: 'none' } },
      { title: 'Trees and the counting principle',
        text: String.raw`<p>Now flip a coin and roll a die. The tree starts with the 2 coin results. Tap the H or T node, then add a branch for each die result. Each path from the start to the end is one outcome. The end of a path is a <b>leaf</b>.</p><p>There are 2 choices for the coin and 6 for the die, so the tree has \(2\times 6=12\) leaves. This is the <b>counting principle</b>: multiply the number of choices at each stage. Next, open the experiment menu and pick <b>Two marbles, not put back</b>. After the first marble is out, the second stage has fewer branches.</p>`,
        set: { scn: 1, rep: 'tree', task: 'build', ev: 0, fill: 'tree1' } },
      { title: 'From words to outcomes',
        text: String.raw`<p>Roll two dice. The table has 6 rows for die 1 and 6 columns for die 2, so there are \(6\times 6=36\) cells. Each cell is one outcome, and all 36 are equally likely.</p><p>The event is "the sum is 7". Tap every cell where the two dice add to 7, then press <b>Check my event</b>. The lesson shows the number of marked cells over 36 as a fraction, a decimal and a percent. Do not count sums: the 11 sums from 2 to 12 are not equally likely.</p>`,
        set: { scn: 3, rep: 'table', task: 'event', ev: 0, fill: 'none' } },
      { title: 'When leaves are not equally likely',
        text: String.raw`<p>This spinner is red on 3 of 4 equal parts and blue on 1 of 4. Spin it twice. The tree has 4 leaves, but they are not equally likely. Each branch shows its own chance.</p><p>Tap the leaves for "at least one spin is blue" and check. Counting leaves gives 3 of 4. Using the leaf chances gives 7/16, which is 43.75%. A leaf's chance is its two branch chances multiplied. Counting leaves only works when every leaf is equally likely.</p>`,
        set: { scn: 6, rep: 'tree', task: 'event', ev: 1, fill: 'none' } }
    ],
    formal: String.raw`
      <p>A chance experiment with two or more stages is a <em>compound event</em> experiment: two coin flips, a coin and a die, two marbles from a bag. To study it, split it into its stages and list what can happen at each stage.</p>
      <h3>Outcomes, sample space and events</h3>
      <p>An <em>outcome</em> is one complete result of the whole experiment, with every stage included. The <em>sample space</em> is the set of all outcomes. For two coin flips it is \(\{HH,\,HT,\,TH,\,TT\}\). HT and TH are different outcomes because the order tells you which flip gave which result.</p>
      <p>An <em>event</em> is a set of outcomes picked out by a description in everyday words. "At least one head" is the event \(\{HH,\,HT,\,TH\}\). To find an event, test every outcome in the sample space against the words and keep the ones that fit. An event can contain every outcome, only one, or none at all.</p>
      <h3>Three ways to show a sample space</h3>
      <p>An <em>organized list</em> goes through the first results in order and, for each one, through every second result in order. The pattern makes missing or repeated outcomes easy to spot. A <em>table</em> puts the first stage down the side and the second stage across the top, so each cell is one outcome. A <em>tree diagram</em> puts the first stage's results as branches from a start point. From the end of each branch it draws the second stage's branches. Each path from the start to the end is one outcome.</p>
      <h3>The counting principle</h3>
      <p>If stage 1 has \(m\) results and every one of them leaves \(n\) results for stage 2, there are
      \[ m\times n \]
      outcomes. A coin and a die give \(2\times 6=12\). Two dice give \(6\times 6=36\). If a marble is not put back, stage 2 has fewer branches. Three different marbles, drawn twice without putting back, give \(3\times 2=6\). With putting back they give \(3\times 3=9\).</p>
      <h3>Counting an event</h3>
      <p>When every outcome is equally likely, the chance of an event is
      \[ P(\text{event})=\frac{\text{number of outcomes in the event}}{\text{number of outcomes in the sample space}}. \]
      For "the sum is 7" with two dice this is \(\tfrac{6}{36}=\tfrac16\approx 0.167\approx 16.7\%\). The 11 possible sums are not equally likely, so the sums themselves are not the outcomes. The pairs of dice are.</p>
      <h3>When the branches are not equally likely</h3>
      <p>Counting leaves works only if every leaf is equally likely. Take a spinner that is red \(\tfrac34\) of the time and blue \(\tfrac14\). Two spins give four leaves, but RR has chance \(\tfrac34\times\tfrac34=\tfrac{9}{16}\) and BB has chance \(\tfrac14\times\tfrac14=\tfrac{1}{16}\). The chance of a leaf is its branch chances multiplied. The chance of an event is the sum of the chances of its leaves. For "at least one blue" that is \(\tfrac{3}{16}+\tfrac{3}{16}+\tfrac{1}{16}=\tfrac{7}{16}\), not \(\tfrac34\).</p>`,
    check: [
      { q: 'A bag holds 3 marbles: one red, one blue and one green. You pull out one marble, do not put it back, and then pull out a second marble. Write each outcome as two letters, such as RB for red first and blue second. How many outcomes are in the sample space?',
        choices: ['9', '6', '3', '4'], answer: 1,
        why: String.raw`There are 3 choices for the first marble. The first marble is not put back, so only 2 are left for the second. By the counting principle there are \(3\times 2=6\) outcomes: RB, RG, BR, BG, GR, GB. The answer 9 is for putting the marble back, which also allows RR, BB and GG.`,
        hint: 'How many marbles are in the bag when you pull the second one?' },
      { q: 'Two fair dice are rolled, one red and one blue. The sample space has 36 equally likely outcomes, one for each pair (red die, blue die). What is the probability that the sum is 7?',
        choices: ['1/11', '1/12', '1/6', '7/36'], answer: 2,
        why: String.raw`A sum of 7 comes from (1,6), (2,5), (3,4), (4,3), (5,2) and (6,1). That is 6 outcomes out of 36, so the probability is \(6/36=1/6\). The answer 1/11 counts the 11 possible sums as if they were equally likely, and 1/12 counts (1,6) and (6,1) as the same outcome.`,
        hint: 'Count the pairs of dice that add to 7. Then divide by 36, not by the number of different sums.' }
    ],
    links: { prereq: ['sample-spaces-and-probability'], related: ['probability-with-repeated-trials', 'pascals-triangle-and-the-galton-board', 'mean-median-and-spread'] },

    mount({ stage, controls: C }) {
      delete stage.dataset.coords;
      const P = new Plane(stage, { span: 5 });
      let hits = [];
      const st = { scn: 0, rep: 'list', task: 'build', ev: 0, pend: null, sel: 'root', list: [], table: new Set(), tree: [], evSel: new Set(), msg: '' };
      const sc = () => SC[st.scn];
      const treeHas1 = i => st.tree.includes(String(i));
      const treeHas2 = (i, j) => st.tree.includes(key(i, j));
      const fresh = () => { st.pend = null; st.sel = 'root'; st.list = []; st.table = new Set(); st.tree = []; st.evSel = new Set(); st.msg = ''; };
      const hit = (x, y, w, h, fn) => hits.push({ x, y, w, h, fn });
      const colOf = (p, o) => p.pal[o.c] || p.pal.text;

      /* ---------- tree geometry ---------- */
      const treeLayout = (s, W, H, tb, bh) => {
        const o = outs(s), N = o.length, top = tb + 14, avail = H - top - bh - 8, dy = Math.min(avail / N, 46);
        const y0 = top + (avail - dy * N) / 2, leaf = {}, l1 = [];
        o.forEach(([i, j], n) => { leaf[key(i, j)] = y0 + (n + .5) * dy; });
        s.A.forEach((a, i) => { const ys = o.filter(q => q[0] === i).map(q => leaf[key(q[0], q[1])]); l1[i] = ys.reduce((t, v) => t + v, 0) / ys.length; });
        const x2 = Math.min(s.weighted ? W - 100 : W - 34, 440);
        return { dy, leaf, l1, ry: l1.reduce((t, v) => t + v, 0) / l1.length, x0: 36, x1: (36 + x2) / 2, x2 };
      };

      /* ---------- drawing ---------- */
      const chip = (c, p, x, y, w, h, label, color, on, fn) => {
        tag(c, p, x, y, w, h, label, { fill: alpha(color, on ? .34 : .13), stroke: on ? p.pal.brass : color, lw: on ? 3 : 1.5, color: p.pal.text, size: 14 });
        if (fn) hit(x, y, w, h, fn);
      };
      const chipRow = (c, p, x, y, opts, labelOf, onOf, fnOf, extra) => {
        const W = p.w - 12;
        let labs = opts.map(labelOf);
        let ws = labs.map(l => Math.max(40, tw(c, l, 14, 700) + 22));
        const tot = () => ws.reduce((t, v) => t + v, 0) + (ws.length - 1) * 6 + (extra ? 52 : 0);
        if (x + tot() > W) { labs = opts.map(o => o.k); ws = labs.map(l => Math.max(40, tw(c, l, 14, 700) + 22)); }
        opts.forEach((o, i) => { chip(c, p, x, y, ws[i], 36, labs[i], colOf(p, o), onOf(i), fnOf(i)); x += ws[i] + 6; });
        if (extra) { tag(c, p, x, y, 46, 36, extra.label, { fill: alpha(p.pal.brass, .18), stroke: p.pal.brass, lw: 2, color: p.pal.text, size: 13 }); hit(x, y, 46, 36, extra.fn); }
      };

      const drawList = (c, p, tb) => {
        const s = sc(), W = p.w, H = p.h, build = st.task === 'build', pal = p.pal;
        if (build) {
          let y = tb + 2;
          T(c, p, s.n1 + ': tap one', 12, y + 8, { size: 12, color: pal.muted, align: 'left', halo: false }); y += 18;
          chipRow(c, p, 12, y, s.A, o => o.nm, i => st.pend === i, i => () => { st.pend = i; st.msg = ''; });
          y += 46;
          T(c, p, s.n2 + ': then tap one (this adds the outcome)', 12, y + 8, { size: 12, color: pal.muted, align: 'left', halo: false }); y += 18;
          chipRow(c, p, 12, y, s.B, o => o.nm, () => false, j => () => listAdd(j));
          y += 50;
          seg(c, 12, y - 6, W - 12, y - 6, pal.grid, 1.5);
          T(c, p, 'Your list: ' + st.list.length + (st.list.length === 1 ? ' outcome' : ' outcomes'), 12, y + 8, { size: 13, align: 'left', halo: false });
          y += 24;
          const pw = 58, ph = 32, gap = 8, cols = Math.max(1, Math.floor((W - 24 + gap) / (pw + gap)));
          const seen = {};
          st.list.forEach(([i, j], n) => {
            const k = key(i, j), dup = seen[k]; seen[k] = true;
            const x = 12 + (n % cols) * (pw + gap), yy = y + Math.floor(n / cols) * (ph + gap), bad = dup || !valid(s, i, j);
            tag(c, p, x, yy, pw, ph, lab(s, i, j), { fill: alpha(bad ? pal.red : pal.blue, .16), stroke: bad ? pal.red : pal.blue, lw: bad ? 2.5 : 1.5, color: pal.text, size: 14, cross: !valid(s, i, j) });
            hit(x, yy, pw, ph, () => { st.list.splice(n, 1); st.msg = 'Removed ' + lab(s, i, j) + '.'; });
          });
          if (!st.list.length) T(c, p, 'Nothing here yet. Tap a first result, then a second result.', 12, y + 14, { size: 13, color: pal.muted, align: 'left', halo: false });
        } else {
          const nB = s.B.length, lw = 28, pw = Math.min(58, (W - 24 - lw) / nB - 6), ph = 32;
          const rows = s.A.length, avail = H - tb - 10, rh = Math.min(46, avail / rows);
          const y0 = tb + 6 + (avail - rh * rows) / 2;
          s.A.forEach((a, i) => {
            const yy = y0 + i * rh + (rh - ph) / 2;
            T(c, p, a.k + ':', 12, yy + ph / 2, { size: 14, color: colOf(p, a), align: 'left', halo: false });
            s.B.forEach((b, j) => {
              if (!valid(s, i, j)) return;
              const x = 12 + lw + j * (pw + 6), on = st.evSel.has(key(i, j));
              tag(c, p, x, yy, pw, ph, lab(s, i, j), { fill: on ? alpha(pal.yellow, .6) : alpha(pal.blue, .08), stroke: on ? pal.yellow : pal['grid-strong'], lw: on ? 3 : 1.5, color: pal.text, size: 14 });
              hit(x, yy, pw, ph, () => evToggle(i, j));
            });
          });
        }
      };

      const drawTable = (c, p, tb) => {
        const s = sc(), W = p.w, H = p.h, build = st.task === 'build', pal = p.pal, nA = s.A.length, nB = s.B.length;
        const left = 34, top = tb + 50, availW = W - left - 14, availH = H - top - 12;
        let cw, chh, gx, gy, cwj = [], chi = [];
        if (s.weighted) {
          const side = Math.min(availW, availH, 330), wa = sumW(s.A), wb = sumW(s.B);
          s.B.forEach((b, j) => cwj[j] = side * b.w / wb); s.A.forEach((a, i) => chi[i] = side * a.w / wa);
          gx = left + (availW - side) / 2; gy = top;
        } else {
          const cell = Math.min(availW / nB, availH / nA, 64);
          s.B.forEach((b, j) => cwj[j] = cell); s.A.forEach((a, i) => chi[i] = cell);
          gx = left + (availW - cell * nB) / 2; gy = top + Math.min(20, (availH - cell * nA) / 2);
        }
        const xs = [], ys = []; let ax = gx, ay = gy;
        cwj.forEach((w, j) => { xs[j] = ax; ax += w; }); chi.forEach((h, i) => { ys[i] = ay; ay += h; });
        s.B.forEach((b, j) => T(c, p, b.k, xs[j] + cwj[j] / 2, gy - 12, { size: 15, color: colOf(p, b), weight: 700, halo: false }));
        s.A.forEach((a, i) => T(c, p, a.k, gx - 14, ys[i] + chi[i] / 2, { size: 15, color: colOf(p, a), weight: 700, halo: false }));
        T(c, p, 'rows: ' + lc(s.n1) + ', columns: ' + lc(s.n2), 18, gy - 36, { size: 12, color: pal.muted, align: 'left', halo: false });
        const tot = totalW(s);
        s.A.forEach((a, i) => s.B.forEach((b, j) => {
          const x = xs[j], y = ys[i], w = cwj[j] - 3, hh = chi[i] - 3, k = key(i, j), ok0 = valid(s, i, j);
          let fill = alpha(pal.text, .04), stroke = pal['grid-strong'], lw = 1.5, text = '', tc = pal.text, cross = false;
          if (build) {
            if (st.table.has(k)) { const bad = !ok0; fill = alpha(bad ? pal.red : pal.blue, .2); stroke = bad ? pal.red : pal.blue; text = lab(s, i, j); cross = bad; }
          } else if (!ok0) { fill = alpha(pal.muted, .12); stroke = pal.grid; text = ''; cross = true; }
          else {
            const on = st.evSel.has(k); text = lab(s, i, j);
            if (on) { fill = alpha(pal.yellow, .6); stroke = pal.yellow; lw = 3; } else tc = pal.muted;
          }
          rr(c, x + 1.5, y + 1.5, w, hh, 5); c.fillStyle = fill; c.fill(); c.strokeStyle = stroke; c.lineWidth = lw; c.stroke();
          if (cross && !build) { seg(c, x + 10, y + 10, x + w - 7, y + hh - 7, pal.muted, 1.5); }
          if (cross && build) { seg(c, x + 8, y + 8, x + w - 5, y + hh - 5, pal.red, 2); }
          if (text) Tfit(c, p, text, x + 1.5 + w / 2, y + 1.5 + hh / 2 - (s.weighted && !build ? 7 : 0), w - 6, { size: clamp(Math.min(w, hh) * .3, 11, 16), color: tc, weight: 700, halo: false });
          if (s.weighted && !build && ok0) Tfit(c, p, fracS(wt(s, i, j), tot), x + 1.5 + w / 2, y + 1.5 + hh / 2 + 9, w - 6, { size: 12, color: pal.muted, weight: 600, halo: false });
          hit(x, y, cwj[j], chi[i], () => build ? tableToggle(i, j) : evToggle(i, j));
        }));
        if (s.weighted) T(c, p, 'Bigger cell = bigger chance', W / 2, ay + 14, { size: 12, color: pal.muted, halo: false });
      };

      const drawTree = (c, p, tb) => {
        const s = sc(), W = p.w, H = p.h, build = st.task === 'build', pal = p.pal, bh = build ? 78 : 0;
        const L = treeLayout(s, W, H, tb, bh), TA = sumW(s.A), TB = sumW(s.B), tot = totalW(s);
        const lw2 = 40, lh = Math.min(26, L.dy - 4);
        T(c, p, s.n1.toLowerCase(), L.x1, tb + 6, { size: 12, color: pal.muted, halo: false });
        T(c, p, s.n2.toLowerCase(), Math.min(L.x2, W - 12 - tw(c, s.n2.toLowerCase(), 12) / 2), tb + 6, { size: 12, color: pal.muted, halo: false });
        if (s.weighted) T(c, p, 'chance', L.x2 + 38, tb + 6, { size: 12, color: pal.muted, align: 'left', halo: false });
        const showAll = !build;
        
        const grown1 = i => showAll || treeHas1(i);
        /* branches first, nodes on top */
        s.A.forEach((a, i) => {
          if (!grown1(i)) return;
          const col = colOf(p, a);
          seg(c, L.x0, L.ry, L.x1, L.l1[i], alpha(col, .9), 3);
          if (s.weighted) T(c, p, a.w + '/' + TA, (L.x0 + L.x1) / 2 - 2, (L.ry + L.l1[i]) / 2 - 10 * Math.sign(L.l1[i] - L.ry || 1) * 1, { size: 12, color: col, halo: true });
          s.B.forEach((b, j) => {
            if (!valid(s, i, j) || !(showAll || treeHas2(i, j))) return;
            const on = !build && st.evSel.has(key(i, j));
            seg(c, L.x1, L.l1[i], L.x2, L.leaf[key(i, j)], on ? pal.yellow : alpha(colOf(p, b), .9), on ? 4 : 3);
            if (s.weighted) T(c, p, b.w + '/' + TB, (L.x1 + L.x2) / 2, (L.l1[i] + L.leaf[key(i, j)]) / 2 - 9, { size: 12, color: colOf(p, b), halo: true });
          });
        });
        /* root */
        const rootSel = build && st.sel === 'root';
        tag(c, p, L.x0 - 24, L.ry - 13, 48, 26, 'start', { fill: alpha(pal.text, .1), stroke: rootSel ? pal.brass : pal['grid-strong'], lw: rootSel ? 3 : 1.5, color: pal.text, size: 12 });
        if (build) hit(L.x0 - 26, L.ry - 20, 52, 40, () => { st.sel = 'root'; st.msg = ''; });
        s.A.forEach((a, i) => {
          if (!grown1(i)) return;
          const col = colOf(p, a), sel = build && st.sel === i;
          tag(c, p, L.x1 - 18, L.l1[i] - 14, 36, 28, a.k, { fill: alpha(col, .2), stroke: sel ? pal.brass : col, lw: sel ? 3 : 1.5, color: pal.text, size: 14 });
          if (build) hit(L.x1 - 22, L.l1[i] - 20, 44, 40, () => { st.sel = i; st.msg = ''; });
          s.B.forEach((b, j) => {
            if (!valid(s, i, j) || !(showAll || treeHas2(i, j))) return;
            const k = key(i, j), y = L.leaf[k], on = !build && st.evSel.has(k);
            tag(c, p, L.x2 - lw2 / 2, y - lh / 2, lw2, lh, lab(s, i, j), { fill: on ? alpha(pal.yellow, .65) : alpha(pal.blue, .1), stroke: on ? pal.yellow : colOf(p, b), lw: on ? 3 : 1.5, color: pal.text, size: 13 });
            hit(L.x2 - lw2 / 2 - 4, y - Math.max(lh / 2, 15), lw2 + 8 + (s.weighted ? 56 : 0), Math.max(lh, 30), () => build ? treeLeafTap(i, j) : evToggle(i, j));
            if (s.weighted) T(c, p, fracS(wt(s, i, j), tot), L.x2 + 30, y, { size: 13, color: on ? pal.text : pal.muted, align: 'left', halo: false });
          });
        });
        if (build) {
          const y = H - bh + 2;
          seg(c, 12, y - 4, W - 12, y - 4, pal.grid, 1.5);
          const sel = st.sel;
          const opts = sel === 'root' ? s.A : s.B;
          const who = sel === 'root' ? 'the start' : 'the ' + s.A[sel].nm.toLowerCase() + ' (' + s.A[sel].k + ') node';
          T(c, p, 'Add a branch to ' + who + ':', 12, y + 10, { size: 12, color: pal.muted, align: 'left', halo: false });
          chipRow(c, p, 12, y + 24, opts, o => o.nm, () => false, idx => () => treeAdd(sel, idx), { label: 'All', fn: () => treeAddAll(sel) });
        }
      };

      P.onDraw = (c, p) => {
        hits = [];
        const s = sc(), W = p.w, pal = p.pal, build = st.task === 'build';
        const title = s.name;
        Tfit(c, p, title, 18, 18, W - 36, { size: 16, align: 'left', weight: 700, halo: false });
        const sub = build
          ? (st.rep === 'list' ? 'Make an organized list of every outcome.' : st.rep === 'table' ? 'Tap a cell to fill it with its outcome.' : 'Grow a branch for every choice.')
          : 'Tap every outcome that fits: "' + s.events[st.ev].name + '"';
        Tfit(c, p, sub, 18, 40, W - 36, { size: 13, align: 'left', color: pal.muted, weight: 600, halo: false });
        const tb = 50;
        if (st.rep === 'list') drawList(c, p, tb); else if (st.rep === 'table') drawTable(c, p, tb); else drawTree(c, p, tb);
      };

      /* ---------- actions ---------- */
      const invalidMsg = (s, i, j) => `${lab(s, i, j)} cannot happen. The ${s.A[i].nm.toLowerCase()} marble was not put back, so it is not in the bag for the second draw.`;
      const listAdd = j => {
        const s = sc(), i = st.pend;
        if (i === null) { st.msg = `First tap a ${lc(s.n1)} result, then a ${lc(s.n2)} result.`; return; }
        const dup = st.list.some(q => q[0] === i && q[1] === j);
        st.list.push([i, j]);
        st.msg = !valid(s, i, j) ? no('Not possible.') + ' ' + invalidMsg(s, i, j)
          : dup ? no('Repeat.') + ` ${lab(s, i, j)} is already in your list. A repeat is not a new outcome. Tap it to remove it.` : '';
      };
      const tableToggle = (i, j) => {
        const s = sc(), k = key(i, j);
        if (st.table.has(k)) { st.table.delete(k); st.msg = ''; return; }
        st.table.add(k);
        st.msg = valid(s, i, j) ? '' : no('Not possible.') + ' ' + invalidMsg(s, i, j);
      };
      const missingChildren = i => { const s = sc(); return s.B.map((b, j) => j).filter(j => valid(s, i, j) && !treeHas2(i, j)); };
      const advance = () => {
        const s = sc();
        if (st.sel === 'root') { if (s.A.every((a, i) => treeHas1(i))) { const n = s.A.findIndex((a, i) => missingChildren(i).length); st.sel = n >= 0 ? n : 'root'; } return; }
        if (!missingChildren(st.sel).length) { const n = s.A.findIndex((a, i) => treeHas1(i) && missingChildren(i).length); if (n >= 0) st.sel = n; }
      };
      const treeAdd = (sel, idx) => {
        const s = sc();
        if (sel === 'root') {
          if (treeHas1(idx)) { st.msg = `The start already has a ${s.A[idx].nm.toLowerCase()} branch.`; return; }
          st.tree.push(String(idx)); st.msg = ''; advance(); return;
        }
        if (!valid(s, sel, idx)) { st.msg = no('No branch there.') + ' ' + invalidMsg(s, sel, idx); return; }
        if (treeHas2(sel, idx)) { st.msg = `This node already has a ${s.B[idx].nm.toLowerCase()} branch.`; return; }
        st.tree.push(key(sel, idx)); st.msg = ''; advance();
      };
      const treeAddAll = sel => {
        const s = sc();
        if (sel === 'root') { s.A.forEach((a, i) => { if (!treeHas1(i)) st.tree.push(String(i)); }); st.msg = ''; advance(); return; }
        const m = missingChildren(sel); m.forEach(j => st.tree.push(key(sel, j)));
        st.msg = s.norep ? `After the ${s.A[sel].nm.toLowerCase()} marble is out, only ${s.B.length - 1} marbles are left, so this node gets ${s.B.length - 1} branches.` : '';
        advance();
      };
      const treeLeafTap = (i, j) => { const s = sc(); st.msg = `${lab(s, i, j)} is a leaf: one complete outcome (${describe(s, i, j)}).`; };
      const evToggle = (i, j) => {
        const s = sc(), k = key(i, j);
        if (!valid(s, i, j)) { st.msg = invalidMsg(s, i, j); return; }
        if (st.evSel.has(k)) st.evSel.delete(k); else st.evSel.add(k);
        st.msg = '';
      };

      /* ---------- feedback ---------- */
      const buildCheck = () => {
        const s = sc(), o = outs(s), parts = [];
        let have = new Set(), dups = [], bad = [];
        if (st.rep === 'list') {
          const seen = new Set();
          st.list.forEach(([i, j]) => { const k = key(i, j); if (!valid(s, i, j)) bad.push(lab(s, i, j)); else { if (seen.has(k)) dups.push(lab(s, i, j)); seen.add(k); have.add(k); } });
        } else if (st.rep === 'table') {
          st.table.forEach(k => { const [i, j] = k.split(',').map(Number); if (!valid(s, i, j)) bad.push(lab(s, i, j)); else have.add(k); });
        } else o.forEach(([i, j]) => { if (treeHas2(i, j)) have.add(key(i, j)); });
        const miss = o.filter(([i, j]) => !have.has(key(i, j)));
        if (!miss.length && !dups.length && !bad.length) {
          const thing = st.rep === 'list' ? 'list' : st.rep === 'table' ? 'table' : 'tree';
          parts.push(ok('Complete.') + ` Your ${thing} has all ${o.length} outcomes, with none missing and none repeated.`);
          parts.push(countLine(s));
          if (st.rep === 'list') {
            const inOrder = st.list.every(([i, j], n) => i === o[n][0] && j === o[n][1]);
            parts.push(inOrder ? 'Your list is organized: you went through every second result for each first result, in the same order each time. That is what makes a missing outcome easy to spot.'
              : 'Your list is complete but not in order. Next time go through the first results one at a time and use every second result each time. Then a missing outcome shows up as a gap.');
          } else if (st.rep === 'table') parts.push('Every cell is one outcome, so the number of cells is the number of rows times the number of columns.');
          else parts.push('Each leaf is one outcome. The number of leaves is the number of branches at the first stage times the number at the second.');
          if (s.norep) parts.push('Compare with the bag where the marble is put back. There the second stage has 3 branches, not 2, and the sample space has 9 outcomes.');
          if (s.weighted) parts.push('Here the four outcomes are not equally likely. Switch to "Find an event" to see why that matters.');
          if (s.id === 'coins') parts.push('Try the other two ways to show it. Each gives the same 4 outcomes.');
        } else {
          parts.push(no('Not yet.'));
          if (miss.length) {
            const nm = miss.map(([i, j]) => lab(s, i, j));
            parts.push(`Missing: ${names(nm)}.` + (st.rep === 'tree' ? ' ' + (() => { const no1 = s.A.filter((a, i) => !treeHas1(i)).map(a => a.nm.toLowerCase()); return no1.length ? 'The start has no ' + names(no1) + ' branch yet.' : ''; })() : ''));
            const mir = miss.find(([i, j]) => s.sym && i !== j && have.has(key(j, i)));
            if (mir) parts.push(`You have ${lab(s, mir[1], mir[0])} but not ${lab(s, mir[0], mir[1])}. They are different outcomes. ${lab(s, mir[0], mir[1])} means ${describe(s, mir[0], mir[1])}. ${lab(s, mir[1], mir[0])} means ${describe(s, mir[1], mir[0])}.`);
          }
          if (dups.length) parts.push(`Repeated: ${names(dups)}. Each outcome should appear once.`);
          if (bad.length) parts.push(`Not possible: ${names(bad)}. ${s.norep ? 'The first marble is not put back, so the second marble cannot be the same one.' : ''}`);
        }
        st.msg = parts.join('<br>');
      };

      const evInfo = () => {
        const s = sc(), ev = s.events[st.ev], o = outs(s), tot = totalW(s);
        const truth = o.filter(([i, j]) => ev.test(s.A[i].k, s.B[j].k));
        const marked = o.filter(([i, j]) => st.evSel.has(key(i, j)));
        return { s, ev, o, tot, truth, marked, N: o.length, k: marked.length, W: marked.reduce((t, [i, j]) => t + wt(s, i, j), 0) };
      };
      const evCheck = () => {
        const { s, ev, o, tot, truth, marked, N } = evInfo(), parts = [];
        const tk = new Set(truth.map(([i, j]) => key(i, j))), mk = new Set(marked.map(([i, j]) => key(i, j)));
        const miss = truth.filter(([i, j]) => !mk.has(key(i, j))), extra = marked.filter(([i, j]) => !tk.has(key(i, j)));
        const say = ([i, j]) => `${lab(s, i, j)} (${ev.r(s.A[i].k, s.B[j].k)})`;
        if (!miss.length && !extra.length) {
          parts.push(ok('Right.') + (truth.length ? ` You marked all ${truth.length} outcome${truth.length === 1 ? '' : 's'} that fit and no others: ${names(truth.map(([i, j]) => lab(s, i, j)), 12)}.` : ' No outcome fits, so you marked none.'));
          if (ev.note) parts.push(ev.note);
          if (s.weighted) parts.push(s.wnote);
        } else {
          parts.push(no('Not yet.'));
          if (extra.length) parts.push(`These do not fit "${lc(ev.name)}": ${names(extra.map(say), 5)}.`);
          if (miss.length) {
            const ord = miss.find(([i, j]) => s.sym && i !== j && mk.has(key(j, i)));
            parts.push(`You left out: ${names(miss.map(say), 5)}.`);
            if (ord) parts.push(`${lab(s, ord[0], ord[1])} and ${lab(s, ord[1], ord[0])} are different outcomes, so you count both. ${lab(s, ord[0], ord[1])} means ${describe(s, ord[0], ord[1])}.`);
            else if (marked.length && marked.length < truth.length) parts.push('Check every cell, leaf or row. More than one outcome can fit.');
          }
          if (s.id === 'dice' && st.ev === 0 && marked.length === 1) parts.push('Do not look for one "7". Each different pair of dice that adds to 7 is its own outcome.');
        }
        st.msg = parts.join('<br>');
      };

      /* ---------- readout ---------- */
      let ro;
      const upd = () => {
        const s = sc(), out = [];
        if (st.task === 'build') {
          out.push(`${kk('Counting principle')} ${countLine(s)}`);
          const n = st.rep === 'list' ? st.list.length : st.rep === 'table' ? st.table.size : st.tree.filter(k => k.includes(',')).length;
          out.push(`${kk('So far')} ${n} ${st.rep === 'tree' ? (n === 1 ? 'leaf' : 'leaves') : (n === 1 ? 'outcome' : 'outcomes')} in your ${st.rep}${st.rep === 'tree' ? '' : ''}`);
        } else {
          const { ev, tot, N, k, W, marked } = evInfo();
          out.push(`${kk('Event')} “${ev.name}”`);
          out.push(`${kk('Marked')} ${k} of ${N} outcomes` + (k ? ': ' + names(marked.map(([i, j]) => lab(s, i, j)), 10) : ''));
          const v = k / N, f = k + '/' + N, sf = fracS(k, N);
          out.push(`${kk(s.weighted ? 'Counting leaves' : 'Event over sample space')} ${f}${sf !== f ? ' = ' + sf : ''} ${dp(v)}`);
          if (s.weighted) {
            const wv = W / tot;
            out.push(`${kk('Using leaf chances')} ${W}/${tot}${fracS(W, tot) !== W + '/' + tot ? ' = ' + fracS(W, tot) : ''} ${dp(wv)}`);
          }
        }
        if (st.msg) out.push(st.msg);
        out.push(`${kk('Key')} ${s.key}`);
        ro.innerHTML = out.join('<br>');
      };
      const draw = () => { P.draw(); upd(); };

      /* ---------- controls ---------- */
      C.title('Experiment');
      const scnSel = C.select({ label: 'Choose an experiment', value: '0', options: SC.map((s, i) => ({ value: String(i), label: s.name })), onChange: v => { st.scn = +v; st.ev = 0; fresh(); sync(); } });
      C.title('Show the sample space as');
      const repBtns = C.buttons([
        { label: 'List', onClick: () => setRep('list') }, { label: 'Table', onClick: () => setRep('table') }, { label: 'Tree', onClick: () => setRep('tree') }]);
      const REPS = ['list', 'table', 'tree'];
      C.title('Task');
      const taskBtns = C.buttons([
        { label: 'Build it', onClick: () => setTask('build') }, { label: 'Find an event', onClick: () => setTask('event') }]);
      const evSel = C.select({ label: 'Event in words', value: '0', options: [{ value: '0', label: '-' }], onChange: v => { st.ev = +v; st.evSel = new Set(); st.msg = ''; sync(); } });
      const evWrap = evSel.parentElement;
      const act = C.buttons([
        { label: 'Check', primary: true, onClick: () => { st.task === 'build' ? buildCheck() : evCheck(); draw(); } },
        { label: 'Undo', onClick: () => { undo(); draw(); } },
        { label: 'Start over', onClick: () => { if (st.task === 'build') { st.list = []; st.table = new Set(); st.tree = []; st.pend = null; st.sel = 'root'; } else st.evSel = new Set(); st.msg = ''; draw(); } }]);
      const undo = () => {
        if (st.task !== 'build') { st.evSel = new Set(); st.msg = ''; return; }
        if (st.rep === 'list') st.list.pop();
        else if (st.rep === 'tree') { const k = st.tree.pop(); if (k !== undefined) st.sel = k.includes(',') ? +k.split(',')[0] : 'root'; }
        else { const a = [...st.table]; a.pop(); st.table = new Set(a); }
        st.msg = '';
      };
      C.hint('Tap the picture to build it. Press Check and the lesson explains what is missing or repeated.');
      ro = C.readout();

      const setRep = r => { if (!sc().reps.includes(r)) return; st.rep = r; st.msg = ''; sync(); };
      const setTask = t => { st.task = t; st.msg = ''; sync(); };
      const sync = () => {
        const s = sc();
        if (!s.reps.includes(st.rep)) st.rep = s.reps[0];
        scnSel.value = String(st.scn);
        repBtns.forEach((b, i) => { const on = REPS[i] === st.rep, avail = s.reps.includes(REPS[i]); b.className = on ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', on); b.disabled = !avail; });
        taskBtns.forEach((b, i) => { const on = (i === 0) === (st.task === 'build'); b.className = on ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', on); });
        evSel.innerHTML = ''; s.events.forEach((e, i) => { const op = h('option', { value: String(i) }, e.name); if (i === st.ev) op.selected = true; evSel.append(op); });
        evWrap.style.display = st.task === 'event' ? '' : 'none';
        act[0].textContent = st.task === 'build' ? 'Check' : 'Check my event';
        act[1].style.display = st.task === 'build' ? '' : 'none';
        act[2].textContent = st.task === 'build' ? 'Start over' : 'Clear marks';
        draw();
      };

      /* ---------- taps ---------- */
      const cv = P.canvas;
      const at = e => { const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; for (let n = hits.length - 1; n >= 0; n--) { const q = hits[n]; if (x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h) return q; } return null; };
      cv.addEventListener('pointerdown', e => { const q = at(e); if (!q) return; e.preventDefault(); q.fn(); draw(); });
      cv.addEventListener('pointermove', e => { cv.style.cursor = at(e) ? 'pointer' : 'default'; });

      sync();

      /* ---------- guided steps ---------- */
      const apply = (patch, immediate) => {
        const { scn, rep, task, ev, fill } = patch;
        if (scn !== undefined) st.scn = scn;
        if (rep !== undefined) st.rep = rep;
        if (task !== undefined) st.task = task;
        st.ev = ev !== undefined ? ev : 0;
        fresh();
        if (fill === 'tree1') { const s = sc(); s.A.forEach((a, i) => st.tree.push(String(i))); st.sel = 0; }
        sync();
      };
      return { destroy: () => P.destroy(), apply };
    }
  });
}
