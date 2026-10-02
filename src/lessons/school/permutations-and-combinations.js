/* =====================================================================
   SCHOOL — Permutations and combinations
   ===================================================================== */
{
  /* ---------- counting helpers ---------- */
  const ITEM = ['A', 'B', 'C', 'D', 'E'];
  const CK = ['blue', 'green', 'red', 'yellow', 'violet'];
  const ORD = ['1st', '2nd', '3rd', '4th', '5th'];
  const fact = n => (n <= 1 ? 1 : n * fact(n - 1));
  const permN = (n, r) => { let v = 1; for (let i = 0; i < r; i++) v *= n - i; return v; };
  const combN = (n, r) => permN(n, r) / fact(r);
  const prodTxt = (n, r) => Array.from({ length: r }, (_, i) => n - i).join(' × ');
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const plural = (w, k) => (k === 1 ? w : w + 's');
  const perms = (n, r) => {
    const out = [], rec = cur => {
      if (cur.length === r) { out.push(cur.slice()); return; }
      for (let i = 0; i < n; i++) if (!cur.includes(i)) { cur.push(i); rec(cur); cur.pop(); }
    };
    rec([]); return out;
  };
  const combos = (n, r) => {
    const out = [], rec = (s, cur) => {
      if (cur.length === r) { out.push(cur.slice()); return; }
      for (let i = s; i < n; i++) { cur.push(i); rec(i + 1, cur); cur.pop(); }
    };
    rec(0, []); return out;
  };
  const keyOf = a => a.map(i => ITEM[i]).join('');

  /* ---------- canvas drawing helpers ---------- */
  const FONT = '"Hanken Grotesk","Helvetica Neue",Arial,sans-serif';
  const T = (c, s, x, y, o) => {
    c.font = `${o.weight || 500} ${o.size || 14}px ${FONT}`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
    if (o.halo) { c.lineWidth = 4; c.strokeStyle = o.halo; c.lineJoin = 'round'; c.strokeText(s, x, y); }
    c.fillStyle = o.color; c.fillText(s, x, y);
  };
  const rr = (c, x, y, w, hh, r) => {
    r = Math.min(r, w / 2, hh / 2); c.beginPath(); c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + hh, r); c.arcTo(x + w, y + hh, x, y + hh, r); c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  const ring = (c, x, y, r, col, w) => { c.beginPath(); c.arc(x, y, r, 0, TAU); c.strokeStyle = col; c.lineWidth = w; c.stroke(); };

  /* ---------- the situations of step 1 ---------- */
  const SIT1 = {
    podium: { n: 5, r: 3, who: 'runner', thing: 'podiums', title: 'Podium', slotWord: 'place', podium: true,
      intro: 'Five runners finished a race. Fill the podium: tap a runner, or drag one onto the next open place.' },
    lock: { n: 5, r: 4, who: 'letter', thing: 'codes', title: 'Letter lock', slotWord: 'position',
      intro: 'A lock code uses 4 different letters from A, B, C, D, E. Build a code: tap a letter, or drag it onto the next open position.' },
    queue: { n: 4, r: 4, who: 'friend', thing: 'lines', title: 'Photo line', slotWord: 'spot',
      intro: 'Four friends line up for a photo. Tap a friend, or drag one, to fill the next open spot in the line.' }
  };
  const SIT2 = {
    p42: { n: 4, r: 2, vals: [12, 24, 2, 6], ans: 12, note: ['24 is 4! with no division. You must remove the slots you did not fill.', '2 is only (4−2)!, the part you divide by.', '6 divides by 4, but you divide by (4−2)! = 2.'] },
    p52: { n: 5, r: 2, vals: [20, 120, 6, 40], ans: 20, note: ['120 is 5! with no division. You must remove the slots you did not fill.', '6 is only (5−2)! = 3!, the part you divide by.', '40 divides by 3, but you divide by 3! = 6.'] },
    p43: { n: 4, r: 3, vals: [24, 4, 12, 6], ans: 24, note: ['4 divides by 3! = 6, but you divide by (4−3)! = 1!. Dividing by r! comes in the next step, for committees.', '12 divides by 2, but (4−3)! = 1! = 1.', '6 divides by 4, but (4−3)! = 1.'] }
  };

  /* ---------- the rounds of step 4 ---------- */
  const R4 = [
    { kind: 'pick', n: 8, r: 3, labels: ['President', 'Vice', 'Treasurer'], order: true, rep: false, tool: 'P', okTools: ['P', 'MUL'], val: 336, pos: 2,
      text: 'A club has 8 members. They elect a president, a vice president and a treasurer. No member can hold two offices.',
      whyOrder: 'Ana as president and Ben as treasurer is a different result from Ben as president and Ana as treasurer.',
      whyRep: 'No member can hold two offices, so a member who has a job is used up.',
      calc: 'P(8, 3) = 8 × 7 × 6 = 336',
      calcWhy: 'The president has 8 choices, then the vice president has 7 (one member is used up), then the treasurer has 6. 8 × 7 × 6 = 336. That is P(8, 3) = 8! ÷ 5!.',
      wrong: [[56, 'C(8, 3) = 56 counts only which three people are chosen, not who gets which job. Each trio can fill the jobs in 3! = 6 orders, so 56 × 6 = 336.'],
        [512, '8 × 8 × 8 = 512 would let one member take all three jobs.'],
        [21, '8 + 7 + 6 = 21 adds. The choices are made one after another, so each choice combines with every later one. Multiply.']] },
    { kind: 'pick', n: 8, r: 3, labels: ['member', 'member', 'member'], order: false, rep: false, tool: 'C', okTools: ['C'], val: 56, pos: 0,
      text: 'The same club picks a committee of 3 members. Every committee member does the same job.',
      whyOrder: 'The committee Ana, Ben, Cy is the same committee whichever order you name them.',
      whyRep: 'A member cannot sit on the committee twice, so a chosen member is used up.',
      calc: 'C(8, 3) = 8 × 7 × 6 ÷ 3! = 336 ÷ 6 = 56',
      calcWhy: 'First count ordered picks: 8 × 7 × 6 = 336. Each committee was counted 3! = 6 times, once for each order, so divide: 336 ÷ 6 = 56.',
      wrong: [[336, '336 = P(8, 3) counts ordered picks, so every committee is counted 6 times. Divide by 3! = 6.'],
        [512, '8 × 8 × 8 = 512 allows repeated members and counts different orders as different.'],
        [24, '8 × 3 = 24 multiplies the number of members by the number of seats. That is not how choices combine: the number of choices changes from seat to seat.']] },
    { kind: 'pick', n: 5, r: 3, labels: ['1st', '2nd', '3rd'], order: true, rep: true, tool: 'POW', okTools: ['POW', 'MUL'], val: 125, pos: 3,
      text: 'A locker code has 3 letters chosen from A, B, C, D, E. A letter may be used more than once. The code ABC is different from CBA.',
      whyOrder: 'ABC and CBA are different codes, so the order matters.',
      whyRep: 'The rule says a letter may be used more than once, so every position still has all 5 letters to choose from.',
      calc: '5³ = 5 × 5 × 5 = 125',
      calcWhy: 'Every position has all 5 letters, so the choices multiply: 5 × 5 × 5 = 5³ = 125. When items can repeat, the count is n^r.',
      wrong: [[60, '5 × 4 × 3 = 60 would be right if a letter could not repeat. Here every position has all 5 letters.'],
        [10, 'C(5, 3) = 10 ignores order and forbids repeats. Neither matches this code.'],
        [15, '5 + 5 + 5 = 15 adds. The positions are filled one after another, so multiply.']] },
    { kind: 'pick', n: 5, r: 3, labels: ['1st', '2nd', '3rd'], order: true, rep: false, tool: 'P', okTools: ['P', 'MUL'], val: 60, pos: 1,
      text: 'A new locker code has 3 letters chosen from A, B, C, D, E, and now no letter may be used twice. ABC is still different from CBA.',
      whyOrder: 'ABC and CBA are different codes, so the order matters.',
      whyRep: 'The new rule says no letter twice, so a used letter leaves the pool.',
      calc: 'P(5, 3) = 5 × 4 × 3 = 60',
      calcWhy: 'The first position has 5 letters, the second has 4, the third has 3: 5 × 4 × 3 = 60. That is 25 fewer than the 125 codes when letters could repeat.',
      wrong: [[125, '5³ = 125 lets a letter repeat. The new rule forbids that.'],
        [10, 'C(5, 3) = 10 ignores order, but ABC and CBA are different codes. Each set of 3 letters gives 3! = 6 codes, so 10 × 6 = 60.'],
        [15, '5 + 4 + 3 = 15 adds. The positions are filled one after another, so multiply.']] },
    { kind: 'pick', n: 10, r: 3, labels: ['card', 'card', 'card'], order: false, rep: false, tool: 'C', okTools: ['C'], val: 120, pos: 3,
      text: 'You are dealt 3 cards from a small deck of 10 different cards. A hand is the same hand however you pick up the cards.',
      whyOrder: 'A hand of 3 cards is the same hand in whatever order you pick the cards up.',
      whyRep: 'A card in your hand cannot be dealt to you again.',
      calc: 'C(10, 3) = 10 × 9 × 8 ÷ 3! = 720 ÷ 6 = 120',
      calcWhy: 'Ordered deals: 10 × 9 × 8 = 720. Each hand appears in 3! = 6 orders, so there are 720 ÷ 6 = 120 different hands.',
      wrong: [[720, '720 = P(10, 3) counts ordered deals. Each hand is counted 6 times, so divide by 3! = 6.'],
        [1000, '10³ = 1000 lets the same card be dealt again and counts order.'],
        [30, '10 + 10 + 10 = 30 adds, and also forgets that a dealt card is used up.']] },
    { kind: 'mult', groups: [3, 4, 2], names: ['sandwiches', 'drinks', 'fruits'], op: 'all', tool: 'MUL', okTools: ['MUL'], val: 24, pos: 1,
      text: 'A lunch combo has 1 of 3 sandwiches, 1 of 4 drinks and 1 of 2 fruits.',
      whyAll: 'You pick one from each menu, all in the same combo.',
      calc: '3 × 4 × 2 = 24',
      calcWhy: 'Each of the 3 sandwiches goes with each of the 4 drinks (12 pairs), and each pair goes with each of the 2 fruits: 12 × 2 = 24. This is the multiplication principle.',
      wrong: [[9, '3 + 4 + 2 = 9 adds. You pick from every menu at once, so each sandwich pairs with every drink and fruit.'],
        [12, '3 × 4 = 12 forgets the fruit. Every menu needs a factor.'],
        [8, '4 × 2 = 8 forgets the sandwich. Every menu needs a factor.']] },
    { kind: 'add', groups: [4, 3], names: ['sports teams', 'music clubs'], op: 'one', tool: 'ADD', okTools: ['ADD'], val: 7, pos: 0,
      text: 'After school you join exactly one activity. You can choose from 4 sports teams or from 3 music clubs.',
      whyAll: 'You join only one activity, from one group or from the other, never both.',
      calc: '4 + 3 = 7',
      calcWhy: 'The two groups do not overlap and you pick only one activity, so the options just add up: 4 + 3 = 7. This is the addition principle.',
      wrong: [[12, '4 × 3 = 12 pairs a team with a club. You join only one activity, so there are no pairs.'],
        [4, '4 counts only the sports teams. The music clubs are options too.'],
        [3, '3 counts only the music clubs. The sports teams are options too.']] },
    { kind: 'pick', n: 10, r: 4, labels: ['number', 'number', 'number', 'number'], order: false, rep: false, tool: 'C', okTools: ['C'], val: 210, pos: 1, prob: true,
      text: 'In a lottery, 4 different numbers from 1 to 10 are drawn. The order they are drawn in does not matter. You hold one ticket with 4 numbers.',
      whyOrder: 'The ticket 2, 5, 7, 9 wins whatever order the numbers come out in.',
      whyRep: 'The 4 drawn numbers are different, so a number that is drawn is used up.',
      calc: 'C(10, 4) = 10 × 9 × 8 × 7 ÷ 4! = 5040 ÷ 24 = 210',
      calcWhy: 'Ordered draws: 10 × 9 × 8 × 7 = 5040. Each set of 4 numbers shows up in 4! = 24 orders, so there are 5040 ÷ 24 = 210 different tickets.',
      wrong: [[5040, '5040 = P(10, 4) counts ordered draws. Each set of 4 numbers is counted 24 times, so divide by 4! = 24.'],
        [10000, '10⁴ = 10 000 lets numbers repeat and counts order.'],
        [40, '10 × 4 = 40 is not a counting rule here: the number of choices shrinks from draw to draw.']] }
  ];
  const TOOLS = [['MUL', 'Multiplication principle'], ['ADD', 'Addition principle'], ['P', 'Permutation P(n, r)'], ['C', 'Combination C(n, r)'], ['POW', 'Power n<sup>r</sup>']];
  const TOOLNAME = { MUL: 'the multiplication principle', ADD: 'the addition principle', P: 'a permutation, P(n, r)', C: 'a combination, C(n, r)', POW: 'a power, n^r' };

  /* Pascal tasks of step 3 */
  const PTASKS = [[5, 2], [6, 2], [4, 1], [6, 4]];

  register({
    id: 'permutations-and-combinations', level: 'school',
    title: 'Permutations and combinations',
    blurb: 'Count arrangements and groups by filling slots, then learn when order matters and when it does not.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 1.5;
      const cols = [pal.blue, pal.green, pal.red, pal.yellow, pal.violet];
      const ctx = p.ctx;
      for (let i = 0; i < 5; i++) {
        const x = (i - 2) * .56, y = .62;
        p.dot(x, y, 7.5, pal.stage, cols[i], 2);
        ctx.beginPath(); ctx.arc(p.X(x), p.Y(y), 7.5, 0, TAU); ctx.fillStyle = alpha(cols[i], .3); ctx.fill();
      }
      for (let k = 0; k < 3; k++) {
        const x = (k - 1) * .72, y = -.5, s = .27;
        p.path([[x - s, y - s], [x + s, y - s], [x + s, y + s], [x - s, y + s]], { stroke: pal['grid-strong'], width: 1.6, close: true, dash: [4, 4] });
        p.dot(x, y, 7.5, pal.stage, cols[[2, 0, 3][k]], 2);
        ctx.beginPath(); ctx.arc(p.X(x), p.Y(y), 7.5, 0, TAU); ctx.fillStyle = alpha(cols[[2, 0, 3][k]], .3); ctx.fill();
      }
      p.arrow(-.1, .3, -.1, -.12, pal.muted, 2);
    },
    hook: String.raw`Five runners race for three podium places. How many different podiums are possible, and why is choosing a team of three so much smaller than ranking them?`,
    steps: [
      { title: 'Fill the slots',
        text: String.raw`<p>Five runners finished a race. Fill the podium by tapping a runner, or by dragging one onto the next open place. Watch how many runners are still in the tray each time.</p><p>Then answer in the panel: how many choices did each place have, and how many different podiums are there? Try the other situations in the menu. In the photo line every friend gets a place, which leads to the factorial \(n!\).</p>`,
        set: { mode: 'slots', sit: 'podium' } },
      { title: 'Order matters: permutations',
        text: String.raw`<p>Now there are \(4\) tiles and \(2\) slots. Build arrangements. \(AB\) and \(BA\) are different, because the order matters. Each new arrangement flies into a list sorted by its first tile.</p><p>After four arrangements, predict how long the whole list will be. Then watch the rest of the list fill in and check your count against it. Change the menu to try \(5\) tiles or \(3\) slots.</p>`,
        set: { mode: 'perm', sit: 'p42' } },
      { title: 'Order does not matter: combinations',
        text: String.raw`<p>A committee of \(3\) is chosen from \(5\) students. Tap three students. The sixty ordered picks are laid out below, and the ones with exactly your three students are highlighted. They are all the same committee.</p><p>Count them, then press the button to group the same committees and divide. Afterwards switch the menu to Pascal's triangle to see the symmetry \(C(n,r)=C(n,n-r)\).</p>`,
        set: { mode: 'comb', view: 'group' } },
      { title: 'Choose the right tool',
        text: String.raw`<p>Each situation asks for a count. Decide whether order matters and whether repeats are allowed, choose the tool, then compute the count. The map shows where your answers lead.</p><p>The last situation is a lottery. Its count is the size of the sample space, so the chance of winning with one ticket is one over that number.</p>`,
        set: { mode: 'tool', round: 0 } }
    ],
    formal: String.raw`
      <h3>The multiplication and addition principles</h3>
      <p>If a task has several steps, and step 1 can be done in \(a\) ways, step 2 in \(b\) ways, step 3 in \(c\) ways, then the whole task can be done in
      \[ a\cdot b\cdot c \]
      ways. This is the <b>multiplication principle</b>. A <em>tree diagram</em> shows it: from each of the \(a\) branches of step 1, \(b\) branches leave, and from each of those, \(c\) more. The number of ends is the product. If the choices are <em>either one thing or another</em> and the two groups do not overlap, you add instead: with \(4\) teams or \(3\) clubs there are \(4+3=7\) options. This is the <b>addition principle</b>.</p>
      <h3>Factorial</h3>
      <p>Arranging all \(n\) different items in a row has \(n\) choices for the first spot, \(n-1\) for the second, and so on down to \(1\):
      \[ n! = n\cdot(n-1)\cdot(n-2)\cdots 2\cdot 1. \]
      For example \(4!=4\cdot3\cdot2\cdot1=24\) and \(5!=120\). We define \(0!=1\).</p>
      <h3>Permutations: order matters</h3>
      <p>An <b>arrangement</b> of \(r\) items taken from \(n\) different items, with no item used twice, is a <b>permutation</b>. The first slot has \(n\) choices, the second \(n-1\), and the \(r\)-th has \(n-r+1\):
      \[ P(n,r)=n(n-1)\cdots(n-r+1)=\frac{n!}{(n-r)!}. \]
      The fraction form works because \(n!\) continues past the \(r\)-th factor, and dividing by \((n-r)!\) cancels the extra factors.
      <em>Example.</em> Podiums with \(3\) places from \(5\) runners: \(P(5,3)=5\cdot4\cdot3=60=\dfrac{5!}{2!}\).</p>
      <p><em>Repeats.</em> If items may be used again, every slot has all \(n\) choices and the count is \(n^r\). A \(3\)-letter code from \(5\) letters, repeats allowed, has \(5^3=125\) possibilities. If some of the items are identical, divide by the ways to swap the identical ones: the letters of LEVEL can be arranged in \(\dfrac{5!}{2!\,2!}=30\) ways, because the two L's and the two E's cannot be told apart.</p>
      <h3>Combinations: order does not matter</h3>
      <p>A <b>combination</b> is a group of \(r\) items taken from \(n\), where only <em>which</em> items matter. Every group of \(r\) items can be put in order in \(r!\) ways, so the \(P(n,r)\) ordered picks fall into groups of \(r!\), one group for each combination:
      \[ C(n,r)=\frac{P(n,r)}{r!}=\frac{n!}{r!\,(n-r)!}. \]
      That is why you divide by \(r!\): you counted each group \(r!\) times.
      <em>Example.</em> Committees of \(3\) from \(5\) students: \(C(5,3)=\dfrac{60}{3!}=\dfrac{60}{6}=10\).</p>
      <h3>Symmetry</h3>
      <p>Choosing \(r\) items to include is the same as choosing the \(n-r\) items to leave out, so
      \[ C(n,r)=C(n,n-r). \]
      Check: \(C(5,2)=\dfrac{5\cdot 4}{2}=10=C(5,3)\).</p>
      <h3>Pascal's triangle</h3>
      <p>Write \(C(n,r)\) in row \(n\), position \(r\), counting both from \(0\). Row \(5\) reads \(1,5,10,10,5,1\). Each entry is the sum of the two above it:
      \[ C(n,r)=C(n-1,r-1)+C(n-1,r). \]
      Reason: fix one person. Committees that include that person need \(r-1\) more from the other \(n-1\) people: \(C(n-1,r-1)\) of them. Committees that leave that person out choose all \(r\) from the other \(n-1\): \(C(n-1,r)\) of them. The two kinds do not overlap, so the addition principle adds them. <em>Example.</em> \(C(5,2)=C(4,1)+C(4,2)=4+6=10\).</p>
      <h3>Which tool?</h3>
      <p>Ask two questions. Does the order matter? Can an item be used again? Order matters and no repeats: \(P(n,r)\). Order matters and repeats are allowed: \(n^r\). Order does not matter and no repeats: \(C(n,r)\). Separate menus chosen together: multiply. Either-or options: add.</p>
      <h3>From counting to probability</h3>
      <p>When all outcomes are equally likely, the probability of one particular outcome is \(\dfrac{1}{\text{size of the sample space}}\). In a lottery that draws \(4\) different numbers from \(10\), the sample space has \(C(10,4)=210\) tickets, so one ticket wins with probability \(\dfrac{1}{210}\).</p>`,
    check: [
      { q: 'A club has 6 members. It elects a president, a vice president and a treasurer, and no member may hold two offices. How many different ways can the three offices be filled?',
        choices: ['15', '20', '120', '216'], answer: 2,
        why: String.raw`The offices are filled one after another: \(6\) choices for president, \(5\) for vice president, \(4\) for treasurer. \(6\cdot5\cdot4=120\), which is \(P(6,3)\). The answer \(15\) adds the numbers. The answer \(20\) is \(C(6,3)\), which ignores who holds which office. The answer \(216=6^3\) would let one member hold all three offices.`,
        hint: String.raw`Order matters because the offices are different jobs. After someone gets an office, that member cannot be used again.` },
      { q: 'A coach must choose 2 players from a team of 5 to carry the equipment. The two jobs are the same, so the order of the two players does not matter. How many different pairs can the coach choose?',
        choices: ['5', '10', '20', '25'], answer: 1,
        why: String.raw`There are \(5\cdot4=20\) ordered picks. Each pair appears in \(2!=2\) orders, so divide by \(2\): \(C(5,2)=\dfrac{20}{2}=10\). The answer \(20\) counts each pair twice, once in each order. The answer \(25=5^2\) allows the same player twice. The answer \(5\) is just the number of players.`,
        hint: String.raw`First count the ordered picks, then think about how many orders each pair has.` }
    ],
    links: { prereq: ['compound-events-and-tree-diagrams'], related: ['pascals-triangle-and-the-galton-board', 'probability-with-repeated-trials', 'sample-spaces-and-probability', 'two-way-tables-and-conditional-probability'] },

    mount({ stage, controls: C }) {
      const P = new Plane(stage, { span: 5 }), cv = P.canvas;
      if (P.coordEl) P.coordEl.style.display = 'none';
      cv.tabIndex = 0; cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', 'Colored tokens that you tap or drag into slots, a growing list of arrangements, a grid of committees, Pascal\'s triangle, or a map of counting tools, depending on the step. The panel beside it asks the questions and explains each answer. Keys A to E place the matching token.');
      const st = { mode: 'slots', sit1: 'podium', sit2: 'p42', view: 'group', round: 0 };
      let s1, s2, s3, s3p, s4;
      let hits = [], zone = null, busy = false, drag = null, hov = null;
      const objs = new Map(), pops = {}, timers = [];
      const later = (fn, ms) => { const id = setTimeout(fn, reduceMotion ? 0 : ms); timers.push(id); return id; };
      const draw = () => P.requestDraw();

      /* ---------- panel: question text, feedback, answer buttons, controls ---------- */
      const askEl = C.readout(), host = askEl.parentNode;
      const fb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
      const qa = h('div', { class: 'ctl buttons' });
      const grp = build => {
        const i = host.children.length; build();
        const w = h('div', { style: 'display:flex;flex-direction:column;gap:16px' });
        [...host.children].slice(i).forEach(e => w.append(e)); host.append(w); return w;
      };
      let sel1, sel2, sel3, sel4, clr1, clr2, rst3, gS1, gS2, gS3, gS4;
      gS1 = grp(() => {
        sel1 = C.select({ label: 'Situation', value: 'podium', options: [
          { value: 'podium', label: 'Podium: 3 places from 5 runners' }, { value: 'lock', label: 'Lock: 4 different letters from 5' }, { value: 'queue', label: 'Photo line: 4 friends in a row' }],
          onChange: v => { st.sit1 = v; reset1(); } });
        [clr1] = C.buttons([{ label: 'Clear the slots', onClick: () => reset1() }]);
      });
      gS2 = grp(() => {
        sel2 = C.select({ label: 'Situation', value: 'p42', options: [
          { value: 'p42', label: '4 tiles, 2 slots' }, { value: 'p52', label: '5 tiles, 2 slots' }, { value: 'p43', label: '4 tiles, 3 slots' }],
          onChange: v => { st.sit2 = v; reset2(); } });
        [clr2] = C.buttons([{ label: 'Clear the list', onClick: () => reset2() }]);
      });
      gS3 = grp(() => {
        sel3 = C.select({ label: 'Activity', value: 'group', options: [
          { value: 'group', label: 'Committees: 3 from 5 students' }, { value: 'pascal', label: 'Symmetry and Pascal\'s triangle' }],
          onChange: v => { st.view = v; reset3(); } });
        [rst3] = C.buttons([{ label: 'Start over', onClick: () => reset3() }]);
      });
      gS4 = grp(() => {
        sel4 = C.select({ label: 'Situation', value: '0', options: R4.map((r, i) => ({ value: String(i), label: `${i + 1}. ${['Officers', 'Committee', 'Code with repeats', 'Code, no repeats', 'Hand of cards', 'Lunch combo', 'One activity', 'Lottery'][i]}` })),
          onChange: v => { st.round = +v; reset4(); } });
      });
      host.insertBefore(fb, askEl.nextSibling); host.insertBefore(qa, fb.nextSibling);
      const vis = (el, on) => { el.style.display = on ? '' : 'none'; };
      const setFb = t => { fb.innerHTML = t; };
      const clearQ = () => { qa.innerHTML = ''; };
      /* opts: [{label (html), val, primary}] */
      const showQ = (opts, onPick) => {
        qa.innerHTML = '';
        opts.forEach(op => {
          const b = h('button', { type: 'button', class: 'btn' + (op.primary ? ' primary' : '') });
          b.innerHTML = op.label;
          b.addEventListener('click', () => onPick(op, b));
          qa.append(b);
        });
      };
      const markBad = b => { b.disabled = true; b.style.opacity = '.75'; b.style.textDecoration = 'line-through'; b.style.borderColor = 'var(--red)'; };

      /* ---------- animation: tokens glide between layout targets ---------- */
      const glide = (key, tx, ty, ms = 480, delay = 0) => {
        const now = performance.now();
        let o = objs.get(key);
        if (!o) { o = { x: tx, y: ty, fx: tx, fy: ty, tx, ty, t0: 0, ms: 0 }; objs.set(key, o); return o; }
        if (drag && drag.moved && drag.key === key) { o.x = drag.x; o.y = drag.y; o.tx = null; return o; }
        if (o.tx !== tx || o.ty !== ty) { o.fx = o.x; o.fy = o.y; o.tx = tx; o.ty = ty; o.t0 = now + delay; o.ms = reduceMotion ? 0 : ms; }
        const u = o.ms ? clamp((now - o.t0) / o.ms, 0, 1) : 1, e = ease(u);
        o.x = lerp(o.fx, o.tx, e); o.y = lerp(o.fy, o.ty, e);
        if (u < 1) busy = true;
        return o;
      };
      const startAt = (key, x, y) => { objs.set(key, { x, y, fx: x, fy: y, tx: x, ty: y, t0: 0, ms: 0 }); };
      const pop = key => { pops[key] = performance.now(); };
      const popS = key => {
        const t = pops[key]; if (t === undefined || reduceMotion) return 1;
        const u = (performance.now() - t) / 420; if (u >= 1) return 1; busy = true;
        return 1 + .22 * Math.sin(Math.PI * u);
      };
      const fade = (t0, ms = 320) => { const u = reduceMotion ? 1 : clamp((performance.now() - t0) / ms, 0, 1); if (u < 1) busy = true; return ease(u); };

      /* ---------- shared drawing: tokens, slots, pills ---------- */
      const tok = (c, p, x, y, r, i, o = {}) => {
        const pal = p.pal, col = pal[CK[i % 5]];
        c.save(); c.globalAlpha *= o.alpha === undefined ? 1 : o.alpha;
        if (o.lift) { c.shadowColor = 'rgba(0,0,0,.28)'; c.shadowBlur = 14; c.shadowOffsetY = 5; }
        c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = pal.stage; c.fill();
        c.shadowColor = 'transparent'; c.fillStyle = alpha(col, o.fill === undefined ? .3 : o.fill); c.fill();
        ring(c, x, y, r, col, o.w || 2.2);
        if (o.label !== false && r >= 9) T(c, ITEM[i], x, y + .5, { size: clamp(r * .95, 10, 22), color: pal.text, weight: 600 });
        c.restore();
      };
      const slotBox = (c, p, x, y, s, o = {}) => {
        const pal = p.pal;
        rr(c, x - s / 2, y - s / 2, s, s, s * .2); c.fillStyle = alpha(pal.text, o.on ? .08 : .03); c.fill();
        c.setLineDash(o.solid ? [] : [5, 5]); c.strokeStyle = o.stroke || pal['grid-strong']; c.lineWidth = o.w || 1.6; c.stroke(); c.setLineDash([]);
      };
      const pill = (c, p, x, y, txt, o = {}) => {
        const pal = p.pal, fs = o.size || 14;
        c.font = `${o.weight || 700} ${fs}px ${FONT}`;
        const w = Math.max(c.measureText(txt).width + 18, fs * 1.9), hh = fs * 1.75;
        rr(c, x - w / 2, y - hh / 2, w, hh, hh / 2);
        c.fillStyle = pal.stage; c.fill(); c.fillStyle = alpha(o.col || pal.green, o.fill === undefined ? .22 : o.fill); c.fill();
        c.strokeStyle = o.col || pal.green; c.lineWidth = o.w || 1.6; c.stroke();
        T(c, txt, x, y + .5, { size: fs, color: pal.text, weight: o.weight || 700 });
      };

      /* ---------- pointer: tap or drag tokens, click rectangles and circles ---------- */
      const xy = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      const hitAt = (x, y) => {
        for (let k = hits.length - 1; k >= 0; k--) {
          const q = hits[k];
          if (q.w !== undefined ? (x >= q.x - q.w / 2 && x <= q.x + q.w / 2 && y >= q.y - q.h / 2 && y <= q.y + q.h / 2) : Math.hypot(x - q.x, y - q.y) <= q.r) return q;
        }
        return null;
      };
      const inZone = (x, y) => zone && x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h;
      cv.addEventListener('pointerdown', e => {
        const [x, y] = xy(e), q = hitAt(x, y); if (!q) return;
        e.preventDefault(); cv.setPointerCapture(e.pointerId);
        drag = { q, x, y, x0: x, y0: y, moved: false, key: q.drag ? q.key : null };
      });
      cv.addEventListener('pointermove', e => {
        const [x, y] = xy(e);
        if (drag) {
          if (!drag.moved && drag.q.drag && Math.hypot(x - drag.x0, y - drag.y0) > 8) drag.moved = true;
          drag.x = x; drag.y = y; if (drag.moved) draw(); return;
        }
        const q = hitAt(x, y), k = q ? q.id : null;
        cv.style.cursor = q ? (q.drag ? 'grab' : 'pointer') : 'default';
        if (k !== hov) { hov = k; draw(); }
      });
      cv.addEventListener('pointerleave', () => { if (hov !== null) { hov = null; draw(); } });
      const endDrag = e => {
        const d = drag; drag = null; if (!d) return;
        const [x, y] = xy(e);
        if (d.moved) { if (inZone(x, y)) M[st.mode].tap && M[st.mode].tap(d.q, true); }
        else if (e.type === 'pointerup') M[st.mode].tap && M[st.mode].tap(d.q, false);
        draw();
      };
      cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);
      cv.addEventListener('keydown', e => {
        const i = ITEM.indexOf(e.key.toUpperCase());
        if (i >= 0 && e.key.length === 1) { const q = hits.find(z => z.item === i); if (q) { M[st.mode].tap && M[st.mode].tap(q, false); draw(); } }
      });

      /* =================== 1. SLOTS AND THE MULTIPLICATION PRINCIPLE =================== */
      const reset1 = () => {
        cancelTimers();
        s1 = { slots: [], phase: 'fill', ci: 0, ans: [], val: permN(SIT1[st.sit1].n, SIT1[st.sit1].r) };
        setFb(''); refresh(); draw();
      };
      const cancelTimers = () => { timers.splice(0).forEach(clearTimeout); };
      const place1 = i => {
        if (s1.phase !== 'fill' || s1.slots.includes(i)) return;
        const sit = SIT1[st.sit1], { n, r, who } = sit, k = s1.slots.length;
        s1.slots.push(i);
        const avail = n - k, left = avail - 1;
        let t = `You chose ${ITEM[i]} for ${ORD[k]}. That slot had ${avail} ${plural(who, avail)} to choose from. ${ITEM[i]} is now used up, so ${left} ${plural(who, left)} ${left === 1 ? 'is' : 'are'} left.`;
        if (k + 1 === r) t = `You chose ${ITEM[i]} for ${ORD[k]}. That slot had ${avail} ${plural(who, avail)} to choose from. The ${sit.podium ? 'podium' : sit.who === 'friend' ? 'line' : 'code'} is full. Now count the choices.`;
        setFb(t);
        if (s1.slots.length === r) { s1.phase = 'choices'; s1.ci = 0; }
        refresh(); draw();
      };
      const refresh1 = () => {
        const sit = SIT1[st.sit1], { n, r, who } = sit, noun = plural(who, 2);
        if (s1.phase === 'fill') {
          askEl.innerHTML = `<p><b>${sit.intro}</b></p><span class="k">Next open ${sit.slotWord}:</span> ${ORD[s1.slots.length]}`;
          clearQ();
        } else if (s1.phase === 'choices') {
          const ci = s1.ci, c0 = n - ci;
          askEl.innerHTML = `<p><b>How many ${noun} could have been chosen for ${ORD[ci]}?</b></p><span class="k">Think about who was still in the tray when that slot was filled.</span>`;
          showQ(Array.from({ length: n }, (_, v) => ({ label: String(v + 1), val: v + 1 })), (op, b) => {
            if (op.val === c0) {
              s1.ans[ci] = c0; pop('b' + ci);
              setFb(`${ok('Yes.')} ${ORD[ci]} had ${c0} ${plural(who, c0)}${ci ? `, because ${ci} ${plural(who, ci)} ${ci === 1 ? 'was' : 'were'} already in earlier slots (${s1.slots.slice(0, ci).map(j => ITEM[j]).join(', ')}) and cannot be used twice` : `: nobody was placed yet, so all ${n} could go first`}.`);
              s1.ci++; if (s1.ci === r) s1.phase = 'count';
              refresh(); draw();
            } else {
              markBad(b);
              if (ci === 0) setFb(`${no('Not yet.')} Nothing is placed yet, so every one of the ${n} ${noun} can take ${ORD[0]}.`);
              else if (op.val > c0) setFb(`${no('Not yet.')} ${ci} ${plural(who, ci)} already ${ci === 1 ? 'stands' : 'stand'} in earlier slots. A ${who} cannot be used twice, so ${n} − ${ci} = ${c0}, not ${op.val}.`);
              else setFb(`${no('Not yet.')} Count the ${noun} left in the tray: ${n} − ${ci} = ${c0}, not ${op.val}.`);
            }
          });
        } else if (s1.phase === 'count') {
          askEl.innerHTML = `<p><b>Every choice in one slot can be paired with every choice in the next. How many different ${sit.thing} are there?</b></p><span class="k">Choices per slot:</span> ${s1.ans.join(', ')}`;
          const ch = s1.ans, correct = s1.val;
          const sum = ch.reduce((a, b) => a + b, 0), pw = Math.pow(n, r);
          let miss = permN(n, r - 1); if (miss === correct) miss = permN(n, Math.max(r - 2, 1));
          const opts = [
            { val: correct, t: 'ok' },
            { val: sum, t: `${ch.join(' + ')} = ${sum} adds the choices. Adding is for either-or. Here each choice for ${ORD[0]} goes with every choice for the next slots, so the counts multiply.` },
            { val: pw, t: `${Array(r).fill(n).join(' × ')} = ${pw} would be right if the same ${who} could fill a slot again. A used ${who} is out, so the later slots have fewer choices.` },
            { val: miss, t: `${prodTxt(n, miss === permN(n, r - 1) ? r - 1 : r - 2)} = ${miss} leaves out a slot. Every slot needs a factor.` }
          ];
          const order = { podium: [1, 0, 2, 3], lock: [3, 2, 0, 1], queue: [2, 1, 3, 0] }[st.sit1];
          const seen = new Set(), list = order.map(k => opts[k]).filter(o => !seen.has(o.val) && seen.add(o.val));
          showQ(list.map(o => ({ label: String(o.val), val: o.val, t: o.t })), (op, b) => {
            if (op.val === correct) {
              s1.phase = n === r ? 'fact' : 'done'; pop('eq');
              setFb(`${ok('Yes.')} ${ch.join(' × ')} = ${correct}. ${n === r ? `Every one of the ${n} ${noun} got a place, so this product is called ${n} factorial, written ${n}! = ${prodTxt(n, n)} = ${correct}.` : `Each slot has one fewer choice than the one before, because used ${noun} are out.`}`);
              refresh(); draw();
            } else { markBad(b); setFb(`${no('Not yet.')} ${op.t}`); }
          });
        } else if (s1.phase === 'fact') {
          askEl.innerHTML = `<p><b>Now five friends line up for a photo. How many different lines are there? That number is 5!</b></p><span class="k">5! = 5 × 4 × 3 × 2 × 1</span>`;
          showQ([{ label: '25', val: 25, t: '5 × 5 = 25 uses only two slots and lets a friend repeat. Use 5 × 4 × 3 × 2 × 1.' }, { label: '15', val: 15, t: '5 + 4 + 3 + 2 + 1 = 15 adds. The choices multiply.' }, { label: '120', val: 120 }, { label: '20', val: 20, t: '5 × 4 = 20 stops after two slots. All five friends need a place.' }], (op, b) => {
            if (op.val === 120) { s1.phase = 'done'; setFb(`${ok('Yes.')} 5! = 5 × 4 × 3 × 2 × 1 = 120. Arranging all n items in a row can be done in n! ways.`); refresh(); draw(); }
            else { markBad(b); setFb(`${no('Not yet.')} ${op.t}`); }
          });
        } else {
          askEl.innerHTML = `<p><b>${s1.val} ${sit.thing} in all.</b></p><span class="k">Try another situation in the menu, or clear the slots and fill them in a different way. The count of choices stays the same.</span>`;
          clearQ();
        }
      };
      const tap1 = (q, dropped) => {
        if (q.kind !== 'tok') return;
        if (q.placed) { if (s1.phase === 'fill' && q.last) { s1.slots.pop(); setFb(''); refresh(); } return; }
        place1(q.item);
      };
      const d1 = (c, p) => {
        const pal = p.pal, sit = SIT1[st.sit1], { n, r, who } = sit, W = p.w, H = p.h, m = clamp(W * .05, 14, 34);
        const ss = clamp(Math.min((W - 2 * m) / (r + (r - 1) * .22), H * .2), 44, 112), gap = ss * .22;
        const x0 = W / 2 - (r * ss + (r - 1) * gap) / 2 + ss / 2, sy = H * .31, tr = clamp(ss * .32, 16, 32);
        T(c, sit.title, m, 24, { size: 14, color: pal.text, align: 'left', weight: 600 });
        T(c, `${n} ${plural(who, n)}, ${r} ${plural(sit.slotWord, r)}`, W - m, 24, { size: 12.5, color: pal.muted, align: 'right' });
        zone = { x: 0, y: sy - ss * .9, w: W, h: ss * 1.8 + 60 };
        const slotX = k => x0 + k * (ss + gap), trayY = H * .8, sp = Math.min((W - 2 * m) / n, tr * 2 + 24);
        const trayX = i => W / 2 + (i - (n - 1) / 2) * sp;
        const next = s1.phase === 'fill' ? s1.slots.length : -1, over = drag && drag.moved && inZone(drag.x, drag.y);
        for (let k = 0; k < r; k++) {
          const x = slotX(k), filled = k < s1.slots.length;
          if (sit.podium) {
            const bh = 28 + (r - 1 - k) * 14;
            rr(c, x - ss / 2, sy + ss / 2 + 8, ss, bh, 5); c.fillStyle = alpha(pal.text, .05); c.fill(); c.strokeStyle = pal.grid; c.lineWidth = 1.2; c.stroke();
            T(c, ORD[k], x, sy + ss / 2 + 8 + bh / 2 + .5, { size: clamp(ss * .22, 11, 16), color: pal.muted, weight: 600 });
          } else T(c, ORD[k], x, sy + ss / 2 + 18, { size: clamp(ss * .2, 11, 15), color: pal.muted, weight: 600 });
          slotBox(c, p, x, sy, ss, { solid: filled, on: k === next && over, stroke: k === next ? pal.brass : undefined, w: k === next ? 2.2 : 1.6 });
          /* choice badge */
          const by = sy - ss / 2 - 20;
          if (s1.ans[k] !== undefined) { c.save(); const sc = popS('b' + k); c.translate(x, by); c.scale(sc, sc); pill(c, p, 0, 0, String(s1.ans[k]), { size: clamp(ss * .24, 13, 17) }); c.restore(); }
          else if (s1.phase === 'choices' && k === s1.ci) pill(c, p, x, by, '?', { col: pal.brass, size: clamp(ss * .24, 13, 17), fill: .12 });
        }
        if (s1.ans.length) T(c, 'choices for each slot', W / 2, sy - ss / 2 - 46, { size: 12, color: pal.muted });
        /* equation */
        if (['choices', 'count', 'fact', 'done'].includes(s1.phase)) {
          const parts = Array.from({ length: r }, (_, k) => (s1.ans[k] !== undefined ? String(s1.ans[k]) : '?')), done = s1.phase === 'fact' || s1.phase === 'done';
          const fs = clamp(W * .05, 18, 30), ey = H * .595;
          c.save(); const sc = popS('eq'); c.translate(W / 2, ey); c.scale(sc, sc);
          T(c, parts.join(' × ') + (done ? ' = ' + s1.val : s1.phase === 'count' ? ' = ?' : ''), 0, 0, { size: fs, color: done ? pal.green : pal.text, weight: 700 });
          c.restore();
          if (done) T(c, `${s1.val} different ${sit.thing}` + (n === r ? `, and ${n}! = ${s1.val}` : ''), W / 2, ey + fs * 1.15, { size: 13, color: pal.muted });
        }
        /* tray */
        const tw = n * sp + 26, tpy = trayY - tr - 18;
        rr(c, W / 2 - tw / 2, tpy, tw, tr * 2 + 36, 12); c.fillStyle = alpha(pal.text, .035); c.fill(); c.strokeStyle = pal.grid; c.lineWidth = 1.2; c.stroke();
        const left = n - s1.slots.length;
        T(c, s1.phase === 'fill' ? `${left} ${plural(who, left)} left to choose from` : n === r ? `Everyone has a ${sit.slotWord}` : `${n - r} ${plural(who, n - r)} did not place`, W / 2, tpy - 14, { size: 13, color: pal.text, weight: 500 });
        /* tokens: target is the slot or the tray */
        const order = [...Array(n).keys()].sort((a, b) => (drag && drag.moved && drag.q.item === a ? 1 : 0) - (drag && drag.moved && drag.q.item === b ? 1 : 0));
        for (const i of order) {
          const si = s1.slots.indexOf(i), placed = si >= 0, tx = placed ? slotX(si) : trayX(i), ty = placed ? sy : trayY;
          const o = glide('t' + i, tx, ty), dragging = drag && drag.moved && drag.q.item === i;
          tok(c, p, o.x, o.y, tr, i, { lift: dragging || (o.tx !== null && Math.hypot(o.x - tx, o.y - ty) > 6), w: hov === 't' + i ? 3 : 2.2 });
          hits.push({ kind: 'tok', id: 't' + i, key: 't' + i, item: i, x: tx, y: ty, r: tr + 8, placed, last: placed && si === s1.slots.length - 1, drag: s1.phase === 'fill' && !placed });
        }
      };

      /* =================== 2. PERMUTATIONS P(n, r) =================== */
      let L2 = null;
      const layout2 = () => {
        const sit = SIT2[st.sit2]; if (L2 && L2.id === st.sit2) return L2;
        const all = perms(sit.n, sit.r), byKey = {}; all.forEach(a => { byKey[keyOf(a)] = a; });
        L2 = { id: st.sit2, all, byKey, total: all.length }; return L2;
      };
      const reset2 = () => {
        cancelTimers(); L2 = null;
        s2 = { cur: [], found: [], auto: {}, phase: 'build', lock: false, pulse: {}, announced: false };
        setFb(''); refresh(); draw();
      };
      const place2 = i => {
        const sit = SIT2[st.sit2], { n, r } = sit;
        if (s2.lock || s2.cur.includes(i) || s2.phase === 'reveal') return;
        s2.cur.push(i);
        if (s2.cur.length < r) { setFb(''); draw(); return; }
        const key = keyOf(s2.cur), cur = s2.cur.slice();
        s2.lock = true;
        if (s2.found.includes(key) || s2.auto[key] !== undefined) {
          s2.pulse[key] = performance.now();
          setFb(`${no('Already there.')} ${key} is in your list. Choose different tiles, or the same tiles in a different order.`);
        } else {
          s2.found.push(key);
          cur.forEach((it, j) => { const o = objs.get('t' + it); if (o) startAt(`c${key}${j}`, o.x, o.y); });
          let t = `${ok(key)} is new. That is ${s2.found.length} in your list.` + (r === 2 ? ` ${key[1]}${key[0]} is a different arrangement: same tiles, other order.` : '');
          if (s2.found.length >= 4 && !s2.announced) { s2.announced = true; t += ' The list is sorted by the first tile. Can you predict how long it will be?'; }
          setFb(t);
        }
        later(() => { s2.cur = []; s2.lock = false; refresh(); draw(); }, 420);
        refresh(); draw();
      };
      const refresh2 = () => {
        const sit = SIT2[st.sit2], { n, r } = sit, L = layout2(), total = L.total;
        if (s2.phase === 'build') {
          askEl.innerHTML = `<p><b>Build arrangements of ${r} of the ${n} tiles. Order matters, so ${r === 2 ? 'AB and BA are different' : 'ABC and CBA are different'}.</b></p><span class="k">Tap a tile or drag it onto the slots.</span><br><span class="k">Found:</span> ${s2.found.length}`;
          if (s2.found.length >= 4) {
            askEl.innerHTML += `<br><b>Predict the length of the whole list.</b> Count the choices for each slot.`;
            const correct = total, sum = n + (r > 1 ? n - 1 : 0) + (r > 2 ? n - 2 : 0), pw = Math.pow(n, r), miss = permN(n, r - 1);
            const raw = [{ val: correct }, { val: sum, t: `${prodTxt(n, r).replace(/ × /g, ' + ')} = ${sum} adds. The slots are filled one after another and every choice for the first slot goes with every choice for the next, so multiply.` },
              { val: pw, t: `${n}${' × ' + n}${r > 2 ? ' × ' + n : ''} = ${pw} would let a tile be used twice. In a slot, a tile already used is out, so the next slot has one fewer choice.` },
              { val: miss, t: `${prodTxt(n, r - 1)} = ${miss} leaves out the last slot. Every slot needs its own factor.` }];
            const ord = { p42: [2, 0, 1, 3], p52: [3, 1, 0, 2], p43: [1, 3, 2, 0] }[st.sit2];
            const seen = new Set(), list = ord.map(k => raw[k]).filter(o => !seen.has(o.val) && seen.add(o.val));
            showQ(list.map(o => ({ label: String(o.val), val: o.val, t: o.t })), (op, b) => {
              if (op.val === correct) {
                s2.phase = 'reveal'; const now = performance.now(); let k = 0;
                L.all.forEach(a => { const key = keyOf(a); if (!s2.found.includes(key)) s2.auto[key] = now + 120 + (k++) * 70; });
                setFb(`${ok('Yes.')} ${prodTxt(n, r)} = ${total}. The rest of the list fills in. Count: your ${s2.found.length} plus ${total - s2.found.length} new ones is ${total}, so the product matches the list.`);
                later(() => { s2.phase = 'formula'; refresh(); draw(); }, 400 + (total - s2.found.length) * 70 + 600);
                clearQ(); refresh(); draw();
              } else { markBad(b); setFb(`${no('Not yet.')} ${op.t}`); }
            });
          } else clearQ();
        } else if (s2.phase === 'reveal') {
          askEl.innerHTML = `<p><b>Watch the list fill in.</b></p><span class="k">Soft tiles are the arrangements you did not build yourself.</span>`; clearQ();
        } else if (s2.phase === 'formula') {
          askEl.innerHTML = `<p><b>The product ${prodTxt(n, r)} can be written with factorials: P(${n}, ${r}) = ${n}! ÷ (${n} − ${r})! = ${n}! ÷ ${n - r}!. What is it?</b></p><span class="k">${n}! = ${fact(n)} and ${n - r}! = ${fact(n - r)}</span>`;
          const vs = sit.vals, ord = { p42: [1, 0, 3, 2], p52: [2, 3, 0, 1], p43: [3, 0, 2, 1] }[st.sit2];
          showQ(ord.map(k => ({ label: String(vs[k]), val: vs[k], t: k === 0 ? '' : sit.note[k - 1] })), (op, b) => {
            if (op.val === sit.ans) {
              s2.phase = 'done'; pop('f');
              setFb(`${ok('Yes.')} ${n}! ÷ ${n - r}! = ${fact(n)} ÷ ${fact(n - r)} = ${sit.ans}. The factors ${n - r} … 1 cancel, and what is left is ${prodTxt(n, r)}: the first ${r} factors. In general P(n, r) = n! ÷ (n − r)!.`);
              refresh(); draw();
            } else { markBad(b); setFb(`${no('Not yet.')} ${op.t}`); }
          });
        } else {
          askEl.innerHTML = `<p><b>P(${n}, ${r}) = ${total}.</b></p><span class="k">Try the other situations in the menu. Notice that the count is the number of choices for each slot, multiplied.</span>`; clearQ();
        }
      };
      const tap2 = q => { if (q.kind === 'tok' && !q.placed && s2.phase !== 'reveal') place2(q.item); };
      const d2 = (c, p) => {
        const pal = p.pal, sit = SIT2[st.sit2], { n, r } = sit, L = layout2(), W = p.w, H = p.h, m = clamp(W * .05, 14, 34);
        T(c, `${n} tiles, ${r} slots`, m, 24, { size: 14, color: pal.text, align: 'left', weight: 600 });
        T(c, s2.found.length ? `${s2.found.length} built by you` : 'order matters', W - m, 24, { size: 12.5, color: pal.muted, align: 'right' });
        const tr = clamp(Math.min((W - 2 * m) / (n * 2.7), 24), 15, 24), ss = tr * 2 + 14, sy = 62 + ss / 2, trayY = sy + ss / 2 + 28 + tr + 16, sp = Math.min((W - 2 * m) / n, tr * 2 + 26);
        const slotX = k => W / 2 + (k - (r - 1) / 2) * (ss + 12), trayX = i => W / 2 + (i - (n - 1) / 2) * sp;
        zone = { x: 0, y: sy - ss, w: W, h: ss * 2 };
        const over = drag && drag.moved && inZone(drag.x, drag.y);
        for (let k = 0; k < r; k++) slotBox(c, p, slotX(k), sy, ss, { solid: k < s2.cur.length, on: k === s2.cur.length && over, stroke: k === s2.cur.length && s2.phase === 'build' ? pal.brass : undefined, w: k === s2.cur.length ? 2.2 : 1.6 });
        T(c, '1st', slotX(0), sy + ss / 2 + 14, { size: 11.5, color: pal.muted });
        if (r > 1) T(c, '2nd', slotX(1), sy + ss / 2 + 14, { size: 11.5, color: pal.muted });
        if (r > 2) T(c, '3rd', slotX(2), sy + ss / 2 + 14, { size: 11.5, color: pal.muted });
        const tw = n * sp + 24;
        rr(c, W / 2 - tw / 2, trayY - tr - 12, tw, tr * 2 + 24, 12); c.fillStyle = alpha(pal.text, .035); c.fill(); c.strokeStyle = pal.grid; c.lineWidth = 1.2; c.stroke();
        /* the list: columns by first tile, rows in sorted order */
        const gx0 = m, gw = W - 2 * m, cw = gw / n, top = trayY + tr + 44, bottom = H - 40;
        const keys = L.all.map(keyOf).filter(k => s2.found.includes(k) || s2.auto[k] !== undefined);
        const maxRows = L.total / n, hdrH = 34, rowH = Math.min((bottom - top - hdrH) / maxRows, 68);
        const cr = clamp(Math.min(cw * .86 / (2 * r + .4 * (r - 1)), rowH * .38), 5, 19), gp = cr * .4, chipW = r * 2 * cr + (r - 1) * gp;
        for (let col = 0; col < n; col++) {
          const hx = gx0 + cw * (col + .5);
          tok(c, p, hx, top + 12, clamp(cw * .16, 9, 13), col, { w: 2 });
          if (col) { c.beginPath(); c.moveTo(gx0 + cw * col, top); c.lineTo(gx0 + cw * col, top + hdrH + maxRows * rowH); c.strokeStyle = alpha(pal.text, .08); c.lineWidth = 1; c.stroke(); }
        }
        T(c, 'sorted by the first tile', W / 2, top - 11, { size: 11.5, color: pal.muted });
        const rowOf = {}; const cnt = Array(n).fill(0);
        keys.forEach(k => { const col = ITEM.indexOf(k[0]); rowOf[k] = cnt[col]++; });
        keys.forEach(key => {
          const a = L.byKey[key], col = a[0], row = rowOf[key], cx0 = gx0 + cw * (col + .5), cy0 = top + hdrH + rowH * (row + .5);
          const own = s2.found.includes(key), al = own ? 1 : fade(s2.auto[key]), t0 = own ? 1 : s2.auto[key];
          if (!own && performance.now() < t0) { busy = true; return; }
          const pu = s2.pulse[key] ? clamp(1 - (performance.now() - s2.pulse[key]) / 700, 0, 1) : 0; if (pu > 0) busy = true;
          c.save(); c.globalAlpha = own ? 1 : .55 * al + .1;
          rr(c, cx0 - chipW / 2 - 5, cy0 - cr - 4, chipW + 10, cr * 2 + 8, (cr + 4) * .7); c.fillStyle = alpha(pal.text, own ? .06 : .035); c.fill();
          c.strokeStyle = pu > 0 ? alpha(pal.yellow, pu) : pal['grid-strong']; c.lineWidth = pu > 0 ? 2.4 : 1; c.stroke();
          a.forEach((it, j) => {
            const tx = cx0 - chipW / 2 + cr + j * (2 * cr + gp), ty = cy0;
            const o = own ? glide(`c${key}${j}`, tx, ty, 640, 40 * j) : { x: tx, y: ty };
            tok(c, p, o.x, o.y, cr, it, { w: 1.6 });
          });
          c.restore();
        });
        /* bottom line */
        const done = s2.phase === 'formula' || s2.phase === 'done';
        if (s2.phase === 'reveal' || done) {
          const fs = clamp(W * .036, 13, 19);
          T(c, `P(${n}, ${r}) = ${prodTxt(n, r)} = ${L.total}`, W / 2, H - 20, { size: fs, color: pal.green, weight: 700 });
        } else if (s2.found.length) T(c, `${s2.found.length} ${plural('arrangement', s2.found.length)} so far`, W / 2, H - 20, { size: 13, color: pal.muted });
        /* tray tokens */
        const order = [...Array(n).keys()].sort((a, b) => (drag && drag.moved && drag.q.item === a ? 1 : 0) - (drag && drag.moved && drag.q.item === b ? 1 : 0));
        for (const i of order) {
          const si = s2.cur.indexOf(i), placed = si >= 0, tx = placed ? slotX(si) : trayX(i), ty = placed ? sy : trayY;
          const o = glide('t' + i, tx, ty, 380), dragging = drag && drag.moved && drag.q.item === i;
          tok(c, p, o.x, o.y, tr, i, { lift: dragging, w: hov === 't' + i ? 3 : 2.2 });
          hits.push({ kind: 'tok', id: 't' + i, key: 't' + i, item: i, x: tx, y: ty, r: tr + 8, placed, drag: !placed && !s2.lock && s2.phase !== 'reveal' });
        }
      };

      /* =================== 3. COMBINATIONS =================== */
      const N3 = 5, R3 = 3, PER3 = perms(N3, R3), COM3 = combos(N3, R3);
      const setKey = a => a.slice().sort((x, y) => x - y).join('');
      const comIdx = {}; COM3.forEach((a, i) => { comIdx[setKey(a)] = i; });
      const chipSlot = []; { const cn = Array(COM3.length).fill(0); PER3.forEach(a => { chipSlot.push(cn[comIdx[setKey(a)]]++); }); }
      const reset3 = () => {
        cancelTimers();
        s3 = { sel: [], phase: 'pick', t0: 0 };
        s3p = { ti: 0, phase: 'find', sel: null, help: false, wrong: null };
        setFb(''); refresh(); draw();
      };
      const nextPascal = () => { s3p = { ti: (s3p.ti + 1) % PTASKS.length, phase: 'find', sel: null, help: false, wrong: null }; setFb(''); refresh(); draw(); };
      const toggle3 = i => {
        if (!['pick', 'orders'].includes(s3.phase)) return;
        const at = s3.sel.indexOf(i);
        if (at >= 0) s3.sel.splice(at, 1); else if (s3.sel.length < R3) { s3.sel.push(i); pop('sel' + i); } else return;
        s3.sel.sort((a, b) => a - b);
        if (s3.sel.length === R3) {
          s3.phase = 'orders'; s3.t0 = performance.now();
          const ords = perms(R3, R3).map(q => q.map(j => ITEM[s3.sel[j]]).join(''));
          setFb(`Committee ${s3.sel.map(j => ITEM[j]).join(', ')}. The ordered picks that use exactly these three people are highlighted. Here they are: ${ords.join(', ')}.`);
        } else { s3.phase = 'pick'; setFb(s3.sel.length ? '' : ''); }
        refresh(); draw();
      };
      const refresh3 = () => {
        if (st.view === 'pascal') return refresh3p();
        if (s3.phase === 'pick') {
          askEl.innerHTML = `<p><b>Choose a committee of 3 from the 5 students.</b></p><span class="k">Tap a student, or drag one into the committee box. Chosen:</span> ${s3.sel.length} of 3<br><span class="k">Below are all 60 ordered picks, for example ABC and CAB.</span>`;
          clearQ();
        } else if (s3.phase === 'orders') {
          askEl.innerHTML = `<p><b>How many of the 60 ordered picks are this same committee (highlighted)?</b></p><span class="k">You can pick a different committee to compare.</span>`;
          showQ([{ label: '3', val: 3, t: `3 is only the number of people. List the orders: first there are 3 choices, then 2, then 1.` }, { label: '6', val: 6 }, { label: '9', val: 9, t: `3 × 3 = 9 would let a person repeat. After the first person is chosen only 2 people are left, then 1.` }, { label: '12', val: 12, t: `Too many. Choose the first person (3 ways), then the second (2 ways), then the last (1 way): 3 × 2 × 1 = 6.` }], (op, b) => {
            if (op.val === 6) {
              s3.phase = 'ready';
              setFb(`${ok('Yes.')} 3 × 2 × 1 = 3! = 6. The same three people can be put in order in 3! = 6 ways, so each committee shows up 6 times among the 60 ordered picks.`);
              refresh(); draw();
            } else { markBad(b); setFb(`${no('Not yet.')} ${op.t}`); }
          });
        } else if (s3.phase === 'ready') {
          askEl.innerHTML = `<p><b>Every committee is counted 6 times. Group the ordered picks that are the same committee.</b></p>`;
          showQ([{ label: 'Group the same committees', val: 1, primary: true }], () => {
            s3.phase = 'grouped'; s3.t0 = performance.now();
            setFb(`The 60 ordered picks collapsed into 10 groups. Each group is one committee and holds 3! = 6 orders. Your committee is the outlined card.`);
            later(() => { s3.phase = 'divide'; refresh(); draw(); }, 1100);
            clearQ(); refresh(); draw();
          });
        } else if (s3.phase === 'grouped') {
          askEl.innerHTML = `<p><b>Watch the picks group together.</b></p>`; clearQ();
        } else if (s3.phase === 'divide') {
          askEl.innerHTML = `<p><b>There are 60 ordered picks, and each committee was counted 6 times. Which calculation gives the number of committees?</b></p><span class="k">P(5, 3) = 5 × 4 × 3 = 60 and 3! = 6</span>`;
          showQ([{ label: '60 − 6', val: 0, t: `60 − 6 = 54 subtracts one group. Every committee was counted 6 times, so the 60 must be split into groups of 6: divide.` }, { label: '60 ÷ 6', val: 1 }, { label: '60 ÷ 3', val: 2, t: `60 ÷ 3 = 20 divides by the number of people. The group size is the number of orders of the same people: 3! = 6, not 3.` }, { label: '60 × 6', val: 3, t: `60 × 6 = 360 makes the count bigger. We counted too many, so we must divide, not multiply.` }], (op, b) => {
            if (op.val === 1) {
              s3.phase = 'done'; pop('cx');
              setFb(`${ok('Yes.')} 60 ÷ 6 = 10. C(5, 3) = P(5, 3) ÷ 3! = 60 ÷ 6 = 10. You divide by r! because each group of r people was counted r! times.`);
              refresh(); draw();
            } else { markBad(b); setFb(`${no('Not yet.')} ${op.t}`); }
          });
        } else {
          askEl.innerHTML = `<p><b>C(5, 3) = 10 committees.</b></p><span class="k">Now see why C(5, 3) and C(5, 2) are equal, and where these numbers sit in Pascal's triangle.</span>`;
          showQ([{ label: 'Next: symmetry and Pascal\'s triangle', val: 1, primary: true }], () => { st.view = 'pascal'; sel3.value = 'pascal'; reset3(); });
        }
      };
      const refresh3p = () => {
        const [n, k] = PTASKS[s3p.ti], v = combN(n, k);
        if (s3p.phase === 'find') {
          askEl.innerHTML = `<p><b>A club has ${n} people. How many different committees of ${k} are there? Click that entry of the triangle.</b></p><span class="k">Entry k of row n is C(n, k). Count rows and positions from 0.</span>`; clearQ();
        } else if (s3p.phase === 'mirror') {
          askEl.innerHTML = `<p><b>Now click the other entry in row ${n} with the same value, ${v}.</b></p><span class="k">Where is it, if you read the row from the right?</span>`; clearQ();
        } else if (s3p.phase === 'rule') {
          const a = combN(n - 1, k - 1), b = combN(n - 1, k);
          askEl.innerHTML = `<p><b>The two entries above C(${n}, ${k}) are outlined, with values ${a} and ${b}. Add them. What do you get?</b></p>`;
          const raw = [{ val: a + b }, { val: a * b, t: `${a} × ${b} = ${a * b} multiplies. Each entry is the sum of the two entries above it.` }, { val: Math.abs(a - b), t: `${Math.max(a, b)} − ${Math.min(a, b)} = ${Math.abs(a - b)} subtracts. Each entry is the sum of the two above.` }, { val: a + b + 1, t: `${a} + ${b} = ${a + b}. Check your addition.` }];
          const seen = new Set(), ord = [2, 0, 3, 1][s3p.ti], list = raw.filter(o => !seen.has(o.val) && seen.add(o.val)); list.push(...list.splice(0, ord % list.length));
          showQ(list.map(o => ({ label: String(o.val), val: o.val, t: o.t })), (op, bt) => {
            if (op.val === a + b) {
              s3p.phase = 'done';
              setFb(`${ok('Yes.')} C(${n}, ${k}) = C(${n - 1}, ${k - 1}) + C(${n - 1}, ${k}) = ${a} + ${b} = ${v}. Fix one person: committees with that person need ${k - 1} more from the other ${n - 1}, and committees without that person choose all ${k} from the other ${n - 1}. Either-or, so add.`);
              refresh(); draw();
            } else { markBad(bt); setFb(`${no('Not yet.')} ${op.t}`); }
          });
        } else {
          askEl.innerHTML = `<p><b>Done: C(${n}, ${k}) = C(${n}, ${n - k}) = ${v}.</b></p><span class="k">Click any entry to see its mirror and the two entries above it.</span>`;
          showQ([{ label: 'Next question', val: 1, primary: true }], () => nextPascal());
        }
      };
      const tap3 = q => {
        if (st.view === 'pascal') return tapPascal(q);
        if (q.kind === 'tok') toggle3(q.item);
      };
      const tapPascal = q => {
        if (q.kind !== 'pe') return;
        const [n, k] = PTASKS[s3p.ti], { r, c: kk } = q;
        const nm = (a, b) => `C(${a}, ${b})`;
        if (s3p.phase === 'find') {
          if (r === n && kk === k) {
            s3p.sel = [n, k]; s3p.phase = 'mirror'; s3p.wrong = null;
            setFb(`${ok('Yes.')} Row ${n}, position ${k} is ${nm(n, k)} = ${combN(n, k)}. That is the number of committees of ${k} from ${n} people.`);
          } else if (r !== n) {
            s3p.wrong = [r, kk]; s3p.help = true;
            setFb(`${no('Not yet.')} Row ${r} is for groups chosen from ${r} people. Your club has ${n} people, so use row ${n}. The row at the top, with the single 1, is row 0.`);
          } else if (combN(n, kk) === combN(n, k)) {
            s3p.wrong = [r, kk]; s3p.help = true;
            setFb(`${no('Close.')} That entry has the same value, but it is ${nm(n, kk)}: committees of ${kk}. You need position ${k}. Count ${k} steps from the left end of the row, where the first entry is position 0.`);
          } else {
            s3p.wrong = [r, kk]; s3p.help = true;
            setFb(`${no('Not yet.')} Position ${kk} of row ${n} is ${nm(n, kk)} = ${combN(n, kk)}, committees of ${kk}. You need committees of ${k}, which is position ${k} counting from 0 at the left.`);
          }
        } else if (s3p.phase === 'mirror') {
          if (r === n && kk === n - k) {
            s3p.phase = 'rule'; s3p.wrong = null;
            setFb(`${ok('Yes.')} ${nm(n, n - k)} = ${nm(n, k)} = ${combN(n, k)}. Choosing ${k} people to include is the same as choosing the ${n - k} to leave out. The row reads the same from both ends: C(n, r) = C(n, n − r).`);
          } else {
            s3p.wrong = [r, kk];
            setFb(`${no('Not yet.')} The row is symmetric. Position ${k} from the left matches position ${k} from the right, which is position ${n} − ${k} = ${n - k} from the left.`);
          }
        } else {
          s3p.sel = [r, kk]; s3p.wrong = null;
          const v = combN(r, kk);
          setFb(`${nm(r, kk)} = ${v}.` + (kk !== r - kk ? ` Its mirror ${nm(r, r - kk)} has the same value.` : ` It sits in the middle of its row.`) + (r > 0 && kk > 0 && kk < r ? ` The two above add up: ${combN(r - 1, kk - 1)} + ${combN(r - 1, kk)} = ${v}.` : ''));
        }
        refresh(); draw();
      };
      const d3p = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, [n, k] = PTASKS[s3p.ti], rows = 7;
        const m = clamp(W * .04, 12, 30), top = 62, cx = W / 2 + 16;
        const colSp = Math.min((W - 2 * m - 40) / 6.6, 74), rs = Math.min((H - top - 60) / (rows - 1), 62), er = clamp(Math.min(colSp * .4, rs * .42), 12, 24);
        T(c, 'Pascal\'s triangle', m, 24, { size: 14, color: pal.text, align: 'left', weight: 600 });
        T(c, 'row n, position r', W - m, 24, { size: 12.5, color: pal.muted, align: 'right' });
        const pos = (r, kk) => [cx + (kk - r / 2) * colSp, top + r * rs];
        const sel = s3p.sel, helpRow = s3p.help && s3p.phase === 'find' ? n : null;
        const mirror = sel && (s3p.phase !== 'find') ? [sel[0], sel[0] - sel[1]] : null;
        const parents = sel && ['rule', 'done'].includes(s3p.phase) && sel[0] > 0 && sel[1] > 0 && sel[1] < sel[0] ? [[sel[0] - 1, sel[1] - 1], [sel[0] - 1, sel[1]]] : null;
        const rowOn = helpRow !== null ? helpRow : (s3p.phase === 'mirror' ? n : null);
        for (let r = 0; r < rows; r++) {
          const [lx, ly] = pos(r, 0);
          T(c, 'n=' + r, m, ly + .5, { size: 11.5, color: r === rowOn ? pal.text : pal.muted, weight: r === rowOn ? 700 : 500, align: 'left' });
          if (r === rowOn) { const [x0] = pos(r, 0), [x1] = pos(r, r); rr(c, x0 - er - 8, ly - er - 5, x1 - x0 + 2 * er + 16, 2 * er + 10, er + 5); c.fillStyle = alpha(pal.yellow, .1); c.fill(); }
        }
        /* connecting lines from parents */
        if (parents) {
          const [tx, ty] = pos(sel[0], sel[1]);
          parents.forEach(([r, kk]) => { const [px, py] = pos(r, kk); c.beginPath(); c.moveTo(px, py + er); c.lineTo(tx, ty - er); c.strokeStyle = alpha(pal.violet, .8); c.lineWidth = 2.2; c.lineCap = 'round'; c.stroke(); });
        }
        for (let r = 0; r < rows; r++) for (let kk = 0; kk <= r; kk++) {
          const [x, y] = pos(r, kk), v = combN(r, kk);
          const isSel = sel && sel[0] === r && sel[1] === kk, isMir = mirror && mirror[0] === r && mirror[1] === kk && !isSel, isPar = parents && parents.some(q => q[0] === r && q[1] === kk);
          const isWrong = s3p.wrong && s3p.wrong[0] === r && s3p.wrong[1] === kk;
          const col = isSel ? pal.yellow : isMir ? pal.green : isPar ? pal.violet : isWrong ? pal.red : pal['grid-strong'];
          c.save(); const sc = popS('pe' + r + kk) * (hov === `pe${r}${kk}` ? 1.08 : 1); c.translate(x, y); c.scale(sc, sc);
          c.beginPath(); c.arc(0, 0, er, 0, TAU); c.fillStyle = pal.stage; c.fill();
          c.fillStyle = (isSel || isMir || isPar || isWrong) ? alpha(col, .3) : alpha(pal.text, .04); c.fill();
          ring(c, 0, 0, er, col, (isSel || isMir || isPar || isWrong) ? 2.6 : 1.4);
          T(c, String(v), 0, .5, { size: clamp(er * (v > 99 ? .72 : .88), 10, 18), color: pal.text, weight: (isSel || isMir) ? 700 : 500 });
          c.restore();
          if (rowOn === r) T(c, String(kk), x, y + er + 9, { size: 10.5, color: pal.muted });
          hits.push({ kind: 'pe', id: `pe${r}${kk}`, r, c: kk, x, y, rad: er, w: er * 2 + 4, h: er * 2 + 4 });
        }
        if (sel) {
          const [r, kk] = sel, fs = clamp(W * .04, 13, 19);
          const txt = `C(${r}, ${kk}) = ${combN(r, kk)}` + (mirror ? `  =  C(${r}, ${r - kk})` : '');
          T(c, txt, W / 2, H - 26, { size: fs, color: pal.green, weight: 700 });
        }
      };
      const d3 = (c, p) => {
        if (st.view === 'pascal') return d3p(c, p);
        const pal = p.pal, W = p.w, H = p.h, m = clamp(W * .05, 14, 34);
        T(c, 'Committee of 3 from 5 students', m, 24, { size: 14, color: pal.text, align: 'left', weight: 600 });
        const tr = clamp(Math.min((W - 2 * m) / (N3 * 2.7), 26), 15, 26), sp = Math.min((W - 2 * m) / N3, tr * 2 + 28), trayY = 54 + tr + 12;
        const trayX = i => W / 2 + (i - (N3 - 1) / 2) * sp;
        const tw = N3 * sp + 24;
        rr(c, W / 2 - tw / 2, trayY - tr - 12, tw, tr * 2 + 24, 12); c.fillStyle = alpha(pal.text, .035); c.fill(); c.strokeStyle = pal.grid; c.lineWidth = 1.2; c.stroke();
        /* committee box */
        const bs = tr * 2 + 8, boxY = trayY + tr + 12 + 40 + bs / 2, bw = R3 * (bs + 8) + 12, boxX = i => W / 2 + (i - (R3 - 1) / 2) * (bs + 8);
        rr(c, W / 2 - bw / 2, boxY - bs / 2 - 8, bw, bs + 16, 14); c.fillStyle = alpha(pal.yellow, s3.sel.length === R3 ? .1 : .04); c.fill();
        c.setLineDash(s3.sel.length === R3 ? [] : [5, 5]); c.strokeStyle = s3.sel.length === R3 ? alpha(pal.yellow, .9) : pal['grid-strong']; c.lineWidth = 1.6; c.stroke(); c.setLineDash([]);
        T(c, 'Committee', W / 2 - bw / 2 + 4, boxY - bs / 2 - 20, { size: 12, color: pal.muted, align: 'left', weight: 600 });
        zone = { x: W / 2 - bw / 2 - 20, y: boxY - bs / 2 - 20, w: bw + 40, h: bs + 40 };
        const locked = !['pick', 'orders'].includes(s3.phase);
        const order = [...Array(N3).keys()].sort((a, b) => (drag && drag.moved && drag.q.item === a ? 1 : 0) - (drag && drag.moved && drag.q.item === b ? 1 : 0));
        /* region of ordered picks */
        const top = boxY + bs / 2 + 56, bottom = H - 48, gx = m, gw = W - 2 * m;
        const grouped = ['grouped', 'divide', 'done'].includes(s3.phase), selKey = s3.sel.length === R3 ? setKey(s3.sel) : null;
        T(c, grouped ? '10 committees, 6 orders each' : 'All 60 ordered picks', W / 2, top - 22, { size: 12.5, color: pal.muted });
        const cwid = gw / 10, cr = clamp(Math.min(cwid * .84 / 6.8, (bottom - top) / 6 * .36), 3.4, 11), gp = cr * .4, chipW = 6 * cr + 2 * gp;
        const rowH = Math.min((bottom - top) / 6, cr * 2 + 18);
        const gridTop = top + ((bottom - top) - rowH * 6) / 2;
        /* card geometry */
        const cg = 8, cardW = (gw - 4 * cg) / 5, cardH = Math.min((bottom - top - cg) / 2, 150);
        const cardX = ci => gx + (ci % 5) * (cardW + cg) + cardW / 2, cardY = ci => top + Math.floor(ci / 5) * (cardH + cg);
        const rowc = (cardH - 30) / 6, ccr = clamp(Math.min((cardW - 8) / 6.8, rowc / 2 - 1.5), 2.4, cr);
        if (grouped) {
          COM3.forEach((a, ci) => {
            const x = cardX(ci) - cardW / 2, y = cardY(ci), mine = selKey === setKey(a);
            const al = fade(s3.t0 + 250 + ci * 20, 400);
            c.save(); c.globalAlpha = al;
            rr(c, x, y, cardW, cardH, 10); c.fillStyle = alpha(mine ? pal.yellow : pal.text, mine ? .12 : .035); c.fill();
            c.strokeStyle = mine ? pal.yellow : pal['grid-strong']; c.lineWidth = mine ? 2.4 : 1.2; c.stroke();
            T(c, keyOf(a), cardX(ci), y + 12, { size: clamp(cardW * .17, 10.5, 14), color: pal.text, weight: 700 });
            c.restore();
          });
        }
        PER3.forEach((a, i) => {
          const same = selKey && setKey(a) === selKey, ci = comIdx[setKey(a)];
          let tx, ty;
          if (grouped) {
            tx = cardX(ci); ty = cardY(ci) + 26 + (chipSlot[i] + .5) * rowc;
          } else { tx = gx + cwid * (i % 10 + .5); ty = gridTop + rowH * (Math.floor(i / 10) + .5); }
          const o = glide('f' + i, tx, ty, 900, grouped ? ci * 36 + chipSlot[i] * 12 : 0);
          const dim = !grouped && selKey && !same, hl = same && !grouped;
          c.save(); c.globalAlpha = dim ? .28 : 1;
          const rad = grouped ? ccr : cr;
          if (hl) { rr(c, o.x - chipW / 2 - 4, o.y - cr - 3.5, chipW + 8, cr * 2 + 7, cr + 3); c.fillStyle = alpha(pal.yellow, .25); c.fill(); c.strokeStyle = pal.yellow; c.lineWidth = 1.8; c.stroke(); }
          const gp2 = rad * .4, w2 = 3 * 2 * rad + 2 * gp2;
          a.forEach((it, j) => tok(c, p, o.x - w2 / 2 + rad + j * (2 * rad + gp2), o.y, rad, it, { w: Math.max(1.2, rad * .2), label: false }));
          c.restore();
        });
        /* pascal / divide caption */
        if (s3.phase === 'done') { c.save(); const sc = popS('cx'); c.translate(W / 2, H - 22); c.scale(sc, sc); T(c, 'C(5, 3) = 60 ÷ 6 = 10', 0, 0, { size: clamp(W * .04, 14, 20), color: pal.green, weight: 700 }); c.restore(); }
        else if (selKey && !grouped) T(c, '6 of the 60 are your committee', W / 2, H - 22, { size: 13, color: pal.muted });
        /* tokens last */
        for (const i of order) {
          const si = s3.sel.indexOf(i), placed = si >= 0, tx = placed ? boxX(si) : trayX(i), ty = placed ? boxY : trayY;
          const o = glide('s' + i, tx, ty, 420), dragging = drag && drag.moved && drag.q.item === i;
          const sc = popS('sel' + i);
          c.save(); c.translate(o.x, o.y); c.scale(sc, sc);
          tok(c, p, 0, 0, tr, i, { lift: dragging, w: hov === 's' + i ? 3 : 2.2, alpha: locked && !placed ? .5 : 1 });
          c.restore();
          hits.push({ kind: 'tok', id: 's' + i, key: 's' + i, item: i, x: tx, y: ty, r: tr + 8, placed, drag: !locked && !placed });
        }
      };

      /* =================== 4. CHOOSE THE RIGHT TOOL =================== */
      const reset4 = () => {
        cancelTimers();
        const rd = R4[st.round];
        const seq = rd.kind === 'pick' ? ['order', 'rep', 'tool', 'val'] : ['andor', 'tool', 'val']; if (rd.prob) seq.push('prob');
        s4 = { seq, si: 0, ordDone: false, repDone: false, toolDone: false, valDone: false, probDone: false, tool: null };
        sel4.value = String(st.round);
        setFb(''); refresh(); draw();
      };
      const lastRound = () => st.round === R4.length - 1;
      const toolWhy = (rd, t) => {
        const { kind, tool } = rd;
        if (kind === 'mult') {
          if (t === 'ADD') return 'Addition is for either-or. Here you pick from every menu at the same time, so the counts multiply.';
          if (t === 'POW') return 'n^r needs the same number of choices every time. The menus have 3, 4 and 2 items.';
          return 'P(n, r) and C(n, r) choose from one pool of items. Here the three choices come from three different menus, so use the multiplication principle.';
        }
        if (kind === 'add') {
          if (t === 'MUL') return 'Multiplying counts pairs, such as a team together with a club. You join only one activity, so there are no pairs: add.';
          if (t === 'POW') return 'n^r is for repeated choices from one pool. You make a single choice here.';
          return 'P(n, r) and C(n, r) choose several items from one pool. Here you make one choice, from one group or the other, so add.';
        }
        if (t === 'ADD') return 'Addition is for either-or choices from separate groups. Here you make several choices in a row, so counts multiply or combine.';
        if (tool === 'C') {
          if (t === 'P') return 'P(n, r) counts the same people in a different order as different results. Here the order does not matter, so P(n, r) counts every group r! times too often. Divide by r!: that is C(n, r).';
          if (t === 'MUL') return 'Multiplying the shrinking choices counts every group once for each order it can be put in. Order does not matter here, so you must divide by r!. That makes it C(n, r).';
          return 'n^r lets items repeat and counts different orders as different. Neither fits here.';
        }
        if (tool === 'P') {
          if (t === 'C') return 'C(n, r) ignores order, but here swapping two positions gives a different result, so C(n, r) is too small.';
          return 'n^r lets an item be used again. Here a used item is out, so later slots have fewer choices: that is P(n, r).';
        }
        if (t === 'P') return 'P(n, r) does not allow an item to be used twice. Here repeats are allowed, so every slot has all n choices.';
        return 'C(n, r) ignores order and forbids repeats. Here order matters and repeats are allowed, so use n^r.';
      };
      const refresh4 = () => {
        const rd = R4[st.round], stage = s4.seq[s4.si], n = rd.n;
        const head = `<p><b>${rd.text}</b></p>`;
        const finish = () => {
          s4.si++; refresh(); draw();
        };
        const yesNo = (qText, truth, why, flagKey) => {
          askEl.innerHTML = head + `<span class="k">${qText}</span>`;
          showQ([{ label: 'Yes', val: true }, { label: 'No', val: false }], (op, b) => {
            if (op.val === truth) { s4[flagKey] = true; pop('map'); setFb(`${ok('Right.')} ${why}`); finish(); }
            else { markBad(b); setFb(`${no('Not quite.')} ${why}`); }
          });
        };
        if (stage === 'order') yesNo('Does the order of the choices matter?', rd.order, rd.whyOrder, 'ordDone');
        else if (stage === 'rep') yesNo('Can the same item be used more than once?', rd.rep, rd.whyRep, 'repDone');
        else if (stage === 'andor') {
          askEl.innerHTML = head + `<span class="k">Do you choose from every group together, or just one option from either group?</span>`;
          showQ([{ label: 'One from every group', val: 'all' }, { label: 'Just one option', val: 'one' }], (op, b) => {
            if (op.val === rd.op) { s4.ordDone = true; pop('map'); setFb(`${ok('Yes.')} ${rd.whyAll}`); finish(); }
            else { markBad(b); setFb(`${no('Not quite.')} ${rd.whyAll}`); }
          });
        } else if (stage === 'tool') {
          askEl.innerHTML = head + `<span class="k">Which tool counts this?</span>`;
          showQ(TOOLS.map(([k, l]) => ({ label: l, val: k })), (op, b) => {
            if (rd.okTools.includes(op.val)) {
              s4.toolDone = true; s4.tool = rd.tool; pop('map');
              setFb(`${ok('Yes.')} This is ${TOOLNAME[op.val === 'MUL' && rd.tool !== 'MUL' ? 'MUL' : rd.tool]}.` + (op.val === 'MUL' && rd.tool !== 'MUL' ? ` ${rd.tool === 'P' ? 'P(n, r)' : 'n^r'} is the multiplication principle with a name: the product of the choices for each slot.` : ''));
              finish();
            } else { markBad(b); setFb(`${no('Not yet.')} ${toolWhy(rd, op.val)}`); }
          });
        } else if (stage === 'val') {
          askEl.innerHTML = head + `<span class="k">Compute the number of possibilities.</span>`;
          const vals = rd.wrong.map(([v, t]) => ({ val: v, t })); vals.splice(rd.pos, 0, { val: rd.val });
          showQ(vals.map(o => ({ label: o.val.toLocaleString('en-US').replace(/,/g, ' '), val: o.val, t: o.t })), (op, b) => {
            if (op.val === rd.val) { s4.valDone = true; pop('calc'); setFb(`${ok('Yes.')} ${rd.calcWhy}`); finish(); }
            else { markBad(b); setFb(`${no('Not yet.')} ${op.t}`); }
          });
        } else if (stage === 'prob') {
          askEl.innerHTML = head + `<span class="k">Every ticket is equally likely to match the draw, and exactly one ticket matches. What is the chance that your ticket wins?</span>`;
          showQ([{ label: '4/10', val: 0, t: '4/10 is the share of the numbers on your ticket. To win, all four of your numbers must match, which is much rarer.' }, { label: '1/5040', val: 1, t: '5040 counts ordered draws. Order does not matter here, so there are only 210 different tickets, not 5040.' }, { label: '1/210', val: 2 }, { label: '1/4', val: 3, t: '1/4 has no link to the number of tickets. Use favorable ÷ total, where the total is the size of the sample space.' }], (op, b) => {
            if (op.val === 2) { s4.probDone = true; pop('calc'); setFb(`${ok('Yes.')} The 210 tickets are the whole sample space, and exactly 1 is favorable. The probability is 1 ÷ C(10, 4) = 1/210, about 0.5%.`); finish(); }
            else { markBad(b); setFb(`${no('Not yet.')} ${op.t}`); }
          });
        } else {
          askEl.innerHTML = head + `<span class="k">${lastRound() ? 'That was the last situation. Pick any from the menu to practice again.' : 'Ready for the next one?'}</span>`;
          showQ([lastRound() ? { label: 'Start again', val: 0, primary: true } : { label: 'Next situation', val: 1, primary: true }], () => { st.round = lastRound() ? 0 : st.round + 1; reset4(); });
        }
        void n;
      };
      const d4 = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, rd = R4[st.round], m = clamp(W * .05, 14, 34);
        T(c, `Situation ${st.round + 1} of ${R4.length}`, m, 24, { size: 14, color: pal.text, align: 'left', weight: 600 });
        const stg = s4.seq[s4.si];
        if (rd.kind === 'pick') {
          const n = rd.n, r = rd.r;
          const oy = clamp((H - 500) * .3, 0, 50), pr = clamp(Math.min((W - 2 * m) / (n * 2.5), 18), 9, 18), py = 66 + oy;
          T(c, `${n} to choose from`, W - m, 24, { size: 12.5, color: pal.muted, align: 'right' });
          for (let i = 0; i < n; i++) {
            const x = W / 2 + (i - (n - 1) / 2) * pr * 2.5;
            c.beginPath(); c.arc(x, py, pr, 0, TAU); c.fillStyle = pal.stage; c.fill(); c.fillStyle = alpha(pal.blue, .28); c.fill(); ring(c, x, py, pr, pal.blue, 2);
          }
          const ss = clamp(Math.min((W - 2 * m) / (r + .35 * (r - 1)), 76), 38, 76), sy = py + pr + 30 + ss / 2 + 6, gp = ss * .3;
          for (let k = 0; k < r; k++) {
            const x = W / 2 + (k - (r - 1) / 2) * (ss + gp);
            slotBox(c, p, x, sy, ss, { solid: false });
            T(c, rd.labels[k], x, sy + ss / 2 + 14, { size: clamp(ss * .2, 10.5, 13), color: pal.muted, weight: 600 });
            if (s4.ordDone && rd.order) T(c, String(k + 1), x, sy, { size: clamp(ss * .42, 16, 26), color: pal.muted, weight: 300 });
          }
          if (s4.ordDone && rd.order) { T(c, 'order matters', W / 2, sy - ss / 2 - 14, { size: 12, color: pal.green, weight: 600 }); }
          else if (s4.ordDone) T(c, 'order does not matter', W / 2, sy - ss / 2 - 14, { size: 12, color: pal.green, weight: 600 });
          /* the map */
          const labelW = clamp(W * .24, 78, 120), mw = Math.min(W - 2 * m, 460), mx0 = W / 2 - mw / 2, cwid = (mw - labelW) / 2, top = sy + ss / 2 + 54, hdr = 26;
          const chh = clamp((H - top - hdr - 56) / 2, 44, 96);
          const rowOn = s4.ordDone ? (rd.order ? 0 : 1) : -1, colOn = s4.repDone ? (rd.rep ? 1 : 0) : -1;
          T(c, 'No repeats', mx0 + labelW + cwid * .5, top + hdr / 2, { size: 12, color: colOn === 0 ? pal.text : pal.muted, weight: colOn === 0 ? 700 : 500 });
          T(c, 'Repeats allowed', mx0 + labelW + cwid * 1.5, top + hdr / 2, { size: 12, color: colOn === 1 ? pal.text : pal.muted, weight: colOn === 1 ? 700 : 500 });
          ['Order matters', 'Order does not matter'].forEach((t, i) => {
            const y = top + hdr + chh * (i + .5), words = t.split(' '), fs = clamp(W * .03, 11, 13);
            const l1 = i === 0 ? ['Order', 'matters'] : ['Order does', 'not matter'];
            T(c, l1[0], mx0 + 4, y - fs * .6, { size: fs, color: rowOn === i ? pal.text : pal.muted, weight: rowOn === i ? 700 : 500, align: 'left' });
            T(c, l1[1], mx0 + 4, y + fs * .75, { size: fs, color: rowOn === i ? pal.text : pal.muted, weight: rowOn === i ? 700 : 500, align: 'left' });
            void words;
          });
          const cells = [['P(n, r)', 'POW'], ['n^r', 'x']];
          for (let ri = 0; ri < 2; ri++) for (let cj = 0; cj < 2; cj++) {
            const x = mx0 + labelW + cwid * cj, y = top + hdr + chh * ri, hotR = rowOn === ri, hotC = colOn === cj, both = hotR && hotC;
            rr(c, x + 3, y + 3, cwid - 6, chh - 6, 10);
            c.fillStyle = both ? alpha(pal.yellow, .22) : (hotR || hotC) ? alpha(pal.green, .09) : alpha(pal.text, .03); c.fill();
            c.strokeStyle = both ? pal.yellow : pal['grid-strong']; c.lineWidth = both ? 2.4 : 1.2; c.stroke();
            const cx = x + cwid / 2, cy = y + chh / 2, fs = clamp(Math.min(cwid * .13, chh * .3), 14, 22);
            if (ri === 0 && cj === 0) T(c, 'P(n, r)', cx, cy, { size: fs, color: pal.text, weight: both ? 700 : 500 });
            else if (ri === 0 && cj === 1) {
              c.font = `${both ? 700 : 500} ${fs}px ${FONT}`; const w1 = c.measureText('n').width; c.font = `${both ? 700 : 500} ${fs * .62}px ${FONT}`; const w2 = c.measureText('r').width, x0 = cx - (w1 + w2 + 1) / 2;
              T(c, 'n', x0 + w1 / 2, cy + 3, { size: fs, color: pal.text, weight: both ? 700 : 500 });
              T(c, 'r', x0 + w1 + 1 + w2 / 2, cy - fs * .28, { size: fs * .62, color: pal.text, weight: both ? 700 : 500 });
            } else if (ri === 1 && cj === 0) T(c, 'C(n, r)', cx, cy, { size: fs, color: pal.text, weight: both ? 700 : 500 });
            else T(c, 'not in this lesson', cx, cy, { size: clamp(fs * .62, 10, 12.5), color: pal.muted });
          }
          void cells;
        } else {
          /* multiplication and addition: groups of options */
          const g = rd.groups, ng = g.length, opW = clamp(W * .1, 28, 44), colsA = ['blue', 'green', 'red'];
          const gw = Math.min((W - 2 * m - (ng - 1) * opW) / ng, 150), total = ng * gw + (ng - 1) * opW, gx0 = W / 2 - total / 2, gy = clamp(H * .14, 70, 110), gh = clamp(H * .36, 130, 250);
          T(c, rd.kind === 'mult' ? 'choices at each stage' : 'options in each group', W - m, 24, { size: 12.5, color: pal.muted, align: 'right' });
          for (let q = 0; q < ng; q++) {
            const x = gx0 + q * (gw + opW), col = pal[colsA[q]];
            rr(c, x, gy, gw, gh, 12); c.fillStyle = alpha(col, .07); c.fill(); c.strokeStyle = alpha(col, .8); c.lineWidth = 1.6; c.stroke();
            const cnt = g[q], per = Math.min(3, cnt), rowsN = Math.ceil(cnt / per), tr = clamp(Math.min(gw / (per * 2.5), (gh - 44) / (rowsN * 2.5)), 8, 22);
            for (let i = 0; i < cnt; i++) {
              const cx = x + gw / 2 + ((i % per) - (Math.min(per, cnt - Math.floor(i / per) * per) - 1) / 2) * tr * 2.5, cy = gy + 20 + tr + Math.floor(i / per) * tr * 2.5 + ((gh - 44 - rowsN * tr * 2.5) / 2);
              c.beginPath(); c.arc(cx, cy, tr, 0, TAU); c.fillStyle = pal.stage; c.fill(); c.fillStyle = alpha(col, .3); c.fill(); ring(c, cx, cy, tr, col, 1.8);
            }
            T(c, String(cnt), x + gw / 2, gy + gh - 18, { size: clamp(gw * .16, 15, 22), color: pal.text, weight: 700 });
            T(c, rd.names[q], x + gw / 2, gy + gh + 14, { size: clamp(W * .03, 11, 13), color: pal.muted, weight: 600 });
            if (q < ng - 1) {
              const ox = x + gw + opW / 2, oy = gy + gh / 2;
              c.save(); const sc = popS('map'); c.translate(ox, oy); c.scale(s4.ordDone ? sc : 1, s4.ordDone ? sc : 1);
              c.beginPath(); c.arc(0, 0, 15, 0, TAU); c.fillStyle = pal.stage; c.fill(); c.fillStyle = s4.ordDone ? alpha(pal.yellow, .28) : alpha(pal.text, .04); c.fill(); ring(c, 0, 0, 15, s4.ordDone ? pal.yellow : pal['grid-strong'], 1.8);
              T(c, s4.ordDone ? (rd.kind === 'mult' ? '×' : '+') : '?', 0, 1, { size: 17, color: pal.text, weight: 600 });
              c.restore();
            }
          }
        }
        if (s4.valDone) {
          c.save(); const sc = popS('calc'); c.translate(W / 2, H - 22); c.scale(sc, sc);
          const fs = clamp(W * .038, 12.5, 19);
          T(c, rd.calc, 0, 0, { size: fs, color: pal.green, weight: 700 }); c.restore();
        }
        if (s4.probDone) T(c, 'Chance of winning: 1/210', W / 2, H - 46, { size: clamp(W * .036, 12, 17), color: pal.yellow, weight: 700 });
      };

      /* =================== wiring =================== */
      const M = {
        slots: { refresh: refresh1, draw: d1, tap: tap1 },
        perm: { refresh: refresh2, draw: d2, tap: tap2 },
        comb: { refresh: refresh3, draw: d3, tap: tap3 },
        tool: { refresh: refresh4, draw: d4 }
      };
      function refresh() {
        vis(gS1, st.mode === 'slots'); vis(gS2, st.mode === 'perm'); vis(gS3, st.mode === 'comb'); vis(gS4, st.mode === 'tool');
        M[st.mode].refresh();
      }
      P.onDraw = (c, p) => {
        busy = false; hits = []; zone = null;
        const m = M[st.mode]; if (st.mode === 'comb' && !s3) return;
        m.draw(c, p);
        if (busy) P.requestDraw();
      };
      const resetMode = () => {
        objs.clear();
        if (st.mode === 'slots') reset1(); else if (st.mode === 'perm') reset2(); else if (st.mode === 'comb') reset3(); else reset4();
      };
      const apply = patch => {
        cancelTimers();
        if (patch.sit !== undefined) { if (patch.mode === 'perm') { st.sit2 = patch.sit; sel2.value = patch.sit; } else { st.sit1 = patch.sit; sel1.value = patch.sit; } }
        if (patch.view !== undefined) { st.view = patch.view; sel3.value = patch.view; }
        if (patch.round !== undefined) st.round = patch.round;
        if (patch.mode !== undefined) st.mode = patch.mode;
        L2 = null; s3p = null; resetMode();
      };
      s3p = null;
      const aliveTok = () => {};
      void aliveTok;
      apply({ mode: 'slots', sit: 'podium' });
      return { destroy() { cancelTimers(); P.destroy(); }, apply };
    }
  });
}
