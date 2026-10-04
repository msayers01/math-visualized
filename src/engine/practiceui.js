/* =====================================================================
   PRACTICE (page): pick a skill, then an endless run of generated problems.
   The logic (generators, checkers, ladder, points) is in src/practice/ and is tested in Node; this file only draws it.
   Stored on this device only (localStorage, with an in-memory fallback): no name, no account, nothing is sent anywhere.
   Per skill: the ladder state. Plus a short log of attempts, each small enough to regenerate from its { generator, version, level, seed }.
   ===================================================================== */
const PracticeStore = (() => {
  const KEY = 'continuum-practice-v1', LOG_MAX = 300;
  let mem = { skills: {}, log: [] }, failed = false;
  const tidyState = s => {
    const base = Practice.newState();
    if (!s || typeof s !== 'object') return base;
    for (const k of ['level', 'streak', 'miss', 'totalPoints', 'lastPracticed', 'attempts', 'forceLevel']) if (Number.isFinite(+s[k])) base[k] = Math.max(0, +s[k]);
    base.level = Math.max(1, base.level);
    base.mastered = !!s.mastered; base.placed = !!s.placed;
    for (const k of ['topRecent', 'recentSeeds', 'recentHashes']) if (Array.isArray(s[k])) base[k] = s[k].slice(-80);
    return base;
  };
  const load = () => {
    if (failed) return mem;
    try {
      const d = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!d || typeof d !== 'object') return mem;
      const out = { skills: {}, log: Array.isArray(d.log) ? d.log.filter(r => r && typeof r.g === 'string' && Number.isInteger(r.seed)).slice(-LOG_MAX) : [] };
      for (const [id, s] of Object.entries(d.skills || {})) out.skills[id] = tidyState(s);
      return (mem = out);
    } catch (e) { return mem; }
  };
  const save = d => { mem = d; try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { failed = true; } };
  return {
    state(id) { const d = load(); return d.skills[id] ? tidyState(d.skills[id]) : Practice.newState(); },
    put(id, state, rec) { const d = load(); d.skills[id] = state; if (rec) { d.log.push(rec); if (d.log.length > LOG_MAX) d.log.shift(); } save(d); },
    log() { return load().log.slice(); },
    total() { return Object.values(load().skills).reduce((t, s) => t + (s.totalPoints || 0), 0); },
    reset() { save({ skills: {}, log: [] }); },
    storageOk() { return !failed; }
  };
})();

/* A right triangle drawn from the problem's own numbers, so the picture can never disagree with the text. */
function practiceFigure(fig) {
  const [a, b] = fig.legs, W = 240, H = 170, pad = 34, s = Math.min((W - 2 * pad) / a, (H - 2 * pad) / b);
  const w = a * s, hh = b * s, x0 = (W - w) / 2, y0 = H - pad, q = 12;
  const NS = 'http://www.w3.org/2000/svg', el = (t, at, txt) => { const e = document.createElementNS(NS, t); for (const k in at) e.setAttribute(k, at[k]); if (txt != null) e.textContent = txt; return e; };
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'pr-fig', role: 'img', 'aria-label': `Right triangle. The legs are ${fig.unknown === 'a' ? 'unknown' : a} and ${fig.unknown === 'b' ? 'unknown' : b}. The hypotenuse is ${fig.unknown === 'c' ? 'unknown' : fig.hyp}.` });
  svg.append(el('polygon', { points: `${x0},${y0} ${x0 + w},${y0} ${x0},${y0 - hh}`, fill: 'color-mix(in srgb, var(--blue) 14%, transparent)', stroke: 'var(--blue)', 'stroke-width': 2, 'stroke-linejoin': 'round' }));
  svg.append(el('polyline', { points: `${x0 + q},${y0} ${x0 + q},${y0 - q} ${x0},${y0 - q}`, fill: 'none', stroke: 'var(--muted)', 'stroke-width': 1.5 }));
  const label = (x, y, txt, anchor) => svg.append(el('text', { x, y, 'text-anchor': anchor, fill: 'var(--text)', 'font-size': 16, 'font-family': 'var(--sans)', 'font-weight': 600 }, txt));
  label(x0 + w / 2, y0 + 20, fig.unknown === 'a' ? '?' : a, 'middle');
  label(x0 - 10, y0 - hh / 2 + 5, fig.unknown === 'b' ? '?' : b, 'end');
  label(x0 + w / 2 + 12, y0 - hh / 2 - 6, fig.unknown === 'c' ? '?' : fig.hyp, 'start');
  return svg;
}

function renderPractice(app, skillId) {
  const skill = skillId && Practice.skill(skillId);
  document.title = (skill ? skill.title + ' | ' : '') + 'Practice | Continuum';
  return skill ? practiceSession(app, skill) : practicePicker(app);
}

function practicePicker(app) {
  const wrap = h('div', { class: 'wrap pr-page' });
  wrap.append(h('h1', { class: 'display pr-title' }, 'Practice'),
    h('p', { class: 'lede pr-lede' }, 'Pick a skill. Every problem is made fresh, so you can keep going. Get problems right and they get harder. Your points stay on this device.'));
  const total = PracticeStore.total();
  wrap.append(h('p', { class: 'pr-total', 'aria-live': 'polite' }, `Total points: ${total}`));
  if (!PracticeStore.storageOk()) wrap.append(h('p', { class: 'pr-warn', role: 'status' }, 'This browser is not saving your practice, so it will be lost when you close the tab.'));
  for (const c of COURSES) {
    const skills = Practice.SKILLS.filter(s => s.course === c.id);
    if (!skills.length) continue;
    wrap.append(h('section', { class: 'pr-course', 'aria-label': c.name }, h('h2', { class: 'pr-course-h' }, c.name),
      skills.map(s => {
        const st = PracticeStore.state(s.id), top = Practice.levelCount(s);
        return h('a', { class: 'pr-card', href: '#practice~' + s.id },
          h('span', { class: 'pr-unit' }, s.unit),
          h('span', { class: 'pr-card-t' }, s.title),
          h('span', { class: 'pr-card-b' }, s.blurb),
          h('span', { class: 'pr-card-m' }, st.attempts ? `Level ${st.level} of ${top}` : 'Not started', ` · ${st.totalPoints} points`, st.mastered ? h('span', { class: 'pr-badge' }, '★ Mastered') : null));
      })));
  }
  /* the audit trail, put to use: the last few misconceptions, regenerated from their records, with a lesson to revisit */
  const seen = [], slips = [];
  for (const rec of PracticeStore.log().reverse()) {
    if (!rec.mc || seen.includes(rec.g + rec.mc)) continue;
    const inst = Practice.regenerate(rec), m = inst && inst.misconceptions.find(x => x.id === rec.mc);
    if (!m) continue;
    seen.push(rec.g + rec.mc); slips.push(h('li', {}, m.feedback + ' ', VIZ.some(v => v.id === m.lessonLink) ? h('a', { href: lessonToken(m.lessonLink) }, 'Review: ' + VIZ.find(v => v.id === m.lessonLink).title) : null));
    if (slips.length >= 5) break;
  }
  if (slips.length) wrap.append(h('section', { class: 'pr-slips', 'aria-label': 'Mistakes to review' }, h('h2', { class: 'pr-course-h' }, 'Mistakes to review'), h('ul', {}, slips)));
  app.append(wrap);
  return () => {};
}

function practiceSession(app, skill) {
  const top = Practice.levelCount(skill), keypad = ['grade4', 'grade5', 'grade6'].includes(skill.course);
  let state = PracticeStore.state(skill.id), inst = null, t0 = 0, hints = 0, answered = false, hintBox = null;
  const startLevel = state.level, session = { solved: 0, tried: 0, points: 0, misc: {} };
  const wrap = h('div', { class: 'wrap pr-page' });
  const back = h('a', { class: 'pr-back', href: '#practice' }, '← All skills');
  const lvl = h('span', { class: 'pr-stat-v' }), lvlDesc = h('p', { class: 'pr-lvldesc' }), pips = h('span', { class: 'pr-pips', role: 'img' }),
    sPts = h('span', { class: 'pr-stat-v' }), tPts = h('span', { class: 'pr-stat-v' });
  const stat = (k, v) => h('div', { class: 'pr-stat' }, h('span', { class: 'pr-stat-k' }, k), v);
  const head = h('div', { class: 'pr-head' }, h('h1', { class: 'display pr-title' }, skill.title),
    h('div', { class: 'pr-stats' }, stat('Level', lvl), stat('This session', sPts), stat('Total points', tPts), stat('Streak to next level', pips)), lvlDesc);
  const promptEl = h('div', { class: 'pr-prompt', id: 'pr-prompt' }), figEl = h('div', { class: 'pr-figwrap' });
  const input = h('input', { type: 'text', id: 'pr-answer', class: 'pr-input', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', inputmode: keypad ? 'none' : 'text', 'aria-describedby': 'pr-help pr-echo' });
  const help = h('p', { class: 'pr-help', id: 'pr-help' }), echo = h('p', { class: 'pr-echo', id: 'pr-echo', 'aria-live': 'polite' });
  const fb = h('div', { class: 'pr-fb', role: 'status', 'aria-live': 'polite', tabindex: '-1' });
  const stepsEl = h('div', { class: 'pr-steps' });
  const btnCheck = h('button', { type: 'button', class: 'btn primary', onclick: () => check() }, 'Check'),
    btnHint = h('button', { type: 'button', class: 'btn', onclick: () => hint() }, 'Hint'),
    btnSol = h('button', { type: 'button', class: 'btn', onclick: () => giveUp() }, 'Show solution'),
    btnNext = h('button', { type: 'button', class: 'btn primary', onclick: () => next() }, 'Next problem'),
    btnEnd = h('button', { type: 'button', class: 'btn', onclick: () => summary() }, 'End session');
  btnNext.hidden = true;
  const insert = ch => {
    const a = input.selectionStart ?? input.value.length, b = input.selectionEnd ?? a;
    if (ch === 'back') { const s = a === b ? Math.max(0, a - 1) : a; input.value = input.value.slice(0, s) + input.value.slice(b); input.setSelectionRange(s, s); }
    else { input.value = input.value.slice(0, a) + ch + input.value.slice(b); input.setSelectionRange(a + ch.length, a + ch.length); }
    input.dispatchEvent(new Event('input')); input.focus();
  };
  const KEYS = [['7', '7'], ['8', '8'], ['9', '9'], ['4', '4'], ['5', '5'], ['6', '6'], ['1', '1'], ['2', '2'], ['3', '3'], ['−', '-', 'minus'], ['0', '0'], ['/', '/', 'fraction bar'], ['.', '.', 'decimal point'], [' ', ' ', 'space'], ['⌫', 'back', 'backspace']];
  const pad = keypad ? h('div', { class: 'pr-keypad', role: 'group', 'aria-label': 'Number keypad' }, KEYS.map(([label, ch, aria]) => h('button', { type: 'button', class: 'pr-key', 'aria-label': aria || label, onclick: () => insert(ch) }, label === ' ' ? '␣' : label))) : null;
  const answerBox = h('div', { class: 'pr-answer' }, h('label', { for: 'pr-answer', class: 'pr-label' }, 'Your answer'), input, help, echo, pad,
    h('div', { class: 'btns pr-btns' }, btnCheck, btnHint, btnSol, btnNext));
  const card = h('section', { class: 'pr-card-main', 'aria-label': 'Problem' }, promptEl, figEl, answerBox, fb, stepsEl);
  wrap.append(back, head, card, h('div', { class: 'btns pr-foot' }, btnEnd));
  app.append(wrap);

  const draw = () => {
    lvl.textContent = `${state.level} of ${top}`;
    lvlDesc.textContent = Practice.say(Practice.generatorsOf(skill)[0].levels[state.level - 1].desc);
    const have = Math.min(state.streak, Practice.LADDER.up);
    pips.textContent = ''; pips.setAttribute('aria-label', `${have} of ${Practice.LADDER.up} correct in a row`);
    for (let i = 0; i < Practice.LADDER.up; i++) pips.append(h('span', { class: 'pr-pip' + (i < have ? ' on' : '') }));
    if (state.mastered) pips.append(h('span', { class: 'pr-badge' }, '★ Mastered'));
    sPts.textContent = session.points; tPts.textContent = state.totalPoints;
    if (window.__practice) window.__practice.state = state;
  };
  const setFb = (kind, html) => { fb.className = 'pr-fb ' + kind; fb.innerHTML = html; typeset(fb); };
  function load() {
    inst = Practice.nextInstance(state, skill);
    Practice.markSeen(state, inst); PracticeStore.put(skill.id, state);
    hints = 0; answered = false; hintBox = null; t0 = performance.now();
    promptEl.innerHTML = inst.prompt.html; typeset(promptEl);
    figEl.replaceChildren(inst.figure ? practiceFigure(inst.figure) : '');
    help.textContent = inst.answer.help; echo.textContent = ''; input.value = ''; input.disabled = false;
    fb.className = 'pr-fb'; fb.textContent = ''; stepsEl.replaceChildren();
    btnCheck.hidden = btnSol.hidden = false; btnNext.hidden = true; btnHint.hidden = false; btnHint.disabled = false; btnHint.textContent = 'Hint';
    draw(); window.__practice = { skill, inst, state };   /* the current problem, for the tests */
    input.focus({ preventScroll: true });
  }
  function hint() {
    if (answered || hints >= inst.hints.length) return;
    hints++;
    if (!hintBox) { hintBox = h('ol', { class: 'pr-hints' }); stepsEl.prepend(h('div', { class: 'pr-hintwrap' }, h('h2', { class: 'pr-h2' }, 'Hints'), hintBox)); }
    const li = h('li', { html: inst.hints[hints - 1] }); hintBox.append(li); typeset(li);
    btnHint.textContent = hints < inst.hints.length ? `Hint (${hints} of ${inst.hints.length} used)` : `All ${inst.hints.length} hints used`;
    btnHint.disabled = hints >= inst.hints.length;
  }
  const showSteps = open => {
    const d = h('details', { class: 'pr-solution' }, h('summary', {}, 'Show steps'), h('ol', {}, inst.steps.map(s => h('li', { html: s }))));
    if (open) d.open = true;
    stepsEl.append(d); typeset(d);
  };
  const lessonLinks = () => skill.lessons.filter(id => VIZ.some(v => v.id === id)).map(id => h('a', { href: lessonToken(id) }, VIZ.find(v => v.id === id).title));
  function finish(o) {   /* o: { correct, gaveUp, answer, misconception } */
    answered = true;
    const ms = performance.now() - t0, fast = o.correct && !o.gaveUp && !hints && ms < Practice.generators[inst.generatorId].minTimeMs;
    const out = Practice.applyAttempt(state, skill, { correct: o.correct, hints, gaveUp: !!o.gaveUp, fast, level: inst.level });
    state = out.state;
    const rec = Practice.record(skill, inst, { answer: o.answer, correct: o.correct && !o.gaveUp, hints, misconception: o.misconception, timeMs: ms, points: out.points, gaveUp: o.gaveUp });
    PracticeStore.put(skill.id, state, rec);
    session.tried++; if (o.correct && !o.gaveUp) session.solved++; session.points += out.points;
    if (o.misconception) session.misc[o.misconception] = (session.misc[o.misconception] || 0) + 1;
    input.disabled = true; btnCheck.hidden = btnSol.hidden = btnHint.hidden = true; btnNext.hidden = false;
    draw();
    return { out, fast };
  }
  function check() {
    if (answered) return;
    const r = Practice.check(inst.answer, input.value);
    if (r.status === 'invalid') { setFb('no', r.reason === 'empty' ? 'Type an answer first. ' + escapeHtml(inst.answer.help) : 'I could not read that. ' + escapeHtml(inst.answer.help)); input.focus(); return; }
    if (r.status === 'form') { setFb('warn', '<b>Nearly.</b> ' + escapeHtml(Practice.T['form.simplify'])); input.focus(); return; }
    const correct = r.status === 'correct', m = correct ? null : Practice.matchMisconception(inst, r.value);
    const { out, fast } = finish({ correct, answer: input.value, misconception: m && m.id });
    let msg;
    if (correct) {
      const bits = [];
      if (fast) bits.push('That was very quick, so it did not count toward points or levels. Read each problem, then answer.');
      else bits.push(`<b>Correct.</b> +${out.points} point${out.points === 1 ? '' : 's'}.`);
      if (out.change > 0) bits.push(`Level up! You are on level ${state.level}.`);
      if (out.newlyMastered) bits.push('You have mastered this skill. Keep going, or try mixed practice later.');
      msg = bits.join(' ');
    } else {
      msg = `<b>Not quite.</b> The answer is ${escapeHtml(Practice.showValue(inst.answer, inst.answer.value))}. `;
      if (m) { msg += escapeHtml(m.feedback) + ' '; const l = VIZ.find(v => v.id === m.lessonLink); if (l) msg += `<a href="${lessonToken(l.id)}">Review: ${escapeHtml(l.title)}</a>`; }
      if (out.change < 0) msg += ` Let's go back to level ${state.level} for a bit.`;
    }
    setFb(correct ? 'ok' : 'no', msg);
    showSteps(!correct);
    btnNext.focus();
  }
  function giveUp() {
    if (answered) return;
    finish({ correct: false, gaveUp: true, answer: input.value });
    setFb('no', `<b>Here is the solution.</b> The answer is ${escapeHtml(Practice.showValue(inst.answer, inst.answer.value))}. No points for this one. Next you get a similar problem.`);
    showSteps(true);
    btnNext.focus();
  }
  function next() { load(); }
  function summary() {
    const mis = Object.entries(session.misc);
    const sample = id => { for (const rec of PracticeStore.log().reverse()) { if (rec.s === skill.id && rec.mc === id) { const i = Practice.regenerate(rec); const m = i && i.misconceptions.find(x => x.id === id); if (m) return m; } } return null; };
    wrap.replaceChildren(back, h('h1', { class: 'display pr-title' }, 'Session summary'),
      h('p', { class: 'pr-sum' }, `You solved ${session.solved} of ${session.tried} problem${session.tried === 1 ? '' : 's'} and earned ${session.points} points.`),
      h('p', { class: 'pr-sum' }, state.level > startLevel ? `You moved up from level ${startLevel} to level ${state.level}.` : state.level < startLevel ? `You moved from level ${startLevel} to level ${state.level} to build up.` : `You stayed at level ${state.level} of ${top}.`),
      mis.length ? h('section', { class: 'pr-slips' }, h('h2', { class: 'pr-course-h' }, 'Mistakes to review'),
        h('ul', {}, mis.map(([id, n]) => { const m = sample(id), l = m && VIZ.find(v => v.id === m.lessonLink); return h('li', {}, `${m ? m.feedback : id} (${n} time${n === 1 ? '' : 's'}) `, l ? h('a', { href: lessonToken(l.id) }, 'Review: ' + l.title) : null); }))) : null,
      lessonLinks().length && !mis.length ? h('p', {}, 'Lessons for this skill: ', lessonLinks().flatMap((a, i) => i ? [', ', a] : [a])) : null,
      h('div', { class: 'btns' }, h('button', { type: 'button', class: 'btn primary', onclick: () => route() }, 'Practice again'), h('a', { class: 'btn', href: '#practice' }, 'All skills')));
    const hd = wrap.querySelector('h1'); hd.setAttribute('tabindex', '-1'); hd.focus({ preventScroll: true });
  }
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
  input.addEventListener('input', () => {
    if (answered || !inst) return;
    const r = Practice.parseAnswer(inst.answer, input.value);
    echo.textContent = !input.value.trim() ? '' : r.error ? 'I cannot read this yet.' : 'Reading your answer as ' + Practice.showValue(inst.answer, r.value) + '.';
  });
  load();
  return () => { delete window.__practice; };
}
const escapeHtml = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
