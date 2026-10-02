/* =====================================================================
   SCHOOL — Polar form and roots of unity
   ===================================================================== */
{
  const D2R = Math.PI / 180, R2D = 180 / Math.PI, MI = '−', S3 = Math.sqrt(3);
  const rd = v => Math.round(v * 1e8) / 1e8;
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;
  const SUPD = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const sup = n => String(n).split('').map(d => SUPD[+d]).join('');
  const m360 = d => ((rd(d) % 360) + 360) % 360;
  const sn = (v, s) => rd(snap(v, s));
  const pt = (r, d) => [r * Math.cos(d * D2R), r * Math.sin(d * D2R)];

  /* a number as p/q times a square root when it is one of the usual exact values, else two decimals */
  const ex = v => {
    v = rd(v);
    if (v === 0) return '0';
    const s = v < 0 ? MI : '', w = Math.abs(v);
    for (const m of [1, 2, 3, 5, 6]) for (const q of [1, 2, 3, 4, 6]) {
      const p = w * q / Math.sqrt(m), pr = Math.round(p);
      if (pr > 0 && pr <= 60 && Math.abs(p - pr) < 1e-7) {
        const top = m === 1 ? String(pr) : (pr === 1 ? '' : pr) + '√' + m;
        return s + top + (q > 1 ? '/' + q : '');
      }
    }
    return s + w.toFixed(2);
  };
  /* exact form with a decimal after it when it is not a plain integer or fraction */
  const exa = v => { const t = ex(v); return t.includes('√') ? t + ' ≈ ' + (v < 0 ? MI : '') + Math.abs(v).toFixed(2) : t; };
  const par = v => { const t = ex(v); return (v < 0 || t.includes('√') || t.includes('/')) ? `(${t})` : t; };
  const imag = w => { const t = w === 1 ? '' : ex(w); return t === '' ? 'i' : t.includes('/') ? `(${t}) i` : t.includes('√') ? t + ' i' : t + 'i'; };
  const cx = (a, b) => {
    a = rd(a); b = rd(b);
    if (a === 0 && b === 0) return '0';
    if (a === 0) return (b < 0 ? MI : '') + imag(Math.abs(b));
    if (b === 0) return ex(a);
    return ex(a) + (b < 0 ? ' − ' : ' + ') + imag(Math.abs(b));
  };
  const fd = x => { const r = Math.round(x); return Math.abs(x - r) < .005 ? String(r) : x.toFixed(1); };
  const dg = x => (x < 0 ? MI : '') + fd(Math.abs(x)) + '°';
  const piF = deg => {
    const x = deg / 180;
    for (const q of [1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 24]) {
      const p = Math.round(x * q);
      if (Math.abs(x * q - p) < 1e-6) { if (p === 0) return '0'; const ap = Math.abs(p); return (p < 0 ? MI : '') + (ap === 1 ? 'π' : ap + 'π') + (q > 1 ? '/' + q : ''); }
    }
    return (deg * D2R).toFixed(2) + ' rad';
  };
  const polOf = (a, b) => { const r = Math.hypot(a, b); return { r, th: r < 1e-9 ? 0 : m360(Math.atan2(b, a) * R2D) }; };
  const stepFor = p => { for (const s of [.5, 1, 2, 5, 10, 20, 50, 100]) if (s * p.scale >= 34) return s; return 200; };
  const cd = v => {
    const a = Math.abs(v[0]) < .005 ? 0 : v[0], b = Math.abs(v[1]) < .005 ? 0 : v[1];
    if (b === 0) return num(a);
    if (a === 0) return num(b) + 'i';
    return num(a) + (b < 0 ? ' − ' : ' + ') + num(Math.abs(b)) + 'i';
  };
  const tk = v => (v < 0 ? MI : '') + (+Math.abs(v).toFixed(2));

  /* ---------- predictions: a short run of questions per mode ---------- */
  const GATES = {
    rect: {
      end: 'Now it is yours. Drag z, or use the sliders for a and b. Move z left of the imaginary axis and watch the dashed red ray.',
      qs: [
        { gv: 'rect', reveal: true, ans: 1,
          q: 'The point z = −1 + i has a = −1 and b = 1. What is its angle θ, measured counterclockwise from the positive real axis?',
          opts: [
            ['45°', 'That is the angle of 1 + i, in the upper right. Our point has a negative real part, so it is in the upper left.'],
            ['135°', 'The point is in the upper left, between 90° and 180°. Its two legs are equal, so it sits halfway: 90° + 45° = 135°.'],
            ['225°', 'That points into the lower left, at −1 − i. Here b = 1 is positive, so the point is above the real axis.'],
            ['−45°', 'This is what a calculator gives for tan⁻¹(b/a) = tan⁻¹(1 / −1), but it points into the lower right. Tangent repeats every 180°, so add 180° to reach the right quadrant: −45° + 180° = 135°.']
          ] },
        { gv: 'polar', reveal: true, ans: 2, patch: { a: S3, b: 1 },
          q: 'Now the point is given in polar form: r = 2 and θ = 30°. Use a = r cos θ and b = r sin θ. What is (a, b)?',
          opts: [
            ['(1, √3)', 'These are swapped. a uses cosine and b uses sine, and cos 30° = √3/2, so a is not 1.'],
            ['(√3/2, 1/2)', 'Those are cos 30° and sin 30° alone. Multiply both by r = 2 first.'],
            ['(√3, 1)', 'a = 2 cos 30° = 2 · √3/2 = √3 and b = 2 sin 30° = 2 · 1/2 = 1.'],
            ['(1/2, √3/2)', 'That swaps cosine and sine and also forgets to multiply by r = 2.']
          ] }
      ]
    },
    mul: {
      end: 'Now drag z₁ or z₂, or use the sliders. Watch the blue arrow: its length is the product of the two lengths and its angle is the sum of the two angles.',
      qs: [
        { reveal: false, ans: 1,
          q: 'z₁ has modulus 2 and angle 20°. z₂ has modulus 1.5 and angle 50°. What is the modulus of the product z₁z₂?',
          opts: [
            ['3.5', 'Moduli are lengths that stretch, so they multiply: 2 × 1.5 = 3. Adding is the rule for angles, not lengths.'],
            ['3', 'Multiplying by z₂ stretches by its modulus 1.5, so 2 × 1.5 = 3.'],
            ['0.5', 'That is 2 − 1.5. Multiplying by a number of modulus 1.5 stretches the length by a factor of 1.5, so 2 × 1.5 = 3.'],
            ['1.33', 'That is 2 ÷ 1.5, which would be division. For a product, stretch: 2 × 1.5 = 3.']
          ] },
        { reveal: true, ans: 0,
          q: 'And what is the angle of the product z₁z₂?',
          opts: [
            ['70°', 'Multiplying by z₂ turns by its angle 50°, on top of the 20° that z₁ already has: 20° + 50° = 70°.'],
            ['1000°', 'That multiplies the angles, 20 × 50. A turn adds to a turn, so angles add: 20° + 50° = 70°.'],
            ['30°', 'That subtracts, 50° − 20°. Subtracting angles belongs to division. For a product, add: 70°.'],
            ['35°', 'That averages the two angles. Turns add up rather than average: 20° + 50° = 70°.']
          ] }
      ]
    },
    pow: {
      end: 'Now change the number. Try r above 1, equal to 1, and below 1, and move θ and n. The buttons give three starting points.',
      qs: [
        { reveal: false, ans: 2,
          q: 'z = 1 + i has modulus √2 and angle 45°. What is the modulus of z⁸ = (1 + i)⁸?',
          opts: [
            ['8√2 ≈ 11.3', 'That adds √2 eight times. Each multiplication by z multiplies the modulus by √2, so you need (√2)⁸.'],
            ['√2', 'That would be the modulus of z itself. Eight multiplications by z each multiply the length by √2.'],
            ['16', '(√2)⁸ = ((√2)²)⁴ = 2⁴ = 16.'],
            ['256', 'That takes the modulus of 1 + i to be 2. It is √(1² + 1²) = √2, and (√2)⁸ = 16.']
          ] },
        { reveal: true, ans: 2,
          q: 'And the angle of (1 + i)⁸? Each multiplication by z adds 45°.',
          opts: [
            ['45°', 'That is the angle of z, but z⁸ turns by 45° eight times.'],
            ['8°', 'The angle is multiplied by 8, not replaced by 8: 8 × 45° = 360°.'],
            ['360°, a full turn (the same direction as 0°)', '8 × 45° = 360°, one full turn, so z⁸ points along the positive real axis. With modulus 16, that is the number 16.'],
            ['405°', 'That is 45° + 360°. The product is 8 × 45° = 360°.']
          ] }
      ]
    },
    root: {
      end: 'Now explore. Slide n from 2 to 12, pick another w, step through the roots, and switch on the balance chain.',
      qs: [
        { reveal: true, ans: 2,
          q: 'The cube roots of 1 solve z³ = 1. They are 3 equally spaced points on the unit circle, and 1 is one of them. At which angles are they?',
          opts: [
            ['0°, 60°, 120°', 'Equal spacing around a full 360° turn means 360° ÷ 3 = 120° apart, not 60°.'],
            ['0°, 90°, 180°', 'That spacing, 90°, belongs to 4 equally spaced points. For 3 points the spacing is 360° ÷ 3 = 120°.'],
            ['0°, 120°, 240°', 'Three equal steps around the circle: 360° ÷ 3 = 120° apart, starting at 0°.'],
            ['0°, 180°, 360°', '360° is the same point as 0°, so this lists only two different points.']
          ] },
        { reveal: true, ans: 1, patch: { rn: 4, wR: 16, wphi: 180, rk: 0 },
          q: 'Now solve z⁴ = −16. The number −16 has modulus 16 and angle 180°. At which angles are the four roots?',
          opts: [
            ['0°, 90°, 180°, 270°', 'Those are the fourth roots of 1. For −16 the whole square is rotated by 180° ÷ 4 = 45°.'],
            ['45°, 135°, 225°, 315°', 'The first root has angle 180° ÷ 4 = 45°, and the four are 360° ÷ 4 = 90° apart. The modulus of each is the fourth root of 16, which is 2.'],
            ['180°, 270°, 360°, 450°', '180° is the angle of −16 itself. The first root has angle 180° ÷ 4 = 45°.'],
            ['45°, 90°, 135°, 180°', 'The first angle 45° is right, but the spacing is 360° ÷ 4 = 90°, not 45°.']
          ] }
      ]
    }
  };

  /* ---------- practice: a fixed list ---------- */
  const PROBS = [
    { set: { mode: 'rect', gv: 'rect', a: 3, b: 3 }, ans: 1,
      q: 'Write z = 3 + 3i in polar form (r at angle θ).',
      ch: [
        ['6 at 45°', 'r is not a + b. Use r = √(a² + b²) = √(9 + 9) = √18 = 3√2.'],
        ['3√2 at 45°', 'r = √(3² + 3²) = √18 = 3√2 ≈ 4.24. Both legs are 3, so the point is on the diagonal at 45°. Both parts are positive, so it is in the first quadrant and no extra turn is needed.'],
        ['3√2 at 60°', 'The angle comes from tan θ = b/a = 3/3 = 1, and tan 45° = 1, not 60°.'],
        ['18 at 45°', 'That is r² = 9 + 9. Take the square root: r = √18 = 3√2.']
      ] },
    { set: { mode: 'rect', gv: 'rect', a: -1, b: -S3 }, ans: 2,
      q: 'Write z = −1 − √3 i in polar form. The point is in the lower left. Use 0° ≤ θ < 360°.',
      ch: [
        ['2 at 60°', 'tan⁻¹(b/a) = tan⁻¹(√3) = 60°, but that is the angle of 1 + √3 i in the upper right. Our point is in the lower left, so add 180°.'],
        ['4 at 240°', 'The angle 240° is right, but r = √(1 + 3) = 2. Do not stop before taking the square root.'],
        ['2 at 240°', 'r = √((−1)² + (−√3)²) = √4 = 2. tan⁻¹(√3) = 60°, and the point is in the lower left (a and b both negative), so add 180°: θ = 240°. (−120° is the same direction.)'],
        ['2 at 120°', '120° is in the upper left. Here b = −√3 is negative, so the point is below the real axis.']
      ] },
    { set: { mode: 'rect', gv: 'polar', a: -1, b: S3 }, ans: 0,
      q: 'A point has r = 2 and θ = 120°. Which is its rectangular form a + bi?',
      ch: [
        ['−1 + √3 i', 'a = 2 cos 120° = 2 · (−1/2) = −1 and b = 2 sin 120° = 2 · √3/2 = √3. The point is in the upper left, so a is negative and b positive.'],
        ['1 + √3 i', 'cos 120° is negative, because 120° is past 90°. So a = 2 cos 120° = −1, not 1.'],
        ['−√3 + i', 'Cosine and sine are swapped. a = r cos θ = 2 cos 120° = −1 and b = r sin θ = √3.'],
        ['−1/2 + (√3/2) i', 'Those are cos 120° and sin 120° alone. Multiply both by r = 2.']
      ] },
    { set: { mode: 'mul', r1: 2, t1: 25, r2: 1.5, t2: 65 }, ans: 3,
      q: 'z₁ has modulus 2 at angle 25°. z₂ has modulus 1.5 at angle 65°. What is z₁z₂?',
      ch: [
        ['3.5 at 90°', 'The angle is right, but moduli multiply: 2 × 1.5 = 3, not 3.5.'],
        ['3 at 1625°', 'Angles add, they do not multiply. 25° + 65° = 90°.'],
        ['3 at 40°', 'That subtracts the angles, which is for division. For a product add them: 90°.'],
        ['3 at 90°', 'Moduli multiply, 2 × 1.5 = 3, and angles add, 25° + 65° = 90°. An angle of 90° with modulus 3 is the number 3i.']
      ] },
    { set: { mode: 'pow', pr: Math.SQRT2, pt: 315, pn: 6 }, ans: 1,
      q: 'Use De Moivre to compute (1 − i)⁶. Note that 1 − i has modulus √2 and angle 315° (the same as −45°).',
      ch: [
        ['8', 'The modulus 8 = (√2)⁶ is right, but the angle is 6 × 315° = 1890° = 5 × 360° + 90°. That is 90°, which points up, not along the real axis.'],
        ['8i', '(√2)⁶ = 8. The angle is 6 × 315° = 1890°, which is 5 full turns plus 90°. So the result is 8(cos 90° + i sin 90°) = 8i.'],
        ['−8i', 'That comes from using 45° instead of 315°: 6 × 45° = 270°. The point 1 − i is below the real axis, so its angle is 315° (or −45°).'],
        ['6√2 i', 'That multiplies the modulus by 6. A power raises the modulus to the 6th power: (√2)⁶ = 8.']
      ] },
    { set: { mode: 'root', rn: 4, wR: 1, wphi: 0, rk: 0 }, ans: 0,
      q: 'List the four fourth roots of unity, the solutions of z⁴ = 1.',
      ch: [
        ['1, i, −1, −i', 'Four equally spaced points on the unit circle starting at 1: angles 0°, 90°, 180°, 270°. Check: i⁴ = 1.'],
        ['1 and −1 only', 'Those two are real fourth roots, but there are four roots in all. i and −i also work: i⁴ = 1.'],
        ['1, 1 + i, −1, −1 − i', '1 + i has modulus √2, so it is not on the unit circle. Every root of unity has modulus 1.'],
        ['1, 2, 3, 4', 'Those are four numbers, but 2⁴ = 16, not 1. The roots are on the unit circle.']
      ] },
    { set: { mode: 'root', rn: 3, wR: 8, wphi: 180, rk: 0 }, ans: 2,
      q: 'Find all cube roots of −8, the solutions of z³ = −8. The number −8 has modulus 8 and angle 180°.',
      ch: [
        ['2, −1 + √3 i, −1 − √3 i', 'Those are the cube roots of +8 (angle 0°). For −8 the whole triangle is rotated by 180° ÷ 3 = 60°.'],
        ['−2 only', '−2 is one cube root: (−2)³ = −8. But z³ = −8 has three roots in the complex plane, equally spaced.'],
        ['−2, 1 + √3 i, 1 − √3 i', 'The modulus is the cube root of 8, which is 2. The angles are 180° ÷ 3 = 60°, then 120° apart: 60°, 180°, 300°. 2 at 60° is 1 + √3 i, 2 at 180° is −2, and 2 at 300° is 1 − √3 i.'],
        ['2 at 60°, 2 at 120°, 2 at 180°', 'The first angle 60° is right, but the roots are 360° ÷ 3 = 120° apart, not 60°.']
      ] },
    { set: { mode: 'root', rn: 2, wR: 36, wphi: 100, rk: 0 }, ans: 1,
      q: 'Four students find the square roots of 36 at angle 100°. Which student started correctly? Ana: modulus 6, first angle 50°. Ben: modulus 18, first angle 50°. Cy: modulus 6, first angle 200°. Dee: modulus 36, first angle 100°.',
      ch: [
        ['Dee', 'The modulus of a square root is the square root of 36, which is 6. And the angle must be halved, since doubling it gives back 100°.'],
        ['Ana', 'Modulus √36 = 6, angle 100° ÷ 2 = 50°. Check by squaring: modulus 6² = 36 and angle 2 × 50° = 100°. The other root is 180° further around, at 230°.'],
        ['Ben', 'Dividing 36 by 2 is wrong. A square root of the modulus is needed: √36 = 6, since 6² = 36.'],
        ['Cy', 'That doubles the angle instead of halving it. Squaring the answer would give 400°, not 100°. Roots divide the angle by n.']
      ] }
  ];

  register({
    id: 'polar-form-and-roots-of-unity', level: 'school',
    title: 'Polar form and roots of unity',
    blurb: 'Name a complex number by distance and angle, and watch multiplication add angles and roots form regular polygons.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 1.5;
      p.grid(.5);
      const ring = []; for (let i = 0; i <= 90; i++) ring.push(pt(1, i * 4));
      p.path(ring, { stroke: alpha(pal.blue, .6), width: 2 });
      const tri = [0, 120, 240].map(d => pt(1, d));
      p.path(tri, { stroke: pal.violet, width: 2.4, close: true, fill: alpha(pal.violet, .14) });
      tri.forEach(([x, y]) => p.dot(x, y, 4.5, pal.yellow, pal.stage, 1.5));
      c.beginPath(); c.arc(p.X(0), p.Y(0), p.scale * .32, 0, -2 * Math.PI / 3, true); c.strokeStyle = pal.yellow; c.lineWidth = 3; c.stroke();
      p.path([[0, 0], pt(1, 120)], { stroke: pal.text, width: 1.6 });
    },
    hook: String.raw`A radar names a ship by distance and bearing, not by east and north. What does that other name do for complex numbers, and why does the cube root of 1 have three answers?`,
    steps: [
      { title: 'Two names for one point',
        text: String.raw`<p>A complex number is a point. Its <b>rectangular</b> name is \((a,b)\). Its <b>polar</b> name is \((r,\theta)\): \(r=|z|\) is the distance from \(0\), and \(\theta\) is the angle counterclockwise from the positive real axis.</p><p>Predict the angle of \(-1+i\). The dashed red ray shows the calculator trap: \(\tan^{-1}(b/a)=-45^\circ\) points the wrong way.</p>`,
        set: { mode: 'rect', a: -1, b: 1 } },
      { title: 'Multiplying adds angles',
        text: String.raw`<p>Multiplying by \(z_2\) turns by its angle and stretches by its modulus. Here \(z_1\) has modulus \(2\) at \(20^\circ\) and \(z_2\) has modulus \(1.5\) at \(50^\circ\).</p><p>Predict the product, then drag \(z_1\) or \(z_2\). Moduli multiply, angles add, so the blue arrow has length \(3\) at \(70^\circ\).</p>`,
        set: { mode: 'mul', r1: 2, t1: 20, r2: 1.5, t2: 50 } },
      { title: 'Powers spiral or circle',
        text: String.raw`<p>A power is repeated multiplication: \(z^n=r^n(\cos n\theta+i\sin n\theta)\). Here \(z=1+i\), with \(r=\sqrt2\) and \(\theta=45^\circ\). Predict \((1+i)^8\).</p><p>Then change \(r\). Above \(1\) the powers spiral out, at \(1\) they stay on the circle, below \(1\) they spiral in. Repeating a squaring like this is the engine of the Mandelbrot and Julia sets next.</p>`,
        set: { mode: 'pow', pr: Math.SQRT2, pt: 45, pn: 8 } },
      { title: 'Roots form a polygon',
        text: String.raw`<p>To solve \(z^n=1\), the roots have modulus \(1\), and \(n\theta\) must be a whole number of turns. So the \(n\) roots are equally spaced on the unit circle, starting at \(1\). Predict the cube roots.</p><p>Then slide \(n\) from \(2\) to \(12\) and check that the roots add to \(0\). For \(z^n=w\), scale by \(\sqrt[n]{|w|}\) and rotate by \(\theta/n\).</p>`,
        set: { mode: 'root', rn: 3, wR: 1, wphi: 0, rk: 0 } }
    ],
    formal: String.raw`
      <p>Polar form is how engineers describe an alternating signal: an amplitude (the modulus) and a phase (the angle). It makes multiplication easy, because multiplying complex numbers turns out to mean adding angles.</p>
      <h3>Two names for a point</h3>
      <p>A complex number \(z=a+bi\) is the point \((a,b)\): the real part \(a\) is measured along the horizontal real axis, and the imaginary part \(b\) along the vertical imaginary axis. Its <em>modulus</em> is the distance from \(0\), and an <em>argument</em> \(\theta\) is an angle from the positive real axis to the segment from \(0\) to \(z\):
      \[ r=|z|=\sqrt{a^2+b^2},\qquad a=r\cos\theta,\quad b=r\sin\theta,\qquad z=r(\cos\theta+i\sin\theta). \]
      The last form is sometimes written \(r\operatorname{cis}\theta\). The angle is only defined up to full turns (\(\theta\) and \(\theta+360^\circ\) name the same point), so we usually pick \(0^\circ\le\theta&lt;360^\circ\). The number \(0\) has no angle.</p>
      <p><b>The trap.</b> From \(\tan\theta=b/a\) a calculator returns \(\tan^{-1}(b/a)\), an angle strictly between \(-90^\circ\) and \(90^\circ\). Tangent repeats every \(180^\circ\), so this can be the opposite direction. Always look at the quadrant of \((a,b)\). For \(z=-1+i\): \(r=\sqrt2\), \(\tan^{-1}(1/(-1))=-45^\circ\), but \(a&lt;0\) and \(b&gt;0\) puts the point in the second quadrant, so \(\theta=-45^\circ+180^\circ=135^\circ\). Check: \(\sqrt2\cos135^\circ=-1\) and \(\sqrt2\sin135^\circ=1\).</p>
      <p>In radians, \(180^\circ=\pi\) rad, so \(135^\circ=3\pi/4\) and \(120^\circ=2\pi/3\).</p>
      <h3>Why multiplication adds angles</h3>
      <p>Take \(z_1=r_1(\cos t_1+i\sin t_1)\) and \(z_2=r_2(\cos t_2+i\sin t_2)\). Expand the product and use \(i^2=-1\):
      \[ z_1z_2=r_1r_2\Big[(\cos t_1\cos t_2-\sin t_1\sin t_2)+i(\sin t_1\cos t_2+\cos t_1\sin t_2)\Big]. \]
      The first bracket is the angle-sum formula for cosine and the second is the one for sine:
      \[ \cos(t_1+t_2)=\cos t_1\cos t_2-\sin t_1\sin t_2,\qquad \sin(t_1+t_2)=\sin t_1\cos t_2+\cos t_1\sin t_2. \]
      Therefore
      \[ z_1z_2=r_1r_2\big(\cos(t_1+t_2)+i\sin(t_1+t_2)\big). \]
      <em>Moduli multiply and angles add.</em> Example: \(2\) at \(20^\circ\) times \(1.5\) at \(50^\circ\) is \(3\) at \(70^\circ\). Dividing undoes this, so moduli divide and angles subtract.</p>
      <h3>Powers: De Moivre's theorem</h3>
      <p>Multiplying by \(z\) once more multiplies the modulus by \(r\) and adds \(\theta\) to the angle. Doing that \(n\) times gives, for every whole number \(n\ge1\),
      \[ z^n=r^n(\cos n\theta+i\sin n\theta). \]
      Example: \(1+i\) has \(r=\sqrt2\) and \(\theta=45^\circ\), so \((1+i)^8\) has modulus \((\sqrt2)^8=16\) and angle \(8\cdot45^\circ=360^\circ\). Hence \((1+i)^8=16\). Check by squaring: \((1+i)^2=2i\), \((1+i)^4=(2i)^2=-4\), \((1+i)^8=(-4)^2=16\).</p>
      <p>The modulus of \(z^n\) is \(r^n\). If \(r&gt;1\) it grows, if \(r=1\) it stays \(1\), and if \(r&lt;1\) it tends to \(0\). Meanwhile the angle turns by \(\theta\) each time. So the points \(z,z^2,z^3,\dots\) spiral outward, stay on the unit circle, or spiral inward. Repeating a squaring (with a constant added) is exactly what the Mandelbrot and Julia sets do next.</p>
      <h3>Roots</h3>
      <p>Solve \(z^n=w\), where \(w=R(\cos\varphi+i\sin\varphi)\) and \(R&gt;0\). Write \(z=\rho(\cos\alpha+i\sin\alpha)\). By De Moivre,
      \[ \rho^n(\cos n\alpha+i\sin n\alpha)=R(\cos\varphi+i\sin\varphi). \]
      Two numbers in polar form are equal when their moduli are equal and their angles differ by whole turns. So \(\rho^n=R\), which gives \(\rho=\sqrt[n]{R}\) (the positive real root), and \(n\alpha=\varphi+360^\circ k\), so
      \[ \alpha_k=\frac{\varphi+360^\circ k}{n},\qquad k=0,1,\dots,n-1. \]
      Taking \(k=n\) adds a full turn to \(\alpha\) and repeats the first root, so there are exactly \(n\) roots: \(n\) equally spaced points on the circle of radius \(\sqrt[n]{R}\), the first at angle \(\varphi/n\). Slips to avoid: the root's angle is \(\varphi/n\) (not \(n\varphi\)), and its modulus is \(\sqrt[n]{R}\) (not \(R/n\)).</p>
      <p><b>Roots of unity</b> (\(R=1,\ \varphi=0\)): \(z_k=\cos\tfrac{360^\circ k}{n}+i\sin\tfrac{360^\circ k}{n}\). For \(n=3\): \(1,\ -\tfrac12\pm\tfrac{\sqrt3}{2}i\). For \(n=4\): \(1,\ i,\ -1,\ -i\). Cubing a cube root gives back \(1\): \(\big(\cos120^\circ+i\sin120^\circ\big)^3=\cos360^\circ+i\sin360^\circ=1\).</p>
      <p><b>The roots add to zero</b> (for \(n\ge2\)). Let \(\omega\) be the root at angle \(360^\circ/n\); the roots are \(1,\omega,\dots,\omega^{n-1}\). Then \((1-\omega)(1+\omega+\dots+\omega^{n-1})=1-\omega^n=0\), and \(\omega\ne1\), so the sum is \(0\). In the picture, the polygon balances on its centre.</p>
      <p><b>Examples.</b> Cube roots of \(8\): \(\rho=2\) and angles \(0^\circ,120^\circ,240^\circ\), so \(2,\ -1+\sqrt3\,i,\ -1-\sqrt3\,i\). Fourth roots of \(-16\): \(\rho=2\), first angle \(180^\circ/4=45^\circ\), then \(135^\circ,225^\circ,315^\circ\): the four numbers \(\pm\sqrt2\pm\sqrt2\,i\). Check one: \((\sqrt2+\sqrt2\,i)^4\) has modulus \(2^4=16\) and angle \(4\cdot45^\circ=180^\circ\), which is \(-16\).</p>
      <h3>A notation for later</h3>
      <p>The expression \(\cos\theta+i\sin\theta\) is written \(e^{i\theta}\). Then the rule above reads \(e^{it_1}e^{it_2}=e^{i(t_1+t_2)}\), like a law of exponents. Here this is only a notation; why it is justified comes later, in Euler's formula.</p>`,
    check: [
      { q: String.raw`A complex number \(z\) has modulus exactly \(1\) and angle \(20^\circ\). Where are \(z,\ z^2,\ z^3,\dots\) on the complex plane?`,
        choices: [
          String.raw`All at the point \(1\), because \(1^n=1\)`,
          String.raw`On the unit circle, turning another \(20^\circ\) each time`,
          String.raw`On a spiral that moves farther from \(0\) each time`,
          String.raw`On a straight line through \(0\)`
        ], answer: 1,
        why: String.raw`The modulus of \(z^n\) is \(1^n=1\), so every power is on the unit circle. The angle of \(z^n\) is \(20^\circ n\), so the point turns \(20^\circ\) further each time. The fact \(1^n=1\) is about the modulus, not the point.`,
        hint: String.raw`Power the modulus and multiply the angle.` },
      { q: String.raw`Compute \((\sqrt3+i)^6\). The number \(\sqrt3+i\) is the point \((\sqrt3,1)\).`,
        choices: [String.raw`\(64\)`, String.raw`\(64i\)`, String.raw`\(6\sqrt3+6i\)`, String.raw`\(-64\)`], answer: 3,
        why: String.raw`The modulus is \(\sqrt{3+1}=2\) and \(\tan\theta=1/\sqrt3\) with the point in the first quadrant, so \(\theta=30^\circ\). Then \((\sqrt3+i)^6\) has modulus \(2^6=64\) and angle \(6\cdot30^\circ=180^\circ\). That is \(64(\cos180^\circ+i\sin180^\circ)=-64\). Check: \((\sqrt3+i)^3=8i\) and \((8i)^2=-64\).`,
        hint: String.raw`Find the modulus and the angle of \(\sqrt3+i\), then raise the modulus to the 6th power and multiply the angle by 6.` },
      { q: String.raw`A student solves \(z^3=8\) like this. Step 1: \(|z|^3=8\), so \(|z|=8/3\). Step 2: the angle of \(8\) is \(0^\circ\), so the first root has angle \(0^\circ/3=0^\circ\). Step 3: the other roots are \(120^\circ\) and \(240^\circ\) around the circle. The student lists \(\tfrac83\), \(\tfrac83\) at \(120^\circ\), \(\tfrac83\) at \(240^\circ\). Where is the first error?`,
        choices: [
          String.raw`Step 2: the angle of \(8\) is \(180^\circ\), not \(0^\circ\).`,
          String.raw`Step 3: three roots must be \(60^\circ\) apart.`,
          String.raw`Step 1: \(|z|^3=8\) means \(|z|=\sqrt[3]{8}=2\), not \(8/3\).`,
          String.raw`There is no error: \(8/3\) is the modulus of a cube root.`
        ], answer: 2,
        why: String.raw`The modulus of the roots is the cube root of \(8\), which is \(2\), because \(2^3=8\). Dividing by \(3\) is the mistake. Steps 2 and 3 are correct: \(8\) lies on the positive real axis (angle \(0^\circ\)), and three roots are \(360^\circ/3=120^\circ\) apart. The roots are \(2\), \(2\) at \(120^\circ\), \(2\) at \(240^\circ\).`,
        hint: String.raw`Check by cubing: the cube of a number with modulus \(8/3\) has modulus \((8/3)^3\), which is not \(8\).` }
    ],
    links: { prereq: ['complex-arithmetic-in-the-plane', 'the-unit-circle-and-trig-waves'], next: ['the-mandelbrot-and-julia-sets'], related: ['imaginary-numbers-and-the-complex-plane', 'complex-roots-of-quadratics', 'special-right-triangles-and-trigonometry', 'rigid-motions-and-congruence', 'sequences-recursive-and-explicit'] },

    mount({ stage, controls: C }) {
      const st = {
        mode: 'rect', gv: 'rect', reveal: false, rad: false, chain: false, practice: false,
        a: -1, b: 1, r1: 2, t1: 20, r2: 1.5, t2: 50, pr: Math.SQRT2, pt: 45, pn: 8, rn: 3, wR: 1, wphi: 0, rk: 0
      };
      const INTS = ['pn', 'rn', 'rk'], FLAGS = ['mode', 'gv'];
      let cancel = () => {};
      const panel = stage.nextElementSibling;
      const P = new Plane(stage, { span: 6.5 });
      const gate = { i: 0, answered: false, done: false };
      let prIdx = 0, prSolved = false, prTried = false, prFirst = 0, prDone = 0, prOver = false;

      const useRad = () => st.rad && !st.practice;
      const A = d => (useRad() ? piF(d) : dg(d));
      const locked = () => !st.practice && !gate.done;
      const WS = [[1, 0, 'w = 1'], [8, 0, 'w = 8'], [8, 180, 'w = −8'], [16, 180, 'w = −16'], [1, 90, 'w = i']];

      /* ---------- drawing helpers ---------- */
      const frame = (p, span) => { p.span = span; p.cx = 0; p.cy = 0; };
      const arcP = (c, p, r, d0, d1, col, w, dash) => {
        if (Math.abs(d1 - d0) < .01 || r <= 0) return;
        c.beginPath(); c.arc(p.X(0), p.Y(0), r * p.scale, -d0 * D2R, -d1 * D2R, d1 > d0);
        c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]);
      };
      const ringP = (p, r, col, w, dash) => {
        if (r <= 0) return;
        const pts = []; for (let i = 0; i <= 120; i++) pts.push(pt(r, i * 3));
        p.path(pts, { stroke: col, width: w, dash });
      };
      const caption = (c, p, lines) => {
        const fs = clamp(p.w / 26, 12.5, 16);
        c.font = `500 ${fs}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
        const wmax = Math.max(...lines.map(t => c.measureText(t).width)) + 18, hh = lines.length * fs * 1.45 + 6;
        c.fillStyle = alpha(p.pal.stage, .88); c.fillRect(p.w / 2 - wmax / 2, p.h - hh - 4, wmax, hh);
        lines.forEach((t, i) => {
          const y = p.h - 14 - (lines.length - 1 - i) * fs * 1.45;
          c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(t, p.w / 2, y);
          c.fillStyle = p.pal.text; c.fillText(t, p.w / 2, y);
        });
      };
      const ticksP = (p, step, skip, max = 1e9) => {
        const b = p.bounds(), col = p.pal.muted;
        for (let x = Math.ceil(b.x0 / step) * step; x <= b.x1; x += step)
          if (Math.abs(x) > 1e-9 && Math.abs(x) <= max && !(skip && skip.x !== undefined && Math.abs(x - skip.x) < .55)) p.label(tk(x), x, 0, { size: 15, italic: false, color: col, dy: 15 });
        for (let y = Math.ceil(b.y0 / step) * step; y <= b.y1; y += step)
          if (Math.abs(y) > 1e-9 && Math.abs(y) <= max) p.label(tk(y) + 'i', 0, y, { size: 15, italic: false, color: col, dx: -11, align: 'right' });
      };
      const axesP = p => {
        const b = p.bounds(), col = p.pal.muted;
        p.label('real axis', b.x1 - .12 * p.span / 6.5, 0, { align: 'right', dy: -15, italic: false, size: 15, color: col });
        p.label('imaginary axis', .12 * p.span / 6.5, b.y1 - .35 * p.span / 6.5, { align: 'left', italic: false, size: 15, color: col });
      };
      const protractor = (c, p, R) => {
        const pal = p.pal;
        ringP(p, R, pal['grid-strong'], 1.5);
        for (let d = 0; d < 360; d += 15) {
          const big = d % 30 === 0, a = pt(R - (big ? .2 : .1), d), b2 = pt(R, d);
          p.path([a, b2], { stroke: pal['grid-strong'], width: big ? 1.6 : 1 });
          if (big) { const q = pt(R + .62, d); p.label(useRad() ? piF(d) : d + '°', q[0], q[1], { size: 14, italic: false, color: pal.muted }); }
        }
      };
      const handle = (p, x, y, col) => { p.dot(x, y, 9, col, p.pal.brass, 3.5); };

      /* ---------- the picture ---------- */
      P.onDraw = (c, p) => {
        const pal = p.pal, mode = st.mode;
        if (mode === 'rect') {
          const { a, b } = st, { r, th } = polOf(a, b), showR = st.gv !== 'polar', showP = st.gv !== 'rect';
          frame(p, 6.5); p.grid(1); ticksP(p, 1, showR && a !== 0 ? { x: a / 2 } : null, 4.2); axesP(p); protractor(c, p, 4.5);
          if (r > 0) ringP(p, r, alpha(pal.blue, .45), 1.8, [6, 6]);
          if (showR) {
            p.path([[0, 0], [a, 0]], { stroke: pal.green, width: 4 }); p.path([[a, 0], [a, b]], { stroke: pal.red, width: 4 });
            if (a !== 0) p.label('a', a / 2, 0, { size: 19, color: pal.green, dy: 17 });
            if (b !== 0) p.label('b', a, b / 2, { size: 19, color: pal.red, dx: a >= 0 ? 15 : -15, align: a >= 0 ? 'left' : 'right' });
          }
          if (r > 0) {
            p.arrow(0, 0, a, b, pal.blue, 3.5);
            if (showP) {
              const ra = clamp(r * .42, .45, 1.0), sn = Math.sin(th * D2R), cs = Math.cos(th * D2R), mid = pt(ra + .5, th / 2), hc = Math.cos(th / 2 * D2R);
              arcP(c, p, ra, 0, th, pal.yellow, 4.5);
              if (th > 1) p.label('θ = ' + A(th), mid[0], mid[1], { size: 17, italic: false, color: pal.yellow, align: hc > .2 ? 'left' : hc < -.2 ? 'right' : 'center', dx: hc > .2 ? 8 : hc < -.2 ? -8 : 0 });
              const sd = a * b < 0 ? -1 : 1; p.label('r', a / 2, b / 2, { size: 21, color: pal.blue, dx: -sn * 17 * sd, dy: -cs * 17 * sd });
              if (a < 0 && Math.abs(st.b) < 6) {
                const al = Math.atan(b / a) * R2D, e = pt(r, al);
                p.path([[0, 0], e], { stroke: pal.red, width: 2.4, dash: [7, 6] });
                p.label('tan⁻¹(b/a) = ' + A(al), e[0], e[1], { size: 15, italic: false, color: pal.red, dy: e[1] <= 0 ? 24 : -24 });
                p.label('points the wrong way', e[0], e[1], { size: 15, italic: false, color: pal.red, dy: e[1] <= 0 ? 42 : -42 });
              }
            }
          }
          handle(p, a, b, pal.yellow);
          p.label('z', a, b, { size: 21, dx: a >= 0 ? 18 : -18, dy: b >= 0 ? -14 : 14, color: pal.text });
          const cap = [];
          if (showR && showP) { cap.push(`z = ${cx(a, b)} = ${ex(r)} (cos ${A(th)} + i sin ${A(th)})`); cap.push(`r = ${exa(r)},  θ = ${A(th)}`); }
          else if (showR) cap.push(`z = ${cx(a, b)}  (a = ${ex(a)}, b = ${ex(b)})`);
          else cap.push(`r = ${exa(r)}, θ = ${A(th)}`);
          caption(c, p, cap);
        } else if (mode === 'mul') {
          const { r1, t1, r2, t2 } = st, rp = r1 * r2, tp = t1 + t2, show = st.reveal;
          frame(p, 6.5); p.grid(1); ticksP(p, 1, null, 4.2); axesP(p); protractor(c, p, 4.5);
          ringP(p, r1, alpha(pal.green, .4), 1.6, [5, 6]); ringP(p, r2, alpha(pal.red, .4), 1.6, [5, 6]);
          if (show) ringP(p, rp, alpha(pal.blue, .45), 1.8, [6, 6]);
          arcP(c, p, .75, 0, t1, pal.green, 4.5); arcP(c, p, .75, t1, tp, pal.red, 4.5);
          if (show) {
            arcP(c, p, 1.1, 0, tp, pal.blue, 4.5);
            p.path([[0, 0], pt(r1, tp)], { stroke: alpha(pal.green, .55), width: 2, dash: [5, 6] });
            arcP(c, p, r1, t1, tp, alpha(pal.green, .55), 2, [5, 6]);
          }
          [[t1, pal.green, true], [tp, pal.blue, show]].forEach(([d, col, on]) => {
            if (!on) return;
            p.path([pt(0, 0), pt(4.5, d)], { stroke: alpha(col, .4), width: 1.6, dash: [4, 6] });
            const q = pt(4.5, d), w = pt(3.95, d); p.dot(q[0], q[1], 5, col, p.pal.stage, 1.5);
            if (p.w >= 520) p.label(A(m360(d)), w[0], w[1], { size: 15, italic: false, color: col });
          });
          p.arrow(0, 0, ...pt(r1, t1), pal.green, 3.5); p.arrow(0, 0, ...pt(r2, t2), pal.red, 3.5);
          if (show) p.arrow(0, 0, ...pt(rp, tp), pal.blue, 4.2);
          const lab = (t, r, d, col, dy) => { const q = pt(r, d); p.label(t, q[0], q[1], { size: 21, color: col, dx: Math.cos(d * D2R) * 22, dy: -Math.sin(d * D2R) * 22 + (dy || 0) }); };
          lab('z₁', r1, t1, pal.green); lab('z₂', r2, t2, pal.red);
          if (show) lab('z₁z₂', rp, tp, pal.blue);
          const g1 = pt(r1, t1), g2 = pt(r2, t2);
          handle(p, g1[0], g1[1], pal.green); handle(p, g2[0], g2[1], pal.red);
          if (show) { const q = pt(rp, tp); p.dot(q[0], q[1], 7, pal.yellow, pal.stage, 2.5); }
          const L = [`z₁ = ${num(r1)} at ${A(t1)},  z₂ = ${num(r2)} at ${A(t2)}`];
          if (show) L.push(`z₁z₂ = ${num(rp)} at ${A(m360(tp))}   (${num(r1)} × ${num(r2)}, ${A(t1)} + ${A(t2)})`);
          caption(c, p, L);
        } else if (mode === 'pow') {
          const r = st.pr, th = st.pt, n = st.pn, nShow = st.reveal ? n : 1;
          let M = 1; for (let k = 1; k <= nShow; k++) M = Math.max(M, Math.pow(r, k));
          frame(p, Math.max(1.7, M * 1.3)); const step = stepFor(p);
          p.grid(step); ticksP(p, step); axesP(p);
          ringP(p, 1, alpha(pal.violet, .8), 2, [6, 6]);
          const sp = []; const dt = Math.min(.04, 3 / Math.max(5, th)); for (let t = 0; t <= nShow + .001; t += dt) sp.push(pt(Math.pow(r, t), t * th));
          p.path(sp, { stroke: alpha(pal.blue, .55), width: 2.6 });
          let lastLab = null;
          for (let k = 0; k <= nShow; k++) {
            const q = pt(Math.pow(r, k), k * th), isLast = k === nShow && nShow > 1;
            if (k === 0) { p.dot(q[0], q[1], 5, pal.muted, pal.stage, 1.5); p.label('1', q[0], q[1], { size: 17, italic: false, color: pal.muted, dx: 4, dy: 18 }); continue; }
            p.dot(q[0], q[1], isLast ? 8 : 6, isLast ? pal.yellow : pal.blue, pal.stage, 2);
            const sx = p.X(q[0]), sy = p.Y(q[1]);
            if (isLast || k === 1 || !lastLab || Math.hypot(sx - lastLab[0], sy - lastLab[1]) > 30) {
              p.label(k === 1 ? 'z' : 'z' + sup(k), q[0], q[1], { size: 19, color: isLast ? pal.text : pal.blue, dx: Math.cos(k * th * D2R) * 20, dy: -Math.sin(k * th * D2R) * 20 });
              lastLab = [sx, sy];
            }
          }
          const z1 = pt(r, th); handle(p, z1[0], z1[1], pal.blue);
          const L = [`z = ${ex(r)} at ${A(th)}`];
          if (st.reveal) {
            const mm = Math.pow(r, n), ang = m360(n * th), v = pt(mm, ang);
            L[0] = `z = ${ex(r)} at ${A(th)},  n = ${n}`;
            L.push(`z${sup(n)}: modulus ${ex(mm)}, angle ${A(n * th)}${m360(n * th) !== n * th ? ' = ' + A(ang) : ''}  (${cd(v)})`);
          }
          caption(c, p, L);
        } else {
          const n = st.rn, R = st.wR, phi = st.wphi, rho = Math.pow(R, 1 / n), roots = [];
          for (let k = 0; k < n; k++) roots.push(pt(rho, (phi + 360 * k) / n));
          let span = rho * 1.55 + .1;
          if (st.chain && st.reveal) { let sx = 0, sy = 0, m = 0; roots.forEach(q => { sx += q[0]; sy += q[1]; m = Math.max(m, Math.hypot(sx, sy)); }); span = Math.max(span, m * 1.12 + .1); }
          frame(p, span); const step = stepFor(p);
          p.grid(step); ticksP(p, step); axesP(p);
          if (Math.abs(rho - 1) > 1e-6) ringP(p, 1, alpha(pal.muted, .6), 1.4, [3, 7]);
          ringP(p, rho, alpha(pal.violet, .85), 2, [6, 6]);
          const wd = pt(p.span * 1.5, phi);
          p.path([[0, 0], wd], { stroke: alpha(pal.yellow, .8), width: 2, dash: [3, 7] });
          const wl = pt(p.span * .3, phi); p.label('w', wl[0], wl[1], { size: 21, color: pal.yellow, dx: -Math.sin(phi * D2R) * 16, dy: -Math.cos(phi * D2R) * 16 });
          if (st.reveal) {
            p.path(roots, { stroke: pal.violet, width: 2.6, close: true, fill: alpha(pal.violet, .13) });
            if (phi % 360 !== 0) { arcP(c, p, rho * .38, 0, phi / n, pal.yellow, 4.5); const q = pt(rho * .38 + .45 * p.span / 5.5, phi / n / 2); p.label('φ/n = ' + A(phi / n), q[0], q[1], { size: 15, italic: false, color: pal.yellow }); }
            if (st.chain) {
              let sx = 0, sy = 0;
              roots.forEach(q => { p.arrow(sx, sy, sx + q[0], sy + q[1], alpha(pal.blue, .85), 2.6); sx += q[0]; sy += q[1]; });
              p.dot(0, 0, 6, pal.stage, pal.blue, 2.5);
            }
            roots.forEach((q, k) => {
              const ang = (phi + 360 * k) / n, on = k === st.rk;
              if (on) p.arrow(0, 0, q[0], q[1], pal.green, 3.6);
              p.dot(q[0], q[1], on ? 9 : 6.5, pal.yellow, on ? pal.green : pal.stage, on ? 3 : 2);
              if (n <= 6 || on) p.label(A(m360(ang)), q[0], q[1], { size: 16, italic: false, color: on ? pal.green : pal.text, dx: Math.cos(ang * D2R) * 34, dy: -Math.sin(ang * D2R) * 34 });
            });
          }
          const L = [];
          const wTxt = R === 1 && phi === 0 ? '1' : R === 1 && phi === 90 ? 'i' : phi === 0 ? ex(R) : phi === 180 ? MI + ex(R) : `${ex(R)} at ${A(phi)}`;
          L.push(`z${sup(n)} = ${wTxt}`);
          if (st.reveal) L.push(`${n} roots, modulus ${ex(rho)}, ${A(360 / n)} apart, first at ${A(phi / n)}`);
          caption(c, p, L);
        }
      };

      /* ---------- panel helpers ---------- */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const S = o => { const s = C.slider(o); s.inp = panel.lastElementChild.querySelector('input'); return s; };
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const stop = () => { cancel(); cancel = () => {}; };
      const rootName = n => (n === 2 ? 'square root' : n === 3 ? 'cube root' : n === 4 ? 'fourth root' : n + 'th root');
      const lines = a => a.filter(Boolean).join('<br>');
      const nf = v => String(+v.toFixed(2));

      let predTitle, predQ, predRow, predFb, predNext;
      let aS, bS, r1S, t1S, r2S, t2S, prS, ptS, pnS, rnS, wSel, rkS, chainT, radT, ro, startBtn, ptally, pq, pch, pfb, pnext;
      const allSliders = () => [aS, bS, r1S, t1S, r2S, t2S, prS, ptS, pnS, rnS, rkS];

      /* ----- prediction gate ----- */
      grp('pred', () => {
        predTitle = h('p', { class: 'ctl-title' }, 'Predict first');
        predQ = h('p', { class: 'hint' });
        predRow = h('div', { class: 'ctl buttons' });
        predFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        predNext = h('div', { class: 'ctl buttons' }, mkBtn('Next question', () => { const g = GATES[st.mode]; showQ(gate.i + 1); sync(); }, true));
        panel.append(predTitle, predQ, predRow, predFb, predNext);
      });
      const showQ = i => {
        const g = GATES[st.mode], q = g.qs[i];
        gate.i = i; gate.answered = false; st.gv = q.gv || 'both'; st.reveal = false;
        if (q.patch) {
          const nums = {};
          for (const k in q.patch) { if (INTS.includes(k)) st[k] = q.patch[k]; else nums[k] = q.patch[k]; }
          stop(); cancel = animateTo(st, nums, 500, sync);
        }
        predQ.textContent = q.q; predFb.innerHTML = ''; predRow.replaceChildren();
        q.opts.forEach((o, j) => predRow.append(mkBtn(o[0], () => {
          if (gate.answered) return;
          gate.answered = true;
          Array.from(predRow.children).forEach((b, k) => { b.disabled = true; if (k === j) b.classList.add('primary'); });
          const right = j === q.ans;
          predFb.innerHTML = (right ? good('Right.') + ' ' : bad('Not quite.') + ' ') + o[1] + (right ? '' : ` The answer is ${q.opts[q.ans][0]}.`);
          if (q.reveal) { st.reveal = true; st.gv = 'both'; }
          if (i === g.qs.length - 1) { gate.done = true; st.reveal = true; st.gv = 'both'; predFb.innerHTML += `<br>${g.end}`; }
          sync();
        })));
      };
      const startGate = () => { gate.done = false; showQ(0); };

      /* ----- explore controls ----- */
      grp('rect', () => {
        C.title('The point z');
        aS = S({ label: 'a, the real part', min: -3, max: 3, step: 1, value: st.a, format: v => (v < 0 ? MI : '') + Math.abs(v), onInput: v => { stop(); st.a = v; sync(); } });
        bS = S({ label: 'b, the imaginary part', min: -3, max: 3, step: 1, value: st.b, format: v => (v < 0 ? MI : '') + Math.abs(v), onInput: v => { stop(); st.b = v; sync(); } });
      });
      grp('mul', () => {
        C.title('Two numbers');
        r1S = S({ label: 'z₁ modulus', min: .5, max: 2, step: .5, value: st.r1, format: nf, onInput: v => { stop(); st.r1 = v; sync(); } });
        t1S = S({ label: 'z₁ angle in degrees', min: 0, max: 180, step: 5, value: st.t1, format: v => v + '°', onInput: v => { stop(); st.t1 = v; sync(); } });
        r2S = S({ label: 'z₂ modulus', min: .5, max: 2, step: .5, value: st.r2, format: nf, onInput: v => { stop(); st.r2 = v; sync(); } });
        t2S = S({ label: 'z₂ angle in degrees', min: 0, max: 180, step: 5, value: st.t2, format: v => v + '°', onInput: v => { stop(); st.t2 = v; sync(); } });
      });
      grp('pow', () => {
        C.title('The number z and its powers');
        prS = S({ label: 'r, the modulus of z', min: .5, max: 1.5, step: .05, value: st.pr,
          format: v => (st.pr === Math.SQRT2 && Math.abs(v - 1.4) < .03 ? '√2 ≈ 1.41' : nf(v)), onInput: v => { stop(); st.pr = v; sync(); } });
        ptS = S({ label: 'θ, the angle of z in degrees', min: 5, max: 355, step: 5, value: st.pt, format: v => v + '°', onInput: v => { stop(); st.pt = v; sync(); } });
        pnS = S({ label: 'n, how many powers', min: 1, max: 12, step: 1, value: st.pn, format: v => String(v), onInput: v => { stop(); st.pn = v; sync(); } });
        C.buttons([
          { label: 'z = 1 + i', onClick: () => preset(Math.SQRT2, 45, 8) },
          { label: 'On the circle', onClick: () => preset(1, 30, 12) },
          { label: 'Spiral inward', onClick: () => preset(.85, 30, 12) }
        ]);
      });
      const preset = (r, t, n) => { stop(); st.pn = n; cancel = animateTo(st, { pr: r, pt: t }, 400, sync); sync(); };
      grp('root', () => {
        C.title('Roots of z^n = w');
        rnS = S({ label: 'n, the number of roots', min: 2, max: 12, step: 1, value: st.rn, format: v => String(v), onInput: v => { stop(); st.rn = v; sync(); } });
        wSel = C.select({ label: 'Choose w', options: WS.map((w, i) => ({ value: String(i), label: w[2] })), value: '0', onChange: v => { stop(); st.wR = WS[+v][0]; st.wphi = WS[+v][1]; sync(); } });
        rkS = S({ label: 'Highlight root number k', min: 0, max: 11, step: 1, value: st.rk, format: v => String(v), onInput: v => { stop(); st.rk = v; sync(); } });
        chainT = C.toggle({ label: 'Add the roots tip to tail (balance)', value: false, onChange: v => { stop(); st.chain = v; sync(); } });
      });
      grp('ro', () => {
        C.title('Readout');
        ro = C.readout();
      });
      grp('disp', () => {
        radT = C.toggle({ label: 'Show angles in radians', value: false, onChange: v => { st.rad = v; sync(); } });
      });
      C.hint('Drag the handles on the picture (rings), or use the sliders.');

      /* ----- readouts ----- */
      const readout = () => {
        const L = [];
        if (st.mode === 'rect') {
          const { a, b } = st, { r, th } = polOf(a, b), showR = st.gv !== 'polar', showP = st.gv !== 'rect';
          if (showR) L.push(`${kk('z')} = ${cx(a, b)}, so a = ${ex(a)} and b = ${ex(b)}`);
          if (showP) {
            if (r === 0) { L.push('The number 0 is at distance 0 and has no angle.'); return lines(L); }
            if (showR) L.push(`${kk('r')} = √(a² + b²) = √(${par(a)}² + ${par(b)}²) = ${exa(r)}`);
            else L.push(`${kk('r')} = ${exa(r)}`);
            if (showR) {
              if (a === 0) L.push(`a = 0: the point is on the imaginary axis, so ${kk('θ')} = ${A(th)}`);
              else {
                const al = Math.atan(b / a) * R2D;
                L.push(`tan⁻¹(b/a) = tan⁻¹(${ex(b / a)}) = ${A(al)}`);
                if (a < 0) L.push(`a is negative: add ${A(180)}. ${kk('θ')} = ${A(m360(al + 180))}`);
                else if (b < 0) L.push(`b is negative: add ${A(360)} to stay between 0 and a full turn. ${kk('θ')} = ${A(th)}`);
                else if (b === 0) L.push(`On the positive real axis. ${kk('θ')} = ${A(th)}`);
                else L.push(`Both positive: first quadrant. ${kk('θ')} = ${A(th)}`);
              }
            } else L.push(`${kk('θ')} = ${A(th)}`);
            L.push(`${kk('z')} = r(cos θ + i sin θ) = ${ex(r)} (cos ${A(th)} + i sin ${A(th)})`);
            if (!showR) L.push('Not shown yet: a = r cos θ and b = r sin θ.');
            else L.push(`Check: r cos θ = ${ex(r * Math.cos(th * D2R))} = a, r sin θ = ${ex(r * Math.sin(th * D2R))} = b`);
          } else L.push('Not shown yet: r and θ.');
        } else if (st.mode === 'mul') {
          const { r1, t1, r2, t2 } = st, rp = r1 * r2, tp = t1 + t2, v = pt(rp, tp);
          L.push(`${kk('z₁')} = ${num(r1)} at ${A(t1)}, ${kk('z₂')} = ${num(r2)} at ${A(t2)}`);
          if (st.reveal) {
            L.push(`Modulus: ${num(r1)} × ${num(r2)} = ${num(rp)}`);
            L.push(`Angle: ${A(t1)} + ${A(t2)} = ${A(tp)}${tp >= 360 ? ' = ' + A(m360(tp)) + ' (a full turn is dropped)' : ''}`);
            L.push(`${kk('z₁z₂')} = ${num(rp)}(cos ${A(m360(tp))} + i sin ${A(m360(tp))}) ≈ ${cd(v)}`);
          } else L.push('Predict the product, then it appears.');
        } else if (st.mode === 'pow') {
          const r = st.pr, th = st.pt, n = st.pn;
          L.push(`${kk('z')} = ${ex(r)} at ${A(th)}, ${kk('n')} = ${n}`);
          if (st.reveal) {
            const mm = Math.pow(r, n), v = pt(mm, th * n);
            L.push(`|z${sup(n)}| = r${sup(n)} = ${ex(mm)}`);
            L.push(`Angle = ${n} × ${A(th)} = ${A(n * th)}${m360(n * th) !== n * th ? ' = ' + A(m360(n * th)) + ' after full turns' : ''}`);
            L.push(`${kk('z' + sup(n))} ≈ ${cd(v)}`);
            L.push(Math.abs(r - 1) < 1e-9 ? 'r = 1: every power has modulus 1, so the points stay on the unit circle.' : r > 1 ? 'r is above 1: the modulus grows, so the points move farther from 0, turning by θ each time.' : 'r is below 1: the modulus shrinks, so the points spiral inward.');
          } else L.push('Predict |z⁸| and the angle of z⁸ first.');
        } else {
          const n = st.rn, R = st.wR, phi = st.wphi, rho = Math.pow(R, 1 / n);
          L.push(`Solving z${sup(n)} = w, with |w| = ${ex(R)} and angle ${A(phi)}`);
          if (st.reveal) {
            L.push(`Modulus of each root: the ${rootName(n)} of ${ex(R)} = ${ex(rho)}.`);
            L.push(`Spacing: ${A(360)} ÷ ${n} = ${A(360 / n)}. First angle: ${A(phi)} ÷ ${n} = ${A(phi / n)}.`);
            const k = Math.min(st.rk, n - 1), ang = (phi + 360 * k) / n, v = pt(rho, ang);
            if (n <= 6) L.push('Roots: ' + Array.from({ length: n }, (_, j) => { const q = pt(rho, (phi + 360 * j) / n); return cx(q[0], q[1]); }).join(',  '));
            L.push(`Root ${k} is at ${A(m360(ang))}: ${cx(v[0], v[1])}`);
            L.push(`Check: (root ${k})${sup(n)} has modulus ${ex(Math.pow(rho, n))} and angle ${n} × ${A(ang)} = ${A(n * ang)}${m360(n * ang) !== n * ang ? ' = ' + A(m360(n * ang)) + ' after full turns' : ''}. That is w.`);
            let sx = 0, sy = 0; for (let j = 0; j < n; j++) { const q = pt(rho, (phi + 360 * j) / n); sx += q[0]; sy += q[1]; }
            L.push(`Sum of all ${n} roots = ${num(Math.abs(sx) < 5e-7 ? 0 : sx)} + ${num(Math.abs(sy) < 5e-7 ? 0 : sy)}i: the polygon balances.`);
          } else L.push('Predict the roots first.');
        }
        return lines(L);
      };

      /* ----- practice ----- */
      C.title('Practice');
      C.hint('Eight short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { stop(); if (st.practice) { st.practice = false; sync(); } else { st.practice = true; if (!prOver) loadProb(); sync(); } } }])[0];
      grp('practice', () => {
        ptally = h('p', { class: 'ctl-title' });
        pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        pch = h('div', { class: 'ctl buttons' });
        pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pnext = mkBtn('Next problem', () => nextProb(), true);
        panel.append(ptally, pq, pch, pfb, h('div', { class: 'ctl buttons' }, pnext));
      });
      const tally = () => { ptally.textContent = `Problem ${prIdx + 1} of ${PROBS.length}. Right on the first try: ${prFirst} of ${prDone} answered`; };
      const loadProb = () => {
        const pr = PROBS[prIdx]; prSolved = false; prTried = false; stop();
        for (const k in pr.set) st[k] = pr.set[k];
        st.reveal = false; st.rk = 0;
        pq.textContent = pr.q; pfb.innerHTML = ''; pch.replaceChildren(); pnext.disabled = true; pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        pr.ch.forEach((o, i) => pch.append(mkBtn(o[0], () => pick(i))));
        tally();
      };
      const pick = i => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        const right = i === pr.ans, btn = pch.children[i], txt = pr.ch[i][1];
        if (right) {
          prSolved = true; if (!prTried) prFirst++; prDone++; Array.from(pch.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary');
          st.reveal = true; st.gv = 'both';
          pfb.innerHTML = good('Right.') + ' ' + txt; pnext.disabled = false;
        } else { prTried = true; btn.disabled = true; pfb.innerHTML = bad('Not quite.') + ' ' + txt + ' Try another answer.'; }
        tally(); sync();
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); sync(); return; }
        prOver = true;
        pq.textContent = 'All eight problems are done.'; pch.replaceChildren(); pnext.disabled = true;
        pfb.innerHTML = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        pch.append(mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; prOver = false; loadProb(); sync(); }, true));
        ptally.textContent = `Right on the first try: ${prFirst} of ${PROBS.length}`; st.reveal = true; st.gv = 'both'; sync();
      };

      /* ----- sync ----- */
      const sync = () => {
        const prac = st.practice, m = st.mode, lk = locked();
        vis(G.pred, !prac); vis(G.rect, !prac && m === 'rect'); vis(G.mul, !prac && m === 'mul'); vis(G.pow, !prac && m === 'pow'); vis(G.root, !prac && m === 'root');
        vis(G.ro, !prac); vis(G.disp, !prac); vis(G.practice, prac);
        vis([predNext], !prac && gate.answered && !gate.done);
        predTitle.textContent = gate.done ? 'Now try it' : 'Predict first';
        aS.set(st.a); bS.set(st.b); r1S.set(st.r1); t1S.set(st.t1); r2S.set(st.r2); t2S.set(st.t2);
        prS.set(st.pr); ptS.set(st.pt); pnS.set(st.pn); rnS.set(st.rn);
        rkS.inp.max = st.rn - 1; st.rk = Math.min(st.rk, st.rn - 1); rkS.set(st.rk); rkS.inp.style.setProperty('--p', (st.rn > 1 ? st.rk / (st.rn - 1) * 100 : 0) + '%');
        allSliders().forEach(s => { s.inp.disabled = lk; });
        wSel.disabled = lk; chainT.disabled = lk;
        const wi = WS.findIndex(w => w[0] === st.wR && w[1] === st.wphi); if (wi >= 0) wSel.value = String(wi);
        chainT.checked = st.chain; radT.checked = st.rad;
        if (!prac) ro.innerHTML = readout();
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        P.draw();
      };

      /* ----- dragging ----- */
      draggable(P, {
        hit: (px, py) => {
          if (st.practice || locked()) return null;
          if (st.mode === 'rect') return near(P, st.a, st.b, px, py, 26) ? 'z' : null;
          if (st.mode === 'mul') {
            const q1 = pt(st.r1, st.t1), q2 = pt(st.r2, st.t2);
            const d1 = Math.hypot(P.X(q1[0]) - px, P.Y(q1[1]) - py), d2 = Math.hypot(P.X(q2[0]) - px, P.Y(q2[1]) - py);
            if (Math.min(d1, d2) > 26) return null;
            return d1 <= d2 ? 'z1' : 'z2';
          }
          if (st.mode === 'pow') { const q = pt(st.pr, st.pt); return near(P, q[0], q[1], px, py, 26) ? 'z' : null; }
          return 'k';
        },
        move: (hd, x, y) => {
          stop();
          const deg = Math.atan2(y, x) * R2D, rr = Math.hypot(x, y);
          if (hd === 'z' && st.mode === 'rect') { st.a = clamp(sn(x, 1), -3, 3) + 0; st.b = clamp(sn(y, 1), -3, 3) + 0; }
          else if (hd === 'z1' || hd === 'z2') {
            let d = deg; if (d < 0) d = d > -90 ? 0 : 180;
            const rv = clamp(sn(rr, .5), .5, 2), dv = clamp(sn(d, 5), 0, 180);
            if (hd === 'z1') { st.r1 = rv; st.t1 = dv; } else { st.r2 = rv; st.t2 = dv; }
          } else if (hd === 'z') { st.pr = clamp(sn(rr, .05), .5, 1.5); st.pt = clamp(sn(m360(deg), 5), 5, 355); }
          else if (hd === 'k') {
            const n = st.rn, sp = 360 / n, k = Math.round((m360(deg) - st.wphi / n) / sp);
            st.rk = ((k % n) + n) % n;
          }
          sync();
        }
      });

      /* ----- steps ----- */
      const apply = (patch, immediate) => {
        stop();
        st.practice = false;
        const nums = {};
        for (const k in patch) { if (FLAGS.includes(k) || INTS.includes(k)) st[k] = patch[k]; else nums[k] = patch[k]; }
        startGate();
        if (immediate) { Object.assign(st, nums); sync(); } else { sync(); cancel = animateTo(st, nums, 700, sync); }
      };
      startGate(); sync();
      return { destroy: () => { stop(); P.destroy(); }, apply };
    }
  });
}
