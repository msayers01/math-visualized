/* =====================================================================
   UNDERGRAD — The gradient and contour maps
   ===================================================================== */
{
  const N = 80, D0 = 3, DEG = Math.PI / 180;
  const r2 = v => Math.round(v * 100) / 100;
  const n2 = v => { const r = +Math.abs(v).toFixed(2); return (v < 0 && r !== 0 ? '−' : '') + r; };
  const wrap360 = a => ((a % 360) + 360) % 360;
  const good = t => `<b style="color:var(--green-ink)">${t}</b>`;
  const bad = t => `<b style="color:var(--red-ink)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;
  const FS = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';

  /* the four landscapes: height f, gradient g (analytic), side-view range zr, contour spacing, arrow scale gs */
  const FN = {
    hill:   { label: 'A hill', f: (x, y) => 4 * Math.exp(-x * x / 8 - y * y / 4),
              g: (x, y) => { const v = 4 * Math.exp(-x * x / 8 - y * y / 4); return [-x / 4 * v, -y / 2 * v]; },
              zr: [-.3, 4.6], zs: 1, step: .5, gs: .7, tex: 'f(x, y) = 4 e^(−x²/8 − y²/4)' },
    saddle: { label: 'A saddle (mountain pass)', f: (x, y) => (x * x - y * y) / 2, g: (x, y) => [x, -y],
              zr: [-5, 5], zs: 2, step: 1, gs: .4, tex: 'f(x, y) = (x² − y²) / 2' },
    bowl:   { label: 'A bowl', f: (x, y) => x * x / 4 + y * y / 2, g: (x, y) => [x / 2, y],
              zr: [-.5, 7.3], zs: 2, step: 1, gs: .6, tex: 'f(x, y) = x²/4 + y²/2' },
    ramp:   { label: 'A ramp (tilted plane)', f: (x, y) => .3 * x + .4 * y, g: () => [.3, .4],
              zr: [-2.6, 2.6], zs: 1, step: .5, gs: 2, tex: 'f(x, y) = 0.3x + 0.4y' }
  };
  const FKEYS = Object.keys(FN);

  /* grid values and extremes, computed once per landscape */
  const prep = F => {
    if (F.V) return F;
    const V = new Float64Array((N + 1) * (N + 1)), hh = 2 * D0 / N; let lo = Infinity, hi = -Infinity, gm = 0;
    for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
      const x = -D0 + i * hh, y = -D0 + j * hh, v = F.f(x, y); V[j * (N + 1) + i] = v; lo = Math.min(lo, v); hi = Math.max(hi, v);
      gm = Math.max(gm, Math.hypot(...F.g(x, y)));
    }
    F.V = V; F.lo = lo; F.hi = hi; F.gmax = gm; F.levels = [];
    for (let L = Math.ceil(lo / F.step) * F.step; L < hi; L += F.step) { const l = r2(L); if (l > lo + 1e-6 && l < hi - 1e-6) F.levels.push(l); }
    F.segs = F.levels.map(L => segsAt(F, L));
    return F;
  };

  /* marching squares: line segments [x0, y0, x1, y1, ...] of the level curve f = L */
  const TABLE = [[], [[3, 0]], [[0, 1]], [[3, 1]], [[1, 2]], null, [[0, 2]], [[3, 2]], [[3, 2]], [[0, 2]], null, [[1, 2]], [[3, 1]], [[0, 1]], [[3, 0]], []];
  const segsAt = (F, L) => {
    const out = [], hh = 2 * D0 / N, V = F.V, W = N + 1;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const a = V[j * W + i], b = V[j * W + i + 1], c = V[(j + 1) * W + i + 1], d = V[(j + 1) * W + i];
      const idx = (a > L ? 1 : 0) | (b > L ? 2 : 0) | (c > L ? 4 : 0) | (d > L ? 8 : 0);
      if (idx === 0 || idx === 15) continue;
      const x0 = -D0 + i * hh, y0 = -D0 + j * hh, x1 = x0 + hh, y1 = y0 + hh;
      const pt = e => {
        if (e === 0) return [x0 + (L - a) / (b - a) * hh, y0];
        if (e === 1) return [x1, y0 + (L - b) / (c - b) * hh];
        if (e === 2) return [x0 + (L - d) / (c - d) * hh, y1];
        return [x0, y0 + (L - a) / (d - a) * hh];
      };
      let pairs = TABLE[idx];
      if (!pairs) {
        const hi = (a + b + c + d) / 4 > L;
        pairs = idx === 5 ? (hi ? [[0, 1], [3, 2]] : [[3, 0], [1, 2]]) : (hi ? [[3, 0], [1, 2]] : [[0, 1], [3, 2]]);
      }
      for (const [e1, e2] of pairs) { const p1 = pt(e1), p2 = pt(e2); out.push(p1[0], p1[1], p2[0], p2[1]); }
    }
    return out;
  };

  const COMPASS = [['E →', 0, 'east'], ['NE ↗', 45, 'north-east'], ['N ↑', 90, 'north'], ['NW ↖', 135, 'north-west'],
                   ['W ←', 180, 'west'], ['SW ↙', 225, 'south-west'], ['S ↓', 270, 'south'], ['SE ↘', 315, 'south-east']];
  const gradAngle = (F, x, y) => { const [gx, gy] = F.g(x, y); return wrap360(Math.atan2(gy, gx) / DEG); };
  const gmag = (F, x, y) => Math.hypot(...F.g(x, y));
  const rate = (F, x, y, deg) => { const [gx, gy] = F.g(x, y); return gx * Math.cos(deg * DEG) + gy * Math.sin(deg * DEG); };
  const nearestCompass = (F, x, y) => {
    const phi = gradAngle(F, x, y); let best = 0, bd = 1e9;
    COMPASS.forEach((c, i) => { const d = Math.abs(((phi - c[1] + 540) % 360) - 180); if (d < bd) { bd = d; best = i; } });
    return best;
  };
  const gm2 = (key, x, y) => n2(gmag(FN[key], x, y));

  /* Practice problems: a fixed list. 'compass' asks for a direction, 'choice' for one of the listed answers. */
  const PROBS = [
    { kind: 'compass', fn: 'bowl', x: 2, y: 1, view: 'x',
      q: 'The landscape is a bowl, P is at (2, 1). Which of the eight directions is steepest uphill at P?',
      why: 'On a bowl, uphill is away from the lowest point, across the contour. It is not toward the middle.' },
    { kind: 'choice', fn: 'hill', x: 1, y: 1, view: 'x', marks: [{ x: .5, y: 0, t: 'A' }, { x: 2, y: 0, t: 'B' }],
      q: 'On the hill, which marked place is steeper: A at (0.5, 0) or B at (2, 0)? Look at the contours.',
      ch: [['A is steeper', () => `Near A the contours are far apart: the slope there is only |∇f| = ${gm2('hill', .5, 0)}. The top of a hill is nearly flat.`],
           ['B is steeper', () => `Near B the contours crowd together. The steepness is |∇f| = ${gm2('hill', 2, 0)} at B and only ${gm2('hill', .5, 0)} at A. Crowded contours mean steep ground.`],
           ['They are equally steep', () => `Both are at height values you can read from the shading, but steepness is about how fast the height changes, which is how close the contours are. B is steeper: ${gm2('hill', 2, 0)} against ${gm2('hill', .5, 0)}.`]], ans: 1 },
    { kind: 'choice', fn: 'saddle', x: 2, y: -1, view: 'y',
      q: 'The landscape is the saddle f = (x² − y²)/2. P is at (2, −1). Treat x as a constant and differentiate with respect to y. What is the partial derivative fy at P?',
      ch: [['−1', () => 'fy = −y, and y = −1 here, so −y = −(−1) = +1. Watch the sign. The red cut in the lower graph is rising at P.'],
           ['1', () => 'fy = −y = −(−1) = 1. The red cut rises there: walking north from P, f increases by about 1 per unit.'],
           ['2', () => 'That is fx = x = 2. For fy only the y part changes, and −y²/2 has derivative −y.'],
           ['−2', () => 'The factor 1/2 cancels against the 2 from differentiating y², so fy = −y, not −2y.']], ans: 1,
      after: 'showG' },
    { kind: 'choice', fn: 'bowl', x: 2, y: 1, view: 'u', showU: true, th: Math.atan2(.8, .6) / DEG,
      q: 'The landscape is the bowl f = x²/4 + y²/2, P is at (2, 1), and u = (0.6, 0.8) is a unit vector. First find ∇f = (fx, fy) at P. Then what is Dᵤf = ∇f · u?',
      ch: [['−0.2', () => 'That subtracts the second product. Both terms are added: fx·0.6 + fy·0.8 with fx = fy = 1 gives 0.6 + 0.8.'],
           ['1', () => 'That would be fx alone, the rate due east. The direction u also has a north part.'],
           ['1.4', () => '∇f = (1, 1), so Dᵤf = 1(0.6) + 1(0.8) = 1.4. It is a little less than |∇f| = 1.41 because u is not exactly along ∇f.'],
           ['1.41', () => 'That is |∇f| = √2, the largest rate over all directions. u points a little off the gradient, so the rate is slightly smaller: 1.4.']], ans: 2,
      after: 'showG' },
    { kind: 'choice', fn: 'ramp', x: 0, y: 0, view: 'x',
      q: 'The ramp is f = 0.3x + 0.4y, so ∇f = (0.3, 0.4) everywhere. What is the largest rate of change of f in any direction?',
      ch: [['0.3', () => 'That is only the slope due east, fx. A tilted direction can climb faster.'],
           ['0.4', () => 'That is the slope due north, fy. The steepest direction mixes both.'],
           ['0.5', () => 'The largest rate is |∇f| = √(0.3² + 0.4²) = √0.25 = 0.5, in the direction of ∇f, which makes the 3-4-5 triangle.'],
           ['0.7', () => '0.3 + 0.4 adds the components like numbers. They are the two legs of a right triangle, so the length is √(0.09 + 0.16) = 0.5.']], ans: 2,
      after: 'showG' },
    { kind: 'choice', fn: 'hill', x: 1, y: 1, view: 'u', showU: true, th: 0,
      q: 'On the hill at P = (1, 1), in which direction is the rate of change of f exactly zero?',
      ch: [['Along ∇f, straight uphill', () => 'That is where the rate is largest, |∇f|.'],
           ['Along the contour through P (at right angles to ∇f)', () => 'Walking along a contour keeps the height the same, so the rate is 0. Since Dᵤf = |∇f| cos φ, it is zero when the angle φ to ∇f is 90°.'],
           ['Opposite to ∇f, straight downhill', () => 'That gives the most negative rate, −|∇f|, the steepest way down.'],
           ['Straight toward the top at (0, 0)', () => { const d = rate(FN.hill, 1, 1, 225); return `This hill is longer in the x direction, so the way to the top is not across the contour. The rate toward (0, 0) is ${n2(d)}, not 0.`; }]], ans: 1,
      after: 'contour' },
    { kind: 'choice', fn: 'bowl', x: 2, y: 1, view: 'x',
      q: 'Gradient descent on the bowl f = x²/4 + y²/2 uses the rule new point = old point − η ∇f. Start at (2, 1), where ∇f = (1, 1), and take one step with η = 1. Where do you land?',
      ch: [['(3, 2)', () => 'That adds ∇f, which is a step uphill. Descent subtracts it.'],
           ['(1, 0)', () => '(2, 1) − 1·(1, 1) = (1, 0). The height fell from 1.5 to 0.25.'],
           ['(0, −1)', () => 'That is what η = 2 would give: (2, 1) − 2(1, 1). Here η = 1.'],
           ['(1, 1)', () => 'That subtracts only the x part. Both coordinates move: new y = 1 − 1·1 = 0.']], ans: 1,
      after: 'descent' }
  ];

  register({
    id: 'gradient-and-contour-maps', level: 'ugrad',
    title: 'The gradient and contour maps',
    blurb: 'Read a landscape as a contour map, measure its slope in every direction, and climb it with the gradient.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 3.5;
      for (let k = 1; k <= 4; k++) {
        const pts = []; for (let i = 0; i <= 60; i++) { const t = i / 60 * Math.PI * 2; pts.push([.78 * k * Math.cos(t), .5 * k * Math.sin(t)]); }
        p.path(pts, { stroke: k === 3 ? pal.violet : pal.muted, width: k === 3 ? 3 : 1.4, fill: k === 4 ? alpha(pal.yellow, .12) : undefined });
      }
      const t = -.7, px = 2.34 * Math.cos(t), py = 1.5 * Math.sin(t);
      let gx = -px / (2.34 * 2.34), gy = -py / (1.5 * 1.5); const m = Math.hypot(gx, gy); gx = gx / m * 1.25; gy = gy / m * 1.25;
      p.arrow(px, py, px + gx, py + gy, pal.text, 3);
      p.dot(px, py, 5, pal.yellow, pal.stage, 1.5);
    },
    hook: String.raw`You stand on a foggy hillside and can only feel the ground under your feet. Which way is steepest uphill, and how steep is it? A hiker's map draws the whole hill as curves of equal height.`,
    steps: [
      { title: 'Read the map',
        text: String.raw`<p>The hill is drawn as a <b>contour map</b>. Each thin curve joins points of equal height, like the lines on a hiker's map. Darker shading means higher ground.</p><p>The <b>violet</b> curve is the contour through <b>P</b>. P is at \((1,1)\) and its height is \(f=2.75\). Where contours crowd together the ground is steep. Drag P around and watch the height.</p>`,
        set: { x: 1, y: 1, th: 0, view: 'x', showG: false, showU: false } },
      { title: 'Slopes along x and y',
        text: String.raw`<p>Hold \(y\) fixed and walk east. The height follows the <b>green</b> cut in the lower graph. Its slope at P is the <b>partial derivative</b> \(f_x=-0.69\): east is downhill.</p><p>Press <b>y-cut</b> to hold \(x\) fixed and walk north instead. That <b>red</b> slope is \(f_y=-1.37\), a steeper descent.</p>`,
        set: { x: 1, y: 1, th: 0, view: 'x', showG: false, showU: false } },
      { title: 'Predict, then see the gradient',
        text: String.raw`<p>Which way is steepest uphill from P? Commit to a guess with the eight buttons under <b>Predict, then see</b>.</p><p>Then the <b>gradient</b> \(\nabla f=(f_x,f_y)=(-0.69,-1.37)\) appears as an arrow. It meets the violet contour at a right angle and points uphill. Its length shows the steepness, \(|\nabla f|=1.54\).</p>`,
        set: { x: 1, y: 1, th: 0, view: 'x', showG: false, showU: false } },
      { title: 'Any direction at all',
        text: String.raw`<p>The blue arrow <b>u</b> has length 1. Drag its tip, or use <b>Direction angle</b>. The rate of change that way is \(D_u f=\nabla f\cdot u\). Due east (0°) it is \(f_x=-0.69\).</p><p>Turn u along \(\nabla f\) (about 243°): the rate is largest, 1.54. Turn it along the violet contour (about 153° or 333°): the rate is 0. Then try <b>Climb the hill</b>.</p>`,
        set: { x: 1, y: 1, th: 0, view: 'u', showG: true, showU: true } }
    ],
    formal: String.raw`
      <p><b>Setting.</b> A function \(f(x,y)\) gives a height at each point of the plane. Its graph is a surface, the landscape. A <em>level curve</em> (or contour) of height \(c\) is the set of points where \(f(x,y)=c\). A contour map draws level curves for equally spaced values of \(c\), so crowded curves mean the height changes quickly.</p>
      <h3>Partial derivatives</h3>
      <p>Freeze \(y=b\). The <em>x-cut</em> \(x\mapsto f(x,b)\) is an ordinary function of one variable, and its slope at \(x=a\) is the partial derivative
      \[ f_x(a,b)=\lim_{h\to 0}\frac{f(a+h,b)-f(a,b)}{h}. \]
      In practice: differentiate with respect to \(x\) and treat \(y\) as a constant. Likewise \(f_y\) is the slope of the y-cut. For \(f=\tfrac14x^2+\tfrac12y^2\) this gives \(f_x=\tfrac12x\) and \(f_y=y\), so at \((2,1)\) both equal \(1\).</p>
      <h3>The gradient</h3>
      <p>The <em>gradient</em> packs the two slopes into one vector,
      \[ \nabla f=(f_x,\,f_y),\qquad |\nabla f|=\sqrt{f_x^2+f_y^2}. \]
      Each point has its own gradient, so \(\nabla f\) is a field of arrows. Here \(\nabla f(2,1)=(1,1)\) and \(|\nabla f|=\sqrt2\approx 1.41\).</p>
      <h3>The directional derivative</h3>
      <p>Let \(u=(u_1,u_2)\) be a unit vector (length \(1\)). Walking from \((a,b)\) in direction \(u\) traces the line \((a+tu_1,\,b+tu_2)\), and the <em>u-cut</em> of the landscape along it has slope
      \[ D_u f=\frac{d}{dt}f(a+tu_1,\,b+tu_2)\Big|_{t=0}=f_xu_1+f_yu_2=\nabla f\cdot u, \]
      by the chain rule, provided \(f\) is differentiable at the point (for instance when \(f_x\) and \(f_y\) are continuous nearby). Writing \(\varphi\) for the angle between \(u\) and \(\nabla f\),
      \[ D_uf=|\nabla f|\cos\varphi. \]
      Three consequences, all visible in the lower graph "Rate vs angle": the largest rate is \(|\nabla f|\), reached at \(\varphi=0\) (along the gradient); the smallest is \(-|\nabla f|\) at \(\varphi=180^\circ\); and the rate is \(0\) at \(\varphi=90^\circ\). The unit length matters: a vector of length 5 would give 5 times the rate per step.</p>
      <h3>Why the gradient is perpendicular to the contour</h3>
      <p>Let \(r(t)\) trace the contour \(f=c\). The height never changes along it, so \(f(r(t))=c\) is constant and its derivative is zero. By the chain rule that derivative is \(\nabla f\cdot r'(t)\). Hence \(\nabla f\cdot r'(t)=0\): the gradient is perpendicular to the tangent \(r'\) of the contour (where \(\nabla f\ne 0\)). In words: walking along a contour is the zero-rate direction, and the gradient is the direction at right angles to it that rises fastest. Also, two contours that differ in height by \(\Delta c\) lie about \(\Delta c/|\nabla f|\) apart, which is why crowded contours mean a large gradient.</p>
      <h3>Worked example</h3>
      <p>Take \(f=\tfrac14x^2+\tfrac12y^2\) at \(P=(2,1)\), where \(f=\tfrac32\) and \(\nabla f=(1,1)\). For \(u=(\tfrac35,\tfrac45)\) (length \(\sqrt{\tfrac9{25}+\tfrac{16}{25}}=1\)):
      \[ D_uf=1\cdot\tfrac35+1\cdot\tfrac45=\tfrac75=1.4. \]
      This is a little below \(|\nabla f|\approx1.41\), as it must be, because \(u\) is not exactly along \(\nabla f\). The contour through \(P\) has tangent direction \((-1,1)/\sqrt2\), and \(D_uf=\tfrac{(1)(-1)+(1)(1)}{\sqrt2}=0\) there, as the perpendicularity says.</p>
      <h3>Gradient ascent</h3>
      <p>Near a point, \(f(\mathbf p+\Delta)\approx f(\mathbf p)+\nabla f\cdot\Delta\). For steps of a fixed length this is largest when \(\Delta\) points along \(\nabla f\). Gradient ascent repeats
      \[ \mathbf p_{k+1}=\mathbf p_k+\eta\,\nabla f(\mathbf p_k), \]
      with a step size \(\eta&gt;0\); gradient <em>descent</em> uses a minus sign. From \((2,1)\) on the bowl with \(\eta=1\), descent gives \((2,1)-(1,1)=(1,0)\), and the height drops from \(1.5\) to \(0.25\).</p>
      <h3>Caveats</h3>
      <p>The gradient points along the steepest <em>local</em> rise. It is not aimed at the summit: on the elliptical hill the arrow misses the top, because the contours are ellipses. A step that is too large can overshoot and make the height fall (try a big \(\eta\) on the hill). Where \(\nabla f=0\) the method stalls, but that point may be a top, a bottom, or a saddle (rising in one cut and falling in the other), so zero gradient alone does not say which. The arrows on the map are drawn at a fixed scale per landscape, so only their relative lengths are comparable. Finally, having both partial derivatives at a point is not enough for \(D_uf=\nabla f\cdot u\) to hold: the function must be differentiable there.</p>`,
    check: [
      { q: String.raw`On a contour map you stand at a point where \(\nabla f\ne 0\) and want to climb as steeply as possible. Which description of the gradient vector \(\nabla f\) at that point is correct?`,
        choices: ['It is tangent to the contour line through the point, because the height does not change along it',
                  'It is perpendicular to the contour line through the point and points toward higher values of f',
                  'It is perpendicular to the contour line through the point and points toward lower values of f',
                  'It points straight at the nearest summit, whatever shape the contour lines have'], answer: 1,
        why: String.raw`Along a contour the height is constant, so the rate of change there is zero and \(\nabla f\cdot r'=0\): the gradient is perpendicular to the contour. It points the way \(f\) increases fastest, so toward higher values. It is a local direction, so it need not point at the summit.`,
        hint: String.raw`Which direction along the contour gives rate 0? The gradient is at right angles to it, and it is the direction of steepest increase, not decrease.` },
      { q: String.raw`Let \(f(x,y)=x^2+3xy\). At the point \((1,2)\), find the rate of change of \(f\) in the direction of the unit vector \(u=(\tfrac35,-\tfrac45)\), which has length 1.`,
        choices: ['12', '7.2', String.raw`\(\sqrt{73}\approx 8.54\)`, '2.4'], answer: 3,
        why: String.raw`\(f_x=2x+3y=2+6=8\) and \(f_y=3x=3\), so \(\nabla f=(8,3)\). Then \(D_uf=8\cdot\tfrac35+3\cdot(-\tfrac45)=\tfrac{24}{5}-\tfrac{12}{5}=\tfrac{12}{5}=2.4\). The value 12 forgets that \((3,-4)\) must be divided by its length 5, 7.2 loses the minus sign, and \(\sqrt{73}=|\nabla f|\) is the largest possible rate, not the rate in this direction.`,
        hint: String.raw`First the two partial derivatives (treat the other variable as a constant), then the dot product with \(u\).` },
      { q: String.raw`A student must find the rate of change of \(f(x,y)=x^2-y^2\) at \((1,1)\) in the direction of the vector \(v=(3,4)\). Work: Step 1, \(f_x=2x=2\) and \(f_y=-2y=-2\), so \(\nabla f=(2,-2)\). Step 2, rate \(=\nabla f\cdot v=2\cdot 3+(-2)\cdot 4=6-8=-2\). Step 3, so \(f\) falls by 2 per unit of distance. Which statement is correct?`,
        choices: [String.raw`Step 1 is wrong: the derivative of \(-y^2\) with respect to \(y\) is \(+2y\)`,
                  'Step 3 is wrong: a rate of change can never be negative',
                  String.raw`Step 2 is wrong: \(v\) has length 5, so it must be divided by 5 first. The correct rate is \(-2/5=-0.4\)`,
                  'Nothing is wrong: the dot product of the gradient with any direction vector is the rate'], answer: 2,
        why: String.raw`The formula \(D_uf=\nabla f\cdot u\) needs a <em>unit</em> vector. Here \(|v|=\sqrt{9+16}=5\), so \(u=(\tfrac35,\tfrac45)\) and \(D_uf=2\cdot\tfrac35-2\cdot\tfrac45=-0.4\). Step 1 is right, and a negative rate just means \(f\) falls in that direction.`,
        hint: String.raw`Compute the length of \((3,4)\). What does the dot product measure if the vector is longer than 1?` }
    ],
    links: { related: ['derivatives-as-tangent-slopes', 'slope-and-linear-functions', 'quadratics-and-the-parabola', 'distance-and-the-pythagorean-theorem'] },

    mount({ stage, controls: C }) {
      const st = { x: 1, y: 1, th: 0 };
      const fl = { fn: 'hill', view: 'x', showG: false, showU: false };
      let cancel = () => {}, trail = [], marks = [], climbMsg = '', practice = false, snapshot = null;
      const cur = () => prep(FN[fl.fn]);
      const fv = () => cur().f(st.x, st.y);

      stage.classList.add('split');
      const top = h('div', { class: 'pane', style: 'flex: 11 1 0' }), bot = h('div', { class: 'pane', style: 'flex: 8 1 0' });
      stage.append(top, bot);
      const P1 = new Plane(top, { span: 3.55 }), P2 = new Plane(bot, { span: 5 });
      const panel = stage.nextElementSibling;

      const txt = (c, p, s, x, y, o = {}) => {
        c.font = `${o.weight || 500} ${o.size || 13}px ${FS}`; c.textAlign = o.align || 'left'; c.textBaseline = 'middle';
        c.lineJoin = 'round'; if (o.halo !== false) { c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.strokeText(s, x, y); } c.fillStyle = o.color || p.pal.text; c.fillText(s, x, y);
      };
      const tonePx = (p, k) => clamp(p.w / 28 * k, 12, 15);
      const dirOf = () => fl.view === 'y' ? [0, 1] : fl.view === 'u' ? [Math.cos(st.th * DEG), Math.sin(st.th * DEG)] : [1, 0];
      const viewCol = p => fl.view === 'y' ? p.pal.red : fl.view === 'u' ? p.pal.blue : p.pal.green;

      /* ---------------- top pane: the contour map ---------------- */
      let img = null;
      const shade = p => {
        const F = cur(), key = fl.fn + p.pal.yellow;
        if (img && img.key === key) return img.cv;
        const cv = document.createElement('canvas'); cv.width = N; cv.height = N;
        const cx = cv.getContext('2d'), id = cx.createImageData(N, N), m = p.pal.yellow.replace('#', ''), R = parseInt(m.slice(0, 2), 16), G = parseInt(m.slice(2, 4), 16), B = parseInt(m.slice(4, 6), 16);
        for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
          const x = -D0 + (i + .5) * 2 * D0 / N, y = D0 - (j + .5) * 2 * D0 / N, t = (F.f(x, y) - F.lo) / (F.hi - F.lo), o = 4 * (j * N + i);
          id.data[o] = R; id.data[o + 1] = G; id.data[o + 2] = B; id.data[o + 3] = Math.round(255 * (.03 + .5 * t));
        }
        cx.putImageData(id, 0, 0); img = { key, cv }; return cv;
      };
      const strokeSegs = (c, p, s) => {
        c.beginPath(); for (let k = 0; k < s.length; k += 4) { c.moveTo(p.X(s[k]), p.Y(s[k + 1])); c.lineTo(p.X(s[k + 2]), p.Y(s[k + 3])); } c.stroke();
      };
      const ray = (x, y, dx, dy) => {   /* the part of the line through (x, y) inside the map */
        let lo = -1e9, hi = 1e9;
        for (const [v, d] of [[x, dx], [y, dy]]) if (Math.abs(d) > 1e-9) { const a = (-D0 - v) / d, b = (D0 - v) / d; lo = Math.max(lo, Math.min(a, b)); hi = Math.min(hi, Math.max(a, b)); }
        return [lo, hi];
      };

      P1.onDraw = (c, p) => {
        const pal = p.pal, F = cur(); p.cx = 0; p.cy = 0; p.span = 3.55;
        const fs = tonePx(p, 1), sc = p.scale, x0 = p.X(-D0), y0 = p.Y(D0), W = 2 * D0 * sc;
        c.save(); c.beginPath(); c.rect(x0, y0, W, W); c.clip();
        c.imageSmoothingEnabled = true; c.drawImage(shade(p), x0, y0, W, W);
        c.lineWidth = 1; c.strokeStyle = pal.grid; c.beginPath();
        for (let v = -D0; v <= D0; v++) { c.moveTo(p.X(v), y0); c.lineTo(p.X(v), y0 + W); c.moveTo(x0, p.Y(v)); c.lineTo(x0 + W, p.Y(v)); }
        c.stroke();
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.6; c.beginPath();
        c.moveTo(p.X(0), y0); c.lineTo(p.X(0), y0 + W); c.moveTo(x0, p.Y(0)); c.lineTo(x0 + W, p.Y(0)); c.stroke();
        c.lineWidth = 1.3; c.strokeStyle = pal.muted; c.lineJoin = 'round'; F.segs.forEach(s => strokeSegs(c, p, s));
        /* the contour through P */
        c.lineWidth = 3.4; c.strokeStyle = pal.violet; strokeSegs(c, p, segsAt(F, fv()));
        /* the cut line */
        if (fl.view !== 'rate' && !marks.length) {
          const [dx, dy] = dirOf(), [lo, hi] = ray(st.x, st.y, dx, dy), col = viewCol(p);
          c.setLineDash([7, 5]); c.lineWidth = 2.6; c.strokeStyle = col; c.beginPath();
          c.moveTo(p.X(st.x + lo * dx), p.Y(st.y + lo * dy)); c.lineTo(p.X(st.x + hi * dx), p.Y(st.y + hi * dy)); c.stroke(); c.setLineDash([]);
        }
        c.restore();
        /* climb trail */
        if (trail.length > 1) {
          c.strokeStyle = pal.text; c.lineWidth = 2; c.beginPath(); trail.forEach((q, i) => i ? c.lineTo(p.X(q[0]), p.Y(q[1])) : c.moveTo(p.X(q[0]), p.Y(q[1]))); c.stroke();
          trail.forEach(q => { c.beginPath(); c.arc(p.X(q[0]), p.Y(q[1]), 4, 0, 7); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.text; c.lineWidth = 2; c.stroke(); });
        }
        /* gradient: two parts, then the arrow */
        const [gx, gy] = F.g(st.x, st.y), gl = Math.hypot(gx, gy);
        if (fl.showG && gl > .02) {
          const tx = st.x + F.gs * gx, ty = st.y + F.gs * gy;
          c.setLineDash([4, 4]); c.lineWidth = 2.4;
          c.strokeStyle = pal.green; c.beginPath(); c.moveTo(p.X(st.x), p.Y(st.y)); c.lineTo(p.X(tx), p.Y(st.y)); c.stroke();
          c.strokeStyle = pal.red; c.beginPath(); c.moveTo(p.X(tx), p.Y(st.y)); c.lineTo(p.X(tx), p.Y(ty)); c.stroke(); c.setLineDash([]);
          if (Math.abs(tx - st.x) * sc > 30) txt(c, p, 'fx', (p.X(st.x) + p.X(tx)) / 2, p.Y(st.y) + (gy > 0 ? 14 : -14), { size: fs, color: pal.green, align: 'center' });
          if (Math.abs(ty - st.y) * sc > 30) txt(c, p, 'fy', p.X(tx) + (gx > 0 ? 12 : -12), (p.Y(st.y) + p.Y(ty)) / 2, { size: fs, color: pal.red, align: gx > 0 ? 'left' : 'right' });
          p.arrow(st.x, st.y, tx, ty, pal.text, 6);
          const ux = gx / gl, uy = gy / gl, a = 10 / sc;
          c.strokeStyle = pal.text; c.lineWidth = 1.8; c.beginPath();
          c.moveTo(p.X(st.x + a * ux), p.Y(st.y + a * uy)); c.lineTo(p.X(st.x + a * (ux - uy)), p.Y(st.y + a * (uy + ux))); c.lineTo(p.X(st.x - a * uy), p.Y(st.y + a * ux)); c.stroke();
          txt(c, p, '∇f', p.X(tx) + ux * 18, p.Y(ty) - uy * 18, { size: fs + 2, weight: 700, align: 'center' });
        }
        /* the unit direction u */
        if (fl.showU) {
          const ux = Math.cos(st.th * DEG), uy = Math.sin(st.th * DEG);
          p.arrow(st.x, st.y, st.x + ux, st.y + uy, pal.blue, 3);
          p.dot(st.x + ux, st.y + uy, 7, pal.stage, pal.brass, 3);
          txt(c, p, 'u', p.X(st.x + ux / 2) - uy * 15, p.Y(st.y + uy / 2) - ux * 15, { size: fs + 2, weight: 700, color: pal.blue, align: 'center' });
        }
        marks.forEach(m => { p.dot(m.x, m.y, 7, pal.stage, pal.text, 2.5); txt(c, p, m.t, p.X(m.x) + 14, p.Y(m.y) - 14, { size: fs + 3, weight: 700, align: 'center' }); });
        if (!marks.length) p.dot(st.x, st.y, 8, pal.yellow, pal.brass, 3);
        if (!marks.length) txt(c, p, 'P', p.X(st.x) - 14, p.Y(st.y) - 13, { size: fs + 2, weight: 700, align: 'center' });
        txt(c, p, 'x', p.X(D0) - 10, p.Y(0) - 12, { size: fs, color: pal.muted, align: 'center' });
        txt(c, p, 'y', p.X(0) + 12, p.Y(D0) + 12, { size: fs, color: pal.muted, align: 'center' });
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.strokeRect(x0, y0, W, W);
        for (const v of [-D0, 0, D0]) {
          txt(c, p, (v < 0 ? '−' : '') + Math.abs(v), p.X(v), y0 + W + 11, { size: fs - 1, color: pal.muted, align: 'center' });
          txt(c, p, (v < 0 ? '−' : '') + Math.abs(v), x0 - 6, p.Y(v), { size: fs - 1, color: pal.muted, align: 'right' });
        }
        if (marks.length) { c.textBaseline = 'alphabetic'; return; }
        /* info box */
        const narrow = p.w < 520, lines = narrow ? [`P = (${n2(st.x)}, ${n2(st.y)})`, `f = ${n2(fv())}`] : [`P = (${n2(st.x)}, ${n2(st.y)})`, `height f = ${n2(fv())}`, 'darker shading = higher'];
        c.font = `500 ${fs}px ${FS}`; const bw = Math.max(...lines.map(t => c.measureText(t).width)) + 14, bh = fs * 1.2 * lines.length + 8;
        c.fillStyle = alpha(pal.stage, .88); c.fillRect(5, 5, bw, bh); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1; c.strokeRect(5, 5, bw, bh);
        lines.forEach((t, i) => txt(c, p, t, 12, 5 + fs * .95 + i * fs * 1.2 + 1, { size: fs, color: i === 2 ? pal.muted : i === 1 ? pal.violet : pal.text, halo: false }));
        c.textBaseline = 'alphabetic';
      };

      /* ---------------- bottom pane: side views ---------------- */
      P2.onDraw = (c, p) => {
        const pal = p.pal, F = cur(); p.span = Math.min(p.w, p.h) / 2; p.cx = p.w / 2; p.cy = p.h / 2;
        const fs = tonePx(p, 1), L = 46, R = 14, T = 28, B = 34, w = Math.max(10, p.w - L - R), hh = Math.max(10, p.h - T - B);
        const line = (pts, col, wd, dash) => { c.beginPath(); let pen = false; for (const q of pts) { if (!q) { pen = false; continue; } pen ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); pen = true; } c.strokeStyle = col; c.lineWidth = wd; c.lineJoin = 'round'; c.lineCap = 'round'; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]); };
        const [gx, gy] = F.g(st.x, st.y), gl = Math.hypot(gx, gy);
        if (marks.length) { txt(c, p, 'Read the contours on the map above.', p.w / 2, p.h / 2, { size: fs + 1, color: pal.muted, align: 'center' }); c.textBaseline = 'alphabetic'; return; }
        if (fl.view === 'rate') {
          const m = Math.max(F.gmax * 1.1, .5), sx = t => L + t / 360 * w, sy = d => T + hh / 2 - d / m * hh / 2;
          for (let t = 0; t <= 360; t += 90) { line([[sx(t), T], [sx(t), T + hh]], pal.grid, 1.2); txt(c, p, t + '°', sx(t), T + hh + 13, { size: fs - 1, color: pal.muted, align: 'center' }); }
          line([[L, sy(0)], [L + w, sy(0)]], pal['grid-strong'], 2);
          txt(c, p, '0', L - 8, sy(0), { size: fs - 1, color: pal.muted, align: 'right' });
          if (gl > .02) for (const s of [1, -1]) { line([[L, sy(s * gl)], [L + w, sy(s * gl)]], pal.muted, 1.4, [5, 5]); }
          const pts = []; for (let t = 0; t <= 360; t += 3) pts.push([sx(t), sy(rate(F, st.x, st.y, t))]);
          line(pts, pal.blue, 3.2);
          txt(c, p, 'Rate Dᵤf vs angle θ', L, 13, { size: fs, weight: 600 });
          txt(c, p, 'θ, the angle of u', L + w / 2, p.h - 8, { size: fs - 1, color: pal.muted, align: 'center' });
          if (gl > .02) {
            const phi = gradAngle(F, st.x, st.y);
            txt(c, p, '|∇f| = ' + n2(gl), phi < 180 ? L + w - 4 : L + 4, sy(gl) - 9, { size: fs - 1, color: pal.muted, align: phi < 180 ? 'right' : 'left' });
            const key = (a, d, lab, col) => { const t = wrap360(a); c.beginPath(); c.arc(sx(t), sy(d), 5, 0, 7); c.fillStyle = col; c.fill(); txt(c, p, lab, sx(t), sy(d) + (d >= 0 ? -13 : 14), { size: fs - 1, color: col, align: 'center' }); };
            key(phi, gl, 'max', pal.text); key(phi + 180, -gl, 'min', pal.text); key(phi + 90, 0, '0', pal.violet); key(phi - 90, 0, '0', pal.violet);
          } else txt(c, p, '∇f = 0 here: every direction has rate 0', L + w / 2, sy(0) - 14, { size: fs, align: 'center' });
          if (fl.showU) {
            const th = wrap360(st.th), D = rate(F, st.x, st.y, th);
            line([[sx(th), T], [sx(th), T + hh]], pal.blue, 1.6, [4, 4]);
            c.beginPath(); c.arc(sx(th), sy(D), 7, 0, 7); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.blue; c.lineWidth = 3; c.stroke();
            txt(c, p, 'θ = ' + Math.round(th) + '°, Dᵤf = ' + n2(D), L + w - 4, 13, { size: fs, color: pal.blue, align: 'right' });
          }
          c.textBaseline = 'alphabetic'; return;
        }
        const [dx, dy] = dirOf(), col = viewCol(p), z0 = F.zr[0], z1 = F.zr[1];
        const sx = t => L + (t + 3) / 6 * w, sy = z => T + hh - (z - z0) / (z1 - z0) * hh;
        for (let t = -3; t <= 3; t++) { line([[sx(t), T], [sx(t), T + hh]], pal.grid, 1.2); txt(c, p, (t < 0 ? '−' : '') + Math.abs(t), sx(t), T + hh + 13, { size: fs - 1, color: pal.muted, align: 'center' }); }
        for (let z = Math.ceil(z0 / F.zs) * F.zs; z <= z1; z += F.zs) { line([[L, sy(z)], [L + w, sy(z)]], z === 0 ? pal['grid-strong'] : pal.grid, z === 0 ? 2 : 1.2); txt(c, p, (z < 0 ? '−' : '') + Math.abs(z), L - 6, sy(z), { size: fs - 1, color: pal.muted, align: 'right' }); }
        line([[sx(0), T], [sx(0), T + hh]], pal['grid-strong'], 1.4);
        c.save(); c.beginPath(); c.rect(L, T, w, hh); c.clip();
        const pts = []; for (let k = 0; k <= 160; k++) { const t = -3 + 6 * k / 160, X = st.x + t * dx, Y = st.y + t * dy; pts.push(Math.abs(X) > D0 + 1e-9 || Math.abs(Y) > D0 + 1e-9 ? null : [sx(t), sy(F.f(X, Y))]); }
        line(pts, col, 3.4);
        const f0 = F.f(st.x, st.y), s = gx * dx + gy * dy;
        line([[sx(-1.4), sy(f0 - 1.4 * s)], [sx(1.4), sy(f0 + 1.4 * s)]], pal.text, 2, [6, 4]);
        line([[sx(0), sy(f0)], [sx(1), sy(f0)]], pal.muted, 2.4); line([[sx(1), sy(f0)], [sx(1), sy(f0 + s)]], pal.violet, 2.4);
        c.restore();
        const ly = clamp((sy(f0) + sy(f0 + s)) / 2, T + 10, T + hh - 10);
        txt(c, p, 'run 1', (sx(0) + sx(1)) / 2, clamp(sy(f0) + (s > 0 ? 13 : -13), T + 8, T + hh - 8), { size: fs - 1, color: pal.muted, align: 'center' });
        txt(c, p, 'rise ' + n2(s), clamp(sx(1) + 6, L, L + w - 56), ly, { size: fs - 1, color: pal.violet });
        c.beginPath(); c.arc(sx(0), sy(f0), 7, 0, 7); c.fillStyle = pal.yellow; c.fill(); c.strokeStyle = pal.brass; c.lineWidth = 3; c.stroke();
        txt(c, p, 'P', sx(0) - 12, clamp(sy(f0) - 14, T + 8, T + hh - 8), { size: fs, weight: 700, align: 'center' });
        const nm = fl.view === 'x' ? `x-cut (y stays ${n2(st.y)})` : fl.view === 'y' ? `y-cut (x stays ${n2(st.x)})` : `u-cut (θ = ${Math.round(wrap360(st.th))}°)`;
        const sn = fl.view === 'x' ? 'slope fx = ' : fl.view === 'y' ? 'slope fy = ' : 'slope Dᵤf = ';
        txt(c, p, nm, L, 13, { size: fs, weight: 600, color: col });
        txt(c, p, sn + n2(s), L + w, 13, { size: fs, weight: 600, color: pal.text, align: 'right' });
        txt(c, p, 't: steps from P along the cut', L + w / 2, p.h - 8, { size: fs - 1, color: pal.muted, align: 'center' });
        txt(c, p, 'f', L - 24, T + 4, { size: fs, color: pal.muted, align: 'center' });
        c.textBaseline = 'alphabetic';
      };

      /* ---------------- controls ---------------- */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      let pfbP, xS, yS, thS, etaS, selFn, gT, uT, viewBtns, ro, pfb, cmpBtns = [], startBtn, ptally, pq, pch, pnext;

      const clearFeedback = () => { climbMsg = ''; pfb.innerHTML = ''; cmpBtns.forEach(b => b.classList.remove('primary')); };
      const moved = () => { cancel(); trail = []; clearFeedback(); };
      const setFn = k => { cancel(); fl.fn = k; trail = []; clearFeedback(); sync(); };

      const readout = () => {
        const F = cur(), [gx, gy] = F.g(st.x, st.y), gl = Math.hypot(gx, gy), L = [];
        L.push(`${kk('Point')} P = (${n2(st.x)}, ${n2(st.y)}), height f = ${n2(fv())}`);
        L.push(`${kk('Slope east (x-cut)')} f<sub>x</sub> = ${n2(gx)}`);
        L.push(`${kk('Slope north (y-cut)')} f<sub>y</sub> = ${n2(gy)}`);
        if (fl.showG) {
          L.push(`${kk('Gradient')} ∇f = (${n2(gx)}, ${n2(gy)}), length |∇f| = ${n2(gl)}`);
          L.push(gl > .02 ? `${kk('Uphill direction')} about ${Math.round(gradAngle(F, st.x, st.y))}° (0° = east, 90° = north)` : `${kk('Uphill direction')} none: ∇f is 0 here`);
        }
        if (fl.showU) {
          const ux = Math.cos(st.th * DEG), uy = Math.sin(st.th * DEG);
          L.push(`${kk('Direction')} u = (${n2(ux)}, ${n2(uy)}), θ = ${Math.round(wrap360(st.th))}°`);
          L.push(`${kk('Rate that way')} D<sub>u</sub>f = f<sub>x</sub>u<sub>1</sub> + f<sub>y</sub>u<sub>2</sub> = (${n2(gx)})(${n2(ux)}) + (${n2(gy)})(${n2(uy)}) = <b>${n2(gx * ux + gy * uy)}</b>`);
        }
        L.push(`${kk('Arrow scale')} ${F.gs} map units per unit of slope`);
        if (climbMsg) L.push('<br>' + climbMsg);
        return L.join('<br>');
      };

      C.title('Landscape');
      selFn = C.select({ label: 'Example', options: FKEYS.map(k => ({ value: k, label: FN[k].label })), value: 'hill', onChange: v => setFn(v) });
      ro = C.readout();
      C.hint('Drag P, or the tip of u, on the map. Every drag also has a slider or button. Darker shading means higher ground.');
      C.title('Point P');
      xS = C.slider({ label: 'x of P', min: -3, max: 3, step: .01, value: st.x, format: v => n2(v), onInput: v => { moved(); st.x = v; sync(); } });
      yS = C.slider({ label: 'y of P', min: -3, max: 3, step: .01, value: st.y, format: v => n2(v), onInput: v => { moved(); st.y = v; sync(); } });
      const nudge = (dx, dy) => () => { moved(); st.x = clamp(r2(st.x + dx), -D0, D0); st.y = clamp(r2(st.y + dy), -D0, D0); sync(); };
      C.buttons([{ label: '← 0.25', onClick: nudge(-.25, 0) }, { label: '0.25 →', onClick: nudge(.25, 0) }, { label: '↓ 0.25', onClick: nudge(0, -.25) }, { label: '↑ 0.25', onClick: nudge(0, .25) }]);
      C.title('Side view: a cut through the hill');
      viewBtns = C.buttons([['x-cut', 'x'], ['y-cut', 'y'], ['u-cut', 'u'], ['Rate vs angle', 'rate']].map(([lab, v]) => ({ label: lab, onClick: () => { fl.view = v; if (v === 'u' || v === 'rate') fl.showU = true; sync(); } })));
      C.title('Gradient arrow');
      gT = C.toggle({ label: 'Show the gradient ∇f', value: false, onChange: v => { fl.showG = v; sync(); } });
      C.title('Direction u (length 1)');
      uT = C.toggle({ label: 'Show direction u', value: false, onChange: v => { fl.showU = v; if (!v && fl.view === 'u') fl.view = 'x'; sync(); } });
      thS = C.slider({ label: 'Direction angle θ (degrees)', min: 0, max: 360, step: 1, value: 0, format: v => Math.round(v) + '°', onInput: v => { cancel(); fl.showU = true; st.th = v; sync(); } });
      const turn = off => () => {
        const F = cur(); cancel(); fl.showU = true;
        if (gmag(F, st.x, st.y) < .02) { climbMsg = 'The gradient is 0 here, so there is no special direction. Move P first.'; sync(); return; }
        st.th = wrap360(gradAngle(F, st.x, st.y) + off); sync();
      };
      C.buttons([{ label: 'Turn u along ∇f', onClick: turn(0) }, { label: 'Turn u along the contour', onClick: turn(90) }]);
      C.title('Predict, then see');
      C.hint('Which way is steepest uphill from P? Commit to one, then the arrow appears.');
      const predict = i => {
        const F = cur(), gl = gmag(F, st.x, st.y);
        cmpBtns.forEach((b, k) => b.classList.toggle('primary', k === i));
        if (gl < .02) { pfb.innerHTML = `The gradient is 0 at P, so no direction is uphill. Move P and try again.`; return; }
        fl.showG = true;
        const best = nearestCompass(F, st.x, st.y), phi = Math.round(gradAngle(F, st.x, st.y)), d = rate(F, st.x, st.y, COMPASS[i][1]), db = rate(F, st.x, st.y, COMPASS[best][1]);
        const dTxt = Math.abs(d) < .005 ? 'f does not change that way (it is along the contour)' : d < 0 ? `f goes <em>down</em> that way, at rate ${n2(d)}` : `f rises that way at rate ${n2(d)}`;
        pfb.innerHTML = i === best
          ? `${good('Right.')} The arrow ∇f points at about ${phi}°, and ${COMPASS[i][2]} is the closest of the eight. ${dTxt}. The gradient is perpendicular to the violet contour and points uphill.`
          : `${bad('Not quite.')} You chose ${COMPASS[i][2]}: ${dTxt}. The arrow ∇f points at about ${phi}°, nearest to ${COMPASS[best][2]}, where the rate is ${n2(db)}. Uphill is across the contour, at a right angle to it.`;
        sync();
      };
      cmpBtns = [...C.buttons(COMPASS.slice(0, 4).map((c, i) => ({ label: c[0], onClick: () => predict(i) }))), ...C.buttons(COMPASS.slice(4).map((c, i) => ({ label: c[0], onClick: () => predict(i + 4) })))];
      pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); panel.append(pfb);
      C.title('Climb the hill');
      etaS = C.slider({ label: 'Step size η', min: .25, max: 4, step: .25, value: .5, format: v => n2(v), onInput: () => {} });
      const climb = dir => () => {
        const F = cur(), [gx, gy] = F.g(st.x, st.y), m = Math.hypot(gx, gy), eta = etaS.get(); cancel(); fl.showG = true;
        if (m < .03) {
          climbMsg = fl.fn === 'hill' ? 'The slope is almost 0: you are at the top. ∇f ≈ 0, so the steps have shrunk to nothing.'
            : fl.fn === 'saddle' ? 'Here ∇f = 0, but this is a saddle, not a top: it rises along one cut and falls along the other. Gradient ascent stalls although higher ground exists. Move P and try again.'
            : 'Here ∇f ≈ 0: this is the bottom of the bowl, the lowest point. Uphill steps now would move away from it.';
          sync(); return;
        }
        if (!trail.length) trail = [[st.x, st.y]];
        const f0 = fv(), nx = clamp(r2(st.x + dir * eta * gx), -D0, D0), ny = clamp(r2(st.y + dir * eta * gy), -D0, D0);
        const stuck = nx === st.x && ny === st.y, sgn = dir > 0 ? '+' : '−';
        const px = st.x, py = st.y; st.x = nx; st.y = ny; trail.push([nx, ny]); const f1 = fv();
        let msg = `${good('Step ' + (trail.length - 1) + ':')} new point = old point ${sgn} η∇f = (${n2(px)}, ${n2(py)}) ${sgn} ${n2(eta)}·(${n2(gx)}, ${n2(gy)}) = (${n2(nx)}, ${n2(ny)}). Height ${n2(f0)} → ${n2(f1)}.`;
        if (stuck) msg += ' You are at the edge of the map.';
        else if ((dir > 0 && f1 < f0 - 1e-9) || (dir < 0 && f1 > f0 + 1e-9)) msg += ` ${bad('Overshoot:')} the height went the wrong way, so the step was too big and jumped over the ridge. Try a smaller η.`;
        else if (nx !== r2(px + dir * eta * gx) || ny !== r2(py + dir * eta * gy)) msg += ' The step was cut off at the edge of the map.';
        climbMsg = msg; sync();
      };
      C.buttons([{ label: 'Step uphill', primary: true, onClick: climb(1) }, { label: 'Step downhill', onClick: climb(-1) }, { label: 'Clear trail', onClick: () => { trail = []; climbMsg = ''; sync(); } }]);
      const mainEls = Array.from(panel.children);

      /* ---------------- practice ---------------- */
      let prIdx = 0, prFirst = 0, prDone = 0, prSolved = false, prTried = false, prOver = false;
      C.title('Practice');
      C.hint('Seven short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => {
        cancel();
        if (practice) { practice = false; if (snapshot) { Object.assign(st, snapshot.st); Object.assign(fl, snapshot.fl); trail = snapshot.trail; marks = []; } climbMsg = ''; clearFeedback(); sync(); }
        else { snapshot = { st: { ...st }, fl: { ...fl }, trail: trail.slice() }; practice = true; if (!prOver) loadProb(); sync(); }
      } }])[0];
      grp('practice', () => {
        ptally = h('p', { class: 'ctl-title' });
        pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        pch = h('div', { class: 'ctl buttons' });
        panel.append(ptally, pq, pch);
        pfbP = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pnext = mkBtn('Next problem', () => nextProb(), true);
        panel.append(pfbP, h('div', { class: 'ctl buttons' }, pnext));
      });
      const tally = () => { ptally.textContent = prOver ? `Right on the first try: ${prFirst} of ${PROBS.length}` : `Problem ${prIdx + 1} of ${PROBS.length}. Right on the first try: ${prFirst} of ${prDone} done`; };
      const loadProb = () => {
        const pr = PROBS[prIdx]; prSolved = false; prTried = false; cancel();
        fl.fn = pr.fn; fl.view = pr.view; fl.showG = false; fl.showU = !!pr.showU; st.x = pr.x; st.y = pr.y; st.th = pr.th || 0; trail = []; marks = pr.marks || [];
        pq.textContent = pr.q; pfbP.innerHTML = ''; pch.replaceChildren(); pnext.disabled = true; pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        if (pr.kind === 'compass') COMPASS.forEach((c, i) => pch.append(mkBtn(c[0], () => pickCompass(i))));
        else pr.ch.forEach((o, i) => pch.append(mkBtn(o[0], () => pickChoice(i))));
        tally(); sync();
      };
      const solved = btn => {
        prSolved = true; if (!prTried) prFirst++; prDone++; Array.from(pch.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary'); pnext.disabled = false;
        const pr = PROBS[prIdx];
        if (pr.after === 'showG' || pr.kind === 'compass') fl.showG = true;
        if (pr.after === 'contour') { fl.showG = true; fl.showU = true; st.th = wrap360(gradAngle(cur(), st.x, st.y) + 90); }
        if (pr.after === 'descent') { trail = [[2, 1], [1, 0]]; st.x = 1; st.y = 0; fl.showG = true; }
        tally();
      };
      const pickCompass = i => {
        const pr = PROBS[prIdx]; if (prSolved) return; const F = cur(), best = nearestCompass(F, st.x, st.y), btn = pch.children[i];
        const d = rate(F, st.x, st.y, COMPASS[i][1]), phi = Math.round(gradAngle(F, st.x, st.y)), db = rate(F, st.x, st.y, COMPASS[best][1]);
        const dTxt = Math.abs(d) < .005 ? 'f does not change that way: it is along the contour' : d < 0 ? `f goes down that way, at rate ${n2(d)}` : `f rises that way at rate ${n2(d)}`;
        if (i === best) { solved(btn); pfbP.innerHTML = `${good('Right.')} ∇f = (${n2(F.g(st.x, st.y)[0])}, ${n2(F.g(st.x, st.y)[1])}) points at ${phi}°, and ${COMPASS[i][2]} is that direction. ${pr.why}`; }
        else { prTried = true; btn.disabled = true; pfbP.innerHTML = `${bad('Not quite.')} Going ${COMPASS[i][2]}, ${dTxt}. The steepest of the eight is ${COMPASS[best][2]}, with rate ${n2(db)}. Try another direction.`; }
        tally(); sync();
      };
      const pickChoice = i => {
        const pr = PROBS[prIdx]; if (prSolved) return; const btn = pch.children[i], txt2 = pr.ch[i][1]();
        if (i === pr.ans) { solved(btn); pfbP.innerHTML = good('Right.') + ' ' + txt2; }
        else { prTried = true; btn.disabled = true; pfbP.innerHTML = bad('Not quite.') + ' ' + txt2 + ' Try another answer.'; }
        tally(); sync();
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); return; }
        prOver = true; pq.textContent = `All ${PROBS.length} problems are done.`; pch.replaceChildren(); pnext.disabled = true; marks = []; trail = [];
        pfbP.innerHTML = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try them again, or go back to the lesson.`;
        pch.append(mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; prOver = false; loadProb(); }, true));
        tally(); sync();
      };
      const practiceEls = G.practice;

      /* ---------------- sync ---------------- */
      const sync = () => {
        xS.set(st.x); yS.set(st.y); thS.set(clamp(st.th, 0, 360));
        gT.checked = fl.showG; uT.checked = fl.showU; selFn.value = fl.fn;
        ['x', 'y', 'u', 'rate'].forEach((v, i) => viewBtns[i].classList.toggle('primary', fl.view === v));
        vis(mainEls, !practice); vis(practiceEls, practice);
        if (practice) vis(practiceEls, true);
        startBtn.textContent = practice ? 'Back to the lesson' : 'Start practice';
        if (!practice) ro.innerHTML = readout();
        P1.draw(); P2.draw();
      };

      draggable(P1, {
        hit: (px, py) => practice ? null : fl.showU && near(P1, st.x + Math.cos(st.th * DEG), st.y + Math.sin(st.th * DEG), px, py) ? 'u' : near(P1, st.x, st.y, px, py, 20) ? 'p' : null,
        move: (hd, x, y) => {
          if (hd === 'u') { cancel(); st.th = wrap360(snap(Math.atan2(y - st.y, x - st.x) / DEG, 1)); }
          else { moved(); st.x = clamp(snap(x, .25), -D0, D0); st.y = clamp(snap(y, .25), -D0, D0); }
          sync();
        }
      });

      const FLAGS = ['fn', 'view', 'showG', 'showU'];
      const apply = (patch, immediate) => {
        cancel(); practice = false; marks = []; climbMsg = ''; pfb.innerHTML = ''; cmpBtns.forEach(b => b.classList.remove('primary'));
        const nums = {};
        for (const k in patch) { if (FLAGS.includes(k)) fl[k] = patch[k]; else nums[k] = patch[k]; }
        if (patch.fn !== undefined) trail = [];
        if ('th' in nums) st.th = nums.th + 360 * Math.round((st.th - nums.th) / 360);
        if (immediate) { Object.assign(st, nums); sync(); } else { sync(); cancel = animateTo(st, nums, 800, sync, () => { st.th = wrap360(st.th); sync(); }); }
      };
      apply({ x: 1, y: 1, th: 0, view: 'x', showG: false, showU: false }, true);
      return { destroy: () => { cancel(); P1.destroy(); P2.destroy(); }, apply };
    }
  });
}
