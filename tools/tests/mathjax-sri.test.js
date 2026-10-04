/* The MathJax script carries a Subresource Integrity hash. Checks that the hash matches the published file, that the page
   typesets with it, and that a tampered copy is refused while the lesson still works (plain-text math).
   Run:  node tools/tests/mathjax-sri.test.js   (needs Playwright, a built index.html, and curl with network access; skips offline) */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs'), os = require('os'), crypto = require('crypto'), { execFileSync } = require('child_process');
const root = path.resolve(__dirname, '../..');
const html = fs.readFileSync(root + '/index.html', 'utf8');
const tag = html.match(/<script src="(https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/mathjax\/[^"]+)"[^>]*>/);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok  ', m); } else { fail++; console.log('FAIL', m); } };
(async () => {
  ok(!!tag, 'the MathJax script tag is in the page');
  const integrity = tag && (tag[0].match(/integrity="(sha(?:256|384|512)-[^"]+)"/) || [])[1];
  ok(!!integrity && /crossorigin="anonymous"/.test(tag[0]), 'it has an integrity hash and crossorigin="anonymous"');
  const file = path.join(os.tmpdir(), 'mathjax-sri-test.js');
  try { execFileSync('curl', ['-sSf', '-o', file, tag[1]], { stdio: 'pipe' }); } catch (e) { console.log('skip: cannot download MathJax here (' + String(e.message).split('\n')[0] + ')'); console.log(`PASS ${pass}   FAIL ${fail}`); process.exit(fail ? 1 : 0); }
  const bytes = fs.readFileSync(file), algo = integrity.split('-')[0];
  ok(algo + '-' + crypto.createHash(algo).update(bytes).digest('base64') === integrity, 'the hash matches the file the CDN serves');
  const browser = await chromium.launch();
  const run = async body => {
    const pg = await (await browser.newContext()).newPage(), errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    await pg.route('**/*', r => {
      const u = r.request().url();
      if (u.startsWith('file:')) return r.continue();
      if (u === tag[1]) return r.fulfill({ status: 200, contentType: 'application/javascript', headers: { 'access-control-allow-origin': '*' }, body });
      return r.abort();
    });
    await pg.goto('file://' + root + '/index.html#pythagorean-theorem'); await pg.waitForSelector('.workbench .panel');
    await pg.waitForTimeout(2500);
    return { pg, errs, mj: await pg.evaluate(() => ({ failed: !!window.__mjFail, loaded: !!(window.MathJax && window.MathJax.typesetPromise), rendered: document.querySelectorAll('mjx-container').length, stage: !!document.querySelector('.stage canvas') })) };
  };
  const good = await run(bytes);
  ok(good.mj.loaded && !good.mj.failed && good.mj.rendered > 0, 'the genuine file loads and typesets equations (' + good.mj.rendered + ' rendered)');
  const bad = await run(Buffer.concat([bytes, Buffer.from('\n/* tampered */')]));
  ok(!bad.mj.loaded && bad.mj.failed && bad.mj.rendered === 0, 'a tampered file is refused');
  ok(bad.mj.stage && bad.errs.length === 0, 'the lesson still works with the file refused');
  await browser.close();
  console.log(`PASS ${pass}   FAIL ${fail}`);
  process.exit(fail ? 1 : 0);
})();
