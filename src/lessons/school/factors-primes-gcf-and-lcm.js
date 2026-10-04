/* =====================================================================
   SCHOOL — Factors, primes, GCF and LCM
   ===================================================================== */
{
  /* ---------- number helpers ---------- */
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const lcm = (a, b) => a / gcd(a, b) * b;
  const isPrime = n => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
  const divisors = n => { const d = []; for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; };
  /* prime factorization as a list of [prime, exponent] */
  const factorize = n => { const out = []; for (let p = 2; n > 1; p++) { let e = 0; while (n % p === 0) { n /= p; e++; } if (e) out.push([p, e]); } return out; };
  const cnt = n => { const m = {}; factorize(n).forEach(([p, e]) => { m[p] = e; }); return m; };
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const sup = e => String(e).split('').map(d => SUP[+d]).join('');
  const powStr = (p, e) => e === 1 ? String(p) : p + sup(e);
  const expForm = n => factorize(n).map(([p, e]) => powStr(p, e)).join(' × ');
  const flatForm = n => factorize(n).map(([p, e]) => Array(e).fill(p).join(' × ')).join(' × ');
  const listAnd = a => a.length < 2 ? a.join('') : a.length === 2 ? a.join(' and ') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;

  /* ---------- data ---------- */
  const TREE_ROOTS = [12, 36, 48, 60, 72, 90, 100];
  const PAIRS = [[12, 18], [24, 36], [30, 45], [28, 42], [36, 48], [60, 90], [16, 27], [48, 72], [75, 100], [17, 34]];
  const LPAIRS = [[4, 6], [3, 5], [6, 8], [4, 10], [9, 12], [6, 9], [8, 12], [7, 11], [11, 12]];
  /* "Show me a number" challenge: the student decides prime, composite or neither BEFORE the rectangles appear */
  const FQ = [13, 15, 1, 51, 29, 49];
  const STORIES = [
    { name: 'Floor tiles', a: 36, b: 48, tool: 'gcf',
      q: 'A hall floor is 36 dm wide and 48 dm long. You cover it with square tiles that are all the same size, and no tile may be cut. What is the side of the biggest square tile you can use?',
      why: { gcf: 'You are cutting 36 and 48 into equal pieces with nothing left over. That is a GCF job: the biggest piece size that divides both numbers.',
             lcm: 'An LCM answers "when do two repeating things line up again?" Nothing repeats here. We cut 36 and 48 into equal pieces, so we want the biggest size that divides both: the GCF.' },
      ch: [['6 dm', '6 fits (36 ÷ 6 = 6 and 48 ÷ 6 = 8), but it is not the biggest. 12 fits too.'],
           ['12 dm', 'Yes. 36 ÷ 12 = 3 and 48 ÷ 12 = 4, so 3 by 4 tiles of side 12 cover the floor exactly. The shared primes of 36 = 2² × 3² and 48 = 2⁴ × 3 are 2, 2 and 3, and 2 × 2 × 3 = 12.'],
           ['24 dm', '24 divides 48 but not 36: 36 ÷ 24 = 1 with 12 left over. A tile must fit both sides.'],
           ['144 dm', '144 is the LCM of 36 and 48. That is a meeting point, not a tile size. A tile cannot be longer than the floor is wide.']], ans: 1 },
    { name: 'Two buses', la: 4, lb: 6, tool: 'lcm', nameA: 'Bus A', nameB: 'Bus B', unit: 'min',
      q: 'Bus A leaves a stop every 4 minutes. Bus B leaves every 6 minutes. Both leave at 8:00. In how many minutes do they next leave together?',
      why: { lcm: 'Both buses repeat. You want the first time their lists of departure times share a number. That is the least common multiple.',
             gcf: 'A GCF cuts things into equal pieces. Here two schedules repeat and you wait for them to match again. That is the first shared multiple: the LCM.' },
      ch: [['2 minutes', '2 is the GCF of 4 and 6. Bus A does not leave at 2 minutes. 2 is not a multiple of 4.'],
           ['10 minutes', '10 is 4 + 6. Adding the two gaps does not find a shared time. Bus A leaves at 8 and 12, not at 10.'],
           ['12 minutes', 'Yes. Bus A leaves at 4, 8, 12 and Bus B at 6, 12. The first time in both lists is 12.'],
           ['24 minutes', '24 is a time they both leave, but it is not the first. They already meet at 12.']], ans: 2 },
    { name: 'Two gears', la: 8, lb: 12, tool: 'lcm', nameA: 'Gear A', nameB: 'Gear B', unit: 'teeth',
      q: 'A gear with 8 teeth meshes with a gear with 12 teeth. Each gear has a red mark at the top, and the marks start together. How many teeth must pass before both marks are at the top together again?',
      why: { lcm: 'Gear A has its mark on top after every 8 teeth. Gear B has its mark on top after every 12 teeth. You want the first number in both lists: the LCM.',
             gcf: 'We are not cutting anything into pieces. Each gear repeats a cycle, and we wait for the two cycles to line up: the LCM.' },
      ch: [['4 teeth', '4 is the GCF of 8 and 12. After 4 teeth, neither mark is back on top.'],
           ['20 teeth', '20 is 8 + 12. Gear A has its mark on top at 8, 16, 24, not at 20.'],
           ['96 teeth', '96 is 8 × 12. It works, but it is not the first. They line up sooner.'],
           ['24 teeth', 'Yes. Gear A is on top at 8, 16, 24 and Gear B at 12, 24. The first number in both lists is 24. Gear A has turned 3 times and gear B 2 times.']], ans: 3 }
  ];

  /* ---------- practice problems (fixed, answered with buttons; after the right answer the canvas shows why) ---------- */
  const PROBS = [
    { q: 'Which of these numbers is prime?', ans: 2, view: { t: 'factors', n: 29 },
      ch: [['1', 'Not quite. 1 has only one factor, itself. A prime needs exactly two different factors, so 1 is neither prime nor composite.'],
           ['21', 'Not quite. 21 = 3 × 7, so it has the factors 1, 3, 7 and 21. It is composite.'],
           ['29', 'Yes. Try to build 29 tiles into a rectangle: only 1 × 29 works. Its only factors are 1 and 29.'],
           ['39', 'Not quite. 39 = 3 × 13, so it has four factors. It is composite.']] },
    { q: 'Which list shows ALL the factors of 18?', ans: 3, view: { t: 'factors', n: 18 },
      ch: [['1, 2, 3, 9, 18', 'Not quite. 6 is missing. 3 × 6 = 18, so 6 is a factor.'],
           ['2, 3, 6, 9', 'Not quite. 1 and 18 are always factors: 1 × 18 = 18.'],
           ['1, 2, 3, 4, 6, 9, 18', 'Not quite. 4 is not a factor: 18 ÷ 4 = 4 with 2 left over.'],
           ['1, 2, 3, 6, 9, 18', 'Yes. The pairs are 1 × 18, 2 × 9 and 3 × 6. Each pair gives two factors.']] },
    { q: 'Which is the prime factorization of 72, written with exponents?', ans: 2, view: { t: 'tree', n: 72 },
      ch: [['2² × 3³', 'Not quite. 2² × 3³ = 4 × 27 = 108. The tree for 72 has three 2s and two 3s.'],
           ['8 × 9', 'Not quite. 8 × 9 = 72, but 8 and 9 are not prime. Split them: 8 = 2 × 2 × 2 and 9 = 3 × 3.'],
           ['2³ × 3²', 'Yes. 72 = 8 × 9 = 2 × 2 × 2 × 3 × 3. The prime 2 appears 3 times and the prime 3 appears 2 times. 8 × 9 = 72.'],
           ['2 × 3 × 12', 'Not quite. 12 is not prime, so you are not finished. Split it too.']] },
    { q: 'What is the greatest common factor (GCF) of 24 and 36?', ans: 1, view: { t: 'venn', a: 24, b: 36 },
      ch: [['6', 'Not quite. 6 divides both, but it is not the greatest. The overlap holds 2, 2 and 3, and 2 × 2 × 3 = 12.'],
           ['12', 'Yes. 24 = 2 × 2 × 2 × 3 and 36 = 2 × 2 × 3 × 3. They share 2, 2 and 3. 2 × 2 × 3 = 12.'],
           ['72', 'Not quite. 72 is a common multiple (the LCM). A factor of 24 cannot be bigger than 24.'],
           ['24', 'Not quite. 24 divides 24 but not 36: 36 ÷ 24 leaves 12.']] },
    { q: 'A florist has 30 roses and 45 tulips. She makes identical bouquets with no flowers left over, and she wants as many bouquets as possible. How many bouquets does she make?', ans: 0, view: { t: 'venn', a: 30, b: 45 },
      ch: [['15', 'Yes. The GCF of 30 and 45 is 15. Each bouquet gets 30 ÷ 15 = 2 roses and 45 ÷ 15 = 3 tulips.'],
           ['5', 'Not quite. 5 bouquets works, with 6 roses and 9 tulips each, but more bouquets are possible. The most is the GCF, 15.'],
           ['75', 'Not quite. 75 is 30 + 45, the total number of flowers. You cannot make more bouquets than roses.'],
           ['90', 'Not quite. 90 is the LCM of 30 and 45. Cutting into equal groups is a GCF job.']] },
    { q: 'What is the least common multiple (LCM) of 6 and 8?', ans: 2, view: { t: 'lcm', la: 6, lb: 8 },
      ch: [['48', 'Not quite. 48 is 6 × 8. It is a common multiple, but not the first. They meet at 24.'],
           ['2', 'Not quite. 2 is the GCF. A multiple of 6 cannot be smaller than 6.'],
           ['24', 'Yes. Multiples of 6: 6, 12, 18, 24. Multiples of 8: 8, 16, 24. The first number in both lists is 24.'],
           ['14', 'Not quite. 14 is 6 + 8. It is not a multiple of 6 or of 8.']] },
    { q: 'Hot dogs come in packs of 10 and buns in packs of 8. What is the smallest number of hot dogs that matches a whole number of buns exactly?', ans: 3, view: { t: 'lcm', la: 8, lb: 10 },
      ch: [['18', 'Not quite. 18 is 10 + 8. It is not a multiple of 10.'],
           ['80', 'Not quite. 80 works, but a smaller number works too. 10 × 8 is not always the first match.'],
           ['2', 'Not quite. 2 is the GCF. You need the smallest shared multiple, so the answer is at least 10.'],
           ['40', 'Yes. Packs of hot dogs: 10, 20, 30, 40. Packs of buns: 8, 16, 24, 32, 40. The first match is 40: 4 packs of hot dogs and 5 packs of buns.']] },
    { q: 'Write 24 + 36 as a common factor times a sum, like 3 × (4 + 5), so that the two numbers inside the parentheses have no common factor.', ans: 0, view: { t: 'dist', a: 24, b: 36, g: 12, op: '+' },
      ch: [['12 × (2 + 3)', 'Yes. 12 × 2 = 24 and 12 × 3 = 36. Inside the parentheses, 2 and 3 share only 1, so nothing more can come out.'],
           ['6 × (4 + 6)', 'Not quite. 6 × 4 + 6 × 6 is correct, but 4 and 6 still share the factor 2. Pull out 12 instead.'],
           ['4 × (6 + 9)', 'Not quite. 4 × 6 + 4 × 9 is correct, but 6 and 9 still share the factor 3. Pull out 12 instead.'],
           ['24 × (1 + 36)', 'Not quite. 24 × 1 = 24 but 24 × 36 is not 36. The same factor must divide both numbers.']] }
  ];

  /* ---------- drawing helpers (pixel space) ---------- */
  const font = (size, weight = 600) => `${weight} ${size}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`;
  const T = (c, p, str, x, y, { size = 14, color, align = 'center', weight = 600, a = 1, halo = true } = {}) => {
    if (a <= .01) return;
    c.save(); c.globalAlpha *= a; c.font = font(size, weight); c.textAlign = align; c.textBaseline = 'middle';
    if (halo) { c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(str, x, y); }
    c.fillStyle = color || p.pal.text; c.fillText(str, x, y); c.restore();
  };
  const tw = (c, str, size, weight = 600) => { c.save(); c.font = font(size, weight); const w = c.measureText(str).width; c.restore(); return w; };
  const Tfit = (c, p, str, x, y, maxW, o = {}) => {
    let size = o.size || 13;
    while (size > 12 && tw(c, str, size, o.weight || 600) > maxW) size -= .5;
    T(c, p, str, x, y, { ...o, size });
  };
  /* wrap text into lines that fit maxW */
  const wrap = (c, str, size, maxW, weight = 600) => {
    const words = str.split(' '), lines = []; let cur = '';
    for (const w of words) { const t = cur ? cur + ' ' + w : w; if (tw(c, t, size, weight) > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
    if (cur) lines.push(cur); return lines;
  };
  const para = (c, p, str, x, y, maxW, o = {}) => {
    const size = o.size || 13, lh = o.lh || size + 5, lines = wrap(c, str, size, maxW, o.weight || 600);
    lines.forEach((l, i) => T(c, p, l, x, y + i * lh, o)); return lines.length * lh;
  };
  const seg = (c, x1, y1, x2, y2, color, w = 1.5, dash) => {
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.strokeStyle = color; c.lineWidth = w;
    c.setLineDash(dash || []); c.lineCap = 'round'; c.stroke(); c.setLineDash([]);
  };
  const rr = (c, x, y, w, h, r) => {
    c.beginPath();
    if (w <= 0 || h <= 0) return;
    r = Math.min(r, w / 2, h / 2);
    c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  const disc = (c, x, y, r, fill, stroke, lw = 2.4) => {
    c.beginPath(); c.arc(x, y, r, 0, TAU);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); }
  };
  const fontSize = p => clamp(Math.min(p.w, p.h) * .03 + 3, 12, 16);

  /* a factor tree from the smallest-prime split (used by Practice pictures) */
  const autoTree = n => {
    const nodes = [{ id: 0, n, par: -1, kids: [] }];
    const go = id => {
      const m = nodes[id].n; if (isPrime(m)) return;
      let d = 2; while (m % d) d++;
      [d, m / d].forEach(v => { const k = nodes.length; nodes.push({ id: k, n: v, par: id, kids: [] }); nodes[id].kids.push(k); });
      nodes[id].kids.slice().forEach(go);
    };
    go(0); return { nodes, hist: [] };
  };
  const treeLeaves = tree => { const out = []; const w = id => { const nd = tree.nodes[id]; if (!nd.kids.length) out.push(id); else nd.kids.forEach(w); }; w(0); return out; };

  /* ================= SCENES ================= */

  /* Factors: every rectangle that uses all n tiles */
  const sceneFactors = (c, p, { n, hide }) => {
    const pal = p.pal, W = p.w, H = p.h, fs = fontSize(p), d = divisors(n);
    const pairs = d.filter(i => i * i <= n).map(i => [i, n / i]);
    const kind = n === 1 ? 'neither' : pairs.length === 1 ? 'prime' : 'composite';
    const kcol = kind === 'prime' ? pal.green : kind === 'composite' ? pal.blue : pal.muted;
    T(c, p, `${n} tiles`, 12, 8 + fs + 4, { size: fs * 1.7, align: 'left', weight: 800 });
    let y = 8 + fs * 2.4 + 10;
    if (hide) {
      T(c, p, 'Is it prime, composite, or neither?', 12, y + fs * .5, { size: fs + 1, align: 'left', color: pal.violet });
      y += fs + 14;
      T(c, p, 'Decide first. Then the rectangles will show why.', 12, y + fs * .5, { size: fs, align: 'left', color: pal.muted });
      y += fs + 12;
      /* a loose pile of tiles: it hints at nothing */
      const area = { x: 14, y, w: W - 28, h: H - y - 12 }, cols = Math.ceil(Math.sqrt(n * area.w / area.h)), rows = Math.ceil(n / cols);
      const cw = area.w / cols, ch = area.h / rows, sz = Math.min(cw, ch) * .62;
      for (let i = 0; i < n; i++) {
        const r = Math.floor(i / cols), k = i % cols, jx = ((i * 37) % 11 - 5) / 5 * (cw - sz) * .35, jy = ((i * 53) % 13 - 6) / 6 * (ch - sz) * .35;
        const x = area.x + (k + .5) * cw + jx, yy = area.y + (r + .5) * ch + jy;
        c.save(); c.translate(x, yy); c.rotate(((i * 29) % 17 - 8) * .018); rr(c, -sz / 2, -sz / 2, sz, sz, 3);
        c.fillStyle = alpha(pal.yellow, .9); c.fill(); c.restore();
      }
      return;
    }
    T(c, p, `Factors: ${d.join(', ')}`, 12, y + fs * .5, { size: fs + 1, align: 'left', color: pal.text, halo: false }); y += fs + 9;
    const kt = kind === 'prime' ? `Prime: only 1 × ${n} works (two factors)` : kind === 'composite' ? `Composite: ${d.length} factors, ${pairs.length} rectangles` : '1 is neither prime nor composite';
    Tfit(c, p, kt, 12, y + fs * .5, W - 24, { size: fs + 1, align: 'left', color: kcol, halo: false }); y += fs + 14;
    const cols = pairs.length === 1 ? 1 : W < 520 ? 2 : 3, rows = Math.ceil(pairs.length / cols), gap = 10;
    const bw = (W - 20 - (cols - 1) * gap) / cols, bh = Math.min((H - y - 8 - (rows - 1) * gap) / rows, 190), labH = fs + 8;
    pairs.forEach(([a, b], i) => {
      const r = Math.floor(i / cols), k = i % cols, inRow = Math.min(cols, pairs.length - r * cols);
      const bx = (W - (inRow * bw + (inRow - 1) * gap)) / 2 + k * (bw + gap), by = y + r * (bh + gap);
      rr(c, bx, by, bw, bh, 8); c.fillStyle = alpha(pal.text, .04); c.fill(); c.strokeStyle = alpha(pal.text, .22); c.lineWidth = 1.2; c.stroke();
      T(c, p, `${a} × ${b}`, bx + bw / 2, by + labH / 2 + 2, { size: fs + 1, color: kcol, weight: 800, halo: false });
      const cell = Math.min((bw - 14) / b, (bh - labH - 12) / a), rw = cell * b, rh = cell * a, rx = bx + (bw - rw) / 2, ry = by + labH + 4 + (bh - labH - 8 - rh) / 2;
      for (let i2 = 0; i2 < a; i2++) for (let j = 0; j < b; j++) {
        if (cell >= 5) { rr(c, rx + j * cell + .9, ry + i2 * cell + .9, cell - 1.8, cell - 1.8, 2); c.fillStyle = alpha(kcol, .88); c.fill(); }
      }
      if (cell < 5) { c.fillStyle = alpha(kcol, .88); c.fillRect(rx, ry, rw, rh); }
    });
  };

  /* Factor tree */
  const sceneTree = (c, p, { tree, sel, pop, ex, done, showExp, exOk }) => {
    const pal = p.pal, W = p.w, H = p.h, fs = fontSize(p), nodes = tree.nodes, root = nodes[0].n;
    const top = 8 + fs * 2 + 22, bottom = done ? fs + 60 : fs * 1.2 + 34, padX = 28;
    const pos = {}; let li = 0, md = 0;
    const walk = (id, d) => {
      const nd = nodes[id]; md = Math.max(md, d);
      if (!nd.kids.length) pos[id] = { li: li++, d };
      else { nd.kids.forEach(k => walk(k, d + 1)); pos[id] = { li: (pos[nd.kids[0]].li + pos[nd.kids[1]].li) / 2, d }; }
    };
    walk(0, 0);
    const nl = li, dx = (W - 2 * padX) / Math.max(nl, 1), r = clamp(Math.min(W / (nl + 1.4) * .42, H * .06), 15, 23), dy = Math.min(62, (H - top - bottom - 2 * r) / Math.max(md, 3));
    const X = id => padX + (pos[id].li + .5) * dx, Y = id => top + r + pos[id].d * dy;
    lay.nodes = {};
    Tfit(c, p, `Factor tree of ${root}`, 12, 8 + fs + 2, W - 24, { size: fs + 3, align: 'left', weight: 800, halo: false });
    const lv = treeLeaves(tree), comp = lv.filter(id => !isPrime(nodes[id].n));
    const sub = done ? 'Every leaf is prime, so the tree is finished.' : sel != null ? `Pick a split for the highlighted ${nodes[sel].n}.` : '';
    Tfit(c, p, sub, 12, 8 + fs * 2 + 10, W - 24, { size: fs, align: 'left', color: done ? pal.green : pal.muted, halo: false });
    nodes.forEach(nd => nd.kids.forEach(k => seg(c, X(nd.id), Y(nd.id) + r * .8, X(k), Y(k) - r * .8, alpha(pal.text, .45), 2)));
    nodes.forEach(nd => {
      const id = nd.id, x = X(id), y = Y(id), leaf = !nd.kids.length, prime = isPrime(nd.n), isNew = pop.ids.includes(id), k = isNew ? clamp(pop.t, 0, 1) : 1;
      const rad = r * (.4 + .6 * k);
      c.save(); c.globalAlpha = isNew ? Math.max(.2, k) : 1;
      if (leaf && prime) {
        disc(c, x, y, rad, alpha(pal.green, .9), pal.green);
        T(c, p, String(nd.n), x, y + 1, { size: clamp(r * .95, 12, 17), color: pal.stage, weight: 800, halo: false });
      } else if (leaf) {
        disc(c, x, y, rad, pal.stage, id === sel ? pal.brass : pal.blue, id === sel ? 4.2 : 2.6);
        if (id === sel) disc(c, x, y, rad + 5, null, alpha(pal.brass, .5), 2);
        T(c, p, String(nd.n), x, y + 1, { size: clamp(r * .95, 12, 17), color: pal.text, weight: 800, halo: false });
      } else {
        disc(c, x, y, rad, alpha(pal.text, .06), alpha(pal.muted, .9), 2);
        T(c, p, String(nd.n), x, y + 1, { size: clamp(r * .95, 12, 17), color: pal.muted, weight: 700, halo: false });
      }
      c.restore();
      if (leaf && !prime) lay.nodes[id] = { x, y, r: r + 6 };
    });
    /* small word under each leaf: the color is never the only cue */
    if (r * 2 + 4 < dx + 8 || true) lv.forEach(id => {
      const nd = nodes[id], w = isPrime(nd.n) ? 'prime' : 'split me';
      if (dx >= 46) T(c, p, w, X(id), Y(id) + r + 12, { size: 12, color: isPrime(nd.n) ? pal.green : pal.blue, weight: 600, halo: false });
    });
    if (done) {
      const parts = Object.keys(ex).map(Number).sort((a, b) => a - b);
      const live = showExp ? parts.map(q => powStr(q, ex[q])).join(' × ') : '';
      const flat = lv.map(id => nodes[id].n).sort((a, b) => a - b).join(' × ');
      const yb = H - fs - 22;
      Tfit(c, p, `${root} = ${flat}`, W / 2, yb, W - 20, { size: fs + 1, color: pal.green, weight: 700, halo: false });
      if (exOk) Tfit(c, p, `${root} = ${live}`, W / 2, yb + fs + 8, W - 20, { size: fs + 3, color: pal.violet, weight: 800, halo: false });
      else T(c, p, 'Now write it with exponents (panel).', W / 2, yb + fs + 8, { size: fs, color: pal.muted, halo: false });
    } else {
      Tfit(c, p, 'blue ring: split again.  green: prime, stop.', W / 2, H - 14, W - 16, { size: 12, color: pal.muted, halo: false });
    }
  };

  /* Venn diagram of prime factors */
  const sceneVenn = (c, p, { a, b, sh, done }) => {
    const pal = p.pal, W = p.w, H = p.h, fs = fontSize(p), cA = cnt(a), cB = cnt(b);
    const primes = [...new Set([...Object.keys(cA), ...Object.keys(cB)].map(Number))].sort((x, y) => x - y);
    const list = fn => { const o = []; primes.forEach(q => { for (let i = 0; i < fn(q); i++) o.push(q); }); return o; };
    const onlyA = list(q => (cA[q] || 0) - (sh[q] || 0)), onlyB = list(q => (cB[q] || 0) - (sh[q] || 0)), both = list(q => sh[q] || 0);
    const hdr = 8 + fs * 2 + 14, ftr = fs * 3.4 + 10, availH = H - hdr - ftr;
    const R = Math.min(W * .29, availH / 2 * .98), cy = hdr + availH / 2, cxA = W / 2 - R / 2, cxB = W / 2 + R / 2;
    Tfit(c, p, `${a} = ${flatForm(a) || a}`, 12, 8 + fs, W - 24, { size: fs + 1, align: 'left', color: pal.blue, weight: 700, halo: false });
    Tfit(c, p, `${b} = ${flatForm(b) || b}`, 12, 8 + fs * 2 + 5, W - 24, { size: fs + 1, align: 'left', color: pal.green, weight: 700, halo: false });
    /* circles and the lens */
    c.save(); c.beginPath(); c.arc(cxA, cy, R, 0, TAU); c.clip(); c.beginPath(); c.arc(cxB, cy, R, 0, TAU); c.fillStyle = alpha(pal.violet, .26); c.fill(); c.restore();
    disc(c, cxA, cy, R, alpha(pal.blue, .1), pal.blue, 2.6); disc(c, cxB, cy, R, alpha(pal.green, .1), pal.green, 2.6);
    const rt = clamp(R * .15, 11, 16), put = (arr, x0, x1, ring, fill) => {
      const per = Math.max(1, Math.floor((x1 - x0) / (2 * rt + 4))), rows = Math.ceil(arr.length / per);
      arr.forEach((v, i) => {
        const r = Math.floor(i / per), k = i % per, inRow = Math.min(per, arr.length - r * per);
        const x = (x0 + x1) / 2 + (k - (inRow - 1) / 2) * (2 * rt + 4), y = cy + (r - (rows - 1) / 2) * (2 * rt + 4);
        disc(c, x, y, rt, fill, ring, 2.4); T(c, p, String(v), x, y + 1, { size: clamp(rt * .95, 12, 15), weight: 800, halo: false });
      });
    };
    put(onlyA, cxA - R + 6, cxB - R - 4, pal.blue, pal.stage);
    put(both, cxB - R + 4, cxA + R - 4, pal.violet, alpha(pal.violet, .35));
    put(onlyB, cxA + R + 4, cxB + R - 6, pal.green, pal.stage);
    const ly = cy + R + 14;
    T(c, p, `only ${a}`, cxA - R * .55, ly, { size: 12, color: pal.blue, halo: false });
    T(c, p, 'both', W / 2, ly, { size: 12, color: pal.violet, halo: false });
    T(c, p, `only ${b}`, cxB + R * .55, ly, { size: 12, color: pal.green, halo: false });
    const fy = H - ftr + fs + 4;
    if (done) {
      const g = both.reduce((m, v) => m * v, 1);
      Tfit(c, p, both.length ? `GCF = ${both.join(' × ')} = ${g}` : 'Nothing is shared, so the GCF = 1', W / 2, fy, W - 20, { size: fs + 4, color: pal.violet, weight: 800, halo: false });
      Tfit(c, p, `The biggest number that divides both ${a} and ${b}`, W / 2, fy + fs + 8, W - 20, { size: fs, color: pal.muted, halo: false });
    } else {
      Tfit(c, p, 'Overlap = primes in both numbers', W / 2, fy, W - 20, { size: fs, color: pal.muted, halo: false });
    }
  };

  /* Square tiles on a rectangle */
  const sceneTiles = (c, p, { a, b, s, tag }) => {
    const pal = p.pal, W = p.w, H = p.h, fs = fontSize(p), fit = a % s === 0 && b % s === 0;
    const nx = Math.floor(a / s), ny = Math.floor(b / s);
    const hdr = 8 + fs * 2 + 16, ftr = fs * 2.8 + 14, left = 26, top = hdr + fs + 6;
    const sc = Math.min((W - left - 16) / a, (H - top - ftr) / b), rw = a * sc, rh = b * sc, x0 = left + (W - left - 16 - rw) / 2, y0 = top;
    Tfit(c, p, tag || `${a} by ${b} floor`, 12, 8 + fs, W - 24, { size: fs + 3, align: 'left', weight: 800, halo: false });
    const verdict = fit ? `Tile side ${s}: fits exactly` : `Tile side ${s}: does not fit`;
    Tfit(c, p, verdict, 12, 8 + fs * 2 + 6, W - 24, { size: fs + 1, align: 'left', color: fit ? pal.green : pal.red, weight: 700, halo: false });
    const col = fit ? pal.green : pal.blue, tpx = s * sc;
    c.save(); rr(c, x0, y0, rw, rh, 3); c.clip();
    c.fillStyle = alpha(pal.text, .06); c.fillRect(x0, y0, rw, rh);
    if (tpx >= 4) {
      for (let i = 0; i < ny; i++) for (let j = 0; j < nx; j++) { rr(c, x0 + j * tpx + .8, y0 + i * tpx + .8, tpx - 1.6, tpx - 1.6, Math.min(3, tpx * .15)); c.fillStyle = alpha(col, .82); c.fill(); }
    } else {
      c.fillStyle = alpha(col, .82); c.fillRect(x0, y0, nx * tpx, ny * tpx);
      for (let j = 1; j < nx; j += Math.ceil(4 / tpx)) seg(c, x0 + j * tpx, y0, x0 + j * tpx, y0 + ny * tpx, alpha(pal.stage, .55), .8);
      for (let i = 1; i < ny; i += Math.ceil(4 / tpx)) seg(c, x0, y0 + i * tpx, x0 + nx * tpx, y0 + i * tpx, alpha(pal.stage, .55), .8);
    }
    /* leftover strips */
    const ra = a - nx * s, rb = b - ny * s;
    if (ra > 0) { c.fillStyle = alpha(pal.red, .38); c.fillRect(x0 + nx * tpx, y0, ra * sc, rh); }
    if (rb > 0) { c.fillStyle = alpha(pal.red, .38); c.fillRect(x0, y0 + ny * tpx, nx * tpx, rb * sc); }
    c.restore();
    rr(c, x0, y0, rw, rh, 3); c.strokeStyle = pal.text; c.lineWidth = 2; c.stroke();
    T(c, p, `${a}`, x0 + rw / 2, y0 - 12, { size: fs + 1, weight: 800 });
    c.save(); c.translate(x0 - 14, y0 + rh / 2); c.rotate(-Math.PI / 2); T(c, p, `${b}`, 0, 0, { size: fs + 1, weight: 800 }); c.restore();
    /* footer: the arithmetic */
    const line = (len, other) => len % s === 0 ? `${len} ÷ ${s} = ${len / s}` : `${len} ÷ ${s} = ${Math.floor(len / s)}, ${len % s} left over`;
    const fy = H - ftr + fs;
    Tfit(c, p, `${line(a)}  |  ${line(b)}`, W / 2, fy, W - 16, { size: fs, color: pal.text, halo: false });
    Tfit(c, p, fit ? `${nx} × ${ny} = ${nx * ny} tiles, nothing left over` : (ra || rb) ? 'red strips = left over, so no whole tile fits there' : '', W / 2, fy + fs + 6, W - 16, { size: fs, color: fit ? pal.green : pal.red, weight: 700, halo: false });
  };

  /* Two skip-counting number lines */
  const sceneLcm = (c, p, { la, lb, ha, hb, nameA, nameB, unit }) => {
    const pal = p.pal, W = p.w, H = p.h, fs = fontSize(p), L = lcm(la, lb), x0 = 30, x1 = W - 30, sc = (x1 - x0) / L, X = v => x0 + v * sc;
    const posA = ha * la, posB = hb * lb, meet = posA === posB && posA > 0, u = unit ? ' ' + unit : '';
    const hdr = 8 + fs * 2 + 14, usable = H - hdr - 20 - fs * 2.6, yA = hdr + usable * .28 + 20, yB = hdr + usable * .78;
    Tfit(c, p, `Skip count: ${nameA || 'top line'} by ${la}${u}, ${nameB || 'bottom line'} by ${lb}${u}`, 12, 8 + fs, W - 24, { size: fs, align: 'left', weight: 800, halo: false });
    Tfit(c, p, meet ? `First meeting at ${posA}${u}` : `Top at ${posA}${u}, bottom at ${posB}${u}`, 12, 8 + fs * 2 + 6, W - 24, { size: fs + 1, align: 'left', color: meet ? pal.violet : pal.muted, weight: 700, halo: false });
    const line = (y, step, hops, col, up) => {
      seg(c, x0 - 8, y, x1 + 8, y, alpha(pal.text, .5), 2.5);
      seg(c, X(0), y - 7, X(0), y + 7, pal.text, 2.5); T(c, p, '0', X(0), y + (up ? -17 : 19), { size: fs, color: pal.text, weight: 700, halo: false });
      const sp = step * sc, lw = tw(c, String(step * hops), fs, 700), stride = Math.max(1, Math.ceil((lw + 8) / sp));
      for (let k = 1; k <= hops; k++) {
        const x = X(k * step), xp = X((k - 1) * step), cur = k === hops;
        const lift = clamp(sp * .38, 8, 22), cyy = y + (up ? -1 : 1) * lift * 2;
        c.beginPath(); c.moveTo(xp, y); c.quadraticCurveTo((x + xp) / 2, cyy, x, y); c.strokeStyle = alpha(col, .85); c.lineWidth = 2.4; c.stroke();
        disc(c, x, y, cur ? 6.5 : 5, col, pal.stage, 1.6);
        if (k % stride === 0 || cur) T(c, p, String(k * step), x, y + (up ? -17 : 19), { size: fs + (cur ? 1 : 0), color: col, weight: 800 });
        if (sp >= 34 && (cur || hops <= 4)) T(c, p, '+' + step, (x + xp) / 2, y + (up ? -1 : 1) * (lift + 11), { size: 12, color: col, weight: 600, halo: false });
      }
    };
    line(yA, la, ha, pal.green, true); line(yB, lb, hb, pal.red, false);
    if (meet) {
      seg(c, X(posA), yA - 6, X(posA), yB + 6, pal.violet, 2.4, [6, 4]);
      disc(c, X(posA), yA, 10, null, pal.violet, 3); disc(c, X(posA), yB, 10, null, pal.violet, 3);
      T(c, p, `${posA}`, X(posA), (yA + yB) / 2, { size: fs + 6, color: pal.violet, weight: 800 });
    }
    T(c, p, `top: multiples of ${la}`, x0 - 8, yA - 38 < hdr ? hdr + 2 : yA - 40, { size: 12, color: pal.green, align: 'left', halo: false });
    T(c, p, `bottom: multiples of ${lb}`, x0 - 8, yB + 42 > H - 8 ? H - 10 : yB + 42, { size: 12, color: pal.red, align: 'left', halo: false });
    Tfit(c, p, meet ? 'LCM = first mark both lines share' : 'Hop the line that is behind.', W / 2, H - 12, W - 16, { size: fs, color: meet ? pal.violet : pal.muted, weight: 700, halo: false });
  };

  /* A sum with a common factor pulled out */
  const sceneDist = (c, p, { a, b, g, op }) => {
    const pal = p.pal, W = p.w, H = p.h, fs = fontSize(p), big = Math.max(a, b), small = Math.min(a, b), sy = op === '+' ? '+' : '−';
    const x0 = 14, u = (W - 2 * x0) / big, bh = clamp(H * .11, 30, 46);
    Tfit(c, p, `${big} ${sy} ${small}`, 12, 8 + fs + 2, W - 24, { size: fs * 1.7, align: 'left', weight: 800, halo: false });
    Tfit(c, p, g ? `Blocks of ${g}: how many fit in each number?` : 'Pick a common factor in the panel.', 12, 8 + fs * 2.4 + 10, W - 24, { size: fs, align: 'left', color: pal.muted, halo: false });
    const bar = (v, y, col, name) => {
      if (!g) { rr(c, x0, y, v * u, bh, 5); c.fillStyle = alpha(col, .85); c.fill(); }
      else for (let k = 0; k < v / g; k++) { rr(c, x0 + k * g * u + 1, y, g * u - 2, bh, 4); c.fillStyle = alpha(col, k % 2 ? .62 : .92); c.fill(); }
      if (g && g * u >= 22) for (let k = 0; k < v / g; k++) T(c, p, String(g), x0 + (k + .5) * g * u, y + bh / 2, { size: 12, color: pal.stage, weight: 800, halo: false });
      T(c, p, `${name}${g ? `  =  ${v / g} blocks of ${g}` : ''}`, x0, y - 11, { size: fs, color: col, align: 'left', weight: 800, halo: false });
    };
    const y1 = 8 + fs * 2.4 + 10 + fs + 28, y2 = y1 + bh + 34;
    bar(big, y1, pal.blue, String(big)); bar(small, y2, pal.green, String(small));
    let y = y2 + bh + 28;
    if (g) {
      const m = big / g, n2 = small / g, left = gcd(m, n2);
      Tfit(c, p, `${big} ${sy} ${small} = ${g} × ${m} ${sy} ${g} × ${n2}`, W / 2, y, W - 16, { size: fs + 1, weight: 700, halo: false }); y += fs + 12;
      Tfit(c, p, `= ${g} × (${m} ${sy} ${n2})`, W / 2, y, W - 16, { size: fs + 5, color: pal.violet, weight: 800, halo: false }); y += fs + 14;
      Tfit(c, p, left === 1 ? `${m} and ${n2} share only 1: finished` : `${m} and ${n2} still share ${left}: pull out more`, W / 2, y, W - 16, { size: fs, color: left === 1 ? pal.green : pal.red, weight: 700, halo: false });
    }
  };

  /* Practice card (before the problem is solved) */
  const scenePractice = (c, p, { idx, marks }) => {
    const pal = p.pal, W = p.w, H = p.h, fs = fontSize(p);
    T(c, p, `Problem ${idx + 1} of ${PROBS.length}`, W / 2, H * .3, { size: fs * 1.9, weight: 800 });
    const r = clamp(W / (PROBS.length * 2.6), 7, 12), gap = r * 2.7, x0 = W / 2 - gap * (PROBS.length - 1) / 2;
    PROBS.forEach((_, i) => {
      const m = marks[i], col = m === 1 ? pal.green : m === 2 ? pal.yellow : pal.muted;
      disc(c, x0 + i * gap, H * .44, r, m ? alpha(col, .9) : null, i === idx ? pal.brass : col, i === idx ? 3.4 : 2);
    });
    T(c, p, 'green = right the first time, yellow = right after a retry', W / 2, H * .53, { size: 12, color: pal.muted, halo: false });
    para(c, p, 'Choose an answer in the panel. The picture appears when you get it right.', W / 2, H * .64, W - 40, { size: fs, color: pal.text, halo: false });
    para(c, p, 'Stuck? Try the idea with the activity buttons, then come back.', W / 2, H * .78, W - 40, { size: fs, color: pal.muted, halo: false });
  };

  /* shared pixel layout for taps */
  const lay = {};

  register({
    id: 'factors-primes-gcf-and-lcm', level: 'school',
    title: 'Factors, primes, GCF and LCM',
    blurb: 'Build factor trees, fill a Venn diagram of primes, fit square tiles to a floor and skip count to a first meeting.',
    thumb(c, p) {
      const pal = p.pal, W = p.w, H = p.h, r = Math.min(W / 19, H / 10);
      const node = (x, y, n, kind) => {
        disc(c, x, y, r, kind === 'p' ? alpha(pal.green, .9) : pal.stage, kind === 'p' ? pal.green : kind === 'c' ? pal.blue : alpha(pal.muted, .9), 2.2);
        T(c, p, String(n), x, y + 1, { size: Math.max(11, r * .95), color: kind === 'p' ? pal.stage : pal.text, weight: 800, halo: false });
      };
      const tx = W * .24, ty = H * .2, e = (x1, y1, x2, y2) => seg(c, x1, y1 + r * .8, x2, y2 - r * .8, alpha(pal.text, .45), 2);
      e(tx, ty, tx - r * 1.9, ty + r * 3); e(tx, ty, tx + r * 1.9, ty + r * 3);
      e(tx + r * 1.9, ty + r * 3, tx + r * .6, ty + r * 6); e(tx + r * 1.9, ty + r * 3, tx + r * 3.2, ty + r * 6);
      node(tx, ty, 12, 'm'); node(tx - r * 1.9, ty + r * 3, 3, 'p'); node(tx + r * 1.9, ty + r * 3, 4, 'c');
      node(tx + r * .6, ty + r * 6, 2, 'p'); node(tx + r * 3.2, ty + r * 6, 2, 'p');
      const cx = W * .76, cy = H * .5, R = Math.min(W * .13, H * .3);
      c.save(); c.beginPath(); c.arc(cx - R * .5, cy, R, 0, TAU); c.clip(); c.beginPath(); c.arc(cx + R * .5, cy, R, 0, TAU); c.fillStyle = alpha(pal.violet, .35); c.fill(); c.restore();
      disc(c, cx - R * .5, cy, R, alpha(pal.blue, .1), pal.blue, 2.2); disc(c, cx + R * .5, cy, R, alpha(pal.green, .1), pal.green, 2.2);
      T(c, p, '2', cx - R * .95, cy, { size: Math.max(11, R * .5), color: pal.blue, weight: 800, halo: false });
      T(c, p, '2 3', cx, cy, { size: Math.max(11, R * .42), color: pal.violet, weight: 800, halo: false });
      T(c, p, '3', cx + R * .95, cy, { size: Math.max(11, R * .5), color: pal.green, weight: 800, halo: false });
    },
    hook: 'Two buses leave a stop at the same time. One comes back every 4 minutes and the other every 6 minutes. When will they leave together again?',
    steps: [
      { title: 'Factors and primes',
        text: String.raw`<p>Lay out 12 tiles in a rectangle. You can do it 3 ways: 1 × 12, 2 × 6 and 3 × 4. The numbers in each pair are <b>factors</b> of 12. A factor divides 12 with nothing left over.</p><p>Now slide to 13. Only one rectangle works. A number with exactly two factors, 1 and itself, is <b>prime</b>. A number with more is <b>composite</b>.</p>`,
        set: { mode: 'factors', n: 12 } },
      { title: 'A factor tree',
        text: String.raw`<p>A <b>factor tree</b> splits a number again and again until every end number, called a leaf, is prime. Start with 36. Choose a split for the highlighted leaf, such as 4 × 9. Keep splitting the blue leaves. Stop at green ones.</p><p>Then write the primes with <b>exponents</b>. An exponent counts how many times a prime appears: 2 × 2 × 3 × 3 is \(2^2 \times 3^2\).</p>`,
        set: { mode: 'tree', root: 36 } },
      { title: 'The greatest common factor',
        text: String.raw`<p>Each circle holds the prime factors of one number: 12 = 2 × 2 × 3 and 18 = 2 × 3 × 3. Press <b>Share a 2</b> and <b>Share a 3</b> to move matching primes into the overlap, then check.</p><p>The overlap multiplies to the <b>greatest common factor</b> (GCF): 2 × 3 = 6. The Tiles view shows it as a square tile.</p>`,
        set: { mode: 'venn', a: 12, b: 18 } },
      { title: 'The least common multiple',
        text: String.raw`<p>Skip count by 4 on the top line and by 6 on the bottom line. Always hop the line that is behind.</p><p>The first mark that both lines share is the <b>least common multiple</b> (LCM). For 4 and 6 it is 12. So the two buses leave together again after 12 minutes. First try the guess slider, then hop to see.</p>`,
        set: { mode: 'lcm', la: 4, lb: 6 } }
    ],
    formal: String.raw`
      <h3>Factors and primes</h3>
      <p>A <em>factor</em> of a whole number divides it exactly. The factors of 12 are 1, 2, 3, 4, 6 and 12. Factors come in pairs: \(1\times 12\), \(2\times 6\), \(3\times 4\). Each pair is one rectangle you can make from 12 tiles.</p>
      <p>A <em>prime</em> number is a whole number greater than 1 whose only factors are 1 and itself. The first primes are 2, 3, 5, 7, 11, 13. A number greater than 1 that is not prime is <em>composite</em>. The number 1 is neither: it has only one factor, and a prime needs two. The number 2 is prime, and it is the only even prime.</p>
      <h3>Prime factorization</h3>
      <p>Every whole number greater than 1 is a product of primes, and the list of primes is the same however you split. For 36 you can start with \(4\times 9\) or with \(6\times 6\) or with \(2\times 18\). Every tree ends with 2, 2, 3 and 3. We write the answer with exponents: \(36 = 2\times 2\times 3\times 3 = 2^2\times 3^2\). The exponent says how many times the prime is used.</p>
      <h3>Greatest common factor (GCF)</h3>
      <p>The GCF of two numbers is the largest number that divides both. To find it from the primes, keep only the primes both numbers have, each as many times as <em>both</em> have it (the smaller exponent). For \(12 = 2^2\times 3\) and \(18 = 2\times 3^2\) the shared primes are one 2 and one 3, so the GCF is \(2\times 3 = 6\).</p>
      <p><b>Why a square tile gives the GCF.</b> A square tile of side \(s\) covers an \(a\) by \(b\) rectangle with no cutting only if \(s\) divides \(a\) and \(s\) divides \(b\). So \(s\) must be a common factor. The biggest tile that works is the biggest common factor. For a 36 by 48 floor the tile has side 12, and you need \(3\times 4 = 12\) tiles.</p>
      <h3>Least common multiple (LCM)</h3>
      <p>The LCM is the smallest number that is a multiple of both. Skip count by each number. The first mark on both lines is the LCM. For 4 and 6 the multiples of 4 are 4, 8, 12 and the multiples of 6 are 6, 12, so the LCM is 12. With primes, take every prime that appears in either number, each with the larger exponent. For \(18 = 2\times 3^2\) and \(24 = 2^3\times 3\) the LCM is \(2^3\times 3^2 = 72\). A check that always works: GCF \(\times\) LCM \(= a\times b\). For 4 and 6, \(2\times 12 = 24 = 4\times 6\).</p>
      <p><b>Which one do I need?</b> Cutting or sharing into equal pieces with nothing left over is a GCF job. Waiting for two repeating things to line up again is an LCM job.</p>
      <h3>Pulling out a common factor</h3>
      <p>The distributive property says \(g\times m + g\times n = g\times(m+n)\). Read it backwards to pull a common factor out of a sum: \(24+36 = 12\times 2 + 12\times 3 = 12\times(2+3)\). The same works for a difference: \(36-24 = 12\times(3-2)\). If you pull out the GCF, the numbers left inside the parentheses share only 1. If you pull out something smaller, such as 6, you get \(6\times(4+6)\) and the 4 and the 6 still share a 2.</p>`,
    check: [
      { q: 'Which statement about prime numbers is true?',
        choices: [
          'Every odd number greater than 1 is prime.',
          '1 is the smallest prime number, because its only factor is itself.',
          'A prime number has exactly two different factors, 1 and itself.',
          '2 is not prime because it is even.'
        ], answer: 2,
        why: String.raw`A prime has exactly two different factors: 1 and itself. Odd numbers are not always prime: \(9 = 3\times 3\) and \(15 = 3\times 5\). The number 1 has only one factor, so it is neither prime nor composite. And 2 has exactly two factors (1 and 2), so 2 is prime. It is the only even prime.`,
        hint: 'Count the factors of the number. How many does a prime have?' },
      { q: 'A rectangular floor is 36 cm wide and 60 cm long. It will be covered with square tiles that are all the same size, with no cutting. The tiles are as big as possible. How many tiles are needed?',
        choices: ['12', '180', '2160', '15'], answer: 3,
        why: String.raw`The biggest square that fits both sides has a side equal to the GCF of 36 and 60. \(36 = 2^2\times 3^2\) and \(60 = 2^2\times 3\times 5\). They share \(2\times 2\times 3 = 12\), so the tile side is 12 cm. Across the width: \(36\div 12 = 3\) tiles. Along the length: \(60\div 12 = 5\) tiles. In all \(3\times 5 = 15\) tiles. The answer 12 is the tile side, not the count. The answer 180 is \(2160\div 12\), which divides the area by the side instead of by the tile area 144. The answer 2160 is the area, which is the count for tiles of side 1.`,
        hint: 'Find the GCF of 36 and 60 first. Then see how many tiles fit across and along.' },
      { q: 'Lena finds the GCF of 18 and 24. She writes 18 = 2 × 3² and 24 = 2³ × 3. Then she says: "I multiply every prime that shows up, using the bigger exponent: 2³ × 3² = 72. So the GCF is 72." What is her mistake?',
        choices: [
          '72 is the LCM. For the GCF keep only shared primes, smaller exponent: 2 × 3 = 6.',
          'Nothing is wrong. The GCF always uses the biggest exponent of every prime.',
          'She should add the two numbers: 18 + 24 = 42.',
          'The GCF must be 18 or 24, because it is one of the two numbers.'
        ], answer: 0,
        why: String.raw`A common factor must divide both numbers, so it cannot be bigger than 18. Lena found 72, which is a multiple of both numbers: the LCM. For the GCF keep only what both numbers share, and use the smaller exponent: one 2 and one 3, so \(2\times 3 = 6\). Check: \(18\div 6 = 3\) and \(24\div 6 = 4\), and no bigger number divides both. The GCF is not always one of the numbers, and adding does not find a factor.`,
        hint: 'A factor of 18 cannot be larger than 18. Is 72 a factor of 18?' }
    ],
    links: { related: ['ratios-and-equivalent-ratios', 'equivalent-fractions-on-a-number-line', 'adding-fractions-with-unlike-denominators'] },

    mount({ stage, controls: C }) {
      const MODES = ['factors', 'tree', 'venn', 'tiles', 'lcm', 'dist', 'use'];
      const MLAB = { factors: 'Factors', tree: 'Factor tree', venn: 'GCF: Venn', tiles: 'GCF: Tiles', lcm: 'LCM', dist: 'Common factor', use: 'Real uses' };
      const st = {
        mode: 'factors', practice: false,
        n: 12, hide: false, fq: -1, fMsg: '',
        root: 36, tree: null, sel: null, ex: {}, exOk: false, tMsg: '', pop: { t: 1, ids: [] },
        a: 12, b: 18, sh: {}, vHist: [], vOk: false, vMsg: '', s: 1, pT: null,
        la: 4, lb: 6, ha: 0, hb: 0, lMsg: '', pL: null,
        op: '+', g: null, dMsg: '',
        story: 0, tool: null, uAns: null, uMsg: '',
        pi: 0, pSolved: false, pTried: false, pWrong: new Set(), uWrong: new Set(), pMarks: PROBS.map(() => 0), pFirst: 0, pDone: 0, pMsgHtml: '', pFin: false
      };
      const P = new Plane(stage, { span: 5 });
      if (P.coordEl) P.coordEl.style.display = 'none';
      let cancelPop = () => {};
      const kick = ids => { cancelPop(); st.pop = { t: 0, ids }; cancelPop = tween(320, v => { st.pop.t = v; P.draw(); }); };

      /* ---------- tree logic ---------- */
      const newTree = n => ({ nodes: [{ id: 0, n, par: -1, kids: [] }], hist: [] });
      const compLeaves = () => treeLeaves(st.tree).filter(id => !isPrime(st.tree.nodes[id].n));
      const resetTree = n => { st.root = n; st.tree = newTree(n); st.sel = 0; st.ex = {}; st.exOk = false; st.tMsg = ''; st.pop = { t: 1, ids: [] }; };
      const treeDone = () => compLeaves().length === 0;
      const leafPrimes = () => { const m = {}; treeLeaves(st.tree).forEach(id => { const q = st.tree.nodes[id].n; m[q] = (m[q] || 0) + 1; }); return m; };
      const describe = v => isPrime(v) ? `${v} is prime, so it is a leaf` : `${v} is composite, so split it again`;
      const doSplit = d => {
        const nd = st.tree.nodes[st.sel], m = nd.n;
        if (d === 1) { st.tMsg = `${no('That does not help.')} ${m} = 1 × ${m}, and ${m} comes right back. Every number can be written with a 1. Choose a split with two numbers bigger than 1.`; sync(); return; }
        const e = m / d, ids = [st.tree.nodes.length, st.tree.nodes.length + 1];
        [d, e].forEach(v => { const k = st.tree.nodes.length; st.tree.nodes.push({ id: k, n: v, par: nd.id, kids: [] }); nd.kids.push(k); });
        st.tree.hist.push(nd.id); st.ex = {}; st.exOk = false;
        const cl = compLeaves(); st.sel = cl.length ? cl[0] : null;
        const tail = cl.length ? '' : ` All the leaves are prime now: ${treeLeaves(st.tree).map(id => st.tree.nodes[id].n).sort((x, y) => x - y).join(', ')}. The tree is finished. Now write them with exponents.`;
        st.tMsg = `${ok('Split.')} ${m} = ${d} × ${e}. ${cap(describe(d))}. ${cap(describe(e))}.${tail}`;
        kick(ids); sync();
      };
      const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
      const undoSplit = () => {
        if (!st.tree.hist.length) return;
        const id = st.tree.hist.pop(); st.tree.nodes.length -= 2; st.tree.nodes[id].kids = []; st.ex = {}; st.exOk = false;
        st.sel = id; st.tMsg = `Undone. ${st.tree.nodes[id].n} is a leaf again.`; st.pop = { t: 1, ids: [] }; sync();
      };
      const nextLeaf = () => {
        const cl = compLeaves(); if (!cl.length) return;
        st.sel = cl[(Math.max(0, cl.indexOf(st.sel)) + 1) % cl.length]; st.tMsg = `Selected ${st.tree.nodes[st.sel].n}.`; sync();
      };
      const checkExp = () => {
        const need = leafPrimes(), ps = Object.keys(need).map(Number).sort((x, y) => x - y), root = st.tree.nodes[0].n;
        let prod = 1; ps.forEach(q => { prod *= Math.pow(q, st.ex[q] || 0); });
        const bad = ps.find(q => (st.ex[q] || 0) !== need[q]);
        if (bad === undefined) {
          st.exOk = true;
          st.tMsg = `${ok('Yes.')} ${root} = ${expForm(root)}. The exponent is how many times the prime is a factor: ${ps.map(q => `${q} appears ${need[q]} time${need[q] > 1 ? 's' : ''}`).join(', ')}. Check: ${ps.map(q => powStr(q, need[q])).join(' × ')} = ${ps.map(q => Math.pow(q, need[q])).join(' × ')} = ${root}.`;
        } else {
          const cur = st.ex[bad] || 0;
          st.tMsg = `${no('Not yet.')} With your exponents the product is ${prod}, not ${root}. Look at the prime ${bad}: the tree has ${need[bad]} ${need[bad] > 1 ? 'leaves' : 'leaf'} with ${bad}, so its exponent should be ${need[bad]}, not ${cur}.`;
        }
        sync();
      };

      /* ---------- Venn logic ---------- */
      const resetVenn = () => { st.sh = {}; st.vHist = []; st.vOk = false; st.vMsg = ''; };
      const unionPrimes = () => [...new Set([...Object.keys(cnt(st.a)), ...Object.keys(cnt(st.b))].map(Number))].sort((x, y) => x - y);
      const shareP = q => {
        const cA = cnt(st.a)[q] || 0, cB = cnt(st.b)[q] || 0, s = st.sh[q] || 0;
        st.vOk = false;
        if (cA - s > 0 && cB - s > 0) {
          st.sh[q] = s + 1; st.vHist.push(q);
          st.vMsg = `${ok('Moved.')} One ${q} from ${st.a} and one ${q} from ${st.b} are a matching pair, so they go in the overlap together.`;
        } else if (cA - s <= 0 && cB - s <= 0) st.vMsg = `${no('No more.')} All the ${q}s that ${st.a} and ${st.b} have are already shared.`;
        else { const who = cA - s <= 0 ? st.a : st.b, other = who === st.a ? st.b : st.a; st.vMsg = `${no('Not another one.')} ${who} has no ${q} left to pair. A prime goes in the overlap only when both numbers have it. ${other} has ${q} left over, but ${who} does not.`; }
        sync();
      };
      const checkVenn = () => {
        const cA = cnt(st.a), cB = cnt(st.b), miss = unionPrimes().find(q => Math.min(cA[q] || 0, cB[q] || 0) > (st.sh[q] || 0));
        if (miss !== undefined) { st.vOk = false; st.vMsg = `${no('Not finished.')} ${st.a} and ${st.b} both still have a ${miss} outside the overlap. Share it.`; }
        else {
          st.vOk = true; const sh = []; unionPrimes().forEach(q => { for (let i = 0; i < (st.sh[q] || 0); i++) sh.push(q); });
          const g = sh.reduce((m, v) => m * v, 1);
          st.vMsg = sh.length ? `${ok('Yes.')} The overlap holds ${sh.join(', ')}. GCF = ${sh.join(' × ')} = ${g}. ${st.a} ÷ ${g} = ${st.a / g} and ${st.b} ÷ ${g} = ${st.b / g}, so ${g} divides both. A bigger number would need another shared prime.`
            : `${ok('Yes.')} Nothing is shared, so the only common factor is 1. GCF = 1. Numbers like this are called relatively prime.`;
        }
        sync();
      };
      const undoVenn = () => { const q = st.vHist.pop(); if (q === undefined) return; st.sh[q]--; st.vOk = false; st.vMsg = `Took one ${q} out of the overlap.`; sync(); };

      /* ---------- tiles, lcm, dist ---------- */
      const gc = () => gcd(st.a, st.b);
      const clampS = () => { st.s = clamp(Math.round(st.s), 1, Math.min(st.a, st.b)); };
      const setS = v => { st.s = v; clampS(); sync(); };
      const nextFit = () => { clampS(); let v = st.s + 1; const m = Math.min(st.a, st.b); while (v <= m && (st.a % v || st.b % v)) v++; if (v <= m) st.s = v; sync(); };
      const resetT = () => { st.s = 1; st.pT = null; };
      const L0 = () => lcm(st.la, st.lb);
      const hop = which => {
        const step = which === 'A' ? st.la : st.lb, h0 = which === 'A' ? st.ha : st.hb, pos = h0 * step, L = L0();
        const other = which === 'A' ? st.hb * st.lb : st.ha * st.la, name = which === 'A' ? 'top' : 'bottom', oname = which === 'A' ? 'bottom' : 'top';
        if (pos >= L) { st.lMsg = `${no('Stop here.')} The ${name} line has already reached ${L}, where both lines meet. Hop the ${oname} line to catch up.`; sync(); return; }
        if (which === 'A') st.ha++; else st.hb++;
        const np = pos + step;
        if (np === other) st.lMsg = `${ok('They meet.')} Both lines are at ${np}. It is the first mark on both lines, so the LCM is ${np}.`;
        else st.lMsg = `The ${name} line is at ${np} and the ${oname} line is at ${other}. ${np > other ? `The ${name} line is ahead, so hop the ${oname} line.` : `The ${name} line is still behind, so hop it again.`}`;
        sync();
      };
      const resetL = () => { st.ha = 0; st.hb = 0; st.lMsg = ''; st.pL = null; };
      const showAll = () => { const L = L0(); st.ha = L / st.la; st.hb = L / st.lb; st.lMsg = `${ok('Done.')} The first shared mark is ${L}. ${L} = ${st.la} × ${L / st.la} and ${L} = ${st.lb} × ${L / st.lb}.`; sync(); };

      /* ---------- predict-then-see ---------- */
      const predTilesMsg = g0 => {
        const a = st.a, b = st.b, g = gc();
        if (g0 === g) return `${ok('Yes.')} ${g} fits both sides and nothing bigger does. The picture shows it. This is the GCF of ${a} and ${b}.`;
        if (a % g0 === 0 && b % g0 === 0) return `${no('Close.')} A tile of side ${g0} fits exactly, but it is not the biggest. ${g} fits too, and it is bigger. The picture shows the biggest one.`;
        const bad = a % g0 ? a : b;
        return `${no('Not quite.')} A tile of side ${g0} does not fit: ${bad} ÷ ${g0} leaves ${bad % g0} left over. The biggest side that fits both is ${g}. The picture shows it.`;
      };
      const predLcmMsg = g0 => {
        const la = st.la, lb = st.lb, L = L0();
        if (g0 === L) return `${ok('Yes.')} ${L} is the first number in both lists. The lines now show it.`;
        if (g0 % la === 0 && g0 % lb === 0) return `${no('Close.')} ${g0} is a shared multiple, but it is not the first. They already meet at ${L}. The lines show the first meeting.`;
        const bad = g0 % la ? la : lb;
        return `${no('Not quite.')} ${g0} is not a multiple of ${bad}: ${g0} ÷ ${bad} leaves ${g0 % bad}. The first mark both lines share is ${L}. The lines show it.`;
      };

      /* ---------- the picture ---------- */
      const story = () => STORIES[st.story];
      const view = () => {
        const m = st.mode;
        if (st.practice) {
          const pr = PROBS[st.pi];
          if (st.pFin) return { t: 'card' };
          if (!st.pSolved) return { t: 'card' };
          return pr.view;
        }
        if (m === 'factors') return { t: 'factors', n: st.n, hide: st.hide };
        if (m === 'tree') return { t: 'tree' };
        if (m === 'venn') return { t: 'venn', a: st.a, b: st.b };
        if (m === 'tiles') return { t: 'tiles', a: st.a, b: st.b, s: st.s };
        if (m === 'lcm') return { t: 'lcm', la: st.la, lb: st.lb, ha: st.ha, hb: st.hb };
        if (m === 'dist') return { t: 'dist', a: st.a, b: st.b, g: st.g, op: st.op };
        const S = story();
        return S.tool === 'gcf' ? { t: 'tiles', a: S.a, b: S.b, s: st.s, tag: S.name } : { t: 'lcm', la: S.la, lb: S.lb, ha: st.ha, hb: st.hb, nameA: S.nameA, nameB: S.nameB, unit: S.unit };
      };
      P.onDraw = (c, p) => {
        const v = view();
        if (v.t === 'factors') sceneFactors(c, p, v);
        else if (v.t === 'tree') {
          if (st.practice) { const tr = autoTree(PROBS[st.pi].view.n), ex = {}; factorize(tr.nodes[0].n).forEach(([q, e]) => { ex[q] = e; }); sceneTree(c, p, { tree: tr, sel: null, pop: { t: 1, ids: [] }, ex, done: true, showExp: true, exOk: true }); }
          else sceneTree(c, p, { tree: st.tree, sel: st.sel, pop: st.pop, ex: st.ex, done: treeDone(), showExp: true, exOk: st.exOk });
        } else if (v.t === 'venn') {
          if (st.practice) { const A = cnt(v.a), B = cnt(v.b), sh = {}; Object.keys(A).forEach(q => { if (B[q]) sh[q] = Math.min(A[q], B[q]); }); sceneVenn(c, p, { a: v.a, b: v.b, sh, done: true }); }
          else sceneVenn(c, p, { a: v.a, b: v.b, sh: st.sh, done: st.vOk });
        } else if (v.t === 'tiles') sceneTiles(c, p, v);
        else if (v.t === 'lcm') {
          const L = lcm(v.la, v.lb);
          sceneLcm(c, p, st.practice ? { ...v, ha: L / v.la, hb: L / v.lb } : v);
        } else if (v.t === 'dist') sceneDist(c, p, v);
        else scenePractice(c, p, { idx: st.pi, marks: st.pMarks });
      };

      /* ---------- controls ---------- */
      const probe = C.readout(), host = probe.parentElement; probe.remove();
      const group = build => {
        const before = new Set(host.children); build();
        const g = h('div', { style: 'display:flex;flex-direction:column;gap:16px;flex:none' });
        [...host.children].filter(e => !before.has(e)).forEach(e => g.append(e));
        host.append(g); return g;
      };
      const small = bs => bs.forEach(b => Object.assign(b.style, { padding: '6px 14px', minHeight: '40px', fontSize: '.9rem' }));
      const mkBtn = (label, fn, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: fn }, label);
      const G = {}, R = {};
      let modeBtns = [], nSlider, aSlider, bSlider, sSlider, laSlider, lbSlider, presetSel, lpresetSel, treeSel, storySel;
      let fqBtns, factAns, treeBox, expBox, vennBox, vennAct, tilePred, lcmPred, distBox, useTools, useAns, dopBtns;
      const pred = {};

      C.title('Explore');
      const row1 = C.buttons(['factors', 'tree', 'venn', 'tiles'].map(m => ({ label: MLAB[m], onClick: () => setMode(m) })));
      const row2 = C.buttons(['lcm', 'dist', 'use'].map(m => ({ label: MLAB[m], onClick: () => setMode(m) })));
      modeBtns = [...row1, ...row2]; small(modeBtns);

      /* factors */
      G.factors = group(() => {
        nSlider = C.slider({ label: 'Number of tiles', min: 1, max: 50, step: 1, value: st.n, format: v => String(v), onInput: v => { st.n = v; st.hide = false; st.fMsg = ''; sync(); } });
        const [mn, pl] = C.buttons([{ label: '− 1', onClick: () => { st.n = clamp(st.n - 1, 1, 50); st.hide = false; st.fMsg = ''; sync(); } }, { label: '+ 1', onClick: () => { st.n = clamp(st.n + 1, 1, 50); st.hide = false; st.fMsg = ''; sync(); } }]);
        small([mn, pl]);
        C.hint('Each rectangle uses all the tiles. The two sides of a rectangle are a pair of factors.');
        C.title('Prime or composite?');
        C.hint('A number is shown without the rectangles. Decide first, then see.');
        const [show] = C.buttons([{ label: 'Show me a number', primary: true, onClick: () => { st.fq = (st.fq + 1) % FQ.length; st.n = FQ[st.fq]; st.hide = true; st.fMsg = ''; sync(); } }]);
        small([show]);
        factAns = C.buttons([{ label: 'Prime', onClick: () => answerF('prime') }, { label: 'Composite', onClick: () => answerF('composite') }, { label: 'Neither', onClick: () => answerF('neither') }]);
        small(factAns);
        R.factors = C.readout();
      });
      const kindOf = n => n === 1 ? 'neither' : isPrime(n) ? 'prime' : 'composite';
      const answerF = k => {
        if (!st.hide) return;
        const n = st.n, real = kindOf(n), d = divisors(n);
        const why = real === 'neither' ? '1 has only one factor, itself. A prime needs exactly two. So 1 is neither prime nor composite.'
          : real === 'prime' ? `${n} has only two factors, 1 and ${n}. Only one rectangle, 1 × ${n}, uses ${n} tiles.`
          : `${n} has ${d.length} factors: ${d.join(', ')}. For example ${n} = ${d[1]} × ${n / d[1]}, so it makes more than one rectangle.`;
        st.fMsg = (k === real ? ok('Right.') : no('Not quite.')) + ` ${n} is ${real === 'neither' ? 'neither prime nor composite' : real}. ${why}`;
        st.hide = false; sync();
      };

      /* factor tree */
      G.tree = group(() => {
        C.title('Choose a split');
        treeSel = C.select({ label: 'Start number', value: String(st.root), options: TREE_ROOTS.map(n => ({ value: String(n), label: String(n) })), onChange: v => { resetTree(+v); sync(); } });
        treeBox = h('div', { class: 'ctl buttons' }); host.append(treeBox);
        expBox = h('div', { style: 'display:flex;flex-direction:column;gap:10px' }); host.append(expBox);
        R.tree = C.readout();
      });

      /* shared number sliders for venn, tiles and common factor */
      G.nums = group(() => {
        C.title('Choose two numbers');
        presetSel = C.select({ label: 'Pairs to try', value: '0', options: PAIRS.map((q, i) => ({ value: String(i), label: `${q[0]} and ${q[1]}` })).concat([{ value: '-1', label: 'Your numbers' }]), onChange: v => { if (+v >= 0) { st.a = PAIRS[+v][0]; st.b = PAIRS[+v][1]; newPair(); } } });
        aSlider = C.slider({ label: 'First number', min: 1, max: 100, step: 1, value: st.a, format: v => String(v), onInput: v => { st.a = v; newPair(); } });
        bSlider = C.slider({ label: 'Second number', min: 1, max: 100, step: 1, value: st.b, format: v => String(v), onInput: v => { st.b = v; newPair(); } });
      });
      const newPair = () => { resetVenn(); resetT(); st.g = null; st.dMsg = ''; sync(); };

      G.venn = group(() => {
        C.title('Fill the Venn diagram');
        C.hint('Each circle holds the prime factors of one number. Move a matching pair into the overlap.');
        vennBox = h('div', { class: 'ctl buttons' }); host.append(vennBox);
        R.venn = C.readout();
      });

      /* tiles: predict, then the tile side */
      G.predT = group(() => {
        C.title('Predict first');
        C.hint('What is the side of the biggest square tile that covers the rectangle with nothing left over?');
        pred.tS = C.slider({ label: 'My guess for the tile side', min: 1, max: 100, step: 1, value: 6, format: v => String(v), onInput: () => {} });
        [pred.tB] = C.buttons([{ label: 'Lock in my guess', primary: true, onClick: () => { if (st.pT == null) { st.pT = clamp(pred.tS.get(), 1, Math.min(st.a, st.b)); st.s = gc(); sync(); } } }]);
        small([pred.tB]);
        R.predT = C.readout();
      });

      G.use = group(() => {
        C.title('A real problem');
        storySel = C.select({ label: 'Story', value: '0', options: STORIES.map((q, i) => ({ value: String(i), label: q.name })), onChange: v => loadStory(+v) });
        R.useQ = C.readout();
        C.hint('Which tool is it? Choose, then use the picture to find the answer.');
        useTools = C.buttons([{ label: 'GCF (biggest piece)', onClick: () => pickTool('gcf') }, { label: 'LCM (first meeting)', onClick: () => pickTool('lcm') }]); small(useTools);
        useAns = h('div', { class: 'ctl buttons' }); host.append(useAns);
        R.use = C.readout();
      });

      G.tiles = group(() => {
        C.title('Try a tile');
        sSlider = C.slider({ label: 'Side of one square tile', min: 1, max: 100, step: 1, value: 1, format: v => String(v), onInput: v => setS(v) });
        const bs = C.buttons([{ label: 'Smaller', onClick: () => setS(st.s - 1) }, { label: 'Bigger', onClick: () => setS(st.s + 1) }, { label: 'Next side that fits', onClick: () => nextFit() }]);
        small(bs);
        R.tiles = C.readout();
      });

      G.lnums = group(() => {
        C.title('Choose two numbers');
        lpresetSel = C.select({ label: 'Pairs to try', value: '0', options: LPAIRS.map((q, i) => ({ value: String(i), label: `${q[0]} and ${q[1]}` })).concat([{ value: '-1', label: 'Your numbers' }]), onChange: v => { if (+v >= 0) { st.la = LPAIRS[+v][0]; st.lb = LPAIRS[+v][1]; resetL(); sync(); } } });
        laSlider = C.slider({ label: 'Top line counts by', min: 2, max: 12, step: 1, value: st.la, format: v => String(v), onInput: v => { st.la = v; resetL(); sync(); } });
        lbSlider = C.slider({ label: 'Bottom line counts by', min: 2, max: 12, step: 1, value: st.lb, format: v => String(v), onInput: v => { st.lb = v; resetL(); sync(); } });
      });
      G.predL = group(() => {
        C.title('Predict first');
        C.hint('Before you hop: where do you think the two lines first share a mark?');
        pred.lS = C.slider({ label: 'My guess for the first meeting', min: 2, max: 132, step: 1, value: 10, format: v => String(v), onInput: () => {} });
        [pred.lB] = C.buttons([{ label: 'Lock in my guess', primary: true, onClick: () => { if (st.pL == null) { st.pL = pred.lS.get(); st.ha = L0() / st.la; st.hb = L0() / st.lb; sync(); } } }]);
        small([pred.lB]);
        R.predL = C.readout();
      });
      G.hops = group(() => {
        C.title('Skip count');
        [pred.hA, pred.hB] = C.buttons([{ label: 'Hop the top line', primary: true, onClick: () => hop('A') }, { label: 'Hop the bottom line', primary: true, onClick: () => hop('B') }]);
        const [sa, rs] = C.buttons([{ label: 'Show the first meeting', onClick: () => showAll() }, { label: 'Start over', onClick: () => { resetL(); sync(); } }]);
        small([pred.hA, pred.hB, sa, rs]);
        R.hops = C.readout();
      });
      G.dist = group(() => {
        C.title('Pull out a common factor');
        const ops = C.buttons([{ label: 'Sum  a + b', onClick: () => { st.op = '+'; st.g = null; st.dMsg = ''; sync(); } }, { label: 'Difference  a − b', onClick: () => { st.op = '−'; st.g = null; st.dMsg = ''; sync(); } }]);
        small(ops); pred.ops = ops;
        C.hint('Choose a number to pull out of both numbers.');
        distBox = h('div', { class: 'ctl buttons' }); host.append(distBox);
        R.dist = C.readout();
      });

      /* Practice, after the explore controls */
      const pTitle = h('p', { class: 'ctl-title' }, 'Practice'); host.append(pTitle);
      const pHint = h('p', { class: 'hint' }, 'Eight short problems. Nothing here is saved or scored.'); host.append(pHint);
      const [pStart] = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { st.practice = !st.practice; if (st.practice) loadProb(true); sync(); } }]);
      small([pStart]);
      G.prac = group(() => {
        R.pTally = h('p', { class: 'ctl-title' }); host.append(R.pTally);
        R.pQ = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' }); host.append(R.pQ);
        R.pCh = h('div', { class: 'ctl buttons', style: 'flex-direction:column;align-items:stretch' }); host.append(R.pCh);
        R.pFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); host.append(R.pFb);
        R.pNext = mkBtn('Next problem', () => nextProb(), true); host.append(h('div', { class: 'ctl buttons' }, R.pNext));
      });

      /* ---------- mode changes ---------- */
      const setMode = m => {
        st.practice = false; st.mode = m;
        if (m === 'use') loadStory(st.story, true);
        else if (m === 'tiles') clampS();
        sync();
      };
      const loadStory = (i, keep) => {
        st.story = i; const S = STORIES[i]; st.tool = null; st.uAns = null; st.uMsg = ''; st.uWrong = new Set();
        st.ha = 0; st.hb = 0; st.lMsg = ''; st.s = 1;
        if (S.tool === 'gcf') { st.a = S.a; st.b = S.b; } else { st.la = S.la; st.lb = S.lb; }
        if (!keep) sync();
      };
      const pickTool = t => {
        const S = story(); if (st.tool) return;
        if (t === S.tool) { st.tool = t; st.uMsg = `${ok('Right tool.')} ${S.why[t]} Use the picture, then choose the answer.`; }
        else st.uMsg = `${no('Not that tool.')} ${S.why[t]}`;
        sync();
      };
      const pickUse = i => {
        const S = story(); if (st.uAns === S.ans) return;
        const good = i === S.ans;
        if (good) { st.uAns = i; st.uMsg = `${ok('Right.')} ${S.ch[i][1].replace(/^Yes\.\s*/, '')}`; if (S.tool === 'gcf') st.s = gcd(S.a, S.b); else { st.ha = lcm(S.la, S.lb) / S.la; st.hb = lcm(S.la, S.lb) / S.lb; } }
        else { st.uMsg = `${no('Not quite.')} ${S.ch[i][1]} Try another answer.`; st.uWrong.add(i); }
        sync();
      };

      /* ---------- practice ---------- */
      const loadProb = reset => {
        if (reset && st.pFin) { st.pi = 0; st.pFirst = 0; st.pDone = 0; st.pMarks = PROBS.map(() => 0); st.pFin = false; }
        st.pSolved = false; st.pTried = false; st.pMsgHtml = ''; st.pWrong = new Set();
      };
      const pickP = i => {
        const pr = PROBS[st.pi]; if (st.pSolved) return;
        if (i === pr.ans) {
          st.pSolved = true; st.pMarks[st.pi] = st.pTried ? 2 : 1; if (!st.pTried) st.pFirst++; st.pDone++;
          st.pMsgHtml = ok('Right.') + ' ' + pr.ch[i][1].replace(/^Yes\.\s*/, '') + ' The picture shows why.';
        } else { st.pTried = true; st.pWrong.add(i); st.pMsgHtml = no('Not quite.') + ' ' + pr.ch[i][1].replace(/^Not quite\.\s*/, '') + ' Try another answer.'; }
        sync();
      };
      const nextProb = () => {
        if (st.pi < PROBS.length - 1) { st.pi++; loadProb(); sync(); return; }
        st.pFin = true; sync();
      };

      /* ---------- sync ---------- */
      const show = (el, on) => { el.style.display = on ? 'flex' : 'none'; };
      const sync = () => {
        const m = st.practice ? '' : st.mode, tiles = m === 'tiles', useT = m === 'use' && story().tool === 'gcf', useL = m === 'use' && story().tool === 'lcm';
        modeBtns.forEach((b, i) => { const on = MODES[i] === m; b.className = on ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', on); });
        show(G.factors, m === 'factors'); show(G.tree, m === 'tree');
        show(G.nums, ['venn', 'tiles', 'dist'].includes(m)); show(G.venn, m === 'venn');
        show(G.predT, tiles); show(G.use, m === 'use'); show(G.tiles, tiles || useT);
        show(G.lnums, m === 'lcm'); show(G.predL, m === 'lcm'); show(G.hops, m === 'lcm' || useL); show(G.dist, m === 'dist');
        show(G.prac, st.practice);
        pStart.textContent = st.practice ? 'Back to exploring' : (st.pDone || st.pFin ? 'Continue practice' : 'Start practice');
        /* numbers */
        clampS();
        aSlider.set(st.a); bSlider.set(st.b); nSlider.set(st.n); sSlider.set(st.s); laSlider.set(st.la); lbSlider.set(st.lb);
        const pi = PAIRS.findIndex(q => q[0] === st.a && q[1] === st.b); presetSel.value = String(pi);
        const li = LPAIRS.findIndex(q => q[0] === st.la && q[1] === st.lb); lpresetSel.value = String(li);
        treeSel.value = String(st.root); storySel.value = String(st.story);
        /* factors */
        factAns.forEach(b => { b.disabled = !st.hide; });
        {
          const n = st.n, d = divisors(n), pairs = d.filter(i => i * i <= n).length, k = kindOf(n);
          let html = '';
          if (st.hide) html = `${kk('Number')} ${n}<br>Is ${n} prime, composite, or neither? Choose a button.`;
          else {
            if (st.fMsg) html += st.fMsg + '<br>';
            html += `${kk('Number')} ${n}<br>${kk('Factors')} ${d.join(', ')} (${d.length} ${d.length === 1 ? 'factor' : 'factors'})<br>${kk('Rectangles')} ${pairs}: ${d.filter(i => i * i <= n).map(i => `${i} × ${n / i}`).join(', ')}<br>`;
            html += k === 'neither' ? '1 is neither prime nor composite: it has only one factor.'
              : k === 'prime' ? `${n} is <b style="color:var(--green)">prime</b>: its only factors are 1 and ${n}.`
              : `${n} is <b style="color:var(--blue)">composite</b>: it has more than two factors.`;
          }
          R.factors.innerHTML = html;
        }
        /* tree */
        if (!st.tree) resetTree(st.root);
        {
          const cl = compLeaves(), done = cl.length === 0, nd = st.sel != null ? st.tree.nodes[st.sel] : null;
          treeBox.replaceChildren();
          if (!done && nd) {
            for (let d = 2; d * d <= nd.n; d++) if (nd.n % d === 0) treeBox.append(mkBtn(`${d} × ${nd.n / d}`, () => doSplit(d), true));
            treeBox.append(mkBtn(`1 × ${nd.n}`, () => doSplit(1)));
            if (cl.length > 1) treeBox.append(mkBtn('Next leaf', nextLeaf));
          }
          treeBox.append(mkBtn('Undo', undoSplit)); treeBox.append(mkBtn('Start over', () => { resetTree(st.root); sync(); }));
          [...treeBox.children].forEach(b => Object.assign(b.style, { padding: '6px 14px', minHeight: '40px', fontSize: '.9rem' }));
          expBox.replaceChildren();
          if (done) {
            const need = leafPrimes(), ps = Object.keys(need).map(Number).sort((x, y) => x - y);
            expBox.append(h('p', { class: 'hint' }, 'Write the primes with exponents. Set how many times each prime appears.'));
            ps.forEach(q => {
              const v = st.ex[q] || 0;
              const mn = mkBtn('−', () => { st.ex[q] = Math.max(0, (st.ex[q] || 0) - 1); st.exOk = false; sync(); }), pl = mkBtn('+', () => { st.ex[q] = Math.min(7, (st.ex[q] || 0) + 1); st.exOk = false; sync(); });
              mn.setAttribute('aria-label', `fewer ${q}s`); pl.setAttribute('aria-label', `more ${q}s`);
              expBox.append(h('div', { class: 'ctl buttons', style: 'align-items:center' }, h('span', { style: 'min-width:6.5rem' }, `Exponent of ${q}`), mn, h('span', { style: 'min-width:1.6rem;text-align:center;font-weight:800' }, String(v)), pl));
            });
            const live = ps.map(q => powStr(q, st.ex[q] || 0)).join(' × '), prod = ps.reduce((mm, q) => mm * Math.pow(q, st.ex[q] || 0), 1);
            expBox.append(h('p', { class: 'hint' }, `Your product: ${live} = ${prod}. Goal: ${st.tree.nodes[0].n}.`));
            const chk = mkBtn('Check my factorization', checkExp, true); Object.assign(chk.style, { padding: '6px 14px', minHeight: '40px', fontSize: '.9rem' });
            expBox.append(h('div', { class: 'ctl buttons' }, chk));
          }
          let th = st.tMsg ? st.tMsg + '<br>' : '';
          if (!done && nd) th += `${kk('Highlighted leaf')} ${nd.n}. It is composite, so choose a split.<br>`;
          th += `${kk('Leaves so far')} ${treeLeaves(st.tree).map(id => st.tree.nodes[id].n).join(', ')}`;
          R.tree.innerHTML = th;
        }
        /* venn */
        {
          const ps = unionPrimes(); vennBox.replaceChildren();
          ps.forEach(q => vennBox.append(mkBtn(`Share a ${q}`, () => shareP(q), true)));
          vennBox.append(mkBtn('Take back', undoVenn)); vennBox.append(mkBtn('Check my Venn diagram', checkVenn, true));
          [...vennBox.children].forEach(b => Object.assign(b.style, { padding: '6px 14px', minHeight: '40px', fontSize: '.9rem' }));
          const sh = []; ps.forEach(q => { for (let i = 0; i < (st.sh[q] || 0); i++) sh.push(q); });
          R.venn.innerHTML = `${st.vMsg ? st.vMsg + '<br>' : ''}${kk(String(st.a))} ${flatForm(st.a)}<br>${kk(String(st.b))} ${flatForm(st.b)}<br>${kk('Shared so far')} ${sh.length ? sh.join(', ') : 'nothing yet'}`;
        }
        /* tiles (explore and story) */
        {
          const a = st.a, b = st.b;
          const s = clamp(st.s, 1, Math.min(a, b)), fit = a % s === 0 && b % s === 0, g = gcd(a, b);
          let html = `${kk('Floor')} ${a} by ${b}<br>${kk('Tile side')} ${s}<br>${kk('Across')} ${a} ÷ ${s} = ${a % s ? Math.floor(a / s) + ' with ' + (a % s) + ' left over' : a / s}<br>${kk('Along')} ${b} ÷ ${s} = ${b % s ? Math.floor(b / s) + ' with ' + (b % s) + ' left over' : b / s}<br>`;
          if (fit) html += `${ok('Fits exactly.')} ${a / s} × ${b / s} = ${a / s * (b / s)} tiles. ${s === g ? `No bigger side fits both. ${s} is the GCF of ${a} and ${b}.` : 'Can you find a bigger side that also fits?'}`;
          else html += `${no('Does not fit.')} A tile must divide both sides. The red strips are left over.`;
          R.tiles.innerHTML = html;
        }
        /* predict (tiles) */
        {
          const mx = Math.min(st.a, st.b);
          pred.tS.set(clamp(st.pT != null ? st.pT : clamp(pred.tS.get(), 1, mx), 1, mx));
          pred.tB.disabled = st.pT != null;
          R.predT.innerHTML = st.pT == null ? `${kk('Rectangle')} ${st.a} by ${st.b}. Choose a guess, then lock it in.` : predTilesMsg(st.pT);
        }
        /* story */
        {
          const S = story();
          R.useQ.innerHTML = `${kk('Story')} ${S.q}`;
          useTools.forEach((b, i) => { const t = i ? 'lcm' : 'gcf'; b.disabled = !!st.tool; b.className = st.tool === t ? 'btn primary' : 'btn'; });
          useAns.replaceChildren();
          if (st.tool) S.ch.forEach((o, i) => { const b = mkBtn(o[0], () => pickUse(i), st.uAns === i); b.disabled = st.uAns != null || st.uWrong.has(i); Object.assign(b.style, { padding: '6px 14px', minHeight: '40px', fontSize: '.9rem' }); useAns.append(b); });
          R.use.innerHTML = st.uMsg || 'Choose the tool that fits the story.';
        }
        /* lcm */
        {
          const la = st.la, lb = st.lb, ha = st.ha, hb = st.hb, S = story();
          const ula = useL ? S.la : la, ulb = useL ? S.lb : lb;
          const mult = (step, hops) => hops ? Array.from({ length: hops }, (_, i) => step * (i + 1)).join(', ') : 'none yet';
          const Lu = lcm(ula, ulb);
          R.hops.innerHTML = `${st.lMsg ? st.lMsg + '<br>' : ''}${kk('Top line, by ' + ula + ':')} ${mult(ula, ha)}<br>${kk('Bottom line, by ' + ulb + ':')} ${mult(ulb, hb)}<br>${ha * ula === hb * ulb && ha ? `${kk('LCM')} ${Lu}` : 'Hop the line that is behind. Stop when both lines are on the same number.'}`;
          pred.hA.textContent = `Hop the top line: +${ula}`; pred.hB.textContent = `Hop the bottom line: +${ulb}`;
          pred.lS.set(clamp(st.pL != null ? st.pL : pred.lS.get(), 2, 132));
          pred.lB.disabled = st.pL != null;
          R.predL.innerHTML = st.pL == null ? `${kk('Numbers')} ${la} and ${lb}. Choose a guess, then lock it in.` : predLcmMsg(st.pL);
        }
        /* dist */
        {
          const g = gc(), big = Math.max(st.a, st.b), small0 = Math.min(st.a, st.b), sy = st.op;
          pred.ops.forEach((b, i) => { const on = (i === 0) === (sy === '+'); b.className = on ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', on); });
          distBox.replaceChildren();
          const opts = divisors(g).concat([]); let trap = 2; while (trap < 12 && st.a % trap === 0 && st.b % trap === 0) trap++;
          const all = [...new Set(opts.concat(g === 1 || (st.a % trap || st.b % trap) ? [trap] : []))].sort((x, y) => x - y);
          all.forEach(q => { const bt = mkBtn(String(q), () => pickG(q), st.g === q); Object.assign(bt.style, { padding: '6px 14px', minHeight: '40px', fontSize: '.9rem' }); distBox.append(bt); });
          R.dist.innerHTML = (st.dMsg ? st.dMsg + '<br>' : '') + `${kk('Numbers')} ${big} ${sy} ${small0}<br>${g === 1 ? 'These numbers share only 1, so there is nothing bigger to pull out.' : 'Keep going until the two numbers inside the parentheses share only 1.'}`;
        }
        /* practice */
        if (st.practice) {
          const pr = PROBS[st.pi];
          R.pTally.textContent = st.pFin ? 'All eight problems are done' : `Right on the first try: ${st.pFirst} of ${st.pDone} done`;
          R.pQ.textContent = st.pFin ? '' : `${st.pi + 1}. ${pr.q}`;
          R.pCh.replaceChildren();
          if (!st.pFin) pr.ch.forEach((o, i) => {
            const b = mkBtn(o[0], () => pickP(i), st.pSolved && i === pr.ans); b.style.textAlign = 'left';
            b.disabled = st.pSolved || st.pWrong.has(i); R.pCh.append(b);
          });
          R.pNext.style.display = st.pFin ? 'none' : ''; R.pNext.disabled = !st.pSolved; R.pNext.textContent = st.pi === PROBS.length - 1 ? 'Finish' : 'Next problem';
          R.pFb.innerHTML = st.pFin ? `You got ${st.pFirst} of ${PROBS.length} right on the first try. Press <b>Back to exploring</b>, then open <b>Start practice</b> to see the problems again.` : st.pMsgHtml;
          if (st.pFin) { const again = mkBtn('Start over', () => { loadProb(true); sync(); }, true); R.pCh.append(again); }
        }
        P.draw();
      };
      const pickG = q => {
        const a = st.a, b = st.b, big = Math.max(a, b), small0 = Math.min(a, b), g = gc(), sy = st.op;
        if (big % q || small0 % q) { const bad = big % q ? big : small0; st.dMsg = `${no('Not a common factor.')} ${bad} ÷ ${q} leaves ${bad % q}, so ${q} does not divide both numbers. The factor you pull out must divide both.`; st.g = null; sync(); return; }
        st.g = q; const m = big / q, n = small0 / q, left = gcd(m, n);
        if (q === g) st.dMsg = `${ok('Yes.')} ${big} ${sy} ${small0} = ${q} × ${m} ${sy} ${q} × ${n} = ${q} × (${m} ${sy} ${n}). ${g === 1 ? `The only common factor of ${big} and ${small0} is 1, so there is nothing to pull out.` : `${m} and ${n} share only 1, so you pulled out the greatest common factor.`}`;
        else st.dMsg = `${no('Correct but not finished.')} ${big} ${sy} ${small0} = ${q} × (${m} ${sy} ${n}) is true. But ${m} and ${n} still share ${left}. Pull out more: the GCF is ${g}.`;
        sync();
      };

      /* taps on a blue leaf select it (the Next leaf button does the same for keyboards) */
      draggable(P, {
        hit: (px, py) => {
          if (st.practice || st.mode !== 'tree' || !lay.nodes) return null;
          for (const id in lay.nodes) { const q = lay.nodes[id]; if (Math.hypot(px - q.x, py - q.y) < q.r) return +id; }
          return null;
        },
        move: id => { if (st.sel !== id) { st.sel = id; st.tMsg = `Selected ${st.tree.nodes[id].n}.`; sync(); } }
      });

      resetTree(36); resetVenn();
      sync();

      /* ---------- guided steps ---------- */
      const apply = (patch, immediate) => {
        st.practice = false; cancelPop(); st.pop = { t: 1, ids: [] };
        if (patch.mode) st.mode = patch.mode;
        if (patch.n !== undefined) { st.n = patch.n; st.hide = false; st.fMsg = ''; }
        if (patch.root !== undefined) resetTree(patch.root);
        if (patch.a !== undefined) { st.a = patch.a; st.b = patch.b; resetVenn(); resetT(); st.g = null; st.dMsg = ''; }
        if (patch.la !== undefined) { st.la = patch.la; st.lb = patch.lb; resetL(); }
        if (st.mode === 'use') loadStory(st.story, true);
        sync();
      };
      return { destroy: () => { cancelPop(); P.destroy(); }, apply };
    }
  });
}
