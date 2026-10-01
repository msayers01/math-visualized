/* =====================================================================
   SCHOOL — Forms of a linear equation
   ===================================================================== */
{
  const LIM = 9;   /* handles sit on the whole-number grid, at most 9 from the axes */

  /* ---------- exact fractions [n, d] (d > 0, lowest terms) and their text ---------- */
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a; };
  const Q = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; return [n / g + 0, d / g]; };
  const qadd = (a, b) => Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  const qmul = (a, b) => Q(a[0] * b[0], a[1] * b[1]);
  const qneg = a => [-a[0] + 0, a[1]];
  const qeq = (a, b) => a[0] === b[0] && a[1] === b[1];
  const qlt = (a, b) => a[0] * b[1] < b[0] * a[1];
  const zero = a => a[0] === 0;
  const iv = v => (v < 0 ? '−' : '') + Math.abs(v);                                   /* integer with a true minus */
  const qs = a => iv(a[0]) + (a[1] === 1 ? '' : '/' + a[1]);                           /* "−3/2" */
  const plus = a => zero(a) ? '' : (a[0] < 0 ? ' − ' : ' + ') + qs([Math.abs(a[0]), a[1]]);   /* " + 3/2", " − 2", "" */
  const minus = (v, a) => v + plus(qneg(a));                                            /* "x − 3", "x + 3", "y" */
  const cf = m => m[1] === 1 ? (Math.abs(m[0]) === 1 ? (m[0] < 0 ? '−' : '') : iv(m[0])) : (m[0] < 0 ? '−' : '') + '(' + Math.abs(m[0]) + '/' + m[1] + ')';
  const par = a => (a[0] < 0 || a[1] !== 1) ? '(' + qs(a) + ')' : qs(a);                /* a number as a factor: (2/3), (−3), 4 */
  const pt = (x, y) => '(' + qs(x) + ', ' + qs(y) + ')';
  const linStr = (ax, ay, k = 0) => {                                                   /* "−2x + 3y + 3" */
    let s = '';
    const add = (c, v) => { if (!c) return; const a = Math.abs(c), body = (v && a === 1 ? '' : a) + v; s += s ? (c < 0 ? ' − ' : ' + ') + body : (c < 0 ? '−' : '') + body; };
    add(ax, 'x'); add(ay, 'y'); add(k, '');
    return s || '0';
  };
  const joinTerms = (x, ks) => { let s = x; ks.forEach(k => { if (!zero(k)) s += s ? plus(k) : qs(k); }); return s || '0'; };

  /* ---------- a line as integers Ax + By = C: gcd 1, A not negative ---------- */
  const canon = (A, B, C) => {
    A = Math.round(A); B = Math.round(B); C = Math.round(C);
    if (!A && !B) return null;
    const g = gcd(gcd(A, B), C);
    A /= g; B /= g; C /= g;
    if (A < 0 || (A === 0 && B < 0)) { A = -A; B = -B; C = -C; }
    return { A: A + 0, B: B + 0, C: C + 0 };
  };
  const info = L => {
    const { A, B, C } = L, vert = B === 0;
    return { vert, m: vert ? null : Q(-A, B), b: vert ? null : Q(C, B), xi: A ? Q(C, A) : null, yi: B ? Q(C, B) : null };
  };
  const siText = (L, I) => I.vert ? 'x = ' + qs(I.xi) : 'y = ' + (zero(I.m) ? qs(I.b) : cf(I.m) + 'x' + plus(I.b));
  const stdText = L => linStr(L.A, L.B) + ' = ' + iv(L.C);
  const psRHS = (m, x1) => {
    if (zero(m)) return '0';
    const xe = minus('x', x1);
    if (m[0] === 1 && m[1] === 1) return xe;
    if (zero(x1)) return cf(m) + 'x';
    return cf(m) + '(' + xe + ')';
  };
  const psText = (x1, y1, m) => minus('y', y1) + ' = ' + psRHS(m, x1);
  const inBox = (x, y, s = LIM) => Math.abs(x) <= s && Math.abs(y) <= s;

  /* whole-number points of the line inside the box */
  const lattice = L => {
    const { A, B, C } = L, out = [];
    if (B === 0) { if (C % A === 0) { const x = C / A; if (Math.abs(x) <= LIM) for (let y = -LIM; y <= LIM; y++) out.push([x, y]); } }
    else for (let x = -LIM; x <= LIM; x++) { const n = C - A * x; if (n % B === 0 && Math.abs(n / B) <= LIM) out.push([x + 0, n / B + 0]); }
    return out;
  };
  const nearest = lat => lat.slice().sort((a, b) => (Math.abs(a[0]) + Math.abs(a[1])) - (Math.abs(b[0]) + Math.abs(b[1])) || Math.abs(a[0]) - Math.abs(b[0]));
  /* two neighbouring whole-number points of the line, one reduced step apart, both in the box */
  const pickPair = (L, fwdOnly) => {
    const d = L.B === 0 ? [0, 1] : (m => [m[1], m[0]])(Q(-L.A, L.B));
    for (const a of nearest(lattice(L))) {
      const f = [a[0] + d[0], a[1] + d[1]], r = [a[0] - d[0], a[1] - d[1]];
      if (inBox(f[0], f[1])) return [a, f];
      if (!fwdOnly && inBox(r[0], r[1])) return [r, a];
    }
    return null;
  };

  /* ---------- the Convert walkthrough: every step is a choice among three moves ---------- */
  const routeSI = (x1, y1, m) => {
    const [p, q] = m, X1 = Q(x1), Y1 = Q(y1), c1 = qmul(m, Q(-x1)), ms = qs(m);
    const needD = x1 !== 0 && p !== 0 && !(p === 1 && q === 1), needA = y1 !== 0, hasC = !zero(c1), needC = hasC && needA;
    const eq = (dist, add, comb) => {
      const left = add ? 'y' : minus('y', Y1);
      let rhs;
      if (needD && !dist) rhs = psRHS(m, X1) + (add ? plus(Y1) : '');
      else {
        let ks = []; if (hasC) ks.push(c1); if (add && needA) ks.push(Y1);
        if (comb && ks.length > 1) ks = [qadd(ks[0], ks[1])];
        rhs = joinTerms(p ? cf(m) + 'x' : '', ks);
      }
      return left + ' = ' + rhs;
    };
    const steps = [];
    if (needD) steps.push({
      label: 'Distribute ' + ms + ' over the parentheses', eq: eq(true, false, false),
      why: 'Distribute: ' + par(m) + ' × x = ' + cf(m) + 'x and ' + par(m) + ' × ' + par(Q(-x1)) + ' = ' + qs(c1) + '.',
      bad: [{ label: 'Multiply only the x by ' + ms, why: ms + ' multiplies everything inside the parentheses, the number as well as the x. ' + ms + ' × ' + iv(-x1) + ' is ' + qs(c1) + ', not ' + iv(-x1) + '.' },
            { label: 'Add ' + ms + ' to each term inside the parentheses', why: 'The slope multiplies the whole group. Adding it gives a different expression, so a different line.' }] });
    if (needA) {
      const pos = y1 > 0, Y = Math.abs(y1);
      steps.push({
        label: pos ? 'Add ' + Y + ' to both sides' : 'Subtract ' + Y + ' from both sides', eq: eq(true, true, false),
        why: pos ? 'The left side is y − ' + Y + '. Adding ' + Y + ' to both sides cancels the − ' + Y + ' and leaves y alone. The same move on both sides keeps the equation true.'
                 : 'The left side is y + ' + Y + '. Subtracting ' + Y + ' from both sides cancels the + ' + Y + ' and leaves y alone. The same move on both sides keeps the equation true.',
        bad: [{ label: pos ? 'Subtract ' + Y + ' from both sides' : 'Add ' + Y + ' to both sides',
                why: pos ? 'The left side is y − ' + Y + '. Subtracting ' + Y + ' again gives y − ' + 2 * Y + ', and y is still not alone. To undo "− ' + Y + '" you add ' + Y + '.'
                         : 'The left side is y + ' + Y + '. Adding ' + Y + ' gives y + ' + 2 * Y + ', and y is still not alone. To undo "+ ' + Y + '" you subtract ' + Y + '.' },
              { label: (pos ? 'Add ' : 'Subtract ') + Y + (pos ? ' to' : ' from') + ' the right side only', why: 'A move must be made on both sides. Changing only one side changes the equation, so the line would move.' }] });
    }
    if (needC) {
      const sum = qadd(c1, Y1), same = (c1[0] < 0) === (Y1[0] < 0);
      steps.push({
        label: 'Combine the two numbers, keeping their signs', eq: eq(true, true, true),
        why: 'Combine: ' + qs(c1) + plus(Y1) + ' = ' + qs(sum) + '. This single number is b, the y-intercept.',
        bad: [same ? { label: 'Subtract the second number from the first', why: 'The two numbers have the same sign, so they add: ' + qs(c1) + plus(Y1) + ' = ' + qs(sum) + '.' }
                   : { label: 'Add the two numbers without their signs', why: 'Each number keeps its sign: ' + qs(c1) + plus(Y1) + ' = ' + qs(sum) + ', not ' + qs([Math.abs(c1[0]) * Y1[1] + Math.abs(Y1[0]) * c1[1], c1[1] * Y1[1]]) + '.' },
              { label: 'Stop here: the numbers can stay separate', why: 'That is true but unfinished. Slope-intercept form is y = mx + b with a single number b.' }] });
    }
    return { start: psText(X1, Y1, m), steps, kind: 'si' };
  };

  const routeStd = (x1, y1, m) => {
    const [p, q] = m, X1 = Q(x1), Y1 = Q(y1), ye = minus('y', Y1), xe = minus('x', X1), P = Math.abs(p);
    const cfI = v => v === 1 ? '' : v === -1 ? '−' : iv(v);
    const needClear = q > 1;
    const leftPar = q > 1 && y1 !== 0, rightPar = x1 !== 0 && p !== 0 && p !== 1, needD = leftPar || rightPar;
    const needMX = p !== 0, kc = -q * y1, needMC = kc !== 0, needSign = p > 0;
    const unexp = (q > 1 ? (y1 ? q + '(' + ye + ')' : q + 'y') : ye) + ' = ' + (p === 0 ? '0' : p === 1 ? xe : x1 === 0 ? cfI(p) + 'x' : cfI(p) + '(' + xe + ')');
    const L = { ax: 0, ay: q, k: -q * y1 }, R = { ax: p, k: -p * x1 };
    const fm = () => linStr(L.ax, L.ay, L.k) + ' = ' + linStr(R.ax, 0, R.k);
    const sameSide = 'Do the same to both sides.';
    const steps = [];
    if (needClear) steps.push({
      label: 'Multiply both sides by ' + q, eq: needD ? unexp : fm(),
      why: 'Multiplying both sides by ' + q + ', the denominator, clears the fraction: ' + q + ' × ' + par(m) + ' = ' + iv(p) + '.',
      bad: [{ label: 'Multiply the right side by ' + q + ' only', why: 'Both sides must be multiplied by the same number. Changing one side changes the equation.' },
            { label: 'Multiply both sides by ' + P, why: 'To clear a fraction you multiply by its denominator, ' + q + '. Multiplying by ' + P + ' leaves a fraction in the equation.' }] });
    if (needD) steps.push({
      label: 'Distribute on each side', eq: fm(),
      why: 'Multiply each term in each pair of parentheses by the number in front of it.',
      bad: [{ label: 'Multiply only the variables, not the numbers', why: 'Every term inside the parentheses gets multiplied, the plain numbers as well as the variables.' },
            { label: 'Add the number in front to each term inside', why: 'Distributing means multiplying, not adding. Adding gives a different equation.' }] });
    if (needMX) {
      const t = (P === 1 ? '' : P) + 'x', pos = p > 0;
      L.ax = -p; R.ax = 0;
      steps.push({
        label: (pos ? 'Subtract ' : 'Add ') + t + (pos ? ' from' : ' to') + ' both sides', eq: fm(),
        why: pos ? 'The right side has + ' + t + '. Subtracting ' + t + ' from both sides moves the x term to the left. ' + sameSide
                 : 'The right side has − ' + t + '. Adding ' + t + ' to both sides moves the x term to the left. ' + sameSide,
        bad: [{ label: (pos ? 'Add ' : 'Subtract ') + t + (pos ? ' to' : ' from') + ' both sides', why: 'The right side has ' + (pos ? '+ ' : '− ') + t + '. ' + (pos ? 'Adding' : 'Subtracting') + ' ' + t + ' more does not remove it. You need the opposite move.' },
              { label: (pos ? 'Subtract ' : 'Add ') + t + (pos ? ' from' : ' to') + ' the right side only', why: 'A move must be made on both sides. Changing only one side changes the equation.' }] });
    }
    if (needMC) {
      const K = Math.abs(kc), pos = kc < 0;
      L.k = 0; R.k = R.k + q * y1;
      steps.push({
        label: (pos ? 'Add ' : 'Subtract ') + K + (pos ? ' to' : ' from') + ' both sides', eq: fm(),
        why: 'The left side has ' + (pos ? '− ' : '+ ') + K + '. ' + (pos ? 'Adding ' : 'Subtracting ') + K + ' on both sides removes it from the left and gathers the numbers on the right. ' + sameSide,
        bad: [{ label: (pos ? 'Subtract ' : 'Add ') + K + (pos ? ' from' : ' to') + ' both sides', why: 'The left side has ' + (pos ? '− ' : '+ ') + K + '. ' + (pos ? 'Subtracting' : 'Adding') + ' ' + K + ' more makes it twice as big. You need the opposite move.' },
              { label: (pos ? 'Add ' : 'Subtract ') + K + (pos ? ' to' : ' from') + ' the left side only', why: 'A move must be made on both sides. Changing only one side changes the equation.' }] });
    }
    if (needSign) {
      const cur = fm();
      L.ax = -L.ax; L.ay = -L.ay; R.k = -R.k;
      steps.push({
        label: 'Multiply both sides by −1', eq: fm(),
        why: 'Standard form asks for A not negative. Multiplying both sides by −1 flips every sign and keeps the equation true.',
        bad: [{ label: 'Multiply only the x term by −1', why: 'Every term on both sides must be multiplied. Changing one term changes the equation.' },
              { label: 'Stop here: ' + cur + ' is already standard form', why: 'It is the same line, but standard form asks for A not negative. Multiply both sides by −1.' }] });
    }
    return { start: psText(X1, Y1, m), steps, kind: 'std' };
  };

  /* lines to match in the challenge: two marked whole-number points each (and no equation shown) */
  const TG = [
    { A: 1, B: -2, C: -4, pts: [[-4, 0], [2, 3]] },
    { A: 3, B: 2, C: 6, pts: [[-2, 6], [2, 0]] },
    { A: 2, B: -3, C: 6, pts: [[0, -2], [6, 2]] },
    { A: 1, B: 1, C: 4, pts: [[-2, 6], [5, -1]] },
    { A: 2, B: -1, C: 3, pts: [[0, -3], [3, 3]] },
    { A: 0, B: 1, C: -2, pts: [[-5, -2], [4, -2]] },
    { A: 1, B: 0, C: 3, pts: [[3, -4], [3, 5]] }
  ];

  register({
    id: 'forms-of-a-linear-equation', level: 'school',
    title: 'Forms of a linear equation',
    blurb: 'Move one line and watch its point-slope, slope-intercept and standard forms change together, then see which lines are proportional.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 4.2;
      p.grid(1);
      p.path([[-4.4, -1.93], [4.4, 3.93]], { stroke: pal.blue, width: 2.6 });
      p.path([[-4.4, -2.93], [4.4, 2.93]], { stroke: pal.violet, width: 2, dash: [6, 5] });
      p.path([[-3, -1], [3, 3], [3, -1]], { fill: alpha(pal.yellow, .2), close: true });
      p.path([[-3, -1], [3, -1]], { stroke: pal.green, width: 2.4 });
      p.path([[3, -1], [3, 3]], { stroke: pal.red, width: 2.4 });
      p.dot(0, 1, 5, pal.yellow, pal.stage, 1.5);
    },
    hook: String.raw`The equations \(y+1=\tfrac23(x+3)\), \(y=\tfrac23x+1\) and \(2x-3y=-3\) look different. Why are they the same line, and why do we keep all three?`,
    steps: [
      { title: 'Two points give the slope',
        text: String.raw`<p>A is \((-3,-1)\) and B is \((3,3)\). From A to B the <b>run</b> (green) is \(6\) and the <b>rise</b> (red) is \(4\), so the slope is \(\tfrac46=\tfrac23\).</p><p>Call A the known point. Any point \((x,y)\) on the line has the same slope to A, so \(y-(-1)=\tfrac23\big(x-(-3)\big)\), which tidies to \(y+1=\tfrac23(x+3)\). This is <b>point-slope form</b>. Drag A or B and watch every form in the panel change together.</p>`,
        set: { mode: 'pts', view: 'ps', tgt: -1, conv: '', x1: -3, y1: -1, dx: 6, dy: 4 } },
      { title: 'Point-slope to slope-intercept',
        text: String.raw`<p>The yellow point is where the line crosses the y-axis: \((0,1)\), so \(b=1\). Slope-intercept form shows \(m\) and \(b\) at once: \(y=\tfrac23x+1\).</p><p>Now do the algebra yourself in the <b>Convert</b> box. Start from \(y+1=\tfrac23(x+3)\) and pick each move. A wrong move tells you why it fails. The right moves are distribute, subtract \(1\) from both sides, then combine \(2-1\).</p>`,
        set: { mode: 'pts', view: 'si', tgt: -1, conv: 'si', x1: -3, y1: -1, dx: 6, dy: 4 } },
      { title: 'Standard form and intercepts',
        text: String.raw`<p>Standard form is \(Ax+By=C\). Here it is \(3x+2y=12\), so \(A=3\), \(B=2\), \(C=12\).</p><p>Put \(y=0\): \(3x=12\), so \(x=\tfrac CA=4\). Put \(x=0\): \(2y=12\), so \(y=\tfrac CB=6\). The yellow points are the intercepts \((4,0)\) and \((0,6)\). Two points make a line, so this form is quick to graph. The slope is \(-\tfrac AB=-\tfrac32\). Drag an intercept to slide the line (only \(C\) changes) or use the sliders.</p>`,
        set: { mode: 'std', view: 'std', tgt: -1, conv: '', A: 3, B: 2, C: 12 } },
      { title: 'Proportional or not?',
        text: String.raw`<p>The blue line is \(y=2x+2\): slope \(2\), crossing the y-axis at \((0,2)\). The dashed violet line has the same slope but passes through the origin: \(y=2x\).</p><p>Compare \(y\div x\) at \(x=1,2,3,4\). On the dashed line it is \(2\) every time. On the blue line it is \(4,\ 3,\ \tfrac83,\ \tfrac52\). Now drag the blue y-intercept down to \(0\) and watch the ratios all become \(2\). The line is then proportional: \(y=kx\) with \(k=2\).</p>`,
        set: { mode: 'si', view: 'ratio', tgt: -1, conv: '', x1: 0, y1: 2, dx: 1, dy: 2 } }
    ],
    formal: String.raw`
      <p>One line can be written in several ways. Each form is built from different givens and shows different facts at a glance, so it helps to move between them.</p>
      <h3>Slope from two points</h3>
      <p>For two points \((x_1,y_1)\) and \((x_2,y_2)\) with \(x_1\neq x_2\),
      \[ m=\frac{y_2-y_1}{x_2-x_1}=\frac{\text{rise}}{\text{run}}. \]
      Swapping the points changes the sign of the top and the bottom, so \(m\) does not change. If \(x_1=x_2\) the run is \(0\): the line is vertical and its slope is undefined.</p>
      <h3>Point-slope form</h3>
      <p>Take a known point \((x_1,y_1)\) and any other point \((x,y)\) on the line. The slope between them is \(m\), so
      \[ \frac{y-y_1}{x-x_1}=m \quad\Longrightarrow\quad y-y_1=m(x-x_1). \]
      This form shows the slope and one point. Through \((-3,-1)\) and \((3,3)\) the slope is \(\frac{3-(-1)}{3-(-3)}=\frac46=\frac23\), so \(y+1=\frac23(x+3)\). Any point on the line can play the known point: using \((3,3)\) gives \(y-3=\frac23(x-3)\), which looks different but is the same line.</p>
      <h3>Slope-intercept form</h3>
      <p>\[ y=mx+b \]
      shows the slope \(m\) and the y-intercept \(b\), the height at \(x=0\). It is the form for graphing from \((0,b)\) by rise over run, and for reading a rate (\(m\)) and a starting value (\(b\)).</p>
      <h3>Standard form</h3>
      <p>\[ Ax+By=C \]
      with \(A\), \(B\), \(C\) whole numbers with no common factor, and \(A\ge0\). The intercepts come quickly. Put \(y=0\) to get the x-intercept \(x=C/A\). Put \(x=0\) to get the y-intercept \(y=C/B\). When \(B\neq0\) the slope is \(-A/B\). If \(B=0\) the equation is \(x=C/A\), a vertical line. If \(A=0\) it is \(y=C/B\), a horizontal line. Standard form suits totals of two quantities, such as \(3x+2y=12\) for pens at $3 and notebooks at $2 with $12 to spend.</p>
      <h3>Converting between forms</h3>
      <p><b>Point-slope to slope-intercept.</b> Start with \(y+1=\frac23(x+3)\). Distribute: \(y+1=\frac23x+2\). Subtract \(1\) from both sides: \(y=\frac23x+1\). In general \(y-y_1=m(x-x_1)\) becomes \(y=mx+(y_1-mx_1)\), so \(b=y_1-mx_1\).</p>
      <p><b>Point-slope to standard form.</b> From \(y+1=\frac23(x+3)\), multiply both sides by \(3\) to clear the fraction: \(3(y+1)=2(x+3)\). Distribute: \(3y+3=2x+6\). Subtract \(2x\) and subtract \(3\): \(-2x+3y=3\). Multiply by \(-1\) so that \(A\) is not negative: \(2x-3y=-3\).</p>
      <p><b>Standard form to slope-intercept.</b> Solve for \(y\). From \(2x-3y=-3\): \(-3y=-2x-3\), so \(y=\frac23x+1\). In general \(Ax+By=C\) gives \(y=-\frac ABx+\frac CB\).</p>
      <p><b>Slope-intercept to standard form.</b> Multiply \(y=\frac23x+1\) by \(3\): \(3y=2x+3\). Subtract \(3y\) and \(3\) from both sides: \(-3=2x-3y\), which is \(2x-3y=-3\).</p>
      <p><b>Two points to every form.</b> Through \((1,2)\) and \((3,8)\): \(m=\frac{8-2}{3-1}=3\). Point-slope: \(y-2=3(x-1)\). Slope-intercept: \(y=3x-1\). Standard: \(3x-y=1\).</p>
      <h3>What each number means on the graph</h3>
      <p>The slope \(m\) is how much the line rises for each step right. It is positive if the line climbs, negative if it falls, and \(0\) if it is flat. The y-intercept \(b\) is the point \((0,b)\) where the line meets the y-axis. The x-intercept is the point where it meets the x-axis, found by setting \(y=0\): it is \((C/A,0)\) in standard form and \((-b/m,0)\) in slope-intercept form when \(m\neq0\).</p>
      <h3>How the forms relate</h3>
      <p>The forms use different variables as their givens, a point, a slope or an intercept, but they carry the same information:
      \[ m=\frac{y_2-y_1}{x_2-x_1}=-\frac AB,\qquad b=y_1-mx_1=\frac CB,\qquad x\text{-intercept}=\frac CA=-\frac bm. \]
      Two equations \(Ax+By=C\) and \(A'x+B'y=C'\) describe the same line exactly when \((A',B',C')\) is a nonzero multiple of \((A,B,C)\). For example \(4x-6y=-6\) and \(2x-3y=-3\) are the same line. They describe parallel lines when \((A',B')\) is a multiple of \((A,B)\) but \(C'\) does not follow, because then the slopes \(-A/B\) and \(-A'/B'\) agree and the intercepts differ.</p>
      <p>Which form to use depends on what you know. Two points: find the slope first. A point and a slope (a rate): point-slope. To graph or to read a rate and a start: slope-intercept. For intercepts, integer coefficients or a total of two quantities: standard.</p>
      <h3>Proportional and non-proportional lines</h3>
      <p>A relationship is <em>proportional</em> when \(y/x\) is the same number \(k\) for every \(x\neq0\), that is \(y=kx\). Its graph is a line through the origin, and its slope is \(k\), the constant of proportionality. In standard form \(Ax+By=C\) with \(B\neq0\) this happens exactly when \(C=0\).</p>
      <p>A line \(y=mx+b\) with \(b\neq0\) is linear but <em>not</em> proportional. It has a slope, so \(y\) still changes by the same amount for each step in \(x\). But
      \[ \frac yx=\frac{mx+b}{x}=m+\frac bx \]
      changes with \(x\). The table \(x=1,2,3,4\), \(y=5,8,11,14\) has slope \(3\), yet \(y/x=5,\,4,\,\frac{11}{3},\,\frac72\) is not constant. The line is \(y=3x+2\), which misses \((0,0)\).</p>
      <h3>Comparing the graphs</h3>
      <p>The line \(y=mx\) and the line \(y=mx+b\) have the same slope, so they are parallel. The second is the first shifted up by \(b\) (down if \(b\) is negative). Only the first passes through \((0,0)\), so only the first is proportional. A steeper proportional line has a larger \(|k|\). Having a constant rate of change is not enough for proportionality: the line must also start at zero.</p>`,
    check: [
      { q: String.raw`Which equation is \(y-3=2(x+4)\) written in slope-intercept form?`,
        choices: [String.raw`\(y=2x+7\)`, String.raw`\(y=2x+5\)`, String.raw`\(y=2x+11\)`, String.raw`\(y=2x-5\)`], answer: 2,
        why: String.raw`Distribute: \(y-3=2x+8\). Add \(3\) to both sides: \(y=2x+11\). The slips are not multiplying the \(4\) by \(2\) (giving \(2x+7\)), subtracting \(3\) instead of adding it (giving \(2x+5\)), and reading the point as \((4,3)\) (giving \(2x-5\)).`,
        hint: String.raw`Multiply \(2\) by both the \(x\) and the \(4\). Then undo the \(-3\) on the left by adding \(3\) to both sides.` },
      { q: String.raw`A table gives \(x=1,2,3,4\) and \(y=5,8,11,14\). Which statement is correct?`,
        choices: ['It is proportional, because y goes up by the same amount, 3, each time.',
                  String.raw`It is linear but not proportional: \(y\div x\) is \(5,4,\frac{11}{3},\frac72\), and the line \(y=3x+2\) misses \((0,0)\).`,
                  'It is proportional with constant 3, because the slope is 3.',
                  String.raw`It is not linear, because \(y\div x\) is not constant.`], answer: 1,
        why: String.raw`\(y\) rises by \(3\) for each step in \(x\), so the points lie on a line with slope \(3\), namely \(y=3x+2\). But it crosses the y-axis at \(2\), not \(0\), and \(y\div x\) changes. Proportional needs a constant ratio, which means a line through the origin. A constant rate alone does not give that, and a changing ratio does not make a line stop being a line.`,
        hint: String.raw`Work out \(y\div x\) for each row. Then ask where the line would cross the y-axis.` }
    ],
    links: { related: ['slope-and-linear-functions', 'systems-of-equations', 'what-is-a-function', 'scatter-plots-and-lines-of-fit'] },

    mount({ stage, controls: C }) {
      /* mode: how the line is given. x1, y1, dx, dy serve two points, point-slope and slope-intercept
         (a point, and a second point one rise and run away); A, B, C serve standard form. */
      const st = { mode: 'pts', view: 'ps', tgt: -1, x1: -3, y1: -1, dx: 6, dy: 4, A: 2, B: -3, C: -3 };
      let cancel = null, target = null, busy = false, pendingConv, note = '';
      const P = new Plane(stage, { span: 10 });

      const lineF = () => st.mode === 'std' ? { A: st.A, B: st.B, C: st.C } : { A: st.dy, B: -st.dx, C: st.dy * st.x1 - st.dx * st.y1 };
      const cur = () => { const f = lineF(); return canon(f.A, f.B, f.C); };
      const anchorOf = (L, I) => {
        if (I.vert) return null;
        if (st.mode === 'pts' || st.mode === 'ps') return [Q(st.x1), Q(st.y1)];
        if (st.mode === 'si') return [Q(0), Q(st.y1)];
        const lat = nearest(lattice(L));
        return lat.length ? [Q(lat[0][0]), Q(lat[0][1])] : [Q(0), I.b];
      };

      /* ---------- changing the given form keeps the same line ---------- */
      const DEF = { pts: { x1: -3, y1: -1, dx: 6, dy: 4 }, ps: { x1: -3, y1: -1, dx: 3, dy: 2 }, si: { x1: 0, y1: 1, dx: 3, dy: 2 } };
      const fromLine = (mode, L) => {
        if (mode === 'std') return { p: { A: L.A, B: L.B, C: L.C }, note: '' };
        const I = info(L), name = mode === 'si' ? 'slope-intercept' : 'point-slope';
        if (st.mode !== 'std' && mode !== 'si') {      /* two points, point-slope: keep the points */
          let { x1, y1, dx, dy } = st;
          if (mode === 'pts') return { p: { x1, y1, dx, dy }, note: '' };
          if (dx < 0) { x1 += dx; y1 += dy; dx = -dx; dy = -dy; }
          if (dx > 0 && dx <= LIM && Math.abs(dy) <= 12 && inBox(x1, y1) && inBox(x1 + dx, y1 + dy)) return { p: { x1, y1, dx, dy }, note: '' };
        }
        if (I.vert && mode !== 'pts') return { p: { x1: mode === 'si' ? 0 : clamp(Math.round(I.xi[0] / I.xi[1]), -LIM, LIM - 1), y1: mode === 'si' ? 0 : 0, dx: 1, dy: 1 },
          note: 'A vertical line has no slope, so it has no ' + name + ' form. This mode shows a line with slope 1 instead.' };
        if (mode === 'si') {
          const b = I.b, bi = clamp(Math.round(b[0] / b[1]), -LIM, LIM);
          const dx = clamp(I.m[1], 1, LIM), dy = clamp(I.m[0], -12, 12);
          const msgs = [];
          if (b[1] !== 1) msgs.push('This line crosses the y-axis at ' + qs(b) + '. Here b is a whole number, so b was rounded to ' + bi + '.');
          else if (bi !== b[0]) msgs.push('This line crosses the y-axis at ' + qs(b) + ', beyond the ±' + LIM + ' this mode reaches, so b was set to ' + bi + '.');
          if (dx !== I.m[1] || dy !== I.m[0]) msgs.push('That slope is beyond what this mode can set, so it was adjusted.');
          return { p: { x1: 0, y1: bi, dx, dy }, note: msgs.join(' ') };
        }
        let L2 = L, msg = '';
        if (!lattice(L2).length) {
          const g = gcd(L.A, L.B) || 1; L2 = canon(L.A, L.B, g * Math.round(L.C / g));
          if (L2 && lattice(L2).length) msg = 'No whole-number point lies on ' + stdText(L) + ', so this mode uses the nearest line through grid points, ' + stdText(L2) + '.';
        }
        const pair = L2 && pickPair(L2, mode === 'ps');
        if (!pair || (mode === 'ps' && (pair[1][0] - pair[0][0] > LIM || Math.abs(pair[1][1] - pair[0][1]) > 12))) return { p: Object.assign({}, DEF[mode]), note: 'That line has no two grid points in view, so this mode starts from a standard line.' };
        return { p: { x1: pair[0][0], y1: pair[0][1], dx: pair[1][0] - pair[0][0], dy: pair[1][1] - pair[0][1] }, note: msg };
      };
      const convertTo = mode => {
        const L = cur(), r = fromLine(mode, L);
        st.mode = mode; Object.assign(st, r.p); note = r.note || '';
      };

      /* ---------- drawing ---------- */
      const ends = (bd, A, B, C) => Math.abs(B) >= Math.abs(A)
        ? [[bd.x0, (C - A * bd.x0) / B], [bd.x1, (C - A * bd.x1) / B]]
        : [[(C - B * bd.y0) / A, bd.y0], [(C - B * bd.y1) / A, bd.y1]];
      /* unit pixel normal of Ax+By=C, pointing up (or right if the line is steep) */
      const nrm = (A, B) => {
        let nx = -A, ny = B; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
        if (Math.abs(ny) > .3 ? ny > 0 : nx < 0) { nx = -nx; ny = -ny; }
        return [nx, ny];
      };

      P.onDraw = (c, p) => {
        const pal = p.pal, bd = p.bounds(), fs = clamp(p.scale * .5, 12.5, 16), narrow = p.scale < 24;
        p.grid(1); p.ticks(1, { size: clamp(p.scale * .45, 11.5, 14) });
        const placed = [];   /* boxes of the labels drawn so far, so later labels can keep clear of them */
        const font = size => `600 ${size}px "Hanken Grotesk","Helvetica Neue",Arial,sans-serif`;
        const boxOf = (w, px, py, al, size) => {
          const left = clamp(al === 'center' ? px - w / 2 : al === 'left' ? px : px - w, 6, p.w - w - 6), cy = clamp(py, size, p.h - size);
          return { left, cy, x0: left - 6, x1: left + w + 6, y0: cy - size / 2 - 4, y1: cy + size / 2 + 4 };
        };
        const T = (s, x, y, o = {}) => {
          const size = o.size || fs; c.font = font(size); c.textBaseline = 'middle';
          const w = c.measureText(s).width, bx = boxOf(w, o.px != null ? o.px : p.X(x) + (o.dx || 0), o.py != null ? o.py : p.Y(y) + (o.dy || 0), o.align || 'center', size);
          c.textAlign = 'left'; c.lineJoin = 'round';
          if (o.pill) {
            const r = 6, x0 = bx.x0, y0 = bx.y0, w2 = bx.x1 - bx.x0, h2 = bx.y1 - bx.y0;
            c.beginPath(); c.moveTo(x0 + r, y0); c.arcTo(x0 + w2, y0, x0 + w2, y0 + h2, r); c.arcTo(x0 + w2, y0 + h2, x0, y0 + h2, r); c.arcTo(x0, y0 + h2, x0, y0, r); c.arcTo(x0, y0, x0 + w2, y0, r); c.closePath();
            c.fillStyle = alpha(pal.stage, .92); c.fill(); c.strokeStyle = alpha(o.color || pal.text, .35); c.lineWidth = 1; c.stroke();
          } else { c.lineWidth = 4; c.strokeStyle = pal.stage; c.strokeText(s, bx.left, bx.cy); }
          c.fillStyle = o.color || pal.text; c.fillText(s, bx.left, bx.cy);
          placed.push(bx);
        };
        const L = busy ? null : cur(), I = L && info(L), F = lineF();
        const [n0x, n0y] = nrm(F.A, F.B);
        /* a label beside a point on the line, on the side (and distance) that keeps clear of the axis numbers, the edges and other labels */
        const tg = (s, x, y, o = {}) => {
          const size = o.size || fs, d0 = o.d || 26, [mx, my] = o.n || [n0x, n0y], dirs = o.dirs || [[mx, my], [-mx, -my]];
          c.font = font(size); const w = c.measureText(s).width, px = p.X(x), py = p.Y(y), best = { q: 1e9 };
          [1, 1.7, 2.4].forEach(k => dirs.forEach(([cx, cy], i) => {
            const al = cx > .5 ? 'left' : cx < -.5 ? 'right' : 'center', bx = boxOf(w, px + cx * d0 * k, py + cy * d0 * k, al, size);
            let q = 0;
            if (bx.y1 > p.Y(0) + 2 && bx.y0 < p.Y(0) + 28) q += 2;
            if (bx.x1 > p.X(0) - 44 && bx.x0 < p.X(0) - 2) q += 2;
            placed.forEach(r => { if (bx.x0 < r.x1 && bx.x1 > r.x0 && bx.y0 < r.y1 && bx.y1 > r.y0) q += 5; });
            q += k * .1 + i * .05;
            if (q < best.q) { best.q = q; best.cx = cx * d0 * k; best.cy = cy * d0 * k; best.al = al; }
          }));
          T(s, x, y, Object.assign({ pill: true }, o, { dx: best.cx, dy: best.cy, align: best.al }));
        };
        const hnd = (x, y, inner) => { p.dot(x, y, 10, pal.stage, pal.brass, 3); if (inner) p.dot(x, y, 4.5, inner); };
        const yel = (x, y) => p.dot(x, y, 6.5, pal.yellow, pal.stage, 2);

        /* the line to match */
        if (st.tgt >= 0) {
          const t = TG[st.tgt], [tx, ty] = nrm(t.A, t.B);
          p.path(ends(bd, t.A, t.B, t.C), { stroke: pal.violet, width: 3, dash: [10, 8] });
          t.pts.forEach(([x, y]) => {
            p.dot(x, y, 5.5, pal.violet, pal.stage, 2);
            tg('(' + iv(x) + ', ' + iv(y) + ')', x, y, { n: [tx, ty], d: 24, color: pal.violet, size: fs - 1 });
          });
        }
        /* the proportional twin: same slope, through the origin */
        if (L && st.view === 'ratio' && !I.vert && L.C !== 0) p.path(ends(bd, L.A, L.B, 0), { stroke: pal.violet, width: 3, dash: [9, 7] });
        p.path(ends(bd, F.A, F.B, F.C), { stroke: pal.blue, width: 3.5 });

        if (L) {
          const tri = (x0, y0, x1, y1) => {
            p.path([[x0, y0], [x1, y0], [x1, y1]], { fill: alpha(pal.yellow, .16), close: true });
            if (x1 !== x0) p.path([[x0, y0], [x1, y0]], { stroke: pal.green, width: 4 });
            if (y1 !== y0) p.path([[x1, y0], [x1, y1]], { stroke: pal.red, width: 4 });
            const up = y1 >= y0 ? 1 : -1, rt = x1 >= x0 ? 1 : -1;
            if (x1 !== x0) tg('run ' + iv(x1 - x0), (x0 + x1) / 2, y0, { color: pal.green, pill: false, d: 17, dirs: [[0, up], [0, -up]] });
            tg('rise ' + iv(y1 - y0), x1, (y0 + y1) / 2, { color: pal.red, pill: false, d: 12, dirs: [[rt, 0], [-rt, 0]] });
          };
          const bv = I.vert ? 0 : I.b[0] / I.b[1];
          if (st.view === 'ps') {
            let tp = null;
            if (st.mode === 'pts' || st.mode === 'ps') tp = [[st.x1, st.y1], [st.x1 + st.dx, st.y1 + st.dy]];
            else if (st.mode === 'si') tp = [[0, st.y1], [st.dx, st.y1 + st.dy]];
            else { const pr = pickPair(L, false); if (pr) tp = pr; }
            if (tp) tri(tp[0][0], tp[0][1], tp[1][0], tp[1][1]);
            if (st.mode === 'std') { const an = anchorOf(L, I); if (an) { const ax = an[0][0] / an[0][1], ay = an[1][0] / an[1][1]; yel(ax, ay); tg(pt(an[0], an[1]), ax, ay); } }
          } else if (st.view === 'si') {
            if (!I.vert && Math.abs(bv) <= LIM + .6) {
              if (st.mode === 'si') tri(0, st.y1, st.dx, st.y1 + st.dy);
              else {
                const q = I.m[1], pp = I.m[0];
                if (inBox(q, bv + pp, LIM + .6)) tri(0, bv, q, bv + pp); else tri(-q, bv - pp, 0, bv);
                yel(0, bv); tg('b = ' + qs(I.b), 0, bv);
              }
            }
          } else if (st.view === 'std') {
            if (st.mode !== 'std') {
              if (I.xi) { const xv = I.xi[0] / I.xi[1]; if (Math.abs(xv) <= LIM + .6) { yel(xv, 0); tg(pt(I.xi, Q(0)), xv, 0); } }
              if (I.yi && !(I.xi && zero(I.xi))) { if (Math.abs(bv) <= LIM + .6) { yel(0, bv); tg(pt(Q(0), I.yi), 0, bv); } }
            }
          } else if (st.view === 'ratio' && !I.vert) {
            [1, 2, 3, 4].forEach(x => {
              const yv = (L.C - L.A * x) / L.B;
              if (Math.abs(yv) > bd.y1 - .4 || Math.abs(yv) > bd.y1) return;
              p.path([[0, 0], [x, yv]], { stroke: pal.violet, width: 2, dash: [5, 5] });
              p.dot(x, yv, 5.5, pal.yellow, pal.stage, 2);
              if (!narrow) tg(qs(Q(L.C - L.A * x, L.B * x)), x, yv, { d: 20, size: fs - 1 });
            });
            p.dot(0, 0, 7.5, null, pal.violet, 2.5);
          }
        }

        /* the handles of the chosen form */
        if (st.mode === 'pts') {
          const ax = st.x1, ay = st.y1, bx = st.x1 + st.dx, by = st.y1 + st.dy;
          hnd(ax, ay, st.view === 'ps' ? pal.yellow : null); hnd(bx, by);
          if (L) { tg('A (' + iv(ax) + ', ' + iv(ay) + ')', ax, ay); tg('B (' + iv(bx) + ', ' + iv(by) + ')', bx, by); }
        } else if (st.mode === 'ps') {
          hnd(st.x1 + st.dx, st.y1 + st.dy); hnd(st.x1, st.y1, pal.yellow);
          if (L) tg('(' + iv(st.x1) + ', ' + iv(st.y1) + ')', st.x1, st.y1);
        } else if (st.mode === 'si') {
          hnd(st.dx, st.y1 + st.dy); hnd(0, st.y1, pal.yellow);
          if (L) tg(st.view === 'si' ? 'b = ' + iv(st.y1) : '(0, ' + iv(st.y1) + ')', 0, st.y1);
        } else {
          const hs = [];
          if (st.A) hs.push([st.C / st.A, 0]);
          if (st.B && !(st.A && st.C === 0)) hs.push([0, st.C / st.B]);
          hs.forEach(([x, y]) => {
            if (!inBox(x, y, LIM + .6)) return;
            hnd(x, y, pal.yellow);
            if (L && st.view === 'std') {
              const lx = x === 0 ? Q(0) : Q(Math.round(st.C), Math.round(st.A)), ly = y === 0 ? Q(0) : Q(Math.round(st.C), Math.round(st.B));
              tg(pt(lx, ly), x, y);
            }
          });
        }

        /* equations at the top left */
        if (L) {
          const a = siText(L, I), b = stdText(L), tag = (txt, row, o) => T(txt, 0, 0, Object.assign({ px: 16, py: 24 + row * (fs + 10), align: 'left', pill: true }, o));
          let row = 0;
          tag(a, row++, { color: pal.blue, size: fs + 1 });
          if (b !== a) tag(b, row++, { color: pal.blue, size: fs + 1 });
          if (I.vert) tag('slope undefined: the run is 0', row++, { color: pal.muted, size: fs - 1 });
          if (st.view === 'ratio' && !I.vert) {
            if (L.C !== 0) tag('same slope through (0, 0): ' + siText({ A: L.A, B: L.B, C: 0 }, info({ A: L.A, B: L.B, C: 0 })), row++, { color: pal.violet, size: fs });
            if (!narrow) tag('numbers on the points: y ÷ x', row++, { color: pal.muted, size: fs - 1 });
          }
        }
      };

      /* ---------- controls ---------- */
      const MODES = [['pts', 'Two points'], ['ps', 'A point and a slope'], ['si', 'Slope and y-intercept'], ['std', 'Standard form, Ax + By = C']];
      const VIEWS = [['ps', 'A point and the slope triangle'], ['si', 'The y-intercept b'], ['std', 'Both intercepts'], ['ratio', 'y ÷ x, and a line through (0, 0)']];
      const stop = () => {
        if (cancel) { cancel(); cancel = null; }
        if (target) { Object.assign(st, target); target = null; }
        busy = false;
        if (pendingConv !== undefined) { const k = pendingConv; pendingConv = undefined; startConv(k); }
      };

      C.title('Define the line');
      const modeSel = C.select({ label: 'The line is given by', value: st.mode, options: MODES.map(([value, label]) => ({ value, label })),
        onChange: v => { stop(); convertTo(v); st.view = { pts: 'ps', ps: 'ps', si: 'si', std: 'std' }[v]; sync(); } });
      const host = modeSel.parentElement.parentElement;
      const noteEl = h('p', { class: 'hint', style: 'display:none;margin:0' }); host.append(noteEl);
      const sl = [], grid = h('div', { style: 'display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:4px 18px' }); host.append(grid);
      const mk = (modes, label, min, max, get, put, wide) => {
        const s = C.slider({ label, min, max, step: 1, value: get(), format: iv, onInput: v => { stop(); note = ''; put(Math.round(v)); sync(); } });
        const el = host.lastElementChild; grid.append(el); if (wide) el.style.gridColumn = '1 / -1';
        sl.push({ s, el, modes, get, min, max, out: el.querySelector('output') });
      };
      const fitP = () => {
        if (st.mode === 'si') st.x1 = 0;
        st.x1 = clamp(st.x1, -LIM, LIM - st.dx);
        st.y1 = clamp(st.y1, -LIM - Math.min(0, st.dy), LIM - Math.max(0, st.dy));
      };
      const setP = (x, y) => { st.x1 = x; st.y1 = y; fitP(); };
      const setPts = (ax, ay, bx, by) => { if (ax === bx && ay === by) return; st.x1 = ax; st.y1 = ay; st.dx = bx - ax; st.dy = by - ay; };
      mk(['pts'], 'A: x', -LIM, LIM, () => st.x1, v => setPts(v, st.y1, st.x1 + st.dx, st.y1 + st.dy));
      mk(['pts'], 'A: y', -LIM, LIM, () => st.y1, v => setPts(st.x1, v, st.x1 + st.dx, st.y1 + st.dy));
      mk(['pts'], 'B: x', -LIM, LIM, () => st.x1 + st.dx, v => setPts(st.x1, st.y1, v, st.y1 + st.dy));
      mk(['pts'], 'B: y', -LIM, LIM, () => st.y1 + st.dy, v => setPts(st.x1, st.y1, st.x1 + st.dx, v));
      mk(['ps'], 'Point x', -LIM, LIM, () => st.x1, v => setP(v, st.y1));
      mk(['ps'], 'Point y', -LIM, LIM, () => st.y1, v => setP(st.x1, v));
      mk(['si'], 'y-intercept b', -LIM, LIM, () => st.y1, v => { st.y1 = v; fitP(); }, true);
      mk(['ps', 'si'], 'Rise', -12, 12, () => st.dy, v => { st.dy = v; fitP(); });
      mk(['ps', 'si'], 'Run', 1, LIM, () => st.dx, v => { st.dx = v; fitP(); });
      mk(['std'], 'A', -LIM, LIM, () => st.A, v => { if (v || st.B) st.A = v; });
      mk(['std'], 'B', -LIM, LIM, () => st.B, v => { if (v || st.A) st.B = v; });
      mk(['std'], 'C', -60, 60, () => st.C, v => { st.C = v; }, true);

      C.title('All the forms');
      const ro = C.readout(), roR = C.readout();

      C.title('Convert');
      C.buttons([
        { label: 'To slope-intercept', onClick: () => { stop(); startConv('si'); } },
        { label: 'To standard form', onClick: () => { stop(); startConv('std'); } }
      ]);
      const cvBox = C.readout(); cvBox.setAttribute('data-conv', '');
      C.title('Look at');
      const viewSel = C.select({ label: 'Show on the graph', value: st.view, options: VIEWS.map(([value, label]) => ({ value, label })),
        onChange: v => { stop(); st.view = v; sync(); } });

      C.title('Match a line');
      C.buttons([
        { label: 'Show a dashed line', primary: true, onClick: () => { stop(); st.tgt = (st.tgt + 1) % TG.length; sync(); } },
        { label: 'Hide it', onClick: () => { stop(); st.tgt = -1; sync(); } }
      ]);
      const roT = C.readout(); roT.style.display = 'none';

      C.hint('Drag the ringed handles, or use the sliders. The Convert box starts from the point-slope form of the line on the graph.');

      /* ---------- readouts ---------- */
      const ratioHTML = (L, I) => {
        if (I.vert) return '<span class="k">A vertical line gives no single y for an x, so there is no y ÷ x to compare.</span>';
        const xs = [1, 2, 3, 4], rs = xs.map(x => qs(Q(L.C - L.A * x, L.B * x))), ms = qs(I.m);
        const td = 'padding:2px 8px 2px 0;border-bottom:1px solid var(--line);';
        const rows = xs.map((x, i) => `<tr><td style="${td}">${x}</td><td style="${td}">${rs[i]}</td><td style="${td}">${ms}</td></tr>`).join('');
        const head = 'text-align:left;font-weight:500;color:var(--muted);padding:0 8px 4px 0;font-size:.82rem;';
        const status = L.C === 0
          ? `<b>Proportional.</b> y ÷ x is ${ms} every time, so the constant of proportionality is k = ${ms} and the line is ${siText(L, I)}. It passes through (0, 0).`
          : `<b>Not proportional.</b> y ÷ x changes (${rs.join(', ')}). The slope is ${ms}, but the line crosses the y-axis at (0, ${qs(I.b)}), not at (0, 0).`;
        return `<table style="border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums;margin-bottom:8px"><tr><th style="${head}">x</th><th style="${head}">y ÷ x on your line</th><th style="${head}">y ÷ x on the line through (0, 0) with the same slope</th></tr>${rows}</table>` +
          status + `<br><span class="k">Both lines have slope ${ms}. The dashed segments run from (0, 0) to the points, and the slope of each one is y ÷ x.</span>`;
      };
      const upd = () => {
        const L = cur(); if (!L) return;
        const I = info(L), an = anchorOf(L, I), k = s => `<span class="k">${s}</span>`;
        let slopeRow;
        if (st.mode === 'std') slopeRow = st.B === 0 ? `−A ÷ B = ${iv(-st.A)} ÷ 0, undefined (vertical line)` : `−A ÷ B = ${iv(-st.A)} ÷ ${iv(st.B)} = ${qs(Q(-st.A, st.B))}`;
        else slopeRow = st.dx === 0 ? `rise ÷ run = ${iv(st.dy)} ÷ 0, undefined (vertical line)` : `rise ÷ run = ${iv(st.dy)} ÷ ${iv(st.dx)} = ${qs(Q(st.dy, st.dx))}`;
        const rows = [`${k('Slope')} ${slopeRow}`];
        if (I.vert) {
          rows.push(`${k('Point-slope')} none: a vertical line has no slope`, `${k('Slope-intercept')} none, for the same reason`);
        } else {
          rows.push(`${k('Point-slope')} <b>${psText(an[0], an[1], I.m)}</b><br>${k('y − y₁ = m(x − x₁), using the point ' + pt(an[0], an[1]))}`,
            `${k('Slope-intercept')} <b>${siText(L, I)}</b><br>${k('y = mx + b, with m = ' + qs(I.m) + ' and b = ' + qs(I.b))}`);
        }
        let sx = '';
        if (st.mode === 'std') {
          const raw = canon(st.A, st.B, st.C), same = raw && raw.A === st.A && raw.B === st.B && raw.C === st.C;
          if (!same) {
            const g = gcd(gcd(st.A, st.B), st.C), parts = [];
            if (g > 1) parts.push('divide by ' + g);
            if (st.A < 0 || (st.A === 0 && st.B < 0)) parts.push('multiply by −1 so A is not negative');
            sx = ` ${k('(your ' + linStr(st.A, st.B) + ' = ' + iv(st.C) + ': ' + parts.join(', ') + ')')}`;
          }
        }
        rows.push(`${k('Standard')} <b>${stdText(L)}</b>${sx}<br>${k('Ax + By = C, with A = ' + L.A + ', B = ' + iv(L.B) + ', C = ' + iv(L.C))}`);
        rows.push(`${k('x-intercept')} ${I.xi ? pt(I.xi, Q(0)) : 'none (horizontal line)'}<br>${k('y-intercept')} ${I.yi ? pt(Q(0), I.yi) : 'none (vertical line)'}`);
        ro.innerHTML = rows.join('<br>');
        roR.innerHTML = st.view === 'ratio' ? ratioHTML(L, I) : ''; roR.style.display = st.view === 'ratio' ? '' : 'none';
        challenge(L, I); convCheck(L, I, an);
      };

      /* ---------- the match-a-line challenge ---------- */
      const challenge = (L, I) => {
        if (st.tgt < 0) { roT.style.display = 'none'; return; }
        const t = TG[st.tgt], T = canon(t.A, t.B, t.C), IT = info(T), hits = t.pts.filter(([x, y]) => L.A * x + L.B * y === L.C).length;
        let msg;
        if (L.A === T.A && L.B === T.B && L.C === T.C) msg = `<b>Matched.</b> You made the dashed line. It is ${siText(T, IT)}${siText(T, IT) === stdText(T) ? '' : ', or ' + stdText(T)}. Whichever form you used, it is the same line.`;
        else {
          let hint;
          if (IT.vert && (st.mode === 'ps' || st.mode === 'si')) hint = 'The dashed line is vertical. Point-slope and slope-intercept forms need a slope, so switch to Two points or Standard form.';
          else if (I.vert !== IT.vert) hint = I.vert ? 'Your line is vertical. The dashed line has a slope.' : 'The dashed line is vertical, so it has no slope. Its equation is x = a number.';
          else if (I.vert) hint = 'Both lines are vertical. Move yours left or right.';
          else if (qeq(I.m, IT.m)) hint = `The slopes agree, so the lines are parallel. Slide yours ${qlt(I.b, IT.b) ? 'up' : 'down'}.`;
          else if (qeq(I.b, IT.b)) hint = 'Both lines cross the y-axis at the same point, but the slopes differ.';
          else hint = 'Read the two marked points, find rise ÷ run between them, then place the line.';
          msg = `Your line passes through ${hits} of the 2 marked points. ${hint}`;
        }
        roT.innerHTML = msg; roT.style.display = '';
      };

      /* ---------- the Convert walkthrough ---------- */
      const cv = { kind: '', sig: '', route: null, problem: '', done: 0, fb: '', msg: '', check: '' };
      const buildConv = (L, I, an) => {
        const sig = [L.A, L.B, L.C, an ? an[0].join('/') + ',' + an[1].join('/') : ''].join(',');
        if (cv.route || cv.problem) { if (sig === cv.sig) return; if (cv.sig) cv.msg = 'The line changed, so the box started over.'; }
        cv.sig = sig; cv.done = 0; cv.fb = ''; cv.route = null; cv.problem = '';
        if (I.vert) cv.problem = 'A vertical line has no slope, so it has no point-slope or slope-intercept form. Its equation, ' + stdText(L) + ', is already in standard form.';
        else if (!an || an[0][1] !== 1 || an[1][1] !== 1) cv.problem = 'No whole-number point lies on this line, so there is no point-slope form with whole numbers to start from. Choose a line through a grid point.';
        else cv.route = (cv.kind === 'si' ? routeSI : routeStd)(an[0][0], an[1][0], I.m);
        cv.final = cv.kind === 'si' ? siText(L, I) : stdText(L);
        /* a second point on the line, to check the answer */
        if (cv.route) {
          const x2 = an[0][0] + I.m[1], y2 = an[1][0] + I.m[0];
          if (cv.kind === 'si') cv.check = `Check with the point (${iv(x2)}, ${iv(y2)}): ${par(I.m)} × ${par(Q(x2))}${plus(I.b)} = ${qs(qadd(qmul(I.m, Q(x2)), I.b))}, and y is ${iv(y2)}.`;
          else cv.check = `Check with the point (${iv(x2)}, ${iv(y2)}): ${iv(L.A)}(${iv(x2)}) ${L.B < 0 ? '−' : '+'} ${Math.abs(L.B)}(${iv(y2)}) = ${iv(L.A * x2 + L.B * y2)}, and C is ${iv(L.C)}.`;
        }
      };
      const reveal = () => {
        const pn = cvBox.closest('.panel');
        if (pn && pn.scrollHeight > pn.clientHeight + 4) { const top = cvBox.offsetTop + cvBox.offsetHeight - pn.clientHeight + 18; if (top > pn.scrollTop) pn.scrollTop = top; }
      };
      const startConv = kind => {
        cv.kind = kind || ''; cv.sig = ''; cv.route = null; cv.problem = ''; cv.done = 0; cv.fb = ''; cv.msg = '';
        if (cv.kind) { const L = cur(); if (L) { const I = info(L); buildConv(L, I, anchorOf(L, I)); } }
        renderConv();
      };
      const convCheck = (L, I, an) => { if (cv.kind) { buildConv(L, I, an); } renderConv(); };
      const renderConv = () => {
        cvBox.textContent = '';
        const muted = 'margin:0 0 8px;color:var(--muted)';
        if (!cv.kind) { cvBox.append(h('p', { style: muted }, 'Choose a target form. You pick each algebra move. The box says why a move works or why it does not.')); return; }
        if (cv.msg) cvBox.append(h('p', { style: muted }, cv.msg));
        if (cv.problem) { cvBox.append(h('p', { style: 'margin:0' }, cv.problem)); return; }
        const R = cv.route; if (!R) return;
        const line = (eq, why) => h('div', { style: 'display:grid;gap:1px;margin:0 0 8px;padding-left:10px;border-left:3px solid var(--line-strong)' }, h('b', {}, eq), why ? h('span', { class: 'k', style: 'font-size:.84rem;line-height:1.4' }, why) : null);
        cvBox.append(line(R.start, 'Start: the point-slope form of the line.'));
        R.steps.slice(0, cv.done).forEach(s => cvBox.append(line(s.eq, s.why)));
        if (cv.done >= R.steps.length) {
          const nm = R.kind === 'si' ? 'slope-intercept' : 'standard';
          cvBox.append(h('p', { style: 'margin:8px 0 6px' }, R.steps.length ? [h('b', {}, 'Done. '), 'In ' + nm + ' form the line is ', h('b', {}, cv.final), '. It matches the panel.']
            : [h('b', {}, 'Nothing to do. '), 'The point-slope form ', h('b', {}, R.start), ' is already in ' + nm + ' form. It matches the panel.']));
          cvBox.append(h('p', { class: 'k', style: 'margin:0;font-size:.84rem;line-height:1.4' }, cv.check));
          return;
        }
        const s = R.steps[cv.done], opts = [{ label: s.label, ok: true }, ...s.bad.map(b => ({ label: b.label, why: b.why }))];
        const rot = cv.done % 3, order = opts.map((_, i) => opts[(i + rot) % opts.length]);
        cvBox.append(h('p', { style: 'margin:8px 0 6px;font-weight:500' }, 'Choose the next move (' + (cv.done + 1) + ' of ' + R.steps.length + ').'));
        const bs = order.map(o => h('button', { type: 'button', class: 'btn',
          style: 'justify-content:flex-start;text-align:left;border-radius:10px;width:100%;margin:0 0 6px;padding:8px 14px;line-height:1.35',
          onclick: () => {
            if (o.ok) { cv.done++; cv.fb = ''; if (cv.done >= R.steps.length) { st.view = cv.kind === 'si' ? 'si' : 'std'; sync(); return; } }
            else cv.fb = o.why;
            renderConv(); const nb = cvBox.querySelector('button'); if (nb) nb.focus({ preventScroll: true });
          } }, o.label));
        cvBox.append(...bs);
        if (cv.fb) cvBox.append(h('p', { style: 'margin:4px 0 0;padding-left:10px;border-left:3px solid var(--red)' }, h('b', {}, 'Not that move. '), cv.fb));
      };

      /* ---------- keeping everything in step ---------- */
      const sync = () => {
        modeSel.value = st.mode; viewSel.value = st.view;
        sl.forEach(o => {
          const v = o.get(); o.s.set(v);
          if (v < o.min || v > o.max) o.out.textContent = iv(v);
          o.el.style.display = o.modes.includes(st.mode) ? '' : 'none';
        });
        noteEl.textContent = note; noteEl.style.display = note ? '' : 'none';
        P.draw(); if (!busy) upd();
      };

      /* ---------- dragging ---------- */
      const handles = () => {
        if (st.mode === 'pts') return [['a', st.x1, st.y1], ['b', st.x1 + st.dx, st.y1 + st.dy]];
        if (st.mode === 'ps') return [['s', st.x1 + st.dx, st.y1 + st.dy], ['p', st.x1, st.y1]];
        if (st.mode === 'si') return [['s', st.dx, st.y1 + st.dy], ['y', 0, st.y1]];
        const out = [];
        if (st.B && inBox(0, st.C / st.B, LIM + .6)) out.push(['yi', 0, st.C / st.B]);
        if (st.A && inBox(st.C / st.A, 0, LIM + .6) && !(st.C === 0 && st.B)) out.push(['xi', st.C / st.A, 0]);
        return out;
      };
      draggable(P, {
        hit: (px, py) => {
          let best = null, bd = clamp(P.scale * .8, 18, 26);
          for (const [id, x, y] of handles()) { const d = Math.hypot(P.X(x) - px, P.Y(y) - py); if (d < bd) { bd = d; best = id; } }
          return best;
        },
        move: (hd, x, y) => {
          stop(); note = '';
          const nx = Math.round(x), ny = Math.round(y), cl = v => clamp(v, -LIM, LIM);
          if (hd === 'a') setPts(cl(nx), cl(ny), st.x1 + st.dx, st.y1 + st.dy);
          else if (hd === 'b') setPts(st.x1, st.y1, cl(nx), cl(ny));
          else if (hd === 'p') setP(cl(nx), cl(ny));
          else if (hd === 's') { st.dx = clamp(nx - st.x1, 1, Math.min(LIM, LIM - st.x1)); st.dy = clamp(cl(ny) - st.y1, -12, 12); }
          else if (hd === 'y') { st.y1 = cl(ny); fitP(); }
          else if (hd === 'xi') st.C = clamp(st.A * nx, -60, 60);
          else if (hd === 'yi') st.C = clamp(st.B * ny, -60, 60);
          sync();
        }
      });

      /* ---------- guided steps ---------- */
      const apply = (patch, immediate) => {
        stop();
        const { mode, view, tgt, conv, ...rest } = patch;
        if (mode !== undefined && mode !== st.mode) convertTo(mode); else note = '';
        if (view !== undefined) st.view = view;
        if (tgt !== undefined) st.tgt = tgt;
        const still = Object.keys(rest).every(k => Math.abs(st[k] - rest[k]) < 1e-9);
        if (immediate || still) {
          Object.assign(st, rest); sync();
          if (conv !== undefined) { startConv(conv); if (conv && !immediate) reveal(); }
        } else {
          busy = true; target = rest; pendingConv = conv;
          sync();
          cancel = animateTo(st, rest, 900, sync, () => { cancel = null; target = null; busy = false; const k = pendingConv; pendingConv = undefined; sync(); if (k !== undefined) { startConv(k); if (k) reveal(); } });
        }
      };
      sync(); renderConv();
      return { destroy: () => { stop(); P.destroy(); }, apply };
    }
  });
}
