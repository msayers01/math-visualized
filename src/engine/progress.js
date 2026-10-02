/* =====================================================================
   PROGRESS: what this browser has done in each lesson
   Stored on the device only (localStorage, with an in-memory fallback). A teacher sees a class through
   the copyable summary on the progress page, not through a server.
   Per lesson: s = indices of the steps opened, q = { question index: { n: tries, ok: got it right,
   first: right on the first try } }, at = time first opened. The lesson opened last (and its step) is kept
   under a second key, so the home page can offer "Continue where you left off".
   Storage can be blocked or full: reads and writes are guarded, and once a write fails the in-memory copy
   is the truth for the rest of the visit (storageOk() tells the progress page to warn).
   ===================================================================== */
const Progress = (() => {
  const KEY = 'continuum-progress-v1', NAME = 'continuum-student-name', LAST = 'continuum-progress-last';
  let mem = {}, memName = '', memLast = null, failed = false, nameFailed = false, rawSeen = null, parsed = null;
  const tidy = d => {   /* a hand-edited or damaged store must not throw later */
    const out = {};
    if (d && typeof d === 'object' && !Array.isArray(d)) for (const [id, e] of Object.entries(d)) {
      if (!e || typeof e !== 'object') continue;
      const q = {};
      if (e.q && typeof e.q === 'object') for (const [n, x] of Object.entries(e.q)) if (x && typeof x === 'object') q[n] = { n: +x.n || 0, ok: !!x.ok, first: !!x.first };
      out[id] = { s: Array.isArray(e.s) ? e.s.filter(i => Number.isInteger(i) && i >= 0) : [], q, at: +e.at || 0 };
    }
    return out;
  };
  const load = () => {
    if (failed) return mem;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw === rawSeen && parsed) return parsed;      /* unchanged since the last read: no parse (the progress page asks 100+ times) */
      rawSeen = raw; parsed = raw ? tidy(JSON.parse(raw)) : {};
      return parsed;
    } catch (e) { return mem; }
  };
  const save = d => {
    mem = d;
    try { const raw = JSON.stringify(d); localStorage.setItem(KEY, raw); rawSeen = raw; parsed = d; }
    catch (e) { failed = true; }
  };
  const touch = (d, id) => (d[id] = d[id] || { s: [], q: {}, at: Date.now() });
  const setLast = (id, step) => {
    memLast = { id, step, at: Date.now() };
    try { localStorage.setItem(LAST, JSON.stringify(memLast)); } catch (e) {}
  };
  return {
    open(id) { const d = load(); touch(d, id); save(d); setLast(id, 0); },
    step(id, i) { const d = load(), e = touch(d, id); if (!e.s.includes(i)) { e.s.push(i); e.s.sort((a, b) => a - b); } save(d); setLast(id, i); },
    answer(id, n, right) {
      const d = load(), e = touch(d, id), q = e.q[n] = e.q[n] || { n: 0, ok: false, first: false };
      if (q.ok) return;
      q.n++; if (right) { q.ok = true; q.first = q.n === 1; }
      save(d);
    },
    /* the lesson opened last: { id, step (0-based), at }, or null */
    last() {
      let l = memLast;
      if (!failed) try { const x = JSON.parse(localStorage.getItem(LAST)); if (x && typeof x.id === 'string') l = { id: x.id, step: Math.max(0, +x.step || 0), at: +x.at || 0 }; } catch (e) {}
      return l && load()[l.id] ? l : null;
    },
    /* false when this browser refuses to keep progress (private or blocked storage): it is then lost when the tab closes */
    storageOk() {
      if (failed) return false;
      try { localStorage.setItem('continuum-probe', '1'); localStorage.removeItem('continuum-probe'); return true; } catch (e) { return false; }
    },
    /* counts and a state for lesson v: new, started or done. A lesson with no steps or checks is done once opened. */
    status(v) {
      const e = load()[v.id], st = v.steps ? v.steps.length : 0, ck = v.check ? v.check.length : 0;
      if (!e) return { seen: 0, st, right: 0, ck, first: 0, state: 'new' };
      const seen = e.s.filter(i => i < st).length, qs = Object.entries(e.q).filter(([n]) => +n < ck).map(([, x]) => x);
      const right = qs.filter(x => x.ok).length, first = qs.filter(x => x.first).length;
      return { seen, st, right, ck, first, state: seen >= st && right >= ck ? 'done' : 'started' };
    },
    reset() { save({}); memLast = null; try { localStorage.removeItem(LAST); } catch (e) {} },
    name: () => { if (!nameFailed) { try { return localStorage.getItem(NAME) || memName; } catch (e) {} } return memName; },
    setName(v) { memName = v; try { localStorage.setItem(NAME, v); } catch (e) { nameFailed = true; } },
    /* plain-text summary of every lesson of a level (every level when omitted), grouped by course in display order */
    summary(vizList, level) {
      const levels = level ? [level] : LEVEL_ORDER.filter(l => vizList.some(v => v.level === l));
      const all = vizList.filter(v => levels.includes(v.level)), doneAll = all.filter(v => this.status(v).state === 'done').length;
      const out = [`Continuum progress: ${this.name() || 'student'} (${new Date().toLocaleDateString('en-US')})`, `${doneAll} of ${all.length} lessons complete`];
      for (const l of levels) {
        const rows = vizList.filter(v => v.level === l), done = rows.filter(v => this.status(v).state === 'done').length;
        if (levels.length > 1) out.push('', `${LEVELS[l].name}: ${done} of ${rows.length} lessons complete`);
        for (const c of COURSES.filter(c => c.level === l)) {
          const items = rows.filter(v => v.course === c.id);
          if (!items.length) continue;
          out.push('', c.name);
          for (const v of items) {
            const s = this.status(v), mark = s.state === 'done' ? '[done]' : s.state === 'started' ? '[in progress]' : '[not started]';
            out.push(`  ${mark} ${v.title}` + (s.st || s.ck ? `: steps ${s.seen}/${s.st}, checks right ${s.right}/${s.ck} (first try ${s.first})` : ''));
          }
        }
      }
      return out.join('\n');
    }
  };
})();
