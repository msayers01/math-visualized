/* =====================================================================
   SCHOOL — Graphing linear inequalities
   ===================================================================== */
{
  const GT = '>', GE = '≥', LT = '<', LE = '≤', MI = '−';
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;
  const lines = a => a.filter(Boolean).join('<br>');
  const e = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');   /* plain text to safe HTML */
  const strictSym = s => s === GT || s === LT;
  const sgnOf = s => (s === GT || s === GE ? 1 : -1);
  const mT = m => (Math.abs(m) === .5 ? (m < 0 ? MI : '') + '½' : num(m));
  const rhsTxt = (m, b) => {
    if (m === 0) return num(b);
    let s = (m === 1 ? '' : m === -1 ? MI : mT(m)) + 'x';
    if (b) s += (b < 0 ? ' − ' : ' + ') + num(Math.abs(b));
    return s;
  };
  const pt = (x, y) => `(${num(x)}, ${num(y)})`;

  /* ---------- inequalities: A x + B y (sym) C ---------- */
  const S = (sym, m, b, txt) => ({ A: m ? -m : 0, B: 1, C: b, sym, sf: true, m, b, txt: txt || `y ${sym} ${rhsTxt(m, b)}` });
  const V = (sym, c, txt) => ({ A: 1, B: 0, C: c, sym, vert: true, txt: txt || `x ${sym} ${num(c)}` });
  const Gn = (sym, A, B, C, txt) => ({ A, B, C, sym, txt });
  const val = (sc, x, y) => sc.A * x + sc.B * y - sc.C;
  const truth = (sc, x, y) => {
    const d = val(sc, x, y), q = 1e-9;
    return sc.sym === GT ? d > q : sc.sym === GE ? d > -q : sc.sym === LT ? d < -q : d < q;
  };
  const onLine = (sc, x, y) => Math.abs(val(sc, x, y)) < 1e-9;
  const sideOf = (sc, x, y) => {
    const d = val(sc, x, y);
    if (Math.abs(d) < 1e-9) return 'on';
    if (sc.vert) return d > 0 ? 'right' : 'left';
    return sc.B > 0 ? (d > 0 ? 'above' : 'below') : (d > 0 ? 'below' : 'above');
  };
  const dirOf = sc => { const s = sgnOf(sc.sym); return sc.vert ? (s * sc.A > 0 ? 'right' : 'left') : (s * sc.B > 0 ? 'above' : 'below'); };
  const SIDE = { above: 'above the line', below: 'below the line', left: 'to the left of the line', right: 'to the right of the line' };
  const OPP = { above: 'below', below: 'above', left: 'right', right: 'left' };
  const witness = (sc, dir) => {
    let best = null, bs = 99;
    for (let x = -6; x <= 6; x++) for (let y = -6; y <= 6; y++) if (sideOf(sc, x, y) === dir) { const s = Math.abs(x) + Math.abs(y); if (s < bs) { bs = s; best = [x, y]; } }
    return best;
  };
  /* "Right side: 2(1) − 1 = 1. Is 3 > 1?" as safe HTML, plus the verdict */
  const howText = (sc, x, y, withVerdict = true) => {
    let calc = '', L, R;
    if (sc.vert) { L = x; R = sc.C; }
    else if (sc.sf) {
      R = sc.m * x + sc.b; L = y;
      calc = sc.m === 0 ? '' : `Right side: ${mT(sc.m)}(${num(x)})${sc.b ? ` ${sc.b < 0 ? MI : '+'} ${num(Math.abs(sc.b))}` : ''} = ${num(R)}. `;
    } else {
      L = sc.A * x + sc.B * y; R = sc.C;
      calc = sc.A === 0 ? `${num(sc.B)}(${num(y)}) = ${num(L)}. ` : `${num(sc.A)}(${num(x)}) ${sc.B < 0 ? MI : '+'} ${num(Math.abs(sc.B))}(${num(y)}) = ${num(L)}. `;
    }
    const t = truth(sc, x, y);
    return `${e(calc)}Is ${num(L)} ${e(sc.sym)} ${num(R)}?` + (withVerdict ? ' ' + (t ? good('True') : bad('False')) : '');
  };
  const witnessText = (sc, dir) => {
    const w = witness(sc, dir);
    return `Test ${pt(...w)}, which is ${SIDE[dir]}. ${howText(sc, w[0], w[1])}`;
  };
  const latCount = (sc, cx) => { let n = 0; for (let x = 0; x <= cx.xm; x++) for (let y = 0; y <= cx.ym; y++) if (truth(sc, x, y)) n++; return n; };

  /* ---------- geometry helpers ---------- */
  const clip = (poly, A, B, C, s) => {
    const out = [], f = q => s * (A * q[0] + B * q[1] - C);
    for (let i = 0; i < poly.length; i++) {
      const P = poly[i], Q = poly[(i + 1) % poly.length], fp = f(P), fq = f(Q);
      if (fp >= 0) out.push(P);
      if ((fp > 0 && fq < 0) || (fp < 0 && fq > 0)) { const t = fp / (fp - fq); out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]); }
    }
    return out;
  };
  const rectOf = b => [[b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0, b.y1]];
  const regionPoly = (sc, b, flip, quad) => {
    let poly = clip(rectOf(b), sc.A, sc.B, sc.C, sgnOf(sc.sym) * (flip ? -1 : 1));
    if (quad && poly.length) { poly = clip(poly, 1, 0, 0, 1); if (poly.length) poly = clip(poly, 0, 1, 0, 1); }
    return poly;
  };
  const segOf = (sc, b) => (sc.B !== 0 ? [[b.x0, (sc.C - sc.A * b.x0) / sc.B], [b.x1, (sc.C - sc.A * b.x1) / sc.B]] : [[sc.C / sc.A, b.y0], [sc.C / sc.A, b.y1]]);

  /* ---------- the scenes used by the activities ---------- */
  const T0 = S(GT, 2, -1);                                   /* y > 2x - 1 */
  const SH = [S(LT, -1, 2), S(GE, 2, -4), S(LE, 2, -3), S(GT, 1, 0)];
  const CTX = Gn(LE, 3, 2, 24, '3x + 2y ≤ 24'), CX1 = { xm: 8, ym: 12, xn: 'muffins', yn: 'cookies' };
  const CTX2 = { xm: 5, ym: 10, xn: 'notebooks', yn: 'pens' };
  const symFor = (side, style) => (side === 'above' ? (style === 'dash' ? GT : GE) : (style === 'dash' ? LT : LE));
  const TG = [
    { t: 'Solid line through (0, 3) with slope −1, shaded below', m: -1, b: 3, side: 'below', style: 'solid' },
    { t: 'Dashed line through (0, −2) with slope ½, shaded below', m: .5, b: -2, side: 'below', style: 'dash' },
    { t: 'Dashed line through (0, 2) with slope 1, shaded above', m: 1, b: 2, side: 'above', style: 'dash' },
    { t: 'Solid line through (0, −1) with slope 2, shaded above', m: 2, b: -1, side: 'above', style: 'solid' }
  ];

  /* ---------- rewriting examples ---------- */
  const RW = [
    { name: '2x + 3y < 6', sc: Gn(LT, 2, 3, 6, '2x + 3y < 6'), flip: false,
      forms: ['2x + 3y < 6', '3y < −2x + 6', 'y < −(2/3)x + 2'],
      stages: [
        { q: 'Get the y term alone on the left. What do you do to both sides of 2x + 3y < 6?',
          ch: [['Subtract 2x from both sides', 'Left: 2x + 3y − 2x = 3y. Right: 6 − 2x. So 3y < −2x + 6.'],
               ['Subtract 3y from both sides', 'That removes the y term, but y is the one we want to keep. Subtract the x term instead.'],
               ['Add 6 to both sides', 'That makes the right side 12 and leaves 2x on the left. The 2x is still in the way.']], ans: 0 },
        { q: 'Now 3y < −2x + 6. Divide both sides by 3. What happens to the < sign?',
          ch: [['It stays <, because 3 is positive', 'Right side: (−2x + 6) ÷ 3 = −(2/3)x + 2. A positive divisor keeps the order: 3 < 6 becomes 1 < 2, still true.'],
               ['It flips to >', 'Only a NEGATIVE number flips the sign. Check: 3 < 6 divided by 3 is 1 < 2, still true, so the sign stays.'],
               ['Divide only the 3y by 3', 'Every term on both sides gets divided: (−2x + 6) ÷ 3 = −(2/3)x + 2.']], ans: 0 }
      ] },
    { name: '2x − 4y < 8 (flip)', sc: Gn(LT, 2, -4, 8, '2x − 4y < 8'), flip: true,
      forms: ['2x − 4y < 8', '−4y < −2x + 8', 'y > ½x − 2'],
      stages: [
        { q: 'Get the y term alone on the left. What do you do to both sides of 2x − 4y < 8?',
          ch: [['Add 4y to both sides', 'That moves the y term, but now y is on the right and still has the x term with it. Subtracting 2x is the cleaner move.'],
               ['Subtract 2x from both sides', 'Left: 2x − 4y − 2x = −4y. Right: 8 − 2x. So −4y < −2x + 8.'],
               ['Subtract 8 from both sides', 'That leaves 2x − 4y − 8 < 0. The 2x is still in the way.']], ans: 1 },
        { q: 'Now −4y < −2x + 8. Divide both sides by −4. What happens to the < sign?',
          ch: [['It stays <', 'Dividing by a negative number reverses the order. On a number line, −2 < 3 is true. Divide both by −1 and you get 2 and −3, and 2 < −3 is false. So the sign must flip.'],
               ['It flips to >', '(−2x + 8) ÷ (−4) = ½x − 2. The divisor is negative, so < becomes >: y > ½x − 2.'],
               ['Divide by 4 instead, and it stays <', 'The y term is −4y, so dividing by −4 makes the y alone. Dividing by 4 would leave −y.']], ans: 1 }
      ] },
    { name: '4 − 2y ≥ 0 (flip)', sc: Gn(GE, 0, -2, -4, '4 − 2y ≥ 0'), flip: true,
      forms: ['4 − 2y ≥ 0', '−2y ≥ −4', 'y ≤ 2'],
      stages: [
        { q: 'Get the y term alone on the left. What do you do to both sides of 4 − 2y ≥ 0?',
          ch: [['Add 4 to both sides', 'That gives 8 − 2y ≥ 4. The 4 is still next to the y term.'],
               ['Subtract 4 from the right side only', 'Both sides must change by the same amount, or the inequality is not the same one.'],
               ['Subtract 4 from both sides', 'Left: 4 − 2y − 4 = −2y. Right: 0 − 4 = −4. So −2y ≥ −4.']], ans: 2 },
        { q: 'Now −2y ≥ −4. Divide both sides by −2. What happens to the ≥ sign?',
          ch: [['It flips to ≤', '−4 ÷ (−2) = 2. A negative divisor reverses the order, so ≥ becomes ≤: y ≤ 2. This is a flat boundary at y = 2, and it is solid because ≤ includes equal.'],
               ['It stays ≥', 'A negative divisor reverses the order. Check with y = 0: 4 − 0 = 4 ≥ 0 is true, but y ≥ 2 would say 0 ≥ 2, which is false. So the sign has to flip.']], ans: 0 }
      ] },
    { name: '2x + 1 ≥ 7 (vertical)', sc: V(GE, 3, '2x + 1 ≥ 7'), flip: false,
      forms: ['2x + 1 ≥ 7', '2x ≥ 6', 'x ≥ 3'],
      stages: [
        { q: 'There is no y at all. Get x alone. What do you do to both sides of 2x + 1 ≥ 7 first?',
          ch: [['Subtract 1 from both sides', 'Left: 2x + 1 − 1 = 2x. Right: 7 − 1 = 6. So 2x ≥ 6.'],
               ['Divide both sides by 2 and keep the 1 where it is', '(2x + 1) ÷ 2 is x + ½, not x + 1. Remove the +1 first, then divide.'],
               ['Add 1 to both sides', 'That makes 2x + 2 ≥ 8. The +1 got bigger, not smaller.']], ans: 0 },
        { q: 'Now 2x ≥ 6. Divide both sides by 2. What happens to the ≥ sign?',
          ch: [['It flips to ≤', 'We divide by a positive number, so the order does not change. Check with numbers: 4 ≥ 2 is true, and 2 ≥ 1 is still true. A flip would give 2 ≤ 1, which is false.'],
               ['It stays ≥', 'x ≥ 3. A positive divisor keeps the order. The boundary is the vertical line x = 3, and it is solid.']], ans: 1 }
      ] }
  ];
  const finalStage = ex => {
    const sc = ex.sc, dir = dirOf(sc), vert = sc.vert, last = ex.forms[ex.forms.length - 1];
    const names = vert ? ['right', 'left'] : ['above', 'below'];
    return {
      q: `The final form is ${last}. Which side of the boundary will you shade?`,
      ch: names.map(n => [`Shade ${SIDE[n]}`, (n === dir
        ? `${witnessText(sc, n)} So the solutions are ${SIDE[n]}. The picture never changed while you rewrote: only the way of writing it did.` + (ex.flip ? ' Without the flip you would have shaded the other side. Turn on the switch to see that side in red.' : '')
        : `${witnessText(sc, n)} That side is NOT the solution side.`)]),
      ans: names.indexOf(dir), final: true
    };
  };
  /* in this lesson the final-stage feedback contains safe HTML already, others are plain text */

  /* ---------- practice problems (a fixed list) ---------- */
  const D = (sc, o) => Object.assign({ sc, line: true, shade: false, pts: [], pcol: false, txt: false }, o);
  const NONE = D(null, { line: false });
  const PR = [];
  {
    const sc = S(GE, -1, 2);
    PR.push({ name: 'Is the point a solution?', stages: [{
      q: 'Is the point (1, 1) a solution of y ≥ −x + 2?',
      ch: [['No. The point is on the line, not inside the shaded part.', 'With ≥ the line itself is part of the answer. Right side: −1(1) + 2 = 1, and 1 ≥ 1 is true.'],
           ['No. 1 is not greater than 1.', '≥ means greater than OR equal to. 1 = 1 counts, so the statement is true.'],
           ['Yes. 1 ≥ −1(1) + 2 = 1 is true, because ≥ allows equal.', 'Right side: −1(1) + 2 = 1. Is 1 ≥ 1? Yes, because ≥ allows equal. The point is on the solid line, and a solid line is included.'],
           ['Yes. Every point on a boundary line is a solution of every inequality that uses it.', 'Not always. With the strict y > −x + 2 the same point fails, because 1 > 1 is false. It works here only because the symbol is ≥.']],
      ans: 2, d0: D(sc, { pts: [[1, 1]], txt: true }), d1: D(sc, { pts: [[1, 1]], pcol: true, shade: true, txt: true }) }] });
  }
  {
    const sc = S(GT, 1, 2);
    PR.push({ name: 'Choose the graph', stages: [{
      q: 'Which graph shows y > x + 2? Press a choice to see it drawn.',
      ch: [['Solid line through (0, 2) with slope 1, shaded above', 'The symbol > is strict, so points on the line are not solutions. The line must be dashed.', D(S(GE, 1, 2), { shade: true })],
           ['Dashed line through (0, 2) with slope 1, shaded above', 'At x = 0 the right side is 0 + 2 = 2, so the line crosses at (0, 2) with slope 1. > is strict, so dashed. y is greater than the line, so shade above. Test (0, 5): 5 > 2 is true.', D(sc, { shade: true })],
           ['Dashed line through (0, 2) with slope 1, shaded below', 'Test (0, 0), which is below the line: 0 > 0 + 2 is false. So below is not the solution side. Shade above.', D(S(LT, 1, 2), { shade: true })],
           ['Dashed line through (0, −2) with slope 1, shaded above', 'The intercept is the right side at x = 0, which is 2, not −2. The line must cross the y-axis at (0, 2).', D(S(GT, 1, -2), { shade: true })]],
      ans: 1, d0: NONE, d1: D(sc, { shade: true, txt: true }) }] });
  }
  {
    const sc = S(LE, 2, -2);
    PR.push({ name: 'Choose the inequality', stages: [{
      q: 'The graph shows a solid line through (0, −2) and (1, 0), with the region below the line shaded. Which inequality is it?',
      ch: [['y ≥ 2x − 2', 'Below the line means y is LESS than the line height, so the symbol must point to ≤ or <. Test (0, −5), which is shaded: −5 ≥ 2(0) − 2 is false.'],
           ['y < 2x − 2', 'The line is solid, so points on it count. A strict < would need a dashed line. Use ≤.'],
           ['y ≤ 2x − 2', 'The line goes up 2 for each 1 to the right and crosses at −2, so the right side is 2x − 2. Below means less, and a solid line includes equal: ≤.'],
           ['y ≤ −2x − 2', 'The line rises from (0, −2) to (1, 0). That is a slope of +2, not −2.']],
      ans: 2, d0: D(sc, { shade: true }), d1: D(sc, { shade: true, txt: true }) }] });
  }
  {
    const sc1 = Gn(GT, 1, -2, 4, 'x − 2y > 4'), sc2 = S(LT, .5, -2);
    PR.push({ name: 'Rewrite, then graph', stages: [
      { q: 'Solve x − 2y > 4 for y. Which result is correct?',
        ch: [['y > ½x − 2', 'The first step gives −2y > −x + 4. Dividing by −2 reverses the sign. Test (0, −5): 0 − 2(−5) = 10 > 4 is true, but −5 > ½(0) − 2 is false. So this form is wrong.'],
             ['y < ½x − 2', '−2y > −x + 4. Divide both sides by −2 and flip the sign: y < ½x − 2. Check (0, −5): 0 + 10 = 10 > 4 is true, and −5 < −2 is true.'],
             ['y < −½x + 2', 'Both signs went wrong. (−x + 4) ÷ (−2) = ½x − 2, not −½x + 2.'],
             ['y < 2x − 4', 'Both terms must be DIVIDED by −2, not multiplied by 2.']],
        ans: 1, d0: NONE, d1: NONE },
      { q: 'Now graph y < ½x − 2. Which description is right?',
        ch: [['Dashed line through (0, −2) with slope ½, shaded below', 'The right side at x = 0 is −2, the slope is ½, < is strict (dashed) and y is less than the line (below). Test (0, −5): −5 < −2 is true.', D(sc2, { shade: true })],
             ['Dashed line through (0, −2) with slope ½, shaded above', 'y is LESS than the line, so the solutions are below it. Test (0, 0), which is above: 0 < −2 is false.', D(S(GT, .5, -2), { shade: true })],
             ['Solid line through (0, −2) with slope ½, shaded below', 'The sign is strict, <, so the line is dashed.', D(S(LE, .5, -2), { shade: true })],
             ['Dashed line through (0, 2) with slope −½, shaded below', 'The intercept is −2 and the slope is +½. The signs got turned around.', D(S(LT, -.5, 2), { shade: true })]],
        ans: 0, d0: NONE, d1: D(sc2, { shade: true, txt: true }) }
    ] });
  }
  PR.push({ name: 'Vertical and horizontal boundaries', stages: [
    { q: 'Which graph shows x < −2? Press a choice to see it drawn.',
      ch: [['Solid vertical line at x = −2, shaded to the left', 'The sign is strict, so the line is dashed.', D(V(LE, -2), { shade: true })],
           ['Dashed horizontal line at y = −2, shaded below', 'x < −2 talks about x only. The boundary is where x = −2, which is a vertical line, not a horizontal one.', D(S(LT, 0, -2), { shade: true })],
           ['Dashed vertical line at x = −2, shaded to the right', 'To the right of −2, x is bigger. Test (0, 0): 0 < −2 is false.', D(V(GT, -2), { shade: true })],
           ['Dashed vertical line at x = −2, shaded to the left', 'x = −2 is a vertical line, dashed because < is strict. Points with x smaller than −2 are on the left. Test (−4, 0): −4 < −2 is true.', D(V(LT, -2), { shade: true })]],
      ans: 3, d0: NONE, d1: D(V(LT, -2), { shade: true, txt: true }) },
    { q: 'Which graph shows y ≥ 1?',
      ch: [['Solid horizontal line at y = 1, shaded below', 'Below the line means y is less than 1. Test (0, 0): 0 ≥ 1 is false.', D(S(LE, 0, 1), { shade: true })],
           ['Solid horizontal line at y = 1, shaded above', 'y = 1 is a horizontal line. ≥ includes equal, so it is solid. y is greater, so shade above. Test (0, 3): 3 ≥ 1 is true.', D(S(GE, 0, 1), { shade: true })],
           ['Dashed horizontal line at y = 1, shaded above', '≥ includes equal, so points with y = 1 are solutions. The line must be solid.', D(S(GT, 0, 1), { shade: true })],
           ['Solid vertical line at x = 1, shaded to the right', 'y ≥ 1 talks about y only, so the boundary is a horizontal line.', D(V(GE, 1), { shade: true })]],
      ans: 1, d0: NONE, d1: D(S(GE, 0, 1), { shade: true, txt: true }) }
  ] });
  {
    const sc = Gn(LE, 4, 2, 20, '4x + 2y ≤ 20'), mk = (x, y) => D(sc, { ctx: CTX2, pts: [[x, y]], pcol: true });
    PR.push({ name: 'A budget', stages: [
      { q: 'A club has $20. Notebooks cost $4 each (x) and pens cost $2 each (y). So 4x + 2y ≤ 20. Which order can the club NOT afford?',
        ch: [['3 notebooks and 4 pens', '4(3) + 2(4) = 20 dollars. That is exactly the budget, which ≤ allows. The point sits on the line.', mk(3, 4)],
             ['2 notebooks and 5 pens', '4(2) + 2(5) = 18 dollars, which is under 20. It is inside the region.', mk(2, 5)],
             ['5 notebooks and 1 pen', '4(5) + 2(1) = 22 dollars, which is more than 20. The point is outside the shaded region, so the club cannot afford it.', mk(5, 1)],
             ['0 notebooks and 10 pens', '4(0) + 2(10) = 20 dollars. That is exactly the budget, so it is allowed. The point is where the line meets the y-axis.', mk(0, 10)]],
        ans: 2, d0: D(sc, { ctx: CTX2 }), d1: D(sc, { ctx: CTX2, shade: true, pts: [[5, 1]], pcol: true, txt: true }) },
      { q: 'The shaded region also contains the points (−1, 5) and (2.5, 3). Which statement is true?',
        ch: [['Every point in the shaded region is a real order.', 'No. (−1, 5) means −1 notebooks and (2.5, 3) means 2.5 notebooks. Neither can be bought.'],
             ['Only points with whole numbers x and y, both 0 or more, are real orders.', 'The inequality describes the whole half-plane, but the story limits it: you cannot buy a negative number of items or half a notebook. The green dots show the real orders.'],
             ['Only points exactly on the line are real orders.', 'Spending less than $20 is fine too. Points inside the region work as well as points on the line.'],
             ['No point in the shaded region is a real order.', 'Plenty are, such as 2 notebooks and 5 pens. Whole, non-negative points inside the region are real orders.']],
        ans: 1, d0: D(sc, { ctx: CTX2, shade: true, pts: [[-1, 5], [2.5, 3]], pcol: true }), d1: D(sc, { ctx: CTX2, shade: true, pts: [[-1, 5], [2.5, 3]], pcol: true, lat: true, txt: true }) }
    ] });
  }
  {
    const sc = S(GE, 2, 0, 'y ≥ 2x'), below = D(S(LE, 2, 0), { shade: true, pts: [[0, 0]] });
    PR.push({ name: 'The trap: a line through the origin', stages: [{
      q: 'Tia graphs y ≥ 2x. The line passes through (0, 0). She tests (0, 0): 0 ≥ 0 is true, so she shades "the side with the origin". What should she do?',
      ch: [['Nothing is wrong. Shade the side that contains the origin.', 'The origin is ON the line, so it is on neither side. It cannot tell her which side to shade.'],
           ['The origin is on the line, so it cannot show a side. Test (0, 1): 1 ≥ 0 is true, so shade above the line.', '(0, 1) is above the line and makes the inequality true, so the solutions are above. The line is solid because of ≥.'],
           ['Test (1, 0): 0 ≥ 2 is false, so shade below the line.', '(1, 0) is below the line, and the test says it is NOT a solution. So below is the side to leave empty. Shade above.', D(S(LE, 2, 0), { shade: true, pts: [[1, 0]], pcol: true })],
           ['Test (0, 1): 1 ≥ 0 is true, so shade below the line.', '(0, 1) is above the line. A true test means shade the side the point is on, which is above, not below.', below]],
      ans: 1, d0: D(sc, { pts: [[0, 0]], txt: true }), d1: D(sc, { shade: true, pts: [[0, 1]], pcol: true, txt: true }) }] });
  }

  register({
    id: 'graphing-linear-inequalities', level: 'school',
    title: 'Graphing linear inequalities',
    blurb: 'Test points to find the half of the plane that makes an inequality true, then choose a dashed or solid boundary and shade.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 3.6;
      const b = p.bounds(), sc = S(GT, 1, 0);
      p.grid(1);
      p.path(regionPoly(sc, b), { fill: alpha(pal.yellow, .25) });
      p.path([[b.x0, b.x0], [b.x1, b.x1]], { stroke: pal.blue, width: 3, dash: [10, 8] });
      [[-1, 2], [1, 3], [-2, 0.5]].forEach(([x, y]) => p.dot(x, y, 5.5, pal.green, pal.stage, 1.5));
      [[2, -.5], [1, -2], [-.5, -2]].forEach(([x, y]) => {
        p.dot(x, y, 5.5, pal.stage, pal.red, 2);
        const X = p.X(x), Y = p.Y(y), c2 = p.ctx; c2.strokeStyle = pal.red; c2.lineWidth = 1.6; c2.beginPath();
        c2.moveTo(X - 2.8, Y - 2.8); c2.lineTo(X + 2.8, Y + 2.8); c2.moveTo(X - 2.8, Y + 2.8); c2.lineTo(X + 2.8, Y - 2.8); c2.stroke();
      });
    },
    hook: String.raw`An equation like y = 2x − 1 gives a line. What does y > 2x − 1 give? Pick any point on the page: how can you tell, in one second, whether it is a solution?`,
    steps: [
      { title: 'Test a point',
        text: String.raw`<p>The inequality \(y&gt;2x-1\) has two variables, so each solution is a point \((x,y)\). There are infinitely many.</p><p>Predict first. Then click or drag on the graph, or use the sliders. A green dot makes it true. A red cross makes it false. Test many points, then show the boundary line.</p>`,
        set: { mode: 'test' } },
      { title: 'Dashed or solid',
        text: String.raw`<p>The boundary line is \(y=2x-1\). Do points on it count?</p><p>With \(&gt;\) or \(&lt;\): no, so the line is <b>dashed</b>. With \(\ge\) or \(\le\): yes, so the line is <b>solid</b>.</p><p>Predict, then press each symbol and read the test point on the line.</p>`,
        set: { mode: 'style' } },
      { title: 'Shade the solutions',
        text: String.raw`<p>Shade the side where the test is true. The origin \((0,0)\) is a quick test, unless the line passes through it.</p><p>Choose an example, predict, test the origin, then shade a side. A wrong side turns red and the feedback says why.</p>`,
        set: { mode: 'shade' } },
      { title: 'From the picture to the inequality',
        text: String.raw`<p>Now go backwards. Drag the yellow ring (intercept) and the white ring (slope), or use the sliders. Choose the side and the line style. The lesson writes the inequality.</p><p>Then try <b>Rewrite first</b> and <b>Budget story</b> in the Activity menu.</p>`,
        set: { mode: 'build', bm: 1, bb: 2, bside: 'above', bstyle: 'dash' } }
    ],
    formal: String.raw`
      <p>An <em>inequality in two variables</em>, such as \(y&gt;2x-1\), is true for some points \((x,y)\) and false for others. Its <em>solution set</em> is every point that makes it true. For a linear inequality, the solution set is a whole half of the plane.</p>
      <h3>Why the solutions fill a half-plane</h3>
      <p>Cut the plane with a vertical line at one value of \(x\), say \(x=3\). There \(y&gt;2x-1\) says \(y&gt;5\): every point above height 5 works and every point at or below height 5 fails. The same thing happens at every \(x\). The cut-off height \(2x-1\) is exactly the height of the line \(y=2x-1\). So the line is the <em>boundary</em>: above it the inequality is true, below it false, and the points on it make \(y=2x-1\) true.</p>
      <h3>Solid or dashed</h3>
      <p>Draw the boundary dashed for \(&gt;\) and \(&lt;\), because a point on the line gives equality, and a strict inequality needs the two sides to differ. For example \((1,1)\) is on the line, and \(1&gt;2(1)-1\) says \(1&gt;1\), which is false. Draw it solid for \(\ge\) and \(\le\), because \(1\ge 1\) is true.</p>
      <h3>Choosing the side: the test point</h3>
      <p>The line separates the plane into two sides, and the truth of the inequality cannot change without crossing the line. So one test point on a side decides that whole side. The origin is the easiest point to test. Try \(y&lt;-x+2\): at \((0,0)\) we get \(0&lt;2\), true, so shade the side with the origin. Try \(y\le 2x-3\): \(0\le -3\) is false, so shade the side without the origin.</p>
      <p><b>The trap.</b> If the line passes through the origin, as in \(y\ge 2x\), the origin is on the line and tells you nothing about a side. Use another point. \((0,1)\) gives \(1\ge 0\), true, so shade the side containing \((0,1)\), which is above.</p>
      <h3>From a graph back to an inequality</h3>
      <p>Read the line first: its y-intercept \(b\) and slope \(m\) give \(y=mx+b\). Then choose the symbol. Shaded above means \(y\) is bigger than the line, so use \(&gt;\) or \(\ge\). Shaded below means \(&lt;\) or \(\le\). A solid line adds the equals part. So a dashed line through \((0,2)\) with slope \(1\), shaded above, is \(y&gt;x+2\).</p>
      <h3>Rewriting, and when the sign flips</h3>
      <p>To graph \(2x+3y&lt;6\), solve for \(y\). Subtract \(2x\): \(3y&lt;-2x+6\). Divide by \(3\), which is positive, so the sign stays: \(y&lt;-\tfrac23x+2\).</p>
      <p>Dividing or multiplying by a <em>negative</em> number reverses the order. On a number line, \(-2&lt;3\) is true. Multiply both by \(-1\): the numbers become \(2\) and \(-3\), and \(2&lt;-3\) is false, so the sign must flip to \(2&gt;-3\). The same happens with \(2x-4y&lt;8\): subtract \(2x\) to get \(-4y&lt;-2x+8\), then divide by \(-4\) and flip: \(y&gt;\tfrac12x-2\). Check \((0,0)\) in both forms: \(0&lt;8\) is true and \(0&gt;-2\) is true.</p>
      <p>Some boundaries are not slanted. \(x\ge 3\) has a vertical boundary \(x=3\) (solid) and the solutions are the points to its right. \(y&lt;-1\) has a horizontal boundary \(y=-1\) (dashed) and the solutions are the points below it.</p>
      <h3>In a story</h3>
      <p>At a bake sale, muffins cost \(\$3\) and cookies cost \(\$2\). You have \(\$24\). With \(x\) muffins and \(y\) cookies, the cost \(3x+2y\) must be at most \(24\): \(3x+2y\le 24\). The line is solid because spending exactly \(\$24\) is allowed. The point \((6,5)\) costs \(18+10=28\), so it is outside. But the story also needs \(x\ge 0\), \(y\ge 0\) and whole numbers, so only the lattice points inside the first-quadrant part of the half-plane are real orders. The graph shows more than the story allows, and the story decides which points count.</p>
      <h3>What comes next</h3>
      <p>One inequality shades one half-plane. Two inequalities shade two, and the points in <em>both</em> form the solution of a system of inequalities, which is the next lesson.</p>`,
    check: [
      { q: 'Look at y &lt; 3x − 2. Which statement is true?',
        choices: ['The line is solid, and the points on the line are solutions.', 'The line is dashed, and the solutions are above the line.', 'The line is dashed, and the points on the line are not solutions.', 'The line is solid, and the solutions are below the line.'], answer: 2,
        why: String.raw`The symbol \(&lt;\) is strict, so points on the line \(y=3x-2\) make the two sides equal and do not count: the line is dashed. Also \(y\) is less than the line height, so the solutions are below the line, not above. A solid line goes with \(\le\) or \(\ge\).`,
        hint: 'Look at the symbol. Does it include "equal to"? Then think: is y bigger or smaller than 3x − 2?' },
      { q: 'The inequality is 2x − 3y ≥ 12. Solve it for y, then use your answer to test the point (6, −2). Which choice is correct?',
        choices: ['y ≥ (2/3)x − 4, and (6, −2) is not a solution', 'y ≤ (2/3)x − 4, and (6, −2) is a solution', 'y ≤ (2/3)x − 4, and (6, −2) is not a solution', 'y ≤ −(2/3)x + 4, and (6, −2) is a solution'], answer: 1,
        why: String.raw`Subtract \(2x\): \(-3y\ge -2x+12\). Divide by \(-3\) and flip the sign: \(y\le \tfrac23x-4\). At \((6,-2)\) the right side is \(\tfrac23(6)-4=0\), and \(-2\le 0\) is true. Check in the original: \(2(6)-3(-2)=18\ge 12\), true. The first choice forgot to flip. The last choice divided the right side by \(3\) instead of \(-3\), so both signs came out wrong.`,
        hint: 'Divide both sides by −3. Does the sign stay or flip? Then put x = 6 into the right side.' },
      { q: 'Sam graphs 3x + 2y &gt; 12.<br>Step 1. Subtract 3x: 2y &gt; −3x + 12.<br>Step 2. Divide by 2: y &gt; −(3/2)x + 6.<br>Step 3. Draw a solid line through (0, 6) and (4, 0), and shade above it.<br>Which step is wrong?',
        choices: ['Step 1: you cannot subtract 3x from both sides.', 'Step 2: dividing by 2 must flip the sign.', 'Nothing is wrong.', 'Step 3: the sign is &gt;, so the line must be dashed.'], answer: 3,
        why: String.raw`Step 1 is fine: subtracting the same thing from both sides keeps the inequality. Step 2 is fine: \(2\) is positive, so the sign stays. In Step 3 the line through \((0,6)\) and \((4,0)\) is right (slope \(-\tfrac32\)) and above is right, but \(&gt;\) is strict, so points on the line are not solutions and the line must be dashed.`,
        hint: 'Check each step. Only dividing by a negative number flips the sign. Then ask what the symbol > says about points on the line.' }
    ],
    links: { prereq: ['solving-linear-inequalities', 'slope-and-linear-functions'], next: ['systems-of-linear-inequalities'], related: ['forms-of-a-linear-equation', 'systems-of-equations', 'modeling-with-systems', 'what-is-a-function'] },

    mount({ stage, controls: C }) {
      const st = {
        mode: 'test', practice: false,
        tx: 0, ty: 0, hasPt: false, showLine: false, showShade: false,
        sym: GT, shi: 0, shaded: false, sw: false, shMsg: '',
        bm: 1, bb: 2, bside: 'above', bstyle: 'dash', tg: 0, bMsg: '',
        rwi: 0, rws: 0, rwFlip: false, rwMsg: '', lat: false
      };
      let cancel = () => {};
      const panel = stage.nextElementSibling;
      const P = new Plane(stage, { cx: 0, cy: 0, span: 6.6 });
      const tested = new Set(), pdone = {};
      let prIdx = 0, prSi = 0, prSolved = false, prTried = false, prFirst = 0, prDone = 0, prOver = false, prv = null;

      /* ----- what is drawn in each state ----- */
      const buildSc = () => S(symFor(st.bside, st.bstyle), st.bm, st.bb);
      const view = () => {
        if (st.practice) {
          const stg = PR[prIdx].stages[prSi];
          return prv || (prSolved ? stg.d1 : stg.d0);
        }
        const cur = st.hasPt ? [[st.tx, st.ty]] : [];
        switch (st.mode) {
          case 'test': return { sc: T0, line: st.showLine, shade: st.showShade, txt: true, pcol: true, pts: [...tested].map(k => k.split(',').map(Number)), cur: st.hasPt ? [st.tx, st.ty] : null };
          case 'style': return { sc: S(st.sym, 2, -1), line: true, shade: true, txt: true, pcol: true, pts: cur, cur: st.hasPt ? [st.tx, st.ty] : null };
          case 'shade': return { sc: SH[st.shi], line: true, shade: st.shaded, wrong: st.sw, txt: true, pcol: true, pts: cur, cur: st.hasPt ? [st.tx, st.ty] : null };
          case 'build': return { sc: buildSc(), line: true, shade: true, txt: true, pts: [], handles: true };
          case 'rw': {
            const ex = RW[st.rwi], n = ex.stages.length;
            return { sc: ex.sc, line: true, shade: st.rws > n, wrong: st.rwFlip && st.rws > n, txt: ex.forms[Math.min(st.rws, n)], pts: [] };
          }
          default: return { sc: CTX, line: true, shade: !!(pdone.c), txt: true, pcol: true, pts: cur, cur: st.hasPt ? [st.tx, st.ty] : null, ctx: CX1, lat: st.lat };
        }
      };

      P.onDraw = (c, p) => {
        const d = view(), sc = d.sc, pal = p.pal;
        if (d.ctx) p.fit(d.ctx.xm + .5, d.ctx.ym + .8, { l: 2.1, r: .3, t: .3, b: 1.4 }); else { p.cx = 0; p.cy = 0; p.span = 6.6; }
        const b = p.bounds(), fsz = clamp(p.scale * .62, 15, 20);
        p.grid(1); p.ticks(1);
        if (d.ctx) {
          p.label('x = ' + d.ctx.xn, d.ctx.xm + .4, 0, { size: fsz, italic: false, color: pal.muted, dy: 32, align: 'right' });
          p.label('y = ' + d.ctx.yn, 0, d.ctx.ym + .7, { size: fsz, italic: false, color: pal.muted, dx: 8, align: 'left' });
        } else {
          p.label('x', b.x1 - .45, 0, { size: 21, color: pal.muted, dy: -16 });
          p.label('y', 0, b.y1 - .5, { size: 21, color: pal.muted, dx: 14 });
        }
        if (sc) {
          const quad = !!d.ctx;
          if (d.wrong) { const w = regionPoly(sc, b, true, quad); if (w.length > 2) p.path(w, { fill: alpha(pal.red, .2) }); }
          if (d.shade) {
            if (quad) { const full = regionPoly(sc, b, false, false); if (full.length > 2) p.path(full, { fill: alpha(pal.yellow, .09) }); }
            const r = regionPoly(sc, b, false, quad); if (r.length > 2) p.path(r, { fill: alpha(pal.yellow, .3) });
          }
          if (d.line) p.path(segOf(sc, b), { stroke: pal.blue, width: 3.6, dash: strictSym(sc.sym) ? [13, 10] : undefined });
          if (d.wrong) {
            const w = regionPoly(sc, b, true, false);
            if (w.length > 2) { const cxm = w.reduce((s, q) => s + q[0], 0) / w.length, cym = w.reduce((s, q) => s + q[1], 0) / w.length; p.label('not solutions', clamp(cxm, b.x0 + 2.2, b.x1 - 2.2), clamp(cym, b.y0 + 1, b.y1 - 1), { size: 17, italic: false, color: pal.red }); }
          }
        }
        /* every whole-number order that works */
        if (d.lat && d.ctx && sc) for (let x = 0; x <= d.ctx.xm; x++) for (let y = 0; y <= d.ctx.ym; y++) if (truth(sc, x, y)) p.dot(x, y, clamp(p.scale * .13, 3, 5), alpha(pal.green, .85), pal.stage, 1);
        /* test points */
        const r = clamp(p.scale * .2, 4.5, 8);
        const drawPt = (x, y, kind, cur) => {
          if (cur) p.dot(x, y, r + 6, null, pal.brass, 3);
          if (kind === 'T') p.dot(x, y, r, pal.green, pal.stage, 1.5);
          else if (kind === 'F') {
            p.dot(x, y, r, pal.stage, pal.red, 2.4);
            const X = p.X(x), Y = p.Y(y), k = r * .62; c.strokeStyle = pal.red; c.lineWidth = 2; c.beginPath();
            c.moveTo(X - k, Y - k); c.lineTo(X + k, Y + k); c.moveTo(X - k, Y + k); c.lineTo(X + k, Y - k); c.stroke();
          } else p.dot(x, y, r, pal.yellow, pal.stage, 1.5);
        };
        const kindOf = (x, y) => (sc && d.pcol ? (truth(sc, x, y) && (!d.ctx || (x >= 0 && y >= 0 && Number.isInteger(x) && Number.isInteger(y))) ? 'T' : 'F') : 'N');
        (d.pts || []).forEach(([x, y]) => drawPt(x, y, kindOf(x, y), d.cur && d.cur[0] === x && d.cur[1] === y));
        if (d.cur && !(d.pts || []).some(q => q[0] === d.cur[0] && q[1] === d.cur[1])) drawPt(d.cur[0], d.cur[1], kindOf(d.cur[0], d.cur[1]), true);
        const lab = d.cur || (d.pts && d.pts.length === 1 && st.practice ? d.pts[0] : null);
        if (lab) p.label(pt(lab[0], lab[1]), lab[0], lab[1], { size: clamp(p.scale * .64, 15, 20), italic: false, dy: -r - 16 });
        if (st.practice && d.pts && d.pts.length > 1) d.pts.forEach(q => p.label(pt(q[0], q[1]), q[0], q[1], { size: clamp(p.scale * .6, 14, 18), italic: false, dy: -r - 14 }));
        /* handles for building from a picture */
        if (d.handles) {
          p.dot(0, st.bb, 8.5, pal.yellow, pal.brass, 3);
          p.dot(2, st.bb + 2 * st.bm, 8.5, pal.stage, pal.brass, 3);
          p.label('b = ' + num(st.bb), 0, st.bb, { size: 17, italic: false, align: 'left', dx: 14, dy: -17 });
          p.label('slope ' + (Math.abs(st.bm) === .5 ? (st.bm < 0 ? MI : '') + '1/2' : num(st.bm)), 2, st.bb + 2 * st.bm, { size: 17, italic: false, align: 'left', dx: 14, dy: -17 });
        }
        /* legend */
        const fs = clamp(p.scale * .52, 13, 18), rows = [];
        if (d.txt && sc) rows.push({ k: 't', s: typeof d.txt === 'string' ? d.txt : sc.txt });
        if (d.line && sc) rows.push({ k: 'l', s: strictSym(sc.sym) ? 'dashed: line not included' : 'solid: line included' });
        if (d.shade && sc) rows.push({ k: 's', s: 'shaded: solutions' });
        if (d.pcol && (d.pts && d.pts.length || d.cur)) rows.push({ k: 'd', s: d.ctx ? 'dot: real order, cross: not allowed' : 'dot: true, cross: false' });
        if (rows.length) {
          c.textAlign = 'left'; c.textBaseline = 'middle';
          const wOf = r2 => { c.font = `${r2.k === 't' ? 700 : 500} ${fs * (r2.k === 't' ? 1.08 : 1)}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`; return c.measureText(r2.s).width + (r2.k === 't' ? 0 : 34); };
          const wd = Math.max(...rows.map(wOf)), lh = fs * 1.5, pad = 8, bx = d.ctx ? p.w - wd - pad * 2 - 8 : 8;
          c.fillStyle = alpha(pal.stage, .9); c.fillRect(bx, 8, wd + pad * 2, rows.length * lh + pad); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1; c.strokeRect(bx + .5, 8.5, wd + pad * 2, rows.length * lh + pad);
          rows.forEach((r2, i) => {
            const cy = 8 + pad / 2 + lh * (i + .5), x0 = bx + pad;
            wOf(r2); c.fillStyle = r2.k === 't' ? pal.text : pal.muted;
            if (r2.k === 't') { c.fillText(r2.s, x0, cy); return; }
            c.fillText(r2.s, x0 + 34, cy);
            if (r2.k === 'l') { c.strokeStyle = pal.blue; c.lineWidth = 3; c.setLineDash(strictSym(sc.sym) ? [6, 5] : []); c.beginPath(); c.moveTo(x0, cy); c.lineTo(x0 + 26, cy); c.stroke(); c.setLineDash([]); }
            else if (r2.k === 's') { c.fillStyle = alpha(pal.yellow, .45); c.fillRect(x0, cy - 6, 26, 12); }
            else { c.fillStyle = pal.green; c.beginPath(); c.arc(x0 + 6, cy, 4.5, 0, TAU); c.fill(); c.strokeStyle = pal.red; c.lineWidth = 2; c.beginPath(); c.moveTo(x0 + 17, cy - 4); c.lineTo(x0 + 25, cy + 4); c.moveTo(x0 + 17, cy + 4); c.lineTo(x0 + 25, cy - 4); c.stroke(); }
          });
        }
      };

      /* ----- panel helpers ----- */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(el => { el.style.display = on ? '' : 'none'; });
      const SL = o => { const s = C.slider(o); s.inp = panel.lastElementChild.querySelector('input'); return s; };
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const addTo = (...els) => panel.append(...els);

      /* ----- predictions ----- */
      const predFor = () => {
        if (st.mode === 'test') return { key: 't', q: 'Predict first. Will the point (0, 0) make y > 2x − 1 true? Put x = 0 and y = 0 in the inequality in your head.',
          opts: [['Yes, it will be true', good('Right.') + ' 0 > 2(0) − 1 means 0 > −1, which is true. So (0, 0) will be a green dot.'],
                 ['No, it will be false', bad('Not quite.') + ' The right side is 2(0) − 1 = −1. Is 0 greater than −1? Yes: 0 is to the right of −1 on a number line. So it is true.']], ans: 0 };
        if (st.mode === 'style') return { key: 's', q: 'Predict first. The point (1, 1) sits exactly on the line y = 2x − 1, because 2(1) − 1 = 1. Is (1, 1) a solution of y > 2x − 1?',
          opts: [['Yes, it is on the line, so it works', bad('Not quite.') + ' On the line, y equals 2x − 1, and > needs y to be strictly greater. 1 > 1 is false.'],
                 ['No, 1 is not greater than 1', good('Right.') + ' A strict symbol does not allow equal, so points on the line are not solutions. That is why the line will be dashed.'],
                 ['Yes, because 1 ≥ 1', bad('Not quite.') + ' 1 ≥ 1 is true, but this inequality uses >, not ≥. Use the symbol buttons to compare.']], ans: 1 };
        if (st.mode === 'shade') {
          const sc = SH[st.shi], on = onLine(sc, 0, 0), t = truth(sc, 0, 0), ans = on ? 2 : t ? 0 : 1;
          const fb = i => {
            const how = howText(sc, 0, 0, false);
            if (on) return (i === ans ? good('Right.') : bad('Not quite.')) + ` At (0, 0) both sides are 0, so the origin is exactly ON the line. It is on neither side, so it cannot tell you which side to shade. Test another point such as (1, 0) or (0, 1).`;
            return (i === ans ? good('Right.') : bad('Not quite.')) + ` ${how} That is ${t ? 'true' : 'false'}, so (0, 0) ${t ? 'is' : 'is not'} a solution.`;
          };
          return { key: 'h' + st.shi, q: `Predict first. Look at ${sc.txt}. Will the origin (0, 0) be a solution?`,
            opts: [['Yes', fb(0)], ['No', fb(1)], ['Neither: the origin is on the boundary line', fb(2)]], ans };
        }
        if (st.mode === 'ctx') return { key: 'c', q: 'Muffins cost $3 each (x). Cookies cost $2 each (y). You have $24, so 3x + 2y ≤ 24. Predict first: can you afford 6 muffins and 5 cookies?',
          opts: [['Yes, it is in the shaded region', bad('Not quite.') + ' 3(6) + 2(5) = 18 + 10 = 28 dollars, which is more than 24.'],
                 ['No, it costs too much', good('Right.') + ' 3(6) + 2(5) = 28 dollars, which is more than 24. The point will be outside the shaded region.']], ans: 1 };
        return null;
      };
      const locked = () => { const pf = !st.practice && predFor(); return !!pf && !pdone[pf.key]; };

      let selAct, predTitle, predQ, predRow, predFb, tX, tY, cX, cY, ro;
      let testBtns, styleBtns, selSh, shBtns, mS, bS, sideBtns, lineBtns, tgText, tgBtns, bFb, selRw, rwChain, rwQ, rwOpts, rwFb, tgLine, tgShade, tgFlip, tgLat;
      let startBtn, ptally, pq, pch, pfb, pnext;

      const renderPred = () => {
        const pf = st.practice ? null : predFor();
        vis(G.pred, !st.practice && !!pf);
        if (!pf) return;
        predQ.textContent = pf.q; predRow.replaceChildren(); predFb.innerHTML = '';
        const dn = pdone[pf.key];
        pf.opts.forEach((o, i) => {
          const bt = mkBtn(o[0], () => { if (pdone[pf.key]) return; pdone[pf.key] = { i, fb: o[1] }; renderPred(); sync(); });
          if (dn) { bt.disabled = true; if (dn.i === i) bt.classList.add('primary'); }
          predRow.append(bt);
        });
        if (dn) predFb.innerHTML = dn.fb;
      };

      /* ----- groups ----- */
      grp('sel', () => {
        C.title('Activity');
        selAct = C.select({ label: 'Choose an activity', value: 'test', onChange: v => { cancel(); loadMode(v); sync(); },
          options: [['test', 'Test points'], ['style', 'Dashed or solid'], ['shade', 'Shade a side'], ['build', 'Build from a picture'], ['rw', 'Rewrite first'], ['ctx', 'Budget story']].map(([value, label]) => ({ value, label })) });
      });
      grp('pred', () => {
        predTitle = h('p', { class: 'ctl-title' }, 'Predict first');
        predQ = h('p', { class: 'hint' }); predRow = h('div', { class: 'ctl buttons' }); predFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        addTo(predTitle, predQ, predRow, predFb);
      });
      grp('shade', () => {
        C.title('Example');
        selSh = C.select({ label: 'Choose an inequality', value: '0', options: SH.map((s, i) => ({ value: String(i), label: s.txt })), onChange: v => { cancel(); st.shi = +v; st.shaded = false; st.sw = false; st.hasPt = false; st.shMsg = ''; renderPred(); sync(); } });
      });
      grp('tp', () => {
        C.title('Test point');
        tX = SL({ label: 'x', min: -6, max: 6, step: 1, value: 0, format: v => num(v), onInput: v => { cancel(); setPt(v, st.ty); } });
        tY = SL({ label: 'y', min: -6, max: 6, step: 1, value: 0, format: v => num(v), onInput: v => { cancel(); setPt(st.tx, v); } });
      });
      grp('ctp', () => {
        C.title('Your order');
        cX = SL({ label: 'Muffins (x)', min: 0, max: 8, step: 1, value: 0, format: v => num(v), onInput: v => { cancel(); setPt(v, st.ty); } });
        cY = SL({ label: 'Cookies (y)', min: 0, max: 12, step: 1, value: 0, format: v => num(v), onInput: v => { cancel(); setPt(st.tx, v); } });
      });
      grp('test', () => {
        testBtns = C.buttons([
          { label: 'Test every whole point', onClick: () => { for (let x = -6; x <= 6; x++) for (let y = -6; y <= 6; y++) tested.add(`${x},${y}`); sync(); } },
          { label: 'Clear the dots', onClick: () => { tested.clear(); st.hasPt = false; sync(); } }]);
        tgLine = C.toggle({ label: 'Show the boundary line y = 2x − 1', value: false, onChange: v => { st.showLine = v; sync(); } });
        tgShade = C.toggle({ label: 'Shade the true region', value: false, onChange: v => { st.showShade = v; sync(); } });
      });
      grp('style', () => {
        C.title('Choose the symbol');
        styleBtns = C.buttons([GT, GE, LT, LE].map(sy => ({ label: 'y ' + sy + ' 2x − 1', onClick: () => { cancel(); st.sym = sy; sync(); } })));
        C.hint('The test point starts on the line. Click or drag to move it, or use the sliders.');
      });
      grp('shbtn', () => {
        shBtns = C.buttons([
          { label: 'Test the origin (0, 0)', onClick: () => setPt(0, 0) },
          { label: 'Shade above the line', onClick: () => shadeSide('above') },
          { label: 'Shade below the line', onClick: () => shadeSide('below') }]);
      });
      grp('build', () => {
        C.title('The line');
        mS = SL({ label: 'Slope', min: -3, max: 3, step: .5, value: st.bm, format: v => mT(v), onInput: v => { cancel(); setBM(v); } });
        bS = SL({ label: 'Intercept b', min: -5, max: 5, step: 1, value: st.bb, format: v => num(v), onInput: v => { cancel(); setBB(v); } });
        C.title('Side and line');
        sideBtns = C.buttons([{ label: 'Shade above', onClick: () => { st.bside = 'above'; st.bMsg = ''; sync(); } }, { label: 'Shade below', onClick: () => { st.bside = 'below'; st.bMsg = ''; sync(); } }]);
        lineBtns = C.buttons([{ label: 'Dashed line', onClick: () => { st.bstyle = 'dash'; st.bMsg = ''; sync(); } }, { label: 'Solid line', onClick: () => { st.bstyle = 'solid'; st.bMsg = ''; sync(); } }]);
        C.title('Match a picture');
        tgText = h('p', { class: 'hint' }); addTo(tgText);
        tgBtns = C.buttons([{ label: 'Check my picture', primary: true, onClick: () => chkBuild() }, { label: 'Next target', onClick: () => { st.tg = (st.tg + 1) % TG.length; st.bMsg = ''; sync(); } }]);
        bFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); addTo(bFb);
      });
      grp('rw', () => {
        C.title('Rewrite');
        selRw = C.select({ label: 'Choose an inequality', value: '0', options: RW.map((x, i) => ({ value: String(i), label: x.name })), onChange: v => { cancel(); st.rwi = +v; st.rws = 0; st.rwMsg = ''; st.rwFlip = false; rwRender(); sync(); } });
        rwChain = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); rwQ = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' }); rwOpts = h('div', { class: 'ctl buttons' }); rwFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        addTo(rwChain, rwQ, rwOpts, rwFb);
        tgFlip = C.toggle({ label: 'Show the side you get if you forget the flip', value: false, onChange: v => { st.rwFlip = v; sync(); } });
      });
      grp('ctx', () => {
        tgLat = C.toggle({ label: 'Show every order you can afford', value: false, onChange: v => { st.lat = v; sync(); } });
        C.hint('Click a point on the graph, or use the sliders, to try an order.');
      });
      grp('ro', () => { ro = C.readout(); });

      /* ----- actions ----- */
      const rng = () => (st.mode === 'ctx' ? { x0: -1, x1: CX1.xm + 1, y0: -1, y1: CX1.ym + 1 } : { x0: -6, x1: 6, y0: -6, y1: 6 });
      const setPt = (x, y) => {
        const r = rng(); st.tx = clamp(snap(x, 1), r.x0, r.x1); st.ty = clamp(snap(y, 1), r.y0, r.y1); st.hasPt = true;
        if (st.mode === 'test') tested.add(`${st.tx},${st.ty}`);
        sync();
      };
      const setBB = v => { st.bb = clamp(snap(v, 1), -5, 5); st.bm = clamp(st.bm, (-6 - st.bb) / 2, (6 - st.bb) / 2); st.bm = clamp(st.bm, -3, 3); st.bMsg = ''; sync(); };
      const setBM = v => { st.bm = clamp(snap(v, .5), Math.max(-3, (-6 - st.bb) / 2), Math.min(3, (6 - st.bb) / 2)); st.bMsg = ''; sync(); };
      const loadMode = m => {
        st.mode = m;
        if (m === 'test') { tested.clear(); st.hasPt = false; st.showLine = false; st.showShade = false; }
        else if (m === 'style') { st.tx = 1; st.ty = 1; st.hasPt = true; st.sym = GT; }
        else if (m === 'shade') { st.shaded = false; st.sw = false; st.hasPt = false; st.shMsg = ''; }
        else if (m === 'build') { st.bm = 0; st.bb = 0; st.bside = 'above'; st.bstyle = 'dash'; st.tg = 0; st.bMsg = ''; }
        else if (m === 'rw') { st.rws = 0; st.rwMsg = ''; st.rwFlip = false; rwRender(); }
        else { st.hasPt = false; st.lat = false; }
        renderPred();
      };
      const shadeSide = side => {
        if (st.shaded || locked()) return;
        const sc = SH[st.shi], dir = dirOf(sc);
        if (side === dir) {
          st.shaded = true; st.sw = false;
          st.shMsg = good('Right.') + ` ${witnessText(sc, side)} So the solutions are ${SIDE[side]}.` + (onLine(sc, 0, 0) ? ' The origin could not help here because it is on the line. Always test a point that is not on the line.' : (truth(sc, 0, 0) ? ' The origin was true, so its side is shaded.' : ' The origin was false, so the side WITHOUT the origin is shaded.'));
        } else {
          st.sw = true;
          st.shMsg = bad('Not that side.') + ` ${witnessText(sc, side)} A false test means that side is not the solution side. The red region shows what you chose. Try the other side.`;
        }
        sync();
      };
      const chkBuild = () => {
        const t = TG[st.tg], parts = [], tsc = S(symFor(t.side, t.style), t.m, t.b);
        if (st.bb !== t.b) parts.push(`The line should cross the y-axis at ${num(t.b)}, but yours crosses at ${num(st.bb)}. The yellow ring sets this.`);
        if (st.bm !== t.m) parts.push(`The slope should be ${mT(t.m)} (it goes ${t.m < 0 ? 'down' : 'up'} ${mT(Math.abs(t.m))} for each 1 to the right), but yours is ${mT(st.bm)}.`);
        if (st.bside !== t.side) parts.push(`The target is shaded ${t.side}. ${t.side === 'above' ? 'Above means y is bigger than the line, so the symbol is > or ≥.' : 'Below means y is smaller than the line, so the symbol is < or ≤.'}`);
        if (st.bstyle !== t.style) parts.push(`The target line is ${t.style === 'dash' ? 'dashed, so points on it are not solutions and the symbol is strict' : 'solid, so points on it are solutions and the symbol includes equal'}.`);
        st.bMsg = parts.length ? bad('Not yet.') + ' ' + parts.map(e).join(' ')
          : good('Match.') + ` The inequality is ${e(tsc.txt)}. ${t.side === 'above' ? 'Above gives > or ≥.' : 'Below gives < or ≤.'} ${t.style === 'dash' ? 'A dashed line gives the strict symbol.' : 'A solid line adds the equals part.'}`;
        sync();
      };

      /* ----- rewriting ----- */
      const rwStages = () => RW[st.rwi].stages.concat([finalStage(RW[st.rwi])]);
      const rwRender = () => {
        const sts = rwStages(); rwOpts.replaceChildren();
        if (st.rws >= sts.length) { rwQ.textContent = 'All done. The picture shows the solutions.'; rwFb.innerHTML = st.rwMsg; return; }
        const sg = sts[st.rws]; rwQ.textContent = sg.q; rwFb.innerHTML = st.rwMsg;
        sg.ch.forEach((o, i) => rwOpts.append(mkBtn(o[0], () => rwPick(i))));
      };
      const rwPick = i => {
        const sg = rwStages()[st.rws], o = sg.ch[i], right = i === sg.ans, txt = sg.final ? o[1] : e(o[1]);
        if (right) { st.rws++; st.rwMsg = good('Right.') + ' ' + (sg.final ? txt.replace(/^/, '') : txt); rwRender(); }
        else { rwOpts.children[i].disabled = true; st.rwMsg = bad('Not quite.') + ' ' + txt + ' Try another answer.'; rwFb.innerHTML = st.rwMsg; }
        sync();
      };

      /* ----- readouts ----- */
      const roHtml = () => {
        const L = [], lk = locked();
        if (st.mode === 'test') {
          const sc = T0; let t = 0, f = 0, o = 0;
          tested.forEach(k => { const [x, y] = k.split(',').map(Number); if (truth(sc, x, y)) t++; else f++; if (onLine(sc, x, y)) o++; });
          if (lk) { L.push('Make your prediction first. Then you can test points.'); return lines(L); }
          if (st.hasPt) {
            L.push(`${kk('Point')} ${pt(st.tx, st.ty)}`, `${kk('Test')} y &gt; 2x − 1.` + ' ' + howText(sc, st.tx, st.ty));
            if (onLine(sc, st.tx, st.ty)) L.push('This point is ON the line. It makes y = 2x − 1 true, but y &gt; 2x − 1 needs y to be strictly greater, so it is false.');
          } else L.push('Click or drag on the graph, or use the sliders, to test a point.');
          L.push(`${kk('Tested')} ${tested.size} point${tested.size === 1 ? '' : 's'}: ${t} true (green dots), ${f} false (red crosses)` + (o ? `, ${o} exactly on the line.` : '.'));
          if (tested.size >= 12 && !st.showLine) L.push('Do the green and red dots form two groups? Turn on the boundary line to see what separates them.');
          if (st.showLine && !st.showShade && tested.size >= 12) L.push('The line separates the true points from the false ones. Turn on the shading to mark the whole true region.');
          return lines(L);
        }
        if (st.mode === 'style') {
          const sc = S(st.sym, 2, -1);
          L.push(`${kk('Inequality')} ${e(sc.txt)}`, `${kk('Line')} ${strictSym(st.sym) ? 'dashed. Points ON the line are NOT solutions.' : 'solid. Points ON the line ARE solutions.'}`);
          if (lk) { L.push('Make your prediction first. Then the symbols unlock.'); return lines(L); }
          if (st.hasPt) {
            const sd = sideOf(sc, st.tx, st.ty);
            L.push(`${kk('Test point')} ${pt(st.tx, st.ty)} is ${sd === 'on' ? 'ON the line' : SIDE[sd]}.`, howText(sc, st.tx, st.ty));
            if (sd === 'on') L.push(strictSym(st.sym) ? 'On the line the two sides are equal, and a strict symbol does not allow equal.' : 'On the line the two sides are equal, and this symbol allows equal.');
          }
          return lines(L);
        }
        if (st.mode === 'shade') {
          const sc = SH[st.shi];
          L.push(`${kk('Inequality')} ${e(sc.txt)}`, `${kk('Line')} ${strictSym(sc.sym) ? 'dashed (strict symbol)' : 'solid (symbol includes equal)'}`);
          if (lk) { L.push('Make your prediction first. Then test a point and shade.'); return lines(L); }
          if (st.hasPt) {
            const sd = sideOf(sc, st.tx, st.ty);
            L.push(`${kk('Test point')} ${pt(st.tx, st.ty)} is ${sd === 'on' ? 'ON the line' : SIDE[sd]}.`, howText(sc, st.tx, st.ty));
            if (sd === 'on') L.push('A point on the line is on neither side, so it cannot decide which side to shade. Test a different point.');
          } else L.push('Test the origin, or click another point, then choose a side.');
          if (st.shMsg) L.push(st.shMsg);
          return lines(L);
        }
        if (st.mode === 'build') {
          const sc = buildSc();
          L.push(`${kk('Inequality')} ${e(sc.txt)}`,
            `${kk('Slope')} ${mT(st.bm)}, ${kk('intercept')} ${num(st.bb)}`,
            `${kk('Symbol')} shaded ${st.bside} means y is ${st.bside === 'above' ? 'greater' : 'less'} than the line. A ${st.bstyle === 'dash' ? 'dashed' : 'solid'} line means points on it ${st.bstyle === 'dash' ? 'do not count' : 'count'}. So the symbol is ${e(sc.sym)}.`);
          return lines(L);
        }
        /* budget */
        const sc = CTX;
        if (lk) return 'Make your prediction first. Then the graph unlocks.';
        if (st.hasPt) {
          const x = st.tx, y = st.ty;
          L.push(`${kk('Order')} ${num(x)} muffins and ${num(y)} cookies, the point ${pt(x, y)}.`);
          if (x < 0 || y < 0) L.push(bad('Not a real order.') + ` You cannot buy a negative number of ${x < 0 ? 'muffins' : 'cookies'}. The half-plane goes on there, but the story does not.`);
          else {
            const cost = 3 * x + 2 * y;
            L.push(`${kk('Cost')} 3(${num(x)}) + 2(${num(y)}) = ${num(cost)} dollars.`);
            L.push(cost <= 24 ? good('Affordable.') + (cost === 24 ? ' You spend all $24, so the point is exactly on the solid line.' : ` You keep $${num(24 - cost)}.`) : bad('Too much.') + ` That is $${num(cost - 24)} over your $24, so the point is outside the shaded region.`);
          }
        } else L.push('Click a point on the graph, or use the sliders, to try an order.');
        L.push(`${kk('Count')} ${latCount(sc, CX1)} different orders use whole numbers, 0 or more, and cost at most $24.`);
        return lines(L);
      };

      /* ----- practice ----- */
      C.title('Practice');
      C.hint('Seven short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); if (st.practice) { st.practice = false; sync(); } else { st.practice = true; if (!prOver) loadStage(); sync(); } } }])[0];
      grp('practice', () => {
        ptally = h('p', { class: 'ctl-title' });
        pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        pch = h('div', { class: 'ctl buttons' });
        pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pnext = mkBtn('Next problem', () => nextStage(), true);
        addTo(ptally, pq, pch, pfb, h('div', { class: 'ctl buttons' }, pnext));
      });
      const tally = () => { ptally.textContent = prOver ? `Right on the first try: ${prFirst} of ${PR.length}` : `Problem ${prIdx + 1} of ${PR.length}. Right on the first try: ${prFirst} of ${prDone} done`; };
      const loadStage = () => {
        const stg = PR[prIdx].stages[prSi]; prSolved = false; prv = null;
        pq.textContent = (PR[prIdx].stages.length > 1 ? `Part ${prSi + 1} of ${PR[prIdx].stages.length}. ` : '') + stg.q;
        pfb.innerHTML = ''; pch.replaceChildren(); pnext.disabled = true;
        const lastSt = prSi === PR[prIdx].stages.length - 1;
        pnext.textContent = !lastSt ? 'Next part' : prIdx === PR.length - 1 ? 'Finish' : 'Next problem';
        stg.ch.forEach((o, i) => pch.append(mkBtn(o[0], () => pick(i))));
        tally();
      };
      const pick = i => {
        const stg = PR[prIdx].stages[prSi]; if (prSolved) return;
        const o = stg.ch[i], right = i === stg.ans, btn = pch.children[i];
        if (o[2]) prv = o[2];
        if (right) {
          prSolved = true; prv = null; Array.from(pch.children).forEach(b2 => { b2.disabled = true; }); btn.classList.add('primary');
          pfb.innerHTML = good('Right.') + ' ' + e(o[1]); pnext.disabled = false;
          if (prSi === PR[prIdx].stages.length - 1) { prDone++; if (!prTried) prFirst++; }
        } else { prTried = true; btn.disabled = true; pfb.innerHTML = bad('Not quite.') + ' ' + e(o[1]) + ' Try another answer.'; }
        tally(); sync();
      };
      const nextStage = () => {
        if (prSi < PR[prIdx].stages.length - 1) { prSi++; loadStage(); sync(); return; }
        if (prIdx < PR.length - 1) { prIdx++; prSi = 0; prTried = false; loadStage(); sync(); return; }
        prOver = true; prv = null;
        pq.textContent = `All ${PR.length} problems are done.`; pch.replaceChildren(); pnext.disabled = true;
        pfb.innerHTML = `You got ${prFirst} of ${PR.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        pch.append(mkBtn('Start over', () => { prIdx = 0; prSi = 0; prFirst = 0; prDone = 0; prTried = false; prOver = false; loadStage(); sync(); }, true));
        tally(); sync();
      };

      /* ----- sync ----- */
      const modeGroups = { test: ['pred', 'tp', 'test', 'ro'], style: ['pred', 'tp', 'style', 'ro'], shade: ['pred', 'shade', 'tp', 'shbtn', 'ro'], build: ['build', 'ro'], rw: ['rw'], ctx: ['pred', 'ctp', 'ctx', 'ro'] };
      const sync = () => {
        const prac = st.practice, lk = locked();
        ['pred', 'tp', 'ctp', 'test', 'style', 'shade', 'shbtn', 'build', 'rw', 'ctx', 'ro'].forEach(k => vis(G[k], !prac && modeGroups[st.mode].includes(k)));
        vis(G.sel, !prac); vis(G.practice, prac);
        if (!prac && !predFor()) vis(G.pred, false);
        selAct.value = st.mode; selSh.value = String(st.shi); selRw.value = String(st.rwi);
        tX.set(st.tx); tY.set(st.ty); cX.set(clamp(st.tx, 0, CX1.xm)); cY.set(clamp(st.ty, 0, CX1.ym));
        [tX.inp, tY.inp, cX.inp, cY.inp].forEach(i => { i.disabled = lk; });
        testBtns.forEach(b2 => { b2.disabled = lk; }); tgLine.disabled = lk; tgShade.disabled = lk;
        tgLine.checked = st.showLine; tgShade.checked = st.showShade; tgFlip.checked = st.rwFlip; tgLat.checked = st.lat; tgLat.disabled = lk;
        styleBtns.forEach((b2, i) => { b2.disabled = lk; b2.classList.toggle('primary', st.sym === [GT, GE, LT, LE][i]); });
        shBtns.forEach(b2 => { b2.disabled = lk || (st.shaded && b2 !== shBtns[0]); });
        mS.set(st.bm); bS.set(st.bb);
        sideBtns.forEach((b2, i) => b2.classList.toggle('primary', st.bside === ['above', 'below'][i]));
        lineBtns.forEach((b2, i) => b2.classList.toggle('primary', st.bstyle === ['dash', 'solid'][i]));
        tgText.textContent = `Target ${st.tg + 1} of ${TG.length}: ${TG[st.tg].t}. Set the picture to match, then press Check.`;
        bFb.innerHTML = st.bMsg;
        tgFlip.parentElement.style.display = !prac && st.mode === 'rw' && RW[st.rwi].flip && st.rws > RW[st.rwi].stages.length ? '' : 'none';
        rwChain.innerHTML = RW[st.rwi].forms.slice(0, Math.min(st.rws, RW[st.rwi].stages.length) + 1).map((f, i) => (i ? '⇒ ' : '') + e(f)).join('<br>');
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        if (!prac) ro.innerHTML = roHtml();
        P.draw();
      };

      draggable(P, {
        hit: (px, py) => {
          if (st.practice) return null;
          if (st.mode === 'build') return near(P, 2, st.bb + 2 * st.bm, px, py) ? 'slp' : near(P, 0, st.bb, px, py) ? 'int' : null;
          if (['test', 'style', 'shade', 'ctx'].includes(st.mode) && !locked()) return 'pt';
          return null;
        },
        move: (hd, x, y) => {
          cancel();
          if (hd === 'pt') setPt(x, y);
          else if (hd === 'int') setBB(y);
          else { const yy = snap(y, 1); setBM((yy - st.bb) / 2); }
        }
      });

      const FLAGS = ['mode', 'bside', 'bstyle'];
      const apply = (patch, immediate) => {
        cancel();
        const nums = {};
        st.practice = false;
        for (const k in patch) if (!FLAGS.includes(k)) nums[k] = patch[k];
        Object.keys(pdone).forEach(k => delete pdone[k]);
        if (patch.mode) loadMode(patch.mode); else renderPred();
        ['bside', 'bstyle'].forEach(k => { if (patch[k]) st[k] = patch[k]; });
        if (immediate) { Object.assign(st, nums); sync(); } else { sync(); cancel = animateTo(st, nums, 700, sync); }
      };
      renderPred(); rwRender(); sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
