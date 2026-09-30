/* =====================================================================
   ROUTER
   ===================================================================== */
const app = $('#app'); let teardown = null;
function route() {
  if (teardown) teardown(); teardown = null;
  app.innerHTML = '';
  const m = location.hash.match(/^#\/viz\/([\w-]+)/), v = m && VIZ.find(x => x.id === m[1]);
  const lv = location.hash.match(/^#\/level\/(\w+)/);
  teardown = v ? renderViz(app, v) : renderHome(app);
  const target = lv && document.getElementById('level-' + lv[1]);
  if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }));
  else window.scrollTo(0, 0);
}
addEventListener('hashchange', route);
document.querySelectorAll('.nav a, .wordmark').forEach(a => a.addEventListener('click', e => {
  if (location.hash === a.getAttribute('href')) { e.preventDefault(); route(); }
}));
$('#footStat').textContent = `${VIZ.length} topics live, ${Object.values(PLANNED).flat().length} in development.`;
route();
