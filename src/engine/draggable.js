/* True when pixel (px, py) is within r pixels of the math point (x, y). */
const near = (plane, x, y, px, py, r = 17) => Math.hypot(plane.X(x) - px, plane.Y(y) - py) < r;

/* Pointer dragging on a Plane. hit(px,py) returns a handle or null. */
function draggable(plane, { hit, move, hover }) {
  const cv = plane.canvas; let active = null;
  const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener('pointerdown', e => {
    const [px, py] = pos(e); const hd = hit(px, py);
    if (hd == null) return;
    active = hd; cv.setPointerCapture(e.pointerId); e.preventDefault();
    move(active, ...plane.toMath(px, py));
  });
  cv.addEventListener('pointermove', e => {
    const [px, py] = pos(e);
    if (active != null) move(active, ...plane.toMath(px, py));
    else cv.style.cursor = (hover ? hover(px, py) : hit(px, py) != null) ? 'grab' : 'default';
  });
  const end = () => { active = null; };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
}
