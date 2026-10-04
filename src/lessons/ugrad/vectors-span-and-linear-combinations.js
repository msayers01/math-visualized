/* =====================================================================
   UNDERGRADUATE (Linear Algebra) — Vectors, span and linear combinations
   ===================================================================== */
{
  /* ---------- numbers and words ---------- */
  const MINUS = '−';
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
  /* c1 a + c2 b, written the way a textbook would */
  const term = (c, s, first) => {
    if (c === 0) return '';
    const body = (Math.abs(c) === 1 ? '' : nf(Math.abs(c))) + s;
    return first ? (c < 0 ? MINUS : '') + body : (c < 0 ? ` ${MINUS} ` : ' + ') + body;
  };
  const lin = (c1, c2) => term(c1, 'a', true) + term(c2, 'b', c1 === 0) || '0';
  const FONT = '"Hanken Grotesk","Helvetica Neue",Arial,sans-serif';

  /* ---------- predict, then see: four fixed cases ---------- */
  const CASES = [
    { nums: { vx: 2, vy: 1, wx: -1, wy: 2, a: 1, b: 1 }, useW: true, ans: 2, show: 'v = (2, 1) and w = (−1, 2)',
      why: 'The two arrows point in different directions. The number D = v1·w2 − v2·w1 (the determinant, shown in the readout) is 2·2 − 1·(−1) = 5, which is not 0, so you can reach every point: the whole plane. The grid cells are parallelograms of area 5.' },
    { nums: { vx: 2, vy: 1, wx: 4, wy: 2, a: 1, b: 1 }, useW: true, ans: 1, show: 'v = (2, 1) and w = (4, 2)',
      why: 'Here w = 2v, so w points the same way as v and adds no new direction. D = 2·2 − 1·4 = 0. Every combination is a v + b(2v) = (a + 2b) v, a multiple of v: only a line.' },
    { nums: { vx: 2, vy: 1, wx: -1, wy: 2, a: 2, b: 0 }, useW: false, ans: 1, show: 'only v = (2, 1) (w is switched off)',
      why: 'With one vector the combinations are a v, the multiples of (2, 1). Negative a flips the arrow, so you get the whole line through the origin, and nothing off it.' },
    { nums: { vx: 1, vy: 2, wx: -1, wy: -2, a: 1, b: 1 }, useW: true, ans: 1, show: 'v = (1, 2) and w = (−1, −2)',
      why: 'w = −v points the opposite way, but it is still on the same line. D = 1·(−2) − 2·(−1) = 0. The combinations a v + b w = (a − b) v fill that one line.' }
  ];
  const PCHOICES = ['Just the origin', 'A line through the origin', 'The whole plane'];

  /* ---------- practice: seven fixed problems ---------- */
  const PROB = [
    { kind: 'choice', setup: { vx: 1, vy: 2, wx: 3, wy: -1, a: 0, b: 0, tgt: false, grid: false, useW: true },
      q: 'The green vector is v = (1, 2) and the red vector is w = (3, −1). What is the combination 2v + w?',
      ans: 2, after: { a: 2, b: 1 },
      choices: [
        { t: '(4, 1)', why: 'That is v + w. The 2 in front of v was dropped. Scale first: 2v = (2, 4).' },
        { t: '(8, 2)', why: 'That is 2v + 2w. The 2 multiplies v only, not w.' },
        { t: '(5, 3)', why: 'Scale, then add. 2v = (2, 4). Then add w = (3, −1): (2 + 3, 4 − 1) = (5, 3). The yellow point shows it.' },
        { t: '(−1, 5)', why: 'That is 2v − w. The problem adds w: (2 + 3, 4 + (−1)) = (5, 3).' }] },
    { kind: 'set', setup: { vx: 1, vy: 1, wx: -1, wy: 1, a: 0, b: 0, tx: 3, ty: 1, tgt: true, grid: false, useW: true },
      q: 'Set a and b so that a v + b w lands on the yellow target (3, 1). Here v = (1, 1) and w = (−1, 1). As a system: a − b = 3 and a + b = 1. Use the a and b sliders, or drag the yellow point, then press Check.',
      tip: 'Try adding the two equations: the b terms cancel.',
      win: 'Adding the equations gives 2a = 4, so a = 2. Then b = 1 − 2 = −1. Check: 2(1, 1) + (−1)(−1, 1) = (2, 2) + (1, −1) = (3, 1).' },
    { kind: 'choice', setup: { vx: 1, vy: 2, wx: 2, wy: 4, a: 0, b: 0, tgt: false, grid: false, useW: true },
      q: 'The green vector is v = (1, 2) and the red vector is w = (2, 4). Using any numbers a and b, which points can a v + b w reach?',
      ans: 3, after: { grid: true },
      choices: [
        { t: 'Only the origin', why: 'The origin comes from a = 0, b = 0, but a = 1, b = 0 gives v itself, so there are many more points.' },
        { t: 'Only the half line that starts at the origin and passes through v', why: 'Negative coefficients flip the arrow. With a = −1, b = 0 you reach (−1, −2), on the other side of the origin.' },
        { t: 'The whole plane', why: 'Two vectors fill the plane only if they point in different directions. Here w = 2v, and D = 1·4 − 2·2 = 0.' },
        { t: 'The whole line through the origin and v, and nothing else', why: 'Since w = 2v, a v + b w = (a + 2b) v. That is every multiple of v, including negative ones, so exactly the line.' }] },
    { kind: 'choice', setup: { vx: 1, vy: -2, wx: -2, wy: 4, a: 0, b: 0, tx: 3, ty: -6, tgt: true, grid: false, useW: true },
      q: 'The green vector is v = (1, −2) and the red vector is w = (−2, 4). Can you reach the yellow target (3, −6) with a combination a v + b w?',
      ans: 1, after: { a: 3, b: 0, grid: true },
      choices: [
        { t: 'No. Dependent vectors cannot reach anything except the origin.', why: 'They reach every point of the line they span, not only the origin.' },
        { t: 'Yes. The target lies on the line through the origin that v and w span, for example a = 3, b = 0.', why: 'w = −2v, so D = 1·4 − (−2)(−2) = 0 and the span is a line. The target (3, −6) = 3v is on that line. Many pairs work (a = 1, b = −1 also does), which is what dependent means.' },
        { t: 'No. You would need a negative b.', why: 'a = 3, b = 0 already works: 3v = (3, −6). Negative coefficients are allowed anyway.' },
        { t: 'Yes, but only if a and b are both positive.', why: 'a = 1, b = −1 works too: (1, −2) − (−2, 4) = (3, −6). Nothing forces a and b to be positive.' }] },
    { kind: 'choice', setup: { vx: 1, vy: 2, wx: 3, wy: 6, a: 0, b: 0, tgt: false, grid: false, useW: false },
      q: 'Which pair of vectors is linearly independent? Pick one. Pick a pair and the canvas will draw it with every combination using whole-number a and b.',
      ans: 0, after: {},
      choices: [
        { t: '(1, 2) and (2, 3)', show: { vx: 1, vy: 2, wx: 2, wy: 3, a: 0, b: 0, tgt: false, grid: true, useW: true }, why: 'D = 1·3 − 2·2 = −1, which is not 0. The first coordinates suggest (2, 3) = 2(1, 2), but the second would then be 4, not 3. Neither is a multiple of the other, so they are independent and the grid fills the plane.' },
        { t: '(1, 2) and (3, 6)', show: { vx: 1, vy: 2, wx: 3, wy: 6, a: 0, b: 0, tgt: false, grid: true, useW: true }, why: '(3, 6) = 3·(1, 2), a multiple of the first vector, so the pair is dependent (D = 1·6 − 2·3 = 0). The grid collapses to a line.' },
        { t: '(2, −1) and (−4, 2)', show: { vx: 2, vy: -1, wx: -4, wy: 2, a: 0, b: 0, tgt: false, grid: true, useW: true }, why: '(−4, 2) = −2·(2, −1), so the pair is dependent (D = 2·2 − (−1)(−4) = 0). Opposite directions are still on one line.' },
        { t: '(0, 0) and (1, 5)', show: { vx: 0, vy: 0, wx: 1, wy: 5, a: 0, b: 0, tgt: false, grid: true, useW: true }, why: 'The zero vector is always a combination of any other vector: (0, 0) = 0·(1, 5). So the pair is dependent (D = 0·5 − 0·1 = 0) and only a line is reached.' }] },
    { kind: 'choice', setup: { vx: 1, vy: 1, wx: 2, wy: 3, a: 0, b: 0, tx: 5, ty: 7, tgt: true, grid: false, useW: true },
      q: 'Three vectors in the plane: v = (1, 1) (green), w = (2, 3) (red) and u = (5, 7) (the yellow target). Are v, w and u linearly independent?',
      ans: 1, after: { a: 1, b: 2 },
      choices: [
        { t: 'Independent, because no two of them point the same way.', why: 'That only tests pairs. Independence asks that no vector is a combination of the others, and here u is one (see the right choice).' },
        { t: 'Dependent. u = v + 2w, so u is already in the span of v and w.', why: 'Solve a + 2b = 5 and a + 3b = 7: subtract to get b = 2, then a = 1. Check: (1, 1) + 2(2, 3) = (5, 7). The yellow point sits on the target. Any three vectors in a plane are dependent.' },
        { t: 'Independent, because u is different from v and from w.', why: 'Different is not the test. A vector can differ from the others and still be built from them.' },
        { t: 'Dependent. u = 2v + w.', why: '2v + w = (2, 2) + (2, 3) = (4, 5), not (5, 7). The correct coefficients come from a + 2b = 5 and a + 3b = 7.' }] },
    { kind: 'set', setup: { vx: 2, vy: 1, wx: 1, wy: -1, a: 0, b: 0, tx: 5, ty: 1, tgt: true, grid: false, useW: true },
      q: 'Solve the system 2a + b = 5 and a − b = 1 by moving the combination. The green vector is v = (2, 1), the red vector is w = (1, −1), and the target is (5, 1). Set a and b, then press Check.',
      tip: 'The two equations are the x and y coordinates of the combination. Try adding them.',
      win: 'Adding the equations gives 3a = 6, so a = 2, and then b = 5 − 4 = 1. Check: 2(2, 1) + 1(1, −1) = (4, 2) + (1, −1) = (5, 1).' }
  ];

  register({
    id: 'vectors-span-and-linear-combinations', level: 'ugrad',
    title: 'Vectors, span and linear combinations',
    blurb: 'Scale and add two arrows to reach points, see when they fill the plane and when they only trace a line, and meet linear independence.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 3.6;
      p.grid(1, { axes: true });
      const v = [1.5, .5], w = [-.5, 1.25];
      for (let i = -3; i <= 3; i++) {
        p.path([[i * v[0] - 5 * w[0], i * v[1] - 5 * w[1]], [i * v[0] + 5 * w[0], i * v[1] + 5 * w[1]]], { stroke: alpha(pal.violet, .5), width: 1.2 });
        p.path([[i * w[0] - 5 * v[0], i * w[1] - 5 * v[1]], [i * w[0] + 5 * v[0], i * w[1] + 5 * v[1]]], { stroke: alpha(pal.violet, .5), width: 1.2 });
      }
      p.path([[0, 0], v, [v[0] + w[0], v[1] + w[1]], w], { fill: alpha(pal.yellow, .25), close: true });
      p.arrow(0, 0, v[0], v[1], pal.green, 3.5);
      p.arrow(0, 0, w[0], w[1], pal.red, 3.5);
      p.dot(v[0] + w[0], v[1] + w[1], 5, pal.yellow, pal.text, 1.5);
    },
    hook: String.raw`A sailboat can only follow two fixed routes, forwards or backwards, for as long as it likes. Which harbours can it reach? And what if the two routes point the same way?`,
    steps: [
      { title: 'A vector is a trip',
        text: String.raw`<p>A <b>vector</b> is a trip: an arrow from the origin, or the two numbers that describe it. The <b style="color:var(--green)">green</b> arrow is \(v=(2,1)\): 2 right, 1 up. The <b style="color:var(--red)">red</b> arrow is \(w=(-1,2)\): 1 left, 2 up.</p><p>To add, walk \(v\) and then \(w\). You land at the yellow point \((2-1,\,1+2)=(1,3)\). Drag the arrow tips to change the vectors.</p>`,
        set: { vx: 2, vy: 1, wx: -1, wy: 2, a: 1, b: 1, tgt: false, grid: false, useW: true, pred: -1 } },
      { title: 'Scale, then add: reach a target',
        text: String.raw`<p>A <b>linear combination</b> is \(a v + b w\): stretch \(v\) by \(a\), stretch \(w\) by \(b\) (a negative number flips the arrow), then add.</p><p>Land on the target \((5,0)\) with the sliders \(a\) and \(b\). As equations: \(2a-b=5\) (x) and \(a+2b=0\) (y). Solving the system and hitting the target are the same job.</p>`,
        set: { vx: 2, vy: 1, wx: -1, wy: 2, a: 0, b: 0, tx: 5, ty: 0, tgt: true, grid: false, useW: true, pred: -1 } },
      { title: 'The span: all the points you can reach',
        text: String.raw`<p>The set of every point \(a v+b w\) is called the <b>span</b> of \(v\) and \(w\). The yellow point is now \(1v+1w\).</p><p><b>Predict first.</b> In the Predict box below, choose how much of the plane you think the span covers. Then the violet grid shows the points with whole-number \(a\) and \(b\). Each cell has area \(|D|=5\), where \(D=v_1w_2-v_2w_1\) is the number in the readout.</p>`,
        set: { tgt: false, pred: 0 } },
      { title: 'When the second vector adds nothing',
        text: String.raw`<p>Now \(w=(4,2)\), which is \(2v\). <b>Predict</b> how much of the plane the combinations reach, then look at the violet line.</p><p>The target \((5,0)\) is off that line. The system \(2a+4b=5\), \(a+2b=0\) has no solution: twice the second equation says \(2a+4b=0\). We call \(v\) and \(w\) <b>dependent</b>.</p>`,
        set: { tx: 5, ty: 0, tgt: true, pred: 1 } }
    ],
    formal: String.raw`
      <h3>Vectors, adding and scaling</h3>
      <p>In the plane a <b>vector</b> is an ordered pair \(v=(v_1,v_2)\). Draw it as an arrow from the origin to the point \((v_1,v_2)\). Two operations are all we need. <b>Adding</b> works coordinate by coordinate: \((v_1,v_2)+(w_1,w_2)=(v_1+w_1,\,v_2+w_2)\). In the picture, walk \(v\) and then \(w\), tip to tail. <b>Scaling</b> by a number (a <em>scalar</em>) \(c\) is \(c\,v=(cv_1,cv_2)\): the arrow stretches for \(|c|&gt;1\), shrinks for \(|c|&lt;1\) and flips for \(c&lt;0\).</p>
      <h3>Linear combinations and span</h3>
      <p>A <b>linear combination</b> of \(v\) and \(w\) is a vector \(a v+b w\) with scalars \(a\) and \(b\). The <b>span</b> of \(v\) and \(w\) is the set of all of them. The parallelogram picture is the whole construction: \(a v\) along the first side, \(b w\) along the second, and \(a v+b w\) at the far corner. The span always contains the origin (take \(a=b=0\)). The span of one nonzero vector is the line through the origin along it. The span of the zero vector alone is just the origin.</p>
      <h3>Reaching a target is solving a system</h3>
      <p>To reach a target \(t=(t_1,t_2)\) we need numbers \(a,b\) with \(a v+b w=t\). Reading off the two coordinates gives a system of two equations in two unknowns:
      \[ v_1 a+w_1 b=t_1, \qquad v_2 a+w_2 b=t_2. \]
      Multiply the first by \(w_2\), the second by \(w_1\) and subtract. The \(b\) terms cancel and
      \[ (v_1w_2-v_2w_1)\,a = t_1w_2-t_2w_1. \]
      Call \(D=v_1w_2-v_2w_1\). In the same way \(D\,b=v_1t_2-v_2t_1\). If \(D\neq 0\) there is exactly one solution for every target, \(a=\frac{t_1w_2-t_2w_1}{D}\) and \(b=\frac{v_1t_2-v_2t_1}{D}\), so the span is the whole plane. The number \(|D|\) is the area of the parallelogram with sides \(v\) and \(w\), which is one cell of the violet grid.</p>
      <p><em>Worked example.</em> For \(v=(2,1)\), \(w=(-1,2)\), \(t=(5,0)\): \(D=2\cdot2-1\cdot(-1)=5\), \(a=\frac{5\cdot 2-0\cdot(-1)}{5}=2\), \(b=\frac{2\cdot0-1\cdot5}{5}=-1\). Check: \(2v=(4,2)\) and \(-1\cdot w=(1,-2)\), and \((4,2)+(1,-2)=(5,0)\).</p>
      <h3>The case D = 0</h3>
      <p>Suppose \(D=0\) and \(v\neq 0\). Then \(w\) is a multiple of \(v\), say \(w=kv\): if \(v_1\neq0\) take \(k=w_1/v_1\), and \(D=0\) forces \(w_2=kv_2\) too (if \(v_1=0\) then \(v_2\neq0\); use \(k=w_2/v_2\)). Every combination is \(a v+b k v=(a+kb)\,v\), a multiple of \(v\), so the span is only a line. A target off that line has no solution, and a target on it has infinitely many (any \(a,b\) with \(a+kb\) the right value). For \(v=(2,1)\), \(w=(4,2)\), \(t=(5,0)\): subtracting 2 times equation 2 from equation 1 gives \(0=5\), a contradiction.</p>
      <h3>Linear independence</h3>
      <p>Vectors \(v_1,\dots,v_n\) are <b>linearly independent</b> if the only way to get \(c_1v_1+\cdots+c_nv_n=0\) is \(c_1=\cdots=c_n=0\). This says the same as: <b>no vector is a combination of the others</b>. Why: if some \(c_i\neq 0\) in a relation, divide by \(c_i\) and solve for \(v_i\) as a combination of the rest. Conversely, if \(v_i\) equals a combination of the rest, move everything to one side and the coefficient of \(v_i\) is \(1\), not zero. A list containing the zero vector is always dependent, since \(0=1\cdot\mathbf 0+0\cdot v\). In the plane, two vectors are independent exactly when \(D\neq 0\), which is also exactly when the system has one solution for every target.</p>
      <h3>Three vectors, and three dimensions</h3>
      <p>Any three vectors in the plane are dependent: two independent ones already span the plane, so the third is a combination of them (if no two are independent, all three lie on one line and are dependent anyway). In the lesson, \((5,7)=1\cdot(1,1)+2\cdot(2,3)\). In three dimensions the pattern continues in words. One nonzero vector spans a line through the origin. Two independent vectors span a plane through the origin, a flat sheet that is not all of space. Three independent vectors span all of 3D space, and the target equation becomes three equations in three unknowns. If the third vector lies in the plane of the first two, the three are dependent and the span is still only that plane.</p>
      <h3>Caveats</h3>
      <p>The span is always a point, line or plane <em>through the origin</em>, never a shifted one. Independence is about the whole list, not about pairs: vectors can be pairwise not parallel and still be dependent. When \(v\) and \(w\) are independent, the numbers \((a,b)\) are the <em>coordinates</em> of a point in the skewed grid made by \(v\) and \(w\). That idea, a different grid for the same plane, is the start of a basis.</p>`,
    check: [
      { q: 'Which statement is the correct meaning of "the vectors v and w in the plane are linearly independent"?',
        choices: ['They are perpendicular to each other.', 'Neither vector is a combination of the other: neither is a multiple of the other.', 'They have different lengths.', 'Their sum v + w is not the zero vector.'], answer: 1,
        why: String.raw`Independence means no vector can be built from the others. For two vectors in the plane that means neither is a multiple of the other, so they point along different lines. Nonzero perpendicular vectors are independent, but so are \((1,0)\) and \((1,1)\). Lengths do not matter: \((1,2)\) and \((2,4)\) have different lengths and are dependent. The sum \((3,6)\) of those two is not zero either.`,
        hint: String.raw`Test each statement on \(v=(1,2)\), \(w=(2,4)\). They are dependent. Which statements are still true for that pair?` },
      { q: 'Let v = (1, 2) and w = (3, 1). Find numbers a and b with a v + b w = (7, 4). Which pair (a, b) works?',
        choices: ['(a, b) = (2, 1)', '(a, b) = (4, 1)', '(a, b) = (7, 4)', '(a, b) = (1, 2)'], answer: 3,
        why: String.raw`The x coordinate gives \(a+3b=7\) and the y coordinate gives \(2a+b=4\). From the second, \(b=4-2a\). Put that in the first: \(a+12-6a=7\), so \(a=1\) and \(b=2\). Check: \(1(1,2)+2(3,1)=(7,4)\). The pair \((2,1)\) gives \((5,5)\). The pair \((4,1)\) fits only the x equation (it gives \((7,9)\)). The pair \((7,4)\) just copies the target and gives \((19,18)\).`,
        hint: String.raw`Write one equation for the x coordinates and one for the y coordinates, then eliminate one unknown. Test your answer in both equations.` },
      { q: 'A student decides whether v = (1, 2) and w = (3, 5) are linearly independent. Step 1: "The first coordinates satisfy 3 = 3·1, so try w = 3v." Step 2: "So w is a multiple of v, the vectors are dependent, and their span is only a line." Which statement is correct?',
        choices: ['Both steps are correct.', 'Step 1 is wrong: the first coordinates are different (1 and 3), so the vectors are independent.', 'Step 2 is wrong: a multiple must work in both coordinates, and 3·2 = 6 is not 5, so the vectors are independent and span the whole plane.', 'Step 2 is wrong: the vectors are dependent, but their span is the whole plane.'], answer: 2,
        why: String.raw`Step 1 only checks the first coordinate. Step 2 never checks the second: \(3v=(3,6)\neq(3,5)\), so \(w\) is not a multiple of \(v\). Equivalently \(D=1\cdot5-2\cdot3=-1\neq0\), so the vectors are independent and span the plane. The choice that blames Step 1 reaches the right conclusion for the wrong reason: different numbers can still be a multiple. Dependent vectors always span only a line, never the plane.`,
        hint: String.raw`A vector is a multiple of another only if one number \(k\) works in both coordinates. Compute \(3v\) fully and compare it with \(w\).` }
    ],
    links: { related: ['linear-transformations', 'systems-of-equations', 'solving-systems-by-elimination', 'matrices', 'determinants-and-inverse-matrices', 'solving-systems-with-matrices'] },

    mount({ stage, controls: C }) {
      const P = new Plane(stage, { span: 8 }), cv = P.canvas;
      if (P.coordEl) P.coordEl.style.display = 'none';
      cv.tabIndex = 0; cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', 'A plane with a green vector v, a red vector w and the yellow point a v + b w. All of it can be set with the sliders in the panel, which also read out the numbers.');

      const st = { vx: 2, vy: 1, wx: -1, wy: 2, a: 1, b: 1, tx: 5, ty: 0, useW: true, grid: false, tgt: false, pred: -1, predDone: false };
      let cancel = () => {}, locked = false, solMsg = '';
      const pd = { picked: -1 };
      const pr = { started: false, i: 0, solved: PROB.map(() => false), wrong: PROB.map(() => []), fb: '' };

      /* ---------- the mathematics of the current state ---------- */
      const W = () => (st.useW ? [st.wx, st.wy] : [0, 0]);
      const Bc = () => (st.useW ? st.b : 0);
      const det = () => { const [wx, wy] = W(); return st.vx * wy - st.vy * wx; };
      const point = () => { const [wx, wy] = W(); return [st.a * st.vx + Bc() * wx, st.a * st.vy + Bc() * wy]; };
      const kind = () => {
        const [wx, wy] = W();
        if (Math.abs(det()) > 1e-9) return { k: 'plane' };
        if (Math.abs(st.vx) + Math.abs(st.vy) > 1e-9) return { k: 'line', dx: st.vx, dy: st.vy, d: 'v' };
        if (Math.abs(wx) + Math.abs(wy) > 1e-9) return { k: 'line', dx: wx, dy: wy, d: 'w' };
        return { k: 'point' };
      };
      const hidden = () => st.pred >= 0 && !st.predDone;

      /* ---------- drawing ---------- */
      const note = (c, p, s, color) => {
        c.font = `600 ${clamp(p.scale * .62, 12.5, 15.5)}px ${FONT}`; c.textAlign = 'left'; c.textBaseline = 'top';
        c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(s, 12, 10); c.fillStyle = color; c.fillText(s, 12, 10);
      };
      const tag = (p, s, x, y, ux, uy, color, side = 0) => {
        const len = Math.hypot(ux, uy) || 1, off = clamp(p.scale * .95, 17, 26), ox = ux / len, oy = uy / len;
        const dx = ox * .55 + side * -oy, dy = oy * .55 + side * ox, dl = Math.hypot(dx, dy) || 1;
        const size = clamp(p.scale * .85, 15, 19), cx = p.ctx; cx.font = `500 ${size * .85}px ${FONT}`;
        const hw = cx.measureText(s).width / 2 + 6;
        let ddx = dx / dl * off * 1.5; const px = p.X(x) + ddx;
        if (px < hw) ddx += hw - px; else if (px > p.w - hw) ddx -= px - (p.w - hw);
        p.label(s, x, y, { size, italic: false, color, dx: ddx, dy: -dy / dl * off });
      };
      P.onDraw = (c, p) => {
        const pal = p.pal, bd = p.bounds(), K = kind(), [wx, wy] = W(), B = Bc(), D = det();
        p.grid(1); p.ticks(1);
        const [px, py] = point(), ax = st.a * st.vx, ay = st.a * st.vy, bx = B * wx, by = B * wy;
        const showGrid = st.grid && !hidden();
        if (showGrid) {
          const big = 60;
          if (K.k === 'plane') {
            c.fillStyle = alpha(pal.violet, .07); c.fillRect(0, 0, p.w, p.h);
            for (let i = -14; i <= 14; i++) {
              p.path([[i * st.vx - big * wx, i * st.vy - big * wy], [i * st.vx + big * wx, i * st.vy + big * wy]], { stroke: alpha(pal.violet, .38), width: 1.2 });
              p.path([[i * wx - big * st.vx, i * wy - big * st.vy], [i * wx + big * st.vx, i * wy + big * st.vy]], { stroke: alpha(pal.violet, .38), width: 1.2 });
            }
            p.path([[0, 0], [st.vx, st.vy], [st.vx + wx, st.vy + wy], [wx, wy]], { fill: alpha(pal.yellow, .2), close: true });
          } else if (K.k === 'line') {
            const L = Math.hypot(K.dx, K.dy);
            p.path([[-big * K.dx / L, -big * K.dy / L], [big * K.dx / L, big * K.dy / L]], { stroke: alpha(pal.violet, .5), width: 7 });
          }
          for (let i = -8; i <= 8; i++) for (let j = -8; j <= 8; j++) {
            const x = i * st.vx + j * wx, y = i * st.vy + j * wy;
            if (x < bd.x0 || x > bd.x1 || y < bd.y0 || y > bd.y1) continue;
            p.dot(x, y, 3.4, alpha(pal.violet, .95));
          }
          if (K.k === 'point') p.dot(0, 0, 7, alpha(pal.violet, .95));
        }
        /* the parallelogram construction */
        if (st.useW && Math.abs(ax * by - ay * bx) > 1e-9) p.path([[0, 0], [ax, ay], [px, py], [bx, by]], { fill: alpha(pal.yellow, .16), close: true });
        if (Math.hypot(ax, ay) > 1e-9) p.path([[0, 0], [ax, ay]], { stroke: alpha(pal.green, .38), width: 9 });
        if (Math.hypot(bx, by) > 1e-9) p.path([[ax, ay], [px, py]], { stroke: alpha(pal.red, .38), width: 9 });
        if (Math.hypot(bx, by) > 1e-9 && Math.hypot(ax, ay) > 1e-9) {
          p.path([[0, 0], [bx, by]], { stroke: alpha(pal.red, .6), width: 1.8, dash: [5, 5] });
          p.path([[bx, by], [px, py]], { stroke: alpha(pal.green, .6), width: 1.8, dash: [5, 5] });
        }
        if (Math.hypot(st.vx, st.vy) > 1e-9) p.arrow(0, 0, st.vx, st.vy, pal.green, 3.5);
        if (st.useW && Math.hypot(st.wx, st.wy) > 1e-9) p.arrow(0, 0, st.wx, st.wy, pal.red, 3.5);
        /* target */
        if (st.tgt) {
          const hit = Math.hypot(px - st.tx, py - st.ty) < 1e-9;
          p.dot(st.tx, st.ty, 12, hit ? alpha(pal.yellow, .35) : null, pal.yellow, 3);
          p.path([[st.tx - .22, st.ty], [st.tx + .22, st.ty]], { stroke: pal.yellow, width: 2 });
          p.path([[st.tx, st.ty - .22], [st.tx, st.ty + .22]], { stroke: pal.yellow, width: 2 });
          p.label((hit ? 'hit! ' : 'target ') + vs(st.tx, st.ty), st.tx, st.ty, { size: clamp(p.scale * .85, 15, 19), italic: false, color: pal.text, dx: 0, dy: -26 });
        }
        /* handles and labels */
        p.dot(px, py, 8, pal.yellow, pal.brass, 3);
        if (Math.hypot(st.vx, st.vy) > 1e-9) { p.dot(st.vx, st.vy, 7, pal.green, pal.brass, 3); tag(p, 'v ' + vs(st.vx, st.vy), st.vx, st.vy, st.vx, st.vy, pal.green, -1); }
        if (st.useW && Math.hypot(st.wx, st.wy) > 1e-9) { p.dot(st.wx, st.wy, 7, pal.red, pal.brass, 3); tag(p, 'w ' + vs(st.wx, st.wy), st.wx, st.wy, st.wx, st.wy, pal.red, 1); }
        const near1 = Math.hypot(px - st.vx, py - st.vy) < .3 || (st.useW && Math.hypot(px - st.wx, py - st.wy) < .3);
        if (!near1) tag(p, 'p ' + vs(px, py), px, py, px || .01, py, pal.text);
        if (showGrid) note(c, p, K.k === 'plane' ? 'Span: the whole plane, grid cell area ' + nf(Math.abs(D)) : K.k === 'line' ? 'Span: only a line through the origin' : 'Span: only the origin', pal.violet);
      };

      /* ---------- panel ---------- */
      const choiceStyle = (solved, bad, dim) => `justify-content:flex-start;text-align:left;border-radius:10px;padding:10px 14px;width:100%;min-height:44px;line-height:1.35;white-space:normal;${solved ? 'border-color:var(--green);color:var(--text);' : ''}${bad ? 'border-color:var(--red);color:var(--muted);' : ''}${dim ? 'opacity:.55;pointer-events:none;' : ''}`;
      const colBox = () => h('div', { style: 'display:flex;flex-direction:column;gap:8px' });
      C.title('Combination a v + b w');
      const S = {}, sliderInputs = [];
      const probe = C.readout(), hostEl = probe.parentNode; probe.remove();
      const mk = (key, label, min, max, step, lockable) => {
        S[key] = C.slider({ label, min, max, step, value: st[key], format: v => nf(v), onInput: v => { cancel(); st[key] = v; solMsg = ''; sync(); } });
        if (lockable) sliderInputs.push(hostEl.lastElementChild.querySelector('input'));
      };
      mk('a', 'Coefficient a (scales v)', -3, 3, .5);
      mk('b', 'Coefficient b (scales w)', -3, 3, .5);
      const tW = C.toggle({ label: 'Include w', value: st.useW, onChange: v => { cancel(); st.useW = v; solMsg = ''; sync(); } });
      const tG = C.toggle({ label: 'Show every point with whole-number a and b (the span)', value: st.grid, onChange: v => { st.grid = v; sync(); } });
      const tT = C.toggle({ label: 'Show a target', value: st.tgt, onChange: v => { st.tgt = v; solMsg = ''; sync(); } });
      const ro = C.readout();
      C.title('Predict, then see');
      const prdBox = colBox(); hostEl.append(prdBox);
      C.title('Vectors');
      mk('vx', 'v, right (x)', -4, 4, 1, true); mk('vy', 'v, up (y)', -4, 4, 1, true);
      mk('wx', 'w, right (x)', -4, 4, 1, true); mk('wy', 'w, up (y)', -4, 4, 1, true);
      C.title('Target');
      mk('tx', 'Target, right (x)', -8, 8, 1, true); mk('ty', 'Target, up (y)', -8, 8, 1, true);
      const solveBtn = C.buttons([{ label: 'Show a solution', onClick: () => solve() }])[0];
      const solEl = C.readout(); solEl.style.borderTop = '0'; solEl.style.paddingTop = '0';

      const lockables = [...sliderInputs, tW];
      const setLock = v => { locked = v; lockables.forEach(e => { e.disabled = v; }); };

      const upd = () => {
        const [wx, wy] = W(), [px, py] = point(), D = det(), K = kind(), B = Bc();
        let s = `${kk('Vectors')} v = ${vs(st.vx, st.vy)}${st.useW ? `, w = ${vs(st.wx, st.wy)}` : ' (w is off)'}<br>`;
        s += `${kk('Combination')} ${st.useW ? `${nf(st.a)}·v + ${nf(B)}·w` : `${nf(st.a)}·v`} = ${vs(px, py)}`;
        if (st.tgt) {
          const hit = Math.hypot(px - st.tx, py - st.ty) < 1e-9;
          s += `<br>${kk('Target')} ${vs(st.tx, st.ty)}: solve<br>`;
          s += `${lin(st.vx, wx)} = ${nf(st.tx)} (you get ${nf(px)})<br>${lin(st.vy, wy)} = ${nf(st.ty)} (you get ${nf(py)})`;
          if (hit) s += `<br>${ok('Hit.')} a = ${nf(st.a)}${st.useW ? `, b = ${nf(B)}` : ''} solves the system.`;
          else if (!hidden() && K.k !== 'plane') {
            const dx = K.k === 'line' ? K.dx : 0, dy = K.k === 'line' ? K.dy : 0;
            if (Math.abs(dx * st.ty - dy * st.tx) > 1e-9 || K.k === 'point' && (st.tx || st.ty)) s += `<br>${no('Unreachable.')} The target is not on the span, so no a and b work.`;
          }
        }
        const probSet = pr.started && PROB[pr.i] && (PROB[pr.i].kind === 'set' || pr.solved[pr.i]);
        if (!hidden() && (st.grid || st.pred >= 0 || probSet)) {
          const ex = `${pn(st.vx)}·${pn(wy)} − ${pn(st.vy)}·${pn(wx)} = ${nf(D)}`;
          s += `<br>${kk('Independent?')} D = ${ex}. `;
          if (Math.abs(D) > 1e-9) s += 'Not 0: independent, the span is the whole plane.';
          else if (!st.useW) s += K.k === 'point' ? 'v is the zero vector: the span is one point.' : 'With one vector the span is a line.';
          else if (K.k === 'point') s += 'Both vectors are zero: dependent, the span is one point.';
          else if (Math.abs(st.vx) + Math.abs(st.vy) < 1e-9) s += 'v is the zero vector: dependent, the span is a line.';
          else {
            const dd = st.vx * st.vx + st.vy * st.vy, kn = wx * st.vx + wy * st.vy;
            s += `Zero: dependent, w = ${fr(kn, dd)}·v and the span is a line.`;
          }
        }
        ro.innerHTML = s; solEl.innerHTML = solMsg;
      };
      const sync = () => {
        for (const k of ['a', 'b', 'vx', 'vy', 'wx', 'wy', 'tx', 'ty']) S[k].set(st[k]);
        tW.checked = st.useW; tG.checked = st.grid; tT.checked = st.tgt;
        upd(); P.draw();
      };

      /* ---------- show a solution (and why it may not exist) ---------- */
      const solve = () => {
        if (!st.tgt) { st.tgt = true; }
        const [wx, wy] = W(), D = det(), K = kind();
        let msg;
        if (Math.abs(D) > 1e-9) {
          const an = st.tx * wy - st.ty * wx, bn = st.vx * st.ty - st.vy * st.tx, a = an / D, b = bn / D;
          msg = `${ok('One solution.')} D = ${nf(D)} is not 0, so a = ${fr(an, D)} and b = ${fr(bn, D)}.`;
          const half = x => Math.abs(x * 2 - Math.round(x * 2)) < 1e-9 && Math.abs(x) <= 3;
          if (half(a) && half(b)) { cancel(); cancel = animateTo(st, { a, b }, 700, sync); }
          else msg += ' The sliders move in steps of 0.5 within −3 to 3, so they cannot show this pair.';
        } else if (K.k === 'line') {
          const cross = K.dx * st.ty - K.dy * st.tx;
          if (Math.abs(cross) > 1e-9) msg = `${no('No solution.')} D = 0, so the span is only a line, and the target is not on it. The equations contradict each other.`;
          else {
            const kn = st.tx * K.dx + st.ty * K.dy, dd = K.dx * K.dx + K.dy * K.dy, kv = fr(kn, dd);
            msg = `${ok('Infinitely many solutions.')} D = 0 and the target is on the line. For example ${K.d === 'v' ? `a = ${kv}${st.useW ? ', b = 0' : ''}` : `a = 0, b = ${kv}`}. Many pairs reach the same point.`;
          }
        } else {
          const who = st.useW ? 'Both vectors are zero' : 'v is the zero vector';
          msg = (st.tx || st.ty) ? `${no('No solution.')} ${who}, so only the origin is reachable.` : `${who}. ${st.useW ? 'Every a and b reaches' : 'Every a reaches'} the target, the origin.`;
        }
        solMsg = msg; sync();
      };

      /* ---------- predict, then see ---------- */
      let predCase = 0;
      const renderPredict = () => {
        prdBox.innerHTML = '';
        if (st.pred < 0) {
          prdBox.append(h('p', { class: 'hint' }, 'Commit to a guess about the span, then see the answer. The steps 3 and 4 start a prediction for you.'),
            h('button', { type: 'button', class: 'btn', onclick: () => startPred(predCase) }, 'Try a prediction'));
          return;
        }
        const c = CASES[st.pred], q = h('div', { class: 'ctl readout', style: 'border-top:0;padding-top:0' });
        q.innerHTML = `${kk('Prediction ' + (st.pred + 1) + ' of ' + CASES.length)}<br>Take ${c.show}. How much of the plane can the combinations a v + b w reach?`;
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
      const startPred = n => {
        setLock(false); pr.started = false; renderPractice();
        applyPatch({ tgt: false, pred: n }, false);
      };
      const answerPred = i => {
        if (st.predDone) return;
        pd.picked = i; st.predDone = true; st.grid = true; renderPredict(); sync();
      };

      /* ---------- practice ---------- */
      C.title('Practice');
      const prBox = colBox(); hostEl.append(prBox);
      const nProb = PROB.length, solvedN = () => pr.solved.filter(Boolean).length;
      const btn = (label, fn, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: fn }, label);
      const startPractice = i => {
        pr.started = true; pr.i = i; pr.fb = ''; st.pred = -1; st.predDone = false; renderPredict();
        if (i < nProb) { setLock(true); applyPatch(PROB[i].setup, false); } else setLock(false);
        renderPractice();
      };
      const checkSet = () => {
        const q = PROB[pr.i]; if (pr.solved[pr.i]) return;
        const [px, py] = point(), hit = Math.hypot(px - st.tx, py - st.ty) < 1e-9;
        if (hit) { pr.solved[pr.i] = true; pr.fb = ok('Yes. ') + q.win; }
        else {
          const [wx, wy] = W(), xOk = Math.abs(px - st.tx) < 1e-9, yOk = Math.abs(py - st.ty) < 1e-9;
          pr.fb = no('Not yet. ') + `a = ${nf(st.a)} and b = ${nf(st.b)} land at ${vs(px, py)}, not at ${vs(st.tx, st.ty)}. The x equation ${lin(st.vx, wx)} = ${nf(st.tx)} gives ${nf(px)}${xOk ? ' (right)' : ' (wrong)'}. The y equation ${lin(st.vy, wy)} = ${nf(st.ty)} gives ${nf(py)}${yOk ? ' (right)' : ' (wrong)'}. ${q.tip}`;
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
          prBox.append(h('p', { class: 'hint' }, sv ? `You have solved ${sv} of ${n}. The problems use the picture above and lock the vectors.` : `${n} fixed problems. Each uses the picture above, with feedback that explains why.`),
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
        } else prBox.append(btn('Check my a and b', checkSet, true));
        const fb = h('div', { class: 'ctl readout', style: 'border-top:0;padding-top:0', 'aria-live': 'polite' }); fb.innerHTML = pr.fb; prBox.append(fb);
        const row = h('div', { class: 'ctl buttons' });
        if (pr.i > 0) row.append(btn('Previous problem', () => startPractice(pr.i - 1)));
        row.append(btn(pr.i === n - 1 ? 'Finish' : 'Next problem', () => startPractice(pr.i + 1), pr.solved[pr.i]));
        prBox.append(row);
      };

      C.hint('Drag the arrow tips, the yellow point or the target, or use the sliders: every drag has a slider.');
      renderPredict(); renderPractice();

      /* ---------- dragging ---------- */
      draggable(P, {
        hit: (px, py) => {
          const [qx, qy] = point();
          if (!locked && st.tgt && near(P, st.tx, st.ty, px, py)) return 'tgt';
          if (!locked && st.useW && near(P, st.wx, st.wy, px, py)) return 'w';
          if (!locked && near(P, st.vx, st.vy, px, py)) return 'v';
          return near(P, qx, qy, px, py) ? 'p' : null;
        },
        move: (hd, x, y) => {
          cancel(); solMsg = '';
          if (hd === 'v') { st.vx = clamp(snap(x, 1), -4, 4); st.vy = clamp(snap(y, 1), -4, 4); }
          else if (hd === 'w') { st.wx = clamp(snap(x, 1), -4, 4); st.wy = clamp(snap(y, 1), -4, 4); }
          else if (hd === 'tgt') { st.tx = clamp(snap(x, 1), -8, 8); st.ty = clamp(snap(y, 1), -8, 8); }
          else {
            const [wx, wy] = W(), D = det(), K = kind();
            if (Math.abs(D) > 1e-9) { st.a = clamp(snap((x * wy - y * wx) / D, .5), -3, 3); st.b = clamp(snap((st.vx * y - st.vy * x) / D, .5), -3, 3); }
            else if (K.k === 'line') {
              const dd = K.dx * K.dx + K.dy * K.dy, t = clamp(snap((x * K.dx + y * K.dy) / dd, .5), -3, 3);
              if (K.d === 'v') st.a = t; else st.b = t;
            }
          }
          sync();
        }
      });

      /* ---------- step patches ---------- */
      const FLAGS = ['useW', 'grid', 'tgt', 'pred'];
      const applyPatch = (patch, immediate) => {
        cancel(); solMsg = '';
        let nums = {}, flags = {};
        for (const k in patch) (FLAGS.includes(k) ? flags : nums)[k] = patch[k];
        if (flags.pred !== undefined) {
          st.pred = flags.pred; st.predDone = false; pd.picked = -1;
          if (st.pred >= 0) { const c = CASES[st.pred]; nums = { ...c.nums, ...nums }; flags.useW = c.useW; flags.grid = false; predCase = (st.pred + 1) % CASES.length; }
          delete flags.pred; renderPredict();
        }
        Object.assign(st, flags);
        if (immediate) { Object.assign(st, nums); sync(); } else { cancel = animateTo(st, nums, 900, sync); sync(); }
      };
      const apply = (patch, immediate) => {
        const changed = pr.started; pr.started = false; setLock(false);
        if (changed) renderPractice();
        applyPatch(patch, immediate);
      };
      sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
