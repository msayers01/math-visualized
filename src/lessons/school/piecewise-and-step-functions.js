/* =====================================================================
   SCHOOL — Piecewise and step functions
   ===================================================================== */
{
  const MI = '−';
  const INF = Infinity;
  const kk = t => `<span class="k">${t}</span>`;
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const par = v => (v < 0 ? `(${num(v)})` : num(v));
  const usd = v => '$' + (Number.isInteger(v) ? String(v) : v.toFixed(2));
  const lines = a => a.filter(Boolean).join('<br>');
  const z0 = v => v + 0;

  /* a piece of a piecewise function: y = m x + c on the stretch from l to r.
     lc / rc say whether the left / right end is used (closed) or left out (open). */
  const pcs = (l, r, m, c, lc, rc, o) => Object.assign({ l, r, m, c, lc, rc }, o || {});
  const val = (pc, x) => pc.m * x + pc.c;
  const inP = (pc, x) => (pc.l === pc.r ? (x === pc.l && pc.lc && pc.rc)
    : (x > pc.l || (x === pc.l && pc.lc)) && (x < pc.r || (x === pc.r && pc.rc)));
  const idxAt = (ps, x) => ps.findIndex(pc => inP(pc, x));
  const fAt = (ps, x) => { const i = idxAt(ps, x); return i < 0 ? null : val(ps[i], x); };
  /* "2x + 3", "x + 6", "−x + 3", "5" */
  const rt = (m, c) => {
    if (m === 0) return num(c);
    const xs = (m === 1 ? '' : m === -1 ? MI : num(m)) + 'x';
    return xs + (c === 0 ? '' : (c < 0 ? ' − ' : ' + ') + num(Math.abs(c)));
  };
  /* the condition on x for one piece, in words and symbols */
  const cond = pc => {
    const lo = isFinite(pc.l), hi = isFinite(pc.r);
    if (pc.l === pc.r) return `x = ${num(pc.l)}`;
    if (lo && hi) return `${num(pc.l)} ${pc.lc ? '≤' : '<'} x ${pc.rc ? '≤' : '<'} ${num(pc.r)}`;
    if (lo) return `x ${pc.lc ? '≥' : '>'} ${num(pc.l)}`;
    if (hi) return `x ${pc.rc ? '≤' : '<'} ${num(pc.r)}`;
    return 'every x';
  };
  /* "2 × 3 + 1" : the arithmetic of one rule at one input */
  const evT = (pc, x) => (pc.m === 0 ? num(pc.c)
    : `${pc.m === 1 ? '' : num(pc.m) + ' × '}${par(x)}` + (pc.c === 0 ? '' : (pc.c < 0 ? ' − ' : ' + ') + num(Math.abs(pc.c))));
  const sub = a => (a === 0 ? '' : a > 0 ? ` − ${a}` : ` + ${-a}`);

  /* ---------- the fixed scenes ---------- */
  const TAXI = [
    pcs(0, 3, 2, 3, 1, 1, { n: 'Rule 1' }),
    pcs(3, 10, 1, 6, 0, 1, { n: 'Rule 2' })];
  const EVAL = [
    pcs(-INF, 3, 2, 0, 0, 0, { n: 'Rule 1' }),
    pcs(3, INF, 1, 1, 1, 0, { n: 'Rule 2' })];
  const stepPieces = pre => {
    const o = [];
    if (pre === 0) {
      o.push(pcs(0, 0, 0, 0, 1, 1, { n: 'the start' }));
      for (let k = 1; k <= 5; k++) o.push(pcs(k - 1, k, 0, 3 * k, 0, 1, { n: `Step ${k}` }));
    } else {
      for (let k = 0; k <= 4; k++) o.push(pcs(k, k + 1, 0, 2 * k, 1, 0, { n: `Step ${k + 1}` }));
      o.push(pcs(5, 5, 0, 10, 1, 1, { n: 'the last point' }));
    }
    return o;
  };
  const STEPS = [
    { name: 'Parking: $3 for each hour or part of an hour', view: { xa: 0, xb: 5, ya: 0, yb: 16, gx: 1, gy: 3 }, xl: 'hours parked (x)', yl: 'cost in dollars',
      expl: x => (Number.isInteger(x) ? `${num(x)} hours is exactly ${x} whole hours, so it is not rounded up` : `part of hour ${Math.ceil(x)} counts as a whole hour, so ${num(x)} rounds UP to ${Math.ceil(x)}`),
      calc: x => `3 × ${Math.ceil(x)}`, cmp: x => [x + .01, 'Just above'],
      dr: 'Domain: 0 ≤ x ≤ 5 hours. Range: only 0, 3, 6, 9, 12, 15.' },
    { name: 'Bike hire: $2 for each completed hour', view: { xa: 0, xb: 5, ya: 0, yb: 10, gx: 1, gy: 2 }, xl: 'hours ridden (x)', yl: 'cost in dollars',
      expl: x => (Number.isInteger(x) ? `${num(x)} hours is exactly ${x} completed hours` : `only completed hours count, so ${num(x)} counts as ${Math.floor(x)}`),
      calc: x => `2 × ${Math.floor(x)}`, cmp: x => [x - .01, 'Just below'],
      dr: 'Domain: 0 ≤ x ≤ 5 hours. Range: only 0, 2, 4, 6, 8, 10.' }
  ];

  const TASKS = [
    { name: 'Bike rental', yb: 30, gy: 5,
      story: 'Bike rental: $5 per hour for the first 3 hours, then $2 per hour for every hour after that. There is no start fee. Build the graph of the total cost, from 0 to 8 hours.',
      f: x => (x <= 3 ? 5 * x : 2 * x + 9), ans: { a: 3, m1: 5, b1: 0, m2: 2, b2: 9 }, unit: 'hours',
      hints: [
        ['a', 'The rate changes after 3 hours, so the breakpoint is 3.'],
        ['m1', 'Piece 1 is $5 per hour, so its slope is 5. With no start fee, its intercept is 0.'],
        ['b1', 'There is no start fee, so Piece 1 starts at $0: its intercept is 0.'],
        ['m2', 'After the breakpoint each hour costs $2, so Piece 2 has slope 2.'],
        ['b2', 'Piece 2 has to start where Piece 1 ends: after 3 hours you have paid 5 × 3 = $15. So 2 × 3 + b = 15, which gives b = 9. The "Make the pieces meet" switch finds b for you.']] },
    { name: 'Phone data plan', yb: 40, gy: 5,
      story: 'Phone plan: $20 a month includes the first 4 GB. After that each extra GB costs $5, so 5 GB costs $25. Build the graph of the monthly bill, from 0 to 8 GB.',
      f: x => (x <= 4 ? 20 : 5 * x), ans: { a: 4, m1: 0, b1: 20, m2: 5, b2: 0 }, unit: 'GB',
      hints: [
        ['a', 'The plan covers the first 4 GB, so the rule changes at 4.'],
        ['m1', 'Up to 4 GB the bill stays flat at $20, so Piece 1 has slope 0.'],
        ['b1', 'Piece 1 is a flat $20, so its intercept is 20.'],
        ['m2', 'Each extra GB costs $5, so Piece 2 has slope 5.'],
        ['b2', 'Piece 2 must start at $20 when x = 4. Then 5 × 4 + b = 20 gives b = 0, so the bill is 5x. Try the "Make the pieces meet" switch.']] }
  ];

  const A_PIECES = [pcs(-2, 1, 1, 1, 1, 0, { n: 'Piece 1' }), pcs(1, 4, -1, 4, 1, 1, { n: 'Piece 2' })];
  const DRP = [
    { name: 'A piecewise graph', view: { xa: -3, xb: 5, ya: -2, yb: 4, gx: 1, gy: 1 }, xl: 'x', yl: 'f(x)', pieces: () => A_PIECES, lab: 2,
      info: 'f(x) = x + 1 for −2 ≤ x < 1, and f(x) = 4 − x for 1 ≤ x ≤ 4.',
      dom: [[-2, 4]], ran: [[-1, 3]],
      dq: ['Which is the domain, the set of inputs x that have a point on the graph?', [
        ['(−∞, ∞): every real number', 'The graph stops at both ends. There is a closed dot at x = −2 and another at x = 4, and nothing to the left or right of them.'],
        ['[−2, 4]: every x from −2 to 4, both ends included', 'Yes. Read left to right: the first dot is closed at x = −2 and the last is closed at x = 4. The open circle at x = 1 does not leave a hole, because the second piece has a closed dot at x = 1.'],
        ['[−2, 4): every x from −2 up to 4, but not 4', 'The right end at x = 4 is a closed dot, so x = 4 is used. A bracket [ or ] means the end is included.'],
        ['[−1, 3]: every x from −1 to 3', 'That reads the heights. The domain is about the x-values, along the bottom. They run from −2 to 4.']], 1],
      rq: ['Which is the range, the set of outputs f(x), the heights the graph reaches?', [
        ['[−1, 3]: every height from −1 to 3, both ends included', 'Yes. Piece 1 goes from height −1 up to (almost) 2. Piece 2 goes from 3 down to 0. Together they cover every height from −1 to 3. Height 2 is reached by Piece 2, at x = 2.'],
        ['[−2, 4]: every height from −2 to 4', 'That is the domain. The heights only go from the lowest point, −1, to the highest point, 3.'],
        ['[−1, 2): every height from −1 up to 2, but not 2', 'That uses Piece 1 only. Piece 2 reaches higher, up to 3, and it also reaches 2 (at x = 2).'],
        ['[0, 3]: every height from 0 to 3', 'That uses Piece 2 only. Piece 1 goes lower, down to −1 at x = −2.']], 0] },
    { name: 'The parking step function', view: { xa: -3, xb: 5, ya: -2, yb: 16, gx: 1, gy: 3 }, xl: 'hours parked (x)', yl: 'cost in dollars', pieces: () => stepPieces(0), lab: 0,
      info: 'Parking costs $3 for each hour or part of an hour, for 0 to 5 hours.',
      dom: [[0, 5]], ran: [[0, 0], [3, 3], [6, 6], [9, 9], [12, 12], [15, 15]],
      dq: ['Which is the domain?', [
        ['(0, 5]: every x above 0 up to 5', 'There is a closed dot at (0, 0), so x = 0 is a valid input: zero hours cost $0. A parenthesis ( would leave 0 out.'],
        ['[0, 5]: every time from 0 to 5 hours, both ends included', 'Yes. Time can be any number from 0 to 5, including 0 (the dot at (0, 0)) and 5 (the closed dot on the last step). The steps are flat, but there is a step above every x between 0 and 5.'],
        ['x = 0, 1, 2, 3, 4, 5 only', 'That treats the inputs as whole numbers. But you can park 2.5 hours, and the graph has a step above 2.5. Time is continuous.'],
        ['[0, 15]: every number from 0 to 15', 'That reads the heights. The domain is the x-values along the bottom, 0 to 5.']], 1],
      rq: ['Which is the range?', [
        ['[0, 15]: every height from 0 to 15', 'Between the steps there are no points, so a height like 4 is never an output. The cost is always a multiple of 3.'],
        ['3, 6, 9, 12, 15 only', 'Almost. The dot at (0, 0) means 0 hours cost $0, so 0 is an output too.'],
        ['0, 3, 6, 9, 12, 15 only: six separate values', 'Yes. The graph only reaches six heights. A range is a list of the outputs that happen, and here it is a list of six numbers, not an interval.'],
        ['[0, 5]: every height from 0 to 5', 'That is the domain again. The heights are the costs: 0, 3, 6, up to 15.']], 2] },
    { name: 'The V graph |x − 2| + 1', view: { xa: -3, xb: 5, ya: -2, yb: 7, gx: 1, gy: 1 }, xl: 'x', yl: 'f(x)', lab: 2,
      pieces: () => [pcs(-INF, 2, -1, 3, 0, 0, { n: 'Piece 1' }), pcs(2, INF, 1, -1, 1, 0, { n: 'Piece 2' })],
      info: 'f(x) = |x − 2| + 1, which is −x + 3 for x < 2 and x − 1 for x ≥ 2. The arms go on forever.',
      dom: [[-INF, INF]], ran: [[1, INF]],
      dq: ['Which is the domain?', [
        ['(−∞, ∞): every real number', 'Yes. Both arms go on forever, to the left and to the right, so every x has a point. You can put any number into |x − 2| + 1.'],
        ['[2, ∞): every x from 2 on', 'x = 2 is the corner, but the left arm also has points. Any x to the left of 2 works too.'],
        ['(−∞, 2) and (2, ∞): every x except 2', 'x = 2 is allowed: |2 − 2| + 1 = 1. The closed dot at (2, 1) is on the graph.'],
        ['[1, ∞): every x from 1 on', 'That reads the heights. The graph is only that high from 1 upward, but the inputs x are not limited.']], 0],
      rq: ['Which is the range?', [
        ['(−∞, ∞): every real number', 'The graph never goes below the corner at height 1. An absolute value is never negative, and then we add 1.'],
        ['[0, ∞): every height from 0 up', '|x − 2| can be 0, and then f = 0 + 1 = 1. The graph never reaches 0.'],
        ['[2, ∞): every height from 2 up', 'The corner is at (2, 1). Its x-value is 2, but its height is 1. The range uses heights.'],
        ['[1, ∞): every height from 1 up', 'Yes. The lowest point is the corner at height 1 and the arms keep rising forever. Heights below 1 are never reached.']], 3] },
    { name: 'Tickets, whole numbers only', view: { xa: -3, xb: 5, ya: -2, yb: 22, gx: 1, gy: 5 }, xl: 'tickets bought (x)', yl: 'cost in dollars', lab: 0,
      pieces: () => [0, 1, 2, 3, 4].map(k => pcs(k, k, 5, 0, 1, 1, { n: 'a dot' })),
      info: 'Tickets cost $5 each and you can buy 0 to 4. The cost is f(x) = 5x.',
      bad: 'There is no dot here. You cannot buy a part of a ticket, so this input is not valid in the story.',
      ok: 'There is a dot here, so it is a valid input in the story.',
      dom: [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]], ran: [[0, 0], [5, 5], [10, 10], [15, 15], [20, 20]],
      dq: ['Which is the domain?', [
        ['[0, 4]: every number from 0 to 4', 'That would allow 2.5 tickets. The cost rule 5x works for 2.5, but the story does not: a ticket is a whole thing. Each input is a count, so the inputs are separate.'],
        ['0, 1, 2, 3, 4: the whole numbers from 0 to 4', 'Yes. Inputs that are counts are discrete: only separate whole values make sense, so the graph is five dots, not a line.'],
        ['(−∞, ∞): every real number', 'The story limits you to between 0 and 4 tickets, and negative tickets make no sense.'],
        ['0, 5, 10, 15, 20', 'Those are the costs, the outputs. The inputs are how many tickets you buy.']], 1],
      rq: ['Which is the range?', [
        ['0, 5, 10, 15, 20: five separate dollar amounts', 'Yes. Each of the 5 valid inputs gives one cost, and those are the only costs that happen. A cost like $7 is never possible.'],
        ['[0, 20]: every amount from 0 to 20', 'The cost is always a multiple of 5. A cost like $7 cannot happen, so the outputs are separate too.'],
        ['0, 1, 2, 3, 4', 'Those are the inputs, the tickets. The outputs are the dollars: 5 times each of them.'],
        ['[0, 4]: every number from 0 to 4', 'That is an interval of inputs, and the inputs are only whole numbers anyway. The range is the list of costs.']], 0] },
    { name: 'Apples, any weight', view: { xa: -3, xb: 5, ya: -2, yb: 22, gx: 1, gy: 5 }, xl: 'kilograms of apples (x)', yl: 'cost in dollars', lab: 0,
      pieces: () => [pcs(0, 4, 5, 0, 1, 1, { n: 'the line' })],
      info: 'Apples cost $5 per kilogram and you can buy 0 to 4 kilograms. The cost is f(x) = 5x.',
      bad: 'There is no point here. This is outside the amount you can buy.',
      ok: 'The line is here, so this is a valid input. Apples can be sold by any weight.',
      dom: [[0, 4]], ran: [[0, 20]],
      dq: ['Which is the domain?', [
        ['0, 1, 2, 3, 4: whole kilograms only', 'You can weigh 2.5 kg of apples, so in-between inputs make sense. A scale does not only show whole numbers. The graph is a solid segment, not dots.'],
        ['[0, 4]: every weight from 0 to 4 kg', 'Yes. Weight is continuous: any number from 0 to 4 works, so the graph is one connected segment with closed ends.'],
        ['[0, 20]: every number from 0 to 20', 'That is the cost range. The inputs are kilograms, 0 to 4.'],
        ['(0, 4): every weight strictly between 0 and 4', 'Both ends have closed dots: 0 kg costs $0 and 4 kg costs $20. Brackets, not parentheses.']], 1],
      rq: ['Which is the range?', [
        ['0, 5, 10, 15, 20: five separate amounts', 'A weight like 2.5 kg costs $12.50, which is on the graph. The outputs fill in every value between, because the inputs do.'],
        ['[0, 20]: every cost from $0 to $20', 'Yes. The line runs from height 0 at x = 0 up to height 20 at x = 4, so every cost in between happens.'],
        ['[0, 4]: every number from 0 to 4', 'That is the domain, in kilograms. The range is in dollars.'],
        ['[5, 20]: every cost from $5 to $20', '0 kg costs $0 and the closed dot at (0, 0) is on the graph, so $0 is an output.']], 1] }
  ];

  /* ---------- practice problems (a fixed list) ---------- */
  const P1 = [pcs(-INF, 2, 3, 0, 0, 0, { n: 'Rule 1' }), pcs(2, INF, 1, 5, 1, 0, { n: 'Rule 2' })];
  const P2 = [pcs(-INF, 3, -1, 4, 0, 0, { n: 'Rule 1' }), pcs(3, INF, 2, -5, 1, 0, { n: 'Rule 2' })];
  const P5 = [pcs(0, 2, 2, 0, 1, 0, { n: 'Piece 1' }), pcs(2, 5, -1, 6, 1, 1, { n: 'Piece 2' })];
  const PROBS = [
    { name: 'Evaluate at the breakpoint', view: { xa: -3, xb: 5, ya: -4, yb: 10, gx: 1, gy: 2 }, xl: 'x', yl: 'f(x)', lab: 2,
      sc: () => ({ pieces: P1, marks: [] }),
      q: 'f(x) = 3x when x < 2, and f(x) = x + 5 when x ≥ 2. What is f(2)? Look at the open circle and the closed dot over x = 2.',
      ch: [['f(2) = 6', 'That is 3 × 2, the first rule. But the first rule is only for x < 2, and 2 is not less than 2. The open circle at (2, 6) means that point is not used.'],
           ['f(2) = 7', 'x = 2 fits x ≥ 2, so use the second rule: 2 + 5 = 7. The closed dot at (2, 7) is the point that is used.'],
           ['f(2) = 13', 'That adds both rules (6 + 7). A function uses exactly one rule for each input.'],
           ['f(2) is not defined', 'Every x has one rule. The condition x ≥ 2 includes 2, so f(2) is defined: it is 7.']], ans: 1,
      marks: [[2, 7, 'f(2) = 7']] },
    { name: 'Inputs in different pieces', view: { xa: -2, xb: 6, ya: -3, yb: 8, gx: 1, gy: 1 }, xl: 'x', yl: 'f(x)', lab: 2,
      sc: () => ({ pieces: P2, marks: [] }),
      q: 'f(x) = 4 − x when x < 3, and f(x) = 2x − 5 when x ≥ 3. Find f(1) + f(5).',
      ch: [['f(1) + f(5) = 2', 'That uses the first rule for both: 4 − 1 = 3 and 4 − 5 = −1. But 5 is not less than 3, so f(5) uses the second rule.'],
           ['f(1) + f(5) = −4', 'That swaps the rules. 1 is less than 3, so f(1) uses 4 − x. 5 is at least 3, so f(5) uses 2x − 5.'],
           ['f(1) + f(5) = 8', 'f(1): 1 < 3, so 4 − 1 = 3. f(5): 5 ≥ 3, so 2(5) − 5 = 5. The sum is 3 + 5 = 8. The two dots on the graph are at heights 3 and 5.'],
           ['f(1) + f(5) = 3', 'That is only f(1). The question asks for the sum of two values, f(1) and f(5), each found with its own rule.']], ans: 2,
      marks: [[1, 3, 'f(1) = 3'], [5, 5, 'f(5) = 5']] },
    { name: 'Choose the rule for a story', view: { xa: 0, xb: 8, ya: 0, yb: 24, gx: 1, gy: 4 }, xl: 'units used (x)', yl: 'cost in dollars', lab: 0,
      sc: (pv, ok) => ({ pieces: [pcs(0, 4, 2, 0, 1, 1, { n: 'first 4 units' })].concat(pv ? [pcs(4, 8, pv[0], pv[1], 0, 1, { n: 'chosen rule', k: ok ? 0 : 1 })] : []), marks: [] }),
      q: 'A water bill charges $2 per unit for the first 4 units, so the cost is 2x there. Each unit after 4 costs $3. Which rule gives the total cost f(x) when x > 4? Each choice draws its Piece 2.',
      ch: [['f(x) = 3x', 'That charges $3 for the first 4 units too: f(4) would be 12, but the first 4 units only cost 2 × 4 = $8. The pieces do not meet.'],
           ['f(x) = 3x + 8', 'That adds the first $8 and also charges $3 for every unit, so every unit costs $3 plus the extra $8 on top. At x = 4 it gives 20, not 8.'],
           ['f(x) = x + 4', 'The slope is 1, so each extra unit would cost $1. The story says $3. (It does give 8 at x = 4, so it meets the first piece, but it climbs too slowly.)'],
           ['f(x) = 3x − 4', 'The first 4 units cost $8. Each unit beyond 4 adds 3: 8 + 3(x − 4) = 3x − 4. At x = 4 it gives 8, so the pieces meet.']], ans: 3,
      pv: [[3, 0], [3, 8], [1, 4], [3, -4]] },
    { name: 'A step function', view: { xa: 0, xb: 5, ya: 0, yb: 10, gx: 1, gy: 2 }, xl: 'hours ridden (x)', yl: 'cost in dollars', lab: 0,
      sc: () => ({ pieces: stepPieces(1), marks: [] }),
      q: 'Bike hire is $2 for each completed hour. Each step of the graph has a closed dot on its left end and an open circle on its right end. How much does a ride of 3.9 hours cost?',
      ch: [['$6', 'Only 3 hours are completed, so the cost is 2 × 3 = $6. On the graph, the step from x = 3 up to (not including) 4 sits at height 6.'],
           ['$8', 'That rounds 3.9 up to 4, as parking would. Here only completed hours count, so 3.9 counts as 3.'],
           ['$7.80', 'That multiplies 2 × 3.9 as if the cost grew smoothly. A step function does not: the cost only jumps at whole hours.']], ans: 0,
      marks: [[3.9, 6, 'f(3.9) = 6']] },
    { name: 'Range from a graph', view: { xa: -1, xb: 6, ya: -1, yb: 5, gx: 1, gy: 1 }, xl: 'x', yl: 'f(x)', lab: 2,
      sc: () => ({ pieces: P5, marks: [] }),
      q: 'f(x) = 2x for 0 ≤ x < 2, and f(x) = 6 − x for 2 ≤ x ≤ 5. What is the range, the set of heights the graph reaches?',
      ch: [['0 ≤ y < 4', 'Piece 1 stops just short of 4, but Piece 2 includes x = 2 and gives 6 − 2 = 4 (the closed dot at (2, 4)). So 4 is an output.'],
           ['0 ≤ y ≤ 4', 'Piece 1 gives heights from 0 up to (not including) 4. Piece 2 goes from 4 down to 1, and includes 4. Together: every height from 0 to 4, written [0, 4].'],
           ['1 ≤ y ≤ 4', 'That uses Piece 2 only. Piece 1 also reaches heights from 0 to 4.'],
           ['0 ≤ y ≤ 5', 'The 5 is the biggest x (the domain), not a height. The highest point on the graph is at height 4.']], ans: 1 },
    { name: 'Discrete or continuous?', view: { xa: -1, xb: 7, ya: -2, yb: 20, gx: 1, gy: 4 }, xl: 'muffins bought (x)', yl: 'cost in dollars', lab: 0,
      sc: (pv, ok) => ({ pieces: ok ? [0, 1, 2, 3, 4, 5, 6].map(k => pcs(k, k, 3, 0, 1, 1, { n: 'a dot' })) : [pcs(0, 6, 3, 0, 1, 1, { n: 'a line' })], marks: [] }),
      q: 'Muffins cost $3 each and are sold whole. f(x) = 3x is the cost of x muffins, and you can buy 0 to 6 of them. The graph first shows a solid line, which is tempting. Which statement is correct?',
      ch: [['The graph is a solid line from 0 to 6, so 2.5 muffins would cost $7.50.', 'The rule 3x gives 7.5 at x = 2.5, but the bakery does not sell half a muffin here. The input is a count, so the points between whole numbers have no meaning.'],
           ['The graph is 7 separate dots, and the range is every number from 0 to 18.', 'The dots are at heights 0, 3, 6, 9, 12, 15, 18 only. A height like 4 can never happen, so the range is not every number.'],
           ['The graph is 7 separate dots at x = 0 to 6, and the range is 0, 3, 6, 9, 12, 15, 18.', 'The input is a count, so only whole numbers 0 to 6 are valid: that is discrete. Each gives one cost, so there are seven outputs. The graph now shows the dots.']], ans: 2 },
    { name: 'Absolute value as two pieces', view: { xa: -3, xb: 7, ya: -1, yb: 6, gx: 1, gy: 1 }, xl: 'x', yl: 'f(x)', lab: 0,
      sc: () => ({ pieces: [pcs(-INF, 2, -1, 2, 0, 0, { n: 'Piece 1' }), pcs(2, INF, 1, -2, 1, 0, { n: 'Piece 2' })], marks: [] }),
      q: 'f(x) = |x − 2| is the distance from x to 2. Which pair of rules is the same function?',
      ch: [['x − 2 when x ≥ 0, and −x − 2 when x < 0', 'The split has to be where x − 2 changes sign, at x = 2, not at 0. Test x = 1: |1 − 2| = 1, but this rule gives 1 − 2 = −1.'],
           ['x − 2 when x ≥ 2, and x + 2 when x < 2', 'x + 2 is not the opposite of x − 2. The opposite is −(x − 2) = 2 − x. Test x = 1: |1 − 2| = 1, but x + 2 = 3.'],
           ['x − 2 for every x', 'At x = 0 that gives −2, but a distance is never negative. The rule has to change for x < 2.'],
           ['x − 2 when x ≥ 2, and 2 − x when x < 2', 'For x ≥ 2, x − 2 is already positive. For x < 2, x − 2 is negative, so flip it: −(x − 2) = 2 − x. Test x = 0: |0 − 2| = 2 and 2 − 0 = 2.']], ans: 3 },
    { name: 'A continuity question', view: { xa: -1, xb: 7, ya: -2, yb: 12, gx: 1, gy: 2 }, xl: 'x', yl: 'f(x)', lab: 2,
      sc: (pv, ok) => ({ pieces: [pcs(-INF, 3, 2, 0, 0, 0, { n: 'Rule 1' })].concat(pv ? [pcs(3, INF, 1, pv[0], 1, 0, { n: 'Rule 2', k: ok ? 0 : 1 })] : []),
        marks: [], gap: pv ? { x: 3, y0: 6, y1: 3 + pv[0] } : null }),
      q: 'f(x) = 2x when x < 3, and f(x) = x + k when x ≥ 3. Which value of k makes the two pieces meet at x = 3, with no jump? Each choice draws the second piece.',
      ch: [['k = 3', 'Piece 1 heads toward 2 × 3 = 6. Piece 2 starts at 3 + k, so 3 + k = 6 and k = 3. The pieces meet at (3, 6).'],
           ['k = 6', 'Then Piece 2 starts at 3 + 6 = 9, three higher than 6. There is a jump of 3 at x = 3. (6 is the height where they should meet, not k.)'],
           ['k = 0', 'Then Piece 2 starts at 3 + 0 = 3, which is 3 below 6. There is a jump of 3 down.'],
           ['k = −3', 'Then Piece 2 starts at 3 − 3 = 0, which is 6 below the height 6 where Piece 1 ends. There is a big jump down.']], ans: 0,
      pv: [[3], [6], [0], [-3]] }
  ];

  register({
    id: 'piecewise-and-step-functions', level: 'school',
    title: 'Piecewise and step functions',
    blurb: 'One function, different rules on different stretches: taxi fares, open and closed dots, step costs, domain and range, and |x| as two pieces.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 3.2; p.cy = 3.4; p.span = 5.2;
      p.grid(1, { axes: false });
      p.path([[0, 1], [3, 5]], { stroke: pal.blue, width: 3.5 });
      p.path([[3, 5], [6.6, 6.8]], { stroke: pal.red, width: 3.5 });
      p.dot(3, 5, 6.5, pal.stage, pal.red, 2.5);
      p.dot(3, 5, 6.5, pal.blue, pal.stage, 2);
      p.dot(0, 1, 6, pal.blue, pal.stage, 2);
      p.dot(6.6, 6.8, 6, pal.stage, pal.red, 2.5);
    },
    hook: String.raw`A taxi charges one price per mile at first, and a cheaper price after a few miles. So is the cost of 6 miles double the cost of 3? And what does a dot with an empty middle mean on a graph?`,
    steps: [
      { title: 'A rule that changes',
        text: String.raw`<p>A taxi charges a $3 flag fall plus $2 per mile for the first 3 miles. After that it charges $1 per mile. The graph bends at the <b>breakpoint</b>, 3 miles.</p><p>Blue is Rule 1 and red is Rule 2. Predict first, then drag the dot or use the slider. The rule in use is drawn thick. At 2 miles you pay $7.</p>`,
        set: { scene: 'taxi', x: 2 } },
      { title: 'Notation and open circles',
        text: String.raw`<p>Here is a new function with named rules: \(f(x)=2x\) when \(x&lt;3\), and \(f(x)=x+1\) when \(x\ge 3\). The sign \(&lt;\) leaves 3 out. The sign \(\ge\) keeps it in.</p><p>An <b>open circle</b> means that point is not used. A <b>closed dot</b> means it is used. At \(x=3\), choose the rule first, then the value.</p>`,
        set: { scene: 'eval', x: 3 } },
      { title: 'Build one yourself',
        text: String.raw`<p>Bike rental: $5 per hour for the first 3 hours, then $2 per hour. There is no start fee.</p><p>Set the breakpoint and the rule on each piece, then press <b>Check my graph</b>. Watch the violet <b>gap</b> at the breakpoint. When the gap is 0 the pieces meet. When it is not, the cost would jump, and a bike rental has no jump.</p>`,
        set: { scene: 'build', task: 0, a: 2, m1: 4, b1: 0, m2: 1, b2: 0 } },
      { title: 'Step functions',
        text: String.raw`<p>Parking costs $3 for each hour or part of an hour. A <b>step function</b> stays flat, then jumps.</p><p>At 2.5 hours you pay $9, because part of the third hour counts as a whole one. Each step has an open circle on its left end and a closed dot on its right. Press the x = 3 and x = 3.01 buttons and say why the cost jumps. Then explore the scene menu.</p>`,
        set: { scene: 'step', pre: 0, x: 2.5 } }
    ],
    formal: String.raw`
      <p>A <em>piecewise function</em> uses different rules on different stretches of the input. We write one rule per line and say where each rule is used:
      \[ f(x)=\begin{cases} 2x & \text{if } x&lt;3,\\ x+1 & \text{if } x\ge 3. \end{cases} \]
      Every allowed input belongs to exactly one stretch, so it has exactly one output. To evaluate, first decide which condition is true, then use that rule only.</p>
      <h3>The breakpoint and the trap</h3>
      <p>The input where the rule changes is the <em>breakpoint</em>. The symbols \(&lt;\) and \(&gt;\) leave the endpoint out. The symbols \(\le\) and \(\ge\) keep it in. If the pieces jump apart at the breakpoint, exactly one piece keeps it. On the graph, the piece that keeps the endpoint has a <em>closed dot</em>. The piece that leaves it out has an <em>open circle</em>. In the example, \(f(3)=3+1=4\), not \(2\cdot 3=6\). The point \((3,6)\) is an open circle, so it is not on the graph.</p>
      <h3>Do the pieces meet?</h3>
      <p>A graph is <em>continuous</em> at the breakpoint if the two pieces meet, so you could draw it without lifting your pencil. Otherwise there is a <em>jump</em>. To make the pieces meet, make both rules give the same output at the breakpoint. For \(f(x)=2x\) when \(x&lt;3\) and \(f(x)=x+k\) when \(x\ge 3\): the first rule heads toward \(2\cdot 3=6\), so \(3+k=6\) and \(k=3\). A taxi fare meets at its breakpoint, because the cost cannot jump just because you passed 3 miles. A rule with a different intercept makes a jump.</p>
      <p>Example. A taxi costs \(2x+3\) dollars for \(0\le x\le 3\) miles and \(x+6\) dollars after that. At the breakpoint, \(2\cdot3+3=9\) and \(3+6=9\), so the pieces meet. For 6 miles, use the second rule: \(6+6=12\) dollars. Twice the cost of 3 miles is \(2\cdot 9=18\), so 6 miles costs less than double: the flag fall is paid once, and the rate drops.</p>
      <h3>Step functions</h3>
      <p>A <em>step function</em> is piecewise with flat pieces. Parking at $3 for each hour <em>or part of an hour</em> rounds up: \(f(x)=3\lceil x\rceil\), where \(\lceil x\rceil\) means the smallest whole number that is at least \(x\). So \(f(2)=6\), \(f(2.5)=9\), \(f(3)=9\) and \(f(3.01)=12\). Exactly 3 hours is already a whole number of hours, so it is not rounded up and it belongs to the lower step. Anything even a little over 3 needs a fourth hour. That is why each step ends with a closed dot on its right end and the next one starts with an open circle: the cost jumps right after each whole number. If only <em>completed</em> hours count, as in the bike hire, the cost rounds down, \(f(x)=2\lfloor x\rfloor\), and the dots swap sides: closed on the left, open on the right.</p>
      <h3>Domain and range</h3>
      <p>The <em>domain</em> is the set of inputs that have a point on the graph. Read it along the x-axis. The <em>range</em> is the set of outputs. Read it up the y-axis. In interval notation \([a,b]\) means every number from \(a\) to \(b\) with both ends included, and \((a,b)\) leaves both ends out. A square bracket matches a closed dot and a round one matches an open circle. \([a,\infty)\) means \(a\) and everything above it, and \((-\infty,\infty)\) means every real number. For a piecewise graph, combine the pieces: for \(f(x)=x+1\) on \([-2,1)\) and \(f(x)=4-x\) on \([1,4]\), the domain is \([-2,4]\) and the range is \([-1,3]\), because height 2, left out by the open circle of the first piece, is reached by the second.</p>
      <p>The range can also be a list. The parking function only outputs \(0,3,6,9,12,15\).</p>
      <h3>Discrete and continuous inputs</h3>
      <p>Sometimes the rule makes sense for numbers that the story does not allow. If \(x\) counts tickets, only \(0,1,2,\dots\) are valid inputs, so the graph is separate dots and the range is a list. If \(x\) is a weight or a time, every number in the interval is valid, so the graph is connected. An answer that the formula can compute, like 2.5 tickets, may not be a valid answer in the story.</p>
      <h3>Absolute value is a piecewise function</h3>
      <p>The absolute value \(|t|\) is the distance from \(t\) to 0, so it is never negative:
      \[ |t|=\begin{cases} t & \text{if } t\ge 0,\\ -t & \text{if } t&lt;0. \end{cases} \]
      Putting \(t=x-a\) gives \(|x-a|=x-a\) when \(x\ge a\), and \(-(x-a)=a-x\) when \(x&lt;a\). The breakpoint is where \(x-a\) changes sign, at \(x=a\), and it is the distance from \(x\) to \(a\) on the number line. For \(f(x)=|x-2|+1\), the pieces are \(f(x)=-x+3\) for \(x&lt;2\) and \(f(x)=x-1\) for \(x\ge 2\), which meet at the corner \((2,1)\). The domain is every real number and the range is \([1,\infty)\).</p>`,
    check: [
      { q: 'The graph of a piecewise function shows an open circle at (2, 3) and a closed dot at (2, 6). Both are above x = 2. What is f(2)?',
        choices: ['f(2) = 3, because the first point drawn is the output', 'f(2) is undefined, because there are two points above x = 2', 'f(2) = 6, because the closed dot is the point that is used', 'f(2) = 9, because both points count and you add them'], answer: 2,
        why: String.raw`A function has exactly one output for each input. An open circle means "this point is not used" and a closed dot means "this point is used". So the only point on the graph above \(x=2\) is the closed dot, and \(f(2)=6\). The open circle only shows where the other piece stops.`,
        hint: 'Which of the two marks says "this point is used"? Only one point can be on the graph above x = 2.' },
      { q: 'A phone plan costs $4 as a flat fee, plus $3 per GB for the first 2 GB, and then $1 per GB for each GB after the first 2. So f(x) = 3x + 4 for 0 ≤ x ≤ 2, and the cost keeps climbing at $1 per GB after that, with no jump. What is the total cost for 5 GB?',
        choices: ['$19', '$13', '$9', '$15'], answer: 1,
        why: String.raw`At 2 GB the cost is \(3\cdot 2+4=10\) dollars. The next 3 GB cost \(1\) dollar each, so \(3\) more: \(10+3=13\) dollars. In rule form, the second piece is \(x+8\), and \(5+8=13\). $19 uses the first rate for all 5 GB (\(3\cdot5+4\)). $9 forgets the flat fee (\(6+3\)). $15 is \(4+6+5\): it charges $1 for all 5 GB after already counting the first 2.`,
        hint: 'First find the cost at the breakpoint, 2 GB. Then add $1 for each GB beyond 2.' },
      { q: 'Dana rewrites |x − 3| as two pieces: "x − 3 when x ≥ 0, and 3 − x when x < 0". Which statement about her answer is true?',
        choices: ['It is correct, because |x| changes rule at 0.', 'It is wrong, because |x − 3| = x − 3 for every x.', 'It is wrong, because 3 − x should be x + 3.', 'It is wrong, because the rule changes where x − 3 changes sign, at x = 3, not at 0.'], answer: 3,
        why: String.raw`The expression inside the bars is \(x-3\), and it changes sign at \(x=3\). So \(|x-3|=x-3\) for \(x\ge 3\) and \(3-x\) for \(x&lt;3\). Test \(x=1\): \(|1-3|=2\), but Dana's first rule gives \(1-3=-2\), and a distance cannot be negative. The split at 0 only works for \(|x|\), with nothing subtracted inside.`,
        hint: 'Try x = 1 in both the original and in Dana\'s first rule. Where does x − 3 change from negative to positive?' }
    ],
    links: { prereq: ['absolute-value-equations-and-inequalities', 'what-is-a-function', 'domain-and-range-of-functions'], related: ['functions-as-transformations', 'slope-and-linear-functions', 'forms-of-a-linear-equation', 'sequences-recursive-and-explicit', 'exponential-growth'] },

    mount({ stage, controls: C }) {
      const st = { scene: 'taxi', x: 2, pred: false, a: 2, m1: 4, b1: 0, m2: 1, b2: 0, task: 0, meet: 0, pre: 0, dp: 0, va: 2, vk: 1, practice: false };
      let cancel = () => {};
      const panel = stage.nextElementSibling;
      const P = new Plane(stage, { cx: 0, cy: 0, span: 5 });
      let evStage = 0, evRule = null, evWrong = new Set(), evFb = '', bFb = '', drStage = 0, drFb = '';
      let prIdx = 0, prSolved = false, prTried = false, prFirst = 0, prDone = 0, prOver = false, prPv = null;
      const DEFX = { taxi: 2, eval: 3, step: 2.5, dr: 2, abs: 3, build: 0 };

      /* the current scene: pieces, axes and extras, from the state */
      const scene = () => {
        if (st.practice) {
          const pr = PROBS[prIdx], o = pr.sc(prPv, prSolved);
          return Object.assign({ view: pr.view, xl: pr.xl, yl: pr.yl, lab: pr.lab, useX: 0, bp: null, money: 0 }, o, { marks: prSolved && pr.marks ? pr.marks : [] });
        }
        switch (st.scene) {
          case 'taxi': return { pieces: TAXI, view: { xa: 0, xb: 10, ya: 0, yb: 20, gx: 1, gy: 4 }, xl: 'miles driven (x)', yl: 'cost in dollars', lab: 2, useX: 1, bp: 3, money: 1,
            hline: st.pred ? { y: 18, t: 'twice the cost of 3 miles: $18' } : null, marks: [] };
          case 'eval': return { pieces: EVAL, view: { xa: -3, xb: 7, ya: -6, yb: 8, gx: 1, gy: 2 }, xl: 'x', yl: 'f(x)', lab: 2, useX: 1, bp: 3, money: 0, hideVal: evStage < 2, marks: [] };
          case 'build': {
            const T = TASKS[st.task], a = st.a;
            const pieces = [pcs(0, a, st.m1, st.b1, 1, 1, { n: 'Piece 1' }), pcs(a, 8, st.m2, st.b2, 0, 1, { n: 'Piece 2' })];
            return { pieces, view: { xa: 0, xb: 8, ya: 0, yb: T.yb, gx: 1, gy: T.gy }, xl: T.unit === 'hours' ? 'hours (x)' : 'GB used (x)', yl: 'cost in dollars', lab: 1, useX: 0, bp: a, money: 1,
              gap: { x: a, y0: st.m1 * a + st.b1, y1: st.m2 * a + st.b2 }, marks: [] };
          }
          case 'step': { const S = STEPS[st.pre]; return { pieces: stepPieces(st.pre), view: S.view, xl: S.xl, yl: S.yl, lab: 0, useX: 1, bp: null, money: 1, marks: [] }; }
          case 'dr': {
            const D = DRP[st.dp];
            return { pieces: D.pieces(), view: D.view, xl: D.xl, yl: D.yl, lab: D.lab, useX: 1, bp: null, money: st.dp === 1 || st.dp === 3 || st.dp === 4 ? 1 : 0, marks: [],
              dom: drStage >= 1 ? D.dom : null, ran: drStage >= 2 ? D.ran : null };
          }
          default: {  /* abs */
            const a = st.va, k = st.vk, inner = a === 0 ? 'x' : `(x${sub(a)})`, kt = k === 0 ? '' : ` + ${k}`;
            return { pieces: [pcs(-INF, a, -1, a + k, 0, 0, { n: 'Piece 1', u: `−${inner}${kt}` }), pcs(a, INF, 1, k - a, 1, 0, { n: 'Piece 2', u: `${inner}${kt}` })],
              view: { xa: -6, xb: 6, ya: -1, yb: Math.max(8, 7 + Math.abs(a) + k), gx: 1, gy: 1 }, xl: 'x', yl: 'f(x)', lab: 2, useX: 1, bp: a, money: 0, dist: 1, marks: [] };
          }
        }
      };

      /* layout: plot rectangle and the maps between math and pixels */
      const geom = p => {
        const sc = scene(), v = sc.view, fs = clamp(p.w / 28, 12, 15);
        const L = fs * 3 + 12, R = 18, T = fs * 2.9 + 8, B = fs * 3 + 6;
        const W = Math.max(40, p.w - L - R), H = Math.max(40, p.h - T - B);
        return { sc, v, fs, L, R, T, B, W, H,
          px: x => L + (x - v.xa) / (v.xb - v.xa) * W, py: y => T + H - (y - v.ya) / (v.yb - v.ya) * H,
          ix: q => v.xa + (q - L) / W * (v.xb - v.xa), iy: q => v.ya + (T + H - q) / H * (v.yb - v.ya) };
      };
      P.toMath = (qx, qy) => { const g = geom(P); return [g.ix(qx), g.iy(qy)]; };

      const xRange = () => ({ taxi: [0, 10, .5], eval: [-2, 6, 1], step: [0, 5, .01], dr: [-3, 5, .5], abs: [-6, 6, .5] })[st.scene];
      const movable = () => !st.practice && ['taxi', 'eval', 'step', 'dr', 'abs'].includes(st.scene) && (st.scene !== 'taxi' || st.pred);
      const curVal = sc => (sc.useX ? fAt(sc.pieces, st.x) : null);

      /* ----- the picture ----- */
      P.onDraw = (c, p) => {
        const pal = p.pal, g = geom(p), v = g.v, sc = g.sc, fs = g.fs, { L, T, W, H } = g;
        const font = (s, w) => `${w || 500} ${s}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`;
        const txt = (s, x, y, o = {}) => {
          c.font = font(o.size || fs, o.w); c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
          if (o.halo !== false) { c.lineWidth = 4; c.strokeStyle = pal.stage; c.lineJoin = 'round'; c.strokeText(s, x, y); }
          c.fillStyle = o.color || pal.text; c.fillText(s, x, y);
        };
        /* grid and axes */
        c.lineWidth = 1; c.strokeStyle = pal.grid; c.beginPath();
        for (let x = Math.ceil(v.xa / v.gx) * v.gx; x <= v.xb + 1e-9; x += v.gx) { c.moveTo(g.px(x), T); c.lineTo(g.px(x), T + H); }
        for (let y = Math.ceil(v.ya / v.gy) * v.gy; y <= v.yb + 1e-9; y += v.gy) { c.moveTo(L, g.py(y)); c.lineTo(L + W, g.py(y)); }
        c.stroke();
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.6; c.beginPath();
        if (v.xa < 0 && v.xb > 0) { c.moveTo(g.px(0), T); c.lineTo(g.px(0), T + H); }
        if (v.ya < 0 && v.yb > 0) { c.moveTo(L, g.py(0)); c.lineTo(L + W, g.py(0)); }
        c.rect(L, T, W, H); c.stroke();
        /* tick labels on the frame */
        const tk = (s, a) => (a < 0 ? MI : '') + (+Math.abs(a).toFixed(2));
        const kx = Math.max(1, Math.ceil((fs * 2.6) / (W / (v.xb - v.xa) * v.gx))), ky = Math.max(1, Math.ceil((fs * 1.9) / (H / (v.yb - v.ya) * v.gy)));
        for (let i = Math.ceil(v.xa / v.gx); i * v.gx <= v.xb + 1e-9; i++) if (i % kx === 0) txt(tk('', i * v.gx), g.px(i * v.gx), T + H + fs * 1.1, { color: pal.muted, halo: false });
        for (let i = Math.ceil(v.ya / v.gy); i * v.gy <= v.yb + 1e-9; i++) if (i % ky === 0) txt(tk('', i * v.gy), L - 11, g.py(i * v.gy), { color: pal.muted, align: 'right', halo: false });
        txt(sc.xl, L + W / 2, p.h - fs * .8, { color: pal.muted, halo: false });
        txt(sc.yl, 6, T - fs * .85, { color: pal.muted, align: 'left', halo: false });
        /* legend for the two kinds of ends */
        const r0 = clamp(fs * .42, 5, 7);
        [['closed dot: the value is used', 1], ['open circle: the value is not used', 0]].forEach(([s, cl], i) => {
          const y = 5 + fs * (.7 + i * 1.3); c.font = font(fs); const w = c.measureText(s).width, xr = p.w - 30;
          txt(s, xr, y, { align: 'right', halo: false, color: pal.muted });
          c.beginPath(); c.arc(xr - w - r0 - 6, y, r0, 0, TAU); c.fillStyle = cl ? pal.muted : pal.stage; c.fill(); c.strokeStyle = pal.muted; c.lineWidth = 2; c.stroke();
        });
        /* pieces */
        const act = sc.useX ? idxAt(sc.pieces, st.x) : -1;
        const two = sc.pieces.length === 2, colOf = (pc, i) => (pc.k != null ? [pal.blue, pal.red][pc.k] : two ? [pal.blue, pal.red][i] : pal.blue);
        c.save(); c.beginPath(); c.rect(L, T, W, H); c.clip();
        if (sc.bp != null) {
          c.setLineDash([6, 6]); c.strokeStyle = pal.muted; c.lineWidth = 1.5; c.beginPath(); c.moveTo(g.px(sc.bp), T); c.lineTo(g.px(sc.bp), T + H); c.stroke(); c.setLineDash([]);
        }
        if (sc.hline) { c.setLineDash([6, 6]); c.strokeStyle = pal.yellow; c.lineWidth = 2; c.beginPath(); c.moveTo(L, g.py(sc.hline.y)); c.lineTo(L + W, g.py(sc.hline.y)); c.stroke(); c.setLineDash([]); }
        const drawLine = (pc, i, isAct) => {
          if (pc.l === pc.r) return;
          const xs = Math.max(pc.l, v.xa), xe = Math.min(pc.r, v.xb); if (xs >= xe) return;
          c.globalAlpha = act >= 0 && !isAct ? .5 : 1; c.strokeStyle = colOf(pc, i); c.lineWidth = isAct ? 6 : 3.6; c.lineCap = 'round';
          c.beginPath(); c.moveTo(g.px(xs), g.py(val(pc, xs))); c.lineTo(g.px(xe), g.py(val(pc, xe))); c.stroke(); c.globalAlpha = 1;
        };
        sc.pieces.forEach((pc, i) => { if (i !== act) drawLine(pc, i, false); });
        if (act >= 0) drawLine(sc.pieces[act], act, true);
        c.restore();
        /* the gap at the breakpoint */
        if (sc.gap) {
          const gp = sc.gap, d = gp.y1 - gp.y0;
          if (Math.abs(d) > 1e-9) {
            c.setLineDash([5, 5]); c.strokeStyle = pal.violet; c.lineWidth = 4; c.beginPath(); c.moveTo(g.px(gp.x), g.py(gp.y0)); c.lineTo(g.px(gp.x), g.py(gp.y1)); c.stroke(); c.setLineDash([]);
            txt(`gap ${sc.money ? usd(Math.abs(d)) : num(Math.abs(d))}`, g.px(gp.x) + 9, (g.py(gp.y0) + g.py(gp.y1)) / 2, { align: 'left', color: pal.violet, w: 600 });
          } else if (sc.lab === 1) {
            c.beginPath(); c.arc(g.px(gp.x), g.py(gp.y0), 12, 0, TAU); c.strokeStyle = pal.yellow; c.lineWidth = 3; c.stroke();
            txt('pieces meet: gap 0', g.px(gp.x) + 16, g.py(gp.y0) + fs * 1.5, { align: 'left', color: pal.text, w: 600 });
          }
        }
        /* end markers: open circles first, closed dots on top */
        const r1 = clamp(p.w / 60, 5, 7.5), inV = (x, y) => x >= v.xa - 1e-9 && x <= v.xb + 1e-9 && y >= v.ya - 1e-9 && y <= v.yb + 1e-9;
        const ends = [];
        sc.pieces.forEach((pc, i) => {
          if (pc.l === pc.r) { if (inV(pc.l, val(pc, pc.l))) ends.push([pc.l, val(pc, pc.l), 1, colOf(pc, i)]); return; }
          if (isFinite(pc.l) && inV(pc.l, val(pc, pc.l))) ends.push([pc.l, val(pc, pc.l), pc.lc, colOf(pc, i)]);
          if (isFinite(pc.r) && inV(pc.r, val(pc, pc.r))) ends.push([pc.r, val(pc, pc.r), pc.rc, colOf(pc, i)]);
        });
        ends.sort((a, b) => a[2] - b[2]).forEach(([x, y, cl, col]) => {
          c.beginPath(); c.arc(g.px(x), g.py(y), r1, 0, TAU);
          c.fillStyle = cl ? col : pal.stage; c.fill(); c.strokeStyle = col; c.lineWidth = cl ? 2 : 2.8; c.stroke();
        });
        /* piece labels */
        if (sc.lab) sc.pieces.forEach((pc, i) => {
          if (pc.l === pc.r) return;
          const xs = Math.max(pc.l, v.xa), xe = Math.min(pc.r, v.xb), mx = (xs + xe) / 2, s = sc.lab === 2 ? (p.w < 560 ? rt(pc.m, pc.c) : `${rt(pc.m, pc.c)} for ${cond(pc)}`) : `${pc.n}: ${rt(pc.m, pc.c)}`;
          c.font = font(fs, 600); const w = c.measureText(s).width, qx = clamp(g.px(mx) + 6, L + 4, p.w - 6 - w);
          txt(s, qx, g.py(val(pc, mx)) + (pc.m < 0 ? -fs * 1.7 : fs * 1.7), { align: 'left', color: colOf(pc, i), w: 600 });
        });
        /* marks */
        (sc.marks || []).forEach(([x, y, s]) => {
          c.beginPath(); c.arc(g.px(x), g.py(y), r1 + 2, 0, TAU); c.fillStyle = pal.yellow; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 2; c.stroke();
          txt(s, clamp(g.px(x), L + 30, p.w - 40), g.py(y) - fs * 1.4, { w: 600 });
        });
        /* the domain and range bars */
        const bar = (spans, horiz, col, name) => {
          c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 5; c.lineCap = 'butt';
          spans.forEach(([lo, hi]) => {
            const a = horiz ? Math.max(lo, v.xa) : Math.max(lo, v.ya), b = horiz ? Math.min(hi, v.xb) : Math.min(hi, v.yb);
            if (a > b) return;
            if (horiz) { const y = T + H - 7; if (a === b) { c.beginPath(); c.arc(g.px(a), y, 5, 0, TAU); c.fill(); } else { c.beginPath(); c.moveTo(g.px(a), y); c.lineTo(g.px(b), y); c.stroke(); } }
            else { const x = L + 7; if (a === b) { c.beginPath(); c.arc(x, g.py(a), 5, 0, TAU); c.fill(); } else { c.beginPath(); c.moveTo(x, g.py(a)); c.lineTo(x, g.py(b)); c.stroke(); } }
          });
          if (horiz) txt('domain', L + W - 6, T + H - 7 - fs * 1.2, { align: 'right', color: col, w: 600 }); else txt('range', L + 14, T + fs * 1.1, { align: 'left', color: col, w: 600 });
        };
        if (sc.dom) bar(sc.dom, true, pal.green);
        if (sc.ran) bar(sc.ran, false, pal.red);
        /* the input marker: distance bracket, guides, dot */
        if (sc.useX && !st.practice) {
          const x = st.x, f = curVal(sc), shown = f != null && !sc.hideVal;
          if (sc.dist) {
            const y = g.py(v.ya) - 10; c.strokeStyle = pal.green; c.lineWidth = 4; c.beginPath(); c.moveTo(g.px(x), y); c.lineTo(g.px(st.va), y); c.stroke();
            txt(`distance ${num(Math.abs(x - st.va))}`, (g.px(x) + g.px(st.va)) / 2, y - fs * 1.1, { color: pal.green, w: 600 });
          }
          c.setLineDash([4, 5]); c.strokeStyle = pal.muted; c.lineWidth = 1.5; c.beginPath(); c.moveTo(g.px(x), g.py(v.ya));
          c.lineTo(g.px(x), shown ? g.py(f) : g.py(v.ya)); if (shown) c.lineTo(L, g.py(f)); c.stroke(); c.setLineDash([]);
          if (shown) {
            c.beginPath(); c.arc(g.px(x), g.py(f), 9, 0, TAU); c.fillStyle = pal.yellow; c.fill(); c.strokeStyle = movable() ? pal.brass : pal.stage; c.lineWidth = 3; c.stroke();
            const lt = sc.money ? `x = ${num(x)}: ${usd(f)}` : `f(${num(x)}) = ${num(f)}`, ap = sc.pieces[idxAt(sc.pieces, x)]; c.font = font(fs, 700);
            const lw = c.measureText(lt).width, side = ap.m < 0 ? 1 : ap.m > 0 ? -1 : 0;
            txt(lt, clamp(g.px(x) + side * (lw / 2 + 14), L + lw / 2 + 4, p.w - lw / 2 - 8), g.py(f) - fs * 1.3, { w: 700 });
          } else {
            c.beginPath(); c.arc(g.px(x), g.py(v.ya), 9, 0, TAU); c.fillStyle = f == null && sc.hideVal !== true ? pal.stage : pal.yellow; c.fill(); c.strokeStyle = movable() ? pal.brass : pal.stage; c.lineWidth = 3; c.stroke();
            txt(f == null ? `x = ${num(x)}: no point here` : `x = ${num(x)}`, clamp(g.px(x), L + 70, p.w - 76), g.py(v.ya) - fs * 1.8, { color: f == null ? pal.red : pal.text, w: 600 });
          }
        }
        c.globalAlpha = 1;
      };

      /* ----- panel helpers ----- */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const S = o => { const s = C.slider(o); s.inp = panel.lastElementChild.querySelector('input'); return s; };
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const addTo = (...els) => panel.append(...els);
      const edit = fn => v => { cancel(); fn(v); sync(); };
      const unitOf = { taxi: ' miles', eval: '', step: ' hours', dr: '', abs: '' };
      const xfmt = u => v => num(+v.toFixed(2)) + u;

      let selScene, predTitle, predQ, predRow, predFb, xT, xE, ruleTitle, ruleRow, valTitle, valRow, evOut;
      let selTask, bStory, aS, m1S, b1S, m2S, b2S, meetT, bCheck, bOut, selPre, xP, qbRow, selDp, xD, drTitle, drQ, drRow, drOut, vaS, vkS, xA, ro;
      let startBtn, ptally, pq, pch, pfb, pnext;

      grp('scene', () => {
        C.title('Scene');
        selScene = C.select({ label: 'Choose a scene', options: [['taxi', 'A taxi story'], ['eval', 'Notation and open circles'], ['build', 'Build a piecewise graph'], ['step', 'Step functions'], ['dr', 'Domain and range'], ['abs', 'Absolute value as pieces']].map(([value, label]) => ({ value, label })), value: 'taxi',
          onChange: v => { cancel(); loadScene(v); sync(); } });
      });
      /* taxi: predict, then the slider */
      grp('taxi', () => {
        predTitle = h('p', { class: 'ctl-title' }, 'Predict first');
        predQ = h('p', { class: 'hint' }, '3 miles costs $9. Will 6 miles cost more than twice that ($18), exactly $18, or less than $18?');
        predRow = h('div', { class: 'ctl buttons' });
        predFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        addTo(predTitle, predQ, predRow, predFb);
        xT = S({ label: 'Miles driven', min: 0, max: 10, step: .5, value: 2, format: xfmt(' miles'), onInput: edit(v => { st.x = v; }) });
      });
      const PRED = [
        ['More than $18', 'Even if the $2 rate lasted all 6 miles, the cost would be 3 + 2 × 6 = $15, under $18. The $3 flag fall is paid once, and the rate drops after 3 miles, so the cost is even less: 6 miles costs $12.'],
        ['Exactly $18', 'Doubling the miles does not double the cost: the $3 flag fall is paid only once, and the rate drops from $2 to $1 after 3 miles. 6 miles costs 9 + 3 = $12, less than $18.'],
        ['Less than $18', good('Yes.') + ' 6 miles costs 9 + 3 × 1 = $12. The flag fall is paid once and the rate drops, so the cost grows more slowly than the miles. The dashed line marks $18. Now drag the dot to 6 and see.']];
      const renderPred = () => {
        predRow.replaceChildren();
        PRED.forEach((o, i) => predRow.append(mkBtn(o[0], () => {
          if (st.pred) return; st.pred = true;
          Array.from(predRow.children).forEach((b, j) => { b.disabled = true; if (j === i) b.classList.add('primary'); });
          predFb.innerHTML = (i === 2 ? '' : bad('Not quite.') + ' ') + o[1];
          sync();
        })));
        if (st.pred) { Array.from(predRow.children).forEach(b => { b.disabled = true; }); predFb.innerHTML = PRED[2][1]; }
      };
      /* eval: choose the rule, then the value */
      grp('eval', () => {
        xE = S({ label: 'Input x', min: -2, max: 6, step: 1, value: 3, format: xfmt(''), onInput: edit(v => { st.x = v; evReset(); }) });
        ruleTitle = h('p', { class: 'ctl-title' }, 'Step 1: which rule?');
        ruleRow = h('div', { class: 'ctl buttons' });
        valTitle = h('p', { class: 'ctl-title' }, 'Step 2: what value?');
        valRow = h('div', { class: 'ctl buttons' });
        evOut = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        addTo(ruleTitle, ruleRow, valTitle, valRow, evOut);
      });
      const evReset = () => { evStage = 0; evRule = null; evFb = ''; evWrong = new Set(); renderEval(); };
      const EVR = ['f(x) = 2x  (x < 3)', 'f(x) = x + 1  (x ≥ 3)'];
      const renderEval = () => {
        const x = st.x, right = x < 3 ? 0 : 1, wrong = 1 - right, v = val(EVAL[right], x), ov = val(EVAL[wrong], x);
        ruleRow.replaceChildren(); valRow.replaceChildren();
        EVR.forEach((s, i) => { const b = mkBtn(s, () => {
          if (evStage > 0) return;
          const cm = x < 3 ? `${num(x)} is less than 3` : x === 3 ? '3 equals 3, and the rule for x ≥ 3 includes 3' : `${num(x)} is greater than 3`;
          if (i === right) { evStage = 1; evRule = i; evFb = good('Right.') + ` ${cm}, so use ${EVR[right]}. Now find the value.`; }
          else evFb = bad('Not quite.') + ` ${cm}, so the rule ${EVR[right].split('  ')[0]} applies, not ${EVR[i].split('  ')[0]}.` + (x === 3 ? ' The rule 2x is only for x < 3, and the open circle at (3, 6) says that point is not used.' : '') + (v === ov ? ` (Both rules happen to give ${num(v)} here, but only one is the rule for this x.)` : '') + ' Try the other one.';
          if (i !== right) evWrong.add('r' + i);
          renderEval(); sync(); }); ruleRow.append(b); if (evStage > 0 || evWrong.has('r' + i)) b.disabled = true; if (evRule === i) b.classList.add('primary'); });
        if (evStage >= 1) {
          const opts = []; [v, ov, v + 2, v - 2].forEach(q => { if (!opts.includes(q)) opts.push(q); });
          opts.slice(0, 3).sort((a, b) => a - b).forEach(q => { const b = mkBtn(`f(${num(x)}) = ${num(q)}`, () => {
            if (evStage > 1) return;
            if (q === v) { evStage = 2; evFb = good('Right.') + ` f(${num(x)}) = ${evT(EVAL[right], x)} = ${num(v)}. ` + (x === 3 ? 'The closed dot at (3, 4) is on the graph. The open circle at (3, 6) is not.' : `The dot (${num(x)}, ${num(v)}) is on the graph now.`); }
            else { evFb = bad('Not quite.') + (q === ov && v !== ov ? ` ${num(q)} is what the OTHER rule gives at ${num(x)}.` : ` Work it out with ${EVR[right].split('  ')[0]}: ${evT(EVAL[right], x)}.`) + ' Try another value.'; evWrong.add('v' + q); }
            renderEval(); sync(); }); valRow.append(b); if (evWrong.has('v' + q)) b.disabled = true; if (evStage > 1) { b.disabled = true; if (q === v) b.classList.add('primary'); } });
        }
        evOut.innerHTML = evFb;
      };
      /* build */
      grp('build', () => {
        C.title('Your graph');
        selTask = C.select({ label: 'Situation', options: TASKS.map((t, i) => ({ value: String(i), label: t.name })), value: '0', onChange: v => { cancel(); st.task = +v; resetBuild(); sync(); } });
        bStory = h('p', { class: 'hint' });
        addTo(bStory);
        aS = S({ label: 'Breakpoint (the rule changes after this x)', min: 1, max: 7, step: 1, value: 2, format: v => 'x = ' + v, onInput: edit(v => { st.a = v; bChange(); }) });
        m1S = S({ label: 'Piece 1: slope', min: 0, max: 6, step: 1, value: 4, format: v => String(v), onInput: edit(v => { st.m1 = v; bChange(); }) });
        b1S = S({ label: 'Piece 1: intercept', min: 0, max: 24, step: 1, value: 0, format: v => String(v), onInput: edit(v => { st.b1 = v; bChange(); }) });
        m2S = S({ label: 'Piece 2: slope', min: 0, max: 6, step: 1, value: 1, format: v => String(v), onInput: edit(v => { st.m2 = v; bChange(); }) });
        b2S = S({ label: 'Piece 2: intercept', min: -12, max: 24, step: 1, value: 0, format: v => String(v), onInput: edit(v => { st.b2 = v; bChange(); }) });
        meetT = C.toggle({ label: 'Make the pieces meet (sets the Piece 2 intercept)', value: false, onChange: v => { cancel(); st.meet = v ? 1 : 0; bChange(); sync(); } });
        bCheck = C.buttons([{ label: 'Check my graph', primary: true, onClick: () => { doBuildCheck(); sync(); } }])[0];
        bOut = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        addTo(bOut);
      });
      const bChange = () => { if (st.meet) st.b2 = st.m1 * st.a + st.b1 - st.m2 * st.a; bFb = ''; };
      const resetBuild = () => { Object.assign(st, { a: 2, m1: 4, b1: 0, m2: 1, b2: 0, meet: 0 }); bFb = ''; };
      const buildVal = x => (x <= st.a ? st.m1 * x + st.b1 : st.m2 * x + st.b2);
      const doBuildCheck = () => {
        const T = TASKS[st.task]; let mis = null;
        for (let x = 0; x <= 8; x += 0.25) if (Math.abs(buildVal(x) - T.f(x)) > 1e-9) { mis = x; break; }
        if (mis == null) {
          const A = T.ans;
          bFb = good('Right.') + ` The cost is f(x) = ${rt(A.m1, A.b1)} for 0 ≤ x ≤ ${A.a}, and f(x) = ${rt(A.m2, A.b2)} for x > ${A.a}. At x = ${A.a} the first piece gives ${usd(A.m1 * A.a + A.b1)} and the second gives ${usd(A.m2 * A.a + A.b2)}: the same, so the pieces meet and the gap is 0. The story has no jump.`;
        } else {
          const pcN = mis <= st.a ? 'Piece 1' : 'Piece 2';
          const h1 = T.hints.find(([k]) => st[k] !== T.ans[k]);
          bFb = bad('Not yet.') + ` At x = ${mis} the story gives ${usd(T.f(mis))}, but your graph gives ${usd(buildVal(mis))} (it uses ${pcN} there). ` + (h1 ? h1[1] : '');
        }
      };
      /* step functions */
      grp('step', () => {
        selPre = C.select({ label: 'Situation', options: STEPS.map((s, i) => ({ value: String(i), label: s.name })), value: '0', onChange: v => { cancel(); st.pre = +v; st.x = 2.5; sync(); } });
        xP = S({ label: 'Time', min: 0, max: 5, step: .01, value: 2.5, format: xfmt(' hours'), onInput: edit(v => { st.x = v; }) });
        C.hint('Quick values:');
        qbRow = C.buttons([2, 2.5, 3, 3.01].map(q => ({ label: 'x = ' + q, onClick: () => { cancel(); st.x = q; sync(); } })));
      });
      /* domain and range */
      grp('dr', () => {
        selDp = C.select({ label: 'Graph', options: DRP.map((s, i) => ({ value: String(i), label: s.name })), value: '0', onChange: v => { cancel(); st.dp = +v; drStage = 0; drFb = ''; renderDr(); sync(); } });
        xD = S({ label: 'Test an input x', min: -3, max: 5, step: .5, value: 2, format: xfmt(''), onInput: edit(v => { st.x = v; }) });
        drTitle = h('p', { class: 'ctl-title' }); drQ = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        drRow = h('div', { class: 'ctl buttons' }); drOut = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        addTo(drTitle, drQ, drRow, drOut);
      });
      const renderDr = () => {
        const D = DRP[st.dp];
        drRow.replaceChildren();
        if (drStage >= 2) { drTitle.textContent = 'Domain and range'; drQ.textContent = 'Both found. Pick another graph, or test inputs with the slider.'; drOut.innerHTML = drFb; return; }
        const [q, opts, ans] = drStage === 0 ? D.dq : D.rq;
        drTitle.textContent = drStage === 0 ? 'Domain: read along the bottom' : 'Range: read up the side';
        drQ.textContent = q;
        opts.forEach((o, i) => drRow.append(mkBtn(o[0], () => {
          if (i === ans) {
            drFb = good('Right.') + ' ' + o[1].replace(/^Yes\. /, '') + (drStage === 0 ? ' Now the range.' : ' The green bar is the domain and the red bar is the range.');
            drStage++; renderDr(); sync();
          } else { drFb = bad('Not quite.') + ' ' + o[1] + ' Try another answer.'; drOut.innerHTML = drFb; drRow.children[i].disabled = true; }
        })));
        drOut.innerHTML = drFb;
      };
      /* absolute value */
      grp('abs', () => {
        vaS = S({ label: 'Corner a (where x − a changes sign)', min: -3, max: 3, step: 1, value: 2, format: v => 'a = ' + v, onInput: edit(v => { st.va = v; }) });
        vkS = S({ label: 'Lift k', min: 0, max: 3, step: 1, value: 1, format: v => 'k = ' + v, onInput: edit(v => { st.vk = v; }) });
        xA = S({ label: 'Input x', min: -6, max: 6, step: .5, value: 3, format: xfmt(''), onInput: edit(v => { st.x = v; }) });
      });
      grp('ro', () => { ro = C.readout(); });

      const loadScene = v => {
        st.scene = v; st.x = DEFX[v]; selScene.value = v;
        if (v === 'eval') evReset();
        if (v === 'dr') { drStage = 0; drFb = ''; renderDr(); }
        if (v === 'build') { bFb = ''; }
      };

      /* readouts */
      const info = () => {
        const sc = scene(), x = st.x, L = [];
        if (st.scene === 'build') {
          const T = TASKS[st.task], a = st.a, y0 = st.m1 * a + st.b1, y1 = st.m2 * a + st.b2, d = y1 - y0;
          L.push(`${kk('Piece 1')} f(x) = ${rt(st.m1, st.b1)} for 0 ≤ x ≤ ${a}`, `${kk('Piece 2')} f(x) = ${rt(st.m2, st.b2)} for ${a} < x ≤ 8`,
            `${kk('At x = ' + a)} Piece 1 gives ${usd(y0)}, Piece 2 gives ${usd(y1)}`);
          L.push(d === 0 ? good('Gap 0: the pieces meet.') + ' No jump.' : bad(`Gap ${usd(Math.abs(d))}.`) + ` The cost would jump ${d > 0 ? 'up' : 'down'} by ${usd(Math.abs(d))} at x = ${a}.`);
          if (st.meet) L.push('The Piece 2 intercept is set so that both pieces give the same value at the breakpoint.');
          return L.join('<br>');
        }
        const pi = idxAt(sc.pieces, x), pc = sc.pieces[pi];
        if (st.scene === 'taxi') {
          if (!st.pred) return 'Make your prediction first. Then the slider and the dot unlock.';
          L.push(`${kk('Input')} x = ${num(x)} miles`, `${kk('Rule in use')} ${pc.n}: f(x) = ${rt(pc.m, pc.c)}, because ${cond(pc)}`, `${kk('Cost')} f(${num(x)}) = ${evT(pc, x)} = <b>${usd(val(pc, x))}</b>`,
            kk('Domain') + ' 0 ≤ x ≤ 10 miles. ' + kk('Range') + ' from $3 to $16.');
        } else if (st.scene === 'eval') {
          L.push(`${kk('Input')} x = ${num(x)}`, `${kk('Rules')} f(x) = 2x for x < 3, and f(x) = x + 1 for x ≥ 3`);
          L.push(evStage === 2 ? `${kk('Value')} f(${num(x)}) = ${evT(pc, x)} = <b>${num(val(pc, x))}</b>` : 'Choose the rule, then the value, in the panel.');
          L.push(kk('Domain') + ' every real number. ' + kk('Range') + ' every real number.');
        } else if (st.scene === 'step') {
          const S2 = STEPS[st.pre], v0 = val(pc, x), [x2, w] = S2.cmp(x);
          L.push(`${kk('Input')} x = ${num(x)} hours`, `${kk('Why')} ${S2.expl(x)}`, `${kk('Cost')} f(${num(x)}) = ${S2.calc(x)} = <b>${usd(v0)}</b>`);
          const f2 = fAt(sc.pieces, +x2.toFixed(2));
          if (Number.isInteger(x) && x > 0 && x < 5 && f2 != null) L.push(`${kk('Compare')} ${w} ${num(x)}, at x = ${num(+x2.toFixed(2))}, the cost is ${usd(f2)}. ` + (f2 !== v0 ? bad('It jumps here.') : 'No jump on this side.'));
          L.push(S2.dr);
        } else if (st.scene === 'dr') {
          const D = DRP[st.dp], f = fAt(sc.pieces, x);
          L.push(D.info, `${kk('Test')} x = ${num(x)}: ` + (f == null ? bad('No point at that x.') + ' ' + (D.bad || 'That x is outside the domain: the graph has nothing above or below it.') : good('f(' + num(x) + ') = ' + num(f) + '.') + ' ' + (D.ok || 'That x is in the domain.')));
        } else {
          const a = st.va, k = st.vk;
          L.push(`${kk('Input')} x = ${num(x)}. Distance from x to ${num(a)}: |${num(x)} ${a < 0 ? '+' : '−'} ${par(Math.abs(a))}| = <b>${num(Math.abs(x - a))}</b>`,
            `${kk('Rule in use')} ${pc.n}, for ${cond(pc)}: f(x) = ${pc.u}${pc.u === rt(pc.m, pc.c) ? '' : ' = ' + rt(pc.m, pc.c)}`,
            `${kk('Value')} f(${num(x)}) = ${evT(pc, x)} = <b>${num(val(pc, x))}</b>`,
            `${kk('The two pieces')} f(x) = ${sc.pieces[0].u} for x < ${num(a)}, and f(x) = ${sc.pieces[1].u} for x ≥ ${num(a)}`,
            kk('Domain') + ' every real number. ' + kk('Range') + ` y ≥ ${k}.`);
        }
        return L.join('<br>');
      };

      /* ----- practice ----- */
      C.title('Practice');
      C.hint('Eight short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); if (st.practice) { st.practice = false; sync(); } else { st.practice = true; if (!prOver) loadProb(); sync(); } } }])[0];
      grp('practice', () => {
        ptally = h('p', { class: 'ctl-title' });
        pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        pch = h('div', { class: 'ctl buttons' });
        pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pnext = mkBtn('Next problem', () => nextProb(), true);
        addTo(ptally, pq, pch, pfb, h('div', { class: 'ctl buttons' }, pnext));
      });
      const tally = () => { ptally.textContent = `Problem ${prIdx + 1} of ${PROBS.length}. Right on the first try: ${prFirst} of ${prDone} done`; };
      const loadProb = () => {
        const pr = PROBS[prIdx]; prSolved = false; prTried = false; prPv = null;
        pq.textContent = pr.q; pfb.innerHTML = ''; pch.replaceChildren(); pnext.disabled = true; pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        pr.ch.forEach((o, i) => pch.append(mkBtn(o[0], () => pick(i))));
        tally();
      };
      const pick = i => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        const right = i === pr.ans, btn = pch.children[i], txt = pr.ch[i][1];
        if (pr.pv) prPv = pr.pv[i];
        if (right) {
          prSolved = true; if (!prTried) prFirst++; prDone++; Array.from(pch.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary');
          pfb.innerHTML = good('Right.') + ' ' + txt; pnext.disabled = false;
        } else { prTried = true; btn.disabled = true; pfb.innerHTML = bad('Not quite.') + ' ' + txt + ' Try another answer.'; }
        tally(); sync();
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); sync(); return; }
        prOver = true; prSolved = true; prPv = null;
        pq.textContent = `All ${PROBS.length} problems are done.`; pch.replaceChildren(); pnext.disabled = true;
        pfb.innerHTML = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        pch.append(mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; prOver = false; loadProb(); sync(); }, true));
        ptally.textContent = `Right on the first try: ${prFirst} of ${PROBS.length}`; sync();
      };

      /* ----- sync ----- */
      const sync = () => {
        const prac = st.practice, s = st.scene;
        vis(G.scene, !prac); vis(G.taxi, !prac && s === 'taxi'); vis(G.eval, !prac && s === 'eval'); vis(G.build, !prac && s === 'build');
        vis(G.step, !prac && s === 'step'); vis(G.dr, !prac && s === 'dr'); vis(G.abs, !prac && s === 'abs'); vis(G.ro, !prac); vis(G.practice, prac);
        if (!prac && s === 'taxi') { xT.set(st.x); xT.inp.disabled = !st.pred; }
        xE.set(st.x); xP.set(st.x); xD.set(st.x); xA.set(st.x);
        aS.set(st.a); m1S.set(st.m1); b1S.set(st.b1); m2S.set(st.m2); b2S.set(st.b2); b2S.inp.disabled = !!st.meet; meetT.checked = !!st.meet;
        vaS.set(st.va); vkS.set(st.vk);
        selTask.value = String(st.task); selPre.value = String(st.pre); selDp.value = String(st.dp); selScene.value = st.scene;
        bStory.textContent = TASKS[st.task].story;
        qbRow.forEach(b => b.classList.toggle('primary', b.textContent === 'x = ' + num(st.x)));
        bOut.innerHTML = bFb;
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        if (!prac) ro.innerHTML = info();
        P.draw();
      };

      const FLAGS = ['scene', 'task', 'pre', 'dp'];
      const apply = (patch, immediate) => {
        cancel();
        st.practice = false;
        const nums = {};
        for (const k in patch) if (!FLAGS.includes(k)) nums[k] = patch[k];
        if (patch.scene) loadScene(patch.scene);
        if (patch.task != null) { st.task = patch.task; bFb = ''; }
        if (patch.pre != null) st.pre = patch.pre;
        if (patch.dp != null) st.dp = patch.dp;
        if (st.scene === 'build') { st.meet = 0; bFb = ''; }
        if (immediate) { Object.assign(st, nums); sync(); } else { sync(); cancel = animateTo(st, nums, 700, sync); }
      };

      draggable(P, {
        hit: (qx, qy) => {
          if (!movable()) return null;
          const g = geom(P), f = curVal(g.sc), bx = g.px(st.x);
          const pts = [g.py(g.v.ya)]; if (f != null && !g.sc.hideVal) pts.push(g.py(f));
          return pts.some(py => Math.hypot(bx - qx, py - qy) < 22) ? 'x' : null;
        },
        move: (hd, x) => {
          cancel(); const r = xRange();
          st.x = clamp(+snap(x, r[2]).toFixed(2), r[0], r[1]);
          if (st.scene === 'eval') evReset();
          sync();
        }
      });

      renderPred(); renderEval(); renderDr(); sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
