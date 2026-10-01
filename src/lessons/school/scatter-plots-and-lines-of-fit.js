/* =====================================================================
   SCHOOL — Scatter plots and lines of fit
   ===================================================================== */
{
  const pl = (v, one, many) => num(v) + ' ' + (Math.abs(v) === 1 ? one : many);
  const money = v => (v < 0 ? '−' : '') + '$' + Math.round(Math.abs(v) * 1000).toLocaleString('en');
  const flat = m => Math.abs(m) < .005;
  const rnd = v => Math.round(v * 1e9) / 1e9;
  const one = v => (v < 0 ? '−' : '') + Math.abs(v).toFixed(1);

  /* Hand-written data. Each set was built so that its least-squares line is a friendly number. */
  const DS = {
    study: {
      label: 'Hours studied and quiz score',
      xt: 'Time spent studying (hours)', yt: 'Quiz score (points)', xu: 'hours', yu: 'points', su: 'points per hour',
      xmax: 12, ymax: 110, gx: 2, gy: 20, xStep: .5, mStep: .25, mMax: 10, bStep: 1, x0: 5, cap: 100,
      capText: 'highest possible score: 100',
      pts: [[.5, 57], [1.5, 63], [1.5, 61], [2, 58], [2.5, 61], [3, 56], [4, 71], [4.5, 71], [5, 73], [5.5, 81], [6, 77], [6, 87], [6.5, 86], [6.5, 77], [7, 80], [8, 88]],
      pattern: 'Positive, linear association', note: 'More hours go with higher scores, and the dots follow a straight band.',
      fx: x => pl(x, 'hour', 'hours'), fy: v => pl(v, 'point', 'points'), fm: v => one(v) + ' points',
      slope: m => flat(m) ? 'The line is flat: more study time does not change the predicted score.'
        : `Each extra hour of study ${m > 0 ? 'adds' : 'takes away'} about ${pl(Math.abs(m), 'point', 'points')}.`,
      inter: b => `With 0 hours of study the line predicts ${pl(b, 'point', 'points')}.`
    },
    car: {
      label: 'Age of a car and its value',
      xt: 'Age of the car (years)', yt: 'Value of the car ($1000s)', xu: 'years', yu: '$1000s', su: '$1000s per year',
      xmax: 12, ymax: 30, gx: 2, gy: 5, xStep: .5, mStep: .1, mMax: 5, bStep: .5, x0: 5, floorText: 'A car cannot be worth less than $0',
      pts: [[1.5, 22.5], [1.5, 20.7], [2.5, 18.2], [4, 16.6], [4, 17.1], [4.5, 15.2], [4.5, 16.9], [5.5, 15.9], [6, 11.7], [8, 10.4], [8, 10.7], [8.5, 6.6], [9, 8.3], [9.5, 6.7], [9.5, 5.4], [10, 7.4]],
      pattern: 'Negative, linear association', note: 'Older cars are worth less, and the dots follow a straight band.',
      fx: x => pl(x, 'year', 'years'), fy: money, fm: v => '$' + Math.round(v * 1000).toLocaleString('en'),
      slope: m => flat(m) ? 'The line is flat: age does not change the predicted value.'
        : `Each extra year of age ${m > 0 ? 'adds' : 'takes away'} about ${money(Math.abs(m))} of value.`,
      inter: b => `At age 0 (a brand-new car) the line predicts a value of ${money(b)}.`
    },
    shoe: {
      label: 'Shoe size and test score',
      xt: 'Shoe size (US)', yt: 'Test score (points)', xu: 'size', yu: 'points', su: 'points per size',
      xmax: 14, ymax: 100, gx: 2, gy: 20, xStep: .5, mStep: .25, mMax: 10, bStep: 1, x0: 8,
      pts: [[5.5, 77], [6, 66], [6, 71], [6.5, 90], [6.5, 79], [7, 90], [7.5, 61], [8, 85], [8, 92], [9, 74], [9.5, 84], [10, 76], [10, 72], [10.5, 73], [11, 80]],
      pattern: 'No association', note: 'The dots form a shapeless cloud. Shoe size tells you nothing about the score.',
      fx: x => 'size ' + num(x), fy: v => pl(v, 'point', 'points'), fm: v => one(v) + ' points',
      slope: m => flat(m) ? 'The line is flat: a bigger shoe does not change the predicted score.'
        : `Each larger shoe size ${m > 0 ? 'adds' : 'takes away'} about ${pl(Math.abs(m), 'point', 'points')}.`,
      inter: b => `A shoe size of 0 does not exist, so the intercept has no real meaning here. The line crosses at ${pl(b, 'point', 'points')}.`
    },
    ball: {
      label: 'Thrown ball: height and time',
      xt: 'Time since the throw (seconds)', yt: 'Height of the ball (meters)', xu: 'seconds', yu: 'm', su: 'm per second',
      xmax: 4, ymax: 15, gx: 1, gy: 5, xStep: .25, mStep: .25, mMax: 8, bStep: .5, x0: 1, floorText: 'A ball cannot be below the ground',
      pts: [[0, 2], [.25, 5.7], [.5, 8.7], [.75, 10.6], [1, 11.9], [1.25, 13.2], [1.5, 13.1], [1.75, 12.8], [2, 11.7], [2.25, 11.2], [2.5, 8.1], [2.75, 6.1], [3, 1.9]],
      pattern: 'Nonlinear association (an arch)', note: 'The height rises, then falls. There is a clear pattern, but it is a curve, not a line.',
      fx: x => pl(x, 'second', 'seconds'), fy: v => pl(v, 'meter', 'meters'), fm: v => one(v) + ' m',
      slope: m => flat(m) ? 'The line is flat: it says the height never changes with time.'
        : `Each extra second the line says the height ${m > 0 ? 'rises' : 'falls'} by about ${num(Math.abs(m))} m.`,
      inter: b => `At time 0 (the throw) the line predicts ${pl(b, 'meter', 'meters')}.`
    },
    delivery: {
      label: 'Pizza delivery: distance and time',
      xt: 'Distance from the shop (km)', yt: 'Delivery time (minutes)', xu: 'km', yu: 'minutes', su: 'minutes per km',
      xmax: 10, ymax: 60, gx: 2, gy: 10, xStep: .5, mStep: .25, mMax: 8, bStep: 1, x0: 4, out: 13, floorText: 'A delivery cannot take less than 0 minutes',
      pts: [[.5, 9], [1, 11], [1.5, 17], [2, 21], [2.5, 19], [2.5, 20], [3, 24], [3.5, 22], [5, 24], [5, 26], [5.5, 25], [6.5, 35], [7.5, 33], [2, 44]],
      pattern: 'Positive, linear association, with one outlier', note: 'Longer trips take longer, except one delivery far above the rest (ringed).',
      fx: x => pl(x, 'km', 'km'), fy: v => pl(v, 'minute', 'minutes'), fm: v => one(v) + ' min',
      slope: m => flat(m) ? 'The line is flat: distance does not change the predicted time.'
        : `Each extra kilometer ${m > 0 ? 'adds' : 'takes away'} about ${pl(Math.abs(m), 'minute', 'minutes')}.`,
      inter: b => `A 0 km delivery would still take about ${pl(b, 'minute', 'minutes')}, the time to make and hand over the order.`
    },
    geyser: {
      label: 'Geyser: eruption length and wait',
      xt: 'Length of an eruption (minutes)', yt: 'Wait until the next eruption (minutes)', xu: 'minutes', yu: 'minutes', su: 'minutes per minute',
      xmax: 6, ymax: 100, gx: 1, gy: 20, xStep: .25, mStep: .5, mMax: 20, bStep: 1, x0: 4, gap: [2.5, 3.5],
      clusters: [[1.9, 54, .75, 11], [4.3, 80, .95, 16]],
      pts: [[1.5, 46], [1.5, 54], [1.75, 53], [2.25, 50], [2.25, 61], [2.5, 59], [3.5, 79], [3.75, 70], [3.75, 79], [4.25, 83], [4.25, 79], [4.5, 79], [4.5, 82], [4.75, 79], [5, 92]],
      pattern: 'Positive association, in two clusters', note: 'Short eruptions go with short waits, long ones with long waits. The dots form two groups with a gap between them.',
      fx: x => pl(x, 'minute', 'minutes'), fy: v => pl(v, 'minute', 'minutes'), fm: v => one(v) + ' min',
      slope: m => flat(m) ? 'The line is flat: eruption length does not change the predicted wait.'
        : `Each extra minute of eruption goes with about ${pl(Math.abs(m), 'minute', 'minutes')} ${m > 0 ? 'more' : 'less'} waiting.`,
      inter: b => `An eruption of 0 minutes never happens, so the intercept has no real meaning here. The line crosses at ${pl(b, 'minute', 'minutes')}.`
    }
  };

  /* least squares, mean miss, and the flat-line baseline */
  const lsq = pts => {
    const n = pts.length, sx = pts.reduce((a, p) => a + p[0], 0), sy = pts.reduce((a, p) => a + p[1], 0);
    const sxx = pts.reduce((a, p) => a + p[0] * p[0], 0), sxy = pts.reduce((a, p) => a + p[0] * p[1], 0), den = n * sxx - sx * sx;
    const m = den ? (n * sxy - sx * sy) / den : 0;
    return { m: rnd(m), b: rnd((sy - m * sx) / n) };
  };
  const missOf = (pts, m, b) => pts.reduce((a, p) => a + Math.abs(p[1] - (m * p[0] + b)), 0) / pts.length;
  const meanY = pts => pts.reduce((a, p) => a + p[1], 0) / pts.length;
  const baseOf = pts => { const my = meanY(pts); return pts.reduce((a, p) => a + Math.abs(p[1] - my), 0) / pts.length; };
  const verdict = r => r < .45 ? 'Close. The dots hug the line.' : r < .8 ? 'Loose. Some dots are far from the line.'
    : r <= 1.05 ? 'Poor. No better than a flat line at the average.' : 'Poor. A flat line at the average would do better.';

  register({
    id: 'scatter-plots-and-lines-of-fit', level: 'school',
    title: 'Scatter plots and lines of fit',
    blurb: 'Plot two measurements as dots, name the pattern, then fit a line by eye and use its equation to predict.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 5.2; p.cy = 3.6; p.span = 4.6;
      p.path([[0, 0], [10.4, 0]], { stroke: pal['grid-strong'], width: 1.6 });
      p.path([[0, 0], [0, 7.6]], { stroke: pal['grid-strong'], width: 1.6 });
      const f = x => .62 * x + 1;
      const pts = [[1, 2.3], [1.7, 1.7], [2.4, 3.1], [3.1, 2.6], [3.8, 3.9], [4.5, 3.4], [5.2, 4.7], [5.9, 4.6], [6.6, 5.7], [7.3, 5.2], [8, 6.4], [8.8, 6.2], [9.5, 7.1]];
      pts.forEach(([x, y]) => p.path([[x, y], [x, f(x)]], { stroke: alpha(pal.red, .75), width: 1.6 }));
      p.path([[.4, f(.4)], [10, f(10)]], { stroke: pal.blue, width: 2.8 });
      pts.forEach(([x, y]) => p.dot(x, y, 4.2, alpha(pal.text, .85), pal.stage, 1.2));
    },
    hook: String.raw`The dots rise, but they never sit exactly on a line. How do you draw the one line that fits them, and how far can you trust a prediction made from it?`,
    steps: [
      { title: 'Read the pattern',
        text: String.raw`<p>Each dot is one student. Across is the time spent studying. Up is the quiz score. A scatter plot shows whether two measurements go together.</p><p>The dots climb from lower left to upper right: a <b>positive</b> association. They follow a straight band: a <b>linear</b> association. The readout names the pattern.</p><p>Open the <b>Dataset</b> menu and try to name each pattern before you read the readout.</p>`,
        set: { ds: 'study', line: false, res: false, pred: false, name: true } },
      { title: 'When is a line a good model?',
        text: String.raw`<p>These dots show a thrown ball's height over time. They rise and fall in an arch: a <b>nonlinear</b> association.</p><p>The line shown is the good line from the button, flat at \(9\) m. Even so, it misses by \(3.3\) m on average, exactly as much as a flat line at the average height. The dots sit below the line at both ends and above it in the middle.</p><p>Drag the handles: no straight line gets the average miss anywhere near zero. Use a line only when the dots follow a straight band.</p>`,
        set: { ds: 'ball', line: true, res: true, pred: false, name: false, m: 0, b: 9 } },
      { title: 'Fit a line by eye',
        text: String.raw`<p>Back to the study scores. This rough line, \(y = 2x + 66\), is only a guess. Each red segment is a <b>miss</b>: the vertical gap between a dot and the line. The average miss is \(6.3\) points.</p><p>Drag the two ringed handles, or use the sliders, to bring the average miss down. The left handle sets where the line starts, \(b\). The right handle tilts it, \(m\).</p><p>Then press <b>Show a good line</b>. Its average miss is \(3.4\) points. It is one good line, not the only one.</p>`,
        set: { ds: 'study', line: true, res: true, pred: false, name: false, m: 2, b: 66 } },
      { title: 'Predict and interpret',
        text: String.raw`<p>The good line is \(y = 4.5x + 52\). The yellow guide sits at \(5\) hours, so the line predicts \(4.5\times 5 + 52 = 74.5\) points.</p><p>The <b>slope</b>, \(4.5\), is a rate: each extra hour adds about \(4.5\) points. The <b>intercept</b>, \(52\), is the starting value: with \(0\) hours the line predicts \(52\) points.</p><p>Now drag the guide to \(12\) hours. The line says \(106\), but the quiz is out of \(100\). Far outside the data, a line can fail.</p>`,
        set: { ds: 'study', line: true, res: false, pred: true, name: false, m: 4.5, b: 52, x: 5 } }
    ],
    formal: String.raw`
      <p>A <b>scatter plot</b> shows pairs of measurements, one dot \((x,y)\) for each person or object, with \(x\) across and \(y\) up. It lets you look for a pattern before you calculate anything.</p>
      <h3>Describing association</h3>
      <p>
      <b>Direction.</b> <em>Positive</em>: as \(x\) increases, \(y\) tends to increase. <em>Negative</em>: as \(x\) increases, \(y\) tends to decrease. <em>No association</em>: no trend.<br>
      <b>Shape.</b> <em>Linear</em>: the dots follow a straight band. <em>Nonlinear</em>: they follow a curve, such as an arch.<br>
      <b>Strength.</b> <em>Strong</em>: the dots hug the pattern. <em>Weak</em>: they are widely scattered around it.<br>
      <b>Clusters and outliers.</b> A <em>cluster</em> is a group of dots close together, often with a gap before the next group. An <em>outlier</em> is a dot far from the rest of the pattern.</p>
      <h3>Lines of fit</h3>
      <p>Use a straight line only when the dots suggest a linear association. Then draw a line \(y = mx + b\) with the dots close to it, about as many above as below. It is a <em>model</em>: it describes the trend, and the dots will not lie exactly on it.</p>
      <h3>Residuals: judging the fit</h3>
      <p>For a dot \((x,y)\) the line predicts \(\hat y = mx + b\). The <em>residual</em> is the miss:
      \[ \text{residual} = y - \hat y = \text{actual} - \text{predicted}. \]
      It is positive for a dot above the line and negative for a dot below. Small residuals mean a close fit. The lesson's <em>average miss</em> is the mean of \(|y-\hat y|\).</p>
      <p>Compare your line with the flat line \(y=\bar y\), where \(\bar y\) is the average of the \(y\) values. A line that does no better than that is not describing the pattern. If the residuals themselves form a pattern, for example negative at both ends and positive in the middle, a curve fits better than any line.</p>
      <p>Many lines can fit well. The <em>least-squares line</em> makes the sum of the squared residuals, \(\sum (y-\hat y)^2\), as small as possible. <b>Show a good line</b> draws it. Squaring makes big misses count extra, so one outlier can pull this line toward itself.</p>
      <h3>Reading the equation</h3>
      <p>In context the <b>slope</b> \(m\) is a rate: the predicted change in \(y\) for each 1-unit increase in \(x\), such as points per hour or dollars per year. The <b>intercept</b> \(b\) is the predicted \(y\) when \(x=0\). It is a starting value only if \(x=0\) makes sense. A new car has age \(0\), but a shoe size of \(0\) does not exist.</p>
      <p>Example: with \(y=4.5x+52\), where \(x\) is hours studied and \(y\) is quiz points, each extra hour adds about \(4.5\) points and \(0\) hours predicts \(52\) points. At \(5\) hours, \(\hat y = 4.5(5)+52 = 74.5\).</p>
      <h3>Prediction and extrapolation</h3>
      <p>Predicting inside the range of the data is <em>interpolation</em>. Predicting outside it is <em>extrapolation</em>, which is riskier because the trend may stop or bend. At \(12\) hours this line gives \(106\) out of \(100\), which is impossible.</p>
      <h3>Association is not causation</h3>
      <p>Two quantities can move together without one causing the other. Ice cream sales and sunburns both rise on hot days, yet ice cream does not cause sunburn. A scatter plot shows that two variables are associated. It does not show why.</p>`,
    check: [
      { q: 'A scatter plot compares the outside temperature (across) with the cups of hot chocolate a café sells (up). The dots fall from the upper left to the lower right in a narrow, straight band. How would you describe the association?',
        choices: ['Positive and linear', 'Negative and linear', 'No association', 'Nonlinear'], answer: 1,
        why: 'As the temperature rises, sales fall, so the association is negative. The narrow straight band makes it linear. "Negative" names the direction of the dots, not whether the news is bad.',
        hint: 'Read the dots from left to right. Do they go up or down? Do they follow a straight band or a curve?' },
      { q: String.raw`A line of fit for a phone battery is \(y=-8x+100\), where \(x\) is hours of use and \(y\) is the percent of charge left. Which statement is correct?`,
        choices: ['The charge starts at 8% and falls 100 percentage points each hour',
                  'The charge rises about 8 percentage points each hour, so after 5 hours it is 140%',
                  'The charge falls about 8 percentage points each hour, so after 5 hours the line predicts about 60%',
                  'The charge falls about 8 percentage points each hour, so after 5 hours the line predicts −40%'], answer: 2,
        why: String.raw`The slope \(-8\) is a rate: the charge falls about 8 points per hour. The intercept \(100\) is the charge at \(0\) hours. At \(x=5\): \(-8(5)+100 = 60\). Leaving out the intercept would give \(-40\), which is not a charge at all.`,
        hint: String.raw`Which number is the slope and which is the intercept? Then put \(x=5\) into \(-8x+100\), adding the \(100\).` }
    ],
    links: { prereq: ['slope-and-linear-functions'], related: ['mean-median-and-spread', 'quadratics-and-the-parabola', 'exponential-growth'] },

    mount({ stage, controls: C }) {
      const st = { ds: 'study', m: 0, b: 75, x: 5, line: true, res: true, pred: false, name: false, drop: false };
      let cancel = () => {};
      const P = new Plane(stage, { span: 5 });
      const D = () => DS[st.ds];
      const incl = () => D().pts.filter((_, i) => !(st.drop && i === D().out));
      const startB = d => clamp(rnd(snap(meanY(d.pts), d.bStep)), 0, d.ymax);
      st.b = startB(DS.study);

      /* pixel layout of the plot area, and data <-> pixel maps */
      const geo = p => {
        const d = D(), ml = clamp(p.w * .105, 40, 54), mr = 26, mt = 58, mb = 54, pw = p.w - ml - mr, ph = p.h - mt - mb;
        return { ml, mr, mt, mb, pw, ph,
          X: x => ml + x / d.xmax * pw, Y: y => p.h - mb - y / d.ymax * ph,
          ix: px => (px - ml) / pw * d.xmax, iy: py => (p.h - mb - py) / ph * d.ymax };
      };

      P.onDraw = (c, p) => {
        const pal = p.pal, d = D(), g = geo(p), { X, Y } = g, fs = clamp(p.w / 33, 12, 14.5), pts = d.pts;
        const T = (s, x, y, o = {}) => {
          const px = o.px || fs;
          c.font = o.it ? `italic ${px + 4}px "STIX Two Text","Cambria Math","Times New Roman",serif` : `500 ${px}px "Hanken Grotesk","Helvetica Neue",Arial,sans-serif`;
          c.textAlign = o.align || 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 4; c.strokeStyle = pal.stage;
          c.strokeText(s, x, y); c.fillStyle = o.color || pal.muted; c.fillText(s, x, y);
        };
        const seg = (x0, y0, x1, y1, col, w, dash) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.strokeStyle = col; c.lineWidth = w; c.setLineDash(dash || []); c.lineCap = 'round'; c.stroke(); c.setLineDash([]); };

        /* grid, axes, tick numbers */
        c.lineWidth = 1; c.strokeStyle = pal.grid; c.beginPath();
        for (let x = 0; x <= d.xmax + 1e-9; x += d.gx) { c.moveTo(X(x), g.mt); c.lineTo(X(x), Y(0)); }
        for (let y = 0; y <= d.ymax + 1e-9; y += d.gy) { c.moveTo(g.ml, Y(y)); c.lineTo(g.ml + g.pw, Y(y)); }
        c.stroke();
        seg(g.ml, Y(0), g.ml + g.pw, Y(0), pal['grid-strong'], 2); seg(g.ml, Y(0), g.ml, g.mt, pal['grid-strong'], 2);
        for (let x = 0; x <= d.xmax + 1e-9; x += d.gx) T(num(x), X(x), Y(0) + 16);
        for (let y = d.gy; y <= d.ymax + 1e-9; y += d.gy) T(num(y), g.ml - 8, Y(y), { align: 'right' });
        T(d.xt, g.ml + g.pw / 2, Y(0) + 38, { color: pal.text, px: fs + 1 });
        T(d.yt, 30, 16, { align: 'left', color: pal.text, px: fs + 1 });
        if (d.cap) {
          seg(g.ml, Y(d.cap), g.ml + g.pw, Y(d.cap), alpha(pal.muted, .8), 1.5, [3, 5]);
          T(d.capText, g.ml + 8, Y(d.cap) - 11, { align: 'left', px: fs - 1 });
        }

        /* pattern hints: outlier ring, cluster outlines */
        const dotR = clamp(p.w / 80, 4.5, 6.5);
        if (st.name) {
          (d.clusters || []).forEach(([cx, cy, rx, ry]) => {
            c.beginPath(); c.ellipse(X(cx), Y(cy), rx / d.xmax * g.pw, ry / d.ymax * g.ph, 0, 0, Math.PI * 2);
            c.fillStyle = alpha(pal.yellow, .09); c.fill(); c.strokeStyle = pal.yellow; c.lineWidth = 2; c.setLineDash([7, 5]); c.stroke(); c.setLineDash([]);
          });
          if (d.out != null) {
            const [ox, oy] = pts[d.out];
            c.beginPath(); c.arc(X(ox), Y(oy), dotR + 8, 0, Math.PI * 2); c.strokeStyle = pal.yellow; c.lineWidth = 2.5; c.stroke();
            T('outlier', X(ox) + dotR + 14, Y(oy), { align: 'left', color: pal.text });
          }
        }

        /* line of fit, misses (clipped to the plot) */
        const ys = x => st.m * x + st.b, keep = pts.map((_, i) => !(st.drop && i === d.out));
        if (st.line) {
          c.save(); c.beginPath(); c.rect(g.ml, g.mt - 2, g.pw + 2, g.ph + 4); c.clip();
          if (st.res) pts.forEach(([x, y], i) => { if (keep[i]) seg(X(x), Y(y), X(x), Y(ys(x)), alpha(pal.red, .85), 2.4); });
          seg(X(0), Y(ys(0)), X(d.xmax), Y(ys(d.xmax)), pal.blue, 3.6);
          c.restore();
        }

        /* the dots */
        pts.forEach(([x, y], i) => {
          c.beginPath(); c.arc(X(x), Y(y), dotR, 0, Math.PI * 2);
          if (keep[i]) { c.fillStyle = alpha(pal.text, .85); c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 2; c.stroke(); }
          else { c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.muted; c.lineWidth = 1.8; c.stroke(); }
        });

        if (st.line) {
          /* equation and average miss, in the top margin */
          const sub = incl(), ms = missOf(sub, st.m, st.b);
          T(linEq(st.m, st.b), 30, 40, { align: 'left', color: pal.blue, px: fs + 1 });
          T('average miss ' + d.fm(ms), p.w - 10, 40, { align: 'right', color: pal.red, px: fs + 1 });

          /* handles: b at the left end, m at the right end */
          const hb = [X(0), Y(clamp(st.b, 0, d.ymax))], hm = [X(d.xmax), Y(clamp(ys(d.xmax), 0, d.ymax))];
          [hb, hm].forEach(([hx, hy]) => { c.beginPath(); c.arc(hx, hy, 9.5, 0, Math.PI * 2); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.brass; c.lineWidth = 3.2; c.stroke(); });
          T('b', hb[0] + 20, hb[1] + (hb[1] - 18 < g.mt + 6 ? 18 : -16), { it: true, color: pal.text, px: fs });
          T('m', hm[0] - 20, hm[1] + (hm[1] - 18 < g.mt + 6 ? 18 : -16), { it: true, color: pal.text, px: fs });

          /* prediction guide */
          if (st.pred) {
            const gx = X(st.x), yv = ys(st.x), gy = clamp(Y(yv), g.mt, Y(0));
            seg(gx, Y(0), gx, gy, pal.yellow, 2.4, [6, 5]); seg(g.ml, gy, gx, gy, pal.yellow, 2.4, [6, 5]);
            c.beginPath(); c.moveTo(gx, Y(0) - 14); c.lineTo(gx - 8, Y(0) - 1); c.lineTo(gx + 8, Y(0) - 1); c.closePath();
            c.fillStyle = pal.yellow; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 1.5; c.stroke();
            c.beginPath(); c.arc(gx, gy, 7.5, 0, Math.PI * 2); c.fillStyle = pal.yellow; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 2.5; c.stroke();
            const txt = d.fx(st.x) + ' \u2192 ' + d.fy(yv), px = fs + 1;
            c.font = `500 ${px}px "Hanken Grotesk","Helvetica Neue",Arial,sans-serif`;
            const tw = c.measureText(txt).width + 16, room = Y(0) - gy > 96;
            const ty = room ? (Y(0) + gy) / 2 : gy - 24 > g.mt + 8 ? gy - 24 : gy + 24;   /* on the dashed guide, halfway down, where no dots are */
            const bx = clamp(gx - tw / 2, g.ml + 2, p.w - tw - 6);
            c.beginPath(); c.moveTo(bx + 12, ty - 12); c.arcTo(bx + tw, ty - 12, bx + tw, ty, 12); c.arcTo(bx + tw, ty + 12, bx + tw - 12, ty + 12, 12); c.arcTo(bx, ty + 12, bx, ty, 12); c.arcTo(bx, ty - 12, bx + 12, ty - 12, 12); c.closePath(); c.fillStyle = alpha(pal.stage, .94); c.fill(); c.strokeStyle = pal.yellow; c.lineWidth = 1.5; c.stroke();
            T(txt, bx + tw / 2, ty, { color: pal.text, px });
          }
        }
      };

      /* ---- controls ---- */
      const sel = C.select({ label: 'Dataset', value: st.ds, options: Object.entries(DS).map(([value, o]) => ({ value, label: o.label })),
        onChange: v => { cancel(); setDataset(v); sync(); } });
      const host = sel.parentElement.parentElement;
      C.title('Your line');
      let sl = {};
      const mk = (cfg, old) => { const s = C.slider(cfg), el = host.lastElementChild; if (old) host.replaceChild(el, old.el); return { s, el }; };
      const touch = key => { if (key === 'x') { if (!st.pred) setFlag('pred', true); } else if (!st.line) setFlag('line', true); };
      const edit = key => v => { cancel(); touch(key); st[key] = rnd(v); sync(); };
      const buildSliders = () => {
        const d = D();
        sl.m = mk({ label: `Slope m (${d.su})`, min: -d.mMax, max: d.mMax, step: d.mStep, value: st.m, format: v => num(v), onInput: edit('m') }, sl.m);
        sl.b = mk({ label: `Intercept b (${d.yu})`, min: 0, max: d.ymax, step: d.bStep, value: st.b, format: v => num(v), onInput: edit('b') }, sl.b);
        if (sl.x) sl.x = mk({ label: `Predict at x (${d.xu})`, min: 0, max: d.xmax, step: d.xStep, value: st.x, format: v => num(v), onInput: edit('x') }, sl.x);
      };
      buildSliders();
      C.buttons([
        { label: 'Show a good line', primary: true, onClick: () => { cancel(); setFlag('line', true); const f = lsq(incl()); cancel = animateTo(st, f, 900, sync); } },
        { label: 'Start over', onClick: () => { cancel(); setFlag('line', true); Object.assign(st, { m: 0, b: startB(D()) }); sync(); } }
      ]);
      const roA = C.readout();
      C.title('Show');
      const tg = {};
      const tog = (key, label) => { tg[key] = C.toggle({ label, value: st[key], onChange: v => { st[key] = v; sync(); } }); };
      tog('line', 'Line of fit and its handles'); tog('res', 'Misses (vertical gaps)'); tog('name', 'Name the pattern'); tog('drop', 'Leave out the outlier');
      const dropRow = tg.drop.parentElement;
      C.title('Predict');
      tog('pred', 'Prediction guide');
      sl.x = mk({ label: `Predict at x (${D().xu})`, min: 0, max: D().xmax, step: D().xStep, value: st.x, format: v => num(v), onInput: edit('x') });
      const setFlag = (k, v) => { st[k] = v; tg[k].checked = v; };
      const roB = C.readout();
      C.hint('Drag the two ringed handles, or use the sliders. The yellow guide reads a prediction off the line.');

      const setDataset = key => {
        st.ds = key; const d = D();
        setFlag('drop', false); dropRow.style.display = d.out == null ? 'none' : '';
        Object.assign(st, { m: 0, b: startB(d), x: d.x0 });
        sel.value = key; buildSliders();
      };
      dropRow.style.display = D().out == null ? 'none' : '';

      const upd = () => {
        const d = D(), sub = incl(), { m, b, x } = st, f = lsq(sub), base = baseOf(sub);
        const ms = missOf(sub, m, b), bs = missOf(sub, f.m, f.b), r = base > 0 ? ms / base : 0, rb = base > 0 ? bs / base : 0;
        const A = [], B = [];
        if (st.name) A.push(`<span class="k">Pattern</span> <b>${d.pattern}.</b> ${d.note}`);
        if (st.line) {
          A.push(`<span class="k">Your line</span> ${linEq(m, b)}`);
          A.push(`<span class="k">Average miss</span> ${d.fm(ms)} <span class="k">(a flat line at the average: ${d.fm(base)})</span>`);
          A.push(`<span class="k">Fit</span> ${verdict(r)}`);
          A.push(`<span class="k">Good line</span> ${linEq(f.m, f.b)}, average miss ${d.fm(bs)}.` + (rb >= .8 ? ' Even the good line is poor here, so a line is not a good model.' : ''));
          A.push(`<span class="k">Slope m = ${num(m)}.</span> ${d.slope(m)}`);
          A.push(`<span class="k">Intercept b = ${num(b)}.</span> ${d.inter(b)}`);
          if (st.pred) {
            const y = m * x + b, xs = d.pts.map(p => p[0]), notes = [];
            const eq = `${num(m)} × ${num(x)} ${b < 0 ? '−' : '+'} ${num(Math.abs(b))} = ${num(y)}`;
            if (x < Math.min(...xs) - 1e-9 || x > Math.max(...xs) + 1e-9) notes.push(`This is outside the data (${num(Math.min(...xs))} to ${num(Math.max(...xs))}), so it is extrapolation. Treat it with care.`);
            else if (d.gap && x > d.gap[0] && x < d.gap[1]) notes.push(`No dots lie between ${num(d.gap[0])} and ${num(d.gap[1])}, so this is a guess.`);
            if (d.cap && y > d.cap + 1e-9) notes.push(`The highest possible score is ${d.cap}, so the line fails here.`);
            if (d.floorText && y < -1e-9) notes.push(d.floorText + ', so the line fails here.');
            if (r >= .8) notes.push('This line fits poorly, so trust the prediction very little.');
            B.push(`<span class="k">At ${d.fx(x)}:</span> ${eq}, so about ${d.fy(y)}.` + (notes.length ? '<br>' + notes.join(' ') : ''));
          }
        }
        roA.innerHTML = A.join('<br>'); roA.style.display = A.length ? '' : 'none';
        roB.innerHTML = B.join('<br>'); roB.style.display = B.length ? '' : 'none';
      };
      const sync = () => { sl.m.s.set(st.m); sl.b.s.set(st.b); sl.x.s.set(st.x); P.draw(); upd(); };
      sync();

      draggable(P, {
        hit: (px, py) => {
          if (!st.line) return null;
          const d = D(), g = geo(P), ys = x => st.m * x + st.b;
          const hmx = g.X(d.xmax), hmy = g.Y(clamp(ys(d.xmax), 0, d.ymax));
          let gy = 0, onGuide = false;
          if (st.pred) { gy = clamp(g.Y(ys(st.x)), g.mt, g.Y(0)); onGuide = Math.abs(px - g.X(st.x)) < 16 && py > gy - 14 && py < g.Y(0) + 4; }
          if (onGuide && Math.hypot(g.X(st.x) - hmx, gy - hmy) < 6) return 'x';   /* guide and handle on top of each other: the guide wins */
          if (Math.hypot(px - hmx, py - hmy) < 20) return 'm';
          if (Math.hypot(px - g.X(0), py - g.Y(clamp(st.b, 0, d.ymax))) < 20) return 'b';
          return onGuide ? 'x' : null;
        },
        move: (hd, mx, my) => {
          cancel(); const d = D(), g = geo(P), px = P.X(mx), py = P.Y(my);
          if (hd === 'b') st.b = clamp(rnd(snap(g.iy(py), d.bStep)), 0, d.ymax);
          else if (hd === 'm') st.m = clamp(rnd(snap((clamp(g.iy(py), 0, d.ymax) - st.b) / d.xmax, d.mStep)), -d.mMax, d.mMax);
          else st.x = clamp(rnd(snap(g.ix(px), d.xStep)), 0, d.xmax);
          sync();
        }
      });

      /* the plane's math-unit pointer readout would be wrong for these axes (and sits on the tick numbers), so hide it */
      if (P.coordEl) P.coordEl.style.display = 'none';

      const apply = (patch, immediate) => {
        cancel();
        const { ds, line, res, pred, name, drop, ...rest } = patch;
        if (ds !== undefined && ds !== st.ds) setDataset(ds);
        for (const [k, v] of Object.entries({ line, res, pred, name, drop })) if (v !== undefined) setFlag(k, v);
        if (immediate) { Object.assign(st, rest); sync(); } else cancel = animateTo(st, rest, 900, sync);
      };
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
