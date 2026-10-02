/* =====================================================================
   SCHOOL — Two-way tables and conditional probability
   ===================================================================== */
{
  /* ---------- small helpers ---------- */
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;
  const rnd = (v, max, fall) => { for (let d = 0; d <= max; d++) { const r = +v.toFixed(d); if (Math.abs(r - v) < 1e-9) return [String(r), true]; } return [String(+v.toFixed(fall)), false]; };
  const dp = v => { const [a, ea] = rnd(v, 4, 3), [b, eb] = rnd(v * 100, 2, 1); return `${ea ? '=' : '≈'} ${a} ${eb ? '=' : '≈'} ${b}%`; };
  const fracS = (a, b) => { const g = gcd(a, b) || 1; return a === 0 ? '0' : a === b ? '1' : (a / g) + '/' + (b / g); };
  const fline = (n, d) => { const f = n + '/' + d, s = fracS(n, d); return `${f}${s !== f ? ' = ' + s : ''} ${dp(n / d)}`; };
  const v2 = v => (Math.round(v * 100) / 100).toFixed(2);

  /* ---------- the survey data ----------
     cell index k = row * 2 + column.  Row 0 is A, row 1 is not A.  Column 0 is B, column 1 is not B.
     cells = [A and B, A and not B, not A and B, not A and not B] */
  const DS = [
    { name: 'Grade and sport', rows: ['Plays a sport', 'No sport'], cols: ['10th grade', '9th grade'],
      A: 'plays a sport', nA: 'does not play a sport', B: 'is in 10th grade', nB: 'is in 9th grade', cells: [30, 10, 30, 30] },
    { name: 'Phone and streaming', rows: ['Has an iPhone', 'Has an Android'], cols: ['Music', 'Video'],
      A: 'has an iPhone', nA: 'has an Android phone', B: 'likes music best', nB: 'likes video best', cells: [21, 19, 29, 31] }
  ];
  /* the small class survey used to build a table by hand (same shape as survey 1, one fifth the size) */
  const BUILD = { rows: ['Plays a sport', 'No sport'], cols: ['10th grade', '9th grade'], cells: [6, 2, 6, 6] };
  const PEOPLE = [
    ['Ava', 10, 1], ['Ben', 9, 0], ['Chen', 10, 0], ['Dara', 10, 1], ['Eli', 9, 0], ['Fay', 10, 0], ['Gus', 9, 1], ['Hana', 10, 0], ['Ivan', 10, 1], ['Jo', 9, 0],
    ['Kai', 10, 0], ['Lena', 9, 0], ['Mia', 10, 1], ['Noah', 9, 1], ['Omar', 10, 0], ['Pia', 9, 0], ['Quin', 10, 1], ['Rosa', 10, 1], ['Sam', 9, 0], ['Tess', 10, 0]
  ].map(([nm, g, s]) => ({ nm, g, s, cell: (s ? 0 : 1) * 2 + (g === 10 ? 0 : 1) }));
  const ALL = [0, 1, 2, 3];
  const sumK = (ds, arr) => arr.reduce((t, k) => t + ds.cells[k], 0);
  const eqSet = (S, arr) => S.size === arr.length && arr.every(k => S.has(k));

  /* tasks for each activity: num = cells on top of the fraction, den = cells on the bottom */
  const TASKS = {
    events: [
      { id: 'and', name: 'A and B', num: [0], den: ALL },
      { id: 'or', name: 'A or B (or both)', num: [0, 1, 2], den: ALL },
      { id: 'notA', name: 'not A', num: [2, 3], den: ALL },
      { id: 'aNotB', name: 'A but not B', num: [1], den: ALL }
    ],
    prob: [
      { id: 'joint', name: 'P(A and B)', num: [0], den: ALL },
      { id: 'A', name: 'P(A)', num: [0, 1], den: ALL },
      { id: 'AgB', name: 'P(A given B)', num: [0], den: [0, 2] },
      { id: 'BgA', name: 'P(B given A)', num: [0], den: [0, 1] },
      { id: 'or', name: 'P(A or B)', num: [0, 1, 2], den: ALL }
    ],
    indep: [
      { id: 'A', name: 'P(A)', num: [0, 1], den: ALL },
      { id: 'AgB', name: 'P(A given B)', num: [0], den: [0, 2] },
      { id: 'AgnB', name: 'P(A given not B)', num: [1], den: [1, 3] }
    ]
  };
  const MODES = ['build', 'events', 'prob', 'indep'];
  const MODE_LABEL = { build: 'Build a table', events: 'Events and Venn', prob: 'Chance as a fraction', indep: 'Independence' };

  /* ---------- canvas helpers (pixel space) ---------- */
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
    while (size > 10 && tw(c, str, size, o.weight || 600) > maxW) size -= .5;
    T(c, p, str, x, y, { ...o, size });
  };
  const wrap = (c, str, size, maxW, weight = 600) => {
    const words = str.split(' '), lines = []; let cur = '';
    words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (cur && tw(c, t, size, weight) > maxW) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur);
    return lines;
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
  const box = (c, x, y, w, h, fill, stroke, lw = 1.5, dash, r = 6) => {
    rr(c, x, y, w, h, r); if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]); }
  };
  const person = (c, x, y, s, col) => {
    c.beginPath(); c.arc(x, y - s * .55, s * .32, 0, TAU); c.fillStyle = col; c.fill();
    c.beginPath(); c.arc(x, y + s * .55, s * .55, Math.PI, 0); c.closePath(); c.fill();
  };

  /* ---------- the lesson ---------- */
  register({
    id: 'two-way-tables-and-conditional-probability', level: 'school',
    title: 'Two-way tables and conditional probability',
    blurb: 'Sort a survey into a two-way table, read it as a Venn diagram, find chances that depend on what you already know, and test whether two things are connected.',
    thumb(c, p) {
      const pal = p.pal, W = p.w, H = p.h;
      const gx = W * .06, gy = H * .2, cw = W * .14, ch = H * .24;
      for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) {
        const hot = r === 0 && q === 0, edge = r === 2 || q === 2;
        box(c, gx + q * cw, gy + r * ch, cw - 3, ch - 3, hot ? alpha(pal.yellow, .6) : edge ? alpha(pal.text, .07) : alpha(pal.blue, .12), hot ? pal.yellow : pal['grid-strong'], hot ? 2.5 : 1.5, null, 4);
      }
      const cy = H * .5, R = Math.min(W * .1, H * .26), mx = W * .76;
      c.beginPath(); c.arc(mx - R * .55, cy, R, 0, TAU); c.fillStyle = alpha(pal.blue, .18); c.fill(); c.strokeStyle = pal.blue; c.lineWidth = 2.2; c.stroke();
      c.beginPath(); c.arc(mx + R * .55, cy, R, 0, TAU); c.fillStyle = alpha(pal.green, .18); c.fill(); c.strokeStyle = pal.green; c.lineWidth = 2.2; c.stroke();
      c.save(); c.beginPath(); c.arc(mx - R * .55, cy, R, 0, TAU); c.clip(); c.beginPath(); c.arc(mx + R * .55, cy, R, 0, TAU); c.fillStyle = alpha(pal.yellow, .65); c.fill(); c.restore();
    },
    hook: String.raw`Of the students who play a sport, 3 in 4 are in 10th grade. Does that mean 3 in 4 of the 10th graders play a sport?`,
    steps: [
      { title: 'Sort a survey into a table',
        text: String.raw`<p>We asked students two questions: <b>What grade are you in?</b> and <b>Do you play a sport?</b> A <b>two-way table</b> sorts each student by both answers at once. Each student goes in exactly one cell.</p><p>A card shows the next student. Tap the cell where that student belongs. After all 20 are sorted, tap a total box, set its number with the slider and press <b>Check totals</b>. The totals at the edges are the <b>margins</b>.</p>`,
        set: { mode: 'build', ds: 0, task: 0 } },
      { title: 'Events as cells and circles',
        text: String.raw`<p>Now the whole survey: 100 students. Call <b>A</b> "plays a sport" and <b>B</b> "is in 10th grade". Each circle in the Venn diagram is one event. The same four groups are table cells and Venn regions.</p><p>Mark the cells (or Venn regions) for <b>A and B</b> (in both circles), then <b>A or B</b> (in at least one circle) and <b>not A</b> (outside circle A). Press <b>Check my event</b> to see how many students are in it.</p>`,
        set: { mode: 'events', ds: 0, task: 0 } },
      { title: 'A chance when you know something',
        text: String.raw`<p>Suppose you know a student is in 10th grade. What is the chance that this student plays a sport? This is a <b>conditional probability</b>, written P(A given B). Only the 10th graders can be the one you picked, so the sample space shrinks to the 10th grade column.</p><p>Choose <b>P(A given B)</b>. Mark the cells that count as the <b>top</b> of the fraction. Switch to <b>bottom</b> and mark the cells that make the new sample space. Then try <b>P(B given A)</b> and compare.</p>`,
        set: { mode: 'prob', ds: 0, task: 2 } },
      { title: 'Does knowing B change A?',
        text: String.raw`<p>Two events are <b>independent</b> if knowing one does not change the chance of the other. Here 100 students were asked about their phone and their favorite streaming service. A is "has an iPhone" and B is "likes music best".</p><p>Find P(A) and P(A given B). Real counts are almost never exactly equal, so ask whether the two numbers are close. Then give your verdict. Switch the survey to grade and sport and compare.</p>`,
        set: { mode: 'indep', ds: 1, task: 0 } }
    ],
    formal: String.raw`
      <h3>Two-way frequency tables</h3>
      <p>When each person is classified by two categories, such as grade and sport, a <em>two-way frequency table</em> counts the people for every pair of answers. Each person is in exactly one cell, so the cells add up to the grand total. The row totals and column totals sit in the margins. Both sets of margins must add to the grand total. If they do not, someone was counted twice or missed.</p>
      <h3>Events as subsets, and Venn diagrams</h3>
      <p>Take one student at random from the survey of 100. The <em>sample space</em> is all 100 students. An <em>event</em> is a subset of it, picked out by a description. Let \(A\) be "plays a sport" and \(B\) be "is in 10th grade". In the first survey there are 40 students in \(A\) and 60 in \(B\). Cell by cell:</p>
      <p>\(n(A\text{ and }B)=30\), \(n(A\text{ and not }B)=10\), \(n(\text{not }A\text{ and }B)=30\), \(n(\text{not }A\text{ and not }B)=30\).</p>
      <p>The <em>intersection</em> "\(A\) and \(B\)" is the overlap of the circles, one cell. The <em>union</em> "\(A\) or \(B\)" is everyone in at least one circle. The <em>complement</em> "not \(A\)" is everyone outside circle \(A\). To count a union from totals, subtract the overlap once, because adding the two totals counts it twice:
      \[ n(A\text{ or }B)=n(A)+n(B)-n(A\text{ and }B)=40+60-30=70. \]
      For a complement, \(n(\text{not }A)=100-n(A)=60\).</p>
      <h3>Joint, marginal and conditional probability</h3>
      <p>When every student is equally likely to be picked, a chance is a count over a count.
      \[ P(\text{event})=\frac{\text{students in the event}}{\text{students in the sample space}}. \]
      A <em>joint</em> probability uses a cell: \(P(A\text{ and }B)=\tfrac{30}{100}=0.3\). A <em>marginal</em> probability uses a total from the margin: \(P(A)=\tfrac{40}{100}=0.4\).</p>
      <p>A <em>conditional</em> probability \(P(A\mid B)\), read "the probability of \(A\) given \(B\)", is the chance of \(A\) when you already know \(B\) happened. Knowing \(B\) removes everyone outside \(B\) from the sample space, so only the \(B\) column is left:
      \[ P(A\mid B)=\frac{n(A\text{ and }B)}{n(B)}=\frac{30}{60}=0.5. \]
      The bottom is the column total, not the grand total. Dividing by 100 would give the joint probability \(P(A\text{ and }B)\) instead.</p>
      <h3>The order matters</h3>
      <p>\(P(A\mid B)\) and \(P(B\mid A)\) share the same top, 30, but have different bottoms. \(P(B\mid A)=\tfrac{30}{40}=0.75\), while \(P(A\mid B)=0.5\). Three in four athletes are 10th graders, but only one in two 10th graders is an athlete. The group you are given is the group that becomes the sample space.</p>
      <h3>Independence</h3>
      <p>Events \(A\) and \(B\) are <em>independent</em> if knowing \(B\) does not change the chance of \(A\):
      \[ P(A\mid B)=P(A). \]
      Equivalent forms are \(P(A\text{ and }B)=P(A)\,P(B)\) and \(P(B\mid A)=P(B)\). In the phone survey, \(P(A)=\tfrac{40}{100}=0.40\) and \(P(A\mid B)=\tfrac{21}{50}=0.42\). If they were exactly independent, we would expect \(0.40\times 50=20\) music fans with an iPhone, and we see 21. In the grade survey, \(P(A)=0.4\) but \(P(A\mid B)=0.5\) and \(P(A\mid\text{not }B)=0.25\). Knowing the grade changes the chance a lot, so those events are not independent.</p>
      <h3>Caveats</h3>
      <p>Counts from a real survey are almost never exactly equal, so you judge whether the two chances are close. A gap of 0.02 with 100 students is ordinary wobble. A gap above about 0.05, with counts this size, is large enough that this lesson calls the events associated. "Not independent" means the events are associated. It does not mean one causes the other. This lesson uses data where every student is equally likely to be picked, and it does not give a formal test for how large a gap is too large.</p>`,
    check: [
      { q: 'A survey of 80 students asked two questions: do you take the bus or walk to school, and do you have a part-time job. The counts are: bus and job 12, bus and no job 28, walk and job 8, walk and no job 32. A student is picked at random. What is the probability that the student has a job, given that the student takes the bus?',
        choices: ['12/80 = 3/20', '12/40 = 3/10', '12/20 = 3/5', '20/80 = 1/4'], answer: 1,
        why: String.raw`"Given that the student takes the bus" shrinks the sample space to the bus riders: 12 + 28 = 40 students. Of those, 12 have a job, so the probability is \(12/40=3/10\). The answer 12/80 divides by the grand total, which gives the chance of bus and job together. The answer 12/20 divides by the 20 students with jobs, which is the chance of riding the bus given a job. The answer 20/80 is the chance of having a job, with no condition at all.`,
        hint: 'Which students are you allowed to pick from when you already know the student takes the bus?' },
      { q: 'Among 100 students, 40 have a pet, 50 are in a club, and 20 have a pet and are also in a club. Are "has a pet" and "is in a club" independent?',
        choices: ['No, because only 20 of the 100 students have both', 'No, because 20 is less than 40 and less than 50', 'Yes, because the chance of a pet among club members, 20/50 = 0.4, equals the chance of a pet overall, 40/100 = 0.4', 'Yes, because 40 and 50 are both greater than 20'], answer: 2,
        why: String.raw`Independent means knowing one event does not change the chance of the other. Among the 50 club members, 20 have a pet, so \(P(\text{pet}\mid\text{club})=20/50=0.4\). The chance of a pet overall is \(40/100=0.4\). They match, so the events are independent. How small the count 20 is, or how it compares with 40 and 50, does not decide independence. Only comparing the two chances does.`,
        hint: 'Find the chance of a pet among club members only, then compare it with the chance of a pet among all 100 students.' }
    ],
    links: { prereq: ['compound-events-and-tree-diagrams'], related: ['probability-with-repeated-trials', 'sample-spaces-and-probability', 'samples-and-populations', 'pascals-triangle-and-the-galton-board'] },

    mount({ stage, controls: C }) {
      delete stage.dataset.coords;
      const P = new Plane(stage, { span: 5 });
      let hits = [];
      const st = {
        mode: 'build', ds: 0, task: 0, msg: '',
        bi: 0, placed: [0, 0, 0, 0], tot: { r0: null, r1: null, c0: null, c1: null, g: null }, okT: {}, selT: 'r0', buildDone: false,
        num: new Set(), den: new Set(), mark: 'num', via: new Set(), res: {}
      };
      const D = () => DS[st.ds];
      const tasks = () => TASKS[st.mode] || [];
      const curTask = () => tasks()[Math.min(st.task, tasks().length - 1)];
      const N = () => sumK(D(), ALL);
      const rowPh = r => r === 0 ? D().A : D().nA, colPh = q => q === 0 ? D().B : D().nB;
      const cellName = k => `${D().rows[k >> 1]}, ${D().cols[k & 1]} (${D().cells[k]})`;
      const cellSay = k => `${rowPh(k >> 1)} and ${colPh(k & 1)} (${D().cells[k]})`;
      const grpName = arr => {
        const ds = D();
        if (eqSet(new Set(arr), ALL)) return `everyone (${N()})`;
        if (eqSet(new Set(arr), [0, 2])) return `the "${ds.cols[0]}" column (${sumK(ds, arr)})`;
        if (eqSet(new Set(arr), [1, 3])) return `the "${ds.cols[1]}" column (${sumK(ds, arr)})`;
        if (eqSet(new Set(arr), [0, 1])) return `the "${ds.rows[0]}" row (${sumK(ds, arr)})`;
        if (eqSet(new Set(arr), [2, 3])) return `the "${ds.rows[1]}" row (${sumK(ds, arr)})`;
        return arr.length + ' cells (' + sumK(ds, arr) + ')';
      };
      const evSentence = id => {
        const ds = D();
        return ({
          and: `A student ${ds.A} and ${ds.B}`, joint: `A student ${ds.A} and ${ds.B}`,
          or: `A student ${ds.A}, or ${ds.B}, or both`, notA: `A student ${ds.nA}`, aNotB: `A student ${ds.A} but ${ds.nB}`,
          A: `A student ${ds.A}`, AgB: `A student ${ds.A}, given that the student ${ds.B}`, BgA: `A student ${ds.B}, given that the student ${ds.A}`,
          AgnB: `A student ${ds.A}, given that the student ${ds.nB}`
        })[id];
      };
      const resKey = id => st.ds + id;
      const resVal = id => { const r = st.res[resKey(id)]; return r ? r.n / r.d : null; };

      /* ---------- layout ---------- */
      const layout = (W, H, top) => {
        const x = 10, y = top, w = W - 20, h = H - top - 10, wide = W >= 600;
        if (wide) { const tw0 = st.mode === 'build' ? Math.min(Math.round(w * .8), 620) : Math.min(Math.round(w * .54), 470); return { t: { x, y, w: tw0, h }, s: { x: x + tw0 + 14, y, w: w - tw0 - 14, h }, wide }; }
        const th = st.mode === 'build' ? h : Math.min(h * .44, 230);
        return { t: { x, y, w, h: th }, s: { x, y: y + th + 8, w, h: h - th - 8 }, wide };
      };
      /* grid geometry for the 3 x 3 table; r, q in 0..2, 2 = totals */
      const grid = (R, build) => {
        const x = R.x, y = R.y + (build ? 70 : 0), hh = 46, lw = clamp(R.w * .27, 76, 112);
        const rh = clamp((R.h - (build ? 70 : 0) - hh - 6) / 3, 36, 62), cw = (R.w - lw) / 3;
        return { x, y, hh, lw, rh, cw, cell: (r, q) => ({ x: x + lw + q * cw, y: y + hh + r * rh, w: cw - 4, h: rh - 4 }) };
      };

      /* ---------- drawing ---------- */
      const colA = p => p.pal.blue, colB = p => p.pal.green;
      const drawTable = (c, p, R, build) => {
        const pal = p.pal, G = grid(R, build), ds = build ? BUILD : D(), calc = !build;
        const cells = build ? st.placed : D().cells;
        const rowTot = [cells[0] + cells[1], cells[2] + cells[3]], colTot = [cells[0] + cells[2], cells[1] + cells[3]], grand = cells.reduce((t, v) => t + v, 0);
        const inNum = k => !build && st.num.has(k), inDen = k => calc && st.mode !== 'events' && st.den.has(k);
        const dimmed = k => calc && st.mode !== 'events' && st.den.size > 0 && !st.den.has(k);
        const sz = clamp(G.cw * .13, 11.5, 13.5);
        /* column headers */
        for (let q = 0; q < 3; q++) {
          const cx = G.x + G.lw + q * G.cw + (G.cw - 4) / 2, hy = G.y + G.hh / 2;
          if (q === 2) { T(c, p, 'Total', cx, hy + 6, { size: sz + .5, color: pal.muted, halo: false }); }
          else {
            if (calc) T(c, p, q === 0 ? 'B' : 'not B', cx, hy - 8, { size: 13, color: q === 0 ? colB(p) : pal.muted, weight: 800, halo: false });
            Tfit(c, p, ds.cols[q], cx, hy + (calc ? 9 : 6), G.cw - 8, { size: sz, color: pal.text, halo: false });
          }
          if (calc) {
            const arr = q === 2 ? ALL : [q, q + 2], lab = q === 0 ? 'colB' : q === 1 ? 'colnB' : 'all';
            hits.push({ x: G.x + G.lw + q * G.cw, y: G.y, w: G.cw, h: G.hh, fn: () => tapGroup(arr, lab) });
          }
        }
        /* row headers and cells */
        for (let r = 0; r < 3; r++) {
          const ry = G.y + G.hh + r * G.rh;
          if (r === 2) T(c, p, 'Total', G.x + 8, ry + (G.rh - 4) / 2, { size: sz + .5, color: pal.muted, align: 'left', halo: false });
          else {
            if (calc) T(c, p, r === 0 ? 'A' : 'not A', G.x + 8, ry + (G.rh - 4) / 2 - 9, { size: 13, color: r === 0 ? colA(p) : pal.muted, weight: 800, align: 'left', halo: false });
            Tfit(c, p, ds.rows[r], G.x + 8, ry + (G.rh - 4) / 2 + (calc ? 9 : 0), G.lw - 12, { size: sz, color: pal.text, align: 'left', halo: false });
          }
          if (calc) {
            const arr = r === 2 ? ALL : [r * 2, r * 2 + 1], lab = r === 0 ? 'rowA' : r === 1 ? 'rownA' : 'all';
            hits.push({ x: G.x, y: ry, w: G.lw, h: G.rh, fn: () => tapGroup(arr, lab) });
          }
          for (let q = 0; q < 3; q++) {
            const b = G.cell(r, q), margin = r === 2 || q === 2;
            if (!margin) {
              const k = r * 2 + q, on = inNum(k), den = inDen(k), dim = dimmed(k);
              box(c, b.x, b.y, b.w, b.h, on ? alpha(pal.yellow, .55) : den ? alpha(pal.blue, .16) : alpha(pal.text, dim ? .02 : .05),
                on ? pal.yellow : den ? pal.blue : pal['grid-strong'], on ? 3 : den ? 2 : 1.5);
              const big = clamp(b.h * .42, 16, 26);
              if (build) {
                T(c, p, String(cells[k]), b.x + b.w / 2, b.y + b.h / 2 + 1, { size: big, color: cells[k] ? pal.text : pal.muted, weight: 700, halo: false });
                for (let i = 0; i < cells[k]; i++) { c.beginPath(); c.arc(b.x + 10 + (i % 8) * 8, b.y + b.h - 8, 3, 0, TAU); c.fillStyle = alpha(pal.blue, .7); c.fill(); }
                hits.push({ x: b.x, y: b.y, w: b.w, h: b.h, fn: () => sortTap(k) });
              } else {
                T(c, p, String(D().cells[k]), b.x + b.w / 2, b.y + b.h / 2 + 1, { size: big, color: dim ? alpha(pal.text, .38) : pal.text, weight: 700, halo: false });
                hits.push({ x: b.x, y: b.y, w: b.w, h: b.h, fn: () => tapCells([k]) });
              }
            } else {
              const key = r === 2 && q === 2 ? 'g' : r === 2 ? 'c' + q : 'r' + r;
              if (build) {
                const sel = st.selT === key && st.bi >= PEOPLE.length, v = st.tot[key], good = st.okT[key], bad = st.okT[key] === false;
                box(c, b.x, b.y, b.w, b.h, good ? alpha(pal.green, .18) : bad ? alpha(pal.red, .14) : alpha(pal.text, .03), sel ? pal.brass : good ? pal.green : bad ? pal.red : pal.grid, sel ? 3 : 1.5, st.bi >= PEOPLE.length ? null : [4, 4]);
                if (st.bi >= PEOPLE.length) T(c, p, v === null ? '?' : String(v), b.x + b.w / 2, b.y + b.h / 2 + 1, { size: clamp(b.h * .4, 15, 24), color: v === null ? pal.muted : pal.text, weight: 700, halo: false });
                hits.push({ x: b.x, y: b.y, w: b.w, h: b.h, fn: () => selTot(key) });
              } else {
                const val = r === 2 && q === 2 ? grand : r === 2 ? colTot[q] : rowTot[r];
                const arr = r === 2 && q === 2 ? ALL : r === 2 ? [q, q + 2] : [r * 2, r * 2 + 1];
                const lab = r === 2 && q === 2 ? 'all' : r === 2 ? (q === 0 ? 'colB' : 'colnB') : (r === 0 ? 'rowA' : 'rownA');
                const on = arr.every(k => st.num.has(k)) && st.mode !== 'indepX';
                box(c, b.x, b.y, b.w, b.h, alpha(pal.text, .03), pal['grid'], 1.5, [4, 3]);
                T(c, p, String(val), b.x + b.w / 2, b.y + b.h / 2 + 1, { size: clamp(b.h * .36, 14, 22), color: pal.muted, weight: 700, halo: false });
                hits.push({ x: b.x, y: b.y, w: b.w, h: b.h, fn: () => tapGroup(arr, lab) });
              }
            }
          }
        }
        return G;
      };

      /* Venn geometry and drawing */
      const vgeom = R => {
        const ux = R.x + 2, uy = R.y + 26, uw = R.w - 4, uh = Math.min(R.h - 30, uw * .8);
        const r = Math.max(10, Math.min(uh * .36, uw * .27)), mid = ux + uw / 2, d = r * .55;
        return { ux, uy, uw, uh, r, mid, d, cx1: mid - d, cx2: mid + d, cy: uy + uh * .46 };
      };
      const clipRegion = (c, g, k) => {
        const circ = cx => { c.beginPath(); c.arc(cx, g.cy, g.r, 0, TAU); c.clip(); };
        const notCirc = cx => { c.beginPath(); c.rect(g.ux, g.uy, g.uw, g.uh); c.moveTo(cx + g.r, g.cy); c.arc(cx, g.cy, g.r, 0, TAU); c.clip('evenodd'); };
        if (k === 0) { circ(g.cx1); circ(g.cx2); }
        else if (k === 1) { circ(g.cx1); notCirc(g.cx2); }
        else if (k === 2) { circ(g.cx2); notCirc(g.cx1); }
        else { notCirc(g.cx1); notCirc(g.cx2); }
      };
      const drawVenn = (c, p, R) => {
        const pal = p.pal, g = vgeom(R), ds = D();
        const half = R.w / 2 - 6;
        Tfit(c, p, `A: ${ds.rows[0]} (${sumK(ds, [0, 1])})`, R.x + 2, R.y + 10, half, { size: 13, color: colA(p), weight: 700, align: 'left', halo: false });
        Tfit(c, p, `B: ${ds.cols[0]} (${sumK(ds, [0, 2])})`, R.x + R.w - 2, R.y + 10, half, { size: 13, color: colB(p), weight: 700, align: 'right', halo: false });
        box(c, g.ux, g.uy, g.uw, g.uh, alpha(pal.text, .03), pal['grid-strong'], 1.5, null, 6);
        c.beginPath(); c.arc(g.cx1, g.cy, g.r, 0, TAU); c.fillStyle = alpha(pal.blue, .09); c.fill();
        c.beginPath(); c.arc(g.cx2, g.cy, g.r, 0, TAU); c.fillStyle = alpha(pal.green, .09); c.fill();
        for (let k = 0; k < 4; k++) {
          const on = st.num.has(k), den = st.mode !== 'events' && st.den.has(k), dim = st.mode !== 'events' && st.den.size > 0 && !st.den.has(k);
          if (!on && !den && !dim) continue;
          c.save(); clipRegion(c, g, k);
          c.fillStyle = on ? alpha(pal.yellow, .6) : den ? alpha(pal.blue, .2) : alpha(pal.muted, .22);
          c.fillRect(g.ux, g.uy, g.uw, g.uh); c.restore();
        }
        c.beginPath(); c.arc(g.cx1, g.cy, g.r, 0, TAU); c.strokeStyle = pal.blue; c.lineWidth = 2.6; c.stroke();
        c.beginPath(); c.arc(g.cx2, g.cy, g.r, 0, TAU); c.strokeStyle = pal.green; c.lineWidth = 2.6; c.stroke();
        const cs = clamp(g.r * .3, 14, 22), pos = [[g.mid, g.cy], [g.mid - g.r, g.cy], [g.mid + g.r, g.cy], [g.ux + g.uw - 24, g.uy + g.uh - 16]];
        pos.forEach(([x, y], k) => T(c, p, String(ds.cells[k]), x, y, { size: cs, weight: 800, color: p.pal.text, halo: true }));
        T(c, p, 'not A, not B', g.ux + g.uw - 8, g.uy + g.uh - 34, { size: 11, color: pal.muted, align: 'right', halo: false });
        T(c, p, `All ${N()} students`, g.ux + 8, g.uy + g.uh - 14, { size: 11.5, color: pal.muted, align: 'left', halo: false });
        hits.push({
          x: g.ux, y: g.uy, w: g.uw, h: g.uh,
          fn: (px, py) => {
            const inA = Math.hypot(px - g.cx1, py - g.cy) <= g.r, inB = Math.hypot(px - g.cx2, py - g.cy) <= g.r;
            tapCells([inA && inB ? 0 : inA ? 1 : inB ? 2 : 3]);
          }
        });
      };

      /* bars for the independence activity */
      const drawBars = (c, p, R) => {
        const pal = p.pal, ids = ['A', 'AgB', 'AgnB'], labs = ['P(A)', 'P(A given B)', 'P(A given not B)'];
        const lw = clamp(R.w * .34, 96, 130), bx = R.x + lw, bw = R.w - lw - 52, rowH = clamp((R.h - 60) / 3, 34, 50);
        Tfit(c, p, 'Chance of A: how does it change?', R.x + 2, R.y + 12, R.w - 4, { size: 13, color: pal.muted, align: 'left', halo: false });
        const y0 = R.y + 34, pa = resVal('A');
        ids.forEach((id, i) => {
          const y = y0 + i * rowH, v = resVal(id), bh = rowH * .5;
          Tfit(c, p, labs[i], R.x + 2, y + bh / 2, lw - 8, { size: 13, color: pal.text, align: 'left', halo: false });
          box(c, bx, y, bw, bh, alpha(pal.text, .04), pal['grid-strong'], 1, v === null ? [4, 4] : null, 4);
          if (v !== null) {
            box(c, bx, y, Math.max(2, bw * v), bh, alpha(i === 0 ? pal.blue : pal.yellow, .75), null, 0, null, 4);
            T(c, p, v2(v), bx + bw + 8, y + bh / 2, { size: 13, color: pal.text, align: 'left', halo: false, weight: 700 });
          } else T(c, p, '?', bx + bw / 2, y + bh / 2, { size: 14, color: pal.muted, halo: false });
        });
        if (pa !== null) { const x = bx + bw * pa; seg(c, x, y0 - 6, x, y0 + 3 * rowH - rowH * .5 + 6, pal.text, 1.5, [5, 4]); T(c, p, 'dashed line: P(A)', R.x + 2, y0 + 3 * rowH + 4, { size: 12, color: pal.muted, align: 'left', halo: false }); }
        else T(c, p, 'Find the chances in the table. Bars appear here.', R.x + 2, y0 + 3 * rowH + 4, { size: 12, color: pal.muted, align: 'left', halo: false });
      };

      const drawCard = (c, p, R) => {
        const pal = p.pal, done = st.bi >= PEOPLE.length, w = R.w;
        box(c, R.x, R.y, w, 62, alpha(pal.blue, .08), done ? pal.green : pal.blue, 2, null, 8);
        if (done) { Tfit(c, p, 'All 20 students sorted.', R.x + 14, R.y + 22, w - 28, { size: 15, align: 'left', weight: 700, halo: false }); Tfit(c, p, st.buildDone ? 'Every total is right.' : 'Now fill in the five total boxes.', R.x + 14, R.y + 44, w - 28, { size: 13, color: pal.muted, align: 'left', halo: false }); return; }
        const s = PEOPLE[st.bi];
        person(c, R.x + 30, R.y + 28, 22, pal.blue);
        T(c, p, `${s.nm}  (student ${st.bi + 1} of 20)`, R.x + 56, R.y + 18, { size: 14, align: 'left', weight: 700, halo: false });
        const ch = [s.g + 'th grade', s.s ? 'plays a sport' : 'does not play a sport'];
        let x = R.x + 56;
        ch.forEach(t => { const ww = tw(c, t, 12.5, 700) + 16; box(c, x, R.y + 31, ww, 24, alpha(pal.yellow, .3), pal.yellow, 1.5, null, 12); T(c, p, t, x + ww / 2, R.y + 43.5, { size: 12.5, weight: 700, halo: false }); x += ww + 6; });
      };

      P.onDraw = (c, p) => {
        hits = [];
        const W = p.w, H = p.h, pal = p.pal, m = st.mode;
        const title = m === 'build' ? 'Class survey: grade and sport (20)' : `${D().name}: ${N()} students`;
        Tfit(c, p, title, 14, 16, W - 28, { size: 15, align: 'left', weight: 700, halo: false });
        let sub;
        if (m === 'build') sub = st.bi < PEOPLE.length ? 'Tap the cell where this student belongs: their row and column must both match.' : 'Tap a total box, set it with the slider, then press Check totals.';
        else if (m === 'events') sub = `Mark the cells or Venn regions for: ${evSentence(curTask().id)}.`;
        else sub = `${evSentence(curTask().id)}. Marking the ${st.mark === 'num' ? 'TOP (yellow): the cells that count' : 'BOTTOM (blue): the new sample space'}.`;
        const lines = wrap(c, sub, 12.5, W - 28).slice(0, 3);
        lines.forEach((l, i) => T(c, p, l, 14, 37 + i * 16, { size: 12.5, align: 'left', color: pal.muted, halo: false }));
        const top = 37 + lines.length * 16 + 6, L = layout(W, H, top);
        if (m === 'build') { drawCard(c, p, L.t); drawTable(c, p, L.t, true); return; }
        drawTable(c, p, L.t, false);
        if (m === 'indep') drawBars(c, p, L.s); else drawVenn(c, p, L.s);
      };

      /* ---------- actions ---------- */
      const sortTap = k => {
        if (st.bi >= PEOPLE.length) { st.msg = 'All 20 students are sorted. Tap a total box and set its number.'; return; }
        const s = PEOPLE[st.bi], ds = BUILD, who = `${s.nm} is in ${s.g}th grade and ${s.s ? 'plays a sport' : 'does not play a sport'}`;
        if (k === s.cell) {
          st.placed[k]++; st.bi++;
          st.msg = `${ok('Right.')} ${who}, so ${s.nm} goes in the row "${ds.rows[k >> 1]}" and the column "${ds.cols[k & 1]}". Each student goes in exactly one cell.`;
          if (st.bi >= PEOPLE.length) st.msg += `<br>All 20 are sorted. Now add up each row and each column. Tap a total box, set its number with the slider, and press Check totals.`;
        } else {
          const rOk = (k >> 1) === (s.cell >> 1), qOk = (k & 1) === (s.cell & 1);
          const why = !rOk && !qOk ? `Both are wrong: you tapped "${ds.rows[k >> 1]}" and "${ds.cols[k & 1]}".` : !rOk ? `The column "${ds.cols[k & 1]}" is right, but the row is wrong. ${s.nm} ${s.s ? 'plays' : 'does not play'} a sport, so look in the row "${ds.rows[s.cell >> 1]}".` : `The row "${ds.rows[k >> 1]}" is right, but the column is wrong. ${s.nm} is in ${s.g}th grade, so look in the column "${ds.cols[s.cell & 1]}".`;
          st.msg = `${no('Not that cell.')} ${who}. ${why}`;
        }
      };
      const selTot = key => {
        if (st.bi < PEOPLE.length) { st.msg = 'Sort all 20 students first. Then the total boxes open up.'; return; }
        st.selT = key; st.msg = ''; slider.set(st.tot[key] === null ? 0 : st.tot[key]);
      };
      const checkTotals = () => {
        if (st.bi < PEOPLE.length) { st.msg = `${no('Not yet.')} Sort all 20 students first (${st.bi} done).`; return; }
        const ds = BUILD, pl = st.placed, truth = { r0: pl[0] + pl[1], r1: pl[2] + pl[3], c0: pl[0] + pl[2], c1: pl[1] + pl[3], g: 20 };
        const parts = [], empty = [];
        const nm = { r0: `row "${ds.rows[0]}"`, r1: `row "${ds.rows[1]}"`, c0: `column "${ds.cols[0]}"`, c1: `column "${ds.cols[1]}"`, g: 'the grand total' };
        const how = { r0: `${pl[0]} + ${pl[1]}`, r1: `${pl[2]} + ${pl[3]}`, c0: `${pl[0]} + ${pl[2]}`, c1: `${pl[1]} + ${pl[3]}` };
        Object.keys(truth).forEach(key => {
          const v = st.tot[key];
          if (v === null) { empty.push(nm[key]); return; }
          if (v === truth[key]) { st.okT[key] = true; return; }
          st.okT[key] = false;
          parts.push(key === 'g' ? `For the grand total you wrote ${v}. Every one of the 20 students is in exactly one cell, so the grand total is 20, and it equals the row totals added (${truth.r0} + ${truth.r1}) and the column totals added (${truth.c0} + ${truth.c1}).`
            : `For ${nm[key]} you wrote ${v}. Add the two cells in it: ${how[key]} = ${truth[key]}.`);
        });
        if (empty.length) parts.unshift(`You have not set: ${empty.join(', ')}. Tap a box, move the slider, then check again.`);
        if (!parts.length) {
          st.buildDone = true;
          st.msg = `${ok('Complete.')} Row totals: ${truth.r0} + ${truth.r1} = 20. Column totals: ${truth.c0} + ${truth.c1} = 20. Both ways give the grand total 20, which is a good check that no student was missed or counted twice.<br>Next, open <b>Events and Venn</b> to see this kind of table for a survey of 100.`;
        } else st.msg = `${no('Not yet.')} ` + parts.join('<br>');
      };
      const target = () => st.mode === 'events' ? st.num : (st.mark === 'num' ? st.num : st.den);
      const tapCells = arr => {
        if (st.mode === 'build') return;
        const S = target(); arr.forEach(k => S.has(k) ? S.delete(k) : S.add(k)); st.msg = '';
      };
      const tapGroup = (arr, lab) => {
        if (st.mode === 'build') return;
        const S = target(), full = arr.every(k => S.has(k));
        if (full) { arr.forEach(k => S.delete(k)); st.via.delete(lab); } else { arr.forEach(k => S.add(k)); if (S === st.num) st.via.add(lab); }
        st.msg = '';
      };

      /* ---------- feedback for events and probabilities ---------- */
      const winText = t => {
        const ds = D(), n = sumK(ds, t.num), d = sumK(ds, t.den), nA = sumK(ds, [0, 1]), nB = sumK(ds, [0, 2]), both = ds.cells[0], tot = N();
        const f = fline(n, d), parts = [];
        const cmp = (a, b) => { const x = resVal(a), y = resVal(b); return x !== null && y !== null ? `<br>${kk('Compare')} P(A given B) = ${v2(resVal('AgB'))}, P(B given A) = ${v2(resVal('BgA'))}. They are not the same, because the top is the same but the bottoms (${sumK(ds, [0, 2])} and ${sumK(ds, [0, 1])}) differ.` : ''; };
        switch (t.id) {
          case 'and': parts.push(`${ok('Right.')} The overlap of the two circles is the one cell where both are true: ${n} students. This is the <b>intersection</b>, "A and B".`); break;
          case 'or':
            parts.push(`${ok('Right.')} The <b>union</b> "A or B" is everyone in at least one circle: ${ds.cells[0]} + ${ds.cells[1]} + ${ds.cells[2]} = ${n} students.`);
            parts.push(`Be careful with the totals: ${nA} (circle A) + ${nB} (circle B) = ${nA + nB}, but the ${both} students in both circles were counted twice. Subtract them once: ${nA} + ${nB} - ${both} = ${n}.`);
            if (st.mode === 'prob') parts.push(`The chance is ${f} out of all ${tot} students.`);
            break;
          case 'notA': parts.push(`${ok('Right.')} The <b>complement</b> "not A" is everyone outside circle A: ${ds.cells[2]} + ${ds.cells[3]} = ${n} students. Check: ${nA} in A plus ${n} not in A makes ${tot}.`); break;
          case 'aNotB': parts.push(`${ok('Right.')} "A but not B" is the part of circle A that is outside circle B: ${n} students.`); break;
          case 'joint': parts.push(`${ok('Right.')} P(A and B) is a <b>joint</b> probability. The top is the one cell where both are true (${n}). There is no extra information, so the sample space is everyone: ${d}. ${f}.`); break;
          case 'A': parts.push(`${ok('Right.')} P(A) is a <b>marginal</b> probability, because its count (${n}) is a total from the margin of the table. Everyone is possible, so the bottom is ${d}. ${f}.`); break;
          case 'AgB':
            parts.push(`${ok('Right.')} "Given B" means you already know the student is in B, so only the "${ds.cols[0]}" column (${d} students) can be the one picked. Of those, ${n} are in A. So P(A given B) = ${f}. The grand total ${tot} is not used.`);
            if (st.mode === 'prob' || st.mode === 'indep') parts.push(`Compare with P(A) = ${fline(nA, tot)}.`);
            if (st.mode === 'prob') parts.push(cmp('AgB', 'BgA').replace(/^<br>/, ''));
            break;
          case 'BgA':
            parts.push(`${ok('Right.')} "Given A" shrinks the sample space to the "${ds.rows[0]}" row (${d} students). Of those, ${n} are in B. So P(B given A) = ${f}.`);
            parts.push(`The top is still ${n}, but the bottom is ${d}, not ${sumK(ds, [0, 2])}. So P(B given A) is not P(A given B).`);
            if (resVal('AgB') !== null) parts.push(cmp('AgB', 'BgA').replace(/^<br>/, ''));
            break;
          case 'AgnB': parts.push(`${ok('Right.')} Given "not B", the sample space is the "${ds.cols[1]}" column (${d} students). ${n} of them are in A, so P(A given not B) = ${f}.`); break;
        }
        return parts.filter(Boolean).join('<br>');
      };
      const check = () => {
        const t = curTask(), n = st.num, d = st.den, ds = D(), calc = st.mode !== 'events', parts = [];
        if (!n.size) { st.msg = `${no('Not yet.')} Tap the cells that count${calc ? ' (the top of the fraction)' : ''} first.`; return; }
        if (calc && !d.size) { st.msg = `${no('Not yet.')} Now choose <b>bottom of fraction</b> and tap the cells that make up the sample space.`; return; }
        const okDen = !calc || eqSet(d, t.den), okNum = eqSet(n, t.num);
        if (calc && !okDen) {
          const swap = t.id === 'AgB' ? [0, 1] : t.id === 'BgA' ? [0, 2] : null;
          if (d.size === 4 && t.den.length < 4) parts.push(`${no('The bottom is the problem.')} You used everyone (${N()}) as the sample space. But with "given", you already know something, so only ${grpName(t.den)} can be the student picked. Dividing by ${N()} would give the chance of both together, not the conditional chance.`);
          else if (t.den.length === 4) parts.push(`${no('The bottom is the problem.')} This question has no "given", so nothing is ruled out. Everyone (${N()}) is in the sample space.`);
          else if (swap && eqSet(d, swap)) parts.push(`${no('Wrong group on the bottom.')} You chose ${grpName(swap)}. That is the group for ${t.id === 'AgB' ? 'P(B given A)' : 'P(A given B)'}. The group after the word "given" is the one that becomes the sample space: here it is ${grpName(t.den)}.`);
          else parts.push(`${no('The bottom is not right.')} The sample space should be ${grpName(t.den)}. You marked ${grpName([...d].sort())}.`);
        }
        if (calc && d.size && ![...n].every(k => d.has(k))) {
          const out = [...n].filter(k => !d.has(k));
          parts.push(`${no('Top outside bottom.')} ${out.map(cellName).join('; ')} ${out.length === 1 ? 'is' : 'are'} on top but not in your sample space. A student cannot count if they could not be picked.`);
        }
        if (!okNum) {
          const miss = t.num.filter(k => !n.has(k)), extra = [...n].filter(k => !t.num.includes(k));
          const line = [];
          if (extra.length) line.push(`These do not fit "${t.name}": ${extra.map(cellSay).join('; ')}.`);
          if (miss.length) line.push(`You left out: ${miss.map(cellSay).join('; ')}.`);
          if (t.id === 'or' && miss.includes(0)) line.push(`"Or" includes students who are in both. The overlap belongs in the union.`);
          if (t.id === 'notA' && n.has(0) && n.has(1)) line.push(`That is the A row, which is A itself. The complement is everything outside A.`);
          parts.push(`${no('The top is not right.')} ` + line.join(' '));
        }
        if (t.id === 'or' && st.via.has('rowA') && st.via.has('colB')) parts.push(`${kk('Totals warning')} You tapped the A row and the B column. Adding their totals gives ${sumK(ds, [0, 1])} + ${sumK(ds, [0, 2])} = ${sumK(ds, [0, 1]) + sumK(ds, [0, 2])}, but the cells you marked hold ${sumK(ds, [...n])}. The ${ds.cells[0]} students in both are in the row and in the column, so adding the totals counts them twice.`);
        if (okNum && okDen) {
          st.res[resKey(t.id)] = { n: sumK(ds, t.num), d: sumK(ds, t.den) };
          parts.push(winText(t));
        }
        st.msg = parts.join('<br>');
      };
      const verdict = ans => {
        const ds = D(), pa = resVal('A'), pab = resVal('AgB');
        if (pa === null || pab === null) { st.msg = `${no('Not yet.')} First find P(A) and P(A given B) with the table. Then compare them.`; return; }
        const nA = sumK(ds, [0, 1]), nB = sumK(ds, [0, 2]), tot = N(), exp = nA * nB / tot, gap = Math.abs(pab - pa), pnb = resVal('AgnB');
        const indep = gap <= .05 && (pnb === null || Math.abs(pnb - pa) <= .05);
        const nums = `P(A) = ${v2(pa)} and P(A given B) = ${v2(pab)}${pnb !== null ? ' and P(A given not B) = ' + v2(pnb) : ''}.`;
        const expect = `If A and B were exactly independent, you would expect ${nA}/${tot} of the ${nB} B students to be in A: ${+exp.toFixed(1)}. The table has ${ds.cells[0]}.`;
        let m;
        if (indep) m = (ans ? ok('Right.') : no('Look again.')) + ` ${nums} They differ by only ${v2(gap)}. ${expect} Counts from real students never match exactly, so a gap this small is ordinary wobble. Knowing B does not change the chance of A. They are independent, as far as this survey can show.`;
        else m = (ans ? no('Look again.') : ok('Right.')) + ` ${nums} Knowing B moves the chance of A by ${v2(gap)}. ${expect} That is a big difference for ${tot} students. Knowing B changes the chance of A, so the events are <b>not</b> independent. They are associated. That does not mean one causes the other.`;
        st.msg = m;
      };

      /* ---------- readout ---------- */
      let ro;
      const upd = () => {
        const out = [], ds = D();
        if (st.mode === 'build') {
          out.push(`${kk('Sorted')} ${st.bi} of ${PEOPLE.length} students`);
          out.push(`${kk('In the cells')} ${st.placed.join(', ')} (in the order: sport and 10th, sport and 9th, no sport and 10th, no sport and 9th)`);
          if (st.bi >= PEOPLE.length) out.push(`${kk('Selected box')} ${({ r0: 'row ' + BUILD.rows[0], r1: 'row ' + BUILD.rows[1], c0: 'column ' + BUILD.cols[0], c1: 'column ' + BUILD.cols[1], g: 'grand total' })[st.selT]}`);
        } else {
          const t = curTask(), n = sumK(ds, [...st.num]);
          out.push(`${kk('Event')} ${t.name}: ${evSentence(t.id)}`);
          if (st.mode === 'events') {
            out.push(`${kk('Marked')} ${n} of ${N()} students`);
            if (st.num.size) out.push(`${kk('Chance if one student is picked')} ${fline(n, N())}`);
          } else {
            const d = sumK(ds, [...st.den]);
            out.push(`${kk('Top')} ${st.num.size ? n + ' students' : 'tap cells'}`);
            out.push(`${kk('Bottom')} ${st.den.size ? d + ' students' : 'tap cells'}`);
            if (st.num.size && st.den.size) out.push(`${kk('Fraction')} ${fline(n, d)}`);
          }
        }
        if (st.msg) out.push(st.msg);
        ro.innerHTML = out.join('<br>');
      };
      const draw = () => { P.draw(); upd(); };

      /* ---------- controls ---------- */
      const probe = C.readout(), host = probe.parentElement; probe.remove();
      const mk = fn => { const before = host.children.length; fn(); return [...host.children].slice(before); };
      let modeBtns, dsSel, taskSel, markBtns, slider, verdictBtns, actBtns;
      mk(() => { C.title('Activity'); modeBtns = C.buttons(MODES.map(m => ({ label: MODE_LABEL[m], onClick: () => setMode(m) }))); });
      const gDs = mk(() => { C.title('Survey'); dsSel = C.select({ label: 'Which survey', value: '0', options: DS.map((d, i) => ({ value: String(i), label: d.name })), onChange: v => { st.ds = +v; resetMarks(); sync(); } }); });
      const gTask = mk(() => { C.title('Question'); taskSel = C.select({ label: 'Choose the event', value: '0', options: [{ value: '0', label: '-' }], onChange: v => { st.task = +v; resetMarks(); sync(); } }); });
      const gMark = mk(() => { C.title('What you are marking'); markBtns = C.buttons([{ label: 'Top of fraction', onClick: () => { st.mark = 'num'; sync(); } }, { label: 'Bottom of fraction', onClick: () => { st.mark = 'den'; sync(); } }]); });
      const gTot = mk(() => { C.title('Total for the selected box'); slider = C.slider({ label: 'Number of students', min: 0, max: 20, step: 1, value: 0, format: v => String(v), onInput: v => { if (st.bi < PEOPLE.length) { st.msg = 'Sort all 20 students first.'; draw(); return; } if (st.okT[st.selT]) return; st.tot[st.selT] = v; st.okT[st.selT] = undefined; st.msg = ''; draw(); } }); });
      const gVer = mk(() => { C.title('Your verdict'); verdictBtns = C.buttons([{ label: 'Independent', onClick: () => { verdict(true); draw(); } }, { label: 'Not independent', onClick: () => { verdict(false); draw(); } }]); });
      mk(() => { C.title('Check'); actBtns = C.buttons([
        { label: 'Check', primary: true, onClick: () => { st.mode === 'build' ? checkTotals() : check(); draw(); } },
        { label: 'Start over', onClick: () => { if (st.mode === 'build') resetBuild(); else resetMarks(); sync(); } }]); });
      C.hint('Tap the picture to do the work. The lesson explains every answer.');
      ro = C.readout();

      const resetMarks = () => { st.num = new Set(); st.den = new Set(); st.mark = 'num'; st.via = new Set(); st.msg = ''; };
      const resetBuild = () => { st.bi = 0; st.placed = [0, 0, 0, 0]; st.tot = { r0: null, r1: null, c0: null, c1: null, g: null }; st.okT = {}; st.selT = 'r0'; st.buildDone = false; st.msg = ''; slider.set(0); };
      const setMode = m => { st.mode = m; st.task = 0; resetMarks(); sync(); };
      const show = (g, on) => g.forEach(e => { e.style.display = on ? '' : 'none'; });
      const sync = () => {
        const m = st.mode, calc = m !== 'build';
        modeBtns.forEach((b, i) => { const on = MODES[i] === m; b.className = on ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', on); });
        show(gDs, calc); show(gTask, calc); show(gMark, m === 'prob' || m === 'indep'); show(gTot, m === 'build'); show(gVer, m === 'indep');
        dsSel.value = String(st.ds);
        if (calc) {
          taskSel.innerHTML = ''; tasks().forEach((t, i) => { const op = h('option', { value: String(i) }, t.name); if (i === st.task) op.selected = true; taskSel.append(op); });
        }
        markBtns.forEach((b, i) => { const on = (i === 0) === (st.mark === 'num'); b.className = on ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', on); });
        actBtns[0].textContent = m === 'build' ? 'Check totals' : m === 'events' ? 'Check my event' : 'Check my fraction';
        actBtns[1].textContent = m === 'build' ? 'Start over' : 'Clear marks';
        draw();
      };

      /* ---------- taps ---------- */
      const cv = P.canvas;
      const at = e => { const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; for (let n = hits.length - 1; n >= 0; n--) { const q = hits[n]; if (x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h) return [q, x, y]; } return null; };
      cv.addEventListener('pointerdown', e => { const a = at(e); if (!a) return; e.preventDefault(); a[0].fn(a[1], a[2]); draw(); });
      cv.addEventListener('pointermove', e => { cv.style.cursor = at(e) ? 'pointer' : 'default'; });

      sync();

      /* ---------- guided steps ---------- */
      const apply = (patch, immediate) => {
        const { mode, ds, task } = patch;
        if (mode !== undefined) st.mode = mode;
        if (ds !== undefined) st.ds = ds;
        st.task = task !== undefined ? task : 0;
        resetMarks();
        if (st.mode === 'build') resetBuild();
        st.res = {};
        sync();
      };
      return { destroy: () => P.destroy(), apply };
    }
  });
}
