/* =====================================================================
   SCHOOL — Solving systems with matrices
   ===================================================================== */
{
  /* ---------- numbers and words ---------- */
  const MINUS = '−';
  const sg = v => (v < 0 ? MINUS : '') + Math.abs(v);
  const pt = (a, b) => `(${num(a)}, ${num(b)})`;
  const pn = v => (v < 0 ? `(${num(v)})` : num(v));
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;
  const det = A => A[0][0] * A[1][1] - A[0][1] * A[1][0];
  const mulv = (A, v) => [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]];
  const term = (c, v, first) => {
    if (c === 0) return '';
    const a = Math.abs(c), body = (a === 1 ? '' : a) + v;
    return first ? (c < 0 ? MINUS : '') + body : (c < 0 ? ` ${MINUS} ` : ' + ') + body;
  };
  const lhs = (a, b) => (term(a, 'x', true) + term(b, 'y', a === 0)) || '0';
  const eqS = (A, B, i) => `${lhs(A[i][0], A[i][1])} = ${sg(B[i])}`;
  const FONT = '"Hanken Grotesk","Helvetica Neue",Arial,sans-serif';

  /* a matrix drawn in HTML. cell(i, j) may return extra CSS for one cell */
  const mx = (rows, o = {}) => {
    const body = rows.map((r, i) => '<tr>' + r.map((v, j) => `<td style="padding:2px 8px;text-align:center;border-radius:6px;white-space:nowrap;${o.cell ? o.cell(i, j) || '' : ''}">${v}</td>`).join('') + '</tr>').join('');
    return `<span style="display:inline-block;vertical-align:middle;margin:0 4px;padding:1px 3px;border-left:2px solid var(--blue);border-right:2px solid var(--blue);border-radius:7px"><table style="border-collapse:collapse;display:inline-table;vertical-align:middle;margin:0">${body}</table></span>`;
  };
  const col = (a, b) => mx([[a], [b]]);
  const mat = (A, o) => mx(A.map(r => r.map(sg)), o);
  const hi = k => `background:color-mix(in srgb,var(--${k}) 28%,transparent);`;
  const ch = (t, why, right) => ({ t, why, ok: !!right });

  /* ---------- the systems used by the steps ---------- */
  /* A, B: the system A X = B. vw: [centre x, centre y, span]. X0: where the handle starts */
  const SYS = [
    { A: [[2, 3], [1, 4]], B: [12, 11], vw: [5, 5, 9.5], X0: [0, 0] },
    { A: [[2, 4], [1, 2]], B: [6, 3], vw: [3, 2.5, 7.5], X0: [2, 0] },
    { A: [[2, 4], [1, 2]], B: [6, 4], vw: [3, 2.5, 7.5], X0: [2, 0] }
  ];

  /* ---------- practice problems (a fixed list) ---------- */
  const PROBS = [
    { tag: 'Write the matrix form', A: [[1, 2], [3, -1]], B: [5, 1], vw: [3, 2, 8], X0: [0, 0],
      q: 'A system is <b>x + 2y = 5</b> and <b>3x − y = 1</b>. Which matrix equation is it? (The picture shows its matrix A.)',
      hint: 'Read each equation left to right: the number in front of x, then the number in front of y. Keep the minus sign with its number. The right-hand sides go in the last column, in order.',
      choices: [
        ch(`${mx([[1, 2], [3, 1]])}${col('x', 'y')} = ${col(5, 1)}`, 'The second row should hold 3 and −1. The minus sign in front of y belongs to its coefficient, so it must stay in the matrix.'),
        ch(`${mx([[1, 3], [2, -1].map(sg)])}${col('x', 'y')} = ${col(5, 1)}`, 'This writes the equations down the columns. Each row of A must come from one equation: row 1 is (1, 2) and row 2 is (3, −1).'),
        ch(`${mx([[1, 2], [3, MINUS + '1']])}${col('x', 'y')} = ${col(5, 1)}`, 'Row 1 is (1, 2) and row 2 is (3, −1). Row 1 times the column gives x + 2y = 5 and row 2 gives 3x − y = 1. The right side lists 5 then 1, the same order as the equations.', true),
        ch(`${mx([[1, 2], [3, MINUS + '1']])}${col('x', 'y')} = ${col(1, 5)}`, 'The matrix is right, but the right-hand numbers are swapped. Equation 1 equals 5, so 5 goes on top.')] },
    { tag: 'Solve, whole-number answer', A: [[2, 1], [1, -1]], B: [7, -1], vw: [3, 2, 8], X0: [0, 0],
      q: 'Solve <b>2x + y = 7</b> and <b>x − y = −1</b>. Here det A = 2·(−1) − 1·1 = −3, and the inverse is (1 ÷ −3) times the matrix [−1 −1; −1 2]. Multiply that matrix by B = (7, −1), then divide by −3. What is X = (x, y)?',
      hint: 'Top: (−1)·7 + (−1)·(−1) = −6. Bottom: (−1)·7 + 2·(−1) = −9. Then divide each by −3.',
      choices: [
        ch('(3, 2)', 'The numbers are right but swapped. Put them back: the top entry is x. Check 2·3 + 2 = 8, not 7.'),
        ch('(−6, −9)', 'That is the product before the division. The inverse has the factor 1 ÷ det in front, so divide each entry by −3.'),
        ch('(6, 9)', 'You divided by 3, but det is −3. Dividing by a negative number flips the signs: (−6) ÷ (−3) = 2.'),
        ch('(2, 3)', 'Top: −6 ÷ −3 = 2. Bottom: −9 ÷ −3 = 3. Check: 2·2 + 3 = 7 and 2 − 3 = −1. Both equations hold.', true)] },
    { tag: 'Solve, fraction answer', A: [[4, 1], [2, 3]], B: [4, 7], vw: [3, 3, 8], X0: [0, 0],
      q: 'Solve <b>4x + y = 4</b> and <b>2x + 3y = 7</b>. Here det A = 4·3 − 1·2 = 10 and the inverse is (1 ÷ 10) times [3 −1; −2 4]. Find X = A⁻¹B.',
      hint: 'Top: 3·4 + (−1)·7 = 5. Bottom: (−2)·4 + 4·7 = 20. Divide each by 10 and simplify.',
      choices: [
        ch('(1, 4)', 'The products are 5 and 20, but det is 10, not 5. Divide by 10: 5 ÷ 10 = 1/2.'),
        ch('(5, 20)', 'That is the product before dividing by det. Divide each entry by 10.'),
        ch('(1/2, 2)', 'Top: 5 ÷ 10 = 1/2. Bottom: 20 ÷ 10 = 2. Check: 4·(1/2) + 2 = 4 and 2·(1/2) + 3·2 = 7. The answer is a fraction, and the half-step sliders can reach it.', true),
        ch('(2, 1/2)', 'The values are right but swapped. The top entry is x = 1/2 and the bottom is y = 2. Check 4·2 + 1/2 is not 4.')] },
    { tag: 'Is there an inverse?', A: [[1, 2], [3, 6]], B: [4, 9], vw: [3, 5, 10], X0: [2, 0],
      q: 'The system is <b>x + 2y = 4</b> and <b>3x + 6y = 9</b>, so A = [1 2; 3 6] and B = (4, 9). The picture shows where A can send points. Which statement is true?',
      hint: 'Find det A = 1·6 − 2·3 first. Then drag X: does A X ever reach B = (4, 9)? Notice that A X = (t, 3t) always has second entry 3 times the first.',
      choices: [
        ch('det A = 0 and B is off the line, so there is no solution', 'det A = 1·6 − 2·3 = 0, so the plane is flattened onto the line y = 3x. B = (4, 9) has 3·4 = 12, not 9, so B is off the line. Also, 3x + 6y = 3(x + 2y) = 12 clashes with 9. Parallel lines: no solution.', true),
        ch('det A = 0, so there are infinitely many solutions', 'det 0 does not decide by itself. Infinitely many happens only if B is on the line A can reach. Here B = (4, 9) is not on y = 3x.'),
        ch('det A = 12, so there is exactly one solution', 'You added: 1·6 + 2·3 = 12. The determinant is ad − bc = 6 − 6 = 0.'),
        ch('det A = 0 and B is on the line, so infinitely many solutions', 'Check B: on the line y = 3x, a point with x = 4 has y = 12. B has y = 9, so it is off the line.')] },
    { tag: 'Which case is it?', A: [[2, -4], [-1, 2]], B: [6, -3], vw: [3, 0, 8], X0: [0, 0],
      q: 'The system is <b>2x − 4y = 6</b> and <b>−x + 2y = −3</b>, so A = [2 −4; −1 2] and B = (6, −3). How many solutions are there?',
      hint: 'det A = 2·2 − (−4)(−1) = 0. Then ask: is B on the line A can reach? A X = (2t, −t), where t = x − 2y.',
      choices: [
        ch('No solution', 'No solution needs B off the line A can reach. A X = (2t, −t), and B = (6, −3) is that with t = 3. So B is on the line.'),
        ch('Exactly one, (3, 0)', '(3, 0) is a solution, but so is (1, −1): 2 + 4 = 6 and −1 − 2 = −3. With det 0 you never get exactly one.'),
        ch('Infinitely many', 'det A = 4 − 4 = 0, and B = (6, −3) is on the line A can reach (t = 3). The second equation is −1/2 times the first, so they describe one line: every point on it works.', true),
        ch('Can not tell without an inverse', 'There is no inverse (det is 0), but you can still tell: compare B with the line A can reach.')] },
    { tag: 'A context problem', A: [[3, 1], [1, 2]], B: [5, 5], vw: [3, 3, 8], X0: [0, 0],
      q: 'At the school store, 3 pens and 1 pad cost $5. 1 pen and 2 pads cost $5. Let x be the price of a pen and y the price of a pad. Here A = [3 1; 1 2], B = (5, 5), det A = 5, and A⁻¹ = (1 ÷ 5) times [2 −1; −1 3]. What does one pad cost?',
      hint: 'The pad price is y, the bottom entry of X. Bottom: (−1)·5 + 3·5 = 10, then divide by 5.',
      choices: [
        ch('$1', 'That is the pen price, the top entry: (2·5 − 5) ÷ 5 = 1. A pad is y, the bottom entry.'),
        ch('$10', 'The bottom product is 10, but you must still divide by det = 5.'),
        ch('$2', 'Bottom: ((−1)·5 + 3·5) ÷ 5 = 10 ÷ 5 = 2. Check: 3·1 + 2 = 5 and 1 + 2·2 = 5. A pen is $1 and a pad is $2.', true),
        ch('$5', 'Both receipts total $5, but that is B, not the price of one pad.')] },
    { tag: 'A trap: mind the order', A: [[2, 1], [1, 1]], B: [3, 2], vw: [2, 2, 6], X0: [0, 0],
      q: 'A X = B with A = [2 1; 1 1] and B = (3, 2). Sam writes X = B A⁻¹. Maya writes X = A⁻¹ B. Who is right?',
      hint: 'In A X = B the matrix A stands on the left of X. To remove it, the inverse must also stand on the left. Compare the sizes: B is 2 by 1 and A⁻¹ is 2 by 2.',
      choices: [
        ch('Both, because multiplying in either order gives the same result', 'Matrix multiplication is not commutative. B A⁻¹ would be a 2 by 1 times a 2 by 2: the inner numbers 1 and 2 do not match, so it does not exist.'),
        ch('Sam, because B is written first', 'B comes first on the right side only because of how the equation is written. To cancel A, A⁻¹ must multiply A from the left on both sides.'),
        ch('Neither: you have to divide B by A', 'There is no division of matrices. Multiplying by the inverse plays that role, on the correct side.'),
        ch('Maya. A⁻¹ goes on the left of both sides', 'A⁻¹(A X) = A⁻¹ B gives X = A⁻¹ B. Here A⁻¹ = [1 −1; −1 2] and X = (3 − 2, −3 + 4) = (1, 1). B A⁻¹ is 2 by 1 times 2 by 2, which does not exist.', true)] }
  ];
  /* vary the position of the right answer */
  PROBS.forEach((pb, i) => { const k = pb.choices.findIndex(c => c.ok), [c] = pb.choices.splice(k, 1); pb.choices.splice([2, 3, 0, 3, 2, 1, 3][i], 0, c); });
  const NP = PROBS.length;

  register({
    id: 'solving-systems-with-matrices', level: 'school',
    title: 'Solving systems with matrices',
    blurb: 'Write two equations as one matrix equation, watch the matrix move the plane, then undo it with the inverse to find the answer.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 4.5; p.cy = 4.5; p.span = 8.5;
      p.grid(1, { color: alpha(pal.grid, .8) });
      const A = [[2, 3], [1, 4]], M = (u, v) => [A[0][0] * u + A[0][1] * v, A[1][0] * u + A[1][1] * v];
      for (let k = -4; k <= 4; k++) {
        p.path([M(-9, k), M(9, k)], { stroke: alpha(pal.green, .4), width: 1.3 });
        p.path([M(k, -9), M(k, 9)], { stroke: alpha(pal.red, .4), width: 1.3 });
      }
      p.path([M(0, 0), M(1, 0), M(1, 1), M(0, 1)], { fill: alpha(pal.yellow, .4), stroke: pal.yellow, width: 2, close: true });
      p.arrow(0, 0, 2, 1, pal.green, 3.5); p.arrow(0, 0, 3, 4, pal.red, 3.5);
      p.dot(12, 11, 7, null, pal.yellow, 3); p.dot(3, 2, 6, pal.blue, pal.stage, 2);
      p.path([[3, 2], [12, 11]], { stroke: alpha(pal.muted, .8), width: 2, dash: [5, 5] });
    },
    hook: String.raw`Two receipts show two different totals for sandwiches and drinks. Can one matrix equation find the price of each?`,
    steps: [
      { title: 'Two receipts, one equation',
        text: String.raw`<p>Receipt 1: 2 sandwiches and 3 drinks cost $12. Receipt 2: 1 sandwich and 4 drinks cost $11. Let \(x\) and \(y\) be the two prices. Each receipt is a line on the canvas.</p><p>Pack the numbers into three matrices and write \(AX = B\). Choose each matrix in the panel, then multiply it out.</p>`,
        set: { mode: 'form', view: 'lines', sys: 0 } },
      { title: 'A moves the plane',
        text: String.raw`<p>Think of \(A\) as a machine that moves every point. The system asks: which point \(X\) does \(A\) send to \(B = (12, 11)\)?</p><p>First predict where \(X = (2, 1)\) lands. Then drag \(X\), or use the sliders, until \(AX\) sits on the yellow ring \(B\).</p>`,
        set: { mode: 'map', view: 'map', sys: 0 } },
      { title: 'Undo the machine',
        text: String.raw`<p>To undo \(A\), multiply both sides on the left by \(A^{-1}\): \(A^{-1}AX = A^{-1}B\), so \(X = A^{-1}B\).</p><p>Work it out: the determinant first, then the inverse, then the product. Finally check in the original equations. If the determinant is 0, stop: there is no inverse.</p>`,
        set: { mode: 'inv', view: 'map', sys: 0 } },
      { title: 'When the determinant is 0',
        text: String.raw`<p>If \(\det A = 0\), the plane is squashed flat onto one line, and \(A\) cannot be undone. Then \(B\) is either on that line (many \(X\) work) or off it (none work).</p><p>Predict the collapse, then test one system of each kind.</p>`,
        set: { mode: 'sing', view: 'map', sys: 1 } }
    ],
    formal: String.raw`
      <h3>A system is one matrix equation</h3>
      <p>Take the receipts, \(2x+3y=12\) and \(x+4y=11\). Put the numbers in front of the unknowns in a <b>coefficient matrix</b> \(A\), the unknowns in a column \(X\), and the right-hand sides in a column \(B\):
      \[ \underbrace{\begin{pmatrix} 2 & 3 \\ 1 & 4 \end{pmatrix}}_{A}\underbrace{\begin{pmatrix} x \\ y \end{pmatrix}}_{X} = \underbrace{\begin{pmatrix} 12 \\ 11 \end{pmatrix}}_{B}. \]
      Row 1 of \(A\) times the column \(X\) is \(2x+3y\), and row 2 times \(X\) is \(1x+4y\). Setting these equal to \(12\) and \(11\) gives back the two equations, so \(AX=B\) says exactly the same thing as the system. A coefficient that is not written, as in \(x+4y\), is \(1\). A missing variable has coefficient \(0\).</p>
      <h3>What \(AX=B\) means on the plane</h3>
      <p>Multiplying a point \(X=(x,y)\) by \(A\) gives a new point \(AX\). The first column of \(A\), here \((2,1)\), is where \((1,0)\) goes. The second column, \((3,4)\), is where \((0,1)\) goes. So \(A\) tilts and stretches the whole grid. The unit square becomes a parallelogram whose area is \(|\det A|\). Solving \(AX=B\) means finding the point \(X\) that \(A\) sends to \(B\). For \(X=(2,1)\) we get \(AX=(2\cdot2+3\cdot1,\ 1\cdot2+4\cdot1)=(7,6)\). Searching for the right \(X\) by dragging works, but the inverse finds it exactly.</p>
      <h3>Undo the machine</h3>
      <p>For a \(2\times2\) matrix with \(\det A = ad-bc \neq 0\), the inverse is
      \[ A^{-1} = \frac{1}{ad-bc}\begin{pmatrix} d & -b \\ -c & a \end{pmatrix}. \]
      Swap the two diagonal entries, change the signs of the other two, and divide by the determinant. Here \(\det A = 2\cdot4-3\cdot1 = 5\), so \(A^{-1} = \tfrac15\begin{pmatrix} 4 & -3 \\ -1 & 2 \end{pmatrix}\).</p>
      <p><em>Why we may multiply both sides.</em> Doing the same thing to both sides of an equation keeps it true. Multiply by \(A^{-1}\): \(A^{-1}(AX) = A^{-1}B\). Matrix products can be regrouped, so \((A^{-1}A)X = A^{-1}B\). Since \(A^{-1}A = I\) (the identity, which changes nothing) and \(IX = X\), we get
      \[ X = A^{-1}B. \]
      <b>The order matters.</b> \(A\) stands on the left of \(X\), so \(A^{-1}\) must also go on the left, on both sides. The product \(BA^{-1}\) is a different thing, and here it is not even defined: \(B\) is \(2\times1\) and \(A^{-1}\) is \(2\times2\), and the inner numbers \(1\) and \(2\) do not match.</p>
      <p><em>Worked example.</em>
      \[ X = \frac15\begin{pmatrix} 4 & -3 \\ -1 & 2 \end{pmatrix}\begin{pmatrix} 12 \\ 11 \end{pmatrix} = \frac15\begin{pmatrix} 4\cdot12 - 3\cdot11 \\ -1\cdot12 + 2\cdot11 \end{pmatrix} = \frac15\begin{pmatrix} 15 \\ 10 \end{pmatrix} = \begin{pmatrix} 3 \\ 2 \end{pmatrix}. \]
      A sandwich costs \$3 and a drink costs \$2. Check in the original equations, not in the matrix work: \(2\cdot3+3\cdot2=12\) and \(3+4\cdot2=11\). An answer can be a fraction: if the top entry were \(5\) with \(\det A = 10\), then \(x = \tfrac12\).</p>
      <h3>When \(\det A = 0\)</h3>
      <p>If \(ad-bc=0\), the two columns of \(A\) point along the same line (or one is zero). The parallelogram has area \(0\), so the whole plane is flattened onto one line, and many points land on the same spot. A map that squashes points together cannot be undone, so there is no \(A^{-1}\), and the formula would divide by \(0\). Take \(A=\begin{pmatrix} 2 & 4 \\ 1 & 2 \end{pmatrix}\). Then \(AX = (2t, t)\) with \(t = x+2y\): every output lies on the line \(y=\tfrac12 x\).
      <br>If \(B\) is on that line, for example \(B=(6,3)\), then every \(X\) with \(x+2y=3\) works: infinitely many solutions. On the graph the two lines are the same line.
      <br>If \(B\) is off the line, for example \(B=(6,4)\), no \(X\) works: no solution. The two lines are parallel.
      <br>So \(\det A = 0\) tells you there is not exactly one answer. A second look at \(B\) tells you which of the other two cases it is.</p>
      <h3>Compared with elimination</h3>
      <p>Elimination and the inverse give the same answers; they only organize the bookkeeping differently. Elimination does its work on the equations and \(B\) together, so every new right-hand side means starting again. The inverse does the work on \(A\) alone. Compute \(A^{-1}\) once, and each new \(B\) costs only one multiplication, \(A^{-1}B\). That is why matrices win when many systems share the same \(A\), for example the same prices on many days of receipts. For \(2\times2\) systems by hand, elimination is often quicker. The matrix method is the one computers use, and it works for any number of equations.</p>`,
    check: [
      { q: 'A system has the two equations 2x − y = 5 and 3x + 4y = 1. Which matrix equation is the same system?',
        choices: [
          String.raw`\(\begin{pmatrix} 2 & 1 \\ 3 & 4 \end{pmatrix}\begin{pmatrix} x \\ y \end{pmatrix} = \begin{pmatrix} 5 \\ 1 \end{pmatrix}\)`,
          String.raw`\(\begin{pmatrix} 2 & 3 \\ -1 & 4 \end{pmatrix}\begin{pmatrix} x \\ y \end{pmatrix} = \begin{pmatrix} 5 \\ 1 \end{pmatrix}\)`,
          String.raw`\(\begin{pmatrix} 2 & -1 \\ 3 & 4 \end{pmatrix}\begin{pmatrix} x \\ y \end{pmatrix} = \begin{pmatrix} 5 \\ 1 \end{pmatrix}\)`,
          String.raw`\(\begin{pmatrix} 2 & -1 \\ 3 & 4 \end{pmatrix}\begin{pmatrix} x \\ y \end{pmatrix} = \begin{pmatrix} 1 \\ 5 \end{pmatrix}\)`], answer: 2,
        why: String.raw`Each row of \(A\) comes from one equation: row 1 is \((2,-1)\) and row 2 is \((3,4)\). Row 1 times \(X\) gives \(2x-y\), which must equal \(5\), and row 2 gives \(3x+4y=1\). The first choice dropped the minus sign. The second wrote the equations down the columns instead of across the rows. The last one swapped the right-hand numbers.`,
        hint: String.raw`Write the coefficients of each equation across one row, keeping the minus sign. Then multiply row 1 by the column \((x, y)\) and see if you get the first equation.` },
      { q: 'Solve 3x + 2y = 8 and x + y = 3 with matrices. The coefficient matrix is A = (3 2 over 1 1), the right side is B = (8, 3) as a column, and det A = 3·1 − 2·1 = 1. Use the inverse formula A⁻¹ = (1 ÷ det) times the matrix (d −b over −c a), then compute X = A⁻¹B. What is (x, y)?',
        choices: ['(14, 17)', '(1, 2)', '(18, −5)', '(2, 1)'], answer: 3,
        why: String.raw`Here \(a=3, b=2, c=1, d=1\), so \(A^{-1} = \frac11\begin{pmatrix} 1 & -2 \\ -1 & 3 \end{pmatrix}\). Then \(X = \begin{pmatrix} 1\cdot8-2\cdot3 \\ -1\cdot8+3\cdot3 \end{pmatrix} = \begin{pmatrix} 2 \\ 1 \end{pmatrix}\). Check: \(3\cdot2+2\cdot1=8\) and \(2+1=3\). The answer \((14, 17)\) comes from forgetting to flip the signs of \(b\) and \(c\). The answer \((18,-5)\) comes from not swapping \(a\) and \(d\). The answer \((1,2)\) swaps \(x\) and \(y\).`,
        hint: String.raw`Swap the two diagonal entries (3 and 1), change the signs of 2 and 1, and divide by 1. Then multiply row by row: top is (1)(8) + (−2)(3).` },
      { q: 'A student studies 2x + y = 3 and 4x + 2y = 6, so A = (2 1 over 4 2) and B = (3, 6) as a column. The student writes: "det A = 2·2 − 1·4 = 0, so A has no inverse, so the system has no solution." Which comment is correct?',
        choices: ['The conclusion is wrong. B is on the line that A can reach, so there are infinitely many solutions', 'The conclusion is right. A zero determinant always means no solution', 'The determinant is wrong. A zero determinant would mean infinitely many solutions every time', 'The conclusion is right, because dividing by 0 gives an answer that does not exist'], answer: 0,
        why: String.raw`The determinant \(0\) is right, and it does mean no inverse, so the inverse method cannot be used. But it does not say which of the other two cases occurs. Here \(AX = (2x+y,\ 2(2x+y))\), and \(B=(3,6)\) has this form with \(2x+y=3\). So \(B\) is on the line, and the second equation is just twice the first: infinitely many solutions. A zero determinant gives either no solution or infinitely many, depending on \(B\).`,
        hint: String.raw`Compare the two equations. Is the second one a multiple of the first one? If both describe the same line, how many points are on it?` }
    ],
    links: { prereq: ['determinants-and-inverse-matrices', 'solving-systems-by-elimination'], next: ['cramers-rule'], related: ['matrices', 'systems-of-equations', 'solving-systems-by-substitution', 'systems-of-three-equations', 'linear-transformations'] },

    mount({ stage, controls: C }) {
      const P = new Plane(stage, { cx: 5, cy: 5, span: 9.5 }), cv = P.canvas;
      if (P.coordEl) P.coordEl.style.display = 'none';
      cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', 'A coordinate plane. In map view the grid is tilted by the matrix A, a yellow ring marks the target point B, and a movable point X has its image A X drawn beside it. In lines view the two equations of the system are drawn as lines. The panel beside the canvas reads out every number and has sliders for X.');

      /* ---------- state ---------- */
      const st = {
        mode: 'form', view: 'lines', A: SYS[0].A, B: SYS[0].B, vw: SYS[0].vw, t: 1, x: 0, y: 0,
        reveal: true, showDet: false, showSol: false, back: false,
        fm: { x: false, r1: false, r2: false, b: false, row: null, seen: [false, false] },
        pi: 0, pRight: 0, pDone: 0
      };
      let cancel = () => {};
      const ST = () => ({ det: det(st.A), AX: mulv(st.A, [st.x, st.y]) });
      const matched = () => { const { AX } = ST(); return Math.abs(AX[0] - st.B[0]) < 1e-9 && Math.abs(AX[1] - st.B[1]) < 1e-9; };
      const kindOf = (A, B) => {
        const d = det(A);
        if (d !== 0) return { k: 'one', x: (A[1][1] * B[0] - A[0][1] * B[1]) / d, y: (A[0][0] * B[1] - A[1][0] * B[0]) / d };
        const u = A[0][0] !== 0 || A[1][0] !== 0 ? [A[0][0], A[1][0]] : [A[0][1], A[1][1]];
        return { k: u[0] * B[1] - u[1] * B[0] === 0 ? 'many' : 'none', u };
      };
      const setSys = (A, B, vw, X0) => { st.A = A; st.B = B; st.vw = vw; st.x = X0[0]; st.y = X0[1]; };

      /* ---------- drawing ---------- */
      const lineSeg = (A, B, i, bd) => {
        const a = A[i][0], b = A[i][1], e = B[i];
        if (a === 0 && b === 0) return null;
        const pad = 2;
        if (b !== 0) return [[bd.x0 - pad, (e - a * (bd.x0 - pad)) / b], [bd.x1 + pad, (e - a * (bd.x1 + pad)) / b]];
        return [[e / a, bd.y0 - pad], [e / a, bd.y1 + pad]];
      };
      const lineLabel = (A, B, i, bd, order) => {
        const a = A[i][0], b = A[i][1], e = B[i], w = bd.x1 - bd.x0, hh = bd.y1 - bd.y0;
        for (const f of order) {
          if (b !== 0) {
            const x = bd.x0 + w * f, y = (e - a * x) / b;
            if (y > bd.y0 + hh * .12 && y < bd.y1 - hh * .12) return [x, y];
          } else { const y = bd.y0 + hh * f; return [e / a, y]; }
        }
        return null;
      };
      P.onDraw = (c, p) => {
        const pal = p.pal, [vcx, vcy, vsp] = st.vw; p.cx = vcx; p.cy = vcy; p.span = vsp;
        const bd = p.bounds(), fs = clamp(p.scale * .8, 17, 21), { det: dt, AX } = ST(), A = st.A, B = st.B;
        const dim = st.view === 'map' && st.reveal && st.t > .02;
        p.grid(1, { color: dim ? alpha(pal.grid, .55) : undefined }); p.ticks(1, { size: clamp(p.scale * .72, 14, 17) });
        const kd = kindOf(A, B);
        if (st.view === 'lines') {
          const same = kd.k === 'many';
          [[0, pal.blue], [1, pal.red]].forEach(([i, k]) => {
            const s = lineSeg(A, B, i, bd); if (!s) return;
            p.path(s, { stroke: k, width: i && same ? 3 : 4, dash: i && same ? [12, 10] : undefined });
          });
          [[0, pal.blue, [.78, .55, .9, .35]], [1, pal.red, [.3, .5, .15, .7]]].forEach(([i, k, ord]) => {
            const lp = lineLabel(A, B, i, bd, ord); if (lp) p.label(`${eqS(A, B, i)}`, lp[0], lp[1], { size: fs, color: k, italic: false, dy: i ? 18 : -18 });
          });
          if (kd.k === 'one' && (st.showSol || st.mode === 'form')) {
            p.dot(kd.x, kd.y, 9, pal.violet, pal.stage, 2.5);
            p.label(`${pt(kd.x, kd.y)}`, kd.x, kd.y, { size: fs, color: pal.violet, italic: false, dy: -22 });
          }
          if (st.mode !== 'form') {
            const mt = matched();
            p.dot(st.x, st.y, 10, pal.stage, pal.brass, 3.2);
            p.dot(st.x, st.y, 3.5, mt ? pal.green : pal.text);
            p.label(`X ${pt(st.x, st.y)}`, st.x, st.y, { size: fs, color: pal.text, italic: false, dy: 24 });
          }
          return;
        }
        /* map view */
        const t = st.reveal ? st.t : 0, m00 = 1 + (A[0][0] - 1) * t, m01 = A[0][1] * t, m10 = A[1][0] * t, m11 = 1 + (A[1][1] - 1) * t;
        const M = (u, v) => [m00 * u + m01 * v, m10 * u + m11 * v];
        if (st.reveal && t > .02) {
          for (let k = -14; k <= 14; k++) {
            p.path([M(-40, k), M(40, k)], { stroke: alpha(pal.green, .26), width: 1.4 });
            p.path([M(k, -40), M(k, 40)], { stroke: alpha(pal.red, .26), width: 1.4 });
          }
          if (t > .98 && dt === 0 && kd.u) {
            const L = 40, n = Math.hypot(kd.u[0], kd.u[1]), d0 = [kd.u[0] / n, kd.u[1] / n];
            p.path([[-L * d0[0], -L * d0[1]], [L * d0[0], L * d0[1]]], { stroke: pal.violet, width: 5 });
          }
          p.path([M(0, 0), M(1, 0), M(1, 1), M(0, 1)], { fill: alpha(pal.yellow, .38), stroke: pal.yellow, width: 2, close: true });
          const e1 = M(1, 0), e2 = M(0, 1);
          p.arrow(0, 0, e1[0], e1[1], pal.green, 4); p.arrow(0, 0, e2[0], e2[1], pal.red, 4);
          if (t > .98 && dt !== 0) {
            if (Math.hypot(e1[0] - st.x, e1[1] - st.y) > 1) p.label(pt(e1[0], e1[1]), e1[0], e1[1], { size: fs, color: pal.green, italic: false, dx: 12, dy: 18, align: 'left' });
            if (Math.hypot(e2[0] - st.x, e2[1] - st.y) > 1) p.label(pt(e2[0], e2[1]), e2[0], e2[1], { size: fs, color: pal.red, italic: false, dx: -10, dy: -16, align: 'right' });
          }
        }
        /* target B */
        const mt = matched() && st.reveal;
        p.dot(B[0], B[1], 15, alpha(pal.yellow, .22), pal.yellow, 3.5);
        if (!mt) p.label(`B ${pt(B[0], B[1])}`, B[0], B[1], { size: fs, color: pal.yellow, italic: false, dy: -26 });
        /* X, A X */
        const im = M(st.x, st.y);
        if (st.reveal) {
          p.path([[st.x, st.y], im], { stroke: alpha(pal.muted, .9), width: 2, dash: [3, 6] });
          p.dot(im[0], im[1], 8.5, mt ? pal.green : pal.blue, pal.stage, 2.5);
          p.label(mt ? 'A X = B' : `A X ${pt(im[0], im[1])}`, im[0], im[1], { size: fs, color: mt ? pal.green : pal.blue, italic: false, dy: mt ? 30 : -22 });
        }
        if (st.back) {
          const xs = kd.x, ys = kd.y;
          p.arrow(B[0], B[1], xs, ys, alpha(pal.violet, .95), 3);
          const mx_ = (B[0] + xs) / 2, my_ = (B[1] + ys) / 2;
          p.label('A⁻¹ undoes A', mx_, my_, { size: fs, color: pal.violet, italic: false, dx: 14, dy: 12, align: 'left' });
        }
        p.dot(st.x, st.y, 11, pal.stage, pal.brass, 3.2);
        p.dot(st.x, st.y, 4, mt ? pal.green : pal.text);
        p.label(`X ${pt(st.x, st.y)}`, st.x, st.y, { size: fs, color: pal.text, italic: false, dy: 26 });
      };

      /* ---------- panel scaffolding ---------- */
      const ro = C.readout(), host = ro.parentNode;
      host.removeChild(ro);
      const grp = build => {
        const i = host.children.length; build();
        const w = h('div', { style: 'display:flex;flex-direction:column;gap:14px' });
        [...host.children].slice(i).forEach(e => w.append(e)); host.append(w); return w;
      };
      const show = (e, on) => { e.style.display = on ? '' : 'none'; };
      let xS, yS, viewB;
      const gXY = grp(() => {
        C.title('The picture');
        viewB = C.buttons([{ label: 'Map view', onClick: () => { st.view = 'map'; sync(); } }, { label: 'Two-lines view', onClick: () => { st.view = 'lines'; sync(); } }]);
        xS = C.slider({ label: 'X, first entry (x)', min: -4, max: 10, step: .5, value: 0, format: v => num(v), onInput: v => { cancel(); st.x = v; sync(); } });
        yS = C.slider({ label: 'X, second entry (y)', min: -4, max: 10, step: .5, value: 0, format: v => num(v), onInput: v => { cancel(); st.y = v; sync(); } });
      });
      viewB[0].parentNode.style.marginTop = '8px';
      host.append(ro);

      /* ---------- the question machinery (one instance for the steps, one for practice) ---------- */
      const makeQuiz = parent => {
        const askE = h('div', { class: 'ctl readout', style: 'border-top:0;padding-top:0' });
        const workE = h('div', { style: 'overflow-x:auto' });
        const chE = h('div', { style: 'display:flex;flex-direction:column;gap:8px' });
        const fbE = h('div', { class: 'ctl readout', 'aria-live': 'polite', style: 'border-top:0;padding-top:0' });
        const btnE = h('div', { class: 'ctl buttons' });
        parent.append(askE, workE, chE, fbE, btnE);
        const Q = { q: null, solved: false, wrong: new Set(), tries: 0, info: {}, fb: '', hint: false };
        const render = () => {
          const q = Q.q; if (!q) return;
          askE.innerHTML = (Q.info.status ? kk(Q.info.status) + '<br>' : '') + q.ask;
          workE.innerHTML = q.work ? q.work() : '';
          chE.innerHTML = '';
          const gate = !q.gate || q.gate();
          (q.choices || []).forEach((c, i) => {
            const good = Q.solved && c.ok, bad = Q.wrong.has(i);
            const b = h('button', { type: 'button', class: 'btn', style: `justify-content:flex-start;text-align:left;border-radius:10px;padding:9px 14px;width:100%;min-height:44px;line-height:1.4;white-space:normal;height:auto;${good ? 'border-color:var(--green);' : ''}${bad ? 'border-color:var(--red);color:var(--muted);' : ''}${Q.solved && !good ? 'opacity:.55;pointer-events:none;' : ''}` });
            b.innerHTML = (good ? '✓  ' : bad ? '✗  ' : '') + c.t;
            if (!gate || bad || Q.solved) b.disabled = true;
            b.addEventListener('click', () => pick(i)); chE.append(b);
          });
          let note = Q.fb;
          if (!gate && !Q.solved) note = `<span class="k">Locked.</span> ${q.gateMsg || 'Move X first.'}` + (Q.fb ? '<br>' + Q.fb : '');
          fbE.innerHTML = note;
          btnE.innerHTML = '';
          if (Q.info.hint && q.hint && !Q.solved) btnE.append(h('button', { type: 'button', class: 'btn', onclick: () => { Q.fb = `${kk('Hint')} ${q.hint}`; render(); } }, 'Hint'));
          if (Q.solved && Q.info.next) btnE.append(h('button', { type: 'button', class: 'btn primary', onclick: Q.info.next }, Q.info.nextLabel || 'Next question'));
        };
        workE.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b && Q.q && Q.q.act) { Q.q.act(b.dataset.act); render(); } });
        const finish = () => { Q.solved = true; if (Q.q.onRight) Q.q.onRight(Q.tries === 1); };
        const pick = i => {
          const q = Q.q; if (!q || Q.solved || Q.wrong.has(i) || (q.gate && !q.gate())) return;
          const c = q.choices[i]; Q.tries++;
          if (c.ok) { Q.fb = ok('Yes. ') + c.why + (Q.info.end ? ' ' + Q.info.end : ''); finish(); }
          else { Q.wrong.add(i); Q.fb = no('Not quite. ') + c.why + ' Try another choice.'; }
          render(); sync();
        };
        return {
          load(q, info) { Q.q = q; Q.solved = false; Q.wrong = new Set(); Q.tries = 0; Q.info = info || {}; Q.fb = q.fb0 || ''; if (q.enter) q.enter(); render(); },
          render, state: Q,
          autoSolve(msg) { Q.solved = true; Q.fb = msg; render(); }
        };
      };

      /* ---------- the step tasks ---------- */
      const gTask = grp(() => { C.title('Your turn'); });
      const quiz = makeQuiz(gTask);
      const fm = st.fm;
      const formWork = () => {
        const S = SYS[0], a = S.A, b = S.B, sl = (kn, s) => kn ? s : '<span style="opacity:.5">?</span>';
        const rowHi = i => fm.row === i;
        const Ah = mx([[sl(fm.r1, sg(a[0][0])), sl(fm.r1, sg(a[0][1]))], [sl(fm.r2, sg(a[1][0])), sl(fm.r2, sg(a[1][1]))]], { cell: (i) => rowHi(i) ? hi('green') : '' });
        const Xh = mx([[sl(fm.x, 'x')], [sl(fm.x, 'y')]], { cell: () => fm.row !== null ? hi('red') : '' });
        const Bh = mx([[sl(fm.b, sg(b[0]))], [sl(fm.b, sg(b[1]))]], { cell: i => rowHi(i) ? hi('yellow') : '' });
        let html = `<div style="display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:2px;font-size:1.08rem;margin:4px 0 10px"><b style="margin-right:2px">A</b>${Ah}<b>X</b>${Xh}<b style="margin:0 4px">=</b><b>B</b>${Bh}</div>`;
        if (fm.row !== null) {
          const i = fm.row;
          html += `<div class="ctl readout" style="border-top:0;padding-top:0">${kk('Row ' + (i + 1) + ' of A times the column X')}<br><span style="color:var(--green);font-weight:700">${sg(a[i][0])}</span>·x + <span style="color:var(--green);font-weight:700">${sg(a[i][1])}</span>·y, the left side of receipt ${i + 1}.<br>Row ${i + 1} of B is ${sg(b[i])}, so this row says <b>${eqS(a, b, i)}</b>.</div>`;
        }
        return html;
      };
      const formBtns = () => `<div class="ctl buttons" style="margin-top:6px"><button type="button" class="btn${fm.row === 0 ? ' primary' : ''}" data-act="0">Row 1</button><button type="button" class="btn${fm.row === 1 ? ' primary' : ''}" data-act="1">Row 2</button></div>`;
      const TASKS = {
        form: [
          { ask: 'The system is <b>2x + 3y = 12</b> and <b>x + 4y = 11</b>. Start with the unknown column X. What does it hold?', work: formWork,
            choices: [ch('x over y, the two prices we do not know yet', 'X holds the unknowns, in the order x then y. Row times column will then pair each coefficient with its own unknown.', true),
              ch('12 over 11, the two totals', 'Those numbers are known. They go on the right side of the equals sign, in the column B.'),
              ch('2 over 3, the numbers in front of x and y in equation 1', 'Those are coefficients, and they are known. They go in the matrix A.'),
              ch('3 over 2, the prices', 'The prices are what we are looking for, so we cannot write them yet. X holds the letters x and y.')],
            onRight: () => { fm.x = true; } },
          { ask: 'Now row 1 of A. Equation 1 is <b>2x + 3y = 12</b>. Which numbers go in row 1?', work: formWork,
            choices: [ch('2 and 12', '12 is the total on the right of the equals sign. It goes in B. A holds only the numbers in front of x and y.'),
              ch('3 and 2', 'The order is swapped. Row 1 times the column (x, y) pairs the first entry with x, so the first entry must be the number in front of x.'),
              ch('2 and 3', 'The number in front of x is 2 and the number in front of y is 3. Row 1 times (x, y) gives 2x + 3y.', true),
              ch('2 and 1', 'The 2 and 1 are the x-coefficients of both equations, down a column. A row comes from one equation, read across.')],
            onRight: () => { fm.r1 = true; } },
          { ask: 'Row 2 comes from equation 2: <b>x + 4y = 11</b>. Which numbers go in row 2? (There is no number written in front of x.)', work: formWork,
            choices: [ch('0 and 4', 'x is not missing. A plain x means 1x, so the coefficient is 1. A 0 would mean there is no x term at all.'),
              ch('4 and 1', 'The order is swapped. The first entry goes with x, and that coefficient is 1.'),
              ch('1 and 11', '11 is the total. It goes in B.'),
              ch('1 and 4', 'A plain x means 1x. Row 2 times (x, y) gives 1x + 4y, which is x + 4y.', true)],
            onRight: () => { fm.r2 = true; } },
          { ask: 'Last, the column B. It holds the right-hand sides, top to bottom in the order of the equations. Which column?', work: formWork,
            choices: [ch('11 over 12', 'The order is swapped. Equation 1 equals 12, so 12 goes in row 1 of B.'),
              ch('12 over 11', 'Row 1 of B is 12 (equation 1) and row 2 is 11 (equation 2). So A X = B reads: 2x + 3y = 12 and 1x + 4y = 11.', true),
              ch('3 over 4', 'Those are the y-coefficients, which are in A. B holds the totals.'),
              ch('5 over 5', 'You added the coefficients on each row (2 + 3 and 1 + 4). B holds the totals 12 and 11 as written.')],
            onRight: () => { fm.b = true; } },
          { ask: 'Multiply it out. Tap a row to see row times column rebuild its equation. Look at both rows, then answer.', work: () => formWork() + formBtns(),
            act: i => { fm.row = +i; fm.seen[+i] = true; },
            choices: [ch('Row 1 gives 2x + 3y and row 2 gives x + 4y, so A X = B is the two receipts', 'Each row of A times the column X is one left side. Matching it with the same row of B gives the two original equations. Nothing was lost by writing them as one matrix equation.', true),
              ch('A X multiplies A and X entry by entry: 2x and 4y', 'Matrix multiplication pairs a whole row with the column and adds: 2·x + 3·y. It is not entry by entry.'),
              ch('A X = B is a new problem that is different from the two receipts', 'It is the same problem. Row 1 times X is 2x + 3y = 12 and row 2 times X is x + 4y = 11.')],
            gate: () => fm.seen[0] && fm.seen[1], gateMsg: 'Tap Row 1 and Row 2 above to see each equation rebuilt.',
            onRight: () => { fm.row = null; } }
        ],
        map: [
          { ask: `${kk('Predict first')}<br>The point X = (2, 1) is marked. A = [2 3; 1 4]. Where will A send it? Pick the point you expect, then the map moves to show you.`,
            enter: () => { st.reveal = false; st.t = 0; },
            choices: [ch('(5, 10)', 'That uses the columns of A as if they were rows. Row 1 of A is (2, 3), so the first entry is 2·2 + 3·1 = 7.'),
              ch('(7, 6)', 'First entry: row 1 times X = 2·2 + 3·1 = 7. Second entry: row 2 times X = 1·2 + 4·1 = 6. A sends (2, 1) to (7, 6).', true),
              ch('(8, 9)', 'That is A(1, 2): x and y swapped. X = (2, 1) means x = 2 and y = 1.'),
              ch('(4, 4)', 'That multiplies only 2·2 and 4·1. Every entry of a row takes part: 2·2 + 3·1 and 1·2 + 4·1.')],
            onRight: () => { st.reveal = true; st.t = 0; cancel(); cancel = animateTo(st, { t: 1 }, 1000, sync); } },
          { ask: 'Now drag X (or use the sliders) until A X sits on the yellow ring B = (12, 11). Then pick the X you found. The choices unlock when A X is on B.',
            gate: () => matched(), gateMsg: 'Move X until the blue A X dot lands on the yellow ring and turns green.',
            choices: [ch('(2, 3)', 'Check it: A(2, 3) = (2·2 + 3·3, 1·2 + 4·3) = (13, 14). That is not B.'),
              ch('(12, 11)', 'That is B itself. X is the input that A sends to B.'),
              ch('(3, 2)', 'A(3, 2) = (2·3 + 3·2, 1·3 + 4·2) = (12, 11) = B. So X = (3, 2) solves the system: a sandwich costs $3 and a drink $2.', true),
              ch('(5, 4)', 'A(5, 4) = (2·5 + 3·4, 5 + 16) = (22, 21). That is far past B.')],
            onRight: () => { st.showSol = true; } }
        ],
        inv: [
          { ask: `${kk('Predict first')}<br>The map shows A tilting and stretching the grid. The yellow parallelogram still has area. Before computing anything: does A have an inverse?`,
            choices: [ch('No. A moves points, so nothing can undo it', 'A rotation or a stretch can be undone by moving the points back. A map has an inverse when it does not squash different points onto the same point.'),
              ch('Yes. The grid is tilted but not flattened, so every point can be sent back', 'The columns point in different directions and the yellow parallelogram has area. Different points go to different places, so A can be undone. The determinant will confirm it.', true),
              ch('Only if the entries of A are all positive', 'The signs of the entries do not matter. What matters is whether the plane gets flattened, which the determinant measures.')],
            onRight: () => {} },
          { ask: 'Step 1: the determinant. For A = [a b; c d] it is ad − bc, the area of the yellow parallelogram. Here a = 2, b = 3, c = 1, d = 4. What is det A?',
            choices: [ch('11', 'That adds the two products: 2·4 + 3·1 = 11. The determinant subtracts: ad − bc.'),
              ch('−5', 'The order is reversed: that is bc − ad. The determinant is ad − bc = 8 − 3.'),
              ch('5', 'det A = 2·4 − 3·1 = 8 − 3 = 5. It is not 0, so A has an inverse. The yellow parallelogram has area 5.', true),
              ch('8', 'That is only ad. You still subtract bc = 3·1.')],
            onRight: () => { st.showDet = true; } },
          { ask: 'Step 2: the inverse. Recall the formula: A⁻¹ = (1 ÷ det) times [d −b; −c a]. Swap the diagonal entries, change the signs of the other two. Which matrix goes inside, before the factor 1/5?',
            work: () => `<div style="text-align:center;margin:2px 0 8px">${kk('A')} ${mat([[2, 3], [1, 4]])} ${kk('inside of A⁻¹ = ?')}</div>`,
            choices: [ch(mx([[2, MINUS + '3'], [MINUS + '1', 4]]), 'The diagonal entries are not swapped. Swap a = 2 and d = 4: the top left must be 4 and the bottom right must be 2.'),
              ch(mx([[4, 3], [1, 2]]), 'You swapped the diagonal but did not change the signs of the other two. They must become −3 and −1.'),
              ch(mx([[4, MINUS + '3'], [MINUS + '1', 2]]), 'Swap 2 and 4 on the diagonal, and flip the signs of 3 and 1. Test it: row 1 of A times column 1 of this matrix is 2·4 + 3·(−1) = 5, the determinant. Multiplying the two matrices gives 5 times the identity, so dividing by 5 makes the identity.', true),
              ch(mx([[4, MINUS + '1'], [MINUS + '3', 2]]), 'The off-diagonal entries are in the wrong places. You moved 3 and 1 to each other\'s spots. The formula keeps them where they are and only flips their signs.')] }
        ],
        sing: []
      };
      /* the rest of the inverse tasks are built next so the long text stays readable */
      const invMat = mx([[4, MINUS + '3'], [MINUS + '1', 2]]);
      const invWork = () => `<div style="text-align:center;margin:2px 0 8px"><b>X</b> = (1/5) ${invMat} ${col(12, 11)}</div>`;
      TASKS.inv.push(
        { ask: 'Step 3a: multiply. The top entry of the product is row 1 of [4 −3; −1 2] times the column (12, 11). What is 4·12 + (−3)·11?', work: invWork,
          choices: [ch('81', 'That treats −3 as 3: 48 + 33 = 81. The entry is −3, so 4·12 + (−3)·11 = 48 − 33.'),
            ch('−15', 'You subtracted in the wrong order. 48 − 33 = 15, not 33 − 48.'),
            ch('24', 'You added all the numbers (4 + (−3) + 12 + 11). A row times a column pairs the entries first: 4 with 12 and −3 with 11.'),
            ch('15', '4·12 + (−3)·11 = 48 − 33 = 15.', true)] },
        { ask: 'Step 3b: the bottom entry. Row 2 is (−1, 2). What is (−1)·12 + 2·11?', work: invWork,
          choices: [ch('34', 'That uses +1 instead of −1: 12 + 22 = 34. The entry is −1, so (−1)·12 = −12.'),
            ch('−10', 'You subtracted in the wrong order. (−12) + 22 = 10.'),
            ch('10', '(−1)·12 + 2·11 = −12 + 22 = 10.', true),
            ch('−34', 'You made both products negative. 2·11 is +22, so the sum is −12 + 22.')] },
        { ask: 'Step 3c: divide. The product is (15, 10) and the factor in front is 1/5. So X = (1/5)(15, 10). What is X?', work: invWork,
          choices: [ch('(15, 10)', 'You left out the factor 1/5 in front of the matrix. It is part of the inverse and every entry must be divided by 5.'),
            ch('(75, 50)', 'The factor is 1/5, which divides. Multiplying by 5 goes the wrong way.'),
            ch('(2, 3)', 'The values are swapped: the top entry is x = 15 ÷ 5 = 3 and the bottom is y = 10 ÷ 5 = 2.'),
            ch('(3, 2)', 'x = 15 ÷ 5 = 3 and y = 10 ÷ 5 = 2. Watch the map: X moves to (3, 2) and A X lands on B. A⁻¹ takes B back to X.', true)],
          onRight: () => { st.back = true; cancel(); cancel = animateTo(st, { x: 3, y: 2 }, 1000, sync); } },
        { ask: 'Step 4: check in the <b>original</b> equations, 2x + 3y = 12 and x + 4y = 11, with x = 3 and y = 2. What do the left sides come to?',
          choices: [ch('5 and 5', 'You added the numbers without the coefficients (3 + 2). The first left side is 2·3 + 3·2.'),
            ch('12 and 11, matching both right sides', '2·3 + 3·2 = 12 and 3 + 4·2 = 11. Both equations hold. Checking in the original equations catches arithmetic slips made anywhere in the matrix work.', true),
            ch('12 and 7', 'The second is x + 4y = 3 + 4·2 = 11. You used 4 instead of 4·2.'),
            ch('11 and 12', 'The left sides are in the other order. 2·3 + 3·2 = 12 and 3 + 4·2 = 11.')],
          onRight: () => { st.showSol = true; } }
      );
      TASKS.sing.push(
        { ask: `${kk('Predict first')}<br>Here A = [2 4; 1 2]. Its columns are (2, 1) and (4, 2). Before the map moves: what will A do to the plane?`,
          enter: () => { setSys(SYS[1].A, SYS[1].B, SYS[1].vw, SYS[1].X0); st.reveal = false; st.t = 0; st.showDet = false; st.showSol = false; st.back = false; cancel(); },
          choices: [ch('Turn it, keeping its shape', 'A turn keeps the grid squares. The columns (2, 1) and (4, 2) are not even perpendicular.'),
            ch('Stretch it evenly in every direction', 'An even stretch would make both columns longer along the original axes. Here the second column (4, 2) is exactly twice the first (2, 1): they point the same way.'),
            ch('Squash all of it onto one line', 'The two columns point the same way, since (4, 2) = 2·(2, 1). So the two grid directions land on one line, and the whole plane is flattened onto it. det A = 2·2 − 4·1 = 0.', true),
            ch('Flip it over', 'A flip keeps the area. The columns are along one line, so the area is 0.')],
          onRight: () => { st.reveal = true; st.showDet = true; st.t = 0; cancel(); cancel = animateTo(st, { t: 1 }, 1100, sync); } },
        { ask: 'Case 1: <b>2x + 4y = 6</b> and <b>x + 2y = 3</b>, so B = (6, 3). Drag X: A X slides along the violet line but never leaves it. Is B on that line? Move X until A X sits on B, then answer. How many solutions?',
          enter: () => { setSys(SYS[1].A, SYS[1].B, SYS[1].vw, SYS[1].X0); st.reveal = true; st.t = 1; st.showSol = false; st.showDet = true; },
          gate: () => matched(), gateMsg: 'Move X until A X reaches the yellow ring B on the violet line.',
          choices: [ch('Exactly one', 'You found one X, but try another: X = (1, 1) and X = (3, 0) both land on B. With det 0 you never get exactly one.'),
            ch('Infinitely many', 'B is on the violet line, and A sends a whole line of points X (all with x + 2y = 3) to the single point B. In Two-lines view the second equation is half of the first, so both are the same line and every point on it is a solution.', true),
            ch('None', 'You just made A X land on B, so there is at least one solution.'),
            ch('Exactly two', 'If X = (3, 0) and X = (1, 1) both work, so does everything on the line between them. It is not two, it is infinitely many.')],
          onRight: () => { st.showSol = true; } },
        { ask: 'Case 2: <b>2x + 4y = 6</b> and <b>x + 2y = 4</b>, so B = (6, 4). The matrix is the same, but B has moved. Drag X around. Can A X ever reach B?',
          enter: () => { setSys(SYS[2].A, SYS[2].B, SYS[2].vw, SYS[2].X0); st.reveal = true; st.t = 1; st.showDet = true; st.showSol = false; },
          choices: [ch('Yes, with a large enough X', 'A X always lies on the violet line y = x/2, however large X is. B = (6, 4) has y = 4, but the line at x = 6 is at y = 3. It is off the line.'),
            ch('No. A X stays on the line and B is off it, so there is no solution', 'Every A X is on the violet line, and B is not on it. In Two-lines view the lines are parallel: 2x + 4y = 6 and 2x + 4y = 8 can not both hold.', true),
            ch('Yes, exactly one X', 'With det 0 there is never exactly one. Here B is off the line, so there is none at all.'),
            ch('Yes, only X = (6, 4)', 'A(6, 4) = (2·6 + 4·4, 6 + 8) = (28, 14). That is on the line, but nowhere near B.')],
          onRight: () => { st.showSol = true; } },
        { ask: 'Compare with elimination on Case 2. Double equation 2 (x + 2y = 4) to get 2x + 4y = 8, then subtract equation 1 (2x + 4y = 6). What do you get, and what does it tell you?',
          choices: [ch('0 = 0, so there are infinitely many solutions', '0 = 0 would be the Case 1 result (B on the line). Here 8 − 6 = 2.'),
            ch('x = 2, so there is one solution', 'Both x and y cancelled, so nothing is left to solve for. That is the sign of det = 0.'),
            ch('0 = 2, which is impossible, so there is no solution', 'Both unknowns cancel and the leftover 0 = 2 is false. Elimination reached the same answer as the matrix picture (B off the line), only by different bookkeeping.', true)] },
        { ask: 'A shop uses the same prices every day but has a new pair of receipts each day (a new B, the same A). For 30 days, which method saves the most work?',
          choices: [ch('Eliminate from scratch each day, because the totals change the work', 'You can do that, and it works. But it repeats all the elimination steps 30 times.'),
            ch('Find A⁻¹ once, then compute A⁻¹B for each day', 'A⁻¹ depends only on A, so it is found once. Each new day costs one matrix times a column. That is the advantage of matrices when many systems share the same A.', true),
            ch('Matrices can not be used, because B changes', 'A⁻¹ does not depend on B, so a new B changes nothing about the inverse. It is reused as it is.')],
          fb0: '' }
      );
      const loadTask = i => {
        const m = st.mode, list = TASKS[m], q = list[i], last = i + 1 === list.length;
        quiz.load(q, { status: `Question ${i + 1} of ${list.length}`, next: last ? null : () => loadTask(i + 1), end: last ? 'That is all the questions here. Use Next above for the next step, or try the practice problems below.' : '' });
        sync();
      };

      /* ---------- readout ---------- */
      const upd = () => {
        const A = st.A, B = st.B, { det: dt, AX } = ST(), m = st.mode;
        if (m === 'form') {
          ro.innerHTML = `${kk('Receipt 1')} 2 sandwiches + 3 drinks = $12<br>${kk('Receipt 2')} 1 sandwich + 4 drinks = $11<br>${kk('Unknowns')} x = price of a sandwich, y = price of a drink<br>${kk('Where the lines cross')} one point on both receipts`;
          return;
        }
        const live = !st.reveal ? `${kk('X')} ${pt(st.x, st.y)}<br>${kk('B')} ${pt(B[0], B[1])}<br>A X is hidden until you predict.`
          : `${kk('X')} ${pt(st.x, st.y)}<br>${kk('A X')} (${A[0][0]}·${pn(st.x)} + ${A[0][1]}·${pn(st.y)}, ${A[1][0]}·${pn(st.x)} + ${A[1][1]}·${pn(st.y)}) = <b>${pt(AX[0], AX[1])}</b><br>${kk('B')} ${pt(B[0], B[1])}<br>` +
            (matched() ? `${ok('A X = B.')} This X solves the system.` : `${kk('Gap')} B − A X = ${pt(B[0] - AX[0], B[1] - AX[1])}`);
        ro.innerHTML = live + (st.showDet && st.reveal ? `<br>${kk('det A')} ${A[0][0]}·${pn(A[1][1])} − ${pn(A[0][1])}·${pn(A[1][0])} = <b>${num(dt)}</b>${dt === 0 ? ' (no inverse)' : ''}` : '');
      };

      const sync = () => {
        xS.set(st.x); yS.set(st.y);
        const inP = st.mode === 'practice';
        viewB[0].className = st.view === 'map' ? 'btn primary' : 'btn'; viewB[1].className = st.view === 'lines' ? 'btn primary' : 'btn';
        viewB[0].setAttribute('aria-pressed', st.view === 'map'); viewB[1].setAttribute('aria-pressed', st.view === 'lines');
        show(gXY, st.mode !== 'form');
        show(gTask, !inP);
        if (!inP && quiz) quiz.render();
        if (inP && pquiz) pquiz.render();
        upd(); P.requestDraw();
      };

      /* ---------- practice ---------- */
      const gPrac = grp(() => {
        C.title('Practice');
        C.hint(`${NP} problems. Pick an answer and read why. The picture and sliders show each system, so you can test an answer.`);
      });
      const startRow = h('div', { class: 'ctl buttons' }, h('button', { type: 'button', class: 'btn primary', onclick: () => { st.pRight = 0; st.pDone = 0; loadProb(0); } }, 'Start practice'));
      const pStatus = h('div', { class: 'ctl readout', 'aria-live': 'off', style: 'border-top:0;padding-top:0' });
      const pBox = h('div', { style: 'display:flex;flex-direction:column;gap:14px' });
      gPrac.append(startRow, pStatus, pBox);
      let pquiz = null, pdone = false;
      pquiz = makeQuiz(pBox);
      const backRow = h('div', { class: 'ctl buttons' }, h('button', { type: 'button', class: 'btn', onclick: () => leavePractice() }, 'Back to the lesson'));
      gPrac.append(backRow);
      const tally = () => {
        pStatus.innerHTML = `${kk(`Problem ${Math.min(st.pi + 1, NP)} of ${NP}`)} Right on the first try: <b>${st.pRight} of ${st.pDone}</b>${st.pDone ? '' : ' (none answered yet)'}.`;
      };
      const showPrac = on => { show(startRow, !on); show(pStatus, on); show(pBox, on); show(backRow, on); };
      showPrac(false);
      const loadProb = i => {
        cancel(); st.mode = 'practice'; st.pi = i; const pb = PROBS[i];
        setSys(pb.A, pb.B, pb.vw, pb.X0); st.view = 'map'; st.reveal = true; st.t = 1; st.showSol = false; st.showDet = false; st.back = false;
        const last = i + 1 === NP;
        pquiz.load({ ask: `${kk(pb.tag)}<br>${pb.q}`, choices: pb.choices, hint: pb.hint, onRight: first => { st.pDone++; if (first) st.pRight++; st.showSol = true; st.showDet = true; tally(); sync(); } },
          { hint: true, next: () => (last ? (st.pRight = 0, st.pDone = 0, loadProb(0)) : loadProb(i + 1)), nextLabel: last ? 'Start again' : 'Next problem', end: last ? `You finished all ${NP} problems.` : '' });
        showPrac(true); tally(); sync();
      };
      const leavePractice = () => { st.mode = 'form'; enter(lastPatch, true); };

      /* ---------- steps ---------- */
      let lastPatch = { mode: 'form', view: 'lines', sys: 0 };
      const enter = (patch, immediate) => {
        cancel(); lastPatch = patch; const m = patch.mode;
        st.mode = m; st.view = patch.view; const S = SYS[patch.sys];
        setSys(S.A, S.B, S.vw, S.X0);
        st.reveal = true; st.t = 1; st.showDet = false; st.showSol = false; st.back = false;
        fm.x = fm.r1 = fm.r2 = fm.b = false; fm.row = null; fm.seen = [false, false];
        showPrac(false);
        if (m === 'inv') st.showDet = false;
        if (m === 'map') { st.x = 2; st.y = 1; }
        loadTask(0);
      };
      const apply = (patch, immediate) => { enter({ mode: patch.mode || 'form', view: patch.view || 'lines', sys: patch.sys || 0 }, immediate); };

      /* ---------- dragging X ---------- */
      draggable(P, {
        hit: (px, py) => (st.mode !== 'form' && Math.hypot(P.X(st.x) - px, P.Y(st.y) - py) < 24 ? 'X' : null),
        move: (hd, x, y) => { cancel(); st.x = clamp(snap(x, .5), -4, 10); st.y = clamp(snap(y, .5), -4, 10); sync(); }
      });

      apply(lastPatch, true);
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
