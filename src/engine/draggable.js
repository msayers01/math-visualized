/* Finger-sized hit radius: on coarse pointers (touch) every near() test uses at least 28 px. */
const COARSE_PTR = typeof matchMedia === 'function' ? matchMedia('(pointer: coarse)') : null;
const MIN_TOUCH_R = 28;
/* True when pixel (px, py) is within r pixels of the math point (x, y). */
const near = (plane, x, y, px, py, r = 17) =>
  Math.hypot(plane.X(x) - px, plane.Y(y) - py) < (COARSE_PTR && COARSE_PTR.matches ? Math.max(r, MIN_TOUCH_R) : r);

/* Pointer dragging on a Plane. hit(px,py) returns a handle or null.
   The stage allows vertical page scrolling (touch-action: pan-y), so a swipe that starts on empty canvas scrolls
   the page. A non-passive touchstart that lands on a handle calls preventDefault, which stops the browser from
   starting a scroll, so the drag keeps receiving pointer events. */
function draggable(plane, { hit, move, hover }) {
  const cv = plane.canvas; let active = null; plane.interactive = true;
  const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  /* Touch hit test: the lesson's own test first, then a ring of probes 9 and 18 px around the finger, so lessons that
     hard-code a small radius (Math.hypot(...) < 22) still get a finger-sized target without editing them. */
  const fatHit = (px, py) => {
    const d = hit(px, py); if (d != null) return d;
    for (const rr of [9, 18]) for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4, q = hit(px + rr * Math.cos(a), py + rr * Math.sin(a)); if (q != null) return q;
    }
    return null;
  };
  cv.addEventListener('touchstart', e => {
    if (e.touches.length !== 1 || !e.cancelable) return;
    const [px, py] = pos(e.touches[0]);
    if (fatHit(px, py) != null) e.preventDefault();
  }, { passive: false });
  cv.addEventListener('pointerdown', e => {
    const [px, py] = pos(e); const hd = e.pointerType === 'touch' ? fatHit(px, py) : hit(px, py);
    if (hd == null) return;
    active = hd; cv.setPointerCapture(e.pointerId); e.preventDefault(); cv.style.cursor = 'grabbing';
    move(active, ...plane.toMath(px, py));
  });
  cv.addEventListener('pointermove', e => {
    const [px, py] = pos(e);
    if (active != null) move(active, ...plane.toMath(px, py));
    else if (e.pointerType !== 'touch') cv.style.cursor = (hover ? hover(px, py) : hit(px, py) != null) ? 'grab' : 'default';
  });
  const end = () => { active = null; cv.style.cursor = ''; };
  /* Keyboard: Tab to the stage, arrow keys move the selected handle (Shift = bigger steps), Enter/Space picks the next
     handle. Handles are the ones the Plane drew this frame; the lesson's own hit()/move() do the work, and the step
     grows until the handle actually moves, so lessons that snap to a grid still respond. */
  cv.tabIndex = 0; cv.setAttribute('role', 'application');
  cv.setAttribute('aria-label', 'Interactive figure. Arrow keys move the selected handle; Enter selects the next handle.');
  cv.addEventListener('keydown', e => {
    const n = plane.handles.length; if (!n) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); plane.kbd = true; plane.focusIdx = (plane.focusIdx + 1) % n; plane.draw(); return; }
    const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key]; if (!dir) return;
    e.preventDefault(); plane.kbd = true; plane.touched = true; plane.clearPulses();
    const i = Math.min(plane.focusIdx, n - 1), q = plane.handles[i], hd = hit(q.px, q.py); if (hd == null) { plane.draw(); return; }
    for (const u of (e.shiftKey ? [1, 2] : [.1, .25, .5, 1])) {
      move(hd, q.x + dir[0] * u, q.y + dir[1] * u); plane.draw();
      const q2 = plane.handles[i]; if (!q2 || Math.hypot(q2.px - q.px, q2.py - q.py) > .5) break;
    }
  });
  cv.addEventListener('focus', () => { if (cv.matches(':focus-visible')) { plane.kbd = true; plane.draw(); } });
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
}

/* Lessons with their own canvas pointer code (not draggable) get the same behavior without edits: a pointerdown that
   a lesson handled with preventDefault() (the signal that "this touch is a drag or a press on a control") arms the
   touchstart that follows in the same gesture (Chrome and Safari fire pointerdown first), and that touchstart is
   cancelled so the browser does not start scrolling. A pointerdown the lesson ignored leaves the swipe free to scroll. */
(function () {
  let armed = false;
  addEventListener('pointerdown', e => {
    armed = e.pointerType === 'touch' && e.defaultPrevented && !!(e.target.closest && e.target.closest('.stage'));
  });
  document.addEventListener('touchstart', e => {
    if (armed && e.cancelable && e.touches.length === 1) e.preventDefault();
    armed = false;
  }, { passive: false });
})();
