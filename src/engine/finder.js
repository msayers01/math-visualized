/* =====================================================================
   LESSON TAGS AND FINDER: skill meter, standard chips, and the filter bar
   ===================================================================== */

/* Three bars for introductory, intermediate, advanced, plus the name */
function SkillMeter(id) {
  const n = SKILLS.findIndex(s => s.id === id) + 1, S = SKILL[id];
  return h('span', { class: 'skill', title: S.name + ': ' + S.desc },
    h('span', { class: 'pips', 'aria-hidden': 'true' }, [1, 2, 3].map(i => h('span', { class: 'pip' + (i <= n ? ' on' : '') }))), S.name);
}

/* A benchmark code colored by its strand (shape too, so color is never the only cue). A link when `link` is set. */
function StdChip(code, link) {
  const attrs = { class: 'std', 'data-strand': strandOf(code).id, title: code + ': ' + STANDARDS[code] };
  if (link) attrs.href = '#/?std=' + code;
  return h(link ? 'a' : 'span', attrs, code);
}

/* Skill, grades and benchmark chips for a lesson. With `link`, the chips open the filtered lesson list. */
function LessonTags(v, link) {
  return h('div', { class: 'tags' }, SkillMeter(v.skill), h('span', { class: 'tag' }, gradesLabel(v.grades)),
    v.standards.length ? h('span', { class: 'stds' }, v.standards.map(c => StdChip(c, link))) : null);
}

/* The filter bar. F is the live filter state (mutated); onChange(F) runs after every user change.
   Option counts show how many lessons each choice would leave given the other filters, and
   choices that would leave none are disabled. Returns { el, refresh }. */
function Finder(F, onChange) {
  const chips = [], selects = [];
  const sum = h('span', { class: 'finder-sum', 'aria-live': 'polite' });
  const badge = h('span', { class: 'badge' });
  const clear = h('button', { type: 'button', class: 'finder-clear', onclick: () => { Object.assign(F, emptyFilter()); change(); } }, 'Clear filters');
  const grid = h('div', { class: 'finder-grid', id: 'finder-grid' });
  const toggle = h('button', { type: 'button', class: 'finder-toggle', 'aria-expanded': 'false', 'aria-controls': 'finder-grid',
    onclick: () => { const o = root.classList.toggle('open'); toggle.setAttribute('aria-expanded', o); } }, 'Filters', badge);

  const chipGroup = (facet, label, opts) => {
    const set = h('div', { class: 'chips' });
    for (const o of opts) {
      const n = h('span', { class: 'n' });
      const attrs = { type: 'button', class: 'chip', 'aria-pressed': 'false', onclick: () => {
        const i = F[facet].indexOf(o.val); i < 0 ? F[facet].push(o.val) : F[facet].splice(i, 1); change();
      } };
      if (o.title) attrs.title = o.title;
      if (o.strand) attrs['data-strand'] = o.strand;
      const btn = h('button', attrs, h('span', { class: 'lbl' }, o.label), n);
      chips.push({ facet, val: o.val, btn, n }); set.append(btn);
    }
    return h('fieldset', { class: 'facet' }, h('legend', { class: 'facet-k' }, label), set);
  };
  const selectBox = (facet, label, anyLabel, groups) => {
    const sel = h('select', { class: 'fsel', id: 'f-' + facet, onchange: () => { F[facet] = sel.value; change(); } }, h('option', { value: '' }, anyLabel));
    const opts = [];
    for (const g of groups) {
      const og = h('optgroup', { label: g.label });
      for (const o of g.options) { const el = h('option', { value: o.val }, o.label); opts.push({ val: o.val, el }); og.append(el); }
      sel.append(og);
    }
    selects.push({ facet, sel, opts });
    return h('label', { class: 'facet', for: 'f-' + facet }, h('span', { class: 'facet-k' }, label), sel);
  };

  const used = [...new Set(VIZ.flatMap(v => v.standards))].sort(cmpCode);
  grid.append(
    chipGroup('grade', 'Grade level', GRADES.filter(g => VIZ.some(v => v.grades.includes(g.id))).map(g => ({ val: g.id, label: g.name }))),
    chipGroup('skill', 'Skill level', SKILLS.map(s => ({ val: s.id, label: s.name, title: s.desc }))),
    used.length ? chipGroup('strand', 'Standard strand', STRANDS.map(s => ({ val: s.id, label: s.name, strand: s.id }))) : null,
    selectBox('course', 'Course', 'Any course', LEVEL_ORDER.map(l => ({ label: LEVELS[l].name,
      options: COURSES.filter(c => c.level === l && VIZ.some(v => v.course === c.id)).map(c => ({ val: c.id, label: c.name })) })).filter(g => g.options.length)),
    used.length ? selectBox('std', 'Standard (Minnesota 2022)', 'Any standard', STRANDS.map(s => ({ label: `Strand ${s.n}: ${s.name}`,
      options: used.filter(c => strandOf(c).id === s.id).map(c => ({ val: c, label: c + '  ' + shortText(STANDARDS[c], 70) })) })).filter(g => g.options.length)) : null);

  function refresh() {
    for (const c of chips) {
      const n = facetCount(VIZ, F, c.facet, c.val), on = F[c.facet].includes(c.val);
      c.n.textContent = n; c.btn.setAttribute('aria-pressed', on); c.btn.disabled = !n && !on;
    }
    for (const s of selects) {
      s.sel.value = F[s.facet];
      for (const o of s.opts) o.el.disabled = !facetCount(VIZ, F, s.facet, o.val) && F[s.facet] !== o.val;
    }
    const shown = VIZ.filter(v => matches(v, F)).length, on = filterActive(F);
    sum.textContent = on ? `${shown} of ${VIZ.length} lessons match` : `${VIZ.length} lessons`;
    clear.hidden = !on; badge.textContent = filterCount(F); badge.hidden = !on;
  }
  function change() { refresh(); onChange(F); }

  const root = h('section', { class: 'wrap finder', id: 'finder', 'aria-label': 'Find lessons' },
    h('div', { class: 'finder-box' },
      h('div', { class: 'finder-head' }, h('h2', { class: 'finder-title' }, 'Find lessons'), sum, toggle, clear),
      grid));
  refresh();
  return { el: root, refresh };
}
