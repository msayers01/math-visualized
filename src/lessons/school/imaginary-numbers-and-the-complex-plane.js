/* =====================================================================
   SCHOOL — Imaginary numbers and the complex plane
   ===================================================================== */
{
  const MI = '−';
  const kk = t => `<span class="k">${t}</span>`;
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const lines = a => a.filter(Boolean).join('<br>');
  const sg = v => (v < 0 ? MI : '') + (+Math.abs(v).toFixed(4));
  const par = v => (v < 0 ? `(${sg(v)})` : sg(v));
  const imag = b => (b === 1 ? 'i' : b === -1 ? MI + 'i' : sg(b) + 'i');
  const cx = (a, b) => (b === 0 ? sg(a) : a === 0 ? imag(b) : sg(a) + (b < 0 ? ' ' + MI + ' ' : ' + ') + (Math.abs(b) === 1 ? '' : sg(Math.abs(b))) + 'i');
  const pt = (a, b) => `(${sg(a)}, ${sg(b)})`;
  const bar = t => `<span style="text-decoration:overline">${t}</span>`;
  const VAL = ['1', 'i', MI + '1', MI + 'i'];
  const ip = n => 'i' + String(n).replace(/[0-9]/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);
  const FONT = s => `500 ${s}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`;
  const modText = (a, b) => {
    const n = a * a + b * b, r = Math.sqrt(n);
    return { n, r, txt: Number.isInteger(r) ? sg(r) : `√${n}`, full: Number.isInteger(r) ? sg(r) : `√${n} ≈ ${r.toFixed(2)}` };
  };

  /* ---------- square roots of negative numbers ---------- */
  /* an option is a candidate for the root: lab = its name, cof = the number in front of i, k2 = cof squared, im = 1 if it has an i */
  const sqv = o => (o.im ? -o.k2 : o.k2);
  const sqText = o => (o.im
    ? `(${o.lab})² = (${o.cof})² × i² = ${o.k2} × (${MI}1) = ${MI}${o.k2}`
    : `(${o.lab})² = ${o.k2}`);
  const mkRT = r => { r.rng = Math.max(Math.abs(r.tgt), ...r.opts.map(o => Math.abs(sqv(o)))) * 1.12; r.kind = 'root'; return r; };
  const RT = {
    r9: mkRT({ lab: '√' + MI + '9', tgt: -9, q: 'Which number, squared, gives −9? That number is what √−9 means.',
      opts: [
        { lab: '3', cof: '3', k2: 9, im: 0, why: '3 × 3 = 9, which is positive. A real number squared is never negative, so no real number can be √−9.' },
        { lab: MI + '3', cof: '3', k2: 9, im: 0, why: '(−3) × (−3) = 9. A negative times a negative is positive, so this is not −9 either.' },
        { lab: '3i', cof: '3', k2: 9, im: 1, why: good('Yes.') + ' (3i)² = 3² × i² = 9 × (−1) = −9, so √−9 = 3i.' },
        { lab: '9i', cof: '9', k2: 81, im: 1, why: 'Close, but (9i)² = 81 × (−1) = −81. You kept 9 instead of taking its square root. Take √9 = 3 first.' }],
      ans: 2, rec: 'Pull the minus out as i: √−9 = √9 × i = 3i.' }),
    r5: mkRT({ lab: '√' + MI + '5', tgt: -5, q: 'Which number, squared, gives −5?',
      opts: [
        { lab: '5i', cof: '5', k2: 25, im: 1, why: '(5i)² = 25 × (−1) = −25. You kept 5 instead of its square root. The number in front of i must square to 5.' },
        { lab: 'i√5', cof: '√5', k2: 5, im: 1, why: good('Yes.') + ' (i√5)² = i² × 5 = −5. √5 is not a whole number (about 2.24), so we leave it as √5 and write √−5 = i√5.' },
        { lab: '√5', cof: '√5', k2: 5, im: 0, why: '(√5)² = 5, which is positive. A real number squared is never negative, so you need i.' },
        { lab: MI + '5', cof: '5', k2: 25, im: 0, why: '(−5)² = 25, which is positive. Squaring a real number never gives a negative.' }],
      ans: 1, rec: 'Pull the minus out as i: √−5 = i√5. The 5 stays under the root because it is not a perfect square.' }),
    r16: mkRT({ lab: '√' + MI + '16', tgt: -16, q: 'Simplify √−16. Choose the number whose square is −16.',
      opts: [
        { lab: '16i', cof: '16', k2: 256, im: 1, why: '(16i)² = 256 × (−1) = −256. You kept 16 instead of its square root. √16 = 4.' },
        { lab: '4i', cof: '4', k2: 16, im: 1, why: good('Yes.') + ' (4i)² = 16 × (−1) = −16. (−4i also squares to −16, but √ means the one with a positive number in front: 4i.)' },
        { lab: '4', cof: '4', k2: 16, im: 0, why: '4 × 4 = 16, which is positive. A real number squared is never negative.' },
        { lab: MI + '4', cof: '4', k2: 16, im: 0, why: '(−4)² = 16, also positive. You need i to get a negative square.' }],
      ans: 1, rec: 'Pull the minus out as i: √−16 = √16 × i = 4i.' }),
    r12: mkRT({ lab: '√' + MI + '12', tgt: -12, q: 'Simplify √−12. Choose the number whose square is −12.',
      opts: [
        { lab: '6i', cof: '6', k2: 36, im: 1, why: '(6i)² = 36 × (−1) = −36. 6 is half of 12, but you need a number whose square is 12.' },
        { lab: '12i', cof: '12', k2: 144, im: 1, why: '(12i)² = 144 × (−1) = −144. You kept 12 instead of its square root.' },
        { lab: '2i√3', cof: '2√3', k2: 12, im: 1, why: good('Yes.') + ' 12 = 4 × 3, so √12 = 2√3. Then (2i√3)² = (2√3)² × i² = 12 × (−1) = −12. So √−12 = 2i√3.' },
        { lab: '3i√2', cof: '3√2', k2: 18, im: 1, why: '(3i√2)² = (3√2)² × i² = 18 × (−1) = −18. Check: 3² × 2 = 18, not 12. Write 12 = 4 × 3 instead.' }],
      ans: 2, rec: 'Pull out i, then simplify: √−12 = i√12 = i√(4 × 3) = 2i√3.' })
  };
  const TRAP = {
    kind: 'trap', q: 'What is √−4 × √−9?',
    opts: [
      ['6', 'It is tempting: √−4 × √−9 = √36 = 6. But the rule √a × √b = √(ab) was only proved for a and b that are not negative. Here it fails. Write each root with i first (see the board).'],
      ['−6', good('Yes.') + ' √−4 = 2i and √−9 = 3i, so the product is 2i × 3i = 6 × i² = 6 × (−1) = −6.'],
      ['5i', 'That is 2i + 3i, the SUM of the two roots. The question asks for the product, and 2i × 3i = 6i² = −6.'],
      ['−36', 'The 4 and the 9 sit under square roots, so they become 2 and 3, not 36. 2i × 3i = 6i² = −6.']],
    ans: 1
  };
  const TRAP2 = { ...TRAP, opts: [TRAP.opts[2], TRAP.opts[0], TRAP.opts[1], TRAP.opts[3]], ans: 2 };
  const EX = [RT.r9, RT.r5, TRAP];

  /* ---------- the goals of step 4 ---------- */
  const GP = [
    { t: [3, 2], q: 'Plot 3 + 2i.', tip: 'Real part 3: 3 steps across. Imaginary part 2: 2 steps up.' },
    { t: [-2, 3], q: 'Plot −2 + 3i.', tip: 'Real part −2: 2 steps to the LEFT. Imaginary part 3: 3 steps up.' },
    { t: [4, -1], q: 'Plot 4 − i.', tip: 'The number in front of i is −1, so the imaginary part is −1: 1 step DOWN.' },
    { read: [-4, 3], q: 'Read the yellow point. Which complex number is it?', opts: ['3 − 4i', '−4 + 3i', '−4 − 3i', '4 + 3i'], ans: 1,
      whys: ['You swapped the parts. The number across (−4) is the real part and goes first.', good('Yes.') + ' The point is (−4, 3): real part −4 (4 left), imaginary part 3 (3 up). So the number is −4 + 3i.', 'The point is ABOVE the real axis, so the imaginary part is +3, not −3.', 'The point is to the LEFT of the imaginary axis, so the real part is −4, not 4.'] },
    { t: [-3, 0], q: 'Plot −3. It has no i part, so it is −3 + 0i.', tip: 'Imaginary part 0: no steps up or down. Every real number sits on the real axis.' },
    { t: [0, 2], q: 'Plot 2i. It has no real part, so it is 0 + 2i.', tip: 'Real part 0: no steps across. Pure imaginary numbers sit on the imaginary axis.' }
  ];
  const GA = [
    { q: 'Move w so that the result lands on the real axis (imaginary part 0).' },
    { q: 'Move w so that the result is 0, right on the origin.' },
    { q: 'Move w until w = z. Two complex numbers are equal when both parts are equal.' }
  ];
  const GM = [
    { q: 'Move z to a different point with |z| = 5 (3 + 4i is one; find another).' },
    { q: 'Move z so that |z| = √2. Try small numbers.' }
  ];
  const GC = [
    { q: 'Move z so that its conjugate is 3 + 4i.' },
    { q: 'Find a number that is its own conjugate. Where must it sit?' }
  ];
  const TOOLS = [
    { name: 'Plot a number', z: [1, 1], w: [1, 2], lim: [6, 5] },
    { name: 'Add and subtract', z: [3, 1], w: [1, 2], lim: [3, 3] },
    { name: 'Size |z|', z: [3, 4], w: [1, 2], lim: [6, 5] },
    { name: 'Mirror', z: [3, 2], w: [1, 2], lim: [6, 5] }
  ];

  /* ---------- the eight practice problems ---------- */
  const ch4 = (labs, whys) => labs.map((l, i) => [l, whys[i]]);
  const PROBS = [
    { kind: 'root', rt: RT.r16, stages: [{ q: RT.r16.q, ch: RT.r16.opts.map(o => [o.lab, o.why]), ans: RT.r16.ans }] },
    { kind: 'root', rt: RT.r12, stages: [{ q: RT.r12.q, ch: RT.r12.opts.map(o => [o.lab, o.why]), ans: RT.r12.ans }] },
    { kind: 'power', n: 45, stages: [
      { q: 'You want i⁴⁵. The powers of i repeat every 4. What is the remainder when 45 is divided by 4?', ans: 1,
        ch: ch4(['0', '1', '2', '3'], ['Remainder 0 would mean 45 is a multiple of 4. But 4 × 11 = 44, and 45 is one more.', good('Yes.') + ' 4 × 11 = 44, so eleven full laps use 44 steps. 45 − 44 = 1 step is left over.', '4 × 11 = 44 and 45 − 44 = 1, not 2.', 'A remainder of 3 would need 47 (44 + 3). 45 − 44 = 1.']) },
      { q: 'So i⁴⁵ = i¹. What is i⁴⁵?', ans: 1,
        ch: ch4(['−1', 'i', '1', '−i'], ['−1 is i² (two steps). Only one step is left over.', good('Yes.') + ' After 11 full laps you are back at 1, and one step takes you to i. So i⁴⁵ = i.', '1 is where you stand after a whole number of laps (remainder 0). There is one extra step.', '−i is i³ (three steps). Only one step is left over.']) }] },
    { kind: 'read', stages: [
      { q: 'Read the yellow point. Which complex number is it?', ans: 1,
        ch: ch4(['2 − 3i', '−3 + 2i', '−3 − 2i', '3 + 2i'], ['You swapped the parts. The point is 3 to the left and 2 up, and the real part (across) goes first.', good('Yes.') + ' The point is (−3, 2): real part −3, imaginary part 2. The number is −3 + 2i.', 'The point is above the real axis, so the imaginary part is +2, not −2.', 'The point is to the left of the imaginary axis, so the real part is −3, not +3.']) },
      { q: 'What is the imaginary part of −3 + 2i?', ans: 2,
        ch: ch4(['−3', '2i', '2', '−3i'], ['−3 is the real part (across). The imaginary part is the number that goes with i.', 'The imaginary part is the real number b in a + bi, so it is 2. The i only says which direction (up) it measures.', good('Yes.') + ' In a + bi the imaginary part is b, which is 2, not 2i.', 'That mixes up the two parts. The real part is −3, and the imaginary part is 2.']) }] },
    { kind: 'add', z: [2, 3], w0: [0, -2], wt: [-3, 1], stages: [
      { type: 'plot', q: 'z = 2 + 3i is the blue point. Plot w = −3 + i with the violet handle (drag it, or use the sliders and buttons), then press Check my plot.' },
      { q: 'Now the picture shows z + w. Which number is the sum?', ans: 1,
        ch: ch4(['5 + 2i', '−1 + 4i', '−6 + 3i', '−5 + 4i'], ['That is z − w: 2 − (−3) = 5 and 3 − 1 = 2. For the sum, add: 2 + (−3) = −1.', good('Yes.') + ' Real parts: 2 + (−3) = −1. Imaginary parts: 3 + 1 = 4. The sum is −1 + 4i, the far corner of the parallelogram.', 'That multiplies the parts (2 × (−3) and 3 × 1). Adding means real with real and imaginary with imaginary.', 'The imaginary parts are right (3 + 1 = 4), but the real parts give 2 + (−3) = −1, not −5.']) }] },
    { kind: 'eq', stages: [
      { q: 'Two complex numbers are equal when both parts match. If (a + 1) + (2b)i = 4 + 6i, which pair (a, b) works?', ans: 1,
        ch: ch4(['(a, b) = (4, 6)', '(a, b) = (3, 3)', '(a, b) = (5, 3)', '(a, b) = (3, 6)'], ['Then the left side is 5 + 12i, not 4 + 6i. The real parts are a + 1 and 4, so a = 3. The imaginary parts are 2b and 6, so b = 3.', good('Yes.') + ' Real parts: a + 1 = 4, so a = 3. Imaginary parts: 2b = 6, so b = 3. The left side becomes 4 + 6i.', 'Then the left side is 6 + 6i. The real part is a + 1 = 4, so a = 4 − 1 = 3 (subtract, do not add).', 'Then the left side is 4 + 12i. The real part works (3 + 1 = 4), but 2b = 6 gives b = 3, not 6.']) }] },
    { kind: 'mod', stages: [
      { q: 'z = 5 − 12i is the point (5, −12). What is |z|, its distance from 0?', ans: 1,
        ch: ch4(['17', '13', '7', '60'], ['That adds the legs, 5 + 12. The straight distance is shorter than walking along the legs. Use Pythagoras.', good('Yes.') + ' |z|² = 5² + (−12)² = 25 + 144 = 169, and √169 = 13. (5, 12, 13 is a Pythagorean triple.)', 'That is 12 − 5. Pythagoras ADDS the squares of the legs: 25 + 144 = 169.', 'That multiplies the legs (5 × 12). Square each leg and add: 25 + 144 = 169, and √169 = 13.']) }] },
    { kind: 'trap', tr: TRAP2, stages: [
      { q: 'Last one. Find √−4 × √−9. Write each root with i first.', ch: TRAP2.opts, ans: TRAP2.ans }] }
  ];

  register({
    id: 'imaginary-numbers-and-the-complex-plane', level: 'school',
    title: 'Imaginary numbers and the complex plane',
    blurb: 'Invent a number i with i squared equal to −1, then plot numbers a + bi as points, add them and measure their distance from zero.',
    thumb(c, p) {
      const pal = p.pal; p.cx = .8; p.cy = .5; p.span = 4.4;
      p.grid(1);
      p.path([[3, 2], [3, 0]], { stroke: pal.green, width: 2.2, dash: [6, 5] });
      p.path([[3, 2], [0, 2]], { stroke: pal.red, width: 2.2, dash: [6, 5] });
      p.path([[3, 2], [3, -2]], { stroke: alpha(pal.violet, .6), width: 2, dash: [3, 5] });
      p.arrow(0, 0, 3, 2, pal.blue, 4);
      p.dot(3, 2, 7, pal.yellow, pal.stage, 2);
      p.dot(3, -2, 5.5, pal.violet, pal.stage, 2);
      p.label('3 + 2i', 2.2, 2.9, { size: 24, italic: false, color: pal.text });
      p.label('i', 0, 1, { size: 24, color: pal.red, dx: -14 });
    },
    hook: String.raw`Try to solve \(x^2=-1\). Every square on the number line is zero or more, so nothing you know works. What if we simply invent a number that does? Then numbers stop living on a line and start living on a plane.`,
    steps: [
      { title: 'A number that squares to −1',
        text: String.raw`<p>Can any number satisfy \(x^2=-1\)? Then \(x^2+1=0\): the parabola \(y=x^2+1\) would touch the x-axis.</p><p><b>Predict</b> in the panel, then drag the point along the curve and watch its height.</p><p>The way out is the one we used before. We invented negatives and fractions when an equation had no answer. Now we invent \(i\) with \(i^2=-1\).</p>`,
        set: { sc: 0, px: 2 } },
      { title: 'Square roots of negative numbers',
        text: String.raw`<p>\(\sqrt{-9}\) means a number whose square is \(-9\). Pull the minus out as \(i\): \(\sqrt{-9}=3i\), because \((3i)^2=9\cdot i^2=-9\).</p><p>Pick the right number and watch its square land on the target. Then try the trap: <b>predict</b> \(\sqrt{-4}\cdot\sqrt{-9}\) before you look.</p>`,
        set: { sc: 1, ex: 0 } },
      { title: 'The powers of i repeat',
        text: String.raw`<p>Each time you multiply by \(i\) you move one step round the wheel: \(i,\,-1,\,-i,\,1\), and then it starts again. The loop has length 4.</p><p>Step round with the slider. Then try a big exponent: find the remainder after dividing by 4, then the value.</p>`,
        set: { sc: 2, n: 0 } },
      { title: 'Numbers are points',
        text: String.raw`<p>The number \(a+bi\) is the point \((a,b)\). The real part \(a\) goes across, the imaginary part \(b\) goes up. The imaginary part is \(b\), not \(bi\).</p><p>Use the four tools: plot numbers, add them as vectors, measure the distance \(|z|\), and mirror to get the conjugate.</p>`,
        set: { sc: 3, tool: 0 } }
    ],
    formal: String.raw`
      <h3>The problem and the new number</h3>
      <p>The square of a real number is never negative: a positive times a positive is positive, a negative times a negative is positive, and \(0\cdot0=0\). So \(x^2=-1\) has no real solution. This is the same picture as the lesson: the parabola \(y=x^2+1\) has lowest height \(1\) at \(x=0\) and never reaches the x-axis.</p>
      <p>We did this before. \(x+5=2\) had no natural solution, so we invented negatives. \(2x=3\) had no integer solution, so we invented fractions. \(x^2=2\) had no rational solution, so we filled the gaps and got the real numbers. Now \(x^2=-1\) has no real solution, so we invent a number \(i\) with
      \[ i^2=-1. \]
      The <em>complex numbers</em> are all numbers \(z=a+bi\) with \(a\) and \(b\) real. We call \(a\) the <em>real part</em> and \(b\) the <em>imaginary part</em>. Note that the imaginary part is the real number \(b\), not \(bi\). Every real number is complex, with \(b=0\), so the staircase continues: \(\mathbb N\subset\mathbb Z\subset\mathbb Q\subset\mathbb R\subset\mathbb C\).</p>
      <p>The names are historical. Early mathematicians distrusted these numbers and called them "imaginary", and the numbers on the line "real". Both names stuck, but neither is a judgement. Complex numbers are used every day in electrical engineering and signal processing, for example to describe alternating current and radio signals.</p>
      <h3>Square roots of negative numbers</h3>
      <p>For \(r&gt;0\), \(\sqrt{-r}=i\sqrt r\). It works because \((i\sqrt r)^2=i^2\cdot r=-r\). The number \(-i\sqrt r\) also squares to \(-r\), but the symbol \(\sqrt{\ }\) means the one with the positive number in front. Examples: \(\sqrt{-9}=3i\), \(\sqrt{-5}=i\sqrt5\), \(\sqrt{-12}=i\sqrt{4\cdot3}=2i\sqrt3\).</p>
      <p><b>The trap.</b> The rule \(\sqrt a\cdot\sqrt b=\sqrt{ab}\) is only safe when \(a\) and \(b\) are not negative. If you use it on \(\sqrt{-4}\cdot\sqrt{-9}\) you get \(\sqrt{36}=6\), which is wrong. Put \(i\) first:
      \[ \sqrt{-4}\cdot\sqrt{-9}=2i\cdot3i=6i^2=-6. \]</p>
      <h3>Powers of i</h3>
      <p>\(i¹=i\), \(i^2=-1\), \(i^3=i^2\cdot i=-i\), \(i^4=i^2\cdot i^2=1\). Then \(i^5=i^4\cdot i=i\), and everything repeats with period 4. So \(i^n=i^r\), where \(r\) is the remainder when \(n\) is divided by 4. Example: \(103=4\cdot25+3\), so
      \[ i^{103}=(i^4)^{25}\cdot i^3=1\cdot(-i)=-i. \]</p>
      <h3>The complex plane</h3>
      <p>Draw the number \(a+bi\) as the point \((a,b)\). The horizontal axis is the <em>real axis</em> (the real numbers). The vertical axis is the <em>imaginary axis</em> (multiples of \(i\)). Then \(3-2i\) is the point \((3,-2)\), the number \(-4\) is \((-4,0)\) and \(2i\) is \((0,2)\).</p>
      <p><b>Equality.</b> \(a+bi=c+di\) exactly when \(a=c\) and \(b=d\). Why: if \(a+bi=c+di\), then \(a-c=(d-b)i\). If \(b\ne d\) we could divide and get \(i=\dfrac{a-c}{d-b}\), a real number, which is impossible because no real number squares to \(-1\). So \(b=d\), and then \(a=c\).</p>
      <p><b>Adding.</b> Add the real parts and add the imaginary parts separately:
      \[ (a+bi)+(c+di)=(a+c)+(b+d)i. \]
      On the plane this is the vector sum: the sum is the far corner of the parallelogram built on the two points. Subtracting is adding the opposite: \(z-w=z+(-w)\), and \(-w\) is \(w\) reflected through the origin. Example: \((3+i)+(1+2i)=4+3i\).</p>
      <h3>Size and mirror image</h3>
      <p>The <em>modulus</em> \(|z|\) is the distance from the origin to \(z=a+bi\). The point, the foot of the perpendicular on the real axis and the origin form a right triangle with legs \(|a|\) and \(|b|\), so by Pythagoras
      \[ |z|=\sqrt{a^2+b^2}. \]
      Example: \(|3+4i|=\sqrt{9+16}=\sqrt{25}=5\). Square the legs, even a negative one: \(|5-12i|=\sqrt{25+144}=13\).</p>
      <p>The <em>conjugate</em> of \(z=a+bi\) is \(\bar z=a-bi\): the mirror image of \(z\) in the real axis. It keeps the real part and flips the sign of the imaginary part. It lies at the same distance from the origin, so \(|\bar z|=|z|\), and a number equals its own conjugate exactly when it is real. What you can DO with conjugates comes in the next lesson.</p>`,
    check: [
      { q: 'A complex number is plotted as the point (4, −7) on the complex plane. The horizontal axis is the real axis and the vertical axis is the imaginary axis. Which statement is true?',
        choices: ['The number is −7 + 4i, because the vertical number comes first.', 'The number is 4 − 7i. Its real part is 4 and its imaginary part is −7.', 'The number is 4 − 7i. Its real part is 4 and its imaginary part is −7i.', 'The number is 4 + 7i. Its real part is 4 and its imaginary part is 7.'], answer: 1,
        why: String.raw`The point \((a,b)\) is the number \(a+bi\): the real part is the horizontal coordinate and the imaginary part is the vertical one. So \((4,-7)\) is \(4-7i\). The imaginary part is the real number \(b=-7\), not \(-7i\). Putting the vertical number first swaps the parts, and dropping the minus sign moves the point above the real axis.`,
        hint: 'The real part is how far across. The imaginary part is how far up or down, and it is just the number b in a + bi.' },
      { q: 'What is i³⁸ + √−16? Use i¹ = i, i² = −1, i³ = −i and i⁴ = 1, and write the square root of a negative number with i first.',
        choices: ['1 + 4i', '−1 + 16i', '−1 + 4i', '−1 − 4i'], answer: 2,
        why: String.raw`Divide the exponent by 4: \(38=4\cdot9+2\), so \(i^{38}=i^2=-1\). Next, \(\sqrt{-16}=i\sqrt{16}=4i\). The sum is \(-1+4i\). The choice \(1+4i\) uses remainder 0, \(-1+16i\) forgets to take the square root of 16, and \(-1-4i\) uses \(-4i\), but the symbol \(\sqrt{\ }\) means \(+4i\).`,
        hint: 'Find the remainder of 38 ÷ 4 first and read the value off the loop i, −1, −i, 1. Then simplify the root.' },
      { q: 'A student finds |−6 + 8i| like this.<br>Step 1. The real part is a = −6 and the imaginary part is b = 8.<br>Step 2. |z| = √(a² + b²) = √(−36 + 64) = √28.<br>Step 3. So |z| is about 5.3.<br>Which statement is true?',
        choices: ['Step 2 has the error: a² = (−6)² = +36, so |z| = √(36 + 64) = √100 = 10.', 'Step 1 has the error: the real part of −6 + 8i is 8.', 'Nothing is wrong: |−6 + 8i| = √28.', 'The formula is wrong: |z| = a + b = 2.'], answer: 0,
        why: String.raw`The modulus is the distance from \(0\) to the point \((-6,8)\), a right triangle with legs \(6\) and \(8\). A square is never negative: \((-6)^2=+36\). So \(|z|=\sqrt{36+64}=\sqrt{100}=10\). A negative leg does not make a negative square. The real part is \(-6\) (the horizontal coordinate), and \(a+b\) is not a distance.`,
        hint: 'Square the number first, then see the sign: (−6) × (−6) is positive. A distance can also be checked with a 6-8-10 right triangle.' }
    ],
    links: { prereq: ['the-real-number-system'], next: ['complex-arithmetic-in-the-plane'], related: ['quadratics-and-the-parabola', 'pythagorean-theorem', 'distance-and-the-pythagorean-theorem', 'negative-numbers-and-absolute-value', 'matrices', 'complex-roots-of-quadratics'] },

    mount({ stage, controls: C }) {
      const panel = stage.nextElementSibling;
      const P = new Plane(stage, { cx: 0, cy: 0, span: 6.6 });
      let cancel = () => {}, cancelM = () => {}, cancelW = () => {};
      const st = {
        sc: 0, tool: 0, practice: false,
        px: 2, pmin: 5, vis0: false, pred0: -1,
        ex: 0, cand: -1, mk: 0, tp: 0,
        n: 0, wa: 0, wn: 0, wst: 0, chal: 0, chS: 0,
        z: TOOLS[0].z.slice(), w: TOOLS[0].w.slice(), sel: 'z', op: 1,
        goal: [0, 0, 0, 0], rd: -1, goalOk: [false, false, false, false]
      };
      const CHAL = [7, 20, 103];
      let prIdx = 0, prStage = 0, prSolved = false, prTried = false, prFirst = 0, prDone = 0, prOver = false, prPicked = -1;

      const curProb = () => PROBS[prIdx];
      /* what the canvas shows: para | board | wheel | plane */
      const scene = () => {
        if (!st.practice) return ['para', 'board', 'wheel', 'plane'][st.sc];
        const k = curProb().kind;
        return k === 'root' || k === 'trap' ? 'board' : k === 'power' ? 'wheel' : 'plane';
      };
      const boardData = () => {
        if (st.practice) { const pr = curProb(); return pr.kind === 'root' ? pr.rt : pr.tr; }
        return EX[st.ex];
      };
      const LIM = () => (st.practice ? [6, 5] : TOOLS[st.tool].lim);

      /* =============== drawing =============== */
      const say = (c, text, x, y, col, fs, maxW, bold) => {
        c.font = bold ? `700 ${fs}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif` : FONT(fs);
        c.fillStyle = col; c.textAlign = 'left'; c.textBaseline = 'middle';
        const words = text.split(' '), out = []; let cur = '';
        words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (cur && c.measureText(t).width > maxW) { out.push(cur); cur = w; } else cur = t; });
        if (cur) out.push(cur);
        out.forEach((l, i) => c.fillText(l, x, y + i * fs * 1.38));
        return y + out.length * fs * 1.38;
      };
      const ctext = (c, text, x, y, col, fs, bold) => {
        c.font = bold ? `700 ${fs}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif` : FONT(fs);
        c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, x, y);
      };
      const ring = (p, x, y) => p.dot(x, y, 14, null, p.pal.brass, 2.5);
      const axesDraw = (p, c) => {
        const pal = p.pal, b = p.bounds(), sz = clamp(p.scale * .6, 15, 19), ts = p.scale < 26 ? 2 : 1;
        p.grid(1);
        for (let x = Math.ceil(b.x0 / ts) * ts; x <= b.x1; x += ts) if (x !== 0) p.label(sg(x), x, 0, { size: 15, italic: false, color: pal.muted, dy: 14 });
        for (let y = Math.ceil(b.y0 / ts) * ts; y <= b.y1; y += ts) if (y !== 0) p.label(y === 1 ? 'i' : y === -1 ? MI + 'i' : sg(y) + 'i', 0, y, { size: 15, italic: false, color: pal.muted, dx: -9, align: 'right' });
        p.label('Real axis', b.x1 - .15, 0, { size: sz, italic: false, color: pal.green, align: 'right', dy: -16 });
        p.label('Imaginary axis', 0, b.y1 - .45, { size: sz, italic: false, color: pal.red, align: 'left', dx: 10 });
      };
      const zlab = (p, a, b, text, col, sz) => {
        const right = a > 1.5;
        p.label(text, a, b, { size: sz, italic: false, color: col, align: right ? 'right' : 'left', dx: right ? -15 : 15, dy: b >= 0 ? -19 : 19 });
      };

      const zlabR = (p, a, b, text, col, sz) => p.label(text, a, b, { size: sz, italic: false, color: col, align: 'left', dx: 15, dy: b >= 0 ? -19 : 19 });
      /* --- the parabola --- */
      const drawPara = (c, p) => {
        const pal = p.pal, b = p.bounds(), sz = clamp(p.scale * .62, 15, 20);
        p.cx = 0; p.cy = 4.4; p.span = 6.7;
        p.grid(1);
        for (let x = Math.ceil(p.bounds().x0); x <= p.bounds().x1; x++) if (x) p.label(sg(x), x, 0, { size: 15, italic: false, color: pal.muted, dy: 14 });
        for (let y = 1; y <= p.bounds().y1; y++) p.label(sg(y), 0, y, { size: 15, italic: false, color: pal.muted, dx: -9, align: 'right' });
        const pr = st.pred0 >= 0;
        if (pr) {
          const bb = p.bounds();
          p.path([[bb.x0, 0], [bb.x1, 0], [bb.x1, 1], [bb.x0, 1]], { fill: alpha(pal.yellow, .28), close: true });
          p.path([[bb.x0, 1], [bb.x1, 1]], { stroke: pal.yellow, width: 2, dash: [8, 6] });
          p.label('the curve never enters this band', bb.x0 + .3, .5, { size: sz, italic: false, color: pal.text, align: 'left', dx: 0 });
        }
        p.path([[b.x0, 0], [b.x1, 0]], { stroke: pal.green, width: 3 });
        p.label('x-axis (height 0)', p.bounds().x1 - .2, 0, { size: sz, italic: false, color: pal.green, align: 'right', dy: 30 });
        const pts = []; for (let x = -4.5; x <= 4.5; x += .05) pts.push([x, x * x + 1]);
        p.curve(pts, { stroke: pal.blue, width: 3.6 });
        p.label('y = x² + 1', 3.1, 6.6, { size: sz * 1.05, italic: false, color: pal.blue, align: 'left' });
        const x = st.px, y = x * x + 1;
        p.path([[x, y], [x, 0]], { stroke: pal.red, width: 2.4, dash: [6, 5] });
        p.dot(x, 0, 4.5, pal.red, null);
        p.dot(x, y, 9, pal.blue, pal.stage, 2.5); if (st.pred0 >= 0) ring(p, x, y);
        const right = x > 1.8;
        p.label(`height ${sg(y)}`, x, y / 2, { size: sz, italic: false, color: pal.red, align: right ? 'right' : 'left', dx: right ? -9 : 9 });
        if (pr && p.h > 300) {   /* the staircase of number systems */
          const names = ['N', 'Z', 'Q', 'R', 'C'], cw = 30, gap = 16, tot = names.length * cw + (names.length - 1) * gap, x0 = (p.w - tot) / 2, yy = p.h - 18;
          names.forEach((nm, i) => {
            const xx = x0 + i * (cw + gap);
            c.fillStyle = i === 4 ? alpha(pal.yellow, .85) : alpha(pal.blue, .18); c.fillRect(xx, yy - 13, cw, 26);
            c.strokeStyle = i === 4 ? pal.yellow : pal.blue; c.lineWidth = 1.5; c.strokeRect(xx + .5, yy - 12.5, cw - 1, 25);
            ctext(c, nm, xx + cw / 2, yy + 1, i === 4 ? '#222' : pal.text, 16, true);
            if (i < 4) ctext(c, '→', xx + cw + gap / 2, yy + 1, pal.muted, 15);
          });
        }
      };

      /* --- the board: square roots, the number line, the trap --- */
      const drawBoard = (c, p) => {
        const pal = p.pal, B = boardData(), fs = clamp(p.w / 24, 13, 19), m = 14, mw = p.w - 2 * m;
        let y = m + fs * .7;
        if (B.kind === 'trap') {
          ctext(c, '√−4 × √−9 = ?', p.w / 2, y + fs * 1.4, pal.text, fs * 2.1, true);
          y += fs * 3.6;
          const pick = st.practice ? st.tp : st.tp;
          if (!pick) { say(c, 'Predict first. Choose an answer in the panel and then the board shows how to work it out.', m, y + fs, pal.muted, fs, mw); return; }
          y = say(c, 'Tempting, but wrong: √−4 × √−9 = √36 = 6.', m, y, pal.red, fs, mw, true) + fs * .15;
          y = say(c, 'The rule √a × √b = √(ab) needs a and b that are not negative.', m, y, pal.muted, fs * .95, mw) + fs * .6;
          y = say(c, 'Put i first:', m, y, pal.text, fs, mw, true);
          y = say(c, '√−4 = 2i and √−9 = 3i', m, y, pal.blue, fs * 1.05, mw);
          y = say(c, '2i × 3i = 6 × i² = 6 × (−1) = −6', m, y + fs * .15, pal.green, fs * 1.1, mw, true);
          return;
        }
        y = say(c, B.q, m, y, pal.text, fs * 1.05, mw, true) + fs * .45;
        const o = st.cand >= 0 ? B.opts[st.cand] : null;
        if (o) {
          y = say(c, sqText(o), m, y, pal.blue, fs, mw) + fs * .2;
          const ok = sqv(o) === B.tgt;
          y = say(c, ok ? `Match: it squares to ${sg(B.tgt)}.` : `No match: it squares to ${sg(sqv(o))}, not ${sg(B.tgt)}.`, m, y, ok ? pal.green : pal.red, fs, mw, true) + fs * .2;
          if (ok) say(c, B.rec, m, y, pal.text, fs * .95, mw);
        } else say(c, 'Pick a number in the panel. The board squares it and shows where the square lands.', m, y, pal.muted, fs, mw);
        /* the number line */
        const ly = Math.min(p.h - 80, Math.max(200, p.h * .52)), x0 = m + 8, x1 = p.w - m - 8, xm = (x0 + x1) / 2, half = (x1 - x0) / 2, X = v => clamp(xm + v / B.rng * half, x0, x1);
        c.fillStyle = alpha(pal.green, .13); c.fillRect(xm, ly - 52, half, 104);
        c.fillStyle = alpha(pal.red, .1); c.fillRect(x0, ly - 52, half, 104);
        ctext(c, 'needs i', (x0 + xm) / 2, ly - 42, pal.red, fs * .85, true);
        ctext(c, 'real squares land here', (xm + x1) / 2, ly - 42, pal.green, fs * .85, true);
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, ly); c.lineTo(x1, ly); c.stroke();
        c.beginPath(); c.moveTo(xm, ly - 7); c.lineTo(xm, ly + 7); c.stroke();
        ctext(c, '0', xm, ly + 17, pal.muted, fs * .85);
        const tx = X(B.tgt);
        c.fillStyle = pal.red; c.beginPath(); c.arc(tx, ly, 7, 0, TAU); c.fill();
        ctext(c, `target ${sg(B.tgt)}`, clamp(tx, x0 + 36, x1 - 36), ly - 22, pal.red, fs * .9, true);
        if (o) {
          const mx = X(st.mk);
          c.lineWidth = 3; c.strokeStyle = pal.blue; c.fillStyle = pal.stage; c.beginPath(); c.arc(mx, ly, 10, 0, TAU); c.fill(); c.stroke();
          ctext(c, `(${o.lab})² = ${sg(sqv(o))}`, clamp(mx, x0 + 50, x1 - 50), ly + 36, pal.blue, fs * .9, true);
        }
      };

      /* --- the wheel of powers of i --- */
      const wheelInfo = () => {
        if (st.practice) {
          const pr = curProb(), N = pr.n, r = N % 4, q = (N - r) / 4;
          if (prStage === 0) return [`${ip(N)}`, 'How many steps are left over', 'after whole laps of 4?'];
          if (prSolved) return [`${ip(N)} = ${ip(r)} = ${VAL[r]}`, `${N} = 4 × ${q} + ${r}`];
          return [`${N} = 4 × ${q} + ${r}`, `${ip(N)} = ${ip(r)} = ?`];
        }
        if (st.wst === 0) { const n = st.wn, r = n % 4, q = (n - r) / 4; return [`${ip(n)} = ${VAL[r]}`, `${n} = 4 × ${q} + ${r}`, `laps: ${q}, steps after them: ${r}`]; }
        const N = CHAL[st.chal], r = N % 4, q = (N - r) / 4;
        if (st.wst === 1) return [`${ip(N)}`, 'How many steps are left over', 'after whole laps of 4?'];
        if (st.wst === 2) return [`${N} = 4 × ${q} + ${r}`, `${ip(N)} = ${ip(r)} = ?`];
        return [`${ip(N)} = ${ip(r)} = ${VAL[r]}`, `${N} = 4 × ${q} + ${r}`];
      };
      const drawWheel = (c, p) => {
        const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 2.25;
        const R = 1.45, fs = clamp(p.scale * .22, 13, 20);
        const circ = []; for (let a = 0; a <= TAU + .01; a += .05) circ.push([R * Math.cos(a), R * Math.sin(a)]);
        p.path(circ, { stroke: pal['grid-strong'], width: 2 });
        /* the arc travelled in the current lap */
        const lapA = st.wa - Math.floor(st.wa / TAU - 1e-9) * TAU, full = st.wa > 1e-6 && lapA < 1e-6 ? TAU : lapA;
        const arc = []; for (let a = 0; a <= full + .001; a += .04) arc.push([R * Math.cos(a), R * Math.sin(a)]);
        if (arc.length > 1) p.path(arc, { stroke: pal.violet, width: 5 });
        for (let k = 0; k < 4; k++) {
          const a = k * TAU / 4 + TAU / 8;
          p.label('× i', R * .78 * Math.cos(a), R * .78 * Math.sin(a), { size: 17, italic: false, color: pal.muted });
        }
        const cur = Math.round(st.wa / (TAU / 4)) % 4;
        const pos = [[R, 0], [0, R], [-R, 0], [0, -R]];
        const cap = ['n = 0, 4, 8, …', 'n = 1, 5, 9, …', 'n = 2, 6, 10, …', 'n = 3, 7, 11, …'];
        pos.forEach(([x, y], k) => {
          const on = k === ((cur % 4) + 4) % 4 && st.wa > 1e-6 || (k === 0 && st.wa <= 1e-6);
          p.dot(x, y, on ? 24 : 21, alpha(pal.blue, on ? .3 : .12), on ? pal.blue : pal['grid-strong'], on ? 3 : 1.5);
          p.label(VAL[k], x, y, { size: 24, italic: false, color: pal.text });
          const dx = k === 1 || k === 3 ? 30 : 0, dy = k === 0 ? 38 : k === 2 ? 38 : 0;
          p.label(cap[k], x, y, { size: 14.5, italic: false, color: pal.muted, dx: k === 1 || k === 3 ? 32 : 0, dy: k === 0 || k === 2 ? dy : 0, align: k === 1 || k === 3 ? 'left' : 'center' });
          void dx;
        });
        const ang = st.wa;
        p.dot((R + .27) * Math.cos(ang), (R + .27) * Math.sin(ang), 8, pal.yellow, pal.stage, 2.5);
        const info = wheelInfo();
        info.forEach((t, i) => p.label(t, 0, 0, { size: i === 0 ? fs * 1.15 : fs, italic: false, color: i === 0 ? pal.text : pal.muted, dy: (i - (info.length - 1) / 2) * (fs * 1.55) }));
      };

      /* --- the complex plane --- */
      const planeSpec = () => {
        if (st.practice) {
          const pr = curProb();
          return pr.kind === 'read' ? 'read' : pr.kind === 'add' ? 'add' : pr.kind === 'mod' ? 'modp' : 'eq';
        }
        return ['plot', 'add', 'mod', 'mir'][st.tool];
      };
      const drawPlane = (c, p) => {
        const pal = p.pal, kind = planeSpec(), sz = clamp(p.scale * .6, 15, 19);
        const V = kind === 'eq' ? [5, 6, 8.2] : kind === 'modp' ? [2.5, -5, 8.2] : [0, 0, 6.6];
        p.cx = V[0]; p.cy = V[1]; p.span = V[2];
        axesDraw(p, c);
        const [a, b] = st.z, [d, e] = st.w, pr = st.practice ? curProb() : null;
        if (kind === 'plot' || kind === 'read') {
          const g = !st.practice ? GP[st.goal[0]] : null;
          const isRead = kind === 'read' && st.practice || (g && g.read);
          let ta = a, tb = b;
          if (st.practice) { ta = -3; tb = 2; } else if (g && g.read) { ta = g.read[0]; tb = g.read[1]; }
          const solved = st.practice ? prStage > 0 : st.rd === g?.ans;
          p.path([[ta, tb], [ta, 0]], { stroke: pal.green, width: 2.5, dash: [7, 6] });
          p.path([[ta, tb], [0, tb]], { stroke: pal.red, width: 2.5, dash: [7, 6] });
          p.dot(ta, 0, 5, pal.green, null); p.dot(0, tb, 5, pal.red, null);
          p.arrow(0, 0, ta, tb, isRead ? pal.yellow : pal.blue, 3.5);
          if (isRead) {
            p.dot(ta, tb, 9, pal.yellow, pal.stage, 2.5);
            zlab(p, ta, tb, solved ? (st.practice ? 'z = ' + cx(ta, tb) : 'z = ' + cx(ta, tb)) : 'z = ?', pal.text, sz);
          } else {
            p.dot(ta, tb, 9, pal.blue, pal.stage, 2.5); ring(p, ta, tb);
            zlab(p, ta, tb, 'z = ' + cx(ta, tb), pal.text, sz);
            if (ta !== 0) p.label(`real part ${sg(ta)}`, ta, 0, { size: sz, italic: false, color: pal.green, dy: tb >= 0 ? 36 : -18 });
            if (tb !== 0) p.label(`imaginary part ${sg(tb)}`, 0, tb, { size: sz, italic: false, color: pal.red, align: ta > 0 ? 'left' : 'right', dx: ta > 0 ? 8 : -8, dy: tb > 0 ? 17 : -17 });
          }
        } else if (kind === 'add') {
          const sub = !st.practice && st.op === 0;
          const hasW = !st.practice || prStage >= 0;
          const sum = sub ? [a - d, b - e] : [a + d, b + e];
          const showSum = !st.practice || prStage >= 1;
          const wx = sub ? -d : d, wy = sub ? -e : e;
          if (showSum) {
            p.path([[0, 0], [a, b], sum, [wx, wy]], { fill: alpha(pal.violet, .12), close: true });
            p.path([[a, b], sum], { stroke: pal.violet, width: 2, dash: [7, 6] });
            p.path([[wx, wy], sum], { stroke: pal.violet, width: 2, dash: [7, 6] });
          }
          p.arrow(0, 0, a, b, pal.blue, 3.5);
          if (sub) p.arrow(0, 0, wx, wy, alpha(pal.red, .7), 3);
          p.arrow(0, 0, d, e, pal.red, sub ? 2 : 3.5);
          if (sub) p.path([[d, e], [wx, wy]], { stroke: alpha(pal.red, .4), width: 1.5, dash: [3, 6] });
          if (showSum) { p.arrow(0, 0, sum[0], sum[1], pal.violet, 3); p.dot(sum[0], sum[1], 8.5, pal.yellow, pal.stage, 2.5); zlab(p, sum[0], sum[1], (st.practice ? 'z + w = ' : sub ? 'z − w = ' : 'z + w = ') + cx(sum[0], sum[1]), pal.text, sz); }
          p.dot(a, b, 8.5, pal.blue, pal.stage, 2.5); p.dot(d, e, 8.5, pal.red, pal.stage, 2.5);
          if (!st.practice) { if (st.sel === 'z') ring(p, a, b); else ring(p, d, e); }
          else ring(p, d, e);
          if (!st.practice) {
            zlabR(p, a, b, 'z = ' + cx(a, b), pal.blue, sz);
            if (a !== d || b !== e) zlabR(p, d, e, 'w = ' + cx(d, e), pal.red, sz); else p.label('w = z', d, e, { size: sz, italic: false, color: pal.red, dy: 36 });
            if (sub) p.label('−w', wx, wy, { size: sz, italic: false, color: alpha(pal.red, .9), dy: wy >= 0 ? -17 : 17 });
          } else { zlabR(p, a, b, 'z = ' + cx(a, b), pal.blue, sz); zlabR(p, d, e, 'w = ' + cx(d, e), pal.red, sz); }
          void hasW;
        } else if (kind === 'mod' || kind === 'modp') {
          const A = kind === 'modp' ? 5 : a, Bv = kind === 'modp' ? -12 : b, M = modText(A, Bv);
          const solved = kind === 'modp' && prSolved;
          p.path([[0, 0], [A, 0]], { stroke: pal.green, width: 3.5 });
          p.path([[A, 0], [A, Bv]], { stroke: pal.red, width: 3.5 });
          if (A !== 0 && Bv !== 0) p.path([[A, 0], [A, Bv]], { stroke: pal.red, width: 3.5 });
          const circ = []; for (let t = 0; t <= TAU + .02; t += .04) circ.push([M.r * Math.cos(t), M.r * Math.sin(t)]);
          if (kind === 'mod') p.path(circ, { stroke: alpha(pal.violet, .5), width: 2, dash: [5, 7] });
          p.arrow(0, 0, A, Bv, pal.violet, 4);
          p.dot(A, Bv, 9, pal.blue, pal.stage, 2.5); if (kind === 'mod') ring(p, A, Bv);
          p.dot(A, 0, 5, pal.green, null);
          p.label(`leg ${sg(Math.abs(A))}`, A / 2, 0, { size: sz, italic: false, color: pal.green, dy: Bv > 0 ? 30 : -16 });
          if (Bv !== 0) p.label(`leg ${sg(Math.abs(Bv))}`, A, Bv / 2, { size: sz, italic: false, color: pal.red, align: A > 0 ? 'left' : 'right', dx: A > 0 ? 10 : -10 });
          const midx = A / 2, midy = Bv / 2;
          p.label(kind === 'modp' ? (solved ? '|z| = 13' : '|z| = ?') : `|z| = ${M.txt}`, midx, midy, { size: sz * 1.05, italic: false, color: pal.violet, align: 'right', dx: -12, dy: Bv < 0 ? 16 : -16 });
          zlab(p, A, Bv, 'z = ' + cx(A, Bv), pal.text, sz);
        } else if (kind === 'mir') {
          p.path([[a, b], [a, -b]], { stroke: pal.yellow, width: 2.2, dash: [6, 6] });
          p.path([[a, b], [a, 0]], { stroke: pal.yellow, width: 0 });
          p.arrow(0, 0, a, b, pal.blue, 3.5);
          p.arrow(0, 0, a, -b, alpha(pal.yellow, .85), 3);
          p.dot(a, -b, 8.5, pal.yellow, pal.stage, 2.5);
          p.dot(a, b, 9, pal.blue, pal.stage, 2.5); ring(p, a, b);
          zlab(p, a, b, 'z = ' + cx(a, b), pal.blue, sz);
          if (b !== 0) zlab(p, a, -b, 'conj z = ' + cx(a, -b), pal.text, sz);
          else p.label('conj z = z', a, 0, { size: sz, italic: false, color: pal.text, dy: 36 });
          if (b !== 0) p.label('mirror', a, 0, { size: sz * .9, italic: false, color: pal.muted, align: a > 0 ? 'left' : 'right', dx: a > 0 ? 8 : -8, dy: -15 });
        } else if (kind === 'eq') {
          const T = [4, 6];
          const ch = prPicked >= 0 ? [[4, 6], [3, 3], [5, 3], [3, 6]][prPicked] : null, L = ch ? [ch[0] + 1, 2 * ch[1]] : null;
          const same = L && L[0] === T[0] && L[1] === T[1];
          p.dot(T[0], T[1], same ? 12 : 9, pal.yellow, pal.stage, 2.5);
          if (same) p.label('both sides = 4 + 6i', T[0], T[1], { size: sz, italic: false, color: pal.green, align: 'left', dx: 18, dy: -16 });
          else p.label('right side 4 + 6i', T[0], T[1], { size: sz, italic: false, color: pal.text, align: 'left', dx: 14, dy: 18 });
          if (L && !same) {
            p.path([L, T], { stroke: pal.red, width: 2, dash: [6, 6] });
            p.dot(L[0], L[1], 8, pal.blue, pal.stage, 2.5);
            p.label(`left side ${cx(L[0], L[1])}`, L[0], L[1], { size: sz, italic: false, color: pal.blue, align: 'left', dx: 14, dy: L[1] >= T[1] ? -16 : 16 });
          } else if (same) p.dot(L[0], L[1], 6, pal.blue, pal.stage, 2);
        }
        void pr;
      };

      P.onDraw = (c, p) => {
        const s = scene();
        if (s === 'para') drawPara(c, p);
        else if (s === 'board') drawBoard(c, p);
        else if (s === 'wheel') drawWheel(c, p);
        else drawPlane(c, p);
      };

      /* =============== panel =============== */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const S = o => { const s = C.slider(o); s.inp = panel.lastElementChild.querySelector('input'); return s; };
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const addTo = (...els) => panel.append(...els);
      const fb = () => h('div', { class: 'ctl readout', 'aria-live': 'polite' });
      const hintP = () => h('p', { class: 'hint' });
      const btnRow = () => h('div', { class: 'ctl buttons' });
      const rowOf = els => els[0].parentElement;

      let predQ, predRow, predFb, pxS, ro0;
      let selEx, exQ, exRow, exFb;
      let nS, nBtns, ro2, chSel, chQ, chRow, chFb;
      let toolBtns, goalQ, goalBtns, readRow, goalFb, selBtns, reS, imS, stepBtns, ro3, opBtns;
      let startBtn, ptally, pq, pch, pfb, pnext, pplot;

      /* ----- scene 0: the parabola ----- */
      const PRED0 = [
        ['Yes, at some x', 'Not quite. Drag the point and look: x² is never below 0, so x² + 1 never drops below 1.'],
        ['No, never', good('Right.') + ' x² is 0 or more, so x² + 1 is at least 1. Drag the point to check.'],
        ['Only at x = 0', 'Not quite. At x = 0 the height is 0² + 1 = 1. That is the lowest point, and it is still above 0.']
      ];
      grp('g0', () => {
        C.title('Predict first');
        predQ = hintP(); predQ.textContent = 'Will the curve y = x² + 1 ever reach height 0 (touch the x-axis)?';
        predRow = btnRow(); predFb = fb();
        PRED0.forEach((o, i) => predRow.append(mkBtn(o[0], () => {
          if (st.pred0 >= 0) return;
          st.pred0 = i; predFb.innerHTML = ''; sync();
        })));
        addTo(predQ, predRow, predFb);
        pxS = S({ label: 'Move the point: x =', min: -3, max: 3, step: .5, value: 2, format: sg, onInput: v => { cancel(); setPx(v); } });
        ro0 = fb(); addTo(ro0);
      });
      const setPx = v => {
        st.px = v; st.pmin = Math.min(st.pmin, v * v + 1); if (v === 0) st.vis0 = true; sync();
      };
      const ro0Html = () => {
        const x = st.px, y = x * x + 1, out = [];
        if (st.pred0 < 0) return 'Make your prediction first. Then the slider unlocks.';
        out.push(`${kk('Now')} x = ${sg(x)}, so x² = ${sg(x * x)} and the height is y = x² + 1 = ${sg(y)}.`);
        out.push(`${kk('Lowest height you found')} ${sg(st.pmin)}.` + (st.vis0 ? ' The lowest point of the whole curve is (0, 1).' : ' Try x = 0.'));
        out.push(PRED0[st.pred0][1]);
        out.push(`${kk('So')} x² = −1 would need x² + 1 = 0, and the curve never gets there. No real number squares to −1. We do what we did for negatives and fractions: invent a number. Call it <b>i</b>, with <b>i² = −1</b>.`);
        out.push(`${kk('About the names')} "Imaginary" and "real" are old labels, not a verdict. Complex numbers are used every day in electrical engineering and signal processing.`);
        return lines(out);
      };

      /* ----- scene 1: square roots and the trap ----- */
      grp('g1', () => {
        C.title('Choose and check');
        selEx = C.select({ label: 'Example', options: [{ value: '0', label: 'Simplify √−9' }, { value: '1', label: 'Simplify √−5' }, { value: '2', label: 'The trap: √−4 × √−9' }], value: '0', onChange: v => { cancelM(); loadEx(+v); sync(); } });
        exQ = hintP(); exRow = btnRow(); exFb = fb();
        addTo(exQ, exRow, exFb);
      });
      const loadEx = i => {
        st.ex = i; st.cand = -1; st.tp = 0; st.mk = 0; exFb.innerHTML = '';
        const B = EX[i]; exQ.textContent = B.kind === 'trap' ? 'Predict first: ' + B.q : B.q;
        exRow.replaceChildren();
        if (B.kind === 'trap') B.opts.forEach((o, k) => exRow.append(mkBtn(o[0], () => {
          if (st.tp) return;
          st.tp = 1; Array.from(exRow.children).forEach((b, j) => { b.disabled = true; if (j === k) b.classList.add('primary'); });
          exFb.innerHTML = (k === B.ans ? '' : bad('Not quite.') + ' ') + o[1]; sync();
        })));
        else B.opts.forEach((o, k) => exRow.append(mkBtn(o.lab, () => pickRoot(k))));
      };
      const pickRoot = k => {
        const B = EX[st.ex], o = B.opts[k];
        st.cand = k; cancelM(); cancelM = animateTo(st, { mk: sqv(o) }, 600, sync);
        exFb.innerHTML = (sqv(o) === B.tgt ? '' : bad('Not quite.') + ' ') + o.why + (sqv(o) === B.tgt ? ' ' + B.rec : '');
        Array.from(exRow.children).forEach((b, j) => b.classList.toggle('primary', j === k));
        sync();
      };

      /* ----- scene 2: the wheel ----- */
      grp('g2', () => {
        C.title('Step round the wheel');
        nS = S({ label: 'Exponent n', min: 0, max: 12, step: 1, value: 0, format: v => `n = ${v}`, onInput: v => { setN(v); } });
        nBtns = C.buttons([{ label: 'n − 1 (undo a step)', onClick: () => setN(Math.max(0, st.n - 1)) }, { label: 'n + 1 (multiply by i)', onClick: () => setN(Math.min(12, st.n + 1)) }]);
        ro2 = fb(); addTo(ro2);
        C.title('Big exponents');
        chSel = C.select({ label: 'Find', options: CHAL.map((v, i) => ({ value: String(i), label: `${ip(v)}` })), value: '0', onChange: v => { loadChal(+v); sync(); } });
        chQ = hintP(); chRow = btnRow(); chFb = fb();
        addTo(chQ, chRow, chFb);
      });
      const setN = v => {
        st.n = v; st.wn = v; st.wst = 0; cancelW(); cancelW = animateTo(st, { wa: v * TAU / 4 }, 450, sync);
        loadChal(st.chal, true); sync();
      };
      const loadChal = (i, keepWheel) => {
        st.chal = i; st.chS = 0; chFb.innerHTML = '';
        if (!keepWheel) { st.wst = 1; cancelW(); cancelW = animateTo(st, { wa: 0 }, 450, sync); }
        chRow.replaceChildren(); stageChal();
      };
      const stageChal = () => {
        const N = CHAL[st.chal];
        chRow.replaceChildren();
        if (st.chS === 0) {
          chQ.textContent = `You want ${ip(N)}. Each lap of the wheel is 4 steps. What is the remainder when ${N} is divided by 4?`;
          [0, 1, 2, 3].forEach(r => chRow.append(mkBtn(String(r), () => pickChal(r))));
        } else if (st.chS === 1) {
          chQ.textContent = `Now ${ip(N)} = ${ip(N % 4)}. What is it?`;
          VAL.forEach((v, k) => chRow.append(mkBtn(v, () => pickChalVal(k))));
        } else chQ.textContent = `Done: ${ip(N)} = ${VAL[N % 4]}. Try another exponent.`;
      };
      const pickChal = r => {
        const N = CHAL[st.chal], rr = N % 4, q = (N - rr) / 4;
        if (r === rr) {
          st.chS = 1; st.wst = 2; st.wn = N; chFb.innerHTML = good('Yes.') + ` ${N} = 4 × ${q} + ${rr}: ${q} full laps use ${4 * q} steps, and ${rr} step${rr === 1 ? '' : 's'} ${rr === 1 ? 'is' : 'are'} left over.` + (rr === 0 ? ' No steps left means you stand on the starting number, 1.' : '');
          cancelW(); cancelW = animateTo(st, { wa: rr * TAU / 4 }, 700, sync);
          stageChal();
        } else chFb.innerHTML = bad('Not quite.') + ` ${4 * q} = 4 × ${q}, and ${N} − ${4 * q} = ${rr}. The remainder is the number of steps left after whole laps.`;
        sync();
      };
      const pickChalVal = k => {
        const N = CHAL[st.chal], rr = N % 4;
        if (k === rr) { st.chS = 2; st.wst = 3; chFb.innerHTML = good('Yes.') + ` ${ip(N)} = ${ip(rr)} = ${VAL[rr]}. The wheel shows the steps after the full laps.`; stageChal(); }
        else chFb.innerHTML = bad('Not quite.') + ` ${rr} step${rr === 1 ? '' : 's'} from 1 lands on ${VAL[rr]}: the loop goes 1, i, −1, −i. You chose ${VAL[k]}, which is ${k} step${k === 1 ? '' : 's'}.`;
        sync();
      };

      /* ----- scene 3: the complex plane ----- */
      grp('g3', () => {
        C.title('Choose a tool');
        toolBtns = C.buttons(TOOLS.map((t, i) => ({ label: t.name, onClick: () => setTool(i) })));
        goalQ = h('p', { class: 'hint' }); goalFb = fb(); readRow = btnRow();
        goalBtns = C.buttons([{ label: 'Next goal', onClick: () => { st.goal[st.tool] = (st.goal[st.tool] + 1) % goalList().length; st.rd = -1; st.goalOk[st.tool] = false; sync(); } }]);
        const gr = rowOf(goalBtns);
        panel.insertBefore(goalQ, gr); panel.insertBefore(readRow, gr); panel.insertBefore(goalFb, gr);
        opBtns = C.buttons([{ label: 'z + w', onClick: () => { st.op = 1; sync(); } }, { label: 'z − w', onClick: () => { st.op = 0; sync(); } }]);
      });
      grp('gpt', () => {
        C.title('Move a point');
        selBtns = C.buttons([{ label: 'Move z', onClick: () => { st.sel = 'z'; sync(); } }, { label: 'Move w', onClick: () => { st.sel = 'w'; sync(); } }]);
        reS = S({ label: 'Real part (across)', min: -6, max: 6, step: 1, value: 0, format: sg, onInput: v => { const q = ptOf(); setPt(st.sel, v, q[1]); } });
        imS = S({ label: 'Imaginary part (up)', min: -5, max: 5, step: 1, value: 0, format: sg, onInput: v => { const q = ptOf(); setPt(st.sel, q[0], v); } });
        stepBtns = C.buttons([{ label: 'Real −1', onClick: () => stepPt(-1, 0) }, { label: 'Real +1', onClick: () => stepPt(1, 0) }, { label: 'Imag −1', onClick: () => stepPt(0, -1) }, { label: 'Imag +1', onClick: () => stepPt(0, 1) }]);
      });
      grp('g3b', () => { ro3 = fb(); addTo(ro3); });
      const goalList = () => [GP, GA, GM, GC][st.tool];
      const ptOf = () => (st.sel === 'w' ? st.w : st.z);
      const setPt = (id, a, b) => {
        const [lx, ly] = LIM();
        const A = clamp(Math.round(a), -lx, lx), B = clamp(Math.round(b), -ly, ly);
        if (id === 'w') st.w = [A, B]; else st.z = [A, B];
        if (st.practice) pfb.innerHTML = '';
        sync();
      };
      const stepPt = (da, db) => { const q = ptOf(); setPt(st.sel, q[0] + da, q[1] + db); };
      const resetTool = i => { st.tool = i; st.z = TOOLS[i].z.slice(); st.w = TOOLS[i].w.slice(); st.sel = 'z'; st.rd = -1; st.goal[i] = 0; };
      const setTool = i => { resetTool(i); sync(); };

      const goalHtml = () => {
        const t = st.tool, g = goalList()[st.goal[t]], [a, b] = st.z, [c, d] = st.w;
        if (t === 0) {
          if (g.read) { return st.rd < 0 ? '' : (st.rd === g.ans ? '' : bad('Not quite. ')) + g.whys[st.rd]; }
          const [ta, tb] = g.t;
          if (a === ta && b === tb) return good('Yes.') + ` ${cx(ta, tb)} is the point ${pt(ta, tb)}. ${g.tip}`;
          const bits = [];
          if (a === tb && b === ta) bits.push(bad('Swapped.') + ' The real part goes ACROSS first and the imaginary part goes UP second.');
          else {
            bits.push(a !== ta ? `The real part is ${sg(a)}, it should be ${sg(ta)}.` : 'The real part is right.');
            bits.push(b !== tb ? `The imaginary part is ${sg(b)}, it should be ${sg(tb)}.` : 'The imaginary part is right.');
          }
          return `Not yet. z = ${cx(a, b)} is the point ${pt(a, b)}. ${bits.join(' ')} ${g.tip}`;
        }
        if (t === 1) {
          const r = st.op ? [a + c, b + d] : [a - c, b - d], gi = st.goal[1];
          if (gi === 0) return r[1] === 0 ? good('Yes.') + ` The result is ${cx(r[0], r[1])}. The imaginary parts ${st.op ? 'cancel' : 'are equal'}: ${sg(b)} ${st.op ? '+' : MI} ${par(d)} = 0, so it sits on the real axis.` : `Not yet. The imaginary part of the result is ${sg(b)} ${st.op ? '+' : MI} ${par(d)} = ${sg(r[1])}. To make it 0, ${st.op ? 'w needs imaginary part ' + sg(-b) : 'w needs imaginary part ' + sg(b)}.`;
          if (gi === 1) return r[0] === 0 && r[1] === 0 ? good('Yes.') + ' ' + (st.op ? `w = ${cx(c, d)} is the opposite of z = ${cx(a, b)}: both parts have flipped sign, so z + w = 0.` : 'z − w = 0 means z and w are the same number.') : `Not yet. The result is ${cx(r[0], r[1])}. Both parts must be 0.` + (st.op ? ` So w must be ${cx(-a, -b)}.` : ` So w must be ${cx(a, b)}.`);
          return a === c && b === d ? good('Yes.') + ` z = ${cx(a, b)} and w = ${cx(c, d)} have the same real part and the same imaginary part, so z = w. The two arrows are the same arrow.` : `Not yet. The real parts are ${sg(a)} and ${sg(c)}${a === c ? ' (equal)' : ' (different)'}. The imaginary parts are ${sg(b)} and ${sg(d)}${b === d ? ' (equal)' : ' (different)'}. Both pairs must match.`;
        }
        if (t === 2) {
          const M = modText(a, b), gi = st.goal[2];
          if (gi === 0) return M.n === 25 && !(a === 3 && b === 4) ? good('Yes.') + ` |${cx(a, b)}| = √(${par(a)}² + ${par(b)}²) = √25 = 5. Every point on the dashed circle has the same distance 5.` : M.n === 25 ? `That is the starting number 3 + 4i. Find a different point on the circle.` : `Not yet: |z| = ${M.full}. You need a point with a² + b² = 25, such as (4, 3) or (−3, 4).`;
          return M.n === 2 ? good('Yes.') + ` |${cx(a, b)}| = √(1 + 1) = √2 ≈ 1.41. The legs are 1 and 1.` : `Not yet: |z| = ${M.full}. You need a² + b² = 2, so both legs must be 1 in size.`;
        }
        const gi = st.goal[3];
        if (gi === 0) return a === 3 && b === -4 ? good('Yes.') + ` conj z = ${cx(a, -b)} = 3 + 4i. The mirror image of 3 − 4i in the real axis is 3 + 4i.` : `Not yet. z = ${cx(a, b)} has conj z = ${cx(a, -b)}. Mirror 3 + 4i back: change the sign of the imaginary part.`;
        return b === 0 ? good('Yes.') + ` ${cx(a, 0)} lies ON the real axis, so its mirror image is itself: conj z = z. A number equals its conjugate exactly when it is real.` : `Not yet. z = ${cx(a, b)} is mirrored to ${cx(a, -b)}, a different point. Which points do not move when you mirror them in the real axis?`;
      };
      const ro3Html = () => {
        const [a, b] = st.z, [c, d] = st.w, out = [], t = st.tool;
        if (t === 0) {
          const g = GP[st.goal[0]];
          if (g.read) return `${kk('Reading a point')} The real part is how far across, the imaginary part is how far up. The imaginary part is the number b, not bi.`;
          out.push(`${kk('z')} ${cx(a, b)} is the point ${pt(a, b)}`, `${kk('Real part')} ${sg(a)}`, `${kk('Imaginary part')} ${sg(b)}  (the number b, not ${imag(b)})`);
        } else if (t === 1) {
          const r = st.op ? [a + c, b + d] : [a - c, b - d];
          out.push(`${kk('z')} ${cx(a, b)}  ${kk('w')} ${cx(c, d)}`);
          out.push(st.op ? `${kk('z + w')} (${sg(a)} + ${par(c)}) + (${sg(b)} + ${par(d)})i = <b>${cx(r[0], r[1])}</b>` : `${kk('z − w')} (${sg(a)} ${MI} ${par(c)}) + (${sg(b)} ${MI} ${par(d)})i = <b>${cx(r[0], r[1])}</b>`);
          out.push('Real parts combine with real parts, imaginary parts with imaginary parts. The picture: the sum is the far corner of the parallelogram.' + (st.op ? '' : ' Subtracting adds the opposite: z − w = z + (−w), and −w is w turned through the origin.'));
          out.push('z and w stay within 3 of the axes so the result stays on the picture.');
        } else if (t === 2) {
          const M = modText(a, b);
          out.push(`${kk('z')} ${cx(a, b)} is the point ${pt(a, b)}`, `${kk('Legs')} across ${sg(Math.abs(a))}, up ${sg(Math.abs(b))}`, `${kk('|z|²')} ${par(a)}² + ${par(b)}² = ${a * a} + ${b * b} = ${M.n}`, `${kk('|z|')} √${M.n}${Number.isInteger(M.r) ? ' = <b>' + sg(M.r) + '</b>' : ' ≈ <b>' + M.r.toFixed(2) + '</b> (not a whole number, so we leave it as √' + M.n + ')'}`);
        } else {
          out.push(`${kk('z')} ${cx(a, b)}`, `${kk('Conjugate')} ${bar('z')} = ${cx(a, -b)}: same real part, imaginary part flips sign`, `${kk('Distances')} |z| = ${modText(a, b).full}, |${bar('z')}| = ${modText(a, -b).full}: the same.`, 'This lesson only draws the conjugate. Its algebra comes in the next lesson.');
        }
        return lines(out);
      };

      /* ----- practice ----- */
      C.title('Practice');
      C.hint('Eight short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { if (st.practice) { leave(); } else { st.practice = true; if (!prOver) loadProb(); sync(); } } }])[0];
      grp('prac', () => {
        ptally = h('p', { class: 'ctl-title' });
        pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        pch = h('div', { class: 'ctl buttons' });
        pplot = btnRow(); pplot.append(mkBtn('Check my plot', () => checkPlot(), true));
        pfb = fb(); pnext = mkBtn('Next problem', () => nextProb(), true);
        addTo(ptally, pq, pch, pplot, pfb, h('div', { class: 'ctl buttons' }, pnext));
      });
      const leave = () => { st.practice = false; resetTool(st.tool); sync(); };
      const tally = () => { ptally.textContent = `Problem ${prIdx + 1} of ${PROBS.length}. Right on the first try: ${prFirst} of ${prDone} done`; };
      const loadProb = () => {
        const pr = curProb(); prStage = 0; prSolved = false; prTried = false; prPicked = -1;
        st.cand = -1; st.tp = 0; st.mk = 0; st.wa = 0;
        if (pr.kind === 'add') { st.z = pr.z.slice(); st.w = pr.w0.slice(); st.sel = 'w'; }
        pfb.innerHTML = ''; pnext.disabled = true; pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        stageP(); tally();
      };
      const stageP = () => {
        const pr = curProb(), s = pr.stages[prStage];
        pq.textContent = s.q; pch.replaceChildren();
        if (s.type === 'plot') return;
        s.ch.forEach((o, i) => pch.append(mkBtn(o[0], () => pickP(i))));
      };
      const pickP = i => {
        const pr = curProb(), s = pr.stages[prStage]; if (prSolved) return;
        const right = i === s.ans, txt = s.ch[i][1], btn = pch.children[i];
        if (pr.kind === 'root') { st.cand = i; cancelM(); cancelM = animateTo(st, { mk: sqv(pr.rt.opts[i]) }, 600, sync); }
        if (pr.kind === 'trap') st.tp = 1;
        if (pr.kind === 'eq') prPicked = i;
        if (right) {
          const last = prStage === pr.stages.length - 1;
          if (!last) {
            prStage++; pfb.innerHTML = txt;
            if (pr.kind === 'power') { const rr = pr.n % 4; cancelW(); cancelW = animateTo(st, { wa: rr * TAU / 4 }, 700, sync); }
            stageP();
          } else {
            prSolved = true; if (!prTried) prFirst++; prDone++;
            Array.from(pch.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary');
            pfb.innerHTML = txt; pnext.disabled = false;
            if (pr.kind === 'power') { const rr = pr.n % 4; cancelW(); cancelW = animateTo(st, { wa: rr * TAU / 4 }, 500, sync); }
          }
        } else { prTried = true; btn.disabled = true; pfb.innerHTML = bad('Not quite.') + ' ' + txt + ' Try another answer.'; }
        tally(); sync();
      };
      const checkPlot = () => {
        const pr = curProb(), [a, b] = st.w, [ta, tb] = pr.wt;
        if (a === ta && b === tb) {
          prStage = 1; pfb.innerHTML = good('Right.') + ` w = ${cx(ta, tb)} is the point ${pt(ta, tb)}: 3 to the left, 1 up. The picture now shows the parallelogram.`;
          stageP(); sync();
        } else {
          prTried = true;
          pfb.innerHTML = bad('Not yet.') + ` Your w is ${cx(a, b)}, the point ${pt(a, b)}. ` + (a === tb && b === ta ? 'You swapped the parts. ' : '') + `Target: real part ${sg(ta)} (${Math.abs(ta)} step${Math.abs(ta) === 1 ? '' : 's'} ${ta < 0 ? 'left' : 'right'}), imaginary part ${sg(tb)} (${Math.abs(tb)} up). The number in front of i is the imaginary part.`;
          tally();
        }
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); sync(); return; }
        prOver = true; prStage = 9;
        pq.textContent = 'All eight problems are done.'; pch.replaceChildren(); pnext.disabled = true;
        pfb.innerHTML = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        pch.append(mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; prOver = false; loadProb(); sync(); }, true));
        ptally.textContent = `Right on the first try: ${prFirst} of ${PROBS.length}`; sync();
      };

      /* ----- sync ----- */
      const sync = () => {
        const prac = st.practice, sc = st.sc, over = prac && prOver, pr = prac && !over ? curProb() : null;
        vis(G.g0, !prac && sc === 0); vis(G.g1, !prac && sc === 1); vis(G.g2, !prac && sc === 2); vis(G.g3, !prac && sc === 3); vis(G.prac, prac);
        /* scene 0 */
        Array.from(predRow.children).forEach((b, i) => { b.disabled = st.pred0 >= 0; b.classList.toggle('primary', st.pred0 === i); });
        pxS.set(st.px); pxS.inp.disabled = st.pred0 < 0; ro0.innerHTML = ro0Html();
        /* scene 2 */
        nS.set(st.n); nBtns[0].disabled = st.n === 0; nBtns[1].disabled = st.n === 12;
        const r = st.n % 4, q = (st.n - r) / 4;
        ro2.innerHTML = lines([`${kk('Value')} ${ip(st.n)} = <b>${VAL[r]}</b>`, `${kk('Remainder')} ${st.n} = 4 × ${q} + ${r}, so ${ip(st.n)} = ${ip(r)} = ${VAL[r]}`, `${kk('The loop')} i¹ = i, i² = −1, i³ = −i, i⁴ = 1, then it repeats.`]);
        selEx.value = String(st.ex);
        /* scene 3 */
        const t = st.tool, g = goalList()[st.goal[t]], hide = t === 0 && !!g.read;
        const plotting = !!pr && pr.kind === 'add' && prStage === 0;
        vis(G.gpt, (!prac && sc === 3 && !hide) || plotting);
        vis([rowOf(selBtns)], !prac && t === 1);
        vis(G.g3b, !prac && sc === 3);
        if (!prac && sc === 3) {
          toolBtns.forEach((b, i) => b.classList.toggle('primary', i === t));
          goalQ.textContent = 'Goal: ' + g.q;
          readRow.replaceChildren();
          if (t === 0 && g.read) g.opts.forEach((o, k) => readRow.append(mkBtn(o, () => { st.rd = k; sync(); })));
          Array.from(readRow.children).forEach((b, k) => b.classList.toggle('primary', st.rd === k));
          vis([readRow], hide);
          goalFb.innerHTML = goalHtml();
          vis([rowOf(opBtns)], t === 1);
          opBtns.forEach((b, i) => b.classList.toggle('primary', (i === 0) === (st.op === 1)));
          selBtns.forEach((b, i) => b.classList.toggle('primary', st.sel === ['z', 'w'][i]));
          ro3.innerHTML = ro3Html();
        }
        const q2 = ptOf(); reS.set(q2[0]); imS.set(q2[1]);
        if (prac) {
          vis([ptally, pq, pch, pfb, rowOf([pnext])], true);
          vis([pplot], plotting);
        }
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        P.draw();
      };

      const FLAGS = ['sc', 'tool', 'ex', 'n'];
      const apply = (patch, immediate) => {
        cancel(); cancelM(); cancelW();
        const nums = {}; let wasPrac = st.practice;
        st.practice = false;
        for (const k in patch) { if (!FLAGS.includes(k)) nums[k] = patch[k]; }
        if ('sc' in patch) st.sc = patch.sc;
        if ('tool' in patch) resetTool(patch.tool); else if (wasPrac) resetTool(st.tool);
        if ('ex' in patch) loadEx(patch.ex);
        if ('n' in patch) { st.n = patch.n; st.wn = patch.n; st.wst = 0; st.wa = patch.n * TAU / 4; loadChal(st.chal, true); }
        if (immediate) { Object.assign(st, nums); sync(); } else { sync(); cancel = animateTo(st, nums, 700, sync); }
      };
      loadEx(0); loadChal(0, true); stageChal();

      draggable(P, {
        hit: (px, py) => {
          if (st.practice) {
            const pr = curProb();
            return pr.kind === 'add' && prStage === 0 && near(P, st.w[0], st.w[1], px, py, 28) ? 'w' : null;
          }
          if (st.sc === 0) return near(P, st.px, st.px * st.px + 1, px, py, 28) && st.pred0 >= 0 ? 'p' : null;
          if (st.sc !== 3) return null;
          if (st.tool === 0 && GP[st.goal[0]].read) return null;
          const dz = Math.hypot(px - P.X(st.z[0]), py - P.Y(st.z[1])), dw = Math.hypot(px - P.X(st.w[0]), py - P.Y(st.w[1]));
          const zOk = dz < 28, wOk = st.tool === 1 && dw < 28;
          if (zOk && wOk) return dz === dw ? st.sel : dz < dw ? 'z' : 'w';
          return zOk ? 'z' : wOk ? 'w' : null;
        },
        move: (id, x, y) => {
          if (id === 'p') { cancel(); setPx(clamp(snap(x, .5), -3, 3)); return; }
          st.sel = id; setPt(id, x, y);
        }
      });

      sync();
      return { destroy: () => { cancel(); cancelM(); cancelW(); P.destroy(); }, apply };
    }
  });
}
