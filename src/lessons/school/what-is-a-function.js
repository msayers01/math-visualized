/* =====================================================================
   SCHOOL — What is a function?
   ===================================================================== */
{
  const INP = [-3, -2, -1, 0, 1, 2, 3];
  const CIRC_PAIRS = [[-5, 0], [-4, 3], [-4, -3], [-3, 4], [-3, -4], [0, 5], [0, -5], [3, 4], [3, -4], [4, 3], [4, -3], [5, 0]];
  const same = (a, b) => Math.abs(a - b) < 1e-6;
  const sgn = v => (v > 0 ? '+' : '') + num(v);
  const SERIF = '"STIX Two Text", "Cambria Math", "Times New Roman", serif';
  const SANS = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';

  /* The rules the student can choose. `outs(x)` lists every output the rule gives for input x. */
  const RULES = {
    lin1: { eq: 'f(x) = 2x − 1', words: 'Double the input, then subtract 1.', f: x => 2 * x - 1, sub: v => `2(${v}) − 1`, inputs: INP },
    lin2: { eq: 'f(x) = −x + 4', words: 'Subtract the input from 4.', f: x => 4 - x, sub: v => `−(${v}) + 4`, inputs: INP },
    lin3: { eq: 'f(x) = x/2 + 3', words: 'Halve the input, then add 3.', f: x => x / 2 + 3, sub: v => `(${v})/2 + 3`, inputs: INP },
    sq:   { eq: 'f(x) = x²', words: 'Multiply the input by itself.', f: x => x * x, sub: v => `(${v})²`, inputs: INP },
    circ: { eq: 'x² + y² = 25', words: 'The input squared plus the output squared is 25.', rel: true, inputs: [-5, -4, -3, 0, 3, 4, 5], pairs: CIRC_PAIRS }
  };
  for (const r of Object.values(RULES)) if (!r.rel) r.outs = x => [r.f(x)];
  RULES.circ.outs = x => {
    const q = 25 - x * x;
    if (q < -1e-9) return [];
    if (q < 1e-9) return [0];
    const y = Math.sqrt(q);
    return [y, -y];
  };
  const pairsOf = r => r.rel ? r.pairs : r.inputs.map(x => [x, r.f(x)]);
  /* inputs spaced d apart, passing through `base` (used for the equal-steps staircase) */
  const chainXs = (base, d) => { const xs = []; for (let x = base - d * Math.floor((base + 3) / d); x <= 3 + 1e-9; x += d) xs.push(x); return xs; };
  const jumpOf = (base, d) => base + d <= 3 ? [base, base + d] : [base - d, base];

  /* canvas drawing helpers (pixel space) */
  const rr = (c, x, y, w, hh, r) => {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + hh, r); c.arcTo(x + w, y + hh, x, y + hh, r);
    c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  const arrowPx = (c, x0, y0, x1, y1, col, wd = 2.5) => {
    const a = Math.atan2(y1 - y0, x1 - x0), hl = 9;
    c.strokeStyle = col; c.fillStyle = col; c.lineWidth = wd; c.lineCap = 'round'; c.setLineDash([]);
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 - Math.cos(a) * hl * .7, y1 - Math.sin(a) * hl * .7); c.stroke();
    c.beginPath(); c.moveTo(x1, y1);
    c.lineTo(x1 - hl * Math.cos(a - .45), y1 - hl * Math.sin(a - .45)); c.lineTo(x1 - hl * Math.cos(a + .45), y1 - hl * Math.sin(a + .45));
    c.closePath(); c.fill();
  };
  const tx = (c, pal, s, x, y, { size = 14, color, align = 'center', weight = 500, halo = false } = {}) => {
    c.font = `${weight} ${size}px ${SANS}`; c.textAlign = align; c.textBaseline = 'middle';
    if (halo) { c.lineWidth = 4; c.strokeStyle = pal.stage; c.lineJoin = 'round'; c.strokeText(s, x, y); }
    c.fillStyle = color || pal.text; c.fillText(s, x, y);
  };
  /* math text: letters in italic serif, everything else upright sans */
  const mt = (c, pal, s, x, y, { size = 15, color, align = 'center', weight = 500, halo = false } = {}) => {
    const runs = [];
    for (const ch of s) {
      const it = /[a-zA-Z]/.test(ch), last = runs[runs.length - 1];
      if (last && last.it === it) last.t += ch; else runs.push({ t: ch, it });
    }
    const font = it => it ? `italic ${size}px ${SERIF}` : `${weight} ${size * .88}px ${SANS}`;
    let wt = 0;
    for (const r of runs) { c.font = font(r.it); r.w = c.measureText(r.t).width; wt += r.w; }
    let px = align === 'center' ? x - wt / 2 : align === 'right' ? x - wt : x;
    c.textAlign = 'left'; c.textBaseline = 'middle';
    for (const r of runs) {
      c.font = font(r.it);
      if (halo) { c.lineWidth = 4; c.strokeStyle = pal.stage; c.lineJoin = 'round'; c.strokeText(r.t, px, y); }
      c.fillStyle = color || pal.text; c.fillText(r.t, px, y); px += r.w;
    }
  };

  register({
    id: 'what-is-a-function', level: 'school',
    title: 'What is a function?',
    blurb: 'Feed numbers into a rule and watch each input and output become a point on a graph.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 1; p.span = 3.6;
      p.grid(1);
      p.path([[-1.3, -3.6], [3.3, 5.6]], { stroke: pal.blue, width: 2.6 });
      p.path([[2, 0], [2, 3]], { stroke: pal.green, width: 2, dash: [4, 4] });
      p.path([[2, 3], [0, 3]], { stroke: pal.red, width: 2, dash: [4, 4] });
      p.dot(2, 3, 5.2, pal.yellow, pal.stage, 1.5);
    },
    hook: String.raw`A rule takes a number in and gives a number out. How can you tell, just by looking at its graph, that it never gives two different answers for the same input?`,
    steps: [
      { title: 'One input, one output',
        text: String.raw`<p>The box is a function machine for the rule \(f(x)=2x-1\). Feed it the input \(x=3\). It doubles the input and subtracts 1, and out comes one number: \(2(3)-1=5\).</p><p>We write \(f(3)=5\). On the graph this is the point \((3,5)\): 3 across and 5 up. The <b>green</b> dashed line marks the input on the x-axis and the <b>red</b> one marks the output on the y-axis. Drag in the graph to try other inputs.</p>`,
        set: { rule: 'lin1', x: 3, tbl: 0, steps: 0, vline: false, dx: 1 } },
      { title: 'A rule that is not a function',
        text: String.raw`<p>Now the rule is \(x^2+y^2=25\), a circle. Feed it \(x=3\) and two numbers fit: \(y=4\) and \(y=-4\), because \(3^2+4^2=25\) and \(3^2+(-4)^2=25\).</p><p>A function must give exactly one output for each input, so this is not a function. The <b>violet</b> vertical line at \(x=3\) crosses the graph twice. Now pick \(f(x)=x^2\) in the Rule menu: every vertical line crosses its graph only once.</p>`,
        set: { rule: 'circ', x: 3, tbl: 0, steps: 0, vline: true, dx: 1 } },
      { title: 'Four ways to show one function',
        text: String.raw`<p>Here is \(f(x)=2x-1\) in four forms. <b>Words:</b> double the input, then subtract 1. <b>Equation:</b> \(f(x)=2x-1\). <b>Table:</b> each row is an input and its output. <b>Graph:</b> each row is a point.</p><p>The highlighted row is \(x=2\) and \(f(2)=3\), so its point is \((2,3)\). The graph is the set of all such points.</p><p>You can move between the four forms in any direction. The table row with \(x=0\) shows \(f(0)=-1\), the constant in the equation. Pick another linear rule and all four forms change together.</p>`,
        set: { rule: 'lin1', x: 2, tbl: 1, steps: 0, vline: false, dx: 1 } },
      { title: 'Equal steps in, equal steps out',
        text: String.raw`<p>Read down the table. Each time the input goes up by \(1\) (green), the output goes up by \(2\) (red). It is always \(2\), and every stair on the graph has the same height.</p><p>That \(2\) is the \(m\) in \(f(x)=2x-1\). With <b>Step size</b> \(2\) or \(3\) the output changes by \(4\) or \(6\). Now choose \(f(x)=x^2\) in the Rule menu: with step size \(1\) the changes are \(-5,-3,-1,+1,+3,+5\). They are not constant, so \(x^2\) is not linear.</p>`,
        set: { rule: 'lin1', x: 1, tbl: 1, steps: 1, vline: false, dx: 1 } }
    ],
    formal: String.raw`
      <p><b>Definition.</b> A <em>function</em> is a rule that assigns each input to <em>exactly one</em> output. The input is the <em>independent</em> variable. The output is the <em>dependent</em> variable, because its value depends on the input.</p>
      <h3>Function notation</h3>
      <p>We name a function with a letter such as \(f\). The symbol \(f(x)\), read "f of x", is the output of \(f\) for the input \(x\). It does not mean \(f\) times \(x\). For \(f(x)=2x-1\),
      \[ f(3)=2(3)-1=5. \]
      The pair \((3,5)\) is an <em>ordered pair</em>: input first, output second.</p>
      <h3>The graph is a set of ordered pairs</h3>
      <p>The graph of \(f\) is the set of all points \((x,\,f(x))\). A table lists a few of them and the graph shows all of them at once. The horizontal position of a point is an input, and its height is the matching output.</p>
      <h3>Function or not?</h3>
      <p>A rule fails to be a function if some input gets two different outputs. On a graph this is the <em>vertical line test</em>: a graph is the graph of a function exactly when no vertical line crosses it more than once.</p>
      <p>The circle \(x^2+y^2=25\) fails. The input \(3\) gives both \((3,4)\) and \((3,-4)\). In a table, look for a repeated input with different outputs.</p>
      <p>The reverse is allowed. Two different inputs may share an output: for \(f(x)=x^2\), \(f(2)=4\) and \(f(-2)=4\). Each input still has exactly one output.</p>
      <h3>Linear functions and constant change</h3>
      <p>A <em>linear function</em> has the form \(f(x)=mx+b\). Change the input by any amount \(\Delta x\) and the output changes by
      \[ f(x+\Delta x)-f(x)=\big(m(x+\Delta x)+b\big)-\big(mx+b\big)=m\,\Delta x. \]
      The change in the output is the constant \(m\) times the change in the input, wherever you start.</p>
      <p>Other functions do not behave this way. For \(f(x)=x^2\), \((x+1)^2-x^2=2x+1\). That is \(-5\) when you start at \(x=-3\) and \(+5\) when you start at \(x=2\).</p>
      <h3>Four ways to describe a linear function</h3>
      <p>The same function can be given in words ("double the input, then subtract 1"), by an equation (\(f(x)=2x-1\)), by a table, or by a graph. To go from a table to an equation, read \(b\) as the output when \(x=0\) and \(m\) as the change in output for each step of \(1\) in the input.</p>
      <p>The table \(x=0,1,2,3\) with \(f(x)=-1,1,3,5\) has \(b=-1\) and \(m=2\), so \(f(x)=2x-1\). Its graph is the line through \((0,-1)\) and \((1,1)\).</p>`,
    check: [
      { q: String.raw`Which list of (input, output) pairs is <b>not</b> a function?`,
        choices: ['(1, 4), (2, 4), (3, 4), (4, 4)', '(0, 5), (1, 3), (2, 1), (3, −1)', '(1, 2), (2, 5), (3, 7), (2, 9)', '(−2, 4), (−1, 1), (1, 1), (2, 4)'], answer: 2,
        why: String.raw`The input \(2\) appears twice with different outputs, \(5\) and \(9\). A function gives each input exactly one output. In the other lists some outputs repeat, which is allowed. Only a repeated input with different outputs breaks the rule.`,
        hint: 'Look for an input that appears more than once. Does it always come with the same output?' },
      { q: String.raw`A table shows a linear function \(f\): for \(x=0,1,2,3\) the outputs are \(f(x)=5,8,11,14\). What is \(f(10)\)?`,
        choices: ['30', '35', '45', '53'], answer: 1,
        why: String.raw`Each step of \(1\) in the input adds \(3\) to the output, so \(m=3\). At \(x=0\) the output is \(5\), so \(b=5\) and \(f(x)=3x+5\). Then \(f(10)=3(10)+5=35\).`,
        hint: String.raw`Find the change in the output for each step of 1 in the input, then the output when \(x=0\).` }
    ],
    links: { related: ['slope-and-linear-functions', 'functions-as-transformations', 'quadratics-and-the-parabola', 'exponential-growth'] },

    mount({ stage, controls: C }) {
      stage.classList.add('split');
      const top = h('div', { class: 'pane', style: 'flex: 6 1 0' }), bot = h('div', { class: 'pane', style: 'flex: 14 1 0' });
      stage.append(top, bot);
      const P1 = new Plane(top), P2 = new Plane(bot);
      /* tbl: table and plotted points (0..1); steps: equal-steps overlay (0..1); rk: 0 = function window, 1 = circle window */
      const st = { x: 3, tbl: 0, steps: 0, rk: 0 };
      let rule = 'lin1', dx = 1, vline = false, cancel = () => {}, lay = null;

      const R = () => RULES[rule];
      const nearest = x => R().inputs.reduce((b, v) => Math.abs(v - x) < Math.abs(b - x) ? v : b, R().inputs[0]);
      const idxOf = x => R().inputs.indexOf(nearest(x));

      /* ---------- bottom pane layout: graph window (uniform scale) and table ---------- */
      const layout = p => {
        const W = p.w, H = p.h, m = 12, k = st.rk, T = st.tbl, r = R();
        const x0 = lerp(-4.5, -6.5, k), x1 = lerp(4.5, 6.5, k), y0 = lerp(-8, -6.5, k), y1 = lerp(10, 6.5, k);
        const TW = clamp(W * .4, 150, 230), tw = TW * T, gap = 18 * T;
        const s = Math.max(3, Math.min((H - 2 * m) / (y1 - y0), (W - 2 * m - tw - gap) / (x1 - x0)));
        const pw = (x1 - x0) * s, ph = (y1 - y0) * s, left = (W - (pw + gap + tw)) / 2, py = (H - ph) / 2;
        p.span = Math.min(W, H) / (2 * s);
        p.cx = x0 + (W / 2 - left) / s;
        p.cy = y1 + (py - H / 2) / s;
        const n = pairsOf(r).length, hdr = 34, rowH = Math.min(clamp(H * .075, 22, 34), (H - 2 * m - hdr) / n), ty = (H - hdr - n * rowH) / 2;
        return { W, H, x0, x1, y0, y1, s, px: left, py, pw, ph, tx: left + pw + gap, TW, n, hdr, rowH, ty, zone: TW * .17 };
      };

      /* ---------- top pane: the function machine ---------- */
      P1.onDraw = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, r = R(), outs = r.outs(st.x), xv = num(st.x);
        const bxW = clamp(W * .3, 120, 220), u = Math.min(clamp(W / 400, .8, 1.3), (W - 20 - bxW) / 228);
        const chW = 90 * u, chH = 36 * u, arr = 24 * u, bxH = 54 * u;
        const total = 2 * chW + 2 * arr + bxW, x0 = (W - total) / 2, xb = x0 + chW + arr, xo = xb + bxW + arr;
        const yM = clamp(H * .46, 60, 112), cap = Math.max(11, 12 * u), big = 17 * u;

        for (const [t, cx] of [['input', x0 + chW / 2], ['rule', xb + bxW / 2], ['output', xo + chW / 2]])
          tx(c, pal, t, cx, yM - 40 * u - 12, { size: cap, color: pal.muted, weight: 600 });

        const chip = (x, y, w, hh, col, label) => {
          rr(c, x, y - hh / 2, w, hh, 8 * u); c.fillStyle = alpha(col, .13); c.fill();
          c.strokeStyle = col; c.lineWidth = 2.5; c.setLineDash([]); c.stroke();
          mt(c, pal, label, x + w / 2, y + 1, { size: big });
        };
        chip(x0, yM, chW, chH, pal.green, `x = ${xv}`);
        rr(c, xb, yM - bxH / 2, bxW, bxH, 10 * u); c.fillStyle = alpha(pal.blue, .12); c.fill();
        c.strokeStyle = pal.blue; c.lineWidth = 3; c.stroke();
        mt(c, pal, r.eq, xb + bxW / 2, yM + 1, { size: big * 1.1, weight: 600 });

        arrowPx(c, x0 + chW + 3, yM, xb - 3, yM, pal.muted, 2.5);
        if (outs.length === 0) {
          tx(c, pal, 'no output', xo + chW / 2, yM, { size: big * .8, color: pal.muted });
        } else {
          const two = outs.length === 2, hh = two ? 31 * u : chH;
          outs.forEach((y, i) => {
            const yy = two ? yM + (i ? 21 : -21) * u : yM;
            arrowPx(c, xb + bxW + 3, yM, xo - 3, yy, pal.red, 2.5);
            chip(xo, yy, chW, hh, pal.red, r.rel ? `y = ${num(y)}` : `f(${xv}) = ${num(y)}`);
          });
        }

        const verdict = !r.rel ? 'Every input gets exactly one output.'
          : outs.length === 2 ? 'One input, two outputs: not a function.' : 'This input has one output, but others have two.';
        tx(c, pal, r.words, W / 2, H - 36, { size: Math.max(12, 13.5 * u), color: pal.muted });
        tx(c, pal, verdict, W / 2, H - 15, { size: Math.max(12.5, 14 * u), weight: 600 });
      };

      /* ---------- bottom pane: graph and table ---------- */
      P2.onDraw = (c, p) => {
        const pal = p.pal, r = R(), L = lay = layout(p), { s, px, py, pw, ph, x0, x1, y0, y1 } = L;
        const fs = clamp(s * .62, 12, 15), outs = r.outs(st.x), cur = nearest(st.x), X = st.x, T = st.tbl, S = r.rel ? 0 : st.steps, g = 1 - S;
        const slopeAt = (x, y) => r.rel ? (Math.abs(y) < 1e-9 ? 1e6 : -x / y) : (r.f(x + .01) - r.f(x - .01)) / .02;
        const chain = !r.rel ? chainXs(cur, dx) : [], jump = !r.rel ? jumpOf(cur, dx) : null;
        const xstep = s >= 20 ? 1 : 2, ystep = r.rel && s >= 20 ? 1 : 2;

        c.save(); c.beginPath(); c.rect(px, py, pw, ph); c.clip();
        p.grid(1);
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.beginPath();
        for (let v = Math.ceil(x0); v <= x1; v++) { c.moveTo(p.X(v), p.Y(0) - 3.5); c.lineTo(p.X(v), p.Y(0) + 3.5); }
        for (let v = Math.ceil(y0); v <= y1; v++) { c.moveTo(p.X(0) - 3.5, p.Y(v)); c.lineTo(p.X(0) + 3.5, p.Y(v)); }
        c.stroke();

        /* the rule's graph */
        const pts = [];
        if (r.rel) { for (let i = 0; i <= 180; i++) { const t = i / 180 * TAU; pts.push([5 * Math.cos(t), 5 * Math.sin(t)]); } p.path(pts, { stroke: pal.blue, width: 3.5, close: true }); }
        else { for (let i = 0; i <= 140; i++) { const xx = lerp(x0, x1, i / 140); pts.push([xx, r.f(xx)]); } p.curve(pts, { stroke: pal.blue, width: 3.5 }); }

        /* equal steps: a staircase of runs (green) and rises (red) */
        if (S > .01 && chain.length > 1) {
          c.globalAlpha = S;
          for (let i = 0; i < chain.length - 1; i++) {
            const a = chain[i], b = chain[i + 1], fa = r.f(a), fb = r.f(b), hot = same(a, jump[0]) && same(b, jump[1]), wd = hot ? 5 : 2.5;
            p.path([[a, fa], [b, fa]], { stroke: pal.green, width: wd });
            p.path([[b, fa], [b, fb]], { stroke: pal.red, width: wd });
          }
          c.globalAlpha = 1;
        }
        if (vline) p.path([[X, y0], [X, y1]], { stroke: alpha(pal.violet, .85), width: 3.5 });
        if (T > .01) { c.globalAlpha = T; for (const [a, b] of pairsOf(r)) p.dot(a, b, 4.3, pal.blue, pal.stage, 1.5); c.globalAlpha = 1; }

        /* dashed guides, then the input marker and the output point(s) */
        c.globalAlpha = g;
        for (const y of outs) {
          if (!vline) p.path([[X, 0], [X, y]], { stroke: alpha(pal.green, .95), width: 2.5, dash: [6, 5] });
          p.path([[X, y], [0, y]], { stroke: alpha(pal.red, .95), width: 2.5, dash: [6, 5] });
        }
        if (outs.some(y => Math.abs(y) > .25)) p.dot(X, 0, 7.5, pal.green, pal.brass, 3);
        c.globalAlpha = 1;
        for (const y of outs) p.dot(X, y, 8, pal.yellow, pal.brass, 3);
        c.restore();

        c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.strokeRect(px, py, pw, ph);
        const txt = v => (v < 0 ? '−' : '') + Math.abs(v);
        const jl = [];  /* pixel centers of the step labels, so tick numbers can step aside */
        if (S > .01 && jump) {
          const [a, b] = jump, fa = r.f(a), fb = r.f(b);
          jl.push([p.X((a + b) / 2), p.Y(fa) + (fb < fa ? -13 : 13)], [p.X(b) + 19, p.Y((fa + fb) / 2)]);
        }
        const clash = (qx, qy, wx) => jl.some(([jx, jy]) => Math.abs(jx - qx) < wx && Math.abs(jy - qy) < 12);
        for (let v = Math.ceil(x0); v <= x1; v++)
          if (v !== 0 && v % xstep === 0 && !(g > .5 && same(v, X)) && !clash(p.X(v), p.Y(0) + 14, 20)) p.label(txt(v), v, 0, { size: fs, italic: false, color: pal.muted, dy: 14 });
        for (let v = Math.ceil(y0); v <= y1; v++)
          if (v !== 0 && v % ystep === 0 && !(g > .5 && outs.some(y => same(y, v))) && !clash(p.X(0) - 17, p.Y(v), 26)) p.label(txt(v), 0, v, { size: fs, italic: false, color: pal.muted, dx: -9, align: 'right' });
        p.label('x', x1, 0, { size: fs + 4, color: pal.muted, dx: -9, dy: -12 });
        p.label('y', 0, y1, { size: fs + 4, color: pal.muted, dx: 11, dy: 11 });
        p.label(num(X), X, 0, { size: fs + 1, italic: false, color: pal.green, dy: 19, alpha: g });
        for (const y of outs) {
          p.label(num(y), 0, y, { size: fs + 1, italic: false, color: pal.red, dx: -9, align: 'right', alpha: g });
          const sl = slopeAt(X, y), left = X > 0, up = left ? sl > 0 : sl < 0;
          if (!(r.rel && same(X, 0))) p.label(`(${num(X)}, ${num(y)})`, X, y, { size: fs, italic: false, dx: left ? -13 : 13, dy: up ? -15 : 15, align: left ? 'right' : 'left', alpha: g });
        }
        if (S > .01 && jump) {
          const [a, b] = jump, fa = r.f(a), fb = r.f(b), rise = fb - fa;
          p.label(sgn(b - a), (a + b) / 2, fa, { size: fs + 1, italic: false, color: pal.green, alpha: S, dy: rise < 0 ? -13 : 13 });
          p.label(sgn(rise), b, (fa + fb) / 2, { size: fs + 1, italic: false, color: pal.red, alpha: S, dx: 12, align: 'left' });
        }

        /* the table */
        if (T > .01) {
          const rows = pairsOf(r), { tx: x, TW, n, hdr, rowH, ty, zone } = L, cw = (TW - 2 * zone) / 2;
          const c1 = x + zone + cw / 2, c2 = x + zone + cw * 1.5, fsz = clamp(rowH * .56, 12, 16);
          c.globalAlpha = T;
          rows.forEach(([a, b], i) => {
            const y = ty + hdr + (i + .5) * rowH, on = same(a, cur);
            if (on) { c.fillStyle = alpha(pal.yellow, .22); c.fillRect(x + zone, y - rowH / 2, TW - 2 * zone, rowH); }
            if (i) { c.strokeStyle = pal.grid; c.lineWidth = 1; c.beginPath(); c.moveTo(x + zone, y - rowH / 2); c.lineTo(x + TW - zone, y - rowH / 2); c.stroke(); }
            tx(c, pal, num(a), c1, y, { size: fsz, color: on ? pal.green : pal.text, weight: on ? 700 : 500 });
            tx(c, pal, num(b), c2, y, { size: fsz, color: on ? pal.red : pal.text, weight: on ? 700 : 500 });
          });
          c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.beginPath();
          c.moveTo(x + zone, ty + hdr); c.lineTo(x + TW - zone, ty + hdr);
          c.moveTo(x + zone + cw, ty + hdr); c.lineTo(x + zone + cw, ty + hdr + n * rowH); c.stroke();
          mt(c, pal, 'x', c1, ty + hdr / 2, { size: 17, color: pal.green });
          mt(c, pal, r.rel ? 'y' : 'f(x)', c2, ty + hdr / 2, { size: 17, color: pal.red });
          if (S > .01 && chain.length > 1) {
            c.globalAlpha = T * S;
            const bracket = (bx, ya, yb, col, label, side) => {
              c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 1.8; c.setLineDash([]);
              c.beginPath(); c.moveTo(bx, ya + 3); c.lineTo(bx, yb - 7); c.stroke();
              c.beginPath(); c.moveTo(bx, yb - 3); c.lineTo(bx - 3.5, yb - 9); c.lineTo(bx + 3.5, yb - 9); c.closePath(); c.fill();
              tx(c, pal, label, bx + side * 6, (ya + yb) / 2, { size: clamp(fsz - 1, 11, 14), color: col, align: side < 0 ? 'right' : 'left', weight: 700, halo: true });
            };
            for (let i = 0; i < chain.length - 1; i++) {
              const a = chain[i], b = chain[i + 1], ia = r.inputs.indexOf(a), ib = r.inputs.indexOf(b);
              const ya = ty + hdr + (ia + .5) * rowH, yb = ty + hdr + (ib + .5) * rowH;
              bracket(x + zone - 3, ya, yb, pal.green, sgn(b - a), -1);
              bracket(x + TW - zone + 3, ya, yb, pal.red, sgn(r.f(b) - r.f(a)), 1);
            }
          }
          c.globalAlpha = 1;
        }
      };

      /* ---------- readout ---------- */
      const upd = () => {
        const r = R(), xv = num(st.x), outs = r.outs(st.x), k = t => `<span class="k">${t}</span> `;
        let s = k('Rule') + r.eq + '<br>' + k('Input') + `x = ${xv}<br>`;
        if (!r.rel) s += k('Output') + `f(${xv}) = ${r.sub(xv)} = ${num(outs[0])}<br>` + k('Point') + `(${xv}, ${num(outs[0])})`;
        else if (outs.length === 2) s += k('Outputs') + `y = ${num(outs[0])} and y = ${num(outs[1])}<br>` + k('Points') + `(${xv}, ${num(outs[0])}) and (${xv}, ${num(outs[1])})<br>Two outputs, so not a function.`;
        else if (outs.length === 1) s += k('Output') + `y = ${num(outs[0])}<br>` + k('Point') + `(${xv}, ${num(outs[0])})`;
        if (vline) s += '<br>' + k('Vertical line') + `crosses the graph ${outs.length} ${outs.length === 1 ? 'time' : 'times'}`;
        if (st.steps > .5 && !r.rel) {
          const [a, b] = jumpOf(nearest(st.x), dx), df = r.f(b) - r.f(a);
          s += '<br>' + k('Step') + `x from ${num(a)} to ${num(b)}<br>` + k('Change') + `Δx = ${sgn(b - a)}, Δf = ${sgn(df)}<br>` + k('Ratio') + `Δf ÷ Δx = ${num(df / (b - a))}`;
        }
        ro.innerHTML = s;
      };
      const sync = () => { xS.set(idxOf(st.x)); P1.draw(); P2.draw(); upd(); };
      const setRule = v => {
        cancel(); rule = v; sel.value = v; st.x = nearest(st.x);
        cancel = animateTo(st, { rk: v === 'circ' ? 1 : 0 }, 500, sync); sync();
      };
      const fade = key => on => { cancel(); cancel = animateTo(st, { [key]: on ? 1 : 0 }, 350, sync); };

      C.title('Rule');
      const sel = C.select({ label: 'Choose a rule', value: rule, onChange: setRule, options: [
        { value: 'lin1', label: 'f(x) = 2x − 1' }, { value: 'lin2', label: 'f(x) = −x + 4' }, { value: 'lin3', label: 'f(x) = x/2 + 3' },
        { value: 'sq', label: 'f(x) = x²' }, { value: 'circ', label: 'x² + y² = 25 (a circle)' }] });
      C.title('Input');
      const xS = C.slider({ label: 'Input x', min: 0, max: 6, step: 1, value: 6, format: v => num(R().inputs[v]),
        onInput: v => { cancel(); st.x = R().inputs[v]; sync(); } });
      const ro = C.readout();
      C.title('Show');
      const tblT = C.toggle({ label: 'Table and plotted points', value: false, onChange: fade('tbl') });
      const vT = C.toggle({ label: 'Vertical line test', value: false, onChange: v => { vline = v; P2.draw(); upd(); } });
      const stT = C.toggle({ label: 'Equal steps', value: false, onChange: fade('steps') });
      const dxS = C.slider({ label: 'Step size Δx', min: 1, max: 3, step: 1, value: 1, format: v => '+' + v, onInput: v => {
          dx = v;
          if (!stT.checked) { stT.checked = true; cancel(); cancel = animateTo(st, { steps: 1 }, 350, sync); }
          P2.draw(); upd();
        } });
      C.hint('Drag in the graph, tap a table row, or use the Input slider.');
      sync();

      draggable(P2, {
        hit: (qx, qy) => {
          const L = lay; if (!L) return null;
          if (st.tbl > .5 && qx >= L.tx - 4 && qx <= L.tx + L.TW + 4 && qy >= L.ty + L.hdr && qy <= L.ty + L.hdr + L.n * L.rowH) return 'row';
          return qx >= L.px - 12 && qx <= L.px + L.pw + 12 && qy >= L.py - 12 && qy <= L.py + L.ph + 12 ? 'plot' : null;
        },
        move: (hd, mx, my) => {
          cancel();
          if (hd === 'row') {
            const L = lay, i = clamp(Math.floor((P2.Y(my) - L.ty - L.hdr) / L.rowH), 0, L.n - 1);
            st.x = pairsOf(R())[i][0];
          } else st.x = nearest(mx);
          sync();
        }
      });

      const apply = (patch, immediate) => {
        cancel();
        const { rule: rl, dx: d, vline: v, ...rest } = patch;
        if (rl !== undefined) { rule = rl; sel.value = rl; st.x = nearest(st.x); }
        if (d !== undefined) { dx = d; dxS.set(d); }
        if (v !== undefined) { vline = v; vT.checked = v; }
        rest.rk = rule === 'circ' ? 1 : 0;
        if (rest.tbl !== undefined) tblT.checked = rest.tbl > .5;
        if (rest.steps !== undefined) stT.checked = rest.steps > .5;
        if (immediate) { Object.assign(st, rest); sync(); } else cancel = animateTo(st, rest, 900, sync);
      };
      return { destroy: () => { cancel(); P1.destroy(); P2.destroy(); }, apply };
    }
  });
}
