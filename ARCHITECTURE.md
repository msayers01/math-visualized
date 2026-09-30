# Continuum: Architecture

Interactive, 3Blue1Brown-style math visualization website covering three levels: middle & high school, undergraduate, and graduate.

**Version:** 0.4 (Phase 1 of 5, visual redesign + Sora type)
**Last updated:** 2026-09-30

## 1. Deployment model

- One self-contained file: `index.html` (HTML + CSS + JS inline), published as a claude.ai artifact link.
- External resources allowed by the host: scripts from cdnjs, stylesheets/fonts from Google Fonts. Nothing else loads.
- Dependencies:
  - MathJax 3.2.2 (`tex-svg`, cdnjs) for equations in explanation text. SVG output, so no font files are needed.
  - Google Fonts: Sora 200–600 (display headings, wordmark, level numbers), Hanken Grotesk (explanation prose, UI, controls, numeric readouts, plain canvas labels), STIX Two Text italic (italic math symbols on canvases only, to match MathJax).
- No build step, no framework. Plain JavaScript and Canvas 2D.

## 2. File layout (inside `index.html`)

| Section | Purpose |
|---|---|
| `<style>` Design tokens | Color/type variables for light and dark themes |
| `<style>` Base / Home / Viz page | Layout and component styles |
| Core utilities | `h()` DOM builder, `clamp`, `lerp`, `ease`, `tween`, `fmt`, `palette()`, `alpha()` |
| Theme | Light/dark toggle (sun/moon icon button), system preference, `themechange` event |
| `typeset()` | Waits for MathJax, then typesets a container |
| `Plane` class | Math-coordinate canvas with drawing primitives |
| `draggable()` | Pointer-drag helper for canvas handles |
| `Controls()` | Builds the side panel (sliders, buttons, selects, toggles, readouts) |
| Registry | `LEVELS`, `VIZ[]`, `register()`, `PLANNED` |
| Visualizations | One `register({...})` block per topic |
| Pages | `renderHome()` (hero + live readout, level sections, thumbnails), `renderViz()` (breadcrumb, stage, panel, prose, pager) |
| Router | Hash routing and teardown |

## 3. Routing

- `#/` or empty: home page (hero animation + topic lists per level).
- `#/viz/<id>`: visualization page.
- `#/level/<school|ugrad|grad>`: home page scrolled to that level (used by the top nav and breadcrumbs).
- On every route change the previous page's teardown function runs (cancels animation frames, disconnects observers, removes listeners).

## 4. Visualization module contract

Each topic is a plain object passed to `register()`:

```js
register({
  id: 'kebab-case-id',          // used in the URL
  level: 'school' | 'ugrad' | 'grad',
  title: 'Display title',
  blurb: 'One sentence shown on the home list and page header',
  explain: String.raw`...HTML with \( \) and \[ \] TeX...`,
  thumb(ctx, plane) { /* optional: static preview drawn on the home page */ },
  mount({ stage, controls }) {  // stage: sized <div>; controls: Controls API
    // create a Plane, wire controls, start any intro animation
    return () => { /* teardown */ };
  }
});
```

`thumb` is optional; without it the home row shows an empty thumbnail frame. Topic order in `VIZ` sets the Previous/Next pager.

Adding a topic = one new `register()` block, and removing its title from `PLANNED`. No other code changes.

## 5. Shared engine

**Plane** (`new Plane(host, {cx, cy, span, transparent})`)
- `transparent: true` skips the background fill (used by the hero so the page's dot grid shows through).
- If the host has a `data-coords` attribute, Plane adds a live pointer-coordinate readout (`.coord`) in math units.
- Auto-resizes with `ResizeObserver`, handles device pixel ratio (capped at 2.5).
- `span` = half-width of the visible region along the shorter screen side, in math units.
- Coordinates: `X(x)`, `Y(y)` math→pixels; `toMath(px, py)` pixels→math; `bounds()`.
- Drawing: `grid`, `path`, `curve` (breaks at singularities/jumps), `arrow`, `dot`, `label`.
- `onDraw(ctx, plane)` is set by the visualization; `draw()` redraws now, `requestDraw()` batches into the next frame.
- Reads colors from CSS variables on each draw, so theme switches recolor canvases.

**Animation:** `tween(ms, update, done)` returns a cancel function. Honors `prefers-reduced-motion` by jumping straight to the end state.

**Controls:** `title`, `hint`, `slider`, `buttons`, `select`, `toggle`, `readout`. Sliders return `{ set, get }` so animations can keep them in sync. Sliders set a `--p` CSS variable so the brass track fill follows the value.

## 6. Design system

Direction: **precision instruments, modern and sleek**. Midnight ink or cool paper, brass as the single accent, hairline rules, a slim geometric display face in light weights, and color reserved for mathematical meaning.

- Light: paper `#F1F3F6`, ink `#121A2B`, brass `#8C6A2A`. Dark: midnight `#0F1524`, stage `#0C1220`, text `#ECEFF5`, brass `#D4B26A`.
- Page background carries a faint 32px dot grid (graph paper).
- Math object colors (Manim-inspired, tuned per theme): blue (grid/lines), yellow (areas), green (î / first direction), red (ĵ / second direction), violet (eigen/special structure). Brass is never used for math objects.
- Level colors: school = green, undergrad = blue, graduate = red (level numbers 01, 02, 03 on the home page, dots in breadcrumbs).
- Type: Sora for headings, topic titles, and level numbers (tight negative tracking; hero and page titles at 300, section and topic titles at 400, level numbers at 200, wordmark at 500); Hanken Grotesk for body, prose, and UI with tabular numerals for readouts. `Plane.label()` uses STIX Two italic when `italic: true` (math symbols) and Hanken Grotesk otherwise.
- Components: sticky translucent top bar with blur; pill buttons (primary = brass fill); thin brass slider tracks with ring thumbs; custom toggle switches; stage framed with brass corner ticks; glass control panel that stays in view on desktop.
- Signature element: the hero's live instrument readout (matrix, determinant, eigenvalues) synced to the animated grid.
- Motion: one orchestrated headline rise on load; everything else responds to user action. All motion disabled under `prefers-reduced-motion`.
- Mobile: panel stacks under the canvas below 900px; top-bar level links hide below 640px; hero canvas sits above the headline; canvas uses `touch-action: none` so drags do not scroll.
- Safe-area insets and `viewport-fit=cover` for phones.

## 7. Visualizations

| ID | Level | Title | Key interactions |
|---|---|---|---|
| `pythagorean-theorem` | school | The Pythagorean theorem | Legs a, b sliders; rearrangement progress; play/reverse. Three triangles translate (no rotation) between the c² and a²+b² arrangements. |
| `linear-transformations` | ugrad | Linear transformations and eigenvectors | Matrix entry sliders; drag î/ĵ tips; presets; determinant area; eigenvector lines via `eig2()`. |
| `conformal-maps` | grad | Conformal maps of the complex plane | Six maps (z², eᶻ, 1/z, sin z, Joukowski, Cayley); rectangular/polar grids; draggable probe showing local scale/rotation from f′(z₀). |

## 8. Roadmap

- **Phase 1 (done):** shell, engine, 3 starter visualizations.
- **Phase 2:** school batch: slope, unit circle and trig waves, quadratics, probability.
- **Phase 3:** undergrad batch: derivatives, Riemann sums, Fourier epicycles, Taylor series.
- **Phase 4:** graduate batch: Cayley graphs, homotopy, Fourier transform, manifolds.
- **Phase 5:** search, progress tracking, polish.

## 9. Change log

- **0.4 (2026-09-30):** Display face changed from Unbounded to Sora for a sleeker, lighter look; weights and sizes retuned.
- **0.3 (2026-09-30):** Type update. Replaced Bodoni Moda with Unbounded for display; explanation prose moved from STIX Two Text to Hanken Grotesk; canvas non-italic labels now sans; level markers changed from I/II/III to 01/02/03; display sizes retuned for the wider face.
- **0.2 (2026-09-30):** Visual redesign ("drafting instruments"). New fonts (Bodoni Moda, Hanken Grotesk), brass accent, dot-grid background, sticky blurred top bar with level links and icon theme toggle, full-bleed hero with live matrix readout, numbered level sections, topic thumbnails (`thumb` in the module contract), breadcrumb and Previous/Next pager, stage corner ticks and pointer coordinates (`data-coords`), custom sliders/toggles/selects, `#/level/<id>` route, `Plane` `transparent` option.
- **0.1 (2026-09-30):** Initial build. Core engine (Plane, Controls, tween, draggable), hash router, light/dark theme, home page with animated hero, three visualizations.
