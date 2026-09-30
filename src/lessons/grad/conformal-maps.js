/* =====================================================================
   VISUALIZATION 3 — Conformal maps (graduate)
   ===================================================================== */
const Cx = {
  add: ([a, b], [c, d]) => [a + c, b + d],
  sub: ([a, b], [c, d]) => [a - c, b - d],
  mul: ([a, b], [c, d]) => [a * c - b * d, a * d + b * c],
  div: ([a, b], [c, d]) => { const q = c * c + d * d; return [(a * c + b * d) / q, (b * c - a * d) / q]; }
};
const fmtC = ([x, y]) => `${fmt(x)} ${y < 0 ? '−' : '+'} ${Math.abs(y).toFixed(2)}i`;
const MAPS = {
  sq:   { label: 'f(z) = z²', f: z => Cx.mul(z, z), df: z => [2 * z[0], 2 * z[1]], span: 4.4 },
  exp:  { label: 'f(z) = eᶻ', f: ([x, y]) => { const e = Math.exp(x); return [e * Math.cos(y), e * Math.sin(y)]; },
          df: ([x, y]) => { const e = Math.exp(x); return [e * Math.cos(y), e * Math.sin(y)]; }, span: 4.8 },
  inv:  { label: 'f(z) = 1/z', f: z => Cx.div([1, 0], z), df: z => Cx.div([-1, 0], Cx.mul(z, z)), span: 3.2 },
  sin:  { label: 'f(z) = sin z', f: ([x, y]) => [Math.sin(x) * Math.cosh(y), Math.cos(x) * Math.sinh(y)],
          df: ([x, y]) => [Math.cos(x) * Math.cosh(y), -Math.sin(x) * Math.sinh(y)], span: 4.2 },
  jouk: { label: 'f(z) = z + 1/z (Joukowski)', f: z => Cx.add(z, Cx.div([1, 0], z)), df: z => Cx.sub([1, 0], Cx.div([1, 0], Cx.mul(z, z))), span: 3.4 },
  mob:  { label: 'f(z) = (z − i)/(z + i) (Cayley)', f: z => Cx.div([z[0], z[1] - 1], [z[0], z[1] + 1]),
          df: z => { const w = [z[0], z[1] + 1]; return Cx.div([0, 2], Cx.mul(w, w)); }, span: 2.6 }
};

register({
  id: 'conformal-maps', level: 'grad',
  title: 'Conformal maps of the complex plane',
  blurb: 'Watch holomorphic functions bend a grid while every tiny right angle stays a right angle.',
  thumb(c, p) {
    const pal = p.pal, f = MAPS.sq.f; p.span = 3.2;
    for (let k = -6; k <= 6; k++) {
      const v = k * .25 + 1e-4, A = [], B = [];
      for (let i = 0; i <= 80; i++) { const s = -1.5 + 3 * i / 80; A.push(f([v, s])); B.push(f([s, v])); }
      p.curve(A, { stroke: alpha(pal.blue, .85), width: 1 }); p.curve(B, { stroke: alpha(pal.yellow, .85), width: 1 });
    }
  },
  explain: String.raw`
    <h2>Bending without shearing</h2>
    <p>The grid lives in the \(z\)-plane. Moving the slider carries each point \(z\) along the straight path \((1-t)\,z + t\,f(z)\), so at the end you see the image of the grid under \(f\). The curves bend a lot, but wherever <span class="swatch" style="background:var(--blue)"></span> blue meets <span class="swatch" style="background:var(--yellow)"></span> yellow they still cross at right angles.</p>
    <h2>Why angles survive</h2>
    <p>Near a point \(z_0\), a holomorphic function looks like its first-order approximation:</p>
    \[ f(z_0 + h) \approx f(z_0) + f'(z_0)\,h. \]
    <p>Multiplying by the complex number \(f'(z_0) = r e^{i\theta}\) rotates by \(\theta\) and scales by \(r\). Rotations and uniform scalings preserve angles, so tiny squares map to tiny squares. The green and red cross at the probe point shows this directly. The argument fails only where \(f'(z_0) = 0\): try \(z^2\) with the probe at the origin and watch the right angle open to a straight line, because angles double there.</p>
    <h2>Things to look for</h2>
    <p>Under \(e^z\), horizontal lines become rays and vertical lines become circles, which is the logarithm read backwards. The Cayley map \(\frac{z-i}{z+i}\) sends the upper half-plane onto the unit disk, the classic bridge between two models of hyperbolic geometry. The Joukowski map sends circles near the unit circle to airfoil-like shapes, which is how early aerodynamics computed lift.</p>`,
  mount({ stage, controls: C }) {
    const st = { map: 'sq', grid: 'rect', t: 0, z0: [.8, .55] };
    let cancel = () => {};
    const R = 2;
    const P = new Plane(stage, { span: 2.5 });
    const W = z => { const w = MAPS[st.map].f(z), t = st.t; return [lerp(z[0], w[0], t), lerp(z[1], w[1], t)]; };

    const families = () => {
      const A = [], B = [], n = 260;
      if (st.grid === 'rect') {
        for (let k = -8; k <= 8; k++) {
          const v = k * .25 + 1e-4;
          const a = [], b = [];
          for (let i = 0; i <= n; i++) { const s = -R + 2 * R * i / n + 1e-4; a.push([v, s]); b.push([s, v]); }
          A.push(a); B.push(b);
        }
      } else {
        for (let k = 1; k <= 8; k++) {
          const r = k * .25, a = [];
          for (let i = 0; i <= n; i++) { const th = 2 * Math.PI * i / n; a.push([r * Math.cos(th), r * Math.sin(th)]); }
          A.push(a);
        }
        for (let k = 0; k < 24; k++) {
          const th = k * Math.PI / 12 + 1e-4, b = [];
          for (let i = 1; i <= n; i++) { const r = R * i / n; b.push([r * Math.cos(th), r * Math.sin(th)]); }
          B.push(b);
        }
      }
      return { A, B };
    };
    let fam = families();

    P.onDraw = (ctx, p) => {
      const pal = p.pal;
      p.span = lerp(2.5, MAPS[st.map].span, ease(st.t));
      p.grid(1, { color: alpha(pal.grid, .8) });
      const jump = Math.min(p.w, p.h) * .35;
      for (const l of fam.A) p.curve(l.map(W), { stroke: alpha(pal.blue, .85), width: 1.4, maxJump: jump });
      for (const l of fam.B) p.curve(l.map(W), { stroke: alpha(pal.yellow, .85), width: 1.4, maxJump: jump });

      const z0 = st.z0, w0 = W(z0), hh = .22, seg = dir => {
        const pts = []; for (let i = -10; i <= 10; i++) { const s = i / 10 * hh; pts.push(W([z0[0] + s * dir[0], z0[1] + s * dir[1]])); } return pts;
      };
      p.path([z0, w0], { stroke: pal.muted, width: 1.2, dash: [3, 5] });
      p.dot(z0[0], z0[1], 8, null, pal.text, 2);
      p.curve(seg([1, 0]), { stroke: pal.green, width: 4 });
      p.curve(seg([0, 1]), { stroke: pal.red, width: 4 });
      p.dot(w0[0], w0[1], 5, pal.text);
      p.label(MAPS[st.map].label, p.bounds().x0, p.bounds().y1, { size: 18, align: 'left', dx: 32, dy: 36 });
    };

    const upd = () => {
      const m = MAPS[st.map], z = st.z0, fz = m.f(z), d = m.df(z), r = Math.hypot(d[0], d[1]);
      const ang = Math.atan2(d[1], d[0]) * 180 / Math.PI;
      ro.innerHTML = `<span class="k">z₀</span> = ${fmtC(z)}<br><span class="k">f(z₀)</span> = ${isFinite(fz[0]) ? fmtC(fz) : '∞'}<br>` +
        (r < 1e-3 ? `f′(z₀) = 0, so angles are not preserved here.` :
          isFinite(r) ? `<span class="k">Near z₀, f scales by</span> ${r.toFixed(2)} <span class="k">and rotates by</span> ${fmt(ang, 0)}°` : 'f is undefined at z₀.');
    };
    const setBtn = () => { play.textContent = st.t > .5 ? 'Undo the map' : 'Apply the map'; };
    const run = to => {
      cancel(); const from = st.t;
      cancel = tween(2200 * Math.abs(to - from), q => { st.t = lerp(from, to, ease(q)); tS.set(st.t); P.draw(); }, setBtn);
    };

    C.select({ label: 'Function', value: st.map, options: Object.entries(MAPS).map(([value, m]) => ({ value, label: m.label })),
      onChange: v => { st.map = v; upd(); st.t = 0; tS.set(0); run(1); } });
    C.select({ label: 'Grid', value: st.grid, options: [{ value: 'rect', label: 'Rectangular' }, { value: 'polar', label: 'Polar' }],
      onChange: v => { st.grid = v; fam = families(); P.requestDraw(); } });
    const tS = C.slider({ label: 'Progress', min: 0, max: 1, step: .001, value: 0, format: v => Math.round(v * 100) + '%',
      onInput: v => { cancel(); st.t = v; setBtn(); P.requestDraw(); } });
    const [play] = C.buttons([{ label: 'Apply the map', primary: true, onClick: () => run(st.t < .5 ? 1 : 0) }]);
    C.hint('Tap or drag on the canvas to move the probe z₀ (hollow circle). The green and red cross is the image of a tiny plus sign at z₀.');
    const ro = C.readout();

    draggable(P, {
      hit: () => 'probe', hover: () => true,
      move: (_, x, y) => { st.z0 = [clamp(x, -R, R), clamp(y, -R, R)]; upd(); P.requestDraw(); }
    });
    upd();
    const startT = setTimeout(() => run(1), 500);
    return () => { clearTimeout(startT); cancel(); P.destroy(); };
  }
});
