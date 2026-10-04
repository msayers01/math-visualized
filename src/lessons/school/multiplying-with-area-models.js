/* =====================================================================
   SCHOOL — Multiplying with area models
   ===================================================================== */
{
  const FONT = '"Hanken Grotesk","Helvetica Neue",Arial,sans-serif';
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const gr = t => `<b style="color:var(--green)">${t}</b>`;
  const rd = t => `<b style="color:var(--red)">${t}</b>`;
  /* split n at c: one part when there is no cut (c >= n), otherwise c and n - c */
  const parts = (n, c) => (c >= n ? [n] : [c, n - c]);
  const OPTS = [[13, 6], [24, 5], [12, 14], [23, 21], [35, 4], [42, 3], [15, 12], [34, 22]];

  /* ---------- practice problems (a fixed list) ---------- */
  const PR = [
    { kind: 'cut', a: 24, b: 5, ca: 24, cb: 5, want: [20, 5],
      q: 'A mat is 24 tiles wide and 5 tiles tall. Cut the width 24 into tens and ones. Use the violet handle or the buttons. Then press Check.',
      okMsg: '24 = 20 + 4. The pieces are 20 × 5 = 100 and 4 × 5 = 20. Both are easy to do.' },
    { kind: 'ch', a: 13, b: 6, ca: 10, cb: 6, hide: 1,
      q: 'The rectangle for 13 × 6 is cut into 10 + 3. What is the area of the small piece, 3 wide and 6 tall?',
      ch: [['63', '63 is 60 + 3. You added the 3. The small piece is 3 columns of 6 tiles, so multiply: 3 × 6.'],
           ['36', '36 is 6 × 6. The small piece is 3 wide, not 6 wide.'],
           ['9', '9 is 3 + 6. Area counts tiles, so we multiply. The piece has 6 rows of 3 tiles.'],
           ['18', '3 × 6 = 18. The big piece is 10 × 6 = 60, and 60 + 18 = 78.']], ans: 3 },
    { kind: 'ch', a: 24, b: 5, ca: 20, cb: 5, hide: -1,
      q: '24 × 5 is cut into 20 + 4. The pieces are 20 × 5 = 100 and 4 × 5 = 20. What is 24 × 5?',
      ch: [['29', '29 is 24 + 5. The answer to a multiplication is the whole area, so add the two pieces: 100 and 20.'],
           ['100', '100 is only the big piece. The small piece, 20, is part of the rectangle too.'],
           ['120', '100 + 20 = 120. The two pieces fill the whole rectangle, so their areas add.'],
           ['104', '104 is 100 + 4. The small piece is 4 × 5 = 20, not 4.']], ans: 2 },
    { kind: 'cut2', a: 12, b: 14, ca: 12, cb: 14, want: [10, 10],
      q: 'A rectangle is 12 wide and 14 tall. Cut BOTH numbers into tens and ones. Then press Check.',
      okMsg: '12 = 10 + 2 and 14 = 10 + 4. The four pieces are 10 × 10 = 100, 2 × 10 = 20, 10 × 4 = 40 and 2 × 4 = 8.' },
    { kind: 'ch', a: 12, b: 14, ca: 10, cb: 10, hide: 3,
      q: 'The pieces of 12 × 14 are 100, 20 and 40. The last piece is 2 wide and 4 tall. What is its area?',
      ch: [['6', '6 is 2 + 4. Multiply instead: the piece has 4 rows of 2 tiles.'],
           ['8', '2 × 4 = 8. All four pieces: 100 + 20 + 40 + 8 = 168.'],
           ['24', '24 puts the digits 2 and 4 side by side. Multiply them: 2 × 4.'],
           ['42', '42 puts the digits 4 and 2 side by side. Multiply them: 4 × 2.']], ans: 1 },
    { kind: 'ch', a: 23, b: 21, ca: 20, cb: 20, hide: -1,
      q: 'Sam finds 23 × 21 with four pieces. Sam writes 400 + 3 = 403. Which pieces did Sam leave out?',
      ch: [['The pieces 3 × 20 = 60 and 20 × 1 = 20', 'Sam used 20 × 20 = 400 and 3 × 1 = 3. The other two pieces are 3 × 20 = 60 and 20 × 1 = 20. 400 + 60 + 20 + 3 = 483.'],
           ['Only the piece 3 × 1', 'Sam did use 3 × 1 = 3. Look at the two pieces that are not 20 × 20 or 3 × 1.'],
           ['Nothing. 403 is right.', 'Four pieces make the whole rectangle. Sam added only two, so the rectangle is not all counted.'],
           ['Sam should add 21 as well', 'Adding 21 is a guess. Each piece has an area to add. Find the two missing pieces.']], ans: 0 },
    { kind: 'ch', a: 15, b: 12, ca: 15, cb: 10, hide: -1,
      q: 'You can cut just one side. 15 × 12 is cut into 15 × 10 and 15 × 2. The pieces are 150 and 30. What is 15 × 12?',
      ch: [['152', '152 is 150 + 2. The small piece is 15 × 2 = 30, not 2.'],
           ['165', '165 is 150 + 15. The small piece is 15 wide and 2 tall, so it is 15 × 2 = 30.'],
           ['180', '150 + 30 = 180. Cutting only the height still gives two pieces that fill the rectangle.'],
           ['30', '30 is only the small piece. Add the big piece, 150, too.']], ans: 2 }
  ];

  register({
    id: 'multiplying-with-area-models', level: 'school',
    title: 'Multiplying with area models',
    blurb: 'Cut a rectangle into easy pieces, find each piece, and add them to multiply bigger numbers.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 7; p.cy = -4; p.span = 9;
      const X = [0, 10, 14], Y = [0, 5, 8], fill = [.34, .18, .18, .34];
      for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++)
        p.path([[X[i], -Y[j]], [X[i + 1], -Y[j]], [X[i + 1], -Y[j + 1]], [X[i], -Y[j + 1]]], { fill: alpha(pal.yellow, fill[j * 2 + i]), close: true });
      p.path([[0, 0], [14, 0], [14, -8], [0, -8]], { stroke: pal.text, width: 2, close: true });
      p.path([[10, 0], [10, -8]], { stroke: pal.violet, width: 2.5, dash: [6, 4] });
      p.path([[0, -5], [14, -5]], { stroke: pal.violet, width: 2.5, dash: [6, 4] });
      p.path([[.3, .9], [9.7, .9]], { stroke: pal.green, width: 3 });
      p.path([[10.3, .9], [13.7, .9]], { stroke: pal.green, width: 3 });
      p.path([[-.9, -.3], [-.9, -4.7]], { stroke: pal.red, width: 3 });
      p.path([[-.9, -5.3], [-.9, -7.7]], { stroke: pal.red, width: 3 });
      const o = { size: 17, italic: false };
      p.label('10', 5, 1.9, Object.assign({ color: pal.green }, o)); p.label('4', 12, 1.9, Object.assign({ color: pal.green }, o));
      p.label('5', -1.9, -2.5, Object.assign({ color: pal.red }, o)); p.label('3', -1.9, -6.5, Object.assign({ color: pal.red }, o));
    },
    hook: 'A hall has 14 rows of chairs, and each row has 12 chairs. How can you find the total without counting every chair?',
    steps: [
      { title: 'A rectangle of tiles',
        text: String.raw`<p>Picture a floor of tiles. It is 13 tiles <b>wide</b> and 6 tiles <b>tall</b>. The <b>area</b> is how many tiles cover the floor. That is 13 × 6.</p><p>13 × 6 is hard to do in your head. So let us cut the rectangle into easy pieces.</p>`,
        set: { a: 13, b: 6, ca: 13, cb: 6, pred: 0 } },
      { title: 'Cut into tens and ones',
        text: String.raw`<p>Cut 13 into 10 and 3. That is tens and ones. The rectangle splits into two pieces.</p><p>Each piece has an area. We call it a <b>partial product</b>. 10 × 6 = 60 and 3 × 6 = 18. Add the pieces: 60 + 18 = 78.</p><p>Try a different cut with the violet handle.</p>`,
        set: { a: 13, b: 6, ca: 10, cb: 6, pred: 0 } },
      { title: 'Predict, then see',
        text: String.raw`<p>Now 12 × 14. Both numbers have two digits. We will cut 12 into 10 + 2 and 14 into 10 + 4.</p><p>First guess in the panel: how many pieces will the rectangle have? Then watch the cuts. The pieces add up to 168.</p>`,
        set: { a: 12, b: 14, ca: 12, cb: 14, pred: 1 } },
      { title: 'You choose the cuts',
        text: String.raw`<p>Here is 23 × 21. The cuts are at 20 and 20. The four pieces are 400, 60, 20 and 3. They add up to 483.</p><p>Now you choose. Move a cut, like 10 + 13. The pieces change. Does the total change?</p>`,
        set: { a: 23, b: 21, ca: 20, cb: 20, pred: 0 } }
    ],
    formal: String.raw`
      <h3>What an area model shows</h3>
      <p>A multiplication such as 13 × 6 is the <em>area</em> of a rectangle. The rectangle is 13 units wide and 6 units tall. The area is the number of unit squares inside it.</p>
      <h3>Split by place value</h3>
      <p>We can cut a number into its tens and its ones. This is called splitting by <em>place value</em>. 13 is 1 ten and 3 ones, so 13 = 10 + 3. 24 is 2 tens and 4 ones, so 24 = 20 + 4.</p>
      <h3>A worked example: 13 × 6</h3>
      <p>Cut the width 13 into 10 + 3. The rectangle has two pieces. The big piece is 10 × 6 = 60. The small piece is 3 × 6 = 18. These are the <em>partial products</em>. Add them: 60 + 18 = 78. So 13 × 6 = 78.</p>
      <h3>Two two-digit numbers: 12 × 14</h3>
      <p>Cut both numbers: 12 = 10 + 2 and 14 = 10 + 4. Now there are four pieces, like four windowpanes.</p>
      <p>10 × 10 = 100, 2 × 10 = 20, 10 × 4 = 40 and 2 × 4 = 8. Add them: 100 + 20 + 40 + 8 = 168. So 12 × 14 = 168.</p>
      <h3>Why it works</h3>
      <p>Cutting a rectangle does not change how many tiles it has. The pieces together cover exactly the same floor. So the areas of the pieces add up to the area of the whole rectangle. Every tile is in exactly one piece.</p>
      <h3>Any cut works</h3>
      <p>You can cut 13 into 10 + 3, or 6 + 7, or 5 + 8. The total is always 78. We like tens and ones because the pieces are easy to multiply, like 10 × 6 = 60.</p>
      <h3>Keep the pieces in order</h3>
      <p>Each piece is its width times its height. If you forget a piece, the total is too small. Count the pieces: one cut across and one cut down make 2 × 2 = 4 pieces.</p>`,
    check: [
      { q: 'Maya cuts the rectangle for 14 × 6 into a 10 × 6 piece and a 4 × 6 piece. She adds the two areas to get the answer. Why does this give 14 × 6?',
        choices: ['Because 10 + 4 = 14, so she only needs to add 10 and 4',
                  'Because cutting makes the rectangle smaller, so the answer is too small',
                  'Because the two pieces together cover the whole rectangle, so their areas add up to its area',
                  'Because she should only multiply the biggest piece by 6'], answer: 2,
        why: 'Cutting does not take any tiles away. Every tile is in one of the two pieces. So 10 × 6 = 60 and 4 × 6 = 24 add up to the whole: 60 + 24 = 84.',
        hint: 'Think about the tiles. Does cutting a floor into two parts change how many tiles are on it?' },
      { q: 'Ana finds 21 × 13 with an area model. She cuts 21 into 20 + 1 and 13 into 10 + 3. That makes four pieces. What is 21 × 13?',
        choices: ['203', '273', '263', '213'], answer: 1,
        why: 'The four pieces are 20 × 10 = 200, 1 × 10 = 10, 20 × 3 = 60 and 1 × 3 = 3. Add them: 200 + 10 + 60 + 3 = 273. The other answers leave out a piece.',
        hint: 'Write all four products first: 20 × 10, 1 × 10, 20 × 3 and 1 × 3. Then add.' },
      { q: 'Leo finds 14 × 12 like this. 10 × 10 = 100. 4 × 2 = 8. Then 100 + 8 = 108. What is wrong?',
        choices: ['He should add 10 + 10 + 4 + 2 instead',
                  '14 is not the same as 10 + 4',
                  'He did not need to multiply at all',
                  'He left out two pieces, 10 × 2 = 20 and 4 × 10 = 40. The answer is 168'], answer: 3,
        why: 'Cutting 14 into 10 + 4 and 12 into 10 + 2 makes four pieces. Leo found only two. The missing pieces are 10 × 2 = 20 and 4 × 10 = 40. 100 + 8 + 20 + 40 = 168.',
        hint: 'Two cuts make four pieces. How many pieces did Leo use?' }
    ],
    links: { related: ['area-by-decomposition', 'decimals-and-place-value', 'ratios-and-equivalent-ratios'] },

    mount({ stage, controls: C }) {
      const panel = stage.nextElementSibling;
      const st = { a: 13, b: 6, ca: 13, cb: 6, pred: 0, practice: false };
      const v = { ca: 13, cb: 6 };             /* what the canvas shows (animated) */
      let cancel = () => {}, lay = null, guessed = false, saved = null;
      const P = new Plane(stage, { span: 8 });

      const cols = () => parts(st.a, st.ca), rows = () => parts(st.b, st.cb);
      const pieces = () => {
        const out = [];
        rows().forEach(rh => cols().forEach(cw => out.push({ w: cw, h: rh, p: cw * rh })));
        return out;
      };
      const locked = () => st.pred === 1 && !guessed && !st.practice;

      /* practice state */
      let prIdx = 0, prSolved = false, prTried = false, prFirst = 0, prDone = 0;
      const pr = () => PR[prIdx];

      const can = () => {
        if (st.practice) { const k = pr().kind; return { w: (k === 'cut' || k === 'cut2') && !prSolved, h: k === 'cut2' && !prSolved }; }
        if (locked()) return { w: false, h: false };
        return { w: st.a >= 2, h: st.b >= 2 };
      };

      /* ---------- drawing ---------- */
      const tx = (c, p, t, x, y, o = {}) => {
        c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot);
        c.font = `${o.w || 600} ${o.px || 14}px ${FONT}`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
        if (o.halo !== false) { c.lineWidth = 4; c.lineJoin = 'round'; c.strokeStyle = p.pal.stage; c.strokeText(t, 0, 0); }
        c.fillStyle = o.color || p.pal.text; c.fillText(t, 0, 0); c.restore();
      };
      const mw = (c, t, px, w = 600) => { c.font = `${w} ${px}px ${FONT}`; return c.measureText(t).width; };

      const captionText = () => {
        const { a, b } = st, ps = pieces();
        if (st.practice && !prSolved) {
          const q = pr(), hide = q.hide ?? -1;
          if (q.kind === 'cut' || q.kind === 'cut2') return `${a} × ${b} = ?`;
          return `${a} × ${b} = ` + ps.map((x, i) => (i === hide ? '?' : x.p)).join(' + ') + ' = ?';
        }
        if (ps.length === 1) return `${a} × ${b} = ?`;
        return `${a} × ${b} = ` + ps.map(x => x.p).join(' + ') + ` = ${a * b}`;
      };

      P.onDraw = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, small = W < 520;
        const px = small ? 14 : 17, a = st.a, b = st.b;
        const ml = small ? 68 : 92, mr = small ? 14 : 30, mt = small ? 70 : 90, mb = small ? 42 : 56;
        const s = Math.max(4, Math.min((W - ml - mr) / a, (H - mt - mb) / b, 48));
        const L = ml + (W - ml - mr - a * s) / 2, T = mt + (H - mt - mb - b * s) / 2;
        lay = { L, T, s };
        p.span = Math.min(W, H) / (2 * s); p.cx = (W / 2 - L) / s; p.cy = (T - H / 2) / s;
        const cutW = v.ca < a - .001, cutH = v.cb < b - .001;
        const xs = cutW ? [0, v.ca, a] : [0, a], ys = cutH ? [0, v.cb, b] : [0, b];
        const settled = Math.abs(v.ca - st.ca) < .01 && Math.abs(v.cb - st.cb) < .01;
        const hide = st.practice && !prSolved ? (pr().hide ?? -1) : -1;
        const R = L + a * s, B = T + b * s;

        /* pieces */
        for (let j = 0; j < ys.length - 1; j++) for (let i = 0; i < xs.length - 1; i++) {
          const x0 = L + xs[i] * s, x1 = L + xs[i + 1] * s, y0 = T + ys[j] * s, y1 = T + ys[j + 1] * s;
          c.fillStyle = alpha(pal.yellow, (i + j) % 2 ? .18 : .34); c.fillRect(x0, y0, x1 - x0, y1 - y0);
        }
        /* unit squares */
        if (s >= 9) {
          c.strokeStyle = alpha(pal.muted, .35); c.lineWidth = 1; c.beginPath();
          for (let k = 1; k < a; k++) { c.moveTo(L + k * s, T); c.lineTo(L + k * s, B); }
          for (let k = 1; k < b; k++) { c.moveTo(L, T + k * s); c.lineTo(R, T + k * s); }
          c.stroke();
        }
        c.strokeStyle = pal.text; c.lineWidth = 2.5; c.strokeRect(L, T, a * s, b * s);
        /* cuts */
        c.setLineDash([7, 5]); c.strokeStyle = pal.violet; c.lineWidth = 3;
        if (cutW) { c.beginPath(); c.moveTo(L + v.ca * s, T); c.lineTo(L + v.ca * s, B); c.stroke(); }
        if (cutH) { c.beginPath(); c.moveTo(L, T + v.cb * s); c.lineTo(R, T + v.cb * s); c.stroke(); }
        c.setLineDash([]);

        /* piece labels */
        if (settled) {
          const ps = pieces(); let k = 0;
          for (let j = 0; j < ys.length - 1; j++) for (let i = 0; i < xs.length - 1; i++, k++) {
            const q = ps[k]; if (!q) continue;
            const x0 = L + xs[i] * s, x1 = L + xs[i + 1] * s, y0 = T + ys[j] * s, y1 = T + ys[j + 1] * s;
            const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, wpx = x1 - x0 - 6, hpx = y1 - y0 - 4;
            const prod = k === hide || ps.length === 1 ? '?' : String(q.p), lead = `${q.w} × ${q.h}`;
            const full = `${lead} = ${prod}`;
            if (hpx >= px + 2 && mw(c, full, px) <= wpx) tx(c, p, full, cx, cy, { px, halo: false });
            else if (hpx >= 2 * px + 4 && mw(c, lead, px) <= wpx) { tx(c, p, lead, cx, cy - px * .62, { px, halo: false }); tx(c, p, '= ' + prod, cx, cy + px * .62, { px, halo: false }); }
            else if (hpx >= px && mw(c, prod, px) <= wpx) tx(c, p, prod, cx, cy, { px, halo: false });
          }
        }

        /* the numbers across the top (green) and down the side (red) */
        const brk = (x0, x1, y, col) => {
          c.strokeStyle = col; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath();
          c.moveTo(x0 + 2, y + 5); c.lineTo(x0 + 2, y); c.lineTo(x1 - 2, y); c.lineTo(x1 - 2, y + 5); c.stroke();
        };
        const brkV = (y0, y1, x, col) => {
          c.strokeStyle = col; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath();
          c.moveTo(x + 5, y0 + 2); c.lineTo(x, y0 + 2); c.lineTo(x, y1 - 2); c.lineTo(x + 5, y1 - 2); c.stroke();
        };
        const cw = parts(a, st.ca), ch = parts(b, st.cb);
        if (settled) {
          const ex = cw.length > 1 ? [0, st.ca, a] : [0, a], ey = ch.length > 1 ? [0, st.cb, b] : [0, b];
          cw.forEach((n, i) => {
            const x0 = L + ex[i] * s, x1 = L + ex[i + 1] * s;
            brk(x0, x1, T - 14, pal.green); tx(c, p, String(n), (x0 + x1) / 2, T - 28, { px: px + 1, color: pal.green });
          });
          ch.forEach((n, j) => {
            const y0 = T + ey[j] * s, y1 = T + ey[j + 1] * s;
            brkV(y0, y1, L - 14, pal.red); tx(c, p, String(n), L - 22, (y0 + y1) / 2, { px: px + 1, color: pal.red, align: 'right' });
          });
          if (cw.length > 1) tx(c, p, `${a} = ${cw.join(' + ')}`, (L + R) / 2, T - 52, { px: px + 1, color: pal.green });
          if (ch.length > 1) tx(c, p, `${b} = ${ch.join(' + ')}`, L - (small ? 52 : 58), (T + B) / 2, { px: px + 1, color: pal.red, rot: -Math.PI / 2 });
        }

        /* caption at the bottom */
        let cap = captionText(), cpx = px + 1;
        {
          while (cpx > 12 && mw(c, cap, cpx, 700) > W - 12) cpx--;
          if (mw(c, cap, cpx, 700) > W - 12) cap = cap.replace(/^[^=]*= /, '');
          if (settled) tx(c, p, cap, W / 2, H - mb / 2 + 2, { px: cpx, w: 700 });
        }

        /* handles */
        const cn = can();
        const ring = (x, y) => { c.beginPath(); c.arc(x, y, 12, 0, TAU); c.fillStyle = pal.stage; c.fill(); c.lineWidth = 3; c.strokeStyle = pal.brass; c.stroke(); c.beginPath(); c.arc(x, y, 4, 0, TAU); c.fillStyle = pal.violet; c.fill(); };
        if (cn.w) ring(L + v.ca * s, T);
        if (cn.h) ring(L, T + v.cb * s);
      };

      /* ---------- the side panel ---------- */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', style: 'min-height:44px', onclick: onClick }, label);
      const addTo = (...els) => panel.append(...els);
      let ro, sel, pcutRows, wRow, hRow, presetRow, startBtn, ptally, pq, pch, pfb, pnext, pcheck, predBtns, predFb;

      const moveShown = ms => { cancel(); cancel = animateTo(v, { ca: st.ca, cb: st.cb }, ms, () => P.draw()); };
      const clearFb = () => { if (pfb) pfb.innerHTML = ''; };

      const readout = () => {
        const { a, b } = st, cs = cols(), rs = rows(), ps = pieces();
        const wT = cs.length > 1 ? `${a} = ${cs.join(' + ')}` : String(a);
        const hT = rs.length > 1 ? `${b} = ${rs.join(' + ')}` : String(b);
        const head = `<span class="k">Width</span> ${gr(wT)}<br><span class="k">Height</span> ${rd(hT)}<br>`;
        if (locked()) return head + `One big piece: ${a} × ${b}.<br>Pick a prediction first. Then the cuts appear.`;
        if (ps.length === 1) return head + `One big piece: ${a} × ${b}. That is hard to do in your head.<br>Cut the rectangle into easier pieces.`;
        const need = [[a, st.ca], [b, st.cb]].filter(([n, c]) => n >= 10 && c >= n).map(x => x[0]);
        const ok = [[a, st.ca], [b, st.cb]].every(([n, c]) => (n >= 10 ? c < n && c % 10 === 0 : c >= n));
        const note = need.length ? `Tip: cut ${need.join(' and ')} into tens and ones.`
          : ok ? 'Tens and ones. Every piece is easy to multiply.'
          : `This cut works too. The total is still ${a * b}. Tens and ones make the easiest pieces.`;
        return head + `<span class="k">Partial products</span><br>` + ps.map(x => `${x.w} × ${x.h} = ${x.p}`).join('<br>') +
          `<br><b>Add: ${ps.map(x => x.p).join(' + ')} = ${a * b}</b><br>${note}`;
      };

      const sync = () => {
        const cn = can(), prac = st.practice;
        vis(G.lesson, !prac); vis(G.pred, !prac && st.pred === 1); vis(G.practice, prac);
        const k = prac ? pr().kind : '';
        vis(G.cuts, prac ? (k === 'cut' || k === 'cut2') : true);
        if (prac ? (k === 'cut' || k === 'cut2') : true) { vis([hRow], prac ? k === 'cut2' : true); vis([presetRow], !prac); }
        wRow.querySelectorAll('button').forEach(e => { e.disabled = !cn.w; });
        hRow.querySelectorAll('button').forEach(e => { e.disabled = !cn.h; });
        presetRow.querySelectorAll('button').forEach(e => { e.disabled = locked(); });
        const key = st.a + 'x' + st.b; if (sel && sel.value !== key && OPTS.some(o => o[0] + 'x' + o[1] === key)) sel.value = key;
        ro.innerHTML = prac ? '' : readout();
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        P.draw();
      };

      /* ----- lesson controls ----- */
      grp('lesson', () => {
        C.title('The numbers');
        sel = C.select({ label: 'Multiply', value: '13x6', options: OPTS.map(o => ({ value: o[0] + 'x' + o[1], label: `${o[0]} × ${o[1]}` })),
          onChange: val => { const [a, b] = val.split('x').map(Number); cancel(); Object.assign(st, { a, b, ca: a, cb: b, pred: 0 }); v.ca = a; v.cb = b; sync(); } });
        ro = C.readout();
      });

      grp('pred', () => {
        const row = h('div', { class: 'ctl buttons' }); predFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        const opts = [['2 pieces', 'Not quite. Each number is cut once, and each cut makes 2 parts. 2 parts across and 2 parts down make 2 × 2 = 4 pieces.'],
          ['3 pieces', 'Not quite. Think of a window with 2 columns and 2 rows. That is 4 panes, not 3.'],
          ['4 pieces', good('Yes.') + ' 2 columns and 2 rows make 4 pieces, like 4 windowpanes.']];
        predBtns = opts.map((o, i) => mkBtn(o[0], () => {
          if (guessed) return; guessed = true;
          predBtns.forEach((b, j) => { b.disabled = true; if (j === i) b.classList.add('primary'); });
          predFb.innerHTML = o[1] + ' Now the cuts appear: 12 = 10 + 2 and 14 = 10 + 4.';
          st.ca = 10; st.cb = 10; sync(); moveShown(900);
        }));
        row.append(...predBtns);
        addTo(h('p', { class: 'ctl-title' }, 'Predict first'), h('p', { class: 'hint' }, 'We cut 12 into tens and ones, and 14 into tens and ones. How many pieces will the rectangle have?'), row, predFb);
      });

      const cutW = d => { if (!can().w) return; cancel(); st.ca = clamp(st.ca + d, 1, st.a); clearFb(); sync(); moveShown(280); };
      const cutH = d => { if (!can().h) return; cancel(); st.cb = clamp(st.cb + d, 1, st.b); clearFb(); sync(); moveShown(280); };
      grp('cuts', () => {
        C.title('Move the cuts');
        wRow = C.buttons([{ label: '◀ Width cut left', onClick: () => cutW(-1) }, { label: 'Width cut right ▶', onClick: () => cutW(1) }])[0].parentElement;
        hRow = C.buttons([{ label: '▲ Height cut up', onClick: () => cutH(-1) }, { label: '▼ Height cut down', onClick: () => cutH(1) }])[0].parentElement;
        presetRow = C.buttons([
          { label: 'Tens and ones', primary: true, onClick: () => {
            if (locked()) return; cancel();
            st.ca = st.a >= 10 ? Math.floor(st.a / 10) * 10 : st.a; st.cb = st.b >= 10 ? Math.floor(st.b / 10) * 10 : st.b;
            sync(); moveShown(600); } },
          { label: 'No cuts', onClick: () => { if (locked()) return; cancel(); st.ca = st.a; st.cb = st.b; sync(); moveShown(600); } }])[0].parentElement;
        wRow.querySelectorAll('button').forEach(e => { e.style.minHeight = '44px'; });
        hRow.querySelectorAll('button').forEach(e => { e.style.minHeight = '44px'; });
        presetRow.querySelectorAll('button').forEach(e => { e.style.minHeight = '44px'; });
        C.hint('Drag a violet handle, or use the buttons. A cut at the far end means no cut.');
      });

      /* ----- practice ----- */
      C.title('Practice');
      C.hint('Seven short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => {
        cancel();
        if (st.practice) {
          st.practice = false; if (saved) { Object.assign(st, saved); v.ca = st.ca; v.cb = st.cb; } sync();
        } else {
          saved = { a: st.a, b: st.b, ca: st.ca, cb: st.cb, pred: st.pred };
          st.practice = true; prIdx = 0; prFirst = 0; prDone = 0; loadProb(); sync();
        }
      } }])[0];
      startBtn.style.minHeight = '44px';
      grp('practice', () => {
        const wrap = h('div', { style: 'display:flex;flex-direction:column;gap:14px' });
        ptally = h('p', { class: 'ctl-title' });
        pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        pch = h('div', { class: 'ctl buttons', style: 'flex-direction:column;align-items:stretch' });
        pcheck = mkBtn('Check', () => checkCut(), true);
        pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pnext = mkBtn('Next problem', () => nextProb(), true);
        wrap.append(ptally, pq, pch, h('div', { class: 'ctl buttons' }, pcheck), pfb, h('div', { class: 'ctl buttons' }, pnext)); addTo(wrap);
      });

      const tally = () => { ptally.textContent = `Problem ${prIdx + 1} of ${PR.length}. Right on the first try: ${prFirst} of ${prDone} done`; };
      const loadProb = () => {
        const q = pr(); prSolved = false; prTried = false; cancel();
        Object.assign(st, { a: q.a, b: q.b, ca: q.ca, cb: q.cb, pred: 0 }); v.ca = q.ca; v.cb = q.cb;
        pq.textContent = q.q; pfb.innerHTML = ''; pch.replaceChildren(); pnext.disabled = true;
        pnext.textContent = prIdx === PR.length - 1 ? 'Finish' : 'Next problem';
        const isCut = q.kind === 'cut' || q.kind === 'cut2';
        pcheck.parentElement.style.display = isCut ? '' : 'none'; pcheck.disabled = false;
        pch.style.display = isCut ? 'none' : '';
        if (!isCut) q.ch.forEach((o, i) => pch.append(mkBtn(o[0], () => pickChoice(i))));
        tally();
      };
      const finishOne = () => {
        prSolved = true; if (!prTried) prFirst++; prDone++; pnext.disabled = false; pcheck.disabled = true; tally(); sync();
      };
      const pickChoice = i => {
        const q = pr(); if (prSolved) return;
        const btn = pch.children[i];
        if (i === q.ans) {
          Array.from(pch.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary');
          pfb.innerHTML = good('Right.') + ' ' + q.ch[i][1]; finishOne();
        } else {
          prTried = true; btn.disabled = true; pfb.innerHTML = bad('Not quite.') + ' ' + q.ch[i][1] + ' Try another answer.';
        }
      };
      const checkCut = () => {
        const q = pr(); if (prSolved) return;
        const bits = [];
        const side = (n, c, want, name) => {
          if (c === want) return true;
          if (c >= n) bits.push(`The ${name} ${n} is not cut yet. Cut it into ${want} + ${n - want}.`);
          else bits.push(`You cut the ${name} ${n} into ${c} + ${n - c}. That works, but it is not tens and ones. Tens and ones is ${want} + ${n - want}.`);
          return false;
        };
        const okW = side(q.a, st.ca, q.want[0], 'width');
        const okH = q.kind === 'cut2' ? side(q.b, st.cb, q.want[1], 'height') : true;
        if (okW && okH) { pfb.innerHTML = good('Yes.') + ' ' + q.okMsg; finishOne(); }
        else { prTried = true; pfb.innerHTML = bad('Not yet.') + ' ' + bits.join(' ') + ' Move the cut and check again.'; }
      };
      const nextProb = () => {
        if (prIdx === PR.length - 1 && prSolved && pnext.textContent === 'Finish') {
          pfb.innerHTML = good('All done.') + ` You got ${prFirst} of ${PR.length} right on the first try. Press the button to try again.`;
          pnext.textContent = 'Practice again'; pnext.onclick = () => { pnext.onclick = () => nextProb(); prIdx = 0; prFirst = 0; prDone = 0; loadProb(); sync(); };
          return;
        }
        prIdx = Math.min(prIdx + 1, PR.length - 1); loadProb(); sync();
      };

      /* ----- dragging ----- */
      draggable(P, {
        hit: (px, py) => {
          if (!lay) return null; const cn = can();
          if (cn.w && Math.hypot(px - (lay.L + v.ca * lay.s), py - lay.T) < 24) return 'W';
          if (cn.h && Math.hypot(px - lay.L, py - (lay.T + v.cb * lay.s)) < 24) return 'H';
          return null;
        },
        move: (id, x, y) => {
          cancel();
          if (id === 'W') st.ca = clamp(Math.round(x), 1, st.a);
          else st.cb = clamp(Math.round(-y), 1, st.b);
          v.ca = st.ca; v.cb = st.cb; clearFb(); sync();
        }
      });

      const apply = (patch, immediate) => {
        cancel();
        const wasPrac = st.practice; st.practice = false;
        const sameSize = patch.a === st.a && patch.b === st.b;
        for (const k of ['a', 'b', 'ca', 'cb', 'pred']) if (k in patch) st[k] = patch[k];
        if (st.pred === 1) { guessed = false; if (predBtns) { predBtns.forEach(b => { b.disabled = false; b.classList.remove('primary'); }); predFb.innerHTML = ''; } }
        if (immediate || !sameSize || wasPrac) { v.ca = st.ca; v.cb = st.cb; sync(); } else { sync(); moveShown(700); }
      };
      sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
