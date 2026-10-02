/* Teacher mode: the answer key is locked behind the shared password.
   Run:  node tools/tests/teachermode.test.js   (builds a password-protected copy in the temp folder) */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node-tools/node_modules/playwright'); } })();
const path = require('path'), os = require('os'), fs = require('fs'), { execSync } = require('child_process');
const root = path.resolve(__dirname, '../..'), PW = 'correct horse battery';
const LOCKED = path.join(os.tmpdir(), 'continuum-locked.html'), OPEN = path.join(os.tmpdir(), 'continuum-open.html');
const build = (out, pw) => execSync('node tools/build.js', { cwd: root, stdio: 'pipe', env: { ...process.env, CONTINUUM_OUT: out, CONTINUUM_TEACHER_PASSWORD: pw || '', HOME: process.env.HOME } });
const fails = [], ok = [], check = (n, c, x) => (c ? ok : fails).push(n + (c ? '' : '   -> ' + (x ?? '')));
(async () => {
  build(LOCKED, PW);
  const src = fs.readFileSync(LOCKED, 'utf8');
  check('the password is not in the page', !src.includes(PW));
  check('a hash is baked in', /'\d+:[0-9a-f]{32}:[0-9a-f]{64}'/.test(src));
  if (!fs.existsSync(path.join(root, 'teacher-password.txt'))) { build(OPEN, ''); check('open build has no hash', !/'\d+:[0-9a-f]{32}:[0-9a-f]{64}'/.test(fs.readFileSync(OPEN, 'utf8'))); }
  const browser = await chromium.launch();
  const mk = async file => {
    const c = await browser.newContext({ viewport: { width: 1280, height: 900 } }), page = await c.newPage(), errs = [];
    await page.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
    page.on('pageerror', e => errs.push(e.message));
    return { page, errs, url: 'file://' + file };
  };
  const { page, errs, url } = await mk(LOCKED);
  const go = async hash => { await page.goto('about:blank'); await page.goto(url + hash); await page.waitForSelector('#app > *'); };
  await go('#slope-and-linear-functions.key');
  check('locked key page shows the password form', await page.locator('#teacher-pw').count() === 1);
  check('no answer key text while locked', await page.locator('.ticket-key').count() === 0 && await page.locator('.tick-mark').count() === 0);
  check('student ticket still opens', (await (async () => { await go('#slope-and-linear-functions.ticket'); return page.locator('.ticket-sheet').count(); })()) === 1);
  await go('#slope-and-linear-functions.key');
  await page.fill('#teacher-pw', 'wrong password');
  await page.click('.teacher-login button[type=submit]');
  await page.waitForFunction(() => /not right/.test(document.getElementById('teacher-msg').textContent));
  check('wrong password is refused', await page.locator('.ticket-key').count() === 0);
  await page.fill('#teacher-pw', PW);
  await page.click('.teacher-login button[type=submit]');
  await page.waitForSelector('.ticket-key');
  check('right password unlocks the key in place', await page.locator('.tick-mark').count() > 0);
  check('footer shows teacher mode on', /Lock/.test(await page.textContent('#teacherBtn')));
  await page.reload(); await page.waitForSelector('.ticket-key');
  check('unlock survives a reload', true);
  await page.click('#teacherBtn');
  await page.waitForSelector('#teacher-pw');
  check('Lock puts the gate back', await page.locator('.ticket-key').count() === 0);
  await go('#teacher');
  check('#teacher page offers the form when locked', await page.locator('#teacher-pw').count() === 1);
  check('no page errors', errs.length === 0, errs.join('; '));
  await browser.close();
  console.log(ok.map(x => 'ok   ' + x).join('\n') + (fails.length ? '\n' + fails.map(x => 'FAIL ' + x).join('\n') : ''));
  console.log(`PASS ${ok.length}   FAIL ${fails.length}`); process.exit(fails.length ? 1 : 0);
})();
