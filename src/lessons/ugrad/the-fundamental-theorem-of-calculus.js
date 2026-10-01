/* =====================================================================
   UNDERGRADUATE (Calculus) — The fundamental theorem of calculus
   ===================================================================== */
{
  const PI = Math.PI, W = 10, H = 4, EPS = 1e-9;
  const nice = v => { const e = Math.pow(10, Math.floor(Math.log10(v))), f = v / e; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * e; };
  const n2 = v => num(Math.abs(v) < .005 ? 0 : v);
  const piLab = x => {
    const r = x / PI;
    for (const q of [1, 2, 3, 4, 6, 12]) {
      const k = Math.round(r * q);
      if (Math.abs(r * q - k) < 1e-6) return k === 0 ? '0' : (k === 1 ? 'π' : k + 'π') + (q > 1 ? '/' + q : '');
    }
    return null;
  };
  const mk = o => Object.assign({ breaks: [], zeros: [], a0: 0 }, o);
  const FNS = {
    hills: mk({ label: 'Hills and a dip', f: x => (x - 1) * (x - 4) / 2, anti: x => x * x * x / 6 - 5 * x * x / 4 + 2 * x,
      dom: [0, 6], snap: .1, sab: .5, zeros: [1, 4], ab: [1, 4], cs: [0, 2, -1.5], antiL: 'x³/6 − 5x²/4 + 2x' }),
    square: mk({ label: 'x²', f: x => x * x, anti: x => x * x * x / 3,
      dom: [0, 3], snap: .1, sab: .5, ab: [1, 3], cs: [0, 2, -3], antiL: 'x³/3' }),
    wave: mk({ label: 'cos x', f: Math.cos, anti: Math.sin, pi: true,
      dom: [0, 2 * PI], snap: PI / 12, sab: PI / 6, ab: [PI / 2, 3 * PI / 2], cs: [0, 1.5, -1], antiL: 'sin x' }),
    exp: mk({ label: 'eˣ', f: Math.exp, anti: Math.exp,
      dom: [0, 2.5], snap: .1, sab: .5, ab: [.5, 2], cs: [0, 2, -1], antiL: 'eˣ' }),
    steps: mk({ label: 'Steps (f jumps)', f: x => x < 2 ? 2 : x < 4 ? -1 : 1, anti: x => x < 2 ? 2 * x : x < 4 ? 6 - x : x - 2,
      dom: [0, 6], snap: .1, sab: 1, breaks: [2, 4], ab: [1, 5], cs: [0, 2, -1], antiL: 'A(x)' }),
    corner: mk({ label: 'Corner (f has a point)', f: x => 1.5 - Math.abs(x - 3), anti: x => x <= 3 ? x * x / 2 - 1.5 * x : 4.5 * x - x * x / 2 - 9,
      dom: [0, 6], snap: .1, sab: 1, zeros: [1.5, 4.5], ab: [1, 5], cs: [0, 1, -1.5], antiL: 'A(x)' })
  };
  const ORDER = ['hills', 'square', 'wave', 'exp', 'steps', 'corner'];
  const QFN = ['hills', 'corner'], QORD = { hills: [1, 3, 0, 2], corner: [3, 0, 2, 1] }, QSHIFT = { hills: 1.2, corner: .8 };
  const FORD = [1, 3, 0, 2];

  const Aat = (fn, lo, x) => fn.anti(x) - fn.anti(lo);
  const candFn = (fn, k) => k === 3 ? x => 2 * fn.anti(x) : x => fn.anti(x) + fn.cs[k];
  const candLabel = (fn, k) => k === 3 ? '2·(' + fn.antiL + ')' : fn.antiL + (fn.cs[k] === 0 ? '' : fn.cs[k] > 0 ? ' + ' + fn.cs[k] : ' − ' + Math.abs(fn.cs[k]));
  const pn = v => Math.abs(v) < .005 || v > 0 ? n2(v) : '(' + n2(v) + ')';
  const fx = (fn, x) => { if (fn.pi) { const t = piLab(x); if (t) return t === '0' ? '0' : t + ' (' + n2(x) + ')'; } return n2(x); };
  const ticksOf = fn => {
    const out = [];
    if (fn.pi) for (let k = 0; k <= 4; k++) out.push({ x: k * PI / 2, t: piLab(k * PI / 2) });
    else for (let x = fn.dom[0]; x <= fn.dom[1] + 1e-9; x++) out.push({ x, t: String(x) });
    return out;
  };
  /* piecewise samples of f on [s, e]: one array of points per continuous piece */
  const segs = (fn, s, e, n = 200) => {
    const cuts = [s, ...fn.breaks.filter(b => b > s + 1e-9 && b < e - 1e-9), e], out = [], dw = fn.dom[1] - fn.dom[0];
    for (let i = 0; i < cuts.length - 1; i++) {
      const u = cuts[i], v = cuts[i + 1], m = Math.max(3, Math.ceil(n * (v - u) / dw)), pts = [];
      for (let k = 0; k <= m; k++) {
        const x = u + (v - u) * k / m;
        pts.push([x, k === 0 ? fn.f(x + EPS) : k === m ? fn.f(x - EPS) : fn.f(x)]);
      }
      out.push(pts);
    }
    return out;
  };
  const padRange = (lo, hi) => { const d = (hi - lo) * .1; return [lo < 0 ? lo - d : 0, hi > 0 ? hi + d : 0]; };
  const rangeOf = (gs, d0, d1) => {
    let lo = 0, hi = 0;
    for (let i = 0; i <= 240; i++) for (const g of gs) { const v = g(d0 + (d1 - d0) * i / 240); lo = Math.min(lo, v); hi = Math.max(hi, v); }
    return padRange(lo, hi);
  };
  const stats = fn => fn._s || (fn._s = (() => {
    const [d0, d1] = fn.dom;
    let rf = rangeOf([fn.f, x => fn.f(x - EPS)], d0, d1);
    return {
      f: rf,
      A: rangeOf([x => Aat(fn, fn.a0, x)], d0, d1),
      F: rangeOf([0, 1, 2, 3].map(k => candFn(fn, k)), d0, d1)
    };
  })());
  const quizCands = fn => {
    const A = x => Aat(fn, fn.a0, x), c = QSHIFT[fn.key];
    const base = [{ kind: 'true', g: A }, { kind: 'neg', g: x => -A(x) }, { kind: 'f', g: fn.f }, { kind: 'shift', g: x => A(x) + c }];
    return QORD[fn.key].map(i => base[i]);
  };
  const quizRange = fn => fn._q || (fn._q = rangeOf(quizCands(fn).map(c => c.g), fn.dom[0], fn.dom[1]));
  Object.keys(FNS).forEach(k => { FNS[k].key = k; });

  /* drawing helpers (normalized plot area [0,W] x [0,H], one uniform scale) */
  const chart = (p, fn, yr, title, tcol) => {
    p.fit(W, H, { l: 1.8, r: .7, t: .85, b: 1 });
    const pal = p.pal, [d0, d1] = fn.dom, [yl, yh] = yr, fs = clamp(p.scale * .33, 14, 17);
    const ux = x => (x - d0) / (d1 - d0) * W, vy = y => (y - yl) / (yh - yl) * H;
    const step = nice((yh - yl) / 4);
    for (let k = Math.ceil(yl / step - 1e-9); k * step <= yh + 1e-9; k++) {
      const v = k * step;
      p.path([[0, vy(v)], [W, vy(v)]], { stroke: pal.grid, width: 1.5 });
      p.label(num(+v.toFixed(6)), 0, vy(v), { size: fs, italic: false, color: pal.muted, align: 'right', dx: -9 });
    }
    for (const t of ticksOf(fn)) {
      p.path([[ux(t.x), 0], [ux(t.x), H]], { stroke: pal.grid, width: 1.5 });
      p.label(t.t, ux(t.x), 0, { size: fs, italic: false, color: pal.muted, dy: 16 });
    }
    p.path([[0, vy(0)], [W, vy(0)]], { stroke: pal['grid-strong'], width: 2 });
    p.label('x', W + .12, vy(0), { size: fs + 3, color: pal.muted, align: 'left' });
    p.label(title, -1.75, H + .05, { size: fs + 1, italic: false, color: tcol, align: 'left', dy: -12 });
    return { ux, vy, fs, d0, d1, xOf: nx => d0 + nx / W * (d1 - d0) };
  };
  const shade = (p, fn, lo, hi, g, a) => {
    if (hi - lo < 1e-9) return;
    const pal = p.pal;
    for (const seg of segs(fn, lo, hi)) {
      let run = [], sign = 0, prev = null;
      const flush = () => {
        if (run.length > 1 && sign) p.path([[g.ux(run[0][0]), g.vy(0)], ...run.map(([x, y]) => [g.ux(x), g.vy(y)]), [g.ux(run[run.length - 1][0]), g.vy(0)]],
          { fill: alpha(sign > 0 ? pal.yellow : pal.red, a), close: true });
        run = [];
      };
      for (const [x, y] of seg) {
        const s = Math.abs(y) < 1e-12 ? 0 : Math.sign(y);
        if (prev && s && sign && s !== sign) {
          const xc = prev[0] + prev[1] / (prev[1] - y) * (x - prev[0]);
          run.push([xc, 0]); flush(); run = [[xc, 0]]; sign = s;
        } else if (!sign && s) sign = s;
        run.push([x, y]); prev = [x, y];
      }
      flush();
    }
  };
  const curveOf = (p, fn, g, col, w, a = 1) => {
    for (const seg of segs(fn, g.d0, g.d1)) p.path(seg.map(([x, y]) => [g.ux(x), g.vy(y)]), { stroke: alpha(col, a), width: w });
  };
  const fnPath = (p, g, gf, col, w, x0, x1, dash) => {
    const pts = [], n = 200;
    for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; pts.push([g.ux(x), g.vy(gf(x))]); }
    p.path(pts, { stroke: col, width: w, dash });
  };

  register({
    id: 'the-fundamental-theorem-of-calculus', level: 'ugrad',
    title: 'The fundamental theorem of calculus',
    blurb: 'Build the area function, see its slope equal the height of the curve, and use that to compute integrals.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 3; p.cy = 2.7; p.span = 3.7;
      const f = x => (x - 1) * (x - 4) / 2, A = x => x * x * x / 6 - 5 * x * x / 4 + 2 * x, by = 4.3, ay = 1.5, kf = .28, ka = .5;
      const top = [], bot = [];
      for (let i = 0; i <= 60; i++) { const x = i / 10; top.push([x, by + kf * f(x)]); bot.push([x, ay + ka * A(x)]); }
      const sh = (x0, x1, col) => { const pts = [[x0, by]]; for (let i = 0; i <= 20; i++) { const x = x0 + (x1 - x0) * i / 20; pts.push([x, by + kf * f(x)]); } pts.push([x1, by]); p.path(pts, { fill: alpha(col, .4), close: true }); };
      sh(0, 1, pal.yellow); sh(1, 3, pal.red);
      p.path([[0, by], [6, by]], { stroke: pal['grid-strong'], width: 1.5 }); p.path([[0, ay], [6, ay]], { stroke: pal['grid-strong'], width: 1.5 });
      p.path(top, { stroke: pal.blue, width: 2.6 });
      p.path(bot.filter(q => q[0] <= 3.001), { stroke: pal.green, width: 3 });
      p.path(bot.filter(q => q[0] >= 2.999), { stroke: alpha(pal.green, .35), width: 2 });
      p.path([[3, by + kf * f(3)], [3, ay + ka * A(3)]], { stroke: pal['grid-strong'], width: 1.5, dash: [4, 4] });
      p.path([[2.1, ay + ka * A(3) + .5 * ka * 1], [3.9, ay + ka * A(3) - .5 * ka * 1]], { stroke: pal.violet, width: 2.2 });
      p.dot(3, ay + ka * A(3), 4.5, pal.green, pal.stage, 1.5);
    },
    hook: String.raw`Area is built by adding up thin strips. Slope is built by dividing a small change by a small step. Why should the area function have a slope equal to the height of the curve?`,
    steps: [
      { title: 'Area that accumulates',
        text: String.raw`<p>The top graph is a function \(f\). Pick a fixed start \(a=0\) and a movable point \(x\). The shaded region between \(f\) and the x-axis, from \(a\) to \(x\), is the <b>signed area</b>. Yellow counts as positive, red as negative.</p><p>The bottom graph plots that area, \(A(x)\), as \(x\) moves. At \(x=1\) the curve \(f\) touches zero and \(A\) is at its peak, \(0.92\). Drag \(x\) to the right: \(f\) goes below the axis, red area is subtracted, and \(A\) falls.</p>`,
        set: { mode: 'acc', fk: 'hills', x: 1 } },
      { title: 'The slope of A is the height of f',
        text: String.raw`<p>Now \(x=3\), where \(f(3)=-1\). A thin strip of width \(dx=0.5\) starts at \(x\). It is nearly a rectangle of height \(f(x)\), so its area is about \(f(x)\,dx=-0.5\).</p><p>The true change in \(A\) is \(-0.42\), so \(\Delta A\div dx=-0.83\), already close to \(f(3)=-1\). Drag the <b>dx</b> slider down and the ratio closes in on \(-1\). The violet tangent has slope \(f(x)\).</p>`,
        set: { mode: 'slope', fk: 'hills', x: 3, dx: .5 } },
      { title: 'Which graph is A?',
        text: String.raw`<p>Now you only have \(f\). Four graphs are offered. One of them is \(A(x)\), the area from \(a=0\).</p><p>Read \(f\) first. Where is it positive? Where is it zero? Use the first half of the theorem to decide how \(A\) must behave, then click a graph. Dragging \(x\) shades the area and marks \(x\) on all four graphs.</p>`,
        set: { mode: 'quiz', fk: 'hills', x: 2 } },
      { title: 'Compute an area from an antiderivative',
        text: String.raw`<p>Now shade the area under \(f(x)=x^2\) from \(a=1\) to \(b=3\). Drag the yellow ends to change \(a\) and \(b\).</p><p>Choose an <b>antiderivative</b> \(F\), a function whose slope is \(f\). Some choices differ by a constant, and one is not an antiderivative at all. Then compute \(F(b)-F(a)\) and pick the number. The lesson then checks it against the shaded area.</p>`,
        set: { mode: 'ftc', fk: 'square', fi: null, a: 1, b: 3 } }
    ],
    formal: String.raw`
      <p>Let \(f\) be continuous on an interval \([a,b]\). The <em>accumulation function</em> is
      \[ A(x)=\int_a^x f(t)\,dt, \qquad a\le x\le b, \]
      the signed area between the graph of \(f\) and the t-axis from \(a\) to \(x\). (The letter \(t\) is a dummy variable, so that \(x\) can be the upper limit.) Area above the axis counts as positive and area below as negative. Note that \(A(a)=0\).</p>
      <h3>Part 1: the slope of the area function</h3>
      <p><b>Theorem.</b> If \(f\) is continuous on \([a,b]\), then \(A\) is differentiable and
      \[ A'(x)=f(x) \quad\text{for every } x \text{ in } [a,b]. \]
      <b>Strip argument.</b> Take a small step \(h>0\). Then
      \[ A(x+h)-A(x)=\int_x^{x+h} f(t)\,dt, \]
      the area of a thin strip of width \(h\). On \([x,x+h]\) the continuous function \(f\) has a smallest value \(m_h\) and a largest value \(M_h\), so the strip lies between two rectangles:
      \[ m_h\,h \;\le\; A(x+h)-A(x) \;\le\; M_h\,h. \]
      Divide by \(h\). As \(h\to0\), continuity forces both \(m_h\) and \(M_h\) to approach \(f(x)\), so the difference quotient \(\frac{A(x+h)-A(x)}{h}\) is squeezed to \(f(x)\). Steps \(h&lt;0\) are the same with the inequalities reversed.</p>
      <h3>Part 2: computing integrals</h3>
      <p><b>Theorem.</b> If \(f\) is continuous on \([a,b]\) and \(F'=f\) on \([a,b]\) (\(F\) is an <em>antiderivative</em> of \(f\)), then
      \[ \int_a^b f(x)\,dx = F(b)-F(a) = \Big[F(x)\Big]_a^b. \]
      <b>Derivation from Part 1.</b> Both \(A\) and \(F\) have derivative \(f\), so \((A-F)'=0\) on the interval. A function with zero derivative on an interval is constant (this is the one place the mean value theorem enters), so \(A(x)=F(x)+C\). Put \(x=a\): \(0=A(a)=F(a)+C\), so \(C=-F(a)\). Then
      \[ \int_a^b f(x)\,dx = A(b)=F(b)-F(a). \]
      <b>The constant cancels.</b> Any other antiderivative is \(F+K\), and \((F(b)+K)-(F(a)+K)=F(b)-F(a)\). That is why no \(+C\) is needed for a definite integral.</p>
      <h3>Worked examples</h3>
      <p>With \(F(x)=x^3/3\):
      \[ \int_1^3 x^2\,dx=\Big[\tfrac{x^3}{3}\Big]_1^3=9-\tfrac13=\tfrac{26}{3}. \]
      With \(F(x)=\sin x\), the signed area of \(\cos x\) over \([0,\pi]\) is zero, because the part above the axis cancels the part below:
      \[ \int_0^{\pi}\cos x\,dx=\sin\pi-\sin0=0, \qquad \int_{\pi/2}^{3\pi/2}\cos x\,dx=\sin\tfrac{3\pi}{2}-\sin\tfrac{\pi}{2}=-2. \]
      With \(F(x)=e^x\): \(\int_0^1 e^x\,dx=e-1\approx1.72\). Part 1 also handles functions with no elementary antiderivative: \(\frac{d}{dx}\int_0^x e^{-t^2}dt=e^{-x^2}\), and with the chain rule \(\frac{d}{dx}\int_0^{x^2}\cos t\,dt=2x\cos(x^2)\).</p>
      <h3>Jumps and corners</h3>
      <p>If \(f\) has a jump, \(A\) is still continuous, because a strip of width \(h\) has area at most \(Mh\) and that tends to \(0\). But \(A\) has a corner there. For \(f=2\) on \([0,2)\) and \(f=-1\) on \([2,4)\), we get \(A(x)=2x\) up to \(x=2\) and \(A(x)=6-x\) after it. The slope of \(A\) is \(2\) on the left and \(-1\) on the right, so \(A'(2)\) does not exist. Part 1 needs continuity of \(f\) at \(x\). If \(f\) only has a corner, \(A\) is still differentiable with \(A'=f\).</p>
      <h3>Common errors</h3>
      <p><b>Wrong order or sign.</b> It is \(F(b)-F(a)\), end minus start. Area below the axis is negative, so an integral can be negative or zero while the shaded region is not empty.</p>
      <p><b>Chasing the constant.</b> Adding \(+C\) to \(F\) changes \(F(b)\) and \(F(a)\) by the same amount, so the difference is unchanged. You need \(+C\) only for an indefinite integral.</p>
      <p><b>Integrating across a discontinuity.</b> The proof of Part 2 given here needs \(f\) continuous on all of \([a,b]\) (a continuous \(F\) with \(F'=f\) except at a few points also works, as the Steps function shows). Taking \(F(x)=-1/x\) on \([-1,1]\) for \(f=1/x^2\) gives \(F(1)-F(-1)=-2\), but \(f>0\) everywhere it is defined, so no integral over \([-1,1]\) can be negative. The function blows up at \(0\) and the theorem does not apply. For a step function, split at the jump and integrate each piece.</p>`,
    check: [
      { q: String.raw`Let \(A(x)=\int_0^x (t^2-4)\,dt\), the signed area between the graph of \(t^2-4\) and the t-axis from \(0\) to \(x\). What is \(A'(1)\)?`,
        choices: [String.raw`\(-\tfrac{11}{3}\)`, String.raw`\(3\)`, String.raw`\(-3\)`, String.raw`\(-4\)`], answer: 2,
        why: String.raw`By Part 1, \(A'(x)\) is the integrand evaluated at \(x\): \(A'(1)=1^2-4=-3\). The value \(-\tfrac{11}{3}\) is \(A(1)\), the area itself, not its slope. The slope is negative because the integrand is negative at \(t=1\), so \(A\) is falling there.`,
        hint: String.raw`The slope of the accumulation function at \(x\) is the height of the integrand at \(x\). Do not compute the area.` },
      { q: String.raw`The function \(F(x)=x^3+5\) is an antiderivative of \(f(x)=3x^2\). Using this \(F\), what is \(\int_1^2 3x^2\,dx\)?`,
        choices: ['13', '19', '12', '7'], answer: 3,
        why: String.raw`\(F(2)=8+5=13\) and \(F(1)=1+5=6\), so \(F(2)-F(1)=7\). The \(+5\) is in both values and cancels. Answer 13 forgets to subtract \(F(1)\), 19 adds instead of subtracting, and 12 adds the constant to \(F(2)\) only.`,
        hint: String.raw`Compute \(F(2)\) and \(F(1)\) separately, constant included, then subtract: end minus start.` }
    ],
    links: { prereq: ['derivatives-as-tangent-slopes', 'riemann-sums-and-the-integral'], related: ['slope-and-linear-functions', 'area-of-a-circle'] },

    mount({ stage, controls: C }) {
      const st = { x: 1, dx: .5, a: 1, b: 3 };
      const S = { mode: 'acc', fk: 'hills', fi: null, solved: false, q: null, pick: null, wrong: [], msg: '' };
      let cancel = () => {};
      stage.classList.add('split');
      const top = h('div', { class: 'pane', style: 'flex: 1 1 0' }), bot = h('div', { class: 'pane', style: 'flex: 1 1 0' });
      stage.append(top, bot);
      const P1 = new Plane(top, { span: 6 }), P2 = new Plane(bot, { span: 6 });
      const cur = () => FNS[S.fk];
      const mapOf = fn => { const [d0, d1] = fn.dom; return { xOf: nx => d0 + nx / W * (d1 - d0), d0, d1 }; };
      const range = () => { const fn = cur(), s = stats(fn); return [s.f, S.mode === 'ftc' ? s.F : s.A]; };
      const lohi = () => S.mode === 'ftc' ? [st.a, st.b] : [cur().a0, st.x];
      const atBreak = (fn, x) => fn.breaks.some(b => Math.abs(b - x) < 1e-6);

      /* ---------- top pane: f and the shaded area ---------- */
      P1.onDraw = (c, p) => {
        const fn = cur(), pal = p.pal, g = chart(p, fn, stats(fn).f, 'f(x)', pal.blue), { ux, vy } = g, M = S.mode;
        const [lo, hi] = lohi();
        shade(p, fn, lo, hi, g, .32);
        if (M === 'slope') {
          const f0 = fn.f(st.x);
          shade(p, fn, st.x, st.x + st.dx, g, .6);
          p.path([[ux(st.x), vy(0)], [ux(st.x + st.dx), vy(0)], [ux(st.x + st.dx), vy(f0)], [ux(st.x), vy(f0)]], { stroke: pal.yellow, width: 2.5, close: true, dash: [5, 4] });
          p.label('f(x)·dx', ux(st.x + st.dx / 2), vy(f0), { size: g.fs, italic: false, color: pal.text, dy: f0 >= 0 ? -16 : 16, align: st.x > fn.dom[1] - 1 ? 'right' : 'center' });
        }
        curveOf(p, fn, g, pal.blue, 3.5);
        for (const b of fn.breaks) {
          p.path([[ux(b), vy(fn.f(b - EPS))], [ux(b), vy(fn.f(b + EPS))]], { stroke: pal.muted, width: 1.5, dash: [4, 4] });
          p.dot(ux(b), vy(fn.f(b - EPS)), 5, pal.stage, pal.blue, 2.5); p.dot(ux(b), vy(fn.f(b + EPS)), 5, pal.blue, pal.stage, 1.5);
        }
        if (M === 'ftc') {
          for (const [v, nm] of [[st.a, 'a'], [st.b, 'b']]) {
            p.path([[ux(v), vy(0)], [ux(v), vy(fn.f(v))]], { stroke: pal['grid-strong'], width: 1.5, dash: [5, 5] });
            p.dot(ux(v), vy(0), 9, pal.stage, pal.brass, 3.5);
            p.label(nm, ux(v), vy(0), { size: g.fs + 3, color: pal.text, dy: fn.f(v) >= 0 ? 20 : -20 });
          }
        } else {
          p.dot(ux(fn.a0), vy(0), 5, pal.yellow, pal.stage, 1.5);
          p.label('a', ux(fn.a0), vy(0), { size: g.fs + 3, color: pal.muted, dy: -16 });
          const fv = fn.f(st.x);
          p.path([[ux(st.x), vy(0)], [ux(st.x), vy(fv)]], { stroke: pal['grid-strong'], width: 1.5, dash: [5, 5] });
          p.dot(ux(st.x), vy(fv), 9, pal.stage, pal.brass, 3.5);
          p.label('x', ux(st.x), vy(0), { size: g.fs + 3, color: pal.text, dy: fv >= 0 ? 18 : -18 });
        }
      };

      /* ---------- bottom pane ---------- */
      const cell = (i, p) => { const pad = 8, cw = (p.w - 3 * pad) / 2, ch = (p.h - 3 * pad) / 2; return { x: pad + (i % 2) * (cw + pad), y: pad + (i >> 1) * (ch + pad), w: cw, h: ch }; };
      const drawQuiz = (c, p) => {
        const fn = cur(), pal = p.pal, cands = quizCands(fn), [yl, yh] = quizRange(fn), [d0, d1] = fn.dom;
        cands.forEach((cd, i) => {
          const r = cell(i, p), isWrong = S.wrong.includes(i), isRight = S.solved && cd.kind === 'true';
          const px = v => r.x + 8 + (v - d0) / (d1 - d0) * (r.w - 16), py = v => r.y + r.h - 8 - (v - yl) / (yh - yl) * (r.h - 30);
          c.fillStyle = isRight ? alpha(pal.green, .12) : isWrong ? alpha(pal.red, .1) : 'transparent'; c.fillRect(r.x, r.y, r.w, r.h);
          c.strokeStyle = isRight ? pal.green : isWrong ? pal.red : S.pick === i ? pal.brass : pal['grid-strong']; c.lineWidth = isRight || isWrong ? 3 : 1.5;
          c.strokeRect(r.x, r.y, r.w, r.h);
          c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.beginPath(); c.moveTo(r.x + 8, py(0)); c.lineTo(r.x + r.w - 8, py(0)); c.stroke();
          c.strokeStyle = alpha(pal.green, 1); c.lineWidth = 3; c.lineJoin = 'round'; c.beginPath();
          for (let k = 0; k <= 160; k++) { const x = d0 + (d1 - d0) * k / 160, y = cd.g(x); k ? c.lineTo(px(x), py(y)) : c.moveTo(px(x), py(y)); }
          c.stroke();
          c.beginPath(); c.arc(px(st.x), py(cd.g(st.x)), 5, 0, TAU); c.fillStyle = pal.yellow; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 1.5; c.stroke();
          c.font = '600 ' + clamp(r.h * .16, 12, 15) + 'px "Hanken Grotesk", Arial, sans-serif'; c.textAlign = 'left'; c.textBaseline = 'top';
          c.fillStyle = pal.text; c.fillText('Graph ' + (i + 1), r.x + 8, r.y + 6);
        });
      };
      P2.onDraw = (c, p) => {
        if (S.mode === 'quiz') return drawQuiz(c, p);
        const fn = cur(), pal = p.pal, M = S.mode, [d0, d1] = fn.dom;
        const [, yr] = range(), g = chart(p, fn, yr, M === 'ftc' ? 'F(x)' : 'A(x)', pal.green), { ux, vy } = g;
        if (M === 'ftc') {
          for (const v of [st.a, st.b]) p.path([[ux(v), 0], [ux(v), H]], { stroke: pal['grid-strong'], width: 1.5, dash: [5, 5] });
          for (let k = 0; k < 4; k++) {
            if (k === S.fi) continue;
            fnPath(p, g, candFn(fn, k), alpha(pal.green, .4), 2, d0, d1);
          }
          for (let j = 0; j < 4; j++) {
            const k = FORD[j], gx = d0 + (d1 - d0) * (.07 + .09 * j), gf = candFn(fn, k);
            p.label(String(j + 1), ux(gx), vy(gf(gx)), { size: g.fs, italic: false, color: pal.muted, dy: -13 });
          }
          if (S.fi != null) {
            const F = candFn(fn, S.fi), Fa = F(st.a), Fb = F(st.b), col = S.fi === 3 ? pal.red : pal.green;
            fnPath(p, g, F, col, 4, d0, d1);
            p.path([[ux(st.a), vy(Fa)], [ux(st.b), vy(Fa)]], { stroke: pal.muted, width: 1.5, dash: [5, 5] });
            p.path([[ux(st.b), vy(Fa)], [ux(st.b), vy(Fb)]], { stroke: Fb >= Fa ? pal.yellow : pal.red, width: 6 });
            p.dot(ux(st.a), vy(Fa), 6, pal.green, pal.stage, 2); p.dot(ux(st.b), vy(Fb), 6, pal.green, pal.stage, 2);
            if (S.solved) {
              p.label('F(a) = ' + n2(Fa), ux(st.a), vy(Fa), { size: g.fs, italic: false, color: pal.text, dy: Fb >= Fa ? 17 : -17, align: 'right', dx: -4 });
              p.label('F(b) = ' + n2(Fb), ux(st.b), vy(Fb), { size: g.fs, italic: false, color: pal.text, dy: Fb >= Fa ? -17 : 17, align: 'right', dx: -4 });
            }
          }
          return;
        }
        const A = x => Aat(fn, fn.a0, x), x = st.x, Ax = A(x), fv = fn.f(x);
        fnPath(p, g, A, alpha(pal.green, .3), 2.5, d0, d1);
        fnPath(p, g, A, pal.green, 4.5, d0, x);
        p.path([[ux(x), 0], [ux(x), H]], { stroke: pal['grid-strong'], width: 1.5, dash: [5, 5] });
        if (M === 'slope') {
          const ext = (d1 - d0) * .17, brk = atBreak(fn, x);
          const tang = (s, xa, xb, a) => {
            let t0 = xa, t1 = xb;
            if (s > 1e-9) { t1 = Math.min(t1, x + (yr[1] - Ax) / s); t0 = Math.max(t0, x - (Ax - yr[0]) / s); }
            else if (s < -1e-9) { t1 = Math.min(t1, x + (yr[0] - Ax) / s); t0 = Math.max(t0, x + (yr[1] - Ax) / s); }
            p.path([[ux(t0), vy(Ax + s * (t0 - x))], [ux(t1), vy(Ax + s * (t1 - x))]], { stroke: alpha(pal.violet, a), width: 3 });
          };
          if (brk) { tang(fn.f(x - EPS), Math.max(d0, x - ext), x, .9); tang(fn.f(x + EPS), x, Math.min(d1, x + ext), .9); }
          else tang(fv, Math.max(d0, x - ext), Math.min(d1, x + ext), 1);
          const x2 = x + st.dx, A2 = A(x2);
          p.path([[ux(x), vy(Ax)], [ux(x2), vy(Ax)]], { stroke: pal.green, width: 3 });
          p.path([[ux(x2), vy(Ax)], [ux(x2), vy(A2)]], { stroke: pal.red, width: 3 });
          p.dot(ux(x2), vy(A2), 4.5, pal.red, pal.stage, 1.5);
          if (Math.abs(vy(A2) - vy(Ax)) * p.scale > 14) p.label('ΔA', ux(x2), (vy(Ax) + vy(A2)) / 2, { size: g.fs, italic: false, color: pal.red, align: 'left', dx: 8 });
        }
        p.dot(ux(x), vy(Ax), 8, pal.green, pal.stage, 2.5);
        p.label(n2(Ax), ux(x), vy(Ax), { size: g.fs, italic: false, color: pal.text, dy: fv >= 0 ? 17 : -17, align: x > d1 - (d1 - d0) * .2 ? 'right' : 'center', dx: x > d1 - (d1 - d0) * .2 ? -8 : 0 });
        p.dot(ux(fn.a0), vy(0), 5, pal.yellow, pal.stage, 1.5);
      };

      /* ---------- readout ---------- */
      const K = t => `<span class="k">${t}</span> `;
      const upd = () => {
        const fn = cur(), M = S.mode, x = st.x, A = Aat(fn, fn.a0, x), fv = fn.f(x);
        let s = '';
        if (M === 'acc' || M === 'quiz') {
          const verdict = Math.abs(fv) < .005 ? 'f(x) = 0, so A is level here.' : fv > 0 ? 'f(x) is positive, so A is rising.' : 'f(x) is negative, so A is falling.';
          s = K('x') + fx(fn, x) + '<br>' + K('f(x)') + n2(fv) + (atBreak(fn, x) ? ' (f jumps here)' : '') + '<br>' + K('A(x)') + n2(A) + ' (signed area from a = ' + fx(fn, fn.a0) + ')' + (M === 'acc' ? '<br>' + verdict : '');
          if (M === 'acc' && atBreak(fn, x)) s += ' A has a corner at this x.';
        } else if (M === 'slope') {
          const dA = Aat(fn, x, x + st.dx), brk = atBreak(fn, x);
          s = K('x') + fx(fn, x) + ', ' + K('dx') + n2(st.dx) + '<br>' +
            K('Strip') + 'f(x)·dx = ' + n2(fv) + ' × ' + n2(st.dx) + ' = ' + n2(fv * st.dx) + '<br>' +
            K('True change') + 'ΔA = ' + n2(dA) + '<br>' +
            K('ΔA ÷ dx') + n2(dA / st.dx) + '<br>' +
            (brk ? K('Corner') + 'A has slope ' + n2(fn.f(x - EPS)) + ' on the left and ' + n2(fn.f(x + EPS)) + ' on the right, so there is no single tangent.' : K('Height of f') + 'f(x) = ' + n2(fv) + ', the slope of the tangent to A.');
        } else {
          const ar = Aat(fn, st.a, st.b);
          s = K('a, b') + fx(fn, st.a) + ', ' + fx(fn, st.b) + '<br>';
          if (S.fi == null) s += 'Pick an antiderivative F.';
          else {
            const F = candFn(fn, S.fi);
            s += K('F(x)') + candLabel(fn, S.fi);
            if (S.solved) s += '<br>' + K('F(b) − F(a)') + n2(F(st.b)) + ' − ' + pn(F(st.a)) + ' = ' + n2(F(st.b) - F(st.a)) + '<br>' + K('Shaded area') + n2(ar);
            else if (S.fi !== 3) s += '<br>Work out F(b) − F(a).';
          }
        }
        ro.innerHTML = s + (S.msg ? '<br><br>' + S.msg : '');
      };

      /* ---------- controls ---------- */
      const probe = C.readout(), host = probe.parentElement; probe.remove();
      const setMode = m => { cancel(); if (m !== S.mode) { S.mode = m; modeChanged(); } sync(); };
      C.title('Part of the theorem');
      const mbtn = C.buttons([
        { label: '1 Accumulate', onClick: () => setMode('acc') },
        { label: '2 Slope of A', onClick: () => setMode('slope') },
        { label: '3 Which is A?', onClick: () => setMode('quiz') },
        { label: '4 F(b) − F(a)', onClick: () => setMode('ftc') }
      ]);
      const sel = C.select({ label: 'Function f', value: S.fk, options: ORDER.map(k => ({ value: k, label: FNS[k].label })),
        onChange: v => { cancel(); S.fk = v; if (S.mode === 'quiz') S.mode = 'acc'; fnChanged(); sync(); } });
      const selBox = sel.parentElement;
      const dxS = C.slider({ label: 'Strip width dx', min: .05, max: 1, step: .05, value: st.dx, format: v => v.toFixed(2),
        onInput: v => { cancel(); st.dx = v; st.x = Math.min(st.x, cur().dom[1] - v); sync(); } });
      const dxBox = host.lastElementChild;
      const mkRow = (cls, labels, onPick) => {
        const row = h('div', { class: 'ctl buttons ' + cls });
        const els = labels.map((t, i) => h('button', { type: 'button', class: 'btn', onclick: () => onPick(i) }, t)); row.append(...els); host.append(row);
        return { row, els };
      };
      const qTitle = h('p', { class: 'ctl-title' }, 'Which graph is A?'); host.append(qTitle);
      const qRow = mkRow('qrow', ['Graph 1', 'Graph 2', 'Graph 3', 'Graph 4'], i => pickGraph(i));
      const qNext = mkRow('qnext', ['Try another function'], () => { cancel(); S.fk = S.fk === 'hills' ? 'corner' : 'hills'; sel.value = S.fk; fnChanged(); sync(); });
      const fTitle = h('p', { class: 'ctl-title' }, 'Choose an antiderivative F'); host.append(fTitle);
      const fRow = mkRow('frow', ['', '', '', ''], j => pickF(FORD[j]));
      const aTitle = h('p', { class: 'ctl-title' }, 'F(b) − F(a) equals'); host.append(aTitle);
      const aRow = mkRow('arow', ['', '', '', ''], i => pickAns(i));
      const ro = C.readout();
      C.hint('Drag in either graph. In part 4, drag a and b.');

      /* ---------- state changes ---------- */
      const resetQuiz = () => { S.pick = null; S.wrong = []; S.solved = false; S.msg = ''; };
      const resetFtc = () => { S.solved = false; S.q = null; S.msg = ''; };
      const fnChanged = () => {
        const fn = cur(); resetQuiz(); S.q = null; S.fi = null;
        st.x = clamp(st.x, fn.dom[0], fn.dom[1]); if (S.mode === 'slope') st.x = Math.min(st.x, fn.dom[1] - st.dx);
        st.a = fn.ab[0]; st.b = fn.ab[1]; sel.value = S.fk;
      };
      const modeChanged = () => {
        resetQuiz(); S.q = null; S.fi = null;
        if (S.mode === 'quiz' && !QFN.includes(S.fk)) { S.fk = 'hills'; fnChanged(); }
        if (S.mode === 'slope') st.x = Math.min(st.x, cur().dom[1] - st.dx);
      };
      const buildQ = () => {
        const fn = cur(), F = candFn(fn, S.fi), Fa = F(st.a), Fb = F(st.b), ar = Aat(fn, st.a, st.b);
        const raw = [['nosub', Fb], ['flip', Fa - Fb], ['usedf', fn.f(st.b) - fn.f(st.a)], ['plus', Fb + Fa], ['off', ar + 1], ['off', ar - 1], ['off', 2 * ar]];
        const opts = [{ kind: 'right', v: ar }];
        for (const [kind, v] of raw) if (opts.length < 4 && opts.every(o => Math.abs(o.v - v) > .005)) opts.push({ kind, v });
        const r = Math.abs(Math.round(st.a * 6 + st.b * 5)) % 4 + (S.fi % 2);
        S.q = opts.map((_, i) => opts[(i + r) % 4]);
      };
      const slopeCheckMsg = () => {
        const fn = cur(), xs = [st.b, st.a, (st.a + st.b) / 2], xt = xs.reduce((m, v) => Math.abs(fn.f(v - EPS)) > Math.abs(fn.f(m - EPS)) ? v : m, xs[0]);
        const h0 = fn.f(xt - EPS);
        return 'At x = ' + fx(fn, xt) + ', f is ' + n2(h0) + ' but this curve has slope ' + n2(2 * h0) + ', twice as steep. An antiderivative must have slope exactly f. Scaling a function scales its slope too.';
      };
      const pickF = k => {
        cancel(); S.fi = k; const fn = cur(), F = candFn(fn, k), ar = Aat(fn, st.a, st.b);
        if (k === 3) { S.msg = 'This is not an antiderivative. ' + slopeCheckMsg() + (S.solved ? ' Its F(b) − F(a) is ' + n2(F(st.b) - F(st.a)) + ', which misses the shaded area ' + n2(ar) + '.' : ''); }
        else {
          if (!S.solved) buildQ();
          S.msg = S.solved
            ? 'Same answer: F(b) − F(a) = ' + n2(F(st.b) - F(st.a)) + '. ' + (k === 0 ? 'This is the plain antiderivative.' : 'The constant ' + (fn.cs[k] > 0 ? '+' : '−') + Math.abs(fn.cs[k]) + ' is in both F(b) and F(a), so it cancels.')
            : 'Good. Its slope is f, so it is an antiderivative. The four graphs in the bottom pane differ by constants, apart from the one that is scaled. Now compute F(b) − F(a).';
        }
        sync();
      };
      const pickAns = i => {
        cancel(); const o = S.q && S.q[i]; if (!o) return;
        const fn = cur(), ar = Aat(fn, st.a, st.b), neg = ar < -.005;
        if (o.kind === 'right') {
          S.solved = true;
          S.msg = 'Correct. F(b) − F(a) = ' + n2(ar) + ' matches the shaded area.' + (neg ? ' It is negative because the region lies below the axis.' : '') + ' Now pick a different F (one with another constant) and watch F(b) and F(a) both move while the difference stays put.';
        } else {
          S.msg = {
            nosub: 'That is just F(b). The area starts at a, not at 0, so subtract the value of F at the start: F(b) − F(a).',
            flip: 'Right size, wrong sign. The order is end minus start: F(b) − F(a).' + (neg ? ' Here f lies mostly below the axis, so the area is negative.' : ''),
            usedf: 'You subtracted heights of f. The theorem subtracts heights of F, the antiderivative.',
            plus: 'You added. The area is the change in F from a to b, so subtract: F(b) − F(a).',
            off: 'Not this one. Work out F(b), then F(a), then subtract.'
          }[o.kind];
        }
        sync();
      };
      const pickGraph = i => {
        cancel(); const fn = cur(), cd = quizCands(fn)[i], z = fn.zeros, s0 = fn.f(.05) > 0, zs = z.map(n2).join(' and ');
        S.pick = i;
        if (cd.kind === 'true') {
          S.solved = true;
          S.msg = 'Correct. A starts at 0, falls where f is negative, rises where f is positive, and turns around at x = ' + zs + ', where f is zero.';
        } else {
          if (!S.wrong.includes(i)) S.wrong.push(i);
          S.msg = {
            neg: 'This graph is upside down. f is ' + (s0 ? 'positive' : 'negative') + ' from x = 0 to x = ' + n2(z[0]) + ', so A must ' + (s0 ? 'rise' : 'fall') + ' there. This graph does the opposite. Check where f is positive.',
            f: 'This is the graph of f itself. A must start at 0, because the area from a to a is 0. A also turns around where f is zero (x = ' + zs + '), not where f has its own peaks and dips.',
            shift: 'The shape is right but the start is wrong. A(a) is the area from a to a, which is 0, so A must start at height 0. This graph starts at ' + n2(QSHIFT[fn.key]) + '.'
          }[cd.kind];
        }
        sync();
      };

      /* ---------- sync ---------- */
      const sync = () => {
        const fn = cur(), M = S.mode;
        mbtn.forEach((b, i) => b.classList.toggle('primary', ['acc', 'slope', 'quiz', 'ftc'][i] === M));
        selBox.style.display = M === 'quiz' ? 'none' : '';
        dxBox.style.display = M === 'slope' ? '' : 'none';
        qTitle.style.display = qRow.row.style.display = qNext.row.style.display = M === 'quiz' ? '' : 'none';
        fTitle.style.display = fRow.row.style.display = M === 'ftc' ? '' : 'none';
        const showA = M === 'ftc' && S.fi != null && S.fi !== 3 && S.q;
        aTitle.style.display = aRow.row.style.display = showA ? '' : 'none';
        dxS.set(st.dx);
        qRow.els.forEach((b, i) => { b.disabled = S.solved; b.classList.toggle('primary', S.pick === i); });
        fRow.els.forEach((b, j) => { const k = FORD[j]; b.textContent = (j + 1) + ': ' + candLabel(fn, k); b.classList.toggle('primary', S.fi === k); });
        if (showA) aRow.els.forEach((b, i) => { b.textContent = n2(S.q[i].v); b.disabled = S.solved; });
        P1.draw(); P2.draw(); upd();
      };
      const fixup = () => {
        const fn = cur(), [d0, d1] = fn.dom;
        st.x = clamp(st.x, d0, S.mode === 'slope' ? d1 - st.dx : d1);
        st.a = clamp(st.a, d0, d1 - fn.sab); st.b = clamp(st.b, st.a + fn.sab, d1);
      };

      /* ---------- dragging ---------- */
      const dragX = (nx) => {
        const fn = cur(), m = mapOf(fn), x = m.xOf(nx);
        if (S.mode === 'ftc') return null;
        st.x = clamp(snap(x, fn.snap), fn.dom[0], S.mode === 'slope' ? fn.dom[1] - st.dx : fn.dom[1]);
        return true;
      };
      const dragAB = (hd, nx) => {
        const fn = cur(), x = snap(mapOf(fn).xOf(nx), fn.sab), [d0, d1] = fn.dom;
        const na = hd === 'a' ? clamp(x, d0, st.b - fn.sab) : st.a, nb = hd === 'b' ? clamp(x, st.a + fn.sab, d1) : st.b;
        if (na !== st.a || nb !== st.b) { st.a = na; st.b = nb; resetFtc(); if (S.fi != null && S.fi !== 3) { buildQ(); } }
      };
      const hitTop = (px, py) => {
        if (S.mode !== 'ftc') return 'x';
        const x = mapOf(cur()).xOf(P1.toMath(px, py)[0]);
        return Math.abs(x - st.a) < Math.abs(x - st.b) ? 'a' : 'b';
      };
      draggable(P1, {
        hit: hitTop,
        move: (hd, nx) => { cancel(); if (hd === 'x') dragX(nx); else dragAB(hd, nx); sync(); }
      });
      draggable(P2, {
        hit: (px, py) => {
          if (S.mode === 'quiz') { for (let i = 0; i < 4; i++) { const r = cell(i, P2); if (!S.solved && px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return 'q' + i; } return null; }
          return S.mode === 'ftc' ? hitTop(px, py) : 'x';
        },
        move: (hd, nx) => {
          cancel();
          if (hd[0] === 'q') { const i = +hd[1]; if (S.pick !== i) pickGraph(i); return; }
          if (hd === 'x') dragX(nx); else dragAB(hd, nx); sync();
        }
      });

      /* ---------- steps ---------- */
      const apply = (patch, immediate) => {
        cancel();
        const { mode, fk, fi, ...rest } = patch;
        const accLike = m => m === 'acc' || m === 'slope', fkNew = fk !== undefined && fk !== S.fk;
        const ctxChanged = (mode !== undefined && mode !== S.mode) || fkNew;
        const anim = !fkNew && accLike(S.mode) && (mode === undefined || accLike(mode));
        if (mode !== undefined) S.mode = mode;
        if (fk !== undefined && fk !== S.fk) { S.fk = fk; sel.value = fk; }
        if (ctxChanged) { resetQuiz(); S.q = null; S.fi = null; }
        if (fi !== undefined) S.fi = fi;
        if (ctxChanged && S.mode === 'ftc') { st.a = cur().ab[0]; st.b = cur().ab[1]; }
        if (immediate || !anim || !Object.keys(rest).length) { Object.assign(st, rest); fixup(); sync(); }
        else cancel = animateTo(st, rest, 700, () => { fixup(); sync(); });
      };
      modeChanged(); fnChanged(); st.x = 1; sync();
      return { destroy: () => { cancel(); P1.destroy(); P2.destroy(); }, apply };
    }
  });
}
