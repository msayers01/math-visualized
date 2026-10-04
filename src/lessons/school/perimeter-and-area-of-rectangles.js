/* =====================================================================
   SCHOOL — Perimeter and area of rectangles
   ===================================================================== */
{
  const GW = 10, GH = 8;                      /* the grid paper: 10 units across, 8 units up */
  const kk = t => `<span class="k">${t}</span>`;
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const fs = p => clamp(p.scale * .5, 14.5, 18);
  const unitsOf = n => (n === 1 ? '1 unit' : `${n} units`);
  const sqOf = n => (n === 1 ? '1 square unit' : `${n} square units`);
  const rectPts = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);

  /* L-shapes: an outer W by H rectangle with a nw by nh corner missing at the top right */
  const LS = [{ W: 6, H: 5, nw: 3, nh: 2 }, { W: 7, H: 5, nw: 3, nh: 2 }, { W: 8, H: 6, nw: 5, nh: 3 }];
  const lSides = S => [S.W, S.H - S.nh, S.nw, S.nh, S.W - S.nw, S.H];
  const lArea = S => S.W * S.H - S.nw * S.nh;
  const lPieces = (S, cut) => (cut === 'h'
    ? [[S.W - S.nw, S.nh], [S.W, S.H - S.nh]]
    : [[S.W - S.nw, S.H], [S.nw, S.H - S.nh]]);

  /* holds: a fixed perimeter or a fixed area; the shapes that keep it, as [length, width] */
  const HOLDS = {
    P12: { kind: 'P', v: 12, name: 'Perimeter 12 units' }, P16: { kind: 'P', v: 16, name: 'Perimeter 16 units' },
    A12: { kind: 'A', v: 12, name: 'Area 12 square units' }, A8: { kind: 'A', v: 8, name: 'Area 8 square units' }
  };
  const shapesFor = key => {
    const H = HOLDS[key], out = [];
    for (let l = 1; l <= GW; l++) {
      const w = H.kind === 'P' ? H.v / 2 - l : H.v / l;
      if (Number.isInteger(w) && w >= 1 && w <= GH) out.push([l, w]);
    }
    return out;
  };
  const keyOf = (l, w) => `${Math.min(l, w)} × ${Math.max(l, w)}`;

  /* ---------- practice problems (a fixed list) ---------- */
  const PROBS = [
    { name: 'Count the squares', kind: 'choice', pic: { t: 'rect', len: 5, wid: 2, rows: 0, dims: 'both', hint: 'Count the squares in each row.' },
      q: 'This rectangle is 5 units long and 2 units wide. How many unit squares fit inside it?',
      ch: [['7 squares', '7 is 5 + 2. That adds the two sides. Squares fill rows: there are 2 rows with 5 squares in each row.'],
           ['10 squares', 'Yes. There are 2 rows, and each row has 5 squares. 5 + 5 = 10, so 5 × 2 = 10. The area is 10 square units.'],
           ['14 squares', '14 is 5 + 2 + 5 + 2, the way around the edge. Area counts the squares inside, not the edge.'],
           ['5 squares', '5 is only one row. There are 2 rows, so 5 + 5 = 10.']], ans: 1 },
    { name: 'Build an area', kind: 'build', start: [3, 3],
      q: 'Make a rectangle that is 6 units long and has an area of 12 square units. Drag the corner, or use the buttons. Then press Check.',
      hint: 'Length 6. Area 12.' },
    { name: 'Walk around it', kind: 'choice', pic: { t: 'rect', len: 7, wid: 3, rows: 0, plain: true, dims: 'both', hint: 'Walk along all four sides.' },
      q: 'This rectangle is 7 units long and 3 units wide. What is its perimeter?',
      ch: [['10 units', '10 is 7 + 3. That is only two sides. The walk goes along all four sides.'],
           ['21 units', '21 is 7 × 3. That is the area, the squares inside. It would be 21 square units. The perimeter is the distance around.'],
           ['20 units', 'Yes. Walk all four sides: 7 + 3 + 7 + 3 = 20 units. You can also double 7 + 3: 2 × 10 = 20.'],
           ['13 units', '13 is 7 + 3 + 3. That is only three sides. A rectangle has four sides, and the opposite sides match.']], ans: 2 },
    { name: 'Name the unit', kind: 'choice', pic: { t: 'rect', len: 5, wid: 3, rows: 3, dims: 'both', hint: 'Perimeter is 16. Area is 15.' },
      q: 'A rectangle is 5 units long and 3 units wide. Its perimeter is 16 and its area is 15. Which labels are right?',
      ch: [['Perimeter 16 units, area 15 square units', 'Yes. Perimeter is a length, so it is in units. Area counts squares, so it is in square units.'],
           ['Perimeter 16 square units, area 15 units', 'The labels are swapped. Perimeter is a distance, so it is in units. Area counts squares, so it is in square units.'],
           ['Both in units', 'Area does not count lengths. It counts squares, so it needs square units.'],
           ['Both in square units', 'Perimeter does not count squares. It counts edge pieces 1 unit long, so it is in units.']], ans: 0 },
    { name: 'Build a perimeter', kind: 'build', start: [2, 2],
      q: 'Make a rectangle with a perimeter of 14 units and an area of 12 square units. Drag the corner, or use the buttons. Then press Check.',
      hint: 'Perimeter 14. Area 12.' },
    { name: 'Why multiply?', kind: 'choice', pic: { t: 'rect', len: 6, wid: 4, rows: 4, totals: true, dims: 'both', hint: 'The numbers on the right are running totals.' },
      q: 'A rug is 6 units long and 4 units wide. Why can we find its area with 6 × 4?',
      ch: [['Because 6 + 4 + 6 + 4 gives the area.', 'That sum is the perimeter, the distance around. It does not count squares.'],
           ['Because multiplying always gives the biggest answer.', 'That is not the reason. We multiply here because the squares come in equal rows.'],
           ['Because 6 + 4 = 10, and that is the number of squares.', 'Adding the sides does not count the squares. The 6 squares in a row repeat 4 times.'],
           ['Because there are 4 rows with 6 squares in each row, so 6 + 6 + 6 + 6 = 6 × 4.', 'Yes. Equal rows are added again and again. Repeated adding of the same number is multiplying.']], ans: 3 },
    { name: 'Missing side', kind: 'choice', pic: { t: 'rect', len: 6, wid: 3, rows: 0, plain: true, dims: 'both', widLabel: '?', hint: 'Area is 18 square units.' },
      q: 'A rectangle has an area of 18 square units. It is 6 units long. How wide is it?',
      ch: [['12 units', '12 is 18 − 6. Subtracting does not work here. Each row has 6 squares, so ask how many rows of 6 make 18.'],
           ['3 units', 'Yes. Rows of 6 squares make 18 squares. 18 ÷ 6 = 3 rows, so the width is 3 units. Check: 6 × 3 = 18.'],
           ['24 units', '24 is 18 + 6. Adding does not work here. Think of rows: how many rows of 6 make 18?'],
           ['108 units', '108 is 18 × 6. The area is already the product of length and width. Divide to go back: 18 ÷ 6.']], ans: 1 },
    { name: 'L-shape area', kind: 'choice', pic: { t: 'L', ls: 1, cut: 'none', hint: 'Cut the L into two rectangles.' },
      q: 'An L-shape is 7 units wide and 5 units tall. A corner 3 units wide and 2 units tall is missing. What is the area of the L?',
      ch: [['35 square units', '35 is 7 × 5, the big rectangle with the corner still in it. Take the corner away: 3 × 2 = 6, and 35 − 6 = 29.'],
           ['21 square units', '21 is 7 × 3, only the bottom piece. The L also has a top piece, 4 wide and 2 tall: 4 × 2 = 8.'],
           ['29 square units', 'Yes. Cut it: the bottom piece is 7 × 3 = 21, the top piece is 4 × 2 = 8. 21 + 8 = 29. Or 35 − 6 = 29.'],
           ['24 square units', '24 is the perimeter, the walk around the outside: 7 + 3 + 3 + 2 + 4 + 5. Area counts squares inside.']], ans: 2 },
    { name: 'L-shape perimeter', kind: 'choice', pic: { t: 'L', ls: 1, cut: 'none', hint: 'Walk all six sides of the L.' },
      q: 'The same L-shape is 7 units wide and 5 units tall, with a 3 by 2 corner missing. Its six sides are 7, 3, 3, 2, 4 and 5 units long. How long is the walk around the outside?',
      ch: [['24 units', 'Yes. 7 + 3 + 3 + 2 + 4 + 5 = 24 units. The perimeter is a distance, so it is in units.'],
           ['17 units', '17 is 7 + 5 + 3 + 2, only four of the six sides. Walk around the whole outside and add every side.'],
           ['29 units', '29 is the area, the squares inside. The perimeter adds the six side lengths.'],
           ['35 units', '35 is 7 × 5. That is the area of the big rectangle, not a walk around the L.']], ans: 0 }
  ];

  register({
    id: 'perimeter-and-area-of-rectangles', level: 'school',
    title: 'Perimeter and area of rectangles',
    blurb: 'Resize a rectangle on grid paper, count its squares in rows and its edges, and see that perimeter and area are different.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 3; p.cy = 2.3; p.span = 3.9;
      for (let i = 0; i <= 6; i++) p.path([[i, 0], [i, 4]], { stroke: pal.grid, width: 1 });
      for (let j = 0; j <= 4; j++) p.path([[0, j], [6, j]], { stroke: pal.grid, width: 1 });
      p.path(rectPts(0, 0, 4, 3), { fill: alpha(pal.yellow, .5) });
      for (let i = 0; i <= 4; i++) p.path([[i, 0], [i, 3]], { stroke: pal.muted, width: 1.2 });
      for (let j = 0; j <= 3; j++) p.path([[0, j], [4, j]], { stroke: pal.muted, width: 1.2 });
      p.path(rectPts(0, 0, 4, 3), { stroke: pal.blue, width: 4, close: true });
    },
    hook: String.raw`You have 12 fence pieces. You make a pen for a rabbit. Can you make a pen with more room inside, using the very same 12 pieces?`,
    steps: [
      { title: 'Area: count the squares',
        text: String.raw`<p>The <b>area</b> of a shape is how much flat space it covers. We count <b>unit squares</b>. Each one is 1 unit wide and 1 unit tall, so it is 1 <b>square unit</b>.</p><p>This rectangle is 4 units long and 3 units wide. Guess how many squares fit inside. Then add the rows one at a time. Drag the corner to try other sizes.</p>`,
        set: { mode: 'area', len: 4, wid: 3, rowsF: 0 } },
      { title: 'Perimeter: count the edges',
        text: String.raw`<p>The <b>perimeter</b> is the distance all the way around a shape, like a fence. Count the edge pieces. Each is 1 unit long. We say perimeter in <b>units</b>, not square units.</p><p>This rectangle is still 4 by 3. Guess how many edge pieces go around it. Then walk around it with the buttons.</p>`,
        set: { mode: 'perim', len: 4, wid: 3, walkF: 0 } },
      { title: 'Same perimeter, different area',
        text: String.raw`<p>You have a fence of 12 units. Bend it into a rectangle. Do all the rectangles cover the same area? Guess first. Then use the buttons or drag the corner to try each shape.</p><p>Next, pick an area of 12 square units in the menu. What happens to the perimeter?</p>`,
        set: { mode: 'same', hold: 'P12', si: 0 } },
      { title: 'L-shapes: cut into rectangles',
        text: String.raw`<p>An L-shape is not a rectangle. Cut it into two rectangles. Find the area of each piece. Then add them, because the pieces do not overlap.</p><p>This L is 6 units wide and 5 units tall, with a 3 by 2 corner missing. Guess its area. Then try each way to cut it.</p>`,
        set: { mode: 'lshape', ls: 0, cut: 'none' } }
    ],
    formal: String.raw`
      <h3>Area counts squares</h3>
      <p>Area tells how much flat space a shape covers. To measure it, cover the shape with unit squares. A unit square is 1 unit wide and 1 unit tall. Its area is 1 square unit. The area of a shape is the number of unit squares that fit inside it with no gaps and no overlaps.</p>
      <h3>Why length × width works</h3>
      <p>The squares in a rectangle sit in equal rows. The length tells how many squares are in one row. The width tells how many rows there are. So you add the same number again and again, and that is multiplying.</p>
      <p>Worked example. A rectangle is 5 units long and 4 units wide. Each row has 5 squares. There are 4 rows. 5 + 5 + 5 + 5 = 20, so 5 × 4 = 20. The area is A = l × w = 5 × 4 = 20 square units.</p>
      <h3>Perimeter counts edges</h3>
      <p>Perimeter is the distance around a shape. Walk along every side and add the lengths. A rectangle has two sides of length l and two sides of width w. So the perimeter is l + w + l + w. You can also add l and w, and then double it: 2 × (l + w).</p>
      <p>Worked example. A rectangle is 7 units long and 3 units wide. 7 + 3 + 7 + 3 = 20. Or 2 × (7 + 3) = 2 × 10 = 20. The perimeter is 20 units.</p>
      <h3>Units</h3>
      <p>Perimeter is a length, so we label it in units. Area counts squares, so we label it in square units. A 5 by 3 rectangle has perimeter 16 units and area 15 square units. The two numbers answer two different questions.</p>
      <h3>Same perimeter, different area</h3>
      <p>Perimeter does not tell you the area. Three rectangles with perimeter 12 units are 1 × 5, 2 × 4 and 3 × 3. Their areas are 5, 8 and 9 square units. The closer the rectangle is to a square, the more room it holds for the same fence.</p>
      <p>Area does not tell you the perimeter either. Two rectangles with area 12 square units are 2 × 6 and 3 × 4. Their perimeters are 16 and 14 units.</p>
      <h3>L-shapes: cut into rectangles</h3>
      <p>An L-shape is made of rectangles joined together. Cut it with one straight line into two rectangles. Find each area with length × width. The pieces do not overlap and leave no gaps, so the areas add.</p>
      <p>Worked example. An L-shape is 6 units wide and 5 units tall, with a 3 by 2 corner missing. Cut across: the top piece is 3 × 2 = 6 and the bottom piece is 6 × 3 = 18. 6 + 18 = 24 square units. Cut down instead: 3 × 5 = 15 and 3 × 3 = 9. 15 + 9 = 24. You get the same area. Another way is to take the missing corner away from the big rectangle: 6 × 5 = 30, and 30 − 6 = 24.</p>
      <p>To find the perimeter of the L, walk around the outside and add all six sides: 6 + 3 + 3 + 2 + 3 + 5 = 22 units.</p>`,
    check: [
      { q: 'A rectangle is 5 units long and 3 units wide. Which sentence is right?',
        choices: ['Its perimeter is 15 square units, because 5 × 3 = 15.',
                  'Its area is 15 square units. There are 3 rows with 5 unit squares in each row.',
                  'Its area is 16 units, because you add 5 + 3 + 5 + 3.',
                  'Its perimeter is 8 units, because you add 5 + 3.'], answer: 1,
        why: 'Area counts the unit squares inside. There are 3 rows of 5 squares, so 5 × 3 = 15 square units. The perimeter is the distance around: 5 + 3 + 5 + 3 = 16 units. Perimeter is in units and area is in square units.',
        hint: 'Which choice counts squares inside, and which walks around the edge? Check the unit words.' },
      { q: 'A poster is 6 units long and 4 units wide. Tom puts a ribbon once around the edge of the poster, all four sides. He also covers the front of the poster with paper squares. Each square is 1 unit by 1 unit. How much ribbon and how many paper squares does Tom need?',
        choices: ['10 units of ribbon and 24 squares', '24 units of ribbon and 20 squares', '20 units of ribbon and 10 squares', '20 units of ribbon and 24 squares'], answer: 3,
        why: 'The ribbon goes around: 6 + 4 + 6 + 4 = 20 units. The squares fill 4 rows of 6: 6 × 4 = 24 squares. 10 is 6 + 4, only two sides. Swapping the two answers mixes up perimeter and area.',
        hint: 'The ribbon is a perimeter. The squares are an area. Work out each one separately.' },
      { q: 'Ben wants the area of an L-shape. The L is a rectangle 6 units wide and 5 units tall, with a corner 3 units wide and 2 units tall missing. Ben writes. Step 1: the big rectangle is 6 × 5 = 30. Step 2: the missing corner is 3 × 2 = 6. Step 3: the area is 30 + 6 = 36 square units. Which statement is true?',
        choices: ['Step 1 and Step 2 are right. Step 3 is wrong. The corner is missing, so take it away: 30 − 6 = 24 square units.',
                  'Step 1 is wrong. The big rectangle should be 6 + 5 = 11.',
                  'Step 2 is wrong. The corner should be 3 + 2 = 5.',
                  'Ben is right. You always add the two numbers you found.'], answer: 0,
        why: 'The 30 counts every square of the big rectangle, including the 6 squares of the missing corner. Those squares are not part of the L, so we take them away: 30 − 6 = 24. The L is also 18 + 6 if you cut it into two pieces.',
        hint: 'Is the corner part of the L? Should its squares be counted or taken away?' }
    ],
    links: { related: ['multiplying-with-area-models', 'area-by-decomposition', 'the-coordinate-plane-first-quadrant', 'angles-and-turns', 'nets-and-surface-area'] },

    mount({ stage, controls: C }) {
      const st = { mode: 'area', practice: false, len: 4, wid: 3, rowsF: 0, walkF: 0, hold: 'P12', si: 0, ls: 0, cut: 'none', said: '', seen: {} };
      let cancel = () => {};
      const panel = stage.nextElementSibling;
      const P = new Plane(stage, { span: 6 });
      const perim = () => 2 * (st.len + st.wid);
      const rows = () => clamp(Math.round(st.rowsF), 0, st.wid);
      const walk = () => clamp(Math.round(st.walkF), 0, perim());

      /* ----- text on the canvas that always fits ----- */
      const fitText = (p, t, x, y, o) => {
        let size = o.size; const c = p.ctx;
        for (let k = 0; k < 14; k++) {
          c.font = `500 ${size * .85}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`;
          if (c.measureText(t).width <= p.w - 14 || size <= 14.3) break;
          size -= .6;
        }
        p.label(t, x, y, Object.assign({ italic: false }, o, { size }));
      };
      const caption = (p, t1, t2) => {
        const x = p.toMath(p.w / 2, 0)[0];
        fitText(p, t1, x, GH + 1.55, { size: fs(p) * 1.18 });
        if (t2) fitText(p, t2, x, GH + 1.0, { size: fs(p) * .98, color: p.pal.muted });
      };
      const ring = (p, x, y) => p.dot(x, y, 12, p.pal.stage, p.pal.brass, 3.2);

      const drawGrid = p => {
        const pal = p.pal;
        for (let i = 0; i <= GW; i++) p.path([[i, 0], [i, GH]], { stroke: pal.grid, width: 1 });
        for (let j = 0; j <= GH; j++) p.path([[0, j], [GW, j]], { stroke: pal.grid, width: 1 });
        p.path(rectPts(0, 0, GW, GH), { stroke: pal['grid-strong'], width: 1.5, close: true });
      };

      /* a rectangle with its bottom left corner at the origin */
      const drawRect = (p, o) => {
        const pal = p.pal, l = o.len, w = o.wid, sz = fs(p);
        if (o.plain) p.path(rectPts(0, 0, l, w), { fill: pal.stage });
        p.path(rectPts(0, 0, l, w), { fill: alpha(pal.blue, .08) });
        for (let r = 0; r < (o.rows || 0); r++) p.path(rectPts(0, w - r - 1, l, w - r), { fill: alpha(pal.yellow, r % 2 ? .38 : .52) });
        if (!o.plain) {
          for (let i = 1; i < l; i++) p.path([[i, 0], [i, w]], { stroke: pal['grid-strong'], width: 1.1 });
          for (let j = 1; j < w; j++) p.path([[0, j], [l, j]], { stroke: pal['grid-strong'], width: 1.1 });
        }
        p.path(rectPts(0, 0, l, w), { stroke: pal.blue, width: 3.8, close: true });
        if (o.totals) for (let r = 0; r < (o.rows || 0); r++) p.label(String((r + 1) * l), l + .75, w - r - .5, { size: sz, italic: false, align: 'left' });
        if (o.dims !== 'none') {
          p.label(`length ${unitsOf(l)}`, l / 2, -.75, { size: sz, italic: false, color: pal.text });
          const wl = o.widLabel === undefined ? unitsOf(w) : o.widLabel === '?' ? '? units' : o.widLabel;
          p.label('width', -.3, w / 2, { size: sz, italic: false, align: 'right', dy: -10 });
          p.label(wl, -.3, w / 2, { size: sz, italic: false, align: 'right', dy: 9 });
        }
      };

      /* the boundary lattice points of a rectangle, counterclockwise from the origin, and the outward direction of each edge piece */
      const boundary = (l, w) => {
        const pts = [[0, 0]], nor = [];
        for (let i = 1; i <= l; i++) { pts.push([i, 0]); nor.push([0, -1]); }
        for (let j = 1; j <= w; j++) { pts.push([l, j]); nor.push([1, 0]); }
        for (let i = 1; i <= l; i++) { pts.push([l - i, w]); nor.push([0, 1]); }
        for (let j = 1; j <= w; j++) { pts.push([0, w - j]); nor.push([-1, 0]); }
        return { pts, nor };
      };
      const drawWalk = (p, l, w, k) => {
        const pal = p.pal, sz = fs(p) * .95, { pts, nor } = boundary(l, w);
        p.path(rectPts(0, 0, l, w), { fill: alpha(pal.blue, .08) });
        for (let i = 1; i < l; i++) p.path([[i, 0], [i, w]], { stroke: pal.grid, width: 1 });
        for (let j = 1; j < w; j++) p.path([[0, j], [l, j]], { stroke: pal.grid, width: 1 });
        p.path(rectPts(0, 0, l, w), { stroke: pal.blue, width: 3, close: true });
        pts.forEach(q => p.dot(q[0], q[1], 3, pal.muted));
        for (let s = 1; s <= k; s++) {
          const a = pts[s - 1], b = pts[s], n = nor[s - 1], off = (s === l + w || s === l + w + 1) ? .95 : .6;
          p.path([a, b], { stroke: pal.green, width: 6 });
          p.label(String(s), (a[0] + b[0]) / 2 + n[0] * off, (a[1] + b[1]) / 2 + n[1] * off, { size: sz, italic: false });
        }
        p.label('start', 0, 0, { size: sz, italic: false, color: pal.muted, dx: -22, dy: 19 });
        const q = pts[k]; p.dot(q[0], q[1], 7, pal.green, pal.stage, 2.5);
      };

      /* the L-shape */
      const drawL = (p, S, cut, o = {}) => {
        const pal = p.pal, { W, H, nw, nh } = S, sz = fs(p);
        const poly = [[0, 0], [W, 0], [W, H - nh], [W - nw, H - nh], [W - nw, H], [0, H]];
        const inside = (i, j) => !(i >= W - nw && j >= H - nh);
        if (cut === 'h' || cut === 'v') {
          const A = cut === 'h' ? [0, H - nh, W - nw, H] : [0, 0, W - nw, H], B = cut === 'h' ? [0, 0, W, H - nh] : [W - nw, 0, W, H - nh];
          p.path(rectPts(...A), { fill: alpha(pal.yellow, .52) });
          p.path(rectPts(...B), { fill: alpha(pal.violet, .34) });
        } else p.path(poly, { fill: cut === 'minus' ? alpha(pal.yellow, .5) : alpha(pal.blue, .09), close: true });
        for (let i = 0; i < W; i++) for (let j = 0; j < H; j++) if (inside(i, j)) p.path(rectPts(i, j, i + 1, j + 1), { stroke: pal['grid-strong'], width: 1, close: true });
        if (cut === 'minus') {
          p.path(rectPts(W - nw, H - nh, W, H), { fill: alpha(pal.red, .12), stroke: pal.red, width: 2.6, dash: [7, 5], close: true });
          p.label('cut out', W - nw / 2, H - nh / 2, { size: sz * .95, italic: false, dy: -9 });
          p.label(`${nw} × ${nh} = ${nw * nh}`, W - nw / 2, H - nh / 2, { size: sz * .95, italic: false, dy: 9 });
        }
        p.path([...poly, poly[0]], { stroke: pal.blue, width: 3.8, close: true });
        if (cut === 'h') p.path([[0, H - nh], [W - nw, H - nh]], { stroke: pal.text, width: 2.8, dash: [7, 5] });
        if (cut === 'v') p.path([[W - nw, 0], [W - nw, H - nh]], { stroke: pal.text, width: 2.8, dash: [7, 5] });
        if (cut === 'h' || cut === 'v') {
          const pcs = lPieces(S, cut);
          const ctr = cut === 'h' ? [[(W - nw) / 2, H - nh / 2], [W / 2, (H - nh) / 2]] : [[(W - nw) / 2, H / 2], [W - nw / 2, (H - nh) / 2]];
          pcs.forEach((d, i) => {
            p.label(i ? 'B' : 'A', ctr[i][0], ctr[i][1], { size: sz * 1.05, italic: false, dy: -10 });
            p.label(`${d[0]} × ${d[1]} = ${d[0] * d[1]}`, ctr[i][0], ctr[i][1], { size: sz * .95, italic: false, dy: 9 });
          });
        }
        if (cut === 'none' && o.ask !== false) p.label('area = ?', W / 2, (H - nh) / 2, { size: sz * 1.05, italic: false });
        if (o.sides !== false) {
          const sd = lSides(S), sp = (t, x, y, al) => p.label(String(t), x, y, { size: sz * .95, italic: false, align: al || 'center', color: pal.text });
          sp(sd[0], W / 2, -.5); sp(sd[1], W + .4, (H - nh) / 2, 'left'); sp(sd[2], W - nw / 2, H - nh + .45);
          sp(sd[3], W - nw + .4, H - nh / 2, 'left'); sp(sd[4], (W - nw) / 2, H + .5); sp(sd[5], -.4, H / 2, 'right');
        }
      };

      /* ----- the picture ----- */
      const caps = () => {
        if (st.practice) return null;
        const l = st.len, w = st.wid, A = l * w, k = rows();
        if (st.mode === 'area') {
          const t1 = k === 0 ? 'No squares counted yet'
            : k < w ? `${k} ${k === 1 ? 'row' : 'rows'} of ${l} = ${k * l} squares so far`
            : `Area = ${l} × ${w} = ${sqOf(A)}`;
          return [t1, k === w ? `${w} ${w === 1 ? 'row' : 'rows'}, ${l} squares in each row` : 'Each square is 1 square unit'];
        }
        if (st.mode === 'perim') {
          const kk2 = walk(), P2 = perim();
          return [kk2 < P2 ? `Walked ${unitsOf(kk2)} of ${P2}` : `Perimeter = ${l} + ${w} + ${l} + ${w} = ${unitsOf(P2)}`,
            kk2 < P2 ? 'Count each edge piece. Each is 1 unit long.' : `Same as 2 × (${l} + ${w}) = 2 × ${l + w} = ${P2}`];
        }
        if (st.mode === 'same') return [`${l} × ${w}: perimeter ${unitsOf(perim())}, area ${sqOf(A)}`, `${HOLDS[st.hold].name} stays the same`];
        const S = LS[st.ls], sd = lSides(S), tot = lArea(S), pc = lPieces(S, st.cut);
        if (st.cut === 'h' || st.cut === 'v') return [`Area = A + B = ${pc[0][0] * pc[0][1]} + ${pc[1][0] * pc[1][1]} = ${sqOf(tot)}`, 'Two pieces that do not overlap: the areas add'];
        if (st.cut === 'minus') return [`Area = ${S.W * S.H} − ${S.nw * S.nh} = ${sqOf(tot)}`, 'Big rectangle, take away the missing corner'];
        return ['An L-shape is not a rectangle', `Walk around: ${sd.join(' + ')} = ${unitsOf(sd.reduce((a, b) => a + b, 0))}`];
      };

      P.onDraw = (c, p) => {
        const pal = p.pal;
        p.fit(GW, GH, { l: 2.1, r: 1.9, t: 2, b: 1.6 });
        drawGrid(p);
        if (st.practice) {
          const pr = PROBS[prIdx], pic = pr.kind === 'build' ? { t: 'rect', len: st.len, wid: st.wid, rows: st.wid, dims: 'both' } : pr.pic;
          if (pic.t === 'rect') {
            const rr = pic.rows === 'all' ? pic.wid : pic.rows;
            drawRect(p, Object.assign({}, pic, { rows: prSolved && pr.kind === 'choice' && pic.rows === 0 && !pic.plain ? pic.wid : rr }));
            if (pr.kind === 'build' && !prSolved) ring(p, st.len, st.wid);
          } else drawL(p, LS[pic.ls], pic.cut);
          caption(p, `Problem ${prIdx + 1} of ${PROBS.length}: ${pr.name}`, pic && pic.hint || pr.hint || '');
          return;
        }
        const m = st.mode, l = st.len, w = st.wid;
        if (m === 'area') {
          drawRect(p, { len: l, wid: w, rows: rows(), totals: true, dims: 'both' });
          ring(p, l, w);
        } else if (m === 'perim') {
          drawWalk(p, l, w, walk());
          ring(p, l, w);
        } else if (m === 'same') {
          const list = shapesFor(st.hold), seen = st.seen[st.hold] || [];
          seen.forEach(k => { const [a, b] = k.split('x').map(Number); if (a !== l || b !== w) p.path(rectPts(0, 0, a, b), { stroke: pal.muted, width: 1.6, dash: [5, 6], close: true }); });
          list.forEach(([a, b]) => p.dot(a, b, 4, pal.muted));
          drawRect(p, { len: l, wid: w, rows: w, dims: 'both' });
          ring(p, l, w);
        } else drawL(p, LS[st.ls], st.cut);
        const cp = caps(); caption(p, cp[0], cp[1]);
      };

      /* ----- the side panel ----- */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const addTo = (...els) => panel.append(...els);
      const lines = a => a.join('<br>');

      const setSize = (l, w) => {
        cancel(); st.len = clamp(l, 1, GW); st.wid = clamp(w, 1, GH);
        st.rowsF = st.wid; st.walkF = perim(); st.said = '';
      };
      const setSi = i => {
        const list = shapesFor(st.hold); st.si = clamp(i, 0, list.length - 1);
        [st.len, st.wid] = list[st.si];
        const arr = st.seen[st.hold] || (st.seen[st.hold] = []), key = `${st.len}x${st.wid}`;
        if (!arr.includes(key)) arr.push(key);
        st.rowsF = st.wid; st.walkF = perim();
      };

      const predict = (title, q, opts, onPick) => {
        let done = false;
        const fbk = h('div', { class: 'ctl readout', 'aria-live': 'polite' }), row = h('div', { class: 'ctl buttons' });
        const btns = opts.map((o, i) => mkBtn(o[0], () => {
          if (done) return; done = true;
          btns.forEach((b, j) => { b.disabled = true; if (j === i) b.classList.add('primary'); });
          fbk.innerHTML = o[1]; onPick(i); sync();
        }));
        row.append(...btns);
        addTo(h('p', { class: 'ctl-title' }, title), h('p', { class: 'hint' }, q), row, fbk);
      };
      const sizeRows = (act) => [
        h('div', { class: 'ctl buttons' }, mkBtn('Length −1', () => act(-1, 0)), mkBtn('Length +1', () => act(1, 0))),
        h('div', { class: 'ctl buttons' }, mkBtn('Width −1', () => act(0, -1)), mkBtn('Width +1', () => act(0, 1)))
      ];

      let ro, shapeSel, fbS;
      let prIdx = 0, prSolved = false, prFirst = 0, prDone = 0, prTried = false;
      let startBtn, ptally, pq, pch, pap, pfb, pnext, pwrap;

      grp('area', () => {
        predict('Predict first', 'The rectangle is 4 units long and 3 units wide. How many unit squares fit inside?',
          [['7 squares', '7 is 4 + 3. That adds the sides. Squares fill rows. Watch: 3 rows with 4 squares in each row.'],
           ['12 squares', 'Yes. There are 3 rows with 4 squares in each row. 4 + 4 + 4 = 12, so 4 × 3 = 12 square units. Watch the rows fill.'],
           ['14 squares', '14 is 4 + 3 + 4 + 3, the way around the edge. Area counts the squares inside. Watch the rows fill.']],
          () => { cancel(); cancel = animateTo(st, { rowsF: st.wid }, 1500, sync); });
        C.title('Fill the rows');
        C.buttons([{ label: 'Add a row', primary: true, onClick: () => { cancel(); st.rowsF = clamp(rows() + 1, 0, st.wid); sync(); } },
          { label: 'Take a row away', onClick: () => { cancel(); st.rowsF = clamp(rows() - 1, 0, st.wid); sync(); } }]);
        C.buttons([{ label: 'All rows', onClick: () => { cancel(); st.rowsF = st.wid; sync(); } }, { label: 'Clear', onClick: () => { cancel(); st.rowsF = 0; sync(); } }]);
      });
      grp('perim', () => {
        predict('Predict first', 'The rectangle is 4 units long and 3 units wide. How many edge pieces go all the way around it?',
          [['7 pieces', '7 is 4 + 3, only two sides. A walk around goes along all four sides.'],
           ['12 pieces', '12 is the area, the squares inside. The perimeter counts pieces on the outside edge.'],
           ['14 pieces', 'Yes. 4 + 3 + 4 + 3 = 14 edge pieces. Watch the walk.']],
          () => { cancel(); cancel = animateTo(st, { walkF: perim() }, 2200, sync); });
        C.title('Walk around the edge');
        C.buttons([{ label: 'Walk 1 more', primary: true, onClick: () => { cancel(); st.walkF = clamp(walk() + 1, 0, perim()); sync(); } },
          { label: 'Back 1', onClick: () => { cancel(); st.walkF = clamp(walk() - 1, 0, perim()); sync(); } }]);
        C.buttons([{ label: 'All the way round', onClick: () => { cancel(); cancel = animateTo(st, { walkF: perim() }, 1600, sync); } },
          { label: 'Start again', onClick: () => { cancel(); st.walkF = 0; sync(); } }]);
      });
      grp('size', () => {
        C.title('Change the size');
        C.hint('Drag the round handle at the corner. Or use the buttons. Length goes across. Width goes up.');
        addTo(...sizeRows((dl, dw) => { setSize(st.len + dl, st.wid + dw); sync(); }));
      });
      grp('same', () => {
        predict('Predict first', 'Three rectangles use a fence of 12 units: 1 × 5, 2 × 4 and 3 × 3. Which one covers the most area?',
          [['3 × 3', 'Yes. 3 × 3 = 9 squares, 2 × 4 = 8 and 1 × 5 = 5. All have a perimeter of 12 units, but the areas differ. The shape closest to a square covers the most.'],
           ['All the same area', 'Not so. They all have perimeter 12, but 1 × 5 covers 5 squares and 3 × 3 covers 9. Try the buttons to see.'],
           ['1 × 5', '1 × 5 covers only 5 squares. The 3 × 3 shape covers 9. A long thin rectangle covers less.']],
          () => { setSi(2); });
        C.title('Hold one thing the same');
        shapeSel = C.select({ label: 'Keep this the same', options: Object.keys(HOLDS).map(k => ({ value: k, label: HOLDS[k].name })), value: st.hold,
          onChange: v => { cancel(); st.hold = v; st.said = ''; setSi(0); sync(); } });
        C.buttons([{ label: '◀ Taller', onClick: () => { cancel(); setSi(st.si - 1); sync(); } }, { label: 'Longer ▶', onClick: () => { cancel(); setSi(st.si + 1); sync(); } }]);
        C.hint('Drag the round handle along the dots, or use the buttons.');
        fbS = C.readout();
      });
      grp('lshape', () => {
        predict('Predict first', 'The L is 6 units wide and 5 units tall, with a 3 by 2 corner missing. What is its area?',
          [['30 square units', '30 is 6 × 5, the big rectangle. But a 3 by 2 corner is missing. Take it away or cut the L in two.'],
           ['24 square units', 'Yes. Cut across: the top piece is 3 × 2 = 6, the bottom piece is 6 × 3 = 18. 6 + 18 = 24. See the cut.'],
           ['22 square units', '22 is the walk around the outside, the perimeter. Area counts squares inside.']],
          () => { st.cut = 'h'; });
        C.title('Choose a way to cut');
        C.buttons([{ label: 'Cut across', onClick: () => { st.cut = 'h'; sync(); } }, { label: 'Cut down', onClick: () => { st.cut = 'v'; sync(); } }]);
        C.buttons([{ label: 'Big rectangle minus corner', onClick: () => { st.cut = 'minus'; sync(); } }, { label: 'No cut', onClick: () => { st.cut = 'none'; sync(); } }]);
        C.buttons([{ label: 'Next L-shape', primary: true, onClick: () => { st.ls = (st.ls + 1) % LS.length; st.cut = 'none'; sync(); } }]);
      });
      grp('ro', () => { ro = C.readout(); });

      /* practice */
      C.title('Practice');
      C.hint('Nine short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); if (st.practice) { st.practice = false; sync(); } else { st.practice = true; loadProb(); sync(); } } }])[0];
      grp('practice', () => {
        pwrap = h('div', { style: 'display:flex;flex-direction:column;gap:14px' });
        ptally = h('p', { class: 'ctl-title' });
        pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        pch = h('div', { class: 'ctl buttons' });
        pap = h('div', { style: 'display:flex;flex-direction:column;gap:10px' });
        const rowsB = sizeRows((dl, dw) => { if (prSolved) return; setSize(st.len + dl, st.wid + dw); pfb.innerHTML = ''; sync(); });
        pap.append(...rowsB, h('div', { class: 'ctl buttons' }, mkBtn('Check', () => checkBuild(), true)));
        pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pnext = mkBtn('Next problem', () => nextProb(), true);
        pwrap.append(ptally, pq, pch, pap, pfb, h('div', { class: 'ctl buttons' }, pnext)); addTo(pwrap);
      });

      const tally = () => { ptally.textContent = `Right on the first try: ${prFirst} of ${prDone} done`; };
      const loadProb = () => {
        const pr = PROBS[prIdx]; prSolved = false; prTried = false;
        pq.textContent = pr.q; pfb.innerHTML = ''; pch.replaceChildren(); pnext.disabled = true; pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        const isB = pr.kind === 'build';
        pap.style.display = isB ? 'flex' : 'none'; pch.style.display = isB ? 'none' : '';
        if (isB) { st.len = pr.start[0]; st.wid = pr.start[1]; st.rowsF = st.wid; } else pr.ch.forEach((o, i) => pch.append(mkBtn(o[0], () => pickChoice(i))));
        tally();
      };
      const finish = msg => {
        prSolved = true; if (!prTried) prFirst++; prDone++; pnext.disabled = false;
        pfb.innerHTML = good('Right.') + ' ' + msg; tally(); sync();
      };
      const pickChoice = i => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        const btn = pch.children[i];
        if (i === pr.ans) {
          Array.from(pch.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary');
          finish(pr.ch[i][1].replace(/^Yes\.\s*/, ''));
        } else {
          prTried = true; btn.disabled = true;
          pfb.innerHTML = bad('Not quite.') + ' ' + pr.ch[i][1] + ' Try another answer.'; tally(); sync();
        }
      };
      const checkBuild = () => {
        if (prSolved) return;
        const l = st.len, w = st.wid, A = l * w, Pm = 2 * (l + w);
        const mine = `Your rectangle is ${l} long and ${w} wide. `;
        if (prIdx === 1) {
          if (l === 6 && w === 2) return finish('The length is 6. Area 12 means 12 squares. Each row has 6 squares, so 12 ÷ 6 = 2 rows. 6 × 2 = 12 square units.');
          prTried = true;
          pfb.innerHTML = bad('Not yet.') + ' ' + mine + `Its area is ${l} × ${w} = ${sqOf(A)}. ` + (l !== 6 ? 'The length must be 6.' : `You need 12 squares. Each row has 6, so you need 12 ÷ 6 = 2 rows.`);
        } else {
          if (Pm === 14 && A === 12) return finish(`The sides are 3 and 4. The perimeter is 2 × (3 + 4) = 14 units. The area is 3 × 4 = 12 square units. Other rectangles with perimeter 14 have other areas: 2 × 5 has area 10.`);
          prTried = true;
          pfb.innerHTML = bad('Not yet.') + ' ' + mine + `Its perimeter is ${unitsOf(Pm)} and its area is ${sqOf(A)}. ` +
            (Pm !== 14 ? `You need a perimeter of 14 units, so length + width must be 7.` : `The perimeter is right, but you need an area of 12. Try another length and width that add to 7.`);
        }
        tally(); sync();
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); sync(); return; }
        pq.textContent = `All ${PROBS.length} problems are done.`; pch.replaceChildren(); pap.style.display = 'none'; pnext.disabled = true;
        pfb.innerHTML = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        const again = mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; loadProb(); sync(); }, true);
        pch.style.display = ''; pch.append(again); sync();
      };

      /* ----- readout ----- */
      const updRo = () => {
        const l = st.len, w = st.wid, A = l * w; let t;
        if (st.mode === 'area') {
          const k = rows();
          t = lines([`${kk('Length')} ${unitsOf(l)}, ${kk('width')} ${unitsOf(w)}`,
            `${kk('Rows filled')} ${k} of ${w}, ${l} squares in each row`,
            k === w ? `<b>Area = ${l} × ${w} = ${sqOf(A)}</b>` : `${kk('Squares so far')} ${k} × ${l} = ${k * l}`]);
        } else if (st.mode === 'perim') {
          const k = walk(), P2 = perim();
          t = lines([`${kk('Length')} ${unitsOf(l)}, ${kk('width')} ${unitsOf(w)}`, `${kk('Walked')} ${unitsOf(k)} of ${P2}`,
            k === P2 ? `<b>Perimeter = ${l} + ${w} + ${l} + ${w} = ${unitsOf(P2)}</b>` : 'Keep walking to the start.']);
        } else if (st.mode === 'same') {
          const seen = (st.seen[st.hold] || []).map(k => k.split('x').map(Number)), keys = [], vals = [];
          seen.forEach(([a, b]) => { const key = keyOf(a, b); if (!keys.includes(key)) { keys.push(key); vals.push(HOLDS[st.hold].kind === 'P' ? a * b : 2 * (a + b)); } });
          const P2 = perim(), isP = HOLDS[st.hold].kind === 'P', distinct = new Set(vals).size;
          t = lines([`${kk('Shape')} ${l} × ${w}`, `${kk('Perimeter')} 2 × (${l} + ${w}) = ${unitsOf(P2)}`, `${kk('Area')} ${l} × ${w} = ${sqOf(A)}`]);
          fbS.innerHTML = `${kk('Tried')} ${keys.map((k, i) => `${k} (${isP ? 'area ' : 'perimeter '}${vals[i]})`).join(', ')}<br>` +
            (distinct >= 2 ? `<b>${isP ? 'Same perimeter, different areas.' : 'Same area, different perimeters.'}</b>` : 'Try another shape. A shape turned on its side is the same rectangle.');
        } else {
          const S = LS[st.ls], sd = lSides(S), tot = lArea(S), pc = lPieces(S, st.cut), head = `${kk('L-shape')} ${S.W} wide, ${S.H} tall, ${S.nw} by ${S.nh} corner missing`;
          const per = `${kk('Perimeter')} ${sd.join(' + ')} = ${unitsOf(sd.reduce((a, b) => a + b, 0))}`;
          if (st.cut === 'h' || st.cut === 'v') {
            t = lines([head, `${kk('Piece A')} ${pc[0][0]} × ${pc[0][1]} = ${pc[0][0] * pc[0][1]}`, `${kk('Piece B')} ${pc[1][0]} × ${pc[1][1]} = ${pc[1][0] * pc[1][1]}`,
              `<b>Area = ${pc[0][0] * pc[0][1]} + ${pc[1][0] * pc[1][1]} = ${sqOf(tot)}</b>`, per]);
          } else if (st.cut === 'minus') {
            t = lines([head, `${kk('Big rectangle')} ${S.W} × ${S.H} = ${S.W * S.H}`, `${kk('Missing corner')} ${S.nw} × ${S.nh} = ${S.nw * S.nh}`, `<b>Area = ${S.W * S.H} − ${S.nw * S.nh} = ${sqOf(tot)}</b>`, per]);
          } else t = lines([head, 'Area: not found yet. Choose a way to cut.', per]);
        }
        ro.innerHTML = t;
        if (st.mode !== 'same') fbS.innerHTML = '';
      };

      const sync = () => {
        const prac = st.practice, m = st.mode;
        vis(G.area, !prac && m === 'area'); vis(G.perim, !prac && m === 'perim'); vis(G.size, !prac && (m === 'area' || m === 'perim'));
        vis(G.same, !prac && m === 'same'); vis(G.lshape, !prac && m === 'lshape'); vis(G.ro, !prac);
        if (pwrap) pwrap.style.display = prac ? 'flex' : 'none';
        if (shapeSel) shapeSel.value = st.hold;
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        P.draw(); if (!prac) updRo();
      };

      /* ----- dragging ----- */
      const handle = () => {
        if (st.practice) { const pr = PROBS[prIdx]; return pr.kind === 'build' && !prSolved ? [st.len, st.wid] : null; }
        return st.mode === 'area' || st.mode === 'perim' || st.mode === 'same' ? [st.len, st.wid] : null;
      };
      draggable(P, {
        hit: (px, py) => { const q = handle(); return q && near(P, q[0], q[1], px, py, 26) ? 'c' : null; },
        move: (id, x, y) => {
          if (st.mode === 'same' && !st.practice) {
            cancel(); const list = shapesFor(st.hold); let best = 0, bd = 1e9;
            list.forEach(([a, b], i) => { const d = Math.hypot(a - x, b - y); if (d < bd) { bd = d; best = i; } });
            if (best !== st.si) setSi(best); sync(); return;
          }
          const l = clamp(Math.round(x), 1, GW), w = clamp(Math.round(y), 1, GH);
          if (l === st.len && w === st.wid) return;
          setSize(l, w); if (st.practice) pfb.innerHTML = ''; sync();
        }
      });

      const FLAGS = ['mode', 'hold', 'cut', 'ls', 'len', 'wid', 'si'];
      const apply = (patch, immediate) => {
        cancel();
        const nums = {};
        for (const k in patch) { if (FLAGS.includes(k)) st[k] = patch[k]; else nums[k] = patch[k]; }
        st.practice = false; st.said = '';
        if (st.mode === 'same') setSi(st.si); else { st.rowsF = st.wid; st.walkF = perim(); }
        Object.assign(st, nums); sync();
      };
      sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
