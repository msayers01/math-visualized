/* =====================================================================
   SCHOOL — The normal distribution
   ===================================================================== */
{
  /* normal curve helpers: the area function uses the error function (Abramowitz and Stegun 7.1.26, error under 2e-7) */
  const erf = x => {
    const ax = Math.abs(x), t = 1 / (1 + .3275911 * ax);
    const poly = (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - .284496736) * t + .254829592) * t);
    return (x < 0 ? -1 : 1) * (1 - poly * Math.exp(-ax * ax));
  };
  const Phi = z => .5 * (1 + erf(z / Math.SQRT2));
  const pdf = (x, m, s) => Math.exp(-.5 * ((x - m) / s) * ((x - m) / s)) / (s * Math.sqrt(2 * Math.PI));
  const pct = v => (v * 100).toFixed(1) + '%';

  /* histograms: counts per bin, first bin centered at `start`, bins `bw` wide; mean and sd computed from the bins */
  const mk = o => {
    const mids = o.counts.map((_, i) => o.start + o.bw * i);
    o.n = o.counts.reduce((a, b) => a + b, 0);
    o.mean = o.counts.reduce((a, c, i) => a + c * mids[i], 0) / o.n;
    o.sd = Math.sqrt(o.counts.reduce((a, c, i) => a + c * (mids[i] - o.mean) * (mids[i] - o.mean), 0) / o.n);
    return o;
  };
  const SC = mk({ start: 40, bw: 5, counts: [0, 2, 6, 13, 25, 34, 40, 34, 25, 13, 6, 2, 0], x0: 30, x1: 110, tick: 10, ymax: 50, ystep: 10, name: '200 test scores' });
  const MU = 70, SD = 10, N = SC.n;

  const DS = [
    mk({ key: 'income', name: '200 household incomes ($1000s)', unit: 'households', start: 5, bw: 10, counts: [10, 30, 42, 36, 28, 20, 13, 9, 6, 3, 2, 1],
      x0: -40, x1: 140, tick: 20, ymax: 50, ystep: 10, fv: v => '$' + v.toFixed(1) + 'k', ans: 'skew', wall: { x: 0, side: 'below', what: 'below $0' },
      right(d) { return `Skewed. Most households earn a modest amount and a few earn a lot, so the bars have a long tail on the right. The tallest bar is on the left, but the curve peaks at the mean, ${d.fv(d.mean)}. The curve also reaches below $0 (${pct(Phi((0 - d.mean) / d.sd))} of its area), and no income is negative.`; },
      wrong: { good: 'Look at the bars. They are not balanced around the mean: the tallest bar is on the left and a long tail stretches to the right. The curve does not follow them.',
        bimodal: 'There is only one peak here, not two. What goes wrong is the long tail on one side.',
        wall: 'Incomes cannot go below $0, but the bars do not pile up against that wall. The main problem is the long one-sided tail.' } }),
    mk({ key: 'bottle', name: '312 bottles: volume in mL', unit: 'bottles', start: 495, bw: 1, counts: [2, 6, 19, 38, 57, 68, 57, 38, 19, 6, 2],
      x0: 492, x1: 508, tick: 2, ymax: 80, ystep: 20, fv: v => v.toFixed(1) + ' mL', ans: 'good',
      right() { return 'Good fit. The bars are symmetric, have one peak, fall off smoothly on both sides, and nothing cuts them off. A normal curve built from the mean and standard deviation follows them closely, so it is a good model here.'; },
      wrong: { skew: 'The bars are balanced: about as many bottles hold more than the mean as less. There is no long tail.',
        bimodal: 'Count the peaks. There is one, right at the mean.',
        wall: 'The bars die away smoothly on both sides. Nothing pushes them against a limit.' } }),
    mk({ key: 'heights', name: '184 heights (cm), children and adults', unit: 'people', start: 110, bw: 5, counts: [2, 8, 20, 30, 22, 8, 2, 0, 0, 2, 8, 20, 30, 22, 8, 2],
      x0: 100, x1: 200, tick: 20, ymax: 40, ystep: 10, fv: v => v.toFixed(1) + ' cm', ans: 'bimodal',
      right(d) { return `Two peaks. The group mixes two kinds of people: children near 125 cm and adults near 170 cm. The mean, ${d.fv(d.mean)}, falls in the gap where almost nobody stands, so the tallest part of the curve sits over empty space.`; },
      wrong: { good: 'The curve peaks at the mean, but the bars there are almost empty. It does not describe the group. Count the peaks in the bars.',
        skew: 'The two humps are about the same size, so the data is not lopsided. The problem is that it has two peaks.',
        wall: 'There is no hard limit that the bars pile up against. The problem is the two separate humps.' } }),
    mk({ key: 'quiz', name: '140 quiz scores out of 100', start: 52.5, bw: 5, counts: [1, 2, 3, 4, 6, 9, 13, 20, 32, 50],
      x0: 40, x1: 110, tick: 10, ymax: 60, ystep: 20, fv: v => v.toFixed(1) + ' points', ans: 'wall', wall: { x: 100, side: 'above', what: 'above 100' },
      right(d) { return `A pile-up at a wall. Scores cannot go past 100, so many students sit at the top and the bars are cut off there. The curve ignores the wall and spills past 100: ${pct(1 - Phi((100 - d.mean) / d.sd))} of its area is above 100, where no score exists.`; },
      wrong: { good: 'The bars keep climbing toward 100 and then stop. The bell-shaped curve peaks at the mean and misses the tallest bars. It also runs past 100.',
        skew: 'The bars are lopsided, yes, but look at why: they rise to the maximum of 100 and are cut off there. The hard wall is the real problem, so pick that one.',
        bimodal: 'There is one rising pile of bars, not two separate humps. What goes wrong is the wall at 100.' } })
  ];

  const QS = [
    { type: 'above', a: 90, start: { a: 75 }, text: 'About what percent of students scored above 90?',
      opts: ['About 5%', 'About 2.5%', 'About 16%'], ok: 1, cmp: 'The rule says 2.5%. The exact area from the curve is 2.3%.',
      why: ['5% is the share outside both tails together. Above 90 is only the right tail, which is half of that.',
        '90 is 2σ above the mean. 95% of scores are within 2σ, so 5% are outside, split evenly between two tails. The right tail holds 2.5%.',
        '16% is the share above 80, which is 1σ above the mean. 90 is farther out, so the share is smaller.'] },
    { type: 'above', a: 85, start: { a: 75 }, text: 'About what percent of students scored above 85?',
      opts: ['Between 2.5% and 16%', 'More than 16%', 'Less than 2.5%'], ok: 0, cmp: 'The rule only brackets this one. The exact area from the curve, 6.7%, is inside that range.',
      why: ['85 is 1.5σ above the mean. It sits between 80 (1σ, with 16% above it) and 90 (2σ, with 2.5% above it). So the answer is between 2.5% and 16%.',
        '16% score above 80. Since 85 is higher than 80, fewer than 16% score above it.',
        '2.5% score above 90. Since 85 is lower than 90, more than 2.5% score above it.'] },
    { type: 'below', a: 60, start: { a: 75 }, text: 'About what percent of students scored below 60?',
      opts: ['About 34%', 'About 68%', 'About 16%'], ok: 2, cmp: 'The rule says 16%. The exact area from the curve is 15.9%.',
      why: ['34% is the share between 60 and the mean, not the share below 60.',
        '68% is the share between 60 and 80. Below 60 is only the left tail.',
        '60 is 1σ below the mean. 68% lie within 1σ, so 32% are outside, 16% in each tail. About 16% scored below 60.'] },
    { type: 'between', a: 60, b: 90, start: { a: 55, b: 85 }, text: 'About what percent of students scored between 60 and 90?',
      opts: ['About 68%', 'About 82%', 'About 95%'], ok: 1, cmp: 'The rule gives 34% + 47.5% = 81.5%. The exact area from the curve is 81.9%.',
      why: ['68% is the share from 60 to 80 (1σ on each side). This region goes up to 90, so it holds more.',
        'From 60 up to the mean is half of 68%, which is 34%. From the mean up to 90 is half of 95%, which is 47.5%. Together that is about 82%.',
        '95% is the share from 50 to 90. This region starts at 60 and cuts off part of the left side, so it holds less.'] }
  ];

  register({
    id: 'the-normal-distribution', level: 'school',
    title: 'The normal distribution',
    blurb: 'Fit a bell curve to data with its mean and standard deviation, estimate percentages with it, and learn when it does not fit.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 50; p.cy = 22; p.span = 50;
      const cs = [2, 6, 13, 25, 34, 25, 13, 6, 2], g = x => 41 * Math.exp(-.5 * ((x - 50) / 14) * ((x - 50) / 14));
      cs.forEach((n, i) => { const x = 14 + i * 8; p.path([[x, 0], [x + 7, 0], [x + 7, n * 1.2], [x, n * 1.2]], { fill: alpha(pal.muted, .35), close: true }); });
      const band = [[36, 0]]; for (let x = 36; x <= 64; x += 2) band.push([x, g(x)]); band.push([64, 0]);
      p.path(band, { fill: alpha(pal.yellow, .3), close: true });
      const pts = []; for (let x = 6; x <= 94; x += 2) pts.push([x, g(x)]);
      p.path(pts, { stroke: pal.blue, width: 3 });
      p.path([[4, 0], [96, 0]], { stroke: pal['grid-strong'], width: 1.6 });
    },
    hook: String.raw`A teacher says the class mean on a test was 70, with a standard deviation of 10. From those two numbers alone, can you tell about what percent of students scored above 90?`,
    steps: [
      { title: 'Fit a curve to the data',
        text: String.raw`<p>The bars show \(200\) test scores. Each bar counts the students in a \(5\)-point range. The computed mean is \(70.0\) and the standard deviation is \(10.0\).</p><p>The blue curve is a <b>normal curve</b>. Drag its top handle to set the center \(\mu\) (the mean). Drag its side handle to set the width \(\sigma\) (the standard deviation). It starts at \(\mu=60\) and \(\sigma=15\), too far left and too wide.</p>`,
        set: { mode: 'fit', mu: 60, sd: 15 } },
      { title: 'The 68-95-99.7 rule',
        text: String.raw`<p>Now the curve has \(\mu=70\) and \(\sigma=10\). The area under it is the share of all scores. About \(68\%\) of scores lie within \(1\sigma\) of the mean (\(60\) to \(80\)), about \(95\%\) within \(2\sigma\) (\(50\) to \(90\)), and about \(99.7\%\) within \(3\sigma\) (\(40\) to \(100\)).</p><p>The yellow region covers \(60\) to \(80\). Drag its boundaries to \(50\) and \(90\), then \(40\) and \(100\), and compare the exact area with the rule.</p>`,
        set: { mode: 'area', rtype: 'between', bands: true, qi: -1, mu: 70, sd: 10, a: 60, b: 80 } },
      { title: 'Estimate a percentage',
        text: String.raw`<p>Use the rule to answer four questions about these scores. Each time, drag the boundary to the cutoff and read its <b>z-score</b>: how many standard deviations it is from the mean. Then choose an estimate.</p><p>The questions include one-sided regions (above, below) and a region between two cutoffs. The exact area from the curve appears after you answer, so you can compare.</p>`,
        set: { mode: 'area', bands: true, qi: 0, mu: 70, sd: 10 } },
      { title: 'When not to use it',
        text: String.raw`<p>Every data set has a mean and a standard deviation, so you can always draw a curve from them. That does not mean the curve fits.</p><p>Here the blue curve is built from the data's own mean and standard deviation. Decide for each of four data sets: is it a good fit, or a poor one? If poor, what goes wrong? A normal model needs one peak, symmetry, a smooth bell shape, and no hard wall.</p>`,
        set: { mode: 'judge', dsi: 0 } }
    ],
    formal: String.raw`
      <h3>The normal curve</h3>
      <p>A <b>normal distribution</b> is a symmetric bell-shaped curve described by two numbers: its center \(\mu\) (the mean) and its spread \(\sigma\) (the standard deviation). Its height at \(x\) is
      \[ f(x)=\frac{1}{\sigma\sqrt{2\pi}}\,e^{-(x-\mu)^2/(2\sigma^2)}. \]
      The total area under the curve is \(1\), so the area over an interval is the fraction of the population in that interval. The curve peaks at \(\mu\), and \(\sigma\) is the horizontal distance from the center to the side handle, where the curve stops bending down and starts bending up.</p>
      <h3>Fitting it to data</h3>
      <p>Compute the mean and standard deviation of the data, then use them as \(\mu\) and \(\sigma\). For a histogram with \(N\) values and bins of width \(w\), the matching curve has height \(N\,w\,f(x)\), so that a bar and the curve over it count the same students. The scores in the lesson, grouped in bins of width \(5\), have mean \(70.0\) and standard deviation \(10.0\), so the fitted curve has \(\mu=70\) and \(\sigma=10\). If your \(\mu\) is too far right, the peak sits to the right of the bars' balance point. If your \(\sigma\) is too large, the curve is lower, flatter and spills past the ends of the data.</p>
      <h3>z-scores</h3>
      <p>The <b>z-score</b> of a value \(x\) counts how many standard deviations it is from the mean:
      \[ z=\frac{x-\mu}{\sigma}. \]
      For \(x=85\) with \(\mu=70\) and \(\sigma=10\), \(z=\dfrac{85-70}{10}=1.5\). Positive means above the mean, negative means below.</p>
      <h3>The 68-95-99.7 rule</h3>
      <p>For a normal distribution,
      \[ \begin{aligned} &\text{about } 68\% \text{ of values lie within } 1\sigma \text{ of } \mu,\\ &\text{about } 95\% \text{ within } 2\sigma,\\ &\text{about } 99.7\% \text{ within } 3\sigma. \end{aligned} \]
      The rest is split evenly between the two tails. So the share above \(\mu+\sigma\) is \(\frac{100-68}{2}=16\%\), and the share above \(\mu+2\sigma\) is \(\frac{100-95}{2}=2.5\%\).</p>
      <h3>Exact areas</h3>
      <p>The area to the left of \(z\) is written \(\Phi(z)\) and can be computed from the error function, \(\Phi(z)=\tfrac12\bigl(1+\operatorname{erf}(z/\sqrt2)\bigr)\). The lesson uses a numerical approximation of this. A calculator, a spreadsheet (the function NORM.DIST) or a z-table gives the same values.</p>
      <p><b>Example.</b> Above \(85\): \(1-\Phi(1.5)=1-0.9332=0.0668\), about \(6.7\%\), or about \(13\) of the \(200\) students. The rule only said between \(2.5\%\) and \(16\%\). Between \(60\) and \(90\): \(\Phi(2)-\Phi(-1)=0.9772-0.1587=0.8185\), about \(82\%\). The rule gave \(34\%+47.5\%=81.5\%\).</p>
      <h3>When a normal curve is the wrong model</h3>
      <p>The mean and standard deviation can be computed for any list of numbers, so they never tell you whether the curve fits. Look at the histogram first. A normal curve is a poor model when the data is
      <b>skewed</b> (a long tail on one side, such as incomes), has <b>two or more peaks</b> (such as a group mixing children and adults), or <b>piles up against a hard limit</b> (such as quiz scores near the maximum), and when there are too few values to show a shape at all. A good candidate has one peak, is symmetric, falls off smoothly, and has no wall. Even then, the percentages are for the model. The real data can differ a little.</p>`,
    check: [
      { q: String.raw`The scores on a school test follow a normal distribution with mean \(72\) and standard deviation \(6\). About what percent of students scored between \(66\) and \(78\)?`,
        choices: ['34%', '50%', '68%', '95%'], answer: 2,
        why: String.raw`\(66=72-6\) and \(78=72+6\), so the region is within \(1\) standard deviation of the mean. About \(68\%\) of values lie there. The answer \(34\%\) is only one side of the mean, and \(95\%\) is the share within \(2\) standard deviations, a wider band.`,
        hint: 'How many standard deviations from the mean are 66 and 78?' },
      { q: 'Four data sets each have a mean and a standard deviation. For which one would a normal curve built from those two numbers fit the data worst?',
        choices: ['Weights of 400 bags of flour packed to 1 kg: one peak near 1.00 kg, falling off evenly on both sides',
          'Scores on a 20-point quiz where about half the class got the maximum, 20, and the rest are spread out below it',
          'Heights of 300 adult men: one peak near 175 cm, symmetric on both sides',
          'Volumes in 250 juice cartons: one peak near 1 liter, falling off evenly on both sides'], answer: 1,
        why: 'Half the class sits at the maximum, so the bars pile up against a hard wall at 20 and are cut off. A normal curve is symmetric and would spill past 20, where no score exists. The other three sets have one peak, are symmetric and have no wall.',
        hint: 'Check for one peak, symmetry, a smooth bell shape, and no hard wall.' }
    ],
    links: { prereq: ['mean-median-and-spread'], related: ['pascals-triangle-and-the-galton-board', 'probability-with-repeated-trials', 'samples-and-populations', 'quadratics-and-the-parabola'] },

    mount({ stage, controls: C }) {
      const st = { mu: 60, sd: 15, a: 60, b: 80 };
      let mode = 'fit', rtype = 'between', bands = false, showTarget = true;
      let qi = -1, qPhase = 0, dsi = 0, verdictOK = false, msg = '', cancel = () => {};
      delete stage.dataset.coords;
      const P = new Plane(stage, { span: 6 });

      const view = () => mode === 'judge' ? DS[dsi] : SC;
      const curveOf = () => mode === 'judge' ? { mu: DS[dsi].mean, sd: DS[dsi].sd } : st;
      const showExact = () => qi < 0 || qPhase === 2;

      /* normalized plot area (100 wide, 52 tall) placed with pixel margins; labels below the axis use pixel offsets */
      const lay = p => {
        const V = view(), PL = 46, PR = 24, PT = 60, PB = mode === 'area' && bands ? 128 : mode === 'fit' && showTarget ? 84 : 46;
        const aw = p.w - PL - PR, ah = p.h - PT - PB, sc = Math.max(1, Math.min(aw / 100, ah / 52));
        const H = clamp(ah / sc, 52, 110), ox = PL + (aw - 100 * sc) / 2, oy = PT + (ah - H * sc) / 2 + H * sc;
        p.span = Math.min(p.w, p.h) / (2 * sc); p.cx = (p.w / 2 - ox) / sc; p.cy = (oy - p.h / 2) / sc;
        return { V, H, T: H - 2, U: x => (x - V.x0) / (V.x1 - V.x0) * 100, fromU: u => V.x0 + u / 100 * (V.x1 - V.x0), Yv: y => y / V.ymax * (H - 2) };
      };
      const xHandle = (p, hd) => {
        const { V, T, U, Yv } = lay(p);
        if (hd === 'mu') return [U(st.mu), Math.min(Yv(V.n * V.bw / (st.sd * Math.sqrt(2 * Math.PI))), T * .94)];
        if (hd === 'sd') return [U(st.mu + st.sd), Math.min(Yv(V.n * V.bw * pdf(st.mu + st.sd, st.mu, st.sd)), T * .8)];
        return [U(hd === 'a' ? st.a : st.b), 0];
      };
      const region = () => rtype === 'above' ? [st.a, Infinity] : rtype === 'below' ? [-Infinity, st.a] : [st.a, st.b];
      const prob = () => { const [lo, hi] = region(); return Phi((hi - MU) / SD) - Phi((lo - MU) / SD); };
      const zOf = x => (x - MU) / SD;
      const locked = () => mode === 'area' && qi >= 0 && qPhase === 2;
      const handlesOn = () => mode === 'area' && !locked() ? (rtype === 'between' ? ['a', 'b'] : ['a']) : [];

      P.onDraw = (c, p) => {
        const { V, H, T, U, Yv } = lay(p), pal = p.pal, fs = clamp(p.scale * 1.9, 14, 19), cu = curveOf();
        const f = x => V.n * V.bw * pdf(x, cu.mu, cu.sd);
        const x0px = p.X(0), x1px = p.X(100), y0px = p.Y(0);
        /* gridlines and counts */
        for (let y = 0; y <= V.ymax; y += V.ystep) {
          p.path([[0, Yv(y)], [100, Yv(y)]], { stroke: pal.grid, width: 1 });
          p.label(String(y), -1.2, Yv(y), { size: fs, italic: false, color: pal.muted, align: 'right' });
        }
        p.label(V.unit || 'students', 0, H, { size: fs, italic: false, color: pal.muted, align: 'left', dy: -34 });
        p.label(V.name, 100, H, { size: fs, italic: false, color: pal.text, align: 'right', dy: -34 });
        const under = (lo, hi, fill) => {
          lo = Math.max(lo, V.x0); hi = Math.min(hi, V.x1); if (hi <= lo) return;
          const n = Math.max(6, Math.ceil((hi - lo) / (V.x1 - V.x0) * 160)), pts = [[U(lo), 0]];
          for (let i = 0; i <= n; i++) { const x = lo + (hi - lo) * i / n; pts.push([U(x), Yv(f(x))]); }
          pts.push([U(hi), 0]); p.path(pts, { fill, close: true });
        };
        c.save(); c.beginPath(); c.rect(x0px - 2, p.Y(H + 1), x1px - x0px + 4, y0px - p.Y(H + 1) + 1); c.clip();
        if (mode === 'area' && bands) { under(MU - 3 * SD, MU + 3 * SD, alpha(pal.blue, .09)); under(MU - 2 * SD, MU + 2 * SD, alpha(pal.blue, .11)); under(MU - SD, MU + SD, alpha(pal.blue, .14)); }
        if (mode === 'area') { const [lo, hi] = region(); under(lo, hi, alpha(pal.yellow, .6)); }
        /* bars */
        V.counts.forEach((n, i) => {
          const m = V.start + V.bw * i, u0 = U(m - V.bw / 2), u1 = U(m + V.bw / 2), h = Yv(n);
          if (n > 0) p.path([[u0, 0], [u1, 0], [u1, h], [u0, h]], { fill: alpha(pal.muted, mode === 'area' ? .18 : .32), stroke: alpha(pal.muted, mode === 'area' ? .5 : .9), width: 1, close: true });
        });
        const pts = []; for (let i = 0; i <= 240; i++) { const x = V.x0 + (V.x1 - V.x0) * i / 240; pts.push([U(x), Yv(f(x))]); }
        p.path(pts, { stroke: pal.blue, width: 3 });
        if (mode === 'judge' && verdictOK && V.wall) {
          const w = V.wall, lo = w.side === 'below' ? V.x0 : w.x, hi = w.side === 'below' ? w.x : V.x1;
          under(lo, hi, alpha(pal.red, .45));
        }
        c.restore();
        /* axis and ticks */
        p.path([[0, 0], [100, 0]], { stroke: pal['grid-strong'], width: 2 });
        for (let x = Math.ceil(V.x0 / V.tick) * V.tick; x <= V.x1 + 1e-9; x += V.tick) {
          c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.beginPath(); c.moveTo(p.X(U(x)), y0px); c.lineTo(p.X(U(x)), y0px + 5); c.stroke();
          p.label(String(x), U(x), 0, { size: fs, italic: false, color: pal.muted, dy: 16 });
        }
        const bracket = (lo, hi, k, color, text) => {
          const y = y0px + 40 + 26 * k, xa = p.X(U(lo)), xb = p.X(U(hi));
          c.strokeStyle = color; c.lineWidth = 2.5; c.lineCap = 'round'; c.beginPath();
          c.moveTo(xa, y - 6); c.lineTo(xa, y + 6); c.moveTo(xa, y); c.lineTo(xb, y); c.moveTo(xb, y - 6); c.lineTo(xb, y + 6); c.stroke();
          c.save(); c.setLineDash([2, 4]); c.globalAlpha = .45; c.lineWidth = 1; c.beginPath(); c.moveTo(xa, y0px + 6); c.lineTo(xa, y - 6); c.moveTo(xb, y0px + 6); c.lineTo(xb, y - 6); c.stroke(); c.restore();
          p.label(text, U((lo + hi) / 2), 0, { size: fs, italic: false, color, dy: y - y0px - 12 });
        };
        if (mode === 'area' && bands) ['68%', '95%', '99.7%'].forEach((t, i) => bracket(MU - (i + 1) * SD, MU + (i + 1) * SD, i, pal.blue, '±' + (i + 1) + 'σ: ' + t));

        if (mode === 'fit') {
          const mu = st.mu, sd = st.sd, hm = xHandle(p, 'mu'), hs = xHandle(p, 'sd');
          if (showTarget) {
            c.save(); c.setLineDash([7, 6]); c.strokeStyle = pal.yellow; c.lineWidth = 2.5; c.beginPath(); c.moveTo(p.X(U(SC.mean)), y0px); c.lineTo(p.X(U(SC.mean)), p.Y(T + 1)); c.stroke(); c.restore();
            p.label('data mean ' + SC.mean.toFixed(1), U(SC.mean), T + 1, { size: fs, italic: false, color: pal.yellow, dy: -10 });
            bracket(SC.mean - SC.sd, SC.mean + SC.sd, 0, pal.green, 'data σ = ' + SC.sd.toFixed(1) + ' each side');
          }
          c.save(); c.setLineDash([3, 5]); c.strokeStyle = alpha(pal.blue, .7); c.lineWidth = 1.5; c.beginPath();
          c.moveTo(p.X(hm[0]), p.Y(hm[1])); c.lineTo(p.X(hm[0]), y0px); c.moveTo(p.X(hs[0]), p.Y(hs[1])); c.lineTo(p.X(hs[0]), y0px); c.stroke(); c.restore();
          p.path([[hm[0], hs[1]], [hs[0], hs[1]]], { stroke: alpha(pal.blue, .7), width: 1.5, dash: [3, 5] });
          p.dot(hs[0], hs[1], 8, pal.stage, pal.brass, 3.2); p.dot(hm[0], hm[1], 9, pal.stage, pal.brass, 3.2);
          p.label('μ', hm[0], hm[1], { size: fs + 5, color: pal.blue, dy: -20 });
          p.label('σ', hs[0], hs[1], { size: fs + 5, color: pal.blue, dy: -20 });
        }
        if (mode === 'area') {
          const hs = handlesOn(), [lo, hi] = region();
          const edges = rtype === 'above' ? [st.a] : rtype === 'below' ? [st.a] : [st.a, st.b];
          edges.forEach(x => {
            c.save(); c.setLineDash([6, 5]); c.strokeStyle = pal.yellow; c.lineWidth = 2.5; c.beginPath(); c.moveTo(p.X(U(x)), y0px); c.lineTo(p.X(U(x)), p.Y(T)); c.stroke(); c.restore();
            p.label('z = ' + num(zOf(x)), U(x), T, { size: fs, italic: false, color: pal.text, dy: -12 });
          });
          if (showExact()) {
            const a = Math.max(lo, V.x0), b = Math.min(hi, V.x1), xc = (a + b) / 2;
            const inside = rtype === 'between' && b - a >= 20;
            p.label(pct(prob()), U(xc), inside ? Yv(f(xc)) * .45 : Yv(f(xc)), { size: fs + 3, italic: false, color: pal.text, dy: inside ? 0 : -18 });
          }
          hs.forEach(hd => { const q = xHandle(p, hd); p.dot(q[0], q[1], 9, pal.yellow, pal.brass, 3.2); });
        }
        if (mode === 'judge') {
          const d = DS[dsi];
          c.save(); c.setLineDash([7, 6]); c.strokeStyle = pal.yellow; c.lineWidth = 2.5; c.beginPath(); c.moveTo(p.X(U(d.mean)), y0px); c.lineTo(p.X(U(d.mean)), p.Y(T)); c.stroke(); c.restore();
          p.label('mean', U(d.mean), T, { size: fs, italic: false, color: pal.yellow, dy: -10 });
          if (verdictOK && d.wall) {
            c.save(); c.setLineDash([5, 5]); c.strokeStyle = pal.red; c.lineWidth = 2.5; c.beginPath(); c.moveTo(p.X(U(d.wall.x)), y0px); c.lineTo(p.X(U(d.wall.x)), p.Y(T)); c.stroke(); c.restore();
            p.label('wall at ' + d.wall.x, U(d.wall.x), T, { size: fs, italic: false, color: pal.red, dy: -10 });
          }
        }
      };

      /* ---------- feedback text ---------- */
      const K = s => `<span class="k">${s}</span>`;
      const fitMsg = () => {
        const dm = st.mu - SC.mean, ds = st.sd - SC.sd, okM = Math.abs(dm) <= .5, okS = Math.abs(ds) <= .5, out = [];
        if (okM && okS) return '<b>It fits.</b> The peak sits at the mean and the curve is as wide as the data: about two thirds of the bars lie within one σ of the center, and the curve has the same height as the bars.';
        if (okM) out.push('The center is right: the peak sits at the mean.');
        else out.push(dm > 0 ? 'The curve is off-center: its peak is to the right of the data. The bars balance at the mean, so slide the center left.' : 'The curve is off-center: its peak is to the left of the data. The bars balance at the mean, so slide the center right.');
        if (okS) out.push('The width is right.');
        else out.push(ds > 0 ? 'The curve is too wide: it is lower and flatter than the bars, and its tails reach past the ends of the data. Pull the side handle in.' : 'The curve is too narrow: it is taller than the middle bars and misses the bars at the sides. Push the side handle out.');
        return out.join(' ');
      };
      const upd = () => {
        let h;
        if (mode === 'fit') {
          h = `${K('Data')} ${SC.n} scores<br>${K('Mean')} ${SC.mean.toFixed(1)} &nbsp; ${K('Std deviation')} ${SC.sd.toFixed(1)}<br>${K('Your curve')} μ = ${num(st.mu)}, σ = ${num(st.sd)}<br><br>${fitMsg()}`;
        } else if (mode === 'area') {
          const q = qi >= 0 ? QS[qi] : null;
          const where = rtype === 'above' ? `above ${st.a}` : rtype === 'below' ? `below ${st.a}` : `from ${st.a} to ${st.b}`;
          const zline = rtype === 'between'
            ? `${K('z-scores')} (${st.a} − 70) ÷ 10 = ${num(zOf(st.a))} and (${st.b} − 70) ÷ 10 = ${num(zOf(st.b))}`
            : `${K('z-score')} (${st.a} − 70) ÷ 10 = ${num(zOf(st.a))}`;
          h = `${K('Curve')} μ = 70, σ = 10 &nbsp; ${K('Scores')} ${where}<br>${zline}`;
          if (q) {
            h = `<b>Question ${qi + 1} of ${QS.length}.</b> ${q.text}<br><br>` + h;
            if (qPhase === 0) h += `<br><br>${rtype === 'between' ? `Drag the two boundaries to ${q.a} and ${q.b}.` : `Drag the boundary to ${q.a}.`} The z-score tells you how many standard deviations each boundary is from the mean.`;
            else if (qPhase === 1) h += `<br><br>${msg || 'The boundaries are in place. Which estimate fits the 68-95-99.7 rule?'}`;
            else h += `<br>${K('Exact area')} ${pct(prob())}, about ${Math.round(prob() * N)} of the ${N} students<br><br>${msg}`;
          } else {
            h += `<br>${K('Exact area')} ${pct(prob())}, about ${Math.round(prob() * N)} of the ${N} students<br><br>`;
            if (rtype === 'between' && Math.abs((st.a + st.b) / 2 - MU) < 1e-9 && [1, 2, 3].includes((st.b - st.a) / 2 / SD))
              { const k = (st.b - st.a) / 2 / SD; h += `This is the mean ± ${k}σ. The rule says about ${['68%', '95%', '99.7%'][k - 1]}. The exact area is ${pct(prob())}, very close.`; }
            else if (rtype === 'between') h += 'This region is not the mean plus or minus a whole number of σ, so the rule only brackets it. Try 60 and 80, or 50 and 90, or 40 and 100.';
            else h += 'A one-sided region is what is left after the middle band is removed. The rule gives 16% above 1σ and 2.5% above 2σ. Try 80 and then 90.';
          }
        } else {
          const d = DS[dsi];
          h = `${K('Data')} ${d.name}<br>${K('Mean')} ${d.fv(d.mean)} &nbsp; ${K('Std deviation')} ${d.fv(d.sd)}<br><br>` +
            (msg || 'The blue curve uses only the mean and standard deviation of this data. Does it follow the bars? Choose a verdict below.');
        }
        ro.innerHTML = h;
      };

      /* ---------- controls ---------- */
      const ro = C.readout(), host = ro.parentNode, grp = { fit: [], area: [], judge: [] };
      const track = (g, fn) => { const n0 = host.children.length, r = fn(); for (let i = n0; i < host.children.length; i++) grp[g].push(host.children[i]); return r; };
      const rowOf = (g, fn) => { const n0 = host.children.length, r = fn(); const row = host.children[n0]; grp[g].push(row); return [r, row]; };
      const show = (els, on) => els.forEach(e => { e.style.display = on ? '' : 'none'; });
      let freeEls = [], ansEls = [], nextEls = [], vNextEls = [];
      const vis = () => {
        show(grp.fit, mode === 'fit'); show(grp.area, mode === 'area'); show(grp.judge, mode === 'judge');
        if (mode === 'area') { show(freeEls, qi < 0); show(ansEls, qi >= 0 && qPhase === 1); show(nextEls, qi >= 0 && qPhase === 2); }
        if (mode === 'judge') show(vNextEls, verdictOK);
      };
      const sync = () => { muS.set(st.mu); sdS.set(st.sd); upd(); P.draw(); vis(); };

      track('fit', () => C.title('Fit the curve'));
      const muS = track('fit', () => C.slider({ label: 'Center μ (mean)', min: 40, max: 100, step: 1, value: st.mu, format: v => num(v), onInput: v => { cancel(); st.mu = v; sync(); } }));
      const sdS = track('fit', () => C.slider({ label: 'Width σ (standard deviation)', min: 5, max: 20, step: .5, value: st.sd, format: v => num(v), onInput: v => { cancel(); st.sd = v; sync(); } }));
      track('fit', () => C.toggle({ label: 'Show the data\'s mean and σ', value: true, onChange: v => { showTarget = v; sync(); } }));
      track('fit', () => C.hint('Drag the top handle (center) and the side handle (width), or use the sliders. The center snaps to whole numbers and the width to halves.'));

      track('area', () => C.title('Region'));
      const typeSel = track('area', () => C.select({ label: 'Region shaded', options: [{ value: 'between', label: 'Between two cutoffs' }, { value: 'above', label: 'Above a cutoff' }, { value: 'below', label: 'Below a cutoff' }], value: 'between',
        onChange: v => { rtype = v; if (st.b <= st.a) st.b = Math.min(st.a + 10, 110); sync(); } }));
      freeEls.push(host.lastElementChild);
      const bandT = track('area', () => C.toggle({ label: 'Show the 68-95-99.7 bands', value: false, onChange: v => { bands = v; sync(); } }));
      const [ansBtns, ansRow] = rowOf('area', () => C.buttons([0, 1, 2].map(i => ({ label: '', onClick: () => answer(i) }))));
      ansEls.push(ansRow);
      const [nextBtn, nextRow] = rowOf('area', () => C.buttons([{ label: 'Next question', primary: true, onClick: () => { if (qi + 1 < QS.length) setQ(qi + 1); else finishQs(); sync(); } }]));
      nextEls.push(nextRow);
      track('area', () => C.hint('Drag the yellow handles on the axis. Boundaries snap to whole numbers.'));

      track('judge', () => C.title('Good fit or poor fit?'));
      const VERD = [['good', 'Good fit'], ['skew', 'Poor: skewed'], ['bimodal', 'Poor: two peaks'], ['wall', 'Poor: pile-up at a wall']];
      const [vBtns] = rowOf('judge', () => C.buttons(VERD.map(([k, l]) => ({ label: l, onClick: () => judge(k) }))));
      const [, vNextRow] = rowOf('judge', () => C.buttons([{ label: 'Next data set', primary: true, onClick: () => { dsi = (dsi + 1) % DS.length; verdictOK = false; msg = ''; sync(); } }]));
      vNextEls.push(vNextRow);
      track('judge', () => C.hint('Look for one peak, symmetry, a smooth bell shape and no hard wall.'));
      host.append(ro);

      /* ---------- questions and verdicts ---------- */
      const placed = () => { const q = QS[qi]; return rtype === 'between' ? st.a === q.a && st.b === q.b : st.a === q.a; };
      const setQ = i => {
        qi = i; qPhase = 0; msg = ''; const q = QS[i]; rtype = q.type; typeSel.value = q.type;
        st.a = q.start.a; st.b = q.start.b !== undefined ? q.start.b : st.a + 10;
        ansBtns.forEach((b, k) => { b.textContent = q.opts[k]; });
        nextBtn[0].textContent = i + 1 < QS.length ? 'Next question' : 'Finish';
      };
      const finishQs = () => {
        qi = -1; qPhase = 0; rtype = 'between'; typeSel.value = 'between'; st.a = 60; st.b = 80;
      };
      const answer = i => {
        const q = QS[qi];
        if (i === q.ok) { qPhase = 2; msg = '<b>Right.</b> ' + q.why[i] + ' ' + q.cmp; }
        else msg = q.why[i] + ' Try another choice.';
        sync();
      };
      const judge = k => {
        const d = DS[dsi]; if (verdictOK) return;
        if (k === d.ans) { verdictOK = true; msg = '<b>Right.</b> ' + d.right(d); }
        else msg = d.wrong[k] + ' Try another verdict.';
        sync();
      };

      draggable(P, {
        hit: (px, py) => {
          if (mode === 'fit') {
            lay(P);
            if (near(P, ...xHandle(P, 'sd'), px, py)) return 'sd';
            if (near(P, ...xHandle(P, 'mu'), px, py)) return 'mu';
            return null;
          }
          if (mode === 'area') {
            lay(P);
            let best = null, bd = 20;
            for (const hd of handlesOn()) { const q = xHandle(P, hd), d = Math.hypot(P.X(q[0]) - px, P.Y(q[1]) - py); if (d <= bd) { bd = d; best = hd; } }
            return best;
          }
          return null;
        },
        move: (hd, u) => {
          cancel(); const L = lay(P), x = L.fromU(u);
          if (hd === 'mu') st.mu = clamp(snap(x, 1), 40, 100);
          else if (hd === 'sd') st.sd = clamp(snap(x - st.mu, .5), 5, 20);
          else {
            const v = clamp(snap(x, 1), 30, 110);
            if (hd === 'a') st.a = rtype === 'between' ? Math.min(v, st.b - 1) : v; else st.b = Math.max(v, st.a + 1);
            if (qi >= 0) { if (qPhase === 1 && !placed()) { qPhase = 0; msg = ''; } else if (qPhase === 0 && placed()) { qPhase = 1; msg = ''; } }
          }
          sync();
        }
      });

      const apply = (patch, immediate) => {
        cancel();
        const { mode: m, rtype: rt, bands: bd, qi: q, dsi: d, ...nums } = patch;
        if (m !== undefined) mode = m;
        if (rt !== undefined) { rtype = rt; typeSel.value = rt; }
        if (bd !== undefined) { bands = bd; bandT.checked = bd; }
        if (d !== undefined) { dsi = d; verdictOK = false; msg = ''; }
        if (q !== undefined) { if (q >= 0) { setQ(q); delete nums.a; delete nums.b; } else { qi = -1; qPhase = 0; msg = ''; } }
        if (immediate || reduceMotion) { Object.assign(st, nums); sync(); } else { sync(); cancel = animateTo(st, nums, 900, sync); }
      };
      sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
