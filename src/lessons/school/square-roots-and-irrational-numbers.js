/* =====================================================================
   SCHOOL — Square roots and irrational numbers
   ===================================================================== */
{
  const MAXN = 50;
  const TICKS = ['1', '0.1', '0.01', '0.001'];
  const NAMES = ['whole numbers', 'tenths', 'hundredths', 'thousandths'];
  const pow10 = z => Math.pow(10, z);
  /* floor of the square root of a (safe) integer */
  const isqrt = N => { let k = Math.floor(Math.sqrt(N)); while (k * k > N) k--; while ((k + 1) * (k + 1) <= N) k++; return k; };
  /* integer v written with p decimal places: dec(1414, 3) = "1.414" */
  const dec = (v, p) => { if (!p) return String(v); const s = String(v).padStart(p + 1, '0'); return s.slice(0, -p) + '.' + s.slice(-p); };
  const trim = s => s.indexOf('.') < 0 ? s : s.replace(/0+$/, '').replace(/\.$/, '');
  /* The decimals at zoom z (ticks every 10^-z) that squeeze the square root of n:
     k/10^z <= sqrt(n) < (k+1)/10^z. `exact` means sqrt(n) is exactly k/10^z (a perfect square). */
  const brk = (n, z) => { const N = n * pow10(2 * z), k = isqrt(N); return { k, exact: k * k === N }; };

  /* first 12 digits of the square root of n (n < 100): one integer digit, then 11 decimals; computed with BigInt */
  const DIG = {};
  const digitsOf = n => {
    if (DIG[n]) return DIG[n];
    if (typeof BigInt !== 'function') return String(Math.floor(Math.sqrt(n) * 1e11)).padStart(12, '0');   /* very old browsers: doubles are accurate enough for 12 digits */
    const N = BigInt(n) * BigInt(10) ** BigInt(22), one = BigInt(1), two = BigInt(2);
    let x = BigInt(Math.ceil(Math.sqrt(Number(N)))) + two;
    for (;;) { const y = (x + N / x) / two; if (y >= x) break; x = y; }
    while (x * x > N) x -= one;
    while ((x + one) * (x + one) <= N) x += one;
    return (DIG[n] = String(x));
  };

  const font = (size, weight = 500) => `${weight} ${size}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`;
  /* pixel-positioned text with a halo in the stage color */
  const T = (c, p, str, x, y, { size = 13, color, align = 'left', weight = 500, a = 1, halo = true } = {}) => {
    if (a <= .01) return;
    c.save(); c.globalAlpha = a; c.font = font(size, weight); c.textAlign = align; c.textBaseline = 'middle';
    if (halo) { c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(str, x, y); }
    c.fillStyle = color || p.pal.text; c.fillText(str, x, y); c.restore();
  };
  /* one centered line of differently colored parts; shrinks to fit the pane */
  const segLine = (c, p, parts, cx, y, size, W) => {
    const wid = sz => { c.save(); c.font = font(sz, 600); const w = parts.reduce((s, q) => s + c.measureText(q[0]).width, 0); c.restore(); return w; };
    let sz = size, tw = wid(sz);
    while (tw > W - 16 && sz > 9) { sz -= .5; tw = wid(sz); }
    let x = clamp(cx - tw / 2, 8, Math.max(8, W - 8 - tw));
    const xs = parts.map(q => { const x0 = x; c.save(); c.font = font(sz, 600); x += c.measureText(q[0]).width; c.restore(); return x0; });
    c.save(); c.font = font(sz, 600); c.textBaseline = 'middle'; c.textAlign = 'left';
    c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round';
    parts.forEach((q, i) => c.strokeText(q[0], xs[i], y));
    parts.forEach((q, i) => { c.fillStyle = q[1]; c.fillText(q[0], xs[i], y); });
    c.restore();
  };
  /* frame the plot area [0,W] x [0,H] inside the pane with pixel paddings, using one uniform scale */
  const frame = (p, W, H, { l, r, t, b }) => {
    const sc = Math.min((p.w - l - r) / W, (p.h - t - b) / H);
    p.span = Math.min(p.w, p.h) / (2 * sc);
    p.cx = W / 2 - (l - r) / (2 * sc);
    p.cy = H / 2 + (t - b) / (2 * sc);
  };

  register({
    id: 'square-roots-and-irrational-numbers', level: 'school',
    title: 'Square roots and irrational numbers',
    blurb: 'Draw a square of area 1 to 50, then zoom in on its side length to see which square roots are whole numbers and which are irrational.',
    thumb(c, p) {
      const pal = p.pal, s = Math.SQRT2; p.cx = 1.5; p.cy = 1.15; p.span = 2.05;
      p.grid(1, { axes: false });
      p.path([[0, 0], [3, 0]], { stroke: pal['grid-strong'], width: 1.5 }); p.path([[0, 0], [0, 3]], { stroke: pal['grid-strong'], width: 1.5 });
      p.path([[0, 0], [s, 0], [s, s], [0, s]], { fill: alpha(pal.yellow, .3), close: true });
      p.path([[0, 0], [2, 0], [2, 2], [0, 2]], { stroke: pal.red, width: 2, close: true });
      p.path([[0, 0], [1, 0], [1, 1], [0, 1]], { stroke: pal.green, width: 2, close: true });
      p.path([[0, 0], [s, 0], [s, s], [0, s]], { stroke: pal.blue, width: 2.8, close: true });
      p.path([[0, -.7], [3, -.7]], { stroke: pal.blue, width: 2.4 });
      for (let k = 0; k <= 3; k++) p.path([[k, -.7 - .13], [k, -.7 + .13]], { stroke: pal.muted, width: 1.6 });
      p.dot(s, -.7, 5, pal.yellow, pal.stage, 1.5);
    },
    hook: String.raw`A square with area 9 has a side of exactly 3. Why does a square with area 2 have a side that no fraction can equal?`,
    steps: [
      { title: 'Area and side',
        text: String.raw`<p>The square covers \(n=9\) unit squares, so its area is \(9\). Its side is the number that multiplies by itself to give \(9\): \(\sqrt9=3\). The edges land exactly on grid lines, and the number line shows \(3\) on a tick.</p><p>Squaring and taking a square root undo each other: \(3^2=9\) and \(\sqrt9=3\). Drag the corner to \(n=16\) and the side becomes \(4\). Whole numbers like these are <b>perfect squares</b>: \(1, 4, 9, 16, 25, 36, 49\).</p>`,
        set: { n: 9, zoom: 0, cmp: 'none', a: 0 } },
      { title: 'Not a whole number',
        text: String.raw`<p>Now \(n=2\). A side of \(1\) gives area \(1\) (green) and a side of \(2\) gives area \(4\) (red). Area \(2\) is in between, so \(\sqrt2\) is between \(1\) and \(2\), and the edge falls inside a grid cell.</p><p>This side is not a whole number, and it is not a fraction either. Here is the fact to use: if \(n\) is a positive whole number and \(\sqrt n\) is not a whole number, then \(\sqrt n\) is <b>irrational</b>. It cannot be written as a fraction of whole numbers, and its decimal never ends and never repeats.</p>`,
        set: { n: 2, zoom: 0, cmp: 'none', a: 0 } },
      { title: 'Zoom, compare, estimate',
        text: String.raw`<p>Whole numbers only say that \(\sqrt5\) and \(\sqrt6\) are both between \(2\) and \(3\). The number line is zoomed to tenths. The green square has side \(2.2\) and area \(4.84\), too small. The red square has side \(2.3\) and area \(5.29\), too big. So \(2.2<\sqrt5<2.3\), and \(\sqrt6\) sits between \(2.4\) and \(2.5\).</p><p>Drag <b>Zoom</b> up: the squares close in on \(5\) but never equal it, so a decimal that stops can only approximate \(\sqrt5\). That is enough to compare and estimate: \(\sqrt5<\sqrt6\), and \(3+\sqrt5\) is between \(5.2\) and \(5.3\).</p>`,
        set: { n: 5, zoom: 1, cmp: 'root', m: 6, a: 3 } },
      { title: 'Squares and roots undo each other',
        text: String.raw`<p>A square garden has area \(50\) square meters. If its side is \(x\) meters, then \(x^2=50\). Taking the square root undoes the squaring: \(x=\sqrt{50}\) or \(x=-\sqrt{50}\). A length cannot be negative, so the side is \(\sqrt{50}\).</p><p>Since \(7^2=49\) and \(8^2=64\), the side is between \(7\) and \(8\) meters, about \(7.07\) m. Check by squaring: \(7.07^2=49.9849\), close to \(50\).</p>`,
        set: { n: 50, zoom: 0, cmp: 'none', a: 0 } }
    ],
    formal: String.raw`
      <p><b>Definition.</b> The <em>square root</em> of a number \(a\ge0\) is the non-negative number \(\sqrt a\) whose square is \(a\):
      \[ (\sqrt a)^2 = a. \]
      It is the side length of a square with area \(a\). A <em>perfect square</em> is the square of a whole number: \(1, 4, 9, 16, 25, 36, 49,\ldots\)</p>
      <h3>Squares and square roots undo each other</h3>
      <p>Squaring then taking the root returns the number you started with, as long as it is not negative:
      \(\sqrt{7^2}=7\). If the number is negative, the result is its absolute value: \(\sqrt{(-7)^2}=\sqrt{49}=7\). In general \(\sqrt{b^2}=|b|\).</p>
      <p>To solve \(x^2=n\) with \(n>0\), both \(\sqrt n\) and \(-\sqrt n\) work, because \((-\sqrt n)^2=n\) too:
      \[ x^2=n \iff x=\sqrt n \ \text{ or } \ x=-\sqrt n, \qquad\text{written } x=\pm\sqrt n. \]
      The symbol \(\sqrt{\ }\) means only the non-negative root; the \(\pm\) comes from solving the equation. If \(n=0\) the only solution is \(0\). If \(n<0\) there is no real solution, since a square is never negative. When \(x\) is a length, keep only the positive solution.</p>
      <h3>Rational and irrational numbers</h3>
      <p>A <em>rational number</em> can be written as a fraction \(\tfrac pq\) of integers with \(q\ne0\). Integers, fractions, and decimals that end or repeat are rational: \(3=\tfrac31\), \(0.36=\tfrac{9}{25}\), \(0.\overline{3}=\tfrac13\). An <em>irrational number</em> is a real number that is not rational. Its decimal never ends and never repeats. Every real number is exactly one of the two.</p>
      <h3>Which square roots are irrational?</h3>
      <p><b>Fact.</b> Let \(n\) be a positive integer. If \(n\) is a perfect square, \(\sqrt n\) is an integer, so it is rational. If \(n\) is not a perfect square, \(\sqrt n\) is irrational. So the square root of a whole number is either a whole number or irrational, never a fraction like \(\tfrac74\).</p>
      <p><em>Why.</em> Suppose \(\sqrt n=\tfrac pq\) in lowest terms. Then \(p^2=nq^2\), so \(q^2\) divides \(p^2\). But \(p\) and \(q\) share no prime factor, so \(p^2\) and \(q^2\) share none either, which forces \(q^2=1\). Then \(\sqrt n=p\) is a whole number. So when \(\sqrt n\) is not a whole number, it is not rational. For example \(1<\sqrt2<2\), so \(\sqrt2\) is not a whole number, so it is irrational.</p>
      <p>Digits alone cannot show this. No list of digits proves that a decimal never repeats, so the argument above is what we rely on.</p>
      <h3>Rational approximations</h3>
      <p>For positive numbers, \(a&lt;b\) exactly when \(a^2&lt;b^2\). So squaring decimals tells us where an irrational square root sits. Since \(2.2^2=4.84<5<5.29=2.3^2\), we know \(2.2<\sqrt5<2.3\). Each extra decimal place shrinks the bracket by a factor of \(10\):
      \[ 2.2<\sqrt5<2.3,\qquad 2.23<\sqrt5<2.24,\qquad 2.236<\sqrt5<2.237. \]
      The squares of these decimals get closer to \(5\) but never equal it. For instance \(2.236^2=4.999696<5<5.004169=2.237^2\).</p>
      <h3>Locate, compare, and estimate</h3>
      <p><b>Locate.</b> \(\sqrt{70}\) lies between \(8\) and \(9\), because \(8^2=64<70<81=9^2\).</p>
      <p><b>Compare.</b> Since \(7<8\), we have \(\sqrt7<\sqrt8\). To compare \(\sqrt7\) with \(2.6\), square the decimal: \(2.6^2=6.76<7\), so \(2.6<\sqrt7\).</p>
      <p><b>Estimate.</b> Replace each irrational number by a decimal just below it and a decimal just above it, then do the arithmetic. From \(2.2<\sqrt5<2.3\), the sum \(3+\sqrt5\) is between \(5.2\) and \(5.3\). When you subtract, the roles swap: \(5-\sqrt5\) is between \(5-2.3=2.7\) and \(5-2.2=2.8\).</p>
      <p>Other irrational numbers work the same way. The number \(\pi\) is irrational, and \(3.14\) and \(\tfrac{22}{7}\) are rational approximations of it.</p>`,
    check: [
      { q: String.raw`Which of these numbers is irrational?`,
        choices: [String.raw`\(\sqrt{49}\)`, String.raw`\(0.36\)`, String.raw`\(\sqrt{50}\)`, String.raw`\(\tfrac{22}{7}\)`], answer: 2,
        why: String.raw`\(\sqrt{49}=7\) is a whole number, and \(0.36=\tfrac{9}{25}\) and \(\tfrac{22}{7}\) are fractions, so all three are rational. \(50\) is not a perfect square (\(7^2=49\) and \(8^2=64\)), so \(\sqrt{50}\) is irrational.`,
        hint: String.raw`A rational number can be written as a fraction of whole numbers. Is each square root a whole number?` },
      { q: String.raw`A square patio has an area of \(70\) square meters. Between which two whole numbers is its side length, in meters?`,
        choices: ['8 and 9', '7 and 8', '9 and 10', '35 and 36'], answer: 0,
        why: String.raw`The side \(x\) satisfies \(x^2=70\), and a length is positive, so \(x=\sqrt{70}\). Since \(8^2=64<70<81=9^2\), the side is between \(8\) and \(9\) meters. Halving \(70\) to get \(35\) mixes up square roots with dividing by \(2\).`,
        hint: String.raw`Find the perfect squares just below and just above \(70\).` }
    ],
    links: { related: ['pythagorean-theorem', 'quadratics-and-the-parabola', 'area-of-a-circle'] },

    mount({ stage, controls: C }) {
      /* Discrete state: every field is an integer or a one-decimal value, set instantly.
         `cam` holds the drawn geometry (square side, window of the number line, bracket, second marker); it eases toward the target. */
      const st = { n: 9, zoom: 0, cmp: 'none', m: 8, d: 2.6, a: 0 };
      const cam = { s: 3, E: 4, lo: -.4, hi: 8.4, g: 3, r: 3, ba: 0, q: 0, qa: 0, e: 0, ea: 0 };
      let cancel = () => {};
      stage.classList.add('split');
      stage.style.minHeight = '500px';   /* two panes need room for the number line's labels on small screens */
      const top = h('div', { class: 'pane', style: 'flex: 11 1 0' }), bot = h('div', { class: 'pane', style: 'flex: 10 1 0' });
      stage.append(top, bot);
      const P1 = new Plane(top, { span: 4 }), P2 = new Plane(bot, { span: 4 });
      const redraw = () => { P1.draw(); P2.draw(); };

      const target = () => {
        const { n, zoom: z, cmp, m, d, a } = st, s = Math.sqrt(n), B = brk(n, z), f = pow10(z);
        const qOn = cmp !== 'none', qv = cmp === 'root' ? Math.sqrt(m) : cmp === 'dec' ? d : 0;
        let lo, hi;
        if (z === 0) { lo = -.4; hi = a > 0 ? 12.4 : 8.4; }
        else {
          const w = pow10(1 - z), base = isqrt(n * pow10(2 * (z - 1))) / pow10(z - 1);
          if (B.exact) { lo = s - .6 * w; hi = s + .6 * w; } else { lo = base - .1 * w; hi = base + 1.1 * w; }
        }
        return {
          s, E: Math.max(3, Math.ceil(Math.max(s, qOn ? qv : 0) - 1e-9) + 1), lo, hi,
          g: B.k / f, r: B.exact ? B.k / f : (B.k + 1) / f, ba: B.exact ? 0 : 1,
          q: qv, qa: qOn ? 1 : 0, e: a + s, ea: a > 0 ? 1 : 0
        };
      };
      const aim = ms => {
        cancel();
        const t = target();
        if (cam.qa < .01) cam.q = t.q;
        if (cam.ea < .01) cam.e = t.e;
        if (!t.qa) delete t.q;
        if (!t.ea) delete t.e;
        if (ms) cancel = animateTo(cam, t, ms, redraw); else { Object.assign(cam, t); redraw(); }
      };
      Object.assign(cam, target());

      /* ---------- top pane: the square on a grid ---------- */
      P1.onDraw = (c, p) => {
        const pal = p.pal, E = cam.E, s = cam.s, W = p.w, { n, cmp } = st, ex = brk(n, 0).exact;
        frame(p, E, E, { l: 30, r: 18, t: 56, b: 30 });
        const fs = clamp(p.scale * .38, 11, 14), sq = (x, o) => p.path([[0, 0], [x, 0], [x, x], [0, x]], { close: true, ...o });
        c.lineWidth = 1; c.strokeStyle = pal.grid; c.beginPath();
        for (let i = 1; i <= E + 1e-9; i++) { c.moveTo(p.X(i), p.Y(0)); c.lineTo(p.X(i), p.Y(E)); c.moveTo(p.X(0), p.Y(i)); c.lineTo(p.X(E), p.Y(i)); }
        c.stroke();
        p.path([[0, 0], [E, 0]], { stroke: pal['grid-strong'], width: 2 }); p.path([[0, 0], [0, E]], { stroke: pal['grid-strong'], width: 2 });
        for (let i = 1; i <= E + 1e-9; i++) {
          T(c, p, String(i), p.X(i), p.Y(0) + 15, { size: fs, color: pal.muted, align: 'center' });
          T(c, p, String(i), p.X(0) - 10, p.Y(i), { size: fs, color: pal.muted, align: 'right' });
        }
        sq(s, { fill: alpha(pal.yellow, .28) });
        if (cam.ba > .01) { sq(cam.r, { stroke: alpha(pal.red, cam.ba), width: 2.5 }); sq(cam.g, { stroke: alpha(pal.green, cam.ba), width: 2.5 }); }
        if (cam.qa > .01 && cmp !== 'none') {
          sq(cam.q, { stroke: alpha(pal.violet, cam.qa), width: 2.5, dash: [7, 5] });
          const dk = Math.round(st.d * 10);
          T(c, p, cmp === 'root' ? `dashed: area ${st.m}` : `dashed: ${dec(dk, 1)}² = ${trim(dec(dk * dk, 2))}`, W - 32, 42, { size: 13, weight: 600, color: pal.violet, align: 'right', a: cam.qa });
        }
        sq(s, { stroke: pal.blue, width: 3.5 });
        p.dot(s, s, 8, pal.stage, pal.brass, 3.5);
        T(c, p, 'area = ' + n, 32, 22, { size: 16, weight: 600 });
        T(c, p, ex ? `side = √${n} = ${isqrt(n)}` : `side = √${n} ≈ ${Math.sqrt(n).toFixed(3)}`, 32, 42, { size: 14 });
        T(c, p, ex ? 'perfect square' : 'not a perfect square', W - 32, 22, { size: 13, color: pal.muted, align: 'right' });
      };

      /* ---------- bottom pane: the number line with a zoom ---------- */
      P2.onDraw = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, PAD = 22, z = st.zoom, n = st.n, small = W < 480;
        const sc = (W - 2 * PAD) / (cam.hi - cam.lo), ya = clamp(Math.round(H * .56), 112, Math.max(112, H - 108));
        p.span = Math.min(W, H) / (2 * sc); p.cx = (cam.lo + cam.hi) / 2; p.cy = (ya - H / 2) / sc;   /* axis at pixel row ya */
        const X = v => p.X(v), fs = small ? 11 : 12.5, vmin = cam.lo - PAD / sc - .01, vmax = cam.hi + PAD / sc + .01;
        const B = brk(n, z), ex = B.exact, s = Math.sqrt(n), ba = cam.ba;
        const plan = [0, 1, 2, 3].map(L => {
          const pxs = sc / pow10(L), k = pxs >= 44 ? 1 : pxs * 2 >= 44 ? 2 : pxs * 5 >= 44 ? 5 : 0;
          return { L, pxs, k };
        });
        /* markers that fall outside the window get an arrow at the edge; keep tick labels clear of it */
        const offs = [[cam.q, cam.qa, st.cmp !== 'none'], [cam.e, cam.ea, st.a > 0]].filter(([, al, on]) => on && al > .01).map(([v]) => X(v));
        const offL = offs.some(x => x < PAD - 6), offR = offs.some(x => x > W - PAD + 6);
        const decs = plan.reduce((acc, q) => q.k && q.L <= z ? q.L : acc, 0);

        /* highlighted bracket */
        if (ba > .01) {
          c.fillStyle = alpha(pal.yellow, .2 * ba); c.fillRect(X(cam.g), ya - 30, X(cam.r) - X(cam.g), 60);
        }
        /* axis, ticks, tick labels */
        c.strokeStyle = pal.blue; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, ya); c.lineTo(W, ya); c.stroke();
        const half = [13, 10, 7, 5], gx = X(cam.g), rx = X(cam.r);
        for (const { L, pxs, k } of plan) {
          const ta = clamp((pxs - 8) / 6, 0, 1);
          if (ta < .03) continue;
          const per = pow10(L);
          c.strokeStyle = alpha(L ? pal['grid-strong'] : pal.muted, ta); c.lineWidth = L ? 1.5 : 2; c.beginPath();
          const i0 = Math.max(0, Math.ceil(vmin * per)), i1 = Math.floor(vmax * per), lab = [];
          for (let i = i0; i <= i1; i++) {
            if (L > 0 && i % 10 === 0) continue;
            const x = X(i / per);
            c.moveTo(x, ya - half[L]); c.lineTo(x, ya + half[L]);
            if (k && L <= z && i % k === 0 && x > (offL ? 42 : 12) && x < W - (offR ? 42 : 12)) {
              const crowd = ba > .3 && (Math.abs(x - gx) < 46 || Math.abs(x - rx) < 46);
              if (!crowd) lab.push([(i / per).toFixed(decs), x]);
            }
          }
          c.stroke();
          for (const [t, x] of lab) T(c, p, t, x, ya + 27, { size: fs, color: pal.muted, align: 'center' });
        }

        /* bracket ends: lower approximation (green), upper approximation (red) */
        if (ba > .01) {
          c.lineWidth = 3;
          c.strokeStyle = alpha(pal.green, ba); c.beginPath(); c.moveTo(gx, ya - 32); c.lineTo(gx, ya + 20); c.stroke();
          c.strokeStyle = alpha(pal.red, ba); c.beginPath(); c.moveTo(rx, ya - 32); c.lineTo(rx, ya + 20); c.stroke();
          T(c, p, dec(B.k, z), gx + 4, ya + 30, { size: fs + 1, weight: 700, color: pal.green, align: 'right', a: ba });
          T(c, p, dec(B.k + 1, z), rx - 4, ya + 30, { size: fs + 1, weight: 700, color: pal.red, align: 'left', a: ba });
        }
        /* the straddling squares, above the axis (the stem of the root's label passes behind the text) */
        const sx = X(cam.s), sqS = k => trim(dec(k * k, 2 * z));
        c.strokeStyle = alpha(pal.muted, .7); c.lineWidth = 1.5; c.setLineDash([4, 5]); c.beginPath(); c.moveTo(sx, ya - 10); c.lineTo(sx, ya - 66); c.stroke(); c.setLineDash([]);
        if (ex) segLine(c, p, [[`${dec(B.k, z)}² = ${n}, exactly`, pal.text]], sx, ya - 46, fs + 1.5, W);
        else segLine(c, p, [[`${dec(B.k, z)}² = ${sqS(B.k)}`, pal.green], [' < ', pal.muted], [String(n), pal.text], [' < ', pal.muted], [`${sqS(B.k + 1)} = ${dec(B.k + 1, z)}²`, pal.red]],
          (gx + rx) / 2, ya - 46, fs + 1.5, W);

        /* second number and the shifted number */
        const mark = (v, alp, txt, row, col, ring) => {
          if (alp <= .01) return;
          const x = X(v), inV = x >= PAD - 6 && x <= W - PAD + 6;
          c.save(); c.globalAlpha = alp;
          if (inV) {
            c.strokeStyle = col; c.globalAlpha = alp * .55; c.lineWidth = 1.5; c.setLineDash([4, 5]); c.beginPath(); c.moveTo(x, ya + 8); c.lineTo(x, ya + row - 12); c.stroke(); c.setLineDash([]);
            c.globalAlpha = alp; c.beginPath(); c.arc(x, ya, 7, 0, TAU);
            if (ring) { c.fillStyle = pal.stage; c.fill(); c.lineWidth = 3.5; c.strokeStyle = col; c.stroke(); } else { c.fillStyle = col; c.fill(); c.lineWidth = 2.5; c.strokeStyle = pal.stage; c.stroke(); }
          } else {
            const left = x < PAD, ex0 = left ? 20 : W - 20, dir = left ? 1 : -1;
            c.strokeStyle = col; c.globalAlpha = alp * .55; c.lineWidth = 1.5; c.setLineDash([4, 5]); c.beginPath(); c.moveTo(ex0 + dir * 5, ya + 8); c.lineTo(ex0 + dir * 5, ya + row - 12); c.stroke(); c.setLineDash([]);
            c.globalAlpha = alp; c.fillStyle = col; c.beginPath(); c.moveTo(ex0, ya); c.lineTo(ex0 + dir * 11, ya - 7); c.lineTo(ex0 + dir * 11, ya + 7); c.closePath(); c.fill();
          }
          c.restore();
          const lx = inV ? clamp(x, 70, W - 70) : (x < PAD ? 25 : W - 25);
          if (!inV) txt = x < PAD ? '\u2190 ' + txt : txt + ' \u2192';
          T(c, p, txt, lx, ya + row, { size: fs + 1, weight: 600, color: ring ? pal.text : col, align: inV ? 'center' : (x < PAD ? 'left' : 'right'), a: alp });
        };
        if (st.cmp === 'root') {
          const Bm = brk(st.m, z), sm = Math.sqrt(st.m);
          mark(cam.q, cam.qa, Bm.exact ? `√${st.m} = ${isqrt(st.m)}` : `√${st.m} ≈ ${sm.toFixed(z + 2)}`, 62, pal.violet, false);
        } else if (st.cmp === 'dec') mark(cam.q, cam.qa, 'd = ' + dec(Math.round(st.d * 10), 1), 62, pal.violet, false);
        if (st.a > 0) {
          const row = st.cmp !== 'none' ? 92 : 62;
          mark(cam.e, cam.ea, ex ? `${st.a} + √${n} = ${st.a + isqrt(n)}` : `${st.a} + √${n} ≈ ${(st.a + s).toFixed(z + 2)}`, row, pal.yellow, true);
        }

        /* the square root itself */
        p.dot(cam.s, 0, 8.5, pal.yellow, pal.stage, 3);
        T(c, p, ex ? `√${n} = ${isqrt(n)}` : `√${n} ≈ ${s.toFixed(z + 2)}`, clamp(sx, 64, W - 64), ya - 76, { size: fs + 3, weight: 700, align: 'center' });
        T(c, p, `Number line: ticks every ${TICKS[z]}`, 14, 18, { size: 12.5, color: pal.muted });
      };

      /* ---------- readout ---------- */
      const LT = '&lt;';
      const cmpLines = () => {
        const { n, zoom: z, cmp, m, d } = st, A = brk(n, z), out = [];
        if (cmp === 'root') {
          if (m === n) return [`<span class="k">Compare</span> √${n} = √${m}: the same number`];
          const Bm = brk(m, z), sm = n < m, S = sm ? A : Bm, G = sm ? Bm : A, a = sm ? n : m, b = sm ? m : n;
          const hiS = S.exact ? S.k : S.k + 1, loG = G.k;
          out.push(`<span class="k">Compare</span> √${n} and √${m}`);
          out.push(Bm.exact ? `√${m} = ${isqrt(m)}` : `${dec(Bm.k, z)} ${LT} √${m} ${LT} ${dec(Bm.k + 1, z)}`);
          const X = dec(hiS, z), Y = dec(loG, z);
          out.push(hiS <= loG ? `√${a} ${S.exact ? '=' : LT} ${X}${hiS < loG ? ` ≤ ${Y}` : ''} ${G.exact ? '=' : LT} √${b}` : `Same bracket at this zoom: zoom in to tell them apart.`);
          out.push(`Areas: ${a} ${LT} ${b}, so √${a} ${LT} √${b}`);
        } else if (cmp === 'dec') {
          const dk = Math.round(d * 10), dd = dk * dk, N = 100 * n, ds = dec(dk, 1), d2 = trim(dec(dd, 2));
          out.push(`<span class="k">Compare</span> √${n} with ${ds}`);
          out.push(`${ds}² = ${d2}, which is ${dd < N ? 'less than' : dd > N ? 'greater than' : 'equal to'} ${n}`);
          out.push(dd < N ? `so ${ds} ${LT} √${n}` : dd > N ? `so ${ds} &gt; √${n}` : `so ${ds} = √${n}`);
        }
        return out;
      };
      const upd = () => {
        const { n, zoom: z, a } = st, s = Math.sqrt(n), B = brk(n, z), f = pow10(z), ex = B.exact, L = [];
        L.push(`<span class="k">Area</span> n = ${n} &nbsp; <span class="k">Side</span> ${ex ? `√${n} = ${isqrt(n)}` : `√${n} ≈ ${s.toFixed(5)}`}`);
        L.push(ex ? `<b>perfect square:</b> rational (an integer)` : `<b>not a perfect square:</b> irrational (its decimal never ends and never repeats)`);
        L.push(`<span class="k">Zoom: ${NAMES[z]}</span> (ticks every ${TICKS[z]})<br>` + (ex ? `√${n} = ${dec(B.k, z)} exactly` : `${dec(B.k, z)} ${LT} √${n} ${LT} ${dec(B.k + 1, z)}`));
        const col = (name, t) => `<span style="color:var(--${name})">${t}</span>`;
        L.push(ex ? `${dec(B.k, z)}² = ${n}` : `${col('green', `${dec(B.k, z)}² = ${trim(dec(B.k * B.k, 2 * z))}`)} ${LT} ${n} ${LT} ${col('red', `${trim(dec((B.k + 1) * (B.k + 1), 2 * z))} = ${dec(B.k + 1, z)}²`)}`);
        const dg = digitsOf(n), pin = 1 + z;
        L.push(`<span class="k">First 12 digits (a peek, not a proof)</span><br><span style="font-size:1.12em;letter-spacing:.07em;font-weight:500">` +
          [...dg].map((ch, i) => `<span style="color:var(${i < pin ? '--text' : '--muted'})">${ch}</span>${i === 0 ? '.' : ''}`).join('') + (ex ? '' : '…') + `</span>`);
        if (a > 0) L.push(ex ? `<span class="k">Estimate</span> ${a} + √${n} = ${a + isqrt(n)}` : `<span class="k">Estimate</span> ${a} + √${n} is between ${dec(a * f + B.k, z)} and ${dec(a * f + B.k + 1, z)} (about ${(a + s).toFixed(3)})`);
        const cl = cmpLines();
        if (cl.length) L.push(cl.join('<br>'));
        ro.innerHTML = L.join('<br>');
      };

      /* ---------- controls ---------- */
      const probe = C.readout(), host = probe.parentElement; probe.remove();
      const show = (el, on) => { if (el) el.style.display = on ? '' : 'none'; };
      const sync = () => {
        nS.set(st.n); zS.set(st.zoom); mS.set(st.m); dS.set(st.d); aS.set(st.a); cmpSel.value = st.cmp;
        show(mEl, st.cmp === 'root'); show(dEl, st.cmp === 'dec');
        zoomOut.disabled = st.zoom <= 0; zoomIn.disabled = st.zoom >= 3;
      };
      const change = ms => { aim(ms); upd(); };
      const setN = v => { v = clamp(Math.round(v), 1, MAXN); if (v === st.n) return; st.n = v; nS.set(v); change(260); };
      const setZoom = v => { v = clamp(Math.round(v), 0, 3); if (v === st.zoom) return; st.zoom = v; sync(); change(750); };

      C.title('Square');
      const nS = C.slider({ label: 'Area n (square units)', min: 1, max: MAXN, step: 1, value: st.n, format: v => String(Math.round(v)), onInput: v => { cancel(); setN(v); } });
      C.title('Number line');
      const zS = C.slider({ label: 'Zoom: ticks every', min: 0, max: 3, step: 1, value: st.zoom, format: v => TICKS[Math.round(v)], onInput: v => { cancel(); setZoom(v); } });
      const [zoomOut, zoomIn] = C.buttons([{ label: 'Zoom out', onClick: () => setZoom(st.zoom - 1) }, { label: 'Zoom in', primary: true, onClick: () => setZoom(st.zoom + 1) }]);
      C.title('Compare and estimate');
      const cmpSel = C.select({ label: 'Compare √n with', value: st.cmp, options: [
        { value: 'none', label: 'Nothing' }, { value: 'root', label: 'Another square root, √m' }, { value: 'dec', label: 'A decimal, d' }],
        onChange: v => {
          st.cmp = v;
          if (v === 'root' && st.m === st.n) st.m = st.n < MAXN ? st.n + 1 : st.n - 1;
          sync(); change(500);
        } });
      const mS = C.slider({ label: 'Second area m', min: 1, max: MAXN, step: 1, value: st.m, format: v => String(Math.round(v)), onInput: v => { cancel(); st.m = Math.round(v); change(300); } });
      const mEl = host && host.lastElementChild;
      const dS = C.slider({ label: 'Decimal d', min: 1, max: 8, step: .1, value: st.d, format: v => v.toFixed(1), onInput: v => { cancel(); st.d = Math.round(v * 10) / 10; change(300); } });
      const dEl = host && host.lastElementChild;
      const aS = C.slider({ label: 'Add a whole number: a + √n', min: 0, max: 5, step: 1, value: st.a, format: v => v ? 'a = ' + Math.round(v) : 'off', onInput: v => { cancel(); st.a = Math.round(v); change(500); } });
      const ro = C.readout();
      C.hint('Drag in the top picture to move the square’s corner, or use the sliders. Zoom in to squeeze √n between decimals.');
      sync(); upd();

      draggable(P1, {
        hit: () => 'corner',
        move: (_, x, y) => { cancel(); const sd = Math.max(x, y, 0); setN(sd * sd); }
      });

      const apply = (patch, immediate) => {
        cancel();
        Object.assign(st, patch);   /* every field is discrete (integers, one-decimal d, the cmp flag) and applied instantly; the drawing eases toward it */
        sync(); aim(immediate ? 0 : 800); upd();
      };
      return { destroy: () => { cancel(); P1.destroy(); P2.destroy(); }, apply };
    }
  });
}
