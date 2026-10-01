/* =====================================================================
   SCHOOL — Exponents and scientific notation
   ===================================================================== */
{
  const FONT = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
  const MONO = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace';
  const MINUS = '−', TIMES = '×';

  /* ---------- number and text helpers ---------- */
  const sg = v => String(v).replace('-', MINUS);                                   /* -3 -> −3 */
  const signed = v => (v < 0 ? MINUS : '+') + Math.abs(v);                         /* +3, −2 */
  const par = v => (v < 0 ? '(' + sg(v) + ')' : String(v));                        /* 5 or (−3) */
  const rnd = (v, d = 6) => +v.toFixed(d);
  const commas = s => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const bigStr = n => commas('1' + '0'.repeat(n));                                 /* 10^n, n >= 0 */
  const smallStr = n => '0.' + '0'.repeat(n - 1) + '1';                            /* 10^-n, n >= 1 */
  const valTxt = e => (e >= 0 ? bigStr(e) : '1/' + bigStr(-e) + ' = ' + smallStr(-e));
  const cs1 = v => String(+clamp(v, 1, 9.9).toFixed(1));                           /* builder coefficient */
  const csN = v => String(+v.toFixed(2));                                          /* coefficient while it animates */
  const pw = n => `10<sup>${sg(n)}</sup>`;                                         /* HTML power of ten */
  const sciH = (ms, n) => `${ms} ${TIMES} ${pw(n)}`;
  const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');

  /* Sizes in meters, written as coefficient x 10^n. All are rounded approximations. */
  const OBJ = [
    { name: 'virus', short: 'virus', what: 'diameter', m: 1, n: -7 },
    { name: 'red blood cell', short: 'blood cell', what: 'diameter', m: 8, n: -6 },
    { name: 'human hair', short: 'hair', what: 'width', m: 1, n: -4 },
    { name: 'ant', short: 'ant', what: 'length', m: 3, n: -3 },
    { name: 'person', short: 'person', what: 'height', m: 1.7, n: 0 },
    { name: 'football field', short: 'football field', what: 'length', m: 1, n: 2 },
    { name: 'Mount Everest', short: 'Everest', what: 'height', m: 8.8, n: 3 },
    { name: 'Moon', short: 'Moon', what: 'diameter', m: 3.5, n: 6 },
    { name: 'Earth', short: 'Earth', what: 'diameter', m: 1.3, n: 7 },
    { name: 'Sun', short: 'Sun', what: 'diameter', m: 1.4, n: 9 }
  ];
  const UNITS = { '-9': 'nm', '-6': 'µm', '-3': 'mm', '-2': 'cm', '0': 'm', '3': 'km' };
  const RULES = ['mul', 'div', 'pow', 'pat'], OPS = ['mul', 'div', 'cmp'];
  const FLAGS = ['view', 'rule', 'op'], INTS = ['a', 'b', 'pa', 'pb', 'pn', 'n', 'n1', 'n2'];

  /* ---------- canvas text with raised exponents ----------
     items are strings or { s, col, up }; up draws a small raised exponent. Shrinks to fit maxW. */
  const T = (s, col) => ({ s, col });
  const U = (s, col) => ({ s, col, up: true });
  const sci = (ms, n, cm, cn, ct) => [T(ms, cm), T(' ' + TIMES + ' ', ct), T('10', ct), U(sg(n), cn)];
  function rich(c, items, x, y, size, o = {}) {
    const { align = 'center', color = '#888', weight = 600, maxW = 1e9, halo, fam = FONT } = o;
    const its = items.map(it => (typeof it === 'string' ? { s: it } : { ...it }));
    const fnt = (it, z) => `${weight} ${(it.up ? z * .64 : z).toFixed(1)}px ${fam}`;
    let z = size, tw = 0;
    const measure = () => { tw = 0; for (const it of its) { c.font = fnt(it, z); it.w = c.measureText(it.s).width + (it.up ? z * .04 : 0); tw += it.w; } };
    measure();
    if (tw > maxW) { z = Math.max(9, z * maxW / tw); measure(); }
    const left = align === 'left' ? x : align === 'right' ? x - tw : x - tw / 2;
    let px = left;
    c.textAlign = 'left'; c.textBaseline = 'middle';
    for (const it of its) {
      c.font = fnt(it, z);
      const py = it.up ? y - z * .4 : y;
      if (halo) { c.lineWidth = 4; c.lineJoin = 'round'; c.strokeStyle = halo; c.strokeText(it.s, px, py); }
      c.fillStyle = it.col || color; c.fillText(it.s, px, py);
      px += it.w;
    }
    return { left, w: tw, size: z };
  }
  const txt = (c, s, x, y, size, color, o = {}) => rich(c, [s], x, y, size, { ...o, color });
  const line = (c, x0, y0, x1, y1, col, w = 1.5, dash) => {
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]);
  };
  const head = (c, x, y, dir, col, s = 8) => {                                      /* arrowhead at (x, y) pointing along dir (+1 right, -1 left) */
    c.beginPath(); c.moveTo(x, y); c.lineTo(x - dir * s, y - s * .55); c.lineTo(x - dir * s, y + s * .55); c.closePath(); c.fillStyle = col; c.fill();
  };

  /* ---------- the standard decimal form of m x 10^n, cell by cell ---------- */
  function decim(m, n) {
    const ms = String(+clamp(m, 1, 9.9).toFixed(1)), D = ms.replace('.', '').split(''), len = D.length, pn = 1 + n;
    let cells, off = 0, pt;
    if (pn <= 0) { off = 1 - pn; cells = ['0', ...Array(-pn).fill('0'), ...D]; pt = 1; }
    else if (pn >= len) { cells = [...D, ...Array(pn - len).fill('0')]; pt = pn; }
    else { cells = D; pt = pn; }
    const kinds = cells.map((_, i) => (i >= off && i < off + len ? 'sig' : i === 0 && pn <= 0 ? 'lead' : 'pad'));
    const ip = cells.slice(0, pt).join(''), fp = cells.slice(pt).join('');
    return { ms, cells, kinds, pt, ob: off + 1, text: commas(ip) + (fp ? '.' + fp : '') };
  }

  /* ---------- axis of powers of ten between exponents lo and hi ---------- */
  function ruler(c, p, lo, hi, units) {
    const pal = p.pal, W = p.w, H = p.h, x0 = 18, x1 = W - 18, pxd = (x1 - x0) / (hi - lo);
    const X = e => x0 + (e - lo) * pxd, ay = H - clamp(H * .17, 40, 50), top = 44;
    const e0 = Math.ceil(lo - 1e-9), e1 = Math.floor(hi + 1e-9);
    c.lineWidth = 1; c.strokeStyle = pal.grid; c.beginPath();
    for (let e = e0; e <= e1; e++) { c.moveTo(X(e), ay); c.lineTo(X(e), top); }
    c.stroke();
    line(c, x0, ay, x1, ay, pal['grid-strong'], 2);
    if (pxd >= 60) {
      c.lineWidth = 1.2; c.strokeStyle = pal['grid-strong']; c.beginPath();
      for (let e = e0 - 1; e <= e1; e++) for (let k = 2; k <= 9; k++) { const v = e + Math.log10(k); if (v >= lo && v <= hi) { c.moveTo(X(v), ay); c.lineTo(X(v), ay + 5); } }
      c.stroke();
    }
    const ls = [1, 2, 3, 6].find(s => pxd * s >= 44) || 6;
    for (let e = e0; e <= e1; e++) {
      const lab = ((e % ls) + ls) % ls === 0;
      line(c, X(e), ay - 3, X(e), ay + (lab ? 10 : 7), lab ? pal.text : pal['grid-strong'], lab ? 2 : 1.5);
      if (lab) {
        rich(c, [T('10'), U(sg(e))], X(e), ay + 22, 13, { color: pal.muted, weight: 500 });
        if (units && UNITS[e]) txt(c, UNITS[e], X(e), ay + 37, 11, pal.faint || pal.muted, { weight: 500 });
      }
    }
    return { X, ay, x0, x1, pxd };
  }

  /* greedy label lanes: labels never overlap; stems avoid running through labels when there is room */
  function lanes(items, maxLane) {
    const done = [];
    for (const strict of [true, false]) {
      for (const it of items) {
        if (it.lane >= 0) continue;
        const l = it.lx - it.w / 2 - 4, r = it.lx + it.w / 2 + 4, tl = it.lx - it.w / 2, tr = it.lx + it.w / 2;
        for (let k = 0; k <= maxLane && it.lane < 0; k++) {
          let ok = true;
          for (const q of done) {
            if (q.lane === k && !(r < q.l || l > q.r)) { ok = false; break; }
            if (!strict) continue;
            if (q.lane > k && q.x > tl && q.x < tr) { ok = false; break; }
            if (q.lane < k && it.x > q.tl && it.x < q.tr) { ok = false; break; }
          }
          if (ok) { it.lane = k; done.push({ lane: k, x: it.x, l, r, tl, tr }); }
        }
      }
    }
  }

  register({
    id: 'exponents-and-scientific-notation', level: 'school',
    title: 'Exponents and scientific notation',
    blurb: 'Slide along a ruler of powers of ten, write huge and tiny numbers in scientific notation, and multiply them by adding exponents.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 3;
      const d = 1.1, ay = -1.5;
      p.path([[-3.8, ay], [3.8, ay]], { stroke: pal['grid-strong'], width: 2 });
      for (let i = -3; i <= 3; i++) {
        p.path([[i * d, ay], [i * d, ay - .35]], { stroke: pal['grid-strong'], width: 1.8 });
        if (i < 3) for (let k = 2; k <= 9; k++) p.path([[(i + Math.log10(k)) * d, ay], [(i + Math.log10(k)) * d, ay - .16]], { stroke: pal['grid-strong'], width: 1 });
      }
      for (const [x, hh] of [[-2.75, .7], [-1.45, 1.35], [-.2, .55], [1.1, 1.05], [2.6, .75]]) {
        p.path([[x, ay], [x, ay + hh]], { stroke: alpha(pal.blue, .55), width: 1.6 });
        p.dot(x, ay + hh, 4.2, pal.blue, pal.stage, 1.5);
      }
      const xm = d * 1.505;
      p.path([[xm, ay], [xm, .75]], { stroke: alpha(pal.yellow, .85), width: 1.8, dash: [4, 4] });
      p.dot(xm, ay, 5, pal.yellow, pal.stage, 1.5);
      rich(c, sci('3.2', 5, pal.green, pal.red, pal.text), p.X(0), p.Y(1.45), Math.max(12, p.scale * .72), { maxW: p.w - 14 });
    },
    hook: String.raw`The Sun is about 1,400,000,000 meters across and a virus is about 0.0000001 meters. How can you write numbers like these without counting zeros, and still multiply them?`,
    steps: [
      { title: 'Count the factors',
        text: String.raw`<p>\(10^3\) is three factors of \(10\), shown in <b>green</b>. \(10^4\) is four factors, shown in <b>red</b>. Together that is \(3+4=7\) factors, so \(10^3\cdot10^4=10^7=10{,}000{,}000\). On the line above, each tick to the right is one more factor of \(10\).</p><p>Press <b>Divide</b>. Matching factors above and below the bar cancel. \(10^3\div10^4\) cancels three pairs and leaves one factor under the bar: \(10^{-1}=\tfrac1{10}\). Slide <b>b</b> down to 3 and everything cancels: \(10^0=1\). Then try <b>Power</b> and <b>Zero &amp; negative</b>.</p>`,
        set: { view: 'props', rule: 'mul', a: 3, b: 4 } },
      { title: 'Very large, very small',
        text: String.raw`<p>Each tick on the top ruler is ten times bigger than the one before it. Sizes in meters run from a virus, about \(10^{-7}\), to the Sun, about \(1.4\times10^{9}\). That is about \(10^{16}\) times bigger.</p><p>Tap an object to load its size below. Drag the ruler to slide it, or use <b>Zoom</b> to look closer.</p>`,
        set: { view: 'sci', m: 1.4, n: 9, c: 1, w: 20 } },
      { title: 'Move the decimal point',
        text: String.raw`<p>Scientific notation writes a number as \(a\times10^n\) with \(1\le a<10\). Here \(a=3.2\) and \(n=5\), so the number is \(320{,}000\). The exponent counts how far the decimal point moves: 5 places right.</p><p>A calculator shows this as <b>3.2E5</b>. The E means "times ten to the power". It is not the number \(e\).</p><p>Now drag <b>Exponent</b> below zero. The point moves left and the number drops below 1: \(3.2\times10^{-4}=0.00032\).</p>`,
        set: { view: 'sci', m: 3.2, n: 5, c: 5, w: 8 } },
      { title: 'Multiply, divide, compare',
        text: String.raw`<p>To multiply, multiply the coefficients and add the exponents. For \((4\times10^3)(5\times10^2)\): \(4\times5=20\) and \(3+2=5\), giving \(20\times10^5\).</p><p>That is not scientific notation, because 20 is not below 10. Write \(20=2\times10^1\), so the answer is \(2\times10^6\).</p><p>Press <b>Divide</b>: \(4\div5=0.8\) and \(3-2=1\), so \(0.8\times10^1=8\times10^0\). Press <b>Compare</b>: the exponents decide first. \(10^3\) beats \(10^2\), so \(4\times10^3>5\times10^2\), even though \(4<5\).</p>`,
        set: { view: 'ops', op: 'mul', m1: 4, n1: 3, m2: 5, n2: 2 } }
    ],
    formal: String.raw`
      <p>These rules hold for every nonzero base \(b\) and all integers \(m\) and \(n\).<br>
      <b>Product.</b> \(b^m\cdot b^n=b^{m+n}\)<br>
      <b>Quotient.</b> \(\dfrac{b^m}{b^n}=b^{m-n}\)<br>
      <b>Power of a power.</b> \((b^m)^n=b^{mn}\)<br>
      <b>Zero exponent.</b> \(b^0=1\)<br>
      <b>Negative exponent.</b> \(b^{-n}=\dfrac1{b^n}\)</p>
      <h3>Why the product and quotient rules work</h3>
      <p>For a positive integer \(m\), \(b^m\) means \(m\) factors of \(b\). Multiplying \(m\) factors by \(n\) more factors gives \(m+n\) factors. In a quotient, each factor above the bar cancels one below it, because \(b\div b=1\). That leaves \(m-n\) factors. The power rule counts \(n\) groups of \(m\) factors, which is \(mn\) factors.</p>
      <h3>Zero and negative exponents</h3>
      <p>Counting down one exponent divides by the base: \(10^3=1000\), \(10^2=100\), \(10^1=10\). The pattern continues with \(10^0=1\), \(10^{-1}=\tfrac1{10}\), \(10^{-2}=\tfrac1{100}\).</p>
      <p>It is also the only choice that keeps the quotient rule true. Since \(\dfrac{b^3}{b^3}=b^{3-3}=b^0\) and any nonzero number divided by itself is \(1\), we need \(b^0=1\). Since \(\dfrac{b^2}{b^5}=b^{-3}\) and also \(\dfrac{b^2}{b^5}=\dfrac1{b^3}\), we need \(b^{-3}=\dfrac1{b^3}\).</p>
      <h3>Using the rules</h3>
      <p>\(2^5\cdot2^{-3}=2^{5+(-3)}=2^2=4\). Counting agrees: five factors of 2 above the bar and three below, so three pairs cancel and two factors of 2 remain. Also \((10^{-2})^3=10^{-6}=\tfrac1{1{,}000{,}000}\).</p>
      <p>A few slips to avoid. Add exponents only when you multiply powers of the <em>same</em> base: \(10^3+10^4\ne10^7\) and \(2^3\cdot3^2\ne6^5\). A negative exponent does not make the number negative: \(10^{-2}=0.01\).</p>
      <h3>Scientific notation</h3>
      <p>A number is in <em>scientific notation</em> when it is written
      \[ a\times10^{n}, \quad 1\le a<10, \quad n \text{ an integer}. \]
      The coefficient \(a\) holds the digits and the power of ten holds the size.</p>
      <p>To write \(a\times10^n\) in standard form, move the decimal point \(n\) places right if \(n>0\) and \(|n|\) places left if \(n<0\). To go the other way, move the point until exactly one nonzero digit is on its left, and count the places. A large number needs \(n>0\). A number between 0 and 1 needs \(n<0\). For example, \(320{,}000=3.2\times10^{5}\) and \(0.00032=3.2\times10^{-4}\).</p>
      <p>Real measurements are rounded, so scientific notation is a natural way to write an approximation. The Sun's diameter is about \(1.4\times10^9\) meters. The coefficient keeps only the digits worth keeping.</p>
      <h3>Comparing</h3>
      <p>When both coefficients are between 1 and 10, compare the exponents first. The number with the larger exponent is larger. If the exponents are equal, the larger coefficient wins.<br>
      \(4\times10^{3}>5\times10^{2}\), because \(3>2\).<br>
      \(6.1\times10^{5}<6.3\times10^{5}\), because the exponents match and \(6.1<6.3\).<br>
      \(2\times10^{-3}>9\times10^{-4}\), because \(-3>-4\).</p>
      <p>The symbols are \(<\), \(>\), \(=\), \(\le\) and \(\ge\). The statement \(x\le y\) is true when \(x&lt;y\) or \(x=y\). The statement \(x\ge y\) is true when \(x>y\) or \(x=y\).</p>
      <h3>Multiplying and dividing</h3>
      <p>Group the coefficients and the powers of ten, then use the exponent rules:
      \[ (a\times10^{m})(c\times10^{n}) = (ac)\times10^{m+n}, \]
      \[ \frac{a\times10^{m}}{c\times10^{n}} = \frac ac\times10^{m-n}. \]</p>
      <p>The product \(ac\) can be 10 or more, and the quotient \(a/c\) can be below 1. Then finish by writing the coefficient between 1 and 10:
      \[ 20\times10^{5} = 2\times10^{1}\times10^{5} = 2\times10^{6}, \]
      \[ 0.8\times10^{1} = 8\times10^{-1}\times10^{1} = 8\times10^{0}. \]
      Because \(1\le a,c<10\), the product is below 100 and the quotient is between 0.1 and 10. So the exponent changes by at most 1.</p>
      <p>Light travels about \(3\times10^{8}\) meters per second and a year is about \(3.2\times10^{7}\) seconds. In a year light covers about \((3\times10^{8})(3.2\times10^{7})=9.6\times10^{15}\) meters.</p>
      <h3>How calculators and spreadsheets show it</h3>
      <p>A screen cannot raise digits, so it writes the power of ten after an E (or e). \(3.2\times10^5\) appears as <b>3.2E5</b>, and \(3.2\times10^{-4}\) as <b>3.2E-4</b>. Some screens add a plus sign, as in <b>3.2E+5</b>. The E means "times ten to the power". It is not Euler's number \(e\approx2.718\). A result too large or too small for the screen switches to this form automatically.</p>`,
    check: [
      { q: String.raw`Which expression is equivalent to \(2^{5}\cdot2^{-3}\)?`,
        choices: [String.raw`\(2^{-15}\)`, String.raw`\(2^{2}\)`, String.raw`\(2^{8}\)`, String.raw`\(2^{-2}\)`], answer: 1,
        why: String.raw`The base is the same, so add the exponents: \(5+(-3)=2\). The answer is \(2^2=4\). Counting factors agrees: five factors of 2 above the bar and three below, so three pairs cancel and two factors remain.`,
        hint: String.raw`Multiplying powers of the same base adds the exponents. Watch the sign of the \(-3\).` },
      { q: String.raw`A website handles \(4\times10^{3}\) requests per second. How many requests is that in \(2.5\times10^{6}\) seconds? Give the answer in scientific notation.`,
        choices: [String.raw`\(10\times10^{9}\)`, String.raw`\(6.5\times10^{9}\)`, String.raw`\(1\times10^{10}\)`, String.raw`\(1\times10^{18}\)`], answer: 2,
        why: String.raw`Multiply the coefficients and add the exponents: \(4\times2.5=10\) and \(3+6=9\), so \(10\times10^{9}\). A coefficient must be below 10, so write \(10=1\times10^{1}\). The answer is \(1\times10^{10}\).`,
        hint: String.raw`Multiply the coefficients, add the exponents, then check that the coefficient is at least 1 and less than 10.` }
    ],
    links: { related: ['exponential-growth', 'similarity-and-scaling'] },

    mount({ stage, controls: C }) {
      const st = { view: 'props', rule: 'mul', a: 3, b: 4, pa: 2, pb: 3, pn: -2, m: 3.2, n: 5, c: 5, w: 8, op: 'mul', m1: 4, n1: 3, m2: 5, n2: 2 };
      const ow = { c: 0, w: 8 };                         /* ruler window used by the multiply/divide/compare view */
      let cancel = () => {}, cancelOw = () => {}, drag = null;
      const hits = [];
      stage.classList.add('split');
      const top = h('div', { class: 'pane', style: 'flex: 1 1 0' }), bot = h('div', { class: 'pane', style: 'flex: 1 1 0' });
      stage.append(top, bot);
      const P1 = new Plane(top, { span: 4 }), P2 = new Plane(bot, { span: 4 });

      const selObj = () => OBJ.findIndex(o => o.n === st.n && Math.abs(o.m - clamp(st.m, 1, 9.9)) < .05);

      /* ---------- models ---------- */
      const hopModel = () => {
        const { rule, a, b, pa, pb, pn } = st;
        if (rule === 'mul') return { hops: [[0, a, 'green'], [a, a + b, 'red']], res: a + b };
        if (rule === 'div') return { hops: [[0, a, 'green'], [a, a - b, 'red']], res: a - b };
        if (rule === 'pow') {
          const hs = [], s = Math.sign(pb);
          for (let i = 0; i < Math.abs(pb); i++) hs.push([i * pa * s, (i + 1) * pa * s, 'green']);
          return { hops: hs, res: pa * pb };
        }
        return { hops: [[0, pn, 'blue']], res: pn };
      };
      const tokenModel = () => {
        const { rule, a, b, pa, pb } = st, tp = [], bt = [], groups = [];
        if (rule === 'pow') {
          const tot = Math.abs(pa * pb), row = pa * pb >= 0 ? tp : bt;
          for (let i = 0; i < tot; i++) row.push({ col: 'green' });
          return { top: tp, bot: bt, res: pa * pb, G: tot ? Math.abs(pb) : 0, gsz: Math.max(1, Math.abs(pa)), groups, cancelled: 0, side: pa * pb >= 0 ? 'top' : 'bot' };
        }
        const bb = rule === 'mul' ? b : -b;
        const put = (n, col) => {
          const row = n >= 0 ? tp : bt;
          if (n) groups.push({ col, side: n >= 0 ? 'top' : 'bot', start: row.length, count: Math.abs(n) });
          for (let i = 0; i < Math.abs(n); i++) row.push({ col });
        };
        put(a, 'green'); put(bb, 'red');
        return { top: tp, bot: bt, res: a + bb, G: 0, gsz: 1, groups, cancelled: Math.min(tp.length, bt.length) };
      };
      const opsModel = () => {
        const { op, m1, n1, m2, n2 } = st;
        if (op === 'cmp') return { cmp: n1 !== n2 ? Math.sign(n1 - n2) : Math.sign(rnd(m1 - m2)), sameExp: n1 === n2 };
        const mul = op === 'mul', raw = mul ? rnd(m1 * m2, 8) : m1 / m2, n = mul ? n1 + n2 : n1 - n2;
        const exact = Math.abs(raw * 1e4 - Math.round(raw * 1e4)) < 1e-6, k = Math.floor(Math.log10(raw) + 1e-9);
        const m = rnd(k >= 0 ? raw / Math.pow(10, k) : raw * Math.pow(10, -k), 8);
        const t = v => (exact ? String(+v.toFixed(4)) : String(+v.toPrecision(3)));
        return { mul, raw, n, k, m, nn: n + k, exact, rt: t(raw), mt: t(m) };
      };
      const relOf = v => (v < 0 ? '<' : v > 0 ? '>' : '=');

      /* ---------- top pane ---------- */
      const propsTop = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, x0 = 20, x1 = W - 20, lo = -13.5, hi = 13.5, pxe = (x1 - x0) / (hi - lo);
        const X = e => x0 + (e - lo) * pxe, ay = H - clamp(H * .17, 40, 50), lvl = k => ay - clamp(H * .13, 34, 46) - k * clamp(H * .1, 26, 36);
        txt(c, 'Exponent line: each tick right is one more factor of 10', 30, 17, 12, pal.muted, { align: 'left', weight: 500, maxW: W - 60 });
        c.lineWidth = 1; c.strokeStyle = pal.grid; c.beginPath();
        for (let e = -13; e <= 13; e++) { c.moveTo(X(e), ay); c.lineTo(X(e), 40); }
        c.stroke();
        line(c, x0, ay, x1, ay, pal['grid-strong'], 2);
        const ls = [1, 2, 4].find(s => pxe * s >= 30) || 4;
        for (let e = -13; e <= 13; e++) {
          const lab = ((e % ls) + ls) % ls === 0;
          line(c, X(e), ay - 3, X(e), ay + (lab ? 9 : 6), lab ? pal.text : pal['grid-strong'], lab ? 2 : 1.5);
          if (lab) txt(c, sg(e), X(e), ay + 21, 12.5, pal.muted, { weight: 500 });
        }
        txt(c, 'exponent', x1, ay + 37, 11, pal.muted, { weight: 500, align: 'right' });
        const M = hopModel(), K = M.hops.length;
        M.hops.forEach(([f, t, col], k) => {
          const y = lvl(k), xf = X(f), xt = X(t), cc = pal[col];
          line(c, xf, ay, xf, y, alpha(cc, .55), 1.5, [4, 5]);
          if (f !== t) {
            const dir = Math.sign(t - f);
            line(c, xf, y, xt - dir * 6, y, cc, 3.5); head(c, xt, y, dir, cc, 10);
          }
          txt(c, signed(t - f), (xf + xt) / 2, y - 13, 13, cc, { halo: pal.stage, weight: 700 });
        });
        const ye = lvl(Math.max(K - 1, 0));
        line(c, X(M.res), ay, X(M.res), ye, alpha(pal.yellow, .85), 2, [4, 5]);
        c.beginPath(); c.arc(X(0), ay, 5.5, 0, TAU); c.fillStyle = pal.blue; c.fill();
        c.beginPath(); c.arc(X(M.res), ay, 7, 0, TAU); c.fillStyle = pal.yellow; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 2; c.stroke();
        rich(c, [T('10'), U(sg(M.res))], clamp(X(M.res), 40, W - 40), ye - 30, 17, { color: pal.yellow, weight: 700, halo: pal.stage });
      };

      const sciTop = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, lo = st.c - st.w / 2, hi = st.c + st.w / 2;
        const R = ruler(c, p, lo, hi, true), { X, ay, x0, x1 } = R;
        txt(c, 'Size in meters. Each tick is 10 times larger.', 30, 17, 12, pal.muted, { align: 'left', weight: 500, maxW: W - 60 });
        hits.length = 0;
        const m = clamp(st.m, 1, 9.9), pm = Math.log10(m) + st.n, sel = selObj(), mx = X(pm);
        const laneH = clamp(H * .085, 19, 24), maxLane = Math.max(0, Math.floor((ay - 28 - 66) / laneH));
        const items = []; let nl = 0, nr = 0;
        OBJ.forEach((o, i) => {
          const e = Math.log10(o.m) + o.n;
          if (e < lo - 1e-9) { nl++; return; }
          if (e > hi + 1e-9) { nr++; return; }
          c.font = `600 12.5px ${FONT}`;
          const w = c.measureText(o.short).width + 4, x = X(e);
          items.push({ i, x, w, lx: clamp(x, x0 + w / 2 - 6, x1 - w / 2 + 6), lane: -1 });
        });
        lanes([...items].sort((a, b) => (b.i === sel) - (a.i === sel)), maxLane);
        const inWin = pm >= lo && pm <= hi;
        if (inWin) line(c, mx, ay, mx, 52, alpha(pal.yellow, .85), 2, [5, 5]);
        for (const it of items) if (it.lane >= 0) line(c, it.x, ay - 6, it.x, ay - 26 - it.lane * laneH + 9, alpha(pal.blue, .5), 1.5);
        for (const it of items) {
          c.beginPath(); c.arc(it.x, ay, 5.5, 0, TAU); c.fillStyle = pal.blue; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 2; c.stroke();
          hits.push({ i: it.i, dot: true, x: it.x, y: ay });
          if (it.i === sel) { c.beginPath(); c.arc(it.x, ay, 9, 0, TAU); c.strokeStyle = pal.yellow; c.lineWidth = 3; c.stroke(); }
        }
        for (const it of items) {
          if (it.lane < 0) continue;
          const y = ay - 26 - it.lane * laneH;
          txt(c, OBJ[it.i].short, it.lx, y, 12.5, it.i === sel ? pal.text : pal.muted, { weight: it.i === sel ? 800 : 600, halo: pal.stage });
          hits.push({ i: it.i, l: it.lx - it.w / 2 - 3, r: it.lx + it.w / 2 + 3, t: y - 10, b: y + 10 });
        }
        if (inWin && sel < 0) { c.beginPath(); c.arc(mx, ay, 6.5, 0, TAU); c.fillStyle = pal.yellow; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 2; c.stroke(); }
        const lab = [T(cs1(m)), T(' ' + TIMES + ' 10'), U(sg(st.n))];
        if (inWin) rich(c, lab, clamp(mx, 56, W - 56), 36, 14, { color: pal.yellow, weight: 700, halo: pal.stage });
        else if (pm < lo) rich(c, [T('‹ '), ...lab], x0, 36, 14, { color: pal.yellow, weight: 700, halo: pal.stage, align: 'left' });
        else rich(c, [...lab, T(' ›')], x1, 36, 14, { color: pal.yellow, weight: 700, halo: pal.stage, align: 'right' });
        if (nl) txt(c, '‹ ' + nl, x0, ay - 12, 11.5, pal.muted, { align: 'left', weight: 600, halo: pal.stage });
        if (nr) txt(c, nr + ' ›', x1, ay - 12, 11.5, pal.muted, { align: 'right', weight: 600, halo: pal.stage });
      };

      const opsTarget = s => {
        const pA = Math.log10(s.m1) + s.n1, pB = Math.log10(s.m2) + s.n2, ps = [pA, pB];
        if (s.op === 'mul') ps.push(pA + pB, 0); else if (s.op === 'div') ps.push(pA - pB, 0);
        let lo = Math.min(...ps) - 1.3, hi = Math.max(...ps) + 1.3;
        if (hi - lo < 6) { const mid = (lo + hi) / 2; lo = mid - 3; hi = mid + 3; }
        return { c: (lo + hi) / 2, w: hi - lo };
      };
      const opsTop = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, M = opsModel(), lo = ow.c - ow.w / 2, hi = ow.c + ow.w / 2;
        const { X, ay, x0, x1 } = ruler(c, p, lo, hi, false);
        const cap = st.op === 'mul' ? 'Multiplying adds distances from 1 on this ruler.' : st.op === 'div' ? 'Dividing subtracts distances from 1 on this ruler.' : 'On this ruler the larger number is farther right.';
        txt(c, cap, 30, 17, 12, pal.muted, { align: 'left', weight: 500, maxW: W - 60 });
        const pA = Math.log10(st.m1) + st.n1, pB = Math.log10(st.m2) + st.n2, cmp = st.op === 'cmp';
        const pR = st.op === 'mul' ? pA + pB : pA - pB;
        if (!cmp) {
          const bar = (a, b, y) => {
            const dir = Math.sign(b - a) || 1;
            if (Math.abs(b - a) < 1e-9) return;
            line(c, X(a), y, X(b) - dir * 4, y, alpha(pal.violet, .9), 4); head(c, X(b), y, dir, pal.violet, 9);
          };
          bar(0, pB, ay - 10); bar(pA, pR, ay - 19);
        }
        const mk = (pos, items, y, col) => {
          const x = X(pos);
          line(c, x, ay - 6, x, y + 9, alpha(col, .55), 1.5);
          c.beginPath(); c.arc(x, ay, 6, 0, TAU); c.fillStyle = col; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 2; c.stroke();
          rich(c, items, clamp(x, 60, W - 60), y, 13.5, { color: col, weight: 700, halo: pal.stage });
        };
        const y1 = ay - 40, y2 = ay - 68, y3 = ay - 96;
        mk(pA, [T('1st ', pal.muted), ...sci(csN(st.m1), st.n1, pal.blue, pal.blue, pal.blue)], y1, pal.blue);
        mk(pB, [T('2nd ', pal.muted), ...sci(csN(st.m2), st.n2, pal.blue, pal.blue, pal.blue)], y2, pal.blue);
        if (!cmp) mk(pR, [T('= ', pal.muted), ...sci(csN(M.m), M.nn, pal.yellow, pal.yellow, pal.yellow)], y3, pal.yellow);
        if (!cmp && lo <= 0 && hi >= 0) txt(c, '10⁰ = 1', X(0), ay + 37, 11, pal.muted, { weight: 500 });
      };

      /* ---------- bottom pane ---------- */
      const ladder = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, u = clamp(H / 260, .8, 1.35), n = st.pn, cen = clamp(n, -3, 3), rows = 7;
        const cw = Math.min(W - 24, 540), L = (W - cw) / 2;
        txt(c, 'Each step down the ladder divides by 10', W / 2, H * .085, 14 * u, pal.muted, { weight: 500, maxW: W - 24 });
        const y0 = H * .16, rh = (H * .95 - y0) / rows, fs = clamp(rh * .58, 12, 20);
        for (let i = 0; i < rows; i++) {
          const k = cen + 3 - i, y = y0 + (i + .5) * rh, cur = k === n;
          if (cur) {
            c.beginPath(); c.roundRect ? c.roundRect(L + cw * .17, y - rh * .46, cw * .83, rh * .92, 7) : c.rect(L + cw * .17, y - rh * .46, cw * .83, rh * .92);
            c.fillStyle = alpha(pal.blue, .13); c.fill(); c.strokeStyle = alpha(pal.blue, .6); c.lineWidth = 1.5; c.stroke();
          }
          rich(c, [T('10', pal.text), U(sg(k), cur ? pal.blue : pal.text)], L + cw * .38, y, fs, { align: 'right', weight: cur ? 800 : 600 });
          txt(c, '=', L + cw * .42, y, fs, pal.muted, { weight: 500 });
          txt(c, valTxt(k), L + cw * .46, y, fs, k === 0 ? pal.yellow : pal.text, { align: 'left', weight: cur || k === 0 ? 800 : 600, maxW: cw * .52 });
          if (i < rows - 1) {
            const ym = y0 + (i + 1) * rh, ax = L + cw * .02;
            c.beginPath(); c.moveTo(ax, ym - 4); c.lineTo(ax + 9, ym - 4); c.lineTo(ax + 4.5, ym + 4); c.closePath(); c.fillStyle = pal.red; c.fill();
            txt(c, '\u00F7 10', ax + 15, ym, 11.5 * u, pal.red, { align: 'left', weight: 600 });
          }
        }
      };

      const propsBottom = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, u = clamp(H / 260, .8, 1.35), { rule, a, b, pa, pb } = st;
        if (rule === 'pat') { ladder(c, p); return; }
        const M = tokenModel(), N = Math.max(M.top.length, M.bot.length), net0 = M.res === 0 && N > 0;
        const E = (n, col) => [T('10', pal.text), U(sg(n), col)], hs = clamp(H * .085, 18, 28);
        const hd = rule === 'mul' ? [...E(a, pal.green), T(' · ', pal.muted), ...E(b, pal.red)]
          : rule === 'div' ? [...E(a, pal.green), T(' ÷ ', pal.muted), ...E(b, pal.red)]
          : [T('(10', pal.text), U(sg(pa), pal.green), T(')', pal.text), U(sg(pb), pal.red)];
        rich(c, [...hd, T('  =  ', pal.muted), ...E(M.res, pal.yellow)], W / 2, H * .115, hs, { maxW: W - 24 });

        const padX = 16, reserve = net0 ? 62 : 0, G = M.G, extra = G > 1 ? (G - 1) * .5 : 0;
        const availW = W - 2 * padX - reserve, pitch = N ? Math.min(44, availW / (N + extra)) : 30, r = clamp(pitch * .42, 5, 19), gap = pitch * .5;
        const blockW = N ? N * pitch + (G > 1 ? (G - 1) * gap : 0) : 0, sx = (W - blockW - reserve) / 2;
        const cx = i => sx + i * pitch + pitch / 2 + (G > 1 ? Math.floor(i / M.gsz) * gap : 0);
        const barY = H * .54, topY = barY - r - 10, botY = barY + r + 10;

        if (N === 0) {
          txt(c, '1', W / 2, barY, 40 * u, pal.yellow, { weight: 800 });
          txt(c, 'no factors of 10 are left', W / 2, barY + 34 * u, 13 * u, pal.muted, { weight: 500 });
        } else {
          line(c, sx - 8, barY, sx + blockW + 8, barY, pal.text, 2.5);
          const tok = (x, y, t, faded, ring) => {
            if (ring) { c.beginPath(); c.arc(x, y, r + 3.5, 0, TAU); c.strokeStyle = pal.yellow; c.lineWidth = 3; c.stroke(); }
            c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = alpha(pal[t.col], faded ? .2 : .92); c.fill();
            if (r >= 8.5) txt(c, '10', x, y + .5, r * 1.02, faded ? pal.muted : pal.stage, { weight: 800 });
            if (faded) line(c, x - r * .85, y + r * .85, x + r * .85, y - r * .85, pal.muted, 2);
          };
          const k = M.cancelled;
          M.top.forEach((t, i) => tok(cx(i), topY, t, i < k, k > 0 && i >= k && M.top.length > M.bot.length));
          M.bot.forEach((t, i) => tok(cx(i), botY, t, i < k, k > 0 && i >= k && M.bot.length > M.top.length));
          if (!M.bot.length) txt(c, '1', cx(0), botY, 15 * u, pal.muted, { weight: 600 });
          if (!M.top.length) txt(c, '1', cx(0), topY, 15 * u, pal.muted, { weight: 600 });
          if (rule === 'pow') {
            const y = M.side === 'top' ? topY : botY;
            for (let g = 0; g < M.G; g++) {
              const l = cx(g * M.gsz) - r - 5, rr = cx((g + 1) * M.gsz - 1) + r + 5;
              c.beginPath(); c.roundRect ? c.roundRect(l, y - r - 6, rr - l, 2 * r + 12, 9) : c.rect(l, y - r - 6, rr - l, 2 * r + 12);
              c.strokeStyle = alpha(pal.green, .7); c.lineWidth = 1.6; c.stroke();
              rich(c, [T('10', pal.green), U(sg(pa), pal.green)], (l + rr) / 2, M.side === 'top' ? y - r - 21 : y + r + 21, 12.5 * u, { weight: 700 });
            }
          } else {
            for (const g of M.groups) {
              const xa = cx(g.start), xb = cx(g.start + g.count - 1), wide = g.count * pitch >= 66;
              txt(c, wide ? plural(g.count, 'factor') : String(g.count), (xa + xb) / 2, g.side === 'top' ? topY - r - 15 : botY + r + 15, 12.5 * u, pal[g.col], { weight: 700 });
            }
          }
          if (net0) txt(c, '= 1', sx + blockW + 16, barY, 26 * u, pal.yellow, { align: 'left', weight: 800 });
        }
        rich(c, [...E(M.res, pal.yellow), T(' = ' + valTxt(M.res), pal.text)], W / 2, H * .92, 15 * u, { maxW: W - 24 });
      };

      const sciBottom = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, u = clamp(H / 260, .78, 1.4), m = clamp(st.m, 1, 9.9), n = st.n, D = decim(m, n), sel = selObj();
        txt(c, sel >= 0 ? `${OBJ[sel].name} (${OBJ[sel].what}) in meters, about` : 'The same number written two ways', W / 2, H * .06, 12.5 * u, pal.muted, { weight: 500, maxW: W - 24 });
        rich(c, [T(D.text, pal.text), T('  =  ', pal.muted), ...sci(D.ms, n, pal.green, pal.red, pal.text)], W / 2, H * .15, 22 * u, { maxW: W - 24 });

        const nC = D.cells.length, padX = 14, gB = D.pt === D.ob ? [D.pt] : [D.pt, D.ob], gapF = .5;
        const pitch = Math.min(38, (W - 2 * padX) / (nC + gB.length * gapF)), gw = pitch * gapF;
        const leftOf = i => sx + i * pitch + gw * gB.filter(b => b <= i).length;
        const total = nC * pitch + gw * gB.length, sx = (W - total) / 2;
        const bx = b => leftOf(b) - gw / 2;
        const cellW = pitch * .86, cellH = Math.min(pitch * 1.25, H * .17), stripY = H * .55, top = stripY - cellH / 2, base = stripY + cellH / 2 - 6;

        D.cells.forEach((ch, i) => {
          const x = leftOf(i) + (pitch - cellW) / 2, kd = D.kinds[i];
          c.beginPath(); c.roundRect ? c.roundRect(x, top, cellW, cellH, 5) : c.rect(x, top, cellW, cellH);
          c.fillStyle = kd === 'sig' ? alpha(pal.green, .16) : alpha(pal['grid-strong'], .12); c.fill();
          c.strokeStyle = kd === 'sig' ? alpha(pal.green, .85) : pal['grid-strong']; c.lineWidth = kd === 'sig' ? 2 : 1.2; c.setLineDash(kd === 'sig' ? [] : [3, 3]); c.stroke(); c.setLineDash([]);
          txt(c, ch, x + cellW / 2, stripY, clamp(cellH * .62, 13, 26), kd === 'sig' ? pal.green : pal.muted, { weight: kd === 'sig' ? 800 : 600 });
        });

        const xo = bx(D.ob), xp = bx(D.pt), sy = top - 20;
        if (n !== 0) {
          for (let i = Math.min(D.ob, D.pt); i < Math.max(D.ob, D.pt); i++) {
            const idx = n > 0 ? i - D.ob + 1 : D.ob - i;
            txt(c, String(idx), leftOf(i) + pitch / 2, top - 9, clamp(pitch * .36, 10, 13) * 1, pal.red, { weight: 700 });
          }
          line(c, xo, base, xo, sy, alpha(pal.yellow, .7), 1.5, [3, 4]); line(c, xp, base, xp, sy, alpha(pal.yellow, .7), 1.5, [3, 4]);
          const depth = clamp(Math.abs(xp - xo) * .16, 10, H * .09);
          c.beginPath(); c.moveTo(xo, sy); c.quadraticCurveTo((xo + xp) / 2, sy - 2 * depth, xp, sy - 8); c.strokeStyle = pal.red; c.lineWidth = 3; c.lineCap = 'round'; c.stroke();
          c.beginPath(); c.moveTo(xp, sy + 1); c.lineTo(xp - 5.5, sy - 9); c.lineTo(xp + 5.5, sy - 9); c.closePath(); c.fillStyle = pal.red; c.fill();
          txt(c, `${plural(Math.abs(n), 'place')} ${n > 0 ? 'right' : 'left'}`, (xo + xp) / 2, sy - depth - 12, 12.5 * u, pal.red, { weight: 700, halo: pal.stage });
          c.beginPath(); c.arc(xo, base, 5.5, 0, TAU); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.yellow; c.lineWidth = 2.5; c.stroke();
        }
        c.beginPath(); c.arc(xp, base, 4.5, 0, TAU); c.fillStyle = pal.yellow; c.fill();

        const cap = n > 0 ? 'Positive exponent: a big number, 10 or more' : n < 0 ? 'Negative exponent: a small number, less than 1' : 'Exponent 0: the decimal point stays, and the number is from 1 to 10';
        txt(c, cap, W / 2, stripY + cellH / 2 + 22 * u, 13 * u, pal.muted, { weight: 500, maxW: W - 24 });

        /* calculator display */
        const cy = H * .88, bh = clamp(H * .13, 28, 42), calc = `${D.ms}E${n}`;
        c.font = `700 ${(bh * .55).toFixed(1)}px ${MONO}`;
        const tw = c.measureText(calc).width, bw = Math.max(tw + 26, 80 * u);
        c.font = `500 ${(12.5 * u).toFixed(1)}px ${FONT}`;
        const lw = c.measureText('calculator shows').width, note = `E${n} means ${TIMES} 10`;
        const nw = c.measureText(note).width + 14 * u, all = lw + 10 + bw + 10 + nw, bx0 = Math.max(10, (W - all) / 2) + lw + 10;
        txt(c, 'calculator shows', bx0 - 10, cy, 12.5 * u, pal.muted, { align: 'right', weight: 500 });
        c.beginPath(); c.roundRect ? c.roundRect(bx0, cy - bh / 2, bw, bh, 7) : c.rect(bx0, cy - bh / 2, bw, bh);
        c.fillStyle = alpha(pal.text, .06); c.fill(); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.stroke();
        rich(c, [T(D.ms, pal.green), T('E' + n, pal.red)], bx0 + bw - 12, cy + 1, bh * .55, { align: 'right', fam: MONO, weight: 700 });
        rich(c, [T(note, pal.muted), U(sg(n), pal.muted)], bx0 + bw + 10, cy, 12.5 * u, { align: 'left', weight: 500 });
      };

      const opsBottom = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, u = clamp(H / 260, .8, 1.35), M = opsModel(), { m1, n1, m2, n2, op } = st;
        const f = 15 * u, mw = W - 24, cm = pal.green, cn = pal.red;
        const num1 = [T('(', pal.muted), ...sci(csN(m1), n1, cm, cn, pal.text), T(')', pal.muted)];
        const num2 = [T('(', pal.muted), ...sci(csN(m2), n2, cm, cn, pal.text), T(')', pal.muted)];
        if (op === 'cmp') {
          const s = relOf(M.cmp), bar = (y, items, z, o = {}) => rich(c, items, W / 2, y, z, { maxW: mw, ...o });
          bar(H * .1, [...sci(csN(m1), n1, cm, cn, pal.text), T('   ?   ', pal.muted), ...sci(csN(m2), n2, cm, cn, pal.text)], 21 * u);
          txt(c, 'Compare the exponents first', W / 2, H * .225, 12.5 * u, pal.muted, { weight: 500 });
          bar(H * .315, [T(sg(n1), cn), T(`  ${relOf(Math.sign(n1 - n2))}  `, pal.muted), T(sg(n2), cn)], 19 * u);
          if (M.sameExp) {
            txt(c, 'The exponents are equal, so compare the coefficients', W / 2, H * .425, 12.5 * u, pal.muted, { weight: 500, maxW: mw });
            bar(H * .515, [T(csN(m1), cm), T(`  ${relOf(Math.sign(rnd(m1 - m2)))}  `, pal.muted), T(csN(m2), cm)], 19 * u);
          } else {
            txt(c, 'The coefficients only matter when the exponents match', W / 2, H * .425, 12.5 * u, pal.muted, { weight: 500, maxW: mw });
          }
          const ok = s === '<' ? ['<', '≤'] : s === '>' ? ['>', '≥'] : ['=', '≤', '≥'];
          txt(c, 'which symbols are true', W / 2, H * .615, 12.5 * u, pal.muted, { weight: 500 });
          const glyphs = ['<', '>', '=', '≤', '≥'], gx = W / 2 - 2 * 42 * u;
          glyphs.forEach((g, i) => {
            const on = ok.includes(g), x = gx + i * 42 * u, y = H * .74;
            if (on) { c.beginPath(); c.arc(x, y, 15 * u, 0, TAU); c.fillStyle = alpha(pal.yellow, .2); c.fill(); c.strokeStyle = pal.yellow; c.lineWidth = 2; c.stroke(); }
            txt(c, g, x, y + 1, (on ? 22 : 19) * u, on ? pal.text : pal.muted, { weight: on ? 800 : 500 });
          });
          bar(H * .91, [...sci(csN(m1), n1, cm, cn, pal.text), T(`   ${s}   `, pal.yellow), ...sci(csN(m2), n2, cm, cn, pal.text)], 24 * u, { weight: 700 });
          return;
        }
        const OPW = op === 'mul' ? ' ' + TIMES + ' ' : ' ÷ ';
        rich(c, [...num1, T(OPW, pal.muted), ...num2], W / 2, H * .1, 21 * u, { maxW: mw });
        const lx = W * .26, rx = W * .74, cw = W * .46;
        txt(c, op === 'mul' ? 'coefficients: multiply' : 'coefficients: divide', lx, H * .235, 12.5 * u, cm, { weight: 600, maxW: cw });
        txt(c, op === 'mul' ? 'exponents: add' : 'exponents: subtract', rx, H * .235, 12.5 * u, cn, { weight: 600, maxW: cw });
        txt(c, `${csN(m1)} ${op === 'mul' ? TIMES : '÷'} ${csN(m2)} ${M.exact ? '=' : '≈'} ${M.rt}`, lx, H * .325, 17 * u, cm, { weight: 700, maxW: cw });
        txt(c, `${sg(n1)} ${op === 'mul' ? '+' : MINUS} ${par(n2)} = ${sg(M.n)}`, rx, H * .325, 17 * u, cn, { weight: 700, maxW: cw });
        rich(c, [T(M.exact ? 'so  ' : 'so about  ', pal.muted), ...sci(M.rt, M.n, cm, cn, pal.text)], W / 2, H * .44, 19 * u, { maxW: mw });
        if (M.k === 0) {
          txt(c, `${M.rt} is at least 1 and less than 10, so we are done`, W / 2, H * .56, f, pal.muted, { weight: 500, maxW: mw });
        } else {
          txt(c, `${M.rt} is ${M.k > 0 ? 'not less than 10' : 'less than 1'}, so rewrite it`, W / 2, H * .56, f, pal.muted, { weight: 500, maxW: mw });
          rich(c, [T(M.rt, cm), T(` ${M.exact ? '=' : '≈'} `, pal.muted), T(csN(M.m), cm), T(' ' + TIMES + ' 10', pal.text), U(sg(M.k), pal.text)], W / 2, H * .665, f + 1, { maxW: mw });
          rich(c, [T(M.rt, cm), T(' ' + TIMES + ' 10', pal.text), U(sg(M.n), cn), T(` ${M.exact ? '=' : '≈'} `, pal.muted), T(csN(M.m), cm), T(' ' + TIMES + ' 10', pal.text), U(sg(M.k), pal.text),
            T(' ' + TIMES + ' 10', pal.text), U(sg(M.n), cn)], W / 2, H * .765, f + 1, { maxW: mw });
        }
        const ans = sci(csN(M.m), M.nn, cm, cn, pal.text);
        const tmp = rich(c, [T('answer  ', pal.muted), ...ans], W / 2, H * .905, 24 * u, { maxW: mw, weight: 700 });
        c.beginPath(); c.roundRect ? c.roundRect(tmp.left - 12, H * .905 - 20 * u, tmp.w + 24, 40 * u, 9) : c.rect(tmp.left - 12, H * .905 - 20 * u, tmp.w + 24, 40 * u);
        c.strokeStyle = pal.yellow; c.lineWidth = 2.5; c.stroke();
      };

      /* ---------- controls ---------- */
      const ro = C.readout(), host = ro.parentElement;
      const grab = fn => { const n0 = host.children.length; fn(); return [...host.children].slice(n0); };
      const showEls = (els, on) => els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const iFmt = v => sg(Math.round(v));

      const redraw = () => { P1.requestDraw(); P2.requestDraw(); upd(); };
      const fitOps = (s = st, immediate = false) => {
        cancelOw();
        const t = opsTarget(s);
        if (immediate) { ow.c = t.c; ow.w = t.w; P1.requestDraw(); } else cancelOw = animateTo(ow, t, 300, () => P1.draw());
      };
      const follow = () => {
        const pm = Math.log10(clamp(st.m, 1, 9.9)) + st.n, lo = st.c - st.w / 2, hi = st.c + st.w / 2;
        if (pm < lo + .4 || pm > hi - .4) { cancel(); cancel = animateTo(st, { c: clamp(pm, -9, 10) }, 400, sync); }
      };
      const editInt = key => v => {
        cancel(); st[key] = Math.round(v);
        if (key === 'n') follow();
        if (key === 'n1' || key === 'n2') fitOps();
        redraw();
      };
      const editNum = key => v => {
        cancel(); st[key] = v;
        if (key === 'm') follow();
        if (key === 'm1' || key === 'm2') fitOps();
        redraw();
      };

      let pick, ruleBtns, opBtns, aS, bS, paS, pbS, pnS, zoomS, cenS, mS, nS, m1S, n1S, m2S, n2S;
      const gRule = grab(() => {
        C.title('Exponent rule');
        ruleBtns = C.buttons([
          { label: 'Multiply', onClick: () => setRule('mul') }, { label: 'Divide', onClick: () => setRule('div') },
          { label: 'Power', onClick: () => setRule('pow') }, { label: 'Zero & negative', onClick: () => setRule('pat') }]);
        C.hint('Pick a rule, then slide the exponents.');
      });
      const gAB = grab(() => {
        aS = C.slider({ label: 'First exponent a', min: -6, max: 6, step: 1, value: st.a, format: iFmt, onInput: editInt('a') });
        bS = C.slider({ label: 'Second exponent b', min: -6, max: 6, step: 1, value: st.b, format: iFmt, onInput: editInt('b') });
      });
      const gPow = grab(() => {
        paS = C.slider({ label: 'Inner exponent a', min: -4, max: 4, step: 1, value: st.pa, format: iFmt, onInput: editInt('pa') });
        pbS = C.slider({ label: 'Outer exponent b', min: -3, max: 3, step: 1, value: st.pb, format: iFmt, onInput: editInt('pb') });
      });
      const gPat = grab(() => {
        pnS = C.slider({ label: 'Exponent n', min: -6, max: 6, step: 1, value: st.pn, format: iFmt, onInput: editInt('pn') });
      });
      const gWin = grab(() => {
        C.title('Window on the ruler');
        zoomS = C.slider({ label: 'Zoom: powers of ten in view', min: 4, max: 24, step: 1, value: st.w, format: v => String(Math.round(v)), onInput: editNum('w') });
        cenS = C.slider({ label: 'Slide the window (center exponent)', min: -9, max: 10, step: .5, value: st.c, format: num, onInput: editNum('c') });
        C.buttons([
          { label: 'Tiny', onClick: () => goWin(-5, 8) }, { label: 'Everyday', onClick: () => goWin(1, 8) },
          { label: 'Huge', onClick: () => goWin(7, 8) }, { label: 'All', onClick: () => goWin(1, 20) }]);
      });
      const gNum = grab(() => {
        C.title('Your number');
        mS = C.slider({ label: 'Coefficient a', min: 1, max: 9.9, step: .1, value: st.m, format: v => v.toFixed(1), onInput: editNum('m') });
        nS = C.slider({ label: 'Exponent n', min: -9, max: 9, step: 1, value: st.n, format: iFmt, onInput: editInt('n') });
        pick = C.select({ label: 'Or load an object\'s size', value: '', onChange: v => { if (v !== '') loadObj(+v); } , options: [{ value: '', label: 'Choose an object' }, ...OBJ.map((o, i) => ({ value: String(i), label: o.name }))] });
        C.hint('You can also tap an object on the ruler. Drag the ruler to slide it.');
      });
      const gOps = grab(() => {
        opBtns = C.buttons([
          { label: 'Multiply', onClick: () => setOp('mul') }, { label: 'Divide', onClick: () => setOp('div') }, { label: 'Compare', onClick: () => setOp('cmp') }]);
        C.title('First number');
        m1S = C.slider({ label: 'Coefficient', min: 1, max: 9.5, step: .5, value: st.m1, format: v => v.toFixed(1), onInput: editNum('m1') });
        n1S = C.slider({ label: 'Exponent', min: -9, max: 9, step: 1, value: st.n1, format: iFmt, onInput: editInt('n1') });
        C.title('Second number');
        m2S = C.slider({ label: 'Coefficient', min: 1, max: 9.5, step: .5, value: st.m2, format: v => v.toFixed(1), onInput: editNum('m2') });
        n2S = C.slider({ label: 'Exponent', min: -9, max: 9, step: 1, value: st.n2, format: iFmt, onInput: editInt('n2') });
      });
      host.append(ro);

      const ctl = () => {
        const v = st.view, md = st.rule === 'mul' || st.rule === 'div';
        showEls(gRule, v === 'props'); showEls(gAB, v === 'props' && md); showEls(gPow, v === 'props' && st.rule === 'pow'); showEls(gPat, v === 'props' && st.rule === 'pat');
        showEls(gWin, v === 'sci'); showEls(gNum, v === 'sci'); showEls(gOps, v === 'ops');
        ruleBtns.forEach((b, i) => b.classList.toggle('primary', RULES[i] === st.rule));
        opBtns.forEach((b, i) => b.classList.toggle('primary', OPS[i] === st.op));
      };
      const sync = () => {
        aS.set(st.a); bS.set(st.b); paS.set(st.pa); pbS.set(st.pb); pnS.set(st.pn);
        zoomS.set(st.w); cenS.set(st.c); mS.set(st.m); nS.set(st.n);
        m1S.set(st.m1); n1S.set(st.n1); m2S.set(st.m2); n2S.set(st.n2);
        pick.value = selObj() >= 0 ? String(selObj()) : '';
        ctl(); P1.draw(); P2.draw(); upd();
      };
      const setRule = r => { cancel(); st.rule = r; sync(); };
      const setOp = o => { cancel(); st.op = o; fitOps(); sync(); };
      const loadObj = i => {
        cancel(); const o = OBJ[i];
        st.n = o.n; nS.set(o.n);
        cancel = animateTo(st, { m: o.m }, 450, sync);
      };
      const goWin = (cc, ww) => { cancel(); cancel = animateTo(st, { c: cc, w: ww }, 700, sync); };

      /* ---------- readout ---------- */
      const K = s => `<span class="k">${s}</span>`;
      function upd() {
        let s = '';
        if (st.view === 'props') {
          const M = tokenModel(), { rule, a, b, pa, pb, pn } = st, res = rule === 'pat' ? pn : M.res;
          if (rule === 'mul') s = `${K('Rule')} ${pw('a')} · ${pw('b')} = ${pw('a+b')}<br>${K('Here')} ${pw(a)} · ${pw(b)}<br>${K('Exponents')} ${sg(a)} + ${par(b)} = ${sg(res)}`;
          else if (rule === 'div') s = `${K('Rule')} ${pw('a')} ÷ ${pw('b')} = ${pw('a−b')}<br>${K('Here')} ${pw(a)} ÷ ${pw(b)}<br>${K('Exponents')} ${sg(a)} − ${par(b)} = ${sg(res)}`;
          else if (rule === 'pow') s = `${K('Rule')} (${pw('a')})<sup>b</sup> = ${pw('a·b')}<br>${K('Here')} (${pw(pa)})<sup>${sg(pb)}</sup><br>${K('Exponents')} ${sg(pa)} ${TIMES} ${par(pb)} = ${sg(res)}`;
          else {
            const how = pn > 0 ? `${pw(pn)} = ${Array(pn).fill('10').join(' · ')}` : pn === 0 ? `${pw(0)} = 1` : `${pw(pn)} = 1/${pw(-pn)}`;
            s = `${K('Exponent')} n = ${sg(pn)}<br>${K('Meaning')} ${how}`;
          }
          s += `<br>${K('Result')} ${pw(res)} = ${valTxt(res)}`;
          if (rule === 'mul' || rule === 'div') {
            if (M.cancelled) s += `<br>${K('Cancelled')} ${plural(M.cancelled, 'pair')}<br>${K('Left')} ` + (res > 0 ? `${plural(res, 'factor')} on top` : res < 0 ? `${plural(-res, 'factor')} under the bar` : 'none, so the result is 1');
          }
        } else if (st.view === 'sci') {
          const D = decim(st.m, st.n), sel = selObj(), n = st.n;
          if (sel >= 0) s += `${K('Selected')} ${OBJ[sel].name} (${OBJ[sel].what}), about ${D.text} m<br>`;
          s += `${K('Scientific notation')} ${sciH(D.ms, n)}<br>${K('Standard form')} ${D.text}<br>${K('Calculator')} ${D.ms}E${n}<br>${K('Decimal point')} ` +
            (n === 0 ? 'does not move' : `${plural(Math.abs(n), 'place')} ${n > 0 ? 'right' : 'left'}`);
        } else {
          const M = opsModel(), { m1, n1, m2, n2, op } = st, A = sciH(csN(m1), n1), B = sciH(csN(m2), n2);
          if (op === 'cmp') {
            s = `${K('Compare')} ${A} ? ${B}<br>${K('Exponents')} ${sg(n1)} ${relOf(Math.sign(n1 - n2))} ${sg(n2)}`;
            if (M.sameExp) s += `<br>${K('Coefficients')} ${csN(m1)} ${relOf(Math.sign(rnd(m1 - m2)))} ${csN(m2)}`;
            s += `<br>${K('So')} ${A} ${relOf(M.cmp)} ${B}<br>${K('True symbols')} ` + (M.cmp < 0 ? '&lt; and ≤' : M.cmp > 0 ? '&gt; and ≥' : '=, ≤ and ≥');
          } else {
            const eq = M.exact ? '=' : '≈';
            s = `${K('Problem')} (${A}) ${op === 'mul' ? TIMES : '÷'} (${B})<br>${K('Coefficients')} ${csN(m1)} ${op === 'mul' ? TIMES : '÷'} ${csN(m2)} ${eq} ${M.rt}<br>` +
              `${K('Exponents')} ${sg(n1)} ${op === 'mul' ? '+' : '−'} ${par(n2)} = ${sg(M.n)}<br>`;
            s += M.k === 0 ? `${K('Check')} ${M.rt} is between 1 and 10<br>` : `${K('Before fixing')} ${sciH(M.rt, M.n)}<br>${K('Rewrite')} ${M.rt} ${eq} ${csN(M.m)} ${TIMES} ${pw(M.k)}<br>`;
            s += `${K('Answer')} ${sciH(csN(M.m), M.nn)}`;
          }
        }
        ro.innerHTML = s;
      }

      /* ---------- dragging the ruler ---------- */
      const hitObj = (px, py) => {
        let best = -1, bd = 1e9;
        for (const q of hits) {
          const d = q.dot ? (Math.hypot(px - q.x, py - q.y) <= 15 ? Math.hypot(px - q.x, py - q.y) : 1e9)
            : (px >= q.l && px <= q.r && py >= q.t && py <= q.b ? 0 : 1e9);
          if (d < bd) { bd = d; best = q.i; }
        }
        return best;
      };
      draggable(P1, {
        hit: (px, py) => {
          if (st.view !== 'sci') return null;
          drag = null;
          const o = hitObj(px, py);
          return o >= 0 ? o : 'pan';
        },
        move: (hd, x) => {
          if (!drag) {
            drag = { x0: x, c0: st.c, moved: false };
            if (typeof hd === 'number') { loadObj(hd); return; }
          }
          if (!drag.moved && Math.abs(x - drag.x0) < 6) return;
          drag.moved = true; cancel();
          const pxd = (P1.w - 36) / st.w;
          st.c = clamp(drag.c0 - (x - drag.x0) / pxd, -9, 10);
          cenS.set(st.c); P1.requestDraw();
        }
      });

      /* ---------- scene ---------- */
      P1.onDraw = (c, p) => {
        p.span = Math.min(p.w, p.h) / 2; p.cx = p.w / 2; p.cy = p.h / 2;     /* math coordinates = pixels (y flipped) */
        if (st.view === 'props') propsTop(c, p); else if (st.view === 'sci') sciTop(c, p); else opsTop(c, p);
      };
      P2.onDraw = (c, p) => {
        if (st.view === 'props') propsBottom(c, p); else if (st.view === 'sci') sciBottom(c, p); else opsBottom(c, p);
      };

      const apply = (patch, immediate) => {
        cancel();
        const anim = {};
        for (const [k, v] of Object.entries(patch)) { if (FLAGS.includes(k) || INTS.includes(k)) st[k] = v; else anim[k] = v; }
        if (st.view === 'ops') fitOps({ ...st, ...anim }, immediate);
        if (immediate || !Object.keys(anim).length) { Object.assign(st, anim); sync(); return; }
        sync();
        cancel = animateTo(st, anim, 1000, sync);
      };
      fitOps(st, true); sync();
      return { destroy: () => { cancel(); cancelOw(); P1.destroy(); P2.destroy(); }, apply };
    }
  });
}
