/* =====================================================================
   SCHOOL — Solving systems by elimination
   ===================================================================== */
{
  const MI = '−';
  const kk = t => `<span class="k">${t}</span>`;
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const par = v => (v < 0 ? `(${num(v)})` : num(v));
  const tm = (c, v) => (c === 0 ? '0' : (Math.abs(c) === 1 ? (c < 0 ? MI : '') : num(c)) + v);
  /* [a, b, c] as "ax + by = c" with zero terms left out */
  const eqText = e => {
    let s = '';
    const add = (c, v) => {
      if (c === 0) return;
      const body = (Math.abs(c) === 1 ? '' : num(Math.abs(c))) + v;
      s += s ? (c < 0 ? ` ${MI} ` : ' + ') + body : (c < 0 ? MI : '') + body;
    };
    add(e[0], 'x'); add(e[1], 'y');
    return (s || '0') + ' = ' + num(e[2]);
  };
  const sa = (c, v) => (c === 0 ? '' : (c < 0 ? ` ${MI} ` : ' + ') + (Math.abs(c) === 1 ? '' : num(Math.abs(c))) + v);   /* " + 3y" or " − y" */
  const z0 = v => v + 0;                                   /* turns -0 into 0 */
  const ROWS = [[1, 1], [1, -1], [2, 1], [1, 2], [2, -1], [1, -2], [3, 1], [1, 3], [3, -1], [1, -3]];   /* the fan: s times Eq 1 plus t times Eq 2 */

  /* the two equations after multiplying (m1, m2), and the new equation after Add or Subtract */
  const mk = (E, m1, m2, op, oops) => {
    const sc = (e, m) => [z0(m * e[0]), z0(m * e[1]), z0(oops ? e[2] : m * e[2])];
    const e1 = sc(E[0], m1), e2 = sc(E[1], m2), sg = op === 'sub' ? -1 : 1;
    const R = [z0(e1[0] + sg * e2[0]), z0(e1[1] + sg * e2[1]), z0(e1[2] + sg * e2[2])];
    let kind;
    if (m1 === 0 || m2 === 0) kind = 'zero';
    else if (op === 'none') kind = 'wait';
    else if (R[0] === 0 && R[1] === 0) kind = R[2] === 0 ? 'same' : 'void';
    else if (R[1] === 0) kind = 'vert';
    else if (R[0] === 0) kind = 'horiz';
    else kind = 'both';
    return { e1, e2, R, kind, sg };
  };
  const seg = (p, A, B, Cc) => {
    const b = p.bounds();
    if (B !== 0) return [[b.x0, (Cc - A * b.x0) / B], [b.x1, (Cc - A * b.x1) / B]];
    const x = Cc / A; return [[x, b.y0], [x, b.y1]];
  };
  const coincide = E => {
    const [a, b, c] = E[0], [d, e, f] = E[1];
    return a * e - b * d === 0 && a * f - c * d === 0 && b * f - c * e === 0;
  };

  /* ---------- the five examples used by the steps ---------- */
  const CASES = [
    { name: 'A. Terms already opposite', eq: [[1, 1, 5], [1, -1, 1]], sol: [3, 2],
      q: 'Eq 1 is x + y = 5 and Eq 2 is x − y = 1. You are about to ADD them. Which variable will cancel?',
      opts: [['x cancels', 'The x terms are x and x. They add to 2x, so x stays. Look at the y terms: y and −y.'],
             ['y cancels', good('Yes.') + ' The y terms are +y and −y, and y + (−y) = 0. Press Add and watch.'],
             ['Neither cancels', 'Look at the y terms: y and −y. They add to 0, so y does cancel. Press Add and watch.']], ans: 1 },
    { name: 'B. Multiply one equation', eq: [[2, 1, 9], [3, -2, -4]], sol: [2, 5],
      q: 'Eq 1 is 2x + y = 9 and Eq 2 is 3x − 2y = −4. Eq 2 has −2y. You will ADD. What should you multiply Eq 1 by so that the y terms cancel?',
      opts: [['× 1 (leave it)', 'Then the y terms are y and −2y. They add to −y, so y stays.'],
             ['× 2', good('Yes.') + ' Eq 1 times 2 has 2y, and 2y + (−2y) = 0. Set the slider to 2 and press Add.'],
             ['× 3', 'Then the y terms are 3y and −2y. They add to y, so y stays.'],
             ['× −2', 'Then the y terms are −2y and −2y. They add to −4y, so y stays. (Subtracting would cancel them, but the plan was to add.)']], ans: 1 },
    { name: 'C. Multiply both equations', eq: [[2, 3, 11], [3, 2, 14]], sol: [4, 1],
      q: 'Eq 1 is 2x + 3y = 11 and Eq 2 is 3x + 2y = 14. You want the x terms to be EQUAL so that you can subtract. Which multipliers do that?',
      opts: [['Eq 1 × 2 and Eq 2 × 3', 'That gives 4x and 9x. They are not equal. (It does give 6y and 6y, so the y terms would match instead.)'],
             ['Eq 1 × 3 and Eq 2 × 2', good('Yes.') + ' That gives 6x and 6x. Set the sliders to 3 and 2, then press Subtract.'],
             ['Eq 1 × 3 and Eq 2 × 3', 'That gives 6x and 9x. They are not equal. You need a number that both 2 and 3 divide into: 6.']], ans: 1 },
    { name: 'D. Parallel lines', eq: [[1, 2, 4], [2, 4, 14]], sol: null,
      q: 'Eq 1 is x + 2y = 4 and Eq 2 is 2x + 4y = 14. Double Eq 1, then subtract Eq 2. What will be left?',
      opts: [['One solution, like x = 3', 'Both the x terms and the y terms match after doubling, so both will cancel. No x is left to solve for.'],
             ['A statement that is never true, like 0 = −6', good('Yes.') + ' Doubling Eq 1 gives 2x + 4y = 8. Eq 2 has the same left side but a right side of 14. Subtracting leaves 0 = −6.'],
             ['A statement that is always true, 0 = 0', 'That needs the right sides to match too. Doubling Eq 1 gives a right side of 8, but Eq 2 has 14.']], ans: 1 },
    { name: 'E. The same line', eq: [[3, -1, 5], [6, -2, 10]], sol: null,
      q: 'Eq 1 is 3x − y = 5 and Eq 2 is 6x − 2y = 10. Double Eq 1, then subtract Eq 2. What will be left?',
      opts: [['0 = 0', good('Yes.') + ' Doubling Eq 1 gives 6x − 2y = 10, which is exactly Eq 2. Subtracting leaves 0 = 0.'],
             ['0 = 10', 'Doubling Eq 1 makes its right side 10. Eq 2 has 10 too, and 10 − 10 = 0.'],
             ['x = 0', 'Both x and y cancel, so no x is left.']], ans: 0 }
  ];

  /* ---------- practice problems (a fixed list) ---------- */
  const PROBS = [
    { name: 'Add directly', kind: 'choice', eq: [[1, 1, 9], [1, -1, 3]], sol: [6, 3], move: [1, 1, 'add'],
      q: 'Eq 1 is x + y = 9 and Eq 2 is x − y = 3. Add the two equations: left sides together, right sides together. Which new equation do you get?',
      ch: [['2y = 6', '2y = 6 is what you get when you SUBTRACT: (x + y) − (x − y) = 2y and 9 − 3 = 6. The question says add.'],
           ['2x + 2y = 12', 'That keeps a 2y, but y + (−y) = 0, so no y is left. The new equation is about x only.'],
           ['2x = 12', 'x + x = 2x, y + (−y) = 0 and 9 + 3 = 12. The y terms cancel, so the new line is vertical at x = 6. Eq 1 then gives y = 9 − 6 = 3, and (6, 3) works in Eq 2: 6 − 3 = 3.'],
           ['0 = 12', 'The x terms do not cancel: x + x = 2x, not 0. Only the y terms cancel.']], ans: 2 },
    { name: 'Subtract', kind: 'move', eq: [[2, 1, 10], [2, -3, 2]], sol: [4, 2],
      q: 'Eq 1 is 2x + y = 10 and Eq 2 is 2x − 3y = 2. Choose Add or Subtract so that one variable cancels. Leave the multipliers at 1 if you can. Then press Check my move.',
      fin: [['(x, y) = (2, 4)', 'You swapped the numbers. x comes first. Check Eq 1: 2(2) + 4 = 8, not 10.'],
            ['(x, y) = (4, 2)', 'For example, Eq 1 minus Eq 2 gives 4y = 8, so y = 2. Then 2x + 2 = 10 gives x = 4. Check Eq 2: 2(4) − 3(2) = 2.'],
            ['(x, y) = (1, 8)', 'It works in Eq 1 (2 + 8 = 10) but not in Eq 2 (2 − 24 = −22, not 2). A solution must work in both.'],
            ['(x, y) = (4, 0)', 'Eq 1 gives y = 10 − 2(4) = 2, not 0. Always finish by finding the second coordinate.']], ans: 1 },
    { name: 'Multiply one equation', kind: 'move', eq: [[1, 2, 8], [3, -4, 4]], sol: [4, 2],
      q: 'Eq 1 is x + 2y = 8 and Eq 2 is 3x − 4y = 4. Neither variable cancels yet. Multiply one equation, choose Add or Subtract, then press Check my move.',
      fin: [['(x, y) = (20, 2)', 'If the new equation is 5x = 20, divide by 5: x = 4. The 20 is the right side before dividing.'],
            ['(x, y) = (2, 3)', 'It works in Eq 1 (2 + 6 = 8) but not in Eq 2 (6 − 12 = −6, not 4). A solution must work in both.'],
            ['(x, y) = (4, 2)', 'Whichever valid move you chose, x = 4. Then Eq 1 gives 4 + 2y = 8, so y = 2. Check Eq 2: 3(4) − 4(2) = 4.'],
            ['(x, y) = (4, 8)', 'x = 4 is right. Eq 1 gives 4 + 2y = 8, so 2y = 4 and y = 2. The 8 is the right side of Eq 1, not y.']], ans: 2 },
    { name: 'Multiply both equations', kind: 'move', eq: [[3, 2, 13], [2, 5, 16]], sol: [3, 2],
      q: 'Eq 1 is 3x + 2y = 13 and Eq 2 is 2x + 5y = 16. You need a multiplier for each equation. Pick them, choose Add or Subtract, then press Check my move.',
      fin: [['(x, y) = (5, −1)', 'It works in Eq 1 (15 − 2 = 13) but not in Eq 2 (10 − 5 = 5, not 16). A solution must work in both.'],
            ['(x, y) = (2, 3)', 'You swapped the numbers. Check Eq 1: 3(2) + 2(3) = 12, not 13.'],
            ['(x, y) = (1, 5)', 'It works in Eq 1 (3 + 10 = 13) but not in Eq 2 (2 + 25 = 27, not 16). A solution must work in both.'],
            ['(x, y) = (3, 2)', 'Eq 1 gives 9 + 2y = 13, so y = 2 once x = 3. Check Eq 2: 2(3) + 5(2) = 16.']], ans: 3 },
    { name: 'A no-solution system', kind: 'choice', eq: [[2, -1, 3], [4, -2, 9]], sol: null, move: [2, 1, 'sub'],
      q: 'Eq 1 is 2x − y = 3 and Eq 2 is 4x − 2y = 9. Multiply Eq 1 by 2, then subtract Eq 2. What do you get, and what does it mean?',
      ch: [['0 = 0, so there are infinitely many solutions', 'Doubling Eq 1 gives 4x − 2y = 6, with right side 6. Eq 2 has right side 9, and 6 − 9 = −3, not 0.'],
           ['0 = −3, which is never true: no solution', 'Both x and y cancel and the right sides leave 6 − 9 = −3. No x and y can make 0 = −3 true. The lines are parallel (same slope 2, different intercepts), so they never meet.'],
           ['x = 3, so there is one solution', 'Both x and y cancel, so no x is left to solve for.'],
           ['0 = −3, so the solution is (0, −3)', '0 = −3 has no x or y in it. It is just false, so it gives no point at all.']], ans: 1 },
    { name: 'The same line', kind: 'choice', eq: [[1, 3, 6], [2, 6, 12]], sol: null, move: [2, 1, 'sub'],
      q: 'Eq 1 is x + 3y = 6 and Eq 2 is 2x + 6y = 12. Multiply Eq 1 by 2, then subtract Eq 2. What do you get, and what does it mean?',
      ch: [['0 = 0, so the solution is (0, 0)', '(0, 0) does not even work in Eq 1: 0 + 0 = 0, not 6. A result of 0 = 0 does not point to one spot. It says the statement is always true.'],
           ['0 = 12, so there is no solution', 'Doubling Eq 1 gives right side 12, and Eq 2 has 12, so 12 − 12 = 0. A false statement like 0 = 12 would need unequal right sides.'],
           ['0 = 0, so the two equations are one line and every point on it works', 'Doubling Eq 1 gives 2x + 6y = 12, which is exactly Eq 2. Subtracting leaves 0 = 0, which is always true. Every point on the line is a solution, for example (0, 2) and (6, 0).'],
           ['x = 0, so the solution is (0, 2)', 'Both x and y cancel, so no x is left. (0, 2) does work, but so does (6, 0) and many more points.']], ans: 2 },
    { name: 'Tickets', kind: 'move', eq: [[1, 1, 10], [5, 3, 38]], sol: [4, 6],
      q: 'A school sold 10 tickets for $38 in all. Adult tickets cost $5 and child tickets cost $3. Let x be the number of adult tickets and y the number of child tickets. Eq 1 is x + y = 10 (tickets). Eq 2 is 5x + 3y = 38 (dollars). Choose multipliers, Add or Subtract, then press Check my move.',
      fin: [['6 adult tickets and 4 child tickets', 'That is 10 tickets, but the cost is 5(6) + 3(4) = $42, not $38. x counts adult tickets, so check which number goes where.'],
            ['8 adult tickets and 2 child tickets', 'That is 10 tickets, but the cost is 5(8) + 3(2) = $46, not $38. A solution must work in both equations.'],
            ['4 adult tickets and 4 child tickets', 'That is only 8 tickets, not 10, and the cost is $32.'],
            ['4 adult tickets and 6 child tickets', '3 × Eq 1 is 3x + 3y = 30. Subtracting from Eq 2 gives 2x = 8, so x = 4 adult tickets. Then y = 10 − 4 = 6 child tickets. Cost: 5(4) + 3(6) = 20 + 18 = $38.']], ans: 3 }
  ];

  register({
    id: 'solving-systems-by-elimination', level: 'school',
    title: 'Solving systems by elimination',
    blurb: 'Add or subtract two equations, after multiplying one or both, so a variable cancels and the crossing point appears.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 3; p.cy = 3; p.span = 5.2;
      p.grid(1, { axes: false });
      const b = p.bounds();
      [[1, 2], [2, 1], [1, -2], [3, 1]].forEach(([s, t]) => {
        const A = s + t, B = s - t, Cc = 5 * s + t;
        if (B !== 0) p.path([[b.x0, (Cc - A * b.x0) / B], [b.x1, (Cc - A * b.x1) / B]], { stroke: alpha(pal.violet, .3), width: 1.6 });
      });
      p.path([[b.x0, 5 - b.x0], [b.x1, 5 - b.x1]], { stroke: pal.blue, width: 3 });
      p.path([[b.x0, b.x0 - 1], [b.x1, b.x1 - 1]], { stroke: pal.red, width: 3 });
      p.path([[3, b.y0], [3, b.y1]], { stroke: pal.violet, width: 4 });
      p.dot(3, 2, 6.5, pal.yellow, pal.stage, 2);
    },
    hook: String.raw`Two lines cross at one point. If you ADD their equations, you get a brand new line. Why does it still go through the same point, and how can you choose it so it points straight at the answer?`,
    steps: [
      { title: 'Add two true equations',
        text: String.raw`<p>Eq 1 \(x+y=5\) is blue. Eq 2 \(x-y=1\) is red. At their crossing point both are true.</p><p>So at that point their <b>sum</b> is true too. The sum is a new line, drawn in violet. It is neither old line, but it passes through the same point, like every faint line in the fan.</p><p>Predict, then press Add.</p>`,
        set: { cs: 0, m1: 1, m2: 1, op: 'none', oops: 0, fan: 1 } },
      { title: 'Multiply to line the terms up',
        text: String.raw`<p>Here nothing cancels yet. Multiply an equation by a number so that one variable gets opposite terms.</p><p>The dashed copy lies exactly on the old line: both sides were multiplied, so the solution did not move. Predict the multiplier, set it, then add. Try the switch that forgets the right side.</p>`,
        set: { cs: 1, m1: 1, m2: 1, op: 'none', oops: 0, fan: 0 } },
      { title: 'Multiply both equations',
        text: String.raw`<p>Now one multiplier is not enough. Make the \(x\) terms equal (or the \(y\) terms) using a multiplier on each equation. Look for a number that both coefficients divide into.</p><p>A wrong pair leaves both \(x\) and \(y\). The readout shows the terms, so you can see why.</p>`,
        set: { cs: 2, m1: 1, m2: 1, op: 'none', oops: 0, fan: 0 } },
      { title: 'When everything cancels',
        text: String.raw`<p>Eliminate here, and both \(x\) and \(y\) vanish. If what is left is false, like \(0=-6\), no point can fit: the lines are parallel and there is no solution.</p><p>Then use the example menu to try E. If what is left is \(0=0\), the two equations are the same line.</p>`,
        set: { cs: 3, m1: 1, m2: 1, op: 'none', oops: 0, fan: 0 } }
    ],
    formal: String.raw`
      <p>A <em>system</em> of two linear equations asks for the pair \((x,y)\) that makes both true. Here each equation is in standard form \(ax+by=c\), and its graph is a line. A solution is a crossing point.</p>
      <h3>Why adding two equations keeps the solution</h3>
      <p>Suppose \((x_0,y_0)\) makes both equations true:
      \[ a_1x_0+b_1y_0=c_1, \qquad a_2x_0+b_2y_0=c_2. \]
      Equal amounts added to equal amounts stay equal, so
      \[ (a_1+a_2)x_0+(b_1+b_2)y_0=c_1+c_2. \]
      The pair also makes the sum true. So the sum, which is a new equation, is a line through the same point \((x_0,y_0)\). Take any numbers \(s\) and \(t\) and form \(s\) times Eq 1 plus \(t\) times Eq 2: the same argument shows every such line passes through the crossing point. That is the fan of faint lines in the lesson. Elimination picks the one line in the fan whose \(y\) term (or \(x\) term) is zero. A line with no \(y\) term, such as \(2x=6\), is vertical, and a line with no \(x\) term is horizontal, so it names one coordinate directly.</p>
      <h3>Multiplying an equation is allowed</h3>
      <p>Multiplying both sides of an equation by a number \(k\) that is not zero gives an equation with exactly the same solutions. Every pair that worked still works, and dividing by \(k\) undoes the change. So the graph does not change: the multiplied equation draws the same line. That is why the dashed copy lies on the old line.</p>
      <p>You must multiply <em>every</em> term, on both sides. Doubling \(x+y=5\) gives \(2x+2y=10\). If you double only the left side, you get \(2x+2y=5\), which is a different, parallel line. The crossing point moves, and your answer will not check. Never multiply by \(0\): that turns the equation into \(0=0\) and throws away everything it said.</p>
      <h3>Choosing the multipliers</h3>
      <p>To cancel a variable by adding, its two coefficients must be opposites, such as \(2y\) and \(-2y\). To cancel by subtracting, they must be equal. When they are not, multiply to reach a common multiple. For \(3x\) and \(2x\), use \(6x\): multiply by 2 and by 3. Either variable can be the one that cancels.</p>
      <p>Example. Solve \(2x+3y=11\) and \(3x+2y=14\). Multiply Eq 1 by 3 and Eq 2 by 2 to match the \(x\) terms, then subtract.
      \[ \begin{aligned} 6x+9y&=33\\ 6x+4y&=28\\ 5y&=5 \end{aligned} \]
      So \(y=1\). Put \(y=1\) into Eq 1: \(2x+3=11\), so \(x=4\). Check both original equations: \(2(4)+3(1)=11\) and \(3(4)+2(1)=14\). The solution is \((4,1)\).</p>
      <h3>When everything cancels</h3>
      <p>Sometimes both variables cancel and you are left with \(0=c\). If \(c\neq 0\), for example \(0=-6\), the statement is never true, so no pair \((x,y)\) satisfies both equations. The lines have the same slope but different intercepts: they are parallel and the system has <em>no solution</em>. If \(c=0\), you get \(0=0\), which is always true. One equation is a multiple of the other, so they are the same line and the system has <em>infinitely many solutions</em>. Notice that \(0=-6\) is a statement about the whole system, not a value of \(x\).</p>
      <h3>Back-substitute and check</h3>
      <p>After you find one coordinate, put it into either original equation to find the other. Then check the pair in both <em>original</em> equations. The check catches arithmetic slips and the error of multiplying only part of an equation.</p>
      <h3>In a story</h3>
      <p>A school sells 10 tickets for \(\$38\). Adult tickets cost \(\$5\) and child tickets cost \(\$3\). Let \(x\) be adult tickets and \(y\) child tickets. Then \(x+y=10\) counts tickets and \(5x+3y=38\) counts dollars. Multiply the first by 3: \(3x+3y=30\). Subtract it from the second: \(2x=8\), so \(x=4\), and \(y=10-4=6\). The school sold 4 adult tickets and 6 child tickets. Check the money: \(5(4)+3(6)=20+18=38\) dollars.</p>
      <p>Elimination and substitution always agree. Elimination is usually quicker when both equations are in standard form and the coefficients are small whole numbers.</p>`,
    check: [
      { q: 'The point (3, 2) makes Eq 1 true and also makes Eq 2 true. A student adds the two equations to get a new equation. Which statement about the new equation is always true?',
        choices: ['It describes the same line as Eq 1.', 'It describes a line that is parallel to both of the old lines.', 'The point (3, 2) also makes the new equation true, because adding equal amounts to both sides keeps the equation true.', 'Its line passes through the origin (0, 0).'], answer: 2,
        why: String.raw`If \((3,2)\) makes Eq 1 true and Eq 2 true, then adding the left sides and adding the right sides keeps the equality, so \((3,2)\) makes the sum true too. The new line passes through \((3,2)\). It is usually a different line from both old ones, and nothing makes it pass through the origin.`,
        hint: 'Put x = 3 and y = 2 into both old equations. Both sides are equal each time. What happens when you add two true equalities?' },
      { q: 'A school play sold 40 tickets in all. Student tickets cost $4 each and adult tickets cost $7 each. The total was $226. Let s be the number of student tickets and a the number of adult tickets, so s + a = 40 and 4s + 7a = 226. How many adult tickets were sold?',
        choices: ['22 adult tickets', '18 adult tickets', '66 adult tickets', '33 adult tickets'], answer: 0,
        why: String.raw`Multiply \(s+a=40\) by 4 to get \(4s+4a=160\). Subtract it from \(4s+7a=226\): \(3a=66\), so \(a=22\). Then \(s=40-22=18\). Check the money: \(4(18)+7(22)=72+154=226\) dollars. 18 is the number of student tickets. 66 is \(3a\), not \(a\). 33 comes from dividing 66 by 2 instead of 3.`,
        hint: 'Multiply the first equation by 4 so the s terms match, then subtract. Divide by the number left in front of a.' },
      { q: 'Sam solves x + 2y = 7 and 3x − y = 7.<br>Step 1. Multiply the second equation by 2: 6x − 2y = 7.<br>Step 2. Add it to the first equation: 7x = 14.<br>Step 3. So x = 2.<br>Which statement is true?',
        choices: ['Step 2 is wrong: the terms 2y and −2y cannot be added.', 'Step 3 is wrong: 14 ÷ 7 is 7, not 2.', 'Nothing is wrong: x = 2 is the answer.', 'Step 1 is wrong: the right side must be multiplied too, so it should be 6x − 2y = 14.'], answer: 3,
        why: String.raw`Multiplying an equation by 2 multiplies every term, including the 7 on the right: \(6x-2y=14\). Adding gives \(7x=21\), so \(x=3\), and \(3+2y=7\) gives \(y=2\). Sam's \(x=2\) does not check: Eq 1 would give \(y=2.5\) and Eq 2 would give \(y=-1\). Adding \(2y\) and \(-2y\) is exactly how \(y\) cancels, and \(14\div 7=2\) is correct arithmetic.`,
        hint: 'Check Sam’s answer x = 2 in both original equations. Then look at Step 1: was every term multiplied?' }
    ],
    links: { prereq: ['solving-systems-by-substitution'], next: ['modeling-with-systems'], related: ['systems-of-equations', 'forms-of-a-linear-equation', 'solving-equations-with-a-balance', 'systems-of-three-equations', 'solving-systems-with-matrices'] },

    mount({ stage, controls: C }) {
      const st = {
        cs: 0, m1: 1, m2: 1, op: 'none', oops: 0, fan: 1, rev: 0, pred: false, via: 0, chk: 0, chkOk: false,
        practice: false
      };
      let cancel = () => {};
      const panel = stage.nextElementSibling;
      const P = new Plane(stage, { cx: 3, cy: 3.2, span: 8.2 });
      let prOver = false, prIdx = 0, prSolved = false, prTried = false, prFirst = 0, prDone = 0, prStage = 0;

      const cur = () => (st.practice ? PROBS[prIdx] : CASES[st.cs]);
      const work = () => {
        const q = cur();
        if (st.practice && q.kind === 'choice') return mk(q.eq, ...(prSolved ? q.move : [1, 1, 'none']), 0);
        return mk(q.eq, st.m1, st.m2, st.op, st.practice ? 0 : st.oops);
      };

      /* ----- the picture ----- */
      P.onDraw = (c, p) => {
        const pal = p.pal, q = cur(), E = q.eq, w = work(), b = p.bounds();
        p.cx = 3; p.cy = 3.2; p.span = 8.2;
        p.grid(1); p.ticks(1);
        p.label('x', b.x1 - .45, 0, { size: 21, color: pal.muted, dy: -16 });
        p.label('y', 0, b.y1 - .5, { size: 21, color: pal.muted, dx: 14 });
        const showMove = w.kind !== 'wait';
        const rev = st.practice ? (q.kind === 'choice' ? 1 : st.rev) : st.rev;
        /* the fan: s times Eq 1 plus t times Eq 2, all through the crossing point */
        const fan = st.practice ? 0 : st.fan;
        if (q.sol && fan > .01) ROWS.forEach(([s, t]) => {
          const A = s * E[0][0] + t * E[1][0], B = s * E[0][1] + t * E[1][1], Cc = s * E[0][2] + t * E[1][2];
          if (A !== 0 || B !== 0) p.path(seg(p, A, B, Cc), { stroke: alpha(pal.violet, .3 * fan), width: 1.7 });
        });
        const same = coincide(E);
        p.path(seg(p, ...E[0]), { stroke: pal.blue, width: 3.8 });
        p.path(seg(p, ...E[1]), { stroke: pal.red, width: 3.8, dash: same ? [14, 10] : undefined });
        /* multiplied copies: on the same line when every term is multiplied */
        [[E[0], w.e1, st.m1, pal.blue], [E[1], w.e2, st.m2, pal.red]].forEach(([o, e, m, col]) => {
          if (m === 0 || m === 1 || (st.practice && q.kind === 'choice')) return;
          if (JSON.stringify(e) === JSON.stringify(o.map(v => v * m))) p.path(seg(p, ...o), { stroke: pal.stage, width: 1.8, dash: [4, 8] });
          else if (e[0] !== 0 || e[1] !== 0) p.path(seg(p, ...e), { stroke: col, width: 3.2, dash: [10, 7] });
        });
        if (showMove && rev > .01 && (w.kind === 'vert' || w.kind === 'horiz' || w.kind === 'both')) p.path(seg(p, ...w.R), { stroke: alpha(pal.violet, rev), width: 4.8 });
        if (q.sol) {
          p.dot(q.sol[0], q.sol[1], 8.5, pal.yellow, pal.stage, 2.5);
          const found = st.practice ? prSolved : (st.chk === 1 && st.chkOk);
          p.label(found ? `(${q.sol[0]}, ${q.sol[1]})` : '?', q.sol[0], q.sol[1], { size: 22, italic: false, color: pal.text, dx: 46, dy: -22 });
        }
        /* legend */
        const fs = clamp(p.scale * .62, 15, 21) * .85, rows = [];
        const rowFor = (n, o, e, m, col) => rows.push([col, m !== 1 ? `Eq ${n} × ${par(m)}: ${eqText(e)}` : `Eq ${n}: ${eqText(o)}`]);
        const m1 = st.practice && q.kind === 'choice' ? (prSolved ? q.move[0] : 1) : st.m1;
        const m2 = st.practice && q.kind === 'choice' ? (prSolved ? q.move[1] : 1) : st.m2;
        rowFor(1, E[0], w.e1, m1, pal.blue); rowFor(2, E[1], w.e2, m2, pal.red);
        if (showMove && w.kind !== 'zero') rows.push([pal.violet, `New: ${eqText(w.R)}`]);
        c.font = `500 ${fs}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`; c.textAlign = 'left'; c.textBaseline = 'middle';
        const wd = Math.max(...rows.map(r => c.measureText(r[1]).width)), lh = fs * 1.55, pad = 9;
        c.fillStyle = alpha(pal.stage, .9); c.fillRect(8, 8, wd + pad * 2, rows.length * lh + pad); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1; c.strokeRect(8.5, 8.5, wd + pad * 2, rows.length * lh + pad);
        rows.forEach((r, i) => { c.fillStyle = r[0]; c.fillText(r[1], 8 + pad, 8 + pad / 2 + lh * (i + .5)); });
        /* message when there is no new line to draw */
        const msg = w.kind === 'void' ? [`0 = ${num(w.R[2])} is never true.`, 'No line, no point: no solution.'] : w.kind === 'same' ? ['0 = 0 is always true.', 'Same line: infinitely many solutions.'] : null;
        if (msg && showMove) {
          const f2 = fs * 1.1; c.font = `500 ${f2}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`; c.textAlign = 'center';
          const mw = Math.max(...msg.map(t => c.measureText(t).width)) + 24, mh = f2 * 3.4, mx = p.w / 2, my = p.h - mh / 2 - 12;
          c.fillStyle = alpha(pal.stage, .92); c.fillRect(mx - mw / 2, my - mh / 2, mw, mh); c.strokeStyle = pal.violet; c.lineWidth = 2; c.strokeRect(mx - mw / 2, my - mh / 2, mw, mh);
          c.fillStyle = pal.text; c.fillText(msg[0], mx, my - f2 * .75); c.fillText(msg[1], mx, my + f2 * .75);
        }
      };

      /* ----- panel helpers ----- */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const S = o => { const s = C.slider(o); s.inp = panel.lastElementChild.querySelector('input'); return s; };
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const addTo = (...els) => panel.append(...els);
      const lines = a => a.filter(Boolean).join('<br>');
      const mfmt = v => '× ' + (v < 0 ? MI : '') + Math.abs(v);

      let selEx, predTitle, predQ, predRow, predFb, m1S, m2S, opBtns, oopsT, fanT, ro, finBtns, fin;
      let startBtn, ptally, pq, pch, pfb, pnext, pmv, pm1S, pm2S, pbtns, pcheck;

      /* ----- explore: example menu and prediction ----- */
      grp('ex', () => {
        C.title('Example');
        selEx = C.select({ label: 'Choose a system', options: CASES.map((c, i) => ({ value: String(i), label: c.name })), value: '0',
          onChange: v => { cancel(); loadCase(+v); sync(); } });
      });
      grp('pred', () => {
        predTitle = h('p', { class: 'ctl-title' }, 'Predict first');
        predQ = h('p', { class: 'hint' });
        predRow = h('div', { class: 'ctl buttons' });
        predFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        addTo(predTitle, predQ, predRow, predFb);
      });
      const renderPred = () => {
        const cs = CASES[st.cs];
        predQ.textContent = cs.q; predFb.innerHTML = ''; predRow.replaceChildren();
        cs.opts.forEach((o, i) => predRow.append(mkBtn(o[0], () => {
          if (st.pred) return;
          st.pred = true;
          Array.from(predRow.children).forEach((b, j) => { b.disabled = true; if (j === i) b.classList.add('primary'); });
          predFb.innerHTML = (i === cs.ans ? '' : bad('Not quite.') + ' ') + o[1];
          sync();
        })));
        if (st.pred) Array.from(predRow.children).forEach(b => { b.disabled = true; });
      };
      grp('moves', () => {
        C.title('Your move');
        m1S = S({ label: 'Multiply Eq 1 by', min: -5, max: 5, step: 1, value: 1, format: mfmt, onInput: v => { cancel(); st.m1 = v; clearOut(); sync(); } });
        m2S = S({ label: 'Multiply Eq 2 by', min: -5, max: 5, step: 1, value: 1, format: mfmt, onInput: v => { cancel(); st.m2 = v; clearOut(); sync(); } });
        opBtns = C.buttons([{ label: 'Add the equations', onClick: () => setOp('add') }, { label: 'Subtract (Eq 1 − Eq 2)', onClick: () => setOp('sub') }]);
        oopsT = C.toggle({ label: 'Forget the right side when multiplying', value: false, onChange: v => { cancel(); st.oops = v ? 1 : 0; clearOut(); sync(); } });
        fanT = C.toggle({ label: 'Show the fan of other sums', value: true, onChange: v => { cancel(); st.fan = v ? 1 : 0; sync(); } });
      });
      grp('ro', () => { ro = C.readout(); });
      grp('fin', () => {
        C.title('Solve and check');
        finBtns = C.buttons([{ label: 'Put it into Eq 1', onClick: () => { st.via = 1; st.chk = 0; sync(); } }, { label: 'Put it into Eq 2', onClick: () => { st.via = 2; st.chk = 0; sync(); } },
          { label: 'Check in both equations', onClick: () => { doCheck(); sync(); } }]);
        fin = C.readout();
      });

      const clearOut = () => { st.via = 0; st.chk = 0; st.chkOk = false; };
      const setOp = o => { cancel(); st.op = o; clearOut(); st.rev = 0; cancel = animateTo(st, { rev: 1 }, 600, sync); sync(); };
      const loadCase = i => { st.cs = i; st.m1 = 1; st.m2 = 1; st.op = 'none'; st.oops = 0; st.rev = 0; st.pred = false; clearOut(); renderPred(); };

      /* finishing: back-substitute and check, using the ORIGINAL equations */
      const finInfo = () => {
        const q = cur(), w = work();
        if (w.kind !== 'vert' && w.kind !== 'horiz') return null;
        const kx = w.kind === 'vert', val = kx ? w.R[2] / w.R[0] : w.R[2] / w.R[1];
        const info = { kx, val, w };
        if (st.via) {
          const [a, b2, c2] = q.eq[st.via - 1];
          const use = kx ? b2 : a;
          if (use === 0) info.nouse = true;
          else { info.other = kx ? (c2 - a * val) / b2 : (c2 - b2 * val) / a; }
        }
        return info;
      };
      const doCheck = () => {
        const q = cur(), f = finInfo(); if (!f || f.other === undefined) return;
        const x = f.kx ? f.val : f.other, y = f.kx ? f.other : f.val;
        st.chk = 1; st.chkOk = q.eq.every(e => Math.abs(e[0] * x + e[1] * y - e[2]) < 1e-9);
      };
      const finText = () => {
        const q = cur(), f = finInfo();
        if (!f) return 'Finish when one variable cancels: then you can read off a coordinate.';
        const out = [];
        const nm = f.kx ? 'x' : 'y', ot = f.kx ? 'y' : 'x';
        out.push(`${kk('Read off')} ${nm} = ${num(f.w.R[2])} ÷ ${par(f.kx ? f.w.R[0] : f.w.R[1])} = <b>${num(f.val)}</b>`);
        if (!st.via) { out.push(`Now put ${nm} = ${num(f.val)} into one of the ORIGINAL equations to find ${ot}.`); return lines(out); }
        const e = q.eq[st.via - 1], [a, b2, c2] = e;
        if (f.nouse) { out.push(`Eq ${st.via} has no ${ot}, so it cannot give ${ot}. Use the other equation.`); return lines(out); }
        const co = f.kx ? b2 : a, k = f.kx ? a : b2, kv = k * f.val;
        out.push(`${kk('Eq ' + st.via)} with ${nm} = ${num(f.val)}: ${f.kx ? `${num(a)} × ${par(f.val)}${sa(b2, 'y')}` : `${tm(a, 'x')} ${b2 < 0 ? MI : '+'} ${num(Math.abs(b2))} × ${par(f.val)}`} = ${num(c2)}`);
        out.push(`${tm(co, ot)} = ${num(c2)} ${MI} ${par(kv)} = ${num(c2 - kv)}` + (Math.abs(co) === 1 ? '' : `, so ${ot} = ${num(c2 - kv)} ÷ ${par(co)}`));
        out.push(`<b>${ot} = ${num(f.other)}</b>`);
        if (st.chk) {
          const x = f.kx ? f.val : f.other, y = f.kx ? f.other : f.val;
          q.eq.forEach((e2, i) => {
            const L = e2[0] * x + e2[1] * y, ok = Math.abs(L - e2[2]) < 1e-9;
            out.push(`${kk('Check Eq ' + (i + 1))} ${num(e2[0])} × ${par(x)} ${e2[1] < 0 ? MI : '+'} ${num(Math.abs(e2[1]))} × ${par(y)} = ${num(L)}, needed ${num(e2[2])}: ${ok ? good('true') : bad('false')}`);
          });
          out.push(st.chkOk ? good(`Both are true.`) + ` (${num(x)}, ${num(y)}) is the solution.` : bad('Not both true.') + ' Something went wrong. Did every term get multiplied, including the right side?');
        } else out.push('Now check the pair in BOTH original equations.');
        return lines(out);
      };

      /* readout under the sliders */
      const exploreRo = () => {
        const q = CASES[st.cs], w = work(), L = [], R = w.R, sgn = st.op === 'add' ? '+' : MI;
        L.push(`${kk('Eq 1')} ${eqText(q.eq[0])}` + (st.m1 !== 1 ? `, times ${par(st.m1)}: <b>${eqText(w.e1)}</b>` : ''));
        L.push(`${kk('Eq 2')} ${eqText(q.eq[1])}` + (st.m2 !== 1 ? `, times ${par(st.m2)}: <b>${eqText(w.e2)}</b>` : ''));
        if (st.oops && (st.m1 !== 1 || st.m2 !== 1)) L.push(bad('Only the left side was multiplied.') + ' The dashed copy is a different line from the real equation, so it is no longer the same equation.');
        if (!st.pred) { L.push('Make your prediction first. Then the sliders and buttons unlock.'); return lines(L); }
        if (w.kind === 'zero') { L.push(bad('A multiplier of 0 is not allowed.') + ' It turns the equation into 0 = 0 and forgets everything it said.'); return lines(L); }
        if (w.kind === 'wait') { L.push('Set the multipliers, then press Add or Subtract.'); return lines(L); }
        L.push(`${kk('x terms')} ${par(w.e1[0])} ${sgn} ${par(w.e2[0])} = ${num(R[0])}`, `${kk('y terms')} ${par(w.e1[1])} ${sgn} ${par(w.e2[1])} = ${num(R[1])}`, `${kk('Right sides')} ${par(w.e1[2])} ${sgn} ${par(w.e2[2])} = ${num(R[2])}`);
        L.push(`<b>New equation: ${eqText(R)}</b>`);
        if (w.kind === 'vert') L.push(good('y canceled.') + ` The new line is vertical, so it reads off x: x = ${num(R[2])} ÷ ${par(R[0])} = ${num(R[2] / R[0])}.`);
        else if (w.kind === 'horiz') L.push(good('x canceled.') + ` The new line is horizontal, so it reads off y: y = ${num(R[2])} ÷ ${par(R[1])} = ${num(R[2] / R[1])}.`);
        else if (w.kind === 'both') L.push(bad('This still has both x and y.') + ` The new line is tilted. If the system has a solution, this line passes through it, but the line does not name x or y. To cancel, a pair of terms must be opposites (when you add) or equal (when you subtract). Now the x terms are ${num(w.e1[0])} and ${num(w.e2[0])}, and the y terms are ${num(w.e1[1])} and ${num(w.e2[1])}.`);
        else if (w.kind === 'void') L.push(good('Both canceled.') + ` What is left, 0 = ${num(R[2])}, is never true. No x and y fit it, so the two lines have no point in common: no solution.` + (st.oops ? ' (The right side was not multiplied, so this result may be wrong. Turn that switch off to see the real one.)' : ''));
        else if (w.kind === 'same') L.push(good('Both canceled.') + ' What is left, 0 = 0, is always true. The two equations describe the same line, so every point on it is a solution.');
        return lines(L);
      };

      /* ----- practice ----- */
      C.title('Practice');
      C.hint('Seven short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); if (st.practice) { st.practice = false; sync(); } else { st.practice = true; if (!prOver) loadProb(); sync(); } } }])[0];
      grp('practice', () => {
        ptally = h('p', { class: 'ctl-title' });
        pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        pch = h('div', { class: 'ctl buttons' });
        addTo(ptally, pq, pch);
        grp('pmv', () => {
          pm1S = S({ label: 'Multiply Eq 1 by', min: -5, max: 5, step: 1, value: 1, format: mfmt, onInput: v => { cancel(); st.m1 = v; pfb.innerHTML = ''; sync(); } });
          pm2S = S({ label: 'Multiply Eq 2 by', min: -5, max: 5, step: 1, value: 1, format: mfmt, onInput: v => { cancel(); st.m2 = v; pfb.innerHTML = ''; sync(); } });
          pbtns = C.buttons([{ label: 'Add the equations', onClick: () => { pop('add'); } }, { label: 'Subtract (Eq 1 − Eq 2)', onClick: () => { pop('sub'); } }]);
          pcheck = C.buttons([{ label: 'Check my move', primary: true, onClick: () => checkMove() }])[0];
        });
        pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pnext = mkBtn('Next problem', () => nextProb(), true);
        addTo(pfb, h('div', { class: 'ctl buttons' }, pnext));
      });

      const tally = () => { ptally.textContent = `Problem ${prIdx + 1} of ${PROBS.length}. Right on the first try: ${prFirst} of ${prDone} done`; };
      const pop = o => { cancel(); st.op = o; st.rev = 0; pfb.innerHTML = ''; cancel = animateTo(st, { rev: 1 }, 600, sync); sync(); };
      const loadProb = () => {
        const pr = PROBS[prIdx]; prSolved = false; prTried = false; prStage = 0;
        st.m1 = 1; st.m2 = 1; st.op = 'none'; st.rev = 0;
        pq.textContent = pr.q; pfb.innerHTML = ''; pch.replaceChildren(); pnext.disabled = true; pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        if (pr.kind === 'choice') pr.ch.forEach((o, i) => pch.append(mkBtn(o[0], () => pickChoice(i))));
        tally();
      };
      const pickChoice = i => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        const right = i === pr.ans, btn = pch.children[i], txt = pr.ch[i][1];
        if (right) {
          prSolved = true; if (!prTried) prFirst++; prDone++; Array.from(pch.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary');
          pfb.innerHTML = good('Right.') + ' ' + txt; pnext.disabled = false;
        } else { prTried = true; btn.disabled = true; pfb.innerHTML = bad('Not quite.') + ' ' + txt + ' Try another answer.'; }
        tally(); sync();
      };
      const checkMove = () => {
        const pr = PROBS[prIdx], w = work(); if (prStage) return;
        if (st.op === 'none') { pfb.innerHTML = 'Choose Add or Subtract first.'; return; }
        if (w.kind === 'zero') { prTried = true; pfb.innerHTML = bad('Not yet.') + ' A multiplier of 0 turns the equation into 0 = 0 and forgets everything it said. Use a number that is not 0.'; tally(); return; }
        if (w.kind === 'vert' || w.kind === 'horiz') {
          prStage = 1; const kx = w.kind === 'vert', val = kx ? w.R[2] / w.R[0] : w.R[2] / w.R[1];
          pfb.innerHTML = good('Good move.') + ` The new equation is ${eqText(w.R)}, so ${kx ? 'y' : 'x'} canceled and ${kx ? 'x' : 'y'} = ${num(val)}. Now put it back into an original equation to find the other coordinate. What is the solution?`;
          pch.replaceChildren(); pr.fin.forEach((o, i) => pch.append(mkBtn(o[0], () => pickFin(i))));
        } else {
          prTried = true;
          pfb.innerHTML = bad('Not yet.') + ` The new equation is ${eqText(w.R)}. It still has both x and y. The x terms are ${num(w.e1[0])} and ${num(w.e2[0])}. The y terms are ${num(w.e1[1])} and ${num(w.e2[1])}. To cancel, a pair must be opposites (add) or equal (subtract). Change a multiplier or the operation.`;
        }
        tally(); sync();
      };
      const pickFin = i => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        const right = i === pr.ans, btn = pch.children[i], txt = pr.fin[i][1];
        if (right) {
          prSolved = true; if (!prTried) prFirst++; prDone++; Array.from(pch.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary');
          pfb.innerHTML = good('Right.') + ' ' + txt; pnext.disabled = false;
        } else { prTried = true; btn.disabled = true; pfb.innerHTML = bad('Not quite.') + ' ' + txt + ' Try another answer.'; }
        tally(); sync();
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); sync(); return; }
        prOver = true; prStage = 2;
        pq.textContent = 'All seven problems are done.'; pch.replaceChildren(); pnext.disabled = true;
        pfb.innerHTML = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        pch.append(mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; prOver = false; loadProb(); sync(); }, true));
        ptally.textContent = `Right on the first try: ${prFirst} of ${PROBS.length}`; sync();
      };

      /* ----- sync ----- */
      const sync = () => {
        const prac = st.practice, over = prac && prOver;
        vis(G.ex, !prac); vis(G.pred, !prac); vis(G.moves, !prac); vis(G.ro, !prac); vis(G.fin, !prac); vis(G.practice, prac);
        if (prac) vis(G.pmv, !over && PROBS[prIdx].kind === 'move' && prStage === 0);
        m1S.set(st.m1); m2S.set(st.m2); pm1S.set(st.m1); pm2S.set(st.m2);
        [m1S, m2S].forEach(s => { s.inp.disabled = !st.pred; });
        opBtns.forEach((b, i) => { b.disabled = !st.pred; b.classList.toggle('primary', st.op === ['add', 'sub'][i]); });
        pbtns.forEach((b, i) => b.classList.toggle('primary', st.op === ['add', 'sub'][i]));
        oopsT.disabled = !st.pred; oopsT.checked = !!st.oops; fanT.checked = st.fan > .5;
        selEx.value = String(st.cs);
        if (!prac) {
          const f = finInfo();
          finBtns[0].disabled = !f; finBtns[1].disabled = !f; finBtns[2].disabled = !f || f.other === undefined;
          finBtns[0].classList.toggle('primary', st.via === 1); finBtns[1].classList.toggle('primary', st.via === 2);
          fin.innerHTML = finText(); ro.innerHTML = exploreRo();
        }
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        P.draw();
      };

      const FLAGS = ['cs', 'm1', 'm2', 'op', 'oops'];
      const apply = (patch, immediate) => {
        cancel();
        const nums = {};
        st.practice = false;
        for (const k in patch) { if (FLAGS.includes(k)) st[k] = patch[k]; else nums[k] = patch[k]; }
        st.rev = 0; st.pred = false; clearOut(); renderPred();
        if (immediate) { Object.assign(st, nums); sync(); } else { sync(); cancel = animateTo(st, nums, 700, sync); }
      };
      renderPred(); sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
