/* =====================================================================
   PAGES
   ===================================================================== */
const NUMERALS = { school: '01', ugrad: '02', grad: '03' };
/* courses the visitor has opened on the home page (kept while the page stays open) */
const OPEN_COURSES = new Set();
/* Back to the home list restores where the visitor was; every other page opens at the top. The browser's own
   restoration would run before the page is rebuilt, so it is switched off and the home page restores itself. */
try { history.scrollRestoration = 'manual'; } catch (e) {}
let HOME_SCROLL = null, POPPED = false;
addEventListener('popstate', () => { POPPED = true; setTimeout(() => { POPPED = false; }, 600); });
const sameHash = (a, b) => (a || '#/') === (b || '#/');

function renderHome(app) {
  document.title = 'Continuum: mathematics you can move';
  const heroCanvas = h('div', { class: 'hero-canvas', 'aria-hidden': 'true' });
  const cells = [0, 1, 2, 3].map(() => h('span', { class: 'm' }));
  const detEl = h('span', { class: 'v' }), eigEl = h('span', { class: 'v' });
  app.append(h('section', { class: 'hero' }, heroCanvas,
    h('div', { class: 'wrap hero-inner' },
      h('div', { class: 'hero-copy' },
        h('h1', { class: 'display hero-title' }, h('span', { class: 'line' }, 'Mathematics'), h('span', { class: 'line' }, 'you can move.')),
        h('p', { class: 'hero-sub' }, 'Interactive visualizations from middle school through graduate study. Drag, slide, and watch each idea change shape.'),
        h('div', { class: 'hero-cta' },
          h('a', { class: 'btn primary', href: '#/viz/slope-and-linear-functions' }, 'Start with slope'),
          h('a', { class: 'btn', href: '#find', onclick: e => { e.preventDefault(); const f = document.getElementById('finder'); if (f) { f.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); finder.focus({ preventScroll: true }); } } }, 'Find a lesson')),
        h('p', { class: 'hero-note' }, `For teachers: search ${VIZ.length} lessons by title, course or Minnesota benchmark, open one, then use its step links and printable exit ticket.`)),
      h('div', { class: 'instrument', 'aria-hidden': 'true' },
        h('div', { class: 'inst-item inst-matrix' }, h('span', { class: 'k' }, 'Matrix on screen'), h('span', { class: 'matrix' }, cells)),
        h('div', { class: 'inst-item' }, h('span', { class: 'k' }, 'Determinant'), detEl),
        h('div', { class: 'inst-item' }, h('span', { class: 'k' }, 'Eigenvalues'), eigEl)))));

  /* Lesson finder, then one section per level with lessons grouped by course in curriculum order.
     Each course is a collapsible group: closed groups show only their lesson titles, and a group draws its
     thumbnails (loading the lessons in a split build) the first time it is open. Filtering opens the groups
     that have matches and only hides rows; the filter state lives in the URL hash. */
  const F = finderFromHash(location.hash), rows = new Map(), sections = [], allGroups = [], tPlanes = [];
  let alive = true, homeHash = location.hash;
  /* Thumbnails are drawn a few at a time per frame (the ones on screen first), so "Expand all" never freezes the page */
  const jobs = []; let pumping = 0;
  const onScreen = el => { const r = el.getBoundingClientRect(); return r.bottom > -200 && r.top < innerHeight + 200; };
  const pump = () => {
    pumping = 0; const t0 = performance.now();
    while (alive && jobs.length && performance.now() - t0 < 8) {
      const i = jobs.findIndex(j => onScreen(j.el));
      jobs.splice(i < 0 ? 0 : i, 1)[0].run();
    }
    if (alive && jobs.length) pumping = requestAnimationFrame(pump);
  };
  const drawThumbs = g => {
    for (const v of g.items) {
      if (g.drawn.has(v.id) || rows.get(v.id).hidden) continue;
      g.drawn.add(v.id);
      const el = g.thumbEls.get(v.id);
      loadLesson(v.id).then(() => {
        if (!alive || !v.thumb) return;
        jobs.push({ el, run() {
          if (g.list.hidden || rows.get(v.id).hidden) { g.drawn.delete(v.id); return; }   /* closed or filtered out meanwhile: draw when shown again */
          const P = new Plane(el, { span: 3 }); P.onDraw = v.thumb; P.draw(); tPlanes.push(P);
        } });
        if (!pumping) pumping = requestAnimationFrame(pump);
      }, () => { g.drawn.delete(v.id); if (alive) el.classList.add('empty'); });
    }
  };
  const syncAll = () => {
    const vis = allGroups.filter(g => !g.el.hidden);
    allBtn.textContent = vis.length && vis.every(g => g.open) ? 'Collapse all courses' : 'Expand all courses';
  };
  const setOpen = (g, open, remember) => {
    g.open = open; g.list.hidden = !open; g.preview.hidden = open; g.el.classList.toggle('open', open);
    g.toggle.setAttribute('aria-expanded', String(open));
    if (remember) { if (open) OPEN_COURSES.add(g.id); else OPEN_COURSES.delete(g.id); }
    if (open) drawThumbs(g);
    syncAll();
  };
  const allBtn = h('button', { type: 'button', class: 'btn course-all', onclick: () => {
    const open = !allGroups.filter(g => !g.el.hidden).every(g => g.open);
    allGroups.forEach(g => { if (!g.el.hidden) setOpen(g, open, true); });
  } }, 'Expand all courses');
  const levels = h('div', { class: 'wrap levels', id: 'lessons' }, h('div', { class: 'levels-tools' }, allBtn));
  const empty = h('div', { class: 'finder-empty', hidden: true }, h('p', {}, 'No lessons match this search and these filters.'),
    h('button', { type: 'button', class: 'btn', onclick: () => { Object.assign(F, emptyFilter(), { q: '' }); finder.refresh(); apply(); } }, 'Clear filters'));
  for (const [key, L] of Object.entries(LEVELS)) {
    const live = VIZ.filter(v => v.level === key), todo = PLANNED[key].filter(t => !live.some(v => v.id === slug(t))), total = live.length + todo.length;
    const body = h('div', { class: 'level-body' }), groups = [];
    for (const c of COURSES.filter(c => c.level === key)) {
      const items = live.filter(v => v.course === c.id);
      if (!items.length) continue;
      const list = h('ul', { class: 'topics', id: 'topics-' + c.id }), n = h('span', { class: 'n' }), thumbEls = new Map();
      for (const v of items) {
        const th = h('div', { class: 'thumb', 'aria-hidden': 'true' });
        thumbEls.set(v.id, th);
        const li = h('li', {}, h('a', { class: 'topic', href: '#/viz/' + v.id },
          th, h('div', { class: 'tt' }, h('span', { class: 't' }, v.title), h('span', { class: 'd' }, v.blurb), LessonTags(v, false, ProgressChip(v).el)),
          h('span', { class: 'go' }, 'Open')));
        rows.set(v.id, li); list.append(li);
      }
      const toggle = h('button', { type: 'button', class: 'course-toggle', 'aria-controls': 'topics-' + c.id, 'aria-expanded': 'false' },
        h('span', { class: 'chev', 'aria-hidden': 'true' }), h('span', { class: 'cname' }, c.name), n);
      const preview = h('p', { class: 'course-preview' }, items.map(v => v.title).join(' \u00b7 '));
      const el = h('section', { class: 'course', 'aria-label': c.name }, h('h3', { class: 'course-head' }, toggle), preview, list);
      const g = { id: c.id, el, items, n, list, toggle, preview, thumbEls, drawn: new Set(), open: false };
      toggle.addEventListener('click', () => setOpen(g, !g.open, true));
      groups.push(g); allGroups.push(g); body.append(el);
    }
    let planned = null;
    if (todo.length) {
      planned = h('section', { class: 'course', 'aria-label': 'In development' }, h('h3', { class: 'course-head' }, 'In development'),
        h('ul', { class: 'topics' }, todo.map(t => h('li', { class: 'planned' }, h('div', { class: 'topic' },
          h('div', { class: 'thumb empty', 'aria-hidden': 'true' }),
          h('div', { class: 'tt' }, h('span', { class: 't' }, t), h('span', { class: 'd' }, 'In development')),
          h('span', { class: 'go' }, 'Soon'))))));
      body.append(planned);
    }
    const count = h('p', { class: 'count' });
    const el = h('section', { class: 'level lvl-' + key, id: 'level-' + key },
      h('div', { class: 'level-head' },
        h('span', { class: 'numeral', 'aria-hidden': 'true' }, NUMERALS[key]),
        h('div', {}, h('h2', { class: 'display' }, L.name), h('p', { class: 'desc' }, L.desc), count)),
      body);
    levels.append(el); sections.push({ el, live, total, groups, planned, count });
  }
  levels.append(empty);
  const apply = () => {
    const on = finderActive(F); let shown = 0;
    for (const S of sections) {
      let n = 0;
      for (const g of S.groups) {
        let k = 0;
        for (const v of g.items) { const ok = lessonMatches(v, F); rows.get(v.id).hidden = !ok; if (ok) k++; }
        g.el.hidden = !k; n += k;
        g.n.textContent = k === g.items.length ? `${k} ${k === 1 ? 'lesson' : 'lessons'}` : `${k} of ${g.items.length}`;
        setOpen(g, on ? k > 0 : OPEN_COURSES.has(g.id), false);
      }
      if (S.planned) S.planned.hidden = on;
      S.el.hidden = on && !n; shown += n;
      S.count.textContent = on ? `${n} of ${S.live.length} lessons shown` : `${S.live.length} of ${S.total} topics ready`;
    }
    empty.hidden = !on || shown > 0;
    const hash = on ? findToken(F) : '#/';
    if (location.hash !== hash && (on || /^#(find|\/\?)/.test(location.hash))) { try { history.replaceState(null, '', hash); homeHash = hash; } catch (e) {} }   /* the URL is a convenience; a frame that refuses it must not break filtering */
  };
  const finder = Finder(F, apply);
  /* "Continue where you left off": the lesson this browser opened last, shown only when there is progress */
  const last = Progress.last(), lv = last && VIZ.find(x => x.id === last.id);
  let resume = null;
  if (lv) {
    const st = Progress.status(lv), done = st.state === 'done', at = !done && st.st > 1 ? clamp(last.step, 0, st.st - 1) : 0;
    resume = h('div', { class: 'wrap resume' }, h('a', { class: 'resume-link', href: lessonToken(lv.id, at) },
      h('span', { class: 'resume-k' }, done ? 'Last opened' : 'Continue where you left off'),
      h('span', { class: 'resume-t' }, lv.title), h('span', { class: 'resume-d' }, done ? 'Complete' : st.st > 1 ? `Step ${at + 1} of ${st.st}` : 'Opened')));
  }
  app.append(resume, finder.el, levels);
  apply();
  /* "/" jumps to the search box, as on most sites */
  const slash = e => {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || /^(input|textarea|select)$/i.test(e.target.tagName) || e.target.isContentEditable) return;
    e.preventDefault(); finder.focus();
  };
  addEventListener('keydown', slash);
  if (POPPED && HOME_SCROLL && sameHash(HOME_SCROLL.hash, location.hash)) {   /* the router scrolls to the top (or the finder) after this returns, so restore after that */
    const y = HOME_SCROLL.y; POPPED = false;
    requestAnimationFrame(() => requestAnimationFrame(() => { if (alive) window.scrollTo({ top: y, behavior: 'instant' }); }));
  }

  /* hero: a grid cycling through linear maps, with a live readout */
  const P = new Plane(heroCanvas, { span: 3.4, transparent: true });
  const Ms = [[1,0,0,1],[1,1,0,1],[0,-1,1,0],[1.6,.6,.4,1.2],[-1,.5,0,1],[.8,-.9,.9,.8]];
  const hold = 1200, move = 2400, seg = hold + move;
  const matAt = ms => {
    const i = Math.floor(ms / seg) % Ms.length, j = (i + 1) % Ms.length, q = ease(clamp((ms % seg - hold) / move, 0, 1));
    return Ms[i].map((v, k) => lerp(v, Ms[j][k], q));
  };
  const show = ([a, b, c, d]) => {
    [a, b, c, d].forEach((v, i) => { cells[i].textContent = fmt(v); });
    detEl.textContent = fmt(a * d - b * c);
    const e = eig2(a, b, c, d);
    eigEl.textContent = e.real ? [...new Set(e.list.map(x => fmt(x.l)))].join(', ') : `${fmt(e.re)} ± ${e.im.toFixed(2)}i`;
  };
  let M = reduceMotion ? Ms[1] : Ms[0], t0 = null, raf;
  P.onDraw = (ctx, p) => {
    p.cx = p.w > 900 ? -(p.w * .2) / p.scale : 0;
    const pal = p.pal, [a, b, c, d] = M, ap = (x, y) => [a * x + b * y, c * x + d * y], N = 18;
    p.grid(1);
    for (let k = -N; k <= N; k++) {
      p.path([ap(k, -N), ap(k, N)], { stroke: k ? alpha(pal.blue, .7) : pal.axis, width: k ? 1.2 : 2 });
      p.path([ap(-N, k), ap(N, k)], { stroke: k ? alpha(pal.blue, .7) : pal.axis, width: k ? 1.2 : 2 });
    }
    p.path([ap(0,0), ap(1,0), ap(1,1), ap(0,1)], { fill: alpha(pal.yellow, .3), stroke: pal.yellow, width: 2, close: true });
    p.arrow(0, 0, a, c, pal.green); p.arrow(0, 0, b, d, pal.red);
  };
  show(M); P.draw();
  if (!reduceMotion) {
    const loop = now => { if (t0 === null) t0 = now; M = matAt(now - t0); show(M); P.draw(); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
  }
  return () => {
    HOME_SCROLL = { y: window.scrollY, hash: homeHash };
    alive = false; cancelAnimationFrame(raf); cancelAnimationFrame(pumping); removeEventListener('keydown', slash); P.destroy(); tPlanes.forEach(t => t.destroy());
  };
}

/* "Standards alignment" section of a lesson page: each tagged benchmark with its full wording. */
function Alignment(v) {
  if (!v.standards.length) return null;
  return h('section', { class: 'align', 'aria-label': 'Standards alignment' }, h('h2', {}, 'Standards alignment'),
    h('p', { class: 'align-note' }, 'Minnesota K\u201312 Academic Standards in Mathematics (2022). Select a code to see every lesson that addresses it.'),
    h('ul', { class: 'align-list' }, v.standards.map(c => {
      const s = strandOf(c), a = anchorOf(c);
      return h('li', { class: 'align-item', 'data-strand': s.id }, StdChip(c, true),
        h('div', {}, h('p', { class: 'bench' }, STANDARDS[c]), h('p', { class: 'anc' }, s.name + ' \u00b7 ' + a.name)));
    })));
}

/* A lesson's links as the page shows them: what it lists plus the other side of every link elsewhere, so
   "Builds on" on one page always has a matching "Leads to" on the other, whichever of the two wrote it down. */
function connectionLinks(v) {
  const L = v.links || {}, pre = new Set(L.prereq || []), nxt = new Set(L.next || []), rel = new Set(L.related || []);
  for (const w of VIZ) {
    if (w === v || !w.links) continue;
    if ((w.links.prereq || []).includes(v.id)) nxt.add(w.id);
    if ((w.links.next || []).includes(v.id)) pre.add(w.id);
  }
  for (const id of [...pre, ...nxt]) rel.delete(id);
  return { prereq: [...pre], next: [...nxt], related: [...rel] };
}

/* Lesson page. A lesson may use the full format (hook, steps, formal, check, links) or the
   legacy `explain` prose; every part is optional. mount() may return a teardown function
   (legacy) or a scene { destroy, apply(patch, immediate) } that guided steps can drive. */
function renderViz(app, v, startStep = 0) {
  document.title = v.title + ' | Continuum';
  const sib = VIZ.filter(x => x.level === v.level), i = sib.indexOf(v), prev = sib[i - 1], next = sib[i + 1];
  const stage = h('div', { class: 'stage', 'data-coords': '', role: 'img', 'aria-label': 'Interactive visualization: ' + v.title },
    ['tl', 'tr', 'bl', 'br'].map(c => h('span', { class: 'tick ' + c })));
  const panel = h('aside', { class: 'panel', 'aria-label': 'Controls' });
  const body = v.formal != null ? h('div', { class: 'prose' }, h('h2', {}, 'The math'), h('div', { html: v.formal }))
                                : h('div', { class: 'prose', html: v.explain || '' });
  const lede = h('p', { class: v.hook ? 'lede hook' : 'lede', html: v.hook || v.blurb });
  Progress.open(v.id);
  const chip = ProgressChip(v);
  const check = v.check && v.check.length ? QuickCheck(v.check, (n, right) => { Progress.answer(v.id, n, right); chip.update(); }) : null;
  const tickets = v.check && v.check.length ? h('p', { class: 'ticket-links' }, 'Printable exit ticket: ', h('a', { href: ticketToken(v.id, false) }, 'student version'), ' · ', h('a', { href: ticketToken(v.id, true) }, 'with answer key')) : null;
  const conn = Connections(connectionLinks(v), v.id);
  const align = Alignment(v);
  let scene = {};
  const stepper = v.steps && v.steps.length
    ? Stepper(v.steps, (s, k, first) => { if (s.set && scene.apply) scene.apply(s.set, first); }, {
        onStep: (i, first) => { Progress.step(v.id, i); chip.update(); document.title = v.steps.length > 1 && i > 0 ? `${v.title}, step ${i + 1} of ${v.steps.length} | Continuum` : v.title + ' | Continuum'; if (!first) { try { history.replaceState(null, '', lessonToken(v.id, i)); } catch (e) {} } },
        tools: [CopyButton('Copy link to this step', () => shareUrl(lessonToken(v.id, stepper.index())), { title: embedded ? 'Copies the end of the link; add it after this page\'s address' : '' })]
      }) : null;
  if (stepper) panel.append(stepper.el);
  const pg = (x, cls, k) => h('a', { class: 'pg ' + cls, href: '#/viz/' + x.id }, h('span', { class: 'k' }, k), h('span', { class: 't' }, x.title));
  app.append(h('article', { class: 'wrap viz lvl-' + v.level },
    h('nav', { class: 'crumbs', 'aria-label': 'Breadcrumb' },
      h('a', { href: '#/' }, 'Continuum'), h('span', { 'aria-hidden': 'true' }, '/'),
      h('a', { class: 'lvl-tag', href: '#/level/' + v.level }, LEVELS[v.level].name)),
    h('header', { class: 'viz-head' }, h('h1', { class: 'display' }, v.title), lede,
      h('div', { class: 'viz-meta' }, h('a', { class: 'tag course', href: '#find~course_' + v.course, title: 'See every ' + COURSE[v.course].name + ' lesson' }, COURSE[v.course].name), LessonTags(v, true, chip.el))),
    h('div', { class: 'workbench' }, stage, panel),
    body, check, tickets, conn, align,
    h('nav', { class: 'pager', 'aria-label': 'More topics' },
      prev ? pg(prev, 'prev', 'Previous') : null, next ? pg(next, 'next', 'Next') : null)));
  typeset(body); if (v.hook) typeset(lede);
  const ret = v.mount({ stage, controls: Controls(panel) });
  scene = typeof ret === 'function' ? { destroy: ret } : (ret || {});
  if (stepper) stepper.start(clamp(startStep, 0, v.steps.length - 1));
  if (next && !isLoaded(next)) setTimeout(() => loadLesson(next.id).catch(() => {}), 2500);   /* split build: warm the Next lesson */
  return () => scene.destroy && scene.destroy();
}

