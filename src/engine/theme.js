/* ---------- Theme ---------- */
const root = document.documentElement, themeBtn = $('#themeBtn');
const sysDark = matchMedia('(prefers-color-scheme: dark)');
const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : sysDark.matches;
const ICON_SUN = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>';
const ICON_MOON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z"/></svg>';
function syncThemeBtn() {
  const d = isDark(); themeBtn.innerHTML = d ? ICON_SUN : ICON_MOON;
  themeBtn.setAttribute('aria-label', d ? 'Switch to light theme' : 'Switch to dark theme');
}
try { const t = localStorage.getItem('continuum-theme'); if (t) root.dataset.theme = t; } catch (e) {}
syncThemeBtn();
themeBtn.addEventListener('click', () => {
  root.dataset.theme = isDark() ? 'light' : 'dark';
  try { localStorage.setItem('continuum-theme', root.dataset.theme); } catch (e) {}
  syncThemeBtn(); dispatchEvent(new Event('themechange'));
});
sysDark.addEventListener('change', () => { syncThemeBtn(); dispatchEvent(new Event('themechange')); });

/* ---------- MathJax typesetting ---------- */
function typeset(el, tries = 0) {
  if (window.MathJax && MathJax.typesetPromise) {
    MathJax.startup.promise.then(() => MathJax.typesetPromise([el])).catch(() => {});
  } else if (tries < 50) setTimeout(() => typeset(el, tries + 1), 150);
}
