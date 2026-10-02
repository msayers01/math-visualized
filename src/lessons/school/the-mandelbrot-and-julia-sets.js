/* =====================================================================
   SCHOOL (Enrichment) — The Mandelbrot and Julia sets
   ===================================================================== */
{
  const MI = '−';
  const FONT = '"Hanken Grotesk","Helvetica Neue",Arial,sans-serif';
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;
  const lines = a => a.filter(Boolean).join('<br>');
  const sub = n => String(n).split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[+d]).join('');
  const zn = n => 'z' + sub(n);

  /* numbers and complex numbers as text */
  const nf = (v, d = 3) => {
    if (!isFinite(v)) return '∞';
    if (Math.abs(v) >= 1e5) return (v < 0 ? MI : '') + Math.abs(v).toExponential(2).replace('e+', 'e');
    const s = (+Math.abs(v).toFixed(d)).toString();
    return (v < 0 && s !== '0' ? MI : '') + s;
  };
  const cs = (r, i, d = 3) => {
    const a = nf(r, d), b = nf(Math.abs(i), d), im = (b === '1' ? '' : b) + 'i';
    if (b === '0') return a;
    if (a === '0') return (i < 0 ? MI : '') + im;
    return a + (i < 0 ? ' − ' : ' + ') + im;
  };

  /* ---------- the mathematics ---------- */
  const orbit = (cr, ci, N) => {
    const o = [[0, 0]]; let zr = 0, zi = 0;
    for (let n = 1; n <= N; n++) {
      const t = zr * zr - zi * zi + cr; zi = 2 * zr * zi + ci; zr = t; o.push([zr, zi]);
      if (zr * zr + zi * zi > 1e60) break;
    }
    return o;
  };
  const inCard = (x, y) => { const q = (x - .25) * (x - .25) + y * y; return q * (q + x - .25) <= y * y / 4 + 1e-12; };
  const inBulb = (x, y) => (x + 1) * (x + 1) + y * y <= 1 / 16 + 1e-12;
  /* Mandelbrot: step at which |z| first passes 2 (0 = did not within cap). The cardioid and the bulb are known to stay, so they are skipped. */
  const escM = (cr, ci, cap) => {
    const q = (cr - .25) * (cr - .25) + ci * ci;
    if (q * (q + cr - .25) <= ci * ci / 4) return 0;
    if ((cr + 1) * (cr + 1) + ci * ci <= 1 / 16) return 0;
    let zr = 0, zi = 0;
    for (let n = 1; n <= cap; n++) {
      const t = zr * zr - zi * zi + cr; zi = 2 * zr * zi + ci; zr = t;
      if (zr * zr + zi * zi > 4) return n;
    }
    return 0;
  };
  /* Julia: starting point z0, fixed c. Returns steps + 1 (so 0 means did not escape within cap). */
  const escJ = (zr, zi, cr, ci, cap) => {
    for (let n = 0; n < cap; n++) {
      if (zr * zr + zi * zi > 4) return n + 1;
      const t = zr * zr - zi * zi + cr; zi = 2 * zr * zi + ci; zr = t;
    }
    return 0;
  };
  /* what happens to the orbit of 0, judged from 3000 steps */
  const fateCache = new Map();
  const fate = (cr, ci) => {
    const key = cr + ',' + ci; if (fateCache.has(key)) return fateCache.get(key);
    let zr = 0, zi = 0, res = null; const N = 3000, hist = [];
    for (let n = 1; n <= N; n++) {
      const t = zr * zr - zi * zi + cr; zi = 2 * zr * zi + ci; zr = t;
      if (zr * zr + zi * zi > 4) { res = { t: 'esc', n }; break; }
      if (n > N - 20) hist.push([zr, zi]);
    }
    if (!res) {
      const L = hist[hist.length - 1]; res = { t: 'wander' };
      for (let p = 1; p <= 12; p++) {
        const q = hist[hist.length - 1 - p];
        if (Math.hypot(L[0] - q[0], L[1] - q[1]) < 1e-4) { res = { t: 'cyc', p, z: L, slow: Math.hypot(L[0] - hist[hist.length - 2][0], L[1] - hist[hist.length - 2][1]) > 1e-9 }; break; }
      }
    }
    if (fateCache.size > 400) fateCache.clear();
    fateCache.set(key, res); return res;
  };
  const fateText = (cr, ci) => {
    const f = fate(cr, ci);
    if (f.t === 'esc') return `${ok('Escapes.')} |z| first passes 2 at step ${f.n}, and from there it only grows (see The math).`;
    if (f.t === 'cyc') {
      if (cr === -2 && ci === 0) return `${ok('Stays.')} The orbit sticks at 2: it is exactly 2, and 2 is not more than 2.`;
      if (f.p === 1) return `${ok('Settles.')} The orbit closes in on one fixed point, near ${cs(f.z[0], f.z[1])}.` + (f.slow ? ' It does so very slowly: this c is on the edge of the set.' : '');
      return `${ok('Settles.')} The orbit ends up repeating a cycle of ${f.p} points.`;
    }
    return `${ok('Stays.')} No escape in 3000 steps and no short cycle either: the orbit wanders.`;
  };
  const capOf = k => Math.min(200, 60 + 10 * k);
  const KMAX = 14;
  const DEF_VIEW = { x: -.5, y: 0, k: 0 };
  const hsBase = (w, h) => Math.max(1.2, 1.65 / (w / Math.min(w, h)));
  const hsJ = (w, h) => Math.max(1.4, 2.05 / (w / Math.min(w, h)));

  /* colours: a table indexed by the step number; index 0 is "did not escape" */
  const LUT = (() => {
    const L = new Uint8ClampedArray(4 * 512);
    L.set([10, 14, 30, 255], 0);
    for (let n = 1; n < 512; n++) {
      const t = n / 24, f = a => 255 * (.5 + .5 * Math.cos(6.2832 * (t + a)));
      L.set([f(.62) * .95, f(.78) * .92, f(.92) * 1], 4 * n); L[4 * n + 3] = 255;
    }
    return L;
  })();

  /* ---------- chunked renderer ---------- */
  const BUDGET = 12;
  const mkRenderer = onUpdate => {
    const off = document.createElement('canvas'), octx = off.getContext('2d');
    let tok = 0, timer = 0, key = '';
    const api = { off, cfg: null, running: false, ms: 0, prog: 0 };
    api.cancel = () => { tok++; clearTimeout(timer); api.running = false; };
    api.ensure = cfg => {
      const k = [cfg.kind, cfg.cx, cfg.cy, cfg.hs, cfg.cr, cfg.ci, cfg.cap, cfg.bw, cfg.bh, cfg.coarse ? 1 : 0, cfg.w, cfg.h].join('|');
      if (k === key) return;
      key = k; api.cancel(); const mine = tok; begin(cfg, mine);
    };
    const begin = (cfg, mine) => {
      const { bw, bh, cap } = cfg, isM = cfg.kind === 'm';
      if (off.width !== bw || off.height !== bh) { off.width = bw; off.height = bh; }
      const img = octx.createImageData(bw, bh), d = img.data;
      const unit = 2 * cfg.hs / Math.min(cfg.w, cfg.h), sx = unit * cfg.w / bw, sy = unit * cfg.h / bh;
      const x0 = cfg.cx - sx * bw / 2, y0 = cfg.cy + sy * bh / 2;
      const levels = cfg.coarse ? [4] : [8, 4, 2, 1];
      let li = 0, by = 0; const t00 = performance.now();
      api.cfg = cfg; api.running = true; api.prog = 0;
      const step = () => {
        if (mine !== tok) return;
        const tS = performance.now();
        while (li < levels.length) {
          const b = levels[li];
          while (by < bh) {
            const yy = y0 - (by + b / 2) * sy, jEnd = Math.min(by + b, bh);
            for (let bx = 0; bx < bw; bx += b) {
              const xx = x0 + (bx + b / 2) * sx;
              const n = isM ? escM(xx, yy, cap) : escJ(xx, yy, cfg.cr, cfg.ci, cap);
              const o = Math.min(n, 511) * 4, r = LUT[o], g = LUT[o + 1], bl = LUT[o + 2], iEnd = Math.min(bx + b, bw);
              for (let j = by; j < jEnd; j++) for (let i = bx; i < iEnd; i++) { const q = (j * bw + i) * 4; d[q] = r; d[q + 1] = g; d[q + 2] = bl; d[q + 3] = 255; }
            }
            by += b;
            if (performance.now() - tS > BUDGET) {
              octx.putImageData(img, 0, 0); api.prog = (li + by / bh) / levels.length; onUpdate();
              timer = setTimeout(step, 0); return;
            }
          }
          li++; by = 0;
        }
        octx.putImageData(img, 0, 0); api.running = false; api.prog = 1; api.ms = performance.now() - t00; onUpdate();
      };
      step();
    };
    return api;
  };
  const bufSize = (w, h, sharp) => {
    const a = w / h, bh = Math.max(8, Math.round(Math.sqrt(38400 * sharp * sharp / a))), bw = Math.max(8, Math.round(bh * a));
    return [Math.min(bw, 340 * sharp), Math.min(bh, 340 * sharp)];
  };

  /* ---------- drawing helpers ---------- */
  const T = (c, s, x, y, o = {}) => {
    c.font = o.italic ? `italic ${o.weight || 700} ${o.size || 14}px "STIX Two Text","Cambria Math","Times New Roman",serif` : `${o.weight || 500} ${o.size || 14}px ${FONT}`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
    if (o.halo) { c.lineWidth = 4; c.strokeStyle = o.halo; c.lineJoin = 'round'; c.strokeText(s, x, y); }
    c.fillStyle = o.color; c.fillText(s, x, y);
  };
  /* arrow from pixel a to pixel b, shortened at both ends, nudged sideways so a back-and-forth pair does not overlap */
  const arrowPx = (c, ax, ay, bx, by, col, w, shrink = 8, side = 4) => {
    let dx = bx - ax, dy = by - ay; const len = Math.hypot(dx, dy);
    if (len < shrink * 2 + 3) return;
    if (len > 6000) { bx = ax + dx * 6000 / len; by = ay + dy * 6000 / len; dx = bx - ax; dy = by - ay; }
    const L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy * side, ny = ux * side;
    const sx = ax + ux * shrink + nx, sy = ay + uy * shrink + ny, ex = bx - ux * shrink + nx, ey = by - uy * shrink + ny, hl = 10;
    c.strokeStyle = col; c.fillStyle = col; c.lineWidth = w; c.lineCap = 'round';
    c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex - ux * hl * .7, ey - uy * hl * .7); c.stroke();
    c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex - hl * Math.cos(Math.atan2(uy, ux) - .42), ey - hl * Math.sin(Math.atan2(uy, ux) - .42));
    c.lineTo(ex - hl * Math.cos(Math.atan2(uy, ux) + .42), ey - hl * Math.sin(Math.atan2(uy, ux) + .42)); c.closePath(); c.fill();
  };

  /* ---------- practice problems (fixed) ---------- */
  const PROBS = [
    { q: 'Take c = 1 + i. The orbit starts at z₀ = 0 and uses the rule z → z² + c. Which list gives z₁, z₂ and z₃?',
      ch: [
        ['1 + i, 1 + i, 1 + i', 'You squared as if (1 + i)² were 1² + i² = 0. But (1 + i)² = 1 + 2i + i² = 2i: the middle term 2i is missing. So z₂ is not 1 + i.'],
        ['1 + 3i, −7 + 7i, 1 − 97i', 'Those are z₂, z₃ and z₄. The first term z₁ is c itself, because z₁ = 0² + c = 1 + i.'],
        ['1 + i, 1 + 3i, −7 + 7i', ok('Right.') + ' z₁ = 0² + c = 1 + i. z₂ = (1 + i)² + (1 + i) = 2i + 1 + i = 1 + 3i. z₃ = (1 + 3i)² + (1 + i) = (−8 + 6i) + (1 + i) = −7 + 7i. Its size is about 9.9, far past 2.'],
        ['1 + i, 2i, −4', 'You squared but forgot to add c each time. The rule is z² + c, so z₂ = (1 + i)² + (1 + i), not just (1 + i)².']
      ], ans: 2, show: { part: 'orbit', cr: 1, ci: 1, n: 3 } },
    { q: 'Decide whether the orbit of 0 escapes (passes |z| = 2 and goes on growing) for c = 1, c = −1 and c = 0.5i. Which statement is correct?',
      ch: [
        ['c = 1 and c = −1 escape, because |c| is at least 1. c = 0.5i stays.', 'Size of c alone does not decide it. c = −1 has |c| = 1 but its orbit is 0, −1, 0, −1, … forever, so it never escapes.'],
        ['All three escape, because the rule only adds c.', 'The rule also squares, and squaring a number smaller than 1 makes it smaller. c = −1 repeats 0, −1, 0, −1, … and never grows.'],
        ['Only c = 0.5i escapes, because it has an imaginary part.', 'Having an imaginary part does not make an orbit escape. For c = 0.5i the orbit is 0.5i, −0.25 + 0.5i, −0.19 + 0.25i, … and its size stays around 0.3 to 0.6.'],
        ['c = 1 escapes. c = −1 and c = 0.5i do not.', ok('Right.') + ' c = 1: 0, 1, 2, 5, 26, … passes 2 at step 3 and then grows. c = −1: 0, −1, 0, −1, … is a cycle. c = 0.5i: 0.5i, −0.25 + 0.5i, −0.19 + 0.25i, −0.03 + 0.41i, … the size stays small and the orbit closes in on a fixed point.']
      ], ans: 3, show: { part: 'orbit', cr: 1, ci: 0, n: 4 } },
    { q: 'The main cardioid is the big heart-shaped body of the Mandelbrot set. There the orbit of 0 settles to a single fixed point. Work out the orbits by hand. Which c lies in the main cardioid?',
      ch: [
        ['c = −1', 'The orbit of −1 is 0, −1, 0, −1, … It repeats a cycle of 2 points, so it is not one fixed point. c = −1 is the centre of the round bulb to the left of the cardioid.'],
        ['c = 0.5', 'The orbit of 0.5 is 0, 0.5, 0.75, 1.063, 1.629, 3.153, … It passes 2 and escapes, so c = 0.5 is outside the set.'],
        ['c = −0.5', ok('Right.') + ' The orbit of −0.5 is −0.5, −0.25, −0.4375, −0.309, −0.405, −0.336, … It closes in on one fixed point, about −0.366. That is what happens inside the main cardioid.'],
        ['c = 1', 'The orbit of 1 is 0, 1, 2, 5, 26, … It escapes, so c = 1 is outside the set.']
      ], ans: 2, show: { part: 'orbit', cr: -.5, ci: 0, n: 12 } },
    { q: 'Look at the orbits of 0 for c = 0.2, c = 0.25 and c = 0.3. Which description is correct?',
      ch: [
        ['All three settle down, because 0.2, 0.25 and 0.3 are all small numbers.', 'Small c does not guarantee it. For c = 0.3 the orbit is 0, 0.3, 0.39, 0.452, 0.504, … and it keeps growing until it passes 2 at step 12.'],
        ['c = 0.2 and c = 0.25 settle (to about 0.276 and to 0.5). c = 0.3 escapes after 12 steps.', ok('Right.') + ' At c = 0.25 the orbit creeps up toward 1/2, slower and slower. For c = 0.3 each step adds at least 0.05, because z² − z + 0.3 = (z − 0.5)² + 0.05, so it cannot stop and it passes 2 at step 12. The set ends exactly at 1/4 on the real axis.'],
        ['c = 0.3 settles to a fixed point too, since the orbit grows more and more slowly.', 'It grows slowly at first, but it does not slow to a stop. Each step adds at least 0.05, so it must pass 2. For c = 0.3 that happens at step 12.'],
        ['c = 0.25 escapes after about 12 steps, like c = 0.3.', 'At c = 0.25 the orbit 0, 0.25, 0.3125, 0.348, 0.371, … creeps toward 1/2 and never passes it. It settles, very slowly.']
      ], ans: 1, show: { part: 'orbit', cr: .3, ci: 0, n: 13 } },
    { q: 'You zoom in 1000 times on a point on the edge of the Mandelbrot set. What do you expect to see?',
      ch: [
        ['A smooth curve, like zooming in on a circle.', 'A circle looks straighter and straighter under zoom. The edge of the Mandelbrot set does not: you can try it in the Zoom part.'],
        ['The picture goes black, because there is nothing at that scale.', 'The edge has detail at every scale. The step limit has to rise to show it, but the picture does not go empty.'],
        ['Only straight lines.', 'No straight lines appear. The edge is made of curls, spirals and bulbs.'],
        ['More detail: curls and spirals, and sometimes tiny copies of the whole set, with an edge that is still rough.', ok('Right.') + ' The edge stays rough at every scale you can compute, and similar shapes keep coming back. The copies are similar to the whole set, not exact duplicates.']
      ], ans: 3, show: { part: 'zoom', view: { x: -.7435669, y: .1314023, k: 11 } } },
    { q: 'Is the Julia set for c = 2 one connected piece, or dust? Hint: look at the orbit of 0 under z → z² + c.',
      ch: [
        ['Connected: every Julia set is one piece.', 'Not every one. Julia sets come in two kinds, depending on c: one piece, or dust.'],
        ['Connected: c = 2 is on the real axis, and the set contains the real axis.', 'The Mandelbrot set meets the real axis only from −2 to 1/4. c = 2 is outside that stretch.'],
        ['Dust: the orbit 0, 2, 6, 38, … escapes, so c = 2 is outside the Mandelbrot set.', ok('Right.') + ' If the orbit of 0 escapes, c is outside the Mandelbrot set, and then the Julia set is dust: separate points with no connected piece.'],
        ['Impossible to say without drawing it.', 'The Mandelbrot set answers it. Test the orbit of 0: it escapes for c = 2, so the Julia set is dust.']
      ], ans: 2, show: { part: 'julia', cr: 2, ci: 0 } },
    { q: 'A student follows the orbit of 0 for c = 0.26 for 10 steps. The values stay small (z₁₀ is about 0.48). She says: "It has not escaped, so it must settle down." What is wrong?',
      ch: [
        ['Nothing: 10 steps is enough to be sure.', 'It is not. You can be sure only when the orbit escapes (it passes 2) or when you can show why it cannot.'],
        ['Not escaped yet is not never escaped. The orbit of 0.26 passes 2 at step 30.', ok('Right.') + ' Near the edge of the set an orbit can crawl for a long time and then escape. A few steps can show an escape, but they can never show that an orbit stays. That is why the picture uses a step limit and shows the set a little too big.'],
        ['Orbits that stay under 2 for 10 steps always repeat with period 10.', 'There is no such rule. Cycles can have any period, and many orbits never repeat.'],
        ['The orbit must already have escaped, because 0.48 rounds up to 2.', 'Rounding does not work like that. 0.48 is far below 2.']
      ], ans: 1, show: { part: 'orbit', cr: .26, ci: 0, n: 30 } }
  ];

  /* ---------- the lesson ---------- */
  register({
    id: 'the-mandelbrot-and-julia-sets', level: 'school',
    title: 'The Mandelbrot and Julia sets',
    blurb: 'Square a complex number and add c, again and again: watch orbits escape or settle, draw the Mandelbrot set, zoom into its edge and meet its Julia sets.',
    thumb(c, p) {
      const pal = p.pal, W = p.w, Hh = p.h, cell = 3, hs = Math.max(1.2, 1.6 / (W / Math.min(W, Hh))), u = 2 * hs / Math.min(W, Hh);
      for (let y = 0; y < Hh; y += cell) for (let x = 0; x < W; x += cell) {
        const n = escM(-.5 + (x + cell / 2 - W / 2) * u, -(y + cell / 2 - Hh / 2) * u, 28), o = Math.min(n, 511) * 4;
        c.fillStyle = `rgb(${LUT[o]},${LUT[o + 1]},${LUT[o + 2]})`; c.fillRect(x, y, cell, cell);
      }
      void pal;
    },
    hook: String.raw`Square a number, then add a fixed number \(c\). Do it again, and again. For some \(c\) the numbers explode, for others they settle down. Colour every \(c\) by which happens. What picture do you get, and what happens when you zoom in on its edge?`,
    steps: [
      { title: 'One rule, repeated',
        text: String.raw`<p>Pick a number \(c\). Start at \(z_0=0\) and apply \(z\mapsto z^2+c\) again and again. The dots are the orbit. For \(c=0.5\): 0, 0.5, 0.75, 1.063, 1.629, 3.153. At step 5 the size \(|z|\) is 3.153, past the line \(|z|=2\), and it never comes back. Predict, then press Next step. Then try \(c=-1\), \(c=i\) and \(c=0.2\): an orbit can also settle.</p>`,
        set: { part: 'orbit', cr: .5, ci: 0, n: 5 } },
      { title: 'Colour every c',
        text: String.raw`<p>Now colour every \(c\) by the step where its orbit first passes \(|z|=2\). Black means it never does. The black shape is the Mandelbrot set. Here \(c=-1\) is black: its orbit is 0, −1, 0, −1, and so on. Drag the ring or use the sliders. Try \(c=0.25\) and \(c=-2\): the set meets the real axis exactly from −2 to 0.25.</p>`,
        set: { part: 'set', cr: -1, ci: 0, n: 30 } },
      { title: 'Zoom in on the edge',
        text: String.raw`<p>Zoom in on the edge, here near \(-0.75+0.1i\). It never becomes smooth: curls, spirals and little bulbs keep appearing at every level. The step limit rises with each zoom (60 plus 10 per level, at most 200) so the detail stays visible. Use the presets, the zoom buttons and the pan buttons.</p>`,
        set: { part: 'zoom', cr: -.75, ci: .1, view: { x: -.75, y: .1, k: 5 } } },
      { title: 'Julia sets',
        text: String.raw`<p>Keep the rule, but fix \(c\) and colour each starting point \(z_0\) by how fast it escapes. That picture is the Julia set for \(c\). Drag \(c\) on the top picture. If \(c\) is in the Mandelbrot set, the Julia set is one connected piece. If \(c\) is outside, it is dust. Here \(c=-1\) gives the basilica.</p>`,
        set: { part: 'julia', cr: -1, ci: 0 } }
    ],
    formal: String.raw`
      <h3>The rule and its orbit</h3>
      <p>A complex number \(z=a+bi\) is the point \((a,b)\) of the plane: \(a\) on the real axis (left and right), \(b\) on the imaginary axis (up and down). The names "real" and "imaginary" are historical. Complex numbers are used every day in electrical engineering and signal processing.</p>
      <p>Fix a complex number \(c\). Start with \(z_0=0\) and set
      \[ z_{n+1}=z_n^2+c. \]
      The list \(z_0,z_1,z_2,\dots\) is the <b>orbit</b> of \(c\). So \(z_1=c\), \(z_2=c^2+c\), \(z_3=(c^2+c)^2+c\). For \(c=1+i\): \(z_1=1+i\), \(z_2=2i+1+i=1+3i\), \(z_3=(1+3i)^2+1+i=-7+7i\).</p>
      <p>Squaring squares the distance from 0 and doubles the angle. With \(c=0\) that is all the rule does: a point with \(|z|&gt;1\) spirals outward, \(|z|&lt;1\) inward, and \(|z|=1\) stays on the unit circle. Adding \(c\) is what makes the picture interesting.</p>

      <h3>Why 2 is the escape line</h3>
      <p><b>Claim.</b> If \(|z_n|&gt;2\) and \(|z_n|&gt;|c|\), then \(|z_m|\to\infty\).</p>
      <p><b>Proof.</b> Let \(R=\max(2,|c|)\), so \(|z_n|&gt;R\). By the triangle inequality, \(|z_{n+1}|\ge|z_n|^2-|c|\ge|z_n|^2-R\). Subtract \(R\):
      \[ |z_{n+1}|-R\ \ge\ |z_n|^2-2R\ =\ (|z_n|-R)(|z_n|+R)+R(R-2)\ \ge\ (|z_n|-R)(|z_n|+R)\ &gt;\ 4\,(|z_n|-R). \]
      The distance past \(R\) more than quadruples at every step, so it grows without bound. \(\square\)</p>
      <p>Two consequences. If \(|c|\le2\), the line is \(|z|=2\): once the orbit passes it, it escapes. If \(|c|&gt;2\), then \(|z_2|\ge|c|^2-|c|&gt;|c|\), so the claim applies from step 2: the orbit escapes. So testing "does the orbit ever pass 2?" is a fair test of escape, and the Mandelbrot set lies inside the disc \(|c|\le2\).</p>

      <h3>Fixed points, cycles and the real axis</h3>
      <p>A <b>fixed point</b> satisfies \(z^2+c=z\), that is \(z^2-z+c=0\), so \(z=\tfrac{1\pm\sqrt{1-4c}}{2}\). For \(c=0.2\) one root is \(\tfrac{1-\sqrt{0.2}}{2}\approx0.276\), and the orbit of 0 settles there. A <b>cycle</b> repeats: for \(c=-1\) the orbit is \(0,-1,0,-1,\dots\) (period 2). For \(c=i\): \(0,\ i,\ -1+i,\ -i,\ -1+i,\ -i,\dots\), which enters a 2-cycle after two steps.</p>
      <p>When \(c\) is real, every \(z_n\) is real. <i>Right end.</i> For real \(c&gt;\tfrac14\), \(z_{n+1}-z_n=z_n^2-z_n+c=(z_n-\tfrac12)^2+(c-\tfrac14)\ge c-\tfrac14&gt;0\), so the orbit climbs by at least a fixed amount each step and must pass 2 (\(c=0.3\): step 12; \(c=0.26\): step 30). At \(c=\tfrac14\) the same expression is \((z_n-\tfrac12)^2\): the orbit creeps up toward \(\tfrac12\), slower and slower, and never passes it. <i>Left end.</i> For real \(c&lt;-2\), \(|c|&gt;2\) and it escapes. At \(c=-2\) the orbit is \(0,-2,2,2,2,\dots\), which stays (\(|z|=2\) is not more than 2).</p>
      <p><i>In between.</i> Let \(c\in[-2,\tfrac14]\) and \(\beta=\tfrac{1+\sqrt{1-4c}}{2}\), so \(\beta^2-\beta+c=0\), i.e. \(\beta^2+c=\beta\). If \(|z|\le\beta\) then \(z^2+c\) lies between \(c\) and \(\beta^2+c=\beta\). And \(c\ge-\beta\) exactly when \(\beta\le2\), i.e. \(c\ge-2\). So \([-\beta,\beta]\) is mapped into itself, contains 0, and the orbit never leaves it. The set meets the real axis in exactly \([-2,\tfrac14]\).</p>

      <h3>The Mandelbrot set</h3>
      <p>The <b>Mandelbrot set</b> is the set of all \(c\) whose orbit of 0 never escapes. The picture colours each \(c\) by the step where \(|z|\) first passes 2. A computer can only try a limited number of steps, so black means "no escape found within the step limit". Near the edge a point can escape later than the limit, so the black region is drawn slightly too big. The picture is an approximation from the outside.</p>
      <p>Facts we do not prove here. The big heart-shaped <b>main cardioid</b> is where the orbit settles to one attracting fixed point (the derivative of \(z^2+c\) at a fixed point \(z^*\) is \(2z^*\), and the orbit is pulled in when \(|2z^*|&lt;1\)). The round <b>period-2 bulb</b> is the disc \(|c+1|&lt;\tfrac14\), where the orbit ends in a 2-cycle. Further bulbs on the cardioid belong to cycles of length 3, 4, 5, and so on. The thin <b>antenna</b> on the left runs along the real axis out to \(-2\), with branches and tiny bulbs along it.</p>

      <h3>Zoom and the edge</h3>
      <p>Zooming in on the edge never makes it smooth. Curls, spirals, and sometimes small copies of the whole set keep appearing at every scale we can compute. The copies are similar to the whole, not exact duplicates, so this is not exact self-similarity. The deeper you zoom, the more steps an orbit may need before it shows its fate, so the step limit has to rise (here by 10 for every doubling, from 60 up to 200). This lesson stops at about 14 levels of zoom to keep the pictures quick; ordinary decimal arithmetic would allow roughly 45 levels before it runs out of digits, and deeper pictures need extra-precision numbers.</p>

      <h3>Julia sets</h3>
      <p>The Mandelbrot picture fixes the start \(z_0=0\) and varies \(c\). A Julia picture does the opposite: it fixes \(c\) and varies the start \(z_0\). The <b>filled Julia set</b> of \(c\) is the set of starting points whose orbit under \(z\mapsto z^2+c\) never escapes. It is the black part of the picture. The <b>Julia set</b> is its edge.</p>
      <p>For \(c=0\) the rule is squaring: the black part is the unit disc and the Julia set is the unit circle. For \(c=-1\) the Julia set is the "basilica", for \(c=i\) a tree-like dendrite. A theorem of Fatou and Julia, from around 1920, says: <b>if \(c\) is in the Mandelbrot set, the Julia set is one connected piece; if \(c\) is outside, it is dust</b> (separate points). We show it by examples, not proof. \(c=0.36+0.1i\) is in the set. \(c=0.285+0.01i\) and \(c=-0.4+0.6i\) are just outside it, so their Julia sets are dust, but dust with fine swirls that look like chains at this size. For \(c=2\): the orbit \(0,2,6,38,\dots\) escapes, so the Julia set is dust.</p>

      <h3>What it means</h3>
      <p>The rule \(z\mapsto z^2+c\) is about as simple as a rule can be, yet the picture has detail at every scale. Computer pictures of the set began around 1980, which is why it was found so late: the formulas are old, but the picture needs millions of steps. The edge is a fractal. Its wiggles are so rich that it behaves like more than a one-dimensional curve; the lesson on fractals, self-similarity and dimension makes that precise. Everything in this lesson is shown by examples and short arguments. The deeper facts (the exact shape of the cardioid, why the Julia rule holds) need more tools.</p>`,
    check: [
      { q: 'In a picture of the Mandelbrot set, a point c is drawn black. What does that mean?',
        choices: [
          'The orbit of 0 under \\(z\\mapsto z^2+c\\) passes \\(|z|=2\\) on the very first step.',
          'The program found no escape for the orbit of 0 within its step limit, so c is treated as being in the set.',
          'The orbit of 0 returns to 0 after a few steps.',
          'c is a real number.'],
        answer: 1,
        why: 'Colours show the step where the orbit first passes \\(|z|=2\\). Black is the one case where that never happens within the step limit. Near the edge a point can escape after the limit, so black means "in the set as far as the program can tell". Only a few special c (centres of bulbs, like \\(c=-1\\)) return exactly to 0, and the real axis is mostly colourless of any meaning here.',
        hint: 'What do the colours measure? Black is what is left over.' },
      { q: 'Take c = −1 + i. Start at z₀ = 0 and use the rule z → z² + c. At which step n is |z_n| first larger than 2?',
        choices: [
          'Step 1',
          'Step 2',
          'Step 3',
          'Never: the size stays at \\(\\sqrt2\\approx1.41\\), as in the first two steps.'],
        answer: 2,
        why: '\\(z_1=-1+i\\) has size \\(\\sqrt2\\approx1.41\\). \\(z_2=(-1+i)^2+(-1+i)=-2i-1+i=-1-i\\), also size \\(\\sqrt2\\). \\(z_3=(-1-i)^2+(-1+i)=2i-1+i=-1+3i\\), size \\(\\sqrt{10}\\approx3.16&gt;2\\). The first two sizes match by accident; the third does not, and from there the orbit escapes.',
        hint: 'Compute z₁, z₂, z₃ one at a time. Remember (a + bi)² = a² − b² + 2abi.' },
      { q: 'Why can we be sure that an orbit with |c| ≤ 2 that has once passed |z| = 2 never comes back?',
        choices: [
          'Because \\(|z_{n+1}|-2&gt;4\\,(|z_n|-2)\\): the distance past 2 more than quadruples at every step.',
          'Because squaring always makes a number bigger.',
          'Because we tried 30 steps for many values of c and none came back.',
          'Because c = −2 shows that orbits can sit exactly on \\(|z|=2\\), so those past 2 sit there too.'],
        answer: 0,
        why: 'Since \\(|z_{n+1}|\\ge|z_n|^2-|c|\\ge|z_n|^2-2\\), we get \\(|z_{n+1}|-2\\ge(|z_n|-2)(|z_n|+2)&gt;4(|z_n|-2)\\). The excess past 2 at least quadruples each step, so it grows forever. Squaring does not always enlarge (a number of size below 1 shrinks), and looking at examples is evidence, not a proof. At \\(c=-2\\) the orbit sits at exactly 2, which is not past 2.',
        hint: 'Look for a statement that works for every orbit past 2, not for examples.' }
    ],
    links: { prereq: ['complex-arithmetic-in-the-plane', 'polar-form-and-roots-of-unity'], related: ['sequences-recursive-and-explicit', 'fractals-self-similarity-and-dimension', 'imaginary-numbers-and-the-complex-plane', 'the-real-number-system', 'quadratics-and-the-parabola', 'exponential-growth'] },

    mount({ stage, controls: C }) {
      const st = { part: 'orbit', cr: .5, ci: 0, n: 0, pred: null, view: { ...DEF_VIEW }, sharp: 1, labels: false, dragging: false, practice: false };
      const panel = stage.nextElementSibling;
      stage.classList.add('split');
      const top = h('div', { class: 'pane' }), bot = h('div', { class: 'pane' });
      stage.append(top, bot);
      let statRaf = 0, sRo, destroyed = false;
      const upd = () => {
        if (destroyed) return;
        PT.requestDraw(); PB.requestDraw();
        if (!statRaf) statRaf = requestAnimationFrame(() => { statRaf = 0; if (sRo) sRo.innerHTML = statTxt(); });
      };
      const rM = mkRenderer(upd), rJ = mkRenderer(upd);
      const PT = new Plane(top, { span: 3 }), PB = new Plane(bot, { span: 3 });
      PT.coordEl && (PT.coordEl.style.display = 'none');
      const cv = PT.canvas;
      cv.tabIndex = 0; cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', 'The complex plane. Drag the ring, or press the arrow keys, to choose the number c. Depending on the part, the picture shows the orbit of c, the Mandelbrot set with a zoom, or the Mandelbrot set above the Julia set for c. The side panel has sliders and buttons that do the same.');
      let prIdx = 0, prSolved = false, prTried = false, prFirst = 0, prDone = 0, prW = [], prFb = '', prOver = false;

      /* the state the picture shows (practice borrows the picture) */
      const eff = () => {
        if (!st.practice) return { part: st.part, cr: st.cr, ci: st.ci, n: st.n, view: st.part === 'zoom' ? st.view : DEF_VIEW, hideC: false };
        const pr = PROBS[prIdx], sh = prSolved ? pr.show : null;
        return sh ? { part: sh.part, cr: sh.cr ?? 0, ci: sh.ci ?? 0, n: sh.n ?? 30, view: sh.view || DEF_VIEW, hideC: sh.part === 'zoom' }
          : { part: 'set', cr: 0, ci: 0, n: 0, view: DEF_VIEW, hideC: true, plain: true };
      };
      const viewHs = (S, p) => hsBase(p.w, p.h) / Math.pow(2, S.view.k);
      const snapStep = () => {
        const S = eff(); if (S.part === 'orbit') return .05;
        if (S.part === 'zoom') { const hs = viewHs(S, PT); return hs >= .2 ? .01 : hs >= .02 ? .001 : hs >= .002 ? .0001 : .00001; }
        return .01;
      };
      const decs = step => step >= .01 ? 2 : Math.round(-Math.log10(step));
      const setC = (r, i) => {
        const S = eff(), stp = snapStep(), lim = S.part === 'zoom' ? 3 : 2.6;
        st.cr = +snap(clamp(r, -lim, lim), stp).toFixed(5); st.ci = +snap(clamp(i, -lim, lim), stp).toFixed(5);
        st.pred = null;
      };

      /* ----- top pane: the orbit plane, or the Mandelbrot picture ----- */
      const layout = S => {
        const one = S.part === 'zoom' || S.plain;
        bot.style.display = one ? 'none' : '';
        top.style.flex = S.part === 'julia' ? '1 1 0' : '11 1 0'; bot.style.flex = S.part === 'julia' ? '1 1 0' : '9 1 0';
      };
      const orbitView = (c, p, S) => {
        const pal = p.pal, fs = clamp(p.scale * .24, 12, 15);
        p.cx = -.4; p.cy = 0; p.span = 2.4;
        p.grid(1);
        const b = p.bounds();
        for (let x = Math.ceil(b.x0); x <= b.x1; x++) if (x) p.label(nf(x), x, 0, { size: fs, italic: false, color: pal.muted, dy: 14 });
        for (let y = Math.ceil(b.y0); y <= b.y1; y++) if (y) p.label(y === 1 ? 'i' : y === -1 ? MI + 'i' : nf(y) + 'i', 0, y, { size: fs, italic: false, color: pal.muted, dx: -9, align: 'right' });
        T(c, 'real axis', p.w - 8, p.Y(0) + 32, { size: fs, color: pal.muted, align: 'right', halo: pal.stage });
        T(c, 'imaginary axis', p.X(0) + 8, 12, { size: fs, color: pal.muted, align: 'left', halo: pal.stage });
        const ring = []; for (let i = 0; i <= 96; i++) ring.push([2 * Math.cos(i / 96 * TAU), 2 * Math.sin(i / 96 * TAU)]);
        p.path(ring, { stroke: pal.violet, width: 2, dash: [7, 6] });
        T(c, '|z| = 2', p.X(1.42) + 6, p.Y(1.42) - 8, { size: fs, color: pal.violet, align: 'left', weight: 700, halo: pal.stage });
        const o = orbit(S.cr, S.ci, 40), n = Math.min(S.n, o.length - 1);
        for (let k = 0; k < n; k++) arrowPx(c, p.X(o[k][0]), p.Y(o[k][1]), p.X(o[k + 1][0]), p.Y(o[k + 1][1]), pal.blue, 2.4);
        const groups = new Map();
        for (let k = 0; k <= n; k++) {
          const key = nf(o[k][0], 5) + ',' + nf(o[k][1], 5); if (!groups.has(key)) groups.set(key, { k: [], z: o[k] }); groups.get(key).k.push(k);
        }
        const placed = [], lastKey = nf(o[n][0], 5) + ',' + nf(o[n][1], 5);
        const order = Array.from(groups.entries()).sort((a, b) => (b[0] === lastKey) - (a[0] === lastKey) || a[1].k[0] - b[1].k[0]);
        order.forEach(([key, g]) => {
          const z = g.z, big = Math.hypot(z[0], z[1]) > 2, px = p.X(z[0]), py = p.Y(z[1]);
          if (px < -20 || px > p.w + 20 || py < -20 || py > p.h + 20) return;
          p.dot(z[0], z[1], 6, g.k[0] === 0 ? pal.yellow : big ? pal.red : pal.blue, pal.stage, 2);
          const names = g.k.slice(0, 3).map(zn); if (g.k.length > 3) names.push('…');
          let txt = names.join(' = '); if (g.k.includes(1)) txt = 'c = ' + txt;
          const ly = py + (g.k[0] % 2 ? 22 : -16), al = px > p.w - 50 ? 'right' : px < 50 ? 'left' : 'center';
          c.font = `700 ${fs}px ${FONT}`; const tw = c.measureText(txt).width, x0 = al === 'right' ? px - tw : al === 'left' ? px : px - tw / 2;
          if (placed.some(r => Math.abs(r[2] - ly) < fs * 1.1 && x0 < r[1] + 4 && x0 + tw > r[0] - 4)) return;
          placed.push([x0, x0 + tw, ly]);
          T(c, txt, px, ly, { size: fs, color: pal.text, weight: 700, halo: pal.stage, align: al });
        });
        if (!S.hideC) {
          p.dot(S.cr, S.ci, 11, null, pal.brass, 3);
        }
        if (n === 0) T(c, 'Press Next step to apply the rule', p.w / 2, p.h - 16, { size: fs, color: pal.muted, halo: pal.stage });
      };
      const mandelView = (c, p, S) => {
        const pal = p.pal, fs = clamp(p.w / 30, 12, 15), hs = viewHs(S, p), cap = capOf(S.view.k), sh = st.sharp;
        p.cx = S.view.x; p.cy = S.view.y; p.span = hs;
        const [bw, bh] = bufSize(p.w, p.h, sh);
        rM.ensure({ kind: 'm', cx: p.cx, cy: p.cy, hs, cap, bw, bh, w: p.w, h: p.h, coarse: false });
        c.imageSmoothingEnabled = true; c.drawImage(rM.off, 0, 0, p.w, p.h);
        /* axes */
        c.strokeStyle = alpha(pal.text, .3); c.lineWidth = 1; c.beginPath();
        if (p.Y(0) > 0 && p.Y(0) < p.h) { c.moveTo(0, p.Y(0)); c.lineTo(p.w, p.Y(0)); }
        if (p.X(0) > 0 && p.X(0) < p.w) { c.moveTo(p.X(0), 0); c.lineTo(p.X(0), p.h); }
        c.stroke();
        if (S.view.k === 0) {
          [-2, -1, 0, 1].forEach(x => p.label(nf(x), x, 0, { size: fs, italic: false, color: pal.text, dy: 13, weight: 700 }));
          [[1, 'i'], [-1, MI + 'i']].forEach(([y, t]) => p.label(t, 0, y, { size: fs, italic: false, color: pal.text, dx: 10, align: 'left' }));
        }
        if (S.part === 'set' && st.labels && !S.plain) {
          p.path([[-2, 0], [.25, 0]], { stroke: pal.violet, width: 4 });
          const lab = (t, x, y, al) => T(c, t, p.X(x), p.Y(y), { size: fs, color: '#fff', weight: 700, halo: 'rgba(8,10,24,.85)', align: al || 'center' });
          lab('main cardioid', -.1, .38); lab('period-2 bulb', -1, .43); lab('antenna', -1.75, .17);
          lab('real axis: −2 to 1/4', -.95, -.2);
        }
        if (!S.hideC) {
          if (S.part === 'set' || S.part === 'zoom') {
            const o = orbit(S.cr, S.ci, 30);
            p.path(o.filter(z => isFinite(z[0])), { stroke: 'rgba(8,10,24,.8)', width: 4.5 });
            p.path(o, { stroke: pal.yellow, width: 2 });
            o.forEach((z, k) => { if (k < 12 || k % 5 === 0) p.dot(z[0], z[1], k === 0 ? 4.5 : 3, pal.yellow, 'rgba(8,10,24,.85)', 1.4); });
          }
          p.dot(S.cr, S.ci, 10, null, pal.brass, 3.2); p.dot(S.cr, S.ci, 3.5, '#fff', 'rgba(8,10,24,.9)', 1.5);
          T(c, 'c', p.X(S.cr) + 16, p.Y(S.ci) - 15, { size: fs * 1.5, color: '#fff', weight: 700, halo: 'rgba(8,10,24,.9)', italic: true });
        }
        if (S.part === 'zoom') {
          T(c, `centre ${cs(S.view.x, S.view.y, 7)}   zoom ×${Math.pow(2, S.view.k)}   step limit ${cap}`, 8, p.h - 12, { size: fs * .95, color: '#fff', weight: 600, halo: 'rgba(8,10,24,.85)', align: 'left' });
        } else {
          T(c, S.part === 'julia' ? 'c-plane: drag c' : 'black = never passes 2 (up to ' + cap + ' steps)', 8, 14, { size: fs * .95, color: '#fff', weight: 600, halo: 'rgba(8,10,24,.85)', align: 'left' });
        }
        if (rM.running) T(c, `drawing ${Math.round(rM.prog * 100)}%`, p.w - 8, 14, { size: fs * .95, color: '#fff', weight: 600, halo: 'rgba(8,10,24,.85)', align: 'right' });
      };
      PT.onDraw = (c, p) => {
        const S = eff(); layout(S);
        if (S.part === 'orbit') orbitView(c, p, S); else mandelView(c, p, S);
      };

      /* ----- bottom pane: |z_n| chart or the Julia picture ----- */
      const chartView = (c, p, S) => {
        const pal = p.pal, fs = clamp(p.w / 30, 12, 14), N = 30, o = orbit(S.cr, S.ci, N), shown = S.part === 'orbit' ? Math.min(S.n, o.length - 1) : o.length - 1;
        const L = 46, R = 26, Tp = 34, B = 34, pw = p.w - L - R, ph = p.h - Tp - B, X = n => L + n / N * pw, Y = v => Tp + ph - Math.min(v, 4.3) / 4.3 * ph;
        T(c, 'Size of the orbit at each step: |z|', 10, 13, { size: fs, color: pal.text, weight: 700, align: 'left' });
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.2; c.beginPath(); c.moveTo(L, Tp); c.lineTo(L, Tp + ph); c.lineTo(L + pw, Tp + ph); c.stroke();
        for (let v = 0; v <= 4; v++) { T(c, String(v), L - 8, Y(v), { size: fs, color: pal.muted, align: 'right' }); if (v) { c.strokeStyle = pal.grid; c.beginPath(); c.moveTo(L, Y(v)); c.lineTo(L + pw, Y(v)); c.stroke(); } }
        for (let n = 0; n <= N; n += 5) T(c, String(n), X(n), Tp + ph + 13, { size: fs, color: pal.muted });
        T(c, 'step n', L + pw / 2, Tp + ph + 27, { size: fs, color: pal.muted });
        c.strokeStyle = pal.violet; c.lineWidth = 2; c.setLineDash([7, 6]); c.beginPath(); c.moveTo(L, Y(2)); c.lineTo(L + pw, Y(2)); c.stroke(); c.setLineDash([]);
        T(c, 'escape line |z| = 2', L + pw - 4, Y(2) - 9, { size: fs, color: pal.violet, weight: 700, align: 'right', halo: pal.stage });
        c.strokeStyle = alpha(pal.blue, .55); c.lineWidth = 1.8; c.beginPath();
        for (let k = 0; k <= shown; k++) { const m = Math.hypot(o[k][0], o[k][1]); k ? c.lineTo(X(k), Y(m)) : c.moveTo(X(k), Y(m)); } c.stroke();
        let clipped = false;
        for (let k = 0; k <= shown; k++) {
          const m = Math.hypot(o[k][0], o[k][1]), big = m > 2;
          p.ctx.beginPath(); c.fillStyle = big ? pal.red : pal.blue; c.strokeStyle = pal.stage; c.lineWidth = 1.6;
          if (m > 4.3) { c.moveTo(X(k), Y(m) - 5); c.lineTo(X(k) - 5, Y(m) + 4); c.lineTo(X(k) + 5, Y(m) + 4); c.closePath(); } else c.arc(X(k), Y(m), 4.2, 0, TAU);
          c.fill(); c.stroke();
          if (m > 4.3 && !clipped) { clipped = true; T(c, `${zn(k)} = ${nf(m, 1)}: off the chart`, X(k) - 10, Y(m) + 16, { size: fs, color: pal.red, weight: 700, align: X(k) > p.w * .6 ? 'right' : 'left', halo: pal.stage }); }
        }
      };
      const juliaView = (c, p, S) => {
        const pal = p.pal, fs = clamp(p.w / 30, 12, 15), hs = hsJ(p.w, p.h), [bw, bh] = bufSize(p.w, p.h, st.sharp);
        p.cx = 0; p.cy = 0; p.span = hs;
        rJ.ensure({ kind: 'j', cx: 0, cy: 0, hs, cap: 120, bw, bh, w: p.w, h: p.h, cr: S.cr, ci: S.ci, coarse: st.dragging });
        c.imageSmoothingEnabled = true; c.drawImage(rJ.off, 0, 0, p.w, p.h);
        c.strokeStyle = alpha(pal.text, .3); c.lineWidth = 1; c.beginPath(); c.moveTo(0, p.Y(0)); c.lineTo(p.w, p.Y(0)); c.moveTo(p.X(0), 0); c.lineTo(p.X(0), p.h); c.stroke();
        const inside = fate(S.cr, S.ci).t !== 'esc';
        const halo = 'rgba(8,10,24,.85)';
        T(c, `Julia set for c = ${cs(S.cr, S.ci, 3)}`, 8, 14, { size: fs, color: '#fff', weight: 700, halo, align: 'left' });
        T(c, inside ? 'c appears to be in the Mandelbrot set: one connected piece' : 'c is outside the Mandelbrot set: dust', 8, 14 + fs * 1.45, { size: fs * .95, color: '#fff', weight: 600, halo, align: 'left' });
        T(c, 'start z₀ here; black = never passes 2', 8, p.h - 12, { size: fs * .92, color: '#fff', weight: 600, halo, align: 'left' });
        if (rJ.running) T(c, `${st.dragging ? 'coarse' : 'drawing ' + Math.round(rJ.prog * 100) + '%'}`, p.w - 8, 14, { size: fs * .95, color: '#fff', weight: 600, halo, align: 'right' });
      };
      PB.onDraw = (c, p) => {
        const S = eff(); if (S.part === 'zoom' || S.plain) return;
        if (S.part === 'julia') juliaView(c, p, S); else chartView(c, p, S);
      };

      /* ----- dragging, pointer and keyboard ----- */
      draggable(PT, { hit: () => (st.practice ? null : 'c'), move: (hd, x, y) => { st.dragging = true; setC(x, y); sync(); } });
      const endDrag = () => { if (st.dragging) { st.dragging = false; sync(); } };
      cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);
      cv.addEventListener('keydown', e => {
        if (st.practice) return;
        const stp = snapStep(), d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
        if (d) { e.preventDefault(); setC(st.cr + d[0] * stp, st.ci + d[1] * stp); sync(); }
        else if (st.part === 'zoom' && (e.key === '+' || e.key === '=')) { e.preventDefault(); zoomTo(st.view.k + 1); }
        else if (st.part === 'zoom' && (e.key === '-' || e.key === '_')) { e.preventDefault(); zoomTo(st.view.k - 1); }
      });

      /* ----- panel helpers ----- */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const qStyle = 'margin:0;font-size:.95rem;line-height:1.5';
      let partBtns, reS, imS, predQ, predRow, predFb, oRo, sRoSet, zRo, jRo, zS, shBtn, labT;
      let startBtn, ptally, pq, pch, pfb, pnext;

      const goPart = k => { st.part = k; st.pred = null; sync(); };
      const preset = (r, i) => () => { st.cr = r; st.ci = i; st.pred = null; if (st.part === 'orbit') st.n = 0; sync(); };

      grp('parts', () => {
        C.title('Choose a part');
        partBtns = C.buttons([['orbit', 'Orbits'], ['set', 'The set'], ['zoom', 'Zoom'], ['julia', 'Julia sets']].map(([k, l]) => ({ label: l, onClick: () => goPart(k) })));
      });
      grp('cs', () => {
        C.title('Choose c = Re + Im · i');
        reS = C.slider({ label: 'Real part of c', min: -2.5, max: 1.5, step: .01, value: .5, format: v => nf(v, 2), onInput: v => { setC(v, st.ci); st.cr = +v.toFixed(2); sync(); } });
        imS = C.slider({ label: 'Imaginary part of c', min: -1.5, max: 1.5, step: .01, value: 0, format: v => nf(v, 2), onInput: v => { setC(st.cr, v); st.ci = +v.toFixed(2); sync(); } });
      });

      grp('orbit', () => {
        C.hint('Drag the ring on the picture, press the arrow keys on it, or use the sliders. Presets:');
        C.buttons([[.5, 0, 'c = 0.5'], [-1, 0, 'c = −1'], [0, 1, 'c = i'], [-2, 0, 'c = −2'], [.2, 0, 'c = 0.2'], [.25, 0, 'c = 0.25']].map(([r, i, l]) => ({ label: l, onClick: preset(r, i) })));
        C.title('Predict, then see');
        predQ = h('p', { style: qStyle }, 'Will the orbit of this c ever pass the line |z| = 2? Choose, then press Next step until you know.');
        predRow = h('div', { class: 'ctl buttons' }); predFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        panel.append(predQ, predRow, predFb);
        C.title('Step through the orbit');
        C.buttons([
          { label: 'Back', onClick: () => { st.n = Math.max(0, st.n - 1); sync(); } },
          { label: 'Next step', primary: true, onClick: () => { const o = orbit(st.cr, st.ci, 30); st.n = Math.min(st.n + 1, 30, o.length - 1); sync(); } },
          { label: 'Run 30 steps', onClick: () => { st.n = Math.min(30, orbit(st.cr, st.ci, 30).length - 1); sync(); } },
          { label: 'Start over', onClick: () => { st.n = 0; sync(); } }]);
        oRo = C.readout();
      });
      grp('set', () => {
        C.hint('Drag c, press the arrow keys on the picture, or use the sliders. Presets:');
        C.buttons([[-1, 0, 'c = −1'], [0, 0, 'c = 0'], [.25, 0, 'c = 0.25'], [-2, 0, 'c = −2'], [.5, 0, 'c = 0.5'], [-.5, .5, 'c = −0.5 + 0.5i']].map(([r, i, l]) => ({ label: l, onClick: preset(r, i) })));
        labT = C.toggle({ label: 'Label the cardioid, the bulb and the real axis', value: false, onChange: v => { st.labels = v; sync(); } });
        sRoSet = C.readout();
      });
      const zoomTo = k => { st.view = { ...st.view, k: clamp(Math.round(k), 0, KMAX) }; sync(); };
      const panBy = (dx, dy) => () => { const hs = viewHs({ view: st.view }, PT); st.view = { ...st.view, x: st.view.x + dx * hs, y: st.view.y + dy * hs }; sync(); };
      const goView = (x, y, k) => () => { st.view = { x, y, k }; st.cr = x; st.ci = y; sync(); };
      grp('zoom', () => {
        C.title('Zoom');
        C.buttons([{ label: 'Zoom in', primary: true, onClick: () => zoomTo(st.view.k + 1) }, { label: 'Zoom out', onClick: () => zoomTo(st.view.k - 1) }]);
        zS = C.slider({ label: 'Zoom level (each level doubles the magnification)', min: 0, max: KMAX, step: 1, value: 0, format: v => `level ${v}, ×${Math.pow(2, v)}`, onInput: v => zoomTo(v) });
        C.title('Move the view');
        C.buttons([{ label: '◀ Left', onClick: panBy(-1, 0) }, { label: 'Right ▶', onClick: panBy(1, 0) }, { label: '▲ Up', onClick: panBy(0, 1) }, { label: '▼ Down', onClick: panBy(0, -1) }]);
        C.buttons([{ label: 'Centre on c', onClick: () => { st.view = { ...st.view, x: st.cr, y: st.ci }; sync(); } }, { label: 'Whole set', onClick: goView(-.5, 0, 0) }]);
        C.title('Places to look');
        C.buttons([
          { label: 'Seahorse valley', onClick: goView(-.75, .1, 5) },
          { label: 'Elephant valley', onClick: goView(.275, 0, 5) },
          { label: 'Mini copy', onClick: goView(-1.768, 0, 5) },
          { label: 'Spiral', onClick: goView(-.7435669, .1314023, 11) }]);
        C.hint('Click or drag on the picture to put c there; its orbit is drawn on top. The step limit is 60 plus 10 for each zoom level, at most 200: it rises automatically so deep pictures still show their detail.');
        zRo = C.readout();
      });
      grp('julia', () => {
        C.hint('Drag c on the top picture, use the arrow keys on it, or use the sliders. Presets:');
        C.buttons([[0, 0, 'c = 0 (circle)'], [-1, 0, 'c = −1 (basilica)'], [-.4, .6, 'c = −0.4 + 0.6i'], [.285, .01, 'c = 0.285 + 0.01i'], [.36, .1, 'c = 0.36 + 0.1i'], [0, 1, 'c = i (dendrite)']].map(([r, i, l]) => ({ label: l, onClick: preset(r, i) })));
        jRo = C.readout();
      });
      grp('stat', () => {
        shBtn = C.buttons([{ label: 'Sharper (4 times as many samples)', onClick: () => { st.sharp = st.sharp === 1 ? 2 : 1; sync(); } }])[0];
        sRo = C.readout();
      });

      /* ----- readouts ----- */
      const orbitReveal = () => { const f = fate(st.cr, st.ci); return f.t === 'esc' ? st.n >= f.n : st.n >= 30; };
      const renderPred = () => {
        predRow.replaceChildren();
        [['Yes, it passes 2', 0], ['No, it stays inside', 1]].forEach(([l, v]) => {
          const b = mkBtn(l, () => { if (st.pred !== null) return; st.pred = v; sync(); });
          if (st.pred !== null) { b.disabled = true; if (st.pred === v) b.classList.add('primary'); }
          predRow.append(b);
        });
        if (st.pred === null) { predFb.innerHTML = ''; return; }
        const f = fate(st.cr, st.ci), esc = f.t === 'esc';
        if (!orbitReveal()) { predFb.innerHTML = 'Prediction locked in. Press Next step and watch the chart below the picture.'; return; }
        const right = (st.pred === 0) === esc;
        predFb.innerHTML = (right ? ok('Good prediction.') : no('Not quite.')) + ' ' + (esc
          ? `The orbit passes 2 at step ${f.n}, and by the argument in The math it cannot come back.`
          : 'After 30 steps it has not passed 2, and a test of 3000 steps found no escape. Careful: a short run can show an escape, but it can never prove that an orbit stays.');
      };
      const orbitRo = () => {
        const o = orbit(st.cr, st.ci, 30), n = Math.min(st.n, o.length - 1), L = [];
        L.push(`${kk('c')} ${cs(st.cr, st.ci)}`);
        const from = Math.max(0, n - 5); if (from > 0) L.push('…');
        for (let k = from; k <= n; k++) L.push(`${kk(zn(k))} ${cs(o[k][0], o[k][1])} &nbsp; |${zn(k)}| = ${nf(Math.hypot(o[k][0], o[k][1]))}`);
        const first = o.findIndex((z, k) => k <= n && Math.hypot(z[0], z[1]) > 2);
        if (first >= 0) L.push(`Past the line: |${zn(first)}| = ${nf(Math.hypot(o[first][0], o[first][1]))} is more than 2.`);
        if (n === 0) L.push('Press Next step to apply the rule once.');
        else if (orbitReveal()) L.push(fateText(st.cr, st.ci));
        if (n === o.length - 1 && o.length - 1 < 30) L.push('The numbers are now too big to draw.');
        return lines(L);
      };
      const regionTxt = (cr, ci) => {
        if (inBulb(cr, ci)) return 'inside the round period-2 bulb: the orbit ends in a 2-cycle';
        if (inCard(cr, ci)) return 'inside the main cardioid: the orbit settles to one fixed point';
        return null;
      };
      const setRo = S => {
        const f = fate(S.cr, S.ci), L = [`${kk('c')} ${cs(S.cr, S.ci)}`];
        if (f.t === 'esc') L.push(`${kk('Colour')} the colour of step ${f.n}: the orbit first passes |z| = 2 at step ${f.n}. c is outside the set.`);
        else L.push(`${kk('Colour')} black: no escape found in 3000 steps, so c is very likely in the set.`);
        L.push(fateText(S.cr, S.ci));
        const rg = regionTxt(S.cr, S.ci); if (rg) L.push('Region: ' + rg + '.');
        if (S.ci === 0) L.push('On the real axis, c is in the set exactly when −2 ≤ c ≤ 0.25.');
        return lines(L);
      };
      const zoomRo = S => {
        const f = fate(S.cr, S.ci), hs = viewHs(S, PT), L = [];
        L.push(`${kk('View')} centre ${cs(S.view.x, S.view.y, 7)}, about ${nf(2 * hs, 6)} across the shorter side`);
        L.push(`${kk('Zoom')} level ${S.view.k}, magnification ×${Math.pow(2, S.view.k)}. Step limit ${capOf(S.view.k)}.`);
        L.push(`${kk('c')} ${cs(S.cr, S.ci, 7)}: ` + (f.t === 'esc' ? `escapes at step ${f.n}` : 'no escape in 3000 steps (black)'));
        if (S.view.k >= 4) L.push('The edge is still rough at this scale. Zoom out and back in to compare.');
        return lines(L);
      };
      const juliaRo = S => {
        const f = fate(S.cr, S.ci), inside = f.t !== 'esc';
        return lines([`${kk('c')} ${cs(S.cr, S.ci)}`,
          inside ? `c appears to be in the Mandelbrot set (no escape in 3000 steps), so its Julia set is <b>one connected piece</b>.`
            : `c is outside the Mandelbrot set (the orbit passes 2 at step ${f.n}), so its Julia set is <b>dust</b>: separate points.`,
          'The black part is the filled-in Julia set; the Julia set is its edge. For c = 0 that is the unit circle.',
          !inside && f.n > 12 ? 'This c is only just outside the set, so the dust is fine and hard to see at this size.' : null]);
      };
      const statTxt = () => {
        const S = eff(), one = r => r.running ? `drawing, ${Math.round(r.prog * 100)}% done` : `drawn in ${Math.round(r.ms)} ms (${r.cfg ? r.cfg.bw + ' × ' + r.cfg.bh : '?'} samples, up to ${r.cfg ? r.cfg.cap : '?'} steps each)`;
        return S.part === 'julia' ? `Mandelbrot picture ${one(rM)}.<br>Julia picture ${one(rJ)}${st.dragging ? ' (coarse while you drag)' : ''}.` : `Picture ${one(rM)}.`;
      };

      /* ----- practice ----- */
      C.title('Practice');
      C.hint('Seven short problems. Nothing here is saved or scored. After each one the picture shows what you just worked out.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { if (st.practice) { st.practice = false; sync(); } else { st.practice = true; if (!prOver) loadProb(); sync(); } } }])[0];
      grp('practice', () => {
        ptally = h('p', { class: 'ctl-title' }); pq = h('p', { style: qStyle }); pch = h('div', { class: 'ctl buttons' });
        pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); pnext = mkBtn('Next problem', () => nextProb(), true);
        panel.append(ptally, pq, pch, pfb, h('div', { class: 'ctl buttons' }, pnext));
      });
      const tally = () => { ptally.textContent = prOver ? `Right on the first try: ${prFirst} of ${PROBS.length}` : `Problem ${prIdx + 1} of ${PROBS.length}. Right on the first try: ${prFirst} of ${prDone} done`; };
      const renderProb = () => {
        const pr = PROBS[prIdx]; pch.replaceChildren();
        if (prOver) return;
        pr.ch.forEach((o, i) => {
          const b = mkBtn(o[0], () => pick(i));
          if (prSolved) { b.disabled = true; if (i === pr.ans) b.classList.add('primary'); } else if (prW.includes(i)) b.disabled = true;
          pch.append(b);
        });
        pfb.innerHTML = prFb; pnext.disabled = !prSolved;
      };
      const loadProb = () => {
        const pr = PROBS[prIdx]; prSolved = false; prTried = false; prW = []; prFb = '';
        pq.textContent = pr.q; pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem'; tally(); renderProb();
      };
      const pick = i => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        if (i === pr.ans) { prSolved = true; if (!prTried) prFirst++; prDone++; prFb = pr.ch[i][1]; }
        else { prTried = true; prW.push(i); prFb = no('Not quite.') + ' ' + pr.ch[i][1] + ' Try another answer.'; }
        sync();
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); sync(); return; }
        prOver = true; prSolved = false; pq.textContent = 'All seven problems are done.'; pch.replaceChildren(); pnext.disabled = true;
        prFb = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        pfb.innerHTML = prFb;
        pch.append(mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; prOver = false; loadProb(); sync(); }, true));
        tally(); sync();
      };

      /* ----- sync ----- */
      const sync = () => {
        const prac = st.practice, part = st.part, S = eff();
        vis(G.parts, !prac); vis(G.cs, !prac && part !== 'zoom'); vis(G.orbit, !prac && part === 'orbit'); vis(G.set, !prac && part === 'set');
        vis(G.zoom, !prac && part === 'zoom'); vis(G.julia, !prac && part === 'julia'); vis(G.stat, !prac && part !== 'orbit'); vis(G.practice, prac);
        partBtns.forEach((b, i) => b.classList.toggle('primary', ['orbit', 'set', 'zoom', 'julia'][i] === part));
        if (!prac) {
          reS.set(clamp(st.cr, -2.5, 1.5)); imS.set(clamp(st.ci, -1.5, 1.5));
          if (part === 'orbit') { renderPred(); oRo.innerHTML = orbitRo(); }
          if (part === 'set') sRoSet.innerHTML = setRo(S);
          if (part === 'zoom') { zS.set(st.view.k); zRo.innerHTML = zoomRo(S); }
          if (part === 'julia') jRo.innerHTML = juliaRo(S);
          labT.checked = st.labels;
          shBtn.textContent = st.sharp === 1 ? 'Sharper (4 times as many samples)' : 'Back to standard sampling';
          sRo.innerHTML = statTxt();
        }
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        if (prac) { tally(); renderProb(); }
        layout(S);
        PT.draw(); PB.draw();
      };

      const apply = patch => {
        st.practice = false;
        if (patch.part !== undefined) st.part = patch.part;
        if (patch.cr !== undefined) st.cr = patch.cr;
        if (patch.ci !== undefined) st.ci = patch.ci;
        if (patch.n !== undefined) st.n = patch.n;
        if (patch.view !== undefined) st.view = { ...patch.view };
        st.pred = null; st.dragging = false;
        sync();
      };
      loadProb(); sync();
      return { destroy: () => { destroyed = true; rM.cancel(); rJ.cancel(); cancelAnimationFrame(statRaf); PT.destroy(); PB.destroy(); }, apply };
    }
  });
}
