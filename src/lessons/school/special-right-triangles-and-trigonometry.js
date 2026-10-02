/* =====================================================================
   SCHOOL / GEOMETRY — Special right triangles and trigonometry
   ===================================================================== */
{
  const R2 = Math.SQRT2, R3 = Math.sqrt(3), D2R = Math.PI / 180;
  const co = k => Math.abs(k - 1) < 1e-9 ? '' : num(k);          /* coefficient, leaving out a plain 1 */
  const SPEC = { 30: ['1/2', '√3/2', '√3/3'], 45: ['√2/2', '√2/2', '1'], 60: ['√3/2', '1/2', '√3'] };
  const MODES = [['sq', '45-45-90 triangle'], ['eq', '30-60-90 triangle'], ['trig', 'Sine, cosine, tangent'],
    ['apply', 'Real situations'], ['conv', 'Is it a right triangle?'], ['prac', 'Practice problems']];
  const TRIPLES = [[3, 4, 5], [5, 12, 13], [4, 5, 6], [6, 7, 10], [8, 9, 12], [7, 24, 25]];
  const SZ = [
    { m: 'sq', g: 'leg', label: 'Leg length', min: 1, max: 8 }, { m: 'sq', g: 'hyp', label: 'Hypotenuse length', min: 1, max: 10 },
    { m: 'eq', g: 'short', label: 'Short leg', min: 1, max: 6 }, { m: 'eq', g: 'hyp', label: 'Hypotenuse length', min: 2, max: 12 },
    { m: 'eq', g: 'long', label: 'Long leg', min: 1, max: 10 }
  ];
  const HINTS = {
    sq: 'Drag the top corner, or use the sliders. Choose what you know with the menu.',
    eq: 'Drag the top corner, or use the sliders. Choose what you know with the menu.',
    trig: 'Drag corner B, or use the sliders and buttons.',
    apply: 'Set the numbers with the sliders, then choose a ratio.',
    conv: 'Predict first, then read the numbers.',
    prac: 'Answer in the Practice panel below. The picture shows the problem.'
  };

  /* ---------- drawing helpers ---------- */
  const box = (p, x0, y0, x1, y1, mx, mt, mb) => {
    mx = mx ?? clamp(p.w * .13, 44, 92); mt = mt ?? 44; mb = mb ?? 56;
    const sc = Math.max(1e-3, Math.min((p.w - 2 * mx) / (x1 - x0), (p.h - mt - mb) / (y1 - y0)));
    p.span = Math.min(p.w, p.h) / (2 * sc);
    p.cx = (x0 + x1) / 2; p.cy = (y0 + y1) / 2 + (mt - mb) / (2 * sc);
  };
  const fsz = p => clamp(Math.min(p.w, p.h) * .03, 15, 20);
  const rmark = (p, vx, vy, ux, uy, wx, wy) => {
    const r = 14 / p.scale;
    p.path([[vx + ux * r, vy + uy * r], [vx + (ux + wx) * r, vy + (uy + wy) * r], [vx + wx * r, vy + wy * r]], { stroke: p.pal.text, width: 2 });
  };
  const arc = (p, vx, vy, rpx, a0, a1, col, w = 3.5) => {
    const c = p.ctx; c.beginPath(); c.arc(p.X(vx), p.Y(vy), rpx, -a0, -a1, true);
    c.strokeStyle = col; c.lineWidth = w; c.setLineDash([]); c.lineCap = 'round'; c.stroke();
  };
  const angLab = (p, text, vx, vy, a0, a1, rpx, col, size, italic = false) => {
    const m = (a0 + a1) / 2;
    p.label(text, vx, vy, { dx: Math.cos(m) * rpx, dy: -Math.sin(m) * rpx, color: col, size, italic });
  };
  const edgeLabel = (p, A, B, cen, lines, col, off, size) => {
    if (!Array.isArray(lines)) lines = [lines];
    const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
    let nx = -(B[1] - A[1]), ny = B[0] - A[0]; const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
    if (nx * (mx - cen[0]) + ny * (my - cen[1]) < 0) { nx = -nx; ny = -ny; }
    const lh = size * 1, n = lines.length, hw = Math.max(...lines.map(t => String(t).length)) * size * .24, o = off + Math.abs(ny) * (n - 1) * lh / 2 + Math.abs(nx) * hw;
    lines.forEach((t, i) => p.label(t, mx, my, { size, italic: false, color: col, dx: nx * o, dy: -ny * o + (i - (n - 1) / 2) * lh }));
  };
  const caption = (p, text) => {
    const c = p.ctx; c.font = '500 14px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle';
    c.fillStyle = p.pal.muted; text.split(': ').forEach((t, i, a) => c.fillText(i < a.length - 1 ? t + ':' : t, 14, 22 + i * 18));
  };
  const handle = (p, x, y) => p.dot(x, y, 9, p.pal.stage, p.pal.brass, 3.5);
  const gridUnits = p => { let gs = 1; while (p.scale * gs < 24) gs *= 2; p.grid(gs, { axes: false }); };

  /* ---------- scenes for "Real situations" ---------- */
  const SCN = {
    tree: { name: 'Height of a tree', l1: 'Distance from the tree (ft)', r1: [10, 50, 5], d1: 30, l2: 'Angle of elevation', r2: [10, 70, 5], d2: 35,
      ok: 'tan', unk: 'the height of the tree', cap: 'Angle of elevation: measured up from level ground',
      val: (a, b) => a * Math.tan(b * D2R),
      known: (a, b) => `angle of elevation ${b}°, distance ${a} ft`,
      set: (a, b) => `tan ${b}° = height ÷ ${a}`,
      solve: (a, b, v) => `height = ${a} × tan ${b}° ≈ ${a} × ${+Math.tan(b * D2R).toFixed(4)} ≈ ${num(v)} ft`,
      why: {
        tan: 'The height is opposite the angle and the ground distance is adjacent. Tangent links opposite and adjacent, and no hypotenuse is needed.',
        sin: 'Sine uses the hypotenuse, the slanted line of sight. Nobody measured it, so sine cannot start this problem.',
        cos: 'Cosine uses the hypotenuse too, and the height is not part of cosine. The side you want is opposite the angle.' } },
    cliff: { name: 'Angle of depression from a cliff', l1: 'Cliff height (ft)', r1: [20, 100, 10], d1: 60, l2: 'Angle of depression', r2: [10, 70, 5], d2: 25,
      ok: 'tan', unk: 'how far the boat is from the cliff', cap: 'Angle of depression: measured down from the horizontal',
      val: (a, b) => a / Math.tan(b * D2R),
      known: (a, b) => `angle of depression ${b}°, cliff ${a} ft`,
      set: (a, b) => `tan ${b}° = ${a} ÷ distance`,
      solve: (a, b, v) => `distance = ${a} ÷ tan ${b}° ≈ ${a} ÷ ${+Math.tan(b * D2R).toFixed(4)} ≈ ${num(v)} ft`,
      why: {
        tan: 'The depression angle equals the angle at the boat (alternate angles between the horizontal and the water). The cliff is opposite that angle and the distance is adjacent: tangent.',
        sin: 'Sine needs the hypotenuse, the line of sight. It is not given, and the distance you want is not opposite the angle at the boat.',
        cos: 'Cosine needs the hypotenuse. You know the opposite side (the cliff) and want the adjacent side, so use the ratio that has both.' } },
    ladder: { name: 'A ladder on a wall', l1: 'Ladder length (ft)', r1: [10, 30, 5], d1: 20, l2: 'Angle with the ground', r2: [55, 80, 5], d2: 70,
      ok: 'cos', unk: 'how far the foot is from the wall', cap: 'A ladder leans on a wall',
      val: (a, b) => a * Math.cos(b * D2R),
      known: (a, b) => `ladder ${a} ft, angle with the ground ${b}°`,
      set: (a, b) => `cos ${b}° = distance ÷ ${a}`,
      solve: (a, b, v) => `distance = ${a} × cos ${b}° ≈ ${a} × ${+Math.cos(b * D2R).toFixed(4)} ≈ ${num(v)} ft`,
      why: {
        cos: 'The distance from the wall touches the angle at the foot, so it is adjacent. The ladder is the hypotenuse. Adjacent over hypotenuse is cosine.',
        sin: 'Sine is opposite over hypotenuse. That would find how high the ladder reaches, not how far the foot is from the wall.',
        tan: 'Tangent needs the height on the wall. You only know the ladder length, so tangent has nothing to start from.' } },
    isos: { name: 'Isosceles triangle cut in two', l1: 'Base length', r1: [6, 20, 2], d1: 12, l2: 'Base angle', r2: [40, 75, 5], d2: 60,
      ok: 'tan', unk: 'the height', cap: 'Cut an isosceles triangle into two right triangles',
      val: (a, b) => a / 2 * Math.tan(b * D2R),
      known: (a, b) => `base ${a}, base angles ${b}°`,
      set: (a, b) => `tan ${b}° = height ÷ ${a / 2}   (half of the base)`,
      solve: (a, b, v) => `height = ${a / 2} × tan ${b}° ≈ ${num(v)}, so area = ½ × ${a} × ${num(v)} ≈ ${num(a * v / 2)}`,
      why: {
        tan: 'The height cuts the base in half. In each right triangle the height is opposite the base angle and half the base is adjacent. Tangent links them.',
        sin: 'Sine needs the slanted side, which you do not know here.',
        cos: 'Cosine needs the slanted side too. You know the half base (adjacent) and want the height (opposite).' } }
  };

  /* ---------- practice problems ---------- */
  const PR = [
    { fig: { al: 45, ac: '6 cm', bc: '6 cm', ab: '?', A: '45°', B: '45°' },
      q: 'A square tile is 6 cm on each side. It is cut along a diagonal into two triangles. How long is the cut?',
      ch: [['6 cm', 'A diagonal is the hypotenuse, the longest side of the right triangle. It must be longer than a side.'],
        ['6√2 ≈ 8.49 cm', 'Yes. Both legs are 6 and the angles are 45°, so hypotenuse = leg × √2 = 6√2 ≈ 8.49 cm. Check: 6² + 6² = 72 and 8.49² is about 72.', 1],
        ['12 cm', 'That is two sides added. The diagonal is a shortcut across the corner, so it is shorter than 12. Pythagoras gives √(36 + 36) = √72.'],
        ['6 ÷ √2 ≈ 4.24 cm', 'You divided. Divide by √2 only when you start from the hypotenuse. From a leg, multiply by √2.']] },
    { fig: { al: 45, ab: '10 cm', ac: '?', bc: '?', A: '45°', B: '45°' },
      q: 'A 45-45-90 triangle has hypotenuse 10 cm. How long is each leg?',
      ch: [['10√2 ≈ 14.14 cm', 'That multiplies by √2, which goes from a leg up to the hypotenuse. Here you go the other way, so divide.'],
        ['5 cm', 'Half the hypotenuse belongs to the 30-60-90 triangle. Here both legs are equal, and 5² + 5² = 50, not 100.'],
        ['5√2 ≈ 7.07 cm', 'Yes. leg = 10 ÷ √2. Multiply top and bottom by √2: 10√2 ÷ 2 = 5√2 ≈ 7.07. Check: 7.07² + 7.07² is about 100.', 1],
        ['10 cm', 'A leg is shorter than the hypotenuse. If both legs were 10, the hypotenuse would be 10√2.']] },
    { fig: { al: 30, ab: '14 cm', ac: '?', bc: '', A: '30°', B: '60°' },
      q: 'A 30-60-90 triangle has hypotenuse 14 cm. How long is the leg that touches the 30° angle?',
      ch: [['7 cm', 'That is the short leg, across from the 30° angle (half the hypotenuse). The leg that touches 30° is the long leg.'],
        ['14√3 ≈ 24.25 cm', 'That multiplies the hypotenuse by √3, which is longer than the hypotenuse itself. The √3 factor goes with the short leg: 7 × √3.'],
        ['14 ÷ √3 ≈ 8.08 cm', 'Dividing by √3 would go from the long leg down to the short leg. Here you go from the short leg (7) up to the long leg: 7 × √3.'],
        ['7√3 ≈ 12.12 cm', 'Yes. The short leg is half of 14, which is 7. The long leg is the short leg times √3: 7√3 ≈ 12.12 cm.', 1]] },
    { fig: { al: 12, ab: 'ramp 5 m', ac: '', bc: 'rise = ?', A: '12°', B: '' },
      q: 'A ramp is 5 m long and makes a 12° angle with level ground. How high does it rise? Pick the setup and the answer.',
      ch: [['sin 12° = rise ÷ 5, so rise ≈ 1.04 m', 'Yes. The rise is across from the 12° angle and the ramp is the hypotenuse. Opposite ÷ hypotenuse is sine: rise = 5 × sin 12° ≈ 5 × 0.2079 ≈ 1.04 m.', 1],
        ['cos 12° = rise ÷ 5, so rise ≈ 4.89 m', 'Cosine is adjacent ÷ hypotenuse. The rise is not next to the 12° angle, it is across from it. 4.89 m is how far the ramp reaches along the ground.'],
        ['tan 12° = rise ÷ 5, so rise ≈ 1.06 m', 'Tangent compares opposite with adjacent. The 5 m is the slanted ramp, the hypotenuse, not the adjacent side.'],
        ['sin 12° = 5 ÷ rise, so rise ≈ 24.05 m', 'The ratio is upside down. Sine is opposite ÷ hypotenuse, so the rise goes on top. A 5 m ramp cannot rise 24 m.']] },
    { fig: { al: 52, ac: '40 ft', bc: 'height = ?', ab: '', A: '52°', B: '' },
      q: 'You stand 40 ft from the base of a tree. The angle of elevation to the top is 52°. Ignore the height of your eyes. How tall is the tree? Pick the setup and the answer.',
      ch: [['sin 52° = height ÷ 40, so height ≈ 31.52 ft', 'Sine needs the hypotenuse. The 40 ft is the ground distance, which is adjacent to the angle, not the hypotenuse.'],
        ['tan 52° = height ÷ 40, so height ≈ 51.20 ft', 'Yes. The height is opposite the angle and the ground distance is adjacent: tangent. height = 40 × tan 52° ≈ 40 × 1.2799 ≈ 51.20 ft.', 1],
        ['cos 52° = height ÷ 40, so height ≈ 24.63 ft', 'Cosine uses the adjacent side and the hypotenuse. The height is the opposite side, so cosine does not involve it.'],
        ['tan 52° = 40 ÷ height, so height ≈ 31.25 ft', 'The ratio is upside down: tangent is opposite ÷ adjacent, so the height goes on top. Also, 52° is steeper than 45°, so the tree must be taller than 40 ft.']] },
    { fig: { al: 14, ac: 'run 12 ft', bc: 'rise 3 ft', ab: '', A: 'θ = ?', B: '' },
      q: 'A ramp rises 3 ft over a horizontal run of 12 ft. What angle does it make with the ground? Pick the inverse ratio and the answer.',
      ch: [['sin⁻¹(3 ÷ 12) ≈ 14.48°', 'Sine needs the slanted length (hypotenuse). The 12 ft is the horizontal run, not the slanted side.'],
        ['tan⁻¹(12 ÷ 3) ≈ 75.96°', 'The ratio is upside down. That is the other acute angle, the one at the top of the ramp. Rise ÷ run puts the rise on top.'],
        ['tan⁻¹(3 ÷ 12) ≈ 14.04°', 'Yes. Rise is opposite and run is adjacent, so tan θ = 3 ÷ 12 = 0.25. The inverse key answers: which angle has tangent 0.25? About 14.04°.', 1],
        ['cos⁻¹(3 ÷ 12) ≈ 75.52°', 'Cosine is adjacent ÷ hypotenuse. The 12 is adjacent, but 3 is not the hypotenuse.']] },
    { sides: [9, 12, 16],
      q: 'A triangle has sides 9, 12 and 16. Is it a right triangle?',
      ch: [['Yes: 9, 12, 16 is close to the 3-4-5 pattern', 'Close is not enough. The test must hold exactly, and here 9² + 12² = 225 but 16² = 256.'],
        ['No: 9² + 12² = 225, but 16² = 256', 'Yes. The converse says the angle is right only if a² + b² = c² exactly. Here 225 is less than 256, so the largest angle is more than 90° (about 98°).', 1],
        ['Yes: 9 + 12 is bigger than 16', 'That only shows a triangle with these sides can be built. It says nothing about a right angle.'],
        ['Not enough information', 'Three side lengths are enough: they fix the triangle, so the converse can decide.']] },
    { iso: [10, 13],
      q: 'An isosceles triangle has two equal sides of 13 cm and a base of 10 cm. What is its area?',
      ch: [['60 cm²', 'Yes. Cut along the height to get two right triangles with hypotenuse 13 and a leg of 5. Height = √(13² − 5²) = √144 = 12. Area = ½ × 10 × 12 = 60 cm².', 1],
        ['65 cm²', 'That uses the slanted side 13 as the height. The height is the straight segment that meets the base at a right angle.'],
        ['120 cm²', 'You forgot the ½. The area of a triangle is half of base × height.'],
        ['30 cm²', 'That is only one of the two right triangles (½ × 5 × 12). The whole triangle has two of them.']] }
  ];

  register({
    id: 'special-right-triangles-and-trigonometry', level: 'school',
    title: 'Special right triangles and trigonometry',
    blurb: 'Cut a square and an equilateral triangle in half, then use sine, cosine and tangent to measure heights you cannot reach.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = .85; p.span = 1.45;
      const T = R3;
      p.path([[-1, 0], [1, 0], [0, T]], { fill: alpha(pal.yellow, .12), stroke: alpha(pal.text, .35), width: 1.4, close: true });
      p.path([[0, 0], [1, 0], [0, T]], { fill: alpha(pal.yellow, .3), close: true });
      p.path([[0, 0], [1, 0]], { stroke: pal.green, width: 3 });
      p.path([[0, 0], [0, T]], { stroke: pal.red, width: 3 });
      p.path([[1, 0], [0, T]], { stroke: pal.blue, width: 3 });
      p.path([[.16, 0], [.16, .16], [0, .16]], { stroke: pal.text, width: 1.5 });
      p.label('1', .5, -.2, { size: 17, italic: false, color: pal.green });
      p.label('√3', -.1, T / 2, { size: 17, italic: false, color: pal.red, align: 'right' });
      p.label('2', .66, T / 2 + .1, { size: 17, italic: false, color: pal.blue, align: 'left' });
    },
    hook: String.raw`A tree is too tall to climb or to measure with a tape. Why do one distance on the ground and one angle tell you its height?`,
    steps: [
      { title: 'Cut a square in half',
        text: String.raw`<p>A square of side \(1\) is cut along its diagonal. Each half is a right triangle with two equal legs, so its other two angles are both \(45^\circ\).</p><p>Drag <b>Cut</b>, predict the diagonal, then check. Move <b>Leg length</b>: the triangle scales, but the hypotenuse is always \(\sqrt2\) times a leg.</p>`,
        set: { mode: 'sq', given: 'leg', q: 1, rev: false, size: 1, cut: 0 } },
      { title: 'Cut an equilateral triangle',
        text: String.raw`<p>An equilateral triangle with sides \(2\) is cut down the middle. Each half has angles \(30^\circ\), \(60^\circ\) and \(90^\circ\). The cut halves the base, so the hypotenuse is twice the short leg.</p><p>Predict the long leg, then use <b>Cut</b> and <b>Short leg</b>. The long leg is always \(\sqrt3\) times the short leg.</p>`,
        set: { mode: 'eq', given: 'short', q: 1, rev: false, size: 1, cut: 0 } },
      { title: 'Sine, cosine, tangent',
        text: String.raw`<p>Pick an angle \(\theta\). The side across from it is the <b>opposite</b>, the side touching it is the <b>adjacent</b>, and the slanted side is the <b>hypotenuse</b>. Sine, cosine and tangent are ratios of these (SOH CAH TOA).</p><p>Predict the opposite side, then press <b>θ is the angle at B</b>. The labels swap.</p>`,
        set: { mode: 'trig', at: 'A', q: 1, rev: false, al: 30, hyp: 10 } },
      { title: 'Solve a real problem',
        text: String.raw`<p>You stand 30 ft from a tree and look up at \(35^\circ\). Choose the ratio that links the angle, the side you know and the side you want. Then read off the height.</p><p>Try the other scenes. Then open <b>Is it a right triangle?</b> to test side lengths with the converse of Pythagoras.</p>`,
        set: { mode: 'apply', scene: 'tree', q: 0, rev: false, p1: 30, p2: 35 } }
    ],
    formal: String.raw`
      <p>Two triangles show up so often that their side ratios are worth knowing by heart. Trigonometry extends the same idea to every right triangle.</p>
      <h3>The 45°-45°-90° triangle</h3>
      <p><b>Why the legs are equal.</b> The two acute angles of a right triangle add to \(90^\circ\). If they are both \(45^\circ\), the triangle is isosceles: equal angles sit opposite equal sides. A square cut along a diagonal gives exactly this triangle.</p>
      <p><b>The hypotenuse.</b> With both legs \(a\), the Pythagorean theorem gives
      \[ c^2 = a^2 + a^2 = 2a^2, \qquad c = a\sqrt2. \]
      The sides are in the ratio \(1 : 1 : \sqrt2\), however large the triangle is.</p>
      <p><b>Going backwards.</b> From the hypotenuse, \(a = c/\sqrt2\). To take the root out of the bottom, multiply top and bottom by \(\sqrt2\), because \(\sqrt2\cdot\sqrt2 = 2\):
      \[ \frac{c}{\sqrt2} = \frac{c\sqrt2}{\sqrt2\cdot\sqrt2} = \frac{c\sqrt2}{2}. \]
      For \(c = 10\) the legs are \(5\sqrt2 \approx 7.07\).</p>
      <h3>The 30°-60°-90° triangle</h3>
      <p><b>Why the hypotenuse is twice the short leg.</b> Start with an equilateral triangle of side \(2s\). Draw the height from the top corner. It is a shared side of two right triangles that also have equal hypotenuses (two sides of the equilateral triangle), so the two triangles are congruent. Therefore the height meets the base at its middle, and splits the \(60^\circ\) top angle into two \(30^\circ\) angles. Each half has hypotenuse \(2s\) and short leg \(s\).</p>
      <p><b>The long leg.</b> If the long leg is \(b\), then \(s^2 + b^2 = (2s)^2\), so \(b^2 = 3s^2\) and \(b = s\sqrt3\). The sides are in the ratio \(1 : \sqrt3 : 2\), and the short leg is across from the \(30^\circ\) angle.</p>
      <h3>Sine, cosine and tangent</h3>
      <p>Pick one acute angle \(\theta\) in a right triangle. Its <em>opposite</em> side is across from it, its <em>adjacent</em> side touches it (and is not the hypotenuse). Then
      \[ \sin\theta = \frac{\text{opposite}}{\text{hypotenuse}}, \quad \cos\theta = \frac{\text{adjacent}}{\text{hypotenuse}}, \quad \tan\theta = \frac{\text{opposite}}{\text{adjacent}}. \]
      <b>Why these depend only on the angle.</b> Two right triangles with the same acute angle have all three angles equal, so they are similar, and similar triangles have equal ratios of sides. Making the triangle bigger changes the sides but not the ratios.</p>
      <p>The other acute angle swaps the roles of opposite and adjacent, so \(\sin\theta = \cos(90^\circ - \theta)\). From the special triangles:
      \[ \sin 30^\circ = \tfrac12, \quad \cos 60^\circ = \tfrac12, \quad \tan 45^\circ = 1, \quad \sin 45^\circ = \cos 45^\circ = \tfrac{\sqrt2}{2}, \quad \tan 60^\circ = \sqrt3. \]</p>
      <h3>Finding an angle</h3>
      <p>The inverse key answers the question "which angle has this ratio?". If \(\tan\theta = 0.25\), then \(\theta = \tan^{-1}(0.25) \approx 14.04^\circ\). The symbol \(\tan^{-1}\) means the inverse, not \(1/\tan\). Check that the calculator is in degree mode.</p>
      <h3>Solving real situations</h3>
      <p><b>Plan.</b> Draw the right triangle. Mark the angle, then label the sides opposite, adjacent and hypotenuse for that angle. Choose the ratio that contains the side you know and the side you want. Write the equation, solve, and check that the answer is sensible (the hypotenuse is the longest side).</p>
      <p>An angle of elevation is measured up from the horizontal, and an angle of depression is measured down from it. The horizontal lines are parallel, so the depression angle at the top equals the elevation angle at the bottom (alternate angles).</p>
      <p><b>Example.</b> From 30 ft away the top of a tree is at \(35^\circ\) elevation. Then \(\tan 35^\circ = h/30\), so \(h = 30\tan 35^\circ \approx 21.0\) ft (measured from eye level).</p>
      <p><b>Decomposing a polygon.</b> An isosceles triangle with sides \(13, 13\) and base \(10\) is cut by its height into two right triangles with hypotenuse \(13\) and a leg of \(5\). The height is \(\sqrt{13^2 - 5^2} = 12\), so the area is \(\tfrac12\cdot 10\cdot 12 = 60\). A kite works the same way: its diagonals cross at right angles and cut it into right triangles.</p>
      <h3>The converse of the Pythagorean theorem</h3>
      <p>If the side lengths satisfy \(a^2 + b^2 = c^2\), the triangle has a right angle opposite \(c\). <b>Why.</b> Build a right triangle with legs \(a\) and \(b\). Its hypotenuse is \(\sqrt{a^2+b^2} = c\), so it has the same three sides as the given triangle. Triangles with three equal sides are congruent, so the given triangle has the same right angle.</p>
      <p>If \(a^2 + b^2\) is greater than \(c^2\), the largest angle is less than \(90^\circ\) (acute). If it is less than \(c^2\), the largest angle is more than \(90^\circ\) (obtuse). For \(8, 15, 17\): \(64 + 225 = 289 = 17^2\), so it is a right triangle. For \(9, 12, 16\): \(81 + 144 = 225\) is less than \(256\), so it is not.</p>`,
    check: [
      { q: String.raw`A right triangle has legs \(6\) and \(8\) and hypotenuse \(10\). Angle \(P\) is the acute angle across from the leg of length \(6\). Angle \(Q\) is the other acute angle. Which ratio equals \(\dfrac{8}{10}\)?`,
        choices: [String.raw`\(\sin P\)`, String.raw`\(\cos P\)`, String.raw`\(\tan P\)`, String.raw`\(\tan Q\)`], answer: 1,
        why: String.raw`The leg of length \(8\) touches angle \(P\), so it is adjacent to \(P\). Adjacent over hypotenuse is \(\cos P = 8/10\). Also \(\sin P = 6/10\), \(\tan P = 6/8\) and \(\tan Q = 8/6\).`,
        hint: 'Decide which leg touches angle P and which leg is across from it.' },
      { q: String.raw`You stand \(50\) ft from a flagpole and measure an angle of elevation of \(40^\circ\) to its top. Your eyes are \(5\) ft above the ground. Use \(\tan 40^\circ \approx 0.84\). How tall is the flagpole?`,
        choices: ['64.5 ft', '42 ft', '59.5 ft', '47 ft'], answer: 3,
        why: String.raw`The height above your eyes is opposite the angle and \(50\) is adjacent, so it is \(50 \times 0.84 = 42\) ft. The angle is measured from your eyes, so add \(5\) ft: \(47\) ft. A choice of 42 forgets the eye height. The choices 59.5 and 64.5 divide \(50\) by \(0.84\) instead of multiplying.`,
        hint: 'Tangent is opposite over adjacent. Which side do you want, and where does the angle start?' },
      { q: String.raw`A student writes: "A 30-60-90 triangle has hypotenuse \(10\). Step 1: the short leg is half the hypotenuse, so it is \(5\). Step 2: the long leg is the short leg times \(\sqrt2\), so it is \(5\sqrt2 \approx 7.07\)." Which statement is correct?`,
        choices: ['Both steps are correct.', String.raw`Step 1 is wrong: the short leg is \(10 \div \sqrt3\).`,
          String.raw`Step 2 is wrong: the long leg is the short leg times \(\sqrt3\), so it is \(5\sqrt3 \approx 8.66\).`,
          'Step 2 is wrong: the long leg equals the hypotenuse, 10.'], answer: 2,
        why: String.raw`Step 1 is right. In Step 2 the factor \(\sqrt2\) belongs to the 45-45-90 triangle. A check shows the error: \(5^2 + 7.07^2 = 75\), not \(100\). With \(5\sqrt3\): \(25 + 75 = 100\).`,
        hint: 'Check the three sides with the Pythagorean theorem. Do they fit?' }
    ],
    links: { related: ['pythagorean-theorem', 'distance-and-the-pythagorean-theorem', 'the-unit-circle-and-trig-waves', 'square-roots-and-irrational-numbers',
      'similarity-and-scaling', 'similar-triangles-aa-sas-sss', 'angles-in-triangles-and-polygons', 'area-by-decomposition', 'rigid-motions-and-congruence'] },

    mount({ stage, controls: C }) {
      const st = { size: 1, cut: 0, al: 30, hyp: 10, p1: 30, p2: 35 };
      const V = { mode: 'sq', given: 'leg', at: 'A', q: 1, scene: 'tree', rev: false, tri: 0, hideAng: false, pfb: '', pick: -1, afb: '' };
      const PS = { i: 0, solved: PR.map(() => false), first: PR.map(() => false), wrong: PR.map(() => []), fb: PR.map(() => '') };
      let cancel = () => {};
      const P = new Plane(stage, { span: 5 });

      /* ---------- derived numbers ---------- */
      const legOf = () => V.given === 'hyp' ? st.size / R2 : st.size;
      const shortOf = () => V.given === 'hyp' ? st.size / 2 : V.given === 'long' ? st.size / R3 : st.size;
      const rng = () => { const z = SZ.find(s => s.m === V.mode && s.g === V.given); return z ? [z.min, z.max] : [1, 8]; };
      const trigNums = () => {
        const a = st.al * D2R, H = st.hyp, AC = H * Math.cos(a), BC = H * Math.sin(a), A = V.at === 'A';
        return { H, AC, BC, th: A ? st.al : 90 - st.al, opp: A ? BC : AC, adj: A ? AC : BC };
      };
      const convInfo = () => {
        const [a, b, c] = TRIPLES[V.tri], l = a * a + b * b, r = c * c;
        return { a, b, c, l, r, right: l === r, C: Math.acos((l - r) / (2 * a * b)) / D2R };
      };
      const sceneVal = () => SCN[V.scene].val(st.p1, st.p2);

      /* ---------- canvas ---------- */
      const drawSq = (c, p) => {
        const pal = p.pal, s = legOf(), F = Math.max(1.8, s), g = .9 * s * st.cut, hide = V.q === 1, ls = fsz(p);
        box(p, 0, 0, F * 1.9, F);
        gridUnits(p);
        p.path([[s + g, 0], [g, s], [s + g, s]], { fill: alpha(pal.text, .06), stroke: alpha(pal.text, .4), width: 2, close: true });
        p.path([[0, 0], [s, 0], [0, s]], { fill: alpha(pal.yellow, .22), close: true });
        p.path([[0, 0], [s, 0]], { stroke: pal.green, width: 4.5 });
        p.path([[0, 0], [0, s]], { stroke: pal.red, width: 4.5 });
        p.path([[s, 0], [0, s]], { stroke: pal.blue, width: 4.5 });
        rmark(p, 0, 0, 1, 0, 0, 1);
        arc(p, s, 0, 30, 3 * Math.PI / 4, Math.PI, pal.text, 2.5); angLab(p, '45°', s, 0, 3 * Math.PI / 4, Math.PI, 50, pal.text, ls);
        arc(p, 0, s, 30, 3 * Math.PI / 2, 7 * Math.PI / 4, pal.text, 2.5); angLab(p, '45°', 0, s, 3 * Math.PI / 2, 7 * Math.PI / 4, 50, pal.text, ls);
        p.label('leg ' + num(s), s / 2, 0, { size: ls, italic: false, color: pal.green, dy: 22 });
        p.label('leg ' + num(s), 0, s / 2, { size: ls, italic: false, color: pal.red, dx: -12, align: 'right' });
        p.label('hypotenuse', s / 2, s / 2, { size: ls, italic: false, color: pal.blue, dx: 14, dy: -24, align: 'left' });
        p.label(hide ? '?' : co(s) + '√2 ≈ ' + num(s * R2), s / 2, s / 2, { size: ls, italic: false, color: pal.blue, dx: 14, dy: -4, align: 'left' });
        p.label('square of side ' + num(s), g + s / 2, s, { size: ls, italic: false, color: pal.muted, dy: -18, alpha: 1 - st.cut });
        handle(p, 0, s);
      };

      const drawEq = (c, p) => {
        const pal = p.pal, s = shortOf(), F = Math.max(1.3, s), g = 1.1 * s * st.cut, hide = V.q === 1, ls = fsz(p), T = s * R3;
        box(p, -2.1 * F, 0, F, R3 * F, null, 44, 84);
        gridUnits(p);
        p.path([[-s - g, 0], [-g, 0], [-g, T]], { fill: alpha(pal.text, .06), stroke: alpha(pal.text, .4), width: 2, close: true });
        p.path([[0, 0], [s, 0], [0, T]], { fill: alpha(pal.yellow, .22), close: true });
        p.path([[0, 0], [s, 0]], { stroke: pal.green, width: 4.5 });
        p.path([[0, 0], [0, T]], { stroke: pal.red, width: 4.5 });
        p.path([[s, 0], [0, T]], { stroke: pal.blue, width: 4.5 });
        rmark(p, 0, 0, 1, 0, 0, 1);
        arc(p, s, 0, 30, 2 * Math.PI / 3, Math.PI, pal.text, 2.5); angLab(p, '60°', s, 0, 2 * Math.PI / 3, Math.PI, 52, pal.text, ls);
        arc(p, 0, T, 34, -Math.PI / 2, -Math.PI / 3, pal.text, 2.5); angLab(p, '30°', 0, T, -Math.PI / 2, -Math.PI / 3, 58, pal.text, ls);
        p.label('short leg ' + num(s), s / 2, 0, { size: ls, italic: false, color: pal.green, dy: 22 });
        p.label('long leg', 0, T / 2, { size: ls, italic: false, color: pal.red, dx: -10, dy: -10, align: 'right' });
        p.label(hide ? '?' : co(s) + '√3 ≈ ' + num(T), 0, T / 2, { size: ls, italic: false, color: pal.red, dx: -10, dy: 10, align: 'right' });
        p.label('hypotenuse', s / 2, T / 2, { size: ls, italic: false, color: pal.blue, dx: 14, dy: -22, align: 'left' });
        p.label(co(2 * s) + ' = 2 × ' + num(s), s / 2, T / 2, { size: ls, italic: false, color: pal.blue, dx: 14, dy: -4, align: 'left' });
        const yb = p.Y(0) + 46, x0 = p.X(-s - g), x1 = p.X(s), cc = p.ctx;
        cc.beginPath(); cc.moveTo(x0, yb - 6); cc.lineTo(x0, yb); cc.lineTo(x1, yb); cc.lineTo(x1, yb - 6);
        cc.strokeStyle = pal.muted; cc.lineWidth = 1.6; cc.stroke();
        p.label('whole side = ' + num(2 * s), (-s - g + s) / 2, 0, { size: ls, italic: false, color: pal.muted, dy: 62 });
        handle(p, 0, T);
      };

      const drawTrig = (c, p) => {
        const pal = p.pal, n = trigNums(), a = st.al * D2R, ls = fsz(p), hide = V.q === 1, A = V.at === 'A';
        const Pa = [0, 0], Pc = [n.AC, 0], Pb = [n.AC, n.BC], cen = [n.AC * .66, n.BC * .33];
        box(p, 0, 0, 10, 10, null, 44, 56);
        gridUnits(p);
        p.path([Pa, Pc, Pb], { fill: alpha(pal.yellow, .16), close: true });
        const cOpp = pal.red, cAdj = pal.green, cHyp = pal.blue;
        const colAC = A ? cAdj : cOpp, colBC = A ? cOpp : cAdj;
        p.path([Pa, Pc], { stroke: colAC, width: 4.5 }); p.path([Pc, Pb], { stroke: colBC, width: 4.5 }); p.path([Pa, Pb], { stroke: cHyp, width: 4.5 });
        rmark(p, Pc[0], 0, -1, 0, 0, 1);
        const ac = (A ? 'adjacent ' : 'opposite '), bc = (A ? 'opposite ' : 'adjacent ');
        edgeLabel(p, Pa, Pc, cen, [ac.trim(), hide ? '?' : num(n.AC)], colAC, 24, ls);
        edgeLabel(p, Pc, Pb, cen, [bc.trim(), hide ? '?' : num(n.BC)], colBC, 14, ls);
        edgeLabel(p, Pa, Pb, cen, ['hypotenuse', num(n.H)], cHyp, 14, ls);
        /* theta arc */
        const r = clamp(16 / Math.sin(a / 2), 42, Math.hypot(n.AC, n.BC) * p.scale * .55);
        if (A) { arc(p, 0, 0, 34, 0, a, pal.text, 3); angLab(p, 'θ', 0, 0, 0, a, Math.max(r, 52), pal.text, ls + 6, true); }
        else {
          const b0 = Math.PI + a, b1 = 1.5 * Math.PI, rb = clamp(16 / Math.sin((b1 - b0) / 2), 42, Math.hypot(n.AC, n.BC) * p.scale * .55);
          arc(p, Pb[0], Pb[1], 34, b0, b1, pal.text, 3); angLab(p, 'θ', Pb[0], Pb[1], b0, b1, Math.max(rb, 52), pal.text, ls + 6, true);
        }
        p.label('A', 0, 0, { size: ls, italic: false, color: pal.muted, dx: -14, dy: 14 });
        p.label('C', Pc[0], 0, { size: ls, italic: false, color: pal.muted, dx: 14, dy: 14 });
        p.label('B', Pb[0], Pb[1], { size: ls, italic: false, color: pal.muted, dx: 14, dy: -12 });
        handle(p, Pb[0], Pb[1]);
      };

      const drawApply = (c, p) => {
        const pal = p.pal, ls = fsz(p), k = V.scene, a = st.p1, b = st.p2, v = sceneVal(), rv = V.rev, B = b * D2R;
        const seg = (u, w, col) => p.path([u, w], { stroke: col, width: 4.5 });
        caption(p, SCN[k].cap);
        if (k === 'tree') {
          const d = a, h = d * Math.tan(B);
          box(p, 0, 0, d, Math.max(h, d * .45), null, 56, 60);
          p.path([[-.05 * d, 0], [d * 1.04, 0]], { stroke: pal['grid-strong'], width: 2 });
          seg([0, 0], [d, 0], pal.green); seg([d, 0], [d, h], pal.red); seg([0, 0], [d, h], pal.blue);
          rmark(p, d, 0, -1, 0, 0, 1);
          arc(p, 0, 0, 46, 0, B, pal.yellow); angLab(p, b + '°', 0, 0, 0, B, 74, pal.yellow, ls);
          p.label('distance ' + a + ' ft', d / 2, 0, { size: ls, italic: false, color: pal.green, dy: 24 });
          p.label('height', d, h / 2, { size: ls, italic: false, color: pal.red, dx: 12, dy: -10, align: 'left' });
          p.label(rv ? num(v) + ' ft' : '?', d, h / 2, { size: ls, italic: false, color: pal.red, dx: 12, dy: 10, align: 'left' });
          p.label('line of sight', d / 2, h / 2, { size: ls, italic: false, color: pal.blue, dx: -8, dy: -22, align: 'right' });
        } else if (k === 'cliff') {
          const H = a, d = H / Math.tan(B);
          box(p, 0, 0, d, H, null, 56, 60);
          p.path([[0, 0], [d * 1.04, 0]], { stroke: pal['grid-strong'], width: 2 });
          p.path([[0, H], [d, H]], { stroke: pal.muted, width: 2, dash: [6, 6] });
          seg([0, 0], [0, H], pal.red); seg([0, 0], [d, 0], pal.green); seg([0, H], [d, 0], pal.blue);
          rmark(p, 0, 0, 1, 0, 0, 1);
          arc(p, 0, H, 50, -B, 0, pal.yellow); angLab(p, b + '°', 0, H, -B, 0, 82, pal.yellow, ls);
          arc(p, d, 0, 40, Math.PI - B, Math.PI, pal.yellow, 2.5); angLab(p, b + '°', d, 0, Math.PI - B, Math.PI, 66, pal.yellow, ls);
          p.label('cliff ' + a + ' ft', 0, H / 2, { size: ls, italic: false, color: pal.red, dx: 12, align: 'left' });
          p.label('distance ' + (rv ? num(v) + ' ft' : '?'), d / 2, 0, { size: ls, italic: false, color: pal.green, dy: 24 });
          p.label('boat', d, 0, { size: ls, italic: false, color: pal.muted, dy: -16 });
        } else if (k === 'ladder') {
          const d = a * Math.cos(B), hh = a * Math.sin(B);
          box(p, 0, 0, d, hh, null, 56, 60);
          p.path([[0, 0], [0, hh * 1.06]], { stroke: pal['grid-strong'], width: 7 });
          p.path([[-.1 * d, 0], [d * 1.2, 0]], { stroke: pal['grid-strong'], width: 2 });
          seg([d, 0], [0, hh], pal.blue); seg([0, 0], [d, 0], pal.green);
          p.path([[0, 0], [0, hh]], { stroke: alpha(pal.red, .5), width: 2.5, dash: [6, 6] });
          rmark(p, 0, 0, 1, 0, 0, 1);
          arc(p, d, 0, 38, Math.PI - B, Math.PI, pal.yellow); angLab(p, b + '°', d, 0, Math.PI - B, Math.PI, 64, pal.yellow, ls);
          p.label('wall', 0, hh * .8, { size: ls, italic: false, color: pal.muted, dx: -10, align: 'right' });
          edgeLabel(p, [d, 0], [0, hh], [0, 0], ['ladder', a + ' ft'], pal.blue, 14, ls);
          p.label('distance ' + (rv ? num(v) + ' ft' : '?'), d / 2, 0, { size: ls, italic: false, color: pal.green, dy: 24 });
        } else {
          const bs = a, hh = bs / 2 * Math.tan(B);
          box(p, 0, 0, bs, hh, null, 56, 60);
          p.path([[0, 0], [bs, 0], [bs / 2, hh]], { fill: alpha(pal.yellow, .16), stroke: pal.blue, width: 4.5, close: true });
          p.path([[bs / 2, 0], [bs / 2, hh]], { stroke: pal.red, width: 4.5, dash: [8, 6] });
          rmark(p, bs / 2, 0, -1, 0, 0, 1);
          arc(p, 0, 0, 40, 0, B, pal.yellow); angLab(p, b + '°', 0, 0, 0, B, 66, pal.yellow, ls);
          arc(p, bs, 0, 40, Math.PI - B, Math.PI, pal.yellow, 2.5); angLab(p, b + '°', bs, 0, Math.PI - B, Math.PI, 66, pal.yellow, ls);
          p.label('base ' + bs + ', half = ' + bs / 2, bs / 2, 0, { size: ls, italic: false, color: pal.green, dy: 24 });
          p.label('height', bs / 2, hh / 2, { size: ls, italic: false, color: pal.red, dx: 10, dy: -10, align: 'left' });
          p.label(rv ? num(v) : '?', bs / 2, hh / 2, { size: ls, italic: false, color: pal.red, dx: 10, dy: 10, align: 'left' });
        }
      };

      const drawSides = (c, p, a, b, cc, showAng, angTxt, isRight) => {
        const pal = p.pal, ls = fsz(p), Cx = (b * b + cc * cc - a * a) / (2 * cc), Cy = Math.sqrt(Math.max(0, b * b - Cx * Cx));
        const A0 = [0, 0], B0 = [cc, 0], C0 = [Cx, Cy], cen = [(Cx + cc) / 3, Cy / 3];
        box(p, 0, 0, cc, Math.max(Cy, cc * .3), null, 56, 60);
        p.path([A0, B0, C0], { fill: alpha(pal.yellow, .16), close: true });
        p.path([A0, B0], { stroke: pal.blue, width: 4.5 }); p.path([B0, C0], { stroke: pal.green, width: 4.5 }); p.path([A0, C0], { stroke: pal.red, width: 4.5 });
        edgeLabel(p, A0, B0, cen, 'c = ' + cc, pal.blue, 24, ls);
        edgeLabel(p, B0, C0, cen, 'a = ' + a, pal.green, 16, ls);
        edgeLabel(p, A0, C0, cen, 'b = ' + b, pal.red, 16, ls);
        /* angle at C, opposite the longest side */
        const d1 = Math.atan2(A0[1] - C0[1], A0[0] - C0[0]), d2 = Math.atan2(B0[1] - C0[1], B0[0] - C0[0]);
        let lo = Math.min(d1, d2), hi = Math.max(d1, d2); if (hi - lo > Math.PI) { const t = lo; lo = hi; hi = t + 2 * Math.PI; }
        if (showAng && isRight) {
          const r = 14 / p.scale, u = [Math.cos(d1), Math.sin(d1)], w = [Math.cos(d2), Math.sin(d2)];
          p.path([[C0[0] + u[0] * r, C0[1] + u[1] * r], [C0[0] + (u[0] + w[0]) * r, C0[1] + (u[1] + w[1]) * r], [C0[0] + w[0] * r, C0[1] + w[1] * r]], { stroke: pal.text, width: 2 });
        } else arc(p, C0[0], C0[1], 30, lo, hi, pal.yellow, 3);
        p.label(angTxt, C0[0], C0[1], { size: ls, italic: false, color: pal.yellow, dx: Math.cos((lo + hi) / 2) * 62, dy: -Math.sin((lo + hi) / 2) * 62 });
        p.label('C', C0[0], C0[1], { size: ls, italic: false, color: pal.muted, dy: -16 });
      };
      const drawConv = (c, p) => { const i = convInfo(); drawSides(c, p, i.a, i.b, i.c, V.q !== 1, V.q === 1 ? '?' : num(i.C) + '°', i.right); };

      const drawPrac = (c, p) => {
        const pr = PR[PS.i], pal = p.pal, ls = fsz(p);
        if (pr.sides) { drawSides(c, p, pr.sides[0], pr.sides[1], pr.sides[2], false, '?', false); return; }
        if (pr.iso) {
          const [bs, sd] = pr.iso, hh = Math.sqrt(sd * sd - bs * bs / 4), cen = [bs / 2, hh / 3];
          box(p, 0, 0, bs, hh, null, 44, 60);
          p.path([[0, 0], [bs, 0], [bs / 2, hh]], { fill: alpha(pal.yellow, .16), stroke: pal.blue, width: 4.5, close: true });
          p.path([[bs / 2, 0], [bs / 2, hh]], { stroke: pal.red, width: 4, dash: [8, 6] });
          rmark(p, bs / 2, 0, -1, 0, 0, 1);
          p.label(bs + ' cm', bs / 2, 0, { size: ls, italic: false, color: pal.green, dy: 24 });
          edgeLabel(p, [0, 0], [bs / 2, hh], cen, sd + ' cm', pal.blue, 14, ls);
          edgeLabel(p, [bs, 0], [bs / 2, hh], cen, sd + ' cm', pal.blue, 14, ls);
          p.label('height', bs / 2, hh / 2, { size: ls, italic: false, color: pal.red, dx: 10, dy: -10, align: 'left' });
          p.label('?', bs / 2, hh / 2, { size: ls, italic: false, color: pal.yellow, dx: 10, dy: 10, align: 'left' });
          return;
        }
        const f = pr.fig, a = f.al * D2R, H = 9, AC = H * Math.cos(a), BC = H * Math.sin(a), Pa = [0, 0], Pc = [AC, 0], Pb = [AC, BC], cen = [AC * .66, BC * .33];
        box(p, 0, 0, 10, Math.max(BC, 3), null, 56, 60);
        p.path([Pa, Pc, Pb], { fill: alpha(pal.yellow, .16), close: true });
        p.path([Pa, Pc], { stroke: pal.green, width: 4.5 }); p.path([Pc, Pb], { stroke: pal.red, width: 4.5 }); p.path([Pa, Pb], { stroke: pal.blue, width: 4.5 });
        rmark(p, Pc[0], 0, -1, 0, 0, 1);
        const col = t => t.includes('?') ? pal.yellow : null;
        if (f.ac) edgeLabel(p, Pa, Pc, cen, f.ac, col(f.ac) || pal.green, 24, ls);
        if (f.bc) edgeLabel(p, Pc, Pb, cen, f.bc, col(f.bc) || pal.red, 14, ls);
        if (f.ab) edgeLabel(p, Pa, Pb, cen, f.ab, col(f.ab) || pal.blue, 14, ls);
        if (f.A) p.label(f.A, 0, 0, { size: ls, italic: false, color: col(f.A) || pal.text, dx: -10, dy: -16, align: 'right' });
        if (f.B) p.label(f.B, Pb[0], Pb[1], { size: ls, italic: false, color: pal.text, dx: 0, dy: -18 });
      };

      P.onDraw = (c, p) => {
        ({ sq: drawSq, eq: drawEq, trig: drawTrig, apply: drawApply, conv: drawConv, prac: drawPrac })[V.mode](c, p);
      };

      /* ---------- controls ---------- */
      C.title('Explore');
      const modeSel = C.select({ label: 'Choose a scene', options: MODES.map(([value, label]) => ({ value, label })), value: 'sq', onChange: v => go(v) });
      const host = modeSel.parentNode.parentNode, last = () => host.lastElementChild;
      const items = [];
      const reg = (fn, el) => { items.push([fn, el || last()]); };
      const touch = () => { if (V.q > 0) { V.q = 0; V.pfb = ''; vis(); renderPQ(); } };
      const redraw = () => { syncSliders(); P.requestDraw(); upd(); };

      C.hint(HINTS.sq); const hintEl = last();

      const giveSq = C.select({ label: 'You know', options: [{ value: 'leg', label: 'a leg' }, { value: 'hyp', label: 'the hypotenuse' }], value: 'leg',
        onChange: v => { cancel(); touch(); V.given = v; st.size = clamp(st.size, ...rng()); sync(); } });
      reg(() => V.mode === 'sq', giveSq.parentNode);
      const giveEq = C.select({ label: 'You know', options: [{ value: 'short', label: 'the short leg' }, { value: 'hyp', label: 'the hypotenuse' }, { value: 'long', label: 'the long leg' }], value: 'short',
        onChange: v => { cancel(); touch(); V.given = v; st.size = clamp(st.size, ...rng()); sync(); } });
      reg(() => V.mode === 'eq', giveEq.parentNode);
      const szS = SZ.map(z => {
        const sl = C.slider({ label: z.label, min: z.min, max: z.max, step: 1, value: clamp(st.size, z.min, z.max), format: v => num(v),
          onInput: v => { cancel(); touch(); st.size = v; redraw(); } });
        reg(() => V.mode === z.m && V.given === z.g); return sl;
      });
      const cutSq = C.slider({ label: 'Cut the square along the diagonal', min: 0, max: 1, step: .01, value: 0, format: v => Math.round(v * 100) + '%',
        onInput: v => { cancel(); st.cut = v; redraw(); } });
      reg(() => V.mode === 'sq');
      const cutEq = C.slider({ label: 'Cut the triangle down the middle', min: 0, max: 1, step: .01, value: 0, format: v => Math.round(v * 100) + '%',
        onInput: v => { cancel(); st.cut = v; redraw(); } });
      reg(() => V.mode === 'eq');

      const atBtn = C.buttons([
        { label: 'θ is the angle at A', onClick: () => { cancel(); V.at = 'A'; sync(); } },
        { label: 'θ is the angle at B', onClick: () => { cancel(); V.at = 'B'; sync(); } }]);
      reg(() => V.mode === 'trig', atBtn[0].parentNode);
      const alS = C.slider({ label: 'Angle at A', min: 15, max: 75, step: 1, value: st.al, format: v => V.hideAng ? '?' : Math.round(v) + '°',
        onInput: v => { cancel(); touch(); st.al = v; redraw(); } });
      reg(() => V.mode === 'trig');
      const hypS = C.slider({ label: 'Hypotenuse length', min: 4, max: 10, step: 1, value: st.hyp, format: v => num(v),
        onInput: v => { cancel(); touch(); st.hyp = v; redraw(); } });
      reg(() => V.mode === 'trig');
      const preB = C.buttons([30, 45, 60].map(t => ({ label: 'θ = ' + t + '°', onClick: () => {
        cancel(); touch(); st.al = V.at === 'A' ? t : 90 - t; sync(); } })));
      reg(() => V.mode === 'trig', preB[0].parentNode);
      const hideT = C.toggle({ label: 'Hide the angle (find it with the inverse key)', value: false, onChange: v => { V.hideAng = v; sync(); } });
      reg(() => V.mode === 'trig', hideT.parentNode);

      const sceneSel = C.select({ label: 'Situation', options: Object.keys(SCN).map(k => ({ value: k, label: SCN[k].name })), value: 'tree',
        onChange: v => { cancel(); V.scene = v; V.rev = false; V.afb = ''; st.p1 = SCN[v].d1; st.p2 = SCN[v].d2; sync(); } });
      reg(() => V.mode === 'apply', sceneSel.parentNode);
      const scS = {};
      for (const k of Object.keys(SCN)) {
        const S = SCN[k];
        const s1 = C.slider({ label: S.l1, min: S.r1[0], max: S.r1[1], step: S.r1[2], value: S.d1, format: v => num(v),
          onInput: v => { cancel(); st.p1 = v; redraw(); } });
        reg(() => V.mode === 'apply' && V.scene === k);
        const s2 = C.slider({ label: S.l2, min: S.r2[0], max: S.r2[1], step: 5, value: S.d2, format: v => Math.round(v) + '°',
          onInput: v => { cancel(); st.p2 = v; redraw(); } });
        reg(() => V.mode === 'apply' && V.scene === k);
        scS[k] = [s1, s2];
      }
      const triSel = C.select({ label: 'Side lengths', options: TRIPLES.map((t, i) => ({ value: String(i), label: t.join(', ') })), value: '0',
        onChange: v => { cancel(); V.tri = +v; V.q = 1; V.pfb = ''; V.pick = -1; sync(); } });
      reg(() => V.mode === 'conv', triSel.parentNode);

      /* predict panel */
      const pqEl = h('div', { class: 'ctl', style: 'display:flex;flex-direction:column;gap:8px;border:1px solid var(--line-strong);border-radius:6px;padding:12px' });
      host.append(pqEl);
      reg(() => V.q > 0 && !!pqDef(), pqEl);
      const pqDef = () => {
        if (V.mode === 'sq') return { q: 'Predict first. A square of side 1 is cut along its diagonal. How long is the diagonal?', ch: [
          ['2, both sides added', 'No. Walking along two sides is 2, but the diagonal is a shortcut, so it is shorter. By Pythagoras it is √(1² + 1²) = √2.'],
          ['About 1.4', 'Yes. Pythagoras gives 1² + 1² = 2, so the diagonal is √2 ≈ 1.41. It is longer than a side and shorter than two sides.', 1],
          ['1, the same as a side', 'No. The hypotenuse is always the longest side of a right triangle, so it is longer than 1. It is √2 ≈ 1.41.'],
          ['1.5, halfway between', 'Close, but not exact. 1² + 1² = 2, and 1.5² = 2.25, which is too big. The diagonal is √2 ≈ 1.41.']] };
        if (V.mode === 'eq') return { q: 'Predict first. The short leg is 1 and the hypotenuse is 2. How long is the long leg?', ch: [
          ['1.5, halfway', 'Not quite. Pythagoras gives 1² + b² = 2², so b² = 3 and b = √3 ≈ 1.73. And 1.5² is only 2.25.'],
          ['1, the same as the short leg', 'No. The long leg is longer than the short leg. With two legs of 1, the hypotenuse would be √2, not 2.'],
          ['Almost 2, about 1.9', 'Too long. 1² + 1.9² = 4.61, which is more than 4. The long leg is √3 ≈ 1.73.'],
          ['About 1.7', 'Yes. 1² + b² = 2² gives b² = 3, so the long leg is √3 ≈ 1.73.', 1]] };
        if (V.mode === 'trig') return { q: 'Predict first. The angle θ is 30° and the hypotenuse is 10. How long is the side opposite θ?', ch: [
          ['3, about a third', 'No. Side lengths do not split the way angles do. The 30-60-90 triangle puts 5 opposite 30°.'],
          ['5, half the hypotenuse', 'Yes. This is the halved equilateral triangle: the short leg, across from 30°, is half the hypotenuse. So sin 30° = 5 ÷ 10 = 1/2.', 1],
          ['8.7', 'That is the other leg, the adjacent side. The side across from the smaller angle is the shorter leg.'],
          ['10', 'That is the hypotenuse. A leg is always shorter than the hypotenuse.']] };
        if (V.mode === 'conv') {
          const i = convInfo(), why = `a² + b² = ${i.a}² + ${i.b}² = ${i.l} and c² = ${i.c}² = ${i.r}. `;
          const tail = i.right ? 'They are equal, so the converse says the angle opposite c is exactly 90°.' :
            i.l > i.r ? `${i.l} is greater than ${i.r}, so the largest angle is less than 90° (about ${num(i.C)}°). It is not a right triangle.` :
              `${i.l} is less than ${i.r}, so the largest angle is more than 90° (about ${num(i.C)}°). It is not a right triangle.`;
          return { q: `Predict first. Sides ${i.a}, ${i.b} and ${i.c}: is it a right triangle?`, ch: [
            ['Yes, it is a right triangle', why + tail, i.right ? 1 : 0],
            ['No, it is not a right triangle', why + tail, i.right ? 0 : 1]] };
        }
        return null;
      };
      const renderPQ = () => {
        const d = pqDef(); pqEl.innerHTML = '';
        if (!d || V.q === 0) return;
        pqEl.append(h('p', { class: 'ctl-title', style: 'margin:0' }, d.q));
        const row = h('div', { class: 'ctl buttons' });
        d.ch.forEach((ch, i) => row.append(h('button', { type: 'button', class: 'btn' + (V.pick === i ? ' primary' : ''), ...(V.q === 2 ? { disabled: '' } : {}),
          onclick: () => { V.pick = i; V.q = 2; V.pfb = (ch[2] ? '<b>Your prediction is right.</b> ' : '<b>Not this time.</b> ') + ch[1].replace(/^Yes\. /, ''); vis(); renderPQ(); P.requestDraw(); upd(); } }, ch[0])));
        pqEl.append(row);
        if (V.q === 2) pqEl.append(h('div', { class: 'ctl readout', 'aria-live': 'polite', html: V.pfb }));
      };

      /* choose-the-ratio panel for the real situations */
      const apEl = h('div', { class: 'ctl', style: 'display:flex;flex-direction:column;gap:8px;border:1px solid var(--line-strong);border-radius:6px;padding:12px' });
      host.append(apEl);
      reg(() => V.mode === 'apply', apEl);
      const renderAP = () => {
        apEl.innerHTML = '';
        const S = SCN[V.scene];
        apEl.append(h('p', { class: 'ctl-title', style: 'margin:0' }, 'You want ' + S.unk + '. Which ratio do you use?'));
        const row = h('div', { class: 'ctl buttons' });
        ['sin', 'cos', 'tan'].forEach(r => row.append(h('button', { type: 'button', class: 'btn', onclick: () => {
          V.afb = (r === S.ok ? '<b>Yes, ' + r + '.</b> ' : '<b>Not ' + r + '.</b> ') + S.why[r];
          if (r === S.ok) V.rev = true;
          renderAP(); P.requestDraw(); upd(); } }, r)));
        apEl.append(row);
        if (V.afb) apEl.append(h('div', { class: 'ctl readout', 'aria-live': 'polite', html: V.afb }));
      };

      const ro = C.readout();

      /* practice */
      C.title('Practice');
      const prEl = h('div', { class: 'ctl', style: 'display:flex;flex-direction:column;gap:10px' });
      host.append(prEl);
      const renderPractice = () => {
        prEl.innerHTML = '';
        if (V.mode !== 'prac') {
          prEl.append(h('p', { class: 'hint', style: 'margin:0' }, 'Eight short problems: special triangles, choosing sine, cosine or tangent, finding an angle, and testing for a right angle. Every answer is explained. Nothing is saved or scored.'),
            h('div', { class: 'ctl buttons' }, h('button', { type: 'button', class: 'btn primary', onclick: () => go('prac') }, 'Start practice')));
          return;
        }
        const i = PS.i, pr = PR[i], N = PR.length, done = PS.solved.filter(Boolean).length, okFirst = PS.first.filter(Boolean).length;
        prEl.append(h('p', { class: 'ctl-title', style: 'margin:0' }, `Problem ${i + 1} of ${N}`),
          h('p', { class: 'hint', style: 'margin:0' }, `Right on the first try: ${okFirst} of ${done} solved`),
          h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' }, pr.q));
        const col = h('div', { style: 'display:flex;flex-direction:column;gap:8px' });
        pr.ch.forEach((ch, k) => {
          const wrong = PS.wrong[i].includes(k), good = PS.solved[i] && ch[2];
          col.append(h('button', { type: 'button', class: 'btn' + (good ? ' primary' : ''), ...((wrong || PS.solved[i]) && !good ? { disabled: '' } : {}),
            style: 'justify-content:flex-start;text-align:left;border-radius:10px;white-space:normal;padding:8px 14px',
            onclick: () => {
              if (PS.solved[i]) return;
              if (ch[2]) { PS.solved[i] = true; PS.first[i] = PS.wrong[i].length === 0; PS.fb[i] = '<b>Correct.</b> ' + ch[1].replace(/^Yes\. /, ''); }
              else { PS.wrong[i].push(k); PS.fb[i] = '<b>Not this one.</b> ' + ch[1] + ' Try another choice.'; }
              renderPractice();
            } }, (good ? '✓ ' : wrong ? '✗ ' : '') + ch[0]));
        });
        prEl.append(col);
        if (PS.fb[i]) prEl.append(h('div', { class: 'ctl readout', 'aria-live': 'polite', html: PS.fb[i] }));
        const lastP = i === N - 1;
        prEl.append(h('div', { class: 'ctl buttons' }, h('button', { type: 'button', class: 'btn primary', ...(PS.solved[i] ? {} : { disabled: '' }),
          onclick: () => {
            if (lastP) { PS.i = 0; PR.forEach((_, j) => { PS.solved[j] = false; PS.first[j] = false; PS.wrong[j] = []; PS.fb[j] = ''; }); }
            else PS.i++;
            renderPractice(); P.requestDraw();
          } }, lastP ? 'Start over' : 'Next problem')));
        if (lastP && PS.solved[i]) prEl.append(h('div', { class: 'ctl readout', html: `<b>All done.</b> You got ${okFirst} of ${N} right on the first try.` }));
      };

      /* ---------- readout ---------- */
      const upd = () => {
        let html = '';
        if (V.mode === 'sq' || V.mode === 'eq' || V.mode === 'trig' || V.mode === 'conv') {
          if (V.q === 1) { ro.innerHTML = '<span class="k">Make your prediction above to see the numbers.</span>'; return; }
        }
        if (V.mode === 'sq') {
          const s = legOf(), H = st.size;
          html = V.given === 'leg'
            ? `<span class="k">Leg</span> ${num(s)}<br><span class="k">Hypotenuse</span> = leg × √2 = ${co(s)}√2 ≈ ${num(s * R2)}<br>`
            : `<span class="k">Hypotenuse</span> ${num(H)}<br><span class="k">Leg</span> = hypotenuse ÷ √2 = ${num(H)} ÷ √2<br><span class="k">Rationalize</span> multiply top and bottom by √2: ${co(H)}√2 ÷ 2 ≈ ${num(s)}<br>`;
          html += `<span class="k">Check</span> ${num(s)}² + ${num(s)}² = ${num(2 * s * s)}, and ${num(s * R2)}² ≈ ${num(2 * s * s)}<br><span class="k">Ratio</span> leg : leg : hypotenuse = 1 : 1 : √2`;
        } else if (V.mode === 'eq') {
          const s = shortOf(), T = s * R3;
          html = V.given === 'short' ? `<span class="k">Short leg</span> ${num(s)}<br><span class="k">Hypotenuse</span> = 2 × short leg = ${num(2 * s)}<br><span class="k">Long leg</span> = short leg × √3 = ${co(s)}√3 ≈ ${num(T)}<br>`
            : V.given === 'hyp' ? `<span class="k">Hypotenuse</span> ${num(st.size)}<br><span class="k">Short leg</span> = hypotenuse ÷ 2 = ${num(s)}<br><span class="k">Long leg</span> = ${num(s)} × √3 ≈ ${num(T)}<br>`
              : `<span class="k">Long leg</span> ${num(st.size)}<br><span class="k">Short leg</span> = long leg ÷ √3 = ${co(st.size)}√3 ÷ 3 ≈ ${num(s)}<br><span class="k">Hypotenuse</span> = 2 × short leg ≈ ${num(2 * s)}<br>`;
          html += `<span class="k">Check</span> ${num(s)}² + ${num(T)}² ≈ ${num(s * s + T * T)}, and ${num(2 * s)}² = ${num(4 * s * s)}<br><span class="k">Ratio</span> short : long : hypotenuse = 1 : √3 : 2`;
        } else if (V.mode === 'trig') {
          const n = trigNums(), q = (x, y) => num(x / y), thR = Math.round(n.th);
          html = `<span class="k">θ</span> = ${V.hideAng ? '?' : num(n.th) + '°'} at ${V.at}. <span class="k">opposite</span> ${num(n.opp)}, <span class="k">adjacent</span> ${num(n.adj)}, <span class="k">hypotenuse</span> ${num(n.H)}<br>
            <span class="k">sin θ</span> = opp ÷ hyp = ${num(n.opp)} ÷ ${num(n.H)} = ${q(n.opp, n.H)}<br>
            <span class="k">cos θ</span> = adj ÷ hyp = ${num(n.adj)} ÷ ${num(n.H)} = ${q(n.adj, n.H)}<br>
            <span class="k">tan θ</span> = opp ÷ adj = ${num(n.opp)} ÷ ${num(n.adj)} = ${q(n.opp, n.adj)}<br>`;
          if (V.hideAng) html += '<span class="k">Find θ</span> press tan⁻¹ on a calculator for opp ÷ adj, then switch the toggle off to check.';
          else {
            html += `<span class="k">Inverse</span> tan⁻¹(${q(n.opp, n.adj)}) ≈ ${num(n.th)}°: the angle whose tangent is ${q(n.opp, n.adj)}`;
            if (SPEC[thR] && Math.abs(n.th - thR) < 1e-9) html += `<br><span class="k">Special angle</span> sin ${thR}° = ${SPEC[thR][0]}, cos ${thR}° = ${SPEC[thR][1]}, tan ${thR}° = ${SPEC[thR][2]}`;
          }
        } else if (V.mode === 'apply') {
          const S = SCN[V.scene], v = sceneVal();
          html = `<span class="k">Known</span> ${S.known(st.p1, st.p2)}<br><span class="k">Want</span> ${S.unk}<br>`;
          html += V.rev ? `<span class="k">Set up</span> ${S.set(st.p1, st.p2)}<br><span class="k">Solve</span> ${S.solve(st.p1, st.p2, v)}`
            : '<span class="k">Choose sin, cos or tan to set up the equation.</span>';
        } else if (V.mode === 'conv') {
          const i = convInfo();
          html = `<span class="k">a² + b²</span> = ${i.a}² + ${i.b}² = ${i.l}<br><span class="k">c²</span> = ${i.c}² = ${i.r}<br><span class="k">Compare</span> ${i.right ? 'equal: a right angle opposite c' : i.l > i.r ? 'a² + b² is greater: all angles are acute' : 'a² + b² is smaller: the largest angle is obtuse'}<br><span class="k">Angle opposite c</span> ≈ ${num(i.C)}°`;
        } else html = '<span class="k">Work through the problems in the Practice panel.</span>';
        ro.innerHTML = html;
      };

      /* ---------- sync ---------- */
      function syncSliders() {
        szS.forEach(s => s.set(st.size)); cutSq.set(st.cut); cutEq.set(st.cut); alS.set(st.al); hypS.set(st.hyp);
        for (const k of Object.keys(SCN)) { scS[k][0].set(st.p1); scS[k][1].set(st.p2); }
      }
      function vis() { for (const [fn, el] of items) el.style.display = fn() ? '' : 'none'; hintEl.textContent = HINTS[V.mode]; }
      function sync() {
        syncSliders();
        modeSel.value = V.mode; giveSq.value = V.given; giveEq.value = V.given; sceneSel.value = V.scene; triSel.value = String(V.tri);
        hideT.checked = V.hideAng;
        atBtn[0].classList.toggle('primary', V.at === 'A'); atBtn[1].classList.toggle('primary', V.at === 'B');
        vis(); renderPQ(); renderAP(); renderPractice(); upd(); P.draw();
      }
      function go(m) {
        cancel(); V.mode = m; V.q = m === 'conv' ? 1 : 0; V.pfb = ''; V.pick = -1; V.rev = false; V.afb = '';
        if (m === 'sq' && V.given !== 'leg' && V.given !== 'hyp') V.given = 'leg';
        if (m === 'eq' && !['short', 'hyp', 'long'].includes(V.given)) V.given = 'short';
        sync();
      }

      /* ---------- dragging ---------- */
      draggable(P, {
        hit: (px, py) => {
          if (V.mode === 'trig') { const a = st.al * D2R; return near(P, st.hyp * Math.cos(a) , st.hyp * Math.sin(a), px, py) ? 'B' : null; }
          if (V.mode === 'sq') return near(P, 0, legOf(), px, py) ? 'T' : null;
          if (V.mode === 'eq') return near(P, 0, shortOf() * R3, px, py) ? 'T' : null;
          return null;
        },
        move: (_, x, y) => {
          cancel(); touch();
          if (V.mode === 'trig') {
            const n = trigNums();
            st.al = clamp(snap(Math.atan2(y, x) / D2R, 1), 15, 75);
            st.hyp = clamp(snap(Math.hypot(x, y), 1), 4, 10); void n;
          } else {
            const [lo, hi] = rng(), yy = Math.max(.2, y);
            const target = V.mode === 'sq' ? (V.given === 'hyp' ? yy * R2 : yy)
              : V.given === 'short' ? yy / R3 : V.given === 'hyp' ? 2 * yy / R3 : yy;
            st.size = clamp(snap(target, 1), lo, hi);
          }
          redraw();
        }
      });

      /* ---------- guided steps ---------- */
      const FLAGS = ['mode', 'given', 'at', 'q', 'scene', 'rev', 'tri'];
      const apply = (patch, immediate) => {
        cancel();
        const nums = {}, fl = {};
        for (const [k, v] of Object.entries(patch)) (FLAGS.includes(k) ? fl : nums)[k] = v;
        Object.assign(V, fl); V.pfb = ''; V.afb = ''; V.pick = -1; V.hideAng = false;
        if (fl.mode === 'sq' && fl.given === undefined) V.given = 'leg';
        if (immediate || !Object.keys(nums).length) { Object.assign(st, nums); sync(); return; }
        sync();
        cancel = animateTo(st, nums, 700, () => { syncSliders(); P.draw(); upd(); }, sync);
      };

      sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
