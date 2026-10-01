# Continuum: Architecture

Interactive, 3Blue1Brown-style math visualization website covering three levels: middle & high school, undergraduate, and graduate.

**Version:** 0.15 (teacher tools, Grade 8 and Algebra 1 course plan, batches 1 and 2, Grade 6-7 foundations batches F-A and F-B)
**Last updated:** 2026-10-01

## 1. Deployment model

- Two builds from the same sources. **Single file:** `index.html` (HTML + CSS + JS inline, every lesson included, about 1.2 MB at 31 lessons), the default, committed to the repo, works offline and from `file://`. **Split:** `node tools/build.js --split` writes `dist/index.html` (about 160 KB: styles, curriculum, engine, app, and a metadata record per lesson) plus `dist/lessons/<id>.js`, one file per lesson, fetched the first time the lesson is needed (a lesson page, its exit ticket, or a thumbnail in an opened course). `dist/` is generated and git-ignored; publish it to the artifact as a multi-file artifact (the `files` map) or host it as static files. The metadata is read at build time by running each lesson file in a sandbox that stubs every engine name, so lessons need no changes for either build. The page behaves the same in both: `LAZY_LESSONS` (filled only in the split build) becomes light entries in `VIZ` (title, blurb, step and check counts, prerequisite links), `loadLesson(id)` fetches a lesson script and `register()` upgrades the entry in place, `route()` shows "Loading" (or "Could not load ... Try again") while a needed lesson is on its way, and the Next lesson is fetched quietly after a lesson page has been open for a moment. The single-file build is also published as a claude.ai artifact link. **`index.html` is generated**: edit files under `src/` and run `node tools/build.js` (`--check` fails if `index.html` is stale). Commit both.
- External resources allowed by the host: scripts from cdnjs, stylesheets/fonts from Google Fonts. Nothing else loads.
- Dependencies:
  - MathJax 3.2.2 (`tex-svg`, cdnjs) for equations in explanation text. SVG output, so no font files are needed.
  - Google Fonts: Sora 200–600 (display headings, wordmark, level numbers), Hanken Grotesk (explanation prose, UI, controls, numeric readouts, plain canvas labels), STIX Two Text italic (italic math symbols on canvases only, to match MathJax).
- No framework. Plain JavaScript and Canvas 2D. The only build step is concatenation (`tools/build.js`, Node, no dependencies).

## 2. Source layout

```
src/template.html        page shell with /*@STYLES*/ and /*@SCRIPTS*/ markers
src/manifest.json        ordered lists: styles, curriculum, engine, lessons, app
src/styles/*.css         tokens, shell (top bar/hero/levels), viz (page + controls), prose, lesson, motion, curriculum (tags, chips, finder), teacher (progress, tickets, print)
src/curriculum/*.js      standards-mn2022.js (the 2022 Minnesota benchmarks) and curriculum.js (grades, courses, skill levels, per-lesson alignment)
src/engine/*.js          core, theme (+typeset), plane, draggable, controls, math, registry, curriculum, lesson, finder, share, progress, teacher, pages, router
src/lessons/<level>/<id>.js   one register({...}) per lesson
tools/build.js           concatenates everything into index.html and checks the curriculum data
```

- Script order: `curriculum` data files, then `engine` files, then `lessons`, then `app` (`pages.js`, `router.js`, which calls `applyCurriculum()` and then `route()`). The order of lessons in `manifest.json` no longer sets display order: that is computed from the curriculum data (section 5); it is only the tie-break of last resort.
- The build refuses to run if a file under `src/lessons/` or `src/curriculum/` is missing from `manifest.json`, or if the curriculum checks in section 5 fail.
- **Tests.** Both suites run against either build: `CONTINUUM_BUILD=split node tools/tests/finder.test.js` (after `node tools/build.js --split`) uses `dist/`; in the split build they also check the network behavior (the home page fetches no lesson files while courses are collapsed, opening a course fetches exactly its lessons, a lesson link fetches one lesson, a failed load offers Try again). `tools/tests/finder.test.js` (283 checks in the single-file build, 288 in the split build: course grouping and order against the build's own `--order`, collapsible courses, the hero button, on-demand lessons, every filter state against an independent model of the data, URL state, option counts, lesson pages, pager, mobile) and `tools/tests/teacher.test.js` (57 checks: every route token, step links, copy links and the refused-clipboard fallback, running inside a frame like the artifact viewer, progress, summary, tickets, print view, no-storage mode). They need Playwright (found via `require('playwright')`, else `/opt/node-tools`) and a built `index.html`, take lesson counts and expectations from the data, and write screenshots to `$SHOTS` or the temp directory. Run both after any change to lessons, curriculum data or the engine.
- Adding a lesson = one new file in `src/lessons/<level>/`, one line in `manifest.json`, **one entry in `ALIGN` in `src/curriculum/curriculum.js`** (course, skill level, benchmarks), and (if it was planned) nothing else, since the planned entry is matched by slug and disappears once the id exists.

| Engine file | Purpose |
|---|---|
| `core.js` | `h()` DOM builder, `clamp`, `lerp`, `ease`, `snap`, `tween`, `animateTo`, `fmt`, `palette()`, `alpha()` |
| `theme.js` | Light/dark toggle, system preference, `themechange` event, `typeset()` (MathJax) |
| `plane.js` / `draggable.js` / `controls.js` | `Plane` (incl. `ticks()` axis numbers and `fit()` plot-area framing), pointer-drag helper plus `near()` hit test, side-panel builder |
| `math.js` | Shared math helpers (`eig2`, `num`, `linEq`, `TAU`) |
| `registry.js` | `LEVELS`, `VIZ[]`, `register()`, `PLANNED`, `slug()`, `lessonRef()`; lazy loading: `LAZY_LESSONS`, `registerStubs()`, `isLoaded()`, `loadLesson()` |
| `curriculum.js` | Pure helpers over the curriculum data: derived tags, `orderLessons()`, `applyCurriculum()`, filter predicate and URL encoding (no DOM; `tools/build.js` runs it too) |
| `lesson.js` | `Stepper`, `QuickCheck`, `Connections` (lesson format components) |
| `finder.js` | `SkillMeter`, `StdChip`, `LessonTags`, `Finder` (the filter bar) |
| `share.js` | `parseRoute()`, share tokens (`lessonToken`, `ticketToken`, `filterToken`), `shareUrl`, `embedded`, `canPrint`, `copyText`, `CopyButton`, `texToText` |
| `progress.js` | `Progress` (per-browser progress store and plain-text summary) |
| `teacher.js` | `ProgressChip`, `renderProgress()`, `renderTicket()` |
| `pages.js` | `renderHome()` (hero + live readout, finder, level sections with lessons grouped by course, thumbnails), `renderViz()` (lesson page with course, skill, grades, benchmark chips and the "Standards alignment" section) |
| `router.js` | Hash routing and teardown |

## 3. Routing

`parseRoute()` in `engine/share.js` turns the hash into a page. Every shareable view has a **plain token** (letters, digits, `.`, `_`, `~`, `-` only), because that is the only hash form a link to the artifact viewer can deliver to the page; the older slash forms still work and are never generated.

| Token | Page |
|---|---|
| empty, `#/`, or anything unrecognized | home page (hero animation with a "Start with slope" button, lesson finder, collapsible course groups per level) |
| `#school`, `#ugrad`, `#grad` (or `#/level/<id>`) | home page scrolled to that level (top nav, breadcrumbs) |
| `#<lesson-id>` (or `#/viz/<id>`) | lesson page |
| `#<lesson-id>.3` | lesson page opened at step 3 (clamped to the last step) |
| `#<lesson-id>.ticket`, `#<lesson-id>.key` | printable exit ticket, student version or with the answer key |
| `#progress` | the progress page |
| `#find~grade_8~skill_intro~strand_pr~course_grade8~std_8.2.4.1` (or `#/?grade=8&...`) | home page with lesson filters applied (any subset of the five keys, repeat `grade`, `skill` or `strand` for several values) and scrolled to the finder; unknown values are ignored |

The finder and the stepper keep the address in sync with `history.replaceState` (inside try/catch, because the artifact viewer's frame may refuse it), so the address bar is always a shareable link. On every route change the previous page's teardown function runs (cancels animation frames, disconnects observers, removes listeners).

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

Page order: breadcrumb, title, hook (or blurb), course / skill / grades / benchmark chips, stage + side panel (stepper above the controls, with its copy-link button), "The math", quick check, exit-ticket links, connections, "Standards alignment" (lessons with benchmarks only), pager. The pager moves within a level in the computed curriculum order (section 5).

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

**Build checks** (`tools/build.js`, run on every build and on `--check`; `--order` prints the sequence): every lesson has exactly one `ALIGN` entry and every entry names a real lesson; course, skill and benchmark codes exist; a course's level matches its lessons' level; no repeated codes; and across the whole computed order every "Builds on" link points backward and every "Leads to" link points forward. A failure names the lesson and the link to move to "related" or the placement to change. A separate check fails the build when TeX in a lesson contains `<` directly before a letter (the HTML parser reads `\(0<b<1\)` as a `<b>` tag and swallows the rest of the paragraph; write `&lt;`).

**Course groups** (home page). Each course is a collapsible group: its heading is a button (`aria-expanded`) with a chevron and the lesson count, a closed group shows a two-line preview of its lesson titles, and an open group lists the lessons with thumbnails. All groups start closed. `Expand all courses` / `Collapse all courses` toggles every visible group, and the courses a visitor opens are remembered while the page stays open (`OPEN_COURSES`). A filter opens every group that has matches (their thumbnails load then), and clearing it restores what the visitor had open. A group draws its thumbnails (which in the split build means loading those lessons) the first time it is open and its rows are shown.

**Filters** (home page, `Finder` in `finder.js`). Five facets: grade level (chips), course (dropdown), skill level (chips), standard (dropdown, only benchmarks that some lesson carries, grouped by strand) and standard strand (color chips). Several choices within grade, skill or strand match any of them; different facets must all match. Each option shows how many lessons it would leave given the other facets, and options that would leave none are disabled. Filtering only hides rows (thumbnails stay mounted), hides levels and courses that end up empty, hides "In development" rows, and shows an empty state with a clear button. Below 700px the facets collapse behind a "Filters" button with a badge for the active count. The standard and strand facets disappear if no lesson carries a benchmark. Benchmark chips on lesson pages link to `#find~std_<code>`, and the course tag to `#find~course_<id>`. "Copy link to this view" copies the current filter token.

**Teacher tools** (`share.js`, `progress.js`, `teacher.js`, `styles/teacher.css`).
- **Step links.** Stepping a lesson updates the address to `#<id>.<step>`; "Copy link to this step" copies it. A deep link applies that step's state at once (each step's `set` patch is a complete state). Inside the artifact viewer (`embedded`, detected by `window.top !== window.self`) the page cannot know the artifact's own address, so the copy buttons copy only the token (`#slope-and-linear-functions.3`) and say to add it after the page's address; opened on its own (a file or a web host) they copy the full address. Hosting the site on its own address removes that limit. If the clipboard is refused, a selected text box appears instead.
- **Progress** (`Progress`). Per lesson: steps opened, quick-check questions answered right (and how many on the first try). Complete = every step opened and every check answered right (a legacy lesson with neither is complete once opened). Shown as a chip on lesson rows and lesson pages, and on `#progress` with a name field, a plain-text "Copy summary" (grouped by course) for handing to a teacher, print, and a two-step reset. Data is stored per browser in `localStorage` (key `continuum-progress-v1`), with an in-memory fallback when storage is blocked. There are no accounts and no server, so a teacher sees a class only through the summaries students send. A real class view needs a backend (or the artifact `db` capability) and is a separate decision.
- **Exit ticket** (`renderTicket`). The lesson's quick-check questions as a one-page handout with name and date lines and the lesson's benchmark chips, in a student version and a version with the answer key; "Copy as text" flattens TeX (`texToText`); print styles hide the site chrome. The print button is hidden when embedded, because the viewer's frame cannot print.

**Maintaining the standards.** `education.mn.gov` serves a browser check ("Radware") instead of the PDFs to scripted downloads, so a new version of the standards has to be supplied as a file. The 2022 data was produced by extracting the benchmark tables (Python `pdfplumber`, one row per benchmark), cross-checking every code against an independent `pdftotext` pass (185 of 185, no numbering gaps), and comparing the lossy benchmarks against the rendered pages.

**Alignment table** (computed order)

| Course | Lesson | Skill | Benchmarks |
|---|---|---|---|
| Grade 6 Mathematics | Negative numbers and absolute value | Introductory | 6.3.5.1, 6.3.5.2, 6.3.5.3, 6.3.5.6 |
| Grade 6 Mathematics | Ratios and equivalent ratios | Introductory | 6.3.6.5, 6.3.6.6 |
| Grade 6 Mathematics | Variables and relationships | Introductory | 6.3.7.1 |
| Grade 6 Mathematics | Unit rates and best buys | Intermediate | 6.3.5.10, 6.3.6.6 |
| Grade 6 Mathematics | Percents on tape diagrams | Intermediate | 6.3.5.11, 6.3.6.2 |
| Grade 7 Mathematics | Area of a circle | Introductory | 7.2.3.1, 7.2.3.2 |
| Grade 7 Mathematics | Percent change and money | Intermediate | 6.3.5.11, 7.3.6.5 |
| Grade 7 Mathematics | Proportional relationships | Intermediate | 7.3.7.1, 7.3.7.2, 7.3.7.3 |
| Grade 7 Mathematics | Scale drawings and proportions | Intermediate | 6.3.6.6, 7.2.4.4, 7.3.6.4 |
| Grade 8 Mathematics | The Pythagorean theorem | Introductory | 8.2.3.1, 8.2.3.3 |
| Grade 8 Mathematics | Slope and linear functions | Introductory | 8.2.4.1, 8.3.7.5, 8.3.7.6 |
| Grade 8 Mathematics | What is a function? | Introductory | 8.3.7.3, 8.3.7.4, 9.3.7.10 |
| Grade 8 Mathematics | Scatter plots and lines of fit | Intermediate | 8.1.1.2, 8.1.1.3, 8.1.1.4, 8.1.1.6 |
| Grade 8 Mathematics | Square roots and irrational numbers | Intermediate | 8.3.5.1, 8.3.5.2, 8.3.6.4 |
| Grade 8 Mathematics | Distance and the Pythagorean theorem | Intermediate | 8.2.3.2, 8.2.3.3 |
| Grade 8 Mathematics | Exponents and scientific notation | Intermediate | 8.3.5.3, 8.3.5.4, 8.3.5.5 |
| Grade 8 Mathematics | Solving equations with a balance | Intermediate | 8.3.6.1, 8.3.6.3, 9.3.5.7 |
| Grade 8 Mathematics | Systems of equations | Intermediate | 8.2.4.3, 8.3.6.9 |
| Grade 8 Mathematics | Forms of a linear equation | Intermediate | 8.3.6.5, 8.3.6.6, 8.3.7.1, 8.3.7.6 |
| Grade 8 Mathematics | Parallel and perpendicular lines | Intermediate | 8.2.4.2 |
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
| `what-is-a-function` | school | What is a function? | Two panes: a function machine and a graph. Rules 2x−1, −x+4, x/2+3, x², and the circle x²+y²=25 (not a function: two outputs for one input). Drag the input marker (snaps to table inputs), tap table rows, vertical-line test toggle, table with plotted points, equal-steps staircase with a step-size slider. Steps set `rule, x, tbl, steps, vline, dx`. |
| `scatter-plots-and-lines-of-fit` | school | Scatter plots and lines of fit | Six hand-written datasets (study time, car age, shoe size, thrown ball, pizza delivery with an outlier, geyser with two clusters). Fit a line with two ringed handles or sliders, red residual segments, average-miss readout against a flat-line baseline, "Show a good line" (least squares), draggable prediction guide with slope and intercept read in context. Steps set `ds` (string flag) and `m, b, x`. |
| `square-roots-and-irrational-numbers` | school | Square roots and irrational numbers | Two panes: a square of area n (1 to 50) and a number line with a four-level zoom (1 to 0.001). Lower and upper decimal approximations whose squares straddle n; rational (perfect square) versus irrational; first 12 digits via BigInt ("a peek, not a proof"); compare the root of n with another root or a decimal; estimates of a + the root of n. n and the zoom are integers set instantly, the rest animate. |
| `exponents-and-scientific-notation` | school | Exponents and scientific notation | Two panes. Top: a logarithmic ruler of powers of ten carrying 10 real objects labelled "about" (tap, drag to pan, zoom). Bottom switches between exponent rules (factor tokens above and below a fraction bar, matching pairs cancel), a scientific-notation builder (coefficient and exponent sliders, a decimal-point-move strip, calculator display such as 3.2E5), and a worked multiply, divide and compare panel with colored parts and a renormalizing step. |
| `solving-equations-with-a-balance` | school | Solving equations with a balance | A balance scale with two pans, or a formula panel ("Formulas" mode). The student picks an amount and an operation (add, subtract, multiply, divide) and it is applied to both sides at once; the move log names the property of equality used, and a wrong move (for example undoing in the wrong order) is explained with the actual numbers. Equations include parentheses, variables on both sides, and formulas solved for one letter. Steps load equations (`mode`, `eq` flags). |
| `forms-of-a-linear-equation` | school | Forms of a linear equation | One line defined by two points, a point and a slope, slope-intercept or standard form (integer sliders, ringed handles). Point-slope, slope-intercept and standard forms update together with a graph view (rise-run, intercepts, proportional check). "Convert" walks the student through each algebra move (distribute, combine, clear fractions, make A positive) and explains wrong choices; "Match a line" overlays a dashed target line. |
| `parallel-and-perpendicular-lines` | school | Parallel and perpendicular lines | A blue line (two rings: one slides it, one tilts it; Horizontal and Vertical buttons) and a point P. The student drags P and a ring on their own line to build the parallel and the perpendicular through P, with slope triangles and the turned triangle shown; "Pick the equation" and a challenge ("Make it parallel / perpendicular", "Show me", "New line and point") give feedback that explains the slope relation (same slope; product of slopes −1). |
| `distance-and-the-pythagorean-theorem` | school | Distance and the Pythagorean theorem | One canvas, three modes. Plane: drag A and B on an integer grid; legs, squares on the sides, exact simplified radical and decimal; shared row or column shows subtraction. A "place B so that AB = 4, 5, √13, √50, 10" challenge explains too short, too long or right. 3D box: length, width and height sliders (1 to 12) draw the base diagonal and the space diagonal as two right triangles, with presets and a "longest rod exactly 6, 9 or 11" challenge. Stories: ladder, rod in a box, city blocks, TV screen; the student chooses add or subtract squares for each triangle. |
| `ratios-and-equivalent-ratios` | school | Ratios and equivalent ratios | One canvas, three modes. Tape diagrams (yellow concentrate row over blue water row, one block per cup), a table of equivalent ratios and a double number line. Compare: 6 pairs of mixes, the student picks stronger, weaker or same, and red gap brackets show why subtraction fails (2:3 vs 4:5, 3:7 vs 1:3). Scale: drag the marker, tap a table column or use the slider to choose the multiplier for 5 goals. Change: 7 "add to a mix" cases. |
| `unit-rates-and-best-buys` | school | Unit rates and best buys | Three modes. Unit rate and Speed: a double number line whose marker the student drags to 1 unit, then picks a ÷ b or b ÷ a (a wrong pick shows the number it gives and a check); two cards show both unit rates; 6 unit-rate and 5 speed questions. Best buy: tap cereal, pencil or strawberry items from best to worst (prices in cents, some half cents); optional "Show unit prices". Strawberries: the lowest unit price is not the sensible buy. |
| `percents-on-tape-and-number-lines` | school | Percents on tape diagrams | A tape bar with a percent line over a real-unit line (dollars, minutes, points) and a table of equivalent ratios filled by the student's moves. Find the part, the percent or the whole (12 problems): pick a move (cut into equal pieces, find 1%, decimal or fraction, or a wrong move, each explained), place the marker (drag, arrows or keyboard), answer from four choices; discount, tip and markup problems add a total question (bar extends past 100%). Converter mode: fraction, decimal and percent controls with a 0 to 200% bar, one or two 10 by 10 grids and 6 practice questions. |
| `proportional-relationships` | school | Proportional relationships | Two stacked panes: words, a table (x, y, optional y ÷ x, k × x) and the equation above; a graph with its own axis scales below. Four activities: set k by dragging the ringed point at x = 1 (9 situations; non-proportional ones cannot be matched and the panel says why), fill a table, classify 8 situations as table-only, graph-only or words-only with y ÷ x and "extend to x = 0" switches, and translate between words, table, graph and equation. |
| `variables-and-relationships` | school | Variables and relationships | Two panes: words, a table and a rule above, a graph below. Four activities: Roles (four situations; pick the two quantities that change together, then the independent variable), Explore (add y = x + 4, multiply y = 3x, multiply-then-add y = 2x + 5; drag the graph, tap a table column or use the slider; "Show the changes" toggle; challenge targets), Rule (six questions from words, tables and a graph; the pick is tested on every column and the feedback names the first column that breaks), Use (build y = 3x + 4 by dragging a start ring and a step ring; read the 4 and the 7 in y = 4x + 7; predict at x = 10 and solve y = 30). |
| `negative-numbers-and-absolute-value` | school | Negative numbers and absolute value | One canvas, five jobs, each a free explore plus a "Try a question" set (29 questions, auto-check on release): Opposites and 0 (temperature, elevation, credit/debit, electric charge, then pick what 0 means), Number line (integers, decimals, fractions and mixed numbers in quarter steps), Compare (place two markers, pick the symbol; the -8 < -3 pitfall), Distance from 0 (bracket, |-7|, find both numbers with |x| = 6, magnitude in context) and Coordinate grid (all four quadrants, half steps, range -5 to 5). Steps 1 to 4 drive the jobs; nudge buttons for keyboard users. |
| `scale-drawings-and-proportions` | school | Scale drawings and proportions | One canvas: a scene on top (island map or floor plan), a double number line and a table of equivalent ratios. Four modes, 15 questions: Map (drag a ruler's two grid-snapped ends onto named places, then choose the calculation), Design (pick the scale that fits a sheet, drag the plan's corner or use sliders), Units (drag a marker while a tape splits the length into units), Multi-step (find the scale from known lengths and use it; convert first; recipe and paint mix scaled down and up). A wrong choice shows where its answer lands on the line. |
| `percent-change-and-money` | school | Percent change and money | Stacked tape bars sharing a dollar scale, with a running price tag or receipt. Five jobs, 3 to 6 problems each: mark up and down (+20% then -20% does not return to the start; the multiplier method), percent change (find the percent, find the old amount; the wrong-base trap), simple interest (sliders for principal, rate and years; equal yearly bars), percent error (drag a measurement to 10% error), and tax, tips and pay (paycheck gross, withheld, take-home; sorting sales tax versus income tax). Wrong picks show a dashed red ghost bar. |
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
- **Course plan: Grade 8 and Algebra 1 (started 2026-10-01).** Goal: a complete, standards-aligned sequence for these two courses, then teacher features around it. Only 11 of the 38 Grade 8 benchmarks were covered when the plan began (the whole Data Sciences anchor was untouched); batch 1 brought it to 22 of 38 and batch 2 to 30 of 38 (55 of the 185 benchmarks are tagged in all). Still untagged in Grade 8: 8.3.6.7, 8.3.6.8 and 8.3.7.2 (batch 3), 8.3.6.2 (evaluating expressions with radicals and absolute values; no lesson yet, candidate to fold into batch 3), and 8.1.1.1, 8.1.1.5, 8.3.5.7, 8.3.5.8 (left out on purpose, below). A lesson is planned only for benchmarks an interactive visual can actually teach.

  | Batch | Lesson (proposed id) | Benchmarks | Status |
  |---|---|---|---|
  | 1 (Grade 8) | `what-is-a-function` | 8.3.7.3, 8.3.7.4 | built |
  | 1 (Grade 8) | `scatter-plots-and-lines-of-fit` | 8.1.1.2 to 8.1.1.4 | built |
  | 1 (Grade 8) | `square-roots-and-irrational-numbers` | 8.3.5.1, 8.3.5.2, 8.3.6.4 | built |
  | 1 (Grade 8) | `exponents-and-scientific-notation` | 8.3.5.3 to 8.3.5.5 | built |
  | 2 (Grade 8) | `solving-equations-with-a-balance` | 8.3.6.1, 8.3.6.3 | built |
  | 2 (Grade 8) | `forms-of-a-linear-equation` | 8.3.6.5, 8.3.6.6, 8.3.7.1 | built |
  | 2 (Grade 8) | `parallel-and-perpendicular-lines` | 8.2.4.2 | built |
  | 2 (Grade 8) | `distance-and-the-pythagorean-theorem` (plane and 3D) | 8.2.3.2, 8.2.3.3 | built |
  | 3 (Grade 8) | `inequalities-and-absolute-value` | 8.3.6.7, 8.3.6.8 | planned |
  | 3 (Grade 8) | `patterns-and-the-nth-term` | 8.3.7.2 | planned |
  | 4 (Algebra 1) | `domain-range-and-key-features` | 9.3.7.6, 9.3.7.7, 9.3.7.10 | planned |
  | 4 (Algebra 1) | `inverse-functions-and-composition` | 9.3.7.9, 9.3.5.9 | planned |
  | 4 (Algebra 1) | `polynomials-and-factoring` (area models) | 9.3.6.1, 9.3.6.4, 9.3.5.8 | planned |
  | 4 (Algebra 1) | `completing-the-square` | 9.3.6.5 (deeper), 9.3.6.2, 9.3.6.3 | planned |
  | 5 (Algebra 1) | `linear-inequalities-and-systems` | 9.3.7.1 | planned |
  | 5 (Algebra 1) | `radicals-and-rational-exponents` | 9.3.5.2, 9.3.6.8 | planned |
  | 5 (Algebra 1) | `sequences-recursive-and-explicit` | 9.3.7.4, 9.3.7.5 | planned |
  | 5 (Algebra 1) | `compound-interest` | 9.3.7.8 | planned |
  | 5 (Algebra 1) | `linear-and-exponential-models` (regression, residuals) | 9.1.1.6, 9.1.1.10, 9.1.1.11 | planned |

  Left out on purpose (not a good fit for an interactive canvas, or better as a calculator or a teacher-led task): 8.1.1.1, 8.1.1.5, 8.1.1.6 (designing investigations, building and explaining displays), 8.3.5.7, 8.3.5.8, 9.3.5.5, 9.3.5.6, 9.3.5.10 to 9.3.5.12 (finance reasoning and loan or retirement comparisons; a loan calculator tool could cover some), 9.3.5.3 (complex numbers), 9.3.5.4 (matrices), 9.3.6.6 (circle equation, Geometry), 9.3.6.7 (inverse proportion). Batches are built and reviewed one at a time so that every lesson gets the same testing as the first thirteen.
- **Course plan: Grade 6 and 7 foundations (started 2026-10-01; Grade 8 and Algebra 1 batches 3 to 5 paused at the owner's request).** Not a full Grade 6 or Grade 7 course: a focused set of lessons that lead into Grade 8 (ratios, rates, percent, proportional relationships, and the number and variable ideas under slope and linear equations). Courses will be filled out later, when the site is near production level. Audience: students working alone and teachers assigning lessons, so every lesson gives feedback that explains why, the text is pitched at ages 11 to 13, and the two quick-check questions must work as a printed exit ticket (readable and answerable on paper, without the canvas). Starting point: Grade 6 has 2 of 34 benchmarks tagged and Grade 7 has 8 of 35.

  | Batch | Lesson (proposed id) | Course | Benchmarks | Status |
  |---|---|---|---|---|
  | F-A | `ratios-and-equivalent-ratios` (tape diagrams, double number lines, mixtures) | Grade 6 | 6.3.6.5, 6.3.6.6 | built |
  | F-A | `unit-rates-and-best-buys` | Grade 6 | 6.3.5.10 | built |
  | F-A | `percents-on-tape-and-number-lines` | Grade 6 | 6.3.5.11, 6.3.6.2 | built |
  | F-A | `proportional-relationships` (tables, graphs, y = kx) | Grade 7 | 7.3.7.1 to 7.3.7.3 | built |
  | F-B | `variables-and-relationships` (independent and dependent variable) | Grade 6 | 6.3.7.1 | built |
  | F-B | `negative-numbers-and-absolute-value` | Grade 6 | 6.3.5.1 to 6.3.5.3, 6.3.5.6 | built |
  | F-B | `scale-drawings-and-proportions` | Grade 7 | 7.2.4.4, 7.3.6.4 | built |
  | F-B | `percent-change-and-money` (tax, tips, markups, simple interest) | Grade 7 | 7.3.6.5 | built |

  Possible later additions (not planned yet): adding and subtracting integers with distance on the number line (7.3.5.2, 7.3.5.4, 7.3.5.6), two-step equations and inequalities (7.3.6.2), unit rates with fractions (7.3.5.7), prisms (6.2.3.1, 6.2.3.2), angle sums (6.2.4.1, 6.2.4.2), coordinates and polygons (6.2.4.3), prime factors, GCF and LCM (6.3.5.4, 6.3.5.5), fraction models (6.3.5.8), sampling and inference (7.1.1.2 to 7.1.1.4), compound events (7.1.2.3 to 7.1.2.6).
- **Statistics and probability, school level (started 2026-10-01, at the owner's request).** Fills the biggest gaps in the Data and Probability strand (before this plan: Grade 6 data and chance 2 of 8 benchmarks tagged, Grade 7 4 of 12, Grade 8 4 of 6, Grades 9-11 6 of 23). Grade 6 and 7 lessons sit in the Grade 6 and Grade 7 courses (as the ratio lessons do) and the high-school ones in Statistics & Probability. Lessons for benchmarks that are about designing studies, writing questions or discussing culture and community (6.1.1.2, 6.1.1.5, 7.1.1.1, 7.1.1.6, 8.1.1.1, 8.1.1.5, 9.1.1.1, 9.1.1.2, 9.1.1.12, 9.1.1.14) are left to teachers, because a canvas cannot teach them well.

  | Batch | Lesson (id) | Course | Benchmarks | Status |
  |---|---|---|---|---|
  | S1 | `sample-spaces-and-probability` | Grade 6 | 6.1.2.1, 6.1.2.2, 7.1.2.1 | being built |
  | S1 | `statistical-questions-and-data-displays` | Grade 6 | 6.1.1.1, 6.1.1.4 | being built |
  | S1 | `compound-events-and-tree-diagrams` | Grade 7 | 7.1.2.4 | being built |
  | S1 | `samples-and-populations` | Grade 7 | 7.1.1.2, 7.1.1.3 | being built |
  | S2 | `two-way-tables-and-conditional-probability` (with Venn diagrams) | Statistics & Probability | 9.1.2.5, 9.1.2.2 | planned |
  | S2 | `the-normal-distribution` | Statistics & Probability | 9.1.1.7 | planned |
  | S2 | `correlation-and-causation` | Statistics & Probability | 9.1.1.5, 9.1.1.6 | planned |
  | S2 | `expected-value` | Statistics & Probability | 9.1.2.7, 9.1.2.8 | planned |
  | S3 | `bias-and-study-design` and `misleading-graphs` | Statistics & Probability | 9.1.1.3, 9.1.1.4, 9.1.1.15 | planned |

- **Undergraduate lessons (started 2026-10-01; the owner lifted the school-only hold for undergraduate work, graduate stays on hold).** The 15 undergraduate lessons not yet built, in four batches of parallel builders (same method as the school batches; no Minnesota standards apply, so there is no tag audit, but each batch still gets integration, tests, screenshots and an independent read for mathematical correctness). Courses added to `COURSES`: Calculus, Multivariable Calculus & Differential Equations, Complex Numbers, Fourier & Probability (Linear Algebra already existed). New lessons use the full lesson format (hook, 4 steps, formal, 2 checks, links); the one existing undergraduate lesson, `linear-transformations`, is still in the legacy format.

  | Batch | Lesson (id) | Course | Status |
  |---|---|---|---|
  | U1 | `limits-and-epsilon-delta` | Calculus | built |
  | U1 | `derivatives-as-tangent-slopes` | Calculus | built |
  | U1 | `riemann-sums-and-the-integral` | Calculus | built |
  | U1 | `the-fundamental-theorem-of-calculus` | Calculus | built |
  | U2 | `taylor-series`, `when-infinite-sums-converge` | Calculus | planned |
  | U2 | `vectors-span-and-linear-combinations`, `dot-product-and-projection` | Linear Algebra | planned |
  | U3 | `gradient-and-contour-maps`, `divergence-and-curl` | Multivariable & ODEs | planned |
  | U3 | `slope-fields-and-phase-portraits` | Multivariable & ODEs | planned |
  | U3 | `eulers-formula-and-complex-multiplication` | Complex, Fourier & Probability | planned |
  | U4 | `fourier-series-as-epicycles`, `the-central-limit-theorem`, `bayes-theorem` | Complex, Fourier & Probability | planned |

- **Teacher features (done in 0.10, see section 5):** plain-anchor share links to a lesson step, local progress tracking with a copyable summary, and a printable exit ticket per lesson. Not built: a class-wide teacher view (needs a backend), a combined multi-lesson ticket builder.
- **Final:** search and polish (progress tracking and teacher tools moved up, see above). (The lesson finder and standards alignment arrived early, in 0.9.)

## 10. Change log

- **0.15 (2026-10-01):** Undergraduate batch U1, the Calculus course: Limits and epsilon-delta (the epsilon-delta game on a graph, six functions, challenge mode), Derivatives as tangent slopes (secants to tangents, a live slope graph, sketch-the-derivative and find-the-bad-point challenges), Riemann sums and the integral (five sample rules, signed area, net change versus distance, smallest-n challenge), The fundamental theorem of calculus (accumulation function, strip argument, which-graph-is-A, F(b)-F(a)). New courses added (Calculus, Multivariable Calculus & Differential Equations, Complex Numbers/Fourier/Probability). An independent read recomputed every worked number and found no numeric or answer-key errors; fixes made: a misleading hook and a wrong feedback message (limits), a wrong "full wave" claim and two overstated continuity statements (fundamental theorem), "speed" vs "velocity" and a weak related link (Riemann), small wording fixes (derivatives). Tests: course and level checks are data-driven. Not republished to the artifact.
- **0.14.1 (2026-10-01):** Footer credit line "By Michael Sayers" (template and `.credit` style).
- **0.14 (2026-10-01):** Bug and polish pass. Swept every lesson at 1280, 390 and 320 px (light and dark), every step deep link, every exit ticket, the home, progress and token pages, 24 malformed link tokens and 30 rapid navigations: no page errors, no horizontal overflow, no broken links, all thumbnails drawn. Fixes: (1) **MathJax blocked or offline** (a school network can block the cdnjs host): lesson text used to show raw `\( ... \)`; `typeset()` now falls back to readable plain text (`texFallback`, built on the new `texFlat`: 2/3, x², ×, ⇒; the template's script tag sets `__mjFail` on error so the fallback is immediate, otherwise after 7.5 s). `texToText` (copy exit ticket as text) shares the same code and now writes `(y-y_1)/(x-x_1)`, `1/(b³)` and `2^(5+(-3))` correctly (it used to mangle nested exponents and fractions such as `\tfrac1{10}`). (2) Favicon (inline SVG), page description, Open Graph title and description, light and dark `theme-color`, and a `<noscript>` message. (3) Step dots on lesson pages are 30 px tall (were 22) for touch. Tests: both suites cover the fallback (`texFlat` cases; no raw TeX on a lesson page with MathJax blocked). Known and not changed: canvas handles cannot be moved with the keyboard (sliders and buttons can); the top navigation is hidden below 640 px (the footer still links to My progress; level headings are reached by scrolling).
- **0.13 (2026-10-01):** Home page and loading. (1) The hero's main button no longer starts the undergraduate "linear maps" lesson; it starts "Slope and linear functions" ("Start with slope"). (2) Course groups on the home page are collapsible (all closed at first, with a title preview; Expand all; filters open the groups with matches; the visitor's choices are remembered while the page is open), so the page no longer lists every lesson at once. (3) Lazy loading: `node tools/build.js --split` writes `dist/index.html` (159 KB instead of 1.19 MB) and one script per lesson (`dist/lessons/<id>.js`, 25 to 96 KB each); the engine fetches a lesson only when its page, its exit ticket or its thumbnail in an opened course needs it, shows a loading and a "Could not load, Try again" state, and warms the Next lesson. Lesson metadata for the home page comes from running each lesson in a build-time sandbox (`captureLessons` in `tools/build.js`), so no lesson file changed. The single-file `index.html` is unchanged in behavior and still the committed, offline-capable build. Tests: both suites run against either build (`CONTINUUM_BUILD=split`), and new checks cover the hero, collapsing, expand all, filter auto-open, and the split build's network behavior. Known limits: thumbnails in a closed course are not drawn until it is opened (the preview is text); a split build needs its `lessons/` folder next to `index.html`.
- **0.12 (2026-10-01):** Grade 6 and 7 foundations, batches F-A and F-B (section 9; not full courses, at the owner's request; the Grade 8 and Algebra 1 plan is paused). Eight new lessons built by parallel builders against the shared brief (now with an audience section: students aged 11 to 13 working alone or assigned by a teacher, feedback that explains why, check questions that read as a printed exit ticket), integrated and tested here, and audited independently for tags in two rounds: Ratios and equivalent ratios, Unit rates and best buys, Percents on tape diagrams, Proportional relationships (F-A); Variables and relationships, Negative numbers and absolute value, Scale drawings and proportions, Percent change and money (F-B). The Grade 6 course now has five lessons (31 lessons in all, 72 of 185 benchmarks tagged; Grade 6 benchmarks tagged went from 2 to 12 of 34 and Grade 7 from 8 to 14 of 35). Audit outcomes: no math errors and no tag removed. Added 6.3.6.6 to Unit rates and best buys (every rate and speed question is a double number line; a judgment call) and, in F-B, 6.3.6.6 to Scale drawings (mixtures and tables of equivalent ratios in every task) and 6.3.5.11 to Percent change and money (tape diagrams, discounts, markups, tips, commission), which put Grade 6 benchmarks on two Grade 7 lessons (their grade filters now show 6 and 7; remove the tag for strictly on-grade tags). 6.3.7.1 and 7.3.7.1 to 7.3.7.3 stay partial in one respect: equations are chosen or built by dragging, never typed. Fixes from the audits: percents feedback no longer calls a valid 10%-pieces approach "Not quite"; a self-contradictory message when picking < or > for 0.75 versus 3/4; a distractor and a claim of "every equivalent ratio"; the Mia jar answer ($25) is now stated in the formal section. Engine: `texToText` (copy exit ticket as text) used to strip anything between `<` and `>` and did not decode `&lt;`, so inequality symbols in check questions were lost; it now removes only real tags and decodes `&lt;`, `&gt;`, `&amp;`, `&nbsp;` (tested). Test: the pager-boundary check no longer assumes the first school lesson. Page weight: `index.html` is now 1.18 MB for 31 lessons (each new lesson adds 45 to 96 KB); lazy loading is the next architectural change worth making before many more lessons. Not fixed (cosmetic): the "Ruler" label in Scale drawings touches a stage corner mark; ruler ends have no keyboard control. The artifact was republished as version 11 at the owner's request.
- **0.11 (2026-10-01):** Batch 2 of the Grade 8 plan. Four new lessons, built by parallel builders against the shared brief (which now asks the student to do the mathematics, not only watch), integrated and tested here, and audited independently for tags: Parallel and perpendicular lines, Distance and the Pythagorean theorem (plane, 3D box and stories), Forms of a linear equation, Solving equations with a balance (Grade 8 coverage 22 to 30 of 38; 56 of 185 benchmarks tagged). The audit found no math errors and kept every planned tag. It added 8.3.7.6 to Forms of a linear equation (slope, y-intercept and x-intercept and what each means, moderate) and 9.3.5.7 to Solving equations with a balance (rearranging formulas; no check question covers it and 8.3.6.3 already names it at grade level, so this tag is a judgment call that puts "Grades 9-11" in that lesson's grade filter; drop it for strictly on-grade tags). It rated 8.3.6.1 moderate (commutative and associative are listed but never exercised) and 8.2.3.2 and 8.2.3.3 fully covered (3D shapes other than a rectangular box and non-integer coordinates are not covered). It rejected 8.3.6.5 for Parallel and perpendicular lines (standard form is absent). Fixed one formal-text wording in Parallel and perpendicular lines (the 90 degrees comes from the quarter turn, not from rotations preserving angles). Prerequisite links recorded for the Grade 8 order: Solving equations with a balance now precedes Systems of equations and Forms of a linear equation; Forms precedes Parallel and perpendicular lines; Scatter plots builds on Slope; Distance builds on the Pythagorean theorem and Square roots. Known cosmetic limits (not fixed): in Forms, the line y = 2x + 2 skips the point (4, 10) in the proportional view because of a margin guard (the panel table still lists it); at extreme legs in Distance a leg label can touch a point name; Distance handles have no keyboard control (as in the other lessons).
- **0.10 (2026-10-01):** Teacher tools and the first Grade 8 batch. Plain-anchor share links (`#<lesson>.3`, `#find~...`, `#progress`, `#<lesson>.ticket`/`.key`) that survive the artifact viewer, step deep links with copy-link buttons, local progress tracking with a copyable summary, printable exit tickets (section 5). Course plan for Grade 8 and Algebra 1 (section 9). Four new lessons built by parallel builders against a shared brief and then integrated and tested here, with an independent tag audit (no unsupported tags and no math errors; it added 9.3.7.10 and 8.1.1.6, and rated 8.3.7.4 and 8.1.1.2 partial: students never build a function or plot their own points): What is a function?, Scatter plots and lines of fit, Square roots and irrational numbers, Exponents and scientific notation (Grade 8 coverage 11 to 22 of 38 benchmarks). Fixed a bug that was already live: `\(0<b<1\)` in Exponential growth was parsed as a `<b>` tag and swallowed the rest of that paragraph; the build now checks every lesson's TeX for this. Test suites moved into `tools/tests/` and made data-driven.
- **0.9 (2026-10-01):** Courses, standards and filters. Lessons are grouped under courses (Grade 7, Grade 8, Algebra 1, Geometry, Precalculus & Trigonometry, Statistics & Probability; Linear Algebra and Complex Analysis for the two upper-level lessons) in a computed, consistent order that also drives the pager. Each lesson is tagged with its Minnesota 2022 benchmarks (185-benchmark catalog in `src/curriculum/standards-mn2022.js`, extracted from the official document and checked against it), a skill level, and derived grade levels and strands, shown as strand-colored chips on the home list and lesson pages and in a "Standards alignment" section. New home-page lesson finder (grade level, course, skill level, standard, standard strand) with live counts, shareable URLs and a mobile collapse. New: `src/curriculum/`, `engine/curriculum.js`, `engine/finder.js`, `styles/curriculum.css`, build-time curriculum checks (`--order` prints the sequence). Two cross-links changed so they agree with the course order: Area of a circle no longer lists the Pythagorean theorem as a prerequisite (now "related"; the lesson does not use it), and Quadratics no longer says it leads to Exponential growth (now "related"; exponential growth comes first in Algebra 1). The finder's URL update is wrapped in try/catch so a frame that refuses `history.replaceState` (the artifact viewer is locked down) cannot break filtering.
- **0.8 (2026-10-01):** Phase 5. The last four school lessons (inscribed angles, mean/median/spread, probability with repeated trials, Pascal's triangle and the Galton board), completing the school level. `Plane.fit(W, H, margins)` added. Lesson order: algebra, geometry, then probability and data. Cross-links only point at lessons that exist or are in `PLANNED`.
- **0.7 (2026-10-01):** Phase 4. Four more school lessons (functions as transformations, exponential growth, area of a circle, similarity and scaling). Lesson order in `manifest.json` follows the curriculum (algebra, then geometry, then the unit circle). Quadratics now lists Functions as transformations as a prerequisite. `TAU` moved into `engine/math.js`.
- **0.6 (2026-09-30):** Phase 3. Four school lessons in the new lesson format (slope, systems of equations, quadratics, unit circle and trig waves). Engine additions: `snap`, `Plane.ticks()`, `near()`, `num`/`linEq`, stacked-pane stage (`.stage.split`). Lesson order in `manifest.json`: algebra lessons, Pythagorean theorem, unit circle, then the two upper-level lessons.
- **0.5 (2026-09-30):** Source split into `src/` with `tools/build.js` (output verified equivalent to 0.4). Lesson-format engine: `hook`, guided `steps` (stepper in the side panel, scenes with `apply`), `formal`, multiple-choice `check`, `links` cross-links (`lessonRef`, slug-matched planned lessons), per-level pager, `animateTo`. Side panel scrolls when taller than the viewport. `PLANNED` school list set to the draft curriculum. Pythagorean lesson retrofitted as the reference. Undergraduate and graduate lessons only moved into files, content unchanged.
- **0.4 (2026-09-30):** Display face changed from Unbounded to Sora for a sleeker, lighter look; weights and sizes retuned.
- **0.3 (2026-09-30):** Type update. Replaced Bodoni Moda with Unbounded for display; explanation prose moved from STIX Two Text to Hanken Grotesk; canvas non-italic labels now sans; level markers changed from I/II/III to 01/02/03; display sizes retuned for the wider face.
- **0.2 (2026-09-30):** Visual redesign ("drafting instruments"). New fonts (Bodoni Moda, Hanken Grotesk), brass accent, dot-grid background, sticky blurred top bar with level links and icon theme toggle, full-bleed hero with live matrix readout, numbered level sections, topic thumbnails (`thumb` in the module contract), breadcrumb and Previous/Next pager, stage corner ticks and pointer coordinates (`data-coords`), custom sliders/toggles/selects, `#/level/<id>` route, `Plane` `transparent` option.
- **0.1 (2026-09-30):** Initial build. Core engine (Plane, Controls, tween, draggable), hash router, light/dark theme, home page with animated hero, three visualizations.
