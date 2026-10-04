/* =====================================================================
   PRACTICE (core): the namespace, a seeded random generator, exact rational numbers, and message lookup.
   Everything under src/practice/ is pure (no DOM), so tools/tests/practice.test.js can run it in Node.
   Everything is one script, so the only top-level name this folder adds is `Practice`.
   ===================================================================== */
const Practice = {};
{
  /* mulberry32: the same seed always gives the same stream, in every browser and in Node */
  Practice.rng = seed => {
    let a = seed >>> 0;
    const next = () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const int = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1));
    return {
      next, int,
      pick: arr => arr[Math.floor(next() * arr.length)],
      chance: p => next() < p,
      /* an integer in [lo, hi] other than the listed ones */
      intExcept: (lo, hi, ...skip) => { for (let i = 0; i < 200; i++) { const v = int(lo, hi); if (!skip.includes(v)) return v; } throw new Error('intExcept: nothing left in range'); }
    };
  };

  /* Exact rationals on safe integers. A result that would leave the safe range throws, so a generator can never
     show a number that was silently rounded. */
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a; };
  const SAFE = 2 ** 50;
  const R = (n, d = 1) => {
    if (!Number.isInteger(n) || !Number.isInteger(d)) throw new Error('rational needs integers');
    if (d === 0) throw new Error('division by zero');
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d) || 1;
    n /= g; d /= g;
    if (Math.abs(n) > SAFE || d > SAFE) throw new Error('number too large');
    return { n: n + 0, d };   /* + 0 turns -0 into 0 */
  };
  const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
  Practice.gcd = gcd; Practice.lcm = lcm;
  Practice.R = R;
  Practice.rat = {
    add: (a, b) => R(a.n * b.d + b.n * a.d, a.d * b.d),
    sub: (a, b) => R(a.n * b.d - b.n * a.d, a.d * b.d),
    mul: (a, b) => R(a.n * b.n, a.d * b.d),
    div: (a, b) => R(a.n * b.d, a.d * b.n),
    neg: a => R(-a.n, a.d),
    eq: (a, b) => a.n === b.n && a.d === b.d,
    isInt: a => a.d === 1,
    isZero: a => a.n === 0,
    cmp: (a, b) => Math.sign(a.n * b.d - b.n * a.d),
    toNum: a => a.n / a.d,
    /* "3", "-3/4" */
    str: a => (a.d === 1 ? String(a.n) : a.n + '/' + a.d)
  };

  /* Words and sentences live in Practice.T (strings.js), keyed, with {name} slots, so they can be translated later. A missing
     key or slot throws: a half-built sentence must never reach a student. */
  Practice.say = (key, params = {}) => {
    const s = Practice.T[key];
    if (typeof s !== 'string') throw new Error('missing practice string: ' + key);
    return s.replace(/\{(\w+)\}/g, (m, k) => {
      if (!(k in params)) throw new Error(`practice string ${key} needs {${k}}`);
      return String(params[k]);
    });
  };
}
