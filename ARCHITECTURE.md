# Continuum: Architecture

Interactive, 3Blue1Brown-style math visualization website covering three levels: middle & high school, undergraduate, and graduate.

**Version:** 0.9 (courses, Minnesota 2022 standards alignment, lesson filters)
**Last updated:** 2026-10-01

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
src/manifest.json        ordered lists: styles, curriculum, engine, lessons, app
src/styles/*.css         tokens, shell (top bar/hero/levels), viz (page + controls), prose, lesson, motion, curriculum (tags, chips, finder)
src/curriculum/*.js      standards-mn2022.js (the 2022 Minnesota benchmarks) and curriculum.js (grades, courses, skill levels, per-lesson alignment)
src/engine/*.js          core, theme (+typeset), plane, draggable, controls, math, registry, curriculum, lesson, finder, pages, router
src/lessons/<level>/<id>.js   one register({...}) per lesson
tools/build.js           concatenates everything into index.html and checks the curriculum data
```

- Script order: `curriculum` data files, then `engine` files, then `lessons`, then `app` (`pages.js`, `router.js`, which calls `applyCurriculum()` and then `route()`). The order of lessons in `manifest.json` no longer sets display order: that is computed from the curriculum data (section 5); it is only the tie-break of last resort.
- The build refuses to run if a file under `src/lessons/` or `src/curriculum/` is missing from `manifest.json`, or if the curriculum checks in section 5 fail.
- Adding a lesson = one new file in `src/lessons/<level>/`, one line in `manifest.json`, **one entry in `ALIGN` in `src/curriculum/curriculum.js`** (course, skill level, benchmarks), and (if it was planned) nothing else, since the planned entry is matched by slug and disappears once the id exists.

| Engine file | Purpose |
|---|---|
| `core.js` | `h()` DOM builder, `clamp`, `lerp`, `ease`, `snap`, `tween`, `animateTo`, `fmt`, `palette()`, `alpha()` |
| `theme.js` | Light/dark toggle, system preference, `themechange` event, `typeset()` (MathJax) |
| `plane.js` / `draggable.js` / `controls.js` | `Plane` (incl. `ticks()` axis numbers and `fit()` plot-area framing), pointer-drag helper plus `near()` hit test, side-panel builder |
| `math.js` | Shared math helpers (`eig2`, `num`, `linEq`, `TAU`) |
| `registry.js` | `LEVELS`, `VIZ[]`, `register()`, `PLANNED`, `slug()`, `lessonRef()` |
| `curriculum.js` | Pure helpers over the curriculum data: derived tags, `orderLessons()`, `applyCurriculum()`, filter predicate and URL encoding (no DOM; `tools/build.js` runs it too) |
| `lesson.js` | `Stepper`, `QuickCheck`, `Connections` (lesson format components) |
| `finder.js` | `SkillMeter`, `StdChip`, `LessonTags`, `Finder` (the filter bar) |
| `pages.js` | `renderHome()` (hero + live readout, finder, level sections with lessons grouped by course, thumbnails), `renderViz()` (lesson page with course, skill, grades, benchmark chips and the "Standards alignment" section) |
| `router.js` | Hash routing and teardown |

## 3. Routing

- `#/` or empty: home page (hero animation + topic lists per level).
- `#/viz/<id>`: visualization page.
- `#/level/<school|ugrad|grad>`: home page scrolled to that level (used by the top nav and breadcrumbs).
- `#/?grade=8,9-11&skill=intro&strand=pr&course=grade8&std=8.2.4.1`: home page with the lesson filters applied (any subset of the five keys) and scrolled to the finder. The finder keeps the hash in sync with `history.replaceState`, so filtered views can be shared; unknown values are ignored.
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

Page order: breadcrumb, title, hook (or blurb), course / skill / grades / benchmark chips, stage + side panel (stepper above the controls), "The math", quick check, connections, "Standards alignment" (lessons with benchmarks only), pager. The pager moves within a level in the computed curriculum order (section 5).

**Steps.** Entering a step (Back/Next, or clicking the progress bar) calls the scene's `apply(step.set, immediate)`. `immediate` is true for the first step on load. `apply` should stop any running animation, move the lesson state to the patch (`animateTo(st, patch, ms, update)` in `core.js` tweens numeric fields and honors reduced motion), and keep sliders in sync via their `set()`. Steps without `set` just show text. A user dragging a control should cancel a running step animation.

**Quick check.** A wrong pick is marked and disabled, and can be retried; the right pick locks the question and shows `why`. State is per page visit (progress tracking is a later phase).

**Connections.** `lessonRef(id)` resolves built lessons (link) and planned ones by title slug (dashed "Soon" item). Unknown ids are skipped.

## 5. Curriculum model, standards alignment and filters

Every lesson belongs to one **course**, has one **skill level**, and carries zero or more **Minnesota benchmarks**. From those the site derives its grade levels and strands, its display order, and the filters.

**Data** (`src/curriculum/`, loaded before the engine)
- `standards-mn2022.js`: `STRANDS` (3), `ANCHORS` (7) and `STANDARDS` (185 benchmarks, code to wording) from the *2022 Minnesota K-12 Academic Standards in Mathematics* (adopted into rule in 2025, fully implemented in 2027-28), Grade 6, 7, 8 and Grades 9-11 tables. Wording is transcribed from the document; the trailing practice-standard notes and margin symbols are omitted; superscripts and inline math the PDF text layer loses (k², 22/7, a(b)^x, y/x = k) were restored from the rendered pages. Code format `band.strand.anchor.n`: band 6, 7, 8 or 9 (9 = the single Grades 9-11 band); strands 1 Data and Probability, 2 Spatial Reasoning, 3 Patterns and Relationships; anchors 1 Data Sciences, 2 Chance and Uncertainty, 3 Measurement, 4 Geometry, 5 Number Relationships, 6 Equivalence and Relational Thinking, 7 Patterns and Relationships. Grade 8 has no Chance and Uncertainty benchmarks.
- `curriculum.js`: `GRADES` (filter bands 6, 7, 8, 9-11, undergraduate, graduate), `COURSES` (in teaching sequence), `SKILLS`, and `ALIGN`, one entry per lesson `{ id, course, skill, standards: [codes] }`.

**Courses.** School: Grade 6 Mathematics, Grade 7 Mathematics, Grade 8 Mathematics, Algebra 1, Geometry, Algebra 2, Precalculus & Trigonometry, Statistics & Probability (a course with no lessons is not shown). Undergraduate: Linear Algebra. Graduate: Complex Analysis. The 2022 document has no high-school course split (one Grades 9-11 band), so Algebra 1 through Statistics are conventional labels, not state-defined courses.

**Skill level** describes the lesson, not the student. Introductory: a first look, needs nothing else on this site. Intermediate: an on-grade skill that builds on earlier ideas. Advanced: proof-style reasoning, or ideas beyond the grade-band benchmarks (the unit circle lesson's radians and periodic waves, the Galton board's binomial distribution). The two undergraduate/graduate lessons carry a skill level only so every lesson has one.

**Tagging rule.** A benchmark is tagged only when the lesson's steps, interactive, formal math or quick checks actually address it, not when the topic is merely nearby. Fewer accurate tags beat many loose ones, because teachers filter on them. A tag means the lesson addresses a substantial part of the benchmark, not necessarily all of it: an independent review of the first 34 tags against each lesson's text rated 10 as direct and 23 as partial (for example, a benchmark that also asks for tables, technology or multi-step contexts that the lesson does not provide), and led to dropping the two weakest tags (9.2.3.3 on the unit circle lesson, 9.3.7.2 on transformations) and adding five clearly supported ones (7.1.2.3 and 9.1.2.4 on the Galton board, 7.1.2.6 on repeated trials, 8.3.7.7 on exponential growth, 9.3.7.3 on quadratics). A two-tier "direct / partial" marker would be the next refinement if a stricter mapping is wanted. A lesson's **grades** are its course's grades plus the band of every benchmark it is tagged with (so a statistics lesson tagged 6.1.1.3, 7.1.1.4 and two 9.x benchmarks is found under Grade 6, Grade 7 and Grades 9-11); its **strands** come from the benchmark codes.

**Display order** (computed by `orderLessons()`, so every list and the pager agree): level, then course sequence, then skill level (introductory first), then the lesson's first benchmark in the document's own order (strand, anchor, benchmark), then registration order. A final stable pass never places a lesson before a same-course lesson it builds on (`links.prereq`).

**Build checks** (`tools/build.js`, run on every build and on `--check`; `--order` prints the sequence): every lesson has exactly one `ALIGN` entry and every entry names a real lesson; course, skill and benchmark codes exist; a course's level matches its lessons' level; no repeated codes; and across the whole computed order every "Builds on" link points backward and every "Leads to" link points forward. A failure names the lesson and the link to move to "related" or the placement to change.

**Filters** (home page, `Finder` in `finder.js`). Five facets: grade level (chips), course (dropdown), skill level (chips), standard (dropdown, only benchmarks that some lesson carries, grouped by strand) and standard strand (color chips). Several choices within grade, skill or strand match any of them; different facets must all match. Each option shows how many lessons it would leave given the other facets, and options that would leave none are disabled. Filtering only hides rows (thumbnails stay mounted), hides levels and courses that end up empty, hides "In development" rows, and shows an empty state with a clear button. Below 700px the facets collapse behind a "Filters" button with a badge for the active count. The standard and strand facets disappear if no lesson carries a benchmark. Benchmark chips on lesson pages link to `#/?std=<code>`, and the course tag to `#/?course=<id>`.

**Maintaining the standards.** `education.mn.gov` serves a browser check ("Radware") instead of the PDFs to scripted downloads, so a new version of the standards has to be supplied as a file. The 2022 data was produced by extracting the benchmark tables (Python `pdfplumber`, one row per benchmark), cross-checking every code against an independent `pdftotext` pass (185 of 185, no numbering gaps), and comparing the lossy benchmarks against the rendered pages.

**Alignment table** (computed order)

| Course | Lesson | Skill | Benchmarks |
|---|---|---|---|
| Grade 7 Mathematics | Area of a circle | Introductory | 7.2.3.1, 7.2.3.2 |
| Grade 8 Mathematics | The Pythagorean theorem | Introductory | 8.2.3.1, 8.2.3.3 |
| Grade 8 Mathematics | Slope and linear functions | Introductory | 8.2.4.1, 8.3.7.5, 8.3.7.6 |
| Grade 8 Mathematics | Systems of equations | Intermediate | 8.2.4.3, 8.3.6.9 |
| Algebra 1 | Exponential growth | Intermediate | 8.3.5.6, 8.3.7.7, 8.3.7.8, 8.3.7.9, 9.3.7.1 |
| Algebra 1 | Functions as transformations | Intermediate | 9.3.7.3 |
| Algebra 1 | Quadratics and the parabola | Intermediate | 9.3.6.2, 9.3.6.3, 9.3.6.5, 9.3.7.3 |
| Geometry | Similarity and scaling | Intermediate | 7.2.4.2, 7.2.4.3, 9.2.3.9 |
| Geometry | Inscribed angles | Intermediate | 9.2.4.8 |
| Precalculus & Trigonometry | The unit circle and trig waves | Advanced | 9.2.3.8 (nearest benchmark; the lesson extends it) |
| Statistics & Probability | Mean, median, and spread | Intermediate | 6.1.1.3, 7.1.1.4, 9.1.1.9, 9.1.1.13 |
| Statistics & Probability | Probability with repeated trials | Intermediate | 6.1.2.3, 7.1.2.2, 7.1.2.6, 9.1.2.3, 9.1.2.4 |
| Statistics & Probability | Pascal's triangle and the Galton board | Advanced | 7.1.2.3, 9.1.2.1, 9.1.2.4, 9.1.2.6 |
| Linear Algebra | Linear transformations and eigenvectors | Intermediate | (K-12 standards do not apply) |
| Complex Analysis | Conformal maps of the complex plane | Advanced | (K-12 standards do not apply) |

## 6. Shared engine

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

## 7. Design system

Direction: **precision instruments, modern and sleek**. Midnight ink or cool paper, brass as the single accent, hairline rules, a slim geometric display face in light weights, and color reserved for mathematical meaning.

- Light: paper `#F1F3F6`, ink `#121A2B`, brass `#8C6A2A`. Dark: midnight `#0F1524`, stage `#0C1220`, text `#ECEFF5`, brass `#D4B26A`.
- Page background carries a faint 32px dot grid (graph paper).
- Math object colors (Manim-inspired, tuned per theme): blue (grid/lines), yellow (areas), green (î / first direction), red (ĵ / second direction), violet (eigen/special structure). Brass is never used for math objects.
- Level colors: school = green, undergrad = blue, graduate = red (level numbers 01, 02, 03 on the home page, dots in breadcrumbs).
- Strand colors (standards chips, strand filter, the left rule of an alignment item): Data and Probability = amber (`--yellow`), Spatial Reasoning = violet, Patterns and Relationships = blue, each with its own swatch shape (circle, square, diamond) so color is never the only cue. Chip text stays in the ink color on a tinted fill, so contrast does not depend on the strand color. Skill level is three small bars in brass (one, two or three filled) beside its name. Selected filter chips invert (ink fill) rather than use brass, which stays the hover and focus color.
- Type: Sora for headings, topic titles, and level numbers (tight negative tracking; hero and page titles at 300, section and topic titles at 400, level numbers at 200, wordmark at 500); Hanken Grotesk for body, prose, and UI with tabular numerals for readouts. `Plane.label()` uses STIX Two italic when `italic: true` (math symbols) and Hanken Grotesk otherwise.
- Components: sticky translucent top bar with blur; pill buttons (primary = brass fill); thin brass slider tracks with ring thumbs; custom toggle switches; stage framed with brass corner ticks; glass control panel that stays in view on desktop.
- Signature element: the hero's live instrument readout (matrix, determinant, eigenvalues) synced to the animated grid.
- Motion: one orchestrated headline rise on load; everything else responds to user action. All motion disabled under `prefers-reduced-motion`.
- Mobile: panel stacks under the canvas below 900px; top-bar level links hide below 640px; hero canvas sits above the headline; canvas uses `touch-action: none` so drags do not scroll.
- Safe-area insets and `viewport-fit=cover` for phones.

## 8. Visualizations

| ID | Level | Title | Key interactions |
|---|---|---|---|
| `slope-and-linear-functions` | school | Slope and linear functions | Slope/intercept/run sliders; drag the intercept, the rise-run triangle's corners (left corner slides it along the line, upper corner tilts the line about it). Steps animate `m, b, x0, run`. |
| `systems-of-equations` | school | Systems of equations | Two lines, each with draggable intercept and slope rings (snapped); live intersection, parallel and same-line cases. Steps animate `m1, b1, m2, b2`. |
| `inscribed-angles` | school | Inscribed angles | Chord endpoints A, B and viewpoint P, all draggable on the circle (or by slider); intercepted arc (the one without P), central vs inscribed angle readout; crossing the chord gives the supplementary angle. Steps animate `a, b, p` (degrees). |
| `mean-median-and-spread` | school | Mean, median, and spread | Dot plot (values 0–20, snapped to integers, stacked per bin); draggable dots, add/remove, presets; mean balance triangle, median line, σ band. Steps pass a whole `data` array, tweened when the length matches. |
| `probability-with-repeated-trials` | school | Probability with repeated trials | Two stacked panes: running fraction of successes on a log-trials axis, and 1−(1−p)^k with an optional 1,000-attempt simulation. Steps set `p, k`, `reset`, `runTo` (log-time ramp of trials) and `sim`. |
| `pascals-triangle-and-the-galton-board` | school | Pascal's triangle and the Galton board | Falling-ball animation on a peg board (2–12 rows, bias p) with Pascal numbers on the pegs, histogram bars and binomial expected-count rings. Steps set `rows, p, reset, nums, theory, drop`. |
| `functions-as-transformations` | school | Functions as transformations | Pick a base function (|x|, x², x³, √x, sin x); sliders for `g(x)=a·f(b(x−h))+k`; drag a tracked point P on f and see its image P′. Steps animate `a, b, h, k, xp` and set `fn`. |
| `exponential-growth` | school | Exponential growth | Exponential vs linear growth on independently scaled axes (normalized plot area with its own tick labels); start amount, rate, periods shown, read-at-t; presets; doubling time / half-life. Steps animate `p0, r, T, t` and set `showLin`. |
| `area-of-a-circle` | school | Area of a circle | Circle cut into n sectors (staggered rotation into an interlocked near-rectangle); readout of n·sin(π/n) → π. Steps set `n` instantly and animate `t, r`. |
| `similarity-and-scaling` | school | Similarity and scaling | Dilation from a draggable center O with scale factor k (−3..3) of a triangle with draggable corners, or a square (k×k copy grid at integer k); lengths, angles, area ratios. Steps set `shape` and animate `k, ox, oy`. |
| `quadratics-and-the-parabola` | school | Quadratics and the parabola | Vertex form `a(x-h)²+k`: drag the vertex and the ring one step to its right; axis of symmetry, zeros, standard form readout. Steps animate `a, h, k`. |
| `the-unit-circle-and-trig-waves` | school | The unit circle and trig waves | Two stacked panes (circle above, sine/cosine wave below); drag either pane to set θ; Play, snap to 15°, cosine toggle. Steps animate `th` and set `showCos`. |
| `pythagorean-theorem` | school | The Pythagorean theorem | Legs a, b sliders; rearrangement progress; play/reverse. Three triangles translate (no rotation) between the c² and a²+b² arrangements. Full lesson format (hook, 4 steps, formal math, 2 checks, links); reference implementation. |
| `linear-transformations` | ugrad | Linear transformations and eigenvectors | Matrix entry sliders; drag î/ĵ tips; presets; determinant area; eigenvector lines via `eig2()`. |
| `conformal-maps` | grad | Conformal maps of the complex plane | Six maps (z², eᶻ, 1/z, sin z, Joukowski, Cayley); rectangular/polar grids; draggable probe showing local scale/rotation from f′(z₀). |

## 9. Roadmap

Current priority: **middle & high school only**. Undergraduate and graduate lessons are on hold; existing ones are only touched when the engine requires it.

- **Phase 1 (done):** shell, engine, 3 starter visualizations.
- **Phase 2 (engine part done in 0.5):** lesson-format engine and source split. Still open: retrofit the undergraduate and graduate lessons only if the engine ever requires it (today it does not).
- **Phase 3 (done in 0.6):** Slope and linear functions, Systems of equations, Quadratics and the parabola, The unit circle and trig waves.
- **Phase 4 (done in 0.7):** Functions as transformations, Exponential growth, Area of a circle, Similarity and scaling.
- **Phase 5 (done in 0.8):** Inscribed angles; Mean, median, and spread; Probability with repeated trials; Pascal's triangle and the Galton board. The school level (13 lessons) is complete.
- **Phases 6+:** undergraduate and graduate lessons (on hold until the owner lifts the school-only priority).
- **Final:** search, progress tracking, polish. (The lesson finder and standards alignment arrived early, in 0.9.)

## 10. Change log

- **0.9 (2026-10-01):** Courses, standards and filters. Lessons are grouped under courses (Grade 7, Grade 8, Algebra 1, Geometry, Precalculus & Trigonometry, Statistics & Probability; Linear Algebra and Complex Analysis for the two upper-level lessons) in a computed, consistent order that also drives the pager. Each lesson is tagged with its Minnesota 2022 benchmarks (185-benchmark catalog in `src/curriculum/standards-mn2022.js`, extracted from the official document and checked against it), a skill level, and derived grade levels and strands, shown as strand-colored chips on the home list and lesson pages and in a "Standards alignment" section. New home-page lesson finder (grade level, course, skill level, standard, standard strand) with live counts, shareable URLs and a mobile collapse. New: `src/curriculum/`, `engine/curriculum.js`, `engine/finder.js`, `styles/curriculum.css`, build-time curriculum checks (`--order` prints the sequence). Two cross-links changed so they agree with the course order: Area of a circle no longer lists the Pythagorean theorem as a prerequisite (now "related"; the lesson does not use it), and Quadratics no longer says it leads to Exponential growth (now "related"; exponential growth comes first in Algebra 1).
- **0.8 (2026-10-01):** Phase 5. The last four school lessons (inscribed angles, mean/median/spread, probability with repeated trials, Pascal's triangle and the Galton board), completing the school level. `Plane.fit(W, H, margins)` added. Lesson order: algebra, geometry, then probability and data. Cross-links only point at lessons that exist or are in `PLANNED`.
- **0.7 (2026-10-01):** Phase 4. Four more school lessons (functions as transformations, exponential growth, area of a circle, similarity and scaling). Lesson order in `manifest.json` follows the curriculum (algebra, then geometry, then the unit circle). Quadratics now lists Functions as transformations as a prerequisite. `TAU` moved into `engine/math.js`.
- **0.6 (2026-09-30):** Phase 3. Four school lessons in the new lesson format (slope, systems of equations, quadratics, unit circle and trig waves). Engine additions: `snap`, `Plane.ticks()`, `near()`, `num`/`linEq`, stacked-pane stage (`.stage.split`). Lesson order in `manifest.json`: algebra lessons, Pythagorean theorem, unit circle, then the two upper-level lessons.
- **0.5 (2026-09-30):** Source split into `src/` with `tools/build.js` (output verified equivalent to 0.4). Lesson-format engine: `hook`, guided `steps` (stepper in the side panel, scenes with `apply`), `formal`, multiple-choice `check`, `links` cross-links (`lessonRef`, slug-matched planned lessons), per-level pager, `animateTo`. Side panel scrolls when taller than the viewport. `PLANNED` school list set to the draft curriculum. Pythagorean lesson retrofitted as the reference. Undergraduate and graduate lessons only moved into files, content unchanged.
- **0.4 (2026-09-30):** Display face changed from Unbounded to Sora for a sleeker, lighter look; weights and sizes retuned.
- **0.3 (2026-09-30):** Type update. Replaced Bodoni Moda with Unbounded for display; explanation prose moved from STIX Two Text to Hanken Grotesk; canvas non-italic labels now sans; level markers changed from I/II/III to 01/02/03; display sizes retuned for the wider face.
- **0.2 (2026-09-30):** Visual redesign ("drafting instruments"). New fonts (Bodoni Moda, Hanken Grotesk), brass accent, dot-grid background, sticky blurred top bar with level links and icon theme toggle, full-bleed hero with live matrix readout, numbered level sections, topic thumbnails (`thumb` in the module contract), breadcrumb and Previous/Next pager, stage corner ticks and pointer coordinates (`data-coords`), custom sliders/toggles/selects, `#/level/<id>` route, `Plane` `transparent` option.
- **0.1 (2026-09-30):** Initial build. Core engine (Plane, Controls, tween, draggable), hash router, light/dark theme, home page with animated hero, three visualizations.
