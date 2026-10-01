/* =====================================================================
   SCHOOL — Unit rates and best buys
   ===================================================================== */
{
  /* ---------- words and numbers ---------- */
  const MON = v => { const r = Math.round(v * 100) / 100; return '$' + (Number.isInteger(r) ? String(r) : r.toFixed(2)); };
  const PR = c => '$' + (c / 100).toFixed(2);                              /* price in cents -> "$3.00" */
  const UP = u => u >= 100 ? '$' + (u / 100).toFixed(2) : num(u) + '¢';   /* unit price in cents -> "22.5¢" or "$2.75" */
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const QD = {
    usd: { one: 'dollar', nm: 'dollars', money: true },
    lb: { one: 'pound', nm: 'pounds' },
    L: { one: 'liter', nm: 'liters' },
    min: { one: 'minute', nm: 'minutes' },
    orange: { one: 'orange', nm: 'oranges' },
    km: { one: 'km', nm: 'km' },
    hr: { one: 'hour', nm: 'hours' }
  };
  const val = (q, v) => q.money ? MON(v) : `${num(v)} ${v === 1 ? q.one : q.nm}`;
  const per = (qz, k, qw) => `${val(qz, k)} per ${qw.one}`;
  const tf0 = q => v => q.money ? MON(v) : num(v);
  const clean = v => Math.round(v * 1e6) / 1e6;
  const divisors = n => { const d = []; for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; };

  /* ---------- the questions on the double number line ---------- */
  /* Divide the total of Z by the number of W. Right: n ÷ d. Wrong: d ÷ n, which is the OTHER unit rate; the multiplication check shows why it fails. */
  const divOps = ({ n, d, Z, W, okFirst }) => {
    const k = n / d, w = d / n;
    const right = { t: `${n} ÷ ${d}`, ok: true,
      say: `Split ${val(Z, n)} into ${d} equal parts, one for each ${W.one}: ${n} ÷ ${d} = ${num(k)}. That is ${per(Z, k, W)}. Check: ${d} × ${num(k)} = ${num(d * k)}, the amount you started with.` };
    const wrong = { t: `${d} ÷ ${n}`, ok: false,
      say: `${d} ÷ ${n} = ${num(w)}. That is a real unit rate, but it is ${per(W, w, Z)}, the other one. This question asks for ${Z.nm} per ${W.one}. Check: if 1 ${W.one} gave ${val(Z, w)}, then ${d} ${W.nm} would give ${d} × ${num(w)} = ${val(Z, d * w)}, not ${val(Z, n)}.` };
    return okFirst ? [right, wrong] : [wrong, right];
  };
  const readDef = K => t => `${val(K.top.q, t)} = ${K.rows.map(r => val(r.q, r.k * t)).join(', ')}`;

  /* A ratio "a Y for b X" drawn with X on the top line and Y below. perX: the marker sits on X at 1 (find Y per 1 X); otherwise on Y at 1. */
  const rateTask = (id, o) => {
    const qx = QD[o.X], qy = QD[o.Y], { a, b, perX } = o;
    const W = perX ? qx : qy, Z = perX ? qy : qx, wT = perX ? b : a, zT = perX ? a : b;
    const K = {
      id, kind: 'rate', demo: !!o.demo, menu: o.menu,
      heads: [{ t: o.head }], note: `ratio ${a} : ${b}  (${qy.nm} : ${qx.nm})`,
      top: { q: qx, max: b, cap: qx.nm },
      rows: [{ q: qy, k: a / b, cap: qy.nm }],
      pins: [{ t: b, rows: [0] }],
      mark: { on: perX ? 'top' : 0, step: 1, start: perX ? b : a, target: 1 },
      targetTxt: `1 ${W.one}`,
      q: o.q, ops: o.demo ? null : divOps({ n: zT, d: wT, Z, W, okFirst: o.okFirst }),
      cards: lvl => [
        { head: `${qy.nm} per ${qx.one}`, col: 'red', ask: perX, big: lvl >= (perX ? 1 : 2) ? `${a} ÷ ${b} = ${num(a / b)}` : null, sub: per(qy, a / b, qx) },
        { head: `${qx.nm} per ${qy.one}`, col: 'green', ask: !perX, big: lvl >= (perX ? 2 : 1) ? `${b} ÷ ${a} = ${num(b / a)}` : null, sub: per(qx, b / a, qy) }
      ]
    };
    K.read = readDef(K);
    return K;
  };
  /* A constant speed: distance per 1 unit of time, marker on the time line at 1. */
  const speedDiv = (id, o) => {
    const { n, d, Z, W } = o, k = n / d;
    const K = {
      id, kind: 'speed', menu: o.menu,
      heads: [{ t: o.head }], note: `constant speed, ratio ${n} : ${d}  (${Z.nm} : ${W.nm})`,
      top: { q: W, max: o.max, cap: `time (${W.nm})` },
      rows: [{ q: Z, k, cap: `distance (${Z.nm})` }],
      pins: [{ t: d, rows: [0] }],
      mark: { on: 'top', step: o.step, start: d, target: 1 },
      targetTxt: `1 ${W.one}`,
      q: o.q, ops: divOps({ n, d, Z, W, okFirst: o.okFirst }),
      cards: lvl => [
        { head: `${Z.nm} per ${W.one}`, col: 'red', ask: true, big: lvl >= 1 ? `${n} ÷ ${d} = ${num(k)}` : null, sub: per(Z, k, W) },
        { head: 'check', col: 'muted', ask: false, big: lvl >= 2 ? `${num(k)} × ${d} = ${n}` : null, sub: `matches the ${val(Z, n)} given` }
      ]
    };
    K.read = readDef(K);
    return K;
  };

  const TASKS = {};
  const RATE_IDS = ['grapes-lb', 'grapes-usd', 'water-min', 'juice-L', 'water-L', 'juice-orange'];
  const SPEED_IDS = ['cyc-1', 'run-1', 'cyc-2', 'cyc-3', 'cmp'];
  [
    rateTask('mix-lb', { X: 'lb', Y: 'usd', a: 6, b: 3, perX: true, demo: true, head: 'Trail mix: $6 for 3 pounds' }),
    rateTask('mix-usd', { X: 'lb', Y: 'usd', a: 6, b: 3, perX: false, demo: true, head: 'Trail mix: $6 for 3 pounds' }),
    rateTask('grapes-lb', { X: 'lb', Y: 'usd', a: 5, b: 4, perX: true, okFirst: true, menu: 'Grapes: dollars per pound',
      head: 'Grapes: $5 for 4 pounds', q: 'Grapes cost $5 for 4 pounds. What is the price per pound?' }),
    rateTask('grapes-usd', { X: 'lb', Y: 'usd', a: 5, b: 4, perX: false, okFirst: false, menu: 'Grapes: pounds per dollar',
      head: 'Grapes: $5 for 4 pounds', q: 'Grapes cost $5 for 4 pounds. How many pounds do you get for each dollar?' }),
    rateTask('water-min', { X: 'min', Y: 'L', a: 15, b: 6, perX: true, okFirst: false, menu: 'Tap: liters per minute',
      head: 'Tap: 15 liters in 6 minutes', q: 'A tap fills a tank with 15 liters in 6 minutes. How many liters flow in each minute?' }),
    rateTask('juice-L', { X: 'L', Y: 'orange', a: 20, b: 5, perX: true, okFirst: true, menu: 'Juice: oranges per liter',
      head: 'Juice: 20 oranges make 5 liters', q: '20 oranges make 5 liters of juice. How many oranges go into each liter?' }),
    rateTask('water-L', { X: 'min', Y: 'L', a: 15, b: 6, perX: false, okFirst: true, menu: 'Tap: minutes per liter',
      head: 'Tap: 15 liters in 6 minutes', q: 'A tap fills a tank with 15 liters in 6 minutes. How many minutes does each liter take?' }),
    rateTask('juice-orange', { X: 'L', Y: 'orange', a: 20, b: 5, perX: false, okFirst: false, menu: 'Juice: liters per orange',
      head: 'Juice: 20 oranges make 5 liters', q: '20 oranges make 5 liters of juice. How many liters of juice come from each orange?' }),
    speedDiv('cyc-1', { n: 25, d: 2, Z: QD.km, W: QD.hr, max: 4, step: .5, okFirst: true, menu: 'Cyclist: km in 1 hour',
      head: 'Mia cycles 25 km in 2 hours', q: 'Mia cycles 25 km in 2 hours at a constant speed. How many km does she cycle in 1 hour?' }),
    speedDiv('run-1', { n: 2, d: 8, Z: QD.km, W: QD.min, max: 12, step: 1, okFirst: false, menu: 'Jogger: km in 1 minute',
      head: 'Maya jogs 2 km in 8 minutes', q: 'Maya jogs 2 km in 8 minutes at a steady pace. How many km does she jog in 1 minute?' })
  ].forEach(K => { TASKS[K.id] = K; });

  /* predict a distance from a speed: multiply */
  TASKS['cyc-2'] = {
    id: 'cyc-2', kind: 'speed', hide: true, menu: 'Distance after 5 hours',
    heads: [{ t: 'Ben cycles 12 km each hour' }], note: 'constant speed: 12 km per hour',
    top: { q: QD.hr, max: 6, cap: 'time (hours)' }, rows: [{ q: QD.km, k: 12, cap: 'distance (km)' }],
    pins: [{ t: 1, rows: [0] }], mark: { on: 'top', step: 1, start: 1, target: 5 }, targetTxt: '5 hours',
    q: 'Ben cycles at a constant speed of 12 km per hour. How many km does he cycle in 5 hours?',
    ops: [
      { t: '12 × 5', ok: true, say: 'Each hour adds 12 km and there are 5 hours, so multiply: 12 × 5 = 60 km. The marker at 5 hours reads 60 km. Check: 60 ÷ 5 = 12 km per hour.' },
      { t: '12 ÷ 5', ok: false, say: '12 ÷ 5 = 2.4 km. In 5 hours Ben must go farther than in 1 hour (12 km), but 2.4 km is less. Dividing makes the amount smaller. Each hour adds another 12 km, so use multiplication.' },
      { t: '12 + 5', ok: false, say: '12 + 5 = 17 km. That adds 5 hours to 12 km, which are different things. After 5 hours Ben has added 12 km five times: 12 + 12 + 12 + 12 + 12 = 60 km. 17 km is only a little more than the first hour.' }
    ],
    cards: lvl => [
      { head: 'speed (given)', col: 'red', ask: false, big: '12 km per hour', sub: '12 km in 1 hour' },
      { head: 'km in 5 hours', col: 'red', ask: true, big: lvl >= 2 ? '12 × 5 = 60' : null, sub: '60 km in 5 hours' }
    ]
  };
  /* predict a time from a speed: divide */
  TASKS['cyc-3'] = {
    id: 'cyc-3', kind: 'speed', hide: true, menu: 'Time for 30 km',
    heads: [{ t: 'Ben cycles 12 km each hour' }], note: 'constant speed: 12 km per hour',
    top: { q: QD.hr, max: 4, cap: 'time (hours)' }, rows: [{ q: QD.km, k: 12, cap: 'distance (km)' }],
    pins: [{ t: 1, rows: [0] }], mark: { on: 0, step: 6, start: 12, target: 30 }, targetTxt: '30 km',
    q: 'Ben cycles at a constant speed of 12 km per hour. How many hours does he need to cycle 30 km?',
    ops: [
      { t: '30 × 12', ok: false, say: '30 × 12 = 360 hours. That is 15 days of non-stop cycling for a 30 km ride. Multiplying km by km per hour does not give hours. Ask instead: how many 12 km pieces fit into 30 km?' },
      { t: '30 ÷ 12', ok: true, say: 'Ask how many 12 km pieces fit into 30 km: 30 ÷ 12 = 2.5. So it takes 2.5 hours, which is 2 hours 30 minutes. The marker at 30 km reads 2.5 hours. Check: 12 × 2.5 = 30.' },
      { t: '12 ÷ 30', ok: false, say: '12 ÷ 30 = 0.4 hours, which is 24 minutes. In 0.4 hours Ben rides only 12 × 0.4 = 4.8 km, not 30 km.' }
    ],
    cards: lvl => [
      { head: 'speed (given)', col: 'red', ask: false, big: '12 km per hour', sub: '12 km in 1 hour' },
      { head: 'hours for 30 km', col: 'green', ask: true, big: lvl >= 2 ? '30 ÷ 12 = 2.5' : null, sub: '2.5 hours for 30 km' }
    ]
  };
  for (const id of ['cyc-2', 'cyc-3']) TASKS[id].read = readDef(TASKS[id]);
  /* two speeds given in different units of time */
  TASKS.cmp = {
    id: 'cmp', kind: 'speed', menu: 'Who is faster?',
    heads: [{ t: 'Cyclist A: 36 km in 3 hours', col: 'red' }, { t: 'Cyclist B: 5 km in 20 minutes', col: 'blue' }], note: 'both keep a constant speed',
    top: { q: QD.min, max: 180, cap: 'time (minutes)', bub: v => v ? `${num(v)} min` + (v % 60 === 0 ? ` (${v / 60} h)` : '') : '0' },
    rows: [{ q: QD.km, k: .2, cap: 'A: distance (km)' }, { q: QD.km, k: .25, cap: 'B: distance (km)' }],
    pins: [{ t: 180, rows: [0] }, { t: 20, rows: [1] }], mark: { on: 'top', step: 20, start: 180, target: 60 }, targetTxt: '60 minutes (1 hour)',
    q: 'Cyclist A rides 36 km in 3 hours. Cyclist B rides 5 km in 20 minutes. Both keep a constant speed. Who is faster?',
    read: t => `${num(t)} minutes${t && t % 60 === 0 ? ` (${t / 60} ${t === 60 ? 'hour' : 'hours'})` : ''}: A ${num(.2 * t)} km, B ${num(.25 * t)} km`,
    ops: [
      { t: 'A is faster', ok: false, say: 'A rode more km (36 against 5), but A took 180 minutes and B took only 20. Distances can only be compared for the same time. In 60 minutes A rides 12 km and B rides 15 km, so B is ahead.' },
      { t: 'B is faster', ok: true, say: 'Compare in the same time. A: 36 ÷ 3 = 12 km in 1 hour. B: 60 minutes is 3 groups of 20 minutes, so 3 × 5 = 15 km in 1 hour. 15 is more than 12. Per minute gives the same winner: A rides 0.2 km and B rides 0.25 km.' },
      { t: 'Same speed', ok: false, say: 'In the same 60 minutes A rides 36 ÷ 3 = 12 km and B rides 3 × 5 = 15 km. Different distances in the same time mean different speeds.' }
    ],
    cards: lvl => [
      { head: 'A in 1 hour', col: 'red', ask: false, big: lvl >= 2 ? '36 ÷ 3 = 12 km' : null, sub: '12 km per hour' },
      { head: 'B in 1 hour', col: 'blue', ask: false, big: lvl >= 2 ? '3 × 5 = 15 km' : null, sub: '3 groups of 20 min = 1 h' }
    ]
  };

  /* ---------- the store shelves ---------- */
  const SHELF = {
    cereal: { id: 'cereal', name: 'Cereal boxes', kind: 'rank', one: 'ounce', sh: 'oz',
      tile: a => `${a} oz`, lab: a => `the ${a} oz box`, dl: a => `${a} oz`,
      items: [{ a: 12, c: 300 }, { a: 18, c: 414 }, { a: 24, c: 504 }],
      ask: 'Tap the boxes from best buy to worst buy.',
      tip: '<b>Tip.</b> The boxes have different sizes, so compare the price of 1 ounce: price ÷ ounces. A lower price for 1 ounce is a better buy.',
      note: 'Here the biggest box is the best buy. That is not always true. Try the pencils next.' },
    pencils: { id: 'pencils', name: 'Pencil packs', kind: 'rank', one: 'pencil', sh: 'pencils',
      tile: a => `${a} pencils`, lab: a => `the ${a}-pack`, dl: a => `${a}`,
      items: [{ a: 4, c: 100 }, { a: 12, c: 264 }, { a: 20, c: 450 }, { a: 30, c: 780 }],
      ask: 'Tap the packs from best buy to worst buy.',
      tip: '<b>Tip.</b> Compare the price of 1 pencil: price ÷ number of pencils. Some prices are not whole cents.',
      note: 'The biggest pack is the worst buy here, and the 12-pack beats the 20-pack. Bigger is not always cheaper per pencil.' },
    berries: { id: 'berries', name: 'Strawberries', kind: 'pick', one: 'pound', sh: 'lb',
      tile: a => `${a} lb`, lab: a => `the ${a} lb tray`, dl: a => `${a} lb`,
      sit: 'You need 2 lb of strawberries for a shortcake this weekend. Berries spoil in a few days.',
      items: [{ a: 1, c: 300 }, { a: 2, c: 550 }, { a: 5, c: 1250 }], pay: [600, 550, 1250],
      ask: 'Tap the tray you would buy.',
      tip: '<b>Tip.</b> Find the price per pound of each tray. Then ask yourself how much you will really use.',
      verdict: i => i === 0
        ? { ok: false, say: 'The 1 lb tray has the highest price per pound, $3.00. You need 2 lb, so you would buy two trays: 2 × $3.00 = $6.00. One 2 lb tray costs only $5.50.' }
        : i === 1
          ? { ok: true, say: 'The unit prices are $3.00, $2.75 and $2.50 per pound, so the 5 lb tray is cheapest per pound. But you need only 2 lb and the rest would spoil. You would pay $12.50 to use 2 lb, which is $12.50 ÷ 2 = $6.25 for each pound you use. The 2 lb tray costs $5.50 and you use all of it. A low unit price only helps if you will use the amount.' }
          : { ok: false, say: 'The 5 lb tray does have the lowest unit price, $2.50 per pound. But you need only 2 lb and berries spoil in a few days. You would pay $12.50 to use 2 lb: $12.50 ÷ 2 = $6.25 for each pound you actually use. The 2 lb tray costs $5.50 in all.' } }
  };
  const SHELF_IDS = ['cereal', 'pencils', 'berries'];
  for (const S of Object.values(SHELF)) {
    S.u = S.items.map(it => it.c / it.a);                                   /* cents per unit */
    S.order = S.items.map((_, i) => i).sort((x, y) => S.u[x] - S.u[y]);     /* best buy first */
    S.work = i => `${PR(S.items[i].c)} ÷ ${S.items[i].a} ${S.sh} = ${UP(S.u[i])} per ${S.one}`;
  }

  /* ---------- canvas helpers (pixel space) ---------- */
  const font = (size, weight = 600) => `${weight} ${size}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`;
  const tx = (c, p, str, x, y, { size = 14, color, align = 'center', weight = 600, halo = true } = {}) => {
    c.save(); c.font = font(size, weight); c.textAlign = align; c.textBaseline = 'middle';
    if (halo) { c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(str, x, y); }
    c.fillStyle = color || p.pal.text; c.fillText(str, x, y); c.restore();
  };
  const wid = (c, str, size, weight = 600) => { c.save(); c.font = font(size, weight); const w = c.measureText(str).width; c.restore(); return w; };
  const fitSize = (c, str, maxW, size, weight = 600) => { let s = size; while (s > 10 && wid(c, str, s, weight) > maxW) s -= .5; return s; };
  const poly = (c, pts, { stroke, width = 2, fill, close = false, dash } = {}) => {
    c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); if (close) c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = width; c.setLineDash(dash || []); c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); c.setLineDash([]); }
  };
  const rr = (c, x, y, w, hh, r) => {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + hh, r); c.arcTo(x + w, y + hh, x, y + hh, r);
    c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  const wrap = (c, str, maxW, size) => {
    const lines = []; let line = '';
    for (const word of str.split(' ')) {
      const t = line ? line + ' ' + word : word;
      if (line && wid(c, t, size) > maxW) { lines.push(line); line = word; } else line = t;
    }
    if (line) lines.push(line);
    return lines;
  };
  const circle = (c, x, y, r, fill, stroke, lw = 2) => {
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); }
  };
  const markK = K => K.mark.on === 'top' ? 1 : K.rows[K.mark.on].k;
  const rowDefs = K => [{ q: K.top.q, k: 1, cap: K.top.cap, bub: K.top.bub, col: 'green' }, ...K.rows.map((r, i) => ({ ...r, col: i === 0 ? 'red' : 'blue' }))];

  /* geometry of the double number line scene */
  const rateGeo = (p, K) => {
    const W = p.w, H = p.h, pad = clamp(W * .06, 18, 46), wide = W >= 560;
    const nRows = 1 + K.rows.length, noteY = 26 + (K.heads.length - 1) * 22 + 22, headBottom = noteY + 14;
    const cardH = wide ? 88 : 50, cardsH = wide ? cardH : 2 * cardH + 8, cardsTop = H - 14 - cardsH;
    const xL = pad + 6, xR = W - pad - 6, yTop = headBottom + 54, yBot = cardsTop - 38;
    const gap = clamp((yBot - yTop) / (nRows - 1), 84, 180), y0 = yTop + Math.max(0, (yBot - yTop - gap * (nRows - 1)) / 2);
    const kM = markK(K), N = Math.round(kM * K.top.max / K.mark.step);
    return { W, H, pad, wide, noteY, cardH, cardsTop, xL, xR, kM, N, nRows,
      ys: Array.from({ length: nRows }, (_, j) => y0 + j * gap), mi: K.mark.on === 'top' ? 0 : K.mark.on + 1,
      xOf: t => xL + t / K.top.max * (xR - xL), xi: i => xL + i / N * (xR - xL),
      cardRect: i => wide ? [pad + i * ((W - 2 * pad - 12) / 2 + 12), cardsTop, (W - 2 * pad - 12) / 2, cardH] : [pad, cardsTop + i * (cardH + 8), W - 2 * pad, cardH] };
  };

  register({
    id: 'unit-rates-and-best-buys', level: 'school',
    title: 'Unit rates and best buys',
    blurb: 'Turn a ratio into a rate for one unit, then use it to find the best buy and to predict how far a cyclist rides.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 3.4;
      const y1 = 1.1, y2 = -1.1, xs = i => -3 + 1.5 * i;
      p.path([[xs(0), y1], [xs(1), y1], [xs(1), y2], [xs(0), y2]], { fill: alpha(pal.yellow, .2), close: true });
      p.path([[xs(0), y1], [xs(4), y1]], { stroke: pal.green, width: 3 });
      p.path([[xs(0), y2], [xs(4), y2]], { stroke: pal.red, width: 3 });
      for (let i = 0; i <= 4; i++) { p.path([[xs(i), y1 - .3], [xs(i), y1 + .3]], { stroke: pal.green, width: 2 }); p.path([[xs(i), y2 - .3], [xs(i), y2 + .3]], { stroke: pal.red, width: 2 }); }
      p.path([[xs(1), y1], [xs(1), y2]], { stroke: pal.muted, width: 1.5, dash: [4, 4] });
      p.dot(xs(1), y2, 6, pal.yellow, pal.text, 1.5);
      p.dot(xs(1), y1, 8, pal.stage, pal.brass, 3);
      for (const y of [y1, y2]) p.path([[xs(4), y - .3], [xs(4) + .3, y], [xs(4), y + .3], [xs(4) - .3, y]], { fill: pal.violet, close: true });
    },
    hook: String.raw`Pack A has 6 bottles of juice for $9. Pack B has 10 bottles for $14. The packs are different sizes, so which is the better deal, and how can you tell?`,
    steps: [
      { title: 'A ratio hides a unit rate',
        text: String.raw`<p>A bag of trail mix costs $6 for 3 pounds. That is the ratio \(6:3\).</p><p>The marker sits at <b>1 pound</b>. The dollar line below reads <b>$2</b>. So 1 pound costs $2. That is a <b>unit rate</b>: <b>$2 per pound</b>.</p><p>You find it by sharing the $6 into 3 equal parts: \(6\div 3=2\).</p>`,
        set: { mode: 'rate', task: 'mix-lb', m: 1, cards: 1, help: false } },
      { title: 'One ratio, two unit rates',
        text: String.raw`<p>Same bag, new question: how many pounds do you get for <b>1 dollar</b>? Now the marker is on the dollar line at $1, and the pound line reads <b>0.5</b>.</p><p>There are two unit rates: <b>$2 per pound</b> (\(6\div 3\)) and <b>0.5 pound per dollar</b> (\(3\div 6\)).</p><p>The word <b>per</b> tells you what to divide by. "Dollars per pound" means dollars \(\div\) pounds.</p>`,
        set: { mode: 'rate', task: 'mix-usd', m: 1, cards: 2 } },
      { title: 'Unit price: compare 1 ounce',
        text: String.raw`<p>Boxes come in different sizes, so compare the price of <b>1 ounce</b>. That is the <b>unit price</b>: price \(\div\) ounces.</p><p>Tap the three boxes from best buy to worst buy. Turn on <b>Show unit prices</b> if you want help. Then the lesson explains each price.</p><p>Try the pencils and the strawberries too. The lowest unit price is not always the best choice.</p>`,
        set: { mode: 'shop', scene: 'cereal', help: false } },
      { title: 'Constant speed is a unit rate',
        text: String.raw`<p>Speed is a unit rate: distance <em>per</em> 1 hour. Mia cycles 25 km in 2 hours at a constant speed, so the marker starts at <b>2 hours</b>, where the km line reads <b>25</b>.</p><p>Drag the marker to <b>1 hour</b>, then choose the calculation that gives km per hour. A wrong choice shows you why with numbers.</p><p>The Question menu has more: two speeds in different units of time, and predicting a distance or a time.</p>`,
        set: { mode: 'speed', task: 'cyc-1', m: 2 } }
    ],
    formal: String.raw`
      <p><b>Goal.</b> Compare amounts of different sizes, and predict new amounts, by finding out what happens for exactly <em>one</em> of something.</p>
      <h3>Unit rates from a ratio</h3>
      <p>A ratio \(a:b\) compares two amounts. For example, $5 for 4 pounds is the ratio \(5:4\). Here \(b\) cannot be \(0\), because you cannot share an amount into zero equal parts.</p>
      <p>A <em>unit rate</em> says how much of one quantity goes with <em>1</em> of the other. One ratio gives two unit rates:
      \[ \text{first per 1 of the second}=\frac{a}{b}, \qquad \text{second per 1 of the first}=\frac{b}{a}. \]
      (The second one also needs \(a\neq 0\).) For $5 for 4 pounds, \(5\div 4=1.25\) dollars per pound, and \(4\div 5=0.8\) pounds per dollar. Both are true. The word <b>per</b> tells you which one a question wants: it points at the quantity you divide by. "Dollars per pound" means dollars \(\div\) pounds.</p>
      <h3>Why dividing works</h3>
      <p>On a double number line, a constant ratio means that each step of 1 on the top line matches the same step on the bottom line. Four equal steps of \(1.25\) make \(5\), so \(4\times 1.25=5\). Dividing finds the size of one step.</p>
      <h3>Check with multiplication</h3>
      <p>A unit rate times the number of units gives the total back: \(4\times 1.25=5\). A wrong rate fails the check: \(4\times 0.8=3.2\), not \(5\). If the check does not give the total you started with, you divided the wrong way around.</p>
      <h3>Unit price and the best buy</h3>
      <p>A <em>unit price</em> is the price of one unit: price divided by amount.
      \[ \text{unit price}=\frac{\text{price}}{\text{amount}} \]
      Items in different sizes cannot be compared by their prices alone. Compare the price of 1 ounce, 1 pound or 1 item. A lower unit price is a better buy. A 12 oz box for $3.00 costs \(300\div 12=25\) cents per ounce. An 18 oz box for $4.14 costs \(414\div 18=23\) cents per ounce, so it is the better buy even though it costs more in total.</p>
      <p>You can also compare the other unit rate, ounces per dollar. Then the <em>bigger</em> number is the better buy. Use the same way for every item. Unit prices are often not whole cents: 20 pencils for $4.50 cost \(450\div 20=22.5\) cents each.</p>
      <h3>When the lowest unit price is not the best choice</h3>
      <p>A unit price helps only if you will use what you buy. A 5 lb tray of strawberries at $2.50 per pound has a lower unit price than a 2 lb tray at $2.75 per pound. But if you need 2 lb and the berries spoil, the 5 lb tray costs $12.50 for the 2 lb you use. That is \(12.50\div 2=6.25\) dollars for each pound you use. The 2 lb tray costs $5.50. Compare the cost of what you will really use, and think about spoiling, storage and your budget.</p>
      <h3>Constant speed</h3>
      <p>Speed is a unit rate: distance per 1 unit of time. A <em>constant</em> speed means the same distance in every equal stretch of time, so the ratio of distance to time never changes. With distance \(d\), time \(t\) and speed \(s\),
      \[ s=\frac{d}{t}, \qquad d=s\times t, \qquad t=\frac{d}{s}. \]
      Mia cycles 25 km in 2 hours, so \(s=25\div 2=12.5\) km per hour. In 4 hours she cycles \(12.5\times 4=50\) km. Ben cycles at 12 km per hour, so 30 km takes \(30\div 12=2.5\) hours.</p>
      <h3>Choosing the operation</h3>
      <p>To find a unit rate, divide the total by the number of units. To find a total from a unit rate, multiply by the number of units. To find how many units fit into a total, divide the total by the unit rate. Then ask if the answer makes sense: more time must give more distance, so an answer that gets smaller as time grows is wrong.</p>
      <h3>Rates in different units of time</h3>
      <p>Cyclist A rides 36 km in 3 hours, which is \(36\div 3=12\) km per hour. Cyclist B rides 5 km in 20 minutes. An hour has 60 minutes, which is 3 groups of 20 minutes, so B rides \(3\times 5=15\) km in an hour. To compare rates, write them with the same unit of time. B is faster, 15 km per hour against 12 km per hour. Per minute gives the same winner: A rides \(0.2\) km and B rides \(0.25\) km each minute.</p>`,
    check: [
      { q: String.raw`A cyclist rides 36 km in 3 hours at a constant speed. At that speed, how long does it take to ride 60 km?`,
        choices: ['20 hours', '5 hours', 'About 1.7 hours', '720 hours'], answer: 1,
        why: String.raw`The speed is \(36\div 3=12\) km per hour. Then \(60\div 12=5\) hours. Check: \(12\times 5=60\). The answer 20 hours is \(60\div 3\), which ignores the speed. The answer about 1.7 hours is \(60\div 36\): it compares the two distances but forgets that 36 km took 3 hours. The answer 720 hours multiplies 60 by 12.`,
        hint: String.raw`First find how far the cyclist rides in 1 hour. Then ask how many of those hours make 60 km.` },
      { q: String.raw`A store sells sports drink in two sizes. A 12 ounce bottle costs $1.80. A 48 ounce jug costs $6.00. Ana will drink only about 12 ounces before the rest goes flat. Which should she buy?`,
        choices: ['The jug, because it costs less per ounce', 'The jug, because bigger sizes are always the better buy',
                  'The bottle, because 15 cents per ounce is less than 12.5 cents per ounce',
                  'The bottle, because she will use all of it. The jug costs $6.00 and she would use only a quarter of it'], answer: 3,
        why: String.raw`The jug costs \(6.00\div 48=0.125\) dollars, which is 12.5 cents, per ounce. The bottle costs \(1.80\div 12=0.15\) dollars, which is 15 cents, per ounce. So the jug has the lower unit price. But Ana drinks only 12 ounces. She would pay $6.00 for the jug and use a quarter of it, or pay $1.80 for the bottle and use all of it. A low unit price only helps if you use the amount. (And 15 cents is more than 12.5 cents, so the bottle does not have the lower unit price.)`,
        hint: String.raw`Find both unit prices first. Then ask how much of the drink Ana will really use, and what she pays for it.` }
    ],
    links: { prereq: ['ratios-and-equivalent-ratios'], next: ['proportional-relationships'], related: ['percents-on-tape-and-number-lines', 'slope-and-linear-functions'] },

    mount({ stage, controls: C }) {
      const MODES = ['rate', 'shop', 'speed'];
      const st = { mode: 'rate', task: 'mix-lb', scene: 'cereal', m: 1, cards: 1, help: false };
      const sv = {}, last = { rate: RATE_IDS[0], speed: SPEED_IDS[0] };
      let shop = null, cancel = () => {}, rects = [];
      const P = new Plane(stage, { span: 5 });
      if (P.coordEl) P.coordEl.style.display = 'none';
      const TK = () => TASKS[st.task], SH = () => SHELF[st.scene];
      const SV = () => sv[st.task] || (sv[st.task] = { solved: false, fb: '' });
      /* a prediction question hides the answer reading until it is solved (0 and the given amount are known already) */
      const blindNow = () => {
        const K = TK(); if (!K.hide || SV().solved) return false;
        const t = st.m / markK(K);
        return !(t < 1e-9 || K.pins.some(pn => Math.abs(pn.t - t) < 1e-9));
      };
      const startTask = id => {
        const K = TASKS[id]; st.task = id; st.mode = K.kind === 'speed' ? 'speed' : 'rate';
        st.m = K.mark.start; st.cards = 0; sv[id] = { solved: false, fb: '' };
        if (!K.demo) last[st.mode] = id;
      };
      const startScene = id => {
        st.scene = id; st.mode = 'shop';
        shop = { ranks: [], revealed: new Set(), wrong: new Set(), done: false, pick: -1, fb: SHELF[id].tip };
      };
      startScene('cereal'); startTask('mix-lb'); st.m = 1; st.cards = 1;

      /* ---------- drawing: the double number line ---------- */
      const drawRate = (c, p) => {
        const K = TK(), g = rateGeo(p, K), pal = p.pal, lvl = Math.max(st.cards, SV().solved ? 2 : 0), rows = rowDefs(K);
        const t = st.m / g.kM, xm = g.xOf(t), hs = clamp(g.W * .03 + 5, 14, 18), fs = clamp(g.W * .032, 11, 13.5), road = K.kind === 'speed';
        /* header */
        K.heads.forEach((hd, i) => tx(c, p, hd.t, g.pad, 26 + i * 22, { size: hs, align: 'left', weight: 700, color: hd.col ? pal[hd.col] : undefined }));
        tx(c, p, K.note, g.pad, g.noteY, { size: 12.5, align: 'left', color: pal.muted });
        const dx = g.W - g.pad - 34;
        poly(c, [[dx - 14, g.noteY], [dx - 8, g.noteY - 6], [dx - 2, g.noteY], [dx - 8, g.noteY + 6]], { fill: pal.violet, close: true });
        tx(c, p, 'given', dx + 4, g.noteY, { size: 12.5, align: 'left', color: pal.violet });
        /* the part from 0 to the marker */
        const yA = g.ys[0], yZ = g.ys[g.nRows - 1];
        poly(c, [[g.xOf(0), yA + 10], [xm, yA + 10], [xm, yZ - 10], [g.xOf(0), yZ - 10]], { fill: alpha(pal.yellow, .13), close: true });
        poly(c, [[xm, yA + 12], [xm, yZ - 12]], { stroke: pal.muted, width: 1.5, dash: [4, 5] });
        /* tick labels: show every skip-th tick, so the numbers never touch */
        const blind = !!K.hide && !SV().solved;
        const rv = (j, i) => clean((j === 0 ? 1 : K.rows[j - 1].k) * (i * K.mark.step / g.kM));
        let need = 0;
        for (let i = 0; i <= g.N; i++) rows.forEach((r, j) => { need = Math.max(need, wid(c, tf(r, K, j)(rv(j, i)), fs)); });
        const sp = (g.xR - g.xL) / g.N, skip = divisors(g.N).find(d => d * sp >= need + 14) || g.N;
        rows.forEach((r, j) => {
          const y = g.ys[j], col = pal[r.col], thick = road && j > 0;
          if (thick) {
            poly(c, [[g.xL, y], [g.xR, y]], { stroke: alpha(col, .2), width: 18 });
            poly(c, [[g.xL, y], [g.xR, y]], { stroke: alpha(pal.text, .35), width: 1.5, dash: [7, 9] });
          } else poly(c, [[g.xL, y], [g.xR, y]], { stroke: alpha(col, .4), width: 3 });
          poly(c, [[g.xL, y], [xm, y]], { stroke: col, width: thick ? 7 : 5 });
          for (let i = 0; i <= g.N; i++) { const x = g.xi(i), big = i % skip === 0; poly(c, [[x, y - (thick ? 10 : 6)], [x, y + (thick ? 10 : 6)]], { stroke: col, width: big ? 2.2 : 1.2 }); }
          for (let i = 0; i <= g.N; i++) {
            /* a prediction question keeps the answer line blank (except 0 and the given amount) until it is solved */
            const pinTick = K.pins.some(pn => Math.abs(pn.t - i * K.mark.step / g.kM) < 1e-9 && (j === 0 || pn.rows.includes(j - 1)));
            const show = blind && j !== g.mi ? i === 0 || pinTick : i % skip === 0;
            if (show) tx(c, p, tf(r, K, j)(rv(j, i)), g.xi(i), y + (thick ? 27 : 23), { size: fs });
          }
          tx(c, p, r.cap, g.xL, y - 44, { size: 12.5, align: 'left', color: col, weight: 700 });
        });
        /* the amounts that are given */
        for (const pin of K.pins) for (const j of [0, ...pin.rows.map(q => q + 1)]) {
          const x = g.xOf(pin.t), y = g.ys[j];
          poly(c, [[x, y - 8], [x + 6, y], [x, y + 8], [x - 6, y]], { fill: pal.violet, stroke: pal.stage, width: 1.5, close: true });
        }
        /* marker, readings and bubbles */
        rows.forEach((r, j) => {
          const y = g.ys[j], v = j === 0 ? t : r.k * t;
          if (j === g.mi) { circle(c, xm, y, 12, pal.stage, pal.brass, 3.5); circle(c, xm, y, 4.5, pal[r.col]); }
          else circle(c, xm, y, 7, pal.yellow, pal.text, 1.6);
          const bub = blindNow() && j !== g.mi ? '?' : r.bub ? r.bub(clean(v)) : tf(r, K, j)(clean(v));
          tx(c, p, bub, clamp(xm, g.xL + 14, g.xR - 14), y - 24, { size: clamp(g.W * .034 + 3, 13, 16), color: pal[r.col], weight: 700, align: xm < g.xL + 30 ? 'left' : xm > g.xR - 30 ? 'right' : 'center' });
        });
        /* unit rate cards */
        K.cards(lvl).forEach((cd, i) => {
          const [x, y, w, hh] = g.cardRect(i), col = pal[cd.col], shown = cd.big != null;
          rr(c, x, y, w, hh, 10); c.fillStyle = alpha(col, shown ? .12 : .05); c.fill();
          c.save(); c.strokeStyle = alpha(col, cd.ask ? 1 : .6); c.lineWidth = cd.ask ? 2.5 : 1.5; c.setLineDash(shown || cd.ask ? [] : [5, 5]); c.stroke(); c.restore();
          if (g.wide) {
            tx(c, p, cd.head, x + 14, y + 20, { size: 12.5, align: 'left', color: col, weight: 700, halo: false });
            const big = shown ? cd.big : '?';
            tx(c, p, big, x + 14, y + hh * .52, { size: fitSize(c, big, w - 28, 22, 700), align: 'left', color: shown ? pal.text : pal.muted, weight: 700, halo: false });
            if (shown) tx(c, p, cd.sub, x + 14, y + hh - 15, { size: fitSize(c, cd.sub, w - 28, 13, 600), align: 'left', color: pal.muted, halo: false });
            if (cd.ask) tx(c, p, 'this question', x + w - 12, y + 20, { size: 11.5, align: 'right', color: pal.muted, halo: false });
          } else {
            tx(c, p, cd.head, x + 12, y + 15, { size: 11.5, align: 'left', color: col, weight: 700, halo: false });
            const big = shown ? cd.big : '?', bs = fitSize(c, big, w * .5, 16.5, 700);
            tx(c, p, big, x + 12, y + hh - 15, { size: bs, align: 'left', color: shown ? pal.text : pal.muted, weight: 700, halo: false });
            if (shown) { const room = w - 24 - wid(c, big, bs, 700) - 10; if (wid(c, cd.sub, 11.5) <= room) tx(c, p, cd.sub, x + w - 12, y + hh - 15, { size: 11.5, align: 'right', color: pal.muted, halo: false }); }
            if (cd.ask) tx(c, p, 'this question', x + w - 12, y + 15, { size: 11, align: 'right', color: pal.muted, halo: false });
          }
        });
      };
      const tf = (r, K, j) => j === 0 && K.top.tf ? K.top.tf : tf0(r.q);

      /* ---------- drawing: the store shelf ---------- */
      const drawShop = (c, p) => {
        const S = SH(), pal = p.pal, W = p.w, H = p.h, n = S.items.length, pad = clamp(W * .05, 14, 34), fs = clamp(W * .034, 12, 16.5);
        tx(c, p, S.name, pad, 24, { size: clamp(W * .045, 15, 19), align: 'left', weight: 700 });
        const sit = S.sit ? wrap(c, S.sit, W - 2 * pad, fs) : [], ask = wrap(c, S.ask, W - 2 * pad, fs), lh = fs + 5;
        sit.forEach((ln, i) => tx(c, p, ln, pad, 48 + i * lh, { size: fs, align: 'left', color: pal.muted }));
        ask.forEach((ln, i) => tx(c, p, ln, pad, 48 + (sit.length + i) * lh, { size: fs, align: 'left' }));
        const top = 48 + (sit.length + ask.length) * lh + 4, anyRev = shop.done || shop.revealed.size > 0;
        const nlH = anyRev ? clamp(H * .24, 100, 130) : 0, nlTop = H - nlH - 10, bot = anyRev ? nlTop - 6 : H - 22;
        const cols = W >= 560 || n <= 3 ? n : 2, nRow = Math.ceil(n / cols), gap = 12;
        const tw = Math.min(230, (W - 2 * pad - gap * (cols - 1)) / cols), th = Math.min(270, (bot - top - gap * (nRow - 1)) / nRow);
        const x0 = (W - (cols * tw + (cols - 1) * gap)) / 2, y0 = top + Math.max(0, (bot - top - (nRow * th + (nRow - 1) * gap)) / 2);
        const amts = S.items.map(it => it.a), amin = Math.min(...amts), amax = Math.max(...amts), tl = fs * 1.42, reserve = (S.kind === 'pick' ? 4 : 3) * tl + 6;
        rects = [];
        for (let r = 0; r < nRow; r++) poly(c, [[x0 - 10, y0 + r * (th + gap) + th + 4], [x0 + cols * tw + (cols - 1) * gap + 10, y0 + r * (th + gap) + th + 4]], { stroke: alpha(pal['grid-strong'], .8), width: 5 });
        S.items.forEach((it, i) => {
          const tX = x0 + (i % cols) * (tw + gap), tY = y0 + Math.floor(i / cols) * (th + gap), cx = tX + tw / 2, rk = shop.ranks.indexOf(i);
          rects.push([tX, tY, tw, th]);
          const good = shop.done && (S.kind === 'pick' ? shop.pick === i : rk === 0), bad = shop.wrong.has(i);
          rr(c, tX, tY, tw, th, 12); c.fillStyle = alpha(good ? pal.green : bad ? pal.red : pal.blue, good || bad ? .12 : .06); c.fill();
          c.strokeStyle = good ? pal.green : bad ? pal.red : pal['grid-strong']; c.lineWidth = good || bad ? 3 : 1.5; c.stroke();
          /* the pack: a taller picture for a bigger amount */
          const pa = th - reserve - 18, nrm = amax > amin ? (it.a - amin) / (amax - amin) : 1, ph = pa * (.5 + .5 * nrm), pw = tw * .44, pb = tY + 12 + pa;
          rr(c, cx - pw / 2, pb - ph, pw, ph, 7); c.fillStyle = alpha(pal.blue, .3); c.fill(); c.strokeStyle = pal.blue; c.lineWidth = 2; c.stroke();
          poly(c, [[cx - pw / 2 + 5, pb - ph + ph * .22], [cx + pw / 2 - 5, pb - ph + ph * .22]], { stroke: alpha(pal.blue, .6), width: 2 });
          let ty = pb + 8 + tl / 2;
          tx(c, p, S.tile(it.a), cx, ty, { size: fitSize(c, S.tile(it.a), tw - 10, fs + 3, 700), halo: false }); ty += tl;
          tx(c, p, PR(it.c), cx, ty, { size: fs + 1, halo: false, weight: 600 }); ty += tl;
          if (st.help || shop.revealed.has(i) || shop.done) {
            const u = `${UP(S.u[i])} per ${S.one}`;
            tx(c, p, u, cx, ty, { size: fitSize(c, u, tw - 10, fs, 700), color: pal.blue, weight: 700, halo: false });
          }
          ty += tl;
          if (S.kind === 'pick' && shop.revealed.has(i)) {
            const u = `you pay ${PR(S.pay[i])}`;
            tx(c, p, u, cx, ty, { size: fitSize(c, u, tw - 10, fs, 700), color: S.pay[i] === Math.min(...S.pay) ? pal.green : pal.red, weight: 700, halo: false });
          }
          if (rk >= 0) {
            const right = shop.done || (shop.ranks.length === n && S.order[rk] === i), wrongPlace = shop.ranks.length === n && !right;
            circle(c, tX + 15, tY + 15, 12, pal.stage, right ? pal.green : wrongPlace ? pal.red : pal.brass, 3);
            tx(c, p, String(rk + 1), tX + 15, tY + 15.5, { size: 13.5, weight: 700, halo: false });
          }
          if (bad || good && S.kind === 'pick') tx(c, p, good ? '✓' : '✕', tX + tw - 15, tY + 16, { size: 17, color: good ? pal.green : pal.red, weight: 700, halo: false });
        });
        /* the unit prices on a number line */
        if (anyRev) {
          const ts = S.kind === 'pick' ? 25 : 1, lo = Math.floor(Math.min(...S.u) / ts) * ts - ts, hi = Math.ceil(Math.max(...S.u) / ts) * ts + ts;
          const a0 = pad + 12, a1 = W - pad - 12, ay = nlTop + nlH * .6, X = u => a0 + (u - lo) / (hi - lo) * (a1 - a0);
          tx(c, p, S.kind === 'pick' ? `Price for 1 ${S.one}: the lowest is on the left` : `Price for 1 ${S.one}: further left is a better buy`, pad, nlTop + 8, { size: fs, align: 'left', color: pal.muted });
          poly(c, [[a0, ay], [a1, ay]], { stroke: alpha(pal.blue, .5), width: 3 });
          const nT = Math.round((hi - lo) / ts), lw = wid(c, UP(hi), fs - 1), tskip = divisors(nT).find(d => d * (a1 - a0) / nT >= lw + 12) || nT;
          for (let k = 0; k <= nT; k++) {
            poly(c, [[X(lo + k * ts), ay - 5], [X(lo + k * ts), ay + 5]], { stroke: pal.blue, width: 1.5 });
            if (k % tskip === 0) tx(c, p, UP(lo + k * ts), X(lo + k * ts), ay + 20, { size: fs - 1, color: pal.muted, halo: false });
          }
          let edge = [-1e9, -1e9];
          S.items.map((it, i) => i).sort((i, j) => S.u[i] - S.u[j]).forEach(i => {
            const x = X(S.u[i]), lab = S.dl(S.items[i].a), w = wid(c, lab, fs, 700), lvl = x - w / 2 < edge[0] + 6 ? 1 : 0;
            edge[0] = Math.max(edge[0], x + w / 2);
            circle(c, x, ay, 7.5, i === S.order[0] ? pal.yellow : pal.blue, pal.text, 1.5);
            tx(c, p, lab, x, ay - 20 - lvl * 16, { size: fs, weight: 700 });
          });
        }
      };

      P.onDraw = (c, p) => { if (st.mode === 'shop') drawShop(c, p); else drawRate(c, p); };

      /* ---------- the readout ---------- */
      const rateHTML = () => {
        const K = TK(), s = SV(), ids = st.mode === 'speed' ? SPEED_IDS : RATE_IDS, out = [];
        const t = st.m / markK(K), at = Math.abs(st.m - K.mark.target) < 1e-6;
        if (K.demo) out.push(`<span class="k">Worked example</span> ${K.heads[0].t}. Drag the marker to explore, then press <b>Try the questions</b>.`);
        else out.push(`<span class="k">Question ${ids.indexOf(K.id) + 1} of ${ids.length}</span><br><b>${K.q}</b>`);
        out.push(`<span class="k">Marker</span> ${blindNow() ? `${val(markQ(), clean(st.m))} = ?` : K.read(clean(t))}`);
        if (!K.demo && !s.solved) out.push(at ? '<b>Step 2.</b> Choose the calculation that answers the question.' : `<b>Step 1.</b> Drag the marker to ${K.targetTxt}.`);
        if (s.fb) out.push(s.fb);
        if (s.solved) out.push(`<b>Done.</b> ${K.kind === 'rate' ? 'Both unit rates for this ratio are on the cards under the lines. ' : ''}Press <b>Next question</b>.`);
        return out.join('<br>');
      };
      const shopHTML = () => {
        const S = SH(), out = [`<span class="k">Shelf ${SHELF_IDS.indexOf(S.id) + 1} of ${SHELF_IDS.length}</span> ${S.name}`];
        if (S.sit) out.push(S.sit);
        out.push(`<b>${S.ask}</b>`);
        if (S.kind === 'rank') out.push(`<span class="k">Your order</span> ${shop.ranks.length ? shop.ranks.map(i => S.tile(S.items[i].a)).join(', then ') : 'none yet'}`);
        out.push(shop.fb);
        if (shop.done) out.push('Press <b>Next shelf</b>.');
        return out.join('<br>');
      };

      /* ---------- shop actions ---------- */
      const evalRank = () => {
        const S = SH(), o = shop.ranks, best = S.order, same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
        if (same(o, best)) {
          shop.done = true; shop.revealed = new Set(best);
          shop.fb = `${ok('Right.')} The best buy is the one with the lowest price for 1 ${S.one}.<br>` + best.map((i, r) => `${r + 1}. ${cap(S.lab(S.items[i].a))}: ${S.work(i)}.`).join('<br>') + `<br>${S.note}`;
          return;
        }
        const i = o.findIndex((v, j) => v !== best[j]), s = o[i], c0 = best[i], lab = k => S.lab(S.items[k].a);
        shop.revealed.add(s); shop.revealed.add(c0);
        let m = `${no('Not quite.')} ` + (i === 0 ? `You chose ${lab(s)} as the best buy, but ${lab(c0)} costs less for each ${S.one}.`
          : `${i === 1 ? 'Place 1 is' : `Places 1 to ${i} are`} right. For place ${i + 1} you chose ${lab(s)}, but ${lab(c0)} costs less for each ${S.one}.`);
        m += `<br>${cap(lab(s))}: ${S.work(s)}.<br>${cap(lab(c0))}: ${S.work(c0)}.<br>`;
        const bySize = S.items.map((_, k) => k).sort((x, y) => S.items[x].a - S.items[y].a), byPrice = S.items.map((_, k) => k).sort((x, y) => S.items[x].c - S.items[y].c);
        const sz = same(o, bySize) || same(o, [...bySize].reverse()), pr = same(o, byPrice);
        if (sz && pr) m += `It looks like you ranked by size or by total price. A bigger pack costs more in total, but it also holds more. Only the price for 1 ${S.one} compares them fairly.<br>`;
        else if (sz) m += `It looks like you ranked by size. Size alone does not decide the best buy. Compare the price for 1 ${S.one}.<br>`;
        else if (pr) m += `It looks like you ranked by total price. A small pack costs less in total because there is less in it. Compare the price for 1 ${S.one}.<br>`;
        shop.fb = m + `A lower price for 1 ${S.one} is a better buy. Tap one to take it back and try again.`;
      };
      const shopTap = i => {
        const S = SH();
        if (shop.done) return;
        if (S.kind === 'pick') {
          if (shop.wrong.has(i)) return;
          shop.revealed = new Set(S.items.map((_, k) => k));
          const f = S.verdict(i);
          if (f.ok) { shop.done = true; shop.pick = i; shop.fb = `${ok('Right.')} ${f.say}`; } else { shop.wrong.add(i); shop.fb = `${no('Not the best choice.')} ${f.say}`; }
        } else {
          const at = shop.ranks.indexOf(i);
          if (at >= 0) { shop.ranks.splice(at, 1); shop.fb = S.tip; }
          else { shop.ranks.push(i); shop.fb = shop.ranks.length < S.items.length ? `Ranked ${shop.ranks.length} of ${S.items.length}. Tap the next one, or tap a ranked item to take it back.` : ''; if (shop.ranks.length === S.items.length) evalRank(); }
        }
        upd(); showFb();
      };
      const nextShelf = () => { cancel(); startScene(SHELF_IDS[(SHELF_IDS.indexOf(st.scene) + 1) % SHELF_IDS.length]); sync(); };

      /* ---------- rate actions ---------- */
      const choose = i => {
        const K = TK(), s = SV(), o = K.ops[i];
        if (!s.solved && Math.abs(st.m - K.mark.target) > 1e-6) s.fb = `${no('First place the marker.')} Drag it to ${K.targetTxt} on the ${K.mark.on === 'top' ? K.top.cap : K.rows[K.mark.on].cap} line, or use the Marker slider. Then choose a calculation.`;
        else if (o.ok) { s.solved = true; s.fb = `${ok('Right.')} ${o.say}`; }
        else s.fb = `${no('Not quite.')} ${o.say}`;
        upd(); showFb();
      };
      const nextQ = () => {
        cancel(); const ids = st.mode === 'speed' ? SPEED_IDS : RATE_IDS, k = ids.indexOf(st.task);
        startTask(ids[(k + 1) % ids.length]); sync();
      };

      /* ---------- controls ---------- */
      const probe = C.readout(), host = probe.parentElement; probe.remove();
      const group = build => {
        const before = new Set(host.children); build();
        const g = h('div', { style: 'display:flex;flex-direction:column;gap:16px;flex:none' });
        [...host.children].filter(e => !before.has(e)).forEach(e => g.append(e));
        host.append(g); return g;
      };
      const markQ = () => { const K = TK(); return K.mark.on === 'top' ? K.top.q : K.rows[K.mark.on].q; };
      const small = b => Object.assign(b.style, { padding: '6px 14px', minHeight: '36px', fontSize: '.88rem' });
      let roR, roS, qSel, mS, mIn, opsTitle, opsBox, nextB, againB, tryB, shelfSel, helpT, itemBox, clearB, nextShelfB, itemBtns = [];

      C.title('Explore');
      const modeBtns = C.buttons([
        { label: 'Unit rate', onClick: () => setMode('rate') },
        { label: 'Best buy', onClick: () => setMode('shop') },
        { label: 'Speed', onClick: () => setMode('speed') }
      ]);
      modeBtns.forEach(small);

      const gRate = group(() => {
        qSel = C.select({ label: 'Question', value: '', options: [{ value: '', label: 'Pick a question' }], onChange: v => { if (v) { cancel(); startTask(v); sync(); } } });
        roR = C.readout();
        opsTitle = h('p', { class: 'ctl-title' }, 'Choose the calculation'); host.append(opsTitle);
        opsBox = h('div', { class: 'ctl buttons' }); host.append(opsBox);
        [nextB, againB, tryB] = C.buttons([
          { label: 'Next question', onClick: nextQ },
          { label: 'Start over', onClick: () => { cancel(); startTask(st.task); sync(); } },
          { label: 'Try the questions', primary: true, onClick: () => { cancel(); startTask(last[st.mode]); sync(); } }
        ]);
        [nextB, againB, tryB].forEach(small);
        mS = C.slider({ label: 'Marker', min: 0, max: 1, step: 1, value: 0, format: v => val(markQ(), v), onInput: v => { cancel(); st.m = clean(v); upd(); } });
        mIn = host.lastElementChild.querySelector('input');
        mIn.addEventListener('input', () => mIn.style.setProperty('--p', (mIn.value / mIn.max * 100) + '%'));
        C.hint('Drag the ring on the line, or use the Marker slider. The other line shows the matching amount.');
      });
      const gShop = group(() => {
        shelfSel = C.select({ label: 'Shelf', value: 'cereal', options: SHELF_IDS.map(id => ({ value: id, label: SHELF[id].name })), onChange: v => { cancel(); startScene(v); sync(); } });
        roS = C.readout();
        itemBox = h('div', { class: 'ctl buttons' }); host.append(itemBox);
        helpT = C.toggle({ label: 'Show unit prices (help)', value: false, onChange: v => { st.help = v; upd(); } });
        [clearB, nextShelfB] = C.buttons([
          { label: 'Clear my choices', onClick: () => { cancel(); startScene(st.scene); sync(); } },
          { label: 'Next shelf', onClick: nextShelf }
        ]);
        [clearB, nextShelfB].forEach(small);
        C.hint('Tap an item on the shelf, or use the buttons above.');
      });
      const ro = () => st.mode === 'shop' ? roS : roR;
      /* after the student acts, bring the explanation into view (the side panel is taller than most screens) */
      const showFb = () => { try { ro().scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' }); } catch (e) {} };

      const syncM = () => { mS.set(st.m); mIn.style.setProperty('--p', (st.m / mIn.max * 100) + '%'); };
      const fillQ = () => {
        const ids = st.mode === 'speed' ? SPEED_IDS : RATE_IDS;
        qSel.replaceChildren(h('option', { value: '' }, 'Pick a question'), ...ids.map((id, i) => h('option', { value: id }, `${i + 1}. ${TASKS[id].menu}`)));
        qSel.value = TK().demo ? '' : st.task;
      };
      const buildOps = () => {
        const K = TK(); opsBox.replaceChildren();
        opsTitle.style.display = opsBox.style.display = K.ops ? '' : 'none';
        (K.ops || []).forEach((o, i) => { const b = h('button', { type: 'button', class: 'btn primary', onclick: () => choose(i) }, o.t); small(b); opsBox.append(b); });
      };
      const buildItems = () => {
        const S = SH(); itemBox.replaceChildren(); itemBtns = [];
        S.items.forEach((it, i) => { const b = h('button', { type: 'button', class: 'btn', onclick: () => shopTap(i) }); small(b); itemBox.append(b); itemBtns.push(b); });
      };
      const updItems = () => {
        const S = SH();
        S.items.forEach((it, i) => {
          const rk = shop.ranks.indexOf(i), b = itemBtns[i];
          b.textContent = (rk >= 0 ? `${rk + 1}. ` : '') + `${S.tile(it.a)} · ${PR(it.c)}`;
          b.className = rk >= 0 || shop.pick === i ? 'btn primary' : 'btn';
          b.disabled = shop.done || shop.wrong.has(i);
        });
      };
      const build = () => {
        const rateish = st.mode !== 'shop', K = TK();
        modeBtns.forEach((b, i) => { const on = MODES[i] === st.mode; b.className = on ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', on); });
        gRate.style.display = rateish ? 'flex' : 'none';
        gShop.style.display = rateish ? 'none' : 'flex';
        if (rateish) {
          fillQ(); buildOps();
          mIn.min = 0; mIn.max = markK(K) * K.top.max; mIn.step = K.mark.step;
          nextB.style.display = againB.style.display = K.demo ? 'none' : '';
          tryB.style.display = K.demo ? '' : 'none';
        } else { buildItems(); shelfSel.value = st.scene; helpT.checked = st.help; }
      };
      const upd = () => {
        if (st.mode === 'shop') updItems();
        else { syncM(); nextB.className = SV().solved ? 'btn primary' : 'btn'; }
        P.draw(); ro().innerHTML = st.mode === 'shop' ? shopHTML() : rateHTML();
      };
      const sync = () => { build(); upd(); };
      const setMode = m => {
        if (m === st.mode) return;
        cancel();
        if (m === 'shop') startScene(st.scene); else startTask(last[m]);
        sync();
      };
      sync();

      /* ---------- pointer: drag the marker, tap a shelf item ---------- */
      draggable(P, {
        hit: (px, py) => {
          if (st.mode === 'shop') return null;
          const K = TK(), g = rateGeo(P, K);
          return Math.abs(py - g.ys[g.mi]) < 30 && px > g.xL - 20 && px < g.xR + 20 ? 'm' : null;
        },
        move: (hd, x) => {
          cancel();
          const K = TK(), g = rateGeo(P, K), px = P.X(x), mx = g.kM * K.top.max;
          st.m = clamp(clean(snap((px - g.xL) / (g.xR - g.xL) * mx, K.mark.step)), 0, mx);
          upd();
        }
      });
      const tileAt = e => { const r = P.canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top; return rects.findIndex(([x, y, w, hh]) => px >= x && px <= x + w && py >= y && py <= y + hh); };
      P.canvas.addEventListener('click', e => { if (st.mode !== 'shop') return; const i = tileAt(e); if (i >= 0) shopTap(i); });
      P.canvas.addEventListener('pointermove', e => { if (st.mode === 'shop') P.canvas.style.cursor = tileAt(e) >= 0 && !shop.done ? 'pointer' : 'default'; });

      /* ---------- guided steps ---------- */
      const apply = (patch, immediate) => {
        cancel();
        const { mode, task, scene, cards, help, m } = patch;
        if (mode !== undefined) st.mode = mode;
        if (task !== undefined) startTask(task);
        if (scene !== undefined) startScene(scene);
        if (cards !== undefined) st.cards = cards;
        if (help !== undefined) st.help = help;
        const to = m !== undefined ? m : st.m;
        if (immediate || m === undefined) { st.m = to; sync(); return; }
        sync();
        cancel = animateTo(st, { m: to }, 800, () => { P.draw(); syncM(); }, upd);
      };
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
