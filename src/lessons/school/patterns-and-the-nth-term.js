/* =====================================================================
   SCHOOL — Patterns and the nth term
   ===================================================================== */
{
  const MI = '−';
  const kk = t => `<span class="k">${t}</span>`;
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const lines = a => a.filter(Boolean).join('<br>');
  const sg = v => (v < 0 ? MI : '+') + Math.abs(v);
  const FONT = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
  const roleCol = (pal, r) => [pal.blue, pal.green, pal.yellow, pal.violet][r];

  /* ---------- the four patterns ---------- */
  const piece = (k, x, y, b, id, extra) => Object.assign({ k, x, y, b, id, nw: false }, extra);
  const PATS = [
    { key: 'sticks', name: 'Toothpick squares (linear)', unit: 'sticks', lin: true, nested: true, A: 3, B: 1, ymax: 35, ystep: 5,
      cnt: n => 3 * n + 1,
      gen: n => {
        const a = [piece('v', 0, 0, 0, 'v0')];
        for (let s = 1; s <= n; s++) a.push(piece('h', s - 1, 0, s, 't' + s), piece('h', s - 1, 1, s, 'u' + s), piece('v', s, 0, s, 'r' + s));
        a.forEach(q => { q.nw = q.b === n && n >= 2; });
        return a;
      },
      ways: [
        { name: 'n groups of 3, plus 1 extra', expr: '3n + 1', role: q => (q.b === 0 ? 2 : q.b % 2 ? 0 : 1), cap: n => `${n} groups of 3, plus 1 extra stick`, ev: n => `${n} × 3 + 1 = ${3 * n + 1}` },
        { name: 'Start with 4, add 3 each step', expr: '4 + 3(n − 1)', role: q => (q.b <= 1 ? 0 : q.b % 2 ? 1 : 3), cap: n => `4 sticks, then ${n - 1} groups of 3`, ev: n => `4 + 3(${n} − 1) = 4 + ${3 * (n - 1)} = ${3 * n + 1}` }
      ],
      eq: '4 + 3(n − 1) = 4 + 3n − 3 = 3n + 1',
      rate: 'each new square adds 3 sticks', start: 'the extra stick at the left end',
      opts: [
        { t: '4n', f: n => 4 * n, why: 'Check Figure 2: 4 × 2 = 8, but the figure has 7 sticks. The rule 4n counts 4 sticks for every square, but neighbors share a stick. Its line is too steep.' },
        { t: '3n + 1', f: n => 3 * n + 1, ok: true, why: 'Check: 3 × 1 + 1 = 4, 3 × 2 + 1 = 7, 3 × 3 + 1 = 10. The line hits every dot.' },
        { t: '3n', f: n => 3 * n, why: 'Check Figure 1: 3 × 1 = 3, but Figure 1 has 4 sticks. The rule 3n has the right rate but misses the extra stick at the left end, so every count is 1 too low.' },
        { t: 'n + 3', f: n => n + 3, why: 'Check Figure 2: 2 + 3 = 5, but the figure has 7 sticks. The rule n + 3 adds only 1 per figure. This pattern adds 3 per figure.' }
      ] },
    { key: 'border', name: 'Tile border (linear)', unit: 'tiles', lin: true, nested: false, A: 4, B: 4, ymax: 45, ystep: 5,
      cnt: n => 4 * n + 4,
      gen: n => {
        const a = [], s = n + 1, add = (x, y, arm, cn) => a.push(piece('t', x, y, n, `${arm}_${x}_${y}`, { arm, cn }));
        for (let x = 0; x <= n; x++) add(x, 0, 0, x === 0);
        for (let y = 0; y <= n; y++) add(s, y, 1, y === 0);
        for (let x = n + 1; x >= 1; x--) add(x, s, 2, x === n + 1);
        for (let y = n + 1; y >= 1; y--) add(0, y, 3, y === n + 1);
        [n, 2 * n + 1, 3 * n + 2, 4 * n + 3].forEach(i => { a[i].nw = n >= 2; });      /* the last tile of each side */
        return a;
      },
      ways: [
        { name: '4 sides, each with n + 1 tiles', expr: '4(n + 1)', role: q => q.arm % 2, cap: n => `4 sides of ${n + 1} tiles`, ev: n => `4 × (${n} + 1) = 4 × ${n + 1} = ${4 * n + 4}` },
        { name: '4 corners, plus 4 sides of n', expr: '4n + 4', role: q => (q.cn ? 2 : 0), cap: n => `4 sides of ${n}, plus 4 corners`, ev: n => `4 × ${n} + 4 = ${4 * n + 4}` }
      ],
      eq: '4(n + 1) = 4n + 4',
      rate: 'each side of the ring gets 1 tile longer, so 4 more tiles in all', start: 'the 4 corner tiles',
      opts: [
        { t: '4n + 8', f: n => 4 * n + 8, why: 'Check Figure 1: 4 × 1 + 8 = 12, but Figure 1 has 8 tiles. The 8 is the count AT Figure 1. The rule needs the count at n = 0, which is 4.' },
        { t: '4n', f: n => 4 * n, why: 'Check Figure 1: 4 × 1 = 4, but Figure 1 has 8 tiles. The rule 4n has the right rate but forgets the 4 corner tiles, so every count is 4 too low.' },
        { t: '4n + 4', f: n => 4 * n + 4, ok: true, why: 'Check: 4 × 1 + 4 = 8, 4 × 2 + 4 = 12, 4 × 3 + 4 = 16. The line hits every dot.' },
        { t: '8n', f: n => 8 * n, why: 'Check Figure 2: 8 × 2 = 16, but Figure 2 has 12 tiles. The rule 8n would double the count from Figure 1 to Figure 2. The pattern adds only 4 each time.' }
      ] },
    { key: 'stairs', name: 'Staircase (not linear)', unit: 'tiles', lin: false, nested: true, ymax: 60, ystep: 10,
      cnt: n => n * (n + 1) / 2,
      gen: n => {
        const a = [];
        for (let r = 0; r < n; r++) for (let c = 0; c <= r; c++) a.push(piece('t', c, r, r + 1, `${c}_${r}`, { nw: r + 1 === n && n >= 2 }));
        return a;
      },
      rate: '', start: '',
      opts: [
        { t: 'n(n + 1)/2', f: n => n * (n + 1) / 2, ok: true, why: 'Check: 1 × 2 ÷ 2 = 1, 2 × 3 ÷ 2 = 3, 3 × 4 ÷ 2 = 6, 4 × 5 ÷ 2 = 10. It hits every dot, and it is a curve, not a line. Two copies of the staircase fit into a rectangle n tall and n + 1 wide, and one copy is half of it.' },
        { t: '2n − 1', f: n => 2 * n - 1, why: 'Check: Figure 1 gives 1 and Figure 2 gives 3, but Figure 3 gives 5, not 6. A line through the first two dots misses the rest. No straight-line rule can match counts that are not linear.' },
        { t: 'n²', f: n => n * n, why: 'Check Figure 2: 2² = 4, but Figure 2 has 3 tiles. The rule n² is the square-number pattern, a different pattern.' }
      ] },
    { key: 'squares', name: 'Square numbers (not linear)', unit: 'tiles', lin: false, nested: true, ymax: 100, ystep: 20,
      cnt: n => n * n,
      gen: n => {
        const a = [];
        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) a.push(piece('t', c, r, Math.max(r, c) + 1, `${c}_${r}`));
        a.forEach(q => { q.nw = q.b === n && n >= 2; });
        return a;
      },
      rate: '', start: '',
      opts: [
        { t: '3n − 2', f: n => 3 * n - 2, why: 'Check: Figure 1 gives 1 and Figure 2 gives 4, which match. But Figure 3 gives 7, not 9. A line through the first two dots misses the rest. Matching two counts is not enough.' },
        { t: 'n²', f: n => n * n, ok: true, why: 'Check: 1, 4, 9, 16. It hits every dot, and it is a curve, not a line. An n by n square has n × n tiles.' },
        { t: '2n − 1', f: n => 2 * n - 1, why: 'Check Figure 2: 2 × 2 − 1 = 3, but Figure 2 has 4 tiles. The rule 2n − 1 gives the odd numbers 1, 3, 5. Those are the NEW tiles in each figure, not the total.' }
      ] }
  ];
  const dimsOf = (pi, n, copy) => {
    if (pi === 0) return [n, 1];
    if (pi === 1) return [n + 2, n + 2];
    return [copy && pi === 2 ? n + 1 : n, n];
  };

  /* ---------- predictions ---------- */
  const PRED = [
    { f5: { q: 'Figures 1 to 4 use 4, 7, 10 and 13 sticks. How many sticks will Figure 5 need?', a: 1,
            o: [['15 sticks', 'That adds only 2 to Figure 4. Look at the new part in Figure 4: it adds 3 sticks, not 2. So Figure 5 needs 13 + 3 = 16.'],
                ['16 sticks', 'The change was +3 each time, so 13 + 3 = 16.'],
                ['17 sticks', 'That adds 4. A new square shares one stick with the square before it, so it needs only 3 new sticks. So Figure 5 needs 13 + 3 = 16.'],
                ['20 sticks', '5 squares times 4 sticks would be 20, but neighbors share a stick. So there are fewer: 13 + 3 = 16.']] },
      f10: { q: 'Figure 10 is a row of ten squares. How many sticks will it need?', a: 2,
             o: [['32 sticks', 'That doubles Figure 5 (16). Doubling the figure number does not double the count, because the extra stick at the left end is counted only once. The count is 31.'],
                 ['30 sticks', '3 × 10 = 30 forgets the extra stick at the left end. Figure 1 would be 3, but it has 4. The count is 30 + 1 = 31.'],
                 ['31 sticks', 'Ten squares each add 3 sticks (30), plus the 1 stick at the left end: 31. Also 4 + 9 × 3 = 31.'],
                 ['40 sticks', '10 × 4 = 40 counts the shared sticks twice. The count is 31.']] },
      chg: { q: 'Look at Figures 1 to 4. As the row grows, will the number of NEW sticks stay the same each time?', a: 0,
             o: [['Yes, the same every time', 'Each new square adds a top, a bottom and a right stick: 3 new sticks every time.'],
                 ['No, it grows each time', 'Every new square has the same shape, so it needs the same number of new sticks: 3.'],
                 ['No, it shrinks each time', 'Every new square has the same shape, so it needs the same number of new sticks: 3.']] } },
    { f5: { q: 'Figures 1 to 4 use 8, 12, 16 and 20 tiles in a ring around a square. How many tiles will Figure 5 need?', a: 1,
            o: [['22 tiles', 'That adds only 2. Look at the ring: every side is one tile longer, and there are 4 sides. So the ring grows by 4: 20 + 4 = 24.'],
                ['24 tiles', 'The ring grew by 4 each time, so 20 + 4 = 24.'],
                ['25 tiles', '25 is 5 × 5, the number of tiles in a square. The question is about the ring only. The ring grows by 4: 20 + 4 = 24.'],
                ['28 tiles', '4 × 7 = 28 counts each corner twice. The sides share their corner tiles. The ring grows by 4: 20 + 4 = 24.']] },
      f10: { q: 'How many tiles will the ring in Figure 10 need?', a: 2,
             o: [['48 tiles', 'That doubles Figure 5 (24). Doubling the figure number does not double the count. The count is 44.'],
                 ['40 tiles', '4 × 10 = 40 forgets the 4 corner tiles. The count is 40 + 4 = 44.'],
                 ['44 tiles', 'Each of the 4 sides has 10 + 1 = 11 tiles: 4 × 11 = 44. Also 8 + 9 × 4 = 44.']] },
      chg: { q: 'Look at Figures 1 to 4. As the ring grows, will the number of NEW tiles stay the same each time?', a: 0,
             o: [['Yes, the same every time', 'Each of the 4 sides gets 1 tile longer, so the ring gains 4 tiles every time.'],
                 ['No, it grows each time', 'Each side gets only 1 tile longer, whatever the figure. So the ring gains 4 tiles every time.'],
                 ['No, it shrinks each time', 'Each side gets 1 tile longer, whatever the figure. So the ring gains 4 tiles every time.']] } },
    { f5: { q: 'Figures 1 to 4 of the staircase use 1, 3, 6 and 10 tiles. Each figure adds a new bottom row. How many tiles will Figure 5 need?', a: 1,
            o: [['14 tiles', 'That adds 4 again. But the new bottom row gets longer each time. Figure 5 has a bottom row of 5 tiles: 10 + 5 = 15.'],
                ['15 tiles', 'The new bottom row of Figure 5 has 5 tiles: 10 + 5 = 15.'],
                ['16 tiles', '16 is 4 × 4, a square number, not the staircase. The new bottom row has 5 tiles: 10 + 5 = 15.']] },
      f10: { q: 'The staircase in Figure 10 has rows of 1, 2, 3, and so on up to 10 tiles. How many tiles in all?', a: 1,
             o: [['30 tiles', 'That doubles Figure 5 (15). The staircase grows faster than that. 1 + 2 + ... + 10 = 55.'],
                 ['55 tiles', '1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 = 55.'],
                 ['100 tiles', '10 × 10 would fill a whole square. The staircase is only about half of it. 1 + 2 + ... + 10 = 55.']] },
      chg: { q: 'Look at Figures 1 to 4 of the staircase. Will the number of NEW tiles stay the same each time?', a: 1,
             o: [['Yes, the same every time', 'The new bottom row is one tile longer each time: 2, 3, 4 tiles. It is not the same.'],
                 ['No, it grows each time', 'The new bottom row has 2 tiles, then 3, then 4. The new part itself grows.'],
                 ['No, it shrinks each time', 'The new bottom row gets longer, not shorter: 2, 3, 4 tiles.']] } },
    { f5: { q: 'Figures 1 to 4 of the square pattern use 1, 4, 9 and 16 tiles. How many tiles will Figure 5 need?', a: 0,
            o: [['25 tiles', 'Figure 5 is a 5 by 5 square: 5 × 5 = 25. The new L-shaped part has 9 tiles: 16 + 9 = 25.'],
                ['20 tiles', 'That adds 4 again. But the changes are growing: 3, 5, 7, 9. So 16 + 9 = 25.'],
                ['24 tiles', 'That adds 8. The new L-shaped part of Figure 5 has 9 tiles: 16 + 9 = 25.']] },
      f10: { q: 'How many tiles will Figure 10, a 10 by 10 square, need?', a: 2,
             o: [['20 tiles', '2 × 10 = 20 adds instead of multiplying. A 10 by 10 square has 10 × 10 = 100 tiles.'],
                 ['50 tiles', 'That doubles Figure 5 (25). Square numbers grow faster than that: 10 × 10 = 100.'],
                 ['100 tiles', '10 rows of 10 tiles: 10 × 10 = 100.']] },
      chg: { q: 'Look at Figures 1 to 4 of the square pattern. Will the number of NEW tiles stay the same each time?', a: 1,
             o: [['Yes, the same every time', 'The new L-shaped part grows: 3, 5, 7 tiles. It is not the same.'],
                 ['No, it grows each time', 'The new L-shaped part has 3 tiles, then 5, then 7. The new part itself grows.'],
                 ['No, it shrinks each time', 'The new L-shaped part gets bigger: 3, 5, 7 tiles.']] } }
  ];

  /* ---------- practice problems (a fixed list) ---------- */
  const PROBS = [
    { name: 'Find the 20th term', pat: 1, ns: [1, 2, 3], pts: [[1, 8], [2, 12], [3, 16]], g: [4, 20, 4], nl: 'Figure n', cl: 'Tiles', ans: 2,
      q: 'A ring of tiles surrounds a square. Figure 1 uses 8 tiles, Figure 2 uses 12 and Figure 3 uses 16. The count goes up by 4 each time. How many tiles does Figure 20 use?',
      ch: [['80 tiles', '4 × 20 = 80 forgets the 4 corner tiles. Test it on Figure 1: 4 × 1 = 4, but Figure 1 has 8 tiles.'],
           ['88 tiles', 'That adds 4 a total of 20 times, to the 8 in Figure 1. But going from Figure 1 to Figure 20 takes only 19 steps. This is the off-by-one trap.'],
           ['84 tiles', 'The rule is 4n + 4. Check it: 4 × 1 + 4 = 8 and 4 × 2 + 4 = 12. For Figure 20: 4 × 20 + 4 = 84. Also 8 + 19 × 4 = 84.'],
           ['160 tiles', '8 × 20 = 160 treats the pattern as repeating 8. But the count adds 4 each time, it does not multiply.']] },
    { name: 'Which figure?', pat: 0, ns: [1, 2, 3], pts: [[1, 4], [2, 7], [3, 10]], g: [4, 12, 4], nl: 'Figure n', cl: 'Sticks', ans: 3,
      q: 'Toothpick squares in a row use 4, 7 and 10 sticks in Figures 1, 2 and 3. The number of sticks in Figure n is 3n + 1. Which figure uses exactly 100 sticks?',
      ch: [['Figure 34', 'That rounds 100 ÷ 3 up, but the rule has a + 1 to deal with first. Check: 3 × 34 + 1 = 103, not 100.'],
           ['Figure 99', 'Solving 3n + 1 = 100 gives 3n = 99. That is 3n, not n. Divide by 3 as the last step.'],
           ['Figure 25', '100 ÷ 4 = 25 assumes 4 sticks per square. But the rule is 3n + 1. Check: 3 × 25 + 1 = 76.'],
           ['Figure 33', 'Solve 3n + 1 = 100. Take away 1: 3n = 99. Divide by 3: n = 33. Check: 3 × 33 + 1 = 100.']] },
    { name: 'Choose the nth term', pts: [[1, 5], [2, 8], [3, 11], [4, 14]], g: [5, 20, 5], nl: 'Figure n', cl: 'Count', ans: 0,
      q: 'A pattern has 5, 8, 11 and 14 dots in Figures 1, 2, 3 and 4. Which rule gives the number of dots in Figure n?',
      ch: [['3n + 2', 'The rate is 3, because the count goes up by 3 each time. Figure 0 would have 5 − 3 = 2 dots. Check: 3 × 1 + 2 = 5 and 3 × 2 + 2 = 8.'],
           ['5n', '5n gives 5, 10, 15. The first count is 5, but the pattern adds 3 each time, so it is not 5 times the figure number.'],
           ['3n + 5', 'The rate 3 is right, but 5 is the count at n = 1, not at n = 0. Check: 3 × 1 + 5 = 8, but Figure 1 has 5 dots.'],
           ['3n', '3n gives 3, 6, 9. The rate is right, but every count is 2 too low. Check: 3 × 1 = 3, but Figure 1 has 5 dots.']] },
    { name: 'Linear or not?', pat: 3, ns: [1, 2, 3, 4], pts: [[1, 1], [2, 4], [3, 9], [4, 16]], g: [5, 20, 5], nl: 'Figure n', cl: 'Tiles', ans: 1,
      q: 'Square tiles are laid in squares. Figure 1 has 1 tile, Figure 2 has 4 tiles, Figure 3 has 9 tiles and Figure 4 has 16 tiles. Is this a linear pattern?',
      ch: [['Yes, because the count keeps going up.', 'Going up is not enough. A linear pattern goes up by the SAME amount each time. Here the changes are 3, 5, 7.'],
           ['No, because the changes 3, 5 and 7 are not constant.', 'The new L-shaped part has 3 tiles, then 5, then 7. A linear pattern has a constant change, so this one is not linear. The dots curve upward.'],
           ['Yes, because the first change is 3, so the rate is 3.', 'One change is not enough. You must check all of them. The next changes are 5 and 7, so there is no one rate.'],
           ['No, because 16 is not a multiple of 3.', 'Multiples do not decide it. What matters is whether the change from figure to figure is constant. Here it is 3, 5, 7, so it is not.']] },
    { name: 'Spot the off-by-one', pts: [[1, 7], [2, 11], [3, 15], [4, 19]], g: [5, 20, 5], nl: 'Figure n', cl: 'Count', ans: 3,
      q: 'A pattern has 7, 11, 15 and 19 dots in Figures 1 to 4. Dev writes the rule 7 + 4n. He tests Figure 1 and gets 11, but Figure 1 has 7 dots. What is the mistake and the fix?',
      ch: [['The rate should be 7, so the rule is 7n.', 'The count goes up by 4 each time, so the rate is 4. And 7n would give 14 for Figure 2, not 11.'],
           ['There is no mistake. 11 is just the next figure.', 'The rule must give the count of THIS figure. Figure 1 has 7 dots, so a rule that gives 11 for n = 1 is wrong.'],
           ['The rule should be 4n, with no 7.', 'Check Figure 1: 4 × 1 = 4, but Figure 1 has 7 dots. The start does matter.'],
           ['Figure 1 is the start, so only n − 1 steps of 4 are added: 7 + 4(n − 1), which is 4n + 3.', 'Figure 1 has 0 steps of 4 behind it, Figure 2 has 1 step, Figure n has n − 1 steps. Check: 7 + 4(1 − 1) = 7 and 7 + 4(2 − 1) = 11.']] },
    { name: 'Stacking cups', pts: [[1, 12], [2, 14], [3, 16]], g: [4, 20, 4], nl: 'Cups n', cl: 'Height (cm)', ans: 1,
      q: 'One cup is 12 cm tall. Each extra cup in a stack adds 2 cm, so 2 cups are 14 cm tall and 3 cups are 16 cm tall. How tall is a stack of 15 cups?',
      ch: [['42 cm', '12 + 2 × 15 = 42 adds 2 cm fifteen times. But the first cup is already counted in the 12, so only 14 extra cups add 2 cm.'],
           ['40 cm', 'The first cup is 12 cm. The other 14 cups add 2 cm each: 12 + 14 × 2 = 12 + 28 = 40. The rule is 2n + 10, and 2 × 15 + 10 = 40.'],
           ['30 cm', '2 × 15 = 30 ignores that the first cup is taller than the others. The rule needs the 10 cm start: 2n + 10.'],
           ['27 cm', '12 + 15 = 27 adds the number of cups, not 2 cm for each. Each extra cup adds 2 cm.']] },
    { name: 'Tables and chairs', pts: [[1, 4], [2, 6], [3, 8]], g: [4, 10, 2], nl: 'Tables n', cl: 'People', ans: 2,
      q: 'Square tables are pushed together in a row. One table seats 4 people, 2 tables seat 6 people and 3 tables seat 8 people. The number of people for n tables is 2n + 2. How many tables seat exactly 20 people?',
      ch: [['10 tables', '20 ÷ 2 = 10 skips the + 2. Check: 2 × 10 + 2 = 22 people, not 20.'],
           ['18 tables', 'Solving 2n + 2 = 20 gives 2n = 18. That is 2n, not n. Divide by 2 as the last step.'],
           ['9 tables', 'Solve 2n + 2 = 20. Take away 2: 2n = 18. Divide by 2: n = 9. Check: 2 × 9 + 2 = 20.'],
           ['8 tables', 'Check: 2 × 8 + 2 = 18 people, not 20.']] }
  ];

  /* ---------- canvas helpers ---------- */
  const tx = (c, s, x, y, o = {}) => {
    c.font = `${o.bold ? 700 : 500} ${o.size || 14}px ${FONT}`; c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'middle';
    if (o.halo) { c.lineWidth = 4; c.strokeStyle = o.halo; c.lineJoin = 'round'; c.strokeText(s, x, y); }
    c.fillStyle = o.color; c.fillText(s, x, y);
  };
  const wrapT = (c, s, size, maxW, bold) => {
    c.font = `${bold ? 700 : 500} ${size}px ${FONT}`;
    const out = []; let cur = '';
    s.split(' ').forEach(w => { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; });
    if (cur) out.push(cur); return out;
  };
  const rrect = (c, x, y, w, h, r) => { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); };

  /* draw figure n with its top-left corner at (x, y) and cell size cs */
  const drawFig = (c, p, pi, n, x, y, cs, o = {}) => {
    const pal = p.pal, P = PATS[pi], pcs = P.gen(n);
    if (P.key === 'border') {
      const nn = n * cs; c.save(); c.setLineDash([4, 4]); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.2;
      c.strokeRect(x + cs + .5, y + cs + .5, nn - 1, nn - 1); c.restore();
      if (nn >= 38) tx(c, `${n} × ${n}`, x + cs + nn / 2, y + cs + nn / 2, { size: clamp(cs * .5, 12, 18), color: pal.muted, align: 'center' });
    }
    const lw = clamp(cs * .17, 3, 8), g = clamp(cs * .06, 1, 3);
    pcs.forEach(q => {
      const ghost = o.ghost && o.ghost(q), col = roleCol(pal, o.role ? o.role(q) : (o.newCol && q.nw ? 1 : 0));
      if (q.k === 't') {
        const rx = x + q.x * cs + g, ry = y + q.y * cs + g, s = cs - 2 * g;
        if (ghost) {
          c.save(); c.setLineDash([4, 3]); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.6; rrect(c, rx, ry, s, s, Math.min(4, s / 4)); c.stroke(); c.restore();
          o.hits.push({ id: q.id, cx: rx + s / 2, cy: ry + s / 2, r: Math.max(cs * .55, 14) });
        } else { c.fillStyle = col; rrect(c, rx, ry, s, s, Math.min(4, s / 4)); c.fill(); }
      } else {
        const x1 = x + q.x * cs, y1 = y + q.y * cs, x2 = q.k === 'h' ? x1 + cs : x1, y2 = q.k === 'v' ? y1 + cs : y1;
        c.lineCap = 'round'; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2);
        if (ghost) {
          c.save(); c.setLineDash([5, 4]); c.strokeStyle = pal['grid-strong']; c.lineWidth = Math.max(2, lw * .7); c.stroke(); c.restore();
          o.hits.push({ id: q.id, cx: (x1 + x2) / 2, cy: (y1 + y2) / 2, r: Math.max(cs * .42, 14) });
        } else { c.strokeStyle = col; c.lineWidth = lw; c.stroke(); }
      }
    });
    if (o.copy && pi === 2) {                     /* the second copy: the rest of the n by n + 1 rectangle */
      c.fillStyle = alpha(pal.violet, .55);
      for (let r = 0; r < n; r++) for (let cc = r + 1; cc <= n; cc++) { rrect(c, x + cc * cs + g, y + r * cs + g, cs - 2 * g, cs - 2 * g, Math.min(4, cs / 4)); c.fill(); }
    }
  };

  /* a row of figures with labels and counts */
  const drawStrip = (c, p, R, pi, ns, o = {}) => {
    const pal = p.pal, P = PATS[pi], fs = p.fs, gap = 12, labH = fs * 2.7;
    const dm = ns.map(n => dimsOf(pi, n)), maxH = Math.max(...dm.map(d => d[1]));
    const fit = (cs, mw) => dm.reduce((s, d) => s + Math.max(d[0] * cs + 8, mw), 0) + gap * (ns.length - 1) <= R.w;
    c.font = `700 ${fs}px ${FONT}`;
    let mode = 0, mw = c.measureText("Figure 4").width + 6, cs = 72;
    const solve = () => { cs = Math.min(72, (R.h - labH) / maxH); while (cs > 3 && !fit(cs, mw)) cs -= .5; };
    solve(); if (cs < 12) { mode = 1; mw = fs * 1.6; solve(); }
    const colW = dm.map(d => Math.max(d[0] * cs + 8, mw)), total = colW.reduce((s, v) => s + v, 0) + gap * (ns.length - 1);
    let x = R.x + (R.w - total) / 2; const yb = R.y + R.h - labH;
    ns.forEach((n, i) => {
      const [dw, dh] = dm[i], fx = x + (colW[i] - dw * cs) / 2, fy = yb - dh * cs - 2;
      drawFig(c, p, pi, n, fx, fy, cs, { newCol: o.newCol, hits: [] });
      tx(c, mode ? `${n}` : `Figure ${n}`, x + colW[i] / 2, yb + fs * .8, { size: fs, color: pal.muted, align: 'center', bold: true });
      tx(c, o.counts ? String(o.counts(n)) : '?', x + colW[i] / 2, yb + fs * 2.1, { size: fs * 1.1, color: pal.text, align: 'center', bold: true });
      x += colW[i] + gap;
    });
    return { cs, mode };
  };

  /* horizontal table: figure number, count, change, change of change */
  const drawTable = (c, p, R, o) => {
    const pal = p.pal, fs = p.fs, ns = o.ns, v = o.vals;
    const rows = 2 + (o.chg !== undefined ? 1 : 0) + (o.chg2 !== undefined ? 1 : 0), rh = Math.min(fs * 2.1, R.h / rows);
    const labs = [o.nl, o.cl, 'Change', '2nd change'].slice(0, rows);
    c.font = `700 ${fs}px ${FONT}`;
    const LW = Math.min(R.w * .36, Math.max(...labs.map(s => c.measureText(s).width)) + 14), cw = (R.w - LW) / ns.length;
    c.fillStyle = alpha(pal.stage, .9); c.fillRect(R.x, R.y, R.w, rh * rows);
    c.fillStyle = alpha(pal.blue, .13); c.fillRect(R.x, R.y, R.w, rh);
    c.strokeStyle = pal['grid-strong']; c.lineWidth = 1;
    c.strokeRect(R.x + .5, R.y + .5, R.w - 1, rh * rows - 1);
    for (let i = 1; i < rows; i++) { c.beginPath(); c.moveTo(R.x, R.y + i * rh); c.lineTo(R.x + R.w, R.y + i * rh); c.stroke(); }
    c.beginPath(); c.moveTo(R.x + LW, R.y); c.lineTo(R.x + LW, R.y + rh * rows); c.stroke();
    labs.forEach((s, i) => tx(c, s, R.x + 7, R.y + rh * (i + .5), { size: fs, color: [pal.text, pal.text, pal.green, pal.violet][i], bold: true }));
    ns.forEach((n, j) => {
      const cx = R.x + LW + cw * (j + .5);
      tx(c, String(n), cx, R.y + rh * .5, { size: fs, color: pal.text, align: 'center', bold: true });
      tx(c, v[j] === undefined ? '?' : String(v[j]), cx, R.y + rh * 1.5, { size: fs, color: pal.text, align: 'center' });
      if (o.chg !== undefined) {
        const t = j === 0 ? '–' : (o.chg ? sg(v[j] - v[j - 1]) : '?');
        tx(c, t, cx, R.y + rh * 2.5, { size: fs, color: o.chg || j === 0 ? pal.green : pal.muted, align: 'center', bold: !!o.chg });
      }
      if (o.chg2 !== undefined) {
        const t = j < 2 ? '–' : (o.chg2 ? sg((v[j] - v[j - 1]) - (v[j - 1] - v[j - 2])) : '?');
        tx(c, t, cx, R.y + rh * 3.5, { size: fs, color: o.chg2 || j < 2 ? pal.violet : pal.muted, align: 'center', bold: !!o.chg2 });
      }
    });
    return rh * rows;
  };

  /* scatter graph of (n, count) with optional rule curve, straight line, slope triangle and intercept */
  const drawGraph = (c, p, R, o) => {
    const pal = p.pal, fs = p.fs, gl = R.x + fs * 3, gr = R.x + R.w - 16, gt = R.y + fs * 1.9, gb = R.y + R.h - fs * 2.5;
    const X = v => gl + (gr - gl) * v / o.xmax, Y = v => gb - (gb - gt) * v / o.ymax;
    c.lineWidth = 1; c.strokeStyle = pal.grid;
    c.beginPath();
    for (let v = 0; v <= o.ymax + 1e-9; v += o.ystep) { c.moveTo(gl, Y(v)); c.lineTo(gr, Y(v)); }
    const xs = (gr - gl) / o.xmax < 26 ? 2 : 1;
    for (let v = 0; v <= o.xmax; v += xs) { c.moveTo(X(v), gt); c.lineTo(X(v), gb); }
    c.stroke();
    c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.beginPath(); c.moveTo(gl, gt); c.lineTo(gl, gb); c.lineTo(gr, gb); c.stroke();
    for (let v = o.ystep; v <= o.ymax + 1e-9; v += o.ystep) tx(c, String(v), gl - 6, Y(v), { size: fs, color: pal.muted, align: 'right' });
    tx(c, '0', gl - 6, gb, { size: fs, color: pal.muted, align: 'right' });
    for (let v = 0; v <= o.xmax; v += xs) tx(c, String(v), X(v), gb + fs * .95, { size: fs, color: pal.muted, align: 'center' });
    tx(c, o.xlab || 'Figure n', gr, gb + fs * 2.05, { size: fs, color: pal.muted, align: 'right', bold: true });
    tx(c, o.ylab, R.x + 3, R.y + fs * .8, { size: fs, color: pal.muted, bold: true });
    c.save(); c.beginPath(); c.rect(gl - 2, gt - 2, gr - gl + 4, gb - gt + 4); c.clip();
    const curve = (f, col, dash, w) => {
      c.beginPath(); for (let i = 0; i <= 200; i++) { const x = o.xmax * i / 200; i ? c.lineTo(X(x), Y(f(x))) : c.moveTo(X(x), Y(f(x))); }
      c.strokeStyle = col; c.lineWidth = w; c.setLineDash(dash || []); c.lineJoin = 'round'; c.stroke(); c.setLineDash([]);
    };
    if (o.line2) curve(o.line2, pal.violet, [9, 6], 2.6);
    if (o.fn) curve(o.fn, o.fnOk ? pal.blue : pal.red, o.fnOk ? null : [10, 6], 3.2);
    c.restore();
    if (o.tri) {
      const h0 = clamp(o.tri.at, 0, o.xmax - 1), f = o.tri.f, x1 = X(h0), x2 = X(h0 + 1), y1 = Y(f(h0)), y2 = Y(f(h0 + 1));
      c.lineWidth = 3; c.lineCap = 'round';
      c.strokeStyle = pal.green; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y1); c.stroke();
      c.strokeStyle = pal.red; c.beginPath(); c.moveTo(x2, y1); c.lineTo(x2, y2); c.stroke();
      tx(c, '+1', (x1 + x2) / 2, y1 + fs * .95, { size: fs, color: pal.green, align: 'center', bold: true, halo: pal.stage });
      const right = x2 + fs * 2.4 < R.x + R.w;
      tx(c, '+' + (f(h0 + 1) - f(h0)), right ? x2 + 6 : x1 - 2, right ? (y1 + y2) / 2 : (y1 + y2) / 2 - fs * .9, { size: fs, color: pal.red, align: right ? 'left' : 'right', bold: true, halo: pal.stage });
    }
    if (o.p0 !== undefined) {
      c.beginPath(); c.arc(X(0), Y(o.p0), 6, 0, Math.PI * 2); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.blue; c.lineWidth = 2.5; c.stroke();
      tx(c, `n = 0: ${o.p0}`, X(0) + 6, Y(o.p0) - fs * 2.4, { size: fs, color: pal.text, bold: true, halo: pal.stage });
    }
    o.pts.forEach(([x, y]) => { c.beginPath(); c.arc(X(x), Y(y), clamp(fs * .38, 4, 6), 0, Math.PI * 2); c.fillStyle = pal.blue; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 1.5; c.stroke(); });
    if (o.hl) {
      const q = o.pts.find(t => t[0] === o.hl);
      if (q) {
        c.beginPath(); c.arc(X(q[0]), Y(q[1]), 9, 0, Math.PI * 2); c.strokeStyle = pal.yellow; c.lineWidth = 3; c.stroke();
        const lab = `(${q[0]}, ${q[1]})`, left = X(q[0]) > gl + 90;
        tx(c, lab, X(q[0]) + (left ? -13 : 13), Y(q[1]) - (left ? 0 : fs * .2), { size: fs, color: pal.text, align: left ? 'right' : 'left', bold: true, halo: pal.stage });
      }
    }
  };

  register({
    id: 'patterns-and-the-nth-term', level: 'school',
    title: 'Patterns and the nth term',
    blurb: 'Grow figures from toothpicks and tiles, find the constant change, and write a rule for the nth figure.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 5; p.cy = 3.2; p.span = 4.4;
      p.grid(1, { axes: false });
      const st = (x1, y1, x2, y2) => p.path([[x1, y1], [x2, y2]], { stroke: pal.blue, width: 3.4 });
      for (let k = 0; k < 3; k++) {            /* toothpick squares, Figures 1 to 3 */
        const x = 0.5 + k * 1.4;
        if (k === 0) st(x, 0.7, x, 2.1);
        st(x, 2.1, x + 1.4, 2.1); st(x, 0.7, x + 1.4, 0.7); st(x + 1.4, 0.7, x + 1.4, 2.1);
      }
      const ox = 5.6, oy = 0.8;
      p.path([[ox, oy + 4.6], [ox, oy], [ox + 4, oy]], { stroke: pal['grid-strong'], width: 1.8 });
      p.path([[ox, oy + .5], [ox + 3.8, oy + 4.1]], { stroke: pal.blue, width: 3.2 });
      for (let n = 1; n <= 4; n++) p.dot(ox + n * .9, oy + .5 + (n * .9) * .947, 5, pal.yellow, pal.stage, 2);
      p.dot(ox, oy + .5, 5, pal.stage, pal.blue, 2.4);
    },
    hook: String.raw`A row of toothpick squares uses 4 sticks for one square, 7 for two and 10 for three. How many sticks does a row of 100 squares need, and how can you know without building it?`,
    steps: [
      { title: 'Predict, then build',
        text: String.raw`<p>Each figure is a row of toothpick squares. Figures 1 to 4 use \(4, 7, 10\) and \(13\) sticks.</p><p>Predict Figure 5. Then click the dotted slots to build it and count. After that, predict Figure 10 and drag the <b>Figure</b> slider to check.</p>`,
        set: { pat: 0, view: 'build', n: 5 } },
      { title: 'How is it changing?',
        text: String.raw`<p>Look at what is <b>new</b> from one figure to the next. Predict first: will the new part stay the same size?</p><p>Then the new sticks turn green and the table shows the change. A change that is always the same means a <b>linear</b> pattern. Try the staircase in the pattern menu.</p>`,
        set: { pat: 0, view: 'change' } },
      { title: 'Name the nth term',
        text: String.raw`<p>The <b>nth term</b> is a rule for Figure \(n\). See it two ways: \(n\) groups of 3 plus 1 extra, \(3n+1\), or start with 4 and add 3 each step, \(4+3(n-1)\). Both give 16 at \(n=5\).</p><p>Choose a rule. Its line is drawn over the dots. The rate 3 is the slope. The start 1 at \(n=0\) is the y-intercept.</p>`,
        set: { pat: 0, view: 'nth', way: 0, n: 5 } },
      { title: 'When the change grows',
        text: String.raw`<p>The staircase uses \(1, 3, 6, 10, 15\) tiles. Press <b>Find the differences</b>: the changes are \(+2, +3, +4, +5\). They are not constant, so the pattern is not linear.</p><p>Try a straight line through Figures 1 and 2. It misses the rest. Add a second copy to see why \(n(n+1)/2\) fits.</p>`,
        set: { pat: 2, view: 'nonlin', n: 5 } }
    ],
    formal: String.raw`
      <p>A <em>pattern</em> is a list of counts, one for each figure number \(n=1,2,3,\ldots\). The <em>nth term</em> is a rule that gives the count for any \(n\), so you can find Figure 100 without drawing it.</p>
      <h3>Linear or not: look at the change</h3>
      <p>Compare each figure with the one before it, and count the new pieces. If the new part is always the same size \(d\), the count goes up by \(d\) every time. That is a constant rate of change, and the pattern is <em>linear</em>. Toothpick squares give \(4, 7, 10, 13\): the changes are \(3, 3, 3\). The staircase gives \(1, 3, 6, 10\): the changes are \(2, 3, 4\), so it is not linear.</p>
      <h3>Why a constant change gives a rule</h3>
      <p>Start at the first count \(a_1\). Each step adds \(d\). Figure \(n\) is \(n-1\) steps after Figure 1, because Figure 1 has no steps behind it. So
      \[ a_n = a_1 + d(n-1). \]
      For the toothpicks, \(a_1=4\) and \(d=3\):
      \[ a_n = 4+3(n-1) = 4+3n-3 = 3n+1. \]
      In general, \(a_n = dn + (a_1-d)\): the rate times \(n\), plus a start.</p>
      <h3>Two ways to see one pattern</h3>
      <p>Look at the toothpicks again. The row is one stick at the left end plus \(n\) groups of 3 sticks (top, bottom, right). That is \(3n+1\). Or the row is 4 sticks for Figure 1 plus \(n-1\) more groups of 3. That is \(4+3(n-1)\). The pictures differ, but the algebra above shows the rules are equal. Neither is more correct. Test either rule on Figures 1, 2 and 3 before you trust it.</p>
      <h3>Rate and start on the graph</h3>
      <p>Plot the points \((n, a_n)\). They lie on the line \(y = dn + (a_1-d)\). The rate \(d\) is the slope: up \(d\) for each step right. The start \(a_1-d\) is the y-intercept: the count Figure 0 would have. For the toothpicks it is 1, the extra stick. Only whole numbers \(n\) are figures, so the real pattern is the dots. The line shows the rule.</p>
      <h3>A ring of tiles</h3>
      <p>A ring around an \(n\) by \(n\) square uses \(8, 12, 16, \ldots\) tiles, so \(d=4\) and \(a_n = 8+4(n-1) = 4n+4 = 4(n+1)\). Each of the 4 sides has \(n+1\) tiles. The trap is \(4(n+2)\): the outer side is \(n+2\) tiles long, but the four sides share their corner tiles, so that counts each corner twice.</p>
      <h3>Solving for the figure</h3>
      <p>Which toothpick figure uses 100 sticks? Solve \(3n+1=100\). Take away 1: \(3n=99\). Divide by 3: \(n=33\). Check: \(3(33)+1=100\).</p>
      <h3>The off-by-one trap</h3>
      <p>Counts \(7, 11, 15, 19\) have rate 4. The rule \(7+4n\) is wrong, because it gives 11 at \(n=1\). The 7 belongs to Figure 1, and only \(n-1\) steps of 4 come after it: \(7+4(n-1)=4n+3\). Always test Figure 1.</p>
      <h3>When the change itself grows</h3>
      <p>Staircase counts \(1,3,6,10,15\) have changes \(2,3,4,5\). Two copies of the \(n\)-row staircase fit together into a rectangle \(n\) tiles tall and \(n+1\) wide, so two copies have \(n(n+1)\) tiles and one copy has \(\tfrac{n(n+1)}{2}\). Square numbers \(1,4,9,16\) have changes \(3,5,7,9\) and the rule \(n^2\). In both, the changes grow by a constant amount (1 and 2). These are <em>quadratic</em> patterns, and their dots lie on a curve, not a line.</p>
      <p>A line through the first two dots matches only those two. Always check the rule against more figures, and give a reason from the picture, not only the numbers.</p>`,
    check: [
      { q: 'A pattern of dots has 5, 9, 13 and 17 dots in Figures 1, 2, 3 and 4. Which statement is correct?',
        choices: ['It is linear, because the count keeps going up.', 'It is linear, because the count goes up by the same amount, 4, each time.', 'It is not linear, because 9, 13 and 17 are not multiples of 4.', 'It is linear, because the first count is 5, so the rate is 5.'], answer: 1,
        why: String.raw`The changes are \(9-5=4\), \(13-9=4\) and \(17-13=4\). A constant change means a linear pattern with rate 4. Going up is not enough: the staircase \(1,3,6,10\) goes up but is not linear. The first count is the start, not the rate.`,
        hint: 'Subtract each count from the next one. Are the answers all the same?' },
      { q: 'A pattern has 7, 12, 17 and 22 dots in Figures 1, 2, 3 and 4. The count keeps going up by the same amount. How many dots are in Figure 30?',
        choices: ['150 dots', '157 dots', '155 dots', '152 dots'], answer: 3,
        why: String.raw`The count goes up by 5 each time, and Figure 1 has 7. Figure 30 is 29 steps after Figure 1: \(7+5\times 29 = 7+145 = 152\). The rule is \(5n+2\), and \(5\times 30+2=152\). 150 is \(5\times 30\), which forgets the +2. 157 is \(7+5\times 30\), which uses 30 steps instead of 29.`,
        hint: 'How many steps of 5 are there between Figure 1 and Figure 30?' },
      { q: 'Mia has the counts 6, 10, 14 and 18 for Figures 1 to 4. She says: "The rate is 4 and the start is 6, so the nth term is 6 + 4n." Which statement is true?',
        choices: ['Mia is right: 6 + 4n gives 10, 14, 18, which are the next counts.', 'The rate is wrong. It should be 6, the first count.', 'Mia has used n instead of n − 1. The rule should be 6 + 4(n − 1), which is 4n + 2.', 'The start is not needed. The rule should be 4n.'], answer: 2,
        why: String.raw`Test Figure 1: \(6+4(1)=10\), but Figure 1 has 6 dots. Mia's rule is one step ahead. The 6 belongs to Figure 1, so only \(n-1\) steps of 4 come after it: \(6+4(n-1)=4n+2\). Check: \(4(1)+2=6\) and \(4(2)+2=10\). The rate 4 is right. \(4n\) alone would give 4 for Figure 1.`,
        hint: 'Put n = 1 into Mia’s rule. Does it give the count of Figure 1?' }
    ],
    links: { prereq: ['slope-and-linear-functions', 'what-is-a-function'], next: ['sequences-recursive-and-explicit'], related: ['exponential-growth', 'forms-of-a-linear-equation', 'variables-and-relationships', 'solving-equations-with-a-balance', 'proportional-relationships'] },

    mount({ stage, controls: C }) {
      const panel = stage.nextElementSibling;
      const P = new Plane(stage, { cx: 0, cy: 0, span: 5 });
      const st = { pat: 0, view: 'build', n: 5, way: 0, pick: -1, test: false, line: false, copy: false, ans: {}, fill: PATS.map(() => new Set()), practice: false };
      let hits = [], prIdx = 0, prSolved = false, prTried = false, prFirst = 0, prDone = 0, prOver = false;

      const VIEWS = [['build', 'Predict and build'], ['change', 'See the change'], ['nth', 'Name the nth term'], ['nonlin', 'Test for a straight line']];
      const cur = () => PATS[st.pat];
      const ak = k => st.pat + ':' + k;
      const got = k => st.ans[ak(k)] !== undefined;
      const cnts = (pi, ns) => ns.map(n => PATS[pi].cnt(n));
      const ghostSet = () => {              /* the dotted slots of Figure 5 for a nested pattern */
        const f = st.fill[st.pat];
        return cur().nested && st.n === 5 && st.view === 'build' && !st.practice ? cur().gen(5).filter(q => q.b >= 5 && !f.has(q.id)) : [];
      };
      const reveal5 = () => (cur().nested ? cur().gen(5).filter(q => q.b >= 5).every(q => st.fill[st.pat].has(q.id)) : st.n === 5);
      const hideCount = () => st.view === 'build' && ((st.n >= 5 && !got('f5')) || (st.n >= 10 && !got('f10')) || (st.n === 5 && got('f5') && !reveal5()));

      /* ----- the picture ----- */
      P.onDraw = (c, p) => {
        const pal = p.pal, w = p.w, h = p.h, m = 10; p.fs = clamp(w / 27, 12, 16);
        const fs = p.fs, rect = (y0, y1) => ({ x: m, y: h * y0, w: w - 2 * m, h: h * (y1 - y0) });
        hits = [];
        if (st.practice) return drawPractice(c, p, rect);
        const pi = st.pat, Q = cur(), n = st.n, unit = Q.unit;
        const big = (R, o, cap) => {
          const capH = cap.length * fs * 1.5 + 4, avH = R.h - capH, d = dimsOf(pi, n, o.copy);
          const cs = Math.min((R.w - 8) / d[0], (avH - 4) / d[1], 84);
          const fx = R.x + (R.w - d[0] * cs) / 2, fy = R.y + (avH - d[1] * cs) / 2;
          drawFig(c, p, pi, n, fx, fy, cs, Object.assign({ hits }, o));
          cap.forEach((t, i) => tx(c, t.s, R.x + R.w / 2, R.y + avH + fs * (.85 + 1.5 * i), { size: fs * (t.big ? 1.1 : 1), color: t.col || pal.text, align: 'center', bold: !!t.big }));
        };
        const pts = Array.from({ length: 10 }, (_, i) => [i + 1, Q.cnt(i + 1)]);
        const gcfg = { xmax: 10, ymax: Q.ymax, ystep: Q.ystep, ylab: Q.unit.charAt(0).toUpperCase() + Q.unit.slice(1), pts };
        if (st.view === 'build') {
          drawStrip(c, p, rect(.02, .31), pi, [1, 2, 3, 4], { counts: k => Q.cnt(k) });
          const gh = ghostSet(), f = st.fill[pi], can = got('f5');
          const filled = Q.nested && n === 5 ? Q.gen(5).filter(q => q.b >= 5 && f.has(q.id)).length : 0;
          const total = Q.nested && n === 5 ? Q.gen(5).filter(q => q.b >= 5).length : 0;
          let cap;
          if (gh.length) cap = [{ s: can ? `Figure 5 so far: ${Q.cnt(4) + filled} ${unit}` : 'Figure 5: predict first, then build', big: true }, { s: can ? 'Click a dotted slot to add a piece.' : '', col: pal.muted }];
          else cap = [{ s: hideCount() ? `Figure ${n}: ?` : `Figure ${n}: ${Q.cnt(n)} ${unit}`, big: true }, { s: Q.nested && n === 5 && total && can ? 'Built. Count them to check.' : '', col: pal.muted }];
          big(rect(.34, .99), { ghost: gh.length ? q => q.b >= 5 && !f.has(q.id) : null, role: Q.nested && n === 5 ? q => (q.b >= 5 ? 1 : 0) : null }, cap);
        } else if (st.view === 'change') {
          const k = w < 520 ? 4 : 5, ns = Array.from({ length: k }, (_, i) => i + 1), a = got('chg');
          drawStrip(c, p, rect(.02, .45), pi, ns, { counts: q => Q.cnt(q), newCol: a });
          const R = rect(.48, .75);
          drawTable(c, p, R, { ns, vals: cnts(pi, ns), nl: 'Figure n', cl: Q.unit.charAt(0).toUpperCase() + Q.unit.slice(1), chg: a ? 1 : 0 });
          const d = ns.slice(1).map(q => Q.cnt(q) - Q.cnt(q - 1)), cst = d.every(v => v === d[0]);
          const msg = !a ? 'Predict first. Then the new pieces turn green.' : cst ? `The change is always ${sg(d[0])}. A constant change means a linear pattern.` : `The changes are ${d.map(sg).join(', ')}. They are not constant, so it is not linear.`;
          const Rv = rect(.78, .99); wrapT(c, msg, fs * 1.05, Rv.w, true).forEach((t, i) => tx(c, t, Rv.x + Rv.w / 2, Rv.y + fs * (.8 + 1.4 * i), { size: fs * 1.05, bold: true, align: 'center', color: !a ? pal.muted : cst ? pal.green : pal.red }));
        } else if (st.view === 'nth') {
          const wy = Q.ways ? Q.ways[st.way] : null, pk = st.pick >= 0 ? Q.opts[st.pick] : null, ok = pk && pk.ok;
          const cap = [{ s: `Figure ${n}: ${Q.cnt(n)} ${unit}`, big: true }];
          if (wy) cap.push({ s: wy.cap(n), col: pal.muted });
          big(rect(.02, .37), { role: wy ? q => wy.role(q) : null }, cap);
          drawGraph(c, p, rect(.40, .955), Object.assign({}, gcfg, { hl: n, fn: pk ? pk.f : null, fnOk: !!ok, p0: ok && Q.lin ? Q.B : undefined, tri: ok && Q.lin ? { at: n, f: Q.opts.find(q => q.ok).f } : null }));
        } else {
          const ns = [1, 2, 3, 4, 5], pk = st.pick >= 0 ? Q.opts[st.pick] : null, ok = pk && pk.ok;
          const cap = [{ s: `Figure ${n}: ${Q.cnt(n)} ${unit}`, big: true }, { s: st.copy && pi === 2 ? `Two copies: ${n} by ${n + 1} = ${n * (n + 1)} tiles` : '', col: pal.muted }];
          big(rect(.02, .35), { copy: st.copy && pi === 2, newCol: st.test }, cap);
          drawTable(c, p, rect(.37, .58), { ns, vals: cnts(pi, ns), nl: 'Figure n', cl: Q.unit.charAt(0).toUpperCase() + Q.unit.slice(1), chg: st.test ? 1 : 0, chg2: st.test ? 1 : 0 });
          const c1 = Q.cnt(1), c2 = Q.cnt(2);
          drawGraph(c, p, rect(.60, .955), Object.assign({}, gcfg, { hl: n, fn: pk ? pk.f : null, fnOk: !!ok, line2: st.line ? x => c1 + (c2 - c1) * (x - 1) : null }));
        }
      };

      function drawPractice(c, p, rect) {
        const pal = p.pal, pr = PROBS[prIdx], fs = p.fs, pts = pr.pts;
        const ns = pts.map(q => q[0]), vals = pts.map(q => q[1]);
        let y = .02;
        if (pr.pat !== undefined) { drawStrip(c, p, rect(.02, .34), pr.pat, pr.ns, { counts: n => PATS[pr.pat].cnt(n) }); y = .36; }
        const R = rect(y, y + .23);
        drawTable(c, p, R, { ns, vals, nl: pr.nl, cl: pr.cl, chg: 1 });
        drawGraph(c, p, rect(y + .26, .955), { xmax: pr.g[0], ymax: pr.g[1], ystep: pr.g[2], ylab: pr.cl, xlab: pr.nl, pts });
      }

      /* ----- panel ----- */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const addTo = (...els) => panel.append(...els);
      let selPat, selView, nS, predQ, predRow, predFb, ro, ruleRow, wayBtns, testBtn, lineT, copyT, addBtn, clearBtn;
      let startBtn, ptally, pq, pch, pfb, pnext, predKey = '', ruleKey = '';

      grp('sel', () => {
        C.title('Pattern');
        selPat = C.select({ label: 'Choose a pattern', options: PATS.map((q, i) => ({ value: String(i), label: q.name })), value: '0', onChange: v => { st.pat = +v; st.pick = -1; st.test = false; st.line = false; st.copy = false; sync(); } });
        selView = C.select({ label: 'Look at', options: VIEWS.map(v => ({ value: v[0], label: v[1] })), value: 'build', onChange: v => { st.view = v; st.pick = -1; st.test = false; st.line = false; st.copy = false; sync(); } });
        nS = C.slider({ label: 'Figure n', min: 1, max: 10, step: 1, value: 5, format: v => String(v), onInput: v => { st.n = v; sync(); } });
        nS.inp = panel.lastElementChild.querySelector('input');
      });
      grp('pred', () => {
        addTo(h('p', { class: 'ctl-title' }, 'Predict first'));
        predQ = h('p', { class: 'hint' }); predRow = h('div', { class: 'ctl buttons' }); predFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        addTo(predQ, predRow, predFb);
      });
      grp('build', () => {
        C.title('Build Figure 5');
        [addBtn, clearBtn] = C.buttons([{ label: 'Add a piece', onClick: () => { const g = ghostSet(); if (g.length && got('f5')) { st.fill[st.pat].add(g[0].id); sync(); } } },
          { label: 'Start again', onClick: () => { st.fill[st.pat] = new Set(); sync(); } }]);
      });
      grp('ways', () => {
        C.title('See it two ways');
        wayBtns = C.buttons([{ label: '', onClick: () => { st.way = 0; sync(); } }, { label: '', onClick: () => { st.way = 1; sync(); } }]);
      });
      grp('rule', () => {
        C.title('Name the nth term');
        C.hint('Choose a rule. Its graph is drawn over the dots.');
        ruleRow = h('div', { class: 'ctl buttons' }); addTo(ruleRow);
      });
      grp('nl', () => {
        C.title('Test it');
        [testBtn] = C.buttons([{ label: 'Find the differences', onClick: () => { st.test = true; sync(); } }]);
        lineT = C.toggle({ label: 'Try a straight line through Figures 1 and 2', value: false, onChange: v => { st.line = v; sync(); } });
        copyT = C.toggle({ label: 'Add a second copy of the staircase', value: false, onChange: v => { st.copy = v; sync(); } });
      });
      grp('ro', () => { ro = C.readout(); });

      /* predictions */
      const renderPred = () => {
        const kind = st.view === 'change' ? 'chg' : (got('f5') && (reveal5() || st.n >= 10) ? 'f10' : 'f5'), key = ak(kind);
        const D = PRED[st.pat][kind];
        if (predKey !== key) {
          predKey = key; predQ.textContent = D.q; predRow.replaceChildren();
          D.o.forEach((o, i) => predRow.append(mkBtn(o[0], () => { if (st.ans[key] !== undefined) return; st.ans[key] = i; sync(); })));
        }
        const a = st.ans[key];
        Array.from(predRow.children).forEach((b, j) => { b.disabled = a !== undefined; b.classList.toggle('primary', a === j); });
        const fbFor = kd => {
          const k2 = ak(kd), a2 = st.ans[k2]; if (a2 === undefined) return '';
          const D2 = PRED[st.pat][kd], right = a2 === D2.a, rev = kd === 'chg' || (kd === 'f5' && reveal5()) || (kd === 'f10' && st.n === 10);
          if (rev) return kk(kd === 'f5' ? 'Figure 5' : kd === 'f10' ? 'Figure 10' : 'Your prediction') + ' ' + (right ? good('Right.') : bad('Not quite.')) + ' ' + D2.o[a2][1];
          return `You predicted ${D2.o[a2][0]}. ` + (kd === 'f5' ? (cur().nested ? 'Now build Figure 5: click the dotted slots, or press Add a piece, and count.' : 'Now set the Figure slider to 5 and count the tiles.') : 'Now set the Figure slider to 10 to check.');
        };
        const fb = st.view === 'chg' || st.view === 'change' ? fbFor('chg') : lines([fbFor('f5'), fbFor('f10')]);
        predFb.innerHTML = fb;
      };
      const renderRule = () => {
        const key = String(st.pat);
        if (ruleKey !== key) {
          ruleKey = key; ruleRow.replaceChildren();
          cur().opts.forEach((o, i) => ruleRow.append(mkBtn(o.t, () => { st.pick = i; sync(); })));
        }
        Array.from(ruleRow.children).forEach((b, i) => b.classList.toggle('primary', st.pick === i));
      };

      /* readouts */
      const roText = () => {
        const Q = cur(), n = st.n, L = [], u = Q.unit, ns5 = [1, 2, 3, 4, 5];
        const pk = st.pick >= 0 ? Q.opts[st.pick] : null;
        const pickLine = () => pk && L.push((pk.ok ? good('Right.') : bad('Not quite.')) + ' ' + pk.why);
        if (st.view === 'build') {
          L.push(`${kk('Figures 1 to 4')} ${cnts(st.pat, [1, 2, 3, 4]).join(', ')} ${u}`);
          if (!got('f5')) { L.push('Predict Figure 5 first. Then you can build it.'); return lines(L); }
          const gh = ghostSet(), tot = Q.nested ? Q.gen(5).filter(q => q.b >= 5).length : 0;
          if (Q.nested && n === 5) {
            const filled = tot - gh.length;
            if (gh.length) L.push(`${kk('Figure 5')} Figure 4 has ${Q.cnt(4)} ${u}. You added ${filled}. Count so far: ${Q.cnt(4)} + ${filled} = ${Q.cnt(4) + filled}.`);
            else L.push(`${kk('Figure 5')} ` + good('Built.') + ` ${Q.cnt(4)} + ${tot} = ${Q.cnt(5)} ${u}.`);
          } else if (hideCount()) L.push(`${kk('Figure ' + n)} Predict first, then check. The count is hidden until then.`);
          else L.push(`${kk('Figure ' + n)} ${Q.cnt(n)} ${u}.`);
          if (got('f5') && reveal5() && !got('f10')) L.push('Now predict Figure 10.');
          return lines(L);
        }
        if (st.view === 'change') {
          const ns = ns5, d = ns.slice(1).map(q => Q.cnt(q) - Q.cnt(q - 1)), cst = d.every(v => v === d[0]);
          L.push(`${kk('Counts')} ${cnts(st.pat, ns).join(', ')} ${u}`);
          if (!got('chg')) { L.push('Predict first. Then the new pieces turn green and the changes appear.'); return lines(L); }
          L.push(`${kk('Changes')} ${d.map(sg).join(', ')}`);
          if (cst) L.push(good('The change is always ' + sg(d[0]) + '.') + ` The new part is the same size every time. That is a constant rate, so the pattern is linear: ${Q.rate}.`);
          else L.push(bad('The changes are not constant.') + ' The new part itself keeps growing, so the pattern is not linear.' + (st.pat === 2 ? ' The new bottom row gets 1 tile longer each time.' : ' The new L-shaped part gets 2 tiles bigger each time.'));
          L.push('Figure 1 is the start, so it has no change. The green pieces are new compared with the figure before.');
          return lines(L);
        }
        if (st.view === 'nth') {
          L.push(`${kk('Figure ' + n)} ${Q.cnt(n)} ${u}`);
          if (Q.lin) {
            Q.ways.forEach((wy, i) => L.push(`${kk(wy.expr)} ${i === st.way ? '<b>' + wy.ev(n) + '</b>' : wy.ev(n)}`));
            L.push(`${kk('Equal rules')} ${Q.eq}`);
          } else L.push('This pattern is not linear, so it has no rule of the form rate times n plus start. Try the next view.');
          pickLine();
          if (pk && pk.ok && Q.lin) L.push(`${kk('Graph')} The slope is ${Q.A}: ${Q.rate}. The y-intercept is ${Q.B}: ${Q.start}. It is the count Figure 0 would have.`);
          else if (!pk) L.push('Choose a rule below. Its line is drawn over the dots.');
          return lines(L);
        }
        const c1 = Q.cnt(1), c2 = Q.cnt(2), sl = c2 - c1;
        L.push(`${kk('Counts')} ${cnts(st.pat, ns5).join(', ')} ${u}`);
        if (!st.test) L.push('Press Find the differences to test for a constant change.');
        else {
          const d = [2, 3, 4, 5].map(q => Q.cnt(q) - Q.cnt(q - 1)), cst = d.every(v => v === d[0]);
          L.push(`${kk('Changes')} ${d.map(sg).join(', ')}`);
          if (cst) L.push(good('The change is constant, ' + sg(d[0]) + '.') + ' This pattern is linear.');
          else {
            const d2 = [0, 1, 2].map(i => d[i + 1] - d[i]);
            L.push(bad('The changes are not constant.') + ` No single rate fits, so it is not linear. The changes grow by ${d2[0]} each time.`);
          }
        }
        if (st.line) {
          const lv = c1 + sl * (n - 1);
          L.push(`${kk('Line through 1 and 2')} It says Figure ${n} has ${lv} ${u}. The count is ${Q.cnt(n)}. ` + (lv === Q.cnt(n) ? good('They agree.') : bad('They disagree.')));
        }
        if (st.copy && st.pat === 2) L.push(`${kk('Two copies')} Together they make a rectangle ${n} by ${n + 1}, which has ${n * (n + 1)} tiles. One copy is half: ${n * (n + 1) / 2}.`);
        pickLine();
        if (!pk) L.push('Name the nth term: choose a rule below. Its graph is drawn over the dots.');
        return lines(L);
      };

      /* ----- practice ----- */
      C.title('Practice');
      C.hint('Seven short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { st.practice = !st.practice; if (st.practice && !prOver) loadProb(); sync(); } }])[0];
      grp('practice', () => {
        ptally = h('p', { class: 'ctl-title' });
        pq = h('p', { class: 'pprob', style: 'margin:0;font-size:.95rem;line-height:1.5' });
        pch = h('div', { class: 'ctl buttons' });
        pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pnext = mkBtn('Next problem', () => nextProb(), true);
        addTo(ptally, pq, pch, pfb, h('div', { class: 'ctl buttons' }, pnext));
      });
      const tally = () => { ptally.textContent = `Problem ${prIdx + 1} of ${PROBS.length}. Right on the first try: ${prFirst} of ${prDone} done`; };
      const loadProb = () => {
        const pr = PROBS[prIdx]; prSolved = false; prTried = false;
        pq.textContent = pr.q; pfb.innerHTML = ''; pch.replaceChildren(); pnext.disabled = true; pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        pr.ch.forEach((o, i) => pch.append(mkBtn(o[0], () => pick(i))));
        tally();
      };
      const pick = i => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        const btn = pch.children[i], txt = pr.ch[i][1];
        if (i === pr.ans) {
          prSolved = true; if (!prTried) prFirst++; prDone++; Array.from(pch.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary');
          pfb.innerHTML = good('Right.') + ' ' + txt; pnext.disabled = false;
        } else { prTried = true; btn.disabled = true; pfb.innerHTML = bad('Not quite.') + ' ' + txt + ' Try another answer.'; }
        tally(); sync();
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); sync(); return; }
        prOver = true; pq.textContent = 'All seven problems are done.'; pch.replaceChildren(); pnext.disabled = true;
        pfb.innerHTML = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        pch.append(mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; prOver = false; loadProb(); sync(); }, true));
        ptally.textContent = `Right on the first try: ${prFirst} of ${PROBS.length}`; sync();
      };

      /* ----- sync ----- */
      const sync = () => {
        const prac = st.practice, v = st.view, Q = cur();
        vis(G.sel, !prac); vis(G.ro, !prac); vis(G.practice, prac);
        vis(G.pred, !prac && (v === 'build' || v === 'change'));
        vis(G.build, !prac && v === 'build' && Q.nested);
        vis(G.ways, !prac && v === 'nth' && !!Q.lin);
        vis(G.rule, !prac && (v === 'nth' || v === 'nonlin'));
        vis(G.nl, !prac && v === 'nonlin');
        if (!prac) {
          selPat.value = String(st.pat); selView.value = v; nS.set(st.n);
          const nw = nS.inp.closest('.ctl'); if (nw) nw.style.display = v === 'change' ? 'none' : '';
          if (v === 'build' || v === 'change') renderPred();
          if (Q.nested) { const g = ghostSet(); addBtn.disabled = !g.length || !got('f5'); clearBtn.disabled = !st.fill[st.pat].size; }
          if (Q.ways) wayBtns.forEach((b, i) => { b.textContent = Q.ways[i].name + ': ' + Q.ways[i].expr; b.classList.toggle('primary', st.way === i); });
          renderRule();
          lineT.checked = st.line; copyT.checked = st.copy; testBtn.classList.toggle('primary', st.test);
          const cw = copyT.closest('.ctl'); if (cw) cw.style.display = st.pat === 2 ? '' : 'none';
          ro.innerHTML = roText();
        }
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        P.draw();
      };

      /* clicking a dotted slot adds that piece */
      P.canvas.addEventListener('pointerdown', e => {
        if (st.practice || st.view !== 'build' || !got('f5') || !hits.length) return;
        const r = P.canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
        let best = null, bd = 1e9;
        hits.forEach(q => { const d = Math.hypot(q.cx - px, q.cy - py); if (d < q.r && d < bd) { bd = d; best = q; } });
        if (best) { st.fill[st.pat].add(best.id); sync(); }
      });

      const FLAGS = ['pat', 'view', 'n', 'way'];
      const apply = patch => {
        st.practice = false; st.pick = -1; st.test = false; st.line = false; st.copy = false;
        for (const k in patch) if (FLAGS.includes(k)) st[k] = patch[k];
        sync();
      };
      sync();
      return { destroy: () => { P.destroy(); }, apply };
    }
  });
}
