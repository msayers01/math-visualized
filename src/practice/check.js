/* =====================================================================
   PRACTICE (check): reading what a student typed and comparing it with the answer by value.
   answer = { type: 'number' | 'pair' | 'set', value, form?: 'any' | 'simplified', units?: [...] }
   value: number -> {n,d};  pair and set -> [{n,d}, ...]  (pair is ordered, set is not).
   check() returns { status, shown } with status 'correct', 'form' (right value, wrong form), 'wrong' or 'invalid'
   (could not be read: this does not count as an attempt).
   ===================================================================== */
{
  const { R, rat, gcd } = Practice;
  const clean = s => String(s).replace(/[−–—]/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/ /g, ' ').trim();

  /* one number: "-3", "0.25", "3/4", "1 1/2", "-1 1/2". Returns { v, literalFraction, reduced } or null. */
  const parseNumber = raw => {
    let s = clean(raw).replace(/\s+/g, ' ');
    if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, '');
    let sign = 1;
    const sg = s.match(/^([+-])\s*(.*)$/);
    if (sg) { sign = sg[1] === '-' ? -1 : 1; s = sg[2]; }
    let m;
    if ((m = s.match(/^(\d+)$/))) return { v: R(sign * +m[1]) };
    if ((m = s.match(/^(\d*)\.(\d+)$/))) { if (m[2].length > 9) return null; return { v: R(sign * +((m[1] || '0') + m[2]), 10 ** m[2].length) }; }
    if ((m = s.match(/^(\d+)\s*\/\s*(\d+)$/))) { if (+m[2] === 0) return null; return { v: R(sign * +m[1], +m[2]), fraction: true, reduced: gcd(+m[1], +m[2]) === 1 }; }
    if ((m = s.match(/^(\d+) (\d+)\s*\/\s*(\d+)$/))) { if (+m[3] === 0) return null; return { v: R(sign * (+m[1] * +m[3] + +m[2]), +m[3]), fraction: true, reduced: gcd(+m[2], +m[3]) === 1 && +m[2] < +m[3] }; }
    return null;
  };
  Practice.parseNumber = parseNumber;

  /* drop a trailing unit (one or two words from the allowed list, or a % sign): "24 square units", "25%", "13 ft" */
  const stripUnits = (s, units) => {
    if (!units) return s;
    let t = clean(s);
    if (units.includes('%')) t = t.replace(/\s*%$/, '');
    if (units.includes('\u00b0')) t = t.replace(/\s*\u00b0$/, '');
    for (let k = 0; k < 2; k++) {
      const m = t.match(/^(.*?)\s*([a-zA-Z.]+)$/);
      if (m && m[1] !== '' && units.includes(m[2].toLowerCase().replace(/\.$/, ''))) t = m[1]; else break;
    }
    return t;
  };
  const stripLabel = (s, name) => clean(s).replace(new RegExp('^' + name + '\\s*=\\s*', 'i'), '');
  const splitList = s => clean(s).replace(/^[\[({]\s*|\s*[\])}]$/g, '').split(/\s*(?:,|;|\band\b)\s*/i).filter(x => x !== '');

  /* parse an answer for a given spec into a value (same shape as spec.value), or { error } */
  Practice.parseAnswer = (spec, input) => {
    const text = clean(input);
    if (!text) return { error: 'empty' };
    if (spec.type === 'number') {
      const p = parseNumber(stripUnits(stripLabel(text, spec.name || 'x'), spec.units));
      return p ? { value: p.v, p } : { error: 'unreadable' };
    }
    if (spec.type === 'pair') {
      /* "(2, -1)", "2, -1", "x=2, y=-1" (labels may come in either order) */
      const parts = splitList(text.replace(/^\(|\)$/g, ''));
      if (parts.length !== 2) return { error: 'unreadable' };
      const lab = parts.map(x => (x.match(/^([xy])\s*=\s*(.*)$/i) || []));
      let vals;
      if (lab.every(l => l.length)) { if (lab[0][1].toLowerCase() === lab[1][1].toLowerCase()) return { error: 'unreadable' }; vals = lab.slice().sort((a, b) => a[1].toLowerCase() < b[1].toLowerCase() ? -1 : 1).map(l => parseNumber(l[2])); }
      else if (lab.some(l => l.length)) return { error: 'unreadable' };
      else vals = parts.map(parseNumber);
      return vals.every(Boolean) ? { value: vals.map(p => p.v) } : { error: 'unreadable' };
    }
    if (spec.type === 'set') {
      const vals = splitList(text).map(x => parseNumber(stripUnits(x, spec.units)));
      return vals.length && vals.every(Boolean) ? { value: vals.map(p => p.v) } : { error: 'unreadable' };
    }
    throw new Error('unknown answer type ' + spec.type);
  };

  /* do two values (same type) agree? */
  Practice.sameValue = (type, a, b) => {
    if (type === 'number') return rat.eq(a, b);
    if (type === 'pair') return a.length === b.length && a.every((v, i) => rat.eq(v, b[i]));
    if (type === 'set') {
      const key = v => v.map(x => rat.str(x)).sort().join('|');
      const uniq = v => [...new Set(v.map(x => rat.str(x)))].sort().join('|');
      return uniq(a) === uniq(b) && key(a) !== undefined;
    }
    throw new Error('unknown answer type ' + type);
  };

  Practice.check = (spec, input) => {
    const r = Practice.parseAnswer(spec, input);
    if (r.error) return { status: 'invalid', reason: r.error };
    const shown = Practice.showValue(spec, r.value);
    if (!Practice.sameValue(spec.type, r.value, spec.value)) return { status: 'wrong', value: r.value, shown };
    if (spec.type === 'number' && spec.form === 'simplified' && r.p.fraction && !r.p.reduced) return { status: 'form', value: r.value, shown };
    return { status: 'correct', value: r.value, shown };
  };

  /* plain text for a value, used in echoes ("Reading your answer as ...") and in worked solutions */
  Practice.showValue = (spec, v) => {
    const dec = x => {   /* a terminating decimal, exactly (the denominator has only the factors 2 and 5) */
      let d = x.d, twos = 0, fives = 0;
      while (d % 2 === 0) { d /= 2; twos++; } while (d % 5 === 0) { d /= 5; fives++; }
      if (d !== 1) return rat.str(x);
      const places = Math.max(twos, fives), scaled = Math.abs(x.n) * 10 ** places / x.d, str = String(scaled).padStart(places + 1, '0');
      return (x.n < 0 ? '-' : '') + (places ? str.slice(0, -places) + '.' + str.slice(-places) : str);
    };
    const one = x => (spec.display === 'decimal' ? dec(x) : rat.str(x)).replace('-', '\u2212');
    if (spec.type === 'number') return one(v);
    if (spec.type === 'pair') return '(' + v.map(one).join(', ') + ')';
    return '{' + v.map(one).join(', ') + '}';
  };

  /* which misconception (if any) does this wrong answer match? */
  Practice.matchMisconception = (inst, value) => {
    for (const m of inst.misconceptions || []) if (Practice.sameValue(inst.answer.type, value, m.wrongAnswer)) return m;
    return null;
  };
}
