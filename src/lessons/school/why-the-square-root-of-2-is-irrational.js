/* =====================================================================
   SCHOOL (Enrichment) — Why the square root of 2 is irrational
   ===================================================================== */
{
  const MI = '−';
  const FONT = '"Hanken Grotesk","Helvetica Neue",Arial,sans-serif';
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;
  const lines = a => a.filter(Boolean).join('<br>');
  const S2 = Math.SQRT2;
  const sgn = v => (v < 0 ? MI + Math.abs(v) : String(v));

  /* ruler q (the side is q units): nearest whole number p of units, the gap left over, and p^2 - 2q^2 */
  const meas = q => { const D = q * S2, p = Math.round(D); return { q, D, p, gap: Math.abs(D - p), d: p * p - 2 * q * q }; };
  const BEST = [1, 2, 5, 12, 29, 70];

  /* ---------- drawing helpers ---------- */
  const T = (c, s, x, y, o = {}) => {
    c.font = `${o.weight || 500} ${o.size || 14}px ${FONT}`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
    if (o.halo) { c.lineWidth = 4; c.strokeStyle = o.halo; c.lineJoin = 'round'; c.strokeText(s, x, y); }
    c.fillStyle = o.color; c.fillText(s, x, y);
  };
  const rr = (c, x, y, w, hh, r) => {
    r = Math.min(r, w / 2, hh / 2); c.beginPath(); c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + hh, r); c.arcTo(x + w, y + hh, x, y + hh, r); c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  const wid = (c, s, size, weight = 500) => { c.font = `${weight} ${size}px ${FONT}`; return c.measureText(s).width; };
  const COL = (pal, k) => ({ v: pal.violet, b: pal.blue, y: pal.yellow, r: pal.red, g: pal.green }[k]);

  /* a stack of proof cards: [text, reason, colour key]. `shown` cards are filled, the rest are dashed placeholders. */
  const ladder = (c, pal, cards, shown, R, o = {}) => {
    const n = cards.length, gap = 8, ch = Math.min(o.maxH || 70, (R.h - gap * (n - 1)) / n), y0 = R.y + (R.h - (ch * n + gap * (n - 1))) / 2;
    const fs = clamp(ch * .34, 12, 19), fs2 = clamp(fs * .8, 12, 15);
    cards.forEach((cd, i) => {
      const y = y0 + i * (ch + gap), col = COL(pal, cd[2]);
      if (i >= shown) {
        c.setLineDash([5, 5]); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.2; rr(c, R.x + .5, y + .5, R.w - 1, ch - 1, 7); c.stroke(); c.setLineDash([]);
        T(c, String(i + 1), R.x + 15, y + ch / 2, { size: fs, color: pal.muted });
        return;
      }
      const last = i === shown - 1;
      rr(c, R.x, y, R.w, ch, 7); c.fillStyle = alpha(col, last ? .22 : .12); c.fill();
      c.strokeStyle = alpha(col, last ? .95 : .55); c.lineWidth = last ? 2.4 : 1.3; c.stroke();
      c.fillStyle = col; c.fillRect(R.x + 1, y + 5, 5, ch - 10);
      const tw = wid(c, cd[0], fs, 600), ww = wid(c, cd[1], fs2);
      const tx = R.x + 16;
      if (!o.noWhy && tw + ww + 40 <= R.w) {
        T(c, cd[0], tx, y + ch / 2, { size: fs, color: pal.text, align: 'left', weight: 600 });
        T(c, cd[1], R.x + R.w - 10, y + ch / 2, { size: fs2, color: pal.muted, align: 'right' });
      } else if (!o.noWhy && ch >= fs + fs2 + 12) {
        T(c, cd[0], tx, y + ch / 2 - fs2 * .62, { size: fs, color: pal.text, align: 'left', weight: 600 });
        T(c, cd[1], tx, y + ch / 2 + fs * .66, { size: fs2, color: pal.muted, align: 'left' });
      } else T(c, cd[0], tx, y + ch / 2, { size: fs, color: pal.text, align: 'left', weight: 600 });
    });
  };

  /* tiles 1 to 30: perfect squares are yellow, the others blue. `ring` lists the numbers to outline. */
  const SQS = [1, 4, 9, 16, 25];
  const tiles = (c, pal, R, ring, sel) => {
    const cols = 6, rows = 5, gap = 4, tw = (R.w - gap * (cols - 1)) / cols, th = Math.min(tw * .78, (R.h - 34 - gap * (rows - 1)) / rows);
    const fs = clamp(th * .5, 12, 17);
    for (let n = 1; n <= 30; n++) {
      const i = n - 1, x = R.x + (i % cols) * (tw + gap), y = R.y + Math.floor(i / cols) * (th + gap), sq = SQS.includes(n);
      rr(c, x, y, tw, th, 5); c.fillStyle = alpha(sq ? pal.yellow : pal.blue, sq ? .38 : .14); c.fill();
      c.strokeStyle = alpha(sq ? pal.yellow : pal.blue, .8); c.lineWidth = 1; c.stroke();
      T(c, String(n), x + tw / 2, y + th / 2, { size: fs, color: pal.text, weight: sq ? 700 : 500 });
      if (ring.includes(n) || n === sel) { rr(c, x - 1.5, y - 1.5, tw + 3, th + 3, 6); c.strokeStyle = pal.text; c.lineWidth = n === sel ? 3 : 2; c.stroke(); }
    }
    const ly = R.y + rows * (th + gap) + 4, fl = clamp(R.w / 24, 12, 13.5);
    c.fillStyle = alpha(pal.yellow, .5); c.fillRect(R.x, ly + 2, 12, 12); c.fillStyle = alpha(pal.blue, .3); c.fillRect(R.x, ly + 20, 12, 12);
    T(c, 'perfect square: the root is a whole number', R.x + 18, ly + 8, { size: fl, color: pal.text, align: 'left' });
    T(c, 'not a perfect square: the root is irrational', R.x + 18, ly + 26, { size: fl, color: pal.text, align: 'left' });
  };

  /* four odd squares as dot squares, with a table under each */
  const lemma = (c, pal, R, seen, alg) => {
    const ns = [1, 3, 5, 7], colW = R.w / 4, cell = Math.min(colW * .84 / 7, (R.h - 150) / 7), fs0 = clamp(colW / 7.4, 12, 15);
    const need = 7 * cell + 22 + fs0 * 4.6 + 6 + 28 + fs0 * 3.4, top = R.y + Math.max(6, (R.h - need) / 2);
    ns.forEach((n, i) => {
      const cx = R.x + colW * (i + .5), x0 = cx - cell * n / 2, y0 = top + (7 - n) * cell;
      const on = seen.includes(n);
      if (!on) {
        c.setLineDash([4, 4]); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.2; c.strokeRect(x0, y0, cell * n, cell * n); c.setLineDash([]);
        T(c, '?', cx, y0 + cell * n / 2, { size: clamp(cell * 1.2, 14, 22), color: pal.muted });
      } else {
        for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
          const mid = a === (n - 1) / 2 && b === (n - 1) / 2;
          c.beginPath(); c.arc(x0 + (b + .5) * cell, y0 + (a + .5) * cell, mid ? cell * .38 : cell * .27, 0, TAU);
          c.fillStyle = mid ? pal.yellow : alpha(pal.blue, .85); c.fill();
          if (mid) { c.strokeStyle = pal.text; c.lineWidth = 1.4; c.stroke(); }
        }
      }
      const ty = top + 7 * cell + 22, fs = clamp(colW / 7.4, 12, 15);
      T(c, `n = ${n}`, cx, ty, { size: fs, color: pal.muted });
      if (on) {
        T(c, `n² = ${n * n}`, cx, ty + fs * 1.5, { size: fs, color: pal.text, weight: 700 });
        T(c, `= 2×${(n * n - 1) / 2} + 1`, cx, ty + fs * 3, { size: fs, color: pal.green, weight: 600 });
      }
    });
    const by = top + 7 * cell + 22 + clamp(colW / 7.4, 12, 15) * 4.6 + 6;
    T(c, 'yellow dot: the one left over when the dots are paired up', R.x + R.w / 2, by, { size: clamp(R.w / 27, 12, 13.5), color: pal.muted });
    const fa = clamp(R.w / 24, 12, 15.5);
    if (alg >= 1) T(c, '(2k+1)² = 4k² + 4k + 1', R.x + R.w / 2, by + 28, { size: fa, color: pal.text, weight: 700 });
    if (alg >= 2) T(c, '= 2(2k² + 2k) + 1: 2 × whole number + 1', R.x + R.w / 2, by + 28 + fa * 1.7, { size: fa, color: pal.green, weight: 700 });
  };

  /* ---------- data ---------- */
  /* the tiny example: no whole number is both even and odd */
  const EXL = [
    ['Assume n is even AND odd', 'the opposite of the claim', 'v'],
    ['n = 2a and n = 2b + 1', 'what even and odd mean', 'b'],
    ['2(a − b) = 1', 'from 2a = 2b + 1', 'b'],
    ['a − b = ½: not whole', 'impossible!', 'r'],
    ['No number is both', 'the assumption fails', 'g']
  ];
  /* the main proof */
  const ML = [
    ['√2 = p/q, lowest terms', 'assume the opposite', 'v'],
    ['p² = 2q²', 'square both sides', 'b'],
    ['p² is even', '2 × a whole number', 'b'],
    ['p is even', 'odd² is odd', 'y'],
    ['p = 2m, so q² = 2m²', '4m² = 2q², halve it', 'b'],
    ['q is even too', 'q² = 2m² is even', 'y'],
    ['p and q both even', 'not lowest terms!', 'r'],
    ['√2 is not a fraction', 'the assumption fails', 'g']
  ];
  const A = (label, fb) => [label, fb];
  const PF = [
    { view: 'ex', n0: 3, n1: 4, title: 'A tiny example first',
      q: 'Claim: no whole number is both even and odd. Proof by contradiction means we assume the OPPOSITE and show it breaks something. So assume n = 2a (even) and n = 2b + 1 (odd) for whole numbers a and b. Then 2a = 2b + 1, so 2(a − b) = 1. What is impossible here?',
      opts: [A('a − b would be ½, but a − b is a whole number', ok('Yes.') + ' Two times a whole number is never 1. The assumption led to something impossible.'),
             A('a would have to equal b', 'If a = b, then 2(a − b) = 0, not 1. Nothing forces a = b. Look at a − b instead.'),
             A('n would have to be 0', 'n = 0 is even but not odd, so it does not help. We are showing that NO number can be both.')], ans: 0 },
    { view: 'ex', n0: 4, n1: 5, title: 'What a contradiction tells us',
      q: 'Every step was correct, and we reached a statement that cannot be true. What do we conclude?',
      opts: [A('The assumption was wrong: no whole number is both even and odd', ok('Yes.') + ' If correct steps lead to something impossible, the only thing left to blame is the starting assumption. That is proof by contradiction.'),
             A('Even numbers do not exist', 'Even numbers exist (2, 4, 6). Only the assumption "both at once" has been shown impossible.'),
             A('Some step must be wrong, so we learned nothing', 'We checked every step. A correct argument that ends in something impossible blames the assumption.')], ans: 0 },
    { view: 'main', n0: 0, n1: 1, title: 'Set up the claim',
      q: 'Now the real claim: √2 is not a fraction. Assume the opposite: √2 = p/q for positive whole numbers p and q in LOWEST TERMS (no common factor except 1). Why may we assume lowest terms?',
      opts: [A('Every fraction can be reduced, so if some fraction equals √2, a reduced one does too', ok('Yes.') + ' 6/4 reduces to 3/2. Divide out common factors until none are left. This is our one extra assumption, and the proof will break it.'),
             A('Because √2 is already in lowest terms', 'We know nothing about √2 yet. We are assuming it is a fraction, then choosing the reduced form of that fraction.'),
             A('Because p and q are both even', 'That is what we will end up showing, and it will contradict lowest terms. We cannot start from it.')], ans: 0 },
    { view: 'main', n0: 1, n1: 2, title: 'Square both sides',
      q: 'We have √2 = p/q. Square both sides, then multiply by q². Which line comes next?',
      opts: [A('p = 2q', 'Squaring p/q gives p²/q², not p/q times 2. Also √2 is about 1.41, not 2.'),
             A('p² = 2q²', ok('Yes.') + ' Squaring gives 2 = p²/q². Multiply both sides by q²: p² = 2q².'),
             A('p² = q²/2', 'Multiplying 2 = p²/q² by q² gives 2q², not q²/2. Test with 7/5, a near miss: 49 is close to 2 × 25 = 50, not to 25/2.')], ans: 1 },
    { view: 'main', n0: 2, n1: 3, title: 'Why is p² even?',
      q: 'We have p² = 2q². Choose the reason that p² is an even number.',
      opts: [A('Because p is even', 'We do not know that yet. It is what we want to prove next. All we know now is p² = 2 × q².'),
             A('Because p² is 2 times a whole number (q²)', ok('Yes.') + ' Even means 2 times a whole number. p² = 2 × q², so p² is even, whatever q is.'),
             A('Because q is even', 'We do not know that either. If q = 3, then 2q² = 18, which is still even. The 2 in front is the reason.')], ans: 1 },
    { view: 'lemma', n0: 3, n1: 3, title: 'Odd squares: look first', kind: 'table',
      q: 'We want to go from "p² is even" to "p is even". Test the opposite: what happens when you square an ODD number? Press each odd number to square it.',
      opts: [], ans: 0 },
    { view: 'lemma', n0: 3, n1: 3, title: 'Odd squares: the algebra', alg: 0,
      q: 'Odd squares looked odd every time. To prove it for ALL odd numbers: any odd number is 2k + 1 for some whole number k (1, 3, 5, 7 are k = 0, 1, 2, 3). Which line is (2k + 1)² expanded?',
      opts: [A('4k² + 1', 'You dropped the middle term. (2k+1)(2k+1) = 4k² + 2k + 2k + 1. Test k = 1: 3² = 9, but 4 + 1 = 5.'),
             A('4k² + 4k + 1', ok('Yes.') + ' Test k = 1: 4 + 4 + 1 = 9 = 3². Test k = 2: 16 + 8 + 1 = 25 = 5².'),
             A('2k² + 2k + 1', 'Test k = 1: 2 + 2 + 1 = 5, but 3² = 9. Also 2k × 2k = 4k², not 2k².')], ans: 1 },
    { view: 'lemma', n0: 3, n1: 3, title: 'Odd squares: why odd', alg: 1,
      q: 'Now 4k² + 4k + 1 = 2(2k² + 2k) + 1. Why does this show that an odd number squared is odd?',
      opts: [A('It is 2 times a whole number, plus 1, and that is what odd means', ok('Yes.') + ' 2k² + 2k is a whole number, so the square has the form 2 × (whole number) + 1. Every odd square is odd.'),
             A('Because k has to be odd', 'k can be any whole number: k = 2 gives 5, k = 3 gives 7. The reason is the form 2 × (something) + 1.'),
             A('Because odd plus anything is odd', 'Odd plus odd is even (3 + 5 = 8). It works here because the other part, 2(2k² + 2k), is even.')], ans: 0 },
    { view: 'main', n0: 3, n1: 4, title: 'So what is p?',
      q: 'An odd number squared is always odd. We know p² is even. What follows about p?',
      opts: [A('p is odd, like its square', 'An odd p would give an odd p². But p² is even, so p is not odd.'),
             A('Nothing: p could be odd or even', 'If p were odd, p² would be odd (3² = 9, 5² = 25). p² is even, so p cannot be odd.'),
             A('p is even: if p were odd, p² would be odd', ok('Yes.') + ' This is the step that needed the odd squares. It rules out odd p, so p is even.')], ans: 2 },
    { view: 'main', n0: 4, n1: 5, title: 'Write p = 2m',
      q: 'Since p is even, write p = 2m for a whole number m. Put it into p² = 2q². Which line comes next?',
      opts: [A('q² = 4m²', 'p² = (2m)² = 4m², so 4m² = 2q². Divide both sides by 2: q² = 2m², not 4m².'),
             A('q² = m²', 'Dividing 4m² by 2 gives 2m², not m². Test m = 3, so p = 6: 36 = 2q² gives q² = 18 = 2 × 9.'),
             A('q² = 2m²', ok('Yes.') + ' (2m)² = 4m², so 4m² = 2q². Divide by 2: 2m² = q².')], ans: 2 },
    { view: 'main', n0: 5, n1: 6, title: 'Why is q even?',
      q: 'We have q² = 2m². Choose the reason that q is even.',
      opts: [A('q² = 2 × m² is even, and an even square only comes from an even number: the same reasoning as for p', ok('Yes.') + ' q² is 2 times a whole number, so it is even. By the odd-squares fact, q cannot be odd. So q is even.'),
             A('Because p is even, q must be even too', 'That does not follow. Knowing about p says nothing directly about q. The reason must come from q² = 2m².'),
             A('Because q = 2m', 'q² = 2m² does not give q = 2m. (q = 2m would mean q² = 4m².)')], ans: 0 },
    { view: 'main', n0: 6, n1: 7, title: 'Find the contradiction',
      q: 'Now p and q are both even, so both are multiples of 2. Which assumption does that break?',
      opts: [A('That p² = 2q²', 'That equation is true: every line was derived from it. The broken thing is something we assumed at the start.'),
             A('That the fraction p/q was in lowest terms', ok('Yes.') + ' Both are divisible by 2, so the fraction can be reduced. For example 6/4 = 3/2. It was NOT in lowest terms, but we assumed it was.'),
             A('That p and q are whole numbers', 'Even numbers are whole numbers. The broken assumption is lowest terms.')], ans: 1 },
    { view: 'main', n0: 7, n1: 8, title: 'The conclusion',
      q: 'We assumed √2 = p/q in lowest terms and reached a contradiction, with every step correct. What do we conclude?',
      opts: [A('√2 is a fraction, just not in lowest terms', 'Any fraction can be reduced. We assumed the reduced one, and that is exactly what failed. So no fraction at all works.'),
             A('√2 is not a fraction of whole numbers: it is irrational', ok('Yes.') + ' No p and q can exist. So no unit, however tiny, fits whole times into both the side and the diagonal of a square. On the number line, √2 is a point that no fraction lands on.'),
             A('√2 = 1.414 exactly', 'A decimal that stops is a fraction (1414/1000). And 1.414² = 1.999396, not 2.')], ans: 1 }
  ];

  /* the what-if cases: N = d x r (d prime, d does not divide r), or N = d x d (a perfect square) */
  const WI = { 2: { d: 2, r: 1 }, 3: { d: 3, r: 1 }, 5: { d: 5, r: 1 }, 6: { d: 2, r: 3 }, 4: { d: 2, sq: 1 }, 9: { d: 3, sq: 1 } };
  const WNS = [2, 3, 4, 5, 6, 9];
  const SQTAB = { 2: 'If p were odd, p² would be odd. So p is even.',
    3: 'If 3 does not divide p, then p² leaves remainder 1 when divided by 3. Test p = 1, 2, 4, 5, 7, 8: the squares 1, 4, 16, 25, 49, 64 all leave remainder 1. So 3 divides p.',
    5: 'If 5 does not divide p, then p² never leaves remainder 0. Test p = 1, 2, 3, 4, 6, 7: the squares 1, 4, 9, 16, 36, 49 leave remainders 1, 4, 4, 1, 1, 4 when divided by 5. So 5 divides p.' };
  /* [text, short reason, colour, longer explanation] */
  const wlines = N => {
    const { d, r, sq } = WI[N], rq = (r === 1 ? '' : r) + 'q²';
    const base = [
      [`p² = ${N}q²`, 'square both sides', 'b', `Square √${N} = p/q and multiply by q²: p² = ${N}q².`],
      [`${d} divides p²`, `p² = ${d} × ${sq ? d + 'q²' : rq}`, 'b', `p² = ${N}q² = ${d} × ${sq ? d + 'q²' : rq}, which is ${d} times a whole number, so ${d} divides p².`],
      [`${d} divides p`, d === 2 ? 'odd² is odd' : `${d} is prime`, 'y', SQTAB[d]]];
    if (sq) return base.concat([
      [`p = ${d}m, so m² = q²`, `${N}m² = ${N}q²`, 'b', `Put p = ${d}m into p² = ${N}q²: ${N}m² = ${N}q². Divide by ${N}: m² = q², so m = q.`],
      [`q = m: no reason ${d} divides q`, 'stuck', 'r', `Here q = m, and nothing says ${d} divides m. For √2 the line was q² = 2m², which forced q to be even. Here the extra factor is gone.`],
      [`√${N} = ${d}/1: ${d}² = ${N} × 1²`, 'p = ' + d + ', q = 1', 'g', `p = ${d} and q = 1 fit p² = ${N}q²: ${d * d} = ${N} × 1. The fraction ${d}/1 is already in lowest terms (q = 1 has no common factor with anything). So no contradiction: √${N} = ${d}.`]]);
    return base.concat([
      [`p = ${d}m, so ${d}m² = ${rq}`, `${d * d}m² = ${N}q², divide by ${d}`, 'b', `Put p = ${d}m into p² = ${N}q²: ${d * d}m² = ${N}q². Divide by ${d}: ${d}m² = ${rq}.`],
      [`${d} divides q`, r === 1 ? `q² = ${d} × m²` : `${d} divides ${r}q², not ${r}`, 'y',
        r === 1 ? `q² = ${d} × m² is a multiple of ${d}, so ${d} divides q (the same fact as for p).`
          : `${d}m² = ${r}q² is a multiple of ${d}. ${d} does not divide ${r}, so ${d} must divide q². Then ${d} divides q (the same fact as for p).`],
      [`p and q both divisible by ${d}`, 'not lowest terms!', 'r', `Both p and q are multiples of ${d}, so p/q can be reduced. That contradicts lowest terms.`],
      [`√${N} is not a fraction`, 'the assumption fails', 'g', `Every step was forced and the end is impossible. So √${N} is irrational.`]]);
  };

  /* descent: the folding proof */
  const DS = [
    { title: 'Fold the leg onto the hypotenuse',
      q: 'Pretend a right isosceles triangle ABC has WHOLE-number legs AB = BC = a and a whole-number hypotenuse AC = c. Fold leg CB onto the hypotenuse, so B lands on D, a point of AC. Folding keeps lengths, so CD = a. How long is AD, the part of the hypotenuse left over?',
      opts: [A('a − c', 'The hypotenuse is the longest side, so c is bigger than a and a − c would be negative. A length cannot be negative.'),
             A('c − a', ok('Yes.') + ' AC = c and CD = a, so what is left is AD = c − a.'),
             A('c + a', 'D is a point ON the hypotenuse, so AD is only part of it. It cannot be longer than c.'),
             A('2a − c', 'That length does appear later, but not here. AD is what remains of AC after removing a piece of length a.')], ans: 1 },
    { title: 'A smaller isosceles right triangle',
      q: 'The crease CE goes from C to a point E on AB. The fold makes DE perpendicular to AC (it is the folded copy of the right angle at B). So triangle ADE has a right angle at D and a 45° angle at A. Which side equals AD?',
      opts: [A('AB', 'AB = a, but AD = c − a. They are different because c is not 2a.'),
             A('AE', 'AE is the hypotenuse of triangle ADE, the longest side. It is longer than AD.'),
             A('DE', ok('Yes.') + ' A triangle with a right angle and a 45° angle has two 45° angles, so two equal sides: DE = AD = c − a.')], ans: 2 },
    { title: 'Why is EB the same length?',
      q: 'Now look at the two triangles EBC and EDC on either side of the crease. Why is EB = ED?',
      opts: [A('E is the midpoint of AB', 'Nothing says that. E sits wherever the perpendicular from D lands.'),
             A('The triangles are congruent: right angles at B and D, a shared side EC, and CB = CD', ok('Yes.') + ' Two right triangles with the same hypotenuse EC and one equal leg (CB = CD = a) are congruent. So EB = ED = c − a.'),
             A('Because angle A is 45°', 'That fact is about triangle ADE. EB is a side of a different triangle, EBC, so we need a reason about EBC and EDC.')], ans: 1 },
    { title: 'The last side',
      q: 'AB = a is cut into AE and EB, with EB = c − a. So AE = a − (c − a). Simplify.',
      opts: [A('a − c', 'Careful with the minus sign: a − (c − a) = a − c + a, which has two a terms.'),
             A('c − 2a', 'This is the opposite of the right answer. Also c is smaller than 2a (the hypotenuse is shorter than the two legs together), so it would be negative.'),
             A('2a − c', ok('Yes.') + ' a − (c − a) = a − c + a = 2a − c. The small triangle has legs c − a, c − a and hypotenuse 2a − c.')], ans: 2 },
    { title: 'Fold a near miss',
      q: 'Try the formula on legs 7 and 7 with hypotenuse 10. This is NOT an exact triangle: 7² + 7² = 98 but 10² = 100. The new legs are c − a and the new hypotenuse is 2a − c. What are the next legs and hypotenuse?',
      opts: [A('legs 3, hypotenuse 17', 'The new legs 10 − 7 = 3 are right, but 17 = a + c. The new hypotenuse is 2a − c = 14 − 10.'),
             A('legs 4, hypotenuse 3', 'You swapped them. The legs are c − a = 3 and the hypotenuse is 2a − c = 4. The hypotenuse is the longest side.'),
             A('legs 3, hypotenuse 4', ok('Yes.') + ' c − a = 10 − 7 = 3 and 2a − c = 14 − 10 = 4. Check: 3² + 3² = 18, close to 4² = 16. The error flipped sign but kept its size: 100 − 98 = +2, then 16 − 18 = −2.'),
             A('legs 3, hypotenuse 7', 'The legs 3 are right, but 7 is the old leg a. The new hypotenuse is 2a − c = 14 − 10 = 4.')], ans: 2 },
    { title: 'Why forever is impossible',
      q: 'Suppose a triangle with whole sides really had c² = 2a². Folding gives a smaller one with whole sides, and folding that one gives another, and so on. Why is that impossible?',
      opts: [A('It is possible: the triangles just get very small', 'Whole-number sides cannot be smaller than 1. Starting from a, you can shrink at most a few times before you run out of whole numbers.'),
             A('Whole numbers cannot get smaller forever', ok('Yes.') + ' Each fold gives smaller positive whole numbers: a, then c − a, then smaller again. A list of positive whole numbers cannot keep shrinking forever. So no whole-number triangle with c² = 2a² exists, and √2 is not a fraction.'),
             A('Because 2a − c is negative', 'It is not: c is between a and 2a, so 2a − c is positive.')], ans: 1 }
  ];
  const SEEDS = [[7, 10], [5, 7], [12, 17]];
  const chain = ([a, c]) => {
    const rows = [[a, c, c * c - 2 * a * a]];
    for (;;) { const [x, y] = rows[rows.length - 1]; if (!(y > x && y < 2 * x)) break; const a2 = y - x, c2 = 2 * x - y; rows.push([a2, c2, c2 * c2 - 2 * a2 * a2]); }
    return rows;
  };

  /* ---------- practice (7 fixed problems) ---------- */
  const SEQ = [
    { t: 'Assume √2 = p/q in lowest terms', card: ['√2 = p/q, lowest terms', 'assume', 'v'], need: 'Every proof by contradiction starts with the assumption. Nothing else makes sense before it.', why: 'We assume the opposite of what we want to show.' },
    { t: 'Square both sides: p² = 2q²', card: ['p² = 2q²', 'square', 'b'], need: 'Squaring needs the assumption √2 = p/q first. Start there.', why: 'Squaring √2 = p/q gives 2 = p²/q², and multiplying by q² gives p² = 2q².' },
    { t: 'So p² is even, and so p is even', card: ['p is even', 'odd² is odd', 'y'], need: '"p is even" comes from the equation p² = 2q². We do not have that equation yet.', why: 'p² = 2q² is even, and an odd p would have an odd square.' },
    { t: 'Write p = 2m, which gives q² = 2m²', card: ['p = 2m, q² = 2m²', 'substitute', 'b'], need: 'Writing p = 2m needs p to be even first.', why: '(2m)² = 4m² = 2q², so q² = 2m².' },
    { t: 'So q is even too: p and q share the factor 2', card: ['q is even too', 'same reason', 'y'], need: 'To say q is even we first need q² = 2m².', why: 'q² = 2m² is even, so q is even, and p and q are both multiples of 2.' },
    { t: 'That contradicts lowest terms: √2 is not a fraction', card: ['contradiction: √2 is irrational', 'lowest terms', 'g'], need: 'The contradiction comes at the very end, once we know both p and q are even.', why: 'A fraction with a common factor 2 is not in lowest terms.' }
  ];
  const SEQ_ORDER = [4, 1, 5, 0, 3, 2];   /* the fixed order the buttons appear in */
  const BADL = [
    ['√4 = p/q, lowest terms', 'assume', 'v'],
    ['p² = 4q²', 'square', 'b'],
    ['p is even', 'odd² is odd', 'y'],
    ['p = 2m, so q² = m²', '4m² = 4q²', 'b'],
    ['"q is even too"', 'copied from √2', 'r'],
    ['√4 is irrational (!)', 'WRONG', 'r']
  ];
  const PROBS = [
    { name: 'Put the proof in order', kind: 'seq', viz: 'seq',
      q: 'Build the proof that √2 is irrational, one line at a time. Choose the line that comes NEXT. The six lines are shuffled.' },
    { name: 'Choose the justification', kind: 'choice', viz: 'main2',
      q: 'The proof has reached "p² is even" and wants to write "p is even". Which reason justifies that step?',
      ch: [['Even numbers have even squares, so p² even means p is even', 'That runs the fact the wrong way. It says: p even gives p² even. We need: p² even gives p even. The fact that does the job is "an odd number squared is odd".'],
           ['If p were odd, p² would be odd. But p² is even, so p is not odd', ok('Right.') + ' The square of an odd number is always odd (4k² + 4k + 1). So an even p² cannot come from an odd p.'],
           ['Every square is even', 'Not so: 3² = 9 and 5² = 25 are odd.'],
           ['Because p² = 2q² and 2 is even, every letter in the equation is even', 'Only p² is shown to be even so far. q could be anything at that point (q = 3 gives 2q² = 18).']], ans: 1 },
    { name: 'Find the flaw', kind: 'choice', viz: 'bad',
      q: 'A student "proves" that √4 is irrational: assume √4 = p/q in lowest terms. Then p² = 4q², so p is even, p = 2m, so 4m² = 4q² and q² = m². "So q is even too, which contradicts lowest terms. So √4 is irrational." Where is the flaw?',
      ch: [['The first line: p² = 4q² is wrong', 'Squaring √4 = p/q gives 4 = p²/q², so p² = 4q². That line is fine.'],
           ['The step "p is even"', 'p² = 4q² is even, and an odd p would give an odd p², so p is even. This step is fine. (Try p = 2.)'],
           ['The step "q is even too": q² = m² does not make q even', ok('Right.') + ' q² = m² is not "2 times something", so nothing forces q to be even. In fact p = 2 and q = 1 fit p² = 4q², and 2/1 is in lowest terms. So √4 = 2/1, a fraction.'],
           ['Nothing is wrong: √4 is irrational', '√4 = 2 = 2/1, which is a fraction. So the "proof" must have a flaw.']], ans: 2 },
    { name: 'Parity facts', kind: 'choice', viz: 'lemma',
      q: 'A whole number p has p² = 36, which is even. What does "the square of an odd number is odd" tell us about p?',
      ch: [['p could be odd or even', 'An odd p always has an odd square, because (2k + 1)² = 4k² + 4k + 1. Since 36 is even, p cannot be odd.'],
           ['p must be a multiple of 4', 'Not forced. p = 6 has p² = 36, which is even, but 6 is not a multiple of 4. We only learn that p is even.'],
           ['p must be prime', 'Prime is unrelated. 6² = 36 and 6 is not prime. We only learn that p is even.'],
           ['p is even', ok('Right.') + ' If p were odd, p² would be odd. p² = 36 is even, so p is even (here p = 6).']], ans: 3 },
    { name: 'Which root is irrational?', kind: 'choice', viz: 'tiles', ring: [2, 7, 9, 12],
      q: 'Exactly one of √2, √9, √12 and √7 is NOT irrational. A square root of a whole number is irrational unless the number is a perfect square. Which one is not irrational?',
      ch: [['√2', '2 is not a perfect square (1 and 4 are on either side). √2 is irrational, as the proof shows.'],
           ['√12', '12 is not a perfect square (9 and 16 are on either side), so √12 is irrational. It equals 2√3, about 3.464.'],
           ['√9', ok('Right.') + ' 9 = 3 × 3 is a perfect square, so √9 = 3 = 3/1, a fraction. The argument fails here for the same reason as for √4.'],
           ['√7', '7 is not a perfect square (4 and 9 are on either side), so √7 is irrational. It is about 2.646.']], ans: 2 },
    { name: 'The contradiction', kind: 'choice', viz: 'main2',
      q: 'The proof reaches "p and q are both even". Why is that a contradiction?',
      ch: [['Even numbers cannot be in a fraction', 'They can: 4/6 is a fine fraction. The problem is that it can be reduced.'],
           ['Both are divisible by 2, so p/q could be reduced; but we chose p/q in lowest terms', ok('Right.') + ' 6/4 reduces to 3/2. A fraction in lowest terms has no common factor, so "both even" is impossible for it.'],
           ['Because √2 is already known to be irrational', 'We are trying to PROVE that. We cannot use it as a reason.'],
           ['Because p² = 2q² is then false', 'That equation stays true. Nothing in it changes when p and q are even.']], ans: 1 },
    { name: 'A counterexample', kind: 'choice', viz: 'line',
      q: 'A student claims: "The sum of two irrational numbers is always irrational." One example is enough to show a claim is false. Which pair of numbers is a counterexample?',
      ch: [['√2 and √3', '√2 + √3 is about 3.146, and it is irrational. This pair supports the claim; it does not break it.'],
           ['√2 and √2', '√2 + √2 = 2√2, which is irrational. This pair supports the claim.'],
           ['π and 1', '1 is not irrational, so this pair does not even qualify.'],
           ['√2 and −√2', ok('Right.') + ' Both are irrational (if −√2 were a fraction, √2 would be too), but their sum is 0 = 0/1, a fraction. One counterexample kills "always".']], ans: 3 }
  ];

  register({
    id: 'why-the-square-root-of-2-is-irrational', level: 'school',
    title: 'Why the square root of 2 is irrational',
    blurb: 'Prove that the diagonal of a square cannot be written as a fraction, two ways: with algebra and by folding.',
    thumb(c, p) {
      const pal = p.pal; p.cx = .5; p.cy = .5; p.span = .78;
      p.path([[0, 0], [1, 0], [1, 1], [0, 1]], { stroke: pal.blue, width: 3, close: true, fill: alpha(pal.blue, .1) });
      p.path([[0, 0], [1, 1]], { stroke: pal.yellow, width: 4 });
      p.dot(0, 0, 5.5, pal.stage, pal.text, 2); p.dot(1, 1, 5.5, pal.yellow, pal.stage, 2);
      p.label('1', .5, 0, { size: 24, italic: false, color: pal.text, dy: 17 });
      p.label('√2', .43, .6, { size: 26, italic: false, color: pal.text, dx: -16 });
      p.label('?', .8, .35, { size: 28, italic: false, color: pal.red });
    },
    hook: String.raw`A square has side 1. Its diagonal is \(\sqrt{2}\), about 1.41421. Can that length be written exactly as a fraction of two whole numbers? People tried for centuries, and one short argument shows nobody ever will. Can you see why?`,
    steps: [
      { title: 'Measure the diagonal',
        text: String.raw`<p>If \(\sqrt{2}=p/q\), pick a ruler so that the side is \(q\) units long. Then the diagonal would be exactly \(p\) whole units.</p><p>Predict first: will some ruler from \(q=1\) to \(100\) fit exactly? Then move the slider. At \(q=5\) the diagonal is 7.071 units, so 0.0711 is left over.</p>`,
        set: { part: 'measure', q: 5 } },
      { title: 'The algebra proof',
        text: String.raw`<p>Assume the opposite: \(\sqrt{2}=p/q\) in lowest terms. If that breaks something, the assumption is false. This is proof by contradiction.</p><p>A tiny example comes first. Then at each stop you choose the next line or its reason. A wrong choice tells you why it fails.</p>`,
        set: { part: 'proof' } },
      { title: 'Which roots does it cover?',
        text: String.raw`<p>Run the same argument on other roots. Predict first: will it end in a contradiction?</p><p>Try \(\sqrt{3}\) and \(\sqrt{6}\), then \(\sqrt{4}\) and \(\sqrt{9}\). For \(\sqrt{4}\) and \(\sqrt{9}\) the argument gets stuck because those roots are whole numbers (2 and 3). The tile chart shows which numbers are perfect squares.</p>`,
        set: { part: 'whatif', wi: 3 } },
      { title: 'A second proof: fold forever',
        text: String.raw`<p>Pretend a right isosceles triangle has whole-number sides. Folding one leg onto the hypotenuse makes a smaller one, also with whole-number sides. Repeat forever.</p><p>Whole numbers cannot shrink forever, so no such triangle exists. You choose each new length. Then try the near miss 7, 7, 10.</p>`,
        set: { part: 'descent' } }
    ],
    formal: String.raw`
      <p>A number is <em>rational</em> if it equals a fraction \(p/q\) of two whole numbers (with \(q\neq 0\)). It is <em>irrational</em> if it does not. The diagonal of a square with side 1 has length \(\sqrt{2}\) by the Pythagorean theorem, because \(1^2+1^2=2\). The claim is that \(\sqrt{2}\) is irrational.</p>
      <h3>What the claim means for measuring</h3>
      <p>Suppose \(\sqrt{2}=p/q\). Cut the side into \(q\) equal pieces of length \(1/q\). The side is \(q\) pieces long, and the diagonal is \(\sqrt{2}\cdot q=p\) pieces long. So one common unit would measure the side and the diagonal exactly. The theorem says no such unit exists, however small. You can search \(q=1,2,\dots,100\) and always find a leftover gap, but that is only evidence: a search cannot cover all \(q\). A proof must cover all of them at once.</p>
      <h3>Proof by contradiction</h3>
      <p>To show a statement cannot be true, assume it is true and follow correct steps until you reach something impossible. Then the assumption must have been wrong. Example: no whole number is both even and odd. If \(n=2a=2b+1\), then \(2(a-b)=1\), so \(a-b=\tfrac12\), but \(a-b\) is a whole number. Impossible.</p>
      <h3>The odd-square fact</h3>
      <p>Every odd number has the form \(2k+1\). Then
      \[ (2k+1)^2 = 4k^2+4k+1 = 2(2k^2+2k)+1, \]
      which is again odd. So if \(p^2\) is even, \(p\) cannot be odd: \(p\) is even.</p>
      <h3>The proof</h3>
      <p>Assume \(\sqrt{2}=p/q\) with \(p,q\) positive whole numbers and no common factor (we can always reduce a fraction). Squaring and clearing the denominator gives \(p^2=2q^2\). So \(p^2\) is even, so \(p\) is even, say \(p=2m\). Then \(4m^2=2q^2\), so
      \[ q^2 = 2m^2. \]
      So \(q^2\) is even, so \(q\) is even. Now \(p\) and \(q\) are both multiples of 2. That contradicts the choice of \(p/q\) in lowest terms. So \(\sqrt{2}\) is not a fraction.</p>
      <h3>Which roots does it cover?</h3>
      <p>For \(\sqrt{3}\) the same shape works with &ldquo;divisible by 3&rdquo; in place of &ldquo;even&rdquo;. From \(p^2=3q^2\), 3 divides \(p^2\), so 3 divides \(p\) (a number not divisible by 3 has a square with remainder 1). Write \(p=3m\): \(9m^2=3q^2\), so \(q^2=3m^2\), so 3 divides \(q\). The same argument works for \(\sqrt{5}\), and for \(\sqrt{6}\) with the prime 2: from \(p=2m\) we get \(2m^2=3q^2\), so 2 divides \(3q^2\), so 2 divides \(q\).</p>
      <p>It must fail for \(\sqrt{4}\) and \(\sqrt{9}\), because those are rational. For \(\sqrt{4}\): \(p^2=4q^2\), so \(p=2m\) and \(4m^2=4q^2\), so \(q^2=m^2\). Nothing says \(q\) is even, and \(p=2,\ q=1\) is a solution in lowest terms, so \(\sqrt{4}=2/1\). The extra factor in \(4q^2\) cancels the 2 that forced \(q\) to be even. A longer version of the argument, using prime factorization, shows that \(\sqrt{N}\) is irrational for every whole number \(N\) that is not a perfect square. This lesson proves it only for the cases it works through.</p>
      <h3>A second proof: infinite descent</h3>
      <p>Suppose a right isosceles triangle has whole-number legs \(a,a\) and whole-number hypotenuse \(c\), so \(c^2=2a^2\) and \(a &lt; c &lt; 2a\). Fold one leg onto the hypotenuse. The fold marks \(D\) on the hypotenuse with \(AD=c-a\). The perpendicular at \(D\) meets the other leg at \(E\). Triangle \(ADE\) has a right angle and a \(45^\circ\) angle, so it is isosceles: \(DE=AD=c-a\). Triangles \(EBC\) and \(EDC\) are congruent, so \(EB=ED=c-a\). Then \(AE=a-(c-a)=2a-c\). So there is a smaller right isosceles triangle with legs \(c-a\) and hypotenuse \(2a-c\), again whole numbers. Repeating gives smaller and smaller positive whole numbers forever, which is impossible. This is <em>infinite descent</em>.</p>
      <p>The numbers do something neat. For any numbers \(a,c\),
      \[ (2a-c)^2-2(c-a)^2 = 2a^2-c^2 = -(c^2-2a^2). \]
      So one fold flips the sign of \(c^2-2a^2\) and keeps its size. For the near miss \(7,7,10\): \(10^2-2\cdot 7^2=2\), then \(3,3,4\) gives \(4^2-2\cdot 3^2=-2\). For a true triple the value would be \(0\) forever, which is why the folds could go on forever, and why that is impossible. The drawing in the lesson is the exact shape; the numbers in the table are a near miss and make no claim of exactness.</p>
      <h3>What it means</h3>
      <p>The rational numbers fit between any two points on the number line, yet \(\sqrt{2}\) is a point that no fraction lands on. The fractions \(1,\ \tfrac32,\ \tfrac75,\ \tfrac{17}{12},\ \tfrac{41}{29},\ \tfrac{99}{70}\) get closer and closer, and each has \(p^2-2q^2=\pm1\), never 0. Closer is not equal: the proof is what shows they never arrive. The lengths of a side and a diagonal of a square are <em>incommensurable</em>: no unit measures both.</p>`,
    check: [
      { q: 'A proof by contradiction shows that √2 cannot be written as p/q. What does such a proof do?',
        choices: ['It tries fractions such as 7/5 and 17/12 and finds that none equals √2 exactly.',
          'It assumes √2 = p/q in lowest terms, then uses correct steps to reach something impossible.',
          'It assumes √2 is NOT a fraction and checks that nothing goes wrong.',
          'It writes out the decimal expansion of √2 and notices that it never ends.'], answer: 1,
        why: String.raw`A proof by contradiction assumes the opposite of what you want, here that \(\sqrt{2}=p/q\) in lowest terms, and follows correct steps to an impossible statement. Then the assumption must be false. Trying fractions only checks examples, and no list of examples covers every fraction. A decimal that never ends does not decide it either: \(1/3=0.333\ldots\) never ends and is a fraction.`,
        hint: 'To show something cannot happen, assume that it does happen and see what breaks. Would any list of examples be enough?' },
      { q: 'Folding a right isosceles triangle with legs a and a and hypotenuse c gives a smaller one with legs c − a and hypotenuse 2a − c. Start with legs 12 and 12 and hypotenuse 17 (a near miss: 12² + 12² = 288 and 17² = 289). Fold twice. What are the legs and the hypotenuse after two folds?',
        choices: ['legs 5, hypotenuse 7', 'legs 2, hypotenuse 12', 'legs 3, hypotenuse 2', 'legs 2, hypotenuse 3'], answer: 3,
        why: String.raw`First fold: legs \(17-12=5\), hypotenuse \(2\cdot 12-17=7\). Second fold, with \(a=5,\ c=7\): legs \(7-5=2\), hypotenuse \(2\cdot 5-7=3\). Check: \(3^2-2\cdot 2^2=1\), and the first triangle had \(7^2-2\cdot5^2=-1\): the sign flips, the size stays 1. Legs 5 and hypotenuse 7 is only one fold. Hypotenuse 12 comes from adding \(7+5\). Legs 3 and hypotenuse 2 swaps the two numbers.`,
        hint: 'Apply the two formulas once to 12 and 17, then apply them again to the two numbers you get.' },
      { q: 'A student tries to prove that √3 is irrational: "Assume √3 = p/q in lowest terms. Then p² = 3q², so p² is a multiple of 3. So p is even. Then p = 2m, so 4m² = 3q², and so on." Which statement is true?',
        choices: ['"So p is even" is wrong. A multiple of 3 need not be even (9 is odd). The correct conclusion is that 3 divides p.',
          'The first line is wrong: squaring √3 = p/q does not give p² = 3q².',
          'Nothing is wrong: every proof of this type uses "even".',
          'The attempt is fine, but √3 is rational because 3 is odd.'], answer: 0,
        why: String.raw`Squaring \(\sqrt{3}=p/q\) does give \(p^2=3q^2\), so the first line is fine. From it, 3 divides \(p^2\), and then 3 (not 2) divides \(p\). Nothing makes \(p\) even: for example \(p^2=9\) is a multiple of 3 and is odd. The proof for \(\sqrt{3}\) uses &ldquo;divisible by 3&rdquo; throughout, and it ends with \(p\) and \(q\) both divisible by 3. Also \(\sqrt{3}\) is irrational whether 3 is odd or not.`,
        hint: 'What does p² = 3q² tell you about p²? Test it with p = 3: p² = 9. Is 9 even?' }
    ],
    links: { prereq: ['square-roots-and-irrational-numbers', 'the-real-number-system'], related: ['pythagorean-theorem', 'rational-numbers-and-decimal-expansions', 'modular-arithmetic', 'similarity-and-scaling', 'angle-relationships-and-parallel-lines'] },

    mount({ stage, controls: C }) {
      const st = {
        part: 'measure', q: 5, mpred: null,
        pf: 0, pfOk: false, pfW: [], pfFb: '', lem: [],
        wi: 3, wpred: null, wk: 0,
        ds: 0, dOk: false, dW: [], dFb: '', fold: 0, seed: 0,
        practice: false
      };
      let cancel0 = () => {};
      const cancel = () => { cancel0(); if (st.ds > 0 || st.dOk) st.fold = 1; };
      const panel = stage.nextElementSibling;
      const P = new Plane(stage, { span: 5 }), cv = P.canvas;
      if (P.coordEl) P.coordEl.style.display = 'none';
      cv.tabIndex = 0; cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', 'A picture that changes with the part you are working on: a unit square with its diagonal and a ruler, a stack of proof cards, a chart of whole numbers, or a folded triangle. The panel reads out the same facts in words.');
      let prOver = false, prIdx = 0, prSolved = false, prTried = false, prFirst = 0, prDone = 0, prPlaced = [], prW = [], prFb = '';

      /* ----- the picture ----- */
      const rect = (p, top, bottom) => ({ x: 12, y: top, w: p.w - 24, h: bottom - top });

      const drawMeasure = (c, p) => {
        const pal = p.pal, q = st.q, m = meas(q), W = p.w, Hh = p.h, fsB = clamp(W / 26, 12.5, 16);
        const Ht = Hh * (W / Hh < 1 ? .56 : .62);
        T(c, `Side = ${q} unit${q > 1 ? 's' : ''}`, W / 2, 16, { size: fsB, color: pal.blue, weight: 700 });
        T(c, `Diagonal = ${m.D.toFixed(3)} units: ${m.p} whole + ${m.gap.toFixed(4)} ${m.D > m.p ? 'over' : 'short'}`, W / 2, 16 + fsB * 1.5, { size: fsB, color: pal.violet, weight: 700 });
        const s = Math.min(W * .5, Ht - 96), x0 = (W - s) / 2, y0 = 24 + fsB * 3 + s, u = s / q, dr = [1 / S2, -1 / S2];
        c.fillStyle = alpha(pal.blue, .08); c.fillRect(x0, y0 - s, s, s);
        c.strokeStyle = pal.blue; c.lineWidth = 2.6; c.strokeRect(x0, y0 - s, s, s);
        const step = q <= 12 ? 1 : q <= 30 ? 2 : q <= 60 ? 5 : 10;
        c.lineWidth = 1.6;
        for (let i = 0; i <= q; i += step) { c.strokeStyle = pal.blue; c.beginPath(); c.moveTo(x0 + i * u, y0); c.lineTo(x0 + i * u, y0 + 7); c.stroke(); }
        if (q % step) { c.strokeStyle = pal.blue; c.beginPath(); c.moveTo(x0 + s, y0); c.lineTo(x0 + s, y0 + 7); c.stroke(); }
        T(c, String(q), x0 + s, y0 + 20, { size: fsB * .92, color: pal.blue, weight: 600 });
        T(c, '0', x0, y0 + 20, { size: fsB * .92, color: pal.blue, weight: 600 });
        /* the diagonal, with whole-unit marks */
        const at = t => [x0 + dr[0] * t * u, y0 + dr[1] * t * u];
        const e = at(m.D);
        c.strokeStyle = pal.violet; c.lineWidth = 3.4; c.beginPath(); c.moveTo(x0, y0); c.lineTo(e[0], e[1]); c.stroke();
        for (let i = 0; i <= m.p; i += step) { const a = at(i); c.strokeStyle = pal.violet; c.lineWidth = 1.6; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(a[0] - dr[1] * -7, a[1] + dr[0] * -7); c.stroke(); }
        if (m.p % step) { const a = at(m.p); c.strokeStyle = pal.violet; c.lineWidth = 1.6; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(a[0] - dr[1] * -7, a[1] + dr[0] * -7); c.stroke(); }
        /* the leftover gap */
        const a1 = at(Math.min(m.D, m.p)), a2 = at(Math.max(m.D, m.p));
        let gx = a2[0] - a1[0], gy = a2[1] - a1[1]; const gl = Math.hypot(gx, gy), mid = [(a1[0] + a2[0]) / 2, (a1[1] + a2[1]) / 2];
        const half = Math.max(gl, 6) / 2;
        c.strokeStyle = pal.red; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(mid[0] - dr[0] * half, mid[1] - dr[1] * half); c.lineTo(mid[0] + dr[0] * half, mid[1] + dr[1] * half); c.stroke(); c.lineCap = 'butt';
        T(c, `${m.p}`, at(m.p)[0] + 18, at(m.p)[1] + 12, { size: fsB * .92, color: pal.violet, weight: 700, halo: pal.stage });
        T(c, `leftover ${m.gap.toFixed(4)}`, Math.min(W - 60, e[0] + 46), e[1] - 12, { size: fsB * .9, color: pal.red, weight: 700, halo: pal.stage });
        /* the chart */
        const cy0 = Ht + 6, ch = Hh - cy0 - 12;
        if (st.mpred === null) {
          T(c, 'Predict first: will any ruler fit exactly?', W / 2, cy0 + ch / 2, { size: fsB, color: pal.muted });
          return;
        }
        T(c, `Leftover gap for each q from 1 to 100`, W / 2, cy0 + 8, { size: fsB * .92, color: pal.text, weight: 600 });
        const px = 22, pw = W - 44, bw = pw / 100, base = Hh - 28, top = cy0 + 40, bh = base - top;
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.4; c.beginPath(); c.moveTo(px, base + .5); c.lineTo(px + pw, base + .5); c.stroke();
        for (let k = 1; k <= 100; k++) {
          const g = meas(k).gap, hgt = Math.max(2.5, Math.sqrt(g / .5) * bh);
          const sel = k === q, best = BEST.includes(k);
          c.fillStyle = sel ? pal.yellow : best ? alpha(pal.green, .85) : alpha(pal.blue, .55);
          c.fillRect(px + (k - 1) * bw + .6, base - hgt, Math.max(1.4, bw - 1.2), hgt);
          if (sel) { c.strokeStyle = pal.text; c.lineWidth = 1.2; c.strokeRect(px + (k - 1) * bw + .6, base - hgt, Math.max(1.4, bw - 1.2), hgt); }
        }
        T(c, '1', px, base + 13, { size: 12, color: pal.muted }); T(c, '100', px + pw, base + 13, { size: 12, color: pal.muted, align: 'right' });
        T(c, 'q', px + pw / 2, base + 13, { size: 12, color: pal.muted });
        T(c, 'green: best rulers so far', px + pw, cy0 + 26, { size: 12, color: pal.green, align: 'right', weight: 700 });
        T(c, 'no bar reaches 0', px, cy0 + 26, { size: 12, color: pal.red, align: 'left', weight: 700 });
      };

      const drawProof = (c, p) => {
        const pal = p.pal, s = PF[st.pf], n = st.pfOk ? s.n1 : s.n0, R = rect(p, 10, p.h - 10);
        if (s.view === 'lemma') {
          lemma(c, pal, R, st.lem, s.alg === undefined ? 0 : s.alg === 0 ? (st.pfOk ? 1 : 0) : (st.pfOk ? 2 : 1));
          return;
        }
        ladder(c, pal, s.view === 'ex' ? EXL : ML, n, R);
      };

      const drawWhat = (c, p) => {
        const pal = p.pal, N = st.wi, L = wlines(N), Hh = p.h, narrow = p.w / Hh < 1;
        const split = Hh * (narrow ? .38 : .44);
        tiles(c, pal, { x: 12, y: 8, w: p.w - 24, h: split - 8 }, [], N);
        ladder(c, pal, L.map(l => l.slice(0, 3)), st.wpred === null ? 0 : st.wk, { x: 12, y: split + 6, w: p.w - 24, h: Hh - split - 16 }, { maxH: 40 });
      };

      /* geometry of the folding picture, in the unit where the legs are 1 */
      const TRI = (() => {
        const A = [0, 1], B = [0, 0], C = [1, 0], D = [1 - 1 / S2, 1 / S2], E = [0, S2 - 1];
        return { A, B, C, D, E };
      })();
      const nest = (R, A, Cc, depth) => {
        const out = [], f = (r, a, cc, d) => {
          if (d === 0) return;
          const lr = Math.hypot(r[0] - cc[0], r[1] - cc[1]), lc = Math.hypot(a[0] - cc[0], a[1] - cc[1]), t = (lc - lr) / lc;
          const D = [a[0] + (cc[0] - a[0]) * ((lc - lr) / lc), a[1] + (cc[1] - a[1]) * ((lc - lr) / lc)];
          const AD = lc - lr, AR = Math.hypot(r[0] - a[0], r[1] - a[1]);
          const E = [a[0] + (r[0] - a[0]) * (AD * S2 / AR), a[1] + (r[1] - a[1]) * (AD * S2 / AR)];
          void t; out.push([D, a, E]); f(D, E, a, d - 1);
        };
        f(R, A, Cc, depth); return out;
      };
      const drawDescent = (c, p) => {
        const pal = p.pal, W = p.w, Hh = p.h, ds = st.ds, done = k => ds > k || (ds === k && st.dOk), showTab = ds >= 4, row = showTab && W / Hh > 1.15;
        const area = row ? { x: 10, y: 10, w: W * .54, h: Hh - 20 } : { x: 10, y: 10, w: W - 20, h: showTab ? Hh * .56 : Hh - 20 };
        const sc = Math.min((area.w - 110) / 1.05, (area.h - 56) / 1.05), ox = area.x + 84 + (showTab ? 0 : Math.max(0, (area.w - 110 - sc * 1.05) / 2)), oy = area.y + area.h / 2 + sc * .52 + 4;
        const X = v => ox + v * sc, Y = v => oy - v * sc, pt = v => [X(v[0]), Y(v[1])];
        const { A, B, C, D, E } = TRI, fs = clamp(sc * .075 + 7, 12.5, 17);
        const poly = (pts, fill, stroke, lw, dash) => { c.beginPath(); pts.forEach((v, i) => { const q = pt(v); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.closePath(); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.setLineDash(dash || []); c.lineJoin = 'round'; c.stroke(); c.setLineDash([]); } };
        const seg = (u, v, col, lw, dash) => { const a = pt(u), b = pt(v); c.strokeStyle = col; c.lineWidth = lw; c.setLineDash(dash || []); c.lineCap = 'round'; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); c.setLineDash([]); };
        const lab = (s, v, dx, dy, col, al) => T(c, s, X(v[0]) + dx, Y(v[1]) + dy, { size: fs, color: col || pal.text, weight: 700, halo: pal.stage, align: al || 'center' });
        poly([A, B, C], alpha(pal.blue, .1), pal.blue, 3);
        /* the right-angle mark at B */
        c.strokeStyle = pal.blue; c.lineWidth = 1.5; c.strokeRect(X(0) + 1, Y(0) - 13, 12, 12);
        if (done(0)) {
          const t = st.fold, Fx = (() => { const cx = C[0], cy = C[1], ex = E[0] - cx, ey = E[1] - cy, tt = ((B[0] - cx) * ex + (B[1] - cy) * ey) / (ex * ex + ey * ey); return [cx + tt * ex, cy + tt * ey]; })();
          const k = Math.cos(Math.PI * t), Bp = [Fx[0] + (B[0] - Fx[0]) * k, Fx[1] + (B[1] - Fx[1]) * k];
          poly([E, C, Bp], alpha(pal.yellow, .3), alpha(pal.yellow, .95), 2.2);
          seg(E, C, pal.text, 2, [6, 5]);
          if (t > .98) {
            poly([A, D, E], alpha(pal.yellow, done(1) ? .32 : .12), pal.yellow, done(1) ? 3.4 : 2);
            c.strokeStyle = pal.text; c.lineWidth = 1.3; const dd = pt(D); c.save(); c.translate(dd[0], dd[1]); c.rotate(Math.PI / 4); c.strokeRect(-1, 1, 11, 11); c.restore();
          }
        }
        if (ds >= 4 && st.dOk || ds > 4) nest(B, A, C, 4).slice(1).forEach(t => poly(t, alpha(pal.green, .35), pal.green, 2.6));
        /* labels */
        const lbl = [['A', A, -14, -4], ['B', B, -14, 14], ['C', C, 14, 14]];
        lbl.forEach(l => lab(l[0], l[1], l[2], l[3], pal.muted));
        if (done(0) && st.fold > .98) { lab('D', D, 16, -4, pal.muted); lab('E', E, -14, -2, pal.muted); }
        lab('a', [.5, 0], 0, 18, pal.blue);
        if (!done(0)) { lab('a', [0, .5], -16, 0, pal.blue); lab('c', [.5, .5], 18, -12, pal.violet); }
        else if (st.fold > .98) {
          lab('a', [(1 + D[0]) / 2, D[1] / 2], 18, 8, pal.blue);
          lab('c − a', [(A[0] + D[0]) / 2, (A[1] + D[1]) / 2], 22, -12, pal.yellow, 'left');
          if (done(1)) lab('c − a', [(D[0] + E[0]) / 2, (D[1] + E[1]) / 2], 20, 6, pal.yellow, 'left');
          if (done(2)) lab('c − a', [0, E[1] / 2], -10, 0, pal.yellow, 'right');
          else lab('?', [0, E[1] / 2], -12, 0, pal.red, 'right');
          if (done(3)) lab('2a − c', [0, (E[1] + 1) / 2], -10, 0, pal.green, 'right');
          else if (done(2)) lab('?', [0, (E[1] + 1) / 2], -12, 0, pal.red, 'right');
        }
        /* near-miss table */
        const tb = row ? { x: W * .6, y: 14, w: W * .36 } : { x: 14, y: area.h + 20, w: W - 28 };
        if (!showTab) {
          if (!row) T(c, 'Whole-number sides, pretend', W / 2, area.h + 28, { size: 13, color: pal.muted });
          return;
        }
        const rows = chain(SEEDS[st.seed]), shown = ds > 4 || (ds === 4 && st.dOk) ? rows.length : 1, fz = clamp(tb.w / 24, 12, 15);
        T(c, 'legs a, hypotenuse c', tb.x, tb.y + 4, { size: fz, color: pal.muted, align: 'left', weight: 700 });
        T(c, 'c² − 2a²', tb.x + tb.w, tb.y + 4, { size: fz, color: pal.muted, align: 'right', weight: 700 });
        rows.forEach((r, i) => {
          const y = tb.y + 30 + i * fz * 1.9;
          if (i >= shown) return;
          T(c, `${i === 0 ? 'start' : 'fold ' + i}: ${r[0]}, ${r[0]}, ${r[1]}`, tb.x, y, { size: fz, color: pal.text, align: 'left', weight: 600 });
          T(c, sgn(r[2]), tb.x + tb.w, y, { size: fz, color: r[2] === 0 ? pal.green : pal.red, align: 'right', weight: 700 });
        });
        if (shown === rows.length && rows.length > 0) {
          const L = rows[rows.length - 1], y = tb.y + 30 + rows.length * fz * 1.9 + 4;
          T(c, 'sign flips, size stays', tb.x, y, { size: fz, color: pal.muted, align: 'left' });
          T(c, 'next fold: no triangle, chain stops', tb.x, y + fz * 1.6, { size: fz * .96, color: pal.muted, align: 'left' });
          T(c, 'green outlines: each fold makes a smaller copy', tb.x, y + fz * 3.2, { size: fz * .96, color: pal.green, align: 'left', weight: 600 });
        }
      };

      /* practice pictures */
      const drawPrac = (c, p) => {
        const pal = p.pal, pr = PROBS[prIdx], R = rect(p, 10, p.h - 10);
        if (prOver) { T(c, 'All seven done', p.w / 2, p.h / 2, { size: 22, color: pal.text, weight: 700 }); return; }
        if (pr.viz === 'seq') {
          const cards = SEQ.map(s => s.card);
          ladder(c, pal, cards, prPlaced.length, R);
          return;
        }
        if (pr.viz === 'main2') { ladder(c, pal, ML, prSolved ? (prIdx === 1 ? 4 : 7) : (prIdx === 1 ? 3 : 6), R); return; }
        if (pr.viz === 'bad') { ladder(c, pal, BADL, prSolved ? 6 : 5, R); return; }
        if (pr.viz === 'lemma') { lemma(c, pal, R, [1, 3, 5, 7], 2); return; }
        if (pr.viz === 'tiles') {
          tiles(c, pal, { x: 12, y: 24, w: p.w - 24, h: p.h * .62 }, pr.ring, null);
          T(c, 'Outlined: 2, 7, 9 and 12', p.w / 2, 12, { size: 13, color: pal.muted });
          return;
        }
        if (pr.viz === 'line') {
          const y = p.h / 2, x0 = 30, x1 = p.w - 30, sc = (x1 - x0) / 4.4, X = v => (x0 + x1) / 2 + v * sc, fs = clamp(p.w / 26, 12.5, 16);
          c.strokeStyle = pal['grid-strong']; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
          for (let v = -2; v <= 2; v++) { c.beginPath(); c.moveTo(X(v), y - 6); c.lineTo(X(v), y + 6); c.stroke(); T(c, sgn(v), X(v), y + 22, { size: fs, color: pal.muted }); }
          [[S2, '√2', pal.blue], [-S2, '−√2', pal.red], [0, 'sum 0', pal.green]].forEach(([v, t, col], i) => {
            c.beginPath(); c.arc(X(v), y, 8, 0, TAU); c.fillStyle = col; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 2; c.stroke();
            T(c, t, X(v), y - 24 - (i === 2 ? 22 : 0), { size: fs, color: col, weight: 700 });
          });
          T(c, 'Irrational plus irrational can land on a fraction', p.w / 2, y + 62, { size: fs * .95, color: pal.text, weight: 600 });
        }
      };

      P.onDraw = (c, p) => {
        if (st.practice) return drawPrac(c, p);
        ({ measure: drawMeasure, proof: drawProof, whatif: drawWhat, descent: drawDescent }[st.part])(c, p);
      };

      /* clicking the chart picks a ruler */
      cv.addEventListener('pointerdown', e => {
        if (st.practice || st.part !== 'measure' || st.mpred === null) return;
        const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, Ht = P.h * (P.w / P.h < 1 ? .56 : .62);
        if (y < Ht) return;
        const k = Math.round((x - 22) / ((P.w - 44) / 100) + .5);
        st.q = clamp(k, 1, 100); sync();
      });

      /* ----- panel helpers ----- */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const addTo = (...els) => panel.append(...els);
      const qStyle = 'margin:0;font-size:.95rem;line-height:1.5';
      const mkPick = () => {
        const title = h('p', { class: 'ctl-title' }), q = h('p', { style: qStyle }), row = h('div', { class: 'ctl buttons' }),
          fb = h('div', { class: 'ctl readout', 'aria-live': 'polite' }), nx = mkBtn('Continue', () => {}, true), nrow = h('div', { class: 'ctl buttons' }, nx);
        addTo(title, q, row, fb, nrow);
        return { title, q, row, fb, nx, nrow };
      };
      /* draws a picker from state: wrong = indexes already tried, ok = solved */
      const showPick = (U, o) => {
        U.title.textContent = o.title; U.q.textContent = o.q; U.row.replaceChildren();
        o.opts.forEach((op, i) => {
          const b = mkBtn(op[0], () => o.pick(i));
          if (o.ok) { b.disabled = true; if (i === o.ans) b.classList.add('primary'); } else if (o.wrong.includes(i)) b.disabled = true;
          U.row.append(b);
        });
        U.fb.innerHTML = o.fb || ''; U.nx.textContent = o.last ? o.last : 'Continue'; U.nrow.style.display = o.ok ? '' : 'none';
        U.nx.onclick = o.next;
      };

      let predQ, predRow, predFb, qS, bestRow, mRo;
      let partBtns, pfU, lemRow, lemFb, restartP, wBtns, wPredQ, wPredRow, wPredFb, wStepRow, wRo, dU, seedRow, dRo, restartD;
      let startBtn, ptally, pq, pch, pfb, pnext;

      grp('parts', () => {
        C.title('Choose a part');
        partBtns = C.buttons([['measure', 'Measure'], ['proof', 'The proof'], ['whatif', 'What if?'], ['descent', 'Fold']].map(([k, l]) => ({ label: l, onClick: () => { cancel(); st.part = k; sync(); } })));
      });

      /* --- measure --- */
      grp('measure', () => {
        C.title('Predict first');
        predQ = h('p', { style: qStyle }, 'Pick a ruler with q units along the side. If the diagonal fitted a whole number of units, then √2 would be a fraction p/q. We try every q from 1 to 100. Will any of them fit the diagonal EXACTLY?');
        predRow = h('div', { class: 'ctl buttons' }); predFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        addTo(predQ, predRow, predFb);
        C.title('Choose the ruler');
        qS = C.slider({ label: 'The side is q units long', min: 1, max: 100, step: 1, value: 5, format: v => 'q = ' + v, onInput: v => { st.q = v; sync(); } });
        qS.inp = panel.lastElementChild.querySelector('input');
        C.hint('Or tap the best rulers so far, or tap the bars on the picture.');
        bestRow = C.buttons(BEST.map(v => ({ label: 'q = ' + v, onClick: () => { st.q = v; sync(); } })));
        mRo = C.readout();
      });
      const MOPTS = [
        ['Yes: some q up to 100 fits exactly', 'There is no such q. Every ruler leaves a gap. Look at the bars: none reaches 0.'],
        ['No: there is always a leftover gap, though some are tiny', ok('Right.') + ' The best ruler is q = 70: the diagonal is 98.995 units, only 0.0051 short of 99. Tiny, but not 0. This is evidence, not proof. A search of 100 rulers says nothing about q = 101 or q = a million. The proof comes next.'],
        ['Only the first few q fit, then it stops fitting', 'No q fits, not even the first few. q = 1 gives a diagonal of 1.414 units, q = 2 gives 2.828, and so on.']];
      const renderPred = () => {
        predRow.replaceChildren();
        MOPTS.forEach((o, i) => {
          const b = mkBtn(o[0], () => { if (st.mpred !== null) return; st.mpred = i; sync(); });
          if (st.mpred !== null) { b.disabled = true; if (i === st.mpred) b.classList.add('primary'); }
          predRow.append(b);
        });
        predFb.innerHTML = st.mpred === null ? '' : (st.mpred === 1 ? '' : no('Not quite.') + ' ') + MOPTS[st.mpred][1];
      };
      const measureRo = () => {
        const m = meas(st.q), q = st.q;
        const L = [`${kk('Ruler')} the side is ${q} unit${q > 1 ? 's' : ''} long`,
          `${kk('Diagonal')} ${q} × √2 = ${m.D.toFixed(3)} units`,
          `${kk('Nearest whole number')} p = ${m.p}. ${m.D > m.p ? 'Over' : 'Short'} by ${m.gap.toFixed(4)}`,
          `${kk('Test p/q')} ${m.p}² = ${m.p * m.p} and 2 × ${q}² = ${2 * q * q}, so p² − 2q² = <b>${sgn(m.d)}</b>`,
          `p²/q² = ${(m.p * m.p / (q * q)).toFixed(4)}, not 2`];
        if (q === 70) L.push(ok('The best ruler up to 100.') + ' 99/70 is very close to √2, but 99² − 2 × 70² = 9801 − 9800 = 1, not 0.');
        L.push('p² − 2q² is always a whole number, and for this q it is not 0. Whole numbers do not get between 0 and 1, so its size is at least 1. Is it 0 for some larger q? The proof settles that for every q.');
        return lines(L);
      };

      /* --- the proof --- */
      grp('proof', () => {
        pfU = mkPick();
        lemRow = h('div', { class: 'ctl buttons' }); lemFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pfU.row.after(lemRow); lemRow.after(lemFb);
        [1, 3, 5, 7].forEach(n => lemRow.append(mkBtn(`Square ${n}`, () => { if (!st.lem.includes(n)) st.lem.push(n); st.pfFb = `${n}² = ${n * n}. And ${n * n} = 2 × ${(n * n - 1) / 2} + 1: ${(n * n - 1) / 2} pair${n === 1 ? 's' : (n * n - 1) / 2 > 1 ? 's' : ''} and one left over, so ${n * n} is odd.` + (st.lem.length === 4 ? ' ' + ok('All four odd squares are odd.') + ' Is that luck? The next two stops show it is not.' : ''); if (st.lem.length === 4) st.pfOk = true; sync(); })));
        restartP = h('div', { class: 'ctl buttons' }, mkBtn('Restart the proof', () => { st.pf = 0; st.pfOk = false; st.pfW = []; st.pfFb = ''; st.lem = []; sync(); }));
        addTo(restartP);
      });
      const pfPick = i => {
        const s = PF[st.pf]; if (st.pfOk) return;
        if (i === s.ans) { st.pfOk = true; st.pfFb = s.opts[i][1]; } else { st.pfW.push(i); st.pfFb = no('Not quite.') + ' ' + s.opts[i][1] + ' Try another answer.'; }
        sync();
      };
      const pfNext = () => {
        if (st.pf < PF.length - 1) { st.pf++; st.pfOk = false; st.pfW = []; st.pfFb = ''; sync(); }
      };

      /* --- what if --- */
      grp('whatif', () => {
        C.title('Choose a square root');
        wBtns = C.buttons(WNS.map(N => ({ label: '√' + N, onClick: () => { st.wi = N; st.wpred = null; st.wk = 0; sync(); } })));
        wPredQ = h('p', { style: qStyle }); wPredRow = h('div', { class: 'ctl buttons' }); wPredFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        wStepRow = h('div', { class: 'ctl buttons' });
        wRo = C.readout();
        addTo(wPredQ, wPredRow, wPredFb, wStepRow);
        panel.append(wRo);
      });
      const renderWhat = () => {
        const N = st.wi, L = wlines(N), sq = !!WI[N].sq;
        wPredQ.innerHTML = `<b>Predict.</b> Run the same argument on √${N}: assume √${N} = p/q in lowest terms and follow the same steps. Will it end in a contradiction?`;
        wPredRow.replaceChildren();
        [['Yes: it will end in a contradiction', false], ['No: it will get stuck', true]].forEach(([l, stuck], i) => {
          const b = mkBtn(l, () => { if (st.wpred !== null) return; st.wpred = i; st.wk = 1; sync(); });
          if (st.wpred !== null) { b.disabled = true; if (i === st.wpred) b.classList.add('primary'); }
          wPredRow.append(b);
        });
        wStepRow.replaceChildren();
        if (st.wpred !== null) {
          const right = (st.wpred === 1) === sq;
          wPredFb.innerHTML = right ? ok('Good prediction.') + ' Now press Next line to see why.' : no('Not what happens.') + ' Press Next line and watch where it goes.';
          wStepRow.append(mkBtn('Next line', () => { if (st.wk < L.length) st.wk++; sync(); }, st.wk < L.length), mkBtn('Show all', () => { st.wk = L.length; sync(); }), mkBtn('Start over', () => { st.wpred = null; st.wk = 0; sync(); }));
          wStepRow.firstChild.disabled = st.wk >= L.length;
        } else wPredFb.innerHTML = '';
        const out = [];
        if (st.wpred !== null) {
          for (let i = 0; i < st.wk; i++) out.push(`${kk('Line ' + (i + 1))} ${L[i][0]}`);
          out.push(L[st.wk - 1][3]);
          if (st.wk === L.length) out.push(sq
            ? ok(`The argument gets stuck. √${N} = ${WI[N].d}/1 is a fraction.`) + ' The proof does not fail: it never claimed to cover perfect squares. It shows exactly where a perfect square escapes.'
            : ok(`Contradiction.`) + ` √${N} is irrational. The key was a prime (${WI[N].d}) dividing p², and so dividing p.`);
        } else out.push('Make your prediction to start. The tile chart shows the perfect squares from 1 to 30 in yellow.');
        wRo.innerHTML = lines(out);
      };

      /* --- the folding proof --- */
      grp('descent', () => {
        dU = mkPick();
        seedRow = C.buttons(SEEDS.map(([a, c]) => ({ label: `Fold ${a}, ${a}, ${c}`, onClick: () => { st.seed = SEEDS.findIndex(s => s[0] === a); sync(); } })));
        dRo = C.readout();
        restartD = h('div', { class: 'ctl buttons' }, mkBtn('Restart the folding proof', () => { cancel(); st.ds = 0; st.dOk = false; st.dW = []; st.dFb = ''; st.fold = 0; sync(); }));
        addTo(restartD);
      });
      const dPick = i => {
        const s = DS[st.ds]; if (st.dOk) return;
        if (i === s.ans) {
          st.dOk = true; st.dFb = s.opts[i][1];
          if (st.ds === 0) { cancel(); st.fold = 0; cancel0 = animateTo(st, { fold: 1 }, 1000, sync); }
        } else { st.dW.push(i); st.dFb = no('Not quite.') + ' ' + s.opts[i][1] + ' Try another answer.'; }
        sync();
      };
      const dNext = () => { if (st.ds < DS.length - 1) { st.ds++; st.dOk = false; st.dW = []; st.dFb = ''; sync(); } };
      const descentRo = () => {
        if (st.ds < 4 || (st.ds === 4 && !st.dOk)) return 'Answer the questions to build the smaller triangle. The yellow flap is the folded leg.';
        const rows = chain(SEEDS[st.seed]), L = [];
        rows.forEach((r, i) => L.push(`${kk(i === 0 ? 'Start' : 'Fold ' + i)} legs ${r[0]}, hypotenuse ${r[1]}: ${r[1]}² − 2 × ${r[0]}² = ${r[1] * r[1]} − ${2 * r[0] * r[0]} = <b>${sgn(r[2])}</b>`));
        const last = rows[rows.length - 1];
        L.push((last[1] <= last[0] ? `The next fold needs a hypotenuse longer than a leg, but ${last[1]} is not longer than ${last[0]}.` : `The next fold would need hypotenuse 2a − c = ${2 * last[0] - last[1]}, which is not a length.`) + ' So the chain stops. These numbers are a near miss, not an exact triangle.');
        L.push('The pictured triangle is the exact shape, drawn with legs 1. An exact whole-number triangle would never stop, which is the contradiction.');
        if (st.ds === DS.length - 1 && st.dOk) L.push(ok('What it means:') + ' no unit, however small, measures both the side and the diagonal of a square. On the number line, √2 is a point that no fraction reaches.');
        return lines(L);
      };

      /* ----- practice ----- */
      C.title('Practice');
      C.hint('Seven short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); if (st.practice) { st.practice = false; sync(); } else { st.practice = true; if (!prOver) loadProb(); sync(); } } }])[0];
      grp('practice', () => {
        ptally = h('p', { class: 'ctl-title' });
        pq = h('p', { style: qStyle });
        pch = h('div', { class: 'ctl buttons' });
        pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pnext = mkBtn('Next problem', () => nextProb(), true);
        addTo(ptally, pq, pch, pfb, h('div', { class: 'ctl buttons' }, pnext));
      });
      const tally = () => { ptally.textContent = `Problem ${prIdx + 1} of ${PROBS.length}. Right on the first try: ${prFirst} of ${prDone} done`; };
      const renderProb = () => {
        const pr = PROBS[prIdx]; pch.replaceChildren();
        if (prOver) return;
        if (pr.kind === 'seq') {
          const left = SEQ_ORDER.filter(i => !prPlaced.includes(i));
          left.forEach(i => { const b = mkBtn(SEQ[i].t, () => pickSeq(i)); if (prW.includes(i)) b.disabled = true; pch.append(b); });
        } else pr.ch.forEach((o, i) => {
          const b = mkBtn(o[0], () => pickChoice(i));
          if (prSolved) { b.disabled = true; if (i === pr.ans) b.classList.add('primary'); } else if (prW.includes(i)) b.disabled = true;
          pch.append(b);
        });
        pfb.innerHTML = prFb; pnext.disabled = !prSolved;
      };
      const loadProb = () => {
        const pr = PROBS[prIdx]; prSolved = false; prTried = false; prPlaced = []; prW = []; prFb = '';
        pq.textContent = pr.q; pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        tally(); renderProb();
      };
      const solved = () => { prSolved = true; if (!prTried) prFirst++; prDone++; };
      const pickChoice = i => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        if (i === pr.ans) { solved(); prFb = pr.ch[i][1]; } else { prTried = true; prW.push(i); prFb = no('Not quite.') + ' ' + pr.ch[i][1] + ' Try another answer.'; }
        tally(); sync();
      };
      const pickSeq = i => {
        if (prSolved) return;
        if (i === prPlaced.length) {
          prPlaced.push(i); prW = [];
          if (prPlaced.length === SEQ.length) { solved(); prFb = ok('Right.') + ' ' + SEQ[i].why + ' The proof is complete.'; }
          else prFb = ok('Yes.') + ' ' + SEQ[i].why + ' What comes next?';
        } else { prTried = true; prW.push(i); prFb = no('Not yet.') + ' ' + SEQ[i].need; }
        tally(); sync();
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); sync(); return; }
        prOver = true; prSolved = false;
        pq.textContent = 'All seven problems are done.'; pch.replaceChildren(); pnext.disabled = true;
        prFb = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        pfb.innerHTML = prFb;
        pch.append(mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; prOver = false; loadProb(); sync(); }, true));
        ptally.textContent = `Right on the first try: ${prFirst} of ${PROBS.length}`; sync();
      };

      /* ----- sync ----- */
      const sync = () => {
        const prac = st.practice, part = st.part;
        vis(G.parts, !prac); vis(G.measure, !prac && part === 'measure'); vis(G.proof, !prac && part === 'proof');
        vis(G.whatif, !prac && part === 'whatif'); vis(G.descent, !prac && part === 'descent'); vis(G.practice, prac);
        partBtns.forEach((b, i) => b.classList.toggle('primary', ['measure', 'proof', 'whatif', 'descent'][i] === part));
        if (!prac && part === 'measure') {
          qS.set(st.q); qS.inp.disabled = st.mpred === null; bestRow.forEach(b => { b.disabled = st.mpred === null; });
          renderPred(); mRo.innerHTML = st.mpred === null ? 'Make your prediction first. Then the slider and the best-ruler buttons unlock.' : measureRo();
        }
        if (!prac && part === 'proof') {
          const s = PF[st.pf];
          showPick(pfU, { title: `Stop ${st.pf + 1} of ${PF.length}: ${s.title}`, q: s.q, opts: s.opts, ans: s.ans, wrong: st.pfW, ok: st.pfOk, fb: s.kind === 'table' ? '' : st.pfFb, pick: pfPick, next: pfNext,
            last: st.pf === PF.length - 1 ? 'Done: go to the Fold part' : 'Continue' });
          if (st.pf === PF.length - 1) { pfU.nx.onclick = () => { st.part = 'descent'; sync(); }; }
          lemRow.style.display = s.kind === 'table' ? '' : 'none'; lemFb.style.display = s.kind === 'table' ? '' : 'none';
          lemFb.innerHTML = s.kind === 'table' ? st.pfFb : '';
          Array.from(lemRow.children).forEach((b, i) => { b.classList.toggle('primary', st.lem.includes([1, 3, 5, 7][i])); });
          if (s.kind === 'table') pfU.row.style.display = 'none'; else pfU.row.style.display = '';
        }
        if (!prac && part === 'whatif') { wBtns.forEach((b, i) => b.classList.toggle('primary', WNS[i] === st.wi)); renderWhat(); }
        if (!prac && part === 'descent') {
          const s = DS[st.ds];
          showPick(dU, { title: `Stop ${st.ds + 1} of ${DS.length}: ${s.title}`, q: s.q, opts: s.opts, ans: s.ans, wrong: st.dW, ok: st.dOk, fb: st.dFb, pick: dPick, next: dNext, last: 'Continue' });
          if (st.ds === DS.length - 1) dU.nrow.style.display = 'none';
          const seedOn = st.ds > 4 || (st.ds === 4 && st.dOk);
          vis(seedRow, true); seedRow.forEach((b, i) => { b.disabled = !seedOn; b.classList.toggle('primary', i === st.seed); });
          dRo.innerHTML = descentRo();
        }
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        if (prac) { tally(); renderProb(); }
        P.draw();
      };

      const FLAGS = ['part', 'q', 'wi'];
      const apply = patch => {
        cancel(); st.practice = false;
        for (const k of FLAGS) if (patch[k] !== undefined) st[k] = patch[k];
        if (patch.wi !== undefined) { st.wpred = null; st.wk = 0; }
        sync();
      };
      loadProb(); sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
