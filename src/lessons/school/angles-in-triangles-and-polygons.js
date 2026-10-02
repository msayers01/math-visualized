/* =====================================================================
   SCHOOL — Angles in triangles and polygons
   ===================================================================== */
{
  const D = Math.PI / 180, sn = a => Math.sin(a * D), cs = a => Math.cos(a * D);
  /* degrees as text: whole numbers stay whole, others get one decimal */
  const dg = v => Math.abs(v - Math.round(v)) < 1e-6 ? String(Math.round(v)) : (Math.round(v * 10) / 10).toFixed(1);
  const dgs = v => dg(v) + '°';
  const mn = v => v < 0 ? '−' + Math.abs(v) : String(v);

  /* Irregular polygons sit on a circle. Each number is the arc (in degrees) between two corners, so every angle comes out whole. */
  const IRR = {
    3: [100, 120, 140], 4: [70, 80, 100, 110], 5: [50, 60, 70, 90, 90], 6: [40, 50, 60, 60, 70, 80],
    7: [30, 40, 50, 50, 60, 60, 70], 8: [20, 30, 40, 40, 50, 50, 60, 70],
    9: [20, 30, 30, 30, 40, 40, 50, 60, 60], 10: [20, 20, 30, 30, 30, 40, 40, 40, 50, 60]
  };
  const arcsOf = (n, reg) => reg ? Array(n).fill(360 / n) : IRR[n];
  const extOf = (arcs, i) => (arcs[(i + arcs.length - 1) % arcs.length] + arcs[i % arcs.length]) / 2;
  const polyV = (arcs, phi0, R) => { let a = phi0; return arcs.map(c => { const v = [R * cs(a), R * sn(a)]; a += c; return v; }); };

  /* A triangle from its angles at A (left) and B (right). Shrunk to fit if it is tall or wide. */
  const triG = (A, B) => {
    const C = 180 - A - B, L = 6, b = L * sn(B) / sn(C);
    let P = [[0, 0], [L, 0], [b * cs(A), b * sn(A)]];
    const xs = P.map(q => q[0]), lo = Math.min(...xs), hi = Math.max(...xs);
    const s = Math.min(1, 3.5 / P[2][1], 9.2 / (hi - lo)), mid = (lo + hi) / 2;
    return P.map(([x, y]) => [(x - mid) * s, -.5 + y * s]);
  };
  const isoG = th => {
    const L = 4.4, hh = th / 2, y = 2.1 - L * cs(hh);
    return { T: [0, 2.1], A: [-L * sn(hh), y], B: [L * sn(hh), y], M: [0, y] };
  };

  const byAng = (a, b, c) => Math.max(a, b, c) > 90 ? 'obtuse (one angle is over 90°)' : Math.max(a, b, c) === 90 ? 'right (one angle is 90°)' : 'acute (every angle is under 90°)';
  const bySide = (a, b, c) => a === b && b === c ? 'equilateral (3 equal angles, so 3 equal sides)'
    : (a === b || b === c || a === c) ? 'isosceles (2 equal angles, so 2 equal sides)' : 'scalene (no equal angles, so no equal sides)';

  /* ----- canvas helpers ----- */
  const sector = (p, x, y, r, a0, sw, fill, stroke, lw = 2.4, dash) => {
    const c = p.ctx, px = p.X(x), py = p.Y(y);
    c.beginPath(); c.moveTo(px, py); c.arc(px, py, r * p.scale, -(a0 + sw) * D, -a0 * D); c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.setLineDash(dash || []); c.lineJoin = 'round'; c.stroke(); c.setLineDash([]); }
  };
  const arcLine = (p, x, y, r, a0, sw, col, lw = 3) => {
    const c = p.ctx; c.beginPath(); c.arc(p.X(x), p.Y(y), r * p.scale, -(a0 + sw) * D, -a0 * D);
    c.strokeStyle = col; c.lineWidth = lw; c.setLineDash([]); c.lineCap = 'round'; c.stroke();
  };
  const txt = (p, s, x, y, o = {}) => {
    const c = p.ctx, size = o.size || p.fs;
    c.font = `${o.w || 700} ${size}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`;
    c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
    const px = o.px ? x : p.X(x) + (o.dx || 0), py = o.px ? y : p.Y(y) + (o.dy || 0);
    c.globalAlpha = o.a == null ? 1 : o.a; c.lineWidth = 4; c.lineJoin = 'round'; c.strokeStyle = p.pal.stage;
    if (o.mw) c.strokeText(s, px, py, o.mw); else c.strokeText(s, px, py);
    c.fillStyle = o.color || p.pal.text;
    if (o.mw) c.fillText(s, px, py, o.mw); else c.fillText(s, px, py);
    c.globalAlpha = 1;
  };
  const cap = (p, lines, where, col) => {
    lines = lines.filter(Boolean); const fs = clamp(p.fs, 12.5, 16), gap = fs + 6;
    lines.forEach((s, i) => txt(p, s, p.w / 2, where === 'top' ? 20 + i * gap : p.h - 16 - (lines.length - 1 - i) * gap,
      { px: true, size: fs, mw: p.w - 20, color: col || p.pal.text, w: 600 }));
  };
  const tick = (p, a, b, col) => {
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * .2, ny = dx / L * .2;
    p.path([[mx - nx, my - ny], [mx + nx, my + ny]], { stroke: col, width: 3.2 });
  };
  const dirv = (a, r) => [r * cs(a), r * sn(a)];

  /* ----- the practice problems (fixed list) ----- */
  const PRAC = [
    { kind: 'tri', A: 50, B: 65, ans: 65,
      q: 'Two angles of a triangle are 50° and 65°. How big is the third angle?',
      choices: ['115°', '75°', '65°', '55°'], answer: 2,
      no: ['115° is just 50° + 65°, the two angles you already have. The third angle is what is left of 180°.',
           'Check it: 50° + 65° + 75° = 190°, but the angles of a triangle add to exactly 180°.', null,
           'Check it: 50° + 65° + 55° = 170°, which is 10° short of 180°.'],
      why: 'The three angles add to 180°. The two known angles make 50° + 65° = 115°, and 180° − 115° = 65°.' },
    { kind: 'iso', th: 40,
      q: 'This isosceles triangle has an apex angle of 40° between the two equal sides. How big is each base angle?',
      choices: ['70°', '140°', '40°', '35°'], answer: 0,
      no: [null, '140° is both base angles together (180° − 40°). The two base angles are equal, so each one gets half of it.',
           '40° is the apex angle. The base angles are a different pair. They match each other, not the apex (only an equilateral triangle has all three the same).',
           'Check it: 40° + 35° + 35° = 110°, but the angles must add to 180°.'],
      why: 'The base angles are equal and share what is left of 180°. That is 180° − 40° = 140°, so each base angle is 140° ÷ 2 = 70°.' },
    { kind: 'poly',
      q: 'This polygon has 7 sides. Click corners to draw diagonals from the yellow corner, then choose the sum of all its angles.',
      choices: ['720°', '1260°', '1080°', '900°'], answer: 3,
      no: ['720° is 4 triangles, the answer for 6 sides. With 7 sides the fan has one more triangle.',
           '1260° is 7 × 180°, one triangle for every side. But the two sides at the yellow corner do not start a triangle, because no diagonal is drawn to them. Only 7 − 2 = 5 triangles fit.',
           '1080° is 6 triangles. The fan from one corner makes 7 − 2 = 5 triangles, not 6.', null],
      why: 'Diagonals from one corner cut a 7-sided polygon into 7 − 2 = 5 triangles. Each triangle has 180°, so the angles add to 5 × 180° = 900°.' },
    { kind: 'ext', n: 9,
      q: 'You walk around a regular polygon and turn 40° at every corner. How many sides does it have?',
      choices: ['8', '9', '360', '40'], answer: 1,
      no: ['8 corners would turn 8 × 40° = 320°. That is not a full turn, and you must turn exactly 360° to face the way you started.', null,
           '360 is the total turn in degrees, not a number of sides. Divide it among the corners: 360 ÷ 40.',
           '40° is the size of one turn. The number of corners is how many 40° turns fit into 360°.'],
      why: 'All the turns add to 360°. Each turn is 40°, so the number of corners is 360 ÷ 40 = 9. A regular polygon has as many sides as corners: 9 sides.' },
    { kind: 'reg', n: 5,
      q: 'What is the size of each inside angle of a regular pentagon (5 equal sides, 5 equal angles)?',
      choices: ['72°', '540°', '108°', '120°'], answer: 2,
      no: ['72° is the turn at each corner (360° ÷ 5). The inside angle and the turn make a straight line, so the inside angle is 180° − 72° = 108°.',
           '540° is the sum of all five angles, (5 − 2) × 180°. Share it between the 5 equal angles.', null,
           '120° is the inside angle of a regular hexagon. A pentagon has 5 sides, so each angle is 540° ÷ 5.'],
      why: 'The five angles add to (5 − 2) × 180° = 540°. They are equal, so each is 540° ÷ 5 = 108°. Check: the turn 360° ÷ 5 = 72°, and 180° − 72° = 108°.' },
    { kind: 'quad',
      q: 'Three angles of a four-sided shape are 90°, 70° and 90°. How big is the fourth angle?',
      choices: ['20°', '110°', '290°', '90°'], answer: 1,
      no: ['20° is 180° − 90° − 70°, which is the rule for three sides. A four-sided shape has two triangles, so its angles add to 360°.', null,
           '290° comes from 540° − 250°, but 540° is the sum for 5 sides. Four sides make 2 triangles: 360°.',
           'Check it: 90° + 70° + 90° + 90° = 340°, which is 20° short of 360°.'],
      why: 'A four-sided shape splits into 4 − 2 = 2 triangles, so its angles add to 360°. The three known angles make 250°, and 360° − 250° = 110°.' }
  ];
  const ISO_Q = [{ ask: 'base', th: 40 }, { ask: 'base', th: 100 }, { ask: 'apex', th: 80 }, { ask: 'base', th: 60 }, { ask: 'apex', th: 20 }];
  const MISS = [[50, 70], [35, 90], [62, 48], [108, 24], [60, 60]];

  register({
    id: 'angles-in-triangles-and-polygons', level: 'school',
    title: 'Angles in triangles and polygons',
    blurb: 'Tear the corners off a triangle, cut polygons into triangles, and walk around a shape to find every missing angle.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 3.4;
      const V = [[-2.7, -1.2], [2.5, -1.2], [.7, 2.4]];
      p.path(V, { fill: alpha(pal.blue, .12), stroke: pal.blue, width: 2.6, close: true });
      const cols = [pal.green, pal.red, pal.violet];
      V.forEach((v, k) => {
        const a = V[(k + 1) % 3], b = V[(k + 2) % 3];
        const a0 = Math.atan2(a[1] - v[1], a[0] - v[0]) / D, a1 = Math.atan2(b[1] - v[1], b[0] - v[0]) / D;
        let sw = a1 - a0; sw = ((sw % 360) + 360) % 360;
        sector(p, v[0], v[1], .9, a0, sw, alpha(cols[k], .5), cols[k], 2);
      });
      p.path([[-3, -2.4], [3, -2.4]], { stroke: pal['grid-strong'], width: 2.4 });
    },
    hook: String.raw`Tear the three corners off any paper triangle and put them side by side. They always make a perfectly straight line. Why? And what would the corners of a five-sided shape make?`,
    steps: [
      { title: 'Tear the corners',
        text: String.raw`<p>Cut the three corners off a paper triangle and line them up. Try it here.</p><p>First pick a guess in the panel: what do the three angles add up to? Then drag each corner down to the straight line, or press its <b>Tear</b> button. Next press <b>Missing-angle puzzle</b> and find the hidden angle.</p>`,
        set: { mode: 'tear', A: 50, B: 70, tA: 0, tB: 0, tC: 0 } },
      { title: 'Equal sides, equal angles',
        text: String.raw`<p>A triangle with at least two equal sides is <b>isosceles</b>. With three equal sides it is <b>equilateral</b>. With none it is <b>scalene</b>. The tick marks show equal sides.</p><p>Guess each base angle, then check. Press <b>Fold along the middle</b>: the two base angles land on each other, so they are equal.</p>`,
        set: { mode: 'iso', th: 40, fold: 0 } },
      { title: 'Cut into triangles',
        text: String.raw`<p>A <b>polygon</b> is a closed shape with straight sides. Click the other corners to draw <b>diagonals</b> from the yellow corner. Each diagonal is a straight cut across the shape.</p><p>Every triangle has 180°. Fill in the table, then look for the pattern.</p>`,
        set: { mode: 'poly', nP: 5, reg: true } },
      { title: 'Walk and turn',
        text: String.raw`<p>Walk around the polygon. At each corner you turn by the <b>exterior angle</b>. When you are back at the start, facing the way you began, you have turned once all the way round.</p><p>Guess the total, then walk. Then try the <b>Sides</b> slider: which number of sides gives a 40° turn?</p>`,
        set: { mode: 'ext', nE: 6, reg: true, w: 0 } }
    ],
    formal: String.raw`
      <p>An <em>interior angle</em> is the angle inside a shape at a corner. An <em>exterior angle</em> is the turn you make at that corner when you walk around the shape. The two fit together to make a straight line.</p>
      <h3>The angles of a triangle add to 180°</h3>
      <p>Draw a line through the top corner of the triangle, parallel to the bottom side. The line makes two new angles beside the top corner. Each one is equal to a bottom corner of the triangle, because a line crossing two parallel lines makes equal "Z" angles. Now the top corner and the two new angles sit side by side on a straight line. A straight line is \(180^\circ\), so
      \[ A + B + C = 180^\circ. \]
      This is the same as tearing the corners off and lining them up. It works for every triangle, big or small, because the argument never used the size or shape.</p>
      <h3>Finding a missing angle</h3>
      <p>If two angles are \(47^\circ\) and \(68^\circ\), the third is \(180^\circ - 47^\circ - 68^\circ = 65^\circ\). Subtract both known angles, not just one.</p>
      <h3>Triangles by their sides and angles</h3>
      <p>By sides: <em>equilateral</em> (3 equal sides), <em>isosceles</em> (at least 2 equal sides), <em>scalene</em> (no equal sides). By angles: <em>acute</em> (all under \(90^\circ\)), <em>right</em> (one angle is \(90^\circ\)), <em>obtuse</em> (one angle is over \(90^\circ\)). A triangle can have only one right or obtuse angle, because the other two angles must share what is left of \(180^\circ\).</p>
      <p><b>Why the base angles of an isosceles triangle are equal.</b> Fold the triangle along the line from the apex to the middle of the base. The two halves match exactly: the equal sides land on each other and the base is cut in half. So the two base angles land on each other too. The reverse is also true: two equal angles sit opposite two equal sides. An equilateral triangle has three equal angles, so each is \(180^\circ \div 3 = 60^\circ\).</p>
      <p>Example: an isosceles triangle has a base angle of \(35^\circ\). The other base angle is \(35^\circ\), and the apex angle is \(180^\circ - 35^\circ - 35^\circ = 110^\circ\).</p>
      <h3>Polygons: cut into triangles</h3>
      <p>Pick one corner of a polygon with \(n\) sides and draw diagonals to every corner that is not next to it. The diagonals cut the polygon into \(n-2\) triangles. (Each triangle rests on one side that does not touch the starting corner, and there are \(n-2\) such sides.) The angles of the triangles together make up exactly the angles of the polygon, so
      \[ \text{angle sum} = (n-2)\times 180^\circ. \]
      A quadrilateral has \(2\times180^\circ = 360^\circ\), a pentagon \(540^\circ\), an octagon \(6\times180^\circ=1080^\circ\). This holds for regular and irregular polygons alike. The lesson draws only polygons that bulge outward at every corner (convex ones).</p>
      <p>A <em>regular</em> polygon has equal sides and equal angles, so each angle is
      \[ \frac{(n-2)\times 180^\circ}{n}. \]
      For a regular octagon: \(1080^\circ \div 8 = 135^\circ\).</p>
      <h3>Exterior angles</h3>
      <p>At each corner, interior angle + exterior angle \(=180^\circ\). Walk once around a convex polygon. You turn at every corner and finish facing the way you began, so the turns add up to one full turn:
      \[ \text{sum of exterior angles} = 360^\circ. \]
      This agrees with the angle sum. Adding \(180^\circ - \text{interior}\) over all \(n\) corners gives \(180n-(n-2)\times180 = 360\). It holds for every convex polygon, whatever the number of sides.</p>
      <p>For a <em>regular</em> polygon every turn is the same, so each exterior angle is \(\dfrac{360^\circ}{n}\) and each interior angle is \(180^\circ-\dfrac{360^\circ}{n}\). To find the number of sides from the exterior angle, divide: if each turn is \(40^\circ\), then \(n = 360 \div 40 = 9\) sides, and each interior angle is \(180^\circ - 40^\circ = 140^\circ\).</p>`,
    check: [
      { q: 'Which statement is true for EVERY triangle?',
        choices: ['A bigger triangle has a bigger angle total.', 'The angles add to 180° only when two of the sides are equal.',
                  'The three angles always add to 180°.', 'The angles add to 360°, because a triangle has three corners.'], answer: 2,
        why: 'The angle total does not depend on size or shape. Tearing the corners off any triangle always gives a straight line, which is 180°. Size changes the sides, not the angles\' total. 360° is the total of the exterior angles (the turns).',
        hint: 'Think about tearing the corners off a small triangle and a large one. What shape do the corners make each time?' },
      { q: 'Five angles of a six-sided polygon (not a regular one) are 110°, 130°, 120°, 125° and 135°. How big is the sixth angle?',
        choices: ['460°', '100°', '280°', '720°'], answer: 1,
        why: 'A six-sided polygon splits into 6 − 2 = 4 triangles, so its angles add to 4 × 180° = 720°. The five known angles add to 110 + 130 + 120 + 125 + 135 = 620°. The sixth angle is 720° − 620° = 100°. (280° comes from using 5 triangles, 460° from using 6.)',
        hint: 'First find the angle sum of a six-sided polygon from the number of triangles. Then subtract the five angles.' },
      { q: 'Mia says: "A regular pentagon has 5 sides, so each exterior angle is 360° ÷ 5 = 72°. So each inside angle is 72° too." Which statement is correct?',
        choices: ['Mia is right. The inside and outside angle at a corner are equal.', 'The exterior angle should be 180° ÷ 5 = 36°.',
                  'The inside angle is 360° − 72° = 288°.', 'The exterior angle 72° is right, but the inside angle is 180° − 72° = 108°.'], answer: 3,
        why: 'Her exterior angle is right: the turns add to 360° and there are 5 equal turns. But the inside angle and the turn at a corner make a straight line (180°), so the inside angle is 180° − 72° = 108°. This matches (5 − 2) × 180° ÷ 5 = 108°.',
        hint: 'At one corner, the inside angle and the turn together make a straight line. How many degrees is that?' }
    ],
    links: { related: ['parallel-and-perpendicular-lines', 'inscribed-angles', 'similarity-and-scaling', 'angle-relationships-and-parallel-lines', 'rigid-motions-and-congruence', 'area-by-decomposition'] },

    mount({ stage, controls: C }) {
      const P = new Plane(stage, { cx: 0, cy: 0, span: 5 });
      const st = { A: 50, B: 70, tA: 0, tB: 0, tC: 0, th: 40, fold: 0, w: 0 };
      const NUM = ['A', 'B', 'tA', 'tB', 'tC', 'th', 'fold', 'w'];
      const fl = {
        mode: 'tear', puz: -1, puzOk: false, guessT: false, tearRight: false,
        isoI: 0, rev: false, nP: 5, diag: [], guessP: false, polyRight: false, done: {}, sumDone: false,
        reg: true, showAng: false, nE: 6, guessE: false, qE: 0, inside: false, msg: ''
      };
      const pr = { i: 0, first: [], tries: 0, solved: false, pd: [], on: false };
      let wh = [null, null, null], apexPos = null, bPos = null, vhits = [], grab = null;

      /* ---------- animation: one cancel per animated key ---------- */
      const cmap = {};
      const stopKeys = keys => keys.forEach(k => { if (cmap[k]) { cmap[k](); cmap[k] = null; } });
      const stopAll = () => stopKeys(Object.keys(cmap));
      const go = (patch, ms, done) => {
        const keys = Object.keys(patch);
        keys.forEach((k, i) => { stopKeys([k]); cmap[k] = animateTo(st, { [k]: patch[k] }, ms, sync, i === keys.length - 1 ? done : null); });
      };

      /* ---------- small helpers ---------- */
      const ints = () => { const a = Math.round(st.A), b = Math.round(st.B); return [a, b, 180 - a - b]; };
      const polyCount = () => fl.nP - 2;
      const complete = () => fl.diag.length === fl.nP - 3;
      const rowsDone = () => Object.keys(fl.done).length;
      const uniq = (arr, first, n = 4) => { const out = []; arr.forEach(v => { if (v > 0 && v < 400 && !out.includes(v)) out.push(v); }); return out.slice(0, n); };
      const place = (list, correct, pos) => { const rest = list.filter(v => v !== correct); rest.splice(pos % (rest.length + 1), 0, correct); return rest; };

      /* ---------- panel: quiz box component ---------- */
      const boxCss = 'border:1px solid var(--line-strong);border-radius:4px;padding:12px 14px;display:flex;flex-direction:column;gap:10px;font-size:.92rem;line-height:1.5';
      const Quiz = box => {
        let warnEl = null;
        const api = {
          clear() { box.innerHTML = ''; warnEl = null; },
          tip(html) { api.clear(); box.append(h('p', { style: 'margin:0', html })); },
          warn(html) { if (!warnEl) { warnEl = h('p', { style: 'margin:0;color:var(--red);font-weight:600', role: 'status' }); box.append(warnEl); } warnEl.innerHTML = html; warnEl.style.display = html ? '' : 'none'; },
          show(spec) {
            api.clear(); let locked = false;
            if (spec.head) box.append(h('p', { style: 'margin:0;color:var(--muted);font-size:.84rem', html: spec.head }));
            box.append(h('p', { style: 'margin:0', html: spec.q }));
            const row = h('div', { style: 'display:flex;flex-wrap:wrap;gap:8px' }), fb = h('p', { style: 'margin:0;padding-left:10px;border-left:3px solid var(--line-strong);display:none', role: 'status', 'aria-live': 'polite' });
            const nx = h('div', { style: 'display:none' });
            const bs = spec.choices.map((c, i) => {
              const b = h('button', { type: 'button', class: 'btn', style: 'min-width:54px' }, c);
              b.addEventListener('click', () => {
                if (locked) return;
                const r = spec.say(i); fb.style.display = ''; fb.innerHTML = r.html; fb.style.borderLeftColor = r.ok ? 'var(--green)' : 'var(--red)';
                spec.onPick && spec.onPick(i, r.ok);
                if (r.ok) {
                  locked = true; b.style.borderColor = 'var(--green)'; b.style.color = 'var(--green)';
                  bs.forEach(o => { if (o !== b) o.disabled = true; });
                  if (spec.next) { nx.style.display = ''; }
                  spec.onRight && spec.onRight(i);
                } else { b.disabled = true; b.style.borderColor = 'var(--red)'; }
              });
              row.append(b); return b;
            });
            box.append(row, fb);
            if (spec.next) { nx.append(h('button', { type: 'button', class: 'btn primary', onclick: spec.next.fn }, spec.next.label)); box.append(nx); }
            warnEl = null;
          }
        };
        return api;
      };

      /* ---------- panel: groups ---------- */
      const host = C.readout().parentNode; host.lastElementChild.remove();
      const grp = fn => {
        const n = host.children.length; fn();
        const g = h('div', { style: 'display:flex;flex-direction:column;gap:16px' });
        [...host.children].slice(n).forEach(k => g.append(k)); host.append(g); return g;
      };
      let sA, sB, sTh, sP, sE, sW, regP, regE, angT, insT, foldBtn, puzBtn;

      const setAB = (a, b) => {
        stopKeys(['A', 'B']);
        a = clamp(Math.round(a), 20, 120); b = clamp(Math.round(b), 20, 120);
        if (a + b > 160) b = 160 - a;
        st.A = a; st.B = b; sA.set(a); sB.set(b);
        if (fl.puz >= 0) { fl.puzOk = false; refreshQuiz(); }
        sync();
      };
      const tearBtn = k => {
        if (!fl.guessT) { Q.warn('Make your guess first (pick an answer above). Then tear.'); P.draw(); return; }
        const key = ['tA', 'tB', 'tC'][k]; go({ [key]: st[key] < .5 ? 1 : 0 }, 650);
      };

      const gTear = grp(() => {
        C.title('Triangle');
        sA = C.slider({ label: 'Angle A', min: 20, max: 120, step: 1, value: st.A, format: v => Math.round(v) + '°', onInput: v => setAB(v, st.B) });
        sB = C.slider({ label: 'Angle B', min: 20, max: 120, step: 1, value: st.B, format: v => Math.round(v) + '°', onInput: v => setAB(st.A, v) });
        C.buttons([{ label: 'Tear A', onClick: () => tearBtn(0) }, { label: 'Tear B', onClick: () => tearBtn(1) }, { label: 'Tear C', onClick: () => tearBtn(2) },
                   { label: 'Put back', onClick: () => go({ tA: 0, tB: 0, tC: 0 }, 650) }]);
        puzBtn = C.buttons([{ label: 'Missing-angle puzzle', onClick: () => startPuz() }, { label: 'Free play', onClick: () => { fl.puz = -1; fl.puzOk = false; refreshQuiz(); sync(); } }])[0];
      });
      const gIso = grp(() => {
        C.title('Isosceles triangle');
        sTh = C.slider({ label: 'Apex angle', min: 20, max: 140, step: 2, value: st.th, format: v => Math.round(v) + '°', onInput: v => setTh(v) });
        C.buttons([{ label: 'Equilateral', onClick: () => setTh(60) }, { label: 'Right angle at top', onClick: () => setTh(90) }, { label: 'Narrow', onClick: () => setTh(30) }]);
        foldBtn = C.buttons([{ label: 'Fold along the middle', onClick: () => go({ fold: st.fold < .5 ? 1 : 0 }, 1000) }])[0];
      });
      const gPoly = grp(() => {
        C.title('Polygon');
        sP = C.slider({ label: 'Sides', min: 3, max: 8, step: 1, value: fl.nP, format: v => String(Math.round(v)), onInput: v => { fl.nP = Math.round(v); fl.diag = []; fl.msg = ''; if (fl.guessP && complete()) fl.done[fl.nP] = true; refreshQuiz(); sync(); } });
        C.buttons([{ label: 'Draw next diagonal', onClick: () => nextDiag(false) }, { label: 'Clear diagonals', onClick: () => { fl.diag = []; fl.msg = ''; sync(); } }]);
        regP = C.toggle({ label: 'Regular shape', value: true, onChange: v => setReg(v) });
        angT = C.toggle({ label: 'Label every corner angle', value: false, onChange: v => { fl.showAng = v; P.draw(); } });
      });
      const gExt = grp(() => {
        C.title('Walk around a polygon');
        sE = C.slider({ label: 'Sides', min: 3, max: 10, step: 1, value: fl.nE, format: v => String(Math.round(v)), onInput: v => { stopKeys(['w']); fl.nE = Math.round(v); st.w = 0; sW.set(0); sync(); } });
        sW = C.slider({ label: 'Corners turned', min: 0, max: 10, step: 1, value: 0, format: v => String(Math.round(v)), onInput: v => walkTo(Math.round(v), true) });
        C.buttons([{ label: 'Next corner', onClick: () => walkTo(Math.min(fl.nE, Math.round(st.w) + 1)) }, { label: 'Walk all the way', onClick: () => walkTo(fl.nE) }, { label: 'Back to start', onClick: () => walkTo(0) }]);
        regE = C.toggle({ label: 'Regular shape', value: true, onChange: v => setReg(v) });
        insT = C.toggle({ label: 'Show the inside angles too', value: false, onChange: v => { fl.inside = v; sync(); } });
      });

      const qbox = h('div', { style: boxCss, 'aria-label': 'Question' }); host.append(qbox);
      const Q = Quiz(qbox);
      const ro = C.readout();

      /* practice section */
      const gPracT = grp(() => {
        C.title('Practice');
        C.buttons([{ label: 'Start practice', onClick: () => startPrac() }, { label: 'Restart', onClick: () => { pr.i = 0; pr.first = []; pr.tries = 0; pr.solved = false; pr.pd = []; startPrac(); } }]);
      });
      const pbox = h('div', { style: boxCss, 'aria-label': 'Practice problem' }); host.append(pbox);
      const QP = Quiz(pbox);
      pbox.style.display = 'none';

      /* ---------- tear: puzzles ---------- */
      const startPuz = () => {
        fl.puz = (fl.puz + 1) % MISS.length; fl.puzOk = false; fl.guessT = true; stopKeys(['tA', 'tB', 'tC']);
        const [a, b] = MISS[fl.puz];
        go({ A: a, B: b, tA: 0, tB: 0, tC: 0 }, 700);
        refreshQuiz(MISS[fl.puz]);
      };
      const qTear = () => ({
        head: 'Predict, then see',
        q: 'Every triangle has three corners. If you tear them all off and line them up side by side, what do the three angles add up to?',
        choices: ['90°', '180°', '270°', '360°'], answer: 1,
        say: i => i === 1
          ? { ok: true, html: '<b>Right.</b> The corners fit together on a straight line, and a straight line is 180°. Now tear the corners here and see it for yourself.' }
          : { ok: false, html: i === 3 ? '360° is a full turn all the way round. Three triangle corners only fill half of that: a straight line. Tear them and see.'
            : i === 0 ? '90° is a square corner. The three corners of a triangle add up to more than that. Tear them and see.'
            : 'Close, but the corners do not make three quarters of a turn. Tear them and see what shape they make.' },
        onPick: (i, ok) => { fl.guessT = true; if (ok) fl.tearRight = true; Q.warn(''); },
        next: { label: 'Continue', fn: () => refreshQuiz() }
      });
      const qPuz = (ab) => {
        const [a, b] = ab || [Math.round(st.A), Math.round(st.B)], c = 180 - a - b;
        const ch = place(uniq([c, a + b, 180 - a, 180 - b, 90, 60, 30, 120], c), c, fl.puz + 1);
        return {
          head: `Puzzle ${fl.puz + 1} of ${MISS.length}`,
          q: `Two angles of this triangle are <b>${a}°</b> and <b>${b}°</b>. How big is the third angle, marked ?`,
          choices: ch.map(v => v + '°'), answer: ch.indexOf(c),
          say: i => {
            const v = ch[i];
            if (v === c) return { ok: true, html: `<b>Right.</b> The three angles add to 180°, so the third is 180° − ${a}° − ${b}° = ${c}°. The torn corners now fill the straight line: ${a}° + ${b}° + ${c}° = 180°.` };
            if (v === a + b) return { ok: false, html: `${v}° is just ${a}° + ${b}°, the two angles you already know. The third angle is what is <em>left</em> of 180°.` };
            if (v === 180 - a || v === 180 - b) return { ok: false, html: `${v}° takes away only one known angle. Take away both: 180° − ${a}° − ${b}°.` };
            return { ok: false, html: `Check it: ${a}° + ${b}° + ${v}° = ${a + b + v}°, but the angles of a triangle add to exactly 180°.` };
          },
          onRight: () => { fl.puzOk = true; go({ tA: 1, tB: 1, tC: 1 }, 900); },
          next: { label: 'Next puzzle', fn: startPuz }
        };
      };

      /* ---------- isosceles ---------- */
      const setTh = v => {
        stopKeys(['th']); st.th = clamp(Math.round(v / 2) * 2, 20, 140); sTh.set(st.th); fl.rev = false; fl.thT = null;
        if (ISO_Q[fl.isoI]) refreshQuiz(); sync();
      };
      const qIso = () => {
        const q = ISO_Q[fl.isoI], th = Math.round(fl.thT != null ? fl.thT : st.th), b = (180 - th) / 2;
        let ch, ok, say, qq;
        if (q.ask === 'base') {
          qq = `The two equal sides of this isosceles triangle meet at the top in an angle of <b>${th}°</b>. How big is each base angle?`;
          ok = b; ch = place(uniq([b, 180 - th, th, 60, 90, th / 2, 45, 30], b), b, fl.isoI + 1);
          say = i => {
            const v = ch[i];
            if (v === b) return { ok: true, html: `<b>Right.</b> The two base angles are equal and share what is left of 180°: (180° − ${th}°) ÷ 2 = ${b}°.${th === 60 ? ' All three angles are 60°, so this is an equilateral triangle.' : ''}` };
            if (v === 180 - th) return { ok: false, html: `${v}° is both base angles together. They are equal, so each one is half of ${v}°.` };
            if (v === th) return { ok: false, html: `${th}° is the angle at the top. The base angles are a different pair. They match each other, not the top angle.` };
            return { ok: false, html: `Check it: ${v}° + ${v}° + ${th}° = ${2 * v + th}°, but the angles of a triangle add to 180°.` };
          };
        } else {
          qq = `Each base angle of this isosceles triangle is <b>${b}°</b>. How big is the angle at the top (the apex)?`;
          ok = th; ch = place(uniq([th, b, 180 - b, 2 * b, 90, 60, 100, 40], th), th, fl.isoI + 2);
          say = i => {
            const v = ch[i];
            if (v === th) return { ok: true, html: `<b>Right.</b> The two base angles make ${b}° + ${b}° = ${2 * b}°. The apex is what is left: 180° − ${2 * b}° = ${th}°.` };
            if (v === 2 * b) return { ok: false, html: `${v}° is the two base angles added together. The apex is what is <em>left</em> of 180°.` };
            if (v === 180 - b) return { ok: false, html: `${v}° takes away only one base angle. Take away both: 180° − ${b}° − ${b}°.` };
            if (v === b) return { ok: false, html: `${b}° is a base angle. The apex is different unless the triangle is equilateral.` };
            return { ok: false, html: `Check it: ${b}° + ${b}° + ${v}° = ${2 * b + v}°, but the angles must add to 180°.` };
          };
        }
        return {
          head: `Predict, then see · question ${fl.isoI + 1} of ${ISO_Q.length}`, q: qq, choices: ch.map(v => v + '°'), answer: ch.indexOf(ok), say,
          onRight: () => { fl.rev = true; sync(); },
          next: { label: fl.isoI + 1 < ISO_Q.length ? 'Next question' : 'Finish', fn: () => { fl.isoI++; fl.rev = false; if (fl.isoI < ISO_Q.length) { fl.thT = ISO_Q[fl.isoI].th; go({ th: fl.thT }, 700); } refreshQuiz(); sync(); } }
        };
      };

      /* ---------- polygon: diagonals ---------- */
      const setReg = v => { fl.reg = v; regP.checked = v; regE.checked = v; sync(); };
      const toggleDiag = i => {
        if (!fl.guessP) { Q.warn('Make your guess first (pick an answer above). Then cut.'); fl.msg = ''; sync(); return; }
        const n = fl.nP;
        if (i === 0) { fl.msg = 'This is the start corner. All the cuts begin here.'; }
        else if (i === 1 || i === n - 1) { fl.msg = 'Next to the start corner: a side already joins them.'; }
        else if (fl.diag.includes(i)) { fl.diag = fl.diag.filter(d => d !== i); fl.msg = 'Diagonal removed.'; }
        else { fl.diag = [...fl.diag, i].sort((a, b) => a - b); fl.msg = ''; }
        afterDiag();
      };
      const nextDiag = prac => {
        const list = prac ? pr.pd : fl.diag, n = prac ? 7 : fl.nP;
        if (!prac && !fl.guessP) { Q.warn('Make your guess first (pick an answer above). Then cut.'); sync(); return; }
        for (let i = 2; i <= n - 2; i++) if (!list.includes(i)) { if (prac) pr.pd = [...pr.pd, i]; else { fl.diag = [...fl.diag, i]; fl.msg = ''; } break; }
        if (!prac) afterDiag(); else sync();
      };
      const afterDiag = () => {
        if (complete()) { fl.done[fl.nP] = true; if (fl.polyRight) refreshQuiz(); }
        sync();
      };
      const qPoly = () => {
        const n = fl.nP, c = n - 2, ch = place(uniq([c, n - 1, n, n - 3, n + 1], c), c, n);
        return {
          head: 'Predict, then see',
          q: `This polygon has <b>${n} sides</b>. You will draw diagonals from one corner to every corner that is not next to it. How many triangles will the polygon be cut into?`,
          choices: ch.map(String), answer: ch.indexOf(c),
          say: i => ch[i] === c ? { ok: true, html: `<b>Right.</b> Each triangle rests on one side that does not touch the start corner, and ${n} − 2 = ${c} sides do not touch it. Now draw the cuts to check.` }
            : { ok: false, html: `Not quite. Each triangle in the fan rests on one side that does not touch the start corner. ${n} − 2 = ${c} sides are like that. Draw the cuts and count.` },
          onPick: (i, ok) => { fl.guessP = true; if (ok) fl.polyRight = true; Q.warn(''); },
          next: { label: 'Continue', fn: () => { if (complete()) fl.done[fl.nP] = true; refreshQuiz(); sync(); } }
        };
      };
      const qSum = () => {
        const ch = ['1800°', '1620°', '1440°', '1260°'];
        return {
          head: 'Use the pattern',
          q: 'You have seen the pattern. Predict the sum of the angles of a polygon with <b>10 sides</b>.',
          choices: ch, answer: 2,
          say: i => i === 2 ? { ok: true, html: '<b>Right.</b> (10 − 2) × 180° = 8 × 180° = 1440°. The rule: (n − 2) × 180°.' }
            : { ok: false, html: i === 0 ? '1800° is 10 × 180°, one triangle per side. But the fan has n − 2 triangles, so 8 of them.' : i === 1 ? '1620° is 9 × 180°. That is n − 1 triangles. The fan has n − 2.' : '1260° is 7 × 180°. The fan has n − 2 = 8 triangles.' },
          onRight: () => { fl.sumDone = true; }
        };
      };

      /* ---------- walk ---------- */
      const walkTo = (k, fromSlider) => {
        if (!fl.guessE) { Q.warn('Make your guess first (pick an answer above). Then walk.'); if (fromSlider) sW.set(Math.round(st.w)); P.draw(); return; }
        k = clamp(k, 0, fl.nE); sW.set(k); go({ w: k }, clamp(Math.abs(k - st.w) * 600, 400, 3600));
      };
      const EXT_Q = [
        { head: 'Predict, then see', q: 'You walk all the way round a polygon and turn at every corner. When you are back at the start, facing the way you began, how much have you turned in total?',
          choices: ['180°', '360°', 'More for more sides', 'Less for more sides'], answer: 1,
          say: i => i === 1 ? { ok: true, html: '<b>Right.</b> You end up facing the way you began, so you made exactly one full turn: 360°. Walk it and watch the meter. Then change the number of sides.' }
            : { ok: false, html: i === 0 ? '180° is only half a turn. You would be facing the opposite way. Walk it and watch the meter.' : 'More sides means a smaller turn at each corner, and the total comes out the same. Walk it and watch the meter.' } },
        { head: 'Find the sides', q: 'A regular polygon turns <b>40°</b> at every corner. How many sides does it have? (Test it with the Sides slider.)',
          choices: ['8', '10', '9', '40'], answer: 2,
          say: i => i === 2 ? { ok: true, html: '<b>Right.</b> The turns add to 360° and each is 40°, so there are 360 ÷ 40 = 9 corners, and 9 sides.' }
            : { ok: false, html: i === 0 ? '8 turns of 40° make 320°, short of a full turn.' : i === 1 ? '10 turns of 40° make 400°, more than a full turn.' : '40° is the size of one turn. Count how many 40° turns fit into 360°.' } },
        { head: 'Inside angle', q: 'A regular polygon has <b>12 sides</b>. How big is each inside angle?',
          choices: ['30°', '150°', '180°', '120°'], answer: 1,
          say: i => i === 1 ? { ok: true, html: '<b>Right.</b> Each turn is 360° ÷ 12 = 30°. The turn and the inside angle make a straight line, so the inside angle is 180° − 30° = 150°.' }
            : { ok: false, html: i === 0 ? '30° is the turn at each corner. The inside angle is what is left of the straight line: 180° − 30°.' : i === 2 ? 'A corner of 180° would be a straight line, not a corner. Subtract the 30° turn from it.' : '120° is the inside angle of a regular hexagon (6 sides). With 12 sides the turns are smaller, so the inside angles are bigger.' } }
      ];
      const qExt = () => {
        const s = EXT_Q[fl.qE], last = fl.qE === EXT_Q.length - 1;
        return { ...s, onPick: fl.qE === 0 ? () => { fl.guessE = true; Q.warn(''); } : null, next: last ? null : { label: 'Next question', fn: () => { fl.qE++; refreshQuiz(); } } };
      };

      function refreshQuiz(ab) {
        const m = fl.mode; if (m === 'prac') return;
        let spec = null, tip = '';
        if (m === 'tear') {
          if (fl.puz >= 0) spec = qPuz(ab); else if (!fl.tearRight) spec = qTear();
          else tip = 'Now press <b>Missing-angle puzzle</b>. Or reshape the triangle with the sliders (or drag the top corner) and tear it again. The total never changes.';
        } else if (m === 'iso') {
          if (fl.isoI < ISO_Q.length) spec = qIso();
          else tip = 'Fold other shapes with the <b>Apex angle</b> slider. The two base angles always match, and the three angles always add to 180°.';
        } else if (m === 'poly') {
          if (!fl.polyRight) spec = qPoly();
          else if (complete() && rowsDone() >= 3 && !fl.sumDone) spec = qSum();
          else tip = 'Click corners (or press <b>Draw next diagonal</b>) to cut the polygon. Change <b>Sides</b> and fill in more rows of the table.';
        } else {
          if (fl.qE < EXT_Q.length) spec = qExt();
          else tip = 'Try the <b>Sides</b> slider and the irregular shape. The turns always add to 360°.';
        }
        spec ? Q.show(spec) : Q.tip(tip);
      }

      /* ---------- drawing ---------- */
      const drawTri = (p, V, vals, o) => {
        const pal = p.pal;
        p.path(V, { fill: alpha(pal.blue, .1), stroke: pal.blue, width: 3.2, close: true });
        const cols = [pal.green, pal.red, pal.violet];
        V.forEach((v, k) => {
          const a = V[(k + 1) % 3], b = V[(k + 2) % 3], a0 = Math.atan2(a[1] - v[1], a[0] - v[0]) / D, a1 = Math.atan2(b[1] - v[1], b[0] - v[0]) / D;
          let sw = ((a1 - a0) % 360 + 360) % 360;
          sector(p, v[0], v[1], .75, a0, sw, alpha(cols[k], .45), cols[k], 2);
          const m = a0 + sw / 2, rad = sw < 45 ? 1.9 : 1.4, d = dirv(m, rad);
          txt(p, vals[k], v[0] + d[0], v[1] + d[1], { size: p.fs + 1 });
        });
      };

      const drawTear = p => {
        const pal = p.pal, V = triG(st.A, st.B), vals = ints(), O = [0, -3.0], T = [st.tA, st.tB, st.tC];
        const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
        const r = clamp(Math.min(dist(V[0], V[1]), dist(V[1], V[2]), dist(V[0], V[2])) * .4, .55, 1);
        const cols = [pal.green, pal.red, pal.violet], names = ['A', 'B', 'C'], puzOpen = fl.puz >= 0 && !fl.puzOk;
        p.path(V, { fill: alpha(pal.blue, .1), stroke: pal.blue, width: 3.2, close: true });
        if (!puzOpen) for (let k = 0; k < 3; k++) if (vals.filter(x => x === vals[k]).length > 1) tick(p, V[(k + 1) % 3], V[(k + 2) % 3], pal.blue);
        p.path([[-4.7, O[1]], [4.7, O[1]]], { stroke: pal['grid-strong'], width: 3.2 });
        const any = T.some(t => t > .01);
        if (any) { const c = p.ctx; c.beginPath(); c.arc(p.X(O[0]), p.Y(O[1]), r * p.scale, -Math.PI, 0); c.strokeStyle = pal.muted; c.lineWidth = 1.6; c.setLineDash([5, 5]); c.stroke(); c.setLineDash([]);
          txt(p, 'straight line', 4.7, O[1] + .5, { align: 'right', w: 600, size: p.fs - 1, color: pal.muted }); }
        const thC0 = Math.atan2(V[0][1] - V[2][1], V[0][0] - V[2][0]) / D;
        const s1 = [0, st.A, st.A + st.B], sw = [st.A, st.B, 180 - st.A - st.B];
        const s0 = [0, 180 - st.B, thC0].map((s, k) => { let d = s1[k] - s; d -= 360 * Math.round(d / 360); return s1[k] - d; });
        const g = [(V[0][0] + V[1][0] + V[2][0]) / 3, (V[0][1] + V[1][1] + V[2][1]) / 3];
        for (let k = 0; k < 3; k++) if (T[k] > .01) sector(p, V[k][0], V[k][1], r, s0[k], sw[k], alpha(pal.stage, .9), pal.muted, 1.6, [4, 4]);
        for (let k = 0; k < 3; k++) {
          const t = T[k], s = lerp(s0[k], s1[k], t), cx = lerp(V[k][0], O[0], t), cy = lerp(V[k][1], O[1], t), mid = s + sw[k] / 2;
          sector(p, cx, cy, r, s, sw[k], alpha(cols[k], .5), cols[k], 2.4);
          const hp = dirv(mid, .5 * r); wh[k] = [cx + hp[0], cy + hp[1]];
          const show = t > .02 || fl.puz >= 0;
          if (show) {
            const cap1 = .7 * Math.min(dist(V[k], V[(k + 1) % 3]), dist(V[k], V[(k + 2) % 3])), rad = lerp(Math.min(r + .5 + (sw[k] < 45 ? .4 : 0), cap1), r + .5 + (sw[k] < 45 ? .4 : 0) + (k === 1 ? .35 : 0), clamp((t - .3) / .5, 0, 1)), d = dirv(mid, rad);
            txt(p, k === 2 && puzOpen ? '?' : vals[k] + '°', cx + d[0], cy + d[1], { size: p.fs + 1 });
          }
          const vd = [V[k][0] - g[0], V[k][1] - g[1]], vl = Math.hypot(vd[0], vd[1]) || 1;
          txt(p, names[k], V[k][0] + vd[0] / vl * .6, V[k][1] + vd[1] / vl * .6, { size: p.fs + 4, color: cols[k] });
        }
        for (let k = 0; k < 3; k++) p.dot(wh[k][0], wh[k][1], 7, pal.stage, pal.brass, 2.5);
        apexPos = T[2] < .01 ? V[2] : null;
        if (apexPos) p.dot(V[2][0], V[2][1], 7, pal.blue, pal.brass, 3);
        /* captions */
        const n = T.filter(t => t > .98).length, vs = T.map((t, k) => t > .98 ? (k === 2 && puzOpen ? '?' : vals[k] + '°') : null).filter(Boolean);
        if (!fl.guessT) cap(p, ['Guess first: pick an answer in the panel.'], 'top', pal.muted);
        else if (puzOpen) cap(p, ['Find the angle marked ?'], 'top', pal.muted);
        else if (n < 3) cap(p, [fl.puz >= 0 ? '' : 'Drag each corner down to the line.'], 'top', pal.muted);
        if (n === 3) cap(p, [vs.join(' + ') + ' = ' + (puzOpen ? '180°' : '180°')], 'bottom', pal.text);
        else if (n > 0) { const sum = T.reduce((q, t, k) => q + (t > .98 && !(k === 2 && puzOpen) ? vals[k] : 0), 0); cap(p, ['So far: ' + vs.join(' + ') + (vs.includes('?') ? '' : ' = ' + sum + '°')], 'bottom', pal.text); }
      };

      const drawIsoFig = (p, th, o) => {
        const pal = p.pal, G = isoG(th), { T, A, B, M } = G, b = (180 - th) / 2, f = o.fold || 0, h2 = th / 2;
        const full = [T, A, B];
        if (f < .001) p.path(full, { fill: alpha(pal.blue, .1), stroke: pal.blue, width: 3.2, close: true });
        else {
          const Bf = [B[0] * cs(180 * f), B[1]];
          p.path([T, A, M], { fill: alpha(pal.green, .22), stroke: pal.green, width: 3, close: true });
          p.path([T, Bf, M], { fill: alpha(pal.red, .22), stroke: pal.red, width: 3, close: true });
          p.path(full, { stroke: pal.blue, width: 1.6, dash: [5, 6], close: true });
        }
        p.path([T, M], { stroke: pal.muted, width: 1.8, dash: [6, 6] });
        tick(p, T, A, pal.blue); tick(p, T, B, pal.blue);
        if (Math.round(th) === 60) tick(p, A, B, pal.blue);
        const la = 1 - clamp(f * 6, 0, 1);
        if (la > .02) {
          if (Math.round(th) === 90) {
            const u1 = dirv(-90 - h2, .75), u2 = dirv(-90 + h2, .75);
            p.path([T, [T[0] + u1[0], T[1] + u1[1]], [T[0] + u1[0] + u2[0], T[1] + u1[1] + u2[1]], [T[0] + u2[0], T[1] + u2[1]]], { fill: alpha(pal.violet, .4), stroke: pal.violet, width: 2, close: true });
          } else sector(p, T[0], T[1], .85, -90 - h2, th, alpha(pal.violet, .45), pal.violet, 2);
          sector(p, A[0], A[1], .85, 0, b, alpha(pal.green, .45), pal.green, 2);
          sector(p, B[0], B[1], .85, 180 - b, b, alpha(pal.green, .45), pal.green, 2);
          const rad = a => a < 35 ? 2.1 : a < 50 ? 1.7 : 1.4;
          let d = dirv(-90, rad(th)); if (Math.round(th) === 90) d = dirv(-90, 1.35);
          txt(p, o.apex, T[0] + d[0], T[1] + d[1], { size: p.fs + 1, a: la });
          const dA = dirv(b / 2, rad(b)), dB = dirv(180 - b / 2, rad(b));
          txt(p, o.base, A[0] + dA[0], A[1] + dA[1], { size: p.fs + 1, a: la }); txt(p, o.base, B[0] + dB[0], B[1] + dB[1], { size: p.fs + 1, a: la });
        }
        return G;
      };

      const drawIso = p => {
        const pal = p.pal, th = st.th, ths = Math.round(th), b = (180 - ths) / 2, ask = (ISO_Q[fl.isoI] || {}).ask;
        let apex = ths + '°', base = b + '°';
        if (!fl.rev && fl.isoI < ISO_Q.length) { if (ask === 'base') base = '?'; else apex = '?'; }
        const G = drawIsoFig(p, th, { fold: st.fold, apex, base });
        bPos = G.B; p.dot(G.B[0], G.B[1], 8, pal.stage, pal.brass, 3);
        txt(p, 'drag', G.B[0], G.B[1], { dy: 22, size: p.fs - 1, color: pal.muted, w: 600 });
        const eq = ths === 60;
        cap(p, [st.fold > .98 ? 'The two halves match exactly, so the base angles are equal.' : null], 'top', pal.muted);
        cap(p, [eq ? 'Equilateral: 3 equal sides, 3 equal angles' : 'Isosceles: 2 equal sides, 2 equal angles', ths === 90 ? 'It is also a right triangle.' : ths > 90 ? 'It is also an obtuse triangle.' : 'It is also an acute triangle.'], 'bottom', pal.text);
      };

      const drawPoly = (p, o) => {
        const pal = p.pal, arcs = o.arcs, n = arcs.length, V = polyV(arcs, 90, 3.05), diags = o.diags;
        p.path(V, { fill: alpha(pal.blue, .1), close: true });
        const rays = [1, ...diags, n - 1], cols = [pal.green, pal.yellow, pal.red, pal.violet], tris = [];
        for (let k = 0; k < rays.length - 1; k++) {
          const a = rays[k], b = rays[k + 1];
          if (b === a + 1) tris.push([0, a, b]);
          else { const idx = [0]; for (let i = a; i <= b; i++) idx.push(i); p.path(idx.map(i => V[i]), { fill: alpha(pal.muted, .16), close: true }); }
        }
        tris.forEach((t, k) => {
          const pts = t.map(i => V[i]); p.path(pts, { fill: alpha(cols[k % 4], .32), close: true });
        });
        diags.forEach(d => p.path([V[0], V[d]], { stroke: pal.green, width: 3.2 }));
        p.path(V, { stroke: pal.blue, width: 3.4, close: true });
        if (!o.all) tris.forEach(t => { const g = [0, 1].map(j => (V[t[0]][j] + V[t[1]][j] + V[t[2]][j]) / 3); txt(p, '180°', g[0], g[1], { size: p.fs, w: 700 }); });
        const labs = o.labels || (o.all ? V.map((v, i) => dgs(180 - extOf(arcs, i))) : null);
        if (labs) V.forEach((v, i) => {
          if (!labs[i]) return;
          const nx = V[(i + 1) % n], a0 = Math.atan2(nx[1] - v[1], nx[0] - v[0]) / D, iv = 180 - extOf(arcs, i);
          sector(p, v[0], v[1], .6, a0, iv, alpha(pal.violet, .4), pal.violet, 1.8);
          const L = Math.hypot(v[0], v[1]), d = [-v[0] / L, -v[1] / L], rad = n >= 7 ? 1.05 : 1.25;
          txt(p, labs[i], v[0] + d[0] * rad, v[1] + d[1] * rad, { size: p.fs, color: pal.text });
        });
        vhits = [];
        if (o.click) V.forEach((v, i) => {
          vhits.push({ i, x: p.X(v[0]), y: p.Y(v[1]) });
          if (i === 0) { p.dot(v[0], v[1], 9, pal.yellow, pal.brass, 3); txt(p, 'start', v[0], v[1], { dy: -22, size: p.fs, color: pal.text }); }
          else if (i >= 2 && i <= n - 2) { diags.includes(i) ? p.dot(v[0], v[1], 8, pal.green, pal.brass, 2.5) : p.dot(v[0], v[1], 9, pal.stage, pal.brass, 3); }
          else p.dot(v[0], v[1], 5, pal.blue);
        });
        return tris;
      };

      const walkInfo = (arcs, w) => {
        const n = arcs.length, V = polyV(arcs, -90 - arcs[0] / 2, 2.95), dir = [0];
        for (let j = 1; j <= n; j++) dir[j] = dir[j - 1] + extOf(arcs, j);
        const e = Math.min(Math.floor(w + 1e-9), n), f = w - e; let pos, head, turned = 0;
        for (let j = 1; j <= e; j++) turned += extOf(arcs, j);
        if (e >= n) { pos = V[0]; head = dir[n]; }
        else if (f < .7) { const u = f / .7, a = V[e], b = V[(e + 1) % n]; pos = [lerp(a[0], b[0], u), lerp(a[1], b[1], u)]; head = dir[e]; }
        else { const q = (f - .7) / .3; pos = V[(e + 1) % n]; head = dir[e] + extOf(arcs, e + 1) * q; turned += extOf(arcs, e + 1) * q; }
        return { V, dir, pos, head, turned, n, done: Math.min(e, n) };
      };
      const drawExt = (p, o) => {
        const pal = p.pal, arcs = o.arcs, W = walkInfo(arcs, o.w), { V, dir, n } = W;
        p.path(V, { stroke: pal.blue, width: 3, close: true, fill: alpha(pal.blue, .08) });
        for (let e = 0; e < n; e++) { const u = clamp((o.w - e) / .7, 0, 1); if (u > 0) { const a = V[e], b = V[(e + 1) % n]; p.path([a, [lerp(a[0], b[0], u), lerp(a[1], b[1], u)]], { stroke: pal.green, width: 4.5 }); } }
        for (let j = 1; j <= n; j++) {
          const q = clamp((o.w - (j - 1) - .7) / .3, 0, 1); if (q <= 0) continue;
          const v = V[j % n], x = extOf(arcs, j), a0 = dir[j - 1], d1 = dirv(a0, 1.3);
          p.path([v, [v[0] + d1[0], v[1] + d1[1]]], { stroke: pal.muted, width: 2, dash: [5, 5] });
          sector(p, v[0], v[1], .75, a0, x * q, alpha(pal.red, .35), pal.red, 2.2);
          if (q > .99) {
            const d = dirv(a0 + x / 2, n >= 9 ? 1.45 : 1.3); if (!o.noLab) txt(p, dgs(x), v[0] + d[0], v[1] + d[1], { size: p.fs, color: pal.text });
            if (o.inside) { const L = Math.hypot(v[0], v[1]), dd = [-v[0] / L, -v[1] / L]; txt(p, dgs(180 - x), v[0] + dd[0] * 1.0, v[1] + dd[1] * 1.0, { size: p.fs - 1, w: 600, color: pal.muted }); }
          }
        }
        txt(p, 'start', V[0][0], V[0][1], { dx: -14, dy: 12, align: 'right', size: p.fs, w: 600 });
        if (!o.noWalker) {
          const hd = dirv(W.head, 1.15);
          p.arrow(W.pos[0], W.pos[1], W.pos[0] + hd[0], W.pos[1] + hd[1], pal.violet, 3.5);
          p.dot(W.pos[0], W.pos[1], 8, pal.yellow, pal.brass, 3);
        }
        if (!o.noBar) {
          const bw = Math.min(p.w * .6, 320), x0 = (p.w - bw) / 2, y = p.h - 14, c = p.ctx;
          c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + bw, y); c.strokeStyle = pal['grid-strong']; c.lineWidth = 6; c.lineCap = 'round'; c.stroke();
          if (W.turned > 0) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + bw * Math.min(1, W.turned / 360), y); c.strokeStyle = pal.red; c.stroke(); }
          txt(p, 'Turned so far: ' + dgs(W.turned) + ' of 360°', p.w / 2, p.h - 34, { px: true, size: clamp(p.fs, 12.5, 16), w: 600, mw: p.w - 20 });
        }
        return W;
      };

      const pcur = () => PRAC[pr.i];
      const drawPrac = p => {
        const pal = p.pal, q = pcur();
        if (!q) { cap(p, ['Practice finished'], 'top', pal.muted); return; }
        const solved = pr.solved;
        if (q.kind === 'tri') {
          drawTri(p, triG(q.A, q.B).map(v => [v[0], v[1] - 1.3]), [q.A + '°', q.B + '°', solved ? q.ans + '°' : '?']);
        } else if (q.kind === 'iso') {
          drawIsoFig(p, q.th, { fold: 0, apex: q.th + '°', base: solved ? (180 - q.th) / 2 + '°' : '?' });
          cap(p, ['The ticks mark the two equal sides.'], 'bottom', pal.muted);
        } else if (q.kind === 'poly') {
          const tris = drawPoly(p, { arcs: arcsOf(7, true), diags: pr.pd, click: true });
          cap(p, [tris.length === 5 ? '5 triangles × 180° = 900°' : 'Triangles so far: ' + tris.length + ' of 5'], 'bottom', pal.text);
        } else if (q.kind === 'ext') {
          drawExt(p, { arcs: arcsOf(q.n, true), w: q.n, noBar: true, noWalker: true, noLab: !solved });
          cap(p, ['Every turn is 40°.'], 'bottom', pal.muted);
        } else if (q.kind === 'reg') {
          drawPoly(p, { arcs: arcsOf(5, true), diags: [], labels: [null, solved ? '108°' : '?', null, null, null] });
          cap(p, ['The sides are all equal and so are the angles.'], 'bottom', pal.muted);
        } else {
          drawPoly(p, { arcs: [100, 120, 60, 80], diags: [], labels: ['90°', '70°', '90°', solved ? '110°' : '?'] });
          cap(p, ['A four-sided shape.'], 'bottom', pal.muted);
        }
      };

      P.onDraw = (c, p) => {
        const sc = Math.min(p.w / 10.4, p.h / 9); p.span = Math.min(p.w, p.h) / (2 * sc); p.cx = 0; p.cy = 0;
        p.fs = clamp(p.scale * .42, 12.5, 18);
        wh = [null, null, null]; apexPos = null; bPos = null; vhits = [];
        const m = fl.mode, pal = p.pal;
        if (m === 'tear') drawTear(p);
        else if (m === 'iso') drawIso(p);
        else if (m === 'poly') {
          const arcs = arcsOf(fl.nP, fl.reg), tris = drawPoly(p, { arcs, diags: fl.diag, click: true, all: fl.showAng });
          const n = fl.nP, k = tris.length;
          if (!fl.guessP) cap(p, ['Guess first: pick an answer in the panel.'], 'top', pal.muted);
          else if (fl.msg) cap(p, [fl.msg], 'top', pal.red);
          else if (!complete()) cap(p, ['Click the other corners to cut the shape.'], 'top', pal.muted);
          cap(p, [complete() ? `${n - 2} triangle${n === 3 ? '' : 's'} × 180° = ${(n - 2) * 180}°` : `Triangles so far: ${k} of ${n - 2}`], 'bottom', pal.text);
        } else if (m === 'ext') {
          const arcs = arcsOf(fl.nE, fl.reg);
          if (!fl.guessE) cap(p, ['Guess first: pick an answer in the panel.'], 'top', pal.muted);
          drawExt(p, { arcs, w: Math.min(st.w, fl.nE), inside: fl.inside });
        } else drawPrac(p);
      };

      /* ---------- readout ---------- */
      const updRo = () => {
        const m = fl.mode; let rows = [];
        if (m === 'tear') {
          const [a, b, c] = ints(), puzOpen = fl.puz >= 0 && !fl.puzOk, cKnown = fl.puz >= 0 ? fl.puzOk : st.tC > .98;
          rows.push(`<span class="k">Corner A</span> ${a}°`, `<span class="k">Corner B</span> ${b}°`, `<span class="k">Corner C</span> ${cKnown ? c + '°' : '?'}`);
          if (st.tA > .98 && st.tB > .98 && st.tC > .98) rows.push(`<span class="k">Total</span> ${a}° + ${b}° + ${puzOpen ? '?' : c + '°'} = 180°`);
          if (cKnown) rows.push(`<span class="k">By sides</span> ${bySide(a, b, c)}`, `<span class="k">By angles</span> ${byAng(a, b, c)}`);
        } else if (m === 'iso') {
          const th = Math.round(st.th), b = (180 - th) / 2, ask = (ISO_Q[fl.isoI] || {}).ask, hideB = !fl.rev && fl.isoI < ISO_Q.length && ask === 'base', hideA = !fl.rev && fl.isoI < ISO_Q.length && ask === 'apex';
          rows.push(`<span class="k">Apex angle</span> ${hideA ? '?' : th + '°'}`, `<span class="k">Base angles</span> ${hideB ? '? and ?' : b + '° and ' + b + '°'}`);
          if (!hideA && !hideB) rows.push(`<span class="k">Check</span> ${b}° + ${b}° + ${th}° = 180°`, `<span class="k">By sides</span> ${bySide(b, b, th)}`, `<span class="k">By angles</span> ${byAng(b, b, th)}`);
        } else if (m === 'poly') {
          const n = fl.nP;
          let t = '<table style="border-collapse:collapse;width:100%;text-align:center;font-size:.86rem"><tr style="color:var(--muted)"><td>Sides</td><td>Triangles</td><td>Angle sum</td></tr>';
          for (let k = 3; k <= 8; k++) {
            const d = fl.done[k]; t += `<tr style="${k === n ? 'background:var(--line);font-weight:700' : ''}"><td>${k}</td><td>${d ? k - 2 : '?'}</td><td>${d ? (k - 2) * 180 + '°' : '?'}</td></tr>`;
          }
          t += '</table>'; rows.push(t);
          if (rowsDone() >= 3) rows.push('<b>Pattern:</b> triangles = sides − 2, and angle sum = (sides − 2) × 180°.');
          if (fl.done[n]) rows.push(fl.reg ? `<span class="k">Each angle (regular)</span> ${(n - 2) * 180} ÷ ${n} = ${n === 7 ? 'about 128.6' : dg((n - 2) * 180 / n)}°` : '<span class="k">This shape is irregular:</span> its angles differ, but they still add to ' + (n - 2) * 180 + '°.');
        } else if (m === 'ext') {
          const n = fl.nE, arcs = arcsOf(n, fl.reg), W = walkInfo(arcs, Math.min(st.w, n));
          rows.push(`<span class="k">Sides</span> ${n}`, `<span class="k">Corners turned</span> ${W.done}`, `<span class="k">Turned so far</span> ${dgs(W.turned)}`);
          if (fl.reg) rows.push(`<span class="k">Each turn</span> 360 ÷ ${n} ${360 % n ? '≈' : '='} ${dgs(360 / n)}`, `<span class="k">Each inside angle</span> 180° − ${dgs(360 / n)} ${360 % n ? '≈' : '='} ${dgs(180 - 360 / n)}`);
          else rows.push(`<span class="k">The turns differ:</span> ${arcs.map((_, i) => dg(extOf(arcs, i + 1))).join(', ')} (they add to 360°)`);
        } else {
          rows.push('<span class="k">Practice mode.</span> Use the Practice box below the readout.');
        }
        ro.innerHTML = rows.join('<br>');
      };

      const showGroups = () => {
        const m = fl.mode;
        gTear.style.display = m === 'tear' ? '' : 'none'; gIso.style.display = m === 'iso' ? '' : 'none';
        gPoly.style.display = m === 'poly' ? '' : 'none'; gExt.style.display = m === 'ext' ? '' : 'none';
        qbox.style.display = m === 'prac' ? 'none' : ''; ro.style.display = m === 'prac' ? 'none' : '';
        pbox.style.display = m === 'prac' ? '' : 'none';
      };
      function sync() {
        P.draw(); updRo();
        sA.set(st.A); sB.set(st.B); sTh.set(st.th);
        if (fl.mode === 'ext') sE.set(fl.nE);
        sP.set(fl.nP); showGroups();
      }

      /* ---------- practice ---------- */
      const startPrac = () => {
        stopAll(); fl.mode = 'prac'; pr.on = true;
        if (pr.first.length <= pr.i) { pr.solved = false; pr.pd = []; pr.tries = 0; }
        showGroups(); refreshPrac(); sync();
      };
      const refreshPrac = () => {
        if (pr.i >= PRAC.length) {
          const s = pr.first.filter(Boolean).length;
          QP.tip(`<b>All done.</b> You got ${s} of ${PRAC.length} right on the first try. Press <b>Restart</b> to go again, or step back to a lesson step to explore.`);
          return;
        }
        const q = pcur(), answered = pr.first.length, score = pr.first.filter(Boolean).length;
        QP.show({
          head: `Problem ${pr.i + 1} of ${PRAC.length} · right on the first try: ${score} of ${answered}`,
          q: q.q, choices: q.choices, answer: q.answer,
          say: i => i === q.answer ? { ok: true, html: '<b>Right.</b> ' + q.why } : { ok: false, html: q.no[i] },
          onPick: (i, ok) => { if (ok) { pr.solved = true; if (pr.first.length === pr.i) pr.first.push(pr.tries === 0); if (q.kind === 'poly') pr.pd = [2, 3, 4, 5]; } else pr.tries++; },
          onRight: () => { sync(); },
          next: { label: pr.i + 1 < PRAC.length ? 'Next problem' : 'See results', fn: () => { pr.i++; pr.tries = 0; pr.solved = false; pr.pd = []; refreshPrac(); sync(); } }
        });
        if (q.kind === 'poly') pbox.append(h('button', { type: 'button', class: 'btn', style: 'align-self:flex-start', onclick: () => nextDiag(true) }, 'Draw next diagonal'));
      };

      /* ---------- pointer ---------- */
      draggable(P, {
        hit: (px, py) => {
          if (fl.mode === 'tear') {
            for (const k of [2, 1, 0]) if (wh[k] && near(P, wh[k][0], wh[k][1], px, py, 20)) return 'w' + k;
            if (apexPos && near(P, apexPos[0], apexPos[1], px, py, 18)) return 'apex';
          } else if (fl.mode === 'iso' && bPos && near(P, bPos[0], bPos[1], px, py, 20)) return 'th';
          return null;
        },
        move: (hd, x, y) => {
          if (hd === 'apex') {
            const V = triG(st.A, st.B);
            setAB(Math.atan2(y - V[0][1], x - V[0][0]) / D, Math.atan2(y - V[1][1], V[1][0] - x) / D);
          } else if (hd === 'th') {
            const T = isoG(st.th).T; setTh(2 * Math.atan2(x - T[0], T[1] - y) / D);
          } else {
            const k = +hd[1];
            if (!fl.guessT) { Q.warn('Make your guess first (pick an answer above). Then tear.'); P.draw(); return; }
            const V = triG(st.A, st.B)[k], O = [0, -3.0], dx = O[0] - V[0], dy = O[1] - V[1];
            const raw = ((x - V[0]) * dx + (y - V[1]) * dy) / (dx * dx + dy * dy), key = ['tA', 'tB', 'tC'][k];
            if (grab == null) grab = st[key] - raw;
            stopKeys([key]);
            let t = clamp(raw + grab, 0, 1); if (t > .93) t = 1; if (t < .07) t = 0;
            st[key] = t; sync();
          }
        }
      });
      P.canvas.addEventListener('pointerup', () => { grab = null; });
      P.canvas.addEventListener('pointercancel', () => { grab = null; });
      P.canvas.addEventListener('click', e => {
        const r = P.canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
        let best = null, bd = 26; vhits.forEach(v => { const d = Math.hypot(v.x - px, v.y - py); if (d < bd) { bd = d; best = v; } });
        if (!best) return;
        if (fl.mode === 'poly') toggleDiag(best.i);
        else if (fl.mode === 'prac' && pcur() && pcur().kind === 'poly') {
          const i = best.i;
          if (i >= 2 && i <= 5) pr.pd = pr.pd.includes(i) ? pr.pd.filter(d => d !== i) : [...pr.pd, i].sort((a, b) => a - b);
          sync();
        }
      });

      /* ---------- steps ---------- */
      const apply = (patch, immediate) => {
        stopAll();
        const num = {}, fx = {};
        Object.keys(patch).forEach(k => { (NUM.includes(k) ? num : fx)[k] = patch[k]; });
        if (fx.mode) {
          fl.mode = fx.mode; fl.msg = ''; pr.on = false;
          if (fx.mode === 'tear') { fl.puz = -1; fl.puzOk = false; fl.guessT = false; fl.tearRight = false; }
          if (fx.mode === 'iso') { fl.isoI = 0; fl.rev = false; st.fold = 0; fl.thT = ISO_Q[0].th; }
          if (fx.mode === 'poly') { fl.diag = []; fl.guessP = false; fl.polyRight = false; fl.done = {}; fl.sumDone = false; }
          if (fx.mode === 'ext') { fl.guessE = false; fl.qE = 0; st.w = 0; sW.set(0); }
        }
        if (fx.nP != null) fl.nP = fx.nP;
        if (fx.nE != null) fl.nE = fx.nE;
        if (fx.reg != null) { fl.reg = fx.reg; regP.checked = fx.reg; regE.checked = fx.reg; }
        if (immediate) { Object.assign(st, num); }
        else if (Object.keys(num).length) go(num, 900);
        refreshQuiz(); sync();
      };

      refreshQuiz(); sync();
      return { destroy: () => { stopAll(); P.destroy(); }, apply };
    }
  });
}
