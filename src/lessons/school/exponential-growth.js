/* =====================================================================
   SCHOOL — Exponential growth
   ===================================================================== */
{
  const compact = v => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: v < 10 ? 2 : 1 }).format(v);
  const niceStep = v => { const e = Math.pow(10, Math.floor(Math.log10(v))), f = v / e; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * e; };
  const pct = v => (v < 0 ? '−' : '+') + Math.round(Math.abs(v) * 100) + '%';
  const amt = v => v >= 1e9 ? compact(v) : Number(v.toFixed(v < 100 ? 2 : 0)).toLocaleString('en');

  register({
    id: 'exponential-growth', level: 'school',
    title: 'Exponential growth',
    blurb: 'Compare adding with multiplying, and see why a small growth rate eventually wins.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 5; p.cy = 3; p.span = 4.2;
      p.grid(1, { axes: false });
      p.path([[0, 0], [10, 0]], { stroke: pal['grid-strong'], width: 1.5 }); p.path([[0, 0], [0, 6.2]], { stroke: pal['grid-strong'], width: 1.5 });
      p.path([[0, .4], [10, 3.2]], { stroke: pal.red, width: 2.4 });
      const pts = []; for (let t = 0; t <= 10; t += .2) pts.push([t, .4 * Math.pow(1.36, t)]);
      p.curve(pts, { stroke: pal.blue, width: 2.8 });
    },
    hook: String.raw`One germ splits in two every hour. For the first few hours there is nothing to worry about, and then suddenly there is no room left. Why?`,
    steps: [
      { title: 'Adding versus multiplying',
        text: String.raw`<p>Start with \(1\). The <b>red</b> line <em>adds</em> \(1\) each period: \(1, 2, 3, 4\ldots\). The <b>blue</b> curve <em>doubles</em> each period: \(1, 2, 4, 8\ldots\).</p><p>After 6 periods: \(7\) against \(64\). Drag <b>Time</b> to read off values.</p>`,
        set: { p0: 1, r: 1, T: 6, t: 6, showLin: true } },
      { title: 'Let it run',
        text: String.raw`<p>Stretch the timeline to 20 periods. Doubling reaches \(1{,}048{,}576\). Adding \(1\) a period reaches \(21\).</p><p>The red line is now flat against the axis. Nothing about the rule changed, only how long we waited.</p>`,
        set: { p0: 1, r: 1, T: 20, t: 20, showLin: true } },
      { title: 'Even 10% wins',
        text: String.raw`<p>Start at \(100\) and grow \(10\%\) each period. The line adds \(10\) a period.</p><p>For a while the line keeps up. After 30 periods the curve is near \(1{,}745\) and the line is at \(400\). The doubling time here is about 7 periods.</p>`,
        set: { p0: 100, r: .1, T: 30, t: 30, showLin: true } },
      { title: 'Negative rates: decay',
        text: String.raw`<p>Now lose \(30\%\) each period. The amount keeps shrinking by the same <em>fraction</em>, so it falls fast at first, then slowly, and never reaches \(0\).</p><p>The line adds \(-30\) each period, so it hits \(0\) at period 3.3 and would go negative. Real quantities like this follow the curve.</p>`,
        set: { p0: 100, r: -.3, T: 15, t: 15, showLin: true } }
    ],
    formal: String.raw`
      <p>A quantity grows <em>linearly</em> if it gains the same <em>amount</em> each period, and <em>exponentially</em> if it gains the same <em>fraction</em> each period.
      With start value \(P_0\) and growth rate \(r\) per period:
      \[ \text{linear: } L(t)=P_0(1+rt), \qquad \text{exponential: } P(t)=P_0(1+r)^t. \]</p>
      <h3>The growth factor</h3>
      <p>Write \(b=1+r\). Each period multiplies the amount by \(b\), so \(P(t+1)/P(t)=b\) for every \(t\). Growth has \(b>1\). Decay has \(0<b<1\). A rate of \(-30\%\) means \(b=0.7\).</p>
      <h3>Doubling time and half-life</h3>
      <p>Solving \(P_0 b^t = 2P_0\) gives
      \[ t_{\text{double}} = \frac{\ln 2}{\ln(1+r)} \approx \frac{70}{100\,r}, \]
      the "rule of 70". At \(r=10\%\) that is about \(7\) periods. For decay the same idea gives the half-life \(\ln(1/2)/\ln b\).</p>
      <h3>Why exponentials always win</h3>
      <p>Any exponential with \(b>1\) eventually passes any straight line, however steep. A line adds a fixed amount, but the exponential adds an amount that is itself growing.</p>
      <h3>Compound interest</h3>
      <p>Money earning interest rate \(r\) per year is exactly this: after \(t\) years \(\$P_0\) becomes \(P_0(1+r)^t\).</p>`,
    check: [
      { q: String.raw`\(\$200\) earns \(5\%\) interest per year, compounded yearly. How much is it worth after 2 years?`,
        choices: ['$220.00', '$220.50', '$210.00', '$222.00'], answer: 1,
        why: String.raw`Each year multiplies by \(1.05\): \(200\times1.05^2 = 200\times1.1025 = 220.50\). Adding \(5\%\) of \(200\) twice would give only \(220\).`,
        hint: String.raw`The second year's interest is earned on the new, larger amount.` },
      { q: 'A quantity shrinks by 20% each period. Which formula gives its value after t periods?',
        choices: [String.raw`\(P_0(0.2)^t\)`, String.raw`\(P_0(0.8)^t\)`, String.raw`\(P_0-0.2t\)`, String.raw`\(P_0(1.2)^t\)`], answer: 1,
        why: String.raw`Losing \(20\%\) leaves \(80\%\), so each period multiplies by \(0.8\).`,
        hint: 'What fraction of the amount is left after one period?' }
    ],
    links: { prereq: ['slope-and-linear-functions'], next: ['probability-with-repeated-trials'], related: ['functions-as-transformations', 'derivatives-as-tangent-slopes'] },

    mount({ stage, controls: C }) {
      const st = { p0: 1, r: 1, T: 6, t: 6 };
      let cancel = () => {}, showLin = true;
      const P = new Plane(stage, { span: 5 });
      const E = t => st.p0 * Math.pow(1 + st.r, t), L = t => st.p0 * (1 + st.r * t);
      const W = 10, H = 6.2;

      P.onDraw = (c, p) => {
        const pal = p.pal, T = Math.max(st.T, 1), tm = Math.min(st.t, T);
        const ymax = Math.max(E(0), E(T), showLin ? Math.max(L(0), L(T)) : 0), top = ymax * 1.08;
        const ux = t => t / T * W, vy = v => v / top * H;
        const sc = Math.min(p.w / (W + 2.6), p.h / (H + 2.2));
        p.span = Math.min(p.w, p.h) / (2 * sc); p.cx = W / 2 - .5; p.cy = H / 2 - .05;
        const fs = clamp(sc * .3, 12, 15);

        const vs = niceStep(top / 5), ts = T <= 12 ? 1 : T <= 24 ? 2 : 5;
        for (let v = 0; v <= top + 1e-9; v += vs) {
          p.path([[0, vy(v)], [W, vy(v)]], { stroke: pal.grid, width: 1.5 });
          p.label(compact(v), 0, vy(v), { size: fs + 2, italic: false, color: pal.muted, align: 'right', dx: -10 });
        }
        for (let t = 0; t <= T + 1e-9; t += ts) {
          p.path([[ux(t), 0], [ux(t), H]], { stroke: pal.grid, width: 1.5 });
          p.label(String(Math.round(t)), ux(t), 0, { size: fs + 2, italic: false, color: pal.muted, dy: 16 });
        }
        p.path([[0, 0], [W, 0]], { stroke: pal['grid-strong'], width: 2 }); p.path([[0, 0], [0, H]], { stroke: pal['grid-strong'], width: 2 });
        p.label('time t', W, 0, { size: fs + 3, italic: false, color: pal.muted, align: 'right', dy: 36 });
        p.label('amount', 0, H, { size: fs + 3, italic: false, color: pal.muted, align: 'left', dy: -16 });

        const N = 240, ec = [], lc = [], tl = st.r < 0 ? Math.min(T, -1 / st.r) : T;
        for (let i = 0; i <= N; i++) { const t = T * i / N; ec.push([ux(t), vy(E(t))]); if (t <= tl) lc.push([ux(t), vy(Math.max(L(t), 0))]); }
        if (showLin) p.path(lc, { stroke: pal.red, width: 3.5 });
        p.path(ec, { stroke: pal.blue, width: 3.5 });

        const ey = vy(E(tm)), ly = vy(L(tm)), showL = showLin && tm <= tl;
        p.path([[ux(tm), 0], [ux(tm), Math.max(ey, showL ? ly : 0)]], { stroke: pal['grid-strong'], width: 1.5, dash: [5, 6] });
        if (showL) { p.dot(ux(tm), ly, 7, pal.red, pal.stage, 2); p.label(compact(L(tm)), ux(tm), ly, { size: fs + 3, italic: false, color: pal.red, align: 'right', dx: -12, dy: 14 }); }
        p.dot(ux(tm), ey, 7, pal.blue, pal.stage, 2); p.label(compact(E(tm)), ux(tm), ey, { size: fs + 3, italic: false, color: pal.blue, align: 'right', dx: -12, dy: -14 });
        p.label('exponential: multiply by ' + num(1 + st.r) + ' each period', .3, H - .1, { size: fs + 3, italic: false, color: pal.blue, align: 'left' });
        if (showLin) p.label('linear: add ' + amt(st.p0 * st.r) + ' each period', .3, H - .65, { size: fs + 3, italic: false, color: pal.red, align: 'left' });
      };

      const upd = () => {
        const tm = Math.min(st.t, st.T), r = st.r;
        let extra = '';
        const per = v => num(v) + (Math.abs(v - 1) < .005 ? ' period' : ' periods');
        if (r > 0) extra = `<br><span class="k">Doubling time</span> ${per(Math.log(2) / Math.log(1 + r))}`;
        else if (r < 0) extra = `<br><span class="k">Half-life</span> ${per(Math.log(.5) / Math.log(1 + r))}`;
        ro.innerHTML = `<span class="k">At t =</span> ${num(tm)}<br><span class="k">Exponential</span> ${amt(E(tm))}` +
          (showLin ? `<br><span class="k">Linear</span> ${amt(Math.max(L(tm), 0))}${L(tm) < 0 ? ' (would be negative)' : ''}` : '') + extra;
      };
      const sync = () => { [p0S, rS, TS, tS].forEach((s, i) => s.set(st[['p0', 'r', 'T', 't'][i]])); P.draw(); upd(); };
      const edit = key => v => {
        cancel(); st[key] = key === 'r' ? Math.round(v * 100) / 100 : v;
        if (st.t > st.T) { st.t = st.T; tS.set(st.t); }
        P.requestDraw(); upd();
      };

      C.title('Amount');
      const p0S = C.slider({ label: 'Start amount', min: 1, max: 500, step: 1, value: st.p0, format: v => String(Math.round(v)), onInput: edit('p0') });
      const rS = C.slider({ label: 'Growth per period', min: -.5, max: 1, step: .05, value: st.r, format: pct, onInput: edit('r') });
      C.title('Time');
      const TS = C.slider({ label: 'Periods shown', min: 5, max: 30, step: 1, value: st.T, format: v => String(Math.round(v)), onInput: edit('T') });
      const tS = C.slider({ label: 'Read at time t', min: 0, max: 30, step: .1, value: st.t, format: v => v.toFixed(1), onInput: edit('t') });
      const linT = C.toggle({ label: 'Compare with linear growth', value: true, onChange: v => { showLin = v; P.draw(); upd(); } });
      C.buttons([
        { label: 'Doubling', onClick: () => apply({ p0: 1, r: 1, T: 10, t: 10 }) },
        { label: '10% growth', onClick: () => apply({ p0: 100, r: .1, T: 30, t: 30 }) },
        { label: '30% decay', onClick: () => apply({ p0: 100, r: -.3, T: 15, t: 15 }) }
      ]);
      const ro = C.readout(); upd();

      function apply(patch, immediate) {
        cancel();
        const { showLin: sl, ...rest } = patch;
        if (sl !== undefined) { showLin = sl; linT.checked = sl; }
        if (immediate) { Object.assign(st, rest); sync(); } else cancel = animateTo(st, rest, 1100, sync);
      }
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
