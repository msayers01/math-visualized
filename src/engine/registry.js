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
  school: ['Slope and linear functions', 'The unit circle and trig waves', 'Quadratics and the parabola', 'Probability with repeated trials'],
  ugrad:  ['Derivatives as tangent slopes', 'Riemann sums and the integral', 'Fourier series as epicycles', 'Taylor series'],
  grad:   ['Cayley graphs of groups', 'Homotopy and the fundamental group', 'The Fourier transform', 'Manifolds and tangent spaces']
};
