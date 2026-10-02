/* =====================================================================
   SCHOOL — Systems of equations
   ===================================================================== */
register({
  id: 'systems-of-equations', level: 'school',
  title: 'Systems of equations',
  blurb: 'Two lines, one crossing point: move them and see when they meet once, never, or always.',
  thumb(c, p) {
    const pal = p.pal; p.cx = 3; p.cy = 5; p.span = 5.4;
    p.grid(1);
    p.path([[-3, -1], [9, 11]], { stroke: pal.blue, width: 2.5 });
    p.path([[-3, 3.5], [9, 9.5]], { stroke: pal.red, width: 2.5 });
    p.dot(6, 8, 6, pal.violet, pal.stage, 2);
  },
  hook: String.raw`Plan A costs $2 to join plus $1 a day. Plan B costs $5 to join plus $0.50 a day. When do they cost the same?`,
  steps: [
    { title: 'Two plans, two lines',
      text: String.raw`<p>The <b>blue</b> line is plan A: \(y=x+2\). The <b>red</b> line is plan B: \(y=0.5x+5\). Here \(x\) is days and \(y\) is the total cost.</p><p>Each point on a line is a day and a cost that the plan allows.</p>`,
      set: { m1: 1, b1: 2, m2: .5, b2: 5 } },
    { title: 'Where they meet',
      text: String.raw`<p>The violet dot is the one point on both lines: day \(6\), cost $8. Both equations are true there at once.</p><p>That point is the <b>solution</b> of the system. Drag a line's handles and watch the solution move.</p>`,
      set: { m1: 1, b1: 2, m2: .5, b2: 5 } },
    { title: 'Parallel: no solution',
      text: String.raw`<p>Give plan A the same slope as plan B, \(0.5\). The lines now run side by side and never meet.</p><p>Same rate, different starting amount: the plans never cost the same.</p>`,
      set: { m1: .5, b1: 2, m2: .5, b2: 5 } },
    { title: 'Same line: infinitely many',
      text: String.raw`<p>Now give A the same start as well. The two equations describe one line, so every point on it is a solution.</p><p>Nudge either line off again to get back to a single solution.</p>`,
      set: { m1: .5, b1: 5, m2: .5, b2: 5 } }
  ],
  formal: String.raw`
    <p>A <em>system</em> of two linear equations asks for the points that satisfy both,
    \[ y = m_1x + b_1, \qquad y = m_2x + b_2. \]</p>
    <h3>Substitution</h3>
    <p>At a solution both right-hand sides give the same \(y\), so set them equal:
    \[ m_1x + b_1 = m_2x + b_2 \;\Longrightarrow\; x = \frac{b_2-b_1}{m_1-m_2}, \]
    then put this \(x\) back into either equation to get \(y\). For the plans: \(x+2 = 0.5x+5\) gives \(x=6\) and \(y=8\).</p>
    <h3>The three cases</h3>
    <p>
    <b>One solution</b> when \(m_1\neq m_2\): the lines have different slopes, so they cross exactly once.<br>
    <b>No solution</b> when \(m_1=m_2\) and \(b_1\neq b_2\): parallel lines.<br>
    <b>Infinitely many</b> when \(m_1=m_2\) and \(b_1=b_2\): the same line.</p>
    <h3>Elimination</h3>
    <p>Another way to solve is to add or subtract the equations so a variable cancels. Subtracting the second equation from the first removes \(y\) and leaves the same equation for \(x\). Graphically this is always the same question: where do the two lines meet?</p>`,
  check: [
    { q: String.raw`Where do \(y=2x+1\) and \(y=-x+7\) cross?`,
      choices: ['(1, 3)', '(2, 5)', '(3, 7)', '(6, 13)'], answer: 1,
      why: String.raw`Set \(2x+1=-x+7\) to get \(3x=6\), so \(x=2\) and \(y=2(2)+1=5\).`,
      hint: String.raw`Set the two expressions for \(y\) equal, solve for \(x\), then find \(y\).` },
    { q: String.raw`How many solutions does the system \(y=3x+1\), \(y=3x-4\) have?`,
      choices: ['One', 'Two', 'None', 'Infinitely many'], answer: 2,
      why: String.raw`Both lines have slope \(3\) but different intercepts, so they are parallel and never meet.`,
      hint: String.raw`Compare the slopes and the intercepts of the two lines.` }
  ],
  links: { prereq: ['slope-and-linear-functions', 'solving-equations-with-a-balance'], next: ['solving-systems-by-substitution'], related: ['quadratics-and-the-parabola', 'solving-systems-by-elimination', 'modeling-with-systems', 'linear-transformations'] },

  mount({ stage, controls: C }) {
    const st = { m1: 1, b1: 2, m2: .5, b2: 5 };
    let cancel = () => {};
    const P = new Plane(stage, { cx: 2, cy: 3, span: 7.5 });
    const HX = 3;  /* the slope handle sits at x = 3 on each line */
    const solve = () => {
      const dm = st.m1 - st.m2, db = st.b2 - st.b1;
      if (Math.abs(dm) > .01) { const x = db / dm; return { kind: 'one', x, y: st.m1 * x + st.b1 }; }
      return { kind: Math.abs(db) < .01 ? 'same' : 'none' };
    };

    P.onDraw = (c, p) => {
      const pal = p.pal, bd = p.bounds(), sol = solve();
      p.grid(1); p.ticks(1);
      const L = (m, b, col, dash) => p.path([[bd.x0, m * bd.x0 + b], [bd.x1, m * bd.x1 + b]], { stroke: col, width: 3.5, dash });
      L(st.m1, st.b1, pal.blue);
      L(st.m2, st.b2, pal.red, sol.kind === 'same' ? [12, 10] : undefined);
      if (sol.kind === 'one') {
        p.dot(sol.x, sol.y, 9, pal.violet, pal.stage, 2.5);
        p.label(`(${num(sol.x)}, ${num(sol.y)})`, sol.x, sol.y, { size: 19, italic: false, color: pal.violet, dy: -22 });
      }
      for (const [m, b] of [[st.m1, st.b1], [st.m2, st.b2]]) {
        p.dot(0, b, 8, pal.stage, pal.brass, 3); p.dot(HX, m * HX + b, 8, pal.stage, pal.brass, 3);
      }
    };

    const upd = () => {
      const s = solve();
      ro.innerHTML = `<span class="k">A</span> ${linEq(st.m1, st.b1)}<br><span class="k">B</span> ${linEq(st.m2, st.b2)}<br>` +
        (s.kind === 'one' ? `<span class="k">Solution</span> (${num(s.x)}, ${num(s.y)})`
          : s.kind === 'none' ? '<span class="k">Same slope, different intercepts:</span> no solution'
          : '<span class="k">Same line:</span> infinitely many solutions');
    };
    const sync = () => { [m1S, b1S, m2S, b2S].forEach((s, i) => s.set(st[['m1', 'b1', 'm2', 'b2'][i]])); P.draw(); upd(); };
    const edit = k => v => { cancel(); st[k] = v; P.requestDraw(); upd(); };

    C.title('Line A (blue)');
    const m1S = C.slider({ label: 'Slope', min: -3, max: 3, step: .25, value: st.m1, onInput: edit('m1') });
    const b1S = C.slider({ label: 'Intercept', min: -4, max: 10, step: .5, value: st.b1, onInput: edit('b1') });
    C.title('Line B (red)');
    const m2S = C.slider({ label: 'Slope', min: -3, max: 3, step: .25, value: st.m2, onInput: edit('m2') });
    const b2S = C.slider({ label: 'Intercept', min: -4, max: 10, step: .5, value: st.b2, onInput: edit('b2') });
    const ro = C.readout(); upd();
    C.hint('Drag the ring at each line\'s y-intercept to slide it, and the ring at x = 3 to tilt it.');

    draggable(P, {
      hit: (px, py) => {
        let best = null, bd = 18;
        for (const [k, m, b] of [['1', st.m1, st.b1], ['2', st.m2, st.b2]])
          for (const [t, x, y] of [['b', 0, b], ['m', HX, m * HX + b]]) {
            const d = Math.hypot(P.X(x) - px, P.Y(y) - py);
            if (d < bd) { bd = d; best = t + k; }
          }
        return best;
      },
      move: (hd, x, y) => {
        cancel();
        const k = hd[1];
        if (hd[0] === 'b') st['b' + k] = clamp(snap(y, .5), -4, 10);
        else st['m' + k] = clamp(snap((y - st['b' + k]) / HX, .25), -3, 3);
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
