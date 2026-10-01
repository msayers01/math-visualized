/* =====================================================================
   SCHOOL — Quadratics and the parabola
   ===================================================================== */
register({
  id: 'quadratics-and-the-parabola', level: 'school',
  title: 'Quadratics and the parabola',
  blurb: 'Move the vertex, stretch the curve, and find exactly where it crosses the x-axis.',
  thumb(c, p) {
    const pal = p.pal; p.cx = 0; p.cy = -1; p.span = 4.2;
    p.grid(1);
    const pts = []; for (let x = -4; x <= 4.001; x += .1) pts.push([x, .5 * x * x - 3]);
    p.curve(pts, { stroke: pal.blue, width: 2.6 });
    p.dot(-Math.sqrt(6), 0, 4.5, pal.green, pal.stage, 1.5); p.dot(Math.sqrt(6), 0, 4.5, pal.green, pal.stage, 1.5);
    p.dot(0, -3, 5, pal.yellow, pal.stage, 1.5);
  },
  hook: String.raw`Throw a ball and its path bends into a curve. Why is it always the same kind of curve, and how do we find where it lands?`,
  steps: [
    { title: 'Start with y = x²',
      text: String.raw`<p>Plug in \(x=1,2,3\) and you get \(1,4,9\). Plug in \(-1,-2,-3\) and you get the same values.</p><p>So the curve is a mirror image of itself across the y-axis. It bottoms out at the <b>vertex</b>, the point \((0,0)\).</p>`,
      set: { a: 1, h: 0, k: 0 } },
    { title: 'Move the vertex',
      text: String.raw`<p>In \(y=a(x-h)^2+k\), the vertex is \((h,k)\). Here \(h=2\) and \(k=-4\).</p><p>Drag the vertex. Notice the dashed axis of symmetry always passes straight through it.</p>`,
      set: { a: 1, h: 2, k: -4 } },
    { title: 'Stretch and flip',
      text: String.raw`<p>Drag the ring one step right of the vertex, or use <b>a</b>. It sits exactly \(a\) above the vertex.</p><p>Bigger \(|a|\) makes a narrower curve. Negative \(a\) flips it to open downward, like a thrown ball. Here \(a=-1\).</p>`,
      set: { a: -1, h: 2, k: 4 } },
    { title: 'Where it crosses zero',
      text: String.raw`<p>The green dots are the <b>zeros</b>: where \(y=0\). With \(a=1,h=2,k=-4\) they are \(x=0\) and \(x=4\).</p><p>Drag the vertex up until the dots merge into one, then higher: the zeros disappear.</p>`,
      set: { a: 1, h: 2, k: -4 } }
  ],
  formal: String.raw`
    <p>A <em>quadratic function</em> has the form
    \[ y = ax^2 + bx + c \qquad (a\neq 0), \]
    and its graph is a <em>parabola</em>.</p>
    <h3>Vertex form</h3>
    <p>Every quadratic can be written
    \[ y = a(x-h)^2 + k. \]
    The vertex is \((h,k)\) and the axis of symmetry is \(x=h\). The graph opens up if \(a>0\) and down if \(a<0\).
    Completing the square turns \(ax^2+bx+c\) into this form with
    \[ h = -\frac{b}{2a}, \qquad k = c - \frac{b^2}{4a}. \]</p>
    <h3>Zeros</h3>
    <p>Setting \(a(x-h)^2+k=0\) gives \((x-h)^2 = -k/a\), so
    \[ x = h \pm \sqrt{-k/a}. \]
    In standard form this is the quadratic formula
    \[ x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}. \]
    The quantity \(b^2-4ac\) is the <em>discriminant</em>: positive gives two zeros, zero gives one (the vertex sits on the x-axis), negative gives none.</p>
    <h3>Why a ball follows a parabola</h3>
    <p>Gravity changes vertical speed at a steady rate, so height grows like \(-\tfrac12 g t^2\) plus a linear term. That is a quadratic in \(t\).</p>`,
  check: [
    { q: String.raw`What is the vertex of \(y=(x-3)^2+2\)?`,
      choices: ['(−3, 2)', '(3, 2)', '(3, −2)', '(−3, −2)'], answer: 1,
      why: String.raw`Compare with \(y=a(x-h)^2+k\): \(h=3\) and \(k=2\), so the vertex is \((3,2)\). The sign inside the bracket is opposite to \(h\).`,
      hint: String.raw`Write it as \((x-h)^2\) and read off \(h\). Then \(k\) is the number added outside.` },
    { q: String.raw`Where does \(y=x^2-6x+5\) cross the x-axis?`,
      choices: ['x = 1 and x = 5', 'x = −1 and x = −5', 'x = 2 and x = 3', 'x = 6 and x = 5'], answer: 0,
      why: String.raw`Factor: \(x^2-6x+5=(x-1)(x-5)\), which is zero at \(x=1\) and \(x=5\). The quadratic formula gives the same.`,
      hint: String.raw`Find two numbers that multiply to \(5\) and add to \(-6\).` }
  ],
  links: { prereq: ['slope-and-linear-functions', 'functions-as-transformations'], next: ['exponential-growth'], related: ['derivatives-as-tangent-slopes'] },

  mount({ stage, controls: C }) {
    const st = { a: 1, h: 0, k: 0 };
    let cancel = () => {};
    const P = new Plane(stage, { cx: 0, cy: 1, span: 6.5 });
    const f = x => st.a * (x - st.h) * (x - st.h) + st.k;
    const zeros = () => {
      if (Math.abs(st.a) < .005) return [];  /* a passes through 0 while a step animates */
      if (Math.abs(st.k) < .005) return [st.h];
      const q = -st.k / st.a;
      return q < 0 ? [] : [st.h - Math.sqrt(q), st.h + Math.sqrt(q)];
    };
    const term = (v, pow, first) => {
      if (Math.abs(v) < .005) return '';
      const sgn = v < 0 ? (first ? '−' : ' − ') : (first ? '' : ' + '), mag = Math.abs(v);
      const coef = pow && Math.abs(mag - 1) < .005 ? '' : num(mag);
      return sgn + coef + (pow === 2 ? 'x²' : pow === 1 ? 'x' : '');
    };
    const vertexStr = () => {
      const { a, h, k } = st, inner = Math.abs(h) < .005 ? 'x' : 'x ' + (h < 0 ? '+ ' : '− ') + num(Math.abs(h));
      const co = Math.abs(a - 1) < .005 ? '' : Math.abs(a + 1) < .005 ? '−' : num(a);
      const sq = Math.abs(h) < .005 ? `${co}x²` : `${co}(${inner})²`;
      return 'y = ' + sq + (Math.abs(k) < .005 ? '' : (k < 0 ? ' − ' : ' + ') + num(Math.abs(k)));
    };
    const stdStr = () => {
      const { a, h, k } = st, b = -2 * a * h, c = a * h * h + k;
      const s = term(a, 2, true) + term(b, 1, false) + term(c, 0, false);
      return 'y = ' + s;
    };

    P.onDraw = (c, p) => {
      const pal = p.pal, bd = p.bounds(), { a, h, k } = st;
      p.grid(1); p.ticks(1);
      p.path([[h, bd.y0], [h, bd.y1]], { stroke: alpha(pal.violet, .8), width: 1.8, dash: [8, 7] });
      p.path([[h, k], [h + 1, k], [h + 1, k + a]], { stroke: pal['grid-strong'], width: 1.8, dash: [4, 5] });
      const pts = []; for (let i = 0; i <= 260; i++) { const x = bd.x0 + (bd.x1 - bd.x0) * i / 260; pts.push([x, f(x)]); }
      p.curve(pts, { stroke: pal.blue, width: 3.5 });
      for (const z of zeros()) p.dot(z, 0, 7, pal.green, pal.stage, 2.5);
      p.label(`(${num(h)}, ${num(k)})`, h, k, { size: 19, italic: false, dy: a > 0 ? 26 : -26 });
      p.dot(h, k, 8, pal.yellow, pal.brass, 3); p.dot(h + 1, k + a, 8, pal.stage, pal.brass, 3);
    };

    const upd = () => {
      const z = zeros();
      ro.innerHTML = `<span class="k">Vertex form</span> ${vertexStr()}<br><span class="k">Standard form</span> ${stdStr()}<br>` +
        `<span class="k">Vertex</span> (${num(st.h)}, ${num(st.k)}) &nbsp; <span class="k">axis</span> x = ${num(st.h)}<br>` +
        `<span class="k">Zeros</span> ` + (z.length === 2 ? `x = ${num(z[0])}, ${num(z[1])}` : z.length === 1 ? `x = ${num(z[0])} (one)` : 'none: the curve never reaches the x-axis');
    };
    const sync = () => { aS.set(st.a); hS.set(st.h); kS.set(st.k); P.draw(); upd(); };
    const edit = key => v => { cancel(); st[key] = key === 'a' && Math.abs(v) < .01 ? .25 : v; P.requestDraw(); upd(); };

    C.title('y = a(x − h)² + k');
    const aS = C.slider({ label: 'a (stretch, flip)', min: -3, max: 3, step: .25, value: st.a, onInput: edit('a') });
    const hS = C.slider({ label: 'h (vertex x)', min: -4, max: 4, step: .5, value: st.h, onInput: edit('h') });
    const kS = C.slider({ label: 'k (vertex y)', min: -5, max: 5, step: .5, value: st.k, onInput: edit('k') });
    const ro = C.readout(); upd();
    C.hint('Drag the yellow vertex, or the ring one step to its right.');

    draggable(P, {
      hit: (px, py) => near(P, st.h + 1, st.k + st.a, px, py) ? 'a' : near(P, st.h, st.k, px, py) ? 'v' : null,
      move: (hd, x, y) => {
        cancel();
        if (hd === 'v') { st.h = clamp(snap(x, .5), -4, 4); st.k = clamp(snap(y, .5), -5, 5); }
        else { const a = clamp(snap(y - st.k, .25), -3, 3); st.a = Math.abs(a) < .01 ? (y - st.k < 0 ? -.25 : .25) : a; }
        sync();
      }
    });

    const apply = (patch, immediate) => {
      cancel();
      if (immediate) { Object.assign(st, patch); sync(); } else cancel = animateTo(st, patch, 900, sync);
    };
    return { destroy: () => { cancel(); P.destroy(); }, apply };
  }
});
