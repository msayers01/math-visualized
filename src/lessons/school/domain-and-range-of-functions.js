/* =====================================================================
   SCHOOL — Domain and range of functions
   ===================================================================== */
{
  const INF = Infinity, MI = '−';
  const SANS = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
  const kk = t => `<span class="k">${t}</span>`;
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const par = v => (v < 0 ? `(${num(v)})` : num(v));
  const eqv = y => (Math.abs(+y.toFixed(2) - y) < 1e-9 ? '=' : '≈');
  const lines = a => a.filter(Boolean).join('<br>');

  /* ---------- sets of numbers: intervals (with open or closed ends) or a list of points ---------- */
  const I = (a, b, ac = true, bc = true) => ({ a, b, ac, bc });
  const ALL = { ivs: [I(-INF, INF, false, false)] };
  const endTxt = v => (v === INF ? '∞' : v === -INF ? '−∞' : num(v));
  const ivTxt = i => `${i.ac ? '[' : '('}${endTxt(i.a)}, ${endTxt(i.b)}${i.bc ? ']' : ')'}`;
  const setTxt = s => (s.pts ? '{' + s.txt + '}' : s.ivs.map(ivTxt).join(' ∪ '));
  const lst = (a, b, d) => { const r = []; for (let v = a; v <= b + 1e-9; v += d) r.push(v); return r; };
  const W_ = (x0, x1, y0, y1, sx = 1, sy = 1, xt = 1, yt = 1) => ({ x0, x1, y0, y1, sx, sy, xt, yt });
  const WM = { ...W_(-8, 8, -4, 6), nx: [-6, 6] };

  /* ---------- machines and formulas (activities 1 and 2) ---------- */
  const DEN = 'The bottom of the fraction is 0, and dividing by 0 has no answer. If a ÷ 0 were a number c, then c × 0 would have to equal a, but anything times 0 is 0.';
  const ROOT = 'A square root asks for a number that, multiplied by itself, gives the number inside. A number times itself is never negative, so the root of a negative number has no real answer.';
  const FN = {
    sq: { eq: 'f(x) = x²', f: x => x * x, dom: ALL, ran: { ivs: [I(0, INF, true, false)] },
      calc: x => ({ s: [`${par(x)}²`], y: x * x }),
      pq: { q: 'Predict first. Which input will make the machine for f(x) = x² fail?', ch: [
        ['x = 0', '0² = 0 × 0 = 0. That works.'],
        ['A negative number such as −3', '(−3)² = (−3) × (−3) = 9. A negative times a negative is positive, so it works.'],
        ['None: it accepts every number', 'A number times itself always gives an answer, so every input works.']], ans: 2 } },
    inv: { eq: 'f(x) = 1/x', f: x => 1 / x, dom: { ivs: [I(-INF, 0, false, false), I(0, INF, false, false)] }, ran: { ivs: [I(-INF, 0, false, false), I(0, INF, false, false)] },
      calc: x => (x === 0 ? { s: ['1 ÷ 0'], y: null, why: DEN, short: 'dividing by 0' } : { s: [`1 ÷ ${par(x)}`], y: 1 / x }),
      pq: { q: 'Predict first. Which input will make the machine for f(x) = 1/x fail?', ch: [
        ['A negative number such as −4', '1 ÷ (−4) = −0.25. Negative inputs work here.'],
        ['x = 0', '1 ÷ 0 has no answer. Zero cannot be a bottom of a fraction.'],
        ['None: it accepts every number', 'It does not: try x = 0.']], ans: 1 } },
    sqrt: { eq: 'f(x) = √x', f: x => Math.sqrt(x), dom: { ivs: [I(0, INF, true, false)] }, ran: { ivs: [I(0, INF, true, false)] },
      calc: x => (x < 0 ? { s: [`√${par(x)}`], y: null, why: ROOT, short: 'root of a negative' } : { s: [`√${num(x)}`], y: Math.sqrt(x) }),
      pq: { q: 'Predict first. Which input will make the machine for f(x) = √x fail?', ch: [
        ['x = 0', '√0 = 0, because 0 × 0 = 0. That works.'],
        ['x = 9', '√9 = 3, because 3 × 3 = 9. That works.'],
        ['A negative number such as −4', 'No number times itself gives −4. The root of a negative number has no real answer.']], ans: 2 } },
    rat3: { eq: 'f(x) = 1/(x − 3)', f: x => 1 / (x - 3), dom: { ivs: [I(-INF, 3, false, false), I(3, INF, false, false)] },
      calc: x => (x === 3 ? { s: ['1 ÷ (3 − 3)', '1 ÷ 0'], y: null, why: DEN, short: 'dividing by 0' } : { s: [`1 ÷ (${num(x)} − 3)`, `1 ÷ ${par(x - 3)}`], y: 1 / (x - 3) }) },
    sqrt2: { eq: 'f(x) = √(x − 2)', f: x => Math.sqrt(x - 2), dom: { ivs: [I(2, INF, true, false)] },
      calc: x => (x < 2 ? { s: [`√(${num(x)} − 2)`, `√${par(x - 2)}`], y: null, why: ROOT, short: 'root of a negative' } : { s: [`√(${num(x)} − 2)`, `√${num(x - 2)}`], y: Math.sqrt(x - 2) }) },
    comb: { eq: 'f(x) = √(x + 4) / (x − 1)', f: x => Math.sqrt(x + 4) / (x - 1), dom: { ivs: [I(-4, 1, true, false), I(1, INF, false, false)] },
      calc: x => {
        const s = [`√(${num(x)} + 4) ÷ (${num(x)} − 1)`, `√${par(x + 4)} ÷ ${par(x - 1)}`];
        if (x + 4 < 0) return { s, y: null, why: ROOT, short: 'root of a negative' };
        if (x === 1) return { s, y: null, why: DEN, short: 'dividing by 0' };
        return { s, y: Math.sqrt(x + 4) / (x - 1) };
      } },
    bell: { eq: 'f(x) = 1/(x² + 1)', f: x => 1 / (x * x + 1), dom: ALL,
      calc: x => ({ s: [`1 ÷ (${par(x)}² + 1)`, `1 ÷ ${num(x * x + 1)}`], y: 1 / (x * x + 1) }) }
  };
  const MACH = ['inv', 'sqrt', 'sq'];
  const FORMS = ['rat3', 'sqrt2', 'comb', 'bell'];
  const NAMES = { sq: 'f(x) = x²', inv: 'f(x) = 1/x', sqrt: 'f(x) = √x', rat3: 'f(x) = 1/(x − 3)', sqrt2: 'f(x) = √(x − 2)', comb: 'f(x) = √(x + 4) / (x − 1)', bell: 'f(x) = 1/(x² + 1)' };

  /* what breaks each formula (tap all that apply), and the domain choices */
  const FORM = {
    rat3: { sum: 'The bottom x − 3 is 0 only at x = 3, so only x = 3 is out. There is no root, so nothing else is a problem.',
      c: [['x = 3', true, 'The bottom x − 3 is 0 there, and dividing by 0 has no answer.'],
          ['x = −3', false, 'There the bottom is −3 − 3 = −6, and 1 ÷ (−6) works fine.'],
          ['every x less than 3', false, 'Negative bottoms are fine: x = 0 gives 1 ÷ (−3). Only a bottom of exactly 0 is a problem.'],
          ['nothing breaks it', false, 'x = 3 does.']],
      d: { q: 'Now write the domain. Which set of inputs does f(x) = 1/(x − 3) accept?', ch: [
        ['(−∞, ∞)', 'That forgets the problem at x = 3. At x = 3 the bottom is 0, so 3 must be left out.'],
        ['(3, ∞)', 'That throws away every x below 3, such as x = 0, where 1 ÷ (−3) works fine. Only 3 itself is a problem.'],
        ['(−∞, 3) ∪ (3, ∞)', 'Every number below 3 together with every number above 3. The round brackets at 3 mean 3 is left out, and the ∪ joins the two pieces.'],
        ['[3, ∞)', 'That is backwards: it keeps 3, the one input that fails, and throws away everything below.']], ans: 2 } },
    sqrt2: { sum: 'The inside x − 2 must be 0 or more, so x ≥ 2. At x = 2 the root is √0 = 0, which is fine, so 2 is included.',
      c: [['x = 2', false, 'There x − 2 = 0 and √0 = 0, which is a fine output. Only negative insides are a problem.'],
          ['every x less than 2', true, 'Then x − 2 is negative, and the root of a negative number has no real answer.'],
          ['a place where the bottom is 0', false, 'There is no fraction in this formula, so you never divide by 0.'],
          ['nothing breaks it', false, 'Inputs below 2 do: x = 1 gives √(−1).']],
      d: { q: 'Now write the domain. Which set of inputs does f(x) = √(x − 2) accept?', ch: [
        ['(2, ∞)', 'That leaves out 2, but f(2) = √0 = 0 is a perfectly good output. The endpoint is included, so it needs a square bracket.'],
        ['(−∞, 2]', 'That is backwards: it keeps the inputs below 2, which give roots of negative numbers.'],
        ['(−∞, ∞)', 'That forgets the root. Inputs below 2, such as x = 1, give √(−1).'],
        ['[2, ∞)', 'Every x with x − 2 ≥ 0. The square bracket means 2 is included, because √0 = 0.']], ans: 3 } },
    comb: { sum: 'The root needs x + 4 ≥ 0, so x ≥ −4. The bottom needs x − 1 ≠ 0, so x ≠ 1. Both rules hold at once.',
      c: [['every x less than −4', true, 'Then x + 4 is negative under the root.'],
          ['x = −4', false, 'There x + 4 = 0, so the top is √0 = 0, and the bottom is −5. That works.'],
          ['x = 1', true, 'The bottom x − 1 is 0 there.'],
          ['x = 4', false, 'The top is √8 and the bottom is 3. Both are fine.']],
      d: { q: 'Now write the domain. Which set of inputs does f(x) = √(x + 4) / (x − 1) accept?', ch: [
        ['[−4, ∞)', 'That forgets the bottom. At x = 1 the bottom is 0, so 1 must be left out.'],
        ['(−4, 1) ∪ (1, ∞)', 'That leaves out −4, but at x = −4 the top is √0 = 0 and the bottom is −5, so f(−4) = 0 works. Use a square bracket at −4.'],
        ['(−∞, 1) ∪ (1, ∞)', 'That forgets the root. Inputs below −4, such as x = −5, give √(−1).'],
        ['[−4, 1) ∪ (1, ∞)', 'The root keeps x ≥ −4 (included, square bracket). The bottom removes x = 1 (round brackets). ∪ joins the two pieces.']], ans: 3 } },
    bell: { sum: 'x² + 1 is always at least 1, so the bottom is never 0, and there is no root. Every number is allowed.',
      c: [['x = 0', false, 'There x² + 1 = 1, and 1 ÷ 1 = 1.'],
          ['x = 1 or x = −1', false, 'There x² + 1 = 2, and 1 ÷ 2 works.'],
          ['an x that makes the bottom 0', false, 'x² is never negative, so x² + 1 is at least 1. It is never 0.'],
          ['nothing breaks it', true, 'The bottom x² + 1 is always at least 1, and there is no root.']],
      d: { q: 'Now write the domain. Which set of inputs does f(x) = 1/(x² + 1) accept?', ch: [
        ['(−∞, 0) ∪ (0, ∞)', 'At x = 0 the bottom is 0² + 1 = 1, not 0. So 0 is allowed.'],
        ['[0, ∞)', 'Negative inputs work too: x = −2 gives 1 ÷ 5. There is no root to forbid them.'],
        ['(−∞, ∞)', 'Every number works, because the bottom x² + 1 is never 0.'],
        ['(−1, 1)', 'That is a made-up limit. x = 3 gives 1 ÷ 10, which is fine.']], ans: 2 } }
  };

  /* ---------- the family for activity 3: a movable key point (h, k) ---------- */
  const SHAPES = [['up', 'Opens up: (x − h)² + k'], ['down', 'Opens down: −(x − h)² + k'], ['abs', 'V shape: |x − h| + k'], ['root', 'Square root: √(x − h) + k'], ['recip', 'Reciprocal: 1/(x − h) + k'], ['line', 'A line: x + k'], ['const', 'A constant: k']];
  const addK = k => (k === 0 ? '' : k < 0 ? ` ${MI} ${-k}` : ` + ${k}`);
  const inner = h => (h === 0 ? 'x' : h > 0 ? `x ${MI} ${h}` : `x + ${-h}`);
  const shapeInfo = (sh, h, k) => {
    const sq = h === 0 ? 'x²' : `(${inner(h)})²`;
    const R = (a, b, ac, bc) => ({ ivs: [I(a, b, ac, bc)] });
    const r = {
      up: { f: x => (x - h) ** 2 + k, eq: `f(x) = ${sq}${addK(k)}`, dom: ALL, ran: R(k, INF, true, false), hp: [h, k],
        why: `A square is never negative, so f(x) is never below ${num(k)}. It equals ${num(k)} exactly at x = ${num(h)}, the vertex, and it rises without limit on both sides, so every height from ${num(k)} up is reached.` },
      down: { f: x => -((x - h) ** 2) + k, eq: `f(x) = −${sq}${addK(k)}`, dom: ALL, ran: R(-INF, k, false, true), hp: [h, k],
        why: `Minus a square is never positive, so f(x) is never above ${num(k)}. It equals ${num(k)} exactly at x = ${num(h)}, the vertex, and it falls without limit on both sides, so every height from ${num(k)} down is reached.` },
      abs: { f: x => Math.abs(x - h) + k, eq: `f(x) = |${inner(h)}|${addK(k)}`, dom: ALL, ran: R(k, INF, true, false), hp: [h, k],
        why: `|${inner(h)}| is never negative, so f(x) is never below ${num(k)}. It equals ${num(k)} exactly at x = ${num(h)}, the corner, and it rises without limit on both sides, so every height from ${num(k)} up is reached.` },
      root: { f: x => Math.sqrt(x - h) + k, eq: `f(x) = ${h === 0 ? '√x' : `√(${inner(h)})`}${addK(k)}`, dom: R(h, INF, true, false), ran: R(k, INF, true, false), hp: [h, k],
        why: `A square root is 0 or more, so f(x) is never below ${num(k)}. It needs x ≥ ${num(h)}, and it keeps growing, so every height from ${num(k)} up is reached.` },
      recip: { f: x => 1 / (x - h) + k, eq: `f(x) = 1/${h === 0 ? 'x' : `(${inner(h)})`}${addK(k)}`, dom: { ivs: [I(-INF, h, false, false), I(h, INF, false, false)] }, ran: { ivs: [I(-INF, k, false, false), I(k, INF, false, false)] }, hp: [h, k],
        why: `1/(${inner(h)}) is never 0, so f(x) never equals ${num(k)}. Every other height is reached. The input x = ${num(h)} is not allowed.` },
      line: { f: x => x + k, eq: `f(x) = x${addK(k)}`, dom: ALL, ran: ALL, hp: [0, k], kp: `y-intercept (0, ${num(k)})`,
        why: 'A line that is not flat keeps rising on one side and falling on the other, forever. It reaches every height.' },
      const: { f: () => k, eq: `f(x) = ${num(k)}`, dom: ALL, ran: { pts: [k], txt: num(k) }, hp: [2, k], kp: `height ${num(k)}`,
        why: `Every input gives the same output, ${num(k)}. So the range is the single number ${num(k)}, not an interval.` }
    }[sh];
    if (sh === 'recip') r.asym = [h, k];
    return r;
  };
  /* the range quiz for the current state: [label, explanation], and the right answer */
  const rangeQuiz = (sh, h, k) => {
    const info = shapeInfo(sh, h, k), right = setTxt(info.ran), nk = num(k), nh = num(h);
    let opts;
    if (sh === 'up' || sh === 'abs') opts = [
      [`[${nk}, ∞)`, `The lowest point is height ${nk}, and the graph rises forever. The vertex height is included, so the bracket is square.`],
      [`(−∞, ${nk}]`, `That is the range of the same shape upside down. Here the vertex is the lowest point, not the highest.`],
      [`(${nk}, ∞)`, `The vertex itself is on the graph at height ${nk}, so ${nk} is reached. It needs a square bracket.`],
      [`(−∞, ∞)`, `The graph never goes below ${nk}. Only the domain is every number.`]];
    else if (sh === 'down') opts = [
      [`(−∞, ${nk}]`, `The highest point is height ${nk}, and the graph falls forever. The vertex height is included, so the bracket is square.`],
      [`[${nk}, ∞)`, `That is the range of the same shape right side up. Here the vertex is the highest point.`],
      [`(−∞, ${nk})`, `The vertex is on the graph at height ${nk}, so ${nk} is reached. It needs a square bracket.`],
      [`(−∞, ∞)`, `The graph never goes above ${nk}. Only the domain is every number.`]];
    else if (sh === 'root') opts = [
      [`[${nk}, ∞)`, `The start of the curve is at height ${nk}, and it rises forever. The starting point is on the graph, so the bracket is square.`],
      [`[${nh}, ∞)`, `That reads the x-value of the start. The range is about heights, which are measured up the y-axis.`],
      [`(−∞, ∞)`, `The curve never goes below ${nk}.`],
      [`(${nk}, ∞)`, `The starting point (${nh}, ${nk}) is on the graph, so ${nk} is reached.`]];
    else if (sh === 'recip') opts = [
      [`(−∞, ∞)`, `The height ${nk} is never reached: the graph gets close to the line y = ${nk} but never touches it.`],
      [`(−∞, ${nk}) ∪ (${nk}, ∞)`, `Every height except ${nk}. The graph hugs the line y = ${nk} without touching it. The ∪ joins the part below and the part above.`],
      [`(−∞, ${nh}) ∪ (${nh}, ∞)`, `That is the domain: the input x = ${nh} is not allowed. The range is about heights, and the missing height is ${nk}.`],
      [`[${nk}, ∞)`, `The graph has branches both above and below the line y = ${nk}, so it is not just the heights above.`]];
    else if (sh === 'line') opts = [
      [`[${nk}, ∞)`, `The line goes down below ${nk} as well as up.`],
      [`(−∞, ∞)`, `A rising line reaches every height, both up and down.`],
      [`{${nk}}`, `That would be a flat line. This line rises, so its heights keep changing.`],
      [`(${nk}, ∞)`, `The line passes through (0, ${nk}) and keeps going below.`]];
    else opts = [
      [`{${nk}}`, `Every input gives ${nk}, so the only height reached is ${nk}. A single number, written with braces.`],
      [`(−∞, ∞)`, `That is the domain. The outputs are all the same number.`],
      [`[${nk}, ∞)`, `The graph does not rise above ${nk}. It is a flat line.`],
      [`(−∞, ${nk}]`, `The graph does not go below ${nk}. It is a flat line.`]];
    if (sh === 'root' && h === k) opts[1] = [`(−∞, ${nk}]`, 'That is for a curve that goes down. This curve starts at its key point and rises.'];
    if (sh === 'recip' && h === k) opts[2] = [`(${nk}, ∞)`, `The graph also goes below the line y = ${nk}, so it is not just the heights above.`];
    /* the right answer sits at a different place for different shapes */
    const rot = (SHAPES.findIndex(s => s[0] === sh) + (k + 4)) % 4, ai = opts.findIndex(o => o[0] === right);
    const ch = opts.slice(); const [ro] = ch.splice(ai, 1); ch.splice(rot, 0, ro);
    return { q: `The graph is ${info.eq}. What is its range, the set of heights it reaches?`, ch, ans: rot };
  };

  /* ---------- stories for activity 4 ---------- */
  const SC = {
    sq: { name: 'Area of a square', sl: 'Side x', eq: 'A(x) = x²', short: 'A square with side x', f: x => x * x, win: W_(-3, 7, -8, 50, 1, 9, 1, 10), xl: 'x', yl: 'A', xs: [-3, 7],
      ivs: [I(0, INF, false, false)], dom: { ivs: [I(0, INF, false, false)] }, ran: { ivs: [I(0, INF, false, false)] }, dots: null,
      valid: x => x > 0, why: x => (x < 0 ? 'A side length cannot be negative.' : 'A side of 0 makes no square at all.'), tag: 'side', unit: '',
      sub: x => `A(${num(x)}) = ${par(x)}² = ${num(x * x)}`,
      dq: { q: 'A side can have any length, so 2.5 and 0.1 are possible too. Which set of side lengths x is valid?', ch: [
        ['(−∞, ∞)', 'The formula x² accepts every number, but the story does not: a side length cannot be negative.'],
        ['[0, ∞)', 'A side of 0 gives no square at all, with area 0. So 0 is left out, and the bracket at 0 is round.'],
        ['(0, ∞)', 'Any positive length works, whole or not, so the domain is an interval. The round bracket at 0 leaves 0 out.'],
        ['{1, 2, 3, …}', 'A side can be 2.5 too. Lengths are not limited to whole numbers, so the graph is a curve, not dots.']], ans: 2 },
      vq: { q: 'A square has area 36. Solving x² = 36 gives x = 6 and x = −6. Which answers can be a side length?', ch: [
        ['Both 6 and −6', 'Both solve the equation, but a side cannot be −6. A solution of the equation can still be outside the domain of the story.'],
        ['6 only', 'x = −6 is outside the domain (0, ∞), so it is rejected. The side is 6, and 6 × 6 = 36.'],
        ['−6 only', 'A side length cannot be negative. The valid one is the positive solution, 6.'],
        ['Neither', '6 is a good side: 6² = 36.']], ans: 1 } },
    ball: { name: 'A thrown ball', sl: 'Time t (s)', eq: 'h(t) = 20t − 5t²', short: 'Height in m, t seconds after the throw', f: t => 20 * t - 5 * t * t, win: W_(-1, 5, -5, 25, 1, 7, 1, 5), xl: 't', yl: 'h', xs: [-1, 5],
      ivs: [I(0, 4, true, true)], dom: { ivs: [I(0, 4, true, true)] }, ran: { ivs: [I(0, 20, true, true)] }, dots: null,
      valid: t => t >= 0 && t <= 4, why: t => (t < 0 ? 'The ball has not been thrown yet.' : 'The ball has already landed. The formula would put it underground.'), tag: 'time', unit: '',
      sub: t => `h(${num(t)}) = 20(${num(t)}) ${MI} 5(${num(t)})² = ${num(20 * t - 5 * t * t)}`,
      dq: { q: 'The ball is on the ground at t = 0 (the throw) and again at t = 4 seconds (the landing), and both of those moments count. It is in the air at 0.5 seconds too. Which set of times t is valid?', ch: [
        ['[0, ∞)', 'After t = 4 the ball has landed. The formula keeps going, but the ball does not.'],
        ['[0, 4]', 'From the throw to the landing, with both ends included, since the ball is at height 0 at both. Time is continuous, so it is an interval.'],
        ['(−∞, ∞)', 'Negative times are before the throw. The formula accepts them, but the story does not.'],
        ['{0, 1, 2, 3, 4}', 'Time is continuous: the ball is in the air at 0.5 s as well. A list of whole seconds would be dots.']], ans: 1 },
      vq: { q: 'When is the ball 15 m high? Solving 20t − 5t² = 15 gives t = 1 and t = 3. (Check: 20 − 5 = 15 and 60 − 45 = 15.) Which are valid times?', ch: [
        ['t = 1 only', 'The ball is also 15 m high on the way down, at t = 3.'],
        ['t = 3 only', 'The ball is also 15 m high on the way up, at t = 1.'],
        ['Both t = 1 and t = 3', 'Both lie in the domain [0, 4]: once going up, once coming down. Not every solution is rejected. You must check each one.'],
        ['Neither', 'Both are between 0 and 4, so both are valid times.']], ans: 2 } },
    tick: { name: 'Theater tickets', sl: 'Tickets n', eq: 'C(n) = 4n', short: 'Cost in dollars of n tickets, 50 seats', f: n => 4 * n, win: W_(-5, 55, -40, 220, 5, 32, 10, 50), xl: 'n', yl: 'C', xs: [-5, 55],
      ivs: null, dom: { pts: lst(0, 50, 1), txt: '0, 1, 2, …, 50' }, ran: { pts: lst(0, 200, 4), txt: '0, 4, 8, …, 200' }, dots: lst(0, 50, 1).map(n => [n, 4 * n]),
      valid: n => Number.isInteger(n) && n >= 0 && n <= 50, why: n => (n < 0 ? 'You cannot sell a negative number of tickets.' : n > 50 ? 'There are only 50 seats.' : 'You cannot sell part of a ticket. Tickets are counted in whole numbers, so this input falls in a gap between the dots.'), tag: 'tickets', unit: '',
      sub: n => `C(${num(n)}) = 4 × ${par(n)} = ${num(4 * n)}`,
      dq: { q: 'A theater has 50 seats. Each ticket costs $4, and you can buy none at all. Which set of ticket counts n is valid?', ch: [
        ['[0, 50]', 'That includes 2.5 tickets. Tickets are counted, so the graph is separate dots, not a line.'],
        ['(0, 50)', 'That leaves out 0 and 50 and includes every fraction in between. Buying none, or filling the theater, is possible.'],
        ['{1, 2, 3, …, 50}', 'Buying 0 tickets is allowed: it costs $0. The list starts at 0.'],
        ['{0, 1, 2, …, 50}', 'A list of whole numbers from 0 to 50. Braces show a list, because the inputs are separate values, not an interval.']], ans: 3 },
      vq: { q: 'A group has exactly $90. Solving 4n = 90 gives n = 22.5. Is n = 22.5 a valid answer?', ch: [
        ['Yes: they buy 22.5 tickets', 'You cannot buy half a ticket. 22.5 is not in the domain {0, 1, …, 50}.'],
        ['No: n must be a whole number. They can buy 22 tickets, for $88', 'The formula gives 22.5, but only whole numbers are valid. Since 4 × 22 = 88 and 4 × 23 = 92, no count costs exactly $90.'],
        ['No: n must be less than 22', '22.5 is between 0 and 50. The problem is that it is not a whole number.'],
        ['Yes: round up to 23 tickets for $90', '23 tickets cost 4 × 23 = $92, not $90.']], ans: 1 } }
  };
  const SCK = ['sq', 'ball', 'tick'];

  /* ---------- practice problems: a fixed list. Each has one or more parts (stages). ---------- */
  const stg = (top, win, curves, dots, bar, q, ch, ans) => ({ top, win, curves, dots, bar, q, ch, ans });
  const WP = WM;
  const PROBS = [
    { name: 'Domain with a fraction', stages: [
      stg(['f(x) = 6 ÷ (x + 2)'], WP, [{ f: x => 6 / (x + 2), ivs: [I(-INF, -2, false, false), I(-2, INF, false, false)] }], null,
        { k: 'dom', set: { ivs: [I(-INF, -2, false, false), I(-2, INF, false, false)] } },
        'f(x) = 6 ÷ (x + 2). Find where the bottom is 0, then choose the domain.', [
          ['(−∞, ∞)', 'The bottom x + 2 is 0 when x = −2, and 6 ÷ 0 has no answer. So −2 must be left out.'],
          ['(−∞, −2) ∪ (−2, ∞)', 'Only x + 2 = 0 breaks it, and that is x = −2. Every other number is fine, so the domain is every number except −2.'],
          ['(−∞, 2) ∪ (2, ∞)', 'x + 2 = 0 gives x = −2, not 2. At x = 2 the bottom is 4, which is fine.'],
          ['(−2, ∞)', 'That throws away x = −5, where 6 ÷ (−3) = −2 works. Negative bottoms are fine. Only 0 is a problem.']], 1)] },
    { name: 'Domain with a root', stages: [
      stg(['f(x) = √(x + 5)'], W_(-7, 7, -3, 5), [{ f: x => Math.sqrt(x + 5), ivs: [I(-5, INF, true, false)] }], null,
        { k: 'dom', set: { ivs: [I(-5, INF, true, false)] } },
        'f(x) = √(x + 5). The inside must not be negative. Choose the domain.', [
          ['(−∞, ∞)', 'That forgets the root. At x = −6 the inside is −1, and √(−1) has no real answer.'],
          ['[5, ∞)', 'x + 5 ≥ 0 gives x ≥ −5, not 5. At x = 0 the root is √5, which works even though 0 is below 5.'],
          ['(−5, ∞)', 'At x = −5 the inside is 0 and f(−5) = √0 = 0, a good output. So −5 is included.'],
          ['[−5, ∞)', 'x + 5 ≥ 0 gives x ≥ −5. The square bracket includes −5, because √0 = 0.']], 3)] },
    { name: 'A root and a fraction', stages: [
      stg(['f(x) = √(x − 1) ÷ (x − 4)'], W_(-3, 9, -4, 6), [{ f: x => Math.sqrt(x - 1) / (x - 4), ivs: [I(1, 4, true, false), I(4, INF, false, false)] }], null,
        { k: 'dom', set: { ivs: [I(1, 4, true, false), I(4, INF, false, false)] } },
        'f(x) = √(x − 1) ÷ (x − 4). Two rules apply at once: the root and the bottom. Choose the domain.', [
          ['[1, 4) ∪ (4, ∞)', 'The root needs x − 1 ≥ 0, so x ≥ 1 (1 included, since √0 = 0). The bottom needs x ≠ 4. Both rules together give this set.'],
          ['[1, ∞)', 'That forgets the bottom. At x = 4 the bottom is 0, so 4 must be left out.'],
          ['(1, 4) ∪ (4, ∞)', 'That leaves out 1, but f(1) = √0 ÷ (−3) = 0 works. Use a square bracket at 1.'],
          ['(−∞, 4) ∪ (4, ∞)', 'That forgets the root. At x = 0 the inside is −1, and √(−1) has no real answer.']], 0)] },
    { name: 'Range of a quadratic', stages: [
      stg(['f(x) = x² − 3', 'Find the range'], W_(-5, 5, -5, 6), [{ f: x => x * x - 3 }], null,
        { k: 'ran', set: { ivs: [I(-3, INF, true, false)] } },
        'f(x) = x² − 3 is a parabola that opens up, with vertex (0, −3). What is the range?', [
          ['(−∞, −3]', 'That is for a parabola that opens down. This one opens up, so the vertex is the lowest point.'],
          ['[0, ∞)', 'x² alone is never below 0, but the −3 moves the whole graph down 3. The lowest height is −3.'],
          ['[−3, ∞)', 'The vertex (0, −3) is the lowest point and the graph rises forever. The vertex height is included, so the bracket is square.'],
          ['(−3, ∞)', 'The vertex is on the graph at height −3, so −3 is reached.']], 2),
      stg(['g(x) = 3 − x²', 'Find the range'], W_(-5, 5, -5, 6), [{ f: x => 3 - x * x }], null,
        { k: 'ran', set: { ivs: [I(-INF, 3, false, true)] } },
        'Now g(x) = 3 − x². The minus sign flips the parabola over, so it opens down, with vertex (0, 3). What is the range?', [
          ['[3, ∞)', 'That is for a parabola that opens up. This one opens down, so the vertex is the highest point.'],
          ['(−∞, ∞)', 'Only the domain is every number. The graph never goes above 3.'],
          ['(−∞, 3)', 'The vertex is on the graph at height 3 (g(0) = 3), so 3 is reached. Use a square bracket.'],
          ['(−∞, 3]', 'The vertex (0, 3) is the highest point and the graph falls forever. The vertex height is included.']], 3)] },
    { name: 'Read a graph', stages: [
      stg(['y = x² − 1, drawn from x = −1 to x = 3', 'closed dot at (−1, 0), open circle at (3, 8)'], W_(-3, 5, -3, 9, 1, 1.5, 1, 1), [{ f: x => x * x - 1, ivs: [I(-1, 3, true, false)] }], null,
        { k: 'dom', set: { ivs: [I(-1, 3, true, false)] } },
        'A graph is the curve y = x² − 1, drawn only from x = −1 to x = 3. There is a closed dot at (−1, 0) and an open circle at (3, 8). First, the domain, read along the x-axis.', [
          ['[−1, 3)', 'Closed at −1 (the dot is on the graph) and open at 3 (the circle is not). A square bracket on the left, a round one on the right.'],
          ['[−1, 3]', 'The circle at 3 is open, so 3 is not an input. The bracket at 3 must be round.'],
          ['(−1, 3)', 'The dot at −1 is closed, so −1 is an input. The bracket at −1 must be square.'],
          ['[0, 8)', 'Those are heights, read up the y-axis. The domain is about x-values along the bottom.']], 0),
      stg(['y = x² − 1, drawn from x = −1 to x = 3', 'lowest point (0, −1), open circle at (3, 8)'], W_(-3, 5, -3, 9, 1, 1.5, 1, 1), [{ f: x => x * x - 1, ivs: [I(-1, 3, true, false)] }], null,
        { k: 'ran', set: { ivs: [I(-1, 8, true, false)] } },
        'Now the range, read up the y-axis. The curve dips to its lowest point (0, −1), then climbs to the open circle at height 8. The left end is at height 0.', [
          ['[−1, 8]', 'The circle at (3, 8) is open, so height 8 is never reached. That end is round.'],
          ['[−1, 8)', 'The lowest height is −1, at the vertex, which is included. The top height 8 is an open circle, so it is left out.'],
          ['[0, 8)', 'The left end is at height 0, but the curve dips lower, to −1 at x = 0. Check the vertex, not just the ends.'],
          ['[−1, 3)', 'That mixes in the x-values. The range is about heights.']], 1)] },
    { name: 'Whole numbers or not', stages: [
      stg(['C(p) = 9p', 'Cost in dollars of p pizzas'], W_(-2, 14, -20, 130, 1, 18, 2, 20), [], lst(0, 12, 1).map(p => [p, 9 * p]), null,
        'A shop sells whole pizzas for $9 each. An order has at most 12 pizzas, and p can be 0. The cost is C(p) = 9p. Is the input p discrete (separate whole values) or continuous (any value in an interval)?', [
          ['Discrete: p counts whole pizzas, so the graph is separate dots', 'You cannot order 2.5 whole pizzas. The inputs are separate values, so the graph is dots.'],
          ['Continuous: p can be any number from 0 to 12', 'That would allow 2.5 pizzas. Pizzas are sold whole here, so the inputs are only the counting numbers.']], 0),
      stg(['C(p) = 9p', 'Cost in dollars of p pizzas'], W_(-2, 14, -20, 130, 1, 18, 2, 20), [], lst(0, 12, 1).map(p => [p, 9 * p]),
        { k: 'dom', set: { pts: lst(0, 12, 1), txt: '0, 1, 2, …, 12' } },
        'Now write the domain, the set of valid values of p.', [
          ['[0, 12]', 'That includes 2.5 and every other fraction. The inputs are whole numbers only.'],
          ['[0, ∞)', 'That has no upper limit and includes fractions. An order has at most 12 pizzas, and only whole ones.'],
          ['{0, 1, 2, …, 12}', 'A list of the whole numbers from 0 to 12. Braces show a list, because the inputs are separate values.'],
          ['{1, 2, …, 12}', 'The problem says p can be 0 (no order), and C(0) = 0. So the list starts at 0.']], 2)] },
    { name: 'Is the answer valid?', stages: [
      stg(['h(t) = 45 − 5t²', 'Height in m of a coin, t seconds after it is dropped'], W_(-4, 4, -10, 50, 1, 8, 1, 10),
        [{ f: t => 45 - 5 * t * t, faint: true }, { f: t => 45 - 5 * t * t, ivs: [I(0, 3, true, true)] }], [[3, 0, 'dot'], [-3, 0, 'cross']],
        { k: 'dom', set: { ivs: [I(0, 3, true, true)] } },
        'A coin is dropped from a roof 45 m up. Its height is h(t) = 45 − 5t², where t counts seconds from the moment it is dropped. Solving 45 − 5t² = 0 gives t² = 9, so t = 3 or t = −3. Which answers are valid times for the coin to hit the ground?', [
          ['Both 3 and −3', 'Both solve the equation, but t = −3 is 3 seconds before the coin was dropped. It is outside the domain of the story, so it is rejected.'],
          ['t = 3 only', 'The coin lands 3 seconds after the drop: h(3) = 45 − 45 = 0. The solution t = −3 is not in the story, so we reject it.'],
          ['t = −3 only', 'Negative time comes before the drop. The coin has not been dropped yet.'],
          ['Neither', 'At t = 3 the height is 45 − 5(9) = 0, so the coin is on the ground. That is a valid answer.']], 1)] },
    { name: 'Two traps', stages: [
      stg(['f(x) = √(x − 2)', 'A student says the domain is x > 2'], W_(-3, 9, -3, 5), [{ f: x => Math.sqrt(x - 2), ivs: [I(2, INF, true, false)] }], null,
        { k: 'dom', set: { ivs: [I(2, INF, true, false)] } },
        'A student says the domain of f(x) = √(x − 2) is x > 2, that is (2, ∞). Test the input x = 2: f(2) = √(2 − 2) = √0 = 0. What does that show?', [
          ['The student is right: 2 must be left out', 'f(2) = 0 is a real output, so 2 is not a problem. Only inputs below 2 are.'],
          ['The student is wrong: 2 is allowed, so the domain is [2, ∞)', 'The root of 0 is 0, a fine number, so the endpoint is included. Only negative insides fail. The graph starts at the closed dot (2, 0).'],
          ['The domain should be (−∞, 2]', 'That is backwards: x = 1 gives √(−1), which fails.'],
          ['The domain is every real number', 'x = 1 gives √(−1), which has no real answer.']], 1),
      stg(['g(x) = x²', 'A student says the range is all real numbers'], W_(-5, 5, -3, 7), [{ f: x => x * x }], null,
        { k: 'ran', set: { ivs: [I(0, INF, true, false)] } },
        'The same student says the range of g(x) = x² is all real numbers, because x can be any real number. Test it: can g(x) ever equal −4?', [
          ['Yes: x = −2 gives −4', '(−2)² = (−2) × (−2) = +4, not −4. A square is never negative.'],
          ['Yes: the domain and the range are always the same set', 'They are different sets here. The domain is every number, but the outputs are only 0 or more.'],
          ['No: squares are never negative, so the range is [0, ∞)', 'The domain is every number, but outputs are never negative. The lowest output is g(0) = 0, which is included.'],
          ['No: the range is (0, ∞)', 'g(0) = 0, so the output 0 is reached. Use a square bracket.']], 2)] }
  ];

  /* ---------- drawing helpers ---------- */
  const tx = (c, pal, s, x, y, { size = 14, color, align = 'center', weight = 500, halo = false } = {}) => {
    c.font = `${weight} ${size}px ${SANS}`; c.textAlign = align; c.textBaseline = 'middle';
    if (halo) { c.lineWidth = 4; c.strokeStyle = pal.stage; c.lineJoin = 'round'; c.strokeText(s, x, y); }
    c.fillStyle = color || pal.text; c.fillText(s, x, y);
  };
  const fitTx = (c, pal, s, x, y, maxW, size, o = {}) => {
    let sz = size; c.font = `${o.weight || 500} ${sz}px ${SANS}`;
    while (c.measureText(s).width > maxW && sz > 10.5) { sz -= .5; c.font = `${o.weight || 500} ${sz}px ${SANS}`; }
    tx(c, pal, s, x, y, { ...o, size: sz });
  };
  const rr = (c, x, y, w, hh, r) => {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + hh, r); c.arcTo(x + w, y + hh, x, y + hh, r);
    c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  const arrowPx = (c, x0, y0, x1, y1, col, wd = 2.5, dash) => {
    const a = Math.atan2(y1 - y0, x1 - x0), hl = 9;
    c.strokeStyle = col; c.fillStyle = col; c.lineWidth = wd; c.lineCap = 'round'; c.setLineDash(dash || []);
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 - Math.cos(a) * hl * .7, y1 - Math.sin(a) * hl * .7); c.stroke(); c.setLineDash([]);
    c.beginPath(); c.moveTo(x1, y1);
    c.lineTo(x1 - hl * Math.cos(a - .45), y1 - hl * Math.sin(a - .45)); c.lineTo(x1 - hl * Math.cos(a + .45), y1 - hl * Math.sin(a + .45));
    c.closePath(); c.fill();
  };
  const circ = (c, x, y, r, fill, stroke, lw) => {
    c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = fill; c.fill(); c.strokeStyle = stroke; c.lineWidth = lw; c.setLineDash([]); c.stroke();
  };

  /* a scene S: { win, curves:[{f, ivs, faint, color}], dots:[[x,y,kind]], dom, ran, mark, handle, asym, xl, yl } */
  const drawScene = (c, p, S) => {
    const pal = p.pal, W = p.w, H = p.h;
    let w = S.win;
    if (W < 620 && w.nx) w = { ...w, x0: w.nx[0], x1: w.nx[1] };      /* a narrower window on a phone */
    const fs = clamp(Math.min(W, H) * .04, 12.5, 15.5);
    const Lm = fs * 3.1, Rm = 20, Tm = 14, Bm = fs * 2.5 + 4;
    const wx = (w.x1 - w.x0) / w.sx; let wy = (w.y1 - w.y0) / w.sy;
    const sW = (W - Lm - Rm) / wx, sH = (H - Tm - Bm) / wy;
    if (sW < sH * .85) {   /* spare height: show more of the y-axis */
      const extra = Math.min(wy * .9, (H - Tm - Bm) / sW - wy);
      if (extra > 0) { w = { ...w, y0: w.y0 - extra / 2 * w.sy, y1: w.y1 + extra / 2 * w.sy }; wy += extra; }
    }
    const s = Math.max(4, Math.min(sW, (H - Tm - Bm) / wy));
    const pw = wx * s, ph = wy * s, px = Lm + (W - Lm - Rm - pw) / 2, py = Tm + (H - Tm - Bm - ph) / 2;
    p.span = Math.min(W, H) / (2 * s); p.cx = w.x0 / w.sx + (W / 2 - px) / s; p.cy = w.y1 / w.sy + (py - H / 2) / s;
    const X = x => p.X(x / w.sx), Y = y => p.Y(y / w.sy);
    const L = { px, py, pw, ph, s, X, Y, fs, w };
    S.lay = L;

    c.save(); c.beginPath(); c.rect(px, py, pw, ph); c.clip();
    c.lineWidth = 1; c.strokeStyle = pal.grid; c.beginPath();
    for (let v = Math.ceil(w.x0 / w.xt) * w.xt; v <= w.x1 + 1e-9; v += w.xt) { c.moveTo(X(v), py); c.lineTo(X(v), py + ph); }
    for (let v = Math.ceil(w.y0 / w.yt) * w.yt; v <= w.y1 + 1e-9; v += w.yt) { c.moveTo(px, Y(v)); c.lineTo(px + pw, Y(v)); }
    c.stroke();
    c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.8; c.beginPath();
    c.moveTo(px, Y(0)); c.lineTo(px + pw, Y(0)); c.moveTo(X(0), py); c.lineTo(X(0), py + ph); c.stroke();
    if (S.asym) {
      const col = alpha(pal.violet, .8);
      p.path([[S.asym[0] / w.sx, w.y0 / w.sy], [S.asym[0] / w.sx, w.y1 / w.sy]], { stroke: col, width: 2, dash: [7, 6] });
      p.path([[w.x0 / w.sx, S.asym[1] / w.sy], [w.x1 / w.sx, S.asym[1] / w.sy]], { stroke: col, width: 2, dash: [7, 6] });
    }
    (S.hl || []).forEach(v => p.path([[w.x0 / w.sx, v / w.sy], [w.x1 / w.sx, v / w.sy]], { stroke: alpha(pal.red, .45), width: 1.8, dash: [6, 6] }));
    const ends = [];
    (S.curves || []).forEach(cu => {
      const col = cu.faint ? alpha(pal.blue, .38) : pal.blue;
      (cu.ivs || ALL.ivs).forEach(iv => {
        const lo = Math.max(iv.a, w.x0), hi = Math.min(iv.b, w.x1); if (lo >= hi) return;
        const n = 320, pts = [];
        for (let i = 0; i <= n; i++) {
          let x = lo + (hi - lo) * i / n;
          if (i === 0 && lo === iv.a && !iv.ac) x += 1e-4;
          if (i === n && hi === iv.b && !iv.bc) x -= 1e-4;
          const y = cu.f(x); if (Number.isFinite(y)) pts.push([x / w.sx, clamp(y, -300, 300) / w.sy]);
        }
        p.path(pts, { stroke: col, width: cu.faint ? 2.4 : 3.6, dash: cu.faint ? [8, 7] : undefined });
        if (!cu.faint) [[iv.a, iv.ac], [iv.b, iv.bc]].forEach(([x, cl]) => {
          if (!Number.isFinite(x) || x < w.x0 || x > w.x1) return;
          const y = cu.f(x); if (Number.isFinite(y) && y >= w.y0 && y <= w.y1) ends.push([x, y, cl]);
        });
      });
    });
    c.restore();

    /* tick labels */
    const gx = Math.max(1, Math.ceil(30 / (w.xt / w.sx * s))) * w.xt, gy = Math.max(1, Math.ceil(24 / (w.yt / w.sy * s))) * w.yt;
    const tl = v => (v < 0 ? MI : '') + Math.abs(v);
    const mk = S.mark;
    for (let v = Math.ceil(w.x0 / gx) * gx; v <= w.x1 + 1e-9; v += gx)
      if (Math.abs(v) > 1e-9 && !(mk && Math.abs(v - mk.x) < gx * .45)) p.label(tl(v), v / w.sx, 0, { size: fs, italic: false, color: pal.muted, dy: 17 });
    for (let v = Math.ceil(w.y0 / gy) * gy; v <= w.y1 + 1e-9; v += gy)
      if (Math.abs(v) > 1e-9 && !(mk && mk.y != null && Math.abs(v - mk.y) < gy * .45)) p.label(tl(v), 0, v / w.sy, { size: fs, italic: false, color: pal.muted, dx: -12, align: 'right' });
    c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.strokeRect(px, py, pw, ph);
    tx(c, pal, S.xl || 'x', px + pw + 5, Y(0), { size: fs + 1.5, color: pal.muted, align: 'left', halo: true });
    tx(c, pal, S.yl || 'f(x)', X(0) + 9, py + fs * 1.1, { size: fs + 1.5, color: pal.muted, align: 'left', halo: true });

    /* the shadows on the axes: domain (green) on x, range (red) on y */
    const bar = (axis, set, col) => {
      const lo0 = axis === 'x' ? w.x0 : w.y0, hi0 = axis === 'x' ? w.x1 : w.y1;
      const pos = v => (axis === 'x' ? X(v) : Y(v)), fixed = axis === 'x' ? Y(0) : X(0);
      const pt = v => (axis === 'x' ? [pos(v), fixed] : [fixed, pos(v)]);
      if (set.pts) {
        set.pts.forEach(v => { if (v < lo0 || v > hi0) return; const [a, b] = pt(v); circ(c, a, b, set.pts.length > 20 ? 3.3 : 5.2, col, pal.stage, 1.4); });
      } else set.ivs.forEach(iv => {
        const lo = Math.max(iv.a, lo0), hi = Math.min(iv.b, hi0); if (lo > hi) return;
        let [x1, y1] = pt(lo), [x2, y2] = pt(hi);
        const inA = !iv.ac && Number.isFinite(iv.a) && iv.a >= lo0 ? 7 : 0, inB = !iv.bc && Number.isFinite(iv.b) && iv.b <= hi0 ? 7 : 0;   /* a visible gap at an open end */
        if (axis === 'x') { x1 += inA; x2 -= inB; } else { y1 -= inA; y2 += inB; }
        c.lineCap = 'butt'; c.strokeStyle = alpha(col, .78); c.lineWidth = 8; c.setLineDash([]); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
        const end = (v, cl, atHi) => {
          if (Number.isFinite(v) && v >= lo0 && v <= hi0) {
            const [a, b] = pt(v);
            if (cl) circ(c, a, b, 6.5, col, pal.stage, 2); else circ(c, a, b, 6.3, pal.stage, col, 3);
          } else if (!Number.isFinite(v)) {
            const [a, b] = pt(atHi ? hi : lo), d = (axis === 'x' ? 1 : -1) * (atHi ? 1 : -1);
            c.fillStyle = col; c.beginPath();
            if (axis === 'x') { c.moveTo(a + 10 * d, b); c.lineTo(a - 3 * d, b - 8); c.lineTo(a - 3 * d, b + 8); } else { c.moveTo(a, b - 10 * d); c.lineTo(a - 8, b + 3 * d); c.lineTo(a + 8, b + 3 * d); }
            c.closePath(); c.fill();
          }
        };
        end(iv.a, iv.ac, false); end(iv.b, iv.bc, true);
      });
    };
    if (S.dom) bar('x', S.dom, pal.green);
    if (S.ran) bar('y', S.ran, pal.red);
    {   /* legend under the plot: words as well as colors */
      const items = [];
      if (S.dom) items.push([pal.green, 'domain: inputs (x-axis)']);
      if (S.ran) items.push([pal.red, 'range: outputs (y-axis)']);
      if (items.length) {
        const f2 = Math.max(12, fs - 1.5); c.font = `600 ${f2}px ${SANS}`;
        const ws = items.map(it => c.measureText(it[1]).width + 22), tot = ws.reduce((a, b) => a + b, 0) + 14 * (items.length - 1);
        let lx = Math.max(4, W / 2 - tot / 2); const ly = py + ph + fs * 1.6 + 3;
        items.forEach((it, i) => {
          c.fillStyle = it[0]; c.fillRect(lx, ly - 4, 15, 8);
          tx(c, pal, it[1], lx + 20, ly, { size: f2, color: pal.text, align: 'left', weight: 600 });
          lx += ws[i] + 14;
        });
      }
    }

    ends.forEach(([x, y, cl]) => { if (cl) circ(c, X(x), Y(y), 5.5, pal.blue, pal.stage, 2); else circ(c, X(x), Y(y), 5.5, pal.stage, pal.blue, 2.6); });
    (S.dots || []).forEach(([x, y, kind]) => {
      if (kind === 'cross') {
        const a = X(x), b = Y(y), r = 6; c.strokeStyle = pal.red; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath();
        c.moveTo(a - r, b - r); c.lineTo(a + r, b + r); c.moveTo(a - r, b + r); c.lineTo(a + r, b - r); c.stroke();
      } else circ(c, X(x), Y(y), S.dots.length > 20 ? 3.4 : 5.6, pal.blue, pal.stage, 1.4);
    });

    /* the test input */
    if (mk) {
      const inY = mk.y != null && mk.y >= w.y0 && mk.y <= w.y1;
      c.save(); c.beginPath(); c.rect(px, py, pw, ph); c.clip();
      if (mk.y != null) {
        p.path([[mk.x / w.sx, 0], [mk.x / w.sx, mk.y / w.sy]], { stroke: alpha(pal.green, .95), width: 2.4, dash: [6, 5] });
        p.path([[mk.x / w.sx, mk.y / w.sy], [0, mk.y / w.sy]], { stroke: alpha(pal.red, .95), width: 2.4, dash: [6, 5] });
      }
      if (mk.bad) p.path([[mk.x / w.sx, w.y0 / w.sy], [mk.x / w.sx, w.y1 / w.sy]], { stroke: alpha(pal.red, .75), width: 2.6, dash: [8, 6] });
      c.restore();
      if (inY) {
        if (Math.abs(mk.y) > .2 * w.sy) circ(c, X(0), Y(mk.y), 5.2, pal.red, pal.stage, 1.8);
        circ(c, X(mk.x), Y(mk.y), 7.5, pal.yellow, pal.stage, 2.5);
        p.label(num(mk.y), 0, mk.y / w.sy, { size: fs + .5, italic: false, color: pal.red, dx: -12, align: 'right' });
      } else if (mk.y != null) {
        tx(c, pal, `${num(mk.y)} is ${mk.y > w.y1 ? 'above' : 'below'} the graph`, clamp(X(mk.x), px + 70, px + pw - 70), mk.y > w.y1 ? py + fs * 2.2 : py + ph - fs * 1.2, { size: fs, color: pal.red, halo: true, weight: 600 });
      }
      if (mk.bad) {
        const t = mk.badText || 'no output';
        c.font = `700 ${fs + 1}px ${SANS}`; const tw = c.measureText(t).width;
        tx(c, pal, t, clamp(X(mk.x), px + tw / 2 + 6, px + pw - tw / 2 - 6), py + fs * (Math.abs(X(mk.x) - X(0)) < 90 ? 5.4 : 3.4), { size: fs + 1, color: pal.red, weight: 700, halo: true });
      }
      circ(c, X(mk.x), Y(0), 8, pal.green, pal.brass, 3);
      p.label(num(mk.x), mk.x / w.sx, 0, { size: fs + .5, italic: false, color: pal.green, dy: 22 });
    }
    if (S.handle) {
      const [hx, hy] = S.handle;
      circ(c, X(hx), Y(hy), 9.5, pal.yellow, pal.brass, 3.5);
      const rightSide = X(hx) < px + pw * .65;
      tx(c, pal, S.hlab || `(${num(hx)}, ${num(hy)})`, X(hx) + (rightSide ? 15 : -15), Y(hy) + (Y(hy) < py + 30 ? 20 : -17), { size: fs + .5, align: rightSide ? 'left' : 'right', halo: true, weight: 600 });
    }
  };

  /* the top pane: a function machine, or a banner of text */
  const drawMachine = (c, p, eq, xv, res) => {
    const pal = p.pal, W = p.w, H = p.h;
    const bxW = clamp(W * .3, 120, 220), u = Math.min(clamp(W / 400, .8, 1.3), (W - 20 - bxW) / 228);
    const chW = 92 * u, chH = 36 * u, arr = 24 * u, bxH = 54 * u;
    const total = 2 * chW + 2 * arr + bxW, x0 = (W - total) / 2, xb = x0 + chW + arr, xo = xb + bxW + arr;
    const yM = clamp(H * .46, 48, 100), cap = Math.max(11.5, 12 * u), big = Math.max(13.5, 16 * u);
    for (const [t, cx] of [['input', x0 + chW / 2], ['rule', xb + bxW / 2], ['output', xo + chW / 2]]) tx(c, pal, t, cx, yM - 36 * u - 10, { size: cap, color: pal.muted, weight: 600 });
    const chip = (x, y, w, hh, col, label) => {
      rr(c, x, y - hh / 2, w, hh, 8 * u); c.fillStyle = alpha(col, .13); c.fill(); c.strokeStyle = col; c.lineWidth = 2.5; c.setLineDash([]); c.stroke();
      fitTx(c, pal, label, x + w / 2, y + 1, w - 8, big);
    };
    chip(x0, yM, chW, chH, pal.green, `x = ${num(xv)}`);
    rr(c, xb, yM - bxH / 2, bxW, bxH, 10 * u); c.fillStyle = alpha(pal.blue, .12); c.fill(); c.strokeStyle = pal.blue; c.lineWidth = 3; c.stroke();
    fitTx(c, pal, eq, xb + bxW / 2, yM + 1, bxW - 10, big * 1.05, { weight: 600 });
    arrowPx(c, x0 + chW + 3, yM, xb - 3, yM, pal.muted, 2.5);
    if (res.y == null) {
      arrowPx(c, xb + bxW + 3, yM, xo - 3, yM, pal.red, 2.5, [5, 5]);
      const mx = xb + bxW + arr / 2; c.strokeStyle = pal.red; c.lineWidth = 3.2; c.beginPath(); c.moveTo(mx - 6, yM - 6); c.lineTo(mx + 6, yM + 6); c.moveTo(mx - 6, yM + 6); c.lineTo(mx + 6, yM - 6); c.stroke();
      chip(xo, yM, chW, chH, pal.red, 'no output');
    } else {
      arrowPx(c, xb + bxW + 3, yM, xo - 3, yM, pal.red, 2.5);
      chip(xo, yM, chW, chH, pal.red, `f(${num(xv)}) = ${num(res.y)}`);
    }
    const cap2 = res.y == null ? `Not allowed: ${res.short}.` : `x = ${num(xv)} is accepted. It gives one output.`;
    fitTx(c, pal, cap2, W / 2, H - 16, W - 20, Math.max(12.5, 14 * u), { weight: 600, color: res.y == null ? pal.red : pal.text });
  };
  const drawBanner = (c, p, rows) => {
    const pal = p.pal, W = p.w, H = p.h, base = clamp(W / 26, 13, 19);
    const gap = base * 1.55, y0 = H / 2 - gap * (rows.length - 1) / 2;
    rows.forEach((r, i) => fitTx(c, pal, r.t, W / 2, y0 + gap * i, W - 24, base * (r.big ? 1.25 : 1), { weight: r.big ? 700 : 500, color: r.col || (r.big ? pal.text : pal.muted) }));
  };

  register({
    id: 'domain-and-range-of-functions', level: 'school',
    title: 'Domain and range of functions',
    blurb: 'Find which inputs a function accepts and which outputs it can make, from its formula, its graph and its story.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 2.2; p.cy = 2.2; p.span = 3.9;
      p.grid(1, { axes: false });
      p.path([[0, 0], [5, 0]], { stroke: pal.green, width: 6 });
      p.path([[0, 0], [0, 4.6]], { stroke: pal.red, width: 6 });
      const pts = []; for (let i = 0; i <= 60; i++) { const x = i / 60 * 5; pts.push([x, Math.sqrt(x) * 1.5]); }
      p.path(pts, { stroke: pal.blue, width: 3 });
      p.dot(0, 0, 5.5, pal.yellow, pal.stage, 2);
      p.dot(4, 3, 4.6, pal.yellow, pal.stage, 1.8);
    },
    hook: String.raw`A function is like a machine that accepts some numbers and refuses others. Can you tell which numbers it will refuse just by reading its formula, and which outputs it can ever make?`,
    steps: [
      { title: 'The inputs a machine accepts',
        text: String.raw`<p>This machine takes an input \(x\) and gives the output \(f(x)=1/x\). At \(x=2\) it gives \(0.5\).</p><p>Predict: which input will make it fail? Then test it with the slider or by dragging in the graph. Two bars then appear. The green one on the x-axis is the <b>domain</b>, the inputs it accepts. The red one on the y-axis is the <b>range</b>, the outputs it can make.</p>`,
        set: { mode: 'machine', mf: 'inv', x: 2 } },
      { title: 'Read the domain from the formula',
        text: String.raw`<p>Two things break a formula: dividing by \(0\), and taking the square root of a negative number.</p><p>For \(f(x)=\sqrt{x-2}\), the input \(x=1\) gives \(\sqrt{-1}\), which has no real answer. Tap what breaks this formula, check, then write the domain. Watch the endpoint: is the input where the root is exactly \(0\) allowed?</p>`,
        set: { mode: 'formula', ff: 'sqrt2', x: 1 } },
      { title: 'Read the range from the shape',
        text: String.raw`<p>Now the outputs. For \(f(x)=x^2+1\), the square \(x^2\) is never negative, so \(f(x)\) is never below \(1\). The lowest point is the vertex \((0,1)\).</p><p>Predict the range. Then drag the vertex ring, or use the sliders. Moving the vertex up or down moves the red range bar. Moving it sideways does not. Try the other shapes in the menu.</p>`,
        set: { mode: 'range', rs: 'up', h: 0, k: 1 } },
      { title: 'A story can allow fewer inputs',
        text: String.raw`<p>The area of a square with side \(x\) is \(A(x)=x^2\). At \(x=3\) the area is \(9\).</p><p>The formula also accepts \(x=-3\) and gives \(9\), but a square cannot have a negative side. Slide the input to \(-3\) and watch the story reject it. Then pick the domain, and decide which answers of an equation are valid.</p>`,
        set: { mode: 'context', cs: 'sq', cx: 3 } }
    ],
    formal: String.raw`
      <p>A function takes an input and gives exactly one output. The <em>domain</em> is the set of all inputs the function accepts. The <em>range</em> is the set of all outputs it can produce. On a graph, the domain is the shadow of the curve on the x-axis (the green bar in the lesson), and the range is its shadow on the y-axis (the red bar). Domain is about <em>x</em>-values and range is about <em>heights</em>.</p>
      <p>A quick reminder of the notation. \(\{x \mid x \ge 2\}\) means every \(x\) with \(x\ge 2\), which is the interval \([2,\infty)\). A square bracket means the end is included, a round bracket means it is left out, and \(\infty\) always gets a round bracket. The symbol \(\cup\) joins pieces, so \((-\infty,3)\cup(3,\infty)\) is every number except \(3\). A list of separate values uses braces, such as \(\{0,1,2,3\}\).</p>
      <h3>Two things that break a formula</h3>
      <p>Adding, subtracting, multiplying and squaring work for every real number. Only two things can fail.</p>
      <p><b>Dividing by zero.</b> Suppose \(a\div 0\) were a number \(c\). Then \(c\times 0\) would have to equal \(a\). But anything times \(0\) is \(0\), so this works only if \(a=0\), and then every \(c\) fits, so there is no single answer. Either way \(\div 0\) is not allowed.</p>
      <p><b>An even root of a negative number.</b> \(\sqrt{x}\) means the number \(r\ge 0\) with \(r^2=x\). Every real number squared is \(0\) or more, so \(r^2=x\) has no real solution when \(x&lt;0\). (Odd roots, such as the cube root, do accept negatives. This lesson uses square roots.)</p>
      <h3>Finding the domain from a formula</h3>
      <p>1. If there is a fraction, the bottom must not be \(0\). Solve bottom \(=0\) and remove those \(x\).<br>2. If there is a square root, the inside must be \(0\) or more. Solve inside \(\ge 0\).<br>3. Both rules must hold at once. Write the result in interval notation.</p>
      <p>Example: \(f(x)=\dfrac{\sqrt{x+4}}{x-1}\). The root needs \(x+4\ge 0\), so \(x\ge -4\). The bottom needs \(x-1\ne 0\), so \(x\ne 1\). The domain is
      \[ [-4,\,1)\cup(1,\,\infty). \]
      The endpoint \(-4\) is included, because \(\sqrt{0}=0\) is a fine output. This is the usual trap: write \(\ge\), not \(&gt;\), for a root. If the root is itself in the bottom, as in \(\dfrac{1}{\sqrt{x}}\), then \(0\) is out as well, because the bottom would be \(0\). The domain is \((0,\infty)\).</p>
      <h3>Finding the range</h3>
      <p>The range is every height \(y\) for which \(y=f(x)\) has a solution \(x\) in the domain. Take \(f(x)=x^2+1\). Since \(x^2\ge 0\), we get \(f(x)\ge 1\), and the height \(1\) is reached at \(x=0\). Every height above \(1\) is reached too: solving \(y=x^2+1\) gives \(x=\pm\sqrt{y-1}\), which exists whenever \(y-1\ge 0\). So the range is \([1,\infty)\), while the domain is every real number. They are different sets.</p>
      <p>Shapes to know, where \((h,k)\) is the key point:</p>
      <p>\((x-h)^2+k\) and \(|x-h|+k\): range \([k,\infty)\). \(\;-(x-h)^2+k\): range \((-\infty,k]\). \(\;\sqrt{x-h}+k\): domain \([h,\infty)\), range \([k,\infty)\). \(\;\dfrac{1}{x-h}+k\): domain every number except \(h\), range every number except \(k\). A line that is not flat: range every real number. A constant function \(f(x)=k\): range \(\{k\}\), a single number.</p>
      <p>The reciprocal \(1/x\) never reaches \(0\): solving \(y=1/x\) gives \(x=1/y\), which needs \(y\ne 0\). Sliding the key point sideways changes the domain of the root and reciprocal shapes but not their range. Sliding it up or down changes the range but not the domain.</p>
      <h3>Reading a graph</h3>
      <p>Read the domain along the x-axis and the range up the y-axis. A closed dot means the point is on the graph, so use a square bracket. An open circle means it is not, so use a round bracket. An arrow means the graph keeps going, so use \(\infty\). Check the vertex as well as the ends: the graph of \(y=x^2-1\) drawn for \(-1\le x&lt;3\) starts at height \(0\) but dips to \(-1\) at \(x=0\). Its domain is \([-1,3)\) and its range is \([-1,8)\), because \(3^2-1=8\) is an open circle.</p>
      <h3>Domain in a story</h3>
      <p>A formula may accept more numbers than the situation allows. The area of a square with side \(x\) is \(A(x)=x^2\). The formula accepts every number, but a side must be positive, so the domain of the story is \((0,\infty)\). A ball thrown up with height \(h(t)=20t-5t^2\) is in the air from \(t=0\) until it lands at \(t=4\), so the domain is \([0,4]\) and the range is \([0,20]\).</p>
      <p>Some inputs are counted. If \(n\) is the number of tickets sold, with 50 seats and each ticket costing \(\$4\), then \(C(n)=4n\) with \(n\in\{0,1,2,\dots,50\}\). The inputs are <em>discrete</em>: the graph is separate dots, the domain is a list, and the range is a list too, \(\{0,4,8,\dots,200\}\). When the input can be any value in an interval, like a length or a time, it is <em>continuous</em> and the graph is connected.</p>
      <h3>Valid answers</h3>
      <p>Solving an equation can give a number that the formula accepts but the story does not. A coin dropped from a roof 45 m high has height \(h(t)=45-5t^2\). Setting \(h(t)=0\) gives \(t^2=9\), so \(t=3\) or \(t=-3\). Time counts from the drop, so \(t=-3\) is outside the domain and we reject it. Likewise \(4n=90\) gives \(n=22.5\), which is not a whole number of tickets. Always check each solution against the domain of the situation.</p>
      <p>The next lesson, on piecewise and step functions, reads domain and range from graphs made of several pieces.</p>`,
    check: [
      { q: 'Which pair gives the domain and the range of f(x) = x²?',
        choices: ['Domain (−∞, ∞) and range (−∞, ∞)', 'Domain (−∞, ∞) and range [0, ∞)', 'Domain [0, ∞) and range [0, ∞)', 'Domain [0, ∞) and range (−∞, ∞)'], answer: 1,
        why: String.raw`Every real number can be squared, so the domain is \((-\infty,\infty)\). But a square is never negative, and \(0\) is reached at \(x=0\), so the outputs are exactly \([0,\infty)\). The domain and the range are different sets. Saying the range is all reals is the trap: it confuses the inputs with the outputs.`,
        hint: 'Can you square a negative number? Can a square ever come out negative?' },
      { q: 'What is the domain of f(x) = √(2x − 6) ÷ (x − 5)?',
        choices: ['[3, ∞)', '[−3, 5) ∪ (5, ∞)', '(3, 5) ∪ (5, ∞)', '[3, 5) ∪ (5, ∞)'], answer: 3,
        why: String.raw`The root needs \(2x-6\ge 0\), so \(2x\ge 6\) and \(x\ge 3\). At \(x=3\) the top is \(\sqrt{0}=0\) and the bottom is \(-2\), so \(3\) is included. The bottom needs \(x-5\ne 0\), so \(x\ne 5\). Together: \([3,5)\cup(5,\infty)\). \([3,\infty)\) forgets the bottom. \([-3,5)\cup(5,\infty)\) solves \(2x-6\ge 0\) wrongly. \((3,5)\cup(5,\infty)\) wrongly leaves out \(3\).`,
        hint: 'Solve 2x − 6 ≥ 0 for the root. Then find where x − 5 is 0. Is the endpoint of the root allowed?' },
      { q: 'Leo finds the domain of h(x) = √(x + 1) ÷ (x − 3).<br>Step 1. The root needs x + 1 ≥ 0, so x ≥ −1.<br>Step 2. The bottom needs x − 3 ≠ 0, so x ≠ 3.<br>Step 3. The domain is (−1, 3) ∪ (3, ∞).<br>Which statement is true?',
        choices: ['Nothing is wrong: x = −1 makes the root √0, and 0 has no square root.', 'Step 2 is wrong: the bottom is 0 when x = −3, not 3.', 'Step 3 is wrong: Step 1 allows x = −1, so the domain should start with a square bracket: [−1, 3) ∪ (3, ∞).', 'Step 3 is wrong: 3 should be included too.'], answer: 2,
        why: String.raw`Step 1 says \(x\ge -1\), so \(-1\) is allowed: \(\sqrt{0}=0\) is a fine number, and the bottom there is \(-4\), which is not \(0\). The domain must keep \(-1\): \([-1,3)\cup(3,\infty)\). Leo turned \(\ge\) into \(&gt;\) in Step 3. Step 2 is correct, since \(x-3=0\) gives \(x=3\), and \(3\) must stay out because the bottom would be \(0\).`,
        hint: 'Put x = −1 into the formula. Do you get a number? Then compare with the bracket Leo wrote at −1.' }
    ],
    links: { prereq: ['what-is-a-function', 'set-and-interval-notation'], next: ['piecewise-and-step-functions'], related: ['quadratics-and-the-parabola', 'functions-as-transformations', 'square-roots-and-irrational-numbers', 'absolute-value-equations-and-inequalities', 'exponential-growth', 'the-real-number-system'] },

    mount({ stage, controls: C }) {
      stage.classList.add('split');
      const topH = h('div', { class: 'pane', style: 'flex: 5 1 0' }), botH = h('div', { class: 'pane', style: 'flex: 14 1 0' });
      stage.append(topH, botH);
      const P1 = new Plane(topH), P2 = new Plane(botH);
      const panel = stage.nextElementSibling;
      const st = { mode: 'machine', mf: 'inv', ff: 'sqrt2', rs: 'up', cs: 'sq', x: 2, h: 0, k: 1, cx: 3, bars: true, showF: true, practice: false };
      const dn = {};            /* prompts that are finished, by key */
      let cancel = () => {}, lay = null;

      /* ----- panel helpers ----- */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const S = o => { const s = C.slider(o); s.inp = panel.lastElementChild.querySelector('input'); return s; };
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const addTo = (...els) => panel.append(...els);

      /* a question with explained choices */
      const mkQuiz = () => {
        const q = h('p', { class: 'hint' }), row = h('div', { class: 'ctl buttons' }), fb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        const o = { els: [q, row, fb], cfg: null, tried: false, done: false };
        const lock = () => Array.from(row.children).forEach(b => { b.disabled = true; });
        o.load = cfg => {
          o.cfg = cfg; o.tried = false; o.done = false; q.textContent = cfg.q; row.replaceChildren(); fb.innerHTML = '';
          cfg.ch.forEach((ch, i) => row.append(mkBtn(ch[0], () => o.pick(i))));
          if (cfg.key && dn[cfg.key]) { o.done = true; lock(); row.children[cfg.ans].classList.add('primary'); fb.innerHTML = good('Done.') + ' ' + cfg.ch[cfg.ans][1]; }
        };
        o.pick = i => {
          const cfg = o.cfg; if (!cfg || o.done) return;
          const right = i === cfg.ans, btn = row.children[i], txt = cfg.ch[i][1];
          if (cfg.lock) {
            o.done = true; lock(); btn.classList.add('primary'); if (cfg.key) dn[cfg.key] = true;
            fb.innerHTML = (right ? good('Yes.') : bad('Not quite.')) + ' ' + txt + (right ? '' : ' The answer is: ' + cfg.ch[cfg.ans][0] + '. ' + cfg.ch[cfg.ans][1]) + (cfg.after ? ' ' + cfg.after : '');
            sync(); return;
          }
          if (right) {
            o.done = true; lock(); btn.classList.add('primary'); if (cfg.key) dn[cfg.key] = true;
            fb.innerHTML = good('Right.') + ' ' + txt + (cfg.after ? ' ' + cfg.after : '');
            if (cfg.onDone) cfg.onDone(!o.tried);
          } else {
            o.tried = true; btn.disabled = true; fb.innerHTML = bad('Not quite.') + ' ' + txt + ' Try another answer.';
            if (cfg.onWrong) cfg.onWrong();
          }
          sync();
        };
        return o;
      };

      /* ----- the scenes ----- */
      const markFor = (F, x) => {
        const r = F.calc(x); return { x, y: r.y, bad: r.y == null, badText: r.y == null ? 'no output' : '' };
      };
      const gate = key => dn[key];     /* true once the prompt is answered */
      const sceneMach = () => {
        const F = FN[st.mf], open = gate('m:' + st.mf) || !F.pq, on = open && st.bars;
        return { win: WM, curves: [{ f: F.f, ivs: F.dom.ivs }], dom: on ? F.dom : null, ran: on ? F.ran : null, mark: markFor(F, st.x), xl: 'x', yl: 'f(x)' };
      };
      const sceneForm = () => {
        const F = FN[st.ff];
        return { win: WM, curves: [{ f: F.f, ivs: F.dom.ivs }], dom: gate('fb:' + st.ff) ? F.dom : null, mark: markFor(F, st.x), xl: 'x', yl: 'f(x)' };
      };
      const sceneRange = () => {
        const sh = shapeInfo(st.rs, st.h, st.k), on = gate('r');
        return { win: WM, curves: [{ f: sh.f, ivs: sh.dom.ivs }], dom: on ? sh.dom : null, ran: on ? sh.ran : null, handle: sh.hp, hlab: st.rs === 'const' ? `height ${num(st.k)}` : null, asym: sh.asym, xl: 'x', yl: 'f(x)' };
      };
      const sceneCtx = () => {
        const sc = SC[st.cs], v = sc.valid(st.cx), on = gate('cd:' + st.cs);
        const S0 = { win: sc.win, curves: [], dots: sc.dots, xl: sc.xl, yl: sc.yl, dom: on ? sc.dom : null, ran: on ? sc.ran : null,
          mark: { x: st.cx, y: v ? sc.f(st.cx) : null, bad: !v, badText: 'not allowed' } };
        if (st.showF) S0.curves.push({ f: sc.f, faint: true });
        if (sc.ivs) S0.curves.push({ f: sc.f, ivs: sc.ivs });
        if (!v && S0.mark.y == null) S0.mark.y = null;
        return S0;
      };
      const pStage = () => PROBS[pi].stages[pst];
      const scenePrac = () => {
        const g = pStage();
        return { win: g.win, curves: g.curves, dots: g.dots, dom: pSolved && g.bar && g.bar.k === 'dom' ? g.bar.set : null, ran: pSolved && g.bar && g.bar.k === 'ran' ? g.bar.set : null, xl: pi === 5 ? 'p' : pi === 6 ? 't' : 'x', yl: pi === 5 ? 'C' : pi === 6 ? 'h' : 'y' };
      };
      let cur = null;
      const curScene = () => {
        if (st.practice) return scenePrac();
        return { machine: sceneMach, formula: sceneForm, range: sceneRange, context: sceneCtx }[st.mode]();
      };

      P2.onDraw = (c, p) => { cur = curScene(); drawScene(c, p, cur); lay = cur.lay; };
      P1.onDraw = (c, p) => {
        if (st.practice) { drawBanner(c, p, pStage().top.map((t, i) => ({ t, big: i === 0 }))); return; }
        if (st.mode === 'machine' || st.mode === 'formula') {
          const key = st.mode === 'machine' ? st.mf : st.ff, F = FN[key], r = F.calc(st.x);
          drawMachine(c, p, F.eq, st.x, r); return;
        }
        if (st.mode === 'range') {
          const sh = shapeInfo(st.rs, st.h, st.k), on = gate('r');
          drawBanner(c, p, [{ t: sh.eq, big: true }, { t: `domain ${setTxt(sh.dom)}`, col: p.pal.green }, { t: on ? `range ${setTxt(sh.ran)}` : 'range: predict first', col: p.pal.red }]);
          return;
        }
        const sc = SC[st.cs], v = sc.valid(st.cx);
        drawBanner(c, p, [{ t: sc.eq, big: true }, { t: sc.short }, { t: `${sc.tag} ${num(st.cx)}: ${v ? 'allowed' : 'not allowed in the story'}`, col: v ? p.pal.green : p.pal.red }]);
      };

      /* ----- controls: activity menu ----- */
      let selMode, selMf, selFf, selRs, selCs, xS, hS, kS, barsT, fT;
      const cxS = {};
      let qPred, qDom, qRPred, qRan, qCD, qCV, qPr;
      let ro, rQ, rRow, rCheckRow, rFb, rSel = new Set(), rCheckBtn;
      let startBtn, ptally, pnext, pcont;

      grp('mode', () => {
        C.title('Activity');
        selMode = C.select({ label: 'Choose an activity', value: 'machine', onChange: v => { cancel(); st.mode = v; if (v === 'machine') st.x = clamp(snap(st.x, .5), -5, 5); enterMode(); sync(); },
          options: [['machine', '1. Test the inputs of a machine'], ['formula', '2. Domain from a formula'], ['range', '3. Range from the shape'], ['context', '4. Domain in a story']].map(([value, label]) => ({ value, label })) });
      });
      grp('mach', () => {
        selMf = C.select({ label: 'Choose a machine', value: 'inv', options: MACH.map(k => ({ value: k, label: NAMES[k] })), onChange: v => { cancel(); st.mf = v; loadMach(); sync(); } });
        qPred = mkQuiz(); addTo(...qPred.els);
      });
      grp('form', () => {
        selFf = C.select({ label: 'Choose a formula', value: 'sqrt2', options: FORMS.map(k => ({ value: k, label: NAMES[k] })), onChange: v => { cancel(); st.ff = v; loadForm(); sync(); } });
        rQ = h('p', { class: 'hint' }, 'Which inputs make this formula break? Tap every statement that applies, then check.');
        rRow = h('div', { class: 'ctl buttons' });
        rCheckRow = h('div', { class: 'ctl buttons' }); rCheckBtn = mkBtn('Check my choices', () => checkRestr(), true); rCheckRow.append(rCheckBtn);
        rFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        addTo(rQ, rRow, rCheckRow, rFb);
        qDom = mkQuiz(); addTo(...qDom.els);
      });
      grp('xs', () => {
        C.title('Test an input');
        xS = S({ label: 'Input x', min: -5, max: 5, step: .5, value: 2, format: v => num(v), onInput: v => { cancel(); st.x = v; sync(); } });
      });
      grp('bars', () => {
        barsT = C.toggle({ label: 'Show the domain and range bars', value: true, onChange: v => { st.bars = v; sync(); } });
      });
      grp('rng', () => {
        selRs = C.select({ label: 'Choose a shape', value: 'up', options: SHAPES.map(([value, label]) => ({ value, label })), onChange: v => { cancel(); st.rs = v; loadRan(); sync(); } });
        qRPred = mkQuiz(); addTo(...qRPred.els);
        C.title('Move the key point');
        hS = S({ label: 'Key point x (h)', min: -3, max: 3, step: 1, value: 0, format: v => num(v), onInput: v => { cancel(); st.h = v; loadRan(); sync(); } });
        kS = S({ label: 'Key point y (k)', min: -3, max: 4, step: 1, value: 1, format: v => num(v), onInput: v => { cancel(); st.k = v; loadRan(); sync(); } });
        qRan = mkQuiz(); addTo(...qRan.els);
      });
      grp('ctx', () => {
        selCs = C.select({ label: 'Choose a story', value: 'sq', options: SCK.map(k => ({ value: k, label: SC[k].name })), onChange: v => { cancel(); st.cs = v; st.cx = clamp(st.cx, SC[v].xs[0], SC[v].xs[1]); loadCtx(); sync(); } });
        SCK.forEach(k => {
          const sc = SC[k]; cxS[k] = S({ label: sc.sl, min: sc.xs[0], max: sc.xs[1], step: .5, value: 3, format: v => num(v), onInput: v => { cancel(); st.cx = v; sync(); } });
          cxS[k].box = cxS[k].inp.parentElement;
        });
        fT = C.toggle({ label: 'Show what the formula alone allows (dashed)', value: true, onChange: v => { st.showF = v; sync(); } });
        qCD = mkQuiz(); addTo(...qCD.els);
        qCV = mkQuiz(); addTo(...qCV.els);
      });
      grp('ro', () => { ro = C.readout(); });

      /* ----- loading prompts ----- */
      const loadMach = () => {
        const F = FN[st.mf];
        qPred.load({ key: 'm:' + st.mf, lock: true, q: F.pq.q, ch: F.pq.ch, ans: F.pq.ans, after: 'Now test it: use the slider or drag in the graph. The bars show the whole domain and range.' });
      };
      const loadForm = () => {
        const F = FORM[st.ff]; rSel = new Set(); rFb.innerHTML = '';
        rRow.replaceChildren();
        F.c.forEach(([lab, tr], i) => rRow.append(h('button', { type: 'button', class: 'btn', 'aria-pressed': 'false', onclick: ev => {
          if (gate('fa:' + st.ff)) return;
          if (rSel.has(i)) rSel.delete(i); else rSel.add(i);
          ev.currentTarget.classList.toggle('primary', rSel.has(i)); ev.currentTarget.setAttribute('aria-pressed', rSel.has(i) ? 'true' : 'false');
        } }, lab)));
        if (gate('fa:' + st.ff)) {
          F.c.forEach(([, tr], i) => { if (tr) { rSel.add(i); rRow.children[i].classList.add('primary'); } });
          Array.from(rRow.children).forEach(b => { b.disabled = true; }); rCheckBtn.disabled = true; rFb.innerHTML = good('Done.') + ' ' + F.sum;
        } else rCheckBtn.disabled = false;
        qDom.load({ key: 'fb:' + st.ff, q: F.d.q, ch: F.d.ch, ans: F.d.ans, after: 'The green bar on the graph shows the domain.' });
      };
      const checkRestr = () => {
        const F = FORM[st.ff];
        if (!rSel.size) { rFb.innerHTML = 'Tap at least one statement first.'; return; }
        const out = []; let ok = true;
        F.c.forEach(([lab, tr, why], i) => {
          const sel = rSel.has(i);
          if (sel && !tr) { ok = false; out.push(bad('Not a problem:') + ` "${lab}". ${why}`); }
          else if (!sel && tr) { ok = false; out.push(bad('Missed:') + ` "${lab}". ${why}`); }
        });
        if (ok) { dn['fa:' + st.ff] = true; loadForm(); sync(); return; }
        rFb.innerHTML = lines(out);
      };
      const loadRan = () => {
        const r = rangeQuiz(st.rs, st.h, st.k);
        qRan.load({ q: r.q, ch: r.ch, ans: r.ans, after: 'Watch the red bar match.' });
      };
      const loadCtx = () => {
        const sc = SC[st.cs];
        qCD.load({ key: 'cd:' + st.cs, q: sc.dq.q, ch: sc.dq.ch, ans: sc.dq.ans, after: 'The green marks show the domain, and the red marks show the range.' });
        qCV.load({ key: 'cv:' + st.cs, q: sc.vq.q, ch: sc.vq.ch, ans: sc.vq.ans });
      };
      const enterMode = () => {
        if (st.mode === 'machine') loadMach(); else if (st.mode === 'formula') loadForm(); else if (st.mode === 'range') { loadRPred(); loadRan(); } else loadCtx();
      };
      const loadRPred = () => {
        st.rs = 'up'; st.h = 0; st.k = 1; if (selRs) selRs.value = 'up'; if (hS && hS.set) hS.set(0); if (kS && kS.set) kS.set(1);
        qRPred.load({ key: 'r', lock: true, q: 'Predict first. The graph is f(x) = x² + 1, with vertex (0, 1). Which heights can it reach?', ch: [
          ['Every height, (−∞, ∞)', 'The domain is every number, but the heights are not: x² is never negative, so x² + 1 is never below 1.'],
          ['Every height from 0 up, [0, ∞)', 'The graph is the parabola x² moved up 1. Its lowest point is the vertex at height 1, not 0.'],
          ['Every height from 1 up, [1, ∞)', 'The vertex (0, 1) is the lowest point and the graph rises forever. 1 is reached, so the bracket is square.']], ans: 2,
          after: 'Now move the vertex. The red bar follows it.' });
      };

      /* ----- practice ----- */
      C.title('Practice');
      C.hint('Eight short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); st.practice = !st.practice; if (st.practice && !pOver) loadStage(); sync(); } }])[0];
      let pi = 0, pst = 0, pTried = false, pFirst = 0, pDone = 0, pOver = false, pSolved = false;
      grp('prac', () => {
        ptally = h('p', { class: 'ctl-title' });
        qPr = mkQuiz(); pnext = mkBtn('Next part', () => nextStage(), true); pnext.disabled = true;
        addTo(ptally, ...qPr.els, h('div', { class: 'ctl buttons' }, pnext));
      });
      const tally = () => {
        const n = PROBS[pi].stages.length;
        ptally.textContent = `Problem ${pi + 1} of ${PROBS.length}${n > 1 ? `, part ${pst + 1} of ${n}` : ''}. Right on the first try: ${pFirst} of ${pDone} done`;
      };
      const loadStage = () => {
        const g = pStage(); pSolved = false; pnext.disabled = true;
        const last = pst === PROBS[pi].stages.length - 1;
        pnext.textContent = !last ? 'Next part' : pi === PROBS.length - 1 ? 'Finish' : 'Next problem';
        qPr.load({ q: g.q, ch: g.ch, ans: g.ans,
          onWrong: () => { pTried = true; tally(); },
          onDone: () => { pSolved = true; pnext.disabled = false; if (last) { if (!pTried) pFirst++; pDone++; } tally(); } });
        tally();
      };
      const nextStage = () => {
        const n = PROBS[pi].stages.length;
        if (pst < n - 1) { pst++; loadStage(); sync(); return; }
        if (pi < PROBS.length - 1) { pi++; pst = 0; pTried = false; loadStage(); sync(); return; }
        pOver = true; pSolved = false; pnext.disabled = true;
        qPr.els[0].textContent = 'All eight problems are done.'; qPr.els[1].replaceChildren(); qPr.els[2].innerHTML = `You got ${pFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        qPr.els[1].append(mkBtn('Start over', () => { pi = 0; pst = 0; pFirst = 0; pDone = 0; pTried = false; pOver = false; loadStage(); sync(); }, true));
        ptally.textContent = `Right on the first try: ${pFirst} of ${PROBS.length}`; sync();
      };

      /* ----- readouts ----- */
      const rangeWhy = () => shapeInfo(st.rs, st.h, st.k).why;
      const readout = () => {
        const m = st.mode, L = [];
        if (m === 'machine' || m === 'formula') {
          const key = m === 'machine' ? st.mf : st.ff, F = FN[key], r = F.calc(st.x);
          L.push(`${kk('Rule')} ${F.eq}`, `${kk('Input')} x = ${num(st.x)}`);
          L.push(`${kk('Output')} f(${num(st.x)}) = ${r.s.join(' = ')}` + (r.y == null ? ': ' + bad('no output') : ` ${eqv(r.y)} <b>${num(r.y)}</b>`));
          if (r.y == null) L.push(r.why);
          else L.push(`${num(st.x)} is in the domain. It gives the point (${num(st.x)}, ${num(r.y)}).`);
          if (m === 'machine') {
            if (!gate('m:' + st.mf) && F.pq) L.push('Predict first. Then the slider, the bars and the toggle unlock.');
            else if (st.bars) L.push(`${kk('Domain')} ${setTxt(F.dom)}`, `${kk('Range')} ${setTxt(F.ran)}`);
          } else {
            if (gate('fb:' + st.ff)) L.push(`${kk('Domain')} ${setTxt(F.dom)}`);
            else if (!gate('fa:' + st.ff)) L.push('Test a few inputs, tap what breaks the formula, and check.');
          }
        } else if (m === 'range') {
          const sh = shapeInfo(st.rs, st.h, st.k);
          L.push(`${kk('Graph')} ${sh.eq}`, `${kk('Key point')} ${sh.kp || `(${num(sh.hp[0])}, ${num(sh.hp[1])})`}`);
          if (!gate('r')) L.push('Predict first. Then the handle, the sliders and the bars unlock.');
          else L.push(sh.why, `${kk('Domain')} ${setTxt(sh.dom)}`, `${kk('Range')} <b>${setTxt(sh.ran)}</b>`);
        } else {
          const sc = SC[st.cs], v = sc.valid(st.cx);
          L.push(`${kk('Story')} ${sc.short}`, `${kk('Formula')} ${sc.sub(st.cx)}`);
          L.push(v ? good('Allowed.') + ' This input is valid in the story, so the point is on the graph.' : bad('Not allowed.') + ' ' + sc.why(st.cx) + ' The formula can still compute a number, but the story cannot use it.');
          if (gate('cd:' + st.cs)) L.push(`${kk('Domain')} ${setTxt(sc.dom)}`, `${kk('Range')} ${setTxt(sc.ran)}`);
        }
        return lines(L);
      };

      /* ----- sync ----- */
      const sync = () => {
        const prac = st.practice, m = st.mode, mf = m === 'machine' || m === 'formula';
        vis(G.mode, !prac); vis(G.mach, !prac && m === 'machine'); vis(G.form, !prac && m === 'formula');
        vis(G.xs, !prac && mf); vis(G.bars, !prac && m === 'machine'); vis(G.rng, !prac && m === 'range'); vis(G.ctx, !prac && m === 'context');
        vis(G.ro, !prac); vis(G.prac, prac);
        if (!prac && m === 'formula') { vis(qDom.els, !!gate('fa:' + st.ff)); }
        if (!prac && m === 'context') vis(qCV.els, !!gate('cd:' + st.cs));
        if (!prac && m === 'range') { vis(qRan.els, !!gate('r')); }
        selMode.value = m; selMf.value = st.mf; selFf.value = st.ff; selRs.value = st.rs; selCs.value = st.cs;
        xS.set(st.x); hS.set(st.h); kS.set(st.k);
        SCK.forEach(k => { cxS[k].set(st.cx); if (!prac && m === 'context') cxS[k].box.style.display = k === st.cs ? '' : 'none'; });
        const lockM = m === 'machine' && FN[st.mf].pq && !gate('m:' + st.mf);
        xS.inp.disabled = lockM; barsT.disabled = lockM; barsT.checked = st.bars;
        const lockR = !gate('r');
        hS.inp.disabled = lockR || st.rs === 'line' || st.rs === 'const'; kS.inp.disabled = lockR;
        fT.checked = st.showF;
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        if (!prac) ro.innerHTML = readout();
        P1.draw(); P2.draw();
      };

      /* ----- dragging ----- */
      draggable(P2, {
        hit: (qx, qy) => {
          const L = lay; if (!L || st.practice) return null;
          const inside = qx >= L.px - 10 && qx <= L.px + L.pw + 10 && qy >= L.py - 10 && qy <= L.py + L.ph + 10;
          if (st.mode === 'range') {
            if (!gate('r')) return null;
            const hp = shapeInfo(st.rs, st.h, st.k).hp;
            return Math.hypot(L.X(hp[0]) - qx, L.Y(hp[1]) - qy) < 26 ? 'key' : null;
          }
          if (st.mode === 'machine' && FN[st.mf].pq && !gate('m:' + st.mf)) return null;
          return inside ? 'x' : null;
        },
        move: (hd, mx, my) => {
          cancel();
          const w = lay.w;
          if (hd === 'key') {
            if (st.rs !== 'line' && st.rs !== 'const') st.h = clamp(snap(mx, 1), -3, 3);
            st.k = clamp(snap(my, 1), -3, 4); loadRan();
          } else if (st.mode === 'context') st.cx = clamp(snap(mx * w.sx, .5), SC[st.cs].xs[0], SC[st.cs].xs[1]);
          else st.x = clamp(snap(mx, .5), -5, 5);
          sync();
        }
      });

      /* ----- steps ----- */
      const FLAGS = ['mode', 'mf', 'ff', 'rs', 'cs', 'h', 'k'];
      const apply = (patch, immediate) => {
        cancel(); st.practice = false;
        const nums = {};
        for (const k in patch) { if (FLAGS.includes(k)) st[k] = patch[k]; else nums[k] = patch[k]; }
        if (patch.mf) { delete dn['m:' + patch.mf]; st.bars = true; }
        if (patch.ff) { delete dn['fa:' + patch.ff]; delete dn['fb:' + patch.ff]; }
        if (patch.mode === 'range') { delete dn.r; }
        if (patch.cs) { delete dn['cd:' + patch.cs]; delete dn['cv:' + patch.cs]; st.showF = true; }
        enterMode();
        if (immediate) { Object.assign(st, nums); sync(); } else { sync(); cancel = animateTo(st, nums, 700, sync); }
      };
      enterMode(); sync();
      return { destroy: () => { cancel(); P1.destroy(); P2.destroy(); }, apply };
    }
  });
}
