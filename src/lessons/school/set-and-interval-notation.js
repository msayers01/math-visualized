/* =====================================================================
   SCHOOL — Set and interval notation
   ===================================================================== */
{
  const MI = '−', INF = Infinity;
  const SANS = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
  const SERIF = '"STIX Two Text", "Cambria Math", "Times New Roman", serif';
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;
  const lines = a => a.filter(Boolean).join('<br>');

  /* ---------- numbers and intervals ---------- */
  const nf = v => (v < 0 ? MI : '') + (+Math.abs(v).toFixed(1));
  const ep = v => (v === -INF ? MI + '∞' : v === INF ? '∞' : nf(v));
  const iv = (lo, hi, lc, hc) => ({ lo, hi, lc: lo === -INF ? false : lc, hc: hi === INF ? false : hc });
  const ivText = s => (s.lc ? '[' : '(') + ep(s.lo) + ', ' + ep(s.hi) + (s.hc ? ']' : ')');
  const isEmpty = s => s.lo > s.hi || (s.lo === s.hi && !(s.lc && s.hc));
  const inIv = (s, x) => !isEmpty(s) && (x > s.lo || (x === s.lo && s.lc)) && (x < s.hi || (x === s.hi && s.hc));
  const inter = (a, b) => {
    let lo, lc, hi, hc;
    if (a.lo > b.lo) { lo = a.lo; lc = a.lc; } else if (a.lo < b.lo) { lo = b.lo; lc = b.lc; } else { lo = a.lo; lc = a.lc && b.lc; }
    if (a.hi < b.hi) { hi = a.hi; hc = a.hc; } else if (a.hi > b.hi) { hi = b.hi; hc = b.hc; } else { hi = a.hi; hc = a.hc && b.hc; }
    return iv(lo, hi, lc, hc);
  };
  const unite = (a, b) => {
    const L = [a, b].filter(s => !isEmpty(s)).sort((p, q) => (p.lo === q.lo ? 0 : p.lo - q.lo) || (q.lc - p.lc));
    if (L.length < 2) return L;
    const [p, q] = L;
    if (p.hi > q.lo || (p.hi === q.lo && (p.hc || q.lc))) {
      let hi, hc;
      if (p.hi > q.hi) { hi = p.hi; hc = p.hc; } else if (p.hi < q.hi) { hi = q.hi; hc = q.hc; } else { hi = p.hi; hc = p.hc || q.hc; }
      return [iv(p.lo, hi, p.lc || (q.lo === p.lo && q.lc), hc)];
    }
    return [p, q];
  };
  const listText = L => (L.length ? L.map(ivText).join(' ∪ ') : '∅');
  const ineqOf = s => {
    if (isEmpty(s)) return '';
    if (s.lo === s.hi) return 'x = ' + nf(s.lo);
    if (s.lo === -INF && s.hi === INF) return 'x ∈ R';
    if (s.lo === -INF) return 'x ' + (s.hc ? '≤' : '<') + ' ' + nf(s.hi);
    if (s.hi === INF) return 'x ' + (s.lc ? '≥' : '>') + ' ' + nf(s.lo);
    return nf(s.lo) + ' ' + (s.lc ? '≤' : '<') + ' x ' + (s.hc ? '≤' : '<') + ' ' + nf(s.hi);
  };
  const sbOf = s => (isEmpty(s) ? '∅' : s.lo === s.hi ? '{ ' + nf(s.lo) + ' }' : '{ x | ' + ineqOf(s) + ' }');
  const wordsOf = s => {
    if (isEmpty(s)) return 'no numbers at all';
    if (s.lo === s.hi) return 'only the number ' + nf(s.lo);
    const lo = s.lo === -INF ? null : (s.lc ? 'at least ' : 'greater than ') + nf(s.lo);
    const hi = s.hi === INF ? null : (s.hc ? 'at most ' : 'less than ') + nf(s.hi);
    if (!lo && !hi) return 'every real number';
    return 'all numbers ' + [lo, hi].filter(Boolean).join(' and ');
  };
  const capOf = s => {            /* the graph in words */
    if (isEmpty(s)) return 'Nothing is shaded.';
    if (s.lo === s.hi) return 'One closed circle at ' + nf(s.lo) + '.';
    const e = (v, c) => (c ? 'closed' : 'open') + ' circle at ' + nf(v), an = v => (v ? 'A ' : 'An ');
    if (s.lo === -INF && s.hi === INF) return 'The whole line is shaded.';
    if (s.lo === -INF) return an(s.hc) + e(s.hi, s.hc) + ', shaded to the left.';
    if (s.hi === INF) return an(s.lc) + e(s.lo, s.lc) + ', shaded to the right.';
    return an(s.lc) + e(s.lo, s.lc) + ' and ' + (s.hc ? 'a ' : 'an ') + e(s.hi, s.hc) + ', shaded between.';
  };

  /* ---------- canvas helpers (pixel space) ---------- */
  const font = (size, weight = 600, serif) => (serif ? `400 ${size}px ${SERIF}` : `${weight} ${size}px ${SANS}`);
  const T = (c, p, s, x, y, { size = 14, color, align = 'center', weight = 600, halo = true, serif = false } = {}) => {
    c.font = font(size, weight, serif); c.textAlign = align; c.textBaseline = 'middle';
    if (halo) { c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(s, x, y); }
    c.fillStyle = color || p.pal.text; c.fillText(s, x, y);
  };
  const para = (c, p, text, x, y, maxW, o = {}) => {
    const size = o.size || 14, lh = size * 1.4, words = text.split(' '), ls = []; let cur = '';
    c.font = font(size, o.weight || 600, o.serif);
    for (const w of words) { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > maxW && cur) { ls.push(cur); cur = w; } else cur = t; }
    ls.push(cur);
    ls.forEach((l, i) => T(c, p, l, x, y + i * lh, o));
    return y + ls.length * lh;
  };
  const line = (c, x0, y0, x1, y1, color, width = 2, dash) => {
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.strokeStyle = color; c.lineWidth = width; c.setLineDash(dash || []); c.lineCap = 'round'; c.stroke(); c.setLineDash([]);
  };
  const head = (c, x, y, dx, s, color) => { c.beginPath(); c.moveTo(x + dx * s, y); c.lineTo(x, y - s * .6); c.lineTo(x, y + s * .6); c.closePath(); c.fillStyle = color; c.fill(); };
  const rrect = (c, x, y, w, hh, r) => {
    r = Math.min(r, w / 2, hh / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + hh, r); c.arcTo(x + w, y + hh, x, y + hh, r); c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  const circ = (c, p, x, y, r, color, closed, lw = 3.5) => {
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = closed ? color : p.pal.stage; c.fill(); c.strokeStyle = color; c.lineWidth = lw; c.stroke();
  };
  const fsOf = p => clamp(p.w / 26, 12.5, 16);
  const box = (p, y, lo = -7, hi = 7) => ({ x0: 26, x1: p.w - 26, y, lo, hi });
  const axis = (c, p, B, fs, labels = true) => {
    const pal = p.pal, X = v => B.x0 + (v - B.lo) / (B.hi - B.lo) * (B.x1 - B.x0), per = (B.x1 - B.x0) / (B.hi - B.lo), skip = per >= 20 ? 1 : 2;
    line(c, B.x0 - 10, B.y, B.x1 + 10, B.y, pal.muted, 2.2);
    head(c, B.x0 - 12, B.y, -1, 8, pal.muted); head(c, B.x1 + 12, B.y, 1, 8, pal.muted);
    for (let v = Math.ceil(B.lo) + 1; v < B.hi; v++) {
      line(c, X(v), B.y - 5, X(v), B.y + 5, v === 0 ? pal.text : pal.muted, v === 0 ? 2.2 : 1.4);
      if (labels && v % skip === 0) T(c, p, nf(v), X(v), B.y + 8 + fs, { size: fs, weight: v === 0 ? 800 : 600, color: v === 0 ? pal.text : pal.muted });
    }
    return X;
  };
  /* one interval drawn on a number line: bar, circles, arrow for infinity, bracket glyphs */
  const piece = (c, p, B, X, s, col, { a = 1, r = 9, glyph = false, fs = 14, bar = 8, ring = true } = {}) => {
    if (isEmpty(s) || a <= .01) return;
    const xl = s.lo === -INF ? B.x0 - 8 : X(s.lo), xr = s.hi === INF ? B.x1 + 8 : X(s.hi), pt = s.lo === s.hi;
    c.globalAlpha = a;
    if (!pt) line(c, xl, B.y, xr, B.y, col, bar);
    if (s.lo === -INF) head(c, xl - 2, B.y, -1, 12, col);
    if (s.hi === INF) head(c, xr + 2, B.y, 1, 12, col);
    if (ring && s.lo !== -INF) circ(c, p, xl, B.y, r, col, s.lc);
    if (ring && s.hi !== INF && !pt) circ(c, p, xr, B.y, r, col, s.hc);
    if (glyph) {
      const g = fs * 1.9;
      if (s.lo !== -INF) T(c, p, s.lc ? '[' : '(', xl, B.y - r - 14, { size: g, color: col, serif: true, halo: false });
      if (s.hi !== INF) T(c, p, s.hc ? ']' : ')', xr, B.y - r - 14, { size: g, color: col, serif: true, halo: false });
    }
    c.globalAlpha = 1;
  };
  const legend = (c, p, y, fs) => {
    const pal = p.pal;
    circ(c, p, 32, y, 6.5, pal.muted, false, 2.6);
    T(c, p, (p.w < 460 ? 'Open circle ( ): NOT included' : 'Open circle, parenthesis ( ): the number is NOT included'), 46, y, { size: fs, align: 'left', weight: 500, halo: false });
    circ(c, p, 32, y + fs * 1.8, 6.5, pal.muted, true, 2.6);
    T(c, p, (p.w < 460 ? 'Closed circle [ ]: included' : 'Closed circle, square bracket [ ]: the number IS included'), 46, y + fs * 1.8, { size: fs, align: 'left', weight: 500, halo: false });
  };
  const legH = fs => fs * 1.8 + 30;

  /* ---------- the four sets for the "sb" view ---------- */
  const RELS = {
    ge: { s: '≥', iv: iv(2, INF, true, false), w: 'at least 2', ok: x => x >= 2 },
    gt: { s: '>', iv: iv(2, INF, false, false), w: 'greater than 2', ok: x => x > 2 },
    le: { s: '≤', iv: iv(-INF, 2, false, true), w: 'at most 2', ok: x => x <= 2 },
    lt: { s: '<', iv: iv(-INF, 2, false, false), w: 'less than 2', ok: x => x < 2 }
  };

  /* ---------- "read a graph" tasks (step 3) ---------- */
  const RD = [
    { s: iv(2, INF, true, false), ans: 0,
      ch: [['[2, ∞)', 'The circle at 2 is closed, so 2 gets a square bracket. The shading runs right forever, so the right end is ∞ with a parenthesis.'],
           ['(2, ∞)', 'That would be an open circle at 2. The graph has a closed circle, so 2 is included: use [ not (.'],
           ['[2, ∞]', 'Almost. The 2 is right, but ∞ is not a number you can reach, so it always gets a parenthesis: [2, ∞).'],
           ['(−∞, 2]', 'That shades to the left of 2. This graph shades to the right.']] },
    { s: iv(-1, 4, false, true), ans: 2,
      ch: [['[−1, 4)', 'The brackets are swapped. The open circle is at −1, so −1 gets a parenthesis. The closed circle is at 4, so 4 gets a square bracket.'],
           ['(4, −1]', 'The endpoints are swapped. Write the left end of the graph first: the smaller number, −1, then 4.'],
           ['(−1, 4]', 'Open at −1, closed at 4, smaller number first: (−1, 4] means −1 &lt; x ≤ 4.'],
           ['(−1, 4)', 'The circle at 4 is closed, so 4 is included. It needs a square bracket: ].']] },
    { s: iv(-INF, 3, false, false), ans: 1,
      ch: [['[−∞, 3)', 'The 3 is right, but −∞ is not a number you can reach, so it always gets a parenthesis: (−∞, 3).'],
           ['(−∞, 3)', 'The shading goes left forever, so it starts at −∞ with a parenthesis. The circle at 3 is open, so 3 gets a parenthesis too.'],
           ['(−∞, 3]', 'That would be a closed circle at 3. The graph has an open circle, so 3 is not included.'],
           ['(3, ∞)', 'That shades to the right of 3. This graph shades to the left.']] },
    { s: iv(-2, 2, true, true), ans: 3,
      ch: [['(−2, 2)', 'Both circles are closed in the graph, so both ends are included: use square brackets.'],
           ['[2, −2]', 'The endpoints are swapped. The smaller number, −2, comes first.'],
           ['[−2, 2)', 'The circle at 2 is closed, so 2 is included: it needs ] not ).'],
           ['[−2, 2]', 'Both circles are closed, so both ends get a square bracket. This is −2 ≤ x ≤ 2.']] }
  ];

  /* ---------- combining two sets (step 4) ---------- */
  const CASES = [
    { name: 'A. x > −2 with x ≤ 3', A: iv(-2, INF, false, false), B: iv(-INF, 3, false, true), la: 'x > −2', lb: 'x ≤ 3',
      and: { ans: 0, o: [['(−2, 3]', 'Both rules must hold: greater than −2 AND at most 3. The left end is the larger one, −2, and it is open. The right end is the smaller one, 3, and it is closed. This is −2 &lt; x ≤ 3.'],
        ['[−2, 3)', 'The brackets are swapped. x > −2 does not allow −2 (open), and x ≤ 3 does allow 3 (closed).'],
        ['(−∞, ∞)', 'That is what OR gives. With AND, a number must follow both rules, so 5 is out because 5 ≤ 3 is false.']] },
      or: { ans: 0, o: [['(−∞, ∞)', 'Any number follows at least one rule. Take −5: −5 ≤ 3 is true. Take 5: 5 > −2 is true. Nothing escapes, so every real number is in the union.'],
        ['(−2, 3]', 'That is the overlap, which is AND. With OR, a number needs to follow only one rule, so −5 is in (it is at most 3).'],
        ['(−∞, −2) ∪ (3, ∞)', 'Those are the numbers that break one rule, but they still follow the other. The union is everything in either set, so the middle is in too.']] } },
    { name: 'B. x < −1 with x ≥ 4', A: iv(-INF, -1, false, false), B: iv(4, INF, true, false), la: 'x &lt; −1', lb: 'x ≥ 4',
      or: { ans: 1, o: [['(−1, 4)', 'That is the gap in the middle, the numbers that follow neither rule. The union is the two outer pieces.'],
        ['(−∞, −1) ∪ [4, ∞)', 'Two separate pieces, joined by ∪. x &lt; −1 is strict, so −1 gets ). x ≥ 4 includes 4, so 4 gets [.'],
        ['(−∞, −1] ∪ (4, ∞)', 'The brackets are on the wrong ends. x &lt; −1 does not include −1, so it needs ). x ≥ 4 includes 4, so it needs [.']] },
      and: { ans: 2, o: [['(−1, 4)', 'Those numbers follow neither rule, so they cannot be in both sets.'],
        ['(−∞, −1) ∪ [4, ∞)', 'That is the union (OR). For AND, a number must follow both rules.'],
        ['∅, the empty set', 'No number is both less than −1 and at least 4. The two graphs do not overlap, so the intersection has no elements.']] } },
    { name: 'C. x < 3 with 1 < x < 5', A: iv(-INF, 3, false, false), B: iv(1, 5, false, false), la: 'x &lt; 3', lb: '1 &lt; x &lt; 5',
      and: { ans: 1, o: [['(−∞, 5)', 'That is the union (OR). For AND, only the overlap counts.'],
        ['(1, 3)', 'The overlap starts at the larger left end, 1, and stops at the smaller right end, 3. Both are open, so both get parentheses.'],
        ['(1, 3]', 'x &lt; 3 is strict: 3 is not allowed, so it needs ).']] },
      or: { ans: 0, o: [['(−∞, 5)', 'A covers everything below 3. B covers 1 to 5. They overlap, so they join into one piece. The far right end is 5, and 5 is not in B, so ).'],
        ['(1, 3)', 'That is the overlap (AND). With OR, everything in either set counts, so −10 is in (it is in A).'],
        ['(−∞, 5]', 'Is 5 in B? No: B has an open circle at 5, and A stops at 3. So 5 is not in the union.']] } },
    { name: 'D. x < 0 with x > 0 (inputs of 1/x)', A: iv(-INF, 0, false, false), B: iv(0, INF, false, false), la: 'x &lt; 0', lb: 'x > 0',
      or: { ans: 2, o: [['(−∞, ∞)', 'That includes 0, but neither rule does: 0 &lt; 0 is false and 0 > 0 is false.'],
        ['(−∞, 0] ∪ [0, ∞)', 'Square brackets would include 0. Neither rule allows 0.'],
        ['(−∞, 0) ∪ (0, ∞)', 'Every number except 0. One interval cannot skip a number, so it takes two pieces joined by ∪. These are the allowed inputs of 1/x, because you cannot divide by 0.']] },
      and: { ans: 1, o: [['{0}', '0 is not in either set: 0 &lt; 0 is false and 0 > 0 is false.'],
        ['∅, the empty set', 'No number is both below 0 and above 0. The sets do not overlap, so the intersection is empty.'],
        ['(−∞, ∞)', 'That would put every number in both sets. A number like 5 is not below 0.']] } }
  ];

  /* ---------- practice problems (a fixed list) ---------- */
  const PROBS = [
    { name: 'Read the notation', top: '{ x | x < 4 }', rows: [{ lab: 'Graph', sets: [iv(-INF, 4, false, false)], col: 'blue', rv: true }], ans: 2,
      q: 'The set-builder expression is { x | x < 4 }. Which sentence says the same thing?',
      ch: [['The set of all x such that x is at most 4', '"At most 4" means x ≤ 4, which includes 4. The rule here is the strict x &lt; 4.'],
           ['The set that contains only the number 4', 'A rule after the bar describes many numbers. A set with only 4 in it would be written { 4 }.'],
           ['The set of all x such that x is less than 4', 'The bar means "such that", and the rule is x &lt; 4: every number below 4. The graph has an open circle at 4, because 4 is not less than 4.'],
           ['The set of all x such that x is greater than 4', 'x &lt; 4 reads "x is smaller than 4", so it does not mean bigger than 4.']] },
    { name: 'In or out', top: '{ x | −2 < x ≤ 5 }', rows: [{ lab: 'Graph', sets: [iv(-2, 5, false, true)], col: 'blue', rv: true }], ans: 1,
      q: 'True or false: −2 ∈ { x | −2 < x ≤ 5 }. (∈ means "is an element of".)',
      ch: [['True', 'Test −2 in the rule: is −2 &lt; −2? No, a number is not less than itself. So −2 fails the rule.'],
           ['False', 'The rule needs −2 &lt; x, and −2 &lt; −2 is false. The symbol is strict, so −2 ∉ the set. The graph shows an open circle at −2.']] },
    { name: 'Interval for a graph', top: '', rows: [{ lab: 'The graph', sets: [iv(-3, 1, true, false)], col: 'blue' }], ans: 0,
      q: 'A graph has a closed circle at −3 and an open circle at 1, with the line between them shaded. Which interval notation matches it?',
      ch: [['[−3, 1)', 'Closed at −3 means a square bracket there. Open at 1 means a parenthesis there. The smaller number comes first.'],
           ['(−3, 1]', 'The brackets are swapped. The graph is closed at −3 (square bracket) and open at 1 (parenthesis).'],
           ['[−3, 1]', 'The circle at 1 is open, so 1 is not included. It needs a parenthesis.'],
           ['[1, −3)', 'The endpoints are swapped. Write the smaller number first, the way you read the number line from left to right.']] },
    { name: 'Draw the graph', top: '(−∞, 2]', rows: [
        { lab: 'Graph A', sets: [iv(2, INF, true, false)], col: 'blue' }, { lab: 'Graph B', sets: [iv(-INF, 2, false, true)], col: 'blue' },
        { lab: 'Graph C', sets: [iv(-INF, 2, false, false)], col: 'blue' }, { lab: 'Graph D', sets: [iv(2, INF, false, false)], col: 'blue' }], ans: 1,
      q: 'Which graph shows (−∞, 2]? Each graph is also described in words on its button.',
      ch: [['Graph A: closed circle at 2, shaded to the right', 'That is [2, ∞): it starts at 2 and runs right. In (−∞, 2] the −∞ comes first, so the set runs from the far left up to 2.'],
           ['Graph B: closed circle at 2, shaded to the left', 'The −∞ end means the shading goes left forever. The ] after the 2 means 2 is included, so the circle is closed.'],
           ['Graph C: open circle at 2, shaded to the left', 'The shading direction (left) is correct, but the bracket ] means 2 is included. The circle must be closed.'],
           ['Graph D: open circle at 2, shaded to the right', 'The direction is wrong and so is the circle. This one is (2, ∞).']] },
    { name: 'A bracket trap', top: '', rows: [{ lab: 'Graph of x ≥ 3', sets: [iv(3, INF, true, false)], col: 'blue' }], ans: 3,
      q: 'A student writes the set x ≥ 3 as [3, ∞]. What is wrong, and what is the fix?',
      ch: [['Nothing is wrong: ∞ is the biggest number, so it gets a square bracket', 'There is no biggest number. Whatever number you name, a bigger one exists, so ∞ can never be an included endpoint.'],
           ['The 3 needs a parenthesis: (3, ∞]', 'x ≥ 3 allows x = 3, so 3 keeps its square bracket. The mistake is at the ∞ end.'],
           ['It should be (−∞, 3]', 'That is x ≤ 3, which goes left. x ≥ 3 goes right.'],
           ['The ∞ needs a parenthesis: [3, ∞)', '∞ is not a number you can reach, so it always gets a parenthesis. The 3 is included (≥ allows equal), so it keeps the square bracket.']] },
    { name: 'Intersection', top: '', rows: [{ lab: 'A = [−1, 5)', sets: [iv(-1, 5, true, false)], col: 'blue' }, { lab: 'B = (2, 8]', sets: [iv(2, 8, false, true)], col: 'red' },
        { lab: 'A ∩ B = (2, 5)', sets: [iv(2, 5, false, false)], col: 'violet', rv: true }], rng: [-3, 10], ans: 0,
      q: 'A = [−1, 5) and B = (2, 8]. What is A ∩ B, the numbers that are in both sets?',
      ch: [['(2, 5)', 'Start at the larger left end, 2. It is open because 2 is not in B. Stop at the smaller right end, 5. It is open because 5 is not in A. Only the stretch from 2 to 5 is in both.'],
           ['[−1, 8]', 'That is everything in either set joined together, the union (∪), not the overlap.'],
           ['(2, 5]', 'Is 5 in A? A has a parenthesis at 5, so no. A number must be in both sets.'],
           ['[−1, 2]', 'These numbers are in A, but B starts after 2. They are not in both.']] },
    { name: 'Union', top: '', rows: [{ lab: 'A = (−∞, 2)', sets: [iv(-INF, 2, false, false)], col: 'blue' }, { lab: 'B = [2, 6)', sets: [iv(2, 6, true, false)], col: 'red' },
        { lab: 'A ∪ B = (−∞, 6)', sets: [iv(-INF, 6, false, false)], col: 'violet', rv: true }], rng: [-4, 9], ans: 1,
      q: 'A = (−∞, 2) and B = [2, 6). Write A ∪ B, everything in either set, as one interval.',
      ch: [['(−∞, 2) ∪ (2, 6)', 'That leaves out 2, but 2 is in B (square bracket). Nothing is missing, so the pieces join.'],
           ['(−∞, 6)', 'A stops just before 2 and B starts at 2 with 2 included, so there is no gap. The pieces join into one. The far end is 6, which is not in B, so ).'],
           ['(−∞, 6]', 'Is 6 in B? No: B has a parenthesis at 6. So 6 is not in the union.'],
           ['[2, 6)', 'That is only B. The union also holds everything in A.']] },
    { name: 'A compound inequality', top: 'x < −3  or  x ≥ 1', rows: [{ lab: 'Answer', sets: [iv(-INF, -3, false, false), iv(1, INF, true, false)], col: 'violet', rv: true }], ans: 1,
      q: 'Write the compound inequality "x < −3 or x ≥ 1" in interval notation.',
      ch: [['(−3, 1)', 'That is the stretch in the middle, the numbers that follow neither rule.'],
           ['(−∞, −3) ∪ [1, ∞)', '"Or" means union. x &lt; −3 is strict, so −3 gets ). x ≥ 1 includes 1, so 1 gets [. Two pieces, joined by ∪.'],
           ['(−∞, −3] ∪ (1, ∞)', 'The brackets are on the wrong ends. x &lt; −3 does not include −3, and x ≥ 1 does include 1.'],
           ['(−∞, −3) ∩ [1, ∞)', '"Or" means union (∪). The symbol ∩ would give the overlap, which is empty here, because no number is both below −3 and at least 1.']] }
  ];

  register({
    id: 'set-and-interval-notation', level: 'school',
    title: 'Set and interval notation',
    blurb: 'One set of numbers in four languages: words, a number-line graph, set-builder notation and interval notation, plus how to combine sets with and and or.',
    thumb(c, p) {
      const pal = p.pal, W = p.w, H = p.h, y = H * .68, x0 = W * .1, x1 = W * .9, X = v => x0 + (v + 3) / 8 * (x1 - x0);
      T(c, p, '(−1, 4]', W / 2, H * .27, { size: Math.max(15, H * .22), serif: true, halo: false });
      line(c, x0, y, x1, y, pal.muted, 2.2); head(c, x1, y, 1, 7, pal.muted); head(c, x0, y, -1, 7, pal.muted);
      for (let v = -2; v <= 4; v++) line(c, X(v), y - 4, X(v), y + 4, pal.muted, 1.4);
      line(c, X(-1), y, X(4), y, pal.blue, 5);
      circ(c, p, X(-1), y, Math.max(4.5, H * .055), pal.blue, false, 2.5);
      circ(c, p, X(4), y, Math.max(4.5, H * .055), pal.blue, true, 2.5);
    },
    hook: String.raw`The answer to an inequality is not one number. It is a whole stretch of numbers, and you can say it four ways: in words, on a number line, with a rule, or with brackets like \((-1,4]\). What does the little bracket on the end mean, and why is it never a square bracket next to \(\infty\)?`,
    steps: [
      { title: 'Sets and elements',
        text: String.raw`<p>A <b>set</b> is a collection of things. The things inside are its <b>elements</b>. We list them in braces: \(S=\{2,4,6\}\). We write \(4\in S\) ("4 is in S") and \(5\notin S\) ("5 is not in S").</p><p>Press numbers to put them in or take them out. Order and repeats do not matter. A set with nothing in it is the <b>empty set</b>, \(\emptyset\). Some sets are too big to list, so next we describe them.</p>`,
        set: { view: 'sets' } },
      { title: 'Describe it with a rule',
        text: String.raw`<p>Nobody can list every \(x\) with \(x\ge 2\), because it never ends. So we write a rule: \(\{\,x \mid x\ge 2\,\}\). Read it "the set of all \(x\) such that \(x\) is at least 2". The bar \(\mid\) means "such that".</p><p>Drag the point, or use the slider. The readout says <b>in</b> when the number follows the rule and <b>out</b> when it does not. Test 2 itself, then switch between \(\ge\) and \(&gt;\).</p>`,
        set: { view: 'sb' } },
      { title: 'Interval notation',
        text: String.raw`<p>Interval notation is the short form. \((-1,4]\) means \(-1&lt;x\le 4\). A <b>square bracket</b> means the end number is included (closed circle). A <b>parenthesis</b> means it is not (open circle).</p><p>Predict first: which end of \(-1&lt;x\le 4\) will be closed? Then build intervals with the steppers, and read graphs. Infinity always gets a parenthesis, because you can never reach it.</p>`,
        set: { view: 'iv', ivMode: 'build' } },
      { title: 'And, or, and a look ahead',
        text: String.raw`<p>"And" means both rules hold: the <b>intersection</b> \(\cap\), the overlap. "Or" means at least one rule holds: the <b>union</b> \(\cup\), everything in either set.</p><p>Choose a case. Press and or or to combine the blue set A and the red set B into the violet set, then pick its notation. Case D shows the allowed inputs of \(\dfrac{1}{x}\): every number except 0.</p>`,
        set: { view: 'comb', cs: 0 } }
    ],
    formal: String.raw`
      <p>Sets are the language behind solving inequalities and finding the domain of a function. This page gives the notation and the reasons for each rule.</p>
      <h3>Sets and elements</h3>
      <p>A <em>set</em> is a collection of objects, its <em>elements</em>. Listing them in braces is <em>roster notation</em>: \(\{2,4,6\}\). We write \(3\in\{1,2,3\}\) (true) and \(5\notin\{1,2,3\}\) (also true). A number is either in the set or not, so the order of the list does not matter, and neither do repeats: \(\{1,2,3\}=\{3,1,2\}=\{1,2,2,3\}\). The <em>empty set</em> \(\emptyset=\{\}\) has no elements. Careful: \(\{0\}\) is not empty, it has one element, the number 0.</p>
      <h3>Set-builder notation</h3>
      <p>When a set is too big to list, we give a rule. \(\{\,x\mid x\ge 2\,\}\) is read "the set of all \(x\) such that \(x\) is at least 2". The part before the bar names the variable. The part after the bar is the rule. A number belongs to the set exactly when the rule is true for it. So \(2\in\{x\mid x\ge 2\}\), because \(2\ge 2\) is true, but \(2\notin\{x\mid x&gt;2\}\), because \(2&gt;2\) is false. The variable can have any name: \(\{t\mid t\ge 2\}\) is the same set.</p>
      <h3>Interval notation</h3>
      <p>An <em>interval</em> is all the numbers between two endpoints. Always write the smaller endpoint first, the way the number line reads left to right. A square bracket means the endpoint is included. A parenthesis means it is not.</p>
      <ul>
        <li>"at least 2": \(x\ge 2\), closed circle at 2, shaded right: \([2,\infty)\)</li>
        <li>"greater than \(-1\), at most 4": \(-1&lt;x\le 4\), open circle at \(-1\), closed at 4: \((-1,4]\)</li>
        <li>"less than 3": \(x&lt;3\), open circle at 3, shaded left: \((-\infty,3)\)</li>
        <li>"all real numbers": \((-\infty,\infty)\)</li>
      </ul>
      <h3>Why infinity always gets a parenthesis</h3>
      <p>A square bracket says "this number is in the set". But \(\infty\) is not a number. For any number you name, there is a bigger one, so there is no largest number to include. The shading just keeps going. So \(\infty\) and \(-\infty\) are always paired with a parenthesis, and \([3,\infty]\) is a mistake.</p>
      <h3>And and or</h3>
      <p>The <em>intersection</em> \(A\cap B\) holds the numbers that are in \(A\) and in \(B\). The <em>union</em> \(A\cup B\) holds the numbers in \(A\) or in \(B\) (or both). A compound inequality uses these words. For example, \(-2&lt;x\le 3\) means \(x&gt;-2\) and \(x\le 3\):
      \[ (-2,\infty)\cap(-\infty,3]=(-2,3]. \]
      To intersect two intervals, take the larger left end and the smaller right end. At each end, the bracket comes from the set that supplies that number. If both supply the same number, it is closed only if both are closed. If the left end ends up larger than the right end, the sets do not overlap and the intersection is \(\emptyset\). For example \((-\infty,-1)\cap[4,\infty)=\emptyset\).</p>
      <p>To unite two intervals that overlap, keep the smaller left end and the larger right end. For example \((-\infty,3)\cup(1,5)=(-\infty,5)\). Two intervals that only touch also join when at least one of them includes the shared number: \((-\infty,2)\cup[2,6)=(-\infty,6)\). But \((-\infty,0)\cup(0,\infty)\) cannot join, because 0 is in neither piece. Intervals that stay apart are written with \(\cup\) between them, as in \(x&lt;-1\) or \(x\ge 4\), which is \((-\infty,-1)\cup[4,\infty)\).</p>
      <h3>Connection to solving inequalities</h3>
      <p>The answer to an inequality is a set. Solve \(2x-1\ge 3\): add 1 to get \(2x\ge 4\), divide by 2 to get \(x\ge 2\). The solution set is \(\{x\mid x\ge 2\}=[2,\infty)\). A double inequality is an "and". Solve \(-3\le 2x+1&lt;7\): subtract 1 to get \(-4\le 2x&lt;6\), divide by 2 to get \(-2\le x&lt;3\). The solution is \([-2,3)\). Remember that dividing by a negative number flips the symbol before you write the interval.</p>
      <h3>A look ahead</h3>
      <p>The set of numbers you may put into \(\dfrac{1}{x}\) is every real number except 0, because you cannot divide by 0. In interval notation that is \((-\infty,0)\cup(0,\infty)\). This is called the <em>domain</em>, and the next lesson builds it carefully.</p>
      <h3>Common mistakes</h3>
      <ul>
        <li>Putting a square bracket next to \(\infty\). Infinity is not a number you can reach.</li>
        <li>Swapping the brackets: the open circle goes with the parenthesis, the closed circle with the square bracket.</li>
        <li>Writing the larger endpoint first, as in \((4,-1]\).</li>
        <li>Using \(\cap\) when the word is "or". "Or" is union, and "and" is intersection.</li>
        <li>Splitting a union that really joins, or joining one that has a hole, as at 0 for \(\dfrac{1}{x}\).</li>
      </ul>`,
    check: [
      { q: 'Which statement about the interval (2, 7] is true?',
        choices: ['7 is in the set, and 2 is not.', '2 is in the set, and 7 is not.', 'Both 2 and 7 are in the set.', 'Neither 2 nor 7 is in the set.'], answer: 0,
        why: String.raw`The parenthesis at 2 means 2 is not included. The square bracket at 7 means 7 is included. So \((2,7]\) is the set \(2&lt;x\le 7\). Choosing the second answer swaps the two brackets, the third treats both ends as closed, and the fourth treats both as open.`,
        hint: 'A square bracket includes its end number. A parenthesis leaves it out. Look at each end separately.' },
      { q: 'Solve both inequalities, then combine them with "and": 3x − 5 ≥ 4 and 2x + 1 < 11. Which interval notation gives all the x that make both true?',
        choices: ['(3, 5]', '[3, 5]', '[3, 5)', '(−∞, 3] ∪ [5, ∞)'], answer: 2,
        why: String.raw`First, \(3x-5\ge 4\) gives \(3x\ge 9\), so \(x\ge 3\). Second, \(2x+1&lt;11\) gives \(2x&lt;10\), so \(x&lt;5\). "And" means the overlap: \(x\ge 3\) and \(x&lt;5\), so 3 is included and 5 is not: \([3,5)\). \((3,5]\) swaps the brackets, \([3,5]\) includes 5 although \(5&lt;5\) is false, and the last answer is the numbers outside, which is not "and".`,
        hint: 'Solve each inequality for x first. Then ask which numbers are in both answers, and decide for each end whether it is included.' },
      { q: 'Sam writes the set "x < −1 or x ≥ 4" as (−1, 4]. Which statement is true?',
        choices: ['Sam is right: the endpoints −1 and 4 are written in order.', 'Sam is wrong: (−1, 4] is the stretch in the middle, which the rule leaves out. The set is (−∞, −1) ∪ [4, ∞).', 'Sam is wrong: it should be (−∞, −1) ∩ [4, ∞).', 'Sam is right, but the −1 needs a square bracket.'], answer: 1,
        why: String.raw`The rule "\(x&lt;-1\) or \(x\ge 4\)" describes two pieces, one far to the left and one far to the right. The numbers between \(-1\) and 4 follow neither part: for example 0 is not less than \(-1\) and not at least 4. Sam described the gap instead. "Or" means union, so the answer is \((-\infty,-1)\cup[4,\infty)\). Using \(\cap\) would give \(\emptyset\), because no number is both below \(-1\) and at least 4.`,
        hint: 'Test the number 0 in the rule. Is 0 less than −1, or at least 4? Then test 0 in Sam’s interval.' }
    ],
    links: { prereq: ['solving-linear-inequalities', 'the-real-number-system'], next: ['domain-and-range-of-functions'], related: ['absolute-value-equations-and-inequalities', 'graphing-linear-inequalities', 'systems-of-linear-inequalities', 'piecewise-and-step-functions', 'what-is-a-function'] },

    mount({ stage, controls: C }) {
      const panel = stage.nextElementSibling;
      const st = {
        view: 'sets', practice: false,
        set: [2, 4, 6], n: 5, way: 0,
        rel: 'ge', x: 1.5, tests: {}, show: 0,
        ivMode: 'build', gate: false, gateAns: -1, a: -1, b: 4, lc: false, hc: true, rev: 1, rd: 0, rdDone: false,
        cs: 0, op: null, cdone: {}
      };
      let cancel = () => {};
      const P = new Plane(stage, { cx: 0, cy: 0, span: 5 });
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const addTo = (...els) => panel.append(...els);
      const press = (b, on) => { b.classList.toggle('primary', on); b.setAttribute('aria-pressed', String(on)); };

      panel.append(h('style', {}, `
        .sin-step{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:.92rem}
        .sin-step span{min-width:7.5em}
        .sin-step output{min-width:3em;text-align:center;font-variant-numeric:tabular-nums;font-weight:600}
        .sin-step .btn{min-width:40px;padding:6px 10px}
        .sin-q{font-size:.92rem;line-height:1.5;margin:0}
        .sin-fb{font-size:.9rem;line-height:1.5}
      `));

      /* ================= canvas ================= */
      const tokLayout = p => {
        const r = clamp(p.w / 24, 13, 19), gap = r * .5, step = 2 * r + gap, set = st.set;
        const mem = [0, 1, 2, 3, 4, 5, 6, 7].filter(n => set.includes(n)), non = [0, 1, 2, 3, 4, 5, 6, 7].filter(n => !set.includes(n));
        const zh = 2 * r + 46, free = p.h - (92 + 2 * zh + 38 + 110), sp = clamp(free * .3, 0, 56), y1 = 88 + sp, y2 = y1 + zh + 38 + sp, pos = {};
        const row = (list, y) => { const w = list.length * step - gap; list.forEach((n, i) => { pos[n] = [p.w / 2 - w / 2 + r + i * step, y]; }); };
        row(mem, y1 + zh / 2 + 10); row(non, y2 + zh / 2 + 10);
        return { r, zh, y1, y2, pos };
      };

      const drawSets = (c, p) => {
        const pal = p.pal, W = p.w, fs = fsOf(p), L = tokLayout(p), set = st.set, n = st.n;
        const big = clamp(W / 11, 24, 38);
        T(c, p, 'S = ' + rosterText(), W / 2, 38, { size: big, serif: true, halo: false });
        const zone = (y, color, dash, cap) => {
          rrect(c, 14, y, W - 28, L.zh, 14); c.fillStyle = color === pal.blue ? alpha(pal.blue, .1) : 'rgba(0,0,0,0)'; c.fill();
          c.setLineDash(dash || []); c.strokeStyle = color; c.lineWidth = 2; c.stroke(); c.setLineDash([]);
          T(c, p, cap, 26, y + 15, { size: fs, align: 'left', weight: 700, color, halo: false });
        };
        zone(L.y1, pal.blue, null, 'inside S: the elements');
        zone(L.y2, pal.muted, [6, 6], 'outside S: not elements');
        for (let k = 0; k <= 7; k++) {
          const [x, y] = L.pos[k], inn = set.includes(k), col = inn ? pal.blue : pal.muted;
          c.beginPath(); c.arc(x, y, L.r, 0, Math.PI * 2); c.fillStyle = inn ? col : pal.stage; c.fill(); c.strokeStyle = col; c.lineWidth = 2.4; c.stroke();
          T(c, p, '' + k, x, y, { size: clamp(L.r * 1.05, 14, 19), color: inn ? pal.stage : pal.muted, halo: false, weight: 700 });
          if (k === n) { c.beginPath(); c.arc(x, y, L.r + 6, 0, Math.PI * 2); c.strokeStyle = pal.yellow; c.lineWidth = 3.4; c.stroke(); }
        }
        const yb = L.y2 + L.zh + 34, isIn = set.includes(n);
        T(c, p, isIn ? `${n} ∈ S` : `${n} ∉ S`, W / 2, yb, { size: clamp(W / 12, 24, 34), serif: true, color: isIn ? pal.green : pal.red, halo: false });
        T(c, p, isIn ? `${n} is an element of S` : `${n} is not an element of S`, W / 2, yb + big * .8, { size: fs + 1, weight: 500, color: pal.muted, halo: false });
        if (set.length === 0) para(c, p, 'Nothing is inside, so S is the empty set: ∅ or { }.', W / 2, yb + big * .8 + fs * 2.1, W - 40, { size: fs, weight: 600, color: pal.violet, halo: false });
      };

      const drawSb = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, fs = fsOf(p), R = RELS[st.rel], big = clamp(W / 11, 24, 38);
        const parts = [['{ x', 'all x'], ['|', 'such that'], [`x ${R.s} 2 }`, 'the rule']];
        c.font = font(big, 400, true);
        const ws = parts.map(q => c.measureText(q[0]).width), gap = clamp(W * .09, 26, 46), tot = ws.reduce((a, b) => a + b, 0) + gap * 2;
        let x = W / 2 - tot / 2; const y1 = 36;
        parts.forEach((q, i) => {
          const cx = x + ws[i] / 2, col = i === 1 ? pal.violet : pal.text;
          T(c, p, q[0], cx, y1, { size: big, serif: true, color: col, halo: false });
          line(c, x, y1 + big * .62, x + ws[i], y1 + big * .62, pal.violet, 2);
          T(c, p, q[1], cx, y1 + big * .62 + 15, { size: fs - .5, weight: 600, color: pal.muted, halo: false });
          x += ws[i] + gap;
        });
        const yw = para(c, p, `the set of all x such that x is ${R.w}`, W / 2, y1 + big * .62 + 52, W - 36, { size: fs + 1, weight: 600, halo: false });
        const B = box(p, Math.max(H * .55, yw + 74)), X = axis(c, p, B, fs); sbY = B.y;
        Object.keys(st.tests).forEach(k => {
          const v = +k, t = st.tests[k], col = t ? pal.green : pal.red;
          if (v === st.x) return;
          T(c, p, t ? '✓' : '✗', X(v), B.y - 22, { size: fs + 2, color: col, weight: 800, halo: false });
        });
        const inn = R.ok(st.x), col = inn ? pal.green : pal.red, px = X(st.x);
        line(c, px, B.y, px, B.y - 34, col, 2, [3, 3]);
        T(c, p, `${nf(st.x)}: ${inn ? 'in' : 'out'}`, px, B.y - 48, { size: fs + 2, color: col, weight: 800 });
        c.beginPath(); c.arc(px, B.y, 11, 0, Math.PI * 2); c.fillStyle = col; c.fill(); c.strokeStyle = pal.brass; c.lineWidth = 3; c.stroke();
        piece(c, p, B, X, R.iv, pal.blue, { a: st.show, fs });
        T(c, p, '✓ = in the set, ✗ = not in the set (green = in, red = out)', W / 2, B.y + 44 + fs, { size: fs - .5, weight: 500, color: pal.muted, halo: false });
        legend(c, p, H - legH(fs) + 6, fs - .5);
      };

      let sbY = 0;
      const curIv = () => iv(st.a, st.b, st.lc, st.hc);
      const drawIv = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, fs = fsOf(p), big = clamp(W / 9, 26, 42);
        if (st.ivMode === 'build') {
          const B = box(p, Math.max(H * .5, 170)), X = axis(c, p, B, fs);
          if (!st.gate) {
            T(c, p, '−1 < x ≤ 4', W / 2, 40, { size: big, serif: true, halo: false });
            para(c, p, 'Which end will be closed? Predict, then see.', W / 2, 40 + big * .9, W - 40, { size: fs + 1, weight: 600, color: pal.muted, halo: false });
            [-1, 4].forEach(v => { c.beginPath(); c.arc(X(v), B.y, 10, 0, Math.PI * 2); c.setLineDash([4, 4]); c.strokeStyle = pal.yellow; c.lineWidth = 2.6; c.stroke(); c.setLineDash([]); T(c, p, '?', X(v), B.y - 30, { size: fs * 2, color: pal.yellow, serif: true, halo: false }); });
          } else {
            const s = curIv();
            T(c, p, isEmpty(s) ? '∅' : s.lo === s.hi ? '{ ' + nf(s.lo) + ' }' : ivText(s), W / 2, 40, { size: big, serif: true, color: pal.blue, halo: false });
            T(c, p, sbOf(s), W / 2, 40 + big * .85, { size: fs + 4, serif: true, halo: false });
            para(c, p, 'In words: ' + wordsOf(s), W / 2, 40 + big * .85 + fs * 2, W - 40, { size: fs, weight: 600, color: pal.muted, halo: false });
            piece(c, p, B, X, s, pal.blue, { a: st.rev, glyph: true, fs });
            para(c, p, capOf(s), W / 2, B.y + 38 + fs, W - 40, { size: fs, weight: 500, color: pal.muted, halo: false });
          }
          legend(c, p, H - legH(fs) + 6, fs - .5);
        } else {
          const t = RD[st.rd], B = box(p, Math.max(H * .4, 150)), X = axis(c, p, B, fs);
          para(c, p, `Graph ${st.rd + 1} of ${RD.length}: which interval notation matches it?`, W / 2, 34, W - 40, { size: fs + 3, weight: 700, halo: false });
          piece(c, p, B, X, t.s, pal.blue, { fs });
          para(c, p, 'In words: ' + capOf(t.s), W / 2, B.y + 40 + fs, W - 40, { size: fs, weight: 600, color: pal.muted, halo: false });
          if (st.rdDone) T(c, p, ivText(t.s) + '   ' + sbOf(t.s), W / 2, B.y + 90 + fs * 2, { size: clamp(W / 14, 18, 28), serif: true, color: pal.green, halo: false });
          legend(c, p, H - legH(fs) + 6, fs - .5);
        }
      };

      const resList = (cs, op) => { const k = CASES[cs]; if (op === 'and') { const r = inter(k.A, k.B); return isEmpty(r) ? [] : [r]; } return unite(k.A, k.B); };
      /* generic rows: [{lab, sets, col, ghost}] */
      const drawRows = (c, p, rows, top, rng, note) => {
        const pal = p.pal, W = p.w, H = p.h, fs = fsOf(p);
        const [lo, hi] = rng || [-7, 7];
        const topH = top ? 62 : 8, botH = legH(fs) + 8 + (note ? fs * 4.2 : 0), avail = H - topH - botH, rh = avail / rows.length;
        if (top) T(c, p, top, W / 2, 34, { size: clamp(W / 11, 22, 36), serif: true, halo: false });
        rows.forEach((r, i) => {
          const y0 = topH + i * rh, B = box(p, y0 + rh * .56, lo, hi);
          T(c, p, r.lab, 32, y0 + Math.min(20, rh * .2), { size: fs, align: 'left', weight: 700, color: r.col ? pal[r.col] : pal.text, halo: false });
          const X = axis(c, p, B, fs - .5, r.labels !== false);
          (r.ghost || []).forEach(g => piece(c, p, B, X, g[0], pal[g[1]], { a: .22, bar: 6, r: 8, ring: false }));
          if (!r.hide) (r.sets || []).forEach(s => piece(c, p, B, X, s, pal[r.col || 'blue'], { fs, r: 8, bar: 7 }));
          if (r.hide) T(c, p, r.msg || '?', W / 2, B.y - rh * .22, { size: fs + 2, weight: 700, color: pal.muted, halo: false });
        });
        if (note) para(c, p, note, W / 2, H - legH(fs) - 8 - fs * 4.2 + 20, W - 30, { size: fs + 1, weight: 700, color: pal.violet, halo: false });
        legend(c, p, H - legH(fs) - 8 + 12, fs - .5);
      };
      const drawComb = (c, p) => {
        const pal = p.pal, k = CASES[st.cs], solved = !!st.cdone[st.cs + (st.op || '')], res = st.op ? resList(st.cs, st.op) : null;
        const opw = st.op === 'and' ? 'A and B   (∩, the overlap)' : 'A or B   (∪, everything in either)';
        const rows = [
          { lab: `A:  ${k.la.replace(/&lt;/g, '<')}    ${ivText(k.A)}`, sets: [k.A], col: 'blue' },
          { lab: `B:  ${k.lb.replace(/&lt;/g, '<')}    ${ivText(k.B)}`, sets: [k.B], col: 'red' },
          st.op ? { lab: opw + (solved ? '  =  ' + listText(res) : ''), sets: res, col: 'violet', ghost: [[k.A, 'blue'], [k.B, 'red']] }
            : { lab: 'A and B, or A or B?', hide: true, msg: 'Press "and" or "or" to combine', col: 'violet' }];
        drawRows(c, p, rows, '', [-7, 7], st.cs === 3 && st.op === 'or' ? 'Allowed inputs of 1/x: every real number except 0.' : '');
      };

      /* practice drawing */
      let prIdx = 0, prSolved = false, prTried = false, prFirst = 0, prDone = 0, prOver = false;
      const drawPrac = (c, p) => {
        if (prOver) { drawRows(c, p, [], 'All done', null); return; }
        const pr = PROBS[prIdx];
        const rows = pr.rows.filter(r => !r.rv || prSolved).map(r => ({ ...r }));
        if (!rows.length) rows.push({ lab: 'Answer', hide: true, msg: 'The graph appears when you answer', col: 'violet' });
        if (pr.name === 'Intersection' || pr.name === 'Union') {
          const idx = pr.rows.length - 1;
          if (!prSolved) { rows[idx] = { lab: pr.name === 'Union' ? 'A ∪ B' : 'A ∩ B', hide: true, msg: 'The graph appears when you answer', col: 'violet' }; }
          else rows[idx].ghost = [[pr.rows[0].sets[0], 'blue'], [pr.rows[1].sets[0], 'red']];
        }
        drawRows(c, p, rows, pr.top, pr.rng);
      };

      P.onDraw = (c, p) => {
        if (st.practice) return drawPrac(c, p);
        if (st.view === 'sets') drawSets(c, p); else if (st.view === 'sb') drawSb(c, p); else if (st.view === 'iv') drawIv(c, p); else drawComb(c, p);
      };

      /* ================= view 1: sets ================= */
      let setBtns, setSl, setFb, setWay;
      const rosterText = () => {
        const s = st.set.slice().sort((a, b) => a - b);
        if (!s.length) return '∅';
        let L = s;
        if (st.way === 1) L = s.slice().reverse();
        if (st.way === 2) L = [...s.slice().reverse(), ...s.slice(0, 2)];
        return '{' + L.join(', ') + '}';
      };
      grp('sets', () => {
        C.title('Build a set');
        setBtns = C.buttons([0, 1, 2, 3, 4, 5, 6, 7].map(n => ({ label: '' + n, onClick: () => toggleNum(n) })));
        setBtns.forEach((b, i) => b.setAttribute('aria-label', 'Number ' + i + ': put in or take out'));
        C.hint('Press a number to put it in the set or take it out. You can also tap a number on the canvas.');
        setSl = C.slider({ label: 'Test the number', min: 0, max: 7, step: 1, value: st.n, format: v => 'n = ' + v, onInput: v => { st.n = v; sync(); } });
        setWay = C.buttons([{ label: 'Write it another way', onClick: () => { st.way = (st.way + 1) % 3; sync(); } },
          { label: 'Reset to {2, 4, 6}', onClick: () => { st.set = [2, 4, 6]; st.way = 0; sync(); } },
          { label: 'Empty the set', onClick: () => { st.set = []; st.way = 0; sync(); } }]);
        setFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); panel.append(setFb);
      });
      const toggleNum = n => { st.set = st.set.includes(n) ? st.set.filter(v => v !== n) : [...st.set, n]; if (!st.set.length) st.way = 0; sync(); };
      const setsText = () => {
        const s = st.set.slice().sort((a, b) => a - b), n = st.n, isIn = s.includes(n), L = [];
        L.push(`${kk('The set')} S = ${rosterText()}` + (s.length ? `, which has ${s.length} element${s.length === 1 ? '' : 's'}.` : ', the empty set.'));
        if (st.way) {
          const listed = st.way === 2 ? s.length + Math.min(2, s.length) : s.length;
          L.push(`${kk('Another way')} This list has ${listed} entries, but it is the same set as {${s.join(', ')}}. ${st.way === 1 ? 'Order does not matter.' : 'Order and repeats do not matter: a number is in the set or it is not.'}`);
        }
        L.push(`${kk('Test')} n = ${n}: ${isIn ? ok(`${n} ∈ S`) + `. ${n} is listed, so it is an element.` : no(`${n} ∉ S`) + `. ${n} is not listed, so it is not an element.`}`);
        if (!s.length) L.push('The empty set ∅ has no elements, so every test says ∉.');
        L.push('A set like all numbers x with x ≥ 2 never ends, so it cannot be listed. We describe it instead.');
        return lines(L);
      };

      /* ================= view 2: set-builder ================= */
      let relBtns, sbSl, sbFb, sbBtn;
      const RK = ['ge', 'gt', 'le', 'lt'];
      grp('sb', () => {
        C.title('Test a number against the rule');
        relBtns = C.buttons(RK.map(k => ({ label: `{ x | x ${RELS[k].s} 2 }`, onClick: () => { st.rel = k; st.tests = {}; st.show = 0; sync(); } })));
        sbSl = C.slider({ label: 'Test point', min: -6, max: 6, step: .5, value: st.x, format: v => 'x = ' + nf(v), onInput: v => { setX(v); } });
        sbBtn = C.buttons([{ label: 'Show the whole set', primary: true, onClick: () => { cancel(); cancel = animateTo(st, { show: 1 }, 600, sync); } }, { label: 'Clear my tests', onClick: () => { st.tests = {}; st.show = 0; sync(); } }]);
        sbFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); panel.append(sbFb);
      });
      const setX = v => { cancel(); st.x = v; st.tests[v] = RELS[st.rel].ok(v); sync(); };
      const sbText = () => {
        const R = RELS[st.rel], x = st.x, t = R.ok(x), L = [];
        L.push(`${kk('Rule')} x ${R.s} 2, the set of all x such that x is ${R.w}.`);
        L.push(`${kk('Test')} x = ${nf(x)}: is ${nf(x)} ${R.s} 2? ${t ? ok('Yes') : no('No')}. So ${nf(x)} ${t ? '∈' : '∉'} { x | x ${R.s} 2 }: ${t ? ok('in') : no('out')}.`);
        if (x === 2) L.push(`2 is the <b>boundary</b>. ${st.rel === 'ge' || st.rel === 'le' ? `${R.s} allows equal, so 2 is in the set.` : `${R.s} does not allow equal, so 2 is not in the set.`}`);
        const vals = Object.values(st.tests), nI = vals.filter(Boolean).length;
        L.push(`Tested so far: ${nI} in, ${vals.length - nI} out.`);
        if (st.show > .5) L.push(`${kk('The whole set')} ${R.iv.lc || R.iv.hc ? 'The closed circle at 2 means 2 is included.' : 'The open circle at 2 means 2 is not included.'} The shading is every number that follows the rule.`);
        return lines(L);
      };

      /* ================= view 3: interval notation ================= */
      let ivModeBtns, gateBox, gateQ, gateRow, gateFb, aStep, bStep, lcBtns, hcBtns, ivFb, rdQ, rdRow, rdFb, rdNext;
      const LV = [-INF, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5], RV = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, INF];
      const stepper = (label, onDec, onInc) => {
        const out = h('output', {});
        const d = mkBtn('−', onDec), i = mkBtn('+', onInc);
        d.setAttribute('aria-label', 'Decrease ' + label); i.setAttribute('aria-label', 'Increase ' + label);
        const el = h('div', { class: 'ctl sin-step' }, h('span', {}, label), d, out, i); panel.append(el);
        return { el, out, d, i };
      };
      grp('ivhead', () => {
        C.title('Interval notation');
        ivModeBtns = C.buttons([{ label: 'Build an interval', onClick: () => setMode('build') }, { label: 'Read a graph', onClick: () => setMode('read') }]);
      });
      grp('ivb', () => {
        gateBox = h('div', { class: 'ctl' }); gateQ = h('p', { class: 'sin-q' }); gateRow = h('div', { class: 'ctl buttons' }); gateFb = h('div', { class: 'sin-fb', 'aria-live': 'polite' });
        gateBox.append(gateQ, gateRow, gateFb); panel.append(gateBox);
        aStep = stepper('Left end', () => stepEnd('a', -1), () => stepEnd('a', 1));
        bStep = stepper('Right end', () => stepEnd('b', -1), () => stepEnd('b', 1));
        C.title('Brackets');
        lcBtns = C.buttons([{ label: '[ left: included', onClick: () => setBr('lc', true) }, { label: '( left: not included', onClick: () => setBr('lc', false) }]);
        hcBtns = C.buttons([{ label: 'right: included ]', onClick: () => setBr('hc', true) }, { label: 'right: not included )', onClick: () => setBr('hc', false) }]);
        C.hint('Solving 2x − 1 ≥ 3 gives x ≥ 2. In interval notation that answer is [2, ∞). Try to build it.');
        ivFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); panel.append(ivFb);
      });
      grp('ivr', () => {
        rdQ = h('p', { class: 'sin-q' }); rdRow = h('div', { class: 'ctl buttons' }); rdFb = h('div', { class: 'sin-fb', 'aria-live': 'polite' });
        rdNext = mkBtn('Next graph', () => { st.rd = (st.rd + 1) % RD.length; loadRd(); sync(); }, true);
        panel.append(rdQ, rdRow, rdFb, h('div', { class: 'ctl buttons' }, rdNext));
      });
      const setMode = m => { st.ivMode = m; if (m === 'read') loadRd(); sync(); };
      const renderGate = () => {
        gateFb.innerHTML = ''; gateRow.replaceChildren();
        gateQ.textContent = 'Predict first. The set is −1 < x ≤ 4. Which end of its graph will be closed?';
        const opts = [['Only −1', 'Not quite. x > −1 does not allow −1, so that circle is open. It is 4 that x ≤ 4 allows.'],
          ['Only 4', ok('Yes.') + ' −1 &lt; x is strict, so −1 is not included: open circle, parenthesis. x ≤ 4 allows equal, so 4 is included: closed circle, square bracket. That gives (−1, 4].'],
          ['Both ends', 'Not quite. The left rule is −1 &lt; x with a strict symbol, so −1 is left out. Only 4 is included.'],
          ['Neither end', 'Not quite. x ≤ 4 has an "or equal" part, so 4 is included. Only −1 is left out.']];
        opts.forEach((o, i) => gateRow.append(mkBtn(o[0], () => {
          if (st.gate) return;
          st.gate = true; st.gateAns = i; st.a = -1; st.b = 4; st.lc = false; st.hc = true;
          Array.from(gateRow.children).forEach((b, j) => { b.disabled = true; if (j === i) b.classList.add('primary'); });
          gateFb.innerHTML = i === 1 ? o[1] : no('Not quite.') + ' ' + o[1].replace(/^Not quite\. /, '') + ' The closed end is 4 only: (−1, 4].';
          st.rev = 0; cancel(); cancel = animateTo(st, { rev: 1 }, 700, sync); sync();
        })));
        if (st.gate) { Array.from(gateRow.children).forEach((b, j) => { b.disabled = true; if (j === st.gateAns) b.classList.add('primary'); }); }
      };
      const stepEnd = (k, d) => {
        gateFb.innerHTML = '';
        if (!st.gate) return;
        const L = k === 'a' ? LV : RV;
        let i = L.indexOf(st[k]) + d; i = clamp(i, 0, L.length - 1); st[k] = L[i];
        if (st.a === -INF) st.lc = false;
        if (st.b === INF) st.hc = false;
        st.rev = 1; sync();
      };
      const setBr = (k, v) => { gateFb.innerHTML = ''; if (!st.gate) return; if ((k === 'lc' && st.a === -INF) || (k === 'hc' && st.b === INF)) return; st[k] = v; sync(); };
      const ivText2 = () => {
        const s = curIv(), L = [];
        if (!st.gate) return 'Make your prediction first. Then the steppers and bracket buttons unlock.';
        if (st.a > st.b) {
          L.push(no('The left end is bigger than the right end.') + ` No number can be above ${ep(st.a)} and below ${ep(st.b)} at once, so nothing is shaded: ∅. Always write the smaller number first.`);
          return lines(L);
        }
        L.push(`${kk('Words')} ${wordsOf(s)}`);
        L.push(`${kk('Set-builder')} ${sbOf(s)}`);
        L.push(`${kk('Interval')} <b>${isEmpty(s) ? '∅' : s.lo === s.hi ? '{ ' + nf(s.lo) + ' }' : ivText(s)}</b>`);
        if (st.a === st.b) L.push(st.lc && st.hc ? `Both ends are the same number and both are included, so the set is just the single number ${nf(st.a)}.` : `Both ends are the same number ${nf(st.a)}, and one of them is excluded, so nothing is left: ∅.`);
        else {
          if (st.a === -INF) L.push(`Left end −∞: it is not a number, so it always gets a parenthesis. (The ( button is fixed.)`);
          else L.push(`Left end ${nf(st.a)}: ${st.lc ? 'the square bracket [ means ' + nf(st.a) + ' is included (closed circle).' : 'the parenthesis ( means ' + nf(st.a) + ' is not included (open circle).'}`);
          if (st.b === INF) L.push(`Right end ∞: it is not a number, so it always gets a parenthesis. (The ) button is fixed.)`);
          else L.push(`Right end ${nf(st.b)}: ${st.hc ? 'the square bracket ] means ' + nf(st.b) + ' is included (closed circle).' : 'the parenthesis ) means ' + nf(st.b) + ' is not included (open circle).'}`);
        }
        return lines(L);
      };
      const loadRd = () => {
        const t = RD[st.rd]; st.rdDone = false; rdFb.innerHTML = ''; rdRow.replaceChildren(); rdNext.disabled = true;
        rdQ.textContent = `Graph ${st.rd + 1} of ${RD.length}. ${capOf(t.s)} Which notation matches?`;
        t.ch.forEach((o, i) => rdRow.append(mkBtn(o[0], () => {
          if (st.rdDone) return;
          const right = i === t.ans, b = rdRow.children[i];
          if (right) { st.rdDone = true; Array.from(rdRow.children).forEach(x => { x.disabled = true; }); b.classList.add('primary'); rdFb.innerHTML = ok('Right.') + ' ' + o[1]; rdNext.disabled = false; }
          else { b.disabled = true; rdFb.innerHTML = no('Not quite.') + ' ' + o[1] + ' Try another answer.'; }
          sync();
        })));
      };

      /* ================= view 4: combine ================= */
      let csSel, opBtns, cQ, cRow, cFb, cRo;
      grp('comb', () => {
        C.title('Combine two sets');
        csSel = C.select({ label: 'Choose a case', options: CASES.map((k, i) => ({ value: String(i), label: k.name })), value: '0', onChange: v => { st.cs = +v; st.op = null; renderComb(); sync(); } });
        opBtns = C.buttons([{ label: 'and (∩ overlap)', onClick: () => setOp('and') }, { label: 'or (∪ everything)', onClick: () => setOp('or') }]);
        cRo = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        cQ = h('p', { class: 'sin-q' }); cRow = h('div', { class: 'ctl buttons' }); cFb = h('div', { class: 'sin-fb', 'aria-live': 'polite' });
        panel.append(cRo, cQ, cRow, cFb);
      });
      const setOp = o => { st.op = o; renderComb(); sync(); };
      const renderComb = () => {
        cRow.replaceChildren(); cFb.innerHTML = '';
        if (!st.op) { cQ.textContent = 'Choose "and" or "or". Then the combined set appears and you pick its notation.'; return; }
        const k = CASES[st.cs], D = k[st.op], key = st.cs + st.op, solved = !!st.cdone[key];
        cQ.textContent = `Which notation names the violet set, A ${st.op === 'and' ? '∩' : '∪'} B?`;
        D.o.forEach((o, i) => cRow.append(mkBtn(o[0], () => {
          if (st.cdone[key]) return;
          const right = i === D.ans, b = cRow.children[i];
          if (right) { st.cdone[key] = true; Array.from(cRow.children).forEach(x => { x.disabled = true; }); b.classList.add('primary'); cFb.innerHTML = ok('Right.') + ' ' + o[1]; }
          else { b.disabled = true; cFb.innerHTML = no('Not quite.') + ' ' + o[1] + ' Try another answer.'; }
          sync();
        })));
        if (solved) { Array.from(cRow.children).forEach((x, i) => { x.disabled = true; if (i === D.ans) x.classList.add('primary'); }); cFb.innerHTML = ok('Right.') + ' ' + D.o[D.ans][1]; }
      };
      const combText = () => {
        const k = CASES[st.cs], L = [];
        L.push(`${kk('A')} ${k.la} = ${ivText(k.A)}`, `${kk('B')} ${k.lb} = ${ivText(k.B)}`);
        if (!st.op) return lines(L);
        const res = resList(st.cs, st.op), solved = !!st.cdone[st.cs + st.op];
        L.push(st.op === 'and' ? 'AND: a number must follow BOTH rules, so only the overlap is violet.' : 'OR: a number needs to follow AT LEAST ONE rule, so everything in either set is violet.');
        if (solved) L.push(`<b>A ${st.op === 'and' ? '∩' : '∪'} B = ${listText(res)}</b>` + (res.length ? ', that is ' + res.map(ineqOf).join(' or ') : ', the empty set'));
        return lines(L);
      };

      /* ================= practice ================= */
      let startBtn, ptally, pq, pch, pfb, pnext;
      C.title('Practice');
      C.hint('Eight short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); if (st.practice) { st.practice = false; sync(); } else { st.practice = true; if (!prOver) loadProb(); sync(); } } }])[0];
      grp('practice', () => {
        ptally = h('p', { class: 'ctl-title' });
        pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        pch = h('div', { class: 'ctl buttons' });
        pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pnext = mkBtn('Next problem', () => nextProb(), true);
        addTo(ptally, pq, pch, pfb, h('div', { class: 'ctl buttons' }, pnext));
      });
      const tally = () => { ptally.textContent = `Problem ${prIdx + 1} of ${PROBS.length}. Right on the first try: ${prFirst} of ${prDone} done`; };
      const loadProb = () => {
        const pr = PROBS[prIdx]; prSolved = false; prTried = false;
        pq.textContent = pr.q; pfb.innerHTML = ''; pch.replaceChildren(); pnext.disabled = true; pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        pr.ch.forEach((o, i) => pch.append(mkBtn(o[0], () => pick(i))));
        tally();
      };
      const pick = i => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        const right = i === pr.ans, btn = pch.children[i], txt = pr.ch[i][1];
        if (right) { prSolved = true; if (!prTried) prFirst++; prDone++; Array.from(pch.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary'); pfb.innerHTML = ok('Right.') + ' ' + txt; pnext.disabled = false; }
        else { prTried = true; btn.disabled = true; pfb.innerHTML = no('Not quite.') + ' ' + txt + ' Try another answer.'; }
        tally(); sync();
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); sync(); return; }
        prOver = true; pq.textContent = `All ${PROBS.length} problems are done.`; pch.replaceChildren(); pnext.disabled = true;
        pfb.innerHTML = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        pch.append(mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; prOver = false; loadProb(); sync(); }, true));
        ptally.textContent = `Right on the first try: ${prFirst} of ${PROBS.length}`; sync();
      };

      /* ================= sync ================= */
      const sync = () => {
        const prac = st.practice, v = st.view;
        vis(G.sets, !prac && v === 'sets'); vis(G.sb, !prac && v === 'sb');
        vis(G.ivhead, !prac && v === 'iv'); vis(G.ivb, !prac && v === 'iv' && st.ivMode === 'build'); vis(G.ivr, !prac && v === 'iv' && st.ivMode === 'read');
        vis(G.comb, !prac && v === 'comb'); vis(G.practice, prac);
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        if (!prac && v === 'sets') {
          setBtns.forEach((b, i) => press(b, st.set.includes(i))); setSl.set(st.n); setFb.innerHTML = setsText();
        }
        if (!prac && v === 'sb') {
          relBtns.forEach((b, i) => press(b, st.rel === RK[i])); sbSl.set(st.x); sbFb.innerHTML = sbText();
        }
        if (!prac && v === 'iv') {
          press(ivModeBtns[0], st.ivMode === 'build'); press(ivModeBtns[1], st.ivMode === 'read');
          aStep.out.textContent = ep(st.a); bStep.out.textContent = ep(st.b);
          aStep.d.disabled = aStep.i.disabled = bStep.d.disabled = bStep.i.disabled = !st.gate;
          lcBtns.forEach((b, i) => { press(b, st.lc === (i === 0)); b.disabled = !st.gate || st.a === -INF; });
          hcBtns.forEach((b, i) => { press(b, st.hc === (i === 0)); b.disabled = !st.gate || st.b === INF; });
          if (st.a === -INF) lcBtns[1].classList.add('primary');
          if (st.b === INF) hcBtns[1].classList.add('primary');
          ivFb.innerHTML = ivText2();
        }
        if (!prac && v === 'comb') {
          csSel.value = String(st.cs);
          opBtns.forEach((b, i) => press(b, st.op === ['and', 'or'][i]));
          const k = CASES[st.cs];
          opBtns.forEach((b, i) => { b.disabled = !k[['and', 'or'][i]]; });
          cRo.innerHTML = combText();
        }
        P.draw();
      };

      draggable(P, {
        hit: (px, py) => {
          if (st.practice || st.view !== 'sb') return null;
          const per = (P.w - 52) / 14, x = 26 + (st.x + 7) * per;
          return Math.abs(px - x) < 24 && Math.abs(py - sbY) < 30 ? 'p' : null;
        },
        move: (id, mx) => {
          const px = P.X(mx), per = (P.w - 52) / 14, v = (px - 26) / per - 7;
          setX(clamp(snap(v, .5), -6, 6));
        }
      });
      P.canvas.addEventListener('click', e => {
        if (st.practice || st.view !== 'sets') return;
        const r = P.canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top, L = tokLayout(P);
        for (let k = 0; k <= 7; k++) { const [x, y] = L.pos[k]; if (Math.hypot(px - x, py - y) < L.r + 6) { st.n = k; toggleNum(k); return; } }
      });

      const FLAGS = ['view', 'ivMode', 'cs'];
      const apply = patch => {
        cancel(); st.practice = false;
        for (const k in patch) if (FLAGS.includes(k)) st[k] = patch[k];
        const v = st.view;
        if (v === 'sets') { st.set = [2, 4, 6]; st.n = 5; st.way = 0; }
        if (v === 'sb') { st.rel = 'ge'; st.x = 1.5; st.tests = {}; st.tests[1.5] = false; st.show = 0; }
        if (v === 'iv') { st.gate = false; st.gateAns = -1; st.a = -1; st.b = 4; st.lc = false; st.hc = true; st.rev = 1; st.rd = 0; renderGate(); loadRd(); }
        if (v === 'comb') { st.op = null; st.cdone = {}; renderComb(); }
        sync();
      };
      renderGate(); loadRd(); renderComb(); st.tests[1.5] = false;
      apply({ view: 'sets' });
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
