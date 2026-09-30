/* =====================================================================
   VISUALIZATION 1 — Pythagorean theorem (middle & high school)
   ===================================================================== */
register({
  id: 'pythagorean-theorem', level: 'school',
  title: 'The Pythagorean theorem',
  blurb: 'Slide four triangles inside a square and watch c² become a² + b².',
  thumb(c, p) {
    const a = 3, b = 4, s = 7, pal = p.pal; p.cx = 3.5; p.cy = 3.5; p.span = 4.3;
    p.path([[0,0],[s,0],[s,s],[0,s]], { fill: alpha(pal.yellow, .26) });
    for (const t of [[[0,0],[a,0],[0,b]], [[s,0],[s,a],[a,0]], [[s,s],[b,s],[s,a]], [[0,s],[b,s],[0,b]]])
      p.path(t, { fill: alpha(pal.blue, .45), stroke: pal.blue, width: 1.2, close: true });
    p.path([[a,0],[s,a],[b,s],[0,b]], { stroke: pal.yellow, width: 1.6, close: true });
    p.path([[0,0],[s,0],[s,s],[0,s]], { stroke: pal.text, width: 1.2, close: true });
  },
  explain: String.raw`
    <h2>What you are looking at</h2>
    <p>Start with a big square whose side is \(a+b\). Inside it sit four copies of the same right triangle, with legs \(a\) and \(b\) and hypotenuse \(c\). The shaded region is whatever the triangles leave uncovered.</p>
    <p>In the first arrangement the uncovered region is a tilted square with side \(c\), so its area is \(c^2\). Slide three of the triangles and the uncovered region becomes two squares, with areas \(a^2\) and \(b^2\).</p>
    <p>Nothing changed size. The big square is the same and so are the four triangles, so the uncovered area must be the same in both pictures:</p>
    \[ c^2 \;=\; (a+b)^2 - 4\cdot\tfrac12 ab \;=\; a^2 + b^2. \]
    <h2>Try this</h2>
    <p>Make \(b\) much smaller than \(a\). The tilted square barely tilts, and \(c\) is only a little longer than \(a\). Now set \(a=b\): the two squares in the second picture are identical, and \(c=a\sqrt2\), the diagonal of a square.</p>`,
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
    C.slider({ label: 'Leg a', min: 1, max: 6, step: .1, value: st.a, format: v => v.toFixed(1), onInput: v => { st.a = v; fit(); P.requestDraw(); upd(); } });
    C.slider({ label: 'Leg b', min: 1, max: 6, step: .1, value: st.b, format: v => v.toFixed(1), onInput: v => { st.b = v; fit(); P.requestDraw(); upd(); } });
    C.title('Rearrangement');
    const tS = C.slider({ label: 'Progress', min: 0, max: 1, step: .001, value: 0, format: v => Math.round(v * 100) + '%',
      onInput: v => { cancel(); st.t = v; setBtn(); P.requestDraw(); } });
    const [play] = C.buttons([{ label: 'Rearrange triangles', primary: true, onClick: () => {
      cancel(); const from = st.t, to = st.t < .5 ? 1 : 0;
      cancel = tween(2400 * Math.abs(to - from), p => { st.t = lerp(from, to, p); tS.set(st.t); P.draw(); }, setBtn);
    } }]);
    const ro = C.readout(); upd();
    return () => { cancel(); P.destroy(); };
  }
});
