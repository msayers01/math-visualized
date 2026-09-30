# Continuum: Context Window

**Version:** v8
**Last updated:** 2026-09-30

## ⚠️ Current priority: middle & high school ONLY
Instructions for any AI working on this project (including in a new chat):
- Work only on **middle & high school** lessons until the owner explicitly says otherwise.
- Do **not** build, draft, prototype, or code any undergraduate or graduate lessons, even if they appear in the curriculum or roadmap below. They are listed for planning only.
- Engine and lesson-format work (Phase 2) is allowed, since the school lessons need it. When retrofitting the existing undergraduate and graduate lessons to the new format, change only what the engine update requires; do not extend them.
- If a request is ambiguous about level, assume middle & high school and ask before touching upper-level content.

## Project
Continuum, a 3Blue1Brown-style interactive math visualization website covering three levels: middle & high school, undergraduate, and graduate.

## Artifact
https://claude.ai/artifact/GKZsE5yY5QkwNiqJh8AFJV

## Tech
- Single self-contained HTML file (`index.html`) with plain JavaScript and Canvas 2D
- MathJax 3 (SVG output) for equations
- Fonts: Sora (display, light weights), Hanken Grotesk (body and UI), STIX Two italic (canvas math symbols only)
- Look: precision instruments, modern and sleek (midnight ink / cool paper, brass accent, hairlines, slim geometric display type)

## Engine
- `Plane`: math-coordinate canvas with drawing primitives
- `Controls`: side-panel builder (sliders, buttons, selects, toggles, readouts)
- `tween`, `draggable`, hash router
- `register()` contract for adding topics (optional `thumb` preview)

## Project files
- `index.html`: the website
- `ARCHITECTURE.md`: structure, contracts, design system, change log
- `CONTEXT.md`: this file

## Progress
- **Done:** Phase 1 (shell, engine, 3 visualizations)
- **Done:** UI redesign (ARCHITECTURE.md v0.2): new type and palette, hero with live matrix readout, level numerals, topic thumbnails, breadcrumbs, pager, custom controls
- **Done:** Type update (ARCHITECTURE.md v0.3): Unbounded + Hanken Grotesk, level numbers 01/02/03
- **Done:** Sleeker type (ARCHITECTURE.md v0.4): display face now Sora
  - The Pythagorean theorem (school)
  - Linear transformations and eigenvectors (undergrad)
  - Conformal maps of the complex plane (grad)
- **Now:** Planning the full curriculum (no code this turn)
- **Next:** Approve curriculum, lesson format, and roadmap; then Phase 2 (lesson engine + source split), then school lessons

## Standing rules
1. Update the context window every turn and provide it (now kept in `CONTEXT.md`).
2. Update `ARCHITECTURE.md` whenever a feature is added, a bug is fixed, or the architecture changes.
3. Flag tasks that may exceed tool limits before starting and propose smaller chunks.

## Curriculum (DRAFT, awaiting approval; school level is the active priority)
42 lessons total (3 built, 39 new). ✓ = built.

**Middle & high school (13)**
- Algebra & functions: Slope and linear functions; Systems of equations; Functions as transformations; Quadratics and the parabola; Exponential growth
- Geometry & trig: Pythagorean theorem ✓; Area of a circle; Similarity and scaling; Inscribed angles; Unit circle and trig waves
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

## Proposed lesson format (DRAFT)
Hook question → interactive canvas → guided "try this" steps that drive the canvas → the formal math → quick check (1–2 questions) → prerequisite/next links across levels.

## Proposed roadmap (DRAFT, replaces old Phases 2–5)
- Phase 2: Lesson-format engine (guided steps, quick checks, cross-links) + split source into per-lesson files with a small build script; retrofit the 3 existing lessons
- Phases 3–5: middle & high school lessons, ~4 per phase (the current priority; 12 new lessons)
- Phases 6+: undergraduate and graduate lessons (ON HOLD until the owner lifts the school-only priority)
- Final phase: search, progress tracking, polish

## Open items
- Approve or edit the draft curriculum, lesson format, and roadmap.
