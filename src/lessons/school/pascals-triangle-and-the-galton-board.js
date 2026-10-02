/* =====================================================================
   SCHOOL — Pascal's triangle and the Galton board
   ===================================================================== */
{
  const binom = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };
  const ROW_MS = 85, DY = .9;

  register({
    id: 'pascals-triangle-and-the-galton-board', level: 'school',
    title: "Pascal's triangle and the Galton board",
    blurb: 'Drop balls through a board of pegs and watch the paths of Pascal\'s triangle build a bell shape.',
    thumb(c, p) {
      const pal = p.pal, R = 6; p.cx = 0; p.cy = -3.4; p.span = 4.4;
      for (let r = 0; r < R; r++) for (let j = 0; j <= r; j++) p.dot(j - r / 2, -r * .9, 2.6, pal['grid-strong']);
      for (let j = 0; j <= R; j++) {
        const h = binom(R, j) / 20 * 3.2;
        p.path([[j - R / 2 - .35, -R * .9 - 1.1], [j - R / 2 + .35, -R * .9 - 1.1], [j - R / 2 + .35, -R * .9 - 1.1 + h], [j - R / 2 - .35, -R * .9 - 1.1 + h]], { fill: alpha(pal.blue, .7), close: true });
      }
    },
    hook: String.raw`Balls bounce left or right at random as they fall through a board of pegs. Why do they pile up in a smooth bell shape instead of spreading evenly?`,
    steps: [
      { title: 'Count the paths',
        text: String.raw`<p>At every peg a ball goes left or right. The number on each peg counts the different paths that lead there. Each number is the sum of the two numbers above it.</p><p>The bottom row, \(1,4,6,4,1\), is row 4 of <b>Pascal's triangle</b>. There are \(2^4=16\) paths in all.</p>`,
        set: { rows: 4, p: .5, reset: true, nums: true, theory: false, drop: 0 } },
      { title: 'Drop some balls',
        text: String.raw`<p>Press <b>Drop 10</b> or <b>Drop 100</b>. The middle bin gets the most balls because \(6\) of the \(16\) paths end there, while each edge bin has only \(1\).</p><p>With equally likely paths, more paths means more balls.</p>`,
        set: { rows: 4, p: .5, reset: true, nums: true, theory: false, drop: 80 } },
      { title: 'More rows, a bell',
        text: String.raw`<p>With \(10\) rows there are \(1024\) paths and the pile forms a bell. The rings show the expected counts from Pascal's numbers.</p><p>Real piles wobble around the rings, and settle onto them as more balls fall.</p>`,
        set: { rows: 10, p: .5, reset: true, nums: false, theory: true, drop: 300 } },
      { title: 'Tilt the board',
        text: String.raw`<p>Now each peg sends a ball right only \(30\%\) of the time. The pile shifts left and becomes lopsided.</p><p>Paths are no longer equally likely. A path with \(j\) rights has chance \(p^j(1-p)^{n-j}\), and there are \(\binom{n}{j}\) such paths.</p>`,
        set: { rows: 10, p: .3, reset: true, nums: false, theory: true, drop: 300 } }
    ],
    formal: String.raw`
      <h3>Pascal's triangle</h3>
      <p>Row \(n\) of Pascal's triangle lists the numbers \(\binom{n}{0},\binom{n}{1},\ldots,\binom{n}{n}\), where each entry is the sum of the two above it:
      \[ \binom{n}{j}=\binom{n-1}{j-1}+\binom{n-1}{j}. \]
      It counts paths: to reach a peg you must arrive from the peg up-left or the peg up-right, so the paths to it are the paths to those two added together. The row sums are \(1,2,4,8,\ldots=2^n\).</p>
      <h3>Choosing</h3>
      <p>A ball's trip is a string of \(n\) left or right choices. The ball lands in bin \(j\) exactly when \(j\) of them are right, and \(\binom{n}{j}=\dfrac{n!}{j!\,(n-j)!}\) counts the strings with \(j\) rights.</p>
      <h3>The binomial distribution</h3>
      <p>If each peg sends the ball right with probability \(p\), the chance of landing in bin \(j\) is
      \[ P(j)=\binom{n}{j}\,p^{j}\,(1-p)^{n-j}. \]
      For \(p=\tfrac12\) every path has the same chance \(2^{-n}\), so \(P(j)=\binom{n}{j}/2^n\), the bell shape you see. As the number of rows grows, this shape approaches the normal curve.</p>`,
    check: [
      { q: 'What is the next row of Pascal\'s triangle after 1, 4, 6, 4, 1?',
        choices: ['1, 5, 10, 10, 5, 1', '1, 4, 6, 4, 1, 1', '1, 5, 9, 9, 5, 1', '1, 8, 12, 8, 1'], answer: 0,
        why: String.raw`Each entry is the sum of the two above: \(1,\ 1+4,\ 4+6,\ 6+4,\ 4+1,\ 1\) gives \(1,5,10,10,5,1\).`,
        hint: 'Each number is the sum of the two numbers above it. The edges are always 1.' },
      { q: 'A Galton board has 4 rows and each peg is fair. What fraction of balls should land in the middle bin?',
        choices: ['1/16', '4/16', '6/16', '8/16'], answer: 2,
        why: String.raw`The middle bin has \(\binom{4}{2}=6\) paths out of \(2^4=16\), so \(6/16=37.5\%\) of the balls.`,
        hint: 'Count the paths to the middle bin and divide by all 16 paths.' }
    ],
    links: { prereq: ['probability-with-repeated-trials'], related: ['mean-median-and-spread'] },

    mount({ stage, controls: C }) {
      const st = { rows: 4, p: .5 };
      let bins = [], total = 0, balls = [], queue = 0, raf = null, last = 0, acc = 0, showNums = true, showTheory = false;
      const P = new Plane(stage, { span: 8 });
      const resetBoard = () => { bins = new Array(st.rows + 1).fill(0); total = 0; balls = []; queue = 0; };
      resetBoard();
      const newBall = () => { const dirs = Array.from({ length: st.rows }, () => Math.random() < st.p ? 1 : 0); return { dirs, t: -.8, j: dirs.reduce((a, b) => a + b, 0) }; };
      const prob = j => binom(st.rows, j) * Math.pow(st.p, j) * Math.pow(1 - st.p, st.rows - j);

      const HB = 4;
      /* bar geometry shared by the drawing and by falling balls, so a ball lands on top of its bar */
      const geom = () => {
        const R = st.rows, bottom = -R * DY - .7 - HB;
        const maxC = Math.max(8, ...bins, showTheory ? total * Math.max(...bins.map((_, j) => prob(j))) : 0);
        return { R, bottom, unit: HB / maxC };
      };
      const ballPos = b => {
        const R = st.rows, t = Math.max(b.t, 0);
        if (b.t < 0) return [0, -b.t * DY];
        if (t >= R) return [b.j - R / 2, -R * DY - (t - R) * DY * 1.8];
        const r = Math.floor(t), f = t - r;
        let j = 0; for (let i = 0; i < r; i++) j += b.dirs[i];
        const x0 = j - r / 2, x1 = x0 + b.dirs[r] - .5, e = f * f * (3 - 2 * f);
        return [x0 + (x1 - x0) * e, -(r + f) * DY];
      };

      P.onDraw = (c, p) => {
        const { R, bottom, unit } = geom(), pal = p.pal;
        const topEdge = 1.3, botEdge = bottom - .9, sc = Math.min(p.w / (R + 2.8), p.h / (topEdge - botEdge));
        p.span = Math.min(p.w, p.h) / (2 * sc); p.cx = 0; p.cy = (topEdge + botEdge) / 2;
        const fs = clamp(p.scale * .38, 11, 16), rp = clamp(p.scale * .09, 2.5, 4.5);
        for (let r = 0; r < R; r++) for (let j = 0; j <= r; j++) p.dot(j - r / 2, -r * DY, rp, pal['grid-strong']);
        if (showNums) for (let r = 0; r <= R; r++) for (let j = 0; j <= r; j++)
          p.label(String(binom(r, j)), j - r / 2, -r * DY, { size: fs + 3, italic: false, color: pal.muted, dy: -12 });
        p.path([[-R / 2 - .6, bottom], [R / 2 + .6, bottom]], { stroke: pal['grid-strong'], width: 2 });
        bins.forEach((n, j) => {
          const x = j - R / 2, h = n * unit;
          if (h > 0) p.path([[x - .38, bottom], [x + .38, bottom], [x + .38, bottom + h], [x - .38, bottom + h]], { fill: alpha(pal.blue, .8), close: true });
          p.label(String(n), x, bottom, { size: fs + 2, italic: false, color: pal.muted, dy: 14 });
          if (showTheory && total) p.dot(x, bottom + total * prob(j) * unit, Math.max(5, rp * 1.8), null, pal.red, 2.5);
        });
        for (const b of balls) { const [x, y] = ballPos(b); p.dot(x, y, rp * 1.7, pal.yellow, pal.stage, 1.5); }
      };

      const upd = () => {
        const R = st.rows, mx = bins.indexOf(Math.max(...bins));
        ro.innerHTML = `<span class="k">Rows</span> n = ${R} &nbsp; <span class="k">Paths</span> 2<sup>${R}</sup> = ${Math.pow(2, R).toLocaleString('en')}<br>` +
          `<span class="k">Balls dropped</span> ${total}` + (total ? `<br><span class="k">Fullest bin</span> ${mx} (${(bins[mx] / total * 100).toFixed(0)}% of balls; theory ${(prob(mx) * 100).toFixed(0)}%)` : '');
      };
      const draw = () => { P.draw(); upd(); };
      const land = b => { bins[b.j]++; total++; };
      const tick = now => {
        if (!last) last = now;
        const dt = Math.min(now - last, 60); last = now; acc += dt;
        const iv = queue > 60 ? 14 : queue > 15 ? 40 : 160;
        while (queue > 0 && acc >= iv) { acc -= iv; balls.push(newBall()); queue--; }
        if (!queue) acc = 0;
        for (const b of balls) b.t += dt / ROW_MS;
        const g = geom();
        balls = balls.filter(b => { if (b.t >= st.rows && ballPos(b)[1] <= g.bottom + bins[b.j] * g.unit) { land(b); return false; } return true; });
        draw();
        if (balls.length || queue) raf = requestAnimationFrame(tick); else { raf = null; last = 0; }
      };
      const dropBalls = n => {
        if (reduceMotion) { for (let i = 0; i < n; i++) land(newBall()); draw(); return; }
        queue += n; if (!raf) { last = 0; raf = requestAnimationFrame(tick); }
      };
      const stop = () => { if (raf) cancelAnimationFrame(raf); raf = null; last = 0; queue = 0; balls = []; };
      const sync = () => { rowS.set(st.rows); pS.set(st.p); draw(); };

      C.title('Board');
      const rowS = C.slider({ label: 'Rows of pegs', min: 2, max: 12, step: 1, value: st.rows, format: v => String(Math.round(v)),
        onInput: v => { stop(); st.rows = Math.round(v); resetBoard(); draw(); } });
      const pS = C.slider({ label: 'Chance of bouncing right', min: .1, max: .9, step: .05, value: st.p, format: v => Math.round(v * 100) + '%',
        onInput: v => { stop(); st.p = Math.round(v * 100) / 100; resetBoard(); draw(); } });
      C.buttons([
        { label: 'Drop 1', onClick: () => dropBalls(1) },
        { label: 'Drop 10', primary: true, onClick: () => dropBalls(10) },
        { label: 'Drop 100', onClick: () => dropBalls(100) },
        { label: 'Clear', onClick: () => { stop(); resetBoard(); draw(); } }
      ]);
      C.title('Show');
      const numT = C.toggle({ label: "Pascal's triangle numbers", value: showNums, onChange: v => { showNums = v; P.draw(); } });
      const thT = C.toggle({ label: 'Expected counts (rings)', value: showTheory, onChange: v => { showTheory = v; P.draw(); } });
      const ro = C.readout(); upd();

      const apply = (patch, immediate) => {
        stop();
        if (patch.rows !== undefined) st.rows = patch.rows;
        if (patch.p !== undefined) st.p = patch.p;
        if (patch.nums !== undefined) { showNums = patch.nums; numT.checked = showNums; }
        if (patch.theory !== undefined) { showTheory = patch.theory; thT.checked = showTheory; }
        if (patch.reset || patch.rows !== undefined) resetBoard();
        sync();
        if (patch.drop) { if (immediate) { for (let i = 0; i < patch.drop; i++) land(newBall()); draw(); } else dropBalls(patch.drop); }
      };
      return { destroy: () => { stop(); P.destroy(); }, apply };
    }
  });
}
