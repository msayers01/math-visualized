/* =====================================================================
   LESSON FORMAT: guided steps, quick checks, cross-links
   ===================================================================== */

/* Guided "Try this" steps. Each step is { title, text (HTML with TeX), set? }.
   Entering a step calls onEnter(step, index, first); `set` is a state patch that the
   lesson's mount() applies through the scene it returns (see ARCHITECTURE.md). */
function Stepper(steps, onEnter) {
  let i = 0;
  const count = h('span', { class: 'steps-n' }), title = h('h3', { class: 'step-title' });
  const text = h('div', { class: 'step-text', 'aria-live': 'polite' });
  const dots = steps.map((s, k) => h('button', { type: 'button', class: 'dot', 'aria-label': `Step ${k + 1}: ${s.title}`, onclick: () => go(k) }));
  const back = h('button', { type: 'button', class: 'btn', onclick: () => go(i - 1) }, 'Back');
  const next = h('button', { type: 'button', class: 'btn primary', onclick: () => go(i + 1) }, 'Next');
  const el = h('section', { class: 'steps', 'aria-label': 'Guided steps' },
    h('div', { class: 'steps-head' }, h('span', { class: 'steps-k' }, 'Try this'), count),
    h('div', { class: 'dots' }, dots), title, text, h('div', { class: 'steps-nav' }, back, next));
  function go(k, first) {
    i = clamp(k, 0, steps.length - 1);
    const s = steps[i];
    count.textContent = `${i + 1} / ${steps.length}`;
    title.textContent = s.title; text.innerHTML = s.text; typeset(text);
    dots.forEach((d, j) => { d.classList.toggle('on', j === i); d.classList.toggle('done', j < i); j === i ? d.setAttribute('aria-current', 'step') : d.removeAttribute('aria-current'); });
    back.disabled = i === 0; next.disabled = i === steps.length - 1;
    onEnter(s, i, !!first);
  }
  return { el, start: () => go(0, true) };
}

/* Multiple-choice quick check. Each question is { q, choices: [html], answer: index, why, hint? }.
   A wrong pick is marked and can be retried; the right pick locks the question and shows `why`. */
function QuickCheck(questions) {
  const root = h('section', { class: 'check', 'aria-label': 'Quick check' }, h('h2', {}, 'Quick check'));
  questions.forEach((Q, n) => {
    const fb = h('div', { class: 'q-fb', 'aria-live': 'polite' });
    const btns = Q.choices.map((c, k) => h('button', { type: 'button', class: 'choice', html: c, onclick: () => pick(k) }));
    function pick(k) {
      if (btns[Q.answer].classList.contains('right')) return;
      if (k === Q.answer) {
        btns[k].classList.add('right'); btns.forEach(b => { b.disabled = true; });
        fb.className = 'q-fb ok'; fb.innerHTML = '<b>Right.</b> ' + Q.why;
      } else {
        btns[k].classList.add('wrong'); btns[k].disabled = true;
        fb.className = 'q-fb no'; fb.innerHTML = '<b>Not quite.</b> ' + (Q.hint || 'Try another answer.');
      }
      typeset(fb);
    }
    root.append(h('div', { class: 'q' },
      h('p', { class: 'q-stem', html: `<span class="q-n">${n + 1}</span>${Q.q}` }), h('div', { class: 'choices' }, btns), fb));
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
