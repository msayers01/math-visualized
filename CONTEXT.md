# Continuum: Context Window

**Version:** v16
**Last updated:** 2026-10-01

## ⚠️ Current priority: middle & high school ONLY
Instructions for any AI working on this project (including in a new chat):
- Work only on **middle & high school** lessons until the owner explicitly says otherwise.
- Do **not** build, draft, prototype, or code any undergraduate or graduate lessons, even if they appear in the curriculum or roadmap below. They are listed for planning only.
- Engine and lesson-format work is allowed, since the school lessons need it. When touching the existing undergraduate and graduate lessons, change only what an engine update requires; do not extend them (this includes their "planned" lists).
- If a request is ambiguous about level, assume middle & high school and ask before touching upper-level content.
- **Status: the school level is complete (13 of 13 lessons), organized by course, aligned to the 2022 Minnesota math standards, and filterable (v0.9).** Nothing is queued. Ask the owner what to do next before starting new work (see Open items).

## Project
Continuum, a 3Blue1Brown-style interactive math visualization website covering three levels: middle & high school, undergraduate, and graduate.

## Where things live
- **Repo:** https://github.com/msayers01/math-visualized (default branch `main`). Work happens on the session's designated branch (this session: `claude/dreamy-dirac-b8r5nd`); PRs #1, #2 and #3 are merged into `main` as regular merges. The v0.9 work (courses, standards, filters) is on this session's branch and is not merged; no PR has been opened. After a merge, restart the branch from `main` (`git checkout -B <branch> origin/main`, force-with-lease push) before doing more work.
- **Artifact (published site):** https://claude.ai/artifact/GKZsE5yY5QkwNiqJh8AFJV, still version 7 (republished 2026-10-01 from ARCHITECTURE v0.8, so it does **not** yet show v0.9). Earlier phases were republished after the owner merged the PR; do the same for v0.9 (or when the owner asks). Private: only the owner can open it until shared from the Share menu.
- **Files:** `index.html` (generated website), `src/` (sources), `tools/build.js` (build and curriculum checks), `ARCHITECTURE.md` (structure, contracts, design system, change log), `CONTEXT.md` (this file).

## Tech
- Single self-contained `index.html`, **generated** from `src/` by `node tools/build.js` (`--check` fails if stale; `--order` prints the course sequence). Edit `src/`, rebuild, commit both.
- Plain JavaScript and Canvas 2D; MathJax 3.2.2 (SVG output, cdnjs) for equations. No framework.
- Fonts: Sora (display), Hanken Grotesk (body and UI), STIX Two italic (canvas math symbols only).
- Look: precision instruments (midnight ink / cool paper, brass accent, hairlines, slim geometric display type). Math colors: blue (lines/grids), yellow (areas, special points), green (first direction), red (second direction), violet (special structure). Standard strands reuse yellow, violet and blue for tags (with distinct shapes).

## Source layout (details in ARCHITECTURE.md)
```
src/template.html   src/manifest.json (ordered styles, curriculum, engine, lessons, app)
src/styles/*.css    src/curriculum/*.js    src/engine/*.js    src/lessons/<level>/<id>.js    tools/build.js
```
Adding a lesson = one new file in `src/lessons/<level>/`, one line in `src/manifest.json`, **and one entry in `ALIGN` in `src/curriculum/curriculum.js`** (course, skill level, benchmarks; the build fails without it). Lesson ids are URL slugs. A planned lesson's id is the slug of its title in `PLANNED` (`src/engine/registry.js`), so a built lesson replaces its planned entry automatically. Display order is **computed** (see Curriculum below), not set by manifest order.

## Engine quick reference
- `Plane` (math-coordinate canvas): `grid`, `ticks`, `path`, `curve`, `arrow`, `dot`, `label`, `fit(W,H,margins)`; one uniform scale, so plots with different axis scales draw in a normalized area (see `exponential-growth`).
- `Controls`: `title`, `hint`, `slider` (returns `{set,get}`), `buttons`, `select`, `toggle`, `readout`.
- `draggable(plane, {hit, move})`, `near()`, `snap`, `tween`, `animateTo`, `num`, `linEq`, `TAU`.
- Lesson object: `id, level, title, blurb, thumb, hook, steps[{title,text,set}], formal, check[{q,choices,answer,why,hint}], links{prereq,next,related}, mount()`. `mount` returns `{destroy, apply(patch, immediate)}`; a step's `set` patch is passed to `apply`, which animates numeric fields with `animateTo` and handles non-numeric flags itself.
- Lessons with two canvases use `stage.classList.add('split')` and two `.pane` hosts.
- Curriculum (`engine/curriculum.js`, pure): `curriculumMeta`, `orderLessons`, `applyCurriculum`, `matches`/`facetCount` (filters), `filterFromHash`/`filterToHash`. UI in `engine/finder.js`: `SkillMeter`, `StdChip`, `LessonTags`, `Finder`.

## Curriculum, standards, and filters (new in v0.9)
- **Courses (school, in order):** Grade 6, Grade 7, Grade 8, Algebra 1, Geometry, Algebra 2, Precalculus & Trigonometry, Statistics & Probability (empty courses are hidden; Grade 6 and Algebra 2 have no lessons yet). Undergraduate: Linear Algebra. Graduate: Complex Analysis. High-school course names are conventional: the 2022 Minnesota document has one Grades 9-11 band.
- **Standards:** the *2022 Minnesota K-12 Academic Standards in Mathematics* (adopted into rule 2025, fully implemented 2027-28). All 185 benchmarks for Grades 6, 7, 8 and 9-11 are in `src/curriculum/standards-mn2022.js`. Strands: 1 Data and Probability, 2 Spatial Reasoning, 3 Patterns and Relationships. Code format `band.strand.anchor.n` (band 9 = Grades 9-11).
- **Per-lesson alignment** lives in `ALIGN` in `src/curriculum/curriculum.js`: `{ id, course, skill, standards }`. Tagging rule: tag a benchmark only when the lesson's steps, interactive, formal math or checks actually address it. Grades and strands are derived (course grades plus each tag's band).
- **Skill levels:** Introductory (first look, needs nothing else), Intermediate (on-grade, builds on earlier ideas), Advanced (proof-style, or beyond the grade-band benchmarks). Judgment calls by the author of v0.9; the owner may adjust any of them in `ALIGN`.
- **Order rule:** level, course sequence, skill level, first benchmark in document order, registration order; never before a same-course lesson it builds on. The build fails if any "Builds on" link points forward or any "Leads to" link points backward in that order.
- **Filters** on the home page: grade level, course, skill level, standard, standard strand. Counts update live, impossible options are disabled, state is in the URL (`#/?grade=8&skill=intro&strand=pr&course=grade8&std=8.2.4.1`). Lesson pages show course, skill, grades and benchmark chips, plus a "Standards alignment" section.
- **Updating the standards:** `education.mn.gov` blocks scripted downloads (a browser check page), so the owner must supply any new PDF as a file (upload failed for PDFs once; pasting the text or committing the PDF to the branch also works). Extraction method used: `pdfplumber` table rows, every code cross-checked against `pdftotext`, lossy benchmarks (superscripts, fractions) checked against rendered pages.
- **Judgment calls to confirm with the owner:** the course placement and skill level of each lesson; the tags (an independent review was run, see ARCHITECTURE.md change log); the unit circle lesson goes beyond the 9-11 benchmarks (only the right-triangle trigonometry benchmarks apply).

## Lessons built (15)
School (13), in computed display order:
- Grade 7: area-of-a-circle
- Grade 8: pythagorean-theorem, slope-and-linear-functions, systems-of-equations
- Algebra 1: exponential-growth, functions-as-transformations, quadratics-and-the-parabola
- Geometry: similarity-and-scaling, inscribed-angles
- Precalculus & Trigonometry: the-unit-circle-and-trig-waves
- Statistics & Probability: mean-median-and-spread, probability-with-repeated-trials, pascals-triangle-and-the-galton-board

All use the full lesson format (hook, 4 guided steps, formal math, 2 quick-check questions, links).
Undergraduate (1): linear-transformations. Graduate (1): conformal-maps. Both are in the legacy format (`explain` prose only), untouched since v0.4 apart from carrying a course and skill level.

## How lessons are authored and checked
1. Write `src/lessons/<level>/<id>.js` modeled on an existing lesson (for example `slope-and-linear-functions.js`). Keep default state free of overlapping drag handles. Snap dragged values so readouts stay clean.
2. Add it to `src/manifest.json` and add its `ALIGN` entry (course, skill, benchmarks; read the benchmark wording in `standards-mn2022.js` before tagging), then run `node tools/build.js` (it checks the curriculum and prerequisite order; `--order` prints the sequence).
3. Test in headless Chromium (Playwright is installed in `/opt/node-tools`; MathJax's CDN is blocked in the sandbox, so abort external requests or serve a local copy of MathJax 3.2.2 through request routing). Step through every lesson step and compare the readouts with the text, drag every handle, use sliders and buttons, screenshot desktop light, dark and 390px mobile, and check for `pageerror` and horizontal scroll. A check script that loops over lesson ids must slice hrefs correctly (`#/viz/` is 6 characters) or it silently tests the home page. For curriculum changes, compare the visible rows for each filter state against an independent model of the data (237 checks passed in v0.9).
4. Update `ARCHITECTURE.md` (visualizations table, alignment table, change log) and this file, commit, push.
5. Pitfalls met so far: `$` is fine in plain text, but inside math use `\$`; step `set` patches must stay numeric unless `apply` splits the flag off; angles that animate should avoid wrapping through 0/360; links to lessons not in `PLANNED` render nothing; a top-level `const` name that two source files share breaks the whole bundle (everything is one script), so grep before adding globals; `display` rules override the `hidden` attribute (`styles/curriculum.css` forces `[hidden]` to hide).

## Publishing the artifact
- Build `index.html`, then produce a copy without the `<!doctype>`, `<html>`, `<head>`, `<body>` wrappers (keep `<title>`, fonts, scripts, `<style>`, and the body contents); the publish step wraps the page itself. Do not include the `<meta>` tags.
- Publish with the `Artifact` tool using the artifact URL above. If it refuses because the live version was not viewed, read it with `action: "read"` and, if asked, Read the saved copy in full. The live page has only ever been published from this repo's `index.html`.
- Static `<title>` is "Continuum: mathematics you can move"; the page also sets `document.title` at runtime. The `description` used is "Interactive, 3Blue1Brown-style math visualizations with guided lessons, from middle school through graduate study."
- Last published: version 7 from ARCHITECTURE v0.8. v0.9 is not published yet.

## Standing rules
1. Update the context window every turn and provide it (kept in `CONTEXT.md`).
2. Update `ARCHITECTURE.md` whenever a feature is added, a bug is fixed, or the architecture changes.
3. Flag tasks that may exceed tool limits before starting and propose smaller chunks.

## Progress
- **Done:** Phase 1 (shell, engine, 3 visualizations); UI redesign and type updates (ARCHITECTURE v0.2 to v0.4)
- **Done:** Phase 2 (v0.5): source split + build script; lesson-format engine; Pythagorean theorem retrofitted as the reference school lesson
- **Done:** Phase 3 (v0.6): Slope and linear functions; Systems of equations; Quadratics and the parabola; The unit circle and trig waves
- **Done:** Phase 4 (v0.7): Functions as transformations; Exponential growth; Area of a circle; Similarity and scaling
- **Done:** Phase 5 (v0.8): Inscribed angles; Mean, median, and spread; Probability with repeated trials; Pascal's triangle and the Galton board
- **Done:** Curriculum pass (v0.9): courses and computed order; Minnesota 2022 standards catalog and per-lesson tags; skill levels; color-coded standard chips; lesson finder (grade, course, skill, standard, strand); build-time checks
- **Next:** nothing queued (see Open items).

## Curriculum (school level approved and built; undergraduate and graduate are DRAFT, ON HOLD)
42 lessons total (15 built, 27 not built). ✓ = built. School lessons are listed by course in display order.

**Middle & high school (13), all built**
- Grade 7: Area of a circle ✓
- Grade 8: The Pythagorean theorem ✓; Slope and linear functions ✓; Systems of equations ✓
- Algebra 1: Exponential growth ✓; Functions as transformations ✓; Quadratics and the parabola ✓
- Geometry: Similarity and scaling ✓; Inscribed angles ✓
- Precalculus & Trigonometry: The unit circle and trig waves ✓
- Statistics & Probability: Mean, median, and spread ✓; Probability with repeated trials ✓; Pascal's triangle and the Galton board ✓

**Undergraduate (16), ON HOLD**
- Calculus: Limits and ε–δ; Derivatives as tangent slopes; Riemann sums and the integral; Fundamental theorem of calculus; Taylor series; When infinite sums converge
- Linear algebra: Vectors, span, and linear combinations; Linear transformations and eigenvectors ✓; Dot product and projection
- Multivariable & ODEs: Gradient and contour maps; Divergence and curl; Slope fields and phase portraits
- Complex, Fourier & probability: Euler's formula and complex multiplication; Fourier series as epicycles; Central limit theorem; Bayes' theorem

**Graduate (13), ON HOLD**
- Complex analysis: Conformal maps ✓; Möbius maps and the hyperbolic plane; Branch cuts and Riemann surfaces
- Algebra: Cayley graphs of groups; Rotations, quaternions, and SO(3)
- Topology: Homotopy and the fundamental group; Covering spaces
- Geometry: Manifolds and tangent spaces; Curvature and parallel transport
- Analysis: The Fourier transform; Functions as vectors (Hilbert spaces)
- Dynamics & probability: Chaos and the logistic map; Brownian motion and the heat equation

## Lesson format (implemented in v0.5)
Hook question → interactive canvas → guided "Try this" steps that drive the canvas → the formal math → quick check (2 multiple-choice questions) → connections (builds on / leads to / related) → standards alignment (v0.9).

## Roadmap
- Phases 1–5: done (engine, lesson format, all 13 school lessons). v0.9: courses, standards, filters.
- Phases 6+: undergraduate and graduate lessons (ON HOLD until the owner lifts the school-only priority).
- Final phase: search, progress tracking, polish (the owner may want parts of this for the school level first).

## Open items
- **Decision needed:** what comes next. Options: (a) lift the school-only priority and start the undergraduate level (suggest first batch of about 4, plus retrofitting Linear transformations to the lesson format); (b) polish the school level: progress tracking for quick checks, search, a school-first home page; (c) fill the empty courses (Grade 6 and Algebra 2 have no lessons; many benchmarks are untagged, 34 of 185 so far); (d) something else.
- **Review the v0.9 judgment calls** (course placement, skill levels, benchmark tags) and say what to change; each is one line in `ALIGN`.
- The home hero still links to the undergraduate "Start with linear maps"; consider pointing it at a school lesson.
- Cross-links can only point at lessons that exist or are in `PLANNED`. Curriculum lessons such as Central limit theorem and Bayes' theorem are not in `PLANNED` (it lists only 4 upper-level titles per level), so they cannot be linked until the owner lifts the hold.
- The artifact's static title is "Continuum: mathematics you can move"; a plain "Continuum" would match the page-naming guidance. Not changed without the owner's say-so.
- If the 2022 standards change (they take full effect 2027-28), the owner supplies the new PDF and the catalog is re-extracted; the build then flags any lesson tag whose code no longer exists.
