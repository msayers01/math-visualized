/* =====================================================================
   CURRICULUM HELPERS: derived tags, display order, filtering
   Pure functions over the data in src/curriculum/ (no DOM), so tools/build.js can run the
   same ordering and checks that the page does.
   ===================================================================== */
const byId = list => Object.assign(Object.create(null), Object.fromEntries(list.map(x => [x.id, x])));
const GRADE = byId(GRADES), COURSE = byId(COURSES), SKILL = byId(SKILLS), STRAND = byId(STRANDS), ALIGN_BY_ID = byId(ALIGN);
const LEVEL_ORDER = ['school', 'ugrad', 'grad'];

/* benchmark codes: '8.2.4.1' -> parts, comparison key, grade band, strand */
const codeKey = code => code.split('.').map(Number);
const cmpKey = (a, b) => { for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) return (a[i] ?? -1) - (b[i] ?? -1); return 0; };
const cmpCode = (a, b) => cmpKey(codeKey(a), codeKey(b));
const bandOf = code => { const g = +code.split('.')[0]; return g >= 9 ? '9-11' : String(g); };
const strandOf = code => STRANDS[+code.split('.')[1] - 1];
const anchorOf = code => ANCHORS[+code.split('.')[2]];
const hasStandard = code => Object.hasOwn(STANDARDS, code);

/* Everything a lesson inherits from its ALIGN entry: grades are the course's plus the band of each tag */
function curriculumMeta(a) {
  const standards = [...a.standards].sort(cmpCode), grades = new Set(COURSE[a.course].grades);
  standards.forEach(c => grades.add(bandOf(c)));
  return {
    course: a.course, skill: a.skill, standards,
    strands: STRANDS.filter(s => standards.some(c => strandOf(c).id === s.id)).map(s => s.id),
    grades: GRADES.filter(g => grades.has(g.id)).map(g => g.id)
  };
}

/* Display order of lessons. items: [{ id, level, course, skill, standards (sorted), prereq: [ids], pos }].
   Sort by level, course sequence, skill level, first benchmark in document order, then registration
   position; then a stable pass so a lesson never precedes a same-course lesson it builds on. */
function orderLessons(items) {
  const lv = l => LEVEL_ORDER.indexOf(l), ci = c => COURSES.findIndex(x => x.id === c), si = s => SKILLS.findIndex(x => x.id === s);
  const first = it => it.standards.length ? codeKey(it.standards[0]) : [99];
  const rest = [...items].sort((a, b) => lv(a.level) - lv(b.level) || ci(a.course) - ci(b.course) || si(a.skill) - si(b.skill) ||
    cmpKey(first(a), first(b)) || a.pos - b.pos);
  const by = Object.fromEntries(items.map(x => [x.id, x])), done = new Set(), out = [];
  while (rest.length) {
    let i = rest.findIndex(it => it.prereq.every(p => !by[p] || by[p].course !== it.course || done.has(p)));
    if (i < 0) i = 0;                         /* a prerequisite cycle; the build reports it */
    const it = rest.splice(i, 1)[0]; done.add(it.id); out.push(it);
  }
  return out;
}

/* Attach course, skill, standards, strands and grades to every registered lesson and put VIZ in display order */
function applyCurriculum() {
  const items = VIZ.map((v, pos) => {
    let a = ALIGN_BY_ID[v.id];
    if (!a) { console.warn('No curriculum entry for lesson: ' + v.id); a = { course: COURSES.find(c => c.level === v.level).id, skill: 'mid', standards: [] }; }
    Object.assign(v, curriculumMeta(a));
    return { id: v.id, level: v.level, course: v.course, skill: v.skill, standards: v.standards, prereq: (v.links && v.links.prereq) || [], pos };
  });
  const rank = new Map(orderLessons(items).map((it, i) => [it.id, i]));
  VIZ.sort((a, b) => rank.get(a.id) - rank.get(b.id));
}

/* ---------- filtering ----------
   F = { grade: [], skill: [], strand: [], course: '', std: '' }. Several choices within grade, skill or
   strand match any of them; different facets must all match. */
const FACETS = ['grade', 'skill', 'strand', 'course', 'std'];
const emptyFilter = () => ({ grade: [], skill: [], strand: [], course: '', std: '' });
const filterActive = F => !!(F.grade.length || F.skill.length || F.strand.length || F.course || F.std);
const filterCount = F => F.grade.length + F.skill.length + F.strand.length + (F.course ? 1 : 0) + (F.std ? 1 : 0);
function optionMatch(v, facet, val) {
  return facet === 'grade' ? v.grades.includes(val) : facet === 'skill' ? v.skill === val : facet === 'strand' ? v.strands.includes(val)
       : facet === 'course' ? v.course === val : v.standards.includes(val);
}
/* does lesson v pass F? `skip` names a facet to ignore (used to count a facet's options) */
function matches(v, F, skip) {
  return FACETS.every(f => f === skip || (Array.isArray(F[f]) ? !F[f].length || F[f].some(x => optionMatch(v, f, x)) : !F[f] || optionMatch(v, f, F[f])));
}
/* how many of `items` pass F if `facet` were set to just `val` */
const facetCount = (items, F, facet, val) => items.filter(v => matches(v, F, facet) && optionMatch(v, facet, val)).length;

/* shareable state: #find~grade_8~skill_intro~strand_pr~course_grade8~std_8.2.4.1 (see share.js); the older
   #/?grade=8,9-11&skill=intro&strand=pr&course=grade8&std=8.2.4.1 form is still read */
function filterFromHash(hash) {
  if (hash.startsWith('#find')) {            /* plain token form: #find~grade_8~grade_9-11~course_algebra1~std_8.2.4.1 */
    const F = emptyFilter();
    for (const seg of hash.split('~').slice(1)) {
      const i = seg.indexOf('_'), k = seg.slice(0, i), v = seg.slice(i + 1);
      if (i < 0) continue;
      if (k === 'grade' && GRADE[v] && !F.grade.includes(v)) F.grade.push(v);
      else if (k === 'skill' && SKILL[v] && !F.skill.includes(v)) F.skill.push(v);
      else if (k === 'strand' && STRAND[v] && !F.strand.includes(v)) F.strand.push(v);
      else if (k === 'course' && COURSE[v]) F.course = v;
      else if (k === 'std' && hasStandard(v)) F.std = v;
    }
    return F;
  }
  const p = new URLSearchParams(hash.split('?')[1] || ''), list = k => (p.get(k) || '').split(',').filter(Boolean);
  const course = p.get('course'), std = p.get('std');
  return {
    grade: list('grade').filter(x => GRADE[x]), skill: list('skill').filter(x => SKILL[x]), strand: list('strand').filter(x => STRAND[x]),
    course: course && COURSE[course] ? course : '', std: std && hasStandard(std) ? std : ''
  };
}

/* ---------- labels ---------- */
const gradeNum = id => id === '9-11' ? '9\u201311' : id;
const gradesLabel = ids => ids.every(id => /^\d/.test(id)) ? (ids.length > 1 || ids[0] === '9-11' ? 'Grades ' : 'Grade ') + ids.map(gradeNum).join(', ') : ids.map(id => GRADE[id].name).join(', ');
const shortText = (t, n = 90) => t.length <= n ? t : t.slice(0, n).replace(/\s+\S*$/, '') + '…';
