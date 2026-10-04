/* =====================================================================
   LESSON FORMAT: guided steps, quick checks, cross-links
   ===================================================================== */

/* Guided "Try this" steps. Each step is { title, text (HTML with TeX), set? }.
   Entering a step calls onEnter(step, index, first); `set` is a state patch that the
   lesson's mount() applies through the scene it returns (see ARCHITECTURE.md). */
function Stepper(steps, onEnter, { onStep, tools } = {}) {
  let i = 0;
  const count = h('span', { class: 'steps-n' }), title = h('h3', { class: 'step-title' });
  const text = h('div', { class: 'step-text', 'aria-live': 'polite' });
  const dots = steps.map((s, k) => h('button', { type: 'button', class: 'dot', 'aria-label': `Step ${k + 1}: ${s.title}`, onclick: () => go(k) }));
  const back = h('button', { type: 'button', class: 'btn', onclick: () => go(i - 1) }, 'Back');
  const next = h('button', { type: 'button', class: 'btn primary', onclick: () => go(i + 1) }, 'Next');
  /* On the last step Next is disabled; say what comes after instead of leaving a dead button. */
  const endGo = h('button', { type: 'button', class: 'btn', onclick: () => {
    const c = document.querySelector('.check') || document.querySelector('.prose'); if (!c) return;
    c.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    const hd = c.querySelector('h2'); if (hd) { hd.tabIndex = -1; hd.focus({ preventScroll: true }); }
  } }, 'Go to the quick check');
  const end = h('p', { class: 'steps-end', hidden: '' }, 'That was the last step. Play with the controls, then try the quick check.', h('br'), endGo);
  const el = h('section', { class: 'steps', 'aria-label': 'Guided steps' },
    h('div', { class: 'steps-head' }, h('span', { class: 'steps-k' }, 'Try this'), count),
    h('div', { class: 'dots' }, dots), title, text, h('div', { class: 'steps-nav' }, back, next), end, tools && tools.length ? h('div', { class: 'steps-tools' }, tools) : null);
  /* New step: the side panel scrolls back to its top, and on phones (where the figure is pinned under the header) the
     step text is brought below the figure if it had scrolled behind it. */
  function revealStep() {
    const pnl = el.closest('.panel'); if (pnl) pnl.scrollTop = 0;
    const st = document.querySelector('.stage');
    if (st && getComputedStyle(st).position === 'sticky') {
      const gap = title.getBoundingClientRect().top - st.getBoundingClientRect().bottom;
      if (gap < 8) window.scrollBy({ top: gap - 12, behavior: 'auto' });
    }
  }
  function go(k, first) {
    i = clamp(k, 0, steps.length - 1);
    const s = steps[i];
    count.textContent = `${i + 1} / ${steps.length}`;
    title.textContent = s.title; text.innerHTML = s.text; typeset(text);
    if (!first) for (const el of [title, text]) { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; }
    dots.forEach((d, j) => { d.classList.toggle('on', j === i); d.classList.toggle('done', j < i); j === i ? d.setAttribute('aria-current', 'step') : d.removeAttribute('aria-current'); });
    back.disabled = i === 0; next.disabled = i === steps.length - 1;
    end.hidden = !(steps.length > 1 && i === steps.length - 1);
    if (!first) revealStep();
    onEnter(s, i, !!first);
    if (onStep) onStep(i, !!first);
  }
  return { el, start: (k = 0) => go(k, true), index: () => i };
}

/* Multiple-choice quick check. Each question is { q, choices: [html], answer: index, why, hint? }.
   A wrong pick is marked and can be retried; the right pick locks the question and shows `why`. */
let qcUid = 0;
function QuickCheck(questions, onResult) {
  const qid = ++qcUid;
  const root = h('section', { class: 'check', 'aria-label': 'Quick check' }, h('h2', {}, 'Quick check'));
  questions.forEach((Q, n) => {
    const fb = h('div', { class: 'q-fb', 'aria-live': 'polite', role: 'status', tabindex: '-1' });
    const btns = Q.choices.map((c, k) => h('button', { type: 'button', class: 'choice', html: c, onclick: () => pick(k) }));
    function pick(k) {
      if (btns[Q.answer].classList.contains('right')) return;
      if (onResult) onResult(n, k === Q.answer);
      if (k === Q.answer) {
        btns[k].classList.add('right'); btns.forEach(b => { b.disabled = true; });
        fb.className = 'q-fb ok'; fb.innerHTML = '<b>Right.</b> ' + Q.why;
      } else {
        btns[k].classList.add('wrong'); btns[k].disabled = true;
        fb.className = 'q-fb no'; fb.innerHTML = '<b>Not quite.</b> ' + (Q.hint || 'Try another answer.');
      }
      typeset(fb);
      /* the clicked choice is now disabled, so focus would fall to <body>; keep it on the feedback instead */
      try { fb.focus({ preventScroll: true }); } catch (e) {}
    }
    root.append(h('div', { class: 'q', role: 'group', 'aria-labelledby': 'qs-' + qid + '-' + n },
      h('p', { class: 'q-stem', id: 'qs-' + qid + '-' + n, html: `<span class="q-n">${n + 1}</span>${Q.q}` }), h('div', { class: 'choices' }, btns), fb));
  });
  typeset(root);
  return root;
}

/* Cross-links to other lessons, built or planned. links = { prereq, next, related } (arrays of lesson ids). */
function Connections(links, selfId) {
  const groups = [['prereq', 'Builds on'], ['next', 'Leads to'], ['related', 'Related']];
  const cols = [];
  for (const [key, name] of groups) {
    const items = (links[key] || []).filter(id => id !== selfId).map(id => [id, lessonRef(id)]).filter(([, r]) => r);
    if (!items.length) continue;
    cols.push(h('div', { class: 'link-col' }, h('p', { class: 'link-k' }, name),
      h('ul', {}, items.map(([id, r]) => h('li', { class: 'lvl-' + r.level },
        r.live ? h('a', { class: 'link', href: '#/viz/' + id }, h('span', { class: 'lvl-dot' }), r.title, h('span', { class: 'link-l' }, LEVELS[r.level].name))
               : h('span', { class: 'link soon' }, h('span', { class: 'lvl-dot' }), r.title, h('span', { class: 'link-l' }, 'Soon')))))));
  }
  return cols.length ? h('section', { class: 'links', 'aria-label': 'Connections' }, h('h2', {}, 'Connections'), h('div', { class: 'link-cols' }, cols)) : null;
}
