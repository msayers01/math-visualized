/* =====================================================================
   SCHOOL — Determinants and inverse matrices
   ===================================================================== */
{
  /* ---------- small helpers ---------- */
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;
  const nz = v => (Math.abs(v) < 1e-9 ? 0 : v);
  const nf = v => num(nz(Math.round(v * 1000) / 1000));
  /* a number as a fraction when it is a simple one (1/3), else a short decimal */
  const fr = v => {
    v = nz(v); if (v === 0) return '0';
    for (let q = 1; q <= 12; q++) {
      const n = Math.round(v * q);
      if (Math.abs(v * q - n) < 1e-6) return q === 1 ? num(n) : `${n < 0 ? '−' : ''}${Math.abs(n)}/${q}`;
    }
    return nf(v);
  };
  const pr = v => (v < -1e-9 ? `(${fr(v)})` : fr(v));
  const mul = (X, Y) => X.map(r => [0, 1].map(j => r[0] * Y[0][j] + r[1] * Y[1][j]));
  const mapPt = (M, q) => [M[0][0] * q[0] + M[0][1] * q[1], M[1][0] * q[0] + M[1][1] * q[1]];
  const detOf = M => nz(Math.round((M[0][0] * M[1][1] - M[0][1] * M[1][0]) * 1e6) / 1e6);
  const eqM = (X, Y) => X.every((r, i) => r.every((v, j) => Math.abs(v - Y[i][j]) < 1e-6));
  const I2 = () => [[1, 0], [0, 1]];
  const cp = M => M.map(r => r.slice());
  const invOf = M => { const D = detOf(M); return D === 0 ? null : [[M[1][1] / D, -M[0][1] / D], [-M[1][0] / D, M[0][0] / D]]; };
  const cen = P => [P.reduce((s, q) => s + q[0], 0) / P.length, P.reduce((s, q) => s + q[1], 0) / P.length];
  const mat = (M, col = 'blue') => `<span style="display:inline-grid;grid-template-columns:repeat(2,minmax(1.5em,auto));gap:1px 12px;padding:1px 9px;border-left:2.5px solid var(--${col});border-right:2.5px solid var(--${col});border-radius:7px;vertical-align:middle;text-align:center;line-height:1.35">${M.map(r => r.map(v => `<span>${fr(v)}</span>`).join('')).join('')}</span>`;
  const rowsT = M => `rows (${fr(M[0][0])}, ${fr(M[0][1])}) and (${fr(M[1][0])}, ${fr(M[1][1])})`;

  /* the letter F lives inside the unit square, so a flip is easy to see */
  const FIG = [[.15, .1], [.35, .1], [.35, .45], [.6, .45], [.6, .6], [.35, .6], [.35, .7], [.75, .7], [.75, .9], [.15, .9]];
  const TRI = [[0, 0], [2, 0], [0, 2]];
  const SQ = [[0, 0], [1, 0], [1, 1], [0, 1]];

  /* famous matrices */
  const FAM = [
    { id: 'id', label: 'Identity (does nothing)', M: [[1, 0], [0, 1]], note: 'The <b>identity</b> matrix. It moves nothing, so its determinant is 1 and it is its own inverse.' },
    { id: 'rot', label: 'Quarter turn (rotation)', M: [[0, -1], [1, 0]], note: 'A <b>rotation</b>: a quarter turn to the left. Turning does not change area, so det is 1. It has an inverse: turn back the other way.' },
    { id: 'shear', label: 'Shear (slide by height)', M: [[1, 1], [0, 1]], note: 'A <b>shear</b>: each point slides right by its height. The square leans over but keeps area 1, so det is 1. The inverse slides back left.' },
    { id: 'str', label: 'Stretch (x by 2, y by 3)', M: [[2, 0], [0, 3]], note: 'A <b>stretch</b>: x doubles, y triples, so areas grow 6 times. The inverse squeezes by 1/2 and 1/3.' },
    { id: 'mir', label: 'Mirror over y = x', M: [[0, 1], [1, 0]], note: 'A <b>mirror</b> over the line y = x. Size is kept but the F is flipped, so det is −1. Flipping twice undoes it: it is its own inverse.' },
    { id: 'proj', label: 'Projection onto the x-axis', M: [[1, 0], [0, 0]], note: 'A <b>projection</b>: every point drops straight onto the x-axis, so points above each other collide. det is 0 and there is no inverse.' }
  ];

  /* the four guided steps set the matrix and the view */
  const SETS = [
    { step: 1, a: 2, b: 1, c: 0, d: 1 },
    { step: 2, a: 2, b: 1, c: 1, d: 2 },
    { step: 3, a: 1, b: 2, c: 1, d: 1 },
    { step: 4, a: 1, b: -1, c: 1, d: 1 }
  ];

  /* predictions: the picture stays hidden until the student has committed to a choice */
  const PREDS = {
    2: [
      { A: [[2, 1], [1, 2]], q: 'The matrix has rows (2, 1) and (1, 2). The unit square has area 1. What is the area of the shape it becomes?',
        choices: [
          { t: '3', ok: true, why: 'The determinant is ad − bc = 2·2 − 1·1 = 3. The square becomes a parallelogram of area 3, and every shape would have its area multiplied by 3.' },
          { t: '4', why: 'You found ad = 2·2 = 4 and stopped. The other diagonal, bc = 1·1 = 1, has to be subtracted.' },
          { t: '5', why: 'That is ad + bc = 4 + 1. The determinant subtracts: ad − bc.' },
          { t: '2', why: 'That subtracts b and c one at a time (4 − 1 − 1). The formula subtracts the product bc = 1·1 = 1 once.' }] },
      { A: [[0, 1], [1, 0]], q: 'Now the rows are (0, 1) and (1, 0). The green and red arrows have traded places. Will the F come out as a mirror image?',
        choices: [
          { t: 'No. The F is only turned, still the same way round', why: 'A turn keeps red a quarter turn to the left of green. Here red is to the right of green, so the order is reversed.' },
          { t: 'Yes. It is a mirror image, and the determinant is negative', ok: true, why: 'The determinant is 0·0 − 1·1 = −1. The area is still 1, but the sign is negative: the F is flipped like a mirror image.' },
          { t: 'No. The F is squashed flat', why: 'A flat result would need area 0. Here ad − bc = −1, so the area is 1 and nothing is squashed.' }] }
    ],
    3: [
      { A: [[1, 2], [1, 1]], q: 'The rows are (1, 2) and (1, d). For now d = 1. Which value of d makes the determinant 0?',
        choices: [
          { t: 'd = 0', why: 'With d = 0 the first product ad is 0, but bc = 2·1 = 2 is still there. The determinant is −2.' },
          { t: 'd = 1', why: 'That is the value it has now: 1·1 − 2·1 = −1, not 0.' },
          { t: 'd = 2', ok: true, why: 'The determinant is 1·d − 2·1 = d − 2. It is 0 when d = 2. Then the columns (1, 1) and (2, 2) point the same way.' },
          { t: 'd = 3', why: 'That gives 1·3 − 2·1 = 1, close to 0 but not 0.' }] }
    ]
  };

  /* ---------- practice problems: a fixed list ---------- */
  const place = (list, pos) => { const r = list.find(x => x.ok), rest = list.filter(x => !x.ok), p = pos % (rest.length + 1); rest.splice(p, 0, r); return rest; };
  const PROBS = [
    { tag: 'Compute a determinant', A: [[3, 1], [2, 2]], free: [], view: { fill: true },
      q: 'A matrix has rows (3, 1) and (2, 2). What is its determinant?',
      choices: place([
        { t: '4', ok: true, why: 'ad − bc = 3·2 − 1·2 = 6 − 2 = 4. The unit square becomes a parallelogram of area 4.' },
        { t: '6', why: 'You found ad = 3·2 = 6 only. The determinant is ad − bc, so subtract bc = 1·2 = 2 as well.' },
        { t: '8', why: 'That adds the two products (6 + 2). The formula subtracts: 6 − 2 = 4.' },
        { t: '−4', why: 'That is bc − ad, the right numbers in the wrong order. The formula starts with ad: 6 − 2 = 4.' }], 2) },
    { tag: 'Invertible or not?', A: [[1, 1], [2, 4]], free: ['b'], view: { fill: true },
      q: 'The matrix has rows (1, k) and (2, 4). For which k does it have NO inverse? Use the stepper for the top right entry (it is k) to watch the square, then choose.',
      choices: place([
        { t: 'k = 2', ok: true, set: { b: 2 }, why: 'det = 1·4 − k·2 = 4 − 2k, which is 0 when k = 2. Then the columns (1, 2) and (2, 4) point the same way, so the square flattens onto a line and no matrix can undo it.' },
        { t: 'k = 1', set: { b: 1 }, why: 'With k = 1, det = 4 − 2 = 2. That is not 0, so the matrix has an inverse. (You copied the 1 from the matrix.)' },
        { t: 'k = 3', set: { b: 3 }, why: 'With k = 3, det = 4 − 6 = −2. Negative is fine: it only means the F is flipped. Only det = 0 blocks an inverse.' },
        { t: 'k = 4', set: { b: 4 }, why: 'With k = 4, det = 4 − 8 = −4. Not 0, so it has an inverse. (You copied the 4 from the matrix.)' }], 0) },
    { tag: 'Find the inverse', A: [[3, 1], [2, 1]], free: [], view: { inv: true },
      q: 'A matrix has rows (3, 1) and (2, 1). Which matrix is its inverse? Pick one, and the picture shows whether the violet F comes home.',
      choices: place([
        { t: 'rows (1, −1) and (−2, 3)', ok: true, G: [[1, -1], [-2, 3]], why: 'det = 3·1 − 1·2 = 1. Swap the two diagonal entries 3 and 1, and change the signs of the other two (1 and 2). Dividing by 1 changes nothing. The violet F lands exactly on the start.' },
        { t: 'rows (1, 1) and (2, 3)', G: [[1, 1], [2, 3]], why: 'You swapped 3 and 1 but forgot to change the signs of 1 and 2. The violet F does not come home.' },
        { t: 'rows (3, −1) and (−2, 1)', G: [[3, -1], [-2, 1]], why: 'You changed the signs of 1 and 2 but forgot to swap 3 and 1. The violet F does not come home.' },
        { t: 'rows (1, −2) and (−1, 3)', G: [[1, -2], [-1, 3]], why: 'The diagonal swap is right, but the entries 1 and 2 traded places. They must stay where they are (top right and bottom left) and only change sign. The violet F does not come home.' }], 3) },
    { tag: 'Area scale factor', A: [[1, 2], [2, 1]], free: [], view: { tri: true },
      q: 'A triangle has area 2. A matrix with rows (1, 2) and (2, 1) moves it. What is the area of the image?',
      choices: place([
        { t: '6', ok: true, why: 'det = 1·1 − 2·2 = −3. Areas are multiplied by |det| = 3, so the new area is 2 · 3 = 6. The minus sign only tells you the triangle is flipped.' },
        { t: '−6', why: 'An area is never negative. The sign of the determinant says the picture is flipped; the area scale factor is |−3| = 3, so the area is 6.' },
        { t: '5', why: 'You added 2 + 3. The determinant is a scale factor, so you multiply: 2 · 3 = 6.' },
        { t: '3', why: 'That is the scale factor, not the new area. Multiply it by the old area: 3 · 2 = 6.' }], 1) },
    { tag: 'Check an inverse', A: [[1, 1], [1, 2]], free: [], view: { inv: true }, G: [[2, 1], [-1, 1]],
      q: 'A student says the inverse of the matrix A with rows (1, 1) and (1, 2) is B, with rows (2, 1) and (−1, 1). Multiply A by B to check. What is AB, and what does it show?',
      choices: place([
        { t: 'AB has rows (1, 2) and (0, 3), so B is not the inverse', ok: true, why: 'Row by column: 1·2 + 1·(−1) = 1, 1·1 + 1·1 = 2, 1·2 + 2·(−1) = 0, 1·1 + 2·1 = 3. The result is not the identity, and the violet F does not come home. B has a wrong sign: the true inverse has rows (2, −1) and (−1, 1).' },
        { t: 'AB has rows (1, 0) and (0, 1), so B is the inverse', why: 'That would be true for an inverse, but the top right entry is 1·1 + 1·1 = 2, not 0.' },
        { t: 'AB has rows (2, 1) and (−1, 2), so B is not the inverse', why: 'That multiplies matching entries (1·2, 1·1, 1·(−1), 2·1). Matrix multiplication pairs a row with a column and adds: the top left entry is 1·2 + 1·(−1) = 1.' },
        { t: 'AB has rows (3, 2) and (0, 3), so B is not the inverse', why: 'That is A + B. The product pairs a row with a column and adds the products: the top left entry is 1·2 + 1·(−1) = 1.' }], 0) },
    { tag: 'Spot the mistake', A: [[1, 2], [1, 3]], free: [], view: { inv: true }, G: [[1, -1], [-2, 3]],
      q: 'A student finds the inverse of the matrix with rows (1, 2) and (1, 3). The determinant is 1·3 − 2·1 = 1. She writes rows (1, −1) and (−2, 3). The violet F shows what her matrix does. What went wrong?',
      choices: place([
        { t: 'She swapped the wrong entries. The diagonal entries 1 and 3 should trade places, and 2 and 1 should only change sign', ok: true, why: 'The inverse is rows (3, −2) and (−1, 1). She left 1 and 3 where they were and swapped the other two. The violet F does not come home, so her matrix does not undo A.' },
        { t: 'She forgot to divide by the determinant', why: 'The determinant is 1, and dividing by 1 changes nothing. The mistake is in which entries she swapped.' },
        { t: 'Nothing. Swap and negate always gives the inverse', why: 'The recipe is right but she used it on the wrong entries. The picture shows her matrix leaves the F away from the start.' },
        { t: 'The determinant should be 1·3 + 2·1 = 5', why: 'The determinant is ad − bc, so 1·3 − 2·1 = 1. Adding gives a wrong number.' }], 1) },
    { tag: 'Read the picture', A: [[0, 1], [1, 0]], free: [], view: { fill: true },
      q: 'The matrix with rows (0, 1) and (1, 0) turns the F into a mirror image of the same size. Which number could be its determinant?',
      choices: place([
        { t: '−1', ok: true, why: 'Same size means |det| = 1. A mirror image means the sign is negative. And 0·0 − 1·1 = −1.' },
        { t: '1', why: 'det = 1 would keep the F the same way round. A mirror image needs a negative determinant.' },
        { t: '0', why: 'det = 0 would squash the F flat. This F still has full size.' },
        { t: '2', why: 'det = 2 would double the area. The mirror F has the same size, so |det| = 1.' }], 0) }
  ];

  register({
    id: 'determinants-and-inverse-matrices', level: 'school',
    title: 'Determinants and inverse matrices',
    blurb: 'See a 2 by 2 matrix move the plane, find how it scales area, and learn when and how the move can be undone.',
    thumb(c, p) {
      const pal = p.pal; p.cx = .6; p.cy = .5; p.span = 3.2;
      p.grid(1);
      const M = [[1.6, .6], [.4, 1.3]];
      for (let k = -4; k <= 4; k++) {
        p.path([mapPt(M, [k, -4]), mapPt(M, [k, 4])], { stroke: alpha(pal.blue, .3), width: 1.3 });
        p.path([mapPt(M, [-4, k]), mapPt(M, [4, k])], { stroke: alpha(pal.blue, .3), width: 1.3 });
      }
      p.path(SQ, { stroke: alpha(pal.text, .4), width: 2, dash: [4, 4], close: true });
      p.path([[0, 0], mapPt(M, [1, 0]), mapPt(M, [1, 1]), mapPt(M, [0, 1])], { stroke: pal.yellow, fill: alpha(pal.yellow, .4), width: 2.5, close: true });
      p.arrow(0, 0, 1.6, .4, pal.green, 4); p.arrow(0, 0, .6, 1.3, pal.red, 4);
    },
    hook: String.raw`Press a photo of a letter F through a stretchy machine. It comes out bigger, leaning, or even flipped. Can you tell how much bigger from four numbers, and can you always run the machine backwards?`,
    steps: [
      { title: 'A matrix moves the plane',
        text: String.raw`<p>A <b>matrix</b> can be a machine that moves the whole plane. Its first column is where the <b style="color:var(--green)">green</b> arrow \((1, 0)\) lands. Its second column is where the <b style="color:var(--red)">red</b> arrow \((0, 1)\) lands. Here they land at \((2, 0)\) and \((1, 1)\). The grid, the unit square and the F ride along.</p><p><b>Your turn:</b> use the steppers or drag the rings so the F turns a quarter turn to the left.</p>`,
        set: SETS[0] },
      { title: 'The determinant is the area scale',
        text: String.raw`<p>The unit square has area 1. After the move it becomes a parallelogram. The number that multiplies every area is the <b>determinant</b>, \(ad-bc\) for rows \((a, b)\) and \((c, d)\).</p><p><b>Predict first:</b> choose the new area for the matrix shown, then see it. A negative determinant means the picture is flipped like a mirror.</p>`,
        set: SETS[1] },
      { title: 'When the determinant is 0',
        text: String.raw`<p>Squash a photo flat and you cannot get it back. A matrix with \(ad-bc=0\) does that: the square lands on a line or a point.</p><p><b>Predict:</b> for rows \((1, 2)\) and \((1, d)\), which \(d\) gives determinant 0? Then set d yourself. Different points will land on the same spot, so nothing can undo the move.</p>`,
        set: SETS[2] },
      { title: 'The inverse undoes the move',
        text: String.raw`<p>The <b>inverse</b> of A, written \(A^{-1}\), undoes A. The violet F is the blue F moved again by a second matrix G. Choose the four entries of G so the violet F lands back on the start.</p><p>Stuck? Press <b>Show the formula</b>. It gives \(A^{-1}\) and a check that \(A\) times \(A^{-1}\) is the identity.</p>`,
        set: SETS[3] }
    ],
    formal: String.raw`
      <h3>A matrix moves the plane</h3>
      <p>Write a point \((x,y)\) as a column. The matrix \(A=\begin{pmatrix} a & b \\ c & d \end{pmatrix}\) sends it to
      \[ \begin{pmatrix} a & b \\ c & d \end{pmatrix}\begin{pmatrix} x \\ y \end{pmatrix} = \begin{pmatrix} ax+by \\ cx+dy \end{pmatrix}. \]
      Put \((x,y)=(1,0)\) and you get \((a,c)\), the first column. Put \((0,1)\) and you get \((b,d)\), the second column. Every point is \(x\) steps along \((1,0)\) plus \(y\) steps along \((0,1)\), so it lands \(x\) steps along \((a,c)\) plus \(y\) steps along \((b,d)\). That is why grid lines stay straight, parallel and evenly spaced, and why the two columns tell you everything about the move.</p>
      <h3>The determinant is the area scale factor</h3>
      <p>The unit square has corners \((0,0)\), \((1,0)\), \((1,1)\), \((0,1)\). It lands on the parallelogram with corners \((0,0)\), \((a,c)\), \((a+b,\,c+d)\), \((b,d)\). Its area is the <b>determinant</b>
      \[ \det A = ad - bc. \]
      <em>Why.</em> Take a case where \(a,b,c,d\) are positive. Draw the box around the parallelogram, \(a+b\) wide and \(c+d\) tall, with area \((a+b)(c+d)=ac+ad+bc+bd\). Cut away the corners that are not part of the parallelogram: two triangles with area \(\tfrac12 ac\) each, two triangles with area \(\tfrac12 bd\) each, and two rectangles with area \(bc\) each. That removes \(ac+bd+2bc\). What is left is \(ad-bc\).</p>
      <p>Every small grid square lands on a copy of that parallelogram, so <em>every</em> shape has its area multiplied by \(|\det A|\). Example: for \(\begin{pmatrix} 2 & 1 \\ 1 & 3 \end{pmatrix}\), \(\det = 2\cdot3-1\cdot1=5\), so a triangle of area 2 becomes a triangle of area 10.</p>
      <h3>The sign</h3>
      <p>At the start the red arrow is a quarter turn to the left of the green arrow. If \(\det A&gt;0\) it stays on that side and the F keeps its handedness. If \(\det A&lt;0\) the arrows have changed sides and the picture is flipped like a mirror. The area scale factor is \(|\det A|\), because an area is never negative. Example: \(\begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}\) has \(\det=-1\): same size, flipped.</p>
      <h3>When the determinant is 0</h3>
      <p>If \(\det A=0\) the two columns point along the same line (or one is zero). The parallelogram has no width, so the whole plane lands on one line, or on one point. Take \(A=\begin{pmatrix} 1 & 2 \\ 3 & 6 \end{pmatrix}\). The points \((1,0)\) and \((3,-1)\) both land on \((1,3)\). For \((3,-1)\): row one gives \(1\cdot3+2\cdot(-1)=1\) and row two gives \(3\cdot3+6\cdot(-1)=3\). If two different inputs have the same output, no rule can tell which one you came from, so <b>no matrix can undo \(A\)</b>.</p>
      <h3>The inverse</h3>
      <p>The <b>identity</b> matrix \(I=\begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}\) moves nothing, and \(AI=IA=A\). The <b>inverse</b> of \(A\) is the matrix \(A^{-1}\) with \(AA^{-1}=A^{-1}A=I\). For a \(2\times2\) matrix with \(ad-bc\neq0\),
      \[ A^{-1} = \frac{1}{ad-bc}\begin{pmatrix} d & -b \\ -c & a \end{pmatrix}. \]
      <em>Why this works.</em> Multiply, using row times column:
      \[ \begin{pmatrix} a & b \\ c & d \end{pmatrix}\begin{pmatrix} d & -b \\ -c & a \end{pmatrix} = \begin{pmatrix} ad-bc & -ab+ba \\ cd-dc & -cb+da \end{pmatrix} = (ad-bc)\begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}. \]
      Swapping \(a\) and \(d\) and changing the signs of \(b\) and \(c\) gives a matrix that undoes the shape of the move but scales areas by \(\det A\) once more. Dividing by \(\det A\) removes that extra scaling. This matches the picture: \(A\) multiplies areas by \(\det A\), so the undo must multiply them by \(\tfrac{1}{\det A}\).</p>
      <p><em>Worked example.</em> \(A=\begin{pmatrix} 4 & 2 \\ 3 & 2 \end{pmatrix}\) has \(\det=4\cdot2-2\cdot3=2\). So
      \[ A^{-1}=\frac12\begin{pmatrix} 2 & -2 \\ -3 & 4 \end{pmatrix}=\begin{pmatrix} 1 & -1 \\ -1.5 & 2 \end{pmatrix}. \]
      Check: \(\begin{pmatrix} 4 & 2 \\ 3 & 2 \end{pmatrix}\begin{pmatrix} 1 & -1 \\ -1.5 & 2 \end{pmatrix}=\begin{pmatrix} 4-3 & -4+4 \\ 3-3 & -3+4 \end{pmatrix}=\begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}\).</p>
      <h3>Which matrices have inverses</h3>
      <p>A \(2\times2\) matrix has an inverse exactly when \(\det A\neq0\). A <b>rotation</b> has \(\det=1\) and is undone by turning back. A <b>shear</b> \(\begin{pmatrix} 1 & 1 \\ 0 & 1 \end{pmatrix}\) has \(\det=1\) and is undone by \(\begin{pmatrix} 1 & -1 \\ 0 & 1 \end{pmatrix}\). A <b>stretch</b> \(\begin{pmatrix} 2 & 0 \\ 0 & 3 \end{pmatrix}\) has \(\det=6\) and is undone by \(\begin{pmatrix} 1/2 & 0 \\ 0 & 1/3 \end{pmatrix}\). A <b>projection</b> onto the x-axis, \(\begin{pmatrix} 1 & 0 \\ 0 & 0 \end{pmatrix}\), has \(\det=0\): points above each other collide, so it has no inverse. A matrix with no zero entries can still have \(\det=0\), for example \(\begin{pmatrix} 2 & 6 \\ 1 & 3 \end{pmatrix}\).</p>
      <h3>Common mistakes</h3>
      <p>Computing \(ad+bc\) instead of \(ad-bc\). Swapping \(b\) and \(c\) instead of \(a\) and \(d\). Forgetting the factor \(\frac1{\det A}\). Giving an area a negative sign. This is the key tool for the next lesson: the system \(A\mathbf{x}=\mathbf{b}\) is solved by \(\mathbf{x}=A^{-1}\mathbf{b}\) when \(A^{-1}\) exists.</p>`,
    check: [
      { q: 'A 2 by 2 matrix has determinant 0. Which statement is true?',
        choices: ['Its inverse is the matrix with every entry 0.',
                  'It squashes the unit square onto a line or a point, so different points land in the same place and no matrix can undo it.',
                  'It leaves every point exactly where it was.',
                  'It flips the plane like a mirror but keeps every area the same.'], answer: 1,
        why: 'The determinant is the factor that multiplies areas. A factor of 0 means the unit square ends up with area 0: a line segment or a point. Then different points share a landing spot, and no inverse can tell which one you came from. Leaving every point where it was is the identity matrix, which has determinant 1. A mirror has determinant −1.',
        hint: 'The determinant multiplies every area. What shape has area 0?' },
      { q: 'Matrix A has rows (4, 2) and (3, 2). Its determinant is 4·2 − 2·3 = 2. Which matrix is the inverse of A?',
        choices: ['rows (2, −2) and (−3, 4)', 'rows (1, 1) and (1.5, 2)', 'rows (1, −1) and (−1.5, 2)', 'rows (1, −1.5) and (−1, 2)'], answer: 2,
        why: 'Swap the diagonal entries 4 and 2, change the signs of 2 and 3, then divide every entry by the determinant 2: rows (2, −2) and (−3, 4) become rows (1, −1) and (−1.5, 2). The first choice forgets to divide by 2. The second swaps but forgets the signs. The fourth has the right numbers with the top right and bottom left entries trading places. You can check: row 1 times column 1 is 4·1 + 2·(−1.5) = 1.',
        hint: 'Swap a and d, negate b and c, then divide everything by the determinant 2.' },
      { q: 'A student says: "The matrix with rows (2, 6) and (1, 3) has an inverse, because none of its entries is zero." Which reply is correct?',
        choices: ['He is wrong. The determinant is 2·3 − 6·1 = 0, so the matrix flattens the plane and has no inverse.',
                  'He is right. A matrix has an inverse when it has no zero entries.',
                  'He is wrong. The determinant is 2·3 + 6·1 = 12, so there is no inverse.',
                  'He is right. The determinant is 2·3 − 6·1 = 0, and 0 always gives an inverse.'], answer: 0,
        why: 'Whether an inverse exists depends on the determinant, not on zero entries. Here ad − bc = 6 − 6 = 0, so the second column (6, 3) is 3 times the first column (2, 1). Both arrows point along one line, the square flattens, and there is no inverse. The determinant uses subtraction, so 2·3 + 6·1 = 12 is not the determinant. And a determinant of 0 never gives an inverse.',
        hint: 'Compute ad − bc for rows (2, 6) and (1, 3). What does the answer tell you?' }
    ],
    links: { prereq: ['matrices'], next: ['solving-systems-with-matrices'], related: ['linear-transformations', 'rigid-motions-and-congruence', 'systems-of-equations', 'cramers-rule'] },

    mount({ stage, controls: C }) {
      const P = new Plane(stage, { span: 4.2 }), cv = P.canvas;
      if (P.coordEl) P.coordEl.style.display = 'none';
      cv.tabIndex = 0; cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', 'A 2 by 2 matrix moves a grid, the unit square and a letter F. The green arrow shows where (1, 0) lands and the red arrow shows where (0, 1) lands. Everything is also described in the panel next to the picture, and the entries can be set with the steppers.');

      /* ---------- state ---------- */
      const st = {
        a: 2, b: 1, c: 0, d: 1, step: 1, mode: 'explore', G: null, form: false, pd: { 2: 0, 3: 0 },
        pr: { rev: false, wrong: [], right: false },
        i: 0, tries: 0, done: false, rev: false, right: 0, finished: 0, last: 'g'
      };
      let cancelA = () => {};
      const A = () => [[st.a, st.b], [st.c, st.d]];
      const KEYS = ['a', 'b', 'c', 'd'];
      const show = (el, on) => { el.style.display = on ? '' : 'none'; };
      const predItem = () => (st.mode === 'explore' && PREDS[st.step] && st.pd[st.step] < PREDS[st.step].length ? PREDS[st.step][st.pd[st.step]] : null);
      const prob = () => PROBS[st.i];
      const isLocked = key => (st.mode === 'practice' ? !prob().free.includes(key) : !!predItem());
      const showDet = () => (st.mode === 'practice' ? st.rev : st.step >= 2 && (!predItem() || st.pr.rev));
      const view = () => {
        if (st.mode === 'practice') {
          const v = prob().view || {};
          return { fill: !!v.fill && st.rev, tri: !!v.tri, inv: !!v.inv && !!st.G, hud: st.rev && !v.inv, flat: false, label: st.rev };
        }
        const rev = !predItem() || st.pr.rev;
        if (st.step === 1) return { fill: false, tri: false, inv: false, hud: false, flat: false, label: false };
        if (st.step === 4) return { fill: false, tri: false, inv: true, hud: true, flat: false, label: false };
        return { fill: rev, tri: false, inv: false, hud: rev, flat: st.step === 3 && rev, label: rev };
      };

      /* ---------- drawing ---------- */
      const halo = (c, pal, s, x, y, color, size, align, weight) => {
        c.font = `${weight || 600} ${size}px "Hanken Grotesk","Helvetica Neue",Arial,sans-serif`; c.textAlign = align || 'left'; c.textBaseline = 'middle';
        c.lineWidth = 4; c.strokeStyle = pal.stage; c.lineJoin = 'round'; c.strokeText(s, x, y); c.fillStyle = color; c.fillText(s, x, y);
      };
      const nullVec = M => {
        const [[a, b], [c, d]] = M;
        if (Math.abs(b) > 1e-9 || Math.abs(a) > 1e-9) return [b, -a];
        if (Math.abs(d) > 1e-9 || Math.abs(c) > 1e-9) return [d, -c];
        return [0, 1];
      };
      P.onDraw = (c, p) => {
        const pal = p.pal, fs = clamp(p.scale * .55, 15, 20), M = A(), D = detOf(M), v = view();
        const [[a, b], [cc, d]] = M, tg = [a, cc], tr = [b, d];
        p.grid(1); p.ticks(1, { size: 15 });
        /* the carried grid */
        const R = 14;
        for (let k = -R; k <= R; k++) {
          const al = k === 0 ? .42 : .2, w = k === 0 ? 2 : 1.2;
          p.path([mapPt(M, [k, -R]), mapPt(M, [k, R])], { stroke: alpha(pal.blue, al), width: w });
          p.path([mapPt(M, [-R, k]), mapPt(M, [R, k])], { stroke: alpha(pal.blue, al), width: w });
        }
        const flat = D === 0, para = [[0, 0], tg, [a + b, cc + d], tr];
        if (flat && v.hud && (a || b || cc || d)) {
          const dir = Math.abs(a) + Math.abs(cc) > 0 ? tg : tr, n = Math.hypot(dir[0], dir[1]);
          p.path([[-dir[0] / n * 30, -dir[1] / n * 30], [dir[0] / n * 30, dir[1] / n * 30]], { stroke: alpha(pal.violet, .55), width: 5 });
        }
        if (v.tri) {
          p.path(TRI, { stroke: pal.yellow, fill: alpha(pal.yellow, .2), width: 2.2, close: true, dash: [6, 4] });
          const T2 = TRI.map(q => mapPt(M, q));
          p.path(T2, { stroke: pal.yellow, fill: alpha(pal.yellow, .4), width: 3, close: true });
          const g0 = cen(TRI), g1 = cen(T2);
          p.label('area 2', g0[0], g0[1], { size: fs, color: pal.text, italic: false, dx: 4, dy: 4 });
          if (v.label) p.label('area ' + fr(Math.abs(D) * 2), g1[0], g1[1], { size: fs, color: pal.text, italic: false });
          if (v.label && D < 0) p.label('flipped', g1[0], g1[1], { size: fs, color: pal.text, italic: false, dy: 20 });
        } else {
          /* unit square and its image */
          p.path(SQ, { stroke: alpha(pal.text, .4), fill: alpha(pal.yellow, v.fill ? .16 : 0), width: 1.8, dash: [4, 4], close: true });
          if (!v.inv) p.path(para, { stroke: v.fill ? pal.yellow : alpha(pal.blue, .7), fill: v.fill ? alpha(pal.yellow, .42) : alpha(pal.blue, .1), width: 2.6, close: true });
          if (v.fill && v.label) {
            const g = cen(para), fv = para[2], ux = fv[0] - g[0], uy = fv[1] - g[1], un = Math.hypot(ux, uy) || 1;
            p.label('area ' + fr(Math.abs(D)), fv[0], fv[1], { size: fs, color: pal.text, italic: false, dx: ux / un * 44, dy: -uy / un * 22 });
          }
          /* the F: start, after A, and after the guess G */
          const F1 = FIG.map(q => mapPt(M, q));
          p.path(FIG, { stroke: alpha(pal.blue, .55), fill: alpha(pal.blue, .08), width: 2.2, close: true });
          p.path(F1, { stroke: pal.blue, fill: alpha(pal.blue, .3), width: 3.2, close: true });
          if (v.inv && st.G) {
            const F2 = F1.map(q => mapPt(st.G, q)), back = F2.every((q, i) => Math.hypot(q[0] - FIG[i][0], q[1] - FIG[i][1]) < .02);
            p.path(F2, { stroke: pal.violet, fill: alpha(pal.violet, .2), width: 3, close: true, dash: [8, 5] });
            const top = Q => Q.reduce((m, q) => (q[1] > m[1] ? q : m), Q[0]);
            const t1 = top(F1), t2 = top(F2.map(q => [q[0], -q[1]]));
            p.label(back ? 'start = back home' : 'start', 0, 0, { size: fs, color: back ? pal.violet : pal.muted, italic: false, align: 'left', dx: 8, dy: 40 });
            p.label('after A', t1[0], t1[1], { size: fs, color: pal.blue, italic: false, dy: -20 });
            if (!back) p.label('after A, then G', t2[0], -t2[1], { size: fs, color: pal.violet, italic: false, dy: 20 });
          }
        }
        /* two points that collide */
        if (v.flat && flat) {
          const n = nullVec(M), P1 = [1, 0], Q1 = [1 + n[0], n[1]], L = mapPt(M, P1);
          if (Math.hypot(n[0], n[1]) > 1e-9) {
            p.path([P1, L], { stroke: alpha(pal.yellow, .8), width: 1.8, dash: [5, 5] }); p.path([Q1, L], { stroke: alpha(pal.yellow, .8), width: 1.8, dash: [5, 5] });
            p.dot(P1[0], P1[1], 7, pal.yellow, pal.stage, 2); p.dot(Q1[0], Q1[1], 7, pal.yellow, pal.stage, 2);
            p.label('P', P1[0], P1[1], { size: fs, color: pal.text, dx: -14, dy: 14 }); p.label('Q', Q1[0], Q1[1], { size: fs, color: pal.text, dx: 14, dy: 14 });
            p.dot(L[0], L[1], 9, alpha(pal.violet, .3), pal.violet, 2.5);
            p.label(`P′ = Q′ = (${fr(L[0])}, ${fr(L[1])})`, L[0], L[1], { size: fs, color: pal.text, italic: false, align: 'left', dx: 16, dy: 8 });
          }
        }
        /* the two arrows: faint start, bold landing */
        p.arrow(0, 0, 1, 0, alpha(pal.green, .4), 2.4); p.arrow(0, 0, 0, 1, alpha(pal.red, .4), 2.4);
        if (a || cc) p.arrow(0, 0, a, cc, pal.green, 4.2);
        if (b || d) p.arrow(0, 0, b, d, pal.red, 4.2);
        const near2 = Math.hypot(p.X(a) - p.X(b), p.Y(cc) - p.Y(d)) < 46;
        const lab = (q, color, side) => {
          const n = Math.hypot(q[0], q[1]), ux = n ? q[0] / n : 0, uy = n ? q[1] / n : 1;
          const txt = `(${fr(q[0])}, ${fr(q[1])})`, tw = txt.length * fs * .36;
          let dx = ux * (16 + tw), dy = -uy * 24;
          if (near2) { dx = side * (16 + tw); dy = side < 0 ? -22 : 22; }
          p.label(txt, q[0], q[1], { size: fs, color, italic: false, dx, dy });
        };
        if (!(v.flat && flat)) lab(tg, pal.green, -1);
        lab(tr, pal.red, 1);
        if (!KEYS.every(isLocked)) { p.dot(a, cc, 12, null, pal.brass, 2.6); p.dot(b, d, 12, null, pal.brass, 2.6); }
        /* readouts on the canvas */
        const fz = clamp(p.scale * .5, 13, 16);
        if (v.hud) {
          halo(c, pal, 'det = ' + fr(D), 24, 30, pal.text, fz + 3, 'left', 700);
          halo(c, pal, D > 0 ? 'F not flipped' : D < 0 ? 'F flipped (mirror)' : 'flat: no way back', 24, 30 + fz + 8, D < 0 ? pal.red : D === 0 ? pal.violet : pal.muted, fz, 'left', 600);
        }
        const by = p.h - 12;
        halo(c, pal, 'red arrow: where (0, 1) lands', 24, by - 10, pal.red, fz, 'left', 600);
        halo(c, pal, 'green arrow: where (1, 0) lands', 24, by - fz - 16, pal.green, fz, 'left', 600);
      };

      /* ---------- panel ---------- */
      const ro = C.readout(), host = ro.parentNode;
      host.removeChild(ro);
      const predBox = h('div', { style: 'display:flex;flex-direction:column;gap:8px' });
      const goalBox = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
      const choiceBtn = (label, fn) => { const b = h('button', { type: 'button', class: 'btn', style: 'border-radius:12px;text-align:left;justify-content:flex-start;width:100%;height:auto;min-height:44px;padding:9px 14px;white-space:normal;line-height:1.35', onclick: fn }, label); return b; };
      const rowBtns = list => { const row = h('div', { class: 'ctl buttons' }); const els = list.map(b => { const e = h('button', { type: 'button', class: b.primary ? 'btn primary' : 'btn', onclick: b.onClick }, b.label); row.append(e); return e; }); return { row, els }; };

      const stepCell = (name, sub, col, onStep) => {
        const out = h('output', { style: 'min-width:2.6em;text-align:center;font-weight:700;font-variant-numeric:tabular-nums' });
        const mk = (lab, dlt, aria) => h('button', { type: 'button', class: 'btn', style: 'min-height:38px;min-width:38px;padding:4px 8px', 'aria-label': aria, onclick: () => onStep(dlt) }, lab);
        const minus = mk('−', -.5, `Decrease ${name} by one half`), plus = mk('+', .5, `Increase ${name} by one half`);
        const el = h('div', { style: 'display:flex;flex-direction:column;gap:4px;align-items:center' },
          h('span', { style: 'font-size:.8rem;color:var(--muted)' }, h('b', { style: `color:var(--${col});font-size:1rem` }, name), ' ' + sub),
          h('div', { style: 'display:flex;gap:4px;align-items:center' }, minus, out, plus));
        return { el, out, minus, plus };
      };
      const matBox = h('div', { style: 'display:flex;flex-direction:column;gap:6px' });
      const cellInfo = { a: ['a', 'green, across', 'green'], b: ['b', 'red, across', 'red'], c: ['c', 'green, up', 'green'], d: ['d', 'red, up', 'red'] };
      const cells = {};
      KEYS.forEach(k => { cells[k] = stepCell(cellInfo[k][0], cellInfo[k][1], cellInfo[k][2], dl => stepKey(k, dl)); });
      const grid = h('div', { style: 'display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px 8px' }, cells.a.el, cells.b.el, cells.c.el, cells.d.el);
      const matNote = h('p', { class: 'hint', style: 'margin:0' }, '');
      matBox.append(h('p', { class: 'ctl-title', style: 'margin:0' }, 'Set the matrix A'), h('p', { class: 'hint', style: 'margin:0' }, 'Rows are (a, b) and (c, d). Drag the ring on each arrow tip, or use the steppers.'), grid, matNote);
      const famSel = C.select({ label: 'Try a famous matrix', value: '', options: [{ value: '', label: 'Choose one...' }, ...FAM.map(f => ({ value: f.id, label: f.label }))], onChange: v => { const f = FAM.find(x => x.id === v); if (f) setMatrix(f.M); } });
      const famBox = famSel.parentNode; host.removeChild(famBox);

      /* the guess G */
      const gBox = h('div', { style: 'display:flex;flex-direction:column;gap:6px' });
      const gNames = [['p', 'top left'], ['q', 'top right'], ['r', 'bottom left'], ['s', 'bottom right']];
      const gCells = gNames.map(([n, s], k) => stepCell(n, s, 'violet', dl => stepG(k >> 1, k & 1, dl)));
      const gGrid = h('div', { style: 'display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px 8px' }, ...gCells.map(x => x.el));
      const gBtns = rowBtns([{ label: 'Show the formula', onClick: () => { st.form = true; upd(); } }, { label: 'Use the formula', onClick: () => { const iv = invOf(A()); if (iv) { st.G = iv; st.form = true; upd(); } } }, { label: 'Reset my guess', onClick: () => { st.G = I2(); upd(); } }]);
      gBox.append(h('p', { class: 'ctl-title', style: 'margin:0' }, 'Your guess G, a second matrix applied after A'), gGrid, gBtns.row);

      host.append(predBox, goalBox, matBox, famBox, ro, gBox);

      /* ---------- practice controls ---------- */
      const gPrac = h('div', { style: 'display:flex;flex-direction:column;gap:12px' });
      host.append(gPrac);
      gPrac.append(h('p', { class: 'ctl-title', style: 'margin:8px 0 0' }, 'Practice'), h('p', { class: 'hint', style: 'margin:0' }, 'Seven short problems. Pick an answer and read why. It is just for you: nothing is scored or saved.'));
      const startR = rowBtns([{ label: 'Start practice', primary: true, onClick: () => { st.right = 0; st.finished = 0; loadProb(0); } }]);
      const pStatus = h('div', { class: 'ctl readout' }), pQ = h('div', { class: 'ctl readout' }), pFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
      const choiceB = [0, 1, 2, 3].map(i => { const b = choiceBtn('', () => pick(i)); return b; });
      const nextR = rowBtns([{ label: 'Next problem', primary: true, onClick: () => { if (st.i + 1 < PROBS.length) loadProb(st.i + 1); else { st.right = 0; st.finished = 0; loadProb(0); } } }, { label: 'Back to the lesson', onClick: () => leave() }]);
      const nextBtn = nextR.els[0];
      gPrac.append(startR.row, pStatus, pQ, ...choiceB, pFb, nextR.row);
      const pracEls = [pStatus, pQ, ...choiceB, pFb, nextR.row];

      /* ---------- matrix editing ---------- */
      const setNum = (k, v) => { st[k] = clamp(snap(v, .5), -5, 5); };
      const stepKey = (k, dl) => { if (isLocked(k)) return; cancelA(); setNum(k, st[k] + dl); upd(); };
      const stepG = (i, j, dl) => { if (!st.G) st.G = I2(); st.G[i][j] = clamp(snap(st.G[i][j] + dl, .5), -5, 5); upd(); };
      const setMatrix = M => {
        if (KEYS.some(isLocked)) return;
        cancelA(); cancelA = animateTo(st, { a: M[0][0], b: M[0][1], c: M[1][0], d: M[1][1] }, 700, upd, upd); upd();
      };
      const toMatrix = (M, ms) => { cancelA(); cancelA = animateTo(st, { a: M[0][0], b: M[0][1], c: M[1][0], d: M[1][1] }, ms || 800, upd, upd); };

      draggable(P, {
        hit: (px, py) => {
          const M = A(), g = Math.hypot(px - P.X(M[0][0]), py - P.Y(M[1][0])), r = Math.hypot(px - P.X(M[0][1]), py - P.Y(M[1][1]));
          const gOk = !isLocked('a') && !isLocked('c') && g < 24, rOk = !isLocked('b') && !isLocked('d') && r < 24;
          if (gOk && rOk) return (g === r ? (st.last === 'g' ? 'r' : 'g') : g < r ? 'g' : 'r');
          return gOk ? 'g' : rOk ? 'r' : null;
        },
        move: (id, x, y) => {
          cancelA(); st.last = id;
          const kx = id === 'g' ? 'a' : 'b', ky = id === 'g' ? 'c' : 'd';
          setNum(kx, x); setNum(ky, y); upd();
        }
      });

      /* ---------- the live text ---------- */
      const famNote = () => { const f = FAM.find(x => eqM(x.M, A())); return f; };
      const roHTML = () => {
        const M = A(), D = detOf(M), out = [];
        out.push(`${kk('Matrix A')} ${mat(M)}`);
        out.push(`${kk('Where the arrows land')} green (1, 0) lands at (${fr(st.a)}, ${fr(st.c)}). Red (0, 1) lands at (${fr(st.b)}, ${fr(st.d)}).`);
        if (showDet()) {
          out.push(`${kk('Determinant')} ad − bc = ${pr(st.a)}·${pr(st.d)} − ${pr(st.b)}·${pr(st.c)} = <b>${fr(D)}</b>`);
          if (D === 0) out.push(`${kk('The picture')} The unit square is flat: area 0. The whole plane lands on a line or a point.`);
          else out.push(`${kk('The picture')} The unit square (area 1) becomes a parallelogram of area <b>${fr(Math.abs(D))}</b>. ${D > 0 ? 'The F keeps its handedness.' : 'The F is flipped like a mirror.'}`);
          if (view().flat && D === 0 && st.mode === 'explore') {
            const n = nullVec(M), L = mapPt(M, [1, 0]);
            if (Math.hypot(n[0], n[1]) > 1e-9) out.push(`${kk('Collision')} P = (1, 0) and Q = (${fr(1 + n[0])}, ${fr(n[1])}) are different points, but both land at (${fr(L[0])}, ${fr(L[1])}). From there you cannot tell which one you came from.`);
          }
        }
        const f = famNote();
        if (f && st.mode === 'explore') { if (st.step === 1) out.push(`${kk('Famous')} ${f.label}.`); else if (!predItem() || st.pr.rev) out.push(`${kk('Famous')} ${f.note}`); }
        if (st.step === 4 && st.mode === 'explore' && st.form) {
          if (D === 0) out.push(`${kk('Inverse')} <b>None.</b> det A = 0, and the formula would divide by 0.`);
          else {
            const iv = invOf(M), ad = [[st.d, -st.b], [-st.c, st.a]];
            out.push(`${kk('The formula')} A<sup>−1</sup> = 1/(ad − bc) · rows (d, −b) and (−c, a) = 1/${fr(D)} · ${mat(ad)} = ${mat(iv, 'violet')}`);
            out.push(`${kk('Why')} A multiplies areas by ${fr(D)}, so the undo multiplies areas by 1/${fr(D)}. Swapping a and d and negating b and c makes the shape of the undo. Dividing by ${fr(D)} fixes its size.`);
            const prod = mul(M, iv), e = (i, j) => `${pr(M[i][0])}·${pr(iv[0][j])} + ${pr(M[i][1])}·${pr(iv[1][j])} = ${fr(prod[i][j])}`;
            out.push(`${kk('Check A × A<sup>−1</sup>')} row 1 · column 1: ${e(0, 0)}<br>row 1 · column 2: ${e(0, 1)}<br>row 2 · column 1: ${e(1, 0)}<br>row 2 · column 2: ${e(1, 1)}<br>Result: ${mat(prod)}${eqM(prod, I2()) ? ' the identity. A × A<sup>−1</sup> = I.' : ''}`);
          }
        }
        return out.join('<br>');
      };
      const goalHTML = () => {
        if (st.mode !== 'explore') return '';
        const M = A(), D = detOf(M), s = st.step;
        if (s === 1) {
          const gOk = st.a === 0 && st.c === 1, rOk = st.b === -1 && st.d === 0;
          if (gOk && rOk) return `${kk('Your turn')} ${ok('Yes.')} Green lands at (0, 1) and red at (−1, 0), so the matrix has columns (0, 1) and (−1, 0). That is a quarter turn to the left. Try your own move next: a stretch, a flip, a lean.`;
          const tail = gOk ? 'Green is right. Now send red to (−1, 0): b = −1 and d = 0.' : rOk ? 'Red is right. Now send green to (0, 1): a = 0 and c = 1.' : 'A quarter turn to the left sends green (1, 0) to (0, 1) and red (0, 1) to (−1, 0).';
          return `${kk('Your turn')} Make the F turn a quarter turn to the left. ${tail}`;
        }
        if (predItem()) return '';
        if (s === 2) {
          if (D === 6) return `${kk('Your turn')} ${ok('Yes.')} The determinant is ${pr(st.a)}·${pr(st.d)} − ${pr(st.b)}·${pr(st.c)} = 6, so the square becomes a shape of area 6. Many matrices do this. They differ in shape but not in area.`;
          return `${kk('Your turn')} Make the area exactly 6. Right now the determinant is ${fr(D)}${D < 0 ? ', which is negative, so the F is flipped. Aim for +6' : ''}. Change the entries until it is 6.`;
        }
        if (s === 3) {
          if (D === 0) return `${kk('Your turn')} ${ok('Yes.')} The determinant is 0 and the square is flat. Look at P and Q: different points, same landing spot. No matrix can undo that.`;
          return `${kk('Your turn')} Change d until the unit square flattens. Right now the determinant is ${fr(D)}, not 0.`;
        }
        /* step 4 */
        const G = st.G || I2(), GA = mul(G, M);
        if (D === 0) return `${kk('Your turn')} This A has determinant 0, so it has no inverse: no G can bring the F back. Change A to something with a determinant that is not 0.`;
        if (eqM(GA, I2())) return `${kk('Your turn')} ${ok('Yes.')} G undoes A. Applying A then G is G × A = ${mat(GA, 'violet')}, the identity. So G is the inverse of A. ${st.form ? '' : 'Press Show the formula to see why it works.'}`;
        let why = '';
        const k = GA[0][0];
        if (Math.abs(k) > 1e-6 && Math.abs(k - 1) > 1e-6 && eqM(GA, [[k, 0], [0, k]])) why = ` The F came back but scaled by ${fr(k)}. Divide every entry of G by ${fr(k)}.`;
        else if (eqM(G, I2())) why = ' G is the identity right now, so nothing was undone yet.';
        return `${kk('Your turn')} Not yet. Applying A then G is G × A = ${mat(GA, 'violet')}. The violet F lands on the start only when this is the identity.${why}`;
      };
      const roNow = () => { ro.innerHTML = roHTML(); goalBox.innerHTML = goalHTML(); };

      /* ---------- update (light) and builders (events) ---------- */
      const upd = () => {
        KEYS.forEach(k => { cells[k].out.textContent = nf(st[k]); const lk = isLocked(k); cells[k].minus.disabled = lk || st[k] <= -5; cells[k].plus.disabled = lk || st[k] >= 5; });
        const f = famNote(); famSel.value = f ? f.id : ''; famSel.disabled = KEYS.some(isLocked);
        matNote.textContent = KEYS.every(isLocked) ? 'The matrix is fixed for this question.' : st.mode === 'practice' ? 'Only the top right entry is free in this problem.' : '';
        if (st.mode === 'practice' && !KEYS.every(isLocked)) matNote.textContent = 'Only the top right entry (b) is free in this problem.';
        if (st.mode === 'explore' && predItem()) matNote.textContent = 'The matrix is locked until you answer the prediction.';
        const G = st.G || I2();
        gCells.forEach((x, k) => { const v = G[k >> 1][k & 1]; x.out.textContent = fr(v); x.minus.disabled = v <= -5; x.plus.disabled = v >= 5; });
        gBtns.els[1].disabled = detOf(A()) === 0;
        show(gBox, st.mode === 'explore' && st.step === 4);
        show(goalBox, st.mode === 'explore' && !!goalHTML());
        roNow(); P.requestDraw();
      };

      const buildPred = () => {
        predBox.innerHTML = '';
        const it = predItem();
        if (!it) { show(predBox, false); return; }
        show(predBox, true);
        const n = PREDS[st.step].length, k = st.pd[st.step];
        predBox.append(h('div', { class: 'ctl readout', html: `${kk(n > 1 ? `Predict first (${k + 1} of ${n})` : 'Predict first')}<br>${it.q}` }));
        const fb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        it.choices.forEach((ch, i) => {
          const done = st.pr.right && ch.ok, bad = st.pr.wrong.includes(i);
          const b = choiceBtn(done ? '✓  ' + ch.t : bad ? '✗  ' + ch.t : ch.t, () => {
            if (st.pr.right || st.pr.wrong.includes(i)) return;
            if (ch.ok) { st.pr.right = true; st.pr.rev = true; st.pr.msg = `${ok('Yes.')} ${ch.why}`; } else { st.pr.wrong.push(i); st.pr.msg = `${no('Not quite.')} ${ch.why} Try another choice.`; }
            buildPred(); upd();
          });
          if (st.pr.right && !ch.ok) b.style.opacity = '.55';
          if (done) b.style.borderColor = 'var(--green)'; if (bad) { b.style.borderColor = 'var(--red)'; b.style.color = 'var(--muted)'; }
          predBox.append(b);
        });
        fb.innerHTML = st.pr.msg || '';
        predBox.append(fb);
        if (st.pr.right) {
          const last = k + 1 >= n;
          const nb = rowBtns([{ label: last ? 'Now try it yourself' : 'Next prediction', primary: true, onClick: () => {
            st.pd[st.step] = k + 1; st.pr = { rev: false, wrong: [], right: false };
            const nx = predItem(); if (nx) toMatrix(nx.A);
            buildPred(); upd();
          } }]);
          predBox.append(nb.row);
        }
      };

      /* ---------- practice ---------- */
      const tally = () => {
        const fin = st.i + 1 === PROBS.length && st.done;
        pStatus.innerHTML = (fin ? `${kk('Finished.')} ` : `${kk(`Problem ${st.i + 1} of ${PROBS.length}.`)} `) +
          (st.finished ? `Right on the first try: <b>${st.right} of ${st.finished}</b>.` : 'Right on the first try: none answered yet.');
      };
      const showPrac = on => { pracEls.forEach(e => show(e, on)); show(startR.row, !on); if (!on) choiceB.forEach(b => show(b, false)); };
      const loadProb = i => {
        cancelA(); st.mode = 'practice'; st.i = i; st.tries = 0; st.done = false; st.rev = false; st.form = false;
        const pb = PROBS[i];
        st.G = null;
        toMatrix(pb.A, 500);
        showPrac(true);
        pQ.innerHTML = `${kk(pb.tag)}<br>${pb.q}`;
        choiceB.forEach((b, k) => { const ch = pb.choices[k]; show(b, !!ch); b.disabled = false; b.style.borderColor = ''; b.style.color = ''; b.style.opacity = ''; if (ch) b.textContent = ch.t; });
        nextBtn.disabled = true; nextBtn.textContent = i + 1 < PROBS.length ? 'Next problem' : 'Start again';
        pFb.innerHTML = ''; tally(); buildPred(); upd();
      };
      const leave = () => {
        cancelA(); st.mode = 'explore'; st.G = st.step === 4 ? I2() : null; st.form = false; st.pr = { rev: false, wrong: [], right: false };
        showPrac(false); toMatrix([[SETS[st.step - 1].a, SETS[st.step - 1].b], [SETS[st.step - 1].c, SETS[st.step - 1].d]]);
        buildPred(); upd();
      };
      const pick = k => {
        if (st.done) return;
        const pb = prob(), ch = pb.choices[k]; st.tries++;
        if (ch.G) st.G = cp(ch.G); else if (pb.G) st.G = cp(pb.G);
        if (ch.set) { toMatrix([[pb.A[0][0], ch.set.b ?? pb.A[0][1]], [pb.A[1][0], pb.A[1][1]]], 500); }
        if (ch.ok) {
          st.rev = true;
          pFb.innerHTML = `${ok('Correct.')} ${ch.why}${st.tries === 1 ? ' Right on the first try.' : ''}`;
          st.done = true; st.finished++; if (st.tries === 1) st.right++;
          nextBtn.disabled = false; choiceB.forEach((b, j) => { b.disabled = true; if (j === k) { b.style.borderColor = 'var(--green)'; b.style.color = 'var(--text)'; b.style.opacity = '1'; b.textContent = '✓  ' + ch.t; } });
          tally();
        } else {
          choiceB[k].disabled = true; choiceB[k].style.borderColor = 'var(--red)'; choiceB[k].style.color = 'var(--muted)'; choiceB[k].textContent = '✗  ' + ch.t;
          pFb.innerHTML = `${no('Not quite.')} ${ch.why} Try another answer.`;
        }
        upd();
      };

      /* ---------- steps ---------- */
      showPrac(false);
      const apply = (patch, immediate) => {
        cancelA();
        const { step, ...nums } = patch;
        if (st.mode === 'practice') { st.mode = 'explore'; showPrac(false); }
        st.step = step || st.step; st.form = false; st.G = st.step === 4 ? I2() : null;
        st.pr = { rev: false, wrong: [], right: false };
        const it = predItem(), tgt = it ? { a: it.A[0][0], b: it.A[0][1], c: it.A[1][0], d: it.A[1][1] } : nums;
        buildPred();
        if (immediate) { Object.assign(st, tgt); upd(); } else { cancelA = animateTo(st, tgt, 900, upd, upd); upd(); }
      };
      buildPred(); upd();
      return { destroy: () => { cancelA(); P.destroy(); }, apply };
    }
  });
}
