/* =====================================================================
   UNDERGRAD — Limits and epsilon-delta
   ===================================================================== */
{
  const sig = (v, n = 2) => +v.toPrecision(n);
  const N = (v, n = 4) => {
    if (v === Infinity) return '∞'; if (v === -Infinity) return '−∞'; if (!isFinite(v)) return 'undefined';
    return String(+v.toPrecision(n)).replace('-', '−');
  };
  const niceStep = v => { const e = Math.pow(10, Math.floor(Math.log10(v))), f = v / e; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * e; };
  const decs = step => clamp(-Math.floor(Math.log10(step) + 1e-9), 0, 6);
  const tick = (v, d) => (v < -1e-12 ? '−' : '') + Math.abs(v).toFixed(d);
  const good = t => `<b style="color:var(--green)">${t}</b>`, bad = t => `<b style="color:var(--red)">${t}</b>`;
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const CAP = 6, MIN_DELTA = .001;

  /* view = [xmin, xmax, ymin, ymax]; piv = zoom centre; zp = how much the x-axis zooms compared with the y-axis;
     pts = ends of the curve at x = a; fa / alt = value of f at a (default / changed); lim = what f heads for from each side */
  const FN = {
    sq:   { name: 'f(x) = x²', f: x => x * x, a: 2, L0: 4, dL: .05, view: [0, 4, -1, 9], piv: 4, zp: 1, pts: [[2, 4]], fa: 4, alt: 1,
            lim: { left: 4, right: 4 }, targets: [1, .5, .1, .01], slope: 4 },
    lin:  { name: 'f(x) = 3x − 1', f: x => 3 * x - 1, a: 2, L0: 5, dL: .05, view: [0, 4, -1, 11], piv: 5, zp: 1, pts: [[2, 5]], fa: 5, alt: 0,
            lim: { left: 5, right: 5 }, targets: [1, .5, .1, .01], slope: 3 },
    sinc: { name: 'f(x) = sin(x) / x', f: x => Math.sin(x) / x, a: 0, L0: 1, dL: .01, view: [-6, 6, -.5, 1.8], piv: 1, zp: .5, pts: [[0, 1]], fa: null, alt: 1.6,
            lim: { left: 1, right: 1 }, targets: [1, .5, .1, .01], slope: 0 },
    jump: { name: 'f(x) = x for x < 1, x + 2 for x ≥ 1', f: x => (x < 1 ? x : x + 2), a: 1, L0: 2, dL: .05, view: [-1, 3, -1, 5], piv: 2, zp: 1, pts: [[1, 1], [1, 3]], fa: 3, alt: 0,
            lim: { left: 1, right: 3 }, targets: [1.5, 1, .5, .1] },
    osc:  { name: 'f(x) = sin(1/x)', f: x => Math.sin(1 / x), a: 0, L0: 0, dL: .02, view: [-1.2, 1.2, -1.6, 1.6], piv: 0, zp: 1, pts: [], fa: null, alt: 1,
            lim: { left: null, right: null }, kind: 'osc', targets: [.5, .2, .1, .01] },
    asym: { name: 'f(x) = 1/x²', f: x => 1 / (x * x), a: 0, L0: 3, dL: .1, view: [-2, 2, -1, 9], piv: 3, zp: 1, pts: [], fa: null, alt: 0,
            lim: { left: null, right: null }, kind: 'asym', zmax: 1, targets: [2, 1, .5, .1] }
  };
  const FN_OPTS = [['sq', 'x² near 2'], ['lin', '3x − 1 near 2'], ['sinc', 'sin(x)/x near 0'], ['jump', 'A jump at 1'], ['osc', 'sin(1/x) near 0'], ['asym', '1/x² near 0']];

  register({
    id: 'limits-and-epsilon-delta', level: 'ugrad',
    title: 'Limits and epsilon-delta',
    blurb: 'Play the epsilon-delta game on a graph and see exactly when a limit exists and when it does not.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 3;
      p.grid(1, { axes: false });
      const f = x => .75 * x + .12 * x * x * x, pts = [], inn = [];
      for (let x = -3.6; x <= 3.6; x += .1) pts.push([x, f(x)]);
      for (let x = -.9; x <= .9; x += .05) inn.push([x, f(x)]);
      p.path([[-4, -.8], [4, -.8], [4, .8], [-4, .8]], { fill: alpha(pal.violet, .16), close: true });
      p.path([[-.9, -4], [.9, -4], [.9, 4], [-.9, 4]], { fill: alpha(pal.green, .16), close: true });
      p.path([[-4, .8], [4, .8]], { stroke: pal.violet, width: 1.5, dash: [5, 5] });
      p.path([[-4, -.8], [4, -.8]], { stroke: pal.violet, width: 1.5, dash: [5, 5] });
      p.path([[-.9, -4], [-.9, 4]], { stroke: pal.green, width: 1.5, dash: [5, 5] });
      p.path([[.9, -4], [.9, 4]], { stroke: pal.green, width: 1.5, dash: [5, 5] });
      p.path(pts, { stroke: alpha(pal.blue, .5), width: 2.5 });
      p.path(inn, { stroke: pal.blue, width: 4 });
      p.dot(0, 0, 6, pal.yellow, pal.stage, 2);
    },
    hook: String.raw`A function can be undefined at a point and still "head toward" a number. What does that mean, exactly enough to prove, and how can it fail (a jump, a wild swing)?`,
    steps: [
      { title: 'Getting close',
        text: String.raw`<p>The limit \(\lim_{x\to a} f(x) = L\) says: as \(x\) gets close to \(a\), \(f(x)\) gets close to \(L\). Here \(f(x)=x^2\) and \(a=2\).</p><p>Drag the point, or press <b>Step closer</b>. Read the table: from both sides the values of \(f(x)\) head for \(4\). At \(x=2.001\) we get \(4.004\), and at \(x=1.999\) we get \(3.996\).</p>`,
        set: { fn: 'sq', mode: 'approach', side: 'both', alt: false, xo: .1, z: 1, n: 0 } },
      { title: 'The point itself does not matter',
        text: String.raw`<p>Now \(f(x)=\sin(x)/x\) and \(a=0\). At \(x=0\) the formula gives \(0/0\), so \(f(0)\) is undefined. The graph has an open circle at \((0,1)\).</p><p>The table still heads for \(1\) from both sides. Tick <b>Change the value of f at a</b> to put a dot at \((0,1.6)\). The table does not change, because a limit only looks at \(x\) near \(a\), never at \(a\).</p>`,
        set: { fn: 'sinc', mode: 'approach', side: 'both', alt: false, xo: .5, z: 1, n: 0 } },
      { title: 'The epsilon-delta game',
        text: String.raw`<p>Back to \(x^2\) near \(2\). Someone picks a tolerance \(\varepsilon\): the violet band says \(f(x)\) must stay within \(\varepsilon\) of \(L=4\). You answer with a \(\delta\): the green band of \(x\) values near \(a\).</p><p>With \(\varepsilon=0.1\) and \(\delta=0.1\) you lose: the red parts of the curve escape the violet band, first at \(x=2.025\) on the right and \(x=1.975\) on the left. Drag a green edge until the curve fits. Then try <b>Mode: Challenge</b>.</p>`,
        set: { fn: 'sq', mode: 'game', side: 'both', alt: false, eps: .1, del: .1, n: 0 } },
      { title: 'When no delta works',
        text: String.raw`<p>This function jumps at \(x=1\): it heads for \(1\) from the left and \(3\) from the right. We test \(L=2\) with \(\varepsilon=0.5\). No \(\delta\) can work, because points just left and just right of \(a\) are far from \(2\).</p><p>Set <b>Side</b> to <em>Left only</em> and drag \(L\) to \(1\). Now a \(\delta\) works: the one-sided limit exists. Try \(\sin(1/x)\) and \(1/x^2\) in <b>Function</b> too.</p>`,
        set: { fn: 'jump', mode: 'game', side: 'both', alt: false, eps: .5, del: .2, n: 0 } }
    ],
    formal: String.raw`
      <h3>The definition</h3>
      <p>Let \(f\) be defined on both sides of \(a\), though not necessarily at \(a\). We write \(\lim_{x\to a} f(x) = L\) when
      \[ \text{for every } \varepsilon>0 \text{ there is a } \delta>0 \text{ such that } 0 &lt; |x-a| &lt; \delta \implies |f(x)-L| &lt; \varepsilon. \]
      Here \(|x-a|&lt;\delta\) means \(x\) lies in the green band, and \(|f(x)-L|&lt;\varepsilon\) means \(f(x)\) lies in the violet band. The statement is a game: an opponent picks any \(\varepsilon\), however small, and you must reply with a \(\delta\) that works. The \(\delta\) may depend on \(\varepsilon\) (and on \(a\)), but not on \(x\).</p>
      <h3>A worked proof: a linear function</h3>
      <p><b>Claim.</b> \(\lim_{x\to 2}(3x-1) = 5\).</p>
      <p><em>Scratch work.</em> We want \(|(3x-1)-5| &lt; \varepsilon\). Now \(|(3x-1)-5| = |3x-6| = 3|x-2|\), and \(3|x-2| &lt; \varepsilon\) exactly when \(|x-2| &lt; \varepsilon/3\). So try \(\delta=\varepsilon/3\).</p>
      <p><em>Proof.</em> Let \(\varepsilon>0\) and put \(\delta=\varepsilon/3\). If \(0&lt;|x-2|&lt;\delta\), then
      \[ |(3x-1)-5| = 3|x-2| &lt; 3\delta = \varepsilon. \qquad \blacksquare \]
      The same argument shows that for \(f(x)=mx+b\) with \(m\neq 0\), the choice \(\delta=\varepsilon/|m|\) works, and it is the largest possible. This is why a smaller \(\varepsilon\) forces a smaller \(\delta\), in proportion: a steeper line turns a small change in \(x\) into a bigger change in \(f(x)\).</p>
      <h3>Curves: the same game, no formula for delta</h3>
      <p>For \(f(x)=x^2\) near \(2\), \(|x^2-4| = |x-2|\,|x+2|\). If \(|x-2|&lt;1\) then \(|x+2|&lt;5\), so \(\delta=\min(1,\varepsilon/5)\) works. The challenge shows the best \(\delta\) is a little larger than that and tends to \(\varepsilon/4\) from below as \(\varepsilon\to0\), where \(4=f'(2)\) is the slope of the tangent line. Near a point, a smooth curve behaves like its tangent line.</p>
      <h3>One-sided limits</h3>
      <p>The <em>left limit</em> \(\lim_{x\to a^-}f(x)=L\) uses only \(a-\delta &lt; x &lt; a\). The <em>right limit</em> \(\lim_{x\to a^+}f(x)=L\) uses only \(a &lt; x &lt; a+\delta\). The two-sided limit exists exactly when both one-sided limits exist and are equal.</p>
      <p>For the jump \(f(x)=x\) (\(x&lt;1\)), \(f(x)=x+2\) (\(x\ge1\)), the left limit is \(1\) and the right limit is \(3\). Suppose some \(L\) worked for \(\varepsilon=1\). Points just left and just right of \(1\) have values about \(2\) apart, yet each would be within \(1\) of \(L\). The values differ by \(2+2r\) at distance \(r\) from \(1\), and two numbers within \(1\) of \(L\) differ by less than \(2\). Contradiction, so no limit exists.</p>
      <h3>Why the value at a does not matter</h3>
      <p>The definition says \(0&lt;|x-a|\), which excludes \(x=a\). So \(f(a)\) can be undefined, as for \(\sin(x)/x\) at \(0\), or different from \(L\). Changing \(f(a)\) never changes a limit. When \(\lim_{x\to a}f(x)=f(a)\) we call \(f\) <em>continuous</em> at \(a\); this is a separate fact that must be checked.</p>
      <h3>When the limit does not exist</h3>
      <p>For \(\sin(1/x)\), the points \(x_n=1/(\pi/2+2\pi n)\) have \(f=1\) and the points \(y_n=1/(-\pi/2+2\pi n)\) have \(f=-1\), and both sequences tend to \(0\). Any \(L\) is at least \(1\) away from \(1\) or from \(-1\), so \(\varepsilon=1\) defeats every \(\delta\). For \(1/x^2\), values grow without bound, so they leave every band. Writing \(\lim_{x\to0}1/x^2=\infty\) describes this behavior; it does not say a real number \(L\) exists.</p>
      <p><b>Caution.</b> Trying a few small \(\delta\) values and seeing them work is not a proof. A proof gives a \(\delta\) that works for every \(x\) in the band, as the algebra above does. The pictures here only test finitely many points.</p>`,
    check: [
      { q: String.raw`Let \(f(x)=4x+1\), \(a=3\) and \(L=13\). An opponent picks \(\varepsilon=0.2\). We need \(|f(x)-13|&lt;0.2\) whenever \(0&lt;|x-3|&lt;\delta\). Which is the largest \(\delta\) from this list that is guaranteed to work?`,
        choices: ['δ = 0.8', 'δ = 0.2', 'δ = 0.05', 'δ = 0.01'], answer: 2,
        why: String.raw`Here \(|f(x)-13| = |4x-12| = 4|x-3|\). This is below \(0.2\) exactly when \(|x-3|&lt;0.05\). So \(\delta=0.05\) works, \(\delta=0.01\) also works but is smaller, and \(0.2\) and \(0.8\) are too wide: for example \(x=3.1\) gives \(f=13.4\), which is \(0.4\) from \(13\).`,
        hint: String.raw`Write \(|f(x)-13|\) as a multiple of \(|x-3|\), then ask when that multiple is less than \(0.2\).` },
      { q: String.raw`Let \(f(x)=x\) for \(x&lt;1\) and \(f(x)=x+2\) for \(x\ge 1\). The graph jumps at \(x=1\): \(f(1)=3\), \(f(x)\) is close to \(1\) just left of \(1\), and close to \(3\) just right of \(1\). Which statement is true?`,
        choices: [String.raw`\(\lim_{x\to1}f(x)=3\), because \(f(1)=3\).`,
                  String.raw`\(\lim_{x\to1}f(x)\) does not exist, because the left limit \(1\) and the right limit \(3\) differ.`,
                  String.raw`\(\lim_{x\to1}f(x)=2\), halfway between the two sides.`,
                  String.raw`\(\lim_{x\to1}f(x)=1\), because the left side is reached first.`], answer: 1,
        why: String.raw`A two-sided limit needs both one-sided limits to exist and agree. Here they are \(1\) and \(3\). The value \(f(1)=3\) does not decide a limit, and no single number is within a small \(\varepsilon\) of values near both \(1\) and \(3\).`,
        hint: String.raw`Compare what \(f(x)\) approaches from the left with what it approaches from the right.` }
    ],
    links: { next: ['derivatives-as-tangent-slopes', 'riemann-sums-and-the-integral'], related: ['slope-and-linear-functions', 'functions-as-transformations'] },

    mount({ stage, controls: C }) {
      const st = { fn: 'sq', mode: 'approach', side: 'both', alt: false, auto: true, eps: .1, del: .1, xo: .1, z: 1, n: 0 };
      let cancel = () => {};
      const P = new Plane(stage, { span: 5 });
      const F = () => FN[st.fn];
      const Lv = () => +(F().L0 + st.n * F().dL).toFixed(4);
      const faV = () => (st.alt ? F().alt : F().fa);
      const sides = () => (st.side === 'both' ? [-1, 1] : [st.side === 'left' ? -1 : 1]);
      const sname = s => (s < 0 ? 'left' : 'right');
      const autoZ = eps => { const [, , y0, y1] = F().view; return clamp((y1 - y0) / 6 / eps, 1, F().zmax || 1000); };
      const pix = p => { p.cx = p.w / 2; p.cy = p.h / 2; p.span = Math.min(p.w, p.h) / 2; };
      const esc = (v, L, eps) => !isFinite(v) || Math.abs(v - L) >= eps;

      /* ---------- the math: does a delta work? ---------- */
      const rsFor = d => { const out = [], M = 1200; for (let i = 1; i < M; i++) out.push(d * i / M, d * Math.pow(i / M, 3)); out.push(d * (1 - 1e-9)); return out; };
      function scanSide(s, d, L, eps) {
        const f = F().f, a = F().a, rs = rsFor(d);
        let first = Infinity, worst = -1, wr = 0, wv = 0;
        for (const r of rs) {
          const v = f(a + s * r);
          if (esc(v, L, eps) && r < first) first = r;
          const dev = isFinite(v) ? Math.abs(v - L) : Infinity;
          if (dev > worst) { worst = dev; wr = r; wv = v; }
        }
        if (first === Infinity) return { s, ok: true, worst, wr, wv };
        let lo = 0, hi = first, ex = null;
        for (const r of rs) { if (r < first && r > lo) lo = r; if (r >= d * 1e-3 && (ex === null || r < ex) && esc(f(a + s * r), L, eps)) ex = r; }
        for (let k = 0; k < 50; k++) { const m = (lo + hi) / 2; if (esc(f(a + s * m), L, eps)) hi = m; else lo = m; }
        return { s, ok: false, first: hi, ex, worst, wr, wv };
      }
      const bestCache = {};
      function bestDelta() {
        const L = Lv(), key = [st.fn, L, st.eps, st.side].join('|');
        if (bestCache[key] === undefined) {
          const b = Math.min(...sides().map(s => scanSide(s, CAP, L, st.eps).first ?? Infinity));
          bestCache[key] = b < MIN_DELTA ? null : b;
        }
        return bestCache[key];
      }
      const sideNote = (s, L, eps) => {
        const f = F(), v = f.lim[sname(s)];
        if (v !== null && v !== undefined) return `Near a on the ${sname(s)} side, f(x) heads for ${N(v)}, which is ${N(Math.abs(v - L), 3)} from L = ${N(L)}. That is not less than ε = ${N(eps)}.`;
        if (f.kind === 'osc') return `Near a, f(x) keeps swinging between −1 and 1, so it never settles within ε of one number.`;
        return `Near a, f(x) grows without bound, so it leaves every band.`;
      };
      function verdict() {
        const L = Lv(), eps = st.eps, a = F().a, res = sides().map(s => scanSide(s, st.del, L, eps));
        const ok = res.every(r => r.ok), lines = [];
        for (const r of res) if (!r.ok) {
          const nm = cap(sname(r.s));
          if (r.first <= .002 * st.del) {
            lines.push(`${nm} side: f(x) leaves the band even extremely close to a, for example at x = ${N(a + r.s * (r.ex ?? r.wr), 5)}.`);
          } else {
            lines.push(`${nm} side: f(x) first leaves the band at x = ${N(a + r.s * r.first)}. At x = ${N(a + r.s * r.wr)} it is ${isFinite(r.wv) ? N(r.wv, 3) : 'not finite'}${isFinite(r.wv) ? `, which is ${N(Math.abs(r.wv - L), 3)} from L (not less than ε = ${N(eps)})` : ''}.`);
          }
        }
        return { ok, res, lines, L, eps };
      }
      const bestLine = () => {
        const b = bestDelta();
        if (b === null) return `No δ works: even δ = ${MIN_DELTA} fails.`;
        if (!isFinite(b)) return 'Every δ works: f(x) never gets that far from L.';
        return `The best δ is about ${N(b)}. Any smaller δ works too; any larger one fails.`;
      };

      /* ---------- challenge ---------- */
      const ch = { i: 0, rec: [], msg: '' };
      const tgt = () => F().targets;
      function chStart(i) {
        ch.i = i; st.eps = tgt()[i]; st.del = .5; if (st.auto) st.z = autoZ(st.eps);
        ch.msg = `Challenge ${i + 1} of ${tgt().length}: ε = ${N(st.eps)}. Set δ so that the curve stays inside the violet band for every x in the green band, then press Check.`;
      }
      function chReset() { ch.rec = []; chStart(0); }
      function chSummary() {
        const rows = ch.rec.map((r, i) => r.status === 'ok'
          ? `ε = ${N(tgt()[i])}: best δ ≈ ${N(r.best, 3)} (δ/ε ≈ ${N(r.best / tgt()[i], 3)})` : `ε = ${N(tgt()[i])}: no δ works`).join('<br>');
        const f = F(), anyNone = ch.rec.some(r => r.status === 'none');
        let why;
        if (anyNone) why = 'When no δ works for some ε, the limit is not L, or there is no limit there at all.';
        else if (f.slope) why = `As ε shrinks, the best δ shrinks with it. The ratio δ/ε settles near ${N(1 / f.slope, 3)}, which is 1 divided by the slope ${f.slope}. A steeper graph needs a narrower δ, and for a straight line δ = ε/|slope| is exact.`;
        else why = 'As ε shrinks, the best δ shrinks too. How fast depends on how steeply the graph rises or falls near a: the ratio δ/ε is large where the graph is nearly flat and small where it is steep.';
        return `<b>All done.</b><br>${rows}<br>${why}`;
      }
      function chCheck() {
        if (st.mode !== 'challenge') { ch.msg = 'Choose Mode: Challenge first.'; return; }
        const v = verdict(), eps = st.eps, i = ch.i;
        if (v.ok) {
          const b = bestDelta();
          ch.rec[i] = { status: 'ok', delta: st.del, best: b };
          const prev = ch.rec[i - 1] && ch.rec[i - 1].status === 'ok' ? ch.rec[i - 1].best : null;
          ch.msg = `${good('Works.')} For every x with 0 &lt; |x − a| &lt; ${N(st.del)}, f(x) stays within ${N(eps)} of ${N(v.L)}. ${bestLine()}` +
            (prev !== null && isFinite(b) ? ` Last time the best δ was ${N(prev, 3)}. A smaller ε means a smaller best δ.` : '');
        } else {
          ch.msg = `${bad('Fails.')} ${v.lines.join(' ')} ` + (bestDelta() === null ? `It looks like no δ can work for this ε. If you agree, press “No δ works”.` : `The green band has to stop before the x values that escape, so δ must be less than the distance from a to the nearest one.`);
        }
      }
      function chNone() {
        if (st.mode !== 'challenge') { ch.msg = 'Choose Mode: Challenge first.'; return; }
        const b = bestDelta(), L = Lv();
        if (b === null) {
          ch.rec[ch.i] = { status: 'none' };
          ch.msg = `${good('Correct.')} ${[...new Set(sides().map(s => sideNote(s, L, st.eps)))].join(' ')} No matter how small δ is, some x in the green band escapes.`;
        } else ch.msg = `${bad('Not so.')} A δ does work here: for example δ = ${N(sig(b * .9, 2))}. Set δ to that or smaller and press Check.`;
      }
      function chNext() {
        if (st.mode !== 'challenge') { ch.msg = 'Choose Mode: Challenge first.'; return; }
        if (!ch.rec[ch.i]) { ch.msg = 'Finish this ε first: find a δ that works and press Check, or press “No δ works” if you think none can.'; return; }
        if (ch.i < tgt().length - 1) chStart(ch.i + 1); else ch.msg = chSummary();
      }

      /* ---------- geometry and drawing ---------- */
      const geo = () => {
        const f = F(), [x0, x1, y0, y1] = f.view, zx = Math.pow(st.z, f.zp), zy = st.z;
        const xlo = f.a + (x0 - f.a) / zx, xhi = f.a + (x1 - f.a) / zx, ylo = f.piv + (y0 - f.piv) / zy, yhi = f.piv + (y1 - f.piv) / zy;
        const bx = 56, by = 14, bw = Math.max(60, P.w - bx - 12), bh = Math.max(60, P.h - by - 32);
        return { xlo, xhi, ylo, yhi, bx, by, bw, bh,
          X: x => bx + (x - xlo) / (xhi - xlo) * bw, Y: y => by + bh - (y - ylo) / (yhi - ylo) * bh,
          ix: px => xlo + (px - bx) / bw * (xhi - xlo), iy: py => ylo + (by + bh - py) / bh * (yhi - ylo) };
      };
      const handles = g => {
        const f = F(), L = Lv(), a = f.a, hs = [];
        if (st.mode === 'approach') {
          const y = f.f(a + st.xo);
          hs.push({ id: 'x', x: g.X(a + st.xo), y: isFinite(y) ? clamp(g.Y(y), g.by + 4, g.by + g.bh - 4) : g.by + 4 });
        } else {
          if (st.mode === 'game') {
            hs.push({ id: 'eps', x: g.bx + 16, y: clamp(g.Y(L + st.eps), g.by + 8, g.by + g.bh - 8) });
            hs.push({ id: 'eps', x: g.bx + 16, y: clamp(g.Y(L - st.eps), g.by + 8, g.by + g.bh - 8) });
          }
          if (st.side !== 'right') hs.push({ id: 'del', x: clamp(g.X(a - st.del), g.bx + 8, g.bx + g.bw - 8), y: g.by + 14 });
          if (st.side !== 'left') hs.push({ id: 'del', x: clamp(g.X(a + st.del), g.bx + 8, g.bx + g.bw - 8), y: g.by + 14 });
          hs.push({ id: 'L', x: g.X(a), y: clamp(g.Y(L), g.by + 8, g.by + g.bh - 8) });
        }
        return hs;
      };

      P.onDraw = (c, p) => {
        pix(p);
        const pal = p.pal, g = geo(), f = F(), a = f.a, L = Lv(), game = st.mode !== 'approach';
        const fs = clamp(p.w / 26, 15, 19), lw = clamp(p.w / 190, 2.8, 3.6);
        const T = (s, x, y, o) => p.label(s, x, p.h - y, Object.assign({ italic: false, size: fs }, o));
        const seg = (pts, o) => p.path(pts.map(([x, y]) => [x, p.h - y]), o);
        const right = g.bx + g.bw, bot = g.by + g.bh;
        const xt = niceStep((g.xhi - g.xlo) / clamp(g.bw / 80, 3, 6)), yt = niceStep((g.yhi - g.ylo) / clamp(g.bh / 55, 3, 6));
        const xd = decs(xt), yd = decs(yt), xa = g.X(a), yL = g.Y(L);

        c.save(); c.beginPath(); c.rect(g.bx, g.by, g.bw, g.bh); c.clip();
        for (let k = Math.ceil(g.xlo / xt); k * xt <= g.xhi; k++) seg([[g.X(k * xt), g.by], [g.X(k * xt), bot]], { stroke: Math.abs(k) < 1e-9 ? pal['grid-strong'] : pal.grid, width: 1.5 });
        for (let k = Math.ceil(g.ylo / yt); k * yt <= g.yhi; k++) seg([[g.bx, g.Y(k * yt)], [right, g.Y(k * yt)]], { stroke: Math.abs(k) < 1e-9 ? pal['grid-strong'] : pal.grid, width: 1.5 });

        const lo = g.X(a - (st.side === 'right' ? 0 : st.del)), hi = g.X(a + (st.side === 'left' ? 0 : st.del));
        if (game) {
          const yt1 = g.Y(L + st.eps), yb1 = g.Y(L - st.eps);
          seg([[g.bx, yt1], [right, yt1], [right, yb1], [g.bx, yb1]], { fill: alpha(pal.violet, .15), close: true });
          seg([[lo, g.by], [hi, g.by], [hi, bot], [lo, bot]], { fill: alpha(pal.green, .15), close: true });
          for (const y of [yt1, yb1]) seg([[g.bx, y], [right, y]], { stroke: pal.violet, width: 1.8, dash: [7, 5] });
          for (const x of [lo, hi]) seg([[x, g.by], [x, bot]], { stroke: pal.green, width: 1.8, dash: [7, 5] });
        }
        seg([[xa, g.by], [xa, bot]], { stroke: alpha(pal.text, .35), width: 1.2, dash: [3, 5] });

        /* the curve, one piece per colour */
        const paths = { out: new Path2D(), ok: new Path2D(), bad: new Path2D(), axis: new Path2D() };
        const inside = (s, r) => game && r < st.del && (st.side === 'both' || (st.side === 'left') === (s < 0));
        for (const s of [-1, 1]) {
          const R = s < 0 ? a - g.xlo : g.xhi - a, M = 1400; let prev = null;
          for (let i = 1; i <= M; i++) {
            const r = R * Math.pow(i / M, 3), x = a + s * r, y = f.f(x);
            if (!isFinite(y)) { prev = null; continue; }
            const X = g.X(x), Y = clamp(g.Y(y), -1e4, 1e4), cur = { X, Y, e: esc(y, L, st.eps) };
            if (prev) {
              const pth = !inside(s, r) ? paths.out : (cur.e || prev.e) ? paths.bad : paths.ok;
              pth.moveTo(prev.X, prev.Y); pth.lineTo(X, Y);
              if (pth === paths.bad) { paths.axis.moveTo(prev.X, bot - 3); paths.axis.lineTo(X, bot - 3); }
            }
            prev = cur;
          }
        }
        c.lineJoin = 'round'; c.lineCap = 'round';
        c.strokeStyle = alpha(pal.blue, game ? .5 : 1); c.lineWidth = lw; c.stroke(paths.out);
        c.strokeStyle = pal.blue; c.lineWidth = lw + 1.6; c.stroke(paths.ok);
        c.strokeStyle = pal.red; c.lineWidth = lw + 1.6; c.stroke(paths.bad);
        c.lineWidth = 5; c.stroke(paths.axis);
        c.restore();

        /* frame and tick labels */
        seg([[g.bx, g.by], [right, g.by], [right, bot], [g.bx, bot]], { stroke: pal['grid-strong'], width: 1.5, close: true });
        for (let k = Math.ceil(g.xlo / xt); k * xt <= g.xhi; k++) {
          const x = g.X(k * xt); if (Math.abs(x - xa) < 34 || x > right - 12) continue;
          T(tick(k * xt, xd), x, bot + 15, { color: pal.muted, size: fs - 1 });
        }
        for (let k = Math.ceil(g.ylo / yt); k * yt <= g.yhi; k++) {
          const y = g.Y(k * yt); if (game && Math.abs(y - yL) < 16) continue;
          T(tick(k * yt, yd), g.bx - 7, y, { color: pal.muted, size: fs - 1, align: 'right' });
        }
        T('a = ' + N(a), xa, bot + 15, { color: pal.text, size: fs });
        if (game) T('L = ' + N(L), g.bx - 7, clamp(yL, g.by + 8, bot - 8), { color: pal.text, size: fs, align: 'right' });

        /* band labels and handles */
        if (game) {
          const yu = g.Y(L + st.eps), yd = g.Y(L - st.eps), ex = right - 8;
          if (yd - yu > 40) {
            if (yu > g.by + 16) T('L+ε', ex, yu - 11, { color: pal.violet, align: 'right', size: fs });
            if (yd < bot - 16) T('L−ε', ex, yd + 11, { color: pal.violet, align: 'right', size: fs });
          } else if (yu > g.by + 16) T('L±ε', ex, yu - 11, { color: pal.violet, align: 'right', size: fs });
          const ty = g.by + 33;
          if (hi - lo > 84 && st.side === 'both') { T('a−δ', lo, ty, { color: pal.green, size: fs }); T('a+δ', hi, ty, { color: pal.green, size: fs }); }
          else T(st.side === 'both' ? 'a±δ' : st.side === 'left' ? 'a−δ' : 'a+δ', st.side === 'both' ? xa : st.side === 'left' ? lo : hi, ty, { color: pal.green, size: fs });
        }
        if (game) p.dot(xa, p.h - clamp(yL, g.by + 8, bot - 8), 8, pal.yellow, pal.brass, 3);

        /* point(s) of the graph at x = a */
        const fa = faV(); let hit = false;
        for (const [px, py] of f.pts) {
          const X = g.X(px), Y = g.Y(py);
          if (X < g.bx || X > right || Y < g.by || Y > bot) continue;
          if (fa !== null && Math.abs(fa - py) < 1e-9) { p.dot(X, p.h - Y, 5.5, pal.blue, pal.stage, 2); hit = true; }
          else p.dot(X, p.h - Y, 5.5, pal.stage, pal.blue, 2.5);
        }
        if (fa !== null && !hit) { const Y = g.Y(fa); if (Y >= g.by && Y <= bot) p.dot(xa, p.h - Y, 5.5, pal.blue, pal.stage, 2); }

        /* the point you move (approach mode) */
        if (!game) {
          const x = a + st.xo, y = f.f(x), X = g.X(x);
          if (isFinite(y)) {
            const Y = clamp(g.Y(y), g.by + 4, bot - 4);
            seg([[X, bot], [X, Y]], { stroke: pal.green, width: 2, dash: [5, 5] });
            seg([[g.bx, Y], [X, Y]], { stroke: pal.red, width: 2, dash: [5, 5] });
            p.dot(X, p.h - Y, 6, pal.yellow, pal.stage, 2);
            T('f(x) = ' + N(y, 4), X > g.bx + g.bw * .6 ? X - 12 : X + 12, Y < g.by + 26 ? Y + 18 : Y - 16, { color: pal.text, size: fs, align: X > g.bx + g.bw * .6 ? 'right' : 'left' });
          }
        }
        for (const hd of handles(g)) p.dot(hd.x, p.h - hd.y, 8, hd.id === 'L' ? null : pal.stage, pal.brass, 3);
        if (!game) { const hd = handles(g)[0]; p.dot(hd.x, p.h - hd.y, 5, pal.yellow, null); }
      };

      /* ---------- controls ---------- */
      const tableHTML = () => {
        const f = F(), a = f.a, fv = x => N(f.f(x), 5), rows = [1, .1, .01, .001].map(d =>
          `<tr><td>${N(a - d, 5)}</td><td>${fv(a - d)}</td><td>${N(a + d, 5)}</td><td>${fv(a + d)}</td></tr>`).join('');
        const l = f.f(a - .001), r = f.f(a + .001);
        const end = isFinite(l) && isFinite(r) && Math.abs(l - r) < .01 && Math.abs(l) < 1e3
          ? `Both columns head toward about ${N((l + r) / 2, 3)}.` : 'The two columns do not head toward one number.';
        return `<table style="width:100%;border-collapse:collapse;text-align:right"><tr><th colspan="2" style="text-align:center">from the left</th><th colspan="2" style="text-align:center">from the right</th></tr>` +
          `<tr><th>x</th><th>f(x)</th><th>x</th><th>f(x)</th></tr>${rows}</table>${end}`;
      };
      const upd = () => {
        const f = F(), a = f.a, L = Lv(), fa = faV(), faTxt = fa === null ? `f(${N(a)}) is undefined` : `f(${N(a)}) = ${N(fa)}${st.alt ? ' (changed)' : ''}`;
        let html = `<span class="k">Function</span> ${f.name}<br><span class="k">Point</span> a = ${N(a)}, ${faTxt}<br>`;
        if (st.mode === 'approach') {
          const x = a + st.xo;
          html += `<span class="k">Your x</span> ${N(x, 5)}, f(x) = ${N(f.f(x), 5)}<br>${tableHTML()}`;
        } else {
          const v = verdict(), xl = a - (st.side === 'right' ? 0 : st.del), xr = a + (st.side === 'left' ? 0 : st.del);
          if (st.mode === 'challenge') html += `<span class="k">Challenge</span> ${ch.i + 1} of ${tgt().length}, ε = ${N(st.eps)}<br>`;
          html += `<span class="k">Violet band</span> f(x) must stay between ${N(L - st.eps)} and ${N(L + st.eps)}<br>` +
            `<span class="k">Green band</span> x from ${N(xl)} to ${N(xr)}, skipping x = ${N(a)}<br>` +
            `<span class="k">Result</span> ${v.ok ? good('Every x in the green band stays inside.') : bad('Some x escape the violet band.')}<br>`;
          if (!v.ok && st.mode === 'game') html += v.lines.join('<br>') + '<br>';
          if (st.mode === 'game') {
            html += `<span class="k">Best δ</span> ${bestLine()}`;
            if (bestDelta() === null) html += '<br>' + [...new Set(sides().map(s => sideNote(s, L, st.eps)))].join('<br>');
          } else {
            const done = tgt().map((t, i) => ch.rec[i] ? `ε = ${N(t)}: ${ch.rec[i].status === 'ok' ? 'δ = ' + N(ch.rec[i].delta) : 'no δ works'}` : null).filter(Boolean);
            if (done.length) html += `<span class="k">Solved</span> ${done.join('; ')}<br>`;
            html += `<br>${ch.msg}`;
          }
        }
        ro.innerHTML = html;
      };
      const sync = () => {
        fnS.value = st.fn; modeS.value = st.mode; sideS.value = st.side; altT.checked = st.alt; autoT.checked = st.auto;
        const put = (sl, v) => { if (Math.abs(sl.get() - v) > .025) sl.set(v); };
        put(epsS, Math.log10(st.eps)); put(delS, Math.log10(st.del)); put(LS, st.n); put(zS, Math.log10(st.z));
        P.draw(); upd();
      };
      const epsOf = s => clamp(sig(Math.pow(10, s)), .005, 3), delOf = s => clamp(sig(Math.pow(10, s)), MIN_DELTA, 3);
      const stage1 = fn => (...a) => { cancel(); fn(...a); sync(); };
      const configChanged = () => { if (st.mode === 'challenge') chReset(); };

      const fnS = C.select({ label: 'Function', options: FN_OPTS.map(([value, label]) => ({ value, label })), value: st.fn, onChange: stage1(v => {
        st.fn = v; st.n = 0; st.z = st.mode === 'approach' ? 1 : (st.auto ? autoZ(st.eps) : 1); st.xo = clamp(st.xo, -.5, .5) || .1; configChanged(); }) });
      const modeS = C.select({ label: 'Mode', options: [{ value: 'approach', label: 'Approach: table of values' }, { value: 'game', label: 'Play with ε and δ' }, { value: 'challenge', label: 'Challenge: find δ' }], value: st.mode,
        onChange: stage1(v => { setMode(v); }) });
      const sideS = C.select({ label: 'Side', options: [{ value: 'both', label: 'Both sides' }, { value: 'left', label: 'Left only (x < a)' }, { value: 'right', label: 'Right only (x > a)' }], value: st.side,
        onChange: stage1(v => { st.side = v; configChanged(); }) });
      const altT = C.toggle({ label: 'Change the value of f at a', value: false, onChange: stage1(v => { st.alt = v; }) });
      C.title('Approach');
      C.buttons([
        { label: 'Step closer', onClick: stage1(() => { st.xo = Math.sign(st.xo) * Math.max(.001, sig(Math.abs(st.xo) / 10)); }) },
        { label: 'Other side', onClick: stage1(() => { st.xo = -st.xo; }) },
        { label: 'Reset', onClick: stage1(() => { st.xo = .1; }) }
      ]);
      C.title('Epsilon, delta and L');
      const epsS = C.slider({ label: 'ε (violet band)', min: -2.3, max: Math.log10(3), step: .01, value: Math.log10(st.eps), format: s => N(epsOf(s)),
        onInput: stage1(s => {
          if (st.mode === 'challenge') { st.eps = tgt()[ch.i]; ch.msg = 'In a challenge, ε is chosen for you.'; return; }
          st.eps = epsOf(s); if (st.auto) st.z = autoZ(st.eps); }) });
      const delS = C.slider({ label: 'δ (green band)', min: -3, max: Math.log10(3), step: .01, value: Math.log10(st.del), format: s => N(delOf(s)),
        onInput: stage1(s => { st.del = delOf(s); }) });
      const LS = C.slider({ label: 'Candidate limit L', min: -40, max: 40, step: 1, value: 0, format: n => N(+(F().L0 + n * F().dL).toFixed(4)),
        onInput: stage1(n => { st.n = n; configChanged(); }) });
      C.title('View');
      const autoT = C.toggle({ label: 'Zoom to fit the violet band', value: true, onChange: stage1(v => { st.auto = v; if (v && st.mode !== 'approach') st.z = autoZ(st.eps); }) });
      const zS = C.slider({ label: 'Zoom', min: 0, max: 3, step: .02, value: 0, format: s => '×' + N(sig(Math.pow(10, s), 2)),
        onInput: stage1(s => { st.z = Math.pow(10, s); st.auto = false; }) });
      C.title('Challenge');
      C.buttons([
        { label: 'Check my δ', onClick: stage1(chCheck) },
        { label: 'No δ works', onClick: stage1(chNone) },
        { label: 'Next ε', onClick: stage1(chNext) }
      ]);
      const ro = C.readout();
      C.hint('Drag the point, the green edges, the violet edges or the yellow dot L. Pick a mode first.');

      function setMode(m) {
        st.mode = m;
        if (m === 'approach') st.z = 1;
        else { if (st.auto) st.z = autoZ(st.eps); if (m === 'challenge') { st.n = 0; chReset(); } }
      }

      draggable(P, {
        hit: (px, py) => {
          const g = geo(); let best = null, bd = (matchMedia('(pointer: coarse)').matches ? 28 : 20);
          for (const hd of handles(g)) { const d = Math.hypot(hd.x - px, hd.y - py); if (d < bd) { bd = d; best = hd.id; } }
          return best;
        },
        move: (id, x, yup) => {
          cancel(); const g = geo(), f = F(), py = P.h - yup, a = f.a;
          if (id === 'x') {
            const o = clamp(g.ix(x) - a, g.xlo - a, g.xhi - a), m = Math.max(.001, sig(Math.abs(o)));
            st.xo = (o < 0 ? -1 : 1) * Math.min(m, Math.max(a - g.xlo, g.xhi - a));
          } else if (id === 'eps') st.eps = clamp(sig(Math.abs(g.iy(py) - Lv())), .005, 3);
          else if (id === 'del') st.del = clamp(sig(Math.abs(g.ix(x) - a)), MIN_DELTA, 3);
          else if (id === 'L') { st.n = clamp(Math.round((g.iy(py) - f.L0) / f.dL), -40, 40); configChanged(); }
          sync();
        }
      });

      function apply(patch, immediate) {
        cancel();
        const { fn, mode, side, alt, auto, ...nums } = patch, n = nums.n; delete nums.n;
        if (fn !== undefined) { st.fn = fn; if (nums.z === undefined) st.z = 1; st.n = 0; }
        if (side !== undefined) st.side = side;
        if (alt !== undefined) st.alt = alt;
        if (auto !== undefined) st.auto = auto;
        if (n !== undefined) st.n = n;
        if (mode !== undefined) st.mode = mode;
        if (st.mode === 'approach') { if (nums.z === undefined) nums.z = 1; }
        else if (st.auto && nums.z === undefined) nums.z = autoZ(nums.eps !== undefined ? nums.eps : st.eps);
        if (st.mode === 'challenge' && mode !== undefined) chReset();
        if (immediate) { Object.assign(st, nums); sync(); } else cancel = animateTo(st, nums, 900, sync);
        sync();
      }
      sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
