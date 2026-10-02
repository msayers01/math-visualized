/* =====================================================================
   SCHOOL — Nets and surface area
   ===================================================================== */
{
  const D2R = Math.PI / 180;
  const hexRgb = c => { const m = c.replace('#', ''); return [0, 2, 4].map(i => parseInt(m.slice(i, i + 2), 16)); };
  const mix = (a, b, t) => { const A = hexRgb(a), B = hexRgb(b); return 'rgb(' + A.map((v, i) => Math.round(v * t + B[i] * (1 - t))).join(',') + ')'; };
  const rnd = v => Math.abs(v - Math.round(v)) < 1e-9 ? Math.round(v) : v;
  const slantOf = (s, H) => rnd(Math.hypot(H, s / 2));
  const mod = v => ((v % 360) + 360) % 360;

  /* triangle ends for the triangular prism: base, height, and where the tip sits along the base */
  const TRIS = [
    { name: 'Sides 5, 5, 6', base: 6, ht: 4, px: 3 },
    { name: 'Right triangle 3, 4, 5', base: 4, ht: 3, px: 0 },
    { name: 'Right triangle 6, 8, 10', base: 8, ht: 6, px: 0 },
    { name: 'Right triangle 5, 12, 13', base: 12, ht: 5, px: 0 },
    { name: 'Sides 13, 13, 10', base: 10, ht: 12, px: 5 }
  ];
  const SOLIDS = [
    { id: 'rect', label: 'Box' }, { id: 'tri', label: 'Triangular prism' },
    { id: 'cyl', label: 'Cylinder' }, { id: 'pyr', label: 'Pyramid' }
  ];
  const NS = 35, J = 17, DISC = 48;

  /* ---------- geometry: a net (flat polygons) plus a hinge tree that folds it into the solid ---------- */
  const rectPts = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const build = st => {
    const polys = [], groups = {}, order = [];
    const addG = (id, o) => { groups[id] = Object.assign({ id, polys: [] }, o); order.push(id); };
    const addP = (g, pts, parent, hinge, fold, extra) => {
      const q = Object.assign({ g, pts, parent, hinge, fold }, extra || {});
      polys.push(q); const i = polys.length - 1; groups[g].polys.push(i);
      if (groups[g].anchor == null) groups[g].anchor = i;
      return i;
    };
    const rectG = (id, name, a, b, col) => addG(id, { name, col, pi: false, c: a * b, v: a * b, formula: a + '×' + b + ' = ' + a * b, valText: String(a * b) });
    const triG = (id, name, b, t, col) => addG(id, { name, col, pi: false, c: b * t / 2, v: b * t / 2, formula: '½×' + b + '×' + t + ' = ' + num(b * t / 2), valText: num(b * t / 2) });
    let info = {};

    if (st.solid === 'rect') {
      const { l, w, h } = st;
      rectG('bottom', 'bottom', l, w, 'blue'); rectG('top', 'top', l, w, 'blue');
      rectG('front', 'front', l, h, 'green'); rectG('back', 'back', l, h, 'green');
      rectG('left', 'left', w, h, 'red'); rectG('right', 'right', w, h, 'red');
      order.length = 0; order.push('bottom', 'top', 'front', 'back', 'left', 'right');
      addP('bottom', rectPts(0, 0, l, w), -1, null, 0);
      addP('front', rectPts(0, -h, l, 0), 0, [[0, 0], [l, 0]], 90);
      const bk = addP('back', rectPts(0, w, l, w + h), 0, [[0, w], [l, w]], 90);
      addP('left', rectPts(-h, 0, 0, w), 0, [[0, 0], [0, w]], 90);
      addP('right', rectPts(l, 0, l + h, w), 0, [[l, 0], [l, w]], 90);
      addP('top', rectPts(0, w + h, l, w + h + w), bk, [[0, w + h], [l, w + h]], 90);
      info = { text: 'Box, ' + l + ' × ' + w + ' × ' + h + ' cm' };
    } else if (st.solid === 'tri') {
      const T = TRIS[st.tri], b = T.base, ht = T.ht, px = T.px, L = st.L;
      const sl = rnd(Math.hypot(px, ht)), sr = rnd(Math.hypot(b - px, ht));
      const A = Math.atan2(ht, px) / D2R, B = Math.atan2(ht, b - px) / D2R;
      triG('endF', 'front end', b, ht, 'violet'); triG('endB', 'back end', b, ht, 'violet');
      rectG('floor', 'floor', b, L, 'blue'); rectG('sideL', 'left side', sl, L, 'green'); rectG('sideR', 'right side', sr, L, 'red');
      order.length = 0; order.push('endF', 'endB', 'floor', 'sideL', 'sideR');
      addP('floor', rectPts(0, 0, b, L), -1, null, 0);
      addP('sideL', rectPts(-sl, 0, 0, L), 0, [[0, 0], [0, L]], 180 - A);
      addP('sideR', rectPts(b, 0, b + sr, L), 0, [[b, 0], [b, L]], 180 - B);
      addP('endF', [[0, 0], [b, 0], [px, -ht]], 0, [[0, 0], [b, 0]], 90, { lp: [b / 2 + (px - b / 2) * .3, -ht * .3] });
      addP('endB', [[0, L], [b, L], [px, L + ht]], 0, [[0, L], [b, L]], 90, {
        lp: [b / 2 + (px - b / 2) * .3, L + ht * .3],
        decor: [{ t: 'line', a: [px, L], b: [px, L + ht], col: 'text', minU: .7 }],
        lbl: [{ p: [px, L + ht * .62], text: 'height ' + ht, dx: 7, align: 'left', minU: .7 },
              { p: [b / 2, L], text: 'base ' + b, dy: 13, minU: .7 }] });
      info = { text: 'Triangular prism, triangle sides ' + sl + ', ' + b + ', ' + sr + ', length ' + L + ' cm', sl, sr, b, ht, L };
    } else if (st.solid === 'cyl') {
      const r = st.r, hh = st.ch, wst = TAU * r / NS, rv = r * r, sv = 2 * r * hh;
      addG('bottom', { name: 'bottom', col: 'blue', pi: true, c: rv, v: rv * Math.PI, formula: 'π×' + r + '² = ' + rv + 'π', valText: rv + 'π' });
      addG('top', { name: 'top', col: 'blue', pi: true, c: rv, v: rv * Math.PI, formula: 'π×' + r + '² = ' + rv + 'π', valText: rv + 'π' });
      addG('side', { name: 'side', col: 'green', pi: true, c: sv, v: sv * Math.PI, formula: '2π×' + r + '×' + hh + ' = ' + sv + 'π', valText: sv + 'π' });
      order.length = 0; order.push('bottom', 'top', 'side');
      const circ = (cx, cy) => Array.from({ length: DISC }, (_, i) => [cx + r * Math.cos(TAU * i / DISC), cy + r * Math.sin(TAU * i / DISC)]);
      addP('bottom', circ(0, 0), -1, null, 0);
      const idx = i => 1 + i;
      for (let i = 0; i < NS; i++) {
        const x0 = (i - J - .5) * wst, x1 = x0 + wst, pts = [[x0, -r - hh], [x1, -r - hh], [x1, -r], [x0, -r]];
        let parent, hinge, fold = 360 / NS;
        if (i === J) { parent = 0; hinge = [[x0, -r], [x1, -r]]; fold = 90; }
        else if (i > J) { parent = idx(i - 1); hinge = [[x0, -r - hh], [x0, -r]]; }
        else { parent = idx(i + 1); hinge = [[x1, -r - hh], [x1, -r]]; }
        const ex = { mask: [true, i === NS - 1, true, i === 0] };
        if (i === J) {
          ex.lbl = [{ p: [0, -r - hh + .55], text: 'width: around = ' + 2 * r + 'π ≈ ' + num(TAU * r), minU: .88 },
                    { p: [-Math.PI * r + .3, -r - hh / 2], text: 'height ' + hh, align: 'left', minU: .88 }];
        }
        addP('side', pts, parent, hinge, fold, ex);
        if (i === J) groups.side.anchor = polys.length - 1;
      }
      addP('top', circ(0, -2 * r - hh), idx(J), [[(-.5) * wst, -r - hh], [.5 * wst, -r - hh]], 90);
      info = { text: 'Cylinder, radius ' + r + ' cm, height ' + hh + ' cm' };
    } else {
      const s = st.s, H = st.H, half = s / 2, l = slantOf(s, H), fold = 180 - Math.atan2(H, half) / D2R;
      const tv = s * l / 2;
      addG('base', { name: 'base', col: 'blue', pi: false, c: s * s, v: s * s, formula: s + '×' + s + ' = ' + s * s, valText: String(s * s) });
      for (const [id, nm] of [['front', 'front face'], ['right', 'right face'], ['back', 'back face'], ['left', 'left face']])
        addG(id, { name: nm, col: 'green', pi: false, c: tv, v: tv, formula: '½×' + s + '×' + num(l) + ' = ' + num(tv), valText: num(tv) });
      order.length = 0; order.push('base', 'front', 'right', 'back', 'left');
      addP('base', rectPts(0, 0, s, s), -1, null, 0);
      const mk = (id, pts, hinge, ux, uy, withLbl) => {
        /* apex pts[2]; foot is the midpoint of the hinge; inner triangle stops at distance H from the base edge */
        const ap = pts[2], ft = [(hinge[0][0] + hinge[1][0]) / 2, (hinge[0][1] + hinge[1][1]) / 2];
        const inner = [hinge[0], hinge[1], [ft[0] + ux * H, ft[1] + uy * H]];
        const ex = { lp: [ft[0] + (ap[0] - ft[0]) * .3, ft[1] + (ap[1] - ft[1]) * .3], decor: [{ t: 'poly', pts: inner, col: 'red', minU: .5, when: 'mistake' }] };
        if (withLbl) ex.decor.push({ t: 'line', a: ft, b: ap, col: 'text', minU: .5 });
        if (withLbl) ex.lbl = [{ p: [ft[0] + (ap[0] - ft[0]) * .6, ft[1] + (ap[1] - ft[1]) * .6], text: 'slant', dx: -7, align: 'right', minU: .5, slant: true },
                               { p: inner[2], text: 'height ' + H, dx: 7, dy: 4, align: 'left', minU: .5, when: 'mistake', col: 'red' }];
        addP(id, pts, 0, hinge, fold, ex);
      };
      mk('front', [[0, 0], [s, 0], [half, -l]], [[0, 0], [s, 0]], 0, -1, true);
      mk('back', [[0, s], [s, s], [half, s + l]], [[0, s], [s, s]], 0, 1, false);
      mk('left', [[0, 0], [0, s], [-l, half]], [[0, 0], [0, s]], -1, 0, false);
      mk('right', [[s, 0], [s, s], [s + l, half]], [[s, 0], [s, s]], 1, 0, false);
      info = { text: 'Square pyramid, base ' + s + ' cm, height ' + H + ' cm, slant height ' + num(l) + ' cm', l, s, H };
    }
    /* orient each hinge so the child lies to its left; a positive fold then lifts the child toward +z */
    for (const q of polys) {
      if (q.parent < 0) continue;
      const [a, b] = q.hinge, dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy);
      const gx = q.pts.reduce((t, p) => t + p[0], 0) / q.pts.length, gy = q.pts.reduce((t, p) => t + p[1], 0) / q.pts.length;
      const sgn = (dx / n) * (gy - a[1]) - (dy / n) * (gx - a[0]) < 0 ? -1 : 1;
      q.o = [a[0], a[1], 0]; q.d = [sgn * dx / n, sgn * dy / n, 0];
    }
    return { polys, groups, order, info };
  };

  const rotAxis = (p, o, d, th) => {
    const x = p[0] - o[0], y = p[1] - o[1], z = p[2] - o[2], c = Math.cos(th), s = Math.sin(th), dot = d[0] * x + d[1] * y + d[2] * z;
    return [o[0] + x * c + (d[1] * z - d[2] * y) * s + d[0] * dot * (1 - c),
            o[1] + y * c + (d[2] * x - d[0] * z) * s + d[1] * dot * (1 - c),
            o[2] + z * c + (d[0] * y - d[1] * x) * s + d[2] * dot * (1 - c)];
  };
  /* f = fraction folded (1 = closed solid, 0 = flat net). Returns the 3D transform of each polygon. */
  const transforms = (geo, f) => {
    const memo = [];
    const tf = i => {
      if (memo[i]) return memo[i];
      const q = geo.polys[i];
      if (q.parent < 0) return (memo[i] = p => p);
      const par = tf(q.parent), th = q.fold * D2R * f, o = q.o, d = q.d;
      return (memo[i] = p => par(rotAxis(p, o, d, th)));
    };
    return geo.polys.map((_, i) => tf(i));
  };
  const inPoly = (pts, x, y) => {
    let ins = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins;
    }
    return ins;
  };

  /* ---------- guided predictions ---------- */
  const PRED = {
    rect: { q: 'Before you unfold: a box is 5 cm long, 3 cm wide and 4 cm tall. How many different face sizes will its net show?',
      ch: ['Just 1: all six faces match', '3: the faces come in matching pairs', '6: every face is different'], ok: 1,
      fb: ['Not quite. This box is not a cube, so faces that meet along an edge have different sizes. The net shows three sizes.',
           'Yes. Top and bottom match (5×3), front and back match (5×4), and left and right match (3×4). Each pair has its own color.',
           'Close, but opposite faces are always the same size. That leaves only three different sizes.'],
      set: { solid: 'rect', l: 5, w: 3, h: 4, u: 1, rot: 0, sel: [] } },
    tri: { q: 'Before you unfold: a tent is a prism whose triangular ends have sides 5, 5 and 6 cm. The tent is 8 cm long. Which of its three rectangle faces has the greatest area?',
      ch: ['Each of the two 5 cm wide ones', 'The 6 cm wide one (the floor)', 'All three are equal'], ok: 1,
      fb: ['Each of those is 5×8 = 40. The floor is wider, so it is bigger.',
           'Yes. Each rectangle is 8 cm long and as wide as one side of the triangle. The 6 cm side gives 6×8 = 48. The other two are 5×8 = 40 each.',
           'The rectangles share the same length, 8 cm, but their widths are 5, 5 and 6 cm, so the 6 cm one is larger: 48 against 40.'],
      set: { solid: 'tri', tri: 0, L: 8, u: 1, rot: 0, sel: [] } },
    cyl: { q: 'Before you unroll: a can is 8 cm tall and its circle has radius 3 cm. Unrolled flat, the curved side is a rectangle. Its width equals the can\'s...',
      ch: ['height, 8 cm', 'distance across the circle, 6 cm', 'distance around the circle, about 18.85 cm'], ok: 2,
      fb: ['The can\'s height is the rectangle\'s other side, 8 cm. The width is how far the paper must stretch to go around.',
           'The distance across is 6 cm, but the paper goes around the edge, which is a little more than 3 times as long as the distance across.',
           'Yes. The side wraps once around the circle, so its width is the circumference, 2π×3 = 6π, about 18.85 cm.'],
      set: { solid: 'cyl', r: 3, ch: 8, u: 1, rot: 0, sel: [] } },
    pyr: { q: 'Before you unfold: a square pyramid has a base 6 cm wide and is 4 cm tall. Each triangular face has a height of its own, measured along the face from the base edge to the tip. Compared with 4 cm, it will be...',
      ch: ['shorter than 4 cm', 'exactly 4 cm', 'longer than 4 cm'], ok: 2,
      fb: ['A face leans over, so going along it is longer than going straight up, not shorter.',
           'Straight up is the pyramid\'s height. The face leans, so the path along it is longer.',
           'Yes. The face leans, so its height is longer than 4. It is the slant height: √(4² + 3²) = 5 cm.'],
      set: { solid: 'pyr', s: 6, H: 4, u: 1, rot: 0, sel: [], mistake: true } }
  };

  /* ---------- practice problems (fixed list) ---------- */
  const PROBS = [
    { solid: 'rect', dims: { l: 6, w: 4, h: 3 },
      text: 'A pencil box is 6 cm long, 4 cm wide and 3 cm tall. It has no lid. You paint the whole outside, including the bottom. Click the faces you paint, then press Check faces.',
      need: ['bottom', 'front', 'back', 'left', 'right'],
      extra: { top: 'The box has no lid, so there is no top face to paint. Click it again to remove it.' },
      stages: [{ q: 'What area do you paint?', ok: 1, ch: [
        ['72 cm²', '72 is 6×4×3. That multiplies all three lengths, which gives volume. Surface area adds the areas of the faces.'],
        ['84 cm²', 'Yes. Bottom 6×4 = 24. Front and back 6×3 = 18 each, so 36. Left and right 4×3 = 12 each, so 24. Total 24 + 36 + 24 = 84 cm². The lid would have added 24 more.'],
        ['108 cm²', '108 counts all six faces. This box has no lid, so the top (24 cm²) is not painted.'],
        ['84 cm', 'The number is right, but not the unit. Faces are measured in squares, so the unit is cm², not cm.']] }] },
    { solid: 'tri', tri: 2, dims: { L: 5 },
      text: 'A wedge of cheese is a triangular prism. Each triangle end has a right angle with sides 6 cm and 8 cm, and a long side of 10 cm. The wedge is 5 cm long. A wax coat covers all its faces. Click the faces, then press Check faces.',
      need: ['endF', 'endB', 'floor', 'sideL', 'sideR'], extra: {},
      stages: [{ q: 'What area does the wax cover?', ok: 3, ch: [
        ['120 cm²', '120 is only the three rectangles. The two triangle ends are faces too, 48 cm² together.'],
        ['216 cm²', '216 uses 6×8 = 48 for each triangle. A triangle is half of a rectangle, so each end is ½×6×8 = 24.'],
        ['144 cm²', '144 leaves out one triangle end (24 cm²). Both ends need wax.'],
        ['168 cm²', 'Yes. Two ends: 2×(½×6×8) = 48. Three rectangles, each 5 cm long: 6×5 = 30, 8×5 = 40 and 10×5 = 50. Total 48 + 30 + 40 + 50 = 168 cm².']] }] },
    { solid: 'cyl', dims: { r: 3, ch: 8 },
      text: 'A can of soup has radius 3 cm and height 8 cm. You paint the whole can: the lid, the bottom and the side. Click the faces, then press Check faces.',
      need: ['bottom', 'top', 'side'], extra: {},
      stages: [{ q: 'What area do you paint? Answers use π.', ok: 0, ch: [
        ['66π cm²', 'Yes. Two circles: 2×π×3² = 18π. The side is a rectangle 2π×3 = 6π wide and 8 tall: 6π×8 = 48π. Total 18π + 48π = 66π cm², about 207.35 cm².'],
        ['48π cm²', '48π is only the curved side. The top and bottom circles are faces too, 18π together.'],
        ['57π cm²', '57π counts only one circle. A can has a top and a bottom: 2×9π = 18π.'],
        ['72π cm²', '72π is π×3²×8, the pattern for volume (circle area times height). The side is the distance around, 2π×3, times the height 8.']] }] },
    { solid: 'cyl', dims: { r: 4, ch: 10 },
      text: 'A pencil cup has radius 4 cm and height 10 cm. It is open at the top. You cover the outside, the bottom and the side, with sticky paper. Click the faces, then press Check faces.',
      need: ['bottom', 'side'], extra: { top: 'The cup is open at the top, so there is no top circle to cover. Click it again to remove it.' },
      stages: [{ q: 'What area do you cover? Answers use π.', ok: 2, ch: [
        ['112π cm²', '112π counts a top circle. The cup is open, so only one circle, the bottom, is covered: 16π.'],
        ['80π cm²', '80π is just the side, 2π×4×10. The bottom circle π×4² = 16π also needs paper.'],
        ['96π cm²', 'Yes. Side: 2π×4 = 8π wide and 10 tall, so 80π. Bottom: π×4² = 16π. Total 96π cm², about 301.59 cm².'],
        ['56π cm²', '56π comes from using πr instead of 2πr for the distance around. All the way around is the circumference, 2π×4 = 8π.']] }] },
    { solid: 'pyr', dims: { s: 6, H: 4 },
      text: 'A paper lampshade is a square pyramid. Its base is 6 cm wide. Its height is 4 cm and its slant height is 5 cm. You cover the square base and the four triangles.',
      need: null,
      stages: [{ q: 'What is the total area?', ok: 1, ch: [
        ['84 cm²', '84 puts the height 4 into the triangles: 4×(½×6×4) = 48, plus 36. A face\'s height runs along the face. That is the slant height, 5.'],
        ['96 cm²', 'Yes. Base 6×6 = 36. Each triangle is ½×6×5 = 15, so four give 60. Total 36 + 60 = 96 cm².'],
        ['156 cm²', '156 forgets the ½ in the triangles: 4×(6×5) = 120. A triangle is half of a 6 by 5 rectangle, which is 15.'],
        ['60 cm²', '60 is just the four triangles. The square base is a face too: 36 cm².']] }] },
    { solid: 'pyr', dims: { s: 10, H: 12 }, hideSlant: 1,
      text: 'A model roof is a square pyramid with a base 10 cm wide and a height of 12 cm. The slant height is not given. Use the little right triangle (legs 12 and 5) to find it, then find the total area of the base and four triangles.',
      need: null,
      stages: [
        { q: 'What is the slant height?', ok: 2, ch: [
          ['5 cm', '5 is half the base, one leg of the right triangle. The slant height is the long side, the hypotenuse.'],
          ['12 cm', '12 is the pyramid\'s height, the other leg. The slant height is longer than both legs.'],
          ['13 cm', 'Yes. slant² = 12² + 5² = 144 + 25 = 169, so the slant height is 13 cm.'],
          ['17 cm', '17 adds 12 + 5. For the long side of a right triangle you square, add, then take the square root: √169 = 13.']] },
        { q: 'Now, what is the total area?', ok: 2, ch: [
          ['260 cm²', '260 is only the four triangles (4×65). The square base 10×10 = 100 is a face too.'],
          ['340 cm²', '340 uses the height 12 in the triangles: 4×(½×10×12) = 240, plus 100. Use the slant height 13: 4×65 = 260.'],
          ['360 cm²', 'Yes. Base 10×10 = 100. Each triangle is ½×10×13 = 65, so four give 260. Total 100 + 260 = 360 cm².'],
          ['620 cm²', '620 forgets the ½ in the triangles: 4×(10×13) = 520, plus 100. A triangle is half of a 10 by 13 rectangle.']] }] }
  ];

  const svgEl = (tag, attrs, ...kids) => {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs || {})) e.setAttribute(k, v);
    for (const c of kids) e.append(c);
    return e;
  };

  register({
    id: 'nets-and-surface-area', level: 'school',
    title: 'Nets and surface area',
    blurb: 'Unfold boxes, tents, cans and pyramids into flat nets, click each face, and watch the surface area add up.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 1.5; p.cy = 2; p.span = 4.3;
      const R = (x0, y0, x1, y1, col) => p.path([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], { fill: alpha(pal[col], .3), stroke: pal[col], width: 2.4, close: true });
      R(0, 0, 3, 2, 'blue'); R(0, 4, 3, 6, 'blue');
      R(0, -2, 3, 0, 'green'); R(0, 2, 3, 4, 'green');
      R(-2, 0, 0, 2, 'red'); R(3, 0, 5, 2, 'red');
    },
    hook: 'How much paper does it take to wrap a box, and how can you be sure you counted every part of it?',
    steps: [
      { title: 'Unfold a box',
        text: String.raw`<p>A gift box is 5 cm long, 3 cm wide and 4 cm tall. Its <b>surface area</b> is the total area of all its faces, the paper that covers it.</p><p>Answer <b>Predict</b>, then unfold the box into a <b>net</b>. Click each of the six faces to add its area. The total should reach \(94\).</p>`,
        set: { solid: 'rect', l: 5, w: 3, h: 4, u: 0, rot: 30, sel: [] } },
      { title: 'A tent has triangles',
        text: String.raw`<p>A model tent is a triangular prism: two triangles and three rectangles. Each rectangle is as wide as one side of a triangle.</p><p>A triangle is half a rectangle, so each end is \(\tfrac12\times 6\times 4=12\). Click all five faces. The total should reach \(152\).</p>`,
        set: { solid: 'tri', tri: 0, L: 8, u: 1, rot: 0, sel: [] } },
      { title: 'Unroll a can',
        text: String.raw`<p>A can has two circles and one curved side. Drag <b>Unfold</b>: the side unrolls into a rectangle. It is 8 cm tall. Its width is the distance around the circle, \(2\pi\times 3=6\pi\), about 18.85 cm.</p><p>The side is \(6\pi\times 8=48\pi\). Add two circles of \(9\pi\) each. The total is \(66\pi\), about 207.35.</p>`,
        set: { solid: 'cyl', r: 3, ch: 8, u: 0, rot: 30, sel: [] } },
      { title: 'Height or slant height?',
        text: String.raw`<p>A square pyramid: base 6 cm, height 4 cm. The dashed red triangle uses the height 4, but it stops short of the tip.</p><p>A face's real height runs along the face. It is the long side of the little right triangle in the controls: \(\sqrt{4^2+3^2}=5\). Each face is \(\tfrac12\times 6\times 5=15\), so the total is \(36+4\times 15=96\).</p>`,
        set: { solid: 'pyr', s: 6, H: 4, u: 1, rot: 0, sel: [], mistake: true } }
    ],
    formal: String.raw`
      <p>The <em>surface area</em> of a solid is the total area of all its faces. Think of the paper needed to wrap it with no gaps and no overlaps. A <em>net</em> is the solid cut along some edges and laid flat, so every face shows exactly once. Area counts squares, so surface area is measured in square units such as \(\text{cm}^2\), never in \(\text{cm}\) or \(\text{cm}^3\).</p>
      <h3>Rectangular prism</h3>
      <p>The six faces come in three matching pairs. With length \(\ell\), width \(w\) and height \(h\):
      \[ SA = 2\ell w + 2\ell h + 2wh. \]
      A \(5\times3\times4\) box gives \(2(15)+2(20)+2(12)=94\ \text{cm}^2\).</p>
      <h3>Triangular prism</h3>
      <p>There are two triangle ends and three rectangles. Each rectangle is as long as the prism, \(L\), and as wide as one side of the triangle. Placed side by side, the three rectangles make one big rectangle that is \(L\) tall and as wide as the triangle's perimeter \(P\). With triangle base \(b\) and triangle height \(h\):
      \[ SA = 2\left(\tfrac12 bh\right) + PL = bh + PL. \]
      For the tent, \(b=6\), \(h=4\), \(P=5+5+6=16\) and \(L=8\): \(24+128=152\ \text{cm}^2\).</p>
      <h3>Cylinder</h3>
      <p>Peel the label off a can. It lies flat as a rectangle, because the side goes straight up and down. Its height is the can's height \(h\). Its width is how far the label goes around the can once, and that is the circumference of the circle, \(2\pi r\). So the side has area \(2\pi r\cdot h\). The two circles each have area \(\pi r^2\):
      \[ SA = 2\pi r^2 + 2\pi r h = 2\pi r\,(r+h). \]
      For \(r=3\) and \(h=8\): \(18\pi+48\pi=66\pi\approx 207.35\ \text{cm}^2\). An open can has only one circle, so its area is \(\pi r^2 + 2\pi r h\).</p>
      <h3>Square pyramid</h3>
      <p>Cut the surface into the square base and four triangles. The base has side \(s\). Each triangle has base \(s\), but its height is the <em>slant height</em> \(\ell\), measured along the face. The pyramid's height \(H\) goes straight up through the inside, so it is not a length on any face. Together \(H\), half the base \(\tfrac s2\) and \(\ell\) make a right triangle, so
      \[ \ell=\sqrt{H^2+\left(\tfrac s2\right)^2}, \qquad SA = s^2 + 4\cdot\tfrac12\, s\,\ell = s^2 + 2s\ell. \]
      Because \(\ell\) is the long side of that right triangle, it is always longer than \(H\). For \(s=10\) and \(H=12\): \(\ell=13\) and \(SA=100+260=360\ \text{cm}^2\).</p>
      <h3>Two checks that catch most mistakes</h3>
      <p>Count the faces: a box has 6, a triangular prism 5, a closed cylinder 3 pieces (two circles and the side), a square pyramid 5. Then look at each area. If a triangle is involved, did you use half the base times its height, and was that height measured on the face?</p>`,
    check: [
      { q: 'A square pyramid has a base 6 cm wide. Its height, straight up from the middle of the base to the tip, is 4 cm. Its slant height, measured along the middle of a triangular face from the base edge up to the tip, is 5 cm. Which number belongs in the area of one triangular face, ½ × 6 × ?',
        choices: ['4, the height of the pyramid', '3, half of the base', '5, the slant height, which is the height of the triangle', '6, the edge of the base'], answer: 2,
        why: 'A face is a flat triangle, so its height is measured inside that face, from the base edge up to the tip. That is the slant height, 5 cm. The pyramid\'s height of 4 cm goes straight up through the inside and is not a length on the face. Each face has area ½×6×5 = 15 cm².',
        hint: 'Which of these lengths lies on the tilted face itself?' },
      { q: 'An open can has no lid. Its radius is 5 cm and its height is 12 cm. Its side and its bottom are painted. Use 3.14 for π. What is the total painted area?',
        choices: ['455.3 cm²', '533.8 cm²', '376.8 cm²', '690.8 cm²'], answer: 0,
        why: 'Side: 2 × 3.14 × 5 × 12 = 376.8. Bottom circle: 3.14 × 5² = 78.5. There is no lid, so only one circle. Total 376.8 + 78.5 = 455.3 cm². (533.8 counts a lid, 376.8 forgets the bottom, and 690.8 uses the diameter 10 as the radius of the bottom circle: 3.14 × 10² = 314.)',
        hint: 'How many circles does an open can have? What is the width of its unrolled side?' },
      { q: 'A student finds the surface area of a triangular prism. The triangle ends have base 6 cm and height 4 cm, and the two sloping sides of each triangle are 5 cm. The prism is 10 cm long. The student writes: "Triangle ends: 2 × (6 × 4) = 48. Rectangles: 6×10 + 5×10 + 5×10 = 160. Total: 208 cm²." What is wrong?',
        choices: ['The rectangles should use the height 4 in place of the sides 5 and 5.', 'There should be four rectangles, not three.', 'The ends and rectangles should be multiplied, not added.', 'Each triangle has area ½ × 6 × 4 = 12, not 6 × 4 = 24, so the total is 184 cm².'], answer: 3,
        why: 'A triangle is half of a 6 by 4 rectangle, so each end is 12 cm² and the two ends make 24. The rectangles are right: their widths are the three sides of the triangle. Total 24 + 160 = 184 cm².',
        hint: 'Is 6 × 4 the area of a triangle, or of a rectangle?' }
    ],
    links: { related: ['area-of-a-circle', 'pythagorean-theorem', 'distance-and-the-pythagorean-theorem', 'similarity-and-scaling', 'area-by-decomposition', 'volume-of-prisms-pyramids-and-cones', 'similar-triangles-aa-sas-sss', 'special-right-triangles-and-trigonometry'] },

    mount({ stage, controls: C }) {
      const st = { solid: 'rect', l: 5, w: 3, h: 4, tri: 0, L: 8, r: 3, ch: 8, s: 6, H: 4, u: 0, rot: 30 };
      let sel = [], mistake = false, unitOK = false, cancel = () => {}, geo = build(st), frame = [];
      const pr = { on: false, i: 0, phase: 'faces', k: 0, wrong: false, score: 0, answered: 0, hideSlant: false };
      delete stage.dataset.coords;
      const P = new Plane(stage, { span: 5 });
      const cv = P.canvas; cv.tabIndex = 0; cv.setAttribute('aria-label', 'Solid and its net. Drag to turn it, click a face to add its area. Arrow keys turn it.');

      /* ---------- panel ---------- */
      const lead = C.readout(); const host = lead.parentNode;
      lead.className = 'hint'; lead.removeAttribute('aria-live'); lead.style.margin = '0';
      lead.textContent = 'Pick a solid, unfold it, then click its faces to add up their areas.';
      const vis = (el, on) => { el.style.display = on ? '' : 'none'; };
      const last = () => host.lastElementChild;
      const para = (cls, txt) => { const e = h('div', { class: cls || 'ctl', style: 'font-size:.92rem;line-height:1.5;' }, txt || ''); host.append(e); return e; };
      const title = t => { C.title(t); return last(); };

      const solidT = title('Solid');
      const solidBtns = C.buttons(SOLIDS.map(x => ({ label: x.label, onClick: () => chooseSolid(x.id) })));
      const solidRow = solidBtns[0].parentNode;
      const dimEls = { rect: [], tri: [], cyl: [], pyr: [] }, sl = {};
      const dim = (solid, key, cfg) => { sl[key] = C.slider(Object.assign({ step: 1, value: st[key], onInput: v => { cancel(); st[key] = v; refresh(); } }, cfg)); dimEls[solid].push(last()); };
      const cm = v => v + ' cm';
      dim('rect', 'l', { label: 'Length', min: 1, max: 8, format: cm });
      dim('rect', 'w', { label: 'Width', min: 1, max: 8, format: cm });
      dim('rect', 'h', { label: 'Height', min: 1, max: 8, format: cm });
      const triSel = C.select({ label: 'Triangle at each end', options: TRIS.map((t, i) => ({ value: String(i), label: t.name })), value: '0',
        onChange: v => { cancel(); st.tri = +v; refresh(); } });
      dimEls.tri.push(last());
      dim('tri', 'L', { label: 'Length of the prism', min: 1, max: 10, format: cm });
      dim('cyl', 'r', { label: 'Radius of the circle', min: 1, max: 5, format: cm });
      dim('cyl', 'ch', { label: 'Height of the can', min: 2, max: 10, format: cm });
      dim('pyr', 's', { label: 'Base side (even numbers)', min: 2, max: 12, step: 2, format: cm });
      dim('pyr', 'H', { label: 'Height of the pyramid', min: 1, max: 12, format: cm });
      const mistakeTog = C.toggle({ label: 'Show the mistake: using the height', value: false, onChange: v => { mistake = v; P.draw(); renderReadout(); } });
      const mistakeEl = last();
      const hud = h('div', { class: 'ctl', style: 'max-width:260px' }); host.append(hud);

      const predT = title('Predict, then see');
      const predQ = para('ctl');
      const predBtns = C.buttons([0, 1, 2].map(i => ({ label: '', onClick: () => predict(i) })));
      const predRow = predBtns[0].parentNode;
      const predFb = para('ctl readout');

      const foldT = title('Fold and turn');
      const uS = C.slider({ label: 'Unfold', min: 0, max: 100, step: 1, value: 0, format: v => v === 0 ? 'closed' : v === 100 ? 'flat net' : Math.round(v) + '%', onInput: v => { cancel(); st.u = v / 100; sync(); } });
      C.buttons([{ label: 'Unfold flat', onClick: () => go({ u: 1, rot: 0 }) }, { label: 'Fold up', onClick: () => go({ u: 0, rot: 30 }) }]);
      const rS = C.slider({ label: 'Turn', min: 0, max: 360, step: 5, value: 30, format: v => Math.round(v) + '°', onInput: v => { cancel(); st.rot = v; sync(); } });
      C.buttons([{ label: '◀ Turn left', onClick: () => turn(-15) }, { label: 'Turn right ▶', onClick: () => turn(15) }]);

      const faceT = title('Add up the faces');
      const faceRow = h('div', { class: 'ctl buttons' }); host.append(faceRow);
      const clearBtns = C.buttons([{ label: 'Clear faces', onClick: () => { sel = []; faceFx(); } }]);
      const clearRow = clearBtns[0].parentNode;

      const unitT = title('Which unit is the total in?');
      const unitBtns = C.buttons([{ label: 'cm', onClick: () => unitPick(0) }, { label: 'cm²', onClick: () => unitPick(1) }, { label: 'cm³', onClick: () => unitPick(2) }]);
      const unitRow = unitBtns[0].parentNode;
      const unitFb = para('ctl readout'); unitFb.textContent = 'Each face is covered by squares 1 cm on a side. Pick the unit for the total.';
      const ro = C.readout();

      const practT = title('Practice');
      const startBtns = C.buttons([{ label: 'Start practice (6 problems)', primary: true, onClick: () => startPractice() }]);
      const startRow = startBtns[0].parentNode;
      const pTally = para('ctl'); pTally.style.color = 'var(--muted)';
      const pq = para('ctl readout');
      const pChoiceBtns = C.buttons([0, 1, 2, 3].map(i => ({ label: '', onClick: () => choose(i) })));
      const pChoiceRow = pChoiceBtns[0].parentNode;
      const pActBtns = C.buttons([{ label: 'Check faces', primary: true, onClick: () => checkFaces() }, { label: 'Next problem', primary: true, onClick: () => nextProblem() }, { label: 'Back to exploring', onClick: () => endPractice() }]);
      const [pCheck, pNext, pStop] = pActBtns;
      const pfb = para('ctl readout');

      /* ---------- model ---------- */
      const calc = ids => {
        const gs = ids.map(id => geo.groups[id]), pi = gs.length > 0 && gs.every(g => g.pi), c = gs.reduce((a, g) => a + g.c, 0), v = gs.reduce((a, g) => a + g.v, 0);
        return { parts: gs.map(g => g.valText), pi, exact: pi || gs.every(g => Number.isInteger(g.v)), text: pi ? num(c) + 'π' : num(v), approx: pi ? c * Math.PI : v };
      };
      const sumLine = () => {
        if (!sel.length) return '';
        const k = calc(sel);
        const one = k.parts.length === 1;
        return (one ? '' : k.parts.join(' + ') + (k.exact ? ' = ' : ' ≈ ')) + k.text + (k.pi ? ' ≈ ' + num(k.approx) : '') + (unitOK ? ' cm²' : ' ?');
      };
      const formulaLine = () => {
        const k = calc(geo.order), i = geo.info;
        if (st.solid === 'rect') return `2(${st.l}×${st.w}) + 2(${st.l}×${st.h}) + 2(${st.w}×${st.h}) = ${k.text}`;
        if (st.solid === 'tri') return `2×(½×${i.b}×${i.ht}) + (${i.sl}+${i.b}+${i.sr})×${i.L} = ${k.text}`;
        if (st.solid === 'cyl') return `2×π×${st.r}² + 2π×${st.r}×${st.ch} = ${k.text} ≈ ${num(k.approx)}`;
        return `${st.s}² + 4×(½×${st.s}×${num(i.l)}) ${k.exact ? '=' : '≈'} ${k.text}`;
      };
      const unitTxt = () => unitOK ? ' cm²' : ' (choose the unit above)';
      const renderReadout = () => {
        if (pr.on) return;
        const n = geo.order.length, miss = geo.order.filter(id => !sel.includes(id)).map(id => geo.groups[id].name), k = calc(sel);
        let t = `<span class="k">Solid</span> ${geo.info.text}<br><span class="k">Faces counted</span> ${sel.length} of ${n}`;
        t += `<br><span class="k">Total so far</span> ${sel.length ? k.text + (k.pi ? ' ≈ ' + num(k.approx) : '') : '0'}${unitTxt()}`;
        if (sel.length && miss.length) t += `<br><span class="k">Not counted yet</span> ${miss.join(', ')}`;
        if (!miss.length) t += `<br><span class="k">Every face counted</span> ${formulaLine()}`;
        if (st.solid === 'pyr') t += `<br><span class="k">Slant height</span> √(${st.H}² + ${st.s / 2}²) = ${num(geo.info.l)} cm, longer than the height ${st.H}`;
        if (st.solid === 'pyr' && mistake) t += `<br><span class="k">Red triangle</span> uses the height ${st.H}. It stops short of the tip, so it is too small.`;
        ro.innerHTML = t;
      };
      const renderHud = () => {
        hud.replaceChildren();
        if (st.solid !== 'pyr') return;
        const half = st.s / 2, H = st.H, l = geo.info.l, hide = pr.on && pr.hideSlant;
        const sc = Math.min(110 / half, 82 / H), bx = 78, by = 112, ex = bx + half * sc, ty = by - H * sc, T = (txt, x, y, a, col) => svgEl('text', { x, y, 'text-anchor': a || 'middle', fill: col || 'var(--text)', 'font-size': 12 }, txt);
        const sq = 9;
        hud.append(svgEl('svg', { viewBox: '0 0 240 150', width: '100%', role: 'img', 'aria-label': 'The little right triangle: height ' + H + ', half base ' + half + ', slant height ' + (hide ? 'unknown' : num(l)) },
          T('The little right triangle', 120, 12, 'middle', 'var(--muted)'),
          svgEl('path', { d: `M${bx},${by} L${ex},${by} L${bx},${ty} Z`, fill: 'var(--blue)', 'fill-opacity': .12 }),
          svgEl('path', { d: `M${bx},${by} L${bx},${ty}`, stroke: 'var(--red)', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }),
          svgEl('path', { d: `M${bx},${by} L${ex},${by}`, stroke: 'var(--green)', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }),
          svgEl('path', { d: `M${ex},${by} L${bx},${ty}`, stroke: 'var(--blue)', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }),
          svgEl('path', { d: `M${bx + sq},${by} L${bx + sq},${by - sq} L${bx},${by - sq}`, stroke: 'var(--muted)', 'stroke-width': 1.5, fill: 'none' }),
          T('height ' + H, bx - 7, (by + ty) / 2 + 4, 'end', 'var(--red)'),
          T('half base ' + half, (bx + ex) / 2, by + 16, 'middle', 'var(--green)'),
          T('slant ' + (hide ? '?' : num(l)), (ex + bx) / 2 + 8, (by + ty) / 2 - 4, 'start', 'var(--blue)'),
          T(hide ? 'slant² = ' + H + '² + ' + half + '² = ?' : 'slant² = ' + H + '² + ' + half + '² = ' + num(H * H + half * half), 120, 144, 'middle', 'var(--text)')));
      };
      const markFaces = () => {
        [...faceRow.children].forEach((b, i) => { const on = sel.includes(geo.order[i]); b.className = on ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      };
      const renderFaces = () => {
        faceRow.replaceChildren(...geo.order.map(id => h('button', { type: 'button', class: 'btn', 'aria-pressed': 'false', onclick: () => toggle(id) }, geo.groups[id].name)));
        markFaces();
      };
      const faceFx = () => { markFaces(); renderReadout(); P.draw(); };
      const toggle = id => {
        if (pr.on && (pr.phase !== 'faces')) return;
        sel = sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id];
        faceFx();
      };
      const syncDims = () => { for (const k in sl) sl[k].set(st[k]); triSel.value = String(st.tri); };
      const sync = () => { uS.set(Math.round(st.u * 100)); rS.set(mod(st.rot)); P.draw(); };
      const renderPredict = () => {
        const pd = PRED[st.solid];
        predQ.textContent = pd.q;
        predBtns.forEach((b, i) => { b.textContent = pd.ch[i]; b.className = 'btn'; });
        predFb.textContent = 'Pick an answer. The solid will unfold so you can see.';
      };
      const layout = () => {
        const on = pr.on, hasFaces = !on || (pr.phase === 'faces');
        [solidT, solidRow, predT, predQ, predRow, predFb, unitT, unitRow, unitFb, ro, lead].forEach(e => vis(e, !on));
        for (const k in dimEls) dimEls[k].forEach(e => vis(e, !on && st.solid === k));
        vis(mistakeEl, !on && st.solid === 'pyr'); vis(hud, st.solid === 'pyr');
        vis(faceT, hasFaces); vis(faceRow, hasFaces); vis(clearRow, hasFaces);
        vis(startRow, !on);
        vis(pTally, on); vis(pq, on); vis(pfb, on && pfb.textContent !== ''); vis(pChoiceRow, on && pr.phase === 'choice');
        vis(pCheck, on && pr.phase === 'faces'); vis(pNext, on && (pr.phase === 'done' || pr.phase === 'end')); vis(pStop, on);
        vis(pActBtns[0].parentNode, on);
      };
      const refresh = () => {
        geo = build(st); sel = sel.filter(id => geo.groups[id]);
        syncDims(); renderHud(); markFaces(); renderReadout(); P.draw();
      };
      const chooseSolid = id => {
        cancel(); st.solid = id; sel = []; geo = build(st);
        renderFaces(); renderPredict(); layout(); syncDims(); renderHud(); renderReadout(); P.draw();
        solidBtns.forEach((b, i) => { b.className = SOLIDS[i].id === id ? 'btn primary' : 'btn'; });
      };
      const go = (patch, ms = 1000) => {
        cancel();
        const p = Object.assign({}, patch);
        if (p.rot != null) p.rot = st.rot + (((p.rot - st.rot + 540) % 360) - 180);
        cancel = animateTo(st, p, ms, sync, () => { st.rot = mod(st.rot); sync(); });
      };
      const turn = d => go({ rot: st.rot + d }, 220);
      const predict = i => {
        const pd = PRED[st.solid];
        apply(pd.set);
        predBtns.forEach((b, j) => { b.className = j === pd.ok && i === pd.ok ? 'btn primary' : 'btn'; });
        predFb.textContent = pd.fb[i];
      };
      const unitPick = i => {
        unitFb.textContent = [
          'cm measures a length, a distance along one edge. A face covers a region, so it is counted in squares, not in lengths.',
          'Yes. Each face is measured by how many squares 1 cm by 1 cm cover it, so its unit is cm². The total of all the faces is in cm² too.',
          'cm³ is for volume, the space inside. Surface area is the covering on the outside, which is flat, so it is in square units.'][i];
        if (i === 1) unitOK = true;
        renderReadout(); P.draw();
      };

      /* ---------- practice ---------- */
      const sceneFor = p => {
        cancel(); st.solid = p.solid; Object.assign(st, p.dims); if (p.tri != null) st.tri = p.tri;
        sel = []; mistake = false; mistakeTog.checked = false; geo = build(st);
        renderFaces(); syncDims(); renderHud();
        solidBtns.forEach((b, i) => { b.className = SOLIDS[i].id === st.solid ? 'btn primary' : 'btn'; });
        go({ u: 1, rot: 0 }, 700);
      };
      const showChoices = () => {
        const p = PROBS[pr.i], stg = p.stages[pr.k];
        pChoiceBtns.forEach((b, i) => { const c = stg.ch[i]; b.textContent = c[0]; b.disabled = false; b.className = 'btn'; });
      };
      const renderPractice = () => {
        const n = PROBS.length;
        if (pr.phase === 'end') {
          pTally.textContent = `Finished. Right on the first try: ${pr.score} of ${pr.answered}`;
        } else pTally.textContent = `Problem ${pr.i + 1} of ${n}. Right on the first try: ${pr.score} of ${pr.answered}`;
        const p = PROBS[pr.i];
        if (pr.phase === 'end') {
          pq.innerHTML = `<b>Practice finished.</b> You got ${pr.score} of ${n} right on the first try. ` + (pr.score === n ? 'Every one. You counted every face and used the right heights.' : pr.score >= 4 ? 'Good work. Read the notes on the ones you missed, then try again.' : 'Keep going. Count the faces first, then check each height: for a triangle face it is the height along the face.');
          pNext.textContent = 'Practice again';
        } else {
          const stg = p.stages[pr.k];
          pq.innerHTML = `<b>Problem ${pr.i + 1}.</b> ${p.text}` + (pr.phase === 'choice' ? `<br><b>${stg.q}</b>` : '');
          pNext.textContent = pr.i === n - 1 ? 'See my result' : 'Next problem';
        }
        pr.hideSlant = !!(p.hideSlant && pr.phase === 'choice' && pr.k < p.hideSlant);
        renderHud(); layout(); P.draw();
      };
      const showProblem = () => {
        const p = PROBS[pr.i];
        pr.phase = p.need ? 'faces' : 'choice'; pr.k = 0; pr.wrong = false; pfb.textContent = '';
        sceneFor(p); if (pr.phase === 'choice') showChoices();
        renderPractice();
      };
      const startPractice = () => {
        cancel(); pr.on = true; pr.i = 0; pr.score = 0; pr.answered = 0; showProblem();
      };
      const endPractice = quiet => {
        pr.on = false; pr.hideSlant = false; sel = []; pfb.textContent = '';
        layout(); renderFaces(); renderHud(); renderReadout(); P.draw();
      };
      const checkFaces = () => {
        const p = PROBS[pr.i], need = p.need, miss = need.filter(id => !sel.includes(id)), ext = sel.filter(id => !need.includes(id));
        const nm = ids => ids.map(id => geo.groups[id].name).join(', ');
        if (!miss.length && !ext.length) {
          pr.phase = 'choice'; pfb.textContent = 'Yes, those are the right faces: ' + nm(need) + '. Now work out the area.';
          showChoices(); renderPractice(); return;
        }
        let t = '';
        if (ext.length) t += ext.map(id => p.extra[id] || ('The ' + geo.groups[id].name + ' is not covered in this problem. Click it again to remove it.')).join(' ') + ' ';
        if (miss.length) t += 'You still need: ' + nm(miss) + '. A face you skip leaves a bare patch.';
        pfb.textContent = t.trim(); layout();
      };
      const choose = i => {
        const p = PROBS[pr.i], stg = p.stages[pr.k], c = stg.ch[i];
        if (i === stg.ok) {
          pfb.textContent = c[1];
          if (pr.k < p.stages.length - 1) {
            pr.k++; showChoices(); renderPractice();
          } else {
            pr.phase = 'done'; pr.answered++; if (!pr.wrong) pr.score++; renderPractice();
          }
        } else {
          pr.wrong = true; pChoiceBtns[i].disabled = true; pfb.textContent = c[1]; layout();
        }
      };
      const nextProblem = () => {
        if (pr.phase === 'end') { pr.i = 0; pr.score = 0; pr.answered = 0; showProblem(); return; }
        if (pr.i === PROBS.length - 1) { pr.phase = 'end'; pfb.textContent = ''; renderPractice(); return; }
        pr.i++; showProblem();
      };

      /* ---------- drawing ---------- */
      const txt = (c, pal, s, x, y, o) => {
        o = o || {};
        c.font = `${o.w || 500} ${o.size}px "Hanken Grotesk","Helvetica Neue",Arial,sans-serif`;
        c.textAlign = o.align || 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 4;
        c.strokeStyle = o.halo || pal.stage; c.strokeText(s, x, y); c.fillStyle = o.color || pal.text; c.fillText(s, x, y);
      };
      P.onDraw = (c, p) => {
        const pal = p.pal, W = p.w, Hh = p.h, m = Math.min(W, Hh), fs = clamp(m * .038, 12, 17), capH = fs * 3.9;
        const dark = (hexRgb(pal.stage).reduce((a, b) => a + b, 0) / 3) < 128;
        const tint = key => mix(pal[key], pal.stage, .3), hi = mix(pal.yellow, pal.stage, dark ? .5 : .6);
        const u = clamp(st.u, 0, 1), tfs = transforms(geo, 1 - u);
        const pts3 = geo.polys.map((q, i) => q.pts.map(pt => tfs[i]([pt[0], pt[1], 0])));
        const lo = [1e9, 1e9, 1e9], hiB = [-1e9, -1e9, -1e9]; let mean = [0, 0, 0], cnt = 0;
        for (const ps of pts3) for (const q of ps) { for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], q[a]); hiB[a] = Math.max(hiB[a], q[a]); mean[a] += q[a]; } cnt++; }
        mean = mean.map(v => v / cnt);
        const c0 = lo.map((v, a) => (v + hiB[a]) / 2); let R = 1e-6;
        for (const ps of pts3) for (const q of ps) R = Math.max(R, Math.hypot(q[0] - c0[0], q[1] - c0[1], q[2] - c0[2]));
        const yaw = st.rot * D2R, el = lerp(26, 90, ease(u)) * D2R, cy_ = Math.cos(yaw), sy_ = Math.sin(yaw), se = Math.sin(el), ce = Math.cos(el);
        const avail = Math.min(W, Hh - capH), k = avail / (2 * R) * .95, ox = W / 2, oy = (Hh - capH) / 2 + 2;
        const proj = q => {
          const x = q[0] - c0[0], y = q[1] - c0[1], z = q[2] - c0[2], x1 = x * cy_ - y * sy_, y1 = x * sy_ + y * cy_;
          return { x: ox + k * x1, y: oy - k * (y1 * se + z * ce), d: y1 * ce - z * se, y1, x1, z };
        };
        const projAt = (i, pt) => proj(tfs[i]([pt[0], pt[1], 0]));
        const items = geo.polys.map((q, i) => {
          const pp = pts3[i].map(proj), scr = pp.map(a => [a.x, a.y]);
          const cx = scr.reduce((t, a) => t + a[0], 0) / scr.length, cyy = scr.reduce((t, a) => t + a[1], 0) / scr.length;
          let ar = 0; for (let j = 0; j < scr.length; j++) { const a = scr[j], b = scr[(j + 1) % scr.length]; ar += a[0] * b[1] - b[0] * a[1]; }
          const A = pts3[i][0], B = pts3[i][1], Cc = pts3[i][2], ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], vx = Cc[0] - A[0], vy = Cc[1] - A[1], vz = Cc[2] - A[2];
          let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
          const gx = pts3[i].reduce((t, a) => t + a[0], 0) / pts3[i].length - mean[0], gy = pts3[i].reduce((t, a) => t + a[1], 0) / pts3[i].length - mean[1], gz = pts3[i].reduce((t, a) => t + a[2], 0) / pts3[i].length - mean[2];
          if (nx * gx + ny * gy + nz * gz < 0) { nx = -nx; ny = -ny; nz = -nz; }
          const n1y = nx * sy_ + ny * cy_, facing = (-n1y * ce + nz * se) > 0;
          return { i, g: q.g, scr, cx, cy: cyy, area: Math.abs(ar) / 2, d: pp.reduce((t, a) => t + a.d, 0) / pp.length, facing };
        });
        items.sort((a, b) => b.d - a.d);
        frame = items;

        const late = [];
        for (const it of items) {
          const q = geo.polys[it.i], g = geo.groups[q.g], on = sel.includes(q.g), fill = on ? hi : tint(g.col), n = it.scr.length;
          c.beginPath(); it.scr.forEach((a, j) => j ? c.lineTo(a[0], a[1]) : c.moveTo(a[0], a[1])); c.closePath();
          c.fillStyle = fill; c.fill(); c.lineWidth = 1; c.strokeStyle = fill; c.lineJoin = 'round'; c.stroke();
          c.strokeStyle = pal[g.col]; c.lineWidth = on ? 3.2 : 2; c.lineCap = 'round';
          if (q.mask) {
            for (let j = 0; j < n; j++) { if (!q.mask[j]) continue; const a = it.scr[j], b = it.scr[(j + 1) % n]; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
          } else {
            c.beginPath(); it.scr.forEach((a, j) => j ? c.lineTo(a[0], a[1]) : c.moveTo(a[0], a[1])); c.closePath(); c.stroke();
          }
          const P3 = pt => proj(tfs[it.i]([pt[0], pt[1], 0]));
          for (const dc of q.decor || []) {
            if (u < dc.minU || (dc.when === 'mistake' && !mistake)) continue;
            if (dc.t === 'line') {
              const a = P3(dc.a), b = P3(dc.b); c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y);
              c.setLineDash([6, 5]); c.lineWidth = 2; c.strokeStyle = pal[dc.col]; c.stroke(); c.setLineDash([]);
            } else {
              const ps = dc.pts.map(P3); c.beginPath(); ps.forEach((a, j) => j ? c.lineTo(a.x, a.y) : c.moveTo(a.x, a.y)); c.closePath();
              c.fillStyle = alpha(pal[dc.col], .28); c.fill(); c.setLineDash([6, 5]); c.lineWidth = 2.2; c.strokeStyle = pal[dc.col]; c.stroke(); c.setLineDash([]);
            }
          }
          for (const lb of q.lbl || []) {
            if (u < lb.minU || (lb.when === 'mistake' && !mistake)) continue;
            const a = P3(lb.p);
            let tx = lb.text; if (lb.slant) tx = 'slant ' + (pr.on && pr.hideSlant ? '?' : num(geo.info.l));
            late.push({ tx, x: a.x + (lb.dx || 0), y: a.y + (lb.dy || 0), align: lb.align, color: lb.col ? pal[lb.col] : pal.text });
          }
        }
        for (const l of late) txt(c, pal, l.tx, l.x, l.y, { size: fs, align: l.align, color: l.color });

        /* face names and areas */
        const pick = {};
        for (const it of items) {
          const g = geo.groups[it.g];
          if (u > .55) { if (it.i === g.anchor) pick[it.g] = it; }
          else if (it.facing) { const cur = pick[it.g]; if (!cur || it.d < cur.d) pick[it.g] = it; }
        }
        for (const id of geo.order) {
          const it = pick[id]; if (!it) continue;
          const g = geo.groups[id], on = sel.includes(id), sq = Math.sqrt(it.area);
          if (sq < 22) continue;
          const halo = on ? hi : tint(g.col);
          const lines = [{ s: g.name + (pr.on && on ? ' ✓' : ''), b: false }];
          if (on && !pr.on) {
            c.font = `600 ${fs}px "Hanken Grotesk",Arial,sans-serif`;
            lines.push({ s: c.measureText(g.formula).width < sq * 1.3 ? g.formula : g.valText, b: true });
          }
          const lq = geo.polys[it.i], lpt = lq.lp ? projAt(it.i, lq.lp) : null, lx = lpt ? lpt.x : it.cx, ly = lpt ? lpt.y : it.cy;
          const lh = fs * 1.25, y0 = ly - (lines.length - 1) * lh / 2;
          lines.forEach((ln, j) => txt(c, pal, ln.s, lx, y0 + j * lh, { size: fs, w: ln.b ? 700 : 500, halo, color: pal.text }));
        }

        /* caption under the drawing */
        const y1 = Hh - capH + fs * 1.25, y2 = y1 + fs * 1.55;
        let l1, l2;
        if (pr.on) {
          l1 = pr.phase === 'faces' ? 'Faces chosen: ' + sel.length : ''; l2 = pr.phase === 'faces' ? 'Click faces on the net, or use the buttons.' : 'Work out the area, then pick an answer.';
        } else if (sel.length) {
          l1 = sumLine(); l2 = sel.length + ' of ' + geo.order.length + ' faces counted' + (sel.length === geo.order.length ? '. Every face is in the total.' : '');
        } else { l1 = ''; l2 = u > .55 ? 'Click a face to add its area.' : 'Unfold the solid to reach every face.'; }
        if (l1) { let sz = fs + 1; c.font = `700 ${sz}px "Hanken Grotesk",Arial,sans-serif`; while (sz > 12 && c.measureText(l1).width > W - 16) { sz--; c.font = `700 ${sz}px "Hanken Grotesk",Arial,sans-serif`; } txt(c, pal, l1, W / 2, y1, { size: sz, w: 700, color: pal.text }); }
        txt(c, pal, l2, W / 2, l1 ? y2 : (y1 + y2) / 2, { size: fs, color: pal.muted });
      };

      /* ---------- pointer: drag to turn, click a face to add it ---------- */
      const hit = (x, y) => { for (let n = frame.length - 1; n >= 0; n--) if (inPoly(frame[n].scr, x, y)) return frame[n].g; return null; };
      const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      let drag = null;
      cv.addEventListener('pointerdown', e => { const [x, y] = pos(e); drag = { x, y, rot0: st.rot, moved: false }; cv.setPointerCapture(e.pointerId); });
      cv.addEventListener('pointermove', e => {
        const [x, y] = pos(e);
        if (drag) {
          if (!drag.moved && Math.hypot(x - drag.x, y - drag.y) > 5) { drag.moved = true; cancel(); }
          if (drag.moved) { st.rot = mod(drag.rot0 + (x - drag.x) * .6); sync(); }
        } else cv.style.cursor = hit(x, y) && !(pr.on && pr.phase !== 'faces') ? 'pointer' : 'grab';
      });
      cv.addEventListener('pointerup', e => {
        if (drag && !drag.moved) { const [x, y] = pos(e), g = hit(x, y); if (g) toggle(g); }
        drag = null;
      });
      cv.addEventListener('pointercancel', () => { drag = null; });
      cv.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); turn(-15); } else if (e.key === 'ArrowRight') { e.preventDefault(); turn(15); }
      });

      /* ---------- steps ---------- */
      const apply = (patch, immediate) => {
        cancel();
        if (pr.on) { pr.on = false; pr.hideSlant = false; pfb.textContent = ''; }
        const { solid, tri, sel: ns, mistake: ms, u: pu, rot: pro, ...dims } = patch;
        if (solid) st.solid = solid;
        if (tri != null) st.tri = tri;
        Object.assign(st, dims);
        if (ns) sel = ns.slice();
        if (ms !== undefined) { mistake = ms; mistakeTog.checked = ms; }
        geo = build(st); sel = sel.filter(id => geo.groups[id]);
        renderFaces(); renderPredict(); layout(); syncDims(); renderHud(); renderReadout();
        solidBtns.forEach((b, i) => { b.className = SOLIDS[i].id === st.solid ? 'btn primary' : 'btn'; });
        const nums = {}; if (pu != null) nums.u = pu; if (pro != null) nums.rot = st.rot + (((pro - st.rot + 540) % 360) - 180);
        if (immediate) { Object.assign(st, nums); st.rot = mod(st.rot); sync(); }
        else cancel = animateTo(st, nums, 1100, sync, () => { st.rot = mod(st.rot); sync(); });
      };

      chooseSolid('rect');
      layout();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
