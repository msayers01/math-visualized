# Continuum: Context Window

**Version:** v27
**Last updated:** 2026-10-01

## ⚠️ Current priority: middle & high school ONLY
Instructions for any AI working on this project (including in a new chat):
- Work only on **middle & high school** lessons until the owner explicitly says otherwise.
- Do **not** build, draft, prototype, or code any undergraduate or graduate lessons, even if they appear in the curriculum or roadmap below. They are listed for planning only.
- Engine and lesson-format work is allowed, since the school lessons need it. When touching the existing undergraduate and graduate lessons, change only what an engine update requires; do not extend them (this includes their "planned" lists).
- If a request is ambiguous about level, assume middle & high school and ask before touching upper-level content.
- **Status: the original 13 school lessons are complete; at the owner's request (2026-10-01) school work now continues as a complete Grade 8 and Algebra 1 sequence (course plan in ARCHITECTURE.md section 9) plus teacher tools. 25 school lessons are built (Grade 8 batches 1 and 2 and Grade 6-7 batch F-A are done; Grade 8 coverage 30 of 38 benchmarks; Grade 6 and Grade 7 foundations in progress); Grade 8/Algebra 1 batches 3 to 5 are paused.** Ask the owner before starting each next batch (see Open items).

## Project
Continuum, a 3Blue1Brown-style interactive math visualization website covering three levels: middle & high school, undergraduate, and graduate.

## Where things live
- **Repo:** https://github.com/msayers01/math-visualized (default branch `main`). Work happens on the session's designated branch (this session: `claude/dreamy-dirac-b8r5nd`); PRs #1, #2 and #3 are merged into `main` as regular merges. PR #4 (courses, standards, filters; v0.9) is also merged into `main` (regular merge, 2026-10-01). The repo has no CI checks configured. **PR #5** (https://github.com/msayers01/math-visualized/pull/5, opened by the owner) was **merged into `main` on 2026-10-01** (merge commit cc779d1; it carried teacher tools, batch 1 and 2 lessons, the Grade 6-7 plan and the first three batch F-A lessons). At the owner's go-ahead (2026-10-01) the session branch was restarted from `main` (`git checkout -B claude/dreamy-dirac-b8r5nd origin/main`, the three commits that `main` lacked were cherry-picked back on top, then pushed with `--force-with-lease`); the branch is now `main` plus the unmerged docs and batch F-A work, so a new PR from it shows only those. After a merge, restart the branch from `main` (`git checkout -B <branch> origin/main`, force-with-lease push) before doing more work.
- **Artifact (published site):** https://claude.ai/artifact/GKZsE5yY5QkwNiqJh8AFJV, version 10, republished 2026-10-01 at the owner's request from ARCHITECTURE v0.11 (teacher tools, batches 1 and 2 of the Grade 8 and Algebra 1 plan: 21 school lessons, 56 of 185 benchmarks tagged). It was built from this branch (commit 51aa7fd), which is the head of PR #5 (ahead of `main`). Private: only the owner can open it until shared from the Share menu.
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
- **Courses (school, in order):** Grade 6, Grade 7, Grade 8, Algebra 1, Geometry, Algebra 2, Precalculus & Trigonometry, Statistics & Probability (empty courses are hidden; only Algebra 2 has no lessons yet; Grade 6 and Grade 7 hold a focused foundations set, not full courses). Undergraduate: Linear Algebra. Graduate: Complex Analysis. High-school course names are conventional: the 2022 Minnesota document has one Grades 9-11 band.
- **Standards:** the *2022 Minnesota K-12 Academic Standards in Mathematics* (adopted into rule 2025, fully implemented 2027-28). All 185 benchmarks for Grades 6, 7, 8 and 9-11 are in `src/curriculum/standards-mn2022.js`. Strands: 1 Data and Probability, 2 Spatial Reasoning, 3 Patterns and Relationships. Code format `band.strand.anchor.n` (band 9 = Grades 9-11).
- **Per-lesson alignment** lives in `ALIGN` in `src/curriculum/curriculum.js`: `{ id, course, skill, standards }`. Tagging rule: tag a benchmark only when the lesson's steps, interactive, formal math or checks actually address it. Grades and strands are derived (course grades plus each tag's band).
- **Skill levels:** Introductory (first look, needs nothing else), Intermediate (on-grade, builds on earlier ideas), Advanced (proof-style, or beyond the grade-band benchmarks). Judgment calls by the author of v0.9; the owner may adjust any of them in `ALIGN`.
- **Order rule:** level, course sequence, skill level, first benchmark in document order, registration order; never before a same-course lesson it builds on. The build fails if any "Builds on" link points forward or any "Leads to" link points backward in that order.
- **Filters** on the home page: grade level, course, skill level, standard, standard strand. Counts update live, impossible options are disabled, state is in the URL (`#/?grade=8&skill=intro&strand=pr&course=grade8&std=8.2.4.1`). Lesson pages show course, skill, grades and benchmark chips, plus a "Standards alignment" section.
- **Updating the standards:** `education.mn.gov` blocks scripted downloads (a browser check page), so the owner must supply any new PDF as a file (upload failed for PDFs once; pasting the text or committing the PDF to the branch also works). Extraction method used: `pdfplumber` table rows, every code cross-checked against `pdftotext`, lossy benchmarks (superscripts, fractions) checked against rendered pages.
- **Judgment calls to confirm with the owner:** the course placement and skill level of each lesson; the tags (an independent review of the first 34 rated 10 direct and 23 partial, and the tags were adjusted; see section 5 of ARCHITECTURE.md); the unit circle lesson goes beyond the 9-11 benchmarks (only 9.2.3.8, acute-angle trigonometric ratios, is nearby).

## Teacher tools (new in v0.10; details in ARCHITECTURE.md sections 3 and 5)
- **Share links** are plain tokens (letters, digits, `. _ ~ -` only), the only hash form a link to the artifact viewer can deliver: `#<lesson-id>`, `#<lesson-id>.3` (step 3), `#<lesson-id>.ticket` / `.key`, `#find~grade_8~skill_intro~std_8.2.4.1`, `#progress`. Old `#/viz/...` forms still parse.
- **Progress** is stored per browser (`continuum-progress-v1`); `#progress` shows it with a copyable plain-text summary, optional name, print and a two-step reset. No accounts, no server.
- **Exit tickets** (`#<lesson-id>.ticket`, `.key`): the lesson's two quick-check questions as a printable handout, copy as text.
- In the artifact viewer (frame), copy-link buttons copy only the token and the print button is hidden; on its own address they copy full links.
- Lessons by parallel builders: `src/lessons/school/<id>.js` must keep ALL helpers inside one `{ }` block (everything is one script), and TeX must not contain `<` before a letter.

## Lessons built (27)
School (25), in computed display order:
- Grade 6: ratios-and-equivalent-ratios, unit-rates-and-best-buys, percents-on-tape-and-number-lines
- Grade 7: area-of-a-circle, proportional-relationships
- Grade 8: pythagorean-theorem, slope-and-linear-functions, what-is-a-function, scatter-plots-and-lines-of-fit, square-roots-and-irrational-numbers, distance-and-the-pythagorean-theorem, exponents-and-scientific-notation, solving-equations-with-a-balance, systems-of-equations, forms-of-a-linear-equation, parallel-and-perpendicular-lines
- Algebra 1: exponential-growth, functions-as-transformations, quadratics-and-the-parabola
- Geometry: similarity-and-scaling, inscribed-angles
- Precalculus & Trigonometry: the-unit-circle-and-trig-waves
- Statistics & Probability: mean-median-and-spread, probability-with-repeated-trials, pascals-triangle-and-the-galton-board

All use the full lesson format (hook, 4 guided steps, formal math, 2 quick-check questions, links).
Undergraduate (1): linear-transformations. Graduate (1): conformal-maps. Both are in the legacy format (`explain` prose only), untouched since v0.4 apart from carrying a course and skill level.

## How lessons are authored and checked
1. Write `src/lessons/<level>/<id>.js` modeled on an existing lesson (for example `slope-and-linear-functions.js`). Keep default state free of overlapping drag handles. Snap dragged values so readouts stay clean.
2. Add it to `src/manifest.json` and add its `ALIGN` entry (course, skill, benchmarks; read the benchmark wording in `standards-mn2022.js` before tagging), then run `node tools/build.js` (it checks the curriculum and prerequisite order; `--order` prints the sequence).
3. Test in headless Chromium (Playwright is installed in `/opt/node-tools`; MathJax's CDN is blocked in the sandbox, so abort external requests or serve a local copy of MathJax 3.2.2 through request routing). Step through every lesson step and compare the readouts with the text, drag every handle, use sliders and buttons, screenshot desktop light, dark and 390px mobile, and check for `pageerror` and horizontal scroll. A check script that loops over lesson ids must slice hrefs correctly (`#/viz/` is 6 characters) or it silently tests the home page. For curriculum changes, compare the visible rows for each filter state against an independent model of the data The suites live in the repo: `node tools/tests/finder.test.js` (262 checks) and `node tools/tests/teacher.test.js` (55 checks); both take their expectations from the data, so adding lessons needs no test edits. Also read each lesson's text for TeX like `\(a<b\)`: the build now rejects `<` directly before a letter inside TeX (write `&lt;`).
4. Update `ARCHITECTURE.md` (visualizations table, alignment table, change log) and this file, commit, push.
5. Pitfalls met so far: `$` is fine in plain text, but inside math use `\$`; step `set` patches must stay numeric unless `apply` splits the flag off; angles that animate should avoid wrapping through 0/360; links to lessons not in `PLANNED` render nothing; a top-level `const` name that two source files share breaks the whole bundle (everything is one script), so grep before adding globals; `display` rules override the `hidden` attribute (`styles/curriculum.css` forces `[hidden]` to hide).

## Publishing the artifact
- Build `index.html`, then produce a copy without the `<!doctype>`, `<html>`, `<head>`, `<body>` wrappers (keep `<title>`, fonts, scripts, `<style>`, and the body contents); the publish step wraps the page itself. Do not include the `<meta>` tags.
- Publish with the `Artifact` tool using the artifact URL above. If it refuses because the live version was not viewed, read it with `action: "read"` and, if asked, Read the saved copy in full. The live page has only ever been published from this repo's `index.html`.
- Static `<title>` is "Continuum: mathematics you can move"; the page also sets `document.title` at runtime. The `description` used is "Interactive, 3Blue1Brown-style math visualizations with guided lessons, from middle school through graduate study."
- Last published: version 10 (2026-10-01) from v0.11 (commit 51aa7fd), 632.7 KB. Not opened in the live viewer from the sandbox, so confirm it there. Only a plain `#anchor` from an artifact link reaches the page's `location.hash` inside the viewer, so shareable filter links (`#/?...`) are reliable in the standalone `index.html` and when clicked inside the page, but may not carry over when shared as an artifact link.

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
- **Done:** Teacher tools (v0.10): plain-anchor share links, step deep links, copy-link buttons, local progress with copyable summary, printable exit tickets (see Teacher tools below)
- **Done:** Course plan for Grade 8 and Algebra 1 and its batch 1: what-is-a-function, scatter-plots-and-lines-of-fit, square-roots-and-irrational-numbers, exponents-and-scientific-notation (Grade 8 coverage 11 to 22 of 38 benchmarks)
- **Done:** Batch 2 (v0.11): solving-equations-with-a-balance, forms-of-a-linear-equation, parallel-and-perpendicular-lines, distance-and-the-pythagorean-theorem; independent tag audit applied (added 8.3.7.6 and 9.3.5.7); Grade 8 coverage 30 of 38, 56 of 185 benchmarks tagged overall; prerequisite links set so the Grade 8 order teaches equations before systems and forms
- **In progress (owner's request, 2026-10-01): Grade 6 and 7 foundations, not a full course** (the owner will expand each course later, when the site is near production level). Audience: students working alone AND teachers assigning lessons, so every lesson teaches by itself (feedback explains why), is pitched at ages 11 to 13, and has two check questions that work as a self-contained paper exit ticket. Plan in ARCHITECTURE.md section 9: batch F-A (four lessons, all integrated and tested: ratios-and-equivalent-ratios, unit-rates-and-best-buys, percents-on-tape-and-number-lines (Grade 6), proportional-relationships (Grade 7); tag audit running); batch F-B (approved by the owner; four parallel builders running): variables-and-relationships, negative-numbers-and-absolute-value (Grade 6), scale-drawings-and-proportions, percent-change-and-money (Grade 7).
- **Paused (owner's request, 2026-10-01):** Grade 8 work. Batch 3 (inequalities-and-absolute-value, patterns-and-the-nth-term) is not started; Grade 8 stands at 30 of 38 benchmarks.
- **Next:** apply the batch F-A tag audit; integrate, test and audit batch F-B when its builders report; then **republish the artifact once F-B is done (approved by the owner 2026-10-01; version 10 has neither F-A nor F-B)**, and ask the owner about the next area.

## Curriculum (school level approved and built; undergraduate and graduate are DRAFT, ON HOLD)
The original draft was 42 lessons (15 built then, 27 not built); the school part has since grown (27 built in all, 25 of them school). ✓ = built. School lessons are listed by course in display order.

**Middle & high school (25 built; 11 more planned for Grade 8 and Algebra 1 (paused) and 4 for Grade 6-7 batch F-B, see ARCHITECTURE.md section 9)**
- Grade 6: Ratios and equivalent ratios ✓; Unit rates and best buys ✓; Percents on tape diagrams ✓
- Grade 7: Area of a circle ✓; Proportional relationships ✓
- Grade 8: The Pythagorean theorem ✓; Slope and linear functions ✓; What is a function? ✓; Scatter plots and lines of fit ✓; Square roots and irrational numbers ✓; Distance and the Pythagorean theorem ✓; Exponents and scientific notation ✓; Solving equations with a balance ✓; Systems of equations ✓; Forms of a linear equation ✓; Parallel and perpendicular lines ✓
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
- Phases 1–5: done (engine, lesson format, the first 13 school lessons). v0.9: courses, standards, filters. v0.10: teacher tools and batch 1 of the Grade 8 and Algebra 1 plan. v0.11: batch 2.
- Phases 6+: undergraduate and graduate lessons (ON HOLD until the owner lifts the school-only priority).
- Final phase: search, progress tracking, polish (the owner may want parts of this for the school level first).

## Open items
- **Directions discussed** (the owner chose A, scoped to Grade 6-7 foundations; the rest are still open, Grade 8 is paused). Coverage of the 185 benchmarks by band: Grade 6 2 of 34 (no course lessons), Grade 7 8 of 35, Grade 8 30 of 38, Grades 9-11 16 of 78. Biggest gaps: Grade 6 Number Relationships 0 of 11 and Equivalence 0 of 6; Grade 7 Number Relationships 0 of 7 and Equivalence 0 of 5; HS Geometry 1 of 16, HS Number Relationships 1 of 12, HS Data Sciences 2 of 15. Candidates: (A) Grade 6-7 ratios and proportional reasoning, the on-ramp to Grade 8 slope and proportionality, which also fills the empty Grade 6 course (recommended first); (B) high-school Geometry (transformations, congruence, triangles, circles, volume); (C) Algebra 1 batches 4 and 5, already planned (nine lessons); (D) statistics and data lessons across bands; (E) housekeeping: get PR #5 reviewed and merged, host the site at its own address, split the single `index.html` as it grows (633 KB at 23 lessons, each lesson 30 to 55 KB, so about 30 more lessons would pass 2 MB), or a class-wide teacher view (needs a backend). Method that worked for batches 1 and 2: parallel builders (one per lesson) following a shared brief and testing in a scratch copy, then integration, tests, an independent tag audit, and screenshots here. Other options: lift the school-only priority; fill Algebra 2.
- **Hosting:** the artifact viewer cannot give a page its own address, so copy-link buttons there copy only the end of the link. Putting the site on its own address (for example GitHub Pages) makes share links, printing and a future class view work properly. The owner's call; not done.
- **Batch 1 tags were audited independently** (no unsupported tags, no math errors; see ARCHITECTURE.md section 5 for the rule that a tag means "addresses a substantial part"). Optional lesson improvements from the audit, not done because they change lesson content: let students build a function or plot their own points (8.3.7.4, 8.1.1.2 are partial); add an x-intercept or "solve for x" prediction to the scatter lesson (8.1.1.4); add a division question and a standard-form-to-scientific-notation question to the exponents checks (both checks test multiplication only); reword "You can translate in any direction" in the function lesson (the interactive only goes from the equation outward).
- **Batch 2 tags were audited independently** (no math errors, every planned tag kept). Added 8.3.7.6 to forms-of-a-linear-equation and 9.3.5.7 to solving-equations-with-a-balance. **9.3.5.7 is a judgment call** (the audit said moderate: step 4 and Formulas mode are exactly this benchmark, but no check question covers it, and 8.3.6.3 already names it at grade level; it adds "Grades 9-11" to that lesson's grade filter, as 9.3.7.10 does for what-is-a-function): drop it from `ALIGN` for strictly on-grade tags. 8.3.6.1 is moderate (commutative and associative are listed but never exercised). Optional lesson improvements, not done: use commutative or associative in the balance lesson; add a check on formula rearrangement; fix the skipped point (4, 10) in the Forms proportional view for y = 2x + 2; let Distance handles be moved with the keyboard.
- **Review the v0.9 judgment calls** (course placement, skill levels, benchmark tags) and say what to change; each is one line in `ALIGN`. Consider a two-tier "direct / partial" marker on tags if a stricter mapping is wanted.
- **Lesson-content observations from the tag review (not changed, lesson content is the owner's call):** the Functions-as-transformations squeeze step uses sin x (a Precalculus function) in an Algebra 1 lesson; the Pythagorean lesson has no check on the converse or on coordinate distance (8.2.3.1 and 8.2.3.3 are partial); the Slope lesson never says "similar triangles" or mentions the x-intercept (8.2.4.1 and 8.3.7.6 are partial); the "Builds on" links Mean-median to Slope, Similarity to Pythagorean theorem and Inscribed angles to Area of a circle look weak.
- The home hero still links to the undergraduate "Start with linear maps"; consider pointing it at a school lesson.
- Cross-links can only point at lessons that exist or are in `PLANNED`. Curriculum lessons such as Central limit theorem and Bayes' theorem are not in `PLANNED` (it lists only 4 upper-level titles per level), so they cannot be linked until the owner lifts the hold.
- The artifact's static title is "Continuum: mathematics you can move"; a plain "Continuum" would match the page-naming guidance. Not changed without the owner's say-so.
- If the 2022 standards change (they take full effect 2027-28), the owner supplies the new PDF and the catalog is re-extracted; the build then flags any lesson tag whose code no longer exists.
