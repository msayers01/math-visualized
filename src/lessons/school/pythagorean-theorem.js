/* =====================================================================
   VISUALIZATION 1 — Pythagorean theorem (middle & high school)
   ===================================================================== */
register({
  id: 'pythagorean-theorem', level: 'school',
  title: 'The Pythagorean theorem',
  blurb: 'Slide triangles inside a square and watch c² become a² + b².',
  thumb(c, p) {
    const a = 3, b = 4, s = 7, pal = p.pal; p.cx = 3.5; p.cy = 3.5; p.span = 4.3;
    p.path([[0,0],[s,0],[s,s],[0,s]], { fill: alpha(pal.yellow, .26) });
    for (const t of [[[0,0],[a,0],[0,b]], [[s,0],[s,a],[a,0]], [[s,s],[b,s],[s,a]], [[0,s],[b,s],[0,b]]])
      p.path(t, { fill: alpha(pal.blue, .45), stroke: pal.blue, width: 1.2, close: true });
    p.path([[a,0],[s,a],[b,s],[0,b]], { stroke: pal.yellow, width: 1.6, close: true });
    p.path([[0,0],[s,0],[s,s],[0,s]], { stroke: pal.text, width: 1.2, close: true });
  },
  hook: String.raw`A right triangle has legs 3 and 4. Why must its long side be exactly 5?`,
  steps: [
    { title: 'Meet the triangle',
      text: String.raw`<p>Four copies of a right triangle sit inside a big square of side \(a+b\). The shaded tilted square in the middle has side \(c\), the triangle's long side.</p><p>Notice that the four triangles and the tilted square fill the big square with no gaps.</p>`,
      set: { a: 3, b: 4, t: 0 } },
    { title: 'Slide three triangles',
      text: String.raw`<p>Press <b>Rearrange triangles</b>, or drag <b>Progress</b>. The triangles slide without turning or stretching.</p><p>The shaded region is now two squares, with areas \(a^2\) and \(b^2\). Same pieces, same big square, so the shaded area cannot have changed.</p>`,
      set: { a: 3, b: 4, t: 1 } },
    { title: 'Try your own triangle',
      text: String.raw`<p>Drag the leg sliders. With \(a=5\) and \(b=2\) the two squares are lopsided, yet the readout still says \(a^2+b^2\) equals \(c^2\).</p><p>Find a triangle where \(c\) comes out a whole number.</p>`,
      set: { a: 5, b: 2, t: 1 } },
    { title: 'Make the legs equal',
      text: String.raw`<p>With \(a=b=4\) the two squares are identical, so \(c^2 = 2a^2\) and \(c=a\sqrt2\).</p><p>That is the diagonal of a square: the triangle is half of a square cut corner to corner.</p>`,
      set: { a: 4, b: 4, t: 1 } }
  ],
  formal: String.raw`
    <p><b>Theorem.</b> In a right triangle with legs \(a\), \(b\) and hypotenuse \(c\),
    \[ a^2 + b^2 = c^2. \]</p>
    <h3>Proof by rearrangement</h3>
    <p>Take a square of side \(a+b\) and place four copies of the triangle inside it so that the leftover region is a square of side \(c\). Then
    \[ c^2 \;=\; (a+b)^2 - 4\cdot\tfrac12 ab \;=\; a^2 + 2ab + b^2 - 2ab \;=\; a^2 + b^2. \]
    Sliding three triangles shows the same leftover region as two squares, of areas \(a^2\) and \(b^2\). The area did not change, so the two counts agree.</p>
    <h3>The converse</h3>
    <p>If three positive numbers satisfy \(a^2+b^2=c^2\), then a triangle with those side lengths has a right angle opposite \(c\). This is how builders check a corner with a 3-4-5 rope.</p>
    <h3>Distance in the plane</h3>
    <p>Put the legs along the coordinate axes. The distance between \((x_1,y_1)\) and \((x_2,y_2)\) is the hypotenuse of a right triangle with legs \(|x_2-x_1|\) and \(|y_2-y_1|\), so
    \[ d = \sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}. \]</p>`,
  check: [
    { q: String.raw`A right triangle has legs \(5\) and \(12\). How long is the hypotenuse?`,
      choices: ['7', '13', '17', '169'], answer: 1,
      why: String.raw`\(5^2+12^2 = 25+144 = 169 = 13^2\), so \(c = 13\).`,
      hint: String.raw`Add the squares of the legs first, then take a square root.` },
    { q: 'Four copies of a right triangle (legs a and b, long side c) fit inside a square of side a + b and leave a tilted square of side c in the middle. Sliding three of the triangles shows that the same leftover area is also two squares, with sides a and b. Why does the tilted square have the same area as those two squares together?',
      choices: ['The triangles are all the same shape', 'The same four triangles and the same big square are used, so the leftover area is unchanged',
                'Because c is the longest side', 'Because a and b are equal'], answer: 1,
      why: 'Only the positions of the triangles change. Total area minus the four triangles is the same in both arrangements.',
      hint: 'Think about what stays fixed while the triangles slide.' }
  ],
  links: { next: ['similarity-and-scaling', 'the-unit-circle-and-trig-waves'], related: ['area-of-a-circle'] },
  mount({ stage, controls: C }) {
    const st = { a: 3, b: 4, t: 0 };
    let cancel = () => {};
    const P = new Plane(stage);
    const fit = () => { const s = st.a + st.b; P.cx = s / 2; P.cy = s / 2; P.span = s * .64; };
    fit();

    P.onDraw = (c, p) => {
      const { a, b, t } = st, s = a + b, pal = p.pal;
      const sq = [[0,0],[s,0],[s,s],[0,s]];
      const tris = [
        { pts: [[0,0],[a,0],[0,b]], d: [0, a] },
        { pts: [[s,0],[s,a],[a,0]], d: [0, 0] },
        { pts: [[s,s],[b,s],[s,a]], d: [-b, 0] },
        { pts: [[0,s],[b,s],[0,b]], d: [a, a - s] }
      ];
      const order = { 0: 0, 2: 1, 3: 2 };
      p.path(sq, { fill: alpha(pal.yellow, .26) });
      tris.forEach((tr, i) => {
        const k = order[i], q = k == null ? 0 : ease(clamp((t - k * .25) / .5, 0, 1));
        const pts = tr.pts.map(([x, y]) => [x + tr.d[0] * q, y + tr.d[1] * q]);
        p.path(pts, { fill: alpha(pal.blue, .45), stroke: pal.blue, width: 2, close: true });
      });
      const f0 = 1 - clamp(t * 3, 0, 1), f1 = clamp((t - .66) * 3, 0, 1);
      if (f0 > 0) { c.globalAlpha = f0; p.path([[a,0],[s,a],[b,s],[0,b]], { stroke: pal.yellow, width: 3, close: true }); c.globalAlpha = 1; }
      if (f1 > 0) {
        c.globalAlpha = f1;
        p.path([[0,0],[a,0],[a,a],[0,a]], { stroke: pal.yellow, width: 3, close: true });
        p.path([[a,a],[s,a],[s,s],[a,s]], { stroke: pal.yellow, width: 3, close: true });
        c.globalAlpha = 1;
      }
      p.path(sq, { stroke: pal.text, width: 2, close: true });

      const fs = clamp(p.scale * .6, 16, 40);
      p.label('c²', s / 2, s / 2, { size: fs * 1.25, alpha: f0 });
      p.label('a²', a / 2, a / 2, { size: fs * 1.1, alpha: f1 });
      p.label('b²', a + b / 2, a + b / 2, { size: fs * 1.25, alpha: f1 });
      const off = 20 / p.scale, ls = clamp(p.scale * .38, 15, 22);
      p.label('a', a / 2, -off, { size: ls }); p.label('b', a + b / 2, -off, { size: ls });
      p.label('a', s + off, a / 2, { size: ls }); p.label('b', s + off, a + b / 2, { size: ls });
      const cl = Math.hypot(a, b);
      p.label('c', (s + a) / 2 - a / cl * off * .9, a / 2 + b / cl * off * .9, { size: ls, alpha: f0 });
    };

    const upd = () => {
      const { a, b } = st;
      ro.innerHTML = `<span class="k">a² + b²</span> = ${(a*a).toFixed(2)} + ${(b*b).toFixed(2)} = ${(a*a + b*b).toFixed(2)}<br>
        <span class="k">c</span> = √(a² + b²) = ${Math.hypot(a, b).toFixed(3)}`;
    };
    const setBtn = () => { play.textContent = st.t > .5 ? 'Put them back' : 'Rearrange triangles'; };

    C.title('Triangle');
    const aS = C.slider({ label: 'Leg a', min: 1, max: 6, step: .1, value: st.a, format: v => v.toFixed(1), onInput: v => { cancel(); st.a = v; fit(); P.requestDraw(); upd(); } });
    const bS = C.slider({ label: 'Leg b', min: 1, max: 6, step: .1, value: st.b, format: v => v.toFixed(1), onInput: v => { cancel(); st.b = v; fit(); P.requestDraw(); upd(); } });
    C.title('Rearrangement');
    const tS = C.slider({ label: 'Progress', min: 0, max: 1, step: .001, value: 0, format: v => Math.round(v * 100) + '%',
      onInput: v => { cancel(); st.t = v; setBtn(); P.requestDraw(); } });
    const [play] = C.buttons([{ label: 'Rearrange triangles', primary: true, onClick: () => {
      cancel(); const from = st.t, to = st.t < .5 ? 1 : 0;
      cancel = tween(2400 * Math.abs(to - from), p => { st.t = lerp(from, to, p); tS.set(st.t); P.draw(); }, setBtn);
    } }]);
    const ro = C.readout(); upd();
    /* guided steps: glide to a state patch {a, b, t}, keeping the controls in sync */
    const sync = () => { aS.set(st.a); bS.set(st.b); tS.set(st.t); fit(); P.draw(); upd(); setBtn(); };
    const apply = (patch, immediate) => {
      cancel();
      if (immediate) { Object.assign(st, patch); sync(); } else cancel = animateTo(st, patch, 900, sync);
    };
    return { destroy: () => { cancel(); P.destroy(); }, apply };
  }
});
