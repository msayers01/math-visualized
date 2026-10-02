/* =====================================================================
   REGISTRY
   ===================================================================== */
const LEVELS = {
  school: { name: 'Middle & high school', desc: 'Geometry, algebra, functions, and first ideas in probability.' },
  ugrad:  { name: 'Undergraduate', desc: 'Calculus, linear algebra, differential equations, and series.' },
  grad:   { name: 'Graduate', desc: 'Complex analysis, algebra, topology, and geometry.' }
};
const VIZ = [];
/* Split builds (node tools/build.js --split) leave lesson code out of index.html and fill LAZY_LESSONS with
   one metadata record per lesson. Each becomes a light entry in VIZ (enough for the home list, the order,
   the filters and progress counts) until its script, lessons/<id>.js, is loaded on demand. In the
   single-file build LAZY_LESSONS stays empty and every lesson registers when the page loads. */
const LAZY_LESSONS = [];
const isLoaded = v => typeof v.mount === 'function';
const register = v => {
  const stub = VIZ.find(x => x.id === v.id && !isLoaded(x));
  if (stub) Object.assign(stub, v); else VIZ.push(v);
};
function registerStubs() {
  for (const m of LAZY_LESSONS) {
    /* steps and check are length-only placeholders so progress counts work; the real arrays replace them on load */
    VIZ.push({ id: m.id, level: m.level, title: m.title, blurb: m.blurb, steps: Array(m.steps).fill(null), check: Array(m.check).fill(null),
      links: { prereq: m.prereq }, lazySrc: m.src });
  }
}
const pendingLoads = new Map();
/* Resolves with the full lesson once its script has run (immediately when it is already loaded). */
function loadLesson(id) {
  const v = VIZ.find(x => x.id === id);
  if (!v || isLoaded(v)) return Promise.resolve(v);
  /* A flaky school network drops a request now and then: try twice more (after a short wait) before giving up and
     letting the page offer "Try again". */
  const attempt = n => new Promise((resolve, reject) => {
    const s = document.createElement('script');
    const done = err => { if (err) { s.remove(); reject(err); } else resolve(v); };
    s.onload = () => done(isLoaded(v) ? null : new Error('The lesson file did not register ' + id));
    s.onerror = () => done(new Error('Could not load ' + v.lazySrc));
    s.src = v.lazySrc; document.head.append(s);
  }).catch(err => n >= 2 ? Promise.reject(err) : new Promise(r => setTimeout(r, 500 * (n + 1))).then(() => attempt(n + 1)));
  if (!pendingLoads.has(id)) pendingLoads.set(id, attempt(0).finally(() => pendingLoads.delete(id)));
  return pendingLoads.get(id);
}
const PLANNED = {
  school: ['Slope and linear functions', 'Systems of equations', 'Functions as transformations', 'Quadratics and the parabola', 'Exponential growth',
           'Area of a circle', 'Similarity and scaling', 'Inscribed angles', 'The unit circle and trig waves',
           'Mean, median, and spread', 'Probability with repeated trials', "Pascal's triangle and the Galton board"],
  ugrad:  ['Limits and epsilon-delta', 'Derivatives as tangent slopes', 'Riemann sums and the integral', 'The fundamental theorem of calculus', 'Taylor series', 'When infinite sums converge',
           'Vectors, span, and linear combinations', 'Dot product and projection', 'Gradient and contour maps', 'Divergence and curl', 'Slope fields and phase portraits',
           "Euler's formula and complex multiplication", 'Fourier series as epicycles', 'The central limit theorem', "Bayes' theorem"],
  grad:   ['Cayley graphs of groups', 'Homotopy and the fundamental group', 'The Fourier transform', 'Manifolds and tangent spaces']
};

/* Lesson ids double as URL slugs, and a planned lesson's id is the slug of its title,
   so cross-links can point at lessons that are not built yet. */
const slug = t => t.toLowerCase().replace(/['\u2019]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const plannedRef = id => {
  for (const [level, list] of Object.entries(PLANNED)) {
    const title = list.find(t => slug(t) === id);
    if (title) return { level, title };
  }
  return null;
};
/* id -> { level, title, live } for built or planned lessons, else null */
function lessonRef(id) {
  const v = VIZ.find(x => x.id === id);
  if (v) return { level: v.level, title: v.title, live: true };
  const p = plannedRef(id);
  return p && { ...p, live: false };
}
