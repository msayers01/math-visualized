/* =====================================================================
   ROUTER
   ===================================================================== */
const app = $('#app'); let teardown = null, routeSeq = 0;
/* A lesson page or ticket needs the full lesson. In a split build that means fetching lessons/<id>.js first. */
function showLoading(v, err) {
  document.title = v.title + ' | Continuum';
  app.append(h('div', { class: 'wrap lesson-loading', role: err ? 'alert' : 'status' },
    h('p', {}, err ? `Could not load \u201c${v.title}\u201d. Check your connection and try again.` : `Loading \u201c${v.title}\u201d\u2026`),
    err ? h('button', { type: 'button', class: 'btn', onclick: () => route() }, 'Try again') : null));
}
/* A lesson (or any page) that throws while it is being built must not leave a blank or half-built page. */
function showRouteError(err) {
  try { console.error(err); } catch (e) {}
  app.innerHTML = '';
  document.title = 'Something went wrong | Continuum';
  app.append(h('div', { class: 'wrap route-error', role: 'alert' },
    h('h1', { class: 'display' }, 'This page hit a snag'),
    h('p', {}, 'Something went wrong while drawing it. Your progress is safe. Try again, or go back to the lesson list.'),
    h('div', { class: 'btns' }, h('a', { class: 'btn primary', href: '#/' }, 'Back to all lessons'), h('button', { type: 'button', class: 'btn', onclick: () => route() }, 'Try again'))));
}
/* Accessibility details that depend on the finished page: the stage is a labelled group whose canvases are named
   figures, the page heading takes focus after a route change (not on the first load), empty titles go. */
let routedOnce = false;
function polishPage(r, v) {
  const stage = document.querySelector('.stage');
  if (stage && v) {
    stage.setAttribute('role', 'group'); stage.setAttribute('aria-label', 'Interactive figure: ' + v.title + '. The controls panel changes it.');
    const cv = stage.querySelectorAll('canvas');
    cv.forEach((c, k) => { c.setAttribute('role', 'img'); c.setAttribute('aria-label', (v.title + ' figure') + (cv.length > 1 ? ` ${k + 1} of ${cv.length}` : '')); });
  }
  app.querySelectorAll('[title=""]').forEach(e => e.removeAttribute('title'));
  if (routedOnce) {
    const hd = app.querySelector('h1');
    const f = hd || app; if (!f.hasAttribute('tabindex')) f.setAttribute('tabindex', '-1');
    try { f.focus({ preventScroll: true }); } catch (e) {}
  }
  routedOnce = true;
}
function route() {
  if (teardown) { try { teardown(); } catch (e) { console.error(e); } } teardown = null;
  app.innerHTML = '';
  const seq = ++routeSeq;
  const r = parseRoute(location.hash), v = r.id && VIZ.find(x => x.id === r.id);
  if (v && (r.page === 'viz' || r.page === 'ticket') && !isLoaded(v)) {
    showLoading(v); window.scrollTo(0, 0);
    loadLesson(v.id).then(() => { if (seq === routeSeq) route(); }, () => { if (seq === routeSeq) { app.innerHTML = ''; showLoading(v, true); } });
    return;
  }
  try {
    teardown = r.page === 'viz' && v ? renderViz(app, v, r.step) : r.page === 'ticket' && v ? renderTicket(app, v, r.key)
             : r.page === 'progress' ? renderProgress(app) : r.page === 'teacher' ? renderTeacher(app) : renderHome(app);
  } catch (err) { teardown = null; showRouteError(err); window.scrollTo(0, 0); routedOnce = true; return; }
  const home = !(r.page === 'viz' && v) && !(r.page === 'ticket' && v) && r.page !== 'progress' && r.page !== 'teacher';
  const target = home && r.level ? document.getElementById('level-' + r.level) : home && r.filters ? document.getElementById('finder') : null;
  if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }));
  else window.scrollTo(0, 0);
  try { polishPage(r, r.page === 'viz' && v ? v : null); } catch (e) { console.error(e); }
}
$('#skipLink').addEventListener('click', e => { e.preventDefault(); app.focus({ preventScroll: true }); app.scrollIntoView({ behavior: 'auto' }); });
addEventListener('hashchange', route);
document.querySelectorAll('.nav a, .wordmark').forEach(a => a.addEventListener('click', e => {
  if (location.hash === a.getAttribute('href')) { e.preventDefault(); route(); }
}));
registerStubs();
applyCurriculum();
$('#footStat').textContent = `${VIZ.length} topics live, ${Object.values(PLANNED).flat().filter(t => !VIZ.some(v => v.id === slug(t))).length} in development.`;
route();
