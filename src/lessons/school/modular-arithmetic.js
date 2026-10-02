/* =====================================================================
   SCHOOL — Modular arithmetic and clocks
   ===================================================================== */
{
  /* ---------- small helpers ---------- */
  const MINUS = '−';
  const mod = (a, n) => ((a % n) + n) % n;
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a; };
  const sg = v => (v < 0 ? MINUS + (-v) : String(v));
  const par = v => (v < 0 ? '(' + sg(v) + ')' : String(v));
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const isPrime = n => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
  const rnd = seed => { let x = (Math.imul(seed + 7, 1103515245) + 12345) & 0x7fffffff; x = (Math.imul(x, 1103515245) + 12345) & 0x7fffffff; return x / 0x7fffffff; };
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const D3 = DAYS.map(d => d.slice(0, 3));
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const caesar = (w, k) => [...w].map(ch => ABC[mod(ABC.indexOf(ch) + k, 26)]).join('');
  const listJoin = a => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);

  /* the remainder story for a whole number v and a clock of n positions */
  const reduceText = (v, n) => {
    const t = mod(v, n), q = (v - t) / n;
    if (v >= 0 && v < n) return `${v} is already between 0 and ${n - 1}, so nothing wraps.`;
    if (v >= 0) return `${v} ÷ ${n}: ${q} × ${n} = ${q * n}, and ${v} − ${q * n} = ${t}. The remainder is ${t}.`;
    return `${sg(v)} is below 0. Add ${-q} × ${n} = ${-q * n} to get into 0 to ${n - 1}: ${sg(v)} + ${-q * n} = ${t}.`;
  };

  /* ---------- colors: one cyclic ramp built from the lesson palette ---------- */
  const hex2 = hx => { const m = hx.replace('#', ''); return [0, 2, 4].map(i => parseInt(m.slice(i, i + 2), 16)); };
  const toHex = a => '#' + a.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  const ramp = (pal, t) => {
    const cs = [pal.blue, pal.violet, pal.red, pal.yellow, pal.green].map(hex2);
    t = (((t % 1) + 1) % 1) * 5;
    const i = Math.floor(t), f = t - i, a = cs[i % 5], b = cs[(i + 1) % 5];
    return toHex(a.map((v, k) => v + (b[k] - v) * f));
  };

  /* ---------- canvas drawing helpers ---------- */
  const FONT = '"Hanken Grotesk","Helvetica Neue",Arial,sans-serif';
  const T = (c, s, x, y, o) => {
    c.font = `${o.weight || 500} ${o.size || 14}px ${FONT}`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
    if (o.halo) { c.lineWidth = 4; c.strokeStyle = o.halo; c.lineJoin = 'round'; c.strokeText(s, x, y); }
    c.fillStyle = o.color; c.fillText(s, x, y);
  };
  const rr = (c, x, y, w, hh, r) => {
    r = Math.min(r, w / 2, hh / 2); c.beginPath(); c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + hh, r); c.arcTo(x + w, y + hh, x, y + hh, r); c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  const ring = (c, x, y, r, col, w) => { c.beginPath(); c.arc(x, y, r, 0, TAU); c.strokeStyle = col; c.lineWidth = w; c.stroke(); };

  /* clock geometry: n positions, position 0 at the top, clockwise */
  const clockGeom = (p, n, dmax = 24) => {
    const cx = p.w / 2, cy = p.h / 2, half = Math.min(p.w, p.h) / 2;
    let R = half - dmax - 16, dr = clamp(R * Math.sin(Math.PI / n) * .86, 8, dmax);
    R = half - dr - 16; dr = clamp(R * Math.sin(Math.PI / n) * .86, 8, dmax);
    const ang = i => i / n * TAU - Math.PI / 2;
    return { cx, cy, R, dr, n, ang, pos: (i, r = R) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))] };
  };
  /* soft face, fine tick marks and the track the numbers sit on */
  const drawFace = (c, g, pal) => {
    const { cx, cy, R, dr, n, ang } = g, Ro = R + dr + 7;
    c.beginPath(); c.arc(cx, cy, Ro, 0, TAU); c.fillStyle = alpha(pal.text, .035); c.fill();
    ring(c, cx, cy, Ro, pal['grid-strong'], 1.4);
    ring(c, cx, cy, R, pal.grid, 1.2);
    const sub = R * TAU / n / 5 >= 6 ? 4 : 0;
    c.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      for (let m = 0; m <= sub; m++) {
        const a = ang(i + m / (sub + 1)), major = m === 0, r0 = Ro - (major ? 8 : 5), r1 = Ro - 1.5;
        c.beginPath(); c.moveTo(cx + r0 * Math.cos(a), cy + r0 * Math.sin(a)); c.lineTo(cx + r1 * Math.cos(a), cy + r1 * Math.sin(a));
        c.strokeStyle = major ? pal['grid-strong'] : pal.grid; c.lineWidth = major ? 2 : 1.2; c.stroke();
      }
    }
  };
  /* sy(i) -> {fill, stroke, w, label, lc, grow} */
  const drawDots = (c, g, pal, sy, fs) => {
    for (let i = 0; i < g.n; i++) {
      const [x, y] = g.pos(i), s = sy(i), r = g.dr * (s.grow || 1);
      c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = pal.stage; c.fill();
      if (s.fill) { c.fillStyle = s.fill; c.fill(); }
      ring(c, x, y, r, s.stroke || pal['grid-strong'], s.w || 1.5);
      T(c, s.label, x, y + .5, { size: fs * (s.fs || 1), color: s.lc || pal.text, weight: s.bold ? 700 : 500 });
    }
  };
  /* the trail: a yellow arc inside the clock that spirals inward on each lap */
  const drawTrail = (c, g, pal, from, to) => {
    const sweep = (to - from) / g.n * TAU; if (Math.abs(sweep) < .02) return;
    const laps = Math.abs(sweep) / TAU, depth = Math.min(.09 * laps, .3) * g.R, r0 = g.R * .66, N = Math.max(8, Math.ceil(Math.abs(sweep) * 14));
    const pt = u => { const a = from / g.n * TAU - Math.PI / 2 + sweep * u, r = r0 - depth * u; return [g.cx + r * Math.cos(a), g.cy + r * Math.sin(a), a]; };
    c.beginPath();
    for (let k = 0; k <= N; k++) { const [x, y] = pt(k / N); if (k) c.lineTo(x, y); else c.moveTo(x, y); }
    c.strokeStyle = alpha(pal.yellow, .9); c.lineWidth = 5; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
    const [x1, y1, a1] = pt(1), dir = sweep > 0 ? 1 : -1, tg = a1 + dir * Math.PI / 2, hl = 12, nx = Math.cos(a1), ny = Math.sin(a1);
    c.beginPath(); c.moveTo(x1 + Math.cos(tg) * hl, y1 + Math.sin(tg) * hl);
    c.lineTo(x1 + nx * hl * .62, y1 + ny * hl * .62); c.lineTo(x1 - nx * hl * .62, y1 - ny * hl * .62);
    c.closePath(); c.fillStyle = alpha(pal.yellow, .95); c.fill();
    const [x0, y0] = pt(0); c.beginPath(); c.arc(x0, y0, 3.2, 0, TAU); c.fillStyle = alpha(pal.yellow, .95); c.fill();
  };
  const drawHand = (c, g, pal, v) => {
    const a = v / g.n * TAU - Math.PI / 2, L = g.R - g.dr - 5, tx = g.cx + L * Math.cos(a), ty = g.cy + L * Math.sin(a);
    c.lineCap = 'round';
    c.beginPath(); c.moveTo(g.cx, g.cy); c.lineTo(tx, ty); c.strokeStyle = alpha(pal.brass, .22); c.lineWidth = 11; c.stroke();
    c.beginPath(); c.moveTo(g.cx, g.cy); c.lineTo(tx, ty); c.strokeStyle = alpha(pal.text, .88); c.lineWidth = 3; c.stroke();
    c.beginPath(); c.arc(tx, ty, 4.5, 0, TAU); c.fillStyle = pal.brass; c.fill();
    c.beginPath(); c.arc(g.cx, g.cy, 8.5, 0, TAU); c.fillStyle = pal.stage; c.fill(); ring(c, g.cx, g.cy, 8.5, pal.brass, 3);
  };

  register({
    id: 'modular-arithmetic', level: 'school',
    title: 'Modular arithmetic and clocks',
    blurb: 'Add on a clock that wraps around, and see how remainders power calendars and secret codes.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 1.45;
      const n = 12, pt = (i, r = 1) => [Math.sin(i / n * TAU) * r, Math.cos(i / n * TAU) * r];
      p.path(Array.from({ length: 91 }, (_, k) => [Math.sin(k / 90 * TAU), Math.cos(k / 90 * TAU)]), { stroke: pal['grid-strong'], width: 1.6 });
      for (let i = 0; i < n; i++) { const [x, y] = pt(i), [x2, y2] = pt(i, 1.09); p.path([[x, y], [x2, y2]], { stroke: pal['grid-strong'], width: 1.4 }); }
      const arc = []; for (let k = 0; k <= 40; k++) arc.push(pt(9 + 5 * k / 40, .62));
      p.path(arc, { stroke: pal.yellow, width: 3.4 });
      for (let i = 0; i < n; i++) { const [x, y] = pt(i); p.dot(x, y, i === 9 || i === 2 ? 6.2 : 3.2, i === 2 ? pal.green : i === 9 ? pal.blue : pal.stage, pal['grid-strong'], 1.5); }
      p.path([[0, 0], pt(2, .78)], { stroke: pal.text, width: 2.6 });
      p.dot(0, 0, 4.5, pal.stage, pal.brass, 2.4);
    },
    hook: String.raw`It is 9 o'clock and you wait 5 hours. The clock says 2, not 14. What rule makes a number wrap around, and what else in life repeats like a clock?`,
    steps: [
      { title: 'Add on a clock',
        text: String.raw`<p>This clock has \(12\) positions, \(0\) to \(11\). The hand starts at \(9\). You add \(5\). Click the position where the hand lands.</p><p>Then move the sliders. A negative amount moves the hand backward past \(0\). Switch the question to find the amount that brings the hand back to \(0\).</p>`,
        set: { mode: 'add', qtype: 'land', n: 12, s: 9, a: 5 } },
      { title: 'Same remainder, same spoke',
        text: String.raw`<p>Now a stretch of the number line is wrapped into a spiral around a clock with \(5\) positions. Every integer on the spiral sits above its remainder. Drag the number \(x\), the one with the brass ring. Here \(x=-3\) and \(-3 \bmod 5 = 2\).</p><p>All numbers on one spoke have the same remainder. Then use <b>Practice</b>: read the remainder yourself, or decide if \(a \equiv b \pmod{5}\) is true or false.</p>`,
        set: { mode: 'cong', n: 5, x: -3, practice: 'explore' } },
      { title: 'Tables, inverses and zero divisors',
        text: String.raw`<p>This table shows \(a \times b\) with the remainder mod \(7\). Row \(a\), column \(b\). Click any cell to see how it is worked out.</p><p>An <b>inverse</b> of \(a\) is a number \(x\) with \(a\times x=1\) (mod \(7\) here). Mark every number that has one, then press Check. Then change the modulus to \(6\) and look again. Try the other tasks: zero divisors, and solving an equation by scanning a row (for example \(3x\equiv 1\) at modulus \(7\), or \(4x\equiv 2\) at modulus \(6\), which has two solutions).</p>`,
        set: { mode: 'tab', n: 7, task: 'inv', op: 'mul', eqA: 3, eqB: 1 } },
      { title: 'Weeks and secret codes',
        text: String.raw`<p>Weeks repeat every \(7\) days. A day of the week is a number mod \(7\). Choose the modulus \(7\) with the slider, then find what day it will be.</p><p>Then switch the activity to the Caesar wheel. A shift of \(3\) turns A into D. When the shift runs past Z, it wraps around, mod \(26\). Encode a word, then decode a message by trying shifts.</p>`,
        set: { mode: 'use', act: 'days', n: 12 } }
    ],
    formal: String.raw`
      <h3>Remainders</h3>
      <p>Divide an integer \(a\) by a positive whole number \(n\). You get a quotient \(q\) and a remainder \(r\):
      \[ a = q\cdot n + r, \qquad 0 \le r &lt; n. \]
      We write \(r = a \bmod n\). For example \(17 = 3\cdot 5 + 2\), so \(17 \bmod 5 = 2\). Negative numbers work the same way: \(-3 = (-1)\cdot 5 + 2\), so \(-3 \bmod 5 = 2\). The remainder is never negative.</p>
      <h3>The clock model</h3>
      <p>Put the numbers \(0,1,\dots,n-1\) around a clock, with \(0\) at the top. Adding \(k\) moves the hand \(k\) steps clockwise. Passing \(n-1\) takes the hand to \(0\), so a full lap of \(n\) steps changes nothing. The position the hand ends on is the remainder after dividing by \(n\). Subtracting moves the hand counterclockwise, and going below \(0\) wraps to \(n-1\).</p>
      <p>Two numbers that are \(n\) apart land on the same position. The <b>opposite</b> of \(s\) is the amount that brings \(s\) back to \(0\). On a clock with \(12\) positions the opposite of \(9\) is \(3\), because \(9+3=12\).</p>
      <h3>Congruence</h3>
      <p>We say \(a\) and \(b\) are <em>congruent mod \(n\)</em> and write
      \[ a \equiv b \pmod{n} \]
      when \(n\) divides \(a-b\). This is the same as saying that \(a\) and \(b\) have the same remainder, or lie on the same spoke of the spiral. For example \(-3 \equiv 7 \pmod{5}\) because \(-3-7=-10=5\cdot(-2)\). But \(17 \not\equiv 3 \pmod{5}\) because \(14\) is not a multiple of \(5\).</p>
      <h3>Adding and multiplying remainders</h3>
      <p>You may reduce before or after. The answer is the same.
      \[ (a+b) \bmod n = \big((a \bmod n) + (b \bmod n)\big) \bmod n, \]
      \[ (a\cdot b) \bmod n = \big((a \bmod n)\cdot(b \bmod n)\big) \bmod n. \]
      <em>Example.</em> Mod \(7\): \(38 + 47 = 85 = 12\cdot 7 + 1\), so the answer is \(1\). Reducing first, \(38 \bmod 7 = 3\) and \(47 \bmod 7 = 5\), and \(3+5=8\), which is \(1\) mod \(7\). Mod \(6\): \(23\cdot 19 = 437 = 72\cdot 6 + 5\), and reducing first gives \(5\cdot 1 = 5\). This works because a lap of \(n\) steps never changes the landing position.</p>
      <h3>Inverses</h3>
      <p>A number \(a\) has a <b>multiplicative inverse</b> mod \(n\) if some \(x\) gives \(a\cdot x \equiv 1 \pmod n\). It exists exactly when \(\gcd(a,n)=1\), that is, when \(a\) and \(n\) share no factor except \(1\). We state this without proof. Mod \(7\) (a prime) every nonzero number has an inverse: \(3\cdot 5 = 15 = 2\cdot 7+1\), so \(3\) and \(5\) are inverses. Mod \(6\) only \(1\) and \(5\) do.</p>
      <p><em>The tricky case.</em> Mod \(6\), the number \(2\) has no inverse. Every product \(2x\) is even, and \(6\) is even too, so the remainder is always \(0\), \(2\) or \(4\), never \(1\). Worse, \(2\cdot 3 = 6 \equiv 0\) even though neither factor is \(0\). Such numbers are called <b>zero divisors</b>. You cannot cancel them: \(2\cdot 1 \equiv 2\cdot 4 \pmod{6}\), yet \(1 \ne 4\). Equations can then have several solutions or none: \(4x \equiv 2 \pmod{6}\) has the two solutions \(x=2\) and \(x=5\), and \(4x\equiv 1 \pmod{6}\) has none. When \(\gcd(a,n)=1\), \(ax \equiv b\) has exactly one solution mod \(n\).</p>
      <h3>Repeating patterns</h3>
      <p>The sequence \(k \bmod n\) for \(k=0,1,2,\dots\) repeats \(0,1,\dots,n-1\) forever, so anything that repeats every \(n\) steps is described by a remainder. Days repeat mod \(7\): \(100 = 14\cdot 7 + 2\), so \(100\) days after Tuesday is Tuesday plus \(2\) days, Thursday. A Caesar shift by \(k\) sends letter number \(x\) (A \(=0\)) to \((x+k) \bmod 26\), and decoding subtracts \(k\). Angles on a circle repeat the same way, every full turn.</p>`,
    check: [
      { q: 'A clock has 8 positions, numbered 0 to 7. The hand starts at 5 and moves forward 6 steps. Where does it land?',
        choices: ['1', '3', '4', '11'], answer: 1,
        why: String.raw`\(5+6=11\). The clock only has the positions \(0\) to \(7\), so subtract \(8\) once: \(11-8=3\). The remainder of \(11\) divided by \(8\) is \(3\). The answer \(11\) forgets to wrap. The answer \(4\) subtracts \(7\) instead of \(8\): the clock has \(8\) positions, so one lap is \(8\), not \(7\). The answer \(1\) subtracts too much.`,
        hint: String.raw`After \(7\) the hand goes to \(0\), not to \(8\). Count the steps one at a time: \(6, 7, 0, 1, 2, 3\).` },
      { q: 'Numbers are taken mod 12 (remainders after dividing by 12). Which of these numbers has a multiplicative inverse, a number x so that the number times x leaves remainder 1 mod 12?',
        choices: ['2', '3', '4', '5'], answer: 3,
        why: String.raw`\(5\cdot 5 = 25 = 2\cdot 12 + 1\), so \(5\) is its own inverse. The numbers \(2\), \(3\) and \(4\) each share a factor with \(12\) (\(2\), \(3\) and \(4\) respectively), so every product with them is a multiple of that factor mod \(12\) and can never be \(1\). Only numbers with \(\gcd(a,12)=1\) have inverses.`,
        hint: String.raw`Try the products of each number with \(1, 2, 3,\dots\) and look for remainder \(1\). Which numbers share a factor with \(12\)?` }
    ],
    links: { related: ['solving-equations-with-a-balance', 'the-unit-circle-and-trig-waves', 'exponents-and-scientific-notation', 'pascals-triangle-and-the-galton-board'] },

    mount({ stage, controls: C }) {
      const P = new Plane(stage, { span: 5 }), cv = P.canvas;
      if (P.coordEl) P.coordEl.style.display = 'none';
      cv.tabIndex = 0; cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', 'A clock face, a number spiral, an arithmetic table or a cipher wheel, depending on the step. Click or drag on it. The panel beside it reads out the numbers and explains each answer.');
      const st = {
        n: 12, mode: 'add',
        qtype: 'land', s: 9, a: 5, hand: 9, phase: 'ask', pick: null,
        practice: 'explore', x: -3, cOk: false, stmt: null, stmtK: 0, stmtDone: false, rimWrong: null,
        op: 'mul', task: 'inv', sel: null, marks: [], eqA: 3, eqB: 1, checked: false,
        act: 'days', dIdx: 0, dPick: null, dDone: false, shift: 0, shiftV: 0, eIdx: 0, eK: 0, eDone: [], eWrong: null, cIdx: 0, hov: null
      };
      let cancelA = () => {}, cancelS = () => {}, dragging = false;
      const nEff = () => (st.mode === 'use' && st.act !== 'days' ? 26 : st.n);
      const draw = () => P.requestDraw();
      const vis = (el, on) => { el.style.display = on ? '' : 'none'; };

      /* ---------- panel ---------- */
      const askEl = C.readout(), host = askEl.parentNode, fb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
      const grp = build => {
        const i = host.children.length; build();
        const w = h('div', { style: 'display:flex;flex-direction:column;gap:16px' });
        [...host.children].slice(i).forEach(e => w.append(e)); host.append(w); return w;
      };
      let nS, sS, aS, xS, eaS, ebS, shS, qSel, prSel, opSel, tkSel, acSel, chkBtn, noBtn, newBtn, newBtn2, itBtn, truBtn, falBtn, showBtn, newAdd;
      let gAmt, gOp, gEq, gTF, gShift, gN, gAdd, gCong, gTab, gUse, gX;
      const resetFb = () => { fb.innerHTML = ''; };

      gN = grp(() => {
        C.title('Modulus');
        nS = C.slider({ label: 'Number of positions n', min: 2, max: 24, step: 1, value: st.n, format: v => 'n = ' + v,
          onInput: v => { st.n = v; onN(); } });
      });
      gAdd = grp(() => {
        C.title('Clock addition');
        qSel = C.select({ label: 'Question', value: 'land', options: [
          { value: 'land', label: 'Where does the hand land?' }, { value: 'zero', label: 'Which amount brings it back to 0?' }],
          onChange: v => { st.qtype = v; resetAdd(); } });
        sS = C.slider({ label: 'Start position', min: 0, max: 23, step: 1, value: st.s, format: v => String(v),
          onInput: v => { st.s = Math.min(v, st.n - 1); sS.set(st.s); resetAdd(); } });
        gAmt = grp(() => {
          aS = C.slider({ label: 'Amount to add (negative = subtract)', min: -40, max: 40, step: 1, value: st.a, format: v => (v < 0 ? MINUS + ' ' + (-v) : '+ ' + v),
            onInput: v => { st.a = v; resetAdd(); } });
        });
        [showBtn, newAdd] = C.buttons([{ label: 'Show me', onClick: () => revealAdd() }, { label: 'Try another', onClick: () => newAddProblem() }]);
      });
      gCong = grp(() => {
        C.title('Congruence');
        prSel = C.select({ label: 'Practice', value: 'explore', options: [
          { value: 'explore', label: 'Explore: drag x' }, { value: 'read', label: 'Read x mod n from the clock' }, { value: 'test', label: 'True or false: a ≡ b' }],
          onChange: v => { st.practice = v; resetCong(); } });
        gX = grp(() => {
          xS = C.slider({ label: 'The number x', min: -24, max: 47, step: 1, value: st.x, format: v => sg(v),
            onInput: v => { setX(v); } });
        });
        newBtn = C.buttons([{ label: 'New question', onClick: () => newCong() }])[0];
        gTF = grp(() => { [truBtn, falBtn] = C.buttons([{ label: 'True', primary: true, onClick: () => answerTF(true) }, { label: 'False', primary: true, onClick: () => answerTF(false) }]); });
      });
      gTab = grp(() => {
        C.title('Arithmetic table');
        tkSel = C.select({ label: 'Task', value: 'inv', options: [
          { value: 'probe', label: 'Probe the table' }, { value: 'inv', label: 'Find the inverses' },
          { value: 'zero', label: 'Find zero divisors' }, { value: 'solve', label: 'Solve a x ≡ b' }],
          onChange: v => { st.task = v; if (v !== 'probe') st.op = 'mul'; resetTab(); } });
        gOp = grp(() => {
          opSel = C.select({ label: 'Table', value: 'mul', options: [{ value: 'add', label: 'Addition table  ( + )' }, { value: 'mul', label: 'Multiplication table  ( × )' }],
            onChange: v => { st.op = v; resetTab(); } });
        });
        gEq = grp(() => {
          eaS = C.slider({ label: 'a in a x ≡ b', min: 1, max: 23, step: 1, value: st.eqA, format: v => String(v), onInput: v => { st.eqA = Math.min(v, st.n - 1); eaS.set(st.eqA); resetTab(); } });
          ebS = C.slider({ label: 'b in a x ≡ b', min: 0, max: 23, step: 1, value: st.eqB, format: v => String(v), onInput: v => { st.eqB = Math.min(v, st.n - 1); ebS.set(st.eqB); resetTab(); } });
        });
        [chkBtn, noBtn] = C.buttons([{ label: 'Check', primary: true, onClick: () => checkTab() }, { label: 'None', onClick: () => noneTab() }]);
      });
      gUse = grp(() => {
        C.title('Uses');
        acSel = C.select({ label: 'Activity', value: 'days', options: [
          { value: 'days', label: 'Days of the week' }, { value: 'enc', label: 'Caesar wheel: encode' }, { value: 'dec', label: 'Caesar wheel: decode' }],
          onChange: v => { st.act = v; resetUse(); } });
        gShift = grp(() => {
          shS = C.slider({ label: 'Shift', min: 0, max: 25, step: 1, value: st.shift, format: v => String(v), onInput: v => { setShift(v); } });
        });
        [newBtn2, itBtn] = C.buttons([{ label: 'New question', onClick: () => newUse() }, { label: 'This is it', primary: true, onClick: () => checkDec() }]);
      });
      host.insertBefore(fb, askEl.nextSibling);   /* question and feedback stay at the top of the panel */

      /* =================== 1. CLOCK ADDITION =================== */
      const addTarget = () => (st.qtype === 'land' ? mod(st.s + st.a, st.n) : mod(-st.s, st.n));
      const addAmount = () => (st.qtype === 'land' ? st.a : addTarget());
      const pathText = (s, a, n) => {
        const k = Math.abs(a), dir = a < 0 ? -1 : 1, out = [s];
        for (let i = 1; i <= k; i++) out.push(mod(s + dir * i, n));
        return out.join(' → ');
      };
      const resetAdd = () => { cancelA(); st.phase = 'ask'; st.pick = null; st.hand = st.s; resetFb(); render(); };
      const newAddProblem = () => {
        const n = st.n, k = ++st.stmtK, r1 = rnd(k * 3 + n), r2 = rnd(k * 5 + n + 1), r3 = rnd(k * 7 + n + 2);
        st.s = Math.floor(r1 * n);
        if (st.qtype === 'land') {
          const neg = r3 < .35, mag = 2 + Math.floor(r2 * (Math.min(40, n * 2 + 3) - 2));
          st.a = neg ? -mag : mag;
          if (st.a > 0 && st.s + st.a < n) st.a = n - st.s + 1 + Math.floor(r2 * 4);
          if (st.a < 0 && st.s + st.a >= 0) st.a = -(st.s + 1 + Math.floor(r2 * 4));
          st.a = clamp(st.a, -40, 40);
        }
        sS.set(st.s); aS.set(st.a); resetAdd();
      };
      const addWrong = i => {
        const n = st.n, s = st.s;
        if (st.qtype === 'zero') {
          const v = s + i;
          return `${no('Not yet.')} You clicked ${i}. ${s} + ${i} = ${v}. ${reduceText(v, n)} So the hand lands on ${mod(v, n)}, not on 0. ${s === 0 ? 'The hand starts at 0, so it needs to move a whole number of laps. Moving 0 steps works.' : `You need ${s} + x to be a whole number of laps. How many steps does it take to go from ${s} up to ${n}? Position ${n} is the same spot as 0.`}`;
        }
        const a = st.a, v = s + a, t = mod(v, n), wrapped = v < 0 || v >= n, k = Math.abs(a);
        let why;
        if (a === 0) why = `The amount is 0, so the hand does not move. It stays at ${s}.`;
        else if (i === s && mod(a, n) !== 0) why = `That is the start position. The hand has to move ${k} steps ${a < 0 ? 'backward' : 'forward'}.`;
        else if (a < 0 && i === mod(s - a, n)) why = `That is where you land by <em>adding</em> ${k}. The amount is negative, so the hand moves backward (counterclockwise).`;
        else if (a > 0 && i === mod(s - a, n)) why = `That is where you land by moving ${a} steps the wrong way. Adding moves the hand clockwise.`;
        else if (i === mod(a, n) && s !== 0) why = `That counts ${k} steps ${a < 0 ? 'backward ' : ''}starting from 0. The count has to start at the hand, at ${s}.`;
        else if (i === mod(t + 1, n) || i === mod(t - 1, n)) {
          const over = i === mod(t + 1, n);
          why = `That is one spot ${over ? 'too far' : 'short'}. Count steps, not positions: the first step lands on ${mod(s + (a < 0 ? -1 : 1), n)}.` +
            (wrapped ? (a < 0 ? ` Going backward, the spot after 0 is ${n - 1}.` : ` After ${n - 1} comes 0. The number ${n} is not on the clock, because ${n} is the same spot as 0.`) : '');
        } else why = `You clicked ${i}.`;
        const calc = `${s} ${a < 0 ? '−' : '+'} ${k} = ${sg(v)}. ${reduceText(v, n)}`;
        const pth = k <= 14 && k > 0 ? ` Step by step: ${pathText(s, a, n)}.` : '';
        return `${no('Not yet.')} ${why}${pth} ${k > 14 || !pth ? calc : ''} Try again, or press Show me.`;
      };
      const addExplain = () => {
        const n = st.n, s = st.s;
        if (st.qtype === 'land') {
          const a = st.a, v = s + a, t = mod(v, n), q = Math.floor(v / n);
          let wrap;
          if (v >= n) wrap = `The hand goes past ${n - 1} to 0 ${q === 1 ? 'once' : q + ' times'}. A full lap changes nothing, so it lands on ${t}.`;
          else if (v < 0) wrap = `Going backward below 0 wraps around to ${n - 1}. The hand lands on ${t}.`;
          else wrap = `The hand never passes 0, so there is no wrap. It lands on ${t}.`;
          return `${ok('Yes.')} ${s} ${a < 0 ? '−' : '+'} ${Math.abs(a)} = ${sg(v)}. ${wrap}<br>${reduceText(v, n)}<br><b>The landing spot is the remainder after dividing by ${n}.</b>`;
        }
        const x = addTarget();
        if (s === 0) return `${ok('Yes.')} The hand is already at 0. Adding 0 keeps it there, so 0 is its own opposite.`;
        return `${ok('Yes.')} ${s} + ${x} = ${s + x}, and ${s + x} is exactly 1 lap of ${n}, so the hand lands on 0.<br>${x} is the <b>opposite</b> of ${s} on this clock. Opposites add up to ${n}, the same spot as 0.` +
          (n % 2 === 0 && s === n / 2 ? ` Here ${s} is its own opposite, because ${s} + ${s} = ${n}.` : '');
      };
      const finishAdd = () => {
        cancelA(); st.phase = 'anim'; st.pick = null; resetFb();
        const s = st.s, amt = addAmount(), ms = clamp(600 + Math.abs(amt) * 55, 700, 2300);
        cancelA = tween(ms, e => { st.hand = s + amt * ease(e); draw(); }, () => { st.phase = 'done'; st.hand = s + amt; fb.innerHTML = addExplain(); draw(); });
      };
      const revealAdd = () => { if (st.phase === 'ask') finishAdd(); };
      const clickAdd = i => {
        if (st.phase === 'anim') return;
        if (st.phase === 'done') { resetAdd(); }
        if (i === addTarget()) finishAdd(); else { st.pick = i; fb.innerHTML = addWrong(i); draw(); }
      };
      const askAdd = () => {
        if (st.qtype === 'land') {
          const a = st.a, k = Math.abs(a);
          return `<span class="k">Start</span> ${st.s} &nbsp; <span class="k">${a < 0 ? 'Subtract' : 'Add'}</span> ${k}<br><b>Click the position where the hand lands.</b>`;
        }
        return `<span class="k">Start</span> ${st.s}<br><b>Click the amount x so that ${st.s} + x lands on 0.</b> The numbers on the clock are the possible amounts.`;
      };
      const clockPlain = i => String(i);
      const drawAdd = (c, p) => {
        const pal = p.pal, n = st.n, g = clockGeom(p, n), fs = clamp(g.dr * .95, 11, 20);
        drawFace(c, g, pal);
        const land = st.qtype === 'land', t = addTarget(), done = st.phase === 'done';
        if (st.phase !== 'ask') drawTrail(c, g, pal, st.s, st.hand);
        drawDots(c, g, pal, i => {
          const o = { label: clockPlain(i) };
          if (i === 0 && !land) { o.stroke = pal.yellow; o.w = 2.6; }
          if (i === st.s) { o.fill = alpha(pal.blue, .25); o.stroke = pal.blue; o.w = 3; o.bold = true; }
          if (done && i === t) { o.fill = alpha(pal.green, .3); o.stroke = pal.green; o.w = 3; o.bold = true; if (!land && i === st.s) o.stroke = pal.green; }
          if (st.pick === i) { o.fill = alpha(pal.red, .22); o.stroke = pal.red; o.w = 3; }
          if (st.hov === i && st.phase !== 'anim' && st.pick !== i) { o.stroke = pal.brass; o.w = 2.4; }
          return o;
        }, fs);
        drawHand(c, g, pal, st.hand);
        /* caption in the middle */
        const s = st.s, a = addAmount(), v = s + a, fz = clamp(g.R * .105, 11.5, 20), y0 = g.cy + g.R * .27;
        if (land) {
          T(c, `${s} ${a < 0 ? '−' : '+'} ${Math.abs(a)} = ${sg(v)}`, g.cx, y0, { size: fz, color: pal.text, halo: pal.stage });
          if (done) T(c, `${sg(v)} mod ${n} = ${mod(v, n)}`, g.cx, y0 + fz * 1.5, { size: fz, color: pal.green, weight: 700, halo: pal.stage });
        } else {
          T(c, `${s} + ? ≡ 0`, g.cx, y0, { size: fz, color: pal.text, halo: pal.stage });
          if (done) T(c, `${s} + ${a} = ${s + a}`, g.cx, y0 + fz * 1.5, { size: fz, color: pal.green, weight: 700, halo: pal.stage });
        }
        T(c, `mod ${n}`, g.cx, g.cy - g.R * .28, { size: fz, color: pal.muted, halo: pal.stage });
      };
      const hitClock = (g, x, y, slack = 10) => {
        let best = null, bd = 1e9;
        for (let i = 0; i < g.n; i++) { const [px, py] = g.pos(i), d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; best = i; } }
        return bd <= g.dr + slack ? best : null;
      };

      /* =================== 2. CONGRUENCE ON A SPIRAL =================== */
      const cgeom = p => {
        const n = st.n, cx = p.w / 2, cy = p.h / 2, half = Math.min(p.w, p.h) / 2, rim = half - 15, Rout = rim - 26, Rin = Rout * .36;
        const ang = k => k / n * TAU - Math.PI / 2, rad = k => Rin + (k + n) / (3 * n) * (Rout - Rin);
        const dr = clamp(Math.min((Rout - Rin) / 3 * .4, Rin * Math.sin(Math.PI / n) * .8), 2.4, 11);
        return { n, cx, cy, rim, Rout, Rin, dr, ang, rad, pos: k => [cx + rad(k) * Math.cos(ang(k)), cy + rad(k) * Math.sin(ang(k))] };
      };
      const clampX = v => clamp(Math.round(v), -st.n, 2 * st.n - 1);
      const setX = v => { st.x = clampX(v); xS.set(st.x); st.cOk = false; st.rimWrong = null; resetFb(); render(); };
      const genStmt = (k, n) => {
        const r1 = rnd(k * 11 + n), r2 = rnd(k * 13 + n + 3), truth = rnd(k * 17 + n + 5) < .5, lo = -n, hi = 2 * n - 1, a = lo + Math.floor(r1 * 3 * n);
        const cand = truth ? [1, -1, 2, -2].map(m => a + m * n)
          : (n === 2 ? [1, -1] : [1, -1, 2, -2, Math.floor(n / 2)]).flatMap(d => [a + d, a + d + n, a + d - n]).filter(v => mod(v - a, n) !== 0);
        const inside = cand.filter(v => v >= lo && v <= hi), b = inside[Math.floor(r2 * inside.length)];
        return { a, b, truth: mod(a - b, n) === 0 };
      };
      const resetCong = () => {
        st.cOk = false; st.rimWrong = null; st.stmtDone = false; resetFb();
        if (st.practice === 'test') st.stmt = genStmt(st.stmtK, st.n);
        render();
      };
      const newCong = () => {
        const n = st.n, k = ++st.stmtK;
        if (st.practice === 'test') resetCong();
        else { let v = -n + Math.floor(rnd(k * 17 + n) * 3 * n); if (v === st.x) v = clampX(v + 1); setX(v); }
      };
      const readWhy = x => {
        const n = st.n, r = mod(x, n), q = (x - r) / n;
        return `${sg(x)} = ${par(q)} × ${n} + ${r}, so ${sg(x)} mod ${n} = ${r}. ` + (x < 0 ? 'The remainder is never negative: below 0 you walk backward and land on a position from 0 to ' + (n - 1) + '.' : '');
      };
      const answerRead = idx => {
        const n = st.n, x = st.x, r = mod(x, n);
        if (idx === r) { st.cOk = true; st.rimWrong = null; fb.innerHTML = `${ok('Yes.')} ${readWhy(x)} Every number on that spoke is ${sg(x)} plus or minus a multiple of ${n}.`; }
        else {
          st.rimWrong = idx; const d = x - idx;
          let why = `${sg(x)} − ${idx} = ${sg(d)}, and ${n} does not divide ${sg(d)} (the remainder is ${mod(d, n)}), so ${sg(x)} is not on the spoke of ${idx}.`;
          if (x < 0 && idx === mod(-x, n)) why = `That is the remainder of ${-x}, the number without its minus sign. But ${sg(x)} is below 0, so walk ${-x} steps backward from 0 instead.`;
          fb.innerHTML = `${no('Not yet.')} ${why} Try again. Hint: add or subtract ${n} until you land between 0 and ${n - 1}.`;
        }
        render();
      };
      const answerTF = v => {
        const { a, b, truth } = st.stmt, n = st.n, d = a - b, ra = mod(a, n), rb = mod(b, n);
        const calc = `${sg(a)} − ${par(b)} = ${sg(d)}.`;
        const rem = `${sg(a)} mod ${n} = ${ra} and ${sg(b)} mod ${n} = ${rb}.`;
        const body = truth
          ? `${calc} ${n} divides ${sg(d)}, because ${sg(d)} = ${n} × ${par(d / n)}. Same remainder: ${rem} They sit on the same spoke.`
          : `${calc} ${sg(d)} is not a multiple of ${n}: ${sg(d)} = ${par((d - mod(d, n)) / n)} × ${n} + ${mod(d, n)}, so ${n} does not divide ${sg(d)}. Different remainders: ${rem} They sit on different spokes.`;
        const neg = a < 0 || b < 0 ? ' Negative numbers follow the same rule.' : '';
        st.stmtDone = true;
        fb.innerHTML = `${v === truth ? ok('Correct.') : no('Not quite.')} The statement is <b>${truth ? 'true' : 'false'}</b>.<br>${body}${neg}`;
        render();
      };
      const askCong = () => {
        const n = st.n, x = st.x;
        if (st.practice === 'explore') {
          const lst = [x - 2 * n, x - n, x, x + n, x + 2 * n].map(sg).join(', ');
          return `<span class="k">x</span> ${sg(x)} &nbsp; <span class="k">n</span> ${n}<br>${readWhy(x)}<br><span class="k">Same spoke:</span> …, ${lst}, …`;
        }
        if (st.practice === 'read') return `<span class="k">x</span> <b>${sg(x)}</b> &nbsp; <span class="k">n</span> ${n}<br><b>What is ${sg(x)} mod ${n}?</b> Click the remainder on the outer rim of the clock. You can drag x first.`;
        const { a, b } = st.stmt;
        return `<b>True or false?</b><br><span style="font-size:1.05rem"><b>${sg(a)} ≡ ${sg(b)} (mod ${n})</b></span><br><span class="k">Rule:</span> a ≡ b (mod n) means n divides a − b.`;
      };
      const drawCong = (c, p) => {
        const pal = p.pal, g = cgeom(p, st.n), n = st.n;
        const test = st.practice === 'test', read = st.practice === 'read', hide = (read && !st.cOk) || test;
        c.beginPath(); c.arc(g.cx, g.cy, g.rim + 2, 0, TAU); c.fillStyle = alpha(pal.text, .03); c.fill(); ring(c, g.cx, g.cy, g.rim + 2, pal['grid-strong'], 1.3);
        c.beginPath();
        const sub = Math.max(4, Math.ceil(64 / n)), total = 3 * n * sub;
        for (let k = 0; k <= total - sub; k++) {
          const kk = -n + k / sub, a = g.ang(kk), r = g.rad(kk), x = g.cx + r * Math.cos(a), y = g.cy + r * Math.sin(a);
          if (k) c.lineTo(x, y); else c.moveTo(x, y);
        }
        c.strokeStyle = alpha(pal['grid-strong'], .55); c.lineWidth = 1.4; c.lineJoin = 'round'; c.stroke();
        const spoke = (r, col, w) => {
          const a = g.ang(r); c.beginPath(); c.moveTo(g.cx + g.Rin * .5 * Math.cos(a), g.cy + g.Rin * .5 * Math.sin(a));
          c.lineTo(g.cx + (g.Rout + g.dr + 4) * Math.cos(a), g.cy + (g.Rout + g.dr + 4) * Math.sin(a));
          c.strokeStyle = col; c.lineWidth = w; c.setLineDash([2, 5]); c.lineCap = 'round'; c.stroke(); c.setLineDash([]);
        };
        const xr = mod(st.x, n);
        if (!test && !hide) spoke(xr, alpha(ramp(pal, xr / n), .9), 2.2);
        if (test && st.stmtDone) { spoke(mod(st.stmt.a, n), alpha(pal.blue, .95), 2.2); spoke(mod(st.stmt.b, n), alpha(pal.red, .95), 2.2); }
        const lab = g.dr >= 7.5;
        for (let k = -n; k < 2 * n; k++) {
          const [x, y] = g.pos(k), r = mod(k, n), col = ramp(pal, r / n), same = !hide && !test && r === xr, isX = !test && k === st.x;
          const R2 = Math.min((same ? Math.max(g.dr * 1.55, 9.5) : g.dr) * (isX ? 1.2 : 1), 14);
          c.beginPath(); c.arc(x, y, R2, 0, TAU); c.fillStyle = pal.stage; c.fill();
          c.fillStyle = alpha(col, same || isX ? .6 : (!hide && !test ? .22 : .34)); c.fill();
          ring(c, x, y, R2, alpha(col, same ? 1 : .8), same ? 1.8 : 1.2);
          const showNum = lab || same || isX || (test && (k === st.stmt.a || k === st.stmt.b));
          if (showNum && R2 >= (Math.abs(k) > 9 ? 8.8 : 6.5)) T(c, sg(k), x, y + .5, { size: clamp(R2 * 1.05, 7.5, 13), color: pal.text, weight: same ? 700 : 500 });
        }
        if (!test) {
          const [x, y] = g.pos(st.x), R2 = Math.min((hide ? g.dr : Math.max(g.dr * 1.55, 9.5)) * 1.2, 14);
          ring(c, x, y, R2 + 3, pal.brass, 3);
          if (R2 < (Math.abs(st.x) > 9 ? 8.8 : 6.5)) T(c, sg(st.x), x, y - R2 - 11, { size: 12, color: pal.text, weight: 700, halo: pal.stage });
        }
        if (test) {
          for (const [k, col, nm] of [[st.stmt.a, pal.blue, 'a'], [st.stmt.b, pal.red, 'b']]) {
            const [x, y] = g.pos(k), a = g.ang(k), R2 = Math.max(g.dr, 7) + 3.5;
            ring(c, x, y, R2, col, 3);
            T(c, nm, x + Math.cos(a) * (R2 + 11), y + Math.sin(a) * (R2 + 11), { size: 14, color: col, weight: 700, halo: pal.stage });
            if (R2 < 11) T(c, sg(k), x, y - R2 - 10, { size: 11, color: pal.text, halo: pal.stage });
          }
        }
        for (let r = 0; r < n; r++) {
          const a = g.ang(r), x = g.cx + g.rim * Math.cos(a), y = g.cy + g.rim * Math.sin(a), col = ramp(pal, r / n);
          const sel = (!hide && !test && r === xr) || (test && st.stmtDone && (r === mod(st.stmt.a, n) || r === mod(st.stmt.b, n)));
          const rd = clamp(g.rim * Math.sin(Math.PI / n) * .85, 8, 13);
          c.beginPath(); c.arc(x, y, rd, 0, TAU); c.fillStyle = pal.stage; c.fill(); c.fillStyle = alpha(col, sel ? .7 : .24); c.fill();
          if (st.rimWrong === r) ring(c, x, y, rd + 2, pal.red, 2.6);
          if (st.hov === 'rim' + r && read && !st.cOk) ring(c, x, y, rd + 2, pal.brass, 2);
          if (rd >= 8.5 || sel) T(c, String(r), x, y + .5, { size: clamp(rd, 8.5, 13), color: pal.text, weight: sel ? 700 : 500 });
        }
        const fz = clamp(g.Rin * .3, 11, 18);
        if (test) {
          T(c, `${sg(st.stmt.a)} ≡ ${sg(st.stmt.b)}`, g.cx, g.cy - fz * .6, { size: fz, color: pal.text, weight: 700 });
          T(c, `(mod ${n}) ?`, g.cx, g.cy + fz * .9, { size: fz * .85, color: pal.muted });
        } else {
          T(c, `${sg(st.x)} mod ${n}`, g.cx, g.cy - fz * .6, { size: fz, color: pal.text });
          T(c, hide ? '= ?' : '= ' + xr, g.cx, g.cy + fz * .9, { size: fz * 1.15, color: hide ? pal.muted : pal.text, weight: 700 });
        }
      };
      const rimIdx = (g, x, y) => mod(Math.round(((Math.atan2(y - g.cy, x - g.cx) + Math.PI / 2) / TAU) * st.n), st.n);
      const nearestK = (g, x, y) => {
        let best = null, bd = 1e9;
        for (let k = -st.n; k < 2 * st.n; k++) { const [px, py] = g.pos(k), d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; best = k; } }
        return [best, bd];
      };
      const downCong = (x, y) => {
        if (st.practice === 'test') return null;
        const g = cgeom(P, st.n);
        if (st.practice === 'read' && !st.cOk && Math.hypot(x - g.cx, y - g.cy) > g.Rout + g.dr + 8) { answerRead(rimIdx(g, x, y)); return null; }
        return dragCong(x, y) ? 'drag' : null;
      };
      const dragCong = (x, y) => {
        const [best, bd] = nearestK(cgeom(P, st.n), x, y);
        if (bd > 40) return false;
        if (best !== st.x) setX(best); return true;
      };
      const hoverCong = (x, y) => {
        if (st.practice === 'test') return null;
        const g = cgeom(P, st.n);
        if (st.practice === 'read' && !st.cOk && Math.hypot(x - g.cx, y - g.cy) > g.Rout + g.dr + 8) return 'rim' + rimIdx(g, x, y);
        return nearestK(g, x, y)[1] < 40 ? 'x' : null;
      };

      /* =================== 3. ARITHMETIC TABLES =================== */
      const tval = (i, j) => (st.op === 'add' ? mod(i + j, st.n) : mod(i * j, st.n));
      const invSet = n => { const o = []; for (let a = 1; a < n; a++) if (gcd(a, n) === 1) o.push(a); return o; };
      const inverseOf = (a, n) => { for (let x = 1; x < n; x++) if (mod(a * x, n) === 1) return x; return null; };
      const solSet = (a, b, n) => { const o = []; for (let x = 0; x < n; x++) if (mod(a * x, n) === b) o.push(x); return o; };
      const resetTab = () => { st.sel = null; st.marks = []; st.checked = false; resetFb(); render(); };
      const tgeom = p => {
        const n = st.n, band = 0.95, cs = Math.min((p.w - 18) / (n + 1), (p.h - 18) / (n + 1 + band), 54);
        const ox = (p.w - cs * (n + 1)) / 2 + cs, oy = (p.h - cs * (n + 1 + band)) / 2 + cs * (1 + band);
        return { n, cs, ox, oy, top: oy - cs, left: ox - cs };
      };
      const cellAt = (g, x, y) => {
        const j = Math.floor((x - g.ox) / g.cs), i = Math.floor((y - g.oy) / g.cs);
        if (x >= g.ox && y >= g.oy && j < g.n && i < g.n) return { t: 'cell', i, j };
        if (y >= g.oy && y < g.oy + g.n * g.cs && x >= g.left && x < g.ox) return { t: 'row', i };
        if (x >= g.ox && x < g.ox + g.n * g.cs && y >= g.top && y < g.oy) return { t: 'col', j };
        return null;
      };
      const opSym = () => (st.op === 'add' ? '+' : '×');
      const cellText = (i, j) => {
        const n = st.n, v0 = st.op === 'add' ? i + j : i * j;
        return `${i} ${opSym()} ${j} = ${v0}. ${reduceText(v0, n)}`;
      };
      const invWhy = n => {
        const bad = []; for (let a = 2; a < n; a++) if (gcd(a, n) > 1) bad.push(a);
        if (!bad.length) return `${n} is a prime number: its only factors are 1 and ${n}, so no smaller number shares a factor with it. That is why every number from 1 to ${n - 1} has an inverse (gcd = 1).`;
        const eg = bad.slice(0, 3).map(a => `${a} shares the factor ${gcd(a, n)} with ${n}`);
        const a0 = bad[0], g0 = gcd(a0, n), mult = []; for (let m = 0; m < n; m += g0) mult.push(m);
        return `Why the others fail: ${eg.join('; ')}. When ${a0} and ${n} share the factor ${g0}, every product ${a0} × x leaves a remainder that is a multiple of ${g0} (here ${mult.join(', ')}), so it can never be 1. Numbers with no shared factor (gcd = 1) always have an inverse.`;
      };
      const checkInv = () => {
        const n = st.n, T0 = invSet(n), M = st.marks.slice().sort((a, b) => a - b);
        const miss = T0.filter(a => !M.includes(a)), wrong = M.filter(a => !T0.includes(a));
        st.checked = true;
        const pairs = T0.filter(a => inverseOf(a, n) >= a).map(a => `${a} × ${inverseOf(a, n)} = ${a * inverseOf(a, n)} = ${(a * inverseOf(a, n) - 1) / n} × ${n} + 1`);
        let m;
        if (!miss.length && !wrong.length) m = `${ok('Yes.')} Mod ${n}, the numbers with an inverse are ${listJoin(T0)}. Each of those rows contains a 1 (outlined).`;
        else {
          const parts = [];
          if (wrong.length) parts.push(`${wrong.join(', ')} ${wrong.length > 1 ? 'have' : 'has'} no inverse: look along ${wrong.length > 1 ? 'those rows' : 'that row'}, there is no 1 in ${wrong.length > 1 ? 'them' : 'it'}`);
          if (miss.length) parts.push(`you missed ${miss.join(', ')}: ${miss.length > 1 ? 'their rows each contain' : 'its row contains'} a 1`);
          m = `${no('Not yet.')} ${parts.join('. ')}. The numbers with an inverse are ${listJoin(T0)}.`;
        }
        fb.innerHTML = `${m}<br>${pairs.slice(0, 4).join('; ')}${pairs.length > 4 ? '; …' : ''}.<br>${invWhy(n)}`;
        render();
      };
      const zeroPairs = n => { const o = []; for (let a = 2; a < n; a++) for (let b = a; b < n; b++) if (a * b % n === 0) o.push([a, b]); return o; };
      const noneTab = () => {
        const n = st.n;
        if (st.task === 'zero') {
          const z = zeroPairs(n); st.checked = true;
          if (!z.length) fb.innerHTML = `${ok('Right.')} ${n} is prime. If ${n} divides a × b, then ${n} must divide a or b, and neither is possible for numbers from 1 to ${n - 1}. So no two non-zero numbers multiply to 0 mod ${n}.`;
          else { const [a, b] = z[0]; fb.innerHTML = `${no('Not quite.')} Some do exist, for example ${a} × ${b} = ${a * b} = ${a * b / n} × ${n} + 0. The 0 cells inside the table are outlined in red.`; }
        } else if (st.task === 'solve') {
          const X = solSet(st.eqA, st.eqB, n); st.checked = true;
          if (!X.length) fb.innerHTML = `${ok('Right, no solution.')} ${solveWhy(st.eqA, st.eqB, n, X)}`;
          else fb.innerHTML = `${no('Not quite.')} There ${X.length > 1 ? 'are solutions' : 'is a solution'}: x = ${listJoin(X)}. ${solveWhy(st.eqA, st.eqB, n, X)}`;
        } else if (st.task === 'inv') { st.marks = []; st.checked = false; fb.innerHTML = 'Marks cleared.'; }
        render();
      };
      const solveWhy = (a, b, n, X) => {
        const g = gcd(a, n), mult = []; for (let m = 0; m < n; m += g) mult.push(m);
        if (!X.length) return `${a} and ${n} share the factor ${g}, so ${a}x mod ${n} can only be a multiple of ${g}: ${mult.join(', ')}. ${b} is not one of them.`;
        const chk = X.slice(0, 3).map(x => `${a} × ${x} = ${a * x} = ${(a * x - b) / n} × ${n} + ${b}`).join('; ');
        if (g === 1) { const iv = inverseOf(a, n); return `${a} and ${n} share no factor (gcd 1), so ${a} has an inverse${iv ? ' (' + iv + ')' : ''}, and every value shows up exactly once in the row. Check: ${chk}.`; }
        return `${a} and ${n} share the factor ${g}, so the row only shows multiples of ${g}, and each one appears ${g} times. Check: ${chk}.`;
      };
      const checkTab = () => {
        const n = st.n;
        if (st.task === 'inv') {
          if (!st.marks.length) { fb.innerHTML = 'Mark at least one number first. Click a number along the top or left edge of the table, or press None to see the answer.'; render(); return; }
          checkInv();
        } else if (st.task === 'solve') {
          const a = st.eqA, b = st.eqB, X = solSet(a, b, n), M = st.marks.slice().sort((p1, p2) => p1 - p2);
          st.checked = true;
          const miss = X.filter(x => !M.includes(x)), wrong = M.filter(x => !X.includes(x));
          if (!M.length) { fb.innerHTML = `Click the cells in row ${a} that show ${b}, then check. If you think no cell works, press None.`; st.checked = false; render(); return; }
          if (!miss.length && !wrong.length) fb.innerHTML = `${ok('Yes.')} The solution${X.length > 1 ? 's are' : ' is'} x = ${listJoin(X)}. ${solveWhy(a, b, n, X)}`;
          else {
            const bits = [];
            if (wrong.length) bits.push(`${a} × ${wrong[0]} = ${a * wrong[0]}, which is ${mod(a * wrong[0], n)} mod ${n}, not ${b}`);
            if (miss.length) bits.push(`You missed x = ${listJoin(miss)}`);
            fb.innerHTML = `${no('Not yet.')} ${bits.join('. ')}. ${X.length ? 'All solutions: x = ' + listJoin(X) + '.' : 'There is no solution.'} ${solveWhy(a, b, n, X)}`;
          }
          render();
        }
      };
      const clickTab = hit => {
        const n = st.n;
        if (!hit) return;
        if (hit.t !== 'cell') {
          if (st.task === 'inv') {
            const v = hit.t === 'row' ? hit.i : hit.j;
            if (v === 0) { fb.innerHTML = `0 never has an inverse: 0 × anything is 0, not 1.`; st.marks = st.marks.filter(m => m !== 0); }
            else { st.checked = false; st.marks = st.marks.includes(v) ? st.marks.filter(m => m !== v) : st.marks.concat(v); resetFb(); }
          } else if (st.task === 'solve' && hit.t === 'col') {
            return clickTab({ t: 'cell', i: st.eqA, j: hit.j });
          }
          render(); return;
        }
        const { i, j } = hit, v = tval(i, j), txt = cellText(i, j);
        st.sel = [i, j];
        if (st.task === 'zero') {
          if (v === 0 && i !== 0 && j !== 0) { st.checked = true; fb.innerHTML = `${ok('Found one.')} ${txt}<br>Neither ${i} nor ${j} is 0, yet ${i} × ${j} is 0. Numbers like these are called <b>zero divisors</b>. Notice that neither ${i} nor ${j} has an inverse.`; }
          else if (v === 0) fb.innerHTML = `${txt}<br>That is a 0, but one of the numbers is 0 itself, and 0 × anything is 0. Look for a 0 where <em>both</em> the row number and the column number are not 0.`;
          else fb.innerHTML = `${txt}<br>That is ${v}, not 0. Look for a cell that shows 0 inside the table. If you think there is none, press None.`;
        } else if (st.task === 'solve') {
          if (i !== st.eqA) fb.innerHTML = `${txt}<br>That is another row. The equation uses ${st.eqA}x, so scan the outlined row ${st.eqA}.`;
          else {
            st.checked = false; st.marks = st.marks.includes(j) ? st.marks.filter(m => m !== j) : st.marks.concat(j);
            fb.innerHTML = `${txt}<br>${v === st.eqB ? `That equals ${st.eqB}, so x = ${j} may be a solution.` : `That is ${v}, not ${st.eqB}.`} ${st.marks.includes(j) ? 'Marked.' : 'Mark removed.'} When you have marked every column that shows ${st.eqB}, press Check.`;
          }
        } else {
          fb.innerHTML = `${txt}` + (st.op === 'mul' && v === 1 ? `<br>The product is 1, so ${i === j ? i + ' is its own <b>inverse</b>' : i + ' and ' + j + ' are <b>inverses</b> of each other'}.` : '') + (st.op === 'add' && v === 0 ? `<br>The sum is 0, so ${i} and ${j} are <b>opposites</b>.` : '');
        }
        render();
      };
      const askTab = () => {
        const n = st.n;
        if (st.task === 'probe') return `<b>Click any cell.</b> It holds the remainder of the ${st.op === 'add' ? 'sum' : 'product'} of its row number and column number, divided by ${n}.`;
        if (st.task === 'inv') return `An <b>inverse</b> of a is a number x with a × x = 1 (mod ${n}). <b>Mark every number that has one</b> (click it along the top or left edge), then press Check. Marked: ${st.marks.length ? st.marks.slice().sort((a, b) => a - b).join(', ') : 'none'}.`;
        if (st.task === 'zero') return `<b>Find two numbers, neither equal to 0, whose product is 0 (mod ${n}).</b> Click a 0 cell. If you think there is none, press None.`;
        return `<b>Solve ${st.eqA}x ≡ ${st.eqB} (mod ${n}).</b> Row ${st.eqA} lists ${st.eqA} × x for x = 0 to ${n - 1}. Click each column where the row shows ${st.eqB}, then press Check. If none, press None. Marked x: ${st.marks.length ? st.marks.slice().sort((a, b) => a - b).join(', ') : 'none'}.`;
      };
      const drawTab = (c, p) => {
        const pal = p.pal, g = tgeom(p), n = st.n, { cs, ox, oy } = g, gap = Math.max(.8, cs * .045), rad = cs * .2;
        const fz = clamp(cs * .42, 7.5, 20), showV = cs >= 15, hfz = clamp(cs * .46, 8, 17), mul = st.op === 'mul';
        const sel = st.sel, inv = st.task === 'inv', zero = st.task === 'zero', solve = st.task === 'solve';
        /* row and column bands for the probed cell */
        if (sel) {
          c.fillStyle = alpha(pal.text, .07);
          rr(c, ox - cs + 1, oy + sel[0] * cs, cs * (n + 1) - 2, cs, rad); c.fill();
          rr(c, ox + sel[1] * cs, oy - cs + 1, cs, cs * (n + 1) - 2, rad); c.fill();
        }
        if (solve) { c.fillStyle = alpha(pal.brass, .16); rr(c, ox - cs + 1, oy + st.eqA * cs, cs * (n + 1) - 2, cs, rad); c.fill(); }
        /* headers */
        for (let k = 0; k < n; k++) {
          const marked = inv && st.marks.includes(k), hv = st.hov === 'c' + k || st.hov === 'r' + k;
          for (const [x, y, key] of [[ox + k * cs, oy - cs, 'c'], [ox - cs, oy + k * cs, 'r']]) {
            const bad = marked && st.checked && invSet(n).indexOf(k) < 0;
            if (marked) { c.fillStyle = alpha(bad ? pal.red : pal.yellow, .38); rr(c, x + gap, y + gap, cs - 2 * gap, cs - 2 * gap, rad); c.fill(); rr(c, x + gap, y + gap, cs - 2 * gap, cs - 2 * gap, rad); c.strokeStyle = bad ? pal.red : pal.yellow; c.lineWidth = 2; c.stroke(); }
            else if (hv && inv) { rr(c, x + gap, y + gap, cs - 2 * gap, cs - 2 * gap, rad); c.strokeStyle = pal.brass; c.lineWidth = 1.8; c.stroke(); }
            T(c, String(k), x + cs / 2, y + cs / 2 + .5, { size: hfz, color: marked ? pal.text : pal.muted, weight: marked || (sel && (sel[key === 'r' ? 0 : 1] === k)) ? 700 : 500 });
          }
        }
        /* corner symbol */
        T(c, mul ? '×' : '+', ox - cs / 2, oy - cs / 2 + .5, { size: clamp(cs * .6, 11, 24), color: pal.muted, weight: 400 });
        /* heat map */
        const zs = zero && st.checked ? 1 : 0;
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
          const v = tval(i, j), x = ox + j * cs, y = oy + i * cs, col = ramp(pal, v / n);
          rr(c, x + gap, y + gap, cs - 2 * gap, cs - 2 * gap, rad); c.fillStyle = alpha(col, .4); c.fill();
          if (showV) T(c, String(v), x + cs / 2, y + cs / 2 + .5, { size: fz, color: pal.text });
        }
        /* outlines */
        const outline = (i, j, col, w) => { rr(c, ox + j * cs + gap, oy + i * cs + gap, cs - 2 * gap, cs - 2 * gap, rad); c.strokeStyle = col; c.lineWidth = w; c.stroke(); };
        if (inv && st.checked) for (let a = 1; a < n; a++) for (let b = 1; b < n; b++) if (tval(a, b) === 1) outline(a, b, pal.yellow, 2.2);
        if (zs) for (let a = 1; a < n; a++) for (let b = 1; b < n; b++) if (tval(a, b) === 0) outline(a, b, pal.red, 2.2);
        if (sel) outline(sel[0], sel[1], pal.brass, 3);
        if (solve) {
          const X = solSet(st.eqA, st.eqB, n);
          for (const j of st.marks) outline(st.eqA, j, pal.green, 2.8);
          if (st.checked) for (const j of X) outline(st.eqA, j, pal.yellow, 2.2);
          if (st.checked) for (const j of st.marks) if (!X.includes(j)) outline(st.eqA, j, pal.red, 2.8);
        }
        const hc = typeof st.hov === 'string' && st.hov[0] === 'k' ? st.hov.slice(1).split('_').map(Number) : null;
        if (hc && !(sel && hc[0] === sel[0] && hc[1] === sel[1])) outline(hc[0], hc[1], alpha(pal.brass, .8), 1.8);
        /* inverse pairs: thin arcs above the column numbers */
        let pairs = [];
        if (mul && ((inv && st.checked) || (sel && tval(sel[0], sel[1]) === 1 && sel[0] > 0))) {
          if (inv && st.checked) for (let a = 1; a < n; a++) { const b = inverseOf(a, n); if (b && b >= a) pairs.push([a, b]); }
          else pairs = [[Math.min(sel[0], sel[1]), Math.max(sel[0], sel[1])]];
        }
        for (const [a, b] of pairs) {
          const x1 = ox + a * cs + cs / 2, x2 = ox + b * cs + cs / 2, y = oy - cs - 3;
          c.beginPath();
          if (a === b) { c.arc(x1, y - cs * .28, cs * .28, .15 * Math.PI, .85 * Math.PI, true); c.moveTo(x1, y); }
          else { c.moveTo(x1, y); c.quadraticCurveTo((x1 + x2) / 2, y - Math.min(cs * 1.9, Math.abs(x2 - x1) * .5 + cs * .3), x2, y); }
          c.strokeStyle = alpha(pal.yellow, .95); c.lineWidth = 1.7; c.lineCap = 'round'; c.stroke();
        }
      };
      const downTab = (x, y) => { clickTab(cellAt(tgeom(P), x, y)); return null; };
      const hoverTab = (x, y) => {
        const h2 = cellAt(tgeom(P), x, y);
        if (!h2) return null;
        if (h2.t === 'row') return st.task === 'inv' ? 'r' + h2.i : null;
        if (h2.t === 'col') return st.task === 'inv' ? 'c' + h2.j : null;
        return 'k' + h2.i + '_' + h2.j;
      };

      /* =================== 4. USES: WEEKS AND CIPHERS =================== */
      const DP = [{ d: 2, days: 100 }, { d: 5, days: 45 }, { d: 0, days: 365 }, { d: 3, days: -20 }, { d: 1, days: 1000 }];
      const ENC = [{ w: 'CAT', k: 3 }, { w: 'ZOO', k: 3 }, { w: 'MATH', k: 7 }, { w: 'ZEBRA', k: 4 }];
      const DEC = [{ w: 'HELLO', k: 3 }, { w: 'CLOCK', k: 5 }, { w: 'WORLD', k: 9 }, { w: 'MODULAR', k: 11 }];
      const dp = () => DP[st.dIdx % DP.length], enc = () => ENC[st.eIdx % ENC.length], dec = () => DEC[st.eIdx % DEC.length];
      const decode = (s, k) => [...s].map(ch => ABC[mod(ABC.indexOf(ch) - k, 26)]).join('');
      const resetUse = () => {
        cancelA(); cancelS(); st.phase = 'ask'; st.hand = dp().d; st.dPick = null; st.dDone = false; st.cIdx = 0; st.eDone = []; st.eWrong = null;
        st.shift = 0; st.shiftV = 0; shS.set(0); resetFb(); render();
      };
      const newUse = () => { st.dIdx++; st.eIdx++; resetUse(); };
      const setShift = v => {
        st.shift = v; shS.set(v); cancelS(); cancelS = animateTo(st, { shiftV: v }, 320, draw); st.eWrong = null;
        if (st.act === 'dec') resetFb(); render();
      };
      /* days of the week */
      const daysTarget = () => mod(dp().d + dp().days, 7);
      const clickDays = i => {
        const { d, days } = dp(), n = st.n;
        if (st.dDone || st.phase === 'anim') return;
        if (n !== 7) { fb.innerHTML = `${no('Not yet.')} The days of the week repeat every 7 days, so the clock needs 7 positions, one for each day. Set the modulus slider to 7. Then click the day.`; render(); return; }
        const r = mod(days, 7), t = daysTarget();
        if (i !== t) {
          const off = mod(i - d, 7);
          let why = `You picked ${DAYS[i]}, which is ${off} ${off === 1 ? 'day' : 'days'} after ${DAYS[d]}. But ${sg(days)} mod 7 = ${r}, so the answer is ${r} ${r === 1 ? 'day' : 'days'} after ${DAYS[d]}.`;
          if (d !== 0 && i === r) why = `${DAYS[i]} is ${r} ${r === 1 ? 'day' : 'days'} after Sunday, the position 0. But the count has to start from ${DAYS[d]}, where the hand is.`;
          st.dPick = i; fb.innerHTML = `${no('Not yet.')} ${why} Whole weeks (7 days) change nothing. Only the left-over days matter. ${reduceText(days, 7)}`; draw(); return;
        }
        st.dPick = null; st.phase = 'anim'; resetFb(); st.dDone = true;
        const s0 = d, amt = r;
        cancelA = tween(clamp(500 + r * 160, 500, 1500), e => { st.hand = s0 + amt * ease(e); draw(); }, () => {
          st.phase = 'done'; st.hand = s0 + amt;
          const q = (days - r) / 7;
          fb.innerHTML = `${ok('Yes.')} ${days > 0 ? `${days} days is ${q} whole weeks and ${r} extra ${r === 1 ? 'day' : 'days'}` : `${sg(days)} = ${par(q)} × 7 + ${r}`}. Whole weeks bring you back to the same weekday, so only the ${r} ${r === 1 ? 'day matters' : 'days matter'}.<br>${DAYS[d]} + ${r} = <b>${DAYS[t]}</b>.<br>${reduceText(days, 7)}`;
          draw();
        });
      };
      /* Caesar wheel */
      const wgeom = p => {
        const cx = p.w / 2, cy = p.h / 2, half = Math.min(p.w, p.h) / 2;
        let R1 = half - 22, dr = clamp(R1 * .72 * Math.sin(Math.PI / 26) * .85, 6, 13); R1 = half - dr - 12;
        const R2 = R1 - dr * 2.7; dr = clamp(R2 * Math.sin(Math.PI / 26) * .85, 6, 13);
        const pos = (slot, r) => { const a = slot / 26 * TAU - Math.PI / 2; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
        return { cx, cy, R1, R2, dr, pos };
      };
      const innerHit = (x, y) => {
        const g = wgeom(P); let best = null, bd = 1e9;
        for (let j = 0; j < 26; j++) { const [px, py] = g.pos(j - st.shiftV, g.R2), d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; best = j; } }
        return bd <= g.dr + 8 ? best : null;
      };
      const encWrong = (p, j) => {
        const k = st.eK, t = mod(p + k, 26), v = p + k;
        let why;
        if (j === mod(p - k, 26) && k !== 0) why = `That is the letter you get by moving <em>back</em> ${k}. Encoding moves forward.`;
        else if (j === p) why = `That is the same letter. The shift moves it ${k} places.`;
        else if (j === mod(t + 1, 26)) why = `That is one letter too far. Remember A is number 0, not 1.`;
        else if (j === mod(t - 1, 26)) why = `That is one letter short. Count the shift in whole steps along the alphabet.`;
        else why = `You picked ${ABC[j]}, number ${j}.`;
        return `${no('Not yet.')} ${why} ${ABC[p]} is number ${p} (A = 0). ${p} + ${k} = ${v}${v >= 26 ? ', which is past 25, so subtract 26: ' + (v - 26) : ''}. Number ${t} is ${ABC[t]}. Try again.`;
      };
      const clickEnc = j => {
        const { w, k } = enc(); st.eK = k;
        if (st.cIdx >= w.length) { newUse(); return; }
        if (st.shift !== k) { fb.innerHTML = `Set the shift slider to <b>${k}</b> first. Then click the cipher letter on the inner ring.`; render(); return; }
        const p = ABC.indexOf(w[st.cIdx]), t = mod(p + k, 26);
        if (j !== t) { st.eWrong = j; fb.innerHTML = encWrong(p, j); render(); return; }
        st.eWrong = null; st.eDone.push(ABC[t]); st.cIdx++;
        const v = p + k;
        let m = `${ok('Yes.')} ${ABC[p]} is number ${p}. ${p} + ${k} = ${v}${v >= 26 ? ', past 25, so it wraps: ' + v + ' − 26 = ' + (v - 26) : ''}. Number ${t} is ${ABC[t]}.`;
        if (st.cIdx >= w.length) {
          const wrapL = [...w].find(ch => ABC.indexOf(ch) + k >= 26);
          m += `<br><b>${w} becomes ${st.eDone.join('')}.</b> Every letter moved ${k} places along the alphabet.` + (wrapL ? ` Letters past Z wrap around to A. For example ${wrapL} wrapped.` : '') + ' Press New question for another word.';
        }
        fb.innerHTML = m; render();
      };
      const checkDec = () => {
        const { w, k } = dec(), c0 = caesar(w, k);
        if (st.shift === k) {
          const L = [...c0].find(ch => ABC.indexOf(ch) - k < 0) || c0[0], c = ABC.indexOf(L);
          fb.innerHTML = `${ok('Yes.')} The message says <b>${w}</b>. Decoding subtracts the shift mod 26: ${L} is number ${c}, and ${c} − ${k} = ${c - k}${c - k < 0 ? ', which is below 0, so add 26: ' + mod(c - k, 26) : ''}, the letter ${ABC[mod(c - k, 26)]}.`;
        } else {
          fb.innerHTML = `${no('Not this one.')} With shift ${st.shift} the message reads <b>${decode(c0, st.shift)}</b>. That is not a word. Slide the shift and look for a real word. There are only 25 shifts to try.`;
        }
        render();
      };
      const askUse = () => {
        if (st.act === 'days') {
          const { d, days } = dp(), seven = st.n === 7;
          return `Today is <b>${DAYS[d]}</b>. What day of the week ${days > 0 ? `will it be <b>${days} days</b> from now` : `was it <b>${-days} days</b> ago`}?<br>` +
            (seven ? 'The modulus is 7, so the clock shows the days. <b>Click the day.</b>' : '<b>First set the modulus slider to the number of days in a week.</b> Then click the day.');
        }
        if (st.act === 'enc') {
          const { w, k } = enc();
          return `<b>Encode ${w} with shift ${k}.</b> Set the shift slider to ${k}. Then, for each letter in turn, click its cipher letter on the inner ring.` +
            (st.cIdx < w.length ? `<br><span class="k">Next letter</span> <b>${w[st.cIdx]}</b> &nbsp; <span class="k">Done so far</span> ${st.eDone.join('') || 'none'}` : '');
        }
        const { w, k } = dec();
        return `The message <b>${caesar(w, k)}</b> was encoded with an unknown shift. <b>Slide the shift until the decoded text is a real word</b>, then press This is it.<br><span class="k">Shift ${st.shift}:</span> ${decode(caesar(w, k), st.shift)}`;
      };
      const drawWheel = (c, p) => {
        const pal = p.pal, g = wgeom(p), e = st.act === 'enc', fs = clamp(g.dr * 1.05, 8.5, 14);
        c.beginPath(); c.arc(g.cx, g.cy, g.R1 + g.dr + 6, 0, TAU); c.fillStyle = alpha(pal.text, .03); c.fill(); ring(c, g.cx, g.cy, g.R1 + g.dr + 6, pal['grid-strong'], 1.3);
        ring(c, g.cx, g.cy, g.R1, pal.grid, 1.2); ring(c, g.cx, g.cy, g.R2, pal.grid, 1.2);
        /* connector for the current letter: plain slot to cipher letter */
        let conn = null;
        if (e && st.cIdx < enc().w.length) conn = ABC.indexOf(enc().w[st.cIdx]);
        if (!e) { const { w, k } = dec(), c0 = ABC.indexOf(caesar(w, k)[0]); conn = mod(c0 - st.shift, 26); }
        if (conn !== null && (!e || st.shift === enc().k)) {
          const [x1, y1] = g.pos(conn, g.R1 - g.dr), [x2, y2] = g.pos(conn, g.R2 + g.dr);
          c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.strokeStyle = alpha(pal.yellow, .9); c.lineWidth = 2.4; c.lineCap = 'round'; c.stroke();
        }
        for (let i = 0; i < 26; i++) {
          const [x, y] = g.pos(i, g.R1), col = ramp(pal, i / 26);
          c.beginPath(); c.arc(x, y, g.dr, 0, TAU); c.fillStyle = pal.stage; c.fill(); c.fillStyle = alpha(col, .26); c.fill();
          ring(c, x, y, g.dr, alpha(col, .85), conn === i ? 3 : 1.3);
          T(c, ABC[i], x, y + .5, { size: fs, color: pal.text, weight: conn === i ? 700 : 500 });
        }
        for (let j = 0; j < 26; j++) {
          const [x, y] = g.pos(j - st.shiftV, g.R2), col = ramp(pal, j / 26), wrong = st.eWrong === j && e, hv = st.hov === 'w' + j && e;
          c.beginPath(); c.arc(x, y, g.dr, 0, TAU); c.fillStyle = pal.stage; c.fill(); c.fillStyle = alpha(col, .5); c.fill();
          ring(c, x, y, g.dr, wrong ? pal.red : hv ? pal.brass : col, wrong || hv ? 3 : 1.5);
          T(c, ABC[j], x, y + .5, { size: fs, color: pal.text, weight: 600 });
        }
        const fz = clamp(g.R2 * .17, 12, 21), lab = clamp(g.R2 * .1, 9.5, 12);
        T(c, 'outer ring: plain letters', g.cx, g.cy - g.R2 * .78, { size: lab, color: pal.muted });
        T(c, 'inner ring: cipher letters', g.cx, g.cy - g.R2 * .62, { size: lab, color: pal.muted });
        T(c, `shift ${st.shift}`, g.cx, g.cy - g.R2 * .32, { size: fz, color: pal.brass, weight: 700 });
        if (e) {
          const { w } = enc(), sp = s2 => [...s2].join(' ');
          T(c, sp(w), g.cx, g.cy + g.R2 * .02, { size: fz * 1.1, color: pal.text, weight: 700 });
          T(c, sp(w.split('').map((_, i) => st.eDone[i] || '_').join('')), g.cx, g.cy + g.R2 * .3, { size: fz * 1.1, color: pal.green, weight: 700 });
        } else {
          const { w, k } = dec(), cc = caesar(w, k);
          T(c, [...cc].join(' '), g.cx, g.cy + g.R2 * .02, { size: fz * 1.05, color: pal.text, weight: 700 });
          T(c, '↓', g.cx, g.cy + g.R2 * .2, { size: fz * .9, color: pal.muted });
          T(c, [...decode(cc, st.shift)].join(' '), g.cx, g.cy + g.R2 * .38, { size: fz * 1.05, color: st.shift === k ? pal.green : pal.violet, weight: 700 });
        }
      };
      const drawDays = (c, p) => {
        const pal = p.pal, n = st.n, seven = n === 7, g = clockGeom(p, n, 27), { d, days } = dp(), fs = clamp(g.dr * (seven ? .6 : .95), 11, 18);
        drawFace(c, g, pal);
        if (seven && st.phase !== 'ask') drawTrail(c, g, pal, d, st.hand);
        const t = daysTarget();
        drawDots(c, g, pal, i => {
          const o = { label: seven ? D3[i] : String(i) };
          if (seven && i === d) { o.fill = alpha(pal.blue, .25); o.stroke = pal.blue; o.w = 3; o.bold = true; }
          if (seven && st.phase === 'done' && i === t) { o.fill = alpha(pal.green, .3); o.stroke = pal.green; o.w = 3; o.bold = true; }
          if (st.dPick === i) { o.fill = alpha(pal.red, .22); o.stroke = pal.red; o.w = 3; }
          if (st.hov === i && st.phase !== 'anim' && !st.dDone) { o.stroke = pal.brass; o.w = 2.4; }
          return o;
        }, fs);
        drawHand(c, g, pal, seven ? st.hand : 0);
        const fz = clamp(g.R * .1, 11.5, 19), y0 = g.cy + g.R * .27;
        T(c, `mod ${n}`, g.cx, g.cy - g.R * .28, { size: fz, color: pal.muted, halo: pal.stage });
        if (seven) {
          T(c, `${DAYS[d].slice(0, 3)} ${days < 0 ? '−' : '+'} ${Math.abs(days)}`, g.cx, y0, { size: fz, color: pal.text, halo: pal.stage });
          if (st.phase === 'done') T(c, `${sg(days)} mod 7 = ${mod(days, 7)}`, g.cx, y0 + fz * 1.5, { size: fz, color: pal.green, weight: 700, halo: pal.stage });
        } else T(c, 'set n to 7', g.cx, y0, { size: fz, color: pal.muted, halo: pal.stage });
      };

      /* =================== wiring =================== */
      const M = {
        add: { ask: askAdd, draw: drawAdd,
          down: (x, y) => { const i = hitClock(clockGeom(P, st.n), x, y); if (i !== null) clickAdd(i); return null; },
          hover: (x, y) => { const i = hitClock(clockGeom(P, st.n), x, y); return i; } },
        cong: { ask: askCong, draw: drawCong, down: downCong, drag: dragCong, hover: hoverCong },
        tab: { ask: askTab, draw: drawTab, down: downTab, hover: hoverTab },
        use: { ask: askUse,
          draw: (c, p) => (st.act === 'days' ? drawDays(c, p) : drawWheel(c, p)),
          down: (x, y) => {
            if (st.act === 'days') { const i = hitClock(clockGeom(P, st.n, 27), x, y); if (i !== null) clickDays(i); }
            else if (st.act === 'enc') { const j = innerHit(x, y); if (j !== null) clickEnc(j); }
            return null;
          },
          hover: (x, y) => {
            if (st.act === 'days') return hitClock(clockGeom(P, st.n, 27), x, y);
            if (st.act === 'enc') { const j = innerHit(x, y); return j === null ? null : 'w' + j; }
            return null;
          } }
      };
      const render = () => {
        const m = st.mode, tk = st.task;
        askEl.innerHTML = M[m].ask();
        vis(gN, !(m === 'use' && st.act !== 'days'));
        vis(gAdd, m === 'add'); vis(gAmt, st.qtype === 'land'); showBtn.disabled = st.phase !== 'ask';
        vis(gCong, m === 'cong'); vis(gTF, st.practice === 'test'); vis(newBtn, st.practice !== 'explore'); vis(gX, st.practice !== 'test');
        vis(gTab, m === 'tab'); vis(gOp, tk === 'probe'); vis(gEq, tk === 'solve'); vis(chkBtn, tk === 'inv' || tk === 'solve'); vis(noBtn, tk !== 'probe');
        noBtn.textContent = tk === 'inv' ? 'Clear marks' : tk === 'zero' ? 'None exist' : 'No solution';
        vis(gUse, m === 'use'); vis(gShift, st.act !== 'days'); vis(itBtn, st.act === 'dec');
        draw();
      };
      P.onDraw = (c, p) => M[st.mode].draw(c, p);

      /* clear every transient answer state (after a step, a new modulus or a new mode) */
      const resetAll = () => {
        cancelA(); cancelS();
        st.phase = 'ask'; st.pick = null; st.hand = st.mode === 'use' ? dp().d : st.s;
        st.cOk = false; st.rimWrong = null; st.stmtDone = false; st.stmt = genStmt(st.stmtK, st.n);
        st.sel = null; st.marks = []; st.checked = false;
        st.dPick = null; st.dDone = false; st.cIdx = 0; st.eDone = []; st.eWrong = null; st.hov = null;
        if (st.mode === 'use') { st.shift = 0; st.shiftV = 0; shS.set(0); }
        resetFb(); render();
      };
      const syncUI = () => {
        nS.set(st.n); sS.set(st.s); aS.set(st.a); xS.set(st.x); eaS.set(st.eqA); ebS.set(st.eqB);
        qSel.value = st.qtype; prSel.value = st.practice; tkSel.value = st.task; opSel.value = st.op; acSel.value = st.act;
      };
      function onN() {
        const n = st.n;
        st.s = clamp(st.s, 0, n - 1); st.x = clamp(st.x, -n, 2 * n - 1); st.eqA = clamp(st.eqA, 1, n - 1); st.eqB = clamp(st.eqB, 0, n - 1);
        syncUI(); resetAll();
      }

      /* ---------- pointer ---------- */
      const xy = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      cv.addEventListener('pointerdown', e => {
        const [x, y] = xy(e), r = M[st.mode].down(x, y);
        if (r === 'drag') { dragging = true; cv.setPointerCapture(e.pointerId); e.preventDefault(); }
      });
      cv.addEventListener('pointermove', e => {
        const [x, y] = xy(e);
        if (dragging) { if (M[st.mode].drag) M[st.mode].drag(x, y); return; }
        const k = M[st.mode].hover ? M[st.mode].hover(x, y) : null;
        cv.style.cursor = k === null || k === undefined ? 'default' : (st.mode === 'cong' && !String(k).startsWith('rim') ? 'grab' : 'pointer');
        if (k !== st.hov) { st.hov = k; draw(); }
      });
      cv.addEventListener('pointerleave', () => { if (st.hov !== null) { st.hov = null; draw(); } });
      const end = () => { dragging = false; };
      cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);

      /* ---------- steps ---------- */
      const apply = patch => {
        cancelA(); cancelS();
        for (const k of ['mode', 'qtype', 'practice', 'task', 'op', 'act']) if (patch[k] !== undefined) st[k] = patch[k];
        for (const k of ['n', 's', 'a', 'x', 'eqA', 'eqB']) if (patch[k] !== undefined) st[k] = patch[k];
        const n = st.n;
        st.s = clamp(st.s, 0, n - 1); st.x = clamp(st.x, -n, 2 * n - 1); st.eqA = clamp(st.eqA, 1, n - 1); st.eqB = clamp(st.eqB, 0, n - 1);
        if (st.task !== 'probe') st.op = 'mul';
        syncUI(); resetAll();
      };
      apply({ mode: 'add', qtype: 'land', n: 12, s: 9, a: 5 });
      return { destroy: () => { cancelA(); cancelS(); P.destroy(); }, apply };
    }
  });
}
