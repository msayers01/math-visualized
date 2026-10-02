/* =====================================================================
   TEACHER MODE: a soft gate for teacher-only views (today: the exit-ticket answer key)
   The site is static, so this is not real security. A student who reads the page source can find the
   quick-check answers, which every lesson needs for its own feedback. The gate keeps the key from being
   found by accident. The build bakes in only a salted PBKDF2 hash of the shared teacher password
   (CONTINUUM_TEACHER_PASSWORD, or teacher-password.txt, see tools/build.js); the password is never stored in
   the page. With no password configured the gate is off and teacher views stay open.
   Unlocking lasts 8 hours on this device (localStorage), and the footer button locks it again.
   ===================================================================== */
const TeacherMode = (() => {
  const CFG = '__TEACHER_HASH__';   /* replaced at build time: '' or 'iterations:saltHex:hashHex' */
  const STORE = 'continuum-teacher-until', HOURS = 8;
  const configured = /^\d+:[0-9a-f]+:[0-9a-f]+$/.test(CFG);
  let memUntil = 0;
  const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  const unhex = s => new Uint8Array(s.match(/../g).map(x => parseInt(x, 16)));
  const until = () => { let t = memUntil; try { t = Math.max(t, +localStorage.getItem(STORE) || 0); } catch (e) {} return t; };
  const active = () => !configured || until() > Date.now();
  const canCheck = () => !!(window.crypto && crypto.subtle);
  const listeners = [];
  const changed = () => { listeners.forEach(f => { try { f(); } catch (e) { console.error(e); } }); };
  async function unlock(pw) {
    if (!configured) return true;
    if (!canCheck()) throw new Error('Teacher mode needs a secure (https) page.');
    const [it, salt, want] = CFG.split(':');
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(String(pw).normalize('NFKC')), 'PBKDF2', false, ['deriveBits']);
    const got = hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unhex(salt), iterations: +it }, key, 256));
    let diff = got.length ^ want.length;
    for (let i = 0; i < got.length && i < want.length; i++) diff |= got.charCodeAt(i) ^ want.charCodeAt(i);
    if (diff) return false;
    memUntil = Date.now() + HOURS * 36e5;
    try { localStorage.setItem(STORE, String(memUntil)); } catch (e) {}
    changed();
    return true;
  }
  function lock() { memUntil = 0; try { localStorage.removeItem(STORE); } catch (e) {} changed(); }
  return { configured, active, unlock, lock, canCheck, onChange: f => listeners.push(f) };
})();

/* The password form, used on the locked answer-key page. onDone runs after a correct password. */
function TeacherLogin(onDone) {
  const pw = h('input', { type: 'password', id: 'teacher-pw', autocomplete: 'current-password', 'aria-describedby': 'teacher-msg' });
  const msg = h('p', { id: 'teacher-msg', class: 'teacher-msg', role: 'status' });
  const go = h('button', { type: 'submit', class: 'btn primary' }, 'Unlock teacher mode');
  return h('form', { class: 'teacher-login', onsubmit: async e => {
    e.preventDefault(); if (!pw.value) { msg.textContent = 'Enter the teacher password.'; pw.focus(); return; }
    go.disabled = true; msg.textContent = 'Checking...';
    try {
      if (await TeacherMode.unlock(pw.value)) { msg.textContent = ''; onDone(); return; }
      msg.textContent = 'That password is not right.'; pw.select();
    } catch (err) { msg.textContent = err.message; }
    go.disabled = false; pw.focus();
  } }, h('label', { for: 'teacher-pw' }, 'Teacher password'), h('div', { class: 'teacher-row' }, pw, go), msg);
}

/* Footer button: "Teacher mode" opens the key page's prompt, or shows the state and a Lock button. */
(() => {
  const btn = document.getElementById('teacherBtn');
  if (!btn || !TeacherMode.configured) { if (btn) btn.hidden = true; return; }
  const paint = () => {
    const on = TeacherMode.active();
    btn.textContent = on ? 'Teacher mode on. Lock' : 'Teacher mode';
    btn.setAttribute('aria-pressed', String(on));
    document.documentElement.classList.toggle('teacher-on', on);
  };
  btn.addEventListener('click', () => {
    if (TeacherMode.active()) TeacherMode.lock();
    else location.hash = '#teacher';
  });
  TeacherMode.onChange(() => { paint(); if (typeof route === 'function') route(); });
  paint();
})();
