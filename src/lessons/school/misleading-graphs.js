/* =====================================================================
   SCHOOL — Misleading graphs
   ===================================================================== */
{
  /* ---------- small helpers (all block scoped) ---------- */
  const R2 = v => String(+v.toFixed(2));
  const R3 = v => String(+v.toFixed(3));
  const tm = v => R2(v) + (+R2(v) === 1 ? ' time' : ' times');
  const sgnPct = v => (v < 0 ? '−' : '+') + String(Math.abs(Math.round(v * 1000) / 10)) + '%';
  const kk = t => `<span class="k">${t}</span>`;
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const fbHtml = (title, body) => `<span class="k">${title}</span><br>${body}`;

  /* ---------- invented data ---------- */
  const BAR = { a: 60, b: 75, top: 80, tick: 10, src: 'Source: made-up tally from one school cafeteria, 20 school days.' };
  const VIS = [50, 54, 60, 66, 70, 72, 68, 62, 56, 52, 50, 52];     /* museum visitors per day, months 1 to 12 */
  const LINE_SRC = 'Source: made-up counts from one small museum, monthly averages for one year.';
  const AREA_SRC = 'Source: made-up count from one school club, 2 weeks.';
  const CHESS = [22, 24, 26, 28, 30, 32], RAIN = [120, 110, 100, 90, 80, 70];
  const DUAL_SRC = 'Source: made-up club and weather records, 6 months.';
  const FIX_W = [1, 2, 3, 5, 6, 7], FIX_V = [90, 88, 80, 82, 84, 86];     /* salads per day, week 4 was not recorded */
  const FIX_SRC = 'Source: made-up tally by one school cafeteria, weekly averages of 5 school days each.';
  const SHAPE_WORD = ['', 'wide and flat', 'medium', 'tall', 'very tall'];

  const tiltWord = a => {
    const m = Math.abs(a), d = a >= 0 ? 'rising' : 'falling';
    return m < 6 ? 'about flat' : m < 20 ? 'gently ' + d : 'steeply ' + d;
  };
  const crossText = M => {
    const out = [];
    for (let i = 0; i < 5; i++) {
      const d0 = CHESS[i] / 40 - RAIN[i] / M, d1 = CHESS[i + 1] / 40 - RAIN[i + 1] / M;
      if (d0 * d1 < 0) out.push(`between month ${i + 1} and month ${i + 2}`);
    }
    return out.length ? 'The lines cross ' + out.join(' and ') + '.' : 'The lines never cross.';
  };

  /* ---------- predictions (guess, then see) ---------- */
  const PRED = {
    bar: { q: 'Menu A sells 60 lunches a day and Menu B sells 75. Now the vertical axis will start at 50, not 0. How many times as tall will Menu B\'s bar look, compared with Menu A\'s?',
      ch: ['About 1.25 times, the same as the true ratio', 'About 2.5 times', 'About 5 times'], ans: 1,
      fb: ['Not quite. 1.25 is the true ratio, 75 ÷ 60. But with the axis starting at 50, the bars show only the part above 50: heights 10 and 25.',
           'Yes. The visible heights are 60 − 50 = 10 and 75 − 50 = 25, and 25 ÷ 10 = 2.5. The true ratio is only 1.25.',
           'Too big, though you are right that the picture grows. The bars show 10 and 25, so the ratio is 2.5, not 5.'] },
    line: { q: 'The museum record has 12 months. It starts at 50 visitors a day and ends at 52. Suppose we show only months 1 to 6. How will the line look?',
      ch: ['About flat', 'Rising', 'Falling'], ans: 1,
      fb: ['Not for these months. Months 1 to 6 go from 50 up to 72, so the line climbs. The whole year, 50 to 52, is the flat one.',
           'Yes. Months 1 to 6 go from 50 to 72, up 44%. The whole year goes from 50 to 52, up only 4%. Now move the window to make the line fall.',
           'No. Months 1 to 6 are the climb to the summer peak (50 to 72). Try months 6 to 10 to find a fall.'] },
    area: { q: 'Week 2 has 2 times as many pizza slices as Week 1. A designer draws Week 2\'s circle with twice the width and twice the height. How many times as much area does it have?',
      ch: ['2 times', '3 times', '4 times'], ans: 2,
      fb: ['It feels right, because the width doubled. But area uses width and height together: 2 × 2 = 4.',
           'People often pick 3 as "more than 2 but not too much". Doubling both width and height multiplies the area by 2 × 2 = 4 exactly.',
           'Yes. Width doubles and height doubles, so area grows 2 × 2 = 4 times. The value only doubled, so the picture shows 4 where it should show 2.'] },
    dual: { q: 'Chess club members rise every month. Rainfall falls every month. Both lines share one picture, each with its own vertical axis. If you change only the top number on the right axis (rainfall), what happens?',
      ch: ['Nothing changes: the data decide where the lines cross', 'The rainfall line moves, so the crossing moves, though no data changed', 'The rainfall numbers in the table change'], ans: 1,
      fb: ['The data decide the values, but not where the two lines meet in the picture. Each axis has its own scale, so the crossing depends on the scale.',
           'Yes. The right axis only stretches the picture of the rainfall line. Move the top of the axis and watch the crossing move, or vanish.',
           'No. The numbers never change (they are listed in the panel). Only the picture of them changes.'] }
  };

  /* ---------- practice problems (fixed) ---------- */
  const PR = [
    { t: 'bar', title: 'Points per game (made up)', labels: ['Team X', 'Team Y'], vals: [40, 50], start: 30, top: 60, tick: 10, src: 'Source: made-up scores from 10 games of one school team.',
      q: 'The vertical axis starts at 30. How many times as tall does Team Y\'s bar look, compared with Team X\'s bar?',
      ch: ['1.25 times as tall', '2 times as tall', '5 times as tall', '10 times as tall'], ans: 1,
      fb: ['1.25 is the true ratio, 50 ÷ 40. The picture does not show it, because the axis starts at 30. The picture shows the heights above 30: 10 and 20.',
           'The visible heights are 40 − 30 = 10 and 50 − 30 = 20, so Y looks 20 ÷ 10 = 2 times as tall. The true ratio is only 1.25, so the cut axis exaggerates.',
           '5 mixes a value (50) with a visible height (10). Compare height with height: 20 ÷ 10.',
           '10 is only the height of X\'s bar. Divide Y\'s visible height, 20, by X\'s, 10.'] },
    { t: 'win', title: 'Bike rides per day on a path (made up)', ys: [30, 32, 36, 42, 46, 48, 44, 38, 34, 30, 28, 30], a: 6, b: 9, y0: 20, y1: 50, tick: 10, src: 'Source: made-up counts from one bike path, monthly averages for one year.',
      q: 'A page shows only months 6 to 9 (the solid blue part), where the line falls from 48 to 34. The full record is 30 rides in month 1 and 30 rides in month 12. Which headline is fair for the whole year?',
      ch: ['Bike rides fell 29% this year', 'Bike rides rose 60% this year', 'Nobody can say anything about the year', 'Rides rose in spring, fell after summer and ended the year where they began, at 30'], ans: 3,
      fb: ['That uses only months 6 to 9, the window the page chose. 48 down to 34 is a fall of 14, and 14 ÷ 48 is about 29%. Over the whole year, rides did not fall.',
           'That uses only months 1 to 6, another chosen window (30 up to 48 is +60%). Over the whole year the line ends where it began.',
           'You can say plenty. A trend needs the whole range, and the whole range has a clear story: up, down, and back to 30.',
           'Right. Both ends of the year are 30, so there was no yearly rise or fall. The rise and fall are the seasons. Any short window can be picked to tell a different story.'] },
    { t: 'circ', title: 'Pizzas eaten (made up)', src: 'Source: made-up count from one school club.',
      q: 'To show a value 3 times as big, a circle\'s AREA should be 3 times as big. About how many times as wide should the circle be?',
      ch: ['3 times as wide', '9 times as wide', 'About 1.7 times as wide', 'About 1.5 times as wide'], ans: 2,
      fb: ['3 times as wide gives an area of 3 × 3 = 9 times the original. That is too much.',
           '9 is the area you would get from 3 times as wide. It is not the width you need.',
           'Area = width × width, so we need width × width = 3. The square root of 3 is about 1.7, and 1.7 × 1.7 = 2.89, close to 3.',
           '1.5 × 1.5 = 2.25, so the area would be only about 2.25 times as big, not 3.'] },
    { t: 'dual', M: 160, title: 'Chess members and rainfall (made up)', src: DUAL_SRC,
      q: 'The picture has two vertical axes: left, club members from 0 to 40; right, rainfall from 0 to 160 mm. The lines cross between month 2 and month 3. A student says: "At the crossing, rain and club membership were equal." What is the best reply?',
      ch: ['No. Each line has its own axis, so a crossing says nothing about the numbers. Change the right axis and the crossing moves', 'Yes. Where two lines cross, the two numbers are equal', 'Yes, but only if both lines have the same color', 'No. Two lines can never cross on a graph'], ans: 0,
      fb: ['Right. The crossing comes from the two scales, not from the data. At month 2 there are 24 members and 110 mm of rain, which are different things in different units.',
           'Not here. At month 2 the numbers are 24 members and 110 mm of rain. Different units, so they cannot be equal. The lines only meet because of the scales.',
           'Color does not matter. The crossing depends on where each axis starts and stops.',
           'Lines can cross. On a two-axis graph the crossing just has no meaning.'] },
    { t: 'shape', title: 'Bike rides per day, 6 weeks (made up)', src: 'Source: made-up counts from one school bike rack.',
      q: 'Both graphs show the same six numbers, from 20 to 30 rides a day. A student says: "Graph B shows faster growth." Which statement is true?',
      ch: ['Graph B shows faster growth, because its line is steeper', 'Both graphs show the same growth: 20 to 30, which is 50% more. Only the shape of the box differs', 'Graph A is dishonest, because its line is nearly flat', 'Graph B shows 4 times the growth, because its box is 4 times as tall for its width'], ans: 1,
      fb: ['The line is steeper, but only because the box was drawn taller and narrower. The numbers did not change.',
           'Right. 30 − 20 = 10, and 10 ÷ 20 = 50%, in both graphs. Reshaping the box changes the tilt, not the data. Compare the numbers on the axis.',
           'Graph A is not wrong: it shows the same numbers. Its box is just wide. Neither shape is "the true one", but changing the shape changes the impression.',
           'The box is 4 times as tall for its width, but the growth is still 20 to 30. A tall box stretches the picture, not the data.'] },
    { t: 'int', title: 'Books borrowed per month (made up)', src: 'Source: made-up log from one school library.',
      q: 'The line looks like steady growth. The labels under the line are Year 1, Year 2, Year 3 and Year 8, evenly spaced. The values are 10, 12, 14 and 16. Which checklist item fails, and what is hidden?',
      ch: ['Axis starts at zero: the vertical axis must start at 0', 'Whole time range: the graph should show more years', 'Equal intervals: the last step is 5 years, not 1, so growth really slowed from 2 per year to 0.4 per year', 'Source stated: the graph must name its source'], ans: 2,
      fb: ['The vertical axis does start at 0 in this graph. The problem is on the horizontal axis.',
           'The graph shows Year 1 to Year 8. The trouble is how the years are spaced, not how many are shown.',
           'Right. Years 1, 2, 3 are 1 year apart, but 3 to 8 is 5 years apart. From 14 to 16 in 5 years is 2 ÷ 5 = 0.4 per year, so growth slowed. Equal spacing hides that.',
           'This graph does state a made-up source at the bottom. The problem is the spacing of the years.'] },
    { t: 'bar', title: 'Members (made up)', labels: ['Gym A', 'Gym B'], vals: [80, 100], start: 60, top: 100, tick: 10, src: 'Source: made-up member counts from two small gyms.',
      q: 'Gym A has 80 members and Gym B has 100. The axis starts at 60. By what percent does Gym B truly have more members than Gym A?',
      ch: ['25% more', '100% more', '20% more', '50% more'], ans: 0,
      fb: ['Right. The true difference is 100 − 80 = 20, and 20 ÷ 80 = 0.25, so 25% more. The bars have visible heights 20 and 40, which looks like 100% more, but the cut axis made that up.',
           'That is what the bars show: visible heights 20 and 40, so B looks 100% taller. Percent more must use the real values, 80 and 100.',
           '20 is the difference in members, not a percent. Divide it by A\'s 80: 20 ÷ 80 = 25%.',
           'Percent more is (100 − 80) ÷ 80 = 25%, not 50%.'] }
  ];

  /* ---------- the lesson ---------- */
  register({
    id: 'misleading-graphs', level: 'school',
    title: 'Misleading graphs',
    blurb: 'Cut an axis, stretch a scale, pick a time window or double a circle, and watch the same data tell a different story. Then fix it.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 5; p.cy = 3.6; p.span = 4.7;
      p.path([[0, 0], [10, 0]], { stroke: pal['grid-strong'], width: 1.6 });
      p.path([[0, 0], [0, 7.4]], { stroke: pal['grid-strong'], width: 1.6 });
      p.path([[1.4, 0], [1.4, 2.1], [4, 2.1], [4, 0]], { fill: alpha(pal.blue, .85), close: true });
      p.path([[5.6, 0], [5.6, 5.9], [8.2, 5.9], [8.2, 0]], { fill: alpha(pal.blue, .85), close: true });
      p.path([[0.3, 1.1], [1.1, 1.6], [2, .6], [3, 1.6], [4, .6], [5, 1.6], [6, .6], [7, 1.6], [8, .6], [9, 1.3]], { stroke: pal.red, width: 2.6 });
      p.label('?', 9, 6.6, { size: 24, color: pal.yellow });
    },
    hook: 'Two lunch menus sell 60 and 75 a day. Can you draw a chart that makes Menu B look more than twice as good without changing a single number?',
    steps: [
      { title: 'Cut the axis',
        text: String.raw`<p>A bar stands for its whole value, counted from zero. Menu A sells \(60\) lunches and Menu B sells \(75\), so B is \(75 \div 60 = 1.25\) times A.</p><p>Make a guess, then watch what a cut axis does to the bars. Afterwards, move the slider to try other starts.</p>`,
        set: { mode: 'bar', s: 0 } },
      { title: 'Choose the frame',
        text: String.raw`<p>A line graph can lie by what it leaves out. Guess how months \(1\) to \(6\) will look, then see.</p><p>Move the window to make the line fall. Then change the graph shape: the same change looks steeper in a tall box.</p>`,
        set: { mode: 'line', w0: 1, w1: 12, r: .6 } },
      { title: 'Size and two scales',
        text: String.raw`<p>Week 2 has twice the value of Week 1. A designer draws its circle twice as wide and twice as tall. Guess how many times as big the area is, then see.</p><p>Find the width that is honest. Then press <b>Two axes</b>: with two vertical scales, the picture can make unrelated lines cross.</p>`,
        set: { mode: 'area', k: 1 } },
      { title: 'Fix it',
        text: String.raw`<p>This graph has four problems. Use the controls until the checklist passes all four: the axis starts at zero, the whole record is shown, equal gaps mean equal time, and the source and sample are stated.</p><p>Then try the practice problems. The checklist helps with most of them.</p>`,
        set: { mode: 'fix', fs: 60, fwhole: 0, fspace: 0, fsrc: 0 } }
    ],
    formal: String.raw`
      <p>A graph is an argument made with a picture. Every number on it can be true and the picture can still mislead. Some graphs mislead on purpose and some by accident. The same short checklist catches both.</p>
      <h3>The checklist</h3>
      <ul>
        <li><b>Bars start at zero.</b> A bar's length stands for its whole value. A line graph shows change, so it may start higher, but then say so.</li>
        <li><b>Equal intervals.</b> Equal steps on an axis mean equal amounts, and each graph has one scale per axis. If two scales are needed, draw two graphs.</li>
        <li><b>The whole time range.</b> Say how far back the data go, and do not stop where the story is best.</li>
        <li><b>Area matches value.</b> If a picture grows in two directions, its area must match the value, not its width.</li>
        <li><b>Source and sample stated.</b> Who collected the numbers, how, and how many?</li>
      </ul>
      <h3>Why a cut axis exaggerates</h3>
      <p>Moving the bottom of the axis up to a value \(s\) removes the same length \(s\) from every bar. The difference between two bars stays the same, but each bar is shorter, so the bigger bar looks like a much bigger multiple. For bars of values \(a\) and \(b\):
      \[ \text{drawn ratio} = \frac{b-s}{a-s}, \qquad \text{true ratio} = \frac{b}{a}. \]
      <b>Worked example.</b> Take \(a=60\) and \(b=75\). With \(s=0\) the drawn ratio is \(75/60 = 1.25\). With \(s=40\) it is \(35/20 = 1.75\). With \(s=50\) it is \(25/10 = 2.5\). The true difference, \(15\), is the same in every picture. Percent more is always found from the real values: \((75-60)/60 = 25\%\), even when the bars look \(150\%\) taller.</p>
      <h3>Area, width and the square root</h3>
      <p>A circle with diameter \(d\) has area \(\pi d^2/4\). Doubling \(d\) multiplies the area by \(2^2 = 4\). To show a value that is \(q\) times as big with the area, multiply the width by \(\sqrt{q}\). For \(q=2\) that is \(\sqrt{2} \approx 1.41\), and \(1.41^2 \approx 2\). The same is true for any picture that grows in both directions.</p>
      <h3>Windows, shapes and tilt</h3>
      <p>The change between the first and last point of a window is
      \[ \frac{\text{last} - \text{first}}{\text{first}}. \]
      For months \(1\) to \(6\) it is \((72-50)/50 = 44\%\). For months \(6\) to \(10\) it is \((52-72)/72 \approx -28\%\). For the whole year it is \((52-50)/50 = 4\%\). A pattern that repeats, such as seasons, lets almost any short window rise or fall, so a trend needs the whole cycle or several cycles.</p>
      <p>The tilt you see depends on the shape of the box. If the box is \(r\) times as tall as it is wide, a change of \(\Delta y\) over a \(y\)-range of \(L\) is drawn with slope \(r \cdot \Delta y / L\) when the window fills the width. Making \(r\) four times larger makes the slope four times larger, with the same data. There is no one true shape, so keep the same shape for every graph you compare.</p>
      <h3>Two vertical axes</h3>
      <p>With two axes, each line is stretched by its own scale. Moving the top of one axis moves that line up or down without changing one number, so the two lines can be made to cross, touch or run together. The crossing is a fact about the scales, not about the data. Draw two graphs, one above the other, instead.</p>
      <h3>What this checklist does and does not do</h3>
      <p>The last item, source and sample, is only a reminder to ask. Judging whether a survey was fair, or whether a study was well designed, takes more than a checklist, for example how people were chosen. A spreadsheet or graphing tool can draw the same data with different axes, which is a quick way to test whether a picture is fragile: if a small change in the axis changes the story, be careful.</p>`,
    check: [
      { q: 'Why can it be misleading to start the vertical axis of a bar chart at 50 instead of 0?',
        choices: ['Because bars must all be the same color',
                  'Because a bar\'s length stands for its whole value from zero, so cutting the bottom makes small differences look big',
                  'Because the numbers on the axis become wrong',
                  'Because it makes every difference look smaller'], answer: 1,
        why: 'A bar is read by its length. If the bottom is cut, the same amount is removed from every bar, so the longer bar looks like a much bigger multiple of the shorter one. The numbers on the axis are still correct, and the difference is exaggerated, not shrunk.',
        hint: 'What do you compare when you look at two bars: their whole lengths or only the part you can see? Which way does the cut change the ratio?' },
      { q: 'A bar chart shows the average quiz scores of two classes: Class A scored 80 and Class B scored 90. The vertical axis starts at 70. How many times as tall does Class B\'s bar look as Class A\'s bar, and how much higher is Class B\'s score really?',
        choices: ['1.125 times as tall; really 12.5% higher',
                  '2 times as tall; really 100% higher',
                  '2 times as tall; really 12.5% higher',
                  '2 times as tall; really 10% higher'], answer: 2,
        why: 'The visible heights are 80 − 70 = 10 and 90 − 70 = 20, so B looks 20 ÷ 10 = 2 times as tall. The real scores differ by 90 − 80 = 10 points, and 10 ÷ 80 = 0.125, so B is 12.5% higher. 10 is a number of points, not a percent, and 100% is what the bars suggest, not the truth.',
        hint: 'Find the two visible heights first (value minus 70). For the real difference, divide by the real score of Class A.' },
      { q: 'A student sees a line graph of only months 9 to 12 of a year. The line rises from 52 to 60. The student says: "Every point on the graph is a real number, so the graph is honest, and profits rose this year." The full record, which the student has not seen, goes 62 in month 1, down to 52 in month 9, then up to 60 in month 12. What is wrong with the student\'s reasoning?',
        choices: ['Nothing is wrong: if every plotted number is real, a graph cannot mislead',
                  'The graph is wrong because every line graph must start at zero',
                  'The student should have averaged months 9 to 12 instead of looking at the line',
                  'True numbers can still mislead: months 1 to 8 are left out, and over the whole year profit went from 62 to 60, a small fall'], answer: 3,
        why: 'Choosing which part to show is a way to mislead with true numbers. The whole year goes from 62 to 60, which is a fall of 2 out of 62, about 3%. Line graphs do not have to start at zero, and averaging a short window does not fix the problem of leaving the rest out.',
        hint: 'Does the student know what happened in months 1 to 8? What does the whole year do, from first month to last?' }
    ],
    links: { related: ['statistical-questions-and-data-displays', 'correlation-and-causation', 'mean-median-and-spread', 'samples-and-populations', 'percent-change-and-money'] },

    mount({ stage, controls: C }) {
      const st = {
        mode: 'bar', s: 0, w0: 1, w1: 12, r: .6, k: 1, M: 120, split: false,
        fs: 60, fwhole: false, fspace: false, fsrc: false,
        pred: { bar: null, line: null, area: null, dual: null },
        pi: 0, pp: PR.map(() => ({ tried: [], solved: false, first: false }))
      };
      const P = new Plane(stage, { span: 5 });
      let cancel = null;

      /* ---------- drawing ---------- */
      let lay = null;   /* the line-mode layout of the last draw, used by dragging */
      const lineLayout = (p, hb, footH) => {
        const ml = clamp(p.w * .11, 40, 54), mr = 14, stripH = 40;
        const below = 56 + stripH + 8;
        const aw = p.w - ml - mr, ah = Math.max(70, p.h - hb - 18 - footH - below);
        const bw = clamp(Math.min(aw, ah / st.r), 90, aw), bh = bw * st.r;
        const box = { x0: ml, x1: ml + bw, y0: hb + 18, y1: hb + 18 + bh };
        const sy = box.y1 + 56;
        return { box, strip: { x0: ml, x1: p.w - mr, y0: sy, y1: sy + stripH } };
      };
      const stripX = (S, m) => S.x0 + (m - 1) / 11 * (S.x1 - S.x0);

      P.onDraw = (c, p) => {
        const pal = p.pal, fs = clamp(p.w / 33, 12, 15), W = p.w;
        const font = (px, bold) => `${bold ? 700 : 500} ${px}px "Hanken Grotesk","Helvetica Neue",Arial,sans-serif`;
        const mw = (s, px, bold) => { c.font = font(px, bold); return c.measureText(s).width; };
        const T = (s, x, y, o = {}) => {
          c.font = font(o.px || fs, o.bold); c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
          c.lineJoin = 'round'; c.lineWidth = 4; c.strokeStyle = pal.stage; c.strokeText(s, x, y);
          c.fillStyle = o.color || pal.text; c.fillText(s, x, y);
        };
        const seg = (x0, y0, x1, y1, col, w, dash) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.strokeStyle = col; c.lineWidth = w || 2; c.setLineDash(dash || []); c.lineCap = 'round'; c.stroke(); c.setLineDash([]); };
        const wrapLines = (s, px, maxW, bold) => {
          const out = []; let cur = '';
          s.split(' ').forEach(w => { const t = cur ? cur + ' ' + w : w; if (cur && mw(t, px, bold) > maxW) { out.push(cur); cur = w; } else cur = t; });
          if (cur) out.push(cur); return out;
        };
        const block = (s, x, y, o = {}) => {
          const px = o.px || fs, ls = wrapLines(s, px, o.maxW || W - x - 14, o.bold);
          ls.forEach((l, i) => T(l, x, y + i * (px + 5), { ...o, align: 'left' })); return y + ls.length * (px + 5);
        };
        /* header: the first entry is the bold title; returns the y where the plot may begin */
        const head = items => {
          let y = 22;
          items.forEach((it, i) => { y = block(it[0], 14, y, { color: it[1], bold: i === 0 || it[2], px: i === 0 ? fs + 1 : fs }); });
          return y + 2;
        };
        const foot = (s, col) => {
          const ls = wrapLines(s, fs, W - 28), n = ls.length, y0 = p.h - 8 - n * (fs + 5) + (fs + 5) / 2;
          ls.forEach((l, i) => T(l, 14, y0 + i * (fs + 5), { align: 'left', color: col || pal.muted }));
          return n * (fs + 5) + 12;
        };

        /* bar chart. items: [{slot,label,val}], nslots, gaps: [slot] */
        const bars = (R, o) => {
          const w = R.x1 - R.x0, h = R.y1 - R.y0, Y = v => R.y1 - (v - o.start) / (o.top - o.start) * h;
          c.lineWidth = 1; c.strokeStyle = pal.grid; c.beginPath();
          for (let v = Math.ceil(o.start / o.tick) * o.tick; v <= o.top + 1e-9; v += o.tick) { c.moveTo(R.x0, Y(v)); c.lineTo(R.x1, Y(v)); }
          c.stroke();
          for (let v = Math.ceil(o.start / o.tick) * o.tick; v <= o.top + 1e-9; v += o.tick) T(String(v), R.x0 - 8, Y(v), { align: 'right' });
          const sw = w / o.nslots, bw = Math.min(sw * .62, 74);
          (o.gaps || []).forEach(sl => { T('no data', R.x0 + (sl + .5) * sw, R.y1 - 14, { color: pal.muted, px: Math.max(12, fs - 1) }); });
          o.items.forEach(it => {
            const cx = R.x0 + (it.slot + .5) * sw, top = Y(it.val);
            c.fillStyle = alpha(pal.blue, .88); c.fillRect(cx - bw / 2, top, bw, R.y1 - top);
            T(String(it.val), cx, top - 12, { bold: true });
            T(it.label, cx, R.y1 + 18, { color: pal.muted });
          });
          seg(R.x0, R.y1, R.x1, R.y1, pal['grid-strong'], 2); seg(R.x0, R.y1, R.x0, R.y0, pal['grid-strong'], 2);
          if (o.start > 0) {
            c.beginPath(); c.moveTo(R.x0 - 8, R.y1 - 14); c.lineTo(R.x0 + 2, R.y1 - 10); c.lineTo(R.x0 - 8, R.y1 - 6); c.lineTo(R.x0 + 2, R.y1 - 2);
            c.strokeStyle = pal.red; c.lineWidth = 2.4; c.stroke();
            T('Axis starts at ' + o.start + ', not 0', R.x0, R.y1 + 40, { align: 'left', color: pal.red, bold: true });
          } else T('Axis starts at 0', R.x0, R.y1 + 40, { align: 'left', color: pal.green, bold: true });
          return Y;
        };

        /* line chart. pts: [[x,y]], dom: x0 x1 y0 y1 tick, xt: [[v,label]], hl: [xa, xb] to emphasize */
        const lineC = (R, o) => {
          const w = R.x1 - R.x0, h = R.y1 - R.y0, X = v => R.x0 + (v - o.x0) / (o.x1 - o.x0) * w, Y = v => R.y1 - (v - o.y0) / (o.y1 - o.y0) * h;
          c.lineWidth = 1; c.strokeStyle = pal.grid; c.beginPath();
          for (let v = o.y0; v <= o.y1 + 1e-9; v += o.tick) { c.moveTo(R.x0, Y(v)); c.lineTo(R.x1, Y(v)); }
          c.stroke();
          for (let v = o.y0; v <= o.y1 + 1e-9; v += o.tick) T(String(v), R.x0 - 8, Y(v), { align: 'right' });
          seg(R.x0, R.y1, R.x1, R.y1, pal['grid-strong'], 2); seg(R.x0, R.y1, R.x0, R.y0, pal['grid-strong'], 2);
          let lastX = -1e9; const need = 24, per = w / Math.max(1, o.xt.length), every = Math.max(1, Math.ceil(need / per));
          o.xt.forEach(([v, l], i) => { if ((i % every === 0 || i === o.xt.length - 1) && X(v) - lastX >= need) { lastX = X(v); seg(X(v), R.y1, X(v), R.y1 + 5, pal['grid-strong'], 1.5); T(l, X(v), R.y1 + 18, { color: pal.muted }); } });
          const poly = (pts, col, wd, dash) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(X(x), Y(y)) : c.moveTo(X(x), Y(y))); c.strokeStyle = col; c.lineWidth = wd; c.setLineDash(dash || []); c.lineJoin = 'round'; c.stroke(); c.setLineDash([]); };
          if (o.hl) {
            poly(o.pts, alpha(pal.muted, .8), 2, [5, 5]);
            const sub = o.pts.filter(q => q[0] >= o.hl[0] && q[0] <= o.hl[1]); poly(sub, pal.blue, 3.4);
            o.pts.forEach(([x, y]) => { const inn = x >= o.hl[0] && x <= o.hl[1]; c.beginPath(); c.arc(X(x), Y(y), inn ? 4.5 : 3.5, 0, Math.PI * 2); c.fillStyle = inn ? pal.blue : alpha(pal.muted, .9); c.fill(); });
          } else {
            poly(o.pts, pal.blue, 3.4);
            o.pts.forEach(([x, y]) => { c.beginPath(); c.arc(X(x), Y(y), 4.5, 0, Math.PI * 2); c.fillStyle = pal.blue; c.fill(); });
          }
          return { X, Y };
        };

        /* two circles, widths in units of d */
        const circles = (R, d1, k, labs, dashed2) => {
          const cy = R.y0 + (R.y1 - R.y0 - 26) / 2, cx1 = R.x0 + (R.x1 - R.x0) * .27, cx2 = R.x0 + (R.x1 - R.x0) * .73;
          c.beginPath(); c.arc(cx1, cy, d1 / 2, 0, Math.PI * 2); c.fillStyle = alpha(pal.yellow, .85); c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 2; c.stroke();
          c.beginPath(); c.arc(cx2, cy, d1 * k / 2, 0, Math.PI * 2);
          if (dashed2) { c.setLineDash([6, 5]); c.strokeStyle = pal.muted; c.lineWidth = 2.4; c.stroke(); c.setLineDash([]); }
          else { c.fillStyle = alpha(pal.yellow, .85); c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 2; c.stroke(); }
          T(labs[0], cx1, R.y1 - 10, { bold: true }); T(labs[1], cx2, R.y1 - 10, { bold: true });
          return { cy, cx1, cx2 };
        };

        /* dual-axis (or split) chart */
        const dualC = (R, M, split) => {
          const xt = [1, 2, 3, 4, 5, 6].map(v => [v, String(v)]);
          const mk = (RR, ys, y1, tick, col, dash, side) => {
            const w = RR.x1 - RR.x0, h = RR.y1 - RR.y0, X = v => RR.x0 + (v - 1) / 5 * w, Y = v => RR.y1 - v / y1 * h;
            c.lineWidth = 1; c.strokeStyle = pal.grid; c.beginPath();
            for (let v = 0; v <= y1 + 1e-9; v += tick) { c.moveTo(RR.x0, Y(v)); c.lineTo(RR.x1, Y(v)); }
            c.stroke();
            for (let v = 0; v <= y1 + 1e-9; v += tick) T(String(v), side === 'r' ? RR.x1 + 8 : RR.x0 - 8, Y(v), { align: side === 'r' ? 'left' : 'right', color: col });
            c.beginPath(); ys.forEach((y, i) => i ? c.lineTo(X(i + 1), Y(y)) : c.moveTo(X(i + 1), Y(y))); c.strokeStyle = col; c.lineWidth = 3.4; c.setLineDash(dash); c.lineJoin = 'round'; c.stroke(); c.setLineDash([]);
            ys.forEach((y, i) => { c.beginPath(); c.arc(X(i + 1), Y(y), 4.5, 0, Math.PI * 2); c.fillStyle = col; c.fill(); });
            return { X, Y };
          };
          const axisX = RR => { seg(RR.x0, RR.y1, RR.x1, RR.y1, pal['grid-strong'], 2); seg(RR.x0, RR.y1, RR.x0, RR.y0, pal['grid-strong'], 2); xt.forEach(([v, l]) => T(l, RR.x0 + (v - 1) / 5 * (RR.x1 - RR.x0), RR.y1 + 18, { color: pal.muted })); };
          if (!split) {
            const RR = { x0: R.x0, x1: R.x1 - 34, y0: R.y0, y1: R.y1 };
            mk(RR, CHESS, 40, 10, pal.blue, [], 'l'); mk(RR, RAIN, M, M / 4, pal.red, [8, 6], 'r'); axisX(RR); seg(RR.x1, RR.y1, RR.x1, RR.y0, pal['grid-strong'], 2);
            T('Month', (RR.x0 + RR.x1) / 2, RR.y1 + 38, { color: pal.muted });
          } else {
            const gap = 34, hh = (R.y1 - R.y0 - gap) / 2;
            const A = { x0: R.x0, x1: R.x1 - 10, y0: R.y0, y1: R.y0 + hh }, B = { x0: R.x0, x1: R.x1 - 10, y0: R.y0 + hh + gap, y1: R.y1 };
            mk(A, CHESS, 40, 20, pal.blue, [], 'l'); axisX(A); T('Club members', A.x1, A.y0 - 4, { align: 'right', color: pal.blue, bold: true });
            mk(B, RAIN, M, M / 2, pal.red, [8, 6], 'l'); axisX(B); T('Rainfall (mm)', B.x1, B.y0 - 4, { align: 'right', color: pal.red, bold: true });
          }
        };

        /* ---------------- bar mode ---------------- */
        if (st.mode === 'bar') {
          const hA = BAR.a - st.s, hB = BAR.b - st.s, dr = hB / hA, tr = BAR.b / BAR.a, honest = st.s === 0;
          const hb = head([['Lunches sold per day (made up)'],
            [`Looks like: Menu B is ${R3(dr)} times as tall as Menu A`, honest ? pal.green : pal.red, true],
            [`True ratio: ${BAR.b} ÷ ${BAR.a} = ${R3(tr)} times`]]);
          const fh = foot(BAR.src);
          const R = { x0: clamp(W * .11, 40, 54), x1: W - 24, y0: hb + 16, y1: p.h - fh - 50 };
          const Y = bars(R, { items: [{ slot: 0, label: 'Menu A', val: BAR.a }, { slot: 1, label: 'Menu B', val: BAR.b }], nslots: 2, start: st.s, top: BAR.top, tick: BAR.tick });
          { /* the dashed line from the top of A across to B shows the height difference */
            const sw = (R.x1 - R.x0) / 2, ya = Y(BAR.a);
            seg(R.x0 + sw * .5, ya, R.x0 + sw * 1.5 + 30, ya, alpha(pal.text, .55), 1.6, [4, 4]);
          }
        }

        /* ---------------- line mode ---------------- */
        if (st.mode === 'line') {
          const ys = VIS.slice(st.w0 - 1, st.w1), first = ys[0], last = ys[ys.length - 1];
          const whole = st.w0 === 1 && st.w1 === 12, ang = Math.round(Math.atan(st.r * (last - first) / 40) * 180 / Math.PI);
          const chg = (last - first) / first;
          const hb = head([['Museum visitors per day, by month (made up)'],
            [`First point to last point looks like: ${tiltWord(ang)}`, whole && st.r >= .6 && st.r <= .9 ? pal.green : pal.red, true],
            [`Months ${st.w0} to ${st.w1}: ${first} to ${last}, ${chg >= 0 ? 'up' : 'down'} ${Math.abs(Math.round(chg * 1000) / 10)}%`]]);
          const fh = foot(LINE_SRC), L = lay = lineLayout(p, hb, fh);
          const pts = []; for (let m = st.w0; m <= st.w1; m++) pts.push([m, VIS[m - 1]]);
          const xt = pts.map(q => [q[0], String(q[0])]);
          lineC(L.box, { pts, x0: st.w0, x1: st.w1, y0: 40, y1: 80, tick: 10, xt });
          /* overview strip with the window */
          const S = L.strip, sy = v => S.y1 - (v - 40) / 40 * (S.y1 - S.y0);
          T('All 12 months. Shaded: the window.', S.x0, S.y0 - 14, { align: 'left', color: pal.muted });
          c.fillStyle = alpha(pal.yellow, .22); c.fillRect(stripX(S, st.w0), S.y0, stripX(S, st.w1) - stripX(S, st.w0), S.y1 - S.y0);
          seg(S.x0, S.y1, S.x1, S.y1, pal['grid-strong'], 1.6);
          c.beginPath(); VIS.forEach((v, i) => i ? c.lineTo(stripX(S, i + 1), sy(v)) : c.moveTo(stripX(S, i + 1), sy(v))); c.strokeStyle = alpha(pal.text, .7); c.lineWidth = 2; c.stroke();
          if (st.pred.line !== null) {
            [['a', st.w0], ['b', st.w1]].forEach(([id, m]) => {
              const x = stripX(S, m); seg(x, S.y0, x, S.y1, pal.yellow, 2.4);
              c.beginPath(); c.arc(x, (S.y0 + S.y1) / 2, 9, 0, Math.PI * 2); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.brass; c.lineWidth = 3; c.stroke();
            });
          }
        }

        /* ---------------- area mode ---------------- */
        if (st.mode === 'area') {
          const k = st.k, ar = k * k, honest = Math.abs(ar - 2) <= .1;
          const hb = head([['Club pizza slices per week (made up)'],
            [`Week 2 is drawn with width ${tm(k)} Week 1's`, honest ? pal.green : pal.red, true],
            [`Its area is ${tm(ar)} Week 1's. The value is 2 times.`]]);
          const fh = foot(AREA_SRC);
          const availH = p.h - fh - hb - 150, d1 = clamp(Math.min((W / 2 - 24) / 2.2, availH / 2.2), 28, 100);
          const R = { x0: 14, x1: W - 14, y0: hb + 8, y1: hb + 8 + d1 * 2.2 + 26 };
          circles(R, d1, k, ['Week 1: 10 slices', 'Week 2: 20 slices'], false);
          /* ratio bars */
          const by = R.y1 + 34, bx = 14, maxw = W - 28 - 100, unit = maxw / Math.max(4, ar);
          [['Value ratio', 2, pal.green], ['Area ratio', ar, honest ? pal.green : pal.red]].forEach(([lab, v, col], i) => {
            const y = by + i * 42; c.fillStyle = alpha(col, .85); c.fillRect(bx, y - 9, Math.max(2, v * unit), 18);
            T(lab + ': ' + tm(v), bx, y - 20, { align: 'left', bold: true, color: pal.text });
          });
        }

        /* ---------------- two axes mode ---------------- */
        if (st.mode === 'dual') {
          const hb = head([['Chess club members and rainfall (made up)'],
            ['Blue solid line and left axis: club members', pal.blue],
            ['Red dashed line and right axis: rainfall in mm', pal.red],
            [st.split ? 'Two graphs: nothing can cross.' : crossText(st.M), st.split ? pal.green : pal.red, true]]);
          const fh = foot(DUAL_SRC);
          const R = { x0: clamp(W * .11, 40, 54), x1: W - (st.split ? 16 : 14) - (st.split ? 0 : 20), y0: hb + (st.split ? 20 : 14), y1: p.h - fh - 48 };
          dualC(R, st.M, st.split);
        }

        /* ---------------- fix mode ---------------- */
        if (st.mode === 'fix') {
          const fx = fixInfo(), hb = head([['Cafeteria salads sold per day (made up)'],
            [`Looks like: ${sgnPct(fx.drawn)} from the first bar to the last`, fx.pass === 4 ? pal.green : pal.red, true],
            [`True change over the weeks shown: ${sgnPct(fx.truth)}.  Checks passed: ${fx.pass} of 4`]]);
          const fh = foot(st.fsrc ? FIX_SRC : 'No source or sample size given.', st.fsrc ? pal.muted : pal.red);
          const R = { x0: clamp(W * .11, 40, 54), x1: W - 20, y0: hb + 18, y1: p.h - fh - 50 };
          bars(R, { items: fx.items, nslots: fx.nslots, gaps: fx.gaps, start: st.fs, top: 100, tick: 20 });
        }

        /* ---------------- practice mode ---------------- */
        if (st.mode === 'prac') {
          const pr = PR[st.pi], hb = head([[pr.title], ['Problem ' + (st.pi + 1) + ' of ' + PR.length, pal.muted]]), fh = foot(pr.src);
          const R = { x0: clamp(W * .11, 40, 54), x1: W - 24, y0: hb + 16, y1: p.h - fh - 50 };
          if (pr.t === 'bar') {
            bars(R, { items: pr.vals.map((v, i) => ({ slot: i, label: pr.labels[i], val: v })), nslots: 2, start: pr.start, top: pr.top, tick: pr.tick });
          } else if (pr.t === 'win') {
            const pts = pr.ys.map((y, i) => [i + 1, y]);
            lineC(R, { pts, x0: 1, x1: 12, y0: pr.y0, y1: pr.y1, tick: pr.tick, xt: pts.map(q => [q[0], String(q[0])]), hl: [pr.a, pr.b] });
            T('Month', (R.x0 + R.x1) / 2, R.y1 + 38, { color: pal.muted });
          } else if (pr.t === 'circ') {
            const d1 = clamp(Math.min((W / 2 - 24) / 2, (R.y1 - R.y0 - 26) / 2.2), 22, 70);
            circles({ x0: 14, x1: W - 14, y0: R.y0, y1: R.y1 }, d1, 1, ['Value 1', 'Value 3: how wide? (not drawn)'], true);
          } else if (pr.t === 'dual') {
            dualC({ x0: R.x0, x1: R.x1 - 12, y0: R.y0, y1: R.y1 }, pr.M, false);
          } else if (pr.t === 'shape') {
            const ys = [20, 22, 24, 26, 28, 30], pts = ys.map((y, i) => [i + 1, y]), xt = pts.map(q => [q[0], String(q[0])]);
            const half = (W - 28) / 2, ah = R.y1 - R.y0 - 20;
            [[.3, 'Graph A', 0], [1.2, 'Graph B', 1]].forEach(([r, nm, i]) => {
              const x0 = 14 + i * half + 38, wd = Math.min(half - 52, ah / r), bx = { x0, x1: x0 + wd, y0: R.y1 - wd * r, y1: R.y1 };
              lineC(bx, { pts, x0: 1, x1: 6, y0: 10, y1: 40, tick: 30, xt });
              T(nm, x0 + wd / 2, bx.y0 - 12, { bold: true });
            });
          } else if (pr.t === 'int') {
            const vals = [10, 12, 14, 16], labs = ['1', '2', '3', '8'], pts = vals.map((v, i) => [i + 1, v]);
            lineC(R, { pts, x0: 1, x1: 4, y0: 0, y1: 20, tick: 5, xt: pts.map((q, i) => [q[0], labs[i]]) });
            T('Year', (R.x0 + R.x1) / 2, R.y1 + 38, { color: pal.muted });
          }
        }
      };

      /* ---------- derived values for the Fix it mode ---------- */
      const fixInfo = () => {
        const w0 = st.fwhole ? 1 : 3, idx = FIX_W.map((w, i) => i).filter(i => FIX_W[i] >= w0);
        const items = [], gaps = [];
        let nslots;
        if (st.fspace) {
          nslots = 7 - w0 + 1; idx.forEach(i => items.push({ slot: FIX_W[i] - w0, label: 'W' + FIX_W[i], val: FIX_V[i] }));
          if (w0 <= 4) gaps.push(4 - w0);
        } else {
          nslots = idx.length; idx.forEach((i, j) => items.push({ slot: j, label: 'W' + FIX_W[i], val: FIX_V[i] }));
        }
        const f = FIX_V[idx[0]], l = FIX_V[idx[idx.length - 1]];
        const drawn = (l - st.fs) / (f - st.fs) - 1, truth = l / f - 1;
        const checks = [st.fs === 0, st.fwhole, st.fspace, st.fsrc];
        return { items, gaps, nslots, drawn, truth, checks, pass: checks.filter(Boolean).length, f, l };
      };

      /* ---------- panel ---------- */
      const probe = C.readout(), host = probe.parentElement; probe.remove();
      const group = fn => {
        const before = new Set(host.children); fn();
        const w = h('div', { class: 'grp' }, [...host.children].filter(e => !before.has(e))); host.append(w); return w;
      };
      const wide = els => els.forEach(e => { e.style.cssText = 'border-radius:10px;text-align:left;justify-content:flex-start;width:100%;line-height:1.35;padding:8px 14px;height:auto;'; });
      const choiceRow = (n, onPick) => { const els = C.buttons(Array.from({ length: n }, (_, i) => ({ label: '', onClick: () => onPick(i) }))); wide(els); return els; };
      const syncers = [];
      const sliderGet = {};

      /* trick switcher */
      let modeBtns;
      const MODES = [['bar', 'Cut the axis'], ['line', 'Window and shape'], ['area', 'Circles'], ['dual', 'Two axes'], ['fix', 'Fix it']];
      const gSwitch = group(() => {
        C.title('Pick a trick');
        modeBtns = C.buttons(MODES.map(([m, lab]) => ({ label: lab, onClick: () => { if (cancel) cancel(); st.mode = m; draw(); } })));
      });

      /* one block per trick: guess first, then the controls */
      const mkTrick = (key, build) => {
        const r = {};
        r.gp = group(() => {
          C.title('Guess first');
          r.q = C.readout(); r.q.style.cssText = 'border-top:0;padding-top:0;font-weight:600;';
          r.btns = choiceRow(PRED[key].ch.length, i => pick(key, i));
        });
        r.gt = group(() => { r.fb = C.readout(); build(r); });
        return r;
      };
      const pick = (key, i) => {
        if (st.pred[key] !== null) return;
        st.pred[key] = i;
        if (cancel) cancel();
        if (key === 'bar') cancel = animateTo(st, { s: 50 }, 700, () => { sync(); draw(); });
        if (key === 'area') cancel = animateTo(st, { k: 2 }, 700, () => { sync(); draw(); });
        if (key === 'dual') cancel = animateTo(st, { M: 240 }, 700, () => { sync(); draw(); });
        if (key === 'line') { st.w0 = 1; st.w1 = 6; }
        sync(); draw();
      };
      const startOver = key => {
        if (cancel) cancel();
        st.pred[key] = null;
        if (key === 'bar') st.s = 0; if (key === 'line') { st.w0 = 1; st.w1 = 12; st.r = .6; } if (key === 'area') st.k = 1; if (key === 'dual') { st.M = 120; st.split = false; }
        sync(); draw();
      };

      const T_bar = mkTrick('bar', r => {
        r.sl = C.slider({ label: 'Where the vertical axis starts', min: 0, max: 50, step: 10, value: st.s, format: v => String(v), onInput: v => { if (cancel) cancel(); st.s = v; draw(); } });
        r.ro = C.readout();
        C.buttons([{ label: 'Make it honest', onClick: () => { if (cancel) cancel(); st.s = 0; sync(); draw(); } }, { label: 'Guess again', onClick: () => startOver('bar') }]);
      });
      const T_line = mkTrick('line', r => {
        r.s0 = C.slider({ label: 'First month shown', min: 1, max: 11, step: 1, value: st.w0, format: v => String(v), onInput: v => { st.w0 = v; if (st.w1 <= v) st.w1 = v + 1; sync(); draw(); } });
        r.s1 = C.slider({ label: 'Last month shown', min: 2, max: 12, step: 1, value: st.w1, format: v => String(v), onInput: v => { st.w1 = v; if (st.w0 >= v) st.w0 = v - 1; sync(); draw(); } });
        r.sr = C.slider({ label: 'Graph shape: height compared with width', min: 1, max: 4, step: 1, value: Math.round(st.r / .3), format: v => SHAPE_WORD[v] + ' (' + R2(v * .3) + ')', onInput: v => { st.r = Math.round(v * 3) / 10; draw(); } });
        r.ro = C.readout();
        C.buttons([{ label: 'Make it honest', onClick: () => { st.w0 = 1; st.w1 = 12; st.r = .6; sync(); draw(); } }, { label: 'Guess again', onClick: () => startOver('line') }]);
        C.hint('You can also drag the two rings under the graph to move the window.');
      });
      const T_area = mkTrick('area', r => {
        r.sl = C.slider({ label: 'Width of Week 2\'s circle, in times Week 1\'s', min: 1, max: 2.2, step: .1, value: st.k, format: v => R2(v), onInput: v => { if (cancel) cancel(); st.k = v; draw(); } });
        r.ro = C.readout();
        C.buttons([{ label: 'Make it honest', onClick: () => { if (cancel) cancel(); st.k = 1.4; sync(); draw(); } }, { label: 'Guess again', onClick: () => startOver('area') }]);
      });
      const T_dual = mkTrick('dual', r => {
        r.sl = C.slider({ label: 'Top of the right axis (rainfall, mm)', min: 120, max: 240, step: 40, value: st.M, format: v => String(v), onInput: v => { if (cancel) cancel(); st.M = v; draw(); } });
        r.tg = C.toggle({ label: 'Draw two separate graphs instead', value: st.split, onChange: v => { st.split = v; draw(); } });
        r.ro = C.readout();
        C.buttons([{ label: 'Guess again', onClick: () => startOver('dual') }]);
      });

      /* fix it */
      let fixSl, fixT1, fixT2, fixT3, roFix;
      const gFix2 = group(() => {
        C.title('Set the graph to an honest form');
        fixSl = C.slider({ label: 'Where the vertical axis starts', min: 0, max: 60, step: 20, value: st.fs, format: v => String(v), onInput: v => { if (cancel) cancel(); st.fs = v; draw(); } });
        fixT1 = C.toggle({ label: 'Show the whole record (weeks 1 to 7)', value: st.fwhole, onChange: v => { st.fwhole = v; draw(); } });
        fixT2 = C.toggle({ label: 'Space the bars by the real week number', value: st.fspace, onChange: v => { st.fspace = v; draw(); } });
        fixT3 = C.toggle({ label: 'Add the source and sample size', value: st.fsrc, onChange: v => { st.fsrc = v; draw(); } });
        roFix = C.readout();
        C.hint('Week 4 was not recorded. A fair graph leaves a gap there instead of squeezing week 3 and week 5 together.');
      });

      /* practice */
      let gPracStart, gPrac, roTally, roPrompt, prBtns, roPrFb, nextBtn, backBtn;
      gPracStart = group(() => {
        C.title('Practice');
        C.buttons([{ label: 'Start the ' + PR.length + ' practice problems', primary: true, onClick: () => { if (cancel) cancel(); st.mode = 'prac'; draw(); } }]);
      });
      gPrac = group(() => {
        C.title('Practice: read the graph, then choose');
        roTally = C.readout();
        roPrompt = C.readout(); roPrompt.style.cssText = 'border-top:0;padding-top:0;font-weight:600;';
        prBtns = choiceRow(4, i => prPick(i));
        roPrFb = C.readout();
        [nextBtn, backBtn] = C.buttons([
          { label: 'Next problem', primary: true, onClick: () => { st.pi = (st.pi + 1) % PR.length; draw(); } },
          { label: 'Back to the tricks', onClick: () => { st.mode = 'bar'; draw(); } }]);
        C.hint('A wrong pick fades and tells you why. Choose again until you get it. Nothing here is saved or scored.');
      });
      const prPick = i => {
        const s = st.pp[st.pi], pr = PR[st.pi];
        if (s.solved) return;
        if (i === pr.ans) { s.solved = true; if (!s.tried.length) s.first = true; } else if (!s.tried.includes(i)) s.tried.push(i);
        s.last = i; draw();
      };

      /* ---------- updates ---------- */
      const predFb = key => {
        const pk = st.pred[key];
        return pk === null ? '' : fbHtml(pk === PRED[key].ans ? 'Your guess was right' : 'Your guess was not quite right', PRED[key].fb[pk]);
      };
      function sync() {
        T_bar.sl.set(st.s); T_line.s0.set(st.w0); T_line.s1.set(st.w1); T_line.sr.set(Math.round(st.r / .3));
        T_area.sl.set(st.k); T_dual.sl.set(st.M); T_dual.tg.checked = st.split;
        fixSl.set(st.fs); fixT1.checked = st.fwhole; fixT2.checked = st.fspace; fixT3.checked = st.fsrc;
      }
      const updBar = () => {
        const hA = BAR.a - st.s, hB = BAR.b - st.s, dr = hB / hA, tr = BAR.b / BAR.a;
        T_bar.fb.innerHTML = predFb('bar');
        T_bar.ro.innerHTML = `${kk('Axis starts at')} ${Math.round(st.s)}<br>${kk('Drawn heights')} ${BAR.a} − ${Math.round(st.s)} = ${Math.round(hA)} and ${BAR.b} − ${Math.round(st.s)} = ${Math.round(hB)}<br>${kk('Looks like')} ${Math.round(hB)} ÷ ${Math.round(hA)} = ${R3(dr)} times<br>${kk('True ratio')} ${BAR.b} ÷ ${BAR.a} = ${R3(tr)} times<br>` +
          (st.s === 0 ? ok('Honest: the axis starts at zero, so the picture matches the numbers.') : no(`Not honest: B looks ${R3(dr)} times as tall, but it is really ${R3(tr)} times as big.`));
      };
      const updLine = () => {
        const ys = VIS.slice(st.w0 - 1, st.w1), f = ys[0], l = ys[ys.length - 1], chg = (l - f) / f, ang = Math.round(Math.atan(st.r * (l - f) / 40) * 180 / Math.PI);
        const whole = st.w0 === 1 && st.w1 === 12, shapeOk = st.r >= .6 && st.r <= .9;
        T_line.fb.innerHTML = predFb('line');
        T_line.ro.innerHTML = `${kk('Window')} months ${st.w0} to ${st.w1} (${st.w1 - st.w0 + 1} of 12)<br>${kk('First to last')} ${f} to ${l}, ${sgnPct(chg)}<br>${kk('Whole year')} 50 to 52, ${sgnPct(.04)}<br>${kk('Shape')} height ÷ width = ${R2(st.r)}, tilt about ${Math.abs(ang)}°, so first point to last point looks ${tiltWord(ang)}<br>` +
          (whole ? ok('Whole range shown.') : no('Not the whole range: months ' + (st.w0 > 1 ? '1 to ' + (st.w0 - 1) : '') + (st.w0 > 1 && st.w1 < 12 ? ' and ' : '') + (st.w1 < 12 ? (st.w1 + 1) + ' to 12' : '') + ' are hidden.')) + '<br>' +
          (shapeOk ? ok('Shape in the fair range.') : no('Extreme shape: it stretches or flattens the change.'));
      };
      const updArea = () => {
        const ar = st.k * st.k, honest = Math.abs(ar - 2) <= .1;
        T_area.fb.innerHTML = predFb('area');
        T_area.ro.innerHTML = `${kk('Value ratio')} 20 ÷ 10 = 2<br>${kk('Width')} ${tm(st.k)} Week 1's<br>${kk('Area')} ${R2(st.k)} × ${R2(st.k)} = ${tm(ar)} Week 1's<br>` +
          (honest ? ok(`Honest: the area, ${tm(ar)}, matches the value, 2 times.`) : no(`Not honest: the area is ${tm(ar)} but the value is 2 times.`));
      };
      const updDual = () => {
        T_dual.fb.innerHTML = predFb('dual');
        T_dual.ro.innerHTML = `${kk('Right axis top')} ${Math.round(st.M)} mm<br>${kk('Data, never changed')} members ${CHESS.join(', ')}; rain ${RAIN.join(', ')}<br>` + (st.split ? ok('Two graphs: each line has its own graph, so there is no false crossing.') : no(crossText(st.M) + ' This depends on the axis, not on the data.'));
      };
      const updFix = () => {
        const fx = fixInfo(), lab = (b, t) => (b ? ok('Pass') : no('Fix')) + ' ' + t;
        roFix.innerHTML = `${kk('Checklist')} ${fx.pass} of 4 passed<br>` +
          lab(fx.checks[0], 'Axis starts at zero.') + '<br>' + lab(fx.checks[1], 'Whole time range (weeks 1 to 7).') + '<br>' + lab(fx.checks[2], 'Equal gaps mean equal time.') + '<br>' + lab(fx.checks[3], 'Source and sample stated.') + '<br>' +
          `${kk('First to last bar')} ${fx.f} to ${fx.l}: drawn ${sgnPct(fx.drawn)}, true ${sgnPct(fx.truth)}` + (fx.pass === 4 ? '<br>' + ok('All four pass. The picture now matches the numbers.') : '');
      };
      const markBtns = (btns, state, ans, texts) => btns.forEach((b, i) => {
        b.textContent = texts[i] === undefined ? '' : texts[i]; b.style.display = texts[i] === undefined ? 'none' : '';
        b.classList.toggle('primary', state.solved && i === ans); b.disabled = state.solved ? i !== ans : false;
        b.style.opacity = state.tried.includes(i) && !state.solved ? '.5' : '';
      });
      const updPrac = () => {
        const s = st.pp[st.pi], pr = PR[st.pi], first = st.pp.filter(z => z.first).length, done = st.pp.filter(z => z.solved).length;
        roTally.innerHTML = `${kk('Problem')} ${st.pi + 1} of ${PR.length}<br>${kk('Right on the first try')} ${first} of ${PR.length}` + (done === PR.length ? `<br><b>All ${PR.length} done.</b>` : '');
        roPrompt.textContent = pr.q;
        markBtns(prBtns, s, pr.ans, pr.ch);
        roPrFb.innerHTML = s.last === undefined ? fbHtml('Your turn', 'Look at the graph, apply the checklist, then choose.') : fbHtml(s.last === pr.ans ? 'Right' : 'Not that one', pr.fb[s.last].replace(/^Right\.\s*/, ''));
        nextBtn.disabled = !s.solved; nextBtn.textContent = st.pi === PR.length - 1 ? 'Back to problem 1' : 'Next problem';
      };
      const showGroups = () => {
        const m = st.mode, tr = { bar: T_bar, line: T_line, area: T_area, dual: T_dual };
        Object.keys(tr).forEach(k => { tr[k].gp.style.display = m === k && st.pred[k] === null ? '' : 'none'; tr[k].gt.style.display = m === k && st.pred[k] !== null ? '' : 'none'; });
        Object.keys(tr).forEach(k => { if (m === k && st.pred[k] === null) { tr[k].q.textContent = PRED[k].q; markBtns(tr[k].btns, { solved: false, tried: [] }, -1, PRED[k].ch); } });
        gFix2.style.display = m === 'fix' ? '' : 'none';
        gPracStart.style.display = m === 'prac' ? 'none' : ''; gPrac.style.display = m === 'prac' ? '' : 'none';
        modeBtns.forEach((b, i) => b.classList.toggle('primary', MODES[i][0] === m));
      };
      const upd = () => {
        showGroups();
        if (st.mode === 'bar') updBar(); if (st.mode === 'line') updLine(); if (st.mode === 'area') updArea(); if (st.mode === 'dual') updDual();
        if (st.mode === 'fix') updFix(); if (st.mode === 'prac') updPrac();
      };
      function draw() { P.draw(); upd(); }

      /* ---------- dragging the window edges ---------- */
      draggable(P, {
        hit: (px, py) => {
          if (st.mode !== 'line' || st.pred.line === null) return null;
          if (!lay) return null; const S = lay.strip;
          if (py < S.y0 - 14 || py > S.y1 + 14) return null;
          const da = Math.abs(px - stripX(S, st.w0)), db = Math.abs(px - stripX(S, st.w1));
          if (Math.min(da, db) > 20) return null;
          return da <= db ? 'a' : 'b';
        },
        move: (hd, mx) => {
          if (!lay) return; const S = lay.strip, px = P.X(mx), m = clamp(Math.round(1 + (px - S.x0) / (S.x1 - S.x0) * 11), 1, 12);
          if (hd === 'a') st.w0 = clamp(m, 1, st.w1 - 1); else st.w1 = clamp(m, st.w0 + 1, 12);
          sync(); draw();
        }
      });
      if (P.coordEl) P.coordEl.style.display = 'none';

      /* ---------- steps ---------- */
      const apply = (patch, immediate) => {
        if (cancel) cancel();
        if (patch.mode) st.mode = patch.mode;
        ['w0', 'w1', 'r'].forEach(k => { if (patch[k] !== undefined) st[k] = patch[k]; });
        if (patch.fwhole !== undefined) st.fwhole = !!patch.fwhole;
        if (patch.fspace !== undefined) st.fspace = !!patch.fspace;
        if (patch.fsrc !== undefined) st.fsrc = !!patch.fsrc;
        const nums = {}; ['s', 'k', 'fs'].forEach(k => { if (patch[k] !== undefined) nums[k] = patch[k]; });
        if (immediate) Object.assign(st, nums);
        else if (Object.keys(nums).length) cancel = animateTo(st, nums, 500, () => { sync(); draw(); });
        sync(); draw();
      };
      sync(); draw();
      return { destroy: () => { if (cancel) cancel(); P.destroy(); }, apply };
    }
  });
}
