/* =====================================================================
   SCHOOL — Volume of prisms, pyramids and cones
   ===================================================================== */
{
  const PI = Math.PI, PITCH = .52, CP = Math.cos(PITCH), SP = Math.sin(PITCH);
  const wrapDeg = a => ((a + 180) % 360 + 360) % 360 - 180;
  const rgbOf = hex => { const m = hex.replace('#', ''); return [0, 2, 4].map(i => parseInt(m.slice(i, i + 2), 16)); };
  const tone = (hex, b) => {
    const c = rgbOf(hex), t = b < 1 ? 0 : 255, k = b < 1 ? 1 - b : b - 1;
    return 'rgb(' + c.map(v => Math.round(v + (t - v) * k)).join(',') + ')';
  };
  /* a number times pi, and a third of a number times pi */
  const pit = c => (Number.isInteger(c) ? (c === 1 ? '' : c) : num(c)) + 'π';
  const pit3 = n => n % 3 === 0 ? pit(n / 3) : (n === 1 ? '' : n) + 'π/3';
  const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
  const circ = (cx, cy, r, n = 44) => { const o = []; for (let i = 0; i < n; i++) { const t = TAU * i / n; o.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); } return o; };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const lp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const unit = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const avg3 = pts => [0, 1, 2].map(i => pts.reduce((s, q) => s + q[i], 0) / pts.length);

  /* a prism over a polygon (counter-clockwise seen from above) between heights z0 and z1 */
  const prism = (poly, z0, z1, o) => {
    const fs = [], n = poly.length;
    for (let i = 0; i < n; i++) {
      const p = poly[i], q = poly[(i + 1) % n], dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy);
      fs.push({ p: [[p[0], p[1], z0], [q[0], q[1], z0], [q[0], q[1], z1], [p[0], p[1], z1]], n: [dy / len, -dx / len, 0], col: o.col,
        cu: o.grid ? Math.round(len) : 0, cv: o.grid ? Math.round(z1 - z0) : 0, hz: o.hz });
    }
    if (o.top !== false) for (const t of (o.tops || [poly]))
      fs.push({ p: t.map(q => [q[0], q[1], z1]), n: [0, 0, 1], col: o.topCol || o.col, cu: o.grid ? Math.round(t[1][0] - t[0][0]) : 0, cv: o.grid ? Math.round(t[3][1] - t[0][1]) : 0, rim: true });
    return fs;
  };
  /* a pyramid or cone: base polygon (3D points) and an apex. Normals are turned to point away from the inside. */
  const pyr = (base, apex, col) => {
    const bc = avg3(base), cen = [0, 1, 2].map(i => bc[i] * .75 + apex[i] * .25), fs = [], n = base.length;
    const orient = (nv, pts) => { const d = sub(avg3(pts), cen); return (nv[0] * d[0] + nv[1] * d[1] + nv[2] * d[2]) < 0 ? nv.map(v => -v) : nv; };
    for (let i = 0; i < n; i++) {
      const p = base[i], q = base[(i + 1) % n], pts = [p, q, apex];
      fs.push({ p: pts, n: orient(unit(cross(sub(q, p), sub(apex, p))), pts), col });
    }
    fs.push({ p: base, n: orient([0, 0, 1], base), col, rim: true });
    return fs;
  };

  register({
    id: 'volume-of-prisms-pyramids-and-cones', level: 'school',
    title: 'Volume of prisms, pyramids and cones',
    blurb: 'Stack identical layers to fill a prism, then pour three pyramids into one and see why a cone holds a third of a cylinder.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 3.3;
      const front = [[-2.2, -1.7], [.4, -1.7], [.4, .6], [-2.2, .6]], top = [[-2.2, .6], [.4, .6], [1.7, 1.6], [-.9, 1.6]], side = [[.4, -1.7], [1.7, -.7], [1.7, 1.6], [.4, .6]];
      p.path(front, { fill: alpha(pal.blue, .5), stroke: pal.blue, width: 2, close: true });
      p.path(side, { fill: alpha(pal.blue, .3), stroke: pal.blue, width: 2, close: true });
      p.path(top, { fill: alpha(pal.yellow, .45), stroke: pal.yellow, width: 2, close: true });
      for (const t of [-.93, -.17]) {
        p.path([[-2.2, t], [.4, t]], { stroke: pal.stage, width: 2 });
        p.path([[.4, t], [1.7, t + 1]], { stroke: pal.stage, width: 2 });
      }
    },
    hook: String.raw`Three pyramids pour into one box with exactly the same base and height, no more and no less. Why does a pyramid hold just one third?`,
    steps: [
      { title: 'Stack the layers',
        text: String.raw`<p>A box is a stack of flat layers. This box is 4 cm long and 3 cm wide, so one layer holds 4 × 3 = <b>12</b> unit cubes.</p><p>Raise <b>Layers stacked</b> and watch the total grow. With 3 layers it holds 12 × 3 = 36 cubes. Volume counts cubes, so its unit is cm³.</p>`,
        set: { shape: 'box', L: 4, W: 3, H: 3, k: 1 } },
      { title: 'Any base works',
        text: String.raw`<p>This <b>L-shaped prism</b> is not a box, but it is still identical layers. One layer covers 12 − 2 = <b>10</b> squares, so 2 layers hold 10 × 2 = <b>20 cm³</b>.</p><p>Try the triangle, the cylinder and the coin stack in the Shape list. Slide the coins: the volume cannot change, because every coin is still there.</p>`,
        set: { shape: 'ell', L: 4, W: 3, H: 2, k: 2 } },
      { title: 'A pyramid holds one third',
        text: String.raw`<p>This prism and pyramid have the <b>same</b> 3 cm by 3 cm base and the <b>same</b> 3 cm height. The prism holds 3 × 3 × 3 = 27 cm³.</p><p><b>Guess first.</b> How many pyramid loads will fill the prism? Choose a guess, then pour with the slider and count the loads.</p>`,
        set: { shape: 'pyr', L: 3, H: 3, pour: 0, guess: null } },
      { title: 'Double it',
        text: String.raw`<p>A cylinder with radius 1 cm and height 2 cm holds π × 1² × 2 = 2π cm³. Doubling the <b>radius</b> gives 8π cm³: <b>4 times</b> as much, because the base area uses r². Doubling only the height gives 2 times as much.</p><p>Enrichment: pick <b>Sphere</b> in the Shape list and pour.</p>`,
        set: { shape: 'scale', R: 1, H: 2, dbl: 'r' } }
    ],
    formal: String.raw`
      <p><b>Volume</b> is how much space a solid takes up. We measure it by counting unit cubes. A cube 1 cm on each side has a volume of \(1\ \text{cm}^3\). Area uses squares and is in \(\text{cm}^2\). Volume uses cubes and is in \(\text{cm}^3\).</p>
      <h3>Prisms and cylinders: base times height</h3>
      <p>A <em>prism</em> has two identical faces called <em>bases</em>, joined by straight sides. A cylinder is the same idea with a circle as the base. Slice either one into layers 1 unit thick. Every layer is a copy of the base, so one layer holds \(B\) unit cubes, where \(B\) is the base area. With \(h\) layers,
      \[ V = B \times h. \]
      The base can be a rectangle, a triangle, an L-shape or a circle. Only \(B\) changes. For a box, \(B=\ell w\), so \(V=\ell w h\). For a cylinder, \(B=\pi r^2\), so \(V=\pi r^2 h\).</p>
      <h3>Slanted stacks (Cavalieri's idea)</h3>
      <p>Push a stack of coins sideways. The coins slide, but none is added or removed, and the height is still the same. So the volume is the same. In general, two solids with the same height, and with equal cross-sections at every height, have equal volumes. A slanted prism therefore has \(V=Bh\), where \(h\) is the straight-up height, not the length of the slanted edge.</p>
      <h3>Pyramids and cones: one third</h3>
      <p>Cut a cube into three identical pyramids that all meet at one corner of the cube. Each has a square face of the cube as its base and a height equal to the cube's side. So each pyramid is \(\tfrac13\) of the cube. Stretching the cube into a box with any length, width and height keeps that fraction. For pyramids with other bases, equal base areas and equal heights give equal volumes (Cavalieri's idea again). A cone is like a pyramid with very many sides. So
      \[ V_{\text{pyramid}}=\tfrac13 Bh, \qquad V_{\text{cone}}=\tfrac13 \pi r^2 h. \]
      This is a short argument, not a full proof, but the pour shows it with real water.</p>
      <h3>Doubling a length</h3>
      <p>The base area has two lengths in it and the height has one. Doubling the height gives \(2\times\) the volume. Doubling the radius gives \(2^2=4\times\). Doubling every length gives \(2^3=8\times\). Lengths scale by \(k\), areas by \(k^2\), volumes by \(k^3\), the same pattern as in the lesson on similarity and scaling.</p>
      <h3>The sphere (enrichment)</h3>
      <p>A sphere of radius \(r\) has volume \(\tfrac43\pi r^3\). This is a famous result, found by Archimedes. This lesson does not prove it. You can compare: a cylinder with radius \(r\) and height \(2r\) has volume \(2\pi r^3\), and the sphere is \(\tfrac{4/3}{2}=\tfrac23\) of it. Pour a sphere into that cylinder to see the water reach two thirds of the way up.</p>
      <h3>Worked example</h3>
      <p>A cone has radius 3 cm and height 4 cm. The base area is \(\pi\cdot3^2=9\pi\). Then \(V=\tfrac13\cdot9\pi\cdot4=12\pi\approx37.7\ \text{cm}^3\). A cylinder with the same base and height holds \(36\pi\), which is exactly three cones.</p>`,
    check: [
      { q: 'A prism has a triangular base. Which statement is true for every prism, whatever the shape of its base?',
        choices: ['Volume = perimeter of the base × height', 'Volume = area of the base × height', 'Volume = length × width × height', 'Volume = half the area of the base × height'], answer: 1,
        why: String.raw`Slice any prism into layers. Each layer is a copy of the base and holds as many unit cubes as the base area. So \(V=B\times h\). "Length × width × height" is only the special case where the base is a rectangle. The perimeter measures the outline, not the space inside.`,
        hint: 'Think of stacking identical layers. How many cubes fit in one layer?' },
      { q: 'A cylindrical grain silo has a diameter of 6 m and a height of 10 m. Grain fills it up to 4/5 of its height. Use π ≈ 3.14. About how many cubic meters of grain are in the silo?',
        choices: ['283 m³', '904 m³', '226 m³', '75 m³'], answer: 2,
        why: String.raw`The radius is half the diameter: \(3\) m. Full silo: \(3.14\times3^2\times10=282.6\ \text{m}^3\). Grain fills \(\tfrac45\) of it: \(282.6\times0.8\approx226\ \text{m}^3\). The answer 283 forgets the \(\tfrac45\). The answer 904 squares the diameter instead of the radius.`,
        hint: 'Find the radius first. Then find the full volume, then take 4/5 of it.' },
      { q: 'Sam finds the volume of a cone with radius 3 cm and height 4 cm. Sam writes: "V = π × 3² × 4 = 36π cm³." What is wrong with it?',
        choices: ['Nothing is wrong. 36π cm³ is the volume of the cone', 'The radius should not be squared. It should be 3 × 4', 'The height should be halved, because a cone has a point', 'Sam found the volume of a cylinder. A cone holds one third of that, 12π cm³'], answer: 3,
        why: String.raw`\(\pi r^2 h\) is the volume of the cylinder with the same base and height. A cone holds only one third of it, so \(V=\tfrac13\times36\pi=12\pi\approx37.7\ \text{cm}^3\). Three cones fill that cylinder.`,
        hint: 'A cone and a cylinder with the same base and height: how many cones does it take to fill the cylinder?' }
    ],
    links: { related: ['area-of-a-circle', 'similarity-and-scaling', 'pythagorean-theorem', 'exponents-and-scientific-notation', 'area-by-decomposition', 'nets-and-surface-area', 'similar-triangles-aa-sas-sss', 'special-right-triangles-and-trigonometry'] },

    mount({ stage, controls: C }) {
      const st = { shape: 'box', L: 4, W: 3, H: 3, R: 2, k: 1, slant: 0, pour: 0, sp: 0, guess: null, dbl: 'r', rot: 30, unit: 'cm' };
      const DEF = {
        box: { L: 4, W: 3, H: 3, k: 3 }, tri: { L: 4, W: 3, H: 3, k: 3 }, ell: { L: 4, W: 3, H: 2, k: 2 }, cyl: { R: 2, H: 3, k: 3 },
        coins: { R: 2, slant: 0 }, pyr: { L: 3, H: 3, pour: 0, guess: null }, cone: { R: 2, H: 3, pour: 0, guess: null },
        scale: { R: 1, H: 2, dbl: 'r' }, sphere: { R: 2, sp: 0 }
      };
      const SHAPES = [['box', 'Box (rectangular prism)'], ['tri', 'Triangular prism'], ['ell', 'L-shaped prism'], ['cyl', 'Cylinder'], ['coins', 'Coin stack (slanted)'],
        ['pyr', 'Pyramid and prism (pour)'], ['cone', 'Cone and cylinder (pour)'], ['scale', 'Double a length'], ['sphere', 'Sphere (enrichment)']];
      const DBL = { none: [1, 1], h: [1, 2], r: [2, 1], hr: [2, 2], rh2: [2, .5] };
      const NCOIN = 8, COINT = .5;
      let cancel = () => {};
      const P = new Plane(stage, { span: 5 });

      /* ---------- model helpers ---------- */
      const ellN = () => [Math.floor(st.L / 2), Math.floor(st.W / 2)];
      const baseArea = () => st.shape === 'tri' ? st.L * st.W / 2 : st.shape === 'ell' ? st.L * st.W - ellN()[0] * ellN()[1] : st.shape === 'box' ? st.L * st.W : PI * st.R * st.R;
      const kk = () => Math.round(clamp(st.k, 0, st.H));
      const pourState = () => {
        const p = clamp(st.pour, 0, 3), n = Math.min(3, Math.floor(p + 1e-9)), f = p - n;
        return { p, n, rem: n >= 3 ? 0 : 1 - f };
      };
      const sphereT = (frac, R) => { /* height of water in a sphere that still holds `frac` of its volume */
        let lo = 0, hi = 2 * R;
        for (let i = 0; i < 40; i++) { const t = (lo + hi) / 2; if (t * t * (3 * R - t) / (4 * R * R * R) < frac) lo = t; else hi = t; }
        return (lo + hi) / 2;
      };
      const extent = () => {
        const { shape: s, L, W, H, R } = st, [kr, kh] = DBL[st.dbl] || [1, 1];
        if (s === 'box' || s === 'tri' || s === 'ell') return { rho: Math.hypot(L, W) / 2 + .5, zmax: H };
        if (s === 'cyl') return { rho: R + .4, zmax: H };
        if (s === 'coins') return { rho: R + .7 * st.slant + .4, zmax: NCOIN * COINT };
        if (s === 'pyr') return { rho: L + 1.2 + L * .75, zmax: H };
        if (s === 'cone') return { rho: 2 * R + 1.2 + .3, zmax: H };
        if (s === 'scale') { const both = st.dbl !== 'none'; return { rho: (both ? (2 * R + .8 + 2 * kr * R) / 2 : R) + .4, zmax: Math.max(H, H * kh) }; }
        return { rho: 2 * R + .9, zmax: 2 * R };
      };

      /* ---------- drawing ---------- */
      P.onDraw = (c, p) => {
        const pal = p.pal, w = p.w, hh = p.h, u = st.unit, pr = prac.on ? PR[prac.i] : null, shape = st.shape;
        const fs = w < 520 ? 13 : 15;
        const ex = extent(), rho = ex.rho, zmax = ex.zmax, topM = 16, botM = pr ? 16 : 46;
        const availH = hh - topM - botM, availW = w - (w < 520 ? 150 : 170);
        const sc = Math.min(availW / (2 * rho), availH / (zmax * CP + 2 * rho * SP));
        const E = (zmax * CP + 2 * rho * SP) * sc, a = st.rot * PI / 180, ca = Math.cos(a), sa = Math.sin(a);
        const ox = w / 2, oy = topM + (availH - E) / 2 + (zmax * CP + rho * SP) * sc;
        const pj = q => { const yr = q[0] * sa + q[1] * ca; return [ox + (q[0] * ca - q[1] * sa) * sc, oy - (q[2] * CP + yr * SP) * sc, yr]; };
        const edgeCol = alpha(pal.stage, .75), gridCol = alpha(pal.stage, .5);
        const txt = (s, x, y, o = {}) => {
          c.font = `${o.wt || 600} ${o.size || fs}px "Hanken Grotesk","Helvetica Neue",Arial,sans-serif`;
          c.textAlign = o.al || 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 4; c.strokeStyle = pal.stage;
          if (o.halo !== false) c.strokeText(s, x, y); c.fillStyle = o.col || pal.text; c.fillText(s, x, y);
        };
        const seg = (A, B, col, lw, dash) => {
          const q = pj(A), r = pj(B); c.beginPath(); c.moveTo(q[0], q[1]); c.lineTo(r[0], r[1]);
          c.strokeStyle = col; c.lineWidth = lw; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]);
        };
        const visible = f => (-(f.n[0] * sa + f.n[1] * ca) * CP + f.n[2] * SP) > 1e-6;
        const drawFaces = faces => {
          const list = faces.filter(visible).map(f => ({ f, d: avg3(f.p.map(pj))[2] })).sort((x, y) => y.d - x.d);
          for (const { f } of list) {
            const q = f.p.map(pj), nxr = f.n[0] * ca - f.n[1] * sa, nyr = f.n[0] * sa + f.n[1] * ca;
            const b = .55 + .5 * Math.max(0, (-.4 * nxr - .5 * nyr + .77 * f.n[2]) / 1.0015);
            c.beginPath(); q.forEach((t, i) => i ? c.lineTo(t[0], t[1]) : c.moveTo(t[0], t[1])); c.closePath();
            c.fillStyle = tone(f.col, b); c.fill();
            if (f.soft) { c.strokeStyle = c.fillStyle; c.lineWidth = 1; c.stroke(); }
            else if (f.hz) {
              c.strokeStyle = c.fillStyle; c.lineWidth = 1; c.stroke();
              c.strokeStyle = edgeCol; c.lineWidth = 1.2; c.beginPath(); c.moveTo(q[0][0], q[0][1]); c.lineTo(q[1][0], q[1][1]); c.moveTo(q[3][0], q[3][1]); c.lineTo(q[2][0], q[2][1]); c.stroke();
            } else { c.strokeStyle = edgeCol; c.lineWidth = 1.2; c.stroke(); }
            if (f.cu > 1 || f.cv > 1) {
              c.strokeStyle = gridCol; c.lineWidth = 1; c.beginPath();
              for (let i = 1; i < f.cu; i++) { const A = pj(lp(f.p[0], f.p[1], i / f.cu)), B = pj(lp(f.p[3], f.p[2], i / f.cu)); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); }
              for (let j = 1; j < f.cv; j++) { const A = pj(lp(f.p[0], f.p[3], j / f.cv)), B = pj(lp(f.p[1], f.p[2], j / f.cv)); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); }
              c.stroke();
            }
          }
        };
        const ghostPoly = (poly, z0, z1, sil) => { /* see-through container: both outlines and the corner posts */
          c.strokeStyle = alpha(pal.muted, .8); c.lineWidth = 1.4; c.setLineDash([5, 4]);
          for (const z of [z0, z1]) { c.beginPath(); poly.forEach((q, i) => { const t = pj([q[0], q[1], z]); i ? c.lineTo(t[0], t[1]) : c.moveTo(t[0], t[1]); }); c.closePath(); c.stroke(); }
          c.setLineDash([]);
          const posts = sil ? [[sil[0] + sil[2] * ca, sil[1] - sil[2] * sa], [sil[0] - sil[2] * ca, sil[1] + sil[2] * sa]] : poly;
          for (const q of posts) seg([q[0], q[1], z0], [q[0], q[1], z1], alpha(pal.muted, .8), 1.4, [5, 4]);
        };
        const ghostFaces = faces => {
          c.lineWidth = 1; c.strokeStyle = alpha(pal.muted, .55); c.fillStyle = alpha(pal.blue, .07);
          for (const f of faces) { const q = f.p.map(pj); c.beginPath(); q.forEach((t, i) => i ? c.lineTo(t[0], t[1]) : c.moveTo(t[0], t[1])); c.closePath(); c.fill(); c.stroke(); }
        };
        const away = (sx, sy, cx, cy, d) => { const dx = sx - cx, dy = sy - cy, l = Math.hypot(dx, dy) || 1; return [sx + dx / l * d, sy + dy / l * d]; };
        const dimLabel = (A, B, s, col, ctr) => { /* highlighted edge A-B with a text label pushed away from the solid */
          seg(A, B, col, 3.5);
          const m = pj(lp(A, B, .5)), q = away(m[0], m[1], ctr[0], ctr[1], 20); txt(s, q[0], q[1], { col: pal.text });
        };
        const hLabel = (q, z0, z1, s, side) => { /* height of an edge on the left (-1) or right (+1) outline */
          seg([q[0], q[1], z0], [q[0], q[1], z1], pal.text, 2);
          const m = pj([q[0], q[1], (z0 + z1) / 2]); txt(s, m[0] + side * 9, m[1], { al: side > 0 ? 'left' : 'right' });
        };
        const edgeV = (poly, side) => poly.reduce((best, q) => pj([q[0], q[1], 0])[0] * side > pj([best[0], best[1], 0])[0] * side ? q : best, poly[0]);
        const nearestVertex = poly => poly.reduce((best, q) => (q[0] * sa + q[1] * ca) < (best[0] * sa + best[1] * ca) ? q : best, poly[0]);
        const lowest = (poly, dy) => { let best = null; for (const q of poly) { const t = pj([q[0], q[1], 0]); if (!best || t[1] > best[1]) best = t; } return [best[0], best[1] + dy]; };
        const rimV = (cx, R, side) => [cx + side * R * ca, -side * R * sa];
        const dim = v => num(v) + ' ' + u;
        const showDims = !pr || pr.dims !== false;
        let cap = '';
        const parts = [];

        if (shape === 'box' || shape === 'tri' || shape === 'ell') {
          const { L, W, H } = st, k = kk(), x0 = -L / 2, y0 = -W / 2;
          let poly, tops, grid = true;
          if (shape === 'box') { poly = rect(x0, y0, x0 + L, y0 + W); tops = [poly]; }
          else if (shape === 'tri') { poly = [[x0, y0], [x0 + L, y0], [x0, y0 + W]]; tops = [poly]; grid = false; }
          else {
            const [nx, ny] = ellN();
            poly = [[x0, y0], [x0 + L, y0], [x0 + L, y0 + W - ny], [x0 + L - nx, y0 + W - ny], [x0 + L - nx, y0 + W], [x0, y0 + W]];
            tops = [rect(x0, y0, x0 + L, y0 + W - ny), rect(x0, y0 + W - ny, x0 + L - nx, y0 + W)];
          }
          const B = baseArea();
          parts.push({ yr: 0, run: () => {
            if (k === 0) drawFaces(tops.map(t => ({ p: t.map(q => [q[0], q[1], 0]), n: [0, 0, 1], col: pal.yellow, cu: grid ? Math.round(t[1][0] - t[0][0]) : 0, cv: grid ? Math.round(t[3][1] - t[0][1]) : 0 })));
            for (let i = 0; i < k; i++) drawFaces(prism(poly, i, i + 1, { col: pal.blue, topCol: pal.yellow, grid, tops, top: i === k - 1 }));
            if (k < H) ghostPoly(poly, k, H);
          } });
          parts.afterFn = () => {
            const ctr = pj([0, 0, H / 2]);
            if (showDims) {
              if (shape === 'box') {
                const cs = [[x0, y0], [x0 + L, y0], [x0 + L, y0 + W], [x0, y0 + W]], nv = nearestVertex(cs);
                const xo = nv[0] === x0 ? x0 + L : x0, yo = nv[1] === y0 ? y0 + W : y0;
                dimLabel([nv[0], nv[1], 0], [xo, nv[1], 0], dim(L), pal.green, ctr);
                dimLabel([nv[0], nv[1], 0], [nv[0], yo, 0], dim(W), pal.red, ctr);
                hLabel(edgeV(cs, 1), 0, H, dim(H), 1);
              } else {
                const zt = k, g = .35;
                dimLabel([x0, y0 - g, zt], [x0 + L, y0 - g, zt], dim(L), pal.green, ctr);
                dimLabel([x0 - g, y0, zt], [x0 - g, y0 + W, zt], dim(W), pal.red, ctr);
                hLabel(edgeV(poly, 1), 0, H, dim(H), 1);
              }
            }
            if (!pr) {
              const top = k, cx2 = shape === 'tri' ? [x0 + L / 3, y0 + W / 3] : shape === 'ell' ? [x0 + L / 2 - ellN()[0] / 4, y0 + W / 2 - ellN()[1] / 4] : [0, 0];
              const q = pj([cx2[0], cx2[1], top]);
              txt('B = ' + num(B) + ' ' + u + '²', q[0], q[1], { col: '#1a1a1a', wt: 700, halo: false });
            }
          };
          cap = k === H ? `V = ${num(B)} × ${H} = ${num(B * H)} ${u}³` : `${plural(k, 'layer')} × ${num(B)} = ${num(B * k)} ${u}³ so far`;
        }
        else if (shape === 'cyl') {
          const { R, H } = st, k = kk(), poly = circ(0, 0, R), B = R * R;
          parts.push({ yr: 0, run: () => {
            if (k === 0) drawFaces([{ p: poly.map(q => [q[0], q[1], 0]), n: [0, 0, 1], col: pal.yellow, rim: true }]);
            for (let i = 0; i < k; i++) drawFaces(prism(poly, i, i + 1, { col: pal.blue, topCol: pal.yellow, hz: true, top: i === k - 1 }));
            if (k < H) ghostPoly(poly, k, H, [0, 0, R]);
          } });
          parts.afterFn = () => {
            const ctr = pj([0, 0, H / 2]);
            if (showDims) {
              const zt = Math.max(k, 0), A = [-R * ca, R * sa, zt], Bp = [0, 0, zt];
              seg(Bp, A, pal.red, 3.5); const d = pj(Bp); c.beginPath(); c.arc(d[0], d[1], 3.5, 0, TAU); c.fillStyle = pal.text; c.fill();
              const m = pj(lp(Bp, A, .5)); txt('r = ' + dim(R), m[0], m[1] - 16);
              hLabel(rimV(0, R, 1), 0, H, dim(H), 1);
            }
            if (!pr) { const q = pj([0, 0, k]); txt('B = ' + pit(B) + ' ' + u + '²', q[0], q[1] + 26, { col: '#1a1a1a', wt: 700, halo: false }); }
          };
          cap = k === H ? `V = π × ${R}² × ${H} = ${pit(B * H)} ≈ ${num(B * H * PI)} ${u}³` : `${plural(k, 'layer')} × ${pit(B)} = ${pit(B * k)} so far`;
        }
        else if (shape === 'coins') {
          const R = st.R, H = NCOIN * COINT;
          parts.push({ yr: 0, run: () => {
            for (let i = 0; i < NCOIN; i++) {
              const off = (i - (NCOIN - 1) / 2) * st.slant * .2;
              drawFaces(prism(circ(off, 0, R), i * COINT, (i + 1) * COINT, { col: i % 2 ? tone(pal.blue, .86) : pal.blue, topCol: i === NCOIN - 1 ? pal.yellow : (i % 2 ? tone(pal.blue, .86) : pal.blue), hz: true, top: i === NCOIN - 1 }));
            }
          } });
          parts.afterFn = () => {
            const ctr = pj([0, 0, H / 2]), off = (NCOIN - 1) / 2 * st.slant * .2;
            if (showDims) hLabel(rimV(off, R, 1), 0, H, 'height ' + dim(H), 1);
            const q = pj([off, 0, H]); txt('r = ' + dim(R), q[0], q[1] - 18);
          };
          cap = `${NCOIN} coins, V = π × ${R}² × ${num(H)} = ${pit(R * R * H)} ≈ ${num(R * R * H * PI)} ${u}³`;
        }
        else if (shape === 'pyr' || shape === 'cone') {
          const isP = shape === 'pyr', { H } = st, ps = pourState(), half = isP ? st.L / 2 : st.R, xs = half + 1.2;
          const pyrBase = (cx, s, z) => isP ? rect(cx - half * s, -half * s, cx + half * s, half * s).map(q => [q[0], q[1], z]) : circ(cx, 0, half * s, 24).map(q => [q[0], q[1], z]);
          const lvP = Math.cbrt(ps.rem);
          const prismPoly = cx => isP ? rect(cx - half, -half, cx + half, half) : circ(cx, 0, half, 40);
          const names = isP ? ['pyramid', 'prism'] : ['cone', 'cylinder'];
          parts.push({ yr: -xs * sa, run: () => {
            const ghost = pyr(pyrBase(-xs, 1, H), [-xs, 0, 0], pal.blue); ghostFaces(ghost);
            if (ps.rem > 1e-6) drawFaces(pyr(pyrBase(-xs, lvP, H * lvP), [-xs, 0, 0], pal.blue));
            ghostFaces(ghost.slice(-1));
          } });
          parts.push({ yr: xs * sa, run: () => {
            const lvl = Math.min(H, ps.p / 3 * H);
            if (lvl > 1e-6) drawFaces(prism(prismPoly(xs), 0, lvl, { col: pal.blue, topCol: pal.blue, hz: !isP }));
            ghostPoly(prismPoly(xs), 0, H, isP ? null : [xs, 0, half]);
          } });
          parts.afterFn = () => {
            const q1 = pj([-xs, 0, 0]), q2 = lowest(prismPoly(xs), 18);
            txt(names[0], q1[0], q1[1] + 22); txt(names[1], q2[0], q2[1]);
            if (showDims) {
              const ctr = pj([0, 0, H / 2]);
              hLabel(isP ? edgeV(prismPoly(xs), 1) : rimV(xs, half, 1), 0, H, dim(H), 1);
              if (isP && pr) dimLabel([xs - half, half, 0], [xs + half, half, 0], dim(st.L), pal.green, ctr);
            }
            if (!pr && st.guess != null && ps.p > 0 && ps.p < 3) {
              const A = pj([-xs, 0, H * 1.12]), B = pj([xs, 0, H * 1.12]);
              c.beginPath(); c.moveTo(A[0] + 8, A[1]); c.quadraticCurveTo((A[0] + B[0]) / 2, Math.min(A[1], B[1]) - 34, B[0] - 12, B[1] - 4);
              c.strokeStyle = pal.muted; c.lineWidth = 2; c.stroke();
              txt('pour ' + Math.min(3, ps.n + 1) + ' of 3', (A[0] + B[0]) / 2, Math.min(A[1], B[1]) - 30);
            }
          };
          if (!pr) cap = st.guess == null ? 'Same base, same height. Guess first, then pour.' :
            ps.p >= 2.995 ? `3 loads fill the ${names[1]}: one ${names[0]} is ⅓ of it` : `${num(ps.p)} of 3 loads poured: ${names[1]} filled ${num(ps.p / 3 * H)} of ${H} ${u}`;
        }
        else if (shape === 'scale') {
          const [kr, kh] = DBL[st.dbl] || [1, 1], { R, H } = st, Rb = kr * R, Hb = kh * H, single = st.dbl === 'none';
          const Wt = 2 * R + .8 + 2 * Rb, xa = single ? 0 : -Wt / 2 + R, xb = Wt / 2 - Rb;
          const cylAt = (cx, r, hgt) => {
            const nl = Math.max(1, Math.round(hgt)), t = hgt / nl, poly = circ(cx, 0, r);
            for (let i = 0; i < nl; i++) drawFaces(prism(poly, i * t, (i + 1) * t, { col: pal.blue, topCol: pal.yellow, hz: true, top: i === nl - 1 }));
          };
          parts.push({ yr: xa * sa, run: () => cylAt(xa, R, H) });
          if (!single) parts.push({ yr: xb * sa, run: () => cylAt(xb, Rb, Hb) });
          parts.afterFn = () => {
            const qa = lowest(circ(xa, 0, R, 24), 18);
            txt(single ? 'cylinder' : 'A', qa[0], qa[1], { wt: 700 });
            if (!single) { const qb = lowest(circ(xb, 0, Rb, 24), 18); txt('B', qb[0], qb[1], { wt: 700 }); }
            if (showDims) {
              const ctr = pj([0, 0, Math.max(H, Hb) / 2]);
              const aLeft = single ? 1 : (pj([xa, 0, 0])[0] <= pj([xb, 0, 0])[0] ? -1 : 1);
              hLabel(rimV(xa, R, aLeft), 0, H, 'h = ' + dim(H), aLeft);
              if (!single) hLabel(rimV(xb, Rb, -aLeft), 0, Hb, 'h = ' + dim(Hb), -aLeft);
              const ta = pj([xa, 0, H]), tb = pj([xb, 0, Hb]);
              txt('r = ' + dim(R), ta[0], ta[1] - 2, { wt: 700 });
              if (!single) txt('r = ' + dim(Rb), tb[0], tb[1] - 2, { wt: 700 });
            }
          };
          const ratio = kr * kr * kh;
          if (!pr) cap = single ? `V = π × ${R}² × ${H} = ${pit(R * R * H)}` : `B holds ${num(ratio)} ${ratio === 1 ? 'time' : 'times'} as much as A`;
        }
        else { /* sphere */
          const R = st.R, xs = R + .6, f = 1 - st.sp, t = sphereT(Math.max(f, 1e-4), R), N = 28, NB = 16;
          const rho2 = z => Math.sqrt(Math.max(0, R * R - (z - R) * (z - R)));
          parts.push({ yr: -xs * sa, run: () => {
            const fs2 = [], ring = z => circ(-xs, 0, rho2(z), N).map(q => [q[0], q[1], z]);
            if (f > 1e-3) {
              for (let j = 0; j < NB; j++) {
                const z0 = t * j / NB, z1 = t * (j + 1) / NB, A = ring(z0), Bq = ring(z1);
                for (let i = 0; i < N; i++) {
                  const i2 = (i + 1) % N, q = [A[i], A[i2], Bq[i2], Bq[i]], m = avg3(q);
                  fs2.push({ p: q, n: unit([m[0] + xs, m[1], m[2] - R]), col: pal.blue, soft: true });
                }
              }
              if (t < 2 * R - 1e-6) fs2.push({ p: ring(t), n: [0, 0, 1], col: pal.blue, soft: true });
              drawFaces(fs2);
            }
            const q = pj([-xs, 0, R]); c.beginPath(); c.arc(q[0], q[1], R * sc, 0, TAU); c.strokeStyle = alpha(pal.muted, .9); c.lineWidth = 1.6; c.stroke();
          } });
          parts.push({ yr: xs * sa, run: () => {
            const lvl = st.sp * 4 * R / 3, poly = circ(xs, 0, R, 40);
            if (lvl > 1e-6) drawFaces(prism(poly, 0, lvl, { col: pal.blue, topCol: pal.blue, hz: true }));
            ghostPoly(poly, 0, 2 * R, [xs, 0, R]);
          } });
          parts.afterFn = () => {
            const q2 = lowest(circ(xs, 0, R, 24), 18);
            { const qc = pj([-xs, 0, R]); txt('sphere', qc[0], qc[1] + R * sc + 18); } txt('cylinder', q2[0], q2[1]);
            const ctr = pj([0, 0, R]);
            if (showDims) hLabel(rimV(xs, R, 1), 0, 2 * R, 'h = 2r = ' + dim(2 * R), 1);
            const rq = pj([-xs, 0, R]); txt('r = ' + dim(R), rq[0], rq[1], { col: pal.text });
          };
          cap = st.sp >= .995 ? 'The water fills 2/3 of the cylinder' : st.sp <= .005 ? 'Cylinder: radius r, height 2r' : `Cylinder is ${num(st.sp * 2 / 3 * 100)}% full`;
        }

        parts.sort((x, y) => y.yr - x.yr).forEach(pt => pt.run());
        if (parts.afterFn) parts.afterFn();
        if (!pr && cap) {
          let size = fs + 2; c.font = `700 ${size}px "Hanken Grotesk",Arial,sans-serif`;
          while (c.measureText(cap).width > w - 20 && size > 12) { size--; c.font = `700 ${size}px "Hanken Grotesk",Arial,sans-serif`; }
          txt(cap, w / 2, hh - 22, { size, wt: 700, col: pal.text });
        }
      };

      /* ---------- controls ---------- */
      const probe = C.readout(), host = probe.parentNode; probe.remove();
      const grab = fn => { const n = host.children.length, r = fn(); return [r, ...Array.from(host.children).slice(n)]; };
      const show = (els, on) => els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const lock = [], prac = { on: false, i: 0, right: 0, done: 0, tried: false, solved: false, snap: null };
      const gShape = [], gL = [], gW = [], gH = [], gR = [], gK = [], gSlant = [], gPour = [], gSph = [], gScale = [], gViewLabel = [];

      const sync = () => {
        stepSet.forEach(s => s.upd());
        kS.set(st.k); slS.set(st.slant); poS.set(st.pour); spS.set(st.sp); rotS.set(st.rot); sel.value = st.shape;
        const s = st.shape, ex = !prac.on;
        show(gShape, ex); show(gL, ex && ['box', 'tri', 'ell', 'pyr'].includes(s)); show(gW, ex && ['box', 'tri', 'ell'].includes(s));
        show(gH, ex && ['box', 'tri', 'ell', 'cyl', 'pyr', 'cone', 'scale'].includes(s)); show(gR, ex && ['cyl', 'coins', 'cone', 'scale', 'sphere'].includes(s));
        show(gK, ['box', 'tri', 'ell', 'cyl'].includes(s)); show(gSlant, ex && s === 'coins');
        show(gPour, ex && (s === 'pyr' || s === 'cone')); show(gSph, ex && s === 'sphere'); show(gScale, ex && s === 'scale');
        const lbl = { L: s === 'pyr' ? 'Base side' : s === 'tri' ? 'Leg a of base' : 'Length', W: s === 'tri' ? 'Leg b of base' : 'Width', H: s === 'tri' ? 'Length of prism' : 'Height', R: 'Radius' };
        stepSet.forEach(x => { x.lab.textContent = lbl[x.key]; });
        ro.style.display = ex ? '' : 'none';
        P.draw(); upd();
      };

      C.title('Shape');
      const [sel, ...selW] = grab(() => C.select({ label: 'Choose a solid', options: SHAPES.map(([value, label]) => ({ value, label })), value: st.shape, onChange: v => {
        cancel(); Object.assign(st, DEF[v], { shape: v, unit: 'cm' }); st.pour = DEF[v].pour || 0; if (v === 'sphere') st.sp = 0; sync();
      } }));
      gShape.push(...selW); lock.push(sel);

      const stepSet = [];
      const stepper = (key, min, max, grp) => {
        const lab = h('span', { style: 'flex:1;font-size:.92rem' }, key), out = h('output', { style: 'min-width:3.6em;text-align:center;font-variant-numeric:tabular-nums' });
        const mk = (sym, d, word) => h('button', { type: 'button', class: 'btn', 'aria-label': word, style: 'min-width:42px;padding:4px 12px', onclick: () => {
          cancel(); const old = st[key]; st[key] = clamp(st[key] + d, min, max);
          if (key === 'H') st.k = st.k >= old ? st.H : Math.min(st.k, st.H);
          sync();
        } }, sym);
        const minus = mk('−', -1, 'Smaller'), plus = mk('+', 1, 'Larger');
        const box = h('div', { class: 'ctl', style: 'display:flex;align-items:center;gap:8px' }, lab, minus, out, plus);
        host.append(box); grp.push(box); lock.push(minus, plus);
        const rec = { key, lab, upd: () => { out.textContent = st[key] + ' ' + st.unit; minus.setAttribute('aria-label', 'Decrease ' + lab.textContent); plus.setAttribute('aria-label', 'Increase ' + lab.textContent); minus.disabled = prac.on || st[key] <= min; plus.disabled = prac.on || st[key] >= max; } };
        stepSet.push(rec);
      };
      stepper('L', 2, 6, gL); stepper('W', 2, 5, gW); stepper('H', 1, 5, gH); stepper('R', 1, 4, gR);

      const [kS, ...kW] = grab(() => C.slider({ label: 'Layers stacked', min: 0, max: 5, step: 1, value: st.k, format: v => String(Math.round(v)), onInput: v => { cancel(); st.k = Math.min(v, st.H); sync(); } }));
      gK.push(...kW);
      const [slS, ...slW] = grab(() => C.slider({ label: 'Slant the stack', min: 0, max: 3, step: .1, value: st.slant, format: v => v.toFixed(1), onInput: v => { cancel(); st.slant = v; sync(); } }));
      gSlant.push(...slW);

      const names = () => st.shape === 'cone' ? ['cone', 'cylinder'] : ['pyramid', 'prism'];
      const [gq, ...gqW] = grab(() => h('p', { class: 'hint', style: 'margin:0' }, 'How many loads of the pyramid will fill the prism?'));
      host.append(gq); gPour.push(gq);
      const guessRow = h('div', { class: 'ctl buttons' }); host.append(guessRow); gPour.push(guessRow);
      const gBtns = [2, 3, 4].map(n => { const b = h('button', { type: 'button', class: 'btn', onclick: () => { cancel(); st.guess = n; sync(); } }, n + ' loads (' + (n === 2 ? '1/2' : n === 3 ? '1/3' : '1/4') + ')'); guessRow.append(b); lock.push(b); return b; });
      const [poS, ...poW] = grab(() => C.slider({ label: 'Pour', min: 0, max: 3, step: .01, value: st.pour, format: v => v.toFixed(2) + ' loads', onInput: v => {
        cancel(); if (st.guess == null) { st.pour = 0; fbMsg = 'Make a guess first, then pour.'; } else st.pour = v; sync();
      } }));
      gPour.push(...poW);
      const pourBtns = grab(() => C.buttons([
        { label: 'Pour one load', onClick: () => { if (st.guess == null) { fbMsg = 'Make a guess first, then pour.'; sync(); return; } cancel(); const t = Math.min(3, Math.floor(st.pour + 1e-9) + 1); cancel = animateTo(st, { pour: t }, 1300, sync); } },
        { label: 'Empty the prism', onClick: () => { cancel(); st.pour = 0; sync(); } }
      ]));
      gPour.push(...pourBtns.slice(1));
      const fb = h('p', { class: 'hint', style: 'margin:0', 'aria-live': 'polite' }); host.append(fb); gPour.push(fb);
      let fbMsg = '';

      const [spS, ...spW] = grab(() => C.slider({ label: 'Pour the sphere into the cylinder', min: 0, max: 1, step: .01, value: st.sp, format: v => Math.round(v * 100) + '%', onInput: v => { cancel(); st.sp = v; sync(); } }));
      gSph.push(...spW);
      const scBtns = grab(() => C.buttons([
        { label: 'Original', onClick: () => { cancel(); st.dbl = 'none'; sync(); } },
        { label: 'Double height', onClick: () => { cancel(); st.dbl = 'h'; sync(); } },
        { label: 'Double radius', onClick: () => { cancel(); st.dbl = 'r'; sync(); } },
        { label: 'Double both', onClick: () => { cancel(); st.dbl = 'hr'; sync(); } }
      ]));
      gScale.push(...scBtns.slice(1)); lock.push(...scBtns[0]);

      C.title('Turn the solid');
      const [rotS] = grab(() => C.slider({ label: 'Rotation', min: -180, max: 180, step: 5, value: st.rot, format: v => Math.round(v) + '°', onInput: v => { st.rot = v; P.requestDraw(); } }));
      C.buttons([
        { label: 'Turn left', onClick: () => { st.rot = wrapDeg(snap(st.rot, 5) - 30); sync(); } },
        { label: 'Turn right', onClick: () => { st.rot = wrapDeg(snap(st.rot, 5) + 30); sync(); } }
      ]);
      C.hint('You can also drag on the picture to turn the solid.');
      const ro = C.readout();

      /* pointer drag turns the solid */
      let drag = null; const cv = P.canvas; cv.style.cursor = 'grab';
      cv.addEventListener('pointerdown', e => { drag = e.clientX; cv.setPointerCapture(e.pointerId); e.preventDefault(); });
      cv.addEventListener('pointermove', e => { if (drag == null) return; st.rot = wrapDeg(st.rot + (e.clientX - drag) * .6); drag = e.clientX; rotS.set(Math.round(st.rot / 5) * 5); P.requestDraw(); });
      const endDrag = () => { drag = null; }; cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);

      /* ---------- readout ---------- */
      const upd = () => {
        const { shape: s, L, W, H, R } = st, u = st.unit, k = kk(), ps = pourState(), kv = (a, b) => `<span class="k">${a}</span> ${b}`;
        let o = [];
        if (s === 'box' || s === 'tri' || s === 'ell') {
          const B = baseArea(), [nx, ny] = ellN();
          const bf = s === 'box' ? `${L} × ${W}` : s === 'tri' ? `½ × ${L} × ${W}` : `${L} × ${W} − ${nx} × ${ny}`;
          o.push(kv('Base area B', `${bf} = ${num(B)} ${u}²`));
          o.push(kv('Layers', `${k} × ${num(B)} = ${num(B * k)} ${u}³ so far`));
          o.push(kv('Whole solid', `V = B × h = ${num(B)} × ${H} = ${num(B * H)} ${u}³`));
          if (s !== 'tri') o.push(kv('Unit cubes per layer', num(B)));
        } else if (s === 'cyl') {
          o.push(kv('Base area B', `π × ${R}² = ${pit(R * R)} ≈ ${num(R * R * PI)} ${u}²`));
          o.push(kv('Layers', `${k} × ${pit(R * R)} = ${pit(R * R * k)} ≈ ${num(R * R * k * PI)} ${u}³ so far`));
          o.push(kv('Whole cylinder', `V = π r² h = ${pit(R * R * H)} ≈ ${num(R * R * H * PI)} ${u}³`));
        } else if (s === 'coins') {
          const h4 = NCOIN * COINT;
          o.push(kv('Stack', `${NCOIN} coins, each ${COINT} ${u} thick, height ${num(h4)} ${u}`));
          o.push(kv('Slant', st.slant === 0 ? 'straight' : 'leaning'));
          o.push(kv('Volume', `V = π × ${R}² × ${num(h4)} = ${pit(R * R * h4)} ≈ ${num(R * R * h4 * PI)} ${u}³`));
          o.push('Straight or leaning, the volume is the same.');
        } else if (s === 'pyr' || s === 'cone') {
          const isP = s === 'pyr', nm = names(), cy = isP ? L * L * H : R * R * H;
          o.push(kv(cap1(nm[1]), isP ? `${L} × ${L} × ${H} = ${cy} ${u}³` : `π × ${R}² × ${H} = ${pit(cy)} ≈ ${num(cy * PI)} ${u}³`));
          o.push(kv('Loads poured', `${Math.floor(ps.p + 1e-9)} (${num(ps.p)} so far)`));
          o.push(kv('Level in the ' + nm[1], `${num(ps.p / 3 * H)} of ${H} ${u}`));
          if (ps.p >= 2.995) o.push(kv('So', `${nm[0]} = ⅓ × ${nm[1]} = ⅓ × ${isP ? cy : pit(cy)} = ${isP ? num(cy / 3) : pit3(cy)}${isP ? '' : ' ≈ ' + num(cy / 3 * PI)} ${u}³`));
          else o.push(kv(cap1(nm[0]), 'pour all three loads to find out'));
        } else if (s === 'scale') {
          const [kr, kh] = DBL[st.dbl] || [1, 1], Rb = kr * R, Hb = kh * H, VA = R * R * H, VB = Rb * Rb * Hb;
          o.push(kv(st.dbl === 'none' ? 'Cylinder' : 'A', `r = ${R}, h = ${H}: V = ${pit(VA)} ≈ ${num(VA * PI)} ${u}³`));
          if (st.dbl !== 'none') {
            o.push(kv('B', `r = ${num(Rb)}, h = ${num(Hb)}: V = ${pit(VB)} ≈ ${num(VB * PI)} ${u}³`));
            o.push(kv('B ÷ A', `${num(kr)}² × ${num(kh)} = ${num(VB / VA)} times as much`));
          }
        } else {
          const VS = 4 * R * R * R, VC = 2 * R * R * R;
          o.push(kv('Sphere', `4/3 π r³ = ${pit3(VS)} ≈ ${num(VS / 3 * PI)} ${u}³`));
          o.push(kv('Cylinder (h = 2r)', `π r² × 2r = ${pit(VC)} ≈ ${num(VC * PI)} ${u}³`));
          o.push(kv('Sphere ÷ cylinder', '(4/3) ÷ 2 = 2/3'));
          o.push(kv('Water level', `${num(st.sp * 4 * R / 3)} of ${2 * R} ${u}`));
        }
        ro.innerHTML = o.join('<br>');
        if (s === 'pyr' || s === 'cone') {
          const nm = names();
          gq.textContent = `How many loads of the ${nm[0]} will fill the ${nm[1]}?`;
          gBtns.forEach(b => { b.style.borderColor = ''; });
          if (st.guess != null) { const b = gBtns[st.guess - 2]; b.style.borderColor = 'var(--brass)'; b.style.color = 'var(--brass)'; }
          gBtns.forEach((b, i) => { if (st.guess !== i + 2) b.style.color = ''; });
          let m = fbMsg;
          if (st.guess != null) {
            const g = st.guess;
            if (ps.p >= 2.995) m = g === 3 ? `You guessed 3 and you were right. Three loads fill the ${nm[1]} exactly, so the ${nm[0]} is one third of it.`
              : g === 2 ? `You guessed 2. After 2 loads the ${nm[1]} was only 2/3 full, so the ${nm[0]} holds less than a half. It took 3 loads: one third.`
              : `You guessed 4. The ${nm[1]} was already full after 3 loads, so the ${nm[0]} holds more than a quarter. It took 3 loads: one third.`;
            else if (g === 2 && ps.p >= 1.995) m = `Two loads, and the ${nm[1]} is only 2/3 full. Keep pouring.`;
            else if (ps.p < .005) m = `You chose ${g} loads. Now pour and count the loads.`;
            else m = 'Keep pouring and count the loads.';
          } else if (!m) m = 'Choose a guess first. Then the pour slider unlocks.';
          fb.textContent = m;
          poS.set(st.pour);
        }
      };
      const cap1 = s => s[0].toUpperCase() + s.slice(1);

      /* ---------- practice ---------- */
      const PR = [
        { fig: { shape: 'box', L: 5, W: 2, H: 4, k: 1 }, ans: 2,
          q: 'This box is 5 cm long, 2 cm wide and 4 cm tall. What is its volume? You can raise the layers to count.',
          ch: [['11 cm³', 'That adds the sides: 5 + 2 + 4. Volume counts cubes, so multiply. One layer holds 5 × 2 = 10 cubes, and there are 4 layers.'],
               ['10 cm³', 'That is only one layer (5 × 2 = 10 cubes). The box has 4 layers, so multiply by 4.'],
               ['40 cm³', 'One layer holds 5 × 2 = 10 cubes. There are 4 layers, so 10 × 4 = 40 cubes. Each cube is 1 cm³.'],
               ['40 cm²', 'The number 40 is right, but cm² measures flat area. Cubes fill space, so the unit is cm³.']] },
        { fig: { shape: 'tri', L: 6, W: 4, H: 5, k: 1 }, ans: 1,
          q: 'The base of this prism is a right triangle with legs 6 cm and 4 cm. The prism is 5 cm long (the length is the edge drawn upright). What is its volume?',
          ch: [['120 cm³', 'That is 6 × 4 × 5, a box. A triangle is half of a 6 by 4 rectangle, so the base area is 12 cm², not 24.'],
               ['60 cm³', 'Base area = ½ × 6 × 4 = 12 cm². Volume = base area × length = 12 × 5 = 60 cm³.'],
               ['15 cm³', 'That adds the three numbers. Volume multiplies the base area (12 cm²) by the length (5 cm).'],
               ['12 cm²', 'That is only the base area, one layer, and its unit is cm². Multiply by the 5 cm length to get 60 cm³.']] },
        { fig: { shape: 'cyl', R: 3, H: 5, k: 1 }, dims: false, ans: 3,
          q: 'A can has a diameter of 6 cm and a height of 5 cm. What is its volume? Give the exact value with π and a decimal.',
          ch: [['180π cm³ (about 565 cm³)', 'That used 6 as the radius. The radius is half the diameter, so r = 3 and r² = 9.'],
               ['30π cm³ (about 94 cm³)', 'That is 2πrh, which measures the curved side. Volume is π r² h.'],
               ['15π cm³ (about 47 cm³)', 'That is π × r × h. The radius must be squared: π r² h = π × 9 × 5.'],
               ['45π cm³ (about 141 cm³)', 'r = 3, so the base is π × 3² = 9π cm². Then V = 9π × 5 = 45π ≈ 141.4 cm³.']] },
        { fig: { shape: 'pyr', L: 6, H: 5, pour: 0 }, ans: 0,
          q: 'A pyramid has a square base 6 cm on each side and a height of 5 cm. What is its volume?',
          ch: [['60 cm³', 'Base area = 6 × 6 = 36 cm². The prism with this base and height holds 36 × 5 = 180 cm³. The pyramid is one third of that: 60 cm³.'],
               ['180 cm³', 'That is the volume of the prism with the same base and height. A pyramid holds only one third of it.'],
               ['90 cm³', 'That is half of the prism. It takes three pyramids to fill the prism, so one third, not one half.'],
               ['10 cm³', 'That used ⅓ × 6 × 5. The base is a square, so its area is 6 × 6 = 36, not 6.']] },
        { fig: { shape: 'box', L: 10, W: 5, H: 2, k: 1, unit: 'm' }, ans: 1,
          q: 'A pool is 10 m long, 5 m wide and 2 m deep. A pump adds 500 liters each minute. One cubic meter holds 1000 liters. How many minutes does it take to fill the pool?',
          ch: [['100 minutes', 'That comes from 50 m³, the floor area with no depth (50,000 ÷ 500 = 100). The volume is 10 × 5 × 2 = 100 m³.'],
               ['200 minutes', 'V = 10 × 5 × 2 = 100 m³ = 100,000 liters. Then 100,000 ÷ 500 = 200 minutes.'],
               ['0.2 minutes', 'That forgot to change cubic meters to liters. 100 m³ is 100,000 liters, and 100,000 ÷ 500 = 200.'],
               ['2,000 minutes', '100,000 ÷ 500 is 200, not 2,000. Check the zeros when you divide.']] },
        { fig: { shape: 'cyl', R: 2, H: 3, k: 3, unit: 'm' }, ans: 2,
          q: 'A cylindrical tank has radius 2 m and height 3 m. A cone-shaped scoop has radius 1 m and height 3 m. How many full scoops fill the tank?',
          ch: [['3 scoops', 'That would be true only if the scoop had the same radius as the tank. This scoop is narrower, so it holds much less.'],
               ['4 scoops', 'The base areas differ by 4, but a cone also holds only a third of its cylinder. You missed the third.'],
               ['12 scoops', 'Tank: π × 2² × 3 = 12π m³. Scoop: ⅓ × π × 1² × 3 = π m³. So 12π ÷ π = 12 scoops.'],
               ['36 scoops', '36 treats the cone as 3 times its cylinder instead of a third of it. The tank has 4 times the base area of the scoop, and a cone holds a third of its cylinder, so it is 4 × 3 = 12.']] },
        { fig: { shape: 'scale', R: 1, H: 2, dbl: 'rh2' }, dims: true, ans: 1,
          q: 'Cylinder B has twice the radius of cylinder A and half the height of A. How does the volume of B compare with the volume of A?',
          ch: [['B holds the same as A', 'The radius counts twice (r²), so doubling it gives 4 times. Halving the height gives ½. 4 × ½ is 2, not 1.'],
               ['B holds 2 times as much', 'Doubled radius: × 2² = 4. Halved height: × ½. Together 4 × ½ = 2.'],
               ['B holds 4 times as much', 'That forgot the height. It was halved, so multiply by ½ as well: 4 × ½ = 2.'],
               ['B holds 8 times as much', 'That treats the radius as if it counted three times. It counts twice, and the height is halved: 4 × ½ = 2.']] }
      ];
      const pz = h('div', { class: 'ctl', style: 'display:none;gap:10px;flex-direction:column' });
      const pStat = h('p', { class: 'hint', style: 'margin:0', 'aria-live': 'polite' });
      const pQ = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
      const pCh = h('div', { class: 'ctl buttons', style: 'flex-direction:column;align-items:stretch' });
      const pFb = h('p', { style: 'margin:0;font-size:.92rem;line-height:1.5', 'aria-live': 'polite' });
      const pNav = h('div', { class: 'ctl buttons' });
      const pNext = h('button', { type: 'button', class: 'btn primary', onclick: () => { if (prac.i + 1 >= PR.length) finishPractice(); else { prac.i++; showProblem(); } } }, 'Next problem');
      const pLeave = h('button', { type: 'button', class: 'btn', onclick: () => stopPractice() }, 'Leave practice');
      pNav.append(pNext, pLeave); pz.append(pStat, pQ, pCh, pFb, pNav);
      C.title('Practice');
      const startBtn = C.buttons([{ label: 'Start practice (7 problems)', primary: true, onClick: () => startPractice() }])[0];
      host.append(pz);
      const startRow = startBtn.parentNode;

      const tally = () => `Problem ${prac.i + 1} of ${PR.length}. Right on the first try: ${prac.right} of ${prac.done} answered.`;
      function startPractice() {
        cancel(); prac.snap = { ...st }; prac.on = true; prac.i = 0; prac.right = 0; prac.done = 0;
        startRow.style.display = 'none'; pz.style.display = 'flex'; showProblem();
      }
      function stopPractice() {
        if (!prac.on) return;
        prac.on = false; Object.assign(st, prac.snap); pz.style.display = 'none'; startRow.style.display = '';
        lock.forEach(e => { e.disabled = false; }); sync();
      }
      function showProblem() {
        const pb = PR[prac.i]; cancel();
        Object.assign(st, { pour: 0, sp: 0, slant: 0, guess: null, dbl: 'none', unit: 'cm' }, pb.fig);
        prac.tried = false; prac.solved = false;
        pStat.textContent = tally(); pQ.textContent = pb.q; pFb.innerHTML = ''; pNext.style.display = 'none';
        pCh.innerHTML = '';
        pb.ch.forEach(([t], i) => pCh.append(h('button', { type: 'button', class: 'btn', style: 'justify-content:flex-start;text-align:left;height:auto;min-height:42px;padding:8px 14px', onclick: ev => choose(i, ev.currentTarget) }, String.fromCharCode(65 + i) + '. ' + t)));
        lock.forEach(e => { e.disabled = true; }); sync();
      }
      function choose(i, btn) {
        const pb = PR[prac.i]; if (prac.solved) return;
        if (i === pb.ans) {
          prac.solved = true; if (!prac.tried) prac.right++; prac.done++;
          btn.style.borderColor = 'var(--green)'; btn.style.color = 'var(--green)';
          pFb.innerHTML = `<b>Yes.</b> ${pb.ch[i][1]}`;
          Array.from(pCh.children).forEach(b => { b.disabled = true; });
          pNext.style.display = ''; pNext.textContent = prac.i + 1 >= PR.length ? 'See my results' : 'Next problem';
        } else {
          prac.tried = true; btn.disabled = true; btn.style.borderColor = 'var(--red)'; btn.style.color = 'var(--red)';
          pFb.innerHTML = `<b>Not quite.</b> ${pb.ch[i][1]} Try another choice.`;
        }
        pStat.textContent = tally();
      }
      function finishPractice() {
        pQ.textContent = `You finished. You got ${prac.right} of ${PR.length} right on the first try.`;
        pCh.innerHTML = ''; pNext.style.display = 'none'; pStat.textContent = '';
        pFb.innerHTML = prac.right === PR.length ? 'Every one on the first try. Try the Sphere in the Shape list next.' : 'Look back at the layers: volume = base area × height, and a pyramid or cone is one third of that.';
        pLeave.textContent = 'Back to exploring';
        const again = h('button', { type: 'button', class: 'btn', onclick: () => { pLeave.textContent = 'Leave practice'; again.remove(); prac.i = 0; prac.right = 0; prac.done = 0; showProblem(); } }, 'Practice again');
        pNav.prepend(again);
      }

      /* ---------- guided steps ---------- */
      const apply = (patch, immediate) => {
        cancel(); stopPractice();
        const { k, pour, slant, sp, ...inst } = patch, anim = {};
        if (k !== undefined) anim.k = k; if (pour !== undefined) anim.pour = pour; if (slant !== undefined) anim.slant = slant; if (sp !== undefined) anim.sp = sp;
        Object.assign(st, inst); st.unit = 'cm'; fbMsg = '';
        if (immediate || !Object.keys(anim).length) { Object.assign(st, anim); sync(); } else cancel = animateTo(st, anim, 900, sync);
      };
      sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
