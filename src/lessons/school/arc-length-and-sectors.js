/* =====================================================================
   SCHOOL — Arc length and sectors
   ===================================================================== */
{
  const PI = Math.PI, RMAX = 6, RSL = 8;
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  const frac = (n, d) => { const g = gcd(n, d) || 1; n /= g; d /= g; return d === 1 ? String(n) : n + '/' + d; };
  /* the number (n/d) times pi, written exactly */
  const piOf = (n, d) => { const g = gcd(n, d) || 1; n /= g; d /= g; const a = n === 1 ? 'π' : n + 'π'; return d === 1 ? a : a + '/' + d; };
  const dec = x => x.toFixed(2), dec1 = x => String(+x.toFixed(1));
  const rad = d => d * PI / 180;
  const meas = (a, r) => ({
    F: frac(a, 360), pct: dec1(a / 360 * 100),
    circS: piOf(2 * r, 1), circV: 2 * PI * r, wAS: piOf(r * r, 1), wAV: PI * r * r,
    arcS: piOf(a * r, 180), arcV: a / 360 * 2 * PI * r, areaS: piOf(a * r * r, 360), areaV: a / 360 * PI * r * r,
    perS: piOf(a * r, 180) + ' + ' + 2 * r, perV: a / 360 * 2 * PI * r + 2 * r
  });
  const pts = (cx, cy, R, a0, a1, n = 48) => { const o = []; for (let i = 0; i <= n; i++) { const t = rad(a0 + (a1 - a0) * i / n); o.push([cx + R * Math.cos(t), cy - R * Math.sin(t)]); } return o; };
  const FONT = '"Hanken Grotesk","Helvetica Neue",Arial,sans-serif';

  const CTX = [
    { key: 'pizza', btn: 'Pizza slice', title: 'Pizza slice (14 in across)', ang: 45, r: 7, unit: 'in', ask: 'area',
      text: 'A pizza is 14 inches across, so its radius is 7 in. One slice has a 45° point. How much pizza is in the slice (area)?' },
    { key: 'sprinkler', btn: 'Sprinkler', title: 'Sprinkler sweep (range 8 m)', ang: 120, r: 8, unit: 'm', ask: 'area',
      text: 'A sprinkler sprays 8 m and sweeps back and forth through 120°. How much lawn does it water (area)?' },
    { key: 'clock', btn: 'Minute hand', title: 'Minute hand tip, 20 minutes', ang: 120, r: 6, unit: 'cm', ask: 'arc',
      text: 'A minute hand is 6 cm long. In 20 minutes (a third of an hour) it turns through 120°. How far does its tip travel (arc length)?' },
    { key: 'wheel', btn: 'Wheel', title: 'Wheel turns 3/8 of a turn', ang: 135, r: 8, unit: 'in', ask: 'arc',
      text: 'A wheel of radius 8 in turns through 3/8 of a full turn. That is 3/8 × 360° = 135°. How far does a point on its rim travel (arc length)?' },
    { key: 'pie', btn: 'Pie chart', title: 'Pie chart slice, 35%', ang: 126, r: 6, unit: 'cm', ask: 'area',
      text: 'A pie chart has radius 6 cm. One slice is 35% of the chart, so its angle is 35% of 360° = 126°. What is the area of the slice?' }
  ];

  /* correct answer goes to slot (key mod 4); wrong ones fill the rest */
  const place = (correct, wrongs, key) => { const ch = wrongs.slice(0, 3), i = ((key % 4) + 4) % 4; ch.splice(i, 0, correct); return { ch, ans: i }; };
  const uniq = (okTxt, list) => { const seen = new Set([okTxt]), o = []; for (const x of list) if (!seen.has(x[0])) { seen.add(x[0]); o.push(x); } return o; };

  register({
    id: 'arc-length-and-sectors', level: 'school',
    title: 'Arc length and sectors',
    blurb: 'A sector is a fraction of a circle, so its arc and its area are the same fraction of the whole circle.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 2.2;
      const R = 1.45, a1 = 125, pt = (t, r) => [r * Math.cos(rad(t)), r * Math.sin(rad(t))];
      p.path(Array.from({ length: 61 }, (_, i) => pt(i * 6, R)), { stroke: alpha(pal.text, .5), width: 2, close: true });
      const sec = [[0, 0]]; for (let i = 0; i <= 24; i++) sec.push(pt(a1 * i / 24, R));
      p.path(sec, { fill: alpha(pal.yellow, .6), stroke: alpha(pal.text, .7), width: 2, close: true });
      p.path(Array.from({ length: 25 }, (_, i) => pt(a1 * i / 24, R)), { stroke: pal.blue, width: 6 });
      for (let k = 0; k < 24; k++) { const t = k * 15; p.path([pt(t, R + .12), pt(t, R + (k % 2 ? .2 : .3))], { stroke: pal.muted, width: 1.5 }); }
    },
    hook: String.raw`A pizza slice is a sector of a circle. If you know how wide the point of the slice is, how long is its crust and how much cheese does it carry?`,
    steps: [
      { title: 'A sector is a slice',
        text: String.raw`<p>A <b>sector</b> is a slice of a circle, like a slice of pizza. Its point is the center. The angle at the center is the <b>central angle</b>. A full turn is 360°, so a sector with central angle \(\theta\) is \(\frac{\theta}{360}\) of the circle.</p><p><b>Guess first.</b> Use the Predict box in the panel: pick the fraction, then the picture shows it.</p>`,
        set: { view: 'frac', ang: 90, r: 3, u: 0, predict: true } },
      { title: 'Arc length',
        text: String.raw`<p>The <b>arc</b> is the curved edge of the sector (thick blue). It is the same fraction of the circumference as the angle is of 360°.</p><p>Here the radius is 3 cm, so the circumference is \(2\pi\cdot 3=6\pi\). The sector is \(\frac{120}{360}=\frac13\) of the circle, so the arc is \(\frac13\cdot 6\pi=2\pi\approx 6.28\) cm. Press <b>Unroll the arc</b> to straighten it.</p>`,
        set: { view: 'arc', ang: 120, r: 3, u: 0, predict: false } },
      { title: 'Sector area, and a unit trap',
        text: String.raw`<p>The area works the same way: \(\frac13\) of the whole circle's area \(\pi\cdot 3^2=9\pi\), so the sector is \(3\pi\approx 9.42\) cm\(^2\).</p><p>Arc length and area use the <b>same fraction</b>, but the arc is a length (cm) and the area is a surface (cm\(^2\)). Press <b>Double the radius</b>: the arc becomes \(4\pi\) (twice as long), but the area becomes \(12\pi\) (4 times as big).</p>`,
        set: { view: 'area', ang: 120, r: 3, u: 0 } },
      { title: 'Perimeter: do not forget the sides',
        text: String.raw`<p>The <b>perimeter</b> of a sector is the whole way around its edge: the arc and the two straight sides. Each side is a radius.</p><p>For this sector: \(2\pi+3+3=2\pi+6\approx 12.28\) cm. Forgetting the two sides gives only \(2\pi\). Then try <b>Real situations</b> and <b>Work backwards</b> in the Look at list.</p>`,
        set: { view: 'perim', ang: 120, r: 3, u: 0 } }
    ],
    formal: String.raw`
      <p>A <b>sector</b> of a circle is the region between two radii and the arc that joins their ends. The angle between the radii is the <b>central angle</b> \(\theta\), measured in degrees. The arc is the part of the circle's edge that lies inside the angle.</p>
      <h3>Why a sector is a fraction of the circle</h3>
      <p>Cut a circle into \(n\) equal sectors by turning a radius through \(360/n\) degrees again and again. Turning does not change lengths or areas, so the \(n\) sectors have equal arcs and equal areas. Together they make the whole circle. So each one has \(\tfrac1n\) of the circumference and \(\tfrac1n\) of the area. A sector with central angle \(\theta=k\cdot\frac{360}{n}\) is \(k\) of these pieces, so it has \(\frac{k}{n}=\frac{\theta}{360}\) of both. That fraction is the whole idea:
      \[ f=\frac{\theta}{360}. \]</p>
      <h3>Arc length and sector area</h3>
      <p>The circumference of a circle with radius \(r\) is \(2\pi r\) and its area is \(\pi r^2\). Take the fraction \(f\) of each:
      \[ \text{arc}=\frac{\theta}{360}\cdot 2\pi r, \qquad \text{area}=\frac{\theta}{360}\cdot \pi r^2. \]
      The arc is a length, so it is in cm, m or in. The area is in cm\(^2\), m\(^2\) or in\(^2\). Both formulas start from the same fraction.</p>
      <p>The two are linked: \(\text{area}=\tfrac12\, r\cdot\text{arc}\). Check: \(\tfrac12 r\cdot\frac{\theta}{360}2\pi r=\frac{\theta}{360}\pi r^2\). A sector looks like a thin triangle with height \(r\) and a curved base.</p>
      <h3>Perimeter of a sector</h3>
      <p>The edge of a sector has three parts: the arc and two radii. So
      \[ P=\frac{\theta}{360}\cdot 2\pi r+2r. \]
      A common slip is to give only the arc. Another is to use the diameter \(2r\) for each side.</p>
      <h3>Doubling</h3>
      <p>If \(\theta\) doubles, \(f\) doubles, so the arc and the area both double. If \(r\) doubles, the arc has one factor \(r\), so it doubles, but the area has \(r^2\), so it becomes \(4\) times as big. This is the same pattern as in the lesson on similarity and scaling.</p>
      <h3>Working backwards</h3>
      <p>The fraction is \(f=\frac{\text{arc}}{2\pi r}\) or \(f=\frac{\text{area}}{\pi r^2}\), and then \(\theta=f\cdot 360\). To find a radius from a sector area, scale the area up to the whole circle first: \(\pi r^2=\text{area}\div f\), then \(r^2=\ldots\), then take the square root.</p>
      <h3>The rest of the circle</h3>
      <p>The central angle can be larger than \(180^\circ\). Such a sector is a <em>major sector</em>. It is the rest of the circle after a smaller sector is removed: its angle is \(360^\circ-\theta\), and its arc and area are the whole circle's minus the small sector's.</p>
      <h3>Worked example</h3>
      <p>A 14 inch pizza (radius \(7\) in) is cut into 8 equal slices. Each central angle is \(360^\circ\div 8=45^\circ\), so \(f=\frac{45}{360}=\frac18\). The area of one slice is \(\frac18\cdot\pi\cdot 7^2=\frac{49\pi}{8}\approx 19.24\) in\(^2\). The crust (arc) is \(\frac18\cdot 2\pi\cdot 7=\frac{7\pi}{4}\approx 5.50\) in.</p>
      <p>Measuring angles by the arc they cut off, instead of in degrees, leads to a new unit called the radian, which makes these formulas shorter.</p>`,
    check: [
      { q: 'A sector has a central angle of 90°. Which statement is true for a circle of any size?',
        choices: ['Its arc is 1/4 of the circumference and its area is 1/4 of the circle\'s area', 'Its arc is 1/4 of the circumference and its area is 1/2 of the circle\'s area', 'Its arc is 90 units long and its area is 90 square units', 'Its area is 1/4 of the circle\'s area but its arc is 1/2 of the circumference'], answer: 0,
        why: String.raw`A \(90^\circ\) sector is \(\frac{90}{360}=\frac14\) of the circle. Cutting from the center splits the edge and the inside in the same proportion, so the arc is \(\frac14\) of the circumference and the area is \(\frac14\) of the area. The angle in degrees is not a length or an area.`,
        hint: 'Both the arc and the area use the fraction angle over 360.' },
      { q: 'A sprinkler sprays water 12 m from its center and sweeps through 150°. A fence is put around the watered sector: along the curved edge and along the two straight edges. Use π ≈ 3.14. About how long is the fence?',
        choices: ['31.4 m', '43.4 m', '67.4 m', '55.4 m'], answer: 3,
        why: String.raw`The fraction is \(\frac{150}{360}=\frac{5}{12}\). The circumference is \(2\pi\cdot 12=24\pi\), so the arc is \(\frac{5}{12}\cdot 24\pi=10\pi\approx 31.4\) m. Add the two straight edges, \(12+12=24\) m: \(31.4+24=55.4\) m. The answer 31.4 forgets the straight edges. The answer 43.4 adds only one radius. The answer 67.4 adds three radii.`,
        hint: 'Find the fraction, then the arc, then add the two radii.' },
      { q: 'Jo finds the area of a sector with central angle 60° and radius 6 cm. Jo writes: "Area = 60/360 × 2π × 6 = 2π cm²." What is wrong?',
        choices: ['Jo used the circumference formula. The area is 60/360 × π × 6² = 6π cm²', 'The fraction should be 360/60, not 60/360', 'Jo should have used the diameter 12 in place of the radius 6', 'Nothing is wrong. The answer 2π cm² is correct'], answer: 0,
        why: String.raw`\(2\pi r\) is the circumference, so Jo's \(2\pi\) cm is the arc length, and it is a length, not cm\(^2\). Area uses \(\pi r^2\): \(\frac{60}{360}\cdot\pi\cdot 36=\frac16\cdot 36\pi=6\pi\approx 18.85\) cm\(^2\). The fraction \(\frac{60}{360}\) was right.`,
        hint: 'Which measurement uses 2πr, and which uses πr²?' }
    ],
    links: { prereq: ['area-of-a-circle'], next: ['radians-the-circles-own-angle-unit'], related: ['inscribed-angles', 'percents-on-tape-and-number-lines', 'similarity-and-scaling', 'the-unit-circle-and-trig-waves', 'scale-drawings-and-proportions', 'proportional-relationships', 'area-by-decomposition'] },

    mount({ stage, controls: C }) {
      const st = { ang: 90, r: 4, u: 0, view: 'frac', rest: false, prev: null, story: -1, hideSec: false, hideAng: false, hideR: false, over: {}, unit: 'cm', kind: null, note: '' };
      let cancel = () => {};
      const P = new Plane(stage, { span: 5 });
      const prac = { on: false, i: 0, st: 0, right: 0, done: 0, tried: false, solved: false, snap: null };
      let hnd = null;

      /* ---------- drawing ---------- */
      P.onDraw = (c, p) => {
        const pal = p.pal, w = p.w, hh = p.h; p.span = Math.min(w, hh) / 2; p.cx = 0; p.cy = 0;
        const pr = prac.on, v = pr ? 'plain' : st.view, ang = st.ang, r = st.r, u = st.unit, M = meas(ang, r);
        const fs = w < 460 ? 12.5 : 14, m = w < 460 ? 22 : 28;
        const txt = (s, x, y, o = {}) => {
          c.font = `${o.wt || 600} ${o.size || fs}px ${FONT}`; c.textAlign = o.al || 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 4; c.strokeStyle = pal.stage;
          if (o.halo !== false) c.strokeText(s, x, y); c.fillStyle = o.col || pal.text; c.fillText(s, x, y);
        };
        const kind = v === 'story' ? st.kind : v;
        const hasR2 = ['arc', 'area', 'perim', 'story'].includes(v);
        const pieB = 50, r2B = hasR2 ? 62 : 0, topM = (v === 'story' && st.story >= 0) ? 34 : 14;
        const yPie = hh - 20 - pieB, yR2 = yPie - 6 - r2B;
        const ha = (hasR2 ? yR2 : yPie) - 8 - topM;
        const Rfit = clamp(Math.min((w - 2 * m) / 2 - 46, ha / 2 - 44), 36, 420);
        const sc = pr ? 1 : Math.min(1, Math.max(.28, r / RMAX)), Rp = Rfit * (pr ? 1 : sc);
        const cx = w / 2, cy = topM + ha / 2;
        const W = w - 2 * m;

        if (v === 'story' && st.story >= 0) txt(CTX[st.story].title, w / 2, 17, { size: fs + 1, wt: 700 });

        /* clock dial */
        for (let k = 0; k < 24; k++) {
          const t = rad(k * 15), L = k % 6 === 0 ? 13 : k % 2 === 0 ? 9 : 5;
          c.beginPath(); c.moveTo(cx + (Rp + 13) * Math.cos(t), cy - (Rp + 13) * Math.sin(t)); c.lineTo(cx + (Rp + 13 + L) * Math.cos(t), cy - (Rp + 13 + L) * Math.sin(t));
          c.strokeStyle = alpha(pal.muted, k % 6 === 0 ? .95 : .6); c.lineWidth = k % 6 === 0 ? 2 : 1.2; c.stroke();
        }
        [[0, '0°'], [90, '90°'], [180, '180°'], [270, '270°']].forEach(([t, s]) => {
          const q = rad(t), d = Rp + 38; txt(s, cx + d * Math.cos(q) * (t % 180 === 0 ? 1.0 : 1), cy - d * Math.sin(q), { col: pal.muted, size: fs - 1, wt: 600, al: 'center' });
        });

        /* ghost of the earlier sector (after Double ...) */
        if (!pr && st.prev) {
          const Rg = Rfit * Math.min(1, Math.max(.28, st.prev.r / RMAX)), g = pts(cx, cy, Rg, 0, st.prev.ang, 60);
          c.beginPath(); c.moveTo(cx, cy); g.forEach(q => c.lineTo(q[0], q[1])); c.closePath();
          c.strokeStyle = alpha(pal.text, .55); c.lineWidth = 1.6; c.setLineDash([6, 5]); c.stroke(); c.setLineDash([]);
        }

        /* the circle and the rest */
        const full = pts(cx, cy, Rp, 0, 360, 90);
        c.beginPath(); full.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.closePath();
        c.fillStyle = alpha(pal.muted, .08); c.fill(); c.strokeStyle = alpha(pal.text, .5); c.lineWidth = 1.8; c.stroke();
        const secOn = !st.hideSec;
        if (!pr && st.rest && secOn) {
          const g = pts(cx, cy, Rp, ang, 360, 70);
          c.beginPath(); c.moveTo(cx, cy); g.forEach(q => c.lineTo(q[0], q[1])); c.closePath();
          c.fillStyle = alpha(pal.muted, .22); c.fill();
          c.strokeStyle = alpha(pal.text, .6); c.lineWidth = 3; c.setLineDash([7, 6]);
          c.beginPath(); pts(cx, cy, Rp, ang, 360, 70).forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.stroke(); c.setLineDash([]);
          const bt = rad((ang + 360) / 2); txt('rest ' + (360 - ang) + '°', cx + Rp * .6 * Math.cos(bt), cy - Rp * .6 * Math.sin(bt), { col: pal.text, size: fs - .5 });
        }
        const mid = rad(ang / 2), at = (f, ex = 0) => [cx + (Rp * f + ex) * Math.cos(mid), cy - (Rp * f + ex) * Math.sin(mid)];

        if (secOn) {
          /* shaded sector */
          const g = pts(cx, cy, Rp, 0, ang, 70);
          c.beginPath(); c.moveTo(cx, cy); g.forEach(q => c.lineTo(q[0], q[1])); c.closePath();
          c.fillStyle = alpha(pal.yellow, .55); c.fill();
          c.strokeStyle = pal.text; c.lineWidth = 2.2; c.stroke();
          /* the arc: blue, thick; it unrolls into the bar below in the arc view */
          const uu = v === 'arc' ? ease(clamp(st.u, 0, 1)) : 0, n = 60;
          if (uu > .02) { c.beginPath(); pts(cx, cy, Rp, 0, ang, 60).forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.strokeStyle = alpha(pal.blue, .35); c.lineWidth = 4; c.setLineDash([2, 6]); c.stroke(); c.setLineDash([]); }
          c.beginPath();
          for (let i = 0; i <= n; i++) {
            const th = ang * i / n, a = [cx + Rp * Math.cos(rad(th)), cy - Rp * Math.sin(rad(th))], b = [m + W * th / 360, yR2 + 24];
            const x = lerp(a[0], b[0], uu), y = lerp(a[1], b[1], uu); i ? c.lineTo(x, y) : c.moveTo(x, y);
          }
          c.strokeStyle = pal.blue; c.lineWidth = 6; c.lineCap = 'round'; c.stroke(); c.lineCap = 'butt';

          /* text labels (text as well as color) */
          const aT = st.over.ang || (st.hideAng ? 'angle = ?' : ang + '°');
          const q1 = at(ang < 40 ? .62 : .42); txt(aT, q1[0], q1[1], { size: fs });
          if (v === 'arc' || v === 'perim' || (v === 'story' && st.kind === 'arc') || st.over.arc) {
            const q2 = at(.82); const t2 = st.over.arc || 'arc'; txt(t2, q2[0], q2[1], { col: pal.text, size: fs - .5, wt: 700 });
          }
          if (v === 'area' || (v === 'story' && st.kind === 'area') || st.over.area) {
            const q3 = at(.66); txt(st.over.area || 'area', q3[0], q3[1] + (ang < 60 ? 0 : 0), { size: fs - .5, wt: 700 });
          }
        }
        const rT = st.over.r || (st.hideR ? 'r = ?' : 'r = ' + r + ' ' + u);
        txt(rT + (!pr && r > RMAX ? ' (not to scale)' : ''), cx + Rp / 2, cy + 15, { size: fs - .5 });
        c.beginPath(); c.arc(cx, cy, 3.5, 0, TAU); c.fillStyle = pal.text; c.fill();

        /* the handle */
        hnd = null;
        if (!pr && secOn && !(v === 'back' && !back.solved)) {
          const hx = cx + Rp * Math.cos(rad(ang)), hy = cy - Rp * Math.sin(rad(ang));
          c.beginPath(); c.arc(hx, hy, 10, 0, TAU); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.brass; c.lineWidth = 3.5; c.stroke();
          hnd = { x: hx, y: hy, cx, cy };
        }

        /* the fraction bar: 24 cells of 15° */
        {
          const known = !st.hideAng && secOn, y = yPie + 18;
          txt(known ? `fraction of the circle: ${ang}/360 = ${M.F}` : (st.hideAng ? 'fraction of the circle: ?' : 'guess the fraction first'), m, yPie + 6, { al: 'left', size: fs });
          c.fillStyle = alpha(pal.muted, .12); c.fillRect(m, y, W, 16);
          if (known) { c.fillStyle = alpha(pal.yellow, .8); c.fillRect(m, y, W * ang / 360, 16); }
          c.strokeStyle = alpha(pal.text, .35); c.lineWidth = 1; c.beginPath();
          for (let k = 1; k < 24; k++) { c.moveTo(m + W * k / 24, y); c.lineTo(m + W * k / 24, y + (k % 6 === 0 ? 16 : 6)); }
          c.stroke(); c.strokeStyle = alpha(pal.text, .7); c.lineWidth = 1.5; c.strokeRect(m, y, W, 16);
          [0, 90, 180, 270, 360].forEach((t, i) => txt(t + '°', m + W * t / 360, y + 28, { al: i === 0 ? 'left' : i === 4 ? 'right' : 'center', size: fs - 1.5, col: pal.muted, wt: 600 }));
        }

        /* the part-of-the-whole bar for the current question */
        if (hasR2 && secOn) {
          const y = yR2 + 16, x0 = m;
          const barKind = kind === 'perim' ? 'perim' : kind;
          const base = alpha(pal.muted, .12);
          if (barKind === 'arc') {
            txt(`whole circle: 2πr = ${M.circS} ≈ ${dec(M.circV)} ${u}`, m, yR2 + 5, { al: 'left' });
            c.fillStyle = base; c.fillRect(x0, y, W, 16); c.fillStyle = alpha(pal.blue, .85); c.fillRect(x0, y, W * ang / 360, 16);
            c.strokeStyle = alpha(pal.text, .7); c.lineWidth = 1.5; c.strokeRect(x0, y, W, 16);
            txt(`arc = ${M.F} of it = ${M.arcS} ≈ ${dec(M.arcV)} ${u}`, m, yR2 + 48, { al: 'left', wt: 700 });
            if (W * ang / 360 > 34) txt('arc', x0 + W * ang / 720, y + 8, { size: fs - 1.5, col: '#ffffff', wt: 700, halo: false });
          } else if (barKind === 'area') {
            txt(`whole circle: πr² = ${M.wAS} ≈ ${dec(M.wAV)} ${u}²`, m, yR2 + 5, { al: 'left' });
            c.fillStyle = base; c.fillRect(x0, y, W, 16); c.fillStyle = alpha(pal.yellow, .8); c.fillRect(x0, y, W * ang / 360, 16);
            c.strokeStyle = alpha(pal.text, .7); c.lineWidth = 1.5; c.strokeRect(x0, y, W, 16);
            txt(`sector = ${M.F} of it = ${M.areaS} ≈ ${dec(M.areaV)} ${u}²`, m, yR2 + 48, { al: 'left', wt: 700 });
            if (W * ang / 360 > 44) txt('sector', x0 + W * ang / 720, y + 8, { size: fs - 1.5, wt: 700 });
          } else if (barKind === 'perim') {
            const tot = 2 * r + M.arcV, wr = W * r / tot, wa = W * M.arcV / tot;
            txt('perimeter = radius + arc + radius, laid in a line', m, yR2 + 5, { al: 'left' });
            c.fillStyle = alpha(pal.muted, .45); c.fillRect(x0, y, wr, 16); c.fillRect(x0 + wr + wa, y, wr, 16);
            c.fillStyle = alpha(pal.blue, .85); c.fillRect(x0 + wr, y, wa, 16);
            c.strokeStyle = alpha(pal.text, .7); c.lineWidth = 1.5; c.strokeRect(x0, y, W, 16);
            c.beginPath(); c.moveTo(x0 + wr, y); c.lineTo(x0 + wr, y + 16); c.moveTo(x0 + wr + wa, y); c.lineTo(x0 + wr + wa, y + 16); c.stroke();
            txt('r', x0 + wr / 2, y + 8, { size: fs - 1.5, wt: 700 }); txt('r', x0 + wr + wa + wr / 2, y + 8, { size: fs - 1.5, wt: 700 });
            txt('arc', x0 + wr + wa / 2, y + 8, { size: fs - 1.5, col: '#ffffff', wt: 700, halo: false });
            txt(`${M.arcS} + ${2 * r} ≈ ${dec(M.perV)} ${u}`, m, yR2 + 48, { al: 'left', wt: 700 });
          }
        }
      };

      /* ---------- controls ---------- */
      const probe = C.readout(), host = probe.parentNode; probe.remove();
      const track = (arr, fn) => { const n = host.children.length, res = fn(); Array.from(host.children).slice(n).forEach(e => arr.push(e)); return res; };
      const show = (els, on) => els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const G = { sec: [], pred: [], build: [], dbl: [], unroll: [], back: [], story: [], ro: [] };
      const VIEWS = [['frac', '1. Fraction of the circle'], ['arc', '2. Arc length'], ['area', '3. Sector area'], ['perim', '4. Perimeter of a sector'], ['story', '5. Real situations'], ['back', '6. Work backwards']];
      const cap1 = s => s[0].toUpperCase() + s.slice(1);

      /* a small multiple-choice box used for predictions, builders, backwards tasks and practice */
      const quiz = (grp, track2) => {
        const box = h('div', { class: 'ctl', style: 'display:flex;flex-direction:column;gap:8px' });
        const qEl = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' }), chEl = h('div', { class: 'ctl buttons', style: 'flex-direction:column;align-items:stretch' });
        const fbEl = h('p', { style: 'margin:0;font-size:.92rem;line-height:1.5', 'aria-live': 'polite' });
        const nxEl = h('div', { class: 'ctl buttons' });
        box.append(qEl, chEl, fbEl, nxEl);
        const o = { box, qEl, chEl, fbEl, nxEl, cur: null,
          ask(q, ch, ans, cb) {
            o.cur = { q, ch, ans, cb, solved: false, tried: false };
            qEl.innerHTML = q; fbEl.innerHTML = ''; chEl.innerHTML = ''; nxEl.innerHTML = '';
            ch.forEach(([t], i) => chEl.append(h('button', { type: 'button', class: 'btn', style: 'justify-content:flex-start;text-align:left;height:auto;min-height:42px;padding:8px 14px', onclick: ev => o.pick(i, ev.currentTarget) }, String.fromCharCode(65 + i) + '. ' + t)));
          },
          pick(i, btn) {
            const cu = o.cur; if (!cu || cu.solved) return;
            if (cu.cb && cu.cb.onPick && cu.cb.onPick(i, i === cu.ans, cu.tried) === 'skip') return;
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

      /* ---- sector controls ---- */
      track(G.sec, () => C.title('The sector'));
      const angS = track(G.sec, () => C.slider({ label: 'Central angle', min: 5, max: 355, step: 1, value: st.ang, format: v => Math.round(v) + '°', onInput: v => edit(() => { st.ang = Math.round(v); }) }));
      const stepB = track(G.sec, () => C.buttons([
        { label: '−15°', onClick: () => edit(() => { st.ang = clamp(Math.ceil(st.ang / 15 - 1e-9) * 15 - 15, 5, 355); }) },
        { label: '+15°', onClick: () => edit(() => { st.ang = clamp(Math.floor(st.ang / 15 + 1e-9) * 15 + 15, 5, 355); }) }
      ]));
      const rS = track(G.sec, () => C.slider({ label: 'Radius r', min: 2, max: RSL, step: 1, value: st.r, format: v => Math.round(v) + ' ' + st.unit, onInput: v => edit(() => { st.r = Math.round(v); }) }));
      const sel = track(G.sec, () => C.select({ label: 'Look at', options: VIEWS.map(([value, label]) => ({ value, label })), value: st.view, onChange: v => { cancel(); setView(v); sync(); } }));
      const restT = track(G.sec, () => C.toggle({ label: 'Show the rest of the circle', value: st.rest, onChange: b => { st.rest = b; sync(); } }));
      track(G.sec, () => C.hint('You can also drag the ring on the rim. It snaps to 5°. Use the slider or the ±15° buttons if you prefer.'));

      const lockBack = () => st.view === 'back' && !back.solved && !prac.on;
      function manual() { cancel(); st.prev = null; st.story = -1; st.note = ''; bumpBuild(); }
      const edit = fn => { if (lockBack()) { sync(); return; } manual(); fn(); sync(); };

      /* ---- predict (view 1) ---- */
      const PRED = [
        { ang: 90, q: 'Predict. A sector has a central angle of 90°. What fraction of the whole circle is it?', ans: 1,
          ch: [['1/2', 'Half the circle would be 180°, a straight line. 90° is only half of that.'], ['1/4', '90/360 = 1/4. Four sectors of 90° make a full 360° turn.'], ['1/3', 'Three equal sectors would each be 120°, not 90°.'], ['1/8', 'Eight equal sectors would each be 45°. 90° is twice that.']] },
        { ang: 120, q: 'Predict. Now a sector with a central angle of 120°. What fraction of the circle is it?', ans: 2,
          ch: [['1/4', 'Four equal sectors would each be 90°. 120° is bigger than that.'], ['1/2', 'Half the circle is 180°. 120° is less.'], ['1/3', '120/360 = 1/3. Three sectors of 120° make 360°.'], ['2/3', '2/3 of the circle would be 240°. A 120° sector is only half of that.']] },
        { ang: 45, q: 'Predict. Last one: a sector with a central angle of 45°. What fraction of the circle is it?', ans: 0,
          ch: [['1/8', '45/360 = 1/8. Eight sectors of 45° make 360°.'], ['1/4', 'A quarter is 90°. 45° is half of that, so it is half of a quarter.'], ['1/6', 'A sixth would be 60°, because 360 ÷ 6 = 60.'], ['1/45', 'The 45 is a number of degrees, not a number of pieces. Divide: 45/360.']] }
      ];
      const pred = { i: 0, right: 0, done: false };
      const pq = track(G.pred, () => { const q = quiz(); host.append(q.box); return q; });
      G.pred.push(pq.box);
      const predAsk = () => {
        const pd = PRED[pred.i]; st.hideSec = true; st.ang = pd.ang; pq.ask(pd.q, pd.ch.map(x => [...x]), pd.ans, {
          onPick: (i, ok) => {
            st.hideSec = false; cancel(); st.ang = 5;
            cancel = animateTo(st, { ang: pd.ang }, 1000, sync);
            if (ok) pred.right++;
          } });
        pq.fbEl.innerHTML = ''; sync();
      };
      /* the first pick reveals the answer for any choice, then the box moves on */
      pq.pick = (i, btn) => {
        const cu = pq.cur; if (!cu || cu.solved) return;
        if (cu.committed) return;
        cu.committed = true; const ok = i === cu.ans;
        cu.cb.onPick(i, ok);
        Array.from(pq.chEl.children).forEach((b, j) => { b.disabled = true; if (j === cu.ans) { b.style.borderColor = 'var(--green)'; b.style.color = 'var(--green)'; } else if (j === i) { b.style.borderColor = 'var(--red)'; b.style.color = 'var(--red)'; } });
        pq.fbEl.innerHTML = `<b>${ok ? 'Yes.' : 'Not this time.'}</b> ${ok ? '' : 'You guessed ' + cu.ch[i][0] + '. '}${cu.ch[i][1]} ${ok ? '' : 'The right answer was ' + cu.ch[cu.ans][0] + '. '}The picture shows it: the shaded part is ${frac(PRED[pred.i].ang, 360)} of the circle.`;
        cu.solved = true; predDone(); sync();
      };
      const predDone = () => {
        pq.nxEl.innerHTML = '';
        const last = pred.i + 1 >= PRED.length;
        pq.nxEl.append(h('button', { type: 'button', class: 'btn primary', onclick: () => { if (last) { pred.done = true; pq.fbEl.innerHTML = `You predicted ${pred.right} of ${PRED.length} right. Now drag the ring and watch the fraction bar: the shaded part of the bar is always angle/360.`; pq.chEl.innerHTML = ''; pq.qEl.innerHTML = ''; pq.nxEl.innerHTML = ''; pq.nxEl.append(h('button', { type: 'button', class: 'btn', onclick: () => startPred() }, 'Predict again')); } else { pred.i++; predAsk(); } } }, last ? 'Finish' : 'Next prediction'));
      };
      function startPred() { cancel(); pred.i = 0; pred.right = 0; pred.done = false; st.prev = null; st.story = -1; predAsk(); }

      /* ---- builder (views 2, 3, 4) ---- */
      const bq = track(G.build, () => { const q = quiz(); host.append(q.box); return q; });
      G.build.push(bq.box);
      let bSeq = [], bIdx = 0;
      const buildSeq = () => {
        const { ang, r, view } = st, u = st.unit, M = meas(ang, r), F = M.F, key = ang / 5 + r, seq = [];
        const wrongF = uniq(F, [
          [frac(360 - ang, 360), `That is the rest of the circle (${360 - ang}°), not this sector.`],
          [frac(ang, 180), 'That compares the angle with 180°, a half turn. A full circle is 360°.'],
          [`${ang}/100`, 'A full circle is 360°, not 100°.'],
          [frac(360, ang), 'That is upside down. The part goes on top: angle over 360.']]);
        const f1 = place([F, `Right. The sector's angle is ${ang}°, out of 360° for the whole circle: ${ang}/360 = ${F}.`], wrongF, key);
        seq.push({ q: `Step 1. The shaded sector has a central angle of ${ang}°. What fraction of the whole circle is it?`, ch: f1.ch, ans: f1.ans });
        if (view === 'arc') {
          const w2 = [[`the area πr² = ${M.wAS} ${u}²`, 'That is the whole circle\'s area, a surface. An arc is a length, so start from the length around the circle.'],
            [`the diameter 2r = ${2 * r} ${u}`, 'The diameter goes across the circle. The arc is part of the way around.'],
            [`the radius r = ${r} ${u}`, 'The radius is a straight segment from the center. The arc is part of the way around, so scale the circumference.']];
          const f2 = place([`the circumference 2πr = ${M.circS} ${u}`, `The arc is ${F} of the way around, so take ${F} of the circumference ${M.circS}. Arc = ${F} × ${M.circS} = ${M.arcS} ≈ ${dec(M.arcV)} ${u}.`], w2, key + 1);
          seq.push({ q: `Step 2. Take that fraction of which whole-circle measurement to get the arc length?`, ch: f2.ch, ans: f2.ans });
        } else if (view === 'area') {
          const w2 = [[`the circumference 2πr = ${M.circS} ${u}`, 'That is the length around the circle. Area covers the inside, so it needs πr².'],
            [`the radius squared r² = ${r * r} ${u}²`, 'That leaves out π. The circle\'s area is π × r², not just r².'],
            [`the diameter squared (2r)² = ${4 * r * r} ${u}²`, 'The area formula uses the radius, not the diameter. π × r² is the area.']];
          const f2 = place([`the area πr² = ${M.wAS} ${u}²`, `The sector is ${F} of the inside, so take ${F} of πr² = ${M.wAS}. Area = ${F} × ${M.wAS} = ${M.areaS} ≈ ${dec(M.areaV)} ${u}².`], w2, key + 1);
          seq.push({ q: `Step 2. Take that fraction of which whole-circle measurement to get the sector's area?`, ch: f2.ch, ans: f2.ans });
          const f3 = place([`${u}² (square ${u})`, 'Area counts squares, so the unit is square cm, m or in. The arc (a length) is the one in plain units.'],
            [[`${u}`, `${u} is a length unit. It fits the arc, but area is measured in squares.`], [`${u}³ (cubic ${u})`, 'Cubes measure volume. A flat sector has area only.'], ['degrees', 'Degrees measure the angle, not the size of the region.']], key + 2);
          seq.push({ q: 'Step 3. In which unit is the area of the sector?', ch: f3.ch, ans: f3.ans });
        } else {
          const w2 = [[`${M.arcS} ${u}`, `That is only the curved edge. The sector's boundary also has two straight sides.`],
            [`${M.arcS} + ${r} ${u}`, 'That adds one straight side. There are two radii, one on each side of the angle.'],
            [`${M.arcS} + ${4 * r} ${u}`, 'The straight sides are radii (' + r + ' ' + u + ' each), not diameters. Two radii make ' + 2 * r + ' ' + u + '.']];
          const f2 = place([`${M.arcS} + ${2 * r} ${u}`, `The edge is the arc ${M.arcS} plus two radii, 2 × ${r} = ${2 * r}. Perimeter = ${M.perS} ≈ ${dec(M.perV)} ${u}.`], w2, key + 1);
          seq.splice(1, 0, { q: 'Step 2. The perimeter is the whole way around the sector. Which one is it?', ch: f2.ch, ans: f2.ans });
        }
        return seq;
      };
      const bNext = () => {
        if (bIdx >= bSeq.length) {
          const M = meas(st.ang, st.r), u = st.unit, v = st.view;
          bq.qEl.innerHTML = ''; bq.chEl.innerHTML = ''; bq.nxEl.innerHTML = '';
          bq.fbEl.innerHTML = v === 'arc' ? `<b>Built it.</b> Arc = ${M.F} × ${M.circS} = ${M.arcS} ≈ ${dec(M.arcV)} ${u}. Change the angle or the radius to build another.`
            : v === 'area' ? `<b>Built it.</b> Area = ${M.F} × ${M.wAS} = ${M.areaS} ≈ ${dec(M.areaV)} ${u}². Change the angle or the radius to build another.`
              : `<b>Built it.</b> Perimeter = ${M.perS} ≈ ${dec(M.perV)} ${u}. Change the angle or the radius to build another.`;
          return;
        }
        const s = bSeq[bIdx];
        bq.ask(s.q, s.ch, s.ans, { onRight: () => {
          bq.nxEl.innerHTML = ''; bq.nxEl.append(h('button', { type: 'button', class: 'btn primary', onclick: () => { bIdx++; bNext(); } }, bIdx + 1 >= bSeq.length ? 'See the result' : 'Next step'));
        } });
      };
      function bumpBuild() {
        if (!['arc', 'area', 'perim'].includes(st.view)) { bq.clear(); return; }
        bSeq = buildSeq(); bIdx = 0; bNext();
      }

      /* ---- doubling and unrolling (views 2 and 3) ---- */
      const tgt = o => { cancel(); cancel = animateTo(st, o, 800, sync, () => bumpBuildKeepPrev()); };
      function bumpBuildKeepPrev() { bumpBuild(); }
      const dblB = track(G.dbl, () => C.buttons([
        { label: 'Double the angle', onClick: () => { if (st.ang * 2 > 355) { st.note = 'Doubling would pass 355°. Make the angle smaller first.'; sync(); return; } st.note = ''; st.prev = { ang: st.ang, r: st.r }; tgt({ ang: st.ang * 2 }); } },
        { label: 'Double the radius', onClick: () => { if (st.r * 2 > RMAX) { st.note = 'Doubling would pass ' + RMAX + ', the largest radius drawn to scale. Make the radius smaller first.'; sync(); return; } st.note = ''; st.prev = { ang: st.ang, r: st.r }; tgt({ r: st.r * 2 }); } },
        { label: 'Undo', onClick: () => { if (!st.prev) return; const p0 = st.prev; st.note = ''; tgt({ ang: p0.ang, r: p0.r }); st.prev = null; } }
      ]));
      const unB = track(G.unroll, () => C.buttons([{ label: 'Unroll the arc', primary: true, onClick: () => { cancel(); const to = st.u < .5 ? 1 : 0; cancel = animateTo(st, { u: to }, 1400, sync); } }]));

      /* ---- real situations (view 5) ---- */
      const storyB = track(G.story, () => C.buttons(CTX.map((cx, i) => ({ label: cx.btn, onClick: () => { selectStory(i); } }))));
      const storyP = track(G.story, () => h('p', { class: 'hint', style: 'margin:0', 'aria-live': 'polite' }));
      host.append(storyP); G.story.push(storyP);
      function selectStory(i, imm) {
        cancel(); const cx = CTX[i]; st.story = i; st.unit = cx.unit; st.kind = cx.ask; st.prev = null; st.over = {};
        storyP.textContent = cx.text;
        if (imm) { st.ang = cx.ang; st.r = cx.r; sync(); } else cancel = animateTo(st, { ang: cx.ang, r: cx.r }, 800, sync);
      }

      /* ---- work backwards (view 6) ---- */
      const BACK = [
        { ang: 90, r: 6, over: { arc: 'arc = 3π cm' }, hideAng: true, hideR: false,
          q: 'The arc of a sector is 3π cm long and the radius is 6 cm. Which setup finds the central angle?',
          good: ['angle = 3π ÷ (2π × 6) × 360', 'The whole circumference is 2π × 6 = 12π. The arc is 3π ÷ 12π = 1/4 of it, so the angle is 1/4 × 360° = 90°.'],
          bad: [['angle = 3π ÷ 6 × 360', 'That divides by the radius only. The arc is a fraction of the whole way round, 2πr = 12π, not of r.'],
            ['angle = 3π × 6 ÷ 360', 'Multiplying the arc by the radius makes no sense here. Divide the arc by the whole circumference to get the fraction, then multiply by 360.'],
            ['angle = 3π ÷ (π × 6²) × 360', 'π × 6² is the area of the whole circle. An arc is a length, so compare it with the circumference 2π × 6.']] },
        { ang: 80, r: 3, over: { area: 'area = 2π cm²' }, hideAng: true, hideR: false,
          q: 'A sector with radius 3 cm has an area of 2π cm². Which setup finds the central angle?',
          good: ['angle = 2π ÷ (π × 3²) × 360', 'The whole circle has area π × 3² = 9π. The fraction is 2π ÷ 9π = 2/9, so the angle is 2/9 × 360° = 80°.'],
          bad: [['angle = 2π ÷ (2π × 3) × 360', '2π × 3 is the circumference, a length. A sector\'s area must be compared with the whole circle\'s area, π × 3².'],
            ['angle = 2π ÷ 3² × 360', 'That forgets the π in the whole circle\'s area. The whole area is π × 3² = 9π.'],
            ['angle = 2π × 360 ÷ (π × 3)', 'That uses π × r. The area has r squared: π × 3².']] },
        { ang: 120, r: 6, over: { area: 'area = 12π cm²', r: 'r = ?' }, hideAng: false, hideR: true,
          q: 'A sector has a central angle of 120° and an area of 12π cm². Which setup finds the radius?',
          good: ['Whole area = 12π ÷ (1/3) = 36π, so r² = 36 and r = 6', 'The sector is 120/360 = 1/3 of the circle, so the whole circle is 3 times as big: 36π. Then π r² = 36π gives r² = 36, and r = 6 cm.'],
          bad: [['Whole area = 12π ÷ (1/3) = 36π, so r = 36', 'The 36 is r squared. The radius is the square root of 36, which is 6.'],
            ['r² = 12, so r = √12', '12π is only the sector. The sector is 1/3 of the circle, so the whole area is 3 times as big, 36π.'],
            ['Whole area = 12π × (1/3) = 4π, so r = 2', 'To go from a part to the whole, divide by the fraction (or multiply by 3). Multiplying by 1/3 makes it smaller.']] }
      ];
      const back = { i: 0, solved: false, right: 0 };
      const bk = track(G.back, () => { const q = quiz(); host.append(q.box); return q; });
      G.back.push(bk.box);
      const backAsk = () => {
        const t = BACK[back.i]; back.solved = false;
        Object.assign(st, { ang: t.ang, r: t.r, unit: 'cm', hideAng: t.hideAng, hideR: t.hideR, over: { ...t.over }, prev: null });
        const pl = place(t.good, t.bad, back.i * 2 + 1);
        bk.ask(t.q, pl.ch, pl.ans, { onRight: tried => {
          back.solved = true; if (!tried) back.right++;
          st.hideAng = false; st.hideR = false; st.over = {}; sync();
          bk.nxEl.innerHTML = ''; bk.nxEl.append(h('button', { type: 'button', class: 'btn primary', onclick: () => { if (back.i + 1 >= BACK.length) { bk.qEl.innerHTML = ''; bk.chEl.innerHTML = ''; bk.nxEl.innerHTML = ''; bk.fbEl.innerHTML = `You chose the right setup first try for ${back.right} of ${BACK.length}. The pattern: find the fraction from the part and the whole, then use it (angle = fraction × 360°).`; bk.nxEl.append(h('button', { type: 'button', class: 'btn', onclick: () => { back.i = 0; back.right = 0; backAsk(); } }, 'Do them again')); } else { back.i++; backAsk(); } } }, back.i + 1 >= BACK.length ? 'Finish' : 'Next problem'));
        } });
        sync();
      };

      /* ---- readout ---- */
      const ro = C.readout();
      const kv = (a, b) => `<span class="k">${a}</span> ${b}`;
      const upd = () => {
        const { ang, r, view } = st, u = st.unit, M = meas(ang, r), o = [];
        const restM = meas(360 - ang, r);
        if (view === 'frac') {
          o.push(kv('Central angle', ang + '°'), kv('Fraction of the circle', `${ang}/360 = ${M.F}`), kv('As a percent', `${M.pct}%`));
          if (st.rest) o.push(kv('The rest of the circle', `${360 - ang}°, which is ${restM.F}`));
        } else if (view === 'arc') {
          o.push(kv('Whole circle', `circumference 2πr = ${M.circS} ≈ ${dec(M.circV)} ${u}`), kv('Fraction', `${ang}/360 = ${M.F}`), kv('Arc length', `${M.F} × ${M.circS} = ${M.arcS} ≈ ${dec(M.arcV)} ${u}`));
          if (st.rest) o.push(kv('The rest (' + (360 - ang) + '°)', `arc = ${restM.arcS} ≈ ${dec(restM.arcV)} ${u}, and ${M.arcS} + ${restM.arcS} = ${M.circS}`));
        } else if (view === 'area') {
          o.push(kv('Whole circle', `area πr² = ${M.wAS} ≈ ${dec(M.wAV)} ${u}²`), kv('Fraction', `${ang}/360 = ${M.F}`), kv('Sector area', `${M.F} × ${M.wAS} = ${M.areaS} ≈ ${dec(M.areaV)} ${u}²`));
          o.push(kv('Side by side', `arc ${M.arcS} ≈ ${dec(M.arcV)} ${u} (a length), area ${M.areaS} ≈ ${dec(M.areaV)} ${u}² (a surface)`));
          if (st.rest) o.push(kv('The rest (' + (360 - ang) + '°)', `area = ${restM.areaS} ≈ ${dec(restM.areaV)} ${u}², and ${M.areaS} + ${restM.areaS} = ${M.wAS}`));
        } else if (view === 'perim') {
          o.push(kv('Arc', `${M.arcS} ≈ ${dec(M.arcV)} ${u}`), kv('Two straight sides', `2 × ${r} = ${2 * r} ${u}`), kv('Perimeter', `${M.arcS} + ${2 * r} ≈ ${dec(M.perV)} ${u}`));
          o.push(kv('Only the arc?', `${M.arcS} ≈ ${dec(M.arcV)} ${u} is too short: it leaves out ${2 * r} ${u}`));
        } else if (view === 'story') {
          const cx = CTX[st.story];
          if (cx && ang === cx.ang && r === cx.r) {
            o.push(kv('Fraction', `${ang}/360 = ${M.F} (${M.pct}%)`));
            o.push(kv('Arc length' + (cx.ask === 'arc' ? ' (asked)' : ''), `${M.F} × ${M.circS} = ${M.arcS} ≈ ${dec(M.arcV)} ${u}`));
            o.push(kv('Sector area' + (cx.ask === 'area' ? ' (asked)' : ''), `${M.F} × ${M.wAS} = ${M.areaS} ≈ ${dec(M.areaV)} ${u}²`));
          } else {
            o.push(kv('Fraction', `${ang}/360 = ${M.F} (${M.pct}%)`), kv('Arc length', `${M.arcS} ≈ ${dec(M.arcV)} ${u}`), kv('Sector area', `${M.areaS} ≈ ${dec(M.areaV)} ${u}²`));
          }
        } else {
          if (!back.solved) o.push('Choose the setup in the box above. The picture shows the sector, but its angle or radius is hidden until you choose.');
          else o.push(kv('Central angle', ang + '°'), kv('Radius', `${r} ${u}`), kv('Arc length', `${M.arcS} ≈ ${dec(M.arcV)} ${u}`), kv('Sector area', `${M.areaS} ≈ ${dec(M.areaV)} ${u}²`));
        }
        if (st.prev && (view === 'arc' || view === 'area' || view === 'frac' || view === 'perim')) {
          const a = meas(st.prev.ang, st.prev.r);
          const ra = (ang * r) / (st.prev.ang * st.prev.r), rb = (ang * r * r) / (st.prev.ang * st.prev.r * st.prev.r);
          o.push(kv('Before', `angle ${st.prev.ang}°, r = ${st.prev.r}: arc ${a.arcS} ≈ ${dec(a.arcV)}, area ${a.areaS} ≈ ${dec(a.areaV)}`));
          o.push(kv('Now', `arc ×${num(ra)}, area ×${num(rb)}`));
        }
        if (st.note) o.push(st.note);
        ro.innerHTML = o.join('<br>');
      };
      G.ro.push(ro);

      /* ---- practice ---- */
      const PR = [
        { fig: { ang: 60, r: 9, unit: 'cm' },
          stages: [{ q: 'A sector has a central angle of 60° and a radius of 9 cm. What is the length of its arc?', ans: 1,
            ch: [['13.5π cm (about 42.41 cm)', 'That is 1/6 of π r², the sector\'s area (13.5π cm²). An arc is a length, so use the circumference 2πr = 18π.'],
              ['3π cm (about 9.42 cm)', '60/360 = 1/6 of the circle. The circumference is 2π × 9 = 18π, and 1/6 × 18π = 3π ≈ 9.42 cm.'],
              ['6π cm (about 18.85 cm)', 'That used 60/180 = 1/3. A full circle is 360°, so the fraction is 60/360 = 1/6.'],
              ['18π cm (about 56.55 cm)', 'That is the whole circumference. The sector is only 1/6 of the circle.']] }] },
        { fig: { ang: 120, r: 6, unit: 'cm' },
          stages: [{ q: 'A sector has a central angle of 120° and a radius of 6 cm. What is its area?', ans: 3,
            ch: [['4π cm²', 'That is the arc length 4π cm (1/3 of 12π), not the area. Use πr² = 36π.'],
              ['36π cm²', 'That is the whole circle. The sector is 120/360 = 1/3 of it.'],
              ['12π cm', 'The number is right but the unit is not. Area is in cm², not cm.'],
              ['12π cm² (about 37.70 cm²)', '120/360 = 1/3. The whole circle has area π × 6² = 36π, and 1/3 × 36π = 12π ≈ 37.70 cm².']] }] },
        { fig: { ang: 90, r: 10, unit: 'cm' },
          stages: [{ q: 'A sector has a central angle of 90° and a radius of 10 cm. What is its perimeter (the whole way around the sector)?', ans: 2,
            ch: [['5π cm (about 15.71 cm)', 'That is only the arc. The perimeter also has the two straight sides.'],
              ['5π + 10 cm', 'That adds one straight side. There are two radii.'],
              ['5π + 20 cm (about 35.71 cm)', 'The arc is 1/4 × 2π × 10 = 5π. Add the two radii, 10 + 10 = 20. Perimeter = 5π + 20 ≈ 35.71 cm.'],
              ['5π + 40 cm', 'The straight sides are radii (10 cm each), not diameters. Two radii make 20 cm.']] }] },
        { fig: { ang: 150, r: 12, unit: 'cm', hideAng: true, over: { arc: 'arc = 10π cm' } },
          stages: [{ q: 'A sector with radius 12 cm has an arc that is 10π cm long. What is its central angle?', ans: 0,
            ch: [['150°', 'The circumference is 2π × 12 = 24π. The fraction is 10π ÷ 24π = 5/12, and 5/12 × 360° = 150°.'],
              ['75°', 'That used the diameter 24 as the radius (the circumference would be 48π). The radius is 12.'],
              ['5/12 of a degree', '5/12 is the fraction of the circle. Multiply it by 360° to turn it into an angle.'],
              ['210°', 'That is the rest of the circle (360° − 150°). The arc given belongs to the smaller sector.']] }] },
        { fig: { ang: 135, r: 8, unit: 'cm', hideR: true, over: { area: 'area = 24π cm²', r: 'r = ?' } },
          stages: [{ q: 'A sector has a central angle of 135° and an area of 24π cm². What is the radius of the circle?', ans: 2,
            ch: [['64 cm', 'The whole area is 64π, but that is πr², so r² = 64. The radius is the square root: 8.'],
              ['3 cm', 'That multiplied by the fraction 3/8. To get the whole circle from a part, divide by the fraction.'],
              ['8 cm', '135/360 = 3/8. The whole circle is 24π ÷ (3/8) = 64π. So r² = 64 and r = 8 cm.'],
              ['about 4.9 cm', 'That treats 24π as the whole circle (r² = 24). It is only the sector, 3/8 of the circle.']] }] },
        { fig: { ang: 45, r: 7, unit: 'in', hideAng: true },
          stages: [
            { q: 'A pizza is 14 inches across. It is cut into 8 equal slices. Step 1. What is the central angle of one slice?', ans: 3,
              ch: [['8°', '8 is the number of slices. The slices share the full 360°.'], ['90°', '90° would make only 4 slices. With 8 slices, each one is half as wide.'], ['60°', '60° would make 6 slices (360 ÷ 6).'], ['45°', '360° ÷ 8 = 45°.']] },
            { fig: { hideAng: false }, q: 'Step 2. The pizza has radius 7 in. What is the area of one slice (45°)?', ans: 0,
              ch: [['49π/8 in² (about 19.24 in²)', '45/360 = 1/8. The whole pizza has area π × 7² = 49π, and 1/8 of it is 49π/8 ≈ 19.24 in².'],
                ['49π in²', 'That is the whole pizza. One slice is 1/8 of it.'],
                ['196π/8 in² (about 76.97 in²)', 'That used the diameter 14 as the radius. The pizza is 14 in across, so the radius is 7 in.'],
                ['7π/4 in² (about 5.50 in²)', '7π/4 is the crust length (1/8 × 14π), and its unit is in, not in².']] }] },
        { fig: { ang: 126, r: 6, unit: 'cm', hideAng: true },
          stages: [{ q: 'In a pie chart, one slice is 35% of the whole chart. What is the central angle of the slice?', ans: 1,
            ch: [['35°', 'The 35 is a percent, not degrees. The whole chart is 360°, so take 35% of 360.'],
              ['126°', '35% of 360° = 0.35 × 360° = 126°.'],
              ['63°', 'That is 35% of 180°. The full chart is 360°.'],
              ['234°', 'That is 65% of the circle, the rest of the chart (360° − 126°).']] }] },
        { fig: { ang: 90, r: 6, unit: 'cm', over: { r: 'diameter = 12 cm' } },
          stages: [{ q: 'A sector has a central angle of 90° and the circle has a diameter of 12 cm. What is the area of the sector?', ans: 3,
            ch: [['36π cm²', 'That used the diameter 12 as the radius: 1/4 × π × 12² = 36π. The radius is 6.'],
              ['9π cm', 'The number is right but the unit is not. Area is in cm², not cm.'],
              ['3π cm²', '3π is the arc length (1/4 of the circumference 12π), and its unit is cm, not cm².'],
              ['9π cm² (about 28.27 cm²)', 'The radius is half of 12, so r = 6. Area = 1/4 × π × 6² = 9π ≈ 28.27 cm².']] }] }
      ];
      const pz = h('div', { class: 'ctl', style: 'display:none;gap:10px;flex-direction:column' });
      const pStat = h('p', { class: 'hint', style: 'margin:0', 'aria-live': 'polite' });
      const pz2 = quiz();
      const pNext = h('button', { type: 'button', class: 'btn primary', style: 'display:none' }, 'Next problem');
      const pLeave = h('button', { type: 'button', class: 'btn', onclick: () => stopPractice() }, 'Leave practice');
      pz2.nxEl.append(pNext, pLeave);
      pz.append(pStat, pz2.box);
      C.title('Practice');
      const startBtn = C.buttons([{ label: 'Start practice (' + PR.length + ' problems)', primary: true, onClick: () => startPractice() }])[0];
      host.append(pz); const startRow = startBtn.parentNode;
      C.hint('Pictures in practice are not always drawn to scale.');
      const hintEl = host.lastChild; hintEl.style.display = 'none';
      const tally = () => `Problem ${prac.i + 1} of ${PR.length}. Right on the first try: ${prac.right} of ${prac.done} answered.`;
      const figOf = () => { const pb = PR[prac.i], stg = pb.stages[prac.st]; return Object.assign({ hideAng: false, hideR: false, over: {} }, pb.fig, stg.fig || {}); };
      function startPractice() {
        cancel(); prac.snap = { ...st }; prac.on = true; prac.i = 0; prac.right = 0; prac.done = 0;
        startRow.style.display = 'none'; hintEl.style.display = ''; pz.style.display = 'flex'; showStage(); applyVis();
      }
      function stopPractice() {
        if (!prac.on) return;
        prac.on = false; Object.assign(st, prac.snap); pz.style.display = 'none'; startRow.style.display = ''; hintEl.style.display = 'none';
        applyVis(); sync();
      }
      function showStage() {
        const pb = PR[prac.i], stg = pb.stages[prac.st]; cancel();
        const f = figOf(); Object.assign(st, { ang: f.ang, r: f.r, unit: f.unit, hideAng: f.hideAng, hideR: f.hideR, over: { ...f.over }, hideSec: false, prev: null, rest: false, u: 0 });
        if (prac.st === 0) prac.bad = false; pStat.textContent = tally(); pNext.style.display = 'none';
        pz2.ask(stg.q, stg.ch, stg.ans, { onRight: tried => {
          if (tried) prac.bad = true;
          if (prac.st + 1 >= pb.stages.length) { prac.done++; if (!prac.bad) prac.right++; }
          pStat.textContent = tally();
          pNext.style.display = ''; pNext.textContent = (prac.st + 1 < pb.stages.length) ? 'Next step' : (prac.i + 1 >= PR.length ? 'See my results' : 'Next problem');
        } });
        pz2.nxEl.append(pNext, pLeave); sync();
      }
      pNext.addEventListener('click', () => {
        const pb = PR[prac.i];
        if (prac.st + 1 < pb.stages.length) { prac.st++; showStage(); return; }
        if (prac.i + 1 >= PR.length) { finishPractice(); return; }
        prac.i++; prac.st = 0; showStage();
      });
      function finishPractice() {
        pz2.qEl.innerHTML = `You finished. You got ${prac.right} of ${PR.length} right on the first try.`;
        pz2.chEl.innerHTML = ''; pNext.style.display = 'none'; pStat.textContent = '';
        pz2.fbEl.innerHTML = prac.right === PR.length ? 'Every one on the first try. Try the Real situations view next.' : 'Look back at the pattern: find the fraction angle/360, then take that fraction of 2πr for the arc, or of πr² for the area. Add 2r for the perimeter.';
        pLeave.textContent = 'Back to exploring';
        const again = h('button', { type: 'button', class: 'btn', onclick: () => { pLeave.textContent = 'Leave practice'; again.remove(); prac.i = 0; prac.st = 0; prac.right = 0; prac.done = 0; showStage(); } }, 'Practice again');
        pz2.nxEl.prepend(again);
      }

      /* ---------- view logic and sync ---------- */
      function setView(v) {
        st.view = v; st.hideSec = false; st.hideAng = false; st.hideR = false; st.over = {}; st.prev = null; st.note = ''; st.kind = null; st.u = 0;
        if (v === 'story') { if (st.story < 0) selectStory(0, true); else { st.kind = CTX[st.story].ask; } }
        else { st.story = -1; if (st.unit !== 'cm') st.unit = 'cm'; }
        if (v === 'back') { back.i = 0; back.right = 0; backAsk(); }
        if (v === 'frac' && !pred.done) startPred();
        if (v === 'arc' || v === 'area' || v === 'perim') bumpBuild();
        else bq.clear();
      }
      function applyVis() {
        const on = !prac.on, v = st.view;
        show(G.sec, on); show(G.pred, on && v === 'frac'); show(G.build, on && ['arc', 'area', 'perim'].includes(v));
        show(G.dbl, on && ['arc', 'area'].includes(v)); show(G.unroll, on && v === 'arc'); show(G.back, on && v === 'back'); show(G.story, on && v === 'story'); show(G.ro, on);
      }
      function sync() {
        angS.set(st.ang); rS.set(st.r); sel.value = st.view; restT.checked = st.rest;
        if (!prac.on) {
          unB[0].textContent = st.u > .5 ? 'Roll the arc back' : 'Unroll the arc';
          dblB[2].disabled = !st.prev; dblB[0].disabled = dblB[1].disabled = false;
          applyVis();
        }
        P.draw(); upd();
      }

      /* ---------- dragging the ring on the rim ---------- */
      draggable(P, {
        hit: (px, py) => (hnd && !prac.on && Math.hypot(px - hnd.x, py - hnd.y) < 22) ? 'h' : null,
        move: (hd, mx, my) => {
          if (!hnd) return;
          const cxm = hnd.cx - P.w / 2, cym = P.h / 2 - hnd.cy;
          let raw = Math.atan2(my - cym, mx - cxm) * 180 / PI; raw = (raw + 360) % 360;
          const prev = st.ang; let a;
          if (raw < 5 || raw > 355 || Math.abs(raw - prev) > 180) a = prev < 180 ? 5 : 355; else a = clamp(snap(raw, 5), 5, 355);
          if (a === st.ang) return;
          manual(); st.ang = a; sync();
        }
      });

      /* ---------- guided steps ---------- */
      const apply = (patch, immediate) => {
        cancel(); stopPractice();
        const { view, predict, ...nums } = patch;
        st.rest = false; st.prev = null; st.note = ''; st.over = {}; st.hideAng = false; st.hideR = false; st.hideSec = false;
        if (view !== undefined) { st.story = -1; st.unit = 'cm'; setView(view); }
        if (predict) { st.hideSec = false; startPred(); }
        if (immediate) { Object.assign(st, nums); sync(); bumpBuild(); }
        else { if (!predict) cancel = animateTo(st, nums, 900, sync, () => bumpBuild()); else { Object.assign(st, { r: nums.r !== undefined ? nums.r : st.r, u: 0 }); sync(); } }
      };
      setView('frac'); sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
