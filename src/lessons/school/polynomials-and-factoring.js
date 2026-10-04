/* =====================================================================
   SCHOOL — Polynomials and factoring (algebra tiles and area models)
   ===================================================================== */
{
  const MI = '−';
  const FONT = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
  const n = v => (v < 0 ? MI : '') + Math.abs(v);
  const par = v => (v < 0 ? `(${n(v)})` : n(v));
  const kk = t => `<span class="k">${t}</span>`;
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const lines = a => a.filter(Boolean).join('<br>');
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; };
  /* "x² + 5x − 6" from the three coefficients */
  const poly = (c2, c1, c0) => {
    let s = '';
    [[c2, 'x²'], [c1, 'x'], [c0, '']].forEach(([c, v]) => {
      if (!c) return;
      const m = Math.abs(c), body = (m === 1 && v) ? v : String(m) + v;
      s += s ? (c < 0 ? ` ${MI} ` : ' + ') + body : (c < 0 ? MI : '') + body;
    });
    return s || '0';
  };
  const fac = v => (v === 0 ? 'x' : `x ${v < 0 ? MI : '+'} ${Math.abs(v)}`);
  const facs = (p, q) => (p === 0 && q === 0 ? 'x · x' : (p === 0 ? 'x' : `(${fac(p)})`) + (q === 0 ? 'x' : `(${fac(q)})`));

  /* ----- data ----- */
  const FAC = [[5, 6], [7, 12], [-5, 6], [-1, -6], [2, -8], [6, 9], [3, 5]];           /* x² + Sx + P to factor */
  const GC = [[2, 4, 0], [0, 4, 6], [3, 3, 0], [4, 6, 0], [2, -6, 0]];                 /* [x², x, 1] counts */
  const CMB = [{ A: [2, 1, -3], B: [1, -3, 2] }, { A: [3, -2, 4], B: [1, -2, 1] }, { A: [1, 4, 1], B: [1, 2, -3] }];
  const STR = [
    { name: '4x² − 25',
      pred: { q: 'In 4x² − 25, what is squared? Which pair are the two things that are squared?', ans: 0,
        opts: [['2x and 5', 'Yes. (2x)(2x) = 4x² and 5 · 5 = 25.'], ['4x and 25', 'Not quite. (4x)² is 16x², and 25² is 625.'], ['2x and 25', 'Not quite. 25 is 5 squared, so the second thing is 5.']] },
      forms: [
        { lab: 'Start', t: [['4x² − 25', '']], f: x => 4 * x * x - 25, why: 'This is the expression we are given.' },
        { lab: 'Two squares', t: [['(2x)²', 'A'], [' − ', ''], ['5²', 'B']], f: x => (2 * x) ** 2 - 25, why: '4x² is (2x)(2x), and 25 is 5 · 5. Same numbers, new look: a square minus a square.' },
        { lab: 'Factor', t: [['(', ''], ['2x', 'A'], [' − ', ''], ['5', 'B'], [')(', ''], ['2x', 'A'], [' + ', ''], ['5', 'B'], [')', '']], f: x => (2 * x - 5) * (2 * x + 5), why: 'A² − B² = (A − B)(A + B), the L-shape rule, with A = 2x and B = 5.' }] },
    { name: 'x⁴ − 1',
      pred: { q: 'x⁴ is the square of what? (Think: what times itself gives x⁴?)', ans: 1,
        opts: [['x', 'Not quite. x · x is only x².'], ['x²', 'Yes. x² · x² = x⁴, because the exponents add: 2 + 2 = 4.'], ['2x', 'Not quite. (2x)(2x) = 4x².']] },
      forms: [
        { lab: 'Start', t: [['x⁴ − 1', '']], f: x => x ** 4 - 1, why: 'This is the expression we are given.' },
        { lab: 'Two squares', t: [['(x²)²', 'A'], [' − ', ''], ['1²', 'B']], f: x => (x * x) ** 2 - 1, why: 'x⁴ = (x²)², and 1 = 1². So A = x² and B = 1.' },
        { lab: 'Factor', t: [['(', ''], ['x²', 'A'], [' − ', ''], ['1', 'B'], [')(', ''], ['x²', 'A'], [' + ', ''], ['1', 'B'], [')', '']], f: x => (x * x - 1) * (x * x + 1), why: 'A² − B² = (A − B)(A + B) with A = x² and B = 1.' },
        { lab: 'Again', t: [['(', ''], ['x', 'A'], [' − ', ''], ['1', 'B'], [')(', ''], ['x', 'A'], [' + ', ''], ['1', 'B'], [')(x² + 1)', '']], f: x => (x - 1) * (x + 1) * (x * x + 1), why: 'The first bracket, x² − 1, is itself a difference of two squares, so factor it again. The bracket x² + 1 is a SUM of squares, and the rule does not apply.' }] },
    { name: '(x + 1)² − 9',
      pred: { q: 'Treat the whole bracket (x + 1) as one block A. Then (x + 1)² − 9 is A² minus what squared?', ans: 2,
        opts: [['9', 'Not quite. 9 is the square, so B is the number that is squared.'], ['(x + 1)', 'Not quite. That is A, the first block.'], ['3', 'Yes. 9 = 3 · 3, so B = 3.']] },
      forms: [
        { lab: 'Start', t: [['(x + 1)² − 9', '']], f: x => (x + 1) ** 2 - 9, why: 'This is the expression we are given.' },
        { lab: 'Two squares', t: [['(x + 1)²', 'A'], [' − ', ''], ['3²', 'B']], f: x => (x + 1) ** 2 - 9, why: 'Look at x + 1 as ONE block A, and write 9 as 3². Now it is A² − B².' },
        { lab: 'Factor', t: [['((x + 1)', 'A'], [' − ', ''], ['3', 'B'], [')(', ''], ['(x + 1)', 'A'], [' + ', ''], ['3', 'B'], [')', '']], f: x => ((x + 1) - 3) * ((x + 1) + 3), why: 'A² − B² = (A − B)(A + B). The block x + 1 goes in for A.' },
        { lab: 'Tidy up', t: [['(x − 2)(x + 4)', '']], f: x => (x - 2) * (x + 4), why: 'Inside the brackets: x + 1 − 3 = x − 2 and x + 1 + 3 = x + 4.' },
        { lab: 'Expanded', t: [['x² + 2x − 8', '']], f: x => x * x + 2 * x - 8, why: 'Multiply (x − 2)(x + 4) with tiles: x² + 4x − 2x − 8. Same expression again.' }] },
    { name: 'x² + 6x + 9',
      pred: { q: 'In x² + 6x + 9 the middle term 6x comes from 2 · x · B. What number is B?', ans: 0,
        opts: [['3', 'Yes. 2 · x · 3 = 6x, and 3 · 3 = 9 matches the last term.'], ['6', 'Not quite. 2 · x · 6 = 12x.'], ['9', 'Not quite. 2 · x · 9 = 18x.']] },
      forms: [
        { lab: 'Start', t: [['x² + 6x + 9', '']], f: x => x * x + 6 * x + 9, why: 'This is the expression we are given.' },
        { lab: 'Pattern', t: [['x²', 'A'], [' + 2 · ', ''], ['x', 'A'], [' · ', ''], ['3', 'B'], [' + ', ''], ['3²', 'B']], f: x => x * x + 2 * x * 3 + 9, why: 'Look for A² + 2AB + B². Here A = x and B = 3, since 2 · x · 3 = 6x and 3² = 9.' },
        { lab: 'Factor', t: [['(', ''], ['x', 'A'], [' + ', ''], ['3', 'B'], [')²', '']], f: x => (x + 3) ** 2, why: 'A² + 2AB + B² = (A + B)². In tiles it is a square with side x + 3.' }] },
    { name: '3(x + 2) + 5(x + 2)',
      pred: { q: 'Which part appears in BOTH terms of 3(x + 2) + 5(x + 2)?', ans: 1,
        opts: [['3 and 5', 'Not quite. 3 is only in the first term and 5 only in the second.'], ['(x + 2)', 'Yes. The same block (x + 2) is in both terms, like a common factor.'], ['x', 'Not quite. x is inside the bracket, but the term 3(x + 2) is not 3x only.']] },
      forms: [
        { lab: 'Start', t: [['3(x + 2) + 5(x + 2)', '']], f: x => 3 * (x + 2) + 5 * (x + 2), why: 'This is the expression we are given.' },
        { lab: 'See the block', t: [['3', 'B'], ['(x + 2)', 'A'], [' + ', ''], ['5', 'B'], ['(x + 2)', 'A']], f: x => 3 * (x + 2) + 5 * (x + 2), why: 'Treat (x + 2) as one block A. The expression is 3 blocks plus 5 blocks.' },
        { lab: 'Common factor', t: [['(3 + 5)', 'B'], ['(x + 2)', 'A']], f: x => (3 + 5) * (x + 2), why: '3 blocks plus 5 blocks is (3 + 5) blocks. This is the distributive law run backwards.' },
        { lab: 'Simplify', t: [['8(x + 2)', '']], f: x => 8 * (x + 2), why: '3 + 5 = 8, so there are 8 blocks of (x + 2).' },
        { lab: 'Expanded', t: [['8x + 16', '']], f: x => 8 * x + 16, why: 'Distribute the 8: 8 · x + 8 · 2.' }] },
    { name: '9x² − 4', forms: [
      { lab: 'Start', t: [['9x² − 4', '']], f: x => 9 * x * x - 4, why: 'This is the expression we are given.' },
      { lab: 'Two squares', t: [['(3x)²', 'A'], [' − ', ''], ['2²', 'B']], f: x => (3 * x) ** 2 - 4, why: '9x² is (3x)(3x) and 4 is 2 · 2.' }] }
  ];
  const STR_MENU = 5;

  /* ----- practice problems (a fixed list) ----- */
  const PROBS = [
    { kind: 'choice', view: { mode: 'mul', a: 2, b: 5 }, ans: 2,
      q: 'A tile rectangle has width x + 2 and height x + 5. Count the tiles in the picture. What polynomial is its area?',
      ch: [['x² + 10', 'That forgets the strips. The two edges have x tiles: 5 + 2 = 7 of them. The 10 is only the corner.'],
        ['x² + 7x + 7', 'The corner has 2 × 5 = 10 unit tiles, not 2 + 5 = 7. You ADD the numbers for the x tiles but MULTIPLY them for the corner.'],
        ['x² + 7x + 10', 'The picture has 1 square tile, 5 + 2 = 7 strips and 2 × 5 = 10 unit tiles.'],
        ['x² + 10x + 7', 'The numbers are swapped. The strips come from adding (2 + 5 = 7). The corner comes from multiplying (2 × 5 = 10).']] },
    { kind: 'choice', view: { mode: 'mul', a: -3, b: 2 }, ans: 0,
      q: 'The rectangle has width x − 3 and height x + 2. Red tiles with a minus sign are negative. Which polynomial is its area?',
      ch: [['x² − x − 6', 'There are 2 blue strips and 3 red strips. A blue and a red strip cancel, so 1 red strip is left: −x. The corner is (−3) × 2 = −6, so it has 6 red unit tiles.'],
        ['x² + x − 6', 'There are more RED strips (3) than blue strips (2), so the net is negative: −x, not +x.'],
        ['x² − 5x − 6', 'Blue and red strips cancel in pairs. 3 red and 2 blue leave 1 red, so the strips make −x. Adding the sizes 3 + 2 ignores the colors.'],
        ['x² − x + 6', 'The corner is (−3) × 2. A negative times a positive is negative, so the unit tiles are red: −6.']] },
    { kind: 'fac', t: [7, 12], accept: [[3, 4], [4, 3]],
      q: 'Build a rectangle from 1 square tile, 7 strips and 12 unit tiles. That is x² + 7x + 12. Set the width and the height so the tiles fit exactly, then check.' },
    { kind: 'fac', t: [-1, -6], accept: [[-3, 2], [2, -3]],
      q: 'Now the tiles for x² − x − 6. The net strips are one red strip, and there are 6 red unit tiles. Set the width and height so they fit exactly. Negative numbers are allowed. Then check.' },
    { kind: 'choice', view: { mode: 'cmb', cm: 0, op: 'sub', flip: 1, done: 0 }, ans: 3,
      q: 'Subtract: (2x² + x − 3) − (x² − 3x + 2). The picture shows A, and B with every tile flipped. Which polynomial is the result?',
      ch: [['3x² − 2x − 1', 'That is A + B. The minus sign in front of the bracket was ignored.'],
        ['x² − 2x − 1', 'Only the first term of B was flipped. The minus sign flips EVERY tile of B: x² − 3x + 2 becomes −x² + 3x − 2.'],
        ['x² + 4x − 1', 'The last term was not flipped. −(+2) is −2, so the constant is −3 − 2 = −5.'],
        ['x² + 4x − 5', 'A + (−B) = (2x² + x − 3) + (−x² + 3x − 2). Combine: x² + 4x − 5.']] },
    { kind: 'gcf', poly: [4, 6, 0],
      q: 'Take out the greatest common factor of 4x² + 6x. Set the number and decide whether to take out x too. The tiles must form rows of equal height. Then check.' },
    { kind: 'choice', view: { mode: 'dsq', db: 4, rev: 1 }, ans: 1,
      q: 'An L-shape has area x² − 16: a square of side x with a 4 by 4 square cut from a corner. The picture shows its two pieces slid into one rectangle. Which factoring is right?',
      ch: [['(x − 4)²', 'Expand it: (x − 4)(x − 4) = x² − 8x + 16. That has strips and a +16 corner, so it is not the L-shape.'],
        ['(x − 4)(x + 4)', 'The rectangle has height x − 4 and width x + 4. Strips of +4x and −4x cancel, leaving x² − 16.'],
        ['(x − 8)(x + 2)', 'Expand it: x² + 2x − 8x − 16 = x² − 6x − 16. The strips do not cancel.'],
        ['(x − 16)(x + 1)', 'Expand it: x² + x − 16x − 16 = x² − 15x − 16. The strips do not cancel.']] },
    { kind: 'choice', view: { mode: 'str', sc: 5, sf: 1, sv: 2 }, ans: 2,
      q: 'The picture shows 9x² − 4 seen as (3x)² − 2². Which factoring of 9x² − 4 is right?',
      ch: [['(9x − 2)(x + 2)', 'Expand it: 9x² + 18x − 2x − 4 = 9x² + 16x − 4. The strips do not cancel.'],
        ['(3x − 2)²', 'Expand it: 9x² − 12x + 4. A square (A − B)² has strips, and a +4 at the end.'],
        ['(3x − 2)(3x + 2)', 'With A = 3x and B = 2, A² − B² = (A − B)(A + B). Expand to check: 9x² + 6x − 6x − 4 = 9x² − 4.'],
        ['(3x − 4)(3x + 1)', 'Expand it: 9x² + 3x − 12x − 4 = 9x² − 9x − 4. The strips do not cancel.']] }
  ];
  const DEF = { mode: 'mul', a: 2, b: 3, tg: 0, p: 1, q: 1, pairs: 0, cm: 0, op: 'none', flip: 0, done: 0, gi: 0, gc: 1, gx: 0, db: 3, rev: 0, sc: 0, sf: 0, sv: 3 };
  const ENTER = { mul: { a: 2, b: 3 }, fac: { tg: 0, p: 1, q: 1, pairs: 0 }, cmb: { cm: 0, op: 'none', flip: 0, done: 0 }, gcf: { gi: 0, gc: 1, gx: 0 }, dsq: { db: 3, rev: 0 }, str: { sc: 0, sf: 0, sv: 3 } };
  const MODES = [['mul', 'Multiply two binomials'], ['fac', 'Factor a trinomial'], ['cmb', 'Add and subtract'], ['gcf', 'Take out a common factor'], ['dsq', 'Difference of two squares'], ['str', 'One value, many forms']];

  /* ----- predictions: one per mode, asked once before the controls unlock ----- */
  const predFor = V => {
    if (V.mode === 'mul') return { key: 'mul', ans: 0,
      q: 'You will build a rectangle of width x + 2 and height x + 3. Before you look at the tiles: what is its area?',
      opts: [['x² + 5x + 6', 'Yes. The picture has 1 square tile, 3 + 2 = 5 strips and 2 × 3 = 6 unit tiles.'],
        ['x² + 6', 'Not quite. That multiplies only x · x and 2 · 3. The picture also has strips along both edges: x times 2 and x times 3.'],
        ['x² + 6x + 5', 'Not quite. The numbers are swapped. The corner is 2 × 3 = 6 and the strips are 2 + 3 = 5.'],
        ['5x + 6', 'Not quite. x times x makes a square tile, so there is an x² term.']] };
    if (V.mode === 'fac' && V.tg === 0) return { key: 'fac0', ans: 1,
      q: 'You have 1 square tile, 5 strips and 6 unit tiles. The side numbers must multiply to 6 (the corner) and add to 5 (the strips). Which pair?',
      opts: [['1 and 6', 'Not quite. 1 × 6 = 6, but 1 + 6 = 7, so there would be 7 strips.'], ['2 and 3', 'Yes. 2 × 3 = 6 and 2 + 3 = 5.'],
        ['1 and 5', 'Not quite. 1 + 5 = 6, but 1 × 5 = 5, so the corner would have only 5 unit tiles.'], ['−2 and −3', 'Not quite. (−2)(−3) = 6, but −2 + (−3) = −5. The strips would be red.']] };
    if (V.mode === 'dsq') return { key: 'dsq', ans: 0,
      q: 'The L-shape has area x² − 9. You will cut it into two rectangles and slide them together into ONE rectangle. What are its sides?',
      opts: [['x − 3 by x + 3', 'Yes. Slide and you will see it: one side is x − 3 and the other is x + 3.'],
        ['x − 3 by x − 3', 'Not quite. That is a square of area x² − 6x + 9, which is more than the L-shape.'], ['x by x − 9', 'Not quite. That has area x² − 9x, not x² − 9.']] };
    if (V.mode === 'str') { const c = STR[V.sc]; return c.pred ? { key: 'str' + V.sc, ...c.pred } : null; }
    return null;
  };

  /* ----- explanations used by the readout and by Practice ----- */
  const facCheck = (t, p, q) => {
    const [S, P0] = t, s = p + q, pr = p * q, okS = s === S, okP = pr === P0;
    const L = [];
    L.push(`${kk('Your rectangle')} ${facs(p, q)} has area ${poly(1, s, pr)}`);
    L.push(`${kk('Strips')} ${n(p)} + ${par(q)} = ${n(s)}, you need ${n(S)}: ${okS ? good('right') : bad('not equal')}`);
    L.push(`${kk('Corner')} ${n(p)} × ${par(q)} = ${n(pr)}, you need ${n(P0)}: ${okP ? good('right') : bad('not equal')}`);
    if (p * q < 0 || (p !== 0 && q !== 0 && p * q > 0 && p < 0)) { /* mixed or both red strips */ }
    if (p * q < 0) L.push('One strip is blue and the other red, so they cancel in pairs. Only the difference is left.');
    let end;
    if (okS && okP) end = good('It fits exactly.') + ` ${poly(1, S, P0)} = ${facs(p, q)}. No gaps, no tiles left over.` + (p === q && p !== 0 ? ' This rectangle is a square, so the trinomial is a perfect square.' : '');
    else if (!okP && !okS) end = bad('Not yet.') + ` Both counts are off. Start with the corner: the two numbers must multiply to ${n(P0)}.`;
    else if (!okP) end = bad('Not yet.') + ` The strips are right, but the corner needs ${n(P0)} unit tiles and it has ${n(pr)}. The two numbers must multiply to ${n(P0)}.`;
    else end = bad('Not yet.') + ` The corner is right, but the strips make ${n(s)}x and you need ${n(S)}x. The two numbers must add to ${n(S)}.`;
    L.push(end);
    return { fit: okS && okP, html: lines(L) };
  };
  const pairsText = t => {
    const [S, P0] = t, out = [];
    for (let u = -Math.abs(P0); u <= Math.abs(P0); u++) { if (u === 0 || P0 % u) continue; const v = P0 / u; if (u <= v) out.push(`${par(u)} and ${par(v)}: sum ${n(u + v)}${u + v === S ? ' ' + good('✓') : ''}`); }
    return `${kk('Pairs that multiply to ' + n(P0))}<br>` + out.join('<br>') + (out.some(s => s.includes('✓')) ? '' : '<br>' + bad('None adds to ' + n(S) + '.') + ' No whole-number rectangle exists for these tiles.');
  };
  /* common factor: does f = c·x^k pull out of c2 x² + c1 x + c0, and is the job finished? */
  const gcfInfo = (P, c, gx) => {
    const [c2, c1, c0] = P, nm = ['x² tiles', 'x tiles', 'unit tiles'], f = (c === 1 ? '' : String(c)) + (gx ? 'x' : '') || '1';
    if (gx && c0 !== 0) return { ok: false, why: `A factor of x needs an x in every term. The ${n(c0)} unit tiles have none, so they cannot sit in rows of height x.` };
    for (let i = 0; i < 3; i++) if (P[i] % c !== 0) return { ok: false, why: `Rows of height ${f}: the ${n(P[i])} ${nm[i]} cannot be split into ${c} equal rows, because ${n(P[i])} is not a multiple of ${c}.` };
    const q = gx ? [0, c2 / c, c1 / c] : [c2 / c, c1 / c, c0 / c];
    const g = gcd(gcd(q[0], q[1]), q[2]), canX = !gx && c0 === 0 && !(q[0] === 0 && q[1] === 0 && q[2] !== 0);
    const full = g === 1 && !canX, qt = poly(...q);
    let more = '';
    if (canX) more = `Every term of ${qt} still has an x.`;
    else if (g > 1) more = `Every number in ${qt} is still a multiple of ${g}.`;
    return { ok: true, q, qt, full, f, more, draw: q[0] === 0 };
  };

  register({
    id: 'polynomials-and-factoring', level: 'school',
    title: 'Polynomials and factoring',
    blurb: 'Build rectangles from algebra tiles to multiply binomials, then run it backwards to factor trinomials, common factors and differences of squares.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 3;
      const w = p.w, hh = p.h, u = Math.min(w / 11, hh / 10), X = 3 * u, ox = (w - (X + 2 * u)) / 2, oy = (hh - (X + 3 * u)) / 2;
      const T = (col, x, y, ww, h2) => { c.fillStyle = alpha(col, .55); c.fillRect(ox + x, oy + y, ww, h2); c.strokeStyle = col; c.lineWidth = 1.5; c.strokeRect(ox + x + .5, oy + y + .5, ww - 1, h2 - 1); };
      T(pal.blue, 0, 0, X, X);
      for (let j = 0; j < 2; j++) T(pal.green, X + j * u, 0, u, X);
      for (let i = 0; i < 3; i++) T(pal.green, 0, X + i * u, X, u);
      for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) T(pal.yellow, X + j * u, X + i * u, u, u);
    },
    hook: String.raw`A tile shop sells three shapes: a big square, a long strip and a small square. Pour out 1 big square, 5 strips and 6 small squares, and they can be packed into one rectangle with no gaps. How long are its sides? And why do the sides tell you how to factor \(x^2+5x+6\)?`,
    steps: [
      { title: 'Area is a product',
        text: String.raw`<p>Three tile shapes: a big square \(x^2\) (blue), a strip \(x\) (green) and a small square \(1\) (yellow). A red tile with a minus sign is negative.</p><p>This rectangle has width \(x+2\) and height \(x+3\). Predict its area, then count the tiles in the picture to check.</p>`,
        set: { mode: 'mul', a: 2, b: 3 } },
      { title: 'Run it backwards: factor',
        text: String.raw`<p>Now you are given the tiles of \(x^2+5x+6\): 1 square, 5 strips, 6 units. Choose the side numbers so they fit into a rectangle exactly.</p><p>The units fill the corner, so the two numbers multiply to 6. The strips fill both edges, so they add to 5. Predict the pair, then test it. Try the pairs switch.</p>`,
        set: { mode: 'fac', tg: 0, p: 1, q: 1, pairs: 0 } },
      { title: 'A square with a corner cut out',
        text: String.raw`<p>Cut a square of side 3 from a corner of a square of side \(x\). The L-shape left over has area \(x^2-9\).</p><p>Cut the L into two rectangles and slide them together into one rectangle. Predict its sides, then slide. Try other cuts with the slider, or drag the corner.</p>`,
        set: { mode: 'dsq', db: 3, rev: 0 } },
      { title: 'One value, many forms',
        text: String.raw`<p>\((x+1)^2-9\) can be seen as one square minus another. Take the whole bracket \(x+1\) as one block A, and \(B=3\).</p><p>Predict B, then press Rewrite to step through the forms. At \(x=3\) every row gives 7, so every row is the same expression. Also try Add and subtract, and Common factor, in the Workshop menu.</p>`,
        set: { mode: 'str', sc: 2, sf: 0, sv: 3 } }
    ],
    formal: String.raw`
      <h3>What the tiles mean</h3>
      <p>An algebra tile is a rectangle whose area stands for a term. The big square has side \(x\), so its area is \(x^2\). The strip is \(x\) long and 1 wide, so its area is \(x\). The small square is 1 by 1, so its area is 1. We draw \(x\) as a fixed length, but it stands for any length. A <em>polynomial</em> is a sum of terms such as \(x^2\), \(5x\) and \(6\). A red tile has negative area. A blue strip and a red strip together make zero, so they cancel as a <em>zero pair</em>.</p>
      <h3>Add and subtract</h3>
      <p>To add, put the tiles together and combine tiles of the same shape: these are the <em>like terms</em>. To subtract, add the opposite. The opposite of a polynomial flips every tile, so \(-(x^2-3x+2)=-x^2+3x-2\). The minus sign multiplies every term, not just the first. For example
      \[ (2x^2+x-3)-(x^2-3x+2)=(2x^2+x-3)+(-x^2+3x-2)=x^2+4x-5. \]</p>
      <h3>Multiply: area is width times height</h3>
      <p>A rectangle with width \(x+a\) and height \(x+b\) splits into four boxes, one for each product of a width part and a height part:
      \[ (x+a)(x+b)=x\cdot x+x\cdot b+a\cdot x+a\cdot b=x^2+(a+b)x+ab. \]
      The corner has \(a\times b\) unit tiles. The two strips together have \(a+b\) strips. Colors follow the signs: a negative times a positive is negative, and a negative times a negative is positive. Example: \((x-3)(x+2)=x^2+2x-3x-6=x^2-x-6\). The same rule works for bigger polynomials: multiply every term of one by every term of the other, then combine like terms. For example \((x+1)(x^2+x+1)=x^3+x^2+x+x^2+x+1=x^3+2x^2+2x+1\).</p>
      <h3>Factor a trinomial</h3>
      <p>Factoring undoes multiplying. To factor \(x^2+bx+c\), look for two numbers \(p\) and \(q\) with \(p\cdot q=c\) (the corner) and \(p+q=b\) (the strips). Then \(x^2+bx+c=(x+p)(x+q)\). Why this works: expanding \((x+p)(x+q)\) gives exactly \(x^2+(p+q)x+pq\), so if the two numbers do both jobs, the tiles must fit. If \(c\) is positive, \(p\) and \(q\) have the same sign (the sign of \(b\)). If \(c\) is negative, they have opposite signs. Some trinomials do not factor over whole numbers: for \(x^2+3x+5\), the pairs multiplying to 5 are \(1,5\) and \(-1,-5\), with sums 6 and \(-6\), never 3. This lesson factors only trinomials that start with \(1x^2\).</p>
      <h3>Common monomial factor</h3>
      <p>The distributive law says \(a(b+c)=ab+ac\). Run it backwards: if every term has the same factor, pull it out. For \(4x^2+6x\), every term is a multiple of \(2x\), so \(4x^2+6x=2x(2x+3)\). In tiles: put the tiles in rows of height \(2x\). Check by multiplying: \(2x\cdot2x=4x^2\) and \(2x\cdot 3=6x\). Take out the <em>greatest</em> common factor, so the bracket has no common factor left. Do this step first, before any other factoring.</p>
      <h3>Difference of two squares</h3>
      <p>Cut a square of side \(b\) from the corner of a square of side \(a\). The L-shape has area \(a^2-b^2\). Cut the L into two rectangles along the line where the cut square ends. One piece is \(a\) by \(a-b\). The other is \(a-b\) by \(b\). Turn the second piece a quarter turn and place it beside the first. Together they make one rectangle with sides \(a-b\) and \(a+b\). No area was added or lost, so
      \[ a^2-b^2=(a-b)(a+b). \]
      The pattern needs a SUBTRACTION of two squares. A sum such as \(x^2+9\) is not an L-shape.</p>
      <h3>Use structure to write an expression in more than one way</h3>
      <p>The same expression can be read in different ways. \(4x^2-25\) is \((2x)^2-5^2\), a difference of squares with \(A=2x\) and \(B=5\), so it equals \((2x-5)(2x+5)\). \((x+1)^2-9\) has the block \(x+1\) in place of \(A\): \(((x+1)-3)((x+1)+3)=(x-2)(x+4)\). \(x^2+6x+9\) matches \(A^2+2AB+B^2\) with \(A=x\), \(B=3\), so it is \((x+3)^2\). \(3(x+2)+5(x+2)\) has the block \((x+2)\) twice, so it is \(8(x+2)\). Equivalent forms give the same value for every \(x\). Trying one value is a quick check, not a proof. To be sure, expand both forms and compare tiles.</p>`,
    check: [
      { q: 'A rectangle of algebra tiles has width x + 3 and height x + 1. Which list shows the tiles inside it?',
        choices: ['1 square tile (x²), 3 strips (x) and 4 unit tiles', '1 square tile (x²), 4 strips (x) and 3 unit tiles', '1 square tile (x²), 4 strips (x) and 4 unit tiles', '1 square tile (x²), no strips and 3 unit tiles'], answer: 1,
        why: String.raw`Split the rectangle into four boxes: \(x\cdot x=x^2\) (1 square), \(x\cdot 1=x\) (1 strip), \(3\cdot x=3x\) (3 strips) and \(3\cdot1=3\) (3 unit tiles). The strips ADD: \(1+3=4\). The corner MULTIPLIES: \(3\times1=3\). So the area is \(x^2+4x+3\). The first choice swaps the 4 and the 3. The third adds \(3+1\) for the corner. The last forgets the strips along the edges.`,
        hint: 'Draw the four boxes: x by x, x by 1, 3 by x and 3 by 1. Count how many of each shape you get.' },
      { q: 'Multiply (x − 2)(x + 5). Then subtract (x² − 1) from the result. What is left?',
        choices: ['2x² + 3x − 11', '3x − 11', '3x + 9', '3x − 9'], answer: 3,
        why: String.raw`First \((x-2)(x+5)=x^2+5x-2x-10=x^2+3x-10\). Subtracting \((x^2-1)\) means adding its opposite, \(-x^2+1\): \(x^2+3x-10-x^2+1=3x-9\). \(2x^2+3x-11\) comes from ADDING \(x^2-1\). \(3x-11\) forgets to flip the \(-1\) (it should become \(+1\)). \(3x+9\) has the wrong sign on the constant.`,
        hint: 'Expand with four boxes first. Then flip every term of (x² − 1) and combine like terms.' },
      { q: 'A student factors 4x² − 36 like this. Step 1: 4x² − 36 = (2x)² − 6². Step 2: = (2x − 6)(2x + 6). Step 3: "Done, it is fully factored." Which statement is true?',
        choices: ['Step 1 is wrong, because 36 is not a square.', 'Step 2 is wrong, because both signs in the brackets should be minus.', 'Steps 1 and 2 are right, but step 3 is wrong: each bracket still has a common factor 2, so the full answer is 4(x − 3)(x + 3).', 'Everything is right, and there is nothing more to do.'], answer: 2,
        why: String.raw`Steps 1 and 2 are correct: \(36=6^2\), and \(A^2-B^2=(A-B)(A+B)\) with \(A=2x\), \(B=6\). But \(2x-6=2(x-3)\) and \(2x+6=2(x+3)\), so the product is \(4(x-3)(x+3)\). Taking out the common factor 4 FIRST would have given \(4(x^2-9)\) and then \(4(x-3)(x+3)\) in two easy steps. Opposite signs in the brackets are needed so the strips cancel.`,
        hint: 'Look at each bracket in step 2. Do both terms inside share a factor? Multiply your final answer back out to check it.' }
    ],
    links: { related: ['quadratics-and-the-parabola', 'solving-systems-by-elimination', 'multiplying-with-area-models', 'area-by-decomposition', 'solving-equations-with-a-balance'] },

    mount({ stage, controls: C }) {
      const st = Object.assign({}, DEF, { pd: {}, pc: {}, practice: false });
      let cancel = () => {};
      const panel = stage.nextElementSibling;
      const P = new Plane(stage, { cx: 0, cy: 0, span: 5 });
      const LAY = { hand: null, u: 20, xr: 0 };
      let prIdx = 0, prSolved = false, prTried = false, prFirst = 0, prDone = 0, prOver = false;

      /* the view is the state in explore mode, and the problem's picture in practice */
      const view = () => {
        if (!st.practice) return Object.assign({}, st, { t: FAC[st.tg], poly: GC[st.gi], locked: !!needs(), fixed: false });
        const pr = PROBS[prIdx];
        if (pr.kind === 'choice') return Object.assign({}, DEF, pr.view, { locked: false, fixed: true });
        if (pr.kind === 'fac') return Object.assign({}, DEF, { mode: 'fac', p: st.p, q: st.q, t: pr.t, locked: false, fixed: false });
        return Object.assign({}, DEF, { mode: 'gcf', gc: st.gc, gx: st.gx, poly: pr.poly, locked: false, fixed: false });
      };
      const needs = () => { if (st.practice) return null; const q = predFor(st); return q && !st.pd[q.key] ? q : null; };

      /* ----- drawing helpers ----- */
      const kindOf = (a, b) => (a.k === 'x' && b.k === 'x' ? 'x2' : (a.k === 'x' || b.k === 'x') ? 'x' : '1');
      const tcol = (pal, kind) => (kind === 'x2' ? pal.blue : kind === 'x' ? pal.green : pal.yellow);
      const text = (c, s, x, y, o = {}) => {
        c.font = `${o.weight || 600} ${o.size || 15}px ${FONT}`; c.fillStyle = o.color; c.textAlign = o.align || 'center'; c.textBaseline = o.base || 'middle'; c.fillText(s, x, y);
      };
      /* one tile: color by shape, red with hatching and a minus sign when negative */
      const tile = (c, pal, kind, sign, X, Y, W, H, fs, o = {}) => {
        const col = sign < 0 ? pal.red : tcol(pal, kind), fa = o.faded ? .35 : 1;
        c.save();
        if (o.hidden) { c.setLineDash([5, 5]); c.strokeStyle = alpha(pal.muted, .8); c.lineWidth = 1.2; c.strokeRect(X + .75, Y + .75, W - 1.5, H - 1.5); c.restore(); return; }
        c.globalAlpha = fa;
        c.fillStyle = alpha(col, sign < 0 ? .45 : .55); c.fillRect(X + .75, Y + .75, W - 1.5, H - 1.5);
        if (sign < 0) {
          c.save(); c.beginPath(); c.rect(X + .75, Y + .75, W - 1.5, H - 1.5); c.clip(); c.strokeStyle = alpha(pal.red, .6); c.lineWidth = 1;
          for (let k = -H; k < W; k += 7) { c.beginPath(); c.moveTo(X + k, Y + H); c.lineTo(X + k + H, Y); c.stroke(); }
          c.restore();
        }
        c.strokeStyle = col; c.lineWidth = 1.6; c.strokeRect(X + .75, Y + .75, W - 1.5, H - 1.5);
        const lab = kind === 'x2' ? 'x²' : kind === 'x' ? 'x' : '1';
        if (o.label !== false && H >= 12 && W >= 12) text(c, (sign < 0 ? MI : '') + (o.signOnly ? '' : lab) || (sign < 0 ? MI : '+'), X + W / 2, Y + H / 2 + 1, { size: fs, color: pal.text });
        if (o.faded) { c.globalAlpha = 1; c.strokeStyle = pal.text; c.lineWidth = 1.3; c.beginPath(); c.moveTo(X + 3, Y + H - 3); c.lineTo(X + W - 3, Y + 3); c.stroke(); }
        c.restore();
      };
      const runs = arr => { const r = []; arr.forEach((s, i) => { const l = r[r.length - 1]; if (l && l.k === s.k && l.s === s.s) l.n++; else r.push({ k: s.k, s: s.s, n: 1, i0: i }); }); return r; };
      const runText = r => (r.k === 'x' ? (r.s < 0 ? MI : '') + (r.n > 1 ? r.n : '') + 'x' : (r.s < 0 ? MI : '+') + r.n);
      const bottomLines = (c, p, L) => {
        const fs = clamp(p.w / 24, 14, 19);
        L.forEach(([s, col], i) => text(c, s, p.w / 2, p.h - 14 - (L.length - 1 - i) * 24 - 5, { size: fs, color: col }));
      };
      const note = (c, p, L) => { const fs = clamp(p.w / 24, 14, 18); L.forEach((s, i) => text(c, s, p.w / 2, p.h / 2 + (i - (L.length - 1) / 2) * fs * 1.6, { size: fs, color: p.pal.text, weight: 500 })); };

      /* a rectangle of tiles from width segments and height segments; returns the layout or null if too small */
      const drawGrid = (c, p, ws, hs, o = {}) => {
        const pal = p.pal, XL = 4, len = s => (s.k === 'x' ? XL : 1);
        const Wu = ws.reduce((t, s) => t + len(s), 0), Hu = hs.reduce((t, s) => t + len(s), 0);
        const mL = 42, mR = 14, mT = 46, mB = 16 + 24 * (o.lines || 1);
        const aw = p.w - mL - mR, ah = p.h - mT - mB, u = Math.min(aw / Wu, ah / Hu, 44);
        if (u < (o.minU || 9)) return null;
        const x0 = mL + (aw - Wu * u) / 2, y0 = mT + (ah - Hu * u) / 2, fs = clamp(u * .6, 11, 20);
        const cx = [], cy = []; let t = x0; ws.forEach(s => { cx.push(t); t += len(s) * u; }); const xe = t; t = y0; hs.forEach(s => { cy.push(t); t += len(s) * u; }); const ye = t;
        hs.forEach((rs, i) => ws.forEach((cs, j) => tile(c, pal, kindOf(cs, rs), cs.s * rs.s, cx[j], cy[i], len(cs) * u, len(rs) * u, fs, { hidden: o.hidden })));
        if (o.hidden) text(c, '?', (x0 + xe) / 2, (y0 + ye) / 2, { size: clamp(u * 1.4, 20, 40), color: pal.muted });
        const lf = clamp(u * .65, 14, 19);
        runs(ws).forEach(r => {
          const a = cx[r.i0] + 3, b = cx[r.i0 + r.n - 1] + len(ws[r.i0 + r.n - 1]) * u - 3;
          c.strokeStyle = pal.muted; c.lineWidth = 1.5; c.beginPath(); c.moveTo(a, y0 - 7); c.lineTo(a, y0 - 11); c.lineTo(b, y0 - 11); c.lineTo(b, y0 - 7); c.stroke();
          text(c, runText(r), (a + b) / 2, y0 - 22, { size: lf, color: pal.text });
        });
        runs(hs).forEach(r => {
          const a = cy[r.i0] + 3, b = cy[r.i0 + r.n - 1] + len(hs[r.i0 + r.n - 1]) * u - 3;
          c.strokeStyle = pal.muted; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0 - 7, a); c.lineTo(x0 - 11, a); c.lineTo(x0 - 11, b); c.lineTo(x0 - 7, b); c.stroke();
          text(c, runText(r), x0 - 15, (a + b) / 2, { size: lf, color: pal.text, align: 'right' });
        });
        const lay = { u, x0, y0, xr: cx[0] + XL * u, yr: cy[0] + XL * u, xe, ye, cx0: cx[0] };
        if (o.handles) {
          const hw = [xe, y0 + XL * u / 2], hh = [cx[0] + XL * u / 2, ye];
          LAY.hand = { w: hw, h: hh }; Object.assign(LAY, lay);
          [hw, hh].forEach(([hx, hy]) => { c.beginPath(); c.arc(hx, hy, 9, 0, TAU); c.fillStyle = pal.stage; c.fill(); c.lineWidth = 3; c.strokeStyle = pal.brass; c.stroke(); });
        }
        return lay;
      };
      const mkSegs = a => { const r = [{ k: 'x', s: 1 }]; for (let i = 0; i < Math.abs(a); i++) r.push({ k: '1', s: Math.sign(a) }); return r; };

      const drawMul = (c, p, V) => {
        const pal = p.pal, S = V.a + V.b, Pr = V.a * V.b;
        const lay = drawGrid(c, p, mkSegs(V.a), mkSegs(V.b), { hidden: V.locked, lines: 1, handles: !V.locked && !V.fixed });
        if (!lay) return note(c, p, ['Too small to draw.']);
        bottomLines(c, p, [[V.locked ? 'Area = ?' : `Area = ${poly(1, S, Pr)}`, pal.text]]);
      };
      const drawFac = (c, p, V) => {
        const pal = p.pal, [S, P0] = V.t, s = V.p + V.q, pr = V.p * V.q, fit = s === S && pr === P0;
        const lay = drawGrid(c, p, mkSegs(V.p), mkSegs(V.q), { hidden: V.locked, lines: 2, handles: !V.locked && !V.fixed });
        if (!lay) return note(c, p, ['Too small to draw.']);
        bottomLines(c, p, [[`Tiles to fit: ${poly(1, S, P0)}`, pal.text], [V.locked ? 'Your rectangle: ?' : `Your rectangle: ${poly(1, s, pr)}   ${fit ? '✓ fits exactly' : '✗ does not fit'}`, V.locked ? pal.muted : fit ? pal.green : pal.red]]);
      };
      const drawGcf = (c, p, V) => {
        const pal = p.pal, P0 = V.poly, info = gcfInfo(P0, V.gc, V.gx);
        const ttl = `Tiles: ${poly(...P0)}`;
        if (info.ok && info.draw) {
          const hs = []; for (let i = 0; i < V.gc; i++) hs.push({ k: V.gx ? 'x' : '1', s: 1 });
          const q = info.q, ws = []; for (let i = 0; i < q[1]; i++) ws.push({ k: 'x', s: 1 }); for (let i = 0; i < Math.abs(q[2]); i++) ws.push({ k: '1', s: Math.sign(q[2]) });
          const lay = drawGrid(c, p, ws, hs, { lines: 2, minU: 11 });
          if (lay) { bottomLines(c, p, [[ttl, pal.text], [`Rows of height ${info.f}: ${info.f}(${info.qt})`, info.full ? pal.green : pal.text]]); return; }
        }
        if (info.ok && info.draw) return (note(c, p, ['The tiles fit, but the picture is too wide to draw.', `${info.f}(${info.qt})`]), bottomLines(c, p, [[ttl, pal.text]]));
        /* the pile of tiles, not yet arranged */
        const u = clamp(Math.min(p.w / 20, p.h / 16), 9, 18), XL = 4, W = p.w - 40;
        let X = 20, Y = 24, rowH = 0; const row = [[P0[0], 'x2', XL * u, XL * u], [P0[1], 'x', XL * u, u], [P0[2], '1', u, u]];
        row.forEach(([cnt, kind, tw, th]) => {
          const sign = cnt < 0 ? -1 : 1;
          if (cnt && X > 20) { X = 20; Y += rowH + 10; rowH = 0; }
          for (let i = 0; i < Math.abs(cnt); i++) { if (X + tw > 20 + W) { X = 20; Y += rowH + 4; rowH = 0; } tile(c, pal, kind, sign, X, Y, tw, th, clamp(u * .6, 11, 16)); X += tw + 4; rowH = Math.max(rowH, th); }
        });
        if (!info.ok) { note(c, p, ['The tiles cannot be arranged in those rows.']); }
        bottomLines(c, p, [[ttl, pal.text]]);
      };

      const drawCmb = (c, p, V) => {
        const pal = p.pal, cs = CMB[V.cm], A = cs.A, sub = V.op === 'sub', flipped = sub && V.flip;
        const Bs = flipped ? cs.B.map(v => -v) : cs.B, R = A.map((v, i) => v + Bs[i]), done = V.done && V.op !== 'none';
        const bands = [{ lab: `A = ${poly(...A)}`, co: A, id: 'A' }, { lab: flipped ? `−B (flipped) = ${poly(...Bs)}` : `B = ${poly(...Bs)}`, co: Bs, id: 'B' }];
        if (done) bands.push({ lab: `${V.op === 'add' ? 'A + B' : flipped ? 'A − B' : 'A + B (not flipped!)'} = ${poly(...R)}`, co: R, id: 'R' });
        const cw = (p.w - 24) / 3, kinds = ['x2', 'x', '1'], XL = 3;
        const rowsFor = (kind, cnt, u) => { const tw = (kind === 'x2' ? XL : kind === 'x' ? XL : 1) * u + 3, per = Math.max(1, Math.floor((cw - 6) / tw)), r = Math.ceil(Math.abs(cnt) / per); return { tw, per, r, th: (kind === 'x2' ? XL : 1) * u }; };
        const bh = (b, u) => Math.max(...kinds.map((k, i) => { const g = rowsFor(k, b.co[i], u); return Math.max(1, g.r) * (g.th + 3); })) + 6;
        let u = 26; const avail = p.h - 44 - bands.length * 22;
        while (u > 7 && (bands.reduce((t, b) => t + bh(b, u), 0) > avail || 2 * (3 * u + 3) > cw - 6)) u--;
        const fs = clamp(u * .7, 11, 18), hf = clamp(p.w / 28, 12, 16);
        ['x² tiles', 'x tiles', 'unit tiles'].forEach((s, i) => text(c, s, 12 + cw * (i + .5), 16, { size: hf, color: pal.muted }));
        let y = 32;
        bands.forEach(b => {
          text(c, b.lab, 12, y + 8, { size: hf, color: b.id === 'R' ? (V.op === 'sub' && !flipped ? pal.red : pal.text) : pal.text, align: 'left' }); y += 20;
          const h2 = bh(b, u);
          c.strokeStyle = pal['grid-strong']; c.lineWidth = 1; c.strokeRect(12.5, y - 2.5, p.w - 25, h2 + 1);
          kinds.forEach((kind, i) => {
            const cnt = b.co[i], g = rowsFor(kind, cnt, u), sign = cnt < 0 ? -1 : 1;
            /* cancelled tiles: a positive and a negative tile of the same shape make a zero pair */
            let cancelN = 0;
            if (done && b.id !== 'R') {
              const posA = Math.max(A[i], 0), negA = Math.max(-A[i], 0), posB = Math.max(Bs[i], 0), negB = Math.max(-Bs[i], 0), m = Math.min(posA + posB, negA + negB);
              if (b.id === 'A') cancelN = A[i] > 0 ? Math.min(posA, m) : Math.min(negA, m);
              else cancelN = Bs[i] > 0 ? m - Math.min(posA, m) : m - Math.min(negA, m);
            }
            for (let k = 0; k < Math.abs(cnt); k++) {
              const col = k % g.per, row = Math.floor(k / g.per);
              tile(c, pal, kind, sign, 12 + cw * i + 4 + col * g.tw, y + 2 + row * (g.th + 3), g.tw - 3, g.th, fs, { faded: k < cancelN, signOnly: kind === '1' });
            }
            if (cnt === 0) text(c, '0', 12 + cw * (i + .5), y + h2 / 2, { size: hf, color: pal.muted });
          });
          y += h2 + 4;
        });
        if (V.op === 'none') text(c, 'Choose Add or Subtract.', p.w / 2, p.h - 16, { size: hf, color: pal.muted, weight: 500 });
      };

      const XD = 6;
      const drawDsq = (c, p, V) => {
        const pal = p.pal, b = V.db, rev = V.rev, x = XD;
        const mT = 46, mB = 16 + 48, ah = p.h - mT - mB, aw = p.w - 70;
        const u = Math.min(aw / (x + b), ah / x, 50), ox = 35 + (aw - (x + b) * u) / 2, oy = mT + (ah - x * u) / 2 + x * u;
        const PX = mx => ox + mx * u, PY = my => oy - my * u;
        const fs = clamp(u * .42, 12, 16);
        /* piece 1 stays: the bottom strip, x wide and x - b tall */
        const piece = (W, H, col) => { c.fillStyle = alpha(col, .5); c.fillRect(-W / 2, -H / 2, W, H); c.strokeStyle = alpha(pal.text, .35); c.lineWidth = 1; c.beginPath(); for (let k = 1; k < Math.round(W / u); k++) { c.moveTo(-W / 2 + k * u, -H / 2); c.lineTo(-W / 2 + k * u, H / 2); } for (let k = 1; k < Math.round(H / u); k++) { c.moveTo(-W / 2, -H / 2 + k * u); c.lineTo(W / 2, -H / 2 + k * u); } c.stroke(); c.strokeStyle = col; c.lineWidth = 2.2; c.strokeRect(-W / 2, -H / 2, W, H); };
        c.save(); c.translate(PX(x / 2), PY((x - b) / 2)); piece(x * u, (x - b) * u, pal.blue); c.restore();
        /* piece 2 moves: the left strip, x - b wide and b tall, turns a quarter turn and slides to the right edge */
        const c0 = [(x - b) / 2, x - b / 2], c1 = [x + b / 2, (x - b) / 2], cxp = lerp(c0[0], c1[0], rev), cyp = lerp(c0[1], c1[1], rev);
        c.save(); c.translate(PX(cxp), PY(cyp)); c.rotate(rev * Math.PI / 2); piece((x - b) * u, b * u, pal.green); c.restore();
        /* the cut-out square */
        c.save(); c.setLineDash([6, 5]); c.strokeStyle = pal.red; c.lineWidth = 2; c.strokeRect(PX(x - b), PY(x), b * u, b * u); c.restore();
        text(c, `${b} × ${b}`, PX(x - b / 2), PY(x - b / 2), { size: fs, color: pal.red, weight: 500 });
        text(c, '1', PX(x / 2), PY((x - b) / 2), { size: fs + 2, color: pal.text });
        text(c, '2', PX(cxp), PY(cyp), { size: fs + 2, color: pal.text });
        /* side labels */
        const br = (a, bb, y, lab) => { c.strokeStyle = pal.muted; c.lineWidth = 1.5; c.beginPath(); c.moveTo(a, y + 5); c.lineTo(a, y); c.lineTo(bb, y); c.lineTo(bb, y + 5); c.stroke(); text(c, lab, (a + bb) / 2, y - 11, { size: clamp(u * .5, 14, 19), color: pal.text }); };
        const bl = (a, bb, xx, lab) => { c.strokeStyle = pal.muted; c.lineWidth = 1.5; c.beginPath(); c.moveTo(xx + 5, a); c.lineTo(xx, a); c.lineTo(xx, bb); c.lineTo(xx + 5, bb); c.stroke(); text(c, lab, xx - 6, (a + bb) / 2, { size: clamp(u * .5, 14, 19), color: pal.text, align: 'right' }); };
        if (rev < .97) { br(PX(0) + 2, PX(x) - 2, PY(x) - 8, 'x'); bl(PY(x) + 2, PY(0) - 2, PX(0) - 8, 'x'); }
        else { br(PX(0) + 2, PX(x + b) - 2, PY(x - b) - 8, 'x + ' + b); bl(PY(x - b) + 2, PY(0) - 2, PX(0) - 8, 'x − ' + b); }
        bottomLines(c, p, [[`L-shape area: x² − ${b * b}`, pal.text], [rev > .97 ? `New rectangle: (x − ${b})(x + ${b})` : 'Slide the pieces to make one rectangle', rev > .97 ? pal.green : pal.muted]]);
        /* handle on the corner of the cut square */
        if (!V.locked && !V.fixed && rev < .01) { const hx = PX(x - b), hy = PY(x - b); LAY.hand = { d: [hx, hy] }; c.beginPath(); c.arc(hx, hy, 9, 0, TAU); c.fillStyle = pal.stage; c.fill(); c.lineWidth = 3; c.strokeStyle = pal.brass; c.stroke(); LAY.dsq = { ox, oy, u }; }
      };

      const drawStr = (c, p, V) => {
        const pal = p.pal, cs = STR[V.sc], N = cs.forms.length, last = V.locked ? 0 : Math.min(V.sf, N - 1);
        const top = 14, rowH = Math.min(72, (p.h - 54) / N), base = clamp(p.w / 19, 15, 24);
        const roles = new Set(); cs.forms.forEach(f => f.t.forEach(([, r]) => { if (r) roles.add(r); }));
        const col = r => (r === 'A' ? pal.blue : r === 'B' ? pal.red : r === 'AB' ? pal.violet : pal.text);
        for (let i = 0; i <= last; i++) {
          const f = cs.forms[i], yc = top + (i + .5) * rowH;
          if (i === last) { c.fillStyle = alpha(pal.violet, .12); c.fillRect(6, yc - rowH / 2 + 2, p.w - 12, rowH - 4); }
          text(c, f.lab, 14, yc - rowH * .3, { size: 12.5, color: pal.muted, align: 'left', weight: 500 });
          let fs = base; c.font = `600 ${fs}px ${FONT}`;
          const tw = f.t.reduce((s, [t]) => s + c.measureText(t).width, 0); if (tw > p.w - 28) fs = Math.max(12, fs * (p.w - 28) / tw);
          c.font = `600 ${fs}px ${FONT}`;
          const w2 = f.t.reduce((s, [t]) => s + c.measureText(t).width, 0); let X = (p.w - w2) / 2;
          f.t.forEach(([t, r]) => { c.fillStyle = col(r); c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(t, X, yc + 2); X += c.measureText(t).width; });
          text(c, `x = ${V.sv} gives ${f.f(V.sv)}`, p.w / 2, yc + rowH * .33, { size: 13, color: pal.muted, weight: 500 });
        }
        let lx = 14;
        [['A', 'A', pal.blue], ['B', 'B', pal.red], ['AB', 'the middle term 2AB', pal.violet]].forEach(([r, lab, cl]) => { if (!roles.has(r)) return; text(c, lab === r ? `${r} (colored)` : lab, lx, p.h - 16, { size: 13, color: cl, align: 'left' }); c.font = `600 13px ${FONT}`; lx += c.measureText(lab === r ? `${r} (colored)` : lab).width + 18; });
      };

      P.onDraw = (c, p) => {
        LAY.hand = null; const V = view();
        ({ mul: drawMul, fac: drawFac, cmb: drawCmb, gcf: drawGcf, dsq: drawDsq, str: drawStr })[V.mode](c, p, V);
      };

      /* ----- drag handles (width, height; the cut corner) ----- */
      draggable(P, {
        hit: (px, py) => {
          const H = LAY.hand; if (!H) return null;
          for (const k in H) if (Math.hypot(H[k][0] - px, H[k][1] - py) < 17) return k;
          return null;
        },
        move: (k, mx, my) => {
          const px = P.X(mx), py = P.Y(my), V = view(); cancel();
          if (k === 'd') { const D = LAY.dsq, m = (px - D.ox) / D.u, m2 = (D.oy - py) / D.u; st.db = clamp(Math.round(XD - Math.min(m, m2)), 1, 4); }
          else {
            const lim = V.mode === 'mul' ? 4 : 6, key = V.mode === 'mul' ? (k === 'w' ? 'a' : 'b') : (k === 'w' ? 'p' : 'q');
            const mag = k === 'w' ? Math.round((px - LAY.xr) / LAY.u) : Math.round((py - LAY.yr) / LAY.u);
            st[key] = clamp(mag, 0, lim) * (st[key] < 0 ? -1 : 1);
            if (mag < 0) st[key] = 0;
          }
          sync();
        }
      });

      /* ----- panel ----- */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const S = o => { const s = C.slider(o); s.inp = panel.lastElementChild.querySelector('input'); return s; };
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const addTo = (...els) => panel.append(...els);
      let selMode, predTitle, predQ, predRow, predFb, ro;
      let sA, sB, selT, sP, sQ, pairsT, selC, cBtns, selG, sGc, gxT, sDb, sRev, dBtns, selS, sBtns, sSv;
      let startBtn, ptally, pq, pch, pfb, pnext, pbuild, pSp, pSq, pSgc, pGx, pCheck;

      grp('mode', () => {
        C.title('Workshop');
        selMode = C.select({ label: 'Choose a workshop', options: MODES.map(m => ({ value: m[0], label: m[1] })), value: 'mul',
          onChange: v => { cancel(); st.mode = v; Object.assign(st, ENTER[v]); sync(); } });
      });
      grp('pred', () => {
        predTitle = h('p', { class: 'ctl-title' }, 'Predict first'); predQ = h('p', { class: 'hint' });
        predRow = h('div', { class: 'ctl buttons' }); predFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        addTo(predTitle, predQ, predRow, predFb);
      });
      let predSig = '';
      const renderPred = () => {
        const q = predFor(st);
        const sig = q ? q.key + (st.pd[q.key] ? '1' : '0') : '';
        if (sig === predSig) return; predSig = sig;
        predRow.replaceChildren(); predFb.innerHTML = '';
        if (!q) return;
        predQ.textContent = q.q;
        const done = st.pd[q.key], chosen = st.pc[q.key];
        q.opts.forEach((o, i) => {
          const b = mkBtn(o[0], () => {
            if (st.pd[q.key]) return;
            st.pd[q.key] = 1; st.pc[q.key] = i; sync();
          }, done && chosen === i);
          if (done) b.disabled = true; predRow.append(b);
        });
        if (done) predFb.innerHTML = (chosen === q.ans ? good('Right.') : bad('Not quite.')) + ' ' + q.opts[chosen][1].replace(/^(Not quite\.|Yes\.) /, '') + (chosen === q.ans ? '' : ` The answer is: ${q.opts[q.ans][0]}.`);
      };

      grp('mul', () => {
        sA = S({ label: 'Width', min: -4, max: 4, step: 1, value: 2, format: fac, onInput: v => { cancel(); st.a = v; sync(); } });
        sB = S({ label: 'Height', min: -4, max: 4, step: 1, value: 3, format: fac, onInput: v => { cancel(); st.b = v; sync(); } });
        C.hint('Drag the round handles, or use the sliders (the sliders also reach negative numbers).');
      });
      grp('fac', () => {
        selT = C.select({ label: 'Choose a trinomial', options: FAC.map((t, i) => ({ value: String(i), label: poly(1, t[0], t[1]) + (i === FAC.length - 1 ? ' (try it)' : '') })), value: '0', onChange: v => { cancel(); st.tg = +v; st.p = 1; st.q = 1; sync(); } });
        sP = S({ label: 'Width', min: -6, max: 6, step: 1, value: 1, format: fac, onInput: v => { cancel(); st.p = v; sync(); } });
        sQ = S({ label: 'Height', min: -6, max: 6, step: 1, value: 1, format: fac, onInput: v => { cancel(); st.q = v; sync(); } });
        pairsT = C.toggle({ label: 'List the pairs that multiply to the unit count', value: false, onChange: v => { st.pairs = v ? 1 : 0; sync(); } });
      });
      grp('cmb', () => {
        selC = C.select({ label: 'Choose two polynomials', options: CMB.map((c2, i) => ({ value: String(i), label: `(${poly(...c2.A)}) and (${poly(...c2.B)})` })), value: '0', onChange: v => { cancel(); Object.assign(st, { cm: +v, op: 'none', flip: 0, done: 0 }); sync(); } });
        cBtns = C.buttons([{ label: 'Add: A + B', onClick: () => { Object.assign(st, { op: 'add', flip: 0, done: 0 }); sync(); } }, { label: 'Subtract: A − B', onClick: () => { Object.assign(st, { op: 'sub', flip: 0, done: 0 }); sync(); } },
          { label: 'Flip every tile of B', onClick: () => { Object.assign(st, { flip: 1, done: 0 }); sync(); } }, { label: 'Combine like tiles', onClick: () => { st.done = 1; sync(); } }]);
      });
      grp('gcf', () => {
        selG = C.select({ label: 'Choose a polynomial', options: GC.map((t, i) => ({ value: String(i), label: poly(...t) })), value: '0', onChange: v => { cancel(); st.gi = +v; st.gc = 1; st.gx = 0; sync(); } });
        sGc = S({ label: 'Number in the factor', min: 1, max: 6, step: 1, value: 1, format: v => String(v), onInput: v => { st.gc = v; sync(); } });
        gxT = C.toggle({ label: 'Also take out x', value: false, onChange: v => { st.gx = v ? 1 : 0; sync(); } });
      });
      grp('dsq', () => {
        sDb = S({ label: 'Size of the cut corner', min: 1, max: 4, step: 1, value: 3, format: v => `${v} × ${v}`, onInput: v => { cancel(); st.db = v; st.rev = 0; sync(); } });
        sRev = S({ label: 'Slide the pieces', min: 0, max: 1, step: .05, value: 0, format: v => Math.round(v * 100) + '%', onInput: v => { cancel(); st.rev = v; sync(); } });
        dBtns = C.buttons([{ label: 'Rearrange', onClick: () => { cancel(); cancel = animateTo(st, { rev: 1 }, 1100, sync); } }, { label: 'Put back', onClick: () => { cancel(); cancel = animateTo(st, { rev: 0 }, 700, sync); } }]);
      });
      grp('str', () => {
        selS = C.select({ label: 'Choose an expression', options: STR.slice(0, STR_MENU).map((c2, i) => ({ value: String(i), label: c2.name })), value: '0', onChange: v => { cancel(); st.sc = +v; st.sf = 0; sync(); } });
        sBtns = C.buttons([{ label: 'Rewrite', primary: true, onClick: () => { st.sf = Math.min(st.sf + 1, STR[st.sc].forms.length - 1); sync(); } }, { label: 'Back one', onClick: () => { st.sf = Math.max(st.sf - 1, 0); sync(); } }]);
        sSv = S({ label: 'Test the value of x', min: -3, max: 5, step: 1, value: 3, format: v => 'x = ' + n(v), onInput: v => { st.sv = v; sync(); } });
      });
      grp('ro', () => { ro = C.readout(); });

      /* ----- readouts ----- */
      const roMul = V => {
        const a = V.a, b = V.b, Sm = a + b, Pr = a * b, L = [`${kk('Width')} ${fac(a)}, ${kk('Height')} ${fac(b)}`];
        if (V.locked) { L.push('Make your prediction first. Then the tiles and sliders unlock.'); return lines(L); }
        L.push(`${kk('Square')} x · x gives 1 x² tile`);
        L.push(`${kk('Strips')} x · ${par(a)} gives ${n(a)} and x · ${par(b)} gives ${n(b)}: ${n(a)} + ${par(b)} = ${n(Sm)} strips`);
        if (a * b < 0) L.push('One side is red and one is blue, so a blue strip and a red strip cancel in pairs.');
        L.push(`${kk('Corner')} ${n(a)} × ${par(b)} = ${n(Pr)} unit tiles` + (a < 0 && b < 0 ? ' (red times red is blue: positive)' : a * b < 0 ? ' (red times blue is red: negative)' : ''));
        L.push(`<b>Area = ${poly(1, Sm, Pr)}</b>`);
        return lines(L);
      };
      const roFac = V => {
        if (V.locked) return 'Make your prediction first. Then the tiles and sliders unlock.';
        const r = facCheck(V.t, V.p, V.q); return r.html + (V.pairs ? '<br><br>' + pairsText(V.t) : '');
      };
      const roCmb = V => {
        const cs = CMB[V.cm], sub = V.op === 'sub', flipped = sub && V.flip, Bs = flipped ? cs.B.map(v => -v) : cs.B, R = cs.A.map((v, i) => v + Bs[i]);
        const L = [`${kk('A')} ${poly(...cs.A)}`, `${kk('B')} ${poly(...cs.B)}`];
        if (V.op === 'none') { L.push('Choose Add or Subtract.'); return lines(L); }
        if (V.op === 'add') L.push('Adding: put the tiles of A and B together.');
        else if (!V.flip) L.push('Subtracting B means adding the OPPOSITE of B. Flip every tile of B first: blue becomes red and red becomes blue.');
        else L.push(`${kk('−B')} ${poly(...Bs)}. Now add A and −B.`);
        if (V.done) {
          ['x² tiles', 'x tiles', 'unit tiles'].forEach((nm, i) => {
            const a = cs.A[i], bb = Bs[i], zp = Math.min(Math.max(a, 0) + Math.max(bb, 0), Math.max(-a, 0) + Math.max(-bb, 0));
            L.push(`${kk(nm)} ${par(a)} + ${par(bb)} = ${n(R[i])}` + (zp ? ` (${zp} zero pair${zp > 1 ? 's' : ''} cancel)` : ''));
          });
          L.push(`<b>Result: ${poly(...R)}</b>`);
          if (sub && !flipped) L.push(bad('You did not flip B.') + ' This is A + B, not A − B. Press Flip, then combine again.');
        }
        return lines(L);
      };
      const roGcf = V => {
        const P0 = V.poly, info = gcfInfo(P0, V.gc, V.gx), f = (V.gc === 1 ? '' : V.gc) + (V.gx ? 'x' : '') || '1', L = [`${kk('Tiles')} ${poly(...P0)}`, `${kk('Factor')} ${f}`];
        if (!info.ok) { L.push(bad('Does not fit.') + ' ' + info.why); return lines(L); }
        L.push(`${kk('Each row')} ${info.qt}. Check: ${f} × (${info.qt}) = ${poly(...P0)}`);
        if (!info.draw) L.push('The tiles split evenly, but each row needs x² tiles, so the picture is not drawn.');
        L.push(info.full ? good('Fully factored.') + ` ${poly(...P0)} = ${info.f === '1' ? '' : info.f}(${info.qt}). Nothing common is left in the bracket.` : bad('Fits, but not finished.') + ' ' + info.more + ' Take out more.');
        return lines(L);
      };
      const roDsq = V => {
        const b = V.db, L = [`${kk('Big square')} x · x = x²`, `${kk('Cut corner')} ${b} × ${b} = ${b * b}, so the L-shape is x² − ${b * b}`, `${kk('Piece 1')} x by (x − ${b}). ${kk('Piece 2')} (x − ${b}) by ${b}.`];
        if (V.locked) { L.push('Make your prediction first. Then the controls unlock.'); return lines(L); }
        if (V.rev > .97) L.push(good('One rectangle.') + ` Piece 2 turned a quarter turn. Width x + ${b}, height x − ${b}. No area was added or lost, so x² − ${b * b} = (x − ${b})(x + ${b}).`,
          `With x drawn as ${XD}: ${XD * XD} − ${b * b} = ${XD * XD - b * b}, and (${XD} − ${b})(${XD} + ${b}) = ${XD - b} × ${XD + b} = ${(XD - b) * (XD + b)}.`);
        else L.push('Slide the pieces, or press Rearrange.');
        return lines(L);
      };
      const roStr = V => {
        const cs = STR[V.sc];
        if (V.locked) return `${kk('Expression')} ${cs.name}<br>Make your prediction first. Then the rewrite buttons unlock.`;
        const last = Math.min(V.sf, cs.forms.length - 1), vals = cs.forms.slice(0, last + 1).map(f => f.f(V.sv)), same = vals.every(v => v === vals[0]);
        return lines([`${kk(cs.forms[last].lab)} ${cs.forms[last].why}`, `${kk('Value at x = ' + n(V.sv))} ${vals.map(n).join(', ')}` + (last > 0 ? (same ? ' ' + good('all equal') : ' ' + bad('not equal')) : ''),
          last < cs.forms.length - 1 ? 'Press Rewrite for the next form.' : 'That is the last form.', last > 0 ? 'Equal values at one x are a good check, not a proof.' : ''].filter(Boolean));
      };

      /* ----- practice ----- */
      C.title('Practice');
      C.hint('Eight short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); if (st.practice) { st.practice = false; sync(); } else { st.practice = true; if (!prOver) loadProb(); sync(); } } }])[0];
      grp('practice', () => {
        ptally = h('p', { class: 'ctl-title' }); pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' }); pch = h('div', { class: 'ctl buttons' });
        addTo(ptally, pq, pch);
        grp('pfac', () => {
          pSp = S({ label: 'Width', min: -6, max: 6, step: 1, value: 1, format: fac, onInput: v => { st.p = v; pfb.innerHTML = ''; sync(); } });
          pSq = S({ label: 'Height', min: -6, max: 6, step: 1, value: 1, format: fac, onInput: v => { st.q = v; pfb.innerHTML = ''; sync(); } });
        });
        grp('pgcf', () => {
          pSgc = S({ label: 'Number in the factor', min: 1, max: 6, step: 1, value: 1, format: v => String(v), onInput: v => { st.gc = v; pfb.innerHTML = ''; sync(); } });
          pGx = C.toggle({ label: 'Also take out x', value: false, onChange: v => { st.gx = v ? 1 : 0; pfb.innerHTML = ''; sync(); } });
        });
        pCheck = C.buttons([{ label: 'Check my answer', primary: true, onClick: () => checkBuild() }])[0];
        pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); pnext = mkBtn('Next problem', () => nextProb(), true);
        addTo(pfb, h('div', { class: 'ctl buttons' }, pnext));
      });
      const tally = () => { ptally.textContent = `Problem ${prIdx + 1} of ${PROBS.length}. Right on the first try: ${prFirst} of ${prDone} done`; };
      const loadProb = () => {
        const pr = PROBS[prIdx]; prSolved = false; prTried = false;
        st.p = 1; st.q = 1; st.gc = 1; st.gx = 0;
        pq.textContent = pr.q; pfb.innerHTML = ''; pch.replaceChildren(); pnext.disabled = true; pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        if (pr.kind === 'choice') pr.ch.forEach((o, i) => pch.append(mkBtn(o[0], () => pickChoice(i))));
        tally();
      };
      const win = txt => { prSolved = true; if (!prTried) prFirst++; prDone++; pnext.disabled = false; pfb.innerHTML = good('Right.') + ' ' + txt; tally(); };
      const pickChoice = i => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        const btn = pch.children[i], txt = pr.ch[i][1];
        if (i === pr.ans) { Array.from(pch.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary'); win(txt); }
        else { prTried = true; btn.disabled = true; pfb.innerHTML = bad('Not quite.') + ' ' + txt + ' Try another answer.'; tally(); }
        sync();
      };
      const checkBuild = () => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        if (pr.kind === 'fac') {
          const r = facCheck(pr.t, st.p, st.q), good1 = pr.accept.some(([a, b]) => a === st.p && b === st.q);
          if (good1) win(r.html); else { prTried = true; pfb.innerHTML = r.fit ? r.html : r.html; tally(); }
        } else {
          const info = gcfInfo(pr.poly, st.gc, st.gx), f = (st.gc === 1 ? '' : st.gc) + (st.gx ? 'x' : '') || '1';
          if (!info.ok) { prTried = true; pfb.innerHTML = bad('Not yet.') + ' ' + info.why; tally(); }
          else if (!info.full) { prTried = true; pfb.innerHTML = bad('That fits, but it is not finished.') + ` ${f}(${info.qt}) is correct, but ${info.more.replace(/^Every/, 'every')} Take out more.`; tally(); }
          else win(`${poly(...pr.poly)} = ${info.f}(${info.qt}). Rows of height ${info.f} hold every tile, and nothing common is left in the bracket.`);
        }
        sync();
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); sync(); return; }
        prOver = true; pq.textContent = 'All eight problems are done.'; pch.replaceChildren(); pnext.disabled = true;
        pfb.innerHTML = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        pch.append(mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; prOver = false; loadProb(); sync(); }, true));
        ptally.textContent = `Right on the first try: ${prFirst} of ${PROBS.length}`; sync();
      };

      /* ----- sync ----- */
      const sync = () => {
        const prac = st.practice, V = view(), over = prac && prOver, m = st.mode, pr = prac && !over ? PROBS[prIdx] : null;
        ['mode', 'ro'].forEach(k => vis(G[k], !prac));
        vis(G.pred, !prac && !!predFor(st)); renderPred();
        ['mul', 'fac', 'cmb', 'gcf', 'dsq', 'str'].forEach(k => vis(G[k], !prac && m === k));
        vis(G.practice, prac); vis(G.pfac, !!pr && pr.kind === 'fac'); vis(G.pgcf, !!pr && pr.kind === 'gcf'); pCheck.style.display = pr && (pr.kind === 'fac' || pr.kind === 'gcf') ? '' : 'none';
        const lk = V.locked;
        selMode.value = m;
        sA.set(st.a); sB.set(st.b); sA.inp.disabled = lk; sB.inp.disabled = lk;
        selT.value = String(st.tg); sP.set(st.p); sQ.set(st.q); sP.inp.disabled = lk; sQ.inp.disabled = lk; pairsT.checked = !!st.pairs; pairsT.disabled = lk;
        selC.value = String(st.cm); cBtns[0].classList.toggle('primary', st.op === 'add'); cBtns[1].classList.toggle('primary', st.op === 'sub');
        cBtns[2].disabled = st.op !== 'sub'; cBtns[3].disabled = st.op === 'none'; cBtns[2].classList.toggle('primary', !!st.flip); cBtns[3].classList.toggle('primary', !!st.done);
        selG.value = String(st.gi); sGc.set(st.gc); gxT.checked = !!st.gx;
        sDb.set(st.db); sRev.set(st.rev); sDb.inp.disabled = lk; sRev.inp.disabled = lk; dBtns.forEach(b => { b.disabled = lk; });
        selS.value = String(st.sc); sSv.set(st.sv); sBtns.forEach(b => { b.disabled = lk; }); sSv.inp.disabled = lk;
        pSp.set(st.p); pSq.set(st.q); pSgc.set(st.gc); pGx.checked = !!st.gx;
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        if (!prac) ro.innerHTML = ({ mul: roMul, fac: roFac, cmb: roCmb, gcf: roGcf, dsq: roDsq, str: roStr })[m](V);
        P.draw();
      };

      const apply = (patch, immediate) => {
        cancel(); st.practice = false; st.pd = {}; st.pc = {}; predSig = '';
        const nums = {};
        for (const k in patch) { if (k === 'rev') nums[k] = patch[k]; else st[k] = patch[k]; }
        st.rev = 0; st.sf = patch.sf || 0;
        if (immediate) { Object.assign(st, nums); sync(); } else { sync(); cancel = animateTo(st, nums, 700, sync); }
      };
      sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
