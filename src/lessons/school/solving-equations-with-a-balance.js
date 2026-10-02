/* =====================================================================
   SCHOOL — Solving equations with a balance
   ===================================================================== */
{
  /* ---------- exact arithmetic: a rational is [numerator, denominator], denominator > 0 ---------- */
  const MINUS = '−';
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; };
  const Q = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g + 0, d / g]; };
  const qadd = (a, b) => Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  const qmul = (a, b) => Q(a[0] * b[0], a[1] * b[1]);
  const qinv = a => Q(a[1], a[0]);
  const qneg = a => Q(-a[0], a[1]);
  const q0 = a => a[0] === 0;
  const q1 = a => a[0] === 1 && a[1] === 1;
  const qeq = (a, b) => a[0] === b[0] && a[1] === b[1];
  const qval = a => a[0] / a[1];
  const qpow = (a, e) => { let r = Q(1); for (let i = 0; i < Math.abs(e); i++) r = qmul(r, e > 0 ? a : qinv(a)); return r; };
  const qtxt = a => (a[0] < 0 ? MINUS : '') + Math.abs(a[0]) + (a[1] === 1 ? '' : '/' + a[1]);

  /* ---------- expressions ----------
     A monomial is {v: exponent}. A term is {c: rational, m: monomial} or, for a parenthesised group,
     {c, m, e: [terms]} meaning c*m*(sum of e). An expression is a list of terms. */
  const mkey = m => Object.keys(m).sort().map(v => v + m[v]).join(',');
  const mmul = (a, b) => { const r = { ...a }; for (const v in b) { r[v] = (r[v] || 0) + b[v]; if (!r[v]) delete r[v]; } return r; };
  const minv = m => { const r = {}; for (const v in m) r[v] = -m[v]; return r; };
  const isConst = m => !Object.keys(m).length;
  const scale = (t, c, m) => ({ ...t, c: qmul(t.c, c), m: mmul(t.m, m) });
  const hasV = (E, v) => E.some(t => t.m[v] || (t.e && hasV(t.e, v)));
  const hasGroup = E => E.some(t => t.e);

  /* canonical form: groups with a factor of 1 open up, one-term groups merge, like terms combine, constants go last */
  const norm = E => {
    const out = [];
    for (const t of E) {
      if (!t.e) { if (!q0(t.c)) out.push(t); continue; }
      const inner = norm(t.e);
      if (!inner.length || q0(t.c)) continue;
      if (inner.length === 1) { out.push(scale(inner[0], t.c, t.m)); continue; }
      if (q1(t.c) && isConst(t.m)) { out.push(...inner); continue; }
      out.push({ c: t.c, m: t.m, e: inner });
    }
    const res = [], at = {};
    for (const t of out) {
      if (t.e) { res.push(t); continue; }
      const k = mkey(t.m);
      if (k in at) res[at[k]] = { c: qadd(res[at[k]].c, t.c), m: t.m };
      else { at[k] = res.length; res.push({ c: t.c, m: t.m }); }
    }
    const fin = res.filter(t => t.e || !q0(t.c));
    return [...fin.filter(t => t.e || !isConst(t.m)), ...fin.filter(t => !t.e && isConst(t.m))];
  };
  const mulE = (E, c, m) => (E.length <= 1 ? E.map(t => scale(t, c, m)) : [{ c, m, e: E }]);
  const distRaw = E => E.flatMap(t => (t.e ? t.e.map(s => scale(s, t.c, t.m)) : [t]));

  /* printing */
  const SUP = { 2: '²', 3: '³', 4: '⁴', 5: '⁵' };
  const vstr = (m, sg) => Object.keys(m).sort().filter(v => Math.sign(m[v]) === sg)
    .map(v => v + (Math.abs(m[v]) > 1 ? (SUP[Math.abs(m[v])] || '^' + Math.abs(m[v])) : '')).join('');
  const denStr = (d, den) => (d === 1 && !den ? '' : '/' + (d > 1 && den ? '(' + d + den + ')' : (d > 1 ? d : '') + den));
  const tabs = t => {
    const num = vstr(t.m, 1), den = vstr(t.m, -1), n = Math.abs(t.c[0]), d = t.c[1];
    if (t.e) return (n === 1 ? num : n + num) + '(' + pr(t.e) + ')' + denStr(d, den);
    return (n === 1 && num ? num : n + num) + denStr(d, den);
  };
  const pr = E => (!E.length ? '0' : E.map((t, i) => (i ? (t.c[0] < 0 ? ' ' + MINUS + ' ' : ' + ') : (t.c[0] < 0 ? MINUS : '')) + tabs(t)).join(''));
  const prEq = eq => pr(eq.L) + ' = ' + pr(eq.R);

  /* evaluation at given values (rationals), used for checks and for the weight of each pan */
  const tval = (t, vals) => {
    let r = t.c;
    for (const v in t.m) r = qmul(r, qpow(vals[v], t.m[v]));
    return t.e ? qmul(r, evalE(t.e, vals)) : r;
  };
  const evalE = (E, vals) => E.reduce((s, t) => qadd(s, tval(t, vals)), Q(0));
  /* the same expression with numbers put in, e.g. 3x + 2 at x = 4 -> "3·4 + 2" */
  const vtxt = (val) => (val[0] < 0 ? '(' + qtxt(val) + ')' : qtxt(val));
  const prSub = (E, vals) => (!E.length ? '0' : E.map((t, i) => {
    const neg = t.c[0] < 0, lead = i ? (neg ? ' ' + MINUS + ' ' : ' + ') : (neg ? MINUS : '');
    const n = Math.abs(t.c[0]), d = t.c[1], f = [];
    if (n !== 1 || (isConst(t.m) && !t.e)) f.push(String(n));
    for (const v in t.m) if (t.m[v] > 0) for (let k = 0; k < t.m[v]; k++) f.push(vtxt(vals[v]));
    let s = f.join('·');
    if (t.e) s += '(' + prSub(t.e, vals) + ')';
    const dn = d > 1 ? [String(d)] : [];
    for (const v in t.m) if (t.m[v] < 0) for (let k = 0; k < -t.m[v]; k++) dn.push(vtxt(vals[v]));
    if (dn.length) s += '/' + (dn.length > 1 ? '(' + dn.join('·') + ')' : dn[0]);
    return lead + s;
  }).join(''));
  /* order of operations in three short passes: parentheses, then products, then sums */
  const evalSteps = (E, vals) => {
    const inner = E.map(t => (t.e ? { ...t, e: [{ c: evalE(t.e, vals), m: {} }] } : t));
    const L = [prSub(E, vals)];
    if (E.some(t => t.e)) L.push(prSub(inner, vals));
    L.push(pr(E.map(t => ({ c: tval(t, vals), m: {} }))), qtxt(evalE(E, vals)));
    return L.filter((x, i) => !i || x !== L[i - 1]);
  };

  /* ---------- parsing of the equations written in the data tables below ---------- */
  const parseExpr = src => {
    const toks = src.replace(/\s+/g, '').replace(/−/g, '-').match(/\d+|[A-Za-z]|[()+\-\/*]/g);
    let i = 0;
    const peek = () => toks[i], next = () => toks[i++];
    const term = sign => {
      let c = Q(sign), m = {}, grp = null;
      const factor = () => {
        const t = next();
        if (t === '(') { const e = expr(); if (next() !== ')') throw new Error('missing )'); if (grp) throw new Error('two groups'); grp = e; }
        else if (/\d/.test(t)) c = qmul(c, Q(+t));
        else if (/[A-Za-z]/.test(t)) m = mmul(m, { [t]: 1 });
        else throw new Error('bad token ' + t);
      };
      factor();
      while (peek() && (peek() === '(' || peek() === '*' || /[\dA-Za-z]/.test(peek()))) { if (peek() === '*') next(); factor(); }
      while (peek() === '/') {
        next(); const t = next();
        if (/\d/.test(t)) c = qmul(c, Q(1, +t)); else if (/[A-Za-z]/.test(t)) m = mmul(m, { [t]: -1 }); else throw new Error('bad divisor');
      }
      return grp ? { c, m, e: grp } : { c, m };
    };
    const expr = () => {
      const out = []; let sign = 1;
      if (peek() === '-') { next(); sign = -1; } else if (peek() === '+') next();
      out.push(term(sign));
      while (peek() === '+' || peek() === '-') { const s = next() === '-' ? -1 : 1; out.push(term(s)); }
      return out;
    };
    const e = expr();
    if (i < toks.length) throw new Error('extra ' + toks.slice(i).join(''));
    return e;
  };
  const parseEq = s => { const [a, b] = s.split('='); return { L: parseExpr(a), R: parseExpr(b) }; };

  /* ---------- operations on both sides ---------- */
  /* op = { kind: 'add' | 'sub' | 'mul' | 'div', n: nonzero integer, v: '' or a variable name } */
  const PROP = { add: 'Addition property of equality', sub: 'Subtraction property of equality', mul: 'Multiplication property of equality', div: 'Division property of equality' };
  const opTerm = op => ({ c: Q(op.n), m: op.v ? { [op.v]: 1 } : {} });
  const opAbs = op => { const a = Math.abs(op.n); return op.v ? (a === 1 ? op.v : a + op.v) : String(a); };
  const opText = (op, paren) => { const s = opAbs(op); return op.n < 0 ? (paren ? '(' + MINUS + s + ')' : MINUS + s) : s; };
  const opLabel = op => ({ add: 'Add ', sub: 'Subtract ', mul: 'Multiply by ', div: 'Divide by ' }[op.kind]) + opText(op);
  const opPhrase = op => ({ add: 'add ' + opText(op) + ' to both sides', sub: 'subtract ' + opText(op) + ' from both sides',
    mul: 'multiply both sides by ' + opText(op), div: 'divide both sides by ' + opText(op) }[op.kind]);
  /* spread: multiplying or dividing a sum acts on every term (the balance), instead of keeping a bracket (formulas) */
  const wholeGroup = u => u.e && u.c[1] === 1 && u.c[0] >= 2 && u.c[0] <= 6 && isConst(u.m);
  const applyOp = (E, op, spread) => {
    const t = opTerm(op);
    if (op.kind === 'add') return norm([...E, t]);
    if (op.kind === 'sub') return norm([...E, { c: qneg(t.c), m: t.m }]);
    const k = op.kind === 'mul' ? t : { c: qinv(t.c), m: minv(t.m) };
    if (!spread) return norm(mulE(E, k.c, k.m));
    return norm(E.map(u => scale(u, k.c, k.m)).flatMap(u => (u.e && !wholeGroup(u) ? distRaw([u]) : [u])));
  };
  /* true when a written expression needs parentheses before it can be divided: a sum, a quotient or a negative */
  const loose = s => {
    if (s[0] === MINUS) return true;
    let d = 0;
    for (const ch of s) { if (ch === '(') d++; else if (ch === ')') d--; else if (!d && (ch === '+' || ch === MINUS || ch === '/')) return true; }
    return false;
  };
  /* the side written out with the operation attached, before anything is simplified */
  const sideTxt = (E, op) => {
    const k = opText(op, true), s = pr(E), wrapped = loose(s) ? '(' + s + ')' : s;
    if (op.kind === 'add') return s + ' + ' + k;
    if (op.kind === 'sub') return s + ' ' + MINUS + ' ' + k;
    if (op.kind === 'mul') return /^[A-Za-z]$/.test(s) ? k + s : k + '(' + s + ')';
    return wrapped + '/' + k;
  };

  /* words that justify the tidy-up after a step: like terms that merge or cancel */
  const merges = raw => {
    const by = new Map();
    for (const t of raw) if (!t.e) { const k = mkey(t.m); if (!by.has(k)) by.set(k, []); by.get(k).push(t); }
    const out = [];
    for (const ts of by.values()) {
      if (ts.length < 2) continue;
      const sum = ts.reduce((s, t) => qadd(s, t.c), Q(0));
      const lhs = ts.map((t, i) => (i ? (t.c[0] < 0 ? ' ' + MINUS + ' ' : ' + ') : (t.c[0] < 0 ? MINUS : '')) + tabs({ ...t, c: Q(Math.abs(t.c[0]), t.c[1]) })).join('');
      const m = ts[0].m;
      if (q0(sum)) out.push({ kind: 'inverse', txt: lhs + ' = 0' });
      else out.push({ kind: isConst(m) ? 'arith' : 'combine', txt: lhs + ' = ' + pr([{ c: sum, m }]) });
    }
    return out;
  };
  const mergeWords = (raw, after) => {
    const ms = merges(raw);
    if (!ms.length) return '';
    const parts = ms.map(x => (x.kind === 'inverse' ? x.txt + ' (inverse property)' : x.kind === 'combine' ? 'combine like terms, ' + x.txt + ' (distributive property)' : x.txt));
    let s = parts.join('; ');
    if (ms.some(x => x.kind === 'inverse') && after.length) s += ', so ' + pr(after) + ' + 0 = ' + pr(after) + ' (identity property)';
    return s;
  };
  /* what happened to one side when it was multiplied or divided */
  const timesWords = (op, S, S2, spread) => {
    if (S.length > 1 && spread) {
      const mul = op.kind === 'mul', nTxt = op.n < 0 ? '(' + qtxt(Q(op.n)) + ')' : opText(op);
      return (mul ? 'multiply' : 'divide') + ' every term by ' + opText(op, true) + ' (distributive property), ' + S.map(u => pr([u]) + (mul ? ' \u00d7 ' : ' \u00f7 ') + nTxt + ' = ' + pr(applyOp([u], op, true))).join(' and ');
    }
    if (S.length !== 1) return '';
    const t = S[0], mul = op.kind === 'mul', sym = mul ? '×' : '÷';
    const kc = mul ? Q(op.n) : qinv(Q(op.n)), km = mul ? opTerm(op).m : minv(opTerm(op).m);
    const c1 = qmul(t.c, kc), nTxt = op.n < 0 ? '(' + qtxt(Q(op.n)) + ')' : qtxt(Q(op.n)), pieces = []; let inv = false;
    if (op.n !== 1 && !q1(t.c)) { pieces.push(qtxt(t.c) + ' ' + sym + ' ' + nTxt + ' = ' + qtxt(c1)); if (q1(c1)) inv = true; }
    for (const v in km) if (t.m[v] && t.m[v] + km[v] === 0) { pieces.push(v + ' ÷ ' + v + ' = 1'); inv = true; }
    if (!pieces.length) return '';
    if (t.e) return inv && q1(c1) && isConst(mmul(t.m, km)) ? pieces.join(', ') + ' (inverse property), so 1(' + pr(t.e) + ') = ' + pr(t.e) + ' (identity property)' : '';
    let s = pieces.join(', ');
    if (inv) {
      s += ' (inverse property)';
      if (S2.length === 1 && !isConst(S2[0].m)) { const r = pr(S2); s += ', so 1' + (/^[A-Za-z]/.test(r) ? '' : '·') + r + ' = ' + r + ' (identity property)'; }
    }
    return s;
  };

  /* One history record is { eq, why }. doOp returns the two records for a step and the new equation. */
  const doOp = (eq, op, spread) => {
    const L2 = applyOp(eq.L, op, spread), R2 = applyOp(eq.R, op, spread), next = { L: L2, R: R2 };
    const rec1 = { eq: sideTxt(eq.L, op) + ' = ' + sideTxt(eq.R, op), why: PROP[op.kind] + ': ' + opPhrase(op) + '.' };
    let words = '';
    if (op.kind === 'add' || op.kind === 'sub') {
      const t = opTerm(op), sg = op.kind === 'sub' ? qneg(t.c) : t.c;
      const wl = mergeWords([...eq.L, { c: sg, m: t.m }], L2), wr = mergeWords([...eq.R, { c: sg, m: t.m }], R2);
      words = (wl ? 'Left: ' + wl + '.' : '') + (wl && wr ? ' ' : '') + (wr ? 'Right: ' + wr + '.' : '');
    } else {
      const wl = timesWords(op, eq.L, L2, spread), wr = timesWords(op, eq.R, R2, spread);
      words = (wl ? 'Left: ' + wl + '.' : '') + (wl && wr ? ' ' : '') + (wr ? 'Right: ' + wr + '.' : '');
    }
    const e2 = prEq(next), rec2 = e2 !== rec1.eq && words !== '' ? { eq: e2, why: words } : (e2 !== rec1.eq ? { eq: e2, why: 'Simplify.' } : null);
    return { eq: next, recs: rec2 ? [rec1, rec2] : [rec1] };
  };
  const doDist = eq => {
    const rl = distRaw(eq.L), rr = distRaw(eq.R), next = { L: norm(rl), R: norm(rr) };
    const parts = [...eq.L, ...eq.R].filter(t => t.e).map(t => tabs(t) + ' = ' + pr(distRaw([t])));
    const rec1 = { eq: pr(rl) + ' = ' + pr(rr), why: 'Distributive property: ' + parts.join('; ') + '.' };
    const e2 = prEq(next), wl = mergeWords(rl, next.L), wr = mergeWords(rr, next.R);
    const words = (wl ? 'Left: ' + wl + '.' : '') + (wl && wr ? ' ' : '') + (wr ? 'Right: ' + wr + '.' : '');
    return { eq: next, recs: e2 !== rec1.eq ? [rec1, { eq: e2, why: words || 'Simplify.' }] : [rec1] };
  };
  const doSwap = eq => ({ eq: { L: eq.R, R: eq.L }, recs: [{ eq: pr(eq.R) + ' = ' + pr(eq.L), why: 'Symmetric property of equality: if a = b, then b = a.' }] });

  /* ---------- where is the equation going? ---------- */
  const single = (E, v) => E.length === 1 && !E[0].e && q1(E[0].c) && Object.keys(E[0].m).length === 1 && E[0].m[v] === 1;
  const constOf = E => evalE(E, {});
  const numeric = E => E.every(t => isConst(t.m) && (!t.e || numeric(t.e)));
  /* 'solved', 'none' (a false statement is left), 'all' (a true statement is left) or 'open' */
  const status = (eq, v) => {
    const hl = hasV(eq.L, v), hr = hasV(eq.R, v);
    if (single(eq.L, v) && !hr) return 'solved';
    if (single(eq.R, v) && !hl) return 'solved';
    if (!hl && !hr && numeric(eq.L) && numeric(eq.R)) return qeq(constOf(eq.L), constOf(eq.R)) ? 'all' : 'none';
    return 'open';
  };
  const answerOf = (eq, v) => (single(eq.L, v) ? eq.R : eq.L);
  /* a group with the unknown inside it still has to be opened */
  const openGroups = (E, v) => E.filter(t => t.e && hasV(t.e, v)).length;
  /* obstacles between here and "v alone": the lower the number, the closer we are */
  const dist = (eq, v) => {
    if (status(eq, v) !== 'open') return 0;
    const { L, R } = eq, hl = hasV(L, v), hr = hasV(R, v);
    let d = 3 * (openGroups(L, v) + openGroups(R, v));
    if (hl && hr) d += 1;
    const T = hl ? L : R;
    d += T.filter(t => !t.e && !t.m[v]).length;
    const tt = T.find(t => !t.e && t.m[v]);
    if (tt) {
      if (tt.c[1] > 1) d += 1;
      if (Math.abs(tt.c[0]) !== 1 || tt.c[0] < 0) d += 1;
      d += Object.keys(tt.m).filter(k => k !== v).length;
    }
    return d;
  };
  const coefOf = (E, v) => { const t = E.find(u => !u.e && u.m[v]); return t ? t.c : Q(0); };

  /* the best next move, with the reason in words (used by Hint) */
  const suggest = (eq, v, where) => {
    if (status(eq, v) !== 'open') return null;
    const { L, R } = eq, hl = hasV(L, v), hr = hasV(R, v), side = s => (where === 'pan' ? (s === 'L' ? 'left' : 'right') + ' pan' : (s === 'L' ? 'left' : 'right') + ' side');
    if (openGroups(L, v) || openGroups(R, v)) {
      return { kind: 'dist', text: 'The parentheses hide a multiplication. Press Distribute to multiply every term inside by the number outside (the distributive property).' };
    }
    if (hl && hr) {
      const keepL = qval(coefOf(L, v)) >= qval(coefOf(R, v)), O = keepL ? R : L, t = O.find(u => !u.e && u.m[v]), neg = t.c[0] < 0;
      const op = { kind: neg ? 'add' : 'sub', n: Math.abs(t.c[0]), v, ok: t.c[1] === 1 };
      return { ...op, text: v + ' is on both ' + (where === 'pan' ? 'pans' : 'sides') + '. Gather it on the ' + side(keepL ? 'L' : 'R') + ': ' + (neg ? 'add ' : 'subtract ') + opText({ ...op, v }) + ' on both ' + (where === 'pan' ? 'pans' : 'sides') + ', so the ' + pr([t]) + ' on the ' + side(keepL ? 'R' : 'L') + ' cancels.' };
    }
    const T = hl ? L : R, ts = hl ? 'L' : 'R', extra = T.find(t => !t.e && !t.m[v]);
    if (extra) {
      const neg = extra.c[0] < 0, vars = Object.keys(extra.m), ok = extra.c[1] === 1 && (vars.length === 0 || (vars.length === 1 && extra.m[vars[0]] === 1));
      const op = { kind: neg ? 'add' : 'sub', n: Math.abs(extra.c[0]), v: vars[0] || '', ok };
      const sgn = (extra.c[0] < 0 ? MINUS : '+') + pr([{ ...extra, c: Q(Math.abs(extra.c[0]), extra.c[1]) }]);
      return { ...op, text: v + ' is not alone: the ' + side(ts) + ' also has ' + sgn + '. Undo it with the opposite operation: ' + (neg ? 'add ' : 'subtract ') + (ok ? opText(op) : qtxt(Q(Math.abs(extra.c[0]), extra.c[1])) + vars.join('')) + ' on both ' + (where === 'pan' ? 'pans' : 'sides') + '. It was the last thing done to ' + v + ', so it is the first to undo.' };
    }
    const tt = T[0], c = tt.c, others = Object.keys(tt.m).filter(k => k !== v);
    if (c[1] > 1) return { kind: 'mul', n: c[1], v: '', ok: true, text: v + ' is divided by ' + c[1] + ' here. Undo it: multiply both ' + (where === 'pan' ? 'pans' : 'sides') + ' by ' + c[1] + '.' };
    if (Math.abs(c[0]) !== 1) return { kind: 'div', n: c[0], v: '', ok: true, text: v + ' is multiplied by ' + qtxt(c) + ' here. Undo it: divide both ' + (where === 'pan' ? 'pans' : 'sides') + ' by ' + qtxt(c) + '.' };
    const ov = others[0], ok = others.length === 1 && tt.m[ov] === 1;
    return { kind: 'div', n: c[0] < 0 ? -1 : 1, v: ok ? ov : '', ok, text: v + ' is multiplied by ' + (c[0] < 0 ? MINUS : '') + (ok ? ov : others.join('')) + ' here. Undo it: divide both sides by ' + (c[0] < 0 ? MINUS : '') + (ok ? ov : others.join('')) + '.' };
  };

  /* what to say after a move: why it helped, or why it did not */
  const feedback = (before, after, op, v, where) => {
    const pan = where === 'pan', both = pan ? 'pans' : 'sides', one = s => (s === 'L' ? 'left' : 'right') + (pan ? ' pan' : ' side');
    const sa = status(after, v), d0 = dist(before, v), d1 = dist(after, v);
    if (sa === 'solved') return { good: true, text: v + ' is alone: ' + (single(after.L, v) ? v + ' = ' + pr(after.R) : pr(after.L) + ' = ' + v) + '. Press ' + (where === 'pan' ? 'Check the answer' : 'Check with numbers') + ' to test it.' };
    if (sa === 'none') return { good: true, text: 'Every ' + v + ' canceled, and what is left, ' + prEq(after) + ', is false. No number can make it true, so there is no solution.' };
    if (sa === 'all') return { good: true, text: 'Every ' + v + ' canceled, and what is left, ' + prEq(after) + ', is always true. Any number works: there are infinitely many solutions.' };
    const t = opTerm(op), key = mkey(t.m), tc = op.kind === 'sub' ? qneg(t.c) : t.c;
    if (op.kind === 'add' || op.kind === 'sub') {
      const hit = ['L', 'R'].map(s => ({ s, like: before[s].find(u => !u.e && mkey(u.m) === key) })).filter(x => x.like);
      const cancels = hit.filter(x => q0(qadd(x.like.c, tc)));
      if (d1 < d0 && cancels.length) {
        const c = cancels[0], isV = !!c.like.m[v];
        return { good: true, text: isV ? 'The ' + pr([{ ...c.like, c: Q(Math.abs(c.like.c[0]), c.like.c[1]) }]) + ' on the ' + one(c.s) + ' canceled (' + pr([c.like]) + ' ' + (op.kind === 'sub' ? MINUS : '+') + ' ' + opText(op, true) + ' = 0), so all the ' + v + '’s are now on one ' + (pan ? 'pan' : 'side') + '.'
          : pr([c.like]) + ' on the ' + one(c.s) + ' canceled, because ' + pr([c.like]) + ' ' + (op.kind === 'sub' ? MINUS : '+') + ' ' + opText(op, true) + ' = 0. ' + (d1 === 0 ? '' : 'Closer to ' + v + ' alone.') };
      }
      if (d1 < d0) return { good: true, text: 'That brought ' + v + ' closer to being alone.' };
      if (hit.length) {
        const c = hit[0], left = qadd(c.like.c, tc), abs = pr([{ ...c.like, c: Q(Math.abs(c.like.c[0]), c.like.c[1]) }]);
        return { good: false, text: 'It is still true, but nothing canceled: ' + pr([c.like]) + ' ' + (op.kind === 'sub' ? MINUS : '+') + ' ' + opText(op, true) + ' leaves ' + pr([{ c: left, m: c.like.m }]) + '. To cancel ' + pr([c.like]) + ', ' + (c.like.c[0] < 0 ? 'add ' : 'subtract ') + abs + '.' };
      }
      return { good: false, text: 'It is still true, but there is no ' + opAbs(op) + ' on either ' + (pan ? 'pan' : 'side') + ' to cancel, so this only adds more. To cancel a term, use its opposite.' };
    }
    /* multiply or divide */
    const frac = E => E.some(u => u.c[1] > 1 || (u.e && frac(u.e)));
    const T = hasV(before.L, v) ? before.L : before.R, extra = T.some(u => !u.e && !u.m[v]), tt = T.find(u => !u.e && u.m[v]);
    const T2 = hasV(after.L, v) ? after.L : after.R, tt2 = T2.find(u => !u.e && u.m[v]);
    if (op.kind === 'div' && (frac(after.L) || frac(after.R)) && !(frac(before.L) || frac(before.R)))
      return { good: false, text: 'That is still true, but fractions appeared, because ' + opText(op) + ' does not divide every term evenly. ' + (extra ? 'The last thing done to ' + v + ' was adding or subtracting a number. Undo that first and the numbers stay whole.' : '') };
    if (d1 < d0) return { good: true, text: tt2 && q1(tt2.c) && T2.length === 1 ? v + ' has coefficient 1 now.' : 'Both ' + both + ' were scaled by the same factor, and the ' + v + ' term got simpler.' };
    if (extra && tt && op.kind === 'div') return { good: false, text: 'It is still true, but the ' + v + ' term is not alone yet. The last thing done to ' + v + ' was adding or subtracting a number, so undo that first. Then the division only touches ' + v + '.' };
    return { good: false, text: 'It is still true, but ' + (op.kind === 'div' ? 'dividing' : 'multiplying') + ' by ' + opText(op) + ' did not make the ' + v + ' term simpler. To undo a multiplication, divide by the same number. To undo a division, multiply.' };
  };

  /* ---------- the equations and formulas on offer ---------- */
  const LVNAMES = ['One step', 'Two steps', 'x on both sides', 'Parentheses', 'Negatives, fractions', 'Special cases'];
  const EQS = [
    { lv: 0, s: 'x + 4 = 9' }, { lv: 0, s: 'x − 3 = 6' }, { lv: 0, s: '3x = 12' },
    { lv: 1, s: '3x + 2 = 14' }, { lv: 1, s: '2x − 5 = 7' }, { lv: 1, s: '11 = 4x − 1' },
    { lv: 2, s: '3x + 2 = x + 10' }, { lv: 2, s: '5x − 4 = 2x + 8' }, { lv: 2, s: '2x + 9 = 5x' },
    { lv: 3, s: '2(x + 3) = 14' }, { lv: 3, s: '3(x − 1) = 12' }, { lv: 3, s: '4(x + 2) = 2x + 14' },
    { lv: 4, s: '5x + 3 = 2x − 6' }, { lv: 4, s: '3x + 1 = x + 2' }, { lv: 4, s: 'x/2 + 1 = 4' }, { lv: 4, s: '10 − 2x = 4' },
    { lv: 5, s: '3x + 2 = 3x + 5' }, { lv: 5, s: '2(x + 3) = 2x + 6' }
  ];
  /* solving the unknown, exactly: the answer as a rational, or 'all' or 'none' */
  const solveX = eq => {
    const f = x => qadd(evalE(eq.L, { x }), qneg(evalE(eq.R, { x }))), b = f(Q(0)), a = qadd(f(Q(1)), qneg(b));
    return q0(a) ? (q0(b) ? 'all' : 'none') : qmul(qneg(b), qinv(a));
  };
  for (const e of EQS) { e.eq = parseEq(e.s); e.ans = solveX(e.eq); }
  /* formulas: `vals` is one set of numbers that fits the formula (for the check), `fwd` is what the formula does to the
     unknown (so the student can see the steps to undo, in reverse), and `nodes` labels the pictures along the way */
  const O = (kind, n, v = '') => ({ kind, n, v });
  const FORMS = [
    { s: 'd = rt', v: 't', vals: { d: 12, r: 4, t: 3 }, nodes: ['t', 'd'], fwd: [O('mul', 1, 'r')] },
    { s: 'P = 2l + 2w', v: 'w', vals: { P: 16, l: 5, w: 3 }, nodes: ['w', '2w', 'P'], fwd: [O('mul', 2), O('add', 2, 'l')] },
    { s: 'y = mx + b', v: 'x', vals: { y: 11, m: 2, x: 4, b: 3 }, nodes: ['x', 'mx', 'y'], fwd: [O('mul', 1, 'm'), O('add', 1, 'b')] },
    { s: 'A = bh/2', v: 'h', vals: { A: 12, b: 6, h: 4 }, nodes: ['h', 'bh', 'A'], fwd: [O('mul', 1, 'b'), O('div', 2)] },
    { s: 'P = 2(l + w)', v: 'w', vals: { P: 16, l: 5, w: 3 }, nodes: ['w', 'l + w', 'P'], fwd: [O('add', 1, 'l'), O('mul', 2)] },
    { s: 'F = 9C/5 + 32', v: 'C', vals: { F: 68, C: 20 }, nodes: ['C', '9C', '9C/5', 'F'], fwd: [O('mul', 9), O('div', 5), O('add', 32)] }
  ];
  const INVK = { add: 'sub', sub: 'add', mul: 'div', div: 'mul' };
  for (const f of FORMS) {
    f.eq = parseEq(f.s);
    f.inv = f.fwd.slice().reverse().map(o => ({ ...o, kind: INVK[o.kind] }));
    f.valsQ = {}; for (const k in f.vals) f.valsQ[k] = Q(f.vals[k]);
  }

  /* ---------- the picture: pans, bags and blocks ---------- */
  const SERIF = '"STIX Two Text", "Cambria Math", "Times New Roman", serif';
  const SANS = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
  const rr = (c, x, y, w, hh, r) => {
    r = Math.min(r, w / 2, hh / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + hh, r); c.arcTo(x + w, y + hh, x, y + hh, r);
    c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  const isLetter = ch => /[A-Za-z]/.test(ch);
  /* math text: letters in italic serif, everything else upright sans. The letter o.hot is drawn in o.hotCol. */
  const mtext = (c, pal, s, x, y, o = {}) => {
    let size = o.size || 24;
    const font = (it, sz) => (it ? `italic ${sz}px ${SERIF}` : `500 ${sz * .9}px ${SANS}`);
    const measure = sz => { let w = 0; for (const ch of s) { c.font = font(isLetter(ch), sz); w += c.measureText(ch).width; } return w; };
    let w = measure(size);
    if (o.maxW && w > o.maxW) { size = size * o.maxW / w; w = measure(size); }
    let px = o.align === 'left' ? x : o.align === 'right' ? x - w : x - w / 2;
    c.textAlign = 'left'; c.textBaseline = 'middle';
    for (const ch of s) {
      const it = isLetter(ch); c.font = font(it, size);
      c.fillStyle = it && o.hot && ch === o.hot ? o.hotCol : (o.color || pal.text);
      c.fillText(ch, px, y); px += c.measureText(ch).width;
    }
    return { w, size };
  };
  const sans = (c, s, x, y, size, color, o = {}) => {
    c.font = `${o.weight || 500} ${size}px ${SANS}`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle'; c.fillStyle = color; c.fillText(s, x, y);
  };
  const wrapLines = (c, text, maxW, size) => {
    c.font = `500 ${size}px ${SANS}`;
    const words = text.split(' '), lines = []; let cur = '';
    for (const w of words) {
      const t = cur ? cur + ' ' + w : w;
      if (cur && c.measureText(t).width > maxW) { lines.push(cur); cur = w; } else cur = t;
    }
    if (cur) lines.push(cur);
    return lines;
  };

  /* A pan holds "items": x bags and unit blocks (positive), balloons (negative), and compact stand-ins for big counts.
     item = { key, kind: 'x' | 'u' | 'X' | 'U', sg: 1 | -1, f: fraction of a whole piece, text, box: [group, copy] | null } */
  const CAPS = [{ x: 6, u: 16 }, { x: 3, u: 8 }, { x: 1, u: 2 }];
  const pieceTxt = (c, isX, val) => {            /* label for a bag or a compact stand-in */
    const a = Q(Math.abs(c[0]), c[1]);
    if (val) return qtxt(qmul(a, val));
    return isX ? (q1(a) ? 'x' : pr([{ c: a, m: { x: 1 } }])) : qtxt(a);
  };
  const build = (E, cap, val) => {
    const items = [], ctr = {}, groups = [];
    const key = (k, sg) => { const kk = k + (sg > 0 ? '+' : '-'); ctr[kk] = (ctr[kk] || 0) + 1; return kk + (ctr[kk] - 1); };
    const lab = (isX, sg, c) => (sg < 0 ? MINUS : '') + pieceTxt(c, isX, val);
    const monos = (terms, box) => {
      for (const t of terms) {
        const isX = !!t.m.x, sg = t.c[0] < 0 ? -1 : 1, n = Math.abs(t.c[0]), d = t.c[1], whole = Math.floor(n / d), rem = n - whole * d;
        const lim = isX ? cap.x : cap.u, kind = isX ? 'x' : 'u', big = kind.toUpperCase();
        if (whole > lim) { items.push({ key: key(big, sg), kind: big, sg, f: 1, text: lab(isX, sg, Q(n, d)), box }); continue; }
        for (let i = 0; i < whole; i++) items.push({ key: key(kind, sg), kind, sg, f: 1, text: isX || sg < 0 ? lab(isX, sg, Q(1)) : undefined, box });
        if (rem > 0) items.push({ key: key(kind, sg), kind, sg, f: rem / d, text: lab(isX, sg, Q(rem, d)), box });
      }
    };
    const xFirst = ts => [...ts.filter(t => t.m.x), ...ts.filter(t => !t.m.x)];
    let g = 0;
    for (const t of E) {
      if (t.e && qval(t.c) >= 2 && t.c[1] === 1 && qval(t.c) <= 6 && isConst(t.m) && t.e.every(u => !u.e)) {
        for (let j = 0; j < t.c[0]; j++) monos(xFirst(t.e), [g, j]);
        groups.push({ g, k: t.c[0] }); g++;
      } else if (t.e) monos(xFirst(distRaw([t])), null);
      else monos([t], null);
    }
    return { items, groups };
  };
  const sizeOf = (it, s) => {
    const f = it.f, k = f < 1 ? .55 + .45 * f : 1;
    if (it.sg < 0) return it.kind === 'U' || it.kind === 'X' ? { w: 1.9 * s, h: 1.75 * s } : { w: s * k, h: 1.25 * s * k };
    if (it.kind === 'u') return { w: Math.max(.34 * s, s * f), h: s };
    if (it.kind === 'x') return { w: 1.3 * s * k, h: 1.3 * s * k };
    return it.kind === 'U' ? { w: 2.4 * s, h: s } : { w: 1.9 * s, h: 1.6 * s };
  };
  const packRows = (list, avail, s) => {
    const gap = .12 * s, rows = []; let cur = null;
    for (const it of list) {
      const z = sizeOf(it, s);
      if (z.w > avail + .01) return null;
      if (!cur || cur.w + gap + z.w > avail) { cur = { its: [], w: 0, h: 0 }; rows.push(cur); }
      cur.w += (cur.its.length ? gap : 0) + z.w; cur.h = Math.max(cur.h, z.h); cur.its.push({ it, z });
    }
    return rows;
  };
  /* place everything for one pan at unit size s; x runs from the pan's middle, y is the height above the pan floor */
  const layoutPan = (built, wp, capH, s) => {
    const { items, groups } = built, recs = [], avail = wp - 14, gap = .12 * s, bp = .28 * s;
    const order = a => (a.kind === 'x' || a.kind === 'X' ? 0 : 1);
    let y = .15 * s;
    const putRows = (rows, x0, y0) => {            /* centres rows horizontally about x0, bottom at y0; returns the top */
      let yy = y0;
      for (const r of rows) {
        let xx = x0 - r.w / 2;
        for (const { it, z } of r.its) { recs.push({ key: it.key, it, x: xx + z.w / 2, y: yy + z.h / 2, w: z.w, h: z.h }); xx += z.w + gap; }
        yy += r.h + gap;
      }
      return yy - (rows.length ? gap : 0);
    };
    for (const grp of groups) {
      for (let j = 0; j < grp.k; j++) {
        const list = items.filter(it => it.box && it.box[0] === grp.g && it.box[1] === j).sort((a, b) => order(a) - order(b) || b.sg - a.sg);
        const rows = packRows(list, avail - 2 * bp, s); if (!rows) return null;
        const bw = Math.max(...rows.map(r => r.w), s) + 2 * bp, top = putRows(rows, 0, y + bp), bh = top - y + bp;
        recs.push({ key: 'box' + grp.g + '_' + j, box: true, x: 0, y: y + bh / 2, w: bw, h: bh });
        y += bh + gap;
      }
    }
    const loose = items.filter(it => !it.box);
    const pos = loose.filter(it => it.sg > 0).sort((a, b) => order(a) - order(b)), neg = loose.filter(it => it.sg < 0);
    if (pos.length) { const rows = packRows(pos, avail, s); if (!rows) return null; y = putRows(rows, 0, y) + gap; }
    if (neg.length) {
      const rows = packRows(neg, avail, s); if (!rows) return null;
      y += (pos.length || groups.length ? .5 : .35) * s;
      y = putRows(rows, 0, y);
    }
    return y <= capH ? { recs, h: y } : null;
  };
  const fitPan = (E, val, wp, capH, sMax) => {
    for (const cap of CAPS) {
      const b = build(E, cap, val);
      for (let s = sMax; s >= 12; s--) { const r = layoutPan(b, wp, capH, s); if (r) return { ...r, s }; }
    }
    const b = build(E, CAPS[2], val), r = layoutPan(b, wp, capH, 8);
    return r ? { ...r, s: 8 } : { recs: [], h: 0, s: 8 };
  };
  const mixRecs = (A, B, t) => {
    const out = [], mb = new Map(B.recs.map(r => [r.key, r]));
    const mix = (a, b) => ({ ...b, x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t), a: 1 });
    for (const ra of A.recs) {
      const rb = mb.get(ra.key);
      if (rb) { out.push(mix(ra, rb)); mb.delete(ra.key); } else out.push({ ...ra, a: 1 - t });
    }
    for (const rb of mb.values()) out.push({ ...rb, a: t, y: rb.y + (1 - t) * rb.h * .7 });
    return out;
  };
  const tiltOf = eq => {
    if (status(eq, 'x') !== 'none') return 0;
    return clamp((qval(constOf(eq.L)) - qval(constOf(eq.R))) * .05, -.2, .2);
  };

  /* drawing one piece; (x, y) is its centre on the canvas */
  const drawPiece = (c, pal, r, x, y) => {
    const it = r.it, w = r.w, hh = r.h, a = r.a;
    c.save(); c.globalAlpha = clamp(a, 0, 1); c.setLineDash([]);
    if (r.box) {
      rr(c, x - w / 2, y - hh / 2, w, hh, 6); c.fillStyle = alpha(pal.muted, .07); c.fill();
      c.strokeStyle = alpha(pal.muted, .9); c.lineWidth = 1.4; c.setLineDash([5, 4]); c.stroke(); c.restore(); return;
    }
    const big = it.kind === 'X' || it.kind === 'U';
    if (it.sg < 0) {                                           /* balloon: red, hatched, tied down */
      const rx = w / 2, ry = hh * (big ? .42 : .4), cy = y - hh * .1;
      c.beginPath(); c.ellipse(x, cy, rx, ry, 0, 0, TAU);
      c.fillStyle = pal.stage; c.fill(); c.fillStyle = alpha(pal.red, .22); c.fill();
      c.save(); c.clip(); c.strokeStyle = alpha(pal.red, .5); c.lineWidth = 1.2; c.beginPath();
      for (let k = -hh; k < w + hh; k += 6) { c.moveTo(x - rx + k, cy + ry); c.lineTo(x - rx + k + ry * 2, cy - ry); }
      c.stroke(); c.restore();
      c.beginPath(); c.ellipse(x, cy, rx, ry, 0, 0, TAU); c.strokeStyle = pal.red; c.lineWidth = 1.8; c.stroke();
      c.beginPath(); c.moveTo(x, cy + ry); c.lineTo(x - 3, cy + ry + 5); c.lineTo(x + 3, cy + ry + 5); c.closePath(); c.fillStyle = pal.red; c.fill();
      const fs = clamp(Math.min(w * .5, ry * 1.1), 8, 22);
      if (it.kind === 'x' || it.kind === 'X') mtext(c, pal, it.text, x, cy + 1, { size: fs * 1.1, color: pal.text, maxW: w * .9 });
      else if (ry > 8) sans(c, it.text, x, cy + 1, fs * .8, pal.text, { weight: 600 });
    } else if (it.kind === 'u' || it.kind === 'U') {            /* unit block */
      rr(c, x - w / 2, y - hh / 2, w, hh, Math.min(4, hh * .16)); c.fillStyle = pal.stage; c.fill(); c.fillStyle = alpha(pal.blue, .32); c.fill();
      c.strokeStyle = pal.blue; c.lineWidth = 1.7; c.stroke();
      if (it.kind === 'U') sans(c, it.text, x, y + 1, clamp(hh * .55, 9, 20), pal.text, { weight: 700 });
      else if (hh >= 21 && it.f >= 1) sans(c, '1', x, y + 1, hh * .42, alpha(pal.text, .55), { weight: 600 });
    } else {                                                    /* bag with the unknown */
      const bw = w, bh = hh;
      c.beginPath(); c.moveTo(x - bw * .17, y - bh * .5); c.lineTo(x + bw * .17, y - bh * .5);
      c.quadraticCurveTo(x + bw * .2, y - bh * .26, x + bw * .46, y - bh * .06);
      c.quadraticCurveTo(x + bw * .62, y + bh * .52, x, y + bh * .5);
      c.quadraticCurveTo(x - bw * .62, y + bh * .52, x - bw * .46, y - bh * .06);
      c.quadraticCurveTo(x - bw * .2, y - bh * .26, x - bw * .17, y - bh * .5); c.closePath();
      c.fillStyle = pal.stage; c.fill(); c.fillStyle = alpha(pal.violet, .3); c.fill(); c.strokeStyle = pal.violet; c.lineWidth = 1.9; c.stroke();
      c.beginPath(); c.moveTo(x - bw * .2, y - bh * .36); c.lineTo(x + bw * .2, y - bh * .36); c.stroke();
      mtext(c, pal, it.text, x, y + bh * .1, { size: clamp(bh * (it.text.length > 2 ? .38 : .5), 9, 26), color: pal.text, maxW: bw * .8 });
    }
    c.restore();
  };

  /* ---------- the literal-equation picture: what the formula does to the unknown, and how to undo it ---------- */
  const SYM = { add: '+', sub: MINUS, mul: '×', div: '÷' };
  const opSym = o => SYM[o.kind] + opAbs(o);
  const histWOf = W => clamp(W * .36, 250, 330);
  const arrowH = (c, x0, x1, y, col) => {
    c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 2; c.setLineDash([]); c.lineCap = 'round';
    c.beginPath(); c.moveTo(x0, y); c.lineTo(x1 - 5, y); c.stroke();
    c.beginPath(); c.moveTo(x1, y); c.lineTo(x1 - 8, y - 4.5); c.lineTo(x1 - 8, y + 4.5); c.closePath(); c.fill();
  };

  const pointsLine = vals => Object.keys(vals).map(k => k + ' = ' + vals[k]).join(', ');

  register({
    id: 'solving-equations-with-a-balance', level: 'school',
    title: 'Solving equations with a balance',
    blurb: 'Solve equations on a balance scale by choosing each move yourself, and see the property of equality that makes it legal.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = -.2; p.span = 3.3;
      const post = [[0, 1.3], [-.55, -2.2], [.55, -2.2]];
      p.path(post, { fill: alpha(pal.text, .16), stroke: pal['grid-strong'], width: 1.4, close: true });
      p.path([[-1.1, -2.2], [1.1, -2.2]], { stroke: pal['grid-strong'], width: 3 });
      p.path([[-2.7, 1.3], [2.7, 1.3]], { stroke: pal.text, width: 3.4 });
      p.dot(0, 1.3, 4.5, pal.stage, pal.text, 2);
      for (const sx of [-2.7, 2.7]) {
        p.path([[sx, 1.3], [sx - .85, -.45]], { stroke: pal.muted, width: 1.2 });
        p.path([[sx, 1.3], [sx + .85, -.45]], { stroke: pal.muted, width: 1.2 });
        p.path([[sx - .95, -.45], [sx + .95, -.45], [sx + .6, -.8], [sx - .6, -.8]], { fill: alpha(pal.muted, .3), stroke: pal.muted, width: 1.2, close: true });
      }
      p.path([[-3.35, -.4], [-2.55, -.4], [-2.4, .25], [-2.6, .5], [-3.3, .5], [-3.5, .25]], { fill: alpha(pal.violet, .35), stroke: pal.violet, width: 1.5, close: true });
      p.label('x', -2.95, 0, { size: 13, halo: false });
      for (let k = 0; k < 2; k++) p.path([[-2.3 + k * .46, -.4], [-1.88 + k * .46, -.4], [-1.88 + k * .46, 0], [-2.3 + k * .46, 0]], { fill: alpha(pal.blue, .35), stroke: pal.blue, width: 1.3, close: true });
      for (let k = 0; k < 5; k++) { const bx = 1.8 + (k % 3) * .46, by = -.4 + Math.floor(k / 3) * .46; p.path([[bx, by], [bx + .42, by], [bx + .42, by + .42], [bx, by + .42]], { fill: alpha(pal.blue, .35), stroke: pal.blue, width: 1.3, close: true }); }
    },
    hook: String.raw`An equation is a balance. Why is it safe to subtract 4 from both sides, but never from just one side?`,
    steps: [
      { title: 'Do the same to both pans',
        text: String.raw`<p>The bag holds \(x\) blocks, a number we do not know. The left pan has the bag and 4 blocks. The right pan has 9 blocks. The beam is level, so \(x+4=9\).</p><p>First press <b>Try it on the left pan only</b>. The beam tips, so the two sides are no longer equal. Press <b>Put it back</b> to level it.</p><p>To find \(x\), get the bag alone. The amount is set to 4, so press <b>Subtract 4</b>. Both pans lose 4 blocks and the beam stays level. The right pan holds 5 blocks, so \(x=5\). The written work records each move and the property of equality that allows it.</p>`,
        set: { mode: 'bal', eq: 0, opn: 4 } },
      { title: 'Undo in reverse order',
        text: String.raw`<p>Three bags and 2 blocks balance 14 blocks: \(3x+2=14\). Two things were done to \(x\): it was multiplied by 3, then 2 was added.</p><p>Undo them in <b>reverse order</b>. Subtract 2 first: \(3x=12\). Then divide by 3: \(x=4\). Set the amount with the \(+\) and \(-\) buttons, then press an operation.</p><p>What if you divide by 3 first? Try it. The 2 blocks get divided too, and fractions appear. It still works, but it is harder.</p>`,
        set: { mode: 'bal', eq: 3, opn: 1 } },
      { title: 'Both sides and parentheses',
        text: String.raw`<p>The left pan holds 4 groups of \((x+2)\) and the right pan holds \(2x+14\): \(4(x+2)=2x+14\).</p><p>Press <b>Distribute</b> to open the groups. The left pan holds \(4x+8\), because each group has one bag and 2 blocks. The bags are now on both pans, so subtract \(2x\) from both sides to gather them on the left. Then subtract 8 and divide by 2. The answer is \(x=3\).</p><p>Distributing only rewrites one side. It does not change the amount on that pan, so it is not done to both sides.</p>`,
        set: { mode: 'bal', eq: 11, opn: 1 } },
      { title: 'Solve a formula for one letter',
        text: String.raw`<p>The pans are gone and every letter stands for a number. The formula \(y=mx+b\) is solved for \(y\), and we want \(x\) alone.</p><p>The formula multiplies \(x\) by \(m\), then adds \(b\). Undo it in reverse order: subtract \(b\), then divide by \(m\). Choose <b>b</b> as the amount and press Subtract, then choose <b>m</b> and press Divide. You get \(x=\dfrac{y-b}{m}\).</p><p>Press <b>Check with numbers</b>. With \(m=2\), \(b=3\) and \(x=4\) the formula gives \(y=11\), and the solved form gives back \(x=4\).</p>`,
        set: { mode: 'lit', form: 2, opn: 1 } }
    ],
    formal: String.raw`
      <h3>Equation or expression?</h3>
      <p>An <em>expression</em> such as \(3x+2\) is a calculation with a variable. It has no equal sign, so it is neither true nor false. An <em>equation</em> such as \(3x+2=14\) says that two expressions have the same value. A <em>solution</em> is a number that makes the equation true: \(x=4\) works because \(3(4)+2=14\).</p>
      <h3>Properties of equality</h3>
      <p>An equation says that two sides weigh the same. If you change both sides in exactly the same way, they still weigh the same. For any numbers \(a\), \(b\) and \(c\), if \(a=b\), then:</p>
      <p><b>Addition property:</b> \(a+c=b+c\).<br>
      <b>Subtraction property:</b> \(a-c=b-c\).<br>
      <b>Multiplication property:</b> \(ac=bc\).<br>
      <b>Division property:</b> \(\dfrac{a}{c}=\dfrac{b}{c}\), as long as \(c\neq 0\).<br>
      <b>Substitution property:</b> \(a\) can replace \(b\) in any expression or equation. This is what a check does.<br>
      <b>Symmetric property:</b> \(b=a\), so the two sides can be swapped.</p>
      <p>Change one side only and the balance tips. That is why \(x+4=9\) and \(x+4-4=9\) are different equations, but \(x+4-4=9-4\) is the same equation in a simpler form.</p>
      <h3>Properties that rewrite an expression</h3>
      <p>These do not change the value of an expression, so they work on one side at a time.</p>
      <p><b>Commutative:</b> \(a+b=b+a\) and \(ab=ba\). Example: \(3+x=x+3\).<br>
      <b>Associative:</b> \((a+b)+c=a+(b+c)\). Example: \((x+2)+3=x+(2+3)=x+5\).<br>
      <b>Distributive:</b> \(a(b+c)=ab+ac\). Example: \(2(x+3)=2x+6\). Read backwards it combines like terms: \(5x-2x=(5-2)x=3x\).<br>
      <b>Identity:</b> \(a+0=a\) and \(1\cdot a=a\). Example: \(x+0=x\).<br>
      <b>Inverse:</b> \(a+(-a)=0\), and \(a\cdot\frac1a=1\) when \(a\neq 0\). Examples: \(4-4=0\) and \(3\cdot\frac13=1\).</p>
      <h3>A strategy for multi-step equations</h3>
      <p>1. Open parentheses with the distributive property.<br>
      2. Combine like terms on each side.<br>
      3. Add or subtract so that the variable terms are on one side and the plain numbers are on the other.<br>
      4. Undo what was done to the variable, in reverse order: undo adding and subtracting first, then multiplying and dividing.<br>
      5. Check the answer in the original equation.</p>
      <p>Here is \(3x+2=x+10\), with the reason for each line.</p>
      <p>\(3x+2=x+10\) (given)<br>
      \(3x+2-x=x+10-x\) (subtraction property of equality)<br>
      \(2x+2=10\) (combine like terms; \(x-x=0\) by the inverse property)<br>
      \(2x+2-2=10-2\) (subtraction property of equality)<br>
      \(2x=8\) (inverse property \(2-2=0\), then identity property)<br>
      \(\dfrac{2x}{2}=\dfrac{8}{2}\) (division property of equality)<br>
      \(x=4\) (\(2\div2=1\) by the inverse property, and \(1x=x\) by the identity property)</p>
      <h3>Solving for a variable in a formula</h3>
      <p>A formula is an equation with several letters. To solve for one letter, treat the others as numbers and make the same moves. For \(y=mx+b\), subtract \(b\) from both sides to get \(y-b=mx\). Then divide both sides by \(m\), with \(m\neq 0\):
      \[ x=\frac{y-b}{m}. \]
      The same steps work for \(P=2l+2w\), which gives \(w=\dfrac{P-2l}{2}\), and for \(A=\tfrac12bh\), which gives \(h=\dfrac{2A}{b}\). Undo in reverse order again: whatever the formula did to the letter last, undo first.</p>
      <h3>Checking a solution</h3>
      <p>Put the answer in place of the variable in the <em>original</em> equation and evaluate each side with the order of operations: parentheses first, then multiplication and division, then addition and subtraction. For \(3x+2=x+10\) and \(x=4\): the left side is \(3(4)+2=12+2=14\) and the right side is \(4+10=14\). Both sides are \(14\), so \(4\) is a solution. Check the original equation, not your last line, so a slip anywhere along the way is caught.</p>
      <h3>No solution, or every number</h3>
      <p>Sometimes the variable disappears. For \(3x+2=3x+5\), subtracting \(3x\) leaves \(2=5\), which is false for every \(x\). There is <b>no solution</b>, and on the balance the beam never levels. For \(2(x+3)=2x+6\), distributing and subtracting \(2x\) leaves \(6=6\), which is always true. <b>Every number</b> is a solution, because the two sides are equivalent expressions.</p>`,
    check: [
      { q: String.raw`In solving \(3x+5=2x+9\), a student writes \(3x+5-2x=2x+9-2x\). Which property justifies this step?`,
        choices: [String.raw`The inverse property: \(2x-2x=0\)`, String.raw`The distributive property: \(3x-2x=(3-2)x\)`, 'The subtraction property of equality', 'The commutative property of addition'], answer: 2,
        why: String.raw`The step subtracts the same amount, \(2x\), from both sides, so the equation stays true. That is the subtraction property of equality. The inverse property \(2x-2x=0\) and the distributive property \(3x-2x=(3-2)x\) are used on the next line, when each side is simplified.`,
        hint: 'Ask what was done to both sides in this one step, not what happens when you simplify afterwards.' },
      { q: String.raw`Solve \(3(x-4)=2x+1\).`,
        choices: [String.raw`\(x=5\)`, String.raw`\(x=13\)`, String.raw`\(x=11\)`, String.raw`\(x=-13\)`], answer: 1,
        why: String.raw`Distribute: \(3(x-4)=3x-12\). Subtract \(2x\) from both sides: \(x-12=1\). Add 12 to both sides: \(x=13\). Check: \(3(13-4)=27\) and \(2(13)+1=27\). Forgetting to distribute the 3 over the \(-4\) gives \(x=5\).`,
        hint: 'Open the parentheses first: multiply both terms inside by 3. Then get the x terms on one side and check your answer in the original equation.' }
    ],
    links: { next: ['solving-linear-inequalities', 'systems-of-equations', 'forms-of-a-linear-equation'], related: ['slope-and-linear-functions', 'what-is-a-function', 'square-roots-and-irrational-numbers'] },

    mount({ stage, controls: C }) {
      const mq = matchMedia('(max-width: 900px)'), capOn = () => !mq.matches;
      const P = new Plane(stage, { span: 5 });
      const st = { u: 0, tilt: 0 };
      const B = { n: 1, v: '' };
      const idx = { bal: 0, lit: 2 };
      let cancel = () => {}, S = null, mode = 'bal', histIn = false;
      const frameOf = (eq, extra) => ({ L: eq.L, R: eq.R, ...extra });

      /* ---------- picture ---------- */
      const geomOf = (W, H, histW) => {
        const BW = W - histW, hb = Math.min((BW - 20) / 3, 250), wp = hb, capBand = capOn() ? clamp(H * .19, 84, 118) : 12;
        const eqY = clamp(H * .075, 26, 40), top = eqY + 26, bottom = H - capBand, avail = bottom - top;
        const hang = clamp(avail * .44, 112, 230), total = 38 + hang + 20 + 18 + 34;
        const pivotY = top + Math.max(0, (avail - total) / 2) + 38;
        return { W, H, BW, cx: BW / 2, hb, wp, eqY, hang, pivotY, capH: hang - 32, sMax: clamp(wp / 5, 18, 34), capBand };
      };
      const caption = (c, pal, G) => {
        if (!capOn() || !S.note) return;
        const size = clamp(G.BW / 40, 14, 16), maxW = G.BW - 52, lines = wrapLines(c, S.note.t, maxW, size), lh = size * 1.38;
        const y0 = G.H - G.capBand + 14, col = S.note.k === 'good' ? pal.green : S.note.k === 'hint' ? pal.violet : pal.muted;
        c.fillStyle = col; c.fillRect(18, y0 - 2, 3, lines.length * lh);
        c.font = `500 ${size}px ${SANS}`; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillStyle = pal.text;
        lines.slice(0, 4).forEach((ln, i) => c.fillText(ln, 30, y0 + i * lh));
      };
      const drawBalance = (c, p, histW) => {
        const pal = p.pal, W = p.w, H = p.h, G = geomOf(W, H, histW), fr = S.frames, last = fr.length - 1;
        const i = clamp(Math.floor(st.u), 0, Math.max(0, last - 1)), t = last ? clamp(st.u - i, 0, 1) : 1;
        const FA = fr[last ? i : 0], FB = fr[last ? i + 1 : 0], tilt = st.tilt, ct = Math.cos(tilt), sn = Math.sin(tilt);
        const ends = { L: { x: G.cx - G.hb * ct, y: G.pivotY + G.hb * sn }, R: { x: G.cx + G.hb * ct, y: G.pivotY - G.hb * sn } };
        const baseY = Math.min(G.pivotY + G.hang + 24 + 58, G.H - G.capBand - 6);
        /* stand */
        c.beginPath(); c.moveTo(G.cx - 4, G.pivotY); c.lineTo(G.cx + 4, G.pivotY); c.lineTo(G.cx + 16, baseY); c.lineTo(G.cx - 16, baseY); c.closePath();
        c.fillStyle = alpha(pal.text, .13); c.fill(); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.4; c.stroke();
        rr(c, G.cx - 50, baseY, 100, 9, 4); c.fillStyle = alpha(pal.text, .22); c.fill(); c.strokeStyle = pal['grid-strong']; c.stroke();
        /* pans */
        const eq = S.chk ? S.eq0 : S.eq, hot = S.status === 'solved' && !S.chk;
        for (const side of ['L', 'R']) {
          const e = ends[side], ox = e.x, oy = e.y + G.hang, hw = G.wp / 2;
          c.strokeStyle = alpha(pal.muted, .9); c.lineWidth = 1.5; c.setLineDash([]);
          c.beginPath(); c.moveTo(e.x, e.y); c.lineTo(ox - hw * .94, oy); c.moveTo(e.x, e.y); c.lineTo(ox + hw * .94, oy); c.stroke();
          const la = fitPan(FA[side], FA.val, G.wp, G.capH, G.sMax), lb = fitPan(FB[side], FB.val, G.wp, G.capH, G.sMax), recs = mixRecs(la, lb, t);
          c.beginPath(); c.moveTo(ox - hw, oy); c.lineTo(ox + hw, oy); c.quadraticCurveTo(ox + hw * .62, oy + 26, ox, oy + 26); c.quadraticCurveTo(ox - hw * .62, oy + 26, ox - hw, oy); c.closePath();
          c.fillStyle = alpha(pal['grid-strong'], .4); c.fill(); c.strokeStyle = pal.muted; c.lineWidth = 1.6; c.stroke();
          for (const r of recs) if (!r.box && r.it.sg < 0) {      /* strings first, so the pieces sit in front */
            c.globalAlpha = clamp(r.a, 0, 1) * .5; c.strokeStyle = pal.red; c.lineWidth = 1;
            c.beginPath(); c.moveTo(ox + r.x, oy - r.y + r.h * .3); c.lineTo(ox + r.x, oy); c.stroke(); c.globalAlpha = 1;
          }
          for (const r of recs.filter(r => r.box)) drawPiece(c, pal, r, ox + r.x, oy - r.y);
          for (const r of recs.filter(r => !r.box)) drawPiece(c, pal, r, ox + r.x, oy - r.y);
          if (FB.tot) sans(c, 'total ' + FB.tot[side], ox, oy + 48, clamp(G.BW / 28, 14, 19), pal.text, { weight: 700 });
          c.beginPath(); c.arc(e.x, e.y, 4.5, 0, TAU); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.text; c.lineWidth = 2; c.stroke();
        }
        /* beam and pivot */
        c.strokeStyle = pal.text; c.lineWidth = clamp(G.BW * .012, 4, 7); c.lineCap = 'round';
        c.beginPath(); c.moveTo(ends.L.x, ends.L.y); c.lineTo(ends.R.x, ends.R.y); c.stroke();
        c.beginPath(); c.arc(G.cx, G.pivotY, 9, 0, TAU); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.text; c.lineWidth = 2.5; c.stroke();
        const level = Math.abs(tilt) < .004;
        sans(c, level ? '=' : '≠', G.cx, G.pivotY - 30, 30, level ? pal.green : pal.red, { weight: 700 });
        /* equation on top */
        mtext(c, pal, prEq(eq), G.cx, G.eqY, { size: clamp(G.BW * .06, 22, 36), hot: 'x', hotCol: pal.violet, maxW: G.BW - 28, color: hot ? pal.green : pal.text });
        caption(c, pal, G);
      };

      const drawLiteral = (c, p, histW) => {
        const pal = p.pal, W = p.w, H = p.h, BW = W - histW, cx = BW / 2, f = S.def, v = S.v, solved = S.status === 'solved';
        const G = { BW, H, capBand: capOn() ? clamp(H * .19, 84, 118) : 12 };
        mtext(c, pal, prEq(S.eq), cx, H * .13, { size: clamp(BW * .085, 24, 46), hot: v, hotCol: pal.violet, maxW: BW - 30, color: solved ? pal.green : pal.text });
        /* goal line: "Goal: get w alone" with the letter in color */
        const gy = H * .13 + clamp(BW * .06, 30, 44), gs = clamp(BW / 30, 14, 17);
        c.font = `500 ${gs}px ${SANS}`; const w1 = c.measureText('Goal: get ').width, w3 = c.measureText(' alone').width;
        c.font = `italic ${gs * 1.15}px ${SERIF}`; const w2 = c.measureText(v).width, x0 = cx - (w1 + w2 + w3) / 2;
        sans(c, 'Goal: get ', x0, gy, gs, pal.muted, { align: 'left' }); mtext(c, pal, v, x0 + w1, gy, { size: gs * 1.15, color: pal.violet, align: 'left', hot: v, hotCol: pal.violet });
        sans(c, ' alone', x0 + w1 + w2, gy, gs, pal.muted, { align: 'left' });
        /* two rows of boxes */
        const row = (y, nodes, ops, title, dim) => {
          const n = nodes.length, mx = 22, usable = BW - 2 * mx, nw = clamp(usable / (n * 1.55), 44, 110), stepX = (usable - nw) / (n - 1), nh = 36;
          sans(c, title, mx, y - 34, clamp(BW / 36, 12, 14), pal.muted, { align: 'left', weight: 600 });
          nodes.forEach((nd, k) => {
            const x = mx + nw / 2 + k * stepX;
            rr(c, x - nw / 2, y - nh / 2, nw, nh, 8);
            c.fillStyle = alpha(nd.col, nd.empty ? .04 : .13); c.fill(); c.strokeStyle = nd.col; c.lineWidth = 2; c.setLineDash(nd.empty ? [4, 4] : []); c.stroke(); c.setLineDash([]);
            if (nd.empty) sans(c, '?', x, y + 1, 17, pal.muted, { weight: 600 }); else mtext(c, pal, nd.t, x, y + 1, { size: 17, maxW: nw - 10, color: nd.txt || pal.text });
            if (k < n - 1) {
              const o = ops[k], a0 = x + nw / 2 + 4, a1 = x + stepX - nw / 2 - 4;
              arrowH(c, a0, a1, y, o.col);
              sans(c, o.t, (a0 + a1) / 2, y - 15, clamp(BW / 32, 12, 15), o.t === '?' ? pal.muted : o.col, { weight: 700 });
            }
          });
        };
        const k = f.fwd.length, fy = H * .38, iy = H * .57;
        row(fy, f.nodes.map((t, j) => ({ t, col: pal.blue })), f.fwd.map(o => ({ t: opSym(o), col: pal.blue })), 'What the formula does to ' + v);
        const inv = [{ t: f.nodes[k], col: pal.green }];
        for (let j = 0; j < k; j++) inv.push(j < S.chainDone ? { t: S.chainTxt[j], col: pal.green } : { empty: true, col: pal.muted });
        row(iy, inv, f.inv.map((o, j) => (j < S.chainDone || j < S.reveal || solved ? { t: opSym(o), col: pal.green } : { t: '?', col: pal.muted })), 'Undo it in reverse order');
        if (solved) mtext(c, pal, v + ' = ' + pr(answerOf(S.eq, v)), cx, H * .75, { size: clamp(BW * .07, 22, 38), hot: v, hotCol: pal.violet, color: pal.green, maxW: BW - 30 });
        caption(c, pal, G);
      };

      P.onDraw = (c, p) => {
        place(p.w);
        const histW = histIn ? histWOf(p.w) : 0;
        if (histIn) histBox.style.width = (histW - 40) + 'px';
        (S.m === 'bal' ? drawBalance : drawLiteral)(c, p, histW);
      };

      /* ---------- the panel ---------- */
      const probe = C.readout(), host = probe.parentElement; probe.remove();
      const bt = 'padding:6px 10px;min-height:38px;font-size:.88rem;';
      const histList = h('div', { style: 'overflow-y:auto;max-height:340px;overscroll-behavior:contain;font-size:.86rem;line-height:1.45' });
      const histBox = h('div', { class: 'seb-hist', style: 'min-width:0' },
        h('p', { class: 'ctl-title', style: 'margin:0 0 6px' }, 'Written work'), histList);
      const histSlot = h('div', { class: 'ctl', style: 'display:none' });
      const place = W => {
        const want = W >= 760;
        if (want === histIn && histBox.isConnected) return;
        histIn = want;
        if (want) {
          histBox.style.cssText = 'position:absolute;z-index:3;top:30px;bottom:30px;right:22px;overflow:hidden;display:flex;flex-direction:column;padding:10px 12px;border:1px solid var(--line);border-radius:4px;background:var(--glass);touch-action:pan-y';
          histList.style.maxHeight = 'none'; histList.style.flex = '1'; histList.style.minHeight = '0';
          stage.append(histBox); histSlot.style.display = 'none';
        } else {
          histBox.style.cssText = 'min-width:0'; histList.style.maxHeight = '340px'; histList.style.flex = ''; 
          histSlot.append(histBox); histSlot.style.display = '';
        }
      };

      C.title('Equation');
      const modeBtns = C.buttons([{ label: 'Balance', primary: true, onClick: () => setMode('bal') }, { label: 'Formulas', onClick: () => setMode('lit') }]);
      const sel = C.select({ label: 'Choose an equation', value: '0', options: [{ value: '0', label: '' }], onChange: v => load(mode, +v, true) });
      const selLabel = sel.previousElementSibling;
      sel.style.width = '100%'; sel.style.minWidth = '0';
      const ro = C.readout();
      C.title('Do the same to both sides');
      const mk = (tag, a, ...k) => h(tag, a, ...k);
      const whatRow = mk('div', { class: 'ctl buttons' });
      const stepper = mk('div', { class: 'ctl', style: 'display:flex;align-items:center;gap:10px' });
      const minus = mk('button', { type: 'button', class: 'btn', 'aria-label': 'Smaller amount', style: bt + 'width:42px;font-size:1.2rem;', onclick: () => bump(-1) }, MINUS);
      const plus = mk('button', { type: 'button', class: 'btn', 'aria-label': 'Bigger amount', style: bt + 'width:42px;font-size:1.2rem;', onclick: () => bump(1) }, '+');
      const amt = mk('output', { style: 'min-width:58px;text-align:center;font-size:1.25rem;font-weight:600;font-variant-numeric:tabular-nums' }, '1');
      const amtLab = mk('span', { style: 'font-size:.88rem;color:var(--muted)' }, 'Amount');
      stepper.append(amtLab, minus, amt, plus);
      const opRow = mk('div', { class: 'ctl', style: 'display:grid;grid-template-columns:1fr 1fr;gap:8px' });
      const KINDS = ['add', 'sub', 'mul', 'div'];
      const opBtn = {};
      for (const k of KINDS) { opBtn[k] = mk('button', { type: 'button', class: 'btn', style: bt, onclick: () => doKind(k) }); opRow.append(opBtn[k]); }
      const otherRow = mk('div', { class: 'ctl buttons' });
      const distBtn = mk('button', { type: 'button', class: 'btn', style: bt, onclick: () => doDistribute() }, 'Distribute');
      const swapBtn = mk('button', { type: 'button', class: 'btn', style: bt, onclick: () => doSwapSides() }, 'Swap sides');
      const demoBtn = mk('button', { type: 'button', class: 'btn', style: bt, onclick: () => demo() }, 'Try it on the left pan only');
      otherRow.append(distBtn, swapBtn, demoBtn);
      const utilRow = mk('div', { class: 'ctl buttons' });
      const undoBtn = mk('button', { type: 'button', class: 'btn', style: bt, onclick: () => undo() }, 'Undo');
      const hintBtn = mk('button', { type: 'button', class: 'btn', style: bt, onclick: () => hint() }, 'Hint');
      const resetBtn = mk('button', { type: 'button', class: 'btn', style: bt, onclick: () => load(mode, idx[mode], true) }, 'Reset');
      const checkBtn = mk('button', { type: 'button', class: 'btn primary', style: bt, onclick: () => check() }, 'Check the answer');
      utilRow.append(undoBtn, hintBtn, resetBtn, checkBtn);
      const noteEl = mk('div', { class: 'ctl', 'aria-live': 'polite', style: 'font-size:.9rem;line-height:1.5;border-left:3px solid var(--line-strong);padding:2px 0 2px 10px' });
      host.append(whatRow, stepper, opRow, otherRow, utilRow, noteEl);
      C.hint('Pick an amount, then press an operation. It is applied to both sides at once.');
      host.append(histSlot);

      /* ---------- the problem in front of the student ---------- */
      const lettersOf = s => [...new Set((s.match(/[A-Za-z]/g) || []))];
      const fillSel = () => {
        sel.innerHTML = '';
        const list = mode === 'bal' ? EQS.map((e, i) => LVNAMES[e.lv] + ': ' + e.s) : FORMS.map(f => f.s + '   (solve for ' + f.v + ')');
        list.forEach((t, i) => sel.append(h('option', { value: String(i) }, t)));
        sel.value = String(idx[mode]); selLabel.textContent = mode === 'bal' ? 'Choose an equation' : 'Choose a formula';
      };
      const setNote = (t, k) => { S.note = t ? { t, k: k || 'info' } : null; };
      const play = (fr, tilt, ms) => {
        cancel(); S.frames = fr; st.u = 0;
        if (fr.length < 2) { st.tilt = tilt; st.u = 0; P.draw(); return; }
        cancel = animateTo(st, { u: fr.length - 1, tilt }, ms || 520 * (fr.length - 1), () => P.draw());
      };
      const load = (m, i, anim) => {
        const was = S && S.m === m ? frameOf(S.eq) : null;
        mode = m; idx[m] = i;
        const d = m === 'bal' ? EQS[i] : FORMS[i], xv = m === 'bal' && d.ans !== 'all' && d.ans !== 'none' ? d.ans : Q(2);
        S = { m, i, def: d, eq0: d.eq, eq: d.eq, hasGroups: hasGroup(d.eq.L) || hasGroup(d.eq.R), v: m === 'bal' ? 'x' : d.v, where: m === 'bal' ? 'pan' : 'side', spread: m === 'bal', xv,
          vars: lettersOf(d.s), hist: [{ recs: [{ eq: prEq(d.eq), why: 'Given' }] }], stack: [], moves: 0, note: null, hint: null, demo: null, chk: false,
          frames: [frameOf(d.eq)], chainDone: 0, chainTxt: [], reveal: 0, status: 'open' };
        S.note = { t: m === 'bal' ? 'The beam is level, so the two pans weigh the same. Choose an operation to do to both pans.' : 'Solve for ' + d.v + ' by making the same move on both sides. Undo what the formula did, in reverse order.', k: 'info' };
        sel.value = String(i);
        if (B.v && !(m === 'bal' ? B.v === 'x' : S.vars.includes(B.v))) B.v = '';
        if (anim && was) play([was, frameOf(d.eq)], 0, 600); else { cancel(); st.u = 0; st.tilt = 0; }
        refresh();
      };
      const setMode = m => {
        if (m === mode && S) return;
        cancel(); mode = m; fillSel(); load(m, idx[m], false);
      };

      /* ---------- the amount builder ---------- */
      const buildWhat = () => {
        whatRow.innerHTML = '';
        const opts = [''].concat(S.m === 'bal' ? ['x'] : S.vars);
        opts.forEach(v => {
          const b = mk('button', { type: 'button', class: B.v === v ? 'btn primary' : 'btn', 'aria-pressed': String(B.v === v), style: bt + 'min-width:46px;padding:6px 12px;font-style:' + (v ? 'italic' : 'normal') + (v ? ';font-family:var(--serif);font-size:1.02rem' : ''), onclick: () => { B.v = v; S.hint = null; refresh(); } }, v || 'number');
          whatRow.append(b);
        });
      };
      const bump = d => { B.n += d; if (B.n === 0) B.n += d; B.n = clamp(B.n, -12, 12); S.hint = null; refresh(); };
      const curOp = k => ({ kind: k, n: B.n, v: B.v });
      const paintBuilder = () => {
        const done = S.status !== 'open';
        buildWhat();
        amt.textContent = opText({ n: B.n, v: B.v });
        amtLab.textContent = B.v ? 'How many ' + B.v + "'s" : 'Number';
        for (const k of KINDS) {
          const noX = S.m === 'bal' && B.v && (k === 'mul' || k === 'div');
          opBtn[k].textContent = opLabel(curOp(k)); opBtn[k].disabled = done;
          opBtn[k].style.opacity = done ? '.4' : noX ? '.55' : ''; opBtn[k].style.boxShadow = S.hint === k && !done ? '0 0 0 3px var(--brass)' : '';
        }
        const hasG = !done && (hasGroup(S.eq.L) || hasGroup(S.eq.R));
        distBtn.disabled = !hasG; distBtn.style.opacity = hasG ? '' : '.4'; distBtn.style.boxShadow = S.hint === 'dist' && hasG ? '0 0 0 3px var(--brass)' : '';
        distBtn.style.display = S.hasGroups ? '' : 'none';
        swapBtn.disabled = S.chk; swapBtn.style.opacity = S.chk ? '.4' : '';
        demoBtn.style.display = S.m === 'bal' && S.status === 'open' ? '' : 'none';
        demoBtn.textContent = S.demo ? 'Put it back' : 'Try it on the left pan only';
        undoBtn.disabled = !S.stack.length; undoBtn.style.opacity = S.stack.length ? '' : '.4';
        hintBtn.disabled = done; hintBtn.style.opacity = done ? '.4' : '';
        checkBtn.style.display = S.status === 'solved' && !S.chk ? '' : 'none';
        checkBtn.textContent = S.m === 'bal' ? 'Check the answer' : 'Check with numbers';
      };

      /* ---------- history and readout ---------- */
      const paintHist = () => {
        histList.innerHTML = '';
        S.hist.forEach((mv, i) => histList.append(h('div', { style: 'display:grid;grid-template-columns:20px minmax(0,1fr);gap:6px;padding:7px 0;border-top:' + (i ? '1px solid var(--line)' : '0') },
          h('span', { style: 'color:var(--muted);font-size:.78rem;padding-top:3px;font-variant-numeric:tabular-nums' }, i ? String(i) : ''),
          h('div', {}, mv.recs.map(r => h('div', { style: 'margin-bottom:5px' },
            h('div', { style: 'font-weight:600;font-variant-numeric:tabular-nums;overflow-wrap:anywhere' }, r.eq),
            h('div', { style: 'color:var(--muted);font-size:.82rem;line-height:1.4' }, r.why)))))));
        histList.scrollTop = histList.scrollHeight;
      };
      const refresh = () => {
        S.status = status(S.eq, S.v);
        const k = t => `<span class="k">${t}</span> `, end = S.status === 'solved' ? `<br>${k('Result')}${S.v} = ${pr(answerOf(S.eq, S.v))}` : S.status === 'none' ? `<br>${k('Result')}no solution` : S.status === 'all' ? `<br>${k('Result')}every number is a solution` : '';
        ro.innerHTML = k(S.m === 'bal' ? 'Equation' : 'Formula') + prEq(S.eq) + '<br>' + k('Goal') + 'get ' + S.v + ' alone' + (S.m === 'lit' ? '<br>' + k('Test values') + pointsLine(S.def.vals) : '') + '<br>' + k('Moves') + S.moves + end;
        paintBuilder(); paintHist();
        const wide = capOn();
        noteEl.textContent = S.note ? S.note.t : '';
        noteEl.style.cssText = (wide ? 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;'
          : 'font-size:.9rem;line-height:1.5;padding:2px 0 2px 10px;border-left:3px solid ' + (S.note && S.note.k === 'good' ? 'var(--green)' : S.note && S.note.k === 'hint' ? 'var(--violet)' : 'var(--line-strong)') + ';');
        modeBtns.forEach((b, j) => { b.className = (j === 0) === (mode === 'bal') ? 'btn primary' : 'btn'; });
        P.draw();
      };

      /* ---------- moves ---------- */
      const push = () => S.stack.push({ eq: S.eq, nh: S.hist.length, moves: S.moves, chk: S.chk, cd: S.chainDone, ct: S.chainTxt.slice(), rv: S.reveal });
      const here = () => (S.demo ? S.demo.frame : frameOf(S.eq));
      /* record a move: the history, the new equation, and a short animation through the frames */
      const commit = (res, mid, note, tweak) => {
        const old = frameOf(S.eq), fr = S.demo ? [S.demo.frame, old] : [old];
        push(); S.demo = null; if (tweak) tweak();
        S.hist.push({ recs: res.recs }); S.eq = res.eq; S.moves++; S.hint = null; S.note = note;
        if (mid) fr.push(mid);
        fr.push(frameOf(res.eq));
        play(fr, tiltOf(res.eq));
        refresh();
      };
      const doKind = k => {
        if (S.status !== 'open') return;
        const op = curOp(k);
        if (S.m === 'bal' && B.v && (k === 'mul' || k === 'div')) { setNote('We do not multiply or divide by x here. x might be 0, and dividing by 0 is not allowed. Add or subtract x terms instead.', 'info'); refresh(); return; }
        const res = doOp(S.eq, op, S.spread), fb = feedback(S.eq, res.eq, op, S.v, S.where);
        let mid = null;
        if (k === 'add' || k === 'sub') { const t = opTerm(op), tt = { c: k === 'sub' ? qneg(t.c) : t.c, m: t.m }; mid = { L: [...S.eq.L, tt], R: [...S.eq.R, tt] }; }
        const want = S.m === 'lit' ? S.def.inv[S.chainDone] : null, onPath = want && want.kind === op.kind && want.n === op.n && want.v === op.v;
        commit(res, mid, { t: fb.text, k: fb.good ? 'good' : 'info' }, () => { if (onPath) { S.chainDone++; S.chainTxt = [...S.chainTxt, pr(hasV(res.eq.L, S.v) ? res.eq.R : res.eq.L)]; } });
      };
      const doDistribute = () => {
        if (S.status !== 'open') return;
        if (!(hasGroup(S.eq.L) || hasGroup(S.eq.R))) { setNote('There are no parentheses to open.', 'info'); refresh(); return; }
        commit(doDist(S.eq), null, { t: 'The parentheses are gone. Each pan holds the same amount as before, only written without grouping.', k: 'good' });
      };
      const doSwapSides = () => { commit(doSwap(S.eq), null, { t: 'The sides swapped places. The statement says the same thing, so the equation is still true.', k: 'info' }); };
      const undo = () => {
        if (!S.stack.length) return;
        const from = here(), e = S.stack.pop();
        S.demo = null; S.eq = e.eq; S.hist.length = e.nh; S.moves = e.moves; S.chk = e.chk; S.chainDone = e.cd; S.chainTxt = e.ct; S.reveal = e.rv; S.hint = null;
        setNote('Undone. You are back to ' + prEq(S.eq) + '.', 'info');
        play([from, frameOf(S.eq)], tiltOf(S.eq)); refresh();
      };
      const hint = () => {
        if (S.status !== 'open') return;
        if (S.demo) putBack(true);
        const sg = suggest(S.eq, S.v, S.where);
        if (!sg) return;
        if (sg.kind === 'dist') S.hint = 'dist';
        else {
          S.hint = sg.kind;
          if (sg.ok) { B.n = sg.n; B.v = S.m === 'bal' ? (sg.v === 'x' ? 'x' : '') : sg.v; }
          if (S.m === 'lit') S.reveal = Math.max(S.reveal, S.chainDone + 1);
        }
        S.note = { t: sg.text, k: 'hint' }; refresh();
      };
      const demo = () => {
        if (S.demo) { putBack(); return; }
        if (S.status !== 'open') return;
        const op = { kind: 'add', n: B.n, v: B.v }, t = opTerm(op), weight = B.v ? qval(S.xv) * B.n : B.n;
        const fr = frameOf(S.eq), f1 = { L: [...S.eq.L, t], R: S.eq.R };
        const tl = clamp((weight + tiltRaw()) * .05, -.22, .22), tilt = Math.abs(tl) < .045 ? (tl < 0 ? -.045 : .045) : tl;
        S.demo = { frame: f1 }; S.hint = null;
        const cnt = Math.abs(B.n), what = B.v ? (B.n > 0 ? cnt + (cnt === 1 ? ' more bag' : ' more bags') + ' of x' : cnt + (cnt === 1 ? ' balloon' : ' balloons') + ' tied to x') : (B.n > 0 ? cnt + (cnt === 1 ? ' more block' : ' more blocks') : cnt + (cnt === 1 ? ' balloon' : ' balloons'));
        S.note = { t: 'Only the left pan got ' + what + '. The right pan did not change, so the pans no longer weigh the same and the beam tips. The equation is no longer true. That is why every move must be done to both sides.', k: 'info' };
        play([fr, f1], tilt); refresh();
      };
      const tiltRaw = () => (status(S.eq, 'x') === 'none' ? (qval(constOf(S.eq.L)) - qval(constOf(S.eq.R))) : 0);
      const putBack = quiet => {
        const from = S.demo.frame; S.demo = null;
        if (!quiet) S.note = { t: 'Both pans are back as they were, and the beam is level again.', k: 'info' };
        play([from, frameOf(S.eq)], tiltOf(S.eq)); if (!quiet) refresh();
      };
      const check = () => {
        if (S.status !== 'solved' || S.chk) return;
        const ans = answerOf(S.eq, S.v), recs = [], v = S.v;
        let fr, note;
        if (S.m === 'bal') {
          const a = evalE(ans, {}), sub = { x: a }, vl = evalE(S.eq0.L, sub), vr = evalE(S.eq0.R, sub);
          recs.push({ eq: prSub(S.eq0.L, sub) + ' = ' + prSub(S.eq0.R, sub), why: 'Substitution property of equality: put ' + qtxt(a) + ' in place of x in the original equation.' });
          recs.push({ eq: qtxt(vl) + ' = ' + qtxt(vr), why: 'Order of operations. Left: ' + evalSteps(S.eq0.L, sub).join(' = ') + '. Right: ' + evalSteps(S.eq0.R, sub).join(' = ') + '. Both sides equal ' + qtxt(vl) + ', so x = ' + qtxt(a) + ' is a solution.' });
          fr = frameOf(S.eq0, { val: a, tot: { L: qtxt(vl), R: qtxt(vr) } });
          note = { t: 'Each bag now holds ' + qtxt(a) + ' blocks. Left pan: ' + evalSteps(S.eq0.L, sub).join(' = ') + '. Right pan: ' + evalSteps(S.eq0.R, sub).join(' = ') + '. Both pans weigh ' + qtxt(vl) + ', so the beam is level.', k: 'good' };
        } else {
          const vals = S.def.valsQ, others = { ...vals }; delete others[v];
          const given = Object.keys(others).filter(k => S.vars.includes(k)).map(k => k + ' = ' + qtxt(others[k])).join(' and ');
          const vl = evalE(S.eq0.L, vals), vr = evalE(S.eq0.R, vals);
          recs.push({ eq: v + ' = ' + evalSteps(ans, others).join(' = '), why: 'Substitution property of equality: put ' + given + ' into the solved formula. It gives ' + v + ' = ' + qtxt(vals[v]) + ', the value we started with.' });
          recs.push({ eq: prSub(S.eq0.L, vals) + ' = ' + prSub(S.eq0.R, vals), why: 'Check the original formula with all the numbers. Left: ' + evalSteps(S.eq0.L, vals).join(' = ') + '. Right: ' + evalSteps(S.eq0.R, vals).join(' = ') + '. Both sides equal ' + qtxt(vl) + '.' });
          note = { t: 'With ' + given + ', the solved formula gives ' + v + ' = ' + qtxt(vals[v]) + '. Put all the numbers into the original formula and both sides equal ' + qtxt(vl) + '.', k: 'good' };
        }
        const from = here(); push(); S.demo = null; S.hist.push({ recs }); S.chk = true; S.hint = null; S.note = note;
        play(S.m === 'bal' ? [from, fr] : [from], 0); refresh();
      };

      /* ---------- guided steps ---------- */
      const apply = (patch, immediate) => {
        cancel();
        const { mode: m, eq: ei, form: fi, opn, ...rest } = patch;
        B.n = opn != null ? opn : 1; B.v = '';
        const nm = m || mode;
        if (nm !== mode) { mode = nm; fillSel(); S = null; }
        const i = nm === 'bal' ? (ei != null ? ei : idx.bal) : (fi != null ? fi : idx.lit);
        if (!S) { load(nm, i, false); return; }
        load(nm, i, !immediate);
      };
      mq.addEventListener('change', refresh);
      fillSel(); load('bal', 0, false);
      return { destroy: () => { cancel(); mq.removeEventListener('change', refresh); histBox.remove(); P.destroy(); }, apply };
    }
  });
}

