const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node-tools/node_modules/playwright'); } })();
const path = require('path'), os = require('os'), { execSync } = require('child_process');
const fs = require('fs'), vm = require('vm');
const root = path.resolve(__dirname, '../..'), shots = process.env.SHOTS || path.join(os.tmpdir(), 'continuum-shots');
fs.mkdirSync(shots, { recursive: true });
/* Run:  node tools/tests/teacher.test.js   (needs Playwright and a built index.html) */
const EMBED = path.join(os.tmpdir(), 'continuum-embed.html');
/* CONTINUUM_BUILD=split runs the same checks against dist/ (built with: node tools/build.js --split) */
const SITE = 'file://' + root + (process.env.CONTINUUM_BUILD === 'split' ? '/dist/index.html' : '/index.html');
/* counts and expectations come from the curriculum data, so adding lessons needs no edits here */
const dctx = vm.createContext({});
vm.runInContext(['src/curriculum/standards-mn2022.js', 'src/curriculum/curriculum.js'].map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n') + ';this.D={ALIGN,COURSES}', dctx);
const levelOf = a => dctx.D.COURSES.find(c => c.id === a.course).level;
const bandsOf = a => { const g = new Set(dctx.D.COURSES.find(c => c.id === a.course).grades); a.standards.forEach(c => g.add(+c[0] >= 9 ? '9-11' : c[0])); return g; };
const GRADE8_INTRO = dctx.D.ALIGN.filter(a => bandsOf(a).has('8') && a.skill === 'intro').map(a => a.id).sort();
const ENRICH = dctx.D.ALIGN.filter(a => a.enrichment).map(a => a.id).sort();
const SCHOOL = dctx.D.ALIGN.filter(a => levelOf(a) === 'school').length, TOTAL = dctx.D.ALIGN.length, fails = [], ok = [];
const check = (name, cond, extra) => { (cond ? ok : fails).push(name + (cond ? '' : '   -> ' + (extra ?? ''))); };

(async () => {
  const browser = await chromium.launch();
  const mk = async (opts = {}) => {
    const c = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...opts }), page = await c.newPage(), errs = [];
    await page.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) errs.push('console: ' + m.text()); });
    return { page, errs, c };
  };
  const go = async (page, hash) => { await page.goto('about:blank'); await page.goto(SITE + hash); await page.waitForSelector('#app > *'); };
  const { page, errs, c } = await mk();
  await page.addInitScript(() => { window.__copied = []; Object.defineProperty(navigator, 'clipboard', { value: { writeText: async t => { window.__copied.push(t); } }, configurable: true }); });
  const stepText = () => page.textContent('.steps-n');

  /* ---- 1. routes ---- */
  await go(page, '#slope-and-linear-functions');
  const flat = await page.evaluate(() => texToText('Is \\(-8 &lt; -3\\) true? <b>Yes</b>: -8 &lt; -3 and 5 &gt; 2 &amp; 4 &lt;= 5'));
  check('texToText drops tags but keeps decoded inequality symbols', flat === 'Is -8 < -3 true? Yes: -8 < -3 and 5 > 2 & 4 <= 5', flat);
  const flat2 = await page.evaluate(() => texFlat('\\frac{y-y_1}{x-x_1}=m \\Longrightarrow 2^{5+(-3)} \\tfrac1{10^{6}}'));
  check('texFlat writes fractions, exponents and arrows as plain text', flat2 === '(y-y_1)/(x-x_1)=m ⇒ 2^(5+(-3)) 1/(10⁶)', flat2);
  const flat3 = await page.evaluate(() => texFlat('a \\equiv b \\pmod{5}, -3 \\bmod 5 = 2, \\gcd(a,n)=1'));
  check('texFlat writes congruences as plain text', flat3 === 'a ≡ b  (mod 5), -3  mod  5 = 2, gcd(a,n)=1', flat3);
  const flat4 = await page.evaluate(() => texFlat('x \\in \\mathbb{R}, \\{x \\mid x \\ge 2\\} = [2, \\infty), (-\\infty, 1) \\cup (3, 5], A \\cap B = \\emptyset, 2 \\notin \\mathbb{Q}'));
  const flat5 = await page.evaluate(() => texFlat('z = a + bi, \\bar{z} = a - bi, |z|^2 = z\\bar{z}, \\bar z'));
  check('texFlat writes complex conjugates', flat5 === 'z = a + bi, conj(z) = a - bi, |z|² = zconj(z), conj(z)', flat5);
  check('texFlat writes set and interval notation', flat4 === 'x ∈ R, {x | x ≥ 2} = [2, ∞), (-∞, 1) ∪ (3, 5], A ∩ B = ∅, 2 ∉ Q', flat4);
  check('plain lesson token opens the lesson', (await page.textContent('h1')) === 'Slope and linear functions' && (await stepText()) === '1 / 4');
  await go(page, '#slope-and-linear-functions.3');
  check('step token opens step 3', (await stepText()) === '3 / 4', await stepText());
  const ro = await page.textContent('.readout');
  check('step 3 state is applied at once (slope −1.5)', /y = −1\.5x \+ 1/.test(ro), ro);
  await go(page, '#slope-and-linear-functions.99');
  check('out-of-range step clamps to the last step', (await stepText()) === '4 / 4', await stepText());
  await go(page, '#/viz/slope-and-linear-functions');
  check('legacy #/viz/ form still opens the lesson', (await page.textContent('h1')) === 'Slope and linear functions');
  await go(page, '#slope-and-linear-functions.ticket');
  check('ticket token shows the student ticket', (await page.locator('.ticket-sheet').count()) === 1 && (await page.locator('.ticket-qs > li').count()) === 2 && (await page.locator('.ticket-key').count()) === 0);
  await go(page, '#slope-and-linear-functions.key');
  check('key token shows the answer key', (await page.locator('.ticket-key li').count()) === 2 && /slope is/.test(await page.textContent('.ticket-key')), await page.textContent('.ticket-key'));
  await go(page, '#progress');
  check('progress token opens the progress page', (await page.textContent('h1')) === 'My progress');
  await go(page, '#find~grade_8~skill_intro');
  const vis = async () => page.evaluate(() => [...document.querySelectorAll('a.topic')].filter(a => !a.closest('li').hidden && !a.closest('.course').hidden && !a.closest('.level').hidden).map(a => a.getAttribute('href').slice(6)).sort());
  check('find token applies grade and skill filters', JSON.stringify(await vis()) === JSON.stringify(GRADE8_INTRO), JSON.stringify(await vis()));
  await go(page, '#find~kind_enrich');
  check('kind token shows only the enrichment lessons', ENRICH.length > 0 && JSON.stringify(await vis()) === JSON.stringify(ENRICH), JSON.stringify(await vis()));
  await go(page, '#' + ENRICH[0]);
  check('an enrichment lesson shows the Enrichment tag, linking to the filtered list', (await page.getAttribute('.viz-meta a.tag.enrich', 'href')) === '#find~kind_enrich');
  await go(page, '#find~course_algebra1~std_9.3.6.2');
  check('find token applies course and standard', JSON.stringify(await vis()) === '["quadratics-and-the-parabola"]', JSON.stringify(await vis()));
  await go(page, '#find~grade_6~grade_7');
  check('repeated key means any of them', (await vis()).length === (await page.evaluate(() => VIZ.filter(v => v.grades.includes('6') || v.grades.includes('7')).length)));
  await go(page, '#find~grade_99~bogus~std_1.2.3.4');
  check('unknown values are ignored', (await vis()).length === TOTAL);
  await go(page, '#school');
  check('#school opens the home page', (await page.locator('.finder').count()) === 1);
  await go(page, '#nonsense-page');
  check('unknown token falls back to the home page', (await page.locator('.finder').count()) === 1);
  await go(page, '#/?grade=8&skill=intro');
  check('legacy #/? filter form still works', JSON.stringify(await vis()) === JSON.stringify(GRADE8_INTRO));
  const plain = await page.evaluate(() => ['#slope-and-linear-functions.3', '#find~grade_9-11~std_9.1.2.6', '#progress', '#slope-and-linear-functions.key'].every(h => /^#[A-Za-z0-9._~-]+$/.test(h)));
  check('share tokens use only viewer-safe characters', plain);

  /* ---- 2. stepping updates the address; copy link ---- */
  await go(page, '#slope-and-linear-functions');
  await page.getByRole('button', { name: 'Next' }).click();
  check('Next updates the address to the step token', (await page.evaluate(() => location.hash)) === '#slope-and-linear-functions.2', await page.evaluate(() => location.hash));
  await page.getByRole('button', { name: 'Copy link to this step' }).click();
  const copied = await page.evaluate(() => window.__copied.at(-1));
  check('copy step link gives the full address with the step token', copied === SITE + '#slope-and-linear-functions.2', copied);
  check('button confirms', (await page.getByRole('button', { name: 'Copied' }).count()) === 1);
  await go(page, '#find');
  await page.locator('fieldset.facet', { hasText: 'Skill level' }).getByRole('button', { name: /^Advanced/ }).click();
  await page.getByRole('button', { name: 'Copy link to this view' }).click();
  check('copy view link', (await page.evaluate(() => window.__copied.at(-1))) === SITE + '#find~skill_adv', await page.evaluate(() => window.__copied.at(-1)));
  check('view link button hidden with no filters', await (async () => { await page.locator('.finder-clear').click(); return page.getByRole('button', { name: 'Copy link to this view' }).isHidden(); })());

  /* ---- 3. clipboard refused: fallback box ---- */
  const r2 = await mk();
  await r2.page.addInitScript(() => { Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('denied'); } }, configurable: true }); document.execCommand = () => false; });
  await go(r2.page, '#slope-and-linear-functions');
  await r2.page.getByRole('button', { name: 'Copy link to this step' }).click();
  const fb = r2.page.locator('.steps-tools .copy-fallback');
  check('fallback text box appears when copying is refused', (await fb.isVisible()) && (await fb.inputValue()) === SITE + '#slope-and-linear-functions', await fb.inputValue().catch(() => 'n/a'));
  check('no errors with copying refused', r2.errs.length === 0, r2.errs.join('|'));
  await r2.c.close();

  /* ---- 4. embedded in a frame (how the artifact viewer runs it) ---- */
  fs.writeFileSync(EMBED, `<!doctype html><iframe id="f" src="${SITE}#slope-and-linear-functions.2" style="width:1200px;height:800px"></iframe>`);
  const r3 = await mk();
  await r3.page.goto('file://' + EMBED);
  const fr = r3.page.frameLocator('#f');
  await fr.locator('.steps-n').waitFor();
  check('deep link works inside a frame (step 2)', (await fr.locator('.steps-n').textContent()) === '2 / 4');
  await r3.page.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'null' }).catch(() => {});
  const frame = r3.page.frames().find(f => f !== r3.page.mainFrame());
  const emb = await frame.evaluate(() => ({ embedded, share: shareUrl('#x.2'), print: canPrint }));
  check('embedded mode detected: share gives the token only, no print', emb.embedded === true && emb.share === '#x.2' && emb.print === false, JSON.stringify(emb));
  check('embedded copy button explains itself', /add it after/i.test(await fr.getByRole('button', { name: 'Copy link to this step' }).getAttribute('title')));
  await r3.c.close();

  /* ---- 5. progress ---- */
  const r4 = await mk();
  const P = r4.page;
  await P.addInitScript(() => { window.__copied = []; Object.defineProperty(navigator, 'clipboard', { value: { writeText: async t => { window.__copied.push(t); } }, configurable: true }); });
  await go(P, '#slope-and-linear-functions');
  for (let i = 0; i < 3; i++) await P.getByRole('button', { name: 'Next' }).click();
  check('chip shows steps and checks on the lesson page', /Steps 4\/4 · Checks 0\/2/.test(await P.textContent('.viz-meta .prog')), await P.textContent('.viz-meta .prog'));
  await P.getByRole('button', { name: '2', exact: true }).first().click();          /* wrong on question 1 */
  check('a wrong answer does not count as right', /Checks 0\/2/.test(await P.textContent('.viz-meta .prog')));
  await P.getByRole('button', { name: '3', exact: true }).first().click();          /* right on question 1 */
  check('a right answer counts', /Checks 1\/2/.test(await P.textContent('.viz-meta .prog')), await P.textContent('.viz-meta .prog'));
  await P.getByRole('button', { name: /It falls to the right and crosses the y-axis at 5/ }).click();
  check('lesson is Complete after all steps and checks', /Complete/.test(await P.textContent('.viz-meta .prog')), await P.textContent('.viz-meta .prog'));
  await go(P, '#/');
  const rowChip = await P.locator('a.topic[href="#/viz/slope-and-linear-functions"] .prog').textContent();
  check('home row shows Complete', /Complete/.test(rowChip), rowChip);
  check('rows never opened show no chip', (await P.locator('a.topic[href="#/viz/systems-of-equations"] .prog').isHidden()));
  await go(P, '#progress');
  check('progress page counts 1 of N', new RegExp(`1 of ${SCHOOL} lessons complete`).test(await P.textContent('.prog-total')), await P.textContent('.prog-total'));
  const slopeRow = await P.locator('.prog-row', { hasText: 'Slope and linear functions' }).textContent();
  check('slope row detail', /Steps 4\/4/.test(slopeRow) && /Checks 2\/2/.test(slopeRow) && /Complete/.test(slopeRow), slopeRow);
  await P.locator('#student-name').fill('Alex R.');
  await P.getByRole('button', { name: 'Copy summary' }).click();
  const sum = await P.evaluate(() => window.__copied.at(-1));
  check('summary text has name, totals and lesson lines', /Alex R\./.test(sum) && new RegExp(`1 of ${SCHOOL} lessons complete`).test(sum) && /\[done\] Slope and linear functions: steps 4\/4, checks right 2\/2 \(first try 1\)/.test(sum) && /\[not started\] Systems of equations/.test(sum), sum);
  await P.goto('about:blank'); await P.goto(SITE + '#progress'); await P.waitForSelector('#student-name');
  check('progress and name persist across reloads', (await P.inputValue('#student-name')) === 'Alex R.' && new RegExp(`1 of ${SCHOOL}`).test(await P.textContent('.prog-total')));
  await P.getByRole('button', { name: 'Reset progress' }).click();
  check('reset asks first', await P.getByRole('button', { name: 'Yes, erase' }).isVisible());
  await P.getByRole('button', { name: 'Keep it' }).click();
  check('keeping leaves progress', new RegExp(`1 of ${SCHOOL}`).test(await P.textContent('.prog-total')));
  await P.getByRole('button', { name: 'Reset progress' }).click(); await P.getByRole('button', { name: 'Yes, erase' }).click();
  check('reset erases', new RegExp(`0 of ${SCHOOL}`).test(await P.textContent('.prog-total')));
  check('no errors across the progress flow', r4.errs.length === 0, r4.errs.join('|'));
  await P.screenshot({ path: shots + '/progress-page.png', fullPage: true });
  await r4.c.close();

  /* storage unavailable: still works, no errors */
  const r5 = await mk();
  await r5.page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
  await go(r5.page, '#slope-and-linear-functions.2');
  await r5.page.getByRole('button', { name: 'Next' }).click();
  check('no storage: lesson and progress still work', /Steps 2\/4/.test(await r5.page.textContent('.viz-meta .prog')) && r5.errs.length === 0, r5.errs.join('|') + await r5.page.textContent('.viz-meta .prog'));
  await r5.c.close();

  /* ---- 6. ticket content, print, text export ---- */
  await go(page, '#the-unit-circle-and-trig-waves.key');
  const tq = await page.$$eval('.ticket-qs > li', els => els.map(e => ({ q: e.querySelector('.tq').textContent, n: e.querySelectorAll('.tc li').length })));
  check('ticket lists each question with lettered choices', tq.length === 2 && tq.every(x => x.n === 4), JSON.stringify(tq));
  check('ticket shows the standard chips', (await page.locator('.ticket-meta .std').count()) === 1);
  check('print button present in a top-level page', (await page.getByRole('button', { name: 'Print or save as PDF' }).count()) === 1);
  await page.getByRole('button', { name: 'Copy as text' }).click();
  const tt = await page.evaluate(() => window.__copied.at(-1));
  check('text copy has questions, letters, key, and no raw TeX delimiters', /Exit ticket: The unit circle and trig waves/.test(tt) && /1\. What are the coordinates/.test(tt) && /A\. \(1, 0\)/.test(tt) && /Answer key/.test(tt) && !/\\\(|\\\)/.test(tt), tt);
  await page.emulateMedia({ media: 'print' });
  check('print view hides navigation and tools', await page.evaluate(() => getComputedStyle(document.querySelector('.topbar')).display === 'none' && getComputedStyle(document.querySelector('.ticket-tools')).display === 'none'));
  await page.screenshot({ path: shots + '/ticket-print.png' });
  await page.emulateMedia({ media: 'screen' });
  await page.screenshot({ path: shots + '/ticket-screen.png', fullPage: true });
  await go(page, '#what-is-nothing.ticket');
  check('ticket for an unknown lesson falls back to the home page', (await page.locator('.finder').count()) === 1);
  await go(page, '#linear-transformations.ticket');
  check('legacy lesson with no checks: ticket says so', /no quick-check questions/.test(await page.textContent('.ticket-sheet')));
  check('lesson page of a legacy lesson has no ticket links', await (async () => { await go(page, '#linear-transformations'); return (await page.locator('.ticket-links').count()) === 0; })());
  check('no errors during route and ticket tests', errs.length === 0, errs.join('|'));

  /* ---- 7. mobile layout of the new pages ---- */
  const m = await mk({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  for (const h of ['#progress', '#slope-and-linear-functions.ticket', '#slope-and-linear-functions.key', '#slope-and-linear-functions.3']) {
    await go(m.page, h);
    check('mobile no horizontal scroll ' + h, (await m.page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, await m.page.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  }
  await go(m.page, '#slope-and-linear-functions.key'); await m.page.screenshot({ path: shots + '/ticket-mobile.png', fullPage: true });
  check('no errors on mobile', m.errs.length === 0, m.errs.join('|'));

  await browser.close();
  console.log(`PASS ${ok.length}   FAIL ${fails.length}`);
  fails.forEach(f => console.log('FAIL:', f));
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
