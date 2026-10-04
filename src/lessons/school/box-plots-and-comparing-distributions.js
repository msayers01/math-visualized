/* =====================================================================
   SCHOOL — Box plots and comparing distributions
   ===================================================================== */
{
  const MAXV = 30;
  const FONT = '"Hanken Grotesk","Helvetica Neue",Arial,sans-serif';
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const sortN = v => [...v].sort((a, b) => a - b);
  const medOf = s => { const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
  /* Quartile method of this lesson: split the sorted list into a lower and an upper half; with an odd count the middle value goes in neither. */
  const five = v => {
    const s = sortN(v), n = s.length, hf = Math.floor(n / 2);
    return { s, n, hf, min: s[0], q1: medOf(s.slice(0, hf)), med: medOf(s), q3: medOf(s.slice(n - hf)), max: s[n - 1], mean: s.reduce((a, b) => a + b, 0) / n };
  };
  const r1 = v => Math.round(v * 10) / 10;
  const meanTxt = v => (Math.abs(v - r1(v)) < 1e-9 ? '' : 'about ') + num(r1(v));
  const skewOf = S => {
    const sc = (S.q3 - S.med) - (S.med - S.q1) + .5 * ((S.max - S.q3) - (S.q1 - S.min));
    return sc >= 2 ? 'right' : sc <= -2 ? 'left' : 'sym';
  };
  const bins = (v, bw) => {
    const nb = MAXV / bw, c = Array(nb).fill(0);
    v.forEach(x => { c[clamp(Math.floor(x / bw + 1e-9), 0, nb - 1)]++; });
    return c;
  };
  const diffCount = (a, b) => { const t = {}; a.forEach(x => { t[x] = (t[x] || 0) + 1; }); let k = 0; b.forEach(x => { if (t[x]) t[x]--; else k++; }); return k; };
  const kk = t => `<span class="k">${t}</span>`;

  const S1 = [4, 7, 8, 9, 10, 11, 12, 13, 15, 16, 16];
  const CA = [5, 8, 10, 12, 13, 14, 15, 16, 18, 19, 20], CB = [9, 10, 10, 11, 11, 12, 12, 12, 13, 13, 14];
  const SK = [3, 4, 4, 5, 5, 6, 8, 10, 13, 18, 25];
  const OUT = [10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 16], OUT30 = [10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 30];
  const EV = [5, 7, 8, 9, 10, 12, 13, 15, 16, 19];
  const HUMP = [3, 4, 4, 5, 5, 5, 6, 6, 7, 21, 22, 22, 23, 23, 23, 24, 24, 25];

  /* ---------- practice problems (fixed list) ---------- */
  const PROBS = [
    { name: 'Find Q1 (odd count)', kind: 'choice', view: 'dots', A: [2, 4, 5, 7, 8, 10, 13, 15, 19], after: { view: 'build', halves: true },
      q: 'Nine scores, already sorted: 2, 4, 5, 7, 8, 10, 13, 15, 19. The median is 8. Find Q1, the median of the lower half.',
      ch: [['4.5', 'Yes. The median 8 goes in neither half. The lower half is 2, 4, 5, 7. With four values, the median is the mean of the middle two: (4 + 5) / 2 = 4.5.'],
        ['5', 'That is the median of 2, 4, 5, 7, 8, which wrongly keeps the median 8 in the lower half. The middle value belongs to neither half. Use 2, 4, 5, 7 only.'],
        ['4', 'That is just one of the values. The lower half has four values, so its median is the mean of the middle two, 4 and 5, which is 4.5.'],
        ['8', 'That is the median of the whole list. Q1 is the median of the lower half only.']], ans: 0 },
    { name: 'Five-number summary (even count)', kind: 'choice', view: 'dots', A: [6, 7, 9, 10, 12, 15, 16, 18], after: { view: 'build', halves: true },
      q: 'Eight scores, sorted: 6, 7, 9, 10, 12, 15, 16, 18. Which list shows the minimum, Q1, median, Q3 and maximum, in that order?',
      ch: [['6, 7, 10, 16, 18', 'These are single values taken from the list. With an even count the median is the mean of the middle two (10 and 12), and each half has four values, so Q1 and Q3 are means of two values too.'],
        ['6, 8, 12, 15.5, 18', 'Q1 and Q3 are right, but the median of eight values is the mean of the middle two, 10 and 12, which is 11. It is not 12.'],
        ['6, 8, 11, 15.5, 18', 'Yes. Median: (10 + 12) / 2 = 11. Lower half 6, 7, 9, 10 gives Q1 = (7 + 9) / 2 = 8. Upper half 12, 15, 16, 18 gives Q3 = (15 + 16) / 2 = 15.5.'],
        ['6, 9, 11, 16, 18', 'The median 11 is right. But Q1 and Q3 are medians of the halves, not single values. Q1 is the mean of 7 and 9, and Q3 is the mean of 15 and 16.']], ans: 2 },
    { name: 'Read the IQR', kind: 'choice', view: 'build', A: [5, 10, 12, 13, 14, 15, 16, 18, 19, 22, 26], after: { iqr: true },
      q: 'A box plot has minimum 5, Q1 12, median 15, Q3 19 and maximum 26. What is the interquartile range (IQR)?',
      ch: [['21', 'That is the range, maximum minus minimum: 26 − 5. The IQR uses only the box: Q3 − Q1.'],
        ['7', 'Yes. The IQR is the length of the box: Q3 − Q1 = 19 − 12 = 7. It measures the spread of the middle half of the scores.'],
        ['4', 'That is Q3 − median, only the right half of the box. The IQR is the whole box: 19 − 12.'],
        ['14', 'That is 19 − 5. The IQR starts at Q1, not at the minimum: 19 − 12 = 7.']], ans: 1 },
    { name: 'Move one dot: median 12', kind: 'build', view: 'build', A: [6, 8, 9, 10, 12, 13, 15],
      q: 'Seven scores: 6, 8, 9, 10, 12, 13, 15. The median is 10. Move just ONE dot so that the median becomes 12. Drag it, or use the dot buttons and the slider. Then press Check.',
      ok: (v, S) => S.med === 12 && diffCount(PROBS[3].A, v) === 1 },
    { name: 'Move one dot: mean up, median still', kind: 'build', view: 'build', A: [10, 11, 12, 13, 14], mean: true,
      q: 'Five scores: 10, 11, 12, 13, 14. The median is 12 and the mean is 12. Move just ONE dot so that the mean is at least 15 but the median is still 12. Then press Check.',
      ok: (v, S) => S.med === 12 && S.mean >= 15 && diffCount(PROBS[4].A, v) === 1 },
    { name: 'Compare two classes', kind: 'choice', view: 'compare', A: [8, 10, 11, 12, 13, 14, 15, 15, 16, 17, 20], B: [4, 6, 9, 10, 11, 14, 16, 18, 19, 21, 25], after: { iqr: true },
      q: 'Class P: minimum 8, Q1 11, median 14, Q3 16, maximum 20. Class Q: minimum 4, Q1 9, median 14, Q3 19, maximum 25. Which statement is true?',
      ch: [['Q did better, because its highest score, 25, is higher.', 'One top score is not the typical score. The medians are equal, 14, so the middle student scored the same in both classes.'],
        ['P is more consistent, because its box is longer.', 'It is the other way round. P has the shorter box (IQR 16 − 11 = 5, against 19 − 9 = 10 for Q), and a shorter box means more consistent.'],
        ['P did better, because its IQR is smaller.', 'A smaller IQR means more consistent, not higher. For "did better" compare the medians, and they are equal.'],
        ['The medians are equal, so the typical score is the same. P is more consistent: its IQR is 5 and Q\'s is 10.', 'Yes. Center: both medians are 14. Spread: P\'s box is half as long as Q\'s. Q has the highest and the lowest scores, so it is the less predictable class.']], ans: 3 },
    { name: 'Name the skew', kind: 'choice', view: 'build', A: [2, 2, 3, 3, 4, 4, 5, 7, 9, 12, 20], after: { mean: true },
      q: 'A box plot has minimum 2, Q1 3, median 4, Q3 9 and maximum 20. The mean is about 6.5. Which description fits?',
      ch: [['Skewed left: a long tail toward small values', 'The long whisker (9 to 20 on the right, against 2 to 3 on the left) points toward large values, so the tail is on the right.'],
        ['Skewed right: a long tail toward large values, and the mean is above the median', 'Yes. The median, 4, is close to Q1 and far from Q3, and the right whisker is long. The mean, about 6.5, is pulled above the median, 4, by the large values.'],
        ['Symmetric: the median is in the middle of the box', 'The median 4 is not in the middle of the box (3 to 9, middle 6). It sits near Q1, so the data is stretched toward the right.'],
        ['You cannot tell the shape from a box plot', 'A box plot does show skew. A median near one end of the box, with a long whisker on the other side, tells you the data is stretched that way.']], ans: 1 },
    { name: 'Choose a display: compare classes', kind: 'choice', view: 'three', A: S1, after: {},
      q: 'You want to compare the typical score and the spread of five classes at the same time. Which display works best?',
      ch: [['Five dot plots, one for each class', 'A dot plot shows every value, so five of them are crowded. You would have to judge the center and spread by eye.'],
        ['Five histograms', 'A histogram shows the shape well, but it does not mark the median or the quartiles, and five of them take a lot of room.'],
        ['Five box plots stacked on the same scale', 'Yes. A box plot is short and shows the median and the IQR, so boxes on one scale are quick to compare.']], ans: 2 },
    { name: 'Choose a display: the shape', kind: 'choice', view: 'three', A: HUMP, after: {},
      q: 'Eighteen students took a test. Half of them studied and half did not. You want to see whether the scores form one group or two groups. Which display shows that best?',
      ch: [['A box plot', 'Look at the box plot on the canvas: it is one plain box with the median at 14, a score nobody got. A box plot hides humps and gaps.'],
        ['A histogram (or a dot plot)', 'Yes. The histogram shows two separate humps with a gap between them. The box plot hides that, and its median, 14, is a score nobody got.'],
        ['Only the mean and median', 'The mean and median are single numbers. They cannot show whether the scores form one group or two.']], ans: 1 }
  ];

  register({
    id: 'box-plots-and-comparing-distributions', level: 'school',
    title: 'Box plots and comparing distributions',
    blurb: 'Drag the dots of a dot plot, watch the box plot build from five numbers, then compare two classes by center and spread.',
    thumb(c, p) {
      const pal = p.pal, v = [4, 7, 8, 9, 10, 11, 12, 13, 15, 16, 16]; p.fit(20, 9, { l: 1, r: 1, t: .6, b: .6 });
      p.path([[0, 4.6], [20, 4.6]], { stroke: pal['grid-strong'], width: 1.6 });
      const cnt = {};
      v.forEach(x => { const l = cnt[x] = (cnt[x] || 0) + 1; p.dot(x, 5.5 + (l - 1) * 1.2, 4, alpha(pal.blue, .85), pal.stage, 1); });
      p.path([[4, 2], [8, 2]], { stroke: pal.blue, width: 2.4 }); p.path([[15, 2], [16, 2]], { stroke: pal.blue, width: 2.4 });
      p.path([[8, 1], [15, 1], [15, 3], [8, 3]], { stroke: pal.blue, width: 2.4, fill: alpha(pal.blue, .22), close: true });
      p.path([[11, .8], [11, 3.2]], { stroke: pal.violet, width: 3.6 });
    },
    hook: String.raw`Two classes took the same quiz. Class A has the higher middle score, but Class B's scores are packed close together. Which class did better? Which one is more consistent? How can one small picture answer both?`,
    steps: [
      { title: 'Build a box plot from five numbers',
        text: String.raw`<p>These 11 quiz scores are on a dot plot. Sorted, the <b>median</b> is the middle score: \(11\). It goes in neither half. The <b>lower half</b> has 5 scores, and its median is <b>Q1</b>, \(8\). The <b>upper half</b> has 5 scores, and its median is <b>Q3</b>, \(15\).</p><p>The box runs from Q1 to Q3. The whiskers reach the smallest score, \(4\), and the largest, \(16\). Drag a dot to move the box.</p>`,
        set: { view: 'build', A: S1, halves: true, iqr: false, mean: false } },
      { title: 'The box length is the IQR',
        text: String.raw`<p>Now two classes. Class A's median is \(14\) and Class B's is \(12\), so A did better in the middle. The <b>interquartile range</b> (IQR) is the length of the box, Q3 minus Q1. A's IQR is \(8\). B's is \(3\).</p><p>B's scores are bunched together, so B is more <b>consistent</b>. Compare the centers first, then the spreads.</p>`,
        set: { view: 'compare', A: CA, B: CB, halves: false, iqr: true, mean: false } },
      { title: 'Skew: a long tail pulls the mean',
        text: String.raw`<p>This set has a long tail to the right. We call it <b>right-skewed</b>. The median, \(6\), is close to Q1, \(4\), and far from Q3, \(13\). The right whisker runs out to \(25\).</p><p>The yellow diamond is the mean, about \(9.2\). The long tail pulls it above the median. Drag the top dot left and watch the shape even out.</p>`,
        set: { view: 'build', A: SK, halves: false, iqr: false, mean: true } },
      { title: 'One outlier: mean against median',
        text: String.raw`<p>Eleven scores sit between 10 and 16. The median is \(13\), the mean is about \(12.8\), and the IQR is \(3\).</p><p>Use the <b>Predict first</b> buttons: the top score will slide to 30. Then watch. The mean jumps to about \(14.1\), but the median stays \(13\) and the IQR stays \(3\). The median counts only the order of the scores. The mean counts how big they are.</p>`,
        set: { view: 'build', A: OUT, halves: false, iqr: true, mean: true } }
    ],
    formal: String.raw`
      <h3>The five-number summary and the quartile method</h3>
      <p>A <b>box plot</b> is built from five numbers: the <b>minimum</b>, the first quartile \(Q_1\), the <b>median</b>, the third quartile \(Q_3\) and the <b>maximum</b>. To find them:</p>
      <p>1. Sort the values from smallest to largest.<br>
      2. The median is the middle value. With an even count it is the mean of the two middle values.<br>
      3. Split the list into a <b>lower half</b> and an <b>upper half</b>. With an odd count, leave the median out of both halves.<br>
      4. \(Q_1\) is the median of the lower half. \(Q_3\) is the median of the upper half.</p>
      <p>Example with 11 values: \(4\ 7\ 8\ 9\ 10\ |\ 11\ |\ 12\ 13\ 15\ 16\ 16\). The median is \(11\). \(Q_1=8\) and \(Q_3=15\). Some books and calculators treat the median differently when the count is odd (they keep it in both halves), so their \(Q_1\) and \(Q_3\) can differ a little. This lesson always leaves it out.</p>
      <p>Example with 8 values: \(2\ 4\ 6\ 7\ 9\ 10\ 13\ 15\). The median is \((7+9)/2=8\). The lower half \(2\ 4\ 6\ 7\) has \(Q_1=(4+6)/2=5\). The upper half \(9\ 10\ 13\ 15\) has \(Q_3=(10+13)/2=11.5\).</p>
      <h3>Drawing the box plot and the IQR</h3>
      <p>Draw a box from \(Q_1\) to \(Q_3\), a line across the box at the median, and whiskers out to the minimum and the maximum. (Some books stop a whisker at a fence and mark far-away values as separate points. This lesson draws whiskers to the smallest and largest values.) The <b>interquartile range</b> is the length of the box:
      \[ \text{IQR}=Q_3-Q_1. \]
      It measures the spread of the middle half of the data. The <b>range</b>, maximum minus minimum, measures the spread of everything.</p>
      <p>Why does each of the four pieces (whisker, left half of the box, right half of the box, whisker) hold about a quarter of the values? The median cuts the data into two halves of equal count. Each half is cut again at its own median, so each piece holds half of a half. A piece can be long or short, because the values inside it may be spread out or bunched up, but it still holds about the same number of values.</p>
      <h3>Comparing two data sets</h3>
      <p>Put the two box plots on the same scale and ask two questions. <b>Center:</b> which median is higher? <b>Spread:</b> which IQR is smaller? A higher median means the typical value is higher. A smaller IQR means the middle half of the values is closer together, so that data set is more <b>consistent</b>. These are two different questions: a class can have the higher median and also the larger IQR, as in step 2.</p>
      <h3>Skew</h3>
      <p>A data set is <b>skewed right</b> when its long tail points toward large values, and <b>skewed left</b> when the tail points toward small values. In a box plot the median sits closer to one end of the box and the whisker on the other side is longer. For a right-skewed set the mean is usually above the median.</p>
      <h3>Outliers: mean against median</h3>
      <p>The median depends only on the order of the values. The mean adds up their sizes. So one far-away value changes the mean a lot and the median very little. Take \(10\ 11\ 11\ 12\ 12\ 13\ 13\ 14\ 14\ 15\ 16\). The mean is about \(12.8\) and the median is \(13\). Change the \(16\) to \(30\). The mean becomes about \(14.1\), but the median is still \(13\) and the IQR is still \(3\). The median and the IQR are <em>resistant</em> to outliers. The mean and the range are not. That is why news reports often quote the median salary.</p>
      <h3>Which display answers the question?</h3>
      <p><b>Dot plot:</b> shows every value. Best for small data sets and for spotting gaps and outliers. <b>Histogram:</b> groups values into bins and shows the shape (one hump or two, symmetric or skewed). Best for many values. The picture changes with the bin width, so try more than one. A value on a bin's edge goes in the bin to its right. <b>Box plot:</b> shows the five numbers. Best for comparing the center and spread of two or more groups. It hides the individual values and the shape. In the two-hump example, the box plot looks like one ordinary box, and its median is a score nobody got.</p>
      <h3>What this lesson does not do</h3>
      <p>It does not make tables or scatter plots, and it does not use data you collect yourself. It does not use the \(1.5\times\text{IQR}\) rule for naming outliers, and the standard deviation is in the lesson on mean, median and spread.</p>`,
    check: [
      { q: 'A box plot shows minimum 8, Q1 15, median 18, Q3 25 and maximum 40. A student says: "The part of the box from 18 to 25 is longer than the part from 15 to 18, so more students scored between 18 and 25." What is wrong with this?',
        choices: ['Nothing is wrong. A longer part always holds more values.',
                  'Each of the four pieces (whisker, left half of the box, right half of the box, whisker) holds about a quarter of the values. Length shows how spread out those values are, not how many there are.',
                  'The longer part holds fewer values, because the values in it are farther apart.',
                  'The box holds all the values, and the whiskers show the outliers.'], answer: 1,
        why: 'The median splits the values into two equal halves, and each half is split again at its own median. So each piece holds about a quarter of the values. A longer piece only means those values are spread out more. A longer piece does not hold more of them, and it does not hold fewer.',
        hint: 'How many pieces does the median and the quartiles cut the data into? Does the length of a piece change how many values it holds?' },
      { q: 'Nine students scored 3, 5, 6, 8, 9, 11, 12, 14 and 20 points. Use the quartile method, where the median goes in neither half. What is the IQR?',
        choices: ['6', '17', '7.5', '8'], answer: 2,
        why: String.raw`The median is the 5th value, \(9\). The lower half is \(3, 5, 6, 8\), so \(Q_1=(5+6)/2=5.5\). The upper half is \(11, 12, 14, 20\), so \(Q_3=(12+14)/2=13\). The IQR is \(13-5.5=7.5\). Choosing 6 keeps the median in both halves. Choosing 17 is the range, \(20-3\). Choosing 8 is \(14-6\), single values instead of medians of the halves.`,
        hint: 'Find the median first and leave it out. Then find the median of the four lower values and of the four upper values. Subtract.' },
      { q: 'Sam looks at the scores 2, 3, 5, 9 and 30. With the 30, the mean is 9.8 and the median is 5. Without the 30 (the scores 2, 3, 5, 9), the mean is 4.75 and the median is 4. Sam writes: "Removing 30 changed the mean and the median by about the same amount, so an outlier affects them equally." What is the best correction?',
        choices: ['The mean fell by 5.05 but the median fell by only 1. The outlier pulls the mean much more than the median.',
                  'Sam is right. Both numbers fell when the 30 was removed.',
                  'The median fell more, because it is the middle value and the 30 is the biggest.',
                  'Sam added wrong. The mean without the 30 should still be 9.8.'], answer: 0,
        why: 'Compare the sizes of the changes: the mean went from 9.8 to 4.75, a drop of 5.05. The median went from 5 to 4, a drop of 1. The median uses only the order of the scores, so one huge score hardly moves it. The mean adds up sizes, so it follows the outlier.',
        hint: 'Subtract to find how much each number changed. Are the two changes about the same?' }
    ],
    links: { related: ['mean-median-and-spread', 'scatter-plots-and-lines-of-fit', 'statistical-questions-and-data-displays'] },

    mount({ stage, controls: C }) {
      const panel = stage.nextElementSibling;
      const st = { view: 'build', A: [...S1], B: [...CB], act: 'A', sel: 0, halves: true, iqr: false, mean: false, bw: 5, practice: false, lock: false };
      let cancel = () => {};
      const P = new Plane(stage, { span: 5 });
      if (P.coordEl) P.coordEl.style.display = 'none';

      /* ---------- layout ---------- */
      const geo = p => {
        const w = p.w, h = p.h, ml = 16, mr = 16, top = 6, bot = 48, H = h - top - bot, rows = [];
        const R = (kind, set, y0, y1, extra) => rows.push(Object.assign({ kind, set, y0, y1 }, extra));
        const v = st.view;
        if (v === 'dots') R('dots', 'A', top, top + H);
        else if (v === 'build') { const d = H * .5; R('dots', 'A', top, top + d, { br: true }); R('box', 'A', top + d, top + H, { big: true }); }
        else if (v === 'compare') { const q = H / 2; R('dots', 'A', top, top + q * .5); R('box', 'A', top + q * .5, top + q); R('dots', 'B', top + q, top + q * 1.5); R('box', 'B', top + q * 1.5, top + H); }
        else { R('dots', 'A', top, top + H * .3); R('hist', 'A', top + H * .3, top + H * .7); R('box', 'A', top + H * .7, top + H); }
        return { w, h, ml, mr, top, base: top + H, rows, X: x => ml + x / MAXV * (w - ml - mr), iv: px => (px - ml) / (w - ml - mr) * MAXV };
      };
      const orderOf = set => st[set].map((_, i) => i).sort((a, b) => st[set][a] - st[set][b] || a - b);
      const dotsOf = g => {
        const out = [], unit = g.X(1) - g.X(0);
        for (const row of g.rows) {
          if (row.kind !== 'dots') continue;
          const v = st[row.set], cnt = {}, seen = {};
          v.forEach(x => { const k = Math.round(x); cnt[k] = (cnt[k] || 0) + 1; });
          const mx = Math.max(...Object.values(cnt)), reserve = 22 + (st.halves && row.br ? 28 : 0);
          const r = clamp(Math.min((row.y1 - row.y0 - reserve - 4) / (2 * mx), unit * .46), 3.2, 9.5);
          row.r = r;
          v.forEach((x, i) => { const k = Math.round(x), l = seen[k] = (seen[k] || 0) + 1; out.push({ set: row.set, i, x: g.X(x), y: row.y1 - 2 - r - (l - 1) * 2 * r, r }); });
        }
        return out;
      };

      P.onDraw = (c, p) => {
        const pal = p.pal, g = geo(p), fs = clamp(p.w / 31, 12, 14), X = g.X;
        const T = (s, x, y, o = {}) => {
          c.font = `${o.w || 500} ${o.px || fs}px ${FONT}`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
          c.lineJoin = 'round'; c.lineWidth = 4; c.strokeStyle = pal.stage; c.strokeText(s, x, y); c.fillStyle = o.color || pal.text; c.fillText(s, x, y);
        };
        const tw = (s, px) => { c.font = `500 ${px || fs}px ${FONT}`; return c.measureText(s).width; };
        const seg = (x0, y0, x1, y1, col, wd, dash) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.strokeStyle = col; c.lineWidth = wd; c.setLineDash(dash || []); c.lineCap = 'round'; c.stroke(); c.setLineDash([]); };
        /* labels that keep a minimum distance from each other */
        const spread = items => {
          const it = items.map(o => Object.assign({ w: tw(o.s) + 4 }, o, { px: o.x })).sort((a, b) => a.x - b.x), lo = g.ml, hi = g.w - g.mr;
          it.forEach(o => { o.x = clamp(o.x, lo + o.w / 2, hi - o.w / 2); });
          for (let k = 1; k < it.length; k++) { const need = (it[k - 1].w + it[k].w) / 2 + 3; if (it[k].x - it[k - 1].x < need) it[k].x = it[k - 1].x + need; }
          for (let k = it.length - 2; k >= 0; k--) { const need = (it[k + 1].w + it[k].w) / 2 + 3; if (it[k + 1].x - it[k].x < need) it[k].x = it[k + 1].x - need; }
          return it;
        };

        /* grid, axis */
        c.lineWidth = 1; c.strokeStyle = pal.grid; c.beginPath();
        for (let x = 0; x <= MAXV; x += 5) { c.moveTo(X(x), g.top); c.lineTo(X(x), g.base); }
        c.stroke();
        seg(g.ml - 4, g.base, g.w - g.mr + 4, g.base, pal['grid-strong'], 2);
        for (let x = 0; x <= MAXV; x += 5) { seg(X(x), g.base, X(x), g.base + 5, pal['grid-strong'], 1.6); T(String(x), X(x), g.base + 18, { color: pal.muted }); }
        T('Quiz score (points)', g.w / 2, g.h - 10, { color: pal.muted, px: fs });

        const lay = dotsOf(g);
        for (const row of g.rows) {
          const v = st[row.set], S = five(v), name = st.view === 'compare' ? (row.set === 'A' ? 'Class A' : 'Class B') : '';
          if (row.kind === 'dots') {
            const t = st.view === 'compare' ? `${name}: median ${num(S.med)}, IQR ${num(S.q3 - S.q1)}` : st.view === 'three' ? 'Dot plot' : 'Dot plot: one dot per score';
            T(t, g.ml, row.y0 + 10, { align: 'left', w: 600 });
            seg(g.ml, row.y1, g.w - g.mr, row.y1, alpha(pal.muted, .5), 1);
            const mine = lay.filter(d => d.set === row.set);
            mine.forEach(d => { c.beginPath(); c.arc(d.x, d.y, d.r, 0, TAU); c.fillStyle = alpha(pal.blue, .9); c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 1.6; c.stroke(); });
            if (st.halves && row.br) {
              const n = S.n, hf = S.hf, y = row.y0 + 38;
              const spans = [['lower half', S.s[0], S.s[hf - 1]], ['upper half', S.s[n - hf], S.s[n - 1]]];
              const lab = spread(spans.map(sp => ({ s: sp[0], x: (X(sp[1]) + X(sp[2])) / 2 })));
              spans.forEach((sp, k) => {
                const a = X(sp[1]) - 3, b = X(sp[2]) + 3;
                seg(a, y, b, y, pal.green, 2.6); seg(a, y, a, y + 6, pal.green, 2.6); seg(b, y, b, y + 6, pal.green, 2.6);
                T(sp[0], lab.find(o => o.s === sp[0]).x, y - 10, { color: pal.text, w: 600 });
              });
              if (n % 2) {
                const mi = orderOf(row.set)[hf], d = mine.find(q => q.i === mi);
                if (d) { c.beginPath(); c.arc(d.x, d.y, d.r + 3.2, 0, TAU); c.strokeStyle = pal.violet; c.lineWidth = 2.6; c.stroke(); }
              }
            }
            if (!st.lock && row.set === st.act) {
              const d = mine.find(q => q.i === st.sel);
              if (d) { c.beginPath(); c.arc(d.x, d.y, d.r + 3.4, 0, TAU); c.strokeStyle = pal.brass; c.lineWidth = 2.8; c.stroke(); }
            }
          } else if (row.kind === 'hist') {
            const cs = bins(v, st.bw), mx = Math.max(...cs, 1), top = row.y0 + 34, hh = row.y1 - top - 2;
            T(`Histogram: bins of ${st.bw} points`, g.ml, row.y0 + 10, { align: 'left', w: 600 });
            cs.forEach((k, b) => {
              if (!k) return;
              const x0 = X(b * st.bw) + 1.5, x1 = X((b + 1) * st.bw) - 1.5, hg = k / mx * hh;
              c.fillStyle = alpha(pal.blue, .4); c.fillRect(x0, row.y1 - hg, x1 - x0, hg);
              c.strokeStyle = pal.blue; c.lineWidth = 1.8; c.strokeRect(x0, row.y1 - hg, x1 - x0, hg);
              T(String(k), (x0 + x1) / 2, row.y1 - hg - 9);
            });
            seg(g.ml, row.y1, g.w - g.mr, row.y1, alpha(pal.muted, .5), 1);
          } else {
            const y0 = row.y0, avail = row.y1 - y0, roomy = !!row.big && avail >= 150, lane = fs + 3;
            const ttl = st.view === 'compare' ? '' : 'Box plot' + (st.iqr && !roomy ? `: IQR = Q3 − Q1 = ${num(S.q3)} − ${num(S.q1)} = ${num(S.q3 - S.q1)}` : '');
            if (ttl) T(ttl, g.ml, y0 + 10, { align: 'left', w: 600 });
            const res = ttl ? 18 : 2, bh = roomy ? 34 : clamp(avail - res - 2 * lane - 4, 14, 30);
            const cy = roomy ? y0 + res + lane + bh / 2 + 4 : y0 + res + lane + bh / 2 + (avail - res - 2 * lane - bh) / 2;
            const cap = bh * .32, bw = Math.max(2, X(S.q3) - X(S.q1));
            seg(X(S.min), cy, X(S.q1), cy, pal.blue, 2.6); seg(X(S.q3), cy, X(S.max), cy, pal.blue, 2.6);
            seg(X(S.min), cy - cap, X(S.min), cy + cap, pal.blue, 2.6); seg(X(S.max), cy - cap, X(S.max), cy + cap, pal.blue, 2.6);
            c.fillStyle = alpha(pal.blue, .24); c.fillRect(X(S.q1), cy - bh / 2, bw, bh);
            c.strokeStyle = pal.blue; c.lineWidth = 2.8; c.setLineDash([]); c.strokeRect(X(S.q1), cy - bh / 2, bw, bh);
            seg(X(S.med), cy - bh / 2, X(S.med), cy + bh / 2, pal.violet, 4.4);
            if (st.mean) {
              const mx = X(S.mean), s = 7;
              c.beginPath(); c.moveTo(mx, cy - s); c.lineTo(mx + s, cy); c.lineTo(mx, cy + s); c.lineTo(mx - s, cy); c.closePath();
              c.fillStyle = pal.yellow; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 1.8; c.stroke();
            }
            const top = [['min', S.min], ['median', S.med], ['max', S.max]].map(([a, b]) => ({ s: `${a} ${num(b)}`, x: X(b), k: a }));
            spread(top).forEach(o => T(o.s, o.x, cy - bh / 2 - fs * .75, { color: o.k === 'median' ? pal.violet : pal.text, w: o.k === 'median' ? 700 : 500 }));
            const bot = [['Q1', S.q1], ['Q3', S.q3]].map(([a, b]) => ({ s: `${a} ${num(b)}`, x: X(b), k: a }));
            if (st.mean && !roomy) bot.push({ s: `mean ${num(r1(S.mean))}`, x: X(S.mean), k: 'mean' });
            spread(bot).forEach(o => T(o.s, o.x, cy + bh / 2 + fs * .85));
            let yb = cy + bh / 2 + fs * .85;
            if (roomy && st.mean) { yb += lane; T(`mean ${num(r1(S.mean))}`, clamp(X(S.mean), g.ml + 40, g.w - g.mr - 40), yb); }
            if (roomy && st.iqr) {
              yb += lane + 2; const a = X(S.q1), b = X(S.q3);
              seg(a, yb, b, yb, pal.green, 2.8); seg(a, yb - 5, a, yb + 5, pal.green, 2.8); seg(b, yb - 5, b, yb + 5, pal.green, 2.8);
              T(`IQR = Q3 − Q1 = ${num(S.q3)} − ${num(S.q1)} = ${num(S.q3 - S.q1)}`, clamp((a + b) / 2, g.ml + 90, g.w - g.mr - 90), yb + lane, { w: 600 });
            }
          }
        }
      };

      /* ---------- the side panel ---------- */
      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      let ro, viewSel, bwSel, actSel, selS, tgH, tgI, tgM;
      let pred = {};

      const setData = (set, arr, immediate) => {
        if (immediate || reduceMotion || arr.length !== st[set].length) { st[set] = [...arr]; return; }
        const from = [...st[set]];
        const prev = cancel;
        const stop = tween(900, q => { const e = ease(q); st[set] = from.map((x, i) => lerp(x, arr[i], e)); if (q >= 1) st[set] = [...arr]; sync(); });
        cancel = () => { prev(); stop(); };
      };
      const clampSel = () => { st.sel = clamp(st.sel, 0, st[st.act].length - 1); };

      grp('view', () => {
        C.title('View');
        viewSel = C.select({ label: 'What to show', value: st.view, options: [
          { value: 'build', label: 'One data set: dot plot and box plot' },
          { value: 'compare', label: 'Two classes, side by side' },
          { value: 'three', label: 'Three displays of one data set' }],
        onChange: v => { cancel(); st.view = v; st.act = 'A'; clampSel(); sync(); } });
        bwSel = C.select({ label: 'Histogram bin width', value: String(st.bw), options: [{ value: '2', label: '2 points' }, { value: '5', label: '5 points' }, { value: '10', label: '10 points' }],
          onChange: v => { st.bw = +v; sync(); } });
        C.buttons([
          { label: 'Symmetric', onClick: () => preset(S1) }, { label: 'Skewed right', onClick: () => preset(SK) },
          { label: 'With an outlier', onClick: () => preset(OUT) }, { label: 'Even count (10)', onClick: () => preset(EV) },
          { label: 'Two humps (18)', onClick: () => preset(HUMP) }, { label: 'Classes A and B', onClick: () => { cancel(); st.A = [...CA]; st.B = [...CB]; st.view = 'compare'; st.act = 'A'; clampSel(); sync(); } }
        ]);
      });
      const preset = arr => { cancel(); st[st.act] = [...arr]; clampSel(); sync(); };
      grp('show', () => {
        C.title('Show');
        tgH = C.toggle({ label: 'The two halves (quartile method)', value: st.halves, onChange: v => { st.halves = v; sync(); } });
        tgI = C.toggle({ label: 'The IQR (length of the box)', value: st.iqr, onChange: v => { st.iqr = v; sync(); } });
        tgM = C.toggle({ label: 'The mean (yellow diamond)', value: st.mean, onChange: v => { st.mean = v; sync(); } });
      });
      grp('dots', () => {
        C.title('Move the dots');
        actSel = C.select({ label: 'Edit which class', value: st.act, options: [{ value: 'A', label: 'Class A' }, { value: 'B', label: 'Class B' }], onChange: v => { st.act = v; clampSel(); sync(); } });
        C.buttons([{ label: '◀ Dot below', onClick: () => { const o = orderOf(st.act), k = o.indexOf(st.sel); st.sel = o[clamp(k - 1, 0, o.length - 1)]; sync(); } },
          { label: 'Dot above ▶', onClick: () => { const o = orderOf(st.act), k = o.indexOf(st.sel); st.sel = o[clamp(k + 1, 0, o.length - 1)]; sync(); } }]);
        C.buttons([{ label: '−1', onClick: () => nudge(-1) }, { label: '+1', onClick: () => nudge(1) }]);
        selS = C.slider({ label: 'Value of the selected dot', min: 0, max: MAXV, step: 1, value: 0, onInput: v => { cancel(); st[st.act][st.sel] = clamp(Math.round(v), 0, MAXV); sync(); } });
        C.hint('Drag a dot, or pick one with the buttons (it gets a gold ring) and change it with −1, +1 or the slider. Values are whole numbers from 0 to 30.');
      });
      const nudge = d => { if (st.lock) return; cancel(); const a = st[st.act]; a[st.sel] = clamp(Math.round(a[st.sel]) + d, 0, MAXV); sync(); };
      grp('pred', () => {
        C.title('Predict first');
        C.hint('Class scores sit between 10 and 16, with median 13. The top score, 16, will slide to 30. What happens?');
        pred.fb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pred.btns = [
          ['Mean and median both jump up by a lot', bad('Not quite.') + ' The median is the middle score. It depends on the order, and 30 is still the top score, so the median stays 13. Only the mean follows the size of the outlier.'],
          ['The mean rises. The median and the IQR stay the same', good('Yes.') + ' The mean goes from about 12.8 to about 14.1. The median is still 13 and the IQR is still 3, because the top score is still the top score.'],
          ['Only the IQR changes', bad('Not quite.') + ' The IQR is Q3 − Q1 = 14 − 11 = 3 both before and after. The middle half of the scores did not move. The mean is the number that changes.']
        ].map(([lab, fb]) => mkBtn(lab, () => {
          cancel(); st.view = 'build'; st.act = 'A'; st.iqr = true; st.mean = true; st.A = [...OUT]; clampSel(); sync();
          pred.fb.innerHTML = fb; setData('A', OUT30); sync();
        }));
        const row = h('div', { class: 'ctl buttons', style: 'flex-direction:column;align-items:stretch' }, ...pred.btns);
        panel.append(row, pred.fb);
      });
      grp('ro', () => { ro = C.readout(); });

      /* ---------- readout ---------- */
      const list = S => {
        const s = S.s, lo = s.slice(0, S.hf), up = s.slice(S.n - S.hf);
        return st.halves ? lo.map(num).join(' ') + (S.n % 2 ? ` | <b>${num(s[S.hf])}</b> | ` : ' &nbsp;|&nbsp; ') + up.map(num).join(' ') : s.map(num).join(' ');
      };
      const shapeTxt = S => {
        const k = skewOf(S);
        const side = k === 'right' ? 'Right-skewed: the upper side is stretched out.' + (S.mean > S.med ? ' The mean is above the median.' : '')
          : k === 'left' ? 'Left-skewed: the lower side is stretched out.' + (S.mean < S.med ? ' The mean is below the median.' : '')
          : 'Roughly symmetric: the two sides are about equally long.';
        return side;
      };
      const block = (S, label) => {
        const o = [];
        if (label) o.push(`<b>${label}</b> (n = ${S.n})`);
        o.push(`${kk('Sorted')} ${list(S)}`);
        o.push(`${kk('Five numbers')} min ${num(S.min)}, Q1 ${num(S.q1)}, median ${num(S.med)}, Q3 ${num(S.q3)}, max ${num(S.max)}`);
        if (st.halves) o.push(`${kk('Quartiles')} Q1 is the median of the lower half (${S.hf} values). Q3 is the median of the upper half.${S.n % 2 ? ' The middle value is left out.' : ''}`);
        o.push(`${kk('IQR')} Q3 − Q1 = ${num(S.q3)} − ${num(S.q1)} = ${num(S.q3 - S.q1)} &nbsp; ${kk('Range')} ${num(S.max)} − ${num(S.min)} = ${num(S.max - S.min)}`);
        o.push(`${kk('Mean')} ${meanTxt(S.mean)} &nbsp; ${kk('Median')} ${num(S.med)}`);
        o.push(`${kk('Left side')} median to Q1: ${num(S.med - S.q1)}, Q1 to min: ${num(S.q1 - S.min)} &nbsp; ${kk('Right side')} median to Q3: ${num(S.q3 - S.med)}, Q3 to max: ${num(S.max - S.q3)}`);
        o.push(`${kk('Shape')} ${shapeTxt(S)}`);
        return o.join('<br>');
      };
      const upd = () => {
        if (st.practice) {
          if (cur().kind === 'build') { const S = five(st.A); plive.innerHTML = `${kk('Now')} sorted: ${S.s.map(num).join(' ')}<br>${kk('Median')} ${num(S.med)} &nbsp; ${kk('Mean')} ${meanTxt(S.mean)}`; }
          return;
        }
        const A = five(st.A);
        if (st.view === 'compare') {
          const B = five(st.B), hi = A.med === B.med ? 'The medians are equal.' : `Higher median: ${A.med > B.med ? 'Class A' : 'Class B'} (${num(Math.max(A.med, B.med))} against ${num(Math.min(A.med, B.med))}).`;
          const ia = A.q3 - A.q1, ib = B.q3 - B.q1, lo = ia === ib ? 'The IQRs are equal.' : `Smaller IQR, so more consistent: ${ia < ib ? 'Class A' : 'Class B'} (${num(Math.min(ia, ib))} against ${num(Math.max(ia, ib))}).`;
          ro.innerHTML = `${block(A, 'Class A')}<br><br>${block(B, 'Class B')}<br><br>${kk('Compare')} ${hi} ${lo}`;
        } else if (st.view === 'three') {
          ro.innerHTML = block(A, '') + `<br><br>${kk('Dot plot')} shows every value and any gap, but hides the quartiles.<br>${kk('Histogram')} shows the shape, and changes with the bin width. It hides the individual values and the quartiles.<br>${kk('Box plot')} shows the five numbers and compares groups well. It hides the shape and every individual value.`;
        } else ro.innerHTML = block(A, '');
      };

      const sync = () => {
        clampSel();
        selS.set(st[st.act][st.sel]);
        tgH.checked = st.halves; tgI.checked = st.iqr; tgM.checked = st.mean; viewSel.value = st.view; actSel.value = st.act; bwSel.value = String(st.bw);
        const pr = st.practice;
        vis(G.view, !pr); vis(G.show, !pr); vis(G.pred, !pr); vis(G.ro, !pr);
        vis(G.dots, !pr || cur().kind === 'build');
        bwSel.parentElement.style.display = !pr && st.view === 'three' ? '' : 'none';
        actSel.parentElement.style.display = !pr && st.view === 'compare' ? '' : 'none';
        P.draw(); upd();
      };

      /* ---------- dragging ---------- */
      draggable(P, {
        hit: (px, py) => {
          if (st.lock) return null;
          const g = geo(P); let best = null, bd = 20;
          for (const d of dotsOf(g)) { const dist = Math.hypot(d.x - px, d.y - py); if (dist <= bd) { bd = dist; best = d; } }
          return best ? { set: best.set, i: best.i } : null;
        },
        move: (hd, mx) => {
          cancel(); const g = geo(P), v = clamp(Math.round(g.iv(P.X(mx))), 0, MAXV);
          st.act = hd.set; st.sel = hd.i; st[hd.set][hd.i] = v; sync();
        }
      });

      /* ---------- practice ---------- */
      let prIdx = 0, prSolved = false, prTried = false, prFirst = 0, prDone = 0, saved = null;
      let ptally, pq, pch, pact, plive, pfb, pnext, pwrap, startBtn;
      const cur = () => PROBS[prIdx];
      C.title('Practice');
      C.hint('Nine short problems: find quartiles, read the IQR, move dots, compare classes and choose a display. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => togglePractice() }])[0];
      pwrap = h('div', { style: 'display:none;flex-direction:column;gap:14px' });
      ptally = h('p', { class: 'ctl-title' });
      pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
      pch = h('div', { class: 'ctl buttons', style: 'flex-direction:column;align-items:stretch' });
      pact = h('div', { class: 'ctl buttons' }, mkBtn('Check', () => checkBuild(), true), mkBtn('Reset the dots', () => { if (prSolved) return; cancel(); st.A = [...cur().A]; st.sel = 0; pfb.innerHTML = ''; sync(); }));
      plive = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
      pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
      pnext = mkBtn('Next problem', () => nextProb(), true);
      pwrap.append(ptally, pq, pch, pact, plive, pfb, h('div', { class: 'ctl buttons' }, pnext));
      panel.append(pwrap);

      const tally = () => { ptally.textContent = `Right on the first try: ${prFirst} of ${prDone} done (${PROBS.length} problems)`; };
      const loadProb = () => {
        const pr = cur(); prSolved = false; prTried = false; cancel();
        Object.assign(st, { view: pr.view, A: [...pr.A], B: pr.B ? [...pr.B] : st.B, act: 'A', sel: 0, halves: false, iqr: false, mean: !!pr.mean, lock: pr.kind !== 'build' });
        pq.textContent = pr.q; pfb.innerHTML = ''; plive.innerHTML = ''; pch.replaceChildren(); pnext.disabled = true;
        pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        const isB = pr.kind === 'build';
        pact.style.display = isB ? '' : 'none'; plive.style.display = isB ? '' : 'none'; pch.style.display = isB ? 'none' : '';
        if (!isB) pr.ch.forEach((o, i) => pch.append(mkBtn(o[0], () => pickChoice(i))));
        tally(); sync();
      };
      const solved = () => {
        prSolved = true; if (!prTried) prFirst++; prDone++; pnext.disabled = false; st.lock = true; tally();
      };
      const pickChoice = i => {
        const pr = cur(); if (prSolved) return;
        const btn = pch.children[i];
        if (i === pr.ans) {
          solved(); Array.from(pch.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary');
          pfb.innerHTML = good('Right.') + ' ' + pr.ch[i][1].replace(/^Yes\.\s*/, '');
          if (pr.after) Object.assign(st, pr.after);
        } else { prTried = true; btn.disabled = true; pfb.innerHTML = bad('Not quite.') + ' ' + pr.ch[i][1] + ' Try another answer.'; tally(); }
        sync();
      };
      const checkBuild = () => {
        const pr = cur(); if (prSolved) return;
        const S = five(st.A), moved = diffCount(pr.A, st.A), seq = S.s.map(num).join(', ');
        if (pr.ok(st.A, S)) {
          solved();
          pfb.innerHTML = prIdx === 3
            ? good('Right.') + ` Sorted: ${seq}. With 7 values the median is the 4th, and it is ${num(S.med)}. Changing one dot can change which score sits in the middle, and that is how the median moves.`
            : good('Right.') + ` Sorted: ${seq}. The median is the middle score, ${num(S.med)}, and the mean is ${meanTxt(S.mean)}. The mean adds up the sizes, so one big score lifts it. The median only counts the order, so it stayed put.`;
          st.mean = true; pact.style.display = 'none';
        } else {
          prTried = true;
          let why;
          if (moved === 0) why = 'You have not moved a dot yet.';
          else if (moved > 1) why = `You moved ${moved} dots. The problem asks for exactly one. Press Reset the dots and try again.`;
          else if (prIdx === 3) why = `The median is now ${num(S.med)} (sorted: ${seq}). The median of 7 values is the 4th one. You need it to be 12, so a dot must end up making 12 the middle score.`;
          else if (S.med !== 12) why = `The median changed to ${num(S.med)} (sorted: ${seq}). It must stay 12. Moving a low dot above 12 changes which score is in the middle. Move one of the dots that is already above 12 (the 13 or the 14) farther up.`;
          else why = `The median is 12 but the mean is only ${meanTxt(S.mean)}. The mean is the total divided by 5, so you need a total of at least 75. Push the moved dot higher.`;
          pfb.innerHTML = bad('Not yet.') + ' ' + why; tally();
        }
        sync();
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); return; }
        pq.textContent = 'All nine problems are done.'; pch.replaceChildren(); pact.style.display = 'none'; plive.style.display = 'none'; pnext.disabled = true;
        pfb.innerHTML = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        pch.style.display = ''; pch.append(mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; loadProb(); }, true));
        sync();
      };
      const togglePractice = () => {
        cancel();
        if (st.practice) {
          st.practice = false; pwrap.style.display = 'none'; startBtn.textContent = 'Start practice';
          if (saved) Object.assign(st, saved, { A: [...saved.A], B: [...saved.B] });
          st.lock = false; sync();
        } else {
          saved = { view: st.view, A: [...st.A], B: [...st.B], act: st.act, sel: st.sel, halves: st.halves, iqr: st.iqr, mean: st.mean };
          st.practice = true; pwrap.style.display = 'flex'; startBtn.textContent = 'Back to the lesson'; prIdx = 0; prFirst = 0; prDone = 0; loadProb();
        }
      };

      /* ---------- steps ---------- */
      const apply = (patch, immediate) => {
        if (st.practice) togglePractice();
        cancel();
        const { view, A, B, halves, iqr, mean } = patch;
        if (view !== undefined) { st.view = view; st.act = 'A'; }
        if (halves !== undefined) st.halves = halves;
        if (iqr !== undefined) st.iqr = iqr;
        if (mean !== undefined) st.mean = mean;
        st.lock = false;
        if (A) setData('A', A, immediate);
        if (B) setData('B', B, immediate);
        pred.fb.innerHTML = '';
        sync();
      };
      sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
