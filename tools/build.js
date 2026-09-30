#!/usr/bin/env node
/* Builds the single-file site: src/template.html + src/** -> index.html
   Usage: node tools/build.js [--check]   (--check fails if index.html is stale) */
const fs = require('fs'), path = require('path');
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

const scripts = [...man.engine, ...man.lessons, ...man.app].map(read).join('\n');
const out = read('template.html')
  .replace('/*@STYLES*/', () => man.styles.map(read).join('').replace(/\n$/, ''))
  .replace('/*@SCRIPTS*/', () => scripts.replace(/\n$/, ''));
const dest = path.join(root, 'index.html');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(dest) || fs.readFileSync(dest, 'utf8') !== out) { console.error('index.html is out of date; run node tools/build.js'); process.exit(1); }
  console.log('index.html is up to date'); process.exit(0);
}
fs.writeFileSync(dest, out);
console.log(`built index.html (${(out.length / 1024).toFixed(1)} KB, ${man.lessons.length} lessons)`);
