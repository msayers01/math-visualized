/* =====================================================================
   SCHOOL — Functions as transformations
   ===================================================================== */
{
  const FN = {
    abs:  { label: '|x|',   f: Math.abs,           wrap: v => `|${v}|` },
    sq:   { label: 'x²',    f: x => x * x,         wrap: v => v === 'x' ? 'x²' : `(${v})²` },
    cube: { label: 'x³',    f: x => x * x * x,     wrap: v => v === 'x' ? 'x³' : `(${v})³` },
    sqrt: { label: '√x',    f: Math.sqrt,          wrap: v => `√(${v})` },
    sin:  { label: 'sin x', f: Math.sin,           wrap: v => `sin(${v})` }
  };

  register({
    id: 'functions-as-transformations', level: 'school',
    title: 'Functions as transformations',
    blurb: 'Shift, stretch, squeeze and flip a graph, and follow one point as it moves.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 1; p.span = 4;
      p.grid(1);
      const A = [], B = [];
      for (let x = -4.5; x <= 4.5; x += .1) { A.push([x, Math.abs(x)]); B.push([x, -Math.abs(x - 1) + 3]); }
      p.curve(A, { stroke: pal['grid-strong'], width: 2.4 });
      p.curve(B, { stroke: pal.blue, width: 2.8 });
      p.dot(0, 0, 4.5, pal.stage, pal.brass, 2); p.dot(1, 3, 4.5, pal.red, pal.stage, 1.5);
    },
    hook: String.raw`Every graph you will meet is a copy of a simpler one that has been moved, stretched or flipped. Can you tell which moves, just from the formula?`,
    steps: [
      { title: 'Two graphs, one tracked point',
        text: String.raw`<p>The grey curve is the base function \(f\). The blue curve is the transformed one, \(g\). Right now they are the same.</p><p>The ringed point \(P\) sits on \(f\). Its red twin \(P'\) shows where \(P\) lands on \(g\). Drag \(P\) along the curve.</p>`,
        set: { fn: 'abs', a: 1, b: 1, h: 0, k: 0, xp: 1 } },
      { title: 'Shift: h and k',
        text: String.raw`<p>Here \(g(x)=f(x-2)+1\). The \(+1\) outside lifts every point up by \(1\).</p><p>The \(-2\) inside moves the graph <em>right</em> by \(2\), the opposite of what the sign suggests. \(g\) needs \(x-2\) to equal the old \(x\), so it must go \(2\) further.</p>`,
        set: { fn: 'abs', a: 1, b: 1, h: 2, k: 1, xp: 1 } },
      { title: 'Stretch and flip: a',
        text: String.raw`<p>Now \(g(x)=-2f(x-2)+1\). Every height is multiplied by \(-2\): twice as tall, and the minus sign flips the graph over.</p><p>Watch \(P'\): its height is \(-2\) times the height of \(P\), then \(+1\).</p>`,
        set: { fn: 'abs', a: -2, b: 1, h: 2, k: 1, xp: 1 } },
      { title: 'Squeeze: b',
        text: String.raw`<p>The base is now \(\sin x\), with \(b=2\). So \(g(x)=\sin(2x)\): the wave repeats twice as fast.</p><p>A number inside <em>divides</em> every x-coordinate: \(P'\) sits at half the distance from the y-axis.</p>`,
        set: { fn: 'sin', a: 1, b: 2, h: 0, k: 0, xp: 1 } }
    ],
    formal: String.raw`
      <p>Start from any function \(f\). The transformed function is
      \[ g(x) = a\,f\big(b\,(x-h)\big) + k. \]</p>
      <h3>What each number does</h3>
      <p>
      <b>\(k\)</b> shifts the graph up (down if negative).<br>
      <b>\(h\)</b> shifts it right (left if negative).<br>
      <b>\(a\)</b> stretches it vertically by \(|a|\), and flips it over the x-axis if \(a<0\).<br>
      <b>\(b\)</b> squeezes it horizontally by \(1/|b|\), and flips it over the y-axis if \(b<0\).</p>
      <h3>Following one point</h3>
      <p>If \((x,y)\) is on the graph of \(f\), then \(g\) is at height \(a y + k\) when \(x\) is replaced by \(h + x/b\), because
      \[ g\!\left(h+\tfrac{x}{b}\right) = a\,f(x) + k = a y + k. \]
      So \((x,y)\mapsto\left(h+\tfrac{x}{b},\; a y+k\right)\). Changes to the output (\(a\), \(k\)) act the way they look. Changes to the input (\(b\), \(h\)) act in reverse.</p>
      <h3>You have seen this before</h3>
      <p>The vertex form \(y=a(x-h)^2+k\) is just \(f(x)=x^2\) moved to the vertex \((h,k)\) and stretched by \(a\).</p>`,
    check: [
      { q: String.raw`How does the graph of \(y=f(x+3)-2\) compare with the graph of \(y=f(x)\)?`,
        choices: ['Left 3, down 2', 'Right 3, down 2', 'Left 3, up 2', 'Right 3, up 2'], answer: 0,
        why: String.raw`The \(-2\) outside moves it down \(2\). The \(+3\) inside works in reverse: \(x+3\) reaches the old value \(3\) units sooner, so the graph moves left \(3\).`,
        hint: String.raw`Outside changes act as they look. Inside changes act in reverse.` },
      { q: 'Which function is the graph of f squeezed horizontally to half its width?',
        choices: ['y = f(x/2)', 'y = f(2x)', 'y = 2f(x)', 'y = f(x)/2'], answer: 1,
        why: String.raw`In \(f(2x)\) the input is doubled, so every feature of the graph happens at half the original \(x\). Compare \(P'\) in the last step.`,
        hint: 'A number multiplying x inside the brackets divides every x-coordinate.' }
    ],
    links: { prereq: ['slope-and-linear-functions'], next: ['quadratics-and-the-parabola'], related: ['the-unit-circle-and-trig-waves', 'exponential-growth'] },

    mount({ stage, controls: C }) {
      const st = { fn: 'abs', a: 1, b: 1, h: 0, k: 0, xp: 1 };
      let cancel = () => {};
      const P = new Plane(stage, { span: 6 });
      const F = () => FN[st.fn].f;
      const g = x => st.a * F()(st.b * (x - st.h)) + st.k;
      const z = v => Math.abs(v) < .005;

      const eqStr = () => {
        const { a, b, h, k } = st, hs = z(h) ? '' : ` ${h < 0 ? '+' : '−'} ${num(Math.abs(h))}`;
        const bs = z(b - 1) ? '' : z(b + 1) ? '−' : num(b);
        const inner = bs === '' ? (hs ? 'x' + hs : 'x') : hs ? `${bs}(x${hs})` : `${bs}x`;
        const pre = z(a - 1) ? '' : z(a + 1) ? '−' : num(a);
        return 'y = ' + pre + FN[st.fn].wrap(inner) + (z(k) ? '' : (k < 0 ? ' − ' : ' + ') + num(Math.abs(k)));
      };

      P.onDraw = (c, p) => {
        const pal = p.pal, bd = p.bounds(), f = F(), base = [], img = [], n = 320;
        p.grid(1); p.ticks(1);
        for (let i = 0; i <= n; i++) { const x = bd.x0 + (bd.x1 - bd.x0) * i / n; base.push([x, f(x)]); img.push([x, g(x)]); }
        p.curve(base, { stroke: pal['grid-strong'], width: 3 });
        p.curve(img, { stroke: pal.blue, width: 3.5 });
        const y = f(st.xp);
        if (isFinite(y) && Math.abs(st.b) > .01) {
          const qx = st.h + st.xp / st.b, qy = st.a * y + st.k;
          p.path([[st.xp, y], [qx, qy]], { stroke: alpha(pal.red, .8), width: 2, dash: [6, 6] });
          p.dot(qx, qy, 8, pal.red, pal.stage, 2.5);
          p.label('P′', qx, qy, { size: 20, color: pal.red, dx: 16, dy: -14 });
        }
        if (isFinite(y)) {
          p.dot(st.xp, y, 8, pal.stage, pal.brass, 3);
          p.label('P', st.xp, y, { size: 20, dx: -16, dy: -14 });
        }
      };

      const upd = () => {
        const y = F()(st.xp);
        let pt = '';
        if (isFinite(y) && Math.abs(st.b) > .01)
          pt = `<br><span class="k">P</span> (${num(st.xp)}, ${num(y)}) <span class="k">→ P′</span> (${num(st.h + st.xp / st.b)}, ${num(st.a * y + st.k)})`;
        ro.innerHTML = `<span class="k">g</span> ${eqStr()}${pt}`;
      };
      const sync = () => { [aS, bS, hS, kS].forEach((s, i) => s.set(st['abhk'[i]])); P.draw(); upd(); };
      const edit = key => v => { cancel(); st[key] = v; P.requestDraw(); upd(); };

      const sel = C.select({ label: 'Base function f', value: st.fn, options: Object.entries(FN).map(([value, o]) => ({ value, label: 'f(x) = ' + o.label })),
        onChange: v => { cancel(); st.fn = v; st.xp = 1; sync(); } });
      C.title('g(x) = a·f(b(x − h)) + k');
      const hS = C.slider({ label: 'h  (shift right)', min: -4, max: 4, step: .5, value: st.h, onInput: edit('h') });
      const kS = C.slider({ label: 'k  (shift up)', min: -4, max: 4, step: .5, value: st.k, onInput: edit('k') });
      const aS = C.slider({ label: 'a  (stretch, flip)', min: -3, max: 3, step: .25, value: st.a, onInput: edit('a') });
      const bS = C.slider({ label: 'b  (squeeze, flip)', min: -3, max: 3, step: .25, value: st.b, onInput: edit('b') });
      C.buttons([{ label: 'Reset transformation', onClick: () => { cancel(); Object.assign(st, { a: 1, b: 1, h: 0, k: 0 }); sync(); } }]);
      const ro = C.readout(); upd();
      C.hint('Drag P along the grey curve to see where it lands.');

      draggable(P, {
        hit: (px, py) => { const y = F()(st.xp); return isFinite(y) && near(P, st.xp, y, px, py) ? 'p' : null; },
        move: (_, x) => { cancel(); const v = clamp(snap(x, .25), -5, 5); if (isFinite(F()(v))) { st.xp = v; P.requestDraw(); upd(); } }
      });

      const apply = (patch, immediate) => {
        cancel();
        const { fn, ...rest } = patch;
        if (fn !== undefined) { st.fn = fn; sel.value = fn; }
        if (immediate) { Object.assign(st, rest); sync(); } else cancel = animateTo(st, rest, 900, sync);
      };
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
