/* =====================================================================
   SCHOOL — The coordinate plane, first quadrant (Grade 5)
   ===================================================================== */
{
  const N = 10;                                   /* the treasure map runs from 0 to 10 across and up */
  const RMAX = 8;                                 /* the rule y = x + 2 stays on the map for x = 0 to 8 */
  const fs = p => clamp(p.scale * .5, 15, 20);
  const kk = t => `<span class="k">${t}</span>`;
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const pair = (x, y) => `(${x}, ${y})`;
  const ri = Math.round;

  /* ---------- practice problems (a fixed list) ---------- */
  const PROBS = [
    { name: 'Read the point', kind: 'choice', show: [6, 2],
      q: 'A treasure chest is the gold point on the map. Walk along the hallway first, then up the stairs. Which ordered pair names its spot?',
      ch: [
        ['(6, 0)', 'That is the spot straight below the chest, on the x-axis. You walked 6 across but forgot to climb 2 up.'],
        ['(2, 6)', 'That swaps the numbers. The chest is 6 across (x) and 2 up (y), so the pair is (6, 2).'],
        ['(6, 2)', 'Count 6 along the hallway. Then climb 2 up the stairs. Across comes first, so the pair is (6, 2).'],
        ['(8, 8)', 'That adds 6 + 2 = 8. An ordered pair keeps two separate numbers: one for across, one for up.']], ans: 2 },
    { name: 'Place the treasure', kind: 'place', target: [4, 7], start: [1, 1],
      q: 'Move the gold point to (4, 7). Then press Check.',
      route: 'Walk 4 across, then climb 7 up.' },
    { name: 'A point on an axis', kind: 'place', target: [0, 5], start: [6, 3],
      q: 'Move the gold point to (0, 5). Then press Check.',
      route: 'Walking 0 across means you never leave the stairs, so the point sits on the y-axis.' },
    { name: 'Which axis?', kind: 'choice',
      q: 'Which point sits on the x-axis, the hallway? (It is 0 up, so you do not climb.)',
      ch: [
        ['(4, 4)', 'This one is 4 across and 4 up. It floats in the middle of the map, off both axes.'],
        ['(0, 4)', 'This one is 0 across and 4 up. It is on the y-axis, the stairs, not the hallway.'],
        ['(4, 0)', 'The second number is 0, so you climb 0. You stay in the hallway: 4 across, no climbing. It is on the x-axis.'],
        ['(3, 4)', 'This one is 3 across and 4 up. It is off both axes.']], ans: 2 },
    { name: 'Finish the pattern', kind: 'choice', rule: 3,
      q: 'The rule is y = x + 2. The map shows the points for x = 0, 1 and 2. What is y when x = 3?',
      ch: [
        ['6', 'That is 3 × 2. The rule adds 2. It does not double.'],
        ['1', 'That is 3 − 2. The rule says plus 2, so y is bigger than x.'],
        ['5', '3 + 2 = 5. The next point is (3, 5): one step right and one step up from (2, 4).'],
        ['3', 'That is x itself. The rule says y is 2 more than x: 3 + 2 = 5.']], ans: 2 },
    { name: 'Plot a rule point', kind: 'place', target: [5, 7], start: [2, 2], rule: 3,
      q: 'The rule is y = x + 2. Move the gold point to the spot for x = 5. Then press Check.',
      route: 'For x = 5, y is 5 + 2 = 7. The new point lines up with the points before it.' }
  ];

  const pairName = ([x, y]) => `(${x}, ${y})`;

  register({
    id: 'the-coordinate-plane-first-quadrant', level: 'school',
    title: 'The coordinate plane: first quadrant',
    blurb: 'Find spots on a treasure map with two numbers: walk along the hallway, then up the stairs.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 5.4; p.cy = 5; p.span = 6.6;
      for (let v = 0; v <= 10; v += 2) {
        p.path([[v, 0], [v, 10]], { stroke: pal.grid, width: 1 });
        p.path([[0, v], [10, v]], { stroke: pal.grid, width: 1 });
      }
      p.arrow(0, 0, 10.6, 0, pal.green, 3.5);
      p.arrow(0, 0, 0, 10.6, pal.red, 3.5);
      p.path([[0, 2], [8, 10]], { stroke: pal.blue, width: 2.5 });
      for (let x = 0; x <= 8; x += 2) p.dot(x, x + 2, 4.5, pal.blue);
      p.path([[0, 0], [6, 0], [6, 3]], { stroke: pal.yellow, width: 2.5, dash: [5, 4] });
      p.dot(6, 3, 8, pal.yellow, pal.brass, 2.5);
    },
    hook: 'A treasure map says "dig at (3, 5)". How can two small numbers find one exact spot in a whole field?',
    steps: [
      { title: 'Two number lines',
        text: `<p>Picture a school. A hallway runs across. Stairs go up.</p><p>The <b>x-axis</b> is the hallway. The <b>y-axis</b> is the stairs. They meet at the <b>origin</b>, where both numbers are 0.</p><p>Drag the gold point away from the origin.</p>`,
        set: { px: 0, py: 0, mode: 'axes' } },
      { title: 'Walk, then climb',
        text: `<p>A point has two numbers, written (x, y). We call this an <b>ordered pair</b>.</p><p>Start at the origin. Walk along the hallway first. Then go up the stairs.</p><p>Here you walk 4 across and climb 3 up. The pair is (4, 3). Now move the point.</p>`,
        set: { px: 4, py: 3, mode: 'walk' } },
      { title: 'The order matters',
        text: `<p>The treasure is at (3, 5). A friend digs at (5, 3).</p><p>Make a guess in the panel first. Then look at the map.</p><p>The first number is always across. The second is always up. Swap them and you get a different spot.</p>`,
        set: { px: 3, py: 5, mode: 'order' } },
      { title: 'A rule makes a pattern',
        text: `<p>A rule can make pairs. Try y = x + 2. Each y is 2 more than its x.</p><p>The table shows x from 0 to 4. At x = 4, y = 6. Each pair is a point. The points line up.</p><p>Guess the next point in the panel. Then step along the line.</p>`,
        set: { px: 4, py: 6, mode: 'rule' } }
    ],
    formal: String.raw`
      <h3>The two axes and the origin</h3>
      <p>The <b>x-axis</b> runs across, like a hallway. The <b>y-axis</b> runs up, like stairs. They cross at the <b>origin</b>. The origin is the pair (0, 0): zero across and zero up. In this lesson we use only the top right part of the plane, where both numbers are 0 or bigger. It is called the <b>first quadrant</b>.</p>
      <h3>Ordered pairs</h3>
      <p>An <b>ordered pair</b> (x, y) names one point. Always do the same two moves in the same order. First walk x steps across. Then climb y steps up. For (4, 3) you walk 4 across and climb 3 up.</p>
      <p>If x is 0, you do not walk, so the point is on the y-axis. If y is 0, you do not climb, so the point is on the x-axis.</p>
      <h3>Why the order matters</h3>
      <p>Everyone must read a pair the same way. If one person climbed first and another walked first, they would dig in different places. So we agree: x first, y second. The pairs (3, 5) and (5, 3) use the same numbers, but they are two different points. They are only the same point when both numbers are equal, like (4, 4).</p>
      <h3>A rule, a table and a graph</h3>
      <p>A rule tells you how to get y from x. For the rule y = x + 2, add 2 to each x:</p>
      <p>x = 0 gives y = 2. x = 1 gives y = 3. x = 2 gives y = 4. x = 3 gives y = 5.</p>
      <p>Each row of the table is an ordered pair: (0, 2), (1, 3), (2, 4), (3, 5). Plot them and they sit on a straight line.</p>
      <h3>Why the points line up</h3>
      <p>Move one step right, so x grows by 1. The rule adds 2 to x, so y also grows by 1. Every step right is the same step up. Equal steps make a straight line.</p>
      <h3>Worked example</h3>
      <p>On a map from 0 to 10, which is the last point of y = x + 2? When x = 8, y = 8 + 2 = 10. That is the top of the map. When x = 9, y = 11, which is off the map. So the last point is (8, 10).</p>`,
    check: [
      { q: 'On a treasure map, the treasure is at the ordered pair (2, 6). How do you reach it from the origin?',
        choices: ['Walk 6 across, then climb 2 up', 'Walk 8 across and do not climb', 'Walk 2 across, then climb 6 up', 'Climb 2 up, then climb 6 more up'], answer: 2,
        why: 'In an ordered pair the first number is across and the second number is up. So (2, 6) means 2 across, then 6 up. Walking 6 across and climbing 2 up reaches (6, 2), a different point.',
        hint: 'Which number comes first, and does it tell you across or up?' },
      { q: 'A map is a grid from 0 to 10 across and from 0 to 10 up. Points follow the rule y = x + 2, so the first points are (0, 2), (1, 3) and (2, 4). Which is the last point of the rule that still fits on the map?',
        choices: ['(10, 12)', '(10, 10)', '(12, 10)', '(8, 10)'], answer: 3,
        why: 'Each y is x + 2. The map stops at y = 10, so x + 2 = 10 and x = 8. The point is (8, 10). For x = 10, y would be 12, which is off the map. (12, 10) puts the numbers in the wrong order, and 12 is off the map too.',
        hint: 'How big can y be? Then work backward: which x plus 2 makes that y?' },
      { q: 'Tom says: "The point (4, 0) is on the y-axis. I walk 4 up the stairs." What is wrong with what Tom said?',
        choices: ['The second number is 0, so you climb 0. You walk 4 across, so (4, 0) is on the x-axis.', 'Nothing is wrong. (4, 0) is on the y-axis.', 'It should be written (0, 4), because the y number always comes first.', '(4, 0) is the origin, because it has a 0 in it.'], answer: 0,
        why: 'The first number tells how far across to walk. The second tells how far up to climb. In (4, 0) you walk 4 across and climb 0, so you stay on the hallway, the x-axis. The y-number never comes first. The origin is (0, 0), where both numbers are 0.',
        hint: 'Which number is across and which is up? What does climbing 0 mean?' }
    ],
    links: { related: ['negative-numbers-and-absolute-value', 'variables-and-relationships', 'patterns-and-the-nth-term', 'slope-and-linear-functions'] },

    mount({ stage, controls: C }) {
      const st = { px: 3, py: 5, mode: 'axes', practice: false };
      const locked = { order: true, rule: true };
      let revealed = false;                       /* the swapped point is shown once the student has guessed */
      let cancel = () => {};
      const panel = stage.nextElementSibling;
      const P = new Plane(stage, { span: 6 });

      /* ----- the picture ----- */
      const axisNames = p => {
        const pal = p.pal, size = fs(p), c = p.ctx;
        p.label('x-axis (across)', N / 2, 0, { size, italic: false, color: pal.green, dy: 36 });
        c.save(); c.font = `500 ${size * .85}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`;
        c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = pal.red;
        c.translate(p.X(-1.35), p.Y(N / 2)); c.rotate(-Math.PI / 2); c.fillText('y-axis (up)', 0, 0); c.restore();
      };
      const plot = (p, hx, hy) => {
        p.fit(N, N, { l: 1.9, r: .8, t: 1.5, b: 2.2 });
        const pal = p.pal, size = fs(p);
        for (let v = 0; v <= N; v++) {
          p.path([[v, 0], [v, N]], { stroke: pal.grid, width: 1 });
          p.path([[0, v], [N, v]], { stroke: pal.grid, width: 1 });
        }
        p.arrow(0, 0, N + .55, 0, pal.green, 3.5);
        p.arrow(0, 0, 0, N + .55, pal.red, 3.5);
        for (let v = 0; v <= N; v++) {
          const onx = hx != null && v === hx, ony = hy != null && v === hy;
          p.label(String(v), v, 0, { size: onx ? size * 1.2 : size, italic: false, color: onx ? pal.green : pal.muted, dy: 17, align: v === 0 ? 'right' : 'center', dx: v === 0 ? -9 : 0 });
          if (v > 0) p.label(String(v), 0, v, { size: ony ? size * 1.2 : size, italic: false, color: ony ? pal.red : pal.muted, dx: -12, align: 'right' });
        }
        axisNames(p);
      };
      const ptLabel = (p, x, y, text, color) => {
        const size = fs(p), flip = x > N - 2.4;
        p.label(text, x, y, { size, italic: false, color: color || p.pal.text, dx: flip ? -16 : 16, dy: y > N - 1 ? 18 : -18, align: flip ? 'right' : 'left' });
      };
      const handle = (p, x, y) => p.dot(x, y, 10.5, p.pal.yellow, p.pal.brass, 3.5);
      const route = (p, x, y, withLabels) => {
        const pal = p.pal, size = fs(p);
        if (x > .02) p.arrow(0, 0, x, 0, pal.green, 4.5);
        if (y > .02) p.arrow(x, 0, x, y, pal.red, 4.5);
        if (!withLabels) return;
        if (x > .9) p.label('across ' + ri(x), x / 2, 0, { size, italic: false, color: pal.green, dy: -17 });
        if (y > .9) p.label('up ' + ri(y), x, y / 2, { size, italic: false, color: pal.red, dx: x > N - 2.2 ? -14 : 14, align: x > N - 2.2 ? 'right' : 'left' });
      };
      const rulePts = (p, upto, dim) => {
        const pal = p.pal;
        if (upto >= 1) p.path(Array.from({ length: upto + 1 }, (_, i) => [i, i + 2]), { stroke: pal.blue, width: 3 });
        if (upto < RMAX) p.path([[upto, upto + 2], [RMAX, RMAX + 2]], { stroke: alphaC(pal.blue, .35), width: 2, dash: [3, 7] });
        for (let i = 0; i <= upto; i++) p.dot(i, i + 2, dim ? 5 : 6, pal.blue, pal.stage, 1.5);
      };
      const alphaC = (col, a) => alpha(col, a);

      const caption = () => {
        if (st.practice) return `Practice ${prIdx + 1} of ${PROBS.length}: ${PROBS[prIdx].name}`;
        const x = ri(st.px), y = ri(st.py);
        if (st.mode === 'axes') return x === 0 && y === 0 ? 'The origin is (0, 0)' : `The point is ${pair(x, y)}`;
        if (st.mode === 'walk') return `Walk ${x} across, then climb ${y} up: ${pair(x, y)}`;
        if (st.mode === 'order') return revealed ? `${pair(x, y)} and ${pair(y, x)}` : 'Guess in the panel first';
        return 'Rule: y = x + 2';
      };

      P.onDraw = (c, p) => {
        const pal = p.pal, size = fs(p);
        if (st.practice) {
          const pr = PROBS[prIdx];
          plot(p, pr.kind === 'place' ? clamp(ri(st.px), 0, N) : null, pr.kind === 'place' ? clamp(ri(st.py), 0, N) : null);
          if (pr.rule != null) rulePts(p, pr.kind === 'choice' ? pr.rule - 1 : pr.rule, true);
          if (pr.kind === 'choice' && pr.show) { p.dot(pr.show[0], pr.show[1], 10.5, pal.yellow, pal.brass, 3.5); }
          if (pr.kind === 'place') {
            const x = ri(st.px), y = ri(st.py);
            if (prChecked) { route(p, x, y, false); ptLabel(p, x, y, pair(x, y)); }
            handle(p, st.px, st.py);
          }
          p.label(caption(), N / 2 - .3, N + 1.05, { size: size * 1.1, italic: false, color: pal.text });
          return;
        }
        const x = ri(st.px), y = ri(st.py), m = st.mode;
        if (m === 'rule') {
          const rx = clamp(ri(st.px), 0, RMAX);
          plot(p, rx, rx + 2);
          rulePts(p, rx, false);
          p.path([[rx, 0], [rx, rx + 2], [0, rx + 2]], { stroke: pal.muted, width: 1.6, dash: [5, 5] });
          handle(p, rx, rx + 2);
          ptLabel(p, rx, rx + 2, pair(rx, rx + 2));
        } else {
          plot(p, x, y);
          if (m === 'order' && revealed && x !== y) {
            p.path([[0, 0], [y, 0], [y, x]], { stroke: pal.violet, width: 3, dash: [7, 6] });
            p.dot(y, x, 10, pal.stage, pal.violet, 4);
            ptLabel(p, y, x, pair(y, x), pal.violet);
          }
          route(p, st.px, st.py, true);
          if (m === 'axes' && x === 0 && y === 0) p.label('origin (0, 0)', .45, .75, { size, italic: false, color: pal.text, align: 'left' });
          else if (m !== 'axes' || x > 0 || y > 0) ptLabel(p, st.px, st.py, pair(x, y));
          if (!(m === 'order' && locked.order)) handle(p, st.px, st.py);
          else handle(p, st.px, st.py);
        }
        p.label(caption(), N / 2 - .3, N + 1.05, { size: size * 1.1, italic: false, color: pal.text });
      };

      /* ----- readout ----- */
      const tableHtml = rx => {
        const cell = (t, strong) => `<td style="padding:3px 0;min-width:30px;text-align:center;border:1px solid var(--line-strong);${strong ? 'font-weight:700;' : ''}">${t}</td>`;
        let xs = '', ys = '';
        for (let i = 0; i <= rx; i++) { xs += cell(i, i === rx); ys += cell(i + 2, i === rx); }
        return `<div style="overflow-x:auto;max-width:100%"><table style="border-collapse:collapse;font-size:.88rem;margin:4px 0 6px"><tr><th style="padding:3px 8px;text-align:right">x</th>${xs}</tr><tr><th style="padding:3px 8px;text-align:right">y</th>${ys}</tr></table></div>`;
      };
      const updRo = () => {
        const x = ri(st.px), y = ri(st.py);
        if (st.practice) { ro.innerHTML = ''; return; }
        if (st.mode === 'rule') {
          const rx = clamp(x, 0, RMAX);
          ro.innerHTML = `${kk('Rule')} y = x + 2${tableHtml(rx)}${kk('Newest point')} ${pair(rx, rx + 2)}: when x is ${rx}, y is ${rx} + 2 = ${rx + 2}.`;
          return;
        }
        let t = `${kk('Point')} ${pair(x, y)}<br>${kk('Route')} walk ${x} across (x), then climb ${y} up (y)`;
        if (x === 0 && y === 0) t += '<br>This is the origin.';
        else if (y === 0) t += '<br>y is 0, so it is on the x-axis.';
        else if (x === 0) t += '<br>x is 0, so it is on the y-axis.';
        if (st.mode === 'order' && revealed) t += `<br>${kk('Swapped')} ${pair(y, x)}: ` + (x === y ? 'the same spot, because both numbers are equal.' : 'a different spot. Order matters.');
        ro.innerHTML = t;
      };

      /* ----- the side panel ----- */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const S = o => { const s = C.slider(o); const el = panel.lastElementChild; s.inp = el.querySelector('input'); return s; };
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', style: 'min-height:44px;min-width:44px', onclick: onClick }, label);
      const addTo = (...els) => panel.append(...els);
      const bump = (dx, dy) => { cancel(); if (st.mode === 'rule') { st.px = clamp(ri(st.px) + dx + dy, 0, RMAX); st.py = st.px + 2; } else { st.px = clamp(ri(st.px) + dx, 0, N); st.py = clamp(ri(st.py) + dy, 0, N); } sync(); };

      const predict = (key, title, q, opts, onPick) => {
        let done = false;
        const fbk = h('div', { class: 'ctl readout', 'aria-live': 'polite' }), row = h('div', { class: 'ctl buttons' });
        const btns = opts.map((o, i) => mkBtn(o[0], () => {
          if (done) return; done = true;
          btns.forEach((b, j) => { b.disabled = true; if (j === i) b.classList.add('primary'); });
          fbk.innerHTML = o[1]; locked[key] = false; onPick(i); sync();
        }));
        row.append(...btns);
        addTo(h('p', { class: 'ctl-title' }, title), h('p', { class: 'hint' }, q), row, fbk);
      };

      let xS, yS, rS, ro, startBtn;
      let prIdx = 0, prSolved = false, prChecked = false, prFirst = 0, prDone = 0, prTried = false;
      let ptally, pq, pch, pap, pfb, pnext;

      grp('order', () => {
        predict('order', 'Predict first', 'The treasure is at (3, 5). A friend digs at (5, 3). Are these the same spot?',
          [['Same spot, because 3 + 5 = 5 + 3', 'Not quite. A pair is not a sum. The first number is across and the second is up. Look at the two points now.'],
           ['Different spots', good('Right.') + ' (3, 5) is 3 across and 5 up. (5, 3) is 5 across and 3 up. Look at both points on the map.'],
           ['Not enough information', 'We know enough. A pair says exactly where to go: across first, then up. Look at the two points now.']],
          () => { revealed = true; });
      });
      grp('rule', () => {
        predict('rule', 'Predict first', 'The rule is y = x + 2. The table shows x = 0 to 4. What is y when x = 6?',
          [['4', 'That is 6 − 2. The rule adds 2, so y is bigger than x. Watch the line grow.'],
           ['8', good('Right.') + ' 6 + 2 = 8. The point (6, 8) is on the same straight line.'],
           ['12', 'That is 6 × 2. The rule adds 2. It does not double. Watch the line grow.']],
          () => { cancel(); cancel = animateTo(st, { px: 6, py: 8 }, 900, sync); });
      });
      grp('point', () => {
        C.title('Move the point');
        xS = S({ label: 'Across (x)', min: 0, max: N, step: 1, value: st.px, format: v => String(v), onInput: v => { cancel(); st.px = v; sync(); } });
        yS = S({ label: 'Up (y)', min: 0, max: N, step: 1, value: st.py, format: v => String(v), onInput: v => { cancel(); st.py = v; sync(); } });
        addTo(h('div', { class: 'ctl buttons' }, mkBtn('◀ x', () => bump(-1, 0)), mkBtn('x ▶', () => bump(1, 0)), mkBtn('▼ y', () => bump(0, -1)), mkBtn('y ▲', () => bump(0, 1))));
      });
      grp('rulectl', () => {
        C.title('Step along the line');
        rS = S({ label: 'x for the rule', min: 0, max: RMAX, step: 1, value: 4, format: v => String(v), onInput: v => { cancel(); st.px = v; st.py = v + 2; sync(); } });
        addTo(h('div', { class: 'ctl buttons' }, mkBtn('◀ x − 1', () => bump(-1, 0)), mkBtn('x + 1 ▶', () => bump(1, 0))));
      });
      grp('ro', () => { ro = C.readout(); C.hint('Drag the gold point, or use the sliders and buttons.'); });

      /* ----- practice ----- */
      C.title('Practice');
      C.hint('Six short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); if (st.practice) { st.practice = false; sync(); } else { st.practice = true; loadProb(); sync(); } } }])[0];
      startBtn.style.minHeight = '44px';
      grp('practice', () => {
        const pw = h('div', { style: 'display:flex;flex-direction:column;gap:14px' });
        ptally = h('p', { class: 'ctl-title' });
        pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        pch = h('div', { class: 'ctl buttons' });
        pap = h('div', { class: 'ctl buttons' });
        pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pnext = mkBtn('Next problem', () => nextProb(), true);
        const mv = (l, dx, dy) => mkBtn(l, () => { if (prSolved) return; st.px = clamp(ri(st.px) + dx, 0, N); st.py = clamp(ri(st.py) + dy, 0, N); prChecked = false; pfb.innerHTML = ''; sync(); });
        pap.append(mv('◀ Left', -1, 0), mv('Right ▶', 1, 0), mv('▲ Up', 0, 1), mv('▼ Down', 0, -1), mkBtn('Check', () => checkPlace(), true));
        pw.append(ptally, pq, pch, pap, pfb, h('div', { class: 'ctl buttons' }, pnext)); addTo(pw);
      });
      const tally = () => { ptally.textContent = `Right on the first try: ${prFirst} of ${prDone} done`; };
      const loadProb = () => {
        const pr = PROBS[prIdx]; prSolved = false; prChecked = false; prTried = false;
        pq.textContent = pr.q; pfb.innerHTML = ''; pch.replaceChildren(); pnext.disabled = true; pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        pap.style.display = pr.kind === 'place' ? '' : 'none'; pch.style.display = pr.kind === 'choice' ? '' : 'none';
        if (pr.kind === 'place') { st.px = pr.start[0]; st.py = pr.start[1]; }
        else pr.ch.forEach((o, i) => pch.append(mkBtn(o[0], () => pickChoice(i))));
        tally();
      };
      const pickChoice = i => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        const right = i === pr.ans, btn = pch.children[i];
        if (right) {
          prSolved = true; if (!prTried) prFirst++; prDone++;
          Array.from(pch.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary');
          pfb.innerHTML = good('Right.') + ' ' + pr.ch[i][1]; pnext.disabled = false;
        } else {
          prTried = true; btn.disabled = true;
          pfb.innerHTML = bad('Not quite.') + ' ' + pr.ch[i][1] + ' Try another answer.';
        }
        tally(); sync();
      };
      const checkPlace = () => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        const x = ri(st.px), y = ri(st.py), [tx, ty] = pr.target; prChecked = true;
        if (x === tx && y === ty) {
          prSolved = true; if (!prTried) prFirst++; prDone++; pnext.disabled = false;
          pfb.innerHTML = good('Right.') + ` Your point is ${pair(x, y)}. ${pr.route}`;
        } else {
          prTried = true;
          let why;
          if (x === ty && y === tx && x !== y) why = `That is ${pair(x, y)}: ${x} across and ${y} up. You swapped the numbers. ${pairName(pr.target)} means ${tx} across first, then ${ty} up.`;
          else if (x !== tx && y !== ty) why = `Your point is ${pair(x, y)}. You need ${tx} across and ${ty} up. ` + `Move ${x < tx ? 'right' : 'left'} and ${y < ty ? 'up' : 'down'}.`;
          else if (x !== tx) why = `Your point is ${pair(x, y)}. The up number is right, but you need ${tx} across. Move ${x < tx ? 'right' : 'left'}.`;
          else why = `Your point is ${pair(x, y)}. The across number is right, but you need ${ty} up. Move ${y < ty ? 'up' : 'down'}.`;
          if (pr.rule != null && x === tx && y !== ty) why += ` The rule gives y = ${tx} + 2 = ${ty}.`;
          pfb.innerHTML = bad('Not yet.') + ' ' + why;
        }
        tally(); sync();
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); sync(); return; }
        pq.textContent = 'All six problems are done.'; pch.replaceChildren(); pap.style.display = 'none'; pnext.disabled = true;
        pfb.innerHTML = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        const again = mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; loadProb(); sync(); }, true);
        pch.style.display = ''; pch.append(again); sync();
      };

      /* ----- state rules ----- */
      const sync = () => {
        const prac = st.practice, m = st.mode;
        vis(G.order, !prac && m === 'order'); vis(G.rule, !prac && m === 'rule');
        vis(G.point, !prac && m !== 'rule'); vis(G.rulectl, !prac && m === 'rule'); vis(G.ro, !prac); vis(G.practice, prac);
        xS.set(clamp(ri(st.px), 0, N)); yS.set(clamp(ri(st.py), 0, N)); rS.set(clamp(ri(st.px), 0, RMAX));
        const lk = (m === 'order' && locked.order) || (m === 'rule' && locked.rule);
        xS.inp.disabled = yS.inp.disabled = lk; rS.inp.disabled = lk;
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        P.draw(); updRo();
      };

      /* ----- dragging ----- */
      draggable(P, {
        hit: (px, py) => {
          if (st.practice) { const pr = PROBS[prIdx]; return pr.kind === 'place' && !prSolved && near(P, st.px, st.py, px, py, 22) ? 'pt' : null; }
          if ((st.mode === 'order' && locked.order) || (st.mode === 'rule' && locked.rule)) return null;
          const q = st.mode === 'rule' ? [clamp(ri(st.px), 0, RMAX), clamp(ri(st.px), 0, RMAX) + 2] : [st.px, st.py];
          return near(P, q[0], q[1], px, py, 22) ? 'pt' : null;
        },
        move: (id, x, y) => {
          cancel();
          if (st.practice) { st.px = clamp(ri(x), 0, N); st.py = clamp(ri(y), 0, N); prChecked = false; pfb.innerHTML = ''; sync(); return; }
          if (st.mode === 'rule') { st.px = clamp(ri(x), 0, RMAX); st.py = st.px + 2; }
          else { st.px = clamp(ri(x), 0, N); st.py = clamp(ri(y), 0, N); }
          sync();
        }
      });

      const apply = (patch, immediate) => {
        cancel();
        const nums = {};
        for (const k in patch) { if (k === 'mode') st.mode = patch[k]; else nums[k] = patch[k]; }
        st.practice = false;
        if (immediate) { Object.assign(st, nums); sync(); } else { sync(); cancel = animateTo(st, nums, 800, sync); }
      };
      sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
