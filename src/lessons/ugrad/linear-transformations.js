/* =====================================================================
   VISUALIZATION 2 — Linear transformations (undergraduate)
   ===================================================================== */
register({
  id: 'linear-transformations', level: 'ugrad',
  title: 'Linear transformations and eigenvectors',
  blurb: 'See a 2×2 matrix as a motion of the whole plane, and find the directions it only stretches.',
  thumb(c, p) {
    const pal = p.pal, [a, b, cc, d] = [1, .7, .35, 1.1], ap = (x, y) => [a * x + b * y, cc * x + d * y];
    p.span = 2.4; p.grid(1);
    for (let k = -8; k <= 8; k++) {
      p.path([ap(k, -8), ap(k, 8)], { stroke: alpha(pal.blue, .7), width: 1 });
      p.path([ap(-8, k), ap(8, k)], { stroke: alpha(pal.blue, .7), width: 1 });
    }
    p.path([ap(0,0), ap(1,0), ap(1,1), ap(0,1)], { fill: alpha(pal.yellow, .3), stroke: pal.yellow, width: 1.5, close: true });
    p.arrow(0, 0, a, cc, pal.green, 2.5); p.arrow(0, 0, b, d, pal.red, 2.5);
  },
  explain: String.raw`
    <h2>A matrix is a motion of space</h2>
    <p>Every point of the plane is a combination of the two basis vectors \(\hat\imath = (1,0)\) and \(\hat\jmath = (0,1)\). A linear map only needs to decide where those two land. Their images are the columns of the matrix:</p>
    \[ \begin{bmatrix} a & b \\ c & d \end{bmatrix}\begin{bmatrix} x \\ y \end{bmatrix} = x\begin{bmatrix} a \\ c \end{bmatrix} + y\begin{bmatrix} b \\ d \end{bmatrix}. \]
    <p>That is why the grid lines stay straight, parallel, and evenly spaced, and why the origin never moves. Drag the <span class="swatch" style="background:var(--green)"></span> green and <span class="swatch" style="background:var(--red)"></span> red arrows to set the columns directly.</p>
    <h2>The determinant is an area</h2>
    <p>The shaded square starts with area 1. After the map its area is \(|ad-bc|\), and every other region is scaled by the same factor. When \(\det A < 0\) the plane has been flipped over, and when \(\det A = 0\) it has collapsed onto a line or a point.</p>
    <h2>Eigenvectors keep their direction</h2>
    <p>The <span class="swatch" style="background:var(--violet)"></span> violet lines mark directions that the map only stretches or flips: \(A\mathbf v = \lambda \mathbf v\). The eigenvalues solve \(\lambda^2 - (a+d)\lambda + (ad-bc) = 0\). A rotation by an angle other than \(0^\circ\) or \(180^\circ\) moves every direction, so its eigenvalues are complex and no violet lines appear.</p>`,
  mount({ stage, controls: C }) {
    const st = { M: [1, 1, 0, 1], t: 0, eig: true };
    let cancel = () => {};
    const cur = () => { const [a, b, c, d] = st.M, t = st.t; return [lerp(1, a, t), lerp(0, b, t), lerp(0, c, t), lerp(1, d, t)]; };
    const P = new Plane(stage, { span: 4.2 });

    P.onDraw = (ctx, p) => {
      const pal = p.pal; p.grid(1);
      const [a, b, c, d] = cur(), ap = (x, y) => [a * x + b * y, c * x + d * y], N = 14;
      for (let k = -N; k <= N; k++) {
        if (k === 0) continue;
        p.path([ap(k, -N), ap(k, N)], { stroke: alpha(pal.blue, .7), width: 1.3 });
        p.path([ap(-N, k), ap(N, k)], { stroke: alpha(pal.blue, .7), width: 1.3 });
      }
      p.path([ap(0, -N), ap(0, N)], { stroke: pal.axis, width: 2 });
      p.path([ap(-N, 0), ap(N, 0)], { stroke: pal.axis, width: 2 });
      p.path([ap(0,0), ap(1,0), ap(1,1), ap(0,1)], { fill: alpha(pal.yellow, .3), stroke: pal.yellow, width: 2, close: true });
      if (st.eig) {
        const e = eig2(a, b, c, d);
        if (e.real) for (const { l, v } of e.list) {
          p.path([[-40 * v[0], -40 * v[1]], [40 * v[0], 40 * v[1]]], { stroke: pal.violet, width: 2.5, dash: [8, 6] });
          const r = p.span * .82;
          p.label('λ = ' + fmt(l), v[0] * r, v[1] * r, { color: pal.violet, size: 17, dy: -14 });
        }
      }
      const det = a * d - b * c, [mx, my] = ap(.5, .5);
      if (Math.abs(det) > .08) p.label('det = ' + fmt(det), mx, my, { size: 15, italic: false });
      p.arrow(0, 0, a, c, pal.green); p.arrow(0, 0, b, d, pal.red);
      p.dot(a, c, 7, pal.green); p.dot(b, d, 7, pal.red);
      p.label('î', a, c, { color: pal.green, size: 22, dx: 16, dy: -12 });
      p.label('ĵ', b, d, { color: pal.red, size: 22, dx: 16, dy: -12 });
      p.dot(0, 0, 3.5, pal.axis);
    };

    const upd = () => {
      const [a, b, c, d] = st.M, det = a * d - b * c, e = eig2(a, b, c, d);
      let eg;
      if (!e.real) eg = `${fmt(e.re)} ± ${e.im.toFixed(2)}i (complex, no real eigenvectors)`;
      else eg = [...new Set(e.list.map(x => fmt(x.l)))].join(', ');
      let note = '';
      if (Math.abs(det) < 1e-6) note = '<br>The plane collapses: the determinant is zero.';
      else if (det < 0) note = '<br>Negative determinant: orientation flips.';
      ro.innerHTML = `<span class="k">Matrix</span> [${fmt(a,1)}, ${fmt(b,1)}; ${fmt(c,1)}, ${fmt(d,1)}]<br>
        <span class="k">det</span> = ${fmt(det)}<br><span class="k">Eigenvalues</span> ${eg}${note}`;
    };
    const sync = () => { S.forEach((s, i) => s.set(st.M[i])); upd(); };
    const animateTo = M => {
      cancel(); st.M = M.slice(); st.t = 0; sync();
      cancel = tween(1600, q => { st.t = ease(q); P.draw(); });
    };

    C.title('Matrix entries');
    C.hint('Columns are where î and ĵ land. You can also drag the arrow tips.');
    const S = ['a (î, x)', 'c (î, y)', 'b (ĵ, x)', 'd (ĵ, y)'].map((label, j) => {
      const i = [0, 2, 1, 3][j];
      return { i, s: C.slider({ label, min: -3, max: 3, step: .1, value: st.M[i], format: v => fmt(v, 1),
        onInput: v => { cancel(); st.M[i] = v; st.t = 1; upd(); P.requestDraw(); } }) };
    }).sort((x, y) => x.i - y.i).map(x => x.s);
    C.title('Examples');
    C.buttons([
      { label: 'Shear', onClick: () => animateTo([1, 1, 0, 1]) },
      { label: 'Rotate 90°', onClick: () => animateTo([0, -1, 1, 0]) },
      { label: 'Stretch', onClick: () => animateTo([2, 1, 1, 2]) },
      { label: 'Reflect', onClick: () => animateTo([-1, 0, 0, 1]) },
      { label: 'Collapse', onClick: () => animateTo([1, 2, .5, 1]) }
    ]);
    C.buttons([{ label: 'Replay from identity', primary: true, onClick: () => animateTo(st.M) }]);
    C.toggle({ label: 'Show eigenvectors', value: true, onChange: v => { st.eig = v; P.requestDraw(); } });
    const ro = C.readout();

    draggable(P, {
      hit: (px, py) => {
        const [a, b, c, d] = cur();
        const di = Math.hypot(P.X(a) - px, P.Y(c) - py), dj = Math.hypot(P.X(b) - px, P.Y(d) - py);
        if (Math.min(di, dj) > 26) return null; return di <= dj ? 'i' : 'j';
      },
      move: (hd, x, y) => {
        cancel(); st.M = cur(); st.t = 1;
        const r = v => Math.round(clamp(v, -3, 3) * 10) / 10;
        if (hd === 'i') { st.M[0] = r(x); st.M[2] = r(y); } else { st.M[1] = r(x); st.M[3] = r(y); }
        sync(); P.requestDraw();
      }
    });
    sync();
    const startT = setTimeout(() => animateTo(st.M), 500);
    return () => { clearTimeout(startT); cancel(); P.destroy(); };
  }
});
