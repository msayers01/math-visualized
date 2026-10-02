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
  if (link) attrs.href = '#find~std_' + code;
  return h(link ? 'a' : 'span', attrs, code);
}

/* Skill, grades and benchmark chips for a lesson. With `link`, the chips open the filtered lesson list. */
function LessonTags(v, link, extra) {
  return h('div', { class: 'tags' }, SkillMeter(v.skill), h('span', { class: 'tag' }, gradesLabel(v.grades)),
    v.enrichment ? h(link ? 'a' : 'span', { class: 'tag enrich', title: KINDS[0].desc, ...(link ? { href: '#find~kind_enrich' } : {}) }, KINDS[0].name) : null,
    v.standards.length ? h('span', { class: 'stds' }, v.standards.map(c => StdChip(c, link))) : null, extra || null);
}

/* ---------- Free-text search ----------
   The query lives beside the facets as F.q (the facet code in curriculum.js knows nothing about it).
   Every word must start a word in the lesson's title, blurb, course name, benchmark codes or benchmark
   wording; a whole code (8.2.4.1) must match a code exactly, a part of one (8.2) matches the codes that start with it. In the address the query is a
   plain token: lower case, a-z 0-9 and "." only, spaces written as "-": #find~grade_8~q_pythagorean-theorem */
const SEARCH_MAX = 60;
const searchText = s => String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/['\u2019]/g, '').replace(/[^a-z0-9.]+/g, ' ');
const searchTerms = q => searchText(q).split(' ').map(t => t.replace(/^\.+|\.+$/g, '')).filter(Boolean);
const hayCache = new WeakMap();
function haystack(v) {
  let t = hayCache.get(v);
  if (!t) {
    t = ' ' + searchText([v.title, v.blurb, COURSE[v.course] ? COURSE[v.course].name : '',
      ...v.standards, ...v.standards.map(c => STANDARDS[c])].join(' ')).replace(/ +/g, ' ') + ' ';
    hayCache.set(v, t);
  }
  return t;
}
const CODE = /^\d+\.\d+\.\d+\.\d+$/;
const searchMatch = (v, q) => { const T = searchTerms(q); return !T.length || T.every(t => haystack(v).includes(' ' + t + (CODE.test(t) ? ' ' : ''))); };
/* the query as it appears in a share token */
const searchToken = q => searchText(q).trim().replace(/ +/g, '-').slice(0, SEARCH_MAX).replace(/-+$/, '');
/* lesson passes the facets and the search */
const lessonMatches = (v, F) => matches(v, F) && searchMatch(v, F.q);
const finderActive = F => filterActive(F) || searchTerms(F.q).length > 0;
const finderCount = F => filterCount(F) + (searchTerms(F.q).length ? 1 : 0);
const facetCountQ = (items, F, facet, val) => items.filter(v => matches(v, F, facet) && optionMatch(v, facet, val) && searchMatch(v, F.q)).length;
/* #find~...~q_pythagorean-theorem */
const findToken = F => { const t = filterToken(F), q = searchToken(F.q); return q ? t + '~q_' + q : t; };
/* facets and search from an address */
function finderFromHash(hash) {
  const F = filterFromHash(hash); F.q = '';
  if (hash.startsWith('#find')) for (const seg of hash.split('~').slice(1)) if (seg.startsWith('q_')) F.q = seg.slice(2).replace(/-+/g, ' ').replace(/[^a-z0-9. ]/gi, '').slice(0, SEARCH_MAX).trim();
  return F;
}

/* The filter bar. F is the live filter state (mutated); onChange(F) runs after every user change.
   Option counts show how many lessons each choice would leave given the other filters, and
   choices that would leave none are disabled. Returns { el, refresh }. */
function Finder(F, onChange) {
  const chips = [], selects = [];
  const sum = h('span', { class: 'finder-sum', 'aria-live': 'polite' });
  const badge = h('span', { class: 'badge' });
  const clear = h('button', { type: 'button', class: 'finder-clear', onclick: () => { Object.assign(F, emptyFilter(), { q: '' }); change(); } }, 'Clear filters');
  F.q = F.q || '';
  const qIn = h('input', { type: 'search', id: 'f-q', class: 'fsel finder-q-in', autocomplete: 'off', spellcheck: 'false', autocapitalize: 'off', enterkeyhint: 'search',
    maxlength: String(SEARCH_MAX), placeholder: 'Title, topic, course or benchmark code (such as 8.2.4.1)', 'aria-controls': 'lessons',
    oninput: () => { F.q = qIn.value; change(); },
    onkeydown: e => { if (e.key === 'Escape' && qIn.value) { e.preventDefault(); e.stopPropagation(); qIn.value = ''; F.q = ''; change(); } else if (e.key === 'Enter') e.preventDefault(); } });
  const qClear = h('button', { type: 'button', class: 'finder-q-clear', 'aria-label': 'Clear search', onclick: () => { qIn.value = ''; F.q = ''; change(); qIn.focus(); } }, 'Clear');
  const search = h('div', { class: 'finder-search', role: 'search' },
    h('label', { class: 'facet-k', for: 'f-q' }, 'Search lessons'), h('div', { class: 'finder-q' }, qIn, qClear));
  const grid = h('div', { class: 'finder-grid', id: 'finder-grid' });
  const copyView = CopyButton('Copy link to this view', () => shareUrl(findToken(F)), { cls: 'finder-copy', title: embedded ? 'Copies the end of the link; add it after this page\'s address' : '' });
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
    return h('fieldset', { class: 'facet ' + facet }, h('legend', { class: 'facet-k' }, label), set);
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
    VIZ.some(v => v.enrichment) ? chipGroup('kind', 'Type', KINDS.map(k => ({ val: k.id, label: k.name, title: k.desc }))) : null,
    selectBox('course', 'Course', 'Any course', LEVEL_ORDER.map(l => ({ label: LEVELS[l].name,
      options: COURSES.filter(c => c.level === l && VIZ.some(v => v.course === c.id)).map(c => ({ val: c.id, label: c.name })) })).filter(g => g.options.length)),
    used.length ? selectBox('std', 'Standard (Minnesota 2022)', 'Any standard', STRANDS.map(s => ({ label: `Strand ${s.n}: ${s.name}`,
      options: used.filter(c => strandOf(c).id === s.id).map(c => ({ val: c, label: c + '  ' + shortText(STANDARDS[c], 70) })) })).filter(g => g.options.length)) : null);

  function refresh() {
    for (const c of chips) {
      const n = facetCountQ(VIZ, F, c.facet, c.val), on = F[c.facet].includes(c.val);
      c.n.textContent = n; c.btn.setAttribute('aria-pressed', on); c.btn.disabled = !n && !on;
    }
    for (const s of selects) {
      s.sel.value = F[s.facet];
      for (const o of s.opts) o.el.disabled = !facetCountQ(VIZ, F, s.facet, o.val) && F[s.facet] !== o.val;
    }
    const shown = VIZ.filter(v => lessonMatches(v, F)).length, on = finderActive(F);
    sum.textContent = on ? `${shown} of ${VIZ.length} lessons match` : `${VIZ.length} lessons`;
    if (qIn.value !== F.q) qIn.value = F.q;
    qClear.hidden = !F.q;
    clear.hidden = !on; copyView.hidden = !on; badge.textContent = finderCount(F); badge.hidden = !on;
  }
  function change() { refresh(); onChange(F); }

  const root = h('section', { class: 'wrap finder', id: 'finder', 'aria-label': 'Find lessons' },
    h('div', { class: 'finder-box' },
      h('div', { class: 'finder-head' }, h('h2', { class: 'finder-title' }, 'Find lessons'), sum, toggle, copyView, clear),
      search, grid));
  refresh();
  return { el: root, refresh, focus: () => { qIn.focus(); qIn.select(); } };
}
