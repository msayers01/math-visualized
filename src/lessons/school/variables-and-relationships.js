/* =====================================================================
   SCHOOL — Variables and relationships
   ===================================================================== */
{
  const SANS = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
  const SERIF = '"STIX Two Text", "Cambria Math", "Times New Roman", serif';
  const same = (a, b) => Math.abs(a - b) < 1e-6;
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const pl = (n, w) => num(n) + ' ' + w + (n === 1 ? '' : 's');
  const fx = (it, x) => it.m * x + it.b;
  const seq = n => Array.from({ length: n + 1 }, (_, i) => i);
  /* "y = 2 × 3 + 5 = 11": the rule with a number put in for x */
  const sub = (m, b, x) => 'y = ' + (m === 1 ? num(x) : num(m) + ' × ' + num(x)) + (b ? ' + ' + num(b) : '') + ' = ' + num(m * x + b);
  /* x and y in a rule are shown in italic serif so they read as variables */
  const mathHtml = t => t.replace(/[xy]/g, s => `<i style="font-family:${SERIF};font-size:1.08em">${s}</i>`);

  /* ---------- the explore activity: change x and watch y ---------- */
  const EXN = 6;
  const EXP = {
    age: { name: 'Ages (add the same number)', m: 1, b: 4, words: 'Ava is 4 years older than her brother Ben.',
      xName: "Ben's age in years", yName: "Ava's age in years", xLab: "x = Ben's age", win: { x: 7, y: 12, xs: 1, ys: 2 },
      goal: 9, ask: 'Move the marker until Ava is 9 years old.',
      say: (x, y) => `Ben is ${x}, so Ava is ${x} + 4 = ${y}.`,
      done: 'At x = 5 the table shows y = 9 and the dot is 9 high. The rule agrees: y = 5 + 4 = 9. When Ben gets 1 year older, so does Ava, so the gap of 4 years never changes.' },
    tickets: { name: 'Tickets (multiply)', m: 3, b: 0, words: 'A movie ticket costs $3.',
      xName: 'number of tickets', yName: 'cost in dollars', xLab: 'x = number of tickets', win: { x: 7, y: 20, xs: 1, ys: 4 },
      goal: 12, ask: 'Move the marker until the cost is $12.',
      say: (x, y) => `${pl(x, 'ticket')} ${x === 1 ? 'costs' : 'cost'} 3 × ${x} = ${y} dollars.`,
      done: 'At x = 4 the table shows y = 12 and the dot is 12 high. The rule agrees: y = 3 × 4 = 12. Each ticket adds 3 dollars, and 0 tickets cost 0, so the dots start at (0, 0).' },
    jar: { name: 'Savings jar (multiply, then add)', m: 2, b: 5, words: 'Mia starts with $5 in a jar. She adds $2 every week.',
      xName: 'weeks', yName: 'dollars in the jar', xLab: 'x = weeks', win: { x: 7, y: 20, xs: 1, ys: 4 },
      goal: 15, ask: 'Move the marker until the jar holds $15.',
      say: (x, y) => `After ${pl(x, 'week')} the jar holds 2 × ${x} + 5 = ${y} dollars.`,
      done: 'At x = 5 the table shows y = 15. The rule agrees: y = 2 × 5 + 5 = 15. The first dot is at (0, 5), the $5 she started with. Then every week adds 2.' }
  };
  const EXORDER = ['age', 'tickets', 'jar'];

  /* ---------- step 1: which quantities, and which one is independent ---------- */
  const ROLES = [
    { words: 'Mia puts $5 in a jar. At the end of every week she adds $2.', m: 2, b: 5, xs: [0, 1, 2, 3, 4], ind: 'A', win: { x: 5, y: 16, xs: 1, ys: 4 },
      A: { row: 'weeks', long: 'the number of weeks', axis: 'weeks' }, B: { row: 'dollars', long: 'the dollars in the jar', axis: 'dollars in the jar' },
      pair: [
        { t: 'the weeks that pass and the dollars in the jar', ok: true, why: 'The weeks go by, and the dollars in the jar change with them. These are two quantities that change together.' },
        { t: 'the $5 she starts with and the $2 she adds each week', why: 'Neither of these changes. The $5 start and the $2 each week stay the same all the time. A quantity that never changes is a constant. A variable is a quantity that changes.' },
        { t: 'the $5 she starts with and the dollars in the jar', why: 'The $5 start never changes, so it is a constant. The dollars in the jar do change, but they change as the weeks go by. The second variable is the weeks.' }],
      indWhy: 'You can ask about any number of weeks you like: 1 week, 4 weeks, 10 weeks. You pick the weeks first, then work out the dollars. So the weeks are the <b>independent variable</b>, x. The dollars in the jar respond, so they are the <b>dependent variable</b>, y.',
      depWhy: 'Nobody picks the dollars first and then makes the weeks fit. You pick the number of weeks, and the dollars respond. The one that responds is the dependent variable.' },
    { words: 'Ana buys movie tickets for her friends. Each ticket costs $3.', m: 3, b: 0, xs: [0, 1, 2, 3, 4], ind: 'B', win: { x: 5, y: 16, xs: 1, ys: 4 },
      A: { row: 'cost ($)', long: 'the cost of the tickets', axis: 'cost in dollars' }, B: { row: 'tickets', long: 'the number of tickets', axis: 'number of tickets' },
      pair: [
        { t: 'the $3 price of one ticket and the cost of the tickets', why: 'The $3 price of one ticket never changes. It is a constant. The other variable is the number of tickets. The cost changes because the number of tickets changes.' },
        { t: 'the number of tickets and the cost of the tickets', ok: true, why: 'Buy more tickets and the cost goes up. These two quantities change together. The $3 price of one ticket stays the same, so it is a constant.' },
        { t: 'the $3 price of one ticket and the number of tickets', why: 'The $3 price of one ticket never changes. It is a constant, not a variable. The cost of the tickets changes as the number of tickets changes.' }],
      indWhy: 'Ana chooses how many tickets to buy. The cost follows from her choice. So the number of tickets is the <b>independent variable</b>, x, and the cost is the <b>dependent variable</b>, y. The cost was listed first in the table, but the order in a table does not decide which variable is which.',
      depWhy: 'The cost does not decide how many tickets Ana buys. She picks the number of tickets, and then the cost is worked out. The cost depends on the number of tickets.' },
    { words: 'A pot of water starts at 20 degrees. It is heated on a stove, and every minute the temperature goes up by 4 degrees.', m: 4, b: 20, xs: [0, 1, 2, 3, 4], ind: 'B', win: { x: 5, y: 40, xs: 1, ys: 10 },
      A: { row: 'temp (°)', long: 'the temperature of the water', axis: 'temperature in degrees' }, B: { row: 'minutes', long: 'the number of minutes', axis: 'minutes' },
      pair: [
        { t: 'the 20 degrees at the start and the 4 degrees added each minute', why: 'Neither of these changes. The 20 degrees at the start and the 4 degrees added each minute are constants.' },
        { t: 'the 4 degrees added each minute and the number of minutes', why: 'The 4 degrees added each minute never changes, so it is a constant. The temperature is the variable that changes with the minutes.' },
        { t: 'the number of minutes and the temperature of the water', ok: true, why: 'As the minutes go by, the temperature goes up. These two quantities change together. The 20 degrees at the start and the 4 degrees each minute are constants.' }],
      indWhy: 'Time goes by, and the temperature responds. You can pick any number of minutes and ask for the temperature then. So the minutes are the <b>independent variable</b>, x, and the temperature is the <b>dependent variable</b>, y. The temperature came first in the words, but the one named first is not always the independent one.',
      depWhy: 'The temperature does not decide how many minutes have gone by. The minutes pass, and the temperature responds. So the temperature is the dependent variable.' },
    { words: 'Jo rides a bike at a steady 6 kilometers every hour.', m: 6, b: 0, xs: [0, 1, 2, 3, 4], ind: 'A', win: { x: 5, y: 28, xs: 1, ys: 4 },
      A: { row: 'hours', long: 'the number of hours', axis: 'hours' }, B: { row: 'km', long: 'the distance in kilometers', axis: 'distance in km' },
      pair: [
        { t: 'the speed of 6 km each hour and the distance', why: 'The speed is steady, so the 6 km each hour never changes. It is a constant. The distance changes as the time goes by.' },
        { t: 'the speed of 6 km each hour and the number of hours', why: 'The speed is steady, so the 6 km each hour never changes. It is a constant. The number of hours is a variable, but it needs a partner that changes with it.' },
        { t: 'the number of hours and the distance', ok: true, why: 'The longer Jo rides, the farther she goes. These two quantities change together. Her speed, 6 km each hour, stays the same, so it is a constant.' }],
      indWhy: 'You can pick any time, such as 3 hours, and then the distance follows: 6 × 3 = 18 km. So the hours are the <b>independent variable</b>, x, and the distance is the <b>dependent variable</b>, y.',
      depWhy: 'The distance depends on how long Jo rides. You pick the time first, and then work out the distance. So the distance is the dependent variable.' }
  ];

  /* ---------- step 3: choose the rule ---------- */
  const SRC = { table: 'the table says', words: 'the situation gives', graph: 'the graph shows' };
  const RUL = [
    { given: 'words', words: 'A school bus carries some students. Two teachers always ride along too.', xName: 'students on the bus', yName: 'people on the bus',
      xs: [3, 4, 5, 6], m: 1, b: 2, win: { x: 7, y: 12, xs: 1, ys: 2 }, q: 'Which equation matches the words? Choose one, and the lesson tests it on every column.',
      choices: [
        { t: 'y = 3x', m: 3, b: 0, why: 'The 2 teachers are added once. They are not multiplied by the number of students. The rule 3x triples the students.' },
        { t: 'y = x + 2', m: 1, b: 2, ok: true, why: 'Everyone on the bus is a student or one of the 2 teachers, so people = students + 2. The 2 never changes, so each new student adds exactly 1 person: y goes up 1 when x goes up 1.' },
        { t: 'y = 2x', m: 2, b: 0, why: 'The rule 2x doubles the students. But the words add 2 teachers. Nothing is doubled.' },
        { t: 'x = y + 2', m: 1, b: -2, why: 'This rule is turned around. It says the students are 2 more than the people. But the people are 2 more than the students, so it is y that equals x + 2.' }] },
    { given: 'table', ctx: 'The table shows the pay for some hours of work.', xName: 'hours worked', yName: 'pay in dollars',
      xs: [1, 2, 3, 4], m: 6, b: 0, win: { x: 5, y: 28, xs: 1, ys: 4 }, q: 'Which equation fits every column of the table?',
      choices: [
        { t: 'y = x + 5', m: 1, b: 5, why: 'Look at how y changes in the table. It goes up by 6 each time x goes up by 1. An add-only rule like x + 5 goes up by only 1. Matching the first column is not enough.' },
        { t: 'y = 6x + 6', m: 6, b: 6, why: 'It goes up 6 for each step, which is right. But it adds 6 at the start. In the table, going back one more step from x = 1 gives y = 0 at x = 0, so nothing is added.' },
        { t: 'y = 6x', m: 6, b: 0, ok: true, why: 'y goes up by 6 each time x goes up by 1, so the rule multiplies x by 6. Going back one more step gives y = 0 at x = 0, so nothing is added: the graph starts at (0, 0).' },
        { t: 'y = 3x + 3', m: 3, b: 3, why: 'One matching column is not enough. The table goes up by 6 each time, and this rule goes up by only 3.' }] },
    { given: 'words', words: 'Sasha has $3 in a jar. Every week she adds $4. Let x be the number of weeks that pass and y the dollars in the jar.', xName: 'weeks that pass', yName: 'dollars in the jar',
      xs: [1, 2, 3, 4], m: 4, b: 3, win: { x: 5, y: 24, xs: 1, ys: 4 }, q: 'Which equation matches the words? Choose one, and the lesson tests it on every column.',
      choices: [
        { t: 'y = 4x + 3', m: 4, b: 3, ok: true, why: 'The jar starts with $3 and gains $4 every week, so after x weeks it holds 4x + 3. The 4 multiplies x because $4 is added every week. The 3 is added once, at the start.' },
        { t: 'y = 3x + 4', m: 3, b: 4, why: 'The two numbers are swapped. This rule starts with $4 and adds $3 a week, but the story says $3 to start and $4 a week. It gives 7 when x is 1, which happens to fit. The next column shows the mistake.' },
        { t: 'y = 7x', m: 7, b: 0, why: 'This rule adds 7 every week. But the $3 is added once, at the start. Only the $4 is added every week.' },
        { t: 'y = x + 7', m: 1, b: 7, why: 'Each week the jar gains $4, so each week must add 4 to y, not 1.' }] },
    { given: 'table', ctx: 'A pizza shop sells slices at one price each and adds one delivery charge. The table shows the cost of some orders.', xName: 'number of slices', yName: 'cost in dollars',
      xs: [2, 4, 6, 8], m: 2, b: 1, win: { x: 10, y: 20, xs: 2, ys: 4 }, q: 'Which equation fits every column of the table?',
      choices: [
        { t: 'y = x + 3', m: 1, b: 3, why: 'Here y goes up 4 each time, and x goes up only 2. So y goes up faster than x, and an add-only rule cannot do that.' },
        { t: 'y = 2x + 3', m: 2, b: 3, why: 'The 2 is right, but the added number is too big. For y = 2x + b the first column needs 2 × 2 + b = 5, so b = 1.' },
        { t: 'y = 4x + 1', m: 4, b: 1, why: 'This is the trap. Yes, y goes up by 4 each time. But x also goes up, by 2 each time, not by 1. So y goes up 4 ÷ 2 = 2 for each 1 of x.' },
        { t: 'y = 2x + 1', m: 2, b: 1, ok: true, why: 'y goes up 4 while x goes up 2, so y goes up 2 for each 1 of x: the rule multiplies x by 2. Go back one step of 1 from x = 2 and y drops to 3. Go back another and y is 1 at x = 0. So 1 is added.' }] },
    { given: 'graph', ctx: 'The graph shows the cost of renting a bike. The dots are at 0, 1, 2, 3 and 4 hours.', xName: 'hours rented', yName: 'cost in dollars',
      xs: [0, 1, 2, 3, 4], m: 3, b: 2, win: { x: 5, y: 16, xs: 1, ys: 2 }, q: 'Which equation fits the dots on the graph? Read where the first dot is, then how far the dots rise for each step right.',
      choices: [
        { t: 'y = 2x + 3', m: 2, b: 3, why: 'The numbers are swapped. This line starts at (0, 3), but the first dot is at (0, 2). It also rises 2 for each step right, but the dots rise 3.' },
        { t: 'y = 5x', m: 5, b: 0, why: 'This rule fits the point (1, 5) only. It starts at (0, 0), but the first dot is at (0, 2). It rises 5 for each step right, but the dots rise 3.' },
        { t: 'y = 3x + 2', m: 3, b: 2, ok: true, why: 'The first dot is at (0, 2), so y is 2 when x is 0: the rule adds 2. Each dot is 3 higher than the one before, so the rule multiplies x by 3. Test the dot (3, 11): 3 × 3 + 2 = 11.' },
        { t: 'y = 3x', m: 3, b: 0, why: 'The dots do rise 3 for each step right, but this line starts at (0, 0). The first dot is at (0, 2), so something is added at the start.' }] },
    { given: 'table', ctx: 'The table shows how far a hiker has walked after some hours at a steady speed.', xName: 'hours walked', yName: 'distance in km',
      xs: [2, 3, 4, 5], m: 2, b: 0, win: { x: 6, y: 12, xs: 1, ys: 2 }, q: 'Which equation fits every column of the table?',
      choices: [
        { t: 'y = x + 2', m: 1, b: 2, why: 'Adding 2 and multiplying by 2 give the same answer only when x is 2. That is why the first column fit. The next column tells them apart.' },
        { t: 'y = 2x', m: 2, b: 0, ok: true, why: 'y goes up 2 each time x goes up 1, so the rule multiplies x by 2. At first the table looks like x + 2, because both rules give 4 when x is 2. The other columns tell them apart.' },
        { t: 'y = x + 4', m: 1, b: 4, why: 'This rule is wrong from the very first column.' },
        { t: 'y = 2x + 1', m: 2, b: 1, why: 'The 2 is right, but the 1 is not there. Going back from x = 2 to x = 0 gives y = 0, so nothing is added.' }] }
  ];

  /* ---------- step 4: use the rule ---------- */
  const USE = [
    { type: 'build', words: 'A pool has 4 cm of water in it. A hose adds 3 cm of water every minute.', xName: 'minutes', yName: 'depth of water in cm',
      xs: [0, 1, 2, 3, 4], m: 3, b: 4, win: { x: 6, y: 24, xs: 1, ys: 4 },
      q: 'Make the graph of y = 3x + 4. Drag the left ring (at x = 0) to set where the line starts. Drag the right ring (at x = 1) to set how far the line goes up for 1 step right.' },
    { type: 'read', focus: 'm', words: 'Rosa has $7 in a jar. She adds $4 every week. The table and graph below show her jar.', xName: 'weeks', yName: 'dollars in the jar',
      xs: [0, 1, 2, 3, 4], m: 4, b: 7, win: { x: 6, y: 32, xs: 1, ys: 8 },
      q: 'The rule for the jar is y = 4x + 7. What does the 4 tell you about the table and the graph?',
      choices: [
        { t: 'When x is 0, y is 4. The graph starts at (0, 4).', why: 'The table says y = 7 when x = 0, not 4. The graph starts at (0, 7). The number that tells where it starts is the one that is added: 7.' },
        { t: 'When x is 4, y is 7. The graph goes through (4, 7).', why: 'Check the table: when x is 4, y is 23. A number in a rule is not a point. The graph does not go through (4, 7).' },
        { t: 'Each time x goes up by 1, y goes up by 4. Each step right on the graph goes up 4.', ok: true, why: 'Look at the y row: 7, 11, 15, 19, 23. It goes up by 4 every time x goes up by 1, and each red step on the graph is 4 high. The number that multiplies x is how much y changes for each 1 step in x.' },
        { t: 'y is always 4 more than x.', why: 'That would be the rule y = x + 4. In y = 4x + 7 the 4 multiplies x. When x is 1, y is 11, which is 10 more than x, not 4 more.' }] },
    { type: 'read', focus: 'b', words: 'Same jar, same rule: y = 4x + 7. The ring on the graph marks the first dot.', xName: 'weeks', yName: 'dollars in the jar',
      xs: [0, 1, 2, 3, 4], m: 4, b: 7, win: { x: 6, y: 32, xs: 1, ys: 8 },
      q: 'What does the 7 in y = 4x + 7 tell you about the table and the graph?',
      choices: [
        { t: 'When x is 0, y is 7. The graph starts at the point (0, 7).', ok: true, why: 'Put x = 0 into the rule: 4 × 0 + 7 = 7. The first column of the table says y = 7, and the first dot is at (0, 7), on the y-axis. The number that is added tells you where the graph starts.' },
        { t: 'Each time x goes up by 1, y goes up by 7.', why: 'The y row is 7, 11, 15, 19, 23. It goes up by 4 each time, not 7. The 7 is added only once, at the start. It is not added again with every step.' },
        { t: 'When x is 7, y is 0. The graph goes through (7, 0).', why: 'The first number in a point is x. The table says y = 7 when x = 0, so the point is (0, 7). When x is 7, the rule gives y = 4 × 7 + 7 = 35.' },
        { t: 'The graph goes through (0, 0).', why: 'When x is 0, y = 4 × 0 + 7 = 7, so the first dot is at (0, 7), not at (0, 0). Only a rule with nothing added goes through (0, 0).' }] },
    { type: 'predict', find: 'y', x: 10, ans: 35, words: 'A plant is 5 cm tall today. It grows 3 cm every week. The rule is y = 3x + 5, where x is the number of weeks from today.', xName: 'weeks from today', yName: 'height in cm',
      xs: [0, 1, 2, 3, 4], m: 3, b: 5, win: { x: 12, y: 40, xs: 2, ys: 10 },
      q: 'The table stops at 4 weeks. How tall will the plant be after 10 weeks?',
      choices: [
        { v: 20, label: '20 cm', why: 'That is 17 + 3. The table stops at 4 weeks, where the plant is 17 cm. But 10 weeks is 6 more weeks, not 1, and each week adds 3 cm: 17 + 6 × 3 = 35.' },
        { v: 30, label: '30 cm', why: 'That is 3 × 10. It forgets the 5 cm the plant already had. The rule is y = 3x + 5, so add the 5: 30 + 5 = 35.' },
        { v: 35, label: '35 cm', ok: true, why: 'Put x = 10 into the rule: y = 3 × 10 + 5 = 30 + 5 = 35. The point (10, 35) is on the line. Check with the table: 17 cm at week 4, then 6 more weeks of 3 cm is 18 more, and 17 + 18 = 35.' },
        { v: 80, label: '80 cm', why: 'That is (3 + 5) × 10. The 3 is added for every week, but the 5 is added only once, at the start. The rule is 3 × 10 + 5 = 35.' }] },
    { type: 'predict', find: 'x', y: 30, ans: 6, words: 'A tank holds 6 liters of water. A tap adds 4 liters every minute. The rule is y = 4x + 6, where x is the number of minutes the tap has run.', xName: 'minutes', yName: 'liters in the tank',
      xs: [0, 1, 2, 3, 4], m: 4, b: 6, win: { x: 10, y: 40, xs: 2, ys: 10 },
      q: 'Now work backward. After how many minutes does the tank hold 30 liters?',
      choices: [
        { v: 7.5, label: '7.5 minutes', why: 'That is 30 ÷ 4. It forgets the 6 liters that were already in the tank. Only 30 − 6 = 24 liters have to come from the tap, and 24 ÷ 4 = 6.' },
        { v: 6, label: '6 minutes', ok: true, why: 'Undo the rule in reverse order. The tank starts with 6 liters, so the tap must add 30 − 6 = 24 liters. At 4 liters a minute that takes 24 ÷ 4 = 6 minutes. Check: 4 × 6 + 6 = 30.' },
        { v: 24, label: '24 minutes', why: 'That is 30 − 6, the liters the tap must add. But the tap adds 4 liters in each minute, so divide: 24 ÷ 4 = 6 minutes.' },
        { v: 9, label: '9 minutes', why: 'That is (30 + 6) ÷ 4. The tank already holds 6 liters, so the tap has less to add, not more. Take the 6 away: 30 − 6 = 24, and 24 ÷ 4 = 6.' }] }
  ];

  const IDLE = {
    roles: 'Choose an answer. Every choice is explained.',
    rule: 'Choose a rule. The lesson tests it on every column and shows which one breaks.',
    read: 'Choose an answer. Every choice is explained.',
    predict: 'Choose an answer. Your point appears on the graph, and every choice is explained.'
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
    id: 'variables-and-relationships', level: 'school',
    title: 'Variables and relationships',
    blurb: 'Choose which quantity is independent, change it and watch the other respond, then write a rule that fits a table, a graph and the words.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 2.1; p.cy = 4.4; p.span = 5;
      p.grid(1);
      p.path([[0, 1], [4.4, 9.8]], { stroke: pal.blue, width: 2.6 });
      p.path([[1, 3], [2, 3]], { stroke: pal.green, width: 3.8 });
      p.path([[2, 3], [2, 5]], { stroke: pal.red, width: 3.8 });
      [[0, 1], [1, 3], [2, 5], [3, 7], [4, 9]].forEach(([x, y]) => p.dot(x, y, 4.6, pal.yellow, pal.stage, 1.5));
    },
    hook: String.raw`Mia puts $5 in a jar and adds $2 every week. How much will be in the jar after 10 weeks, and how can a table, a graph and one short rule all give the answer?`,
    steps: [
      { title: 'Two quantities, two roles',
        text: String.raw`<p>A <b>variable</b> is a quantity that can change. Mia puts $5 in a jar and adds $2 every week. The weeks and the dollars change, so they are variables. The $5 and the $2 never change.</p><p>When two variables change together, you <em>choose</em> one and the other <em>responds</em>. The one you choose is the <b>independent variable</b>, \(x\). The one that responds is the <b>dependent variable</b>, \(y\). On a graph, \(x\) goes along the bottom and \(y\) goes up the side.</p><p>For each situation, pick the two quantities that change together, then the independent one.</p>`,
        set: { mode: 'roles', qi: 0, x: 2, steps: 0 } },
      { title: 'Change x and watch y',
        text: String.raw`<p>Ava is 4 years older than her brother Ben. Let \(x\) be Ben's age and \(y\) be Ava's age. The marker starts at \(x=2\), where the table says \(y=6\).</p><p>Drag across the graph, tap a table column, or use the slider to change \(x\). Watch \(y\) respond. The rule is \(y=x+4\): add 4 to \(x\).</p><p>Switch on <b>Show the changes</b> to see how \(y\) moves each time \(x\) goes up 1. Then try the other two situations in the menu and solve each challenge.</p>`,
        set: { mode: 'explore', sit: 'age', x: 2, steps: 0 } },
      { title: 'Write the rule',
        text: String.raw`<p>A <b>rule</b> is an equation that gives \(y\) from \(x\). Some rules add (\(y=x+4\)), some multiply (\(y=3x\)) and some do both (\(y=2x+1\)).</p><p>Each question shows a table, a graph or words. Choose the rule that fits. The lesson then tests your choice on <b>every</b> column. A rule can match one column and still be wrong, and the red marks show which column breaks it.</p>`,
        set: { mode: 'rule', qi: 0, x: 2, steps: 0 } },
      { title: 'Use the rule',
        text: String.raw`<p>First build a graph from a rule. Drag the two rings. The number that is added sets where the graph <b>starts</b> (at \(x=0\)). The number that multiplies \(x\) sets how far \(y\) goes <b>up</b> for each 1 step right.</p><p>Then read a table and a graph, and use the rule to find \(y\) for a new \(x\), or \(x\) for a new \(y\). In the last two questions, every choice shows where its point lands on the graph.</p>`,
        set: { mode: 'use', qi: 0, x: 2, steps: 0 } }
    ],
    formal: String.raw`
      <p><b>Goal.</b> Describe how two quantities that change together are connected, using words, a table, a graph and an equation, and move from any one of them to the others.</p>
      <h3>Variables and constants</h3>
      <p>A <em>variable</em> is a quantity that can change. A <em>constant</em> stays the same. Mia puts $5 in a jar and adds $2 every week. The number of weeks and the dollars in the jar are variables. The $5 she starts with and the $2 she adds each week are constants.</p>
      <h3>Independent and dependent variables</h3>
      <p>When two variables change together, think of one as the <em>input</em> and the other as the <em>output</em>. The <em>independent variable</em> is the one you choose, or the one that comes first, such as time. The <em>dependent variable</em> is the one that responds: its value depends on the other. We usually write \(x\) for the independent variable and \(y\) for the dependent variable.</p>
      <p>The weeks are independent, because you can ask about any number of weeks. The dollars in the jar are dependent, because they follow from the weeks. On a graph, \(x\) goes along the bottom axis and \(y\) goes up the side. In a table, \(x\) is usually the top row.</p>
      <p>The order of the words does not decide. "The temperature of the water depends on the minutes it is heated" names the temperature first, but the minutes are the independent variable. Ask: which one do I pick, and which one answers?</p>
      <h3>Four ways to show one relationship</h3>
      <p>Mia's jar can be shown in four ways. <b>Words:</b> it starts with $5 and gains $2 every week. <b>Table:</b>
      \[ \begin{array}{c|ccccc} x\ (\text{weeks}) & 0 & 1 & 2 & 3 & 4 \\ \hline y\ (\text{dollars}) & 5 & 7 & 9 & 11 & 13 \end{array} \]
      <b>Graph:</b> the points \((0,5)\), \((1,7)\), \((2,9)\), \((3,11)\), \((4,13)\) lie on a straight line that starts at 5 on the \(y\)-axis. <b>Equation:</b>
      \[ y = 2x + 5. \]
      You can start from any one of these four and find the others.</p>
      <h3>Three kinds of rules</h3>
      <ul>
        <li><b>Add the same number:</b> \(y = x + 4\). Ava is always 4 years older than Ben. When \(x\) goes up 1, \(y\) goes up 1, because the 4 never changes.</li>
        <li><b>Multiply:</b> \(y = 3x\). A ticket costs $3. When \(x\) goes up 1, \(y\) goes up 3. When \(x=0\), \(y=0\).</li>
        <li><b>Multiply, then add:</b> \(y = 2x + 5\). The jar gains 2 for every week and had 5 to begin with. When \(x\) goes up 1, \(y\) goes up 2. When \(x=0\), \(y=5\).</li>
      </ul>
      <p>A rule of the form \(y = mx + b\) covers all three. The multiplier \(m\) is how much \(y\) changes for each 1 step in \(x\). The added number \(b\) is the value of \(y\) when \(x=0\). If \(m=1\) we write \(y = x + b\), and if \(b=0\) we write \(y = mx\).</p>
      <h3>Reading a table</h3>
      <p>Look at how \(y\) changes when \(x\) goes up by 1. In Mia's jar, \(y\) goes up by 2 every time, and 2 is the number that multiplies \(x\). Then find \(y\) when \(x=0\): it is 5, the number that is added. So the rule is \(y = 2x + 5\). After 10 weeks, \(x=10\) and \(y = 2\times 10 + 5 = 25\), so the jar holds $25.</p>
      <p>Be careful when \(x\) skips. In the table \((2,5)\), \((4,9)\), \((6,13)\), \((8,17)\), \(y\) goes up 4 each time, but \(x\) goes up 2 each time. So \(y\) goes up \(4 \div 2 = 2\) for each 1 of \(x\). Going back one step of 1 from \(x=2\) gives \(y=3\), and another gives \(y=1\) at \(x=0\). The rule is \(y = 2x + 1\).</p>
      <h3>Reading a graph</h3>
      <p>The graph of these rules is a set of points on a straight line. The point where the graph meets the \(y\)-axis is \((0, b)\): the start. Each 1 step to the right goes up \(m\). For \(y = 2x + 5\), the graph starts at \((0,5)\) and goes up 2 for each step right.</p>
      <h3>Writing a rule from a table</h3>
      <ol>
        <li>Find how much \(y\) changes for each 1 step in \(x\). Call it \(m\).</li>
        <li>Find \(y\) when \(x=0\), going backward if the table does not show it. Call it \(b\).</li>
        <li>Write \(y = mx + b\).</li>
        <li>Test the rule in <b>every</b> column of the table.</li>
      </ol>
      <h3>Why test every column</h3>
      <p>One column can fit more than one rule. In the table \((2,4)\), \((3,6)\), \((4,8)\), \((5,10)\), the first column fits both \(y = x + 2\) and \(y = 2x\), because \(2 + 2 = 2 \times 2\). The second column tells them apart: \(x + 2\) gives 5, \(2x\) gives 6, and the table says 6. A rule is right only if it matches all the columns.</p>
      <h3>Using the rule</h3>
      <p><b>To find \(y\) from a new \(x\):</b> put the number in. For \(y = 3x + 5\) and \(x = 10\), \(y = 3 \times 10 + 5 = 35\). The table does not need to reach \(x = 10\).</p>
      <p><b>To find \(x\) from a new \(y\):</b> undo the rule in reverse order. For \(y = 4x + 6\) and \(y = 30\), take away the 6 first: \(30 - 6 = 24\). Then divide by 4: \(24 \div 4 = 6\). Check: \(4 \times 6 + 6 = 30\).</p>
      <h3>What comes next</h3>
      <p>A rule \(y = mx\) with nothing added is a <em>proportional</em> relationship. In Grade 8 you will call \(m\) the <em>slope</em> and \(b\) the <em>y-intercept</em> of a line, and you will study <em>functions</em>, where each \(x\) has exactly one \(y\). This lesson uses whole numbers. The same ideas work for decimals and fractions.</p>`,
    check: [
      { q: String.raw`A table shows these pairs \((x, y)\): \((2, 6)\), \((3, 9)\), \((4, 12)\), \((5, 15)\). Here \(x\) is the independent variable and \(y\) is the dependent variable. Which rule fits every pair?`,
        choices: [String.raw`\(y = 2x + 2\)`, String.raw`\(y = 6x\)`, String.raw`\(y = 3x\)`, String.raw`\(y = x + 4\)`], answer: 2,
        why: String.raw`Each time \(x\) goes up by 1, \(y\) goes up by 3, so the rule multiplies \(x\) by 3. Check: \(3 \times 2 = 6\), \(3 \times 3 = 9\), \(3 \times 4 = 12\), \(3 \times 5 = 15\). All four pairs match. The rule \(y = x + 4\) fits only the first pair (\(2 + 4 = 6\)) and gives 7, not 9, when \(x = 3\). The rule \(y = 2x + 2\) also gives 6 when \(x = 2\), but 8 when \(x = 3\). The rule \(y = 6x\) uses the first \(y\) value as if \(x\) were 1, and gives 12 when \(x = 2\).`,
        hint: String.raw`Look at how much \(y\) goes up when \(x\) goes up by 1. Then test your rule on every pair, not only the first.` },
      { q: String.raw`A gym charges $10 to join. After that it charges $4 for each visit. Let \(x\) be the number of visits and \(y\) the total cost in dollars, so \(y = 4x + 10\). What is the total cost for 6 visits, and what does the 10 tell you about the graph of the rule?`,
        choices: ['$34. The graph starts at the point (0, 10), because 0 visits already cost the $10 joining fee.',
                  '$34. The graph goes up 10 for each visit.',
                  '$60. The graph starts at the point (0, 10).',
                  '$20. The graph goes up 4 for each visit.'], answer: 0,
        why: String.raw`For 6 visits, \(x = 6\), so \(y = 4 \times 6 + 10 = 24 + 10 = 34\) dollars. When \(x = 0\), \(y = 4 \times 0 + 10 = 10\), so the graph starts at \((0, 10)\). The 10 is added once, not for every visit. The graph goes up by 4, the number that multiplies \(x\), for each visit, not by 10. The answer $60 is \(10 \times 6\). The answer $20 is \(6 + 4 + 10\).`,
        hint: String.raw`Put \(x = 6\) into the rule. Then find \(y\) when \(x = 0\) to see where the graph starts.` }
    ],
    links: { next: ['what-is-a-function'], related: ['proportional-relationships', 'unit-rates-and-best-buys', 'slope-and-linear-functions'] },

    mount({ stage, controls: C }) {
      stage.classList.add('split');
      stage.style.minHeight = '580px';
      const top = h('div', { class: 'pane', style: 'flex: 14 1 0' }), bot = h('div', { class: 'pane', style: 'flex: 17 1 0' });
      stage.append(top, bot);
      const PT = new Plane(top), PG = new Plane(bot);

      /* st: numbers the steps animate (the marker x and the fade of the "changes" marks) */
      const st = { x: 2, steps: 0 };
      const want = { steps: 0 };
      let mode = 'roles', qi = 0, cancel = () => {};
      const ex = { sit: 'age', done: {} };
      const bd = { b: 0, m: 1, rule: 0 };   /* the two rings of the build question, and the "show the rule" switch */
      const tk = { stage: 1, solved: false, picked: false, cand: null, msg: '', btns: [] };
      let tg = null;                         /* where the explore table is on screen, so a tap can pick a column */

      const ITEMS = () => mode === 'roles' ? ROLES : mode === 'rule' ? RUL : mode === 'use' ? USE : null;
      const item = () => { const a = ITEMS(); return a ? a[qi] : null; };
      const xi = () => clamp(Math.round(st.x), 0, EXN);
      const isBuild = () => mode === 'use' && item().type === 'build';

      /* ---------- what is on screen: one description that both panes draw ---------- */
      const view = () => {
        const d = tk.solved, it = item();
        const V = { words: null, names: null, win: null, m: 0, b: 0, cols: [], rows: [], table: true, graph: true, dots: true, line: null,
          marker: null, steps: 0, ring: null, ghost: null, handles: false, cmp: false, eq: null, hiCol: null, assigned: true };
        const rowX = { key: 'x', lab: 'x', col: 'green', val: i => V.cols[i].x };
        const rowY = (show = true) => ({ key: 'y', lab: 'y', col: 'red', val: i => show ? V.cols[i].y : null });
        if (mode === 'explore') {
          const S = EXP[ex.sit], x0 = xi();
          Object.assign(V, { words: S.words, names: { x: S.xName, y: S.yName }, win: S.win, m: S.m, b: S.b, marker: x0, steps: st.steps, hiCol: x0 });
          V.cols = seq(EXN).map(x => ({ x, y: fx(S, x) }));
          V.rows = [rowX, rowY(), { key: 'chg', lab: 'y goes up', col: 'red', a: st.steps, val: i => i ? '+' + num(S.m) : '' }];
          V.eq = { label: 'Rule:', txt: linEq(S.m, S.b), extra: sub(S.m, S.b, x0) };
          return V;
        }
        if (mode === 'roles') {
          const dep = it.ind === 'A' ? 'B' : 'A';
          Object.assign(V, { words: it.words, win: it.win, m: it.m, b: it.b, assigned: d });
          V.cols = it.xs.map(x => ({ x, y: fx(it, x) }));
          if (!d) {
            const row = k => ({ key: k, lab: it[k].row, col: 'text', val: i => k === it.ind ? V.cols[i].x : V.cols[i].y });
            V.rows = [row('A'), row('B')]; V.graph = false; V.dots = false;
          } else {
            V.names = { x: it[it.ind].axis, y: it[dep].axis };
            V.rows = [{ ...rowX, lab: 'x: ' + it[it.ind].row }, { ...rowY(), lab: 'y: ' + it[dep].row }];
          }
          return V;
        }
        if (mode === 'rule') {
          const reveal = tk.picked || d, c0 = tk.cand;
          Object.assign(V, { words: it.given === 'words' ? it.words : it.ctx, names: { x: it.xName, y: it.yName }, win: it.win, m: it.m, b: it.b });
          V.cols = it.xs.map(x => ({ x, y: fx(it, x) }));
          V.table = it.given !== 'graph' || reveal;
          V.rows = [rowX, rowY(it.given !== 'words' || reveal)];
          if (reveal && c0) V.rows.push({ key: 'rule', lab: 'rule gives', col: 'blue', val: i => c0.m * V.cols[i].x + c0.b, tint: i => same(c0.m * V.cols[i].x + c0.b, V.cols[i].y) ? 'ok' : 'no' });
          V.graph = V.dots = it.given === 'graph' || reveal;
          V.line = c0 ? { m: c0.m, b: c0.b } : null; V.cmp = !!c0;
          V.eq = c0 ? { label: 'Your rule:', txt: c0.t } : null;
          return V;
        }
        /* mode === 'use' */
        Object.assign(V, { words: it.words, names: { x: it.xName, y: it.yName }, win: it.win, m: it.m, b: it.b });
        V.cols = it.xs.map(x => ({ x, y: fx(it, x) }));
        if (it.type === 'build') {
          const showRule = bd.rule || d;
          V.rows = [rowX];
          if (showRule) V.rows.push({ key: 'rule', lab: 'rule gives', col: 'blue', val: i => V.cols[i].y });
          V.rows.push({ key: 'mine', lab: 'your line', col: 'blue', val: i => bd.b + bd.m * V.cols[i].x,
            tint: showRule ? i => same(bd.b + bd.m * V.cols[i].x, V.cols[i].y) ? 'ok' : 'no' : null });
          V.dots = showRule; V.line = { m: bd.m, b: bd.b, mine: true }; V.handles = !d; V.steps = 1;
          V.eq = { label: 'Make the graph of', txt: linEq(it.m, it.b) };
          return V;
        }
        V.rows = [rowX, rowY()];
        V.line = { m: it.m, b: it.b };
        V.eq = { label: 'Rule:', txt: linEq(it.m, it.b) };
        if (it.type === 'read') {
          if (it.focus === 'm') { V.rows.push({ key: 'chg', lab: 'y goes up', col: 'red', val: i => i ? '+' + num(it.m) : '' }); V.steps = 1; }
          else { V.ring = { x: 0, y: it.b }; V.hiCol = 0; }
          return V;
        }
        const val = d ? it.ans : tk.cand;
        V.cols = V.cols.concat(it.find === 'y' ? [{ x: it.x, y: val, ask: 'y' }] : [{ x: val, y: it.y, ask: 'x' }]);
        V.ghost = { find: it.find, x: it.x, y: it.y, val };
        return V;
      };

      /* ---------- graph geometry: a window with its own scale on each axis ---------- */
      let vc = null;                          /* the view is built once per change, not once per drawing call */
      const cur = () => vc || (vc = view());
      const win = () => cur().win;
      const geo = p => {
        const w = win() || { x: 7, y: 12, xs: 1, ys: 2 }, L = clamp(p.w * .105, 34, 50), R = 18, T = 34, B = 42;
        return { w, L, R, T, B, pw: Math.max(10, p.w - L - R), ph: Math.max(10, p.h - T - B) };
      };
      PG.X = x => { const g = geo(PG); return g.L + x / g.w.x * g.pw; };
      PG.Y = y => { const g = geo(PG); return g.T + g.ph - y / g.w.y * g.ph; };
      PG.toMath = (px, py) => { const g = geo(PG); return [(px - g.L) / g.pw * g.w.x, (g.T + g.ph - py) / g.ph * g.w.y]; };
      PT.toMath = (px, py) => [px, py];

      /* ---------- top pane: words, table, rule ---------- */
      PT.onDraw = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, V = cur(), pad = clamp(W * .04, 16, 20);
        const f = clamp(Math.min(W / 27, H / 12), 12, 18), lh = f * 1.32;
        const hid = (x, y, w, hh, label) => {
          c.save(); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.setLineDash([5, 5]); rrect(c, x, y, w, hh, 8); c.stroke(); c.restore();
          tx(c, pal, label, x + w / 2, y + hh / 2, { size: f * .9, color: pal.muted, align: 'center' });
        };
        let y = pad + 2;
        c.font = `500 ${f}px ${SANS}`;
        if (V.words) {
          const lines = wrap(c, V.words, W - 2 * pad);
          lines.forEach((s, i) => tx(c, pal, s, pad, y + lh * (i + .5), { size: f }));
          y += lines.length * lh;
        }
        if (V.names) {
          const fs = f * .86, part = (lab, name, col, x, yy) => {
            tx(c, pal, lab, x, yy, { size: fs, color: col, weight: 700 });
            const w1 = c.measureText(lab).width + 5;
            tx(c, pal, '= ' + name, x + w1, yy, { size: fs, color: pal.muted });
            return w1 + c.measureText('= ' + name).width;
          };
          c.font = `700 ${fs}px ${SANS}`; const wa = c.measureText('x').width + 5; c.font = `500 ${fs}px ${SANS}`;
          const w1 = wa + c.measureText('= ' + V.names.x).width, w2 = wa + c.measureText('= ' + V.names.y).width;
          if (w1 + w2 + 24 <= W - 2 * pad) {
            const ww = part('x', V.names.x, pal.green, pad, y + lh * .5);
            part('y', V.names.y, pal.red, pad + ww + 24, y + lh * .5);
            y += lh * .95;
          } else {
            part('x', V.names.x, pal.green, pad, y + lh * .45); part('y', V.names.y, pal.red, pad, y + lh * 1.4);
            y += lh * 1.85;
          }
        }
        y += 4;

        const eqH = lh * 1.35, eqY = H - pad * .8 - eqH / 2;
        const cols = V.cols, n = cols.length, rows = V.rows;
        const yT = y + 2, yB = eqY - eqH / 2 - 2, area = Math.max(20, yB - yT), nr = mode === 'roles' ? 2 : 3;
        const rowH = clamp(area / nr, 18, 44), ty = yT + (area - rowH * nr) / 2;
        /* the table is as tall as its visible rows (a row that fades in counts in part) */
        const tH = V.table ? rows.reduce((t, r) => t + rowH * (r.a == null ? 1 : r.a), 0) : rowH * nr;
        c.font = `700 ${f}px ${SANS}`;
        const lw = clamp(Math.max(40, ...rows.map(r => c.measureText(r.lab).width + 20)), 40, W * .34);
        const cw = clamp((W - 2 * pad - lw) / n, 30, 100), tw = lw + cw * n, x0 = (W - tw) / 2;
        tg = V.table && mode === 'explore' ? { x0, lw, cw, ty, tH, n } : null;

        if (!V.table) hid(pad, ty, W - 2 * pad, tH, 'The table is hidden for now');
        else {
          if (V.hiCol != null) { c.fillStyle = alpha(pal.yellow, .22); c.fillRect(x0 + lw + V.hiCol * cw + 2, ty, cw - 4, tH); }
          cols.forEach((q, i) => { if (q.ask) { c.fillStyle = alpha(pal.yellow, tk.solved ? .14 : .22); c.fillRect(x0 + lw + i * cw + 2, ty, cw - 4, tH); } });
          rows.forEach((r, ri) => {
            const cy = ty + (ri + .5) * rowH, a = r.a == null ? 1 : r.a;
            if (a < .01) return;
            c.globalAlpha = a;
            if (ri) { c.strokeStyle = pal.grid; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, ty + ri * rowH); c.lineTo(x0 + tw, ty + ri * rowH); c.stroke(); }
            tx(c, pal, r.lab, x0 + lw - 10, cy, { size: f, color: pal[r.col], weight: 700, align: 'right' });
            cols.forEach((q, i) => {
              const v = r.val(i), cx = x0 + lw + (i + .5) * cw, t = r.tint && r.tint(i);
              if (t) { c.fillStyle = alpha(t === 'ok' ? pal.green : pal.red, .22); c.fillRect(x0 + lw + i * cw + 2, ty + ri * rowH + 2, cw - 4, rowH - 4); }
              const cand = q.ask && !tk.solved && v != null && r.key === q.ask;
              if (cand) { c.save(); c.strokeStyle = pal.muted; c.lineWidth = 1.5; c.setLineDash([4, 4]); rrect(c, x0 + lw + i * cw + 5, ty + ri * rowH + 3, cw - 10, rowH - 6, 6); c.stroke(); c.restore(); }
              const unknown = v === null, s = unknown ? '?' : typeof v === 'string' ? v : num(v);
              tx(c, pal, s, cx, cy, { size: f * 1.05, weight: unknown ? 700 : 600, align: 'center', color: unknown ? pal.text : pal[r.col] });
            });
            c.globalAlpha = 1;
          });
          c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0 + lw, ty); c.lineTo(x0 + lw, ty + tH); c.stroke();
        }

        /* the equation */
        if (V.eq) {
          c.font = `500 ${f * .9}px ${SANS}`;
          tx(c, pal, V.eq.label, pad, eqY, { size: f * .9, color: pal.muted });
          const w1 = c.measureText(V.eq.label).width + 10, w2 = mt(c, pal, V.eq.txt, pad + w1, eqY, { size: f * 1.1, color: pal.blue, weight: 600 });
          if (V.eq.extra) {
            tx(c, pal, 'so', pad + w1 + w2 + 12, eqY, { size: f * .9, color: pal.muted });
            mt(c, pal, V.eq.extra, pad + w1 + w2 + 12 + c.measureText('so').width + 8, eqY, { size: f * .95, color: pal.text, weight: 500 });
          }
        } else if (mode === 'rule') hid(pad, eqY - eqH / 2 + 2, Math.min(W - 2 * pad, 260), eqH - 4, 'Your rule will appear here');
      };

      /* ---------- bottom pane: the graph ---------- */
      PG.onDraw = (c, p) => {
        const pal = p.pal, g = geo(p), w = g.w, V = cur();
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
        for (let x = xs; x <= w.x + 1e-9; x += xs) tx(c, pal, num(x), X(x), by + 14, { size: fs, color: pal.muted, align: 'center' });
        for (let y = ys; y <= w.y + 1e-9; y += ys) tx(c, pal, num(y), g.L - 8, Y(y), { size: fs, color: pal.muted, align: 'right' });
        tx(c, pal, '0', g.L - 8, by + 14, { size: fs, color: pal.muted, align: 'right' });
        const named = !!V.names;
        tx(c, pal, named ? 'x = ' + V.names.x : 'x', bx - 14, p.h - 9, { size: fs, color: pal.green, align: 'right', weight: 600 });
        tx(c, pal, named ? 'y = ' + V.names.y : 'y', 8, 13, { size: fs, color: pal.red, weight: 600 });

        if (!V.graph) {
          const label = mode === 'roles' ? 'Choose which one is x and which one is y' : 'The graph is hidden for now';
          c.font = `500 ${fs * 1.1}px ${SANS}`;
          const lw = Math.min(g.pw - 8, c.measureText(label).width + 28);
          c.save(); c.fillStyle = alpha(pal.stage, .92); rrect(c, g.L + g.pw / 2 - lw / 2, g.T + g.ph / 2 - 16, lw, 32, 8); c.fill();
          c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.setLineDash([5, 5]); c.stroke(); c.restore();
          tx(c, pal, label, g.L + g.pw / 2, g.T + g.ph / 2, { size: fs * 1.1, color: pal.muted, align: 'center' });
          return;
        }

        const pts = V.cols.filter(q => !q.ask), lineAt = (m, b, x) => m * x + b;
        /* put a label where it hits the fewest of: the plot edges, the line and the dots */
        const spot = (text, hx0, hy0, size, avoid = []) => {
          c.font = `500 ${size * .85}px ${SANS}`;
          const lw = c.measureText(text).width, lhh = size * .85 + 4, hx = X(hx0), hy = Y(hy0), ln = V.line || (V.marker != null ? { m: V.m, b: V.b } : null);
          let best = null;
          [[16, -17, 'left'], [-16, -17, 'right'], [16, 17, 'left'], [-16, 17, 'right'], [16, -33, 'left'], [-16, -33, 'right'], [16, 33, 'left'], [-16, 33, 'right']].forEach(([dx, dy, al], ci) => {
            const x0 = hx + dx - (al === 'right' ? lw : 0), x1 = x0 + lw, y0 = hy + dy - lhh / 2, y1 = hy + dy + lhh / 2;
            let pen = ci * .1;
            if (x0 < g.L + 2 || x1 > bx || y0 < g.T || y1 > by - 2) pen += 40;
            if (ln) for (let t = 0; t <= 10; t++) { const px = x0 + (x1 - x0) * t / 10, ly = Y(lineAt(ln.m, ln.b, (px - g.L) / g.pw * w.x)); if (ly > y0 - 3 && ly < y1 + 3) pen += 3; }
            pts.map(q => [q.x, q.y]).concat(avoid).forEach(([qx, qy]) => { if (X(qx) > x0 - 8 && X(qx) < x1 + 8 && Y(qy) > y0 - 8 && Y(qy) < y1 + 8) pen += 6; });
            if (!best || pen < best.pen) best = { pen, dx, dy, al };
          });
          return best;
        };
        c.save(); c.beginPath(); c.rect(g.L - 2, g.T - 2, g.pw + 4, g.ph + 4); c.clip();

        /* the line: the rule being tested, the true rule, or the student's line */
        if (V.line) p.path([[0, V.line.b], [w.x, V.line.b + V.line.m * w.x]], { stroke: pal.blue, width: V.line.mine ? 3.2 : 3.5 });
        /* gaps between a dot and the rule being tested */
        if (V.cmp && V.line) pts.forEach(q => { if (!same(lineAt(V.line.m, V.line.b, q.x), q.y)) p.path([[q.x, q.y], [q.x, lineAt(V.line.m, V.line.b, q.x)]], { stroke: pal.red, width: 3, dash: [5, 4] }); });
        /* steps: 1 across and m up */
        if (V.steps > .01 && mode === 'explore') {
          const m = V.m; c.globalAlpha = V.steps;
          for (let i = 0; i < EXN; i++) {
            p.path([[i, V.b + m * i], [i + 1, V.b + m * i]], { stroke: pal.green, width: 3.4 });
            p.path([[i + 1, V.b + m * i], [i + 1, V.b + m * (i + 1)]], { stroke: pal.red, width: 3.4 });
          }
          c.globalAlpha = 1;
        } else if (V.steps > .01 && mode === 'use') {
          const l = V.line, n = V.handles ? 1 : (item().type === 'read' ? 4 : 1);
          for (let i = 0; i < n; i++) {
            p.path([[i, l.b + l.m * i], [i + 1, l.b + l.m * i]], { stroke: pal.green, width: 4 });
            p.path([[i + 1, l.b + l.m * i], [i + 1, l.b + l.m * (i + 1)]], { stroke: pal.red, width: 4 });
          }
        }
        c.restore();

        /* labels on the steps */
        if (V.steps > .01 && mode === 'explore') {
          const m = V.m;
          p.label('+1', .5, V.b, { size: fs * 1.05, italic: false, color: pal.green, dy: V.b < w.y * .08 ? -13 : 15, alpha: V.steps });
          p.label('+' + num(m), 1, V.b + m / 2, { size: fs * 1.05, italic: false, color: pal.red, dx: 9, align: 'left', alpha: V.steps });
        }
        if (V.steps > .01 && mode === 'use' && !V.handles && item().type === 'read') {
          const m = V.m, b = V.b;
          p.label('+1', .5, b, { size: fs * 1.05, italic: false, color: pal.green, dy: 15 });
          p.label('+' + num(m), 1, b + m / 2, { size: fs * 1.05, italic: false, color: pal.red, dx: 10, align: 'left' });
        }

        /* verdict while a rule is being tested */
        if (V.cmp && V.line) {
          const hit = pts.filter(q => same(lineAt(V.line.m, V.line.b, q.x), q.y)).length;
          const all = hit === pts.length;
          tx(c, pal, all ? 'The line goes through every dot' : 'The line goes through ' + hit + ' of ' + pts.length + ' dots', g.L + 12, g.T + 16, { size: fs * 1.05, color: all ? pal.green : pal.red, weight: 700, halo: true });
        }

        /* the dots (a ring marks the ones a tested line reaches or misses) */
        if (V.dots) {
          if (V.cmp && V.line) pts.forEach(q => p.dot(q.x, q.y, dr + 5, null, same(lineAt(V.line.m, V.line.b, q.x), q.y) ? pal.green : pal.red, 3));
          if (V.ring) p.dot(V.ring.x, V.ring.y, dr + 4.5, null, pal.violet, 3.2);
          pts.forEach(q => p.dot(q.x, q.y, dr, pal.yellow, pal.stage, 2));
        }
        if (V.ring) {
          p.label('(0, ' + num(V.ring.y) + ')', 0, V.ring.y, { size: fs * 1.1, italic: false, align: 'left', dx: 14, dy: -17, color: pal.violet });
        }

        /* the explore marker */
        if (V.marker != null) {
          const mx = V.marker, my = V.b + V.m * mx;
          p.path([[mx, 0], [mx, my]], { stroke: alpha(pal.green, .95), width: 2.5, dash: [6, 5] });
          p.path([[mx, my], [0, my]], { stroke: alpha(pal.red, .95), width: 2.5, dash: [6, 5] });
          p.dot(mx, my, 11.5, alpha(pal.stage, .9), pal.brass, 3.2); p.dot(mx, my, 4.5, pal.blue);
          const lab = '(' + mx + ', ' + num(my) + ')', sp = spot(lab, mx, my, fs * 1.1);
          p.label(lab, mx, my, { size: fs * 1.1, italic: false, align: sp.al, dx: sp.dx, dy: sp.dy });
        }

        /* the question point in a predict question */
        if (V.ghost) {
          const q = V.ghost, val = q.val, ax = q.find === 'y' ? q.x : val, ay = q.find === 'y' ? val : q.y;
          if (val == null) {
            c.save(); c.setLineDash([6, 6]); c.strokeStyle = pal.muted; c.lineWidth = 1.5; c.beginPath();
            if (q.find === 'y') { c.moveTo(X(q.x), by); c.lineTo(X(q.x), g.T); } else { c.moveTo(g.L, Y(q.y)); c.lineTo(bx, Y(q.y)); }
            c.stroke(); c.restore();
            if (q.find === 'y') tx(c, pal, 'x = ' + num(q.x), X(q.x), g.T + 10, { size: fs, color: pal.muted, align: 'center', halo: true });
            else tx(c, pal, 'y = ' + num(q.y), bx - 6, Y(q.y) - 11, { size: fs, color: pal.muted, align: 'right', halo: true });
          } else if (ax <= w.x && ay <= w.y) {
            if (!tk.solved) {
              const ly = lineAt(V.m, V.b, ax);
              c.save(); c.beginPath(); c.rect(g.L - 2, g.T - 2, g.pw + 4, g.ph + 4); c.clip();
              if (!same(ly, ay)) p.path([[ax, ay], [ax, ly]], { stroke: pal.red, width: 2.5, dash: [4, 4] });
              c.restore();
            }
            p.path([[ax, 0], [ax, ay]], { stroke: alpha(pal.green, .95), width: 2.5, dash: [6, 5] });
            p.path([[ax, ay], [0, ay]], { stroke: alpha(pal.red, .95), width: 2.5, dash: [6, 5] });
            if (tk.solved) p.dot(ax, ay, dr + 2, pal.yellow, pal.green, 3);
            else p.dot(ax, ay, dr + 1, alpha(pal.stage, .9), pal.muted, 2.5);
            const lab = '(' + num(ax) + ', ' + num(ay) + ')', left = ax > w.x * .6;
            p.label(lab, ax, ay, { size: fs * 1.1, italic: false, align: left ? 'right' : 'left', dx: left ? -12 : 12, dy: left ? -15 : 17 });
          } else {
            const right = ax > w.x, px = right ? bx - 8 : clamp(X(ax), g.L + 10, bx - 10), py = right ? clamp(Y(ay), g.T + 10, by - 10) : g.T + 8;
            c.fillStyle = pal.muted; c.beginPath();
            if (right) { c.moveTo(px + 6, py); c.lineTo(px - 6, py - 7); c.lineTo(px - 6, py + 7); } else { c.moveTo(px, py - 6); c.lineTo(px - 7, py + 6); c.lineTo(px + 7, py + 6); }
            c.closePath(); c.fill();
            tx(c, pal, '(' + num(ax) + ', ' + num(ay) + ') is off the graph', clamp(px, 150, p.w - 16), right ? py + 16 : py + 20, { size: fs, color: pal.muted, align: 'right', halo: true });
          }
        }

        /* the two rings of the build question */
        if (V.handles) {
          const hx = [[0, bd.b], [1, bd.b + bd.m]];
          hx.forEach(([x, y]) => { p.dot(x, y, 11.5, alpha(pal.stage, .9), pal.brass, 3.2); p.dot(x, y, 4.5, pal.blue); });
          hx.forEach(([x, y], i) => { const lab = '(' + x + ', ' + num(y) + ')', sp = spot(lab, x, y, fs * 1.05, [hx[1 - i]]); p.label(lab, x, y, { size: fs * 1.05, italic: false, align: sp.al, dx: sp.dx, dy: sp.dy }); });
        }
        if (isBuild() && tk.solved) {
          const it = item(), hx = [[0, it.b], [1, it.b + it.m]];
          hx.forEach(([x, y], i) => { const lab = '(' + x + ', ' + num(y) + ')', sp = spot(lab, x, y, fs * 1.05, [hx[1 - i]]); p.label(lab, x, y, { size: fs * 1.05, italic: false, align: sp.al, dx: sp.dx, dy: sp.dy }); });
        }
      };

      /* ---------- the panel ---------- */
      const probe = C.readout(), host = probe.parentElement; probe.remove();
      const grp = () => h('div', { style: 'display:flex;flex-direction:column;gap:16px' });
      const gExp = grp(), gQ = grp(), gTools = grp(), gNext = grp();
      const fb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
      const hintEl = h('p', { class: 'hint' });
      host.append(gExp, gQ, fb, gNext, gTools, hintEl);

      const selSit = C.select({ label: 'Situation', value: ex.sit, options: EXORDER.map(id => ({ value: id, label: EXP[id].name })),
        onChange: v => { cancel(); ex.sit = v; st.x = 2; sync(); } });
      gExp.append(selSit.parentElement);
      const xS = C.slider({ label: 'x (the one you choose)', min: 0, max: EXN, step: 1, value: st.x, format: v => num(v), onInput: v => editX(v) });
      const xRow = host.lastElementChild; gExp.append(xRow);
      const xLab = xRow.querySelector('label');
      const fade = key => on => { cancel(); want[key] = on ? 1 : 0; cancel = animateTo(st, { [key]: on ? 1 : 0 }, 300, sync); };
      const tgSteps = C.toggle({ label: 'Show the changes', value: false, onChange: fade('steps') });
      gExp.append(tgSteps.parentElement);
      const tgRule = C.toggle({ label: 'Show what the rule gives', value: false, onChange: on => { bd.rule = on ? 1 : 0; sync(); } });
      gTools.append(tgRule.parentElement);
      const nextBtn = C.buttons([{ label: 'Next question', primary: true, onClick: () => nextQ() }])[0];
      gNext.append(nextBtn.parentElement);

      const qHead = h('p', { class: 'hint', style: 'margin:0' }), qText = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' }), qList = h('div', { style: 'display:flex;flex-direction:column;gap:8px' });
      gQ.append(qHead, qText, qList);

      const reveal = () => { try { (tk.solved ? gNext : fb).scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' }); } catch (e) {} };
      const say = (okk, html) => { tk.msg = (okk ? good('Right. ') : bad('Not quite. ')) + html; };

      /* the feedback while exploring */
      const fbExplore = () => {
        const S = EXP[ex.sit], x = xi(), y = fx(S, x), hit = same(y, S.goal);
        let s = S.say(x, y);
        if (want.steps) s += ` <span class="k">Each time x goes up 1, y goes up ${num(S.m)}.</span>`;
        s += '<br>';
        if (hit) s += good('Challenge solved. ') + S.done;
        else s += `<span class="k">Challenge: ${S.ask}${ex.done[ex.sit] ? ' (You solved this one before.)' : ''} ` + (y < S.goal ? 'Right now y is too small, so move x to the right.' : 'Right now y is too big, so move x to the left.') + '</span>';
        return s;
      };
      /* the feedback while building a graph from a rule */
      const fbBuild = () => {
        const it = item(), { b, m } = bd, okS = b === it.b, okM = m === it.m;
        let s = `Your line starts at (0, ${b}) and goes up ${m} for each step right. That is ${linEq(m, b)}.<br>`;
        if (!okS && !okM) s += bad('Neither part matches the rule yet. ') + 'Work out y when x = 0 for the start. Then find the number that multiplies x for the step.';
        else if (!okS) s += bad('The step is right, but the start is not. ') + 'Put x = 0 into the rule and see what y is.';
        else s += bad('The start is right, but the step is not. ') + 'The step is the number that multiplies x in the rule.';
        s += `<br><span class="k">${bd.rule ? 'Compare your line with the rule in the table.' : 'Tip: switch on "Show what the rule gives" to compare in the table.'}</span>`;
        return s;
      };
      const idle = () => mode === 'use' ? (item().type === 'predict' ? IDLE.predict : IDLE.read) : IDLE[mode];
      const renderFb = () => {
        fb.innerHTML = mode === 'explore' ? fbExplore() : isBuild() && !tk.solved ? fbBuild() : (tk.msg || `<span class="k">${idle()}</span>`);
      };

      const hints = () => {
        const it = item();
        hintEl.textContent = mode === 'explore' ? 'Drag across the graph, tap a table column, or use the slider. Try the other situations in the menu too.'
          : mode === 'roles' ? (tk.stage === 1 ? 'A variable is a quantity that changes. Does each one change?' : 'Ask: which quantity do I pick first, and which one responds?')
          : mode === 'rule' ? 'Test the rule on the first column, then on the others. Every column must match.'
          : it.type === 'build' ? 'Drag the left ring to move the whole line up or down. Drag the right ring to tilt it.'
          : it.type === 'read' ? 'Look at the y row of the table and at the dots on the graph.'
          : 'Put the number into the rule, then check where your answer lands on the graph.';
      };
      const tools = () => { gTools.style.display = isBuild() ? 'flex' : 'none'; tgRule.parentElement.style.display = isBuild() ? '' : 'none'; };

      const sync = () => {
        xS.set(st.x); tgSteps.checked = !!want.steps; tgRule.checked = !!bd.rule;
        if (mode === 'explore') xLab.textContent = EXP[ex.sit].xLab + ' (the one you choose)';
        selSit.value = ex.sit;
        vc = null; PT.draw(); PG.draw(); renderFb();
      };
      const editX = v => {
        cancel(); st.x = clamp(Math.round(v), 0, EXN);
        const S = EXP[ex.sit]; if (same(fx(S, xi()), S.goal)) ex.done[ex.sit] = true;
        sync();
      };

      /* ---------- the questions ---------- */
      const mkBtn = (inner, onclick, style = '') => {
        const b = h('button', { type: 'button', class: 'btn', style: 'justify-content:flex-start;text-align:left;border-radius:10px;width:100%;padding:8px 14px;line-height:1.35;' + style, onclick });
        b.innerHTML = `<span>${inner}</span>`; return b;   /* one child, so the flex button does not split the math into pieces */
      };
      const mark = (b, okk) => {
        b.style.borderColor = okk ? 'var(--green)' : 'var(--red)';
        b.style.background = `color-mix(in srgb, var(--${okk ? 'green' : 'red'}) ${okk ? 16 : 12}%, transparent)`;
        if (!okk) b.disabled = true;
      };
      const lock = () => tk.btns.forEach(b => { if (!b.dataset.right) b.disabled = true; });
      const resetTk = () => { tk.stage = 1; tk.solved = false; tk.picked = false; tk.cand = null; tk.msg = ''; tk.btns = []; };
      const finished = () => { nextBtn.textContent = qi === ITEMS().length - 1 ? 'Start again' : 'Next question'; gNext.style.display = 'flex'; };

      const done = () => {  /* a question was solved: lock the other choices, offer the next one */
        tk.solved = true; lock();
        const last = qi === ITEMS().length - 1;
        if (mode === 'roles') {
          tk.msg += '<br><br>Now x goes on the bottom axis and y goes up the side. The table lists x first, and the graph shows the dots.';
          if (last) tk.msg += '<br><br>That was the last situation. A variable is a quantity that changes. The independent variable is the one you choose, and the dependent variable responds.';
        }
        if (mode === 'rule') {
          if (last) tk.msg += '<br><br>That was the last question. To write a rule: find how much y changes for each 1 step in x, find y when x = 0, then test every column.';
        }
        if (mode === 'use' && last) tk.msg += '<br><br>That was the last question. A rule gives y from x. The table lists some of its pairs, and the graph shows them all. The number that multiplies x is the change for each step, and the number that is added is where the graph starts.';
        finished(); tools();
      };

      const buildQ = () => {
        qList.textContent = ''; gNext.style.display = 'none'; tk.btns = [];
        const it = item(); hints(); tools();
        if (!it) return;
        qHead.textContent = mode === 'roles' ? `Situation ${qi + 1} of ${ROLES.length}, part ${tk.stage} of 2` : `Question ${qi + 1} of ${ITEMS().length}`;
        qText.textContent = mode === 'roles'
          ? (tk.stage === 1 ? 'Which two quantities change together?' : 'Which one is the independent variable, the one you choose? The other one is the dependent variable.')
          : it.q;
        if (isBuild()) return;
        let list;
        if (mode === 'roles') list = tk.stage === 1 ? it.pair.map(p2 => ({ html: p2.t, ok: p2.ok })) : [{ html: it.A.long, ok: it.ind === 'A' }, { html: it.B.long, ok: it.ind === 'B' }];
        else if (mode === 'rule') list = it.choices.map(ch => ({ html: mathHtml(ch.t), ok: ch.ok }));
        else list = it.choices.map(ch => ({ html: it.type === 'predict' ? ch.label : ch.t, ok: ch.ok }));
        list.forEach((ch, i) => {
          const b = mkBtn(ch.html, () => pick(i, b), mode === 'rule' ? 'font-size:1.02rem' : '');
          if (ch.ok) b.dataset.right = '1';
          tk.btns.push(b); qList.append(b);
        });
      };

      /* the test of a rule against every column, in words */
      const testHtml = (it, c0) => {
        const miss = it.xs.filter(x => !same(c0.m * x + c0.b, fx(it, x))), n = it.xs.length;
        if (!miss.length) return `<br><span class="k">Test: the rule matches all ${n} columns.</span>`;
        const x = miss[0], first = it.xs.indexOf(x) + 1;
        return `<br>${bad('Test:')} <span class="k">it matches ${n - miss.length} of ${n} columns. ` +
          (first === 1 ? 'Column 1 already breaks. ' : first === 2 ? 'Column 1 fits, but column 2 breaks. ' : `The first ${first - 1} columns fit, but column ${first} breaks. `) +
          `At x = ${x} the rule gives ${num(c0.m * x + c0.b)}, but ${SRC[it.given]} ${num(fx(it, x))}.</span>`;
      };

      const pick = (i, b) => {
        if (tk.solved) return;
        const it = item();
        if (mode === 'roles') {
          if (tk.stage === 1) {
            const ch = it.pair[i];
            mark(b, !!ch.ok); say(!!ch.ok, ch.why);
            if (ch.ok) { tk.stage = 2; const keep = tk.msg; buildQ(); tk.msg = keep; }
          } else {
            const okk = (i === 0 ? 'A' : 'B') === it.ind;
            mark(b, okk);
            say(okk, okk ? it.indWhy : it.depWhy);
            if (okk) { tk.btns[i].dataset.right = '1'; done(); }
          }
          sync(); reveal(); return;
        }
        const ch = it.choices[i];
        tk.picked = true;
        if (mode === 'rule') tk.cand = ch;
        else tk.cand = ch.v;
        mark(b, !!ch.ok); say(!!ch.ok, ch.why + (mode === 'rule' ? testHtml(it, ch) : ''));
        if (ch.ok) done();
        sync(); reveal();
      };
      const nextQ = () => {
        cancel();
        const last = qi === ITEMS().length - 1;
        loadQ(last ? 0 : qi + 1);
      };
      const loadQ = i => {
        qi = i; resetTk();
        bd.b = 0; bd.m = 1; bd.rule = 0;
        buildQ(); sync();
      };
      const setMode = (m, i) => {
        mode = m;
        gExp.style.display = m === 'explore' ? 'flex' : 'none';
        gQ.style.display = m === 'explore' ? 'none' : 'flex';
        if (m === 'explore') { resetTk(); buildQ(); sync(); } else loadQ(i || 0);
      };

      /* the build question: has the student matched the rule? */
      const editBuild = () => {
        const it = item();
        if (bd.b === it.b && bd.m === it.m) {
          tk.msg = good('Your line matches the rule. ') + `It starts at (0, ${it.b}) because y = ${it.m} × 0 + ${it.b} = ${it.b}. Each 1 step right it goes up ${it.m}, the number that multiplies x. The table agrees in every column: your line gives the same numbers as the rule.`;
          done();
        }
        sync();
      };

      /* dragging: any spot on the graph picks x while exploring, and two rings set the start and the step */
      draggable(PG, {
        hit: (px, py) => {
          const g = geo(PG);
          if (mode === 'explore') return px > g.L - 8 && px < g.L + g.pw + 8 && py > g.T - 8 && py < g.T + g.ph + 8 ? 'x' : null;
          if (isBuild() && !tk.solved) {
            const d0 = Math.hypot(PG.X(0) - px, PG.Y(bd.b) - py), d1 = Math.hypot(PG.X(1) - px, PG.Y(bd.b + bd.m) - py);
            return Math.min(d0, d1) > 26 ? null : d1 < d0 ? 'm' : 'b';
          }
          return null;
        },
        move: (hd, mx, my) => {
          if (hd === 'x') { editX(snap(mx, 1)); return; }
          const w = item().win;
          if (hd === 'b') bd.b = clamp(snap(my, 1), 0, w.y - bd.m);
          else bd.m = clamp(snap(my, 1) - bd.b, 0, w.y - bd.b);
          editBuild();
        }
      });
      draggable(PT, {
        hit: (px, py) => mode === 'explore' && tg && px >= tg.x0 + tg.lw && px <= tg.x0 + tg.lw + tg.cw * tg.n && py >= tg.ty - 6 && py <= tg.ty + tg.tH + 6 ? 'c' : null,
        move: (hd, px) => { if (tg) editX(clamp(Math.floor((px - tg.x0 - tg.lw) / tg.cw), 0, EXN)); }
      });

      /* guided steps */
      const apply = (patch, immediate) => {
        cancel();
        const { mode: m, qi: i, sit, ...rest } = patch;
        if (sit !== undefined) ex.sit = sit;
        if (m !== undefined) setMode(m, i);
        if (rest.steps !== undefined) want.steps = rest.steps > .5 ? 1 : 0;
        if (immediate) { Object.assign(st, rest); sync(); } else cancel = animateTo(st, rest, 700, sync);
      };
      setMode('roles'); sync();
      return { destroy: () => { cancel(); PT.destroy(); PG.destroy(); }, apply };
    }
  });
}
