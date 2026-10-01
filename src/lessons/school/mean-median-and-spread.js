/* =====================================================================
   SCHOOL — Mean, median, and spread
   ===================================================================== */
{
  const SETS = {
    sym:    [8, 9, 9, 10, 10, 10, 11, 11, 12],
    out:    [8, 9, 9, 10, 10, 10, 11, 11, 20],
    wide:   [4, 6, 8, 10, 10, 10, 12, 14, 16],
    skewed: [5, 6, 6, 7, 7, 8, 10, 14, 17]
  };
  const MAXV = 20;
  const stats = v => {
    const n = v.length, s = [...v].sort((x, y) => x - y), mean = v.reduce((a, b) => a + b, 0) / n;
    const med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
    return { n, mean, med, min: s[0], max: s[n - 1], sd: Math.sqrt(v.reduce((a, b) => a + (b - mean) * (b - mean), 0) / n) };
  };

  register({
    id: 'mean-median-and-spread', level: 'school',
    title: 'Mean, median, and spread',
    blurb: 'Drag dots on a number line and watch the mean, median and standard deviation respond.',
    thumb(c, p) {
      const pal = p.pal, v = SETS.sym, st = stats(v), cnt = {}; p.cx = 10; p.cy = 2.2; p.span = 5.3;
      p.path([[4, 0], [16, 0]], { stroke: pal['grid-strong'], width: 1.6 });
      v.forEach(x => { const l = cnt[x] = (cnt[x] || 0) + 1; p.dot(x, .55 + (l - 1) * 1.1, 4.2, alpha(pal.blue, .85), pal.stage, 1); });
      p.path([[st.mean, 0], [st.mean - .7, -1.2], [st.mean + .7, -1.2]], { fill: pal.yellow, close: true });
    },
    hook: String.raw`Two classes both average 70% on a test. In one, everyone scored close to 70. In the other, half scored 40 and half scored 100. What number tells them apart?`,
    steps: [
      { title: 'Center: mean and median',
        text: String.raw`<p>Nine values sit on a number line. The <b>mean</b> (yellow triangle) is the balance point: add them up and divide by \(9\). The <b>median</b> (violet line) is the middle value when they are sorted.</p><p>Here both are \(10\).</p>`,
        set: { data: SETS.sym } },
      { title: 'One outlier',
        text: String.raw`<p>The largest value jumps from \(12\) to \(20\). The mean is pulled right to about \(10.9\) because it uses every value's size. The median stays at \(10\) because it only cares about order.</p><p>That is why median income is quoted instead of mean income.</p>`,
        set: { data: SETS.out } },
      { title: 'Spread: standard deviation',
        text: String.raw`<p>This set has the same mean and median as the first, \(10\) and \(10\), but the values are far more scattered.</p><p>The <b>standard deviation</b> \(\sigma\) measures a typical distance from the mean. The green band shows the mean \(\pm\,\sigma\). It grows from \(1.2\) to about \(3.5\).</p>`,
        set: { data: SETS.wide } },
      { title: 'Skew: mean above median',
        text: String.raw`<p>A long tail on the right drags the mean above the median: about \(8.9\) against \(7\).</p><p>Now drag the dots yourself. Move one dot far away and see which numbers react.</p>`,
        set: { data: SETS.skewed } }
    ],
    formal: String.raw`
      <p>Take a list of \(n\) numbers \(x_1,\ldots,x_n\).</p>
      <h3>Center</h3>
      <p>
      The <b>mean</b> is \(\mu=\dfrac{x_1+\cdots+x_n}{n}\). It is the balance point: the signed distances \(x_i-\mu\) always add to \(0\).<br>
      The <b>median</b> is the middle value of the sorted list, or the average of the two middle values when \(n\) is even.</p>
      <h3>Spread</h3>
      <p>
      The <b>range</b> is largest minus smallest.<br>
      The <b>standard deviation</b> is
      \[ \sigma=\sqrt{\frac{(x_1-\mu)^2+\cdots+(x_n-\mu)^2}{n}}. \]
      Squaring makes every distance positive and lets far-away values count more. (When the list is a sample from a larger group, statisticians divide by \(n-1\) instead of \(n\).)</p>
      <h3>Which one to use?</h3>
      <p>For symmetric data the mean and median agree. When data is skewed or has outliers, the median describes a typical value better, because the mean follows the tail. Always report a spread alongside the center: the same mean can hide very different data.</p>`,
    check: [
      { q: 'The data set is 2, 3, 3, 4, 18. Which statement is true?',
        choices: ['The mean is larger than the median', 'The median is larger than the mean', 'They are equal', 'The mean is 3'], answer: 0,
        why: String.raw`The mean is \((2+3+3+4+18)/5=6\). The median is the middle value, \(3\). The outlier \(18\) pulls the mean up.`,
        hint: 'Compute both. Which one does the outlier affect?' },
      { q: String.raw`Data sets X and Y have the same mean. X has \(\sigma=1.2\) and Y has \(\sigma=3.5\). What does that tell you?`,
        choices: ['Y has more values', 'Y\'s values are more spread out from the mean', 'X\'s median is larger', 'X has an outlier'], answer: 1,
        why: String.raw`A larger standard deviation means a larger typical distance from the mean, so Y is more spread out.`,
        hint: 'The standard deviation is a typical distance from the mean.' }
    ],
    links: { prereq: ['slope-and-linear-functions'], next: ['probability-with-repeated-trials'], related: ['pascals-triangle-and-the-galton-board'] },

    mount({ stage, controls: C }) {
      const st = { v: [...SETS.sym] };
      let cancel = () => {}, showMean = true, showMed = true, showSd = true;
      const P = new Plane(stage, { span: 6 });
      const lay = p => {
        const r = clamp(p.scale * .4, 6, 16), u = r / p.scale, cnt = {};
        return st.v.map((v, i) => {
          const bin = Math.round(v), l = cnt[bin] = (cnt[bin] || 0) + 1;
          return { i, x: v, y: u * 1.3 + (l - 1) * u * 2.15, r };
        });
      };

      P.onDraw = (c, p) => {
        p.fit(MAXV, 8, { l: 1, r: 1, t: .6, b: 3.2 });
        const pal = p.pal, S = stats(st.v), fs = clamp(p.scale * .4, 13, 17);
        if (showSd) {
          c.fillStyle = alpha(pal.green, .13); const x0 = p.X(S.mean - S.sd), x1 = p.X(S.mean + S.sd); c.fillRect(x0, p.Y(8), x1 - x0, p.Y(0) - p.Y(8));
        }
        for (let x = 0; x <= MAXV; x++) {
          p.path([[x, 0], [x, -.28]], { stroke: pal['grid-strong'], width: 1.5 });
          if (x % 2 === 0) p.label(String(x), x, -.28, { size: fs + 3, italic: false, color: pal.muted, dy: 14 });
        }
        p.path([[-.4, 0], [MAXV + .4, 0]], { stroke: pal['grid-strong'], width: 2 });
        if (showMed) {
          p.path([[S.med, 0], [S.med, 8]], { stroke: pal.violet, width: 2.5, dash: [8, 6] });
          p.label('median ' + num(S.med), S.med, 8, { size: fs + 3, italic: false, color: pal.violet, dy: -2 });
        }
        for (const d of lay(p)) p.dot(d.x, d.y, d.r, alpha(pal.blue, .85), pal.stage, 2);
        if (showMean) {
          const m = S.mean, w = .5;
          p.path([[m, -.9], [m - w, -1.7], [m + w, -1.7]], { fill: pal.yellow, stroke: pal.yellow, width: 1, close: true });
          p.label('mean ' + num(m), m, -1.7, { size: fs + 3, italic: false, color: pal.yellow, dy: 16 });
        }
        if (showSd) {
          const y = -2.7, a = S.mean - S.sd, b = S.mean + S.sd;
          p.path([[a, y], [b, y]], { stroke: pal.green, width: 3 });
          p.path([[a, y - .2], [a, y + .2]], { stroke: pal.green, width: 3 }); p.path([[b, y - .2], [b, y + .2]], { stroke: pal.green, width: 3 });
          p.label('σ = ' + num(S.sd), S.mean, y, { size: fs + 3, italic: false, color: pal.green, dy: 16 });
        }
      };

      const upd = () => {
        const S = stats(st.v);
        ro.innerHTML = `<span class="k">Values</span> n = ${S.n}<br><span class="k">Mean</span> ${num(S.mean)} &nbsp; <span class="k">Median</span> ${num(S.med)}<br>` +
          `<span class="k">Range</span> ${num(S.max - S.min)} (${num(S.min)} to ${num(S.max)})<br><span class="k">Std deviation σ</span> ${num(S.sd)}`;
      };
      const sync = () => { P.draw(); upd(); };
      const setData = (arr, immediate) => {
        cancel();
        if (immediate || reduceMotion || arr.length !== st.v.length) { st.v = [...arr]; sync(); return; }
        const from = [...st.v];
        cancel = tween(900, q => { const e = ease(q); st.v = from.map((x, i) => lerp(x, arr[i], e)); sync(); });
      };

      C.title('Data');
      C.buttons([
        { label: 'Add a point', onClick: () => { if (st.v.length < 15) { cancel(); st.v = [...st.v, Math.round(stats(st.v).med)]; sync(); } } },
        { label: 'Remove a point', onClick: () => { if (st.v.length > 3) { cancel(); st.v = st.v.slice(0, -1); sync(); } } }
      ]);
      C.buttons([
        { label: 'Symmetric', onClick: () => setData(SETS.sym) }, { label: 'Outlier', onClick: () => setData(SETS.out) },
        { label: 'Wide', onClick: () => setData(SETS.wide) }, { label: 'Skewed', onClick: () => setData(SETS.skewed) }
      ]);
      C.title('Show');
      C.toggle({ label: 'Mean (balance point)', value: true, onChange: v => { showMean = v; P.draw(); } });
      C.toggle({ label: 'Median', value: true, onChange: v => { showMed = v; P.draw(); } });
      C.toggle({ label: 'Standard deviation band', value: true, onChange: v => { showSd = v; P.draw(); } });
      const ro = C.readout(); upd();
      C.hint('Drag any dot left or right. Values snap to whole numbers from 0 to 20.');

      draggable(P, {
        hit: (px, py) => {
          let best = null, bd = 18;
          for (const d of lay(P)) { const dist = Math.hypot(P.X(d.x) - px, P.Y(d.y) - py); if (dist <= bd) { bd = dist; best = d.i; } }
          return best;
        },
        move: (i, x) => { cancel(); st.v = st.v.map((v, k) => k === i ? clamp(Math.round(x), 0, MAXV) : v); sync(); }
      });

      const apply = (patch, immediate) => { if (patch.data) setData(patch.data, immediate); };
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
