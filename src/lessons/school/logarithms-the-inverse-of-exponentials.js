/* =====================================================================
   SCHOOL — Logarithms: the inverse of exponentials
   ===================================================================== */
{
  const nf = (v, d = 2) => { const s = String(+Math.abs(v).toFixed(d)); return (v < 0 && +s !== 0 ? '−' : '') + s; };
  const lg = v => Math.log10(v);
  const SUBS = '₀₁₂₃₄₅₆₇₈₉';
  const bTxt = b => (b === .5 ? '½' : String(b));
  const logT = b => (b === .5 ? 'log base ½' : 'log' + String(b).replace(/\d/g, d => SUBS[d]));
  const cStr = c => { if (c < 1) { const n = Math.round(1 / c); if (Math.abs(n * c - 1) < 1e-9) return '1/' + n; } return String(c); };
  const vTxt = v => {
    if (v < 1) { const n = Math.round(1 / v); if (n > 1 && Math.abs(n * v - 1) < 1e-9) return '1/' + n; }
    return (Math.abs(+v.toFixed(3) - v) < 1e-9 ? '' : '≈ ') + nf(v, 3);
  };
  const niceStep = v => { const e = Math.pow(10, Math.floor(Math.log10(v))), f = v / e; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * e; };
  const kk = t => `<span class="k">${t}</span>`;
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const powH = (b, e) => `${bTxt(b)}<sup>${e}</sup>`;

  /* ---------- the exponential graph with a target (modes: exp, solve, and practice) ---------- */
  const expView = (b, c) => {
    const Lg = Math.log(c) / Math.log(b);
    return { Lg, xlo: Math.min(-1, Math.floor(Lg - .6)), xhi: Math.max(1, Math.ceil(Lg + .6)), ymax: Math.max(c, 1) * 1.4 };
  };
  const expRange = (b, c) => {
    const V = expView(b, c), xs = Math.log(V.ymax) / Math.log(b);
    return b > 1 ? [V.xlo, Math.min(V.xhi, xs)] : [Math.max(V.xlo, xs), V.xhi];
  };
  const GW = 10, GH = 6.2;
  const expPt = (b, c, x) => {
    const V = expView(b, c);
    return [(x - V.xlo) / (V.xhi - V.xlo) * GW, Math.pow(b, x) / V.ymax * GH];
  };
  const capText = (p, text) => {
    const c = p.ctx; let size = clamp(Math.min(p.w, p.h) * .045, 14.5, 19);
    const set = () => { c.font = `600 ${size}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`; };
    set(); while (c.measureText(text).width > p.w - 28 && size > 11) { size -= .5; set(); }
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(text, p.w / 2, 20);
    c.fillStyle = p.pal.text; c.fillText(text, p.w / 2, 20);
  };

  const drawExp = (p, s, o) => {
    const pal = p.pal, V = expView(s.b, s.c);
    p.fit(GW, GH, { l: 1.5, r: .5, t: 1.35, b: 1.25 });
    const sc = p.scale, fs = clamp(sc * .34, 15, 18);
    const ux = x => (x - V.xlo) / (V.xhi - V.xlo) * GW, vy = y => y / V.ymax * GH;
    const ys = niceStep(V.ymax / 5), xs = Math.max(1, niceStep((V.xhi - V.xlo) / 7));
    for (let v = 0; v <= V.ymax + 1e-9; v += ys) {
      p.path([[0, vy(v)], [GW, vy(v)]], { stroke: pal.grid, width: 1.5 });
      p.label(nf(v, 2), 0, vy(v), { size: fs, italic: false, color: pal.muted, align: 'right', dx: -9 });
    }
    for (let x = Math.ceil(V.xlo / xs) * xs; x <= V.xhi + 1e-9; x += xs) {
      p.path([[ux(x), 0], [ux(x), GH]], { stroke: pal.grid, width: 1.5 });
      p.label(nf(x, 0), ux(x), 0, { size: fs, italic: false, color: pal.muted, dy: 16 });
    }
    p.path([[0, 0], [GW, 0]], { stroke: pal['grid-strong'], width: 2 });
    p.path([[ux(0), 0], [ux(0), GH]], { stroke: pal['grid-strong'], width: 2 });
    p.label('exponent ' + (o.v || 'x'), s.b < 1 ? 0 : GW, 0, { size: fs, italic: false, color: pal.muted, align: s.b < 1 ? 'left' : 'right', dx: s.b < 1 ? 8 : 0, dy: -14 });
    p.label('value of ' + bTxt(s.b) + '^' + (o.v || 'x'), 0, GH, { size: fs, italic: false, color: pal.muted, align: 'left', dy: -16 });
    /* the curve, cut where it leaves the picture */
    const N = 320, pts = [], lb = Math.log(s.b), xc = Math.log(V.ymax) / lb;
    let prev = null;
    for (let i = 0; i <= N; i++) {
      const x = V.xlo + (V.xhi - V.xlo) * i / N, y = Math.pow(s.b, x), inside = y <= V.ymax;
      if (inside) { if (prev === false) pts.push([ux(xc), vy(V.ymax)]); pts.push([ux(x), vy(y)]); }
      else if (prev === true) pts.push([ux(xc), vy(V.ymax)]);
      prev = inside;
    }
    p.curve(pts, { stroke: pal.blue, width: 3.5 });
    /* the target */
    p.path([[0, vy(s.c)], [GW, vy(s.c)]], { stroke: pal.yellow, width: 3, dash: [8, 6] });
    p.label('target ' + (o.tTxt || cStr(s.c)), GW, vy(s.c), { size: fs, italic: false, color: pal.yellow, align: 'right', dy: -14 });
    if (o.reveal) {
      const [qx, qy] = [ux(V.Lg), vy(s.c)];
      p.path([[qx, 0], [qx, qy]], { stroke: pal.yellow, width: 2.4, dash: [5, 5] });
      p.dot(qx, qy, 7, pal.yellow, pal.stage, 2);
      p.label((o.v || 'x') + ' = ' + nf(V.Lg, o.dg == null ? 2 : o.dg), qx, qy, { size: fs, italic: false, color: pal.text, align: qx > GW * .6 ? 'right' : 'left', dx: qx > GW * .6 ? -12 : 12, dy: 20 });
    }
    if (o.handle) {
      const [hx, hy] = expPt(s.b, s.c, s.x), val = Math.pow(s.b, s.x), hit = Math.abs(val - s.c) <= .01 * s.c;
      p.path([[hx, 0], [hx, hy]], { stroke: pal['grid-strong'], width: 1.8, dash: [5, 6] });
      p.dot(hx, hy, 9, hit ? pal.green : pal.stage, pal.brass, 3.5);
      const right = hx > GW * .55;
      p.label(`${bTxt(s.b)}^${nf(s.x)} = ${nf(val, val >= 100 ? 0 : 2)}`, hx, hy, { size: fs, italic: false, color: hit ? pal.green : pal.text, align: right ? 'right' : 'left', dx: right ? -14 : 14, dy: hy * sc < 30 ? -20 : right ? -16 : 18 });
    }
    if (o.cap) capText(p, o.cap);
  };

  /* ---------- the graph and its mirror ---------- */
  const tMax = b => Math.min(3, Math.floor(2 * Math.log(9.5) / Math.log(b > 1 ? b : 1 / b)) / 2);
  const drawMirror = (p, s, o) => {
    const pal = p.pal, b = s.b, lb = Math.log(b);
    p.cx = 3.4; p.cy = 3.9; p.span = 6.8;
    const fs = clamp(Math.min(p.w, p.h) * .042, 15, 18);
    p.grid(1); p.ticks(1, { size: fs });
    p.path([[-4, -4], [12, 12]], { stroke: pal.violet, width: 2.6, dash: [9, 7] });
    p.label('mirror line y = x', 10.1, 4.6, { size: fs, italic: false, color: pal.violet, align: 'right' });
    const ex = [], lgc = [];
    for (let i = 0; i <= 480; i++) { const x = -5 + 17 * i / 480; ex.push([x, Math.pow(b, x)]); }
    for (let i = 0; i <= 320; i++) { const x = .003 * Math.pow(13 / .003, i / 320); lgc.push([x, Math.log(x) / lb]); }
    p.curve(lgc, { stroke: pal.red, width: 3.5 });
    p.curve(ex, { stroke: pal.blue, width: 3.5 });
    const t = s.t, v = Math.pow(b, t);
    const eqE = 'y = ' + bTxt(b) + '^x', eqL = 'y = ' + logT(b) + ' x';
    p.label(eqE, b > 1 ? -3.4 : 5.4, 1.3, { size: fs, italic: false, color: pal.blue, align: 'left' });
    p.label(eqL, 9.8, b > 1 ? 1 : -1.8, { size: fs, italic: false, color: pal.red, align: 'right' });
    if (!o.hideQ) {
      p.path([[t, v], [v, t]], { stroke: pal.muted, width: 2, dash: [4, 5] });
      p.dot((t + v) / 2, (t + v) / 2, 4, pal.violet, pal.stage, 1.5);
    }
    const tags = [[t, v, 'P', pal.blue, v >= t], [v, t, 'Q', pal.red, t > v]];
    tags.forEach(([x, y, nm, col, up], i) => {
      if (i === 1 && o.hideQ) return;
      const px = p.X(x), nearX = Math.abs(y) < 1.3, nearY = Math.abs(x) < 1.6;
      const al = nearY ? 'left' : (up ? px > 120 : px > p.w - 120) ? 'right' : 'left';
      p.label(`${nm} (${nf(x, 2)}, ${nf(y, 2)})`, x, y, { size: fs, italic: false, color: pal.text, align: al, dx: al === 'left' ? 13 : -13, dy: nearX || up ? -17 : 19 });
      if (o.handle) p.dot(x, y, 9, pal.stage, pal.brass, 3.5); else p.dot(x, y, 6, col, pal.stage, 2);
    });
    if (o.cap) capText(p, o.cap);
  };

  /* ---------- the log rulers ---------- */
  let lay = { X0: 16, sw: 100, oy: 0, h: 300, BH: 38 };
  const BH = 38;
  const kit = (p, D) => {
    const w = p.w, h = p.h; p.cx = w / 2; p.cy = h / 2; p.span = Math.min(w, h) / 2;
    const X0 = 16, sw = (w - X0 - 26) / D, fs = clamp(Math.min(w, h) * .043, 15, 18), oy = clamp((h - 270) * .35, 0, 130);
    lay = { X0, sw, oy, h, BH, hy: -99 };
    return {
      w, h, X0, sw, fs, oy, px: u => X0 + u * sw,
      T: (t, x, y, ob) => p.label(t, x, h - y, ob),
      L: (x0, y0, x1, y1, ob) => p.path([[x0, h - y0], [x1, h - y1]], ob),
      box: (x, y, ww, hh, ob) => p.path([[x, h - y], [x + ww, h - y], [x + ww, h - y - hh], [x, h - y - hh]], Object.assign({ close: true }, ob))
    };
  };
  /* one ruler: a band of `dec` decades, left end at log-position u0 */
  const band = (k, p, u0, dec, y, fill, maxU = 99) => {
    const pal = p.pal, ticks = [], cut = Math.min(dec, maxU - u0);
    k.box(k.px(u0), y, cut * k.sw, BH, { fill, stroke: pal['grid-strong'], width: 1.5 });
    for (let d = 0; d < dec; d++) for (let m = 1; m <= 9; m++) ticks.push({ v: m * Math.pow(10, d), x: k.px(u0 + d + lg(m)), big: m === 1, mid: m === 5 });
    ticks.push({ v: Math.pow(10, dec), x: k.px(u0 + dec), big: true });
    for (let n = ticks.length - 1; n >= 0; n--) if (ticks[n].x > k.px(u0 + cut) + .5) ticks.splice(n, 1);
    const lab = ticks.filter(t => t.big);
    ticks.forEach(t => { if (!t.big && lab.every(l => Math.abs(l.x - t.x) >= 27)) lab.push(t); });
    ticks.forEach(t => k.L(t.x, y, t.x, y + (t.big ? 17 : t.mid ? 13 : 9), { stroke: pal.text, width: t.big ? 2 : 1.4 }));
    lab.forEach(t => k.T(String(t.v), t.x, y + 28, { size: k.fs, italic: false, color: pal.text }));
  };
  const bar = (k, p, u0, u1, y, color, text) => {
    const x0 = k.px(Math.min(u0, u1)), x1 = k.px(Math.max(u0, u1));
    if (x1 - x0 < 1) return;
    k.box(x0, y, x1 - x0, 18, { fill: alpha(color, .55), stroke: color, width: 1.5 });
    if (text && x1 - x0 >= 44) k.T(text, (x0 + x1) / 2, y + 10, { size: k.fs - 1, italic: false, color: p.pal.text });
  };
  const handleDot = (k, p, x, yBelow) => {
    k.L(x, yBelow - 11, x, yBelow, { stroke: p.pal.brass, width: 2 });
    p.dot(x, k.h - yBelow - 9, 9, p.pal.stage, p.pal.brass, 3.5);
  };

  const drawRuler = (p, s, o) => {
    const pal = p.pal, op = s.rop, k = kit(p, op === 'pow' ? 3 : 2), oy = k.oy, hide = o.hide;
    const yT = 36 + oy * .4;
    const qs = [], later = fn => qs.push(fn), flush = () => qs.forEach(fn => fn());
    const line = (t, y, col) => k.T(t, k.w / 2, y, { size: k.fs, italic: false, color: col || pal.text });
    if (op === 'pow') {
      const a = s.pa, n = s.pn, la = lg(a), yA = yT + 50;
      later(() => band(k, p, 0, 3, yA, alpha(pal.blue, .1)));
      for (let i = 0; i < n; i++) bar(k, p, i * la, (i + 1) * la, yT + 22, pal.green, i === 0 || n < 5 ? nf(la, 3) : '');
      for (let i = 1; i <= n; i++) {
        const x = k.px(i * la), last = i === n;
        if (hide) continue;
        k.L(x, yT + 22, x, yA + BH, { stroke: last ? pal.yellow : pal['grid-strong'], width: last ? 3 : 1.2, dash: last ? [] : [3, 4] });
        k.T(String(Math.pow(a, i)), x, yT + 10, { size: k.fs, italic: false, color: last ? pal.yellow : pal.muted });
      }
      if (!hide) {
        const lt = n * +nf(la, 3), A = Math.pow(a, n);
        line(`${n} × log ${a} = ${n} × ${nf(la, 3)} = ${nf(lt, 3)}, the length of log ${A}`, yA + BH + 34);
        line(`so ${a}^${n} = ${A}`, yA + BH + 56, pal.yellow);
      } else line(`${n} steps, each as long as log ${a} = ${nf(la, 3)}`, yA + BH + 34);
      flush(); return;
    }
    const yA = yT + 54 + oy * .3, yB = yA + BH;
    later(() => band(k, p, 0, 2, yA, alpha(pal.blue, .1)));
    if (op === 'prod') {
      const ra = s.ra, rb = s.rb, la = lg(ra), lb = lg(rb), lp = la + lb, prod = ra * rb;
      if (!hide) { bar(k, p, 0, la, yT, pal.green, nf(la, 3)); bar(k, p, la, lp, yT, pal.red, nf(lb, 3)); } else { bar(k, p, 0, la, yT, pal.green, nf(la, 3)); }
      later(() => band(k, p, la, 1, yB, alpha(pal.violet, .13), 2));
      k.L(k.px(la), yT + 20, k.px(la), yB + BH, { stroke: pal.green, width: 3 });
      if (!hide) k.L(k.px(lp), yT + 20, k.px(lp), yB + BH, { stroke: pal.yellow, width: 3 });
      k.T(nf(ra, 2), k.px(la), yT + 30, { size: k.fs, italic: false, color: pal.green, dx: ra < 1.5 ? 4 : 0 });
      if (!hide && Math.abs(prod - ra) > .4) k.T(nf(prod, 2), k.px(lp), yT + 30, { size: k.fs + 1, italic: false, color: pal.yellow });
      lay.hy = yB + BH + 21; if (!o.nohandle) { handleDot(k, p, k.px(la), yB + BH + 12); if (rb > 1.2) handleDot(k, p, k.px(lp), yB + BH + 12); }
      const ya = yB + BH + 46;
      if (!hide) {
        const a3 = nf(la, 3), b3 = nf(lb, 3), sm = +a3 + +b3;
        line(`log ${nf(ra, 2)} + log ${nf(rb, 2)} = ${a3} + ${b3} = ${nf(sm, 3)}`, ya);
        line(`that is the length of log ${nf(prod, 2)}, so ${nf(ra, 2)} × ${nf(rb, 2)} = ${nf(prod, 2)}`, ya + 22, pal.yellow);
      } else line(`B's 1 sits on A's ${ra}. Look above B's ${rb}.`, ya);
    } else {
      const X = s.rx, q = s.rq, lx = lg(X), lq = lg(q), la = lx - lq, ans = X / q;
      bar(k, p, 0, lx, yT, pal.green, nf(lx, 3));
      bar(k, p, la, lx, yT + 22, pal.red, '−' + nf(lq, 3));
      later(() => band(k, p, la, 1, yB, alpha(pal.violet, .13), 2));
      k.L(k.px(lx), yT + 20, k.px(lx), yB + BH, { stroke: pal.yellow, width: 3 });
      if (!hide) k.L(k.px(la), yT + 42, k.px(la), yB + BH, { stroke: pal.green, width: 3 });
      lay.hy = yB + BH + 21; if (!o.nohandle) handleDot(k, p, k.px(lx), yB + BH + 12);
      const ya = yB + BH + 46;
      if (!hide) {
        const x3 = nf(lx, 3), q3 = nf(lq, 3);
        line(`log ${X} − log ${nf(q, 2)} = ${x3} − ${q3} = ${nf(+x3 - +q3, 3)}`, ya);
        line(`that is the length of log ${nf(ans, 2)}, so ${X} ÷ ${nf(q, 2)} = ${nf(ans, 2)}`, ya + 22, pal.green);
      } else line(`B's ${q} sits under A's ${X}. Look above B's 1.`, ya);
    }
    flush();
  };

  /* ---------- the walk of hops (change of base) ---------- */
  const drawBase = (p, s, o) => {
    const pal = p.pal, b = s.bb, c = s.bc, k = kit(p, 2), oy = k.oy, lb = lg(b), lc = lg(c);
    const yA = 130 + oy * .6;
    band(k, p, 0, 2, yA, alpha(pal.blue, .1));
    const arc = (u0, u1, col, dash, txt) => {
      const x0 = k.px(u0), x1 = k.px(u1), hh = clamp((x1 - x0) * .5, 8, 34), pts = [];
      for (let i = 0; i <= 24; i++) { const a = Math.PI * i / 24; pts.push([(x0 + x1) / 2 - (x1 - x0) / 2 * Math.cos(a), k.h - (yA - 4 - hh * Math.sin(a))]); }
      p.path(pts, { stroke: col, width: 3.2, dash });
      if (txt && x1 - x0 >= 30) k.T(txt, (x0 + x1) / 2, yA - 12 - hh, { size: k.fs, italic: false, color: col });
    };
    let i = 0;
    for (; (i + 1) * lb <= lc + 1e-9; i++) arc(i * lb, (i + 1) * lb, pal.green, [], '×' + b);
    const rest = lc - i * lb;
    if (rest > 1e-6) arc(i * lb, lc, pal.yellow, [6, 5], o.hide ? '' : nf(rest / lb, 2));
    for (let j = 0; j <= i; j++) {
      const x = k.px(j * lb); k.L(x, yA - 8, x, yA + BH, { stroke: pal.green, width: 3 });
      if (Math.abs(k.px((j + 1) * lb) - x) >= 26 || j === i) k.T(String(Math.pow(b, j)), x, yA + BH + 14, { size: k.fs, italic: false, color: pal.green });
    }
    const xc = k.px(lc); k.L(xc, yA - 8, xc, yA + BH, { stroke: pal.yellow, width: 3.5 });
    k.T(String(c), xc, yA - 48, { size: k.fs + 1, italic: false, color: pal.yellow, align: xc > k.w - 40 ? 'right' : 'center', dx: xc > k.w - 40 ? 8 : 0 });
    const ya = yA + BH + 46, ln_ = s.calc === 'ln', f = ln_ ? Math.LN10 : 1, nm = ln_ ? 'ln' : 'log';
    if (!o.hide) {
      k.T(`one hop: ${nm} ${b} = ${nf(lb * f, 4)}`, k.w / 2, ya, { size: k.fs, italic: false, color: pal.green });
      k.T(`whole walk: ${nm} ${c} = ${nf(lc * f, 4)}`, k.w / 2, ya + 22, { size: k.fs, italic: false, color: pal.yellow });
      k.T(`hops = ${nf(lc * f, 4)} ÷ ${nf(lb * f, 4)} = ${nf(lc / lb, 2)}`, k.w / 2, ya + 44, { size: k.fs, italic: false, color: pal.text });
    } else k.T(`hops of ×${b} from 1 to ${c}: how many?`, k.w / 2, ya, { size: k.fs, italic: false, color: pal.text });
    if (o.cap) capText(p, o.cap);
  };

  /* ---------- the solve-mode equations ---------- */
  const EQ = [
    { b: 2, c: 8, v: 'x', dg: 0, name: '2^x = 8', story: 'Eight is a whole number of doublings, so the answer comes out whole.' },
    { b: 2, c: 10, v: 'x', dg: 2, name: '2^x = 10', story: 'Ten is not a power of 2, so the answer is between 3 and 4.' },
    { b: 1.05, c: 2, v: 't', dg: 1, name: '1.05^t = 2', story: 'Money grows 5% a year. How many years until it doubles?' },
    { b: .9, c: .5, v: 't', dg: 1, name: '0.9^t = 0.5', story: 'A drug loses 10% each hour. How many hours until half is left?' }
  ];

  /* ---------- practice problems (a fixed list) ---------- */
  const PROBS = [
    { name: 'Evaluate a log', fig: { kind: 'exp', b: 2, c: 32 }, ans: 1,
      q: 'What is log₂ 32?',
      ch: [['16', 'That is 32 ÷ 2. A log asks "2 to what power?", not "32 divided by what?". Count the 2s: 2 × 2 × 2 × 2 × 2 = 32.'],
        ['5', 'Yes. 2 × 2 × 2 × 2 × 2 = 32, five 2s, so 2⁵ = 32 and log₂ 32 = 5. The graph of y = 2^x meets the line y = 32 at x = 5.'],
        ['64', 'That is 2 × 32. The log is the exponent: the power of 2 that makes 32.'],
        ['1/5', 'That is the question flipped, "32 to what power gives 2?" The base is the 2 written small. Here you need 2 to some power to make 32.']] },
    { name: 'A negative log', fig: { kind: 'exp', b: 3, c: 1 / 9 }, ans: 3,
      q: 'What is log₃ (1/9)?',
      ch: [['2', '3² = 9, not 1/9. To get a number below 1 the exponent must be negative.'],
        ['−3', '3⁻³ = 1/27. Try one step closer to 0.'],
        ['1/2', '3^(1/2) is the square root of 3, about 1.73. It is not 1/9.'],
        ['−2', 'Yes. 3⁻² = 1/3² = 1/9, so log₃ (1/9) = −2. On the graph, the line y = 1/9 meets the curve to the left of the y-axis, where x is negative.']] },
    { name: 'Exponent form to log form', fig: { kind: 'exp', b: 5, c: 125 }, ans: 0,
      q: '5³ = 125 can be written as a logarithm statement. Which one?',
      ch: [['log₅ 125 = 3', 'Yes. The base 5 stays the base, 125 is the number we reach, and the log equals the exponent 3. Read it as "5 to the power 3 is 125".'],
        ['log₃ 125 = 5', 'That moves the exponent into the base. The base is the number being raised to a power, here 5.'],
        ['log₁₂₅ 3 = 5', 'Here 125 became the base. 125 is the result of the power, not the number being raised.'],
        ['log₅ 3 = 125', 'That swaps the exponent and the result. The log equals the exponent, 3. And 5 to the 125 would be huge.']] },
    { name: 'The mirror image', fig: { kind: 'mirror', b: 2, t: 3 }, ans: 2,
      q: 'The point (3, 8) is on the graph of y = 2^x. Which point must be on the graph of y = log₂ x?',
      ch: [['(−3, 8)', 'That is the mirror image in the y-axis. The log graph is the mirror image in the line y = x.'],
        ['(3, −8)', 'That is the mirror image in the x-axis. Reflecting in y = x swaps the coordinates.'],
        ['(8, 3)', 'Yes. Swap the coordinates: log₂ 8 = 3, so (8, 3) is on y = log₂ x. It is the mirror image of (3, 8) in the line y = x.'],
        ['(1/8, 3)', 'That would need log₂ (1/8) = 3, but log₂ (1/8) = −3. The x-coordinate is 8 itself, not its reciprocal.']] },
    { name: 'Product on the rulers', fig: { kind: 'ruler', rop: 'prod', ra: 4, rb: 5 }, ans: 1,
      q: 'On two log rulers, the sliding ruler B has its 1 under the 4 on ruler A. Which number on A sits above the 5 on B?',
      ch: [['9', 'That adds 4 + 5, which is what ordinary rulers do. Log rulers add the lengths log 4 and log 5, and adding logs multiplies the numbers.'],
        ['20', 'Yes. log 4 + log 5 = log 20, so the 5 on B lines up with 4 × 5 = 20 on A.'],
        ['25', 'That is 5 × 5. B starts at the 4, so the factor is 4 × 5.'],
        ['1.25', 'That is 5 ÷ 4. Dividing means sliding the other way, subtracting a length.']] },
    { name: 'Quotient on the rulers', fig: { kind: 'ruler', rop: 'quot', rx: 60, rq: 5 }, ans: 0,
      q: 'To divide 60 by 5, slide ruler B so that its 5 is under the 60 on ruler A. Which number on A sits above the 1 on B?',
      ch: [['12', 'Yes. Sliding B left by log 5 subtracts that length: log 60 − log 5 = log 12. So 60 ÷ 5 = 12.'],
        ['55', 'That subtracts 60 − 5. The rulers subtract the logs, which divides the numbers.'],
        ['300', 'That is 60 × 5, what you get by sliding B right instead, with its 1 on the 60 and reading at the 5.'],
        ['65', 'That adds 60 + 5. Sliding B left subtracts log 5, so the number is divided.']] },
    { name: 'The power rule', fig: { kind: 'ruler', rop: 'pow', pa: 5, pn: 3 }, ans: 3,
      q: 'log 5 is about 0.699. Use the power rule to find log (5³), the log of 125.',
      ch: [['3.699', 'That adds 3 to log 5. The power rule turns the exponent into a multiplier: 3 × 0.699.'],
        ['0.233', 'That divides by 3. Three steps of length 0.699 make a longer walk, not a shorter one.'],
        ['0.341', 'That cubes the log (0.699³). The exponent 3 belongs to the 5. It comes down in front as 3 × log 5.'],
        ['2.097', 'Yes. log (5³) = 3 × log 5 = 3 × 0.699 = 2.097. Check: 125 is between 100 and 1000, so its log is between 2 and 3.']] },
    { name: 'Solve by taking logs', fig: { kind: 'exp', b: 3, c: 20 }, ans: 2,
      q: 'Solve 3^x = 20.',
      ch: [['x = 20 ÷ 3 ≈ 6.67', 'That treats 3^x as 3 times x. But x is the exponent. Check: 3⁶ is 729, far above 20.'],
        ['x = log 3 ÷ log 20 ≈ 0.37', 'That is the right idea upside down. After x · log 3 = log 20, divide by log 3, so log 3 is on the bottom. Check: 3^0.37 is only about 1.5.'],
        ['x = log 20 ÷ log 3 ≈ 2.73', 'Yes. Take logs: x · log 3 = log 20, so x = 1.3010 ÷ 0.4771 ≈ 2.73. Check: 3² = 9 and 3³ = 27, and 20 is between them.'],
        ['x = log (20 − 3) ≈ 1.23', 'There is no rule that turns a subtraction into the log of a difference. The rules turn products into sums, not sums into products.']] },
    { name: 'Doubling time', fig: { kind: 'exp', b: 1.08, c: 2 }, ans: 1,
      q: 'Money grows 8% a year, compounded yearly. The doubling time t solves 1.08^t = 2. Use ln 2 ≈ 0.6931 and ln 1.08 ≈ 0.0770. About how many years?',
      ch: [['12.5 years', 'That is 100 ÷ 8, the time simple interest would need, since it adds 8% of the start each year. Compounding earns interest on interest, so it is faster.'],
        ['about 9 years', 'Yes. t = ln 2 ÷ ln 1.08 = 0.6931 ÷ 0.0770 ≈ 9. Check: 1.08⁹ is about 2.0.'],
        ['about 0.11 years', 'That divides the other way, 0.0770 ÷ 0.6931. The log of the base goes on the bottom.'],
        ['16 years', 'That is 2 × 8, which has no meaning here. Use t = ln 2 ÷ ln 1.08.']] },
    { name: 'Change of base', fig: { kind: 'base', bb: 5, bc: 40 }, ans: 0,
      q: 'Use log 40 ≈ 1.602 and log 5 ≈ 0.699 to find log₅ 40, the exponent that turns 5 into 40.',
      ch: [['about 2.29', 'Yes. log₅ 40 = log 40 ÷ log 5 = 1.602 ÷ 0.699 ≈ 2.29. Check: 5² = 25 and 5³ = 125, and 40 is between them, closer to 25.'],
        ['about 0.44', 'That is 0.699 ÷ 1.602, upside down. The number you are asking about, 40, goes on top.'],
        ['about 0.90', 'That subtracts the logs: 1.602 − 0.699 = log 8. Dividing the logs gives the exponent.'],
        ['8', 'That is 40 ÷ 5. The question is about an exponent, and 5⁸ is 390,625.']] }
  ];

  register({
    id: 'logarithms-the-inverse-of-exponentials', level: 'school',
    title: 'Logarithms: the inverse of exponentials',
    blurb: 'Ask "what exponent?", mirror the exponential graph, add logs on sliding rulers, and solve for an exponent.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 3; p.cy = 3; p.span = 4.4;
      p.grid(1, { axes: false });
      p.path([[-1.5, 0], [8, 0]], { stroke: pal['grid-strong'], width: 1.5 }); p.path([[0, -1.5], [0, 8]], { stroke: pal['grid-strong'], width: 1.5 });
      p.path([[-1.5, -1.5], [8, 8]], { stroke: pal.violet, width: 2, dash: [6, 5] });
      const e = [], l = []; for (let x = -1.5; x <= 3.01; x += .1) e.push([x, Math.pow(2, x)]); for (let x = .35; x <= 8; x *= 1.05) l.push([x, Math.log2(x)]);
      p.curve(l, { stroke: pal.red, width: 2.8 }); p.curve(e, { stroke: pal.blue, width: 2.8 });
      p.dot(2, 4, 4.5, pal.yellow, pal.stage, 1.5); p.dot(4, 2, 4.5, pal.yellow, pal.stage, 1.5);
    },
    hook: String.raw`Your money grows 5% a year. After how many years will it have doubled? Asking "how many years?" means asking for an exponent, and ordinary algebra has no button for that. What would an exponent-finding tool look like?`,
    steps: [
      { title: 'What exponent?',
        text: String.raw`<p>A <b>logarithm</b> asks one question: <em>what exponent?</em> The curve is \(y=2^x\). The point sits at \(x=1\), where \(2^1=2\). The yellow dashed line is the target, \(8\).</p><p>Predict in the panel, then drag the point (or use the slider) until the curve meets the line. The exponent you find is \(\log_2 8\), read "log base 2 of 8".</p>`,
        set: { mode: 'exp', eb: 2, c: 8, x: 1 } },
      { title: 'The graph is a mirror image',
        text: String.raw`<p>The point \(P=(2,4)\) is on \(y=2^x\), because \(2^2=4\). Its mirror image \(Q=(4,2)\) is on \(y=\log_2 x\), because \(\log_2 4=2\).</p><p>Reflecting in the dashed line \(y=x\) swaps the two coordinates. Drag \(P\) or \(Q\): the pair moves together. The log curve never reaches \(x=0\), because no power of 2 is 0 or negative.</p>`,
        set: { mode: 'mirror', mb: 2, t: 2 } },
      { title: 'Rulers that add logs',
        text: String.raw`<p>A <b>log ruler</b> spaces numbers by their logs, so each equal step <em>multiplies</em>. Here log means base 10. Ruler B slides, with its 1 under the 2 on ruler A. Above B's 3 you read \(6\).</p><p>The lengths add: \(\log 2+\log 3=0.301+0.477=0.778\), the length of \(\log 6\). Adding logs multiplies. Try Divide and Powers for the other two rules.</p>`,
        set: { mode: 'ruler', rop: 'prod', ra: 2, rb: 3 } },
      { title: 'Solving for an exponent',
        text: String.raw`<p>To solve \(2^x=10\), take the log of both sides. The power rule brings the exponent down: \(x\log 2=\log 10\). So \(x=\log 10\div\log 2=1\div 0.301\approx 3.32\).</p><p>Choose each move in the panel, then press the <b>log</b> and <b>ln</b> buttons. Both give 3.32. The graph shows where the curve crosses the line \(y=10\).</p>`,
        set: { mode: 'solve', eq: 1 } }
    ],
    formal: String.raw`
      <h3>What a logarithm is</h3>
      <p>For a base \(b\) with \(b&gt;0\) and \(b\ne 1\), and a number \(x&gt;0\),
      \[ \log_b x = y \quad\text{means}\quad b^y = x. \]
      The two statements say the same thing, so <em>a logarithm is an exponent</em>. For example \(\log_2 8=3\) because \(2^3=8\). Also \(\log_3\frac19=-2\) because \(3^{-2}=\frac19\), and \(\log_4 2=\frac12\) because \(4^{1/2}=2\). Two values always work: \(\log_b 1=0\) and \(\log_b b=1\).</p>
      <p><em>Why \(x&gt;0\)?</em> A positive base to any power is positive, so \(b^y\) is never 0 or negative. Then \(\log_b 0\) and the log of a negative number do not exist. <em>Why \(b\ne1\)?</em> Because \(1^y=1\) for every \(y\), so a base of 1 could never reach any other number.</p>
      <h3>The graph is a reflection</h3>
      <p>The exponential \(y=b^x\) and the log \(y=\log_b x\) undo each other: \(\log_b(b^t)=t\) and \(b^{\log_b x}=x\). If \((t,\,b^t)\) is on the exponential graph, then \(\log_b(b^t)=t\) says that \((b^t,\,t)\) is on the log graph. The coordinates are swapped, and swapping coordinates is the reflection in the line \(y=x\).</p>
      <p>So everything swaps too. The exponential has domain all reals and range \(y&gt;0\). The log has domain \(x&gt;0\) and range all reals. The horizontal line \(y=0\) that the exponential approaches becomes the vertical line \(x=0\) that the log approaches. The point \((0,1)\) becomes \((1,0)\). The log climbs slowly: \(\log_2 1000\) is only about \(10\).</p>
      <h3>The log scale</h3>
      <p>A log ruler puts the number \(x\) at distance \(\log_{10} x\) from the start. The step from 1 to 10 has length 1, and so does the step from 10 to 100. Equal steps on the ruler multiply the number by the same factor. That is why sound (decibels), earthquakes (the Richter scale) and acidity (pH) use log scales: each step up means ten times as much.</p>
      <h3>The three laws</h3>
      <p>Let \(m=\log_b M\) and \(n=\log_b N\), so \(M=b^m\) and \(N=b^n\). Then
      \[ MN=b^m b^n=b^{m+n},\qquad \frac MN=b^{m-n},\qquad M^k=(b^m)^k=b^{mk}. \]
      Reading each as a log gives
      \[ \log_b(MN)=\log_b M+\log_b N,\quad \log_b\frac MN=\log_b M-\log_b N,\quad \log_b(M^k)=k\log_b M. \]
      These are the exponent rules \(b^mb^n=b^{m+n}\) and so on, written in the language of logs. On the rulers, sliding adds or subtracts lengths. Example: \(\log 4+\log 5=\log 20\), \(\log 60-\log 5=\log 12\), and \(\log(5^3)=3\log 5\).</p>
      <p><b>Careful.</b> There is no rule for \(\log(M+N)\). For example \(\log_2(4+4)=\log_2 8=3\), but \(\log_2 4+\log_2 4=4\).</p>
      <h3>Solving \(b^x=c\)</h3>
      <p>The unknown is in the exponent, so dividing by \(b\) does not free it (that gives \(b^{x-1}\)). Take the log of both sides, in any base. The power rule brings the exponent down:
      \[ b^x=c\ \Rightarrow\ x\log b=\log c\ \Rightarrow\ x=\frac{\log c}{\log b}. \]
      Example: \(2^x=10\) gives \(x=\dfrac{1}{0.3010}\approx 3.32\). Check: \(2^{3.32}\approx 10\).</p>
      <p><em>Doubling time.</em> Money growing at rate \(r\) per year satisfies \((1+r)^t=2\), so \(t=\dfrac{\ln 2}{\ln(1+r)}\). At 5%, \(t=\dfrac{0.6931}{0.0488}\approx 14.2\) years. <em>Half-life.</em> A quantity losing 10% each hour has \(0.9^t=0.5\), so \(t=\dfrac{\ln 0.5}{\ln 0.9}=\dfrac{-0.6931}{-0.1054}\approx 6.6\) hours. Both logs are negative, so the answer is positive.</p>
      <h3>Change of base, and the two calculator buttons</h3>
      <p>Let \(y=\log_b c\). Then \(b^y=c\). Take logs of both sides in any base: \(y\log b=\log c\). So
      \[ \log_b c=\frac{\log c}{\log b}. \]
      Calculators have two log buttons. <b>log</b> means base 10, so \(\log 1000=3\). <b>ln</b> means base \(e\), where \(e\approx 2.71828\) (the "natural" base, which calculus explains). The two buttons give different numbers, but their ratio is the same, so either one finds \(\log_5 40=\dfrac{1.602}{0.699}=\dfrac{3.689}{1.609}\approx 2.29\). Picture it as hops: the walk from 1 to \(c\) has length \(\log c\), each hop of "times \(b\)" has length \(\log b\), and the number of hops is the ratio.</p>`,
    check: [
      { q: 'Which question does "log₂ 8" ask, and what is its answer?',
        choices: ['What number times 2 gives 8? The answer is 4.', '8 to what power gives 2? The answer is 1/3.', '2 to what power gives 8? The answer is 3.', 'What number added to 2 gives 8? The answer is 6.'], answer: 2,
        why: String.raw`\(\log_2 8\) is the exponent \(y\) with \(2^y=8\). Since \(2\times2\times2=8\), the answer is \(3\). The choice with 4 divides instead of finding an exponent. The choice with \(1/3\) has the base and the result swapped. The choice with 6 subtracts.`,
        hint: String.raw`The small number is the base. A log is the exponent that the base needs.` },
      { q: 'You put $1000 in an account that pays 5% interest a year, compounded yearly. After t years you have 1000 × 1.05^t dollars. How long until you have $2000? Use ln 2 ≈ 0.6931 and ln 1.05 ≈ 0.0488.',
        choices: ['about 14.2 years', 'about 20 years', 'about 0.07 years', 'about 0.69 years'], answer: 0,
        why: String.raw`Set \(1000\cdot1.05^t=2000\), so \(1.05^t=2\). Taking logs, \(t\ln1.05=\ln2\), so \(t=\dfrac{0.6931}{0.0488}\approx14.2\) years. The 20 years is \(100\%\div5\%\), which is only right for simple interest. The 0.07 divides the wrong way round. The 0.69 forgets to divide by \(\ln1.05\).`,
        hint: String.raw`Divide both sides by 1000 first. Then take the log of both sides and use the power rule.` },
      { q: 'Mia says: "log₂ 8 + log₂ 4 = log₂ (8 + 4) = log₂ 12." Which statement is correct?',
        choices: ['Mia is right: the sum of two logs is the log of the sum.', 'Mia is wrong: the sum is log₂ (8 − 4) = log₂ 4 = 2.', 'Mia is wrong: the sum is log₂ (8 ÷ 4) = log₂ 2 = 1.', 'Mia is wrong: adding logs multiplies the inputs, so the sum is log₂ 32 = 5, which is 3 + 2.'], answer: 3,
        why: String.raw`The product rule says \(\log_b M+\log_b N=\log_b(MN)\). Here \(\log_2 8=3\) and \(\log_2 4=2\), so the sum is \(5\), and \(\log_2(8\cdot4)=\log_2 32=5\). Mia's \(\log_2 12\) is about \(3.58\), not \(5\). Subtracting or dividing the inputs matches subtracting the logs, not adding them.`,
        hint: String.raw`Work out \(\log_2 8\) and \(\log_2 4\) separately as exponents, then add them.` }
    ],
    links: { related: ['exponential-growth', 'radians-the-circles-own-angle-unit', 'inverse-functions-and-composition', 'exponents-and-scientific-notation', 'functions-as-transformations'] },

    mount({ stage, controls: C }) {
      const st = { mode: 'exp', practice: false, eb: 2, c: 8, x: 1, mb: 2, t: 2, rop: 'prod', ra: 2, rb: 3, rx: 60, rq: 5, pa: 2, pn: 6, eq: 1, bb: 2, bc: 10, calc: 'log' };
      let cancel = () => {};
      const panel = stage.nextElementSibling;
      const P = new Plane(stage, { span: 5 });
      const MODES = [['exp', 'What exponent?'], ['mirror', 'Mirror'], ['ruler', 'Rulers'], ['solve', 'Solve'], ['base', 'Change of base']];
      const C_ALL = [.125, .25, .5, 2, 3, 4, 5, 8, 9, 10, 16, 20, 27, 32, 64, 81, 100, 1000];
      const rd2 = v => Math.round(v * 100) / 100;

      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const addTo = (...els) => panel.append(...els);
      const resets = [];
      const predict = (title, q, opts, onPick) => {
        let done = false;
        const fbk = h('div', { class: 'ctl readout', 'aria-live': 'polite' }), row = h('div', { class: 'ctl buttons' });
        const btns = opts.map((o, i) => mkBtn(o[0], () => {
          if (done) return; done = true;
          btns.forEach((b, j) => { b.disabled = true; if (j === i) b.classList.add('primary'); });
          fbk.innerHTML = (o[2] ? good('Yes.') : bad('Not quite.')) + ' ' + o[1]; onPick(i);
        }));
        row.append(...btns);
        addTo(h('p', { class: 'ctl-title' }, title), h('p', { class: 'hint' }, q), row, fbk);
        resets.push(() => { done = false; btns.forEach(b => { b.disabled = false; b.classList.remove('primary'); }); fbk.innerHTML = ''; });
      };
      const ask = (title, q, opts) => {
        let done = false;
        const fbk = h('div', { class: 'ctl readout', 'aria-live': 'polite' }), row = h('div', { class: 'ctl buttons' });
        const btns = opts.map((o, i) => mkBtn(o[0], () => {
          if (done) return;
          if (o[2]) { done = true; btns.forEach(b => { b.disabled = true; }); btns[i].classList.add('primary'); fbk.innerHTML = good('Yes.') + ' ' + o[1]; }
          else { btns[i].disabled = true; fbk.innerHTML = bad('Not quite.') + ' ' + o[1] + ' Try another answer.'; }
        }));
        row.append(...btns);
        addTo(h('p', { class: 'ctl-title' }, title), h('p', { class: 'hint' }, q), row, fbk);
      };

      let tabBtns, ro, expBaseB, tSel, xS, mirBaseB, tS, opB, raS, rbS, rxS, rqS, paB, pnS, eqSel, solveBox, bbB, bcS, calcB;
      let startBtn, ptally, pq, pch, pfb, pnext;
      let prIdx = 0, prSolved = false, prFirst = 0, prDone = 0, prTried = false;
      const sv = { stage: 0, pressed: { log: false, ln: false } };

      /* ----- tabs ----- */
      grp('tabs', () => {
        C.title('Explore');
        tabBtns = C.buttons(MODES.map(m => ({ label: m[1], onClick: () => apply({ mode: m[0] }) })));
      });

      /* ===== mode: exp ===== */
      const buildTargets = () => {
        const L = c => Math.log(c) / Math.log(st.eb);
        const ok = C_ALL.filter(c => L(c) >= -3.5 && L(c) <= 6.7);
        if (!ok.includes(st.c)) st.c = ok.includes(8) ? 8 : ok[ok.length - 1];
        tSel.replaceChildren(...ok.map(c => { const o = h('option', { value: String(c) }, cStr(c)); if (c === st.c) o.selected = true; return o; }));
      };
      const clampX = () => { const [lo, hi] = expRange(st.eb, st.c); st.x = clamp(rd2(st.x), lo, hi); };
      const setEB = b => { cancel(); st.eb = b; buildTargets(); clampX(); sync(); };
      const nudgeX = d => { cancel(); st.x = rd2(st.x + d); clampX(); sync(); };
      grp('exp', () => {
        predict('Predict first', 'Base 2, target 8. Which exponent x makes 2^x equal 8?',
          [['2', '2² = 4. That is only half way to 8. Try a bigger exponent.', false],
           ['3', '2 × 2 × 2 = 8, so 2³ = 8. The exponent 3 is log₂ 8.', true],
           ['4', '2⁴ = 16, which is past 8. The exponent must be a bit smaller.', false]],
          () => { cancel(); st.eb = 2; buildTargets(); st.c = 8; buildTargets(); cancel = animateTo(st, { x: 3 }, 1500, sync); sync(); });
        C.title('Choose a base and a target');
        expBaseB = C.buttons([2, 3, 10, .5].map(b => ({ label: 'Base ' + bTxt(b), onClick: () => setEB(b) })));
        tSel = C.select({ label: 'Target c (the number to reach)', options: [{ value: '8', label: '8' }], value: '8', onChange: v => { cancel(); st.c = +v; clampX(); sync(); } });
        C.title('Set the exponent');
        xS = C.slider({ label: 'Exponent x', min: -4, max: 7, step: .01, value: st.x, format: v => nf(v, 2), onInput: v => { cancel(); st.x = v; clampX(); sync(); } });
        C.buttons([{ label: '− 1', onClick: () => nudgeX(-1) }, { label: '− 0.1', onClick: () => nudgeX(-.1) }, { label: '+ 0.1', onClick: () => nudgeX(.1) }, { label: '+ 1', onClick: () => nudgeX(1) }]);
      });

      /* ===== mode: mirror ===== */
      const clampT = () => { const m = tMax(st.mb); st.t = clamp(Math.round(st.t * 2) / 2, -m, m); };
      grp('mirror', () => {
        predict('Predict first', 'The point (2, 4) is on y = 2^x. Where is its mirror image in the line y = x?',
          [['(4, 2)', 'Reflecting in y = x swaps the two coordinates, so (2, 4) goes to (4, 2). It sits on y = log₂ x because log₂ 4 = 2.', true],
           ['(−2, 4)', 'That is the reflection in the y-axis. The mirror for a log graph is the line y = x.', false],
           ['(2, −4)', 'That is the reflection in the x-axis. Reflecting in y = x swaps x and y.', false],
           ['(−4, −2)', 'That turns the point half way round the origin. Reflecting in y = x swaps the coordinates.', false]],
          () => { cancel(); st.mb = 2; clampT(); cancel = animateTo(st, { t: 2 }, 1200, sync); sync(); });
        C.title('Choose a base');
        mirBaseB = C.buttons([2, 3, 4, .5].map(b => ({ label: 'Base ' + bTxt(b), onClick: () => { cancel(); st.mb = b; clampT(); sync(); } })));
        C.title('Move the point');
        tS = C.slider({ label: 'Exponent t, so P = (t, b^t)', min: -3, max: 3, step: .5, value: st.t, format: v => nf(v, 1), onInput: v => { cancel(); st.t = v; clampT(); sync(); } });
        C.buttons([{ label: '− 0.5', onClick: () => { cancel(); st.t -= .5; clampT(); sync(); } }, { label: '+ 0.5', onClick: () => { cancel(); st.t += .5; clampT(); sync(); } }]);
      });

      /* ===== mode: ruler ===== */
      const powCap = a => Math.floor(3 / lg(a) + 1e-9);
      grp('ruler', () => {
        C.title('Choose the operation');
        opB = C.buttons([['prod', 'Multiply'], ['quot', 'Divide'], ['pow', 'Powers']].map(o => ({ label: o[1], onClick: () => { cancel(); st.rop = o[0]; resets.forEach(f => f()); sync(); } })));
      });
      grp('prod', () => {
        predict('Predict first', 'Slide B so its 1 is under the 3 on A. What number on A sits above the 5 on B?',
          [['8', 'That adds 3 + 5. The ruler adds the lengths log 3 and log 5, and adding logs multiplies the numbers.', false],
           ['15', 'log 3 + log 5 = log 15, so B\'s 5 lines up with 3 × 5 = 15.', true],
           ['35', 'That sticks the digits 3 and 5 together. The lengths add, so the numbers multiply: 3 × 5 = 15.', false],
           ['243', 'That is 3⁵, a power. Powers are the third rule. Here two lengths add, so the numbers multiply.', false]],
          () => { cancel(); st.rop = 'prod'; cancel = animateTo(st, { ra: 3, rb: 5 }, 1400, sync); sync(); });
        C.title('Slide the rulers');
        raS = C.slider({ label: 'Where B\'s 1 sits on A', min: 1, max: 10, step: 1, value: st.ra, format: v => nf(v, 0), onInput: v => { cancel(); st.ra = v; sync(); } });
        rbS = C.slider({ label: 'Which number on B to read', min: 1, max: 10, step: 1, value: st.rb, format: v => nf(v, 0), onInput: v => { cancel(); st.rb = v; sync(); } });
      });
      grp('quot', () => {
        C.title('Divide: slide B left');
        rxS = C.slider({ label: 'Dividend (the number on A)', min: 10, max: 100, step: 1, value: st.rx, format: v => nf(v, 0), onInput: v => { cancel(); st.rx = v; sync(); } });
        rqS = C.slider({ label: 'Divisor (B\'s number put under it)', min: 2, max: 10, step: 1, value: st.rq, format: v => nf(v, 0), onInput: v => { cancel(); st.rq = v; sync(); } });
      });
      grp('pow', () => {
        C.title('Powers: repeat one step');
        paB = C.buttons([2, 3, 4, 5].map(a => ({ label: 'Step log ' + a, onClick: () => { cancel(); st.pa = a; st.pn = Math.min(st.pn, powCap(a)); sync(); } })));
        pnS = C.slider({ label: 'Number of steps n', min: 1, max: 9, step: 1, value: st.pn, format: v => nf(v, 0), onInput: v => { cancel(); st.pn = Math.min(v, powCap(st.pa)); sync(); } });
      });

      /* ===== mode: solve ===== */
      const eqH = e => `${powH(e.b, e.v)} = ${e.c}`;
      grp('solve', () => {
        C.title('Pick an equation');
        eqSel = C.select({ label: 'Equation', options: EQ.map((e, i) => ({ value: String(i), label: e.name })), value: String(st.eq), onChange: v => { cancel(); st.eq = +v; solveReset(); sync(); } });
        solveBox = h('div', { class: 'ctl' }); addTo(solveBox);
      });
      const solveReset = () => { sv.stage = 0; sv.pressed = { log: false, ln: false }; renderSolve(); };
      const renderSolve = () => {
        if (!solveBox) return;
        const e = EQ[st.eq], v = e.v, bT = String(e.b), cT = String(e.c), L = Math.log(e.c) / Math.log(e.b), dg = e.dg;
        const lines = [`<b>${eqH(e)}</b>`];
        if (sv.stage >= 1) lines.push(`log(${powH(e.b, v)}) = log ${cT}`, `${v} · log ${bT} = log ${cT} &nbsp;<span class="k">(power rule)</span>`);
        if (sv.stage >= 2) lines.push(`${v} = log ${cT} ÷ log ${bT}`);
        const done = sv.pressed.log || sv.pressed.ln;
        ['log', 'ln'].forEach(nm => {
          if (!sv.pressed[nm]) return; const f = nm === 'ln' ? Math.log : lg, a = f(e.c), d = f(e.b);
          lines.push(`${kk(nm + ' button')} ${nm} ${cT} = ${nf(a, 4)}, ${nm} ${bT} = ${nf(d, 4)}, so ${v} = ${nf(a, 4)} ÷ ${nf(d, 4)} ≈ ${nf(L, dg)}`);
        });
        if (done) lines.push(`<b>${v} ≈ ${nf(L, dg)}</b> &nbsp;${kk('check')} ${powH(e.b, nf(L, dg))} ≈ ${nf(Math.pow(e.b, +nf(L, dg)), 1)}`);
        const box = h('div', {});
        box.append(h('p', { class: 'hint' }, e.story), h('div', { class: 'ctl readout', html: lines.join('<br>') }));
        const fb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        const row = h('div', { class: 'ctl buttons' });
        const mk = (label, right, msg, onRight) => {
          const b = mkBtn(label, () => {
            if (right) { fb.innerHTML = good('Yes.') + ' ' + msg; onRight(); }
            else { b.disabled = true; fb.innerHTML = bad('Not quite.') + ' ' + msg + ' Try another move.'; }
          }); return b;
        };
        let q = '', opts = [];
        if (sv.stage === 0) {
          q = 'Step 1. The unknown ' + v + ' is in the exponent. Which move frees it?';
          opts = [
            mk('Divide both sides by ' + bT, false, `${powH(e.b, v)} ÷ ${bT} is ${powH(e.b, v + ' − 1')}, so ${v} is still stuck in the exponent.`),
            mk('Take the log of both sides', true, 'Equal numbers have equal logs. The power rule then brings the exponent down in front, as a multiplier: log(b^x) = x · log b. On a log ruler, x steps of length log b have total length x · log b.', () => { sv.stage = 1; renderSolve(); }),
            mk('Take the square root of both sides', false, `A square root halves the exponent, giving ${powH(e.b, v + '/2')}. The unknown is still up there.`)];
          const r = (st.eq * 2 + 1) % 3; opts = opts.map((_, i) => opts[(i + r) % 3]);
        } else if (sv.stage === 1) {
          q = 'Step 2. ' + v + ' is multiplied by log ' + bT + '. Which move leaves ' + v + ' alone?';
          opts = [
            mk('Cancel the word "log" on both sides', false, `log ${bT} is one number, not a label. "${v} · log ${bT} = log ${cT}" is not the same as "${v} · ${bT} = ${cT}".`),
            mk('Multiply both sides by log ' + bT, false, `That gives ${v} · (log ${bT})², and ${v} is still tangled up. To undo "times log ${bT}" you divide.`),
            mk('Divide both sides by log ' + bT, true, `log ${bT} is just a number (${nf(lg(e.b), 4)}), and dividing both sides by it leaves ${v} alone.`, () => { sv.stage = 2; renderSolve(); })];
          const r = (st.eq + 1) % 3; opts = [opts[(0 + r) % 3], opts[(1 + r) % 3], opts[(2 + r) % 3]];
        } else {
          q = done ? 'Both buttons find the same ' + v + '. Press the other one to see.' : 'Step 3. Ask a calculator. Press a button (log is base 10, ln is base e).';
          const pb = nm => { const b = mkBtn('Press ' + nm, () => { sv.pressed[nm] = true; renderSolve(); }); if (sv.pressed[nm]) { b.classList.add('primary'); } return b; };
          opts = [pb('log'), pb('ln')];
        }
        row.append(...opts);
        box.append(h('p', { class: 'ctl-title' }, q), row, fb);
        if (sv.stage === 2 && sv.pressed.log && sv.pressed.ln) fb.innerHTML = good('Same answer.') + ' The numbers on the two buttons differ, but the ratio does not. This is the change of base rule: log<sub>b</sub> c = log c ÷ log b, with either button.';
        if (sv.stage > 0 || done) box.append(h('div', { class: 'ctl buttons' }, mkBtn('Start this equation over', () => solveReset())));
        solveBox.replaceChildren(box);
        P.requestDraw();
      };

      /* ===== mode: base ===== */
      grp('base', () => {
        predict('Predict first', 'Start at 1 and hop, multiplying by 2 each time. How many hops reach 10?',
          [['3', 'Three hops reach 8, which is short of 10.', false],
           ['between 3 and 4', 'Three hops reach 8 and four hops reach 16, so 10 needs 3 hops and a bit of a fourth. That is log₂ 10.', true],
           ['4', 'Four hops reach 16, past 10. So you need less than 4.', false],
           ['5', 'Five hops reach 32, far past 10.', false]],
          () => { cancel(); st.bb = 2; st.bc = 10; sync(); });
        C.title('Choose the hop');
        bbB = C.buttons([2, 3, 5].map(b => ({ label: 'Hop ×' + b, onClick: () => { cancel(); st.bb = b; sync(); } })));
        bcS = C.slider({ label: 'Target c (where the walk ends)', min: 2, max: 100, step: 1, value: st.bc, format: v => nf(v, 0), onInput: v => { cancel(); st.bc = v; sync(); } });
        C.title('Which calculator button?');
        calcB = C.buttons([['log', 'log (base 10)'], ['ln', 'ln (base e)']].map(o => ({ label: o[1], onClick: () => { cancel(); st.calc = o[0]; sync(); } })));
        ask('Your turn', 'Which expression gives log₂ 10, the number of ×2 hops from 1 to 10?',
          [['log 2 ÷ log 10', 'That is the hops the other way round: how much of a ×10 hop one ×2 hop is, about 0.30.', false],
           ['log 10 ÷ log 2', 'The whole walk (log 10) divided by the length of one hop (log 2) counts the hops: 1 ÷ 0.301 ≈ 3.32.', true],
           ['log 10 − log 2', 'That subtracts the lengths, which gives log 5, the walk to 5. Counting how many hops fit needs a division.', false],
           ['log 10 × log 2', 'Multiplying lengths gives no count of hops. To see how many short steps fit in a long one, divide.', false]]);
      });
      grp('ro', () => { ro = C.readout(); C.hint('Drag a round handle on the picture, or use the sliders and buttons.'); });

      /* ===== practice ===== */
      C.title('Practice');
      C.hint('Ten short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); if (st.practice) { st.practice = false; sync(); } else { st.practice = true; loadProb(); sync(); } } }])[0];
      grp('practice', () => {
        const pwrap = h('div', { style: 'display:flex;flex-direction:column;gap:14px' });
        ptally = h('p', { class: 'ctl-title' });
        pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        pch = h('div', { class: 'ctl buttons' });
        pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pnext = mkBtn('Next problem', () => nextProb(), true);
        pwrap.append(ptally, pq, pch, pfb, h('div', { class: 'ctl buttons' }, pnext)); addTo(pwrap);
      });
      const tally = () => { ptally.textContent = `Problem ${Math.min(prIdx + 1, PROBS.length)} of ${PROBS.length} · done ${prDone} of ${PROBS.length} · right on the first try ${prFirst}`; };
      const loadProb = () => {
        const pr = PROBS[prIdx]; prSolved = false; prTried = false;
        pq.textContent = pr.q; pfb.innerHTML = ''; pch.replaceChildren(); pnext.disabled = true; pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        pr.ch.forEach((o, i) => pch.append(mkBtn(o[0], () => pickChoice(i))));
        tally();
      };
      const pickChoice = i => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        const btn = pch.children[i];
        if (i === pr.ans) {
          prSolved = true; if (!prTried) prFirst++; prDone++;
          Array.from(pch.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary');
          pfb.innerHTML = good('Right.') + ' ' + pr.ch[i][1].replace(/^Yes\.\s*/, ''); pnext.disabled = false;
        } else { prTried = true; btn.disabled = true; pfb.innerHTML = bad('Not quite.') + ' ' + pr.ch[i][1] + ' Try another answer.'; }
        tally(); sync();
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); sync(); return; }
        prIdx = PROBS.length; tally();
        pq.textContent = 'All ten problems are done.'; pch.replaceChildren(); pnext.disabled = true;
        pfb.innerHTML = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        pch.append(mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; loadProb(); sync(); }, true)); sync();
      };

      /* ----- readout ----- */
      const updRo = () => {
        const m = st.mode; let t = '';
        if (m === 'exp') {
          const b = st.eb, c = st.c, x = st.x, val = Math.pow(b, x), hit = Math.abs(val - c) <= .01 * c, bt = bTxt(b);
          const L = [`${kk('Base')} b = ${bt}`, `${kk('Exponent')} x = ${nf(x)}`, `${kk('Value')} ${powH(b, nf(x))} = ${nf(val, val >= 100 ? 0 : 3)}`, `${kk('Target')} c = ${cStr(c)}`];
          if (hit) {
            const Lg = Math.log(c) / Math.log(b), exact = Math.abs(val - c) < 1e-9;
            L.push(exact ? `<b>${powH(b, nf(x))} = ${cStr(c)}, so ${logT(b)} ${cStr(c)} = ${nf(x)}.</b> The log is the exponent.`
              : `<b>Close enough: ${powH(b, nf(x))} ≈ ${nf(val, 2)}, so ${logT(b)} ${cStr(c)} ≈ ${nf(Lg, 2)}.</b> It is not a whole number, because ${cStr(c)} is not a whole power of ${bt}.`);
          } else {
            const up = (val < c) === (b > 1);
            L.push(`${val < c ? 'Too small' : 'Too big'}: ${powH(b, nf(x))} is ${val < c ? 'below' : 'above'} ${cStr(c)}. Try a ${up ? 'bigger' : 'smaller'} exponent.`);
          }
          t = L.join('<br>');
        } else if (m === 'mirror') {
          const b = st.mb, tt = st.t, v = Math.pow(b, tt);
          t = [`${kk('P on y = ' + bTxt(b) + '^x')} (${nf(tt, 1)}, ${vTxt(v)}) since ${powH(b, nf(tt, 1))} = ${vTxt(v)}`,
            `${kk('Mirror Q on y = ' + logT(b) + ' x')} (${vTxt(v)}, ${nf(tt, 1)}) since ${logT(b)} ${vTxt(v)} = ${nf(tt, 1)}`,
            'Swapping the coordinates reflects P in the line y = x. The log graph exists only for x &gt; 0.'].join('<br>');
        } else if (m === 'ruler') {
          if (st.rop === 'prod') {
            const a3 = nf(lg(st.ra), 3), b3 = nf(lg(st.rb), 3);
            t = [`${kk('B\'s 1 sits on A\'s')} ${nf(st.ra, 2)}, ${kk('read at B\'s')} ${nf(st.rb, 2)}`, `${kk('Lengths')} log ${nf(st.ra, 2)} = ${a3}, log ${nf(st.rb, 2)} = ${b3}`,
              `${kk('They add')} ${a3} + ${b3} = ${nf(+a3 + +b3, 3)}`, `<b>${nf(st.ra, 2)} × ${nf(st.rb, 2)} = ${nf(st.ra * st.rb, 2)}</b>`].join('<br>');
          } else if (st.rop === 'quot') {
            const x3 = nf(lg(st.rx), 3), q3 = nf(lg(st.rq), 3), ans = st.rx / st.rq;
            t = [`${kk('B\'s')} ${nf(st.rq, 2)} ${kk('is under A\'s')} ${nf(st.rx, 2)}`, `${kk('Lengths')} log ${nf(st.rx, 2)} = ${x3}, log ${nf(st.rq, 2)} = ${q3}`,
              `${kk('Slide left by')} ${q3}: ${x3} − ${q3} = ${nf(+x3 - +q3, 3)}`, `<b>${nf(st.rx, 2)} ÷ ${nf(st.rq, 2)} ${Math.abs(ans * 100 - Math.round(ans * 100)) < 1e-6 ? '=' : '≈'} ${nf(ans, 2)}</b>`].join('<br>');
          } else {
            const a = st.pa, n = st.pn, l3 = nf(lg(a), 3);
            t = [`${kk('One step')} log ${a} = ${l3}`, `${kk('n steps')} ${n} × ${l3} = ${nf(n * +l3, 3)}`, `<b>That is the length of log ${Math.pow(a, n)}, so ${a}<sup>${n}</sup> = ${Math.pow(a, n)}</b>`,
              `${kk('Power rule')} log(${a}<sup>${n}</sup>) = ${n} · log ${a}`].join('<br>');
          }
        } else if (m === 'base') {
          const b = st.bb, c = st.bc, ln_ = st.calc === 'ln', f = ln_ ? Math.LN10 : 1, nm = ln_ ? 'ln' : 'log', hops = lg(c) / lg(b);
          t = [`${kk('Hop')} ×${b}, ${kk('target')} ${c}`, `${kk('One hop')} ${nm} ${b} = ${nf(lg(b) * f, 4)}`, `${kk('Whole walk')} ${nm} ${c} = ${nf(lg(c) * f, 4)}`,
            `<b>Hops = ${nf(lg(c) * f, 4)} ÷ ${nf(lg(b) * f, 4)} = ${nf(hops, 2)}, so log<sub>${b}</sub> ${c} ≈ ${nf(hops, 2)}</b>`,
            `${kk('Check')} ${b}<sup>${nf(hops, 2)}</sup> ≈ ${nf(Math.pow(b, +nf(hops, 2)), 1)}. Press the other button: the lengths change, the ratio does not.`].join('<br>');
        }
        ro.innerHTML = t;
      };

      /* ----- drawing ----- */
      const caption = () => {
        const m = st.mode;
        if (m === 'exp') return `${bTxt(st.eb)}^x = ${cStr(st.c)}: what is the exponent x?`;
        if (m === 'mirror') return `y = ${bTxt(st.mb)}^x and its mirror y = ${logT(st.mb)} x`;
        if (m === 'ruler') return st.rop === 'prod' ? `Slide to multiply: ${nf(st.ra, 2)} × ${nf(st.rb, 2)}` : st.rop === 'quot' ? `Slide to divide: ${nf(st.rx, 2)} ÷ ${nf(st.rq, 2)}` : `Repeat one step: ${st.pa}^${st.pn}`;
        if (m === 'solve') { const e = EQ[st.eq]; return sv.pressed.log || sv.pressed.ln ? `${e.name}: ${e.v} ≈ ${nf(Math.log(e.c) / Math.log(e.b), e.dg)}` : `${e.name}: find ${e.v}`; }
        return `Hops of ×${st.bb} from 1 to ${st.bc}`;
      };
      P.onDraw = (c, p) => {
        if (st.practice) {
          const pr = PROBS[Math.min(prIdx, PROBS.length - 1)], f = pr.fig, cap = `Problem ${Math.min(prIdx + 1, PROBS.length)} of ${PROBS.length}: ${pr.name}`;
          if (f.kind === 'exp') drawExp(p, { b: f.b, c: f.c }, { cap, reveal: prSolved, dg: 2, tTxt: f.c === 1 / 9 ? '1/9' : undefined });
          else if (f.kind === 'mirror') drawMirror(p, { b: f.b, t: f.t }, { cap, hideQ: !prSolved });
          else if (f.kind === 'ruler') { drawRuler(p, Object.assign({ ra: 1, rb: 1, rx: 10, rq: 2, pa: 2, pn: 1 }, f), { hide: !prSolved, nohandle: true }); capText(p, cap); }
          else drawBase(p, { bb: f.bb, bc: f.bc, calc: 'log' }, { cap, hide: !prSolved });
          return;
        }
        const m = st.mode, cap = caption();
        if (m === 'exp') drawExp(p, { b: st.eb, c: st.c, x: st.x }, { cap, handle: true });
        else if (m === 'mirror') drawMirror(p, { b: st.mb, t: st.t }, { cap, handle: true });
        else if (m === 'ruler') { drawRuler(p, st, {}); capText(p, cap); }
        else if (m === 'solve') { const e = EQ[st.eq]; drawExp(p, { b: e.b, c: e.c }, { cap, reveal: sv.pressed.log || sv.pressed.ln, dg: e.dg, v: e.v, tTxt: String(e.c) }); }
        else drawBase(p, st, { cap });
      };

      const sync = () => {
        const prac = st.practice, m = st.mode;
        vis(G.tabs, !prac); vis(G.exp, !prac && m === 'exp'); vis(G.mirror, !prac && m === 'mirror');
        vis(G.ruler, !prac && m === 'ruler'); vis(G.prod, !prac && m === 'ruler' && st.rop === 'prod'); vis(G.quot, !prac && m === 'ruler' && st.rop === 'quot'); vis(G.pow, !prac && m === 'ruler' && st.rop === 'pow');
        vis(G.solve, !prac && m === 'solve'); vis(G.base, !prac && m === 'base'); vis(G.ro, !prac && m !== 'solve'); vis(G.practice, prac);
        tabBtns.forEach((b, i) => b.classList.toggle('primary', MODES[i][0] === m));
        expBaseB.forEach((b, i) => b.classList.toggle('primary', [2, 3, 10, .5][i] === st.eb));
        mirBaseB.forEach((b, i) => b.classList.toggle('primary', [2, 3, 4, .5][i] === st.mb));
        opB.forEach((b, i) => b.classList.toggle('primary', ['prod', 'quot', 'pow'][i] === st.rop));
        paB.forEach((b, i) => b.classList.toggle('primary', [2, 3, 4, 5][i] === st.pa));
        bbB.forEach((b, i) => b.classList.toggle('primary', [2, 3, 5][i] === st.bb));
        calcB.forEach((b, i) => b.classList.toggle('primary', ['log', 'ln'][i] === st.calc));
        xS.set(st.x); tS.set(st.t); raS.set(st.ra); rbS.set(st.rb); rxS.set(st.rx); rqS.set(st.rq); pnS.set(st.pn); bcS.set(st.bc);
        if (document.activeElement !== tSel && tSel.value !== String(st.c)) tSel.value = String(st.c);
        eqSel.value = String(st.eq);
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        if (P.coordEl) P.coordEl.style.display = st.practice || m !== 'mirror' ? 'none' : '';
        P.draw(); updRo();
      };

      /* ----- dragging ----- */
      const dd = (x, y, px, py) => Math.hypot(P.X(x) - px, P.Y(y) - py);
      const rulerHandles = () => {
        const out = []; if (st.rop === 'pow') return out;
        const yy = lay.hy, px = u => lay.X0 + u * lay.sw;
        if (st.rop === 'prod') { out.push(['ra', px(lg(st.ra)), yy]); if (st.rb > 1.2) out.push(['rb', px(lg(st.ra) + lg(st.rb)), yy]); }
        else out.push(['rx', px(lg(st.rx)), yy]);
        return out;
      };
      draggable(P, {
        hit: (px, py) => {
          if (st.practice) return null;
          if (st.mode === 'exp') { const [u, v] = expPt(st.eb, st.c, st.x); return near(P, u, v, px, py, 22) ? 'pt' : null; }
          if (st.mode === 'mirror') {
            const v = Math.pow(st.mb, st.t), dP = dd(st.t, v, px, py), dQ = dd(v, st.t, px, py);
            return Math.min(dP, dQ) < 24 ? (dP <= dQ ? 'P' : 'Q') : null;
          }
          if (st.mode === 'ruler') {
            let best = null, bd = 26;
            rulerHandles().forEach(([nm, x, y]) => { const d = Math.hypot(x - px, y - py); if (d < bd) { bd = d; best = nm; } });
            return best;
          }
          return null;
        },
        move: (hd, x, y) => {
          cancel();
          if (st.mode === 'exp') {
            const V = expView(st.eb, st.c), [lo, hi] = expRange(st.eb, st.c);
            st.x = clamp(rd2(V.xlo + x / GW * (V.xhi - V.xlo)), lo, hi);
          } else if (st.mode === 'mirror') {
            st.t = hd === 'P' ? x : y; clampT();
          } else if (st.mode === 'ruler') {
            const u = (x - lay.X0) / lay.sw;
            if (hd === 'ra') st.ra = clamp(Math.round(Math.pow(10, u)), 1, 10);
            else if (hd === 'rb') st.rb = clamp(Math.round(Math.pow(10, u - lg(st.ra))), 1, 10);
            else st.rx = clamp(Math.round(Math.pow(10, u)), 10, 100);
          }
          sync();
        }
      });

      const FLAGS = ['mode', 'eb', 'c', 'mb', 'rop', 'pa', 'pn', 'eq', 'bb', 'bc', 'calc'];
      const apply = (patch, immediate) => {
        cancel();
        const nums = {};
        for (const k in patch) { if (FLAGS.includes(k)) st[k] = patch[k]; else nums[k] = patch[k]; }
        if (patch.mode) resets.forEach(f => f());
        if (patch.mode === 'solve' || patch.eq !== undefined) solveReset();
        if (patch.eb !== undefined || patch.c !== undefined) buildTargets();
        st.practice = false;
        if (immediate) { Object.assign(st, nums); sync(); } else { sync(); cancel = animateTo(st, nums, 900, sync); }
      };
      buildTargets(); renderSolve(); sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
