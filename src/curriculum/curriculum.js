/* =====================================================================
   CURRICULUM: grade bands, courses, skill levels, and the alignment of every lesson
   (the standards themselves are in standards-mn2022.js)

   Adding a lesson also means adding one ALIGN entry below; the build fails without it.

   Tagging rule: list a benchmark only when the lesson's steps, interactive, formal math or
   quick checks actually address it, not merely when the topic is nearby. Fewer, accurate tags
   beat many loose ones, because teachers filter on them.

   Order rule (computed, see engine/curriculum.js): level, then course sequence (COURSES order),
   then skill level (introductory first), then the lesson's first benchmark in the standards
   document's own order (strand, anchor, benchmark), then registration order. Within a course a
   lesson never appears before one it builds on ("prereq" links).
   ===================================================================== */

/* Grade-level filter. School bands follow the 2022 Minnesota document: Grades 6, 7 and 8 each
   have their own benchmarks and Grades 9-11 are one band. A lesson's grades are its course's
   grades plus the band of every benchmark it is tagged with. */
const GRADES = [
  { id: '6',    name: 'Grade 6' },
  { id: '7',    name: 'Grade 7' },
  { id: '8',    name: 'Grade 8' },
  { id: '9-11', name: 'Grades 9–11' },
  { id: 'ug',   name: 'Undergraduate' },
  { id: 'gr',   name: 'Graduate' }
];

/* Courses in teaching sequence. The 2022 standards have no high-school course split, so
   Algebra 1 through Precalculus are conventional labels, not state-defined courses. A course
   with no lessons is simply not shown. */
const COURSES = [
  { id: 'grade6',           level: 'school', name: 'Grade 6 Mathematics',        grades: ['6'] },
  { id: 'grade7',           level: 'school', name: 'Grade 7 Mathematics',        grades: ['7'] },
  { id: 'grade8',           level: 'school', name: 'Grade 8 Mathematics',        grades: ['8'] },
  { id: 'algebra1',         level: 'school', name: 'Algebra 1',                  grades: ['9-11'] },
  { id: 'geometry',         level: 'school', name: 'Geometry',                   grades: ['9-11'] },
  { id: 'algebra2',         level: 'school', name: 'Algebra 2',                  grades: ['9-11'] },
  { id: 'precalc',          level: 'school', name: 'Precalculus & Trigonometry', grades: ['9-11'] },
  { id: 'stats',            level: 'school', name: 'Statistics & Probability',   grades: ['9-11'] },
  { id: 'linear-algebra',   level: 'ugrad',  name: 'Linear Algebra',             grades: ['ug'] },
  { id: 'complex-analysis', level: 'grad',   name: 'Complex Analysis',           grades: ['gr'] }
];

/* Skill level of the lesson itself, not of the student. */
const SKILLS = [
  { id: 'intro', name: 'Introductory', desc: 'A first look at the idea. Needs nothing else on this site.' },
  { id: 'mid',   name: 'Intermediate', desc: 'An on-grade skill that builds on earlier ideas.' },
  { id: 'adv',   name: 'Advanced',     desc: 'Proof-style reasoning, or ideas that go beyond the grade-band benchmarks.' }
];

/* One entry per lesson: its course, skill level and aligned benchmarks.
   Entries are grouped by course for reading; the displayed order is computed. */
const ALIGN = [
  /* Grade 6 */
  { id: 'negative-numbers-and-absolute-value', course: 'grade6', skill: 'intro', standards: ['6.3.5.1', '6.3.5.2', '6.3.5.3', '6.3.5.6'] },
  { id: 'variables-and-relationships', course: 'grade6', skill: 'intro', standards: ['6.3.7.1'] },
  { id: 'percents-on-tape-and-number-lines', course: 'grade6', skill: 'mid', standards: ['6.3.5.11', '6.3.6.2'] },
  { id: 'unit-rates-and-best-buys', course: 'grade6', skill: 'mid', standards: ['6.3.5.10', '6.3.6.6'] },
  { id: 'ratios-and-equivalent-ratios', course: 'grade6', skill: 'intro', standards: ['6.3.6.5', '6.3.6.6'] },

  /* Grade 7 */
  { id: 'area-of-a-circle', course: 'grade7', skill: 'intro', standards: ['7.2.3.1', '7.2.3.2'] },
  { id: 'percent-change-and-money', course: 'grade7', skill: 'mid', standards: ['7.3.6.5'] },
  { id: 'scale-drawings-and-proportions', course: 'grade7', skill: 'mid', standards: ['7.2.4.4', '7.3.6.4'] },
  { id: 'proportional-relationships', course: 'grade7', skill: 'mid', standards: ['7.3.7.1', '7.3.7.2', '7.3.7.3'] },

  /* Grade 8 */
  { id: 'pythagorean-theorem',         course: 'grade8', skill: 'intro', standards: ['8.2.3.1', '8.2.3.3'] },
  { id: 'slope-and-linear-functions',  course: 'grade8', skill: 'intro', standards: ['8.2.4.1', '8.3.7.5', '8.3.7.6'] },
  { id: 'systems-of-equations',        course: 'grade8', skill: 'mid',   standards: ['8.2.4.3', '8.3.6.9'] },
  { id: 'what-is-a-function',          course: 'grade8', skill: 'intro', standards: ['8.3.7.3', '8.3.7.4', '9.3.7.10'] },
  { id: 'scatter-plots-and-lines-of-fit', course: 'grade8', skill: 'mid', standards: ['8.1.1.2', '8.1.1.3', '8.1.1.4', '8.1.1.6'] },
  { id: 'square-roots-and-irrational-numbers', course: 'grade8', skill: 'mid', standards: ['8.3.5.1', '8.3.5.2', '8.3.6.4'] },
  { id: 'exponents-and-scientific-notation', course: 'grade8', skill: 'mid', standards: ['8.3.5.3', '8.3.5.4', '8.3.5.5'] },
  { id: 'forms-of-a-linear-equation', course: 'grade8', skill: 'mid', standards: ['8.3.6.5', '8.3.6.6', '8.3.7.1', '8.3.7.6'] },
  { id: 'parallel-and-perpendicular-lines', course: 'grade8', skill: 'mid', standards: ['8.2.4.2'] },
  { id: 'distance-and-the-pythagorean-theorem', course: 'grade8', skill: 'mid', standards: ['8.2.3.2', '8.2.3.3'] },
  { id: 'solving-equations-with-a-balance', course: 'grade8', skill: 'mid', standards: ['8.3.6.1', '8.3.6.3', '9.3.5.7'] },

  /* Algebra 1 */
  { id: 'exponential-growth',          course: 'algebra1', skill: 'mid', standards: ['8.3.5.6', '8.3.7.7', '8.3.7.8', '8.3.7.9', '9.3.7.1'] },
  { id: 'functions-as-transformations', course: 'algebra1', skill: 'mid', standards: ['9.3.7.3'] },
  { id: 'quadratics-and-the-parabola', course: 'algebra1', skill: 'mid', standards: ['9.3.6.2', '9.3.6.3', '9.3.6.5', '9.3.7.3'] },

  /* Geometry */
  { id: 'similarity-and-scaling',      course: 'geometry', skill: 'mid', standards: ['7.2.4.2', '7.2.4.3', '9.2.3.9'] },
  { id: 'inscribed-angles',            course: 'geometry', skill: 'mid', standards: ['9.2.4.8'] },

  /* Precalculus & Trigonometry. Radians and periodic waves go beyond the 9-11 benchmarks; 9.2.3.8 (acute-angle
     trigonometric ratios) is the nearest one, and the lesson extends it rather than teaching it. */
  { id: 'the-unit-circle-and-trig-waves', course: 'precalc', skill: 'adv', standards: ['9.2.3.8'] },

  /* Statistics & Probability */
  { id: 'mean-median-and-spread',      course: 'stats', skill: 'mid', standards: ['6.1.1.3', '7.1.1.4', '9.1.1.9', '9.1.1.13'] },
  { id: 'probability-with-repeated-trials', course: 'stats', skill: 'mid', standards: ['6.1.2.3', '7.1.2.2', '7.1.2.6', '9.1.2.3', '9.1.2.4'] },
  { id: 'pascals-triangle-and-the-galton-board', course: 'stats', skill: 'adv', standards: ['7.1.2.3', '9.1.2.1', '9.1.2.4', '9.1.2.6'] },

  /* Undergraduate and graduate (on hold): course and skill only; the 2022 K-12 standards do not apply */
  { id: 'linear-transformations', course: 'linear-algebra',   skill: 'mid', standards: [] },
  { id: 'conformal-maps',         course: 'complex-analysis', skill: 'adv', standards: [] }
];
