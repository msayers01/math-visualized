/* =====================================================================
   SCHOOL — Matrices
   ===================================================================== */
{
  /* ---------- numbers and words ---------- */
  const MINUS = '−';
  const nf = v => { const s = String(Math.round(v * 100) / 100); return s[0] === '-' ? MINUS + s.slice(1) : s; };
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;
  const mmul = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, a, k) => s + a * B[k][j], 0)));
  const colOf = (B, j) => B.map(r => r[j]);
  const zeros = (r, c) => Array.from({ length: r }, () => Array(c).fill(0));
  const nulls = (r, c) => Array.from({ length: r }, () => Array(c).fill(null));
  const same = (A, B) => A.every((r, i) => r.every((v, j) => v === B[i][j]));

  /* ---------- the school stores ---------- */
  const STORES = ['Store A', 'Store B'], ITEMS = ['Pencils', 'Notebooks', 'Erasers'], IT = ['pencils', 'notebooks', 'erasers'];
  const SHORT = ['Pencils', 'Books', 'Erasers'];
  const SUP = ['Supplier X', 'Supplier Y'];
  const W1 = [[10, 20, 5], [15, 25, 10]], W2 = [[12, 18, 10], [10, 30, 5]];
  const QT = [[3, 2, 4], [2, 4, 1]], PR = [[2, 1], [3, 4], [1, 2]], PRICE = [[1], [3], [2]];
  const MA = [[1, 2], [0, 1]], MB = [[1, 0], [3, 1]];
  const nm = (i, j) => `${STORES[i]}, ${IT[j]}`;

  /* one choice per row in the panel; the right one is placed by `pos` so it is not always first */
  const mkQ = (id, ask, items, pos, extra) => {
    const right = items.find(x => x.right), rest = items.filter(x => !x.right), p = pos % (rest.length + 1), list = rest.slice();
    list.splice(p, 0, right);
    return { id, ask, choices: list, ans: p, ...extra };
  };
  /* a pool of candidate values becomes up to 4 distinct choices (the right one always kept) */
  const pool = (right, cands) => {
    const seen = new Set([right.v]), out = [{ t: right.t, why: right.why, right: true }];
    for (const c of cands) { if (out.length >= 4) break; if (seen.has(c.v)) continue; seen.add(c.v); out.push({ t: c.t, why: c.why }); }
    return out;
  };

  /* ---------- canvas helpers ---------- */
  const FONT = '"Hanken Grotesk","Helvetica Neue",Arial,sans-serif';
  const T = (c, s, x, y, o = {}) => {
    c.font = `${o.weight || 500} ${o.size || 14}px ${FONT}`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
    c.fillStyle = o.color; c.fillText(s, x, y);
  };
  const rr = (c, x, y, w, hh, r) => {
    r = Math.min(r, w / 2, hh / 2); c.beginPath(); c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + hh, r); c.arcTo(x + w, y + hh, x, y + hh, r); c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };

  /* geometry of one matrix at a given cell size */
  const geoOf = (c, o, cw, ch, showRow) => {
    const fl = clamp(cw * .2, 10.5, 14);
    c.font = `500 ${fl}px ${FONT}`;
    let colLab = o.colLab || null;
    if (colLab && o.colShort && Math.max(...colLab.map(s => c.measureText(s).width)) > cw - 4) colLab = o.colShort;
    const rowLab = showRow && o.rowLab ? o.rowLab : null;
    const lw = rowLab ? Math.ceil(Math.max(...rowLab.map(s => c.measureText(s).width))) + 10 : 0;
    const tH = o.title ? 24 : 0, cH = colLab ? 20 : 0;
    return { fl, colLab, rowLab, lw, tH, above: tH + cH, w: lw + 28 + o.cols * cw, h: tH + cH + o.rows * ch };
  };

  /* draw a matrix: bracket, cells, optional row and column bands, labels. gx, gy = top-left of the grid of cells */
  const drawMat = (c, pal, o, g, gx, gy, cw, ch) => {
    const rows = o.rows, cols = o.cols, fs = clamp(cw * .36, 13, 27);
    const top = gy - g.above;
    if (o.title) T(c, o.title, gx + cols * cw / 2, top + 8, { size: 12.5, color: o.titleColor || pal.muted, weight: 600 });
    const rh = o.rowHi || {}, chh = o.colHi || {};
    if (g.colLab) g.colLab.forEach((s, j) => T(c, s, gx + j * cw + cw / 2, gy - 10, { size: g.fl, color: chh[j] ? pal[chh[j][0]] : pal.muted, weight: chh[j] ? 700 : 500 }));
    if (g.rowLab) g.rowLab.forEach((s, i) => T(c, s, gx - 16, gy + i * ch + ch / 2, { size: g.fl, color: rh[i] ? pal[rh[i][0]] : pal.muted, weight: rh[i] ? 700 : 500, align: 'right' }));
    for (const i in rh) { const [k, a] = rh[i]; rr(c, gx + 1, gy + i * ch + 1, cols * cw - 2, ch - 2, 9); c.fillStyle = alpha(pal[k], .17 * (a || 1)); c.fill(); c.strokeStyle = alpha(pal[k], .85 * (a || 1)); c.lineWidth = 1.6; c.stroke(); }
    for (const j in chh) { const [k, a] = chh[j]; rr(c, gx + j * cw + 1, gy + 1, cw - 2, rows * ch - 2, 9); c.fillStyle = alpha(pal[k], .17 * (a || 1)); c.fill(); c.strokeStyle = alpha(pal[k], .85 * (a || 1)); c.lineWidth = 1.6; c.stroke(); }
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
      const s = (o.cell && o.cell(i, j)) || {}, cx = gx + j * cw + cw / 2, cy = gy + i * ch + ch / 2, sc = s.scale || 1;
      const w = (cw - 9) * sc, hh = (ch - 9) * sc;
      rr(c, cx - w / 2, cy - hh / 2, w, hh, 7);
      if (s.fill) { c.fillStyle = pal.stage; c.fill(); }
      c.fillStyle = s.fill || alpha(pal.text, .05); c.fill();
      if (s.stroke) { c.strokeStyle = s.stroke; c.lineWidth = s.sw || 2.2; c.stroke(); }
      const v = o.val(i, j);
      if (v === null || v === undefined) T(c, '?', cx, cy + .5, { size: fs, color: alpha(pal.text, .35), weight: 500 });
      else T(c, v, cx, cy + .5, { size: fs * sc, color: s.color || pal.text, weight: s.bold ? 700 : 500 });
    }
    /* the brackets */
    const sl = clamp(cw * .13, 6, 10), x0 = gx - 6, x1 = gx + cols * cw + 6, y0 = gy + 1, y1 = gy + rows * ch - 1;
    c.strokeStyle = alpha(pal.blue, .95); c.lineWidth = 2.6; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(x0 + sl, y0); c.lineTo(x0, y0); c.lineTo(x0, y1); c.lineTo(x0 + sl, y1); c.stroke();
    c.beginPath(); c.moveTo(x1 - sl, y0); c.lineTo(x1, y0); c.lineTo(x1, y1); c.lineTo(x1 - sl, y1); c.stroke();
  };

  /* lay out a row (or rows) of matrices and operators. items: {t:'m', id, o} | {t:'op', s, big, color} | {t:'br', lv}
     Tries one line first, then breaks at level 1, then at every break, and keeps the largest readable cell size. */
  const planFlow = (c, items, W, H, stripH, opt) => {
    const attempt = (cw, mode) => {
      const ch = clamp(Math.round(cw * .72), 26, 58), opF = clamp(cw * .5, 20, 34), lines = [[]];
      for (const it of items) { if (it.t === 'br') { if (mode >= it.lv) lines.push([]); continue; } lines[lines.length - 1].push(it); }
      let totalH = 0, maxW = 0;
      const L = lines.filter(l => l.length).map(l => {
        let w = 0, above = 0, rowsH = 0, seen = 0;
        const its = l.map(it => {
          if (it.t === 'op') {
            const f = it.big ? opF * 1.25 : opF; c.font = `${it.big ? 700 : 500} ${f}px ${FONT}`;
            const iw = Math.ceil(c.measureText(it.s).width) + (it.big ? 20 : 26); w += iw; return { it, w: iw, f };
          }
          const g = geoOf(c, it.o, cw, ch, seen++ === 0); w += g.w; above = Math.max(above, g.above); rowsH = Math.max(rowsH, it.o.rows * ch); return { it, g, w: g.w };
        });
        totalH += above + rowsH; maxW = Math.max(maxW, w); return { its, w, above, rowsH };
      });
      totalH += (L.length - 1) * 30 + (stripH ? stripH + 22 : 0);
      return { cw, ch, opF, L, totalH, maxW, mode, fits: maxW <= W - 14 && totalH <= H - 10 };
    };
    const modes = opt.noWrap ? [0] : [0, 1, 2], best = [];
    for (const m of modes) {
      let found = null;
      for (let cw = opt.cwMax || 104; cw >= (opt.cwMin || 26); cw -= 2) { const a = attempt(cw, m); if (a.fits) { found = a; break; } }
      best.push(found);
    }
    let pick = null;
    for (const b of best) if (b && b.cw >= (opt.good || 52)) { pick = b; break; }
    if (!pick) for (const b of best) if (b && (!pick || b.cw > pick.cw + 2)) pick = b;
    return pick || attempt(opt.cwMin || 26, 0);
  };
  const drawPlan = (c, pal, plan, W, y0, placed) => {
    let y = y0;
    plan.L.forEach(ln => {
      let x = (W - ln.w) / 2; const cy = y + ln.above + ln.rowsH / 2;
      for (const e of ln.its) {
        if (e.it.t === 'op') {
          T(c, e.it.s, x + e.w / 2, cy + (e.it.big ? 1 : 0), { size: e.f, color: e.it.color ? pal[e.it.color] : pal.muted, weight: e.it.big ? 700 : 400 });
        } else {
          const o = e.it.o, gx = x + e.g.lw + 14, gy = cy - o.rows * plan.ch / 2;
          drawMat(c, pal, o, e.g, gx, gy, plan.cw, plan.ch);
          placed.push({ id: e.it.id, gx, gy, cw: plan.cw, ch: plan.ch, rows: o.rows, cols: o.cols });
        }
        x += e.w;
      }
      y += ln.above + ln.rowsH + 30;
    });
    return y - 30;
  };
  /* a line of coloured text pieces, centred; shrinks to fit */
  const drawSegs = (c, pal, parts, cx, y, fs, W) => {
    const meas = f => { let tw = 0; for (const p of parts) { c.font = `${p.w || 600} ${f}px ${FONT}`; p.m = c.measureText(p.s).width; tw += p.m; } return tw; };
    let f = fs, tw = meas(f);
    if (tw > W - 20) { f = Math.max(11, fs * (W - 20) / tw); tw = meas(f); }
    let x = cx - tw / 2; c.textAlign = 'left'; c.textBaseline = 'middle';
    for (const p of parts) {
      c.font = `${p.w || 600} ${f}px ${FONT}`; c.fillStyle = alpha(p.c ? (pal[p.c] || p.c) : pal.text, p.a === undefined ? 1 : p.a); c.fillText(p.s, x, y); x += p.m;
    }
  };

  /* ---------- the two kinds of products used by the lesson ---------- */
  const PROBS = {
    cost: { Q: QT, P: PR, qT: 'Boxes ordered', pT: 'Price ($)', rT: 'Cost ($)', qRow: STORES, qCol: ITEMS, pRow: ITEMS, pCol: SUP, rRow: STORES, rCol: SUP, short: ['Supp. X', 'Supp. Y'],
      qName: 'the orders matrix', pName: 'the prices matrix', targets: [[1, 1], [0, 0], [0, 1], [1, 0]], pick: true,
      what: (i, j) => `${STORES[i]} buying from ${SUP[j]}`, say: (i, j, v) => `${STORES[i]} pays $${v} to ${SUP[j]} for its whole order.` },
    rev: { Q: W1, P: PRICE, qT: 'Sold, week 1', pT: 'Price ($)', rT: 'Revenue ($)', qRow: STORES, qCol: ITEMS, pRow: ITEMS, pCol: ['Each'], rRow: STORES, rCol: ['Total'],
      qName: 'the sales matrix', pName: 'the price column', targets: [[0, 0], [1, 0]], pick: false,
      what: i => `${STORES[i]}'s revenue`, say: (i, j, v) => `${STORES[i]} took in $${v} in week 1.` },
    ab: { Q: MA, P: MB, qT: 'A', pT: 'B', rT: 'AB', qName: 'A', pName: 'B', targets: [[0, 0]], pick: true, all: true,
      what: (i, j) => `row ${i + 1}, column ${j + 1} of AB`, say: () => '' },
    ba: { Q: MB, P: MA, qT: 'B', pT: 'A', rT: 'BA', qName: 'B', pName: 'A', targets: [[0, 0]], pick: true, all: true,
      what: (i, j) => `row ${i + 1}, column ${j + 1} of BA`, say: () => '' }
  };
  PROBS.rev.after = [
    { q: 'Which store took in more money in week 1?', items: [{ t: 'Store A', why: 'Store A took in $80. Store B took in $110, which is larger.' }, { t: 'Store B', right: true, why: 'Store B took in $110 and Store A took in $80, so Store B took in $30 more. Reading down the result column, 110 is greater than 80.' }, { t: 'They took in the same amount', why: 'The entries are 80 and 110. They are not equal.' }] },
    { q: 'The prices form a 3 by 1 column. Could you also multiply the price column first, then the 2 by 3 sales matrix (price column times sales)?', items: [
      { t: 'Yes, and the result is 3 by 3', why: 'The outer numbers would give 3 by 3, but only if the inner numbers match. Here they are 1 and 2. They do not match, so the product does not exist.' },
      { t: 'Yes, and the result is 1 by 2', why: 'Look at the inner numbers first. They are 1 and 2, so the product does not exist and has no size.' },
      { t: 'No. The inner numbers are 1 and 2, which do not match', right: true, why: 'A 3 by 1 times a 2 by 3: the inner numbers are 1 and 2. A row of the first would have 1 entry and a column of the second would have 2 entries, so the pairs would not line up. Sales times prices works. Prices times sales does not exist. Order matters.' }] }
  ];
  PROBS.ba.after = [
    { q: 'Is AB equal to BA?', items: [
      { t: 'Yes. The order never matters', why: 'It does matter. The top left entry of AB is 7 and the top left entry of BA is 1.' },
      { t: 'Yes. Both are 2 by 2', why: 'Same size is not the same matrix. They also need the same entries, and 7 is not 1.' },
      { t: 'No. The matrices are different', right: true, why: 'AB has 7 in the top left and BA has 1. Matrix multiplication is not commutative: swapping the order usually changes the answer.' }] }
  ];

  /* sizes quiz: (m by n) times (n2 by p) */
  const DIMS = [[2, 3, 3, 2], [2, 3, 2, 3], [3, 2, 2, 4], [1, 3, 3, 1], [2, 2, 3, 2]];

  /* shapes: a 2 by 2 matrix moves the corners of a triangle */
  const SHM = [{ n: 'Stretch', M: [[2, 0], [0, 1]], d: 'doubles every x and keeps every y' },
    { n: 'Flip', M: [[1, 0], [0, -1]], d: 'keeps every x and flips every y to its opposite' },
    { n: 'Turn', M: [[0, -1], [1, 0]], d: 'turns the shape a quarter turn counterclockwise' },
    { n: 'Shear', M: [[1, 1], [0, 1]], d: 'slides each point right by its y' }];
  const VTX = [[1, 3, 1], [1, 1, 2]], VQ = 1;

  register({
    id: 'matrices', level: 'school',
    title: 'Matrices',
    blurb: 'Organize data in a rectangle of numbers, then add, subtract, scale and multiply it to answer questions about two school stores.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 2.2;
      const cw = 1.05, chh = .9, x0 = -1.5 * cw, y0 = -chh, rect = (i, j, k, a) => p.path([[x0 + j * cw + .06, y0 + (1 - i) * chh + .06], [x0 + (j + 1) * cw - .06, y0 + (1 - i) * chh + .06], [x0 + (j + 1) * cw - .06, y0 + (2 - i) * chh - .06], [x0 + j * cw + .06, y0 + (2 - i) * chh - .06]], { fill: alpha(k, a), close: true });
      for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) rect(i, j, pal.text, .07);
      for (let j = 0; j < 3; j++) rect(0, j, pal.green, .3);
      for (let i = 0; i < 2; i++) rect(i, 1, pal.red, .3);
      rect(0, 1, pal.yellow, .85);
      const bx = 1.5 * cw + .1, by = chh + .06;
      p.path([[x0 - .1 + .22, by], [x0 - .1, by], [x0 - .1, -by], [x0 - .1 + .22, -by]], { stroke: pal.blue, width: 3 });
      p.path([[bx - .22, by], [bx, by], [bx, -by], [bx - .22, -by]], { stroke: pal.blue, width: 3 });
    },
    hook: String.raw`Two school stores sell pencils, notebooks and erasers. How can one rectangle of numbers hold all their sales, and how can you use it to find how much money each store took in?`,
    steps: [
      { title: 'A matrix organizes data',
        text: String.raw`<p>A <b>matrix</b> is a rectangle of numbers in brackets. Here every <b>row</b> is a store and every <b>column</b> is an item. Each number is an <b>entry</b>.</p><p>Start with the first question: tap the entry for Store B and notebooks. Then read what an entry means, say how big the matrix is, and build one yourself from a description. Use the tabs to move between the four questions.</p>`,
        set: { mode: 'data' } },
      { title: 'Add, subtract and scale',
        text: String.raw`<p>These are two weeks of sales. To add them, add the two entries in the <b>same position</b>. The two entries you need are highlighted in blue, and the result cell is yellow. Pick the value for each cell. The first cell is Store A and pencils: \(10 + 12\).</p><p>Then use the tabs: subtract to find the change, double every entry, take a 20 percent increase, and see why a 2 by 3 matrix and a 2 by 2 matrix cannot be added.</p>`,
        set: { mode: 'addsub', op: 'add' } },
      { title: 'Multiply: rows times columns',
        text: String.raw`<p>The orders matrix says how many boxes of each item a store buys. The prices matrix gives the price per box at two suppliers. Their product gives the cost.</p><p>To find one entry, use a <b style="color:var(--green)">row</b> of the first matrix and a <b style="color:var(--red)">column</b> of the second. The yellow cell is Store B and Supplier Y. Tap the row and the column that make it, then pick the line that works out the entry. The pairs light up one at a time. The Sizes tab tells you when a product exists.</p>`,
        set: { mode: 'mult', tab: 'prod' } },
      { title: 'Use it, and mind the order',
        text: String.raw`<p>Multiply the sales matrix by the price column to get each store's revenue, then answer which is larger. On the Order tab, compute one entry of \(AB\) and of \(BA\). They are not the same. On the Shapes tab, the same row-times-column rule moves the corners of a triangle.</p>`,
        set: { mode: 'order', tab: 'rev' } }
    ],
    formal: String.raw`
      <h3>Matrices, entries and dimensions</h3>
      <p>A <b>matrix</b> is a rectangular array of numbers. The numbers are its <b>entries</b>. A matrix with \(m\) rows and \(n\) columns has dimensions \(m \times n\), read "m by n", and the number of rows always comes first. The sales table
      \[ S = \begin{pmatrix} 10 & 20 & 5 \\ 15 & 25 & 10 \end{pmatrix} \]
      is \(2\times 3\). The entry in row \(i\) and column \(j\) is written \(s_{ij}\). Here \(s_{21}=15\) is the number of pencils sold by Store B: row 2 is Store B and column 1 is pencils. A matrix has to be read in context: the rows and columns stand for something.</p>
      <h3>Adding and subtracting</h3>
      <p>Two matrices can be added or subtracted only when they have the <b>same dimensions</b>. The operation is done entry by entry, in matching positions:
      \[ \begin{pmatrix} 10 & 20 & 5 \\ 15 & 25 & 10 \end{pmatrix} + \begin{pmatrix} 12 & 18 & 10 \\ 10 & 30 & 5 \end{pmatrix} = \begin{pmatrix} 22 & 38 & 15 \\ 25 & 55 & 15 \end{pmatrix}. \]
      A \(2\times 3\) matrix and a \(2\times 2\) matrix cannot be added, because the third column of the first has no partner. Subtraction works the same way, and the order matters: \(12-10=2\) but \(10-12=-2\). A negative entry in a change matrix means the quantity went down.</p>
      <h3>Scalar multiplication</h3>
      <p>A <b>scalar</b> is a single number. To multiply a matrix by a scalar, multiply <b>every</b> entry by it:
      \[ 1.2\begin{pmatrix} 10 & 20 \\ 15 & 25 \end{pmatrix} = \begin{pmatrix} 12 & 24 \\ 18 & 30 \end{pmatrix}. \]
      A 20 percent increase multiplies by \(1.2\), and doubling multiplies by \(2\). Adding the scalar to each entry is a different operation and gives a different matrix.</p>
      <h3>Multiplying matrices</h3>
      <p>Let \(A\) be \(m\times n\) and \(B\) be \(n\times p\). The product \(AB\) exists when the <b>inner</b> numbers match (the number of columns of \(A\) equals the number of rows of \(B\)), and it has the <b>outer</b> size \(m\times p\). The entry in row \(i\) and column \(j\) of \(AB\) comes from row \(i\) of \(A\) and column \(j\) of \(B\): multiply the pairs in order, then add.
      \[ (AB)_{ij} = a_{i1}b_{1j} + a_{i2}b_{2j} + \cdots + a_{in}b_{nj}. \]
      <em>Worked example.</em> Boxes ordered (rows are Store A and Store B) times price per box (columns are Supplier X and Supplier Y):
      \[ \begin{pmatrix} 3 & 2 & 4 \\ 2 & 4 & 1 \end{pmatrix}\begin{pmatrix} 2 & 1 \\ 3 & 4 \\ 1 & 2 \end{pmatrix} = \begin{pmatrix} 3\cdot2+2\cdot3+4\cdot1 & 3\cdot1+2\cdot4+4\cdot2 \\ 2\cdot2+4\cdot3+1\cdot1 & 2\cdot1+4\cdot4+1\cdot2 \end{pmatrix} = \begin{pmatrix} 16 & 19 \\ 17 & 20 \end{pmatrix}. \]
      A \(2\times 3\) times a \(3\times 2\) is \(2\times 2\). The entry \(20\) is Store B at Supplier Y: row 2 of the first matrix \((2,4,1)\) paired with column 2 of the second \((1,4,2)\). The common mistakes are pairing the wrong entries, adding all six numbers, and adding the row and the column first and then multiplying once.</p>
      <h3>The identity matrix</h3>
      <p>The \(2\times 2\) identity matrix has \(1\) on the diagonal and \(0\) elsewhere:
      \[ I = \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}, \qquad AI = IA = A \text{ for every } 2\times 2 \text{ matrix } A. \]
      It plays the role of the number \(1\) in multiplication.</p>
      <h3>Order matters</h3>
      <p>Matrix multiplication is <b>not commutative</b>: \(AB\) and \(BA\) are usually different. Take \(A=\begin{pmatrix}1&2\\0&1\end{pmatrix}\) and \(B=\begin{pmatrix}1&0\\3&1\end{pmatrix}\). Then
      \[ AB = \begin{pmatrix} 7 & 2 \\ 3 & 1 \end{pmatrix}, \qquad BA = \begin{pmatrix} 1 & 2 \\ 3 & 7 \end{pmatrix}. \]
      Sometimes one product exists and the other does not: a \(2\times 3\) times a \(3\times 1\) is \(2\times 1\), but the \(3\times 1\) times the \(2\times 3\) has inner numbers \(1\) and \(2\), so it does not exist. Multiplication is still <em>associative</em>, \((AB)C = A(BC)\), and it distributes over addition.</p>
      <h3>A matrix moves points</h3>
      <p>A point \((x,y)\) written as a column, multiplied on the left by a \(2\times 2\) matrix, gives a new point. For \(M=\begin{pmatrix}0&-1\\1&0\end{pmatrix}\) and the point \((3,1)\):
      \[ \begin{pmatrix} 0 & -1 \\ 1 & 0 \end{pmatrix}\begin{pmatrix} 3 \\ 1 \end{pmatrix} = \begin{pmatrix} 0\cdot3+(-1)\cdot1 \\ 1\cdot3+0\cdot1 \end{pmatrix} = \begin{pmatrix} -1 \\ 3 \end{pmatrix}. \]
      This matrix turns every point a quarter turn about the origin. Put several points side by side as columns, and one product moves them all.</p>`,
    check: [
      { q: 'Matrix A has 3 rows and 2 columns. Matrix B has 2 rows and 4 columns. Which statement about the product AB is true?',
        choices: ['AB does not exist, because A and B are different sizes', 'AB exists and has 3 rows and 2 columns', 'AB exists and has 3 rows and 4 columns', 'AB exists and has 2 rows and 2 columns'], answer: 2,
        why: String.raw`The dimensions are \(3\times 2\) and \(2\times 4\). The inner numbers are both \(2\), so the product exists. The outer numbers give its size: \(3\times 4\). A product does not need the two matrices to be the same size (that is the rule for adding). The size \(3\times 2\) is just the size of \(A\), and \(2\times 2\) uses the inner numbers instead of the outer ones.`,
        hint: String.raw`Write the sizes side by side as \((3\times 2)(2\times 4)\). Compare the two middle numbers. If they match, the two outer numbers are the size.` },
      { q: 'A store sold 4 pencils, 6 notebooks and 2 erasers. The prices are $1 for a pencil, $3 for a notebook and $2 for an eraser. The sold numbers are a 1 by 3 matrix (4, 6, 2) and the prices are a 3 by 1 matrix (1, 3, 2). What is the one entry of the product, the total revenue?',
        choices: ['$12', '$26', '$28', '$72'], answer: 1,
        why: String.raw`Pair the entries in order and add: \(4\cdot 1 + 6\cdot 3 + 2\cdot 2 = 4+18+4 = 26\). The answer \(12\) adds the three sold numbers and ignores the prices. The answer \(28\) pairs them in reverse order (\(4\cdot2+6\cdot3+2\cdot1\)). The answer \(72\) adds first (\(12\) items, \(\$6\) in prices) and multiplies once, which is not what a row times a column does.`,
        hint: String.raw`Each item has its own price. Multiply 4 by the pencil price, 6 by the notebook price and 2 by the eraser price, then add the three amounts.` }
    ],
    links: { next: ['determinants-and-inverse-matrices'], related: ['systems-of-equations', 'solving-systems-with-matrices', 'solving-equations-with-a-balance', 'linear-transformations', 'scatter-plots-and-lines-of-fit'] },

    mount({ stage, controls: C }) {
      const P = new Plane(stage, { span: 5 }), cv = P.canvas;
      if (P.coordEl) P.coordEl.style.display = 'none';
      cv.tabIndex = 0; cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', 'Matrices drawn as bracketed grids. Tap a cell, a row or a column on the canvas, or answer in the panel beside it. The panel reads out each number and explains each answer.');

      /* ---------- state ---------- */
      const st = {
        mode: 'data', hov: null, placed: [], pops: {}, need: false, fb: '', qs: {}, lastQ: '',
        d: { task: 0, sel: null, done: [false, false, false, false], b: zeros(2, 3), bs: [0, 0], chk: null },
        a: { op: 'add', fill: {}, sel: {}, szq: 0, szDone: [false, false], szAns: [false, false] },
        m: { tab: 'prod', mps: {}, dq: 0, dDone: DIMS.map(() => false) },
        o: { tab: 'rev', stage: 0, shm: 2, shDone: SHM.map(() => false), sht: 0 }
      };
      let cancel = () => {};
      const draw = () => P.requestDraw();
      const popv = key => {
        if (reduceMotion || st.pops[key] === undefined) return 0;
        const t = (performance.now() - st.pops[key]) / 520;
        if (t >= 1) return 0; st.need = true; return Math.sin(Math.PI * t);
      };
      const pop = key => { st.pops[key] = performance.now(); draw(); };
      const setFb = html => { st.fb = html; };

      /* ---------- panel ---------- */
      const askEl = C.readout(), host = askEl.parentNode;
      const root = h('div', { style: 'display:flex;flex-direction:column;gap:14px' });
      const tabsBox = h('div', { style: 'display:flex;flex-wrap:wrap;gap:6px' });
      const choiceBox = h('div', { style: 'display:flex;flex-direction:column;gap:8px' });
      const fb = h('div', { class: 'ctl readout', 'aria-live': 'polite', style: 'border-top:0;padding-top:0' });
      const btnBox = h('div', { class: 'ctl buttons' });
      const buildBox = h('div', { style: 'display:flex;flex-direction:column;gap:8px' });
      askEl.style.borderTop = '0'; askEl.style.paddingTop = '0';
      host.append(root); root.append(tabsBox, askEl, choiceBox, fb, buildBox, btnBox);
      let valS;
      valS = C.slider({ label: 'Dial', min: 0, max: 40, step: 1, value: 0, format: v => String(v), onInput: v => setBuild(v) });
      const sliderEl = host.lastElementChild; sliderEl.remove();
      const nudge = (lab, d) => h('button', { type: 'button', class: 'btn', style: 'min-height:36px;padding:6px 16px', onclick: () => setBuild(clamp(st.d.b[st.d.bs[0]][st.d.bs[1]] + d, 0, 40), true) }, lab);
      buildBox.append(h('p', { class: 'ctl-title', style: 'margin:0' }, 'Set the selected cell'), sliderEl, h('div', { class: 'ctl buttons' }, nudge('−1', -1), nudge('+1', 1), nudge('−5', -5), nudge('+5', 5)));

      const chip = (label, on, done, fn) => h('button', { type: 'button', class: on ? 'btn primary' : 'btn', style: 'min-height:34px;padding:5px 13px;font-size:.84rem', onclick: fn }, label + (done ? ' ✓' : ''));

      /* ---------- the question machinery ---------- */
      const curQ = () => M[st.mode].q();
      const pick = idx => {
        const q = curQ(); if (!q || !q.choices) return;
        const S = st.qs[q.id] || (st.qs[q.id] = { wrong: [], solved: false });
        if (S.solved || S.wrong.includes(idx)) return;
        const ch = q.choices[idx];
        if (idx === q.ans) { S.solved = true; setFb(ok('Yes. ') + ch.why); if (q.onRight) q.onRight(); }
        else { S.wrong.push(idx); setFb(no('Not quite. ') + ch.why + ' Try another choice.'); }
        refresh();
      };
      const refresh = () => {
        const m = M[st.mode], q = m.q();
        tabsBox.innerHTML = ''; m.tabs().forEach(t => tabsBox.append(chip(t.label, t.on, t.done, () => { m.go(t.id); })));
        askEl.innerHTML = q ? q.ask : '';
        choiceBox.innerHTML = '';
        if (q && q.choices) {
          const S = st.qs[q.id] || { wrong: [], solved: false };
          q.choices.forEach((ch, i) => {
            const solved = S.solved && i === q.ans, bad = S.wrong.includes(i);
            const b = h('button', { type: 'button', class: 'btn', style: `justify-content:flex-start;text-align:left;border-radius:10px;padding:10px 14px;width:100%;min-height:44px;line-height:1.35;white-space:normal;${solved ? 'border-color:var(--green);color:var(--text);' : ''}${bad ? 'border-color:var(--red);color:var(--muted);' : ''}${S.solved && !solved ? 'opacity:.55;pointer-events:none;' : ''}` },
              solved ? '✓  ' + ch.t : bad ? '✗  ' + ch.t : ch.t);
            b.addEventListener('click', () => pick(i)); choiceBox.append(b);
          });
        }
        fb.innerHTML = st.fb;
        btnBox.innerHTML = '';
        m.btns().forEach(b => { const e = h('button', { type: 'button', class: b.primary ? 'btn primary' : 'btn', onclick: b.fn }, b.label); btnBox.append(e); });
        buildBox.style.display = st.mode === 'data' && st.d.task === 3 && !st.d.done[3] ? '' : 'none';
        draw();
      };
      const go = fn => (...a) => { cancel(); fn(...a); refresh(); };

      /* ---------- shared drawing pieces ---------- */
      const hv = (id, i, j) => st.hov && st.hov.id === id && st.hov.i === i && st.hov.j === j;
      const base = (pal, id, i, j) => (hv(id, i, j) ? { stroke: pal.brass, sw: 2 } : {});
      const hiSel = (pal, extra) => ({ fill: alpha(pal.yellow, .36), stroke: pal.yellow, sw: 2.6, bold: true, ...extra });
      const hiSrc = pal => ({ fill: alpha(pal.blue, .26), stroke: pal.blue, sw: 2.4, bold: true });
      const cellRect = (id, i, j) => { const m = st.placed.find(p => p.id === id); return m ? { x: m.gx + j * m.cw, y: m.gy + i * m.ch, w: m.cw, h: m.ch } : null; };
      const badge = (c, pal, id, i, j, n, sc) => {
        const r = cellRect(id, i, j); if (!r) return;
        const x = r.x + r.w - 7, y = r.y + 7, rad = 9.5 * sc;
        c.beginPath(); c.arc(x, y, rad, 0, TAU); c.fillStyle = pal.yellow; c.fill(); c.lineWidth = 1.5; c.strokeStyle = pal.stage; c.stroke();
        T(c, String(n), x, y + .5, { size: 11.5 * sc, color: '#1b1b1b', weight: 800 });
      };
      const rowBand = (i, k, a) => ({ [i]: [k, a || 1] });

      /* ============================================================
         MODE 1: A MATRIX AS DATA
         ============================================================ */
      const D = st.d;
      const dTabs = [['0', 'Read'], ['1', 'Meaning'], ['2', 'Size'], ['3', 'Build']];
      const dataScene = pal => {
        const t = D.task, build = t === 3;
        let rowHi = {}, colHi = {}, sel = null;
        if (t === 0 && D.sel) sel = D.sel;
        if (t === 1) sel = [1, 0];
        if (sel) { rowHi = rowBand(sel[0], 'green'); colHi = { [sel[1]]: ['red', 1] }; }
        if (t === 2 && D.done[2]) { rowHi = { 0: ['green', .6], 1: ['green', .6] }; colHi = { 0: ['red', .6], 1: ['red', .6], 2: ['red', .6] }; }
        const o = {
          rows: 2, cols: 3, rowLab: STORES, colLab: ITEMS, colShort: SHORT, title: build ? 'Week 2 sales' : 'Week 1 sales', rowHi, colHi,
          val: (i, j) => String(build ? D.b[i][j] : W1[i][j]),
          cell: (i, j) => {
            const s = base(pal, 'S', i, j);
            if (sel && sel[0] === i && sel[1] === j) return hiSel(pal);
            if (build) {
              const bs = D.bs[0] === i && D.bs[1] === j;
              const r = { ...s };
              if (D.chk) { r.stroke = D.chk[i][j] ? pal.green : pal.red; r.sw = 2.4; r.fill = alpha(D.chk[i][j] ? pal.green : pal.red, .14); }
              else if (bs) { r.stroke = pal.brass; r.sw = 3; r.fill = alpha(pal.brass, .14); }
              if (!D.done[3] && D.b[i][j] === 0) r.color = alpha(pal.text, .35);
              return r;
            }
            return s;
          }
        };
        const strip = [];
        if (t === 0 || t === 1) {
          const s = t === 1 ? [1, 0] : D.sel;
          if (s) strip.push([{ s: 'row ' + (s[0] + 1), c: 'green' }, { s: ',  ', w: 400, c: 'muted' }, { s: 'column ' + (s[1] + 1), c: 'red' }, { s: '  →  ', w: 400, c: 'muted' }, { s: String(W1[s[0]][s[1]]), c: 'yellow', w: 800 }]);
          else strip.push([{ s: 'Tap a cell to read it', c: 'muted', w: 500 }]);
        }
        if (t === 2) strip.push(D.done[2] ? [{ s: '2 rows', c: 'green' }, { s: '  ×  ', w: 400, c: 'muted' }, { s: '3 columns', c: 'red' }, { s: '   =   2 by 3', w: 600 }] : [{ s: 'Rows come first, then columns', c: 'muted', w: 500 }]);
        if (t === 3) strip.push([{ s: `Selected: ${nm(D.bs[0], D.bs[1])}`, c: 'muted', w: 500 }]);
        return { items: [{ t: 'm', id: 'S', o }], strip, good: 40 };
      };
      const dataQ = () => {
        const t = D.task;
        if (t === 0) return { id: 'd0', ask: `${kk('Question 1 of 4')}<br>Tap the entry that shows how many <b>notebooks</b> <b>Store B</b> sold in week 1. You can tap any cell to read it.` };
        if (t === 1) return mkQ('d1', `${kk('Question 2 of 4')}<br>The highlighted entry is in <b style="color:var(--green)">row 2</b> and <b style="color:var(--red)">column 1</b>. It is 15. What does it tell you?`, [
          { t: 'Store B sold 15 pencils', right: true, why: 'Row 2 is Store B and column 1 is pencils. The first number names the row and the second names the column.' },
          { t: 'Store A sold 15 pencils', why: 'Row 1 is Store A. This entry is in row 2, which is Store B.' },
          { t: 'Store B sold 15 notebooks', why: 'Column 2 is notebooks. This entry is in column 1, which is pencils.' },
          { t: 'Store A sold 20 notebooks', why: 'That is the entry in row 1, column 2. It reads "row 2, column 1" with the numbers in the wrong order. Read the row first, then the column.' }], 0, { onRight: () => { D.done[1] = true; } });
        if (t === 2) return mkQ('d2', `${kk('Question 3 of 4')}<br>A matrix with m rows and n columns has dimensions <b>m by n</b>, rows first. What are the dimensions of the sales matrix?`, [
          { t: '2 by 3', right: true, why: 'There are 2 rows (the two stores) and 3 columns (the three items). Rows first: 2 by 3. It has 2 × 3 = 6 entries.' },
          { t: '3 by 2', why: 'That counts the columns first. Dimensions always list the rows first. This matrix has 2 rows and 3 columns, so it is 2 by 3. A 3 by 2 matrix would have 3 stores and 2 items.' },
          { t: '6', why: 'There are 6 entries, but the dimensions are two numbers: the number of rows and the number of columns.' },
          { t: '5', why: 'You added 2 and 3. The dimensions are written "rows by columns", not added.' }], 2, { onRight: () => { D.done[2] = true; pop('dim'); } });
        const ask = `${kk('Question 4 of 4')}<br><b>Build the matrix</b> for week 2. Store A sold ${W2[0][0]} pencils, ${W2[0][1]} notebooks and ${W2[0][2]} erasers. Store B sold ${W2[1][0]} pencils, ${W2[1][1]} notebooks and ${W2[1][2]} erasers. Tap a cell, set its value with the dial, then check.`;
        return { id: 'd3', ask: D.done[3] ? `${kk('Question 4 of 4')}<br>You built a 2 by 3 matrix of week 2 sales.` : ask };
      };
      const setBuild = (v, fromBtn) => {
        const [i, j] = D.bs; D.b[i][j] = v; D.chk = null; setFb('');
        if (fromBtn) valS.set(v);
        refresh();
      };
      const selBuild = (i, j) => { D.bs = [i, j]; D.chk = null; valS.set(D.b[i][j]); refresh(); };
      const checkBuild = () => {
        const wrong = [], chk = D.b.map((r, i) => r.map((v, j) => { const g = v === W2[i][j]; if (!g) wrong.push([i, j]); return g; }));
        D.chk = chk;
        if (!wrong.length) { D.done[3] = true; setFb(`${ok('Yes.')} Row 1 is Store A (${W2[0].join(', ')}) and row 2 is Store B (${W2[1].join(', ')}). The columns are pencils, notebooks, erasers. This matrix is 2 by 3, the same size as the week 1 matrix, so the two can be added.`); refresh(); return; }
        const flat = [...W2[0], ...W2[1]], colMajor = [[flat[0], flat[2], flat[4]], [flat[1], flat[3], flat[5]]];
        let msg;
        if (same(D.b, colMajor)) msg = 'It looks like you filled the numbers down the columns. Each <b>row</b> is one store, so Store A\'s three numbers go <b>across</b> row 1, and Store B\'s go across row 2.';
        else if (same(D.b, [W2[1], W2[0]])) msg = 'The rows are swapped. Row 1 is Store A and row 2 is Store B.';
        else {
          msg = wrong.slice(0, 3).map(([i, j]) => `${STORES[i]}, ${IT[j]} (row ${i + 1}, column ${j + 1}) should be ${W2[i][j]}${D.b[i][j] === 0 ? ', and it is still 0' : `, not ${D.b[i][j]}`}.`).join(' ');
          if (wrong.length > 3) msg += ` ${wrong.length - 3} more cell${wrong.length === 4 ? '' : 's'} to fix.`;
        }
        setFb(`${no('Not yet.')} ${wrong.length} of 6 cells ${wrong.length === 1 ? 'is' : 'are'} wrong (red). ${msg}`);
        refresh();
      };
      const dataTap = (id, i, j) => {
        const t = D.task;
        if (t === 0) {
          D.sel = [i, j]; const v = W1[i][j], right = i === 1 && j === 1;
          const read = `Row ${i + 1} is ${STORES[i]} and column ${j + 1} is ${IT[j]}. This entry, ${v}, is the number of ${IT[j]} sold by ${STORES[i]}.`;
          if (right) { D.done[0] = true; setFb(`${ok('Yes.')} ${read}`); }
          else {
            let why;
            if (j === 1) why = `You found the right item but the wrong store. Row ${i + 1} is ${STORES[i]}. Store B is row 2.`;
            else if (i === 1) why = `You found the right store but the wrong item. Column ${j + 1} is ${IT[j]}. Notebooks are column 2.`;
            else why = 'Both the store and the item are different. Store B is row 2 and notebooks are column 2.';
            setFb(`${no('Not that one.')} ${read} ${why}`);
          }
          refresh();
        } else if (t === 3 && !D.done[3]) selBuild(i, j);
      };
      const dataBtns = () => {
        const t = D.task, out = [];
        if (t === 3 && !D.done[3]) out.push({ label: 'Check my matrix', primary: true, fn: checkBuild });
        if (D.done[t] && t < 3) out.push({ label: 'Next question', primary: true, fn: go(() => { D.task = t + 1; setFb(''); }) });
        if (t === 3 && D.done[3]) out.push({ label: 'Start over', fn: go(() => { D.task = 0; D.sel = null; D.done = [false, false, false, false]; D.b = zeros(2, 3); D.chk = null; D.bs = [0, 0]; valS.set(0); st.qs = {}; setFb(''); }) });
        return out;
      };

      /* ============================================================
         MODE 2: ADD, SUBTRACT, SCALE
         ============================================================ */
      const A_ = st.a;
      const CFG = {
        add: { bin: true, A: W1, B: W2, f: (a, b) => a + b, sym: '+', tA: 'Week 1', tB: 'Week 2', tR: 'Total', label: 'Add' },
        sub: { bin: true, A: W2, B: W1, f: (a, b) => a - b, sym: MINUS, tA: 'Week 2', tB: 'Week 1', tR: 'Change', label: 'Subtract' },
        dbl: { k: 2, A: W1, tA: 'Week 1', tR: 'Double', label: 'Double' },
        inc: { k: 1.2, A: W1, tA: 'Week 1', tR: '20% more', label: '+20%' }
      };
      const SZ = [{ A: W1, B: [[1, 2], [3, 4]], tB: 'Extra (2 by 2)', q: 'Week 1 sales is a 2 by 3 matrix. An extra matrix is 2 by 2. Can you add them?' },
        { A: W1, B: PR, tB: 'Prices (3 by 2)', q: 'Week 1 sales is a 2 by 3 matrix. The prices matrix is 3 by 2. Both have 6 entries. Can you add them?' }];
      const resOf = (op, i, j) => { const c = CFG[op]; return c.bin ? c.f(c.A[i][j], c.B[i][j]) : Math.round(c.A[i][j] * c.k * 100) / 100; };
      const fillOf = op => A_.fill[op] || (A_.fill[op] = nulls(2, 3));
      const nextEmpty = op => { const F = fillOf(op); for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) if (F[i][j] === null) return [i, j]; return null; };
      const aDone = op => op === 'sz' ? A_.szAns.every(Boolean) : !nextEmpty(op);
      const ensureSel = op => { if (A_.sel[op] === undefined) A_.sel[op] = nextEmpty(op); };
      const addScene = pal => {
        const op = A_.op;
        if (op === 'sz') {
          const S = SZ[A_.szq], ans = A_.szAns[A_.szq], ra = 2, rb = S.B.length, cb = S.B[0].length;
          const matched = (i, j) => i < Math.min(ra, rb) && j < Math.min(3, cb);
          const mk = (arr, other, tt) => ({
            rows: arr.length, cols: arr[0].length, title: tt, val: (i, j) => String(arr[i][j]), colLab: arr === W1 ? ITEMS : undefined, colShort: SHORT,
            cell: (i, j) => ans ? (matched(i, j) ? { fill: alpha(pal.blue, .2), stroke: pal.blue, sw: 2 } : { fill: alpha(pal.red, .2), stroke: pal.red, sw: 2.4 }) : {}
          });
          const strip = [[{ s: `${ra} by 3`, c: 'blue' }, { s: '   and   ', w: 400, c: 'muted' }, { s: `${rb} by ${cb}`, c: 'blue' }, ...(ans ? [{ s: ans ? '   are different sizes' : '', w: 500, c: 'red' }] : [])]];
          return { items: [{ t: 'm', id: 'X', o: mk(S.A, S.B, 'Week 1 (2 by 3)') }, { t: 'br', lv: 2 }, { t: 'op', s: '+' }, { t: 'm', id: 'Y', o: mk(S.B, S.A, S.tB) }, { t: 'br', lv: 1 }, { t: 'op', s: '=' }, { t: 'op', s: ans ? 'no answer' : '?', big: true, color: ans ? 'red' : 'yellow' }], strip, good: 46 };
        }
        const cfg = CFG[op], F = fillOf(op), sel = A_.sel[op];
        const cell = (kind) => (i, j) => {
          const s = base(pal, kind, i, j), on = sel && sel[0] === i && sel[1] === j;
          if (kind === 'R') {
            const pv = popv('r' + op + i + j);
            if (on) return hiSel(pal, { scale: 1 + .12 * pv });
            if (F[i][j] !== null) return { fill: alpha(pal.yellow, .16), scale: 1 + .12 * pv };
            return s;
          }
          if (on) return hiSrc(pal);
          if (!cfg.bin) return { fill: alpha(pal.blue, .1) };
          return s;
        };
        const mk = (arr, id, tt) => ({ rows: 2, cols: 3, rowLab: STORES, colLab: ITEMS, colShort: SHORT, title: tt, val: (i, j) => nf(arr[i][j]), cell: cell(id) });
        const R = { rows: 2, cols: 3, rowLab: STORES, colLab: ITEMS, colShort: SHORT, title: cfg.tR, titleColor: pal.yellow, val: (i, j) => (F[i][j] === null ? null : nf(F[i][j])), cell: cell('R') };
        const items = cfg.bin
          ? [{ t: 'm', id: 'A', o: mk(cfg.A, 'A', cfg.tA) }, { t: 'br', lv: 2 }, { t: 'op', s: cfg.sym }, { t: 'm', id: 'B', o: mk(cfg.B, 'B', cfg.tB) }, { t: 'br', lv: 1 }, { t: 'op', s: '=' }, { t: 'm', id: 'R', o: R }]
          : [{ t: 'op', s: nf(cfg.k), big: true, color: 'violet' }, { t: 'm', id: 'A', o: mk(cfg.A, 'A', cfg.tA) }, { t: 'br', lv: 1 }, { t: 'op', s: '=' }, { t: 'm', id: 'R', o: R }];
        const strip = [];
        if (sel) {
          const [i, j] = sel, a = cfg.A[i][j], done = F[i][j] !== null;
          strip.push([{ s: nm(i, j), c: 'muted', w: 500 }]);
          strip.push(cfg.bin
            ? [{ s: nf(a), c: 'blue' }, { s: `  ${cfg.sym}  `, w: 400, c: 'muted' }, { s: nf(cfg.B[i][j]), c: 'blue' }, { s: '  =  ', w: 400, c: 'muted' }, { s: done ? nf(F[i][j]) : '?', c: 'yellow', w: 800 }]
            : [{ s: nf(cfg.k), c: 'violet' }, { s: '  ×  ', w: 400, c: 'muted' }, { s: nf(a), c: 'blue' }, { s: '  =  ', w: 400, c: 'muted' }, { s: done ? nf(F[i][j]) : '?', c: 'yellow', w: 800 }]);
        }
        return { items, strip, good: 46 };
      };
      const addQ = () => {
        const op = A_.op;
        if (op === 'sz') {
          const k = A_.szq, S = SZ[k];
          return mkQ('sz' + k, `${kk('Pair ' + (k + 1) + ' of 2')}<br>${S.q}`, [
            { t: 'Yes, add the entries that line up', why: 'Adding needs every entry to have a partner in the same position. Here some entries have no partner (they turn red once you answer), so there is nothing to add them to.' },
            { t: 'No, they are not the same size', right: true, why: k === 0 ? 'The sales matrix is 2 by 3 and the extra matrix is 2 by 2. The entries in column 3 of the sales matrix have no partner (red), so the sum is not defined. Matrices must have the same dimensions to be added.' : 'Both have 6 entries, but 2 by 3 and 3 by 2 are different shapes. The entry in row 1, column 3 has no partner in the 3 by 2 matrix, and the entries in row 3 of the 3 by 2 matrix have no partner in the 2 by 3. Same number of entries is not enough: the dimensions must match.' }], k, { onRight: () => { A_.szAns[k] = true; } });
        }
        const cfg = CFG[op];
        ensureSel(op);
        const sel = A_.sel[op];
        if (!sel) {
          const msg = { add: 'All six cells are filled. Every entry of the total is the sum of the two entries in the same position.', sub: 'All six cells are filled. A negative entry means that store sold fewer of that item in week 2 than in week 1.', dbl: 'All six cells are filled. Every entry doubled, not just the first one.', inc: 'All six cells are filled. Every entry grew by 20 percent: that is the same as multiplying every entry by 1.2.' }[op];
          return { id: 'a-' + op + '-done', ask: msg };
        }
        const [i, j] = sel, a = cfg.A[i][j], correct = resOf(op, i, j), id = `a-${op}-${i}${j}`, onRight = () => { fillOf(op)[i][j] = correct; pop('r' + op + i + j); };
        let ask, items;
        if (op === 'add') {
          const b = cfg.B[i][j], o = W2[1 - i][j];
          ask = `${kk(nm(i, j))}<br>Week 1 has <b>${a}</b> and week 2 has <b>${b}</b>. Add the two entries in the same position. What goes in the yellow cell?`;
          items = pool({ v: a + b, t: String(a + b), why: `${a} + ${b} = ${a + b}. Each entry of the total uses only the two entries in the same position, ${nm(i, j)}.` }, [
            { v: Math.abs(a - b), t: String(Math.abs(a - b)), why: `${a} and ${b} have to be added, not subtracted. The total is how many were sold in the two weeks together.` },
            { v: a + o, t: String(a + o), why: `${o} is the week 2 entry for ${STORES[1 - i]}. The pair has to be in the <b>same position</b>: the same store and the same item.` },
            { v: a, t: String(a), why: `That is only the week 1 entry. The total also includes week 2, which is ${b}.` }]);
        } else if (op === 'sub') {
          const b = cfg.B[i][j];
          ask = `${kk(nm(i, j))}<br>The change is <b>week 2 minus week 1</b>. Week 2 has <b>${a}</b> and week 1 has <b>${b}</b>. What goes in the yellow cell?`;
          items = pool({ v: a - b, t: nf(a - b), why: `${a} − ${b} = ${nf(a - b)}. ${a - b < 0 ? 'The change is negative, because fewer were sold in week 2.' : a - b === 0 ? 'No change.' : 'More were sold in week 2.'}` }, [
            { v: b - a, t: nf(b - a), why: `${b} − ${a} = ${nf(b - a)} starts from week 1. The change from week 1 to week 2 is week 2 minus week 1, ${a} − ${b}. Order matters in subtraction.` },
            { v: a + b, t: String(a + b), why: `${a} + ${b} adds the weeks. A change is found by subtracting.` },
            ...(a - b < 0 ? [{ v: b - a, t: String(b - a), why: 'That drops the minus sign.' }] : []),
            { v: a - W1[1 - i][j], t: nf(a - W1[1 - i][j]), why: `That uses the week 1 entry for ${STORES[1 - i]}. Subtract the week 1 entry in the <b>same position</b>.` }]);
        } else {
          const k = cfg.k;
          ask = op === 'dbl'
            ? `${kk(nm(i, j))}<br>Doubling means multiplying <b>every entry</b> by 2. The entry is <b>${a}</b>. What goes in the yellow cell?`
            : `${kk(nm(i, j))}<br>A 20 percent increase means multiplying by <b>1.2</b> (100 percent plus 20 percent). The entry is <b>${a}</b>. What goes in the yellow cell?`;
          items = pool({ v: correct, t: nf(correct), why: `${nf(k)} × ${a} = ${nf(correct)}. The scalar multiplies this entry, and every other entry too.` }, [
            { v: a + k, t: nf(a + k), why: `${a} + ${nf(k)} adds the scalar. A scalar <b>multiplies</b> each entry.` },
            ...(op === 'inc' ? [{ v: Math.round(a * .2 * 100) / 100, t: nf(a * .2), why: `That is only the increase (20 percent of ${a}). The new amount is the old amount plus the increase, which is ${a} × 1.2 = ${nf(correct)}.` }] : [{ v: a * 3, t: String(a * 3), why: `${a * 3} is three times the entry. Doubling means 2 times the entry.` }]),
            { v: a, t: String(a), why: `${a} is the entry before the change. Every entry gets multiplied, so this one changes too.` },
            { v: a * k + k, t: nf(a * k + k), why: 'That multiplies and then adds the scalar again. Multiply once.' }]);
        }
        return mkQ(id, ask, items, i * 3 + j, { onRight });
      };
      const addBtns = () => {
        const op = A_.op, out = [];
        if (op === 'sz') { if (A_.szAns[A_.szq] && A_.szq < 1) out.push({ label: 'Next pair', primary: true, fn: go(() => { A_.szq = 1; setFb(''); }) }); return out; }
        const F = fillOf(op), sel = A_.sel[op];
        if (sel && F[sel[0]][sel[1]] !== null) out.push({ label: nextEmpty(op) ? 'Next entry' : 'Done', primary: true, fn: go(() => { A_.sel[op] = nextEmpty(op); setFb(''); }) });
        if (!sel) { const nx = { add: 'sub', sub: 'dbl', dbl: 'inc', inc: 'sz' }[op]; out.push({ label: 'Next: ' + (nx === 'sz' ? 'sizes' : CFG[nx] ? CFG[nx].label.toLowerCase() : ''), primary: true, fn: go(() => { A_.op = nx; setFb(''); }) }); }
        return out;
      };
      const addTap = (id, i, j) => {
        const op = A_.op; if (op === 'sz' || id !== 'R') return;
        const F = fillOf(op); if (F[i][j] !== null) return;
        A_.sel[op] = [i, j]; setFb(''); refresh();
      };
      const addTabs = () => ['add', 'sub', 'dbl', 'inc', 'sz'].map(k => ({ id: k, label: k === 'sz' ? 'Sizes' : CFG[k].label, on: A_.op === k, done: aDone(k) }));

      /* ============================================================
         MODE 3 and 4: ROW TIMES COLUMN
         ============================================================ */
      const newMP = key => { const pr = PROBS[key]; return { key, res: nulls(pr.Q.length, pr.P[0].length), tg: pr.targets[0].slice(), row: pr.pick ? null : pr.targets[0][0], col: pr.pick ? null : 0, phase: pr.pick ? 'pick' : 'dot', an: 0, ai: 0, tI: 0, afterDone: [] }; };
      const mpOf = key => st.m.mps[key] || (st.m.mps[key] = newMP(key));
      const curMP = () => {
        if (st.mode === 'mult') return mpOf('cost');
        return mpOf(st.o.tab === 'rev' ? 'rev' : ['ab', 'ba'][st.o.stage]);
      };
      const remaining = mp => { const pr = PROBS[mp.key], out = []; for (let i = 0; i < pr.Q.length; i++) for (let j = 0; j < pr.P[0].length; j++) if (mp.res[i][j] === null) out.push([i, j]); return out; };
      const nextTarget = mp => {
        const pr = PROBS[mp.key], rest = remaining(mp);
        if (!rest.length) return null;
        const pref = pr.targets.concat(rest).find(([i, j]) => mp.res[i][j] === null);
        return pref || rest[0];
      };
      const dotTerms = (pr, r, c) => pr.Q[r].map((q, k) => [q, pr.P[k][c]]);
      const dotLine = terms => terms.map(([a, b]) => `${nf(a)} × ${nf(b)}`).join(' + ');
      const dotWork = terms => terms.map(([a, b]) => nf(a * b)).join(' + ');
      const dotSum = terms => terms.reduce((s, [a, b]) => s + a * b, 0);

      const multScene = (pal, mp) => {
        const pr = PROBS[mp.key], [ti, tj] = mp.tg, n = pr.Q[0].length, an = mp.an;
        const act = mp.phase === 'dot' || mp.phase === 'anim' || mp.phase === 'done';
        const rowSel = mp.row, colSel = mp.col;
        const doneTarget = mp.res[ti][tj] !== null;
        const inAnim = mp.phase === 'anim';
        const kDone = inAnim ? Math.floor(an + 1e-9) : (mp.phase === 'done' ? n : 0);
        const kNow = inAnim ? Math.min(n - 1, Math.floor(an)) : -1;
        const qCell = (i, j) => {
          const s = base(pal, 'Q', i, j);
          if (rowSel === i && (act || mp.phase === 'pick')) {
            if (j < kDone || j === kNow) return { fill: alpha(pal.yellow, .4), stroke: pal.yellow, sw: 2.4, bold: true };
          }
          return s;
        };
        const pCell = (i, j) => {
          const s = base(pal, 'P', i, j);
          if (colSel === j && (i < kDone || i === kNow)) return { fill: alpha(pal.yellow, .4), stroke: pal.yellow, sw: 2.4, bold: true };
          return s;
        };
        const rCell = (i, j) => {
          const pv = popv('rr' + mp.key + i + j), isT = i === ti && j === tj;
          if (isT && !doneTarget) return hiSel(pal, { scale: 1 + .1 * Math.sin(Math.PI * Math.min(1, inAnim ? (an / n) : 0)) });
          if (mp.res[i][j] !== null) return { fill: alpha(pal.yellow, isT ? .3 : .16), scale: 1 + .14 * pv, stroke: isT && mp.phase === 'done' ? pal.yellow : undefined, sw: 2.2 };
          return base(pal, 'R', i, j);
        };
        const Q = { rows: pr.Q.length, cols: n, title: pr.qT, rowLab: pr.qRow, colLab: pr.qCol, colShort: SHORT, val: (i, j) => nf(pr.Q[i][j]), cell: qCell,
          rowHi: rowSel !== null && rowSel !== undefined ? rowBand(rowSel, 'green') : {} };
        const Pm = { rows: n, cols: pr.P[0].length, title: pr.pT, rowLab: pr.pRow, colLab: pr.pCol, colShort: pr.short, val: (i, j) => nf(pr.P[i][j]), cell: pCell,
          colHi: colSel !== null && colSel !== undefined ? { [colSel]: ['red', 1] } : {} };
        const rowHi = {}, colHi = {};
        if (mp.phase !== 'pick' || true) { rowHi[ti] = ['green', .55]; colHi[tj] = ['red', .55]; }
        const Rm = { rows: pr.Q.length, cols: pr.P[0].length, title: pr.rT, titleColor: pal.yellow, rowLab: pr.rRow, colLab: pr.rCol, colShort: pr.short, rowHi, colHi,
          val: (i, j) => {
            if (i === ti && j === tj && inAnim) { const t = dotTerms(pr, ti, tj); let s = 0; for (let k = 0; k < kDone && k < t.length; k++) s += t[k][0] * t[k][1]; return String(nf(s)); }
            return mp.res[i][j] === null ? null : nf(mp.res[i][j]);
          }, cell: rCell };
        const items = [{ t: 'm', id: 'Q', o: Q }, { t: 'op', s: '×' }, { t: 'm', id: 'P', o: Pm }, { t: 'br', lv: 1 }, { t: 'op', s: '=' }, { t: 'm', id: 'R', o: Rm }];
        /* the strip below the matrices */
        const strip = [];
        if (mp.phase === 'pick') {
          strip.push([{ s: pr.what(ti, tj), c: 'yellow', w: 700 }]);
          strip.push([{ s: rowSel === null ? 'row ?' : 'row ' + (rowSel + 1), c: 'green' }, { s: '  ×  ', w: 400, c: 'muted' }, { s: colSel === null ? 'column ?' : 'column ' + (colSel + 1), c: 'red' }]);
        } else {
          const t = dotTerms(pr, ti, tj);
          if (mp.phase === 'dot') {
            strip.push([{ s: 'row ' + (ti + 1) + ': ', c: 'green', w: 700 }, { s: '(' + pr.Q[ti].map(nf).join(', ') + ')', c: 'green' }]);
            strip.push([{ s: 'column ' + (tj + 1) + ': ', c: 'red', w: 700 }, { s: '(' + colOf(pr.P, tj).map(nf).join(', ') + ')', c: 'red' }]);
          } else {
            const parts = [];
            t.forEach(([a, b], k) => {
              const a1 = (inAnim ? (k < kDone ? 1 : k === kNow ? .25 + .75 * (an - k) : .2) : 1);
              if (k) parts.push({ s: '  +  ', w: 400, c: 'muted', a: a1 });
              parts.push({ s: `${nf(a)} × ${nf(b)}`, c: k <= kNow || !inAnim ? 'text' : 'text', a: a1 });
            });
            strip.push(parts);
            strip.push([{ s: '=  ', c: 'muted', w: 400 }, { s: t.filter((_, k) => k < kDone || !inAnim).map(([a, b]) => nf(a * b)).join('  +  '), c: 'text' }, ...(!inAnim ? [{ s: '  =  ', c: 'muted', w: 400 }, { s: nf(dotSum(t)), c: 'yellow', w: 800 }] : [])]);
          }
        }
        return { items, strip, good: 46, mp, n, kDone, kNow };
      };
      const multAfter = (c, pal, sc) => {
        const mp = sc.mp, pr = PROBS[mp.key];
        if (mp.phase !== 'anim' && mp.phase !== 'done') return;
        const [ti, tj] = mp.tg, upto = mp.phase === 'done' ? sc.n : Math.min(sc.n, sc.kNow + 1);
        for (let k = 0; k < upto; k++) {
          const f = mp.phase === 'anim' && k === sc.kNow ? clamp((mp.an - k) * 2, 0, 1) : 1;
          badge(c, pal, 'Q', ti, k, k + 1, .3 + .7 * ease(f)); badge(c, pal, 'P', k, tj, k + 1, .3 + .7 * ease(f));
        }
      };
      const multTap = (id, i, j) => {
        const mp = curMP(), pr = PROBS[mp.key];
        if (id === 'R') {
          if (mp.res[i][j] !== null || mp.phase === 'anim') return;
          cancel(); mp.tg = [i, j]; mp.row = pr.pick ? null : i; mp.col = pr.pick ? null : 0; mp.phase = pr.pick ? 'pick' : 'dot';
          if (!pr.pick) mp.col = j; setFb(''); refresh(); return;
        }
        if (mp.phase !== 'pick') return;
        const [ti, tj] = mp.tg;
        if (id === 'Q') mp.row = i; else if (id === 'P') mp.col = j; else return;
        if (mp.row === null || mp.col === null) {
          setFb(id === 'Q' ? `Row ${i + 1}${pr.qRow ? ' (' + STORES[i] + ')' : ''} is chosen. Now tap a column of the second matrix.` : `Column ${j + 1} is chosen. Now tap a row of the first matrix.`);
          refresh(); return;
        }
        if (mp.row === ti && mp.col === tj) { mp.phase = 'dot'; setFb(`${ok('Yes.')} The entry in row ${ti + 1}, column ${tj + 1} of the result uses row ${ti + 1} of the first matrix and column ${tj + 1} of the second.`); }
        else {
          const rr_ = mp.row, cc_ = mp.col, lab = (r, cl) => (pr.rRow ? `${pr.rRow[r]} and ${pr.rCol[cl]}` : `row ${r + 1} and column ${cl + 1}`);
          let why;
          if (rr_ !== ti && cc_ !== tj) why = `Row ${rr_ + 1} and column ${cc_ + 1} make the entry for ${lab(rr_, cc_)}. You need ${lab(ti, tj)}: row ${ti + 1} of the first matrix and column ${tj + 1} of the second.`;
          else if (rr_ !== ti) why = `Column ${cc_ + 1} is right. But row ${rr_ + 1} of the first matrix belongs to ${pr.rRow ? pr.rRow[rr_] : 'row ' + (rr_ + 1)}. The result row comes from the row you use in the first matrix. You need row ${ti + 1}.`;
          else why = `Row ${rr_ + 1} is right. But column ${cc_ + 1} of the second matrix belongs to ${pr.rCol ? pr.rCol[cc_] : 'column ' + (cc_ + 1)}. The result column comes from the column you use in the second matrix. You need column ${tj + 1}.`;
          setFb(`${no('Not yet.')} ${why} Pick again.`);
          if (rr_ !== ti) mp.row = null; if (cc_ !== tj) mp.col = null;
        }
        refresh();
      };
      const finishEntry = mp => {
        const pr = PROBS[mp.key], [ti, tj] = mp.tg, t = dotTerms(pr, ti, tj), v = dotSum(t);
        mp.res[ti][tj] = v; pop('rr' + mp.key + ti + tj); mp.phase = 'done';
        if (pr.all) { const full = mmul(pr.Q, pr.P); mp.res = full; full.forEach((r, i) => r.forEach((_, j) => pop('rr' + mp.key + i + j))); }
        const say = pr.say(ti, tj, v);
        setFb(`${ok('Yes.')} ${dotLine(t)} = ${dotWork(t)} = <b>${nf(v)}</b>. ${say}${pr.all ? ` The other three entries are filled in the same way: ${pr.rT} is shown in full.` : ''}`);
        refresh();
      };
      const startAnim = mp => {
        cancel(); mp.phase = 'anim'; mp.an = 0; const n = PROBS[mp.key].Q[0].length;
        cancel = tween(500 + n * 800, e => { mp.an = ease(e) * n; st.need = true; draw(); }, () => { mp.an = n; finishEntry(mp); });
        refresh();
      };
      const multQ = mp => {
        const pr = PROBS[mp.key], [ti, tj] = mp.tg;
        if (mp.phase === 'pick') return { id: `m-${mp.key}-${ti}${tj}-pick`, ask: `${kk('Find ' + pr.what(ti, tj))}<br>${pr.pick ? 'Tap a <b style="color:var(--green)">row</b> in the first matrix and a <b style="color:var(--red)">column</b> in the second. Together they make the yellow cell.' : ''}` };
        if (mp.phase === 'dot') {
          const t = dotTerms(pr, ti, tj), R = pr.Q[ti], Cc = colOf(pr.P, tj), v = dotSum(t);
          const rev = R.map((q, k) => [q, Cc[Cc.length - 1 - k]]), sh = R.map((q, k) => [q, Cc[(k + 1) % Cc.length]]);
          const alt = dotSum(rev) !== v ? rev : sh;
          const sumAll = R.reduce((a, b) => a + b, 0) + Cc.reduce((a, b) => a + b, 0), prodSum = R.reduce((a, b) => a + b, 0) * Cc.reduce((a, b) => a + b, 0);
          const cands = [
            { v: dotSum(alt), t: `${dotLine(alt)} = ${nf(dotSum(alt))}`, why: `That pairs the entries in the wrong order. The first entry of the row goes with the <b>first</b> entry of the column, the second with the second, and so on.` },
            { v: sumAll, t: `${R.map(nf).join(' + ')} + ${Cc.map(nf).join(' + ')} = ${nf(sumAll)}`, why: 'That adds all the numbers. A row times a column <b>multiplies</b> each pair first, then adds the products.' },
            { v: prodSum, t: `(${R.map(nf).join(' + ')}) × (${Cc.map(nf).join(' + ')}) = ${nf(prodSum)}`, why: 'That adds the row, adds the column and multiplies once. Multiply the pairs one at a time, then add the products.' }];
          const items = pool({ v, t: `${dotLine(t)} = ${nf(v)}`, why: `Each pair is multiplied: ${dotLine(t)}. Then add the products: ${dotWork(t)} = ${nf(v)}.` }, cands);
          return mkQ(`m-${mp.key}-${ti}${tj}-dot`, `${kk('Row ' + (ti + 1) + ' times column ' + (tj + 1))}<br>The row is <b style="color:var(--green)">(${R.map(nf).join(', ')})</b> and the column is <b style="color:var(--red)">(${Cc.map(nf).join(', ')})</b>. Which line gives the entry for ${pr.what(ti, tj)}?`, items, ti * 2 + tj + 1, { onRight: () => startAnim(mp) });
        }
        if (mp.phase === 'anim') return { id: `m-${mp.key}-${ti}${tj}-anim`, ask: `Watch the pairs light up. Each pair is multiplied in turn, then the products are added.` };
        const rest = remaining(mp);
        if (rest.length) return { id: `m-${mp.key}-${ti}${tj}-done`, ask: `${rest.length} entr${rest.length === 1 ? 'y' : 'ies'} left. Go to the next one, or tap any empty cell of the result.` };
        if (pr.after && mp.ai < pr.after.length) {
          const a = pr.after[mp.ai];
          return mkQ(`m-${mp.key}-after${mp.ai}`, `${kk('Question ' + (mp.ai + 1) + ' of ' + pr.after.length)}<br>${a.q}`, a.items, mp.ai + 1, { onRight: () => { mp.afterDone[mp.ai] = true; } });
        }
        return { id: `m-${mp.key}-complete`, ask: pr.after ? (pr.after.length > 1 ? 'Nice work. The two questions are done.' : 'Nice work. The question is done.') : (mp.key === 'cost' ? 'All four entries are done. The 2 by 3 orders matrix times the 3 by 2 prices matrix gives a 2 by 2 cost matrix. The two 3s in the middle had to match, and the outer numbers 2 and 2 gave the size.' : '') };
      };
      const multBtns = mp => {
        const pr = PROBS[mp.key], out = [];
        if (mp.phase === 'done') {
          const nx = nextTarget(mp);
          if (nx) out.push({ label: 'Next entry', primary: true, fn: go(() => { mp.tg = nx; mp.row = pr.pick ? null : nx[0]; mp.col = pr.pick ? null : nx[1]; mp.phase = pr.pick ? 'pick' : 'dot'; setFb(''); }) });
          else if (pr.after && mp.ai < pr.after.length && (st.qs[`m-${mp.key}-after${mp.ai}`] || {}).solved) out.push({ label: 'Next question', primary: true, fn: go(() => { mp.ai++; setFb(''); }) });
          if (!nx && mp.key === 'ab' ) out.push({ label: 'Now compute BA', primary: true, fn: go(() => { st.o.stage = 1; setFb(''); }) });
          if (!nx && mp.key === 'cost') out.push({ label: 'Start again', fn: go(() => { st.m.mps.cost = newMP('cost'); Object.keys(st.qs).filter(k => k.startsWith('m-cost')).forEach(k => delete st.qs[k]); setFb(''); }) });
          out.push({ label: 'Watch again', fn: () => startAnimReplay(mp) });
        }
        return out;
      };
      /* replay: run the animation again without changing anything that was answered */
      const startAnimReplay = (mp, keep) => {
        cancel(); const n = PROBS[mp.key].Q[0].length, ph = mp.phase; mp.phase = 'anim'; mp.an = 0;
        cancel = tween(500 + n * 800, e => { mp.an = ease(e) * n; st.need = true; draw(); }, () => { mp.an = n; mp.phase = ph; refresh(); });
        refresh();
      };

      /* ---- sizes quiz ---- */
      const dimScene = pal => {
        const k = st.m.dq, [m, n, n2, p] = DIMS[k], ex = n === n2, solved = st.m.dDone[k];
        const mat = (r, c, tt, colr) => ({ rows: r, cols: c, title: tt, val: () => '·', cell: () => ({ fill: alpha(pal.blue, .09) }) });
        const items = [{ t: 'm', id: 'A', o: mat(m, n, `A: ${m} by ${n}`) }, { t: 'op', s: '×' }, { t: 'm', id: 'B', o: mat(n2, p, `B: ${n2} by ${p}`) }, { t: 'br', lv: 1 }, { t: 'op', s: '=' }];
        if (solved && ex) items.push({ t: 'm', id: 'C', o: { rows: m, cols: p, title: `AB: ${m} by ${p}`, titleColor: pal.yellow, val: () => '·', cell: () => ({ fill: alpha(pal.yellow, .2) }) } });
        else items.push({ t: 'op', s: solved ? 'does not exist' : '?', big: true, color: solved ? 'red' : 'yellow' });
        const strip = [[{ s: `(${m} by `, w: 500 }, { s: String(n), c: 'yellow', w: 800 }, { s: ')  ×  (', w: 500, c: 'muted' }, { s: String(n2), c: 'yellow', w: 800 }, { s: ` by ${p})`, w: 500 }]];
        if (solved) strip.push(ex ? [{ s: `inner ${n} = ${n2}`, c: 'yellow' }, { s: `,  so the size is ${m} by ${p}`, w: 500 }] : [{ s: `inner ${n} ≠ ${n2}`, c: 'red' }, { s: ',  so no product', w: 500 }]);
        return { items, strip, good: 40 };
      };
      const dimQ = () => {
        const k = st.m.dq, [m, n, n2, p] = DIMS[k], ex = n === n2;
        const opts = ex
          ? [{ t: `It exists and is ${m} by ${p}`, right: true, why: `The inner numbers match (${n} and ${n2}), so the product exists. The outer numbers give the size: ${m} by ${p}. Each row of A has ${n} entries and each column of B has ${n2}, so every row can be paired with every column.` },
            { t: 'It does not exist', why: `The inner numbers are ${n} and ${n2}. They match, so the product does exist. Each row of A has ${n} entries and each column of B has ${n2} entries, so the pairs line up.` },
            { t: `It exists and is ${m} by ${n}`, why: `That is the size of A. The size of AB is the outer numbers, ${m} and ${p}.` },
            { t: `It exists and is ${n} by ${p}`, why: `That is the size of B. The size of AB is the outer numbers, ${m} and ${p}.` }]
          : [{ t: 'It does not exist', right: true, why: `The inner numbers are ${n} and ${n2}. They do not match: a row of A has ${n} entries, but a column of B has ${n2}, so the entries cannot be paired.` },
            { t: `It exists and is ${m} by ${p}`, why: `Those are the outer numbers, but they only give the size when the inner numbers match. Here the inner numbers are ${n} and ${n2}.` },
            { t: `It exists and is ${m} by ${n}`, why: `The inner numbers ${n} and ${n2} do not match, so there is no product at all.` },
            { t: `It exists and is ${n} by ${p}`, why: `The inner numbers ${n} and ${n2} do not match, so there is no product at all.` }];
        const seen = new Set(), items = opts.filter(o => { if (seen.has(o.t)) return false; seen.add(o.t); return true; });
        return mkQ('dm' + k, `${kk('Sizes ' + (k + 1) + ' of ' + DIMS.length)}<br>A is ${m} by ${n} and B is ${n2} by ${p}. Does the product AB exist, and what size is it?<br><span class="k">(m by n) times (n by p) is (m by p)</span>`, items, k + 1, { onRight: () => { st.m.dDone[k] = true; } });
      };

      /* ============================================================
         MODE 4: ORDER AND SHAPES
         ============================================================ */
      const O = st.o;
      const compareScene = pal => {
        const AB = mmul(MA, MB), BA = mmul(MB, MA);
        const mk = (M, tt, other) => ({ rows: 2, cols: 2, title: tt, titleColor: pal.yellow, val: (i, j) => String(M[i][j]), cell: (i, j) => (M[i][j] !== other[i][j] ? { fill: alpha(pal.red, .2), stroke: pal.red, sw: 2.2, bold: true } : { fill: alpha(pal.yellow, .16) }) });
        return { items: [{ t: 'm', id: 'AB', o: mk(AB, 'AB', BA) }, { t: 'op', s: '≠', big: true, color: 'red' }, { t: 'm', id: 'BA', o: mk(BA, 'BA', AB) }], strip: [[{ s: 'Red entries differ', c: 'red', w: 600 }]], good: 40 };
      };
      const shapeImg = m => mmul(SHM[m].M, VTX);
      const shapeQ = () => {
        const m = O.shm, M2 = SHM[m].M, [x, y] = [VTX[0][VQ], VTX[1][VQ]], img = shapeImg(m), ex = img[0][VQ], ey = img[1][VQ];
        const how = `New x = row 1 of the matrix times the column: ${nf(M2[0][0])} × ${x} + ${nf(M2[0][1])} × ${y} = ${nf(ex)}. New y = row 2 times the column: ${nf(M2[1][0])} × ${x} + ${nf(M2[1][1])} × ${y} = ${nf(ey)}.`;
        const tr = [M2[0][0] * x + M2[1][0] * y, M2[0][1] * x + M2[1][1] * y];
        const P_ = (a, b) => `(${nf(a)}, ${nf(b)})`;
        const cands = [
          { v: P_(ey, ex), t: P_(ey, ex), why: `That has the coordinates in the wrong order. Row 1 gives the new x and row 2 gives the new y. ${how}` },
          { v: P_(tr[0], tr[1]), t: P_(tr[0], tr[1]), why: `That pairs the matrix entries by columns instead of by rows. Use a row of the matrix with the column of the point. ${how}` },
          { v: P_(x, y), t: P_(x, y), why: `That is the corner before the move. ${how}` },
          { v: P_(ex + 1, ey), t: P_(ex + 1, ey), why: `Check the arithmetic. ${how}` },
          { v: P_(ex, ey + 1), t: P_(ex, ey + 1), why: `Check the arithmetic. ${how}` }];
        const items = pool({ v: P_(ex, ey), t: P_(ex, ey), why: `${how} The matrix ${SHM[m].d}.` }, cands);
        return mkQ('sh' + m, `${kk(SHM[m].n + ' matrix')}<br>The corner <b>(${x}, ${y})</b> is the second column of the corners matrix V. Where does the matrix send it?`, items, m + 1, { onRight: () => { O.shDone[m] = true; O.sht = 0; cancel(); cancel = tween(1500, e => { O.sht = ease(e); draw(); }, () => { O.sht = 1; refresh(); }); } });
      };
      const shapeScene = pal => {
        const m = O.shm, M2 = SHM[m].M, done = O.shDone[m], img = shapeImg(m);
        const Mm = { rows: 2, cols: 2, title: 'M', val: (i, j) => nf(M2[i][j]), cell: () => ({}) };
        const Vm = { rows: 2, cols: 3, title: 'V (corners)', val: (i, j) => String(VTX[i][j]), cell: (i, j) => (j === VQ ? hiSrc(pal) : {}) };
        const Rm = { rows: 2, cols: 3, title: 'New corners', titleColor: pal.yellow, val: (i, j) => (done ? nf(img[i][j]) : null), cell: (i, j) => (j === VQ ? hiSel(pal) : {}) };
        const strip = [];
        return { items: [{ t: 'm', id: 'M', o: Mm }, { t: 'op', s: '×' }, { t: 'm', id: 'V', o: Vm }, { t: 'op', s: '=' }, { t: 'm', id: 'W', o: Rm }], strip, noWrap: true, cwMax: 46, cwMin: 22, good: 26,
          bottom: (W, H) => clamp(H * .62, 0, 400), below: (c, p, H1, W, H) => drawShape(c, p, H1, W, H) };
      };
      const drawShape = (c, p, H1, W, H) => {
        const pal = p.pal, m = O.shm, M2 = SHM[m].M, t = O.shDone[m] ? (O.sht === 0 && !st.shSeen ? 1 : O.sht) : 0;
        const x0 = -3, x1 = 7, y0 = -3, y1 = 4, pad = 14, top = H1 + 6;
        const u = Math.min((W - 2 * pad) / (x1 - x0), (H - top - 26) / (y1 - y0 + .4));
        const ox = W / 2 - (x0 + x1) / 2 * u, oy = top + (H - top - 14) / 2 + (y0 + y1) / 2 * u;
        const X = v => ox + v * u, Y = v => oy - v * u;
        c.lineWidth = 1; c.strokeStyle = pal.grid;
        for (let k = x0; k <= x1; k++) { c.beginPath(); c.moveTo(X(k), Y(y0)); c.lineTo(X(k), Y(y1)); c.stroke(); }
        for (let k = y0; k <= y1; k++) { c.beginPath(); c.moveTo(X(x0), Y(k)); c.lineTo(X(x1), Y(k)); c.stroke(); }
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.6; c.beginPath(); c.moveTo(X(x0), Y(0)); c.lineTo(X(x1), Y(0)); c.moveTo(X(0), Y(y0)); c.lineTo(X(0), Y(y1)); c.stroke();
        for (let k = x0; k <= x1; k++) if (k && (u >= 24 || k % 2 === 0)) T(c, nf(k), X(k), Y(0) + 11, { size: 10.5, color: pal.muted });
        for (let k = y0; k <= y1; k++) if (k && (u >= 24 || k % 2 === 0)) T(c, nf(k), X(0) - 10, Y(k), { size: 10.5, color: pal.muted });
        const tri = (pts, fill, stroke) => { c.beginPath(); pts.forEach(([a, b], i) => (i ? c.lineTo(X(a), Y(b)) : c.moveTo(X(a), Y(b)))); c.closePath(); c.fillStyle = fill; c.fill(); c.strokeStyle = stroke; c.lineWidth = 2.4; c.lineJoin = 'round'; c.stroke(); };
        const orig = [0, 1, 2].map(j => [VTX[0][j], VTX[1][j]]);
        tri(orig, alpha(pal.blue, .2), pal.blue);
        if (t > 0) { const mt = [[1 + (M2[0][0] - 1) * t, M2[0][1] * t], [M2[1][0] * t, 1 + (M2[1][1] - 1) * t]]; tri([0, 1, 2].map(j => [mt[0][0] * VTX[0][j] + mt[0][1] * VTX[1][j], mt[1][0] * VTX[0][j] + mt[1][1] * VTX[1][j]]), alpha(pal.yellow, .26), pal.yellow); }
        const [qx, qy] = orig[VQ]; c.beginPath(); c.arc(X(qx), Y(qy), 6, 0, TAU); c.fillStyle = pal.blue; c.fill(); c.lineWidth = 2; c.strokeStyle = pal.stage; c.stroke();
        T(c, `(${qx}, ${qy})`, X(qx) + 6, Y(qy) + 16, { size: 11.5, color: pal.blue, weight: 700, align: 'left' });
        if (O.shDone[m] && t >= 1) { const img = shapeImg(m); T(c, `(${nf(img[0][VQ])}, ${nf(img[1][VQ])})`, X(img[0][VQ]), Y(img[1][VQ]) - 14, { size: 11.5, color: pal.yellow, weight: 700 }); }
      };
      const orderTabs = () => [{ id: 'rev', label: 'Revenue', on: O.tab === 'rev', done: !!(st.m.mps.rev && st.m.mps.rev.afterDone[1]) }, { id: 'ab', label: 'Order', on: O.tab === 'ab', done: !!(st.m.mps.ba && st.m.mps.ba.afterDone[0]) }, { id: 'shape', label: 'Shapes', on: O.tab === 'shape', done: O.shDone.every(Boolean) }];

      /* ============================================================
         the four modes as one table
         ============================================================ */
      const M = {
        data: {
          scene: dataScene, q: dataQ, btns: dataBtns, tap: dataTap,
          tabs: () => dTabs.map(([id, label]) => ({ id, label, on: String(D.task) === id, done: D.done[+id] })),
          go: id => go(() => { D.task = +id; setFb(''); })()
        },
        addsub: {
          scene: addScene, q: addQ, btns: addBtns, tap: addTap, tabs: addTabs,
          go: id => go(() => { A_.op = id; setFb(''); })()
        },
        mult: {
          scene: pal => (st.m.tab === 'prod' ? multScene(pal, mpOf('cost')) : dimScene(pal)), tap: (id, i, j) => (st.m.tab === 'prod' ? multTap(id, i, j) : null),
          q: () => (st.m.tab === 'prod' ? multQ(mpOf('cost')) : dimQ()),
          btns: () => {
            if (st.m.tab === 'prod') return multBtns(mpOf('cost'));
            const k = st.m.dq, out = [];
            if (st.m.dDone[k] && k < DIMS.length - 1) out.push({ label: 'Next sizes', primary: true, fn: go(() => { st.m.dq = k + 1; setFb(''); }) });
            return out;
          },
          tabs: () => [{ id: 'prod', label: 'Row times column', on: st.m.tab === 'prod', done: !remaining(mpOf('cost')).length }, { id: 'dims', label: 'Sizes', on: st.m.tab === 'dims', done: st.m.dDone.every(Boolean) }],
          go: id => go(() => { st.m.tab = id; setFb(''); })()
        },
        order: {
          scene: pal => {
            if (O.tab === 'shape') return shapeScene(pal);
            const mp = curMP();
            if (O.tab === 'ab' && mp.key === 'ba' && mp.phase === 'done' && !remaining(mp).length && mp.ai < 1) return compareScene(pal);
            return multScene(pal, mp);
          },
          tap: (id, i, j) => { if (O.tab !== 'shape') multTap(id, i, j); },
          q: () => (O.tab === 'shape' ? shapeQ() : multQ(curMP())),
          btns: () => {
            if (O.tab === 'shape') {
              const out = SHM.map((s, k) => ({ label: s.n + (O.shDone[k] ? ' ✓' : ''), primary: O.shm === k, fn: go(() => { O.shm = k; O.sht = O.shDone[k] ? 1 : 0; setFb(''); }) }));
              return out;
            }
            return multBtns(curMP());
          },
          tabs: orderTabs,
          go: id => go(() => { O.tab = id; setFb(''); })()
        }
      };

      /* ---------- drawing ---------- */
      P.onDraw = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h;
        st.placed = []; st.need = false;
        const sc = M[st.mode].scene(pal), lines = sc.strip || [];
        const fs2 = clamp(W * .043, 14.5, 20), lh = fs2 * 1.6, stripH = lines.length ? lines.length * lh : 0;
        const H1 = H - (sc.bottom ? sc.bottom(W, H) : 0);
        const plan = planFlow(c, sc.items, W, H1, stripH, sc);
        const y0 = Math.max(10, (H1 - plan.totalH) / 2);
        const endY = drawPlan(c, pal, plan, W, y0, st.placed);
        lines.forEach((parts, k) => drawSegs(c, pal, parts, W / 2, endY + 28 + k * lh, fs2, W));
        if (sc.mp) multAfter(c, pal, sc);
        if (sc.below) sc.below(c, p, H1, W, H);
        if (st.need) p.requestDraw();
      };

      /* ---------- pointer ---------- */
      const xy = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      const hit = (x, y) => {
        for (const m of st.placed) {
          if (x >= m.gx && x < m.gx + m.cols * m.cw && y >= m.gy && y < m.gy + m.rows * m.ch) return { id: m.id, i: Math.floor((y - m.gy) / m.ch), j: Math.floor((x - m.gx) / m.cw) };
        }
        return null;
      };
      cv.addEventListener('pointerdown', e => { const [x, y] = xy(e), k = hit(x, y); if (k && M[st.mode].tap) M[st.mode].tap(k.id, k.i, k.j); });
      cv.addEventListener('pointermove', e => {
        const [x, y] = xy(e), k = hit(x, y);
        cv.style.cursor = k ? 'pointer' : 'default';
        const same_ = (!k && !st.hov) || (k && st.hov && k.id === st.hov.id && k.i === st.hov.i && k.j === st.hov.j);
        if (!same_) { st.hov = k; draw(); }
      });
      cv.addEventListener('pointerleave', () => { if (st.hov) { st.hov = null; draw(); } });

      /* ---------- steps ---------- */
      const apply = patch => {
        cancel();
        if (patch.mode !== undefined) st.mode = patch.mode;
        if (patch.task !== undefined) D.task = patch.task;
        if (patch.op !== undefined) A_.op = patch.op;
        if (patch.tab !== undefined) { if (st.mode === 'mult') st.m.tab = patch.tab; if (st.mode === 'order') O.tab = patch.tab; }
        setFb(''); refresh();
      };
      refresh();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
