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
function route() {
  if (teardown) teardown(); teardown = null;
  app.innerHTML = '';
  const seq = ++routeSeq;
  const r = parseRoute(location.hash), v = r.id && VIZ.find(x => x.id === r.id);
  if (v && (r.page === 'viz' || r.page === 'ticket') && !isLoaded(v)) {
    showLoading(v); window.scrollTo(0, 0);
    loadLesson(v.id).then(() => { if (seq === routeSeq) route(); }, () => { if (seq === routeSeq) { app.innerHTML = ''; showLoading(v, true); } });
    return;
  }
  teardown = r.page === 'viz' && v ? renderViz(app, v, r.step) : r.page === 'ticket' && v ? renderTicket(app, v, r.key)
           : r.page === 'progress' ? renderProgress(app) : renderHome(app);
  const home = !(r.page === 'viz' && v) && !(r.page === 'ticket' && v) && r.page !== 'progress';
  const target = home && r.level ? document.getElementById('level-' + r.level) : home && r.filters ? document.getElementById('finder') : null;
  if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }));
  else window.scrollTo(0, 0);
}
addEventListener('hashchange', route);
document.querySelectorAll('.nav a, .wordmark').forEach(a => a.addEventListener('click', e => {
  if (location.hash === a.getAttribute('href')) { e.preventDefault(); route(); }
}));
registerStubs();
applyCurriculum();
$('#footStat').textContent = `${VIZ.length} topics live, ${Object.values(PLANNED).flat().filter(t => !VIZ.some(v => v.id === slug(t))).length} in development.`;
route();
