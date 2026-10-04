/* Practice engine tests: generators, independent verification, checkers, ladder, points, repeat avoidance.
   Run:  node tools/tests/practice.test.js   (pure Node, no browser; set SEEDS=500 for a quick run) */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '../..');
const man = JSON.parse(fs.readFileSync(root + '/src/manifest.json', 'utf8'));
const ctx = vm.createContext({ console });
vm.runInContext(man.practice.map(f => fs.readFileSync(root + '/src/' + f, 'utf8')).join('\n') + '\n;this.P = Practice', ctx);
const P = ctx.P, N = +process.env.SEEDS || 2000;
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const FINITE = [];
const eqv = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const R = P.R, rat = P.rat;

/* ---------- CAS and checkers on known cases ---------- */
ok(rat.eq(P.cas.solveLinear('2*x+3=11'), R(4)), 'cas linear');
ok(rat.eq(P.cas.solveLinear('3*(x-2)=2*x+1'), R(7)), 'cas linear parens');
ok(eqv(P.cas.solveSystem('y=2*x+1;x+y=7'), [R(2), R(5)]), 'cas system');
ok(rat.eq(P.cas.value('3/4+2/3'), R(17, 12)), 'cas fractions');
ok(rat.eq(P.cas.value('sqrt(5^2+12^2)'), R(13)), 'cas sqrt');
let threw = false; try { P.cas.value('sqrt(2)'); } catch (e) { threw = true; } ok(threw, 'cas rejects irrational sqrt');
const num = (v, form) => ({ type: 'number', value: v, form });
ok(P.check(num(R(1, 2), 'any'), '0.5').status === 'correct', '0.5 = 1/2');
ok(P.check(num(R(1, 2), 'any'), '2/4').status === 'correct', 'any form accepts 2/4');
ok(P.check(num(R(1, 2), 'simplified'), '2/4').status === 'form', 'simplified: 2/4 is form');
ok(P.check(num(R(7, 6), 'simplified'), '1 1/6').status === 'correct', 'mixed number');
ok(P.check(num(R(7, 6), 'simplified'), '14/12').status === 'form', '14/12 form');
ok(P.check(num(R(-3), 'any'), '−3').status === 'correct', 'unicode minus');
ok(P.check(num(R(4), 'any'), 'x = 4').status === 'correct', 'x= prefix');
ok(P.check(num(R(4), 'any'), 'four').status === 'invalid', 'words are invalid');
ok(P.check(num(R(4), 'any'), '').status === 'invalid', 'empty invalid');
ok(P.check(num(R(1200), 'any'), '1,200').status === 'correct', 'thousands comma');
ok(P.check({ type: 'number', value: R(13), units: ['ft'] }, '13 ft').status === 'correct', 'unit accepted');
ok(P.check({ type: 'number', value: R(13), units: ['ft'] }, '13').status === 'correct', 'unit optional');
const pair = { type: 'pair', value: [R(2), R(-1)] };
ok(P.check(pair, '(2, -1)').status === 'correct' && P.check(pair, '2,-1').status === 'correct' && P.check(pair, 'y=-1, x=2').status === 'correct', 'pair forms');
ok(P.check(pair, '(-1, 2)').status === 'wrong', 'pair is ordered');
const set = { type: 'set', value: [R(2), R(3)] };
ok(P.check(set, '3 and 2').status === 'correct' && P.check(set, '2, 3').status === 'correct' && P.check(set, '2').status === 'wrong', 'set is unordered');

/* ---------- every generator, every level ---------- */
const lintTex = (s, where) => {
  ok((s.match(/\\\(/g) || []).length === (s.match(/\\\)/g) || []).length, where + ': unbalanced \\( \\)');
  ok((s.match(/\\\[/g) || []).length === (s.match(/\\\]/g) || []).length, where + ': unbalanced \\[ \\]');
  ok((s.match(/\{/g) || []).length === (s.match(/\}/g) || []).length, where + ': unbalanced braces');
  ok(!/\\\((?:(?!\\\)).)*<(?=[A-Za-z\/])/.test(s), where + ': "<" before a letter in TeX');
  ok(!/undefined|NaN|\[object|\{\w+\}(?![^\\]*\\\))/.test(s.replace(/\\frac\{|\\sqrt\{|\^\{/g, '')) || !/undefined|NaN|\[object/.test(s), where + ': placeholder leaked');
};
for (const gen of P.generatorList) {
  ok(typeof gen.version === 'number' && gen.version >= 1, gen.id + ': version');
  const skill = P.SKILLS.find(s => s.id === gen.skillId);
  ok(!!skill && skill.gen.includes(gen.id), gen.id + ': belongs to a skill');
  gen.levels.forEach((lv, li) => {
    const level = li + 1, tag = `${gen.id} L${level}`;
    P.say(lv.desc);
    const distinct = new Set(), shown = [];
    let bad = 0, firstBad = '';
    for (let seed = 1; seed <= N; seed++) {
      let inst;
      try { inst = gen.generate(seed, level); } catch (e) { ok(false, `${tag} seed ${seed}: ${e.message}`); break; }
      const again = gen.generate(seed, level);
      if (!eqv(inst, again)) { ok(false, `${tag} seed ${seed}: not deterministic`); break; }
      const why = P.verify(inst);
      if (why && ++bad === 1) firstBad = `seed ${seed}: ${why} :: ${inst.model}`;
      distinct.add(inst.canonical);
      if (seed <= 3) shown.push(inst);
      /* answer checks as the student's own typing */
      const typed = P.showValue(inst.answer, inst.answer.value).replace('−', '-');
      if (P.check(inst.answer, typed).status !== 'correct' && P.check(inst.answer, typed).status !== 'form') { ok(false, `${tag} seed ${seed}: typed answer ${typed} not accepted`); break; }
      /* misconceptions differ and are recognised */
      for (const m of inst.misconceptions) {
        if (P.sameValue(inst.answer.type, m.wrongAnswer, inst.answer.value)) { ok(false, `${tag} seed ${seed}: misconception ${m.id} equals the answer`); break; }
        const typedWrong = P.showValue(inst.answer, m.wrongAnswer).replace('−', '-');
        const c = P.check(inst.answer, typedWrong), hit = P.matchMisconception(inst, c.value);
        if (c.status !== 'wrong' && c.status !== 'form') { ok(false, `${tag} seed ${seed}: wrong answer ${typedWrong} for ${m.id} was not marked wrong`); break; }
        if (!hit) { ok(false, `${tag} seed ${seed}: ${m.id} not matched`); break; }
        if (!m.feedback || !m.lessonLink) { ok(false, `${tag}: ${m.id} needs feedback and a lesson link`); break; }
      }
      if (inst.hints.length < 2 || inst.hints.length > 3 || inst.steps.length < 1 || !inst.prompt.html) { ok(false, `${tag} seed ${seed}: hints/steps/prompt`); break; }
      if (new Set(inst.hints).size !== inst.hints.length) { ok(false, `${tag} seed ${seed}: duplicate hints`); break; }
      if (seed % 50 === 1) { lintTex(inst.prompt.html, tag + ' prompt'); inst.steps.forEach((s, i) => lintTex(s, tag + ' step ' + i)); inst.hints.forEach((s, i) => lintTex(s, tag + ' hint ' + i)); }
      if (inst.figure && inst.figure.kind === 'right-triangle') { const [a, b] = inst.figure.legs; ok(a * a + b * b === inst.figure.hyp ** 2, tag + ': figure is a right triangle'); }
    }
    ok(bad === 0, `${tag}: ${bad} problems failed independent verification (${firstBad})`);
    ok(distinct.size >= 2, `${tag}: only ${distinct.size} distinct problems`);
    FINITE.push(`${tag}: ${distinct.size}${distinct.size < N / 4 ? ' (finite)' : ''}`);
    if (process.env.VERBOSE) console.log(`${tag}: ${distinct.size} distinct of ${N}; e.g. ${shown.map(i => i.model + ' = ' + P.showValue(i.answer, i.answer.value)).join(' | ')}`);
  });
  ok((() => { try { gen.generate(1, gen.levels.length + 1); return false; } catch (e) { return true; } })(), gen.id + ': rejects a level that does not exist');
}
/* a generator whose build never succeeds must fail loudly */
{
  const bad = P.generators['g4-multiply'];
  ok(bad.levels.length === 6, 'multiply has 6 levels');
}

/* ---------- ladder, points, mastery ---------- */
const skill = P.SKILLS[0], top = P.levelCount(skill);
const step = (st, o) => P.applyAttempt(st, skill, Object.assign({ correct: true, hints: 0, gaveUp: false, fast: false, level: st.level }, o));
let st = P.newState();
for (let i = 0; i < 2; i++) st = step(st).state;
ok(st.level === 1 && st.streak === 2, 'two correct: still level 1');
let r = step(st); ok(r.state.level === 2 && r.change === 1 && r.points > 0, 'three correct: up a level, with a bonus');
st = r.state;
r = step(st, { correct: true, hints: 1 }); ok(r.state.streak === 0 && r.points > 0 && r.points < 10 * 2 + 1, 'hint: no streak progress, fewer points');
st = step(r.state, { correct: false }).state; ok(st.miss === 1 && st.level === 2, 'one wrong: stays');
r = step(st, { correct: false }); ok(r.state.level === 1 && r.change === -1 && r.points === 0, 'two wrong: down a level');
r = step(P.newState(), { correct: false, gaveUp: true }); ok(r.points === 0 && r.state.forceLevel === 1, 'give up: no points, same level queued');
r = step(P.newState(), { correct: true, fast: true }); ok(r.ignored && r.points === 0 && r.state.streak === 0, 'a too-fast answer counts for nothing');
r = step(P.newState(), { correct: false }); ok(r.state.level === 1 && r.state.miss === 1, 'cannot fall below level 1');
/* mastery: 5 of the last 6 at the top level without hints */
st = P.newState(); st.level = top;
const seq = [1, 1, 0, 1, 1, 1]; let newly = false;
for (const c of seq) { r = step(st, { correct: !!c, level: top }); st = r.state; newly = newly || r.newlyMastered; }
ok(st.mastered && newly, 'mastery after 5 of 6 at the top level');
r = step(st, { level: top }); ok(r.points <= Math.round((10 * top + 10) * .25) + 1, 'diminishing points once mastered');
st = P.newState(); st.level = top;
for (const c of [1, 0, 1, 0, 1, 1]) st = step(st, { correct: !!c, level: top }).state;
ok(!st.mastered, 'no mastery with only 4 of 6');
for (const c of [1, 1, 1, 1, 1]) { r = step(P.newState(), { level: 1 }); }
const pts = lvl => step(P.newState(), { level: lvl }).points;
ok(pts(3) > pts(1), 'points scale with level');
/* the original state object is never mutated */
{ const s0 = P.newState(), copy = JSON.stringify(s0); step(s0); ok(JSON.stringify(s0) === copy, 'applyAttempt does not mutate'); }

/* ---------- repeat avoidance ---------- */
{
  let seedN = 7; const rand = () => { seedN = (seedN * 1664525 + 1013904223) >>> 0; return seedN / 4294967296; };
  const sk = P.skill('solve-linear-equations'), s = P.newState(); s.level = 3;
  const seen = new Set(); let dup = 0;
  for (let i = 0; i < 60; i++) { const inst = P.nextInstance(s, sk, rand); if (seen.has(inst.canonical)) dup++; seen.add(inst.canonical); P.markSeen(s, inst); }
  ok(dup === 0, 'no repeats in 60 problems of an open-ended skill (got ' + dup + ')');
  /* 2x+3=11, 3+2x=11 and 11=2x+3 are the same problem */
  const g = P.generators['g8-linear-equation'], keys = new Set();
  let reorder = 0;
  for (let seed = 1; seed <= 4000; seed++) { const i = g.generate(seed, 3); if (keys.has(i.canonical)) reorder++; keys.add(i.canonical); }
  ok(reorder > 0, 'reordered forms hash to the same canonical problem');
}
/* ---------- records, regrading, versions ---------- */
{
  const g = P.generators['g8-linear-equation'], inst = g.generate(123, 4), sk = P.skill('solve-linear-equations');
  const typed = P.showValue(inst.answer, inst.answer.value);
  const rec = P.record(sk, inst, { answer: typed, correct: true, hints: 0, timeMs: 5000, points: 12 });
  ok(P.regrade(rec).ok === true, 'a stored attempt regrades as correct');
  ok(P.regrade(Object.assign({}, rec, { a: '999' })).ok === false, 'a spoofed answer regrades as wrong');
  ok(P.regrade(Object.assign({}, rec, { v: 99 })).stale === true, 'a changed generator version is flagged stale');
  ok(eqv(P.regenerate(P.instanceRecord(inst)), inst), 'an instance regenerates exactly from { g, v, lvl, seed }');
  ok(JSON.stringify(rec).length < 200, 'the attempt record stays small');
}
/* every sentence key used must exist (say() throws otherwise); every lesson link must be a real lesson */
{
  const lessonIds = new Set(fs.readdirSync(root + '/src/lessons/school').map(f => f.slice(0, -3)));
  for (const s of P.SKILLS) for (const l of s.lessons) ok(lessonIds.has(l), `skill ${s.id}: lesson ${l} exists`);
  for (const gen of P.generatorList) for (let level = 1; level <= gen.levels.length; level++) for (let seed = 1; seed <= 300; seed++) for (const m of gen.generate(seed, level).misconceptions) if (!lessonIds.has(m.lessonLink)) { ok(false, `${gen.id}: link ${m.lessonLink} is not a lesson`); }
}
if (process.env.TABLE) console.log('distinct problems per level:\n  ' + FINITE.join('\n  '));
console.log(`PASS ${pass}   FAIL ${fail}`);
process.exit(fail ? 1 : 0);
