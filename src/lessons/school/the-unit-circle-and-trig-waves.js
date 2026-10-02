/* =====================================================================
   SCHOOL — The unit circle and trig waves
   ===================================================================== */
/* angle as a multiple of pi when it is a simple one, e.g. "π/3", "2π/3"; otherwise null */
function piFrac(th) {
  const x = th / Math.PI;
  for (const q of [1, 2, 3, 4, 6, 8, 12]) {
    const p = Math.round(x * q);
    if (Math.abs(x * q - p) < .002) return p === 0 ? '0' : (p === 1 ? 'π' : p + 'π') + (q > 1 ? '/' + q : '');
  }
  return null;
}

register({
  id: 'the-unit-circle-and-trig-waves', level: 'school',
  title: 'The unit circle and trig waves',
  blurb: 'Spin a point around a circle and watch its height draw the sine wave.',
  thumb(c, p) {
    const pal = p.pal, th = .87, cs = Math.cos(th), sn = Math.sin(th); p.cx = 0; p.cy = 0; p.span = 1.55;
    p.grid(.5);
    const pts = []; for (let i = 0; i <= 90; i++) pts.push([Math.cos(i / 90 * TAU), Math.sin(i / 90 * TAU)]);
    p.path(pts, { stroke: pal.blue, width: 2.2 });
    p.path([[0, 0], [cs, 0]], { stroke: pal.green, width: 2.6 });
    p.path([[cs, 0], [cs, sn]], { stroke: pal.red, width: 2.6 });
    p.path([[0, 0], [cs, sn]], { stroke: pal.text, width: 1.6 });
    p.dot(cs, sn, 4.5, pal.yellow, pal.stage, 1.5);
  },
  hook: String.raw`A point circles at a steady pace. Why does its height rise and fall in such a smooth, repeating wave?`,
  steps: [
    { title: 'A point on a circle',
      text: String.raw`<p>The circle has radius \(1\). The angle \(\theta\) is measured counterclockwise from the positive x-axis.</p><p>The <b>yellow arc</b> is the distance travelled around the circle. That length <em>is</em> \(\theta\) in radians.</p>`,
      set: { th: .9, showCos: false } },
    { title: 'Two legs: cosine and sine',
      text: String.raw`<p>Drop a vertical line from the point. The <b>green</b> leg is how far right it is, \(\cos\theta\). The <b>red</b> leg is how high it is, \(\sin\theta\).</p><p>The radius is \(1\), so Pythagoras gives \(\cos^2\theta+\sin^2\theta=1\).</p>`,
      set: { th: Math.PI / 3, showCos: false } },
    { title: 'Watch the wave',
      text: String.raw`<p>The lower graph plots the red leg against the angle. Press <b>Play</b>, or drag the point around once.</p><p>The height climbs to \(1\), falls to \(-1\), and repeats every \(2\pi\). That is the sine wave.</p>`,
      set: { th: TAU, showCos: false } },
    { title: 'Cosine is the same wave, shifted',
      text: String.raw`<p>Cosine is the green leg, the point's horizontal position. Plotted the same way it makes the green wave.</p><p>It is the sine wave slid left by a quarter turn, \(\pi/2\): \(\cos\theta=\sin(\theta+\pi/2)\).</p>`,
      set: { th: Math.PI / 2, showCos: true } }
  ],
  formal: String.raw`
    <p>On the <em>unit circle</em> \(x^2+y^2=1\), the point at angle \(\theta\) from the positive x-axis has coordinates
    \[ (\cos\theta,\ \sin\theta). \]
    This defines sine and cosine for every angle, including negative ones and ones past a full turn.</p>
    <h3>Radians</h3>
    <p>One radian is the angle whose arc on the unit circle has length \(1\). A full turn has length \(2\pi\), so
    \[ 360^\circ = 2\pi \text{ rad}, \qquad 180^\circ = \pi\text{ rad}. \]</p>
    <h3>The Pythagorean identity</h3>
    <p>The point is on the circle, so
    \[ \cos^2\theta + \sin^2\theta = 1. \]
    For an acute angle this is the Pythagorean theorem for a right triangle with hypotenuse \(1\), and \(\sin\theta,\cos\theta\) are the familiar ratios opposite\(/\)hypotenuse and adjacent\(/\)hypotenuse.</p>
    <h3>Waves</h3>
    <p>Going a full turn returns to the same point, so
    \[ \sin(\theta+2\pi)=\sin\theta,\qquad \cos(\theta+2\pi)=\cos\theta. \]
    Both graphs repeat every \(2\pi\) and stay between \(-1\) and \(1\). Shifting by a quarter turn turns one into the other:
    \(\cos\theta = \sin\!\left(\theta+\tfrac{\pi}{2}\right)\).</p>
    <h3>Useful angles</h3>
    <p>\(\theta=0\): \((1,0)\). \(\theta=\pi/2\): \((0,1)\). \(\theta=\pi\): \((-1,0)\). \(\theta=3\pi/2\): \((0,-1)\). At \(\theta=\pi/4\), both coordinates equal \(\tfrac{\sqrt2}{2}\).</p>`,
  check: [
    { q: String.raw`What are the coordinates of the point on the unit circle at \(\theta = 90^\circ\)?`,
      choices: ['(1, 0)', '(0, 1)', '(−1, 0)', '(0, −1)'], answer: 1,
      why: String.raw`A quarter turn counterclockwise from \((1,0)\) lands at the top of the circle: \((\cos 90^\circ,\sin 90^\circ)=(0,1)\).`,
      hint: String.raw`Start at \((1,0)\) and turn a quarter of the way around counterclockwise.` },
    { q: String.raw`\(\theta\) is in the first quadrant and \(\cos\theta=0.6\). What is \(\sin\theta\)?`,
      choices: ['0.4', '0.6', '0.8', '1.0'], answer: 2,
      why: String.raw`\(\sin^2\theta = 1-0.6^2 = 0.64\), and sine is positive in the first quadrant, so \(\sin\theta=0.8\).`,
      hint: String.raw`Use \(\cos^2\theta+\sin^2\theta=1\).` }
  ],
  links: { prereq: ['pythagorean-theorem', 'radians-the-circles-own-angle-unit'], next: ['fourier-series-as-epicycles'], related: ['linear-transformations', 'similarity-and-scaling'] },

  mount({ stage, controls: C }) {
    const st = { th: .9, showCos: false };
    let cancel = () => {}, raf = null, last = 0, snapOn = false;
    stage.classList.add('split');
    const top = h('div', { class: 'pane', style: 'flex: 11 1 0' }), bot = h('div', { class: 'pane', style: 'flex: 9 1 0' });
    stage.append(top, bot);
    const P1 = new Plane(top, { span: 1.5 }), P2 = new Plane(bot, { cx: Math.PI, span: 1 });

    P1.onDraw = (c, p) => {
      const pal = p.pal, { th } = st, cs = Math.cos(th), sn = Math.sin(th), off = 16 / p.scale;
      p.grid(.5);
      const ring = []; for (let i = 0; i <= 120; i++) ring.push([Math.cos(i / 120 * TAU), Math.sin(i / 120 * TAU)]);
      p.path(ring, { stroke: pal.blue, width: 3 });
      for (let k = 0; k < 12; k++) p.dot(Math.cos(k * Math.PI / 6), Math.sin(k * Math.PI / 6), 2.5, pal['grid-strong']);
      c.beginPath(); c.arc(p.X(0), p.Y(0), p.scale, 0, -th, true);
      c.strokeStyle = pal.yellow; c.lineWidth = 6; c.lineCap = 'round'; c.stroke();
      p.path([[0, 0], [cs, 0]], { stroke: pal.green, width: 4 });
      p.path([[cs, 0], [cs, sn]], { stroke: pal.red, width: 4 });
      p.path([[0, 0], [cs, sn]], { stroke: pal.text, width: 2.5 });
      const fs = clamp(p.scale * .14, 14, 20);
      p.label('θ', .3 * Math.cos(th / 2), .3 * Math.sin(th / 2), { size: fs + 3, color: pal.yellow });
      if (Math.abs(cs) > .12) p.label('cos θ', cs / 2, 0, { size: fs, italic: false, color: pal.green, dy: sn >= 0 ? 17 : -17 });
      if (Math.abs(sn) > .12) p.label('sin θ', cs, sn / 2, { size: fs, italic: false, color: pal.red, align: cs >= 0 ? 'left' : 'right', dx: cs >= 0 ? 12 : -12 });
      p.dot(cs, sn, 9, pal.stage, pal.brass, 3.5);
    };

    P2.onDraw = (c, p) => {
      const pal = p.pal, { th } = st, sc = Math.min(p.w / (TAU + 1.8), p.h / 3.1);
      p.span = Math.min(p.w, p.h) / (2 * sc); p.cx = Math.PI; p.cy = 0;
      const fs = clamp(sc * .16, 13, 17), dash = [5, 6];
      for (const y of [1, -1]) p.path([[-.25, y], [TAU + .25, y]], { stroke: pal.grid, width: 1.5, dash });
      for (let k = 1; k <= 4; k++) p.path([[k * Math.PI / 2, -1.15], [k * Math.PI / 2, 1.15]], { stroke: pal.grid, width: 1.5 });
      p.path([[-.25, 0], [TAU + .25, 0]], { stroke: pal['grid-strong'], width: 2 });
      p.path([[0, -1.15], [0, 1.15]], { stroke: pal['grid-strong'], width: 2 });
      ['0', 'π/2', 'π', '3π/2', '2π'].forEach((t, i) => p.label(t, i * Math.PI / 2, 0, { size: fs + 2, color: pal.muted, dy: 16 }));
      p.label('1', -.3, 1, { size: fs, italic: false, color: pal.muted, align: 'right' }); p.label('−1', -.3, -1, { size: fs, italic: false, color: pal.muted, align: 'right' });
      const wave = (fn, col) => {
        const all = [], got = [];
        for (let i = 0; i <= 200; i++) { const x = TAU * i / 200; all.push([x, fn(x)]); if (x <= th) got.push([x, fn(x)]); }
        got.push([th, fn(th)]);
        p.path(all, { stroke: alpha(col, .3), width: 2 });
        p.path(got, { stroke: col, width: 4 });
        p.path([[th, 0], [th, fn(th)]], { stroke: col, width: 2, dash });
        p.dot(th, fn(th), 7, col, pal.stage, 2);
      };
      wave(Math.sin, pal.red);
      if (st.showCos) wave(Math.cos, pal.green);
      p.label('sin θ', .15, 1.3, { size: fs + 2, italic: false, color: pal.red, align: 'left' });
      if (st.showCos) p.label('cos θ', 1.35, 1.3, { size: fs + 2, italic: false, color: pal.green, align: 'left' });
      p.label('θ', TAU + .4, 0, { size: fs + 3, color: pal.muted });
    };

    const upd = () => {
      const { th } = st, deg = th * 180 / Math.PI, pf = piFrac(th), cs = Math.cos(th), sn = Math.sin(th), z = v => Math.abs(v) < 5e-4 ? 0 : v;
      ro.innerHTML = `<span class="k">θ</span> ${deg.toFixed(0)}° = ${pf ? pf + ' rad' : th.toFixed(3) + ' rad'}<br>
        <span class="k">cos θ</span> ${fmt(z(cs), 3)} &nbsp; <span class="k">sin θ</span> ${fmt(z(sn), 3)}<br>
        <span class="k">cos² + sin²</span> = ${(cs * cs + sn * sn).toFixed(3)}`;
    };
    const sync = () => { thS.set(st.th * 180 / Math.PI); P1.draw(); P2.draw(); upd(); };
    const setTh = v => { st.th = clamp(snapOn ? snap(v, Math.PI / 12) : v, 0, TAU); };
    const stopPlay = () => { if (raf) { cancelAnimationFrame(raf); raf = null; } last = 0; playBtn.textContent = 'Play'; };

    C.title('Angle');
    const thS = C.slider({ label: 'θ in degrees', min: 0, max: 360, step: 1, value: st.th * 180 / Math.PI, format: v => Math.round(v) + '°',
      onInput: v => { cancel(); stopPlay(); setTh(v * Math.PI / 180); P1.requestDraw(); P2.requestDraw(); upd(); } });
    const [playBtn] = C.buttons([{ label: 'Play', primary: true, onClick: () => {
      cancel();
      if (raf) { stopPlay(); return; }
      if (reduceMotion) { st.th = (st.th + Math.PI / 6) % TAU; sync(); return; }  /* no continuous motion: step 30° per click */
      playBtn.textContent = 'Pause';
      const loop = t => {
        if (!last) last = t;
        st.th = (st.th + (t - last) / 1000 * .9) % TAU; last = t; sync(); raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    } }]);
    C.title('Display');
    const cosT = C.toggle({ label: 'Show cosine wave', value: st.showCos, onChange: v => { st.showCos = v; P2.draw(); } });
    C.toggle({ label: 'Snap to 15°', value: false, onChange: v => { snapOn = v; } });
    const ro = C.readout(); upd();
    C.hint('Drag the point around the circle, or drag across the wave.');

    draggable(P1, {
      hit: () => 'p',
      move: (_, x, y) => { cancel(); stopPlay(); setTh(((Math.atan2(y, x) % TAU) + TAU) % TAU); sync(); }
    });
    draggable(P2, {
      hit: () => 'w',
      move: (_, x) => { cancel(); stopPlay(); setTh(x); sync(); }
    });

    const apply = (patch, immediate) => {
      cancel(); stopPlay();
      const { showCos, ...rest } = patch;
      if (showCos !== undefined) { st.showCos = showCos; cosT.checked = showCos; }
      if (immediate || rest.th === undefined) { Object.assign(st, rest); sync(); return; }
      cancel = animateTo(st, rest, 400 + 260 * Math.abs(rest.th - st.th), sync);
    };
    return { destroy: () => { cancel(); stopPlay(); P1.destroy(); P2.destroy(); }, apply };
  }
});
