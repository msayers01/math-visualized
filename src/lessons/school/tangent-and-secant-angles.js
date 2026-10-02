/* =====================================================================
   SCHOOL — Tangent and secant angles
   ===================================================================== */
{
  const D = Math.PI / 180;
  const FONT = '"Hanken Grotesk","Helvetica Neue",Arial,sans-serif';
  const pt = (d, r = 1) => [r * Math.cos(d * D), r * Math.sin(d * D)];
  const mod = x => ((x % 360) + 360) % 360;
  const r1 = x => Math.round(x * 10) / 10;
  const f1 = x => String(r1(x)).replace('-', '−');
  const dg = x => f1(x) + '°';
  const rotp = (q, a) => { const c = Math.cos(a * D), s = Math.sin(a * D); return [q[0] * c - q[1] * s, q[0] * s + q[1] * c]; };
  const inter = (p1, p2, p3, p4) => {
    const d1 = [p2[0] - p1[0], p2[1] - p1[1]], d2 = [p4[0] - p3[0], p4[1] - p3[1]];
    const den = d1[0] * d2[1] - d1[1] * d2[0], t = ((p3[0] - p1[0]) * d2[1] - (p3[1] - p1[1]) * d2[0]) / den;
    return [p1[0] + t * d1[0], p1[1] + t * d1[1]];
  };
  const angAt = (v, a, b) => {
    const u = [a[0] - v[0], a[1] - v[1]], w = [b[0] - v[0], b[1] - v[1]];
    return Math.acos(clamp((u[0] * w[0] + u[1] * w[1]) / (Math.hypot(...u) * Math.hypot(...w)), -1, 1)) / D;
  };
  /* exact square root text: sqrtTxt(75) = "5√3" */
  const sqrtTxt = n => {
    if (n <= 0) return '0';
    let k = 1; for (let i = 2; i * i <= n; i++) if (n % (i * i) === 0) k = i;
    const m = n / (k * k);
    if (m === 1) return String(k);
    return (k === 1 ? '' : k) + '√' + m;
  };

  /* ---------- the geometry of each situation (unit circle, centre O at the origin) ---------- */
  /* outside vertex. kind ss: two secants, st: secant and tangent, tt: two tangents.
     N = near arc, F = far arc. The figure is turned so that P sits on the positive x-axis. */
  function outGeo(kind, N, F) {
    if (kind === 'tt') {
      F = 360 - N;
      const A = pt(N / 2), B = pt(-N / 2), P = [1 / Math.cos(N / 2 * D), 0];
      return { kind, N, F, P, lines: [[P, A], [P, B]], names: [['A', A], ['B', B]], near: [-N / 2, N / 2], far: [N / 2, 360 - N / 2], r1: A, r2: B, tp: [A, B], ang: angAt(P, A, B) };
    }
    if (kind === 'ss') {
      const A = pt(N / 2), C = pt(-N / 2), B = pt(180 - F / 2), Dd = pt(180 + F / 2), P = inter(A, B, C, Dd);
      return { kind, N, F, P, lines: [[P, A, B], [P, C, Dd]], names: [['A', A], ['B', B], ['C', C], ['D', Dd]], near: [-N / 2, N / 2], far: [180 - F / 2, 180 + F / 2], ang: angAt(P, A, C) };
    }
    const M = 360 - N - F, T = pt(90), A = pt(90 - N), B = pt(90 - N - M), P0 = inter(T, [T[0] + 1, T[1]], A, B);
    const rho = Math.atan2(P0[1], P0[0]) / D, R = q => rotp(q, -rho), P = R(P0);
    const T2 = R(T), A2 = R(A), B2 = R(B);
    return { kind, N, F, P, lines: [[P, A2, B2], [P, T2]], names: [['A', A2], ['B', B2], ['T', T2]], near: [90 - N - rho, 90 - rho], far: [90 - rho, 90 + F - rho], ang: angAt(P, A2, T2) };
  }
  const outValid = (kind, N, F) => {
    if (N < 10) return false;
    if (kind === 'tt') return N <= 140;
    if (F - N < 40) return false;
    if (N + F > (kind === 'ss' ? 340 : 350)) return false;
    return Math.hypot(...outGeo(kind, N, F).P) <= 3.7;
  };
  const inGeo = (a0, w, x, y) => {
    const A = pt(a0), B = pt(a0 + w), C = pt(a0 + w + x), Dd = pt(a0 + w + x + y), X = inter(A, C, B, Dd);
    return { A, B, C, D: Dd, X, z: 360 - w - x - y };
  };
  const A0 = 210;

  const KIND_NAME = { ss: 'two secants', st: 'a secant and a tangent', tt: 'two tangents' };

  /* ---------- the five cases ---------- */
  const FA = 'θ = ½ · arc', FB = 'θ = ½ (arc + arc)', FC = 'θ = ½ (far arc − near arc)', FD = 'θ = far arc − near arc', FE = 'θ = 180° − near arc';
  const CASES = [
    { key: 'on', short: 'On the circle', name: 'Vertex ON the circle (tangent and chord)', words: 'half the intercepted arc', sym: FA, ex: '½ · 140° = 70°', set: { view: 'on', al: 140, g: 100 } },
    { key: 'in', short: 'Inside', name: 'Vertex INSIDE (two chords)', words: 'half the SUM of its arc and the arc of its vertical angle', sym: FB, ex: '½ (100° + 60°) = 80°', set: { view: 'in', w: 100, x: 80, y: 60, which: 0 } },
    { key: 'ss', short: 'Outside, 2 secants', name: 'Vertex OUTSIDE, two secants', words: 'half the DIFFERENCE: far arc minus near arc', sym: FC, ex: '½ (200° − 60°) = 70°', set: { view: 'out', kind: 'ss', N: 60, F: 200 } },
    { key: 'st', short: 'Outside, secant + tangent', name: 'Vertex OUTSIDE, a secant and a tangent', words: 'half the DIFFERENCE: far arc minus near arc', sym: FC, ex: '½ (200° − 60°) = 70°', set: { view: 'out', kind: 'st', N: 60, F: 200 } },
    { key: 'tt', short: 'Outside, 2 tangents', name: 'Vertex OUTSIDE, two tangents', words: 'half the difference, and since the two arcs add to 360°, also 180° minus the near arc', sym: FC + '  =  ' + FE.replace('θ = ', ''), ex: '½ (250° − 110°) = 70°, and 180° − 110° = 70°', set: { view: 'out', kind: 'tt', N: 110 } }
  ];
  const MATCH = [
    { c: 2, q: 'The diagram shows two lines from a point outside the circle. Both lines cut through the circle. Which formula gives the angle θ at P?',
      ch: [[FB, 'Adding the arcs is for a vertex inside the circle. At an outside vertex the angle opens onto two arcs, a near one and a far one, so you subtract.'],
        [FC, 'Two secants from an outside point: far arc minus near arc, then half. Here ½ (200° − 60°) = 70°.'],
        [FD, 'The difference is right but the half is missing. Every one of these angles is half of an arc measure.'],
        [FE, '180° minus the near arc only works for two tangents, where the arcs add to 360°. With secants they do not.']], ans: 1 },
    { c: 0, q: 'The diagram shows a tangent line and a chord meeting at a point ON the circle. Which formula gives the angle θ at T?',
      ch: [[FC, 'Far minus near is for a vertex outside the circle. Here the vertex is on the circle and only one arc sits inside the angle.'],
        [FB, 'Adding two arcs is for a vertex inside. Here only one arc is inside the angle.'],
        [FD, 'There is only one arc here, and the half is missing too.'],
        [FA, 'One arc is inside the angle, and θ is half of it: ½ · 140° = 70°. It is the same as an inscribed angle on that arc.']], ans: 3 },
    { c: 4, q: 'The diagram shows two tangents from a point outside the circle. Which formula is a shortcut that works for two tangents only?',
      ch: [[FA, 'Half of one arc is for a vertex on the circle. At P the angle looks at two arcs, near and far.'],
        [FB, 'Adding is for an inside vertex. It would give ½ (110° + 250°) = 180°, which is the straight line, not θ.'],
        [FE, 'The tangents are perpendicular to the radii, so the quadrilateral O A P B has two right angles: θ + 110° + 90° + 90° = 360°, so θ = 70°. The rule far minus near, halved, gives the same 70°.'],
        [FD, 'The half is missing, and this is not a tangent-only shortcut.']], ans: 2 },
    { c: 1, q: 'The diagram shows two chords crossing at a point INSIDE the circle. Which formula gives the angle θ at X?',
      ch: [[FA, 'That uses one arc only. The angle and its vertical angle each look at an arc, and both count.'],
        [FC, 'Far minus near is for a vertex outside. Inside, the two arcs are side by side, so they are added.'],
        [FB, 'Add the arc inside the angle (100°) and the arc inside its vertical angle (60°), then halve: 80°.'],
        [FD, 'Wrong operation, and the half is missing.']], ans: 2 },
    { c: 3, q: 'The diagram shows a secant and a tangent from a point outside the circle. Which formula gives the angle θ at P?',
      ch: [[FC, 'The tangent touches at T, the secant crosses at A and B. The far arc is TB, the near arc is TA: ½ (200° − 60°) = 70°.'],
        [FA, 'Half of one arc is for a vertex on the circle. P is outside, so two arcs matter.'],
        [FB, 'Adding is for an inside vertex. Outside, you subtract.'],
        [FE, '180° minus the near arc only works for two tangents. A secant and a tangent do not make a quadrilateral with two right angles.']], ans: 0 }
  ];

  /* ---------- practice problems (fixed) ---------- */
  const PR = [
    { fig: { view: 'on', al: 140, g: 100, hide: ['ang', 'q'] },
      q: 'A tangent at T and a chord TB make an angle at T. The arc TB inside that angle is 140°. How big is the tangent-chord angle at T?', ans: 1,
      ch: [['140°', 'That is the whole arc. A tangent-chord angle is half of the arc it cuts off.'],
        ['70°', 'A tangent-chord angle equals half its intercepted arc: 140° ÷ 2 = 70°. It is the same as an inscribed angle on that arc.'],
        ['40°', 'That is 180° − 140°. The angle is half the arc, not the supplement.'],
        ['35°', 'That halves twice. Half of 140° is 70°.']] },
    { fig: { view: 'in', w: 80, x: 100, y: 40, which: 0, hide: ['ang'] },
      q: 'Chords AC and BD cross at X inside the circle (A, B, C, D in order around the circle). Arc AB is 80° and arc CD is 40°. What is angle AXB?', ans: 3,
      ch: [['20°', 'That is half the difference. Inside the circle the two arcs are added.'],
        ['120°', 'That is the full sum. The angle is half of it.'],
        ['40°', 'That is half of arc AB only. Both arcs count: the one inside AXB and the one inside its vertical angle CXD.'],
        ['60°', 'Half the sum of the two arcs: ½ (80° + 40°) = 60°.']] },
    { fig: { view: 'out', kind: 'ss', N: 60, F: 200, hide: ['ang'] },
      q: 'Two secants from a point P cut off a far arc of 200° and a near arc of 60°. What is the angle at P?', ans: 0,
      ch: [['70°', 'Half the difference: ½ (200° − 60°) = ½ · 140° = 70°.'],
        ['130°', 'That is half the sum. For a vertex outside the circle, subtract.'],
        ['140°', 'That is the difference, but the half is missing.'],
        ['260°', 'That is the sum of the arcs. An outside angle uses half the difference.']] },
    { fig: { view: 'out', kind: 'tt', N: 110, hide: ['ang', 'far'] },
      q: 'Two tangents from a point P touch the circle at A and B. The minor arc AB, the near arc, is 110°. What is the angle at P?', ans: 2,
      ch: [['110°', 'That is the arc itself. The angle at P and the arc are different things.'],
        ['55°', 'That is half of the near arc. An outside angle uses far arc minus near arc.'],
        ['70°', 'The far arc is 360° − 110° = 250°, so ½ (250° − 110°) = 70°. Check with the quadrilateral O A P B: 90° + 90° + 110° + 70° = 360°.'],
        ['125°', 'That is half of the far arc (250° ÷ 2). Subtract the near arc first.']] },
    { fig: { view: 'out', kind: 'ss', N: 80, F: 150, over: { near: 'near arc = ?' } },
      q: 'Two secants meet at P. The far arc is 150° and the angle at P is 35°. How big is the near arc?', ans: 1,
      ch: [['220°', 'That adds 70° to 150°. The near arc is smaller than the far arc, so subtract.'],
        ['80°', '35 = ½ (150 − near), so 150 − near = 70 and near = 80°. Check: ½ (150° − 80°) = 35°.'],
        ['115°', 'That subtracts 35° but forgets the half. The difference of the arcs is 2 × 35° = 70°.'],
        ['185°', 'That adds 35° to 150°. Subtract the doubled angle instead.']] },
    { fig: { view: 'out', kind: 'ss', N: 50, F: 130, over: { far: 'far (6x+10)°', near: 'near (2x+10)°', ang: 'θ = 40°' } },
      q: 'Two secants from P. The far arc is (6x + 10)° and the near arc is (2x + 10)°. The angle at P is 40°. Solve for x.', ans: 0,
      ch: [['x = 20', '½ ((6x + 10) − (2x + 10)) = ½ · 4x = 2x, and 2x = 40 gives x = 20. Then far = 130°, near = 50°, and ½ (130° − 50°) = 40°.'],
        ['x = 10', 'That forgets the half: 4x = 40. The angle is half the difference, so 2x = 40.'],
        ['x = 7.5', 'That adds the arcs: ½ (8x + 20) = 40 gives 7.5. An outside angle uses the difference.'],
        ['x = 40', 'That is the angle. The equation is 2x = 40, so x = 20.']] },
    { fig: { view: 'len', op: 10, rr: 6, hide: ['tl'] },
      q: 'A circle has radius 6 cm and its center O. A point P is 10 cm from O. A tangent from P touches the circle at A. How long is PA?', ans: 3,
      ch: [['4 cm', 'That is 10 − 6. The sides of a right triangle do not subtract like that. Use Pythagoras.'],
        ['16 cm', 'That is 10 + 6. Use Pythagoras instead.'],
        ['√136 ≈ 11.66 cm', 'That adds the squares, 10² + 6². But OP = 10 is the hypotenuse, since the angle at A is 90°.'],
        ['8 cm', 'The radius OA meets the tangent at 90°, so PA² + 6² = 10², PA² = 64 and PA = 8 cm.']] },
    { fig: { view: 'out', kind: 'ss', N: 80, F: 220, hide: ['ang'] },
      q: 'Two secants from P cut off a far arc of 220° and a near arc of 80°. Mo writes: (220° + 80°) ÷ 2 = 150°. What is the angle at P?', ans: 2,
      ch: [['150°. Mo is right', 'Mo added the arcs. Adding is for a vertex inside the circle. At an outside vertex you subtract.'],
        ['140°', 'That is the difference with no half. The angle is half of 220° − 80°.'],
        ['70°', 'Outside angles use half the difference: ½ (220° − 80°) = 70°. Mo should have subtracted.'],
        ['300°', 'That is the full sum. It cannot be the angle: the two lines would have to open wider than a half turn.']] }
  ];

  const place = (correct, wrongs, key) => { const ch = wrongs.slice(0, 3), i = ((key % 4) + 4) % 4; ch.splice(i, 0, correct); return { ch, ans: i }; };

  register({
    id: 'tangent-and-secant-angles', level: 'school',
    title: 'Tangent and secant angles',
    blurb: 'An angle on, inside or outside a circle is half the sum or half the difference of the arcs it cuts off.',
    thumb(c, p) {
      const pal = p.pal; p.cx = .7; p.cy = 0; p.span = 1.6;
      const ring = []; for (let i = 0; i <= 90; i++) ring.push(pt(i * 4));
      const G = outGeo('ss', 60, 200), P = G.P;
      const arc = (a0, a1, r) => { const o = []; for (let i = 0; i <= 30; i++) o.push(pt(a0 + (a1 - a0) * i / 30, r)); return o; };
      p.path(ring, { stroke: pal.blue, width: 2.4 });
      p.path(arc(180 - 100, 180 + 100, 1), { stroke: pal.yellow, width: 6 });
      p.path(arc(-30, 30, 1), { stroke: pal.violet, width: 6 });
      p.path(G.lines[0], { stroke: pal.green, width: 2.4 }); p.path(G.lines[1], { stroke: pal.green, width: 2.4 });
      p.dot(P[0], P[1], 4.5, pal.stage, pal.brass, 2.2);
    },
    hook: String.raw`You stand beside a round lake and look at its two ends. Why does the angle between your two lines of sight tell you how much of the shore you can see, and how can you work it out without measuring the angle?`,
    steps: [
      { title: 'A tangent touches once',
        text: String.raw`<p>A line that touches a circle at exactly one point is a <b>tangent</b>. The circle has radius 5 and the line is 3 away from the center, so it cuts the circle twice. Use the <b>Predict</b> box, then slide the line out.</p><p>The tangent sits at distance \(d=r=5\), and the radius to the touching point meets it at a right angle. For two tangents from one point, open <b>Two tangents from a point</b> in Look at.</p>`,
        set: { view: 'tan', dist: 3, tilt: 40, predict: true } },
      { title: 'Vertex on the circle',
        text: String.raw`<p>A tangent and a chord meet at \(T\) on the circle. The chord \(TB\) cuts off an <b>arc</b> of \(140^\circ\). Predict the angle at \(T\), then let \(Q\) slide toward \(T\).</p><p>The angle \(TQB\) is an inscribed angle, always half the arc: \(70^\circ\). As \(Q\) reaches \(T\), line \(QT\) becomes the tangent, so the tangent-chord angle is also \(70^\circ\).</p>`,
        set: { view: 'on', al: 140, g: 100, predict: true } },
      { title: 'Vertex inside: add',
        text: String.raw`<p>Two chords cross at \(X\) inside the circle. Angle \(AXB\) cuts off arc \(AB=100^\circ\), and its vertical angle \(CXD\) cuts off arc \(CD=60^\circ\).</p><p>The angle is half the <b>sum</b> of the two arcs: \(\tfrac12(100+60)=80^\circ\). Change the arcs with the sliders: the measured angle and the half sum always agree.</p>`,
        set: { view: 'in', w: 100, x: 80, y: 60, which: 0 } },
      { title: 'Vertex outside: subtract',
        text: String.raw`<p>Two secants meet at \(P\) outside the circle. The <b>far arc</b> is \(200^\circ\) and the <b>near arc</b> is \(60^\circ\). The angle is half the <b>difference</b>: \(\tfrac12(200-60)=70^\circ\).</p><p>Drag \(P\) outward or raise the near arc. The near arc grows toward the far arc, so the angle shrinks. Switch the kind to tangents to see \(180^\circ\) minus the near arc.</p>`,
        set: { view: 'out', kind: 'ss', N: 60, F: 200 } }
    ],
    formal: String.raw`
      <p>Two lines through a point meet a circle. Where the point is, on, inside or outside the circle, decides the rule. Every angle below is measured in degrees, and every <b>arc</b> is the part of the circle cut off by the two lines, measured by its central angle. The rules come from one fact: an inscribed angle is half its arc (see Inscribed angles).</p>
      <h3>Tangent facts</h3>
      <p>A <b>tangent</b> meets the circle in exactly one point \(T\). Every other point of the line lies outside the circle, so is farther than \(r\) from the center \(O\). So \(T\) is the point of the line closest to \(O\). The closest point of a line to \(O\) is where the perpendicular from \(O\) meets it, so \(OT\perp\) tangent.</p>
      <p>From an outside point \(P\), two tangents touch at \(A\) and \(B\). The triangles \(OAP\) and \(OBP\) have right angles at \(A\) and \(B\), so by Pythagoras
      \[ PA=PB=\sqrt{OP^2-r^2}. \]
      Example: \(r=5\) and \(OP=13\) give \(PA=\sqrt{169-25}=12\).</p>
      <h3>Vertex on the circle (proved)</h3>
      <p>Let the tangent touch at \(T\), and let chord \(TB\) cut off an arc of \(\alpha\) degrees (central angle \(\angle TOB=\alpha\)). Triangle \(OTB\) has two radii \(OT=OB\), so it is isosceles with base angles \(\tfrac12(180-\alpha)=90-\tfrac{\alpha}{2}\). The radius \(OT\) is perpendicular to the tangent, so the angle between the tangent and the chord is
      \[ 90-\left(90-\tfrac{\alpha}{2}\right)=\tfrac{\alpha}{2}. \]
      This holds for \(\alpha\) up to \(180^\circ\). For a larger arc, the tangent-chord angle on the other side uses the other arc \(360-\alpha\), and the angle on this side is its supplement: \(180-\tfrac{360-\alpha}{2}=\tfrac{\alpha}{2}\) again.</p>
      <h3>Vertex inside (proved)</h3>
      <p>Chords \(AC\) and \(BD\) cross at \(X\), and the arcs are \(AB=w\) and \(CD=y\). In triangle \(BXC\), the angle \(\angle AXB\) is an exterior angle at \(X\) (because \(A\), \(X\), \(C\) are in a line). An exterior angle equals the sum of the two remote interior angles: \(\angle XBC+\angle XCB\). These are inscribed angles, \(\angle DBC=\tfrac{y}{2}\) over arc \(CD\) and \(\angle ACB=\tfrac{w}{2}\) over arc \(AB\). So
      \[ \angle AXB=\tfrac12(w+y). \]</p>
      <h3>Vertex outside (proved)</h3>
      <p><b>Two secants.</b> The secants run \(P,A,B\) and \(P,C,D\), with \(A\) and \(C\) the near points. Draw chord \(AD\). In triangle \(PAD\), the angle \(\angle DAB\) is exterior at \(A\), so \(\angle DAB=\angle P+\angle ADP\). By the inscribed angle theorem \(\angle DAB=\tfrac{\text{far}}{2}\) and \(\angle ADP=\angle ADC=\tfrac{\text{near}}{2}\). So
      \[ \angle P=\tfrac12(\text{far}-\text{near}). \]
      <b>Secant and tangent.</b> Let the tangent touch at \(T\) and the secant cross at \(A\), \(B\). In triangle \(PAT\), \(\angle TAB=\angle P+\angle ATP\). Here \(\angle TAB\) is inscribed over arc \(TB\) (far), and \(\angle ATP\) is a tangent-chord angle over arc \(TA\) (near). The same subtraction follows.</p>
      <p><b>Two tangents.</b> Both arcs go from \(A\) to \(B\) and add to \(360^\circ\), so far \(=360-\) near and the rule gives \(\angle P=180-\text{near}\). The quadrilateral \(OAPB\) agrees: its angles are \(90+90+\text{near}+\angle P=360\).</p>
      <h3>The five cases</h3>
      <p>On the circle: \(\theta=\tfrac12\,\text{arc}\). Inside: \(\theta=\tfrac12(\text{arc}_1+\text{arc}_2)\). Outside, whatever the lines are: \(\theta=\tfrac12(\text{far}-\text{near})\). As the vertex moves from inside to outside, the arc added becomes an arc subtracted. The sliders on the canvas only check these formulas on examples.</p>
      <h3>Algebra and a real situation</h3>
      <p>If the far arc is \((6x+10)^\circ\), the near arc is \((2x+10)^\circ\) and the angle is \(40^\circ\), then \(\tfrac12\big((6x+10)-(2x+10)\big)=40\), so \(2x=40\) and \(x=20\). The arcs are \(130^\circ\) and \(50^\circ\).</p>
      <p>You see a round lake from a point \(P\) with your two lines of sight just grazing the shore, so they are tangents. If the near shore is \(110^\circ\) of the circle, the lake looks \(180-110=70^\circ\) wide from \(P\). Walking away makes the near arc larger and the viewing angle smaller.</p>
      <h3>What the lesson shows, and what it proves</h3>
      <p>Proved above: every formula, using the inscribed angle theorem. Shown by examples only: the measured angles on the canvas, which agree with the formulas on the values you tried.</p>`,
    check: [
      { q: 'Which statement about angles and circles is true?',
        choices: ['An angle with its vertex outside the circle is half the sum of the two arcs it cuts off',
          'Two chords crossing inside a circle make an angle equal to half the sum of the arcs cut off by the angle and by its vertical angle',
          'A tangent-chord angle equals the whole arc it cuts off',
          'Two tangents drawn from the same outside point can have different lengths'], answer: 1,
        why: String.raw`Inside the circle the two arcs are added and halved. An outside angle uses half the <em>difference</em>. A tangent-chord angle is <em>half</em> its arc. The two tangents from one point are always equal: \(PA=PB=\sqrt{OP^2-r^2}\).`,
        hint: 'Inside means add, outside means subtract. What about the half?' },
      { q: 'Two secants meet at a point P outside a circle. The far arc is (4x + 30)° and the near arc is (x + 15)°. The angle at P is 30°. How big is the far arc?',
        choices: ['50°', '15°', '60°', '90°'], answer: 3,
        why: String.raw`The angle is half the difference: \(\tfrac12\big((4x+30)-(x+15)\big)=\tfrac12(3x+15)=30\). So \(3x+15=60\), \(3x=45\) and \(x=15\). The far arc is \(4\cdot15+30=90^\circ\) (the near arc is \(30^\circ\), and \(\tfrac12(90-30)=30\)). The answer 50 comes from forgetting the half. The answer 15 is \(x\) itself, and 60 is only \(4x\).`,
        hint: 'Write half of (far arc minus near arc) equal to 30, solve for x, then put x back into the far arc.' },
      { q: 'Two chords AC and BD cross at X inside a circle (A, B, C, D in order around the circle). Arc AB is 50° and arc CD is 70°. A student writes: angle AXB = (70° − 50°) ÷ 2 = 10°. What is the error?',
        choices: ['There is no error: 10° is correct', 'The student should use the full sum, 50° + 70° = 120°', 'The student should add the arcs, not subtract: (50° + 70°) ÷ 2 = 60°', 'The student should use only the larger arc: 70° ÷ 2 = 35°'], answer: 2,
        why: String.raw`Subtracting is for a vertex <em>outside</em> the circle. For a vertex inside, the angle and its vertical angle look at two arcs, and both count: \(\tfrac12(50+70)=60^\circ\). The full sum, 120, forgets the half. Using only one arc ignores the arc of the vertical angle.`,
        hint: 'Where is the vertex: inside or outside? That decides add or subtract.' }
    ],
    links: { prereq: ['inscribed-angles', 'angle-relationships-and-parallel-lines'], related: ['arc-length-and-sectors', 'angles-in-triangles-and-polygons', 'pythagorean-theorem', 'similar-triangles-aa-sas-sss', 'area-of-a-circle', 'distance-and-the-pythagorean-theorem'] },

    mount({ stage, controls: C }) {
      const st = {
        view: 'tan', kind: 'ss', rr: 5,
        dist: 3, tilt: 40, op: 13, al: 140, g: 100, w: 100, x: 80, y: 60, which: 0, N: 60, F: 200,
        hide: [], over: {}, radii: false, cmp: 2, story: -1, note: ''
      };
      let cancel = () => {};
      const P = new Plane(stage, { span: 1.7 });
      const prac = { on: false, i: 0, right: 0, done: 0, bad: false, snap: null };
      let hnd = [];

      const curMode = () => st.view === 'out' || st.view === 'story' ? st.kind : st.view === 'cmp' ? CASES[st.cmp].key : st.view;
      const hid = k => st.hide.includes(k);

      /* ---------- drawing ---------- */
      P.onDraw = (c, p) => {
        const pal = p.pal, mode = curMode(), w = p.w, hh = p.h;
        let G = null;
        if (mode === 'ss' || mode === 'st' || mode === 'tt') {
          G = outGeo(mode, st.N, st.F);
          if (!isFinite(G.P[0]) || Math.hypot(...G.P) > 9) G = null;
        }
        if (!G && (mode === 'ss' || mode === 'st' || mode === 'tt')) return;
        /* frame */
        let bx0 = -1.62, bx1 = 1.62, by0 = -1.55, by1 = 1.55;
        if (mode === 'len') { bx1 = Math.max(1.62, st.op / st.rr + .7); bx0 = -1.5; }
        if (G) { bx0 = -1.5; bx1 = Math.max(1.62, G.P[0] + 1.0); by0 = -1.5; by1 = 1.5; }
        const mn = Math.min(w, hh);
        p.span = Math.max((bx1 - bx0) * mn / (2 * w), (by1 - by0) * mn / (2 * hh)); p.cx = (bx0 + bx1) / 2; p.cy = (by0 + by1) / 2;
        const sc = p.scale, fs = clamp(sc * .11, 12.5, 17), X0 = p.X(0), Y0 = p.Y(0);
        const txt = (s, wx, wy, o = {}) => {
          c.font = `${o.wt || 700} ${o.size || fs}px ${FONT}`; c.textAlign = o.al || 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 4; c.strokeStyle = pal.stage;
          const px = p.X(wx) + (o.dx || 0), py = p.Y(wy) + (o.dy || 0); c.strokeText(s, px, py); c.fillStyle = o.col || pal.text; c.fillText(s, px, py);
        };
        const arcS = (a0, a1, r, col, lw, cx = 0, cy = 0) => {
          c.beginPath(); c.arc(p.X(cx), p.Y(cy), r * sc, -a0 * D, -a1 * D, true); c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'butt'; c.stroke();
        };
        const wedge = (V, a, b, r, col) => {
          const a1 = Math.atan2(a[1] - V[1], a[0] - V[0]) / D, a2 = Math.atan2(b[1] - V[1], b[0] - V[0]) / D;
          let d = ((a2 - a1 + 540) % 360) - 180, s = d > 0 ? a1 : a2; d = Math.abs(d);
          c.beginPath(); c.moveTo(p.X(V[0]), p.Y(V[1])); c.arc(p.X(V[0]), p.Y(V[1]), r * sc, -s * D, -(s + d) * D, true); c.closePath();
          c.fillStyle = alpha(col, .22); c.fill();
          c.beginPath(); c.arc(p.X(V[0]), p.Y(V[1]), r * sc, -s * D, -(s + d) * D, true); c.strokeStyle = col; c.lineWidth = 3; c.stroke();
          return (s + d / 2);
        };
        const rightMark = (V, a, b, s) => {
          const u = [a[0] - V[0], a[1] - V[1]], v = [b[0] - V[0], b[1] - V[1]], lu = Math.hypot(...u), lv = Math.hypot(...v);
          const e1 = [u[0] / lu * s, u[1] / lu * s], e2 = [v[0] / lv * s, v[1] / lv * s];
          p.path([[V[0] + e1[0], V[1] + e1[1]], [V[0] + e1[0] + e2[0], V[1] + e1[1] + e2[1]], [V[0] + e2[0], V[1] + e2[1]]], { stroke: pal.text, width: 1.8 });
        };
        const L = (a, b, col, wd, dash) => p.path([a, b], { stroke: col, width: wd, dash });
        const ring = () => { c.beginPath(); c.arc(X0, Y0, sc, 0, TAU); c.fillStyle = alpha(pal.muted, .07); c.fill(); c.strokeStyle = pal.blue; c.lineWidth = 3; c.stroke(); };
        const dot = (q, name, dr, o = {}) => { p.dot(q[0], q[1], o.r || 5.5, pal.stage, pal.text, 2.5); if (name) txt(name, q[0] + dr[0], q[1] + dr[1], { size: fs + 1 }); };
        const hdl = (q, id) => { if (prac.on) return; p.dot(q[0], q[1], 10, pal.stage, pal.brass, 3.5); hnd.push({ id, x: p.X(q[0]), y: p.Y(q[1]) }); };
        const outLab = (s, ang, r, o = {}) => {
          const cs = Math.cos(ang * D), sn = Math.sin(ang * D), al = cs > .35 ? 'left' : cs < -.35 ? 'right' : 'center';
          txt(s, r * cs, r * sn, Object.assign({ al, dx: al === 'left' ? 4 : al === 'right' ? -4 : 0, dy: Math.abs(cs) <= .35 ? (sn > 0 ? -9 : 9) : 0 }, o));
        };
        const lab = (key, pre, val) => (st.over[key] !== undefined ? st.over[key] : pre + (hid(key) ? '?' : val));
        hnd = [];

        if (mode === 'tan') {
          const rr = st.rr, d = st.dist / rr, u = pt(st.tilt), v = [-u[1], u[0]], Fp = [d * u[0], d * u[1]], tang = Math.abs(d - 1) < 1e-9;
          ring();
          const a = [Fp[0] - 4 * v[0], Fp[1] - 4 * v[1]], b = [Fp[0] + 4 * v[0], Fp[1] + 4 * v[1]];
          L(a, b, pal.text, 2.6);
          if (d < 1) { const s = Math.sqrt(1 - d * d); [-1, 1].forEach(k => p.dot(Fp[0] + k * s * v[0], Fp[1] + k * s * v[1], 5.5, pal.yellow, pal.text, 2)); }
          if (tang) p.dot(u[0], u[1], 6.5, pal.yellow, pal.text, 2);
          if (!tang) L([0, 0], Fp, pal.red, 3.5);
          L([0, 0], u, pal.green, 3.5);
          rightMark(Fp, [0, 0], [Fp[0] + v[0], Fp[1] + v[1]], .1);
          dot([0, 0], 'O', [-.12, -.12], { r: 4 });
          const tr = d < .7 ? .88 : .35, mid = [u[0] * tr, u[1] * tr], nrm = [-u[1], u[0]];
          txt(`r = ${rr}`, mid[0] + nrm[0] * .2, mid[1] + nrm[1] * .2, { col: pal.green, size: fs + .5 });
          if (!tang) txt(`d = ${f1(st.dist)}`, Fp[0] * .5 - nrm[0] * .2, Fp[1] * .5 - nrm[1] * .2, { col: pal.red, size: fs + .5 });
          txt(tang ? 'd = r: tangent, 1 point' : d < 1 ? 'd < r: 2 points' : 'd > r: 0 points', 0, -1.38, { size: fs + 1, col: tang ? pal.green : pal.text });
          if (tang) txt('90°', u[0] * .78 - nrm[0] * .17, u[1] * .78 - nrm[1] * .17, { size: fs - .5, col: pal.text });
          hdl(Fp, 'dist');
        } else if (mode === 'len') {
          const rr = st.rr, opw = st.op / rr, Pp = [opw, 0], t = Math.acos(1 / opw) / D, A = pt(t), B = pt(-t), O = [0, 0], tl = Math.sqrt(st.op * st.op - rr * rr);
          ring();
          L(O, Pp, pal.muted, 2, [6, 5]); L(Pp, A, pal.red, 3.5); L(Pp, B, pal.red, 3.5); L(O, A, pal.green, 3); L(O, B, pal.green, 3);
          rightMark(A, O, Pp, .09); rightMark(B, O, Pp, .09);
          dot(O, 'O', [-.12, -.12], { r: 4 }); dot(A, 'A', [.0, .14]); dot(B, 'B', [.0, -.14]);
          const tlT = Number.isInteger(tl) ? String(tl) : sqrtTxt(st.op * st.op - rr * rr);
          txt(lab('tl', 'PA = ', tlT), (Pp[0] + A[0]) / 2 + .06, (Pp[1] + A[1]) / 2 + .13, { col: pal.red });
          txt(lab('tl', 'PB = ', tlT), (Pp[0] + B[0]) / 2 + .06, (Pp[1] + B[1]) / 2 - .13, { col: pal.red });
          txt(`r = ${rr}`, A[0] * .5 - .1, A[1] * .5 + .02, { col: pal.green, size: fs - .5, al: 'right' });
          txt(`OP = ${st.op}`, opw / 2, -.1, { col: pal.muted, size: fs - .5 });
          txt('P', opw, 0, { size: fs + 1, dy: -20 });
          p.dot(Pp[0], Pp[1], 5.5, pal.stage, pal.text, 2.5);
          hdl(Pp, 'op');
        } else if (mode === 'on') {
          const T = pt(270), B = pt(270 + st.al), Q = pt(270 - st.g), tc = angAt(T, [T[0] + 1, T[1]], B), ins = angAt(Q, T, B);
          ring();
          arcS(270, 270 + st.al, 1, pal.yellow, 8);
          L([-1.55, -1], [1.55, -1], pal.text, 2.6);
          L(T, B, pal.green, 3.2); if (!hid('q')) { L(Q, T, pal.red, 2.4); L(Q, B, pal.red, 2.4); }
          const am = 270 + st.al / 2;
          outLab(lab('arc', 'arc ', st.al + '°'), am, 1.1, { col: pal.text, size: fs + .5 });
          const showTC = !hid('ang');
          if (showTC) { const m = wedge(T, [T[0] + 1, T[1]], B, .24, pal.green); txt(`at T: ${dg(tc)}`, T[0] + .5 * Math.cos(m * D) + .12, T[1] + .5 * Math.sin(m * D) + .06, { col: pal.green, size: fs + .5 }); }
          else txt('at T: ?', T[0] + .35, T[1] + .22, { col: pal.green, size: fs + .5 });
          if (!hid('q')) { const m2 = wedge(Q, T, B, .17, pal.red);
          if (!hid('ang')) txt(`at Q: ${dg(ins)}`, Q[0] + .55 * Math.cos(m2 * D), Q[1] + .55 * Math.sin(m2 * D), { col: pal.red, size: fs + .5 }); dot(Q, 'Q', [Q[0] * .16, Q[1] * .16]); }
          dot(T, 'T', [0, -.15]); dot(B, 'B', [B[0] * .16, B[1] * .16]);
          txt('tangent', -1.18, -1.12, { size: fs - .5, col: pal.muted });
          hdl(B, 'al'); if (!hid('q')) hdl(Q, 'g');
        } else if (mode === 'in') {
          const I = inGeo(A0, st.w, st.x, st.y), pairs = st.which === 0 ? [[A0, st.w], [A0 + st.w + st.x, st.y]] : [[A0 + st.w, st.x], [A0 + st.w + st.x + st.y, I.z]];
          const other = st.which === 0 ? [[A0 + st.w, st.x], [A0 + st.w + st.x + st.y, I.z]] : [[A0, st.w], [A0 + st.w + st.x, st.y]];
          ring();
          other.forEach(([s, l]) => arcS(s, s + l, 1, alpha(pal.violet, .85), 5));
          pairs.forEach(([s, l]) => arcS(s, s + l, 1, pal.yellow, 8));
          L(I.A, I.C, pal.blue, 2.6); L(I.B, I.D, pal.blue, 2.6);
          const V = I.X, a1 = st.which === 0 ? [I.A, I.B, I.C, I.D] : [I.B, I.C, I.D, I.A];
          const m = wedge(V, a1[0], a1[1], .2, pal.green), mv = wedge(V, a1[2], a1[3], .2, pal.green);
          const ang = angAt(V, a1[0], a1[1]);
          txt(lab('ang', 'θ = ', dg(ang)), V[0] + .42 * Math.cos(m * D), V[1] + .42 * Math.sin(m * D), { col: pal.green, size: fs + .5 });
          txt(lab('ang', 'θ = ', dg(ang)), V[0] + .42 * Math.cos(mv * D), V[1] + .42 * Math.sin(mv * D), { col: pal.green, size: fs + .5 });
          const nm = ['A', 'B', 'C', 'D'], aa = [A0, A0 + st.w, A0 + st.w + st.x, A0 + st.w + st.x + st.y], ln = [['AB', st.w], ['BC', st.x], ['CD', st.y], ['DA', I.z]];
          [I.A, I.B, I.C, I.D].forEach((q, i) => dot(q, nm[i], [q[0] * .14, q[1] * .14]));
          dot(V, 'X', [.0, -.14], { r: 4 });
          ln.forEach(([n, v], i) => { const mid = aa[i] + v / 2; outLab(`${n} ${v}°`, mid, 1.2, { size: fs - .5, col: pairs.some(q => Math.abs(q[0] - aa[i]) < 1e-6) ? pal.text : pal.muted }); });
          hdl(I.B, 'B'); hdl(I.C, 'C'); hdl(I.D, 'D');
        } else if (G) {
          const Pp = G.P;
          ring();
          arcS(G.near[0], G.near[1], 1, pal.violet, 9);
          arcS(G.far[0], G.far[1], 1, pal.yellow, 8);
          G.lines.forEach(l => { L(l[0], l[l.length - 1], pal.blue, 2.8); });
          if (mode === 'tt' && st.radii) {
            L([0, 0], G.r1, pal.green, 2.4); L([0, 0], G.r2, pal.green, 2.4);
            rightMark(G.r1, [0, 0], Pp, .09); rightMark(G.r2, [0, 0], Pp, .09);
            dot([0, 0], 'O', [-.14, -.14], { r: 4 }); L([0, 0], Pp, pal.muted, 1.8, [6, 5]);
          }
          const m = wedge(Pp, G.lines[0][1], G.lines[1][1], clamp(.55 / Math.max(1, Math.hypot(...Pp)) + .12, .2, .4), pal.green);
          txt(lab('ang', 'θ = ', dg(G.ang)), Pp[0] + .1, Pp[1] + .0, { col: pal.green, size: fs + 1, al: 'left', dx: 8 });
          txt('P', Pp[0], Pp[1] - .02, { size: fs + 1, dy: 20 });
          p.dot(Pp[0], Pp[1], 5.5, pal.stage, pal.text, 2.5);
          G.names.forEach(([n, q]) => dot(q, n, [q[0] * .15, q[1] * .15]));
          const nm = (G.near[0] + G.near[1]) / 2, fm = (G.far[0] + G.far[1]) / 2;
          txt(lab('near', 'near ', dg(G.N)), .62 * Math.cos(nm * D), .62 * Math.sin(nm * D), { col: pal.text, size: fs - .5 });
          txt(lab('far', 'far ', dg(G.F)), .5 * Math.cos(fm * D), .5 * Math.sin(fm * D), { col: pal.text, size: fs - .5 });
          hdl(Pp, 'P');
        }
      };

      /* ---------- the little multiple-choice box (predictions, matching, stories, practice) ---------- */
      const probe = C.readout(), host = probe.parentNode; probe.remove();
      const track = (arr, fn) => { const n = host.children.length, res = fn(); Array.from(host.children).slice(n).forEach(e => arr.push(e)); return res; };
      const show = (els, on) => els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const GR = { tan: [], len: [], on: [], in: [], out: [], cmp: [], story: [], pred: [], ro: [] };

      const quiz = () => {
        const box = h('div', { class: 'ctl', style: 'display:flex;flex-direction:column;gap:8px' });
        const qEl = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' }), chEl = h('div', { class: 'ctl buttons', style: 'flex-direction:column;align-items:stretch' });
        const fbEl = h('p', { style: 'margin:0;font-size:.92rem;line-height:1.5', 'aria-live': 'polite' }), nxEl = h('div', { class: 'ctl buttons' });
        box.append(qEl, chEl, fbEl, nxEl);
        const o = { box, qEl, chEl, fbEl, nxEl, cur: null,
          ask(q, ch, ans, cb) {
            o.cur = { q, ch, ans, cb, solved: false, tried: false };
            qEl.innerHTML = q; fbEl.innerHTML = ''; chEl.innerHTML = ''; nxEl.innerHTML = '';
            ch.forEach(([t], i) => chEl.append(h('button', { type: 'button', class: 'btn', style: 'justify-content:flex-start;text-align:left;height:auto;min-height:42px;padding:8px 14px', onclick: ev => o.pick(i, ev.currentTarget) }, String.fromCharCode(65 + i) + '. ' + t)));
          },
          pick(i, btn) {
            const cu = o.cur; if (!cu || cu.solved) return;
            if (i === cu.ans) {
              cu.solved = true; btn.style.borderColor = 'var(--green)'; btn.style.color = 'var(--green)';
              fbEl.innerHTML = `<b>Yes.</b> ${cu.ch[i][1]}`; Array.from(chEl.children).forEach(b => { b.disabled = true; });
              cu.cb && cu.cb.onRight && cu.cb.onRight(cu.tried);
            } else {
              cu.tried = true; btn.disabled = true; btn.style.borderColor = 'var(--red)'; btn.style.color = 'var(--red)';
              fbEl.innerHTML = `<b>Not quite.</b> ${cu.ch[i][1]} Try another choice.`;
            }
          },
          clear() { o.cur = null; qEl.innerHTML = ''; fbEl.innerHTML = ''; chEl.innerHTML = ''; nxEl.innerHTML = ''; }
        };
        return o;
      };

      /* ---------- controls ---------- */
      const VIEWS = [['tan', '1. A tangent and its radius'], ['len', '2. Two tangents from a point'], ['on', '3. Vertex on the circle'], ['in', '4. Vertex inside the circle'], ['out', '5. Vertex outside the circle'], ['cmp', '6. Compare the five cases'], ['story', '7. Real situations']];
      const sel = C.select({ label: 'Look at', options: VIEWS.map(([value, label]) => ({ value, label })), value: st.view, onChange: v => { cancel(); setView(v); sync(); } });
      const manual = () => { cancel(); st.note = ''; };
      const edit = fn => { manual(); fn(); sync(); };

      /* tangent line */
      const distS = track(GR.tan, () => C.slider({ label: 'Distance d from O to the line', min: 1, max: 8, step: .5, value: st.dist, format: v => f1(v) + ' (r = ' + st.rr + ')', onInput: v => edit(() => { st.dist = v; }) }));
      const tiltS = track(GR.tan, () => C.slider({ label: 'Turn the line around the circle', min: 0, max: 355, step: 5, value: st.tilt, format: v => Math.round(v) + '°', onInput: v => edit(() => { st.tilt = v; }) }));
      track(GR.tan, () => C.hint('Drag the ring on the line, or use the sliders. The line touches the circle once only when d equals r.'));
      /* tangent lengths */
      const opS = track(GR.len, () => C.slider({ label: 'Distance OP from the center to P', min: 6, max: 13, step: 1, value: st.op, format: v => Math.round(v) + ' (r = ' + st.rr + ')', onInput: v => edit(() => { st.op = Math.round(v); }) }));
      track(GR.len, () => C.hint('Drag P along the dashed line, or use the slider. Both tangent lengths always stay equal.'));
      /* on the circle */
      const alS = track(GR.on, () => C.slider({ label: 'Arc TB (the chord moves)', min: 20, max: 340, step: 5, value: st.al, format: v => Math.round(v) + '°', onInput: v => edit(() => { st.al = Math.round(v); st.g = Math.min(st.g, 350 - st.al); }) }));
      const gS = track(GR.on, () => C.slider({ label: 'Point Q: degrees away from T', min: 2, max: 330, step: 1, value: st.g, format: v => Math.round(v) + '°', onInput: v => edit(() => { st.g = clamp(Math.round(v), 2, 350 - st.al); }) }));
      const onB = track(GR.on, () => C.buttons([
        { label: 'Slide Q to T', onClick: () => { cancel(); cancel = animateTo(st, { g: 2 }, 1300, sync); } },
        { label: 'Slide Q back', onClick: () => { cancel(); cancel = animateTo(st, { g: Math.min(100, 350 - st.al) }, 900, sync); } }]));
      track(GR.on, () => C.hint('Drag B or Q around the circle, or use the sliders and buttons.'));
      /* inside */
      const whichS = track(GR.in, () => C.select({ label: 'Measure angle', options: [{ value: '0', label: 'AXB (arcs AB and CD)' }, { value: '1', label: 'BXC (arcs BC and DA)' }], value: '0', onChange: v => edit(() => { st.which = +v; }) }));
      const arcSl = (key, label) => track(GR.in, () => C.slider({ label, min: 20, max: 300, step: 5, value: st[key], format: v => Math.round(v) + '°', onInput: v => edit(() => {
        const o = { w: st.w, x: st.x, y: st.y }, others = ['w', 'x', 'y'].filter(k => k !== key).reduce((s, k) => s + o[k], 0);
        st[key] = Math.min(Math.round(v), 340 - others);
      }) }));
      const wS = arcSl('w', 'Arc AB'), xS = arcSl('x', 'Arc BC'), yS = arcSl('y', 'Arc CD');
      track(GR.in, () => C.hint('The fourth arc, DA, is whatever is left to make 360°. Drag B, C or D, or use the sliders. Arcs snap to 5°.'));
      /* outside */
      const kindS = track(GR.out, () => C.select({ label: 'The two lines are', options: [{ value: 'ss', label: 'Two secants' }, { value: 'st', label: 'A secant and a tangent' }, { value: 'tt', label: 'Two tangents' }], value: st.kind, onChange: v => { cancel(); setKind(v); sync(); } }));
      const NS = track(GR.out, () => C.slider({ label: 'Near arc', min: 10, max: 170, step: 5, value: st.N, format: v => Math.round(v) + '°', onInput: v => edit(() => { setOut('N', Math.round(v)); }) }));
      const FS = track(GR.out, () => C.slider({ label: 'Far arc', min: 50, max: 330, step: 5, value: st.F, format: v => Math.round(v) + '°', onInput: v => edit(() => { setOut('F', Math.round(v)); }) }));
      const fsEl = GR.out[GR.out.length - 1];
      const radT = track(GR.out, () => C.toggle({ label: 'Show radii and right angles (tangents)', value: st.radii, onChange: b => { st.radii = b; sync(); } }));
      track(GR.out, () => C.hint('Drag P outward, or raise the near arc. Moving P away from the circle makes the near arc grow toward the far arc. Limits keep the picture on screen.'));
      function setOut(key, v) {
        const old = st[key], dir = old > v ? 5 : -5;
        const ok = t => key === 'N' ? outValid(st.kind, t, st.F) : outValid(st.kind, st.N, t);
        for (let t = v; dir > 0 ? t <= old : t >= old; t += dir) if (ok(t)) { st[key] = t; return; }
        st[key] = old;
      }

      /* ---------- predict, then see ---------- */
      const pq = track(GR.pred, () => { const q = quiz(); host.append(q.box); return q; });
      GR.pred.push(pq.box);
      const PRED = {
        tan: { q: 'Predict. The circle has radius 5 and the line is 3 away from O, so it cuts the circle twice. You slide the line away until it just touches. How far from O is it then?',
          ch: [['Less than 5', 'A line less than 5 from O still cuts the circle in two points.'], ['Exactly 5, the radius', 'The line touches only when its closest point to O is on the circle, and that point is r = 5 away.'], ['More than 5', 'A line more than 5 from O misses the circle completely.'], ['It depends on the tilt', 'Turning the line around the circle does not change this: the closest point is always on the circle at the touch.']], ans: 1 },
        on: { q: 'Predict. The arc TB is 140°. Q slides along the circle until it reaches T, and line QT turns into the tangent. What will the tangent-chord angle at T be?',
          ch: [['140°, the whole arc', 'The angle is never as large as its arc. It is half of it.'], ['70°, the same as the angle at Q', 'The angle at Q stays 70° the whole way, and at the end line QT is the tangent. So the tangent-chord angle is 70°.'], ['35°', 'That halves twice. The inscribed angle was already half the arc.'], ['0°', 'The angle at Q never shrinks as Q moves, so it does not collapse at T.']], ans: 1 },
        out: { q: 'Predict. Two secants meet at P. The far arc stays 200°. P moves outward until the near arc has grown from 60° to 120°. What happens to the angle at P (it is 70° now)?',
          ch: [['It gets bigger', 'Far minus near gets smaller when the near arc grows, so the angle shrinks.'], ['It stays 70°', 'The angle depends on the near arc, so it changes.'], ['It gets smaller, to 40°', 'The far arc minus the near arc shrinks: ½ (200° − 120°) = 40°. The two arcs become closer in size.'], ['It becomes 160°', 'That is the half sum, ½ (200° + 120°). Outside, you subtract.']], ans: 2 }
      };
      const predBtn = track(GR.pred, () => C.buttons([{ label: 'Predict, then see', primary: true, onClick: () => startPred() }]));
      let predView = null;
      function startPred() {
        cancel(); const v = st.view; if (!PRED[v]) return; const pd = PRED[v]; predView = v;
        if (v === 'tan') { st.dist = 3; st.hide = []; }
        if (v === 'on') { st.al = 140; st.g = 100; st.hide = ['ang']; }
        if (v === 'out') { st.kind = 'ss'; st.N = 60; st.F = 200; st.hide = ['ang']; }
        pq.ask(pd.q, pd.ch.map(x => [...x]), pd.ans, {});
        pq.pick = (i, btn) => {
          const cu = pq.cur; if (!cu || cu.solved) return; cu.solved = true;
          const ok = i === cu.ans;
          Array.from(pq.chEl.children).forEach((b, j) => { b.disabled = true; if (j === cu.ans) { b.style.borderColor = 'var(--green)'; b.style.color = 'var(--green)'; } else if (j === i) { b.style.borderColor = 'var(--red)'; b.style.color = 'var(--red)'; } });
          const why = pd.ch[i][1], right = pd.ch[cu.ans][0];
          pq.fbEl.innerHTML = `<b>${ok ? 'Yes.' : 'Not this time.'}</b> ${why}${ok ? '' : ' The answer was: ' + right + '.'} Watch the picture.`;
          st.hide = [];
          if (v === 'tan') st.dist = 3;
          if (v === 'on') { st.al = 140; st.g = 100; }
          if (v === 'out') { st.kind = 'ss'; st.F = 200; st.N = 60; }
          if (v === 'tan') cancel = animateTo(st, { dist: 5 }, 1400, sync);
          if (v === 'on') cancel = animateTo(st, { g: 2 }, 1600, sync);
          if (v === 'out') cancel = animateTo(st, { N: 120 }, 1600, sync);
          sync();
        };
        sync();
      }

      /* ---------- compare view ---------- */
      const tbl = h('table', { style: 'width:100%;border-collapse:collapse;font-size:.88rem;line-height:1.4' });
      tbl.append(h('tr', {}, h('th', { style: 'text-align:left;padding:4px 6px;border-bottom:2px solid var(--grid-strong)' }, 'Where the vertex is'), h('th', { style: 'text-align:left;padding:4px 6px;border-bottom:2px solid var(--grid-strong)' }, 'The angle θ equals')));
      const cmpRows = CASES.map((cs, i) => { const tr = h('tr', { style: 'cursor:pointer' }, h('td', { style: 'padding:6px;border-bottom:1px solid var(--grid)' }, cs.name), h('td', { style: 'padding:6px;border-bottom:1px solid var(--grid)' }, h('b', {}, cs.words), h('br'), cs.sym)); tr.addEventListener('click', () => { if (!cmpMatch.on) pickCase(i); }); tbl.append(tr); return tr; });
      track(GR.cmp, () => { const d = h('div', { class: 'ctl', style: 'display:block' }, tbl); host.append(d); return d; });
      const cmpBtns = track(GR.cmp, () => C.buttons(CASES.map((cs, i) => ({ label: cs.short, onClick: () => { if (!cmpMatch.on) pickCase(i); } }))));
      const cmpMatch = { on: false, i: 0, right: 0 };
      const mq = track(GR.cmp, () => { const q = quiz(); host.append(q.box); return q; });
      GR.cmp.push(mq.box);
      const mStart = track(GR.cmp, () => C.buttons([{ label: 'Match the formulas (5 diagrams)', primary: true, onClick: () => startMatch() }]));
      function pickCase(i) { cancel(); st.cmp = i; applyCase(i); sync(); }
      function applyCase(i) {
        const s = CASES[i].set; st.hide = []; st.over = {};
        const { view, kind, ...nums } = s;
        if (kind) st.kind = kind;
        Object.assign(st, nums); st.cmp = i; sync();
      }
      function startMatch() { cmpMatch.on = true; cmpMatch.i = 0; cmpMatch.right = 0; matchAsk(); }
      function matchAsk() {
        const m = MATCH[cmpMatch.i]; applyCase(m.c);
        mq.ask(`<b>Diagram ${cmpMatch.i + 1} of ${MATCH.length}.</b> ${m.q}`, m.ch.map(x => [...x]), m.ans, { onRight: tried => {
          if (!tried) cmpMatch.right++;
          mq.nxEl.innerHTML = '';
          mq.nxEl.append(h('button', { type: 'button', class: 'btn primary', onclick: () => {
            if (cmpMatch.i + 1 >= MATCH.length) {
              cmpMatch.on = false; mq.clear();
              mq.fbEl.innerHTML = `You matched ${cmpMatch.right} of ${MATCH.length} on the first try. Remember: inside, add. Outside, subtract. Always halve.`;
            } else { cmpMatch.i++; matchAsk(); }
          } }, cmpMatch.i + 1 >= MATCH.length ? 'Finish' : 'Next diagram'));
        } });
        sync();
      }

      /* ---------- real situations ---------- */
      const STORY = [
        { btn: 'Lake', kind: 'tt', N: 110, text: 'You stand at P, beside a round lake. Your two lines of sight just touch the shore at A and B. The near shore between A and B is 110° of the lake\'s circle.',
          q: 'How wide does the lake look from P (the angle between your two lines of sight)?',
          ch: [['110°', 'That is the arc of the near shore, not the angle at P.'], ['55°', 'That is half of the near arc. The angle at P uses both arcs, far and near.'], ['70°', 'Two tangents: 180° − 110° = 70°. Or the far shore is 250°, and ½ (250° − 110°) = 70°.'], ['125°', 'That is half the far arc, 250° ÷ 2. Subtract the near arc before you halve.']], ans: 2 },
        { btn: 'Lighthouse', kind: 'tt', N: 130, text: 'A lighthouse at P sees a round island. The two beams just graze the island at A and B. The coast between A and B facing the lighthouse is 130° of the island\'s circle.',
          q: 'At what angle do the two grazing beams meet at the lighthouse?',
          ch: [['130°', 'That is the arc of coast. The angle at the lighthouse is smaller.'], ['65°', 'That is half the near arc. For tangents, use 180° minus the near arc.'], ['115°', 'That is half the far arc, 230° ÷ 2. The angle is half the difference of far and near.'], ['50°', '180° − 130° = 50°. Check: the far coast is 230°, and ½ (230° − 130°) = 50°.']], ans: 3 },
        { btn: 'Ferry', kind: 'ss', N: 60, F: 200, text: 'From a pier P, two straight ferry routes cross a round island. They cut off the far coast arc of 200° and the near coast arc of 60° of the island\'s circle.',
          q: 'What is the angle between the two ferry routes at P?',
          ch: [['130°', 'That is half the sum, ½ (200° + 60°). Both routes start outside the island, so subtract.'], ['70°', 'Two secants from an outside point: ½ (200° − 60°) = ½ · 140° = 70°.'], ['140°', 'That is the difference without the half.'], ['35°', 'That halves the difference twice.']], ans: 1 }
      ];
      const stB = track(GR.story, () => C.buttons(STORY.map((s, i) => ({ label: s.btn, onClick: () => selectStory(i) }))));
      const stP = track(GR.story, () => h('p', { class: 'hint', style: 'margin:0', 'aria-live': 'polite' }));
      host.append(stP); GR.story.push(stP);
      const sq = track(GR.story, () => { const q = quiz(); host.append(q.box); return q; });
      GR.story.push(sq.box);
      function selectStory(i, imm) {
        cancel(); const s = STORY[i]; st.story = i; st.kind = s.kind; st.hide = ['ang']; st.over = {};
        stP.textContent = s.text;
        const go = () => sq.ask(s.q, s.ch.map(x => [...x]), s.ans, { onRight: () => { st.hide = []; sync(); } });
        go(); st.N = s.N; st.F = s.kind === 'tt' ? 360 - s.N : s.F; sync();
      }

      /* ---------- readout ---------- */
      const ro = C.readout(); GR.ro.push(ro);
      const kv = (a, b) => `<span class="k">${a}</span> ${b}`;
      const upd = () => {
        const mode = curMode(), o = [], rr = st.rr;
        if (st.view === 'cmp') {
          const cs = CASES[st.cmp];
          o.push(kv('Case', cs.name), kv('Rule', cs.words), kv('Formula', cs.sym), kv('This diagram', cs.ex));
        } else if (mode === 'tan') {
          const d = st.dist, pts = d < rr ? '2 points (a secant line)' : d === rr ? '1 point (a tangent)' : '0 points (misses)';
          o.push(kv('Radius r', rr), kv('Distance d from O to the line', f1(d)), kv('Line meets the circle in', pts));
          o.push(d === rr ? kv('At the touching point', 'the radius and the line make 90°. The tangent is perpendicular to the radius.') : kv('Compare', d < rr ? `d is less than r, so the line goes inside the circle` : `d is more than r, so the whole line is outside`));
        } else if (mode === 'len') {
          const sq2 = st.op * st.op - rr * rr, exact = sqrtTxt(sq2), val = Math.sqrt(sq2);
          o.push(kv('Radius r', rr), kv('OP', st.op), kv('PA² = OP² − r²', `${st.op}² − ${rr}² = ${st.op * st.op} − ${rr * rr} = ${sq2}`));
          o.push(kv('PA = PB', Number.isInteger(val) ? String(val) : `${exact} ≈ ${(Math.round(val * 100) / 100).toFixed(2)}`), kv('Why equal', 'both tangents are legs of right triangles with the same hypotenuse OP and the same leg r'));
        } else if (mode === 'on') {
          const T = pt(270), B = pt(270 + st.al), Q = pt(270 - st.g), tc = angAt(T, [T[0] + 1, T[1]], B), ins = angAt(Q, T, B);
          o.push(kv('Arc TB', st.al + '°'), kv('Inscribed angle at Q', `${f1(ins)}° (Q is ${Math.round(st.g)}° from T)`));
          if (hid('ang')) o.push(kv('Tangent-chord angle at T', 'make your prediction first'));
          else o.push(kv('Tangent-chord angle at T', `${f1(tc)}°`), kv('Half the arc', `${st.al} ÷ 2 = ${f1(st.al / 2)}°`));
        } else if (mode === 'in') {
          const I = inGeo(A0, st.w, st.x, st.y), a = st.which === 0 ? angAt(I.X, I.A, I.B) : angAt(I.X, I.B, I.C), s1 = st.which === 0 ? st.w : st.x, s2 = st.which === 0 ? st.y : I.z, nm = st.which === 0 ? ['AB', 'CD', 'AXB'] : ['BC', 'DA', 'BXC'];
          o.push(kv('Arcs AB, BC, CD, DA', `${st.w}° + ${st.x}° + ${st.y}° + ${I.z}° = 360°`));
          o.push(kv('Measured angle ' + nm[2], dg(a)), kv(`Half the SUM, ½ (${nm[0]} + ${nm[1]})`, `½ (${s1} + ${s2}) = ${f1((s1 + s2) / 2)}°`));
          o.push(kv('Wrong rules', `half the difference = ${f1(Math.abs(s1 - s2) / 2)}°, the full sum = ${s1 + s2}°`));
        } else if (mode === 'ss' || mode === 'st' || mode === 'tt') {
          const G = outGeo(mode, st.N, st.F);
          if (!isFinite(G.P[0])) return;
          {
            o.push(kv('Lines from P', KIND_NAME[mode]), kv('Far arc, near arc', `${G.F}° and ${G.N}°`));
            if (hid('ang')) o.push(kv('Angle at P', 'answer the question first'));
            else {
              o.push(kv('Measured angle at P', dg(G.ang)), kv('Half the DIFFERENCE', `½ (${G.F} − ${G.N}) = ${f1((G.F - G.N) / 2)}°`));
              o.push(kv('Wrong rules', `half the sum = ${f1((G.F + G.N) / 2)}°, the difference with no half = ${G.F - G.N}°`));
            }
            if (mode === 'tt' && !hid('ang')) o.push(kv('Tangents only', `180° − near arc = ${180 - G.N}°. Quadrilateral O A P B: 90° + 90° + ${G.N}° + ${f1(G.ang)}° = ${f1(180 + G.N + G.ang)}°`));
            o.push(kv('Distance OP (in radii)', f1(Math.hypot(...G.P))));
          }
        }
        if (st.view === 'story' && st.story < 0) o.push('Choose a situation above.');
        if (st.note) o.push(st.note);
        ro.innerHTML = o.join('<br>');
      };

      /* ---------- practice ---------- */
      const pz = h('div', { class: 'ctl', style: 'display:none;gap:10px;flex-direction:column' });
      const pStat = h('p', { class: 'hint', style: 'margin:0', 'aria-live': 'polite' });
      const pz2 = quiz();
      const pNext = h('button', { type: 'button', class: 'btn primary', style: 'display:none' }, 'Next problem');
      const pLeave = h('button', { type: 'button', class: 'btn', onclick: () => stopPractice() }, 'Leave practice');
      pz2.nxEl.append(pNext, pLeave); pz.append(pStat, pz2.box);
      C.title('Practice');
      const startBtn = C.buttons([{ label: 'Start practice (' + PR.length + ' problems)', primary: true, onClick: () => startPractice() }])[0];
      host.append(pz); const startRow = startBtn.parentNode;
      C.hint('Practice pictures are drawn from the problem. They may not show the answer.');
      const hintEl = host.lastChild; hintEl.style.display = 'none';
      const tally = () => `Problem ${prac.i + 1} of ${PR.length}. Right on the first try: ${prac.right} of ${prac.done} answered.`;
      function startPractice() { cancel(); prac.snap = JSON.parse(JSON.stringify(st)); prac.on = true; prac.i = 0; prac.right = 0; prac.done = 0; startRow.style.display = 'none'; hintEl.style.display = ''; pz.style.display = 'flex'; showProblem(); applyVis(); }
      function stopPractice() {
        if (!prac.on) return;
        prac.on = false; Object.assign(st, prac.snap); pz.style.display = 'none'; startRow.style.display = ''; hintEl.style.display = 'none'; applyVis(); sync();
      }
      function showProblem() {
        const pb = PR[prac.i]; cancel(); prac.bad = false;
        const { view, kind, hide, over, ...nums } = pb.fig;
        st.view = view; if (kind) st.kind = kind; st.rr = 5; Object.assign(st, nums); st.hide = hide || []; st.over = { ...(over || {}) }; st.radii = false;
        pStat.textContent = tally(); pNext.style.display = 'none';
        pz2.ask(pb.q, pb.ch, pb.ans, { onRight: tried => {
          if (tried) prac.bad = true; prac.done++; if (!prac.bad) prac.right++;
          st.hide = []; st.over = {}; pStat.textContent = tally(); sync();
          pNext.style.display = ''; pNext.textContent = prac.i + 1 >= PR.length ? 'See my results' : 'Next problem';
        } });
        pz2.nxEl.append(pNext, pLeave); sync();
      }
      pNext.addEventListener('click', () => { if (prac.i + 1 >= PR.length) { finishPractice(); return; } prac.i++; showProblem(); });
      function finishPractice() {
        pz2.qEl.innerHTML = `You finished. You got ${prac.right} of ${PR.length} right on the first try.`;
        pz2.chEl.innerHTML = ''; pNext.style.display = 'none'; pStat.textContent = '';
        pz2.fbEl.innerHTML = prac.right === PR.length ? 'Every one on the first try. Try the Real situations view next.' : 'Look back at the pattern: on the circle, half the arc. Inside, half the sum. Outside, half the difference (far minus near).';
        pLeave.textContent = 'Back to exploring';
        const again = h('button', { type: 'button', class: 'btn', onclick: () => { pLeave.textContent = 'Leave practice'; again.remove(); prac.i = 0; prac.right = 0; prac.done = 0; showProblem(); } }, 'Practice again');
        pz2.nxEl.prepend(again);
      }

      /* ---------- view logic ---------- */
      function setKind(k) {
        st.kind = k; st.hide = [];
        if (k === 'tt') { st.N = 110; st.F = 250; } else { st.N = 60; st.F = 200; }
      }
      function setView(v) {
        st.view = v; st.hide = []; st.over = {}; st.note = ''; pq.clear(); predView = null;
        if (v === 'tan') { st.rr = 5; }
        if (v === 'len') { st.rr = 5; }
        if (v === 'story') { if (st.story < 0) selectStory(0); else selectStory(st.story); }
        if (v === 'cmp') { cmpMatch.on = false; mq.clear(); applyCase(st.cmp); }
        if (v === 'out' && st.kind === 'tt') { st.F = 360 - st.N; }
      }
      function applyVis() {
        const on = !prac.on, v = st.view;
        ['tan', 'len', 'on', 'in', 'out', 'cmp', 'story'].forEach(k => show(GR[k], on && v === k));
        show(GR.pred, on && (v === 'tan' || v === 'on' || v === 'out')); show(GR.ro, on);
        const out = on && v === 'out'; fsEl.style.display = out && st.kind !== 'tt' ? '' : 'none';
        radT.parentNode.style.display = out && st.kind === 'tt' ? '' : 'none';
        sel.parentNode.style.display = on ? '' : 'none';
      }
      function sync() {
        if (st.kind === 'tt') st.F = 360 - st.N;
        distS.set(st.dist); tiltS.set(st.tilt); opS.set(st.op); alS.set(st.al); gS.set(st.g); wS.set(st.w); xS.set(st.x); yS.set(st.y);
        NS.set(st.N); FS.set(st.F); sel.value = st.view; kindS.value = st.kind; radT.checked = st.radii; whichS.value = String(st.which);
        if (!prac.on) applyVis();
        P.draw(); upd();
      }

      /* ---------- dragging ---------- */
      draggable(P, {
        hit: (px, py) => { if (prac.on || st.view === 'cmp' || st.view === 'story') return null; let best = null, bd = 24; hnd.forEach(q => { const d = Math.hypot(q.x - px, q.y - py); if (d < bd) { bd = d; best = q.id; } }); return best; },
        move: (id, mx, my) => {
          manual();
          const ang = Math.atan2(my, mx) / D;
          if (id === 'dist') { const u = pt(st.tilt); st.dist = clamp(snap((mx * u[0] + my * u[1]) * st.rr, .5), 1, 8); }
          else if (id === 'op') st.op = clamp(snap(mx * st.rr, 1), 6, 13);
          else if (id === 'al') { st.al = clamp(snap(mod(ang - 270), 5), 20, 340); st.g = Math.min(st.g, 350 - st.al); }
          else if (id === 'g') { let g = mod(270 - ang); const gm = 350 - st.al; if (Math.abs(g - st.g) > 180) g = st.g < 180 ? 2 : gm; st.g = clamp(Math.round(g), 2, gm); }
          else if (id === 'B' || id === 'C' || id === 'D') {
            let t = mod(ang - A0); if (t > 350 && id !== 'D') t = 0;
            const pB = st.w, pC = st.w + st.x, pD = st.w + st.x + st.y;
            if (id === 'B') { const nb = clamp(snap(t, 5), 20, pC - 20); st.w = nb; st.x = pC - nb; }
            if (id === 'C') { const nc = clamp(snap(t, 5), pB + 20, pD - 20); st.x = nc - pB; st.y = pD - nc; }
            if (id === 'D') { const nd = clamp(snap(t, 5), pC + 20, 340); st.y = nd - pC; }
          } else if (id === 'P') {
            let best = st.N, bd = 1e9;
            for (let N = 10; N <= 170; N += 5) {
              const F = st.kind === 'tt' ? 360 - N : st.F; if (!outValid(st.kind, N, F)) continue;
              const q = outGeo(st.kind, N, F).P, d = Math.hypot(q[0] - mx, q[1] - my); if (d < bd) { bd = d; best = N; }
            }
            st.N = best;
          }
          sync();
        }
      });

      /* ---------- guided steps ---------- */
      const apply = (patch, immediate) => {
        cancel(); stopPractice();
        const { view, kind, which, predict, ...nums } = patch;
        const changed = view !== undefined && view !== st.view;
        if (kind) st.kind = kind;
        if (which !== undefined) st.which = which;
        if (view !== undefined) setView(view);
        st.hide = []; st.over = {}; st.note = ''; st.radii = false;
        if (predict) { Object.assign(st, nums); startPred(); return; }
        if (immediate || changed) { Object.assign(st, nums); sync(); }
        else cancel = animateTo(st, nums, 900, sync);
      };
      setView('tan'); sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
