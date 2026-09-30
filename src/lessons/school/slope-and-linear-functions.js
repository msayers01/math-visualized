/* =====================================================================
   SCHOOL — Slope and linear functions
   ===================================================================== */
register({
  id: 'slope-and-linear-functions', level: 'school',
  title: 'Slope and linear functions',
  blurb: 'Tilt a line, slide a triangle along it, and see why rise over run never changes.',
  thumb(c, p) {
    const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 3.4;
    p.grid(1);
    p.path([[-4, -2.5], [4, 3.5]], { stroke: pal.blue, width: 2.5 });
    p.path([[-2, -1], [1, -1], [1, 1.25]], { fill: alpha(pal.yellow, .22), close: true });
    p.path([[-2, -1], [1, -1]], { stroke: pal.green, width: 2.5 });
    p.path([[1, -1], [1, 1.25]], { stroke: pal.red, width: 2.5 });
  },
  hook: String.raw`Take one step to the right along a straight line. Why does the height always change by the same amount, wherever you start?`,
  steps: [
    { title: 'Rise over run',
      text: String.raw`<p>The <b>green</b> leg is the <b>run</b>: how far right we move. The <b>red</b> leg is the <b>rise</b>: how far up the line goes over that run.</p><p>The slope is rise ÷ run. Here it is \(3 \div 2 = 1.5\).</p>`,
      set: { m: 1.5, b: 1, x0: -3, run: 2 } },
    { title: 'Slide the triangle',
      text: String.raw`<p>Drag the triangle's left corner along the line. The triangle moves, but its shape does not change.</p><p>Rise ÷ run is the same everywhere. That is exactly what "straight" means.</p>`,
      set: { m: 1.5, b: 1, x0: 1, run: 2 } },
    { title: 'Tilt the line',
      text: String.raw`<p>Drag the triangle's upper corner up or down, or use <b>Slope</b>.</p><p>Positive slope climbs to the right. Negative slope falls. Slope \(0\) is perfectly flat. Here the slope is \(-1.5\).</p>`,
      set: { m: -1.5, b: 1, x0: 1, run: 2 } },
    { title: 'Move the intercept',
      text: String.raw`<p>The yellow point is where the line crosses the y-axis: the height when \(x=0\). Call it \(b\).</p><p>Drag it, or use <b>Intercept</b>. The whole line slides up or down and its slope stays put.</p>`,
      set: { m: .5, b: -2, x0: -2, run: 4 } }
  ],
  formal: String.raw`
    <p><b>Definition.</b> A <em>linear function</em> has the form
    \[ y = mx + b, \]
    where \(m\) is the <em>slope</em> and \(b\) is the <em>y-intercept</em>: the value at \(x=0\).</p>
    <h3>Slope from two points</h3>
    <p>For two points \((x_1,y_1)\) and \((x_2,y_2)\) on a non-vertical line,
    \[ m = \frac{y_2-y_1}{x_2-x_1} = \frac{\text{rise}}{\text{run}}. \]</p>
    <h3>Why the ratio never changes</h3>
    <p>Start anywhere at \(x\) and step right by \(h\). The height changes by
    \[ \big(m(x+h)+b\big) - \big(mx+b\big) = mh, \]
    which does not depend on \(x\). So rise \(\div\) run \(= mh/h = m\) for every triangle you can draw on the line.</p>
    <h3>Finding the equation</h3>
    <p>Through \((1,2)\) and \((3,8)\): the slope is \(\frac{8-2}{3-1}=3\). Put the point \((1,2)\) into \(y=3x+b\) to get \(2=3+b\), so \(b=-1\) and \(y=3x-1\).</p>
    <h3>Slope as a rate</h3>
    <p>In real problems \(m\) is a rate of change: units of \(y\) per one unit of \(x\), such as dollars per hour or meters per second. The intercept \(b\) is the starting amount.</p>`,
  check: [
    { q: String.raw`A line passes through \((1,2)\) and \((3,8)\). What is its slope?`,
      choices: ['1/3', '2', '3', '6'], answer: 2,
      why: String.raw`Rise \(=8-2=6\) and run \(=3-1=2\), so the slope is \(6/2=3\).`,
      hint: String.raw`Slope is rise divided by run, not the other way around.` },
    { q: String.raw`Which statement is true about \(y=-2x+5\)?`,
      choices: ['It falls to the right and crosses the y-axis at 5', 'It rises to the right and crosses the y-axis at 5',
                'It falls to the right and crosses the y-axis at −2', 'It rises to the right and crosses the y-axis at −2'], answer: 0,
      why: String.raw`The slope \(m=-2\) is negative, so the line falls. The intercept \(b=5\) is the height at \(x=0\).`,
      hint: String.raw`Compare with \(y=mx+b\): which number is \(m\), and which is \(b\)?` }
  ],
  links: { next: ['systems-of-equations', 'functions-as-transformations'], related: ['derivatives-as-tangent-slopes', 'pythagorean-theorem'] },

  mount({ stage, controls: C }) {
    const st = { m: 1.5, b: 1, x0: -3, run: 2 };
    let cancel = () => {}, showRR = true;
    const P = new Plane(stage, { span: 6 });
    const yAt = x => st.m * x + st.b;

    P.onDraw = (c, p) => {
      const pal = p.pal, bd = p.bounds(), { x0, run } = st, x1 = x0 + run, y0 = yAt(x0), y1 = yAt(x1);
      p.grid(1); p.ticks(1);
      p.path([[bd.x0, yAt(bd.x0)], [bd.x1, yAt(bd.x1)]], { stroke: pal.blue, width: 3.5 });
      if (showRR) {
        const off = 18 / p.scale;
        p.path([[x0, y0], [x1, y0], [x1, y1]], { fill: alpha(pal.yellow, .2), close: true });
        p.path([[x0, y0], [x1, y0]], { stroke: pal.green, width: 4 });
        p.path([[x1, y0], [x1, y1]], { stroke: pal.red, width: 4 });
        p.label('run = ' + num(run), (x0 + x1) / 2, y0 + (y1 >= y0 ? -off : off), { size: 19, italic: false, color: pal.green });
        p.label('rise = ' + num(y1 - y0), x1 + off * .7, (y0 + y1) / 2, { size: 19, italic: false, color: pal.red, align: 'left' });
      }
      p.dot(0, st.b, 8, pal.yellow, pal.brass, 3);
      p.label('b = ' + num(st.b), 0, st.b, { size: 19, italic: false, align: 'left', dx: 14, dy: -16 });
      if (showRR) { p.dot(x0, y0, 8, pal.stage, pal.brass, 3); p.dot(x1, y1, 8, pal.stage, pal.brass, 3); }
    };

    const upd = () => {
      const { m, b, x0, run } = st, rise = yAt(x0 + run) - yAt(x0);
      ro.innerHTML = `<span class="k">Line</span> ${linEq(m, b)}<br>
        <span class="k">Slope</span> rise ÷ run = ${num(rise)} ÷ ${num(run)} = ${num(rise / run)}<br>
        <span class="k">Intercept</span> b = ${num(b)}`;
    };
    const sync = () => { mS.set(st.m); bS.set(st.b); rS.set(st.run); P.draw(); upd(); };
    const edit = fn => v => { cancel(); fn(v); sync(); };

    C.title('Line');
    const mS = C.slider({ label: 'Slope m', min: -4, max: 4, step: .25, value: st.m, onInput: edit(v => { st.m = v; }) });
    const bS = C.slider({ label: 'Intercept b', min: -6, max: 6, step: .25, value: st.b, onInput: edit(v => { st.b = v; }) });
    C.title('Triangle');
    const rS = C.slider({ label: 'Run', min: 1, max: 4, step: 1, value: st.run, format: v => String(v),
      onInput: edit(v => { st.run = v; st.x0 = clamp(st.x0, -5, 5 - v); }) });
    C.toggle({ label: 'Show rise and run', value: true, onChange: v => { showRR = v; P.draw(); } });
    const ro = C.readout(); upd();
    C.hint('Drag the yellow point, the triangle corners, or use the sliders.');

    draggable(P, {
      hit: (px, py) => showRR && near(P, st.x0 + st.run, yAt(st.x0 + st.run), px, py) ? 'tip'
        : showRR && near(P, st.x0, yAt(st.x0), px, py) ? 'start'
        : near(P, 0, st.b, px, py) ? 'int' : null,
      move: (hd, x, y) => {
        cancel();
        if (hd === 'int') st.b = clamp(snap(y, .25), -6, 6);
        else if (hd === 'start') st.x0 = clamp(snap(x, 1), -5, 5 - st.run);
        else {  /* tilt the line about the triangle's left corner */
          const y0 = yAt(st.x0), m = clamp(snap((y - y0) / st.run, .25), -4, 4), b = y0 - m * st.x0;
          if (Math.abs(b) <= 6) { st.m = m; st.b = b; }
        }
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
