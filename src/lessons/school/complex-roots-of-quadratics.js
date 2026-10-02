/* =====================================================================
   SCHOOL — Complex roots of quadratics
   ===================================================================== */
{
  const MI = '−';
  const kk = t => `<span class="k">${t}</span>`;
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const near0 = v => Math.abs(v) < 1e-9;
  /* a number as an integer, or a fraction with denominator 2 or 4, or a 2-decimal number */
  const frac = v => {
    for (const d of [1, 2, 4]) {
      const n = v * d;
      if (Math.abs(n - Math.round(n)) < 1e-6) { const r = Math.round(n); return d === 1 ? num(r) : (r < 0 ? MI : '') + Math.abs(r) + '/' + d; }
    }
    return num(v);
  };
  /* text for m times i, with m greater than 0 */
  const imMag = m => {
    if (Math.abs(m - 1) < 1e-6) return 'i';
    for (const d of [1, 2, 4]) {
      const n = m * d;
      if (Math.abs(n - Math.round(n)) < 1e-6) return d === 1 ? Math.round(n) + 'i' : '(' + Math.round(n) + '/' + d + ')i';
    }
    const s = m * m;
    if (Math.abs(s - Math.round(s)) < 1e-6 && s < 100) return 'i√' + Math.round(s);
    return num(m) + 'i';
  };
  /* the complex number re + im i as text */
  const cpx = (re, im) => {
    if (near0(im)) return frac(re);
    const a = imMag(Math.abs(im));
    if (near0(re)) return (im < 0 ? MI : '') + a;
    return frac(re) + (im < 0 ? ' − ' : ' + ') + a;
  };
  const solve = (a, b, c) => {
    const D = b * b - 4 * a * c;
    if (D >= 0) { const r = Math.sqrt(D); return { D, real: true, r1: (-b - r) / (2 * a), r2: (-b + r) / (2 * a) }; }
    return { D, real: false, re: -b / (2 * a), im: Math.sqrt(-D) / (2 * a) };
  };
  /* "x² − 2x + 5" for a, b, c */
  const poly = (a, b, c) => {
    let s = '';
    const add = (v, t) => {
      if (Math.abs(v) < .005) return;
      const mag = Math.abs(v), co = t && Math.abs(mag - 1) < .005 ? '' : num(mag);
      s += s ? (v < 0 ? ' − ' : ' + ') + co + t : (v < 0 ? MI : '') + co + t;
    };
    add(a, 'x²'); add(b, 'x'); add(c, '');
    return s || '0';
  };

  /* the explore view: y = x² − 2x + c, with c from −3 to 9 */
  const EXV = { x0: -2.5, x1: 4.5, y0: -5, y1: 10, iy: 3.2 };
  const CMIN = -3, CMAX = 9;

  /* ---------- Part 1 of the worked example: x² − 2x + 5 = 0 ---------- */
  const WORK = [
    { part: 'Part 1 of 3: the quadratic formula',
      q: 'The formula is x = (−b ± √(b² − 4ac)) / (2a). Here a = 1, b = −2 and c = 5. First piece: what is b² − 4ac?',
      opts: [['24', 'That adds 20. The formula subtracts: b² − 4ac = 4 − 20, not 4 + 20.'],
             ['−24', '(−2)² is +4, not −4, because a negative number squared is positive. Then 4 − 20 = −16.'],
             ['16', 'Look at the signs again: 4 − 20 is −16, not 16. The minus sign matters here, because it is the whole story of this lesson.'],
             ['−16', 'b² = (−2)² = 4 and 4ac = 4 × 1 × 5 = 20, so b² − 4ac = 4 − 20 = −16. It is negative: the curve never reaches the x-axis, and the formula needs the square root of a negative number.']], ans: 3,
      done: 'b² − 4ac = (−2)² − 4(1)(5) = 4 − 20 = −16' },
    { part: 'Part 1 of 3: the quadratic formula',
      q: 'Next piece: √(−16). No real number squares to −16, so use i, where i² = −1. What is √(−16)?',
      opts: [['4', '4² = 16, not −16. The square of any real number is never negative.'],
             ['4i', '(4i)² = 16 × i² = 16 × (−1) = −16. So √(−16) = 4i. (−4i also squares to −16, which is why the formula has ±.)'],
             ['16i', '(16i)² = 256 × i² = −256. The root of 16 is 4, so the root of −16 is 4i.'],
             ['−16', '−16 is the number under the root, not its root.']], ans: 1,
      done: '√(−16) = i√16 = 4i, so x = (−(−2) ± 4i) / (2 × 1) = (2 ± 4i) / 2' },
    { part: 'Part 1 of 3: the quadratic formula',
      q: 'Now finish: x = (2 ± 4i) / 2. Divide the whole top by 2. What are the roots?',
      opts: [['x = 2 ± 2i', 'Only the 4i was divided by 2. The 2 on top must be divided by 2 too: 2 ÷ 2 = 1.'],
             ['x = 1 ± 4i', 'Only the 2 was divided. The 4i must be divided too: 4i ÷ 2 = 2i.'],
             ['x = 1 + 2i only', 'The ± gives two roots: 1 + 2i and 1 − 2i.'],
             ['x = 1 ± 2i', 'Divide both parts of the top by 2: 2 ÷ 2 = 1 and 4i ÷ 2 = 2i. The two roots are 1 + 2i and 1 − 2i. Look at the plane below: they are now points.']], ans: 3,
      done: 'x = (2 ± 4i) / 2 = 1 ± 2i, so the roots are 1 + 2i and 1 − 2i', found: true },
    { part: 'Part 2 of 3: check the root',
      q: 'Check x = 1 + 2i in x² − 2x + 5. First piece: (1 + 2i)². Multiply it out and use i² = −1.',
      opts: [['5 + 4i', 'That uses i² = +1. But i² = −1, so 4i² = −4, and 1 − 4 = −3.'],
             ['−3', 'You dropped the middle part. (1 + 2i)(1 + 2i) = 1 + 2i + 2i + 4i², and 2i + 2i = 4i stays.'],
             ['−3 + 4i', '1 + 2i + 2i + 4i² = 1 + 4i + 4(−1) = −3 + 4i.'],
             ['1 + 4i', 'The last part is missing: (2i)² = 4i² = −4. So 1 + 4i − 4 = −3 + 4i.']], ans: 2,
      done: '(1 + 2i)² = 1 + 4i + 4i² = −3 + 4i' },
    { part: 'Part 2 of 3: check the root',
      q: 'Next piece: −2x with x = 1 + 2i. What is −2(1 + 2i)?',
      opts: [['−2 + 4i', 'Multiply 2i by −2: that is −4i, not +4i.'],
             ['−2 + 2i', 'Only the 1 was multiplied by −2. Multiply the 2i as well: −2 × 2i = −4i.'],
             ['−2 − 4i', '−2 × 1 = −2 and −2 × 2i = −4i.'],
             ['2 + 4i', 'Both signs are flipped. −2 times a positive number is negative.']], ans: 2,
      done: '−2(1 + 2i) = −2 − 4i' },
    { part: 'Part 2 of 3: check the root',
      q: 'Add the three pieces: (−3 + 4i) + (−2 − 4i) + 5. What is the total?',
      opts: [['8i', '4i and −4i have opposite signs, so they cancel to 0.'],
             ['−5', 'Real parts: −3 − 2 + 5 = 0, not −5.'],
             ['10', 'The real parts are −3, −2 and +5. They add to 0.'],
             ['0', 'Real parts: −3 − 2 + 5 = 0. Imaginary parts: 4i − 4i = 0. The total is 0, so 1 + 2i really is a root. The same check works for 1 − 2i.']], ans: 3,
      done: '(−3 + 4i) + (−2 − 4i) + 5 = 0, so 1 + 2i is a root' },
    { part: 'Part 3 of 3: a second method',
      q: 'Complete the square. Move the 5 across: x² − 2x = −5. Half of −2 is −1, and (−1)² = 1, so add 1 to both sides. Write the result with a square on the left.',
      opts: [['(x − 1)² = −6', 'Both sides get +1: −5 + 1 = −4, not −6.'],
             ['(x + 1)² = −4', 'Half of −2 is −1, so the square is (x − 1)². (x + 1)² would give +2x in the middle.'],
             ['(x − 1)² = 6', 'The right side is −5 + 1 = −4. It stays negative.'],
             ['(x − 1)² = −4', 'x² − 2x + 1 = (x − 1)² on the left. On the right, −5 + 1 = −4.']], ans: 3,
      done: 'x² − 2x = −5, then x² − 2x + 1 = −5 + 1, so (x − 1)² = −4' },
    { part: 'Part 3 of 3: a second method',
      q: 'Take the square root of both sides of (x − 1)² = −4. What is x − 1?',
      opts: [['±2i', '(2i)² = 4i² = −4, and (−2i)² = −4 too. So x − 1 = 2i or x − 1 = −2i, and x = 1 ± 2i. Same roots as the formula.'],
             ['±2', '(±2)² = 4, not −4. A real number squared is never negative.'],
             ['2i only', 'Both 2i and −2i square to −4, so there are two roots.'],
             ['±4i', '(4i)² = 16i² = −16, not −4.']], ans: 0,
      done: 'x − 1 = ±2i, so x = 1 ± 2i. The same roots as the formula' },
    { part: 'Part 3 of 3: a second method',
      q: 'The roots are 1 + 2i and 1 − 2i. Add them, then multiply them (use i² = −1). What do you get?',
      opts: [['sum 2, product 5', 'Sum: (1 + 2i) + (1 − 2i) = 2. Product: (1 + 2i)(1 − 2i) = 1 − 4i² = 1 + 4 = 5. And −b/a = 2, c/a = 5: they match the equation x² − 2x + 5.'],
             ['sum 2, product −3', 'The product is 1 − (2i)² = 1 − 4i² = 1 + 4 = 5. Since i² = −1, the minus sign becomes plus.'],
             ['sum −2, product 5', 'The sum is +2. Compare: −b/a = −(−2)/1 = 2.'],
             ['sum 4i, product 5', 'The 2i and −2i cancel in the sum. 4i would be their difference.']], ans: 0,
      done: 'sum = 2 = −b/a and product = 5 = c/a, so x² − 2x + 5 = (x − 1 − 2i)(x − 1 + 2i)' }
  ];

  /* ---------- Practice problems (a fixed list). f = [a, b, c] and view = what the graph shows after the answer ---------- */
  const V7 = (x0, y1) => ({ x0, x1: x0 + 7, y0: -2, y1, iy: 3.2 });
  const PROBS = [
    { f: [1, 2, 5], view: V7(-4.5, 12), q: 'For x² + 2x + 5 = 0 we have a = 1, b = 2, c = 5. Work out D = b² − 4ac. How many real roots does the equation have?',
      opts: [['Two real roots', 'D = 4 − 20 = −16 is not positive. Two real roots need D > 0.'],
             ['One real root', 'One root needs D = 0 exactly. Here D = 2² − 4(1)(5) = 4 − 20 = −16.'],
             ['No real roots: two non-real complex roots', 'D = 4 − 20 = −16 is negative, so no real roots. The parabola has its vertex (−1, 4) above the x-axis. The two non-real roots are −1 + 2i and −1 − 2i.'],
             ['D = 24, so two real roots', 'The formula subtracts 4ac: 4 − 20 = −16. (24 would come from 4 + 20.)']], ans: 2 },
    { f: [1, 0, 4], view: V7(-3.5, 12), q: 'Solve x² + 4 = 0. (Here a = 1, b = 0, c = 4.)',
      opts: [['x = 2 and x = −2', 'Check: 2² + 4 = 8, not 0. A real number squared is never negative, so x² = −4 has no real solution.'],
             ['x = 2i and x = −2i', 'x² = −4, so x = ±2i. Check: (2i)² = 4i² = −4, and −4 + 4 = 0. With the formula, D = 0 − 16 = −16 and x = (0 ± 4i)/2 = ±2i.'],
             ['x = 2i only', 'There are two roots. The ± gives 2i and −2i. Check −2i: (−2i)² = 4i² = −4.'],
             ['x = 4i and x = −4i', '(4i)² = 16i² = −16, and −16 + 4 = −12, not 0. The square root of −4 is 2i.']], ans: 1 },
    { f: [1, -6, 13], view: V7(-.5, 12), q: 'Solve x² − 6x + 13 = 0 with the quadratic formula. Here a = 1, b = −6, c = 13.',
      opts: [['x = 6 ± 4i', 'You forgot to divide by 2a = 2. Divide both the 6 and the 4i by 2.'],
             ['x = 3 ± 4i', 'Only the 6 was divided by 2. Divide the 4i too: 4i ÷ 2 = 2i.'],
             ['x = −3 ± 2i', 'The formula starts with −b = −(−6) = +6, so the real part is +3, not −3.'],
             ['x = 3 ± 2i', 'D = 36 − 52 = −16 and √(−16) = 4i, so x = (6 ± 4i)/2 = 3 ± 2i.']], ans: 3 },
    { f: [2, 2, 5], view: { x0: -4, x1: 3, y0: -2, y1: 14, iy: 3.2 }, q: 'Solve 2x² + 2x + 5 = 0. Here a = 2, b = 2, c = 5, so the bottom of the formula is 2a = 4.',
      opts: [['x = −1/2 ± (3/2)i', 'D = 4 − 4(2)(5) = −36 and √(−36) = 6i, so x = (−2 ± 6i)/4. Divide top and bottom by 2: −1/2 ± (3/2)i.'],
             ['x = −1 ± 3i', 'The bottom is 2a = 4, not 2. (−2 ± 6i)/2 would give −1 ± 3i, but a is 2 here.'],
             ['x = 1/2 ± (3/2)i', 'The formula starts with −b = −2, so the real part is −2/4 = −1/2, not +1/2.'],
             ['x = −1/2 ± 6i', 'Divide the 6i by 4 as well: 6i/4 = (3/2)i.']], ans: 0 },
    { f: [1, -6, 10], view: V7(-.5, 10), q: 'Is x = 3 + i a root of x² − 6x + 10 = 0? Substitute it and simplify, using i² = −1.',
      opts: [['No: (3 + i)² = 10 + 6i, so the total is 2.', 'That uses i² = +1. But i² = −1, so (3 + i)² = 9 + 6i + i² = 8 + 6i.'],
             ['No: the total is 6i.', 'That forgets to multiply the i in −6(3 + i) = −18 − 6i. Then the 6i terms cancel.'],
             ['Yes: 8 + 6i − 18 − 6i + 10 = 0.', '(3 + i)² = 9 + 6i − 1 = 8 + 6i and −6(3 + i) = −18 − 6i. The total is (8 − 18 + 10) + (6i − 6i) = 0, so 3 + i is a root. So is 3 − i.'],
             ['Cannot tell: i is not a number you can put in.', 'You can substitute i like any number, using i² = −1. This is exactly how complex roots are checked.']], ans: 2 },
    { f: [1, -4, 13], view: V7(-1.5, 16), q: 'Build a quadratic with roots 2 + 3i and 2 − 3i. Use the sum and the product of the roots and write x² − (sum)x + (product).',
      opts: [['x² + 4x + 13', 'The sum is 4 and the middle term is −(sum)x = −4x. The sign flips.'],
             ['x² − 4x + 13', 'Sum: (2 + 3i) + (2 − 3i) = 4. Product: (2 + 3i)(2 − 3i) = 4 − 9i² = 4 + 9 = 13. Check with the formula: D = 16 − 52 = −36 and x = (4 ± 6i)/2 = 2 ± 3i.'],
             ['x² − 4x − 5', 'The product is 4 − 9i² and i² = −1, so it is 4 + 9 = 13, not 4 − 9.'],
             ['x² − 13x + 4', 'The sum and product are swapped. With sum 4 and product 13, it is x² − 4x + 13.']], ans: 1 },
    { f: [1, -2, 5], view: EXV, q: 'Four students solve x² − 2x + 5 = 0. Which answer is complete and correct?',
      opts: [['x = 1 + 2i', 'That is only one root. The other is its conjugate, 1 − 2i. When the coefficients are real, roots that are not real come in pairs.'],
             ['x = 1 + 2i or x = 1 − 2', 'The i must stay with the 2: the conjugate is 1 − 2i. And 1 − 2 = −1 is not a root: (−1)² − 2(−1) + 5 = 8.'],
             ['x = 2i or x = −2i', 'Those are the roots of x² + 4 = 0. The real part 1 is missing. Check 2i: (2i)² − 2(2i) + 5 = 1 − 4i, not 0.'],
             ['x = 1 + 2i or x = 1 − 2i', 'Both roots, written as a conjugate pair 1 ± 2i. Their sum is 2 = −b/a and their product is 5 = c/a.']], ans: 3 },
    { f: [1, 0, 9], view: V7(-3.5, 14), q: 'Factor x² + 9 over the complex numbers.',
      opts: [['(x + 3i)(x − 3i)', 'Check: (x + 3i)(x − 3i) = x² − 9i² = x² + 9. The roots are 3i and −3i, so the factors are x − 3i and x + 3i.'],
             ['(x + 3)(x − 3)', 'That multiplies out to x² − 9. The sign of the 9 is wrong.'],
             ['(x + 3i)²', 'That is x² + 6ix + 9i² = x² + 6ix − 9. The two factors must differ: x + 3i and x − 3i.'],
             ['It cannot be factored', 'Over the real numbers it cannot. Over the complex numbers it can, using its roots 3i and −3i.']], ans: 0 }
  ];

  register({
    id: 'complex-roots-of-quadratics', level: 'school',
    title: 'Complex roots of quadratics',
    blurb: 'Lift a parabola off the x-axis and watch the real roots meet, then leave the axis as a pair of complex numbers.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 1; p.cy = 0; p.span = 4;
      p.grid(1);
      p.path([[-1.4, 0], [1, 0]], { stroke: alpha(pal.violet, .5), width: 2.2 });
      p.path([[1, 0], [3.4, 0]], { stroke: alpha(pal.violet, .5), width: 2.2 });
      p.path([[1, -2.6], [1, 2.6]], { stroke: alpha(pal.violet, .5), width: 2.2, dash: [5, 5] });
      p.dot(1, 0, 4.5, pal.yellow, pal.stage, 1.5);
      p.dot(1, 2, 6, pal.green, pal.stage, 2); p.dot(1, -2, 6, pal.green, pal.stage, 2);
      p.dot(-1, 0, 4.5, pal.green, pal.stage, 1.5); p.dot(3, 0, 4.5, pal.green, pal.stage, 1.5);
    },
    hook: String.raw`Lift the parabola \(y=x^2-2x+c\) off the x-axis and its roots vanish from the graph. Where do they go?`,
    steps: [
      { title: 'Lift the parabola',
        text: String.raw`<p>A <b>root</b> of \(x^2-2x+c=0\) is an \(x\) where the curve \(y=x^2-2x+c\) meets the x-axis. At \(c=0\) the roots are \(0\) and \(2\).</p><p>Predict first: when \(c=7\), how many times does the curve meet the axis? Answer in the panel. Then slide \(c\) and watch the green dots.</p>`,
        set: { c: 0, pl: 0, s: 1 } },
      { title: 'The discriminant decides',
        text: String.raw`<p>Under the root in the quadratic formula sits \(D=b^2-4ac\), the <b>discriminant</b>. Here \(D=4-4c\).</p><p>At \(c=1\) the vertex touches the axis and \(D=0\): one root, \(x=1\). Slide \(c\): \(D>0\) gives two real roots, \(D&lt;0\) gives none on the graph. Then the formula needs \(\sqrt{D}=i\sqrt{-D}\).</p>`,
        set: { c: 1, pl: 0, s: 2 } },
      { title: 'Solve it, then check it',
        text: String.raw`<p>Take \(c=5\): \(x^2-2x+5=0\), with \(a=1,\ b=-2,\ c=5\). Choose each piece of the formula in the panel. Then put your root back into the equation, and finish with completing the square.</p><p>A root \(p+qi\) is the point \((p,q)\): \(p\) across the real axis, \(q\) up the imaginary axis.</p>`,
        set: { c: 5, pl: 0, s: 3 } },
      { title: 'One continuous story',
        text: String.raw`<p>At \(c=5\) the roots are \(1+2i\) and \(1-2i\). Place the second one in the panel.</p><p>Then slide \(c\) down. At \(c=1\) the two roots meet at \(x=1\). Below that they slide apart along the real axis. Above it they leave the axis, one up and one down, always at \(x=1\).</p>`,
        set: { c: 5, pl: 1, s: 4 } }
    ],
    formal: String.raw`
      <p>A quadratic equation \(ax^2+bx+c=0\) with real coefficients \((a\neq 0)\) is solved by the quadratic formula
      \[ x=\frac{-b\pm\sqrt{D}}{2a},\qquad D=b^2-4ac. \]
      The number \(D\) is the <em>discriminant</em>. It decides what kind of roots there are:</p>
      <p>\(D>0\): two different real roots. The parabola crosses the x-axis twice.<br>
      \(D=0\): one real root (a double root). The vertex touches the x-axis.<br>
      \(D&lt;0\): no real roots. The parabola misses the x-axis, but there are two non-real <em>complex</em> roots.</p>
      <h3>The square root of a negative number</h3>
      <p>The number \(i\) is defined by \(i^2=-1\). For \(t>0\), the numbers \(i\sqrt{t}\) and \(-i\sqrt{t}\) both square to \(-t\): \((i\sqrt{t})^2=i^2t=-t\). So when \(D&lt;0\), we write \(\sqrt{D}=i\sqrt{-D}\), and the formula gives
      \[ x=\frac{-b}{2a}\pm\frac{\sqrt{-D}}{2a}\,i. \]
      The real part \(-b/2a\) is the axis of symmetry of the parabola. The imaginary part is the same size for both roots and has opposite signs. The names "real" and "imaginary" are historical. They do not mean one kind of number is less genuine: complex numbers are used every day in electrical engineering and signal processing.</p>
      <p><em>Example.</em> For \(x^2-2x+5=0\): \(D=(-2)^2-4(1)(5)=-16\), \(\sqrt{-16}=4i\), and
      \[ x=\frac{2\pm 4i}{2}=1\pm 2i. \]
      On the complex plane these are the points \((1,2)\) and \((1,-2)\).</p>
      <h3>Checking a complex root</h3>
      <p>Substitute and use \(i^2=-1\). For \(x=1+2i\):
      \[ (1+2i)^2-2(1+2i)+5=(1+4i-4)+(-2-4i)+5=0. \]
      The real parts are \(-3-2+5=0\) and the imaginary parts are \(4i-4i=0\), so \(1+2i\) is a root.</p>
      <h3>Why the roots come in conjugate pairs</h3>
      <p>The <em>conjugate</em> of \(z=p+qi\) is \(\bar z=p-qi\), the mirror image of \(z\) in the real axis. When \(a,b,c\) are real, the formula changes only the sign of the \(i\) part between the two roots, so the two roots are conjugates of each other.</p>
      <p>Here is a second reason that does not need the formula. Conjugation keeps sums and products, and it leaves real numbers alone. So if \(az^2+bz+c=0\), conjugating both sides gives \(a\bar z^2+b\bar z+c=0\): the conjugate is a root too. This needs real coefficients. For instance \((x-1)(x-i)=x^2-(1+i)x+i\) has roots \(1\) and \(i\), which are not a conjugate pair, because one coefficient is not real.</p>
      <h3>One continuous story</h3>
      <p>The vertex form of \(y=x^2-2x+c\) is \(y=(x-1)^2+(c-1)\). Setting it to zero gives \((x-1)^2=1-c\), so
      \[ x=1\pm\sqrt{1-c}. \]
      For \(c&lt;1\) the root is real and it moves toward \(x=1\) as \(c\) grows. At \(c=1\) the two roots meet at the vertex. For \(c>1\) we have \(1-c&lt;0\), so the same formula gives \(x=1\pm i\sqrt{c-1}\): the roots leave the real axis, one up and one down, at the same real part \(x=1\). Nothing jumps: the real roots and the complex roots are one family.</p>
      <h3>Completing the square</h3>
      <p>The same roots come from \(x^2-2x+5=0\): move the constant, \(x^2-2x=-5\), add \(1\) to both sides, \((x-1)^2=-4\), and take square roots: \(x-1=\pm 2i\), so \(x=1\pm 2i\).</p>
      <h3>Factoring over the complex numbers and the sum and product of the roots</h3>
      <p>If \(r_1\) and \(r_2\) are the roots, then \(ax^2+bx+c=a(x-r_1)(x-r_2)\). Multiplying out \((x-r_1)(x-r_2)=x^2-(r_1+r_2)x+r_1r_2\) shows
      \[ r_1+r_2=-\frac{b}{a},\qquad r_1r_2=\frac{c}{a}. \]
      For our example, \(x^2-2x+5=(x-1-2i)(x-1+2i)\). The sum is \((1+2i)+(1-2i)=2=-b/a\) and the product is \((1+2i)(1-2i)=1-4i^2=5=c/a\). A conjugate pair \(p\pm qi\) always has sum \(2p\) and product \(p^2+q^2\), which are real, as they must be. To build a quadratic with roots \(2\pm 3i\): the sum is \(4\), the product is \(4+9=13\), so \(x^2-4x+13\). Likewise \(x^2+9=(x-3i)(x+3i)\), because \((x-3i)(x+3i)=x^2-9i^2=x^2+9\).</p>
      <h3>Where this shows up</h3>
      <p>Complex roots describe things that oscillate. A mass on a spring leads to an equation like \(r^2+4=0\), whose roots are \(r=\pm 2i\). The imaginary part tells how fast the motion repeats. In an alternating-current circuit the same idea appears. The lesson does not go further, but it explains why engineers care about roots that are not on the real axis.</p>`,
    check: [
      { q: 'A quadratic equation has real coefficients and its discriminant D = b² − 4ac is negative. Which statement is true?',
        choices: ['Its graph crosses the x-axis twice, at two complex points.',
                  'It has no real roots: its graph never meets the x-axis. It has two non-real complex roots, and they are conjugates of each other.',
                  'It has exactly one real root.',
                  'It has no roots at all.'], answer: 1,
        why: String.raw`If \(D&lt;0\), then \(\sqrt{D}\) is not a real number, so no real \(x\) makes the equation true. The graph, which only has real points, never reaches \(y=0\). But the formula still gives two roots \(p\pm qi\) with \(q\neq 0\), and they are conjugates. Graph crossings are only the real roots. "No real roots" does not mean "no roots".`,
        hint: 'The graph only shows real numbers. Is a root of the form p + qi, with q not 0, on the graph?' },
      { q: 'Solve x² + 6x + 25 = 0. Use a = 1, b = 6, c = 25 in the quadratic formula.',
        choices: ['x = 3 ± 4i', 'x = −6 ± 8i', 'x = −3 ± 8i', 'x = −3 ± 4i'], answer: 3,
        why: String.raw`\(D=6^2-4(1)(25)=36-100=-64\) and \(\sqrt{-64}=8i\). So \(x=\dfrac{-6\pm 8i}{2}=-3\pm 4i\). Check the sum: \(-6=-b/a\). Check the product: \((-3)^2+4^2=25=c/a\). The answer \(-6\pm 8i\) forgets to divide by 2, \(-3\pm 8i\) divides only the real part, and \(3\pm 4i\) loses the sign of \(-b\).`,
        hint: 'Find D first, then √D with i, then divide both the real part and the i part by 2a.' },
      { q: 'A student solves x² − 2x + 10 = 0.<br>Step 1: D = (−2)² − 4(1)(10) = 4 − 40 = −36.<br>Step 2: √(−36) = 6, because 6² = 36.<br>Step 3: x = (2 ± 6)/2, so x = 4 or x = −2.<br>Checking x = 4 gives 16 − 8 + 10 = 18, which is not 0. Where is the error?',
        choices: ['Step 2: √(−36) is 6i, not 6, because (6i)² = −36 but 6² = +36. The roots are 1 ± 3i.',
                  'Step 1: the discriminant should be 4 + 40 = 44.',
                  'Step 3: only the first term should be divided by 2.',
                  'There is no error: the equation simply has no roots.'], answer: 0,
        why: String.raw`The discriminant \(-36\) is right. The mistake is in Step 2: a real number never squares to \(-36\), but \((6i)^2=36i^2=-36\). So \(x=\dfrac{2\pm 6i}{2}=1\pm 3i\). Check \(1+3i\): \((1+3i)^2-2(1+3i)+10=(-8+6i)+(-2-6i)+10=0\). The roots exist: they are just not real.`,
        hint: 'Step 1 is correct. Ask what number, squared, gives −36. Does 6 do it? What about 6i?' }
    ],
    links: { prereq: ['complex-arithmetic-in-the-plane', 'quadratics-and-the-parabola'], related: ['imaginary-numbers-and-the-complex-plane', 'the-real-number-system', 'functions-as-transformations', 'solving-equations-with-a-balance', 'polar-form-and-roots-of-unity'] },

    mount({ stage, controls: C }) {
      const st = { c: 0, pl: 0, s: 1, practice: false, rv: 0 };
      let cancel = () => {};
      const panel = stage.nextElementSibling;
      stage.classList.add('split');
      const top = h('div', { class: 'pane', style: 'flex: 9 1 0' }), bot = h('div', { class: 'pane', style: 'flex: 11 1 0' });
      stage.append(top, bot);
      const P1 = new Plane(top, { span: 5 }), P2 = new Plane(bot, { span: 5 });
      const HT = 52, HB = 52, MB = 24;
      let gm = null;
      let predDone = false, placed = false, wkI = 0, wkFound = false, wkEnd = false;
      const wkLog = [], badPick = new Set();
      let prIdx = 0, prFirst = 0, prDone = 0, prTried = false, prSolved = false, prOver = false;

      const Q = () => (st.practice ? PROBS[prIdx].f : [1, -2, st.c]);
      const cplxOK = () => st.s === 4 || wkFound;
      const lockSlider = () => st.practice || (st.s === 1 && !predDone) || st.s === 3 || (st.s === 4 && !placed);

      /* ----- shared geometry: the real part runs across both panes, so x lines up ----- */
      const maps = () => {
        const v = st.practice ? PROBS[prIdx].view : EXV;
        const sx = Math.min(P2.w / (v.x1 - v.x0), (P2.h - HB - 10) / (2 * v.iy)), xc = (v.x0 + v.x1) / 2;
        gm = { v, sx, xc };
        const ph = P1.h - MB - HT;
        P1.X = x => P1.w / 2 + (x - xc) * sx;
        P2.X = x => P2.w / 2 + (x - xc) * sx;
        P1.Y = y => P1.h - MB - (y - v.y0) / (v.y1 - v.y0) * ph;
        P2.Y = y => HB + (P2.h - HB) / 2 - y * sx;
        P1.toMath = (px, py) => [(px - P1.w / 2) / sx + xc, v.y0 + (P1.h - MB - py) / ph * (v.y1 - v.y0)];
      };
      const font = (c, size, weight = 500) => { c.font = `${weight} ${size}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`; };

      /* ----- top pane: the parabola ----- */
      P1.onDraw = (c, p) => {
        maps();
        const pal = p.pal, { v, sx, xc } = gm, [a, b, cc] = Q(), sol = solve(a, b, cc);
        const show = st.practice ? st.rv > .5 : true;
        const xmin = xc - p.w / 2 / sx, xmax = xc + p.w / 2 / sx, yb = p.h - MB, ppu = (yb - HT) / (v.y1 - v.y0);
        let ys = 1; while (ppu * ys < 24) ys *= 2;
        c.save(); c.beginPath(); c.rect(0, HT, p.w, yb - HT); c.clip();
        c.strokeStyle = pal.grid; c.lineWidth = 1; c.beginPath();
        for (let x = Math.ceil(xmin); x <= xmax; x++) { c.moveTo(p.X(x), HT); c.lineTo(p.X(x), yb); }
        for (let y = Math.ceil(v.y0 / ys) * ys; y <= v.y1; y += ys) { c.moveTo(0, p.Y(y)); c.lineTo(p.w, p.Y(y)); }
        c.stroke();
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.beginPath();
        c.moveTo(p.X(0), HT); c.lineTo(p.X(0), yb); c.moveTo(0, p.Y(0)); c.lineTo(p.w, p.Y(0)); c.stroke();
        const h0 = -b / (2 * a), k0 = cc - b * b / (4 * a);
        if (show) {
          p.path([[h0, v.y0 - 2], [h0, v.y1 + 2]], { stroke: alpha(pal.violet, .8), width: 1.8, dash: [8, 7] });
          const pts = []; for (let i = 0; i <= 240; i++) { const x = xmin + (xmax - xmin) * i / 240; pts.push([x, a * x * x + b * x + cc]); }
          p.path(pts, { stroke: pal.blue, width: 3.5 });
          if (sol.real) {
            if (sol.D < .005) p.dot(sol.r1, 0, 7.5, pal.green, pal.stage, 2.5);
            else { p.dot(sol.r1, 0, 7.5, pal.green, pal.stage, 2.5); p.dot(sol.r2, 0, 7.5, pal.green, pal.stage, 2.5); }
          }
          const ring = !st.practice && !lockSlider();
          p.dot(h0, k0, 7.5, pal.yellow, ring ? pal.brass : pal.stage, ring ? 3 : 2);
        } else {
          font(c, clamp(p.w / 26, 14, 18)); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = pal.muted;
          c.fillText('Answer the question to see the graph.', p.w / 2, HT + (yb - HT) * .22);
        }
        c.restore();
        /* tick numbers */
        const fs = clamp(p.w / 28, 13, 15);
        font(c, fs); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = pal.muted;
        let xs = 1; while (sx * xs < 28) xs *= 2;
        for (let x = Math.ceil(xmin / xs) * xs; x <= xmax; x += xs) c.fillText(num(x), p.X(x), yb + 12);
        c.textAlign = 'right';
        for (let y = Math.ceil(v.y0 / ys) * ys; y <= v.y1; y += ys) {
          if (y === 0 || p.Y(y) < HT + 8 || p.Y(y) > yb - 8) continue;
          c.lineWidth = 4; c.strokeStyle = pal.stage; c.lineJoin = 'round'; c.strokeText(num(y), p.X(0) - 7, p.Y(y)); c.fillText(num(y), p.X(0) - 7, p.Y(y));
        }
        p.label('x', xmax - .4, 0, { size: 20, color: pal.muted, dy: -13 });
        p.label('y', 0, v.y1 - .9, { size: 20, color: pal.muted, dx: 13 });
        if (show && !st.practice) p.label(`axis x = ${frac(h0)}`, h0, v.y1 - 1.2, { size: 17, italic: false, color: pal.violet, dx: 7, align: 'left' });
        /* header */
        const D = sol.D, verdict = D > 1e-9 ? 'two real roots' : D > -1e-9 ? 'one real root' : 'no real roots';
        const l1 = `y = ${poly(a, b, st.practice ? cc : cc)}` + (show ? `    vertex (${frac(h0)}, ${frac(k0)})` : '');
        const l2 = show ? `D = b² − 4ac = ${num(D)}: ${verdict}` : 'D = b² − 4ac decides the roots.';
        c.fillStyle = pal.stage; c.fillRect(0, 0, p.w, HT);
        font(c, clamp(p.w / 27, 13, 17)); c.textAlign = 'left'; c.textBaseline = 'middle';
        c.fillStyle = pal.text; c.fillText(l1, 26, 17); c.fillStyle = pal.muted; c.fillText(l2, 26, 17 + clamp(p.w / 27, 13, 17) + 8);
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 1; c.beginPath(); c.moveTo(0, HT - .5); c.lineTo(p.w, HT - .5); c.stroke();
      };

      /* ----- bottom pane: the number line that grows into the complex plane ----- */
      const CAND = [[-1, 2, 'A'], [1, -2, 'B'], [-1, -2, 'C']];
      P2.onDraw = (c, p) => {
        maps();
        const pal = p.pal, { v, sx, xc } = gm, [a, b, cc] = Q(), sol = solve(a, b, cc);
        const pa = st.practice ? 1 : st.pl, show = st.practice ? st.rv > .5 : true;
        const xmin = xc - p.w / 2 / sx, xmax = xc + p.w / 2 / sx, ymax = (p.h - HB) / 2 / sx, y0px = p.Y(0);
        c.save(); c.beginPath(); c.rect(0, HB, p.w, p.h - HB); c.clip();
        c.lineWidth = 1; c.beginPath(); c.strokeStyle = pal.grid;
        for (let x = Math.ceil(xmin); x <= xmax; x++) { c.moveTo(p.X(x), HB); c.lineTo(p.X(x), p.h); }
        c.stroke();
        c.globalAlpha = pa; c.beginPath();
        for (let y = Math.ceil(-ymax); y <= ymax; y++) { c.moveTo(0, p.Y(y)); c.lineTo(p.w, p.Y(y)); }
        c.stroke();
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.beginPath(); c.moveTo(p.X(0), HB); c.lineTo(p.X(0), p.h); c.stroke();
        c.globalAlpha = 1; c.beginPath(); c.moveTo(0, y0px); c.lineTo(p.w, y0px); c.stroke();
        const h0 = -b / (2 * a);
        if (show && pa > .01 && !st.practice) p.path([[h0, -ymax - 1], [h0, ymax + 1]], { stroke: alpha(pal.violet, .6 * pa), width: 1.8, dash: [8, 7] });
        const pairOn = st.practice ? true : (st.s !== 4 || placed);
        if (show) {
          if (sol.real) {
            p.dot(sol.r1, 0, 7.5, pal.green, pal.stage, 2.5);
            if (sol.D >= .005) p.dot(sol.r2, 0, 7.5, pal.green, pal.stage, 2.5);
          } else if (pa > .01) {
            c.globalAlpha = pa;
            if (pairOn) p.path([[sol.re, -sol.im], [sol.re, sol.im]], { stroke: alpha(pal.violet, .9), width: 2.2, dash: [3, 5] });
            p.dot(sol.re, sol.im, 8, pal.green, pal.stage, 2.5);
            if (pairOn) p.dot(sol.re, -sol.im, 8, pal.green, pal.stage, 2.5);
            c.globalAlpha = 1;
          }
        }
        /* candidates for the second root (step 4) */
        if (!st.practice && st.s === 4 && !placed && pa > .01) {
          CAND.forEach(([x, y, t], i) => {
            c.globalAlpha = pa;
            p.dot(x, y, 9, pal.stage, badPick.has(i) ? pal.red : pal.violet, 2.5);
            p.label(t, x, y, { size: 21, italic: false, color: badPick.has(i) ? pal.red : pal.text, dx: x < 0 ? -19 : 19, dy: -13 });
            c.globalAlpha = 1;
          });
        }
        c.restore();
        /* labels */
        const fs = clamp(p.w / 28, 13, 15);
        font(c, fs); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = pal.muted;
        let xs = 1; while (sx * xs < 28) xs *= 2;
        c.lineJoin = 'round';
        const halo = (s, x, y) => { c.lineWidth = 4; c.strokeStyle = pal.stage; c.strokeText(s, x, y); c.fillText(s, x, y); };
        for (let x = Math.ceil(xmin / xs) * xs; x <= xmax; x += xs) if (x !== 0) halo(num(x), p.X(x), y0px + 13);
        if (pa > .01) {
          c.globalAlpha = pa; c.textAlign = 'right';
          if (xmin < 0) halo('0', p.X(0) - 7, y0px + 13);
          for (let y = -Math.floor(ymax); y <= Math.floor(ymax); y++) if (y !== 0) halo((y === 1 ? 'i' : y === -1 ? '−i' : y < 0 ? '−' + (-y) + 'i' : y + 'i'), p.X(0) - 7, p.Y(y));
          c.globalAlpha = 1;
          p.label('Re', xmax - .45, 0, { size: 19, italic: false, color: pal.muted, dy: -14, alpha: pa });
          p.label('Im', 0, ymax - .35, { size: 19, italic: false, color: pal.muted, dx: 18, alpha: pa });
          if (show && !st.practice) p.label(`x = ${frac(h0)}`, h0, .42, { size: 17, italic: false, color: pal.violet, dx: 7, align: 'left', alpha: pa });
        }
        if (show && !sol.real && pa > .01) {
          const lab = (im, up) => p.label(cpx(sol.re, im), sol.re, im, { size: 19, italic: false, color: pal.text, dx: 13, dy: up ? -2 : 2, align: 'left', alpha: pa });
          lab(sol.im, true); if (pairOn) lab(-sol.im, false);
        }
        /* header */
        c.fillStyle = pal.stage; c.fillRect(0, 0, p.w, HB);
        const hf = clamp(p.w / 27, 13, 17);
        let l1, l2;
        if (st.practice && !show) { l1 = 'Complex plane: p + qi is the point (p, q)'; l2 = 'Answer the question to see the roots.'; }
        else if (pa < .5) { l1 = 'The real roots, on the number line'; l2 = sol.real ? 'Green dots: the roots.' : 'No real roots here: nothing to show yet.'; }
        else {
          l1 = 'Complex plane: p + qi is the point (p, q)';
          l2 = sol.real ? 'Real roots have q = 0: they sit on the real axis.' : !pairOn ? 'One root is placed. Where is the other?' : 'A conjugate pair: mirror images in the real axis.';
        }
        font(c, hf); c.textAlign = 'left'; c.textBaseline = 'middle';
        c.fillStyle = pal.text; c.fillText(l1, 26, 17); c.fillStyle = pal.muted; c.fillText(l2, 26, 17 + hf + 8);
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 1; c.beginPath(); c.moveTo(0, HB - .5); c.lineTo(p.w, HB - .5); c.stroke();
      };

      /* ----- panel helpers ----- */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const S = o => { const s = C.slider(o); s.inp = panel.lastElementChild.querySelector('input'); return s; };
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const addTo = (...els) => panel.append(...els);
      const lines = a => a.filter(Boolean).join('<br>');

      /* a question with choice buttons and explained feedback */
      const quizBox = (onRight, onWrong) => {
        const q = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' }), ch = h('div', { class: 'ctl buttons' }), fb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        let item = null, solved = false;
        const pick = i => {
          if (solved) return;
          const right = i === item.ans, btn = ch.children[i], txt = item.opts[i][1];
          if (right) {
            solved = true; Array.from(ch.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary');
            fb.innerHTML = good('Right.') + ' ' + txt; onRight(item, i);
          } else { btn.disabled = true; fb.innerHTML = bad('Not quite.') + ' ' + txt + ' Try another answer.'; if (onWrong) onWrong(item, i); }
        };
        const load = it => {
          item = it; solved = false; q.textContent = it.q; fb.innerHTML = ''; ch.replaceChildren();
          it.opts.forEach((o, i) => ch.append(mkBtn(o[0], () => pick(i))));
        };
        return { q, ch, fb, load, isSolved: () => solved };
      };

      let predBox, placeBox, wkBox, prBox, cS, sweepBtn, ro, wkPart, wkNext, wkLogEl, ptally, pnext, startBtn;

      /* ----- step 1: predict ----- */
      grp('pred', () => {
        C.title('Predict first');
        predBox = quizBox(() => { predDone = true; cancel(); cancel = animateTo(st, { c: 7 }, 1100, sync); sync(); }, null);
        predBox.load({
          q: 'Take c = 7, so the curve is y = x² − 2x + 7. How many real roots does it have? That is, how many times does the curve meet the x-axis?',
          opts: [['Two', 'It goes up on both sides, so it can feel as if it must cross. But what matters is the lowest point, the vertex. For c = 7 the vertex is (1, 6), and the curve never gets below y = 6.'],
                 ['One', 'One root needs the vertex to sit exactly on the axis, and that happens at c = 1. At c = 7 the vertex is at height c − 1 = 6.'],
                 ['None', 'The vertex is (1, 6) and the curve opens upward, so y is always at least 6 and never reaches 0. D = 4 − 4(7) = −24 is negative. The slider is now unlocked. Slide c and watch.']], ans: 2
        });
        addTo(predBox.q, predBox.ch, predBox.fb);
      });

      /* ----- step 3: the worked example ----- */
      grp('work', () => {
        C.title('Solve x² − 2x + 5 = 0');
        wkPart = h('p', { class: 'hint' });
        wkBox = quizBox(it => {
          wkLog.push(it.done);
          if (it.found) { wkFound = true; cancel(); cancel = animateTo(st, { pl: 1 }, 900, sync); }
          wkNext.disabled = false; wkNext.textContent = wkI === WORK.length - 1 ? 'Finish' : 'Next piece'; renderWk(); sync();
        }, null);
        wkNext = mkBtn('Next piece', () => { if (wkI < WORK.length - 1) { wkI++; loadWk(); } else { wkEnd = true; renderWk(); } sync(); }, true);
        wkLogEl = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        addTo(wkPart, wkBox.q, wkBox.ch, wkBox.fb, h('div', { class: 'ctl buttons' }, wkNext), wkLogEl);
      });
      const loadWk = () => { wkBox.load(WORK[wkI]); wkNext.disabled = true; wkNext.textContent = 'Next piece'; renderWk(); };
      const renderWk = () => {
        wkPart.textContent = wkEnd ? 'All three parts are done.' : WORK[wkI].part;
        if (wkEnd) { wkBox.q.textContent = 'Both methods give x = 1 ± 2i, and the roots pass every check.'; wkBox.ch.replaceChildren(); wkBox.fb.innerHTML = ''; wkNext.style.display = 'none'; }
        wkLogEl.innerHTML = lines([kk('Equation') + ' x² − 2x + 5 = 0, so a = 1, b = −2, c = 5', ...wkLog.map((t, i) => kk(String(i + 1)) + ' ' + t)]);
      };

      /* ----- step 4: place the second root ----- */
      grp('place', () => {
        C.title('Place the other root');
        placeBox = quizBox(() => { placed = true; sync(); }, (it, i) => { badPick.add(i); sync(); });
        placeBox.load({
          q: 'At c = 5 one root is 1 + 2i, the point (1, 2). The other root is one of the labeled points A, B or C on the plane. Which one?',
          opts: [['A  (−1, 2)', 'A is the number −1 + 2i. Its real part is −1, but both roots share the real part 1: it is −b/2a, the axis of symmetry x = 1.'],
                 ['B  (1, −2)', 'B is 1 − 2i, the conjugate: same real part, opposite imaginary part, the mirror image in the real axis. It is the other root. The slider is now unlocked: slide c and watch the pair.'],
                 ['C  (−1, −2)', 'C is −1 − 2i, the opposite of the root. The real part must stay 1. Check: (−1 − 2i)² − 2(−1 − 2i) + 5 = (−3 + 4i) + (2 + 4i) + 5 = 4 + 8i, not 0.']], ans: 1
        });
        addTo(placeBox.q, placeBox.ch, placeBox.fb);
      });

      /* ----- the c slider (all steps) ----- */
      grp('ex', () => {
        C.title('Slide c');
        cS = S({ label: 'c in y = x² − 2x + c', min: CMIN, max: CMAX, step: 1, value: 0, format: v => 'c = ' + num(v), onInput: v => { cancel(); st.c = v; sync(); } });
        sweepBtn = C.buttons([{ label: 'Sweep c from −3 up to 9', onClick: () => { cancel(); st.c = CMIN; sync(); cancel = animateTo(st, { c: CMAX }, 7000, sync); } }])[0];
        ro = C.readout();
        C.hint('Drag the yellow vertex up and down, or use the slider.');
      });

      const near1 = v => Math.abs(v - Math.round(v)) < .005;
      const rootsLine = c => {
        if (near1(c)) {
          const cc = Math.round(c), s = 1 - cc;
          if (s === 0) return 'x = 1 (one root)';
          const t = Math.abs(s), r = Math.sqrt(t), exact = Math.abs(r - Math.round(r)) < 1e-9;
          if (s > 0) return exact ? `x = ${num(1 - r)} and x = ${num(1 + r)}` : `x = 1 ± √${t} ≈ ${num(1 - r)} and ${num(1 + r)}`;
          return exact ? `x = 1 ± ${r === 1 ? '' : r}i` : `x = 1 ± ${t === 8 ? '2i√2' : 'i√' + t} (about 1 ± ${num(r)}i)`;
        }
        const so = solve(1, -2, c);
        return so.real ? `x ≈ ${num(so.r1)} and ${num(so.r2)}` : `x ≈ 1 ± ${num(so.im)}i`;
      };
      const exploreRo = () => {
        const c = st.c, D = 4 - 4 * c, L = [];
        L.push(`${kk('Equation')} ${poly(1, -2, c)} = 0`);
        L.push(`${kk('Vertex')} (1, ${num(c - 1)})`);
        L.push(`${kk('Discriminant')} D = 4 − 4c = 4 − 4(${num(c)}) = <b>${num(D)}</b>`);
        if (D > .005) L.push(good('D > 0:') + ' two different real roots. The curve crosses the x-axis twice.');
        else if (D > -.005) L.push(good('D = 0:') + ' one real root. The vertex touches the x-axis.');
        else L.push(bad('D < 0:') + ' no real roots. The curve floats above the x-axis. There are two non-real complex roots.');
        if (D < -.005 && !cplxOK()) L.push(`${kk('Roots')} none that are real (the formula needs √(${num(D)})). Step 3 finds them.`);
        else L.push(`${kk('Roots')} ${rootsLine(c)}`);
        return lines(L);
      };

      /* ----- practice ----- */
      C.title('Practice');
      C.hint('Eight short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); if (st.practice) { st.practice = false; sync(); } else { st.practice = true; if (!prOver) loadProb(); sync(); } } }])[0];
      grp('practice', () => {
        ptally = h('p', { class: 'ctl-title' });
        prBox = quizBox(() => { prSolved = true; if (!prTried) prFirst++; prDone++; st.rv = 1; pnext.disabled = false; tally(); sync(); }, () => { prTried = true; });
        pnext = mkBtn('Next problem', () => nextProb(), true);
        addTo(ptally, prBox.q, prBox.ch, prBox.fb, h('div', { class: 'ctl buttons' }, pnext));
      });
      const tally = () => { ptally.textContent = `Problem ${prIdx + 1} of ${PROBS.length}. Right on the first try: ${prFirst} of ${prDone} done`; };
      const loadProb = () => {
        prSolved = false; prTried = false; st.rv = 0;
        prBox.load({ q: `Problem ${prIdx + 1}. ` + PROBS[prIdx].q, opts: PROBS[prIdx].opts, ans: PROBS[prIdx].ans });
        pnext.disabled = true; pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem'; pnext.style.display = ''; tally();
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); sync(); return; }
        prOver = true; pnext.style.display = 'none';
        prBox.q.textContent = `All ${PROBS.length} problems are done.`; prBox.ch.replaceChildren();
        prBox.fb.innerHTML = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        prBox.ch.append(mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; prOver = false; loadProb(); sync(); }, true));
        ptally.textContent = `Right on the first try: ${prFirst} of ${PROBS.length}`; sync();
      };

      /* ----- sync ----- */
      const sync = () => {
        const prac = st.practice;
        vis(G.pred, !prac && st.s === 1); vis(G.work, !prac && st.s === 3); vis(G.place, !prac && st.s === 4); vis(G.ex, !prac); vis(G.practice, prac);
        cS.set(st.c);
        const lk = lockSlider(); cS.inp.disabled = lk; sweepBtn.disabled = lk;
        if (!prac) ro.innerHTML = exploreRo();
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        P1.draw(); P2.draw();
      };

      /* ----- dragging the vertex ----- */
      maps();
      draggable(P1, {
        hit: (px, py) => (!st.practice && !lockSlider() && near(P1, 1, st.c - 1, px, py, 20) ? 'v' : null),
        move: (hd, x, y) => { cancel(); st.c = clamp(snap(y + 1, 1), CMIN, CMAX); sync(); }
      });

      /* ----- steps ----- */
      const FLAGS = ['s'];
      const apply = (patch, immediate) => {
        cancel();
        const nums = {};
        st.practice = false;
        for (const k in patch) { if (FLAGS.includes(k)) st[k] = patch[k]; else nums[k] = patch[k]; }
        if (st.s === 3 && wkFound) nums.pl = 1;
        if (immediate) { Object.assign(st, nums); sync(); } else { sync(); cancel = animateTo(st, nums, 900, sync); }
      };
      loadWk(); sync();
      return { destroy: () => { cancel(); P1.destroy(); P2.destroy(); }, apply };
    }
  });
}
