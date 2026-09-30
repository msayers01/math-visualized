/* =====================================================================
   CORE UTILITIES
   ===================================================================== */
const $ = (s, el = document) => el.querySelector(s);
function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c != null) e.append(c instanceof Node ? c : document.createTextNode(c));
  return e;
}
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = (v, n = 2) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(n);

function tween(ms, update, done) {
  if (reduceMotion) { update(1); done && done(); return () => {}; }
  let start = null, id, alive = true;
  const step = now => {
    if (!alive) return;
    if (start === null) start = now;
    const p = clamp((now - start) / ms, 0, 1);
    update(p);
    if (p < 1) id = requestAnimationFrame(step); else done && done();
  };
  id = requestAnimationFrame(step);
  return () => { alive = false; cancelAnimationFrame(id); };
}

/* Animate the numeric fields of `st` to `patch` (used by guided steps). Returns a cancel function. */
function animateTo(st, patch, ms, update, done) {
  const keys = Object.keys(patch), from = {};
  for (const k of keys) from[k] = st[k];
  return tween(ms, p => {
    for (const k of keys) st[k] = p >= 1 ? patch[k] : lerp(from[k], patch[k], ease(p));
    update();
  }, done);
}

function palette() {
  const cs = getComputedStyle(document.documentElement), o = {};
  for (const k of ['bg','text','muted','stage','grid','grid-strong','axis','brass','blue','yellow','green','red','violet'])
    o[k] = cs.getPropertyValue('--' + k).trim();
  return o;
}
function alpha(hex, a) {
  const m = hex.replace('#', '');
  return `rgba(${parseInt(m.slice(0,2),16)},${parseInt(m.slice(2,4),16)},${parseInt(m.slice(4,6),16)},${a})`;
}
