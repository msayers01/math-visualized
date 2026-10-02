/* =====================================================================
   SCHOOL — Solving linear inequalities
   ===================================================================== */
{
  const MI = '−';
  const ab = Math.abs;
  const SANS = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
  const SERIF = '"STIX Two Text", "Cambria Math", "Times New Roman", serif';

  /* ---------- exact fractions: [numerator, denominator] ---------- */
  const gcd = (a, b) => { a = ab(a); b = ab(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; };
  const Q = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g + 0, d / g]; };
  const qadd = (a, b) => Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  const qmul = (a, b) => Q(a[0] * b[0], a[1] * b[1]);
  const qdiv = (a, b) => Q(a[0] * b[1], a[1] * b[0]);
  const qval = a => a[0] / a[1];
  const q0 = a => a[0] === 0;
  const q1 = a => a[0] === 1 && a[1] === 1;
  const qabs = a => [ab(a[0]), a[1]];
  const TERM = [2, 4, 5, 8, 10, 20, 25];
  const qtxt = a => {
    const neg = a[0] < 0, n = ab(a[0]), d = a[1];
    const s = d === 1 ? '' + n : TERM.includes(d) ? '' + +(n / d).toFixed(3) : n + '/' + d;
    return (neg ? MI : '') + s;
  };
  const qtxtDec = a => (a[1] === 1 || TERM.includes(a[1]) ? qtxt(a) : qtxt(a) + ' (about ' + nf(+qval(a).toFixed(1)) + ')');
  const nf = v => (v < 0 && ab(v) > 1e-9 ? MI : '') + (+ab(v).toFixed(2));

  /* ---------- relations ---------- */
  const SY = { lt: '<', gt: '>', le: '≤', ge: '≥' };
  const SH = { lt: '&lt;', gt: '&gt;', le: '≤', ge: '≥' };
  const FL = { lt: 'gt', gt: 'lt', le: 'ge', ge: 'le' };
  const strict = r => r === 'lt' || r === 'gt';
  const holds = (r, a, b) => (r === 'lt' ? a < b - 1e-9 : r === 'gt' ? a > b + 1e-9 : r === 'le' ? a <= b + 1e-9 : a >= b - 1e-9);
  const dirOf = r => (r === 'gt' || r === 'ge' ? 'right' : 'left');
  const relOf = (a, b) => (a < b ? 'lt' : 'gt');
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const WORDS = { lt: 'less than', gt: 'greater than', le: 'at most', ge: 'at least' };

  /* ---------- sides and inequalities ----------
     A side is m(a x + b) where m is null when there are no parentheses. a and b are fractions. */
  const sd = (a, b, m = null) => ({ m, a: Q(a), b: Q(b) });
  const sideVal = (s, x) => (s.m == null ? 1 : s.m) * (qval(s.a) * x + qval(s.b));
  const xterm = (a, v, sub) => {
    const n = qabs(a), one = q1(n), cf = n[1] === 1 ? '' + n[0] : '(' + qtxt(n) + ')';
    if (sub === undefined) return one ? v : cf + v;
    const sv = '(' + nf(sub) + ')';
    return one ? (sub < 0 ? sv : nf(sub)) : cf + sv;
  };
  const sideStr = (s, v, ord, sub) => {
    if (s.m != null) return s.m + '(' + sideStr({ m: null, a: s.a, b: s.b }, v, 'xc', sub) + ')';
    const px = q0(s.a) ? null : [s.a[0] < 0, xterm(s.a, v, sub)], pc = q0(s.b) ? null : [s.b[0] < 0, qtxt(qabs(s.b))];
    const parts = (ord === 'cx' ? [pc, px] : [px, pc]).filter(Boolean);
    if (!parts.length) return '0';
    return parts.map(([neg, t], i) => (i ? (neg ? ' ' + MI + ' ' : ' + ') : (neg ? MI : '')) + t).join('');
  };
  const istr = (I, P, html) => sideStr(I.L, P.v, P.ord) + ' ' + (html ? SH : SY)[I.rel] + ' ' + sideStr(I.R, P.v, P.ord);
  const effA = s => qmul(Q(s.m == null ? 1 : s.m), s.a);
  const effB = s => qmul(Q(s.m == null ? 1 : s.m), s.b);
  /* the solution of a x + b REL c x + d as  x REL' c */
  const solveI = I => {
    const A = qadd(effA(I.L), qmul(Q(-1), effA(I.R))), B = qadd(effB(I.L), qmul(Q(-1), effB(I.R)));
    if (q0(A)) return null;
    return { rel: A[0] < 0 ? FL[I.rel] : I.rel, c: qdiv(qmul(Q(-1), B), A) };
  };
  /* x alone on one side: the answer as  x REL c, otherwise null */
  const isoForm = I => {
    const { L, R } = I;
    if (L.m != null || R.m != null) return null;
    if (q1(L.a) && q0(L.b) && q0(R.a)) return { rel: I.rel, c: R.b };
    if (q1(R.a) && q0(R.b) && q0(L.a)) return { rel: FL[I.rel], c: L.b };
    return null;
  };
  const terms = I => [I.L.a, I.L.b, I.R.a, I.R.b].filter(t => !q0(t)).length;

  /* one move on both sides. op: { k: add|sub|mul|div|dist, n, w: 'num'|'x', flip } */
  const doOp = (I, op) => {
    const { L, R } = I, hasM = L.m != null || R.m != null;
    if (op.k === 'dist') {
      if (!hasM) return { err: 'There are no parentheses to distribute.' };
      const d = s => (s.m == null ? s : { m: null, a: qmul(Q(s.m), s.a), b: qmul(Q(s.m), s.b) });
      return { I: { L: d(L), R: d(R), rel: I.rel } };
    }
    if (hasM) return { err: 'There are parentheses. Distribute first: multiply the number outside by each term inside. Then you can move terms.' };
    const N = Q(op.n);
    let f;
    if (op.k === 'add' || op.k === 'sub') {
      const t = op.k === 'add' ? N : Q(-op.n);
      f = s => (op.w === 'x' ? { m: null, a: qadd(s.a, t), b: s.b } : { m: null, a: s.a, b: qadd(s.b, t) });
      return { I: { L: f(L), R: f(R), rel: I.rel } };
    }
    f = op.k === 'mul' ? s => ({ m: null, a: qmul(s.a, N), b: qmul(s.b, N) }) : s => ({ m: null, a: qdiv(s.a, N), b: qdiv(s.b, N) });
    return { I: { L: f(L), R: f(R), rel: op.n < 0 && op.flip ? FL[I.rel] : I.rel } };
  };
  const opAmt = (op, v) => (op.k === 'add' || op.k === 'sub' ? op.n + (op.w === 'x' ? v : '') : nf(op.n));
  const opText = (op, v) => {
    const a = opAmt(op, v);
    return op.k === 'add' ? `Add ${a} to both sides` : op.k === 'sub' ? `Subtract ${a} from both sides` : op.k === 'mul' ? `Multiply both sides by ${a}` : op.k === 'div' ? `Divide both sides by ${a}` : 'Distribute';
  };

  /* what to do next, in words (the Hint button) */
  const hintFor = (I, P) => {
    const v = P.v;
    if (I.L.m != null || I.R.m != null) return 'There are parentheses. Distribute first: multiply the number outside by each term inside.';
    if (isoForm(I)) return `${v} is alone. Press Check my answer.`;
    if (!q0(I.L.a) && !q0(I.R.a)) {
      const pick = qval(I.L.a) >= qval(I.R.a) ? I.R.a : I.L.a;
      return `${v} appears on both sides. Collect the ${v} terms on one side: ${pick[0] > 0 ? 'subtract' : 'add'} ${qtxt(qabs(pick))}${v} on both sides. Choosing the smaller ${v} term keeps the coefficient positive.`;
    }
    const side = q0(I.L.a) ? I.R : I.L;
    if (!q0(side.b)) return `Cancel the ${qtxt(qabs(side.b))} next to the ${v} term: ${side.b[0] > 0 ? 'subtract' : 'add'} ${qtxt(qabs(side.b))} on both sides.`;
    const a = side.a;
    return `${v} is multiplied by ${qtxt(a)}. Divide both sides by ${qtxt(a)}.` + (a[0] < 0 ? ' That is a negative number, so decide whether the symbol flips.' : '');
  };

  /* ---------- the problems ---------- */
  const mkP = o => {
    const P = Object.assign({ v: 'x', ord: 'xc' }, o);
    P.I = { L: sd(o.L[0], o.L[1], o.L[2] || null), R: sd(o.R[0], o.R[1], o.R[2] || null), rel: o.rel };
    P.S = solveI(P.I);
    return P;
  };
  const PRED_YES = [['Yes, it will flip', 0], ['No, it will not flip', 1]];
  const WORK = [
    mkP({ name: '−2x < 6', L: [-2, 0], R: [0, 6], rel: 'lt', win: [-8, 6],
      pred: { q: 'To get x alone you will divide by the number in front of x. Will the symbol have to flip?', ans: 0,
        ch: [['Yes, flip it', 'The number in front of x is −2, so you divide both sides by −2. A negative multiplier mirrors the number line and reverses the order, so < becomes >.'],
          ['No, keep it', 'Only dividing or multiplying by a positive number keeps the symbol. Here you divide by −2, a negative number, so the symbol must flip.']] } }),
    mkP({ name: '3 − 2x < 11', ord: 'cx', L: [-2, 3], R: [0, 11], rel: 'lt', win: [-9, 5],
      pred: { q: 'Before you start: at some point will the symbol have to flip?', ans: 0,
        ch: [['Yes, at some point', 'Subtract 3 and you have −2x < 8. To get x alone you divide by −2, a negative number. That is where the symbol flips.'],
          ['No, never', 'Look at the number in front of x: it is −2. You must divide by it, and dividing by a negative number reverses the order. The symbol flips at that step.']] } }),
    mkP({ name: '4(x − 1) ≥ 2x + 6', L: [1, -1, 4], R: [2, 6], rel: 'ge', win: [-2, 12],
      pred: { q: 'Before you start: will the symbol have to flip? Think about which way you will collect the x terms.', ans: 1,
        ch: [['Yes, it will flip', 'It only flips when you multiply or divide by a negative number. If you subtract 2x you get 2x ≥ 10 and divide by +2, so no negative appears. (Subtracting 4x instead gives −2x, and then you would flip. Both routes give the same answer.)'],
          ['No, it will not flip', 'Distribute to get 4x − 4 ≥ 2x + 6. Subtract 2x, the smaller x term, and you are left with 2x ≥ 10. You divide by +2, so no flip. Keeping the bigger x term positive avoids a flip.']] } }),
    mkP({ name: 'Ticket budget', v: 't', L: [6, 5], R: [0, 50], rel: 'le', win: [-1, 11],
      story: 'Tickets cost $6 each and there is a $5 booking fee. You have $50. Let t be the number of tickets you buy.',
      model: { q: 'Which inequality says that your total cost must stay within your $50?', ans: 1,
        ch: [['6t + 5 ≥ 50', 'The sign ≥ means the cost is at least $50. You can spend at most $50, so the cost must be less than or equal to 50.'],
          ['6t + 5 ≤ 50', 'Tickets cost 6t dollars and the fee adds 5, so the total is 6t + 5. You can spend at most 50, so the total must be ≤ 50.'],
          ['6(t + 5) ≤ 50', 'That multiplies the fee by 6 as well. The booking fee is a flat $5, paid once.'],
          ['6t ≤ 50 + 5', 'The fee comes out of your $50. It belongs on the cost side (6t + 5), not added to your budget.']] },
      pred: { q: 'Before you solve: will the symbol have to flip?', ans: 1,
        ch: [['Yes, it will flip', 'You subtract 5 and divide by 6. Six is positive, so the symbol keeps its direction.'],
          ['No, it will not flip', 'You subtract 5, then divide by +6. No negative number appears, so the symbol stays ≤.']] },
      ctx: { unit: 'tickets', q: 't counts whole tickets, so t = 7.5 is not possible. What is the greatest number of tickets you can buy?', ans: 1,
        ch: [['7.5 tickets', 'You cannot buy half a ticket. The answer set is whole numbers only.'],
          ['7 tickets', 'Seven tickets cost 6(7) + 5 = 47 dollars, which is within 50. Eight would cost 6(8) + 5 = 53 dollars, which is too much. Round down, because going over the budget is not allowed.'],
          ['8 tickets', 'Eight tickets cost 6(8) + 5 = 53 dollars, more than 50. When the limit is "at most", you round down.'],
          ['45 tickets', '45 is the amount left after the fee (50 − 5), not the number of tickets. Divide it by the price, 6.']],
        whole: { lo: 0, hi: 7 } } })
  ];
  const PROBS = [
    { kind: 'work', name: 'One step', story: 'Solve, check with numbers, and read the graph.',
      P: mkP({ name: 'x + 4 < 9', L: [1, 4], R: [0, 9], rel: 'lt', win: [-2, 10] }) },
    { kind: 'work', name: 'Two steps', story: 'Undo the subtraction first, then the multiplication.',
      P: mkP({ name: '2x − 3 ≥ 7', L: [2, -3], R: [0, 7], rel: 'ge', win: [-2, 10] }) },
    { kind: 'work', name: 'A negative coefficient', story: 'Watch for the flip.',
      P: mkP({ name: '5 − 3x > 14', ord: 'cx', L: [-3, 5], R: [0, 14], rel: 'gt', win: [-9, 5],
        pred: { q: 'Will you need to flip the symbol in 5 − 3x > 14?', ans: 0,
          ch: [['Yes, it will flip', 'After subtracting 5 you have −3x > 9. You divide by −3, a negative number, so > becomes <.'],
            ['No, it will not flip', 'The number in front of x is −3. Dividing by a negative number reverses the order, so the symbol flips.']] } }) },
    { kind: 'work', name: 'x on both sides', story: 'Collect the x terms, then the numbers, then divide.',
      P: mkP({ name: '6x − 4 ≤ 2x + 8', L: [6, -4], R: [2, 8], rel: 'le', win: [-6, 8],
        pred: { q: 'Will you need to flip the symbol in 6x − 4 ≤ 2x + 8? Think about collecting the x terms on the side with more x.', ans: 1,
          ch: [['Yes, it will flip', 'You subtract 2x to get 4x − 4 ≤ 8, add 4, then divide by +4. No negative number is used, so no flip.'],
            ['No, it will not flip', 'Subtract 2x (the smaller x term) and 4x remains. Then you divide by +4. A positive divisor keeps the symbol.']] } }) },
    { kind: 'choose', name: 'Choose the graph', story: 'Solve the inequality, then pick the graph that matches. Each graph is described in words as well as drawn.',
      q: 'Solve −2x + 1 < 7. Which graph shows the solution?', win: [-6, 4],
      opts: [
        { at: -3, incl: false, dir: 'right', words: 'open circle at −3, shaded to the right', ok: true,
          why: 'Subtract 1: −2x < 6. Divide by −2 and flip: x > −3. The circle is open because the inequality is strict, and the shading goes right because x is greater than −3. Test x = 0: −2(0) + 1 = 1, and 1 < 7 is true, so 0 should be shaded, and it is.' },
        { at: -3, incl: false, dir: 'left', words: 'open circle at −3, shaded to the left',
          why: 'This is what you get if you forget to flip when dividing by −2. Test x = 0: −2(0) + 1 = 1 < 7 is true, so 0 is a solution, but this graph does not shade 0.' },
        { at: -3, incl: true, dir: 'right', words: 'closed circle at −3, shaded to the right',
          why: 'The direction is right, but the inequality is strict (<), so −3 is not a solution: −2(−3) + 1 = 7, and 7 < 7 is false. The circle must be open.' },
        { at: -3, incl: true, dir: 'left', words: 'closed circle at −3, shaded to the left',
          why: 'Two problems: the symbol was not flipped (the shading should go right), and −3 should not be included because the inequality is strict. Test x = −3: −2(−3) + 1 = 7, and 7 < 7 is false.' }] },
    { kind: 'work', name: 'A situation', story: 'A car wash club needs at least $45 for a trip. It has $12 saved and earns $7 for each car washed. Let w be the number of cars washed.',
      P: mkP({ name: '12 + 7w ≥ 45', v: 'w', ord: 'cx', L: [7, 12], R: [0, 45], rel: 'ge', win: [-1, 11],
        model: { q: 'Which inequality says that the savings must reach at least $45?', ans: 2,
          ch: [['12 + 7w ≤ 45', 'The sign ≤ means at most $45. The club needs at least $45, so the total must be ≥ 45.'],
            ['7(12 + w) ≥ 45', 'That multiplies the $12 already saved by 7. The $12 is a flat amount, not earned per car.'],
            ['12 + 7w ≥ 45', 'The club has 12 dollars and earns 7w dollars from w cars, so the total is 12 + 7w. It needs at least 45, so ≥.'],
            ['7w ≥ 45', 'This forgets the $12 already saved. The total money is 12 + 7w.']] },
        ctx: { unit: 'cars', q: 'w counts whole cars, so w = 4.71 is not possible. What is the smallest number of cars the club must wash?', ans: 1,
          ch: [['4 cars', 'Four cars earn 7(4) = 28 dollars, so the club has 12 + 28 = 40 dollars. That is less than 45, so 4 is not enough.'],
            ['5 cars', 'Five cars earn 35 dollars, and 12 + 35 = 47, which is at least 45. When the limit is "at least", you round up.'],
            ['4.71 cars', 'You cannot wash a fraction of a car. The answer set is whole numbers only.'],
            ['33 cars', '33 is the amount still needed (45 − 12), not the number of cars. Divide it by 7.']],
          whole: { lo: 5, hi: null } } }) },
    { kind: 'trap', name: 'Spot the missing flip', story: 'A student solved −3x > 12 and wrote x > −4. The student says the graph has an open circle at −4 and is shaded to the right.' }
  ];
  const TRAP = {
    I: sd(-3, 0), R: sd(0, 12),
    tests: [
      { x: 0, why: '−3(0) = 0. Is 0 > 12? No. But the student\'s graph shades 0, because 0 > −4. So the graph says 0 works, and it does not. The answer is wrong.' },
      { x: -5, why: '−3(−5) = 15. Is 15 > 12? Yes. So −5 is a solution, but the student\'s graph does not shade −5. The answer also misses real solutions.' },
      { x: -4, why: '−3(−4) = 12. Is 12 > 12? No. So −4 is not a solution, and the open circle at −4 is right. The boundary was found correctly. The direction is the problem.' }],
    fix: [['x < −4', 'Yes. Divide both sides by −3 and flip the symbol: x < −4. Check with −5: −3(−5) = 15 > 12.', true],
      ['x > 4', '12 ÷ (−3) is −4, not 4. The sign of the boundary is wrong.'],
      ['x < 4', 'The direction is right, but 12 ÷ (−3) = −4, not 4.'],
      ['x > −4, the student is right', 'The tests show otherwise: 0 is shaded by this graph but −3(0) = 0 is not greater than 12. The missing step is the flip.']]
  };

  /* ---------- drawing helpers (pixel space) ---------- */
  const font = (size, weight = 600, serif) => (serif ? `${weight === 500 ? 500 : 400} ${size}px ${SERIF}` : `${weight} ${size}px ${SANS}`);
  const tw = (c, s, size, weight = 600) => { c.font = font(size, weight); return c.measureText(s).width; };
  const T = (c, p, s, x, y, { size = 14, color, align = 'center', weight = 600, halo = true, serif = false } = {}) => {
    c.font = font(size, weight, serif); c.textAlign = align; c.textBaseline = 'middle';
    if (halo) { c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(s, x, y); }
    c.fillStyle = color || p.pal.text; c.fillText(s, x, y);
  };
  /* wrapped, centered paragraph; returns the y after the last line */
  const para = (c, p, text, x, y, maxW, o = {}) => {
    const size = o.size || 14, lh = size * 1.35, words = text.split(' '), lines = []; let cur = '';
    c.font = font(size, o.weight || 600);
    for (const w of words) { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
    lines.push(cur);
    lines.forEach((l, i) => T(c, p, l, x, y + i * lh, o));
    return y + lines.length * lh;
  };
  const line = (c, x0, y0, x1, y1, color, width = 2, dash) => {
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.strokeStyle = color; c.lineWidth = width; c.setLineDash(dash || []); c.lineCap = 'round'; c.stroke(); c.setLineDash([]);
  };
  const head = (c, x, y, dx, s, color) => { c.beginPath(); c.moveTo(x + dx * s, y); c.lineTo(x, y - s * .6); c.lineTo(x, y + s * .6); c.closePath(); c.fillStyle = color; c.fill(); };
  const rrect = (c, x, y, w, hh, r) => {
    r = Math.min(r, w / 2, hh / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + hh, r); c.arcTo(x + w, y + hh, x, y + hh, r); c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  /* circle: closed is filled, open is an outline with the stage color inside */
  const circ = (c, p, x, y, r, color, closed, lw = 3.5) => {
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = closed ? color : p.pal.stage; c.fill(); c.strokeStyle = color; c.lineWidth = lw; c.stroke();
  };
  /* a number line. B = { x0, x1, y, lo, hi }. Returns the value-to-pixel function. */
  const nline = (c, p, B, size = 13) => {
    const pal = p.pal, X = v => B.x0 + (v - B.lo) / (B.hi - B.lo) * (B.x1 - B.x0), per = (B.x1 - B.x0) / (B.hi - B.lo), lab = per >= 25 ? 1 : per >= 12.5 ? 2 : 5;
    line(c, B.x0 - 12, B.y, B.x1 + 12, B.y, pal.muted, 2.5);
    head(c, B.x0 - 14, B.y, -1, 9, pal.muted); head(c, B.x1 + 14, B.y, 1, 9, pal.muted);
    for (let v = Math.ceil(B.lo); v <= B.hi; v++) {
      line(c, X(v), B.y - 6, X(v), B.y + 6, v === 0 ? pal.text : pal.muted, v === 0 ? 2.4 : 1.5);
      if (v % lab === 0) T(c, p, v < 0 ? MI + (-v) : '' + v, X(v), B.y + 22, { size, weight: v === 0 ? 800 : 600, color: v === 0 ? pal.text : pal.muted });
    }
    return X;
  };
  /* the graph of x REL c: a ray with an open or closed end. col is the color. */
  const drawRay = (c, p, B, X, s, col, a = 1) => {
    const right = dirOf(s.rel) === 'right', xe = right ? B.x1 + 14 : B.x0 - 14, xc = X(s.c), off = xc < B.x0 - 6 || xc > B.x1 + 6;
    c.globalAlpha = a;
    const xa = clamp(xc, B.x0 - 14, B.x1 + 14);
    const empty = right ? xc > B.x1 + 14 : xc < B.x0 - 14;
    if (!empty) {
      line(c, xa, B.y, xe, B.y, col, 7);
      head(c, xe + (right ? 6 : -6), B.y, right ? 1 : -1, 12, col);
    }
    if (!off) circ(c, p, xc, B.y, 9, col, !strict(s.rel));
    c.globalAlpha = 1;
  };
  const legend = (c, p, y, size) => {
    const pal = p.pal, W = p.w, x = 22;
    circ(c, p, x, y, 7, pal.muted, false, 3);
    T(c, p, 'Open circle: the number is not included (< or >)', x + 16, y, { size, align: 'left', weight: 500, halo: false });
    circ(c, p, x, y + size * 1.9, 7, pal.muted, true, 3);
    T(c, p, 'Closed circle: the number is included (≤ or ≥)', x + 16, y + size * 1.9, { size, align: 'left', weight: 500, halo: false });
  };

  const fsOf = p => clamp(p.w / 26, 12.5, 16);

  register({
    id: 'solving-linear-inequalities', level: 'school',
    title: 'Solving linear inequalities',
    blurb: 'An inequality has a whole range of answers: test numbers, solve with the balance idea, meet the flip, and graph the solution.',
    thumb(c, p) {
      const pal = p.pal, W = p.w, H = p.h, y = H * .66, x0 = W * .08, x1 = W * .92, X = v => x0 + (v + 1) / 7 * (x1 - x0), fs = Math.max(9, H * .09);
      T(c, p, 'x + 3 > 7', W / 2, H * .24, { size: Math.max(13, H * .17), weight: 500, serif: true, halo: false });
      line(c, x0, y, x1, y, pal.muted, 2.4); head(c, x1, y, 1, 7, pal.muted); head(c, x0, y, -1, 7, pal.muted);
      for (let v = 0; v <= 5; v++) {
        line(c, X(v), y - 4, X(v), y + 4, pal.muted, 1.5);
        T(c, p, '' + v, X(v), y + H * .13, { size: fs, color: pal.muted, halo: false });
      }
      line(c, X(4), y, x1, y, pal.blue, 5); head(c, x1 + 2, y, 1, 9, pal.blue);
      circ(c, p, X(4), y, Math.max(4.5, H * .04), pal.blue, false, 2.6);
    },
    hook: String.raw`You have $20 and a slice of pizza costs $3. You could buy 6 slices, or 5, or 2. How can one short statement describe every number of slices that works, and what would it look like on a number line?`,
    steps: [
      { title: 'One inequality, many answers',
        text: String.raw`<p>An <b>inequality</b> compares two sides with \(&gt;\), \(&lt;\), \(\ge\) or \(\le\). Here it is \(x+3&gt;7\). Many numbers make it true, not just one.</p><p>First predict: is \(x=4\) a solution? Then drag the test point or use the slider. The readout says true or false. Press the button to show the whole solution set.</p>`,
        set: { view: 'test' } },
      { title: 'A scale that stays tilted',
        text: String.raw`<p>Think of an inequality as a scale that is not level. The left pan holds 6 and the right pan holds 4, so the left side is heavier: \(6&gt;4\).</p><p>Predict what happens when you add 2 to both pans. Then try every move. Adding, subtracting, multiplying or dividing both sides by a <em>positive</em> number never changes which side is heavier.</p>`,
        set: { view: 'bal' } },
      { title: 'The trap: a negative flips it',
        text: String.raw`<p>Start with \(3&lt;5\). Multiply both numbers by \(-1\) and you get \(-3\) and \(-5\). Now \(-3&gt;-5\). The symbol <b>flipped</b>.</p><p>On the number line, multiplying by a negative number mirrors the picture across 0. The number that was on the left lands on the right. Predict first, then try the moves. Then solve \(-2x&lt;6\) yourself.</p>`,
        set: { view: 'flip' } },
      { title: 'Solve it, graph it, check it',
        text: String.raw`<p>Now choose the moves yourself. When you multiply or divide by a negative number, you decide whether to flip the symbol. At the end the lesson tests numbers in the <em>original</em> inequality, so a missed flip is caught.</p><p>Try \(3-2x&lt;11\), then \(4(x-1)\ge 2x+6\), then the ticket budget, where only whole numbers count.</p>`,
        set: { view: 'work', sys: 1 } }
    ],
    formal: String.raw`
      <h3>What an inequality says</h3>
      <p>An equation such as \(x+3=7\) has one solution. An <em>inequality</em> such as \(x+3&gt;7\) is true for a whole range of numbers, called its <em>solution set</em>. The four symbols are \(&lt;\) (less than), \(&gt;\) (greater than), \(\le\) (less than or equal to) and \(\ge\) (greater than or equal to). The first two are <em>strict</em>: the two sides may not be equal. The last two are <em>non-strict</em>: equal is allowed.</p>
      <h3>Graphing on a number line</h3>
      <p>The <em>boundary</em> is where the inequality turns into an equation. For \(x+3&gt;7\) it is \(x=4\), because \(4+3=7\). The graph shows the boundary and the side that works.</p>
      <ul>
        <li><b>Open circle</b>: the boundary number is <em>not</em> included. Use it for \(&lt;\) and \(&gt;\). At \(x=4\) we get \(7&gt;7\), which is false.</li>
        <li><b>Closed circle</b>: the boundary number <em>is</em> included. Use it for \(\le\) and \(\ge\). At \(x=4\) we get \(7\ge 7\), which is true.</li>
        <li><b>Ray</b>: a thick line from the circle that goes on forever, with an arrow. It points right for "greater" and left for "less". The solution set of \(x&gt;4\) is every number to the right of 4.</li>
      </ul>
      <h3>Why adding and positive multiplying keep the symbol</h3>
      <p>Suppose \(a&lt;b\), so \(a\) is to the left of \(b\) on the number line. Adding the same number \(c\) to both slides the pair along the line without changing the gap between them, so \(a+c&lt;b+c\). Multiplying by a positive number \(c\) stretches the line from 0 without turning it around, so the left one is still on the left: \(ca&lt;cb\). Subtracting and dividing by a positive number are the same moves backward.</p>
      <h3>Why a negative number flips the symbol</h3>
      <p>Take \(a&lt;b\). Then \(b-a\) is a positive number. Multiply a positive number by a negative number \(c\) and the result is negative, so \(c(b-a)&lt;0\), which is \(cb-ca&lt;0\), and so \(cb&lt;ca\). The order reversed. On the number line, multiplying by \(-1\) mirrors the line across 0, so left and right swap. For example \(3&lt;5\) but \(-3&gt;-5\).</p>
      <p>A flip is needed only when you <em>multiply or divide</em> by a negative number. Adding or subtracting a negative number never flips the symbol.</p>
      <h3>Worked example: \(3-2x&lt;11\)</h3>
      <p>Subtract 3 from both sides: \(-2x&lt;8\). Divide both sides by \(-2\) and flip the symbol: \(x&gt;-4\). Graph: an open circle at \(-4\) with a ray to the right.</p>
      <p>Check with numbers. Inside the set, \(x=0\): \(3-2(0)=3&lt;11\) is true. On the boundary, \(x=-4\): \(3-2(-4)=11\), and \(11&lt;11\) is false, so the circle is open. Outside the set, \(x=-6\): \(3-2(-6)=15\), and \(15&lt;11\) is false. If you had forgotten the flip and written \(x&lt;-4\), the test \(x=-6\) would fail: it is in your set, but \(15&lt;11\) is false.</p>
      <h3>Worked example: \(4(x-1)\ge 2x+6\)</h3>
      <p>Distribute: \(4x-4\ge 2x+6\). Subtract \(2x\): \(2x-4\ge 6\). Add 4: \(2x\ge 10\). Divide by 2 (positive, so no flip): \(x\ge 5\). Graph: a closed circle at 5 with a ray to the right. Collecting the \(x\) terms on the side with the bigger coefficient keeps the coefficient positive and avoids a flip.</p>
      <h3>Inequalities in a situation</h3>
      <p>Tickets cost \$6 each plus a \$5 fee, and you have \$50. The total cost \(6t+5\) must be at most 50, so \(6t+5\le 50\). Solving gives \(t\le 7.5\). As a real-number inequality the graph is a ray. But \(t\) counts tickets, so only whole numbers make sense: \(t=0,1,\dots,7\). The graph is a row of separate dots, not a ray. Reading the answer in the situation: you can buy at most 7 tickets. Round the answer in the direction that keeps you inside the limit: down for "at most", up for "at least".</p>`,
    check: [
      { q: String.raw`Which statement about the inequality \(x+3&gt;7\) is true?`,
        choices: ['x = 4 is a solution, because 4 + 3 = 7', 'x = 5 is the only solution', 'x = 4 is not a solution, but every number greater than 4 is', 'x = 4 is the only number that is not a solution'], answer: 2,
        why: String.raw`The boundary is \(x=4\), where \(4+3=7\). The inequality is strict, so 7 is not greater than 7 and 4 is not a solution. Every number greater than 4 works: for example \(5+3=8&gt;7\). The solution set is a whole range, so it is not just 5, and numbers smaller than 4 are not solutions either.`,
        hint: String.raw`Put \(x=4\) into the left side. Is that number greater than 7, or equal to it?` },
      { q: String.raw`Solve \(5-2x\ge 13\). Which graph shows the solution?`,
        choices: ['x ≥ −4: closed circle at −4, shaded to the right', 'x ≤ 4: closed circle at 4, shaded to the left', 'x &lt; −4: open circle at −4, shaded to the left', 'x ≤ −4: closed circle at −4, shaded to the left'], answer: 3,
        why: String.raw`Subtract 5: \(-2x\ge 8\). Divide both sides by \(-2\) and flip the symbol: \(x\le -4\). The circle is closed because \(\ge\) allows equality, and the ray goes left. Test \(x=-6\): \(5-2(-6)=17\ge 13\) is true. The first choice forgot the flip, the second divided 8 by \(-2\) and got 4, and the third used an open circle although the inequality allows equal.`,
        hint: String.raw`Subtract 5 from both sides, then divide by \(-2\). What happens to \(\ge\) when you divide by a negative number?` },
      { q: String.raw`A student solves \(7-3x&lt;1\). Step 1: \(-3x&lt;-6\). Step 2: \(x&lt;2\). Where is the mistake?`,
        choices: ['Step 1 is wrong: it should be 3x &lt; −6', 'Step 2 is wrong: dividing by −3 flips the symbol, so x &gt; 2', 'There is no mistake: x &lt; 2 is correct', 'Step 2 is wrong: the answer should be x &lt; −2'], answer: 1,
        why: String.raw`Step 1 is right: subtract 7 from both sides. In Step 2 both sides are divided by \(-3\), a negative number, so the symbol must flip: \(x&gt;2\). Test \(x=3\) in the original: \(7-3(3)=-2&lt;1\) is true, and 3 is in \(x&gt;2\). The student's answer \(x&lt;2\) would include \(x=0\), but \(7-0=7&lt;1\) is false.`,
        hint: String.raw`Check each step. What number are both sides divided by in Step 2, and what does that do to the symbol? You can also test one number in the original.` }
    ],
    links: { prereq: ['solving-equations-with-a-balance', 'negative-numbers-and-absolute-value'], next: ['absolute-value-equations-and-inequalities', 'graphing-linear-inequalities'], related: ['forms-of-a-linear-equation', 'systems-of-equations', 'variables-and-relationships', 'solving-systems-by-substitution'] },

    mount({ stage, controls: C }) {
      const panel = stage.nextElementSibling;
      const st = { view: 'test', sys: 1, practice: false, tx: 2, strict: true, rv: 0, pd: 0, tests: {}, tilt: .2, ft: 1 };
      let cancel = () => {};
      const P = new Plane(stage, { cx: 0, cy: 0, span: 5 });
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const btn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const brow = (...els) => h('div', { class: 'ctl buttons' }, ...els);
      const pxOf = mx => P.w / 2 + mx * P.scale;      /* the plane keeps cx = 0 */

      panel.append(h('style', {}, `
        .sli-wb{display:flex;flex-direction:column;gap:12px}
        .sli-prompt{font-size:.92rem;line-height:1.5;margin:0}
        .sli-card{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 12px;padding:8px 12px;border:1.5px solid var(--line-strong);border-left:6px solid var(--blue);border-radius:4px;background:var(--surface-solid);font-family:var(--serif);font-size:1.3rem;line-height:1.6}
        .sli-nm{font:600 .8rem var(--sans);color:var(--muted)}
        .sli-log{display:flex;flex-direction:column;gap:6px;border-top:1px solid var(--line);padding-top:10px}
        .sli-row{display:flex;flex-direction:column}
        .sli-note{font:.78rem var(--sans);color:var(--muted)}
        .sli-req{font-family:var(--serif);font-size:1.12rem;line-height:1.5}
        .sli-coach{font-size:.9rem;line-height:1.5;border-top:1px solid var(--line);padding-top:10px}
        .sli-coach p{margin:0 0 6px}
        .sli-next{color:var(--text);font-weight:500}
        .sli-step{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:.92rem}
        .sli-step output{min-width:2.2em;text-align:center;font-variant-numeric:tabular-nums;font-weight:600}
        .sli-step .btn{min-width:40px;padding:6px 10px}
        .sli-fb{font-size:.9rem;line-height:1.5}
        .sli-fb p{margin:0 0 6px}
        .sli-vstack{display:flex;flex-direction:column;align-items:stretch;gap:8px}
        .sli-tally{margin:0}
      `));

      /* ============ shared feedback holders for the small views ============ */
      const mkFb = () => h('div', { class: 'sli-fb', 'aria-live': 'polite' });
      const setFb = (el, html) => { el.innerHTML = html; };

      /* ============ view 1: test a number (x + 3 > 7) ============ */
      let tS, tFb, tGate, tReveal, tBtns;
      const tRel = () => (st.strict ? 'gt' : 'ge');
      const tTruth = x => holds(tRel(), x + 3, 7);
      const tBox = p => ({ x0: 34, x1: p.w - 40, y: p.h * .46, lo: -1, hi: 11 });
      const testAt = x => { st.tests[x] = tTruth(x); };
      const tText = () => {
        const x = st.tx, tr = tTruth(x), rel = tRel(), s = SH[rel];
        let t = `<p><span class="k">Test</span> x = ${nf(x)}: ${nf(x)} + 3 = ${nf(x + 3)}. Is ${nf(x + 3)} ${s} 7? ${tr ? ok('True: green') : no('False: red')}</p>`;
        const nT = Object.values(st.tests).filter(Boolean).length, nF = Object.values(st.tests).length - nT;
        t += `<p>Tested so far: ${nT} true (green dots), ${nF} false (red crosses).</p>`;
        if (st.pd && x === 4) t += `<p>x = 4 is the <b>boundary</b>: ${st.strict ? 'the place where x + 3 &gt; 7 turns into the equation x + 3 = 7. It is not a solution of &gt;, because 7 is not greater than 7.' : 'where x + 3 ≥ 7 is just true, because 7 ≥ 7. With ≥ the boundary is included.'}</p>`;
        if (st.rv > .5) t += `<p><b>Solution set:</b> x ${s} 4, every number ${st.strict ? 'greater than 4' : 'greater than or equal to 4'}. ${st.strict ? 'Open circle at 4: 4 is not included.' : 'Closed circle at 4: 4 is included.'}</p>`;
        setFb(tFb, t);
      };
      grp('test', () => {
        C.title('Test a number');
        tBtns = C.buttons([{ label: 'x + 3 > 7', primary: true, onClick: () => setStrict(true) }, { label: 'x + 3 ≥ 7', onClick: () => setStrict(false) }]);
        tGate = h('div', { class: 'sli-vstack' }); panel.append(tGate);
        tS = C.slider({ label: 'Test point', min: 0, max: 10, step: .5, value: st.tx, format: v => 'x = ' + nf(v), onInput: v => { cancel(); st.tx = v; testAt(v); sync(); } });
        tFb = mkFb(); panel.append(tFb);
        tReveal = C.buttons([{ label: 'Show the whole solution set', primary: true, onClick: () => { st.pd = Math.max(st.pd, 1); cancel(); cancel = animateTo(st, { rv: 1 }, 700, sync); } },
          { label: 'Clear my tests', onClick: () => { st.tests = {}; st.rv = 0; sync(); } }]);
        C.hint('Drag the ring on the number line, or use the slider. You can switch between > and ≥ to see what changes at 4.');
      });
      const setStrict = s => {
        cancel(); st.strict = s; st.tests = {}; st.rv = 0; testAt(st.tx); if (st.pd) tGate.replaceChildren();
        tBtns[0].classList.toggle('primary', s); tBtns[1].classList.toggle('primary', !s);
        tBtns[0].setAttribute('aria-pressed', String(s)); tBtns[1].setAttribute('aria-pressed', String(!s));
        sync();
      };
      const tGateRender = () => {
        tGate.replaceChildren();
        if (st.pd) return;
        tGate.append(h('p', { class: 'sli-prompt' }, 'Predict first. When x = 4, x + 3 equals 7. Is x = 4 a solution of x + 3 > 7?'),
          brow(btn('Yes, it is a solution', () => gate(true)), btn('No, it is not', () => gate(false))));
      };
      const gate = yes => {
        st.pd = 1; st.tx = 4; testAt(4); tS.set(4);
        tGateRender();
        const lead = yes ? no('Not quite.') + ' ' : ok('Right.') + ' ';
        tGate.append(h('p', { class: 'sli-prompt', html: lead + 'At x = 4 we get 4 + 3 = 7, and 7 is not greater than 7, so 4 is not a solution of &gt;. The test point is on the boundary: the place where the inequality becomes the equation x + 3 = 7. Now test other numbers.' }));
        sync();
      };

      /* ============ view 2: the scale ============ */
      const BL = { l: 6, r: 4, hist: [], pd: 0, kept: 0, ops: 0, bad: 0 };
      let bGate, bFb, bBtns, bUndo;
      const tiltFor = (l, r) => (l > r ? .2 : l < r ? -.2 : 0);
      const balText = (extra) => {
        const l = BL.l, r = BL.r, rel = l > r ? 'gt' : l < r ? 'lt' : null;
        let t = extra ? `<p>${extra}</p>` : '';
        t += `<p><span class="k">Scale</span> left ${nf(l)}, right ${nf(r)}: ${rel ? nf(l) + ' ' + SH[rel] + ' ' + nf(r) + ', the ' + (rel === 'gt' ? 'left' : 'right') + ' pan is heavier' : 'level'}.</p>`;
        if (BL.ops) t += `<p>Moves so far: ${BL.ops}. The same side stayed heavier after ${BL.kept} of them.</p>`;
        setFb(bFb, t);
      };
      const balMove = (kind, keepGate) => {
        if (!keepGate) bGate.replaceChildren();
        const l0 = BL.l, r0 = BL.r;
        let l = l0, r = r0, txt = '';
        if (kind === 'add') { l += 2; r += 2; txt = 'Adding 2 to both pans'; }
        if (kind === 'sub') {
          if (Math.min(l, r) < 2) { balText(no('Not possible.') + ' A pan cannot hold less than 0, so you cannot take 2 from a pan that has less than 2. Undo, or try another move.'); return; }
          l -= 2; r -= 2; txt = 'Taking 2 from both pans';
        }
        if (kind === 'mul') { l *= 2; r *= 2; txt = 'Doubling both pans'; }
        if (kind === 'div') { l /= 2; r /= 2; txt = 'Halving both pans'; }
        if (kind === 'neg') { balText(no('Not on a scale.') + ' A pan cannot hold −' + nf(l) + ' kg. To see what multiplying by a negative number does, use the number line in the next step. The symbol will flip.'); return; }
        const b = l0 > r0 ? 'left' : 'right';
        BL.hist.push([l0, r0, BL.ops, BL.kept]);
        BL.l = l; BL.r = r; BL.ops++;
        const same = (l > r) === (l0 > r0) && l !== r;
        if (same) BL.kept++;
        cancel(); cancel = animateTo(st, { tilt: tiltFor(l, r) }, 500, sync);
        balText(`${txt} gives ${nf(l)} and ${nf(r)}. The ${b} pan is still heavier: ${nf(l0)} ${SH[l0 > r0 ? 'gt' : 'lt']} ${nf(r0)} became ${nf(l)} ${SH[l > r ? 'gt' : 'lt']} ${nf(r)}. ` +
          (kind === 'add' || kind === 'sub' ? 'The same amount was added to both pans (or taken from both), so the gap between them did not change.' : kind === 'mul' ? 'Doubling doubles the gap too, so the heavier side stays heavier.' : 'Halving halves the gap, so the heavier side stays heavier.'));
        sync();
      };
      grp('bal', () => {
        C.title('The scale');
        bGate = h('div', { class: 'sli-vstack' }); panel.append(bGate);
        bBtns = C.buttons([
          { label: 'Add 2 to both', onClick: () => balMove('add') }, { label: 'Take 2 from both', onClick: () => balMove('sub') },
          { label: 'Double both', onClick: () => balMove('mul') }, { label: 'Halve both', onClick: () => balMove('div') },
          { label: 'Multiply both by −1', onClick: () => balMove('neg') }]);
        bUndo = C.buttons([{ label: 'Undo', onClick: () => { const l = BL.hist.pop(); if (!l) return; BL.l = l[0]; BL.r = l[1]; BL.ops = l[2]; BL.kept = l[3]; cancel(); cancel = animateTo(st, { tilt: tiltFor(BL.l, BL.r) }, 400, sync); balText('Undone.'); sync(); } },
          { label: 'Reset the scale', onClick: () => balReset() }]);
        bFb = mkFb(); panel.append(bFb);
        C.hint('Each move does the same thing to both pans. Watch the beam.');
      });
      const balGate = () => {
        bGate.replaceChildren();
        if (BL.pd) return;
        bGate.append(h('p', { class: 'sli-prompt' }, 'Predict first. The left pan holds 6 and the right pan holds 4. You add 2 to both pans. What happens to the beam?'),
          brow(btn('Left stays heavier', () => balPred(0)), btn('The pans become level', () => balPred(1)), btn('Right becomes heavier', () => balPred(2))));
      };
      const balPred = i => {
        BL.pd = 1;
        const lead = i === 0 ? ok('Right.') : no('Not quite.');
        bGate.replaceChildren(); balMove('add', true);
        bGate.append(h('p', { class: 'sli-prompt', html: lead + ' 6 + 2 = 8 and 4 + 2 = 6. The left pan is still heavier. The gap was 2 and it is still 2, so the beam keeps its tilt. Now try the other moves.' }));
        sync();
      };
      const balReset = () => {
        BL.l = 6; BL.r = 4; BL.hist = []; BL.ops = 0; BL.kept = 0; cancel(); st.tilt = .2; balText(''); sync();
      };

      /* ============ view 3: the mirror ============ */
      const FP = { a: 3, b: 5, pa: 3, pb: 5, pd: 0, mv: 0, pend: null, label: '' };
      let fGate, fFb, fBtns;
      const fBox = (p, y) => ({ x0: 34, x1: p.w - 40, y, lo: -12, hi: 12 });
      const FOPS = [['Add 4', 'add', 4], ['Subtract 4', 'add', -4], ['Multiply by 2', 'mul', 2], ['Multiply by −1', 'mul', -1], ['Multiply by −2', 'mul', -2]];
      const fApply = (kind, n) => {
        const na = kind === 'add' ? FP.a + n : FP.a * n, nb = kind === 'add' ? FP.b + n : FP.b * n;
        if (ab(na) > 12 || ab(nb) > 12) { setFb(fFb, `<p>${no('Off the line.')} That would put a number beyond ±12. Use Reset, or try a different move.</p>`); return; }
        const r0 = relOf(FP.a, FP.b);
        FP.pa = FP.a; FP.pb = FP.b; FP.a = na; FP.b = nb; FP.mv++;
        const r1 = relOf(na, nb), ph = kind === 'add' ? (n > 0 ? `Adding ${n}` : `Subtracting ${-n}`) : `Multiplying by ${nf(n)}`;
        FP.label = kind === 'add' ? (n > 0 ? '+ ' + n : MI + ' ' + (-n)) : '× ' + (n < 0 ? '(' + nf(n) + ')' : n);
        st.ft = 0; cancel(); cancel = animateTo(st, { ft: 1 }, 700, sync);
        let t = `<p>${ph} turns ${nf(FP.pa)} ${SH[r0]} ${nf(FP.pb)} into ${nf(na)} ${SH[r1]} ${nf(nb)}. `;
        if (kind === 'mul' && n < 0) t += `The picture is mirrored across 0${n === -2 ? ' and stretched by 2' : ''}, so the order reverses. The symbol ${r1 !== r0 ? ok('flipped') : no('did not flip')}.`;
        else t += `The order along the line is kept, so the symbol stays ${SH[r1]}.`;
        setFb(fFb, t + '</p>'); sync();
      };
      const fTry = (kind, n) => {
        if (!(kind === 'mul' && n < 0 && !FP.pd)) fGate.replaceChildren();
        if (kind === 'mul' && n < 0 && !FP.pd) {
          FP.pend = [kind, n];
          const r0 = relOf(FP.a, FP.b);
          fGate.replaceChildren(h('p', { class: 'sli-prompt' }, `Predict first. Right now ${nf(FP.a)} ${SY[r0]} ${nf(FP.b)}. You will multiply both numbers by ${nf(n)}. Which symbol will be true afterwards?`),
            brow(btn(`It stays ${SY[r0]}`, () => fPred(false)), btn(`It flips to ${SY[FL[r0]]}`, () => fPred(true))));
          return;
        }
        fApply(kind, n);
      };
      const fPred = flips => {
        const [k, n] = FP.pend, r0 = relOf(FP.a, FP.b); FP.pd = 1;
        fGate.replaceChildren();
        const na = FP.a * n, nb = FP.b * n, r1 = relOf(na, nb), real = r1 !== r0;
        fApply(k, n);
        fGate.append(h('p', { class: 'sli-prompt', html: (flips === real ? ok('Right.') : no('Not quite.')) + ` Multiplying by ${nf(n)} mirrors the number line across 0, so the number that was on the left ends up on the right. Now ${nf(na)} ${SH[r1]} ${nf(nb)}. This is the rule: multiply or divide by a negative number and the symbol flips.` }));
      };
      grp('flip', () => {
        C.title('Mirror the number line');
        fGate = h('div', { class: 'sli-vstack' }); panel.append(fGate);
        fBtns = C.buttons(FOPS.map(([l, k, n]) => ({ label: l, onClick: () => fTry(k, n) })));
        C.buttons([{ label: 'Reset to 3 and 5', onClick: () => { cancel(); FP.a = 3; FP.b = 5; FP.pa = 3; FP.pb = 5; FP.mv = 0; FP.label = ''; st.ft = 1; setFb(fFb, '<p>Back to 3 &lt; 5.</p>'); sync(); } },
          { label: 'Now solve −2x < 6 yourself', primary: true, onClick: () => { st.sys = 0; enterView('work'); } }]);
        fFb = mkFb(); panel.append(fFb);
        C.hint('The top line is before the move and the bottom line is after it. The dashed lines show where each number went.');
      });

      /* ============ the workbench (view 4 and most practice problems) ============ */
      const W = { P: WORK[1], cur: null, hist: [], rows: [], phase: 'solve', fb: '', op: { k: 'sub', n: 3, w: 'num' }, chk: null, err: 0, dots: false, onDone: null, done: false, prompt: '' };
      const wbEl = h('div', { class: 'sli-wb' });
      const wbTitle = h('p', { class: 'ctl-title' }, 'Solve it yourself');
      const promptEl = h('p', { class: 'sli-prompt' });
      const cardEl = h('div', { class: 'sli-card' });
      const logEl = h('div', { class: 'sli-log' });
      const coachEl = h('div', { class: 'sli-coach', 'aria-live': 'polite' });
      const actsEl = h('div', { class: 'sli-acts sli-vstack' });
      const chooserEl = h('div', { class: 'ctl buttons' });
      wbEl.append(promptEl, cardEl, logEl, coachEl, actsEl, chooserEl);
      panel.append(wbTitle, wbEl);
      G.wb = [wbTitle, wbEl];

      const wbReset = Pr => {
        Object.assign(W, { P: Pr, cur: Pr.I, hist: [], rows: [{ note: 'Start', eq: istr(Pr.I, Pr, true) }], fb: '', chk: null, dots: false, done: false,
          err: 0, prompt: Pr.story || '', phase: Pr.model ? 'model' : Pr.pred ? 'pred' : 'solve', op: { k: 'sub', n: 1, w: 'num' } });
      };
      const nextText = () => {
        const P = W.P, ph = W.phase;
        if (ph === 'model') return P.model.q;
        if (ph === 'pred') return P.pred.q;
        if (ph === 'ctxq') return P.ctx.q;
        if (ph === 'solve') return isoForm(W.cur) ? `${P.v} is alone. Press Check my answer to test it with numbers.` : `Choose a move to do to both sides. Aim to get ${P.v} alone.`;
        return '';
      };
      const choicePicker = (list, ans, onRight, onWrong) => brow(...list.map((c, i) => btn(c[0], () => {
        if (i === ans) onRight(c[1]); else onWrong(c[1]);
      })));
      const wbAct = () => {
        const P = W.P, ph = W.phase, out = [];
        if (ph === 'model') out.push(choicePicker(P.model.ch, P.model.ans,
          why => { W.fb = ok('Yes.') + ' ' + why; W.phase = P.pred ? 'pred' : 'solve'; wbRefresh(); },
          why => { W.err++; W.fb = no('Not quite.') + ' ' + why; wbRefresh(); }));
        else if (ph === 'pred') out.push(choicePicker(P.pred.ch, P.pred.ans,
          why => { W.fb = ok('Yes.') + ' ' + why; W.phase = 'solve'; wbRefresh(); },
          why => { W.err++; W.fb = no('Not quite.') + ' ' + why + ' Now solve it and see.'; W.phase = 'solve'; wbRefresh(); }));
        else if (ph === 'ctxq') out.push(choicePicker(P.ctx.ch, P.ctx.ans,
          why => { W.dots = true; W.fb = ok('Right.') + ' ' + why + ' The graph is now a row of dots, because only whole numbers count. The faint ray shows the real-number answer.'; finish(); },
          why => { W.err++; W.fb = no('Not quite.') + ' ' + why; wbRefresh(); }));
        else if (ph === 'solve') {
          const v = P.v, op = W.op, hasParen = W.cur.L.m != null || W.cur.R.m != null;
          const kinds = [['add', 'Add'], ['sub', 'Subtract'], ['mul', 'Multiply'], ['div', 'Divide']];
          const out2 = h('output', { 'aria-live': 'polite' });
          const kb = kinds.map(([k, l]) => btn(l, () => { op.k = k; if ((k === 'add' || k === 'sub') && op.n < 1) op.n = ab(op.n) || 1; upd(); }));
          const applyEl = h('div', { class: 'ctl buttons' });
          const wk = [['num', 'a number'], ['x', 'an ' + v + '-term']].map(([w, l]) => btn(l, () => { op.w = w; upd(); }));
          const wkRow = h('div', { class: 'ctl buttons' }, h('span', { class: 'sli-note' }, 'Add or subtract'), ...wk);
          const upd = () => {
            out2.textContent = nf(op.n);
            kb.forEach((b, i) => { b.classList.toggle('primary', kinds[i][0] === op.k); b.setAttribute('aria-pressed', String(kinds[i][0] === op.k)); });
            const pm = op.k === 'add' || op.k === 'sub';
            wkRow.style.display = pm ? '' : 'none';
            wk.forEach((b, i) => { const on = op.w === (i ? 'x' : 'num'); b.classList.toggle('primary', on); b.setAttribute('aria-pressed', String(on)); });
            const neg = !pm && op.n < 0, base = opText(op, v);
            applyEl.replaceChildren(...(neg
              ? [btn(`Apply and flip the symbol: ${base}`, () => doApply(true), true), btn(`Apply and keep the symbol: ${base}`, () => doApply(false))]
              : [btn(`Apply: ${base}`, () => doApply(false), true)]));
          };
          const stepA = d => {
            const pm = op.k === 'add' || op.k === 'sub'; let n = op.n + d;
            if (!pm && n === 0) n += d > 0 ? 1 : -1;
            op.n = pm ? clamp(n, 1, 20) : clamp(n, -12, 12); upd();
          };
          upd();
          out.push(h('div', { class: 'sli-note' }, 'Choose the move'));
          out.push(brow(...kb));
          out.push(wkRow);
          out.push(h('div', { class: 'sli-step' }, 'Amount', btn('−5', () => stepA(-5)), btn('−1', () => stepA(-1)), out2, btn('+1', () => stepA(1)), btn('+5', () => stepA(5))));
          out.push(applyEl);
          const un = btn('Undo', undoOp); un.disabled = !W.hist.length;
          const extra = [un, btn('Hint', () => { W.fb = '<b>Hint.</b> ' + hintFor(W.cur, W.P); wbRefresh(); })];
          if (hasParen) extra.unshift(btn('Distribute', () => doApply(false, { k: 'dist' }), true));
          if (isoForm(W.cur)) extra.unshift(btn('Check my answer', doCheck, true));
          out.push(brow(...extra));
          if (W.rows.length > 1) out.push(brow(btn('Start this problem over', () => { const e = W.err; wbReset(W.P); W.err = e; wbRefresh(); })));
        }
        return out;
      };
      const doApply = (flip, o2) => {
        const P = W.P, op = o2 ? o2 : Object.assign({}, W.op, { flip });
        const before = W.cur, res = doOp(before, op);
        if (res.err) { W.fb = no('Not yet.') + ' ' + res.err; wbRefresh(); return; }
        const after = res.I, neg = (op.k === 'mul' || op.k === 'div') && op.n < 0;
        W.hist.push({ I: before, rows: W.rows.length });
        W.cur = after; W.chk = null;
        W.rows.push({ note: opText(op, P.v) + (neg ? (flip ? ' and flip the symbol' : ' and keep the symbol') : ''), eq: istr(after, P, true) });
        let s = '';
        if (op.k === 'dist') s = ok('Distributed.') + ' The number outside multiplied every term inside. ';
        else if (neg) s = flip ? ok('You flipped the symbol.') + ` A negative multiplier mirrors the number line, so the order reverses: ${SH[before.rel]} became ${SH[after.rel]}. ` : `You kept the symbol ${SH[before.rel]}. Remember the mirror from the number line. We will test your answer with real numbers to see if that was right. `;
        else if (op.k === 'mul' || op.k === 'div') s = 'You used a positive number, so the symbol keeps its direction. ';
        else s = 'Adding or subtracting the same thing on both sides keeps the symbol. ';
        const t0 = terms(before), t1 = terms(after);
        if (isoForm(after)) s += `${P.v} is alone now. Press Check my answer.`;
        else if (op.k === 'dist') s += 'Now collect terms.';
        else if (t1 < t0) s += 'A term cancelled, so the inequality is simpler.';
        else if (t1 > t0) s += 'It is a legal move, since you did the same thing to both sides, but it added a term. Try Undo and look for a move that cancels something.';
        else s += 'It is legal, but nothing cancelled. Use Hint if you are stuck.';
        W.fb = s; wbRefresh();
      };
      const undoOp = () => {
        const last = W.hist.pop(); if (!last) return;
        W.cur = last.I; W.rows.length = last.rows; W.chk = null; W.fb = 'Undone. The inequality is back to what it was.'; wbRefresh();
      };
      /* test numbers in the ORIGINAL inequality */
      const doCheck = () => {
        const P = W.P, I0 = P.I, ans = isoForm(W.cur);
        if (!ans) return;
        const cv = qval(ans.c), right = dirOf(ans.rel) === 'right';
        const inside = right ? Math.floor(cv) + 1 : Math.ceil(cv) - 1, outside = right ? Math.ceil(cv) - 1 : Math.floor(cv) + 1;
        const frac = ans.c[1] !== 1 && !TERM.includes(ans.c[1]);
        const defs = [['inside your answer', inside, true], ['on the boundary' + (frac ? ` (${qtxt(ans.c)} is about ${nf(cv)})` : ''), cv, !strict(ans.rel)], ['outside your answer', outside, false]];
        const rows = defs.map(([nm, x, exp]) => {
          const lv = sideVal(I0.L, x), rv = sideVal(I0.R, x), tr = holds(I0.rel, lv, rv);
          return { nm, x, exp, lv, rv, tr, agree: tr === exp };
        });
        const html = rows.map(r => `<p><span class="k">${r.nm}</span> ${P.v} = ${nf(r.x)}: ${sideStr(I0.L, P.v, P.ord, r.x)} = ${nf(r.lv)}${q0(I0.R.a) ? '' : ' and ' + sideStr(I0.R, P.v, P.ord, r.x) + ' = ' + nf(r.rv)}. Is ${nf(r.lv)} ${SH[I0.rel]} ${nf(r.rv)}? ${r.tr ? ok('Yes, true') : no('No, false')}. ` +
          (r.agree ? ok('This agrees with your graph.') : no('This does NOT agree with your graph.') + ` Your graph says ${P.v} = ${nf(r.x)} ${r.exp ? 'works' : 'does not work'}.`) + '</p>').join('');
        W.chk = { rows, ok: rows.every(r => r.agree) };
        if (W.chk.ok) {
          W.fb = html + `<p>${ok('All three agree.')} Your answer ${P.v} ${SH[ans.rel]} ${qtxt(ans.c)} is right, and the ${strict(ans.rel) ? 'open' : 'closed'} circle is right.</p>`;
          if (P.ctx) { W.phase = 'ctxq'; wbRefresh(); } else finish();
        } else {
          W.err++;
          const sol = P.S, sameB = sol && qval(sol.c) === cv, flipped = sameB && dirOf(sol.rel) !== dirOf(ans.rel);
          W.fb = html + `<p>${no('The check failed.')} ` + (rows[0].agree ? '' : flipped ? 'The boundary is right but the shading goes the wrong way. That is the sign of a missed flip: look at any step where you multiplied or divided by a negative number. ' : 'Something went wrong in one of the steps. ') +
            'Press Undo to go back, and find the step to fix.</p>';
          wbRefresh();
        }
      };
      const finish = () => { W.done = true; W.phase = 'done'; wbRefresh(); if (W.onDone) W.onDone(); };

      const wbRefresh = () => {
        const P = W.P;
        promptEl.innerHTML = W.prompt || ''; promptEl.style.display = W.prompt ? '' : 'none';
        const hideCard = W.phase === 'model';
        cardEl.style.display = hideCard ? 'none' : '';
        cardEl.replaceChildren(h('span', { class: 'sli-nm' }, 'Now'), h('span', { html: istr(W.cur, P, true) }));
        logEl.replaceChildren(...W.rows.map(r => h('div', { class: 'sli-row' }, h('span', { class: 'sli-note' }, r.note), h('span', { class: 'sli-req', html: r.eq }))));
        logEl.style.display = hideCard || W.rows.length < 2 ? 'none' : '';
        const nt = nextText();
        coachEl.innerHTML = (W.fb ? `<div>${W.fb.startsWith('<p>') ? W.fb : '<p>' + W.fb + '</p>'}</div>` : '') + (nt ? `<p class="sli-next">${nt}</p>` : '');
        actsEl.replaceChildren(...wbAct());
        const showCh = !st.practice && st.view === 'work';
        chooserEl.style.display = showCh ? '' : 'none';
        if (showCh) Array.from(chooserEl.children).forEach((b, i) => b.classList.toggle('primary', st.sys === i));
        sync();
      };
      WORK.forEach((Pr, i) => chooserEl.append(btn(Pr.name, () => { st.sys = i; wbReset(WORK[i]); wbRefresh(); })));
      chooserEl.style.display = 'none';

      /* ============ practice: the choose-the-graph and trap problems ============ */
      const AL = { prob: null, tested: {}, fb: '', done: false };
      const altEl = h('div', { class: 'sli-wb' });
      const altPrompt = h('p', { class: 'sli-prompt' });
      const altActs = h('div', { class: 'sli-vstack' });
      const altFb = mkFb();
      altEl.append(altPrompt, altActs, altFb);
      panel.append(altEl);
      G.alt = [altEl];
      const altRender = () => {
        const pr = AL.prob; if (!pr) return;
        altPrompt.innerHTML = `<b>Problem ${PR.idx + 1} of ${PROBS.length}: ${pr.name}.</b> ${pr.story}` + (pr.kind === 'choose' ? `<br>${pr.q}` : '');
        altActs.replaceChildren();
        if (pr.kind === 'choose') {
          pr.opts.forEach((o, i) => altActs.append(btn(`${'ABCD'[i]}: ${o.words}`, () => {
            if (AL.done) return;
            if (o.ok) { AL.done = true; AL.fb = ok('Yes.') + ' ' + o.why; completeProb(); } else { PR.err++; AL.fb = no('Not quite.') + ' ' + o.why; }
            altRender();
          })));
        } else {
          altActs.append(h('p', { class: 'sli-prompt' }, 'Test numbers in the original inequality −3x > 12. Then correct the answer.'));
          altActs.append(brow(...TRAP.tests.map(t => btn(`Test x = ${nf(t.x)}`, () => { AL.tested[t.x] = true; AL.fb = '<p>' + t.why + '</p>'; altRender(); sync(); }))));
          if (Object.keys(AL.tested).length) {
            altActs.append(h('p', { class: 'sli-prompt' }, 'What is the correct solution?'));
            TRAP.fix.forEach(f => altActs.append(btn(f[0], () => {
              if (AL.done) return;
              if (f[2]) { AL.done = true; AL.fb = ok('Yes.') + ' ' + f[1]; completeProb(); } else { PR.err++; AL.fb = no('Not quite.') + ' ' + f[1]; }
              altRender();
            })));
          }
        }
        altFb.innerHTML = AL.fb.startsWith('<p>') ? AL.fb : AL.fb ? '<p>' + AL.fb + '</p>' : '';
      };

      /* ============ practice shell ============ */
      const PR = { idx: 0, solved: 0, first: 0, err: 0, fin: false };
      let startBtn, pTally, pFb, pNext, pBody;
      C.title('Practice');
      C.hint('Seven short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); if (st.practice) leavePractice(); else { st.practice = true; PR.idx = 0; PR.solved = 0; PR.first = 0; loadProb(); } } }])[0];
      grp('prac', () => {
        pTally = h('p', { class: 'ctl-title sli-tally' });
        pFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pNext = btn('Next problem', () => nextProb(), true); pNext.disabled = true;
        panel.append(pTally, pFb, brow(pNext));
      });
      const tally = () => { pTally.textContent = `${PR.solved} of ${PROBS.length} solved, ${PR.first} with no wrong choices`; };
      const leavePractice = () => { enterView(st.lastView || 'test'); };
      const loadProb = () => {
        const pr = PROBS[PR.idx]; PR.fin = false; PR.err = 0; AL.prob = pr; AL.tested = {}; AL.fb = ''; AL.done = false;
        pFb.innerHTML = ''; pNext.disabled = true; pNext.textContent = PR.idx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        if (pr.kind === 'work') {
          st.view = 'work'; wbReset(pr.P); W.onDone = () => { PR.err = W.err; completeProb(); };
          W.prompt = `<b>Problem ${PR.idx + 1} of ${PROBS.length}: ${pr.name}.</b> ${pr.story}`;
          wbRefresh();
        } else { st.view = pr.kind; altRender(); }
        tally(); sync();
      };
      const completeProb = () => {
        if (PR.fin) return;
        PR.fin = true; PR.solved++;
        const first = PR.err === 0; if (first) PR.first++;
        pNext.disabled = false; tally();
        pFb.innerHTML = ok('Problem solved.') + (first ? ' You did it with no wrong choices.' : ' You had a wrong choice on the way, and the feedback told you why. That is how it sticks.');
      };
      const nextProb = () => {
        if (PR.idx < PROBS.length - 1) { PR.idx++; loadProb(); return; }
        pNext.disabled = true;
        pFb.innerHTML = `All seven problems are done. You got ${PR.first} of ${PROBS.length} with no wrong choices. Press Back to the lesson, or go back and try again.`;
      };

      /* ============ canvas ============ */
      const drawTest = (c, p) => {
        const pal = p.pal, W0 = p.w, H = p.h, fs = fsOf(p), rel = tRel(), B = tBox(p), X = nline(c, p, B), x = st.tx, tr = tTruth(x);
        T(c, p, 'x + 3 ' + SY[rel] + ' 7', W0 / 2, H * .08, { size: clamp(W0 / 11, 26, 40), weight: 500, serif: true });
        T(c, p, `x = ${nf(x)}:  ${nf(x)} + 3 = ${nf(x + 3)}`, W0 / 2, H * .17, { size: fs + 1, weight: 500 });
        T(c, p, `${nf(x + 3)} ${SY[rel]} 7 is ${tr ? 'TRUE ✓' : 'FALSE ✗'}`, W0 / 2, H * .22, { size: fs + 3, weight: 800, color: tr ? pal.green : pal.red });
        const bdOn = st.pd || st.rv > 0;
        if (st.rv > 0) {
          c.globalAlpha = st.rv;
          line(c, B.x0 - 12, B.y, X(4), B.y, pal.red, 5);
          c.globalAlpha = 1;
          drawRay(c, p, B, X, { rel, c: 4 }, pal.green, st.rv);
        }
        if (bdOn) {
          line(c, X(4), B.y - 26, X(4), B.y + 8, pal.violet, 2, [4, 4]);
          T(c, p, 'boundary: x = 4', X(4), B.y + 46, { size: fs, color: pal.violet });
          T(c, p, '(where x + 3 = 7)', X(4), B.y + 46 + fs * 1.3, { size: fs - 1, color: pal.violet, weight: 500 });
        }
        Object.keys(st.tests).forEach(k => {
          const v = +k, t = st.tests[k], px = X(v);
          if (t) circ(c, p, px, B.y, 5.5, pal.green, true, 2);
          else { line(c, px - 5, B.y - 5, px + 5, B.y + 5, pal.red, 3); line(c, px - 5, B.y + 5, px + 5, B.y - 5, pal.red, 3); }
        });
        /* the test point */
        const hx = X(x);
        line(c, hx, B.y - 8, hx, B.y - 30, pal.brass, 2);
        c.beginPath(); c.arc(hx, B.y, 13, 0, Math.PI * 2); c.fillStyle = tr ? pal.green : pal.red; c.globalAlpha = .28; c.fill(); c.globalAlpha = 1;
        c.strokeStyle = pal.brass; c.lineWidth = 3.5; c.stroke();
        T(c, p, `x = ${nf(x)}`, hx, B.y - 44, { size: fs + 1, weight: 800 });
        if (st.rv > .5) para(c, p, `Solution set: x ${SY[rel]} 4. ${st.strict ? 'The open circle means 4 is not included.' : 'The closed circle means 4 is included.'}`, W0 / 2, B.y + 92 + fs, W0 - 40, { size: fs, color: pal.text });
        legend(c, p, H - 14 - fs * 2.6, fs - .5);
      };

      const drawBal = (c, p) => {
        const pal = p.pal, W0 = p.w, H = p.h, fs = fsOf(p), l = BL.l, r = BL.r, th = st.tilt;
        const px = W0 / 2, py = H * .4, hl = Math.min(W0 * .31, 190), sl = H * .19, pw = Math.min(hl * .4, 78);
        const rel = l > r ? 'gt' : l < r ? 'lt' : null;
        T(c, p, rel ? `${nf(l)} ${SY[rel]} ${nf(r)}` : `${nf(l)} = ${nf(r)}`, W0 / 2, H * .09, { size: clamp(W0 / 10, 28, 44), weight: 500, serif: true });
        T(c, p, rel ? `The ${rel === 'gt' ? 'left' : 'right'} pan is heavier.` : 'The pans are level.', W0 / 2, H * .17, { size: fs + 1, weight: 500 });
        /* stand */
        line(c, px, py, px, H * .93, pal['grid-strong'], 6);
        line(c, px - 52, H * .93, px + 52, H * .93, pal['grid-strong'], 7);
        const ends = [[px - Math.cos(th) * hl, py + Math.sin(th) * hl], [px + Math.cos(th) * hl, py - Math.sin(th) * hl]];
        line(c, ends[0][0], ends[0][1], ends[1][0], ends[1][1], pal.text, 6);
        circ(c, p, px, py, 9, pal.brass, true, 2);
        [[ends[0], l, 'Left pan', pal.blue], [ends[1], r, 'Right pan', pal.red]].forEach(([e, v, nm, col]) => {
          const ex = e[0], ey = e[1], py2 = ey + sl;
          line(c, ex, ey, ex - pw * .9, py2, pal.muted, 1.6); line(c, ex, ey, ex + pw * .9, py2, pal.muted, 1.6);
          c.beginPath(); c.moveTo(ex - pw, py2); c.quadraticCurveTo(ex, py2 + 26, ex + pw, py2); c.closePath(); c.fillStyle = pal['grid-strong']; c.fill();
          if (v > 0) {
            const bw = clamp(26 + 9 * Math.sqrt(v), 30, pw * 1.7), bh = bw * .78;
            rrect(c, ex - bw / 2, py2 - bh, bw, bh, 6); c.fillStyle = col; c.globalAlpha = .9; c.fill(); c.globalAlpha = 1;
            T(c, p, nf(v), ex, py2 - bh / 2, { size: clamp(bw * .45, 14, 22), weight: 800, color: '#fff', halo: false });
          } else T(c, p, '0', ex, py2 - 14, { size: fs, color: pal.muted });
          T(c, p, `${nm}: ${nf(v)}`, ex, py2 + 42, { size: fs, weight: 700 });
        });
      };

      const drawFlip = (c, p) => {
        const pal = p.pal, W0 = p.w, H = p.h, fs = fsOf(p), y1 = H * .3, y2 = H * .66, B1 = fBox(p, y1), B2 = fBox(p, y2);
        const X1 = nline(c, p, B1), X2 = nline(c, p, B2), t = st.ft;
        const lerpv = (a, b) => a + (b - a) * ease(t);
        const ca = lerpv(FP.pa, FP.a), cb = lerpv(FP.pb, FP.b);
        const r0 = relOf(FP.pa, FP.pb), r1 = relOf(FP.a, FP.b);
        line(c, X1(0), y1 - 62, X1(0), y2 + 8, pal.text, 1.5, [5, 5]);
        T(c, p, FP.mv ? `Before: ${nf(FP.pa)} ${SY[r0]} ${nf(FP.pb)}` : `Start: ${nf(FP.pa)} ${SY[r0]} ${nf(FP.pb)}`, B1.x0, y1 - 66, { size: fs + 3, align: 'left', weight: 800 });
        [[FP.pa, ca, pal.blue], [FP.pb, cb, pal.red]].forEach(([v0, v1, col]) => {
          if (FP.mv) line(c, X1(v0), y1 + 10, X2(v1), y2 - 12, col, 2.2, [6, 5]);
          circ(c, p, X1(v0), y1, 9, col, true, 2);
          T(c, p, nf(v0), X1(v0), y1 - 26, { size: fs + 1, color: col, weight: 800 });
        });
        [[FP.pa, ca, pal.blue], [FP.pb, cb, pal.red]].forEach(([v0, v1, col]) => {
          circ(c, p, X2(v1), y2, 9, col, true, 2);
          T(c, p, nf(Math.round(v1 * 10) / 10), X2(v1), y2 + 46, { size: fs + 1, color: col, weight: 800 });
        });
        if (FP.mv) {
          T(c, p, `After ${FP.label}: ${nf(FP.a)} ${SY[r1]} ${nf(FP.b)}${r1 !== r0 ? '  (flipped)' : ''}`, B2.x0, y2 + 84, { size: fs + 3, align: 'left', weight: 800, color: r1 !== r0 ? pal.violet : pal.text });
        } else T(c, p, 'Pick a move below.', B2.x0, y2 + 84, { size: fs + 1, align: 'left', weight: 500, color: pal.muted });
        T(c, p, `the same two numbers: ${nf(FP.pa)} is blue, ${nf(FP.pb)} is red`, W0 / 2, H - 16, { size: fs - 1, weight: 500, color: pal.muted, halo: false });
        void B1;
      };

      /* work view and the practice problems that use the workbench */
      const wGeo = p => ({ x0: 34, x1: p.w - 40, y: p.h * .5, lo: W.P.win[0], hi: W.P.win[1] });
      const drawWork = (c, p) => {
        const pal = p.pal, W0 = p.w, H = p.h, fs = fsOf(p), P = W.P, B = wGeo(p), X = nline(c, p, B), I = W.cur;
        const ctxOnly = W.phase === 'model';
        T(c, p, ctxOnly ? `${P.v} = number of ${P.ctx ? P.ctx.unit : 'things'}` : istr(I, P), W0 / 2, H * .12, { size: ctxOnly ? fs + 3 : clamp(W0 / 11, 24, 38), weight: 500, serif: !ctxOnly });
        T(c, p, ctxOnly ? 'Choose the inequality in the panel' : (W.cur === P.I ? 'the original inequality' : 'the inequality now'), W0 / 2, H * .2, { size: fs, weight: 500, color: pal.muted, halo: false });
        const ans = !ctxOnly && isoForm(I);
        if (ans) {
          const s = { rel: ans.rel, c: qval(ans.c) };
          if (P.ctx && W.dots) {
            drawRay(c, p, B, X, s, pal.blue, .28);
            const w = P.ctx.whole, hi = w.hi == null ? B.hi : w.hi;
            for (let v = w.lo; v <= hi; v++) circ(c, p, X(v), B.y, 8, pal.blue, true, 2);
          } else drawRay(c, p, B, X, s, pal.blue, 1);
          const lab = `${P.v} ${SY[ans.rel]} ${qtxtDec(ans.c)}`;
          T(c, p, lab, W0 / 2, B.y + 58, { size: fs + 4, weight: 800 });
          if (!(P.ctx && W.dots)) T(c, p, strict(ans.rel) ? `open circle: ${qtxt(ans.c)} is not included` : `closed circle: ${qtxt(ans.c)} is included`, W0 / 2, B.y + 58 + fs * 1.8, { size: fs, weight: 600 });
          let ny = B.y + 58 + fs * (P.ctx && W.dots ? 1.8 : 3.4);
          if (P.ctx && W.dots) ny = para(c, p, `Dots: only whole numbers of ${P.ctx.unit} count. The faint ray is every real number in the answer.`, W0 / 2, ny, W0 - 40, { size: fs, weight: 600 });
          if (W.chk) para(c, p, 'Test marks: ✓ means true in the original inequality, ✗ means false.', W0 / 2, ny, W0 - 40, { size: fs, weight: 500, color: pal.muted, halo: false });
        } else if (!ctxOnly) {
          T(c, p, `${P.v} is not alone yet, so there is no graph yet.`, W0 / 2, B.y + 62, { size: fs, weight: 500, color: pal.muted, halo: false });
        }
        if (W.chk) W.chk.rows.forEach(r => {
          const x = clamp(X(r.x), B.x0 - 6, B.x1 + 6), col = r.tr ? pal.green : pal.red;
          line(c, x, B.y - 6, x, B.y - 66, col, 1.6, [3, 3]);
          c.beginPath(); c.arc(x, B.y - 66, 11, 0, Math.PI * 2); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = col; c.lineWidth = 3; c.stroke();
          T(c, p, r.tr ? '✓' : '✗', x, B.y - 66, { size: 14, weight: 800, color: col, halo: false });
          T(c, p, nf(r.x), x, B.y - 90, { size: fs, weight: 700, color: col });
        });
        legend(c, p, H - 14 - fs * 2.6, fs - .5);
      };

      const drawChoose = (c, p) => {
        const pal = p.pal, W0 = p.w, H = p.h, fs = fsOf(p), pr = AL.prob;
        para(c, p, pr.q, W0 / 2, H * .06, W0 - 40, { size: fs + 2, weight: 700 });
        pr.opts.forEach((o, i) => {
          const y = H * .27 + i * H * .165, B = { x0: 56, x1: W0 - 34, y, lo: pr.win[0], hi: pr.win[1] }, X = nline(c, p, B, 12.5);
          drawRay(c, p, B, X, { rel: o.dir === 'right' ? (o.incl ? 'ge' : 'gt') : (o.incl ? 'le' : 'lt'), c: o.at }, pal.blue, 1);
          T(c, p, 'ABCD'[i], 20, y, { size: fs + 6, weight: 800 });
          void X;
        });
        legend(c, p, H - 14 - fs * 2.6, fs - .5);
      };

      const drawTrap = (c, p) => {
        const pal = p.pal, W0 = p.w, H = p.h, fs = fsOf(p), B = { x0: 34, x1: W0 - 40, y: H * .52, lo: -8, hi: 8 }, X = nline(c, p, B);
        T(c, p, '−3x > 12', W0 / 2, H * .1, { size: clamp(W0 / 11, 26, 38), weight: 500, serif: true });
        T(c, p, `Student's graph: x > ${MI}4`, W0 / 2, H * .19, { size: fs + 1, weight: 700 });
        drawRay(c, p, B, X, { rel: 'gt', c: -4 }, pal.blue, 1);
        TRAP.tests.forEach(t => {
          if (!AL.tested[t.x]) return;
          const tr = -3 * t.x > 12, x = X(t.x), col = tr ? pal.green : pal.red;
          line(c, x, B.y - 6, x, B.y - 66, col, 1.6, [3, 3]);
          c.beginPath(); c.arc(x, B.y - 66, 11, 0, Math.PI * 2); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = col; c.lineWidth = 3; c.stroke();
          T(c, p, tr ? '✓' : '✗', x, B.y - 66, { size: 14, weight: 800, color: col, halo: false });
          T(c, p, nf(t.x), x, B.y - 90, { size: fs, weight: 700, color: col });
        });
        para(c, p, '✓ means the number really satisfies −3x > 12. ✗ means it does not.', W0 / 2, B.y + 62, W0 - 40, { size: fs, weight: 500, color: pal.muted, halo: false });
        legend(c, p, H - 14 - fs * 2.6, fs - .5);
      };

      P.onDraw = (c, p) => {
        const v = st.view;
        if (v === 'test') drawTest(c, p); else if (v === 'bal') drawBal(c, p); else if (v === 'flip') drawFlip(c, p);
        else if (v === 'work') drawWork(c, p); else if (v === 'choose') drawChoose(c, p); else if (v === 'trap') drawTrap(c, p);
      };

      const sync = () => {
        const prac = st.practice, v = st.view;
        vis(G.test, !prac && v === 'test'); vis(G.bal, !prac && v === 'bal'); vis(G.flip, !prac && v === 'flip');
        vis(G.wb, v === 'work'); vis(G.alt, prac && (v === 'choose' || v === 'trap')); vis(G.prac, prac);
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        if (v === 'test') { tS.set(st.tx); testAt(st.tx); tText(); }
        P.draw();
      };

      draggable(P, {
        hit: (px, py) => {
          if (st.practice || st.view !== 'test') return null;
          const B = tBox(P), hx = B.x0 + (st.tx - B.lo) / (B.hi - B.lo) * (B.x1 - B.x0);
          return Math.hypot(px - hx, py - B.y) < 26 ? 'p' : null;
        },
        move: (id, mx) => {
          cancel(); const B = tBox(P), v = B.lo + (pxOf(mx) - B.x0) / (B.x1 - B.x0) * (B.hi - B.lo);
          st.tx = clamp(snap(v, .5), 0, 10); testAt(st.tx); sync();
        }
      });

      const enterView = view => {
        cancel(); st.practice = false; W.onDone = null;
        st.view = view;
        if (view === 'test') { st.strict = true; st.tx = 2; st.tests = {}; st.rv = 0; st.pd = 0; testAt(2); tBtns[0].classList.add('primary'); tBtns[1].classList.remove('primary'); tGateRender(); }
        if (view === 'bal') { BL.pd = 0; BL.l = 6; BL.r = 4; BL.hist = []; BL.ops = 0; BL.kept = 0; st.tilt = .2; }
        if (view === 'flip') { FP.a = 3; FP.b = 5; FP.pa = 3; FP.pb = 5; FP.pd = 0; FP.mv = 0; FP.label = ''; st.ft = 1; fGate.replaceChildren(); setFb(fFb, '<p>Try a move. The first time you multiply by a negative number you will be asked to predict.</p>'); }
        if (view === 'work') { wbReset(WORK[st.sys]); wbRefresh(); }
        else sync();
        if (view === 'bal') { balGate(); balText(''); }
      };

      const apply = (patch, immediate) => {
        cancel();
        if (patch.sys != null) st.sys = patch.sys;
        st.lastView = patch.view || 'test';
        enterView(st.lastView);
      };

      enterView('test');
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
