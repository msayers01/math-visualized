/* =====================================================================
   PRACTICE (cas): a small exact-arithmetic checker, independent of the generators.
   A generator builds a problem from its answer; this module re-reads the finished problem (its `model` string, a plain
   ASCII statement such as "2*x+3=11" or "3/4+2/3") and works the answer out from scratch with exact fractions.
   It shares no code with the generators except the rational type, so a bug in a generator's algebra shows up here.
   Grammar: numbers (3, 0.25), variables x and y, + - * / ^ (whole-number powers), sqrt(...) of perfect squares,
   brackets, and implicit multiplication (2x, 3(x+1)).
   ===================================================================== */
{
  const { R, rat } = Practice;
  const tokenize = src => {
    const out = [], re = /\s*(\d+(?:\.\d+)?|[a-z]+|[-+*\/^()=;])/gy;
    let m, pos = 0;
    while (pos < src.length) {
      re.lastIndex = pos; m = re.exec(src);
      if (!m) { if (/^\s*$/.test(src.slice(pos))) break; throw new Error('cannot read "' + src.slice(pos) + '"'); }
      out.push(m[1]); pos = re.lastIndex;
    }
    return out;
  };
  const num = s => { const [w, f = ''] = s.split('.'); return R(+(w + f), 10 ** f.length); };
  const isqrt = n => { const r = Math.round(Math.sqrt(n)); return r * r === n ? r : null; };

  /* parse(src) -> function(env) -> rational, env like { x: R(2) } */
  Practice.cas = {};
  Practice.cas.parse = src => {
    const t = tokenize(src); let i = 0;
    const peek = () => t[i], eat = x => { if (t[i] !== x) throw new Error(`expected ${x} in "${src}"`); i++; };
    const startsAtom = k => k !== undefined && (/^\d/.test(k) || /^[a-z]+$/.test(k) || k === '(');
    function expr() {
      let f = term();
      while (peek() === '+' || peek() === '-') { const op = t[i++], g = term(), a = f; f = op === '+' ? e => rat.add(a(e), g(e)) : e => rat.sub(a(e), g(e)); }
      return f;
    }
    function term() {
      let f = unary();
      for (;;) {
        const k = peek();
        if (k === '*' || k === '/') { i++; const g = unary(), a = f; f = k === '*' ? e => rat.mul(a(e), g(e)) : e => rat.div(a(e), g(e)); }
        else if (startsAtom(k) && !/^\d/.test(k)) { const g = power(), a = f; f = e => rat.mul(a(e), g(e)); }   /* implicit: 2x, 3(x+1), 2sqrt(..) */
        else return f;
      }
    }
    function unary() { if (peek() === '-') { i++; const g = unary(); return e => rat.neg(g(e)); } if (peek() === '+') { i++; return unary(); } return power(); }
    function power() {
      const b = atom();
      if (peek() === '^') {
        i++; const x = unary();
        return e => { const base = b(e), p = x(e); if (!rat.isInt(p) || p.n < 0 || p.n > 6) throw new Error('only small whole-number powers'); let r = R(1); for (let k = 0; k < p.n; k++) r = rat.mul(r, base); return r; };
      }
      return b;
    }
    function atom() {
      const k = t[i++];
      if (k === undefined) throw new Error('unexpected end of "' + src + '"');
      if (/^\d/.test(k)) { const v = num(k); return () => v; }
      if (k === 'sqrt') { eat('('); const g = expr(); eat(')'); return e => { const v = g(e), a = isqrt(v.n), b = isqrt(v.d); if (v.n < 0 || a === null || b === null) throw new Error('not a perfect square'); return R(a, b); }; }
      if (/^[a-z]+$/.test(k)) return e => { if (!(k in e)) throw new Error('unknown variable ' + k); return e[k]; };
      if (k === '(') { const g = expr(); eat(')'); return g; }
      throw new Error('unexpected ' + k + ' in "' + src + '"');
    }
    const f = expr();
    if (i !== t.length) throw new Error('unexpected ' + t[i] + ' in "' + src + '"');
    return f;
  };
  Practice.cas.value = (src, env = {}) => Practice.cas.parse(src)(env);

  /* "lhs=rhs" -> function(env) = lhs - rhs */
  const diff = eq => { const p = eq.split('='); if (p.length !== 2) throw new Error('not an equation: ' + eq); const L = Practice.cas.parse(p[0]), Rr = Practice.cas.parse(p[1]); return e => rat.sub(L(e), Rr(e)); };

  /* One linear equation in x. Sampled at x = 0, 1, 2, 3 (a line has constant steps), then solved from the slope. */
  Practice.cas.solveLinear = eq => {
    const f = diff(eq), v = [0, 1, 2, 3].map(k => f({ x: R(k) })), s = rat.sub(v[1], v[0]);
    for (let k = 2; k < 4; k++) if (!rat.eq(rat.sub(v[k], v[k - 1]), s)) throw new Error('not linear: ' + eq);
    if (rat.isZero(s)) throw new Error('no single solution: ' + eq);
    return rat.neg(rat.div(v[0], s));
  };
  /* Two linear equations in x and y, joined by ";": a x + b y = c each, solved by Cramer's rule. */
  Practice.cas.solveSystem = src => {
    const rows = src.split(';').map(eq => {
      const f = diff(eq), f00 = f({ x: R(0), y: R(0) }), a = rat.sub(f({ x: R(1), y: R(0) }), f00), b = rat.sub(f({ x: R(0), y: R(1) }), f00);
      if (!rat.eq(f({ x: R(1), y: R(1) }), rat.add(f00, rat.add(a, b))) || !rat.eq(f({ x: R(2), y: R(3) }), rat.add(f00, rat.add(rat.mul(R(2), a), rat.mul(R(3), b))))) throw new Error('not linear: ' + eq);
      return { a, b, c: rat.neg(f00) };
    });
    if (rows.length !== 2) throw new Error('need two equations');
    const [p, q] = rows, det = rat.sub(rat.mul(p.a, q.b), rat.mul(q.a, p.b));
    if (rat.isZero(det)) throw new Error('no single solution');
    return [rat.div(rat.sub(rat.mul(p.c, q.b), rat.mul(q.c, p.b)), det), rat.div(rat.sub(rat.mul(p.a, q.c), rat.mul(q.a, p.c)), det)];
  };

  /* Re-derive the answer of a finished problem from its model, as the same shape the generator uses for `answer.value`. */
  Practice.cas.answerOf = inst => {
    const m = inst.model;
    if (inst.answer.type === 'pair') return Practice.cas.solveSystem(m);
    if (inst.ask === 'solve') return Practice.cas.solveLinear(m);
    return Practice.cas.value(m);
  };
}
