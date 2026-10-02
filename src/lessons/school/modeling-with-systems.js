/* =====================================================================
   SCHOOL — Modeling with systems
   ===================================================================== */
{
  const MI = '−';
  const terminating = v => Math.abs(v * 1000 - Math.round(v * 1000)) < 1e-4;
  const fracOf = v => { for (let q = 2; q <= 60; q++) if (Math.abs(v * q - Math.round(v * q)) < 1e-6) return [Math.round(v * q), q]; return null; };
  const nm = v => {
    if (terminating(v)) return (v < 0 ? MI : '') + (+Math.abs(v).toFixed(3));
    const f = fracOf(v); return f ? (f[0] < 0 ? MI : '') + Math.abs(f[0]) + '/' + f[1] : (v < 0 ? MI : '') + (+Math.abs(v).toFixed(3));
  };
  const nmd = v => (v < 0 ? MI : '') + (+Math.abs(v).toFixed(2));
  const show = v => (terminating(v) ? nm(v) : `${nm(v)} (about ${nmd(v)})`);
  const dl = v => (v < 0 ? MI : '') + '$' + nm(Math.abs(v));
  const par = v => (v < 0 || nm(v).includes('/') ? `(${nm(v)})` : nm(v));
  const z0 = v => Math.abs(v) < 1e-9;
  const r9 = v => Math.round(v * 1e9) / 1e9;
  const isInt = v => Math.abs(v - Math.round(v)) < 1e-9;
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const lcm = (a, b) => a / gcd(a, b) * b;
  const kk = t => `<span class="k">${t}</span>`;
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  /* ---------- writing equations ---------- */
  const term = (c, v, first) => {
    if (z0(c)) return '';
    const a = Math.abs(c), body = (Math.abs(a - 1) < 1e-9 ? '' : nm(a)) + v;
    return first ? (c < 0 ? MI : '') + body : (c < 0 ? ` ${MI} ` : ' + ') + body;
  };
  const stdStr = (a, b, c) => { let s = term(a, 'x', true); s += term(b, 'y', s === ''); if (s === '') s = '0'; return s + ' = ' + nm(c); };
  const side = (c, k) => { const t = term(c, 'x', true); if (t === '') return nm(k); return t + (z0(k) ? '' : (k < 0 ? ` ${MI} ` : ' + ') + nm(Math.abs(k))); };
  const isoStr = (m, k) => 'y = ' + side(m, k);
  const partStr = (sd, v, f) => {
    const q = i => (f[i] ? nm(v[i]) : '?');
    if (sd.form === 'iso') return `y = ${q(0)}x + ${q(1)}`;
    const s1 = f[1] ? (v[1] < 0 ? ` ${MI} ${nm(-v[1])}y` : ` + ${nm(v[1])}y`) : ' + ?y';
    return `${q(0)}x${s1} = ${q(2)}`;
  };

  /* ---------- the five stories ---------- */
  const P = id => ({ p: id });
  const ST = {};
  ST.tickets = {
    id: 'tickets', name: 'Ticket sales', form: 'std', cnt: [true, true], best: 'elim', lab: ['people', 'money'],
    nx: 'adult tickets', ny: 'child tickets', xl: 'adult tickets', yl: 'child tickets',
    par: [{ l: 'Adult ticket price', min: 4, max: 12, step: 1, v: 8, f: v => '$' + v }, { l: 'Child ticket price', min: 2, max: 9, step: 1, v: 5, f: v => '$' + v },
      { l: 'Total money collected', min: 200, max: 400, step: 10, v: 290, f: v => '$' + v }],
    view: { x0: -20, x1: 80, y0: -40, y1: 80, sx: 20, sy: 20 },
    txt: ['The school play had ', P('N'), ' in the audience. ', P('A'), ' each and ', P('C'), ' each. ', P('M'), '. How many of each kind of ticket were sold?'],
    ph: {
      N: { t: () => '40 people', what: 'how many people came in all', v: () => 40 },
      A: { t: u => `Adult tickets cost $${u[0]}`, what: 'the price of one adult ticket', v: u => u[0] },
      C: { t: u => `child tickets cost $${u[1]}`, what: 'the price of one child ticket', v: u => u[1] },
      M: { t: u => `The ticket office collected $${u[2]}`, what: 'the total money collected', v: u => u[2] }
    },
    unk: { x: 0, y: 1, opts: [
      { t: 'the number of adult tickets sold', why: 'The story asks how many adult tickets were sold, and we do not know that yet.' },
      { t: 'the number of child tickets sold', why: 'The story asks how many child tickets were sold, and we do not know that yet.' },
      { t: 'the price of an adult ticket', why: 'The price is given in the story, so we already know it. An unknown is something we have to find.' },
      { t: 'the total money collected', why: 'The story tells us the total, so it is known. We look for the two things we are not told.' },
      { t: 'the number of people in the audience', why: 'The story tells us how many people came, so it is known. The unknowns are the two counts that make up that total.' }] },
    eqs: [
      { name: 'Count the people', v: u => [1, 1, 40], units: 'tickets + tickets = people',
        pr: [{ fills: [0, 1], ask: 'Each ticket lets in one person. Which numbers go in front of x and y?', opts: u => [
            ['1 and 1', true, 'Each ticket admits one person, so x tickets are x people and y tickets are y people.'],
            [`${u[0]} and ${u[1]}`, false, 'Those are prices in dollars. This equation counts people, so each ticket counts as 1.'],
            ['40 and 40', false, '40 is the whole audience. It belongs on the right side, not in front of x and y.']] },
          { fills: [2], ask: 'Click the phrase that says how many people came in all.', ph: 'N', need: 'the total number of people' }] },
      { name: 'Count the money', v: u => [u[0], u[1], u[2]], units: 'dollars per ticket × tickets + dollars per ticket × tickets = dollars',
        pr: [{ fills: [0], ask: 'Click the phrase for the number in front of x (adult tickets): the money one adult ticket brings in.', ph: 'A', need: 'the money one adult ticket brings in' },
          { fills: [1], ask: 'Click the phrase for the number in front of y (child tickets): the money one child ticket brings in.', ph: 'C', need: 'the money one child ticket brings in' },
          { fills: [2], ask: 'Click the phrase that says how much money came in altogether.', ph: 'M', need: 'the total money collected' }] }],
    sent: (x, y) => `The play sold ${nm(x)} adult tickets and ${nm(y)} child tickets.`,
    mix: (x, y) => `The play sold ${nm(x)} people and ${nm(y)} dollars.`,
    at: (x, y) => `${nm(x)} adult and ${nm(y)} child tickets`,
    fit: (u, x, y) => `both counts are whole numbers, ${nm(x)} + ${nm(y)} = ${nm(x + y)} people, and the money is ${u[0]} × ${nm(x)} + ${u[1]} × ${nm(y)} = ${dl(u[0] * x + u[1] * y)}.`,
    negTail: 'Two equations can have a crossing point that the story cannot use. The prices and the total do not fit a real ticket sale for 40 people. Recheck the numbers.',
    none: (u, E) => `Every ticket costs the same, so 40 tickets always bring in the same money, whatever the mix. The total collected does not match that money, so no mix of tickets can work. The lines are parallel.`,
    same: () => 'Every ticket costs the same and the money matches 40 tickets, so any mix of tickets that adds to 40 works. The two equations say the same thing, so every point on the line is a solution.'
  };
  ST.profit = {
    id: 'profit', name: 'Break-even', form: 'iso', cnt: [true, false], best: 'sub', lab: ['cost', 'revenue'],
    nx: 'shirts', ny: 'dollars', xl: 'shirts made and sold', yl: 'dollars',
    par: [{ l: 'Selling price per shirt', min: 4, max: 14, step: 1, v: 10, f: v => '$' + v }, { l: 'Cost to make one shirt', min: 3, max: 9, step: 1, v: 6, f: v => '$' + v },
      { l: 'Set-up cost', min: 60, max: 200, step: 20, v: 120, f: v => '$' + v }],
    view: { x0: -30, x1: 90, y0: -150, y1: 600, sx: 30, sy: 150 },
    txt: ['Mia prints T-shirts to sell. ', P('F'), '. ', P('K'), ', and ', P('S'), '. How many shirts must she sell for her revenue to equal her cost?'],
    ph: {
      F: { t: u => `The screen and press cost $${u[2]} to set up`, what: 'the set-up cost, paid once', v: u => u[2] },
      K: { t: u => `Each shirt costs $${u[1]} to make`, what: 'the cost of making one shirt', v: u => u[1] },
      S: { t: u => `she sells each shirt for $${u[0]}`, what: 'the selling price of one shirt', v: u => u[0] }
    },
    unk: { x: 0, y: 1, opts: [
      { t: 'the number of shirts made and sold', why: 'The story asks how many shirts it takes, and we do not know that yet.' },
      { t: 'dollars (the cost, or the revenue)', why: 'At the break-even point cost and revenue are the same number of dollars. We do not know it yet, and both lines use it.' },
      { t: 'the selling price of one shirt', why: 'The price is given in the story, so it is known. It will be a number in an equation.' },
      { t: 'the set-up cost', why: 'The set-up cost is given in the story, so it is known.' },
      { t: 'the profit on each shirt', why: 'We can work that out from two known numbers, so it is not one of the two unknowns.' }] },
    eqs: [
      { name: 'The cost line', v: u => [u[1], u[2]], units: 'dollars per shirt × shirts + dollars = dollars',
        pr: [{ fills: [0], ask: 'Click the phrase for the number in front of x: what each extra shirt adds to the cost.', ph: 'K', need: 'the cost of making one shirt' },
          { fills: [1], ask: 'Click the phrase for the number added at the end: the cost you pay once, even before the first shirt.', ph: 'F', need: 'the set-up cost' }] },
      { name: 'The revenue line', v: u => [u[0], 0], units: 'dollars per shirt × shirts + dollars = dollars',
        pr: [{ fills: [0], ask: 'Click the phrase for the number in front of x: the money each shirt brings in.', ph: 'S', need: 'the money one shirt brings in' },
          { fills: [1], ask: 'Revenue has no set-up charge. Which number goes at the end?', opts: u => [
            ['0', true, 'With 0 shirts sold, the revenue is $0. Nothing is added at the end.'],
            [`${u[2]}`, false, 'That is the set-up cost. It belongs to the cost line. Revenue is only money coming in.'],
            [`${u[0]}`, false, 'That is the price per shirt, which is already in front of x.']] }] }],
    sent: (x, y) => `Mia breaks even after ${nm(x)} shirts, when cost and revenue are both ${dl(y)}.`,
    mix: (x, y) => `Mia breaks even after ${dl(x)} and ${nm(y)} shirts.`,
    at: (x, y) => `${nm(x)} shirts, ${dl(y)}`,
    fit: (u, x, y) => `the number of shirts is a whole number, and at ${nm(x)} shirts the cost is ${u[1]} × ${nm(x)} + ${u[2]} = ${dl(y)} and the revenue is ${u[0]} × ${nm(x)} = ${dl(y)}.`,
    negTail: 'For every real number of shirts (0 or more), revenue stays below cost, so Mia never breaks even at these prices.',
    none: (u) => `Each shirt earns exactly what it costs to make, so the set-up cost is never earned back. The lines are parallel, and there is no break-even.`,
    same: () => 'The two lines are the same line.'
  };
  ST.gym = {
    id: 'gym', name: 'Two gym plans', form: 'iso', cnt: [false, false], best: 'sub', lab: ['Gym A', 'Gym B'],
    nx: 'months', ny: 'dollars', xl: 'months', yl: 'total cost in dollars',
    par: [{ l: 'Gym A joining fee', min: 0, max: 100, step: 5, v: 45, f: v => '$' + v }, { l: 'Gym A per month', min: 10, max: 40, step: 5, v: 20, f: v => '$' + v },
      { l: 'Gym B joining fee', min: 0, max: 100, step: 5, v: 0, f: v => '$' + v }, { l: 'Gym B per month', min: 10, max: 40, step: 5, v: 30, f: v => '$' + v }],
    view: { x0: -3, x1: 12, y0: -60, y1: 360, sx: 3, sy: 60 },
    txt: ['Two gyms want your business. ', P('AJ'), ' and ', P('AM'), '. ', P('BJ'), ' and ', P('BM'), '. After how many months have the two gyms cost the same in total?'],
    ph: {
      AJ: { t: u => `Gym A charges $${u[0]} to join`, what: 'the joining fee of Gym A', v: u => u[0] },
      AM: { t: u => `$${u[1]} a month`, what: 'the monthly fee of Gym A', v: u => u[1] },
      BJ: { t: u => (u[2] ? `Gym B charges $${u[2]} to join` : 'Gym B has no joining fee'), what: 'the joining fee of Gym B', v: u => u[2] },
      BM: { t: u => `$${u[3]} a month`, what: 'the monthly fee of Gym B', v: u => u[3] }
    },
    unk: { x: 0, y: 1, opts: [
      { t: 'the number of months', why: 'The story asks after how many months the costs match, and we do not know that yet.' },
      { t: 'the total cost in dollars', why: 'At the moment the gyms cost the same, they have cost the same number of dollars. We do not know it yet.' },
      { t: 'the monthly fee of Gym A', why: 'The monthly fee is given in the story, so it is known.' },
      { t: 'the joining fee of Gym B', why: 'The joining fee is given in the story, so it is known.' },
      { t: 'the number of gyms', why: 'There are two gyms and we are told so. It is not something to solve for.' }] },
    eqs: [
      { name: 'Total cost of Gym A', v: u => [u[1], u[0]], units: 'dollars per month × months + dollars = dollars',
        pr: [{ fills: [0], ask: 'Click the phrase for the number in front of x: the cost that is added every month.', ph: 'AM', need: 'the monthly fee of Gym A' },
          { fills: [1], ask: 'Click the phrase for the number added at the end: the cost you pay once, at the start.', ph: 'AJ', need: 'the joining fee of Gym A' }] },
      { name: 'Total cost of Gym B', v: u => [u[3], u[2]], units: 'dollars per month × months + dollars = dollars',
        pr: [{ fills: [0], ask: 'Click the phrase for the number in front of x: the cost that is added every month.', ph: 'BM', need: 'the monthly fee of Gym B' },
          { fills: [1], ask: 'Click the phrase for the number added at the end: the cost you pay once, at the start.', ph: 'BJ', need: 'the joining fee of Gym B' }] }],
    sent: (x, y) => `The gyms cost the same after ${nm(x)} months, when each has cost ${dl(y)} in total.`,
    mix: (x, y) => `The gyms cost the same after ${dl(x)}, in ${nm(y)} months.`,
    at: (x, y) => `month ${nm(x)}, ${dl(y)} in total`,
    fit: (u, x, y) => {
      let s = `the plans tie at ${nm(x)} months, with ${dl(y)} spent on each.`;
      if (!isInt(x) && x > 0) {
        const f = Math.floor(x), c = f + 1, A = n => u[0] + u[1] * n, B = n => u[2] + u[3] * n;
        s += ` Gyms bill by whole months, so after ${f} months the totals are ${dl(A(f))} (A) and ${dl(B(f))} (B), and after ${c} months they are ${dl(A(c))} (A) and ${dl(B(c))} (B). Strictly, the totals match only partway through a month, so on the monthly bills they never match exactly.`;
      }
      return s;
    },
    negTail: 'The lines would cross before month 0, so one gym is cheaper than the other in every month that exists.',
    none: (u, E) => `The two gyms charge the same each month, but they start ${Math.abs(u[0] - u[2])} dollars apart. That gap never closes, so the gyms never cost the same. The lines are parallel.`,
    same: () => 'Same joining fee and same monthly fee: these are two descriptions of one plan. Every month costs the same in both, so every point on the line is a solution.'
  };
  ST.coins = {
    id: 'coins', name: 'Coins in a jar', form: 'std', cnt: [true, true], best: 'elim', lab: ['coins', 'cents'],
    nx: 'nickels', ny: 'quarters', xl: 'nickels', yl: 'quarters',
    par: [{ l: 'Number of coins', min: 20, max: 40, step: 1, v: 30, f: v => String(v) }, { l: 'Total value', min: 300, max: 700, step: 10, v: 510, f: v => `${v} cents ($${(v / 100).toFixed(2)})` }],
    view: { x0: -10, x1: 50, y0: -10, y1: 50, sx: 10, sy: 10 },
    txt: ['A jar holds ', P('N'), ', all nickels and quarters. ', P('D'), ' and ', P('Q'), '. ', P('V'), '. How many of each coin are in the jar?'],
    ph: {
      N: { t: u => `${u[0]} coins`, what: 'how many coins there are in all', v: u => u[0] },
      D: { t: () => 'A nickel is worth 5 cents', what: 'the value of one nickel in cents', v: () => 5 },
      Q: { t: () => 'a quarter is worth 25 cents', what: 'the value of one quarter in cents', v: () => 25 },
      V: { t: u => `Together the coins are worth ${u[1]} cents`, what: 'the total value in cents', v: u => u[1] }
    },
    unk: { x: 0, y: 1, opts: [
      { t: 'the number of nickels', why: 'The story asks how many of each coin, and we do not know the number of nickels yet.' },
      { t: 'the number of quarters', why: 'The story asks how many of each coin, and we do not know the number of quarters yet.' },
      { t: 'the value of a nickel in cents', why: 'The story tells us a nickel is worth 5 cents, so it is known.' },
      { t: 'the total value of the coins', why: 'The story tells us the total value, so it is known.' },
      { t: 'the number of coins in the jar', why: 'The story tells us how many coins there are, so it is known. The unknowns are the two counts that make it up.' }] },
    eqs: [
      { name: 'Count the coins', v: u => [1, 1, u[0]], units: 'coins + coins = coins',
        pr: [{ fills: [0, 1], ask: 'Each coin, nickel or quarter, counts as one coin. Which numbers go in front of x and y?', opts: u => [
            ['1 and 1', true, 'Each nickel is one coin and each quarter is one coin, so x nickels are x coins.'],
            ['5 and 25', false, 'Those are values in cents. This equation counts coins, so each coin counts as 1.'],
            [`${u[0]} and ${u[0]}`, false, 'The total number of coins belongs on the right side.']] },
          { fills: [2], ask: 'Click the phrase that gives the total number of coins.', ph: 'N', need: 'the total number of coins' }] },
      { name: 'Count the cents', v: u => [5, 25, u[1]], units: 'cents per nickel × nickels + cents per quarter × quarters = cents',
        pr: [{ fills: [0], ask: 'Click the phrase for the number in front of x (nickels): the value of one nickel in cents.', ph: 'D', need: 'the value of one nickel in cents' },
          { fills: [1], ask: 'Click the phrase for the number in front of y (quarters): the value of one quarter in cents.', ph: 'Q', need: 'the value of one quarter in cents' },
          { fills: [2], ask: 'Click the phrase that gives the total value, in cents.', ph: 'V', need: 'the total value in cents' }] }],
    sent: (x, y) => `The jar has ${nm(x)} nickels and ${nm(y)} quarters.`,
    mix: (x, y) => `The jar has ${nm(x)} cents and ${nm(y)} quarters.`,
    at: (x, y) => `${nm(x)} nickels, ${nm(y)} quarters`,
    fit: (u, x, y) => `both counts are whole numbers, ${nm(x)} + ${nm(y)} = ${nm(x + y)} coins, and the value is 5 × ${nm(x)} + 25 × ${nm(y)} = ${nm(5 * x + 25 * y)} cents.`,
    negTail: 'The total value and the number of coins do not fit together for nickels and quarters, so there is no real jar like this. Recheck the numbers.',
    none: () => '', same: () => ''
  };
  ST.row = {
    id: 'row', name: 'Rowing and the current', form: 'std', cnt: [false, false], best: 'elim', lab: ['downstream', 'upstream'],
    nx: 'km/h', ny: 'km/h', xl: 'rower speed (km/h)', yl: 'current speed (km/h)',
    par: [{ l: 'Hours downstream', min: 2, max: 5, step: 1, v: 2, f: v => v + ' h' }, { l: 'Hours upstream', min: 2, max: 6, step: 1, v: 3, f: v => v + ' h' }],
    view: { x0: -4, x1: 12, y0: -4, y1: 12, sx: 2, sy: 2 },
    txt: ['A rower goes ', P('D'), ', with the current. The way back, ', P('U'), ', is against the current. The rower and the current each keep a steady speed. How fast is the rower in still water, and how fast is the current?'],
    ph: {
      D: { t: u => `15 km downstream in ${u[0]} hours`, what: 'the trip with the current', v: u => 15 / u[0] },
      U: { t: u => `15 km upstream in ${u[1]} hours`, what: 'the trip against the current', v: u => 15 / u[1] }
    },
    unk: { x: 0, y: 1, opts: [
      { t: 'the rower\'s speed in still water', why: 'The story asks how fast the rower is in still water, and we do not know that yet.' },
      { t: 'the speed of the current', why: 'The story asks how fast the current is, and we do not know that yet.' },
      { t: 'the time of the downstream trip', why: 'The time is given in the story, so it is known.' },
      { t: 'the distance rowed', why: 'The distance is given in the story, so it is known.' },
      { t: 'the speed going downstream', why: 'We can work that out as distance ÷ time. It also equals the rower\'s speed plus the current\'s speed, so it is built from the two unknowns rather than being one of them.' }] },
    eqs: [
      { name: 'Downstream: the speeds add', v: u => [1, 1, 15 / u[0]], units: 'km/h + km/h = km/h',
        pr: [{ fills: [0, 1], ask: 'Going downstream the current pushes the rower along. How do the two speeds combine? Which numbers go in front of x and y?', opts: u => [
            ['1 and 1', true, 'The current helps, so the speed over the ground is the rower\'s speed plus the current\'s speed: x + y.'],
            ['1 and −1', false, 'A minus sign is for the trip against the current. Downstream the current adds speed.'],
            ['15 and 15', false, '15 is the distance. A distance is not a coefficient here; it is used to find the speed on the right side.']] },
          { fills: [2], ask: 'Click the phrase about the trip with the current.', ph: 'D', need: 'the trip with the current',
            ask2: 'Speed is distance divided by time. Which number goes on the right side?', opts: u => [
              [`${nm(15 / u[0])}  (15 ÷ ${u[0]})`, true, `Distance ÷ time gives a speed: 15 km ÷ ${u[0]} h = ${nm(15 / u[0])} km/h.`],
              [`${15 * u[0]}  (15 × ${u[0]})`, false, 'Multiplying kilometers by hours gives a strange unit, not kilometers per hour. A speed is distance divided by time.'],
              [`${u[0]}  (the time)`, false, 'That is the time in hours. The right side of this equation is a speed in km/h.'],
              [`${15 + u[0]}  (15 + ${u[0]})`, false, 'Adding kilometers and hours mixes units. A speed is distance divided by time.']] }] },
      { name: 'Upstream: the current slows the rower', v: u => [1, -1, 15 / u[1]], units: 'km/h − km/h = km/h',
        pr: [{ fills: [0, 1], ask: 'Going upstream the current pushes against the rower. Which numbers go in front of x and y?', opts: u => [
            ['1 and −1', true, 'The current takes speed away, so the speed over the ground is the rower\'s speed minus the current\'s speed: x − y.'],
            ['1 and 1', false, 'That would let the current help. Upstream the current works against the rower.'],
            ['15 and −15', false, '15 is the distance. A distance is not a coefficient here; it is used to find the speed on the right side.']] },
          { fills: [2], ask: 'Click the phrase about the trip against the current.', ph: 'U', need: 'the trip against the current',
            ask2: 'Speed is distance divided by time. Which number goes on the right side?', opts: u => [
              [`${nm(15 / u[1])}  (15 ÷ ${u[1]})`, true, `Distance ÷ time gives a speed: 15 km ÷ ${u[1]} h = ${nm(15 / u[1])} km/h.`],
              [`${15 * u[1]}  (15 × ${u[1]})`, false, 'Multiplying kilometers by hours gives a strange unit, not kilometers per hour. A speed is distance divided by time.'],
              [`${u[1]}  (the time)`, false, 'That is the time in hours. The right side of this equation is a speed in km/h.'],
              [`${15 + u[1]}  (15 + ${u[1]})`, false, 'Adding kilometers and hours mixes units. A speed is distance divided by time.']] }] }],
    sent: (x, y) => `The rower goes ${nm(x)} km/h in still water and the current flows at ${nm(y)} km/h.`,
    mix: (x, y) => `The rower goes ${nm(x)} km and the current flows for ${nm(y)} hours.`,
    at: (x, y) => `rower ${nm(x)} km/h, current ${nm(y)} km/h`,
    fit: (u, x, y) => `speeds can be decimals. Downstream x + y = ${nm(x)} + ${nm(y)} = ${nm(x + y)} km/h, and upstream x − y = ${nm(x)} − ${par(y)} = ${nm(x - y)} km/h.`,
    negTail: 'A negative current here would mean the upstream trip was faster than the downstream trip, which cannot happen on a river that flows downstream. Recheck the times.',
    none: () => '', same: () => ''
  };
  const ORDER = ['tickets', 'profit', 'gym', 'coins', 'row'];

  /* ---------- systems, solutions and cases ---------- */
  const stdOf = (sd, e, u) => { const v = e.v(u); return sd.form === 'iso' ? { a: -v[0], b: 1, c: v[1] } : { a: v[0], b: v[1], c: v[2] }; };
  const eqsNow = (id, u) => ST[id].eqs.map(e => stdOf(ST[id], e, u));
  const eqStr = (sd, e, u) => { const v = e.v(u); return sd.form === 'iso' ? isoStr(v[0], v[1]) : stdStr(v[0], v[1], v[2]); };
  const solveSys = E => {
    const [p, q] = E, det = p.a * q.b - q.a * p.b;
    if (Math.abs(det) < 1e-9) return { kind: Math.abs(p.a * q.c - q.a * p.c) < 1e-9 && Math.abs(p.b * q.c - q.b * p.c) < 1e-9 ? 'same' : 'none' };
    return { kind: 'one', x: r9((p.c * q.b - q.c * p.b) / det), y: r9((p.a * q.c - q.a * p.c) / det) };
  };
  const classify = (sd, sol) => {
    if (sol.kind !== 'one') return sol.kind;
    if (sol.x < -1e-9 || sol.y < -1e-9) return 'neg';
    if ((sd.cnt[0] && !isInt(sol.x)) || (sd.cnt[1] && !isInt(sol.y))) return 'frac';
    return 'good';
  };
  const inView = (v, x, y) => x >= v.x0 && x <= v.x1 && y >= v.y0 && y <= v.y1;
  const place = (correct, wrongs, k) => { const a = wrongs.slice(); a.splice(k % (a.length + 1), 0, correct); return a; };
  const negText = (sd, s) => { const v = s.x < 0 ? s.x : s.y, nme = s.x < 0 ? sd.nx : sd.ny; return `A negative amount like ${show(v)} ${nme} cannot happen. ${sd.negTail}`; };
  const fracText = (sd, s) => { const i = (sd.cnt[0] && !isInt(s.x)) ? 0 : 1, v = i ? s.y : s.x, nme = i ? sd.ny : sd.nx; return `You cannot have ${show(v)} ${nme}: a count of separate things must be a whole number. So the numbers in the story and the equations do not fit a real situation. Recheck the numbers and the equations.`; };

  /* ---------- the check step shared by every method ---------- */
  const checkStep = (id, u, xv, yv, k) => {
    const sd = ST[id], E = eqsNow(id, u), res = [];
    sd.eqs.forEach((e, i) => {
      const v = e.v(u);
      if (sd.form === 'iso') { const rhs = v[0] * xv + v[1]; res.push(`Equation ${i + 1}: ${nm(v[0])} × ${par(xv)} + ${nm(v[1])} = ${nm(rhs)}, and y = ${nm(yv)}. ${Math.abs(rhs - yv) < 1e-6 ? 'They match.' : 'No match.'}`); }
      else { const lhs = E[i].a * xv + E[i].b * yv; res.push(`Equation ${i + 1}: ${par(E[i].a)} × ${par(xv)} + ${par(E[i].b)} × ${par(yv)} = ${nm(lhs)}, and the right side is ${nm(E[i].c)}. ${Math.abs(lhs - E[i].c) < 1e-6 ? 'They match.' : 'No match.'}`); }
    });
    return { q: `Last, how do you check the point (${nm(xv)}, ${nm(yv)})?`, endKind: 'one', res, px: xv, py: yv, chk: true, opts: place(
      ['Put x and y into BOTH original equations', true, 'A true solution makes both equations true at once. If one fails, the point is not on both lines.'],
      [['Put them into just the equation I used last', false, 'That equation is sure to work, because you built the number from it. Only the other equation can catch a mistake.'],
        ['Check that x and y are positive', false, 'Positive is not enough: a wrong pair can be positive, and a correct crossing can be fractional or negative. Test the equations.'],
        ['Swap x and y and see if it looks right', false, 'Swapping changes the point. It does not test whether the point lies on both lines.']], k) };
  };

  /* ---------- the guided solving plans ---------- */
  const planIso = (id, u) => {
    const sd = ST[id], [m1, k1] = sd.eqs[0].v(u), [m2, k2] = sd.eqs[1].v(u), steps = [];
    let n = 0; const K = () => (ORDER.indexOf(id) + 2 * (n++) + 1) % 4;
    const lo = Math.min(m1, m2), kAny = k1 !== 0 ? k1 : (k2 !== 0 ? k2 : 5);
    steps.push({ q: 'Both equations say what y equals. Which move gives one equation with one unknown?', res: [`${side(m1, k1)} = ${side(m2, k2)}`], opts: place(
      ['Set the two right sides equal to each other', true, 'At the crossing point both lines have the same y, so the two expressions for y must be equal there.'],
      [['Add the two equations', false, 'That is a legal move, but it still has x and y mixed together. It does not give one equation in x alone.'],
        ['Set y = 0 in both equations', false, 'That finds where each line crosses the x-axis. Those are two different points, not the shared point.'],
        ['Set x = 0 in both equations', false, 'That finds where each line crosses the y-axis. Those are two different points, not the shared point.']], K()) });
    const cl = m1 - lo, cr = m2 - lo;
    const s2 = { q: 'Goal: get all the x terms on one side. Which move does that?', res: [`${side(cl, k1)} = ${side(cr, k2)}`], opts: place(
      [`Subtract ${nm(lo)}x from both sides`, true, 'Taking the same amount off both sides keeps the equation true. The smaller x term disappears, so the x terms are now on one side only.'],
      [[`Add ${nm(lo)}x to both sides`, false, `That makes the x terms bigger: ${side(m1 + lo, k1)} = ${side(m2 + lo, k2)}. There are still x terms on both sides.`],
        [`Subtract ${nm(kAny)} from both sides`, false, 'That is a legal move, but it does not collect the x terms, which is the goal now. Some x would stay on both sides.'],
        [`Divide both sides by ${nm(lo)}`, false, 'Dividing changes every term but does not move any x term across. The x terms would still be on both sides.']], K()) };
    steps.push(s2);
    if (z0(cl) && z0(cr)) {
      s2.endKind = k1 === k2 ? 'same' : 'none';
      s2.res.push(k1 === k2 ? `${nm(k1)} = ${nm(k2)} is always true, whatever x is.` : `${nm(k1)} = ${nm(k2)} is never true, whatever x is.`);
      return steps;
    }
    const onLeft = !z0(cl), c = onLeft ? cl : cr, p = onLeft ? k1 : k2, q = onLeft ? k2 : k1, d = q - p, xv = r9(d / c), yv = r9(m1 * xv + k1);
    if (!z0(p)) steps.push({ q: `The x term has ${nm(p)} beside it. Which move leaves the x term alone?`, res: [onLeft ? `${side(c, 0)} = ${nm(d)}` : `${nm(d)} = ${side(c, 0)}`], opts: place(
      [`Subtract ${nm(p)} from both sides`, true, `That cancels the ${nm(p)} beside the x term, and the same amount comes off both sides.`],
      [[`Add ${nm(p)} to both sides`, false, 'That makes the number beside x bigger instead of removing it.'],
        [`Subtract ${nm(c)}x from both sides`, false, 'That would take away the x we are trying to find.'],
        [`Divide both sides by ${nm(p)}`, false, 'That changes every term, including the x term. The number beside x is still there.']], K()) });
    steps.push({ q: `The equation says ${nm(c)}x equals ${nm(d)}. Which move finds x?`, res: [`x = ${nm(d)} ÷ ${nm(c)} = ${nm(xv)}`], px: xv, opts: place(
      [`Divide both sides by ${nm(c)}`, true, `${nm(c)}x means ${nm(c)} times x. Dividing both sides by ${nm(c)} undoes the multiplication and leaves x alone.`],
      [[`Multiply both sides by ${nm(c)}`, false, `That makes it ${nm(c * c)}x, which is further from x alone. Undo a multiplication with division.`],
        [`Subtract ${nm(c)} from both sides`, false, `${nm(c)}x is a product, so subtracting ${nm(c)} does not isolate x.`],
        [`Add ${nm(c)} to both sides`, false, `${nm(c)}x is a product, so adding ${nm(c)} does not isolate x.`]], K()) });
    steps.push({ q: `Now find y. What do you do with x = ${nm(xv)}?`, py: yv,
      res: [`Equation 1 with x = ${nm(xv)}: y = ${nm(m1)} × ${par(xv)} + ${nm(k1)} = ${nm(yv)}.`, `Equation 2 gives y = ${nm(m2)} × ${par(xv)} + ${nm(k2)} = ${nm(m2 * xv + k2)} too, because this is where the lines meet.`], opts: place(
        [`Replace x with ${nm(xv)} in equation 1 and work out y`, true, 'Now that x is known, equation 1 has only y left. Equation 2 gives the same y: that is what it means for the lines to meet.'],
        [[`Replace y with ${nm(xv)} in equation 1`, false, `${nm(xv)} is the value of x, not y. Each number goes with its own letter.`],
          [`Say y equals ${nm(xv)} too`, false, 'x and y are different unknowns, and they can have different values.'],
          [`Add ${nm(xv)} to both equations`, false, 'Adding the same number to both equations does not tell you y.']], K()) });
    steps.push(checkStep(id, u, xv, yv, K()));
    return steps;
  };

  const planElim = (id, u) => {
    const sd = ST[id], E = eqsNow(id, u), steps = [];
    let n = 0; const K = () => (ORDER.indexOf(id) + 2 * (n++) + 1) % 4;
    const cands = ['y', 'x'].map(V => {
      const p = V === 'x' ? E[0].a : E[0].b, q = V === 'x' ? E[1].a : E[1].b;
      if (z0(p) || z0(q) || !isInt(p) || !isInt(q)) return null;
      const L = lcm(Math.abs(p), Math.abs(q)); return { V, p, q, k1: L / Math.abs(p), k2: L / Math.abs(q) };
    }).filter(Boolean);
    const ch = cands.reduce((m, c) => (c.k1 + c.k2 < m.k1 + m.k2 ? c : m)), V = ch.V, R = V === 'x' ? 'y' : 'x', { k1, k2 } = ch;
    const A = { a: E[0].a * k1, b: E[0].b * k1, c: E[0].c * k1 }, B = { a: E[1].a * k2, b: E[1].b * k2, c: E[1].c * k2 };
    const vc = o => (V === 'x' ? o.a : o.b), rc = o => (V === 'x' ? o.b : o.a);
    const ts = c => term(c, V, true);
    if (k1 !== 1 || k2 !== 1) {
      const desc = (a, b) => (b === 1 ? `Multiply equation 1 by ${a}` : a === 1 ? `Multiply equation 2 by ${b}` : `Multiply equation 1 by ${a} and equation 2 by ${b}`);
      steps.push({ q: `We will eliminate ${V}. Its terms are ${ts(ch.p)} and ${ts(ch.q)}. To cancel them they must match. What do you multiply?`,
        res: [`Equation 1 × ${k1}: ${stdStr(A.a, A.b, A.c)}`, `Equation 2${k2 === 1 ? '' : ' × ' + k2}: ${stdStr(B.a, B.b, B.c)}`], opts: place(
          [desc(k1, k2), true, `Multiply every term, on both sides, so each equation stays true. Now the ${V} terms are ${ts(ch.p * k1)} and ${ts(ch.q * k2)}, so they can cancel.`],
          [[desc(k2, k1), false, `That makes the ${V} terms ${ts(ch.p * k2)} and ${ts(ch.q * k1)}, which still do not match.`],
            ['Multiply both equations by the same number', false, `Both ${V} terms get multiplied by the same number, so they stay different from each other.`],
            [`Multiply only the left side of equation 1 by ${k1}`, false, 'You must multiply every term on both sides, or the equation stops being true.']], K()) });
    }
    const pA = vc(A), pB = vc(B), op = pA * pB > 0 ? 'sub' : 'add';
    let comb, lab;
    if (op === 'add') { comb = { a: A.a + B.a, b: A.b + B.b, c: A.c + B.c }; lab = 'Add the two equations'; }
    else {
      const d1 = { a: A.a - B.a, b: A.b - B.b, c: A.c - B.c }, d2 = { a: B.a - A.a, b: B.b - A.b, c: B.c - A.c };
      if (rc(d1) >= -1e-9) { comb = d1; lab = 'Subtract equation 2 from equation 1'; } else { comb = d2; lab = 'Subtract equation 1 from equation 2'; }
    }
    const prefix = (k1 !== 1 || k2 !== 1) ? 'The new equations have matching terms. ' : '';
    const s2 = { q: `${prefix}We will eliminate ${V}. How do you combine the equations so the ${V} terms cancel?`, res: [stdStr(comb.a, comb.b, comb.c)], opts: place(
      [lab, true, op === 'add'
        ? `The ${V} terms are ${ts(pA)} and ${ts(pB)}, opposites. Equation 1 says one amount equals another, and so does equation 2. Adding equal amounts to equal amounts keeps them equal, and the ${V} terms cancel.`
        : `The ${V} terms are both ${ts(pA)}. Equation 1 says one amount equals another, and so does equation 2. Subtracting equal amounts from equal amounts keeps them equal, and the ${V} terms cancel.`],
      op === 'add'
        ? [['Subtract equation 2 from equation 1', false, `That gives ${ts(pA - pB)}, so ${V} does not cancel. Opposite terms cancel when you add them.`],
          ['Add only the left sides', false, 'Whatever you do to one side you must do to the other, or the equation stops being true.'],
          ['Multiply the two equations together', false, 'Multiplying equations does not cancel a variable. It makes new terms such as x times y.']]
        : [['Add the two equations', false, `That gives ${ts(pA + pB)}, so ${V} does not cancel. Equal terms cancel when you subtract them.`],
          ['Subtract only the left sides', false, 'Whatever you do to one side you must do to the other, or the equation stops being true.'],
          ['Multiply the two equations together', false, 'Multiplying equations does not cancel a variable. It makes new terms such as x times y.']], K()) };
    steps.push(s2);
    const r = rc(comb);
    if (z0(vc(comb)) && z0(r)) {
      s2.endKind = z0(comb.c) ? 'same' : 'none';
      s2.res.push(z0(comb.c) ? '0 = 0 is always true, whatever x and y are.' : `0 = ${nm(comb.c)} is never true, whatever x and y are.`);
      return steps;
    }
    const Rv = r9(comb.c / r);
    steps.push({ q: `One unknown is left: ${stdStr(comb.a, comb.b, comb.c)}. Which move finds ${R}?`, res: [`${R} = ${nm(comb.c)} ÷ ${par(r)} = ${nm(Rv)}`], [R === 'x' ? 'px' : 'py']: Rv, opts: place(
      [`Divide both sides by ${nm(r)}`, true, `${nm(r)}${R} means ${nm(r)} times ${R}. Dividing both sides by ${nm(r)} undoes the multiplication and leaves ${R} alone.`],
      [[`Subtract ${nm(r)} from both sides`, false, `${nm(r)}${R} is a product, so subtracting ${nm(r)} does not isolate ${R}.`],
        [`Multiply both sides by ${nm(r)}`, false, `That makes it ${nm(r * r)}${R}, which is further from ${R} alone. Undo a multiplication with division.`],
        [`Add ${nm(r)} to both sides`, false, `${nm(r)}${R} is a product, so adding ${nm(r)} does not isolate ${R}.`]], K()) });
    const cV1 = vc(E[0]), cR1 = rc(E[0]), cV2 = vc(E[1]), cR2 = rc(E[1]);
    const Vv = r9((E[0].c - cR1 * Rv) / cV1), Vv2 = r9((E[1].c - cR2 * Rv) / cV2), prod = cR1 * Rv;
    steps.push({ q: `Now find ${V}. What do you do with ${R} = ${nm(Rv)}?`, [V === 'x' ? 'px' : 'py']: Vv,
      res: [`Equation 1 with ${R} = ${nm(Rv)}: ${term(cV1, V, true)} ${prod < 0 ? MI : '+'} ${nm(Math.abs(prod))} = ${nm(E[0].c)}, so ${V} = ${nm(Vv)}.`, `Equation 2 gives ${V} = ${nm(Vv2)} too, because this is where the lines meet.`], opts: place(
        [`Replace ${R} with ${nm(Rv)} in equation 1 and solve for ${V}`, true, `Now equation 1 has only ${V} left. Equation 2 gives the same ${V}: that is what it means for the lines to meet.`],
        [[`Replace ${V} with ${nm(Rv)} in equation 1`, false, `${nm(Rv)} is the value of ${R}, not ${V}. Each number goes with its own letter.`],
          [`Say ${V} must equal ${R}`, false, 'x and y are different unknowns, and they can have different values.'],
          [`Add ${nm(Rv)} to both equations`, false, `Adding the same number to both equations does not tell you ${V}.`]], K()) });
    const xv = V === 'x' ? Vv : Rv, yv = V === 'x' ? Rv : Vv;
    steps.push(checkStep(id, u, xv, yv, K()));
    return steps;
  };

  const planGraph = (id, u) => {
    const sd = ST[id], E = eqsNow(id, u), sol = solveSys(E), steps = [], k0 = ORDER.indexOf(id) + 1;
    if (sol.kind !== 'one') {
      steps.push({ q: 'Look at the graph. What do the two lines do?', endKind: sol.kind, res: [sol.kind === 'none' ? 'The lines are parallel: they never meet.' : 'The two lines are one and the same line.'], opts: place(
        sol.kind === 'none' ? ['They never meet: they are parallel', true, 'Same slope, different starting height. They never cross, so no point is on both lines.'] : ['They are the same line', true, 'The two equations draw one line, so every point on it is on both.'],
        [[sol.kind === 'none' ? 'They are the same line' : 'They never meet: they are parallel', false, sol.kind === 'none' ? 'The lines are at different heights, so they are not the same line.' : 'They sit on top of each other, so they touch everywhere.'],
          ['They cross at exactly one point', false, 'Look again: a single crossing would have one shared point.'],
          ['They cross twice', false, 'Two different straight lines can cross at most once.']], k0) });
      return steps;
    }
    const { x, y } = sol, lab = `(${nm(x)}, ${nm(y)})`, used = new Set([lab]), wr = [];
    const add = (l, why) => { if (!used.has(l)) { used.add(l); wr.push([l, false, why]); } };
    add(`(${nm(y)}, ${nm(x)})`, 'The coordinates are swapped. The first number is x and the second is y.');
    if (!z0(E[0].b)) add(`(0, ${nm(r9(E[0].c / E[0].b))})`, 'That is where line 1 crosses the y-axis, not where the lines meet.');
    if (!z0(E[1].a)) add(`(${nm(r9(E[1].c / E[1].a))}, 0)`, 'That is where line 2 crosses the x-axis, not where the lines meet.');
    add(`(${nm(x + 1)}, ${nm(y)})`, 'Near the crossing, but one unit off. Check it in both equations.');
    add(`(${nm(x)}, ${nm(y + 1)})`, 'Near the crossing, but one unit off. Check it in both equations.');
    const off = !inView(sd.view, x, y);
    steps.push({ q: off ? 'The lines cross outside the picture, so a grid cannot show it exactly. Which point is the crossing?' : 'Look at the graph. Which point is on both lines?', px: x, py: y,
      res: [`The lines cross at ${lab}.`], opts: place([lab, true, 'It is where the two lines cross, so it is on both lines. Reading a picture can be a little off, so the next step checks it with numbers.'], wr.slice(0, 3), k0) });
    steps.push(checkStep(id, u, x, y, k0 + 2));
    return steps;
  };

  const makePlan = (id, u, meth) => (meth === 'graph' ? planGraph(id, u) : ST[id].form === 'iso' ? planIso(id, u) : planElim(id, u));

  /* ---------- the meaning questions ---------- */
  const buildIQ = (id, u) => {
    const sd = ST[id], E = eqsNow(id, u), sol = solveSys(E), kind = classify(sd, sol), qs = [];
    let n = 0; const K = () => (ORDER.indexOf(id) + 2 * (n++) + 2) % 4;
    if (kind === 'none') {
      qs.push({ q: 'The algebra ended with a false statement, and the lines are parallel. What does that mean in the story?', opts: place(
        [sd.none(u, E), true, 'The lines never meet, so no pair of numbers satisfies both equations at once.'],
        [['There is one solution, but it is hard to find.', false, 'Parallel lines have no point in common. There is nothing to find.'],
          ['There are two solutions.', false, 'Two straight lines meet once, never, or everywhere. Never two points.'],
          ['The two descriptions are really the same.', false, 'The same description would give the same line. These lines are different lines that never meet.']], K()) });
    } else if (kind === 'same') {
      qs.push({ q: 'The algebra ended with a true statement, and the lines lie on top of each other. What does that mean in the story?', opts: place(
        [sd.same(u, E), true, 'The two equations are two descriptions of one line, so every point on it satisfies both.'],
        [['There is no solution.', false, 'No solution would mean parallel lines. Here the lines touch everywhere.'],
          ['The only solution is x = 0 and y = 0.', false, 'A true statement like 0 = 0 does not mean the answer is zero. It means every point on the line works.'],
          ['There is exactly one solution.', false, 'The lines touch at every point, not at just one.']], K()) });
    } else if (kind === 'neg') {
      qs.push({ q: `The solution is x = ${show(sol.x)} and y = ${show(sol.y)}. Does it fit the story?`, opts: place(
        ['No. ' + negText(sd, sol), true, 'The equations are satisfied, but the story has more rules than the equations: a count or an amount here cannot be negative. A math solution is not always a story solution.'],
        [['Yes: both equations work, so it fits the story.', false, 'The equations work, but the story also needs sensible values. A negative amount is not possible here.'],
          ['Yes: just drop the minus sign.', false, 'Dropping the sign changes the answer, and the new numbers no longer satisfy the equations.'],
          ['No: the system has no solution.', false, 'It has one: the lines do cross. The crossing is at a place the story cannot use.']], K()) });
    } else if (kind === 'frac') {
      qs.push({ q: `The solution is x = ${show(sol.x)} and y = ${show(sol.y)}. Does it fit the story?`, opts: place(
        ['No. ' + fracText(sd, sol), true, 'The equations are satisfied, but the story needs whole numbers for counts. A fractional count means the model or the numbers do not match a real situation.'],
        [['Yes: the equations work, so round it to the nearest whole number.', false, 'Rounding changes the numbers, so at least one equation stops being true. A fraction here is a warning, not something to round away.'],
          ['Yes: fractions are fine for any quantity.', false, 'Fractions are fine for amounts such as pounds or hours. They are not fine for counting tickets, coins or shirts.'],
          ['No: x must be bigger than y.', false, 'Nothing in the story says one number is bigger. The problem is that a count must be whole.']], K()) });
    } else {
      const { x, y } = sol;
      const bad1 = (sd.sent(y, x) !== sd.sent(x, y)) ? [sd.sent(y, x), false, `The numbers are swapped. x is the ${sd.xl.replace(/ \(.*\)/, '')} and y is the ${sd.yl.replace(/ \(.*\)/, '')}.`] : [sd.sent(x + 1, y), false, 'Check the values: x and y come from the solution.'];
      qs.push({ q: `The solution is x = ${nm(x)} and y = ${nm(y)}. Which sentence says what it means, with units?`, opts: place(
        [sd.sent(x, y), true, 'It names what x and y count, with units, in the words of the story.'],
        [bad1, [`${nm(x)} and ${nm(y)}.`, false, 'A bare pair of numbers does not say what they count. Always include the units.'],
          [sd.mix(x, y), false, 'The units are mixed up. Each number must go with the quantity it measures.']], K()) });
      const fx = sd.cnt[0] || sd.cnt[1];
      qs.push({ q: 'Check the answer against the story. Does it fit?', opts: place(
        ['Yes: ' + sd.fit(u, x, y), true, 'You tested the numbers in the equations and in the story. Nothing is negative, and anything you count is a whole number.'],
        [['No: an answer must be a whole number.', false, 'Only counts of separate things (tickets, coins, shirts) must be whole. Quantities such as speeds, money and time can be decimals.'],
          ['No: x and y must be equal.', false, 'Nothing in the story says the two unknowns are equal.'],
          ['We cannot tell without drawing the graph again.', false, 'You already checked both equations. Now compare the numbers with the story: are they possible?']], K()) });
    }
    return qs;
  };

  /* ---------- practice problems (a fixed list) ---------- */
  const PROBS = [
    { name: 'Ticket sales', q: 'A play sold 50 tickets in all. Student tickets cost $4, adult tickets cost $7, and $260 came in. Let x be the number of student tickets and y the number of adult tickets. Which system fits?',
      ch: [['x + y = 50 and 7x + 4y = 260', 'The prices are swapped. Student tickets cost $4, so the 4 multiplies x, the student tickets.'],
        ['x + y = 50 and 4x + 7y = 260', 'The first equation counts tickets: 50 in all. The second counts dollars: $4 for each student ticket and $7 for each adult ticket, $260 in all.'],
        ['x + y = 260 and 4x + 7y = 50', 'The totals are swapped. 50 is a number of tickets and 260 is dollars. Each equation needs one kind of unit.'],
        ['x − y = 50 and 4x + 7y = 260', 'The 50 is all the tickets together, so the counts add. A difference would need the story to say how many more of one kind.']], ans: 1,
      eqs: [{ a: 1, b: 1, c: 50 }, { a: 4, b: 7, c: 260 }], xl: 'student tickets', yl: 'adult tickets', view: { x0: -20, x1: 80, y0: -20, y1: 80, sx: 20, sy: 20 },
      sol: 'Solving gives 30 student tickets and 20 adult tickets: 4 × 30 + 7 × 20 = 120 + 140 = 260.' },
    { name: 'Break-even', q: 'A bakery pays $150 to rent an oven. Each loaf costs $2 to bake and sells for $5. Let x be the number of loaves and y the dollars. Which system gives the cost line and the revenue line?',
      ch: [['y = 150x + 2 and y = 5x', 'The $2 is paid for each loaf, so it multiplies x. The $150 is paid once, so it is added at the end.'],
        ['y = 2x + 150 and y = 5x + 150', 'The $150 rental is a cost, paid once. Revenue starts at $0 before any loaf is sold, so it has no 150.'],
        ['y = 2x + 150 and y = 5x', 'Cost is $2 per loaf plus $150 once. Revenue is $5 per loaf and nothing else.'],
        ['y = 2x + 150 and y = 3x', '3 is the profit on a loaf (5 − 2). The cost line already counts the $2, so the revenue line must use the full price, $5.']], ans: 2,
      eqs: [{ a: -2, b: 1, c: 150 }, { a: -5, b: 1, c: 0 }], xl: 'loaves', yl: 'dollars', view: { x0: -20, x1: 80, y0: -100, y1: 400, sx: 20, sy: 100 },
      sol: 'Setting 2x + 150 = 5x gives x = 50 loaves, where cost and revenue are both $250.' },
    { name: 'Nickels and dimes', q: 'A jar has 25 coins, all nickels (5 cents) and dimes (10 cents), worth 175 cents in all. Let x be the number of nickels and y the number of dimes. Which system fits?',
      ch: [['x + y = 25 and 5x + 10y = 1.75', 'The units clash. 5 and 10 are cents, so the total must be in cents too: 175, not 1.75 dollars.'],
        ['x + y = 175 and 5x + 10y = 25', 'The totals are swapped. 25 is a number of coins and 175 is cents.'],
        ['x + y = 25 and 10x + 5y = 175', 'The values are swapped. A nickel is 5 cents, so the 5 goes with x, the nickels.'],
        ['x + y = 25 and 5x + 10y = 175', 'The first equation counts coins. The second counts cents: 5 cents for each nickel and 10 cents for each dime.']], ans: 3,
      eqs: [{ a: 1, b: 1, c: 25 }, { a: 5, b: 10, c: 175 }], xl: 'nickels', yl: 'dimes', view: { x0: -10, x1: 40, y0: -10, y1: 40, sx: 10, sy: 10 },
      sol: 'Solving gives 15 nickels and 10 dimes: 5 × 15 + 10 × 10 = 75 + 100 = 175 cents.' },
    { name: 'Rowing with a current', q: 'A kayaker paddles 12 km downstream in 2 hours and the same 12 km back upstream in 3 hours. Let x be the kayaker\'s speed in still water and y the current\'s speed, both in km/h. Which system fits?',
      ch: [['x + y = 6 and x − y = 4', 'Downstream the speeds add: 12 ÷ 2 = 6 km/h. Upstream the current takes speed away: 12 ÷ 3 = 4 km/h.'],
        ['x + y = 24 and x − y = 36', 'Multiplying distance by time gives a strange unit, not a speed. Speed is distance divided by time: 12 ÷ 2 = 6 and 12 ÷ 3 = 4.'],
        ['x + y = 6 and x + y = 4', 'Upstream the current works against the kayaker, so it is subtracted: x − y. Adding both times would make the same sum equal two different speeds.'],
        ['x + y = 2 and x − y = 3', 'Those are the times in hours. The equations need speeds, which are distance divided by time.']], ans: 0,
      eqs: [{ a: 1, b: 1, c: 6 }, { a: 1, b: -1, c: 4 }], xl: 'kayak speed (km/h)', yl: 'current (km/h)', view: { x0: -4, x1: 12, y0: -4, y1: 12, sx: 2, sy: 2 },
      sol: 'Adding the equations gives 2x = 10, so x = 5 km/h and y = 1 km/h.' },
    { name: 'Garden fence', q: 'A rectangular garden has a perimeter of 40 m. Its length is 4 m longer than its width. Let x be the length and y the width. Which system fits?',
      ch: [['x + y = 40 and x = y + 4', 'The perimeter goes all the way around: two lengths and two widths. 40 is the whole distance around, not just length plus width.'],
        ['2x + 2y = 40 and x = y + 4', 'Two lengths plus two widths make the perimeter. "4 m longer" means the length is the width plus 4.'],
        ['2x + 2y = 40 and y = x + 4', 'That says the width is 4 m longer. The story says the length is longer, so x = y + 4.'],
        ['2x + 2y = 40 and x = 4y', '"4 m longer" means add 4. Four times as long would be a multiplication, and it is a different story.']], ans: 1,
      eqs: [{ a: 2, b: 2, c: 40 }, { a: 1, b: -1, c: 4 }], xl: 'length (m)', yl: 'width (m)', view: { x0: -4, x1: 24, y0: -4, y1: 24, sx: 4, sy: 4 },
      sol: 'Solving gives a length of 12 m and a width of 8 m: 2 × 12 + 2 × 8 = 40, and 12 is 4 more than 8.' },
    { name: 'Phone plans (meaning)', q: 'Plan A costs y = 10x + 20 dollars after x months. Plan B costs y = 15x. The two lines cross at the point (4, 60). Which sentence says what that point means?',
      ch: [['After 60 months both plans cost $4.', 'The numbers are swapped. x is the months and y is the dollars, so (4, 60) is 4 months and $60.'],
        ['Plan A costs 4 months and plan B costs 60 dollars.', 'The units are mixed up. At the crossing, both plans have the same cost, and 4 is a number of months.'],
        ['After 4 months both plans have cost $60 in total.', 'x = 4 is the months and y = 60 is the total cost. Both lines pass through the point, so both plans cost the same there.'],
        ['The point is (4, 60).', 'That only repeats the numbers. A sentence needs the units: months and dollars.']], ans: 2,
      eqs: [{ a: -10, b: 1, c: 20 }, { a: -15, b: 1, c: 0 }], xl: 'months', yl: 'dollars', view: { x0: -2, x1: 10, y0: -40, y1: 200, sx: 2, sy: 40 }, say: true },
    { name: 'Snack mix (fractions)', q: 'Nuts cost $6 a pound and raisins cost $2 a pound. Let x be the pounds of nuts and y the pounds of raisins. For 12 pounds of mix costing $54, the system x + y = 12 and 6x + 2y = 54 gives x = 7.5 and y = 4.5. Does that answer make sense?',
      ch: [['No: an answer must be a whole number.', 'Only counts of separate things, like tickets, must be whole. Pounds can be any amount.'],
        ['Yes, but only if I round to 8 and 4.', 'Rounding breaks the equations: 6 × 8 + 2 × 4 = 56, not 54. The exact answer is fine.'],
        ['No: x should equal y.', 'Nothing in the story says the two amounts are equal.'],
        ['Yes: pounds can be fractions, so 7.5 lb of nuts and 4.5 lb of raisins is possible.', 'Check: 7.5 + 4.5 = 12 pounds and 6 × 7.5 + 2 × 4.5 = 45 + 9 = 54 dollars. A scoop can weigh half a pound.']], ans: 3,
      eqs: [{ a: 1, b: 1, c: 12 }, { a: 6, b: 2, c: 54 }], xl: 'nuts (lb)', yl: 'raisins (lb)', view: { x0: -4, x1: 16, y0: -4, y1: 16, sx: 4, sy: 4 }, say: true },
    { name: 'Break-even below zero', q: 'A shirt costs $5 to make and sells for $4. Mia pays $60 to set up. Cost is y = 5x + 60 and revenue is y = 4x, where x is the number of shirts. Setting 5x + 60 = 4x gives x = −60. What does that mean?',
      ch: [['She breaks even after 60 shirts.', 'Dropping the minus sign changes the answer. At 60 shirts the cost is $360 and the revenue is only $240.'],
        ['She makes money on every shirt.', 'Each shirt sells for $4 and costs $5 to make, so she loses a dollar on every shirt.'],
        ['The system has no solution.', 'The lines have different slopes, so they do cross. They cross at a place the story cannot use.'],
        ['The lines cross at a negative number of shirts, which is impossible. For every number of shirts that is 0 or more, the revenue is below the cost, so she never breaks even.', 'Negative shirts cannot be sold. For x = 0 or more, the revenue line stays below the cost line.']], ans: 3,
      eqs: [{ a: -5, b: 1, c: 60 }, { a: -4, b: 1, c: 0 }], xl: 'shirts', yl: 'dollars', view: { x0: -80, x1: 40, y0: -300, y1: 300, sx: 20, sy: 100 }, say: true },
    { name: 'Parallel plans', q: 'Plan A costs y = 15x + 40 dollars after x months. Plan B costs y = 15x + 25. After how many months do the two plans cost the same?',
      ch: [['After 1 month.', 'At 1 month plan A costs 55 and plan B costs 40. They are still $15 apart.'],
        ['After 15 months.', '15 is the monthly price, not a number of months. At 15 months the plans are still $15 apart.'],
        ['They are the same plan.', 'The plans start at different amounts, 40 and 25, so they are different plans.'],
        ['Never: the monthly price is the same, so the $15 gap at the start never changes.', 'Setting 15x + 40 = 15x + 25 gives 40 = 25, which is false. The lines are parallel.']], ans: 3,
      eqs: [{ a: -15, b: 1, c: 40 }, { a: -15, b: 1, c: 25 }], xl: 'months', yl: 'dollars', view: { x0: -2, x1: 8, y0: -40, y1: 160, sx: 2, sy: 40 }, say: false }
  ];

  const OPTSTYLE = 'justify-content:flex-start;text-align:left;border-radius:12px;padding:9px 14px;line-height:1.35;height:auto';
  const PHR = 'display:inline;font:inherit;color:inherit;background:color-mix(in srgb,var(--yellow) 30%,transparent);border:1px solid var(--line-strong);border-radius:6px;padding:1px 6px;margin:1px 0;cursor:pointer';
  const PHS = 'font-weight:600;border-bottom:2px solid var(--line-strong)';
  const COL = { stack: 'display:flex;flex-direction:column;gap:12px', opts: 'display:flex;flex-direction:column;gap:8px' };

  register({
    id: 'modeling-with-systems', level: 'school',
    title: 'Modeling with systems',
    blurb: 'Turn a story into two equations, see where the lines cross, solve it, and decide what the answer means.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 3; p.cy = 3; p.span = 4.4;
      p.grid(1);
      p.path([[-1, 1], [7, 5]], { stroke: pal.blue, width: 2.8 });
      p.path([[0, -.5], [6, 7]], { stroke: pal.red, width: 2.8 });
      p.dot(2.5, 2.25, 6, pal.violet, pal.stage, 2);
    },
    hook: String.raw`Gym A charges $45 to join and $20 a month. Gym B has no joining fee but charges $30 a month. Which gym should you pick, and when does your answer change?`,
    steps: [
      { title: 'Guess before you graph',
        text: String.raw`<p>Gym A costs $45 to join and $20 a month. Gym B has no joining fee but costs $30 a month. Gym B costs more every month.</p><p>Make your prediction in the panel: will Gym B ever be the cheaper gym in total? Then the graph shows what happens, and you can move the prices.</p>`,
        set: { mode: 'predict', story: 'gym', stage: 0 } },
      { title: 'Name the unknowns, then build',
        text: String.raw`<p>A story is not an equation yet. First decide what you do not know, and give it a letter. Then build each equation from the story: click the phrase that gives each number.</p><p>Try it on the ticket story in the panel. Pick \(x\) and \(y\) first.</p>`,
        set: { mode: 'story', story: 'tickets', stage: 0 } },
      { title: 'See the lines and move the prices',
        text: String.raw`<p>Mia sells T-shirts. The blue line is her cost, \(y=6x+120\). The red line is her revenue, \(y=10x\). They cross at the break-even point: 30 shirts and $300.</p><p>Move the price sliders. Lower the selling price below the cost of making a shirt and watch where the lines cross.</p>`,
        set: { mode: 'story', story: 'profit', stage: 2, reach: 3 } },
      { title: 'Choose a method, solve, decide',
        text: String.raw`<p>Back to the tickets: \(x+y=40\) and \(8x+5y=290\). Choose a solving method and give a reason. Then make each move yourself while the lesson does the arithmetic.</p><p>Last, say what the answer means with its units, and check it against the story.</p>`,
        set: { mode: 'story', story: 'tickets', stage: 3, reach: 4 } }
    ],
    formal: String.raw`
      <p>A <em>model</em> turns a story into mathematics. For two unknowns we write two equations and ask for the point that makes both true at once. That point is where the two lines cross.</p>
      <h3>From a story to a system</h3>
      <p><b>1. Name the unknowns.</b> Choose the two quantities the story does not tell you, and give each a letter with its unit: \(x\) is the number of adult tickets, \(y\) is the number of child tickets. A number the story gives you, such as a price or a total, is not an unknown.</p>
      <p><b>2. Build each equation from one fact in the story.</b> Every term has a meaning and a unit, and every term in one equation has the same unit. Tickets: \(x+y=40\) counts people. \(8x+5y=290\) counts dollars, because each term is dollars per ticket times tickets. Mixing the two kinds of units in one equation is a sign of a mistake.</p>
      <p><b>3. Choose a method and solve.</b> <b>4. Interpret and check.</b></p>
      <h3>Why each method is allowed</h3>
      <p><em>Substitution (setting equal).</em> If \(y=m_1x+k_1\) and \(y=m_2x+k_2\), then at a solution both right sides are the same number \(y\), so \(m_1x+k_1=m_2x+k_2\). This is one equation in one unknown. For the break-even story, \(6x+120=10x\) gives \(120=4x\), so \(x=30\), and \(y=10\times 30=300\).</p>
      <p><em>Elimination.</em> If \(A=B\) and \(C=D\), then \(A+C=B+D\), and \(A-C=B-D\). Equal amounts added to equal amounts stay equal. So any point that satisfies both equations also satisfies their sum or difference. Multiplying both sides of an equation by the same number keeps it true as well, so we can first make a variable's terms match. Then adding or subtracting removes it. For the tickets:
      \[ \begin{aligned} 5x+5y&=200 &&\text{(first equation times 5)}\\ 8x+5y&=290 &&\text{(second equation)}\\ 3x&=90 &&\text{(subtract)} \end{aligned} \]
      so \(x=30\), then \(30+y=40\) gives \(y=10\). Check: \(8(30)+5(10)=240+50=290\).</p>
      <p><em>Graph.</em> Each equation is a line, and the solution is the shared point. A grid reading can be a little off, so we check it in both equations.</p>
      <h3>Rates: speeds with and against a current</h3>
      <p>Speed is distance divided by time. A rower who goes \(15\) km in \(2\) hours with the current has speed \(7.5\) km/h. With the current the speeds add, \(x+y=7.5\). Against it they subtract, \(x-y=5\), because the same \(15\) km took \(3\) hours. Adding gives \(2x=12.5\), so \(x=6.25\) km/h and \(y=1.25\) km/h. A solution does not have to be a whole number.</p>
      <h3>Reading the answer in the story</h3>
      <p>Two lines can cross once, never, or everywhere. <b>Never</b> (parallel): the plans charge the same each month but start at different amounts, so they never cost the same. Algebra shows it as a false statement such as \(40=25\). <b>Everywhere</b> (same line): two descriptions of one plan. Algebra shows it as a true statement such as \(0=0\).</p>
      <p>A solution of the equations is only a solution of the story if it makes sense there. A count of tickets, coins or shirts must be a whole number. A solution such as \(x=32.5\) tickets, or a crossing at \(x=-20\) shirts, means that the model or the numbers do not fit a real situation. Speeds, money and time can be fractions. Always write the answer as a sentence with units, and test it in both original equations.</p>`,
    check: [
      { q: 'Two equations modeling a ticket sale give the solution x = 12.5 adult tickets and y = 7.5 child tickets. What should you conclude?',
        choices: ['The sale was exactly 12.5 adult tickets and 7.5 child tickets.', 'Round to 13 adult and 8 child tickets, and the answer is fine.', 'The numbers or the equations do not fit a real ticket sale, because tickets are counted in whole numbers. Recheck them.', 'There is no solution, because the lines are parallel.'], answer: 2,
        why: 'The two lines do cross, at (12.5, 7.5), so the algebra worked. But you cannot sell half a ticket, so this crossing is not a possible sale. Rounding would break the equations. That means the numbers in the story or the equations need checking. Parallel lines have no crossing at all, which is different.',
        hint: 'Can a theater sell half a ticket? Think about which quantities must be whole numbers.' },
      { q: 'Gym A charges a $40 joining fee and $15 a month, so its total is y = 15x + 40. Gym B has no joining fee and charges $25 a month, so its total is y = 25x. After how many months do the two gyms cost the same, and what is the total cost then?',
        choices: ['4 months, $100', '1 month, $25', '4 months, $60', '2.67 months, $67'], answer: 0,
        why: String.raw`Set the totals equal: \(15x+40=25x\). Subtract \(15x\) from both sides: \(40=10x\), so \(x=4\). Then \(y=25\times 4=100\). Check in Gym A: \(15\times 4+40=100\). One month comes from dividing 40 by the sum of the rates, 15 + 25. 4 months and $60 forgets the $40 joining fee. 2.67 months comes from dividing 40 by 15, which ignores Gym B's monthly cost.`,
        hint: 'Set 15x + 40 equal to 25x. Get the x terms on one side, then divide.' },
      { q: 'A boat goes 24 km downstream in 3 hours and the same 24 km back upstream in 4 hours. Let x be the boat\'s speed in still water and y the current\'s speed, both in km/h. A student writes: Step 1: x + y = 24 × 3 = 72. Step 2: x − y = 24 × 4 = 96. Which statement is true?',
        choices: ['Step 2 should be x + y, because the current always adds speed.', 'Nothing is wrong: the boat goes 72 km/h downstream.', 'The unknowns should be swapped: x is the current and y is the boat.', 'Both steps are wrong: speed is distance divided by time, so x + y = 24 ÷ 3 = 8 and x − y = 24 ÷ 4 = 6.'], answer: 3,
        why: String.raw`A speed is distance divided by time, so downstream \(x+y=24\div 3=8\) km/h and upstream \(x-y=24\div 4=6\) km/h. Multiplying kilometers by hours gives a strange unit and a speed of 72 km/h is not believable for a rowing boat. The signs are right: the current helps downstream (plus) and hurts upstream (minus). Adding the equations gives \(2x=14\), so \(x=7\) km/h and \(y=1\) km/h.`,
        hint: 'What are the units of 24 × 3? What are the units of a speed?' }
    ],
    links: { prereq: ['solving-systems-by-elimination'], related: ['systems-of-equations', 'solving-systems-by-substitution', 'forms-of-a-linear-equation', 'scatter-plots-and-lines-of-fit', 'exponential-growth', 'solving-systems-with-matrices'] },

    mount({ stage, controls: C }) {
      const panel = stage.nextElementSibling;
      const Pl = new Plane(stage, { span: 6 });
      let cancel = () => {}, uid = 0;
      const st = { mode: 'predict', story: 'tickets', stage: 0, rev: 0 };
      const fresh = id => ({ u: ST[id].par.map(q => q.v), reach: 1, stage: 0, sx: -1, sy: -1, unkOk: false, ufb: '', fill: [[], []], eq: 0, pi: 0, phOk: false, wrong: {}, bfb: '', bdone: false,
        meth: null, reason: null, rw: {}, mfb: '', mok: false, plan: null, ci: 0, log: [], cfb: '', cdone: false, cend: null, px: null, py: null, cw: {}, iq: 0, ifb: '', idone: false, iw: {}, iqs: null });
      const SS = {}; ORDER.forEach(id => { SS[id] = fresh(id); });
      let pred = -1, predFb = '';
      const cur = () => SS[st.story], sdn = () => ST[st.story];
      const nSlots = sd => (sd.form === 'std' ? 3 : 2);
      const eqBuilt = (S, sd, i) => S.fill[i].filter(Boolean).length >= nSlots(sd);
      const resetInterp = S => { S.iq = 0; S.ifb = ''; S.idone = false; S.iw = {}; S.iqs = null; };
      const resetSolve = S => { S.meth = null; S.reason = null; S.rw = {}; S.mfb = ''; S.mok = false; S.plan = null; S.ci = 0; S.log = []; S.cfb = ''; S.cdone = false; S.cend = null; S.px = null; S.py = null; S.cw = {}; S.reach = Math.min(S.reach, 4); resetInterp(S); };

      /* ================= practice state ================= */
      let prIdx = 0, prSolved = false, prTried = false, prFirst = 0, prDone = 0, prFin = false, prWrong = {};

      /* ================= the picture ================= */
      const TX = (c, s, x, y, o) => {
        c.font = `${o.w || 500} ${o.size}px "Hanken Grotesk","Helvetica Neue",Arial,sans-serif`; c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'middle';
        if (o.halo !== false) { c.lineWidth = 4; c.strokeStyle = o.bg; c.lineJoin = 'round'; c.strokeText(s, x, y); }
        c.fillStyle = o.col; c.fillText(s, x, y);
      };
      const drawGraph = (p, o) => {
        const c = p.ctx, pal = p.pal, W = p.w, H = p.h, v = o.view, fs = clamp(W / 28, 12, 16), lh = fs * 1.5, bg = pal.stage;
        const nb = o.banner.length, Tp = nb ? 16 + nb * lh : 12, Lf = fs * 5.1, Rt = 14, Bt = H - fs * 3.3, pw = W - Lf - Rt, ph = Bt - Tp;
        const gx = x => Lf + (x - v.x0) / (v.x1 - v.x0) * pw, gy = y => Tp + (1 - (y - v.y0) / (v.y1 - v.y0)) * ph;
        const t = (s, x, y, oo) => TX(c, s, x, y, Object.assign({ size: fs, col: pal.text, bg }, oo));
        /* banner */
        o.banner.forEach((b, i) => t(b.t, 30, 8 + lh * (i + .5), { col: b.col || pal.text, w: 600 }));
        /* not-possible strips */
        c.fillStyle = alpha(pal.muted, .16);
        if (v.x0 < 0) c.fillRect(Lf, Tp, gx(0) - Lf, ph);
        if (v.y0 < 0) c.fillRect(Lf, gy(0), pw, Bt - gy(0));
        /* grid and ticks */
        c.lineWidth = 1; c.strokeStyle = pal.grid; c.beginPath();
        for (let x = Math.ceil(v.x0 / v.sx) * v.sx; x <= v.x1 + 1e-9; x += v.sx) { c.moveTo(gx(x), Tp); c.lineTo(gx(x), Bt); }
        for (let y = Math.ceil(v.y0 / v.sy) * v.sy; y <= v.y1 + 1e-9; y += v.sy) { c.moveTo(Lf, gy(y)); c.lineTo(Lf + pw, gy(y)); }
        c.stroke();
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.8; c.beginPath(); c.moveTo(gx(0), Tp); c.lineTo(gx(0), Bt); c.moveTo(Lf, gy(0)); c.lineTo(Lf + pw, gy(0)); c.stroke();
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 1; c.strokeRect(Lf, Tp, pw, ph);
        const xs = pw / ((v.x1 - v.x0) / v.sx) < fs * 2.6 ? 2 : 1;
        for (let x = Math.ceil(v.x0 / v.sx) * v.sx, i = 0; x <= v.x1 + 1e-9; x += v.sx, i++) if (i % xs === 0) t(nm(x), gx(x), Bt + fs * .95, { align: 'center', col: pal.muted, halo: false, size: fs * .92 });
        for (let y = Math.ceil(v.y0 / v.sy) * v.sy; y <= v.y1 + 1e-9; y += v.sy) t(nm(y), Lf - 6, gy(y), { align: 'right', col: pal.muted, halo: false, size: fs * .92 });
        t(o.xt, Lf + pw / 2, H - fs * .7, { align: 'center', col: pal.text, halo: false });
        c.save(); c.translate(fs * .85, Tp + ph / 2); c.rotate(-Math.PI / 2); TX(c, o.yt, 0, 0, { size: fs, col: pal.text, bg, align: 'center', halo: false }); c.restore();
        if (o.shade) {
          if (v.x0 < 0 && gx(0) - Lf > fs * 1.3) { c.save(); c.translate((Lf + gx(0)) / 2, Tp + ph / 2); c.rotate(-Math.PI / 2); TX(c, 'negative: not possible', 0, 0, { size: fs * .9, col: pal.muted, bg, align: 'center', halo: false }); c.restore(); }
          if (v.y0 < 0 && Bt - gy(0) > fs * 1.3) t('negative: not possible', Lf + pw / 2, (gy(0) + Bt) / 2, { size: fs * .9, col: pal.muted, align: 'center', halo: false });
        }
        /* lines */
        c.save(); c.beginPath(); c.rect(Lf, Tp, pw, ph); c.clip();
        const xe = v.x0 + (v.x1 - v.x0) * (o.rev === undefined ? 1 : o.rev);
        o.eqs.forEach((e, i) => {
          if (!e.on || Math.abs(e.b) < 1e-9) return;
          const col = i ? pal.red : pal.blue, ya = (e.c - e.a * v.x0) / e.b, yb = (e.c - e.a * xe) / e.b;
          c.strokeStyle = col; c.lineWidth = 3.6; c.lineCap = 'round'; c.setLineDash(o.same && i ? [12, 10] : []);
          c.beginPath(); c.moveTo(gx(v.x0), gy(ya)); c.lineTo(gx(xe), gy(yb)); c.stroke(); c.setLineDash([]);
        });
        (o.guides || []).forEach(g => {
          c.strokeStyle = pal.violet; c.lineWidth = 2; c.setLineDash([7, 6]); c.beginPath();
          if (g.axis === 'x') { c.moveTo(gx(g.v), Tp); c.lineTo(gx(g.v), Bt); } else { c.moveTo(Lf, gy(g.v)); c.lineTo(Lf + pw, gy(g.v)); }
          c.stroke(); c.setLineDash([]);
        });
        c.restore();
        (o.guides || []).forEach(g => {
          if (g.axis === 'x') { if (g.v >= v.x0 && g.v <= v.x1) t(`x = ${nm(g.v)}`, clamp(gx(g.v), Lf + 40, Lf + pw - 40), Tp + ph - fs * 1.1, { col: pal.violet, align: 'center' }); }
          else if (g.v >= v.y0 && g.v <= v.y1) t(`y = ${nm(g.v)}`, Lf + 8, clamp(gy(g.v) - fs * .95, Tp + fs, Bt - fs), { col: pal.violet });
        });
        /* names on the lines */
        o.eqs.forEach((e, i) => {
          if (!e.on || !e.name || Math.abs(e.b) < 1e-9) return;
          for (const f of [.9, .8, .7, .6, .45, .3, .2, .1]) {
            const x = v.x0 + (xe - v.x0) * f, y = (e.c - e.a * x) / e.b;
            if (!(y > v.y0 + (v.y1 - v.y0) * .08 && y < v.y1 - (v.y1 - v.y0) * .08)) continue;
            if (o.sol && o.sol.kind === 'one' && Math.hypot(gx(x) - gx(o.sol.x), gy(y) - gy(o.sol.y)) < fs * 6) continue;
            t(e.name, gx(x), gy(y) + (i ? fs * 1.25 : -fs * 1.1), { col: i ? pal.red : pal.blue, align: 'center', w: 600 }); break;
          }
        });
        /* crossing */
        const s = o.sol;
        if (s && s.kind === 'one' && o.dot) {
          if (inView(v, s.x, s.y)) {
            c.save(); c.beginPath(); c.arc(gx(s.x), gy(s.y), 8, 0, 6.2832); c.fillStyle = pal.violet; c.fill(); c.lineWidth = 2.5; c.strokeStyle = bg; c.stroke(); c.restore();
            if (o.dot === 'label') {
              const lbl = `${terminating(s.x) && terminating(s.y) ? '' : '≈ '}(${nmd(s.x)}, ${nmd(s.y)})`, px = gx(s.x), py = gy(s.y), w = lbl.length * fs * .55;
              const dist = (e, qx, qy) => { if (!e.on || Math.abs(e.b) < 1e-9) return 1e9; const ax = gx(v.x0), ay = gy((e.c - e.a * v.x0) / e.b), bx = gx(v.x1), by = gy((e.c - e.a * v.x1) / e.b), dx = bx - ax, dy = by - ay; return Math.abs(dy * (qx - ax) - dx * (qy - ay)) / Math.hypot(dx, dy); };
              let best = null, bs = -1;
              for (const [dx, dy, al] of [[12, -1.15, 'left'], [-12, -1.15, 'right'], [12, 1.3, 'left'], [-12, 1.3, 'right'], [0, -1.7, 'center'], [0, 1.8, 'center']]) {
                const cx = px + dx + (al === 'left' ? w / 2 : al === 'right' ? -w / 2 : 0), cy = py + dy * fs;
                if (cx - w / 2 < Lf + 2 || cx + w / 2 > Lf + pw - 2 || cy < Tp + fs * .6 || cy > Bt - fs * .6) continue;
                const sc = Math.min(...o.eqs.map(e => dist(e, cx, cy)), ...[-w / 2, w / 2].map(ox => Math.min(...o.eqs.map(e => dist(e, cx + ox, cy)))));
                if (sc > bs) { bs = sc; best = [dx, dy, al]; }
              }
              best = best || [12, -1.15, 'left'];
              t(lbl, px + best[0], py + best[1] * fs, { col: pal.violet, align: best[2], w: 700 });
            }
          } else if (o.dot === 'label') t(`Crossing (${nmd(s.x)}, ${nmd(s.y)}) is off the graph`, Lf + 8, Tp + fs * 1.2, { col: pal.violet, w: 700 });
        }
        if (s && o.dot === 'label' && s.kind === 'none') t('Parallel: the lines never cross', Lf + 8, Tp + fs * 1.2, { col: pal.violet, w: 700 });
        if (s && o.dot === 'label' && s.kind === 'same') t('Same line: every point is a solution', Lf + 8, Tp + fs * 1.2, { col: pal.violet, w: 700 });
      };

      const bannerFor = (S, sd) => {
        const pal = Pl.pal, out = [], u = S.u;
        const eqLine = i => `${i + 1}:  ${eqStr(sd, sd.eqs[i], u)}`;
        if (st.mode === 'predict') {
          if (pred < 0) return [{ t: 'Make your prediction in the panel', col: pal.muted }];
          return [{ t: 'A:  ' + eqStr(sd, sd.eqs[0], u), col: pal.blue }, { t: 'B:  ' + eqStr(sd, sd.eqs[1], u), col: pal.red }];
        }
        if (S.stage === 0) return [{ t: S.unkOk ? 'Unknowns named. Next: build the equations' : 'Step 1: what do we not know?', col: pal.muted }];
        const cols = [pal.blue, pal.red];
        for (let i = 0; i < 2; i++) {
          if (S.stage >= 2 || eqBuilt(S, sd, i)) out.push({ t: eqLine(i), col: cols[i] });
          else if (S.stage === 1 && i === S.eq) out.push({ t: `${i + 1}:  ${partStr(sd, sd.eqs[i].v(u), S.fill[i])}`, col: cols[i] });
        }
        return out;
      };

      const drawPractice = p => {
        const pal = p.pal, pr = PROBS[prIdx], show = pr.say || prSolved;
        drawGraph(p, { view: pr.view, banner: [{ t: pr.name, col: pal.muted }], xt: pr.xl, yt: pr.yl, shade: true, rev: 1, dot: show ? 'label' : null,
          sol: solveSys(pr.eqs), same: false, eqs: pr.eqs.map((e, i) => Object.assign({ on: show }, e)) });
      };
      Pl.onDraw = (c, p) => {
        if (st.mode === 'practice') { drawPractice(p); return; }
        const S = cur(), sd = sdn(), u = S.u, E = eqsNow(st.story, u), sol = solveSys(E);
        const named = st.mode === 'predict' || S.unkOk || S.reach >= 2;
        const on = i => (st.mode === 'predict' ? pred >= 0 : S.stage >= 2 || eqBuilt(S, sd, i));
        let dot = null;
        if (st.mode === 'predict') dot = pred >= 0 && st.rev > .999 ? 'label' : null;
        else if (S.stage === 3 && !S.cdone) dot = S.meth === 'graph' && S.mok ? 'plain' : null;
        else if (S.stage >= 2) dot = 'label';
        const guides = [];
        if (st.mode === 'story' && S.stage === 3 && !(S.cdone && S.cend === 'one')) { if (S.px != null) guides.push({ axis: 'x', v: S.px }); if (S.py != null) guides.push({ axis: 'y', v: S.py }); }
        drawGraph(p, { view: sd.view, banner: bannerFor(S, sd), xt: named ? `x: ${sd.xl}` : 'x', yt: named ? `y: ${sd.yl}` : 'y', shade: st.mode === 'predict' ? pred >= 0 : S.stage >= 2,
          rev: st.mode === 'predict' ? st.rev : 1, dot, sol, same: sol.kind === 'same', guides,
          eqs: E.map((e, i) => Object.assign({ on: on(i), name: sd.lab[i] }, e)) });
      };

      /* ================= panel pieces ================= */
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const dyn = () => { const e = h('div', { style: COL.stack }); panel.append(e); return e; };
      const mkBtn = (label, onClick, primary, style) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', style: style || '', onclick: onClick }, label);
      const fbBox = () => h('div', { class: 'ctl readout', 'aria-live': 'polite' });
      const optList = (opts, wrong, pick) => h('div', { style: COL.opts }, opts.map((o, i) => { const b = mkBtn(o[0], () => pick(i), false, OPTSTYLE); if (wrong[i]) b.disabled = true; return b; }));
      const para = (html, style) => h('p', { html, style: style || 'margin:0;font-size:.95rem;line-height:1.5' });
      const ttl = t => h('p', { class: 'ctl-title' }, t);

      let storySel, stageBtns, storyBox, predBox, stageBox, graphBox, pracWrap, pracStart;
      let sliderSets = {};

      grp('top', () => {
        C.title('Story');
        storySel = C.select({ label: 'Choose a story', options: ORDER.map(id => ({ value: id, label: ST[id].name })), value: st.story, onChange: v => { cancel(); st.story = v; cur().stage = Math.min(cur().stage, cur().reach - 1); renderAll(); } });
        stageBtns = C.buttons(['1 Unknowns', '2 Equations', '3 Graph', '4 Solve', '5 Meaning'].map((l, i) => ({ label: l, onClick: () => { const S = cur(); if (i < S.reach) { S.stage = i; renderAll(); } } })));
      });
      stageBtns.forEach(b => { b.style.cssText = 'padding:6px 11px;min-height:34px;font-size:.84rem'; });
      storyBox = dyn();
      predBox = dyn();
      stageBox = dyn();
      ORDER.forEach(id => {
        grp('sl_' + id, () => {
          C.title('Change the numbers');
          sliderSets[id] = ST[id].par.map((q, i) => C.slider({ label: q.l, min: q.min, max: q.max, step: q.step, value: q.v, format: q.f, onInput: val => { const S = SS[id]; S.u[i] = val; resetSolve(S); renderAll(); } }));
        });
      });
      graphBox = dyn();
      C.title('Practice');
      C.hint('Nine short problems, each a different kind of story. Nothing here is saved or scored.');
      pracStart = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); if (st.mode === 'practice') { st.mode = 'story'; renderAll(); } else { st.mode = 'practice'; loadProb(); renderAll(); } } }])[0];
      pracWrap = dyn();

      /* ---------- stage 1: unknowns ---------- */
      const renderUnk = () => {
        const S = cur(), sd = sdn();
        const mkSel = (label, key) => {
          const id = 'ms' + (++uid), sel = h('select', { id }, h('option', { value: -1 }, 'Choose…'), ...sd.unk.opts.map((o, i) => h('option', { value: i }, o.t)));
          sel.value = S[key]; sel.disabled = S.unkOk;
          sel.addEventListener('change', () => { S[key] = +sel.value; S.ufb = ''; fb.innerHTML = ''; });
          return h('div', { class: 'ctl select' }, h('label', { for: id }, label), sel);
        };
        const fb = fbBox(); fb.innerHTML = S.ufb;
        const els = [ttl('Step 1: name the unknowns'),
          para('Read the story. The numbers it gives you are known. Pick the two quantities it asks you to find. Each one gets a letter.'),
          mkSel('Let x be…', 'sx'), mkSel('Let y be…', 'sy')];
        if (!S.unkOk) els.push(h('div', { class: 'ctl buttons' }, mkBtn('Check my unknowns', () => {
          const U = sd.unk, lines = [];
          if (S.sx < 0 || S.sy < 0) { S.ufb = 'Choose something for both x and y.'; renderStageOnly(); return; }
          const one = (sel, want, other, nmv) => {
            const o = U.opts[sel];
            if (sel === want) lines.push(good(`${nmv} is right.`) + ' ' + o.why);
            else if (sel === other) lines.push(bad(`${nmv}:`) + ` That is one of the two unknowns, but it is the one we call ${nmv === 'x' ? 'y' : 'x'}. Swap them so the graph axes match.`);
            else lines.push(bad(`${nmv}:`) + ' ' + o.why);
          };
          one(S.sx, U.x, U.y, 'x'); one(S.sy, U.y, U.x, 'y');
          if (S.sx === U.x && S.sy === U.y) { S.unkOk = true; S.reach = Math.max(S.reach, 2); lines.push('The graph axes now carry these quantities and their units.'); }
          S.ufb = lines.join('<br>'); renderAll();
        }, true)));
        els.push(fb);
        if (S.unkOk) els.push(h('div', { class: 'ctl buttons' }, mkBtn('Next: build the equations', () => { S.stage = 1; renderAll(); }, true)));
        stageBox.replaceChildren(...els);
      };

      /* ---------- stage 2: build the equations ---------- */
      const slotName = (sd, i) => (sd.form === 'iso' ? ['in front of x (the rate)', 'at the end (the amount paid once)'][i] : ['in front of x', 'in front of y', 'on the right side'][i]);
      const finishPrompt = (S, sd, pr, msg) => {
        pr.fills.forEach(i => { S.fill[S.eq][i] = true; });
        S.pi++; S.phOk = false; S.wrong = {};
        const eq = sd.eqs[S.eq];
        if (S.pi >= eq.pr.length) {
          msg += `<br>${good(`Equation ${S.eq + 1} is built:`)} ${eqStr(sd, eq, S.u)}.<br>${kk('Units check')} ${eq.units}. Every term has the same unit.`;
          S.eq++; S.pi = 0;
          if (S.eq >= sd.eqs.length) { S.bdone = true; S.reach = Math.max(S.reach, 3); msg += '<br>Both equations are built, and both lines are on the graph.'; }
        }
        S.bfb = msg; renderAll();
      };
      const clickPh = id => {
        const S = cur(), sd = sdn(); if (st.mode !== 'story' || S.stage !== 1 || S.bdone) return;
        const pr = sd.eqs[S.eq].pr[S.pi], ph = sd.ph[id];
        if (!pr.ph) { S.bfb = bad('Not yet.') + ' This term has no number in the story. Choose one of the options below.'; renderAll(); return; }
        if (S.phOk) return;
        if (id === pr.ph) {
          if (pr.opts) { S.phOk = true; S.bfb = good('Yes.') + ' That is the right part of the story. ' + (pr.ask2 || ''); renderAll(); }
          else finishPrompt(S, sd, pr, good('Yes.') + ` That phrase gives ${ph.what}: ${nm(ph.v(S.u))} goes ${slotName(sd, pr.fills[0])}.`);
        } else { S.bfb = bad('Not that phrase.') + ` It gives ${ph.what}. This term needs ${pr.need}.`; renderAll(); }
      };
      const pickBuild = i => {
        const S = cur(), sd = sdn(), pr = sd.eqs[S.eq].pr[S.pi], opts = pr.opts(S.u), o = opts[i];
        if (o[1]) finishPrompt(S, sd, pr, good('Yes.') + ' ' + o[2]);
        else { S.wrong[i] = true; S.bfb = bad('Not that one.') + ' ' + o[2]; renderStageOnly(); }
      };
      const renderBld = () => {
        const S = cur(), sd = sdn(), u = S.u, els = [ttl('Step 2: build the equations')];
        const rows = [];
        sd.eqs.forEach((e, i) => {
          if (eqBuilt(S, sd, i)) rows.push(`${kk(`Equation ${i + 1} (${e.name})`)} ${eqStr(sd, e, u)}`);
          else if (i === S.eq) rows.push(`${kk(`Equation ${i + 1} (${e.name})`)} ${partStr(sd, e.v(u), S.fill[i])}`);
        });
        const eqBox = fbBox(); eqBox.innerHTML = rows.join('<br>'); els.push(eqBox);
        if (S.bdone) { els.push(para('Both equations are built. Each term has a meaning and a unit, and every term in an equation has the same unit.')); els.push(h('div', { class: 'ctl buttons' }, mkBtn('Next: see the graph', () => { S.stage = 2; renderAll(); }, true))); }
        else {
          const pr = sd.eqs[S.eq].pr[S.pi];
          if (pr.ph && !S.phOk) els.push(para(pr.ask), para('Click one of the highlighted phrases in the story above.', 'margin:0;font-size:.86rem;color:var(--muted)'));
          else { els.push(para(pr.ph ? pr.ask2 : pr.ask)); els.push(optList(pr.opts(u), S.wrong, pickBuild)); }
        }
        const fb = fbBox(); fb.innerHTML = S.bfb; els.push(fb);
        stageBox.replaceChildren(...els);
      };

      /* ---------- stage 4: choose a method and solve ---------- */
      const METH = [['sub', 'Substitution'], ['elim', 'Elimination'], ['graph', 'Graph']];
      const REASONS = ['One equation already says what y equals, so I can swap that in.', 'The x or y terms match or can be made to match, so adding or subtracting the equations cancels one.', 'I want to see the picture and read where the lines cross.', 'The numbers are small.'];
      const methodNote = (sd, m) => {
        if (m === 'graph') return 'The graph shows the picture. You will pick the crossing from it, then check it in both equations, because a reading from a grid can be a little off.';
        if (m === sd.best) return sd.best === 'sub' ? 'Both equations already have y alone, so setting the right sides equal is the shortest path.' : 'Both equations are in the form ax + by = c, so adding or subtracting the equations can cancel a variable.';
        return sd.best === 'sub' ? 'Elimination works here too, but both equations already have y alone, so setting the right sides equal (substitution) is shorter. The lesson uses that path.'
          : 'Substitution works here too, but neither equation has a variable alone, so you would have to rearrange first. Elimination is shorter, so the lesson uses it.';
      };
      const pickReason = r => {
        const S = cur(), sd = sdn(), fit = { sub: 0, elim: 1, graph: 2 }[S.meth];
        if (r === fit) { S.reason = r; S.mok = true; S.mfb = good('Yes, that reason fits.') + ' ' + methodNote(sd, S.meth); S.plan = makePlan(st.story, S.u, S.meth); S.ci = 0; S.log = []; S.cfb = ''; S.cw = {}; }
        else { S.rw[r] = true; S.mfb = bad('That reason belongs to a different idea.') + ' ' + (r === 3 ? 'Small numbers do not choose a method. Look at how the equations are written, or whether you want a picture.' : `That reason fits ${['substitution', 'elimination', 'a graph'][r]}. You picked ${METH.find(m => m[0] === S.meth)[1].toLowerCase()}. Choose the reason that matches your method.`); }
        renderAll();
      };
      const pickCalc = i => {
        const S = cur(), step = S.plan[S.ci], o = step.opts[i];
        if (o[1]) {
          S.log.push(...step.res); S.cfb = good('Yes.') + ' ' + o[2];
          if (step.px != null) S.px = step.px; if (step.py != null) S.py = step.py;
          S.ci++; S.cw = {};
          if (step.endKind) { S.cdone = true; S.cend = step.endKind; S.reach = Math.max(S.reach, 5); }
        } else { S.cw[i] = true; S.cfb = bad('Not that move.') + ' ' + o[2]; }
        renderAll();
      };
      const renderSolve = () => {
        const S = cur(), sd = sdn(), u = S.u, els = [ttl('Step 4: choose a method and solve')];
        const e = fbBox(); e.innerHTML = sd.eqs.map((q, i) => `${kk(`Equation ${i + 1}`)} ${eqStr(sd, q, u)}`).join('<br>'); els.push(e);
        if (!S.mok) {
          els.push(para('Which method will you use?'));
          els.push(h('div', { class: 'ctl buttons' }, METH.map(m => mkBtn(m[1], () => { S.meth = m[0]; S.reason = null; S.rw = {}; S.mfb = ''; renderAll(); }, S.meth === m[0]))));
          if (S.meth) { els.push(para('Why this method?')); els.push(optList(REASONS.map(r => [r]), S.rw, pickReason)); }
          if (S.mfb) { const f = fbBox(); f.innerHTML = S.mfb; els.push(f); }
        } else {
          const f = fbBox(); f.innerHTML = S.mfb; els.push(f);
          const mname = S.meth === 'graph' ? 'graph' : sd.form === 'iso' ? 'substitution (set the right sides equal)' : 'elimination';
          const lg = fbBox(); lg.innerHTML = `${kk('Method')} ${mname}` + (S.log.length ? '<br>' + S.log.map((l, i) => l).join('<br>') : ''); els.push(lg);
          if (!S.cdone) {
            const step = S.plan[S.ci]; els.push(para(step.q)); els.push(optList(step.opts, S.cw, pickCalc));
          } else {
            const done = fbBox();
            done.innerHTML = S.cend === 'one' ? good('Solved and checked.') + ' The point is on both lines.' : good('Done.') + (S.cend === 'none' ? ' There is no solution: no point is on both lines.' : ' Every point on the line is a solution.');
            els.push(done); els.push(h('div', { class: 'ctl buttons' }, mkBtn('Next: what does it mean?', () => { S.stage = 4; renderAll(); }, true)));
          }
          if (S.cfb) { const f2 = fbBox(); f2.innerHTML = S.cfb; els.push(f2); }
          els.push(h('div', { class: 'ctl buttons' }, mkBtn('Choose a different method', () => { resetSolve(S); S.reach = Math.max(S.reach, 4); renderAll(); })));
        }
        stageBox.replaceChildren(...els);
      };

      /* ---------- stage 5: meaning ---------- */
      const pickInterp = i => {
        const S = cur(), q = S.iqs[S.iq], o = q.opts[i];
        if (o[1]) { S.ifb = good('Yes.') + ' ' + o[2]; S.iq++; S.iw = {}; if (S.iq >= S.iqs.length) S.idone = true; }
        else { S.iw[i] = true; S.ifb = bad('Not quite.') + ' ' + o[2]; }
        renderAll();
      };
      const renderInterp = () => {
        const S = cur(), sd = sdn(), els = [ttl('Step 5: say what it means')];
        if (!S.cdone) { els.push(para('Solve the system first (step 4). Then come back to say what the answer means.')); stageBox.replaceChildren(...els); return; }
        if (!S.iqs) S.iqs = buildIQ(st.story, S.u);
        const sol = solveSys(eqsNow(st.story, S.u));
        const r = fbBox();
        r.innerHTML = sol.kind === 'one' ? `${kk('Solution')} x = ${show(sol.x)}, y = ${show(sol.y)}<br>${kk('In the story')} ${sd.at(sol.x, sol.y)}` : `${kk('Solution')} ${sol.kind === 'none' ? 'none (parallel lines)' : 'every point on the line'}`;
        els.push(r);
        if (!S.idone) { const q = S.iqs[S.iq]; els.push(para(q.q)); els.push(optList(q.opts, S.iw, pickInterp)); }
        else {
          const nxt = ORDER[(ORDER.indexOf(st.story) + 1) % ORDER.length];
          els.push(para(good('Finished.') + ' You named the unknowns, built the equations, saw the graph, solved, and checked the answer against the story.'));
          els.push(h('div', { class: 'ctl buttons' }, mkBtn('Try the ' + ST[nxt].name.toLowerCase() + ' story', () => { cancel(); st.story = nxt; renderAll(); }, true)));
        }
        const f = fbBox(); f.innerHTML = S.ifb; els.push(f);
        stageBox.replaceChildren(...els);
      };

      /* ---------- the graph box (readout) ---------- */
      const renderGraphBox = () => {
        const S = cur(), sd = sdn(), u = S.u, E = eqsNow(st.story, u), sol = solveSys(E), kind = classify(sd, sol), els = [];
        const r = fbBox(), lines = sd.eqs.map((q, i) => `${kk(st.mode === 'predict' ? (i ? 'Gym B' : 'Gym A') : `Equation ${i + 1} (${sd.lab[i]})`)} ${eqStr(sd, q, u)}`);
        if (sol.kind === 'one') lines.push(`${kk('Crossing')} (${show(sol.x)}, ${show(sol.y)}): ${sd.at(sol.x, sol.y)}`);
        else lines.push(`${kk('Crossing')} ` + (sol.kind === 'none' ? 'none. The lines are parallel.' : 'every point. Same line.'));
        if (kind === 'neg') lines.push('The crossing has a negative value. That is outside what the story allows.');
        else if (kind === 'frac') lines.push('The crossing is not a whole number, but the story counts whole things.');
        else if (sol.kind === 'one' && !inView(sd.view, sol.x, sol.y)) lines.push('The crossing is off the graph.');
        r.innerHTML = lines.join('<br>'); els.push(r);
        els.push(para('Move the sliders. Watch the crossing point, and what happens when the lines become parallel or the same.', 'margin:0;font-size:.86rem;color:var(--muted)'));
        if (st.mode === 'story') els.push(h('div', { class: 'ctl buttons' }, mkBtn('Continue to solving', () => { S.reach = Math.max(S.reach, 4); S.stage = 3; renderAll(); }, true)));
        else els.push(h('div', { class: 'ctl buttons' }, mkBtn('Build this story step by step', () => { cancel(); st.mode = 'story'; st.rev = 1; S.stage = 0; renderAll(); }, true)));
        graphBox.replaceChildren(...els);
      };

      /* ---------- predict ---------- */
      const renderPredict = () => {
        const sd = ST.gym, S = SS.gym, els = [ttl('Predict first'), para('Gym B costs more every month. Will Gym B ever cost less than Gym A in total?')];
        const OPT = [['Never: it costs more every month.', 'It costs more each month, but Gym A starts $45 higher. Watch the lines: the starting gap matters.'],
          ['Yes: for the first few months.', 'Gym B has no joining fee, so it starts at $0 while Gym A starts at $45. B is cheaper until the lines cross at 4.5 months. After that, A is cheaper.'],
          ['Yes: but only after many months.', 'It is the other way round. B costs more each month, so over time B falls behind. Its advantage is at the start, because Gym A charges a joining fee up front.']];
        els.push(h('div', { style: COL.opts }, OPT.map((o, i) => { const b = mkBtn(o[0], () => {
          if (pred >= 0) return; pred = i; predFb = (i === 1 ? good('Yes.') : bad('Not quite.')) + ' ' + o[1] + (i === 1 ? '' : ' ' + OPT[1][1]);
          st.rev = 0; cancel(); cancel = animateTo(st, { rev: 1 }, 1500, () => Pl.requestDraw(), () => renderAll()); renderAll();
        }, pred === i, OPTSTYLE); if (pred >= 0) b.disabled = true; return b; })));
        const f = fbBox(); f.innerHTML = predFb; els.push(f);
        predBox.replaceChildren(...els);
      };

      /* ---------- practice ---------- */
      let pTally, pQ, pCh, pFb, pNext;
      const buildPractice = () => {
        pTally = h('p', { class: 'ctl-title' }); pQ = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' }); pCh = h('div', { style: COL.opts });
        pFb = fbBox(); pNext = mkBtn('Next problem', () => nextProb(), true);
        pracWrap.append(pTally, pQ, pCh, pFb, h('div', { class: 'ctl buttons' }, pNext));
      };
      const tally = () => { pTally.textContent = `Right on the first try: ${prFirst} of ${prDone} done`; };
      const loadProb = () => {
        const pr = PROBS[prIdx]; prSolved = false; prTried = false; prWrong = {}; prFin = false;
        pQ.textContent = `Problem ${prIdx + 1} of ${PROBS.length}. ${pr.q}`; pFb.innerHTML = ''; pNext.disabled = true; pNext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        pCh.replaceChildren(...pr.ch.map((o, i) => mkBtn(o[0], () => pickProb(i), false, OPTSTYLE))); tally();
      };
      const pickProb = i => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        const btn = pCh.children[i];
        if (i === pr.ans) {
          prSolved = true; if (!prTried) prFirst++; prDone++;
          Array.from(pCh.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary'); pNext.disabled = false;
          pFb.innerHTML = good('Right.') + ' ' + pr.ch[i][1] + (pr.sol ? ' ' + pr.sol : '');
        } else { prTried = true; btn.disabled = true; pFb.innerHTML = bad('Not quite.') + ' ' + pr.ch[i][1] + ' Try another answer.'; }
        tally(); Pl.draw();
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); renderAll(); return; }
        pQ.textContent = `All ${PROBS.length} problems are done.`; pCh.replaceChildren(); pNext.disabled = true;
        pFb.innerHTML = `You got ${prFirst} of ${PROBS.length} right on the first try. Start over to try again, or go back to the lesson.`;
        pCh.append(mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; loadProb(); renderAll(); }, true)); Pl.draw();
      };
      buildPractice();

      /* ---------- render everything ---------- */
      const renderStageOnly = () => { renderAll(); };
      const renderStory = () => {
        const S = cur(), sd = sdn(), live = st.mode === 'story' && S.stage === 1 && !S.bdone;
        const kids = sd.txt.map(it => {
          if (typeof it === 'string') return it;
          const t = sd.ph[it.p].t(S.u);
          return live ? h('button', { type: 'button', style: PHR, onclick: () => clickPh(it.p) }, t) : h('span', { style: PHS }, t);
        });
        storyBox.replaceChildren(h('p', { style: 'margin:0;line-height:1.75;font-size:.95rem' }, ...kids));
      };
      const renderAll = () => {
        const S = cur(), pm = st.mode === 'practice', sm = st.mode === 'story', pdm = st.mode === 'predict';
        storySel.value = st.story;
        vis(G.top, sm); vis(storyBox ? [storyBox] : [], !pm); vis([predBox], pdm); vis([stageBox], sm);
        ORDER.forEach(id => vis(G['sl_' + id], id === st.story && ((sm && S.stage === 2) || (pdm && pred >= 0 && st.rev > .999))));
        vis([graphBox], (sm && S.stage === 2) || (pdm && pred >= 0 && st.rev > .999));
        vis([pracWrap], pm);
        sliderSets[st.story].forEach((sl, i) => sl.set(S.u[i]));
        stageBtns.forEach((b, i) => { b.classList.toggle('primary', S.stage === i); b.disabled = i >= S.reach; });
        pracStart.textContent = pm ? 'Back to the lesson' : 'Start practice';
        if (!pm) {
          renderStory();
          if (pdm) renderPredict();
          if (sm) ({ 0: renderUnk, 1: renderBld, 2: () => stageBox.replaceChildren(), 3: renderSolve, 4: renderInterp })[S.stage]();
          if ((sm && S.stage === 2) || (pdm && pred >= 0 && st.rev > .999)) renderGraphBox();
        }
        Pl.draw();
      };

      const apply = (patch, immediate) => {
        cancel();
        st.mode = patch.mode || 'story';
        if (patch.story) st.story = patch.story;
        const S = cur(), sd = sdn();
        S.u = sd.par.map(q => q.v); resetSolve(S);
        if (patch.stage != null) S.stage = patch.stage;
        if (patch.reach) S.reach = Math.max(S.reach, patch.reach);
        if (st.mode === 'predict') { pred = -1; predFb = ''; st.rev = 0; } else st.rev = 1;
        renderAll();
      };
      apply({ mode: 'predict', story: 'gym', stage: 0 }, true);
      return { destroy: () => { cancel(); Pl.destroy(); }, apply };
    }
  });
}
