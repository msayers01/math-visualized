# Continuum: Architecture

Interactive, 3Blue1Brown-style math visualization website covering three levels: middle & high school, undergraduate, and graduate.

**Version:** 0.7 (Phase 4: nine school lessons)
**Last updated:** 2026-09-30

## 1. Deployment model

- One self-contained file: `index.html` (HTML + CSS + JS inline), published as a claude.ai artifact link. **`index.html` is generated**: edit files under `src/` and run `node tools/build.js` (`--check` fails if `index.html` is stale). Commit both.
- External resources allowed by the host: scripts from cdnjs, stylesheets/fonts from Google Fonts. Nothing else loads.
- Dependencies:
  - MathJax 3.2.2 (`tex-svg`, cdnjs) for equations in explanation text. SVG output, so no font files are needed.
  - Google Fonts: Sora 200–600 (display headings, wordmark, level numbers), Hanken Grotesk (explanation prose, UI, controls, numeric readouts, plain canvas labels), STIX Two Text italic (italic math symbols on canvases only, to match MathJax).
- No framework. Plain JavaScript and Canvas 2D. The only build step is concatenation (`tools/build.js`, Node, no dependencies).

## 2. Source layout

```
src/template.html        page shell with /*@STYLES*/ and /*@SCRIPTS*/ markers
src/manifest.json        ordered lists: styles, engine, lessons, app
src/styles/*.css         tokens, shell (top bar/hero/levels), viz (page + controls), prose, lesson, motion
src/engine/*.js          core, theme (+typeset), plane, draggable, controls, math, registry, lesson, pages, router
src/lessons/<level>/<id>.js   one register({...}) per lesson
tools/build.js           concatenates everything into index.html
```

- Script order: `engine` files, then `lessons` (their order is the pager order within a level), then `app` (`pages.js`, `router.js`, which calls `route()`).
- The build refuses to run if a file under `src/lessons/` is missing from `manifest.json`.
- Adding a lesson = one new file in `src/lessons/<level>/`, one line in `manifest.json`, and (if it was planned) nothing else, since the planned entry is matched by slug and disappears once the id exists.

| Engine file | Purpose |
|---|---|
| `core.js` | `h()` DOM builder, `clamp`, `lerp`, `ease`, `snap`, `tween`, `animateTo`, `fmt`, `palette()`, `alpha()` |
| `theme.js` | Light/dark toggle, system preference, `themechange` event, `typeset()` (MathJax) |
| `plane.js` / `draggable.js` / `controls.js` | `Plane` (incl. `ticks()` axis numbers), pointer-drag helper plus `near()` hit test, side-panel builder |
| `math.js` | Shared math helpers (`eig2`, `num`, `linEq`, `TAU`) |
| `registry.js` | `LEVELS`, `VIZ[]`, `register()`, `PLANNED`, `slug()`, `lessonRef()` |
| `lesson.js` | `Stepper`, `QuickCheck`, `Connections` (lesson format components) |
| `pages.js` | `renderHome()` (hero + live readout, level sections, thumbnails), `renderViz()` (lesson page) |
| `router.js` | Hash routing and teardown |

## 3. Routing

- `#/` or empty: home page (hero animation + topic lists per level).
- `#/viz/<id>`: visualization page.
- `#/level/<school|ugrad|grad>`: home page scrolled to that level (used by the top nav and breadcrumbs).
- On every route change the previous page's teardown function runs (cancels animation frames, disconnects observers, removes listeners).

## 4. Lesson module contract

Each lesson is a plain object passed to `register()`. Only `id`, `level`, `title`, `blurb`, and `mount` are required; every lesson-format field is optional, so legacy lessons (with only `explain`) keep working.

```js
register({
  id: 'kebab-case-id',          // URL slug; for a planned lesson, the slug of its PLANNED title
  level: 'school' | 'ugrad' | 'grad',
  title: 'Display title',
  blurb: 'One sentence shown on the home list (and on the page when there is no hook)',
  thumb(ctx, plane) { /* optional: static preview drawn on the home page */ },

  // --- lesson format (Phase 2) ---
  hook: 'Question shown under the title (TeX allowed)',
  steps: [{ title, text /* HTML+TeX */, set /* optional state patch */ }],   // "Try this" stepper in the side panel
  formal: `...HTML+TeX; use <h3> for subsections...`,   // page adds the "The math" heading
  check: [{ q, choices: [html], answer: index, why, hint? }],              // quick check (multiple choice)
  links: { prereq: [ids], next: [ids], related: [ids] },                  // cross-links; ids may be planned lessons

  explain: `...legacy prose...`, // used only when `formal` is absent
  mount({ stage, controls }) {
    // create a Plane, wire controls, start any intro animation
    return teardownFn;                          // legacy
    // or: return { destroy() {...}, apply(patch, immediate) {...} };  // scene that steps can drive
  }
});
```

Lessons with two canvases add class `split` to the stage and stack two `.pane` hosts, one `Plane` each (see the unit circle lesson). A step's `set` may also carry non-numeric flags (e.g. `showCos`); the lesson's `apply` splits them from the numeric fields it animates. Lessons whose axes need different scales (the plane has one uniform scale) draw in a normalized area and set `p.span`/`p.cx`/`p.cy` inside `onDraw` (see `exponential-growth`, and the wave pane of the unit circle). Integer parameters (slice counts) go in a step's `set` but are applied instantly, not animated. Keep handles from overlapping in a lesson's default state, and let the more specific handle win in `hit`.

Page order: breadcrumb, title, hook (or blurb), stage + side panel (stepper above the controls), "The math", quick check, connections, pager. The pager moves within a level.

**Steps.** Entering a step (Back/Next, or clicking the progress bar) calls the scene's `apply(step.set, immediate)`. `immediate` is true for the first step on load. `apply` should stop any running animation, move the lesson state to the patch (`animateTo(st, patch, ms, update)` in `core.js` tweens numeric fields and honors reduced motion), and keep sliders in sync via their `set()`. Steps without `set` just show text. A user dragging a control should cancel a running step animation.

**Quick check.** A wrong pick is marked and disabled, and can be retried; the right pick locks the question and shows `why`. State is per page visit (progress tracking is a later phase).

**Connections.** `lessonRef(id)` resolves built lessons (link) and planned ones by title slug (dashed "Soon" item). Unknown ids are skipped.

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

**Controls** (`controls.js`): `title`, `hint`, `slider`, `buttons`, `select`, `toggle`, `readout`. Sliders return `{ set, get }` so animations can keep them in sync. Sliders set a `--p` CSS variable so the brass track fill follows the value.

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
| `slope-and-linear-functions` | school | Slope and linear functions | Slope/intercept/run sliders; drag the intercept, the rise-run triangle's corners (left corner slides it along the line, upper corner tilts the line about it). Steps animate `m, b, x0, run`. |
| `systems-of-equations` | school | Systems of equations | Two lines, each with draggable intercept and slope rings (snapped); live intersection, parallel and same-line cases. Steps animate `m1, b1, m2, b2`. |
| `functions-as-transformations` | school | Functions as transformations | Pick a base function (|x|, x², x³, √x, sin x); sliders for `g(x)=a·f(b(x−h))+k`; drag a tracked point P on f and see its image P′. Steps animate `a, b, h, k, xp` and set `fn`. |
| `exponential-growth` | school | Exponential growth | Exponential vs linear growth on independently scaled axes (normalized plot area with its own tick labels); start amount, rate, periods shown, read-at-t; presets; doubling time / half-life. Steps animate `p0, r, T, t` and set `showLin`. |
| `area-of-a-circle` | school | Area of a circle | Circle cut into n sectors (staggered rotation into an interlocked near-rectangle); readout of n·sin(π/n) → π. Steps set `n` instantly and animate `t, r`. |
| `similarity-and-scaling` | school | Similarity and scaling | Dilation from a draggable center O with scale factor k (−3..3) of a triangle with draggable corners, or a square (k×k copy grid at integer k); lengths, angles, area ratios. Steps set `shape` and animate `k, ox, oy`. |
| `quadratics-and-the-parabola` | school | Quadratics and the parabola | Vertex form `a(x-h)²+k`: drag the vertex and the ring one step to its right; axis of symmetry, zeros, standard form readout. Steps animate `a, h, k`. |
| `the-unit-circle-and-trig-waves` | school | The unit circle and trig waves | Two stacked panes (circle above, sine/cosine wave below); drag either pane to set θ; Play, snap to 15°, cosine toggle. Steps animate `th` and set `showCos`. |
| `pythagorean-theorem` | school | The Pythagorean theorem | Legs a, b sliders; rearrangement progress; play/reverse. Three triangles translate (no rotation) between the c² and a²+b² arrangements. Full lesson format (hook, 4 steps, formal math, 2 checks, links); reference implementation. |
| `linear-transformations` | ugrad | Linear transformations and eigenvectors | Matrix entry sliders; drag î/ĵ tips; presets; determinant area; eigenvector lines via `eig2()`. |
| `conformal-maps` | grad | Conformal maps of the complex plane | Six maps (z², eᶻ, 1/z, sin z, Joukowski, Cayley); rectangular/polar grids; draggable probe showing local scale/rotation from f′(z₀). |

## 8. Roadmap

Current priority: **middle & high school only**. Undergraduate and graduate lessons are on hold; existing ones are only touched when the engine requires it.

- **Phase 1 (done):** shell, engine, 3 starter visualizations.
- **Phase 2 (engine part done in 0.5):** lesson-format engine and source split. Still open: retrofit the undergraduate and graduate lessons only if the engine ever requires it (today it does not).
- **Phase 3 (done in 0.6):** Slope and linear functions, Systems of equations, Quadratics and the parabola, The unit circle and trig waves.
- **Phase 4 (done in 0.7):** Functions as transformations, Exponential growth, Area of a circle, Similarity and scaling.
- **Phase 5:** the last 4 school lessons: Inscribed angles; Mean, median, and spread; Probability with repeated trials; Pascal's triangle and the Galton board.
- **Phases 6+:** undergraduate and graduate lessons (on hold).
- **Final:** search, progress tracking, polish.

## 9. Change log

- **0.7 (2026-10-01):** Phase 4. Four more school lessons (functions as transformations, exponential growth, area of a circle, similarity and scaling). Lesson order in `manifest.json` follows the curriculum (algebra, then geometry, then the unit circle). Quadratics now lists Functions as transformations as a prerequisite. `TAU` moved into `engine/math.js`.
- **0.6 (2026-09-30):** Phase 3. Four school lessons in the new lesson format (slope, systems of equations, quadratics, unit circle and trig waves). Engine additions: `snap`, `Plane.ticks()`, `near()`, `num`/`linEq`, stacked-pane stage (`.stage.split`). Lesson order in `manifest.json`: algebra lessons, Pythagorean theorem, unit circle, then the two upper-level lessons.
- **0.5 (2026-09-30):** Source split into `src/` with `tools/build.js` (output verified equivalent to 0.4). Lesson-format engine: `hook`, guided `steps` (stepper in the side panel, scenes with `apply`), `formal`, multiple-choice `check`, `links` cross-links (`lessonRef`, slug-matched planned lessons), per-level pager, `animateTo`. Side panel scrolls when taller than the viewport. `PLANNED` school list set to the draft curriculum. Pythagorean lesson retrofitted as the reference. Undergraduate and graduate lessons only moved into files, content unchanged.
- **0.4 (2026-09-30):** Display face changed from Unbounded to Sora for a sleeker, lighter look; weights and sizes retuned.
- **0.3 (2026-09-30):** Type update. Replaced Bodoni Moda with Unbounded for display; explanation prose moved from STIX Two Text to Hanken Grotesk; canvas non-italic labels now sans; level markers changed from I/II/III to 01/02/03; display sizes retuned for the wider face.
- **0.2 (2026-09-30):** Visual redesign ("drafting instruments"). New fonts (Bodoni Moda, Hanken Grotesk), brass accent, dot-grid background, sticky blurred top bar with level links and icon theme toggle, full-bleed hero with live matrix readout, numbered level sections, topic thumbnails (`thumb` in the module contract), breadcrumb and Previous/Next pager, stage corner ticks and pointer coordinates (`data-coords`), custom sliders/toggles/selects, `#/level/<id>` route, `Plane` `transparent` option.
- **0.1 (2026-09-30):** Initial build. Core engine (Plane, Controls, tween, draggable), hash router, light/dark theme, home page with animated hero, three visualizations.
