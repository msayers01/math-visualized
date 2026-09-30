/* =====================================================================
   REGISTRY
   ===================================================================== */
const LEVELS = {
  school: { name: 'Middle & high school', desc: 'Geometry, algebra, functions, and first ideas in probability.' },
  ugrad:  { name: 'Undergraduate', desc: 'Calculus, linear algebra, differential equations, and series.' },
  grad:   { name: 'Graduate', desc: 'Complex analysis, algebra, topology, and geometry.' }
};
const VIZ = [];
const register = v => VIZ.push(v);
const PLANNED = {
  school: ['Slope and linear functions', 'Systems of equations', 'Functions as transformations', 'Quadratics and the parabola', 'Exponential growth',
           'Area of a circle', 'Similarity and scaling', 'Inscribed angles', 'The unit circle and trig waves',
           'Mean, median, and spread', 'Probability with repeated trials', "Pascal's triangle and the Galton board"],
  ugrad:  ['Derivatives as tangent slopes', 'Riemann sums and the integral', 'Fourier series as epicycles', 'Taylor series'],
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
