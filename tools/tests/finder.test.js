const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node-tools/node_modules/playwright'); } })();
const path = require('path'), os = require('os'), { execSync } = require('child_process');
const fs = require('fs'), vm = require('vm');
const root = path.resolve(__dirname, '../..'), shots = process.env.SHOTS || path.join(os.tmpdir(), 'continuum-shots');
fs.mkdirSync(shots, { recursive: true });
/* CONTINUUM_BUILD=split runs the same checks against dist/ (built with: node tools/build.js --split) */
const URL = 'file://' + root + (process.env.CONTINUUM_BUILD === 'split' ? '/dist/index.html' : '/index.html');

/* Run:  node tools/tests/finder.test.js   (needs Playwright and a built index.html; set SHOTS=dir to keep screenshots) */
/* ---- independent model of the curriculum data (does not use engine/curriculum.js) ---- */
const ctx = vm.createContext({});
vm.runInContext(['src/curriculum/standards-mn2022.js', 'src/curriculum/curriculum.js'].map(f => fs.readFileSync(root + '/' + f, 'utf8')).join('\n') +
  ';this.D={ALIGN,COURSES,GRADES,SKILLS,STRANDS,STANDARDS}', ctx);
const D = ctx.D, STR = { 1: 'dp', 2: 'sr', 3: 'pr' };
const model = D.ALIGN.map(a => {
  const course = D.COURSES.find(c => c.id === a.course), g = new Set(course.grades);
  a.standards.forEach(c => g.add(+c[0] >= 9 ? '9-11' : c[0]));
  return { id: a.id, course: a.course, skill: a.skill, enrich: !!a.enrichment, std: a.standards, grades: [...g], strands: [...new Set(a.standards.map(c => STR[c.split('.')[1]]))] };
});
const expected = F => model.filter(m =>
  (!F.grade?.length || m.grades.some(g => F.grade.includes(g))) && (!F.skill?.length || F.skill.includes(m.skill)) &&
  (!F.strand?.length || m.strands.some(s => F.strand.includes(s))) && (!F.kind?.length || m.enrich) && (!F.course || m.course === F.course) && (!F.std || m.std.includes(F.std))).map(m => m.id).sort();
const toHash = F => { const q = []; for (const k of ['grade', 'skill', 'strand', 'kind']) if (F[k]?.length) q.push(k + '=' + F[k].join(',')); if (F.course) q.push('course=' + F.course); if (F.std) q.push('std=' + F.std); return q.length ? '#/?' + q.join('&') : '#/'; };

const TOTAL = model.length, fails = [], ok = [];
const check = (name, cond, extra) => { (cond ? ok : fails).push(name + (cond ? '' : '   -> ' + (extra ?? ''))); };
/* rows the filter shows; a row inside a collapsed course still counts (collapsing is tested separately) */
const visibleIds = page => page.evaluate(() => [...document.querySelectorAll('a.topic')].filter(a => !a.closest('li').hidden && !a.closest('.course').hidden && !a.closest('.level').hidden).map(a => a.getAttribute('href').slice(6)));

(async () => {
  const browser = await chromium.launch();
  const mk = async (opts = {}) => {
    const c = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...opts }), page = await c.newPage(), errs = [];
    await page.route('**/*', r => { const u = r.request().url(); u.startsWith('file:') ? r.continue() : r.abort(); });
    page.on('pageerror', e => errs.push('pageerror: ' + e.message + ' @ ' + String(e.stack || '').split('\n').slice(1, 3).join(' <- ').replace(/file:\/\/\S*\//g, '')));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) errs.push('console: ' + m.text()); });
    return { page, errs, c };
  };

  /* ===== desktop ===== */
  const { page, errs, c } = await mk();
  await page.goto(URL); await page.waitForSelector('.course');

  /* 1. structure and order */
  const heads = await page.evaluate(() => [...document.querySelectorAll('.level')].map(l => ({ level: l.id, courses: [...l.querySelectorAll('.course')].map(c => ({
    name: (c.querySelector('.course-head .cname') || c.querySelector('.course-head')).textContent, ids: [...c.querySelectorAll('a.topic')].map(a => a.getAttribute('href').slice(6)) })) })));
  const school = heads.find(h => h.level === 'level-school');
  /* the build's own computed order, to compare with what the page renders */
  const want = {}; let cur = null;
  for (const line of execSync('node tools/build.js --order', { cwd: root }).toString().split('\n')) {
    if (/^\S/.test(line) && !line.startsWith('built')) { cur = line.trim(); want[cur] = []; }
    else { const mm = line.match(/^\s+\S+\s+(\S+)/); if (mm && cur) want[cur].push(mm[1]); }
  }
  const schoolCourses = D.COURSES.filter(c => c.level === 'school' && want[c.name]).map(c => c.name);
  check('school courses in sequence', JSON.stringify(school.courses.map(c => c.name)) === JSON.stringify(schoolCourses), JSON.stringify(school.courses.map(c => c.name)));
  for (const cr of school.courses) check('order within ' + cr.name, JSON.stringify(cr.ids) === JSON.stringify(want[cr.name]), JSON.stringify(cr.ids));
  const ug = heads.find(h => h.level === 'level-ugrad'), gr = heads.find(h => h.level === 'level-grad');
  /* courses that have lessons, in course order, then the planned list while anything is still planned */
  const courseNames = lvl => D.COURSES.filter(c => c.level === lvl && D.ALIGN.some(a => a.course === c.id)).map(c => c.name).concat(['In development']).join('|');
  check('ugrad courses', ug.courses.map(c => c.name).join('|') === courseNames('ugrad'), ug.courses.map(c => c.name).join('|'));
  check('grad courses', gr.courses.map(c => c.name).join('|') === courseNames('grad'), gr.courses.map(c => c.name).join('|'));
  const allIds = (await visibleIds(page)).sort();
  check('every lesson listed once', allIds.length === TOTAL && new Set(allIds).size === TOTAL, allIds.length);
  check('no errors on load', errs.length === 0, errs.join(' | '));
  check('every lesson row has skill + grades + (standards for school)', await page.evaluate(() => [...document.querySelectorAll('a.topic')].every(a => a.querySelector('.skill') && a.querySelector('.tag'))));
  check('finder summary default', (await page.textContent('.finder-sum')) === `${TOTAL} lessons`, await page.textContent('.finder-sum'));
  await page.screenshot({ path: shots + '/home-desktop-light.png' });

  /* 2. filter states via URL, compared with the independent model */
  const states = [
    { grade: ['8'] }, { grade: ['6'] }, { grade: ['7'] }, { grade: ['9-11'] }, { grade: ['ug'] }, { grade: ['gr'] }, { grade: ['6', '7'] },
    { skill: ['intro'] }, { skill: ['mid'] }, { skill: ['adv'] }, { skill: ['intro', 'adv'] },
    { strand: ['pr'] }, { strand: ['sr'] }, { strand: ['dp'] }, { strand: ['sr', 'dp'] },
    { course: 'algebra1' }, { course: 'stats' }, { course: 'linear-algebra' }, { course: 'grade6' },
    { std: '9.2.4.8' }, { std: '8.2.4.1' }, { std: '7.1.2.2' }, { std: '9.1.1.9' },
    { grade: ['8'], skill: ['intro'] }, { grade: ['9-11'], strand: ['dp'] }, { grade: ['7'], strand: ['sr'], skill: ['mid'] },
    { kind: ['enrich'] }, { kind: ['enrich'], grade: ['9-11'] }, { kind: ['enrich'], skill: ['adv'] },
    { course: 'geometry', strand: ['sr'] }, { grade: ['9-11'], skill: ['intro'] }, { course: 'stats', std: '9.1.2.6' }, { course: 'stats', std: '9.2.4.8' },
    { grade: ['6', '8'], skill: ['mid'], strand: ['dp', 'pr'], course: 'stats' }
  ];
  for (const F of states) {
    await page.goto('about:blank'); await page.goto(URL + toHash(F)); await page.waitForSelector('.finder');
    const got = (await visibleIds(page)).sort(), exp = expected(F);
    check('filter ' + toHash(F), JSON.stringify(got) === JSON.stringify(exp), `got ${got} exp ${exp}`);
    const emptyShown = await page.evaluate(() => !document.querySelector('.finder-empty').hidden);
    check('empty state ' + toHash(F), emptyShown === (exp.length === 0));
    const sum = await page.textContent('.finder-sum');
    check('summary ' + toHash(F), sum === `${exp.length} of ${TOTAL} lessons match`, sum);
    const hiddenSections = await page.evaluate(() => [...document.querySelectorAll('.level')].filter(l => l.hidden).map(l => l.id));
    const expLevels = ['school', 'ugrad', 'grad'].filter(l => !exp.some(id => D.COURSES.find(c => c.id === D.ALIGN.find(x => x.id === id).course).level === l));
    check('hidden levels ' + toHash(F), JSON.stringify(hiddenSections.sort()) === JSON.stringify(expLevels.map(l => 'level-' + l).sort()), hiddenSections);
    check('planned hidden when filtering ' + toHash(F), await page.evaluate(() => [...document.querySelectorAll('.course[aria-label="In development"]')].every(e => e.hidden)));
  }

  /* 3. real clicking: toggle chips, disabled states, selects, clear, URL sync */
  await page.goto('about:blank'); await page.goto(URL + '#/'); await page.waitForSelector('.finder');
  const chip = (legend, name) => page.locator('fieldset.facet', { hasText: legend }).getByRole('button', { name });
  await chip('Grade level', /^Grade 8/).click();
  check('click grade 8 -> hash', (await page.evaluate(() => location.hash)) === '#find~grade_8', await page.evaluate(() => location.hash));
  check('click grade 8 -> rows', JSON.stringify((await visibleIds(page)).sort()) === JSON.stringify(expected({ grade: ['8'] })));
  check('pressed state', (await chip('Grade level', /^Grade 8/).getAttribute('aria-pressed')) === 'true');
  await chip('Skill level', /^Introductory/).click();
  check('grade 8 + intro -> hash', (await page.evaluate(() => location.hash)) === '#find~grade_8~skill_intro');
  check('grade 8 + intro -> rows', JSON.stringify((await visibleIds(page)).sort()) === JSON.stringify(expected({ grade: ['8'], skill: ['intro'] })));
  check('Advanced disabled (no grade-8 advanced lesson)', await chip('Skill level', /^Advanced/).isDisabled());
  /* with Introductory chosen, a grade chip is disabled exactly when no introductory lesson carries that grade */
  for (const [lbl, id] of [['Grades 9', '9-11'], ['Grade 6', '6']]) {
    const n = model.filter(m => m.skill === 'intro' && m.grades.includes(id)).length;
    check(`${lbl} chip disabled iff no introductory lesson has it (model: ${n})`, (await chip('Grade level', new RegExp('^' + lbl)).isDisabled()) === (n === 0));
  }
  check('Grade 8 chip still enabled and pressed', (await chip('Grade level', /^Grade 8/).isEnabled()) && (await chip('Grade level', /^Grade 8/).getAttribute('aria-pressed')) === 'true');
  const cnt = await chip('Grade level', /^Grade 7/).locator('.n').textContent();
  check('Grade 7 chip is disabled exactly when its count (with the other filters applied) is 0', (await chip('Grade level', /^Grade 7/).isDisabled()) === (cnt === '0'), cnt);
  await page.selectOption('#f-course', 'grade8');
  check('course select narrows', JSON.stringify((await visibleIds(page)).sort()) === JSON.stringify(expected({ grade: ['8'], skill: ['intro'], course: 'grade8' })));
  check('std options disabled when impossible', await page.evaluate(() => [...document.querySelectorAll('#f-std option')].filter(o => o.value === '9.2.4.8').every(o => o.disabled)));
  await page.locator('.finder-clear').click();
  check('clear -> all rows', (await visibleIds(page)).length === TOTAL);
  check('clear -> hash reset', (await page.evaluate(() => location.hash)) === '#/', await page.evaluate(() => location.hash));
  check('clear button hidden again', await page.locator('.finder-clear').isHidden());
  await page.selectOption('#f-std', '9.2.4.8');
  check('std select -> exactly the lessons tagged 9.2.4.8', JSON.stringify((await visibleIds(page)).sort()) === JSON.stringify(model.filter(m => m.std.includes('9.2.4.8')).map(m => m.id).sort()) && (await visibleIds(page)).includes('inscribed-angles'), JSON.stringify(await visibleIds(page)));
  await page.locator('.finder-clear').click();
  await chip('Standard strand', /^Spatial/).click(); await chip('Standard strand', /^Data/).click();
  check('two strands OR together', JSON.stringify((await visibleIds(page)).sort()) === JSON.stringify(expected({ strand: ['sr', 'dp'] })));
  await page.locator('.finder-clear').click();

  /* chip counts at rest */
  const counts = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.chip')].map(b => [b.querySelector('.lbl').textContent, b.querySelector('.n').textContent])));
  const expCounts = { 'Grade 6': 2, 'Grade 7': 3, 'Grade 8': 4, 'Grades 9–11': 10, 'Undergraduate': 1, 'Graduate': 1 };
  for (const [k, v] of Object.entries(expCounts)) check('count ' + k, counts[k] === String(expected({ grade: [{ 'Grade 6': '6', 'Grade 7': '7', 'Grade 8': '8', 'Grades 9–11': '9-11', Undergraduate: 'ug', Graduate: 'gr' }[k]] }).length), `${counts[k]} vs model ${expected({ grade: [{ 'Grade 6': '6', 'Grade 7': '7', 'Grade 8': '8', 'Grades 9–11': '9-11', Undergraduate: 'ug', Graduate: 'gr' }[k]] }).length}`);

  /* 4. lesson page: meta, alignment, links back, pager */
  await page.goto('about:blank'); await page.goto(URL + '#/viz/slope-and-linear-functions'); await page.waitForSelector('.viz-meta');
  check('lesson meta course link', (await page.getAttribute('.viz-meta a.course', 'href')) === '#find~course_grade8');
  const chipsOnPage = await page.$$eval('.viz-meta .std', els => els.map(e => e.textContent));
  check('lesson header chips', JSON.stringify(chipsOnPage) === JSON.stringify(['8.2.4.1', '8.3.7.5', '8.3.7.6']), JSON.stringify(chipsOnPage));
  const items = await page.$$eval('.align-item', els => els.map(e => ({ code: e.querySelector('.std').textContent, text: e.querySelector('.bench').textContent, anc: e.querySelector('.anc').textContent, strand: e.dataset.strand })));
  check('alignment items', items.length === 3 && items[0].text.startsWith('Use similar triangles') && items[0].anc === 'Spatial Reasoning · Geometry' && items[2].anc === 'Patterns and Relationships · Patterns and Relationships', JSON.stringify(items));
  const seq = schoolCourses.flatMap(n => want[n]), si = seq.indexOf('slope-and-linear-functions');
  check('pager prev/next for slope', (await page.getAttribute('.pg.prev', 'href')) === '#/viz/' + seq[si - 1] && (await page.getAttribute('.pg.next', 'href')) === '#/viz/' + seq[si + 1], await page.getAttribute('.pg.next', 'href'));
  await page.screenshot({ path: shots + '/lesson-desktop-light.png', fullPage: true });
  await page.click('.align-item a.std >> nth=1');
  await page.waitForSelector('.finder');
  check('chip link -> filtered list', (await page.evaluate(() => location.hash)) === '#find~std_8.3.7.5' && JSON.stringify(await visibleIds(page)) === '["slope-and-linear-functions"]', await page.evaluate(() => location.hash));
  /* pager across the course boundary */
  await page.goto('about:blank'); await page.goto(URL + '#/viz/' + seq[0]); await page.waitForSelector('.pager');
  check('first school lesson: no previous', (await page.locator('.pg.prev').count()) === 0);
  check('first school lesson: next follows the computed order', (await page.getAttribute('.pg.next', 'href')) === '#/viz/' + seq[1], await page.getAttribute('.pg.next', 'href'));
  await page.goto('about:blank'); await page.goto(URL + '#/viz/linear-transformations'); await page.waitForSelector('.viz-meta');
  check('ugrad lesson: course tag, no alignment section', (await page.textContent('.viz-meta .course')) === 'Linear Algebra' && (await page.locator('.align').count()) === 0);

  /* 5. every lesson page opens without errors */
  const ids = JSON.parse(JSON.stringify(allIds));
  for (const id of ids) {
    await page.goto('about:blank'); await page.goto(URL + '#/viz/' + id); await page.waitForSelector('.stage canvas', { timeout: 8000 }).catch(() => {});
    const w = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check('lesson opens ' + id, w <= 0 && (await page.locator('h1').count()) === 1, 'overflow ' + w);
    const expStd = model.find(m => m.id === id).std.length;
    check('alignment count ' + id, (await page.locator('.align-item').count()) === expStd);
  }
  check('no page errors during lesson sweep', errs.length === 0, errs.join(' | '));

  /* dark theme screenshots with filters on */
  await page.goto('about:blank'); await page.goto(URL + '#/?strand=pr&grade=8,9-11'); await page.waitForSelector('.finder');
  await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; dispatchEvent(new Event('themechange')); });
  await page.waitForTimeout(300);
  await page.locator('#finder').scrollIntoViewIfNeeded(); await page.screenshot({ path: shots + '/home-desktop-dark-filtered.png' });
  await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
  await page.goto('about:blank'); await page.goto(URL + '#/viz/mean-median-and-spread'); await page.waitForSelector('.align');
  await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; dispatchEvent(new Event('themechange')); });
  await page.locator('.align').scrollIntoViewIfNeeded(); await page.screenshot({ path: shots + '/lesson-align-dark.png' });
  await c.close();

  /* ===== hero, collapsible courses, on-demand lessons ===== */
  const SPLIT = process.env.CONTINUUM_BUILD === 'split';
  const lz = await mk(), lp = lz.page, fetched = [];
  lp.on('request', r => { const mm = r.url().match(/\/lessons\/([^/]+)\.js$/); if (mm) fetched.push(mm[1]); });
  await lp.goto(URL); await lp.waitForSelector('.course-toggle');
  const heroId = ((await lp.getAttribute('.hero-cta .btn.primary', 'href')) || '').replace('#/viz/', ''), heroAlign = D.ALIGN.find(a => a.id === heroId);
  check('hero button starts a school lesson', !!heroAlign && D.COURSES.find(c => c.id === heroAlign.course).level === 'school', heroId);
  const groupsState = () => lp.evaluate(() => [...document.querySelectorAll('#level-school .course')].filter(c => c.querySelector('.course-toggle')).map(c => ({ name: c.querySelector('.cname').textContent,
    open: c.querySelector('.course-toggle').getAttribute('aria-expanded') === 'true', list: !c.querySelector('.topics').hidden, hidden: c.hidden })));
  let gs = await groupsState();
  check('courses start collapsed', gs.length === schoolCourses.length && gs.every(g => !g.open && !g.list), JSON.stringify(gs));
  check('collapsed courses preview their lesson titles', await lp.evaluate(() => [...document.querySelectorAll('#level-school .course-preview')].every(pv => !pv.hidden && pv.textContent.length > 0)));
  if (SPLIT) check('home page fetches no lesson files while courses are collapsed', fetched.length === 0, fetched.join(','));
  const g6 = want['Grade 6 Mathematics'];
  await lp.locator('.course-toggle', { hasText: 'Grade 6 Mathematics' }).click();
  await lp.waitForFunction(n => document.querySelectorAll('.course.open .thumb canvas').length === n, g6.length, { timeout: 8000 }).catch(() => {});
  check('opening a course draws one thumbnail per lesson', (await lp.locator('.course.open .thumb canvas').count()) === g6.length, await lp.locator('.course.open .thumb canvas').count());
  if (SPLIT) check('opening Grade 6 fetched exactly its lessons', JSON.stringify([...fetched].sort()) === JSON.stringify([...g6].sort()), fetched.join(','));
  check('only the opened course is open', (await groupsState()).filter(g => g.open).map(g => g.name).join('|') === 'Grade 6 Mathematics');
  await lp.locator('.course-all').click();
  check('Expand all opens every course', (await groupsState()).every(g => g.open) && (await lp.textContent('.course-all')) === 'Collapse all courses');
  await lp.locator('.course-all').click();
  check('Collapse all closes every course', (await groupsState()).every(g => !g.open) && (await lp.textContent('.course-all')) === 'Expand all courses');
  await lp.locator('.course-toggle', { hasText: 'Grade 7 Mathematics' }).click();
  await lp.locator('fieldset.facet', { hasText: 'Grade level' }).getByRole('button', { name: /^Grade 8/ }).click();
  gs = (await groupsState()).filter(g => !g.hidden);
  check('a filter opens every course that has matches', gs.length > 0 && gs.every(g => g.open && g.list), JSON.stringify(gs));
  await lp.locator('.finder-clear').click();
  check('clearing the filter restores the courses the visitor opened', (await groupsState()).filter(g => g.open).map(g => g.name).join('|') === 'Grade 7 Mathematics', JSON.stringify(await groupsState()));
  check('no errors while opening and closing courses', lz.errs.length === 0, lz.errs.join(' | '));
  await lz.c.close();

  const dl = await mk(), seen = [];
  dl.page.on('request', r => { const mm = r.url().match(/\/lessons\/([^/]+)\.js$/); if (mm) seen.push(mm[1]); });
  await dl.page.goto(URL + '#proportional-relationships.2'); await dl.page.waitForSelector('.stage canvas');
  check('a lesson link opens the lesson at its step', (await dl.page.textContent('h1')) === 'Proportional relationships' && (await dl.page.textContent('.steps-n')) === '2 / 4');
  if (SPLIT) check('a lesson link fetches only that lesson', seen.length === 1 && seen[0] === 'proportional-relationships', seen.join(','));
  await dl.page.waitForTimeout(500);
  check('without MathJax a lesson shows readable math, not raw TeX', !/\\\(|\\\[/.test(await dl.page.evaluate(() => document.querySelector('#app').innerText)));
  check('no errors opening a lesson link', dl.errs.length === 0, dl.errs.join(' | '));
  await dl.c.close();
  if (SPLIT) {
    const lf = await mk(); let blocked = true;
    await lf.page.route('**/lessons/ratios-and-equivalent-ratios.js', r => (blocked ? r.abort() : r.continue()));
    await lf.page.goto(URL + '#ratios-and-equivalent-ratios'); await lf.page.waitForSelector('.lesson-loading button');
    check('a lesson that cannot load says so and offers Try again', /Could not load/.test(await lf.page.textContent('.lesson-loading')));
    blocked = false; await lf.page.click('.lesson-loading button'); await lf.page.waitForSelector('.stage canvas');
    check('Try again loads the lesson', (await lf.page.textContent('h1')) === 'Ratios and equivalent ratios');
    await lf.c.close();
  }

  /* ===== free-text search ===== */
  {
    const sr = await mk(), sp = sr.page;
    await sp.addInitScript(() => { window.__copied = []; Object.defineProperty(navigator, 'clipboard', { value: { writeText: async t => { window.__copied.push(t); } }, configurable: true }); });
    await sp.goto(URL); await sp.waitForSelector('#f-q');
    const info = await sp.evaluate(() => VIZ.map(v => ({ id: v.id, title: v.title, blurb: v.blurb })));
    const words = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9.]+/g, ' ');
    /* independent model of the rule: every word starts a word of title, blurb, course name, benchmark codes or wording; a whole code must equal a code */
    const hay = id => { const a = D.ALIGN.find(x => x.id === id), i = info.find(x => x.id === id);
      return ' ' + words([i.title, i.blurb, D.COURSES.find(c => c.id === a.course).name, ...a.standards, ...a.standards.map(c => D.STANDARDS[c])].join(' ')).replace(/ +/g, ' ') + ' '; };
    const expectQ = (q, F = {}) => expected(F).filter(id => words(q).split(' ').map(t => t.replace(/^\.+|\.+$/g, '')).filter(Boolean)
      .every(t => hay(id).includes(' ' + t + (/^\d+\.\d+\.\d+\.\d+$/.test(t) ? ' ' : '')))).sort();
    const tok = q => '#find~q_' + words(q).trim().replace(/ +/g, '-');
    const sChip = (legend, name) => sp.locator('fieldset.facet', { hasText: legend }).getByRole('button', { name });
    const queries = [...D.COURSES.filter(c => D.ALIGN.some(a => a.course === c.id)).map(c => c.name),
      ...[...new Set(D.ALIGN.flatMap(a => a.standards))].sort().map(c => c),          /* every used benchmark code */
      'pythagorean theorem', 'Pythagorean', 'ratio', 'slope', 'circle', "Cramer's rule", 'inequal', 'sin', 'x', '8.2', 'zzzzqq', 'probability tree', 'grade 8 data'];
    check('search queries cover every used course and benchmark code', queries.length >= D.COURSES.length + 100, queries.length);
    let bad = 0, badEx = '';
    for (const q of queries) {
      await sp.goto('about:blank'); await sp.goto(URL + tok(q)); await sp.waitForSelector('#f-q');
      const got = (await visibleIds(sp)).sort(), exp = expectQ(q);
      if (JSON.stringify(got) !== JSON.stringify(exp)) { bad++; badEx = badEx || `${q}: got ${got.length} exp ${exp.length}`; }
      const sum = await sp.textContent('.finder-sum');
      if (sum !== (exp.length || words(q).trim() ? `${exp.length} of ${TOTAL} lessons match` : `${TOTAL} lessons`)) { bad++; badEx = badEx || `${q}: summary ${sum}`; }
    }
    check(`search via address: ${queries.length} queries return exactly the modelled lessons and summary`, bad === 0, `${bad} bad, e.g. ${badEx}`);
    /* every benchmark code finds at least the lessons tagged with it */
    check('each benchmark code as a query finds the lessons tagged with it (exact code match)', await (async () => {
      for (const c of [...new Set(D.ALIGN.flatMap(a => a.standards))]) { const exp = model.filter(m => m.std.includes(c)).map(m => m.id).sort(), got = expectQ(c); if (JSON.stringify(exp) !== JSON.stringify(got.filter(id => exp.includes(id))) || !exp.every(id => got.includes(id))) return false; }
      return true; })());

    /* the box: label, type, typing, count, URL */
    await sp.goto('about:blank'); await sp.goto(URL); await sp.waitForSelector('#f-q');
    check('search box is type=search with a visible label', (await sp.getAttribute('#f-q', 'type')) === 'search' && /Search lessons/.test(await sp.textContent('label[for="f-q"]')) && await sp.locator('label[for="f-q"]').isVisible());
    check('search is reachable by its label', (await sp.getByLabel('Search lessons').count()) === 1);
    await sp.locator('#f-q').click(); await sp.keyboard.type('Pythagorean theorem');
    const e1 = expectQ('Pythagorean theorem');
    check('typing filters live', JSON.stringify((await visibleIds(sp)).sort()) === JSON.stringify(e1) && e1.length > 0, JSON.stringify(await visibleIds(sp)));
    check('summary counts matches', (await sp.textContent('.finder-sum')) === `${e1.length} of ${TOTAL} lessons match`, await sp.textContent('.finder-sum'));
    check('address is a plain token', (await sp.evaluate(() => location.hash)) === '#find~q_pythagorean-theorem', await sp.evaluate(() => location.hash));
    check('Clear button shows once there is a query', await sp.locator('.finder-q-clear').isVisible());
    await sChip('Grade level', /^Grade 8/).click();
    const e2 = expectQ('Pythagorean theorem', { grade: ['8'] });
    check('search combines with facets', JSON.stringify((await visibleIds(sp)).sort()) === JSON.stringify(e2), JSON.stringify(await visibleIds(sp)));
    check('address holds facets and search', (await sp.evaluate(() => location.hash)) === '#find~grade_8~q_pythagorean-theorem', await sp.evaluate(() => location.hash));
    check('facet counts respect the search', (await sChip('Grade level', /^Grade 8/).locator('.n').textContent()) === String(e2.length), await sChip('Grade level', /^Grade 8/).locator('.n').textContent());
    await sp.getByRole('button', { name: 'Copy link to this view' }).click();
    check('copied view link carries the search', (await sp.evaluate(() => window.__copied.at(-1))).endsWith('#find~grade_8~q_pythagorean-theorem'), await sp.evaluate(() => window.__copied.at(-1)));
    await sp.locator('#f-q').focus(); await sp.keyboard.press('Escape');
    check('Escape clears the search and keeps the facets', (await sp.inputValue('#f-q')) === '' && (await sp.evaluate(() => location.hash)) === '#find~grade_8' && JSON.stringify((await visibleIds(sp)).sort()) === JSON.stringify(expected({ grade: ['8'] })));
    await sp.keyboard.type('ratio'); await sp.locator('.finder-q-clear').click();
    check('Clear button empties the box, keeps focus there', (await sp.inputValue('#f-q')) === '' && (await sp.evaluate(() => document.activeElement.id)) === 'f-q' && await sp.locator('.finder-q-clear').isHidden());
    await sp.keyboard.type('slope'); await sp.keyboard.press('Enter');
    check('Enter in the box does not break anything', JSON.stringify((await visibleIds(sp)).sort()) === JSON.stringify(expectQ('slope', { grade: ['8'] })));
    await sp.locator('.finder-clear').click();
    check('Clear filters clears the search too', (await sp.inputValue('#f-q')) === '' && (await visibleIds(sp)).length === TOTAL && (await sp.evaluate(() => location.hash)) === '#/');
    await sp.keyboard.type('qq'); await sp.locator('#f-q').blur(); await sp.locator('#f-q').fill('');
    await sp.locator('h1').first().click(); await sp.keyboard.press('/');
    check('"/" focuses the search box', (await sp.evaluate(() => document.activeElement.id)) === 'f-q');
    await sp.locator('#f-q').fill('zzzzqq');
    check('no match: empty state and 0 count', !(await sp.locator('.finder-empty').isHidden()) && (await sp.textContent('.finder-sum')) === `0 of ${TOTAL} lessons match`);
    await sp.locator('.finder-empty .btn').click();
    check('empty-state button clears the search', (await sp.inputValue('#f-q')) === '' && (await visibleIds(sp)).length === TOTAL);
    await sp.locator('#f-q').fill("Théorème <b>\"x\"</b> & 100% ~ _ #/?");
    const hh = await sp.evaluate(() => location.hash);
    check('awkward characters still give a plain-anchor-safe address', /^#find~q_[A-Za-z0-9._-]*$/.test(hh) && !hh.includes('~~'), hh);
    await sp.locator('#f-q').fill('a'.repeat(200));
    check('very long input is capped in the address', (await sp.evaluate(() => location.hash)).length <= '#find~q_'.length + 60);
    await sp.goto('about:blank'); await sp.goto(URL + '#find~q_pythagorean-theorem'); await sp.waitForSelector('#f-q');
    check('address with a search fills the box (hyphens back to spaces)', (await sp.inputValue('#f-q')) === 'pythagorean theorem');
    await sp.goto('about:blank'); await sp.goto(URL + '#find~q_'); await sp.waitForSelector('#f-q');
    check('empty q token is no filter', (await visibleIds(sp)).length === TOTAL && (await sp.textContent('.finder-sum')) === `${TOTAL} lessons`);
    await sp.goto('about:blank'); await sp.goto(URL + '#find~q_pythagorean-theorem~course_grade8'); await sp.waitForSelector('#f-q');
    check('q token in any position combines with the other keys', JSON.stringify((await visibleIds(sp)).sort()) === JSON.stringify(expectQ('pythagorean theorem', { course: 'grade8' })));
    check('search sweep: no errors', sr.errs.length === 0, sr.errs.join(' | '));
    await sr.c.close();
  }

  /* ===== every share token for filters: each course and each used benchmark code returns the modelled count ===== */
  {
    const tr = await mk(), tp = tr.page; let badTok = 0, ex = '';
    await tp.goto(URL); await tp.waitForSelector('.finder');
    const tokens = [...D.COURSES.filter(c => D.ALIGN.some(a => a.course === c.id)).map(c => [`#find~course_${c.id}`, { course: c.id }]),
      ...[...new Set(D.ALIGN.flatMap(a => a.standards))].sort().map(c => [`#find~std_${c}`, { std: c }])];
    for (const [t, F] of tokens) {
      await tp.evaluate(h => { location.hash = h; }, t); await tp.waitForTimeout(0);
      await tp.waitForFunction(h => location.hash === h, t);
      const got = (await visibleIds(tp)).length, exp = expected(F).length;
      if (got !== exp || (await tp.textContent('.finder-sum')) !== `${exp} of ${TOTAL} lessons match`) { badTok++; ex = ex || `${t}: ${got} vs ${exp}`; }
    }
    check(`${tokens.length} course and benchmark find tokens return the modelled counts`, badTok === 0 && tokens.length > 100, `${badTok} bad, e.g. ${ex}`);
    check('token sweep: no errors', tr.errs.length === 0, tr.errs.join(' | '));
    await tr.c.close();
  }

  /* ===== home page at scale: continue link, thumbnails, scroll and history ===== */
  {
    const hr = await mk(), hp = hr.page;
    await hp.goto(URL); await hp.waitForSelector('.finder');
    check('no progress: no "Continue" link', (await hp.locator('.resume').count()) === 0);
    check('hero offers a way into the finder for teachers', (await hp.locator('.hero-cta a', { hasText: 'Find a lesson' }).count()) === 1 && /teachers/i.test(await hp.textContent('.hero-note')));
    /* thumbnails: Expand all must not draw them all in one go, and must draw all of them in the end */
    await hp.evaluate(() => { window.__draws = 0; const o = Plane.prototype.draw; Plane.prototype.draw = function () { window.__draws++; return o.apply(this, arguments); }; });
    const burst = await hp.evaluate(async () => { document.querySelector('.course-all').click(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return document.querySelectorAll('.thumb canvas').length; });
    check('Expand all draws thumbnails over several frames, not in one burst', burst < TOTAL, burst);
    await hp.waitForFunction(n => document.querySelectorAll('.thumb canvas').length === n, TOTAL, { timeout: 15000 }).catch(() => {});
    check('Expand all ends with one canvas per lesson', (await hp.locator('.thumb canvas').count()) === TOTAL, await hp.locator('.thumb canvas').count());
    /* opening a lesson, then Back: scroll position */
    await hp.evaluate(() => window.scrollTo(0, 2500)); await hp.waitForTimeout(150);
    const y0 = await hp.evaluate(() => scrollY), hl = await hp.evaluate(() => history.length);
    const link = await hp.evaluate(() => { const a = [...document.querySelectorAll('a.topic')].find(a => a.getBoundingClientRect().top > 100 && a.getBoundingClientRect().top < innerHeight - 100); a.click(); return a.getAttribute('href'); });
    await hp.waitForSelector('.viz-head');
    check('opening a lesson scrolls to the top', (await hp.evaluate(() => scrollY)) === 0, await hp.evaluate(() => scrollY));
    check('lesson page title names the lesson', (await hp.title()).startsWith((await hp.textContent('h1')) + ' |') || /step 1 of/.test(await hp.title()), await hp.title());
    const nSteps = await hp.locator('.steps .dot').count();
    if (nSteps > 1) {
      await hp.locator('.steps-nav .btn.primary').click();
      check('title follows the step', (await hp.title()).includes(`step 2 of ${nSteps}`), await hp.title());
      check('stepping replaces history, it does not add entries', (await hp.evaluate(() => history.length)) === hl + 1, await hp.evaluate(() => history.length));
    }
    await hp.goBack(); await hp.waitForSelector('.finder'); await hp.waitForTimeout(500);
    const y1 = await hp.evaluate(() => scrollY);
    check('Back to the home list restores the scroll position', Math.abs(y1 - y0) < 40 && y0 > 1000, `${y0} -> ${y1}`);
    check('Back leaves the home page on its own (no stepped entries to click through)', (await hp.evaluate(() => location.hash)) === '#/' || (await hp.evaluate(() => location.hash)) === '', await hp.evaluate(() => location.hash));
    await hp.goto('about:blank'); await hp.goto(URL + link.replace('#/viz/', '#').replace(/$/, '')); await hp.waitForSelector('.viz-head');
    await hp.goBack(); await hp.goForward().catch(() => {});
    check('home list: no errors while scrolling and navigating', hr.errs.length === 0, hr.errs.join(' | '));
    await hr.c.close();

    /* "Continue where you left off" */
    const rr = await mk(), rp = rr.page;
    await rp.goto(URL + '#proportional-relationships.3'); await rp.waitForSelector('.steps');
    await rp.goto('about:blank'); await rp.goto(URL + '#/'); await rp.waitForSelector('.finder');
    const rl = rp.locator('.resume-link');
    check('progress makes a "Continue where you left off" link', (await rl.count()) === 1 && /Continue where you left off/.test(await rl.textContent()) && /Proportional relationships/.test(await rl.textContent()) && /Step 3 of/.test(await rl.textContent()), await rp.locator('.resume').count() ? await rl.textContent() : 'none');
    check('the link opens that lesson at that step', (await rl.getAttribute('href')) === '#proportional-relationships.3', await rl.getAttribute('href'));
    await rl.click(); await rp.waitForSelector('.steps');
    check('and it lands on step 3', (await rp.textContent('.steps-n')).startsWith('3 /'));
    check('Continue link: no errors', rr.errs.length === 0, rr.errs.join(' | '));
    await rr.c.close();
    const nr = await mk(); await nr.page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('quota'); }; Storage.prototype.getItem = () => { throw new Error('blocked'); }; });
    await nr.page.goto(URL + '#proportional-relationships.2'); await nr.page.waitForSelector('.steps'); await nr.page.locator('.steps-nav .btn.primary').click();
    await nr.page.locator('.crumbs a').first().click(); await nr.page.waitForSelector('.finder');
    check('storage blocked: home page and Continue link work (kept for the visit)', (await nr.page.locator('.resume-link').count()) === 1 && nr.errs.length === 0, nr.errs.join(' | '));
    await nr.c.close();
  }

  /* ===== mobile ===== */
  const m = await mk({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await m.page.goto(URL); await m.page.waitForSelector('.finder');
  const gridHidden = await m.page.evaluate(() => getComputedStyle(document.querySelector('.finder-grid')).display === 'none');
  check('mobile: filters collapsed by default', gridHidden);
  check('mobile: no horizontal scroll (home)', (await m.page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0);
  await m.page.locator('.finder-toggle').click();
  check('mobile: toggle opens', await m.page.evaluate(() => getComputedStyle(document.querySelector('.finder-grid')).display !== 'none'));
  await m.page.locator('fieldset.facet', { hasText: 'Skill level' }).getByRole('button', { name: /^Introductory/ }).click();
  check('mobile: badge counts active filters', (await m.page.textContent('.finder-toggle .badge')) === '1');
  check('mobile: no horizontal scroll (filters open)', (await m.page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0);
  await m.page.locator('#finder').scrollIntoViewIfNeeded(); await m.page.screenshot({ path: shots + '/home-mobile-filters.png' });
  await m.page.goto('about:blank'); await m.page.goto(URL + '#/viz/inscribed-angles'); await m.page.waitForSelector('.align');
  check('mobile: no horizontal scroll (lesson)', (await m.page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0);
  await m.page.locator('.align').scrollIntoViewIfNeeded(); await m.page.screenshot({ path: shots + '/lesson-align-mobile.png' });
  check('mobile: no errors', m.errs.length === 0, m.errs.join(' | '));
  await m.c.close();

  await browser.close();
  console.log(`PASS ${ok.length}   FAIL ${fails.length}`);
  fails.forEach(f => console.log('FAIL:', f));
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
