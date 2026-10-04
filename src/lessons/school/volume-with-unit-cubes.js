/* =====================================================================
   SCHOOL — Volume with unit cubes
   ===================================================================== */
{
  const FONT = '"Hanken Grotesk","Helvetica Neue",Arial,sans-serif';
  const CS = .866;                                  /* cos 30 degrees, for the isometric view */
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const gr = t => `<b style="color:var(--green)">${t}</b>`;
  const rd = t => `<b style="color:var(--red)">${t}</b>`;
  const vi = t => `<b style="color:var(--violet)">${t}</b>`;
  const rgbOf = hex => { const m = hex.replace('#', ''); return [0, 2, 4].map(i => parseInt(m.slice(i, i + 2), 16)); };
  const tone = (hex, b) => {
    const c = rgbOf(hex), t = b < 1 ? 0 : 255, k = b < 1 ? 1 - b : b - 1;
    return 'rgb(' + c.map(v => Math.round(v + (t - v) * k)).join(',') + ')';
  };
  const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');

  /* ---------- figures made of unit cubes: g[row][column] = how many cubes are stacked there ---------- */
  const FIGS = [
    { name: 'Stairs', g: [[1, 2, 3]] },
    { name: 'L shape', g: [[2, 1, 1], [1, 0, 0]] },
    { name: 'Plus sign', g: [[0, 1, 0], [1, 2, 1], [0, 1, 0]] },
    { name: 'U shape', g: [[2, 0, 2], [2, 2, 2]] },
    { name: 'Row of 4', g: [[1, 1, 1, 1]] },
    { name: 'Square of 4', g: [[1, 1], [1, 1]] }
  ];
  const SIDES = ['Top', 'Front', 'Right', 'Left', 'Back', 'Bottom'];
  const VEC = { Right: [1, 0], Front: [0, 1], Left: [-1, 0], Back: [0, -1] };
  const gh = (g, i, j) => (g[j] && g[j][i]) || 0;
  const fMaxH = g => Math.max(...g.map(r => Math.max(...r)));
  const fVol = g => g.reduce((s, r) => s + r.reduce((a, b) => a + b, 0), 0);
  const fDims = g => [Math.max(...g.map(r => r.length)), g.length];
  /* number of outside faces on each side. Cubes touching each other hide their shared faces. */
  const fCount = g => {
    const d = { Top: 0, Bottom: 0, Right: 0, Front: 0, Left: 0, Back: 0 };
    for (let j = 0; j < g.length; j++) for (let i = 0; i < g[j].length; i++) {
      const ht = gh(g, i, j); if (!ht) continue;
      d.Top++; d.Bottom++;
      for (const k of Object.keys(VEC)) d[k] += Math.max(0, ht - gh(g, i + VEC[k][0], j + VEC[k][1]));
    }
    return d;
  };
  const fSA = g => Object.values(fCount(g)).reduce((a, b) => a + b, 0);
  const layerCount = (g, z) => g.reduce((s, r) => s + r.filter(x => x > z).length, 0);
  /* turning the figure a quarter turn at a time */
  const rotv = (d, r) => { let a = d[0], b = d[1]; for (let t = 0; t < r; t++) [a, b] = [-b, a]; return [a, b]; };
  const rotc = (i, j, n, m, r) => { for (let t = 0; t < r; t++) { const ni = m - 1 - j; j = i; i = ni; const nn = m; m = n; n = nn; } return [i, j, n, m]; };
  /* which original side is on the screen's right face (1,0) or left face (0,1) after r turns */
  const sideOn = (v, r) => Object.keys(VEC).find(k => { const q = rotv(VEC[k], r); return q[0] === v[0] && q[1] === v[1]; });
  const visible = (side, r) => side === 'Top' || (side !== 'Bottom' && !!(() => { const q = rotv(VEC[side], r); return (q[0] === 1 && q[1] === 0) || (q[0] === 0 && q[1] === 1); })());

  /* ---------- practice problems (a fixed list) ---------- */
  const PR = [
    { kind: 'mc', sc: { mode: 'box', l: 3, w: 2, h: 4, k: 1 },
      q: 'This box is 3 long, 2 wide and 4 tall. The first layer is packed. How many cubes are in one layer?',
      ch: [['5', '5 is 3 + 2. Cubes fill the floor in rows, so multiply: 3 rows of 2 is 3 × 2.'],
           ['6', '3 × 2 = 6. One layer is the floor of the box: length times width.'],
           ['24', '24 is the whole box, 3 × 2 × 4. One layer is only the floor, 3 × 2 = 6.'],
           ['12', '12 is 3 × 4. That uses the height. A layer is flat, so use the length and the width: 3 × 2.']], ans: 1 },
    { kind: 'mc', sc: { mode: 'box', l: 4, w: 3, h: 2, k: 2 },
      q: 'What is the volume of this box in cubic units?',
      ch: [['9', '9 is 4 + 3 + 2. Adding the edges does not count cubes. Multiply: 4 × 3 × 2.'],
           ['12', '12 is one layer, 4 × 3. The box has 2 layers, so the volume is 2 × 12.'],
           ['24', '4 × 3 = 12 cubes in a layer. 2 layers make 2 × 12 = 24 cubic units.'],
           ['14', '14 is 12 + 2. Do not add the height. Multiply the layer, 12, by the 2 layers.']], ans: 2 },
    { kind: 'build', sc: { mode: 'box', l: 2, w: 2, h: 1, k: 1 },
      q: 'Build a box that is 2 tall and holds exactly 12 cubes. Set the three sliders. Then press Check.',
      check: st => {
        const vol = st.l * st.w * st.h;
        if (st.h !== 2) return { ok: false, msg: `Your box is ${st.h} tall. It must be 2 tall.` };
        if (vol !== 12) return { ok: false, msg: `Your box holds ${st.l} × ${st.w} × 2 = ${vol} cubes. The base must hold 12 ÷ 2 = 6 cubes. A base of 3 × 2 or 6 × 1 works.` };
        return { ok: true, msg: `${st.l} × ${st.w} = ${st.l * st.w} cubes in a layer. 2 layers make ${vol}. A base of 6 can be 3 × 2, 2 × 3, 6 × 1 or 1 × 6. All of them work.` };
      } },
    { kind: 'layers', sc: { mode: 'box', l: 5, w: 2, h: 6, k: 0 },
      q: 'Each layer of this box holds 5 × 2 = 10 cubes. Add layers until the box holds 40 cubes. Then press Check.',
      check: st => {
        const n = st.k * 10;
        if (n === 40) return { ok: true, msg: '4 layers × 10 cubes = 40 cubes. You can also divide: 40 ÷ 10 = 4 layers.' };
        if (n < 40) return { ok: false, msg: `You have ${plural(st.k, 'layer')}, which is ${n} cubes. You need ${40 - n} more. That is ${plural((40 - n) / 10, 'more layer')}.` };
        return { ok: false, msg: `You have ${st.k} layers, which is ${n} cubes. That is too many. Take away ${plural((n - 40) / 10, 'layer')}.` };
      } },
    { kind: 'mc', sc: { mode: 'box', l: 4, w: 3, h: 1, k: 1, hideH: true },
      q: 'The base of a box is 4 × 3, as shown. The box holds 36 cubes. How many layers tall is it?',
      ch: [['3 layers', 'One layer is 12 cubes. 12 × 3 = 36, so the box is 3 tall. You can check with division: 36 ÷ 12 = 3.'],
           ['24', '24 is 36 − 12. Subtracting does not find layers. Ask: how many 12s make 36?'],
           ['9', '9 is 36 ÷ 4. Divide by the whole layer, 12, not only the length.'],
           ['12', '12 is the cubes in one layer, not the number of layers. How many layers of 12 make 36?']], ans: 0 },
    { kind: 'mc', sc: { mode: 'fig', fig: 3, fk: 2, rot: 0 },
      q: 'This figure is made of unit cubes. It is 2 layers high and has an empty gap. How many unit cubes does it have?',
      ch: [['5', '5 is only one layer. Both layers have 5 cubes.'],
           ['12', '12 counts the empty gap. There are 6 spots, but one is empty.'],
           ['8', '8 is too few. Count each layer: both have 5 cubes.'],
           ['10', 'One layer has 5 cubes. Two layers make 5 + 5 = 10 cubic units.']], ans: 3 },
    { kind: 'mc', sc: { mode: 'fig', fig: 5, fk: 1, rot: 0 },
      q: 'Four cubes make a 2 × 2 square, one layer. What is its surface area in square units? Count every outside face, hidden ones too.',
      ch: [['24', '24 is 4 cubes × 6 faces. But faces where cubes touch are inside, so they do not count.'],
           ['16', 'Top 4 + bottom 4 + four sides with 2 faces each (8) = 16 square units.'],
           ['4', '4 is only the top. The bottom and the four sides count too.'],
           ['8', '8 is top and bottom. The four sides count too: 4 sides × 2 faces = 8 more.']], ans: 1 },
    { kind: 'mc', sc: { mode: 'fig', fig: 0, fk: 3, rot: 0 },
      q: 'Stairs has 24 faces on the outside. This view shows only the Top, Front and Right sides. How many faces are hidden in this view?',
      ch: [['3', '3 is the Bottom only. The Back (6 faces) and the Left (3 faces) are hidden too.'],
           ['9', '9 is Back 6 + Bottom 3. You forgot the Left side, 3 faces.'],
           ['12', 'Back 6 + Left 3 + Bottom 3 = 12 hidden. Visible: Top 3 + Front 6 + Right 3 = 12. 12 + 12 = 24.'],
           ['6', '6 is the Back only. The Left and the Bottom are hidden too.']], ans: 2 }
  ];

  register({
    id: 'volume-with-unit-cubes', level: 'school',
    title: 'Volume with unit cubes',
    blurb: 'Pack a box with unit cubes, layer by layer, and see why volume is length × width × height.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 3.3;
      const P = (x, y, z) => [(x - y) * CS - .43, -(x + y) * .5 + z + .25];
      const cubes = [];
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) cubes.push([i, j, k]);
      cubes.sort((a, b) => (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]));
      const st = { stroke: alpha(pal.text, .55), width: 1.5, close: true };
      for (const [i, j, k] of cubes) {
        p.path([P(i, j, k + 1), P(i + 1, j, k + 1), P(i + 1, j + 1, k + 1), P(i, j + 1, k + 1)], Object.assign({ fill: alpha(pal.yellow, .5) }, st));
        p.path([P(i, j + 1, k), P(i + 1, j + 1, k), P(i + 1, j + 1, k + 1), P(i, j + 1, k + 1)], Object.assign({ fill: alpha(pal.blue, .42) }, st));
        p.path([P(i + 1, j, k), P(i + 1, j + 1, k), P(i + 1, j + 1, k + 1), P(i + 1, j, k + 1)], Object.assign({ fill: alpha(pal.blue, .7) }, st));
      }
    },
    hook: 'How many sugar cubes fit in a box? Can you find out without counting every single cube?',
    steps: [
      { title: 'The unit cube',
        text: String.raw`<p>Picture a sugar cube or a small toy block. Every edge is 1 unit long. This is a <b>unit cube</b>.</p><p>A unit cube takes up <b>one cubic unit</b> of space. We find <b>volume</b> by counting unit cubes.</p><p>Slide the box longer. How many unit cubes does it hold now?</p>`,
        set: { mode: 'box', l: 1, w: 1, h: 1, k: 1, pred: 0 } },
      { title: 'Pack one layer',
        text: String.raw`<p>This box is 4 long and 3 wide. Pack the floor first. That flat row of cubes is one <b>layer</b>.</p><p>One layer holds 4 × 3 = 12 cubes. The box is 2 tall, so it has 2 layers. Press <b>Add a layer</b>. The count goes to 12 + 12 = 24 cubic units.</p>`,
        set: { mode: 'box', l: 4, w: 3, h: 2, k: 1, pred: 0 } },
      { title: 'Predict, then see',
        text: String.raw`<p>This box is 5 long, 2 wide and 3 tall. Guess how many unit cubes fill it.</p><p>Pick your guess in the panel. Then the layers drop in, one by one. Count them layer by layer, then try length × width × height.</p>`,
        set: { mode: 'box', l: 5, w: 2, h: 3, k: 0, pred: 1 } },
      { title: 'Figures that are not boxes',
        text: String.raw`<p>This figure is made of unit cubes, but it is not a box. Its volume is the number of cubes. Add the layers: 3 + 2 + 1.</p><p><b>Surface area</b> counts the faces on the outside. Each face is 1 square unit. Press each side to count it. Back, Left and Bottom are hidden. Turn the figure to see them.</p>`,
        set: { mode: 'fig', fig: 0, fk: 3, rot: 0, pred: 0 } }
    ],
    formal: String.raw`
      <h3>The unit cube</h3>
      <p>A <em>unit cube</em> is a cube with a side length of 1 unit. It has a volume of <em>one cubic unit</em>. If the unit is 1 centimeter, one cubic unit is one cubic centimeter. Volume tells how much space a solid takes up. We measure it by counting unit cubes.</p>
      <h3>Packing a box</h3>
      <p>Take a box that is 4 units long, 3 units wide and 2 units tall. Pack the floor with unit cubes. There are 3 rows of 4 cubes, so one layer has 4 × 3 = 12 cubes. That number is the area of the base. The box is 2 units tall, so it holds 2 layers. The volume is 2 × 12 = 24 cubic units.</p>
      <h3>Why length × width × height works</h3>
      <p>The cubes in one layer are in rows and columns, so the cubes in a layer are length × width. Every layer is the same. The number of layers is the height, because each layer is 1 unit thick. So volume = (cubes in a layer) × (number of layers).</p>
      <p>That gives two ways to write the same number. <b>Length × width × height</b> is 4 × 3 × 2 = 24. <b>Height × area of the base</b> is 2 × 12 = 24. They always match, because the area of the base is length × width.</p>
      <h3>Figures made of cubes</h3>
      <p>A figure built from unit cubes does not have to be a box. Its volume is still the number of cubes. You can count layer by layer, or tower by tower. For the stairs, the layers hold 3, 2 and 1 cubes. 3 + 2 + 1 = 6 cubic units. The towers hold 1, 2 and 3 cubes. 1 + 2 + 3 = 6. Same answer.</p>
      <h3>Surface area of a figure</h3>
      <p>Surface area is the number of unit faces on the outside of the figure. Each face is a square with side 1 unit, so we write <em>square units</em>. Do not mix them up: volume is in cubic units, surface area is in square units.</p>
      <p>Count six sides: Top, Bottom, Front, Back, Left and Right. Some sides are hidden when you look at the figure, so turn it, or think about the other side. Two cubes that touch hide the faces between them. Those faces are inside, so they are not counted.</p>
      <p>Example: 4 cubes in a 2 × 2 square. Top 4, Bottom 4. Each of the four sides has 2 faces, so 8. Total: 4 + 4 + 8 = 16 square units. Four separate cubes would show 4 × 6 = 24 faces, but gluing them together hides 8 of those faces.</p>
      <h3>Same volume, different surface</h3>
      <p>A row of 4 cubes and a 2 × 2 square both have volume 4 cubic units. The row has surface area 18 square units. The square has 16. Volume and surface area measure different things.</p>`,
    check: [
      { q: 'What is a cubic unit?',
        choices: ['The space inside a cube whose edges are each 1 unit long',
                  'A flat square that is 1 unit on each side',
                  'The space inside any cube, big or small',
                  'A line that is 1 unit long'], answer: 0,
        why: 'A unit cube has edges that are each 1 unit long. The space it takes up is one cubic unit. A flat square is a square unit, which measures area. A line is a length. A bigger cube holds more than one cubic unit.',
        hint: 'Think of a cube with edges 1 unit long. What does it fill up?' },
      { q: 'A box is 6 units long, 4 units wide and 3 units tall. Maya packs it with unit cubes, one layer at a time. She has packed 2 layers. How many more cubes does she need to fill the box?',
        choices: ['72', '48', '24', '13'], answer: 2,
        why: 'One layer is 6 × 4 = 24 cubes. The box has 3 layers, so it holds 3 × 24 = 72 cubes. Maya has 2 layers, which is 48 cubes. She needs 72 − 48 = 24 more. That is one more layer. 72 is the whole box and 48 is what she already has.',
        hint: 'Find the cubes in one layer first. Then find all the cubes in the box. Then take away what she has.' },
      { q: 'Jo has 3 unit cubes glued in a straight row. Jo says: "Each cube has 6 faces, so the surface area is 3 × 6 = 18 square units." What is wrong?',
        choices: ['Faces where two cubes touch are inside the figure, so they do not count. The surface area is 14.',
                  'A cube has 8 faces, so the surface area is 24.',
                  'Nothing is wrong. The surface area is 18.',
                  'Surface area is the number of cubes, so the answer is 3.'], answer: 0,
        why: 'The row has 2 places where cubes touch. Each touch hides 2 faces, one on each cube. So 4 faces are inside. 18 − 4 = 14 square units. Check by sides: Top 3, Bottom 3, Front 3, Back 3, and 1 face on each end (2). 3 + 3 + 3 + 3 + 2 = 14.',
        hint: 'Look at where two cubes are glued together. Can you see those faces from the outside?' }
    ],
    links: { related: ['area-by-decomposition', 'multiplying-with-area-models', 'nets-and-surface-area', 'volume-of-prisms-pyramids-and-cones'] },

    mount({ stage, controls: C }) {
      const panel = stage.nextElementSibling;
      const st = { mode: 'box', l: 1, w: 1, h: 1, k: 1, fig: 0, fk: 3, rot: 0, dir: null, counted: new Set(), pred: 0, hideH: false, practice: false };
      const v = { fill: 1 };                    /* number of layers the canvas shows (animated) */
      let cancel = () => {}, guessed = false, saved = null;
      const P = new Plane(stage, { span: 8 });

      const fg = () => FIGS[st.fig].g;
      const maxLayers = () => (st.mode === 'box' ? st.h : fMaxH(fg()));
      const target = () => (st.mode === 'box' ? st.k : st.fk);
      const setTarget = n => { n = clamp(n, 0, maxLayers()); if (st.mode === 'box') st.k = n; else st.fk = n; };
      const locked = () => !st.practice && st.pred === 1 && !guessed;

      /* practice state */
      let prIdx = 0, prSolved = false, prTried = false, prFirst = 0, prDone = 0;
      const pr = () => PR[prIdx];

      /* ---------- drawing ---------- */
      const tx = (c, p, t, x, y, o = {}) => {
        c.save(); c.translate(x, y);
        c.font = `${o.w || 700} ${o.px || 14}px ${FONT}`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
        if (o.halo !== false) { c.lineWidth = 4; c.lineJoin = 'round'; c.strokeStyle = p.pal.stage; c.strokeText(t, 0, 0); }
        c.fillStyle = o.color || p.pal.text; c.fillText(t, 0, 0); c.restore();
      };
      const mw = (c, t, px, w = 700) => { c.font = `${w} ${px}px ${FONT}`; return c.measureText(t).width; };

      const captionText = () => {
        if (st.mode === 'fig') {
          const g = fg(), full = v.fill >= maxLayers() - .001 && st.fk >= maxLayers();
          if (st.practice && !prSolved) return '';
          if (st.dir) { const n = fCount(g)[st.dir]; return `${st.dir}: ${plural(n, 'face')}` + (visible(st.dir, st.rot) ? '' : ' (hidden from here)'); }
          return full ? `${FIGS[st.fig].name}: ${plural(fVol(g), 'cube')}` : `${FIGS[st.fig].name}: ${st.fk} of ${maxLayers()} layers`;
        }
        const base = st.l * st.w;
        if (st.practice && prIdx >= 0 && pr().kind === 'mc' && !prSolved) return '';
        if (st.k === 0) return `Empty box: ${st.l} × ${st.w} × ${st.h}`;
        if (st.k === st.h) return `${st.l} × ${st.w} × ${st.h} = ${base * st.h} cubic unit${base * st.h === 1 ? '' : 's'}`;
        return `${plural(st.k, 'layer')} × ${base} = ${plural(st.k * base, 'cube')}`;
      };

      P.onDraw = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, small = W < 520;
        const px = small ? 13 : 16, fig = st.mode === 'fig';
        let n, m, top, g = null;                        /* n = size along x, m = size along y, top = height */
        if (fig) { g = fg(); const d = fDims(g); [n, m] = st.rot % 2 ? [d[1], d[0]] : d; top = fMaxH(g); }
        else { n = st.l; m = st.w; top = st.h; }
        const ml = small ? 74 : 96, mr = small ? 66 : 96, mt = 58, mb = small ? 44 : 52;
        const s = Math.max(8, Math.min((W - ml - mr) / ((n + m) * CS), (H - mt - mb) / (top + (n + m) * .5), 50));
        const ox = ml + (W - ml - mr) / 2 - (n - m) * CS * s / 2;
        const oy = mt + (H - mt - mb - (top + (n + m) * .5) * s) / 2 + top * s;
        const pt = (x, y, z) => [ox + (x - y) * CS * s, oy + (x + y) * .5 * s - z * s];
        const poly = (pts, fill, line, lw = 1.5) => {
          c.beginPath(); pts.forEach((q, i) => { const a = pt(q[0], q[1], q[2]); i ? c.lineTo(a[0], a[1]) : c.moveTo(a[0], a[1]); }); c.closePath();
          if (fill) { c.fillStyle = fill; c.fill(); }
          if (line) { c.lineJoin = 'round'; c.lineWidth = lw; c.strokeStyle = line; c.stroke(); }
        };
        const seg = (a, b, col, lw = 1, dash) => {
          const A = pt(a[0], a[1], a[2]), B = pt(b[0], b[1], b[2]);
          c.setLineDash(dash || []); c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke(); c.setLineDash([]);
        };

        /* the floor and the two back walls (a glass box) */
        poly([[0, 0, 0], [n, 0, 0], [n, m, 0], [0, m, 0]], alpha(pal.muted, .1), null);
        if (!fig) {
          poly([[0, 0, 0], [0, m, 0], [0, m, top], [0, 0, top]], alpha(pal.muted, .06), null);
          poly([[0, 0, 0], [n, 0, 0], [n, 0, top], [0, 0, top]], alpha(pal.muted, .06), null);
        }
        const gc = alpha(pal.muted, .4);
        for (let i = 0; i <= n; i++) seg([i, 0, 0], [i, m, 0], gc);
        for (let j = 0; j <= m; j++) seg([0, j, 0], [n, j, 0], gc);
        if (!fig) {
          for (let k = 1; k < top; k++) { seg([0, 0, k], [0, m, k], alpha(pal.muted, .22)); seg([0, 0, k], [n, 0, k], alpha(pal.muted, .22)); }
          for (let j = 1; j < m; j++) seg([0, j, 0], [0, j, top], alpha(pal.muted, .22));
          for (let i = 1; i < n; i++) seg([i, 0, 0], [i, 0, top], alpha(pal.muted, .22));
        }

        /* the cubes */
        const full = Math.floor(v.fill + 1e-6), frac = v.fill - full;
        const list = [];
        const lastFull = frac > .001 ? -1 : full - 1;      /* the newest layer is drawn in yellow */
        if (!fig) {
          for (let k = 0; k < Math.min(st.h, full + (frac > .001 ? 1 : 0)); k++) for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) list.push({ i, j, k });
        } else {
          for (let j = 0; j < g.length; j++) for (let i = 0; i < g[j].length; i++) for (let k = 0; k < Math.min(gh(g, i, j), full + (frac > .001 ? 1 : 0)); k++) list.push({ i, j, k });
        }
        const has = new Set(list.map(q => q.i + ',' + q.j + ',' + q.k));
        const present = (i, j, k) => has.has(i + ',' + j + ',' + k);
        const rotated = list.map(q => {
          if (!fig) return Object.assign({ x: q.i, y: q.j }, q);
          const r = rotc(q.i, q.j, fDims(g)[0], fDims(g)[1], st.rot);
          return Object.assign({ x: r[0], y: r[1] }, q);
        });
        rotated.sort((a, b) => (a.x + a.y + a.k) - (b.x + b.y + b.k));
        let counter = 0;
        for (const q of rotated) {
          const partial = q.k === full && frac > .001, dz = partial ? (1 - frac) * 3 : 0, al = partial ? .25 + .75 * frac : 1;
          const x = q.x, y = q.y, k = q.k + dz;
          const baseCol = (!fig && q.k === lastFull && !partial) ? pal.yellow : pal.blue;
          c.globalAlpha = al;
          let showTop = true, showR = true, showL = true, nameR = null, nameL = null;
          if (fig) {
            showTop = !present(q.i, q.j, q.k + 1);
            showR = showL = false;
            for (const nm of Object.keys(VEC)) {
              if (present(q.i + VEC[nm][0], q.j + VEC[nm][1], q.k)) continue;
              const r = rotv(VEC[nm], st.rot);
              if (r[0] === 1 && r[1] === 0) { showR = true; nameR = nm; }
              else if (r[0] === 0 && r[1] === 1) { showL = true; nameL = nm; }
            }
          }
          const num = (pts, hot) => {
            if (!hot || partial || s < 18) return;
            counter++;
            const a = pts.map(z => pt(z[0], z[1], z[2])), cx = a.reduce((t, z) => t + z[0], 0) / 4, cy = a.reduce((t, z) => t + z[1], 0) / 4;
            c.globalAlpha = 1; tx(c, p, String(counter), cx, cy, { px: Math.min(18, Math.max(12, s * .5)), color: '#121A2B', halo: false });
          };
          const ln = pal.stage;
          if (showL) { const f = [[x, y + 1, k], [x + 1, y + 1, k], [x + 1, y + 1, k + 1], [x, y + 1, k + 1]]; const hot = !!st.dir && nameL === st.dir; poly(f, tone(hot ? pal.yellow : baseCol, 1), ln, 1.5); num(f, hot); }
          if (showR) { const f = [[x + 1, y, k], [x + 1, y + 1, k], [x + 1, y + 1, k + 1], [x + 1, y, k + 1]]; const hot = !!st.dir && nameR === st.dir; poly(f, tone(hot ? pal.yellow : baseCol, .72), ln, 1.5); num(f, hot); }
          if (showTop) { const f = [[x, y, k + 1], [x + 1, y, k + 1], [x + 1, y + 1, k + 1], [x, y + 1, k + 1]]; const hot = st.dir === 'Top'; poly(f, tone(hot ? pal.yellow : baseCol, 1.3), ln, 1.5); num(f, hot); }
          c.globalAlpha = 1;
        }

        if (!fig) {
          /* the outline of the whole box, dashed, so you can see what is still empty */
          const E = (a, b) => seg(a, b, alpha(pal.text, .55), 1.5, [5, 4]);
          E([0, 0, top], [n, 0, top]); E([0, 0, top], [0, m, top]); E([n, 0, top], [n, m, top]); E([0, m, top], [n, m, top]);
          E([n, m, 0], [n, m, top]); E([n, 0, 0], [n, 0, top]); E([0, m, 0], [0, m, top]);
          /* the edge labels (words as well as color) */
          const A1 = pt(n / 2, m, 0), A2 = pt(n, m / 2, 0), A3 = pt(0, m, top / 2);
          tx(c, p, `length ${n}`, A1[0] - 8, A1[1] + (small ? 20 : 24), { px, color: pal.green, align: 'center' });
          tx(c, p, `width ${m}`, A2[0] + (small ? 26 : 36), A2[1] + (small ? 16 : 20), { px, color: pal.red });
          tx(c, p, st.hideH ? 'height ?' : `height ${top}`, A3[0] - 8, A3[1], { px, color: pal.violet, align: 'right' });
        } else {
          const L1 = pt(n / 2, m, 0), L2 = pt(n, m / 2, 0), nl = sideOn([0, 1], st.rot), nr = sideOn([1, 0], st.rot);
          tx(c, p, nl ? nl + ' side' : '', L1[0] - 8, L1[1] + (small ? 18 : 22), { px, color: st.dir === nl ? pal.text : pal.muted });
          tx(c, p, nr ? nr + ' side' : '', L2[0] + (small ? 30 : 40), L2[1] + (small ? 14 : 18), { px, color: st.dir === nr ? pal.text : pal.muted });
        }

        /* the legend: what one unit cube is */
        {
          const u = 12, ux = 22, uy = 30, q = (a, b, z) => [ux + (a - b) * CS * u, uy + (a + b) * .5 * u - z * u];
          const f = (pts, fill) => { c.beginPath(); pts.forEach((z, i) => { const a = q(z[0], z[1], z[2]); i ? c.lineTo(a[0], a[1]) : c.moveTo(a[0], a[1]); }); c.closePath(); c.fillStyle = fill; c.fill(); c.lineWidth = 1.2; c.strokeStyle = pal.stage; c.stroke(); };
          f([[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]], pal.blue); f([[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]], tone(pal.blue, .72)); f([[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], tone(pal.blue, 1.3));
          tx(c, p, '1 unit cube = 1 cubic unit', 44, 22, { px: small ? 12 : 14, color: pal.text, align: 'left', w: 700 });
        }

        /* caption at the bottom */
        let cap = captionText(), cpx = px + 3;
        if (cap) { while (cpx > 12 && mw(c, cap, cpx) > W - 16) cpx--; tx(c, p, cap, W / 2, H - mb / 2 + 2, { px: cpx }); }
      };

      /* ---------- the side panel ---------- */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', style: 'min-height:44px', onclick: onClick }, label);
      const big = els => { els.forEach(e => { e.style.minHeight = '44px'; }); return els; };
      let ro, sl = {}, sel, addB, remB, fillB, emptyB, sideB = {}, predBtns, predFb, ptally, pq, pch, pfb, pnext, pcheck, startBtn, turnB;

      const moveShown = ms => { cancel(); cancel = animateTo(v, { fill: target() }, ms, () => P.draw()); };
      const clearFb = () => { if (pfb) pfb.innerHTML = ''; };

      const readout = () => {
        if (st.mode === 'box') {
          const { l, w, h: ht, k } = st, base = l * w;
          let t = `<span class="k">Length</span> ${gr(l)}, <span class="k">width</span> ${rd(w)}, <span class="k">height</span> ${vi(ht)}<br>` +
            `<span class="k">One layer</span> ${l} × ${w} = ${plural(base, 'cube')}<br><span class="k">Layers packed</span> ${k} of ${ht}<br>`;
          if (k === 0) t += 'The box is empty. Add a layer.';
          else t += `Cubes so far: ${k} × ${base} = ${k * base}`;
          if (k === ht) t += `<br><b>Volume = ${l} × ${w} × ${ht} = ${l * w * ht} cubic unit${l * w * ht === 1 ? '' : 's'}</b><br>Same as height × base: ${ht} × ${base} = ${ht * base}.`;
          else t += '<br>Keep adding layers until the box is full.';
          return t;
        }
        const g = fg(), mx = maxLayers(), k = st.fk, vol = fVol(g);
        let t = `<span class="k">${FIGS[st.fig].name}</span> (layers shown: ${k} of ${mx})<br>`;
        const lc = []; for (let z = 0; z < k; z++) lc.push(layerCount(g, z));
        t += lc.length ? `Layers: ${lc.join(' + ')}${k === mx ? ` = <b>${vol} cubic units</b>` : ' ...'}<br>` : 'No layers yet. Add a layer.<br>';
        const cnt = fCount(g);
        t += `<span class="k">Faces counted</span> (${st.counted.size} of 6 sides)<br>`;
        let sum = 0;
        for (const s of SIDES) if (st.counted.has(s)) { sum += cnt[s]; t += `${s} ${cnt[s]}${visible(s, st.rot) ? '' : ' (hidden from here)'}<br>`; }
        if (st.counted.size === 0) t += 'Press a side name to count its faces.<br>';
        else if (st.counted.size < 6) t += `Total so far: ${sum}. Count the other sides too.<br>`;
        else t += `<b>Surface area = ${SIDES.map(s => cnt[s]).join(' + ')} = ${sum} square units</b><br>`;
        if (st.dir) {
          if (st.dir === 'Bottom') t += 'Bottom faces sit on the table, so you cannot see them. One bottom face for each tower, so Bottom equals Top.';
          else if (!visible(st.dir, st.rot)) t += `The ${st.dir} side is hidden from here. Turn the figure to see it.`;
          else if (st.dir === 'Top') t += 'Top: one face for each tower. A step that is lower still shows its top.';
          else t += 'Where a taller tower stands next to a shorter one, the extra cubes show a face too.';
        }
        return t;
      };

      const sync = () => {
        const prac = st.practice, k = prac ? pr().kind : '', box = st.mode === 'box';
        vis(G.bsl, prac ? k === 'build' : box);
        vis(G.fsel, !prac && !box);
        vis(G.pred, !prac && st.pred === 1);
        vis(G.lay, prac ? k === 'layers' : true);
        vis(G.fside, !prac && !box);
        vis(G.ro, !prac);
        vis(G.practice, prac);
        sl.l.set(st.l); sl.w.set(st.w); sl.h.set(st.h);
        if (sel && sel.value !== String(st.fig)) sel.value = String(st.fig);
        const t = target(), mx = maxLayers(), lk = locked();
        addB.disabled = lk || t >= mx; remB.disabled = lk || t <= 0; fillB.disabled = lk || t >= mx; emptyB.disabled = lk || t <= 0;
        SIDES.forEach(s => { sideB[s].classList.toggle('primary', st.dir === s); });
        if (ro) ro.innerHTML = prac ? '' : readout();
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        P.draw();
      };

      const changeLayers = d => { if (locked()) return; cancel(); setTarget(d === 'all' ? maxLayers() : d === 'none' ? 0 : target() + d); clearFb(); sync(); moveShown(d === 'all' ? 900 : 550); };

      /* ----- the box ----- */
      grp('bsl', () => {
        C.title('The box');
        const mk = (key, label) => C.slider({ label, min: 1, max: 6, step: 1, value: st[key], format: x => plural(x, 'unit'),
          onInput: x => {
            if (locked()) { sl[key].set(st[key]); return; }
            cancel(); st[key] = x;
            if (st.practice) st.k = st.h; else st.k = clamp(st.k, 0, st.h);
            v.fill = Math.min(v.fill, st.k); if (st.practice) v.fill = st.k;
            clearFb(); sync(); if (!st.practice && v.fill !== st.k) moveShown(300);
          } });
        sl.l = mk('l', 'Length (long)'); sl.w = mk('w', 'Width'); sl.h = mk('h', 'Height (tall)');
      });

      /* ----- the figure: choose one ----- */
      grp('fsel', () => {
        C.title('The figure');
        sel = C.select({ label: 'Figure', value: '0', options: FIGS.map((f, i) => ({ value: String(i), label: f.name })),
          onChange: val => { cancel(); st.fig = +val; st.fk = fMaxH(fg()); st.rot = 0; st.dir = null; st.counted = new Set(); v.fill = st.fk; sync(); } });
      });

      /* ----- pack layer by layer ----- */
      grp('lay', () => {
        C.title('Pack layer by layer');
        const r1 = C.buttons([{ label: 'Add a layer', primary: true, onClick: () => changeLayers(1) }, { label: 'Remove a layer', onClick: () => changeLayers(-1) }]);
        const r2 = C.buttons([{ label: 'Fill it', onClick: () => changeLayers('all') }, { label: 'Empty it', onClick: () => changeLayers('none') }]);
        [addB, remB] = r1; [fillB, emptyB] = r2; big([addB, remB, fillB, emptyB]);
      });

      /* ----- predict ----- */
      grp('pred', () => {
        predFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        const opts = [['10 cubes', 'That is one layer: 5 × 2 = 10. This box has 3 layers.'],
          ['15 cubes', '15 is 5 × 3. That skips the width. One layer is 5 × 2 = 10, and there are 3 layers.'],
          ['30 cubes', good('Yes.') + ' One layer is 5 × 2 = 10. Three layers make 3 × 10 = 30.']];
        predBtns = opts.map((o, i) => mkBtn(o[0], () => {
          if (guessed) return; guessed = true;
          predBtns.forEach((b, j) => { b.disabled = true; if (j === i) b.classList.add('primary'); });
          predFb.innerHTML = o[1] + ' Watch the layers drop in: 10, 20, 30. The volume is 5 × 2 × 3 = 30 cubic units.';
          cancel(); st.k = 3; sync(); moveShown(1500);
        }));
        addTo(h('p', { class: 'ctl-title' }, 'Predict first'), h('p', { class: 'hint' }, 'How many unit cubes fill a box that is 5 long, 2 wide and 3 tall?'), h('div', { class: 'ctl buttons' }, ...predBtns), predFb);
      });
      function addTo(...els) { panel.append(...els); }

      /* ----- count the faces ----- */
      grp('fside', () => {
        C.title('Count the faces');
        C.hint('Press a side to see its faces numbered. Some sides are hidden from here.');
        const row = h('div', { class: 'ctl buttons' });
        SIDES.forEach(s => {
          sideB[s] = mkBtn(s === 'Top' || s === 'Bottom' ? s : s + ' side', () => {
            cancel(); st.dir = s; st.counted.add(s); st.fk = maxLayers(); sync(); moveShown(500);
          });
          row.append(sideB[s]);
        });
        row.append(mkBtn('Clear', () => { st.dir = null; sync(); }));
        const row2 = C.buttons([{ label: '◀ Turn left', onClick: () => { st.rot = (st.rot + 3) % 4; sync(); } }, { label: 'Turn right ▶', onClick: () => { st.rot = (st.rot + 1) % 4; sync(); } }]);
        big(row2); turnB = row2;
        panel.insertBefore(row, row2[0].parentElement);
        C.hint('Turn the figure to see the other sides.');
      });
      ro = C.readout();
      G.ro = [ro];
      /* order: sliders, figure select, predict, layers, counting, readout */
      panel.append(...G.bsl, ...G.fsel, ...G.pred, ...G.lay, ...G.fside, ro);

      /* ----- practice ----- */
      C.title('Practice');
      C.hint('Eight short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => {
        cancel();
        if (st.practice) {
          st.practice = false; if (saved) { Object.assign(st, saved); st.counted = new Set(saved.counted); v.fill = target(); } sync();
        } else {
          saved = Object.assign({}, st, { counted: Array.from(st.counted) });
          st.practice = true; prIdx = 0; prFirst = 0; prDone = 0; loadProb(); sync();
        }
      } }])[0];
      startBtn.style.minHeight = '44px';
      grp('practice', () => {
        const wrap = h('div', { style: 'display:flex;flex-direction:column;gap:14px' });
        ptally = h('p', { class: 'ctl-title' });
        pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        pch = h('div', { class: 'ctl buttons', style: 'flex-direction:column;align-items:stretch' });
        pcheck = mkBtn('Check', () => checkProb(), true);
        pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pnext = mkBtn('Next problem', () => nextProb(), true);
        wrap.append(ptally, pq, pch, h('div', { class: 'ctl buttons' }, pcheck), pfb, h('div', { class: 'ctl buttons' }, pnext)); addTo(wrap);
      });

      const tally = () => { ptally.textContent = `Problem ${prIdx + 1} of ${PR.length}. Right on the first try: ${prFirst} of ${prDone} done`; };
      const loadProb = () => {
        const q = pr(); prSolved = false; prTried = false; cancel();
        Object.assign(st, { mode: 'box', l: 1, w: 1, h: 1, k: 1, fig: 0, fk: 3, rot: 0, dir: null, hideH: false, pred: 0 }, q.sc);
        st.counted = new Set();
        if (st.mode === 'fig') st.fk = fMaxH(fg());
        v.fill = target();
        pq.textContent = q.q; pfb.innerHTML = ''; pch.replaceChildren(); pnext.disabled = true;
        pnext.textContent = prIdx === PR.length - 1 ? 'Finish' : 'Next problem';
        const isMc = q.kind === 'mc';
        pcheck.parentElement.style.display = isMc ? 'none' : ''; pcheck.disabled = false;
        pch.style.display = isMc ? '' : 'none';
        if (isMc) q.ch.forEach((o, i) => pch.append(mkBtn(o[0], () => pickChoice(i))));
        tally();
      };
      const finishOne = () => {
        prSolved = true; st.hideH = false; if (!prTried) prFirst++; prDone++; pnext.disabled = false; pcheck.disabled = true; tally(); sync();
      };
      const pickChoice = i => {
        const q = pr(); if (prSolved) return;
        const btn = pch.children[i];
        if (i === q.ans) {
          Array.from(pch.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary');
          pfb.innerHTML = good('Right.') + ' ' + q.ch[i][1]; finishOne();
        } else {
          prTried = true; btn.disabled = true; pfb.innerHTML = bad('Not quite.') + ' ' + q.ch[i][1] + ' Try another answer.';
        }
      };
      const checkProb = () => {
        const q = pr(); if (prSolved) return;
        const r = q.check(st);
        if (r.ok) { pfb.innerHTML = good('Yes.') + ' ' + r.msg; finishOne(); }
        else { prTried = true; pfb.innerHTML = bad('Not yet.') + ' ' + r.msg + ' Change the box and check again.'; }
      };
      const nextProb = () => {
        if (prIdx === PR.length - 1 && prSolved && pnext.textContent === 'Finish') {
          pfb.innerHTML = good('All done.') + ` You got ${prFirst} of ${PR.length} right on the first try. Press the button to try again.`;
          pnext.textContent = 'Practice again'; pnext.onclick = () => { pnext.onclick = () => nextProb(); prIdx = 0; prFirst = 0; prDone = 0; loadProb(); sync(); };
          return;
        }
        prIdx = Math.min(prIdx + 1, PR.length - 1); loadProb(); sync();
      };

      const apply = (patch, immediate) => {
        cancel();
        const wasPrac = st.practice, oldMode = st.mode; st.practice = false;
        for (const k of ['mode', 'l', 'w', 'h', 'k', 'fig', 'fk', 'rot', 'pred']) if (k in patch) st[k] = patch[k];
        st.dir = null; st.counted = new Set(); st.hideH = false;
        st.k = clamp(st.k, 0, st.h); if (st.mode === 'fig') st.fk = clamp(st.fk, 0, fMaxH(fg()));
        if (st.pred === 1) { guessed = false; if (predBtns) { predBtns.forEach(b => { b.disabled = false; b.classList.remove('primary'); }); predFb.innerHTML = ''; } }
        if (immediate || wasPrac || oldMode !== st.mode) { v.fill = target(); sync(); } else { sync(); moveShown(800); }
      };
      sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
