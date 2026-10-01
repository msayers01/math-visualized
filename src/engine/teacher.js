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

/* Progress page: one row per lesson, a copyable summary, print, and reset */
function renderProgress(app) {
  document.title = 'My progress | Continuum';
  const level = 'school', rows = VIZ.filter(v => v.level === level);
  const name = h('input', { type: 'text', id: 'student-name', class: 'fsel name-in', value: Progress.name(), placeholder: 'Optional', autocomplete: 'off' });
  name.addEventListener('input', () => Progress.setName(name.value.trim()));
  const body = h('div', { class: 'prog-body' }), total = h('p', { class: 'prog-total', 'aria-live': 'polite' });
  const draw = () => {
    body.replaceChildren();
    const done = rows.filter(v => Progress.status(v).state === 'done').length;
    total.textContent = `${done} of ${rows.length} lessons complete`;
    for (const c of COURSES.filter(c => c.level === level)) {
      const items = rows.filter(v => v.course === c.id);
      if (!items.length) continue;
      body.append(h('section', { class: 'course' }, h('h3', { class: 'course-head' }, c.name),
        h('ul', { class: 'prog-list' }, items.map(v => {
          const s = Progress.status(v);
          return h('li', { class: 'prog-row ' + s.state },
            h('a', { href: lessonToken(v.id) }, v.title),
            h('span', { class: 'n' }, `Steps ${s.seen}/${s.st}`), h('span', { class: 'n' }, `Checks ${s.right}/${s.ck}`),
            h('span', { class: 'prog ' + s.state }, s.state === 'done' ? 'Complete' : s.state === 'started' ? 'In progress' : 'Not started'));
        }))));
    }
  };
  draw();
  const sure = h('span', { class: 'sure', hidden: '' }, 'Erase all progress on this device? ',
    h('button', { type: 'button', class: 'btn small', onclick: () => { Progress.reset(); sure.hidden = true; resetBtn.hidden = false; draw(); } }, 'Yes, erase'),
    h('button', { type: 'button', class: 'btn small', onclick: () => { sure.hidden = true; resetBtn.hidden = false; } }, 'Keep it'));
  const resetBtn = h('button', { type: 'button', class: 'btn small', onclick: () => { sure.hidden = false; resetBtn.hidden = true; } }, 'Reset progress');
  app.append(h('article', { class: 'wrap viz progress-page' },
    h('nav', { class: 'crumbs no-print', 'aria-label': 'Breadcrumb' }, h('a', { href: '#/' }, 'Continuum'), h('span', { 'aria-hidden': 'true' }, '/'), h('span', {}, 'My progress')),
    h('header', { class: 'viz-head' }, h('h1', { class: 'display' }, 'My progress'),
      h('p', { class: 'lede' }, 'Saved in this browser only. To hand progress to a teacher, copy the summary below and paste it into an email or an assignment.')),
    h('div', { class: 'prog-tools no-print' },
      h('label', { class: 'facet', for: 'student-name' }, h('span', { class: 'facet-k' }, 'Name for the summary'), name),
      h('div', { class: 'prog-actions' },
        CopyButton('Copy summary', () => Progress.summary(VIZ, level), { cls: 'btn primary small' }),
        canPrint ? h('button', { type: 'button', class: 'btn small', onclick: () => window.print() }, 'Print') : null, resetBtn, sure)),
    total, body));
  return () => {};
}

/* Printable exit ticket: the lesson's quick-check questions on one page, optionally with the answer key */
function renderTicket(app, v, key) {
  document.title = 'Exit ticket: ' + v.title + ' | Continuum';
  const qs = v.check || [], L = i => String.fromCharCode(65 + i);
  const text = () => [`Exit ticket: ${v.title}`, `${COURSE[v.course].name}`, 'Name: ____________________   Date: ____________', '',
    ...qs.flatMap((q, n) => [`${n + 1}. ${texToText(q.q)}`, ...q.choices.map((c, i) => `   ${L(i)}. ${texToText(c)}`), '']),
    ...(key ? ['Answer key', ...qs.map((q, n) => `${n + 1}. ${L(q.answer)}. ${texToText(q.why)}`)] : [])].join('\n');
  const sheet = h('section', { class: 'ticket-sheet', 'aria-label': 'Exit ticket' },
    h('div', { class: 'ticket-head' },
      h('p', { class: 'ticket-k' }, 'Exit ticket'), h('h1', { class: 'display' }, v.title),
      h('p', { class: 'ticket-meta' }, COURSE[v.course].name + (v.standards.length ? ' · ' : ''), v.standards.length ? h('span', { class: 'stds' }, v.standards.map(c => StdChip(c))) : null)),
    h('div', { class: 'ticket-who' }, h('span', {}, 'Name'), h('span', { class: 'line' }), h('span', {}, 'Date'), h('span', { class: 'line short' })),
    qs.length ? h('ol', { class: 'ticket-qs' }, qs.map(q => h('li', {},
      h('p', { class: 'tq', html: q.q }),
      h('ul', { class: 'tc' }, q.choices.map((c, i) => h('li', {}, h('span', { class: 'bub', 'aria-hidden': 'true' }, L(i)), h('span', { html: c }))))))) : h('p', {}, 'This lesson has no quick-check questions yet.'),
    key && qs.length ? h('div', { class: 'ticket-key' }, h('h2', {}, 'Answer key'),
      h('ol', {}, qs.map(q => h('li', {}, h('b', {}, L(q.answer) + '. '), h('span', { html: q.why }))))) : null);
  app.append(h('article', { class: 'wrap viz ticket-page' },
    h('nav', { class: 'crumbs no-print', 'aria-label': 'Breadcrumb' }, h('a', { href: '#/' }, 'Continuum'), h('span', { 'aria-hidden': 'true' }, '/'),
      h('a', { href: lessonToken(v.id) }, v.title), h('span', { 'aria-hidden': 'true' }, '/'), h('span', {}, 'Exit ticket')),
    h('div', { class: 'ticket-tools no-print' },
      h('a', { class: 'btn small', href: ticketToken(v.id, false), ...(key ? {} : { 'aria-current': 'page' }) }, 'Student version'),
      h('a', { class: 'btn small', href: ticketToken(v.id, true), ...(key ? { 'aria-current': 'page' } : {}) }, 'With answer key'),
      CopyButton('Copy as text', text),
      canPrint ? h('button', { type: 'button', class: 'btn primary small', onclick: () => window.print() }, 'Print or save as PDF') : h('span', { class: 'n' }, 'Open the site in its own tab to print.'),
      CopyButton('Copy link', () => shareUrl(ticketToken(v.id, key)))),
    sheet));
  typeset(sheet);
  window.scrollTo(0, 0);
  return () => {};
}
