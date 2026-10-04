/* =====================================================================
   SCHOOL — Angles and turns
   ===================================================================== */
{
  const RL = 4.3, PR = 4, D2R = Math.PI / 180;
  const kk = t => `<span class="k">${t}</span>`;
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const fs = p => clamp(p.scale * .45, 14.5, 18);
  const pt = (r, d) => [r * Math.cos(d * D2R), r * Math.sin(d * D2R)];
  /* screen degrees of a ray turned a degrees from the first ray, which lies at f (0 = pointing right, 180 = pointing left) */
  const scr = (f, a) => (f ? f - a : a);
  const arcPts = (d0, d1, r) => {
    const n = Math.max(2, Math.ceil(Math.abs(d1 - d0) / 3)), out = [];
    for (let i = 0; i <= n; i++) out.push(pt(r, lerp(d0, d1, i / n)));
    return out;
  };
  const sector = (p, d0, d1, r, fill) => p.path([[0, 0], ...arcPts(d0, d1, r)], { fill, close: true });
  const arcLine = (p, d0, d1, r, stroke, w) => p.path(arcPts(d0, d1, r), { stroke, width: w });
  const kindOf = a => (a < 90 ? 'acute' : a === 90 ? 'right' : a < 180 ? 'obtuse' : 'straight');
  const KIND_TXT = { acute: 'acute: less than 90°', right: 'right: exactly 90°', obtuse: 'obtuse: more than 90°, less than 180°', straight: 'straight: exactly 180°' };
  const turnWord = a => {
    const w = { 0: 'no turn', 90: 'a quarter turn', 180: 'a half turn', 270: 'three quarter turns', 360: 'a full turn' };
    if (w[a] !== undefined) return w[a];
    const lo = Math.floor(a / 90) * 90;
    return `between ${w[lo]} and ${w[lo + 90]}`;
  };
  /* the angle label, set beside the arc; near the baseline it is lifted so it does not sit on a ray */
  const lab = (p, t, d, r, o = {}) => {
    const [x, y] = pt(r, d), s = Math.sin(d * D2R);
    p.label(t, x, y, Object.assign({ size: fs(p) * 1.15, italic: false, dy: Math.abs(s) < .3 ? (s >= 0 ? -15 : 15) : 0 }, o));
  };
  /* a small text tag, kept inside the canvas */
  const tag = (p, t, x, y, o = {}) => {
    const size = fs(p), wd = t.length * size * .85 * .56, px = p.X(x) + (o.dx || 0), py = p.Y(y) + (o.dy || 0);
    const cx = clamp(px, wd / 2 + 4, p.w - wd / 2 - 4), cy = clamp(py, 12, p.h - 12);
    p.label(t, x, y, Object.assign({ size, italic: false }, o, { dx: (o.dx || 0) + cx - px, dy: (o.dy || 0) + cy - py }));
  };
  const ring = (p, x, y) => p.dot(x, y, 13, p.pal.stage, p.pal.brass, 3.5);
  const sqMark = (p, f, d = .62) => {
    const u = pt(d, f), v = pt(d, scr(f, 90)), w = [u[0] + v[0], u[1] + v[1]];
    p.path([u, w, v], { stroke: p.pal.text, width: 2.2 });
  };

  /* protractor, one scale, 0 on the side s0 (0 = right, 180 = left) */
  const drawProt = (p, s0) => {
    const pal = p.pal, size = clamp(p.scale * .38, 12.5, 15);
    p.path([[-PR, 0], ...arcPts(180, 0, PR), [PR, 0]], { fill: alpha(pal.blue, .07), stroke: pal.muted, width: 1.6, close: true });
    const every = p.scale * PR * 10 * D2R >= 40 ? 10 : 30;
    for (let v = 0; v <= 180; v += 5) {
      const d = s0 === 0 ? v : 180 - v, len = v % 90 === 0 ? .42 : v % 10 === 0 ? .26 : .13;
      p.path([pt(PR, d), pt(PR - len, d)], { stroke: pal.muted, width: v % 10 === 0 ? 1.6 : 1 });
      if (v % every === 0) { const [x, y] = pt(PR - .72, d); p.label(String(v), x, y, { size: size / .85, italic: false, color: pal.muted, dy: v % 180 === 0 ? -13 : 0 }); }
    }
  };

  /* ---------- practice problems (a fixed list) ---------- */
  const PROBS = [
    { name: 'Name the angle', kind: 'choice', pic: { t: 'ang', f: 0, a: 35, label: '?', ref90: true },
      q: 'The picture shows an angle. The dashed line marks a right angle, 90°. The angle is smaller than the dashed line. What kind of angle is it?',
      ch: [['Acute', 'Yes. It is smaller than a right angle, so it is acute. This one is 35°. Every acute angle is less than 90°.'],
           ['Right', 'A right angle reaches exactly to the dashed line. This angle stops well before it.'],
           ['Obtuse', 'An obtuse angle is bigger than the dashed line. This angle is smaller than it.'],
           ['Straight', 'A straight angle is a flat line, 180°. This angle is much smaller.']], ans: 0 },
    { name: 'The dancer', kind: 'choice', pic: { t: 'ang', f: 0, a: 270, label: '?', guide: true },
      q: 'A dancer makes 3 quarter turns. One quarter turn is 90°. How many degrees did the dancer turn?',
      ch: [['90°', '90° is only one quarter turn. The dancer made three of them.'],
           ['180°', '180° is two quarter turns, a half turn. The dancer made three.'],
           ['270°', 'Yes. Three quarter turns: 3 × 90 = 270. It is 90° short of a full turn, 360°.'],
           ['360°', '360° is four quarter turns, a full turn. The dancer stopped one quarter turn early.']], ans: 2 },
    { name: 'Make 120°', kind: 'drag', f: 0, start: 50, target: 120, prot: true, fixed: 0,
      q: 'Turn the green ray so the angle is 120°. Drag the handle or use the buttons and the slider. Then press Check.' },
    { name: 'Split a corner', kind: 'choice', pic: { t: 'split', a: 35, b: 55, la: '35°', lb: '?', lw: '90°' },
      q: 'A square corner is 90°. A line cuts it into two parts. Part A is 35°. How big is part B?',
      ch: [['125°', '125° is 90 + 35. The parts add up to the whole, so the whole is the biggest number. Take 35 away from 90.'],
           ['55°', 'Yes. A + B = 90, so B = 90 − 35 = 55. Check: 35 + 55 = 90.'],
           ['35°', 'That is part A again. The two parts are not equal here. B = 90 − 35.'],
           ['45°', '45° would be half of 90. Part A is only 35°, so part B must be bigger than 45°. B = 90 − 35 = 55.']], ans: 1 },
    { name: 'Which number?', kind: 'choice', pic: { t: 'ang', f: 180, a: 50, label: '?', prot: true, scaleFrom: 0, tip: 'wrong' },
      q: 'The first ray points left, along the baseline of the protractor. The scale starts at 0 on the right. The other ray crosses the scale at 130. What is the angle between the two rays?',
      ch: [['130°', '130° is the number where the ray crosses. But the first ray lies on the 180 mark, not on 0. Count the turn from the first ray.'],
           ['50°', 'Yes. The first ray is on 180 and the other ray is on 130. The turn between them is 180 − 130 = 50°. It is an acute angle.'],
           ['310°', '310° is 180 + 130. The rays are not that far apart. The angle is the gap from 180 down to 130.'],
           ['40°', '40° is 90 − 50, which is a mix-up. Use the two marks, 180 and 130: 180 − 130 = 50.']], ans: 1 },
    { name: 'Pizza slices', kind: 'choice', pic: { t: 'pizza' },
      q: 'A pizza is cut into 8 equal slices from the middle. A full turn is 360°. How big is the pointy tip angle of one slice?',
      ch: [['90°', '90° is a quarter turn. Four slices would fit into a full turn. This pizza has 8 slices, so each one is smaller.'],
           ['8°', 'The 8 is the number of slices, not the angle. Share the full turn: 360 ÷ 8 = 45.'],
           ['30°', '30° would fit 12 times into a full turn. 8 slices: 360 ÷ 8 = 45.'],
           ['45°', 'Yes. The 8 slices share the full turn of 360° equally: 360 ÷ 8 = 45°. Check: 8 × 45 = 360.']], ans: 3 },
    { name: 'Open the rest', kind: 'drag2', a: 80, start: 100, target: 130,
      q: 'Part A is 80° and stays fixed. Turn the red ray so the whole angle is 130°. What must part B be? Then press Check.' }
  ];

  register({
    id: 'angles-and-turns', level: 'school',
    title: 'Angles and turns',
    blurb: 'Turn a ray to see what an angle is, name the four kinds, measure with a protractor and add angles together.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 1.1; p.span = 3.4;
      sector(p, 0, 125, 1.7, alpha(pal.yellow, .32));
      p.path([[0, 0], pt(3.6, 90)], { stroke: pal.violet, width: 2, dash: [6, 5] });
      arcLine(p, 0, 125, 1.7, pal.text, 2.4);
      p.path([[0, 0], pt(3.6, 0)], { stroke: pal.blue, width: 4 });
      p.path([[0, 0], pt(3.6, 125)], { stroke: pal.green, width: 4 });
      p.dot(0, 0, 5, pal.text);
    },
    hook: String.raw`A door opens a little. Then it opens a lot. How can you say exactly how far it opened, so a friend on the phone could open it the same way?`,
    steps: [
      { title: 'An angle is a turn',
        text: String.raw`<p>Think of a door. It turns around its hinge. An <b>angle</b> tells how far it turned. Here the blue ray stays still. The green ray turns around the corner point. It turns the way opposite to clock hands.</p><p>This is a <b>quarter turn</b>. We measure turns in <b>degrees</b>, written °. A quarter turn is 90°. Predict, then try the buttons.</p>`,
        set: { mode: 'turn', a: 90, f: 0 } },
      { title: 'Four kinds of angle',
        text: String.raw`<p>Compare an angle with a <b>right angle</b>. That is the square corner of a book, 90°. The dashed line shows it.</p><p>Smaller than 90° is <b>acute</b>. Between 90° and 180° is <b>obtuse</b>. Exactly 180° is <b>straight</b>, a flat line. The angle now is 60°, so it is acute. Try to make each kind.</p>`,
        set: { mode: 'kinds', a: 60, f: 0 } },
      { title: 'Measure with a protractor',
        text: String.raw`<p>A <b>protractor</b> is a ruler for angles. Put its middle on the corner. Line the blue ray up with 0. Read the number where the green ray crosses it. Now it reads 65°.</p><p>Move the green ray onto the violet dashed target. Then press Check. Read from the 0 on the blue ray's side.</p>`,
        set: { mode: 'measure', a: 65, f: 0 } },
      { title: 'Angles add up',
        text: String.raw`<p>Cut an angle into two parts, A and B. Turn through A first, then through B. The whole turn is A and B together.</p><p>Here A is 40° and B is 50°. Pick a guess for the whole angle. Then use the sliders to change A and B. Does the whole angle always match A + B?</p>`,
        set: { mode: 'add', a: 40, b: 50, f: 0 } }
    ],
    formal: String.raw`
      <h3>An angle is an amount of turn</h3>
      <p>Take two rays that start at the same point. The point is the corner. Keep one ray still and turn the other around the corner. An angle tells <em>how far</em> it turned. It does not tell how long the rays are. Long rays and short rays make the same angle if the turn is the same.</p>
      <h3>Degrees</h3>
      <p>A full turn, all the way back to where you began, is 360 degrees (360°). Half a turn is 180°, because 360 ÷ 2 = 180. A quarter turn is 90°, because 360 ÷ 4 = 90. Three quarter turns are 3 × 90 = 270°. A pizza cut into 8 equal slices has a tip angle of 360 ÷ 8 = 45° in each slice.</p>
      <h3>Four kinds of angle</h3>
      <p>Compare every angle with the right angle, 90°, the square corner of a book.</p>
      <p><b>Acute</b>: less than 90°. <b>Right</b>: exactly 90°. <b>Obtuse</b>: more than 90° and less than 180°. <b>Straight</b>: exactly 180°, so the two rays make a flat line.</p>
      <h3>Measuring with a protractor</h3>
      <p>The protractor has a flat edge and a curved edge with numbers. Put the middle mark on the corner. Put the flat edge along one ray, so that ray sits on the 0. Read the number where the other ray crosses the curved edge. Use the scale that starts at 0 on your first ray. If the first ray lies on the other end, the number you see is not the angle. For example, if the first ray lies on 180 and the other ray crosses 130, the angle is 180 − 130 = 50°.</p>
      <p>Worked example. The green ray crosses between the marks 60 and 70, exactly in the middle. The middle of 60 and 70 is 65. So the angle is 65°. It is less than 90°, so it is acute.</p>
      <h3>Why angles add</h3>
      <p>Turn through part A, and stop. Now turn through part B, starting from where you stopped. Altogether you turned through A and then B, so the whole turn is A + B. That is why the parts of an angle add up to the whole. It also works backward: if the whole is 90° and A is 35°, then B = 90 − 35 = 55°. A short check is to add the parts: 35 + 55 = 90.</p>
      <p>Worked example. A door opens 45°, then 30° more, then 20° more. The whole opening is 45 + 30 + 20 = 95°. That is a little more than 90°, so it is obtuse.</p>`,
    check: [
      { q: 'Two angles turn the same amount. The two rays of angle P are drawn 10 cm long. The two rays of angle Q are drawn 5 cm long. Which statement is true?',
        choices: ['P is bigger, because its rays are longer.', 'Q is bigger, because it is neater.', 'They are the same size, because an angle tells how far the ray turned, not how long the rays are.', 'You cannot compare them without a protractor, even though they turn the same amount.'], answer: 2,
        why: 'An angle is an amount of turn. The length of the rays does not change the turn. You could draw the rays longer or shorter and the angle stays the same.',
        hint: 'Think of a door. Does a longer door open more than a shorter door when both swing the same way?' },
      { q: 'A hinge opens 45°. Then it opens 30° more. Then it opens 20° more. What is the whole angle now, and what kind of angle is it?',
        choices: ['95°, an obtuse angle', '95°, a right angle', '85°, an acute angle', '105°, an obtuse angle'], answer: 0,
        why: 'Add the parts: 45 + 30 = 75, and 75 + 20 = 95. So the whole is 95°. A right angle is exactly 90°. 95° is more than 90° and less than 180°, so it is obtuse.',
        hint: 'Add the three turns one at a time. Then compare the answer with 90°.' },
      { q: 'Sam measures an angle. Step 1: He puts the middle of the protractor on the corner. Step 2: The first ray lies along the baseline on the 180 mark. Step 3: The other ray crosses the scale at the number 130. Step 4: He writes "the angle is 130°". Which statement is true?',
        choices: ['Sam is right. You always read the number where the ray crosses.', 'Step 1 is wrong. The middle should be at the end of a ray, not at the corner.', 'Step 4 is wrong. The angle is 130 + 180 = 310°.', 'Step 4 is wrong. The first ray is on 180, not on 0, so the angle is 180 − 130 = 50°.'], answer: 3,
        why: 'The angle is the turn from the first ray to the other ray. The first ray lies on 180, so the turn is 180 − 130 = 50°. You only read the crossing number directly when the first ray lies on 0. Step 1 is fine, and 310 is too big because the rays are only 50° apart.',
        hint: 'Which mark is the first ray on? Count the turn from that mark to 130.' }
    ],
    links: { related: ['angle-relationships-and-parallel-lines', 'angles-in-triangles-and-polygons', 'radians-the-circles-own-angle-unit', 'rigid-motions-and-congruence', 'area-by-decomposition'] },

    mount({ stage, controls: C }) {
      const st = { mode: 'turn', practice: false, f: 0, a: 90, b: 50, ti: 0, said: '', kfb: '', reveal: false, pa: 50 };
      const TARGETS = [130, 40, 155, 75];
      const locked = { add: true };
      let cancel = () => {};
      const panel = stage.nextElementSibling;
      const P = new Plane(stage, { span: 5.2 });
      const maxA = () => (st.mode === 'turn' ? 360 : 180);

      /* ----- the picture ----- */
      const caption = () => {
        if (st.practice) return `Problem ${prIdx + 1} of ${PROBS.length}: ${PROBS[prIdx].name}`;
        if (st.mode === 'turn') return st.a === 0 ? 'No turn yet: 0°' : `${turnWord(st.a).replace(/^./, c => c.toUpperCase())}: ${st.a}°`;
        if (st.mode === 'kinds') return `${kindOf(st.a).replace(/^./, c => c.toUpperCase())} angle: ${st.a}°`;
        if (st.mode === 'measure') return `The green ray reads ${st.a}°`;
        return st.reveal ? `${st.a}° + ${st.b}° = ${st.a + st.b}°` : `A = ${st.a}° and B = ${st.b}°`;
      };

      const rays = (p, f, a, o = {}) => {
        const pal = p.pal;
        p.path([[0, 0], pt(RL, f)], { stroke: pal.blue, width: 4.2 });
        tag(p, 'start ray', pt(RL, f)[0] + (f ? .1 : -.1), 0, { color: pal.blue, align: f ? 'left' : 'right', dy: 20 });
        if (o.moving !== false) p.path([[0, 0], pt(RL, scr(f, a))], { stroke: pal.green, width: 4.2 });
        p.dot(0, 0, 5.5, pal.text);
      };

      const drawAng = (p, o) => {
        /* o: f, a, label, prot, scaleFrom, ref90, guide, ref label */
        const pal = p.pal, f = o.f, a = o.a, d1 = scr(f, a);
        if (o.prot) drawProt(p, o.scaleFrom === undefined ? f : o.scaleFrom);
        if (o.guide) {
          p.path(arcPts(0, 360, 3), { stroke: pal.muted, width: 1.4, dash: [4, 6] });
          [[0, '360° full turn'], [90, '90° quarter turn'], [180, '180° half turn'], [270, '270° three quarters']].forEach(([d, t]) => {
            const [x, y] = pt(3.55, d); p.path([pt(2.85, d), pt(3.2, d)], { stroke: pal.muted, width: 2 });
            tag(p, t, x, y, { color: pal.muted, dy: d === 0 ? -17 : 0 });
          });
        }
        if (o.ref90) {
          p.path([[0, 0], pt(3.4, scr(f, 90))], { stroke: pal.violet, width: 2.4, dash: [7, 6] });
          tag(p, 'right angle 90°', pt(3.4, scr(f, 90))[0], pt(3.4, scr(f, 90))[1], { color: pal.violet, dy: -16 });
        }
        if (a > 0) sector(p, f, d1, a === 90 ? .95 : 1.7, alpha(pal.yellow, .34));
        rays(p, f, a);
        if (a === 90) sqMark(p, f); else if (a > 0) arcLine(p, f, d1, 1.7, pal.text, 2.4);
        if (a > 0 && o.label !== '') lab(p, o.label === undefined ? `${a}°` : o.label, (f + d1) / 2, a === 90 ? 1.75 : 2.45);
      };

      const drawSplit = (p, a, b, la, lb, lw, f = 0) => {
        const pal = p.pal, d1 = scr(f, a), d2 = scr(f, a + b), R = 2.7;
        sector(p, f, d1, R, alpha(pal.yellow, .36)); sector(p, d1, d2, R, alpha(pal.violet, .3));
        p.path([[0, 0], pt(RL, f)], { stroke: pal.blue, width: 4.2 });
        tag(p, 'start ray', pt(RL, f)[0] - .1, 0, { color: pal.blue, align: 'right', dy: 20 });
        p.path([[0, 0], pt(RL, d1)], { stroke: pal.green, width: 3.4 });
        p.path([[0, 0], pt(RL, d2)], { stroke: pal.red, width: 4.2 });
        arcLine(p, f, d2, R + .35, pal.text, 2.2);
        p.dot(0, 0, 5.5, pal.text);
        const mA = (f + d1) / 2, mB = (d1 + d2) / 2;
        let dyA = 0, dyB = 0;
        const [xa, ya] = pt(1.6, mA), [xb, yb] = pt(1.6, mB);
        if (Math.hypot(p.X(xa) - p.X(xb), p.Y(ya) - p.Y(yb)) < 46) { dyA = 12; dyB = -12; }
        const sz = fs(p) * 1.08;
        p.label('A ' + la, xa, ya, { size: sz, italic: false, dy: dyA, color: pal.text });
        p.label('B ' + lb, xb, yb, { size: sz, italic: false, dy: dyB, color: pal.text });
        if (lw) p.label('whole angle ' + lw, 0, -.95, { size: sz, italic: false, color: pal.text });
      };

      const drawPizza = p => {
        const pal = p.pal, R = 3.3;
        p.path(arcPts(0, 360, R), { fill: alpha(pal.yellow, .22), stroke: pal.blue, width: 3, close: true });
        sector(p, 0, 45, R, alpha(pal.violet, .4));
        for (let i = 0; i < 8; i++) p.path([[0, 0], pt(R, i * 45)], { stroke: pal.blue, width: i === 0 || i === 1 ? 3 : 1.6 });
        p.dot(0, 0, 5.5, pal.text);
        arcLine(p, 0, 45, 1.2, pal.text, 2.4);
        lab(p, '?', 22.5, 1.9);
        tag(p, '8 equal slices', 0, -4.2, { color: pal.muted });
      };

      const drawDrag = (p, pr) => {
        if (pr.kind === 'drag') drawAng(p, { f: 0, a: st.pa, prot: true });
        else drawSplit(p, pr.a, st.pa - pr.a, `${pr.a}°`, prDone2() ? `${st.pa - pr.a}°` : '?', `${st.pa}°`);
      };
      const prDone2 = () => prSolved;

      P.onDraw = (c, p) => {
        const pal = p.pal;
        const pr0 = PROBS[prIdx], tall = st.practice ? (pr0.kind === 'choice' && (pr0.pic.t === 'pizza' || pr0.pic.guide || pr0.pic.a > 180)) : st.mode === 'turn';
        p.span = 5.2; p.cx = 0; p.cy = tall ? 0 : 1.3;
        if (st.practice) {
          const pr = PROBS[prIdx];
          if (pr.kind === 'choice') {
            const o = pr.pic;
            if (o.t === 'ang') {
              const shown = prSolved && o.label === '?' ? Object.assign({}, o, { label: o.a + '°' }) : o;
              drawAng(p, shown);
            } else if (o.t === 'split') drawSplit(p, o.a, o.b, o.la, prSolved ? o.b + '°' : o.lb, o.lw);
            else drawPizza(p);
          } else drawDrag(p, pr);
          if (pr.kind !== 'choice' && !prSolved) {
            if (pr.kind === 'drag') { const q = pt(RL, st.pa); ring(p, q[0], q[1]); }
            else { const q = pt(RL, st.pa); ring(p, q[0], q[1]); }
          }
        } else {
          const m = st.mode, f = st.f;
          if (m === 'turn') drawAng(p, { f, a: st.a, guide: true });
          else if (m === 'kinds') drawAng(p, { f, a: st.a, ref90: true });
          else if (m === 'measure') {
            const t = TARGETS[st.ti], dt = scr(f, t);
            p.path([[0, 0], pt(RL, dt)], { stroke: pal.violet, width: 3, dash: [8, 6] });
            tag(p, 'target', pt(RL + .55, dt)[0], pt(RL + .55, dt)[1], { color: pal.violet });
            drawAng(p, { f, a: st.a, prot: true });
          } else drawSplit(p, st.a, st.b, `${st.a}°`, `${st.b}°`, st.reveal ? `${st.a + st.b}°` : '', f);
          /* handles */
          if (m === 'add') {
            const q = pt(3.3, scr(f, st.a)), w = pt(RL, scr(f, st.a + st.b));
            ring(p, q[0], q[1]); ring(p, w[0], w[1]);
          } else { const q = pt(RL, scr(f, st.a)); ring(p, q[0], q[1]); }
        }
        p.label(caption(), 0, p.cy - 4.78, { size: fs(p) * 1.15, italic: false, color: pal.text });
      };

      /* ----- the side panel ----- */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const S = o => { const s = C.slider(o); const el = panel.lastElementChild; s.inp = el.querySelector('input'); return s; };
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const addTo = (...els) => panel.append(...els);
      const lines = a => a.join('<br>');
      const setA = v => { st.a = clamp(snap(v, 5), st.mode === 'kinds' || st.mode === 'add' ? 5 : 0, maxA()); st.said = ''; st.kfb = ''; };
      const stepper = d => ({ label: d > 0 ? '+5°' : '−5°', onClick: () => { cancel(); setA(st.a + d); sync(); } });

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

      let ro, tS, kS, mS, aS, bS, fbM, fbK, tgl;
      let prIdx = 0, prSolved = false, prFirst = 0, prDone = 0, prTried = false;
      let startBtn, ptally, pq, pch, pap, pfb, pnext, pcheck, pS, pwrap;

      grp('turn', () => {
        predict('Predict first', 'A half turn goes half way round. How many degrees is that?',
          [['90°', '90° is a quarter turn, only 1 of 4 equal parts. Watch the ray: it goes half way round.'],
           ['180°', 'Yes. A full turn is 360°, so half of it is 360 ÷ 2 = 180°. Two half turns make a full turn.'],
           ['360°', '360° is all the way round, a full turn. A half turn is half of that. Watch the ray.']],
          () => { cancel(); cancel = animateTo(st, { a: 180 }, 900, sync); });
        C.title('Turn the ray');
        tS = S({ label: 'Turn (degrees)', min: 0, max: 360, step: 5, value: st.a, format: v => v + '°', onInput: v => { cancel(); setA(v); sync(); } });
        C.buttons([stepper(-5), stepper(5)]);
        C.buttons([{ label: 'Quarter turn', onClick: () => goTo(90) }, { label: 'Half turn', onClick: () => goTo(180) },
          { label: 'Full turn', onClick: () => goTo(360) }, { label: 'Start again', onClick: () => goTo(0) }]);
      });
      grp('kinds', () => {
        predict('Predict first', 'The ray will turn past the dashed 90° line, to 120°. What kind of angle will it be?',
          [['Acute', 'Acute angles are smaller than 90°. 120° is past the dashed line, so it is bigger.'],
           ['Right', 'A right angle stops exactly on the dashed line. This one goes past it.'],
           ['Obtuse', 'Yes. 120° is more than 90° and less than 180°, so it is obtuse.']],
          () => { cancel(); cancel = animateTo(st, { a: 120 }, 800, sync); });
        C.title('Turn the ray');
        kS = S({ label: 'Angle (degrees)', min: 5, max: 180, step: 5, value: st.a, format: v => v + '°', onInput: v => { cancel(); setA(v); sync(); } });
        C.buttons([stepper(-5), stepper(5)]);
        C.title('What is this angle called?');
        C.buttons(['acute', 'right', 'obtuse', 'straight'].map(k => ({ label: k[0].toUpperCase() + k.slice(1), onClick: () => nameIt(k) })));
        fbK = C.readout();
      });
      grp('measure', () => {
        C.title('Read the protractor');
        mS = S({ label: 'Green ray reads', min: 0, max: 180, step: 5, value: st.a, format: v => v + '°', onInput: v => { cancel(); setA(v); sync(); } });
        C.buttons([stepper(-5), stepper(5)]);
        tgl = C.toggle({ label: 'Start the angle on the left side', value: false, onChange: on => { cancel(); st.f = on ? 180 : 0; st.said = ''; sync(); } });
        C.buttons([{ label: 'Check my ray', primary: true, onClick: () => checkMeasure() }, { label: 'New target', onClick: () => { st.ti = (st.ti + 1) % TARGETS.length; st.said = ''; sync(); } }]);
        fbM = C.readout();
      });
      grp('add', () => {
        predict('Predict first', 'Part A is 40° and part B is 50°. How big is the whole angle?',
          [['50°', '50° is only the bigger part. The whole turn goes through both parts, so it is bigger than either one.'],
           ['90°', 'Yes. Turn 40° and then 50° more: 40 + 50 = 90°. The sliders are open now.'],
           ['10°', '10° is 50 − 40, the gap between the parts. The parts go one after the other, so we add them.']],
          () => { locked.add = false; st.reveal = true; });
        C.title('Change the two parts');
        aS = S({ label: 'Part A', min: 5, max: 170, step: 5, value: st.a, format: v => v + '°', onInput: v => { cancel(); st.a = Math.min(v, 180 - st.b); sync(); } });
        bS = S({ label: 'Part B', min: 5, max: 170, step: 5, value: st.b, format: v => v + '°', onInput: v => { cancel(); st.b = Math.min(v, 180 - st.a); sync(); } });
      });
      grp('ro', () => { ro = C.readout(); C.hint('Drag the round handles, or use the sliders and buttons.'); });

      /* practice */
      C.title('Practice');
      C.hint('Seven short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); if (st.practice) { st.practice = false; sync(); } else { st.practice = true; loadProb(); sync(); } } }])[0];
      grp('practice', () => {
        pwrap = h('div', { style: 'display:flex;flex-direction:column;gap:14px' });
        ptally = h('p', { class: 'ctl-title' });
        pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        pch = h('div', { class: 'ctl buttons' });
        pap = h('div', { class: 'ctl buttons' });
        pcheck = mkBtn('Check', () => checkDrag(), true);
        pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pnext = mkBtn('Next problem', () => nextProb(), true);
        const mv = (l, d) => mkBtn(l, () => { if (prSolved) return; setPa(st.pa + d); pfb.innerHTML = ''; sync(); });
        pap.append(mv('−5°', -5), mv('+5°', 5), pcheck);
        pwrap.append(ptally, pq, pch, pap);
        pS = C.slider({ label: 'Your ray', min: 0, max: 180, step: 5, value: st.pa, format: v => v + '°', onInput: v => { if (prSolved) { pS.set(st.pa); return; } setPa(v); pfb.innerHTML = ''; sync(); } });
        const sl = panel.lastElementChild; pS.inp = sl.querySelector('input'); pS.box = sl;
        pwrap.append(sl, pfb, h('div', { class: 'ctl buttons' }, pnext)); addTo(pwrap);
      });
      const setPa = v => { const pr = PROBS[prIdx]; st.pa = clamp(snap(v, 5), pr.kind === 'drag2' ? pr.a + 5 : 0, 180); };

      const tally = () => { ptally.textContent = `Right on the first try: ${prFirst} of ${prDone} done`; };
      const loadProb = () => {
        const pr = PROBS[prIdx]; prSolved = false; prTried = false;
        pq.textContent = pr.q; pfb.innerHTML = ''; pch.replaceChildren(); pnext.disabled = true; pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        const isD = pr.kind !== 'choice';
        pap.style.display = isD ? '' : 'none'; pS.box.style.display = isD ? '' : 'none'; pch.style.display = isD ? 'none' : '';
        if (isD) { st.pa = pr.start; pS.set(st.pa); } else pr.ch.forEach((o, i) => pch.append(mkBtn(o[0], () => pickChoice(i))));
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
      const checkDrag = () => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        const v = st.pa, t = pr.target, diff = t - v;
        if (diff === 0) {
          prSolved = true; if (!prTried) prFirst++; prDone++; pnext.disabled = false;
          pfb.innerHTML = pr.kind === 'drag'
            ? good('Right.') + ` The green ray crosses the 120 mark, counting from the 0 on the blue ray. 120° is more than 90° and less than 180°, so it is an obtuse angle.`
            : good('Right.') + ` The whole is 130° and part A is 80°. Part B is the rest: 130 − 80 = 50°. Check by adding: 80 + 50 = 130.`;
          pS.inp.disabled = true;
        } else {
          prTried = true;
          pfb.innerHTML = bad('Not yet.') + (pr.kind === 'drag'
            ? ` Your ray reads ${v}°, but you need ${t}°. Turn it ${Math.abs(diff)}° ${diff > 0 ? 'more' : 'less'}.`
            : ` The whole angle is now ${v}°, so part B is ${v} − 80 = ${v - 80}°. You need a whole of ${t}°. Turn the red ray ${Math.abs(diff)}° ${diff > 0 ? 'more' : 'less'}.`);
        }
        tally(); sync();
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); sync(); return; }
        pq.textContent = 'All seven problems are done.'; pch.replaceChildren(); pap.style.display = 'none'; pS.box.style.display = 'none'; pnext.disabled = true;
        pfb.innerHTML = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        const again = mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; loadProb(); sync(); }, true);
        pch.style.display = ''; pch.append(again); sync();
      };

      /* ----- feedback in the lesson ----- */
      const goTo = v => { cancel(); st.said = ''; cancel = animateTo(st, { a: v }, 700, sync); };
      const nameIt = k => {
        const real = kindOf(st.a);
        st.kfb = k === real
          ? good('Yes.') + ` ${st.a}° is ${real}. ${{ acute: 'It is smaller than the 90° line.', right: 'It reaches exactly to the 90° line.', obtuse: 'It is past the 90° line but not yet flat.', straight: 'The rays make one flat line.' }[real]}`
          : bad('Not this one.') + ` ${st.a}° is ${real}, not ${k}. ${{ acute: 'It is smaller than 90°.', right: 'It is exactly 90°.', obtuse: 'It is more than 90° and less than 180°.', straight: 'It is exactly 180°.' }[real]}`;
        sync();
      };
      const checkMeasure = () => {
        const t = TARGETS[st.ti], d = t - st.a;
        st.said = d === 0
          ? good('Yes.') + ` The green ray sits on the target. Both read ${t}°, counting from the 0 on the blue ray's side.`
          : bad('Not yet.') + ` Your ray reads ${st.a}°. The target reads ${t}°. Turn the ray ${Math.abs(d)}° ${d > 0 ? 'more' : 'less'}. ${st.f ? 'Remember: the 0 is on the left now.' : ''}`;
        sync();
      };

      /* ----- readout ----- */
      const updRo = () => {
        let t;
        const a = st.a;
        if (st.mode === 'turn') {
          t = lines([`${kk('Turn')} ${a}°, that is ${turnWord(a)}`,
            a > 0 && a % 90 === 0 ? `${a / 90} × 90° = ${a}°` : 'A quarter turn is 90°. Four quarter turns make a full turn.',
            `${kk('Full turn')} 360°, ${kk('half turn')} 180°, ${kk('quarter turn')} 90°`]);
        } else if (st.mode === 'kinds') {
          t = lines([`${kk('Angle')} ${a}°`, `${kk('Kind')} ${KIND_TXT[kindOf(a)]}`, 'Right angle: the square corner of a book.']);
        } else if (st.mode === 'measure') {
          t = lines([`${kk('The green ray reads')} ${a}°`, `Count from the 0 on the blue ray's side, the ${st.f ? 'left' : 'right'} end.`, `${kk('Target')} move the green ray onto the violet dashed ray, then press Check.`]);
        } else {
          t = lines([`${kk('Part A')} ${st.a}°`, `${kk('Part B')} ${st.b}°`,
            st.reveal ? `<b>Whole = ${st.a}° + ${st.b}° = ${st.a + st.b}°</b>` : 'Pick a guess first. Then the sliders open.']);
        }
        ro.innerHTML = t; fbM.innerHTML = st.said || ''; fbK.innerHTML = st.kfb || '';
      };

      const sync = () => {
        const prac = st.practice, m = st.mode;
        vis(G.turn, !prac && m === 'turn'); vis(G.kinds, !prac && m === 'kinds'); vis(G.measure, !prac && m === 'measure'); vis(G.add, !prac && m === 'add');
        vis(G.ro, !prac); if (pwrap) pwrap.style.display = prac ? 'flex' : 'none';
        tS.set(st.a); kS.set(st.a); mS.set(st.a); aS.set(st.a); bS.set(st.b); tgl.checked = st.f === 180;
        [aS, bS].forEach(s => { s.inp.disabled = locked.add; });
        if (prac && pS) pS.set(st.pa);
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        P.draw(); updRo();
      };

      /* ----- dragging ----- */
      const angFrom = (x, y, f) => { let d = Math.atan2(y, x) / D2R; if (f) d = f - d; return ((d % 360) + 360) % 360; };
      const clampAng = (raw, prev, max) => {
        if (max === 360) { if (prev >= 270 && raw < 90) raw = 360; else if (prev <= 90 && raw > 180) raw = 0; }
        else if (raw > 180) raw = raw > 270 ? 0 : 180;
        return clamp(snap(raw, 5), 0, max);
      };
      const handles = () => {
        if (st.practice) { const pr = PROBS[prIdx]; if (pr.kind === 'choice' || prSolved) return []; const q = pt(RL, st.pa); return [{ id: 'P', x: q[0], y: q[1] }]; }
        if (st.mode === 'add') {
          if (locked.add) return [];
          const q = pt(3.3, scr(st.f, st.a)), w = pt(RL, scr(st.f, st.a + st.b));
          return [{ id: 'B', x: w[0], y: w[1] }, { id: 'A', x: q[0], y: q[1] }];
        }
        const q = pt(RL, scr(st.f, st.a)); return [{ id: 'a', x: q[0], y: q[1] }];
      };
      draggable(P, {
        hit: (px, py) => { const q = handles().find(q => near(P, q.x, q.y, px, py, 26)); return q ? q.id : null; },
        move: (id, x, y) => {
          cancel();
          if (id === 'P') { const pr = PROBS[prIdx]; setPa(clampAng(angFrom(x, y, 0), st.pa, 180)); pfb.innerHTML = ''; sync(); return; }
          if (id === 'a') setA(clampAng(angFrom(x, y, st.f), st.a, maxA()));
          else if (id === 'A') { const v = clampAng(angFrom(x, y, st.f), st.a, 180); st.a = clamp(v, 5, 180 - st.b); }
          else if (id === 'B') { const v = clampAng(angFrom(x, y, st.f), st.a + st.b, 180); st.b = clamp(v - st.a, 5, 180 - st.a); }
          sync();
        }
      });

      const FLAGS = ['mode', 'f'];
      const apply = (patch, immediate) => {
        cancel();
        const nums = {};
        for (const k in patch) { if (FLAGS.includes(k)) st[k] = patch[k]; else nums[k] = patch[k]; }
        st.practice = false; st.said = ''; st.kfb = '';
        if (st.mode !== 'turn') st.a = Math.min(st.a, st.mode === 'add' ? 170 : 180);
        if (st.mode !== 'add') st.a = clamp(st.a, st.mode === 'kinds' ? 5 : 0, maxA());
        if (immediate) { Object.assign(st, nums); sync(); } else { sync(); cancel = animateTo(st, nums, 800, sync); }
      };
      sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
