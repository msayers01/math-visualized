/* =====================================================================
   SCHOOL — Area by decomposition
   ===================================================================== */
{
  const PW = 12, PH = 9, X0 = 1, Y0 = 2;      /* the grid is 12 wide and 9 tall; shapes start at (1, 2) */
  const MI = '−';
  const fs = p => clamp(p.scale * .5, 14.5, 20);
  const TX = (p, t, x, y, o = {}) => p.label(t, x, y, Object.assign({ size: fs(p), italic: false }, o));
  const ab = (a, b) => Math.abs(a - b);
  const bars = (a, b) => `|${num(a)} ${MI} ${num(b)}|`;
  const kk = t => `<span class="k">${t}</span>`;
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const near0 = v => Math.abs(v) < 1e-6;
  const HOUSE = { w: 6, hh: 3, rf: 3 };

  /* ---------- geometry helpers ---------- */
  const area = poly => { let s = 0; poly.forEach((a, i) => { const b = poly[(i + 1) % poly.length]; s += a[0] * b[1] - b[0] * a[1]; }); return Math.abs(s) / 2; };
  const clip = (poly, ax, v, ge) => {
    const out = [], inside = q => (ge ? q[ax] >= v - 1e-9 : q[ax] <= v + 1e-9);
    poly.forEach((a, i) => {
      const b = poly[(i + 1) % poly.length], ia = inside(a), ib = inside(b);
      if (ia) out.push(a);
      if (ia !== ib) { const t = (v - a[ax]) / (b[ax] - a[ax]); out.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t)]); }
    });
    return out;
  };
  const segAt = (poly, ax, v) => {       /* the stretch of the line (ax = v) that lies inside the shape */
    const o = 1 - ax, vals = [];
    poly.forEach((a, i) => {
      const b = poly[(i + 1) % poly.length];
      if (near0(a[ax] - v)) vals.push(a[o]);
      if ((a[ax] - v) * (b[ax] - v) < -1e-12) vals.push(lerp(a[o], b[o], (v - a[ax]) / (b[ax] - a[ax])));
    });
    const lo = Math.min(...vals), hi = Math.max(...vals);
    return ax === 1 ? [[lo, v], [hi, v]] : [[v, lo], [v, hi]];
  };
  const outN = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dy / l, -dx / l]; };   /* outward for a counterclockwise shape */
  const centre = poly => { const xs = poly.map(q => q[0]), ys = poly.map(q => q[1]); return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2]; };
  const turn = (q, m, a) => { const dx = q[0] - m[0], dy = q[1] - m[1], c = Math.cos(a), s = Math.sin(a); return [m[0] + dx * c - dy * s, m[1] + dx * s + dy * c]; };
  const shift = (poly, dx, dy) => poly.map(q => [q[0] + dx, q[1] + dy]);

  /* coordinates written beside each vertex */
  const vlabs = (p, poly, o = {}) => {
    const n = poly.length, size = fs(p);
    poly.forEach((q, i) => {
      if (o.skip && o.skip.includes(i)) return;
      const n1 = outN(poly[(i + n - 1) % n], q), n2 = outN(q, poly[(i + 1) % n]);
      let vx = n1[0] + n2[0], vy = n1[1] + n2[1]; const l = Math.hypot(vx, vy) || 1; vx /= l; vy /= l;
      const t = `(${num(q[0])}, ${num(q[1])})`, w = t.length * size * .47;
      let dx = vx * (w / 2 + 12);
      dx = clamp(dx, p.X(0) + 6 + w / 2 - p.X(q[0]), p.w - 4 - w / 2 - p.X(q[0]));
      p.label(t, q[0], q[1], { size, italic: false, color: p.pal.muted, dx, dy: -vy * (16 + 5 * Math.abs(vy)) });
    });
  };
  /* length of every horizontal and vertical side, beside the side */
  const sidelabs = (p, poly) => {
    const n = poly.length, size = fs(p), pal = p.pal;
    poly.forEach((a, i) => {
      const b = poly[(i + 1) % n], hor = near0(a[1] - b[1]), ver = near0(a[0] - b[0]);
      if (!hor && !ver) return;
      const L = hor ? ab(a[0], b[0]) : ab(a[1], b[1]), nn = outN(a, b), t = num(L);
      p.label(t, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, { size, italic: false, color: hor ? pal.green : pal.red, dx: nn[0] * (9 + t.length * size * .25), dy: -nn[1] * 17 });
    });
  };
  const heightLab = (p, t, x, y, right) => { const left = !right && x * p.scale >= 100; TX(p, t, x, y, { color: p.pal.red, dx: left ? -10 : 10, align: left ? 'right' : 'left' }); };
  const rightAngle = (p, x, y, d = .38) => p.path([[x + d, y], [x + d, y + d], [x, y + d]], { stroke: p.pal.red, width: 1.6 });
  const shape = (p, poly, fill, stroke, width = 3, dash) => p.path(poly, { fill, stroke, width, close: true, dash });

  const plot = p => {
    const pal = p.pal, c = p.ctx;
    p.fit(PW, PH, { l: 1, r: 1.2, t: 1.7, b: 1 });
    c.lineWidth = 1; c.strokeStyle = pal.grid; c.beginPath();
    for (let x = 0; x <= PW; x++) { c.moveTo(p.X(x), p.Y(0)); c.lineTo(p.X(x), p.Y(PH)); }
    for (let y = 0; y <= PH; y++) { c.moveTo(p.X(0), p.Y(y)); c.lineTo(p.X(PW), p.Y(y)); }
    c.stroke();
    p.path([[0, PH], [0, 0], [PW, 0]], { stroke: pal['grid-strong'], width: 1.8 });
    const st2 = p.scale < 26 ? 2 : 1, size = clamp(p.scale * .42, 12.5, 16);
    for (let x = 0; x <= PW; x += st2) p.label(String(x), x, 0, { size, italic: false, color: pal.muted, dy: 13 });
    for (let y = st2; y <= PH; y += st2) p.label(String(y), 0, y, { size, italic: false, color: pal.muted, dx: -9, align: 'right' });
    p.label('x', PW + .55, 0, { size, color: pal.muted }); p.label('y', 0, PH + .5, { size, color: pal.muted });
  };
  const ring = (p, x, y) => p.dot(x, y, 9, p.pal.stage, p.pal.brass, 3);

  /* ---------- practice problems (a fixed list) ---------- */
  const PROBS = [
    { name: 'Parallelogram garden bed', kind: 'choice', poly: [[2, 2], [8, 2], [11, 6], [5, 6]], tag: [['slant side 5', 2.4, 4.9]], dash: [[5, 6, 5, 2]],
      q: 'A garden bed is a parallelogram with corners (2, 2), (8, 2), (11, 6) and (5, 6). Its slanted sides are 5 long. Each grid square is 1 square meter. How many square meters is the bed?',
      ch: [
        ['12 square meters', '12 is half of 24. Half is for triangles. A parallelogram uses the whole base times height.'],
        ['30 square meters', '30 is 6 × 5. The 5 is the slanted side. The height is the straight-up distance between the bottom row and the top row: |6 − 2| = 4.'],
        ['24 square meters', 'Yes. The base along the bottom is |8 − 2| = 6. The height is |6 − 2| = 4. Cut the left triangle off and slide it to the right to get a 6 by 4 rectangle: 6 × 4 = 24.'],
        ['20 square meters', '20 is 5 × 4, the slanted side times the height. Use the base, which lies along the bottom: 6 × 4 = 24.']], ans: 2 },
    { name: 'Triangle on the grid', kind: 'choice', poly: [[2, 2], [8, 2], [4, 7]], tag: [], dash: [[4, 7, 4, 2]],
      q: 'A triangle has corners (2, 2), (8, 2) and (4, 7). Each grid square is 1 square unit. What is its area?',
      ch: [
        ['30 square units', '30 is 6 × 5, a whole parallelogram. A triangle is only half of base times height: 6 × 5 ÷ 2 = 15.'],
        ['15 square units', 'Yes. The base is |8 − 2| = 6 and the height is |7 − 2| = 5. Two copies make a parallelogram with area 30, so one triangle is 15.'],
        ['21 square units', '21 is 6 × 7 ÷ 2. The 7 is the y-coordinate of the top corner, not the height. The height is a difference: |7 − 2| = 5.'],
        ['11 square units', '11 is 6 + 5. Area multiplies the lengths. It does not add them.']], ans: 1 },
    { name: 'Make the area 12', kind: 'apex', base: [[2, 2], [8, 2]], start: [3, 5], want: 12,
      q: 'The base of a triangle runs from (2, 2) to (8, 2). Move the top corner so that the area is exactly 12 square units. Then press Check.' },
    { name: 'Trapezoid garden bed', kind: 'choice', poly: [[1, 2], [11, 2], [8, 7], [4, 7]], tag: [], dash: [[4, 7, 4, 2]],
      q: 'A garden bed is a trapezoid with corners (1, 2), (11, 2), (8, 7) and (4, 7). The bottom and top sides are parallel. Each grid square is 1 square meter. How many square meters is the bed?',
      ch: [
        ['20 square meters', '20 is the top (4) times the height (5). Both parallel sides count. Use their average: (10 + 4) ÷ 2 = 7.'],
        ['50 square meters', '50 uses only the bottom side, 10 × 5. The top is shorter. Use the average of both parallel sides: 7, and 7 × 5 = 35.'],
        ['70 square meters', '70 is (10 + 4) × 5, the area of the parallelogram made from two copies. One trapezoid is half of that: 35.'],
        ['35 square meters', 'Yes. The parallel sides are |11 − 1| = 10 and |8 − 4| = 4. The height is |7 − 2| = 5. (10 + 4) ÷ 2 × 5 = 7 × 5 = 35.']], ans: 3 },
    { name: 'L-shaped floor and tiles', kind: 'choice', poly: [[1, 2], [9, 2], [9, 5], [5, 5], [5, 8], [1, 8]], tag: [], dash: [[1, 5, 9, 5]],
      q: 'An L-shaped floor has corners (1, 2), (9, 2), (9, 5), (5, 5), (5, 8) and (1, 8). Each grid square is 1 square meter. Tiles cost $3 for each square meter. How much do the tiles for the whole floor cost?',
      ch: [
        ['$108', 'Yes. Cut along y = 5. The bottom rectangle is |9 − 1| × |5 − 2| = 8 × 3 = 24. The top rectangle is |5 − 1| × |8 − 5| = 4 × 3 = 12. The floor is 36 square meters, and 36 × 3 = $108.'],
        ['$144', '144 is 48 × 3. You covered the whole 8 by 6 rectangle, but the top right corner is not part of the floor. Take away that 4 by 3 corner (12), or cut the L into two rectangles.'],
        ['$36', '36 is the area, not the cost. Each square meter costs $3, so multiply: 36 × 3 = $108.'],
        ['$84', '84 is 28 × 3, and 28 is the distance around the edge. Tiles cover the inside, so use the area (36), not the edge.']], ans: 0 },
    { name: 'House front and paint', kind: 'choice', poly: [[2, 2], [10, 2], [10, 6], [6, 8], [2, 6]], tag: [], dash: [[2, 6, 10, 6]],
      q: 'The front of a house has corners (2, 2), (10, 2), (10, 6), (6, 8) and (2, 6). The walls are a rectangle and the roof is a triangle on top. Each grid square is 1 square meter. How many square meters of the front need paint?',
      ch: [
        ['32 square meters', '32 is only the rectangle, 8 × 4. The triangle under the roof is part of the front: ½ × 8 × 2 = 8. So 32 + 8 = 40.'],
        ['40 square meters', 'Yes. The rectangle is |10 − 2| × |6 − 2| = 8 × 4 = 32. The triangle has base 8 and height |8 − 6| = 2, so its area is ½ × 8 × 2 = 8. Total 32 + 8 = 40.'],
        ['48 square meters', '48 is 8 × 6, the big rectangle around the whole house. The two corners beside the roof are empty, so that is too much.'],
        ['24 square meters', '24 is ½ × 8 × 6. That treats the whole house as one triangle. It is a rectangle with a triangle on top, so find the two areas and add them.']], ans: 1 }
  ];

  register({
    id: 'area-by-decomposition', level: 'school',
    title: 'Area by decomposition',
    blurb: 'Cut shapes on a coordinate grid and slide the pieces into rectangles to see why base times height works.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 5; p.cy = 4; p.span = 5.2;
      p.grid(1, { axes: false });
      const L = [[1, 1], [9, 1], [9, 4], [5, 4], [5, 7], [1, 7]];
      p.path(L, { fill: alpha(pal.yellow, .26), stroke: pal.blue, width: 3, close: true });
      p.path([[1, 4], [9, 4]], { stroke: pal.violet, width: 2.4, dash: [6, 5] });
      p.path([[1, 1], [9, 1]], { stroke: pal.green, width: 3.2 });
      p.path([[1, 1], [1, 7]], { stroke: pal.red, width: 3.2 });
    },
    hook: String.raw`A floor is an L shape. A garden bed leans over to one side. A roof is a triangle. How can you find the area of a shape that is not a rectangle, when you only know how to count squares?`,
    steps: [
      { title: 'Slide a piece to make a rectangle',
        text: String.raw`<p>This garden bed is a <b>parallelogram</b>. Its <b>base</b> is 6 and its <b>height</b> is the straight-up distance, 3. The slanted side is 5, but it is not the height. One square is 1 square meter.</p><p>Pick a prediction in the panel. Then a cut and a slide play. Use the cut handle and the slide slider to replay them, then drag the top right corner to change the slant.</p>`,
        set: { mode: 'para', pb: 6, ph: 3, ps: 4, pc: 0, pslide: 0 } },
      { title: 'A triangle is half',
        text: String.raw`<p>Two copies of a triangle fit together into a parallelogram. So a triangle is <b>half of base times height</b>.</p><p>Here the area is \(\tfrac12 \times 6 \times 4 = 12\). Predict what happens when you drag the top corner sideways along the dashed line. Then turn the copy with the slider.</p>`,
        set: { mode: 'tri', tb: 6, tax: 4, tth: 4, tflip: 0 } },
      { title: 'A trapezoid is a half too',
        text: String.raw`<p>A <b>trapezoid</b> has one pair of parallel sides. Here they are 6 and 2. Turn a copy upside down beside it. The two make a parallelogram with base \(6+2=8\) and height 4.</p><p>One trapezoid is half: \((6+2)\div 2 \times 4 = 16\). Turn the copy and change the sides.</p>`,
        set: { mode: 'trap', zb1: 6, zb2: 2, zh: 4, zo: 1, zflip: 0 } },
      { title: 'Cut an L-shaped room',
        text: String.raw`<p>This room has corners on the grid. A side length is a subtraction: the bottom side is \(|9-1|=8\).</p><p>Choose to cut the room into rectangles, or fill the corner and subtract. Place the cut so both pieces are rectangles. Set each piece's area, then press Check.</p>`,
        set: { mode: 'comp', shape: 'L', cm: 'cutH', cpos: 1, LW: 8, LH: 6, Lw2: 3, Lh2: 2 } }
    ],
    formal: String.raw`
      <p>The area of a shape is how many unit squares fit inside it. A rectangle that is \(b\) wide and \(h\) tall holds \(h\) rows of \(b\) squares, so its area is \(b\times h\). Every other shape here is turned into rectangles.</p>
      <h3>Parallelogram: base times height</h3>
      <p>The <em>height</em> is the straight-up distance between the base and the opposite side. It is not the slanted side. Draw a vertical line from a top corner down to the base. It cuts off a right triangle. Slide that triangle to the other end. The slanted edge of the piece lands exactly on the slanted edge on the other side, because opposite sides are parallel and equal. Nothing was added or lost, so the area did not change. The new shape is a rectangle with the same base and the same height.
      \[ A_{\text{parallelogram}} = b\times h. \]
      The slant changes the cut piece but not the base or the height, so it does not change the area.</p>
      <h3>Triangle: half of base times height</h3>
      <p>Turn a copy of the triangle half a turn around the middle of one side. The two triangles make a parallelogram with the same base and height. The triangle is half of it:
      \[ A_{\text{triangle}} = \tfrac12\, b\, h. \]
      If the top corner slides sideways along a line parallel to the base, the base and the height stay the same, so the area stays the same.</p>
      <h3>Trapezoid: average of the parallel sides, times height</h3>
      <p>A trapezoid with parallel sides \(a\) and \(b\) and height \(h\) turns, with a copy, into a parallelogram with base \(a+b\) and height \(h\). The trapezoid is half of it:
      \[ A_{\text{trapezoid}} = \frac{a+b}{2}\times h. \]
      The trapezoid in the lesson has \(a=6\), \(b=2\) and \(h=4\), so \(A = 4\times 4 = 16\).</p>
      <h3>Composite shapes</h3>
      <p>To find the area of an L shape or a house outline, use one of two plans. <em>Cut</em> it into rectangles and triangles, find each area and add. Or <em>fill in</em> a missing corner to make one big rectangle, then subtract the area you added. The cut must pass through a corner so that every piece is a shape you know. Both plans give the same total.</p>
      <p>Example. An L-shaped floor has corners \((1,2)\), \((9,2)\), \((9,5)\), \((5,5)\), \((5,8)\), \((1,8)\). Cut along \(y=5\): the bottom piece is \(8\times 3=24\), the top piece is \(4\times 3=12\), and the floor is \(36\). Fill in the corner instead: \(8\times 6-4\times 3=48-12=36\).</p>
      <h3>Coordinates give lengths</h3>
      <p>On a coordinate grid, two points with the same second coordinate lie on a horizontal line, and the distance between them is the difference of the first coordinates, taken without a sign: \(|x_2-x_1|\). Points with the same first coordinate lie on a vertical line, and the distance is \(|y_2-y_1|\). For \((1,2)\) and \((9,2)\), the distance is \(|9-1|=8\).</p>
      <p>Be careful: the area is in <em>square</em> units. If one square is 1 square meter, then 36 squares are 36 square meters. Tiles at \(\$3\) a square meter cost \(36\times 3=\$108\).</p>`,
    check: [
      { q: 'A parallelogram has a bottom side of 10 cm. Its slanted side is 6 cm long. The straight-up distance between its bottom and top sides is 5 cm. What is its area?',
        choices: ['60 square cm, because 10 × 6 = 60', '50 square cm, because 10 × 5 = 50', '25 square cm, because ½ × 10 × 5 = 25', '16 square cm, because 10 + 6 = 16'], answer: 1,
        why: String.raw`The area is base times height, and the height is the straight-up distance, 5. So \(10\times 5=50\). The slanted side (6) is longer than the height and is not used. Half is for triangles, and adding lengths never gives an area.`,
        hint: 'Slide the cut triangle to the other end. Which two lengths describe the rectangle you get?' },
      { q: 'An L-shaped floor has corners (0, 0), (10, 0), (10, 4), (6, 4), (6, 9) and (0, 9). One grid unit is 1 meter. Tiles cost $3 for each square meter. How much do the tiles for the whole floor cost?',
        choices: ['$70', '$270', '$282', '$210'], answer: 3,
        why: String.raw`Cut along \(y=4\). The bottom piece is \(|10-0|\times|4-0|=10\times 4=40\). The top piece is \(|6-0|\times|9-4|=6\times 5=30\). The floor is \(40+30=70\) square meters, and \(70\times 3=\$210\). $70 forgets the price. $270 covers the whole \(10\times 9\) rectangle at $3 a square meter. $282 adds \(10\times 4\) and \(6\times 9\), which counts the bottom left block twice.`,
        hint: 'Cut the L into two rectangles first. Find each side length by subtracting coordinates. Then multiply the total by 3.' },
      { q: 'Mia finds the area of a triangle with corners (1, 1), (7, 1) and (3, 5). She writes:<br>Step 1. Base = |7 − 1| = 6.<br>Step 2. Height = |5 − 1| = 4.<br>Step 3. Area = 6 × 4 = 24 square units.<br>Which statement is true?',
        choices: ['Step 3 is wrong: a triangle is half of base times height, so the area is 12.', 'Step 1 is wrong: the base should be 7 + 1 = 8.', 'Step 2 is wrong: the height should be the slanted side.', 'Nothing is wrong: the area is 24.'], answer: 0,
        why: String.raw`Steps 1 and 2 are right: the base and the height come from subtracting coordinates. But \(6\times 4=24\) is the area of a parallelogram with that base and height. Two copies of the triangle make that parallelogram, so the triangle is half: \(\tfrac12\times 6\times 4=12\).`,
        hint: 'Two copies of a triangle make a parallelogram. How does the area of one copy compare with the parallelogram?' }
    ],
    links: { related: ['area-of-a-circle', 'scale-drawings-and-proportions', 'similarity-and-scaling', 'distance-and-the-pythagorean-theorem', 'angle-relationships-and-parallel-lines', 'angles-in-triangles-and-polygons', 'rigid-motions-and-congruence'] },

    mount({ stage, controls: C }) {
      const st = {
        mode: 'para', practice: false,
        pb: 6, ph: 3, ps: 4, pc: 0, pslide: 0,
        tb: 6, tax: 4, tth: 4, tflip: 0,
        zb1: 6, zb2: 2, zh: 4, zo: 1, zflip: 0,
        shape: 'L', cm: 'cutH', cpos: 1, LW: 8, LH: 6, Lw2: 3, Lh2: 2, a1: 0, a2: 0, said: '',
        pax: 3, pay: 5
      };
      const locked = { para: true, tri: true };
      let cancel = () => {};
      const panel = stage.nextElementSibling;
      const P = new Plane(stage, { span: 6 });

      /* ----- shapes as lists of points ----- */
      const paraPoly = () => [[X0, Y0], [X0 + st.pb, Y0], [X0 + st.pb + st.ps, Y0 + st.ph], [X0 + st.ps, Y0 + st.ph]];
      const triPoly = () => [[X0, Y0], [X0 + st.tb, Y0], [st.tax, Y0 + st.tth]];
      const trapPoly = () => [[X0, Y0], [X0 + st.zb1, Y0], [X0 + st.zo + st.zb2, Y0 + st.zh], [X0 + st.zo, Y0 + st.zh]];
      const Lpoly = () => { const { LW, LH, Lw2, Lh2 } = st; return [[X0, Y0], [X0 + LW, Y0], [X0 + LW, Y0 + Lh2], [X0 + Lw2, Y0 + Lh2], [X0 + Lw2, Y0 + LH], [X0, Y0 + LH]]; };
      const housePoly = () => [[X0, Y0], [X0 + HOUSE.w, Y0], [X0 + HOUSE.w, Y0 + HOUSE.hh], [X0 + HOUSE.w / 2, Y0 + HOUSE.hh + HOUSE.rf], [X0, Y0 + HOUSE.hh]];
      const compPoly = () => (st.shape === 'L' ? Lpoly() : housePoly());
      const paraDone = () => near0(st.ps) || (near0(st.pc - st.ps) && st.pslide > .999);

      /* the pieces of the composite shape for the chosen plan, and whether each is a shape we can measure */
      const pieces = () => {
        const poly = compPoly(), k = st.cpos;
        if (st.shape === 'H') {
          const v = Y0 + k, ok = near0(k - HOUSE.hh);
          return { ok, line: segAt(poly, 1, v), a: clip(poly, 1, v, false), b: clip(poly, 1, v, true), sub: false,
            d: ok ? [{ w: HOUSE.w, h: HOUSE.hh, t: 0 }, { w: HOUSE.w, h: HOUSE.rf, t: 1 }] : null, ln: ['The wall', 'The roof'] };
        }
        const { LW, LH, Lw2, Lh2 } = st;
        if (st.cm === 'cutH') {
          const v = Y0 + k, ok = near0(k - Lh2);
          return { ok, line: segAt(poly, 1, v), a: clip(poly, 1, v, false), b: clip(poly, 1, v, true), sub: false,
            d: ok ? [{ w: LW, h: k }, { w: Lw2, h: LH - k }] : null };
        }
        if (st.cm === 'cutV') {
          const v = X0 + k, ok = near0(k - Lw2);
          return { ok, line: segAt(poly, 0, v), a: clip(poly, 0, v, false), b: clip(poly, 0, v, true), sub: false,
            d: ok ? [{ w: k, h: LH }, { w: LW - k, h: Lh2 }] : null };
        }
        return { ok: true, line: null, sub: true,
          a: [[X0, Y0], [X0 + LW, Y0], [X0 + LW, Y0 + LH], [X0, Y0 + LH]], b: [[X0 + Lw2, Y0 + Lh2], [X0 + LW, Y0 + Lh2], [X0 + LW, Y0 + LH], [X0 + Lw2, Y0 + LH]],
          d: [{ w: LW, h: LH }, { w: LW - Lw2, h: LH - Lh2 }] };
      };
      const dArea = d => (d.t ? d.w * d.h / 2 : d.w * d.h);
      const dText = d => (d.t ? `½ × ${num(d.w)} × ${num(d.h)}` : `${num(d.w)} × ${num(d.h)}`);

      /* ----- the picture ----- */
      const handles = () => {
        if (st.practice) { const pr = PROBS[prIdx]; return pr.kind === 'apex' && !prSolved ? [{ id: 'PA', x: st.pax, y: st.pay }] : []; }
        if (st.mode === 'para') {
          if (locked.para) return [];
          const cutTop = st.ps > 1e-9 ? st.ph * st.pc / st.ps : st.ph;
          return [{ id: 'pC', x: X0 + st.pb + st.ps, y: Y0 + st.ph }, { id: 'pB', x: X0 + st.pb, y: Y0 }, { id: 'pcut', x: X0 + st.pc, y: Y0 + cutTop }];
        }
        if (st.mode === 'tri') return locked.tri ? [] : [{ id: 'tA', x: st.tax, y: Y0 + st.tth }, { id: 'tB', x: X0 + st.tb, y: Y0 }];
        if (st.mode === 'trap') return [{ id: 'zC', x: X0 + st.zo + st.zb2, y: Y0 + st.zh }, { id: 'zD', x: X0 + st.zo, y: Y0 + st.zh }, { id: 'zB', x: X0 + st.zb1, y: Y0 }];
        const out = [], pc = pieces();
        if (pc.line) out.push({ id: 'ccut', x: (pc.line[0][0] + pc.line[1][0]) / 2, y: (pc.line[0][1] + pc.line[1][1]) / 2 });
        if (st.shape === 'L') { const q = Lpoly(); out.push({ id: 'v3', x: q[3][0], y: q[3][1] }, { id: 'v2', x: q[2][0], y: q[2][1] }, { id: 'v4', x: q[4][0], y: q[4][1] }, { id: 'v1', x: q[1][0], y: q[1][1] }, { id: 'v5', x: q[5][0], y: q[5][1] }); }
        return out;
      };

      const caption = () => {
        if (st.practice) return `Problem ${prIdx + 1} of ${PROBS.length}: ${PROBS[prIdx].name}`;
        if (st.mode === 'para') {
          if (locked.para) return 'Pick a prediction in the panel';
          if (paraDone()) return `Area = ${num(st.pb)} × ${num(st.ph)} = ${num(st.pb * st.ph)} square units`;
          return near0(st.pc - st.ps) ? 'Slide the piece to the other end' : 'Drag the cut to the top corner';
        }
        if (st.mode === 'tri') {
          if (locked.tri) return 'Pick a prediction in the panel';
          const A = st.tb * st.tth;
          return st.tflip > .999 ? `Parallelogram ${num(A)}, so triangle ${num(A / 2)}` : `Area = ½ × ${num(st.tb)} × ${num(st.tth)} = ${num(A / 2)} square units`;
        }
        if (st.mode === 'trap') {
          const s = st.zb1 + st.zb2, A = s * st.zh;
          return st.zflip > .999 ? `Parallelogram ${num(A)}, so trapezoid ${num(A / 2)}` : `Area = (${num(st.zb1)} + ${num(st.zb2)}) ÷ 2 × ${num(st.zh)} = ${num(A / 2)}`;
        }
        const pc = pieces();
        if (!pc.ok) return 'Move the cut to a corner';
        return 'Both pieces are shapes you know';
      };

      const drawPara = p => {
        const pal = p.pal, { pb, ph, ps, pc, pslide } = st, poly = paraPoly(), c = X0 + pc, size = fs(p);
        const R = clip(poly, 0, c, true), L = clip(poly, 0, c, false), dx = pslide * pb, full = near0(pc - ps) && pslide > .999;
        if (R.length > 2 && area(R) > 1e-6) shape(p, R, alpha(pal.yellow, .3), pal.blue, 3.2);
        if (L.length > 2 && area(L) > 1e-6) shape(p, shift(L, dx, 0), alpha(pal.violet, .38), pal.violet, 3);
        const cutTop = ps > 1e-9 ? ph * pc / ps : ph;
        if (pslide < .02 && cutTop > .01) p.path([[c, Y0], [c, Y0 + cutTop]], { stroke: pal.violet, width: 2.4, dash: [6, 5] });
        if (full || near0(ps)) shape(p, [[X0 + ps, Y0], [X0 + ps + pb, Y0], [X0 + ps + pb, Y0 + ph], [X0 + ps, Y0 + ph]], null, pal.blue, 3.6);
        /* base and height */
        const bx = paraDone() ? X0 + ps : X0;
        p.path([[bx, Y0], [bx + pb, Y0]], { stroke: pal.green, width: 5 });
        const hx = X0 + ps;
        p.path([[hx, Y0], [hx, Y0 + ph]], { stroke: pal.red, width: 3.2, dash: [7, 5] });
        rightAngle(p, hx, Y0);
        TX(p, `base ${num(pb)}`, bx + pb / 2, Y0, { color: pal.green, dy: 33 });
        heightLab(p, `height ${num(ph)}`, hx, Y0 + ph / 2);
        if (pslide < .5 && !near0(ps)) {
          const l = Math.hypot(ps, ph), nx = -ph / l, ny = ps / l;
          TX(p, `slant ${num(+l.toFixed(1))}`, X0 + ps / 2, Y0 + ph / 2, { color: pal.muted, dx: nx * 42, dy: -ny * 24 });
        }
        if (pslide < .02) vlabs(p, poly);
      };

      const drawTri = p => {
        const pal = p.pal, { tb, tax, tth, tflip } = st, poly = triPoly(), A = poly[0], B = poly[1], Cc = poly[2];
        const M = [(B[0] + Cc[0]) / 2, (B[1] + Cc[1]) / 2], top = Y0 + tth;
        p.path([[0, top], [PW, top]], { stroke: pal.muted, width: 1.5, dash: [3, 6] });
        TX(p, 'same height', PW - .1, top, { color: pal.muted, align: 'right', dy: -14 });
        if (tflip > .001) {
          const cp = poly.map(q => turn(q, M, Math.PI * tflip));
          shape(p, cp, alpha(pal.violet, .34), pal.violet, 3);
        }
        shape(p, poly, alpha(pal.yellow, .32), pal.blue, 3.5);
        if (tflip > .999) shape(p, [A, B, [B[0] + Cc[0] - A[0], B[1] + Cc[1] - A[1]], Cc], null, pal.blue, 2, [8, 6]);
        p.path([[X0, Y0], [X0 + tb, Y0]], { stroke: pal.green, width: 5 });
        if (tax < X0 - 1e-9 || tax > X0 + tb + 1e-9) p.path(tax < X0 ? [[tax, Y0], [X0, Y0]] : [[X0 + tb, Y0], [tax, Y0]], { stroke: pal.muted, width: 2, dash: [4, 5] });
        p.path([[tax, Y0], [tax, top]], { stroke: pal.red, width: 3.2, dash: [7, 5] });
        rightAngle(p, tax, Y0, tax >= X0 + tb - 1e-9 ? -.38 : .38);
        TX(p, `base ${num(tb)}`, X0 + tb / 2, Y0, { color: pal.green, dy: 33 });
        heightLab(p, `height ${num(tth)}`, tax, Y0 + tth / 2);
        vlabs(p, poly, { skip: tflip > .5 ? [2] : [] });
      };

      const drawTrap = p => {
        const pal = p.pal, { zb1, zb2, zh, zo, zflip } = st, poly = trapPoly(), B = poly[1], Cc = poly[2];
        const M = [(B[0] + Cc[0]) / 2, (B[1] + Cc[1]) / 2];
        if (zflip > .001) shape(p, poly.map(q => turn(q, M, Math.PI * zflip)), alpha(pal.violet, .34), pal.violet, 3);
        shape(p, poly, alpha(pal.yellow, .32), pal.blue, 3.5);
        if (zflip > .999) shape(p, [poly[0], [X0 + zb1 + zb2, Y0], [X0 + zo + zb1 + zb2, Y0 + zh], poly[3]], null, pal.blue, 2, [8, 6]);
        p.path([[X0, Y0], [X0 + zb1, Y0]], { stroke: pal.green, width: 5 });
        p.path([[X0 + zo, Y0 + zh], [X0 + zo + zb2, Y0 + zh]], { stroke: pal.green, width: 5 });
        p.path([[X0 + zo, Y0], [X0 + zo, Y0 + zh]], { stroke: pal.red, width: 3.2, dash: [7, 5] });
        if (zo > 1e-9) rightAngle(p, X0 + zo, Y0);
        if (zflip > .5) TX(p, `${num(zb1)} + ${num(zb2)} = ${num(zb1 + zb2)}`, X0 + (zb1 + zb2) / 2, Y0, { color: pal.green, dy: 33 });
        else { TX(p, `bottom ${num(zb1)}`, X0 + zb1 / 2, Y0, { color: pal.green, dy: 33 }); TX(p, `top ${num(zb2)}`, X0 + zo + zb2 / 2, Y0 + zh, { color: pal.green, dy: -26 }); }
        heightLab(p, `height ${num(zh)}`, X0 + zo, Y0 + zh / 2, true);
        vlabs(p, poly, { skip: zflip > .5 ? [1, 2] : [] });
      };

      const drawComp = p => {
        const pal = p.pal, poly = compPoly(), pc = pieces(), size = fs(p);
        if (pc.sub) {
          shape(p, poly, alpha(pal.yellow, .3), null);
          shape(p, pc.a, null, pal.blue, 2, [8, 6]);
          shape(p, pc.b, alpha(pal.red, .24), pal.red, 2.4, [6, 5]);
        } else {
          shape(p, pc.a, alpha(pal.yellow, .32), null); shape(p, pc.b, alpha(pal.violet, .3), null);
          if (pc.line) p.path(pc.line, { stroke: pal.violet, width: 3, dash: [7, 5] });
        }
        shape(p, poly, null, pal.blue, 3.6);
        sidelabs(p, poly);
        vlabs(p, poly);
        /* piece labels */
        const lab = (poly2, n, d, col) => {
          const q = centre(poly2);
          TX(p, n, q[0], q[1], { color: col, dy: -9 });
          TX(p, d ? dText(d) : '?', q[0], q[1], { color: col, dy: 11 });
        };
        if (pc.sub) {
          const q1 = st.shape === 'L' ? [X0 + st.Lw2 / 2, Y0 + st.LH / 2] : null;
          TX(p, 'Piece 1: whole', q1[0], q1[1], { color: pal.text, dy: -9 }); TX(p, dText(pc.d[0]), q1[0], q1[1], { color: pal.text, dy: 11 });
          const q2 = centre(pc.b);
          TX(p, 'Piece 2: take away', q2[0], q2[1], { color: pal.red, dy: -9 }); TX(p, dText(pc.d[1]), q2[0], q2[1], { color: pal.red, dy: 11 });
        } else {
          lab(pc.a, 'Piece 1', pc.d && pc.d[0], pal.text); lab(pc.b, 'Piece 2', pc.d && pc.d[1], pal.text);
        }
      };

      const drawPractice = p => {
        const pal = p.pal, pr = PROBS[prIdx];
        if (pr.kind === 'apex') {
          const A = pr.base[0], B = pr.base[1], Cc = [st.pax, st.pay], poly = [A, B, Cc];
          p.path([[0, st.pay], [PW, st.pay]], { stroke: pal.muted, width: 1.5, dash: [3, 6] });
          shape(p, poly, alpha(pal.yellow, .32), pal.blue, 3.5);
          p.path([A, B], { stroke: pal.green, width: 5 });
          TX(p, `base ${num(B[0] - A[0])}`, (A[0] + B[0]) / 2, A[1], { color: pal.green, dy: 28 });
          vlabs(p, poly);
          if (prSolved || prChecked) {
            p.path([[st.pax, A[1]], [st.pax, st.pay]], { stroke: pal.red, width: 3, dash: [7, 5] });
            TX(p, `height ${num(st.pay - A[1])}`, st.pax, (A[1] + st.pay) / 2, { color: pal.red, dx: 10, align: 'left' });
          }
          ring(p, st.pax, st.pay);
          return;
        }
        shape(p, pr.poly, alpha(pal.yellow, .3), pal.blue, 3.5);
        if (prSolved) pr.dash.forEach(d => p.path([[d[0], d[1]], [d[2], d[3]]], { stroke: pal.violet, width: 3, dash: [7, 5] }));
        vlabs(p, pr.poly);
        pr.tag.forEach(t => TX(p, t[0], t[1], t[2], { color: pal.muted }));
      };

      P.onDraw = (c, p) => {
        plot(p);
        const pal = p.pal;
        if (st.practice) drawPractice(p);
        else ({ para: drawPara, tri: drawTri, trap: drawTrap, comp: drawComp })[st.mode](p);
        p.label(caption(), PW / 2, PH + .95, { size: fs(p) * 1.12, italic: false, color: pal.text });
        handles().forEach(q => ring(p, q.x, q.y));
      };

      /* ----- the side panel ----- */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const S = o => { const s = C.slider(o); const el = panel.lastElementChild; s.inp = el.querySelector('input'); return s; };
      const mkBtn = (label, onClick, primary) => { const e = h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label); return e; };
      const addTo = (...els) => panel.append(...els);
      const lines = a => a.join('<br>');

      /* predictions */
      const predict = (key, title, q, opts, onPick) => {
        let done = false;
        const fbk = h('div', { class: 'ctl readout', 'aria-live': 'polite' }), row = h('div', { class: 'ctl buttons' });
        const btns = opts.map((o, i) => mkBtn(o[0], () => {
          if (done) return; done = true;
          btns.forEach((b, j) => { b.disabled = true; if (j === i) b.classList.add('primary'); });
          fbk.innerHTML = o[1]; locked[key] = false; onPick(i); sync();
        }));
        row.append(...btns);
        addTo(h('p', { class: 'ctl-title' }, title), h('p', { class: 'hint' }, q), row, fbk);
      };

      /* comp state */
      let fbc, ro, pbS, phS, psS, pcS, slS, tbS, txS, thS, tfS, zaS, zbS, zhS, zoS, zfS, shBtn, mBtn, cuS, a1S, a2S, lwS, lhS, l2S, h2S;
      let prIdx = 0, prSolved = false, prChecked = false, prFirst = 0, prDone = 0, prTried = false;
      let startBtn, ptally, pq, pch, pfb, pap, pnext, pcheck;

      grp('para', () => {
        predict('para', 'Predict first', 'The base is 6 and the slanted side is 5. The height is 3. What is the area, in square units?',
          [['9', '9 is 6 + 3. Area counts squares, so we multiply lengths. Watch the slide: you will see 3 rows of 6 squares.'],
           ['18', good('Yes.') + ' Cut the triangle off and slide it to the other end. You get a rectangle 6 wide and 3 tall: 6 × 3 = 18.'],
           ['30', '30 is 6 × 5. The 5 is the slanted side. The squares inside stand straight up, and the height is 3. Watch the rectangle appear.']],
          () => { cancel(); cancel = animateTo(st, { pc: st.ps }, 700, sync, () => { cancel = animateTo(st, { pslide: 1 }, 1100, sync); }); });
        C.title('Parallelogram');
        pbS = S({ label: 'Base', min: 2, max: 8, step: 1, value: st.pb, format: v => String(v), onInput: parEdit(v => { st.pb = v; }) });
        phS = S({ label: 'Height', min: 1, max: 6, step: 1, value: st.ph, format: v => String(v), onInput: parEdit(v => { st.ph = v; }) });
        psS = S({ label: 'Slant: how far the top is shifted', min: 0, max: 7, step: 1, value: st.ps, format: v => String(v), onInput: parEdit(v => { st.ps = v; }) });
        pcS = S({ label: 'Cut line at x =', min: 1, max: 8, step: 1, value: X0 + st.pc, format: v => String(v),
          onInput: v => { cancel(); st.pc = clamp(v - X0, 0, st.ps); st.pslide = 0; sync(); } });
        slS = S({ label: 'Slide the piece', min: 0, max: 1, step: .05, value: st.pslide, format: v => Math.round(v * 100) + '% of the way',
          onInput: v => { cancel(); st.pslide = v; sync(); } });
      });
      grp('tri', () => {
        predict('tri', 'Predict first', 'The top corner can slide sideways along the dashed line. As it moves, the area will:',
          [['get bigger', 'The triangle looks different, but check the base and the height. Watch what happens as the corner moves.'],
           ['get smaller', 'It may look smaller when it leans, but check the base and the height. Watch what happens as the corner moves.'],
           ['stay the same', good('Yes.') + ' The base is still 6 and the height is still 4. Moving the corner along the dashed line only makes the triangle lean.']],
          () => { cancel(); cancel = animateTo(st, { tax: 1 }, 1200, sync); });
        C.title('Triangle');
        tbS = S({ label: 'Base', min: 2, max: 8, step: 1, value: st.tb, format: v => String(v), onInput: v => { cancel(); st.tb = v; st.tax = Math.min(st.tax, PW - v); sync(); } });
        txS = S({ label: 'Top corner across (x)', min: 0, max: 10, step: 1, value: st.tax, format: v => String(v), onInput: v => { cancel(); st.tax = Math.min(v, PW - st.tb); sync(); } });
        thS = S({ label: 'Top corner height', min: 1, max: 6, step: 1, value: st.tth, format: v => String(v), onInput: v => { cancel(); st.tth = v; sync(); } });
        tfS = S({ label: 'Turn the copy', min: 0, max: 1, step: .05, value: st.tflip, format: v => Math.round(v * 100) + '% of a half turn', onInput: v => { cancel(); st.tflip = v; sync(); } });
      });
      grp('trap', () => {
        C.title('Trapezoid');
        zaS = S({ label: 'Bottom side', min: 2, max: 8, step: 1, value: st.zb1, format: v => String(v), onInput: v => { cancel(); st.zb1 = v; fixTrap('b1'); sync(); } });
        zbS = S({ label: 'Top side', min: 1, max: 8, step: 1, value: st.zb2, format: v => String(v), onInput: v => { cancel(); st.zb2 = v; fixTrap('b2'); sync(); } });
        zhS = S({ label: 'Height', min: 1, max: 6, step: 1, value: st.zh, format: v => String(v), onInput: v => { cancel(); st.zh = v; sync(); } });
        zoS = S({ label: 'Lean: how far the top is shifted', min: 0, max: 4, step: 1, value: st.zo, format: v => String(v), onInput: v => { cancel(); st.zo = v; fixTrap('o'); sync(); } });
        zfS = S({ label: 'Turn the copy', min: 0, max: 1, step: .05, value: st.zflip, format: v => Math.round(v * 100) + '% of a half turn', onInput: v => { cancel(); st.zflip = v; sync(); } });
      });
      grp('comp', () => {
        C.title('Your plan');
        shBtn = C.buttons([{ label: 'L-shaped room', onClick: () => pickShape('L') }, { label: 'House front', onClick: () => pickShape('H') }]);
        grp('compM', () => {
          mBtn = C.buttons([{ label: 'Cut across', onClick: () => pickMethod('cutH') }, { label: 'Cut up and down', onClick: () => pickMethod('cutV') },
            { label: 'Fill the corner, then subtract', onClick: () => pickMethod('sub') }]);
        });
        grp('compCut', () => {
          cuS = S({ label: 'Cut position', min: 1, max: 9, step: 1, value: st.cpos, format: v => (st.shape === 'H' || st.cm === 'cutH' ? 'y = ' + (Y0 + v) : 'x = ' + (X0 + v)),
            onInput: v => { cancel(); setCut(v); sync(); } });
        });
        C.title('Piece areas (square meters)');
        a1S = S({ label: 'Piece 1 area', min: 0, max: 60, step: 1, value: 0, format: v => String(v), onInput: v => { st.a1 = v; st.said = ''; sync(); } });
        a2S = S({ label: 'Piece 2 area', min: 0, max: 60, step: 1, value: 0, format: v => String(v), onInput: v => { st.a2 = v; st.said = ''; sync(); } });
        C.buttons([{ label: 'Check my areas', primary: true, onClick: () => checkComp() }]);
        fbc = C.readout();
        grp('compL', () => {
          C.title('Room size (or drag the corners)');
          lwS = S({ label: 'Room width', min: 4, max: 10, step: 1, value: st.LW, format: v => String(v), onInput: v => { cancel(); st.LW = v; fixL(); resetComp(); sync(); } });
          lhS = S({ label: 'Room height', min: 3, max: 6, step: 1, value: st.LH, format: v => String(v), onInput: v => { cancel(); st.LH = v; fixL(); resetComp(); sync(); } });
          l2S = S({ label: 'Width of the tall part', min: 1, max: 9, step: 1, value: st.Lw2, format: v => String(v), onInput: v => { cancel(); st.Lw2 = v; fixL(); resetComp(); sync(); } });
          h2S = S({ label: 'Height of the low part', min: 1, max: 5, step: 1, value: st.Lh2, format: v => String(v), onInput: v => { cancel(); st.Lh2 = v; fixL(); resetComp(); sync(); } });
        });
      });
      grp('ro', () => { ro = C.readout(); C.hint('Drag the round handles, or use the sliders.'); });

      /* practice */
      C.title('Practice');
      C.hint('Six short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); if (st.practice) { st.practice = false; sync(); } else { st.practice = true; loadProb(); sync(); } } }])[0];
      grp('practice', () => {
        const pwrap = h('div', { style: 'display:flex;flex-direction:column;gap:14px' });
        ptally = h('p', { class: 'ctl-title' });
        pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        pch = h('div', { class: 'ctl buttons' });
        pap = h('div', { class: 'ctl buttons' });
        pcheck = mkBtn('Check', () => checkApex(), true);
        pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pnext = mkBtn('Next problem', () => nextProb(), true);
        const mv = (l, dx, dy) => mkBtn(l, () => { if (prSolved) return; st.pax = clamp(st.pax + dx, 0, PW); st.pay = clamp(st.pay + dy, Y0 + 1, PH - 1); prChecked = false; pfb.innerHTML = ''; sync(); });
        pap.append(mv('◀ Left', -1, 0), mv('Right ▶', 1, 0), mv('▲ Up', 0, 1), mv('▼ Down', 0, -1), pcheck);
        pwrap.append(ptally, pq, pch, pap, pfb, h('div', { class: 'ctl buttons' }, pnext)); addTo(pwrap);
      });

      const tally = () => { ptally.textContent = `Right on the first try: ${prFirst} of ${prDone} done`; };
      const loadProb = () => {
        const pr = PROBS[prIdx]; prSolved = false; prChecked = false; prTried = false;
        pq.textContent = pr.q; pfb.innerHTML = ''; pch.replaceChildren(); pnext.disabled = true; pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        pap.style.display = pr.kind === 'apex' ? '' : 'none'; pch.style.display = pr.kind === 'choice' ? '' : 'none';
        if (pr.kind === 'apex') { st.pax = pr.start[0]; st.pay = pr.start[1]; }
        else pr.ch.forEach((o, i) => pch.append(mkBtn(o[0], () => pickChoice(i))));
        tally();
      };
      const pickChoice = i => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        const right = i === pr.ans, btn = pch.children[i];
        if (right) {
          prSolved = true; if (!prTried) prFirst++; prDone++;
          Array.from(pch.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary');
          pfb.innerHTML = good('Right.') + ' ' + pr.ch[i][1].replace(/^Yes\.\s*/, ''); pnext.disabled = false;
        } else {
          prTried = true; btn.disabled = true;
          pfb.innerHTML = bad('Not quite.') + ' ' + pr.ch[i][1] + ' Try another answer.';
        }
        tally(); sync();
      };
      const checkApex = () => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        const A = pr.base[0], B = pr.base[1], b = B[0] - A[0], hh = st.pay - A[1], ar = b * hh / 2, need = pr.want * 2 / b;
        prChecked = true;
        if (near0(ar - pr.want)) {
          prSolved = true; if (!prTried) prFirst++; prDone++; pnext.disabled = false;
          pfb.innerHTML = good('Right.') + ` The base is |8 ${MI} 2| = 6 and the height is |${st.pay} ${MI} 2| = ${hh}. The area is ½ × 6 × ${hh} = ${ar}. Sliding the corner left or right does not change the height, so the area is the same at every x.`;
        } else {
          prTried = true;
          pfb.innerHTML = bad('Not yet.') + ` The height is |${st.pay} ${MI} 2| = ${hh}, so the area is ½ × 6 × ${hh} = ${ar}. ` +
            (ar < pr.want ? `That is too small. You need the height to be ${need}, so move the corner up.` : `That is too big. You need the height to be ${need}, so move the corner down.`);
        }
        tally(); sync();
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); sync(); return; }
        pq.textContent = 'All six problems are done.'; pch.replaceChildren(); pap.style.display = 'none'; pnext.disabled = true;
        pfb.innerHTML = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        const again = mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; loadProb(); sync(); }, true);
        pch.style.display = ''; pch.append(again); sync();
      };

      /* ----- state rules ----- */
      const fixTrap = which => {
        st.zo = clamp(st.zo, 0, 4); st.zb1 = clamp(st.zb1, 2, 8); st.zb2 = clamp(st.zb2, 1, 8);
        const over = () => st.zo + st.zb1 + st.zb2 > 11;
        while (over()) { if (which !== 'b2' && st.zb2 > 1) st.zb2--; else if (which !== 'b1' && st.zb1 > 2) st.zb1--; else if (which !== 'o' && st.zo > 0) st.zo--; else if (st.zb2 > 1) st.zb2--; else if (st.zb1 > 2) st.zb1--; else st.zo--; }
      };
      const fixL = () => {
        st.LW = clamp(st.LW, 4, 10); st.LH = clamp(st.LH, 3, 6);
        st.Lw2 = clamp(st.Lw2, 1, st.LW - 1); st.Lh2 = clamp(st.Lh2, 1, st.LH - 1);
      };
      const cutMax = () => (st.shape === 'H' ? 5 : st.cm === 'cutH' ? st.LH - 1 : st.LW - 1);
      const setCut = v => { st.cpos = clamp(Math.round(v), 1, cutMax()); resetComp(); };
      const resetComp = () => { st.a1 = 0; st.a2 = 0; st.said = ''; };
      const normPara = wasDone => {
        st.pb = clamp(Math.round(st.pb), 2, 8); st.ph = clamp(Math.round(st.ph), 1, 6);
        st.ps = clamp(Math.round(st.ps), 0, Math.min(st.pb - 1, 11 - st.pb));
        if (wasDone) { st.pc = st.ps; st.pslide = 1; } else { st.pc = clamp(st.pc, 0, st.ps); st.pslide = 0; }
      };
      function parEdit(fn) { return v => { cancel(); const wd = paraDone(); fn(v); normPara(wd); sync(); }; }
      const pickShape = s => {
        cancel(); st.shape = s; if (s === 'H') { st.cm = 'cutH'; st.cpos = 1; } else { st.cm = 'cutH'; st.cpos = 1; fixL(); }
        resetComp(); sync();
      };
      const pickMethod = m => { cancel(); st.cm = m; st.cpos = 1; resetComp(); sync(); };

      /* ----- feedback for the composite plan ----- */
      const compSides = () => {
        const q = compPoly(), out = [];
        q.forEach((a, i) => {
          const b = q[(i + 1) % q.length];
          if (near0(a[1] - b[1])) out.push(`${bars(Math.max(a[0], b[0]), Math.min(a[0], b[0]))} = ${num(ab(a[0], b[0]))}`);
          else if (near0(a[0] - b[0])) out.push(`${bars(Math.max(a[1], b[1]), Math.min(a[1], b[1]))} = ${num(ab(a[1], b[1]))}`);
        });
        return out;
      };
      const planNote = () => {
        const pc = pieces(), k = st.cpos;
        if (st.shape === 'H') {
          const v = Y0 + k;
          if (pc.ok) return `The cut at y = ${v} runs along the top of the walls. Piece 1 is a rectangle ${HOUSE.w} wide and ${HOUSE.hh} tall. Piece 2 is a triangle with base ${HOUSE.w} and height ${HOUSE.rf}.`;
          return k < HOUSE.hh
            ? `The cut at y = ${v} leaves a piece on top that is a rectangle with a triangle on it. One multiplication cannot find that. Move the cut to the top of the walls, y = ${Y0 + HOUSE.hh}.`
            : `The cut at y = ${v} leaves a piece below that has the sloping roof edges in it. Its area is not base times height. Move the cut to the top of the walls, y = ${Y0 + HOUSE.hh}.`;
        }
        const { LW, LH, Lw2, Lh2 } = st;
        if (st.cm === 'sub') return `Fill in the empty corner to make one big rectangle (Piece 1: ${LW} × ${LH}). The corner you added (Piece 2: ${LW - Lw2} × ${LH - Lh2}) is not part of the room, so you take it away.`;
        if (st.cm === 'cutH') {
          const v = Y0 + k;
          if (pc.ok) return `The cut at y = ${v} goes through the corner of the notch. Piece 1 is ${LW} wide and ${k} tall. Piece 2 is ${Lw2} wide and ${LH - k} tall. Both are rectangles.`;
          return k < Lh2
            ? `The cut at y = ${v} is below the notch, so the top piece is still an L shape. Move the cut up to the corner of the notch, y = ${Y0 + Lh2}.`
            : `The cut at y = ${v} is above the notch corner, so the bottom piece is still an L shape. Move the cut down to the corner of the notch, y = ${Y0 + Lh2}.`;
        }
        const v = X0 + k;
        if (pc.ok) return `The cut at x = ${v} goes through the corner of the notch. Piece 1 is ${k} wide and ${LH} tall. Piece 2 is ${LW - k} wide and ${Lh2} tall. Both are rectangles.`;
        return k < Lw2
          ? `The cut at x = ${v} is left of the notch corner, so the right piece is still an L shape. Move the cut right to x = ${X0 + Lw2}.`
          : `The cut at x = ${v} is right of the notch corner, so the left piece is still an L shape. Move the cut left to x = ${X0 + Lw2}.`;
      };
      const checkComp = () => {
        const pc = pieces(), s1 = st.a1, s2 = st.a2;
        if (!pc.ok) { st.said = bad('Fix the cut first.') + ' ' + planNote(); fbc.innerHTML = st.said; return; }
        const e1 = dArea(pc.d[0]), e2 = dArea(pc.d[1]), T = pc.sub ? e1 - e2 : e1 + e2, n1 = s1 === e1, n2 = s2 === e2, out = [];
        const why = (n, s, e, d) => {
          let m = `Piece ${n} is ${dText(d)} = ${e}, and you set ${s}. `;
          if (d.t && s === d.w * d.h) m += 'A triangle is half of base times height, so take half. ';
          else if (s === d.w + d.h) m += 'You added the sides. Area multiplies them. ';
          return m;
        };
        if (n1 && n2) {
          const price = st.shape === 'H' ? `Paint at $2 a square meter costs $${T * 2}.` : `Tiles at $2 a square meter cost $${T * 2}.`;
          out.push(good('Both areas are right.') + (pc.sub ? ` The whole rectangle is ${e1} and the corner you added is ${e2}, so the room is ${e1} ${MI} ${e2} = ${T} square meters.`
            : ` The two pieces are ${e1} and ${e2}, so the total is ${e1} + ${e2} = ${T} square meters.`));
          out.push(`Counting the unit squares inside the outline gives ${area(compPoly())} too. ${price}`);
        } else {
          out.push(bad('Not yet.'));
          if (n1) out.push('Piece 1 is right.'); else out.push(why(1, s1, e1, pc.d[0]));
          if (n2) out.push('Piece 2 is right.'); else out.push(why(2, s2, e2, pc.d[1]));
          out.push('Read each length from the coordinates by subtracting, then multiply.');
        }
        st.said = out.join(' '); fbc.innerHTML = st.said;
      };

      /* ----- readout ----- */
      const updRo = () => {
        let t;
        if (st.mode === 'para') {
          const { pb, ph, ps, pc } = st, slant = +Math.hypot(ps, ph).toFixed(1), full = near0(pc - ps);
          const L = [`${kk('Base')} ${bars(X0 + pb, X0)} = ${num(pb)}`, `${kk('Height')} ${bars(Y0 + ph, Y0)} = ${num(ph)}, straight up`, `${kk('Slant side')} about ${num(slant)}, not used`];
          if (locked.para) L.push('Pick a prediction first. Then the cut and the slide unlock.');
          else if (near0(ps)) L.push(`With slant 0 this is already a rectangle. Area = ${num(pb)} × ${num(ph)} = ${num(pb * ph)}.`);
          else if (!full) L.push(`The cut at x = ${num(X0 + pc)} stops short of the top corner. The piece is only ${num(ph * pc / ps)} tall, so the new shape still has a slanted edge. Drag the cut to x = ${X0 + ps}.`);
          else if (st.pslide < .999) L.push(`The cut goes straight down from the top corner. Slide the piece ${num(pb)} to the right, to the other end.`);
          else L.push(`The piece fits the other end. The shape is a rectangle ${num(pb)} wide and ${num(ph)} tall.`, `<b>Area = base × height = ${num(pb)} × ${num(ph)} = ${num(pb * ph)}</b>`);
          t = lines(L);
        } else if (st.mode === 'tri') {
          const { tb, tth, tax, tflip } = st, A = tb * tth;
          t = lines([`${kk('Base')} ${bars(X0 + tb, X0)} = ${num(tb)}`, `${kk('Height')} ${bars(Y0 + tth, Y0)} = ${num(tth)}`,
            `${kk('Top corner')} at (${num(tax)}, ${num(Y0 + tth)})`, `<b>Triangle area = ½ × ${num(tb)} × ${num(tth)} = ${num(A / 2)}</b>`,
            locked.tri ? 'Pick a prediction first. Then the corner and the copy unlock.'
              : tflip > .999 ? `Two triangles make a parallelogram ${num(tb)} wide and ${num(tth)} tall: ${num(tb)} × ${num(tth)} = ${num(A)}. One triangle is half of it, ${num(A / 2)}.`
              : `The height is ${num(tth)}. Sliding the corner along the dashed line does not change it, so the area stays ${num(A / 2)}.`]);
        } else if (st.mode === 'trap') {
          const { zb1, zb2, zh, zo, zflip } = st, s = zb1 + zb2;
          t = lines([`${kk('Bottom')} ${bars(X0 + zb1, X0)} = ${num(zb1)}`, `${kk('Top')} ${bars(X0 + zo + zb2, X0 + zo)} = ${num(zb2)}`, `${kk('Height')} ${bars(Y0 + zh, Y0)} = ${num(zh)}`,
            `<b>Trapezoid area = (${num(zb1)} + ${num(zb2)}) ÷ 2 × ${num(zh)} = ${num(s / 2 * zh)}</b>`,
            zflip > .999 ? `Two trapezoids make a parallelogram with base ${num(zb1)} + ${num(zb2)} = ${num(s)} and height ${num(zh)}: ${num(s)} × ${num(zh)} = ${num(s * zh)}. One trapezoid is half, ${num(s * zh / 2)}.`
              : 'Turn the copy to see the parallelogram.']);
        } else {
          const pc = pieces();
          t = lines([`${kk('Side lengths')} ${compSides().join(' · ')}`, planNote(), pc.ok ? 'Set each piece area with the sliders, then press Check.' : '']);
        }
        ro.innerHTML = t;
        fbc.innerHTML = st.said || '';
      };

      const sync = () => {
        const prac = st.practice, m = st.mode;
        vis(G.para, !prac && m === 'para'); vis(G.tri, !prac && m === 'tri'); vis(G.trap, !prac && m === 'trap'); vis(G.comp, !prac && m === 'comp');
        vis(G.ro, !prac); vis(G.practice, prac);
        if (!prac && m === 'comp') { vis(G.compM, st.shape === 'L'); vis(G.compCut, st.cm !== 'sub' || st.shape === 'H'); vis(G.compL, st.shape === 'L'); }
        pbS.set(st.pb); phS.set(st.ph); psS.set(st.ps); pcS.set(X0 + st.pc); slS.set(st.pslide);
        tbS.set(st.tb); txS.set(st.tax); thS.set(st.tth); tfS.set(st.tflip);
        zaS.set(st.zb1); zbS.set(st.zb2); zhS.set(st.zh); zoS.set(st.zo); zfS.set(st.zflip);
        cuS.set(st.cpos); a1S.set(st.a1); a2S.set(st.a2); lwS.set(st.LW); lhS.set(st.LH); l2S.set(st.Lw2); h2S.set(st.Lh2);
        [pbS, phS, psS, pcS, slS].forEach(s => { s.inp.disabled = locked.para; });
        [tbS, txS, thS, tfS].forEach(s => { s.inp.disabled = locked.tri; });
        if (shBtn) { shBtn[0].classList.toggle('primary', st.shape === 'L'); shBtn[1].classList.toggle('primary', st.shape === 'H'); }
        if (mBtn) ['cutH', 'cutV', 'sub'].forEach((k, i) => mBtn[i].classList.toggle('primary', st.cm === k));
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        P.draw(); updRo();
      };

      /* ----- dragging ----- */
      const rd = v => Math.round(v);
      draggable(P, {
        hit: (px, py) => { const q = handles().find(q => near(P, q.x, q.y, px, py, 20)); return q ? q.id : null; },
        move: (id, x, y) => {
          cancel();
          if (id === 'PA') { st.pax = clamp(rd(x), 0, PW); st.pay = clamp(rd(y), Y0 + 1, PH - 1); prChecked = false; sync(); return; }
          if (id === 'pC' || id === 'pB') {
            const wd = paraDone();
            if (id === 'pB') st.pb = clamp(rd(x) - X0, 2, 8); else { st.ps = rd(x) - X0 - st.pb; st.ph = rd(y) - Y0; }
            normPara(wd);
          } else if (id === 'pcut') { st.pc = clamp(rd(x) - X0, 0, st.ps); st.pslide = 0; }
          else if (id === 'tA') { st.tax = clamp(rd(x), 0, PW - st.tb); st.tth = clamp(rd(y) - Y0, 1, 6); }
          else if (id === 'tB') { st.tb = clamp(rd(x) - X0, 2, 8); st.tax = Math.min(st.tax, PW - st.tb); }
          else if (id === 'zB') { st.zb1 = rd(x) - X0; fixTrap('b1'); }
          else if (id === 'zC') { st.zb2 = rd(x) - X0 - st.zo; st.zh = clamp(rd(y) - Y0, 1, 6); fixTrap('b2'); }
          else if (id === 'zD') { st.zo = rd(x) - X0; st.zh = clamp(rd(y) - Y0, 1, 6); fixTrap('o'); }
          else if (id === 'ccut') { setCut(st.shape === 'L' && st.cm === 'cutV' ? rd(x) - X0 : rd(y) - Y0); }
          else {
            if (id === 'v1') st.LW = rd(x) - X0;
            else if (id === 'v2') { st.LW = rd(x) - X0; st.Lh2 = rd(y) - Y0; }
            else if (id === 'v3') { st.Lw2 = rd(x) - X0; st.Lh2 = rd(y) - Y0; }
            else if (id === 'v4') { st.Lw2 = rd(x) - X0; st.LH = rd(y) - Y0; }
            else if (id === 'v5') st.LH = rd(y) - Y0;
            fixL(); st.cpos = clamp(st.cpos, 1, cutMax()); resetComp();
          }
          sync();
        }
      });

      const FLAGS = ['mode', 'shape', 'cm'];
      const apply = (patch, immediate) => {
        cancel();
        const nums = {}; let flagged = false;
        for (const k in patch) { if (FLAGS.includes(k)) { st[k] = patch[k]; flagged = true; } else nums[k] = patch[k]; }
        st.practice = false;
        if (patch.pslide > 0) locked.para = false;
        if (flagged) resetComp();
        if (immediate) { Object.assign(st, nums); sync(); } else { sync(); cancel = animateTo(st, nums, 900, sync); }
      };
      sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
