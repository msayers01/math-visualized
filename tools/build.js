#!/usr/bin/env node
/* Builds the single-file site: src/template.html + src/** -> index.html
   Usage: node tools/build.js [--check]   (--check fails if index.html is stale) */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '..'), src = path.join(root, 'src');
const man = JSON.parse(fs.readFileSync(path.join(src, 'manifest.json'), 'utf8'));
const read = f => {
  const p = path.join(src, f);
  if (!fs.existsSync(p)) throw new Error('manifest lists missing file: ' + f);
  return fs.readFileSync(p, 'utf8').replace(/\s+$/, '') + '\n';
};
/* every lesson file under src/lessons must be in the manifest (order = pager order) */
const onDisk = [];
(function walk(d) {
  for (const n of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, n.name);
    if (n.isDirectory()) walk(p); else if (n.name.endsWith('.js')) onDisk.push(path.relative(src, p).split(path.sep).join('/'));
  }
})(path.join(src, 'lessons'));
const missing = onDisk.filter(f => !man.lessons.includes(f));
if (missing.length) throw new Error('lesson files not in manifest.json: ' + missing.join(', '));

/* curriculum data files must all be listed too (they load before the engine) */
const curOnDisk = fs.readdirSync(path.join(src, 'curriculum')).filter(n => n.endsWith('.js')).map(n => 'curriculum/' + n);
const curMissing = curOnDisk.filter(f => !man.curriculum.includes(f));
if (curMissing.length) throw new Error('curriculum files not in manifest.json: ' + curMissing.join(', '));

/* Curriculum checks: every lesson is aligned, all references are real, and the computed display order
   never puts a lesson before one it builds on (or after one it leads to). Runs the same ordering code
   the page uses. `node tools/build.js --order` prints the resulting sequence. */
function checkCurriculum() {
  const ctx = vm.createContext({});
  vm.runInContext([...man.curriculum, 'engine/curriculum.js'].map(read).join('\n') +
    '\n;this.C = { GRADES, COURSES, SKILLS, STRANDS, ANCHORS, STANDARDS, ALIGN, COURSE, SKILL, orderLessons, curriculumMeta, hasStandard };', ctx);
  const C = ctx.C, bad = [];
  const lessons = man.lessons.map((f, pos) => {
    const s = fs.readFileSync(path.join(src, f), 'utf8'), m = s.match(/\bid:\s*'([^']+)',\s*level:\s*'(\w+)'/), lk = s.match(/links:\s*(\{[^}]*\})/);
    if (!m) throw new Error('cannot find id and level in ' + f);
    const links = lk ? vm.runInNewContext('(' + lk[1] + ')') : {};
    return { id: m[1], level: m[2], prereq: links.prereq || [], next: links.next || [], pos };
  });
  const ids = new Set(lessons.map(l => l.id)), seen = new Set();
  for (const a of C.ALIGN) {
    if (seen.has(a.id)) bad.push('duplicate curriculum entry: ' + a.id); seen.add(a.id);
    if (!ids.has(a.id)) bad.push('curriculum entry for a lesson that does not exist: ' + a.id);
    if (!C.COURSE[a.course]) bad.push(a.id + ': unknown course "' + a.course + '"');
    if (!C.SKILL[a.skill]) bad.push(a.id + ': unknown skill "' + a.skill + '"');
    if (new Set(a.standards).size !== a.standards.length) bad.push(a.id + ': repeated benchmark code');
    for (const c of a.standards) if (!C.hasStandard(c)) bad.push(a.id + ': unknown benchmark code ' + c);
  }
  for (const l of lessons) {
    const a = C.ALIGN.find(x => x.id === l.id);
    if (!a) { bad.push('lesson has no curriculum entry (add one to src/curriculum/curriculum.js): ' + l.id); continue; }
    if (C.COURSE[a.course] && C.COURSE[a.course].level !== l.level) bad.push(l.id + ': course "' + a.course + '" belongs to level ' + C.COURSE[a.course].level + ', lesson is ' + l.level);
  }
  if (bad.length) throw new Error('curriculum problems:\n  ' + bad.join('\n  '));
  const items = lessons.map(l => ({ ...l, ...C.curriculumMeta(C.ALIGN.find(x => x.id === l.id)) }));
  const order = C.orderLessons(items), rank = Object.fromEntries(order.map((it, i) => [it.id, i]));
  for (const l of lessons) {
    for (const p of l.prereq) if (p in rank && rank[p] > rank[l.id]) bad.push(`${l.id} builds on ${p}, which is ordered after it (move the link to "related" or change the course placement)`);
    for (const n of l.next) if (n in rank && rank[n] < rank[l.id]) bad.push(`${l.id} leads to ${n}, which is ordered before it (move the link to "related" or change the course placement)`);
  }
  if (bad.length) throw new Error('curriculum order problems:\n  ' + bad.join('\n  '));
  if (process.argv.includes('--order')) {
    let last = '';
    for (const it of order) {
      if (it.course !== last) { console.log('\n' + C.COURSE[it.course].name); last = it.course; }
      console.log(`  ${C.SKILL[it.skill].name.padEnd(13)} ${it.id.padEnd(40)} ${it.standards.join(' ')}`);
    }
    console.log('');
  }
  const tagged = new Set(C.ALIGN.flatMap(a => a.standards));
  return `${lessons.length} lessons aligned, ${tagged.size} of ${Object.keys(C.STANDARDS).length} benchmarks tagged`;
}
/* TeX lives inside HTML strings, where "<" followed by a letter starts a tag and swallows the text after it
   (for example \(0<b<1\)). Write &lt; instead. */
function checkTex() {
  const bad = [];
  for (const f of man.lessons) {
    const s = fs.readFileSync(path.join(src, f), 'utf8');
    for (const m of s.matchAll(/\\\((.*?)\\\)|\\\[(.*?)\\\]/gs)) {
      const t = m[1] ?? m[2], x = t.search(/<(?=[A-Za-z\/!])/);
      if (x >= 0) bad.push(`${f}: TeX contains "<" before a letter, write &lt; instead: ...${t.slice(Math.max(0, x - 20), x + 20).replace(/\s+/g, ' ')}...`);
    }
  }
  if (bad.length) throw new Error('TeX problems:\n  ' + bad.join('\n  '));
}
checkTex();
const curSummary = checkCurriculum();

const scripts = [...man.curriculum, ...man.engine, ...man.lessons, ...man.app].map(read).join('\n');
const out = read('template.html')
  .replace('/*@STYLES*/', () => man.styles.map(read).join('').replace(/\n$/, ''))
  .replace('/*@SCRIPTS*/', () => scripts.replace(/\n$/, ''));
const dest = path.join(root, 'index.html');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(dest) || fs.readFileSync(dest, 'utf8') !== out) { console.error('index.html is out of date; run node tools/build.js'); process.exit(1); }
  console.log('index.html is up to date'); process.exit(0);
}
fs.writeFileSync(dest, out);
console.log(`built index.html (${(out.length / 1024).toFixed(1)} KB, ${man.lessons.length} lessons; ${curSummary})`);
