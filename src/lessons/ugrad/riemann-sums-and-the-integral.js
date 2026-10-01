/* =====================================================================
   UNDERGRAD — Riemann sums and the integral
   ===================================================================== */
{
  const PI = Math.PI, W = 10, H = 6.6;
  const f3 = v => (Math.abs(v) < 5e-4 ? '0.000' : (v < 0 ? '−' : '') + Math.abs(v).toFixed(3));
  const piFmt = v => {
    const k = Math.round(v / (PI / 8)); if (!k) return '0';
    const m = Math.abs(k) / 8; return (k < 0 ? '−' : '') + (m === 1 ? '' : String(+m.toFixed(3))) + 'π';
  };

  /* The functions. f is the integrand, F an antiderivative (used only for the exact value). */
  const FN = [
    { key: 'sq', name: 'x²  (rising)', eq: 'f(x) = x²', f: x => x * x, F: x => x * x * x / 3,
      lo: 0, hi: 2.5, ylo: -.7, yhi: 6.8, step: .25, ys: 1, xs: .5 },
    { key: 'sin', name: 'sin x  (rises, then falls)', eq: 'f(x) = sin x', f: Math.sin, F: x => -Math.cos(x),
      lo: -PI / 2, hi: 5 * PI / 2, ylo: -1.45, yhi: 1.45, step: PI / 8, ys: .5, xs: PI / 2, pi: true },
    { key: 'dec', name: '6e^(−x/2)  (falling)', eq: 'f(x) = 6e^(−x/2)', f: x => 6 * Math.exp(-x / 2), F: x => -12 * Math.exp(-x / 2),
      lo: 0, hi: 6, ylo: -.7, yhi: 6.6, step: .25, ys: 2, xs: 1 },
    { key: 'cross', name: 'x³/4 − x  (crosses the axis)', eq: 'f(x) = x³/4 − x', f: x => x * x * x / 4 - x, F: x => x * x * x * x / 16 - x * x / 2,
      lo: -3.5, hi: 3.5, ylo: -4.6, yhi: 4.6, step: .25, ys: 2, xs: 1 },
    { key: 'step', name: 'A step function (jumps)', eq: 'f(x) = 1, then 3, then 2',
      f: x => x < 1 ? 1 : x < 2.5 ? 3 : 2, F: x => x <= 1 ? x : x <= 2.5 ? 1 + 3 * (x - 1) : 5.5 + 2 * (x - 2.5),
      lo: 0, hi: 4.5, ylo: -.6, yhi: 3.8, step: .25, ys: 1, xs: 1, breaks: [1, 2.5] },
    { key: 'car', name: 'A car: velocity v(t)', eq: 'v(t) = ½(t − 1)(t − 4)', f: t => (t - 1) * (t - 4) / 2, F: t => (t * t * t / 3 - 2.5 * t * t + 4 * t) / 2,
      lo: 0, hi: 5.5, ylo: -1.7, yhi: 3.6, step: .25, ys: 1, xs: 1, vel: true }
  ];
  const RULES = [['left', 'Left endpoints'], ['right', 'Right endpoints'], ['mid', 'Midpoints'], ['trap', 'Trapezoids'], ['rand', 'Random point in each strip']];
  const RNAME = { left: 'Left sum', right: 'Right sum', mid: 'Midpoint sum', trap: 'Trapezoid sum', rand: 'Random-point sum' };

  const sampleSum = (D, a, b, n, rule, u) => {
    const dx = (b - a) / n; let s = 0;
    for (let i = 0; i < n; i++) {
      const x0 = a + i * dx, x1 = x0 + dx;
      s += rule === 'trap' ? (D.f(x0) + D.f(x1)) / 2
        : D.f(rule === 'left' ? x0 : rule === 'right' ? x1 : rule === 'mid' ? x0 + dx / 2 : x0 + u[i] * dx);
    }
    return s * dx;
  };
  const exact = (D, a, b) => D.F(b) - D.F(a);
  const absInt = (D, a, b) => { const N = 20000, dx = (b - a) / N; let s = 0; for (let i = 0; i < N; i++) s += Math.abs(D.f(a + (i + .5) * dx)); return s * dx; };
  const minN = (D, a, b, rule, tol) => {
    const I = exact(D, a, b);
    for (let n = 1; n <= 100; n++) if (Math.abs(sampleSum(D, a, b, n, rule) - I) <= tol) return n;
    return null;
  };
  const makeU = seed => { let s = seed; return Array.from({ length: 100 }, () => (s = (s * 16807) % 2147483647) / 2147483647); };

  /* Challenge 1: the smallest n for a target accuracy. */
  const TOL = [
    { fn: 0, a: 0, b: 2, tol: 0.1 },
    { fn: 1, a: 0, b: PI, tol: 0.01 },
    { fn: 2, a: 0, b: 4, tol: 0.25 }
  ];
  const where = (D, a, b) => (D.vel ? 't' : 'x') + ' from ' + (D.pi ? piFmt(a) : +a.toFixed(3)) + ' to ' + (D.pi ? piFmt(b) : +b.toFixed(3));
  const fname = D => D.key === 'sq' ? 'x²' : D.key === 'sin' ? 'sin x' : D.key === 'dec' ? '6e^(−x/2)' : D.name;

  /* Challenge 2: over or under. */
  const PRED = [
    { set: { fn: 0, a: 0, b: 2, n: 4, rule: 'left' }, text: 'This is x² (rising) from 0 to 2 with 4 strips and the LEFT rule. Will the sum be bigger or smaller than the exact area?', ans: 1,
      why: 'x² is rising, so the left edge of each strip is its lowest point. Every rectangle sits inside the curve and misses a sliver of area.' },
    { set: { fn: 0, a: 0, b: 2, n: 4, rule: 'right' }, text: 'Same curve and strips, but now the RIGHT rule. Bigger or smaller than the exact area?', ans: 0,
      why: 'On a rising curve the right edge of each strip is its highest point. Every rectangle pokes out above the curve.' },
    { set: { fn: 2, a: 0, b: 4, n: 4, rule: 'left' }, text: 'Now a FALLING curve, 6e^(−x/2) from 0 to 4, with 4 strips and the LEFT rule. Bigger or smaller than the exact area?', ans: 0,
      why: 'On a falling curve the left edge of each strip is its highest point. Every rectangle pokes out above the curve.' },
    { set: { fn: 2, a: 0, b: 4, n: 4, rule: 'right' }, text: 'Same falling curve and strips with the RIGHT rule. Bigger or smaller than the exact area?', ans: 1,
      why: 'On a falling curve the right edge of each strip is its lowest point. Every rectangle sits inside the curve.' },
    { set: { fn: 1, a: 0, b: PI, n: 4, rule: 'left' }, text: 'A trickier one: sin x from 0 to π with 4 strips and the LEFT rule. The curve rises, then falls. Bigger or smaller than the exact area?', ans: 1,
      why: 'The rule "left is low, right is high" only works when the curve is always rising or always falling. Here the left rectangles are too small on the rising half and too big on the falling half. The first mistake is larger, so the sum ends a little below the area.' }
  ];
  const PRED_OPT = ['Bigger (overestimate)', 'Smaller (underestimate)', 'Exactly equal'];

  /* Challenge 3: the car. */
  const CAR = { fn: 5, a: 0, b: 5, n: 20, rule: 'mid' };
  const VEL = [
    { text: 'The graph is a car\'s velocity in m/s (positive means forward). Look at the readout for t from 0 to 5 s. Where is the car at t = 5 compared with where it started?',
      opts: ['4.083 m ahead of the start', '0.417 m behind the start', '0.417 m ahead of the start', 'Exactly back at the start'], ans: 1,
      why: 'Net change in position is the signed area. Forward area (yellow) is about 0.917 + 0.917 = 1.833. Backward area (red) is 2.250. Net: 1.833 − 2.250 = −0.417 m, so the car ends behind where it started.' },
    { text: 'How far did the car\'s odometer say it travelled from t = 0 to t = 5?',
      opts: ['2.250 m', '0.417 m', '−0.417 m', '4.083 m'], ans: 3,
      why: 'An odometer never runs backward, so red area counts as positive too: 1.833 + 2.250 = 4.083 m. That is the "Total distance" line in the readout. Net change and distance agree only when the velocity never goes negative.' },
    { text: 'The curve touches zero at t = 1 and t = 4. What is the car doing for t between 1 and 4?',
      opts: ['Moving forward, but slowly', 'Standing still', 'Moving backward', 'Moving forward, then stopping'], ans: 2,
      why: 'There the velocity is negative (the curve is below the axis), so the car is reversing. The area between the curve and the axis there is 2.250, and it counts as a distance backward.' }
  ];

  /* Challenge 4: the limit. */
  const LIM = { fn: 0, a: 0, b: 1, n: 10, rule: 'left' };
  const limTable = () => {
    const D = FN[0], rows = [1, 2, 5, 10, 100, 1000];
    return rows.map(n => ({ n, L: sampleSum(D, 0, 1, n, 'left'), R: sampleSum(D, 0, 1, n, 'right') }));
  };
  const LIMQ = [
    { text: 'The table shows left and right sums for x² on [0, 1]. As n grows, the left sums rise and the right sums fall. Both close in on one number. Which?',
      opts: ['0.300', '0.500', '1/3 ≈ 0.333', '0.250'], ans: 2,
      why: 'For a rising function the true area is always trapped between the left and right sums. At n = 1000 they are 0.3328 and 0.3338. Both are heading to 1/3, and that limit is what ∫₀¹ x² dx means.' },
    { text: 'At n = 100 the left and right sums differ by 0.010. How far apart will they be at n = 1000?',
      opts: ['0.100', '0.010', '0.001', '0'], ans: 2,
      why: 'The gap is (rise of the function) × (strip width) = (1 − 0) × 1/n. At n = 1000 that is 0.001. It is never exactly 0 for any finite n. Only the limit n → ∞ closes it completely.' },
    { text: 'Now switch the rule to Midpoints (use the Rectangles menu) and compare with the table. Does a different rule give a different limit?',
      opts: ['Yes, it uses different heights', 'Only when n is even', 'No, every rule closes in on the same number, 1/3', 'Yes, it gives exactly 0.5'], ans: 2,
      why: 'Every rule picks a height somewhere inside each thin strip. As the strips get thinner, the heights inside one strip differ by less and less, so all the rules agree in the limit. That is why the integral does not depend on the rule.' }
  ];
  const TITLES = ['Challenge 1: how many rectangles?', 'Challenge 2: over or under?', 'Challenge 3: distance travelled', 'Challenge 4: the limit'];

  register({
    id: 'riemann-sums-and-the-integral', level: 'ugrad',
    title: 'Riemann sums and the integral',
    blurb: 'Chop the area under a curve into rectangles, change the rule and the count, and watch the sums close in on the integral.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 1.5; p.cy = 1.9; p.span = 2.6;
      p.path([[-.1, 0], [3.1, 0]], { stroke: pal['grid-strong'], width: 1.5 });
      p.path([[0, -.1], [0, 3.8]], { stroke: pal['grid-strong'], width: 1.5 });
      const n = 6, dx = 2.4 / n;
      for (let i = 0; i < n; i++) {
        const x0 = .3 + i * dx, y = x0 * x0 * .6;
        p.path([[x0, 0], [x0, y], [x0 + dx, y], [x0 + dx, 0]], { fill: alpha(pal.yellow, .38), stroke: alpha(pal.yellow, .9), width: 1.2, close: true });
      }
      const pts = []; for (let x = .1; x <= 2.9; x += .05) pts.push([x, x * x * .6]);
      p.curve(pts, { stroke: pal.blue, width: 2.8 });
    },
    hook: String.raw`A car's speedometer gives its speed at every instant, but never the distance. How can you get the distance travelled from the speed alone, and what happens if the car reverses?`,
    steps: [
      { title: 'Rectangles under a curve',
        text: String.raw`<p>We want the yellow area under \(y=x^2\) between \(x=0\) and \(x=2\). Curved edges are hard, so cut it into \(n=4\) strips of width \(\Delta x=0.5\) and replace each by a rectangle.</p><p>With the <b>left</b> rule each height is the curve's value at the strip's left edge. The sum is \(1.750\), but the exact area is \(2.667\). The error is \(-0.917\).</p><p>Try Challenge 1: find the smallest \(n\) that gets within the target, and compare the rules.</p>`,
        set: { fn: 0, a: 0, b: 2, n: 4, rule: 'left', ch: 0 } },
      { title: 'Over or under?',
        text: String.raw`<p>Before you look, predict. Does the left sum come out too big or too small? What about the right sum? It depends on whether the curve is rising or falling.</p><p>Answer each case in Challenge 2. The rectangles stay hidden until you do. Each answer explains why, and the case with \(\sin x\) breaks the simple rule.</p>`,
        set: { fn: 0, a: 0, b: 2, n: 4, rule: 'left', ch: 1 } },
      { title: 'Velocity: area is distance',
        text: String.raw`<p>The graph now shows a car's velocity. Speed times time is distance, so each rectangle is a small distance. A rectangle below the axis is a distance travelled <em>backward</em>, drawn in red.</p><p>Between \(t=0\) and \(t=5\) the exact signed area is \(-0.417\) m, but the total area with every piece counted positive is \(4.083\) m. Answer Challenge 3 using the readout.</p>`,
        set: { fn: 5, a: 0, b: 5, n: 20, rule: 'mid', ch: 2 } },
      { title: 'The limit',
        text: String.raw`<p>Back to \(x^2\), now on \([0,1]\). Drag \(n\) up to 100. The left sum is \(0.285\) at \(n=10\) and the right sum is \(0.385\); at \(n=100\) they are \(0.328\) and \(0.338\).</p><p>The integral is the number all the sums close in on as \(n\to\infty\). Challenge 4 asks which number, and whether the rule matters.</p>`,
        set: { fn: 0, a: 0, b: 1, n: 10, rule: 'left', ch: 3 } }
    ],
    formal: String.raw`
      <p>Let \(f\) be defined on \([a,b]\). The definite integral is built in three moves: cut, sum, take a limit.</p>
      <h3>The Riemann sum</h3>
      <p>Cut \([a,b]\) into \(n\) strips of equal width \(\Delta x = \dfrac{b-a}{n}\), with edges \(x_i = a+i\,\Delta x\) for \(i = 0,\dots,n\). In strip \(i\) (from \(x_{i-1}\) to \(x_i\)) pick a <em>sample point</em> \(x_i^*\). The strip contributes a rectangle of height \(f(x_i^*)\) and width \(\Delta x\), so
      \[ S_n = \sum_{i = 1}^{n} f(x_i^*)\,\Delta x. \]
      The sample rule is your choice: left \(x_i^* = x_{i-1}\), right \(x_i^* = x_i\), midpoint \(x_i^* = \tfrac12(x_{i-1}+x_i)\), or any point at all. The <em>trapezoid</em> sum is the average of the left and right sums, \(T_n = \tfrac12(L_n+R_n)\).</p>
      <h3>The definite integral</h3>
      <p>The <b>definite integral</b> is the limit of these sums as the strips get thin,
      \[ \int_a^b f(x)\,dx = \lim_{n\to\infty} \sum_{i = 1}^{n} f(x_i^*)\,\Delta x. \]
      Here \(dx\) is the width \(\Delta x\) in the limit, and \(x\) is a dummy variable. For a continuous \(f\), or one with finitely many jumps, the limit exists and does not depend on how the sample points are chosen. That independence is why all the rules in the lesson close in on the same number.</p>
      <h3>Signed area and net change</h3>
      <p>Where \(f\ge 0\) a rectangle adds its area. Where \(f&lt;0\) its height is negative, so it subtracts. The integral is therefore <em>signed area</em>: area above the axis minus area below. If \(v(t)\) is velocity, then \(\int_a^b v\,dt\) is the <em>net change in position</em>, while the total distance travelled is \(\int_a^b |v|\,dt\). For the car in the lesson, \(v(t) = \tfrac12(t-1)(t-4)\) on \([0,5]\) gives \(\int v\,dt = -\tfrac{5}{12} \approx -0.417\) m and \(\int|v|\,dt = \tfrac{49}{12} \approx 4.083\) m.</p>
      <h3>Worked example: \(\int_0^1 x^2\,dx\)</h3>
      <p>Use \(n\) strips, so \(\Delta x = 1/n\) and \(x_i = i/n\). With right endpoints,
      \[ R_n = \sum_{i = 1}^{n}\Big (\frac{i}{n}\Big )^2\frac1n = \frac{1}{n^3} \sum_{i = 1}^{n} i^2 = \frac{1}{n^3} \cdot \frac{n(n+1)(2n+1)}{6} = \frac{(n+1)(2n+1)}{6n^2}. \]
      Expanding, \(R_n = \dfrac13+\dfrac{1}{2n}+\dfrac{1}{6n^2}\). Left endpoints use \(i = 0,\dots,n-1\) and give \(L_n = \dfrac{(n-1)(2n-1)}{6n^2} = \dfrac13-\dfrac{1}{2n}+\dfrac{1}{6n^2}\). As \(n\to\infty\) the terms with \(n\) in the denominator vanish, so
      \[ \int_0^1 x^2\,dx = \lim_{n\to\infty}R_n = \lim_{n\to\infty}L_n = \frac13. \]
      Check with \(n = 4\): \(L_4 = \frac{3\cdot 7}{96} = 0.21875\) and \(R_4 = \frac{5\cdot 9}{96} = 0.46875\), and \(\tfrac13\) lies between them.</p>
      <h3>How fast the sums converge</h3>
      <p>If \(f\) is monotone, the exact integral lies between \(L_n\) and \(R_n\), and \(|R_n-L_n| = |f(b)-f(a)|\,\Delta x\). So the left and right errors are about \(\tfrac{(b-a)\,|f(b)-f(a)|}{2n}\): doubling \(n\) halves the error. For a smooth \(f\) the midpoint and trapezoid sums do better, with error about \(\dfrac{(b-a)\,\Delta x^2}{24}\,|f''|\) for the midpoint and twice that, with the opposite sign, for the trapezoid. Doubling \(n\) then divides the error by about 4. Two caveats: the quadratic rate needs a smooth \(f\), and it fails across a jump, where every rule falls back to an error of order \(\Delta x\). The left sum of \(\sin x\) on \([0,\pi]\) is also unusually good, because \(f(0) = f(\pi) = 0\) makes it equal to the trapezoid sum.</p>
      <h3>What is not covered</h3>
      <p>The limit exists for every continuous \(f\) on a closed interval, but proving that needs the completeness of the real numbers and is left to a course in analysis. Integrals over infinite intervals, or of functions that blow up, are <em>improper</em> and need a second limit. Computing integrals by evaluating limits of sums is slow; the next lesson shows how antiderivatives give the exact value directly.</p>`,
    check: [
      { q: String.raw`A runner on a straight track has velocity \(+4\) m/s for 3 seconds, then \(-2\) m/s for 5 seconds (positive means east). What are the net change in position and the total distance run?`,
        choices: ['Net change 22 m, distance 2 m', 'Net change 2 m east, distance 2 m', 'Net change 2 m west, distance 22 m', 'Net change 2 m east, distance 22 m'], answer: 3,
        why: String.raw`Signed area: \(4\cdot 3=12\) m east and \(-2\cdot 5=-10\) m, so the net change is \(12-10=+2\) m. The distance counts both pieces as positive: \(12+10=22\) m. Net change and distance differ whenever the velocity changes sign.`,
        hint: String.raw`The part with negative velocity subtracts from the net change but adds to the distance.` },
      { q: String.raw`Let \(f(x)=x^2\) on \([0,2]\), cut into \(n=4\) strips of width \(0.5\). The exact area is about \(2.667\). What is the sum using the right endpoint of each strip, and is it an overestimate or an underestimate?`,
        choices: ['1.75, an underestimate', '2.75, an overestimate', '3.75, an overestimate', '3.75, an underestimate'], answer: 2,
        why: String.raw`The right endpoints are \(0.5,1,1.5,2\), so the heights are \(0.25,1,2.25,4\). The sum is \((0.25+1+2.25+4)\times 0.5=3.75\). Since \(x^2\) is rising, the right edge is the highest point of each strip, so every rectangle sticks out above the curve and the sum is an overestimate. (The value 1.75 is the left sum, and 2.75 is the trapezoid sum.)`,
        hint: String.raw`Compute \(f\) at \(0.5, 1, 1.5, 2\), add, and multiply by the width. For a rising curve, is the right edge the highest or lowest point of a strip?` }
    ],
    links: { prereq: ['limits-and-epsilon-delta'], next: ['the-fundamental-theorem-of-calculus'], related: ['area-of-a-circle', 'derivatives-as-tangent-slopes', 'mean-median-and-spread'] },

    mount({ stage, controls: C }) {
      const st = { fn: 0, a: 0, b: 2, n: 4, rule: 'left' };
      let cancel = () => {}, u = makeU(7), hide = false, seed = 7;
      const ch = { i: 0, tol: { k: 0, fb: '', ok: false }, pred: { k: 0, picked: [], fb: '', done: false },
        vel: { k: 0, picked: [], fb: '', done: false }, lim: { k: 0, picked: [], fb: '', done: false } };
      const P = new Plane(stage, { span: 6 });
      const D = () => FN[st.fn];
      const gap = () => D().step * (D().pi ? 2 : 2);
      const fa = v => D().pi ? piFmt(v) : String(+v.toFixed(3)).replace('-', '−');

      P.onDraw = (c, p) => {
        const d = D(), pal = p.pal, { a, b, n, rule } = st;
        p.fit(W, H, { l: 1.5, r: 1.4, t: 1.5, b: 1.5 });
        const fs = clamp(p.scale * .36, 11, 16), ux = x => (x - d.lo) / (d.hi - d.lo) * W, vy = y => (y - d.ylo) / (d.yhi - d.ylo) * H;
        const pt = (x, y) => [ux(x), vy(y)];
        /* grid and axes */
        for (let y = Math.ceil(d.ylo / d.ys) * d.ys; y <= d.yhi + 1e-9; y += d.ys) {
          p.path([[0, vy(y)], [W, vy(y)]], { stroke: pal.grid, width: 1.2 });
          if (Math.abs(y) > 1e-9) p.label(String(+y.toFixed(2)).replace('-', '−'), 0, vy(y), { size: fs, italic: false, color: pal.muted, align: 'right', dx: -8 });
        }
        for (let x = Math.ceil(d.lo / d.xs - 1e-9) * d.xs; x <= d.hi + 1e-9; x += d.xs) {
          p.path([[ux(x), 0], [ux(x), H]], { stroke: pal.grid, width: 1.2 });
          if (Math.abs(x) > 1e-9) p.label(d.pi ? piFmt(x) : String(+x.toFixed(2)).replace('-', '−'), ux(x), vy(0), { size: fs, italic: false, color: pal.muted, dy: 23 });
        }
        p.path([[0, vy(0)], [W, vy(0)]], { stroke: pal['grid-strong'], width: 2 });
        if (d.lo <= 0 && d.hi >= 0) p.path([[ux(0), 0], [ux(0), H]], { stroke: pal['grid-strong'], width: 2 });
        p.label(d.vel ? 't (s)' : 'x', W, vy(0), { size: fs + 1, italic: !d.vel, color: pal.muted, align: 'left', dx: 10 });
        p.label(d.vel ? 'v (m/s)' : 'y', ux(Math.max(d.lo, 0)), H, { size: fs + 1, italic: !d.vel, color: pal.muted, align: 'left', dx: 8, dy: -10 });

        /* rectangles (or trapezoids), clipped so area above and below the axis get different colors */
        const dx = (b - a) / n, y0 = p.Y(vy(0)), sample = [];
        for (let i = 0; i < n; i++) {
          const x0 = a + i * dx, x1 = x0 + dx;
          const xs = rule === 'left' ? x0 : rule === 'right' ? x1 : rule === 'mid' ? x0 + dx / 2 : x0 + u[i] * dx;
          sample.push(xs);
          if (hide) continue;
          const poly = rule === 'trap' ? [pt(x0, 0), pt(x0, d.f(x0)), pt(x1, d.f(x1)), pt(x1, 0)]
            : [pt(x0, 0), pt(x0, d.f(xs)), pt(x1, d.f(xs)), pt(x1, 0)];
          for (const up of [true, false]) {
            c.save(); c.beginPath();
            if (up) c.rect(0, 0, p.w, y0); else c.rect(0, y0, p.w, p.h - y0);
            c.clip();
            c.beginPath(); poly.forEach(([x, y], k) => k ? c.lineTo(p.X(x), p.Y(y)) : c.moveTo(p.X(x), p.Y(y))); c.closePath();
            c.fillStyle = alpha(up ? pal.yellow : pal.red, .4); c.fill();
            if (n <= 60) { c.strokeStyle = alpha(up ? pal.yellow : pal.red, .95); c.lineWidth = n <= 30 ? 1.5 : 1; c.stroke(); }
            c.restore();
          }
        }
        if (hide) for (let i = 0; i <= n; i++) { const x = a + i * dx; p.path([[ux(x), vy(0) - .12], [ux(x), vy(0) + .12]], { stroke: pal['grid-strong'], width: 1.5 }); }

        /* the curve (broken at jumps) */
        const brk = [d.lo, ...(d.breaks || []), d.hi], N = 300;
        for (let k = 0; k < brk.length - 1; k++) {
          const s = brk[k], e = brk[k + 1], pts = [];
          for (let i = 0; i <= N; i++) { const x = s + (e - s) * i / N; pts.push(pt(x, d.f(i === N ? e - 1e-9 : x))); }
          p.path(pts, { stroke: pal.blue, width: 3.2 });
        }
        if (n <= 25) for (const xs of sample) p.dot(ux(xs), vy(d.f(xs)), 4.5, pal.yellow, pal.stage, 1.5);

        /* interval handles on the axis */
        p.path([[ux(a), 0], [ux(a), H]], { stroke: pal['grid-strong'], width: 1.5, dash: [5, 6] });
        p.path([[ux(b), 0], [ux(b), H]], { stroke: pal['grid-strong'], width: 1.5, dash: [5, 6] });
        for (const [v, nm] of [[a, 'a'], [b, 'b']]) {
          p.dot(ux(v), vy(0), 8, pal.yellow, pal.brass, 3);
          p.label(nm, ux(v), vy(0), { size: fs + 3, dy: -20 });
        }
        /* legend */
        const lx = p.X(0), ly = p.Y(H) - 38, sq = clamp(p.scale * .3, 9, 13);
        c.font = `500 ${fs}px "Hanken Grotesk", system-ui, sans-serif`; c.textBaseline = 'middle'; c.textAlign = 'left';
        c.fillStyle = alpha(pal.yellow, .6); c.fillRect(lx, ly - sq / 2, sq, sq); c.fillStyle = pal.text;
        const t1 = d.vel ? 'forward (+)' : 'above axis (+)'; c.fillText(t1, lx + sq + 5, ly);
        const x2 = lx + sq + 5 + c.measureText(t1).width + 16;
        c.fillStyle = alpha(pal.red, .6); c.fillRect(x2, ly - sq / 2, sq, sq); c.fillStyle = pal.text;
        c.fillText(d.vel ? 'backward (−)' : 'below axis (−)', x2 + sq + 5, ly);
      };

      /* ---------- readout ---------- */
      const upd = () => {
        const d = D(), { a, b, n, rule } = st, dx = (b - a) / n;
        const S = sampleSum(d, a, b, n, rule, u), I = exact(d, a, b), e = S - I;
        let html = `<span class="k">${d.eq}</span><br><span class="k">On</span> [${fa(a)}, ${fa(b)}] &nbsp; <span class="k">n =</span> ${n} &nbsp; <span class="k">Δ${d.vel ? 't' : 'x'} =</span> ${f3(dx)}<br>`;
        if (hide) html += '<span class="k">Sum</span> hidden until you predict';
        else {
          html += `<span class="k">${d.vel ? 'Net change, ' + RNAME[rule].toLowerCase() : RNAME[rule]}</span> ${f3(S)}<br>` +
            `<span class="k">${d.vel ? 'Net change, exact' : 'Exact integral'}</span> ${f3(I)}<br><span class="k">Error (sum − exact)</span> ${f3(e)}`;
          if (d.vel) html += `<br><span class="k">Total distance (area counted +)</span> ${f3(absInt(d, a, b))}`;
        }
        ro.innerHTML = html;
      };
      const fixSl = (s, inp, v) => {
        const d = D(); inp.min = d.lo; inp.max = d.hi; inp.step = d.step / (d.pi ? 1 : 1);
        s.set(v); inp.style.setProperty('--p', ((v - d.lo) / (d.hi - d.lo) * 100) + '%');
      };
      const sync = () => { nS.set(st.n); fixSl(aS, aI, st.a); fixSl(bS, bI, st.b); fnSel.value = String(st.fn); ruleSel.value = st.rule; P.draw(); upd(); };
      const edit = fn => v => { cancel(); fn(v); sync(); };

      /* ---------- controls ---------- */
      const probe = C.readout(), host = probe.parentNode; probe.remove();
      C.title('Function');
      const fnSel = C.select({ label: 'Curve', options: FN.map((f, i) => ({ value: String(i), label: f.name })), value: '0',
        onChange: v => { cancel(); st.fn = +v; const def = { sq: [0, 2], sin: [0, PI], dec: [0, 4], cross: [-3, 3], step: [0, 4], car: [0, 5] }[D().key]; st.a = def[0]; st.b = def[1]; hide = false; sync(); } });
      C.title('Rectangles');
      const ruleSel = C.select({ label: 'Sample rule', options: RULES.map(r => ({ value: r[0], label: r[1] })), value: st.rule,
        onChange: v => { cancel(); st.rule = v; sync(); } });
      const nS = C.slider({ label: 'Number of rectangles n', min: 1, max: 100, step: 1, value: st.n, format: v => String(Math.round(v)), onInput: edit(v => { st.n = Math.round(v); }) });
      const aS = C.slider({ label: 'Start a', min: 0, max: 3, step: .25, value: st.a, format: fa, onInput: edit(v => { st.a = clamp(snap(v, D().step), D().lo, st.b - gap()); }) });
      const aI = host.lastElementChild.querySelector('input');
      const bS = C.slider({ label: 'End b', min: 0, max: 3, step: .25, value: st.b, format: fa, onInput: edit(v => { st.b = clamp(snap(v, D().step), st.a + gap(), D().hi); }) });
      const bI = host.lastElementChild.querySelector('input');
      C.buttons([{ label: 'New random points', onClick: () => { seed = (seed * 31 + 11) % 997; u = makeU(seed); sync(); } }]);
      const ro = C.readout();
      const chBox = h('div', { class: 'ctl', style: 'border-top:1px solid var(--line);padding-top:14px;display:flex;flex-direction:column;gap:10px' });
      host.append(chBox);
      C.hint('Drag the two yellow handles on the axis, or use the sliders.');

      draggable(P, {
        hit: (px, py) => {
          const d = D(), ya = P.Y(((0 - d.ylo) / (d.yhi - d.ylo)) * H), xa = P.X((st.a - d.lo) / (d.hi - d.lo) * W), xb = P.X((st.b - d.lo) / (d.hi - d.lo) * W);
          const da = Math.hypot(xa - px, ya - py), db = Math.hypot(xb - px, ya - py);
          if (Math.min(da, db) > 22) return null;
          return da <= db ? 'a' : 'b';
        },
        move: (hd, ux) => {
          cancel(); const d = D(), x = clamp(snap(d.lo + ux / W * (d.hi - d.lo), d.step), d.lo, d.hi);
          if (hd === 'a') st.a = clamp(x, d.lo, st.b - gap()); else st.b = clamp(x, st.a + gap(), d.hi);
          sync();
        }
      });

      /* ---------- challenges ---------- */
      const setup = (s, ms = 800) => {
        cancel(); const { a, b, fn, n, rule } = s, cur = st.fn;
        st.fn = fn; st.n = n; st.rule = rule;
        if (fn !== cur || ms === 0) { st.a = a; st.b = b; sync(); }
        else cancel = animateTo(st, { a, b }, ms, sync);
        sync();
      };
      const say = (cls, html) => h('p', { style: `margin:0;padding-left:10px;border-left:3px solid var(--${cls});font-size:.9rem;line-height:1.5`, html });
      const optButtons = (q, state, onPick) => h('div', { class: 'ctl buttons', style: 'flex-direction:column;align-items:stretch' },
        q.opts.map((o, i) => { const b = h('button', { type: 'button', class: 'btn', style: 'justify-content:flex-start;text-align:left', onclick: () => onPick(i) }, o); if (state.done || state.picked.includes(i)) b.disabled = true; return b; }));
      function render() {
        const kids = [];
        kids.push(h('div', { class: 'ctl buttons', role: 'tablist' }, TITLES.map((t, i) =>
          h('button', { type: 'button', class: i === ch.i ? 'btn primary' : 'btn', style: 'padding:6px 12px', 'aria-label': t, onclick: () => goCh(i, true) }, String(i + 1)))));
        kids.push(h('p', { class: 'ctl-title', style: 'margin:0' }, TITLES[ch.i]));
        if (ch.i === 0) {
          const s = ch.tol, T = TOL[s.k], d = FN[T.fn];
          kids.push(h('p', { style: 'margin:0;font-size:.92rem', html: `Target ${s.k + 1} of ${TOL.length}: for <b>${fname(d)}</b> with ${where(d, T.a, T.b)}, get the sum within <b>${T.tol}</b> of the exact integral. Choose a rule and slide <b>n</b> to the <em>smallest</em> number that works, then submit.` }));
          if (s.fb) kids.push(s.fb);
          kids.push(h('div', { class: 'ctl buttons' }, [
            h('button', { type: 'button', class: 'btn primary', onclick: submitTol }, 'Submit this n'),
            h('button', { type: 'button', class: 'btn', onclick: () => { setup({ fn: T.fn, a: T.a, b: T.b, n: st.n, rule: st.rule }); } }, 'Reset graph'),
            h('button', { type: 'button', class: 'btn', onclick: () => { s.k = (s.k + 1) % TOL.length; s.fb = ''; const N = TOL[s.k]; setup({ fn: N.fn, a: N.a, b: N.b, n: 4, rule: st.rule === 'rand' ? 'left' : st.rule }); render(); } }, 'Next target')]));
        } else if (ch.i === 3) {
          const s = ch.lim, q = LIMQ[s.k], rows = limTable();
          kids.push(h('div', { style: 'font-size:.84rem;font-variant-numeric:tabular-nums;line-height:1.55;overflow-x:auto', html:
            '<table style="border-collapse:collapse;width:100%"><tr style="color:var(--muted);text-align:right"><th style="text-align:left;font-weight:500">n</th><th style="font-weight:500">Left sum</th><th style="font-weight:500">Right sum</th><th style="font-weight:500">Gap</th></tr>' +
            rows.map(r => `<tr style="text-align:right"><td style="text-align:left">${r.n}</td><td>${r.L.toFixed(4)}</td><td>${r.R.toFixed(4)}</td><td>${(r.R - r.L).toFixed(4)}</td></tr>`).join('') + '</table>' }));
          kids.push(h('p', { style: 'margin:0;font-size:.92rem', html: q.text }));
          kids.push(optButtons(q, s, pick => quiz(s, q, pick, ch.i)));
          if (s.fb) kids.push(s.fb);
          if (s.done && s.k < LIMQ.length - 1) kids.push(h('div', { class: 'ctl buttons' }, h('button', { type: 'button', class: 'btn primary', onclick: () => { s.k++; s.picked = []; s.done = false; s.fb = ''; render(); } }, 'Next question')));
        } else {
          const s = ch.i === 1 ? ch.pred : ch.vel, list = ch.i === 1 ? PRED : VEL, q = list[s.k];
          kids.push(h('p', { style: 'margin:0;font-size:.92rem', html: q.text }));
          const opts = ch.i === 1 ? { opts: PRED_OPT } : q;
          kids.push(optButtons(opts, s, pick => quiz(s, q, pick, ch.i)));
          if (s.fb) kids.push(s.fb);
          if (s.done && s.k < list.length - 1) kids.push(h('div', { class: 'ctl buttons' }, h('button', { type: 'button', class: 'btn primary', onclick: () => {
            s.k++; s.picked = []; s.done = false; s.fb = '';
            if (ch.i === 1) { setup(PRED[s.k].set); hide = true; sync(); }
            render(); } }, ch.i === 1 ? 'Next case' : 'Next question')));
        }
        chBox.replaceChildren(...kids);
      }
      function quiz(s, q, pick, which) {
        const good = pick === q.ans;
        if (which === 1) {
          hide = false; s.done = true; s.picked = [pick]; setup(q.set, 0);
          const d = FN[q.set.fn], S = sampleSum(d, q.set.a, q.set.b, q.set.n, q.set.rule), I = exact(d, q.set.a, q.set.b);
          s.fb = say(good ? 'green' : 'red', `<b>${good ? 'Right.' : 'Not quite.'}</b> The sum is ${f3(S)} and the exact area is ${f3(I)}, so the sum is ${S > I ? 'bigger' : 'smaller'} by ${f3(Math.abs(S - I))}. ${q.why}`);
          sync();
        } else if (good) { s.done = true; s.picked = [pick]; s.fb = say('green', `<b>Right.</b> ${q.why}`); }
        else { s.picked.push(pick); s.fb = say('red', `<b>Not that one.</b> ${wrongWhy(which, s.k, pick)} Try another answer.`); }
        render();
      }
      const wrongWhy = (which, k, pick) => {
        const T = which === 2 ? [
          ['That is the total area with every piece counted positive, which is the distance, not the net change.', '', 'The sign is wrong. The backward area (2.250) is bigger than the forward area (1.833), so the net is negative.', 'The pieces do not cancel exactly. The "Net change" line of the readout is not 0.'],
          ['That is just the red (backward) area. The odometer adds up all the travel, forward and backward.', 'That is the net change. The odometer does not subtract the backward trip.', 'A distance cannot be negative. The odometer counts every piece as positive.', ''],
          ['The curve is below the axis there, so the velocity is negative, not positive.', 'Standing still means velocity exactly 0, but here the velocity is below 0.', '', 'It does not stop in the middle. The curve stays below the axis, so v is negative the whole time.']
        ] : [
          ['0.300 is close, but the left sums are already above 0.3 at n = 100 and still rising.', 'Look at the last rows: none of those sums is anywhere near 0.5.', '', 'The left sums have already passed 0.25. Look at the last rows.'],
          ['That is the gap at n = 10. The gap shrinks as n grows.', 'That is the gap at n = 100. A larger n makes it smaller still.', '', 'The gap shrinks, but it is not exactly 0 for any finite n.'],
          ['Different heights inside a strip differ less and less as the strip gets thin, so the limit does not change.', 'Whether n is even or odd does not matter. The strips get thin either way.', '', 'Switch to midpoints and look at n = 100. The sum is about 0.333, not 0.5.']
        ];
        return (T[k] && T[k][pick]) || 'Check the readout and the table again.';
      };
      function submitTol() {
        const s = ch.tol, T = TOL[s.k], d = FN[T.fn], rule = st.rule;
        if (rule === 'rand') { s.fb = say('yellow', 'Random points give a different sum each time, so pick left, right, midpoint or trapezoid for this challenge.'); render(); return; }
        if (st.fn !== T.fn || Math.abs(st.a - T.a) > 1e-6 || Math.abs(st.b - T.b) > 1e-6) { s.fb = say('yellow', 'The graph no longer matches this target. Press Reset graph, then choose n.'); render(); return; }
        const I = exact(d, T.a, T.b), e1 = Math.abs(sampleSum(d, T.a, T.b, st.n, rule) - I), e2 = Math.abs(sampleSum(d, T.a, T.b, Math.min(2 * st.n, 200), rule) - I);
        const ratio = e2 > 1e-12 ? e1 / e2 : Infinity;
        const dbl = e2 < 1e-12 ? 'Doubling n would make the sum exact.' : `If you double n to ${2 * st.n}, the error goes from ${f3(e1)} to ${f3(e2)}, divided by ${ratio.toFixed(1)}. ` +
          (ratio < 2.8 ? 'That is about half, so for this rule the error shrinks like 1/n.' : ratio < 6 ? 'That is about a quarter, so for this rule the error shrinks like 1/n².' : 'The error shrinks even faster here.');
        if (e1 > T.tol) {
          s.fb = say('red', `<b>Not yet.</b> With n = ${st.n} the error is ${f3(e1)}, and the target is ${T.tol}. ${dbl} Try a larger n, or a different rule.`);
        } else {
          const m = minN(d, T.a, T.b, rule, T.tol), fmtN = v => v == null ? 'more than 100' : String(v);
          const all = ['left', 'right', 'mid', 'trap'].map(r => `${RNAME[r].replace(' sum', '').toLowerCase()} ${fmtN(minN(d, T.a, T.b, r, T.tol))}`).join(', ');
          const verdict = m === st.n ? `<b>Yes, the smallest for this rule.</b> The error is ${f3(e1)}.` : `<b>It works, but not the smallest.</b> The error is ${f3(e1)}, and n = ${m} already meets the target for this rule.`;
          const mL = minN(d, T.a, T.b, 'left', T.tol), mM = minN(d, T.a, T.b, 'mid', T.tol);
          const cmp = mL == null || mL > 2 * mM ? 'Midpoint and trapezoid need far fewer rectangles here: their error shrinks like 1/n², while left and right shrink like 1/n.'
            : 'The rules are close here. For sin x on [0, π] both end heights are 0, so the left and right errors shrink like 1/n² too, and midpoint is only about twice as accurate.';
          s.fb = say(m === st.n ? 'green' : 'yellow', `${verdict} ${dbl}<br>Smallest n for each rule on this target: ${all}. ${cmp}`);
        }
        render();
      }
      function goCh(i, doSetup) {
        ch.i = i; hide = false;
        if (doSetup) {
          if (i === 0) { const T = TOL[ch.tol.k]; setup({ fn: T.fn, a: T.a, b: T.b, n: st.n, rule: st.rule === 'rand' ? 'left' : st.rule }); }
          else if (i === 1) { setup(PRED[ch.pred.k].set); hide = !ch.pred.done; }
          else if (i === 2) setup(CAR); else setup(LIM);
        } else if (i === 1) hide = !ch.pred.done;
        sync(); render();
      }
      const apply = (patch, immediate) => {
        cancel();
        let { fn, rule, n, ch: c2, a, b } = patch;
        if (c2 === 1) ({ fn, rule, n, a, b } = PRED[ch.pred.k].set);
        if (fn !== undefined) st.fn = fn; if (rule !== undefined) st.rule = rule; if (n !== undefined) st.n = n;
        if (c2 !== undefined) {
          ch.i = c2; hide = c2 === 1 && !ch.pred.done;
          render();
        }
        if (immediate || fn !== undefined) { if (a !== undefined) st.a = a; if (b !== undefined) st.b = b; sync(); }
        else cancel = animateTo(st, { a: a ?? st.a, b: b ?? st.b }, 900, sync);
        if (fn !== undefined && !immediate) sync();
      };
      sync(); render();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
