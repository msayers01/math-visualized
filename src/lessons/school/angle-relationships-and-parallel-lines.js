/* =====================================================================
   SCHOOL — Angle relationships and parallel lines
   ===================================================================== */
{
  /* Eight angles at two crossings. Top crossing: 1 (above m, left of t), 2 (above, right), 3 (below, left), 4 (below, right).
     Bottom crossing (on n): 5, 6, 7, 8 in the same pattern. */
  const KINDS = ['vertical', 'linear', 'corr', 'altInt', 'sameSide', 'altExt'];
  const REL_NAME = { vertical: 'vertical angles', linear: 'a linear pair', corr: 'corresponding angles', altInt: 'alternate interior angles', sameSide: 'same-side interior angles', altExt: 'alternate exterior angles' };
  const REL_CAP = { vertical: 'Vertical angles', linear: 'Linear pair', corr: 'Corresponding angles', altInt: 'Alternate interior angles', sameSide: 'Same-side interior angles', altExt: 'Alternate exterior angles' };
  const DESC = {
    vertical: 'sit across from each other at one crossing',
    linear: 'sit side by side at one crossing and together make a straight line',
    corr: 'sit in the same corner at the two crossings',
    altInt: 'lie between the lines on opposite sides of the transversal',
    sameSide: 'lie between the lines on the same side of the transversal',
    altExt: 'lie outside the lines on opposite sides of the transversal'
  };
  const DEF = {
    vertical: 'Vertical angles sit across from each other at one crossing.',
    linear: 'A linear pair is two angles side by side that together make a straight line.',
    corr: 'Corresponding angles sit in the same corner at the two crossings.',
    altInt: 'Alternate interior angles lie between the lines on opposite sides of the transversal.',
    sameSide: 'Same-side interior angles lie between the lines on the same side of the transversal.',
    altExt: 'Alternate exterior angles lie outside the lines on opposite sides of the transversal.'
  };
  const REASON = {
    vertical: 'Vertical angles are equal',
    linear: 'A linear pair adds to 180°',
    corr: 'Corresponding angles are equal (lines parallel)',
    altInt: 'Alternate interior angles are equal (lines parallel)',
    sameSide: 'Same-side interior angles add to 180° (lines parallel)',
    altExt: 'Alternate exterior angles are equal (lines parallel)'
  };
  const EQUAL = { vertical: true, corr: true, altInt: true, altExt: true, linear: false, sameSide: false };
  const NEEDS_PAR = { vertical: false, linear: false, corr: true, altInt: true, altExt: true, sameSide: true };
  const TABLE = {};
  [['vertical', ['1-4', '2-3', '5-8', '6-7']], ['linear', ['1-2', '1-3', '2-4', '3-4', '5-6', '5-7', '6-8', '7-8']],
   ['corr', ['1-5', '2-6', '3-7', '4-8']], ['altInt', ['3-6', '4-5']], ['sameSide', ['3-5', '4-6']], ['altExt', ['1-8', '2-7']]]
    .forEach(([k, l]) => l.forEach(s => { TABLE[s] = k; }));
  const relOf = (a, b) => TABLE[Math.min(a, b) + '-' + Math.max(a, b)] || null;
  const SECT = 'BACD';   /* sector of angle n is SECT[(n - 1) % 4] */
  /* size of angle n when the transversal makes th degrees with m and line n is tilted by tilt degrees */
  const sizeOf = (n, th, tilt) => {
    const phi = th - (n > 4 ? tilt : 0), s = SECT[(n - 1) % 4];
    return s === 'A' || s === 'C' ? phi : 180 - phi;
  };
  const deg = v => Math.round(v);
  const rad = d => d * Math.PI / 180;
  const FONT = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';

  /* wedge and arc in pixel space around the math point (mx, my); angles in degrees, counterclockwise */
  const wedge = (p, mx, my, a0, a1, r, fill, stroke, lw, dash) => {
    const c = p.ctx, x = p.X(mx), y = p.Y(my);
    c.beginPath(); c.moveTo(x, y); c.arc(x, y, r, -rad(a0), -rad(a1), true); c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]); }
  };
  const arcLine = (p, mx, my, a0, a1, r, col, lw, dash) => {
    const c = p.ctx, x = p.X(mx), y = p.Y(my);
    c.beginPath(); c.arc(x, y, r, -rad(a0), -rad(a1), true);
    c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]);
  };
  const corner = (p, mx, my, a0, a1, s, col, fill) => {
    const c = p.ctx, x = p.X(mx), y = p.Y(my), u = [Math.cos(rad(a0)), -Math.sin(rad(a0))], v = [Math.cos(rad(a1)), -Math.sin(rad(a1))];
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + s * u[0], y + s * u[1]); c.lineTo(x + s * (u[0] + v[0]), y + s * (u[1] + v[1])); c.lineTo(x + s * v[0], y + s * v[1]); c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    c.strokeStyle = col; c.lineWidth = 2; c.stroke();
  };

  /* ---------- practice problems (a fixed list) ---------- */
  const PROBS = [
    { th: 50, tilt: 0, parts: [{ k: 'name', a: 3, b: 6 }] },
    { th: 115, tilt: 0, parts: [{ k: 'name', a: 2, b: 7 }] },
    { th: 64, tilt: 0, given: [2], parts: [
      { k: 'chase', from: 2, to: 6, reasons: ['linear', 'vertical', 'corr', 'altInt'], vals: [116, 26, 64, 32] },
      { k: 'chase', from: 6, to: 5, reasons: ['sameSide', 'linear', 'corr', 'vertical'], vals: [64, 116, 26, 154] }] },
    { th: 70, tilt: 0, hl: [2, 6], lab: { 2: '∠2 = (3x+10)°', 6: '∠6 = (5x−30)°' }, parts: [
      { k: 'mc', q: 'Lines m and n are parallel. The yellow angle ∠2 and the violet angle ∠6 are corresponding angles. Their sizes are (3x + 10)° and (5x − 30)°. Which equation do you start with?',
        choices: ['(3x + 10) + (5x − 30) = 90', '(3x + 10) + (5x − 30) = 180', '3x + 10 = 5x − 30'], ans: 2,
        fb: ['A sum of 90° is for complementary angles. Corresponding angles are not a right-angle pair.', 'A sum of 180° is for a linear pair or same-side interior angles. Corresponding angles are equal when the lines are parallel.'],
        right: 'Corresponding angles are equal when the lines are parallel, so set the two expressions equal.' },
      { k: 'mc', q: 'Solve 3x + 10 = 5x − 30. What is x?', choices: ['x = 20', 'x = −10', 'x = 10', 'x = 40'], ans: 0,
        fb: ['', 'Check: x = −10 gives 3(−10) + 10 = −20 on the left and 5(−10) − 30 = −80 on the right. They are not equal. Subtract 3x and add 30 to get 40 = 2x.', 'Check: x = 10 gives 40 on the left and 20 on the right. You have 40 = 2x. Divide by 2, not by 4.', 'Check: x = 40 gives 130 on the left and 170 on the right. You have 40 = 2x. Divide both sides by 2.'],
        right: 'Subtract 3x and add 30 on both sides: 40 = 2x. So x = 20.' },
      { k: 'mc', q: 'How big is ∠2?', choices: ['20°', '70°', '110°', '130°'], ans: 1,
        fb: ['20 is the value of x, not the angle. Put x back in: 3(20) + 10.', '', '110° is the size of ∠1, the angle next to ∠2 (180° − 70°). ∠2 = 3(20) + 10.', 'Put x = 20 back in: 3(20) + 10 = 70, not 130.'],
        right: '∠2 = 3(20) + 10 = 70°. Check with ∠6: 5(20) − 30 = 70°. They match, as the rule says.' }] },
    { th: 68, tilt: 0, given: [8], parts: [
      { k: 'chase', from: 8, to: 4, reasons: ['altInt', 'corr', 'vertical', 'sameSide'], vals: [68, 112, 22, 158] },
      { k: 'chase', from: 4, to: 3, reasons: ['linear', 'corr', 'vertical', 'altExt'], vals: [22, 68, 112, 158] },
      { k: 'chase', from: 3, to: 5, reasons: ['altInt', 'corr', 'linear', 'sameSide'], vals: [158, 22, 112, 68] }] },
    { th: 61, tilt: 0, hl: [4, 6], lab: { 4: '∠4 = (4x+15)°', 6: '∠6 = (2x+9)°' }, parts: [
      { k: 'mc', q: 'Lines m and n are parallel. The yellow angle ∠4 and the violet angle ∠6 are same-side interior angles. Their sizes are (4x + 15)° and (2x + 9)°. Which equation do you start with?',
        choices: ['4x + 15 = 2x + 9', '(4x + 15) + (2x + 9) = 90', '(4x + 15) + (2x + 9) = 180'], ans: 2,
        fb: ['Equal is for corresponding or alternate interior angles. Same-side interior angles are on the same side of the transversal, and they add to 180°.', 'A sum of 90° is for complementary angles. Same-side interior angles add to 180° when the lines are parallel.'],
        right: 'Same-side interior angles add to 180° when the lines are parallel, so add the two expressions and set the sum equal to 180.' },
      { k: 'mc', q: 'Solve (4x + 15) + (2x + 9) = 180. What is x?', choices: ['x = 11', 'x = 26', 'x = 30', 'x = 156'], ans: 1,
        fb: ['x = 11 comes from a sum of 90°: 6x + 24 = 90. The sum here is 180°.', '', 'x = 30 comes from 6x = 180. First subtract the 24 from both sides to get 6x = 156.', '156 is the value of 6x, not x. Divide by 6.'],
        right: 'Combine like terms: 6x + 24 = 180. Then 6x = 156, so x = 26.' },
      { k: 'mc', q: 'How big is ∠4?', choices: ['26°', '61°', '104°', '119°'], ans: 3,
        fb: ['26 is the value of x. Put it back in: 4(26) + 15.', '61° is the size of ∠6 = 2(26) + 9. ∠4 is the other one.', '4(26) = 104. Do not forget to add the 15.', ''],
        right: '∠4 = 4(26) + 15 = 119°. Check: 119° + 61° = 180°.' }] },
    { th: 90, tilt: 0, ray: 55, lab: { a: 'a = (2x+5)°', b: 'b = (x+10)°' }, parts: [
      { k: 'mc', q: 'The transversal is perpendicular to m, so ∠2 is a right angle. A ray splits ∠2 into a = (2x + 5)° and b = (x + 10)°. Which equation do you start with?',
        choices: ['(2x + 5) + (x + 10) = 180', '2x + 5 = x + 10', '(2x + 5) + (x + 10) = 90'], ans: 2,
        fb: ['180° is for a straight line. The two parts fill a right angle, which is 90°.', 'Nothing says a and b are equal. They are two parts of one right angle, so they add to 90°.'],
        right: 'The parts fill a right angle, so they add to 90°. Two angles that add to 90° are complementary.' },
      { k: 'mc', q: 'Solve (2x + 5) + (x + 10) = 90. What is x?', choices: ['x = 5', 'x = 30', 'x = 25', 'x = 55'], ans: 2,
        fb: ['x = 5 comes from 2x + 5 = x + 10, which treats a and b as equal. They add to 90°.', 'x = 30 comes from 3x = 90. First subtract the 15 to get 3x = 75.', '', 'x = 55 comes from using 180°: 3x + 15 = 180. The sum is 90°.'],
        right: 'Combine like terms: 3x + 15 = 90. Then 3x = 75, so x = 25.' },
      { k: 'mc', q: 'How big is angle a?', choices: ['35°', '55°', '25°', '65°'], ans: 1,
        fb: ['35° is the size of b = 25 + 10. Angle a is 2(25) + 5.', '', '25 is the value of x. Angle a is 2(25) + 5.', '65° is 90° − 25°. Put x back into a = 2x + 5 instead.'],
        right: 'a = 2(25) + 5 = 55° and b = 25 + 10 = 35°. They add to 90°, so they are complementary.' }] },
    { th: 70, tilt: 15, hl: [2, 6], lab: { 2: '∠2 = 70°', 6: '∠6 = 55°' }, parts: [
      { k: 'mc', q: 'Lines m and n might not be parallel. You measure the corresponding angles: ∠2 = 70° (yellow) and ∠6 = 55° (violet). What can you conclude?',
        choices: ['m and n are parallel, because corresponding angles are always equal.', 'm and n are parallel, because 70° and 55° are close.', 'm and n are not parallel, because parallel lines would make these corresponding angles equal.', 'Nothing. Corresponding angles tell you nothing about the lines.'], ans: 2,
        fb: ['Corresponding angles are equal only when the lines are parallel. Here they differ by 15°, so the lines are not parallel.', 'Close is not enough. Parallel lines make corresponding angles exactly equal.', '', 'They do tell you something. Equal corresponding angles mean parallel lines. Different ones mean the lines are not parallel.'],
        right: 'Equal corresponding angles go with parallel lines. These differ by 15°, which is how far n is tilted, so the lines would meet somewhere far away.' }] }
  ];

  register({
    id: 'angle-relationships-and-parallel-lines', level: 'school',
    title: 'Angle relationships and parallel lines',
    blurb: 'Tilt a transversal across two lines, find which angles are equal or add up, and give a reason for every step.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 3.5;
      const th = 65, cot = 1 / Math.tan(rad(th)), r = p.scale * 0.62;
      const P1 = [cot, 1], P2 = [-cot, -1];
      wedge(p, P1[0], P1[1], 0, th, r, alpha(pal.green, .35), pal.green, 2);
      wedge(p, P2[0], P2[1], 0, th, r, alpha(pal.green, .35), pal.green, 2);
      wedge(p, P1[0], P1[1], th, 180, r, alpha(pal.red, .25), pal.red, 2);
      p.path([[-3.6, 1], [3.6, 1]], { stroke: pal.blue, width: 3 });
      p.path([[-3.6, -1], [3.6, -1]], { stroke: pal.blue, width: 3 });
      p.path([[-2.3 * Math.cos(rad(th)), -2.3 * Math.sin(rad(th))], [2.3 * Math.cos(rad(th)), 2.3 * Math.sin(rad(th))]], { stroke: pal.violet, width: 3 });
    },
    hook: String.raw`A road crosses two straight railway tracks that never meet. You measure just one of the eight angles it makes. How can you know all the others without measuring?`,
    steps: [
      { title: 'Vertical angles and linear pairs',
        text: String.raw`<p>The road is the <b>transversal</b>, t. It crosses tracks m and n and makes eight angles.</p><p>Angle 1 is picked and measures \(115^\circ\). Across from it, \(\angle 4\) is its <b>vertical</b> partner: also \(115^\circ\). Next to it, \(\angle 2\) and \(\angle 3\) make a <b>linear pair</b> with it: \(115^\circ+65^\circ=180^\circ\). Pick other angles, then drag the ring on t.</p>`,
        set: { th: 65, tilt: 0, rho: 30, mode: 'explore', sel: 1, hl: [], ray: false, deg: true, rels: ['vertical', 'linear'] } },
      { title: 'Complementary angles',
        text: String.raw`<p>Tilt t until \(\angle 2\) is \(90^\circ\), a square corner. A ray cuts that corner into two parts: \(a=35^\circ\) and \(b=55^\circ\).</p><p>Two angles that add to \(90^\circ\) are <b>complementary</b>. Drag the ray's ring, or use its slider. When a grows, b shrinks, and \(a+b\) stays \(90^\circ\).</p>`,
        set: { th: 90, tilt: 0, rho: 35, mode: 'explore', sel: null, hl: [], ray: true, deg: true, rels: ['vertical', 'linear'] } },
      { title: 'Predict, then tilt a track',
        text: String.raw`<p>Tracks m and n are parallel (the arrows show it). \(\angle 2\) (yellow) and \(\angle 6\) (violet) sit in the same corner at each crossing. They are <b>corresponding</b> angles.</p><p>Predict first. In the panel, choose how you think they compare. Then the sizes appear. Last, switch off "parallel" to tilt track n.</p>`,
        set: { th: 70, tilt: 0, rho: 30, mode: 'predict', sel: null, hl: [2, 6], ray: false, deg: false, rels: KINDS } },
      { title: 'Every pair has a name',
        text: String.raw`<p>With parallel tracks, every angle is \(70^\circ\) or \(110^\circ\). Angle 3 is picked. It equals its <b>alternate interior</b> partner \(\angle 6\) and its <b>corresponding</b> partner \(\angle 7\). It adds to \(180^\circ\) with its <b>same-side interior</b> partner \(\angle 5\) (\(70^\circ+110^\circ\)).</p><p>Pick other angles. Then switch off "parallel": only vertical pairs and linear pairs keep their rules.</p>`,
        set: { th: 70, tilt: 0, rho: 30, mode: 'explore', sel: 3, hl: [], ray: false, deg: true, rels: KINDS } }
    ],
    formal: String.raw`
      <p>A <em>transversal</em> is a line that crosses two other lines. Here it crosses lines \(m\) and \(n\) and makes eight angles. Angles between \(m\) and \(n\) are <em>interior</em>. The others are <em>exterior</em>. In the lesson, \(\angle 1\) to \(\angle 4\) are at \(m\) and \(\angle 5\) to \(\angle 8\) are at \(n\). In each group, the numbers go: above and left of \(t\), above and right, below and left, below and right.</p>
      <h3>Two facts that hold for any two lines</h3>
      <p>Two angles that add to \(180^\circ\) are <em>supplementary</em>. Two angles that add to \(90^\circ\) are <em>complementary</em>.</p>
      <p><b>Linear pair.</b> Two angles side by side that together make a straight line are supplementary, because a straight angle is \(180^\circ\).</p>
      <p><b>Vertical angles are equal.</b> Call two vertical angles \(x\) and \(z\), and let \(y\) be the angle between them. Then \(x+y=180^\circ\) and \(z+y=180^\circ\). So \(x=180^\circ-y=z\). Nothing here needs the lines to be parallel.</p>
      <h3>The one fact about parallel lines</h3>
      <p>If \(m\parallel n\), then corresponding angles are equal, for example \(\angle 2=\angle 6\). <b>Why.</b> Parallel lines are copies of each other: slide line \(m\) along the transversal until it lies on \(n\). A slide does not turn anything, so the angle that \(m\) makes with \(t\) is the same angle that \(n\) makes with \(t\). If \(n\) were tilted, sliding \(m\) would leave a gap between the lines that grows on one side, and the lines would meet.</p>
      <p>The converse also holds. If corresponding angles are equal, the lines are parallel. If they are not equal, the lines are not parallel. That is how a carpenter or a surveyor tests for parallel.</p>
      <h3>Everything else follows</h3>
      <p><b>Alternate interior.</b> \(\angle 6=\angle 2\) (corresponding) and \(\angle 2=\angle 3\) (vertical). So \(\angle 3=\angle 6\).</p>
      <p><b>Same-side interior.</b> \(\angle 5=\angle 1\) (corresponding) and \(\angle 1+\angle 3=180^\circ\) (linear pair). So \(\angle 3+\angle 5=180^\circ\).</p>
      <p><b>Alternate exterior.</b> \(\angle 7=\angle 3\) (corresponding) and \(\angle 3=\angle 2\) (vertical). So \(\angle 2=\angle 7\).</p>
      <p>With parallel lines, only two sizes appear: one angle \(\theta\) and its supplement \(180^\circ-\theta\). Every acute angle is equal to every other acute angle, and every obtuse angle is equal to every other obtuse angle. A right transversal makes all eight angles \(90^\circ\).</p>
      <h3>When the lines are not parallel: the exterior angle of a triangle</h3>
      <p>Tilt \(n\) and the lines meet at a point \(Q\), far away. Then \(t\), \(m\) and \(n\) form a triangle. An <em>exterior angle</em> of a triangle is made by extending one side. In the lesson's picture (the lines meet on the right), \(\angle 3\) is an exterior angle at the top corner. It is a linear pair with the triangle's inside angle there, so inside angle \(+\angle 3=180^\circ\). The three inside angles also add to \(180^\circ\). So \(\angle 3\) equals the sum of the other two inside angles:
      \[ \angle 3=\angle 6+\angle Q. \]
      The corresponding angles differ by exactly \(\angle Q\), the angle between the lines. When \(\angle Q=0\), the lines are parallel and the angles match.</p>
      <h3>Finding an unknown with algebra</h3>
      <p>1. Name the pair: equal or supplementary (or complementary)? 2. Write the equation. 3. Solve for \(x\). 4. Put \(x\) back to find the angle. 5. Check with the other angle.</p>
      <p><b>Equal pair.</b> \(\angle 4=(3x-5)^\circ\) and \(\angle 5=(2x+25)^\circ\) are alternate interior angles, so they are equal. \(3x-5=2x+25\) gives \(x=30\). Then \(\angle 4=3(30)-5=85^\circ\), and \(\angle 5=2(30)+25=85^\circ\).</p>
      <p><b>Supplementary pair.</b> Same-side interior angles \((5x+20)^\circ\) and \((3x+40)^\circ\) add to \(180^\circ\). \(8x+60=180\) gives \(x=15\). The angles are \(95^\circ\) and \(85^\circ\), and \(95^\circ+85^\circ=180^\circ\).</p>
      <h3>Angle chase: a reason for every step</h3>
      <p>To find a missing angle, write one step at a time, and give a reason for each. "It looks equal" is not a reason. Allowed reasons: given, vertical angles, linear pair, complementary, and (for parallel lines only) corresponding, alternate interior, alternate exterior, and same-side interior.</p>
      <p><b>Example.</b> \(m\parallel n\) and \(\angle 2=64^\circ\). Find \(\angle 5\).<br>
      1. \(\angle 6=64^\circ\), because corresponding angles are equal when \(m\parallel n\).<br>
      2. \(\angle 5=180^\circ-64^\circ=116^\circ\), because \(\angle 5\) and \(\angle 6\) are a linear pair.</p>`,
    check: [
      { q: String.raw`Two lines are cut by a transversal. Which statement about corresponding angles is correct?`,
        choices: [String.raw`They are equal for any two lines.`, String.raw`They always add to \(180^\circ\).`, String.raw`They are equal exactly when the two lines are parallel.`, String.raw`They are equal only when the transversal is perpendicular to the lines.`], answer: 2,
        why: String.raw`Parallel lines make equal corresponding angles, and equal corresponding angles tell you the lines are parallel. For lines that are not parallel, the corresponding angles are different. They add to \(180^\circ\) only in special cases, such as a right transversal.`,
        hint: String.raw`Think of tilting one track. Do the corresponding angles stay matched?` },
      { q: String.raw`Lines \(m\) and \(n\) are parallel. A transversal makes two alternate interior angles of \((4x-8)^\circ\) and \((2x+30)^\circ\). What is the size of the angle that makes a linear pair with the first one?`,
        choices: [String.raw`\(68^\circ\)`, String.raw`\(112^\circ\)`, String.raw`\(76^\circ\)`, String.raw`\(142^\circ\)`], answer: 1,
        why: String.raw`Alternate interior angles are equal: \(4x-8=2x+30\), so \(2x=38\) and \(x=19\). The first angle is \(4(19)-8=68^\circ\). A linear pair adds to \(180^\circ\), so the partner is \(180^\circ-68^\circ=112^\circ\).`,
        hint: String.raw`Set the two expressions equal and solve for x. Then find the angle, and then its linear partner.` },
      { q: String.raw`Lines \(m\) and \(n\) are parallel. Angle A is between the lines, left of the transversal, at line \(m\), and measures \(70^\circ\). Angle B is between the lines, right of the transversal, at line \(n\). A student writes: "A and B are same-side interior angles, so they add to \(180^\circ\), so B \(=110^\circ\)." Which statement is correct?`,
        choices: [String.raw`The student is right: B \(=110^\circ\).`, String.raw`B \(=70^\circ\), because A and B are corresponding angles.`, String.raw`B \(=70^\circ\), because A and B are vertical angles.`, String.raw`B \(=70^\circ\), because A and B are alternate interior angles, not same-side.`], answer: 3,
        why: String.raw`A and B are between the lines but on opposite sides of the transversal. That makes them alternate interior angles, which are equal when the lines are parallel. The student used the rule for same-side interior angles, which are on the same side. Corresponding and vertical give the right size but the wrong name, so the reason would be marked wrong.`,
        hint: String.raw`Which side of the transversal is each angle on? Same side, or opposite sides?` }
    ],
    links: { related: ['parallel-and-perpendicular-lines', 'similarity-and-scaling', 'inscribed-angles', 'angles-in-triangles-and-polygons', 'rigid-motions-and-congruence', 'area-by-decomposition'] },

    mount({ stage, controls: C }) {
      /* th: angle of the transversal with m (this is also the size of angle 2). tilt: how far line n is turned from parallel. rho: the extra ray, measured from m. */
      const st = { th: 65, tilt: 0, rho: 30 };
      const fl = { mode: 'explore', sel: 1, hl: [], lab: null, ray: false, deg: true, rels: ['vertical', 'linear'], prac: false };
      let H = 2.1, HY = 3.8, narrow = false;
      const TILT = 15;
      let cancel = () => {}, target = null, curPatch = null, downOnHandle = false;
      const finish = () => { cancel(); if (target) { Object.assign(st, target); target = null; } };
      const run = (patch, ms) => { finish(); target = patch; cancel = animateTo(st, patch, ms, sync, () => { target = null; }); };
      const P = new Plane(stage, { cx: 0, cy: 0, span: 6 });

      /* ---------- geometry ---------- */
      const parallel = () => st.tilt < 0.5;
      const cotTh = () => 1 / Math.tan(rad(st.th));
      const pt1 = () => [H * cotTh(), H];
      const pt2 = () => {
        const t = -H * Math.cos(rad(st.tilt)) / Math.sin(rad(st.th - st.tilt));
        return [t * Math.cos(rad(st.th)), t * Math.sin(rad(st.th))];
      };
      /* angle n: its vertex, its two bounding directions and its size */
      const info = n => {
        const loc = n > 4 ? 1 : 0, al = loc ? st.tilt : 0, th = st.th, s = SECT[(n - 1) % 4], v = loc ? pt2() : pt1();
        const [a0, a1] = s === 'B' ? [th, al + 180] : s === 'A' ? [al, th] : s === 'C' ? [al + 180, th + 180] : [th + 180, al + 360];
        return { n, x: v[0], y: v[1], a0, a1, m: a1 - a0, al };
      };
      /* a click or tap: which of the eight angles is at this pixel? */
      const angleAt = (mx, my) => {
        let best = null, bd = Math.min(86, P.scale * 3.2);
        for (const loc of [0, 1]) {
          const v = loc ? pt2() : pt1(), d = Math.hypot(P.X(v[0]) - mx, P.Y(v[1]) - my);
          if (d < bd) { bd = d; best = loc; }
        }
        if (best === null) return null;
        const v = best ? pt2() : pt1(), al = best ? st.tilt : 0;
        let a = Math.atan2(-(my - P.Y(v[1])), mx - P.X(v[0])) * 180 / Math.PI - al;
        a = ((a % 360) + 360) % 360;
        const phi = st.th - al, k = a < phi ? 1 : a < 180 ? 0 : a < 180 + phi ? 2 : 3;   /* index in SECT: B, A, C, D */
        return best * 4 + k + 1;
      };

      /* ---------- colors and labels ---------- */
      const role = n => {
        if (fl.prac || fl.mode === 'predict') return fl.hl.includes(n) ? (n === fl.hl[0] ? 'hl0' : 'hl1') : null;
        if (fl.sel == null) return null;
        if (n === fl.sel) return 'sel';
        const r = relOf(fl.sel, n);
        if (!r || !fl.rels.includes(r)) return null;
        if (NEEDS_PAR[r] && !parallel()) return 'ghost';
        return EQUAL[r] ? 'eq' : 'sup';
      };
      const labelFor = n => {
        if (fl.ray && n === 2) return null;
        if (fl.lab && fl.lab[n] != null) return fl.lab[n];
        return fl.deg ? `∠${n} = ${deg(sizeOf(n, st.th, st.tilt))}°` : `∠${n}`;
      };

      /* ---------- drawing ---------- */
      let sx = 1;
      P.onDraw = (c, p) => {
        narrow = p.w / p.h < .9; H = narrow ? 2.5 : 2.1; HY = H + (narrow ? 2.5 : 1.7);
        const Wv = narrow ? 11.4 : 13.2, sc0 = Math.min(p.w / Wv, p.h / (2 * (HY + .9))); p.span = Math.min(p.w, p.h) / (2 * sc0); p.cx = 0; p.cy = 0;
        const pal = p.pal, sc = p.scale, fs = clamp(sc * .5, 13.5, 17), arcR = clamp(sc * 1.05, 21, 34);
        const th = st.th, tilt = st.tilt, cot = cotTh();
        const halo = (s, x, y, size, col, bold) => {
          c.font = `${bold ? 700 : 600} ${size}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
          c.lineWidth = 4; c.lineJoin = 'round'; c.strokeStyle = pal.stage; c.strokeText(s, x, y); c.fillStyle = col; c.fillText(s, x, y);
        };
        const text = (s, x, y, size, col, bold) => halo(s, x, y, size, col, bold);

        /* the lines */
        const nPts = s => [s * Math.cos(rad(tilt)), -H + s * Math.sin(rad(tilt))];
        p.path([[-7.5, H], [7.5, H]], { stroke: pal.blue, width: 3.6 });
        p.path([nPts(-7.5), nPts(7.5)], { stroke: pal.blue, width: 3.6 });
        const tl = (HY + .35) / Math.sin(rad(th));
        p.path([[-tl * Math.cos(rad(th)), -tl * Math.sin(rad(th))], [tl * Math.cos(rad(th)), tl * Math.sin(rad(th))]], { stroke: pal.violet, width: 3.4 });
        /* arrow marks for parallel */
        const pa = clamp(1 - tilt / 3, 0, 1);
        if (pa > .02) {
          c.save(); c.globalAlpha = pa; c.strokeStyle = pal.blue; c.lineWidth = 2.6; c.lineCap = 'round';
          for (const [mx, my, ang] of [[4.7, H, 0], [4.7 * Math.cos(rad(tilt)), -H + 4.7 * Math.sin(rad(tilt)), tilt]]) {
            const x = p.X(mx), y = p.Y(my), a = rad(ang), L = clamp(sc * .3, 8, 11);
            c.beginPath(); c.moveTo(x - L * Math.cos(a - .7) - L * .3, y + L * Math.sin(a - .7)); c.lineTo(x - L * .3, y); c.lineTo(x - L * Math.cos(a + .7) - L * .3, y + L * Math.sin(a + .7)); c.stroke();
          }
          c.restore();
        }
        /* names of the lines */
        const xl = -(Wv / 2 - .7), nl = nPts(xl);
        text('m', p.X(xl), p.Y(H) - 17, fs + 4, pal.blue, true);
        text('n', p.X(nl[0]), p.Y(nl[1]) - 17, fs + 4, pal.blue, true);
        text('t', p.X(tl * Math.cos(rad(th))), p.Y(tl * Math.sin(rad(th))) - 15, fs + 4, pal.violet, true);

        /* angles: wedges first */
        const infos = [1, 2, 3, 4, 5, 6, 7, 8].map(info);
        infos.forEach(a => {
          const r = role(a.n), R = arcR * (r ? 1.18 : 1);
          if (fl.ray && a.n === 2) return;
          const col = r === 'sel' || r === 'hl0' ? pal.yellow : r === 'eq' ? pal.green : r === 'sup' ? pal.red : r === 'hl1' ? pal.violet : null;
          if (r === 'ghost') {
            arcLine(p, a.x, a.y, a.a0, a.a1, R, pal.muted, 2.4, [5, 5]);
          } else if (col) {
            wedge(p, a.x, a.y, a.a0, a.a1, R, alpha(col, .34));
            if (Math.abs(a.m - 90) < .5) corner(p, a.x, a.y, a.a0, a.a1, R * .62, col); else arcLine(p, a.x, a.y, a.a0, a.a1, R, col, 3);
          } else if (Math.abs(a.m - 90) < .5) corner(p, a.x, a.y, a.a0, a.a1, R * .55, alpha(pal.muted, .8));
          else arcLine(p, a.x, a.y, a.a0, a.a1, R, alpha(pal.muted, .7), 1.8);
        });

        /* the extra ray in angle 2 */
        if (fl.ray) {
          const v = pt1(), rr = st.rho, len = Math.max(1.9, 76 / sc);
          const tip = [v[0] + len * Math.cos(rad(rr)), v[1] + len * Math.sin(rad(rr))];
          wedge(p, v[0], v[1], 0, rr, arcR * 1.25, alpha(pal.green, .34)); wedge(p, v[0], v[1], rr, th, arcR * 1.25, alpha(pal.red, .3));
          arcLine(p, v[0], v[1], 0, rr, arcR * 1.25, pal.green, 3); arcLine(p, v[0], v[1], rr, th, arcR * 1.25, pal.red, 3);
          p.path([v, tip], { stroke: pal.text, width: 2.6, dash: [7, 5] });
          const lab = (a0, a1, nm, col) => {
            const b = rad((a0 + a1) / 2), rl = arcR * 1.25 + 15 + (a1 - a0 < 30 ? (30 - (a1 - a0)) * .6 : 0);
            text(nm, p.X(v[0]) + rl * Math.cos(b), p.Y(v[1]) - rl * Math.sin(b), fs + 2, col, true);
          };
          lab(0, rr, 'a', pal.green); lab(rr, th, 'b', pal.red);
          const cap = fl.lab && fl.lab.a ? `${fl.lab.a}    ${fl.lab.b}` : `a = ${deg(rr)}°    b = ${deg(th - rr)}°    a + b = ${deg(th)}°`;
          const csz = clamp(sc * .46, 13, 15.5); c.font = `700 ${csz}px ${FONT}`;
          text(cap, 30 + c.measureText(cap).width / 2, 46, csz, pal.text, true);
          if (!fl.prac) { p.dot(tip[0], tip[1], 8.5, pal.stage, pal.brass, 3); p.dot(tip[0], tip[1], 3.4, pal.text); }
        }

        /* angle labels */
        infos.forEach(a => {
          const s = labelFor(a.n); if (!s) return;
          const r = role(a.n), bold = !!r && r !== 'ghost', size = fs;
          c.font = `${bold ? 700 : 600} ${size}px ${FONT}`;
          const w = c.measureText(s).width, b = rad((a.a0 + a.a1) / 2), vx = p.X(a.x), vy = p.Y(a.y);
          const hw = w / 2 + 5, hh = size * .55 + 4, R0 = arcR * (r ? 1.18 : 1) + 6;
          /* push the label out along the bisector until its box clears both sides of the angle */
          let rl = R0 + Math.min(hw * Math.abs(Math.cos(b)) + hh * Math.abs(Math.sin(b)), hw);
          for (let g = 0; g < 40; g++, rl += 3) {
            const x = vx + rl * Math.cos(b), y = vy - rl * Math.sin(b);
            const hit = [a.a0, a.a1].some(an => { for (let t = 0; t < rl + w; t += 4) { const qx = vx + t * Math.cos(rad(an)), qy = vy - t * Math.sin(rad(an)); if (Math.abs(qx - x) < hw && Math.abs(qy - y) < hh) return true; } return false; });
            if (!hit) break;
          }
          const x = clamp(vx + rl * Math.cos(b), w / 2 + 3, p.w - w / 2 - 3), y = clamp(vy - rl * Math.sin(b), size, p.h - size);
          text(s, x, y, size, r === 'sel' || r === 'hl0' ? pal.text : r === 'hl1' ? pal.violet : r === 'eq' ? pal.green : r === 'sup' ? pal.red : r === 'ghost' ? pal.text : pal.text, bold);
        });

        /* the two crossing points and the handle */
        const q1 = pt1(), q2 = pt2();
        p.dot(q1[0], q1[1], 4.5, pal.text); p.dot(q2[0], q2[1], 4.5, pal.text);
        if (!fl.prac) {
          const hx = HY * cot, hy = HY;
          p.dot(hx, hy, 9.5, pal.stage, pal.brass, 3); p.dot(hx, hy, 3.6, pal.violet);
          if (!narrow) text('drag', p.X(hx) + (hx > 3.2 ? -26 : 26), p.Y(hy) - 2, 13, pal.muted, false);
        }
        /* status */
        const s1 = parallel() ? 'Lines m and n are parallel' : `Lines m and n are NOT parallel (n is tilted ${deg(tilt)}°)`;
        const sz1 = clamp(sc * .46, 13, 15.5); c.font = `700 ${sz1}px ${FONT}`;
        text(s1, 30 + c.measureText(s1).width / 2, 24, sz1, parallel() ? pal.green : pal.red, true);
      };

      /* ---------- text panels ---------- */
      const dot = col => `<span style="display:inline-block;width:.7em;height:.7em;border-radius:50%;background:var(--${col});margin-right:.4em"></span>`;
      const exploreHTML = () => {
        const rows = [];
        if (fl.ray) {
          const a = deg(st.rho), b = deg(st.th - st.rho), t = deg(st.th);
          rows.push(`<b>The ray splits ∠2 (${t}°) into a = ${a}° and b = ${b}°.</b>`);
          rows.push(t === 90 ? `a + b = ${a}° + ${b}° = 90°. ${dot('green')}a and ${dot('red')}b are <b>complementary</b>.`
            : `a + b = ${a}° + ${b}° = ${t}°. This is not 90°, so a and b are not complementary. Set the transversal angle to 90° to get a right-angle corner.`);
          return rows.join('<br>');
        }
        if (fl.sel == null) return '<b>Pick an angle</b>: click it in the picture, or choose it in the list. Its partners light up. ' + dot('green') + 'green: equal to it. ' + dot('red') + 'red: adds to 180° with it.';
        const s = fl.sel, ds = deg(sizeOf(s, st.th, st.tilt));
        rows.push(`${dot('yellow')}<b>∠${s} = ${ds}°</b>`);
        const list = [];
        for (let n = 1; n <= 8; n++) { if (n === s) continue; const r = relOf(s, n); if (r && fl.rels.includes(r)) list.push([KINDS.indexOf(r), n, r]); }
        list.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
        for (const [, n, r] of list) {
          const dn = deg(sizeOf(n, st.th, st.tilt)), cap = REL_CAP[r];
          if (NEEDS_PAR[r] && !parallel()) {
            rows.push(`${dot('muted')}∠${n} · ${cap}: ${EQUAL[r] ? 'equal' : 'add to 180°'} only if the lines are parallel. Here ∠${s} = ${ds}° and ∠${n} = ${dn}°${EQUAL[r] ? '' : `, sum ${ds + dn}°`}.`);
          } else if (EQUAL[r]) rows.push(`${dot('green')}∠${n} · ${cap}: equal, ${dn}°.`);
          else rows.push(`${dot('red')}∠${n} · ${cap}: ${ds}° + ${dn}° = 180°.`);
        }
        return rows.join('<br>');
      };
      const upd = () => {
        roA.style.display = fl.mode === 'explore' && !fl.prac ? '' : 'none';
        roA.innerHTML = exploreHTML();
        updPredLive();
        rayBox.forEach(e => { e.style.display = fl.ray && !fl.prac ? '' : 'none'; });
      };
      const sync = () => { upd(); P.draw(); };

      /* ---------- predict, then see ---------- */
      let predPick = -1, predFb, predLive, predBtns = [];
      const predOpts = [
        { t: 'They are equal.', ok: true },
        { t: 'They add up to 180°.', ok: false },
        { t: 'There is no pattern. It depends on the angle.', ok: false }
      ];
      const buildPred = () => {
        predPick = -1;
        predFb = h('div', { 'aria-live': 'polite' }); predLive = h('div', { style: 'margin-top:8px' });
        predBtns = predOpts.map((o, i) => h('button', {
          type: 'button', class: 'btn small', style: 'justify-content:flex-start;text-align:left;white-space:normal',
          onclick: () => {
            if (predPick >= 0) return;
            predPick = i; fl.deg = true; tgDeg.checked = true;
            const a = deg(sizeOf(2, st.th, st.tilt)), b = deg(sizeOf(6, st.th, st.tilt));
            predBtns.forEach((bt, j) => { bt.disabled = true; if (j === i) { bt.style.borderColor = o.ok ? 'var(--green)' : 'var(--red)'; bt.style.borderWidth = '2px'; } });
            predFb.innerHTML = o.ok
              ? `<b style="color:var(--green)">Yes.</b> ∠2 = ${a}° and ∠6 = ${b}°. When the lines are parallel, the road meets both at the same angle. Now switch off "Lines m and n are parallel" and watch ∠6.`
              : `<b style="color:var(--red)">Not quite.</b> The sizes are ∠2 = ${a}° and ∠6 = ${b}°. ${i === 1 ? `They are equal, not supplementary: ${a}° + ${b}° = ${a + b}°, not 180°.` : 'There is a pattern: they are equal, and they stay equal when you drag the transversal.'} Now switch off "Lines m and n are parallel" and watch ∠6.`;
            refreshLocks(); sync();
          }
        }, o.t));
        roPred.replaceChildren(h('span', { class: 'k' }, 'Predict. How do ∠2 and ∠6 compare when the lines are parallel?'),
          h('div', { style: 'display:flex;flex-direction:column;gap:8px;margin:10px 0' }, predBtns), predFb, predLive);
      };
      const updPredLive = () => {
        const on = fl.mode === 'predict' && !fl.prac;
        roPred.style.display = on ? '' : 'none';
        if (!on || !predLive) return;
        if (predPick < 0) { predLive.innerHTML = ''; return; }
        const a = deg(sizeOf(2, st.th, st.tilt)), b = deg(sizeOf(6, st.th, st.tilt));
        predLive.innerHTML = `<span class="k">Now</span> ∠2 = ${a}°, ∠6 = ${b}°. ` + (parallel() ? 'Equal.' : `Not equal: they differ by ${a - b}°. The lines are not parallel, so the pair no longer matches. Equal corresponding angles need parallel lines.`);
      };

      /* ---------- controls ---------- */
      const host0 = C.readout(), host = host0.parentElement; host0.remove();
      const mark = fn => { const before = new Set(host.children); fn(); return [...host.children].filter(e => !before.has(e)); };
      let sliderTh, sliderRay, tgPar, tgDeg, selEl;
      const exGroup = mark(() => {
        C.title('Transversal and lines');
        sliderTh = C.slider({ label: 'Angle of the transversal (this is ∠2)', min: 45, max: 135, step: 1, value: st.th, format: v => v + '°', onInput: v => { finish(); st.th = v; st.rho = clamp(st.rho, 5, v - 5); sliderRay.set(st.rho); sync(); } });
        tgPar = C.toggle({ label: 'Lines m and n are parallel', value: true, onChange: v => { run({ tilt: v ? 0 : TILT }, 600); } });
        tgDeg = C.toggle({ label: 'Show the sizes of the angles', value: fl.deg, onChange: v => { fl.deg = v; sync(); } });
        selEl = C.select({ label: 'Pick an angle (or click it)', value: String(fl.sel || 0), onChange: v => { fl.sel = +v || null; sync(); },
          options: [{ value: '0', label: 'None' }, ...[1, 2, 3, 4, 5, 6, 7, 8].map(n => ({ value: String(n), label: 'Angle ' + n }))] });
      });
      const rayBox = mark(() => {
        C.title('The extra ray');
        sliderRay = C.slider({ label: 'Ray angle a (from line m)', min: 5, max: 145, step: 1, value: st.rho, format: v => v + '°', onInput: v => { finish(); st.rho = clamp(v, 5, st.th - 5); sliderRay.set(st.rho); sync(); } });
      });
      const roA = C.readout(), roPred = C.readout();
      roPred.style.display = 'none';
      C.hint('Drag the ring at the top of the road, or use the slider. Click an angle in the picture to see its partners.');
      C.title('Practice');
      const roP = C.readout();
      const exInputs = [...exGroup, ...rayBox].flatMap(e => [...e.querySelectorAll('input,select')]);
      const refreshLocks = () => {
        exInputs.forEach(i => { i.disabled = fl.prac; });
        tgDeg.disabled = fl.prac || (fl.mode === 'predict' && predPick < 0);
        selEl.disabled = fl.prac || fl.mode !== 'explore';
      };

      /* ---------- dragging and clicking ---------- */
      const handles = () => {
        const out = [];
        if (fl.prac) return out;
        if (fl.ray) { const v = pt1(), len = Math.max(1.9, 76 / P.scale); out.push(['r', v[0] + len * Math.cos(rad(st.rho)), v[1] + len * Math.sin(rad(st.rho))]); }
        out.push(['t', HY * cotTh(), HY]);
        return out;
      };
      const hitHandle = (mx, my) => {
        let best = null, bd = clamp(P.scale * .6, 16, 24);
        for (const [k, x, y] of handles()) { const d = Math.hypot(P.X(x) - mx, P.Y(y) - my); if (d < bd) { bd = d; best = k; } }
        return best;
      };
      draggable(P, {
        hit: (mx, my) => { const k = hitHandle(mx, my); downOnHandle = k != null; return k; },
        hover: (mx, my) => hitHandle(mx, my) != null,
        move: (hd, x, y) => {
          finish();
          if (hd === 't') {
            let a = Math.atan2(y, x) * 180 / Math.PI; if (a < 0) a += 180;
            st.th = clamp(snap(a, 1), 45, 135); st.rho = clamp(st.rho, 5, st.th - 5);
            sliderTh.set(st.th); sliderRay.set(st.rho);
          } else {
            const v = pt1(); let a = Math.atan2(y - v[1], x - v[0]) * 180 / Math.PI;
            st.rho = clamp(snap(a, 1), 5, st.th - 5); sliderRay.set(st.rho);
          }
          sync();
        }
      });
      P.canvas.addEventListener('click', e => {
        if (downOnHandle) { downOnHandle = false; return; }
        if (fl.mode !== 'explore' || fl.prac || fl.ray) return;
        const r = P.canvas.getBoundingClientRect(), n = angleAt(e.clientX - r.left, e.clientY - r.top);
        fl.sel = n; selEl.value = String(n || 0); sync();
      });

      /* ---------- practice ---------- */
      const pr = { i: 0, j: 0, score: 0, clean: true, log: [], known: [] };
      const N = PROBS.length;
      const chaseGroups = (prob, part) => {
        const a = part.from, b = part.to, kd = deg(sizeOf(a, prob.th, prob.tilt)), tv = deg(sizeOf(b, prob.th, prob.tilt)), rel = relOf(a, b);
        return [
          { label: 'Which rule links them?', choices: part.reasons.map(k => REASON[k]), ans: part.reasons.indexOf(rel),
            wrong: k => `<b>Not that rule.</b> "${REASON[part.reasons[k]]}" needs angles that ${DESC[part.reasons[k]]}. But ∠${a} and ∠${b} ${DESC[rel]}.`,
            right: () => `<b>Yes.</b> ∠${a} and ∠${b} ${DESC[rel]}. The rule is: ${REASON[rel].toLowerCase()}.` },
          { label: `How big is ∠${b}?`, choices: part.vals.map(v => v + '°'), ans: part.vals.indexOf(tv),
            wrong: k => `<b>Not ${part.vals[k]}°.</b> ${EQUAL[rel] ? `These angles are equal, so ∠${b} is the same size as ∠${a}: ${kd}°.` : `These angles add to 180°, so ∠${b} = 180° − ${kd}° = ${tv}°.`}`,
            right: () => `<b>Yes.</b> ${EQUAL[rel] ? `∠${b} = ∠${a} = ${tv}°.` : `∠${b} = 180° − ${kd}° = ${tv}°.`}` }
        ];
      };
      const partGroups = (prob, part) => {
        if (part.k === 'chase') return chaseGroups(prob, part);
        if (part.k === 'name') {
          const rel = relOf(part.a, part.b), da = deg(sizeOf(part.a, prob.th, prob.tilt)), db = deg(sizeOf(part.b, prob.th, prob.tilt));
          return [{ label: `Which name fits ∠${part.a} (yellow) and ∠${part.b} (violet)?`, choices: KINDS.map(k => REL_CAP[k]), ans: KINDS.indexOf(rel),
            wrong: k => `<b>Not ${REL_NAME[KINDS[k]]}.</b> ${DEF[KINDS[k]]} But ∠${part.a} and ∠${part.b} ${DESC[rel]}.`,
            right: () => `<b>Yes: ${REL_NAME[rel]}.</b> ∠${part.a} and ∠${part.b} ${DESC[rel]}. ` +
              (EQUAL[rel] ? `When the lines are parallel they are equal: both ${da}°.` : `When the lines are parallel they add to 180°: ${da}° + ${db}° = 180°.`) }];
        }
        return [{ label: '', choices: part.choices, ans: part.ans, wrong: k => `<b>Not quite.</b> ${part.fb[k]}`, right: () => `<b>Yes.</b> ${part.right}` }];
      };
      /* what the picture shows while this part is open */
      const partView = (prob, j) => {
        const part = prob.parts[j];
        if (part.k === 'name') return { hl: [part.a, part.b], lab: null };
        if (part.k === 'chase') {
          const lab = {};
          pr.known.forEach(n => { lab[n] = `∠${n} = ${deg(sizeOf(n, prob.th, prob.tilt))}°`; });
          lab[part.to] = `∠${part.to} = ?`;
          return { hl: [part.from, part.to], lab };
        }
        return { hl: prob.hl || [], lab: prob.lab || null };
      };
      const practiceLock = on => { fl.prac = on; refreshLocks(); };
      const showStart = () => {
        roP.replaceChildren(h('p', { style: 'margin:0 0 10px' }, `${N} short problems: name a pair, chase a missing angle with a reason for every step, and solve for x. Each answer explains itself.`),
          h('button', { type: 'button', class: 'btn primary', onclick: startPractice }, pr.i >= N ? 'Practice again' : 'Start practice'));
      };
      const endPractice = restore => {
        if (!fl.prac && !restore) return;
        fl.prac = false; fl.lab = null; refreshLocks();
        if (restore && curPatch) { const keep = curPatch; apply(keep, true); }
        showStart();
      };
      const startPractice = () => {
        pr.i = 0; pr.score = 0; loadProblem();
      };
      const loadProblem = () => {
        const prob = PROBS[pr.i];
        pr.j = 0; pr.clean = true; pr.log = []; pr.known = (prob.given || []).slice();
        finish(); predPick = -1;
        fl.mode = 'practice'; fl.sel = null; fl.ray = prob.ray != null; fl.deg = false; fl.prac = true; fl.rels = KINDS;
        st.rho = prob.ray != null ? prob.ray : st.rho;
        refreshLocks();
        run({ th: prob.th, tilt: prob.tilt }, 700);
        renderPart();
      };
      const renderPart = () => {
        const prob = PROBS[pr.i], part = prob.parts[pr.j], view = partView(prob, pr.j), groups = partGroups(prob, part);
        fl.hl = view.hl; fl.lab = view.lab;
        const done = pr.i, fbBox = [], nextBox = h('div', { style: 'margin-top:10px' });
        const head = h('div', { style: 'display:flex;justify-content:space-between;gap:10px;margin-bottom:8px' },
          h('span', { class: 'k' }, `Problem ${pr.i + 1} of ${N}`), h('span', { class: 'k' }, `First try: ${pr.score} of ${done}`));
        const kids = [head];
        if (pr.log.length) kids.push(h('div', { style: 'margin-bottom:8px', html: pr.log.map(s => '✓ ' + s).join('<br>') }));
        if (part.k === 'chase') kids.push(h('p', { style: 'margin:0 0 6px', html: `<b>Lines m and n are parallel.</b> ${pr.log.length ? '' : `Given: ∠${prob.given[0]} = ${deg(sizeOf(prob.given[0], prob.th, prob.tilt))}°. `}Find ∠${part.to} (violet) using ∠${part.from} (yellow). Every step needs a rule.` }));
        else if (part.k === 'mc') kids.push(h('p', { style: 'margin:0 0 6px', html: part.q }));
        let left = groups.length;
        groups.forEach(g => {
          const fb = h('div', { 'aria-live': 'polite', style: 'margin-top:6px' });
          const btns = g.choices.map((txt, k) => h('button', {
            type: 'button', class: 'btn small', style: 'justify-content:flex-start;text-align:left;white-space:normal',
            onclick: () => {
              if (k === g.ans) {
                btns.forEach((b, j) => { b.disabled = true; if (j === k) { b.style.borderColor = 'var(--green)'; b.style.borderWidth = '2px'; } });
                fb.innerHTML = g.right(); left--;
                if (left === 0) finishPart();
              } else {
                pr.clean = false; btns[k].disabled = true; btns[k].style.borderColor = 'var(--red)'; btns[k].style.borderWidth = '2px';
                fb.innerHTML = g.wrong(k);
              }
            }
          }, txt));
          kids.push(h('div', { style: 'margin:8px 0' }, g.label ? h('span', { class: 'k', style: 'display:block;margin-bottom:6px' }, g.label) : null,
            h('div', { style: 'display:flex;flex-direction:column;gap:8px' }, btns), fb));
          fbBox.push(fb);
        });
        const finishPart = () => {
          const last = pr.j === prob.parts.length - 1;
          if (part.k === 'chase') pr.log.push(`∠${part.to} = ${deg(sizeOf(part.to, prob.th, prob.tilt))}° (${REASON[relOf(part.from, part.to)].toLowerCase().replace(' (lines parallel)', '')})`);
          if (part.k === 'chase') pr.known.push(part.to);
          if (last && pr.clean) pr.score++;
          fl.lab = part.k === 'chase' ? partViewAfter(prob, part) : fl.lab; P.draw();
          nextBox.replaceChildren(h('button', { type: 'button', class: 'btn primary', onclick: () => {
            if (!last) { pr.j++; renderPart(); }
            else if (pr.i + 1 < N) { pr.i++; loadProblem(); }
            else showEnd();
          } }, !last ? 'Next step' : pr.i + 1 < N ? 'Next problem' : 'See my score'));
        };
        kids.push(nextBox, h('div', { style: 'margin-top:10px' }, h('button', { type: 'button', class: 'btn small', onclick: () => endPractice(true) }, 'Stop practice')));
        roP.replaceChildren(...kids);
        sync();
      };
      const partViewAfter = (prob, part) => {
        const lab = {};
        pr.known.forEach(n => { lab[n] = `∠${n} = ${deg(sizeOf(n, prob.th, prob.tilt))}°`; });
        return lab;
      };
      const showEnd = () => {
        pr.i = N;
        roP.replaceChildren(h('p', { style: 'margin:0 0 10px', html: `<b>You got ${pr.score} of ${N} problems right on the first try.</b> ${pr.score === N ? 'Every problem, first try.' : 'The ones you missed are worth another look: read each explanation, then try again.'}` }),
          h('button', { type: 'button', class: 'btn primary', onclick: startPractice }, 'Practice again'));
        fl.prac = false; fl.lab = null; fl.hl = []; fl.mode = 'explore'; fl.sel = null; fl.ray = false; fl.deg = true; tgDeg.checked = true; selEl.value = '0';
        refreshLocks(); sync();
      };

      /* ---------- guided steps ---------- */
      const apply = (patch, immediate) => {
        finish(); curPatch = patch; predPick = -1;
        pr.i = 0; fl.prac = false; fl.lab = null;
        const { mode, sel, hl, ray, deg: dg, rels, ...rest } = patch;
        if (mode !== undefined) fl.mode = mode;
        if (sel !== undefined) { fl.sel = sel; selEl.value = String(sel || 0); }
        if (hl !== undefined) fl.hl = hl;
        if (ray !== undefined) fl.ray = ray;
        if (dg !== undefined) { fl.deg = dg; tgDeg.checked = dg; }
        if (rels !== undefined) fl.rels = rels;
        if (rest.th !== undefined) sliderTh.set(rest.th);
        if (rest.rho !== undefined) sliderRay.set(rest.rho);
        if (rest.tilt !== undefined) tgPar.checked = rest.tilt < .5;
        if (fl.mode === 'predict') buildPred();
        refreshLocks(); showStart();
        if (immediate) { Object.assign(st, rest); sync(); } else run(rest, 800);
      };
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
