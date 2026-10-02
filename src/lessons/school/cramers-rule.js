/* =====================================================================
   SCHOOL — Cramer's rule through areas
   ===================================================================== */
{
  const MI = '−';
  const fs = p => clamp(p.scale * .5, 14.5, 19);
  const near0 = v => Math.abs(v) < 1e-9;
  const kk = t => `<span class="k">${t}</span>`;
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const frac = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; n /= g; d /= g; return d === 1 ? num(n) : num(n) + '/' + d; };
  const pn = n => (n < 0 ? `(${num(n)})` : num(n));
  const cross = (p, q) => p[0] * q[1] - p[1] * q[0];
  const coef = (k, v, first) => {
    if (!k) return '';
    const m = Math.abs(k), t = (m === 1 ? '' : m) + v;
    return first ? (k < 0 ? MI : '') + t : (k < 0 ? ` ${MI} ` : ' + ') + t;
  };
  const eqn = (a, b, e) => { const l = coef(a, 'x', true) + coef(b, 'y', !a); return `${l || '0'} = ${num(e)}`; };
  /* the arrows, D and the two top numbers for a system a x + b y = e, c x + d y = f */
  const geo = S => {
    const u = [S.a, S.c], v = [S.b, S.d], w = [S.e, S.f];
    return { u, v, w, D: cross(u, v), Aw: cross(w, v), Au: cross(u, w) };
  };
  const kindOf = S => {
    const g = geo(S);
    if (g.D !== 0) return 'one';
    const any = [S.a, S.b, S.c, S.d].some(q => q !== 0), anyAll = any || S.e !== 0 || S.f !== 0;
    const rw = (g.Aw !== 0 || g.Au !== 0) ? 2 : (anyAll ? 1 : 0), ru = any ? 1 : 0;
    return rw === ru ? 'many' : 'none';
  };
  const fresh = (a, b, c, d, e, f) => ({ a, b, c, d, e, f });

  /* ---------- practice problems (a fixed list) ---------- */
  const PROBS = [
    { name: 'Which numerator?', sys: fresh(2, 3, 1, 4, 8, 9),
      q: 'In 2x + 3y = 8 and x + 4y = 9, the bottom number is D = 2·4 − 3·1 = 5. Which expression is the top number (the numerator) for x?',
      ch: [
        ['2·9 − 8·1', 'That swaps the y column (3, 4) for the right side (8, 9). It is the top number for y, the area of the parallelogram of u and w. For x, keep the y column and swap the x column.'],
        ['8·4 − 3·9', 'Yes. For x, the x column (2, 1) is replaced by the right side (8, 9). The parallelogram of w and v has area 8·4 − 3·9 = 32 − 27 = 5, and that is x times D. So x = 5 ÷ 5 = 1.'],
        ['2·4 − 3·1', 'That is D itself. Nothing was swapped, so it is the area of the parallelogram of u and v. The top number needs the right side (8, 9) in it.'],
        ['8·4 + 3·9', 'The right columns are swapped in, but a determinant subtracts the cross products: 8·4 − 3·9. Adding would not give an area.']], ans: 1 },
    { name: 'Solve with whole numbers', sys: fresh(2, 1, 1, 3, 8, 9),
      q: 'Solve 2x + y = 8 and x + 3y = 9. First D = 2·3 − 1·1 = 5. Then find both top numbers and divide. Which pair is the solution?',
      ch: [
        ['x = 2, y = 3', 'These are the right numbers in the wrong places. Nx = 8·3 − 1·9 = 15 belongs to x, and Ny = 2·9 − 8·1 = 10 belongs to y. So x = 15 ÷ 5 = 3 and y = 10 ÷ 5 = 2.'],
        ['x = 15, y = 10', 'Those are the top numbers. Each one is x times D or y times D, so divide by D = 5 to get x = 3 and y = 2.'],
        ['x = 3, y = −2', 'The sign of y slipped. The y numerator is a·f − e·c = 2·9 − 8·1 = 10, not e·c − a·f. Then y = 10 ÷ 5 = 2.'],
        ['x = 3, y = 2', 'Yes. Nx = 8·3 − 1·9 = 15 and Ny = 2·9 − 8·1 = 10. Divide by D = 5: x = 3, y = 2. Check: 2·3 + 2 = 8 and 3 + 3·2 = 9.']], ans: 3 },
    { name: 'An answer that is a fraction', sys: fresh(3, 1, 1, 2, 2, 3),
      q: 'Solve 3x + y = 2 and x + 2y = 3. Find D, then both top numbers. Which pair is the solution?',
      ch: [
        ['x = 1, y = 7', 'Those are the top numbers, 1 and 7. The area of the parallelogram of w and v is x times D, so divide by D = 3·2 − 1·1 = 5.'],
        ['x = 1/5, y = 7/5', 'Yes. D = 3·2 − 1·1 = 5, Nx = 2·2 − 1·3 = 1, Ny = 3·3 − 2·1 = 7. So x = 1/5 and y = 7/5. Check: 3/5 + 7/5 = 2 and 1/5 + 14/5 = 3. Answers are often fractions, and that is fine.'],
        ['x = 5, y = 5/7', 'The division is upside down. The top number goes on top: x = Nx ÷ D = 1/5, y = 7/5. The area of the new parallelogram is x copies of D, so it is divided by D.'],
        ['x = 7/5, y = 1/5', 'Those are the right fractions, swapped. Nx = 1 goes with x (swap the x column), Ny = 7 goes with y. So x = 1/5 and y = 7/5.']], ans: 1 },
    { name: 'A negative D', sys: fresh(1, 3, 2, 1, 9, 8),
      q: 'Solve x + 3y = 9 and 2x + y = 8. What are D = ad − bc and x?',
      ch: [
        ['D = −5 and x = −15', 'D = 1·1 − 3·2 = −5 and Nx = 9·1 − 3·8 = −15 are right, but x is Nx ÷ D = −15 ÷ (−5) = 3. Two negatives make a positive.'],
        ['D = 5 and x = −3', 'D = 1·1 − 3·2 = 1 − 6 = −5. The sign matters. Then x = −15 ÷ (−5) = 3.'],
        ['D = −5, and there is no solution because D is negative', 'Only D = 0 stops the rule. A negative D just means v points clockwise from u (signed area), and the answer is x = −15 ÷ (−5) = 3.'],
        ['D = −5 and x = 3', 'Yes. D = 1·1 − 3·2 = −5, Nx = 9·1 − 3·8 = −15, so x = −15 ÷ (−5) = 3. Both signed areas flip together, so the ratio is the same as if the picture were mirrored.']], ans: 3 },
    { name: 'When D is 0, which case?', sys: fresh(2, 4, 1, 2, 6, 5),
      q: 'Look at 2x + 4y = 6 and x + 2y = 5. Compute D and the top number for x. What does the system have?',
      ch: [
        ['Infinitely many solutions', 'That needs both top numbers to be 0. Here D = 2·2 − 4·1 = 0 but Nx = 6·2 − 4·5 = −8 is not 0. The target w is off the line of u and v.'],
        ['Exactly one solution, x = 0', 'With D = 0 the formula would divide by 0, so it cannot give x = 0 or any single number. A flat parallelogram has no area to compare. Look at the top numbers instead.'],
        ['No solution', 'Yes. D = 2·2 − 4·1 = 0, so u and v lie on one line. Nx = 6·2 − 4·5 = −8 is not 0, so w is off that line and no walk reaches it. In words: the first equation says x + 2y = 3 and the second says x + 2y = 5.']], ans: 2 },
    { name: 'D is 0 again', sys: fresh(3, 6, 1, 2, 9, 3),
      q: 'Look at 3x + 6y = 9 and x + 2y = 3. Compute D and both top numbers. What does the system have?',
      ch: [
        ['Infinitely many solutions', 'Yes. D = 3·2 − 6·1 = 0, Nx = 9·2 − 6·3 = 0 and Ny = 3·3 − 9·1 = 0. The target w lies on the line of u and v, so many walks reach it. The first equation is the second times 3.'],
        ['No solution, because D = 0', 'D = 0 only means the rule cannot give one answer. Both top numbers are also 0, so w is on the line of u and v, and many walks reach it.'],
        ['x = 0 and y = 0', 'Check it: 3·0 + 6·0 = 0, but the right side is 9. Zero over zero is not zero. With D = 0 the rule gives no single answer.']], ans: 0 },
    { name: 'Ticket prices', sys: fresh(2, 3, 1, 2, 25, 14),
      q: 'At a fair, 2 adult tickets and 3 student tickets cost $25. One adult ticket and 2 student tickets cost $14. Let x be the adult price and y the student price, so 2x + 3y = 25 and x + 2y = 14. What does one student ticket cost?',
      ch: [
        ['$8', 'That is the adult price, x = Nx ÷ D = 8. The student price is y, and its top number swaps the y column: 2·14 − 25·1 = 3.'],
        ['$14', '14 is the second bill, not a ticket price. D = 2·2 − 3·1 = 1 and Ny = 2·14 − 25·1 = 3, so y = 3 ÷ 1 = 3.'],
        ['$11', '25 − 14 = 11 subtracts the two bills. The bills have different tickets in them, so that number is not a price. Use y = Ny ÷ D = 3 ÷ 1 = 3.'],
        ['$3', 'Yes. D = 2·2 − 3·1 = 1. Ny = 2·14 − 25·1 = 3, so y = 3 ÷ 1 = $3. Then x = 8. Check: 2·8 + 3·3 = 25 and 8 + 2·3 = 14.']], ans: 3 }
  ];

  register({
    id: 'cramers-rule', level: 'school',
    title: "Cramer's rule through areas",
    blurb: 'Solve a 2 by 2 system by comparing areas of parallelograms, and see why D = 0 breaks the rule.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 4.5; p.cy = 3.6; p.span = 5.6;
      p.grid(1, { axes: false });
      const u = [2, 1], v = [1, 3], w = [7, 6];
      p.path([[0, 0], u, [3, 4], v], { fill: alpha(pal.yellow, .3), stroke: pal.yellow, width: 2.4, close: true });
      p.path([[0, 0], w, [8, 9], v], { fill: alpha(pal.violet, .16), stroke: pal.violet, width: 2.4, close: true, dash: [6, 5] });
      p.arrow(0, 0, u[0], u[1], pal.green, 4); p.arrow(0, 0, v[0], v[1], pal.red, 4); p.arrow(0, 0, w[0], w[1], pal.blue, 4);
    },
    hook: String.raw`At a fair, one family paid $25 for 2 adult tickets and 3 student tickets. Another paid $14 for 1 adult and 2 student tickets. What does each ticket cost? You could substitute or eliminate. Here is a different way: measure the area of a shape.`,
    steps: [
      { title: 'Two arrows and a target',
        text: String.raw`<p>The system \(2x+y=7,\ x+3y=6\) has two columns of numbers. Treat them as arrows: \(u=(2,1)\) and \(v=(1,3)\). The right side is the target \(w=(7,6)\). Solving means finding the steps \(x\) along \(u\) and \(y\) along \(v\) that reach \(w\).</p><p>The yellow parallelogram of \(u\) and \(v\) has area \(D=2\cdot3-1\cdot1=5\). Change the six numbers and watch \(D\).</p>`,
        set: { mode: 'sys', a: 2, b: 1, c: 1, d: 3, e: 7, f: 6, sh: 0, walkT: 0 } },
      { title: 'A slide that reads x',
        text: String.raw`<p>Draw the parallelogram of \(w\) and \(v\). Its area is \(7\cdot3-1\cdot6=15\). Predict \(x\) in the panel, then watch the top edge slide along \(v\).</p><p>Sliding along \(v\) keeps the base and the height, so the area never changes. At the start the edge is \(x\) copies of \(u\), so the area is \(x\) times \(D\): \(15=x\cdot5\).</p>`,
        set: { mode: 'X', a: 2, b: 1, c: 1, d: 3, e: 7, f: 6, sh: 0, walkT: 0 } },
      { title: 'Pick the column, then compute',
        text: String.raw`<p>For \(x\), swap the \(x\) column \((2,1)\) for the right side \((7,6)\). That gives the parallelogram of \(w\) and \(v\). For \(y\), swap the \(y\) column instead.</p><p>Choose the column, set \(D\) and the top number with the sliders, and press Check. Here \(x=\tfrac{15}{5}=3\) and \(y=\tfrac55=1\).</p>`,
        set: { mode: 'rule', a: 2, b: 1, c: 1, d: 3, e: 7, f: 6, sh: 0, walkT: 0 } },
      { title: 'When the parallelogram is flat',
        text: String.raw`<p>Now \(x+2y=3,\ 2x+4y=5\). The arrows \(u=(1,2)\) and \(v=(2,4)\) point along one line, so the parallelogram is flat: \(D=1\cdot4-2\cdot2=0\). You cannot divide by 0.</p><p>Decide in the panel: none or many? The top numbers here are \(2\) and \(-1\). Then change the right side to \((3,6)\) and look again.</p>`,
        set: { mode: 'flat', a: 1, b: 2, c: 2, d: 4, e: 3, f: 5, sh: 0, walkT: 0 } }
    ],
    formal: String.raw`
      <p>A system \(ax+by=e,\ cx+dy=f\) asks for numbers \(x\) and \(y\) that satisfy both equations. Cramer's rule gets them from three determinants, and each determinant is an area.</p>
      <h3>The system as a walk</h3>
      <p>Write the columns as arrows \(u=(a,c)\) and \(v=(b,d)\), and the right side as \(w=(e,f)\). Then the system says
      \[ x\,u+y\,v=w, \]
      because the first coordinates give \(ax+by=e\) and the second give \(cx+dy=f\). To solve it, find how far to walk along \(u\) and along \(v\) to land on \(w\).</p>
      <h3>Area and the determinant</h3>
      <p>The parallelogram spanned by two arrows \(p=(p_1,p_2)\) and \(q=(q_1,q_2)\) has signed area \(p_1q_2-p_2q_1\). It is positive when \(q\) is counterclockwise from \(p\) and negative when it is clockwise, and its size is the ordinary area. Write it \(\det[p\ q]\). The parallelogram of \(u\) and \(v\) has
      \[ D=\det[u\ v]=ad-bc. \]
      This is the determinant from the earlier lessons.</p>
      <h3>Why the rule works</h3>
      <p>Look at the parallelogram of \(w\) and \(v\). Replace \(w\) by \(xu+yv\). Two facts about area do the work.</p>
      <p><em>Fact 1.</em> Stretching one edge by a factor \(x\) stretches the area by \(x\). So the parallelogram of \(xu\) and \(v\) has area \(x\cdot D\).</p>
      <p><em>Fact 2.</em> Adding any multiple of \(v\) to the other edge does not change the area. The base \(v\) stays the same, and the opposite edge only slides along a line parallel to \(v\), so the height is the same. This is a shear.</p>
      <p>The edge \(xu+yv\) is the edge \(xu\) slid along \(v\) by \(y\) copies of \(v\). So the parallelogram of \(w\) and \(v\) has the same area as the one of \(xu\) and \(v\):
      \[ \det[w\ v]=x\,\det[u\ v]. \]
      The same argument with the roles swapped gives \(\det[u\ w]=y\det[u\ v]\).</p>
      <h3>Cramer's rule</h3>
      <p>If \(D\neq0\), divide:
      \[ x=\frac{\det[w\ v]}{\det[u\ v]}=\frac{ed-bf}{ad-bc},\qquad y=\frac{\det[u\ w]}{\det[u\ v]}=\frac{af-ec}{ad-bc}. \]
      In matrix form, the top of \(x\) is the determinant of the coefficient matrix with its first column replaced by \((e,f)\), and the top of \(y\) is the same with the second column replaced. Replace the column of the variable you want.</p>
      <p>Example. For \(2x+3y=25,\ x+2y=14\): \(D=2\cdot2-3\cdot1=1\), \(x=\dfrac{25\cdot2-3\cdot14}{1}=8\) and \(y=\dfrac{2\cdot14-25\cdot1}{1}=3\). Check: \(2\cdot8+3\cdot3=25\) and \(8+2\cdot3=14\).</p>
      <h3>A negative D, and D = 0</h3>
      <p>A negative \(D\) is fine: the numerator's sign flips with it when the picture is mirrored, so the quotient is the same. For \(x+3y=9,\ 2x+y=8\): \(D=-5\), the top of \(x\) is \(-15\), and \(x=3\).</p>
      <p>If \(D=0\), then \(u\) and \(v\) lie on one line and the parallelogram is flat, so the rule would divide by 0. Look at the top numbers. If at least one is not 0, the target \(w\) is off the line, no walk reaches it, and there is no solution. If both are 0 (and the left side is not all zeros), then \(w\) is on the line and there are infinitely many solutions. Example: \(x+2y=3,\ 2x+4y=5\) has \(D=0\) and top number \(2\), so no solution; with right side \((3,6)\) both top numbers are 0 and there are infinitely many.</p>
      <h3>An honest comparison</h3>
      <p>Cramer's rule is quick for a 2 by 2 system by hand, and good when you only need one variable, because \(x\) never needs \(y\). It is slow for large systems, since each determinant is a lot of arithmetic, and it breaks at \(D=0\) where it gives no answer by itself. Substitution and elimination give the same answers. So does the inverse matrix: in \(X=A^{-1}B\), the entries of \(A^{-1}\) are the cofactors divided by \(D\), which is exactly where Cramer's quotients come from.</p>`,
    check: [
      { q: String.raw`For the system \(ax+by=e,\ cx+dy=f\) with \(ad-bc\neq0\), Cramer's rule gives \(x\) as a quotient of two determinants. Which description of the top (numerator) determinant is correct?`,
        choices: ['The coefficient matrix with its y column replaced by the right side (e, f)', 'The coefficient matrix with its x column replaced by the right side (e, f)', 'The coefficient matrix with both columns replaced by the right side (e, f)', 'The coefficient matrix unchanged, because the top number is also ad − bc'], answer: 1,
        why: String.raw`The unknown \(x\) counts steps along the \(x\) column \(u\), so that column is the one replaced by the target \(w=(e,f)\). This makes the parallelogram of \(w\) and \(v\), whose area is \(x\) times the area of the parallelogram of \(u\) and \(v\). Replacing the y column gives the top number for \(y\). Leaving the matrix unchanged gives \(D\), the bottom number.`,
        hint: 'x measures steps along the first arrow u. Which column should disappear from the numerator?' },
      { q: String.raw`Use Cramer's rule on \(x-2y=4\) and \(3x+y=5\). The coefficient determinant is \(D=1\cdot1-(-2)\cdot3\). What is y?`,
        choices: ['y = 1', 'y = −7', 'y = −1', 'y = 2'], answer: 2,
        why: String.raw`\(D=1\cdot1-(-2)\cdot3=1+6=7\). For \(y\), replace the second column by \((4,5)\): the top number is \(af-ec=1\cdot5-4\cdot3=5-12=-7\). So \(y=-7\div7=-1\). Check with \(x=2\): \(2-2(-1)=4\) and \(3\cdot2+(-1)=5\). The choice \(y=1\) subtracts in the wrong order. \(y=-7\) forgets to divide by \(D\). \(y=2\) is the value of \(x\).`,
        hint: 'Find D first. For y, the top number is a·f − e·c. Then divide by D.' },
      { q: String.raw`Sam solves \(2x+3y=6\) and \(4x+6y=15\). He writes: Step 1. D = 2·6 − 3·4 = 0. Step 2. The top number for x is 6·6 − 3·15 = −9. Step 3. So x = −9 ÷ 0 = 0. Which statement is true?`,
        choices: ['Step 3 is wrong: you cannot divide by 0. Since D = 0 and the top number is not 0, the system has no solution.', 'Step 1 is wrong: D should be 2·6 + 3·4 = 24.', 'Step 2 is wrong: the top number for x should replace the y column.', 'Nothing is wrong: any number divided by 0 is 0, so x = 0.'], answer: 0,
        why: String.raw`Steps 1 and 2 are correct, so the arrows \(u=(2,4)\) and \(v=(3,6)\) lie on one line and the parallelogram is flat. Division by 0 is not allowed, so Step 3 cannot be done. Because the top number \(-9\) is not 0, the target \((6,15)\) is off that line and no walk reaches it. In words: \(2x+3y=6\) and \(2x+3y=7.5\) cannot both be true.`,
        hint: 'What does D = 0 mean for the parallelogram? Then look at whether the top number is 0.' }
    ],
    links: { prereq: ['solving-systems-with-matrices'], related: ['determinants-and-inverse-matrices', 'matrices', 'area-by-decomposition', 'systems-of-equations', 'solving-systems-by-elimination', 'systems-of-three-equations'] },

    mount({ stage, controls: C }) {
      const st = {
        mode: 'sys', practice: false, a: 2, b: 1, c: 1, d: 3, e: 7, f: 6,
        sh: 0, walkT: 0, gateOpen: false, tgt: 'x', rep: 0, okX: false, okY: false, sD: 0, sN: 0, repSaid: '', said: '', flatSaid: ''
      };
      let cancel = () => {};
      const panel = stage.nextElementSibling;
      const P = new Plane(stage, { span: 6 });
      const S0 = () => fresh(st.a, st.b, st.c, st.d, st.e, st.f);

      /* ----- what to draw ----- */
      let prIdx = 0, prSolved = false, prFirst = 0, prDone = 0, prTried = false;
      const sceneOf = () => {
        if (st.practice) {
          const S = PROBS[prIdx].sys, k = kindOf(S), o = { sys: S, D: true, line: k !== 'one' };
          if (prSolved && k === 'one') { o.wv = true; o.uw = true; }
          return o;
        }
        const S = S0(), o = { sys: S };
        if (st.mode === 'sys') o.D = true;
        else if (st.mode === 'X') {
          o.D = true;
          if (st.gateOpen && !near0(geo(S).D)) o.shear = st.sh; else o.wv = true;
        } else if (st.mode === 'rule') {
          o.D = true; o.wv = st.rep === 1; o.uw = st.rep === 2;
          if (st.walkT > 0 && st.okX && st.okY) o.walk = st.walkT;
        } else o.line = true;
        return o;
      };

      const fitTo = (p, pts) => {
        let x0 = 0, x1 = 0, y0 = 0, y1 = 0;
        pts.forEach(q => { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); });
        const W = Math.max(x1 - x0, 4), H = Math.max(y1 - y0, 4), m = 1.3;
        const sc0 = Math.min(p.w / (W + 2 * m), p.h / (H + 2 * m)), top = Math.max(2.2, 70 / sc0);
        p.fit(W, H, { l: m, r: m, t: top, b: m });
        p.cx += x0 - (W - (x1 - x0)) / 2; p.cy += y0 - (H - (y1 - y0)) / 2;
      };
      const tipLab = (p, t, pt, col, ex = [0, 0], dist = 12) => {
        const size = fs(p), l = Math.hypot(pt[0], pt[1]) || 1, wd = t.length * size * .5, sx = pt[0] / l, sy = -pt[1] / l;
        let dx = sx * (wd / 2 + dist), dy = sy * (size * .6 + dist * .5);
        dx += ex[0]; dy += ex[1];
        dx = clamp(dx, 6 + wd / 2 - p.X(pt[0]), p.w - 6 - wd / 2 - p.X(pt[0]));
        dy = clamp(dy, 12 - p.Y(pt[1]), p.h - 12 - p.Y(pt[1]));
        p.label(t, pt[0], pt[1], { size, italic: false, color: col, dx, dy });
      };
      const poly = (p, A, B, fill, stroke, dash, w = 3) => p.path([[0, 0], A, [A[0] + B[0], A[1] + B[1]], B], { fill, stroke, width: w, close: true, dash });
      const cen = (A, B) => [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
      const arr = (p, q, col, w = 4) => { if (Math.hypot(q[0], q[1]) > 1e-6) p.arrow(0, 0, q[0], q[1], col, w); };

      const caption = (o, g) => {
        const S = o.sys;
        if (st.practice) return `Problem ${prIdx + 1} of ${PROBS.length}: ${PROBS[prIdx].name}`;
        if (st.mode === 'sys') return `D = ${pn(S.a)}·${pn(S.d)} ${MI} ${pn(S.b)}·${pn(S.c)} = ${num(g.D)}`;
        if (st.mode === 'X') {
          if (near0(g.D)) return 'D = 0: the parallelogram is flat';
          if (!st.gateOpen) return 'Predict x in the panel';
          return `Area stays ${num(g.Aw)} = x · D, so x = ${num(g.Aw)} ÷ ${pn(g.D)} = ${frac(g.Aw, g.D)}`;
        }
        if (st.mode === 'rule') {
          if (st.rep === 1) return `Swapped the x column: area ${num(g.Aw)}`;
          if (st.rep === 2) return `Swapped the y column: area ${num(g.Au)}`;
          return 'Swap a column in the panel';
        }
        const k = kindOf(S);
        return k === 'one' ? `D = ${num(g.D)}: not flat, one solution` : `D = 0: flat. w is ${k === 'many' ? 'on' : 'off'} the line`;
      };

      P.onDraw = (c, p) => {
        const pal = p.pal, o = sceneOf(), S = o.sys, g = geo(S), { u, v, w } = g, size = fs(p);
        const xv = near0(g.D) ? 0 : g.Aw / g.D, yv = near0(g.D) ? 0 : g.Au / g.D;
        const uv = [u[0] + v[0], u[1] + v[1]], pts = [[0, 0], u, v, w];
        if (o.D) pts.push(uv);
        if (o.wv || o.shear != null) pts.push([w[0] + v[0], w[1] + v[1]]);
        if (o.uw) pts.push([u[0] + w[0], u[1] + w[1]]);
        if (o.shear != null || o.walk) pts.push([xv * u[0], xv * u[1]]);
        fitTo(p, pts);
        /* grid and ticks */
        let step = 1; while (p.scale * step < 22) step *= 2;
        p.grid(step); p.ticks(step, { size: clamp(p.scale * .5, 14.5, 16) });
        const b = p.bounds();
        /* the line through u and v when they are parallel */
        if (o.line) {
          const dir = (u[0] || u[1]) ? u : v;
          if (dir[0] || dir[1]) {
            const L = 60, n = Math.hypot(dir[0], dir[1]);
            p.path([[-dir[0] / n * L, -dir[1] / n * L], [dir[0] / n * L, dir[1] / n * L]], { stroke: pal.muted, width: 1.8, dash: [3, 6] });
          }
        }
        /* areas */
        if (o.D) {
          poly(p, u, v, alpha(pal.yellow, .3), pal.yellow, null, 2.6);
          if (!near0(g.D)) { const q = cen(u, v); p.label(`D = ${num(g.D)}`, q[0], q[1], { size, italic: false, color: pal.text }); }
        }
        if (o.wv) {
          poly(p, w, v, alpha(pal.violet, .2), pal.violet, [7, 5], 2.8);
          const q = cen(w, v); p.label(`area ${num(g.Aw)}`, q[0], q[1], { size, italic: false, color: pal.text });
        }
        if (o.uw) {
          poly(p, u, w, alpha(pal.violet, .2), pal.violet, [7, 5], 2.8);
          const q = cen(u, w); p.label(`area ${num(g.Au)}`, q[0], q[1], { size, italic: false, color: pal.text });
        }
        if (o.shear != null) {
          const t = o.shear, xu = [xv * u[0], xv * u[1]], s = [xu[0] + t * yv * v[0], xu[1] + t * yv * v[1]];
          if (t > .02) poly(p, xu, v, null, pal.muted, [5, 6], 2);
          poly(p, s, v, alpha(pal.violet, .26), pal.violet, null, 3.2);
          if (t > .02 && Math.hypot(w[0] - xu[0], w[1] - xu[1]) > 1e-6) p.path([xu, w], { stroke: pal.violet, width: 2.2, dash: [4, 5] });
          const q = cen(s, v); p.label(`area ${num(g.Aw)}`, q[0], q[1], { size, italic: false, color: pal.text });
          arr(p, xu, pal.green, 3);
          if (Math.hypot(xu[0], xu[1]) > .3) tipLab(p, `x·u = ${frac(g.Aw, g.D)}·u`, xu, pal.green);
          arr(p, s, pal.blue, 4.5);
          tipLab(p, t > .97 ? `w = (${num(w[0])}, ${num(w[1])})` : 'sliding edge', s, pal.blue);
        } else if (o.walk) {
          const t = o.walk, s1 = Math.min(t * 2, 1), s2 = Math.max(t * 2 - 1, 0), xu = [xv * u[0], xv * u[1]];
          p.arrow(0, 0, xu[0] * s1, xu[1] * s1, pal.green, 4.5);
          if (s2 > 0) p.arrow(xu[0], xu[1], xu[0] + yv * v[0] * s2, xu[1] + yv * v[1] * s2, pal.red, 4.5);
          if (s1 > .95) { const q = cen([0, 0], xu); p.label(`${frac(g.Aw, g.D)} × u`, q[0], q[1], { size, italic: false, color: pal.green, dy: 20 }); }
          if (s2 > .95) { const q = [xu[0] + yv * v[0] / 2, xu[1] + yv * v[1] / 2]; p.label(`${frac(g.Au, g.D)} × v`, q[0], q[1], { size, italic: false, color: pal.red, dx: 14, dy: -6, align: 'left' }); }
        }
        if (o.shear == null) {
          if (!o.walk) { arr(p, u, pal.green); arr(p, v, pal.red); }
          arr(p, w, pal.blue, o.walk ? 2.2 : 4);
        } else { arr(p, u, pal.green, 3.4); arr(p, v, pal.red, 4); }
        const par = near0(g.D);
        if (!o.walk) {
          tipLab(p, `u = (${num(u[0])}, ${num(u[1])})`, u, pal.green, par ? [70, 26] : [0, 0]); tipLab(p, `v = (${num(v[0])}, ${num(v[1])})`, v, pal.red, par ? [-64, -6] : [0, 0]);
        }
        if (o.shear == null) tipLab(p, `w = (${num(w[0])}, ${num(w[1])})`, w, pal.blue);
        p.dot(0, 0, 4.5, pal.text, pal.stage, 1.5);
        /* the two lines of text at the top */
        const cx = (b.x0 + b.x1) / 2;
        p.label(`${eqn(S.a, S.b, S.e)}   and   ${eqn(S.c, S.d, S.f)}`, cx, b.y1, { size: size * 1.05, italic: false, color: pal.text, dy: 18 });
        p.label(caption(o, g), cx, b.y1, { size, italic: false, color: pal.muted, dy: 18 + size * 1.5 });
      };

      /* ----- the side panel ----- */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const S = o => { const s = C.slider(o); s.inp = panel.lastElementChild.querySelector('input'); return s; };
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const addTo = (...els) => panel.append(...els);
      const lines = a => a.join('<br>');
      const SIGN = v => String(num(v));
      const dm = (m11, m12, m21, m22, rc) => {
        const cell = (v, col) => `<span style="${rc === col ? 'font-weight:700;color:var(--violet)' : ''}">${num(v)}</span>`;
        return `<span style="display:inline-grid;grid-template-columns:auto auto;gap:2px 14px;padding:1px 8px;border-left:2px solid var(--text);border-right:2px solid var(--text);vertical-align:middle;text-align:center">${cell(m11, 1)}${cell(m12, 2)}${cell(m21, 1)}${cell(m22, 2)}</span>`;
      };

      let ro, fbRep, fbCalc, fbFlat, gateBox, sdS, snS, shS, tgtB, repB, startBtn, ptally, pq, pch, pfb, pnext;
      const sysS = [];
      const sysSpec = [['a', 'a: x in equation 1', -4, 4], ['b', 'b: y in equation 1', -4, 4], ['c', 'c: x in equation 2', -4, 4], ['d', 'd: y in equation 2', -4, 4], ['e', 'e: right side of equation 1', -9, 9], ['f', 'f: right side of equation 2', -9, 9]];

      grp('sys', () => {
        C.title('The system  ax + by = e,  cx + dy = f');
        sysSpec.forEach(([k, label, lo, hi]) => {
          const s = S({ label, min: lo, max: hi, step: 1, value: st[k], format: SIGN, onInput: v => { cancel(); st[k] = v; sysChanged(); } });
          s.key = k; sysS.push(s);
        });
      });
      grp('gate', () => { gateBox = h('div', { style: 'display:flex;flex-direction:column;gap:14px' }); addTo(gateBox); });
      grp('slide', () => {
        shS = S({ label: 'Slide the top edge along v', min: 0, max: 1, step: .05, value: 0, format: v => Math.round(v * 100) + '% of the way', onInput: v => { cancel(); st.sh = v; sync(); } });
      });
      grp('rule', () => {
        C.title('Which unknown?');
        tgtB = C.buttons([{ label: 'Find x', onClick: () => setTgt('x') }, { label: 'Find y', onClick: () => setTgt('y') }]);
        C.title('Step 1: swap in the right side');
        repB = C.buttons([{ label: 'Replace the x column (a, c)', onClick: () => pickRep(1) }, { label: 'Replace the y column (b, d)', onClick: () => pickRep(2) }]);
        fbRep = C.readout();
        C.title('Step 2: do the arithmetic');
        sdS = S({ label: 'Bottom number D', min: -32, max: 32, step: 1, value: 0, format: SIGN, onInput: v => { st.sD = v; st.said = ''; sync(); } });
        snS = S({ label: 'Top number', min: -64, max: 64, step: 1, value: 0, format: SIGN, onInput: v => { st.sN = v; st.said = ''; sync(); } });
        C.buttons([{ label: 'Check my numbers', primary: true, onClick: () => checkRule() }]);
        fbCalc = C.readout();
      });
      grp('flat', () => {
        C.title('What does the system have?');
        C.buttons([{ label: 'Exactly one solution', onClick: () => pickFlat('one') }, { label: 'No solution', onClick: () => pickFlat('none') }, { label: 'Infinitely many', onClick: () => pickFlat('many') }]);
        fbFlat = C.readout();
      });
      grp('ro', () => { ro = C.readout(); C.hint('Use the sliders to change the numbers.'); });

      /* ----- practice ----- */
      C.title('Practice');
      C.hint('Seven short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); if (st.practice) { st.practice = false; } else { st.practice = true; loadProb(); } sync(); } }])[0];
      grp('practice', () => {
        const pwrap = h('div', { style: 'display:flex;flex-direction:column;gap:14px' });
        ptally = h('p', { class: 'ctl-title' });
        pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        pch = h('div', { class: 'ctl buttons' });
        pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pnext = mkBtn('Next problem', () => nextProb(), true);
        pwrap.append(ptally, pq, pch, pfb, h('div', { class: 'ctl buttons' }, pnext)); addTo(pwrap);
      });
      const tally = () => { ptally.textContent = `Right on the first try: ${prFirst} of ${prDone} done`; };
      const loadProb = () => {
        const pr = PROBS[prIdx]; prSolved = false; prTried = false;
        pq.textContent = pr.q; pfb.innerHTML = ''; pch.replaceChildren(); pch.style.display = ''; pnext.disabled = true;
        pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        pr.ch.forEach((o, i) => pch.append(mkBtn(o[0], () => pickChoice(i))));
        tally();
      };
      const pickChoice = i => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        const right = i === pr.ans, btn = pch.children[i];
        if (right) {
          prSolved = true; if (!prTried) prFirst++; prDone++;
          Array.from(pch.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary');
          pfb.innerHTML = good('Right.') + ' ' + pr.ch[i][1].replace(/^Yes\.\s*/, ''); pnext.disabled = false;
        } else {
          prTried = true; btn.disabled = true;
          pfb.innerHTML = bad('Not quite.') + ' ' + pr.ch[i][1] + ' Try another answer.';
        }
        tally(); sync();
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); sync(); return; }
        pq.textContent = 'All seven problems are done.'; pch.replaceChildren(); pnext.disabled = true;
        pfb.innerHTML = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        pch.append(mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; loadProb(); sync(); }, true)); sync();
      };

      /* ----- the prediction gate (step 2) ----- */
      const buildGate = () => {
        const g = geo(S0()), q = h('p', { class: 'hint' }), row = h('div', { class: 'ctl buttons' }), fbk = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        gateBox.replaceChildren(h('p', { class: 'ctl-title' }, 'Predict first'), q, row, fbk);
        if (near0(g.D)) { q.textContent = 'Here D = 0, so the parallelogram of u and v is flat and there is no x to predict. Go on to step 4, or change the numbers.'; return; }
        q.textContent = `The parallelogram of u and v has area D = ${num(g.D)}. The parallelogram of w and v has area ${num(g.Aw)}. What is x?`;
        const right = frac(g.Aw, g.D), all = [
          [right, true, ''],
          [near0(g.Aw) ? null : frac(g.D, g.Aw), false, `That divides the wrong way round. The area of w and v is x copies of D, so x = area ÷ D = ${num(g.Aw)} ÷ ${pn(g.D)}, not D ÷ area.`],
          [num(g.Aw - g.D), false, `Areas are compared by asking how many copies fit, which is dividing, not subtracting. x = ${num(g.Aw)} ÷ ${pn(g.D)}.`],
          [num(g.Aw * g.D), false, `Multiplying areas does not give a count of copies. Divide: x = ${num(g.Aw)} ÷ ${pn(g.D)}.`],
          [frac(g.Aw + g.D, g.D), false, `That is one copy too many. The area ${num(g.Aw)} holds exactly ${num(g.Aw)} ÷ ${pn(g.D)} copies of D.`],
          [frac(g.Aw - g.D, g.D), false, `That is one copy too few. The area ${num(g.Aw)} holds exactly ${num(g.Aw)} ÷ ${pn(g.D)} copies of D.`]
        ];
        const seen = new Set([right]), opts = [all[0]];
        all.slice(1).forEach(o => { if (o[0] !== null && !seen.has(o[0]) && opts.length < 3) { seen.add(o[0]); opts.push(o); } });
        const pos = (Math.abs(g.Aw) + 1) % opts.length, ord = opts.slice(1); ord.splice(pos, 0, opts[0]);
        let done = false;
        const btns = ord.map(o => mkBtn(`x = ${o[0]}`, () => {
          if (done) return; done = true;
          btns.forEach(b => { b.disabled = true; }); btns[ord.indexOf(o)].classList.add('primary');
          fbk.innerHTML = o[1]
            ? good('Yes.') + ` The area of w and v is ${num(g.Aw)}, and D is ${num(g.D)}. The edge w is x copies of u plus some of v, and the v part adds no area, so ${num(g.Aw)} = x · ${pn(g.D)} and x = ${right}. Watch the slide.`
            : bad('Not quite.') + ' ' + o[1] + ` The answer is x = ${right}. Watch the slide.`;
          st.gateOpen = true; cancel(); cancel = animateTo(st, { sh: 1 }, 1700, sync); sync();
        }));
        row.append(...btns);
      };

      /* ----- state rules ----- */
      const resetRule = () => { st.rep = 0; st.okX = false; st.okY = false; st.sD = 0; st.sN = 0; st.repSaid = ''; st.said = ''; st.walkT = 0; };
      const sysChanged = () => {
        st.flatSaid = ''; resetRule();
        if (st.mode === 'X') { st.gateOpen = false; st.sh = 0; buildGate(); }
        sync();
      };
      const setTgt = t => { cancel(); st.tgt = t; st.rep = 0; st.sD = 0; st.sN = 0; st.repSaid = ''; st.said = ''; sync(); };
      const pickRep = k => {
        cancel(); const g = geo(S0()), need = st.tgt === 'x' ? 1 : 2; st.rep = k; st.said = '';
        if (near0(g.D)) { st.repSaid = bad('D is 0 here.') + ' The parallelogram of u and v is flat, so this rule cannot give one answer. Go to step 4 or change the numbers.'; sync(); return; }
        if (k === need) {
          st.repSaid = st.tgt === 'x'
            ? good('Right.') + ` x counts steps along u, so take the u column out and put the right side in its place. The purple parallelogram of w and v has area ${num(g.Aw)}, and that is x times D.`
            : good('Right.') + ` y counts steps along v, so take the v column out and put the right side in its place. The purple parallelogram of u and w has area ${num(g.Au)}, and that is y times D.`;
        } else {
          st.repSaid = bad('Not that one.') + (st.tgt === 'x'
            ? ` Swapping the y column makes the parallelogram of u and w, area ${num(g.Au)}. That area is y times D, so it is the top number for y. For x, replace the x column.`
            : ` Swapping the x column makes the parallelogram of w and v, area ${num(g.Aw)}. That area is x times D, so it is the top number for x. For y, replace the y column.`);
        }
        sync();
      };
      const checkRule = () => {
        const S = S0(), g = geo(S), need = st.tgt === 'x' ? 1 : 2, N = st.tgt === 'x' ? g.Aw : g.Au, out = [];
        if (near0(g.D)) { st.said = bad('D is 0 here.') + ' Go to step 4, or change the numbers so that D is not 0.'; sync(); return; }
        if (st.rep !== need) { st.said = bad('Swap a column first.') + ` For ${st.tgt}, choose the ${st.tgt} column in Step 1. Then do the arithmetic.`; sync(); return; }
        const dTxt = `D = ${pn(S.a)}·${pn(S.d)} ${MI} ${pn(S.b)}·${pn(S.c)} = ${num(g.D)}`;
        const nTxt = st.tgt === 'x' ? `${pn(S.e)}·${pn(S.d)} ${MI} ${pn(S.b)}·${pn(S.f)} = ${num(g.Aw)}` : `${pn(S.a)}·${pn(S.f)} ${MI} ${pn(S.e)}·${pn(S.c)} = ${num(g.Au)}`;
        const dOk = st.sD === g.D, nOk = st.sN === N;
        if (!dOk) {
          out.push(bad('D is not right.') + (st.sD === S.a * S.d + S.b * S.c && S.b * S.c !== 0 ? ' You added the cross product. A determinant subtracts: ad − bc.' : st.sD === -g.D ? ' The sign is flipped. It is ad − bc, with the down-right diagonal first.' : '') + ` ${dTxt}.`);
        } else out.push(good('D is right.') + ` ${dTxt}.`);
        if (!nOk) {
          const other = st.tgt === 'x' ? g.Au : g.Aw, plus = st.tgt === 'x' ? S.e * S.d + S.b * S.f : S.a * S.f + S.e * S.c;
          out.push(bad('The top number is not right.') + (st.sN === plus && plus !== N ? ' You added the cross products. Subtract them.' : st.sN === -N && N !== 0 ? ` The sign is flipped. For ${st.tgt} it is ${st.tgt === 'x' ? 'ed − bf' : 'af − ec'}.` : st.sN === other && other !== N ? ` That is the top number for ${st.tgt === 'x' ? 'y' : 'x'}.` : '') + ` ${nTxt}.`);
        } else out.push(good('The top number is right.') + ` ${nTxt}.`);
        if (dOk && nOk) {
          if (st.tgt === 'x') st.okX = true; else st.okY = true;
          out.push(`<b>${st.tgt} = ${num(N)} ÷ ${pn(g.D)} = ${frac(N, g.D)}</b>`);
          if (st.okX && st.okY) {
            out.push(good('Now check both equations.') + ` ${pn(S.a)}·${frac(g.Aw, g.D)} + ${pn(S.b)}·${frac(g.Au, g.D)} = ${frac(S.a * g.Aw + S.b * g.Au, g.D)}, and the right side is ${num(S.e)}. ${pn(S.c)}·${frac(g.Aw, g.D)} + ${pn(S.d)}·${frac(g.Au, g.D)} = ${frac(S.c * g.Aw + S.d * g.Au, g.D)}, and the right side is ${num(S.f)}. Both match.`);
            out.push(`In the picture: ${frac(g.Aw, g.D)} steps along u, then ${frac(g.Au, g.D)} along v, lands on w.`);
            cancel(); st.walkT = 0; cancel = animateTo(st, { walkT: 1 }, 1800, sync);
          } else out.push(`Now switch to ${st.tgt === 'x' ? 'y' : 'x'} and do it again.`);
        }
        st.said = out.join('<br>'); sync();
      };
      const pickFlat = k => {
        const S = S0(), g = geo(S), t = kindOf(S), nx = g.Aw, ny = g.Au, zeros = [S.a, S.b, S.c, S.d].every(q => q === 0);
        let m;
        const nums = `D = ${num(g.D)}, top number for x = ${num(nx)}, top number for y = ${num(ny)}.`;
        if (k === t) {
          m = good('Yes.') + ' ';
          if (t === 'one') m += `${nums} D is not 0, so the parallelogram has area, and x = ${frac(nx, g.D)}, y = ${frac(ny, g.D)}.`;
          else if (zeros) m += `All four numbers on the left are 0, so the left sides are always 0. That can never equal a right side that is not 0, so there is no solution.`;
          else if (t === 'none') m += `${nums} D = 0, so u and v lie on one line and the parallelogram is flat. A top number is not 0, so w is off that line and no walk reaches it.`;
          else m += `${nums} D = 0, so the parallelogram is flat, but both top numbers are 0. The target w is on the line of u and v, so many walks reach it.`;
        } else {
          m = bad('Not quite.') + ' ' + nums + ' ';
          if (t === 'one') m += 'D is not 0, so the rule works and gives exactly one answer.';
          else if (k === 'one') m += 'D = 0, so the parallelogram is flat and the rule cannot give one answer.';
          else if (t === 'none') m += `A top number is not 0, so the target is off the line of u and v. Nothing reaches it, so there is no solution.`;
          else m += 'Both top numbers are 0, so the target is on the line of u and v. Many walks reach it.';
        }
        st.flatSaid = m; sync();
      };

      /* ----- readout ----- */
      const updRo = () => {
        const S = S0(), g = geo(S);
        const sg = g.D > 0 ? 'v is counterclockwise from u, so D is positive.' : g.D < 0 ? 'v is clockwise from u, so D is negative (the area is signed).' : 'u and v lie on one line, so the parallelogram is flat.';
        const base = [`${kk('Arrows')} u = (${num(S.a)}, ${num(S.c)}), v = (${num(S.b)}, ${num(S.d)}), w = (${num(S.e)}, ${num(S.f)})`];
        let t;
        if (st.mode === 'sys') t = lines([...base, `${kk('Area')} D = ${pn(S.a)}·${pn(S.d)} ${MI} ${pn(S.b)}·${pn(S.c)} = ${num(g.D)}`, sg, `Solving means: x steps along u plus y steps along v lands on w.`]);
        else if (st.mode === 'X') {
          t = near0(g.D) ? lines([...base, sg]) : lines([...base, `${kk('Area of u, v')} D = ${num(g.D)}`, `${kk('Area of w, v')} ${pn(S.e)}·${pn(S.d)} ${MI} ${pn(S.b)}·${pn(S.f)} = ${num(g.Aw)}`,
            st.gateOpen ? `<b>x = ${num(g.Aw)} ÷ ${pn(g.D)} = ${frac(g.Aw, g.D)}</b>` : 'Predict x in the panel first.',
            st.gateOpen ? 'The edge slid along v, so the base and the height did not change. Move the slider back to the start: the edge is x copies of u, and the area is x · D.' : '']);
        } else if (st.mode === 'rule') {
          const k = st.rep, rows = [...base, `${kk('Bottom')} ${dm(S.a, S.b, S.c, S.d, 0)} = ${num(g.D)}`];
          if (k === 1) rows.push(`${kk('Top for x')} ${dm(S.e, S.b, S.f, S.d, 1)} = ${num(g.Aw)}`);
          else if (k === 2) rows.push(`${kk('Top for y')} ${dm(S.a, S.e, S.c, S.f, 2)} = ${num(g.Au)}`);
          else rows.push('Swap a column in Step 1 to see the top number.');
          rows.push(`${kk('Working on')} ${st.tgt}. Done: x ${st.okX ? '✓' : '·'}  y ${st.okY ? '✓' : '·'}`);
          t = lines(rows);
        } else {
          t = lines([...base, `${kk('Areas')} D = ${num(g.D)}, top for x = ${num(g.Aw)}, top for y = ${num(g.Au)}`, sg,
            `${kk('Compare')} Cramer's rule is quick for 2 by 2 and for one variable. It is slow for big systems and fails at D = 0. Substitution, elimination and the inverse give the same answers.`]);
        }
        ro.innerHTML = t; fbRep.innerHTML = st.repSaid; fbCalc.innerHTML = st.said; fbFlat.innerHTML = st.flatSaid;
      };

      const sync = () => {
        const prac = st.practice, m = st.mode;
        vis(G.sys, !prac); vis(G.gate, !prac && m === 'X'); vis(G.slide, !prac && m === 'X'); vis(G.rule, !prac && m === 'rule');
        vis(G.flat, !prac && m === 'flat'); vis(G.ro, !prac); vis(G.practice, prac);
        sysS.forEach(s => s.set(st[s.key]));
        shS.set(st.sh); shS.inp.disabled = !st.gateOpen; sdS.set(st.sD); snS.set(st.sN);
        tgtB[0].classList.toggle('primary', st.tgt === 'x'); tgtB[1].classList.toggle('primary', st.tgt === 'y');
        repB[0].classList.toggle('primary', st.rep === 1); repB[1].classList.toggle('primary', st.rep === 2);
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        P.draw(); updRo();
      };

      const FLAGS = ['mode'], INTS = ['a', 'b', 'c', 'd', 'e', 'f', 'rep'];
      const apply = (patch, immediate) => {
        cancel(); const nums = {};
        const modeChange = 'mode' in patch;
        for (const k in patch) { if (FLAGS.includes(k) || INTS.includes(k)) st[k] = patch[k]; else nums[k] = patch[k]; }
        st.practice = false;
        if (modeChange) { resetRule(); st.gateOpen = false; st.flatSaid = ''; st.sh = 0; buildGate(); }
        if (immediate) { Object.assign(st, nums); sync(); } else { sync(); cancel = animateTo(st, nums, 900, sync); }
      };
      buildGate(); sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
