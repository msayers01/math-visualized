/* =====================================================================
   SCHOOL — Rigid motions and congruence
   ===================================================================== */
{
  /* ---------- the geometry ---------- */
  const PRE = [[1, 1], [4, 1], [1, 3]];
  const NAMES = ['A', 'B', 'C'];
  const PR = ['′', '″', '‴'];
  const LINE = {
    xa:  { eq: 'y = 0 (the x-axis)',  short: 'the x-axis', f: ([x, y]) => [x, -y],       rule: '(x, −y)',   a: [-40, 0],  b: [40, 0],   lp: [6.4, 0, 0, -15, 'center'] },
    ya:  { eq: 'x = 0 (the y-axis)',  short: 'the y-axis', f: ([x, y]) => [-x, y],       rule: '(−x, y)',   a: [0, -40],  b: [0, 40],   lp: [0, 6.8, 10, 0, 'left'] },
    yx:  { eq: 'y = x',               short: 'the line y = x',  f: ([x, y]) => [y, x],   rule: '(y, x)',    a: [-40, -40], b: [40, 40], lp: [6, 6, -12, 0, 'right'] },
    ynx: { eq: 'y = −x',              short: 'the line y = −x', f: ([x, y]) => [-y, -x], rule: '(−y, −x)',  a: [-40, 40], b: [40, -40], lp: [-6, 6, 12, 0, 'left'] },
    x2:  { eq: 'x = 2',               short: 'the line x = 2',  f: ([x, y]) => [4 - x, y], rule: '(4 − x, y)', a: [2, -40], b: [2, 40],  lp: [2, 6.8, 10, 0, 'left'] },
    y1:  { eq: 'y = 1',               short: 'the line y = 1',  f: ([x, y]) => [x, 2 - y], rule: '(x, 2 − y)', a: [-40, 1], b: [40, 1],  lp: [-6.4, 1, 0, -15, 'center'] }
  };
  const mT = (dx, dy) => ({ k: 'T', dx, dy });
  const mF = L => ({ k: 'F', L });
  const mR = (a, cx = 0, cy = 0) => ({ k: 'R', a, cx, cy });
  const mD = (f, cx = 0, cy = 0) => ({ k: 'D', f, cx, cy });
  const doMove = (m, [x, y]) => {
    if (m.k === 'T') return [x + m.dx, y + m.dy];
    if (m.k === 'F') return LINE[m.L].f([x, y]);
    if (m.k === 'D') return [m.cx + m.f * (x - m.cx), m.cy + m.f * (y - m.cy)];
    if (m.a === 90) return [m.cx - (y - m.cy), m.cy + (x - m.cx)];
    if (m.a === 180) return [2 * m.cx - x, 2 * m.cy - y];
    return [m.cx + (y - m.cy), m.cy - (x - m.cx)];
  };
  const moveAt = (m, p, t) => {
    if (t >= 1) return doMove(m, p);
    if (m.k === 'R') {
      const th = t * m.a * Math.PI / 180, dx = p[0] - m.cx, dy = p[1] - m.cy;
      return [m.cx + dx * Math.cos(th) - dy * Math.sin(th), m.cy + dx * Math.sin(th) + dy * Math.cos(th)];
    }
    const q = doMove(m, p);
    return [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
  };
  const stagesOf = (pre, moves, anim) => {
    const out = [pre];
    moves.forEach((m, i) => out.push(out[i].map(p => moveAt(m, p, i === moves.length - 1 ? anim : 1))));
    return out;
  };
  const runMoves = (pre, moves) => stagesOf(pre, moves, 1)[moves.length];
  const same = (a, b) => a.length === b.length && a.every((p, i) => Math.hypot(p[0] - b[i][0], p[1] - b[i][1]) < 1e-6);

  /* ---------- measurements ---------- */
  const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const sides = P => [dist(P[0], P[1]), dist(P[1], P[2]), dist(P[2], P[0])];
  const angleAt = (P, i) => {
    const a = P[i], b = P[(i + 1) % 3], c = P[(i + 2) % 3];
    const u = [b[0] - a[0], b[1] - a[1]], v = [c[0] - a[0], c[1] - a[1]];
    return Math.acos(clamp((u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v)), -1, 1)) * 180 / Math.PI;
  };
  const orient = P => ((P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[1][1] - P[0][1]) * (P[2][0] - P[0][0])) > 0 ? 'counterclockwise' : 'clockwise';
  const r1 = v => num(Math.round(v * 10) / 10);
  const pt = p => `(${num(p[0])}, ${num(p[1])})`;
  const cen = P => [(P[0][0] + P[1][0] + P[2][0]) / 3, (P[0][1] + P[1][1] + P[2][1]) / 3];

  /* ---------- words and rules ---------- */
  const addT = (v, n) => v === 0 ? n : v < 0 ? `${n} − ${num(-v)}` : `${n} + ${num(v)}`;
  const subT = (c, n) => c === 0 ? '−' + n : `${num(c)} − ${n}`;
  const centerWord = m => m.cx === 0 && m.cy === 0 ? 'the origin' : pt([m.cx, m.cy]);
  const wordsOf = m => {
    if (m.k === 'T') {
      const p = [];
      if (m.dx) p.push(`${num(Math.abs(m.dx))} ${m.dx > 0 ? 'right' : 'left'}`);
      if (m.dy) p.push(`${num(Math.abs(m.dy))} ${m.dy > 0 ? 'up' : 'down'}`);
      return p.length ? 'Slide ' + p.join(' and ') : 'Slide by (0, 0): nothing moves';
    }
    if (m.k === 'F') return `Flip over ${LINE[m.L].short}`;
    if (m.k === 'R') return `Turn ${m.a}° counterclockwise about ${centerWord(m)}` + (m.a === 180 ? ' (a half turn)' : m.a === 270 ? ' (the same as 90° clockwise)' : '');
    return `Dilate by a factor of ${num(m.f)} from ${centerWord(m)}`;
  };
  const ruleOf = m => {
    let r;
    if (m.k === 'T') r = `(${addT(m.dx, 'x')}, ${addT(m.dy, 'y')})`;
    else if (m.k === 'F') r = LINE[m.L].rule;
    else if (m.k === 'R') {
      const { cx, cy } = m;
      if (cx === 0 && cy === 0) r = { 90: '(−y, x)', 180: '(−x, −y)', 270: '(y, −x)' }[m.a];
      else if (m.a === 90) r = `(${subT(cx + cy, 'y')}, ${addT(cy - cx, 'x')})`;
      else if (m.a === 180) r = `(${subT(2 * cx, 'x')}, ${subT(2 * cy, 'y')})`;
      else r = `(${addT(cx - cy, 'y')}, ${subT(cx + cy, 'x')})`;
    } else {
      const f = num(m.f), one = (c, v) => c === 0 ? `${f}${v}` : `${num(c)} + ${f}(${addT(-c, v)})`;
      r = `(${one(m.cx, 'x')}, ${one(m.cy, 'y')})`;
    }
    return `(x, y) → ${r}`;
  };

  /* ---------- practice problems (a fixed list) ---------- */
  const T3 = runMoves(PRE, [mF('yx')]), T4 = runMoves(PRE, [mF('ya'), mT(0, -4)]);
  const T5 = runMoves(PRE, [mD(2), mT(-8, -7)]), T6 = runMoves(PRE, [mR(90)]);
  const PROBS = [
    { kind: 'mc', tag: 'Find the image', ring: 2,
      q: 'Slide the triangle with the rule (x, y) → (x − 5, y + 2). Corner C is at (1, 3). Where does C land?',
      show: [mT(-5, 2)],
      choices: [
        { t: 'C′ = (6, 1)', pt: [6, 1], why: 'That slides the other way. It adds 5 to x and takes 2 from y. The rule says x − 5 and y + 2.' },
        { t: 'C′ = (−4, 3)', pt: [-4, 3], why: 'You changed x but left y alone. The rule changes both coordinates, so y becomes 3 + 2 = 5.' },
        { t: 'C′ = (−4, 5)', ok: true, why: 'Apply the rule to each coordinate. x: 1 − 5 = −4. y: 3 + 2 = 5. The slide is 5 left and 2 up, the same for every corner.' },
        { t: 'C′ = (−5, 2)', pt: [-5, 2], why: 'That is the slide itself, not the new corner. The image is the old corner plus the slide: (1 − 5, 3 + 2).' }] },
    { kind: 'mc', tag: 'Find the image', ring: 1,
      q: 'Turn the triangle 90° counterclockwise about the origin. Corner B is at (4, 1). Where does B land?',
      show: [mR(90)],
      choices: [
        { t: 'B′ = (−1, 4)', ok: true, why: 'A quarter turn counterclockwise sends (x, y) to (−y, x). B was 4 right and 1 up of the origin. After the turn it is 4 up and 1 left: (−1, 4).' },
        { t: 'B′ = (1, −4)', pt: [1, -4], why: 'That is a turn the other way (clockwise), which sends (x, y) to (y, −x). Counterclockwise is against the hands of a clock.' },
        { t: 'B′ = (−4, −1)', pt: [-4, -1], why: 'That is a half turn (180°), which sends (x, y) to (−x, −y). A quarter turn only swaps the two numbers and changes one sign.' },
        { t: 'B′ = (1, 4)', pt: [1, 4], why: 'Swapping x and y with no sign change is a flip over the line y = x, not a turn. (1, 4) is not a quarter of the way round from (4, 1): the flip also changes which way A, B, C goes round. A turn keeps the direction A, B, C goes round.' }] },
    { kind: 'mc', tag: 'Choose the move',
      q: 'Which ONE move maps the light triangle ABC onto the yellow target? Look at the picture. The target is a mirror image of ABC.',
      tgt: T3,
      choices: [
        { t: 'Turn 90° counterclockwise about the origin', moves: [mR(90)], why: 'A turn keeps the direction A, B, C goes round. The target runs the other way, so no turn can reach it.' },
        { t: 'Flip over the line y = x', moves: [mF('yx')], ok: true, why: 'A sits on the mirror line, so it stays at (1, 1). B (4, 1) swaps to (1, 4) and C (1, 3) swaps to (3, 1). Each corner is as far from the mirror on one side as its image is on the other.' },
        { t: 'Flip over the x-axis', moves: [mF('xa')], why: 'That is a mirror image, which is right, but the mirror is in the wrong place. It drops the triangle below the x-axis.' },
        { t: 'Flip over the y-axis', moves: [mF('ya')], why: 'Again a mirror image, but over the y-axis the triangle lands to the left of it. The target is on the right.' }] },
    { kind: 'seq', tag: 'Build a sequence',
      q: 'Use the palette to map ABC onto the yellow target with two moves. Choose a move, press Apply move, do it again, then press Check my sequence.',
      tgt: T4, hint: 'In ABC the two short sides run right and up from the right angle. In the target they run left and up. Which kind of move turns right into left? Then ask where the figure has to sit.' },
    { kind: 'mc', tag: 'Congruent or not?',
      q: 'The light triangle has sides 3, 2 and about 3.61, and a right angle. The yellow triangle has sides 6, 4 and about 7.21, and a right angle. Are they congruent?',
      tgt: T5, show: [mD(2), mT(-8, -7)],
      choices: [
        { t: 'Yes. They have the same angles, so they are the same.', why: 'Same angles means the same shape, which is called similar. Congruent also needs the same size: every side must be equal. Here every side is twice as long.' },
        { t: 'No. Every side is twice as long, so no rigid motion can match them.', ok: true, why: 'Slides, flips and turns keep every length. To turn a side of 3 into a side of 6 you need a dilation, which is not rigid. The yellow triangle is similar to the light one, not congruent. (The picture shows the dilation, then a slide.)' },
        { t: 'Yes. A flip and a slide will match them.', why: 'Flips and slides never change lengths, so they cannot turn a side of 3 into a side of 6.' },
        { t: 'No. They are in different places.', why: 'Place does not matter, because a slide fixes place. The real reason is size: the sides are not equal.' }] },
    { kind: 'mc', tag: 'Corresponding parts', ring: -1, hl: true,
      q: 'In triangle ABC, AB = 3 and AC = 2, with a right angle at A. Triangle DEF is congruent to it, with D matching A, E matching B and F matching C. How long is side DF?',
      tgt: T6, names: ['D', 'E', 'F'],
      choices: [
        { t: '3', why: 'DE matches AB, so DE = 3. DF joins D and F, which match A and C. So DF matches AC.' },
        { t: '3.61', why: 'That is the long side, BC. It matches EF, not DF.' },
        { t: '5', why: 'Adding 3 + 2 does not give a side of congruent triangles. Each side of DEF is equal to one side of ABC.' },
        { t: '2', ok: true, why: 'Congruent triangles have equal corresponding sides. Corresponding sides join matching letters. DF joins D and F, which match A and C, so DF = AC = 2. You can count it on the grid: from (−3, 1) to (−1, 1). The angle at D is also 90°, because it matches the angle at A.' }] }
  ];
  const N = PROBS.length;

  const good = s => `<b style="color:var(--green)">${s}</b>`, bad = s => `<b style="color:var(--red)">${s}</b>`;

  const diagnose = (img, tgt, moves) => {
    const ls = a => sides(a).map(v => Math.round(v * 1e6)).sort((p, q) => p - q).join();
    if (ls(img) !== ls(tgt)) return moves.some(m => m.k === 'D')
      ? 'The side lengths do not match the target. A dilation changes lengths, and a rigid motion never does. The target is the same size as ABC, so leave the dilation out.'
      : 'The side lengths do not match the target. Check your moves.';
    if (orient(img) !== orient(tgt)) return `Your image is a mirror image of the target. In yours, A, B, C run ${orient(img)}. In the target they run ${orient(tgt)}. Slides and turns never change that direction, so you need a flip (an odd number of flips).`;
    const d = [tgt[0][0] - img[0][0], tgt[0][1] - img[0][1]];
    if (tgt.every((p, i) => Math.abs(p[0] - img[i][0] - d[0]) < 1e-6 && Math.abs(p[1] - img[i][1] - d[1]) < 1e-6))
      return `Right size and direction, but in the wrong place. Every corner is off by the same amount, so one more slide of (${num(d[0])}, ${num(d[1])}) would fix it.`;
    return 'Right size and the right handedness, but the triangle is turned differently from the target. Compare where the right angle points in yours and in the target.';
  };

  register({
    id: 'rigid-motions-and-congruence', level: 'school',
    title: 'Rigid motions and congruence',
    blurb: 'Slide, flip and turn a triangle on a grid, see why its size never changes, and use the moves to prove two shapes are congruent.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0.4; p.span = 5;
      p.grid(1);
      p.path([[0, -40], [0, 40]], { stroke: pal.violet, width: 2, dash: [6, 5] });
      p.path([[-4, 1], [-1, 1], [-4, 3]], { stroke: alpha(pal.blue, .6), fill: alpha(pal.blue, .12), width: 2.2, close: true });
      p.path([[4, 1], [1, 1], [4, 3]], { stroke: pal.blue, fill: alpha(pal.blue, .3), width: 3, close: true });
      p.path([[-1, -3], [-4, -3], [-1, -1]], { stroke: pal.yellow, width: 2.2, dash: [5, 4], fill: alpha(pal.yellow, .25), close: true });
    },
    hook: String.raw`A floor tile is slid, flipped or turned into place, and it always fits the hole it came from. Which moves are safe, which are not, and how can you tell that two shapes are really the same?`,
    steps: [
      { title: 'Slide: a translation',
        text: String.raw`<p>The faint triangle ABC is the <b>preimage</b>. The solid blue triangle is the <b>image</b>, written A′B′C′.</p><p>A <b>slide</b> (translation) moves every point the same way. Here: 3 right, 2 down. In coordinates, \((x,y)\to(x+3,\,y-2)\), so A(1, 1) lands at A′(4, −1). The sides are still 3, 3.61 and 2.</p>`,
        set: { moves: [mT(3, -2)], cmpOn: false } },
      { title: 'Flip: a reflection',
        text: String.raw`<p>A <b>flip</b> (reflection) swaps the two sides of a mirror line. Over the y-axis, \((x,y)\to(-x,\,y)\), so A(1, 1) lands at A′(−1, 1).</p><p>Slides, flips and turns are <b>rigid motions</b>: they keep every length and angle. Two figures are <b>congruent</b> when some rigid motions map one onto the other. Try a turn in the palette too.</p>`,
        set: { moves: [mF('ya')], cmpOn: false } },
      { title: 'Dilation is not rigid',
        text: String.raw`<p>A <b>dilation</b> stretches the plane from a center point. Here the center is A, with factor 2. A stays put and every other corner moves twice as far away.</p><p>The sides become 6, 7.21 and 4. The angles are the same, so the shape is the same, but the size is not. The image is <b>similar</b>, not congruent.</p>`,
        set: { moves: [mD(2, 1, 1)], cmpOn: false } },
      { title: 'Order matters',
        text: String.raw`<p>Take two moves: flip over the y-axis, and slide 2 right and 4 down.</p><p><b>Predict first.</b> Does flipping then sliding end in the same place as sliding then flipping? Use the two Predict buttons under the palette. Then try both orders with the palette yourself.</p>`,
        set: { moves: [], cmpOn: true } }
    ],
    formal: String.raw`
      <h3>Rigid motions</h3>
      <p>A <em>rigid motion</em> moves a figure without changing the distance between any two of its points. There are three kinds. In coordinates:</p>
      <p>
      <b>Translation</b> by \((a,b)\): \((x,y)\to(x+a,\;y+b)\).<br>
      <b>Reflection</b> over the x-axis: \((x,y)\to(x,-y)\). Over the y-axis: \((x,y)\to(-x,y)\). Over the line \(y=x\): \((x,y)\to(y,x)\).<br>
      <b>Rotation</b> about the origin, counterclockwise: \(90^\circ\): \((x,y)\to(-y,x)\). \(180^\circ\): \((x,y)\to(-x,-y)\). \(270^\circ\): \((x,y)\to(y,-x)\).</p>
      <p>A <em>dilation</em> from the origin by a factor \(k\) is \((x,y)\to(kx,ky)\). It is not rigid unless \(k=1\).</p>
      <h3>Congruence</h3>
      <p>Two figures are <em>congruent</em> if some sequence of rigid motions maps one onto the other. The motions send each corner to a matching corner. So <b>corresponding sides are equal and corresponding angles are equal</b>. You can use this to find a missing side or angle: if \(\triangle ABC\cong\triangle DEF\), then \(DF=AC\) and \(\angle E=\angle B\). Match sides by letters, not by which looks longest.</p>
      <h3>Why a slide keeps lengths</h3>
      <p>Slide two points \(P_1(x_1,y_1)\) and \(P_2(x_2,y_2)\) by \((a,b)\). The horizontal gap is \((x_2+a)-(x_1+a)=x_2-x_1\) and the vertical gap is \((y_2+b)-(y_1+b)=y_2-y_1\). Both gaps are unchanged, so the distance \(\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}\) is unchanged. A reflection keeps lengths because each point and its image are the same distance from the mirror, on opposite sides. A dilation by \(k\) multiplies both gaps by \(k\), so every length is multiplied by \(k\).</p>
      <h3>Order matters</h3>
      <p>Take the point \((1,2)\). Reflect over the y-axis, then slide 4 right: \((1,2)\to(-1,2)\to(3,2)\). Slide 4 right, then reflect over the y-axis: \((1,2)\to(5,2)\to(-5,2)\). Different order, different image. Sometimes the order does not matter: a slide along the mirror line (up or down for the y-axis) can swap with the flip. To describe a sequence, list the moves in the order they are done, each with its center, line or vector.</p>
      <h3>Similar, not congruent</h3>
      <p>If an image has the same angles but every side is \(k\) times as long, the figures are <em>similar</em> with scale factor \(k\). They are congruent only if \(k=1\).</p>`,
    check: [
      { q: 'Triangle P has sides 3, 2 and 3.6 cm and a right angle. Triangle Q has the same three angles, with sides 6, 4 and 7.2 cm. Which statement is true?',
        choices: ['P and Q are congruent, because equal angles give the same shape.',
                  'P and Q are not congruent. Q is P with every side doubled, so P and Q are similar.',
                  'P and Q are congruent, because a turn will map Q onto P.',
                  'P and Q are not congruent, because their angles are different.'], answer: 1,
        why: 'Rigid motions keep lengths. A side of 3 cannot become a side of 6 by sliding, flipping or turning. Doubling every side is a dilation, so Q is similar to P but not congruent to it. The angles are equal, but that only gives the same shape, not the same size.',
        hint: 'Congruent means a rigid motion can match them. Do rigid motions change lengths?' },
      { q: 'Triangle ABC has C at (2, 4). Move 1: reflect over the x-axis. Move 2: slide 3 left and 2 up. Where does C end up?',
        choices: ['(−1, 6)', '(−1, −6)', '(5, −2)', '(−1, −2)'], answer: 3,
        why: 'Move 1 sends (x, y) to (x, −y), so C goes to (2, −4). Move 2 sends (x, y) to (x − 3, y + 2), so (2, −4) goes to (−1, −2). (−1, 6) forgets the flip. (−1, −6) does the slide first, then the flip. (5, −2) slides the wrong way.',
        hint: 'Do the moves in the order given. Flip first, then slide the result.' },
      { q: 'Triangle ABC is congruent to triangle DEF, with A matching D, B matching E and C matching F. AB = 7 cm, BC = 9 cm and CA = 5 cm. A student says: "EF is the shortest side, so EF = 5 cm." Which statement finds the error and gives the right length?',
        choices: ['There is no error. EF = 5 cm.',
                  'Sides are matched by size, so EF = 7 cm.',
                  'Sides are matched by their letters. EF joins E and F, which match B and C, so EF = BC = 9 cm.',
                  'Congruent triangles only have equal angles, so EF cannot be found.'], answer: 2,
        why: 'Corresponding sides join matching corners. E matches B and F matches C, so EF matches BC and EF = 9 cm. The student matched by "shortest" instead of by letters. Congruent triangles have all corresponding sides equal and all corresponding angles equal.',
        hint: 'Which corners of ABC match E and F? Which side of ABC joins them?' }
    ],
    links: { related: ['similarity-and-scaling', 'functions-as-transformations', 'matrices', 'parallel-and-perpendicular-lines', 'angle-relationships-and-parallel-lines', 'angles-in-triangles-and-polygons', 'area-by-decomposition'] },

    mount({ stage, controls: C }) {
      const st = { mode: 'explore', pre: PRE, moves: [], anim: 1, cmp: null, cmpOn: false, tgt: null, names: null, mark: null, hl: false, ring: null,
                   i: 0, tries: 0, done: false, right: 0, finished: 0, kind: 'T' };
      const par = { dx: 3, dy: -2, L: 'ya', a: 90, cx: 0, cy: 0, f: 2 };
      let cancelA = () => {};
      const P = new Plane(stage, { span: 8 });
      const show = (el, on) => { el.style.display = on ? '' : 'none'; };

      /* ---------- drawing ---------- */
      const tri = (p, pts, o) => p.path(pts, { ...o, close: true });
      const vlabels = (p, pts, texts, color, fs, skip) => {
        const c = cen(pts);
        pts.forEach((q, i) => {
          if (skip && skip[i]) return;
          const dx = q[0] - c[0], dy = q[1] - c[1], n = Math.hypot(dx, dy) || 1;
          p.label(texts[i], q[0], q[1], { size: fs, color, dx: dx / n * 17, dy: -dy / n * 17, italic: true });
        });
      };
      P.onDraw = (c, p) => {
        const pal = p.pal, fs = clamp(p.scale * .72, 16, 22), tk = clamp(p.scale * .5, 12, 15);
        p.grid(1); p.ticks(1, { size: tk });
        const stg = stagesOf(st.pre, st.moves, st.anim), n = st.moves.length, last = n ? st.moves[n - 1] : null;
        const bd = p.bounds();
        /* the target */
        if (st.tgt) {
          tri(p, st.tgt, { fill: alpha(pal.yellow, .28), stroke: pal.yellow, width: 2.8, dash: [8, 5] });
          if (st.names) vlabels(p, st.tgt, st.names, pal.text, fs);
          else { const g = cen(st.tgt); p.label('target', g[0], g[1], { size: fs, color: pal.text, italic: false }); }
        }
        /* mirror line, center, rays and slide arrows of the last move */
        if (last && last.k === 'F') {
          const L = LINE[last.L];
          p.path([L.a, L.b], { stroke: pal.violet, width: 2.4, dash: [9, 6] });
          p.label('mirror ' + L.eq.split(' (')[0], L.lp[0], L.lp[1], { size: fs - 1, color: pal.violet, italic: false, dx: L.lp[2], dy: L.lp[3], align: L.lp[4] });
        }
        if (last && (last.k === 'R' || last.k === 'D')) {
          if (last.k === 'D') stg[n - 1].forEach((q, i) => p.path([[last.cx, last.cy], stg[n][i]], { stroke: alpha(pal.violet, .6), width: 1.6, dash: [5, 5] }));
          p.dot(last.cx, last.cy, 6, pal.violet, pal.stage, 2);
          p.label('center', last.cx, last.cy, { size: fs - 2, color: pal.violet, italic: false, dx: 10, dy: 18, align: 'left' });
        }
        if (last && last.k === 'T') stg[n - 1].forEach((q, i) => {
          const e = stg[n][i];
          if (dist(q, e) > .05) p.arrow(q[0], q[1], e[0], e[1], alpha(pal.red, .75), 2.2);
        });
        /* the preimage and earlier stages */
        tri(p, st.pre, { fill: alpha(pal.blue, .08), stroke: alpha(pal.blue, .5), width: 2.2 });
        for (let i = 1; i < n; i++) tri(p, stg[i], { stroke: alpha(pal.blue, .4), width: 1.8, dash: [4, 5] });
        const fin = n ? stg[n] : null, tie = fin ? st.pre.map((q, i) => dist(q, fin[i]) < .3) : null;
        vlabels(p, st.pre, NAMES, pal.muted, fs, tie);
        /* the image */
        if (n) {
          tri(p, stg[n], { fill: alpha(pal.blue, .28), stroke: pal.blue, width: 3.6 });
          vlabels(p, stg[n], NAMES.map((s, i) => (tie[i] ? s + ', ' : '') + s + PR[Math.min(n, 3) - 1]), pal.blue, fs);
          stg[n].forEach(q => p.dot(q[0], q[1], 4.5, pal.blue, pal.stage, 1.5));
        }
        st.pre.forEach(q => p.dot(q[0], q[1], 4, pal.stage, alpha(pal.blue, .8), 2));
        /* comparison of two orders */
        if (st.cmp) {
          const { a, b } = st.cmp;
          tri(p, a, { fill: alpha(pal.blue, .28), stroke: pal.blue, width: 3.4 });
          tri(p, b, { fill: alpha(pal.red, .2), stroke: pal.red, width: 3.4, dash: [8, 5] });
          const ca = cen(a), cb = cen(b);
          p.label('flip, then slide', ca[0], ca[1] - 1.9, { size: fs - 2, color: pal.blue, italic: false });
          p.label('slide, then flip', cb[0], cb[1] + 1.9, { size: fs - 2, color: pal.red, italic: false });
          p.label('A″', a[0][0], a[0][1], { size: fs - 2, color: pal.blue, dx: 14, dy: 16 });
          p.label('A″', b[0][0], b[0][1], { size: fs - 2, color: pal.red, dx: 14, dy: 16 });
        }
        /* practice marks */
        if (st.ring != null && st.ring >= 0) {
          const q = st.pre[st.ring];
          p.dot(q[0], q[1], 13, null, pal.brass, 3);
          p.label(NAMES[st.ring] + ' ' + pt(q), q[0], q[1], { size: fs - 3, color: pal.text, italic: false, dx: 18, dy: 24, align: 'left' });
        }
        if (st.mark) {
          p.dot(st.mark[0], st.mark[1], 8, alpha(pal.red, .25), pal.red, 2.5);
          p.label('your pick', st.mark[0], st.mark[1], { size: fs - 3, color: pal.red, italic: false, dy: -20 });
        }
        if (st.hl && st.tgt) {
          const seg = (U, V, t, o) => { p.path([U, V], { stroke: pal.red, width: 5 }); const m = [(U[0] + V[0]) / 2, (U[1] + V[1]) / 2]; p.label(t, m[0], m[1], { size: fs - 2, color: pal.red, italic: false, ...o }); };
          seg(st.pre[0], st.pre[2], 'AC = 2', { dx: -14, align: 'right' }); seg(st.tgt[0], st.tgt[2], 'DF = 2', { dy: 22 });
        }
        /* legend */
        const ly = bd.y1 - .55, lx = bd.x0 + .3;
        p.label('faint = preimage' + (st.tgt ? ', yellow dashed = target' : ''), lx, ly, { size: fs - 2, color: pal.muted, italic: false, align: 'left' });
        if (n) p.label('solid blue = image', lx, ly, { size: fs - 2, color: pal.blue, italic: false, align: 'left', dy: 20 });
      };

      /* ---------- readout ---------- */
      const ro = C.readout(), host = ro.parentNode;
      const upd = () => {
        const fig = runMoves(st.pre, st.moves), n = st.moves.length;
        let html = '';
        if (!n) html = `<span class="k">Moves</span> none yet. The image would be the preimage.<br><span class="k">Corners</span> ${st.pre.map((q, i) => NAMES[i] + ' ' + pt(q)).join(' · ')}<br><span class="k">Sides</span> ${NAMES.map((s, i) => s + NAMES[(i + 1) % 3] + ' ' + num(sides(st.pre)[i])).join(' · ')}`;
        else {
          const sp = sides(st.pre), si = sides(fig), pr = PR[Math.min(n, 3) - 1], ang = P3 => [0, 1, 2].map(i => r1(angleAt(P3, i)) + '°').join(', ');
          const rigid = sp.every((v, i) => Math.abs(v - si[i]) < 1e-6), ratio = si[0] / sp[0], simi = si.every((v, i) => Math.abs(v / sp[i] - ratio) < 1e-6);
          html = `<span class="k">Moves</span><br>` + st.moves.map((m, i) => `${i + 1}. ${wordsOf(m)}<br>&nbsp;&nbsp;&nbsp;${ruleOf(m)}`).join('<br>') +
            `<br><span class="k">Corners</span><br>` + st.pre.map((q, i) => `${NAMES[i]} ${pt(q)} → ${NAMES[i]}${pr} ${pt(fig[i])}`).join('<br>') +
            `<br><span class="k">Side lengths</span> ` + NAMES.map((s, i) => `${s}${NAMES[(i + 1) % 3]} ${num(sp[i])} → ${num(si[i])}`).join(' · ') +
            `<br><span class="k">Angles at A, B, C</span> ${ang(st.pre)} → ${ang(fig)}` +
            `<br><span class="k">A, B, C go</span> ${orient(st.pre)} → ${orient(fig)}<br>` +
            (rigid ? `${good('Rigid.')} Every length and angle is kept, so the image is congruent to the preimage.`
              : simi ? `${bad('Not rigid.')} Every side is ${num(ratio)} times as long, with the same angles: similar, not congruent.`
              : `${bad('Not rigid.')} The lengths changed.`);
        }
        if (st.mode === 'practice' && st.tgt && PROBS[st.i].kind === 'seq') html += `<br><span class="k">Target corners</span> ${st.tgt.map(pt).join(' · ')}`;
        ro.innerHTML = html;
      };

      /* ---------- palette ---------- */
      const grp = build => {
        const i = host.children.length; build();
        const w = h('div', { style: 'display:flex;flex-direction:column;gap:16px' });
        [...host.children].slice(i).forEach(e => w.append(e)); host.append(w); return w;
      };
      host.removeChild(ro);
      let kS, gT, gF, gR, gD, gC, dxS, dyS, lnS, anS, fS, cxS, cyS, applyB, undoB, resetB;
      const gPal = grp(() => {
        C.title('Move palette');
        kS = C.select({ label: 'Choose a move', value: 'T', options: [
          { value: 'T', label: 'Slide (translation)' }, { value: 'F', label: 'Flip (reflection)' },
          { value: 'R', label: 'Turn (rotation)' }, { value: 'D', label: 'Dilate (stretch)' }],
          onChange: v => { par.kind = v; st.kind = v; updKind(); } });
        gT = grp(() => {
          dxS = C.slider({ label: 'Move right (negative = left)', min: -8, max: 8, step: 1, value: par.dx, format: v => num(v), onInput: v => { par.dx = v; } });
          dyS = C.slider({ label: 'Move up (negative = down)', min: -8, max: 8, step: 1, value: par.dy, format: v => num(v), onInput: v => { par.dy = v; } });
        });
        gF = grp(() => {
          lnS = C.select({ label: 'Mirror line', value: par.L, options: Object.keys(LINE).map(k => ({ value: k, label: LINE[k].eq })), onChange: v => { par.L = v; } });
        });
        gR = grp(() => {
          anS = C.select({ label: 'Turn angle', value: '90', options: [
            { value: '90', label: '90° counterclockwise' }, { value: '180', label: '180° (half turn)' }, { value: '270', label: '270° counterclockwise (= 90° clockwise)' }],
            onChange: v => { par.a = +v; } });
        });
        gD = grp(() => {
          fS = C.slider({ label: 'Dilation factor', min: .5, max: 3, step: .5, value: par.f, format: v => num(v), onInput: v => { par.f = v; } });
        });
        gC = grp(() => {
          cxS = C.slider({ label: 'Center x (turn and dilate)', min: -6, max: 6, step: 1, value: 0, format: v => num(v), onInput: v => { par.cx = v; } });
          cyS = C.slider({ label: 'Center y (turn and dilate)', min: -6, max: 6, step: 1, value: 0, format: v => num(v), onInput: v => { par.cy = v; } });
        });
        [applyB, undoB, resetB] = C.buttons([
          { label: 'Apply move', primary: true, onClick: () => applyMove() },
          { label: 'Undo', onClick: () => { cancelA(); st.moves.pop(); st.anim = 1; refresh(); } },
          { label: 'Reset', onClick: () => { cancelA(); st.moves = []; st.anim = 1; refresh(); } }]);
      });
      host.append(ro);
      const palNote = h('p', { class: 'hint' }, '');
      host.append(palNote);
      const updKind = () => {
        show(gT, st.kind === 'T'); show(gF, st.kind === 'F'); show(gR, st.kind === 'R'); show(gD, st.kind === 'D'); show(gC, st.kind === 'R' || st.kind === 'D');
      };
      const curMove = () => st.kind === 'T' ? mT(par.dx, par.dy) : st.kind === 'F' ? mF(par.L) : st.kind === 'R' ? mR(par.a, par.cx, par.cy) : mD(par.f, par.cx, par.cy);
      const maxMoves = 3;
      const refresh = () => {
        applyB.disabled = st.moves.length >= maxMoves; undoB.disabled = !st.moves.length; resetB.disabled = !st.moves.length;
        palNote.textContent = st.moves.length >= maxMoves ? 'You can stack up to 3 moves. Undo one or Reset to try another.' : 'Each move acts on the figure you see now, so the order you apply them matters.';
        P.draw(); upd();
      };
      const animLast = () => {
        cancelA(); st.anim = 0; P.requestDraw();
        cancelA = tween(900, e => { st.anim = ease(e); P.requestDraw(); }, () => { st.anim = 1; refresh(); });
      };
      const applyMove = () => {
        if (st.moves.length >= maxMoves) return;
        cancelA(); st.anim = 1; st.cmp = null;
        st.moves.push(curMove()); refresh(); animLast();
      };
      const syncPalette = m => {
        if (!m) return;
        st.kind = par.kind = m.k; kS.value = m.k;
        if (m.k === 'T') { par.dx = m.dx; par.dy = m.dy; dxS.set(m.dx); dyS.set(m.dy); }
        if (m.k === 'F') { par.L = m.L; lnS.value = m.L; }
        if (m.k === 'R') { par.a = m.a; anS.value = String(m.a); }
        if (m.k === 'D') { par.f = m.f; fS.set(m.f); }
        if (m.k === 'R' || m.k === 'D') { par.cx = m.cx; par.cy = m.cy; cxS.set(m.cx); cyS.set(m.cy); }
        updKind();
      };
      updKind();

      /* ---------- predict: does the order matter? ---------- */
      const M1 = mF('ya'), M2 = mT(2, -4);
      const gPred = grp(() => {
        C.title('Predict');
        C.hint('Flip over the y-axis, then slide 2 right and 4 down. Compared with sliding first and flipping second, the final triangle is...');
        C.buttons([{ label: 'In the same place', onClick: () => predict(true) }, { label: 'In a different place', onClick: () => predict(false) }]);
      });
      const predFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
      gPred.append(predFb);
      const predict = same => {
        cancelA(); st.moves = []; st.anim = 1;
        const a = runMoves(PRE, [M1, M2]), b = runMoves(PRE, [M2, M1]);
        st.cmp = { a, b };
        predFb.innerHTML = (same ? `${bad('Not quite.')} ` : `${good('Right.')} `) +
          `The two orders give different images. Flip then slide: A(1, 1) → (−1, 1) → ${pt(a[0])}. Slide then flip: A(1, 1) → (3, −3) → ${pt(b[0])}. ` +
          `After the slide to the right, the triangle is farther from the mirror, so the flip throws it farther to the left. Now try the two orders in the palette yourself.`;
        refresh();
      };

      /* ---------- practice ---------- */
      const gPrac = grp(() => {
        C.title('Practice');
        C.hint('Six short problems. Pick an answer and read why.');
      });
      const startB = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { st.right = 0; st.finished = 0; loadProb(0); } }])[0];
      gPrac.append(startB.parentNode);
      const pStatus = h('div', { class: 'ctl readout', 'aria-live': 'off' }), pQ = h('div', { class: 'ctl readout' });
      const fb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
      const choiceB = [0, 1, 2, 3].map(i => {
        const b = C.buttons([{ label: '', onClick: () => pick(i) }])[0];
        b.style.cssText = 'border-radius:12px;text-align:left;justify-content:flex-start;width:100%;height:auto;padding:9px 14px';
        b.parentNode.style.display = 'none'; gPrac.append(b.parentNode); return b;
      });
      const checkB = C.buttons([{ label: 'Check my sequence', primary: true, onClick: () => checkSeq() }])[0];
      const hintB = C.buttons([{ label: 'Hint', onClick: () => { fb.innerHTML = `<span class="k">Hint</span> ${PROBS[st.i].hint}`; } }])[0];
      const nextB = C.buttons([{ label: 'Next problem', primary: true, onClick: () => { if (st.i + 1 < N) loadProb(st.i + 1); else { st.right = 0; st.finished = 0; loadProb(0); } } },
                               { label: 'Back to the lesson', onClick: () => leave() }]);
      const nextBtn = nextB[0];
      [pStatus, pQ, ...choiceB.map(b => b.parentNode), checkB.parentNode, hintB.parentNode, fb, nextBtn.parentNode].forEach(e => { gPrac.append(e); });
      const pracEls = [pStatus, pQ, checkB.parentNode, hintB.parentNode, fb, nextBtn.parentNode];
      pracEls.forEach(e => show(e, false));
      const tally = () => {
        const done = st.i + 1 === N && st.done;
        pStatus.innerHTML = (done ? `<span class="k">Finished.</span> ` : `<span class="k">Problem ${st.i + 1} of ${N}.</span> `) +
          (st.finished ? `Right on the first try: <b>${st.right} of ${st.finished}</b>.` : 'Right on the first try: none answered yet.');
      };
      const leave = () => {
        cancelA(); st.mode = 'explore'; clearPractice(); st.moves = []; st.anim = 1;
        show(gPal, true); show(ro, true); show(gPred, st.cmpOn); updKind(); showPrac(false); refresh();
      };
      const clearPractice = () => { st.tgt = null; st.names = null; st.mark = null; st.hl = false; st.ring = null; st.pre = PRE; st.cmp = null; };
      const showPrac = on => { pracEls.forEach(e => show(e, on)); show(startB.parentNode, !on); if (!on) choiceB.forEach(b => show(b.parentNode, false)); };
      const loadProb = i => {
        cancelA(); st.mode = 'practice'; st.i = i; st.tries = 0; st.done = false; st.cmp = null;
        const pb = PROBS[i]; clearPractice();
        st.tgt = pb.tgt || null; st.names = pb.names || null; st.ring = pb.ring ?? null; st.moves = []; st.anim = 1; st.kind = 'T';
        kS.value = 'T'; syncPalette(mT(par.dx, par.dy));
        show(gPrac, true); showPrac(true); show(gPred, false);
        show(gPal, pb.kind === 'seq'); show(ro, pb.kind === 'seq');
        pQ.innerHTML = `<span class="k">${pb.tag}</span><br>${pb.q}`;
        choiceB.forEach((b, k) => {
          const ch = pb.choices && pb.choices[k];
          show(b.parentNode, !!ch); b.disabled = false;
          if (ch) b.textContent = ch.t;
        });
        show(checkB.parentNode, pb.kind === 'seq'); show(hintB.parentNode, pb.kind === 'seq');
        nextBtn.disabled = true; nextBtn.textContent = i + 1 < N ? 'Next problem' : 'Start again';
        fb.innerHTML = ''; tally(); refresh();
      };
      const finish = firstTry => {
        st.done = true; st.finished++; if (firstTry) st.right++;
        nextBtn.disabled = false; choiceB.forEach(b => { b.disabled = true; });
        if (st.i + 1 === N) nextBtn.textContent = 'Start again';
        tally();
      };
      const pick = k => {
        if (st.done) return;
        const pb = PROBS[st.i], ch = pb.choices[k]; st.tries++; cancelA(); st.mark = null;
        if (ch.moves) { st.moves = ch.moves.map(m => ({ ...m })); refresh(); animLast(); }
        let txt;
        if (ch.ok) {
          st.mark = null; st.hl = !!pb.hl;
          if (pb.show) { st.moves = pb.show.map(m => ({ ...m })); refresh(); animLast(); }
          txt = `${good('Correct.')} ${ch.why}` + (st.tries > 1 ? '' : ' Right on the first try.');
          finish(st.tries === 1);
        } else {
          if (ch.pt) st.mark = ch.pt;
          choiceB[k].disabled = true;
          txt = `${bad('Not quite.')} ${ch.why}`;
          if (ch.moves && st.tgt) txt += ` It puts A, B, C at ${runMoves(st.pre, ch.moves).map(pt).join(', ')}. The target corners are ${st.tgt.map(pt).join(', ')}.`;
          txt += ' Try another answer.';
        }
        fb.innerHTML = txt; P.requestDraw();
      };
      const checkSeq = () => {
        if (st.done) return;
        cancelA(); st.anim = 1;
        if (!st.moves.length) { fb.innerHTML = `${bad('No moves yet.')} Choose a move in the palette and press Apply move first.`; return; }
        st.tries++;
        const img = runMoves(st.pre, st.moves);
        P.draw();
        if (same(img, st.tgt)) {
          const steps = st.moves.map((m, i) => `${i + 1}. ${wordsOf(m)}`).join('; ');
          fb.innerHTML = `${good('Correct.')} Every corner lands on the target. Your steps: ${steps}. ` +
            (st.moves.length === 2 && same(runMoves(st.pre, [st.moves[1], st.moves[0]]), st.tgt) ? 'Here the same two moves in the opposite order also work, which happens only for special choices. In general the order matters. ' : '') +
            `The triangles are congruent, because rigid motions map one onto the other.` + (st.tries === 1 ? ' Right on the first try.' : '');
          finish(st.tries === 1);
        } else {
          fb.innerHTML = `${bad('Not there yet.')} Your moves put A, B, C at ${img.map(pt).join(', ')}, and the target corners are ${st.tgt.map(pt).join(', ')}. ${diagnose(img, st.tgt, st.moves)} Undo or Reset to change your sequence.`;
        }
        P.requestDraw();
      };

      /* ---------- steps ---------- */
      showPrac(false); show(gPred, false);
      const apply = (patch, immediate) => {
        cancelA();
        if (st.mode === 'practice') { st.mode = 'explore'; show(gPal, true); show(ro, true); showPrac(false); }
        clearPractice();
        st.moves = (patch.moves || []).map(m => ({ ...m })); st.cmpOn = !!patch.cmpOn; st.anim = 1;
        predFb.innerHTML = ''; show(gPred, st.cmpOn);
        syncPalette(st.moves.length ? st.moves[st.moves.length - 1] : st.cmpOn ? M1 : null);
        refresh();
        if (st.moves.length && !immediate) animLast();
      };
      refresh();
      return { destroy: () => { cancelA(); P.destroy(); }, apply };
    }
  });
}
