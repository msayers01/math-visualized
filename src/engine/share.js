/* =====================================================================
   ROUTES AND SHARE LINKS
   Only a plain anchor (letters, digits, . _ ~ -) from a link to the artifact viewer reaches the
   page's location.hash, so every shareable view has a plain token:
     #<lesson-id>             a lesson           #<lesson-id>.3     the lesson at step 3
     #<lesson-id>.ticket      its exit ticket    #<lesson-id>.key   the ticket with answers
     #find~grade_8~skill_intro~std_8.2.4.1       the lesson finder with filters (repeat a key for several values)
     #progress                the progress page  #school | #ugrad | #grad   a level
   The older #/viz/<id>, #/level/<id> and #/?grade=8 forms still work.
   ===================================================================== */
function parseRoute(hash, ids = VIZ.map(v => v.id)) {
  const old = hash.match(/^#\/viz\/([\w-]+)/);
  if (old) return { page: 'viz', id: old[1], step: 0 };
  const lv = hash.match(/^#\/level\/(\w+)/);
  if (lv) return { page: 'home', level: lv[1] };
  if (/^#\/\?/.test(hash) || /^#find(~|$)/.test(hash)) return { page: 'home', filters: true };
  const t = hash.slice(1);
  if (t === 'progress') return { page: 'progress' };
  if (Object.hasOwn(LEVELS, t)) return { page: 'home', level: t };
  const m = t.match(/^([a-z0-9-]+)(?:\.([a-z0-9]+))?$/);
  if (m && ids.includes(m[1])) {
    if (!m[2]) return { page: 'viz', id: m[1], step: 0 };
    if (/^\d+$/.test(m[2])) return { page: 'viz', id: m[1], step: Math.max(0, +m[2] - 1) };
    if (m[2] === 'ticket' || m[2] === 'key') return { page: 'ticket', id: m[1], key: m[2] === 'key' };
  }
  return { page: 'home' };
}
const lessonToken = (id, step = 0) => '#' + id + (step > 0 ? '.' + (step + 1) : '');
const ticketToken = (id, key) => '#' + id + (key ? '.key' : '.ticket');
function filterToken(F) {
  const q = [];
  for (const f of FACETS) for (const x of Array.isArray(F[f]) ? F[f] : F[f] ? [F[f]] : []) q.push(f + '_' + x);
  return '#find' + (q.length ? '~' + q.join('~') : '');
}

/* true when the page runs inside another page (the artifact viewer), where location is not the shareable address */
const embedded = (() => { try { return window.top !== window.self; } catch (e) { return true; } })();
/* the address to hand out for a token; inside the viewer only the token is known */
const shareUrl = token => embedded ? token : location.href.split('#')[0] + token;
const canPrint = !embedded && typeof window.print === 'function';

/* Copy text to the clipboard; resolves true on success. Falls back to execCommand, then to false. */
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (e) {}
  try {
    const ta = h('textarea', { style: 'position:fixed;left:-9999px;top:0', 'aria-hidden': 'true' }); ta.value = text;
    document.body.append(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return !!ok;
  } catch (e) { return false; }
}

/* A button that copies getText(). If the browser refuses, a selected text box appears instead. */
function CopyButton(label, getText, { cls = 'btn small', title = '' } = {}) {
  const box = h('input', { class: 'copy-fallback', type: 'text', readonly: '', 'aria-label': 'Select and copy this text', hidden: '' });
  const btn = h('button', { type: 'button', class: cls, title, onclick: async () => {
    const text = getText();
    if (await copyText(text)) { box.hidden = true; btn.textContent = 'Copied'; setTimeout(() => { btn.textContent = label; }, 1600); }
    else { box.value = text; box.hidden = false; box.focus(); box.select(); }
  } }, label);
  return h('span', { class: 'copy' }, btn, box);
}

/* TeX flattened to readable plain text (used for plain-text copies and when MathJax cannot load) */
function texFlat(s) {
  const sup = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻' };
  const arg = t => t.replace(/^\{|\}$/g, ''), part = t => (/^[-−]?[A-Za-z0-9._]+$/.test(t) ? t : '(' + t + ')');
  return String(s).replace(/\\\(|\\\)|\\\[|\\\]/g, '')
    .replace(/\\(?:text|mathrm|mathbf|operatorname)\{([^}]*)\}/g, '$1').replace(/\\[td]?frac\s*(\{(?:[^{}]|\{[^{}]*\})*\}|[^\s{}])\s*(\{(?:[^{}]|\{[^{}]*\})*\}|[^\s{}])/g, (_, a, b) => part(arg(a)) + '/' + part(arg(b)))
    .replace(/\\sqrt\{([^}]*)\}/g, '√($1)').replace(/\\sqrt(\d+)/g, '√$1')
    .replace(/\^\{(-?\d+)\}/g, (_, d) => [...d].map(c => sup[c] || c).join('')).replace(/\^\{([^{}]+)\}/g, '^($1)').replace(/\^(\d)/g, (_, d) => sup[d]).replace(/\\times/g, '×').replace(/\\cdot/g, '·').replace(/\\div/g, '÷')
    .replace(/\\pm/g, '±').replace(/\\pi/g, 'π').replace(/\\theta/g, 'θ').replace(/\\circ/g, '°').replace(/\\approx/g, '≈').replace(/\\neq/g, '≠')
    .replace(/\\le(?:q)?\b/g, '≤').replace(/\\ge(?:q)?\b/g, '≥').replace(/\\ldots|\\cdots/g, '...').replace(/\\(?:Longrightarrow|Rightarrow|implies)\b/g, '⇒').replace(/\\(?:Leftrightarrow|iff)\b/g, '⇔').replace(/\\(?:rightarrow|to)\b/g, '→').replace(/\\left|\\right/g, '')
    .replace(/\\q?quad/g, '  ').replace(/\\[,;!]|\\ /g, ' ').replace(/\\([a-zA-Z]+)/g, '$1').replace(/[{}]/g, '');
}
/* TeX in quick-check text (an HTML string), flattened for plain-text copies */
function texToText(s) {
  return texFlat(String(s).replace(/<\/?[a-zA-Z][^>]*>/g, '')).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}
