/* Tours: every authored stop must point at something that exists in its lesson.
   Run:  node tools/tests/tours.test.js [lesson-id ...]   (needs Playwright and a built index.html) */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs');
const root = path.resolve(__dirname, '../..'), dir = path.join(root, process.env.TOURS_DIR || 'src/tours');
const SITE = 'file://' + root + (process.env.SITE_FILE || '/index.html');
const only = process.argv.slice(2);
const ids = fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5)).filter(id => !only.length || only.includes(id));
(async () => {
  const browser = await chromium.launch(), fails = []; let stops = 0;
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage(), errs = [];
  await page.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  page.on('pageerror', e => errs.push(e.message));
  for (const id of ids) {
    const t = JSON.parse(fs.readFileSync(path.join(dir, id + '.json'), 'utf8'));
    const found = new Set();
    for (let step = 1; step <= 4; step++) {
      await page.goto('about:blank'); await page.goto(SITE + '#' + id + (step > 1 ? '.' + step : '')); await page.waitForSelector('.workbench .panel');
      const got = await page.evaluate(stops => stops.map(s => !!Tour.resolve(s.at)), t.stops);
      got.forEach((ok, i) => ok && found.add(i));
    }
    /* the Tour must also run end to end */
    await page.goto('about:blank'); await page.goto(SITE + '#' + id); await page.waitForSelector('.tour-btn');
    await page.click('.tour-btn'); await page.waitForSelector('.tour-card');
    for (let k = 0; k < 40 && await page.locator('.tour-card').count(); k++) await page.click('.tour-btns .btn.primary');
    t.stops.forEach((s, i) => { stops++; if (!found.has(i)) fails.push(`${id}: stop ${i + 1} (${s.at}) is not on the page`); });
    for (const s of t.stops) { if (s.text.length > 260) fails.push(`${id}: "${s.title}" text is over 260 characters`); }
    if (t.purpose.length > 300) fails.push(`${id}: purpose is over 300 characters`);
  }
  if (errs.length) fails.push('page errors: ' + errs.slice(0, 3).join('; '));
  await browser.close();
  console.log(fails.length ? fails.map(x => 'FAIL ' + x).join('\n') : 'ok');
  console.log(`${ids.length} tours, ${stops} stops, ${fails.length} problems`); process.exit(fails.length ? 1 : 0);
})();
