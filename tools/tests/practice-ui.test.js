/* Practice page, end to end in headless Chromium. Run:  node tools/tests/practice-ui.test.js   (needs Playwright and a built index.html) */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node-tools/node_modules/playwright'); } })();
const path = require('path'), os = require('os'), fs = require('fs');
const root = path.resolve(__dirname, '../..'), shots = process.env.SHOTS || path.join(os.tmpdir(), 'continuum-shots');
fs.mkdirSync(shots, { recursive: true });
const URL = 'file://' + root + '/index.html';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok  ', m); } else { fail++; console.log('FAIL', m); } };
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } }), pg = await ctx.newPage(), errs = [];
  await pg.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  pg.on('pageerror', e => errs.push(e.message));
  /* the clock the page sees can be pushed forward, so "too quick" answers can be avoided without waiting */
  await pg.addInitScript(() => { const real = performance.now.bind(performance); window.__skew = 0; performance.now = () => real() + window.__skew; });
  const go = async h => { await pg.goto('about:blank'); await pg.goto(URL + h); };
  const typeText = async t => { await pg.fill('#pr-answer', t); };
  const cur = () => pg.evaluate(() => { const p = window.__practice; return p && { id: p.inst.generatorId, level: p.inst.level, answer: p.inst.answer, misc: p.inst.misconceptions, model: p.inst.model, hints: p.inst.hints.length, state: p.state }; });
  const show = a => pg.evaluate(a => Practice.showValue(a, a.value), a);
  const askRight = async () => { const c = await cur(); await pg.evaluate(() => { window.__skew += 20000; }); await typeText((await show(c.answer)).replace('−', '-')); await pg.click('text=Check'); return c; };
  const next = async () => { await pg.click('text=Next problem'); await pg.waitForSelector('#pr-answer:not([disabled])'); };

  /* picker */
  await go('#practice');
  await pg.waitForSelector('.pr-card');
  ok((await pg.locator('.pr-card:not(.pr-mix)').count()) === 12, 'picker lists the twelve skills');
  ok((await pg.locator('.pr-mix').count()) === 6, 'picker offers six mixed reviews (course and unit)');
  ok(await pg.locator('.nav a[href="#practice"]').count() === 1, 'nav has a Practice link');
  ok(!!(await pg.locator('text=Grade 4 Mathematics').count()), 'skills are grouped by course');

  /* a fresh session: level 1, wrong answer with a known misconception */
  await go('#practice~solve-linear-equations');
  await pg.waitForSelector('#pr-answer');
  let c = await cur();
  ok(c.level === 1 && c.state.totalPoints === 0, 'starts at level 1 with no points');
  await typeText('banana'); await pg.click('text=Check');
  ok(/could not read/i.test(await pg.locator('.pr-fb').innerText()), 'unreadable input is explained');
  ok((await cur()).state.attempts === 0, 'unreadable input is not an attempt');
  await typeText('3/'); await pg.waitForTimeout(50);
  ok(/cannot read/i.test(await pg.locator('#pr-echo').innerText()), 'live echo says when it cannot read');
  await typeText('x = 12'); await pg.waitForTimeout(50);
  ok(/Reading your answer as 12/.test(await pg.locator('#pr-echo').innerText()), 'live echo reads "x = 12" as 12');

  /* hints */
  await pg.click('text=/^Hint/');
  ok((await pg.locator('.pr-hints li').count()) === 1, 'first hint appears');
  ok(/Hint \(1 of/.test(await pg.locator('.pr-btns .btn >> nth=1').innerText()), 'hint button counts hints');
  /* correct with a hint: points reduced, streak not advanced */
  c = await askRight();
  const fbText = await pg.locator('.pr-fb').innerText();
  ok(/Correct\./.test(fbText), 'correct answer is confirmed');
  let st = (await cur()).state;
  ok(st.streak === 0 && st.totalPoints > 0 && st.totalPoints < 10, 'a hint cuts the points and does not advance the streak');
  ok(await pg.locator('.pr-solution').count() === 1, 'steps are offered after an answer');
  await next();

  /* three clean correct answers move up a level */
  for (let i = 0; i < 3; i++) { await askRight(); await next(); }
  c = await cur();
  ok(c.level === 2, 'three correct in a row: level 2');
  ok(/of 6/.test(await pg.locator('.pr-stat-v >> nth=0').innerText()), 'level readout shows the top level');

  /* a misconception is named, with a lesson link */
  let hit = false;
  for (let tries = 0; tries < 12 && !hit; tries++) {
    c = await cur();
    const m = c.misc[0];
    if (m) { await typeText(await pg.evaluate(([a, w]) => Practice.showValue(a, w).replace('−', '-'), [c.answer, m.wrongAnswer])); await pg.evaluate(() => { window.__skew += 20000; }); await pg.click('text=Check'); const t = await pg.locator('.pr-fb').innerText(); hit = /Not quite/.test(t) && t.includes('Review:') && (await pg.locator('.pr-fb a').count()) === 1; if (hit) ok(/answer is/.test(t), 'a wrong answer shows the right answer, the targeted feedback and a lesson link'); }
    else { await pg.evaluate(() => { window.__skew += 20000; }); await typeText('9999'); await pg.click('text=Check'); }
    await next();
  }
  ok(hit, 'a known misconception was recognised');
  st = (await cur()).state;
  ok(st.miss <= 2, 'wrong answers count toward going down a level');

  /* too-quick correct answer is ignored for points and ladder */
  await go('#practice~multiply-multi-digit'); await pg.waitForSelector('#pr-answer');
  await pg.evaluate(() => { const s = window.__skew; window.__skew = s; });
  c = await cur(); await typeText(await show(c.answer)); await pg.click('text=Check');
  ok(/very quick/.test(await pg.locator('.pr-fb').innerText()) && (await cur()).state.totalPoints === 0, 'an answer faster than a human can read is not scored');
  await next();

  /* give up: no points, solution shown, same level */
  c = await cur(); const lvl0 = c.level;
  await pg.click('text=Show solution');
  ok(/Here is the solution/.test(await pg.locator('.pr-fb').innerText()) && (await pg.locator('.pr-solution[open]').count()) === 1, 'show solution reveals the steps');
  await next(); ok((await cur()).level === lvl0, 'the next problem is at the same level');

  /* keypad on the Grade 4 skill, and Enter submits */
  ok(await pg.locator('.pr-keypad button').count() === 15, 'grade 4 skill has a keypad');
  await pg.evaluate(() => { window.__skew += 20000; });
  c = await cur(); const ans = String(c.answer.value.n);
  for (const ch of ans) await pg.click(`.pr-key[aria-label="${ch}"]`);
  ok((await pg.inputValue('#pr-answer')) === ans, 'keypad types into the answer box');
  await pg.press('#pr-answer', 'Enter');
  ok(/Correct\./.test(await pg.locator('.pr-fb').innerText()), 'Enter checks the answer');
  ok(await pg.evaluate(() => document.activeElement && document.activeElement.textContent === 'Next problem'), 'focus moves to Next problem');
  /* persistence */
  const pts = (await cur()).state.totalPoints;
  await go('#practice~multiply-multi-digit'); await pg.waitForSelector('#pr-answer');
  ok((await cur()).state.totalPoints === pts && pts > 0, 'points survive a reload');
  await go('#practice'); await pg.waitForSelector('.pr-card');
  ok(/Level \d of 6/.test(await pg.locator('.pr-card:not(.pr-mix) >> nth=0').innerText()), 'picker shows level progress');
  ok(/Mistakes to review/.test(await pg.locator('body').innerText()), 'picker lists mistakes to review (regenerated from the log)');

  /* fractions: right value, wrong form does not end the attempt */
  await go('#practice~add-subtract-unlike-fractions'); await pg.waitForSelector('#pr-answer');
  let found = false;
  for (let i = 0; i < 15 && !found; i++) {
    c = await cur();
    const v = c.answer.value;
    if (v.d > 1 && v.n > 0) { const k = 2; await typeText(`${v.n * k}/${v.d * k}`); await pg.click('text=Check'); found = /Nearly/.test(await pg.locator('.pr-fb').innerText()); break; }
  }
  ok(found, 'an unsimplified fraction gets "right value, wrong form" feedback');
  ok(await pg.locator('#pr-answer:not([disabled])').count() === 1, '... and lets the student try again');

  /* a figure for right triangles */
  await go('#practice~pythagorean-side-lengths'); await pg.waitForSelector('.pr-fig');
  ok((await pg.locator('.pr-fig text').count()) === 3, 'right triangle figure has three labels');
  ok(/\?/.test(await pg.locator('.pr-fig').textContent()), 'one side is marked ?');


  /* mixed review: skills take turns, the summary lists each */
  await go('#practice~mix-course-grade6'); await pg.waitForSelector('#pr-answer');
  ok(/Mixed review/.test(await pg.locator('h1').innerText()), 'a mixed review has its own title');
  const seq = [];
  for (let i = 0; i < 10; i++) {
    c = await askRight(); const id = await pg.evaluate(() => window.__practice.skill.id); seq.push(id);
    ok(/Correct\./.test(await pg.locator('.pr-fb').innerText()), 'mixed problem ' + (i + 1) + ' answered');
    ok(/Skill: /.test(await pg.locator('.pr-skillline').innerText()), 'the skill is named on screen');
    if (i < 9) await next();
  }
  ok(new Set(seq).size === 2, 'both grade 6 skills appeared in ten problems: ' + [...new Set(seq)].join(', '));
  ok(seq.filter((x, i) => i && x !== seq[i - 1]).length >= 3, 'the skills interleave (' + seq.map(x => x[0]).join('') + ')');
  await pg.click('text=End session');
  const sumText = await pg.locator('.pr-sumlist').innerText();
  ok(/Percent of a number/.test(sumText) && /The mean of a data set/.test(sumText), 'the summary lists each skill');
  /* weak skills come up more: seed storage, then sample the scheduler the page uses */
  await go('#practice');
  await pg.evaluate(() => { localStorage.setItem('continuum-practice-v1', JSON.stringify({ skills: {
    'percent-of-a-number': { level: 2, streak: 0, miss: 0, totalPoints: 50, mastered: false, lastPracticed: Date.now(), attempts: 20, recentOk: [0, 0, 1, 0, 0, 1, 0, 0], topRecent: [], recentSeeds: [], recentHashes: [] },
    'mean-of-a-data-set': { level: 2, streak: 0, miss: 0, totalPoints: 50, mastered: false, lastPracticed: Date.now(), attempts: 20, recentOk: [1, 1, 1, 1, 1, 1, 1, 1], topRecent: [], recentSeeds: [], recentHashes: [] } }, log: [] })); });
  await go('#practice~mix-course-grade6'); await pg.waitForSelector('#pr-answer');
  const picks = await pg.evaluate(() => { const m = Practice.mix('mix-course-grade6', x => x), st = {}; m.skills.forEach(s => st[s.id] = PracticeStore.state(s.id)); const n = {}; let last = null; for (let i = 0; i < 400; i++) { const s = Practice.pickSkill(m.skills, st, last, Date.now()); n[s.id] = (n[s.id] || 0) + 1; last = s.id; } return n; });
  ok(picks['percent-of-a-number'] > picks['mean-of-a-data-set'], 'the page schedules the weak skill more often: ' + JSON.stringify(picks));

  /* summary */
  await pg.evaluate(() => { window.__skew += 20000; });
  await askRight(); await pg.click('text=End session');
  ok(/Session summary/.test(await pg.locator('h1').innerText()) && /solved 1 of 1/.test(await pg.locator('.pr-sum').first().innerText()), 'session summary reports the run');

  /* looks: light, dark, mobile; no overflow */
  await go('#practice~solve-linear-systems'); await pg.waitForSelector('#pr-answer');
  await pg.screenshot({ path: path.join(shots, 'practice-light.png') });
  await pg.evaluate(() => { document.documentElement.dataset.theme = 'dark'; dispatchEvent(new Event('themechange')); });
  await pg.screenshot({ path: path.join(shots, 'practice-dark.png') });
  await pg.setViewportSize({ width: 390, height: 844 });
  await go('#practice~multiply-multi-digit'); await pg.waitForSelector('.pr-keypad');
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal scroll at 390px');
  await pg.screenshot({ path: path.join(shots, 'practice-mobile.png'), fullPage: true });
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join('; ') : ''));
  await browser.close();
  console.log(`PASS ${pass}   FAIL ${fail}`);
  process.exit(fail ? 1 : 0);
})();
