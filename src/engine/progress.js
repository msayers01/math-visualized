/* =====================================================================
   PROGRESS: what this browser has done in each lesson
   Stored on the device only (localStorage, with an in-memory fallback). A teacher sees a class through
   the copyable summary on the progress page, not through a server.
   Per lesson: s = indices of the steps opened, q = { question index: { n: tries, ok: got it right,
   first: right on the first try } }, at = time first opened.
   ===================================================================== */
const Progress = (() => {
  const KEY = 'continuum-progress-v1', NAME = 'continuum-student-name';
  let mem = {}, memName = '';
  const load = () => { try { const d = JSON.parse(localStorage.getItem(KEY)); return d && typeof d === 'object' ? d : mem; } catch (e) { return mem; } };
  const save = d => { mem = d; try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} };
  const touch = (d, id) => (d[id] = d[id] || { s: [], q: {}, at: Date.now() });
  return {
    open(id) { const d = load(); touch(d, id); save(d); },
    step(id, i) { const d = load(), e = touch(d, id); if (!e.s.includes(i)) { e.s.push(i); e.s.sort((a, b) => a - b); } save(d); },
    answer(id, n, right) {
      const d = load(), e = touch(d, id), q = e.q[n] = e.q[n] || { n: 0, ok: false, first: false };
      if (q.ok) return;
      q.n++; if (right) { q.ok = true; q.first = q.n === 1; }
      save(d);
    },
    /* counts and a state for lesson v: new, started or done. A lesson with no steps or checks is done once opened. */
    status(v) {
      const e = load()[v.id], st = v.steps ? v.steps.length : 0, ck = v.check ? v.check.length : 0;
      if (!e) return { seen: 0, st, right: 0, ck, first: 0, state: 'new' };
      const seen = e.s.filter(i => i < st).length, qs = Object.entries(e.q).filter(([n]) => +n < ck).map(([, x]) => x);
      const right = qs.filter(x => x.ok).length, first = qs.filter(x => x.first).length;
      return { seen, st, right, ck, first, state: seen >= st && right >= ck ? 'done' : 'started' };
    },
    reset() { save({}); },
    name: () => { try { return localStorage.getItem(NAME) || ''; } catch (e) { return memName; } },
    setName(v) { memName = v; try { localStorage.setItem(NAME, v); } catch (e) {} },
    /* plain-text summary of every lesson, grouped by course in display order */
    summary(vizList, level = 'school') {
      const rows = vizList.filter(v => v.level === level), done = rows.filter(v => this.status(v).state === 'done').length;
      const out = [`Continuum progress: ${this.name() || 'student'} (${new Date().toLocaleDateString('en-US')})`, `${LEVELS[level].name}: ${done} of ${rows.length} lessons complete`];
      for (const c of COURSES.filter(c => c.level === level)) {
        const items = rows.filter(v => v.course === c.id);
        if (!items.length) continue;
        out.push('', c.name);
        for (const v of items) {
          const s = this.status(v), mark = s.state === 'done' ? '[done]' : s.state === 'started' ? '[in progress]' : '[not started]';
          out.push(`  ${mark} ${v.title}` + (s.st || s.ck ? `: steps ${s.seen}/${s.st}, checks right ${s.right}/${s.ck} (first try ${s.first})` : ''));
        }
      }
      return out.join('\n');
    }
  };
})();
