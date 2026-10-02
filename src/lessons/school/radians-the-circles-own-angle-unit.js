/* =====================================================================
   SCHOOL — Radians: the circle's own angle unit
   ===================================================================== */
{
  const PI = Math.PI;
  const nf = (v, d = 2) => { const s = String(+Math.abs(v).toFixed(d)); return (v < 0 && +s !== 0 ? '−' : '') + s; };
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  /* p/q of pi, reduced: "π/6", "3π/4", "2π", "0" */
  const piStr = (p, q) => {
    if (p === 0) return '0';
    const g = gcd(Math.abs(p), q); p /= g; q /= g;
    return (p === 1 ? 'π' : p + 'π') + (q > 1 ? '/' + q : '');
  };
  const fracStr = (p, q) => { const g = gcd(Math.abs(p), q); p /= g; q /= g; return q === 1 ? String(p) : p + '/' + q; };
  const kk = t => `<span class="k">${t}</span>`;
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const deg = th => th * 180 / PI;
  const pl = (v, w) => nf(v) + ' ' + w + (nf(v) === '1' ? '' : 's');
  const near0 = v => Math.abs(v) < 1e-6;

  /* the ten common angles: degrees, reduced fraction of pi, and three tempting wrong answers (as fractions of pi) */
  const ANG = [
    { d: 0, p: 0, q: 1, bad: [[1, 1], [2, 1], [1, 2]] },
    { d: 30, p: 1, q: 6, bad: [[1, 3], [1, 30], [30, 1]] },
    { d: 45, p: 1, q: 4, bad: [[1, 2], [1, 3], [45, 1]] },
    { d: 60, p: 1, q: 3, bad: [[1, 6], [1, 2], [2, 3]] },
    { d: 90, p: 1, q: 2, bad: [[1, 4], [1, 1], [90, 1]] },
    { d: 120, p: 2, q: 3, bad: [[1, 3], [3, 4], [4, 3]] },
    { d: 135, p: 3, q: 4, bad: [[1, 4], [2, 3], [135, 1]] },
    { d: 180, p: 1, q: 1, bad: [[1, 2], [2, 1], [180, 1]] },
    { d: 270, p: 3, q: 2, bad: [[1, 2], [2, 1], [3, 4]] },
    { d: 360, p: 2, q: 1, bad: [[1, 1], [4, 1], [360, 1]] }
  ];
  const RAD = ANG.map(a => a.p / a.q * PI);

  /* ---------- the one picture used by every mode ---------- */
  const capText = (p, text) => {
    const c = p.ctx; let size = clamp(Math.min(p.w, p.h) * .045, 14.5, 19);
    const set = () => { c.font = `600 ${size}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`; };
    set(); while (c.measureText(text).width > p.w - 56 && size > 11) { size -= .5; set(); }
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(text, p.w / 2, 20);
    c.fillStyle = p.pal.text; c.fillText(text, p.w / 2, 20);
  };
  const arcPts = (R, a0, a1, n = 60) => { const out = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; out.push([R * Math.cos(a), R * Math.sin(a)]); } return out; };
  const drawScene = (p, o) => {
    const pal = p.pal, R = o.R, th = o.th;
    p.cx = 0; p.cy = 0; p.span = o.vs;
    const fs = clamp(Math.min(p.w, p.h) * .045, 14.5, 19), at = (r, a) => [r * Math.cos(a), r * Math.sin(a)];
    /* axes through the center */
    p.path([[-1.25 * R, 0], [1.25 * R, 0]], { stroke: pal['grid-strong'], width: 1.5 });
    p.path([[0, -1.25 * R], [0, 1.25 * R]], { stroke: pal['grid-strong'], width: 1.5 });
    if (o.disc) p.path(arcPts(R, 0, TAU, 120), { fill: alpha(pal.blue, .08), close: true });
    if (o.wedge) p.path([[0, 0], ...arcPts(R, 0, th, 80)], { fill: alpha(pal.yellow, .34), close: true });
    if (o.slices) for (let k = 0; k < 2 * o.slices; k++) p.path([[0, 0], at(R, k * PI / o.slices)], { stroke: pal.muted, width: 1.5, dash: [4, 5] });
    p.path(arcPts(R, 0, TAU, 120), { stroke: pal.blue, width: 3, close: true });
    if (o.ticks) o.ticks.forEach(a => p.dot(R * Math.cos(a), R * Math.sin(a), 3.5, pal['grid-strong'], pal.stage, 1));
    /* the arc, or the radius-long pieces of it */
    const off = R * 1.0;
    if (o.copies) {
      const whole = Math.floor(th + 1e-9);
      for (let i = 0; i < whole; i++) {
        p.path(arcPts(off, i, i + 1, 24), { stroke: i % 2 ? alpha(pal.green, .55) : pal.green, width: 7 });
        const m = at(R * 1.16, i + .5); p.label(String(i + 1), m[0], m[1], { size: fs + 1, italic: false, color: pal.green });
      }
      for (let i = 0; i <= whole; i++) { const q = at(off, i); if (i <= th + 1e-9) p.dot(q[0], q[1], 4, pal.stage, pal.text, 1.5); }
      const rest = th - whole;
      if (rest > .02) {
        p.path(arcPts(off, whole, th, 24), { stroke: pal.yellow, width: 7 });
        if (rest > .1) { const m = at(R * 1.2, whole + rest / 2); p.label(nf(rest), m[0], m[1], { size: fs, italic: false, color: pal.yellow }); }
      }
    } else if (th > 1e-6) p.path(arcPts(off, 0, th, 80), { stroke: pal.yellow, width: 6 });
    /* the radius along the x-axis, and the moving radius */
    p.path([[0, 0], [R, 0]], { stroke: pal.green, width: 4 });
    if (o.rTxt) p.label(o.rTxt, R * .5, 0, { size: fs, italic: false, color: pal.green, dy: 17 });
    const P = at(R, th);
    p.path([[0, 0], P], { stroke: pal.text, width: 2.4 });
    /* the angle mark and its name */
    if (th > .12) {
      p.path(arcPts(R * .22, 0, th, 40), { stroke: pal.yellow, width: 3 });
      const m = at(R * (th > .5 ? .38 : .5), th / 2), tt = o.thTxt || 'θ';
      p.label(tt, m[0], m[1], { size: tt.length > 2 ? fs : fs + 3, italic: tt.length <= 2, color: pal.text, align: 'center' });
    }
    if (o.arcTxt && !o.copies && th > .12) { const m = at(R * 1.2, th / 2); p.label(o.arcTxt, m[0], m[1], { size: fs, italic: false, color: pal.yellow, align: 'center' }); }
    if (o.coord) {
      p.path([P, [P[0], 0]], { stroke: pal.red, width: 2, dash: [5, 5] });
      p.path([[0, 0], [P[0], 0]], { stroke: pal.green, width: 2, dash: [5, 5] });
      p.label('(cos θ, sin θ)', P[0], P[1], { size: fs, italic: false, color: pal.text, align: P[0] >= 0 ? 'left' : 'right', dx: P[0] >= 0 ? 14 : -14, dy: -14 });
    }
    if (o.key) {
      const y = -1.34 * R;
      p.path([[-R / 2, y], [R / 2, y]], { stroke: pal.green, width: 7 });
      p.path([[-R / 2, y - .08 * R], [-R / 2, y + .08 * R]], { stroke: pal.text, width: 2 });
      p.path([[R / 2, y - .08 * R], [R / 2, y + .08 * R]], { stroke: pal.text, width: 2 });
      p.label('= 1 radius (r)', R / 2, y, { size: fs, italic: false, color: pal.green, align: 'left', dx: 12 });
    }
    if (o.handle) p.dot(P[0], P[1], 9, pal.stage, pal.brass, 3.5);
    else p.dot(P[0], P[1], 5, pal.yellow, pal.stage, 1.5);
    if (o.cap) capText(p, o.cap);
  };

  /* ---------- practice problems (a fixed list) ---------- */
  const PROBS = [
    { name: 'Degrees to radians', ans: 2, fig: { R: 2, th: 5 * PI / 6, vs: 3, thTxt: '150°', wedge: true },
      q: 'Convert 150° to radians. Give the exact answer in terms of π.',
      ch: [
        ['150π', 'That multiplies by π and never divides by 180. A half turn is 180°, so 150° is a bit less than π, not 150π (about 471).'],
        ['6π/5', 'That is 180 ÷ 150 flipped over. Degrees to radians means multiply by π/180: 150 × π/180 = 150π/180.'],
        ['5π/6', 'Yes. Multiply by π/180: 150 × π/180 = 150π/180. Divide top and bottom by 30 to get 5π/6, about 2.62 radians. It is a little less than π, as 150° is a little less than 180°.'],
        ['3π/4', 'That is 135°, since 135 × π/180 = 3π/4. For 150°, divide 150 and 180 by 30: 5π/6.']] },
    { name: 'Radians to degrees', ans: 1, fig: { R: 2, th: 7 * PI / 4, vs: 3, thTxt: '7π/4', wedge: true },
      q: 'Convert 7π/4 radians to degrees.',
      ch: [
        ['45°', 'That is π/4 alone. 7π/4 is seven of those slices: 7 × 45 = 315.'],
        ['315°', 'Yes. Radians to degrees means multiply by 180/π: (7π/4) × 180/π = 7 × 45 = 315°. Check: 7π/4 is just under 2π (a full turn, 360°).'],
        ['1260°', 'That is 7 × 180. You forgot to divide by the 4 in 7π/4. Each π/4 slice is 45°, so 7 slices is 315°.'],
        ['252°', 'That is 7 × 36, as if the 4 were a 5. π/4 is 180° ÷ 4 = 45°, so 7π/4 is 7 × 45 = 315°.']] },
    { name: 'Arc length from a radian angle', ans: 3, fig: { R: 8, th: 3 * PI / 4, vs: 12, thTxt: '3π/4', arcTxt: 's = ?', rTxt: 'r = 8' },
      q: 'A circle has radius 8. An arc subtends an angle of 3π/4 radians at the center. What is the length of the arc?',
      ch: [
        ['1080', 'That treats 3π/4 as 135 degrees and multiplies 8 × 135. In s = rθ the angle must be in radians. Use θ = 3π/4 itself.'],
        ['3π/32', 'That divides the angle by the radius (θ ÷ r). The rule is s = r × θ, so multiply.'],
        ['about 10.4', 'That adds 8 + 3π/4 (about 8 + 2.36). Arc length is r times θ. It does not add.'],
        ['6π, about 18.85', 'Yes. s = rθ = 8 × 3π/4 = 24π/4 = 6π, about 18.85. The angle is 3π/4 ≈ 2.36 radii, and each radius is 8 long.']] },
    { name: 'Angle from arc and radius', ans: 0, fig: { R: 6, th: 1.5, vs: 9, thTxt: 'θ = ?', arcTxt: 's = 9', rTxt: 'r = 6' },
      q: 'On a circle of radius 6, an arc is 9 long. What is the angle at the center?',
      ch: [
        ['1.5 radians, about 85.9°', 'Yes. θ = s ÷ r = 9 ÷ 6 = 1.5 radians. In degrees, 1.5 × 180/π is about 85.9°. The arc is one and a half radius-lengths long.'],
        ['54 radians', 'That multiplies 9 × 6. The angle is the arc divided by the radius: 9 ÷ 6.'],
        ['0.67 radians', 'That is 6 ÷ 9, the radius divided by the arc. Angle = arc ÷ radius = 9 ÷ 6 = 1.5. The arc is longer than the radius, so the angle is more than 1 radian.'],
        ['1.5 degrees', 'The number 1.5 is right, but s ÷ r gives radians, not degrees. 1.5 radians is about 85.9°.']] },
    { name: 'Sector area', ans: 0, fig: { R: 10, th: .6, vs: 15, thTxt: '0.6 rad', rTxt: 'r = 10', wedge: true, disc: true },
      q: 'A sector has radius 10 and an angle of 0.6 radians. What is its area?',
      ch: [
        ['30', 'Yes. A = ½ r² θ = ½ × 100 × 0.6 = 30. The angle 0.6 is a fraction 0.6 ÷ 2π of the whole circle, and (0.6 ÷ 2π) × π × 100 = 30.'],
        ['60', 'That is r²θ = 100 × 0.6. You forgot the ½ in A = ½ r² θ.'],
        ['3', 'That is ½ × 10 × 0.6. The radius must be squared: r² = 100.'],
        ['about 314', 'That is πr², the area of the whole circle. A sector with a small angle is only a slice of it.']] },
    { name: 'How big is one radian?', ans: 2, fig: { R: 2, th: 1, vs: 3, thTxt: '1 rad', arcTxt: 'arc = r', rTxt: 'r', wedge: true },
      q: 'About how many degrees is one radian?',
      ch: [
        ['about 3.14°', 'That is π as a number of degrees. π is the number of radians in a half turn.'],
        ['about 0.0175°', 'That is π/180, the factor that goes from degrees to radians. Radians to degrees uses the inverse, 180/π.'],
        ['about 57.3°', 'Yes. One radian is 180/π degrees, about 57.3°. A half turn is π ≈ 3.14 radians, and 180 ÷ 3.14 ≈ 57.3.'],
        ['exactly 60°', 'Close, but 60° is π/3 = 1.047 radians. One radian is 180/π ≈ 57.3°, a little smaller.']] },
    { name: 'What is a radian?', ans: 1, fig: { R: 2, th: 1, vs: 3, thTxt: '1 rad', arcTxt: 'arc = r', rTxt: 'r', copies: true },
      q: 'Which statement about one radian is correct?',
      ch: [
        ['It is 1/360 of a full turn.', 'That describes one degree. A full turn is 2π radians, about 6.28 of them.'],
        ['It is the angle at the center whose arc is exactly as long as the radius, on a circle of any size.', 'Yes. On a bigger circle both the arc and the radius are longer, so the ratio s ÷ r is still 1. The angle does not change.'],
        ['It is the angle whose arc is exactly 1 cm long.', 'On a circle of radius 5 cm, a 1 cm arc is only 1 ÷ 5 = 0.2 radians. The arc must equal the radius, not a fixed length.'],
        ['It is about 57° on small circles and larger on big circles.', 'The angle is a ratio of two lengths, so it does not depend on the circle size. One radian is about 57.3° on every circle.']] },
    { name: 'Spot the trap', ans: 2, fig: { R: 3, th: PI / 3, vs: 4.5, thTxt: '60°', arcTxt: 's = ?', rTxt: 'r = 3', wedge: true },
      q: 'Sam wants the arc length for radius 3 and an angle of 60°. He writes s = r × θ = 3 × 60 = 180. What is wrong?',
      ch: [
        ['Nothing. The arc is 180.', 'A circle of radius 3 has circumference 2π × 3 ≈ 18.85 in total. An arc of 180 is impossible.'],
        ['He should divide: 60 ÷ 3 = 20.', 'The rule is multiply, and 60 is still in degrees. Dividing does not fix the unit.'],
        ['The angle must be in radians: 60° = π/3, so s = 3 × π/3 = π, about 3.14.', 'Yes. s = rθ only works when θ is in radians. The degree formula agrees: (60 ÷ 360) × 2π × 3 = π. A radian is a ratio of two lengths, so it has no length unit: the answer π is in the same unit as r.'],
        ['He should use 3 × 60 ÷ 360 = 0.5.', 'That mixes the two methods. With degrees, use (60 ÷ 360) × 2π × 3 = π. With radians, use 3 × π/3 = π. Either way the answer is π, not 0.5.']] }
  ];

  register({
    id: 'radians-the-circles-own-angle-unit', level: 'school',
    title: 'Radians: the circle’s own angle unit',
    blurb: 'Lay the radius along the edge of a circle like a piece of string, and see why a half turn is π radians.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 1.7;
      p.grid(.5, { axes: false });
      p.path(arcPts(1, 0, TAU, 90), { stroke: pal.blue, width: 2.4, close: true });
      p.path([[0, 0], ...arcPts(1, 0, 1, 20)], { fill: alpha(pal.yellow, .3), close: true });
      p.path(arcPts(1, 0, 1, 20), { stroke: pal.yellow, width: 4.5 });
      p.path([[0, 0], [1, 0]], { stroke: pal.green, width: 3.6 });
      p.path([[0, 0], [Math.cos(1), Math.sin(1)]], { stroke: pal.text, width: 1.8 });
      p.dot(Math.cos(1), Math.sin(1), 4.5, pal.yellow, pal.stage, 1.5);
    },
    hook: String.raw`A full turn is 360 degrees, a number somebody chose long ago. Is there a way to measure an angle that the circle itself chooses, one that does not depend on anyone's counting habits?`,
    steps: [
      { title: 'Lay the radius along the circle',
        text: String.raw`<p>The circle has its own ruler: the <b>radius</b> \(r\). Lay a string of length \(r\) along the edge. The angle it covers is <b>one radian</b>, about 57.3°. (The 360 of degrees is a historical choice, from ancient counting in sixties.)</p><p>Predict, then see: how many strings fit along the half circle?</p>`,
        set: { mode: 'wrap', R: 2, vs: 3, th: 1 } },
      { title: 'The angle is arc divided by radius',
        text: String.raw`<p>Angle in radians is <b>arc length divided by radius</b>: \(\theta = s/r\), so \(s = r\theta\).</p><p>Here \(r=2\) and the arc is as long as the radius, so \(\theta = 2\div 2 = 1\). Predict, then see: if the radius doubles and the arc still equals the radius, what happens to the angle? Then do the questions.</p>`,
        set: { mode: 'ratio', R: 2, vs: 5, th: 1 } },
      { title: 'Degrees and radians',
        text: String.raw`<p>A half turn is 180° and \(\pi\) radians. So <b>degrees \(\times\ \pi/180\) gives radians</b>, and <b>radians \(\times\ 180/\pi\) gives degrees</b>.</p><p>The marker is at 30°. Choose its radian form. Then fill the strip by moving the marker: drag it, press a strip cell, or use Previous and Next.</p>`,
        set: { mode: 'conv', ci: 1, R: 2, vs: 3, th: PI / 6 } },
      { title: 'Sector area, and the unit circle',
        text: String.raw`<p>A sector is the fraction \(\theta/2\pi\) of the whole disc, so \(A = \dfrac{\theta}{2\pi}\cdot \pi r^2 = \tfrac12 r^2\theta\).</p><p>Here \(r=4\) and \(\theta=\pi/2\): \(A=\tfrac12\cdot 16\cdot\tfrac{\pi}{2}=4\pi\), about 12.57. Press <b>r = 1</b>: the arc is \(\theta\) itself. That is the <a href="#/viz/the-unit-circle-and-trig-waves">unit circle</a>, the next lesson.</p>`,
        set: { mode: 'sector', R: 4, vs: 6, th: PI / 2 } }
    ],
    formal: String.raw`
      <h3>Why not 360?</h3>
      <p>The number 360 is a choice. It comes from ancient counting in sixties, and it is handy because it has many divisors. Nothing in the circle itself says 360. A radian lets the circle supply the unit.</p>
      <h3>One radian</h3>
      <p>Take a circle of radius \(r\). Cut a string of length \(r\). Lay it along the edge from a starting point. The angle at the center that it covers is <em>one radian</em>. Two strings cover two radians, and so on. In general
      \[ \theta = \frac{s}{r}, \qquad s = r\,\theta, \]
      where \(s\) is the arc length. Both \(s\) and \(r\) are lengths, so their ratio has no unit. That is why one radian is the same angle, about \(57.3^\circ\), on a small circle and on a huge one: doubling \(r\) doubles \(s\) and leaves \(s/r\) unchanged. "rad" is only a reminder of which unit you are using.</p>
      <h3>Why a half turn is \(\pi\)</h3>
      <p>The whole edge of a circle has length \(2\pi r\), which is exactly \(2\pi\) strings of length \(r\). So a full turn is \(2\pi\approx 6.28\) radians, and a half turn is \(\pi\approx 3.14\) radians. The number \(\pi\) appears here because it is defined as the circumference divided by the diameter.</p>
      <p>Another way to see \(s=r\theta\): the angle is the same fraction of a turn as the arc is of the circumference, \(\dfrac{\theta}{2\pi}=\dfrac{s}{2\pi r}\). Multiply both sides by \(2\pi r\) and you get \(s=r\theta\). This is the degree rule \(\dfrac{\text{angle}}{360}\times 2\pi r\) with the angle written in radians, so the two rules always agree. For \(r=3\) and \(60^\circ=\pi/3\): \(3\cdot\frac{\pi}{3}=\pi\) and \(\frac{60}{360}\cdot 2\pi\cdot 3=\pi\).</p>
      <h3>Converting</h3>
      <p>Since \(180^\circ=\pi\) radians,
      \[ \text{radians}=\text{degrees}\times\frac{\pi}{180},\qquad \text{degrees}=\text{radians}\times\frac{180}{\pi}. \]
      One radian is \(180/\pi\approx 57.3^\circ\). Common angles:</p>
      <p>\(0^\circ=0\), \(30^\circ=\frac{\pi}{6}\), \(45^\circ=\frac{\pi}{4}\), \(60^\circ=\frac{\pi}{3}\), \(90^\circ=\frac{\pi}{2}\), \(120^\circ=\frac{2\pi}{3}\), \(135^\circ=\frac{3\pi}{4}\), \(180^\circ=\pi\), \(270^\circ=\frac{3\pi}{2}\), \(360^\circ=2\pi\).</p>
      <p><em>Pizza rule.</em> The angle \(\pi/n\) is one slice of a pizza cut into \(2n\) equal slices. So \(\pi/3\) is one slice of six, and \(2\pi/3\) is two of those slices. For decimals, \(\pi/6\approx 0.524\).</p>
      <h3>Sector area</h3>
      <p>A sector with angle \(\theta\) is the fraction \(\theta/2\pi\) of the disc, whose area is \(\pi r^2\):
      \[ A=\frac{\theta}{2\pi}\cdot\pi r^2=\tfrac12 r^2\theta. \]
      A second way: bend the sector's arc flat into a triangle with base \(s=r\theta\) and height about \(r\). Its area is \(\tfrac12\cdot r\cdot s=\tfrac12 r^2\theta\), the same formula. Example: \(r=6\), \(\theta=\pi/3\) gives \(\tfrac12\cdot 36\cdot\frac{\pi}{3}=6\pi\). The degree rule \(\frac{60}{360}\cdot\pi\cdot 36=6\pi\) agrees.</p>
      <h3>The bridge to the unit circle</h3>
      <p>If \(r=1\), then \(s=\theta\) and \(A=\theta/2\). The angle is the distance walked around the circle. The point reached after walking \(\theta\) has coordinates \((\cos\theta,\sin\theta)\). That is where the unit circle lesson begins.</p>
      <p><b>Careful.</b> The formulas \(s=r\theta\) and \(A=\tfrac12 r^2\theta\) need \(\theta\) in radians. Using \(\theta=60\) for \(60^\circ\) gives a wrong answer by a factor of about 57.</p>`,
    check: [
      { q: 'Circle A has radius 3 m and circle B has radius 6 m. On each circle, you mark an arc that is exactly as long as that circle’s radius. What is true about the angles at the two centers?',
        choices: ['Circle B’s angle is bigger, because its arc is longer.', 'Both angles are the same size, one radian, about 57.3°.', 'Circle B’s angle is smaller, because its radius is bigger.', 'The angles are 3 radians for A and 6 radians for B.'], answer: 1,
        why: String.raw`The angle in radians is arc divided by radius, \(\theta=s/r\). On circle A it is \(3\div 3=1\), on circle B it is \(6\div 6=1\). Both are one radian, about \(57.3^\circ\). The arc on B is longer, but so is its radius, and the angle is a ratio of the two. It does not depend on the size of the circle.`,
        hint: String.raw`Use \(\theta=s/r\) on each circle separately.` },
      { q: 'A lampshade panel is a sector of a circle with radius 6 and central angle 120°. Convert the angle to radians first. What is the area of the sector?',
        choices: ['24π', '2160', '2π', '12π'], answer: 3,
        why: String.raw`First convert: \(120\times\frac{\pi}{180}=\frac{2\pi}{3}\). Then \(A=\tfrac12 r^2\theta=\tfrac12\cdot 36\cdot\frac{2\pi}{3}=12\pi\). Check with degrees: \(\frac{120}{360}\cdot\pi\cdot 36=12\pi\). The \(24\pi\) forgets the \(\tfrac12\). The 2160 uses 120 in place of radians. The \(2\pi\) forgets to square the radius.`,
        hint: String.raw`\(120^\circ=\frac{2\pi}{3}\) radians. Then use \(A=\tfrac12 r^2\theta\).` },
      { q: 'Ben converts 3π/2 radians to degrees. Step 1: multiply by π/180. Step 2: (3π/2) × (π/180) = 3π²/360 = π²/120, about 0.082. Which statement is true?',
        choices: ['Step 1 is wrong: from radians to degrees you multiply by 180/π, which gives 270°.', 'Step 2 is wrong: the arithmetic should give 3π/360.', 'Nothing is wrong: the angle is about 0.082°.', 'Step 1 is wrong: you should multiply by 360/π, which gives 540°.'], answer: 0,
        why: String.raw`The factor \(\pi/180\) goes from degrees to radians. From radians to degrees use \(180/\pi\): \(\frac{3\pi}{2}\cdot\frac{180}{\pi}=3\cdot 90=270^\circ\). Sanity check: \(3\pi/2\) is three half-turns of \(\pi/2\), and \(\pi\) is a half turn, so the answer must be bigger than \(180^\circ\), not a tiny number like 0.082.`,
        hint: String.raw`Which unit do you want to cancel? The \(\pi\) in the answer should cancel.` }
    ],
    links: { prereq: ['arc-length-and-sectors'], next: ['the-unit-circle-and-trig-waves'], related: ['area-of-a-circle', 'inscribed-angles', 'polar-form-and-roots-of-unity', 'special-right-triangles-and-trigonometry', 'scale-drawings-and-proportions'] },

    mount({ stage, controls: C }) {
      const st = { mode: 'wrap', practice: false, R: 2, th: 1, vs: 3, ci: 1, dec: false, filled: ANG.map(() => false), said: '' };
      let cancel = () => {};
      const panel = stage.nextElementSibling;
      const P = new Plane(stage, { span: 3 });

      /* ----- the panel helpers ----- */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const addTo = (...els) => panel.append(...els);
      const resets = [];
      /* a prediction: one choice, then the picture answers; options are [label, why, isRight] */
      const predict = (title, q, opts, onPick) => {
        let done = false;
        const fbk = h('div', { class: 'ctl readout', 'aria-live': 'polite' }), row = h('div', { class: 'ctl buttons' });
        const btns = opts.map((o, i) => mkBtn(o[0], () => {
          if (done) return; done = true;
          btns.forEach((b, j) => { b.disabled = true; if (j === i) b.classList.add('primary'); });
          fbk.innerHTML = (o[2] ? good('Yes.') : bad('Not quite.')) + ' ' + o[1]; onPick(i);
        }));
        row.append(...btns);
        addTo(h('p', { class: 'ctl-title' }, title), h('p', { class: 'hint' }, q), row, fbk);
        resets.push(() => { done = false; btns.forEach(b => { b.disabled = false; b.classList.remove('primary'); }); fbk.innerHTML = ''; });
      };
      /* a question you can retry: options are [label, why, isRight] */
      const ask = (title, q, opts) => {
        let done = false;
        const fbk = h('div', { class: 'ctl readout', 'aria-live': 'polite' }), row = h('div', { class: 'ctl buttons' });
        const btns = opts.map((o, i) => mkBtn(o[0], () => {
          if (done) return;
          if (o[2]) { done = true; btns.forEach(b => { b.disabled = true; }); btns[i].classList.add('primary'); fbk.innerHTML = good('Yes.') + ' ' + o[1]; }
          else { btns[i].disabled = true; fbk.innerHTML = bad('Not quite.') + ' ' + o[1] + ' Try another answer.'; }
        }));
        row.append(...btns);
        addTo(h('p', { class: 'ctl-title' }, title), h('p', { class: 'hint' }, q), row, fbk);
      };

      let ro, wrS, rS, tS, cdesc, cRow, strip, stripBtns = [], decT, cfb, srS, stS, startBtn, ptally, pq, pch, pfb, pnext;
      let prIdx = 0, prSolved = false, prFirst = 0, prDone = 0, prTried = false;

      /* ===== mode: wrap ===== */
      grp('wrap', () => {
        predict('Predict first', 'The string is as long as the radius. About how many strings fit along the half circle?',
          [['2', 'Two strings cover 2 radians, about 114.6°. The half circle is 180°, so there is room for more.', false],
           ['About 3.14', 'The half circle holds 3 whole strings and a bit left over, 0.14 of a string. That number is π, so a half turn is π radians.', true],
           ['4', 'Four strings would be 4 radians, about 229°. That is past the half circle, which is only about 3.14 strings long.', false],
           ['6', 'Six strings is about 344°, nearly the whole circle. The full circle holds about 6.28 strings, so the half circle holds about 3.14.', false]],
          () => { cancel(); cancel = animateTo(st, { th: PI }, 1800, sync); });
        C.title('Lay down the string');
        wrS = C.slider({ label: 'Strings laid along the arc (radians)', min: 0, max: 6.28, step: .01, value: st.th, format: v => nf(v), onInput: v => { cancel(); st.th = v; sync(); } });
        C.buttons([
          { label: '− 1 string', onClick: () => goTh(Math.max(0, Math.ceil(st.th - 1e-9) - 1)) },
          { label: '+ 1 string', onClick: () => goTh(Math.min(TAU, Math.floor(st.th + 1e-9) + 1)) },
          { label: 'Half turn', onClick: () => goTh(PI) },
          { label: 'Full turn', onClick: () => goTh(TAU) }]);
      });

      /* ===== mode: ratio ===== */
      grp('ratio', () => {
        predict('Predict first', 'The arc stays exactly as long as the radius. If the radius doubles from 2 to 4, the angle at the center will be:',
          [['twice as big', 'The arc also doubles, from 2 to 4. The angle is arc ÷ radius = 4 ÷ 4 = 1, the same as before.', false],
           ['half as big', 'Both lengths grow together. The angle is arc ÷ radius = 4 ÷ 4 = 1, not smaller.', false],
           ['the same, 1 radian', 'The arc doubles to 4 and the radius doubles to 4, so arc ÷ radius = 1 again. An angle in radians is a ratio of two lengths, so the size of the circle drops out.', true]],
          () => { cancel(); cancel = animateTo(st, { R: 4 }, 1400, sync); });
        C.title('Circle and angle');
        rS = C.slider({ label: 'Radius r', min: 1, max: 4, step: .5, value: st.R, format: v => nf(v, 1), onInput: v => { cancel(); st.R = v; sync(); } });
        tS = C.slider({ label: 'Angle θ in radians', min: .05, max: 6.28, step: .01, value: st.th, format: v => nf(v), onInput: v => { cancel(); st.th = v; sync(); } });
        C.buttons([
          { label: '1 radian', onClick: () => goTh(1) },
          { label: '60° = π/3', onClick: () => goTh(PI / 3) },
          { label: '2 radians', onClick: () => goTh(2) },
          { label: 'π, a half turn', onClick: () => goTh(PI) }]);
        ask('Your turn: find the arc', 'A circle has radius 5. An angle at the center is 2 radians. How long is the arc?',
          [['10', 'The rule is s = r × θ = 5 × 2 = 10. The angle says "2 radius-lengths", and each is 5 long.', true],
           ['2.5', 'That is r ÷ θ = 5 ÷ 2. The rule is s = r × θ, so multiply.', false],
           ['7', 'That adds 5 + 2. Arc length multiplies: s = r × θ.', false],
           ['31.4', 'That is 5 × 2 × π. The 2 radians already counts radius-lengths, so no extra π is needed.', false]]);
        ask('Your turn: the degree trap', 'Sam wants the arc for r = 3 and θ = 60°. He writes s = 3 × 60 = 180. What went wrong?',
          [['Nothing. The arc is 180.', 'The whole circle with r = 3 has circumference 2π × 3 ≈ 18.85. An arc of 180 cannot fit.', false],
           ['The formula s = rθ needs radians. 60° = π/3, so s = 3 × π/3 = π ≈ 3.14.', 'The degree rule agrees: (60 ÷ 360) × 2π × 3 = π.', true],
           ['He should divide: 60 ÷ 3 = 20.', 'The rule multiplies, and 60 is still degrees. Dividing does not change the unit.', false]]);
      });

      /* ===== mode: conv ===== */
      grp('conv', () => {
        C.title('Move the marker');
        cdesc = h('p', { class: 'hint' }); addTo(cdesc);
        C.buttons([{ label: '◀ Previous', onClick: () => goConv((st.ci + 9) % 10) }, { label: 'Next ▶', onClick: () => goConv((st.ci + 1) % 10) }]);
        C.title('Which radian form matches?');
        cRow = h('div', { class: 'ctl buttons' }); addTo(cRow);
        cfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); addTo(cfb);
        decT = C.toggle({ label: 'Show decimals instead of π forms', value: false, onChange: v => { st.dec = v; buildChoices(); sync(); } });
        C.title('The strip');
        strip = h('div', { style: 'display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:0 0 10px' });
        ANG.forEach((a, i) => {
          const b = h('button', { type: 'button', class: 'btn', style: 'padding:6px 2px;line-height:1.25;font-size:.85rem', onclick: () => goConv(i) });
          strip.append(b); stripBtns.push(b);
        });
        addTo(h('div', {}, strip));
      });

      /* ===== mode: sector ===== */
      grp('sector', () => {
        C.title('Sector');
        srS = C.slider({ label: 'Radius r', min: 1, max: 6, step: 1, value: st.R, format: v => String(v), onInput: v => { cancel(); st.R = v; st.vs = 1.5 * v; sync(); } });
        stS = C.slider({ label: 'Angle θ', min: 1, max: 24, step: 1, value: Math.round(st.th / (PI / 12)), format: v => `${v * 15}° = ${piStr(v, 12)} rad`, onInput: v => { cancel(); st.th = v * PI / 12; sync(); } });
        C.buttons([{ label: 'r = 1 (unit circle)', onClick: () => { cancel(); st.R = 1; st.vs = 1.5; sync(); } }, { label: 'r = 4', onClick: () => { cancel(); st.R = 4; st.vs = 6; sync(); } }]);
        ask('Your turn: sector area', 'A sector has radius 6 and angle π/3. What is its area? (Do not move anything: the numbers are in the question.)',
          [['6π, about 18.85', 'A = ½ r² θ = ½ × 36 × π/3 = 6π. The sector is 1/6 of the disc, and 36π ÷ 6 = 6π. The degree rule agrees: (60 ÷ 360) × π × 36 = 6π.', true],
           ['12π, about 37.70', 'That is r² θ = 36 × π/3. You forgot the ½ in A = ½ r² θ.', false],
           ['π, about 3.14', 'That is ½ × 6 × π/3. The radius must be squared, r² = 36.', false],
           ['36π, about 113.10', 'That is πr², the whole disc. A sector with angle π/3 is only one slice of it.', false]]);
      });
      grp('ro', () => { ro = C.readout(); C.hint('Drag the round handle on the circle, or use the sliders and buttons.'); });

      /* ===== practice ===== */
      C.title('Practice');
      C.hint('Eight short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); if (st.practice) { st.practice = false; sync(); } else { st.practice = true; loadProb(); sync(); } } }])[0];
      grp('practice', () => {
        const pwrap = h('div', { style: 'display:flex;flex-direction:column;gap:14px' });
        ptally = h('p', { class: 'ctl-title' });
        pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        pch = h('div', { class: 'ctl buttons' });
        pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pnext = mkBtn('Next problem', () => nextProb(), true);
        pwrap.append(ptally, pq, pch, pfb, h('div', { class: 'ctl buttons' }, pnext)); addTo(pwrap);
      });
      const tally = () => { ptally.textContent = `Problem ${Math.min(prIdx + 1, PROBS.length)} of ${PROBS.length} · done ${prDone} of ${PROBS.length} · right on the first try ${prFirst}`; };
      const loadProb = () => {
        const pr = PROBS[prIdx]; prSolved = false; prTried = false;
        pq.textContent = pr.q; pfb.innerHTML = ''; pch.replaceChildren(); pnext.disabled = true; pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        pr.ch.forEach((o, i) => pch.append(mkBtn(o[0], () => pickChoice(i))));
        tally();
      };
      const pickChoice = i => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        const btn = pch.children[i];
        if (i === pr.ans) {
          prSolved = true; if (!prTried) prFirst++; prDone++;
          Array.from(pch.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary');
          pfb.innerHTML = good('Right.') + ' ' + pr.ch[i][1].replace(/^Yes\.\s*/, ''); pnext.disabled = false;
        } else { prTried = true; btn.disabled = true; pfb.innerHTML = bad('Not quite.') + ' ' + pr.ch[i][1] + ' Try another answer.'; }
        tally(); sync();
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); sync(); return; }
        prIdx = PROBS.length; tally();
        pq.textContent = 'All eight problems are done.'; pch.replaceChildren(); pnext.disabled = true;
        pfb.innerHTML = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        pch.append(mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; loadProb(); sync(); }, true)); sync();
      };

      /* ----- moving the angle ----- */
      const goTh = v => { cancel(); cancel = animateTo(st, { th: v }, 600, sync); };
      const choicesFor = i => {
        const a = ANG[i], pos = (i * 3 + 1) % 4, list = a.bad.map(b => ({ p: b[0], q: b[1], ok: false }));
        list.splice(pos, 0, { p: a.p, q: a.q, ok: true }); return list;
      };
      const lab = (p, q) => (st.dec ? (p === 0 ? '0' : nf(p / q * PI, 3)) : piStr(p, q));
      const buildChoices = () => {
        cRow.replaceChildren();
        const i = st.ci, a = ANG[i];
        choicesFor(i).forEach(o => {
          const b = mkBtn(lab(o.p, o.q), () => {
            if (st.filled[i]) return;
            if (o.ok) {
              st.filled[i] = true; Array.from(cRow.children).forEach(x => { x.disabled = true; }); b.classList.add('primary');
              cfb.innerHTML = good('Yes.') + ' ' + rightNote(i); sync();
            } else {
              b.disabled = true; const dd = o.p / o.q * 180;
              cfb.innerHTML = bad('Not quite.') + ` ${piStr(o.p, o.q)} radians is ${nf(dd, dd < 100 ? 1 : 0)}°, not ${a.d}°. Multiply the degrees by π/180 and simplify: ${a.d} × π/180. Try another answer.`;
            }
          });
          cRow.append(b);
        });
        if (st.filled[i]) { Array.from(cRow.children).forEach(x => { x.disabled = true; if (x.textContent === lab(a.p, a.q)) x.classList.add('primary'); }); cfb.innerHTML = good('Filled in.') + ' ' + rightNote(i); }
        else cfb.innerHTML = '';
      };
      const rightNote = i => {
        const a = ANG[i];
        if (a.d === 0) return 'Zero degrees is zero radians: no arc at all.';
        return `${a.d} × π/180 = ${a.d}π/180 = ${piStr(a.p, a.q)} radians, about ${nf(RAD[i], 3)}. The arc is ${nf(RAD[i], 3)} radius-lengths long.`;
      };
      const goConv = i => {
        cancel(); st.ci = i; buildChoices(); cancel = animateTo(st, { th: RAD[i] }, 600, sync); sync();
      };
      const nearestAng = a => {
        let best = 0, bd = 9;
        for (let i = 0; i < 10; i++) { if (i === 9 && a < PI) continue; if (i === 0 && a >= PI) continue; const d = Math.abs(a - RAD[i]); if (d < bd) { bd = d; best = i; } }
        return best;
      };

      /* ----- the readout ----- */
      const updRo = () => {
        const { R, th, mode } = st, dg = deg(th), s = R * th; let t;
        if (mode === 'wrap') {
          const L = [`${kk('Strings laid down')} ${nf(th)}`, `${kk('Angle')} θ = ${pl(th, 'radian')} = ${nf(dg, 1)}°`, `${kk('Arc length')} s = ${nf(th)} × r`];
          if (near0(th - PI)) L.push('<b>Half turn: 3.14 strings, which is π. So 180° = π radians.</b>');
          else if (near0(th - TAU)) L.push('<b>Full turn: 6.28 strings, which is 2π. So 360° = 2π radians.</b>');
          else if (near0(th - 1)) L.push('<b>One string is one radian, about 57.3°.</b>');
          t = L.join('<br>');
        } else if (mode === 'ratio') {
          t = [`${kk('Radius')} r = ${nf(R, 1)}`, `${kk('Arc')} s = r × θ = ${nf(R, 1)} × ${nf(th)} = ${nf(s)}`,
            `${kk('Angle')} θ = s ÷ r = ${nf(s)} ÷ ${nf(R, 1)} = ${pl(th, 'radian')} = ${nf(dg, 1)}°`,
            `${kk('Degree rule')} (${nf(dg, 1)} ÷ 360) × 2π × ${nf(R, 1)} = ${nf(dg / 360 * TAU * R)}`,
            near0(th - 1) ? '<b>Arc equals radius: the angle is 1 radian on a circle of any radius.</b>' : 'Both rules give the same arc, because the angle is the same fraction of a turn.'].join('<br>');
        } else if (mode === 'conv') {
          const a = ANG[st.ci], done = st.filled.filter(Boolean).length, n = a.q;
          const L = [`${kk('Marker')} ${a.d}° = ${st.filled[st.ci] ? lab(a.p, a.q) + ' radians' : '? radians'}`, `${kk('Strip')} ${done} of 10 filled`];
          if (st.filled[st.ci] && a.p > 0) {
            L.push(n === 1 ? (a.p === 1 ? '<b>Pizza rule: π is half a pizza, one slice of a pizza cut into 2 slices.</b>' : '<b>Pizza rule: 2π is the whole pizza, 2 slices of π.</b>')
              : `<b>Pizza rule: π/${n} is one slice of a pizza cut into ${2 * n} slices.</b>` + (a.p === 1 ? '' : ` ${piStr(a.p, a.q)} is ${a.p} of those slices.`));
          }
          if (done === 10) L.push('Strip complete. 180° = π, so 30° = π/6 and 90° = π/2 are slices of a half turn.');
          t = L.join('<br>');
        } else {
          const k = Math.round(th / (PI / 12)), A = .5 * R * R * th;
          const L = [`${kk('Radius')} r = ${R}, ${kk('angle')} θ = ${piStr(k, 12)} = ${nf(th)} rad (${k * 15}°)`,
            `${kk('Fraction of disc')} θ ÷ 2π = ${fracStr(k, 24)}`, `${kk('Whole disc')} πr² = ${piStr(R * R, 1)} = ${nf(PI * R * R)}`,
            `<b>Sector A = ½ r² θ = ${piStr(R * R * k, 24)} = ${nf(A)}</b>`, `${kk('Degree rule')} (${k * 15} ÷ 360) × πr² = ${nf(k * 15 / 360 * PI * R * R)}`];
          if (R === 1) L.push(`<b>With r = 1: arc s = θ = ${nf(th)} and A = θ ÷ 2 = ${nf(th / 2)}. The point is (cos θ, sin θ).</b>`);
          t = L.join('<br>');
        }
        ro.innerHTML = t;
        cdesc.textContent = `Drag the marker, press a strip cell, or use Previous and Next. It is at ${ANG[st.ci].d}°.`;
      };

      /* ----- drawing ----- */
      const caption = () => {
        const { R, th, mode } = st;
        if (mode === 'wrap') return `${pl(th, 'string')} along the arc, so θ = ${pl(th, 'radian')}`;
        if (mode === 'ratio') return `r = ${nf(R, 1)}, arc s = ${nf(R * th)}, θ = s ÷ r = ${nf(th)} rad`;
        if (mode === 'conv') { const a = ANG[st.ci]; return `${a.d}° = ${st.filled[st.ci] ? lab(a.p, a.q) : '?'} radians`; }
        return `r = ${R}, θ = ${nf(st.th)} rad, area A = ½ r² θ = ${nf(.5 * R * R * st.th)}`;
      };
      P.onDraw = (c, p) => {
        const pal = p.pal;
        if (st.practice) {
          const pr = PROBS[Math.min(prIdx, PROBS.length - 1)];
          drawScene(p, Object.assign({ cap: `Problem ${Math.min(prIdx + 1, PROBS.length)} of ${PROBS.length}: ${pr.name}` }, pr.fig));
          return;
        }
        const { mode, R, th } = st, o = { R, th, vs: st.vs, cap: caption(), handle: true, rTxt: 'r' };
        if (mode === 'wrap') Object.assign(o, { copies: true, key: true, thTxt: 'θ' });
        else if (mode === 'ratio') Object.assign(o, { arcTxt: `s = ${nf(R * th)}`, rTxt: `r = ${nf(R, 1)}`, wedge: true });
        else if (mode === 'conv') {
          const a = ANG[st.ci];
          Object.assign(o, { ticks: RAD, thTxt: `${a.d}°`, wedge: true, slices: st.filled[st.ci] && a.p > 0 ? a.q : 0 });
        } else Object.assign(o, { wedge: true, disc: true, coord: R === 1, thTxt: 'θ', rTxt: `r = ${R}` });
        drawScene(p, o);
      };

      const sync = () => {
        const prac = st.practice, m = st.mode;
        vis(G.wrap, !prac && m === 'wrap'); vis(G.ratio, !prac && m === 'ratio'); vis(G.conv, !prac && m === 'conv'); vis(G.sector, !prac && m === 'sector');
        vis(G.ro, !prac); vis(G.practice, prac);
        wrS.set(st.th); rS.set(st.R); tS.set(st.th); srS.set(st.R); stS.set(Math.round(st.th / (PI / 12)));
        stripBtns.forEach((b, i) => {
          const a = ANG[i];
          b.innerHTML = `${a.d}°<br>${st.filled[i] ? lab(a.p, a.q) : '?'}`; b.classList.toggle('primary', i === st.ci);
          b.setAttribute('aria-label', `${a.d} degrees: ${st.filled[i] ? lab(a.p, a.q) + ' radians' : 'not filled yet'}`);
        });
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        P.draw(); updRo();
      };

      /* ----- dragging the point ----- */
      const magnets = [1, 2, 3, PI, 4, 5, 6, TAU, PI / 3, PI / 2];
      draggable(P, {
        hit: (px, py) => (!st.practice && near(P, st.R * Math.cos(st.th), st.R * Math.sin(st.th), px, py, 22) ? 'pt' : null),
        move: (_, x, y) => {
          cancel();
          let a = ((Math.atan2(y, x) % TAU) + TAU) % TAU;
          if (st.mode !== 'conv' && st.mode !== 'sector') { if (st.th < .6 && a > TAU - .6) a = 0; else if (st.th > TAU - .6 && a < .6) a = TAU; }
          if (st.mode === 'conv') {
            const i = nearestAng(a); if (i !== st.ci) { st.ci = i; buildChoices(); } st.th = RAD[i];
          } else if (st.mode === 'sector') st.th = clamp(Math.round(a / (PI / 12)), 1, 24) * PI / 12;
          else {
            a = snap(a, .02); magnets.forEach(m0 => { if (Math.abs(a - m0) < .06) a = m0; });
            st.th = st.mode === 'ratio' ? clamp(a, .05, TAU) : clamp(a, 0, TAU);
          }
          sync();
        }
      });

      const FLAGS = ['mode', 'ci'];
      const apply = (patch, immediate) => {
        cancel();
        const nums = {};
        for (const k in patch) { if (FLAGS.includes(k)) st[k] = patch[k]; else nums[k] = patch[k]; }
        if (patch.mode) resets.forEach(f => f());
        st.practice = false;
        if (patch.ci !== undefined) buildChoices();
        if (immediate) { Object.assign(st, nums); sync(); } else { sync(); cancel = animateTo(st, nums, 900, sync); }
      };
      buildChoices(); sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
