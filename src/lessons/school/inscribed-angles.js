/* =====================================================================
   SCHOOL — Inscribed angles
   ===================================================================== */
register({
  id: 'inscribed-angles', level: 'school',
  title: 'Inscribed angles',
  blurb: 'Slide a point around a circle: the angle it makes with a fixed chord never changes.',
  thumb(c, p) {
    const pal = p.pal, D = Math.PI / 180, pt = d => [Math.cos(d * D), Math.sin(d * D)]; p.cx = 0; p.cy = 0; p.span = 1.4;
    const A = pt(200), B = pt(340), Q = pt(80), ring = [];
    for (let i = 0; i <= 90; i++) ring.push(pt(i * 4));
    p.path(ring, { stroke: pal.blue, width: 2.2 });
    const arc = []; for (let d = 200; d <= 340; d += 4) arc.push(pt(d));
    p.path(arc, { stroke: pal.yellow, width: 4 });
    p.path([A, Q, B], { stroke: pal.green, width: 2.2 });
    p.path([A, [0, 0], B], { stroke: pal.red, width: 2 });
    for (const v of [A, B, Q]) p.dot(v[0], v[1], 4, pal.stage, pal.brass, 2);
  },
  hook: String.raw`Stand anywhere on a circle and look at two fixed points on it. Why does the angle between your two lines of sight not change as you walk?`,
  steps: [
    { title: 'A chord and a viewpoint',
      text: String.raw`<p>Points \(A\) and \(B\) cut off the <b>yellow arc</b>. From a point \(P\) elsewhere on the circle, the angle \(APB\) is an <b>inscribed angle</b> (green). The angle at the center \(O\) over the same arc is the <b>central angle</b> (red).</p><p>Right now the arc is \(140^\circ\) and the inscribed angle is \(70^\circ\): exactly half.</p>`,
      set: { a: 200, b: 340, p: 90 } },
    { title: 'Walk P around',
      text: String.raw`<p>Drag \(P\) along the circle, anywhere on the far side of \(AB\). The inscribed angle stays at \(70^\circ\).</p><p>Now drag \(P\) across to the other side of the chord. It sees the other arc, so the angle becomes \(180^\circ-70^\circ=110^\circ\).</p>`,
      set: { a: 200, b: 340, p: 20 } },
    { title: 'Always half the central angle',
      text: String.raw`<p>Move \(A\) so the arc grows to \(190^\circ\). The inscribed angle is now \(95^\circ\), still half. An arc bigger than a half circle gives an obtuse angle.</p><p>Try other arcs. The ratio never leaves \(2:1\).</p>`,
      set: { a: 150, b: 340, p: 20 } },
    { title: 'A diameter gives a right angle',
      text: String.raw`<p>Put \(A\) and \(B\) at opposite ends of a diameter. The central angle is a straight line, \(180^\circ\), so the inscribed angle is \(90^\circ\) wherever \(P\) is.</p><p>This is <b>Thales' theorem</b>: a triangle inscribed in a semicircle has a right angle.</p>`,
      set: { a: 160, b: 340, p: 20 } }
  ],
  formal: String.raw`
    <p><b>Inscribed angle theorem.</b> An inscribed angle is half the central angle that cuts off the same arc:
    \[ \angle APB = \tfrac12\,\angle AOB. \]
    Here \(\angle AOB\) is measured over the arc \(AB\) that does not contain \(P\).</p>
    <h3>Why</h3>
    <p>Suppose first that the center \(O\) lies on one side of the angle, say \(PB\) is a diameter. Triangle \(OPA\) has \(OP=OA\) (both are radii), so it is isosceles with equal base angles \(\angle OPA=\angle OAP=\alpha\). The central angle \(\angle AOB\) is an exterior angle of this triangle, so it equals \(\alpha+\alpha=2\alpha\). In every other position, draw the diameter through \(P\) and add or subtract two such cases.</p>
    <h3>Consequences</h3>
    <p>
    <b>Same arc, same angle.</b> All inscribed angles over the same arc are equal.<br>
    <b>Thales.</b> If \(AB\) is a diameter, the central angle is \(180^\circ\), so \(\angle APB=90^\circ\).<br>
    <b>Cyclic quadrilaterals.</b> If \(P\) and \(Q\) are on opposite sides of \(AB\), then \(\angle APB+\angle AQB=180^\circ\), because the two arcs they see add up to a full turn, \(360^\circ\).</p>`,
  check: [
    { q: String.raw`A central angle over an arc measures \(100^\circ\). What is an inscribed angle over the same arc?`,
      choices: ['25°', '50°', '100°', '200°'], answer: 1,
      why: String.raw`The inscribed angle is half the central angle: \(100^\circ/2=50^\circ\).`,
      hint: 'Which angle is bigger, the one at the center or the one on the circle?' },
    { q: String.raw`\(AB\) is a diameter of a circle and \(P\) is another point on the circle. What is \(\angle APB\)?`,
      choices: ['45°', '60°', '90°', 'It depends where P is'], answer: 2,
      why: String.raw`A diameter has central angle \(180^\circ\), so every inscribed angle over it is \(90^\circ\). This is Thales' theorem.`,
      hint: 'Half of a straight angle.' }
  ],
  links: { prereq: ['area-of-a-circle'], next: ['the-unit-circle-and-trig-waves'], related: ['pythagorean-theorem', 'similarity-and-scaling'] },

  mount({ stage, controls: C }) {
    const st = { a: 200, b: 340, p: 90 }, D = Math.PI / 180;
    let cancel = () => {};
    const P = new Plane(stage, { span: 1.55 });
    const pt = d => [Math.cos(d * D), Math.sin(d * D)], mod = x => ((x % 360) + 360) % 360;
    const wrap = x => Math.atan2(Math.sin(x), Math.cos(x));
    const geo = () => {
      const a = mod(st.a), b = mod(st.b), p = mod(st.p), dab = mod(b - a), pIn = mod(p - a) < dab;
      const A = pt(a), B = pt(b), Q = pt(p), ua = [A[0] - Q[0], A[1] - Q[1]], ub = [B[0] - Q[0], B[1] - Q[1]];
      const m = Math.hypot(...ua) * Math.hypot(...ub);
      return { A, B, Q, ua, ub, start: pIn ? b : a, len: pIn ? 360 - dab : dab,
        ins: m < 1e-6 ? null : Math.acos(clamp((ua[0] * ub[0] + ua[1] * ub[1]) / m, -1, 1)) / D };
    };

    P.onDraw = (c, p) => {
      const pal = p.pal, g = geo(), sc = p.scale, X0 = p.X(0), Y0 = p.Y(0), fs = clamp(sc * .15, 15, 22);
      p.grid(.5, { axes: false });
      const ring = []; for (let i = 0; i <= 180; i++) ring.push(pt(i * 2));
      p.path(ring, { stroke: pal.blue, width: 3 });
      c.beginPath(); c.arc(X0, Y0, sc, -g.start * D, -(g.start + g.len) * D, true);
      c.strokeStyle = pal.yellow; c.lineWidth = 7; c.lineCap = 'round'; c.stroke();
      p.path([g.A, [0, 0], g.B], { stroke: alpha(pal.red, .85), width: 2.5 });
      p.path([g.A, g.Q, g.B], { stroke: pal.green, width: 3.5 });
      c.beginPath(); c.arc(X0, Y0, .28 * sc, -g.start * D, -(g.start + g.len) * D, true);
      c.strokeStyle = pal.red; c.lineWidth = 3; c.stroke();
      const mid = (g.start + g.len / 2) * D;
      p.label(Math.round(g.len) + '°', .52 * Math.cos(mid), .52 * Math.sin(mid), { size: fs, italic: false, color: pal.red });
      if (g.ins != null) {
        const a1 = Math.atan2(g.ua[1], g.ua[0]), a2 = Math.atan2(g.ub[1], g.ub[0]), d = wrap(a2 - a1), s = d > 0 ? a1 : a2;
        c.beginPath(); c.arc(p.X(g.Q[0]), p.Y(g.Q[1]), .2 * sc, -s, -(s + Math.abs(d)), true);
        c.strokeStyle = pal.green; c.lineWidth = 3; c.stroke();
        const la = Math.hypot(...g.ua), lb = Math.hypot(...g.ub), bx = g.ua[0] / la + g.ub[0] / lb, by = g.ua[1] / la + g.ub[1] / lb, bm = Math.hypot(bx, by) || 1;
        p.label(Math.round(g.ins) + '°', g.Q[0] + bx / bm * .42, g.Q[1] + by / bm * .42, { size: fs, italic: false, color: pal.green });
      }
      p.dot(0, 0, 4, pal.text); p.label('O', 0, 0, { size: fs + 3, dx: 12, dy: 14 });
      [['A', g.A], ['B', g.B], ['P', g.Q]].forEach(([n, v]) => {
        p.dot(v[0], v[1], 9, pal.stage, pal.brass, 3.5);
        p.label(n, v[0] * 1.16, v[1] * 1.16, { size: fs + 4 });
      });
    };

    const upd = () => {
      const g = geo();
      ro.innerHTML = `<span class="k">Central angle</span> ${Math.round(g.len)}°<br>` +
        `<span class="k">Inscribed angle APB</span> ${g.ins == null ? '–' : g.ins.toFixed(1) + '°'}<br><span class="k">Central ÷ inscribed</span> ${g.ins ? (g.len / g.ins).toFixed(2) : '–'}`;
    };
    const sync = () => { aS.set(mod(st.a)); bS.set(mod(st.b)); pS.set(mod(st.p)); P.draw(); upd(); };
    const edit = key => v => { cancel(); st[key] = v; P.requestDraw(); upd(); };

    C.title('Positions on the circle');
    const aS = C.slider({ label: 'Point A', min: 0, max: 360, step: 1, value: mod(st.a), format: v => Math.round(v) + '°', onInput: edit('a') });
    const bS = C.slider({ label: 'Point B', min: 0, max: 360, step: 1, value: mod(st.b), format: v => Math.round(v) + '°', onInput: edit('b') });
    const pS = C.slider({ label: 'Point P', min: 0, max: 360, step: 1, value: mod(st.p), format: v => Math.round(v) + '°', onInput: edit('p') });
    const ro = C.readout(); upd();
    C.hint('Drag A, B or P around the circle.');

    draggable(P, {
      hit: (px, py) => {
        let best = null, bd = 20;
        for (const k of ['a', 'b', 'p']) { const v = pt(st[k]), d = Math.hypot(P.X(v[0]) - px, P.Y(v[1]) - py); if (d < bd) { bd = d; best = k; } }
        return best;
      },
      move: (k, x, y) => { cancel(); st[k] = mod(Math.round(Math.atan2(y, x) / D)); sync(); }
    });

    const apply = (patch, immediate) => {
      cancel();
      if (immediate) { Object.assign(st, patch); sync(); } else cancel = animateTo(st, patch, 900, sync);
    };
    return { destroy: () => { cancel(); P.destroy(); }, apply };
  }
});
