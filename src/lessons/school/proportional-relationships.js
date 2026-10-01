/* =====================================================================
   SCHOOL — Proportional relationships
   ===================================================================== */
{
  const SANS = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
  const SERIF = '"STIX Two Text", "Cambria Math", "Times New Roman", serif';
  const KMAX = 6, KSTEP = .5;
  const same = (a, b) => Math.abs(a - b) < 1e-6;
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const mk = o => { o.ys = o.ys || o.xs.map(x => +(o.k * x + o.b).toFixed(6)); o.lin = o.lin !== false; return o; };

  /* ---------- the situations: x and y values, the equation, and the reason a line y = kx does or does not fit ---------- */
  const SIT = {
    tickets: mk({ name: 'Movie tickets', prop: true, k: 3, b: 0, xs: [1, 2, 3, 4, 5], eq: 'y = 3x',
      words: 'Movie tickets all cost the same. One ticket costs $3.', xName: 'number of tickets', yName: 'cost in dollars',
      yU: 'dollars', xOne: 'ticket', win: { x: 6, y: 18, xs: 1, ys: 3 } }),
    sugar: mk({ name: 'Cookie recipe', prop: true, k: .5, b: 0, xs: [1, 2, 3, 4, 5], eq: 'y = 0.5x',
      words: 'A cookie recipe uses 0.5 cup of sugar for each batch.', xName: 'number of batches', yName: 'cups of sugar',
      yU: 'cups of sugar', xOne: 'batch', win: { x: 6, y: 7, xs: 1, ys: 1 } }),
    walk: mk({ name: 'Walking', prop: true, k: 1.5, b: 0, xs: [2, 4, 6, 8], eq: 'y = 1.5x',
      words: 'Maya walks at a steady speed of 1.5 meters each second.', xName: 'seconds', yName: 'meters walked',
      yU: 'meters', xOne: 'second', win: { x: 9, y: 14, xs: 1, ys: 2 } }),
    pay: mk({ name: 'Babysitting pay', prop: true, k: 5, b: 0, xs: [1, 2, 3, 4, 5], eq: 'y = 5x',
      words: 'Sam is paid $5 for each hour of babysitting.', xName: 'hours worked', yName: 'pay in dollars',
      yU: 'dollars', xOne: 'hour', win: { x: 6, y: 30, xs: 1, ys: 5 } }),
    taxi: mk({ name: 'Taxi ride', prop: false, k: 2, b: 3, xs: [1, 2, 3, 6], eq: 'y = 2x + 3',
      words: 'A taxi ride costs $3 to start, plus $2 for each kilometer.', xName: 'kilometers', yName: 'cost in dollars',
      win: { x: 7, y: 16, xs: 1, ys: 2 }, verdict: 'A straight line, but it misses (0, 0)',
      setWhy: 'Every line y = kx goes through (0, 0). The taxi dots lie on a straight line that crosses the y-axis at 3, because of the $3 starting fee. A line through (0, 0) cannot fit them, so this is not proportional.' }),
    plant: mk({ name: 'Growing plant', prop: false, k: 2, b: 10, xs: [0, 1, 2, 5], eq: 'y = 2x + 10',
      words: 'A plant is already 10 centimeters tall today. It grows 2 centimeters each week.', xName: 'weeks from today', yName: 'height in centimeters',
      win: { x: 6, y: 24, xs: 1, ys: 4 }, verdict: 'A straight line, but it misses (0, 0)',
      setWhy: 'Every line y = kx goes through (0, 0). At week 0 the plant is already 10 cm tall, so the first dot is at (0, 10), high up on the y-axis. No line through (0, 0) can reach it, so this is not proportional.' }),
    member: mk({ name: 'Pool membership', prop: false, k: 3, b: 6, xs: [1, 2, 3, 6], eq: 'y = 3x + 6',
      words: 'A pool charges $6 to join, then $3 for each visit.', xName: 'number of visits', yName: 'total cost in dollars',
      win: { x: 7, y: 28, xs: 1, ys: 4 }, verdict: 'A straight line, but it misses (0, 0)',
      setWhy: 'Every line y = kx goes through (0, 0). The pool dots lie on a straight line that crosses the y-axis at 6, because of the $6 joining fee. A line through (0, 0) cannot fit them, so this is not proportional.' }),
    bulk: mk({ name: 'Notebook bulk deal', prop: false, lin: false, k: 0, b: 0, xs: [1, 2, 4, 8], ys: [4, 8, 12, 16], eq: 'no single rule y = kx',
      words: 'A shop gives a bulk discount on notebooks: the more you buy, the less each one costs.', xName: 'number of notebooks', yName: 'cost in dollars',
      win: { x: 9, y: 18, xs: 1, ys: 3 }, verdict: 'Not a straight line',
      setWhy: 'The dots do not lie on one straight line. y ÷ x is 4, 4, 3 and 2, so no single k fits. This is not proportional.' }),
    square: mk({ name: 'Area of a square', prop: false, lin: false, k: 0, b: 0, xs: [1, 2, 3, 4], ys: [1, 4, 9, 16], eq: 'y = x × x',
      words: 'A square has sides of x centimeters. Its area is y square centimeters.', xName: 'side in centimeters', yName: 'area in square centimeters',
      win: { x: 5, y: 18, xs: 1, ys: 3 }, verdict: 'Not a straight line',
      setWhy: 'The dots curve upward, but the line y = kx is straight. y ÷ x is 1, 2, 3 and 4, so no single k fits. This is not proportional.' })
  };
  const ORDER = ['tickets', 'sugar', 'walk', 'pay', 'taxi', 'plant', 'member', 'bulk', 'square'];
  /* the most dots any line y = kx can pass through */
  for (const S of Object.values(SIT))
    S.best = Math.max(...S.xs.map((x, i) => x === 0 ? 0 : S.xs.filter((x2, j) => same(S.ys[i] / x * x2, S.ys[j])).length));

  /* ---------- question banks ---------- */
  const FILL = [
    { sit: 'tickets', find: 'y', x: 6, ans: 18, win: { x: 7, y: 21, xs: 1, ys: 3 },
      text: 'The table shows what tickets cost. The last column is missing its cost. How much do 6 tickets cost?',
      choices: [
        { v: 14, label: '$14', why: 'That adds 2 to the cost because there are 2 more tickets than in the last column (4 to 6). But each ticket costs $3, not $1. Two more tickets add 2 × 3 = 6 dollars, so 12 + 6 = 18.' },
        { v: 18, label: '$18', ok: true, why: 'The unit rate k is 3 dollars for 1 ticket, because y ÷ x is 3 in every column. So y = 3 × 6 = 18 dollars. The point (6, 18) is on the line and the equation is y = 3x.' },
        { v: 9, label: '$9', why: 'That is 6 + 3. You never add the unit rate to the number of tickets. You multiply: 6 tickets cost 6 × 3 = 18 dollars.' },
        { v: 2, label: '$2', why: 'That is 6 ÷ 3. Dividing gives tickets per dollar, not dollars per ticket. Six tickets must cost more than the 4 tickets in the table, which cost $12.' }] },
    { sit: 'sugar', find: 'y', x: 8, ans: 4, win: { x: 9, y: 7, xs: 1, ys: 1 },
      text: 'The table shows how much sugar a cookie recipe needs. How many cups of sugar do 8 batches need?',
      choices: [
        { v: 2.5, label: '2.5 cups', why: 'That is the sugar for 5 batches (2 + 0.5). The table jumps from 4 batches to 8 batches, so there are 4 more batches. They need 4 × 0.5 = 2 more cups, and 2 + 2 = 4.' },
        { v: 8.5, label: '8.5 cups', why: 'That is 8 + 0.5. You do not add the unit rate to the number of batches. You multiply: 8 × 0.5 = 4. Each batch uses only half a cup, so the sugar must be less than the number of batches.' },
        { v: 16, label: '16 cups', why: 'That is 8 ÷ 0.5. Dividing by 0.5 doubles the number, but each batch uses only half a cup. The sugar should be half of 8, not double.' },
        { v: 4, label: '4 cups', ok: true, why: 'The unit rate k is 0.5 cup for 1 batch. So y = 0.5 × 8 = 4 cups. Multiplying by 0.5 is the same as halving, and half of 8 is 4. The point (8, 4) is on the line and the equation is y = 0.5x.' }] },
    { sit: 'walk', find: 'x', y: 18, ans: 12, win: { x: 14, y: 20, xs: 2, ys: 4 },
      text: 'The table shows how far Maya has walked. The last column is missing the time. How many seconds does it take her to walk 18 meters?',
      choices: [
        { v: 27, label: '27 seconds', why: 'That is 18 × 1.5. Multiplying by k turns seconds into meters. Here you start with meters, so you go the other way and divide: 18 ÷ 1.5 = 12.' },
        { v: 16.5, label: '16.5 seconds', why: 'That is 18 − 1.5. The unit rate says how many meters in 1 second, so ask how many 1.5s fit into 18: 18 ÷ 1.5 = 12.' },
        { v: 12, label: '12 seconds', ok: true, why: 'The unit rate k is 1.5 meters for 1 second. To get x from y, divide by k: 18 ÷ 1.5 = 12 seconds. Check: 12 × 1.5 = 18. The point (12, 18) is on the line.' },
        { v: 10, label: '10 seconds', why: 'That adds only 2 to the last x, 8. From 12 meters to 18 meters is 6 more meters. At 1.5 meters each second, 6 meters take 6 ÷ 1.5 = 4 more seconds, and 8 + 4 = 12.' }] },
    { sit: 'pay', find: 'y', x: 8, ans: 40, win: { x: 9, y: 45, xs: 1, ys: 10 },
      text: 'The table shows what Sam earns babysitting. How much does Sam earn in 8 hours?',
      choices: [
        { v: 40, label: '$40', ok: true, why: 'The unit rate k is 5 dollars for 1 hour. So y = 5 × 8 = 40 dollars. The point (8, 40) is on the line and the equation is y = 5x.' },
        { v: 13, label: '$13', why: 'That is 8 + 5. The unit rate multiplies the hours: 8 × 5 = 40 dollars.' },
        { v: 25, label: '$25', why: 'That is the pay for 5 hours (20 + 5). The table goes from 4 hours to 8 hours, so there are 4 more hours. They add 4 × 5 = 20 dollars, and 20 + 20 = 40.' },
        { v: 1.6, label: '$1.60', why: 'That is 8 ÷ 5. Dividing gives hours per dollar. Pay in dollars is hours times dollars per hour: 8 × 5 = 40.' }] }
  ];

  const DEC = [
    { sit: 'tickets', view: 'all', prop: true,
      ask: 'Look at the words, the table and the graph. Is the cost proportional to the number of tickets?',
      exp: 'y ÷ x is 3 in every column (3 ÷ 1, 6 ÷ 2, 9 ÷ 3, 12 ÷ 4, 15 ÷ 5). The dots lie on a straight line through (0, 0): 0 tickets cost $0. Both tests pass, so it is proportional, and y = 3x.',
      trap: 'Check the y ÷ x row: it is 3 in every column. Equal ratios mean the relationship is proportional. The dots also lie on a straight line through (0, 0). Both tests pass.' },
    { sit: 'taxi', view: 'table', prop: false,
      ask: 'Look at the table. Is the cost of the taxi ride proportional to the distance?',
      exp: 'y ÷ x is 5, 3.5, 3 and 2.5. It changes, so this is not proportional. The $3 starting fee is paid before any kilometers, so 0 km would cost $3, not $0. On the graph the dots lie on a straight line that crosses the y-axis at 3, so it misses (0, 0).',
      trap: 'The cost does go up by $2 for each extra kilometer, which makes a straight line. But a straight line is not enough. In a proportional relationship y ÷ x must be the same in every column, and here it is 5, 3.5, 3 and 2.5.' },
    { sit: 'walk', view: 'graph', prop: true,
      ask: 'Look at the graph. Is y proportional to x?',
      exp: 'The dots lie on a straight line, and extended back it goes through (0, 0): at 0 seconds Maya has walked 0 meters. A straight line through the origin means proportional. Here y ÷ x is 1.5 for every dot (3 ÷ 2, 6 ÷ 4, 9 ÷ 6, 12 ÷ 8), so y = 1.5x.',
      trap: 'The dashed line now extends the dots back to x = 0, and it reaches (0, 0). A straight line through the origin is proportional. It does not matter that the first dot is at x = 2.' },
    { sit: 'plant', view: 'graph', prop: false,
      ask: 'Look at the graph. Is y proportional to x?',
      exp: 'The dots lie on a straight line, but it crosses the y-axis at 10, not at (0, 0). At x = 0 the plant is already 10 cm tall. A proportional relationship needs y = 0 when x = 0. Also y ÷ x is 12, 7 and 4 (at x = 0 you cannot divide), so the ratios are not equal.',
      trap: 'The dots do lie on a straight line, but that is only one test. The line must also go through (0, 0). The first dot is at (0, 10), so this line misses the origin.' },
    { sit: 'bulk', view: 'table', prop: false,
      ask: 'Look at the table. Is the cost proportional to the number of notebooks?',
      exp: 'y ÷ x is 4, 4, 3 and 2. The first two columns match, but every column must match, and they do not. The more notebooks you buy, the less each one costs, so the dots bend away from a straight line.',
      trap: 'The first two columns both give 4, but you have to test every column. The last two give 3 and 2, so the ratios are not equal.' },
    { sit: 'sugar', view: 'table', prop: true,
      ask: 'Look at the table. Is the amount of sugar proportional to the number of batches?',
      exp: 'y ÷ x is 0.5 in every column. The ratio does not have to be a big number or a whole number. The unit rate is k = 0.5 cup of sugar for each batch, and y = 0.5x.',
      trap: 'Divide each y by its x: 0.5 ÷ 1, 1 ÷ 2, 1.5 ÷ 3, 2 ÷ 4, 2.5 ÷ 5. It is 0.5 every time. A ratio can be less than 1 and still be the same in every column, which is all that proportional needs.' },
    { sit: 'square', view: 'graph', prop: false,
      ask: 'Look at the graph. Is y proportional to x?',
      exp: 'The dots curve upward, so they are not on a straight line. A proportional relationship makes a straight line through (0, 0). These dots show the area of a square with side x. y ÷ x is 1, 2, 3 and 4, so the ratio keeps growing.',
      trap: 'The curve would pass through (0, 0), but that is only one test. The dots must also lie on a straight line. The dashed path now joins them, and it bends.' },
    { sit: 'member', view: 'words', prop: false,
      ask: 'Read the description. Is the total cost proportional to the number of visits? Try some numbers of your own.',
      exp: 'Try numbers. 1 visit costs 6 + 3 = $9, 2 visits cost $12 and 3 visits cost $15. y ÷ x is 9, 6 and 5, which changes. Also 0 visits still costs the $6 joining fee, so y is not 0 when x is 0. This is not proportional: y = 3x + 6.',
      trap: 'Each visit adds $3, but the $6 joining fee is paid first. 1 visit costs $9, and 9 ÷ 1 = 9. 2 visits cost $12, and 12 ÷ 2 = 6. The ratio changes, so it is not proportional.' }
  ];

  /* mini graphs and tables used as answer choices in the translate questions */
  let svgId = 0;
  const miniGraph = ({ xmax, ymax, xs, ys, k, b, label }) => {
    const W = 200, H = 84, L = 26, R = 192, T = 6, B = 68;
    const X = x => L + x / xmax * (R - L), Y = y => B - y / ymax * (B - T);
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}" style="width:100%;height:auto;display:block">`;
    for (let x = xs; x <= xmax + 1e-9; x += xs)
      s += `<line x1="${X(x)}" y1="${T}" x2="${X(x)}" y2="${B}" stroke="var(--grid)" stroke-width="1"/><text x="${X(x)}" y="${B + 11}" font-size="9" text-anchor="middle" fill="var(--muted)">${x}</text>`;
    for (let y = ys; y <= ymax + 1e-9; y += ys)
      s += `<line x1="${L}" y1="${Y(y)}" x2="${R}" y2="${Y(y)}" stroke="var(--grid)" stroke-width="1"/><text x="${L - 4}" y="${Y(y) + 3}" font-size="9" text-anchor="end" fill="var(--muted)">${y}</text>`;
    s += `<path d="M${L} ${T}V${B}H${R}" fill="none" stroke="var(--grid-strong)" stroke-width="1.5"/><text x="${L - 4}" y="${B + 11}" font-size="9" text-anchor="end" fill="var(--muted)">0</text>`;
    const xe = k > 0 ? Math.min(xmax, (ymax - b) / k) : xmax;
    s += `<path d="M${X(0)} ${Y(b)}L${X(xe)} ${Y(b + k * xe)}" fill="none" stroke="var(--blue)" stroke-width="2.6" stroke-linecap="round"/></svg>`;
    return s;
  };
  const miniTable = (xs, ys, label) => {
    const td = 'padding:1px 7px;border-bottom:1px solid var(--line);text-align:center;', th = td + 'font-weight:700;';
    return `<table aria-label="${label}" style="border-collapse:collapse;font-variant-numeric:tabular-nums;font-size:.84rem;margin:0 auto"><tr><th style="${th}color:var(--green)">x</th><th style="${th}color:var(--red)">y</th></tr>` +
      xs.map((x, i) => `<tr><td style="${td}">${x}</td><td style="${td}">${ys[i]}</td></tr>`).join('') + '</table>';
  };
  const GW = { xmax: 10, ymax: 15, xs: 2, ys: 3 };
  const TRN = [
    { sit: 'sugar', given: 'words', kind: 'text',
      text: 'A cookie recipe uses 0.5 cup of sugar for each batch. Let x be the number of batches and y the cups of sugar. Which equation matches the words?',
      choices: [
        { html: 'y = x + 0.5', why: 'Test it with x = 4 batches. The equation gives y = 4 + 0.5 = 4.5 cups, but 4 batches use 4 × 0.5 = 2 cups. Adding 0.5 would describe a starting amount. A rate multiplies x.' },
        { html: 'y = 2x', why: 'Test it with x = 4 batches. The equation gives y = 8 cups, but 4 batches use only 2 cups. The 2 is batches per cup, the unit rate turned upside down. We need cups per batch, which is 0.5.' },
        { html: 'x = 0.5y', why: 'The x and y are swapped. This says batches = 0.5 × cups, so 4 cups would make 2 batches. But 1 batch uses 0.5 cup, so it is the cups, y, that equal 0.5 times the batches, x.' },
        { html: 'y = 0.5x', ok: true, why: 'Each batch uses 0.5 cup, so the cups are 0.5 times the batches: y = 0.5x. The unit rate, 0.5, is the number that multiplies x.' }] },
    { sit: 'walk', given: 'table', kind: 'graph',
      text: 'The table shows how far Maya has walked after 2, 4, 6 and 8 seconds. Which graph shows the same relationship? Pick a pair from the table and check it on each graph.',
      choices: [
        { svg: { ...GW, k: 1.5, b: 3, label: 'Graph A: a straight line that starts at (0, 3)' }, name: 'Graph A', why: 'At x = 6 this line gives y = 12, but the table says 9. It rises at the right rate but it starts at y = 3, so it misses (0, 0). A proportional graph goes through the origin.' },
        { svg: { ...GW, k: 1.5, b: 0, label: 'Graph B: a straight line through (0, 0)' }, name: 'Graph B', ok: true, why: 'The table has (6, 9). On this line x = 6 gives y = 9, and the line goes through (0, 0). The other columns, (2, 3), (4, 6) and (8, 12), sit on it too. The unit rate is 9 ÷ 6 = 1.5.' },
        { svg: { ...GW, k: 3, b: 0, label: 'Graph C: a steep straight line through (0, 0)' }, name: 'Graph C', why: 'At x = 6 this line gives y = 18, but the table says 9. It goes through (0, 0) but it is too steep. It uses 3, the first y value, as the unit rate. The unit rate is y ÷ x = 3 ÷ 2 = 1.5.' }] },
    { sit: 'pay', given: 'eq', kind: 'text',
      text: 'Let x be the number of hours Sam babysits and y Sam\'s pay in dollars. The equation is y = 5x. Which sentence matches the equation?',
      choices: [
        { html: 'Sam is paid $5 for each hour.', ok: true, why: 'In y = 5x, y is 5 times x, so every hour adds $5. 1 hour pays $5, 2 hours pay $10 and 0 hours pay $0. The unit rate, 5, is dollars per hour.' },
        { html: 'Sam is paid $5 to start, then $1 for each hour.', why: 'That would be y = x + 5. In y = 5x nothing is added, so 0 hours pays $0. And x is multiplied by 5, so each hour adds $5, not $1.' },
        { html: 'Sam is paid $1 for every 5 hours.', why: 'That would be y = x ÷ 5, where y is one fifth of x. In y = 5x the y is 5 times the x, so each hour adds $5.' }] },
    { sit: 'tickets', given: 'graph', kind: 'table', n: 4,
      text: 'The graph shows the cost of movie tickets. Read the height of each dot. Which table matches the graph?',
      choices: [
        { xs: [1, 2, 3, 4], ys: [3, 5, 7, 9], name: 'Table A', why: 'The point (1, 3) is on the graph, but (2, 5) is not. At x = 2 the graph is at height 6. This table adds 2 each time, but the graph goes up 3 for every 1 step right.' },
        { xs: [3, 6, 9, 12], ys: [1, 2, 3, 4], name: 'Table B', why: 'The x and y are swapped. This table says that x = 3 has y = 1, but on the graph x = 3 is at height 9. Read across first (x), then up (y).' },
        { xs: [1, 2, 3, 4], ys: [3, 6, 9, 12], name: 'Table C', ok: true, why: 'Reading the dots gives (1, 3), (2, 6), (3, 9) and (4, 12). y ÷ x is 3 every time, and the graph goes up 3 for every 1 step right. That is the unit rate.' }] }
  ];
  const IDLE = {
    fill: 'Choose an answer. The point you choose appears on the graph, and every choice is explained.',
    decide: 'Choose an answer. You can test first with the switches below.',
    trans: 'Choose the form that matches. Every choice is explained.'
  };

  /* ---------- canvas helpers (pixel space) ---------- */
  const rrect = (c, x, y, w, hh, r) => {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + hh, r); c.arcTo(x + w, y + hh, x, y + hh, r);
    c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  const tx = (c, pal, s, x, y, { size = 14, color, align = 'left', weight = 500, halo = false } = {}) => {
    c.font = `${weight} ${size}px ${SANS}`; c.textAlign = align; c.textBaseline = 'middle';
    if (halo) { c.lineWidth = 4; c.strokeStyle = pal.stage; c.lineJoin = 'round'; c.strokeText(s, x, y); }
    c.fillStyle = color || pal.text; c.fillText(s, x, y);
  };
  /* math text: letters in italic serif, the rest upright. Returns the width. */
  const mt = (c, pal, s, x, y, { size = 16, color, weight = 500 } = {}) => {
    const runs = [];
    for (const ch of s) {
      const it = /[a-zA-Z]/.test(ch), last = runs[runs.length - 1];
      if (last && last.it === it) last.t += ch; else runs.push({ t: ch, it });
    }
    const font = it => it ? `italic ${size * 1.05}px ${SERIF}` : `${weight} ${size * .9}px ${SANS}`;
    let px = x;
    c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = color || pal.text;
    for (const r of runs) { c.font = font(r.it); c.fillText(r.t, px, y); px += c.measureText(r.t).width; }
    return px - x;
  };
  const wrap = (c, s, maxW) => {
    const out = []; let line = '';
    for (const w of s.split(' ')) {
      const t = line ? line + ' ' + w : w;
      if (line && c.measureText(t).width > maxW) { out.push(line); line = w; } else line = t;
    }
    if (line) out.push(line);
    return out;
  };

  register({
    id: 'proportional-relationships', level: 'school',
    title: 'Proportional relationships',
    blurb: 'Set the unit rate on a graph, fill in tables, and test whether a relationship is proportional.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 1.6; p.cy = 2.4; p.span = 3.5;
      p.grid(1);
      p.path([[0, 0], [3.4, 5.1]], { stroke: pal.blue, width: 2.6 });
      p.path([[0, 0], [1, 0]], { stroke: pal.green, width: 3 });
      p.path([[1, 0], [1, 1.5]], { stroke: pal.red, width: 3 });
      [[1, 1.5], [2, 3], [3, 4.5]].forEach(([x, y]) => p.dot(x, y, 5, pal.yellow, pal.stage, 1.5));
    },
    hook: String.raw`The cost of movie tickets and the cost of a taxi ride both grow as you buy more. Why is only one of them proportional, and how can a table or a graph show the difference?`,
    steps: [
      { title: 'Find the unit rate',
        text: String.raw`<p>Movie tickets all cost the same. Each yellow dot is one table column: 3 tickets cost $9, for example.</p><p>The <b>unit rate</b> k is the cost of <em>one</em> ticket. Drag the ringed point at x = 1 until the blue line goes through every dot. Then try the other situations in the menu. Some cannot be matched. Why not?</p>`,
        set: { mode: 'set', sit: 'tickets', k: 1, ratio: 0, ev: 0, tri: 0 } },
      { title: 'Use the unit rate to fill a table',
        text: String.raw`<p>Once you know k, you can fill in any missing entry. Read k from the y ÷ x row, then choose the answer.</p><p>To get y from x, multiply by k. To get x from y, divide by k. Every choice shows where its point lands on the graph.</p>`,
        set: { mode: 'fill', qi: 0, k: 3, ratio: 1, ev: 0, tri: 0 } },
      { title: 'Proportional or not?',
        text: String.raw`<p>Two tests. <b>Table:</b> y ÷ x is the same number in every column. <b>Graph:</b> the dots lie on a straight line through the origin (0, 0).</p><p>Each question shows only a table, a graph or words. Decide, then read why. The switches let you test it yourself.</p>`,
        set: { mode: 'decide', qi: 0, k: 3, ratio: 0, ev: 0, tri: 0 } },
      { title: 'One relationship, four forms',
        text: String.raw`<p>Words, a table, a graph and an equation can describe the same proportional relationship. Each question shows one form. Choose the form that matches.</p><p>Watch the graph when it appears: 1 step right goes up k. That unit rate k is the steepness of a line through the origin. In Grade 8 you will call it the <b>slope</b>.</p>`,
        set: { mode: 'trans', qi: 0, k: 3, ratio: 0, ev: 0, tri: 0 } }
    ],
    formal: String.raw`
      <p><b>Definition.</b> Two quantities \(x\) and \(y\) are in a <em>proportional relationship</em> if the ratio \(y \div x\) is the same number for every pair (with \(x \neq 0\)). Call that number \(k\):
      \[ \frac{y}{x} = k \qquad\text{or, the same thing,}\qquad y = kx. \]
      The number \(k\) is the <em>constant of proportionality</em>. It is also the <em>unit rate</em>: how much \(y\) there is for each 1 of \(x\). Here \(x\) is the independent variable (the one you choose) and \(y\) is the dependent variable (it depends on \(x\)).</p>
      <h3>Four ways to show one relationship</h3>
      <p>Take "a movie ticket costs $3". <b>Words:</b> 3 dollars for each ticket. <b>Table:</b> \(x = 1, 2, 3, 4\) gives \(y = 3, 6, 9, 12\). <b>Graph:</b> the points \((1,3)\), \((2,6)\), \((3,9)\), \((4,12)\) lie on a straight line through \((0,0)\). <b>Equation:</b> \(y = 3x\). You can start from any one of these and find the other three.</p>
      <h3>Finding the unit rate</h3>
      <p><b>From words:</b> it is the amount "for each 1". <b>From a table:</b> divide any \(y\) by its \(x\). If the pair is \((6, 9)\), then \(k = 9 \div 6 = 1.5\). <b>From a graph:</b> read the height at \(x = 1\), or divide \(y\) by \(x\) at any point on the line. <b>From an equation:</b> it is the number that multiplies \(x\) in \(y = kx\).</p>
      <p>The unit rate can be a decimal or a fraction, and it can be less than 1. A recipe that uses 0.5 cup of sugar for each batch has \(y = 0.5x\) and \(k = 0.5\).</p>
      <h3>Testing for a proportional relationship</h3>
      <p><b>Table test.</b> Work out \(y \div x\) in every column. If the answers are all equal, the relationship is proportional. Test every column, not only the first two.</p>
      <p><b>Graph test.</b> Plot the pairs. The relationship is proportional when the points lie on a straight line that goes through \((0,0)\). Both parts are needed. A straight line that misses the origin fails, and so does a curve that passes through the origin.</p>
      <h3>When it is not proportional</h3>
      <p>A taxi charges $3 to start and $2 for each kilometer, so \(y = 2x + 3\). The pairs \((1,5)\), \((2,7)\), \((3,9)\), \((6,15)\) give \(y \div x = 5,\ 3.5,\ 3,\ 2.5\). The ratios change, and the line crosses the y-axis at 3, not at 0. In general, for \(y = mx + b\) with \(b \neq 0\),
      \[ \frac{y}{x} = m + \frac{b}{x}, \]
      which changes as \(x\) changes. A quick check: a proportional relationship always has \(y = 0\) when \(x = 0\). The taxi, a plant that is already 10 cm tall, and a membership with a joining fee all start above 0, so none of them is proportional.</p>
      <p>Going up by the same amount each time is not enough, because the taxi does that. A bulk discount fails in a different way: the pairs \((1,4)\), \((2,8)\), \((4,12)\), \((8,16)\) give \(y \div x = 4,\ 4,\ 3,\ 2\), and the points do not lie on a line at all.</p>
      <h3>The unit rate and the line</h3>
      <p>If \(y = kx\), then \((0,0)\) and \((1,k)\) are both on the line. So for every 1 step to the right, the line goes up \(k\). A bigger \(k\) gives a steeper line, and \(k = 0\) gives a flat one. When you move the unit-rate point on a graph, the line turns about the origin. This steepness has a name: in Grade 8 you will see that the unit rate of a proportional relationship is the <em>slope</em> of a line through the origin.</p>`,
    check: [
      { q: String.raw`A table shows these pairs \((x, y)\): \((1, 5)\), \((2, 7)\), \((3, 9)\), \((4, 11)\). Is \(y\) proportional to \(x\)?`,
        choices: ['Yes, because y goes up by 2 each time.', 'Yes, because the points lie on a straight line.',
                  String.raw`No, because \(y \div x\) is 5, 3.5, 3 and 2.75. The ratios are not all equal.`, 'No, because y is always bigger than x.'], answer: 2,
        why: String.raw`\(y \div x\) is \(5, 3.5, 3, 2.75\), not the same each time. The points do lie on a straight line (\(y\) goes up by 2 each time), but the line crosses the y-axis at 3, not at \((0,0)\). A proportional relationship needs equal ratios.`,
        hint: String.raw`Divide each \(y\) by its \(x\). Are all four answers the same?` },
      { q: String.raw`Let \(x\) be the number of hours worked and \(y\) the pay in dollars. The graph of the pay is a straight line through \((0, 0)\) and \((4, 10)\). Which equation matches?`,
        choices: [String.raw`\(y = 4x\)`, String.raw`\(y = 0.4x\)`, String.raw`\(y = x + 6\)`, String.raw`\(y = 2.5x\)`], answer: 3,
        why: String.raw`The unit rate is the pay for 1 hour: \(y \div x = 10 \div 4 = 2.5\). So \(y = 2.5x\). Check with \((4, 10)\): \(2.5 \times 4 = 10\). The value \(0.4\) is \(4 \div 10\), which is hours per dollar, the unit rate upside down.`,
        hint: String.raw`The unit rate is \(y \div x\) at any point on the line. Which number goes on top?` }
    ],
    links: { prereq: ['unit-rates-and-best-buys'], next: ['slope-and-linear-functions'], related: ['forms-of-a-linear-equation', 'what-is-a-function', 'scatter-plots-and-lines-of-fit', 'ratios-and-equivalent-ratios'] },

    mount({ stage, controls: C }) {
      stage.classList.add('split');
      stage.style.minHeight = '560px';
      const top = h('div', { class: 'pane', style: 'flex: 12 1 0' }), bot = h('div', { class: 'pane', style: 'flex: 19 1 0' });
      stage.append(top, bot);
      const PT = new Plane(top), PG = new Plane(bot);

      /* st: numbers the steps animate (the student's k, and fades for the extra rows and marks) */
      const st = { k: 1, ratio: 0, ev: 0, tri: 0 };
      const want = { ratio: 0, ev: 0, tri: 0 };   /* where each switch is heading, so a fade does not flip it back */
      let mode = 'set', sid = 'tickets', qi = 0, cancel = () => {};
      const tk = { solved: false, cand: null, msg: '', first: null, btns: [] };   /* the current question */
      const score = [];
      const cur = () => SIT[sid];
      const QS = () => mode === 'fill' ? FILL : mode === 'decide' ? DEC : mode === 'trans' ? TRN : null;
      const qNow = () => { const b = QS(); return b ? b[qi] : null; };
      const win = () => (mode === 'fill' && FILL[qi].win) || cur().win;
      const matched = () => { const S = cur(); return S.prop && S.xs.every((x, i) => same(st.k * x, S.ys[i])); };

      /* what is visible in each activity */
      const V = () => {
        const q = qNow(), d = tk.solved;
        if (mode === 'set') return { words: 1, table: 1, graph: 1, eq: 'you', line: 'you', lineRow: 1, ratio: st.ratio, ev: 0, tri: st.tri, handle: 1 };
        if (mode === 'fill') return { words: 1, table: 1, graph: 1, eq: d ? 'true' : null, line: 'true', lineRow: 0, ratio: 1, ev: 0, tri: d ? 1 : 0 };
        if (mode === 'decide') {
          const g = q.view;
          return { words: d || g !== 'graph', table: d || g === 'all' || g === 'table', graph: d || g === 'all' || g === 'graph',
            eq: d ? 'true' : null, line: null, lineRow: 0, ratio: st.ratio, ev: st.ev, tri: 0, verdict: d };
        }
        const g = q.given, gr = d || g === 'graph';
        return { words: d || g === 'words', table: d || g === 'table', graph: gr, eq: d || g === 'eq' ? 'true' : null,
          line: gr ? 'true' : null, lineRow: 0, ratio: d ? 1 : 0, ev: 0, tri: gr ? 1 : 0 };
      };

      /* the columns of the table (and the dots on the graph) */
      const colsFor = () => {
        const S = cur(), q = qNow();
        if (mode === 'fill') {
          const base = S.xs.slice(0, 4).map((x, i) => ({ x, y: S.ys[i] }));
          const ask = q.find === 'y' ? { x: q.x, y: null, ask: 'y' } : { x: null, y: q.y, ask: 'x' };
          ask.val = tk.solved ? q.ans : tk.cand;
          return base.concat(ask);
        }
        const n = mode === 'trans' && q.n ? q.n : S.xs.length;
        return S.xs.slice(0, n).map((x, i) => ({ x, y: S.ys[i] }));
      };

      /* ---------- graph geometry: a window with its own scale on each axis ---------- */
      const geo = p => {
        const w = win(), L = clamp(p.w * .105, 34, 50), R = 18, T = 34, B = 42;
        return { w, L, R, T, B, pw: Math.max(10, p.w - L - R), ph: Math.max(10, p.h - T - B) };
      };
      PG.X = x => { const g = geo(PG); return g.L + x / g.w.x * g.pw; };
      PG.Y = y => { const g = geo(PG); return g.T + g.ph - y / g.w.y * g.ph; };
      PG.toMath = (px, py) => { const g = geo(PG); return [(px - g.L) / g.pw * g.w.x, (g.T + g.ph - py) / g.ph * g.w.y]; };

      /* ---------- top pane: words, table, equation ---------- */
      PT.onDraw = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, S = cur(), v = V(), pad = clamp(W * .04, 16, 20);
        const f = clamp(Math.min(W / 27, H / 11.5), 12, 17), lh = f * 1.32;
        const hid = (x, y, w, hh, label) => {
          c.save(); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.setLineDash([5, 5]); rrect(c, x, y, w, hh, 8); c.stroke(); c.restore();
          tx(c, pal, label, x + w / 2, y + hh / 2, { size: f * .9, color: pal.muted, align: 'center' });
        };
        let y = pad + 2;
        c.font = `500 ${f}px ${SANS}`;
        if (v.words) {
          const lines = wrap(c, S.words, W - 2 * pad);
          lines.forEach((s, i) => tx(c, pal, s, pad, y + lh * (i + .5), { size: f }));
          y += lines.length * lh;
          tx(c, pal, 'x = ' + S.xName + ',  y = ' + S.yName, pad, y + lh * .45, { size: f * .86, color: pal.muted });
          y += lh * .95;
        } else { y += 6; hid(pad + 8, y, W - 2 * pad - 16, lh + 4, 'The description is hidden for now'); y += lh + 4 + lh * .5; }

        const eqH = lh * 1.35, eqY = H - pad - eqH / 2;
        const cols = colsFor(), n = cols.length;
        const xv = cols.map(q => q.ask === 'x' ? q.val : q.x), yv = cols.map(q => q.ask === 'y' ? q.val : q.y);
        const rows = [{ lab: 'x', col: pal.green, f: i => xv[i] }, { lab: 'y', col: pal.red, f: i => yv[i] }];
        if (v.table && v.ratio > .01) rows.push({ lab: 'y ÷ x', col: pal.violet, ratio: true, a: v.ratio,
          f: i => xv[i] == null || yv[i] == null ? null : xv[i] === 0 ? NaN : yv[i] / xv[i] });
        if (v.table && v.lineRow) rows.push({ lab: 'k × x', col: pal.blue, line: true, f: i => xv[i] == null ? null : st.k * xv[i] });
        const yT = y + 2, yB = H - pad - eqH - 4, area = yB - yT;
        const rowH = clamp(area / rows.length, 18, 38), tH = rowH * rows.length, ty = yT + (area - tH) / 2;
        const lw = Math.max(48, f * 3.7), cw = clamp((W - 2 * pad - lw) / n, 34, 92), tw = lw + cw * n, x0 = (W - tw) / 2;

        if (!v.table) hid(pad, ty, W - 2 * pad, tH, 'The table is hidden for now');
        else {
          cols.forEach((q, i) => { if (q.ask) { c.fillStyle = alpha(pal.yellow, tk.solved ? .14 : .22); c.fillRect(x0 + lw + i * cw + 2, ty, cw - 4, tH); } });
          rows.forEach((r, ri) => {
            const cy = ty + (ri + .5) * rowH, a = r.a == null ? 1 : r.a;
            c.globalAlpha = a;
            if (r.ratio) { c.fillStyle = alpha(pal.violet, .1); c.fillRect(x0, ty + ri * rowH, tw, rowH); }
            if (ri) { c.strokeStyle = pal.grid; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, ty + ri * rowH); c.lineTo(x0 + tw, ty + ri * rowH); c.stroke(); }
            tx(c, pal, r.lab, x0 + lw - 10, cy, { size: f, color: r.col, weight: 700, align: 'right' });
            cols.forEach((q, i) => {
              const val = r.f(i), cx = x0 + lw + (i + .5) * cw;
              if (r.line && val != null && yv[i] != null) { c.fillStyle = alpha(same(val, yv[i]) ? pal.green : pal.red, .2); c.fillRect(x0 + lw + i * cw + 2, ty + ri * rowH + 2, cw - 4, rowH - 4); }
              const unknown = val === null, cand = q.ask && !tk.solved && val != null && ((r.lab === 'y' && q.ask === 'y') || (r.lab === 'x' && q.ask === 'x'));
              if (cand) { c.save(); c.strokeStyle = pal.muted; c.lineWidth = 1.5; c.setLineDash([4, 4]); rrect(c, x0 + lw + i * cw + 5, ty + ri * rowH + 3, cw - 10, rowH - 6, 6); c.stroke(); c.restore(); }
              const s = unknown ? '?' : Number.isNaN(val) ? '–' : num(val);
              tx(c, pal, s, cx, cy, { size: f * 1.05, weight: unknown || (q.ask && r.lab !== 'x' && r.lab !== 'y') ? 700 : 600, align: 'center', color: unknown ? pal.text : Number.isNaN(val) ? pal.muted : r.line ? pal.blue : r.col });
            });
            c.globalAlpha = 1;
          });
          c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0 + lw, ty); c.lineTo(x0 + lw, ty + tH); c.stroke();
        }

        /* the equation */
        if (v.eq === 'you') {
          tx(c, pal, 'Your line:', pad, eqY, { size: f * .9, color: pal.muted });
          c.font = `500 ${f * .9}px ${SANS}`;
          const w1 = c.measureText('Your line:').width + 10, w2 = mt(c, pal, linEq(st.k, 0), pad + w1, eqY, { size: f * 1.1, color: pal.blue, weight: 600 });
          const D = S.xs.map((x, i) => [x, S.ys[i]]), hit = D.filter(([x, y2]) => same(st.k * x, y2)).length;
          const msg = matched() ? ['matches every dot', pal.green] : S.prop ? [(D.some(([x, y2]) => st.k * x > y2) ? 'above' : 'below') + ' the dots', pal.red] : ['reaches ' + hit + ' of ' + D.length + ' dots', pal.red];
          tx(c, pal, msg[0], pad + w1 + w2 + 14, eqY, { size: f * .9, color: msg[1], weight: 700 });
        } else if (v.eq === 'true') {
          tx(c, pal, 'Equation:', pad, eqY, { size: f * .9, color: pal.muted });
          c.font = `500 ${f * .9}px ${SANS}`;
          const w1 = c.measureText('Equation:').width + 10, w2 = mt(c, pal, S.eq, pad + w1, eqY, { size: f * 1.1, color: pal.blue, weight: 600 });
          const note = S.prop ? 'unit rate k = ' + num(S.k) : S.lin ? 'not of the form y = kx' : '';
          if (note) tx(c, pal, note, pad + w1 + w2 + 14, eqY, { size: f * .9, color: pal.muted });
        } else hid(pad, eqY - eqH / 2 + 2, Math.min(W - 2 * pad, 260), eqH - 4, 'The equation is hidden for now');
      };

      /* ---------- bottom pane: the graph ---------- */
      PG.onDraw = (c, p) => {
        const pal = p.pal, g = geo(p), w = g.w, S = cur(), v = V(), q = qNow();
        const fs = clamp(Math.min(p.w, p.h) / 24, 11.5, 14.5), dr = clamp(fs * .5, 5.5, 7.5);
        const X = x => p.X(x), Y = y => p.Y(y), bx = g.L + g.pw, by = g.T + g.ph;
        let xs = w.xs, ys = w.ys;
        while (g.pw / (w.x / xs) < 30) xs *= 2;
        while (g.ph / (w.y / ys) < 22) ys *= 2;

        c.lineWidth = 1; c.strokeStyle = pal.grid; c.beginPath();
        for (let x = xs; x <= w.x + 1e-9; x += xs) { c.moveTo(X(x), g.T); c.lineTo(X(x), by); }
        for (let y = ys; y <= w.y + 1e-9; y += ys) { c.moveTo(g.L, Y(y)); c.lineTo(bx, Y(y)); }
        c.stroke();
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 2; c.beginPath(); c.moveTo(g.L, g.T - 4); c.lineTo(g.L, by); c.lineTo(bx + 4, by); c.stroke();
        for (let x = xs; x <= w.x + 1e-9; x += xs) {
          const one = same(x, 1) && v.tri > .3 && v.graph;
          tx(c, pal, num(x), X(x), by + 14, { size: fs, color: one ? pal.green : pal.muted, align: 'center', weight: one ? 700 : 500 });
        }
        for (let y = ys; y <= w.y + 1e-9; y += ys) tx(c, pal, num(y), g.L - 8, Y(y), { size: fs, color: pal.muted, align: 'right' });
        tx(c, pal, '0', g.L - 8, by + 14, { size: fs, color: pal.muted, align: 'right' });
        const named = v.words;
        tx(c, pal, named ? 'x = ' + S.xName : 'x', bx - 14, p.h - 9, { size: fs, color: pal.green, align: 'right', weight: 600 });
        tx(c, pal, named ? 'y = ' + S.yName : 'y', 8, 13, { size: fs, color: pal.red, weight: 600 });

        if (!v.graph) {
          const label = 'The graph is hidden for now';
          c.font = `500 ${fs * 1.1}px ${SANS}`;
          const lw = c.measureText(label).width + 28;
          c.save(); c.fillStyle = alpha(pal.stage, .92); rrect(c, g.L + g.pw / 2 - lw / 2, g.T + g.ph / 2 - 16, lw, 32, 8); c.fill();
          c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.setLineDash([5, 5]); c.stroke(); c.restore();
          tx(c, pal, label, g.L + g.pw / 2, g.T + g.ph / 2, { size: fs * 1.1, color: pal.muted, align: 'center' });
          return;
        }

        const cols = colsFor(), pts = cols.filter(q2 => !q2.ask);
        c.save(); c.beginPath(); c.rect(g.L - 2, g.T - 2, g.pw + 4, g.ph + 4); c.clip();

        /* evidence for the proportional test: the dots joined, extended back to x = 0 */
        if (v.ev > .01) {
          c.globalAlpha = v.ev;
          if (S.lin) p.path([[0, S.b], [w.x, S.b + S.k * w.x]], { stroke: pal.blue, width: 3, dash: [9, 6] });
          else p.path(S.xs.map((x, i) => [x, S.ys[i]]), { stroke: pal.blue, width: 3, dash: [9, 6] });
          c.globalAlpha = 1;
        }
        /* the line: the student's, or the true one */
        if (v.line === 'you') p.path([[0, 0], [w.x, st.k * w.x]], { stroke: pal.blue, width: 3.5 });
        else if (v.line === 'true' && S.lin) p.path([[0, S.b], [w.x, S.b + S.k * w.x]], { stroke: pal.blue, width: 3.5 });
        /* the step: 1 across, k up */
        if (v.tri > .01) {
          const k = v.line === 'you' ? st.k : S.k;
          c.globalAlpha = v.tri;
          p.path([[0, 0], [1, 0]], { stroke: pal.green, width: 4.5 });
          p.path([[1, 0], [1, k]], { stroke: pal.red, width: 4.5 });
          c.globalAlpha = 1;
        }
        c.restore();

        if (v.tri > .01 && !v.handle) {
          const k = S.k;
          p.label(num(k), 1, k / 2, { size: fs * 1.15, italic: false, color: pal.red, align: 'left', dx: 10, alpha: v.tri });
        }
        /* origin and intercept marks */
        if (v.ev > .01) {
          c.globalAlpha = v.ev;
          p.dot(0, 0, 9, null, pal.violet, 3);
          if (S.lin && S.b) {
            p.dot(0, S.b, 6.5, pal.yellow, pal.stage, 2);
            p.label('(0, ' + num(S.b) + ')', 0, S.b, { size: fs * 1.1, italic: false, align: 'left', dx: 13, dy: 17 });
          }
          c.globalAlpha = 1;
        }
        if (v.verdict) tx(c, pal, S.verdict || 'A straight line through (0, 0)', g.L + 12, g.T + 16, { size: fs * 1.1, color: S.prop ? pal.green : pal.red, weight: 700, halo: true });

        /* the dots (a ring marks the ones the student's line reaches) */
        if (v.handle) pts.forEach(q2 => { if (same(st.k * q2.x, q2.y)) p.dot(q2.x, q2.y, dr + 5, null, pal.green, 3); });
        pts.forEach(q2 => p.dot(q2.x, q2.y, dr, pal.yellow, pal.stage, 2));

        /* the question point in the fill activity */
        if (mode === 'fill') {
          const val = tk.solved ? q.ans : tk.cand, ax = q.find === 'y' ? q.x : val, ay = q.find === 'y' ? val : q.y;
          if (val == null) {
            c.save(); c.setLineDash([6, 6]); c.strokeStyle = pal.muted; c.lineWidth = 1.5; c.beginPath();
            if (q.find === 'y') { c.moveTo(X(q.x), by); c.lineTo(X(q.x), g.T); } else { c.moveTo(g.L, Y(q.y)); c.lineTo(bx, Y(q.y)); }
            c.stroke(); c.restore();
            if (q.find === 'y') tx(c, pal, 'x = ' + num(q.x), X(q.x), g.T + 10, { size: fs, color: pal.muted, align: 'center', halo: true });
            else tx(c, pal, 'y = ' + num(q.y), bx - 6, Y(q.y) - 11, { size: fs, color: pal.muted, align: 'right', halo: true });
          } else if (ax <= w.x && ay <= w.y) {
            p.path([[ax, 0], [ax, ay]], { stroke: alpha(pal.green, .95), width: 2.5, dash: [6, 5] });
            p.path([[ax, ay], [0, ay]], { stroke: alpha(pal.red, .95), width: 2.5, dash: [6, 5] });
            if (tk.solved) p.dot(ax, ay, dr + 2, pal.yellow, pal.green, 3);
            else { p.dot(ax, ay, dr + 1, alpha(pal.stage, .9), pal.muted, 2.5); }
            const lab = '(' + num(ax) + ', ' + num(ay) + ')', left = ax > w.x * .6;
            p.label(lab, ax, ay, { size: fs * 1.1, italic: false, align: left ? 'right' : 'left', dx: left ? -12 : 12, dy: -15 });
          } else {
            const right = ax > w.x, px = right ? bx - 8 : clamp(X(ax), g.L + 10, bx - 10), py = right ? clamp(Y(ay), g.T + 10, by - 10) : g.T + 8;
            c.fillStyle = pal.muted; c.beginPath();
            if (right) { c.moveTo(px + 6, py); c.lineTo(px - 6, py - 7); c.lineTo(px - 6, py + 7); } else { c.moveTo(px, py - 6); c.lineTo(px - 7, py + 6); c.lineTo(px + 7, py + 6); }
            c.closePath(); c.fill();
            tx(c, pal, '(' + num(ax) + ', ' + num(ay) + ') is off the graph', clamp(px, 150, p.w - 16), right ? py + 16 : py + 20, { size: fs, color: pal.muted, align: 'right', halo: true });
          }
        }

        /* the unit-rate handle */
        if (v.handle) {
          p.dot(1, st.k, 11.5, alpha(pal.stage, .9), pal.brass, 3.2); p.dot(1, st.k, 4.5, pal.blue);
          /* put the label where it hits the fewest of: the axes, the line and the dots */
          const lab = '(1, ' + num(st.k) + ')', fsz = fs * 1.05, hx = X(1), hy = Y(st.k);
          c.font = `500 ${fsz}px ${SANS}`;
          const lw = c.measureText(lab).width, lhh = fsz + 2;
          let best = null;
          [[16, 17, 'left'], [-14, -17, 'right'], [16, -17, 'left'], [0, -27, 'center'], [-14, 17, 'right']].forEach(([dx, dy, al], ci) => {
            const x0 = hx + dx - (al === 'center' ? lw / 2 : al === 'right' ? lw : 0), x1 = x0 + lw, y0 = hy + dy - lhh / 2, y1 = hy + dy + lhh / 2;
            let pen = ci * .1;
            if (x0 < g.L + 3 || x1 > bx || y0 < g.T || y1 > by - 3) pen += 10;
            for (let t = 0; t <= 8; t++) { const px = x0 + (x1 - x0) * t / 8, ly = Y(st.k * ((px - g.L) / g.pw * w.x)); if (ly > y0 - 4 && ly < y1 + 4) pen += 4; }
            pts.forEach(q2 => { if (X(q2.x) > x0 - 7 && X(q2.x) < x1 + 7 && Y(q2.y) > y0 - 7 && Y(q2.y) < y1 + 7) pen += 6; });
            if (!best || pen < best.pen) best = { pen, dx, dy, al };
          });
          tx(c, pal, lab, hx + best.dx, hy + best.dy, { size: fsz, align: best.al, halo: true });
        }
      };

      /* ---------- the panel ---------- */
      const probe = C.readout(), host = probe.parentElement; probe.remove();
      const grp = () => h('div', { style: 'display:flex;flex-direction:column;gap:16px' });
      const gSet = grp(), gQ = grp(), gTools = grp(), gNext = grp();
      const fb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
      const hintEl = h('p', { class: 'hint' });
      host.append(gSet, gQ, fb, gNext, gTools, hintEl);

      const selSit = C.select({ label: 'Situation', value: sid, options: ORDER.map(id => ({ value: id, label: SIT[id].name })),
        onChange: v => { cancel(); sid = v; st.ratio = 0; want.ratio = 0; sync(); } });
      gSet.append(selSit.parentElement);
      const kS = C.slider({ label: 'Unit rate k (the height at x = 1)', min: 0, max: KMAX, step: KSTEP, value: st.k, format: v => num(v), onInput: v => editK(v) });
      gSet.append(host.lastElementChild);
      const fade = key => on => { cancel(); want[key] = on ? 1 : 0; cancel = animateTo(st, { [key]: on ? 1 : 0 }, 300, sync); };
      const tgRatio = C.toggle({ label: 'Show the y ÷ x row', value: false, onChange: fade('ratio') });
      const tgEv = C.toggle({ label: 'Connect the dots and extend to x = 0', value: false, onChange: fade('ev') });
      const tgTri = C.toggle({ label: 'Show 1 across and k up', value: false, onChange: fade('tri') });
      const rowRatio = tgRatio.parentElement, rowEv = tgEv.parentElement, rowTri = tgTri.parentElement;
      gTools.append(rowRatio, rowEv, rowTri);
      const nextBtn = C.buttons([{ label: 'Next question', primary: true, onClick: () => nextQ() }])[0];
      gNext.append(nextBtn.parentElement);

      const qHead = h('p', { class: 'hint', style: 'margin:0' }), qText = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' }), qList = h('div', { style: 'display:flex;flex-direction:column;gap:8px' });
      gQ.append(qHead, qText, qList);

      const reveal = () => { try { (tk.solved ? gNext : fb).scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' }); } catch (e) {} };
      const say = (okk, html) => { tk.msg = (okk ? good('Right. ') : bad('Not quite. ')) + html; };

      /* the feedback while the student sets k */
      const fbSet = () => {
        const S = cur(), k = st.k, kk = num(k), D = S.xs.map((x, i) => [x, S.ys[i]]), n = D.length;
        const hit = D.filter(([x, y]) => same(k * x, y)).length;
        if (S.prop) {
          if (hit === n) return good('The line goes through every dot.') + ` The ringed point is at (1, ${kk}), so k = ${kk}: ${kk} ${S.yU} for 1 ${S.xOne}.` +
            `<br><span class="k">Table</span> y ÷ x is ${kk} in every column.<br><span class="k">Graph</span> the line is ${kk} high at x = 1 and goes through (0, 0).` +
            `<br><span class="k">Equation</span> ${linEq(k, 0)}. Turn on "Show 1 across and k up" to see k on the graph.`;
          const [x, y] = D.find(([x2, y2]) => !same(k * x2, y2)), up = k * x > y;
          return bad(`Your line is ${up ? 'above' : 'below'} the dots.`) + ` At x = ${num(x)} it says y = ${num(k * x)}, but the dot says y = ${num(y)}. ${up ? 'Lower' : 'Raise'} the ringed point.` +
            `<br><span class="k">It goes through ${hit} of ${n} dots. ${want.ratio ? 'Tip: the y ÷ x row shows k.' : 'Tip: switch on "Show the y ÷ x row" to read k from the table.'}</span>`;
        }
        return bad(`Your line goes through ${hit} of ${n} dots.`) + ` Move the point as much as you like: no value of k works. The best any k can do is ${S.best} of ${n}.<br>${S.setWhy}`;
      };
      const renderFb = () => { fb.innerHTML = mode === 'set' ? fbSet() : (tk.msg || `<span class="k">${IDLE[mode]}</span>`); };

      const hints = () => {
        const q = qNow();
        hintEl.textContent = mode === 'set' ? 'Drag the ringed point at x = 1, or use the slider. Try the other situations in the menu too.'
          : mode === 'fill' ? 'Read k from the y ÷ x row first. Then choose.'
          : mode === 'decide' ? (q.view === 'words' ? 'Try a few numbers of your own. What happens when x is 0?' : 'Test it yourself with the switches, then choose.')
          : 'Check a pair or two from the form you can see.';
      };
      const tools = () => {
        const dv = mode === 'decide' ? (tk.solved ? 'all' : DEC[qi].view) : null;
        rowRatio.style.display = mode === 'set' || dv === 'all' || dv === 'table' ? '' : 'none';
        rowEv.style.display = dv === 'all' || dv === 'graph' ? '' : 'none';
        rowTri.style.display = mode === 'set' ? '' : 'none';
        gTools.style.display = [rowRatio, rowEv, rowTri].some(r => r.style.display !== 'none') ? 'flex' : 'none';
      };

      const sync = () => {
        kS.set(st.k); tgRatio.checked = !!want.ratio; tgEv.checked = !!want.ev; tgTri.checked = !!want.tri;
        PT.draw(); PG.draw(); renderFb();
      };
      const editK = v => {
        cancel(); st.k = clamp(v, 0, KMAX);
        if (mode === 'set' && matched()) { st.ratio = 1; want.ratio = 1; }
        sync();
      };

      /* ---------- the questions ---------- */
      const mkBtn = (inner, onclick, style = '') => {
        const b = h('button', { type: 'button', class: 'btn', style: 'justify-content:flex-start;text-align:left;border-radius:10px;width:100%;padding:8px 14px;line-height:1.35;' + style, onclick });
        if (typeof inner === 'string') b.innerHTML = inner; else b.append(inner);
        return b;
      };
      const mark = (b, okk) => {
        b.style.borderColor = okk ? 'var(--green)' : 'var(--red)';
        b.style.background = `color-mix(in srgb, var(--${okk ? 'green' : 'red'}) ${okk ? 16 : 12}%, transparent)`;
        if (!okk) b.disabled = true;
      };
      const lock = () => tk.btns.forEach(b => { if (!b.dataset.right) b.disabled = true; });
      const resetTk = () => { tk.solved = false; tk.cand = null; tk.msg = ''; tk.first = null; tk.btns = []; };
      const finished = () => { nextBtn.textContent = qi === QS().length - 1 ? 'Start again' : 'Next question'; gNext.style.display = 'flex'; };

      const done = () => {  /* a question was solved: lock the other choices, offer the next one */
        tk.solved = true; lock();
        const S = cur(), last = qi === QS().length - 1;
        if (mode === 'fill' && last) tk.msg += '<br><br>That was the last question. When you know the unit rate, y = kx gives any entry: multiply to go from x to y, and divide to go from y to x.';
        if (mode === 'decide') {
          if (last) tk.msg += `<br><br>You chose correctly on the first try ${score.filter(Boolean).length} of ${DEC.length} times. Remember the two tests: y ÷ x equal in every column, or a straight line through (0, 0).`;
        }
        if (mode === 'trans') {
          tk.msg += `<br><br>Now the other forms appear. They agree: y ÷ x is ${num(S.k)} in every column, the graph is a straight line through (0, 0), and the equation is ${S.eq}.`;
          if (last) tk.msg += '<br><br>All four questions done. On the graph, the green and red steps show 1 across and k up. The unit rate k is the steepness of a line through the origin. In Grade 8 you will call it the slope.';
        }
        finished(); tools();
      };

      const buildQ = () => {
        qList.textContent = ''; gNext.style.display = 'none'; tk.btns = [];
        const q = qNow(); hints(); tools();
        if (!q) return;
        qHead.textContent = `Question ${qi + 1} of ${QS().length}`;
        qText.textContent = q.text || q.ask;
        if (mode === 'decide') {
          qList.style.flexDirection = 'row';
          [['Proportional', true], ['Not proportional', false]].forEach(([label, val]) => {
            const b = mkBtn(label, () => pickDecide(val, b), 'justify-content:center;text-align:center;flex:1');
            tk.btns.push(b); qList.append(b);
          });
          return;
        }
        qList.style.flexDirection = mode === 'trans' && q.kind === 'table' ? 'row' : 'column';
        q.choices.forEach((ch, i) => {
          let inner, style = '';
          if (mode === 'fill') inner = ch.label;
          else if (q.kind === 'graph') { inner = h('span', { style: 'display:block;width:100%' }); inner.innerHTML = `<span style="display:block;font-size:.82rem;color:var(--muted);margin-bottom:2px">${ch.name}</span>` + miniGraph(ch.svg); }
          else if (q.kind === 'table') { inner = h('span', { style: 'display:block;width:100%;text-align:center' }); inner.innerHTML = `<span style="display:block;font-size:.82rem;color:var(--muted);margin-bottom:3px">${ch.name}</span>` + miniTable(ch.xs, ch.ys, ch.name); style = 'flex:1;padding:8px 4px'; }
          else inner = ch.html;
          const b = mkBtn(inner, () => pickChoice(i, b), style + (q.kind === 'graph' ? ';padding:6px 10px' : ''));
          if (ch.ok) b.dataset.right = '1';
          if (q.kind === 'graph') b.setAttribute('aria-label', ch.svg.label);
          if (q.kind === 'table') b.setAttribute('aria-label', ch.name + ': x is ' + ch.xs.join(', ') + ' and y is ' + ch.ys.join(', '));
          tk.btns.push(b); qList.append(b);
        });
      };

      const pickChoice = (i, b) => {
        if (tk.solved) return;
        const q = qNow(), ch = q.choices[i];
        if (mode === 'fill') tk.cand = ch.v;
        mark(b, !!ch.ok); say(!!ch.ok, ch.why);
        if (ch.ok) done();
        sync(); reveal();
      };
      const pickDecide = (val, b) => {
        if (tk.solved) return;
        const q = DEC[qi], okk = val === q.prop;
        if (tk.first === null) { tk.first = okk; score[qi] = okk; }
        mark(b, okk); say(okk, okk ? q.exp : q.trap + '<br><span class="k">' + q.exp + '</span>');
        if (okk) b.dataset.right = '1';
        cancel(); want.ratio = 1; want.ev = 1; cancel = animateTo(st, { ratio: 1, ev: 1 }, 500, sync);
        if (okk) done();
        tools(); sync(); reveal();
      };
      const nextQ = () => {
        cancel();
        const last = qi === QS().length - 1;
        if (last) score.length = 0;
        loadQ(last ? 0 : qi + 1);
      };
      const loadQ = i => {
        qi = i; resetTk(); const q = qNow(); if (q) sid = q.sit;
        if (mode === 'decide') { st.ratio = 0; st.ev = 0; want.ratio = 0; want.ev = 0; }
        buildQ(); sync();
      };
      const setMode = (m, i) => {
        mode = m;
        gSet.style.display = m === 'set' ? 'flex' : 'none';
        gQ.style.display = m === 'set' ? 'none' : 'flex';
        if (m === 'set') { qi = 0; resetTk(); buildQ(); } else { score.length = 0; loadQ(i || 0); }
      };

      /* dragging the unit-rate point */
      draggable(PG, {
        hit: (px, py) => mode === 'set' && near(PG, 1, st.k, px, py, 24) ? 'k' : null,
        move: (hd, mx, my) => editK(clamp(snap(my, KSTEP), 0, KMAX))
      });

      /* guided steps */
      const apply = (patch, immediate) => {
        cancel();
        const { mode: m, sit, qi: i, ...rest } = patch;
        if (m !== undefined) {
          if (m === 'set' && sit) { sid = sit; selSit.value = sit; }
          setMode(m, i);
        }
        for (const key of Object.keys(want)) if (rest[key] !== undefined) want[key] = rest[key] > .5 ? 1 : 0;
        if (immediate) { Object.assign(st, rest); sync(); } else cancel = animateTo(st, rest, 900, sync);
      };
      setMode('set'); sync();
      return { destroy: () => { cancel(); PT.destroy(); PG.destroy(); }, apply };
    }
  });
}
