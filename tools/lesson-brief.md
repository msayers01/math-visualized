# Brief: writing one Continuum lesson

You are writing ONE new interactive lesson for Continuum, a 3Blue1Brown-style math visualization site (plain JavaScript, Canvas 2D, MathJax for TeX). Repo: <repo>. Read `ARCHITECTURE.md` sections 4 (lesson contract), 5 (curriculum) and 6 (shared engine) first, then study these finished lessons as models of voice, structure and code: `src/lessons/school/slope-and-linear-functions.js` (draggable handles, guided steps with `set` patches), `src/lessons/school/mean-median-and-spread.js` (data on a number line), `src/lessons/school/exponential-growth.js` (custom axes via `p.span/cx/cy`, block-scoped helpers), `src/lessons/school/the-unit-circle-and-trig-waves.js` (two stacked panes).

## Audience (Grade 6 and 7 foundations batch)
This batch is for students aged 11 to 13 working ALONE and for teachers who assign the lesson, so: (a) the lesson must teach by itself, with feedback that explains why in plain words after every choice or placement (never only right/wrong); (b) short sentences, concrete contexts (food, money, speed, sports, maps), one new idea per step, no unexplained notation; the `formal` section may be a little more precise but stays readable at this age; (c) the two `check` questions are printed as a paper exit ticket, so each must be fully self-contained: state every number, and describe any figure or table in the question text itself. Never write "on the canvas", "above" or "the graph you made"; (d) do not assume the student has seen MathJax-only notation beyond fractions, equals and simple symbols.

## What you deliver
Exactly ONE file, written to the STAGING folder: `<scratchpad>/staging/<id>.js` (id is given in your assignment). Do NOT write or edit ANY file inside <repo> (read it freely, but never write there: not your lesson, not the manifest, not `src/curriculum/*`, not `index.html`, not docs). The lead copies your staged file into the repo. Develop and test your file in your scratch copy (below), and copy the finished file to the staging path last. Do not run git commands that change anything. Do not commit.

## Make the student DO the mathematics
An independent audit of the previous batch found that the weakest coverage was where the student only watched. Wherever the benchmark says construct, represent, find, solve or justify, give the student a way to do it on the canvas (choose the operation, place the point, set the slope, type nothing but click or drag) and have the lesson respond with feedback that explains why, not just right or wrong.

## Lesson format (all parts required)
`register({ id, level: 'school', title, blurb, thumb(c, p){...}, hook, steps: [4 x {title, text, set}], formal, check: [2 x {q, choices, answer, why, hint}], links: {prereq, next, related}, mount({stage, controls}) {...} })`.
- `hook`: one question that makes a student want to know. `blurb`: one sentence for the home list.
- 4 guided steps. Each `set` is a state patch passed to the scene's `apply(patch, immediate)`; numeric fields are animated with `animateTo`, non-numeric flags (strings, booleans, arrays) must be split off in `apply` and applied directly (see `functions-as-transformations.js`). Steps must visibly change the canvas and the text must match the readouts exactly (check the numbers!).
- `formal`: the math, with `<h3>` subsections, TeX in `String.raw` template literals (`\(...\)` inline, `\[...\]` display). Inside TeX write `\$` for a dollar sign. Plain `$` is fine in plain text.
- `check`: exactly 2 multiple-choice questions with a `why` and a `hint`. Make distractors reflect real misconceptions. Exactly one correct answer; vary the position of the right answer.
- `links`: ids of existing lessons only (`slope-and-linear-functions`, `systems-of-equations`, `forms-of-a-linear-equation`, `solving-equations-with-a-balance`, `what-is-a-function`, `scatter-plots-and-lines-of-fit`, `distance-and-the-pythagorean-theorem`, `parallel-and-perpendicular-lines`, `square-roots-and-irrational-numbers`, `exponents-and-scientific-notation`, `functions-as-transformations`, `quadratics-and-the-parabola`, `exponential-growth`, `pythagorean-theorem`, `area-of-a-circle`, `similarity-and-scaling`, `inscribed-angles`, `the-unit-circle-and-trig-waves`, `mean-median-and-spread`, `probability-with-repeated-trials`, `pascals-triangle-and-the-galton-board`, plus the other new lessons named in your assignment). Use `related` freely. Use `prereq`/`next` only as your assignment says, because the build fails if "builds on" and "leads to" links disagree with the course order.
- `thumb(c, p)`: a small static drawing for the home list (set `p.cx, p.cy, p.span`, use `p.pal` colors).

## Engine you can use (all globals, no imports)
`h(tag, attrs, ...kids)`, `clamp, lerp, ease, snap, tween, animateTo, fmt, num, linEq, TAU, alpha, near, draggable, reduceMotion`. `new Plane(host, {cx, cy, span})` with `grid, ticks, path, curve, arrow, dot, label, fit, X, Y, toMath, bounds, draw, requestDraw, destroy` and `onDraw = (ctx, p) => {...}` (use `p.pal.blue|yellow|green|red|violet|text|muted|stage|grid|grid-strong|brass`). Controls: `C.title, C.hint, C.slider({label,min,max,step,value,format,onInput}) -> {set,get}, C.buttons([...]), C.select, C.toggle, C.readout()`. `mount` returns `{destroy, apply}`. Two-pane lessons use `stage.classList.add('split')` and two `.pane` hosts.
Color meaning: blue = main lines/curves, yellow = areas/special points, green = first direction, red = second direction, violet = special structure. Brass is for UI only (handle rings), never for math objects.

## Rules and pitfalls (each one has bitten this codebase)
1. Everything is concatenated into ONE script. A top-level `const/let/function` name that exists anywhere else breaks the whole site. Wrap ALL your helpers/constants in a block `{ ... }` around the `register` call (as `exponential-growth.js` does), and put nothing else at top level.
2. Default state must not have overlapping drag handles; snap dragged values (`snap(v, step)`) so readouts stay clean numbers. Handles need a sensible hit order (`hit` returns the most specific one).
3. Step `set` patches: numeric only unless `apply` splits flags off. Animated angles must not wrap through 0/360. Integer parameters (counts) are applied instantly, not animated.
4. Respect `reduceMotion` (use `tween`/`animateTo`, which already do). No autoplay loops; pointer drags and buttons only (a Play button is fine).
5. It must work at 390px wide (panel stacks under the canvas) and in light and dark themes. No horizontal page scroll. Canvas text must stay readable and not collide: use `p.fit()` or a normalized plot area and `clamp(p.scale * k, min, max)` for font sizes.
6. TeX in step text and formal must be correct and balanced. MathJax is NOT loaded in the sandbox, so TeX shows raw there; proofread it carefully by reading it.
7. TeX lives inside HTML strings: a "<" directly before a letter or "/" inside `\( ... \)` or `\[ ... \]` starts an HTML tag and swallows the text after it (a real bug in this codebase). Write `&lt;` there (for example `\(0&lt;b&lt;1\)`); "< " with a space or "<5" is fine. The build fails on this.
8. Be mathematically careful. Every number in a step's text must equal what the readout shows in that state. Do not claim more than the lesson demonstrates.
9. Match the voice of the existing lessons: short sentences, second person, no hype, no em-dash asides, explain WHY.

## How to test (do this, it is not optional)
Work in a scratch copy so you never touch the real repo files:
```
S=<scratchpad>/lesson-<id>; rm -rf $S; mkdir -p $S
git -C <repo> archive HEAD | tar -x -C $S
# write and edit your lesson at $S/src/lessons/school/<id>.js
```
In the scratch copy: add `"lessons/school/<id>.js"` to `src/manifest.json` (anywhere in the lessons list) and add an entry to `ALIGN` in `src/curriculum/curriculum.js`, `{ id: '<id>', course: 'grade8', skill: 'mid', standards: [] }` (any valid course/skill is fine for testing). Then `cd $S && node tools/build.js`. Open `$S/index.html` with headless Chromium via Playwright (`require('/opt/node-tools/node_modules/playwright')`, `chromium.launch()`, abort every non-`file:` request with `page.route`, listen for `pageerror` and console errors). Go to `file://$S/index.html#/viz/<id>`.
Test: step through all 4 steps and compare every readout number with the step text; drag every handle (use `page.mouse` on the canvas); use every slider, button and toggle; confirm snapping; take screenshots at 1280x900 light, 1280x900 dark (set `document.documentElement.dataset.theme='dark'` then dispatch `themechange`), and 390x844 mobile, and LOOK at them with the Read tool (check overlaps, clipped labels, unreadable text, empty areas); confirm there are no `pageerror`s and `document.documentElement.scrollWidth <= innerWidth` on mobile. Also open the home page and check your thumbnail renders. Fix what you find and re-test. Remember hrefs are `#/viz/<id>` (`#/viz/` is 6 characters).

## Your final report (keep it under 400 words)
1. The file path and a 2-line description of the interactive.
2. For EACH benchmark in your assignment: which part of the benchmark's wording the lesson really covers (step, interactive, formal, or check) and which parts it does NOT. Be honest and specific; this decides how the lesson is tagged.
3. Skill level you recommend (introductory / intermediate / advanced) and why; and any `prereq` / `next` links you used.
4. Anything you could not verify or are unsure about.
