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
  check('std select -> inscribed-angles only', JSON.stringify(await visibleIds(page)) === '["inscribed-angles"]', JSON.stringify(await visibleIds(page)));
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
