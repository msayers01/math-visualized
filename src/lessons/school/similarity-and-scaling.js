/* =====================================================================
   SCHOOL — Similarity and scaling
   ===================================================================== */
register({
  id: 'similarity-and-scaling', level: 'school',
  title: 'Similarity and scaling',
  blurb: 'Zoom a shape from a point and see lengths scale by k while areas scale by k².',
  thumb(c, p) {
    const pal = p.pal; p.cx = 2.5; p.cy = 2; p.span = 4.4;
    p.grid(1, { axes: false });
    const T = [[1, .5], [2.5, .5], [1, 2.5]], k = 2, im = T.map(([x, y]) => [k * x, k * y]);
    for (let i = 0; i < 3; i++) p.path([[0, 0], im[i]], { stroke: pal['grid-strong'], width: 1.2, dash: [4, 4] });
    p.path(im, { fill: alpha(pal.yellow, .25), stroke: pal.yellow, width: 2, close: true });
    p.path(T, { fill: alpha(pal.blue, .35), stroke: pal.blue, width: 2, close: true });
    p.dot(0, 0, 4.5, pal.stage, pal.brass, 2);
  },
  hook: String.raw`Double every length of a photo and its area does not double. It quadruples. Why, and what stays the same when a shape is scaled?`,
  steps: [
    { title: 'Zoom from a point',
      text: String.raw`<p>Point \(O\) is the center. Every point of the blue triangle moves along a ray from \(O\), to \(k\) times its distance. With \(k=1.5\) we get the yellow triangle.</p><p>Drag \(O\) or the triangle's corners, and try the <b>Scale factor</b> slider.</p>`,
      set: { shape: 'tri', k: 1.5, ox: 0, oy: 0 } },
    { title: 'Lengths scale by k',
      text: String.raw`<p>With \(k=2\), every side of the yellow triangle is exactly twice as long as its partner. The readout lists all three.</p><p>The angles do not change at all. Same angles with proportional sides is what <b>similar</b> means.</p>`,
      set: { shape: 'tri', k: 2, ox: 0, oy: 0 } },
    { title: 'Areas scale by k²',
      text: String.raw`<p>Switch to a square and set \(k=3\). Each side is \(3\) times as long, and the big square holds \(3\times3=9\) copies of the small one.</p><p>Area scales by \(k^2\), not \(k\).</p>`,
      set: { shape: 'sq', k: 3, ox: 0, oy: 0 } },
    { title: 'Shrinking, and flipping',
      text: String.raw`<p>A factor between \(0\) and \(1\) shrinks the shape, like a model or a map. Try \(k=0.5\): lengths halve, area drops to a quarter.</p><p>A negative \(k\) puts the image on the other side of \(O\), turned upside down.</p>`,
      set: { shape: 'tri', k: .5, ox: 0, oy: 0 } }
  ],
  formal: String.raw`
    <p>A <em>dilation</em> with center \(O\) and scale factor \(k\) sends each point \(P\) to
    \[ P' = O + k\,(P-O). \]
    Two figures are <em>similar</em> if one is a dilation of the other, possibly after moving or turning it.</p>
    <h3>What scales by what</h3>
    <p>
    <b>Angles</b> stay the same.<br>
    <b>Lengths</b> are multiplied by \(|k|\).<br>
    <b>Areas</b> are multiplied by \(k^2\).<br>
    <b>Volumes</b> are multiplied by \(|k|^3\).</p>
    <p>For a square with side \(s\): the area goes from \(s^2\) to \((ks)^2=k^2s^2\). Similarly doubling every edge of a cube gives \(2^3=8\) times the volume.</p>
    <h3>Similar triangles</h3>
    <p>Two triangles are similar if two of their angles match (the third then matches too). Then all three side ratios are equal:
    \[ \frac{A'B'}{AB}=\frac{B'C'}{BC}=\frac{C'A'}{CA}=|k|. \]
    This lets you find a height you cannot measure directly: a tree's shadow and a stick's shadow, taken at the same time of day, form similar triangles.</p>`,
  check: [
    { q: 'A photo is enlarged with scale factor 3. The original has area 10 cm². What is the area of the enlargement?',
      choices: ['30 cm²', '60 cm²', '90 cm²', '1000 cm²'], answer: 2,
      why: String.raw`Area scales by \(k^2 = 9\), so the new area is \(10\times9=90\ \text{cm}^2\).`,
      hint: String.raw`Lengths scale by \(k\), but area scales by \(k^2\).` },
    { q: 'Two triangles have the same three angles. The first has sides 4, 6 and 8. The shortest side of the second is 6. How long is its longest side?',
      choices: ['9', '12', '14', '8'], answer: 1,
      why: String.raw`The scale factor is \(6/4=1.5\), so the longest side is \(8\times1.5=12\).`,
      hint: 'Find the scale factor from the two shortest sides first.' }
  ],
  links: { prereq: ['pythagorean-theorem'], next: ['inscribed-angles', 'the-unit-circle-and-trig-waves'], related: ['area-of-a-circle', 'linear-transformations'] },

  mount({ stage, controls: C }) {
    const st = { k: 1.5, ox: 0, oy: 0 };
    let cancel = () => {}, shape = 'tri';
    const V = [[1, .5], [2.5, .5], [1, 2.5]], SQ = [[1, .5], [2.5, .5], [2.5, 2], [1, 2]], NAMES = ['A', 'B', 'C', 'D'];
    const P = new Plane(stage, { cx: 1, cy: 1, span: 9 });
    const pts = () => shape === 'tri' ? V : SQ;
    const img = ([x, y]) => [st.ox + st.k * (x - st.ox), st.oy + st.k * (y - st.oy)];
    const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    const area = q => Math.abs(q.reduce((s, [x, y], i) => s + x * q[(i + 1) % q.length][1] - q[(i + 1) % q.length][0] * y, 0)) / 2;
    const angleAt = (q, i) => {
      const a = q[i], b = q[(i + 1) % q.length], d = q[(i + q.length - 1) % q.length];
      const u = [b[0] - a[0], b[1] - a[1]], w = [d[0] - a[0], d[1] - a[1]], m = Math.hypot(...u) * Math.hypot(...w);
      return m < 1e-9 ? 0 : Math.acos(clamp((u[0] * w[0] + u[1] * w[1]) / m, -1, 1)) * 180 / Math.PI;
    };

    P.onDraw = (c, p) => {
      const pal = p.pal, q = pts(), im = q.map(img), O = [st.ox, st.oy];
      p.grid(1); p.ticks(2);
      for (let i = 0; i < q.length; i++) p.path([O, im[i]], { stroke: pal['grid-strong'], width: 1.4, dash: [5, 6] });
      p.path(im, { fill: alpha(pal.yellow, .22), stroke: pal.yellow, width: 3, close: true });
      if (shape === 'sq' && Math.abs(st.k) >= 2 && Math.abs(Math.abs(st.k) - Math.round(Math.abs(st.k))) < .01) {
        const xs = im.map(v => v[0]), ys = im.map(v => v[1]), x0 = Math.min(...xs), y0 = Math.min(...ys), s = 1.5, K = Math.round(Math.abs(st.k));
        for (let j = 1; j < K; j++) {
          p.path([[x0 + j * s, y0], [x0 + j * s, y0 + K * s]], { stroke: alpha(pal.yellow, .85), width: 1.5 });
          p.path([[x0, y0 + j * s], [x0 + K * s, y0 + j * s]], { stroke: alpha(pal.yellow, .85), width: 1.5 });
        }
      }
      p.path(q, { fill: alpha(pal.blue, .32), stroke: pal.blue, width: 3, close: true });
      const cen = q.reduce((s, v) => [s[0] + v[0] / q.length, s[1] + v[1] / q.length], [0, 0]);
      const cim = img(cen), lab = (pt, text, col, ctr) => {
        const dx = pt[0] - ctr[0], dy = pt[1] - ctr[1], m = Math.hypot(dx, dy) || 1;
        p.label(text, pt[0], pt[1], { size: 20, color: col, dx: dx / m * 20, dy: -dy / m * 20 });
      };
      q.forEach((v, i) => { lab(v, NAMES[i], pal.blue, cen); lab(im[i], NAMES[i] + '′', pal.yellow, cim); });
      if (shape === 'tri') q.forEach(v => p.dot(v[0], v[1], 7, pal.stage, pal.brass, 3));
      p.dot(O[0], O[1], 8, pal.brass, pal.stage, 2.5);
      p.label('O', O[0], O[1], { size: 20, dx: -16, dy: 16 });
    };

    const upd = () => {
      const q = pts(), im = q.map(img), k = Math.abs(st.k), n = q.length, f = v => v.toFixed(2);
      const sides = q.map((v, i) => `${f(dist(v, q[(i + 1) % n]))} → ${f(dist(im[i], im[(i + 1) % n]))}`).join(' · ');
      const a0 = area(q), a1 = area(im);
      ro.innerHTML = `<span class="k">Scale factor</span> k = ${num(st.k)} &nbsp; <span class="k">Center O</span> (${num(st.ox)}, ${num(st.oy)})<br><span class="k">Sides</span> ${shape === 'tri' ? sides : sides.split(' · ')[0] + ' (all four)'}<br>` +
        (shape === 'tri' ? `<span class="k">Angles</span> ${[0, 1, 2].map(i => Math.round(angleAt(q, i)) + '°').join(' · ')} (same on both)<br>` : '') +
        `<span class="k">Lengths</span> × ${num(k)}<br><span class="k">Area</span> ${f(a0)} → ${f(a1)} (× ${num(k * k)} = k²)`;
    };
    const sync = () => { kS.set(st.k); P.draw(); upd(); };

    const sel = C.select({ label: 'Shape', value: shape, options: [{ value: 'tri', label: 'Triangle' }, { value: 'sq', label: 'Square' }],
      onChange: v => { cancel(); shape = v; sync(); } });
    C.title('Dilation');
    const kS = C.slider({ label: 'Scale factor k', min: -3, max: 3, step: .25, value: st.k, format: v => num(v), onInput: v => { cancel(); st.k = v; P.requestDraw(); upd(); } });
    const ro = C.readout(); upd();
    C.hint('Drag O, or (for the triangle) its blue corners.');

    draggable(P, {
      hit: (px, py) => {
        let best = null, bd = 18;
        const cand = [['o', st.ox, st.oy], ...(shape === 'tri' ? V.map((v, i) => ['v' + i, v[0], v[1]]) : [])];
        for (const [id, x, y] of cand) { const d = Math.hypot(P.X(x) - px, P.Y(y) - py); if (d < bd) { bd = d; best = id; } }
        return best;
      },
      move: (hd, x, y) => {
        cancel();
        const sx = clamp(snap(x, .25), -5, 5), sy = clamp(snap(y, .25), -5, 5);
        if (hd === 'o') { st.ox = sx; st.oy = sy; } else V[+hd[1]] = [sx, sy];
        sync();
      }
    });

    const apply = (patch, immediate) => {
      cancel();
      const { shape: sh, ...rest } = patch;
      if (sh !== undefined) { shape = sh; sel.value = sh; }
      if (immediate) { Object.assign(st, rest); sync(); } else cancel = animateTo(st, rest, 900, sync);
    };
    return { destroy: () => { cancel(); P.destroy(); }, apply };
  }
});
