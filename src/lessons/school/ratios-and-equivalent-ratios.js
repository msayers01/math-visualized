/* =====================================================================
   SCHOOL — Ratios and equivalent ratios
   ===================================================================== */
{
  /* ---------- numbers ---------- */
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const lcm = (a, b) => a / gcd(a, b) * b;
  const KMAX = 6;       /* most batches in any table or on any double number line */
  const ROWCAP = 24;    /* longest row of blocks drawn for one mix */
  const capK = m => clamp(Math.floor(ROWCAP / Math.max(m.c, m.w)), 1, KMAX);
  const cup = n => n === 1 ? '1 cup' : n + ' cups';
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;

  /* Compare two mixes {c, w} (cups of concentrate, cups of water).
     Scale both until they have the same amount of concentrate (the least common multiple), then compare the water:
     less water for the same concentrate means a stronger drink. */
  const compare = (A, B) => {
    const s = A.c * B.w - B.c * A.w, L = lcm(A.c, B.c), kA = L / A.c, kB = L / B.c;
    return { rel: s > 0 ? 'A' : s < 0 ? 'B' : 'same', L, kA, kB, wA: A.w * kA, wB: B.w * kB };
  };

  /* ---------- the exercises ---------- */
  /* Compare mode: two mixes, which is stronger? (the answers run A, B, same, A, B, same) */
  const PAIRS = [
    { A: { c: 2, w: 3 }, B: { c: 2, w: 5 }, cn: 'orange concentrate' },
    { A: { c: 2, w: 3 }, B: { c: 4, w: 5 }, cn: 'orange concentrate' },
    { A: { c: 2, w: 4 }, B: { c: 3, w: 6 }, cn: 'lemon juice' },
    { A: { c: 3, w: 7 }, B: { c: 1, w: 3 }, cn: 'grape concentrate' },
    { A: { c: 3, w: 5 }, B: { c: 6, w: 8 }, cn: 'lemon juice' },
    { A: { c: 4, w: 6 }, B: { c: 6, w: 9 }, cn: 'orange concentrate' }
  ];
  /* Change mode: a mix and something added to it. x = cups of concentrate added, y = cups of water added. */
  const SCEN = [
    { cn: 'orange concentrate', A: { c: 2, w: 3 }, x: 0, y: 2 },
    { cn: 'orange concentrate', A: { c: 2, w: 3 }, x: 2, y: 0 },
    { cn: 'orange concentrate', A: { c: 2, w: 3 }, x: 1, y: 1 },
    { cn: 'orange concentrate', A: { c: 2, w: 3 }, x: 2, y: 3 },
    { cn: 'grape concentrate', A: { c: 1, w: 3 }, x: 2, y: 2 },
    { cn: 'lemon juice', A: { c: 3, w: 4 }, x: 3, y: 4 },
    { cn: 'lemon juice', A: { c: 3, w: 4 }, x: 1, y: 2 }
  ];
  /* Scale mode: u = one batch, g = how many batches the written recipe is, ask = what the goal measures (t total, c concentrate, w water) */
  const CHS = [
    { name: 'Explore the 2 : 3 recipe', cn: 'orange concentrate', u: { c: 2, w: 3 }, g: 1, ask: null },
    { name: 'Goal: 20 cups in all', cn: 'orange concentrate', u: { c: 2, w: 3 }, g: 1, ask: 't', goal: 20 },
    { name: 'Goal: 5 cups of concentrate', cn: 'grape concentrate', u: { c: 1, w: 4 }, g: 1, ask: 'c', goal: 5 },
    { name: 'Goal: 15 cups of water', cn: 'lemon juice', u: { c: 3, w: 5 }, g: 1, ask: 'w', goal: 15 },
    { name: 'Scale down: 4 cups concentrate', cn: 'orange concentrate', u: { c: 2, w: 3 }, g: 3, ask: 'c', goal: 4 },
    { name: 'Goal: 21 cups in all', cn: 'lemon juice', u: { c: 3, w: 4 }, g: 1, ask: 't', goal: 21 }
  ];
  const chVal = (ch, n) => ch.ask === 't' ? (ch.u.c + ch.u.w) * n : ch.ask === 'c' ? ch.u.c * n : ch.u.w * n;
  const chN = ch => ch.goal / (ch.ask === 't' ? ch.u.c + ch.u.w : ch.ask === 'c' ? ch.u.c : ch.u.w);
  const NAMES = {
    compare: { A: 'mix A', B: 'mix B', LA: 'Mix A', LB: 'Mix B' },
    change: { A: 'the old mix', B: 'the new mix', LA: 'Before', LB: 'After' }
  };
  const addWords = (x, y, cn, short) => {
    const parts = [];
    if (x) parts.push(short ? `${x} concentrate` : `${cup(x)} of ${cn}`);
    if (y) parts.push(short ? `${y} water` : `${cup(y)} of water`);
    return parts.join(short ? ', ' : ' and ');
  };

  /* ---------- the explanations ---------- */
  const verdictText = (rel, mode) => rel === 'same'
    ? (mode === 'compare' ? 'The two mixes taste the same.' : 'The taste does not change.')
    : mode === 'compare' ? `Mix ${rel} tastes stronger.` : rel === 'B' ? 'The new mix is stronger.' : 'The new mix is weaker.';

  /* why, with the blocks: line up the concentrate, then compare the water */
  const whyMatch = (m, r, nm) => {
    const { A, B } = m;
    let s;
    if (r.kA === 1 && r.kB === 1) s = `Both already have ${cup(r.L)} of concentrate.`;
    else {
      const f = (n, mix, k) => k > 1 ? `${cap(n)} × ${k} = ${mix.c * k} : ${mix.w * k}.` : `${cap(n)} stays ${mix.c} : ${mix.w}.`;
      s = `Line up the concentrate. ${f(nm.A, A, r.kA)} ${f(nm.B, B, r.kB)} Now both have ${cup(r.L)} of concentrate.`;
    }
    s += ` ${cap(nm.A)} has ${cup(r.wA)} of water and ${nm.B} has ${cup(r.wB)} of water.`;
    if (r.rel === 'same') s += ' The amounts match, so the two ratios are equivalent and the taste is the same.';
    else s += ` The same concentrate in less water tastes stronger, so ${r.rel === 'A' ? nm.A : nm.B} is the stronger one.`;
    return s;
  };

  /* why subtraction (the gap between the two amounts) cannot decide it */
  const whySub = (m, r, nm) => {
    const { A, B } = m, gA = A.w - A.c, gB = B.w - B.c, sub = mix => `${mix.w} − ${mix.c} = ${num(mix.w - mix.c)}`;
    let s = `<b>Subtracting</b> (water minus concentrate). ${cap(nm.A)}: ${sub(A)}. ${cap(nm.B)}: ${sub(B)}. `;
    if (gA === gB && r.rel !== 'same') {
      s += `The gaps are equal, so subtraction says the two mixes match. They do not. Doubling ${nm.A} gives ${2 * A.c} : ${2 * A.w}. That tastes exactly like ${nm.A}, but its gap is ${2 * gA}, not ${gA}. A gap grows when a mix gets bigger, so a gap cannot measure taste.`;
    } else if (r.rel === 'same') {
      s += gA === gB ? 'The gaps match and so does the taste.'
        : `The gaps are different, so subtraction says the mixes differ. They taste the same. A bigger mix has a bigger gap even when the taste is the same.`;
    } else if (gA > 0 && gB > 0) {
      const small = gA < gB ? 'A' : 'B';
      s += small !== r.rel
        ? `Subtraction would pick ${nm[small]}, because its gap is smaller. That is the wrong pick. A gap tells you how big a mix is, not how strong it is.`
        : `Here the smaller gap does point to the stronger mix, but you cannot count on that. The doubling test shows why: ${2 * A.c} : ${2 * A.w} tastes like ${A.c} : ${A.w}, yet its gap is ${2 * gA} instead of ${gA}.`;
    } else {
      s += 'A gap only tells you how far apart the two amounts are. It does not tell you how strong the drink is. Equivalent ratios do.';
    }
    return s;
  };

  /* what kind of change it was (change mode) */
  const changeNote = (S) => {
    const { A, x, y } = S;
    if (x && !y) return 'You added only concentrate. The water stays the same, so there is more concentrate for the same water.';
    if (!x && y) return 'You added only water. The concentrate stays the same, so it is spread through more water.';
    if (x * A.w === y * A.c) {
      const t = x / A.c;
      return `You added ${cup(x)} of concentrate and ${cup(y)} of water. That is ${t === 1 ? 'exactly one more batch' : t + ' more batches'} of ${A.c} : ${A.w}, so both parts were multiplied by ${t + 1}.`;
    }
    if (x === y) return `You added the same amount, ${cup(x)}, to both parts. That keeps the gap the same, but it is not a bigger batch. A bigger batch multiplies both parts by the same number.`;
    const stronger = x * A.w > y * A.c;
    return `The part you added is ${x} : ${y}. That is ${stronger ? 'stronger' : 'weaker'} than the old mix ${A.c} : ${A.w}, so mixing it in makes the whole drink ${stronger ? 'stronger' : 'weaker'}.`;
  };

  /* ---------- canvas helpers (pixel space) ---------- */
  const font = (size, weight = 600) => `${weight} ${size}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`;
  const T = (c, p, str, x, y, { size = 14, color, align = 'center', weight = 600, a = 1, halo = true } = {}) => {
    if (a <= .01) return;
    c.save(); c.globalAlpha *= a; c.font = font(size, weight); c.textAlign = align; c.textBaseline = 'middle';
    if (halo) { c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(str, x, y); }
    c.fillStyle = color || p.pal.text; c.fillText(str, x, y); c.restore();
  };
  const tw = (c, str, size, weight = 600) => { c.save(); c.font = font(size, weight); const w = c.measureText(str).width; c.restore(); return w; };
  /* text that shrinks to fit a width */
  const Tfit = (c, p, str, x, y, maxW, o = {}) => {
    let size = o.size || 13;
    while (size > 9 && tw(c, str, size, o.weight || 600) > maxW) size -= .5;
    T(c, p, str, x, y, { ...o, size });
  };
  /* one line of coloured runs, starting at x; returns where it ended */
  const runs = (c, p, x, y, list, size) => {
    for (const [s, col, wt] of list) { T(c, p, s, x, y, { size, color: col, align: 'left', weight: wt || 600 }); x += tw(c, s, size, wt || 600); }
    return x;
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
  /* a curved arrow from xa to xb above (up) or below (down) a baseline, with a label at its middle */
  const arcArrow = (c, p, xa, xb, y0, lift, color, label, up, size) => {
    const dir = up ? -1 : 1, mx = (xa + xb) / 2, cy = y0 + dir * lift * 2;
    c.beginPath(); c.moveTo(xa, y0); c.quadraticCurveTo(mx, cy, xb, y0);
    c.strokeStyle = color; c.lineWidth = 2.4; c.lineCap = 'round'; c.stroke();
    const tx = xb - mx, ty = y0 - cy, tl = Math.hypot(tx, ty) || 1, ux = tx / tl, uy = ty / tl, hl = 8;
    c.beginPath(); c.moveTo(xb, y0);
    c.lineTo(xb - ux * hl - uy * hl * .55, y0 - uy * hl + ux * hl * .55);
    c.lineTo(xb - ux * hl + uy * hl * .55, y0 - uy * hl - ux * hl * .55);
    c.closePath(); c.fillStyle = color; c.fill();
    T(c, p, label, mx, y0 + dir * (lift + size * .8 + 3), { size, color });
  };

  register({
    id: 'ratios-and-equivalent-ratios', level: 'school',
    title: 'Ratios and equivalent ratios',
    blurb: 'Build drink mixes from blocks, scale them with tables and double number lines, and see why comparing ratios is not the same as subtracting.',
    thumb(c, p) {
      const pal = p.pal, W = p.w, H = p.h, u = Math.min(W / 12.5, H / 8.2), rh = u * .8;
      const row = (n, x, y, col, al) => { for (let i = 0; i < n; i++) { rr(c, x + i * u, y, u - 2.5, rh, 2); c.fillStyle = alpha(col, al); c.fill(); } };
      const x0 = W * .1, y1 = H * .08, y2 = H * .45;
      row(2, x0, y1, pal.yellow, .9); row(3, x0, y1 + rh + 3, pal.blue, .9);
      row(4, x0, y2, pal.yellow, .9); row(6, x0, y2 + rh + 3, pal.blue, .9);
      /* the x2 arrow between the two tapes */
      const ax = x0 + 6.4 * u;
      const ya = y1 + rh * .5, yb2 = y2 + rh * .5;
      c.beginPath(); c.moveTo(ax, ya); c.quadraticCurveTo(ax + u * 1.8, (ya + yb2) / 2, ax, yb2);
      c.strokeStyle = pal.green; c.lineWidth = 2.4; c.lineCap = 'round'; c.stroke();
      c.beginPath(); c.moveTo(ax, yb2); c.lineTo(ax + 7, yb2 - 7); c.lineTo(ax - 1, yb2 - 8); c.closePath(); c.fillStyle = pal.green; c.fill();
      T(c, p, '×2', ax + u * 2.2, (ya + yb2) / 2, { size: Math.max(11, u * .95), color: pal.green, halo: false });
      /* a tiny double number line */
      const yA = H * .86, yB = H * .95;
      seg(c, x0, yA, x0 + 11 * u, yA, pal.yellow, 2); seg(c, x0, yB, x0 + 11 * u, yB, pal.blue, 2);
      for (let i = 0; i <= 4; i++) { const x = x0 + i * 2.6 * u; seg(c, x, yA - 3, x, yB + 3, pal['grid-strong'], 1.4); }
    },
    hook: String.raw`Mix 2 cups of orange concentrate with 3 cups of water. Now mix 4 cups of concentrate with 5 cups of water. Each mix has exactly 1 more cup of water than concentrate. Do the two drinks taste the same?`,
    steps: [
      { title: 'A ratio compares two amounts',
        text: String.raw`<p>Orange drink is made from <b>concentrate</b> (yellow) and <b>water</b> (blue). Each block is one cup. One batch uses 2 cups of concentrate and 3 cups of water.</p><p>We say the ratio of concentrate to water is \(2:3\), read "2 to 3". The order matters: \(3:2\) would be a different drink.</p>`,
        set: { mode: 'scale', ch: 0, n: 1 } },
      { title: 'Equivalent ratios',
        text: String.raw`<p>Make 3 batches. Multiply both amounts by 3: 6 cups of concentrate and 9 cups of water. The ratio \(6:9\) is <b>equivalent</b> to \(2:3\). The drink tastes the same. There is just more of it.</p><p>The table and the double number line list every equivalent ratio. Drag the marker or use <b>Batches</b>. Then open the <b>Challenge</b> menu and make 20 cups in all.</p>`,
        set: { mode: 'scale', ch: 0, n: 3 } },
      { title: 'A gap does not measure taste',
        text: String.raw`<p>Mix A is \(2:3\) and mix B is \(4:5\). Each has exactly 1 more cup of water than concentrate. The red brackets show that gap.</p><p>Subtracting says they match. Do they? Choose <b>A is stronger</b>, <b>B is stronger</b> or <b>Same strength</b>, then read why. You can use the batch sliders first to line the mixes up.</p>`,
        set: { mode: 'compare', pr: 1, kA: 1, kB: 1, gap: true } },
      { title: 'Change a mix',
        text: String.raw`<p>Start with 2 cups of concentrate and 3 cups of water, then add 1 cup of each. The dashed blocks are the new ones. The gap is still 1.</p><p>Adding the same amount to both parts is not the same as making a bigger batch. Does the taste stay the same? Decide, then read why. Use <b>Next scenario</b> to try adding only water or a whole extra batch.</p>`,
        set: { mode: 'change', sc: 2, kA: 1, kB: 1, gap: true } }
    ],
    formal: String.raw`
      <p><b>Ratios.</b> A <em>ratio</em> says how much of one quantity goes with how much of another. A drink made from 2 cups of concentrate and 3 cups of water has the ratio \(2:3\) of concentrate to water. We read it "2 to 3". The order matters: \(3:2\) describes a different drink.</p>
      <p>A ratio can compare one part with another part, like concentrate to water (\(2:3\)). It can also compare a part with the whole, like concentrate to the whole drink (\(2:5\), because \(2+3=5\)). Say which one you mean.</p>
      <h3>Equivalent ratios</h3>
      <p>One batch is \(2:3\). Two batches use 4 cups of concentrate and 6 cups of water, so the ratio is \(4:6\). Three batches give \(6:9\). These ratios are <em>equivalent</em>: the drink tastes exactly the same, because every batch is a copy of the recipe. Multiplying <b>both</b> quantities by the same number \(n\) gives an equivalent ratio:
      \[ 2:3 \;=\; (2\times n):(3\times n). \]
      Dividing both quantities by the same number also works. Dividing \(6:9\) by 3 gives \(2:3\). Multiplying only one of the two quantities changes the drink.</p>
      <h3>Four ways to show the same ratio</h3>
      <p>A <b>tape diagram</b> draws one block for each cup. A <b>table of equivalent ratios</b> lists the pairs:
      \[ \begin{array}{c|cccc} \text{batches} & 1 & 2 & 3 & 4 \\ \hline \text{concentrate} & 2 & 4 & 6 & 8 \\ \text{water} & 3 & 6 & 9 & 12 \end{array} \]
      A <b>double number line</b> puts the concentrate on one line and the water on another, so that matching points line up. An <b>equation</b> says the same thing with \(n\) batches: concentrate \(c=2\times n\) and water \(w=3\times n\).</p>
      <p>To use them, find the multiplier. To make 12 cups of water, solve \(3\times n=12\). Then \(n=4\), and the concentrate is \(2\times 4=8\) cups. The new mix is \(8:12\). To make 20 cups in all, note that one batch is \(2+3=5\) cups, so \(n=20\div 5=4\) again.</p>
      <h3>Comparing ratios is not subtracting</h3>
      <p>Mix A has 2 cups of concentrate and 3 cups of water. Mix B has 4 cups and 5 cups. Both have a gap of 1: \(3-2=1\) and \(5-4=1\). Do they taste the same? Scale mix A up to the same concentrate as mix B. Doubling A gives \(4:6\). Now both have 4 cups of concentrate, and A needs 6 cups of water but B needs only 5. B has less water, so B is stronger.</p>
      <p>Subtraction fails because a gap depends on the size of the mix. Doubling a mix does not change its taste, but it doubles its gap: \(2:3\) has gap 1 and \(4:6\) has gap 2. If a gap measured taste, doubling the batch would change the taste. It does not. Subtraction also fails the other way. The mixes \(2:4\) and \(3:6\) have gaps 2 and 3, yet both are equivalent to \(1:2\), so they taste the same.</p>
      <h3>How to compare two ratios</h3>
      <ol>
        <li>Choose a quantity, for example the concentrate. Find a number both amounts of it divide into, such as the least common multiple.</li>
        <li>Multiply both parts of each ratio by the right number, so that the concentrate is equal in the two ratios.</li>
        <li>Compare the other quantity. For the same concentrate, less water means a stronger drink. More water means a weaker one. Equal water means the ratios are equivalent.</li>
      </ol>
      <p>For \(3:5\) and \(5:7\), use 15 cups of concentrate. Multiply the first by 5 to get \(15:25\). Multiply the second by 3 to get \(15:21\). The second needs less water, so it is stronger.</p>
      <h3>Mixtures and concentration</h3>
      <p>The <em>concentration</em> of a mix tells how much of it is concentrate compared with the rest. More concentrate for the same water, or less water for the same concentrate, makes it stronger. Here is what happens to \(2:3\) when you add to it:</p>
      <ul>
        <li>Add 2 cups of water, giving \(2:5\): weaker.</li>
        <li>Add 2 cups of concentrate, giving \(4:3\): stronger.</li>
        <li>Add 1 cup of each, giving \(3:4\): stronger. The gap stays 1, but the taste changes.</li>
        <li>Add 2 cups of concentrate and 3 cups of water, one whole batch, giving \(4:6\): the same taste. Adding in the ratio \(2:3\) is the same as multiplying by 2.</li>
      </ul>
      <p>When you add a little of a mix to another mix, the result lands between the two. Adding something weaker than the old mix makes it weaker. Adding something stronger makes it stronger.</p>`,
    check: [
      { q: String.raw`Mix P uses 3 cups of lemon juice and 5 cups of water. Mix Q uses 5 cups of lemon juice and 7 cups of water. Each mix has exactly 2 more cups of water than lemon juice. Which statement is true?`,
        choices: [
          'They taste the same, because each mix has 2 more cups of water than lemon juice.',
          'Mix Q is stronger. With 15 cups of lemon juice in each, P needs 25 cups of water but Q needs only 21.',
          'Mix P is stronger, because 3 : 5 is made of smaller numbers.',
          'Mix Q is weaker, because it uses 7 cups of water and P uses only 5.'
        ], answer: 1,
        why: String.raw`Give both mixes the same amount of lemon juice. Both 3 and 5 divide into 15. Multiply P by 5 to get \(15:25\). Multiply Q by 3 to get \(15:21\). With the same 15 cups of lemon juice, Q needs less water (21 against 25), so Q is stronger. The first answer uses subtraction: both gaps are 2, but a gap does not measure taste, because doubling a mix keeps its taste and doubles its gap.`,
        hint: String.raw`Do not subtract. Make the amount of lemon juice the same in both mixes, then compare the water.` },
      { q: String.raw`A fruit punch recipe uses 3 cups of juice and 4 cups of sparkling water. Maria wants a bigger batch that tastes exactly the same. She has 15 cups of juice. How many cups of sparkling water does she need?`,
        choices: ['5', '16', '20', '60'], answer: 2,
        why: String.raw`15 cups is \(15\div 3=5\) times as much juice, so she needs 5 batches. Multiply the water by the same 5: \(4\times 5=20\) cups. The new ratio \(15:20\) is equivalent to \(3:4\). The answer 16 adds the same 12 cups to both amounts (\(3+12=15\) and \(4+12=16\)), which changes the taste. The answer 5 is the number of batches, not the cups of water. The answer 60 multiplies \(15\times 4\).`,
        hint: String.raw`How many times as much juice is 15 cups as 3 cups? Multiply the water by the same number.` }
    ],
    links: { next: ['unit-rates-and-best-buys', 'percents-on-tape-and-number-lines'], related: ['proportional-relationships', 'similarity-and-scaling'] },

    mount({ stage, controls: C }) {
      const MODES = ['compare', 'scale', 'change'];
      const st = { mode: 'scale', pr: 1, sc: 2, ch: 0, n: 1, kA: 1, kB: 1, gap: false, ans: null };
      let cancelPop = () => {};
      const pop = { t: 1, prev: {} }, shown = {};
      const lay = {};
      const P = new Plane(stage, { span: 5 });
      if (P.coordEl) P.coordEl.style.display = 'none';

      /* new blocks fade in; blocks that were already there stay put */
      const kick = all => {
        cancelPop();
        pop.prev = all ? {} : JSON.parse(JSON.stringify(shown));
        pop.t = 0;
        cancelPop = tween(340, v => { pop.t = v; P.draw(); });
      };
      const prevN = (key, ri) => (pop.prev[key] && pop.prev[key][ri]) || 0;

      const mixes = () => {
        if (st.mode === 'compare') { const q = PAIRS[st.pr]; return { A: q.A, B: q.B, cn: q.cn, add: null, S: null }; }
        const S = SCEN[st.sc];
        return { A: S.A, B: { c: S.A.c + S.x, w: S.A.w + S.y }, cn: S.cn, add: { c: S.x, w: S.y }, S };
      };

      /* ---------- tape diagram: concentrate row over water row, one block per cup ---------- */
      const drawTape = (c, p, o) => {
        const pal = p.pal, { x0, y, unit, rh, m, k, key, fs } = o, rg = 4;
        const rows = [
          { n: m.c * k, per: o.batch ? o.batch.c : 0, col: pal.yellow, y, add: o.add ? o.add.c : 0, name: 'Concentrate' },
          { n: m.w * k, per: o.batch ? o.batch.w : 0, col: pal.blue, y: y + rh + rg, add: o.add ? o.add.w : 0, name: 'Water' }
        ];
        shown[key] = [rows[0].n, rows[1].n];
        rows.forEach((r, ri) => {
          const pv = prevN(key, ri);
          for (let i = 0; i < r.n; i++) {
            const isAdd = r.add > 0 && i >= r.n - r.add, b = r.per ? Math.floor(i / r.per) : 0, bx = x0 + i * unit;
            c.save(); c.globalAlpha = i < pv ? 1 : pop.t;
            rr(c, bx, r.y, unit - 1.8, rh, 3);
            if (isAdd) { c.fillStyle = alpha(r.col, .22); c.fill(); c.setLineDash([4, 3]); c.strokeStyle = r.col; c.lineWidth = 1.8; c.stroke(); c.setLineDash([]); }
            else { c.fillStyle = alpha(r.col, b % 2 ? .62 : .92); c.fill(); }
            c.restore();
          }
          if (r.per) for (let b = 1; b * r.per < r.n; b++) seg(c, x0 + b * r.per * unit - .9, r.y - 1, x0 + b * r.per * unit - .9, r.y + rh + 1, pal.stage, 3.4);
          c.save(); c.globalAlpha = pop.t < 1 ? Math.max(.35, pop.t) : 1;
          T(c, p, String(r.n), x0 + r.n * unit + 7, r.y + rh / 2, { size: fs + 1, color: r.col, align: 'left', weight: 700 });
          c.restore();
          Tfit(c, p, r.name, x0 - 9, r.y + rh / 2, x0 - 12, { size: fs - .5, color: r.col, align: 'right', halo: false });
        });
        /* the gap: how far the shorter row falls short of the longer one */
        if (o.gapOn) {
          const g = m.w - m.c, lo = Math.min(m.c, m.w) * k, hi = Math.max(m.c, m.w) * k;
          if (g !== 0) {
            const xa = x0 + lo * unit - .9, xb = x0 + hi * unit - .9, yb = y + 2 * rh + rg + 7;
            const top = g > 0 ? yb - 9 : y + rh;
            seg(c, xa, top, xa, yb, pal.red, 1.5, [3, 3]); seg(c, xb, top, xb, yb, pal.red, 1.5, [3, 3]);
            seg(c, xa, yb, xb, yb, pal.red, 2.6);
            T(c, p, 'gap ' + Math.abs(g) * k, (xa + xb) / 2, yb + 13, { size: fs, color: pal.red });
          }
        }
      };

      /* ---------- table of equivalent ratios (columns line up with the double number line) ---------- */
      const drawTable = (c, p, o) => {
        const pal = p.pal, { x0, dx, y, rh, m, k, fs } = o;
        const names = [['Batches', pal.muted], ['Concentrate', pal.yellow], ['Water', pal.blue]];
        if (o.total) names.push(['In all', pal.muted]);
        const nr = names.length, hl = o.hl || pal.text, cx = x0 + k * dx;
        rr(c, cx - dx / 2 + 1, y - 1, dx - 2, nr * rh + 2, 5);
        c.fillStyle = alpha(hl, .13); c.fill(); c.strokeStyle = alpha(hl, .85); c.lineWidth = 1.8; c.stroke();
        for (let r = 0; r <= nr; r++) seg(c, 6, y + r * rh, x0 + (KMAX + .5) * dx, y + r * rh, pal.grid, 1);
        names.forEach(([nm, col], r) => Tfit(c, p, nm, x0 + dx * .5 - 7, y + (r + .5) * rh, x0 + dx * .5 - 10, { size: fs - .5, color: col, align: 'right', halo: false, weight: 600 }));
        for (let n = 1; n <= KMAX; n++) {
          const x = x0 + n * dx, on = n === k, w = on ? 800 : 500;
          const vals = [[String(n), pal.muted], [String(m.c * n), pal.yellow], [String(m.w * n), pal.blue]];
          if (o.total) vals.push([String(m.c * n + m.w * n), pal.muted]);
          vals.forEach(([s, col], r) => T(c, p, s, x, y + (r + .5) * rh, { size: fs + (on ? 1 : 0), color: on && r > 0 ? col : r === 0 && on ? pal.text : col, weight: w, halo: false, a: on ? 1 : .88 }));
        }
        if (o.recipe) T(c, p, 'recipe', x0 + o.recipe * dx, y - 8, { size: fs - 2, color: pal.violet, weight: 700, halo: false });
      };

      /* ---------- scale mode: one recipe, tape + double number line + table ---------- */
      const sceneScale = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, ch = CHS[st.ch], { u, g } = ch, n = st.n, cc = u.c * n, ww = u.w * n;
        const fs = clamp(Math.min(W, H) * .03 + 3, 11.5, 15.5), padL = clamp(W * .2, 84, 120), padR = 30, x0 = padL;
        const dx = (W - padL - padR) / (KMAX + .4), unit = Math.min((W - padL - padR) / (KMAX * Math.max(u.c, u.w)), 38);
        let rh = clamp(unit * 1.05, 16, 34), rowT = clamp(dx * .5, 19, 27), arcZ = 56, between = clamp(H * .09, 40, 66);
        const sp = 12, head = 2 * (fs + 7) + 4;
        const need = () => head + 2 * rh + 4 + 24 + 2 * arcZ + 34 + between + 4 * rowT + 16 + 3 * sp;
        let total = need();
        if (total > H - 16) {
          const f = clamp((H - 16 - 3 * sp - head - 24 - 34 - 16) / (total - 3 * sp - head - 24 - 34 - 16), .6, 1);
          rh *= f; rowT *= f; arcZ *= f; between *= f; total = need();
        }
        const extra = Math.max(0, H - 16 - total);
        let y = 8 + extra * .22;
        /* header */
        const rec = `${u.c * g} : ${u.w * g}`;
        runs(c, p, 10, y + fs * .6 + 2, [['Recipe  ', pal.muted, 600], [rec, pal.text, 700]].concat(g > 1 ? [[`   =  ${g} batches of ${u.c} : ${u.w}`, pal.muted, 600]] : []), fs + 1);
        const hit = ch.ask && n === chN(ch);
        const line2 = !ch.ask ? 'Drag the marker to change the number of batches.'
          : hit ? 'Goal reached.'
          : ch.ask === 't' ? `Goal: ${ch.goal} cups of drink in all.` : ch.ask === 'c' ? `Goal: exactly ${ch.goal} cups of ${ch.cn}.` : `Goal: exactly ${ch.goal} cups of water.`;
        Tfit(c, p, line2, 10, y + fs * 1.6 + 9, W - 20, { size: fs, color: hit ? pal.green : ch.ask ? pal.violet : pal.muted, align: 'left', weight: 600 });
        y += head + extra * .15;
        /* tape */
        drawTape(c, p, { x0, y, unit, rh, m: u, k: n, key: 'S', batch: u, fs });
        const tyEnd = y + 2 * rh + 4;
        T(c, p, `${cc} + ${ww} = ${cc + ww} cups in all`, x0, tyEnd + 14, { size: fs, color: pal.muted, align: 'left' });
        y = tyEnd + 24 + sp + extra * .2;
        /* double number line */
        const zTop = y, yT = zTop + arcZ + 17, yB = yT + between, zBot = yB + 20 + arcZ;
        lay.dnl = [zTop, zBot];
        const xs = i => x0 + i * dx;
        for (let i = 0; i <= KMAX; i++) seg(c, xs(i), yT, xs(i), yB, alpha(pal.text, .14), 1);
        for (const [yy, col] of [[yT, pal.yellow], [yB, pal.blue]]) {
          seg(c, xs(0) - 8, yy, xs(KMAX) + dx * .4, yy, col, 3);
          const ex = xs(KMAX) + dx * .4;
          c.beginPath(); c.moveTo(ex + 7, yy); c.lineTo(ex - 2, yy - 5); c.lineTo(ex - 2, yy + 5); c.closePath(); c.fillStyle = col; c.fill();
        }
        Tfit(c, p, 'Concentrate', x0 - 12, yT, x0 - 14, { size: fs, color: pal.yellow, align: 'right', halo: false });
        Tfit(c, p, 'Water', x0 - 12, yB, x0 - 14, { size: fs, color: pal.blue, align: 'right', halo: false });
        for (let i = 0; i <= KMAX; i++) {
          const on = i === n;
          seg(c, xs(i), yT - 5, xs(i), yT + 5, pal.yellow, 2); seg(c, xs(i), yB - 5, xs(i), yB + 5, pal.blue, 2);
          T(c, p, String(u.c * i), xs(i), yT - 15, { size: fs + (on ? 1.5 : 0), color: pal.yellow, weight: on ? 800 : 500, halo: false, a: on ? 1 : .85 });
          T(c, p, String(u.w * i), xs(i), yB + 16, { size: fs + (on ? 1.5 : 0), color: pal.blue, weight: on ? 800 : 500, halo: false, a: on ? 1 : .85 });
        }
        /* the multiplier arrows, from the recipe's batch to the marker */
        if (n !== g) {
          const lbl = n > g && n % g === 0 ? '× ' + n / g : n < g && g % n === 0 ? '÷ ' + g / n : '÷ ' + g + ', × ' + n;
          const sz = fs + 1;
          arcArrow(c, p, xs(g), xs(n), yT - 28, arcZ * .3, pal.green, lbl, true, sz);
          arcArrow(c, p, xs(g), xs(n), yB + 30, arcZ * .3, pal.green, lbl, false, sz);
        }
        seg(c, xs(n), yT, xs(n), yB, alpha(pal.text, .6), 2.2);
        const ringCol = hit ? pal.green : pal.brass;
        for (const yy of [yT, yB]) { c.beginPath(); c.arc(xs(n), yy, 9, 0, TAU); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = ringCol; c.lineWidth = 3.5; c.stroke(); }
        y = zBot + sp + extra * .2;
        /* table */
        lay.x0 = x0; lay.dx = dx;
        drawTable(c, p, { x0, dx, y: y + 6, rh: rowT, m: u, k: n, fs, total: true, hl: hit ? pal.green : pal.brass, recipe: g });
        lay.tab = [y - 8, y + 6 + 4 * rowT + 4];
      };

      /* ---------- compare / change mode: two tapes, two tables ---------- */
      const scenePair = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, m = mixes(), { A, B } = m, nm = NAMES[st.mode], r = compare(A, B), add = m.add;
        const fs = clamp(Math.min(W, H) * .03 + 3, 11.5, 15.5), padL = clamp(W * .2, 84, 120), padR = 36, x0 = padL, dx = (W - padL - padR) / (KMAX + .4);
        const rowsMax = Math.max(10, Math.max(A.c, A.w) * st.kA, Math.max(B.c, B.w) * st.kB, Math.max(A.c, A.w) * r.kA, Math.max(B.c, B.w) * r.kB);
        const unit = Math.min((W - padL - padR) / rowsMax, 46);
        let rh = clamp(unit * 1.05, 16, 40), rowT = clamp(dx * .5, 18, 27), gapH = 29, sp = 8;
        const labH = fs + 11, tabT = fs + 8;
        const need = () => 2 * (labH + 2 * rh + 4 + gapH) + 2 * (tabT + 3 * rowT + 4) + 3 * sp;
        let total = need();
        if (total > H - 12) { const f = clamp((H - 12 - 3 * sp - 2 * (labH + gapH + 4 + tabT + 4)) / (total - 3 * sp - 2 * (labH + gapH + 4 + tabT + 4)), .6, 1); rh *= f; rowT *= f; total = need(); }
        const extra = Math.max(0, H - 12 - total);
        let y = 6 + extra * .2;
        const eqC = A.c * st.kA === B.c * st.kB, eqW = A.w * st.kA === B.w * st.kB;
        const lab = (L, mix, k) => {
          const l = [[L, pal.text, 700], [`   ${mix.c} : ${mix.w}`, pal.muted, 600]];
          if (k > 1) l.push([`   × ${k}`, pal.green, 700], [`  =  ${mix.c * k} : ${mix.w * k}`, pal.text, 700]);
          return l;
        };
        const yA = y + labH, yB = yA + 2 * rh + 4 + gapH + labH + sp + extra * .15;
        /* B's batches: when the new mix is whole batches of the old one, show those batches */
        const multiple = st.mode === 'change' && B.c % A.c === 0 && B.w % A.w === 0 && B.c / A.c === B.w / A.w;
        const batchB = st.kB > 1 ? B : multiple ? A : null;
        runs(c, p, 10, y + labH * .45, lab(nm.LA, A, st.kA), fs + 1);
        runs(c, p, 10, yB - labH * .55, lab(nm.LB, B, st.kB), fs + 1);
        if (add && st.kB === 1) T(c, p, 'dashed blocks are added', W - 10, yB - labH * .55, { size: fs - 1, color: pal.muted, align: 'right', weight: 500 });
        drawTape(c, p, { x0, y: yA, unit, rh, m: A, k: st.kA, key: 'A', batch: A, fs, gapOn: st.gap });
        drawTape(c, p, { x0, y: yB, unit, rh, m: B, k: st.kB, key: 'B', batch: batchB, add: st.kB === 1 ? add : null, fs, gapOn: st.gap });
        /* guides when the two tapes line up */
        const gl = (cnt, ra, rb, col) => {
          const xg = x0 + cnt * unit - .9;
          seg(c, xg, ra - 3, xg, rb + 3, col, 1.8, [5, 4]);
        };
        if (eqC) gl(A.c * st.kA, yA, yB + rh, pal.green);
        if (eqW) gl(A.w * st.kA, yA + rh + 4, yB + 2 * rh + 4, pal.green);
        /* tables */
        const tA = yB + 2 * rh + 4 + gapH + sp + extra * .15, tB = tA + tabT + 3 * rowT + 4 + sp + extra * .15;
        const hl = eqC || eqW ? pal.green : null;
        T(c, p, `${nm.LA}: equivalent ratios`, 10, tA + tabT * .45, { size: fs - .5, color: pal.muted, align: 'left', weight: 600 });
        T(c, p, `${nm.LB}: equivalent ratios`, 10, tB + tabT * .45, { size: fs - .5, color: pal.muted, align: 'left', weight: 600 });
        drawTable(c, p, { x0, dx, y: tA + tabT, rh: rowT, m: A, k: st.kA, fs, hl });
        drawTable(c, p, { x0, dx, y: tB + tabT, rh: rowT, m: B, k: st.kB, fs, hl });
        lay.tA = [tA + tabT - 6, tA + tabT + 3 * rowT + 4]; lay.tB = [tB + tabT - 6, tB + tabT + 3 * rowT + 4]; lay.x0 = x0; lay.dx = dx;
      };

      P.onDraw = (c, p) => { if (st.mode === 'scale') sceneScale(c, p); else scenePair(c, p); };

      /* ---------- readout ---------- */
      const gapLine = (m) => {
        const ca = m.A.c * st.kA, wa = m.A.w * st.kA, cb = m.B.c * st.kB, wb = m.B.w * st.kB, nm = NAMES[st.mode];
        const s = (w, c0) => `${w} − ${c0} = ${num(w - c0)}`;
        return `${kk('Gap')} ${cap(nm.A)}: ${s(wa, ca)}. ${cap(nm.B)}: ${s(wb, cb)}. The red brackets show these gaps.`;
      };
      const pairHTML = () => {
        const m = mixes(), { A, B } = m, nm = NAMES[st.mode], r = compare(A, B), out = [];
        if (st.mode === 'compare') {
          out.push(`${kk('Mix A')} ${cup(A.c)} of ${m.cn} and ${cup(A.w)} of water (${A.c} : ${A.w})`);
          out.push(`${kk('Mix B')} ${cup(B.c)} of ${m.cn} and ${cup(B.w)} of water (${B.c} : ${B.w})`);
          out.push(`${kk('Question')} Which mix tastes stronger, or do they taste the same?`);
        } else {
          out.push(`${kk('Start')} ${cup(A.c)} of ${m.cn} and ${cup(A.w)} of water (${A.c} : ${A.w})`);
          out.push(`${kk('Change')} Add ${addWords(m.S.x, m.S.y, m.cn)}`);
          out.push(`${kk('Now')} ${cup(B.c)} of ${m.cn} and ${cup(B.w)} of water (${B.c} : ${B.w})`);
          out.push(`${kk('Question')} Is the new mix stronger, weaker, or the same?`);
        }
        if (st.ans === null && (st.kA > 1 || st.kB > 1)) out.push(`${kk('Showing')} ${nm.LA} × ${st.kA} = ${A.c * st.kA} : ${A.w * st.kA}, ${nm.LB} × ${st.kB} = ${B.c * st.kB} : ${B.w * st.kB}`);
        if (st.gap && st.ans === null) out.push(gapLine(m));
        if (st.ans === null) {
          const ca = A.c * st.kA, cb = B.c * st.kB, wa = A.w * st.kA, wb = B.w * st.kB;
          if (ca === cb) out.push(`${kk('Look')} Both now have ${cup(ca)} of concentrate. Compare the water: ${wa} cups and ${wb} cups.`);
          else if (wa === wb) out.push(`${kk('Look')} Both now have ${cup(wa)} of water. Compare the concentrate: ${ca} cups and ${cb} cups.`);
          else out.push(`${kk('Tip')} Use the batch sliders (or tap a table column) to give both mixes the same amount of concentrate. Then compare the water.`);
        } else {
          const good = st.ans === r.rel;
          out.push(`${good ? ok('Right.') : no('Not quite.')} ${verdictText(r.rel, st.mode)}`);
          if (st.mode === 'change') out.push(changeNote(m.S));
          out.push(`<b>Using blocks.</b> ${whyMatch(m, r, nm)}`);
          out.push(whySub(m, r, nm));
        }
        return out.join('<br>');
      };

      const scaleHTML = () => {
        const ch = CHS[st.ch], { u, g } = ch, n = st.n, c = u.c * n, w = u.w * n, out = [];
        out.push(`${kk('Recipe')} ${cup(u.c * g)} of ${ch.cn} and ${cup(u.w * g)} of water (${u.c * g} : ${u.w * g})` + (g > 1 ? `, which is ${g} batches of ${u.c} : ${u.w}` : ''));
        out.push(`${kk('Batches')} n = ${n} (batches of ${u.c} : ${u.w})`);
        out.push(`${kk('Concentrate')} ${u.c} × ${n} = ${c} cups`);
        out.push(`${kk('Water')} ${u.w} × ${n} = ${w} cups`);
        out.push(`${kk('In all')} ${c} + ${w} = ${c + w} cups`);
        out.push(n === 1 ? `${kk('Ratio')} ${c} : ${w}, one batch` : `${kk('Ratio')} ${c} : ${w} = ${u.c} : ${u.w}, the same taste`);
        if (!ch.ask) {
          out.push('Every column of the table is an equivalent ratio. Each batch is a copy of the recipe, so the taste never changes.');
        } else {
          const goal = ch.goal, v = chVal(ch, n), want = chN(ch), hit = n === want;
          const what = ch.ask === 't' ? 'of drink in all' : ch.ask === 'c' ? `of ${ch.cn}` : 'of water';
          out.push(`${kk('Goal')} ${ch.ask === 't' ? `Make ${goal} cups in all.` : ch.ask === 'c' ? `Use exactly ${goal} cups of ${ch.cn}. How much water do you need?` : `Use exactly ${goal} cups of water. How much ${ch.cn} do you need?`}`);
          if (hit) {
            let s = g === 1
              ? `${n} batches means both amounts are multiplied by ${n}: ${u.c} × ${n} = ${c} and ${u.w} × ${n} = ${w}. `
              : g % n === 0
                ? `The recipe is ${g} batches. Divide both amounts by ${g / n}: ${u.c * g} ÷ ${g / n} = ${c} and ${u.w * g} ÷ ${g / n} = ${w}. `
                : `The recipe is ${g} batches. Divide both amounts by ${g} to get one batch, ${u.c} : ${u.w}. Then multiply both by ${n}: ${c} : ${w}. `;
            const per = ch.ask === 't' ? u.c + u.w : ch.ask === 'c' ? u.c : u.w;
            if (ch.ask === 't') s += `One batch is ${u.c} + ${u.w} = ${per} cups. `;
            s += `As an equation, ${per} × n = ${goal}, so n = ${goal} ÷ ${per} = ${n}. `;
            s += ch.ask === 't' ? `So ${c} cups of ${ch.cn} and ${w} cups of water make ${goal} cups.`
              : ch.ask === 'c' ? `So ${c} cups of ${ch.cn} goes with ${w} cups of water.`
              : `So ${w} cups of water goes with ${c} cups of ${ch.cn}.`;
            out.push(`${ok('Yes.')} ${s}`);
          } else {
            out.push(`${no('Not yet.')} You have ${cup(v)} ${what}, and the goal is ${goal}. ${v < goal ? 'That is too little, so use more batches.' : 'That is too much, so use fewer batches.'}`);
          }
        }
        return out.join('<br>');
      };
      const upd = () => { ro.innerHTML = st.mode === 'scale' ? scaleHTML() : pairHTML(); };

      /* ---------- controls ---------- */
      const probe = C.readout(), host = probe.parentElement; probe.remove();
      const group = build => {
        const before = new Set(host.children); build();
        const g = h('div', { style: 'display:flex;flex-direction:column;gap:16px;flex:none' });
        [...host.children].filter(e => !before.has(e)).forEach(e => g.append(e));
        host.append(g); return g;
      };
      const small = bs => bs.forEach(b => Object.assign(b.style, { padding: '6px 14px', minHeight: '36px', fontSize: '.88rem' }));
      let modeBtns, pairSel, scenSel, chSel, cmpBtns, chgBtns, nextCmp, retryCmp, nextChg, retryChg, nextCh, kAS, kBS, nS, gapT, ro;
      const gTop = {}, gBot = {};

      const sync = () => {
        modeBtns.forEach((b, i) => { b.className = MODES[i] === st.mode ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', MODES[i] === st.mode); });
        const pairMode = st.mode !== 'scale';
        gTop.compare.style.display = st.mode === 'compare' ? 'flex' : 'none';
        gTop.change.style.display = st.mode === 'change' ? 'flex' : 'none';
        gTop.scale.style.display = st.mode === 'scale' ? 'flex' : 'none';
        gBot.pair.style.display = pairMode ? 'flex' : 'none';
        gBot.scale.style.display = pairMode ? 'none' : 'flex';
        pairSel.value = String(st.pr); scenSel.value = String(st.sc); chSel.value = String(st.ch);
        const codes = st.mode === 'compare' ? ['A', 'B', 'same'] : ['B', 'A', 'same'];
        [[cmpBtns, 'compare'], [chgBtns, 'change']].forEach(([bs, md]) => bs.forEach((b, i) => {
          const on = st.mode === md && st.ans === codes[i];
          b.className = on ? 'btn primary' : 'btn'; b.disabled = st.ans !== null; b.setAttribute('aria-pressed', on);
        }));
        for (const b of [retryCmp, retryChg]) b.style.display = st.ans === null ? 'none' : '';
        kAS.set(st.kA); kBS.set(st.kB); nS.set(st.n); gapT.checked = st.gap;
        P.draw(); upd();
      };

      const fresh = () => { st.kA = st.kB = 1; st.ans = null; st.gap = false; };
      const setMode = md => { st.mode = md; fresh(); if (md === 'scale') st.n = CHS[st.ch].g; kick(true); sync(); };
      const loadPair = i => { st.pr = i; fresh(); kick(true); sync(); };
      const loadScen = i => { st.sc = i; fresh(); kick(true); sync(); };
      const loadCh = i => { st.ch = i; st.n = CHS[i].g; kick(true); sync(); };
      const setK = (which, v) => {
        const m = mixes(), k = clamp(Math.round(v), 1, capK(which === 'A' ? m.A : m.B)), key = which === 'A' ? 'kA' : 'kB';
        if (k !== st[key]) { st[key] = k; kick(); }
        sync();
      };
      const setN = v => { const n = clamp(Math.round(v), 1, KMAX); if (n !== st.n) { st.n = n; kick(); } sync(); };
      const answer = code => {
        const m = mixes(), r = compare(m.A, m.B);
        st.ans = code; st.gap = true; st.kA = r.kA; st.kB = r.kB; kick(); sync();
      };

      C.title('Explore');
      modeBtns = C.buttons([
        { label: 'Compare', onClick: () => setMode('compare') },
        { label: 'Scale', onClick: () => setMode('scale') },
        { label: 'Change', onClick: () => setMode('change') }
      ]);

      gTop.compare = group(() => {
        pairSel = C.select({ label: 'Pair of mixes', value: String(st.pr), options: PAIRS.map((q, i) => ({ value: String(i), label: `Pair ${i + 1}: ${q.A.c} : ${q.A.w} and ${q.B.c} : ${q.B.w}` })), onChange: v => loadPair(+v) });
        cmpBtns = C.buttons([
          { label: 'A is stronger', primary: true, onClick: () => answer('A') },
          { label: 'B is stronger', primary: true, onClick: () => answer('B') },
          { label: 'Same strength', primary: true, onClick: () => answer('same') }
        ]);
        [nextCmp, retryCmp] = C.buttons([
          { label: 'Next pair', onClick: () => loadPair((st.pr + 1) % PAIRS.length) },
          { label: 'Try again', onClick: () => { fresh(); kick(true); sync(); } }
        ]);
        small(cmpBtns); small([nextCmp, retryCmp]);
        C.hint('Which drink tastes more strongly of the concentrate? Pick one, then read why.');
      });
      gTop.change = group(() => {
        scenSel = C.select({ label: 'Scenario', value: String(st.sc), options: SCEN.map((q, i) => ({ value: String(i), label: `${i + 1}. ${q.A.c} : ${q.A.w}, add ${addWords(q.x, q.y, q.cn, true)}` })), onChange: v => loadScen(+v) });
        chgBtns = C.buttons([
          { label: 'Stronger', primary: true, onClick: () => answer('B') },
          { label: 'Weaker', primary: true, onClick: () => answer('A') },
          { label: 'The same', primary: true, onClick: () => answer('same') }
        ]);
        [nextChg, retryChg] = C.buttons([
          { label: 'Next scenario', onClick: () => loadScen((st.sc + 1) % SCEN.length) },
          { label: 'Try again', onClick: () => { fresh(); kick(true); sync(); } }
        ]);
        small(chgBtns); small([nextChg, retryChg]);
        C.hint('After the change, does the drink taste stronger, weaker, or the same as before?');
      });
      gTop.scale = group(() => {
        chSel = C.select({ label: 'Challenge', value: String(st.ch), options: CHS.map((q, i) => ({ value: String(i), label: q.name })), onChange: v => loadCh(+v) });
        [nextCh] = C.buttons([{ label: 'Next challenge', onClick: () => loadCh((st.ch + 1) % CHS.length) }]);
        small([nextCh]);
        C.hint('Drag the marker along the double number line, tap a table column, or use the slider.');
      });

      ro = C.readout();

      gBot.pair = group(() => {
        C.title('Batches');
        C.hint('The sliders stop when the blocks would no longer fit on the screen.');
        kAS = C.slider({ label: 'Batches of the top mix', min: 1, max: KMAX, step: 1, value: 1, format: v => String(Math.round(v)), onInput: v => setK('A', v) });
        kBS = C.slider({ label: 'Batches of the bottom mix', min: 1, max: KMAX, step: 1, value: 1, format: v => String(Math.round(v)), onInput: v => setK('B', v) });
        gapT = C.toggle({ label: 'Show the gap (subtraction)', value: false, onChange: v => { st.gap = v; sync(); } });
      });
      gBot.scale = group(() => {
        C.title('Batches');
        nS = C.slider({ label: 'Batches (the multiplier)', min: 1, max: KMAX, step: 1, value: 1, format: v => String(Math.round(v)), onInput: v => setN(v) });
      });

      /* tables and the double number line can be dragged too */
      draggable(P, {
        hit: (px, py) => {
          if (st.mode === 'scale') return (py >= lay.dnl[0] && py <= lay.dnl[1]) || (py >= lay.tab[0] && py <= lay.tab[1]) ? 'n' : null;
          return py >= lay.tA[0] && py <= lay.tA[1] ? 'A' : py >= lay.tB[0] && py <= lay.tB[1] ? 'B' : null;
        },
        move: (hd, x) => {
          const col = (P.X(x) - lay.x0) / lay.dx;
          if (hd === 'n') setN(col); else setK(hd, col);
        }
      });

      sync();

      /* ---------- guided steps ---------- */
      const apply = (patch, immediate) => {
        cancelPop(); pop.t = 1;
        const { mode, gap, pr, sc, ch, n, kA, kB } = patch;
        if (mode !== undefined) st.mode = mode;
        fresh();
        if (pr !== undefined) st.pr = pr;
        if (sc !== undefined) st.sc = sc;
        if (ch !== undefined) { st.ch = ch; st.n = CHS[ch].g; }
        if (n !== undefined) st.n = n;
        if (kA !== undefined) st.kA = kA;
        if (kB !== undefined) st.kB = kB;
        if (gap !== undefined) st.gap = gap;
        if (!immediate) kick(true);
        sync();
      };
      return { destroy: () => { cancelPop(); P.destroy(); }, apply };
    }
  });
}
