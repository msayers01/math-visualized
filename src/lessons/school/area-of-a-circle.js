/* =====================================================================
   SCHOOL — Area of a circle
   ===================================================================== */
register({
  id: 'area-of-a-circle', level: 'school',
  title: 'Area of a circle',
  blurb: 'Cut a circle into slices, interlock them, and watch a rectangle appear.',
  thumb(c, p) {
    const pal = p.pal, n = 12, a = TAU / n, r = 1.4; p.cx = 0; p.cy = 0; p.span = 2.2;
    for (let k = 0; k < n; k++) {
      const pts = [[0, 0]]; for (let i = 0; i <= 6; i++) { const th = (k + i / 6) * a; pts.push([r * Math.cos(th), r * Math.sin(th)]); }
      p.path(pts, { fill: alpha(k % 2 ? pal.yellow : pal.blue, .5), stroke: pal.stage, width: 1.5, close: true });
    }
  },
  hook: String.raw`A circle has no straight edges. How can we measure the space inside it using nothing but a rectangle?`,
  steps: [
    { title: 'Cut it into slices',
      text: String.raw`<p>Cut the circle of radius \(r\) into \(8\) equal slices, like a pizza. Colors alternate so you can follow them.</p><p>Each slice has two straight sides of length \(r\) and a curved edge. Nothing has been removed.</p>`,
      set: { n: 8, t: 0, r: 2 } },
    { title: 'Interlock the slices',
      text: String.raw`<p>Turn every other slice upside down and fit them together. The result is a bumpy, lopsided rectangle, but it is made of exactly the same pieces.</p><p>So its area equals the circle's area.</p>`,
      set: { n: 8, t: 1, r: 2 } },
    { title: 'Cut thinner',
      text: String.raw`<p>With \(32\) slices the bumps are much smaller, and the long edges look almost straight.</p><p>The thinner the slices, the closer the shape gets to a true rectangle.</p>`,
      set: { n: 32, t: 1, r: 2 } },
    { title: 'Read off the sides',
      text: String.raw`<p>The height is a slice's length: \(r\). The long side is made of half the slices' curved edges, so it is half the circumference: \(\tfrac12\cdot 2\pi r=\pi r\).</p><p>Area = width × height \(=\pi r\cdot r=\pi r^2\).</p>`,
      set: { n: 64, t: 1, r: 2 } }
  ],
  formal: String.raw`
    <p><b>Theorem.</b> A circle of radius \(r\) has area
    \[ A = \pi r^2. \]</p>
    <h3>Where \(\pi\) comes from</h3>
    <p>\(\pi\) is defined as the ratio of any circle's circumference to its diameter, so the circumference is \(C=2\pi r\).</p>
    <h3>The rearrangement argument</h3>
    <p>Cut the disk into \(n\) equal sectors (\(n\) even) and interlock them as in the picture. Each sector has radius \(r\), and the curved edges of half of them lie along the top while the other half lie along the bottom. Each long side therefore has length close to \(\tfrac12 C=\pi r\), and the height is close to \(r\). Rearranging does not change area, so
    \[ A \approx \pi r \cdot r = \pi r^2, \]
    and the approximation becomes exact as \(n\to\infty\).</p>
    <h3>How close is the rectangle?</h3>
    <p>The base of the shape is exactly \(n\,r\sin(\pi/n)\). Dividing by \(r\) gives \(n\sin(\pi/n)\), which is \(2.83\) for \(n=4\), \(3.06\) for \(n=8\), and \(3.14\) for \(n=64\). These numbers approach \(\pi\).</p>
    <h3>Scaling</h3>
    <p>Because \(A\) has \(r^2\) in it, doubling the radius makes the area \(4\) times as large, not \(2\) times.</p>`,
  check: [
    { q: 'A circle has its radius doubled. What happens to its area?',
      choices: ['It doubles', 'It becomes 3 times as large', 'It becomes 4 times as large', 'It becomes 8 times as large'], answer: 2,
      why: String.raw`\(A=\pi r^2\). Replacing \(r\) by \(2r\) gives \(\pi(2r)^2 = 4\pi r^2\), which is \(4\) times as large.`,
      hint: String.raw`Area uses \(r^2\), so a factor of \(2\) in \(r\) is squared.` },
    { q: String.raw`What is the area of a circle of radius \(5\), to the nearest whole number?`,
      choices: ['31', '79', '157', '25'], answer: 1,
      why: String.raw`\(A=\pi\cdot 5^2 = 25\pi \approx 78.5\), which rounds to \(79\). (\(31\) is the circumference \(10\pi\) and \(157\) is \(50\pi\).)`,
      hint: String.raw`Use \(A=\pi r^2\), not \(2\pi r\).` }
  ],
  links: { prereq: ['pythagorean-theorem'], next: ['similarity-and-scaling'], related: ['riemann-sums-and-the-integral', 'inscribed-angles'] },

  mount({ stage, controls: C }) {
    const st = { n: 8, t: 0, r: 2 };
    let cancel = () => {};
    const P = new Plane(stage, { span: 4.7 });
    const wrap = x => Math.atan2(Math.sin(x), Math.cos(x));

    P.onDraw = (c, p) => {
      const pal = p.pal, { n, r, t } = st, a = TAU / n, chord = 2 * r * Math.sin(a / 2), m = Math.max(3, Math.ceil(24 / n * 2));
      for (let k = 0; k < n; k++) {
        const up = k % 2 === 0, cdir = (k + .5) * a, rot = wrap((up ? Math.PI / 2 : -Math.PI / 2) - cdir);
        const ax = (k - (n - 1) / 2) * chord / 2, ay = -r / 2 + (up ? 0 : r * Math.cos(a / 2));
        const e = ease(clamp((t - k / n * .35) / .65, 0, 1)), th = rot * e, cs = Math.cos(th), sn = Math.sin(th), px = ax * e, py = ay * e;
        const pts = [[px, py]];
        for (let i = 0; i <= m; i++) {
          const phi = (k + i / m) * a, x = r * Math.cos(phi), y = r * Math.sin(phi);
          pts.push([px + x * cs - y * sn, py + x * sn + y * cs]);
        }
        p.path(pts, { fill: alpha(k % 2 ? pal.yellow : pal.blue, .5), stroke: alpha(pal.text, .55), width: 1.4, close: true });
      }
      const fs = clamp(p.scale * .5, 16, 26), fin = clamp((t - .75) * 4, 0, 1), fout = 1 - clamp(t * 4, 0, 1);
      if (fout > .01) {
        c.globalAlpha = fout; p.path([[0, 0], [r, 0]], { stroke: pal.text, width: 2.5 }); c.globalAlpha = 1;
        p.label('r', r / 2, 0, { size: fs, alpha: fout, dy: -16 });
      }
      if (fin > .01) {
        const w = Math.PI * r, yb = -r / 2 - r * .35, xr = w / 2 + r * .35;
        c.globalAlpha = fin;
        p.path([[-w / 2, yb], [w / 2, yb]], { stroke: pal.text, width: 2 });
        p.path([[-w / 2, yb - .08], [-w / 2, yb + .08]], { stroke: pal.text, width: 2 }); p.path([[w / 2, yb - .08], [w / 2, yb + .08]], { stroke: pal.text, width: 2 });
        p.path([[xr, -r / 2], [xr, r / 2]], { stroke: pal.text, width: 2 });
        p.path([[xr - .08, -r / 2], [xr + .08, -r / 2]], { stroke: pal.text, width: 2 }); p.path([[xr - .08, r / 2], [xr + .08, r / 2]], { stroke: pal.text, width: 2 });
        c.globalAlpha = 1;
        p.label('πr', 0, yb, { size: fs * 1.1, alpha: fin, dy: 22 });
        p.label('r', xr, 0, { size: fs, alpha: fin, align: 'left', dx: 12 });
      }
    };

    const upd = () => {
      const { n, r } = st, ratio = n * Math.sin(Math.PI / n);
      ro.innerHTML = `<span class="k">Slices</span> n = ${n}<br><span class="k">Base ÷ r</span> = n·sin(π/n) = ${ratio.toFixed(4)}<br>` +
        `<span class="k">π</span> = ${Math.PI.toFixed(4)}<br><span class="k">Area</span> πr² = ${(Math.PI * r * r).toFixed(2)} (r = ${r.toFixed(1)})`;
    };
    const setBtn = () => { play.textContent = st.t > .5 ? 'Put them back' : 'Rearrange slices'; };
    const sync = () => { nS.set(st.n); rS.set(st.r); tS.set(st.t); P.draw(); upd(); setBtn(); };

    C.title('Circle');
    const nS = C.slider({ label: 'Slices', min: 4, max: 64, step: 2, value: st.n, format: v => String(Math.round(v)),
      onInput: v => { cancel(); st.n = v; P.requestDraw(); upd(); } });
    const rS = C.slider({ label: 'Radius r', min: 1, max: 2.5, step: .1, value: st.r, format: v => v.toFixed(1),
      onInput: v => { cancel(); st.r = v; P.requestDraw(); upd(); } });
    C.title('Rearrangement');
    const tS = C.slider({ label: 'Progress', min: 0, max: 1, step: .001, value: st.t, format: v => Math.round(v * 100) + '%',
      onInput: v => { cancel(); st.t = v; setBtn(); P.requestDraw(); } });
    const [play] = C.buttons([{ label: 'Rearrange slices', primary: true, onClick: () => {
      cancel(); const from = st.t, to = st.t < .5 ? 1 : 0;
      cancel = tween(2600 * Math.abs(to - from), q => { st.t = lerp(from, to, q); tS.set(st.t); P.draw(); }, setBtn);
    } }]);
    const ro = C.readout(); upd();

    const apply = (patch, immediate) => {
      cancel();
      const { n, ...rest } = patch;
      if (n !== undefined) st.n = n;  /* slice count is an integer: change it at once, animate the rest */
      if (immediate) { Object.assign(st, rest); sync(); } else cancel = animateTo(st, rest, 1100, sync);
    };
    return { destroy: () => { cancel(); P.destroy(); }, apply };
  }
});
