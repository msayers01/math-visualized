/* =====================================================================
   SCHOOL — Statistical questions and data displays
   ===================================================================== */
{
  /* ---------- small helpers ---------- */
  const font = (size, weight = 600) => `${weight} ${size}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`;
  const T = (c, p, str, x, y, { size = 14, color, align = 'center', weight = 600, halo = true } = {}) => {
    c.save(); c.font = font(size, weight); c.textAlign = align; c.textBaseline = 'middle';
    if (halo) { c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(str, x, y); }
    c.fillStyle = color || p.pal.text; c.fillText(str, x, y); c.restore();
  };
  const tw = (c, str, size, weight = 600) => { c.save(); c.font = font(size, weight); const w = c.measureText(str).width; c.restore(); return w; };
  const wrap = (c, str, size, maxW, weight = 600) => {
    const lines = []; let cur = '';
    for (const w of str.split(' ')) {
      const t = cur ? cur + ' ' + w : w;
      if (cur && tw(c, t, size, weight) > maxW) { lines.push(cur); cur = w; } else cur = t;
    }
    if (cur) lines.push(cur);
    return lines;
  };
  const rr = (c, x, y, w, h, r) => {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  const seg = (c, x0, y0, x1, y1, col, w = 2, dash) => {
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.strokeStyle = col; c.lineWidth = w; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]);
  };
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;
  const sortN = v => [...v].sort((a, b) => a - b);
  const medOf = s => { const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
  const five = v => {
    const s = sortN(v), n = s.length, hf = Math.floor(n / 2);
    return { min: s[0], q1: medOf(s.slice(0, hf)), med: medOf(s), q3: medOf(s.slice(n - hf)), max: s[n - 1], n };
  };
  const countsOf = v => { const t = {}; v.forEach(x => { t[x] = (t[x] || 0) + 1; }); return t; };

  /* ---------- the questions to sort ---------- */
  const QS = [
    { q: 'How tall are the students in my class?', stat: true, kind: 'num', groups: false,
      ans: ['142 cm', '151 cm', '138 cm', '147 cm', '155 cm', '144 cm'],
      yes: 'Every student has a different height, so you expect different answers. That is variability. You need the heights of many students to answer it.',
      kindWhy: 'Heights are measured, so the data is numbers: numerical data.' },
    { q: 'How many students are in my school today?', stat: false, kind: null, groups: false,
      ans: ['412', '412', '412', '412', '412', '412'],
      no: 'There is one number to find, and everyone who counts gets the same answer. No variability, so it is not a statistical question. You count once and you are done.' },
    { q: 'Do more sixth graders than eighth graders walk to school?', stat: true, kind: 'cat', groups: true,
      ans: ['walk', 'bus', 'walk', 'car', 'walk', 'bike'],
      yes: 'Students get to school in different ways, so the answers vary. This question also compares two groups, sixth graders and eighth graders.',
      kindWhy: 'The answers are labels (walk, bus, car, bike). You sort them into groups and count. That is categorical data.' },
    { q: 'Which pet do sixth graders like best?', stat: true, kind: 'cat', groups: false,
      ans: ['dog', 'cat', 'dog', 'fish', 'cat', 'dog'],
      yes: 'Different students like different pets, so the answers vary. You collect many answers and see which pet gets the most.',
      kindWhy: 'The answers are labels (dog, cat, fish). You count how many students chose each. That is categorical data.' },
    { q: 'What time does the school day start at my school?', stat: false, kind: null, groups: false,
      ans: ['8:15', '8:15', '8:15', '8:15', '8:15', '8:15'],
      no: 'The school has one start time, so every person gives the same answer. No variability, so it is not a statistical question. You look it up.' },
    { q: 'How many minutes of homework do sixth graders do each night?', stat: true, kind: 'num', groups: false,
      ans: ['20', '45', '30', '60', '15', '30'],
      yes: 'Some students do 15 minutes and some do an hour. The answers vary, so you collect many of them and look at all of them together.',
      kindWhy: 'Minutes are counted numbers, so this is numerical data.' },
    { q: 'What is the capital of Minnesota?', stat: false, kind: null, groups: false,
      ans: ['St. Paul', 'St. Paul', 'St. Paul', 'St. Paul', 'St. Paul', 'St. Paul'],
      no: 'This is a fact with one answer. Ask a hundred people who know it and you always get St. Paul. No variability, so it is not a statistical question.' },
    { q: 'Who jumps farther, sixth graders or seventh graders?', stat: true, kind: 'num', groups: true,
      ans: ['1.4 m', '1.9 m', '1.6 m', '1.2 m', '1.7 m', '1.5 m'],
      yes: 'Every student jumps a different distance, so the data varies. The question compares two groups, so you must compare the whole groups. One long jump does not decide it.',
      kindWhy: 'Jump lengths are measured, so the data is numerical.' }
  ];

  /* ---------- the data sets ---------- */
  const DS = [
    { name: 'Shoe sizes', who: '16 students in Room 12', unit: 'shoe size', plural: 'students',
      v: [7, 8, 6, 7, 9, 7, 8, 13, 6, 8, 7, 10, 5, 8, 6, 9],
      dlo: 4, dhi: 14, step: 1, widths: [1, 2, 4], hlo: 4, boxTick: 1,
      feat: 'The dots bunch up at 6 to 8, and the dot at 13 sits far from the rest. A value far from the others is called an <b>outlier</b>.',
      histFeat: ['Width 1 looks like the dot plot. Every size has its own bar, and the outlier at 13 is easy to see.',
        'Width 2 puts sizes 6 and 7 together and 8 and 9 together. The shape is one hump with a tail to the right.',
        'Width 4 leaves only three bars. The hump is gone, and you cannot tell where most sizes are.'],
      boxNote: 'The box covers the middle half of the students. The long whisker to 13 only tells you the largest value. It does not say that just one student has a size that large.' },
    { name: 'Minutes of reading last night', who: '20 students', unit: 'minutes', plural: 'students',
      v: [25, 40, 10, 30, 15, 45, 20, 35, 0, 30, 25, 60, 20, 15, 50, 35, 30, 10, 40, 25],
      dlo: 0, dhi: 60, step: 5, widths: [5, 10, 20], hlo: 0, boxTick: 10,
      feat: 'The dots spread from 0 to 60 minutes. The tallest stacks are at 25 and 30, with 3 dots each.',
      histFeat: ['Width 5 gives 13 thin bars. The shape is bumpy because each bar holds only a few students.',
        'Width 10 shows one clear hump. Most students read 10 to 39 minutes (14 of 20), with a short tail to the right.',
        'Width 20 leaves four bars. The hump is smoothed away, so you lose the detail.'],
      boxNote: 'The box says half of the students read between 17.5 and 37.5 minutes. It does not show the stacks at 25 and 30.' },
    { name: 'Quiz scores out of 20', who: '18 students', unit: 'score', plural: 'students',
      v: [11, 18, 9, 12, 19, 8, 10, 17, 12, 18, 7, 11, 19, 9, 12, 10, 6, 17],
      dlo: 4, dhi: 20, step: 1, widths: [2, 4, 8], hlo: 4, boxTick: 2,
      feat: 'The scores fall in two clumps, 6 to 12 and 17 to 19. There is a <b>gap</b> from 13 to 16, because nobody scored there.',
      histFeat: ['Width 2 shows two humps with an empty bar between them (14 to 15). The gap is easy to see.',
        'Width 4 fills the gap a little. The bar for 12 to 15 holds only the three 12s, so the gap looks like a small dip.',
        'Width 8 gives two equal bars of 9 students. The gap and both humps are hidden.'],
      boxNote: 'The box runs from 9 to 17 and the median is 11.5. Nothing in the box shows that nobody scored 13 to 16. Turn on the data dots to see what the box hides.' }
  ];
  DS.forEach(d => {
    d.n = d.v.length; d.tc = countsOf(d.v); d.maxc = Math.max(...Object.values(d.tc)); d.f = five(d.v);
    d.nb = w => Math.ceil((Math.max(...d.v) + 1 - d.hlo) / w);
    d.bins = w => { const a = Array(d.nb(w)).fill(0); d.v.forEach(x => { a[Math.floor((x - d.hlo) / w)]++; }); return a; };
    d.ymax = Math.ceil(Math.max(...d.widths.map(w => Math.max(...d.bins(w)))) / 2) * 2;
  });

  const DISP = {
    table: { name: 'Table', best: 'A table gives the exact count for each value.', hides: 'It is hard to see the shape or the gaps at a glance.' },
    dot: { name: 'Dot plot', best: 'A dot plot shows every value, so you can spot gaps, clusters and outliers.', hides: 'It gets crowded when there are many different values.' },
    stem: { name: 'Stem-and-leaf plot', best: 'A stem-and-leaf plot keeps every value and shows the shape. It works when the values are many different numbers.', hides: 'It is hard to read when the data is huge or when the values have many digits.' },
    hist: { name: 'Histogram', best: 'A histogram shows the shape of the data, even for hundreds of values.', hides: 'It hides the exact values, and the bin width changes the picture.' },
    box: { name: 'Box plot', best: 'A box plot shows the median and the quartiles. Two box plots are easy to compare side by side.', hides: 'It hides the individual values, the gaps and the shape.' }
  };
  const KINDS = ['table', 'dot', 'stem', 'hist', 'box'];

  /* ---------- choose the display ---------- */
  const MS = [
    { text: 'The 18 quiz scores run from 6 to 19. You want one dot for each student so you can see where the scores bunch up and whether any score is missing in between.', best: 'dot',
      why: { table: 'A table lists counts, but you have to read every row to find a gap. The question asks for one dot per student.',
        dot: 'A dot plot puts one dot for each student on a number line. Clumps and gaps show up right away.',
        stem: 'A stem-and-leaf plot also keeps every value, but it is written with digits. The question asks for one dot for each student.',
        hist: 'A histogram groups the students into bars. You would lose the one dot for each student.',
        box: 'A box plot hides the individual scores. It cannot show a gap.' },
      reasons: [
        { t: 'It shows every value, so gaps and clumps are easy to see.', ok: true, why: 'Because every value is a dot, an empty stretch on the line is a gap.' },
        { t: 'It always shows the median as a line.', ok: false, why: 'A box plot shows the median. A dot plot does not draw it. The reason for a dot plot is that it shows every value.' },
        { t: 'It adds up all the scores for you.', ok: false, why: 'No display adds the values. The reason for a dot plot is that every value stays visible.' }] },
    { text: 'Class A and Class B took the same quiz. You want to compare the middle score of each class and how spread out the middle half of each class is. You want a small picture that can sit right above the other one.', best: 'box',
      why: { table: 'Two tables would give exact counts, but you would have to work out the middle and the spread yourself.',
        dot: 'Two dot plots show everything, but the middle and the middle half are not marked. You would have to find them by counting.',
        stem: 'Two stem-and-leaf plots keep every score, but you would still have to count to find the middle of each class.',
        hist: 'Histograms show the shape well, but they do not mark the median or the quartiles.',
        box: 'A box plot marks the median and the quartiles, so you can compare the middle and the spread of two classes at a glance.' },
      reasons: [
        { t: 'It shows each class\'s median and middle half, and it is small enough to stack.', ok: true, why: 'The line in the box is the median, and the box holds the middle half of the scores.' },
        { t: 'It shows every score, so nothing is hidden.', ok: false, why: 'This is backwards. A box plot hides the individual scores. That is what makes it small and easy to compare.' },
        { t: 'It shows the exact count for each score.', ok: false, why: 'A table shows exact counts. A box plot shows five summary numbers only.' }] },
    { text: 'A survey asks 300 people their age, from 2 to 85. You want to see the overall shape: where most people are, and whether the data stretches out to one side. There are too many people to plot one by one.', best: 'hist',
      why: { table: 'A table with 84 different ages would be very long. It would not show the shape.',
        dot: 'With 300 people you would need 300 dots. It would be crowded and slow to build.',
        stem: 'A stem-and-leaf plot writes every one of the 300 values. That is far too many to read.',
        hist: 'A histogram groups ages into bins, so 300 values become a few bars. The bars show where most people are and which side has the tail.',
        box: 'A box plot shows the middle half, but it does not show the shape, such as humps or a tail.' },
      reasons: [
        { t: 'It groups the values into bins, so the shape is clear even with many values.', ok: true, why: 'Bins turn 300 values into a few bars, and the bar heights show the shape.' },
        { t: 'It shows each person\'s exact age.', ok: false, why: 'A histogram hides exact values. The bars only count how many fall in each bin.' },
        { t: 'It marks the median with a line.', ok: false, why: 'That is a box plot. A histogram is chosen because it shows the shape.' }] },
    { text: 'The gym teacher needs the exact number of students for each shoe size, written in a list, so she can order the right number of pairs.', best: 'table',
      why: { table: 'A table gives an exact count for each shoe size. That is what she needs to read.',
        dot: 'A dot plot would show the counts as dots. She would have to count dots, and a mistake is easy.',
        stem: 'A stem-and-leaf plot lists the values, but she would still have to count the leaves.',
        hist: 'A histogram groups sizes into bins, so she would lose the exact count for each size.',
        box: 'A box plot does not show how many students wear each size.' },
      reasons: [
        { t: 'It lists the exact count for each value.', ok: true, why: 'When you need exact numbers, a table gives them to you directly.' },
        { t: 'It shows the shape of the data best.', ok: false, why: 'A histogram or a dot plot shows shape better. A table is for exact numbers.' },
        { t: 'It shows the median and the quartiles.', ok: false, why: 'A table of counts does not mark them. A box plot does.' }] },
    { text: 'A teacher has 25 test scores between 50 and 99. She wants to show the shape of the scores and still let everyone read each real score. She will write it by hand with no graph paper.', best: 'stem',
      why: { table: 'A table lists exact counts but it is not a picture of the shape.',
        dot: 'A dot plot needs a long number line with 50 places, and you cannot read a score off a dot except by its position.',
        stem: 'In a stem-and-leaf plot each score is written as a stem and a leaf. You can read every score, and the rows make the shape of a sideways histogram.',
        hist: 'A histogram shows the shape, but the bars hide the real scores.',
        box: 'A box plot hides the real scores.' },
      reasons: [
        { t: 'It keeps every score as digits and the rows also show the shape.', ok: true, why: 'Each leaf is a real digit from a real score, and the row lengths make a shape.' },
        { t: 'It groups the scores into bins and hides the exact values.', ok: false, why: 'That describes a histogram. A stem-and-leaf plot keeps the exact values.' },
        { t: 'It only shows the smallest and largest score.', ok: false, why: 'A box plot shows extremes. A stem-and-leaf plot lists all 25 scores.' }] }
  ];

  /* ---------- read a display ---------- */
  const RS = [
    { ds: 0, disp: 'dot', wi: 0, q: 'What shoe size do the sixth graders in Room 12 wear? (16 students)',
      opts: [
        { t: 'Every sixth grader in the world wears a size between 6 and 8.', ok: false, why: 'This claims too much. The dots are only 16 students in one room. They cannot tell you about every sixth grader.' },
        { t: 'Most of these 16 students (11) wear sizes 6 to 8. One student wears size 13, far above the rest.', ok: true, why: 'The stacks at 6, 7 and 8 hold 3 + 4 + 4 = 11 students. The answer talks about these 16 students and mentions the variability, including the outlier at 13.' },
        { t: 'The most common size is 4, because the tallest stack has 4 dots.', ok: false, why: 'The number of dots tells you how many students, not the size. The tallest stacks are at sizes 7 and 8.' }] },
    { ds: 1, disp: 'hist', wi: 1, q: 'How long do the students in Ms. Ortiz\'s class read at night? (20 students, bins of width 10 minutes)',
      opts: [
        { t: 'Five students read exactly 30 minutes, because the bar from 30 to 39 is 5 tall.', ok: false, why: 'A bar counts everyone in the bin. Those 5 students read between 30 and 39 minutes, and a histogram does not show which exact minute.' },
        { t: 'All sixth graders read between 20 and 39 minutes a night.', ok: false, why: 'This claims too much. The bars show 20 students in one class, and only 10 of them read 20 to 39 minutes.' },
        { t: 'Half of these 20 students (10) read 20 to 39 minutes. Only 1 read less than 10 minutes, and only 2 read 50 minutes or more.', ok: true, why: 'The bars for 20 to 29 and 30 to 39 hold 5 + 5 = 10 students. The first bar holds 1 and the last two bars hold 1 + 1 = 2. The answer is about this class and says how the values vary.' }] },
    { ds: 2, disp: 'hist', wi: 0, q: 'How did the 18 students do on the quiz, scored out of 20? (bins of width 2)',
      opts: [
        { t: 'The scores fall in two groups. 12 students scored 12 or less, and 6 scored 17 or more. No one scored 14 or 15. One average would hide that.', ok: true, why: 'The first four bars hold 2 + 3 + 4 + 3 = 12 students, and the last two bars hold 2 + 4 = 6. The bar for 14 to 15 is empty. The answer reports the variability instead of one number.' },
        { t: 'Everybody in the class scored about the same, near 12.', ok: false, why: 'The scores are spread from 6 to 19 in two groups. Saying everyone is near 12 ignores the variability.' },
        { t: 'The most common score is 4, because the tallest bars are 4 tall.', ok: false, why: 'A bar\'s height is the number of students, not the score. The tallest bars are the ones for 10 to 11 and 18 to 19 points.' }] }
  ];

  /* ---------- tiny sketches for the "choose a display" screen ---------- */
  const mini = (c, p, kind, x, y, w, hh, col) => {
    const pal = p.pal;
    c.save(); c.lineWidth = 1.6; c.strokeStyle = col; c.fillStyle = alpha(col, .5);
    if (kind === 'table') {
      for (let i = 0; i < 4; i++) seg(c, x, y + hh * i / 3, x + w, y + hh * i / 3, col, 1.6);
      seg(c, x, y, x, y + hh, col, 1.6); seg(c, x + w * .5, y, x + w * .5, y + hh, col, 1.6); seg(c, x + w, y, x + w, y + hh, col, 1.6);
    } else if (kind === 'dot') {
      seg(c, x, y + hh, x + w, y + hh, col, 1.6);
      [[.2, 2], [.4, 4], [.6, 3], [.8, 1]].forEach(([fx, k]) => { for (let i = 0; i < k; i++) { c.beginPath(); c.arc(x + w * fx, y + hh - 4 - i * 7, 2.8, 0, TAU); c.fillStyle = col; c.fill(); } });
    } else if (kind === 'stem') {
      seg(c, x + w * .3, y, x + w * .3, y + hh, col, 1.6);
      [[.9], [.7], [.5], [.3]].forEach(([f], i) => { const yy = y + 4 + i * (hh - 8) / 3; for (let k = 0; k < [3, 5, 4, 2][i]; k++) { c.beginPath(); c.arc(x + w * .4 + k * 7, yy, 1.8, 0, TAU); c.fillStyle = col; c.fill(); } seg(c, x + 2, yy, x + w * .22, yy, col, 1.6); });
    } else if (kind === 'hist') {
      seg(c, x, y + hh, x + w, y + hh, col, 1.6);
      [.35, .7, 1, .55, .25].forEach((f, i) => { const bw = w / 5; c.fillRect(x + i * bw, y + hh - f * hh, bw, f * hh); c.strokeRect(x + i * bw, y + hh - f * hh, bw, f * hh); });
    } else {
      const m = y + hh / 2; seg(c, x + 2, m, x + w - 2, m, col, 1.6); seg(c, x + 2, m - 6, x + 2, m + 6, col, 1.6); seg(c, x + w - 2, m - 6, x + w - 2, m + 6, col, 1.6);
      c.fillRect(x + w * .25, m - hh * .3, w * .45, hh * .6); c.strokeRect(x + w * .25, m - hh * .3, w * .45, hh * .6); seg(c, x + w * .5, m - hh * .3, x + w * .5, m + hh * .3, pal.violet, 2.4);
    }
    c.restore();
  };

  /* ---------- checks for the built displays ---------- */
  const keyCount = (o, v) => o[v] || 0;

  register({
    id: 'statistical-questions-and-data-displays', level: 'school',
    title: 'Statistical questions and data displays',
    blurb: 'Sort statistical questions, build a dot plot and a histogram from real-feeling data, and pick the display that answers the question.',
    thumb(c, p) {
      const pal = p.pal, cnt = {}; p.cx = 9; p.cy = 2.4; p.span = 5.4;
      p.path([[4, 0], [14, 0]], { stroke: pal['grid-strong'], width: 1.6 });
      DS[0].v.forEach(x => { const l = cnt[x] = (cnt[x] || 0) + 1; p.dot(x, .5 + (l - 1) * 1.0, 4.4, alpha(pal.blue, .88), pal.stage, 1); });
      p.path([[5, -1.3], [13, -1.3]], { stroke: pal.violet, width: 2 });
      p.path([[6.5, -1.9], [8.5, -1.9], [8.5, -.8], [6.5, -.8]], { stroke: pal.violet, width: 2, close: true });
      p.path([[7.5, -1.9], [7.5, -.8]], { stroke: pal.violet, width: 2.4 });
    },
    hook: 'Twenty students answer "How long do you read at night?" with twenty different numbers. How can one picture tell the story of all of them?',
    steps: [
      { title: 'A question that expects variety',
        text: String.raw`<p>The canvas shows <b>How tall are the students in my class?</b> A <b>statistical question</b> is one you answer with data, and the data will <b>vary</b>: different students give different answers.</p><p>Tap <b>Statistical</b> or <b>Not statistical</b>. Then sort all 8 questions. For each statistical one, say if the data is numbers or categories.</p>`,
        set: { mode: 'sort', q: 0 } },
      { title: 'Build a dot plot',
        text: String.raw`<p>These are the shoe sizes of 16 students, in the order they were collected. Build a <b>dot plot</b>: tap above a size on the number line to add one dot. Tap a stack to remove its top dot.</p><p>When you have 16 dots, press <b>Check my dot plot</b>. It tells you which stacks are wrong and why.</p>`,
        set: { mode: 'build', ds: 0, disp: 'dot' } },
      { title: 'Build a histogram',
        text: String.raw`<p>Now the reading minutes of 20 students. A <b>histogram</b> counts the values in <b>bins</b>. The bin width is 10, so the first bar counts values from 0 up to, but not including, 10.</p><p>Drag the top of each bar to the number of students in its bin. Then change the bin width and try the other displays of the same data.</p>`,
        set: { mode: 'build', ds: 1, disp: 'hist', bw: 1 } },
      { title: 'Choose a display, then read it',
        text: String.raw`<p>Different questions need different displays. The canvas shows a question. Pick the display that helps most, then pick the reason.</p><p>When you are done, press <b>Read</b> at the top of the panel. Choose the one sentence that answers the question without claiming too much.</p>`,
        set: { mode: 'match', m: 0 } }
    ],
    formal: String.raw`
      <h3>Statistical questions</h3>
      <p>A <b>statistical question</b> expects the answers to <b>vary</b>, so you need a data set to answer it. "How many students are in my school today?" has one answer. "How tall are the students in my class?" has a different answer for every student.</p>
      <p>A statistical question can also <b>compare groups</b>, such as sixth graders and seventh graders. The data may be <b>categorical</b> (labels such as dog, cat or bus) or <b>numerical</b> (counts or measurements such as minutes or centimeters). The answer must account for the variability. It can not be one student's number.</p>
      <h3>Five ways to display data</h3>
      <p>A <b>table</b> gives exact counts. A <b>dot plot</b> puts one dot per value on a number line, so every value stays visible. A <b>stem-and-leaf plot</b> splits each value into a stem (the leading digits) and a leaf (the last digit), so the rows also show the shape. A <b>histogram</b> counts the values in equal-width bins. A <b>box plot</b> draws five numbers: the minimum, the first quartile \(Q_1\), the median, the third quartile \(Q_3\) and the maximum.</p>
      <h3>How a histogram counts</h3>
      <p>A bin from \(a\) to \(b\) holds the values with \(a \le x &lt; b\). A value on the edge goes in the bin to its right. Changing the bin width changes the picture, so try more than one. The bars always add up to the number of values.</p>
      <h3>The five numbers of a box plot</h3>
      <p>Sort the values. The median is the middle value, or the mean of the two middle values. \(Q_1\) is the median of the lower half and \(Q_3\) is the median of the upper half. The box runs from \(Q_1\) to \(Q_3\), so it holds about half of the values. The spread of that middle half is
      \[ \text{IQR} = Q_3 - Q_1. \]
      For the 16 shoe sizes, the median is \(7.5\), \(Q_1 = 6.5\) and \(Q_3 = 8.5\), so the IQR is \(2\).</p>
      <h3>Telling the story</h3>
      <p>Pick the display that fits the question: exact counts need a table, gaps and outliers need a dot plot, shape needs a histogram, and comparing middles needs box plots. Then answer in a sentence that is about <b>your data</b>, mentions the variability, and does not claim more than the data can support. Sixteen students in one room tell you about those 16 students. They do not prove anything about every student.</p>`,
    check: [
      { q: 'Which of these is a statistical question?',
        choices: ['How many minutes did Sam read last night?', 'How long is the lunch period at Oak School?', 'How many minutes do sixth graders at Oak School read each night?', 'How many sixth graders are at Oak School today?'], answer: 2,
        why: 'Different students read for different lengths of time, so you expect different answers. That variability is what makes it statistical. The other three each have one answer: one person, one lunch period, one count.',
        hint: 'Ask: would different people give different answers?' },
      { q: 'A histogram of 20 students\' reading minutes has bins of width 10 minutes. From left to right the bars show: 0 to 9 minutes: 2 students, 10 to 19: 3, 20 to 29: 6, 30 to 39: 5, 40 to 49: 3, 50 to 59: 1. Which statement does the histogram support?',
        choices: ['Most of these 20 students (14) read 20 to 49 minutes.', 'The most common reading time is 6 minutes, because the tallest bar is 6 tall.', 'Every sixth grader reads 20 to 29 minutes a night.', 'Exactly 6 students read 25 minutes.'], answer: 0,
        why: String.raw`The bars for 20 to 29, 30 to 39 and 40 to 49 hold \(6+5+3=14\) of the 20 students. The height of a bar is a count of students, not a number of minutes. A bar also hides the exact values, and 20 students cannot speak for every sixth grader.`,
        hint: 'A bar\'s height counts students. Add the bars you need.' }
    ],
    links: { related: ['mean-median-and-spread', 'scatter-plots-and-lines-of-fit', 'samples-and-populations'] },

    mount({ stage, controls: C }) {
      const st = {
        mode: 'sort',
        sq: { i: 0, a1: null, a2: null, first: {}, firstK: {}, fb: '' },
        ds: 0, disp: 'dot', split: false, showDots: false,
        bw: [1, 1, 1],
        dots: DS.map(() => ({})),
        hb: DS.map(d => d.widths.map(w => Array(d.nb(w)).fill(0))),
        bfb: '',
        m: { i: 0, pick: null, stage: 'pick', rpick: null, fb: '', solved: {} },
        r: { i: 0, pick: null, done: false, fb: '', solved: {} }
      };
      const lay = {};
      const P = new Plane(stage, { span: 6 });
      const ds = () => DS[st.ds];
      const cap = () => ds().maxc + 2;
      const barsNow = () => st.hb[st.ds][st.bw[st.ds]];
      const dotsOK = i => { const t = DS[i].tc, d = st.dots[i]; return Object.keys(t).every(k => keyCount(d, k) === t[k]) && Object.keys(d).every(k => keyCount(t, k) === d[k] || !d[k]); };
      const histOK = (i, wi) => { const tr = DS[i].bins(DS[i].widths[wi]), b = st.hb[i][wi]; return tr.every((x, k) => x === b[k]); };

      /* ---------- displays (all draw into a rectangle R) ---------- */
      const drawDot = (c, p, i, R, counts, o = {}) => {
        const d = DS[i], pal = p.pal, nc = (d.dhi - d.dlo) / d.step, x0 = R.x + 16, x1 = R.x + R.w - 16, colw = (x1 - x0) / nc;
        const axY = R.y + R.h - 36, avail = axY - R.y - 6, capn = d.maxc + 2;
        const r = clamp(Math.min(colw * .42, avail / capn / 2.1), 3, 22), fs = clamp(colw * .5, 10.5, 14);
        seg(c, x0 - 8, axY, x1 + 8, axY, pal['grid-strong'], 2);
        const every = colw < 24 ? 2 : 1;
        for (let k = 0; k <= nc; k++) {
          const v = d.dlo + k * d.step, x = x0 + k * colw;
          seg(c, x, axY, x, axY + 5, pal['grid-strong'], 1.5);
          if (k % every === 0) T(c, p, String(v), x, axY + 17, { size: fs, color: pal.muted, halo: false });
        }
        T(c, p, d.unit, (x0 + x1) / 2, axY + 31, { size: 12, color: pal.muted, halo: false, weight: 500 });
        for (let k = 0; k <= nc; k++) {
          const v = d.dlo + k * d.step, n = counts[v] || 0;
          for (let j = 0; j < n; j++) { c.beginPath(); c.arc(x0 + k * colw, axY - r * 1.2 - j * 2.1 * r, r, 0, TAU); c.fillStyle = alpha(pal.blue, .88); c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 1.5; c.stroke(); }
        }
        if (o.live) Object.assign(lay, { dot: { x0, x1, colw, nc, axY, r, top: R.y } });
      };

      const drawHist = (c, p, i, R, wi, bars, o = {}) => {
        const d = DS[i], pal = p.pal, w = d.widths[wi], nb = d.nb(w), x0 = R.x + 32, x1 = R.x + R.w - 10, bwp = (x1 - x0) / nb;
        const axY = R.y + R.h - 36, top = R.y + 26, plotH = axY - top, ym = o.ymax || d.ymax, fs = clamp(bwp * .5, 10.5, 13);
        for (let g = 0; g <= ym; g += 2) {
          const y = axY - g / ym * plotH;
          if (g) seg(c, x0, y, x1, y, pal.grid, 1);
          T(c, p, String(g), x0 - 8, y, { size: 11.5, color: pal.muted, align: 'right', halo: false });
        }
        T(c, p, d.plural, x0 - 26, top - 16, { size: 11.5, color: pal.muted, align: 'left', halo: false, weight: 500 });
        const good = o.good;
        bars.forEach((n, b) => {
          if (n > 0) {
            const hgt = n / ym * plotH;
            c.fillStyle = alpha(pal.blue, .6); c.fillRect(x0 + b * bwp, axY - hgt, bwp, hgt);
            c.strokeStyle = good ? pal.green : pal.blue; c.lineWidth = 2; c.strokeRect(x0 + b * bwp, axY - hgt, bwp, hgt);
            T(c, p, String(n), x0 + (b + .5) * bwp, axY - hgt - (o.live ? 20 : 9), { size: 12.5, color: pal.text, halo: true });
          }
        });
        seg(c, x0, axY, x1, axY, pal['grid-strong'], 2);
        const every = bwp < 26 ? 2 : 1;
        for (let b = 0; b <= nb; b++) {
          const x = x0 + b * bwp; seg(c, x, axY, x, axY + 5, pal['grid-strong'], 1.5);
          if (b % every === 0) T(c, p, String(d.hlo + b * w), x, axY + 17, { size: fs, color: pal.muted, halo: false });
        }
        T(c, p, d.unit + ' (bin width ' + w + ')', (x0 + x1) / 2, axY + 31, { size: 12, color: pal.muted, halo: false, weight: 500 });
        if (o.live) {
          bars.forEach((n, b) => {
            const cx = x0 + (b + .5) * bwp, cy = axY - n / ym * plotH;
            c.beginPath(); c.arc(cx, cy, 6.5, 0, TAU); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.brass; c.lineWidth = 2.5; c.stroke();
          });
          Object.assign(lay, { hist: { x0, x1, bwp, nb, axY, top, plotH, ymax: ym } });
        }
      };

      const drawStem = (c, p, i, R, split) => {
        const d = DS[i], pal = p.pal, s = sortN(d.v), s0 = Math.floor(s[0] / 10), s1 = Math.floor(s[s.length - 1] / 10);
        const rows = [];
        for (let k = s0; k <= s1; k++) {
          if (split) { rows.push({ stem: k, lo: true, ls: s.filter(x => Math.floor(x / 10) === k && x % 10 < 5) }); rows.push({ stem: k, lo: false, ls: s.filter(x => Math.floor(x / 10) === k && x % 10 >= 5) }); }
          else rows.push({ stem: k, ls: s.filter(x => Math.floor(x / 10) === k) });
        }
        const rh = clamp((R.h - 34) / rows.length, 15, 46), fs = clamp(rh * .62, 11, 26), sx = R.x + 40, lw = clamp(fs * 1.05, 11, 30);
        const y0 = R.y + 8;
        seg(c, sx, y0, sx, y0 + rows.length * rh, pal['grid-strong'], 2);
        rows.forEach((r, k) => {
          const y = y0 + (k + .5) * rh;
          T(c, p, String(r.stem), sx - 12, y, { size: fs, align: 'right', weight: 700 });
          if (split) T(c, p, r.lo ? '0-4' : '5-9', sx - 26, y, { size: 10.5, align: 'right', color: pal.muted, halo: false, weight: 500 });
          r.ls.forEach((x, j) => T(c, p, String(x % 10), sx + 12 + j * lw, y, { size: fs, color: pal.blue, weight: 700, halo: false }));
        });
        const ky = y0 + rows.length * rh + 18, ex = s[s.length - 1];
        T(c, p, `Key: ${Math.floor(ex / 10)} | ${ex % 10} means ${ex}`, R.x + 4, ky, { size: 12.5, align: 'left', color: pal.muted, halo: false });
      };

      const drawBox = (c, p, i, R, dots) => {
        const d = DS[i], pal = p.pal, f = d.f, x0 = R.x + 20, x1 = R.x + R.w - 20, ax = v => x0 + (v - d.dlo) / (d.dhi - d.dlo) * (x1 - x0);
        const axY = R.y + R.h - 36, bh = clamp(R.h * .16, 28, 70), yc = R.y + R.h * .36, fs = 12.5;
        seg(c, x0 - 8, axY, x1 + 8, axY, pal['grid-strong'], 2);
        for (let v = d.dlo; v <= d.dhi + 1e-9; v += d.boxTick) { seg(c, ax(v), axY, ax(v), axY + 5, pal['grid-strong'], 1.5); T(c, p, String(v), ax(v), axY + 17, { size: fs, color: pal.muted, halo: false }); }
        T(c, p, d.unit, (x0 + x1) / 2, axY + 31, { size: 12, color: pal.muted, halo: false, weight: 500 });
        if (dots) {
          const cnt = {}, r = 4.6;
          d.v.forEach(v => { const l = cnt[v] = (cnt[v] || 0) + 1; c.beginPath(); c.arc(ax(v), axY - 8 - (l - 1) * 10, r, 0, TAU); c.fillStyle = alpha(pal.blue, .85); c.fill(); });
        }
        seg(c, ax(f.min), yc, ax(f.q1), yc, pal.blue, 2.5); seg(c, ax(f.q3), yc, ax(f.max), yc, pal.blue, 2.5);
        seg(c, ax(f.min), yc - bh * .3, ax(f.min), yc + bh * .3, pal.blue, 2.5); seg(c, ax(f.max), yc - bh * .3, ax(f.max), yc + bh * .3, pal.blue, 2.5);
        c.fillStyle = alpha(pal.blue, .22); c.fillRect(ax(f.q1), yc - bh / 2, ax(f.q3) - ax(f.q1), bh);
        c.strokeStyle = pal.blue; c.lineWidth = 2.5; c.strokeRect(ax(f.q1), yc - bh / 2, ax(f.q3) - ax(f.q1), bh);
        seg(c, ax(f.med), yc - bh / 2, ax(f.med), yc + bh / 2, pal.violet, 4);
        T(c, p, String(f.min), ax(f.min), yc + bh / 2 + 12, { size: fs, color: pal.muted });
        T(c, p, String(f.max), ax(f.max), yc + bh / 2 + 12, { size: fs, color: pal.muted });
        T(c, p, String(f.q1), ax(f.q1), yc - bh / 2 - 11, { size: fs });
        T(c, p, String(f.q3), ax(f.q3), yc - bh / 2 - 11, { size: fs });
        T(c, p, 'median ' + num(f.med), ax(f.med), yc + bh / 2 + 12, { size: fs, color: pal.violet });
      };

      const drawTable = (c, p, i, R) => {
        const d = DS[i], pal = p.pal, vals = Object.keys(d.tc).map(Number).sort((a, b) => a - b), rh = clamp((R.h - 50) / (vals.length + 2), 16, 28), fs = clamp(rh * .55, 11, 16);
        const xV = R.x + 46, xC = R.x + 124, xT = R.x + 166, y0 = R.y + 6;
        T(c, p, d.unit, xV, y0 + rh / 2, { size: fs, weight: 700, align: 'center' }); T(c, p, 'count', xC, y0 + rh / 2, { size: fs, weight: 700 }); T(c, p, 'tally', xT, y0 + rh / 2, { size: fs, weight: 700, align: 'left' });
        seg(c, R.x, y0 + rh, R.x + Math.min(R.w, 300), y0 + rh, pal['grid-strong'], 2);
        vals.forEach((v, k) => {
          const y = y0 + (k + 1.5) * rh;
          T(c, p, String(v), xV, y, { size: fs, halo: false }); T(c, p, String(d.tc[v]), xC, y, { size: fs, halo: false, color: pal.blue, weight: 700 });
          for (let j = 0; j < d.tc[v]; j++) { c.fillStyle = alpha(pal.blue, .8); c.fillRect(xT + j * (fs * .8 + 3), y - fs * .4, fs * .8, fs * .8); }
          if (k) seg(c, R.x, y - rh / 2, R.x + Math.min(R.w, 300), y - rh / 2, pal.grid, 1);
        });
        const yt = y0 + (vals.length + 1.5) * rh + 4;
        T(c, p, `Total: ${d.n} ${d.plural}`, R.x + 4, yt, { size: fs, align: 'left', color: pal.muted, halo: false });
      };

      /* ---------- scenes ---------- */
      const PAD = 14;
      const sceneSort = (c, p) => {
        const W = p.w, pal = p.pal, s = st.sq, q = QS[s.i], fs = clamp(W * .036, 13, 16);
        T(c, p, `Question ${s.i + 1} of ${QS.length}`, PAD, 20, { size: fs, align: 'left', color: pal.muted, halo: false });
        for (let k = 0; k < QS.length; k++) {
          const f = s.first[k], col = f === undefined ? pal.grid : f ? pal.green : pal.red;
          c.beginPath(); c.arc(W - PAD - 6 - (QS.length - 1 - k) * 18, 20, 5.5, 0, TAU); c.fillStyle = k === s.i ? pal.brass : col; c.fill();
          if (k === s.i && f !== undefined) { c.beginPath(); c.arc(W - PAD - 6 - (QS.length - 1 - k) * 18, 20, 2.5, 0, TAU); c.fillStyle = col; c.fill(); }
        }
        const qs = clamp(W * .06, 19, 30), lines = wrap(c, q.q, qs, W - 2 * PAD - 36, 700), ch = lines.length * qs * 1.3 + 36;
        rr(c, PAD, 40, W - 2 * PAD, ch, 10); c.fillStyle = alpha(pal.blue, .07); c.fill(); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.stroke();
        lines.forEach((l, k) => T(c, p, l, W / 2, 40 + 18 + (k + .5) * qs * 1.3, { size: qs, weight: 700, halo: false }));
        let y = 40 + ch + 28;
        if (s.a1 === null) {
          const hl = wrap(c, 'Would different people give different answers to this question?', fs + 2, W - 2 * PAD, 600);
          hl.forEach((l, k) => T(c, p, l, W / 2, y + k * (fs + 8), { size: fs + 2, color: pal.muted, halo: false }));
          return;
        }
        T(c, p, 'Imagine asking 6 different people:', PAD, y, { size: fs, align: 'left', color: pal.muted, halo: false });
        y += 28;
        const cs = fs + 2; let x = PAD, rowY = y;
        q.ans.forEach(a => {
          const w = tw(c, a, cs, 700) + 22;
          if (x + w > W - PAD) { x = PAD; rowY += cs + 20; }
          rr(c, x, rowY - (cs + 10) / 2, w, cs + 10, 8); c.fillStyle = alpha(pal.blue, .14); c.fill(); c.strokeStyle = pal.blue; c.lineWidth = 1.5; c.stroke();
          T(c, p, a, x + w / 2, rowY, { size: cs, weight: 700, halo: false });
          x += w + 8;
        });
        y = rowY + cs + 26;
        const dist = new Set(q.ans).size;
        T(c, p, dist === 1 ? 'Everyone gives the same answer.' : `${dist} different answers in 6 tries.`, PAD, y, { size: fs + 1, align: 'left', color: dist === 1 ? pal.red : pal.green, halo: false });
        y += 30;
        const tags = [];
        if (q.stat && s.a1 === true) { if (q.groups) tags.push(['compares two groups', pal.violet]); if (s.a2 === q.kind) tags.push([q.kind === 'num' ? 'numerical data (numbers)' : 'categorical data (labels)', pal.yellow]); }
        let tx = PAD;
        tags.forEach(([t, col]) => {
          const w = tw(c, t, fs, 700) + 20; if (tx + w > W - PAD) { tx = PAD; y += 32; }
          rr(c, tx, y - 13, w, 26, 13); c.fillStyle = alpha(col, .2); c.fill(); c.strokeStyle = col; c.lineWidth = 1.5; c.stroke();
          T(c, p, t, tx + w / 2, y, { size: fs, weight: 700, halo: false }); tx += w + 8;
        });
      };

      const sceneBuild = (c, p) => {
        const W = p.w, pal = p.pal, d = ds(), fs = clamp(W * .034, 12, 15);
        T(c, p, `${d.name}: ${d.who}`, PAD, 18, { size: fs + 2, align: 'left', weight: 700, halo: false });
        const dl = wrap(c, 'Data as collected: ' + d.v.join(', '), fs - .5, W - 2 * PAD, 500);
        dl.forEach((l, k) => T(c, p, l, PAD, 38 + k * (fs + 4), { size: fs - .5, align: 'left', color: pal.muted, weight: 500, halo: false }));
        const hy = 38 + dl.length * (fs + 4) + 4, R = { x: PAD - 4, y: hy, w: W - 2 * PAD + 8, h: p.h - hy - 8 };
        delete lay.dot; delete lay.hist;
        if (st.disp === 'dot') {
          drawDot(c, p, st.ds, R, st.dots[st.ds], { live: true });
          const placed = Object.values(st.dots[st.ds]).reduce((a, b) => a + b, 0);
          T(c, p, `${placed} of ${d.n} dots`, W - PAD, hy + 8, { size: fs, align: 'right', color: dotsOK(st.ds) ? pal.green : pal.muted, halo: false });
        } else if (st.disp === 'hist') drawHist(c, p, st.ds, R, st.bw[st.ds], barsNow(), { live: true, good: histOK(st.ds, st.bw[st.ds]) });
        else if (st.disp === 'stem') drawStem(c, p, st.ds, R, st.split);
        else if (st.disp === 'box') drawBox(c, p, st.ds, R, st.showDots);
        else drawTable(c, p, st.ds, R);
      };

      const sceneMatch = (c, p) => {
        const W = p.w, pal = p.pal, m = st.m, sc = MS[m.i], fs = clamp(W * .036, 13, 16);
        T(c, p, `Question ${m.i + 1} of ${MS.length}`, PAD, 20, { size: fs, align: 'left', color: pal.muted, halo: false });
        const qs = clamp(W * .042, 15, 20), lines = wrap(c, sc.text, qs, W - 2 * PAD - 28, 600), ch = lines.length * qs * 1.4 + 28;
        rr(c, PAD, 38, W - 2 * PAD, ch, 10); c.fillStyle = alpha(pal.blue, .07); c.fill(); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.stroke();
        lines.forEach((l, k) => T(c, p, l, PAD + 14, 38 + 14 + (k + .5) * qs * 1.4, { size: qs, align: 'left', weight: 600, halo: false }));
        const top = 38 + ch + 30, bw = (W - 2 * PAD - 4 * 8) / 5, bh = clamp(bw * .8, 40, 70);
        T(c, p, 'Which display helps most?', PAD, top - 12, { size: fs + 1, align: 'left', color: pal.muted, halo: false });
        KINDS.forEach((k, i) => {
          const x = PAD + i * (bw + 8), y = top + 8;
          const picked = m.pick === k, right = m.stage !== 'pick' && k === sc.best;
          const col = right ? pal.green : picked ? pal.red : pal.muted;
          rr(c, x, y, bw, bh + 28, 8); c.fillStyle = alpha(col, picked || right ? .12 : .04); c.fill(); c.strokeStyle = picked || right ? col : pal['grid-strong']; c.lineWidth = picked || right ? 2.5 : 1.2; c.stroke();
          mini(c, p, k, x + bw * .14, y + 8, bw * .72, bh - 6, picked || right ? col : pal.text);
          T(c, p, k === 'stem' ? 'Stem & leaf' : k === 'hist' ? 'Histogram' : k === 'box' ? 'Box plot' : k === 'dot' ? 'Dot plot' : 'Table', x + bw / 2, y + bh + 14, { size: clamp(bw * .17, 10, 13.5), halo: false, color: picked || right ? col : pal.text });
        });
      };

      const sceneRead = (c, p) => {
        const W = p.w, pal = p.pal, r = st.r, sc = RS[r.i], d = DS[sc.ds], fs = clamp(W * .036, 13, 16);
        T(c, p, `Display ${r.i + 1} of ${RS.length}`, PAD, 20, { size: fs, align: 'left', color: pal.muted, halo: false });
        const qs = clamp(W * .042, 15, 19), lines = wrap(c, sc.q, qs, W - 2 * PAD, 700);
        lines.forEach((l, k) => T(c, p, l, PAD, 44 + k * qs * 1.35, { size: qs, align: 'left', weight: 700, halo: false }));
        const hy = 44 + lines.length * qs * 1.35 + 4, R = { x: PAD - 4, y: hy, w: W - 2 * PAD + 8, h: p.h - hy - 8 };
        if (sc.disp === 'dot') drawDot(c, p, sc.ds, R, d.tc);
        else { const bb = d.bins(d.widths[sc.wi]); drawHist(c, p, sc.ds, R, sc.wi, bb, { ymax: Math.max(4, Math.ceil(Math.max(...bb) / 2) * 2 + 2) }); }
      };

      P.onDraw = (c, p) => { if (st.mode === 'sort') sceneSort(c, p); else if (st.mode === 'build') sceneBuild(c, p); else if (st.mode === 'match') sceneMatch(c, p); else sceneRead(c, p); };

      /* ---------- readouts ---------- */
      const sortHTML = () => {
        const s = st.sq, q = QS[s.i], out = [], done = Object.keys(s.first).length, right = Object.values(s.first).filter(Boolean).length;
        out.push(`${kk('Question')} ${s.i + 1} of ${QS.length}` + (done ? `. Right on the first try: ${right} of ${done}` : ''));
        if (s.a1 === null) out.push('Does the question expect different answers from different people? If yes, it is statistical.');
        if (s.fb) out.push(s.fb);
        return out.join('<br>');
      };
      const dotHTML = () => {
        const d = ds(), placed = Object.values(st.dots[st.ds]).reduce((a, b) => a + b, 0), out = [];
        out.push(`${kk('Dots placed')} ${placed} of ${d.n}`);
        if (dotsOK(st.ds)) out.push(`${ok('Every stack matches the data.')} ${d.feat}`);
        else if (st.bfb) out.push(st.bfb);
        else out.push('Tap above a value to add a dot. Tap a stack to remove its top dot.');
        return out.join('<br>');
      };
      const histHTML = () => {
        const d = ds(), wi = st.bw[st.ds], w = d.widths[wi], b = barsNow(), tot = b.reduce((a, x) => a + x, 0), out = [];
        out.push(`${kk('Bin width')} ${w}. ${kk('Students counted')} ${tot} of ${d.n}`);
        if (histOK(st.ds, wi)) out.push(`${ok('Every bar is right.')} ${d.histFeat[wi]}`);
        else if (st.bfb) out.push(st.bfb);
        else out.push(`Drag the top of each bar. A value on a bin's left edge belongs to that bin, so ${d.hlo + w} goes in the bin that starts at ${d.hlo + w}.`);
        return out.join('<br>');
      };
      const buildHTML = () => {
        const d = ds(), f = d.f, out = [`${kk('Display')} ${DISP[st.disp].name} of ${d.name.toLowerCase()}`];
        out.push(`<b>Shows best:</b> ${DISP[st.disp].best}`);
        out.push(`<b>Hides:</b> ${DISP[st.disp].hides}`);
        if (st.disp === 'dot') out.push(dotHTML());
        else if (st.disp === 'hist') out.push(histHTML());
        else if (st.disp === 'stem') out.push(st.split ? 'Each stem now has two rows: leaves 0 to 4, then leaves 5 to 9. Empty rows show a gap or a thin spot.' : `Each row is a stem (the tens). The leaves are the last digits, in order. There are ${d.n} leaves, one for each student. Try splitting the stems.`);
        else if (st.disp === 'box') out.push(`${kk('Five numbers')} min ${num(f.min)}, Q1 ${num(f.q1)}, median ${num(f.med)}, Q3 ${num(f.q3)}, max ${num(f.max)}<br>${kk('Middle half')} ${num(f.q1)} to ${num(f.q3)} (IQR ${num(f.q3 - f.q1)})<br>${d.boxNote}`);
        else out.push(`The counts add up to ${d.n}. This is the same data as the dot plot, written as numbers.`);
        return out.join('<br>');
      };
      const matchHTML = () => {
        const m = st.m, sc = MS[m.i], out = [];
        out.push(m.stage === 'pick' ? 'Pick the display that helps most for this question.' : m.stage === 'reason' ? `${kk('Your display')} ${DISP[m.pick].name}. Now pick the best reason.` : `${kk('Your display')} ${DISP[m.pick].name}`);
        if (m.fb) out.push(m.fb);
        return out.join('<br>');
      };
      const readHTML = () => {
        const r = st.r, out = [];
        out.push(r.done ? ok('You chose a sentence that matches the display.') : 'Choose the sentence that answers the question and does not claim more than the display shows.');
        if (r.fb) out.push(r.fb);
        return out.join('<br>');
      };
      const upd = () => { ro.innerHTML = st.mode === 'sort' ? sortHTML() : st.mode === 'build' ? buildHTML() : st.mode === 'match' ? matchHTML() : readHTML(); };

      /* ---------- controls ---------- */
      const probe = C.readout(), host = probe.parentElement; probe.remove();
      const group = build => {
        const before = new Set(host.children); build();
        const g = h('div', { style: 'display:flex;flex-direction:column;gap:16px;flex:none' });
        [...host.children].filter(e => !before.has(e)).forEach(e => g.append(e));
        host.append(g); return g;
      };
      const small = bs => bs.forEach(b => Object.assign(b.style, { padding: '6px 14px', minHeight: '36px', fontSize: '.88rem' }));
      const longBtn = bs => bs.forEach(b => Object.assign(b.style, { whiteSpace: 'normal', textAlign: 'left', height: 'auto', lineHeight: '1.35', padding: '8px 12px', minHeight: '40px', fontSize: '.88rem' }));
      let modeBtns, statBtns, kindBtns, nextQ, dsSel, dispBtns, dotBtns, histBtns, bwS, splitT, dotsT, matchBtns, reasonBtns, nextM, readBtns, nextR, ro;
      const G = {}, MODES = ['sort', 'build', 'match', 'read'];

      const ROT = [0, 1, 2, 1, 2], rsn = (mi, j) => MS[mi].reasons[(j + ROT[mi]) % 3];
      const sync = () => {
        modeBtns.forEach((b, i) => { b.className = MODES[i] === st.mode ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', MODES[i] === st.mode); });
        MODES.forEach(k => { G[k].style.display = st.mode === k ? 'flex' : 'none'; });
        /* sort */
        const s = st.sq, q = QS[s.i], statDone = s.a1 === q.stat, done = statDone && (!q.stat || s.a2 === q.kind);
        statBtns.forEach((b, i) => { const on = s.a1 === (i === 0); b.className = on ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', on); });
        G.kind.style.display = statDone && q.stat ? 'flex' : 'none';
        kindBtns.forEach((b, i) => { const on = s.a2 === (i === 0 ? 'num' : 'cat'); b.className = on ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', on); });
        nextQ.style.display = done ? '' : 'none'; nextQ.textContent = s.i === QS.length - 1 ? 'Start again' : 'Next question';
        /* build */
        dsSel.value = String(st.ds);
        dispBtns.forEach((b, i) => { const on = KINDS[i] === st.disp; b.className = on ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', on); });
        G.dot.style.display = st.disp === 'dot' ? 'flex' : 'none'; G.hist.style.display = st.disp === 'hist' ? 'flex' : 'none';
        G.stem.style.display = st.disp === 'stem' ? 'flex' : 'none'; G.box.style.display = st.disp === 'box' ? 'flex' : 'none';
        bwS.set(st.bw[st.ds]); splitT.checked = st.split; dotsT.checked = st.showDots;
        /* match */
        const m = st.m, sc = MS[m.i];
        matchBtns.forEach((b, i) => { const on = m.pick === KINDS[i]; b.className = on ? 'btn primary' : 'btn'; b.disabled = m.stage !== 'pick'; b.setAttribute('aria-pressed', on); });
        G.reason.style.display = m.stage === 'reason' || m.stage === 'done' ? 'flex' : 'none';
        reasonBtns.forEach((b, i) => { b.textContent = rsn(m.i, i).t; const on = m.rpick === i; b.className = on ? 'btn primary' : 'btn'; b.disabled = m.stage === 'done' && !rsn(m.i, i).ok; });
        nextM.style.display = m.stage === 'done' ? '' : 'none';
        /* read */
        const r = st.r, rs = RS[r.i];
        readBtns.forEach((b, i) => { b.textContent = rs.opts[i].t; const on = r.pick === i; b.className = on ? 'btn primary' : 'btn'; b.disabled = r.done && !rs.opts[i].ok; });
        nextR.style.display = r.done ? '' : 'none';
        P.draw(); upd();
      };

      C.title('Choose an activity');
      modeBtns = C.buttons([
        { label: 'Sort', onClick: () => { st.mode = 'sort'; sync(); } },
        { label: 'Build', onClick: () => { st.mode = 'build'; sync(); } },
        { label: 'Match', onClick: () => { st.mode = 'match'; sync(); } },
        { label: 'Read', onClick: () => { st.mode = 'read'; sync(); } }
      ]);
      small(modeBtns);

      /* ----- sort ----- */
      G.sort = group(() => {
        statBtns = C.buttons([
          { label: 'Statistical', onClick: () => pickStat(true) },
          { label: 'Not statistical', onClick: () => pickStat(false) }
        ]);
        G.kind = group(() => {
          C.hint('This one is statistical. What kind of data would you collect?');
          kindBtns = C.buttons([
            { label: 'Numbers', onClick: () => pickKind('num') },
            { label: 'Categories (labels)', onClick: () => pickKind('cat') }
          ]);
        });
        [nextQ] = C.buttons([{ label: 'Next question', primary: true, onClick: () => nextQuestion() }]);
        C.hint('A statistical question expects different answers, so you need data. Data is numerical (numbers) or categorical (labels).');
      });
      const pickStat = v => {
        const s = st.sq, q = QS[s.i];
        if (s.first[s.i] === undefined) s.first[s.i] = v === q.stat;
        s.a1 = v; s.a2 = null;
        if (v === q.stat) s.fb = ok('Right.') + ' ' + (q.stat ? q.yes + (q.groups ? '' : '') + ' Now choose the kind of data.' : q.no);
        else s.fb = no('Not quite.') + ' ' + (q.stat ? 'This one is statistical. ' + q.yes : 'This one is not statistical. ' + q.no) + ' Tap the right choice to go on.';
        sync();
      };
      const pickKind = k => {
        const s = st.sq, q = QS[s.i];
        if (s.firstK[s.i] === undefined) s.firstK[s.i] = k === q.kind;
        s.a2 = k;
        s.fb = k === q.kind ? ok('Right.') + ' ' + q.kindWhy + (q.groups ? ' The question also compares two groups, so you collect data from each group.' : '') : no('Not quite.') + ' ' + q.kindWhy + ' Tap the right choice.';
        sync();
      };
      const nextQuestion = () => {
        const s = st.sq;
        if (s.i === QS.length - 1) { st.sq = { i: 0, a1: null, a2: null, first: {}, firstK: {}, fb: '' }; }
        else { s.i++; s.a1 = null; s.a2 = null; s.fb = ''; }
        sync();
      };

      /* ----- build ----- */
      G.build = group(() => {
        dsSel = C.select({ label: 'Data set', value: '0', options: DS.map((d, i) => ({ value: String(i), label: d.name })), onChange: v => { st.ds = +v; st.bfb = ''; sync(); } });
        dispBtns = C.buttons(KINDS.map(k => ({ label: k === 'stem' ? 'Stem and leaf' : DISP[k].name, onClick: () => { st.disp = k; st.bfb = ''; sync(); } })));
        small(dispBtns);
        G.dot = group(() => {
          dotBtns = C.buttons([
            { label: 'Check my dot plot', primary: true, onClick: () => checkDots() },
            { label: 'Fill in the dots', onClick: () => { st.dots[st.ds] = { ...ds().tc }; st.bfb = ''; sync(); } },
            { label: 'Clear', onClick: () => { st.dots[st.ds] = {}; st.bfb = ''; sync(); } }
          ]);
          small(dotBtns);
          C.hint('Tap above a value to add a dot. Tap a stack to remove its top dot. Use the data list above the plot.');
        });
        G.hist = group(() => {
          bwS = C.slider({ label: 'Bin width', min: 0, max: 2, step: 1, value: 1, format: v => String(ds().widths[Math.round(v)]), onInput: v => { st.bw[st.ds] = Math.round(v); st.bfb = ''; sync(); } });
          histBtns = C.buttons([
            { label: 'Check my histogram', primary: true, onClick: () => checkHist() },
            { label: 'Fill in the bars', onClick: () => { st.hb[st.ds][st.bw[st.ds]] = ds().bins(ds().widths[st.bw[st.ds]]); st.bfb = ''; sync(); } },
            { label: 'Clear', onClick: () => { st.hb[st.ds][st.bw[st.ds]] = barsNow().map(() => 0); st.bfb = ''; sync(); } }
          ]);
          small(histBtns);
          C.hint('Drag the ring at the top of each bar to the number of students in that bin.');
        });
        G.stem = group(() => { splitT = C.toggle({ label: 'Split each stem in two', value: false, onChange: v => { st.split = v; sync(); } }); });
        G.box = group(() => { dotsT = C.toggle({ label: 'Show the data dots (what the box hides)', value: false, onChange: v => { st.showDots = v; sync(); } }); });
      });
      const checkDots = () => {
        const d = ds(), t = d.tc, dd = st.dots[st.ds], placed = Object.values(dd).reduce((a, b) => a + b, 0), bad = [];
        new Set([...Object.keys(t), ...Object.keys(dd)]).forEach(k => { if (keyCount(t, k) !== keyCount(dd, k) && (keyCount(dd, k) || keyCount(t, k))) bad.push(+k); });
        bad.sort((a, b) => a - b);
        if (!bad.length) { st.bfb = ''; sync(); return; }
        const msgs = bad.slice(0, 2).map(v => keyCount(t, v) === 0 ? `There is no ${d.unit} ${v} in the data, so remove that dot.` : keyCount(dd, v) < keyCount(t, v) ? `At ${v} you have too few dots. Count how many times ${v} appears in the list.` : `At ${v} you have too many dots. Count how many times ${v} appears in the list.`);
        st.bfb = `${no('Not yet.')} You have ${placed} of ${d.n} dots, and ${bad.length} ${bad.length === 1 ? 'stack is' : 'stacks are'} wrong. ${msgs.join(' ')}`;
        sync();
      };
      const checkHist = () => {
        const d = ds(), wi = st.bw[st.ds], w = d.widths[wi], tr = d.bins(w), b = barsNow(), bad = [];
        tr.forEach((x, k) => { if (x !== b[k]) bad.push(k); });
        if (!bad.length) { st.bfb = ''; sync(); return; }
        const msgs = bad.slice(0, 2).map(k => { const a = d.hlo + k * w, z = a + w; return `The bar from ${a} up to ${z} is too ${b[k] < tr[k] ? 'short' : 'tall'}. Count the values that are at least ${a} and less than ${z}.`; });
        st.bfb = `${no('Not yet.')} ${bad.length} ${bad.length === 1 ? 'bar is' : 'bars are'} wrong. ${msgs.join(' ')}`;
        sync();
      };

      /* ----- match ----- */
      G.match = group(() => {
        matchBtns = C.buttons(KINDS.map(k => ({ label: k === 'stem' ? 'Stem and leaf' : DISP[k].name, onClick: () => pickDisp(k) })));
        small(matchBtns);
        G.reason = group(() => {
          C.hint('Why is that the best display? Pick the reason.');
          reasonBtns = C.buttons([0, 1, 2].map(i => ({ label: '', onClick: () => pickReason(i) })));
          longBtn(reasonBtns);
        });
        [nextM] = C.buttons([{ label: 'Next question', primary: true, onClick: () => { st.m = { ...st.m, i: (st.m.i + 1) % MS.length, pick: null, stage: 'pick', rpick: null, fb: '' }; sync(); } }]);
        C.hint('Think about what the question needs: exact counts, every value, the shape, the middle, or comparing groups.');
      });
      const pickDisp = k => {
        const m = st.m, sc = MS[m.i]; if (m.stage === 'done') return;
        m.pick = k;
        if (k === sc.best) { m.stage = 'reason'; m.fb = ok('Good choice.') + ' ' + sc.why[k]; }
        else { m.stage = 'pick'; m.fb = no('Not the best choice.') + ' ' + sc.why[k] + ' Try another display.'; }
        sync();
      };
      const pickReason = i => {
        const m = st.m, sc = MS[m.i], r = rsn(m.i, i);
        m.rpick = i;
        if (r.ok) { m.stage = 'done'; m.solved[m.i] = true; m.fb = ok('Yes.') + ' ' + r.why + ' ' + sc.why[sc.best]; }
        else m.fb = no('Not that one.') + ' ' + r.why;
        sync();
      };

      /* ----- read ----- */
      G.read = group(() => {
        readBtns = C.buttons([0, 1, 2].map(i => ({ label: '', onClick: () => pickRead(i) })));
        longBtn(readBtns);
        [nextR] = C.buttons([{ label: 'Next display', primary: true, onClick: () => { st.r = { ...st.r, i: (st.r.i + 1) % RS.length, pick: null, done: false, fb: '' }; sync(); } }]);
        C.hint('Good sentences are about this data, say how the values vary, and do not claim more than the display shows.');
      });
      const pickRead = i => {
        const r = st.r, o = RS[r.i].opts[i]; if (r.done) return;
        r.pick = i; r.done = o.ok; r.fb = (o.ok ? ok('Yes. ') : no('Not that one. ')) + o.why;
        sync();
      };

      ro = C.readout();

      /* ---------- pointer interaction ---------- */
      const cv = P.canvas;
      cv.addEventListener('pointerdown', e => {
        if (st.mode !== 'build' || st.disp !== 'dot' || !lay.dot) return;
        const r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top, L = lay.dot;
        if (py < L.top || py > L.axY + 14 || px < L.x0 - L.colw / 2 || px > L.x1 + L.colw / 2) return;
        const col = clamp(Math.round((px - L.x0) / L.colw), 0, L.nc), d = ds(), v = d.dlo + col * d.step, dd = st.dots[st.ds], n = keyCount(dd, v);
        const topY = L.axY - n * 2.1 * L.r - L.r * .1;
        if (n > 0 && py >= topY) { if (n === 1) delete dd[v]; else dd[v] = n - 1; }
        else if (n < cap()) dd[v] = n + 1;
        st.bfb = ''; sync();
      });
      draggable(P, {
        hit: (px, py) => {
          if (st.mode !== 'build') return null;
          if (st.disp === 'dot' && lay.dot) { const L = lay.dot; return py >= L.top && py <= L.axY + 14 && px >= L.x0 - L.colw / 2 && px <= L.x1 + L.colw / 2 ? 'dot' : null; }
          if (st.disp === 'hist' && lay.hist) {
            const L = lay.hist; if (px < L.x0 || px > L.x1 || py < L.top - 12 || py > L.axY + 10) return null;
            return clamp(Math.floor((px - L.x0) / L.bwp), 0, L.nb - 1);
          }
          return null;
        },
        move: (hd, x, y) => {
          if (hd === 'dot') return;
          const L = lay.hist, py = P.Y(y), v = clamp(Math.round((L.axY - py) / L.plotH * L.ymax), 0, L.ymax);
          barsNow()[hd] = v; st.bfb = ''; sync();
        }
      });

      sync();

      /* ---------- guided steps ---------- */
      const apply = (patch, immediate) => {
        const { mode, q, ds: dsi, disp, bw, m } = patch;
        if (mode !== undefined) st.mode = mode;
        if (q !== undefined) { st.sq.i = q; st.sq.a1 = null; st.sq.a2 = null; st.sq.fb = ''; }
        if (dsi !== undefined) { st.ds = dsi; st.bfb = ''; }
        if (disp !== undefined) st.disp = disp;
        if (bw !== undefined) st.bw[st.ds] = bw;
        if (m !== undefined) { st.m = { ...st.m, i: m, pick: null, stage: 'pick', rpick: null, fb: '' }; }
        sync();
      };
      return { destroy: () => { P.destroy(); }, apply };
    }
  });
}
