# Continuum: Context Window

**Version:** v11
**Last updated:** 2026-09-30

## ⚠️ Current priority: middle & high school ONLY
Instructions for any AI working on this project (including in a new chat):
- Work only on **middle & high school** lessons until the owner explicitly says otherwise.
- Do **not** build, draft, prototype, or code any undergraduate or graduate lessons, even if they appear in the curriculum or roadmap below. They are listed for planning only.
- Engine and lesson-format work (Phase 2) is allowed, since the school lessons need it. When retrofitting the existing undergraduate and graduate lessons to the new format, change only what the engine update requires; do not extend them (this includes their "planned" lists).
- If a request is ambiguous about level, assume middle & high school and ask before touching upper-level content.

## Project
Continuum, a 3Blue1Brown-style interactive math visualization website covering three levels: middle & high school, undergraduate, and graduate.

## Artifact
https://claude.ai/artifact/GKZsE5yY5QkwNiqJh8AFJV (republished 2026-09-30 from ARCHITECTURE v0.6; publish a copy of `index.html` without its `<!doctype>/<html>/<head>/<body>` wrappers, since the publish step adds them)

## Tech
- Single self-contained `index.html`, now **generated** from `src/` by `node tools/build.js` (edit `src/`, rebuild, commit both)
- Plain JavaScript and Canvas 2D; MathJax 3 (SVG output) for equations
- Fonts: Sora (display), Hanken Grotesk (body and UI), STIX Two italic (canvas math symbols only)
- Look: precision instruments (midnight ink / cool paper, brass accent, hairlines, slim geometric display type)

## Engine
- `Plane`, `Controls`, `tween`/`animateTo`, `draggable`, hash router, `register()` contract
- Lesson format (new in v0.5): `hook`, `steps` (guided, drive the canvas via the scene's `apply`), `formal`, `check`, `links`; all optional, legacy `explain` still works. Details in `ARCHITECTURE.md` section 4.

## Project files
- `index.html`: the website (generated)
- `src/`, `tools/build.js`: sources and build script
- `ARCHITECTURE.md`: structure, contracts, design system, change log
- `CONTEXT.md`: this file

## Progress
- **Done:** Phase 1 (shell, engine, 3 visualizations); UI redesign and type updates (ARCHITECTURE v0.2 to v0.4)
- **Done:** Phase 2 (v0.5): source split + build script; lesson-format engine; Pythagorean theorem retrofitted as the reference school lesson
- **Done:** Phase 3 (v0.6): first four school lessons, all in the full lesson format: Slope and linear functions; Systems of equations; Quadratics and the parabola; The unit circle and trig waves
- **Built lessons (5 school):** the four above plus Pythagorean theorem. Undergrad (Linear transformations) and grad (Conformal maps) remain legacy format, untouched.
- **Next:** Phase 4, four more school lessons. Suggested: Functions as transformations; Exponential growth; Area of a circle; Similarity and scaling (owner to confirm). Then Phase 5: Inscribed angles; Mean, median, and spread; Probability with repeated trials; Pascal's triangle and the Galton board.

## Standing rules
1. Update the context window every turn and provide it (kept in `CONTEXT.md`).
2. Update `ARCHITECTURE.md` whenever a feature is added, a bug is fixed, or the architecture changes.
3. Flag tasks that may exceed tool limits before starting and propose smaller chunks.

## Curriculum (DRAFT, awaiting approval; school level is the active priority)
42 lessons total (7 built, 35 new). ✓ = built.

**Middle & high school (13)**
- Algebra & functions: Slope and linear functions ✓; Systems of equations ✓; Functions as transformations; Quadratics and the parabola ✓; Exponential growth
- Geometry & trig: Pythagorean theorem ✓; Area of a circle; Similarity and scaling; Inscribed angles; Unit circle and trig waves ✓
- Probability & data: Mean, median, and spread; Probability with repeated trials; Pascal's triangle and the Galton board

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
Hook question → interactive canvas → guided "Try this" steps that drive the canvas → the formal math → quick check (1–2 multiple-choice questions) → connections (builds on / leads to / related).

## Roadmap
- Phase 2: done (engine + split). Upper-level retrofit only if the engine ever requires it.
- Phase 3: done (4 lessons). Phases 4–5: remaining 8 middle & high school lessons, ~4 per phase (current priority)
- Phases 6+: undergraduate and graduate lessons (ON HOLD)
- Final phase: search, progress tracking, polish

## Open items
- Confirm the order of the Phase 4 batch.
- Approve or edit the draft curriculum.
- Note: the home hero still links to the undergraduate "Start with linear maps"; consider pointing it at a school lesson.
- Note: `CONTEXT.md` had been deleted in the repo's last commit; restored here because standing rule 1 keeps it in the repo.
