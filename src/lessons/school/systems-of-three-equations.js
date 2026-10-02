/* =====================================================================
   SCHOOL — Systems of three equations
   ===================================================================== */
{
  const PI = Math.PI;
  const wrapDeg = a => ((a + 180) % 360 + 360) % 360 - 180;
  const VAR = ['x', 'y', 'z'];
  const MN = '−';
  const sg = v => String(v).replace('-', MN);
  const tm = (c, v) => (c === 1 ? '' : c === -1 ? MN : sg(c)) + v;
  const pn = v => v < 0 ? '(' + sg(v) + ')' : String(v);
  const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm3 = a => Math.hypot(a[0], a[1], a[2]);
  const avg3 = pts => [0, 1, 2].map(i => pts.reduce((s, q) => s + q[i], 0) / pts.length);
  const good = s => `<b style="color:var(--green)">${s}</b>`, bad = s => `<b style="color:var(--red)">${s}</b>`;
  const COL = ['blue', 'red', 'green'], CSSV = ['var(--blue)', 'var(--red)', 'var(--green)'];

  /* ---------- equations as rows [a, b, c, d] meaning a x + b y + c z = d ---------- */
  const eqText = (r, names = VAR) => {
    let s = '';
    for (let j = 0; j < 3; j++) {
      const c = r[j]; if (!c) continue;
      const body = (Math.abs(c) === 1 ? '' : Math.abs(c)) + names[j];
      s += s ? (c < 0 ? ' ' + MN + ' ' : ' + ') + body : (c < 0 ? MN : '') + body;
    }
    return (s || '0') + ' = ' + sg(r[3]);
  };
  const combo = (rows, ms) => [0, 1, 2, 3].map(j => rows.reduce((s, r, k) => s + (ms[k] || 0) * r[j], 0));
  const rank = M => {
    const a = M.map(r => r.slice()), nc = a[0].length; let rk = 0;
    for (let c = 0; c < nc && rk < a.length; c++) {
      let p = -1, b = 1e-9;
      for (let r = rk; r < a.length; r++) if (Math.abs(a[r][c]) > b) { b = Math.abs(a[r][c]); p = r; }
      if (p < 0) continue;
      [a[rk], a[p]] = [a[p], a[rk]];
      for (let r = rk + 1; r < a.length; r++) { const f = a[r][c] / a[rk][c]; for (let k = c; k < nc; k++) a[r][k] -= f * a[rk][k]; }
      rk++;
    }
    return rk;
  };
  const det3 = a => a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1]) - a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0]) + a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0]);
  /* what do these equations have in common? a point, a line, a whole sheet or nothing */
  const analyse = rows => {
    const A = rows.map(r => r.slice(0, 3)), rA = rank(A), rB = rank(rows);
    if (rB > rA) return { kind: 'none', rA, rB };
    const dim = 3 - rA;
    if (dim === 0) {
      const D = det3(A), q = [0, 1, 2].map(j => det3(A.map((r, i) => r.map((v, k) => k === j ? rows[i][3] : v))) / D);
      return { kind: 'point', q, rA, rB };
    }
    if (dim === 1) {
      for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) {
        const dir = cross3(A[i], A[j]), n2 = dot3(dir, dir); if (n2 < 1e-9) continue;
        const n1 = A[i], m = A[j], d1 = rows[i][3], d2 = rows[j][3], a11 = dot3(n1, n1), a22 = dot3(m, m), a12 = dot3(n1, m), den = a11 * a22 - a12 * a12;
        const c1 = (d1 * a22 - d2 * a12) / den, c2 = (d2 * a11 - d1 * a12) / den;
        return { kind: 'line', p0: [0, 1, 2].map(k => c1 * n1[k] + c2 * m[k]), dir, rA, rB };
      }
    }
    return { kind: 'plane', rA, rB };
  };
  /* the part of a plane n.p = d inside the cube [-L, L]^3, as an ordered polygon */
  const CUBE = []; for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) CUBE.push([x, y, z]);
  const CEDGE = []; for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) if (CUBE[i].filter((v, k) => v !== CUBE[j][k]).length === 1) CEDGE.push([i, j]);
  const planePoly = (row, L) => {
    const n = row.slice(0, 3), d = row[3]; if (norm3(n) < 1e-9) return null;
    let pts = [];
    for (const [i, j] of CEDGE) {
      const a = CUBE[i].map(v => v * L), b = CUBE[j].map(v => v * L), fa = dot3(n, a) - d, fb = dot3(n, b) - d;
      if (Math.abs(fa) < 1e-9) pts.push(a);
      else if (fa * fb < 0) { const t = fa / (fa - fb); pts.push(a.map((v, k) => v + (b[k] - v) * t)); }
    }
    const u = []; for (const q of pts) if (!u.some(w => norm3(sub3(w, q)) < 1e-6)) u.push(q);
    if (u.length < 3) return null;
    const c = avg3(u), e1 = norm3(cross3(n, [1, 0, 0])) > .3 ? cross3(n, [1, 0, 0]) : cross3(n, [0, 1, 0]), e2 = cross3(n, e1);
    return u.map(q => ({ q, a: Math.atan2(dot3(sub3(q, c), e2), dot3(sub3(q, c), e1)) })).sort((p, q) => p.a - q.a).map(o => o.q);
  };
  const clipLine = (p0, dir, L) => {
    let t0 = -1e9, t1 = 1e9;
    for (let i = 0; i < 3; i++) {
      if (Math.abs(dir[i]) < 1e-9) { if (Math.abs(p0[i]) > L + 1e-9) return null; continue; }
      const a = (-L - p0[i]) / dir[i], b = (L - p0[i]) / dir[i];
      t0 = Math.max(t0, Math.min(a, b)); t1 = Math.min(t1, Math.max(a, b));
    }
    if (t1 - t0 < 1e-9) return null;
    return [0, 1, 2].map(i => [p0[i] + dir[i] * t0, p0[i] + dir[i] * t1]).reduce((acc, [a, b]) => { acc[0].push(a); acc[1].push(b); return acc; }, [[], []]);
  };
  const ptText = q => '(' + q.map(v => sg(Math.round(v * 100) / 100)).join(', ') + ')';

  /* ---------- the preset systems for the picture ---------- */
  const SYS = {
    A: { rows: [[1, 0, 0, 2], [0, 1, 0, 1], [0, 0, 1, 3]], lim: 4, key: 'corner' },
    B: { rows: [[1, 1, 1, 6], [2, -1, 1, 3], [1, 2, -1, 2]], lim: 4, key: 'tilt' },
    C: { rows: [[1, 1, 1, 3], [1, -1, 1, 1], [1, 0, 1, 2]], lim: 4, key: 'book' },
    D: { rows: [[1, 1, 1, 3], [1, -1, 1, 1], [1, 0, 1, 1]], lim: 4, key: 'tunnel' },
    E: { rows: [[1, 1, 1, -2], [1, 1, 1, 1], [2, 2, 2, 8]], lim: 4, key: 'floors' },
    F: { rows: [[1, 1, 1, 3], [2, 2, 2, 6], [1, -1, 0, 1]], lim: 4, key: 'twosame' },
    G: { rows: [[1, 1, 1, 1], [1, 1, 1, 4], [1, -1, 0, 0]], lim: 4, key: 'parpair' },
    H: { rows: [[1, 1, 1, 3], [2, 2, 2, 6], [-1, -1, -1, -3]], lim: 4, key: 'same' }
  };
  const SYS_IDS = Object.keys(SYS);
  /* what each kind of meeting looks like, and why */
  const CASES = {
    corner: { row: 0, head: 'One point', why: 'The three sheets have three different tilts, like the floor and two walls in the corner of a room. They touch in a single corner.' },
    tilt: { row: 0, head: 'One point', why: 'Two sheets cross in a line. This line is not parallel to the third sheet, so the third sheet cuts it in exactly one point, like a corner of a room.' },
    book: { row: 1, head: 'A whole line', why: 'Every sheet passes through the same line, like the pages of an open book meeting at the spine. Every point on that line is on all three sheets. The third equation is a mix of the first two.' },
    twosame: { row: 1, head: 'A whole line', why: 'Two of the equations describe the same sheet, so only two different sheets are left. Two sheets that cross meet in a line, and that line is the answer.' },
    tunnel: { row: 2, head: 'None', why: 'Each pair of sheets crosses in a line, but the three lines are parallel and never meet, like the three long edges of a triangular tunnel. No point is on all three sheets.' },
    floors: { row: 3, head: 'None', why: 'The three sheets are parallel, stacked like floors in a building. A point on one floor is never on another.' },
    parpair: { row: 3, head: 'None', why: 'Two of the sheets are parallel, so no point is on both of them. The third sheet cuts through them, but it cannot change that.' },
    same: { row: 4, head: 'A whole sheet', why: 'All three equations describe the same sheet. Every point on it satisfies all three equations at once.' }
  };
  const TABLE = [
    ['One point', 'Corner of a room. Three different tilts.', 'Ends with x = a, y = b, z = c.'],
    ['A line', 'Pages of a book. One equation is a mix of the other two, including the total.', 'Ends with 0 = 0.'],
    ['None (tunnel)', 'Each pair meets, all three do not. The left sides mix, the totals do not.', 'Ends with 0 = 5 or a similar false statement.'],
    ['None (parallel)', 'Same left side, different totals.', 'Ends with 0 = 5 or a similar false statement.'],
    ['A whole sheet', 'Each equation is a multiple of the others.', 'Everything cancels: 0 = 0 and 0 = 0.']
  ];
  const GUESS = { point: 'one point', line: 'a whole line', none: 'no point at all', plane: 'a whole sheet' };

  /* ---------- the systems for the elimination table ---------- */
  const ALG = {
    a1: { label: '1. Easy numbers', rows: [[1, 1, 1, 6], [2, -1, 1, 3], [1, 2, -1, 2]] },
    a2: { label: '2. Needs multipliers', rows: [[2, 1, -1, 0], [1, -1, 2, 9], [3, 2, 1, 7]] },
    a3: { label: '3. Mixed signs', rows: [[1, 1, 1, 2], [2, -1, 3, -1], [3, 2, -1, 0]] },
    a4: { label: '4. A surprise (try it)', rows: SYS.C.rows, param: 'x = t, y = 1, z = 2 − t' },
    a5: { label: '5. Another surprise', rows: SYS.D.rows },
    story: { label: 'Bakery receipts (story)', rows: [[1, 2, 1, 9], [2, 1, 3, 10], [3, 1, 1, 10]] }
  };
  const ALG_IDS = Object.keys(ALG);

  /* ---------- story and practice material ---------- */
  const STORY_ROWS = ALG.story.rows;
  const STORY = [
    { tag: 'Choose the unknowns', q: 'Three prices are missing, and the receipts do not show them. What should x, y and z stand for?',
      choices: [
        { t: 'x = the price of one muffin, y = the price of one coffee, z = the price of one juice (all in dollars)', ok: true, why: 'The prices are what we do not know, so they are the unknowns. The counts (how many of each) and the totals are given on the receipts.' },
        { t: 'x = the number of muffins, y = the number of coffees, z = the number of juices', why: 'The number of each item is printed on every receipt, so we know it. The unknowns are the three prices.' },
        { t: 'x = Receipt 1, y = Receipt 2, z = Receipt 3', why: 'A receipt is a whole equation, not one unknown number. Each receipt gives one equation about the three prices.' },
        { t: 'x = 9, y = 10, z = 10', why: 'Those are the receipt totals, which we already know. Unknowns are letters for numbers we are looking for.' }] },
    { tag: 'Receipt 1: 1 muffin, 2 coffees, 1 juice, total $9', q: 'Which equation says what Receipt 1 says?', eq: 0,
      choices: [
        { t: 'x + 2y + z = 9', ok: true, why: 'One muffin costs x, two coffees cost 2y, one juice costs z, and together they cost 9 dollars.' },
        { t: '2x + y + z = 9', why: 'That is 2 muffins, 1 coffee, 1 juice. The receipt has 1 muffin and 2 coffees.' },
        { t: 'x + y + z = 9', why: 'That counts each item once. The receipt has 2 coffees, so the y term needs a 2: 2y.' },
        { t: 'x + 2y + z = 4', why: 'The number 4 is how many items there are. The right side of the equation is the money: 9 dollars.' }] },
    { tag: 'Receipt 2: 2 muffins, 1 coffee, 3 juices, total $10', q: 'Which equation says what Receipt 2 says?', eq: 1,
      choices: [
        { t: '2x + y + 3z = 6', why: 'The left side is right, but 6 is the number of items. The right side is the total in dollars: 10.' },
        { t: 'x + 2y + 3z = 10', why: 'That is 1 muffin and 2 coffees. The receipt has 2 muffins and 1 coffee, so the x term has the 2.' },
        { t: '2x + y + 3z = 10', ok: true, why: 'Two muffins cost 2x, one coffee costs y, three juices cost 3z, and the total is 10 dollars.' },
        { t: '2x + 3y + z = 10', why: 'That is 3 coffees and 1 juice. The receipt has 1 coffee and 3 juices.' }] },
    { tag: 'Receipt 3: 3 muffins, 1 coffee, 1 juice, total $10', q: 'Which equation says what Receipt 3 says?', eq: 2,
      choices: [
        { t: '3x + y + z = 5', why: 'The 5 is the number of items. The right side must be the total cost, 10 dollars.' },
        { t: 'x + y + 3z = 10', why: 'That is 3 juices. The receipt has 3 muffins, so the 3 belongs on x.' },
        { t: '3x + y + z = 10', ok: true, why: 'Three muffins cost 3x, one coffee costs y, one juice costs z, and the total is 10 dollars.' },
        { t: '3x = 10', why: 'That leaves out the coffee and the juice. All three items are on the receipt, so all three terms are in the equation.' }] },
    { solve: true },
    { tag: 'Say what it means', q: 'The solution is x = 2, y = 3, z = 1. What does z = 1 mean in the story?',
      choices: [
        { t: 'One juice costs $1.', ok: true, why: 'z was defined as the price of one juice in dollars, so z = 1 means one juice costs 1 dollar. A number in the answer always needs its unit and its meaning.' },
        { t: 'There is 1 juice on each receipt.', why: 'The counts on the receipts are 1, 3 and 1, so that is not true. And z is a price, not a count.' },
        { t: 'The total of the three receipts is $1.', why: 'The receipts total 9, 10 and 10 dollars. z is the price of one juice.' },
        { t: 'Juice is the cheapest item, so z must be 1 cent.', why: 'The unit of z is dollars, so z = 1 means 1 dollar, not 1 cent. Juice is the cheapest here, but the number says 1 dollar.' }] },
    { tag: 'Use the answer', q: 'Using the prices you found (muffin $2, coffee $3, juice $1), what does a new order of 3 muffins, 2 coffees and 2 juices cost?',
      choices: [
        { t: '$14', ok: true, why: '3 muffins cost 3 × 2 = 6, 2 coffees cost 2 × 3 = 6 and 2 juices cost 2 × 1 = 2. The total is 6 + 6 + 2 = 14 dollars.' },
        { t: '$7', why: 'That is the number of items, not the cost. Multiply each count by its price: 3 × 2, 2 × 3, 2 × 1.' },
        { t: '$12', why: 'That adds 6 + 6 but leaves out the juices. All three items are in the order: 6 + 6 + 2.' },
        { t: '$16', why: 'Check the juice price: z = 1, so 2 juices cost 2 dollars, not 4. The total is 6 + 6 + 2.' }] }
  ];

  const P1 = [[1, 2, -1, 1], [3, 1, 1, 10], [2, -3, 1, 4]], COINS = [[1, 1, 1, 9], [5, 10, 25, 140], [1, 0, -1, -2]];
  const PRAC = [
    { tag: 'Pick the first move', view: { rows: P1, lim: 4 }, after: { auto: true },
      q: 'To solve E1: x + 2y − z = 1, E2: 3x + y + z = 10, E3: 2x − 3y + z = 4, which first move saves the most work?',
      choices: [
        { t: 'Eliminate z. The z coefficients are −1, 1, 1: add E1 and E2, then subtract E3 from E2. No multiplying.', ok: true, why: 'E1 + E2 gives 4x + 3y = 11 and E2 − E3 gives x + 4y = 6. Both lost z, using only adding and subtracting. That is the quickest start.' },
        { t: 'Eliminate x. Multiply E1 by 3 and by 2 first.', why: 'This works, but it needs two multiplications. The x coefficients are 1, 3, 2. Any variable works in the end, though z is quicker here.' },
        { t: 'Eliminate y. The y coefficients are 2, 1, −3.', why: 'This works too, but none of the pairs cancels y without a multiplier, so it takes more steps than z.' },
        { t: 'Add all three equations. That cancels y, so one step is enough.', why: 'Adding all three gives 6x + z = 15 (the y terms do cancel: 2 + 1 − 3 = 0). But that is only ONE equation with two unknowns. You need TWO new equations in the same two variables.' }] },
    { tag: 'The same variable twice', view: { rows: ALG.a1.rows, lim: 4, red: [[2, 3, 0, 8]] }, after: { red: [[2, 3, 0, 8], [-1, 2, 0, 3]] },
      q: 'In E1: x + y + z = 6, E2: 2x − y + z = 3, E3: x + 2y − z = 2, you added E1 and E3 to get N1: 2x + 3y = 8 (no z). Which move gives a SECOND equation with no z that brings in new information?',
      choices: [
        { t: 'E1 + E2', why: 'The z terms are 1z and 1z. They add to 2z, so z is still there. To cancel z you need to subtract: E1 − E2.' },
        { t: 'E1 − E2', ok: true, why: 'The z terms are 1z − 1z = 0, and the equation is −x + 2y = 3. It uses E2, which N1 did not use, so it adds new information.' },
        { t: '2·E1 + 2·E3', why: 'That does cancel z, but it is just 2 × N1: 4x + 6y = 16. It uses the same pair, so it tells you nothing new.' },
        { t: 'E2 − E3', why: 'The z terms are 1z − (−1z) = 2z. Subtracting makes them add up. To cancel z you need E2 + E3.' }] },
    { tag: 'Finish the solution', view: { rows: ALG.a1.rows, lim: 4 }, after: { auto: true },
      q: 'For E1: x + y + z = 6, E2: 2x − y + z = 3, E3: x + 2y − z = 2, you got 2x + 3y = 8 and −x + 2y = 3, and then y = 2. Find x, then find z.',
      choices: [
        { t: 'x = 1 and z = 3', ok: true, why: 'Put y = 2 into 2x + 3y = 8: 2x + 6 = 8, so x = 1. Then E1: 1 + 2 + z = 6, so z = 3. Check E2: 2 − 2 + 3 = 3.' },
        { t: 'x = 1 and z = 5', why: 'x = 1 is right. But in E1 you must subtract both x and y: z = 6 − 1 − 2 = 3, not 6 − 1.' },
        { t: 'x = 7 and z = −3', why: 'In 2x + 3(2) = 8 you must subtract 6 from 8, not add it: 2x = 2, so x = 1.' },
        { t: 'x = 4 and z = 0', why: 'x = 4 comes from 8 ÷ 2 and ignores the 3y term. With y = 2, 2x + 6 = 8, so x = 1.' }] },
    { tag: 'How do the sheets meet?', view: { rows: SYS.D.rows, lim: 4 }, after: { auto: true },
      q: 'The system is x + y + z = 3, x − y + z = 1, x + z = 1. Turn the picture and look. How do the three sheets meet?',
      choices: [
        { t: 'In one point, like the corner of a room', why: 'In a corner, all three sheets cross each other. Here each pair meets in a line, but the three lines run side by side and never meet at one point.' },
        { t: 'In a whole line, like the pages of a book', why: 'Pages of a book share one spine. Here the three meeting lines are different lines, so no single line lies on all three sheets.' },
        { t: 'In no point. Each pair meets in a line, but the three lines are parallel', ok: true, why: 'Adding the first two gives 2x + 2z = 4, which is x + z = 2. The third says x + z = 1. Both cannot be true, so there is no solution. It is a triangular tunnel.' },
        { t: 'They are all the same sheet', why: 'The three equations have different left sides (the y terms differ), so they are three different sheets.' }] },
    { tag: 'Read the equations', view: { rows: SYS.H.rows, lim: 4 }, after: { auto: true },
      q: 'A system is x + y + z = 3, 2x + 2y + 2z = 6, and −x − y − z = −3. What is the solution set?',
      choices: [
        { t: 'One point', why: 'The second equation is 2 × the first and the third is −1 × the first. They add no new information, so one point is impossible.' },
        { t: 'A line', why: 'A line needs two different sheets. Here all three are the same sheet, which is more than a line.' },
        { t: 'No solution', why: 'The totals are consistent: 6 = 2 × 3 and −3 = −1 × 3. Elimination gives 0 = 0, not a false statement.' },
        { t: 'A whole sheet: every point with x + y + z = 3', ok: true, why: 'Each equation is a multiple of x + y + z = 3, so they all describe the same sheet. Elimination turns two of them into 0 = 0.' }] },
    { tag: 'Reduced equations', view: { rows: [], lim: 4, red: [[2, -1, 0, 1], [4, -2, 0, 10]] }, after: { auto: false },
      q: 'After eliminating z from three equations you got 2x − y = 1 and 4x − 2y = 10. What does that tell you about the system?',
      choices: [
        { t: 'It has infinitely many solutions, because the left sides are multiples of each other', why: 'The left sides are multiples (4x − 2y = 2 × (2x − y)), but then the totals must match too: 2 × 1 = 2, not 10. Matching left sides with different totals means a contradiction.' },
        { t: 'x = 1 and y = 1', why: 'This fits the first equation (2 − 1 = 1). Check the second: 4(1) − 2(1) = 2, not 10. No pair fits both equations.' },
        { t: 'No solution: 2 × (first) − (second) gives 0 = −8', ok: true, why: '2 × (2x − y = 1) is 4x − 2y = 2. Subtracting 4x − 2y = 10 leaves 0 = −8, which is false. The two vertical sheets in the picture are parallel, so they never meet.' },
        { t: 'One solution, because there are two equations in two unknowns', why: 'Two equations in two unknowns usually have one solution, but not when the left sides are multiples of each other. Here elimination leaves 0 = −8.' }] },
    { tag: 'Build the equations', view: { rows: COINS, lim: 5, show: 0 }, after: { rows: COINS, show: 3 },
      q: 'A jar holds 9 coins: nickels (n), dimes (d) and quarters (q). Together they are worth $1.40. There are 2 more quarters than nickels. Which system of equations is correct? (Value is in cents: a nickel is 5, a dime 10, a quarter 25.)',
      choices: [
        { t: 'n + d + q = 140, 5n + 10d + 25q = 9, q = n + 2', why: 'The totals are swapped. There are 9 coins and they are worth 140 cents.' },
        { t: 'n + d + q = 9, 5n + 10d + 25q = 140, q = n + 2', ok: true, why: 'The first equation counts coins. The second adds the value in cents: 5 per nickel, 10 per dime, 25 per quarter. "2 more quarters than nickels" is q = n + 2.' },
        { t: 'n + d + q = 9, n + 10d + 25q = 140, q = n + 2', why: 'A nickel is worth 5 cents, so its term is 5n, not n.' },
        { t: 'n + d + q = 9, 5n + 10d + 25q = 140, n = q + 2', why: 'That says there are 2 more nickels than quarters. The story says 2 more quarters, so q = n + 2.' }] },
    { tag: 'Solve the story', view: { rows: COINS, lim: 5 }, after: { auto: true },
      q: 'Solve n + d + q = 9, 5n + 10d + 25q = 140 and q = n + 2. How many quarters are in the jar?',
      choices: [
        { t: '2 quarters', why: 'Two is the number of nickels. The third equation says there are 2 more quarters than nickels.' },
        { t: '3 quarters', why: 'Three is the number of dimes. Check: with 3 quarters, n = 1, so d = 5, and the value is 5 + 50 + 75 = 130, not 140.' },
        { t: '4 quarters', ok: true, why: 'Put n = q − 2 into the first equation: d = 11 − 2q. Put both into the value equation: 5(q − 2) + 10(11 − 2q) + 25q = 140, so 10q = 40 and q = 4. Then n = 2 and d = 3. Check: 10 + 30 + 100 = 140 cents.' },
        { t: '9 quarters', why: '9 is the total number of coins. Quarters are only some of them.' }] }
  ];
  const N = PRAC.length;
  const SYS_LABEL = { point: 'one point', line: 'a line of solutions', none: 'no solution', plane: 'a whole sheet' };

  register({
    id: 'systems-of-three-equations', level: 'school',
    title: 'Systems of three equations',
    blurb: 'See three planes meet in a point, a line or nowhere, then solve three equations in three unknowns by eliminating the same variable twice.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 3.3;
      p.path([[-2.6, -1.1], [.7, -1.9], [2.5, .3], [-.8, 1.1]], { fill: alpha(pal.blue, .32), stroke: pal.blue, width: 2.2, close: true });
      p.path([[-1.1, -2.3], [.6, -1.5], [.9, 2.4], [-.8, 1.7]], { fill: alpha(pal.red, .28), stroke: pal.red, width: 2.2, close: true });
      p.path([[-2.4, 1.4], [1.4, 1.9], [2.2, -1.3], [-1.5, -1.9]], { fill: alpha(pal.green, .2), stroke: pal.green, width: 2.2, close: true });
      p.dot(-.1, -.2, 6.5, pal.violet, pal.stage, 2);
    },
    hook: String.raw`Three receipts from the same bakery show the totals, but not the prices of a muffin, a coffee and a juice. Each receipt is one equation with three unknowns. What does it look like to ask for one price that fits all three receipts at once?`,
    steps: [
      { title: 'One equation is a sheet',
        text: String.raw`<p>In 3D, a point has three numbers \((x,y,z)\). The equation \(x+y+z=6\) is true at some points and false at others. The true ones form a flat <b>sheet</b>, called a <b>plane</b>.</p><p>The point \((1,2,3)\) is on it because \(1+2+3=6\). Turn the picture with the slider or by dragging. Use the sheet buttons to add the next sheet.</p>`,
        set: { mode: 'geo', sys: 'B', nShow: 1, rot: 35, tilt: 30 } },
      { title: 'Predict: three sheets',
        text: String.raw`<p>A solution has to be on <b>all three</b> sheets at once. System B has three sheets, one for each equation.</p><p><b>Guess first.</b> How many points lie on all three? Press a guess under Predict, then turn the picture to check. The sheets can meet in one point, a whole line, or not at all.</p>`,
        set: { mode: 'geo', sys: 'B', nShow: 3, rot: 35, tilt: 30 } },
      { title: 'All the ways to meet',
        text: String.raw`<p>System C is a new guess. Predict, then look. Then choose Systems D to H in the list and try each one.</p><p>The table lists how the equations look in each case. Look for which equations are copies or mixes of each other. A mix of two equations gives a real clue about the picture.</p>`,
        set: { mode: 'geo', sys: 'C', nShow: 3, rot: 125, tilt: 25 } },
      { title: 'Eliminate the same variable twice',
        text: String.raw`<p>To solve, remove <b>z</b> from two different pairs of equations. That gives two new equations in \(x\) and \(y\). Each new equation is a sheet standing straight up, through the line where two original sheets cross.</p><p>Choose z, make N1 and N2, solve for x and y, then find z. Start with System 1.</p>`,
        set: { mode: 'alg', asys: 'a1', rot: 35, tilt: 30 } }
    ],
    formal: String.raw`
      <h3>A linear equation in three unknowns is a plane</h3>
      <p>The equation \(ax+by+cz=d\) (with \(a,b,c\) not all zero) is satisfied by the points of one flat sheet in space, a <em>plane</em>. A <em>system</em> of three such equations asks for the points that lie on all three planes. Such a point \((x,y,z)\) is a <em>solution</em>.</p>
      <h3>The ways three planes can meet</h3>
      <p><b>One point</b>: the planes have three different tilts, like the floor and two walls in the corner of a room. <b>A line</b>: the planes share a line, like the pages of a book at its spine; or two equations are the same plane and the third crosses it. <b>Nothing</b>: two planes are parallel (or two are the same plane and the third is parallel to them), or the planes cross in pairs but the three crossing lines are parallel (a triangular tunnel). <b>A whole plane</b>: all three equations describe the same plane.</p>
      <h3>Why adding equations keeps the solution</h3>
      <p>Suppose \((x,y,z)\) makes \(E_1\) and \(E_2\) true. Then the left side of \(E_1\) equals its right side, and the same holds for \(E_2\). Adding equal numbers to equal numbers gives equal numbers, so the sum of the left sides equals the sum of the right sides. The same holds for multiplying an equation by a number. So every solution of the system is also a solution of any combination \(m_1E_1+m_2E_2+m_3E_3\). The new equations can have extra solutions, which is why you find the last variable from an original equation and check all three. Every solution of the system also solves the new equation, so no solution is lost.</p>
      <h3>Elimination for three unknowns</h3>
      <p>1. Choose a variable to eliminate, say \(z\). 2. Combine one pair of equations so the \(z\) terms cancel. Call the result \(N_1\). 3. Combine a <em>different</em> pair that includes the equation \(N_1\) left out, so the \(z\) terms cancel again. Call it \(N_2\). It must be the <b>same variable</b>, otherwise \(N_1\) and \(N_2\) are not in the same two unknowns. 4. Solve the two equations \(N_1,N_2\) in \(x\) and \(y\) by ordinary elimination. 5. Put \(x\) and \(y\) back into any original equation to find \(z\). 6. Check all three original equations.</p>
      <h3>Worked example</h3>
      <p>\(x+y+z=6,\;2x-y+z=3,\;x+2y-z=2\). Adding the first and third gives \(2x+3y=8\). Subtracting the second from the first gives \(-x+2y=3\). Multiply the second by 2 and add: \(7y=14\), so \(y=2\). Then \(2x+6=8\) gives \(x=1\), and the first equation gives \(z=3\). Check the second: \(2-2+3=3\), and the third: \(1+4-3=2\). The solution is \((1,2,3)\).</p>
      <p>Geometry: \(2x+3y=8\) has no \(z\), so it is a vertical sheet. It contains the line where the first and third sheets cross. The two vertical sheets cross in a vertical line, and that line pierces the original sheets at \((1,2,3)\).</p>
      <h3>When elimination ends strangely</h3>
      <p>If every variable cancels and you are left with a <b>false</b> statement such as \(0=5\), the system has <b>no solution</b>. If you are left with a <b>true</b> statement such as \(0=0\), that combination was redundant. Try the other combinations: if none of them gives a false statement, there are infinitely many solutions. For \(x+y+z=3,\;x-y+z=1,\;x+z=2\), adding the first two gives \(2x+2z=4\), the same as twice the third. We get \(0=0\). Choose \(x=t\). The first equation minus the second gives \(2y=2\), so \(y=1\), and then \(z=2-t\). The solutions are \((t,\,1,\,2-t)\) for any \(t\): a line.</p>
      <h3>The same steps as a matrix</h3>
      <p>Write the coefficients and totals as rows of an <em>augmented matrix</em>. Adding a multiple of one row to another is a <em>row operation</em>, and it is exactly the step above. Eliminating from the example looks like \(R_1+R_3\to N_1\) and \(R_1-R_2\to N_2\). The matrix lesson uses this idea in a shorter form.</p>
      <h3>From a story to equations</h3>
      <p>Name the unknowns first, with units (price of one muffin, in dollars). Write one equation for each fact: count times price, added up, equals the total. Solve, then say what each number means. A solution is only an answer when it is checked against all of the original facts.</p>`,
    check: [
      { q: String.raw`Three planes are given by \(x+y+z=2\), \(x+y+z=5\) and \(x-y=0\). How many points lie on all three?`,
        choices: [
          'Exactly one point, where the third plane cuts through the first two',
          'A whole line, because the third plane crosses the first two',
          'None, because the first two planes are parallel and have no point in common',
          'Infinitely many, because all three equations contain \\(x\\)'], answer: 2,
        why: String.raw`The first two equations have the same left side but different totals, so \(x+y+z\) would have to equal 2 and 5 at once. That is impossible, so the planes are parallel and share no point. A point on all three would be on both. The third plane cannot change that.`,
        hint: String.raw`Look at the first two equations by themselves. Can \(x+y+z\) equal both 2 and 5?` },
      { q: String.raw`Solve \(x+y+z=3\), \(2x-y+z=7\), \(x+2y-z=-2\). Adding the first and third gives \(2x+3y=1\), and subtracting the second from the first gives \(-x+2y=-4\). What is \(z\)?`,
        choices: [String.raw`\(z=4\)`, String.raw`\(z=2\)`, String.raw`\(z=-1\)`, String.raw`\(z=3\)`], answer: 1,
        why: String.raw`From \(-x+2y=-4\) we get \(x=2y+4\). Then \(2(2y+4)+3y=1\), so \(7y=-7\) and \(y=-1\). So \(x=2\). From the first equation, \(z=3-2-(-1)=2\). Check the second equation: \(4+1+2=7\). The value \(z=-1\) is \(y\), and \(z=3\) is a total, not a variable. The value \(z=4\) comes from \(z=3-y\), which forgets to subtract \(x\) as well.`,
        hint: 'Solve the two equations in x and y first. Then put x and y into the first equation to find z.' },
      { q: String.raw`A student solves \(E_1: x+y+z=6\), \(E_2: 2x-y+z=3\), \(E_3: x+2y-z=2\). The student writes: "Add \(E_1\) and \(E_3\) to remove \(z\): \(2x+3y=8\). Double \(E_1\) and \(E_3\) and add again: \(4x+6y=16\). Now I have two equations in \(x\) and \(y\)." What is wrong?`,
        choices: [
          'Nothing is wrong. Two equations without z are exactly what is needed.',
          String.raw`The second equation is just double the first, because it used the same pair \(E_1,E_3\). The student must use \(E_2\) to get a different equation without \(z\).`,
          String.raw`Doubling \(E_1\) and \(E_3\) is not allowed, because equations can only be added, never multiplied.`,
          String.raw`\(z\) should be removed last, after \(x\) and \(y\).`], answer: 1,
        why: String.raw`\(4x+6y=16\) is \(2(2x+3y=8)\). It has the same solutions, so it adds no information. Two equations from the same pair can never pin down \(x\) and \(y\). A second equation without \(z\) must bring in \(E_2\), for example \(E_1-E_2\): \(-x+2y=3\). Multiplying an equation by a number is allowed.`,
        hint: String.raw`Compare \(4x+6y=16\) with \(2x+3y=8\). Is the second equation really new?` }
    ],
    links: { prereq: ['solving-systems-by-elimination', 'solving-systems-with-matrices'], related: ['cramers-rule', 'matrices', 'systems-of-equations', 'modeling-with-systems', 'linear-transformations'] },

    mount({ stage, controls: C }) {
      const st = { mode: 'geo', back: 'geo', rot: 35, tilt: 30, sys: 'B', nShow: 3, guess: null, revealed: false, asys: 'a1', alg: null,
        story: { i: 0, ok: [false, false, false] }, prac: { on: false, i: 0, right: 0, done: 0, finished: false }, solved: {} };
      let cancel = () => {};
      const P = new Plane(stage, { span: 5 });
      const show = (el, on) => { el.style.display = on ? '' : 'none'; };

      /* ================= the 3D picture ================= */
      const solMark = (an, q) => an.kind === 'point' ? { type: 'point', q: an.q, text: ptText(an.q) } : an.kind === 'line' ? { type: 'line', p0: an.p0, dir: an.dir } : { type: an.kind };
      const geoView = () => {
        const S = SYS[st.sys], an = analyse(S.rows), sub = st.nShow < 3 ? analyse(S.rows.slice(0, st.nShow)) : null;
        let cap;
        if (st.nShow === 0) cap = ['Press "Show one more sheet"'];
        else if (st.nShow === 1) cap = ['One equation, one sheet'];
        else if (st.nShow === 2) cap = [sub.kind === 'line' ? 'Two sheets cross in a line' : sub.kind === 'none' ? 'These two sheets are parallel and never meet' : 'These two equations are the same sheet'];
        else if (!st.revealed) cap = ['System ' + st.sys + ': how many points are on all three?'];
        else cap = [{ point: 'One point is on all three sheets: ' + ptText(an.q || [0, 0, 0]), line: 'A whole line is on all three sheets', none: 'No point is on all three sheets', plane: 'All three equations are one sheet' }[an.kind]];
        return { rows: S.rows, lim: S.lim, show: [0, 1, 2].map(i => i < st.nShow), red: [], mark: st.revealed && st.nShow === 3 ? solMark(an) : null, cap };
      };
      const algView = () => {
        const A = st.alg, S = A.sid, rows = A.rows, V = { rows, lim: 4, show: [true, true, true], red: A.news.map(n => n.row), mark: null, vline: null, cap: ['Solve it: three sheets, one solution?'] };
        if (A.news.length) V.cap = ['Violet sheets: the new equations without ' + VAR[A.e]];
        if (A.news.length === 2) {
          const [i, j] = [0, 1, 2].filter(k => k !== A.e), a = A.news[0].row, b = A.news[1].row, D = a[i] * b[j] - a[j] * b[i];
          if (Math.abs(D) > 1e-9) {
            const p0 = [0, 0, 0]; p0[i] = (a[3] * b[j] - a[j] * b[3]) / D; p0[j] = (a[i] * b[3] - a[3] * b[i]) / D;
            const dir = [0, 0, 0]; dir[A.e] = 1; V.vline = { p0, dir };
            V.cap = ['The violet sheets cross in a line parallel to the ' + VAR[A.e] + '-axis'];
          }
        }
        if (A.stage === 'done') {
          if (A.special === 'none') V.cap = ['No point is on all three sheets'];
          else if (A.special === 'many') { V.mark = solMark(analyse(rows)); V.cap = ['A whole line is on all three sheets']; }
          else if (A.final) { V.mark = { type: 'point', q: A.vals.slice(), text: ptText(A.vals) }; V.cap = ['The solution is the point on all three sheets']; V.vline = null; }
        }
        return V;
      };
      const storyView = () => {
        const sv = st.story, V = { rows: STORY_ROWS, lim: 4, show: sv.ok.slice(), red: [], mark: null, cap: ['The three receipts are three sheets'] };
        if (st.solved.story && sv.i >= 5) { V.mark = { type: 'point', q: [2, 3, 1], text: '(2, 3, 1)' }; V.cap = ['The prices are the point on all three sheets']; }
        else if (sv.ok.some(Boolean)) V.cap = ['Each receipt you write becomes one sheet'];
        else V.cap = ['Write the equations: each one becomes a sheet'];
        return V;
      };
      const pracView = () => {
        const pr = st.prac, pb = PRAC[pr.i], v = { ...pb.view }, V = { rows: v.rows, lim: v.lim, show: [0, 1, 2].map(i => typeof v.show === 'number' ? i < v.show : true), red: v.red || [], mark: null, cap: ['Practice ' + (pr.i + 1) + ' of ' + N] };
        if (pr.solved && pb.after) {
          const a = pb.after;
          if (a.rows) V.rows = a.rows;
          if (a.show != null) V.show = [0, 1, 2].map(i => i < a.show);
          if (a.red) V.red = a.red;
          if (a.auto && V.rows.length) { const an = analyse(V.rows); V.mark = solMark(an); V.cap = [an.kind === 'point' ? 'The point ' + ptText(an.q) + ' is on all three sheets' : an.kind === 'line' ? 'A whole line is on all three sheets' : an.kind === 'none' ? 'No point is on all three sheets' : 'All three equations are one sheet']; }
        }
        return V;
      };
      const curView = () => st.mode === 'prac' ? pracView() : st.mode === 'alg' ? algView() : st.mode === 'story' ? storyView() : geoView();

      P.onDraw = (c, p) => {
        const pal = p.pal, w = p.w, hh = p.h, fs = w < 520 ? 13 : 15, V = curView(), L = V.lim;
        const rho = L * Math.SQRT2, pitch = st.tilt * PI / 180, CP = Math.cos(pitch), SP = Math.sin(pitch);
        const capH = V.cap && V.cap.length ? 38 : 12, topM = 22, availH = hh - topM - capH, availW = w - 36;
        const sc = Math.min(availW / (2 * rho), availH / (2 * (L * CP + rho * SP)));
        const ox = w / 2, oy = topM + availH / 2, a = st.rot * PI / 180, ca = Math.cos(a), sa = Math.sin(a);
        const pj = q => { const yr = q[0] * sa + q[1] * ca; return [ox + (q[0] * ca - q[1] * sa) * sc, oy - (q[2] * CP + yr * SP) * sc, yr]; };
        const txt = (s, x, y, o = {}) => {
          c.font = `${o.wt || 600} ${o.size || fs}px "Hanken Grotesk","Helvetica Neue",Arial,sans-serif`;
          c.textAlign = o.al || 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 4; c.strokeStyle = pal.stage;
          c.strokeText(s, x, y); c.fillStyle = o.col || pal.text; c.fillText(s, x, y);
        };
        const seg = (A, B, col, lw, dash) => {
          const q = pj(A), r = pj(B); c.beginPath(); c.moveTo(q[0], q[1]); c.lineTo(r[0], r[1]);
          c.strokeStyle = col; c.lineWidth = lw; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]);
        };
        /* the box */
        for (const [i, j] of CEDGE) seg(CUBE[i].map(v => v * L), CUBE[j].map(v => v * L), alpha(pal.muted, .5), 1.2);
        /* the axes */
        for (let k = 0; k < 3; k++) {
          const e = [0, 0, 0]; e[k] = L; const f = [0, 0, 0]; f[k] = -L;
          seg(f, e, alpha(pal.text, .45), 1.4);
          const g = [0, 0, 0]; g[k] = L * 1.16; const q = pj(g);
          txt(VAR[k], q[0], q[1], { size: fs + 2, wt: 700, col: pal.text });
        }
        /* the sheets, far to near */
        const items = [];
        V.rows.forEach((row, i) => { if (!V.show[i]) return; const poly = planePoly(row, L); if (poly) items.push({ poly, i, col: pal[COL[i]], name: 'E' + (i + 1), dash: false }); });
        V.red.forEach((row, i) => { const poly = planePoly(row, L); if (poly) items.push({ poly, i, col: pal.violet, name: 'N' + (i + 1), dash: true }); });
        for (const it of items) { it.s = it.poly.map(pj); it.d = it.s.reduce((t, q) => t + q[2], 0) / it.s.length; }
        items.sort((u, v) => v.d - u.d);
        for (let i = items.length - 1; i >= 0; i--) {
          const key = it => it.s.map(q => Math.round(q[0]) + ',' + Math.round(q[1])).sort().join(';');
          const j = items.findIndex((o, k) => k !== i && k < i && key(o) === key(items[i]) && o.dash === items[i].dash);
          if (j >= 0) { items[j].name += ' = ' + items[i].name; items[j].same = true; items.splice(i, 1); }
        }
        for (const it of items) {
          c.beginPath(); it.s.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.closePath();
          c.fillStyle = alpha(it.col, it.dash ? .13 : .3); c.fill();
          c.setLineDash(it.dash ? [7, 5] : []); c.strokeStyle = alpha(it.col, .95); c.lineWidth = it.dash ? 2.2 : 2.4; c.stroke(); c.setLineDash([]);
        }
        for (const it of items) {
          const cx0 = it.s.reduce((t, q) => t + q[0], 0) / it.s.length, cy0 = it.s.reduce((t, q) => t + q[1], 0) / it.s.length;
          let best = it.s[0], bd = -1; for (const q of it.s) { const d = Math.hypot(q[0] - ox, q[1] - oy); if (d > bd) { bd = d; best = q; } }
          txt(it.name, lerp(cx0, best[0], .55), lerp(cy0, best[1], .55), { col: it.same ? pal.text : it.dash ? pal.violet : pal[COL[it.i]], size: fs, wt: 800 });
        }
        /* the answer: a point, a line, or a dashed vertical line */
        const drawLine = (ln, col, lw, dash) => {
          const cl = clipLine(ln.p0, ln.dir, L); if (!cl) return null;
          seg([cl[0][0], cl[0][1], cl[0][2]], [cl[1][0], cl[1][1], cl[1][2]], col, lw, dash);
          return pj([(cl[0][0] + cl[1][0]) / 2, (cl[0][1] + cl[1][1]) / 2, (cl[0][2] + cl[1][2]) / 2]);
        };
        if (V.vline) drawLine(V.vline, pal.violet, 3.5, [2, 5]);
        const m = V.mark;
        if (m && m.type === 'line') {
          const mid = drawLine(m, pal.violet, 5.5);
          if (mid) txt('line of solutions', mid[0], mid[1] - 18, { col: pal.violet, wt: 700 });
        }
        if (m && m.type === 'point') {
          const q = pj(m.q); c.beginPath(); c.arc(q[0], q[1], 8, 0, TAU); c.fillStyle = pal.violet; c.fill(); c.lineWidth = 3; c.strokeStyle = pal.stage; c.stroke();
          txt(m.text, clamp(q[0], 40, w - 40), q[1] - 20, { col: pal.violet, wt: 800, size: fs + 1 });
        }
        if (V.cap) V.cap.forEach((s, k) => {
          let size = fs; c.font = `600 ${size}px sans-serif`; while (c.measureText(s).width > w - 20 && size > 12) { size--; c.font = `600 ${size}px sans-serif`; }
          txt(s, w / 2, hh - capH + 16 + k * 18, { size, wt: 600, col: pal.text });
        });
      };

      /* ================= panel scaffolding ================= */
      const probe = C.readout(), host = probe.parentNode; host.removeChild(probe);
      const grp = build => {
        const i = host.children.length; build();
        const wrap = h('div', { style: 'display:flex;flex-direction:column;gap:14px' });
        [...host.children].slice(i).forEach(e => wrap.append(e)); host.append(wrap); return wrap;
      };
      const box = (cls, style) => h('div', { class: cls, style: style || '', 'aria-live': 'polite' });
      const redraw = () => P.requestDraw();

      /* ---- mode tabs ---- */
      let tabBtns = [];
      const gTabs = grp(() => {
        tabBtns = C.buttons([
          { label: 'See the sheets', onClick: () => setMode('geo') },
          { label: 'Solve it', onClick: () => setMode('alg') },
          { label: 'Story problem', onClick: () => setMode('story') }]);
      });
      const paintTabs = () => tabBtns.forEach((b, i) => {
        const on = ['geo', 'alg', 'story'][i] === st.mode; b.classList.toggle('primary', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });

      /* ---- turn the picture ---- */
      let rotS, tiltS;
      const gTurn = grp(() => {
        C.title('Turn the picture');
        rotS = C.slider({ label: 'Turn', min: -180, max: 180, step: 5, value: st.rot, format: v => Math.round(v) + '°', onInput: v => { cancel(); st.rot = v; redraw(); } });
        tiltS = C.slider({ label: 'Tilt (look from above or from the side)', min: 5, max: 80, step: 5, value: st.tilt, format: v => Math.round(v) + '°', onInput: v => { cancel(); st.tilt = v; redraw(); } });
        C.buttons([
          { label: 'Turn left', onClick: () => { cancel(); st.rot = wrapDeg(snap(st.rot, 5) - 30); syncView(); } },
          { label: 'Turn right', onClick: () => { cancel(); st.rot = wrapDeg(snap(st.rot, 5) + 30); syncView(); } }]);
        C.hint('You can also drag sideways on the picture to turn it.');
      });
      const syncView = () => { rotS.set(Math.round(st.rot / 5) * 5); tiltS.set(Math.round(st.tilt / 5) * 5); P.draw(); };
      let drag = null; const cv = P.canvas; cv.style.cursor = 'grab'; cv.style.touchAction = 'pan-y';
      cv.addEventListener('pointerdown', e => { drag = e.clientX; cv.setPointerCapture(e.pointerId); cancel(); });
      cv.addEventListener('pointermove', e => { if (drag == null) return; st.rot = wrapDeg(st.rot + (e.clientX - drag) * .6); drag = e.clientX; rotS.set(Math.round(st.rot / 5) * 5); redraw(); });
      const endDrag = () => { drag = null; }; cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);

      /* ================= GEO: see the sheets ================= */
      let selSys, sheetBtns, predBtns, geoRo, predFb, tblBox;
      const gGeo = grp(() => {
        C.title('Three sheets');
        selSys = C.select({ label: 'System', value: st.sys, options: SYS_IDS.map(k => ({ value: k, label: 'System ' + k })), onChange: v => { st.sys = v; st.nShow = 3; st.guess = null; st.revealed = false; renderGeo(); } });
        geoRo = box('ctl readout', 'line-height:1.8');
        host.append(geoRo);
        sheetBtns = C.buttons([
          { label: 'Show one fewer sheet', onClick: () => { st.nShow = Math.max(0, st.nShow - 1); renderGeo(); } },
          { label: 'Show one more sheet', primary: true, onClick: () => { st.nShow = Math.min(3, st.nShow + 1); renderGeo(); } }]);
        C.title('Predict');
        C.hint('How many points are on all three sheets?');
        predBtns = C.buttons([
          { label: 'One point', onClick: () => predict('point') }, { label: 'A whole line', onClick: () => predict('line') },
          { label: 'None', onClick: () => predict('none') }, { label: 'A whole sheet', onClick: () => predict('plane') }]);
        predFb = box('ctl readout', 'border-top:0;padding-top:0'); host.append(predFb);
        tblBox = h('div', { class: 'ctl' }); host.append(tblBox);
      });
      const caseOf = () => CASES[SYS[st.sys].key];
      const predict = g => {
        if (st.nShow < 3 || st.revealed) return;
        const S = SYS[st.sys], an = analyse(S.rows), cs = CASES[S.key];
        st.guess = g; st.revealed = true;
        predFb.innerHTML = (g === an.kind ? good('Right.') + ' ' : bad('Not this time.') + ' You guessed ' + GUESS[g] + '. ') + `<b>${cs.head}.</b> ${cs.why}` +
          (an.kind === 'point' ? ` The point is ${ptText(an.q)}.` : '');
        renderGeo();
      };
      const renderGeo = () => {
        const S = SYS[st.sys];
        selSys.value = st.sys;
        geoRo.innerHTML = S.rows.map((r, i) => `<span style="color:${CSSV[i]};font-weight:700">E${i + 1} (${COL[i]})</span> ${eqText(r)}` + (i >= st.nShow ? ' <span class="k">(hidden)</span>' : '')).join('<br>');
        sheetBtns[0].disabled = st.nShow <= 0; sheetBtns[1].disabled = st.nShow >= 3;
        const can = st.nShow === 3 && !st.revealed;
        predBtns.forEach((b, i) => { b.disabled = !can; b.style.borderColor = ''; b.style.color = ''; if (st.revealed && st.guess === ['point', 'line', 'none', 'plane'][i]) { b.style.borderColor = 'var(--brass)'; b.style.color = 'var(--brass)'; b.disabled = false; } });
        if (!st.revealed) predFb.innerHTML = st.nShow < 3 ? 'Show all three sheets to make a prediction.' : 'Look at the three equations and the sheets, then press a guess.';
        const hi = st.revealed ? caseOf().row : -1;
        tblBox.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:.82rem;line-height:1.35"><caption style="text-align:left;color:var(--muted);padding-bottom:4px">How the equations look in each case</caption>` +
          `<thead><tr style="text-align:left;color:var(--muted)"><th style="padding:3px 4px;font-weight:600">Meet in</th><th style="padding:3px 4px;font-weight:600">The equations</th><th style="padding:3px 4px;font-weight:600">Elimination</th></tr></thead><tbody>` +
          TABLE.map((r, i) => `<tr style="border-top:1px solid var(--line);${i === hi ? 'background:var(--dot);outline:2px solid var(--brass)' : ''}"><td style="padding:4px;vertical-align:top;font-weight:600">${r[0]}</td><td style="padding:4px;vertical-align:top">${r[1]}</td><td style="padding:4px;vertical-align:top">${r[2]}</td></tr>`).join('') + '</tbody></table>';
        redraw();
      };

      /* ================= ALG: solve by elimination ================= */
      const newAlg = sid => ({ sid, rows: ALG[sid].rows.map(r => r.slice()), stage: 'pick', e: null, news: [], e2: null, vleft: null, M: null, vals: [null, null, null], via: null, subOf: null, msg: '', special: null, final: false });
      let aSel, aTbl, aPrompt, aMsg, aVarBtns, gMake1, gMake2, gVal, gUse, mS, pS, valS, valBtn, useBtns, makeBtn1, makeBtn2, prevBox1, prevBox2, matBox, startOver;
      const gAlg = grp(() => {
        C.title('Solve by elimination');
        aSel = C.select({ label: 'System', value: st.asys, options: ALG_IDS.map(k => ({ value: k, label: ALG[k].label })), onChange: v => { st.asys = v; st.alg = newAlg(v); renderAlg(); } });
        aTbl = h('div', { class: 'ctl' }); host.append(aTbl);
        aPrompt = box('ctl readout', 'border-top:0;padding-top:0;font-weight:600'); host.append(aPrompt);
        aVarBtns = C.buttons(VAR.map((v, k) => ({ label: 'Eliminate ' + v, onClick: () => pickVar(k) })));
        gMake1 = grp(() => {
          mS = [0, 1, 2].map(k => C.slider({ label: 'Use E' + (k + 1) + ' times', min: -4, max: 4, step: 1, value: 0, format: v => sg(v), onInput: () => renderAlg() }));
          prevBox1 = box('ctl readout', 'border-top:0;padding-top:0'); host.append(prevBox1);
          [makeBtn1] = C.buttons([{ label: 'Make the new equation', primary: true, onClick: () => makeFirst() }]);
        });
        gMake2 = grp(() => {
          pS = [0, 1].map(k => C.slider({ label: 'Use N' + (k + 1) + ' times', min: -12, max: 12, step: 1, value: 0, format: v => sg(v), onInput: () => renderAlg() }));
          prevBox2 = box('ctl readout', 'border-top:0;padding-top:0'); host.append(prevBox2);
          [makeBtn2] = C.buttons([{ label: 'Make the one-variable equation', primary: true, onClick: () => makeSecond() }]);
        });
        gUse = grp(() => { useBtns = C.buttons([0, 1, 2].map(k => ({ label: 'Use', onClick: () => useEq(k) }))); });
        gVal = grp(() => {
          valS = C.slider({ label: 'Your value', min: -12, max: 12, step: 1, value: 0, format: v => sg(v), onInput: () => renderAlg() });
          [valBtn] = C.buttons([{ label: 'Check my value', primary: true, onClick: () => checkVal() }]);
        });
        aMsg = box('ctl readout', 'border-top:0;padding-top:0'); host.append(aMsg);
        [startOver] = C.buttons([{ label: 'Start this system again', onClick: () => { st.alg = newAlg(st.asys); renderAlg(); } }]);
        const det = h('details', { class: 'ctl' }, h('summary', { style: 'cursor:pointer;font-size:.92rem' }, 'The same steps as rows of a matrix (optional)'));
        matBox = h('div', { style: 'font-size:.88rem;line-height:1.6;margin-top:8px' }); det.append(matBox); host.append(det);
      });
      const A_ = () => st.alg;
      const unitScore = e => st.alg.rows.filter(r => Math.abs(r[e]) > 1).length;
      const vname = k => VAR[k];
      const cellHtml = (c, j, first, hi) => {
        const a = Math.abs(c), body = (c === 0 ? '0' : a === 1 ? '' : a) + VAR[j];
        const sign = first ? (c < 0 ? MN : '') : (c < 0 ? MN + ' ' : '+ ');
        const style = c === 0 ? (hi ? 'color:var(--green);font-weight:700' : 'color:var(--faint)') : '';
        return `<td style="padding:3px 5px;text-align:right;white-space:nowrap;${style}">${sign}${body}</td>`;
      };
      const rowHtml = (label, r, o = {}) => `<tr style="${o.bg ? 'background:var(--dot)' : ''}"><td style="padding:3px 5px;font-weight:700;color:${o.col || 'var(--text)'}">${label}</td>` +
        [0, 1, 2].map(j => cellHtml(r[j], j, j === 0, o.hi === j || (o.his && o.his.includes(j)))).join('') + `<td style="padding:3px 2px">=</td><td style="padding:3px 5px;text-align:right">${sg(r[3])}</td></tr>`;
      const effort = e => {
        const col = st.alg.rows.map(r => r[e]), unit = col.every(v => Math.abs(v) <= 1);
        const best = [0, 1, 2].reduce((b, k) => unitScore(k) < unitScore(b) ? k : b, 0);
        return `${vname(e)} has coefficients ${col.map(sg).join(', ')} in E1, E2, E3. ` + (unit ? 'They are all 1, −1 or 0, so adding and subtracting will be enough. ' : 'Some are not 1 or −1, so you will need to multiply an equation first. ') +
          'Any choice works. ' + (unitScore(e) > unitScore(best) ? `A quicker start would be ${vname(best)}, whose coefficients are ${st.alg.rows.map(r => sg(r[best])).join(', ')}.` : 'This is one of the quickest starts.');
      };
      const nUnused = () => { const used = new Set(st.alg.news.flatMap(n => n.used)); return [0, 1, 2].filter(k => !used.has(k)); };
      const pickVar = k => {
        const A = A_();
        if (A.stage === 'pick') { A.e = k; A.stage = 'make'; A.msg = effort(k); }
        else if (A.stage === 'pick2') {
          const [i, j] = [0, 1, 2].filter(q => q !== A.e);
          if (A.news.every(n => n.row[k] === 0)) { A.msg = bad('Not that one.') + ` ${vname(k)} is already missing from both N1 and N2, so there is nothing to eliminate. Choose ${vname(k === i ? j : i)}.`; renderAlg(); return; }
          A.e2 = k; A.vleft = k === i ? j : i; A.stage = 'make2';
          const col = A.news.map(n => n.row[k]);
          A.msg = `${vname(k)} has coefficients ${col.map(sg).join(' and ')} in N1 and N2. Choose multipliers so these two terms are opposite numbers, then they cancel when added.`;
        }
        renderAlg();
      };
      const makeFirst = () => {
        const A = A_(), ms = mS.map(s => s.get()), used = [0, 1, 2].filter(k => ms[k] !== 0), e = A.e, V = vname(e), nw = A.news.length;
        const terms = used.map(k => `${sg(ms[k])} × (${sg(A.rows[k][e])})`);
        if (!used.length) { A.msg = bad('Nothing used yet.') + ' All three multipliers are 0. Set the multiplier of two equations to a number other than 0.'; return renderAlg(); }
        if (used.length === 3) { A.msg = bad('Use two at a time.') + ' You used all three equations. Two equations make one new equation. The third one is for the other new equation.'; return renderAlg(); }
        const row = combo(A.rows, ms);
        if (row[e] !== 0) {
          A.msg = bad(`${V} is still there.`) + ` The ${V} terms add up to ${terms.join(' + ')} = ${sg(row[e])}, not 0. ` + (used.length === 1 ? `A single equation keeps its ${V} term. Use a second equation, with multipliers that make the ${V} terms opposite numbers.` : `Change a multiplier so the two ${V} terms are opposite numbers.`);
          return renderAlg();
        }
        if (nw === 1) {
          const prev = A.news[0].used, un = nUnused();
          if (!un.every(k => used.includes(k))) {
            A.msg = bad('Bring in the left-out equation.') + ` N1 used ${prev.map(k => 'E' + (k + 1)).join(' and ')}. So far E${un[0] + 1} has not been used at all. N2 must use E${un[0] + 1}, otherwise N1 and N2 cannot tell you anything about it. ` + (used.length === prev.length && used.every(k => prev.includes(k)) ? 'The same pair gives only a copy of N1.' : '');
            return renderAlg();
          }
        }
        if (row.slice(0, 3).every(v => v === 0)) {
          A.msg = bad('Everything cancelled.') + ` That gives ${eqText(row)}. ` + (row[3] === 0 ? 'It is true but tells you nothing new. Try different multipliers.' : 'That is false. It means the equations contradict each other, but first make a proper N equation.');
          return renderAlg();
        }
        A.news.push({ row, used, ms });
        const first = nw === 0;
        A.msg = good(`N${nw + 1} is ready: ${eqText(row)}.`) + ` The ${V} terms are gone.` + (first ? ' This is allowed because a solution makes every original equation true, so it also makes any sum of multiples of them true. Now make N2 the same way, with the same variable.' : '');
        mS.forEach(s => s.set(0));
        A.stage = A.news.length === 2 ? 'pick2' : 'make';
        renderAlg();
      };
      const makeSecond = () => {
        const A = A_(), ps = pS.map(s => s.get()), used = [0, 1].filter(k => ps[k] !== 0), k2 = A.e2, V2 = vname(k2);
        if (!used.length) { A.msg = bad('Nothing used yet.') + ' Both multipliers are 0. Choose numbers other than 0.'; return renderAlg(); }
        const row = combo(A.news.map(n => n.row), ps), terms = used.map(k => `${sg(ps[k])} × (${sg(A.news[k].row[k2])})`);
        if (row[k2] !== 0) { A.msg = bad(`${V2} is still there.`) + ` The ${V2} terms add up to ${terms.join(' + ')} = ${sg(row[k2])}, not 0. Choose multipliers that make them opposite numbers.`; return renderAlg(); }
        if (used.length === 1 && A.news[used[0]].row[k2] !== 0) { A.msg = bad('Use both.') + ` N${used[0] + 1} still has ${V2} in it. Use both N1 and N2.`; return renderAlg(); }
        const kk = row[A.vleft], r = row[3], V = vname(A.vleft);
        A.one = row;
        if (kk !== 0) {
          A.M = { k: kk, r }; A.stage = 'solve1';
          A.msg = good(`The ${V2} terms cancel.`) + ` You get ${eqText(row)}. Only ${V} is left.`;
        } else {
          A.stage = 'done'; A.special = r !== 0 ? 'none' : 'many';
          A.msg = r !== 0
            ? bad(`Every variable cancelled, and you are left with 0 = ${sg(r)}.`) + ' That is false for every x, y and z. So no point is on all three sheets: the system has <b>no solution</b>. In the picture, no point lies on all three sheets.'
            : good('Every variable cancelled, and you are left with 0 = 0.') + ' That is always true. N1 and N2 were really the same equation, so one original equation was a mix of the other two. The system has <b>infinitely many solutions</b>: a line of points.' +
              (ALG[A.sid].param ? ` Let x = t. Then the equations give ${ALG[A.sid].param}, for any number t.` : '');
        }
        pS.forEach(s => s.set(0));
        renderAlg();
      };
      const rowText = (r, v) => eqText(r);
      const useEq = k => {
        const A = A_();
        if (A.stage === 'solve2') {
          const row = A.news[k].row, c = row[A.e2];
          if (c === 0) { A.msg = bad('Not that one.') + ` N${k + 1} has no ${vname(A.e2)} term, so it cannot give ${vname(A.e2)}. Use the other one.`; return renderAlg(); }
          A.via = k; const d = row[A.vleft] * A.vals[A.vleft], rhs = row[3] - d;
          A.target = rhs / c; A.tVar = A.e2;
          A.sub = `Put ${vname(A.vleft)} = ${sg(A.vals[A.vleft])} into N${k + 1}: ${eqText(row)} becomes ${tm(c, vname(A.e2))} + ${pn(row[A.vleft])}·${pn(A.vals[A.vleft])} = ${sg(row[3])}${Math.abs(c) === 1 ? '' : `, so ${tm(c, vname(A.e2))} = ${sg(rhs)}`}. What is ${vname(A.e2)}?`; A.msg = '';
        } else if (A.stage === 'solve3') {
          const row = A.rows[k], c = row[A.e];
          if (c === 0) { A.msg = bad('Not that one.') + ` E${k + 1} has no ${vname(A.e)} term, so it cannot give ${vname(A.e)}. Use another equation.`; return renderAlg(); }
          const others = [0, 1, 2].filter(q => q !== A.e), rhs = row[3] - others.reduce((s, q) => s + row[q] * A.vals[q], 0);
          A.via = k; A.target = rhs / c; A.tVar = A.e;
          A.sub = `Put ${others.map(q => `${vname(q)} = ${sg(A.vals[q])}`).join(' and ')} into E${k + 1}: ${eqText(row)} becomes ${tm(c, vname(A.e))} + ${others.map(q => `${pn(row[q])}·${pn(A.vals[q])}`).join(' + ')} = ${sg(row[3])}${Math.abs(c) === 1 ? '' : `, so ${tm(c, vname(A.e))} = ${sg(rhs)}`}. What is ${vname(A.e)}?`; A.msg = '';
        }
        valS.set(0); renderAlg();
      };
      const checkVal = () => {
        const A = A_(), v = valS.get();
        if (A.stage === 'solve1') {
          const { k, r } = A.M, V = vname(A.vleft);
          if (k * v === r) { A.vals[A.vleft] = v; A.stage = 'solve2'; A.via = null; A.msg = good('Yes.') + ` ${sg(k)} × ${sg(v)} = ${sg(r)}, so ${V} = ${sg(v)}. Now use it to find ${vname(A.e2)}: put ${V} = ${sg(v)} into N1 or N2.`; }
          else A.msg = bad('Not yet.') + ` With ${V} = ${sg(v)}, ${sg(k)}${V} is ${sg(k * v)}, but the equation needs ${sg(r)}. Divide both sides by ${sg(k)}.`;
        } else if (A.stage === 'solve2' || A.stage === 'solve3') {
          const tv = A.tVar, V = vname(tv);
          if (v === A.target) {
            A.vals[tv] = v;
            if (A.stage === 'solve2') { A.stage = 'solve3'; A.via = null; A.msg = good('Yes.') + ` ${V} = ${sg(v)}. Now two of the three unknowns are known. Put them into any original equation to find ${vname(A.e)}.`; }
            else finishCheck();
          } else A.msg = bad('Not yet.') + ` Check by putting ${V} = ${sg(v)} back: it should make the equation true. Solve the equation shown for ${V}.`;
        }
        renderAlg();
      };
      const finishCheck = () => {
        const A = A_(), v = A.vals, lines = A.rows.map((r, i) => {
          const val = r[0] * v[0] + r[1] * v[1] + r[2] * v[2], ok = val === r[3];
          return `E${i + 1}: ${[0, 1, 2].filter(j => r[j]).map(j => `${pn(r[j])}·${pn(v[j])}`).join(' + ')} = ${sg(val)} ${ok ? good('✓') : bad('✗, it should be ' + sg(r[3]))}`;
        });
        const all = A.rows.every(r => r[0] * v[0] + r[1] * v[1] + r[2] * v[2] === r[3]);
        A.stage = 'done'; A.final = all;
        A.msg = (all ? good('Check all three equations.') : bad('One equation fails.')) + '<br>' + lines.join('<br>') + '<br>' +
          (all ? `So (x, y, z) = ${ptText(v)}. In the picture, this is the point where all three sheets meet.` : 'The values do not fit every equation, so the system has no solution.');
        if (all) st.solved[A.sid] = true;
      };
      const matHtml = () => {
        const A = A_(), row = r => `<div style="font-family:ui-monospace,Menlo,monospace;white-space:pre">[ ${r.slice(0, 3).map(v => String(v).replace('-', MN).padStart(3)).join(' ')} | ${String(r[3]).replace('-', MN).padStart(3)} ]</div>`;
        let s = `<div>Each equation is a row of the <em>augmented matrix</em>: the coefficients of x, y, z, then the total.</div>` + A.rows.map((r, i) => `<div style="display:flex;gap:8px"><b>R${i + 1}</b>${row(r)}</div>`).join('');
        s += A.news.map((n, i) => `<div>N${i + 1} = ${n.used.map(k => `${sg(n.ms[k])}·R${k + 1}`).join(' + ').replace(/\+ −/g, '− ')}: the row ${n.row.map(sg).join(', ')}</div>`).join('');
        s += '<div style="color:var(--muted)">Replacing a row by a combination of rows is a row operation. It is the same step as in the table.</div>';
        return s;
      };
      const renderAlg = () => {
        const A = A_(), st_ = A.stage;
        aSel.value = st.asys;
        /* table */
        const hiE = A.e;
        let t = `<table style="width:100%;border-collapse:collapse;font-size:.92rem;font-variant-numeric:tabular-nums"><tbody>` +
          A.rows.map((r, i) => rowHtml('E' + (i + 1), r, { hi: hiE, col: CSSV[i] })).join('') +
          A.news.map((n, i) => rowHtml('N' + (i + 1), n.row, { hi: hiE, bg: true, col: 'var(--violet)' })).join('') +
          (A.one ? rowHtml('M', A.one, { his: [A.e2], bg: true }) : '') + '</tbody></table>';
        const found = [0, 1, 2].filter(k => A.vals[k] != null);
        if (found.length) t += `<div style="font-size:.92rem;margin-top:6px"><span class="k">Found so far</span> ${found.map(k => `${vname(k)} = ${sg(A.vals[k])}`).join(', ')}</div>`;
        aTbl.innerHTML = t;
        /* prompt */
        const un = nUnused();
        const prompts = {
          pick: 'Which variable will you eliminate first? To eliminate means to make it disappear from two new equations.',
          make: A.news.length === 0 ? `Make N1 with no ${vname(A.e)}. Choose how many of each equation to use (1 adds it, −1 subtracts it). Use two equations.` : `Now make N2, also with no ${vname(A.e)}. It must use E${un.length ? un[0] + 1 : '?'}, the equation N1 left out.`,
          pick2: `N1 and N2 are two equations in ${[0, 1, 2].filter(k => k !== A.e).map(vname).join(' and ')}. Choose which of these to eliminate next, as you would for two equations.`,
          make2: `Multiply N1 and N2 by numbers so the ${A.e2 != null ? vname(A.e2) : ''} terms cancel, then add. The result M has one unknown.`,
          solve1: A.M ? `Solve ${eqText(A.one)} for ${vname(A.vleft)}.` : '',
          solve2: A.via == null ? `Find ${A.e2 != null ? vname(A.e2) : ''}: choose an equation to put ${A.vleft != null ? vname(A.vleft) : ''} into.` : A.sub,
          solve3: A.via == null ? `Find ${A.e != null ? vname(A.e) : ''}: choose an original equation to put the two known values into.` : A.sub,
          done: A.final ? 'Solved and checked.' : A.special ? 'Elimination ended in a special case.' : 'Finished.'
        };
        aPrompt.textContent = prompts[st_] || '';
        aMsg.innerHTML = A.msg || '';
        /* controls */
        const pickMode = st_ === 'pick' || st_ === 'pick2';
        show(aVarBtns[0].parentNode, pickMode);
        aVarBtns.forEach((b, k) => { show(b, st_ === 'pick' || (st_ === 'pick2' && k !== A.e)); });
        show(gMake1, st_ === 'make'); show(gMake2, st_ === 'make2');
        show(gUse, (st_ === 'solve2' || st_ === 'solve3') && A.via == null);
        show(gVal, st_ === 'solve1' || ((st_ === 'solve2' || st_ === 'solve3') && A.via != null));
        useBtns.forEach((b, k) => {
          const isN = st_ === 'solve2'; show(b, isN ? k < 2 : k < 3); b.textContent = isN ? `Use N${k + 1}` : `Use E${k + 1}`;
        });
        if (st_ === 'make') {
          const ms = mS.map(s => s.get()), used = [0, 1, 2].filter(k => ms[k] !== 0), row = combo(A.rows, ms);
          prevBox1.innerHTML = used.length ? `<span class="k">Your mix</span> ${used.map(k => `${sg(ms[k])}·E${k + 1}`).join(' + ').replace(/\+ −/g, '− ')} gives ${row.slice(0, 3).every(v => v === 0) ? '0 = ' + sg(row[3]) : eqText(row)}<br><span class="k">${vname(A.e)} terms</span> ${used.map(k => `${sg(ms[k])}(${sg(A.rows[k][A.e])})`).join(' + ')} = ${sg(row[A.e])}${row[A.e] === 0 ? ' ' + good('✓ gone') : ''}` : '<span class="k">Set a multiplier to see the new equation.</span>';
        }
        if (st_ === 'make2') {
          const ps = pS.map(s => s.get()), used = [0, 1].filter(k => ps[k] !== 0), row = combo(A.news.map(n => n.row), ps);
          prevBox2.innerHTML = used.length ? `<span class="k">Your mix</span> ${used.map(k => `${sg(ps[k])}·N${k + 1}`).join(' + ').replace(/\+ −/g, '− ')} gives ${row.slice(0, 3).every(v => v === 0) ? '0 = ' + sg(row[3]) : eqText(row)}<br><span class="k">${vname(A.e2)} terms</span> ${used.map(k => `${sg(ps[k])}(${sg(A.news[k].row[A.e2])})`).join(' + ')} = ${sg(row[A.e2])}${row[A.e2] === 0 ? ' ' + good('✓ gone') : ''}` : '<span class="k">Set a multiplier to see the new equation.</span>';
        }
        show(startOver.parentNode, A.stage !== 'pick');
        matBox.innerHTML = matHtml();
        redraw();
      };

      /* ================= quiz block (story and practice) ================= */
      const mkQuiz = () => {
        const el = h('div', { style: 'display:flex;flex-direction:column;gap:10px' });
        const stat = h('p', { class: 'hint', style: 'margin:0' }), q = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        const chs = h('div', { style: 'display:flex;flex-direction:column;gap:8px' }), fb = h('p', { style: 'margin:0;font-size:.92rem;line-height:1.5', 'aria-live': 'polite' });
        const nav = h('div', { class: 'ctl buttons' });
        el.append(stat, q, chs, fb, nav);
        const Q = { el, nav, stat, fb, item: null, tries: 0, done: false, cb: {} };
        Q.load = (item, statText, cb) => {
          Q.item = item; Q.tries = 0; Q.done = false; Q.cb = cb || {};
          stat.textContent = statText || ''; q.innerHTML = `<b>${item.tag}${/[?.]$/.test(item.tag) ? '' : '.'}</b> ${item.q}`; fb.innerHTML = ''; chs.innerHTML = '';
          item.choices.forEach((ch, i) => chs.append(h('button', { type: 'button', class: 'btn', style: 'justify-content:flex-start;text-align:left;height:auto;min-height:42px;padding:8px 14px;white-space:normal;line-height:1.35', html: ch.t, onclick: () => pick(i) })));
        };
        const pick = i => {
          if (Q.done) return;
          const ch = Q.item.choices[i], b = chs.children[i]; Q.tries++;
          if (ch.ok) {
            Q.done = true; b.style.borderColor = 'var(--green)'; b.style.color = 'var(--green)';
            [...chs.children].forEach(x => { x.disabled = true; });
            fb.innerHTML = good('Correct.') + ' ' + ch.why + (Q.tries === 1 ? ' Right on the first try.' : '');
            Q.cb.right && Q.cb.right(Q.tries === 1);
          } else {
            b.disabled = true; b.style.borderColor = 'var(--red)'; b.style.color = 'var(--red)';
            fb.innerHTML = bad('Not quite.') + ' ' + ch.why + ' Try another answer.';
            Q.cb.wrong && Q.cb.wrong();
          }
        };
        return Q;
      };

      /* ================= STORY ================= */
      let stQ, stCard, stSolve, stInfo, stNext, stBack;
      const gStory = grp(() => {
        C.title('A story problem');
        stCard = h('div', { class: 'ctl readout', style: 'border-top:0;padding-top:0;line-height:1.55', html:
          '<b>At the bakery.</b> Receipt 1: 1 muffin, 2 coffees and 1 juice cost $9. Receipt 2: 2 muffins, 1 coffee and 3 juices cost $10. Receipt 3: 3 muffins, 1 coffee and 1 juice cost $10. Every muffin has one price, every coffee one price, every juice one price. Find the three prices.' });
        host.append(stCard);
        stQ = mkQuiz(); host.append(stQ.el);
        stSolve = h('div', { class: 'ctl', style: 'display:flex;flex-direction:column;gap:10px' });
        stInfo = h('p', { style: 'margin:0;font-size:.92rem;line-height:1.5' });
        const go = h('button', { type: 'button', class: 'btn primary', onclick: () => { st.asys = 'story'; st.alg = newAlg('story'); setMode('alg'); } }, 'Solve it in the elimination table');
        stSolve.append(stInfo, h('div', { class: 'ctl buttons' }, go));
        host.append(stSolve);
        stNext = h('div', { class: 'ctl buttons' });
        stBack = h('button', { type: 'button', class: 'btn primary', onclick: () => { st.story.i++; loadStory(); } }, 'Next question');
        stNext.append(stBack); host.append(stNext);
      });
      const loadStory = () => {
        const sv = st.story, it = STORY[sv.i];
        show(stQ.el, !!it && !it.solve); show(stSolve, !!it && !!it.solve);
        stBack.textContent = 'Next question';
        show(stNext, false);
        if (!it) { /* finished */
          show(stQ.el, false); show(stSolve, true); stInfo.innerHTML = good('Story complete.') + ' You named the unknowns, wrote three equations, solved the system and said what the answer means, with units. Press "Start the story again" to repeat.';
          stSolve.querySelector('button').textContent = 'Start the story again'; stSolve.querySelector('button').onclick = () => { sv.i = 0; sv.ok = [false, false, false]; st.solved.story = false; loadStory(); };
        } else if (it.solve) {
          const done = !!st.solved.story;
          stInfo.innerHTML = done ? good('You solved it.') + ' The solution was x = 2, y = 3, z = 1. Press Next question to say what it means.' : '<b>Solve the system.</b> Your three equations are x + 2y + z = 9, 2x + y + 3z = 10 and 3x + y + z = 10. Open the elimination table, eliminate the same variable twice, and finish the check. Then come back to this tab.';
          const b = stSolve.querySelector('button'); b.textContent = done ? 'Open the table again' : 'Solve it in the elimination table'; b.onclick = () => { st.asys = 'story'; if (!done || !st.alg || st.alg.sid !== 'story') st.alg = newAlg('story'); setMode('alg'); };
          show(stNext, done);
        } else {
          stQ.load(it, `Story question ${sv.i + 1 - (sv.i > 4 ? 1 : 0)} of 6`, { right: () => { if (it.eq != null) sv.ok[it.eq] = true; show(stNext, true); stBack.textContent = 'Next question'; redraw(); } });
        }
        redraw();
      };
      stSolve.querySelector('button').textContent = 'Solve it in the elimination table';

      /* ================= PRACTICE ================= */
      let pracStartRow, pracBox, pQ, pStat, pNext, pLeave;
      const gPrac = grp(() => {
        C.title('Practice');
        C.hint('Eight short problems. Pick an answer and read why.');
        [pracStartRow] = [C.buttons([{ label: 'Start practice', primary: true, onClick: () => startPrac() }])[0].parentNode];
        pracBox = h('div', { style: 'display:none;flex-direction:column;gap:12px' }); host.append(pracBox);
        pQ = mkQuiz(); pStat = h('p', { class: 'readout', style: 'margin:0;border-top:0;padding-top:0', 'aria-live': 'polite' });
        pNext = h('button', { type: 'button', class: 'btn primary', onclick: () => nextProb() }, 'Next problem');
        pLeave = h('button', { type: 'button', class: 'btn', onclick: () => leavePrac() }, 'Back to the lesson');
        pracBox.append(pStat, pQ.el, h('div', { class: 'ctl buttons' }, pNext, pLeave));
      });
      const pracTally = () => { const p = st.prac; pStat.innerHTML = p.finished ? `<span class="k">Finished.</span> Right on the first try: <b>${p.right} of ${N}</b>.` : `<span class="k">Problem ${p.i + 1} of ${N}.</span> ` + (p.done ? `Right on the first try: <b>${p.right} of ${p.done}</b>.` : 'None answered yet.'); };
      const loadProb = i => {
        const p = st.prac; p.i = i; p.solved = false; p.finished = false; pNext.disabled = true; pNext.textContent = i + 1 < N ? 'Next problem' : 'See my result';
        pQ.load(PRAC[i], '', { right: first => { p.solved = true; p.done++; if (first) p.right++; pNext.disabled = false; pracTally(); redraw(); } });
        pQ.stat.textContent = ''; pracTally(); redraw();
      };
      const startPrac = () => {
        cancel(); const p = st.prac; p.on = true; p.right = 0; p.done = 0; p.finished = false; st.back = st.mode === 'prac' ? st.back : st.mode; st.mode = 'prac';
        show(pracStartRow, false); show(pracBox, true); showModes(); loadProb(0);
      };
      const nextProb = () => {
        const p = st.prac;
        if (p.finished) { p.right = 0; p.done = 0; loadProb(0); return; }
        if (p.i + 1 < N) loadProb(p.i + 1);
        else { p.finished = true; pNext.textContent = 'Start again'; pNext.disabled = false; pQ.el.style.display = 'none'; pracTally(); pStat.innerHTML += `<br>${p.right === N ? 'Every one on the first try.' : 'Look back at the steps: eliminate the same variable twice, solve the two-variable system, then put the values back.'}`; }
      };
      const leavePrac = () => { st.prac.on = false; st.mode = st.back || 'geo'; pQ.el.style.display = ''; show(pracStartRow, true); show(pracBox, false); showModes(); };

      /* ================= modes ================= */
      const showModes = () => {
        const m = st.mode, pr = m === 'prac';
        show(gTabs, !pr); show(gGeo, m === 'geo'); show(gAlg, m === 'alg'); show(gStory, m === 'story');
        paintTabs();
        if (m === 'geo') renderGeo(); else if (m === 'alg') renderAlg(); else if (m === 'story') loadStory(); else pracTally();
        redraw();
      };
      const setMode = m => { cancel(); if (st.prac.on) { st.prac.on = false; show(pracStartRow, true); show(pracBox, false); pQ.el.style.display = ''; } st.mode = m; showModes(); };

      /* ================= guided steps ================= */
      const apply = (patch, immediate) => {
        cancel();
        const { rot, tilt, mode, sys, nShow, asys, ...rest } = patch, anim = {};
        if (rot !== undefined) anim.rot = rot; if (tilt !== undefined) anim.tilt = tilt;
        if (sys !== undefined && (sys !== st.sys || st.nShow !== nShow)) { st.sys = sys; st.guess = null; st.revealed = false; }
        if (nShow !== undefined) { if (st.nShow !== nShow) { st.revealed = false; st.guess = null; } st.nShow = nShow; }
        if (asys !== undefined && (asys !== st.asys || !st.alg || st.alg.sid !== asys || st.alg.stage !== 'pick')) { st.asys = asys; st.alg = newAlg(asys); }
        if (st.prac.on) { st.prac.on = false; show(pracStartRow, true); show(pracBox, false); pQ.el.style.display = ''; }
        if (mode !== undefined) st.mode = mode;
        showModes();
        if (immediate || !Object.keys(anim).length) { Object.assign(st, anim); syncView(); } else cancel = animateTo(st, anim, 900, syncView);
      };

      st.alg = newAlg(st.asys);
      showModes(); show(pracBox, false);
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
