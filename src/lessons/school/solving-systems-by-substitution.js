/* =====================================================================
   SCHOOL — Solving systems by substitution
   ===================================================================== */
{
  const MI = '−';
  const near0 = v => Math.abs(v) < 1e-9;

  /* ---------- exact fractions: [numerator, denominator] ---------- */
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; };
  const Q = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g + 0, d / g]; };
  const qadd = (a, b) => Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  const qmul = (a, b) => Q(a[0] * b[0], a[1] * b[1]);
  const qdiv = (a, b) => Q(a[0] * b[1], a[1] * b[0]);
  const qval = a => a[0] / a[1];
  const q0 = a => a[0] === 0;
  const qtxt = a => (a[0] < 0 ? MI : '') + Math.abs(a[0]) + (a[1] === 1 ? '' : '/' + a[1]);
  const qpw = (a, w) => {                       /* coefficient times variable, magnitude only */
    const n = Math.abs(a[0]), one = n === 1 && a[1] === 1;
    return one ? w : (a[1] === 1 ? n + w : '(' + n + '/' + a[1] + ')' + w);
  };
  /* "pw + q = r" from fractions, or just "q = r" when the variable has canceled */
  const eqQ = (p, q, r, w) => {
    const parts = [];
    if (!q0(p)) parts.push([p[0] < 0, qpw(p, w)]);
    if (!q0(q)) parts.push([q[0] < 0, Math.abs(q[0]) + (q[1] === 1 ? '' : '/' + q[1])]);
    if (!parts.length) parts.push([false, '0']);
    return parts.map(([neg, b], i) => (i ? (neg ? ' ' + MI + ' ' : ' + ') : (neg ? MI : '')) + b).join('') + ' = ' + qtxt(r);
  };

  /* ---------- equations ----------
     A side is a list of terms [coefficient, 'x' | 'y' | null]; null means a plain number. */
  const side = (list, magn) => list.map(([c, v], i) => {
    const neg = c < 0, a = Math.abs(c);
    return (i === 0 ? (neg ? MI : '') : (neg ? ' ' + MI + ' ' : ' + ')) + magn(a, v);
  }).join('');
  const plain = (a, v) => (v ? (a === 1 ? v : a + v) : String(a));
  const valOf = n => (n < 0 ? '(' + MI + Math.abs(n) + ')' : String(n));
  const withVals = vals => (a, v) => (v ? (a === 1 ? valOf(vals[v]) : a + '(' + (vals[v] < 0 ? MI : '') + Math.abs(vals[v]) + ')') : String(a));
  const evalList = (list, vals) => list.reduce((s, [c, v]) => s + c * (v ? vals[v] : 1), 0);
  const eqStr = E => side(E.l, plain) + ' = ' + side(E.r, plain);
  const tt = (c, w) => (c === 1 ? w : c === -1 ? MI + w : num(c) + w);
  const coefs = E => {
    let a = 0, b = 0, c = 0;
    E.l.forEach(([k, v]) => { if (v === 'x') a += k; else if (v === 'y') b += k; else c -= k; });
    E.r.forEach(([k, v]) => { if (v === 'x') a -= k; else if (v === 'y') b -= k; else c += k; });
    return { x: a, y: b, c };
  };
  /* slope and y-intercept text of a line a x + b y = c (b is never 0 in this lesson) */
  const slopeOf = e => -e.x / e.y, icptOf = e => e.c / e.y;

  /* Build a system. o: { A, B, src (which equation gets solved for a variable), v (that variable),
     pred, ord (order of the rearranging moves), name } */
  const mk = o => {
    const e = [coefs(o.A), coefs(o.B)], s = o.src, t = 1 - s, v = o.v, w = v === 'x' ? 'y' : 'x';
    const det = e[0].x * e[1].y - e[1].x * e[0].y;
    let kind = 'one', sol = null;
    if (det) sol = { x: (e[0].c * e[1].y - e[1].c * e[0].y) / det, y: (e[0].x * e[1].c - e[1].x * e[0].c) / det };
    else kind = (e[0].x * e[1].c - e[1].x * e[0].c === 0 && e[0].y * e[1].c - e[1].y * e[0].c === 0) ? 'same' : 'none';
    const E = [o.A, o.B], S = E[s];
    const solved = S.l.length === 1 && S.l[0][0] === 1 && S.l[0][1] === v && !S.r.some(([, q]) => q === v);
    const m = -e[s][w] / e[s][v], k = e[s].c / e[s][v];
    const exprList = solved ? S.r : [[k, null], [m, w]].filter(q => q[0] !== 0);
    return Object.assign({}, o, { e, E, t, w, kind, sol, solved, m, k, exprList, exprStr: side(exprList, plain), cv: e[t][v], cw: e[t][w], tc: e[t].c });
  };

  const SYS = [
    mk({ A: { l: [[1, 'y']], r: [[2, 'x'], [-1, null]] }, B: { l: [[1, 'x'], [1, 'y']], r: [[8, null]] }, src: 0, v: 'y' }),
    mk({ A: { l: [[1, 'x'], [2, 'y']], r: [[7, null]] }, B: { l: [[3, 'x'], [-2, 'y']], r: [[5, null]] }, src: 0, v: 'x',
      ord: ['const', 'corr', 'div', 'sign'],
      pred: { q: 'Equation A is x + 2y = 7. To substitute, one variable must be alone first. Which variable is easier to get alone?', ans: 0,
        ch: [['x', 'x has no number in front of it, so one move gets it alone: subtract 2y from both sides. No dividing, no fractions.'],
          ['y', 'You can, but y has a 2 in front, so you would have to divide every term by 2 and meet fractions: y = (7 − x)/2. Choose the variable with coefficient 1. We will get x alone.']] } }),
    mk({ A: { l: [[1, 'y']], r: [[2, 'x'], [-3, null]] }, B: { l: [[4, 'x'], [-2, 'y']], r: [[10, null]] }, src: 0, v: 'y',
      pred: { q: 'A is y = 2x − 3. B is 4x − 2y = 10, which is the same as y = 2x − 5. Before solving: how many solutions does this system have?', ans: 1, hide: true,
        ch: [['One', 'One solution needs different slopes, so the lines cross once. Here both slopes are 2.'],
          ['None', 'Both lines have slope 2, so they are parallel. Their y-intercepts are different (−3 and −5), so they are two separate lines that never meet.'],
          ['Infinitely many', 'That needs the very same line. The slopes match (both 2) but the y-intercepts are −3 and −5, so the lines are different.']] } }),
    mk({ A: { l: [[1, 'y']], r: [[2, 'x'], [-3, null]] }, B: { l: [[4, 'x'], [-2, 'y']], r: [[6, null]] }, src: 0, v: 'y',
      pred: { q: 'A is y = 2x − 3. B is 4x − 2y = 6, which is the same as y = 2x − 3. Before solving: how many solutions does this system have?', ans: 2, hide: true,
        ch: [['One', 'One solution needs different slopes. These slopes are both 2.'],
          ['None', 'Parallel lines need different y-intercepts. Both are −3 here, so the lines do not sit side by side.'],
          ['Infinitely many', 'B is y = 2x − 3, the same equation as A. It is one line written two ways, so every point on it is a solution.']] } })
  ];

  const PROBS = [
    { name: 'Standard', story: 'Solve the system.', sys: mk({ A: { l: [[1, 'y']], r: [[3, 'x'], [-2, null]] }, B: { l: [[2, 'x'], [1, 'y']], r: [[13, null]] }, src: 0, v: 'y' }) },
    { name: 'Rearrange first', story: 'A is not solved for a variable. Choose the easy one.',
      sys: mk({ A: { l: [[2, 'x'], [1, 'y']], r: [[9, null]] }, B: { l: [[3, 'x'], [-2, 'y']], r: [[10, null]] }, src: 0, v: 'y', ord: ['corr', 'div', 'const', 'sign'],
        pred: { q: 'Equation A is 2x + y = 9. Which variable is easier to get alone?', ans: 1,
          ch: [['x', 'x has a 2 in front, so you would divide every term by 2 and get fractions. y has no number in front.'],
            ['y', 'y has coefficient 1. Subtract 2x from both sides and y is alone: y = 9 − 2x.']] } }) },
    { name: 'Negative signs', story: 'Watch the minus sign in front of the parentheses.',
      sys: mk({ A: { l: [[1, 'y']], r: [[-2, 'x'], [5, null]] }, B: { l: [[3, 'x'], [-1, 'y']], r: [[5, null]] }, src: 0, v: 'y' }) },
    { name: 'Count the solutions', story: 'Predict first, then substitute.',
      sys: mk({ A: { l: [[1, 'y']], r: [[2, 'x'], [1, null]] }, B: { l: [[4, 'x'], [-2, 'y']], r: [[6, null]] }, src: 0, v: 'y',
        pred: { q: 'A is y = 2x + 1. B is 4x − 2y = 6, which is the same as y = 2x − 3. How many solutions?', ans: 1, hide: true,
          ch: [['One', 'The slopes are both 2, so the lines do not cross.'],
            ['None', 'Both slopes are 2, and the y-intercepts are 1 and −3. Parallel and different: no common point.'],
            ['Infinitely many', 'That needs the same line. The y-intercepts 1 and −3 are different.']] } }) },
    { name: 'Count again', story: 'Predict first. Here A has x alone.',
      sys: mk({ A: { l: [[1, 'x']], r: [[2, 'y'], [4, null]] }, B: { l: [[3, 'x'], [-6, 'y']], r: [[12, null]] }, src: 0, v: 'x',
        pred: { q: 'A is x = 2y + 4, which is y = x/2 − 2. B is 3x − 6y = 12, which is also y = x/2 − 2. How many solutions?', ans: 2, hide: true,
          ch: [['One', 'One solution needs different slopes. Both lines have slope 1/2.'],
            ['None', 'Parallel lines need different y-intercepts. Both are −2.'],
            ['Infinitely many', 'Both equations simplify to y = x/2 − 2. It is one line written two ways.']] } }) },
    { name: 'School play tickets', story: 'A school play sold 8 tickets in all. Adult tickets cost $5 and child tickets cost $3. The total was $34. Let x be the number of adult tickets and y the number of child tickets.',
      sys: mk({ A: { l: [[1, 'x'], [1, 'y']], r: [[8, null]], tag: 'tickets' }, B: { l: [[5, 'x'], [3, 'y']], r: [[34, null]], tag: 'dollars' }, src: 0, v: 'x', ord: ['sign', 'const', 'corr'] }),
      final: { q: 'How many tickets of each kind were sold?', ans: 1,
        ch: [['3 adult tickets and 5 child tickets', 'The numbers are swapped. x counts adult tickets, so x = 5 adults and y = 3 children. Test yours: 5(3) + 3(5) = 30, not 34.'],
          ['5 adult tickets and 3 child tickets', 'x = 5 adult tickets and y = 3 child tickets. That is 5 + 3 = 8 tickets and $25 + $9 = $34.'],
          ['x = 5 and y = 3', 'The numbers are right, but an answer in a story needs units. Say what they count: 5 adult tickets and 3 child tickets.'],
          ['$5 for adults and $3 for children', 'Those are the ticket prices from the question, not the solution. The solution counts tickets.']] } }
  ];

  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const opGer = (k, nn) => { const n = num(nn); return opGer0(k, n); };
  const opGer0 = (k, n) => (k === 'add' ? `Adding ${n} to both sides` : k === 'sub' ? `Subtracting ${n} from both sides` : k === 'mul' ? `Multiplying both sides by ${n}` : `Dividing both sides by ${n}`);
  const opWord = (k, nn) => { const n = num(nn); return opWord0(k, n); };
  const opWord0 = (k, n) => (k === 'add' ? `add ${n} to both sides` : k === 'sub' ? `subtract ${n} from both sides` : k === 'mul' ? `multiply both sides by ${n}` : `divide both sides by ${n}`);

  register({
    id: 'solving-systems-by-substitution', level: 'school',
    title: 'Solving systems by substitution',
    blurb: 'If one equation says what y is, write that in place of y in the other, then solve and check on the graph.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 3; p.cy = 4; p.span = 5.6;
      p.grid(1);
      p.path([[-1, -3], [6, 11]], { stroke: pal.blue, width: 3 });
      p.path([[-1, 9], [9, -1]], { stroke: pal.red, width: 3 });
      p.dot(3, 5, 7, pal.violet, pal.stage, 2);
    },
    hook: String.raw`Gym A charges $20 to join plus $5 a month. Gym B has no joining fee and charges $9 a month. After how many months do they cost the same, and how could you find out without drawing a graph?`,
    steps: [
      { title: 'Two equations, one point',
        text: String.raw`<p>A <b>system</b> is two equations that must both be true. Here A is \(y=2x-1\) and B is \(x+y=8\). Each is a line. The solution is a point on both lines.</p><p>Slide the point along line A. On A, \(y\) and \(2x-1\) are always the same number. At the start, \(x=1\) and \(y=1\), but B gives \(1+1=2\), not 8. Find the \(x\) where B is true too.</p>`,
        set: { mode: 'probe', sys: 0, tx: 1 } },
      { title: 'Substitute and solve',
        text: String.raw`<p>Equation A says \(y\) <em>is</em> \(2x-1\): the same number. So in B you may write \(2x-1\) wherever \(y\) appears. Only \(x\) is left to solve for.</p><p>Use the workbench: click the \(y\) in B, simplify, solve with both-sides moves, put \(x\) back into A, then test the point in both equations. The violet point appears after both tests.</p>`,
        set: { mode: 'work', sys: 0 } },
      { title: 'Rearrange first',
        text: String.raw`<p>Equation A, \(x+2y=7\), is not solved for a variable yet. First predict which variable is easier to get alone, then do it with a both-sides move.</p><p>The rest is the same method. Watch the \(-2y\): it puts minus signs in the work, so take care with the parentheses.</p>`,
        set: { mode: 'work', sys: 1 } },
      { title: 'When the variable vanishes',
        text: String.raw`<p>Predict first: how many solutions? Then substitute. If the variable cancels, look at what is left. A <b>false</b> statement such as \(6=10\) means no solution. A <b>true</b> one such as \(6=6\) means infinitely many.</p><p>The graph confirms it. Use the buttons to try both systems.</p>`,
        set: { mode: 'work', sys: 2 } }
    ],
    formal: String.raw`
      <h3>The idea</h3>
      <p>A <em>system</em> of two linear equations asks for the point \((x,y)\) that makes both equations true. Each equation is a line, so a solution is a point on both lines. Substitution works well when one equation tells you what a variable equals, for example \(y=2x-1\).</p>
      <h3>The method</h3>
      <ol>
        <li>Get one variable alone in one equation. Choose a variable with coefficient \(1\), so you never divide and never meet fractions: \(x+2y=7\) becomes \(x=7-2y\).</li>
        <li><b>Substitute.</b> In the <em>other</em> equation, replace that variable by the expression, in parentheses.</li>
        <li>Simplify. Distribute any number in front of the parentheses, then combine like terms.</li>
        <li>Solve the one-variable equation with both-sides moves.</li>
        <li>Put the answer back into the equation where the variable was alone to get the other coordinate.</li>
        <li>Check the point in <em>both</em> original equations.</li>
      </ol>
      <h3>Worked example: the gym question</h3>
      <p>Gym A: \(y=5x+20\). Gym B: \(y=9x\), where \(x\) is months and \(y\) is the total cost. Gym B says \(y=9x\), so replace \(y\) in A: \(9x=5x+20\). Then \(4x=20\) and \(x=5\). Put it back: \(y=9\cdot5=45\). After 5 months both cost $45.</p>
      <h3>Why you may substitute</h3>
      <p>Suppose \((x_0,y_0)\) is a solution. Equation A says \(y_0=2x_0-1\), so the number \(y_0\) and the number \(2x_0-1\) are the same number. Writing one name for the same number cannot change whether B is true. So B, with \(y\) replaced, is still true at \(x_0\), and \(x_0\) must solve the one-variable equation. When the variable survives, solving that equation leaves only one possible \(x_0\), and A then gives \(y_0\). Checking in both equations closes the loop: the point really is on both lines.</p>
      <h3>Worked example</h3>
      <p>Solve \(x+2y=7\) and \(3x-2y=5\). From the first, \(x=7-2y\). Substitute into the second and simplify:
      \[ 3(7-2y)-2y=5 \;\Rightarrow\; 21-6y-2y=5 \;\Rightarrow\; -8y+21=5. \]
      Subtract \(21\) from both sides to get \(-8y=-16\), then divide by \(-8\): \(y=2\). Back in \(x=7-2y\): \(x=7-4=3\). Check: \(3+2(2)=7\) and \(3(3)-2(2)=5\). The solution is \((3,2)\).</p>
      <p>A minus sign in front of parentheses changes every sign inside: \(3x-(-2x+5)=3x+2x-5\).</p>
      <h3>When the variable disappears</h3>
      <p>Substituting can cancel the variable completely. What is left has no variable, so it is simply true or false.
      \[ 4x-2(2x-3)=10 \;\Rightarrow\; 6=10 \quad\text{(false)}, \qquad 4x-2(2x-3)=6 \;\Rightarrow\; 6=6 \quad\text{(true)}. \]
      A false statement means that no value of the variable works, so the lines have no common point: they are parallel (same slope, different intercepts). A true statement means every value works, so the two equations describe the same line and every point on it is a solution.</p>
      <h3>The graph</h3>
      <p>Each step has a picture. The dashed green line marks the value you found for one variable. The ring marks the point you have not tested yet. The violet point appears only after the point has passed both equations, because that is exactly what it means to lie on both lines.</p>
      <h3>Answers in context</h3>
      <p>When the variables count things, finish by saying what the numbers mean, with units: "5 adult tickets and 3 child tickets", not just \(x=5,\ y=3\). Then check the answer against the story, for example that \(5+3=8\) tickets cost \(5(5)+3(3)=34\) dollars.</p>`,
    check: [
      { q: String.raw`You are solving \(y=x-4\) and \(3x-2y=10\) by substitution. Which line shows the correct first step?`,
        choices: ['3x − 2x − 4 = 10', '3x − 2(x − 4) = 10', '3(x − 4) − 2y = 10', 'x − 4 = 10'], answer: 1,
        why: String.raw`The equation \(y=x-4\) says \(y\) is the same number as \(x-4\), so \(x-4\) goes in for \(y\) in the other equation, in parentheses: \(3x-2(x-4)=10\). Without the parentheses the \(-2\) would multiply only the \(x\). Replacing \(x\) instead (the third choice) leaves two unknowns, and the last choice throws away part of the equation.`,
        hint: String.raw`Which variable do you know an expression for? Put that expression, in parentheses, where the variable is in the other equation.` },
      { q: String.raw`Solve the system \(y=2x+3\) and \(3x+y=18\) by substitution. What is the solution \((x,y)\)?`,
        choices: ['(9, 3)', '(3, 6)', '(15, 33)', '(3, 9)'], answer: 3,
        why: String.raw`Substitute: \(3x+(2x+3)=18\), so \(5x+3=18\) and \(5x=15\), which gives \(x=3\). Then \(y=2(3)+3=9\). The point \((3,9)\) works in both equations: \(9=2(3)+3\) and \(3(3)+9=18\). Choice (15, 33) forgets to divide by 5, and (9, 3) swaps the coordinates.`,
        hint: String.raw`Replace \(y\) in the second equation by \(2x+3\), combine the \(x\) terms, then solve for \(x\). Then find \(y\) from the first equation.` },
      { q: String.raw`A student solves \(x+2y=7\) and \(3x-2y=5\). Step 1: \(x=7-2y\). Step 2: \(3(7-2y)-2y=5\). Step 3: \(21-2y-2y=5\). Step 4: \(21-4y=5\), so \(y=4\). Where is the first mistake?`,
        choices: ['Step 1: x should be 7 + 2y', 'Step 2: the parentheses are not needed', 'Step 3: the 3 should multiply both 7 and −2y', 'There is no mistake'], answer: 2,
        why: String.raw`Step 1 is right (subtract \(2y\) from both sides). Step 2 is right and the parentheses are needed. In Step 3 the \(3\) multiplies everything inside: \(3(7-2y)=21-6y\), not \(21-2y\). The correct work is \(21-6y-2y=5\), so \(-8y=-16\) and \(y=2\), and then \(x=3\). Step 4 only follows from the wrong Step 3.`,
        hint: String.raw`Check each line against the one before it. Does the number in front of the parentheses multiply every term inside?` }
    ],
    links: { prereq: ['systems-of-equations', 'solving-equations-with-a-balance'], next: ['solving-systems-by-elimination'], related: ['forms-of-a-linear-equation', 'slope-and-linear-functions', 'modeling-with-systems', 'solving-systems-with-matrices'] },

    mount({ stage, controls: C }) {
      const panel = stage.nextElementSibling;
      const st = { mode: 'probe', sysI: 0, tx: 1, fa: 0, practice: false };
      let cancel = () => {}, cancelFa = () => {};
      const P = new Plane(stage, { cx: 3.5, cy: 3.6, span: 6.9 });
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const btn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);

      panel.append(h('style', {}, `
        .ssb-wb{display:flex;flex-direction:column;gap:12px}
        .ssb-prompt{font-size:.92rem;line-height:1.5;margin:0}
        .ssb-cards{display:flex;flex-direction:column;gap:8px}
        .ssb-card{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 12px;padding:8px 12px;border:1.5px solid var(--line-strong);border-left-width:6px;border-radius:4px;background:var(--surface-solid);font-family:var(--serif);font-size:1.2rem;line-height:1.6}
        .ssb-card.a{border-left-color:var(--blue)} .ssb-card.b{border-left-color:var(--red)}
        .ssb-nm{font:600 .8rem var(--sans);color:var(--muted)}
        .ssb-tag{font:.78rem var(--sans);color:var(--muted)}
        .ssb-old{font-size:.95rem;color:var(--muted);flex-basis:100%}
        .ssb-tok{font:inherit;color:inherit;background:none;border:0;border-bottom:2px dashed var(--brass);padding:0 2px;margin:0 1px;cursor:pointer;border-radius:2px;min-width:14px}
        .ssb-tok:hover,.ssb-tok:focus-visible{background:color-mix(in srgb,var(--brass) 25%,transparent);outline:none}
        .ssb-sub{background:color-mix(in srgb,var(--blue) 22%,transparent);border-radius:3px;padding:0 3px}
        .ssb-log{display:flex;flex-direction:column;gap:6px;border-top:1px solid var(--line);padding-top:10px}
        .ssb-row{display:flex;flex-direction:column;gap:0}
        .ssb-note{font:.78rem var(--sans);color:var(--muted)}
        .ssb-req{font-family:var(--serif);font-size:1.15rem;line-height:1.5}
        .ssb-coach{font-size:.9rem;line-height:1.5;border-top:1px solid var(--line);padding-top:10px}
        .ssb-coach p{margin:0 0 6px}
        .ssb-next{color:var(--text);font-weight:500}
        .ssb-step{display:flex;align-items:center;gap:8px;font-size:.92rem}
        .ssb-step output{min-width:2.2em;text-align:center;font-variant-numeric:tabular-nums;font-weight:600}
        .ssb-step .btn{min-width:40px;padding:6px 10px}
        .ssb-tally{margin:0}
      `));

      /* ================= the workbench ================= */
      const W = { S: SYS[0], phase: 'sub', rows: [], fb: '', lines: true, found: null, cand: null, sol: null, note: '', expr: null, eq: null, hist: [], op: 'sub', amt: 1, err: 0, tested: {}, promptHtml: '', onDone: null, done: false };
      const wbEl = h('div', { class: 'ssb-wb' });
      const wbTitle = h('p', { class: 'ctl-title' }, 'Solve it yourself');
      const promptEl = h('p', { class: 'ssb-prompt' });
      const cardsEl = h('div', { class: 'ssb-cards' });
      const logEl = h('div', { class: 'ssb-log' });
      const coachEl = h('div', { class: 'ssb-coach', 'aria-live': 'polite' });
      const actsEl = h('div', { class: 'ssb-acts', style: 'display:flex;flex-direction:column;gap:10px' });
      const chooserEl = h('div', { class: 'ctl buttons' });
      wbEl.append(promptEl, cardsEl, logEl, coachEl, actsEl, chooserEl);
      panel.append(wbTitle, wbEl);
      G.wb = [wbTitle, wbEl];

      const stopFa = () => { cancelFa(); };
      const wbReset = S => {
        stopFa();
        Object.assign(W, { S, phase: S.pred ? 'pred' : (S.solved ? 'sub' : 'iso'), rows: [], fb: '', lines: !(S.pred && S.pred.hide), found: null, cand: null, sol: null, note: '',
          expr: S.solved ? S.exprList : null, eq: null, hist: [], op: 'sub', amt: 1, tested: {}, done: false });
        st.fa = 0;
      };
      const go = ph => { W.phase = ph; };
      const err = () => { W.err++; };
      const finish = () => { W.done = true; go('done'); if (W.onDone) W.onDone(); };

      /* the second coordinate and the point to test */
      const pointFor = val => { const S = W.S, o = S.m * val + S.k; return S.v === 'y' ? { x: val, y: o } : { x: o, y: val }; };

      const nextText = () => {
        const S = W.S, v = S.v, w = S.w, ph = W.phase;
        if (ph === 'pred') return S.pred.q;
        if (ph === 'iso') return `Equation A is not solved for a variable yet. Get ${v} alone on one side. Choose a move to do to both sides.`;
        if (ph === 'sub') return `A says ${v} equals ${S.exprStr}. Click the ${v} in equation B, or press Replace, to write ${S.exprStr} in its place.`;
        if (ph === 'simp') return `Now B has only ${w} in it. Simplify it: distribute, then combine like terms.`;
        if (ph === 'solve') return `Solve for ${w}. Choose a move and an amount, then apply it to both sides.`;
        if (ph === 'verdict') return `The ${w} terms canceled. What does ${qtxt(W.eq.q)} = ${qtxt(W.eq.r)} tell you about the system?`;
        if (ph === 'back') return `${w} = ${num(W.found.val)}. Now find ${v}: put ${num(W.found.val)} in for ${w} in one of the equations. Which one is quicker?`;
        if (ph === 'check') { const c = W.cand; return `Is (${num(c.x)}, ${num(c.y)}) really a solution? A solution must work in both original equations. Test both.`; }
        return '';
      };

      /* ---- tokens: every variable in a card is a button ---- */
      const sideNodes = (list, mkTok) => {
        const out = [];
        list.forEach(([c, v], i) => {
          const neg = c < 0, a = Math.abs(c);
          out.push((i === 0 ? (neg ? MI : '') : (neg ? ' ' + MI + ' ' : ' + ')) + (v ? (a === 1 ? '' : a) : a));
          if (v) out.push(mkTok(v));
        });
        return out;
      };
      const cardEl = i => {
        const S = W.S, E = S.E[i], live = W.phase === 'sub';
        const mkTok = v => (live ? h('button', { type: 'button', class: 'ssb-tok', 'aria-label': `${v} in equation ${i ? 'B' : 'A'}`, onclick: () => onTok(i, v) }, v) : v);
        const showNew = i === S.src && !S.solved && W.expr;
        const el = h('div', { class: 'ssb-card ' + (i ? 'b' : 'a') }, h('span', { class: 'ssb-nm' }, i ? 'B' : 'A'));
        if (showNew) {
          el.append(h('span', { class: 'ssb-old' }, 'Given: ' + eqStr(E)));
          el.append(h('span', { class: 'ssb-eq' }, ...sideNodes([[1, S.v]], mkTok), ' = ', ...sideNodes(S.exprList, mkTok)));
        } else el.append(h('span', { class: 'ssb-eq' }, ...sideNodes(E.l, mkTok), ' = ', ...sideNodes(E.r, mkTok)));
        if (E.tag) el.append(h('span', { class: 'ssb-tag' }, E.tag));
        return el;
      };
      const onTok = (ei, v) => {
        if (W.phase !== 'sub') return;
        const S = W.S;
        if (ei === S.src) {
          err(); W.fb = bad('Not there.') + ` Equation A is where we got ${S.v} = ${S.exprStr}. Writing that back into A only gives a true but useless statement. Use it in the other equation, B, where ${S.v} is still a mystery.`;
        } else if (v !== S.v) {
          err(); W.fb = bad('Not that one.') + ` ${v} is still unknown. A told us what ${S.v} equals, so replace the ${S.v} in B.`;
        } else { doReplace(); return; }
        refresh();
      };

      /* ---- the phases ---- */
      const pickPred = i => {
        const S = W.S, ch = S.pred.ch[i], right = i === S.pred.ans;
        if (!right) err();
        W.fb = (right ? good('Yes.') : bad('Not quite.')) + ' ' + ch[1] + (S.pred.hide ? ' Now the lines appear. Then substitute to see what the algebra says.' : '');
        W.lines = true; go(S.solved ? 'sub' : 'iso'); refresh();
      };
      const isoMoves = () => {
        const S = W.S, b = S.e[S.src][S.w], c = S.e[S.src].c, v = S.v, w = S.w, bw = plain(Math.abs(b), w);
        const all = {
          corr: { label: b > 0 ? `Subtract ${bw} from both sides` : `Add ${bw} to both sides`, ok: true,
            fb: `${b > 0 ? 'Subtracting' : 'Adding'} ${bw} cancels the ${b > 0 ? '+' : MI}${bw} on the left, leaving just ${v}. The right side changes the same way. Now ${v} = ${S.exprStr}: ${v} equals an expression.` },
          const: { label: c > 0 ? `Subtract ${c} from both sides` : `Add ${Math.abs(c)} to both sides`,
            fb: `That removes ${Math.abs(c)} from the right side, but the ${bw} is still next to ${v} on the left. ${v} is not alone yet.` },
          sign: { label: b > 0 ? `Add ${bw} to both sides` : `Subtract ${bw} from both sides`,
            fb: `That puts another ${bw} on the left instead of canceling the one that is there. To cancel ${b > 0 ? '+' : MI}${bw} you do the opposite: ${b > 0 ? 'subtract' : 'add'} ${bw}.` },
          div: { label: `Divide both sides by ${b}`,
            fb: `Dividing every term by ${b} turns ${v} into ${v}/${b}, so ${v} is not alone. Cancel the ${bw} with a subtraction (or addition) instead.` }
        };
        return (S.ord || ['corr', 'const', 'sign']).filter(k => k !== 'div' || Math.abs(b) !== 1).map(k => [k, all[k]]);
      };
      const pickIso = key => {
        const mv = isoMoves().find(q => q[0] === key)[1], S = W.S;
        if (!mv.ok) { err(); W.fb = bad('Not that move.') + ' ' + mv.fb; refresh(); return; }
        W.expr = S.exprList; W.rows.push({ note: 'Get ' + S.v + ' alone in A', eq: `${S.v} = ${S.exprStr}` });
        W.fb = good('Good.') + ' ' + mv.fb; go('sub'); refresh();
      };
      const subHtml = () => {
        const S = W.S, B = S.E[S.t], par = `<span class="ssb-sub">(${S.exprStr})</span>`;
        const mag = (a, v) => (v === S.v ? (a === 1 ? par : a + par) : plain(a, v));
        return side(B.l, mag) + ' = ' + side(B.r, plain);
      };
      const doReplace = () => {
        const S = W.S;
        W.rows.push({ note: `Replace ${S.v} in B with (${S.exprStr})`, eq: subHtml() });
        W.fb = good('Replaced.') + ` A says ${S.v} and ${S.exprStr} are the same number, so writing one for the other cannot change B. B now has only ${S.w} in it. The parentheses matter: they keep the whole expression together.`;
        go('simp'); refresh();
      };
      const afterEq = () => {
        const S = W.S, { p, q, r } = W.eq;
        if (q0(p)) { go('verdict'); return; }
        if (p[0] === 1 && p[1] === 1 && q0(q)) { solvedNow(); return; }
        go('solve');
      };
      const solvedNow = () => {
        const S = W.S, val = qval(W.eq.r);
        W.found = { w: S.w, val }; st.fa = 0; go('back');
        stopFa(); cancelFa = animateTo(st, { fa: 1 }, 700, () => P.requestDraw());
      };
      const doSimplify = () => {
        const S = W.S, w = S.w, cv = S.cv, cw = S.cw, cvm = cv * S.m, p = cw + cvm, q = cv * S.k, out = [];
        if (cv !== 1) {
          const dist = side(S.exprList.map(([c, vv]) => [cv * c, vv]).filter(t => t[0] !== 0), plain);
          out.push(`Distribute ${cv === -1 ? 'the minus sign' : 'the ' + num(cv)}: ${cv === -1 ? MI : num(cv)}(${S.exprStr}) = ${dist}.`);
        } else out.push('The parentheses are multiplied by 1, so they can come off.');
        if (cw !== 0 && cvm !== 0) {
          const vFirst = S.E[S.t].l.findIndex(t => t[1] === S.v) < S.E[S.t].l.findIndex(t => t[1] === w), a1 = vFirst ? cvm : cw, a2 = vFirst ? cw : cvm;
          out.push(`Combine the ${w} terms: ${tt(a1, w)} ${a2 < 0 ? MI : '+'} ${tt(Math.abs(a2), w)} = ${p === 0 ? '0' + w : tt(p, w)}.`);
        }
        W.eq = { p: Q(p), q: Q(q), r: Q(S.tc) };
        W.rows.push({ note: 'Simplify', eq: eqQ(W.eq.p, W.eq.q, W.eq.r, w) });
        W.fb = good('Simplified.') + ' ' + out.join(' ') + (p === 0 ? ` The ${w} terms cancel completely, so only numbers are left.` : '');
        afterEq(); refresh();
      };
      const doOp = () => {
        const S = W.S, w = S.w, { p, q, r } = W.eq, k = W.op, n = W.amt, N = Q(n), nn = num(n), sg = a => (a[0] > 0 ? '+' : '') + qtxt(a);
        const f = k === 'add' ? x => qadd(x, N) : k === 'sub' ? x => qadd(x, Q(-n)) : k === 'mul' ? x => qmul(x, N) : x => qdiv(x, N);
        const nq = (k === 'add' || k === 'sub') ? f(q) : f(q), np = (k === 'mul' || k === 'div') ? f(p) : p;
        const nr = f(r), phr = opWord(k, n);
        W.hist.push({ eq: { p, q, r }, rows: W.rows.length });
        let msg;
        if ((k === 'add' || k === 'sub')) {
          if (!q0(q) && q0(nq)) msg = good('Good.') + ` ${opGer(k, n)} cancels the ${sg(q)} on the left: ${sg(q)} ${k === 'add' ? '+' : MI} ${nn} = 0. The right side gets the same change, so ${qtxt(r)} becomes ${qtxt(nr)}. Both sides changed equally, so the equation stays balanced.`;
          else if (q0(q)) msg = 'Allowed: both sides changed equally. But there is no added or subtracted number left on the left. The ' + qpw(p, w) + ' needs to be divided away.';
          else msg = `Allowed: both sides changed equally, so it is still true. But the left side now has ${sg(nq)} next to the ${w} term. To cancel ${sg(nq)}, ${nq[0] > 0 ? 'subtract' : 'add'} ${qtxt([Math.abs(nq[0]), nq[1]])}.`;
        } else if (k === 'div' && q0(q) && np[0] === np[1]) {
          msg = good('Good.') + ` ${qtxt(p)}${w} means ${qtxt(p)} times ${w}. ${opGer(k, n)} undoes the multiplying: ${qtxt(p)}${w} ÷ ${nn} = ${w}, and ${qtxt(r)} ÷ ${nn} = ${qtxt(nr)}.`;
        } else if (!q0(q)) {
          msg = `Allowed: you did the same thing to both sides. But every term had to change, so fractions can appear. It is usually easier to cancel the added or subtracted number first.`;
        } else msg = `Allowed: both sides changed equally. But it did not get ${w} alone. Think about what ${qpw(p, w)} is doing to ${w}, and undo it.`;
        W.eq = { p: np, q: nq, r: nr };
        W.rows.push({ note: phr.charAt(0).toUpperCase() + phr.slice(1), eq: eqQ(np, nq, nr, w) });
        W.fb = msg;
        if (np[0] === np[1] && q0(nq)) { W.fb += ` Now ${w} = ${qtxt(nr)}.`; solvedNow(); } else if (q0(np)) go('verdict');
        refresh();
      };
      const undoOp = () => {
        const last = W.hist.pop(); if (!last) return;
        W.eq = last.eq; W.rows.length = last.rows; W.fb = 'Undone. The equation is back to what it was.'; refresh();
      };
      const doVerdict = i => {
        const S = W.S, w = S.w, { q, r } = W.eq, truth = qtxt(q) === qtxt(r), st0 = `${qtxt(q)} = ${qtxt(r)}`;
        const right = truth ? 2 : 1;
        if (i !== right) {
          err();
          W.fb = bad('Not quite.') + ' ' + (i === 0 ? `There is no ${w} left to solve for: the ${w} terms canceled. What is left, ${st0}, does not mention ${w} at all, so it cannot give one value of ${w}.`
            : truth ? `${st0} is true, so nothing is ruled out. It is true for every ${w}, not for none.`
            : `${st0} is false for every ${w}, so no ${w} makes B true on line A. It is not true for every ${w}.`);
          refresh(); return;
        }
        const m1 = slopeOf(S.e[0]), m2 = slopeOf(S.e[1]), i1 = icptOf(S.e[0]), i2 = icptOf(S.e[1]);
        if (truth) {
          W.fb = good('Right.') + ` ${st0} is true whatever ${w} is. So every point of line A also satisfies B: they are the same line (both have slope ${num(m1)} and y-intercept ${num(i1)}). Look at the graph: B is drawn dashed on top of A.`;
          W.note = 'Same line: every point is a solution';
        } else {
          W.fb = good('Right.') + ` ${st0} is false whatever ${w} is, so no point of line A satisfies B. The lines have the same slope, ${num(m1)}, and different y-intercepts, ${num(i1)} and ${num(i2)}. Look at the graph: parallel lines never meet.`;
          W.note = 'Parallel: no common point';
        }
        finish(); refresh();
      };
      const doBack = ei => {
        const S = W.S;
        if (ei !== S.src) {
          W.fb = `That works too, but ${S.v} is not alone there, so you would have to solve another equation. In equation A, ${S.v} is already alone. Use A.`; refresh(); return;
        }
        const val = W.found.val, vals = { [S.w]: val }, vv = S.m * val + S.k;
        W.cand = pointFor(val);
        W.rows.push({ note: `Put ${S.w} = ${num(val)} into ${S.solved ? 'A' : 'A (new form)'}`, eq: `${S.v} = ${side(S.exprList, withVals(vals))} = ${num(vv)}` });
        W.fb = good('Got it.') + ` ${S.v} = ${num(vv)}. The point to test is (${num(W.cand.x)}, ${num(W.cand.y)}). The yellow ring on the graph marks it, but it is not confirmed yet.`;
        go('check'); refresh();
      };
      const doTest = ei => {
        const S = W.S, E = S.E[ei], pt = W.cand, nm = ei ? 'B' : 'A';
        const ls = side(E.l, withVals(pt)), rs = side(E.r, withVals(pt)), lv = evalList(E.l, pt), rv = evalList(E.r, pt), okk = near0(lv - rv);
        W.tested[ei] = true;
        W.rows.push({ note: `Test in ${nm}: ${eqStr(E)}`, eq: `${ls} = ${rs}, so ${num(lv)} = ${num(rv)} ${okk ? '✓' : '✗'}` });
        if (W.tested[0] && W.tested[1]) {
          W.sol = pt; W.fb = good('Both true.') + ` The point (${num(pt.x)}, ${num(pt.y)}) is on line A and on line B, so it is where the lines cross. The violet point shows it. This is the solution of the system.`;
          finish();
        } else W.fb = `True in ${nm}. That is not enough yet: many points lie on line ${nm} alone. Test the other equation too.`;
        refresh();
      };

      /* ---- the action area for each phase ---- */
      const actions = () => {
        const S = W.S, ph = W.phase, out = [];
        const row = (...els) => h('div', { class: 'ctl buttons' }, ...els);
        if (ph === 'pred') out.push(row(...S.pred.ch.map((c, i) => btn(c[0], () => pickPred(i)))));
        else if (ph === 'iso') out.push(row(...isoMoves().map(([k, m]) => btn(m.label, () => pickIso(k)))));
        else if (ph === 'sub') out.push(row(btn(`Replace ${S.v} with ${S.exprStr}`, doReplace, true)));
        else if (ph === 'simp') out.push(row(btn(S.cv === 1 ? 'Remove parentheses and combine like terms' : 'Distribute, then combine like terms', doSimplify, true)));
        else if (ph === 'solve') {
          const kinds = [['add', 'Add'], ['sub', 'Subtract'], ['mul', 'Multiply'], ['div', 'Divide']];
          const out2 = h('output', { 'aria-live': 'polite' }), ap = btn('', doOp, true);
          const kb = kinds.map(([k, l]) => btn(l, () => { W.op = k; if ((k === 'add' || k === 'sub') && W.amt < 1) W.amt = Math.abs(W.amt) || 1; upd(); }));
          const upd = () => {
            out2.textContent = num(W.amt); ap.textContent = 'Apply: ' + opWord(W.op, W.amt);
            kb.forEach((b, i) => { b.classList.toggle('primary', kinds[i][0] === W.op); b.setAttribute('aria-pressed', String(kinds[i][0] === W.op)); });
          };
          const stepA = d => { const lo = (W.op === 'add' || W.op === 'sub') ? 1 : -12; let n = W.amt + d; if (n === 0) n += d > 0 ? 1 : -1; W.amt = clamp(n, lo, 40); upd(); };
          upd();
          out.push(row(...kb));
          out.push(h('div', { class: 'ssb-step' }, 'Amount', btn('−5', () => stepA(-5)), btn('−1', () => stepA(-1)), out2, btn('+1', () => stepA(1)), btn('+5', () => stepA(5))));
          const un = btn('Undo', undoOp); un.disabled = !W.hist.length;
          out.push(row(ap, un));
        } else if (ph === 'verdict') {
          out.push(row(...['One solution', 'No solution', 'Infinitely many solutions'].map((l, i) => btn(l, () => doVerdict(i)))));
        } else if (ph === 'back') {
          out.push(row(...[0, 1].map(i => btn(`Put ${S.w} = ${num(W.found.val)} into ${i ? 'B' : 'A'}`, () => doBack(i)))));
        } else if (ph === 'check') {
          const pt = W.cand;
          out.push(row(...[0, 1].map(i => { const b = btn(`Test (${num(pt.x)}, ${num(pt.y)}) in ${i ? 'B' : 'A'}`, () => doTest(i), true); b.disabled = !!W.tested[i]; return b; })));
        }
        if (ph !== 'pred' && (W.rows.length || W.expr)) out.push(row(btn('Start this system over', () => { const o = W.err; wbReset(W.S); W.err = o; refresh(); })));
        return out;
      };

      const refresh = () => {
        const S = W.S;
        promptEl.innerHTML = W.promptHtml; promptEl.style.display = W.promptHtml ? '' : 'none';
        cardsEl.replaceChildren(cardEl(0), cardEl(1));
        logEl.replaceChildren(...W.rows.map(r => h('div', { class: 'ssb-row' }, h('span', { class: 'ssb-note' }, r.note), h('span', { class: 'ssb-req', html: r.eq }))));
        logEl.style.display = W.rows.length ? '' : 'none';
        const nt = nextText();
        coachEl.innerHTML = (W.fb ? `<p>${W.fb}</p>` : '') + (nt ? `<p class="ssb-next">${nt}</p>` : '');
        actsEl.replaceChildren(...actions());
        const showCh = !st.practice && st.mode === 'work' && (st.sysI === 2 || st.sysI === 3);
        chooserEl.style.display = showCh ? '' : 'none';
        if (showCh) Array.from(chooserEl.children).forEach((b, i) => b.classList.toggle('primary', st.sysI === i + 2));
        sync();
      };
      [['No-solution example', 2], ['Same-line example', 3]].forEach(([l, i]) => chooserEl.append(btn(l, () => { st.sysI = i; wbReset(SYS[i]); refresh(); })));
      chooserEl.style.display = 'none';

      /* ================= the probe (step 1) ================= */
      let txS, probeRo;
      grp('probe', () => {
        C.title('Try a point on line A');
        txS = C.slider({ label: 'x', min: 0, max: 5, step: 1, value: st.tx, format: v => 'x = ' + num(v), onInput: v => { cancel(); st.tx = v; sync(); } });
        probeRo = C.readout();
        C.hint('Drag the ring along line A, or use the slider.');
      });
      const updProbe = () => {
        const S = SYS[0], x = st.tx, y = S.m * x + S.k, vals = { x, y };
        const lv = evalList(S.B.l, vals), rv = evalList(S.B.r, vals), onB = near0(lv - rv);
        probeRo.innerHTML = `<span class="k">On line A</span> y = ${side(S.exprList, withVals({ x }))} = ${num(y)}<br>` +
          `<span class="k">Test B</span> ${side(S.B.l, withVals(vals))} = ${num(lv)}, and B needs ${num(rv)}<br>` +
          (onB ? good('Equal.') + ' The point is on both lines.' : 'Not equal, so this point is not on B.');
      };

      /* ================= practice ================= */
      const PR = { idx: 0, solved: 0, first: 0, over: false, fin: false };
      let startBtn, pTally, pFinal, pFb, pNext;
      C.title('Practice');
      C.hint('Six short problems, with the same workbench. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); if (st.practice) leavePractice(); else { st.practice = true; PR.idx = 0; PR.solved = 0; PR.first = 0; PR.over = false; loadProb(); } } }])[0];
      grp('prac', () => {
        pTally = h('p', { class: 'ctl-title ssb-tally' });
        pFinal = h('div', { style: 'display:flex;flex-direction:column;gap:10px' });
        pFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pNext = btn('Next problem', () => nextProb(), true); pNext.disabled = true;
        panel.append(pTally, pFinal, pFb, h('div', { class: 'ctl buttons' }, pNext));
      });
      const tally = () => { pTally.textContent = `${PR.solved} of ${PROBS.length} solved, ${PR.first} on the first try`; };
      const leavePractice = () => { st.practice = false; wbReset(SYS[st.sysI]); W.promptHtml = ''; W.onDone = null; refresh(); };
      const loadProb = () => {
        const pr = PROBS[PR.idx]; PR.fin = false;
        wbReset(pr.sys); W.err = 0; W.onDone = onProbDone;
        W.promptHtml = `<b>Problem ${PR.idx + 1} of ${PROBS.length}: ${pr.name}.</b> ${pr.story}`;
        pFinal.replaceChildren(); pFb.innerHTML = ''; pNext.disabled = true; pNext.textContent = PR.idx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        tally(); refresh();
      };
      const completeProb = () => {
        PR.fin = true; PR.solved++; const first = W.err === 0; if (first) PR.first++;
        pNext.disabled = false; tally();
        pFb.innerHTML = good('Problem solved.') + (first ? ' You did it with no wrong choices.' : ' You had a wrong choice on the way, and the feedback told you why. That is how it sticks.');
      };
      const onProbDone = () => {
        const pr = PROBS[PR.idx];
        if (!pr.final) { completeProb(); return; }
        pFinal.replaceChildren(h('p', { class: 'ssb-prompt' }, '' + pr.final.q), h('div', { class: 'ctl buttons', style: 'flex-direction:column;align-items:stretch' },
          ...pr.final.ch.map((c, i) => btn(c[0], () => {
            if (PR.fin) return;
            if (i === pr.final.ans) { pFinal.querySelectorAll('button').forEach(b => { b.disabled = true; }); completeProb(); pFb.innerHTML = good('Right.') + ' ' + c[1] + '<br>' + pFb.innerHTML; }
            else { err(); pFb.innerHTML = bad('Not quite.') + ' ' + c[1]; }
          }))));
      };
      const nextProb = () => {
        if (PR.idx < PROBS.length - 1) { PR.idx++; loadProb(); return; }
        pFinal.replaceChildren(); pNext.disabled = true;
        pFb.innerHTML = `All six problems are done. You got ${PR.first} of ${PROBS.length} with no wrong choices. Press Back to the lesson, then Start practice to try again.`;
      };

      /* ================= canvas ================= */
      const lineEnds = (e, bd) => (e.y !== 0 ? [[bd.x0, (e.c - e.x * bd.x0) / e.y], [bd.x1, (e.c - e.x * bd.x1) / e.y]] : [[e.c / e.x, bd.y0], [e.c / e.x, bd.y1]]);
      P.onDraw = (c, p) => {
        const pal = p.pal, bd = p.bounds(), S = W.S, probe = st.mode === 'probe' && !st.practice;
        const fs = clamp(p.scale * .46, 12.5, 17), L = (t, x, y, o) => p.label(t, x, y, Object.assign({ italic: false, size: fs / .85 }, o));
        p.grid(1); p.ticks(1);
        if (W.lines || probe) {
          p.path(lineEnds(S.e[0], bd), { stroke: pal.blue, width: S.kind === 'same' ? 7 : 4 });
          p.path(lineEnds(S.e[1], bd), { stroke: pal.red, width: S.kind === 'same' ? 3 : 4, dash: S.kind === 'same' ? [10, 9] : undefined });
        } else {
          L('Choose your prediction. Then the lines appear.', p.cx, p.cy, { color: pal.muted });
        }
        if (!probe && W.found && st.fa > 0) {
          const f = W.found; c.globalAlpha = clamp(st.fa, 0, 1);
          if (f.w === 'x') { p.path([[f.val, bd.y0], [f.val, bd.y1]], { stroke: pal.green, width: 3, dash: [9, 8] }); L(`x = ${num(f.val)}`, f.val, bd.y1, { color: pal.green, dy: 22 }); }
          else { p.path([[bd.x0, f.val], [bd.x1, f.val]], { stroke: pal.green, width: 3, dash: [9, 8] }); L(`y = ${num(f.val)}`, bd.x1, f.val, { color: pal.green, align: 'right', dx: -10, dy: -14 }); }
          c.globalAlpha = 1;
        }
        if (!probe && W.cand && !W.sol) { p.dot(W.cand.x, W.cand.y, 11, null, pal.yellow, 4); L(`(${num(W.cand.x)}, ${num(W.cand.y)}) to test`, W.cand.x, W.cand.y, { dy: -26 }); }
        if (!probe && W.sol) { p.dot(W.sol.x, W.sol.y, 10, pal.violet, pal.stage, 3); L(`solution (${num(W.sol.x)}, ${num(W.sol.y)})`, W.sol.x, W.sol.y, { color: pal.violet, size: (fs + 2) / .85, dy: -26 }); }
        if (probe) {
          const x = st.tx, y = SYS[0].m * x + SYS[0].k, onB = near0(evalList(SYS[0].B.l, { x, y }) - 8);
          p.path([[x, 0], [x, y]], { stroke: pal.muted, width: 1.5, dash: [5, 5] });
          p.dot(x, y, 10, pal.stage, pal.brass, 3.5); p.dot(x, y, 4, pal.blue);
          L(`(${num(x)}, ${num(y)})${onB ? ' on A and B' : ''}`, x, y, { dy: -26, color: onB ? pal.violet : undefined });
        }
        if (!probe && W.note) L(W.note, p.cx, bd.y0, { dy: -22, color: pal.text });
        /* legend */
        const rows = [['A', eqStr(S.A), pal.blue], ['B', eqStr(S.B), pal.red]];
        c.font = `600 ${fs}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`; c.textAlign = 'left'; c.textBaseline = 'middle';
        const tw = Math.max(...rows.map(r => c.measureText(r[0] + ': ' + r[1]).width)), bx = 24, by = 24, bw = tw + 50, bh = rows.length * fs * 1.6 + 8;
        c.globalAlpha = .92; c.fillStyle = pal.stage; c.fillRect(bx, by, bw, bh); c.globalAlpha = 1;
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 1; c.strokeRect(bx + .5, by + .5, bw, bh);
        rows.forEach(([n, t, col], i) => {
          const y = by + 4 + fs * .8 + i * fs * 1.6;
          c.strokeStyle = col; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx + 9, y); c.lineTo(bx + 31, y); c.stroke();
          c.fillStyle = pal.text; c.fillText(n + ': ' + t, bx + 40, y);
        });
      };

      const sync = () => {
        const prac = st.practice, pr = st.mode === 'probe';
        vis(G.probe, !prac && pr); vis(G.wb, prac || !pr); vis(G.prac, prac);
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        txS.set(st.tx);
        if (!prac && pr) updProbe();
        P.draw();
      };

      draggable(P, {
        hit: (px, py) => { if (st.mode !== 'probe' || st.practice) return null; const S = SYS[0], x = st.tx; return near(P, x, S.m * x + S.k, px, py, 24) ? 'p' : null; },
        move: (id, x) => { cancel(); st.tx = clamp(Math.round(x), 0, 5); sync(); }
      });

      const apply = (patch, immediate) => {
        cancel();
        const nums = {}; let reset = false, wasPrac = st.practice;
        for (const k in patch) {
          if (k === 'mode') st.mode = patch[k];
          else if (k === 'sys') { st.sysI = patch[k]; reset = true; }
          else nums[k] = patch[k];
        }
        st.practice = false; W.onDone = null; W.promptHtml = '';
        if (reset || wasPrac) wbReset(SYS[st.sysI]);
        refresh();
        if (immediate) { Object.assign(st, nums); sync(); } else cancel = animateTo(st, nums, 900, sync);
      };
      wbReset(SYS[0]); refresh();
      return { destroy: () => { cancel(); cancelFa(); P.destroy(); }, apply };
    }
  });
}
