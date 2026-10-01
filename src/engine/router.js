/* =====================================================================
   ROUTER
   ===================================================================== */
const app = $('#app'); let teardown = null;
function route() {
  if (teardown) teardown(); teardown = null;
  app.innerHTML = '';
  const r = parseRoute(location.hash), v = r.id && VIZ.find(x => x.id === r.id);
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
applyCurriculum();
$('#footStat').textContent = `${VIZ.length} topics live, ${Object.values(PLANNED).flat().filter(t => !VIZ.some(v => v.id === slug(t))).length} in development.`;
route();
