/* =====================================================================
   UNDERGRADUATE (Linear Algebra) — Solving A x + b = 0
   ===================================================================== */
{
  /* ---------- numbers and words ---------- */
  const MINUS = '−', SUB = ['', '₁', '₂'];
  const nf = v => { const s = String(Math.round(v * 100) / 100); return s[0] === '-' ? MINUS + s.slice(1) : s; };
  const vs = (x, y) => `(${nf(x)}, ${nf(y)})`;
  const pn = v => (v < 0 ? `(${nf(v)})` : nf(v));
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const fr = (n, d) => {
    n = Math.round(n); d = Math.round(d); if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d) || 1; n /= g; d /= g; return d === 1 ? nf(n) : nf(n) + '/' + d;
  };
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;
  const FONT = '"Hanken Grotesk","Helvetica Neue",Arial,sans-serif';
  const EPS = 1e-9;
  /* exact fractions [n, d] for the row operations */
  const rq = (n, d = 1) => { n = Math.round(n); d = Math.round(d); if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; return [n / g, d / g]; };
  const radd = (a, b) => rq(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  const rmul = (a, b) => rq(a[0] * b[0], a[1] * b[1]);
  const rdiv = (a, b) => rq(a[0] * b[1], a[1] * b[0]);
  const rv = q => q[0] / q[1], rs = q => fr(q[0], q[1]), rz = q => q[0] === 0;
  const fromNum = v => rq(Math.round(v * 1000), 1000);
  const coef = (q, i, first) => {
    if (rz(q)) return '';
    const neg = q[0] < 0, n = Math.abs(q[0]), d = q[1];
    const body = (n === 1 && d === 1 ? '' : d === 1 ? String(n) : `(${n}/${d})`) + 'x' + SUB[i];
    return first ? (neg ? MINUS : '') + body : (neg ? ` ${MINUS} ` : ' + ') + body;
  };
  const eqText = row => { const s1 = coef(row[0], 1, true), s2 = coef(row[1], 2, s1 === ''); return `${s1 + s2 || '0'} = ${rs(row[2])}`; };

  /* ---------- predict, then see: four fixed cases ---------- */
  const CASES = [
    { nums: { a11: 1, a12: 2, a21: 2, a22: 3, b1: -4, b2: -7, x1: 0, x2: 0 }, ans: 1, show: 'A with rows (1, 2) and (2, 3), and b = (−4, −7)',
      why: 'det A = 1·3 − 2·2 = −1, not 0, so A can be undone and there is exactly one solution. Here it is x = (2, 1): A x = (2 + 2, 4 + 3) = (4, 7) = −b.' },
    { nums: { a11: 1, a12: 2, a21: 2, a22: 4, b1: -3, b2: -6, x1: 0, x2: 0 }, ans: 2, show: 'A with rows (1, 2) and (2, 4), and b = (−3, −6)',
      why: 'det A = 1·4 − 2·2 = 0, so A squashes the plane onto the line through (1, 2). The target −b = (3, 6) is 3 times (1, 2), so it is on that line. Row 2 is twice row 1 on both sides (6 = 2·3), so the two equations say the same thing: x₁ + 2x₂ = 3. Every point of that line works.' },
    { nums: { a11: 1, a12: 2, a21: 2, a22: 4, b1: -3, b2: -5, x1: 0, x2: 0 }, ans: 0, show: 'the same A (rows (1, 2) and (2, 4)), but now b = (−3, −5)',
      why: 'det A = 0 again, so A x always lies on the line through (1, 2). The target −b = (3, 5) is not a multiple of (1, 2), so it is off the line. The equations contradict each other: twice row 1 gives 2x₁ + 4x₂ = 6, but row 2 says it equals 5.' },
    { nums: { a11: 2, a12: -1, a21: -4, a22: 2, b1: -1, b2: -2, x1: 0, x2: 0 }, ans: 0, show: 'A with rows (2, −1) and (−4, 2), and b = (−1, −2)',
      why: 'det A = 2·2 − (−1)(−4) = 0, so the image is the line through (2, −4). The target −b = (1, 2) would need 2 = −2·1 (row 2 is −2 times row 1), which is false. Both equations cannot hold: 2x₁ − x₂ = 1 forces −4x₁ + 2x₂ = −2, not 2. No solution.' }
  ];
  const PCHOICES = ['No solution', 'Exactly one solution', 'Infinitely many solutions'];

  /* ---------- practice: eight fixed problems ---------- */
  const PROB = [
    { kind: 'choice', setup: { a11: 1, a12: 0, a21: 0, a22: 1, b1: 0, b2: 0, x1: 0, x2: 0, grid: false, sol: false },
      q: 'A system has two equations: x₁ + 2x₂ = 5 and 3x₁ − x₂ = 1. Written as A x + b = 0, which A and b are right?',
      ans: 2, after: { a11: 1, a12: 2, a21: 3, a22: -1, b1: -5, b2: -1, x1: 1, x2: 2, sol: true },
      choices: [
        { t: 'A has rows (1, 2) and (3, −1), and b = (5, 1)', why: 'The rows of A are right, but the signs of b are not. x₁ + 2x₂ = 5 becomes x₁ + 2x₂ − 5 = 0, so the first entry of b is −5.' },
        { t: 'A has rows (1, 3) and (2, −1), and b = (−5, −1)', why: 'The columns and rows are swapped. Each ROW of A holds the coefficients of one equation: (1, 2) for the first and (3, −1) for the second.' },
        { t: 'A has rows (1, 2) and (3, −1), and b = (−5, −1)', why: 'Each row of A is one equation, and moving the right side across the equals sign gives b = (−5, −1). The picture now shows the system; its solution is x = (1, 2).' },
        { t: 'A has rows (1, 2) and (3, −1), and b = (−5, 1)', why: 'Only one sign was changed. 3x₁ − x₂ = 1 becomes 3x₁ − x₂ − 1 = 0, so the second entry of b is −1, the same sign change as in the first row.' }] },
    { kind: 'set', setup: { a11: 1, a12: 1, a21: 1, a22: -1, b1: -4, b2: -2, x1: 0, x2: 0, grid: true, sol: false },
      q: 'Here A has rows (1, 1) and (1, −1), and b = (−4, −2). The equations are x₁ + x₂ = 4 and x₁ − x₂ = 2. Move x (drag the handle in the top pane, or use the x sliders) so that A x lands on the yellow target −b = (4, 2), then press Check.',
      tip: 'Add the two equations: the x₂ terms cancel.',
      win: 'Adding the equations gives 2x₁ = 6, so x₁ = 3, and then x₂ = 4 − 3 = 1. Check: A x = (3 + 1, 3 − 1) = (4, 2) = −b.' },
    { kind: 'choice', setup: { a11: 3, a12: 1, a21: 2, a22: 1, b1: -7, b2: -5, x1: 0, x2: 0, grid: true, sol: false },
      q: 'A has rows (3, 1) and (2, 1), so det A = 1 and A⁻¹ has rows (1, −1) and (−2, 3). With b = (−7, −5), use x = −A⁻¹b to find x.',
      ans: 1, after: { x1: 2, x2: 1, sol: true },
      choices: [
        { t: 'x = (−2, −1)', why: 'That is A⁻¹b without the minus sign: (1·(−7) − 1·(−5), −2·(−7) + 3·(−5)) = (−2, −1). The equation is A x = −b, so x = A⁻¹(−b) = −A⁻¹b.' },
        { t: 'x = (2, 1)', why: 'x = −A⁻¹b = A⁻¹(7, 5) = (1·7 − 1·5, −2·7 + 3·5) = (2, 1). Check: A x = (6 + 1, 4 + 1) = (7, 5) = −b.' },
        { t: 'x = (−3, 8)', why: 'This multiplies by the transpose of A⁻¹ (rows (1, −2) and (−1, 3)) instead of A⁻¹. Use the rows (1, −1) and (−2, 3) exactly as given.' },
        { t: 'x = (7, 5)', why: 'That is just −b. It skips multiplying by A⁻¹. Check: A(7, 5) = (26, 19), not (7, 5).' }] },
    { kind: 'choice', setup: { a11: 2, a12: -4, a21: -1, a22: 2, b1: -6, b2: 3, x1: 0, x2: 0, grid: false, sol: false },
      q: 'A has rows (2, −4) and (−1, 2), and b = (−6, 3). The equations are 2x₁ − 4x₂ = 6 and −x₁ + 2x₂ = −3. How many solutions does A x + b = 0 have?',
      ans: 2, after: { x1: 3, x2: 0, grid: true, sol: true },
      choices: [
        { t: 'No solution', why: 'det A = 2·2 − (−4)(−1) = 0, but that alone does not mean no solution. Multiply row 2 by −2: 2x₁ − 4x₂ = 6, the same as row 1. The equations agree.' },
        { t: 'Exactly one solution', why: 'Exactly one needs det A ≠ 0. Here det A = 4 − 4 = 0.' },
        { t: 'Infinitely many solutions', why: 'det A = 0, so A squashes the plane onto a line. The line is the multiples of (2, −1), and the target −b = (6, −3) is 3·(2, −1), so it is on the line. Also row 2 is −1/2 times row 1 on both sides (−x₁ + 2x₂ = −3). Every x with 2x₁ − 4x₂ = 6 works, for example (3, 0).' }] },
    { kind: 'choice', setup: { a11: 1, a12: 3, a21: 2, a22: 6, b1: -4, b2: -7, x1: 0, x2: 0, grid: false, sol: false },
      q: 'A has rows (1, 3) and (2, 6), and b = (−4, −7). The equations are x₁ + 3x₂ = 4 and 2x₁ + 6x₂ = 7. How many solutions does A x + b = 0 have?',
      ans: 0, after: { grid: true, sol: true },
      choices: [
        { t: 'No solution', why: 'det A = 1·6 − 3·2 = 0, so A x always lies on the line through (1, 2). The target (4, 7) is off that line, because 2·4 = 8, not 7. Twice row 1 would give 2x₁ + 6x₂ = 8, but row 2 says 7.' },
        { t: 'Exactly one solution', why: 'det A = 0, so there is never exactly one solution.' },
        { t: 'Infinitely many solutions', why: 'det A = 0 allows infinitely many only when the target is on the line the grid collapses to. Here it is not: (4, 7) is not a multiple of (1, 2).' }] },
    { kind: 'choice', setup: { a11: 1, a12: 2, a21: 2, a22: 4, b1: 0, b2: 0, x1: 0, x2: 0, grid: true, sol: false },
      q: 'A has rows (1, 2) and (2, 4). The grid is collapsed onto the line through (1, 2). For which b does A x + b = 0 have at least one solution?',
      ans: 2, after: {},
      choices: [
        { t: 'b = (−3, −3)', show: { b1: -3, b2: -3, sol: true }, why: 'The target −b = (3, 3) is not on the line through (1, 2) (a multiple of (1, 2) has second entry twice the first). Row 2 would need 2·3 = 6, not 3.' },
        { t: 'b = (3, −6)', show: { b1: 3, b2: -6, sol: true }, why: 'The target −b = (−3, 6) has second entry −2 times the first, not 2 times, so it is off the line.' },
        { t: 'b = (−3, −6)', show: { b1: -3, b2: -6, sol: true }, why: 'The target −b = (3, 6) = 3·(1, 2) is on the line, so there are solutions, in fact infinitely many (for example x = (3, 0)). The rule: −b must be a multiple of (1, 2).' },
        { t: 'b = (−6, −3)', show: { b1: -6, b2: -3, sol: true }, why: 'The target (6, 3) has second entry half the first, not twice. It is off the line through (1, 2).' }] },
    { kind: 'choice', setup: { a11: 2, a12: -1, a21: 1, a22: 3, b1: -3, b2: -6, x1: 2, x2: 1, grid: true, sol: false },
      q: 'A has rows (2, −1) and (1, 3), and b = (−3, −6). A student says x = (2, 1) solves A x + b = 0 because the first equation 2x₁ − x₂ = 3 works. Is the student right?',
      ans: 1, after: {},
      choices: [
        { t: 'Yes: one equation holding means x is a solution.', why: 'A solution must satisfy BOTH equations. Checking one row is not enough.' },
        { t: 'No: A x + b = (0, −1), so the second equation fails.', why: 'A x = (2·2 − 1, 2 + 3·1) = (3, 5). Then A x + b = (3 − 3, 5 − 6) = (0, −1). The first entry is 0 but the second is not, so x = (2, 1) is not a solution. The real solution is x = (15/7, 9/7).' },
        { t: 'Yes: det A = 7 is not 0, so any x works.', why: 'det A ≠ 0 means there is exactly one solution, not that every x is one. Only x = −A⁻¹b = (15/7, 9/7) works.' },
        { t: 'No: x must be a whole number of the form (3, 6).', why: 'x does not have to look like b. The solution is (15/7, 9/7), which is not even a whole-number pair.' }] },
    { kind: 'set', setup: { a11: 1, a12: 2, a21: 2, a22: 4, b1: -4, b2: -8, x1: 0, x2: 0, grid: true, sol: false },
      q: 'A has rows (1, 2) and (2, 4), and b = (−4, −8). Find any x with A x + b = 0 (the target is −b = (4, 8)), then press Check. Several answers work.',
      tip: 'Both equations say x₁ + 2x₂ = 4, because row 2 is twice row 1 on both sides. Pick any pair with that sum.',
      win: 'Any x on the line x₁ + 2x₂ = 4 works, for example (4, 0), (2, 1) or (0, 2). The collapsed grid has many x that land on the same target, and the solutions form a line.', done: { sol: true } }
  ];

  register({
    id: 'solving-matrix-equations-ax-plus-b', level: 'ugrad',
    title: 'Solving Ax + b = 0',
    blurb: 'Write a system as one matrix equation, aim Ax at the target −b, solve with the 2×2 inverse or row operations, and see when there is one, none or infinitely many solutions.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 6.5;
      p.grid(1, { axes: true });
      const c1 = [2, 1], c2 = [1, 3];
      for (let i = -4; i <= 4; i++) {
        p.path([[i * c1[0] - 5 * c2[0], i * c1[1] - 5 * c2[1]], [i * c1[0] + 5 * c2[0], i * c1[1] + 5 * c2[1]]], { stroke: alpha(pal.violet, .5), width: 1.2 });
        p.path([[i * c2[0] - 5 * c1[0], i * c2[1] - 5 * c1[1]], [i * c2[0] + 5 * c1[0], i * c2[1] + 5 * c1[1]]], { stroke: alpha(pal.violet, .5), width: 1.2 });
      }
      p.path([[0, 0], c1, [3, 4], c2], { fill: alpha(pal.yellow, .25), close: true });
      p.arrow(0, 0, c1[0], c1[1], pal.green, 3.5);
      p.arrow(0, 0, c2[0], c2[1], pal.red, 3.5);
      p.dot(5, 0, 6, alpha(pal.yellow, .4), pal.yellow, 2.5);
      p.path([[4.5, 0], [5.5, 0]], { stroke: pal.yellow, width: 2 });
      p.path([[5, -.5], [5, .5]], { stroke: pal.yellow, width: 2 });
    },
    hook: String.raw`A drone has two engines, each pushing in its own fixed direction, and the wind adds a steady drift \(b\). How hard should each engine run, \(x_1\) and \(x_2\), so the drone ends exactly where it started? Sometimes there is one answer, sometimes none, and sometimes a whole line of them.`,
    steps: [
      { title: 'Two equations, one matrix equation',
        text: String.raw`<p>The system \(2x_1+x_2=5\), \(x_1+3x_2=0\) packs into one equation. Let \(A=\begin{pmatrix}2&1\\1&3\end{pmatrix}\) hold the coefficients, \(x=(x_1,x_2)\) be the unknown vector and \(b=(-5,0)\) be what is left over. Then \(Ax+b=0\), which means \(Ax=-b\).</p><p>The top pane draws each equation as a line. At \(x=(1,1)\) the readout shows \(Ax+b=(-2,4)\), not \(0\).</p>`,
        set: { a11: 2, a12: 1, a21: 1, a22: 3, b1: -5, b2: 0, x1: 1, x2: 1, eq: true, grid: false, sol: false, pred: -1 } },
      { title: 'Aim Ax at the target −b',
        text: String.raw`<p>\(A\) sends each \(x\) to \(Ax=x_1Ae_1+x_2Ae_2\). The <b style="color:var(--green)">green</b> arrow \(Ae_1=(2,1)\) and the <b style="color:var(--red)">red</b> arrow \(Ae_2=(1,3)\) are the columns of \(A\): where the unit steps \(e_1,e_2\) land. The violet grid is the whole grid after \(A\).</p><p>Move \(x\) (drag the handle in the top pane, or use the sliders) until the yellow point sits on the target \(-b=(5,0)\).</p>`,
        set: { a11: 2, a12: 1, a21: 1, a22: 3, b1: -5, b2: 0, x1: 1, x2: 1, eq: true, grid: true, sol: false, pred: -1 } },
      { title: 'One solution: undo A with the inverse',
        text: String.raw`<p>Here \(\det A=2\cdot3-1\cdot1=5\), not \(0\), so \(A\) can be undone. Multiplying \(Ax=-b\) by \(A^{-1}\) gives \(x=-A^{-1}b\), with \(A^{-1}=\tfrac15\begin{pmatrix}3&-1\\-1&2\end{pmatrix}\). So \(x=\tfrac15(3\cdot5-1\cdot0,\;-1\cdot5+2\cdot0)=(3,-1)\).</p><p>Verify by plugging back in: \(2\cdot3+1\cdot(-1)-5=0\) and \(3+3\cdot(-1)+0=0\). The yellow point is on the target.</p>`,
        set: { a11: 2, a12: 1, a21: 1, a22: 3, b1: -5, b2: 0, x1: 3, x2: -1, eq: true, grid: true, sol: true, pred: -1 } },
      { title: 'The same answer by row operations',
        text: String.raw`<p>Write the equations as a table \([A\mid -b]\): rows \(2\;1\mid5\) and \(1\;3\mid0\). A <b>row operation</b> (add a multiple of one row to another, swap rows, or scale a row) changes the lines but never the point where they cross.</p><p>In the Row operations box: set \(k=-2\) and do \(R_1\leftarrow R_1+kR_2\); scale \(R_1\); set \(k=-3\) and do \(R_2\leftarrow R_2+kR_1\); then swap. Rows \(1\,0\mid3\) and \(0\,1\mid-1\) read off \(x=(3,-1)\).</p>`,
        set: { a11: 2, a12: 1, a21: 1, a22: 3, b1: -5, b2: 0, x1: 0, x2: 0, eq: true, grid: false, sol: true, pred: -1 } },
      { title: 'When det A = 0: a line or nothing',
        text: String.raw`<p>Now \(A=\begin{pmatrix}1&2\\2&4\end{pmatrix}\) and \(b=(-3,-6)\). The columns \((1,2)\) and \((2,4)\) point the same way, so \(\det A=1\cdot4-2\cdot2=0\) and the whole grid collapses onto one line. \(Ax\) can only land on that line.</p><p><b>Predict first.</b> Is the target \(-b=(3,6)\) on the line? Choose in the Predict box how many solutions there are, then watch. The next prediction changes \(b\) to \((-3,-5)\).</p>`,
        set: { x1: 0, x2: 0, eq: true, grid: false, sol: false, pred: 1 } }
    ],
    formal: String.raw`
      <h3>A system as one equation</h3>
      <p>A <b>system of linear equations</b> in two unknowns, \(a_{11}x_1+a_{12}x_2=t_1\) and \(a_{21}x_1+a_{22}x_2=t_2\), is one matrix equation. Put the coefficients in the <b>matrix</b> \(A=\begin{pmatrix}a_{11}&a_{12}\\a_{21}&a_{22}\end{pmatrix}\), the unknowns in the <b>vector</b> \(x=(x_1,x_2)\), and write \(b=-t\). Then the system is \(Ax+b=0\), or \(Ax=-b\). The product \(Ax\) takes each row of \(A\) against \(x\), so row \(i\) of \(Ax=-b\) is exactly equation \(i\). The sign convention matters: the target is \(-b\), not \(b\).</p>
      <h3>What A does</h3>
      <p>Since \(Ax=x_1\,Ae_1+x_2\,Ae_2\), the columns of \(A\) are the images of the unit vectors \(e_1=(1,0)\) and \(e_2=(0,1)\), and \(Ax\) is the combination of those columns with coefficients \(x_1,x_2\). The grid of whole-number steps becomes a grid of parallelograms. Each cell has area \(|\det A|\), where \(\det A=a_{11}a_{22}-a_{12}a_{21}\). Solving \(Ax=-b\) means: find the point \(x\) that \(A\) sends to the target \(-b\).</p>
      <h3>det A is not 0: exactly one solution</h3>
      <p>For a \(2\times2\) matrix with \(D=\det A\neq0\), the inverse is \(A^{-1}=\frac1D\begin{pmatrix}a_{22}&-a_{12}\\-a_{21}&a_{11}\end{pmatrix}\). Multiply out \(A\,A^{-1}\) and every off-diagonal entry cancels (for example \(a_{11}(-a_{12})+a_{12}a_{11}=0\)), while the diagonal entries are \(\frac{a_{11}a_{22}-a_{12}a_{21}}{D}=1\), so \(AA^{-1}=I\).</p>
      <p><em>Why the solution exists and is unique.</em> If \(Ax=-b\), multiply both sides by \(A^{-1}\): \(x=-A^{-1}b\). So at most one \(x\) can work. Conversely, \(x=-A^{-1}b\) does work: \(Ax+b=-AA^{-1}b+b=-b+b=0\). Written out, with \(t=-b\),
      \[ x_1=\frac{a_{22}t_1-a_{12}t_2}{D},\qquad x_2=\frac{a_{11}t_2-a_{21}t_1}{D}. \]
      <em>Worked example.</em> \(A=\begin{pmatrix}2&1\\1&3\end{pmatrix}\), \(b=(-5,0)\), \(t=(5,0)\), \(D=5\): \(x_1=\frac{3\cdot5-1\cdot0}{5}=3\), \(x_2=\frac{2\cdot0-1\cdot5}{5}=-1\). <em>Verify:</em> \(A(3,-1)=(6-1,\,3-3)=(5,0)=-b\). Always plug back in: it catches sign slips.</p>
      <h3>det A = 0: none or infinitely many</h3>
      <p>If \(D=0\) the columns of \(A\) lie on one line (or are both zero), so \(Ax\) is always on that line through the origin (if \(A\neq 0\); if \(A=0\) it stays at the origin). Two cases follow. If \(-b\) is <b>off</b> the line there is <b>no solution</b>: the equations contradict each other. If \(-b\) is <b>on</b> the line there are <b>infinitely many</b>: a nonzero row of \(A\) then determines the other row (it is a multiple on both sides), so the two equations are one equation, and the solutions form a line in the \(x\)-plane. If \(x_p\) is one solution, all of them are \(x_p+n\) where \(An=0\). The vectors \(n\) with \(An=0\) form a line through the origin (the <em>null space</em> of \(A\)); the solution line is that line shifted by \(x_p\).</p>
      <p><em>Examples.</em> \(A=\begin{pmatrix}1&2\\2&4\end{pmatrix}\), \(b=(-3,-6)\): \(-b=(3,6)\) is on the line through \((1,2)\), and the equations \(x_1+2x_2=3\) and \(2x_1+4x_2=6\) are the same, so every \(x\) with \(x_1+2x_2=3\) works. With \(b=(-3,-5)\) the equations are \(x_1+2x_2=3\) and \(2x_1+4x_2=5\); doubling the first gives \(6=5\), a contradiction, so there is none. So \(\det A=0\) alone never tells you which; you must compare \(-b\) with the line.</p>
      <h3>Row operations find the same x</h3>
      <p>Write the system as the augmented table \([A\mid -b]\). Three <b>row operations</b> are allowed: swap two rows, scale a row by a nonzero number, add a multiple of one row to another. Each is reversible (undo by swapping again, scaling by the reciprocal, or adding the opposite multiple), so any \(x\) that satisfies the old equations satisfies the new ones and conversely: the solution set does not change. In the picture the lines rotate and move, but they keep crossing at the same point. Aim for the form \([I\mid x]\), which reads off the answer.</p>
      <p><em>Worked example.</em> Using \(R_1\leftarrow R_1-2R_2\), then scale \(R_1\) by \(-\frac15\), then \(R_2\leftarrow R_2-3R_1\), then swap:
      \[ \left[\begin{array}{cc|c}2&1&5\\1&3&0\end{array}\right]\to\left[\begin{array}{cc|c}0&-5&5\\1&3&0\end{array}\right]\to\left[\begin{array}{cc|c}0&1&-1\\1&3&0\end{array}\right]\to\left[\begin{array}{cc|c}0&1&-1\\1&0&3\end{array}\right]\to\left[\begin{array}{cc|c}1&0&3\\0&1&-1\end{array}\right]. \]
      This is \(x=(3,-1)\), as the inverse gave. If \(\det A=0\), elimination ends with a row \(0\;0\mid c\): if \(c\neq0\) it says \(0=c\) (no solution), and if \(c=0\) the row says nothing and one unknown is free (infinitely many).</p>
      <h3>Three or more unknowns</h3>
      <p>For \(n\) unknowns, \(A\) is \(n\times n\), \(x\) and \(b\) have \(n\) entries and the equation is still \(Ax=-b\). In \(3\times3\), each equation is a plane in space; \(\det A\neq0\) means the three planes meet at exactly one point, \(x=-A^{-1}b\). When \(\det A=0\) the three planes either miss each other (no solution) or share a line, or one plane (infinitely many). The test for solvability is the same idea: \(-b\) must lie in the span of the columns of \(A\). Elimination works unchanged and is how software solves large systems; computing \(A^{-1}\) explicitly costs about three times as much and is rarely needed.</p>
      <h3>Caveats</h3>
      <p>The formula \(x=-A^{-1}b\) needs \(\det A\neq0\); \(\det A=0\) does not mean "no solution" (it means "not exactly one"). A is only invertible as a whole: one good-looking row does not help. Exact arithmetic is used here; with decimals, a determinant that is nearly zero makes the answer very sensitive to small changes in \(b\).</p>`,
    check: [
      { q: 'What does it mean to solve the matrix equation A x + b = 0 for the vector x?',
        choices: ['Find x with A x = b.', 'Find x so that A sends x to the point −b, that is A x = −b.', 'Find x with x = −b.', 'Find b so that A x is the zero vector.'], answer: 1,
        why: String.raw`Subtracting \(b\) from both sides of \(Ax+b=0\) gives \(Ax=-b\): the vector \(x\) must be sent by \(A\) to the target \(-b\). Choice 1 forgets the minus sign (it solves \(Ax-b=0\)). Choice 3 skips \(A\) entirely: \(A\) usually changes the vector. Choice 4 changes the unknown: here \(b\) is given and \(x\) is unknown.`,
        hint: String.raw`Move \(b\) to the other side of the equals sign. What happens to its sign?` },
      { q: 'Let A have rows (1, 2) and (3, 5), and let b = (−4, −9). Solve A x + b = 0 for x. (Here det A = 1·5 − 2·3 = −1, and A⁻¹ has rows (−5, 2) and (3, −1).)',
        choices: ['x = (2, −3)', 'x = (3, −2)', 'x = (−2, 3)', 'x = (4, 9)'], answer: 2,
        why: String.raw`The equation is \(Ax=-b=(4,9)\), so \(x=A^{-1}(4,9)=(-5\cdot4+2\cdot9,\;3\cdot4-1\cdot9)=(-2,3)\). Check: \(A(-2,3)=(-2+6,\,-6+15)=(4,9)\). The choice \((2,-3)\) is \(A^{-1}b\), which forgets that the target is \(-b\) (it gives \(A(2,-3)=(-4,-9)\)). The choice \((3,-2)\) swaps the entries. The choice \((4,9)\) is only \(-b\), without applying \(A^{-1}\).`,
        hint: String.raw`First write the target \(-b\). Then multiply it by \(A^{-1}\), row by row. Finally check by multiplying by \(A\).` },
      { q: 'A has rows (2, 4) and (1, 2), and b = (−4, −2). A student writes: "Step 1: det A = 2·2 − 4·1 = 0. Step 2: so A x + b = 0 has no solution." Which statement is correct?',
        choices: ['Step 2 is wrong: det A = 0 does not mean one solution. Here −b = (4, 2) is on the line A sends everything to, so there are infinitely many.', 'Both steps are correct, because det A = 0 means the system has the usual single solution x = −A⁻¹b.', 'Step 1 is wrong: det A = 2·2 + 4·1 = 8, so A can be undone and the solution is unique.', 'Step 2 is wrong: det A = 0 means there is exactly one solution, found by dividing by the determinant.'], answer: 0,
        why: String.raw`Step 1 is right. Step 2 does not follow: \(\det A=0\) means \(A\) squashes the plane onto a line, so the answer is either none or infinitely many, and you must compare \(-b\) with the line. The columns are \((2,1)\) and \((4,2)\), so the line is the multiples of \((2,1)\). The target \(-b=(4,2)=2\,(2,1)\) is on it. Both equations say \(2x_1+4x_2=4\) (row 2 is half of row 1, and \(2=\tfrac12\cdot4\)), and \(x=(2,0)\) is one solution. The determinant formula is \(ad-bc\), not \(ad+bc\). Exactly one solution needs \(\det A\neq0\).`,
        hint: String.raw`When \(\det A=0\), find the line the columns span, and see whether \(-b\) is on it. Then decide.` }
    ],
    links: { related: ['linear-transformations', 'vectors-span-and-linear-combinations', 'systems-of-equations', 'cramers-rule', 'determinants-and-inverse-matrices', 'matrices', 'solving-systems-with-matrices'] },

    mount({ stage, controls: C }) {
      stage.classList.add('split');
      const top = h('div', { class: 'pane', style: 'flex: 1 1 0' }), bot = h('div', { class: 'pane', style: 'flex: 1 1 0' });
      stage.append(top, bot);
      const P1 = new Plane(top, { span: 5.8 }), P2 = new Plane(bot, { span: 9 });
      for (const P of [P1, P2]) if (P.coordEl) P.coordEl.style.display = 'none';
      P1.canvas.setAttribute('aria-label', 'The x-plane. A handle for the unknown vector x, the two equations drawn as lines, and the solutions. Arrow keys move the handle; the sliders in the panel do the same and read out the numbers.');
      P2.canvas.setAttribute('aria-label', 'The Ax-plane. The columns of A as green and red arrows, the grid after A, the yellow point A x and the target minus b. Arrow keys move the selected handle; the sliders in the panel do the same.');

      const st = { a11: 2, a12: 1, a21: 1, a22: 3, b1: -5, b2: 0, x1: 1, x2: 1, eq: true, grid: false, sol: false, pred: -1, predDone: false };
      let cancel = () => {};
      /* animate st toward patch; a later cancel() jumps to the end values instead of freezing mid-way */
      const glide = (patch, ms) => { let live = true; const stop = animateTo(st, patch, ms, sync, () => { live = false; }); cancel = () => { if (live) { live = false; stop(); Object.assign(st, patch); } }; };
      let locked = false, solMsg = '', M = null, rowKey = '', rowMsg = '';
      const pd = { picked: -1 };
      const pr = { started: false, i: 0, solved: PROB.map(() => false), wrong: PROB.map(() => []), fb: '' };
      const hidden = () => st.pred >= 0 && !st.predDone;

      /* ---------- the mathematics of the current state ---------- */
      const det = () => st.a11 * st.a22 - st.a12 * st.a21;
      const img = () => [st.a11 * st.x1 + st.a12 * st.x2, st.a21 * st.x1 + st.a22 * st.x2];
      const tgt = () => [-st.b1, -st.b2];
      const info = () => {
        const { a11, a12, a21, a22 } = st, t1 = -st.b1, t2 = -st.b2, D = det();
        if (Math.abs(D) > EPS) { const n1 = a22 * t1 - a12 * t2, n2 = a11 * t2 - a21 * t1; return { k: 'one', D, n1, n2, x: [n1 / D, n2 / D] }; }
        const c1 = [a11, a21], c2 = [a12, a22], u = Math.hypot(...c1) > EPS ? c1 : Math.hypot(...c2) > EPS ? c2 : null;
        if (!u) return t1 === 0 && t2 === 0 ? { k: 'all', D } : { k: 'none', D, u };
        if (Math.abs(u[0] * t2 - u[1] * t1) > EPS) return { k: 'none', D, u };
        const row = Math.hypot(a11, a12) > EPS ? [a11, a12, t1] : [a21, a22, t2];
        return { k: 'line', D, u, row };
      };
      /* a solution the sliders can show (halves within -5..5), or null */
      const findSol = () => {
        const K = info(); let best = null, bs = 1e9;
        if (K.k === 'all') return [0, 0];
        if (K.k === 'one') { const ok2 = v => Math.abs(v * 2 - Math.round(v * 2)) < EPS && Math.abs(v) <= 5; return ok2(K.x[0]) && ok2(K.x[1]) ? K.x : null; }
        if (K.k !== 'line') return null;
        for (let i = -10; i <= 10; i++) for (let j = -10; j <= 10; j++) {
          const x1 = i / 2, x2 = j / 2;
          if (Math.abs(st.a11 * x1 + st.a12 * x2 + st.b1) < EPS && Math.abs(st.a21 * x1 + st.a22 * x2 + st.b2) < EPS) {
            const s = Math.abs(x1) + Math.abs(x2); if (s < bs) { bs = s; best = [x1, x2]; }
          }
        }
        return best;
      };
      const lineText = K => `${eqText([fromNum(K.row[0]), fromNum(K.row[1]), fromNum(K.row[2])])}`;

      /* ---------- row operations on [A | -b] ---------- */
      const ensureM = () => {
        const key = [st.a11, st.a12, st.a21, st.a22, st.b1, st.b2].map(v => Math.round(v * 1000)).join();
        if (key !== rowKey) { rowKey = key; rowMsg = ''; M = [[fromNum(st.a11), fromNum(st.a12), fromNum(-st.b1)], [fromNum(st.a21), fromNum(st.a22), fromNum(-st.b2)]]; }
        return M;
      };
      const resetRows = () => { rowKey = ''; rowMsg = ''; ensureM(); };

      /* ---------- drawing ---------- */
      const note = (c, p, s, color, line = 0, x = 22, bot = false) => {
        const size = clamp(p.scale * .62, 12.5, 15.5);
        c.font = `600 ${size}px ${FONT}`; c.textAlign = 'left'; c.textBaseline = 'top';
        c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; const y = bot ? p.h - size - 12 : 16 + line * (size + 4); c.strokeText(s, x, y); c.fillStyle = color; c.fillText(s, x, y);
      };
      /* a label pushed away from the point along (ux, uy) and kept inside the canvas */
      const tag = (p, s, x, y, ux, uy, color) => {
        const len = Math.hypot(ux, uy) || 1, off = clamp(p.scale * .9, 17, 24), size = clamp(p.scale * .85, 15, 19), c = p.ctx;
        c.font = `500 ${size * .85}px ${FONT}`; const hw = c.measureText(s).width / 2 + 6;
        let dx = ux / len * off * 1.3, dy = -uy / len * off;
        const px = p.X(x) + dx, py = p.Y(y) + dy;
        if (px < hw) dx += hw - px; else if (px > p.w - hw) dx -= px - (p.w - hw);
        const qy = p.Y(y) + dy; if (qy < 12) dy += 12 - qy; else if (qy > p.h - 12) dy -= qy - (p.h - 12);
        p.label(s, x, y, { size, italic: false, color, dx, dy });
      };
      const bigLine = (p, a, b, c, opt) => { /* the line a x + b y = c across the pane */
        const n2 = a * a + b * b; if (n2 < EPS) return;
        const x0 = a * c / n2, y0 = b * c / n2, dx = -b, dy = a, L = 80 / Math.sqrt(n2);
        p.path([[x0 - dx * L, y0 - dy * L], [x0 + dx * L, y0 + dy * L]], opt);
      };

      P1.onDraw = (c, p) => {
        const pal = p.pal, Mx = ensureM(), K = info(), [px, py] = img(), [t1, t2] = tgt(), hit = Math.hypot(px - t1, py - t2) < EPS;
        p.grid(1); p.ticks(1);
        p.path([[0, 0], [1, 0], [1, 1], [0, 1]], { fill: alpha(pal.yellow, .14), close: true });
        p.arrow(0, 0, 1, 0, alpha(pal.green, .8), 2.5); p.arrow(0, 0, 0, 1, alpha(pal.red, .8), 2.5);
        /* the rows of the current table as lines */
        if (st.eq && !hidden()) Mx.forEach((r, i) => {
          if (rz(r[0]) && rz(r[1])) return;
          bigLine(p, rv(r[0]), rv(r[1]), rv(r[2]), { stroke: pal.blue, width: 2.4, dash: i ? [8, 6] : null });
        });
        const show = (st.sol || hit) && !hidden(); let same = false;
        if (show) {
          if (K.k === 'one') {
            p.dot(K.x[0], K.x[1], 13, alpha(pal.violet, .25), pal.violet, 3);
            same = Math.hypot(K.x[0] - st.x1, K.x[1] - st.x2) < EPS;
            tag(p, (same ? 'x = x* = (' : 'x* = (') + fr(K.n1, K.D) + ', ' + fr(K.n2, K.D) + ')', K.x[0], K.x[1], 1, -1, pal.violet);
          } else if (K.k === 'line') bigLine(p, K.row[0], K.row[1], K.row[2], { stroke: alpha(pal.violet, .55), width: 7 });
        }
        p.dot(st.x1, st.x2, 8, pal.stage, pal.brass, 3);
        if (!same) tag(p, 'x = ' + vs(st.x1, st.x2), st.x1, st.x2, st.x1 || .3, st.x2 || .3, pal.text);
        note(c, p, 'Input: the x-plane', pal.muted, 0);
        let ln = 1;
        const size = clamp(p.scale * .62, 12.5, 15.5), small = p.h < 240;
        if (st.eq && small) {
          /* narrow pane: one line, "row 1" and "row 2" with their line styles; the equations are in the panel */
          const y = 16 + ln * (size + 4) + size / 2; let x0 = 22;
          Mx.forEach((r, i) => {
            c.beginPath(); c.setLineDash(i ? [5, 4] : []); c.moveTo(x0, y); c.lineTo(x0 + 18, y); c.strokeStyle = pal.blue; c.lineWidth = 2.4; c.stroke(); c.setLineDash([]);
            note(c, p, 'row ' + (i + 1), pal.blue, ln, x0 + 24); x0 += 86;
          });
          ln++;
        } else if (st.eq) Mx.forEach((r, i) => {
          const y = 16 + ln * (size + 4) + size / 2;
          c.beginPath(); c.setLineDash(i ? [5, 4] : []); c.moveTo(22, y); c.lineTo(42, y); c.strokeStyle = pal.blue; c.lineWidth = 2.4; c.stroke(); c.setLineDash([]);
          note(c, p, 'row ' + (i + 1) + ': ' + (rz(r[0]) && rz(r[1]) ? (rz(r[2]) ? '0 = 0' : '0 = ' + rs(r[2]) + ' (impossible)') : eqText(r)), pal.blue, ln, 48); ln++;
        });
        if (show && K.k === 'none') note(c, p, 'No x satisfies both equations', pal.red, ln);
        if (show && K.k === 'line') note(c, p, 'Solutions: every x on the violet line', pal.violet, ln);
      };

      P2.onDraw = (c, p) => {
        p.span = p.h < 240 ? 7.5 : 9;
        const pal = p.pal, bd = p.bounds(), K = info(), D = det(), [px, py] = img(), [t1, t2] = tgt();
        const c1 = [st.a11, st.a21], c2 = [st.a12, st.a22], hit = Math.hypot(px - t1, py - t2) < EPS, z1 = Math.hypot(...c1) < EPS, z2 = Math.hypot(...c2) < EPS;
        p.grid(1); p.ticks(1);
        const showGrid = st.grid && !hidden(), big = 60;
        if (showGrid) {
          if (Math.abs(D) > EPS) {
            c.fillStyle = alpha(pal.violet, .06); c.fillRect(0, 0, p.w, p.h);
            for (let i = -16; i <= 16; i++) {
              p.path([[i * c1[0] - big * c2[0], i * c1[1] - big * c2[1]], [i * c1[0] + big * c2[0], i * c1[1] + big * c2[1]]], { stroke: alpha(pal.violet, .4), width: 1.2 });
              p.path([[i * c2[0] - big * c1[0], i * c2[1] - big * c1[1]], [i * c2[0] + big * c1[0], i * c2[1] + big * c1[1]]], { stroke: alpha(pal.violet, .4), width: 1.2 });
            }
          } else if (K.u) { const L = Math.hypot(...K.u); p.path([[-big * K.u[0] / L, -big * K.u[1] / L], [big * K.u[0] / L, big * K.u[1] / L]], { stroke: alpha(pal.violet, .5), width: 7 }); }
          for (let i = -8; i <= 8; i++) for (let j = -8; j <= 8; j++) {
            const x = i * c1[0] + j * c2[0], y = i * c1[1] + j * c2[1];
            if (x < bd.x0 || x > bd.x1 || y < bd.y0 || y > bd.y1) continue;
            p.dot(x, y, 3, alpha(pal.violet, .9));
          }
          if (!K.u) p.dot(0, 0, 7, alpha(pal.violet, .95));
        }
        p.path([[0, 0], c1, [c1[0] + c2[0], c1[1] + c2[1]], c2], { fill: alpha(pal.yellow, .14), close: true });
        /* x1 Ae1, then x2 Ae2, arriving at A x */
        const ax = st.x1 * c1[0], ay = st.x1 * c1[1];
        if (Math.hypot(ax, ay) > EPS) p.path([[0, 0], [ax, ay]], { stroke: alpha(pal.green, .38), width: 9 });
        if (Math.hypot(px - ax, py - ay) > EPS) p.path([[ax, ay], [px, py]], { stroke: alpha(pal.red, .38), width: 9 });
        if (!z1) p.arrow(0, 0, c1[0], c1[1], pal.green, 3.5);
        if (!z2) p.arrow(0, 0, c2[0], c2[1], pal.red, 3.5);
        /* target */
        p.dot(t1, t2, 12, hit ? alpha(pal.yellow, .35) : null, pal.yellow, 3);
        p.path([[t1 - .3, t2], [t1 + .3, t2]], { stroke: pal.yellow, width: 2 });
        p.path([[t1, t2 - .3], [t1, t2 + .3]], { stroke: pal.yellow, width: 2 });
        if (!hit) p.path([[px, py], [t1, t2]], { stroke: alpha(pal.yellow, .8), width: 1.8, dash: [5, 5] });
        p.dot(px, py, 7, pal.yellow, pal.text, 1.5);
        /* handles (drag the column tips to edit A, drag the target to edit b) */
        p.dot(c1[0], c1[1], 8, pal.stage, pal.brass, 3);
        p.dot(c2[0], c2[1], 8, pal.stage, pal.brass, 3);
        p.dot(t1, t2, 8, pal.stage, pal.brass, 3);
        tag(p, 'Ae₁', c1[0], c1[1], c1[0] || .2, (c1[1] || .2) - 1.2, pal.green);
        tag(p, 'Ae₂', c2[0], c2[1], c2[0] - 1.5, c2[1] || .2, pal.red);
        tag(p, hit ? '−b: hit!' : '−b', t1, t2, t1 || 1, t2 + .9, pal.text);
        if (!hit && Math.hypot(px - t1, py - t2) > .4 && Math.hypot(px - c1[0], py - c1[1]) > .5 && Math.hypot(px - c2[0], py - c2[1]) > .5) tag(p, 'Ax', px, py, px || .2, py + .8, pal.yellow);
        note(c, p, 'Output: the Ax-plane', pal.muted, 0);
        if (showGrid) note(c, p, Math.abs(D) > EPS ? `Whole plane. Unit square area |det A| = ${nf(Math.abs(D))}` : K.u ? 'det A = 0: squashed onto a line' : 'A = 0: all goes to the origin', pal.violet, 1, 22, p.h < 240);
      };

      /* ---------- panel ---------- */
      const choiceStyle = (solved, bad, dim) => `justify-content:flex-start;text-align:left;border-radius:10px;padding:10px 14px;width:100%;min-height:44px;line-height:1.35;white-space:normal;${solved ? 'border-color:var(--green);color:var(--text);' : ''}${bad ? 'border-color:var(--red);color:var(--muted);' : ''}${dim ? 'opacity:.55;pointer-events:none;' : ''}`;
      const colBox = () => h('div', { style: 'display:flex;flex-direction:column;gap:8px' });
      C.title('Solve A x + b = 0');
      const S = {}, lockInputs = [];
      const probe = C.readout(), hostEl = probe.parentNode; probe.remove();
      const mk = (key, label, min, max, step, lockable) => {
        S[key] = C.slider({ label, min, max, step, value: st[key], format: v => nf(v), onInput: v => { cancel(); st[key] = v; solMsg = ''; sync(); } });
        if (lockable) lockInputs.push(hostEl.lastElementChild.querySelector('input'));
      };
      const ro = C.readout();
      const tE = C.toggle({ label: 'Show the table rows as lines in the x-plane', value: st.eq, onChange: v => { st.eq = v; sync(); } });
      const tG = C.toggle({ label: 'Show A applied to the whole grid', value: st.grid, onChange: v => { st.grid = v; sync(); } });
      const tS = C.toggle({ label: 'Show the solutions', value: st.sol, onChange: v => { st.sol = v; sync(); } });
      C.buttons([{ label: 'Solve it', onClick: () => solve() }, { label: 'Verify x', onClick: () => verify() }]);
      const solEl = C.readout(); solEl.style.borderTop = '0'; solEl.style.paddingTop = '0';
      C.title('Unknown x');
      mk('x1', 'x₁ (first entry of x)', -5, 5, .5); mk('x2', 'x₂ (second entry of x)', -5, 5, .5);
      C.title('Predict, then see');
      const prdBox = colBox(); hostEl.append(prdBox);
      C.title('Matrix A and vector b');
      mk('a11', 'A row 1, column 1', -4, 4, 1, true); mk('a12', 'A row 1, column 2', -4, 4, 1, true);
      mk('a21', 'A row 2, column 1', -4, 4, 1, true); mk('a22', 'A row 2, column 2', -4, 4, 1, true);
      mk('b1', 'b₁ (the target is −b)', -8, 8, 1, true); mk('b2', 'b₂', -8, 8, 1, true);
      C.title('Row operations on [A | −b]');
      const mEl = C.readout();
      const kS = C.slider({ label: 'Multiplier k', min: -4, max: 4, step: .5, value: 1, format: v => rs(rq(v * 2, 2)), onInput: () => {} });
      const rowBtns = C.buttons([
        { label: 'R₁ ← R₁ + k·R₂', onClick: () => addRow(0, 1) }, { label: 'R₂ ← R₂ + k·R₁', onClick: () => addRow(1, 0) },
        { label: 'Swap R₁ and R₂', onClick: () => swapRows() }, { label: 'Scale R₁ so its first nonzero entry is 1', onClick: () => pivotRow(0) },
        { label: 'Scale R₂ so its first nonzero entry is 1', onClick: () => pivotRow(1) }, { label: 'Reset the table', onClick: () => { resetRows(); sync(); } }]);
      const lockables = [...lockInputs];
      const setLock = v => { locked = v; lockables.forEach(e => { e.disabled = v; }); };

      const term = (r) => r.map(rs).join(', ');
      const addRow = (dst, src) => {
        const Mx = ensureM(), k = rq(Math.round(kS.get() * 2), 2), kt = k[0] < 0 ? `(${rs(k)})` : rs(k);
        if (rz(k)) { rowMsg = `With k = 0 nothing changes. Choose another k.`; sync(); return; }
        Mx[dst] = Mx[dst].map((q, j) => radd(q, rmul(k, Mx[src][j])));
        rowMsg = `Done: R${dst + 1} ← R${dst + 1} + ${kt}·R${src + 1}.`; finishRows(); sync();
      };
      const swapRows = () => { const Mx = ensureM(); Mx.reverse(); rowMsg = 'Done: swapped R1 and R2.'; finishRows(); sync(); };
      const pivotRow = i => {
        const Mx = ensureM(), r = Mx[i], lead = !rz(r[0]) ? r[0] : !rz(r[1]) ? r[1] : null;
        if (!lead) { rowMsg = `Row ${i + 1} has no nonzero entry left of the bar, so it cannot be scaled to a first entry of 1.`; sync(); return; }
        Mx[i] = r.map(q => rdiv(q, lead)); rowMsg = `Done: R${i + 1} ← R${i + 1} ÷ (${rs(lead)}).`; finishRows(); sync();
      };
      const finishRows = () => {
        const Mx = M, one = q => q[0] === 1 && q[1] === 1;
        const id1 = one(Mx[0][0]) && rz(Mx[0][1]) && rz(Mx[1][0]) && one(Mx[1][1]);
        if (id1) rowMsg += ` ${ok('Reduced.')} The table reads x = (${rs(Mx[0][2])}, ${rs(Mx[1][2])}). Put that x in with the sliders to see the yellow point land on the target.`;
        for (const r of Mx) if (rz(r[0]) && rz(r[1])) rowMsg += rz(r[2]) ? ' A row of 0 = 0 says nothing: one equation is the same as the other.' : ` ${no('A row says 0 = ' + rs(r[2]) + '.')} That is impossible, so there is no solution.`;
      };

      const upd = () => {
        const [px, py] = img(), [t1, t2] = tgt(), D = det(), K = info(), Mx = ensureM(), hit = Math.hypot(px - t1, py - t2) < EPS;
        const rows = [[fromNum(st.a11), fromNum(st.a12), fromNum(t1)], [fromNum(st.a21), fromNum(st.a22), fromNum(t2)]];
        let s = hidden() ? '' : `${kk('Equations')} ${eqText(rows[0])}<br>${kk('and')} ${eqText(rows[1])}<br>`;
        s += `${kk('Matrix form')} A = rows (${nf(st.a11)}, ${nf(st.a12)}) and (${nf(st.a21)}, ${nf(st.a22)}), b = ${vs(st.b1, st.b2)}<br>`;
        s += `${kk('Columns')} Ae₁ = ${vs(st.a11, st.a21)}, Ae₂ = ${vs(st.a12, st.a22)}<br>${kk('Try')} x = ${vs(st.x1, st.x2)} gives A x = ${vs(px, py)}<br>${kk('Target')} −b = ${vs(t1, t2)}<br>`;
        s += `${kk('A x + b')} = ${vs(px + st.b1, py + st.b2)}`;
        s += hit ? ` ${ok('= 0: x is a solution.')}` : ' not 0 yet.';
        if (!hidden()) s += `<br>${kk('det A')} = ${pn(st.a11)}·${pn(st.a22)} − ${pn(st.a12)}·${pn(st.a21)} = ${nf(D)}`;
        if (!hidden() && st.sol) {
          s += '. ';
          if (K.k === 'one') s += `Not 0, so there is exactly one solution, x = ${'(' + fr(K.n1, K.D) + ', ' + fr(K.n2, K.D) + ')'}.`;
          else if (K.k === 'line') s += `Zero, and −b is on the line A squashes to: infinitely many solutions, all x with ${lineText(K)}.`;
          else if (K.k === 'all') s += 'A = 0 and b = 0: every x is a solution.';
          else s += 'Zero, and −b is off the line A squashes to: no solution.';
        }
        ro.innerHTML = s; solEl.innerHTML = solMsg;
        mEl.innerHTML = `<span style="white-space:pre;font-family:ui-monospace,Menlo,Consolas,monospace">${Mx.map(r => '[ ' + r.map(q => rs(q).padStart(5, ' ')).slice(0, 2).join(' ') + ' |' + rs(r[2]).padStart(5, ' ') + ' ]').join('\n')}</span><br>${rowMsg || 'Start from [A | −b]. Choose k, then an operation.'}`;
      };
      const sync = () => {
        for (const k of ['a11', 'a12', 'a21', 'a22', 'b1', 'b2', 'x1', 'x2']) S[k].set(st[k]);
        tE.checked = st.eq; tG.checked = st.grid; tS.checked = st.sol;
        upd(); P1.draw(); P2.draw();
      };

      /* ---------- Solve it / Verify x ---------- */
      const solve = () => {
        const K = info(); let msg;
        st.grid = true; st.sol = true;
        if (K.k === 'one') {
          msg = `${ok('One solution.')} det A = ${nf(K.D)} is not 0, so x = −A⁻¹b = (1/${pn(K.D)})·(${pn(st.a22)}·${pn(-st.b1)} − ${pn(st.a12)}·${pn(-st.b2)}, ${pn(st.a11)}·${pn(-st.b2)} − ${pn(st.a21)}·${pn(-st.b1)}) = (${fr(K.n1, K.D)}, ${fr(K.n2, K.D)}).`;
        } else if (K.k === 'line') msg = `${ok('Infinitely many solutions.')} det A = 0 and −b is on the line, so the equations agree: every x with ${lineText(K)} works.`;
        else if (K.k === 'all') msg = `${ok('Every x works.')} A = 0 and b = 0.`;
        else msg = `${no('No solution.')} det A = 0, so A x stays on one line, and −b is not on it. The equations contradict each other.`;
        const xs = findSol();
        if (xs) { cancel(); glide({ x1: xs[0], x2: xs[1] }, 700); msg += ` The sliders now show x = ${vs(xs[0], xs[1])}.`; }
        else if (K.k === 'one') msg += ' The x sliders move in halves from −5 to 5, so they cannot show this x.';
        solMsg = msg; sync();
      };
      const verify = () => {
        const [px, py] = img(), r1 = px + st.b1, r2 = py + st.b2, zero = Math.abs(r1) < EPS && Math.abs(r2) < EPS;
        solMsg = `A x + b = (${pn(st.a11)}·${pn(st.x1)} + ${pn(st.a12)}·${pn(st.x2)} + ${pn(st.b1)}, ${pn(st.a21)}·${pn(st.x1)} + ${pn(st.a22)}·${pn(st.x2)} + ${pn(st.b2)}) = ${vs(r1, r2)}. ` +
          (zero ? ok('It is (0, 0), so x is a solution.') : no('It is not (0, 0), so x is not a solution.') + ` ${Math.abs(r1) < EPS ? 'Equation 1 holds' : 'Equation 1 fails'} and ${Math.abs(r2) < EPS ? 'equation 2 holds.' : 'equation 2 fails.'}`);
        sync();
      };

      /* ---------- predict, then see ---------- */
      let predCase = 1;
      const renderPredict = () => {
        prdBox.innerHTML = '';
        if (st.pred < 0) {
          prdBox.append(h('p', { class: 'hint' }, 'Commit to a guess about the number of solutions, then see the answer. Step 5 starts a prediction for you.'),
            h('button', { type: 'button', class: 'btn', onclick: () => startPred(predCase) }, 'Try a prediction'));
          return;
        }
        const c = CASES[st.pred], q = h('div', { class: 'ctl readout', style: 'border-top:0;padding-top:0' });
        q.innerHTML = `${kk('Prediction ' + (st.pred + 1) + ' of ' + CASES.length)}<br>Take ${c.show}. How many solutions does A x + b = 0 have?`;
        prdBox.append(q);
        PCHOICES.forEach((t, i) => {
          const done = st.predDone, mine = pd.picked === i, right = i === c.ans;
          const b = h('button', { type: 'button', class: 'btn', style: choiceStyle(done && right, done && mine && !right, done && !mine && !right), onclick: () => answerPred(i) }, (done && right ? '✓  ' : done && mine ? '✗  ' : '') + t);
          if (done) b.disabled = true;
          prdBox.append(b);
        });
        if (st.predDone) {
          const f = h('div', { class: 'ctl readout', style: 'border-top:0;padding-top:0', 'aria-live': 'polite' });
          f.innerHTML = (pd.picked === c.ans ? ok('Your prediction was right. ') : no('Not quite. ') + `You chose "${PCHOICES[pd.picked]}". The answer is "${PCHOICES[c.ans]}". `) + c.why;
          prdBox.append(f, h('button', { type: 'button', class: 'btn primary', onclick: () => startPred((st.pred + 1) % CASES.length) }, 'Another prediction'));
        }
      };
      const startPred = n => { setLock(false); pr.started = false; renderPractice(); applyPatch({ pred: n }, false); };
      const answerPred = i => {
        if (st.predDone) return;
        pd.picked = i; st.predDone = true; st.grid = true; st.sol = true; renderPredict();
        const xs = findSol(); cancel(); if (xs) glide({ x1: xs[0], x2: xs[1] }, 700);
        sync();
      };

      /* ---------- practice ---------- */
      C.title('Practice');
      const prBox = colBox(); hostEl.append(prBox);
      const nProb = PROB.length, solvedN = () => pr.solved.filter(Boolean).length;
      const btn = (label, fn, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: fn }, label);
      const startPractice = i => {
        pr.started = true; pr.i = i; pr.fb = ''; st.pred = -1; st.predDone = false; solMsg = ''; renderPredict();
        if (i < nProb) { setLock(true); applyPatch({ eq: true, ...PROB[i].setup }, false); } else setLock(false);
        renderPractice();
      };
      const checkSet = () => {
        const q = PROB[pr.i]; if (pr.solved[pr.i]) return;
        const [px, py] = img(), [t1, t2] = tgt(), hit = Math.hypot(px - t1, py - t2) < EPS;
        if (hit) { pr.solved[pr.i] = true; pr.fb = ok('Yes. ') + q.win; if (q.done) applyPatch(q.done, false); }
        else {
          const xOk = Math.abs(px - t1) < EPS, yOk = Math.abs(py - t2) < EPS;
          pr.fb = no('Not yet. ') + `x = ${vs(st.x1, st.x2)} gives A x = ${vs(px, py)}, not ${vs(t1, t2)}. Equation 1 gives ${nf(px)} and needs ${nf(t1)}${xOk ? ' (right)' : ' (wrong)'}. Equation 2 gives ${nf(py)} and needs ${nf(t2)}${yOk ? ' (right)' : ' (wrong)'}. ${q.tip}`;
        }
        renderPractice();
      };
      const pickProb = idx => {
        const q = PROB[pr.i], ch = q.choices[idx];
        if (pr.solved[pr.i] || pr.wrong[pr.i].includes(idx)) return;
        if (ch.show) applyPatch(ch.show, false);
        if (idx === q.ans) { pr.solved[pr.i] = true; pr.fb = ok('Yes. ') + ch.why; if (q.after && !ch.show) applyPatch(q.after, false); }
        else { pr.wrong[pr.i].push(idx); pr.fb = no('Not quite. ') + ch.why + ' Try another choice.'; }
        renderPractice();
      };
      const renderPractice = () => {
        prBox.innerHTML = '';
        const n = nProb, sv = solvedN();
        if (!pr.started) {
          prBox.append(h('p', { class: 'hint' }, sv ? `You have solved ${sv} of ${n}. The problems use the pictures and lock A and b.` : `${n} fixed problems. Each uses the pictures, with feedback that explains why.`),
            btn(sv ? 'Continue practice' : 'Start practice', () => startPractice(Math.min(pr.i, n - 1)), true));
          return;
        }
        if (pr.i >= n) {
          const d = h('div', { class: 'ctl readout', style: 'border-top:0;padding-top:0' });
          d.innerHTML = `${kk('Practice')} You solved ${sv} of ${n} problems.${sv < n ? ' Go back to any problem you skipped.' : ' Every problem solved.'}`;
          prBox.append(d, btn('Previous problem', () => startPractice(nProb - 1)), btn('Start again', () => { pr.solved = PROB.map(() => false); pr.wrong = PROB.map(() => []); startPractice(0); }, true));
          return;
        }
        const q = PROB[pr.i], head = h('div', { class: 'ctl readout', style: 'border-top:0;padding-top:0' });
        head.innerHTML = `${kk('Problem ' + (pr.i + 1) + ' of ' + n)} Solved ${sv} of ${n}<br>${q.q}`;
        prBox.append(head);
        if (q.kind === 'choice') {
          q.choices.forEach((ch, i) => {
            const solved = pr.solved[pr.i] && i === q.ans, bad = pr.wrong[pr.i].includes(i);
            prBox.append(h('button', { type: 'button', class: 'btn', style: choiceStyle(solved, bad, pr.solved[pr.i] && !solved), onclick: () => pickProb(i) }, (solved ? '✓  ' : bad ? '✗  ' : '') + ch.t));
          });
        } else prBox.append(btn('Check my x', checkSet, true));
        const fb = h('div', { class: 'ctl readout', style: 'border-top:0;padding-top:0', 'aria-live': 'polite' }); fb.innerHTML = pr.fb; prBox.append(fb);
        const row = h('div', { class: 'ctl buttons' });
        if (pr.i > 0) row.append(btn('Previous problem', () => startPractice(pr.i - 1)));
        row.append(btn(pr.i === n - 1 ? 'Finish' : 'Next problem', () => startPractice(pr.i + 1), pr.solved[pr.i]));
        prBox.append(row);
      };

      C.hint('Drag the x handle (top pane), the green and red arrow tips or the yellow target (bottom pane), or use the sliders: every drag has a slider.');
      renderPredict(); renderPractice();

      /* ---------- dragging ---------- */
      draggable(P1, {
        hit: (px, py) => (near(P1, st.x1, st.x2, px, py) ? 'x' : null),
        move: (hd, x, y) => { cancel(); solMsg = ''; st.x1 = clamp(snap(x, .5), -5, 5); st.x2 = clamp(snap(y, .5), -5, 5); sync(); }
      });
      draggable(P2, {
        hit: (px, py) => {
          if (locked) return null;
          const [t1, t2] = tgt();
          if (near(P2, t1, t2, px, py)) return 'tgt';
          if (near(P2, st.a12, st.a22, px, py)) return 'c2';
          if (near(P2, st.a11, st.a21, px, py)) return 'c1';
          return null;
        },
        move: (hd, x, y) => {
          cancel(); solMsg = '';
          const s = v => clamp(snap(v, 1), -4, 4);
          if (hd === 'c1') { st.a11 = s(x); st.a21 = s(y); }
          else if (hd === 'c2') { st.a12 = s(x); st.a22 = s(y); }
          else { st.b1 = clamp(0 - snap(x, 1), -8, 8); st.b2 = clamp(0 - snap(y, 1), -8, 8); }
          sync();
        }
      });

      /* ---------- step patches ---------- */
      const FLAGS = ['eq', 'grid', 'sol', 'pred'];
      const applyPatch = (patch, immediate) => {
        cancel(); solMsg = '';
        let nums = {}, flags = {};
        for (const k in patch) (FLAGS.includes(k) ? flags : nums)[k] = patch[k];
        if (flags.pred !== undefined) {
          st.pred = flags.pred; st.predDone = false; pd.picked = -1;
          if (st.pred >= 0) { const c = CASES[st.pred]; nums = { ...c.nums, ...nums }; flags.grid = false; flags.sol = false; predCase = (st.pred + 1) % CASES.length; }
          delete flags.pred; renderPredict();
        }
        Object.assign(st, flags);
        if (immediate) { Object.assign(st, nums); sync(); } else { glide(nums, 900); sync(); }
      };
      const apply = (patch, immediate) => {
        const changed = pr.started; pr.started = false; setLock(false);
        if (changed) renderPractice();
        resetRows();
        applyPatch(patch, immediate);
      };
      resetRows(); sync();
      return { destroy: () => { cancel(); P1.destroy(); P2.destroy(); }, apply };
    }
  });
}
