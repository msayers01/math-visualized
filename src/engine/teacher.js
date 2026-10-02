/* =====================================================================
   TEACHER TOOLS: progress chips and page, printable exit tickets
   ===================================================================== */

/* "Steps 3/4, checks 1/2" for one lesson, kept current with update() */
function ProgressChip(v) {
  const el = h('span', { class: 'prog' });
  const update = () => {
    const s = Progress.status(v);
    el.className = 'prog ' + s.state; el.hidden = s.state === 'new';
    el.textContent = s.state === 'done' ? 'Complete' : s.st || s.ck ? `Steps ${s.seen}/${s.st} · Checks ${s.right}/${s.ck}` : 'Opened';
  };
  update();
  return { el, update };
}

/* Progress page: every lesson, grouped by level and course, a copyable summary, print, and reset */
function renderProgress(app) {
  document.title = 'My progress | Continuum';
  const rows = VIZ.slice();
  const name = h('input', { type: 'text', id: 'student-name', class: 'fsel name-in', value: Progress.name(), placeholder: 'Optional', autocomplete: 'off' });
  const who = h('p', { class: 'print-only prog-who' }, Progress.name() ? 'Student: ' + Progress.name() : '');
  name.addEventListener('input', () => { Progress.setName(name.value.trim()); who.textContent = name.value.trim() ? 'Student: ' + name.value.trim() : ''; });
  const body = h('div', { class: 'prog-body' }), total = h('p', { class: 'prog-total', 'aria-live': 'polite' });
  const draw = () => {
    const st = new Map(rows.map(v => [v.id, Progress.status(v)])), frag = document.createDocumentFragment();   /* one read per lesson */
    const done = rows.filter(v => st.get(v.id).state === 'done').length;
    total.textContent = `${done} of ${rows.length} lessons complete`;
    for (const l of LEVEL_ORDER) {
      const inLevel = rows.filter(v => v.level === l);
      if (!inLevel.length) continue;
      frag.append(h('h2', { class: 'prog-level' }, LEVELS[l].name, h('span', { class: 'n' }, `${inLevel.filter(v => st.get(v.id).state === 'done').length} of ${inLevel.length} complete`)));
      for (const c of COURSES.filter(c => c.level === l)) {
        const items = inLevel.filter(v => v.course === c.id);
        if (!items.length) continue;
        frag.append(h('section', { class: 'course', 'aria-label': c.name }, h('h3', { class: 'course-head' }, c.name,
          h('span', { class: 'n' }, `${items.filter(v => st.get(v.id).state === 'done').length} of ${items.length}`)),
          h('ul', { class: 'prog-list' }, items.map(v => {
            const s = st.get(v.id);
            return h('li', { class: 'prog-row ' + s.state },
              h('a', { href: lessonToken(v.id) }, v.title),
              h('span', { class: 'n' }, `Steps ${s.seen}/${s.st}`), h('span', { class: 'n' }, `Checks ${s.right}/${s.ck}`),
              h('span', { class: 'prog ' + s.state }, s.state === 'done' ? 'Complete' : s.state === 'started' ? 'In progress' : 'Not started'));
          }))));
      }
    }
    body.replaceChildren(frag);
  };
  draw();
  const closeSure = focusBtn => { sure.hidden = true; resetBtn.hidden = false; if (focusBtn) resetBtn.focus(); };
  const keep = h('button', { type: 'button', class: 'btn small', onclick: () => closeSure(true) }, 'Keep it');
  const sure = h('span', { class: 'sure', role: 'group', 'aria-label': 'Confirm reset', hidden: '', onkeydown: e => { if (e.key === 'Escape') closeSure(true); } }, 'Erase all progress on this device? ',
    h('button', { type: 'button', class: 'btn small', onclick: () => { Progress.reset(); draw(); closeSure(true); } }, 'Yes, erase'), keep);
  const resetBtn = h('button', { type: 'button', class: 'btn small', onclick: () => { sure.hidden = false; resetBtn.hidden = true; keep.focus(); } }, 'Reset progress');
  app.append(h('article', { class: 'wrap viz progress-page' },
    h('nav', { class: 'crumbs no-print', 'aria-label': 'Breadcrumb' }, h('a', { href: '#/' }, 'Continuum'), h('span', { 'aria-hidden': 'true' }, '/'), h('span', {}, 'My progress')),
    h('header', { class: 'viz-head' }, h('h1', { class: 'display' }, 'My progress'),
      h('p', { class: 'lede' }, 'Saved in this browser only. To hand progress to a teacher, copy the summary below and paste it into an email or an assignment.')),
    Progress.storageOk() ? null : h('p', { class: 'prog-warn', role: 'status' }, 'This browser is not keeping progress (private or blocked storage). What you do now is lost when you close this tab, so copy the summary before you leave.'),
    h('div', { class: 'prog-tools no-print' },
      h('label', { class: 'facet', for: 'student-name' }, h('span', { class: 'facet-k' }, 'Name for the summary'), name),
      h('div', { class: 'prog-actions' },
        CopyButton('Copy summary', () => Progress.summary(VIZ), { cls: 'btn primary small' }),
        canPrint ? h('button', { type: 'button', class: 'btn small', onclick: () => window.print() }, 'Print') : null, resetBtn, sure)),
    who, total, body));
  return () => {};
}

/* The answer key and other teacher views wait behind the teacher password (see teachermode.js) */
function renderLockedKey(app, v) {
  document.title = 'Teacher mode | Continuum';
  app.append(h('article', { class: 'wrap viz teacher-page' },
    h('nav', { class: 'crumbs', 'aria-label': 'Breadcrumb' }, h('a', { href: '#/' }, 'Continuum'), h('span', { 'aria-hidden': 'true' }, '/'),
      h('a', { href: lessonToken(v.id) }, v.title), h('span', { 'aria-hidden': 'true' }, '/'), h('span', {}, 'Answer key')),
    h('h1', { class: 'display' }, 'Answer key'),
    h('p', { class: 'lede' }, 'The answer key is for teachers. Enter the teacher password to unlock it on this device.'),
    TeacherLogin(() => {}),
    h('p', { class: 'n' }, 'Students can still print the ticket without answers: ', h('a', { href: ticketToken(v.id, false) }, 'student version'), '.')));
  window.scrollTo(0, 0);
  const pw = document.getElementById('teacher-pw'); if (pw) pw.focus({ preventScroll: true });
  return () => {};
}

/* #teacher: unlock, or see that teacher mode is on and lock it */
function renderTeacher(app) {
  document.title = 'Teacher mode | Continuum';
  const on = TeacherMode.active() && TeacherMode.configured;
  app.append(h('article', { class: 'wrap viz teacher-page' },
    h('h1', { class: 'display' }, 'Teacher mode'),
    !TeacherMode.configured ? h('p', { class: 'lede' }, 'No teacher password is set on this copy of the site, so teacher views are open to everyone.')
    : on ? h('div', {}, h('p', { class: 'lede' }, 'Teacher mode is on for this device for the next few hours. Answer keys are unlocked.'),
        h('button', { type: 'button', class: 'btn', onclick: () => TeacherMode.lock() }, 'Lock teacher mode'),
        h('p', { class: 'n' }, h('a', { href: '#/' }, 'Back to all lessons')))
    : h('div', {}, h('p', { class: 'lede' }, 'Enter the teacher password to unlock answer keys on this device.'), TeacherLogin(() => {}))));
  window.scrollTo(0, 0);
  return () => {};
}

/* Printable exit ticket: the lesson's quick-check questions on one page, optionally with the answer key */
function renderTicket(app, v, key) {
  if (key && !TeacherMode.active()) return renderLockedKey(app, v);
  document.title = 'Exit ticket: ' + v.title + ' | Continuum';
  const qs = v.check || [], L = i => String.fromCharCode(65 + i);
  const text = () => [`Exit ticket: ${v.title}`, `${COURSE[v.course].name}`, 'Name: ____________________   Date: ____________', '',
    ...qs.flatMap((q, n) => [`${n + 1}. ${texToText(q.q)}`, ...q.choices.map((c, i) => `   ${L(i)}. ${texToText(c)}`), '']),
    ...(key ? ['Answer key', ...qs.map((q, n) => `${n + 1}. ${L(q.answer)}. ${texToText(q.why)}`)] : [])].join('\n');
  const sheet = h('section', { class: 'ticket-sheet', 'aria-label': 'Exit ticket' },
    h('div', { class: 'ticket-head' },
      h('p', { class: 'ticket-k' }, key ? 'Exit ticket: answer key' : 'Exit ticket'), h('h1', { class: 'display' }, v.title),
      h('p', { class: 'ticket-meta' }, COURSE[v.course].name + (v.standards.length ? ' · ' : ''), v.standards.length ? h('span', { class: 'stds' }, v.standards.map(c => StdChip(c))) : null)),
    key ? null : h('div', { class: 'ticket-who' }, h('span', {}, 'Name'), h('span', { class: 'line' }), h('span', {}, 'Date'), h('span', { class: 'line short' })),
    qs.length ? h('ol', { class: 'ticket-qs' }, qs.map(q => h('li', {},
      h('p', { class: 'tq', html: q.q }),
      h('ul', { class: 'tc' }, q.choices.map((c, i) => {
        const right = key && i === q.answer;   /* in the key the right choice is ringed twice and ticked, which survives black-and-white printing */
        return h('li', { class: right ? 'right' : '' }, h('span', { class: 'bub', 'aria-hidden': 'true' }, L(i)), h('span', { html: c }), right ? h('span', { class: 'tick-mark' }, '\u2713 correct') : null);
      }))))) : h('p', {}, 'This lesson has no quick-check questions yet.'),
    key && qs.length ? h('div', { class: 'ticket-key' }, h('h2', {}, 'Answer key'),
      h('ol', {}, qs.map(q => h('li', {}, h('b', {}, L(q.answer) + '. '), h('span', { html: q.why }))))) : null);
  app.append(h('article', { class: 'wrap viz ticket-page' + (key ? ' is-key' : '') },
    h('nav', { class: 'crumbs no-print', 'aria-label': 'Breadcrumb' }, h('a', { href: '#/' }, 'Continuum'), h('span', { 'aria-hidden': 'true' }, '/'),
      h('a', { href: lessonToken(v.id) }, v.title), h('span', { 'aria-hidden': 'true' }, '/'), h('span', {}, 'Exit ticket')),
    h('div', { class: 'ticket-tools no-print' },
      h('a', { class: 'btn small', href: ticketToken(v.id, false), ...(key ? {} : { 'aria-current': 'page' }) }, 'Student version'),
      h('a', { class: 'btn small', href: ticketToken(v.id, true), ...(key ? { 'aria-current': 'page' } : {}) }, 'With answer key (teachers)'),
      CopyButton('Copy as text', text),
      canPrint ? h('button', { type: 'button', class: 'btn primary small', onclick: () => window.print() }, 'Print or save as PDF') : h('span', { class: 'n' }, 'Open the site in its own tab to print.'),
      CopyButton('Copy link', () => shareUrl(ticketToken(v.id, key)))),
    sheet));
  typeset(sheet);
  window.scrollTo(0, 0);
  return () => {};
}
