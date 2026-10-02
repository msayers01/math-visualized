/* =====================================================================
   TOUR: "How this works" for a lesson's tools
   A short guided walk over the figure and the controls: what the tool is for, what each part does and
   something to try. Authored per lesson in src/tours/<id>.json and embedded by the build as TOURS:
     { purpose: 'what this tool is for (1-2 sentences)',
       stops: [ { at: 'stage' | 'steps' | 'check' | 'panel' | 'ctl:<label or button text>', title, text, try? } ],
       teacher?: 'how to use it in class (shown in teacher mode)' }
   A lesson with no authored tour gets one built from its own page (figure, each control, steps, check).
   The spotlight never blocks input, so the student can try each thing while the card is open.
   ===================================================================== */
const TOURS = __TOURS__;
const Tour = (() => {
  const SEEN = 'continuum-tour-seen';
  const seenSet = () => { try { return JSON.parse(localStorage.getItem(SEEN) || '[]'); } catch (e) { return []; } };
  const markSeen = id => { try { const s = seenSet(); if (!s.includes(id)) { s.push(id); localStorage.setItem(SEEN, JSON.stringify(s)); } } catch (e) {} };
  const norm = s => String(s).replace(/\s+/g, ' ').trim().toLowerCase();
  /* find the element a stop points at */
  function resolve(at) {
    const q = s => document.querySelector(s);
    if (at === 'stage') return q('.workbench .stage');
    if (at === 'steps') return q('.panel .steps');
    if (at === 'panel') return q('.workbench .panel');
    if (at === 'check') return q('.check');
    const m = /^ctl:(.*)$/.exec(at || '');
    if (!m) return null;
    const want = norm(m[1]);
    for (const c of document.querySelectorAll('.panel .ctl')) {
      const lab = c.querySelector('label');
      if (lab && norm(lab.textContent).includes(want)) return c;
      if (c.classList.contains('buttons') || c.classList.contains('readout')) { const b = [...c.querySelectorAll('button')].find(x => norm(x.textContent).includes(want)); if (b) return b; }
    }
    return [...document.querySelectorAll('.panel button')].find(x => norm(x.textContent).includes(want)) || null;
  }
  /* a tour built from the page itself, for lessons without an authored one */
  function generic(v) {
    const stops = [{ at: 'stage', title: 'The figure', text: 'This is the picture the lesson is about. It redraws as you change things, so watch it while you use the controls.', try: 'Drag any glowing dot or ring you can see.' }];
    const seen = new Set();
    for (const c of document.querySelectorAll('.panel .ctl')) {
      const lab = c.querySelector('label'), name = lab && lab.textContent.trim();
      if (!name || seen.has(name) || seen.size >= 6) continue;
      seen.add(name);
      const kind = c.classList.contains('slider') ? 'slider' : c.classList.contains('select') ? 'menu' : c.classList.contains('toggle') ? 'switch' : 'control';
      stops.push({ at: 'ctl:' + name, title: name, text: `This ${kind} changes the figure.`, try: kind === 'slider' ? 'Slide it slowly and watch what moves.' : kind === 'menu' ? 'Open it and pick another option.' : 'Click it and see what changes.' });
    }
    stops.push({ at: 'steps', title: 'Steps', text: 'The lesson is a short guided walk. Next moves the figure to the next idea. Back returns.' });
    stops.push({ at: 'check', title: 'Quick check', text: 'A few questions at the end. A wrong answer is fine: you can try again.' });
    return { purpose: v.blurb || '', stops };
  }
  const tourFor = v => TOURS[v.id] || generic(v);
  let live = null;
  function close(done) {
    if (!live) return;
    const { root, spot, onKey, onMove, from, id } = live; live = null;
    removeEventListener('keydown', onKey, true); removeEventListener('resize', onMove); removeEventListener('scroll', onMove, true);
    root.remove(); spot.remove(); if (done) markSeen(id);
    try { if (from && document.contains(from)) from.focus({ preventScroll: true }); } catch (e) {}
    document.querySelectorAll('.tour-btn').forEach(b => b.classList.remove('is-new'));
  }
  function start(v, opener) {
    close(false);
    const t = tourFor(v), canTeach = typeof TeacherMode !== 'undefined' && TeacherMode.configured && TeacherMode.active();
    const stops = [{ at: 'stage', title: 'What this is for', text: t.purpose || v.blurb || '', first: true }]
      .concat((t.stops || []).filter(s => s.at !== 'stage' || !t.purpose))
      .concat(canTeach && t.teacher ? [{ at: 'panel', title: 'For teachers', text: t.teacher, teacher: true }] : [])
      .map(s => ({ ...s, el: null }));
    let i = 0;
    const title = h('h2', { class: 'tour-title', id: 'tour-title' }), text = h('p', { class: 'tour-text' }), tryIt = h('p', { class: 'tour-try' });
    const count = h('span', { class: 'tour-count', 'aria-live': 'polite' });
    const back = h('button', { type: 'button', class: 'btn small', onclick: () => go(-1) }, 'Back');
    const next = h('button', { type: 'button', class: 'btn primary small', onclick: () => go(1) }, 'Next');
    const skip = h('button', { type: 'button', class: 'btn small tour-skip', onclick: () => close(true) }, 'Close');
    const root = h('div', { class: 'tour-card', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'tour-title', tabindex: '-1' },
      count, title, text, tryIt, h('div', { class: 'tour-btns' }, skip, back, next));
    const spot = h('div', { class: 'tour-spot', 'aria-hidden': 'true' });
    document.body.append(spot, root);
    const place = () => {
      const s = stops[i], el = s.el && document.contains(s.el) ? s.el : null;
      if (!el) { spot.style.display = 'none'; root.style.cssText = ''; return; }
      const r = el.getBoundingClientRect(), pad = 6, vw = innerWidth, vh = innerHeight;
      spot.style.display = 'block';
      Object.assign(spot.style, { left: r.left - pad + 'px', top: r.top - pad + 'px', width: r.width + 2 * pad + 'px', height: r.height + 2 * pad + 'px' });
      if (vw <= 700) { root.style.cssText = ''; return; }   /* phones: the card is a bottom sheet (CSS) */
      const w = Math.min(340, vw - 24), h2 = root.offsetHeight || 200;
      let left, top;
      if (r.width > vw * .55 || r.height > vh * .6) { left = r.left + 14; top = Math.min(vh - h2 - 14, Math.max(14, r.bottom - h2 - 14)); }
      else if (vw - r.right >= w + 20) { left = r.right + 14; top = r.top; }
      else if (r.left >= w + 20) { left = r.left - w - 14; top = r.top; }
      else { left = r.left; top = r.bottom + 14 > vh - h2 ? Math.max(14, r.top - h2 - 14) : r.bottom + 14; }
      left = Math.min(Math.max(12, left), vw - w - 12); top = Math.min(Math.max(12, top), vh - h2 - 12);
      root.style.cssText = `left:${left}px;top:${top}px;width:${w}px;right:auto;bottom:auto;`;
    };
    let raf = 0;
    const onMove = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(place); };
    const show = () => {
      const s = stops[i];
      s.el = resolve(s.at);
      count.textContent = `${i + 1} of ${stops.length}`;
      title.textContent = s.title || ''; text.textContent = s.text || '';
      tryIt.textContent = ''; tryIt.hidden = !s.try; if (s.try) tryIt.append(h('b', {}, 'Try it: '), s.try);
      back.disabled = i === 0; next.textContent = i === stops.length - 1 ? 'Done' : 'Next';
      if (s.el) {
        try {
          if (innerWidth <= 700 && s.at !== 'stage') {   /* phone: keep the target between the pinned figure and the bottom card */
            const st = document.querySelector('.workbench .stage'), top = st ? st.getBoundingClientRect().bottom + 12 : 70;
            scrollBy(0, s.el.getBoundingClientRect().top - top);
          } else s.el.scrollIntoView({ block: s.at === 'stage' ? 'nearest' : 'center', behavior: 'auto' });
        } catch (e) {}
      }
      place(); requestAnimationFrame(place);
      root.focus({ preventScroll: true });
    };
    const go = d => {
      if (d > 0 && i === stops.length - 1) { close(true); return; }
      i = Math.max(0, Math.min(stops.length - 1, i + d));
      /* skip a stop whose target is not on the page in this state */
      while (i > 0 && i < stops.length - 1 && !resolve(stops[i].at)) i += d || 1;
      show();
    };
    const onKey = e => {
      if (e.key === 'Escape') { e.preventDefault(); close(true); }
      else if (root.contains(document.activeElement) && e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (root.contains(document.activeElement) && e.key === 'ArrowLeft' && i > 0) { e.preventDefault(); go(-1); }
    };
    addEventListener('keydown', onKey, true); addEventListener('resize', onMove); addEventListener('scroll', onMove, true);
    live = { root, spot, onKey, onMove, from: opener, id: v.id };
    show();
  }
  const has = v => !!TOURS[v.id];
  function button(v) {
    const b = h('button', { type: 'button', class: 'btn small tour-btn' + (seenSet().includes(v.id) ? '' : ' is-new'), 'aria-haspopup': 'dialog', title: 'A short walk through this lesson\'s tools',
      onclick: () => start(v, b) }, h('span', { class: 'tour-dot', 'aria-hidden': 'true' }), 'How this works');
    return b;
  }
  addEventListener('hashchange', () => close(false));
  return { button, start, close, has, resolve, tourFor };
})();
