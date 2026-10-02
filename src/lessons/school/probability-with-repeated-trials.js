/* =====================================================================
   SCHOOL — Probability with repeated trials
   ===================================================================== */
{
  const pct = v => (v * 100).toFixed(v < .1 || v > .9 ? 1 : 0) + '%';
  const atLeast = (p, k) => 1 - Math.pow(1 - p, k);

  register({
    id: 'probability-with-repeated-trials', level: 'school',
    title: 'Probability with repeated trials',
    blurb: 'Repeat a chance experiment and watch the long-run frequency settle onto the probability.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 5; p.cy = 2.6; p.span = 4;
      p.grid(1, { axes: false });
      p.path([[0, 0], [10, 0]], { stroke: pal['grid-strong'], width: 1.5 }); p.path([[0, 0], [0, 5.2]], { stroke: pal['grid-strong'], width: 1.5 });
      p.path([[0, 2.6], [10, 2.6]], { stroke: pal.muted, width: 1.5, dash: [4, 4] });
      let s = 0, seed = 7; const pts = [];
      for (let i = 1; i <= 120; i++) { seed = (seed * 16807) % 2147483647; s += seed / 2147483647 < .5 ? 1 : 0; pts.push([Math.log10(i) / Math.log10(120) * 10, s / i * 5.2]); }
      p.path(pts, { stroke: pal.blue, width: 2.4 });
    },
    hook: String.raw`A die has a 1 in 6 chance of showing a six. Roll it six times. Are you sure to see at least one six?`,
    steps: [
      { title: 'Flip a coin 30 times',
        text: String.raw`<p>Heads has probability \(0.5\). The top graph shows the fraction of heads so far after each flip. The dashed line is the true probability.</p><p>After only a few flips the blue line jumps around. After 30 it is still far from steady.</p>`,
        set: { p: .5, k: 1, reset: true, runTo: 30 } },
      { title: 'Keep going: 1,000 flips',
        text: String.raw`<p>The horizontal axis is logarithmic, so each tick is ten times more flips. As the number of flips grows, the fraction of heads settles near \(0.5\).</p><p>It never locks in exactly, but the wobble shrinks as the flips pile up.</p>`,
        set: { p: .5, k: 1, reset: true, runTo: 1000 } },
      { title: 'A loaded coin',
        text: String.raw`<p>Now the chance of success is \(0.2\). The same thing happens: the fraction of successes settles near \(0.2\).</p><p>That is what a probability means in practice: the fraction of the time something happens in the long run.</p>`,
        set: { p: .2, k: 1, reset: true, runTo: 600 } },
      { title: 'At least one success',
        text: String.raw`<p>Back to the die: \(p=1/6\). The lower graph shows the chance of at least one six in \(k\) rolls. For \(k=6\) it is \(1-(5/6)^6\approx 66\%\), not 100%.</p><p>The hollow dot is a simulation of 1,000 attempts of 6 rolls each. It lands close to the curve.</p>`,
        set: { p: 1 / 6, k: 6, reset: true, runTo: 300, sim: true } }
    ],
    formal: String.raw`
      <p>If an experiment can succeed with probability \(p\), then after many independent repeats the fraction of successes gets close to \(p\). This is the <em>law of large numbers</em>. The typical size of the wobble after \(n\) trials is about \(\sqrt{p(1-p)/n}\), so to cut it in half you need four times as many trials.</p>
      <h3>Independence</h3>
      <p>Trials are <em>independent</em> if the outcome of one does not change the chances of the next. For independent events,
      \[ P(A\text{ and }B)=P(A)\,P(B). \]
      A coin has no memory: after five heads in a row the next flip is still heads with probability \(\tfrac12\).</p>
      <h3>At least one success in \(k\) tries</h3>
      <p>The only way to get no success is to fail every time, which has probability \((1-p)^k\). So
      \[ P(\text{at least one success}) = 1-(1-p)^k. \]
      For a die and \(k=6\): \(1-(5/6)^6\approx 0.665\). It passes \(\tfrac12\) at \(k=4\) and approaches but never reaches \(1\).</p>
      <h3>Expected count</h3>
      <p>In \(n\) trials you expect about \(np\) successes, though the actual number varies.</p>`,
    check: [
      { q: 'A fair coin lands heads five times in a row. What is the probability the next flip is heads?',
        choices: ['Less than 1/2, tails is due', 'Exactly 1/2', 'More than 1/2, heads is hot', 'It cannot be known'], answer: 1,
        why: String.raw`Flips are independent. The coin does not remember the past, so the probability is still \(1/2\).`,
        hint: 'Does the coin know what it did before?' },
      { q: 'You roll a fair die 3 times. What is the chance of at least one six?',
        choices: ['50%', '42%', '17%', '58%'], answer: 1,
        why: String.raw`No six in three rolls has probability \((5/6)^3=125/216\approx 0.58\). So at least one six has probability \(1-0.58\approx 0.42\).`,
        hint: 'Find the chance of no six at all first, then subtract from 1.' }
    ],
    links: { prereq: ['exponential-growth', 'mean-median-and-spread'], next: ['pascals-triangle-and-the-galton-board'] },

    mount({ stage, controls: C }) {
      const st = { p: .5, k: 1 };
      let cum = [], sim = null, cancel = () => {};
      stage.classList.add('split');
      const top = h('div', { class: 'pane', style: 'flex: 1 1 0' }), bot = h('div', { class: 'pane', style: 'flex: 1 1 0' });
      stage.append(top, bot);
      const P1 = new Plane(top, { span: 4 }), P2 = new Plane(bot, { span: 4 });
      const addTrials = n => { for (let i = 0; i < n; i++) cum.push((cum.length ? cum[cum.length - 1] : 0) + (Math.random() < st.p ? 1 : 0)); };
      const clearAll = () => { cum = []; sim = null; };
      const runSim = () => {
        let hit = 0; const N = 1000;
        for (let i = 0; i < N; i++) { let ok = false; for (let j = 0; j < st.k && !ok; j++) ok = Math.random() < st.p; hit += ok ? 1 : 0; }
        sim = { p: st.p, k: st.k, frac: hit / N };
      };

      P1.onDraw = (c, p) => {
        const pal = p.pal, n = cum.length, W = 10, H = 5;
        p.fit(W, H, { l: 1.6, r: .8, t: .9, b: 1.7 });
        const Nmax = n <= 100 ? 100 : n <= 1000 ? 1000 : n <= 10000 ? 10000 : 100000, L = Math.log10(Nmax), ux = i => Math.log10(Math.max(i, 1)) / L * W;
        const fs = clamp(p.scale * .3, 12, 15);
        for (let v = 0; v <= 1.001; v += .25) {
          p.path([[0, v * H], [W, v * H]], { stroke: pal.grid, width: 1.5 });
          p.label(String(v), 0, v * H, { size: fs + 2, italic: false, color: pal.muted, align: 'right', dx: -10 });
        }
        for (let e = 0; e <= L + .001; e++) {
          p.path([[ux(Math.pow(10, e)), 0], [ux(Math.pow(10, e)), H]], { stroke: pal.grid, width: 1.5 });
          p.label(Math.pow(10, e).toLocaleString('en'), ux(Math.pow(10, e)), 0, { size: fs + 2, italic: false, color: pal.muted, dy: 16 });
        }
        p.path([[0, 0], [W, 0]], { stroke: pal['grid-strong'], width: 2 }); p.path([[0, 0], [0, H]], { stroke: pal['grid-strong'], width: 2 });
        p.path([[0, st.p * H], [W, st.p * H]], { stroke: pal.text, width: 2, dash: [8, 6] });
        p.label('p = ' + num(st.p), W, st.p * H, { size: fs + 3, italic: false, align: 'right', dy: st.p > .5 ? 16 : -16 });
        p.label('fraction of successes so far', 0, H, { size: fs + 2, italic: false, color: pal.muted, align: 'left', dy: -16 });
        p.label('number of trials (log scale)', W, 0, { size: fs + 2, italic: false, color: pal.muted, align: 'right', dy: 36 });
        if (n) {
          const stride = Math.max(1, Math.floor(n / 700)), pts = [];
          for (let i = 1; i <= n; i += stride) pts.push([ux(i), cum[i - 1] / i * H]);
          pts.push([ux(n), cum[n - 1] / n * H]);
          p.path(pts, { stroke: pal.blue, width: 3 });
          p.dot(ux(n), cum[n - 1] / n * H, 6, pal.blue, pal.stage, 2);
        }
      };

      P2.onDraw = (c, p) => {
        const pal = p.pal, W = 10, H = 5, K = 20, ux = k => k / K * W, vy = v => v * H;
        p.fit(W, H, { l: 1.6, r: .8, t: .9, b: 1.7 });
        const fs = clamp(p.scale * .3, 12, 15);
        for (let v = 0; v <= 1.001; v += .25) {
          p.path([[0, vy(v)], [W, vy(v)]], { stroke: pal.grid, width: 1.5 });
          p.label(String(v), 0, vy(v), { size: fs + 2, italic: false, color: pal.muted, align: 'right', dx: -10 });
        }
        for (let k = 0; k <= K; k += 2) {
          p.path([[ux(k), 0], [ux(k), H]], { stroke: pal.grid, width: 1.5 });
          p.label(String(k), ux(k), 0, { size: fs + 2, italic: false, color: pal.muted, dy: 16 });
        }
        p.path([[0, 0], [W, 0]], { stroke: pal['grid-strong'], width: 2 }); p.path([[0, 0], [0, H]], { stroke: pal['grid-strong'], width: 2 });
        p.label('chance of at least one success in k tries', 0, H, { size: fs + 2, italic: false, color: pal.muted, align: 'left', dy: -16 });
        p.label('tries k', W, 0, { size: fs + 2, italic: false, color: pal.muted, align: 'right', dy: 36 });
        const pts = []; for (let i = 0; i <= 200; i++) { const k = K * i / 200; pts.push([ux(k), vy(atLeast(st.p, k))]); }
        p.path(pts, { stroke: pal.blue, width: 3 });
        for (let k = 1; k <= K; k++) p.dot(ux(k), vy(atLeast(st.p, k)), 3.5, pal.blue);
        const y = vy(atLeast(st.p, st.k));
        p.path([[ux(st.k), 0], [ux(st.k), y], [0, y]], { stroke: pal['grid-strong'], width: 1.5, dash: [5, 6] });
        p.dot(ux(st.k), y, 8, pal.blue, pal.stage, 2.5);
        p.label(pct(atLeast(st.p, st.k)), ux(st.k), y, { size: fs + 4, italic: false, color: pal.blue, dx: 14, dy: y > H * .8 ? 18 : -16, align: 'left' });
        if (sim && sim.p === st.p && sim.k === st.k) {
          p.dot(ux(st.k), vy(sim.frac), 9, null, pal.red, 3);
          p.label('simulated ' + pct(sim.frac), ux(st.k), vy(sim.frac), { size: fs + 2, italic: false, color: pal.red, dx: 14, dy: y > H * .8 ? 36 : 18, align: 'left' });
        }
      };

      const upd = () => {
        const n = cum.length, s = n ? cum[n - 1] : 0;
        ro.innerHTML = `<span class="k">Trials</span> ${n.toLocaleString('en')} &nbsp; <span class="k">Successes</span> ${s.toLocaleString('en')}<br>` +
          `<span class="k">Fraction</span> ${n ? (s / n).toFixed(3) : '–'} <span class="k">(p = ${num(st.p)})</span><br>` +
          `<span class="k">At least one in ${st.k}</span> ${(atLeast(st.p, st.k) * 100).toFixed(1)}%` + (sim && sim.p === st.p && sim.k === st.k ? ` <span class="k">(sim ${(sim.frac * 100).toFixed(1)}%)</span>` : '');
      };
      const draw = () => { P1.draw(); P2.draw(); upd(); };
      const sync = () => { pS.set(st.p); kS.set(st.k); draw(); };
      const stop = () => { cancel(); cancel = () => {}; };

      C.title('Experiment');
      const pS = C.slider({ label: 'Probability of success p', min: .05, max: .95, step: .01, value: st.p, format: v => num(v),
        onInput: v => { stop(); st.p = v; clearAll(); draw(); } });
      C.buttons([
        { label: '+10 trials', primary: true, onClick: () => { stop(); addTrials(10); draw(); } },
        { label: '+100', onClick: () => { stop(); addTrials(100); draw(); } },
        { label: '+1,000', onClick: () => { stop(); addTrials(1000); draw(); } },
        { label: 'Reset', onClick: () => { stop(); clearAll(); draw(); } }
      ]);
      C.title('At least one success');
      const kS = C.slider({ label: 'Tries k', min: 1, max: 20, step: 1, value: st.k, format: v => String(Math.round(v)),
        onInput: v => { stop(); st.k = v; draw(); } });
      C.buttons([{ label: 'Simulate 1,000 attempts', onClick: () => { stop(); runSim(); draw(); } }]);
      const ro = C.readout(); upd();

      const apply = (patch, immediate) => {
        stop();
        if (patch.p !== undefined) st.p = patch.p;
        if (patch.k !== undefined) st.k = patch.k;
        if (patch.reset) clearAll();
        const to = patch.runTo || cum.length, from = cum.length;
        const finish = () => { if (patch.sim) runSim(); sync(); };
        if (immediate || reduceMotion || to <= from) { addTrials(Math.max(0, to - from)); finish(); return; }
        /* log-time ramp: the count grows by a constant factor per frame, matching the log axis */
        cancel = tween(1800, q => { const target = Math.floor(Math.pow(to, q)); if (target > cum.length) addTrials(target - cum.length); sync(); }, () => { if (cum.length < to) addTrials(to - cum.length); finish(); });
      };
      return { destroy: () => { stop(); P1.destroy(); P2.destroy(); }, apply };
    }
  });
}
