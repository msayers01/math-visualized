/* =====================================================================
   SCHOOL (Enrichment) — Fractals: self-similarity and dimension
   ===================================================================== */
{
  const MI = '−';
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;
  const SUP = { 1: '¹', 2: '²', 3: '³' };
  const L10 = x => Math.log10(x);
  const f5 = v => v.toFixed(5);
  const dim = (N, s) => Math.log(N) / Math.log(s);
  const d4 = v => String(+v.toFixed(4));
  const d2 = v => String(+v.toFixed(2));
  const SQ3 = Math.sqrt(3);
  const FONT = (sz, wt) => `${wt || 500} ${sz}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`;
  const lines = a => a.filter(Boolean).join('<br>');
  /* "log 4 ÷ log 3 = 0.60206 ÷ 0.47712 = 1.2619" */
  const dimLine = (N, s) => `log ${N} ÷ log ${s} = ${f5(L10(N))} ÷ ${f5(L10(s))} = <b>${d4(dim(N, s))}</b>`;

  /* ---------- Koch geometry (memoised) ---------- */
  const kochPts = (A, B, n, side) => {
    let pts = [A, B];
    const c = Math.cos(side * Math.PI / 3), s = Math.sin(side * Math.PI / 3);
    for (let i = 0; i < n; i++) {
      const out = [pts[0]];
      for (let j = 0; j < pts.length - 1; j++) {
        const P = pts[j], Q = pts[j + 1], dx = (Q[0] - P[0]) / 3, dy = (Q[1] - P[1]) / 3;
        const a = [P[0] + dx, P[1] + dy], b = [P[0] + 2 * dx, P[1] + 2 * dy];
        out.push(a, [a[0] + dx * c - dy * s, a[1] + dx * s + dy * c], b, Q);
      }
      pts = out;
    }
    return pts;
  };
  const KC = {};
  const kochCurve = n => KC['c' + n] || (KC['c' + n] = kochPts([0, 0], [1, 0], n, 1));
  const kochFlake = n => {
    if (KC['f' + n]) return KC['f' + n];
    const V = [[0, 0], [1, 0], [.5, SQ3 / 2]];
    let all = [];
    for (let e = 0; e < 3; e++) all = all.concat(kochPts(V[e], V[(e + 1) % 3], n, -1).slice(0, -1));
    return (KC['f' + n] = all);
  };
  /* area of the snowflake in units of the starting triangle, and the stage-by-stage sum */
  const flakeArea = n => { let a = 1; for (let i = 1; i <= n; i++) a += (1 / 3) * Math.pow(4 / 9, i - 1); return a; };

  /* ---------- Sierpinski geometry ---------- */
  const SC = {};
  const sierTris = n => {
    if (SC[n]) return SC[n];
    if (n === 0) return (SC[0] = { t: [[0, 0, 1]], hole: [] });
    const prev = sierTris(n - 1).t, t = [], hole = [];
    prev.forEach(([x, y, w]) => {
      const hw = w / 2;
      t.push([x, y, hw], [x + hw, y, hw], [x + hw / 2, y + hw * SQ3 / 2, hw]);
      hole.push([x + hw, y, hw]);
    });
    return (SC[n] = { t, hole });
  };
  /* Pascal's triangle mod 2, built with the "add the two above" rule */
  const PAR = (() => {
    const R = [[1]];
    for (let n = 1; n < 32; n++) { R[n] = []; for (let k = 0; k <= n; k++) R[n][k] = (((R[n - 1][k - 1] || 0) + (R[n - 1][k] || 0)) % 2); }
    return R;
  })();
  const binom = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };
  const bin5 = v => v.toString(2).padStart(5, '0');

  /* ---------- Chaos game ---------- */
  const CORN = [[0, 0], [1, 0], [.5, SQ3 / 2]], CN = ['A', 'B', 'C'];
  const STARTS = [[.35, .25, 'Inside the triangle'], [1.1, .9, 'Far outside the triangle'], [.5, SQ3 / 2, 'On corner C']];
  const TOTAL = 4000;
  const SEQ = (() => {
    let a = 20240607; const out = new Uint8Array(TOTAL + 100);
    for (let i = 0; i < out.length; i++) {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      out[i] = Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * 3);
    }
    return out;
  })();

  /* ---------- Make your own ---------- */
  const PRESETS = {
    '3,2': { name: 'the right-angled Sierpinski triangle', cells: [[0, 0], [1, 0], [0, 1]] },
    '5,3': { name: 'the Vicsek cross', cells: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]] },
    '8,3': { name: 'the Sierpinski carpet', cells: [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2]] },
    '4,3': { name: 'Cantor dust (four corners)', cells: [[0, 0], [2, 0], [0, 2], [2, 2]] },
    '4,2': { name: 'a full square (no holes)', cells: [[0, 0], [1, 0], [0, 1], [1, 1]] }
  };
  const orderCells = s => {
    const a = [];
    for (let i = 0; i < s; i++) for (let j = 0; j < s; j++) {
      const dx = i - (s - 1) / 2, dy = j - (s - 1) / 2, th = (Math.atan2(dy, dx) + 2 * Math.PI) % (2 * Math.PI);
      a.push({ i, j, r: Math.round(1000 * (dx * dx + dy * dy)), k1: Math.round(1e6 * (th % Math.PI)), k2: th >= Math.PI ? 1 : 0 });
    }
    a.sort((p, q) => q.r - p.r || p.k1 - q.k1 || p.k2 - q.k2);
    return a.map(o => [o.i, o.j]);
  };
  const rng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const place = (N, s, v) => {
    if (N > s * s) return null;
    if (v === 0) { const P = PRESETS[N + ',' + s]; return P ? P.cells : orderCells(s).slice(0, N); }
    const r = rng(v * 7919 + N * 31 + s), all = [];
    for (let i = 0; i < s; i++) for (let j = 0; j < s; j++) all.push([i, j]);
    for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
    return all.slice(0, N);
  };
  const MC = {};
  const makeSquares = (N, s, v, n) => {
    const key = [N, s, v, n].join();
    if (MC[key]) return MC[key];
    const cells = place(N, s, v);
    let cur = [[0, 0, 1]];
    for (let i = 0; i < n; i++) {
      const nx = [];
      cur.forEach(([x, y, w]) => cells.forEach(([ci, cj]) => nx.push([x + ci * w / s, y + cj * w / s, w / s])));
      cur = nx;
    }
    return (MC[key] = cur);
  };

  /* ---------- fixed question data ---------- */
  const ropts = (arr, n) => arr.map((_, i) => arr[(i + n) % arr.length]);
  const QS = {
    pscale: { q: 'You scale a square by s = 3, so every side is 3 times as long. How many copies of the original square fit inside the big square?',
      opts: [['3 copies'], ['6 copies'], ['9 copies']], ans: 2,
      why: 'The big square has 3 rows with 3 copies in each row: 3 × 3 = 9. A line needs only 3 copies and a cube needs 3 × 3 × 3 = 27. Use the slider to check other values of s.' },
    eqscale: { q: 'At s = 3 the square needs N = 9 copies. The dimension d is the power of s that gives N. Which equation finds d?',
      opts: [['d = 9 − 3', 'That gives d = 6, but 3 multiplied by itself 6 times is 729, not 9. Dimension is a power of s, not a difference.'],
             ['3^d = 9', 'Yes. 3¹ = 3 and 3² = 9, so d = 2. For any N, a calculator solves s^d = N with d = log N ÷ log s.'],
             ['d = 9 ÷ 3', 'That gives d = 3, but 3³ = 27, not 9. Dimension is a power of s, not a quotient.']], ans: 1 },
    eqkoch: { q: 'The Koch curve is made of N = 4 copies of itself, each at scale 1/3. Which equation finds its dimension d?',
      opts: [['4^d = 3', 'This swaps the two numbers. It would give d = log 3 ÷ log 4 = 0.7925. The copies are scaled by 1/3, so s = 3, and there are N = 4 of them.'],
             ['d = 4 ÷ 3 = 1.33', 'A power, not a quotient. Check: 3 to the power 1.33 is about 4.31, not 4.'],
             ['3^d = 4', 'Yes. 3¹ = 3 is too small and 3² = 9 is too big, so d is between 1 and 2. The calculator gives d = log 4 ÷ log 3 = 0.60206 ÷ 0.47712 = 1.2619.']], ans: 2 },
    psier: { q: 'The Sierpinski triangle keeps 3 of 4 pieces at every stage. A line has dimension 1 and a filled triangle has dimension 2. Predict: is its dimension nearer 1 or nearer 2?',
      opts: [['Nearer 1, like a thin curve'], ['Exactly halfway, 1.5'], ['Nearer 2, like a filled shape']], ans: 2,
      why: 'The calculation in the next question gives about 1.585, a little nearer 2 than 1. It is full of holes, yet at every scale it still keeps 3 of every 4 pieces, which is a lot. Guessing first shows you what you expect.' },
    eqsier: { q: 'The Sierpinski triangle is made of N = 3 copies of itself, each at scale 1/2. Which equation finds its dimension d?',
      opts: [['2^d = 3', 'Yes. 2¹ = 2 is too small and 2² = 4 is too big, so d is between 1 and 2. The calculator gives d = log 3 ÷ log 2 = 0.47712 ÷ 0.30103 = 1.585.'],
             ['3^d = 2', 'This swaps the two numbers. It would give d = log 2 ÷ log 3 = 0.631. Here there are N = 3 copies and the scale is 1/2, so s = 2.'],
             ['d = 3 ÷ 2 = 1.5', 'A power, not a quotient. Check: 2 to the power 1.5 is about 2.83, not 3.']], ans: 0 },
    pchaos: { q: 'You will start at any point, pick a corner at random, jump halfway to it, and leave a dot. Repeat thousands of times. What shape will the dots form?',
      opts: [['A filled triangle'], ['A random cloud with no pattern'], ['A triangle with holes in it'], ['Three clumps, one near each corner']], ans: 2,
      why: 'The dots form a triangle with holes: the Sierpinski triangle. Each jump takes the whole triangle onto one of three half-size copies of it, so once the dots are inside the triangle, after 1, 2, 3 jumps a dot sits in a stage 1, 2, 3 piece. The middle triangle is never hit.' }
  };
  const KQ = n => {
    const base = [
      ['4 times as long', 'There are 4 new segments, but each is only a third as long: 4 × 1/3 = 4/3, not 4.'],
      ['The same length', 'A segment of length L becomes 4 pieces of length L/3, which total 4L/3. That is longer than L.'],
      ['4/3 times as long', `Each segment of length L becomes 4 pieces of length L/3, so the total is 4L/3. The total multiplies by 4/3 at every stage, so stage ${n + 1} has total length (4/3)^${n + 1} = ${d4((4 / 3) ** (n + 1))}.`],
      ['1/3 as long', 'The pieces are a third as long, but there are 4 times as many of them. The two changes do not cancel.']
    ];
    const o = ropts(base, n);
    return { q: `Stage ${n} has ${4 ** n} segment${n ? 's' : ''}. At stage ${n + 1} each one is replaced by 4 segments that are 1/3 as long. Predict: the total length at stage ${n + 1} is how many times the total length at stage ${n}?`,
      opts: o, ans: o.findIndex(x => x === base[2]) };
  };

  /* ---------- practice problems (a fixed list) ---------- */
  const PROBS = [
    { name: 'Triple a square', kind: 'choice', view: 'scale', hide: true,
      q: 'You triple every side of a square. How many copies of the original square fit inside the new big square? (The picture shows a square scaled by 3.)',
      ch: [['3 copies', 'That is the number along ONE side. The big square also has 3 rows, so you need 3 × 3.'],
           ['6 copies', 'That is 3 + 3. Copies fill rows and columns, so you multiply: 3 × 3.'],
           ['9 copies', 'The big square has 3 rows of 3 copies: 3 × 3 = 9 = 3². Since N = s^d, a square has d = 2.'],
           ['27 copies', '27 = 3³ is the count for a cube. A flat square needs only 3 × 3.']], ans: 2 },
    { name: 'Two copies at one third', kind: 'build', tN: 2, tS: 3,
      q: 'A shape is made of 2 copies of itself, each at scale 1/3. Use the two sliders to set 2 copies and scale 1/3 in the picture, then press Check my setting.',
      fin: 'Now find the dimension. Which is right?',
      ch: [['1.585, from log 3 ÷ log 2', 'This swaps the numbers. The equation is 3^d = 2 (scale 1/3 means s = 3, and N = 2), not 2^d = 3.'],
           ['0.631, from log 2 ÷ log 3', 'Yes. 3^d = 2, so d = log 2 ÷ log 3 = 0.30103 ÷ 0.47712 = 0.631. It is less than 1: two small pieces with a gap between them, like dust. (Removing the middle third again and again gives the Cantor set.)'],
           ['0.667, from 2 ÷ 3', 'Dimension is a power, not a quotient. Check: 3 to the power 0.667 is about 2.08, not 2.'],
           ['1, because it is made of pieces on a line', 'Two copies at 1/3 leave a gap, so it is thinner than a line. A line at scale 1/3 would need 3 copies, and 3^1 = 3, not 2.']], ans: 1 },
    { name: 'Koch perimeter', kind: 'stage', tgt: 3, cv: 'koch',
      q: 'Use the stage slider to show the Koch curve at stage 3. The start segment has length 1. How long is the whole curve at stage 3?',
      ch: [['(4/3)³ = 64/27, about 2.37 times the start', 'Yes. There are 4³ = 64 segments, each 1/27 long, so the total is 64/27. The length grows by 4/3 every stage.'],
           ['4 times the start', 'That treats each stage as adding 4/3 once. Instead the total is MULTIPLIED by 4/3 three times: 4/3 × 4/3 × 4/3 = 64/27.'],
           ['64 times the start', 'There are 64 segments, but each is only 1/27 as long as the start. 64 × 1/27 = 64/27.'],
           ['The same as the start, 1', 'The ends stay the same distance apart, but the path between them wiggles and gets longer at every stage.']], ans: 0 },
    { name: 'Sierpinski triangles', kind: 'stage', tgt: 4, cv: 'sier',
      q: 'Use the stage slider to show the Sierpinski triangle at stage 4. How many small triangles remain?',
      ch: [['64', 'That is 4³. The count triples at each stage, so you want 3 multiplied by itself 4 times.'],
           ['256', '256 = 4^4 is the number of equal-size cells in the big triangle, but one in four is removed at each stage. Only some remain.'],
           ['12', 'That is 3 × 4. The count is multiplied by 3 at every stage, not added to.'],
           ['81', 'Yes. 1, 3, 9, 27, 81: it triples each stage, so 3^4 = 81. Of the 256 equal-size cells, 81 remain.']], ans: 3 },
    { name: 'Area remaining', kind: 'choice', view: 'sier', pss: 3,
      q: 'The picture shows stage 3. At each stage the middle quarter of every triangle is removed. What fraction of the original area remains at stage 3?',
      ch: [['9/16', 'That is the fraction at stage 2: (3/4)². Stage 3 multiplies by 3/4 once more.'],
           ['27/64, about 0.42', 'Yes. Each stage keeps 3 of 4 equal pieces: (3/4)³ = 27/64. It keeps shrinking toward 0.'],
           ['3/8', 'That adds 3 eighths instead of multiplying by 3/4, which is not how area shrinks. Each stage keeps 3/4 of what is left, so you multiply by 3/4 three times.'],
           ['1/64', 'That is (1/4)³, the area of ONE tiny triangle at stage 3. There are 27 of them.']], ans: 1 },
    { name: 'The carpet', kind: 'build', tN: 8, tS: 3,
      q: 'The Sierpinski carpet has 8 copies of itself at scale 1/3 (a 3 by 3 grid with the middle left out). Set 8 copies and scale 1/3 with the sliders, then press Check my setting.',
      fin: 'Now find its dimension. Which is right?',
      ch: [['2.67, from 8 ÷ 3', 'A power, not a quotient. A flat shape cannot have a dimension bigger than 2, and 3 to the power 2.67 is about 19, not 8.'],
           ['1.585, from log 3 ÷ log 2', 'That is the Sierpinski triangle. The carpet has N = 8 and s = 3.'],
           ['1.893, from log 8 ÷ log 3', 'Yes. 3^d = 8, so d = log 8 ÷ log 3 = 0.90309 ÷ 0.47712 = 1.893. Just under 2: it is almost a filled square.'],
           ['Exactly 2, because it looks like a square', 'A filled square would need all 9 copies, and 3² = 9. With 8, d is a little below 2.']], ans: 2 },
    { name: 'A trap', kind: 'choice', view: 'koch', kst: 5,
      q: 'Using N = s^d (the similarity dimension), Ana says the Koch curve has dimension 1 because it is a curve. Ben says it has dimension 2 because it is so crinkly it fills area. Who is right?',
      ch: [['Ana: any curve has dimension 1', 'A smooth curve has similarity dimension 1, but the Koch curve is not smooth: at stage n it is (4/3)^n long, with no limit. Its self-similarity gives 3^d = 4, so d is not 1.'],
           ['Ben: it fills area, so d = 2', 'The Koch curve itself does not fill any area. If d were 2, it would be made of 9 copies at scale 1/3, but it has only 4.'],
           ['Both are right in different ways', 'Dimension is one number given by N = s^d. For N = 4 and s = 3 only one value fits.'],
           ['Neither: 3^d = 4, so d is about 1.26', 'Yes. 4 copies at scale 1/3 give d = log 4 ÷ log 3 = 1.2619. That is more than a line (1) and less than a plane (2).']], ans: 3 }
  ];

  register({
    id: 'fractals-self-similarity-and-dimension', level: 'school',
    title: 'Fractals: self-similarity and dimension',
    blurb: 'Build the Koch curve and the Sierpinski triangle, play the chaos game, and find shapes whose dimension is not a whole number.',
    thumb(c, p) {
      const pal = p.pal; p.cx = .5; p.cy = .42; p.span = .62;
      const T = sierTris(4).t;
      T.forEach(([x, y, w]) => p.path([[x, y], [x + w, y], [x + w / 2, y + w * SQ3 / 2]], { fill: alpha(pal.yellow, .85), close: true }));
      p.path([[0, 0], [1, 0], [.5, SQ3 / 2]], { stroke: pal.blue, width: 2, close: true });
    },
    hook: String.raw`A line has dimension 1, a square has dimension 2, a cube has dimension 3. Can a shape have a dimension between 1 and 2, and what would that number even mean?`,
    steps: [
      { title: 'Copies and scale',
        text: String.raw`<p>A line, a square and a cube are each made of smaller copies of themselves. Scale each one by \(s\) and count the copies of the original that fit: \(N=s^{d}\) with \(d=1,2,3\).</p><p>Here \(s=3\). Predict the square's count, then use the slider. The exponent \(d\) is the <b>dimension</b>.</p>`,
        set: { view: 'scale', s: 3 } },
      { title: 'The Koch curve',
        text: String.raw`<p>Replace the middle third of every segment by two sides of an equilateral triangle. Each segment becomes \(4\) segments, each \(\tfrac13\) as long.</p><p>Answer each prediction to build the next stage and fill the table up to stage 5. The length grows without bound. Then find the dimension: \(3^{d}=4\).</p>`,
        set: { view: 'koch', snow: false } },
      { title: 'The Sierpinski triangle',
        text: String.raw`<p>Remove the middle triangle from every triangle. Stage \(n\) has \(3^{n}\) triangles, each \(\left(\tfrac12\right)^{n}\) as wide, and the area left is \(\left(\tfrac34\right)^{n}\), which heads to 0.</p><p>Guess the dimension first, then find it from \(2^{d}=3\). Then switch on Pascal's triangle: the odd entries make the same shape.</p>`,
        set: { view: 'sier', pasc: false } },
      { title: 'The chaos game',
        text: String.raw`<p>Pick a corner, jump halfway to it, drop a dot, and repeat. No rule makes a triangle with holes, yet that is what appears. Predict the shape, then press Play for 4000 dots.</p><p>Then try <b>You choose</b> for 10 jumps. The menu also has <b>Make your own</b>: choose \(N\) and \(s\) and see the dimension.</p>`,
        set: { view: 'chaos' } }
    ],
    formal: String.raw`
      <p>A shape is <em>self-similar</em> if it is made of smaller copies of itself. Natural examples are a line, a square and a cube. Fractals are the shapes where this goes on at every scale.</p>
      <h3>Scaling and the number of copies</h3>
      <p>Scale a shape by a factor \(s\) (see <em>similarity and scaling</em>: lengths are multiplied by \(s\), areas by \(s^2\), volumes by \(s^3\)). A line scaled by \(s\) holds \(s\) copies of the original. A square holds \(s\cdot s=s^{2}\) copies, in \(s\) rows of \(s\). A cube holds \(s^{3}\) copies. Turn this around: if a shape is made of \(N\) copies of itself, each at scale \(\tfrac1s\), then
      \[ N=s^{d}. \]
      The exponent \(d\) is called the <em>similarity dimension</em>. For \(d=1,2,3\) it agrees with the dimension you already know.</p>
      <h3>Solving for \(d\)</h3>
      <p>The logarithm of a number answers "what power?". The number \(d\) with \(s^{d}=N\) is
      \[ d=\frac{\log N}{\log s}. \]
      Any calculator log button works, because \(\ln N\div\ln s\) gives the same number. Example: the Sierpinski carpet is \(N=8\) copies at \(\tfrac13\). Then \(d=\log 8\div\log 3=0.90309\div0.47712\approx1.893\). Check: \(3^{1.893}\approx 8\). This formula assumes the copies do not overlap (or only touch at edges and points).</p>
      <h3>The Koch curve</h3>
      <p>Start with a segment of length 1. At stage \(n\) there are \(4^{n}\) segments, each of length \(\left(\tfrac13\right)^{n}\), so the length is
      \[ 4^{n}\left(\tfrac13\right)^{n}=\left(\tfrac43\right)^{n}. \]
      It is a geometric sequence with ratio \(\tfrac43>1\): \(1,\ 1.33,\ 1.78,\ 2.37,\ 3.16,\ 4.21,\dots\) The length grows without bound, so the limiting curve has infinite length, yet it fits on a page. Its dimension is \(d=\log 4\div\log 3\approx1.2619\), between a line and a plane.</p>
      <p>Now build a snowflake from three Koch curves on an equilateral triangle of area \(T\). Its perimeter is \(3\left(\tfrac43\right)^{n}\), also unbounded. Its area is not. At stage \(n\) the new triangles added have total area \(\tfrac13\left(\tfrac49\right)^{n-1}T\): there are \(3\cdot 4^{n-1}\) of them, each \(\left(\tfrac19\right)^{n}T\). The areas added are \(\tfrac13,\ \tfrac{4}{27},\ \tfrac{16}{243},\dots\) of \(T\), a geometric series with ratio \(\tfrac49<1\). Its sum is
      \[ T\left(1+\frac{1/3}{1-4/9}\right)=T\left(1+\frac35\right)=\frac85\,T. \]
      Numerically the area is \(1,\ 1.3333,\ 1.4815,\ 1.5473,\ 1.5766,\ 1.5896\) times \(T\) at stages 0 to 5, closing in on \(1.6\). So a snowflake with infinite perimeter encloses a finite area; it stays inside or on the circle through the corners of the starting triangle.</p>
      <h3>The Sierpinski triangle</h3>
      <p>At each stage every triangle is replaced by 3 triangles at scale \(\tfrac12\) (the middle one is removed). Stage \(n\) has \(3^{n}\) triangles, each \(\left(\tfrac12\right)^{n}\) as wide, so each has \(\left(\tfrac14\right)^{n}\) of the area. The area left is \(3^{n}\left(\tfrac14\right)^{n}=\left(\tfrac34\right)^{n}\to0\). The area goes to 0, but the shape is not empty: the corners and edges of every triangle are never removed. Its dimension is \(d=\log 3\div\log 2\approx1.585\), so it is too big to be a curve and too thin to have area.</p>
      <p><b>Pascal's triangle mod 2.</b> Build Pascal's triangle with the rule "add the two numbers above", and mark the odd entries. Rows 0 to \(2^{n}-1\) show the stage-\(n\) pattern: the same shape appears. One way to see which entries are odd: the entry \(\binom{r}{k}\) is odd exactly when adding \(k\) and \(r-k\) in binary needs no carrying. For example \(\binom{5}{2}=10\) is even, because \(2+3\) is \(010+011\) and the last place carries; \(\binom{6}{2}=15\) is odd, because \(2+4\) is \(010+100\) with no carry. (This is a known result; the lesson shows it, it does not prove it.)</p>
      <h3>Why the chaos game works</h3>
      <p>One jump halfway to corner \(A\) sends every point \(P\) to the point halfway between \(P\) and \(A\). Applied to the whole triangle, this gives a copy at scale \(\tfrac12\) sitting in corner \(A\). So after one jump the dot is in one of 3 half-size triangles (stage 1). After a second jump it is in one of 9 quarter-size triangles (stage 2), and after \(n\) jumps in one of the \(3^{n}\) triangles of stage \(n\). The dots can never land in a removed middle triangle. If you start outside the triangle, the first few dots wander in, and then this argument applies. Which corner you pick at random only decides which of the pieces you visit, so a fixed pseudo-random sequence draws the same picture every time.</p>
      <h3>Make your own, and honest limits</h3>
      <p>For \(N\) copies at scale \(\tfrac1s\) in a plane, the copies need room: there are only \(s^{2}\) cells, so \(N\le s^{2}\), that is \(d\le2\). With \(N=s^{2}\) the copies fill the square. The dimension depends only on \(N\) and \(s\), not on where the copies are put: the Koch curve and Cantor dust both have \(N=4,\ s=3\) and \(d\approx1.26\), but look nothing alike.</p>
      <p>Real objects are only approximately self-similar. A coastline looks rough at many scales, but only across a limited range, from kilometers down to centimeters, and its "dimension" is a measured estimate, not an exact value. The boundary of the Mandelbrot set (see the Mandelbrot and Julia sets lesson) has an even richer structure. There are other definitions of dimension too; this lesson uses only the similarity dimension.</p>`,
    check: [
      { q: 'A square is cut into smaller squares, each with sides 1/4 as long as the original. How many small squares are there, and what does the calculation N = s^d show?',
        choices: ['4 small squares, because 1/4 of each side', '8 small squares, because 4 × 2 = 8', '16 small squares, because 4² = 16: the exponent 2 is the dimension', '64 small squares, because 4³ = 64'], answer: 2,
        why: String.raw`With scale \(\tfrac14\) we have \(s=4\). There are 4 small squares along each side and 4 rows, so \(N=4\times4=16=4^{2}\). The exponent \(d=2\) is the dimension of a square. 4 and 8 forget that squares fill rows and columns. 64 is the count for a cube.`,
        hint: 'Count how many small squares fit along one side, then how many rows there are.' },
      { q: 'A Koch curve starts as one straight segment of length 9 cm. At each stage every segment is replaced by 4 segments that are 1/3 as long. What is the total length after stage 3?',
        choices: ['12 cm', 'about 21.3 cm', '36 cm', '576 cm'], answer: 1,
        why: String.raw`After 3 stages there are \(4^{3}=64\) segments, each \(9\times\left(\tfrac13\right)^{3}=\tfrac13\) cm. The total is \(64\times\tfrac13=\tfrac{64}{3}\approx21.3\) cm. Equivalently \(9\times\left(\tfrac43\right)^{3}=9\times\tfrac{64}{27}=\tfrac{64}{3}\). 12 cm is only one stage. 576 cm is \(9\times64\), which forgets that the segments get shorter.`,
        hint: 'Count the segments (multiply by 4 each stage), find each length (divide by 3 each stage), then multiply the two.' },
      { q: 'Sam finds the dimension of a shape made of 3 copies of itself, each at scale 1/2.<br>Step 1. N = 3 and s = 2.<br>Step 2. d = N ÷ s = 3 ÷ 2 = 1.5.<br>Which statement is true?',
        choices: ['Step 2 is wrong: d is the power with 2^d = 3, so d = log 3 ÷ log 2, about 1.585.', 'Step 1 is wrong: the numbers should be swapped, N = 2 and s = 3.', 'Nothing is wrong: the dimension is 1.5.', 'Step 2 is wrong: d = N − s = 1.'], answer: 0,
        why: String.raw`Dimension is the exponent in \(N=s^{d}\), so we need \(2^{d}=3\), and \(d=\log 3\div\log 2\approx1.585\). Check Sam's answer: \(2^{1.5}\approx2.83\), not 3. The numbers in Step 1 are right: 3 copies, scale \(\tfrac12\). Subtracting gives \(d=1\), but \(2^{1}=2\), not 3.`,
        hint: 'Test Sam’s answer: is 2 to the power 1.5 equal to 3?' }
    ],
    links: { prereq: ['similarity-and-scaling'], related: ['sequences-recursive-and-explicit', 'pascals-triangle-and-the-galton-board', 'exponential-growth', 'the-mandelbrot-and-julia-sets', 'volume-of-prisms-pyramids-and-cones', 'exponents-and-scientific-notation', 'modular-arithmetic'] },

    mount({ stage, controls: C }) {
      const st = {
        view: 'scale', s: 3, ks: 0, kmax: 0, snow: false, knote: '', ss: 2, pasc: false, prows: 32, prow: 5, pk: 2,
        sdone: 0, cstart: 0, cmode: 'auto', mN: 3, mS: 2, mst: 3, mvar: 0,
        pk_: 0, ps_: 0, pN: 2, pS: 2, practice: false, qa: {}
      };
      const panel = stage.nextElementSibling;
      const P = new Plane(stage, { cx: 0, cy: 0, span: 1 });
      let playId = 0, cancelPlay = () => {};
      /* chaos game data */
      const ch = { n: 0, xs: new Float32Array(TOTAL + 5), ys: new Float32Array(TOTAL + 5), qi: 0, picks: 0, last: null, playing: false };
      const chStart = () => STARTS[st.cstart];
      const chReset = () => { cancelPlay(); ch.n = 0; ch.qi = 0; ch.picks = 0; ch.last = null; ch.playing = false; };
      const chJump = cor => {
        if (ch.n >= TOTAL) return false;
        const px = ch.n ? ch.xs[ch.n - 1] : chStart()[0], py = ch.n ? ch.ys[ch.n - 1] : chStart()[1];
        const nx = (px + CORN[cor][0]) / 2, ny = (py + CORN[cor][1]) / 2;
        ch.xs[ch.n] = nx; ch.ys[ch.n] = ny; ch.n++;
        ch.last = { px, py, cor, nx, ny };
        return true;
      };
      const chAuto = k => { for (let i = 0; i < k && ch.n < TOTAL; i++) { chJump(SEQ[ch.qi]); ch.qi++; } };

      let prOver = false, prIdx = 0, prSolved = false, prTried = false, prFirst = 0, prDone = 0, prStage = 0;
      const qa = k => st.qa[k] || (st.qa[k] = { done: false, pick: -1, tried: [] });
      const prac = () => st.practice && !prOver;

      /* ===== the picture ===== */
      const mapper = (x0, y0, x1, y1, bx0, by0, bx1, by1) => {
        const sc = Math.min((x1 - x0) / (bx1 - bx0), (y1 - y0) / (by1 - by0));
        const ox = (x0 + x1) / 2 - sc * (bx0 + bx1) / 2, oy = (y0 + y1) / 2 + sc * (by0 + by1) / 2;
        return { sc, X: x => ox + sc * x, Y: y => oy - sc * y };
      };
      const poly = (c, pts, M, o) => {
        c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(M.X(x), M.Y(y)) : c.moveTo(M.X(x), M.Y(y)));
        if (o.close) c.closePath();
        if (o.fill) { c.fillStyle = o.fill; c.fill(); }
        if (o.stroke) { c.strokeStyle = o.stroke; c.lineWidth = o.width || 2; c.setLineDash(o.dash || []); c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); c.setLineDash([]); }
      };
      const viewNow = () => (prac() ? PROBS[prIdx].view || PROBS[prIdx].cv || 'make' : st.view);
      const kochStage = () => (prac() ? (PROBS[prIdx].kst != null ? PROBS[prIdx].kst : st.pk_) : st.ks);
      const sierStage = () => (prac() ? (PROBS[prIdx].pss != null ? PROBS[prIdx].pss : st.ps_) : st.ss);
      const mkParams = () => (prac() ? { N: st.pN, s: st.pS, n: 3, v: 0 } : { N: st.mN, s: st.mS, n: st.mst, v: st.mvar });
      const scaleHidden = () => (prac() ? !!PROBS[prIdx].hide : !qa('pscale').done);

      P.onDraw = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, fs = clamp(W / 27, 12, 16);
        const T = (txt, x, y, o = {}) => {
          let sz = o.size || fs; c.font = FONT(sz, o.weight);
          const tw = c.measureText(txt).width;
          if (!o.noFit && tw > W - 28) { sz = Math.max(10, sz * (W - 28) / tw); c.font = FONT(sz, o.weight); }
          c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
          c.lineWidth = 4; c.strokeStyle = pal.stage; c.lineJoin = 'round'; c.strokeText(txt, x, y);
          c.fillStyle = o.color || pal.text; c.fillText(txt, x, y);
        };
        const view = viewNow();
        let pin = null, pinCol = pal.yellow, rulerOn = false;
        if (prac()) {
          if (view === 'make' && prSolved) { rulerOn = true; const m = mkParams(); pin = dim(m.N, m.s); }
        } else if (view === 'koch') { rulerOn = true; if (qa('eqkoch').done) pin = dim(4, 3); }
        else if (view === 'sier' && !st.pasc) { rulerOn = true; if (qa('eqsier').done) pin = dim(3, 2); }
        else if (view === 'make') { rulerOn = true; const m = mkParams(); pin = dim(m.N, m.s); if (m.N > m.s * m.s) pinCol = pal.red; }
        const RH = rulerOn ? 66 : 0, bot = H - 10 - RH;
        if (view === 'scale') drawScale(c, p, T, pal, W, bot, fs);
        else if (view === 'koch') drawKoch(c, p, T, pal, W, bot, fs);
        else if (view === 'sier') drawSier(c, p, T, pal, W, bot, fs);
        else if (view === 'chaos') drawChaos(c, p, T, pal, W, bot, fs);
        else drawMake(c, p, T, pal, W, bot, fs);
        if (rulerOn) {
          const x0 = 44, x1 = W - 52, y = H - 34, X = d => x0 + (x1 - x0) * d / 3;
          c.strokeStyle = pal['grid-strong']; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
          ['0', '1 line', '2 square', '3 cube'].forEach((t, i) => {
            c.beginPath(); c.moveTo(X(i), y - 6); c.lineTo(X(i), y + 6); c.stroke();
            T(t, X(i), y + 19, { color: pal.muted, size: fs * .95 });
          });
          T('dimension d', 12, y - 24, { align: 'left', color: pal.muted, size: fs * .95 });
          if (pin !== null) {
            const px = X(Math.min(pin, 3));
            c.fillStyle = pinCol; c.strokeStyle = pal.stage; c.lineWidth = 2; c.beginPath(); c.moveTo(px, y - 1); c.lineTo(px - 8, y - 17); c.lineTo(px + 8, y - 17); c.closePath(); c.fill(); c.stroke();
            T(`d = ${d4(pin)}`, clamp(px, 56, W - 56), y - 30, { weight: 700 });
          }
        }
      };

      const drawScale = (c, p, T, pal, W, bot, fs) => {
        const s = prac() ? 3 : st.s, hide = scaleHidden(), cw = W / 3;
        const names = ['Line', 'Square', 'Cube'], top = 12 + fs;
        const areaTop = top + fs * 1.6, areaBot = bot - fs * 5.6;
        const B = Math.min(cw - 18, areaBot - areaTop, 280);
        const cy = (areaTop + areaBot) / 2;
        for (let col = 0; col < 3; col++) {
          const cx = cw * (col + .5), d = col + 1, N = Math.pow(s, d);
          T(names[col], cx, top, { weight: 700 });
          c.lineWidth = 1.3;
          if (col === 0) {
            const th = Math.max(16, B * .1), w = B / s, y0 = cy - th / 2, x0 = cx - B / 2;
            for (let i = 0; i < s; i++) {
              c.fillStyle = i === 0 ? alpha(pal.yellow, .75) : alpha(pal.blue, .3); c.strokeStyle = pal.blue;
              c.fillRect(x0 + i * w + 1, y0, w - 2, th); c.strokeRect(x0 + i * w + 1, y0, w - 2, th);
            }
          } else if (col === 1) {
            const w = B / s, x0 = cx - B / 2, y0 = cy - B / 2;
            for (let i = 0; i < s; i++) for (let j = 0; j < s; j++) {
              c.fillStyle = (i === 0 && j === s - 1) ? alpha(pal.yellow, .75) : alpha(pal.blue, .3); c.strokeStyle = pal.blue;
              c.fillRect(x0 + i * w + 1, y0 + j * w + 1, w - 2, w - 2); c.strokeRect(x0 + i * w + 1, y0 + j * w + 1, w - 2, w - 2);
            }
          } else {
            const a = B * .7, dx = B * .3, dy = B * .3, x0 = cx - B / 2, yb = cy + B / 2, yt = yb - a;
            const front = [[x0, yt], [x0 + a, yt], [x0 + a, yb], [x0, yb]];
            const top3 = [[x0, yt], [x0 + dx, yt - dy], [x0 + a + dx, yt - dy], [x0 + a, yt]];
            const right = [[x0 + a, yt], [x0 + a + dx, yt - dy], [x0 + a + dx, yb - dy], [x0 + a, yb]];
            const fillP = (pts, col) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fillStyle = col; c.fill(); };
            fillP(front, alpha(pal.blue, .28)); fillP(top3, alpha(pal.blue, .5)); fillP(right, alpha(pal.blue, .14));
            fillP([[x0, yb - a / s], [x0 + a / s, yb - a / s], [x0 + a / s, yb], [x0, yb]], alpha(pal.yellow, .75));
            c.strokeStyle = pal.blue; c.lineWidth = 1.2; c.beginPath();
            for (let i = 0; i <= s; i++) {
              const f = i / s;
              c.moveTo(x0 + a * f, yt); c.lineTo(x0 + a * f, yb); c.moveTo(x0, yt + a * f); c.lineTo(x0 + a, yt + a * f);
              c.moveTo(x0 + a * f, yt); c.lineTo(x0 + a * f + dx, yt - dy);
              c.moveTo(x0 + dx * f, yt - dy * f); c.lineTo(x0 + a + dx * f, yt - dy * f);
              c.moveTo(x0 + a, yt + a * f); c.lineTo(x0 + a + dx, yt + a * f - dy);
              c.moveTo(x0 + a + dx * f, yt - dy * f); c.lineTo(x0 + a + dx * f, yb - dy * f);
            }
            c.stroke();
            c.lineWidth = 2; poly(c, front, { X: x => x, Y: y => y }, { stroke: pal.blue, width: 2, close: true });
            poly(c, top3, { X: x => x, Y: y => y }, { stroke: pal.blue, width: 2, close: true });
            poly(c, right, { X: x => x, Y: y => y }, { stroke: pal.blue, width: 2, close: true });
          }
          T(hide ? `N = ?` : `N = ${s}${SUP[d]} = ${N}`, cx, areaBot + fs * 1.3, { weight: 700 });
          T(hide ? 'copies: ?' : `${N} copies`, cx, areaBot + fs * 2.7, { color: pal.muted });
        }
        T(`Scale factor s = ${s}: each side is ${s} times as long. Yellow = one copy.`, W / 2, bot - fs * .3, { size: fs * .92, color: pal.muted });
      };

      const drawKoch = (c, p, T, pal, W, bot, fs) => {
        const n = kochStage(), snow = prac() ? false : st.snow;
        const top = 12 + fs * (snow ? 3.1 : 1.6);
        T(snow ? (n ? `Snowflake, stage ${n}: ${3 * 4 ** n} sides, each 1/${3 ** n} as long` : 'Snowflake, stage 0: a triangle with 3 sides') : (n ? `Stage ${n}: ${4 ** n} segments, each 1/${3 ** n} as long` : 'Stage 0: one segment of length 1'), W / 2, 14 + fs * .4, { weight: 700 });
        if (snow) T(`Area = ${d4(flakeArea(n))} × the starting triangle`, W / 2, 14 + fs * 1.9, { color: pal.muted });
        const M = snow ? mapper(14, top, W - 14, bot, -.17, -.29, 1.17, 1.16) : mapper(14, top, W - 14, bot, 0, -.05, 1, .34);
        const lw = clamp(3.4 - .45 * n, 1.3, 3.4);
        if (snow) {
          const R = 1 / SQ3, cx = .5, cy = SQ3 / 6;
          c.beginPath(); c.arc(M.X(cx), M.Y(cy), R * M.sc, 0, Math.PI * 2); c.strokeStyle = pal.violet; c.lineWidth = 1.8; c.setLineDash([7, 6]); c.stroke(); c.setLineDash([]);
          T('circle', M.X(cx + R * .72), M.Y(cy + R * .72), { color: pal.violet, size: fs * .95 });
          if (n > 0 && n <= 3) poly(c, kochFlake(n - 1), M, { stroke: pal.muted, width: 1.2, dash: [4, 5], close: true });
          poly(c, kochFlake(n), M, { fill: alpha(pal.blue, .16), stroke: pal.blue, width: lw, close: true });
        } else {
          if (n > 0 && n <= 3) poly(c, kochCurve(n - 1), M, { stroke: pal.muted, width: 1.4, dash: [4, 5] });
          poly(c, kochCurve(n), M, { stroke: pal.blue, width: lw });
          c.fillStyle = pal.yellow; [[0, 0], [1, 0]].forEach(([x, y]) => { c.beginPath(); c.arc(M.X(x), M.Y(y), 5, 0, Math.PI * 2); c.fill(); });
          T('start length 1', M.X(.5), M.Y(-.05) + fs * .4, { color: pal.muted });
        }
        if (n > 0 && n <= 3) T('dashed: the stage before', W - 18, bot - 4, { align: 'right', color: pal.muted, size: fs * .9 });
      };

      const drawSier = (c, p, T, pal, W, bot, fs) => {
        const n = sierStage();
        if (st.pasc && !prac()) return drawPascal(c, p, T, pal, W, bot, fs);
        T(`Stage ${n}: ${3 ** n} triangle${n ? 's' : ''}, each ${n ? '1/' + 2 ** n : 'the full width'} as wide`, W / 2, 14 + fs * .4, { weight: 700 });
        T(`area left = ${3 ** n}/${4 ** n} = ${d4((3 / 4) ** n)} of the start`, W / 2, 14 + fs * 1.9, { color: pal.muted });
        T(n ? 'red: the middle triangles removed at this stage' : 'start with one filled triangle', W / 2, 14 + fs * 3.3, { color: n ? pal.red : pal.muted, size: fs * .95 });
        const M = mapper(14, 14 + fs * 4.6, W - 14, bot, 0, 0, 1, SQ3 / 2);
        const D = sierTris(n);
        D.hole.forEach(([x, y, w]) => poly(c, [[x, y], [x + w / 2, y + w * SQ3 / 2], [x + w, y]], M, { fill: alpha(pal.red, .22), close: true }));
        c.fillStyle = alpha(pal.yellow, .85);
        c.beginPath();
        D.t.forEach(([x, y, w]) => { c.moveTo(M.X(x), M.Y(y)); c.lineTo(M.X(x + w), M.Y(y)); c.lineTo(M.X(x + w / 2), M.Y(y + w * SQ3 / 2)); c.closePath(); });
        c.fill();
        poly(c, [[0, 0], [1, 0], [.5, SQ3 / 2]], M, { stroke: pal.blue, width: 2, close: true });
      };

      const drawPascal = (c, p, T, pal, W, bot, fs) => {
        const R = st.prows;
        T(`Pascal's triangle, ${R} rows: odd entries are dots`, W / 2, 14 + fs * .4, { weight: 700 });
        const r = Math.min(st.prow, R - 1), k = Math.min(st.pk, r);
        T(`Row ${r}, entry ${k}: ${PAR[r][k] ? 'odd' : 'even'} (yellow ring)`, W / 2, 14 + fs * 1.9, { color: pal.muted });
        const x0 = 18, x1 = W - 18, y0 = 14 + fs * 3.4, y1 = bot - fs * 1.2;
        const u = Math.min((x1 - x0) / (R - 1 + .6), (y1 - y0) / ((R - 1) * SQ3 / 2 + .6));
        const cx = (x0 + x1) / 2, oy = y0 + ((y1 - y0) - u * (R - 1) * SQ3 / 2) / 2;
        const pos = (rr, kk2) => [cx + u * (kk2 - rr / 2), oy + u * rr * SQ3 / 2];
        for (let rr = 0; rr < R; rr++) for (let kk2 = 0; kk2 <= rr; kk2++) {
          const [x, y] = pos(rr, kk2);
          if (PAR[rr][kk2]) { c.fillStyle = pal.blue; c.beginPath(); c.arc(x, y, Math.max(1.6, u * .36), 0, Math.PI * 2); c.fill(); }
          else { c.fillStyle = alpha(pal.muted, .45); c.fillRect(x - .8, y - .8, 1.6, 1.6); }
        }
        const [hx, hy] = pos(r, k);
        c.strokeStyle = pal.yellow; c.lineWidth = 3; c.beginPath(); c.arc(hx, hy, Math.max(6, u * .75), 0, Math.PI * 2); c.stroke();
        T(`${R} = 2^${Math.log2(R)} rows match Sierpinski stage ${Math.log2(R)}`, W / 2, bot - 4, { color: pal.muted, size: fs * .92 });
      };

      const drawChaos = (c, p, T, pal, W, bot, fs) => {
        T(`Dots: ${ch.n} of ${TOTAL}`, W / 2, 14 + fs * .4, { weight: 700 });
        const hint = ch.n === 0 ? 'Press a button to place the first dot' : ch.last ? `Last jump: halfway toward corner ${CN[ch.last.cor]}` : '';
        T(hint, W / 2, 14 + fs * 1.9, { color: pal.muted });
        const M = mapper(16, 14 + fs * 3.3, W - 16, bot - 4, -.1, -.12, 1.25, .98);
        const ds = chStart();
        /* dots */
        const small = ch.n > 600;
        c.fillStyle = alpha(pal.blue, small ? .9 : 1);
        for (let i = 0; i < ch.n; i++) { if (i < 10 && ch.n <= 400) continue; const x = M.X(ch.xs[i]), y = M.Y(ch.ys[i]); c.fillRect(x - 1, y - 1, 2, 2); }
        for (let i = 0; i < Math.min(10, ch.n); i++) {
          if (ch.n > 400) break;
          const x = M.X(ch.xs[i]), y = M.Y(ch.ys[i]);
          c.fillStyle = pal.blue; c.beginPath(); c.arc(x, y, 3.2, 0, Math.PI * 2); c.fill();
          T(String(i + 1), x + 9, y - 9, { size: fs * .85, color: pal.blue });
        }
        if (ch.last && ch.n <= 400) {
          const l = ch.last;
          c.strokeStyle = pal.yellow; c.lineWidth = 2; c.setLineDash([6, 5]); c.beginPath(); c.moveTo(M.X(l.px), M.Y(l.py)); c.lineTo(M.X(CORN[l.cor][0]), M.Y(CORN[l.cor][1])); c.stroke(); c.setLineDash([]);
          c.beginPath(); c.arc(M.X(l.nx), M.Y(l.ny), 6, 0, Math.PI * 2); c.stroke();
        }
        /* start point */
        c.fillStyle = pal.yellow; c.strokeStyle = pal.stage; c.lineWidth = 2; c.beginPath(); c.arc(M.X(ds[0]), M.Y(ds[1]), 6, 0, Math.PI * 2); c.fill(); c.stroke();
        T('start', M.X(ds[0]) + (ds[0] > .9 ? -26 : 26), M.Y(ds[1]) + (ds[1] > .8 ? -14 : 14), { size: fs * .9 });
        /* corners */
        CORN.forEach(([x, y], i) => {
          c.fillStyle = pal.violet; c.strokeStyle = pal.stage; c.lineWidth = 2; c.beginPath(); c.arc(M.X(x), M.Y(y), 7, 0, Math.PI * 2); c.fill(); c.stroke();
          T(CN[i], M.X(x) + (i === 0 ? -16 : i === 1 ? 16 : 0), M.Y(y) + (i === 2 ? -17 : 4), { weight: 700, size: fs * 1.15 });
        });
      };

      const drawMake = (c, p, T, pal, W, bot, fs) => {
        const m = mkParams(), N = m.N, s = m.s, fits = N <= s * s, d = dim(N, s);
        const r = clamp(Math.min(W * .3, bot * .3), 76, 140), land = W >= 1.3 * bot;
        const pre = PRESETS[N + ',' + s];
        /* the rule box */
        const rx = 14, ry = 14;
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.2; c.strokeRect(rx, ry, r, r);
        const cellsR = fits ? place(N, s, m.v) : null;
        for (let i = 0; i < s; i++) for (let j = 0; j < s; j++) {
          const on = fits ? cellsR.some(q => q[0] === i && q[1] === j) : true;
          c.fillStyle = on ? (fits ? alpha(pal.blue, .55) : alpha(pal.red, .35)) : 'transparent';
          if (on) c.fillRect(rx + i * r / s + .5, ry + (s - 1 - j) * r / s + .5, r / s - 1, r / s - 1);
        }
        c.strokeStyle = alpha(pal.muted, .6); c.lineWidth = .8; c.beginPath();
        for (let i = 1; i < s; i++) { c.moveTo(rx + i * r / s, ry); c.lineTo(rx + i * r / s, ry + r); c.moveTo(rx, ry + i * r / s); c.lineTo(rx + r, ry + i * r / s); }
        c.stroke();
        const cap = [`${N} copies`, `scale 1/${s}`];
        if (land) { T('The rule', rx + r / 2, ry + r + fs * .9, { weight: 700 }); T(cap[0], rx + r / 2, ry + r + fs * 2.3); T(cap[1], rx + r / 2, ry + r + fs * 3.6); }
        else { T('The rule:', rx + r + 14, ry + fs * .9, { align: 'left', weight: 700 }); T(cap[0], rx + r + 14, ry + fs * 2.4, { align: 'left' }); T(cap[1], rx + r + 14, ry + fs * 3.7, { align: 'left' }); }
        if (!fits) {
          const mx = land ? r + 40 : 14, my = land ? 14 : r + 24;
          T(`${N} copies at scale 1/${s} do not fit`, (mx + W - 14) / 2, (my + bot) / 2 - fs * 1.4, { weight: 700, color: pal.red });
          T(`The square has room for only ${s * s}.`, (mx + W - 14) / 2, (my + bot) / 2, {});
          T(`d = ${d4(d)} is more than 2.`, (mx + W - 14) / 2, (my + bot) / 2 + fs * 1.4, { color: pal.muted });
          return;
        }
        /* the stage-n picture */
        const mx0 = land ? r + 40 : 14, my0 = land ? 14 : r + 26;
        const Bs = Math.min(W - 14 - mx0, bot - my0 - fs * 2.4);
        const x0 = mx0 + (W - 14 - mx0 - Bs) / 2, y0 = my0 + (bot - my0 - fs * 2.4 - Bs) / 2;
        c.fillStyle = alpha(pal.muted, .08); c.fillRect(x0, y0, Bs, Bs);
        const sq = makeSquares(N, s, m.v, m.n), col = alpha(pal.blue, .85);
        c.fillStyle = col;
        sq.forEach(([x, y, w]) => c.fillRect(x0 + x * Bs, y0 + (1 - y - w) * Bs, w * Bs + .6, w * Bs + .6));
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.2; c.strokeRect(x0, y0, Bs, Bs);
        T(`Stage ${m.n}: ${sq.length} pieces`, x0 + Bs / 2, y0 + Bs + fs * 1.0, { color: pal.muted, weight: 700 });
      };

      /* ===== panel ===== */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const S = o => { const s = C.slider(o); s.inp = panel.lastElementChild.querySelector('input'); return s; };
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const addTo = (...els) => panel.append(...els);

      /* a reusable question box */
      const mkQuiz = title => {
        const q = { t: h('p', { class: 'ctl-title' }, title), p: h('p', { class: 'hint' }), row: h('div', { class: 'ctl buttons' }), fb: h('div', { class: 'ctl readout', 'aria-live': 'polite' }), key: null, spec: null, lock: false, onDone: null };
        q.els = [q.t, q.p, q.row, q.fb];
        q.paint = () => {
          const a = qa(q.key), sp = q.spec;
          Array.from(q.row.children).forEach((b, j) => {
            b.disabled = a.done || a.tried.includes(j);
            b.classList.toggle('primary', a.done && (q.lock ? a.pick === j : j === sp.ans));
          });
          if (a.done) {
            if (q.lock) q.fb.innerHTML = (a.pick === sp.ans ? good('Right.') : bad('Not quite.')) + ' ' + sp.why;
            else q.fb.innerHTML = good('Right.') + ' ' + sp.opts[sp.ans][1].replace(/^Yes\.\s*/, '');
          } else if (a.tried.length) { const j = a.tried[a.tried.length - 1]; q.fb.innerHTML = bad('Not quite.') + ' ' + sp.opts[j][1] + ' Try another answer.'; }
          else q.fb.innerHTML = '';
        };
        q.render = (key, spec, lock, onDone) => {
          const same = q.key === key && q.spec && q.spec.q === spec.q;
          q.key = key; q.spec = spec; q.lock = lock; q.onDone = onDone;
          if (same) { q.paint(); return; }
          q.p.textContent = spec.q; q.row.replaceChildren();
          spec.opts.forEach((o, i) => q.row.append(mkBtn(o[0], () => {
            const a = qa(q.key); if (a.done) return;
            if (q.lock) { a.pick = i; a.done = true; }
            else if (i === spec.ans) { a.pick = i; a.done = true; }
            else if (!a.tried.includes(i)) a.tried.push(i);
            q.paint(); if (a.done && q.onDone) q.onDone(); sync();
          })));
          q.paint();
        };
        return q;
      };

      let selView, ro1, ro2, ro3, ro4, ro5, qScale, qEqScale, qKoch, qEqKoch, qPSier, qEqSier, qChaos;
      let sS, ksS, ksBtns, snowT, pascT, rowsSel, prowS, pkS, ssS, ssBtns, cstartSel, cmodeBtns, cplay, cstep, creset, cpick;
      let mpreSel, mNS, mSS, mstS, mvarBtn;
      let startBtn, ptally, pq, pch, pfb, pnext, pbuild, pcheck, pKS, pSS, pMN, pMS;

      /* ----- the menu ----- */
      const VIEWS = [['scale', '1. Copies and scale'], ['koch', '2. The Koch curve'], ['sier', '3. The Sierpinski triangle'], ['chaos', '4. The chaos game'], ['make', '5. Make your own']];
      grp('view', () => {
        C.title('Explore');
        selView = C.select({ label: 'Choose a shape', options: VIEWS.map(v => ({ value: v[0], label: v[1] })), value: 'scale', onChange: v => { setView(v); } });
      });
      const setView = v => { cancelPlay(); st.view = v; st.practice = false; sync(); };

      /* ----- view 1: scale ----- */
      grp('scale', () => {
        qScale = mkQuiz('Predict first');
        addTo(...qScale.els);
        sS = S({ label: 'Scale factor s', min: 2, max: 5, step: 1, value: 3, format: v => 's = ' + v, onInput: v => { st.s = v; sync(); } });
        qEqScale = mkQuiz('Find the dimension');
        addTo(...qEqScale.els);
        ro1 = C.readout();
      });
      /* ----- view 2: Koch ----- */
      const kochAllowed = () => Math.min(5, st.kmax + (qa('kn' + st.kmax).done ? 1 : 0));
      const setKs = v => {
        const al = kochAllowed();
        st.knote = '';
        if (v > al) { st.knote = `Stage ${v} is locked. Answer the question first.`; v = al; }
        st.ks = Math.max(0, v); st.kmax = Math.max(st.kmax, st.ks); sync();
      };
      grp('koch', () => {
        C.title('Build the curve');
        ksS = S({ label: 'Stage', min: 0, max: 5, step: 1, value: 0, format: v => 'stage ' + v, onInput: v => setKs(v) });
        ksBtns = C.buttons([{ label: 'Back one stage', onClick: () => setKs(st.ks - 1) }, { label: 'Build next stage', primary: true, onClick: () => setKs(st.ks + 1) }]);
        snowT = C.toggle({ label: 'Show the snowflake (three Koch curves)', value: false, onChange: v => { st.snow = v; sync(); } });
        qKoch = mkQuiz('Predict the next row');
        addTo(...qKoch.els);
        ro2 = C.readout();
        qEqKoch = mkQuiz('Find the dimension');
        addTo(...qEqKoch.els);
      });
      /* ----- view 3: Sierpinski ----- */
      grp('sier', () => {
        C.title('Remove the middle triangles');
        ssS = S({ label: 'Stage', min: 0, max: 6, step: 1, value: 2, format: v => 'stage ' + v, onInput: v => { st.ss = v; sync(); } });
        ssBtns = C.buttons([{ label: 'Back one stage', onClick: () => { st.ss = Math.max(0, st.ss - 1); sync(); } }, { label: 'Next stage', primary: true, onClick: () => { st.ss = Math.min(6, st.ss + 1); sync(); } }]);
        qPSier = mkQuiz('Predict first');
        addTo(...qPSier.els);
        qEqSier = mkQuiz('Find the dimension');
        addTo(...qEqSier.els);
        pascT = C.toggle({ label: "Show Pascal's triangle: odd entries as dots", value: false, onChange: v => { st.pasc = v; sync(); } });
        rowsSel = C.select({ label: 'Rows of Pascal\'s triangle', options: [{ value: '16', label: '16 rows' }, { value: '32', label: '32 rows' }], value: '32', onChange: v => { st.prows = +v; st.prow = Math.min(st.prow, st.prows - 1); st.pk = Math.min(st.pk, st.prow); sync(); } });
        prowS = S({ label: 'Pick a row', min: 0, max: 31, step: 1, value: 5, format: v => 'row ' + v, onInput: v => { st.prow = Math.min(v, st.prows - 1); st.pk = Math.min(st.pk, st.prow); sync(); } });
        pkS = S({ label: 'Pick an entry', min: 0, max: 31, step: 1, value: 2, format: v => 'entry ' + v, onInput: v => { st.pk = Math.min(v, st.prow); sync(); } });
        ro3 = C.readout();
      });
      /* ----- view 4: chaos ----- */
      cancelPlay = () => { if (playId) { cancelAnimationFrame(playId); playId = 0; } ch.playing = false; };
      const chPlay = () => {
        if (ch.playing) { cancelPlay(); sync(); return; }
        if (ch.n >= TOTAL) return;
        if (reduceMotion) { chAuto(TOTAL); sync(); return; }
        ch.playing = true;
        const tick = () => {
          chAuto(80);
          if (ch.n >= TOTAL) { ch.playing = false; playId = 0; sync(); return; }
          sync(); playId = requestAnimationFrame(tick);
        };
        playId = requestAnimationFrame(tick); sync();
      };
      grp('chaos', () => {
        qChaos = mkQuiz('Predict first');
        addTo(...qChaos.els);
        C.title('Play the game');
        cstartSel = C.select({ label: 'Start point', options: STARTS.map((s, i) => ({ value: String(i), label: s[2] })), value: '0', onChange: v => { st.cstart = +v; chReset(); sync(); } });
        cmodeBtns = C.buttons([{ label: 'Computer chooses', onClick: () => { cancelPlay(); st.cmode = 'auto'; sync(); } }, { label: 'You choose', onClick: () => { cancelPlay(); st.cmode = 'pick'; sync(); } }]);
        const rowB = C.buttons([{ label: 'Play (4000 dots)', primary: true, onClick: () => chPlay() }, { label: 'Add 100 dots', onClick: () => { cancelPlay(); chAuto(100); sync(); } }]);
        cplay = rowB[0]; cstep = rowB[1];
        cpick = C.buttons(CN.map((n, i) => ({ label: 'Jump toward ' + n, onClick: () => { if (ch.picks < 10 && chJump(i)) ch.picks++; sync(); } })));
        creset = C.buttons([{ label: 'Reset', onClick: () => { chReset(); sync(); } }])[0];
        ro4 = C.readout();
      });
      P.canvas.addEventListener('pointerdown', e => {
        if (viewNow() !== 'chaos' || st.cmode !== 'pick' || !qa('pchaos').done || st.practice) return;
        const r = P.canvas.getBoundingClientRect(), W = P.w, fs = clamp(W / 27, 12, 16), bot = P.h - 10;
        const M = mapper(16, 14 + fs * 3.3, W - 16, bot - 4, -.1, -.12, 1.25, .98);
        const x = e.clientX - r.left, y = e.clientY - r.top;
        let best = -1, bd = 48;
        CORN.forEach(([cx, cy], i) => { const dd = Math.hypot(M.X(cx) - x, M.Y(cy) - y); if (dd < bd) { bd = dd; best = i; } });
        if (best >= 0 && ch.picks < 10 && chJump(best)) { ch.picks++; sync(); }
      });
      /* ----- view 5: make ----- */
      grp('make', () => {
        C.title('Make your own');
        mpreSel = C.select({ label: 'Start from a known shape', options: [{ value: '', label: 'Choose a shape...' }, { value: '3,2', label: 'Sierpinski triangle (3 copies, 1/2)' }, { value: '5,3', label: 'Vicsek cross (5 copies, 1/3)' }, { value: '8,3', label: 'Sierpinski carpet (8 copies, 1/3)' }, { value: '4,3', label: 'Cantor dust (4 copies, 1/3)' }], value: '',
          onChange: v => { if (v) { const [a, b] = v.split(',').map(Number); st.mN = a; st.mS = b; st.mvar = 0; } sync(); } });
        mNS = S({ label: 'Number of copies N', min: 2, max: 8, step: 1, value: 3, format: v => 'N = ' + v, onInput: v => { st.mN = v; st.mvar = 0; mpreSel.value = ''; sync(); } });
        mSS = S({ label: 'Scale 1/s', min: 2, max: 5, step: 1, value: 2, format: v => 'scale 1/' + v, onInput: v => { st.mS = v; st.mvar = 0; mpreSel.value = ''; sync(); } });
        mstS = S({ label: 'Stage', min: 0, max: 3, step: 1, value: 3, format: v => 'stage ' + v, onInput: v => { st.mst = v; sync(); } });
        mvarBtn = C.buttons([{ label: 'Try another arrangement', onClick: () => { st.mvar = (st.mvar + 1) % 6; sync(); } }])[0];
        ro5 = C.readout();
      });

      /* ----- readouts ----- */
      const scaleRo = () => {
        const s = st.s;
        if (!qa('pscale').done) return 'Make your prediction first. Then the slider unlocks.';
        const o = [`${kk('Scale')} s = ${s}: every side is ${s} times as long.`,
          `${kk('Line')} N = ${s}¹ = ${s}`, `${kk('Square')} N = ${s}² = ${s * s}`, `${kk('Cube')} N = ${s}³ = ${s ** 3}`];
        if (qa('eqscale').done) o.push(`${kk('Solve s^d = N')} for the square: d = ${dimLine(s * s, s)}. Same way: the line gives d = ${d4(dim(s, s))}, the cube d = ${d4(dim(s ** 3, s))}.`);
        else o.push('Next: use the question above to turn "N is s to some power" into an equation for d.');
        return lines(o);
      };
      const kochRows = () => {
        let t = '<table style="border-collapse:collapse;width:100%;font-size:.85rem"><tr style="color:var(--muted)"><th align="left">stage</th><th align="left">segments</th><th align="left">each is</th><th align="left">total length</th></tr>';
        for (let n = 0; n <= st.kmax; n++) {
          const cur = n === st.ks;
          t += `<tr${cur ? ' style="font-weight:700"' : ''}><td>${n}</td><td>${4 ** n}</td><td>${n ? '1/' + 3 ** n : '1'}</td><td>${n ? `${4 ** n}/${3 ** n} ≈ ${d2((4 / 3) ** n)}` : '1'}</td></tr>`;
        }
        return t + '</table>';
      };
      const kochRo = () => {
        const n = st.ks, o = [kochRows()];
        if (st.knote) o.push(bad(st.knote));
        o.push(n ? `${kk('Stage ' + n)} ${4 ** n} segments × (1/${3 ** n}) = ${4 ** n}/${3 ** n} = <b>${d2((4 / 3) ** n)}</b> × the start` : `${kk('Stage 0')} one segment of length 1: total length <b>1</b>.`);
        if (st.kmax >= 5) o.push(`The total multiplies by 4/3 every stage and never stops growing: stage 20 would be about ${Math.round((4 / 3) ** 20)} times the start. So the limit curve has infinite length.`);
        else o.push('The table fills as you build. Look for the pattern in the last column.');
        if (st.snow) {
          o.push(`${kk('Snowflake')} perimeter = 3 × ${d2((4 / 3) ** n)} = <b>${d2(3 * (4 / 3) ** n)}</b> (unbounded). Area = <b>${d4(flakeArea(n))}</b> × the starting triangle. The area added at each stage is 1/3, then 4/27, then 16/243 ... of it, a geometric series with ratio 4/9, whose total is 8/5 = 1.6. It stays inside the dashed circle.`);
        }
        if (qa('eqkoch').done) o.push(`${kk('Dimension')} 3^d = 4, so d = ${dimLine(4, 3)}. More than the line (1), less than the plane (2).`);
        return lines(o);
      };
      const sierRo = () => {
        const n = st.ss, o = [];
        o.push(`${kk('Stage ' + n)} triangles: 3^${n} = <b>${3 ** n}</b>. Each is 1/${2 ** n} as wide (so 1/${4 ** n} of the area).`);
        o.push(`${kk('Area left')} ${3 ** n}/${4 ** n} = <b>${d4((3 / 4) ** n)}</b> of the start. It shrinks toward 0 but the shape never becomes empty.`);
        if (qa('eqsier').done) o.push(`${kk('Dimension')} 2^d = 3, so d = ${dimLine(3, 2)}. Between the line (1) and the plane (2), a little nearer 2.`);
        else if (!qa('psier').done) o.push('Answer the prediction to unlock the dimension.');
        return lines(o);
      };
      const pascRo = () => {
        const r = Math.min(st.prow, st.prows - 1), k = Math.min(st.pk, r), v = binom(r, k), odd = v % 2 === 1;
        const a = k, b = r - k, carry = (a & b) !== 0;
        return lines([`${kk('Row ' + r + ', entry ' + k)} value ${v}, which is <b>${odd ? 'odd' : 'even'}</b>.`,
          `${kk('Binary check')} ${a} + ${b} is ${bin5(a)} + ${bin5(b)}: ${carry ? 'a carry happens, so the entry is even' : 'no carry, so the entry is odd'}.`,
          `${kk('Honest note')} the same shape appears. With 32 rows (2^5) it matches Sierpinski stage 5.`]);
      };
      const chaosRo = () => {
        if (!qa('pchaos').done) return 'Make your prediction first. Then the buttons unlock.';
        const o = [];
        if (st.cmode === 'pick') o.push(`${kk('You choose')} jump toward a corner: ${ch.picks} of 10 done. ${ch.picks >= 10 ? 'Ten jumps made. Switch to Computer chooses to carry on.' : 'Tap a corner on the picture, or use the buttons.'}`);
        else o.push(`${kk('Computer chooses')} a fixed pseudo-random sequence of corners, so the picture is the same every time.`);
        if (ch.last) o.push(`${kk('Last jump')} from (${d2(ch.last.px)}, ${d2(ch.last.py)}) halfway toward ${CN[ch.last.cor]} (${d2(CORN[ch.last.cor][0])}, ${d2(CORN[ch.last.cor][1])}) to the new dot (${d2(ch.last.nx)}, ${d2(ch.last.ny)}).`);
        if (ch.n >= 1500) o.push(`${good('Look at the picture.')} A triangle with holes: the Sierpinski triangle. Each jump maps the big triangle onto one of its three half-size copies, so after n jumps the dot is inside one of the 3^n pieces of stage n.`);
        else if (ch.n >= 1) o.push(`${ch.n} dot${ch.n === 1 ? '' : 's'} so far. The first dots can look random. Keep going.`);
        return lines(o);
      };
      const makeRo = () => {
        const m = mkParams(), N = m.N, s = m.s, fits = N <= s * s, d = dim(N, s), pre = PRESETS[N + ',' + s], o = [];
        o.push(`${kk('Rule')} ${N} copies, each at scale 1/${s}. Room: ${s}×${s} = ${s * s} cells.`);
        if (!fits) { o.push(bad('They do not fit.') + ` Only ${s * s} cells exist and you asked for ${N}. A flat shape cannot have a dimension above 2, and here ${s}^d = ${N} gives d = ${d4(d)}.`); return lines(o); }
        o.push(`${kk('Equation')} ${s}^d = ${N}, so d = ${dimLine(N, s)}.`);
        if (N === s * s) o.push('N equals s² exactly, so the copies fill the whole square: dimension 2.');
        else o.push(d < 1 ? 'Less than 1: the pieces are separate specks, like dust.' : d === 1 ? 'Exactly 1: the copies fill a line.' : d < 2 ? `Between the line (1) and the plane (2): ${d4(d)}.` : '');
        o.push(m.v === 0 ? (pre ? `This is ${pre.name}.` : 'This arrangement has no special name.') : `Arrangement ${m.v + 1} of 6: a different layout, but the same N and s, so the same d = ${d4(d)}. Dimension does not depend on where the copies go.`);
        if (N === 4 && s === 3) o.push('The Koch curve has the same N = 4 and s = 3, so the same dimension, but the shapes look nothing alike.');
        return lines(o);
      };

      /* ----- practice ----- */
      C.title('Practice');
      C.hint('Seven short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancelPlay(); if (st.practice) { st.practice = false; sync(); } else { st.practice = true; if (!prOver) loadProb(); sync(); } } }])[0];
      grp('practice', () => {
        ptally = h('p', { class: 'ctl-title' });
        pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        addTo(ptally, pq);
        grp('pk', () => { pKS = S({ label: 'Koch stage', min: 0, max: 5, step: 1, value: 0, format: v => 'stage ' + v, onInput: v => { st.pk_ = v; pfb.innerHTML = ''; sync(); } }); });
        grp('ps', () => { pSS = S({ label: 'Sierpinski stage', min: 0, max: 6, step: 1, value: 0, format: v => 'stage ' + v, onInput: v => { st.ps_ = v; pfb.innerHTML = ''; sync(); } }); });
        grp('pb', () => {
          pMN = S({ label: 'Number of copies N', min: 2, max: 9, step: 1, value: 2, format: v => 'N = ' + v, onInput: v => { st.pN = v; pfb.innerHTML = ''; sync(); } });
          pMS = S({ label: 'Scale 1/s', min: 2, max: 5, step: 1, value: 2, format: v => 'scale 1/' + v, onInput: v => { st.pS = v; pfb.innerHTML = ''; sync(); } });
          pcheck = C.buttons([{ label: 'Check my setting', primary: true, onClick: () => checkBuild() }])[0];
        });
        pch = h('div', { class: 'ctl buttons' });
        pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pnext = mkBtn('Next problem', () => nextProb(), true);
        addTo(pch, pfb, h('div', { class: 'ctl buttons' }, pnext));
      });
      const tally = () => { ptally.textContent = `Problem ${prIdx + 1} of ${PROBS.length}. Right on the first try: ${prFirst} of ${prDone} done`; };
      const loadProb = () => {
        const pr = PROBS[prIdx]; prSolved = false; prTried = false; prStage = 0;
        st.pk_ = 0; st.ps_ = 0; st.pN = 2; st.pS = 2; pKS.set(0); pSS.set(0); pMN.set(2); pMS.set(2);
        pq.textContent = pr.q; pfb.innerHTML = ''; pch.replaceChildren(); pnext.disabled = true; pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        if (pr.kind !== 'build') showChoices(pr);
        tally();
      };
      const showChoices = pr => {
        pch.replaceChildren();
        pr.ch.forEach((o, i) => pch.append(mkBtn(o[0], () => pickChoice(i))));
      };
      const pickChoice = i => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        if (pr.kind === 'stage') {
          const cur = pr.cv === 'koch' ? st.pk_ : st.ps_;
          if (cur !== pr.tgt) { pfb.innerHTML = bad('Set the stage first.') + ` The stage slider is at ${cur}. Move it to ${pr.tgt}, then choose.`; return; }
        }
        const right = i === pr.ans, btn = pch.children[i], txt = pr.ch[i][1];
        if (right) {
          prSolved = true; if (!prTried) prFirst++; prDone++; Array.from(pch.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary');
          pfb.innerHTML = good('Right.') + ' ' + txt.replace(/^Yes\.\s*/, ''); pnext.disabled = false;
        } else { prTried = true; btn.disabled = true; pfb.innerHTML = bad('Not quite.') + ' ' + txt + ' Try another answer.'; }
        tally(); sync();
      };
      const checkBuild = () => {
        const pr = PROBS[prIdx]; if (prStage) return;
        if (st.pN > st.pS * st.pS) { prTried = true; pfb.innerHTML = bad('Not yet.') + ` ${st.pN} copies at scale 1/${st.pS} do not fit: the square has room for only ${st.pS * st.pS}. Set the numbers the problem gives.`; tally(); return; }
        if (st.pN !== pr.tN || st.pS !== pr.tS) {
          prTried = true;
          pfb.innerHTML = bad('Not yet.') + ` You set N = ${st.pN} and scale 1/${st.pS}. The problem needs N = ${pr.tN} copies at scale 1/${pr.tS}.`;
          tally(); return;
        }
        prStage = 1; pfb.innerHTML = good('Good.') + ` The picture shows ${pr.tN} copies at scale 1/${pr.tS}, stage 3. ${pr.fin}`;
        showChoices(pr); tally(); sync();
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); sync(); return; }
        prOver = true; prStage = 2;
        pq.textContent = 'All seven problems are done.'; pch.replaceChildren(); pnext.disabled = true;
        pfb.innerHTML = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        pch.append(mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; prOver = false; loadProb(); sync(); }, true));
        ptally.textContent = `Right on the first try: ${prFirst} of ${PROBS.length}`; sync();
      };

      /* ----- sync ----- */
      const sync = () => {
        const pr = st.practice, over = pr && prOver, v = st.view;
        vis(G.view, !pr);
        vis(G.scale, !pr && v === 'scale'); vis(G.koch, !pr && v === 'koch'); vis(G.sier, !pr && v === 'sier'); vis(G.chaos, !pr && v === 'chaos'); vis(G.make, !pr && v === 'make');
        vis(G.practice, pr);
        if (pr) {
          const pb = over ? null : PROBS[prIdx];
          vis(G.pk, !!pb && pb.kind === 'stage' && pb.cv === 'koch'); vis(G.ps, !!pb && pb.kind === 'stage' && pb.cv === 'sier');
          vis(G.pb, !!pb && pb.kind === 'build' && prStage === 0);
          pKS.set(st.pk_); pSS.set(st.ps_); pMN.set(st.pN); pMS.set(st.pS);
        }
        selView.value = st.view;
        /* scale */
        sS.set(st.s); sS.inp.disabled = !qa('pscale').done;
        qScale.render('pscale', QS.pscale, true, null);
        vis(qEqScale.els, !pr && v === 'scale' && qa('pscale').done);
        qEqScale.render('eqscale', QS.eqscale, false, null);
        ro1.innerHTML = scaleRo();
        /* koch */
        ksS.set(st.ks); ksBtns[0].disabled = st.ks <= 0; ksBtns[1].disabled = st.ks >= kochAllowed();
        snowT.checked = st.snow;
        const kq = st.kmax < 5;
        vis(qKoch.els, !pr && v === 'koch' && kq);
        if (kq) qKoch.render('kn' + st.kmax, KQ(st.kmax), false, null);
        vis(qEqKoch.els, !pr && v === 'koch' && st.kmax >= 1);
        qEqKoch.render('eqkoch', QS.eqkoch, false, null);
        ro2.innerHTML = kochRo();
        /* sier */
        ssS.set(st.ss); ssBtns[0].disabled = st.ss <= 0; ssBtns[1].disabled = st.ss >= 6;
        qPSier.render('psier', QS.psier, true, null);
        vis(qEqSier.els, !pr && v === 'sier' && qa('psier').done);
        qEqSier.render('eqsier', QS.eqsier, false, null);
        pascT.checked = st.pasc; rowsSel.value = String(st.prows);
        vis([rowsSel.parentElement, prowS.inp.closest('.ctl'), pkS.inp.closest('.ctl')], !pr && v === 'sier' && st.pasc);
        prowS.inp.max = st.prows - 1; prowS.set(st.prow); pkS.inp.max = st.prow; pkS.set(st.pk);
        ro3.innerHTML = sierRo() + (st.pasc ? '<br>' + pascRo() : '');
        /* chaos */
        const ok = qa('pchaos').done;
        qChaos.render('pchaos', QS.pchaos, true, null);
        cstartSel.value = String(st.cstart); cstartSel.disabled = !ok;
        cmodeBtns.forEach((b, i) => { b.disabled = !ok; b.classList.toggle('primary', st.cmode === ['auto', 'pick'][i]); });
        const auto = st.cmode === 'auto';
        cplay.style.display = auto ? '' : 'none'; cstep.style.display = auto ? '' : 'none';
        cpick.forEach(b => { b.style.display = auto ? 'none' : ''; b.disabled = !ok || ch.picks >= 10 || ch.n >= TOTAL; });
        cplay.textContent = ch.playing ? 'Pause' : 'Play (4000 dots)'; cplay.disabled = !ok || ch.n >= TOTAL; cstep.disabled = !ok || ch.n >= TOTAL || ch.playing;
        creset.disabled = !ok;
        ro4.innerHTML = chaosRo();
        /* make */
        mNS.set(st.mN); mSS.set(st.mS); mstS.set(st.mst);
        mvarBtn.disabled = st.mN > st.mS * st.mS;
        ro5.innerHTML = makeRo();
        startBtn.textContent = pr ? 'Back to the lesson' : 'Start practice';
        P.draw();
      };

      const apply = (patch /*, immediate */) => {
        cancelPlay();
        st.practice = false;
        for (const k in patch) st[k] = patch[k];
        sync();
      };
      sync();
      return { destroy: () => { cancelPlay(); P.destroy(); }, apply };
    }
  });
}
