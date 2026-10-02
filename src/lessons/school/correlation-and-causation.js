/* =====================================================================
   SCHOOL — Correlation and causation
   ===================================================================== */
{
  /* ---------- small helpers (all block scoped) ---------- */
  const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
  const sdp = a => { const m = mean(a); return Math.sqrt(mean(a.map(v => (v - m) ** 2))); };
  const zs = a => { const m = mean(a), s = sdp(a) || 1; return a.map(v => (v - m) / s); };
  const r1 = v => Math.round(v * 10) / 10;
  const rf = v => Math.abs(v) < .005 ? '0.00' : fmt(v, 2);
  const f1 = v => (v < 0 ? '−' : '') + Math.abs(v).toFixed(1);
  const pct = v => Math.round(v);

  /* sums behind Pearson's r, the least-squares line, and r itself */
  const sums = pts => {
    const mx = mean(pts.map(p => p[0])), my = mean(pts.map(p => p[1]));
    let sxy = 0, sxx = 0, syy = 0;
    pts.forEach(([x, y]) => { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; });
    return { mx, my, sxy, sxx, syy };
  };
  const corr = pts => { const s = sums(pts); return s.sxx > 0 && s.syy > 0 ? s.sxy / Math.sqrt(s.sxx * s.syy) : 0; };
  const fit = pts => { const s = sums(pts), m = s.sxx > 0 ? s.sxy / s.sxx : 0; return { m, b: s.my - m * s.mx }; };

  /* Noise that is exactly uncorrelated with x, so a built picture has exactly the correlation we ask for. */
  const orth = (xs, seed) => {
    const R = mulberry(seed), zx = zs(xs);
    let e = xs.map(() => R() + R() + R() - 1.5);
    const m = mean(e); e = e.map(v => v - m);
    const d = mean(e.map((v, i) => v * zx[i]));
    return zs(e.map((v, i) => v - d * zx[i]));
  };
  const unitY = (xs, r, seed) => { const zx = zs(xs), e = orth(xs, seed); return zx.map((v, i) => r * v + Math.sqrt(1 - r * r) * e[i]); };

  /* ---------- part 1: the estimating pictures ---------- */
  const XS = (() => { const R = mulberry(5); return Array.from({ length: 24 }, (_, i) => clamp(r1((i + .5) / 24 * 10 + (R() - .5) * .3), .2, 9.8)); })();
  const U_HALF = (() => { const R = mulberry(9); return Array.from({ length: 12 }, (_, i) => [r1(.5 + i * .39), (R() - .5) * .9]); })();
  const OUT_AT = [9.5, 7.8];
  const PRESETS = [[1, .85, 1], [-1, .6, 2], [1, .3, 3], [-1, .95, 4], [1, .65, 5], [-1, .15, 6], [1, .95, 7]];
  const buildEst = (pat, sgn, t, seed) => {
    if (pat === 'u') {
      const out = [];
      U_HALF.forEach(([x, n]) => { const y = .8 + .34 * (x - 5) ** 2 + n; out.push([x, y]); out.push([r1(10 - x), y]); });
      return out;
    }
    if (pat === 'out') {
      const xs = XS.slice(0, 23), u = unitY(xs, .9, 11);
      return xs.map((x, i) => [x, 5 + 2 * u[i]]).concat([OUT_AT.slice()]);
    }
    const u = unitY(XS, sgn * t, seed * 7 + 3);
    return XS.map((x, i) => [x, 5 + 2 * u[i]]);
  };
  const tightWord = t => t < .15 ? 'almost none' : t < .4 ? 'loose' : t < .7 ? 'medium' : t < .9 ? 'tight' : 'very tight';
  const sizeWord = a => a >= .9 ? 'very strong' : a >= .7 ? 'strong' : a >= .4 ? 'moderate' : a >= .2 ? 'weak' : 'almost no';

  /* ---------- part 2: study hours and score ---------- */
  const LM = 4, LB = 50;
  const LINE_PTS = (() => {
    const R = mulberry(21), hx = Array.from({ length: 24 }, (_, i) => r1(Math.max(.4, .4 + (i + .5) / 24 * 8.5 + (R() - .5) * .3)));
    const e = orth(hx, 31);
    return hx.map((x, i) => [x, LB + LM * x + 5 * e[i]]);
  })();
  const LINE_DOM = { x0: 0, x1: 16, y0: 0, y1: 120, gx: 2, gy: 20 };
  const LINE_R = corr(LINE_PTS);
  const LINE_XMIN = Math.min(...LINE_PTS.map(p => p[0])), LINE_XMAX = Math.max(...LINE_PTS.map(p => p[0]));
  const LQ = [
    { name: '1 Slope', q: 'What does the slope, 4, mean in this situation?', ans: 1,
      ch: ['Each extra hour of studying causes the score to rise by 4 points.',
           'Students who studied 1 hour more scored about 4 points higher, on average.',
           'A student’s score is 4 times the hours studied.',
           'Each extra hour adds 0.89 points, because r = 0.89.'],
      fb: ['This is the causal overclaim. The line describes how scores and hours go together across these students. It does not show that studying more caused the gain. A student who is more motivated may study more and also score higher. Say "tend to be" or "on average" instead.',
           'Right. The slope is a rate: the change in the predicted score for 1 more hour. The words "about" and "on average" matter, because the dots are scattered around the line. Nothing here claims the extra hour caused the extra points.',
           'That would be a line through the origin, “4x”, which gives 20 points for 5 hours. Our line gives 70 at 5 hours, because it starts at 50 and then adds 4 for every hour.',
           'The slope and r are different numbers. The slope, 4, is in points per hour. The number r is a pure number with no units. It tells how tightly the dots follow the line, not how steep the line is.'] },
    { name: '2 Intercept', q: 'What does the intercept, 50, mean in this situation?', ans: 2,
      ch: ['Every student scored 50 points.',
           'A student who studies 0 hours will score exactly 50 points.',
           'For 0 hours of studying the line predicts about 50 points. It is the starting value of the line, and 0 hours is just outside the data, so it is only a rough guess.',
           'Each hour of studying adds 50 points.'],
      fb: ['The dots go from about 46 to 86 points. The intercept is where the line crosses the vertical axis. It is not a score that every student got.',
           'A line gives a prediction, not a promise. Real students scatter around the line, and no student in the data studied 0 hours, so this is a guess made from the edge of the data.',
           'Right. The intercept is the predicted score when x = 0, the starting value of the line. We say "about" and "rough" because 0 hours is just beyond the left edge of the data (the smallest is 0.6 hours).',
           'That swaps the two numbers. The 4 is the rate that is added each hour. The 50 is the value where the line starts.'] },
    { name: '3 Prediction', q: 'Drag the yellow guide to 15 hours. Which statement is best?', ans: 0,
      ch: ['The line gives 110 points, but 15 hours is far beyond the data (the most is 8.7 hours) and the test is out of 100, so do not trust it.',
           'The line gives 110 points, so a student who studies 15 hours will score 110.',
           'The line gives 60 points, because 4 × 15 = 60.',
           'The line cannot predict anything, because the dots are not exactly on it.'],
      fb: ['Right. 4 × 15 + 50 = 110, which is impossible on a test out of 100. This is extrapolation: predicting outside the range of the data. The trend can stop or bend out there, so the line is not reliable.',
           'A score of 110 is not possible on a test that is out of 100. The line is only a model of the trend, and it was built from students who studied up to 8.7 hours. Far outside that range it can fail.',
           'That skips the intercept. The line is y = 4x + 50, so at 15 hours it gives 4 × 15 + 50 = 110, not 60.',
           'A line of fit never matches every dot. It can still predict well inside the range of the data. The problem here is different: 15 hours is far outside that range.'] }
  ];

  /* ---------- part 3: situations ---------- */
  /* clusters of points: each group has its own x and y values with almost no trend inside the group */
  const groupsData = (specs, seed, round) => {
    const R = mulberry(seed), pts = [], grp = [];
    specs.forEach((g, gi) => {
      const raw = Array.from({ length: g.n }, () => R() + R() + R() - 1.5), xs = zs(raw).map(v => g.mx + g.sx * v);
      const u = unitY(xs, g.rg, seed + gi * 5 + 1);
      xs.forEach((x, i) => { let y = Math.max(g.ymin || .2, g.my + g.sy * u[i]); pts.push(round ? [Math.round(x), Math.round(y)] : [r1(x), r1(y)]); grp.push(gi); });
    });
    return { pts, grp };
  };
  const lineData = (xs, r, mean0, sd0, seed, lo) => {
    const u = unitY(xs, r, seed);
    return xs.map((x, i) => [x, Math.max(lo || 0, mean0 + sd0 * u[i])]);
  };
  const strat = (n, a, b, jit, seed, step) => { const R = mulberry(seed); return Array.from({ length: n }, (_, i) => { const v = a + (i + .5) / n * (b - a) + (R() - .5) * jit; return step ? Math.round(v / step) * step : r1(v); }); };

  const OPTS = ['x causes y', 'y causes x', 'A lurking (third) variable drives both', 'Coincidence', 'The data cannot tell us which'];
  const SC = [
    { key: 'Ice cream', xt: 'Ice cream sales ($1000s per month)', yt: 'Drownings per 100,000 swimmers',
      dom: { x0: 0, x1: 16, y0: 0, y1: 10, gx: 2, gy: 2 },
      data: groupsData([{ n: 8, mx: 4, sx: 1, my: 1.5, sy: .6, rg: .1 }, { n: 8, mx: 8, sx: 1, my: 3.5, sy: .9, rg: -.1 }, { n: 8, mx: 12, sx: 1, my: 6, sy: 1, rg: .1 }], 41),
      gl: ['cool months', 'warm months', 'hot months'],
      desc: 'Each dot is one month in a seaside county. Across: ice cream sales that month. Up: drownings per 100,000 swimmers.',
      ans: 2,
      fb: ['Eating ice cream does not make anyone drown. If the town banned ice cream, nothing would change at the beach. Ask what else is different in the months when more cones are sold.',
           'Drownings do not make people buy ice cream. Neither variable can sensibly cause the other.',
           'Yes. Hot weather sends people to buy ice cream, and it also sends them swimming. More swimmers means more drownings. The temperature is a <b>lurking variable</b> that drives both.',
           'This is not luck. The pattern is strong, it shows up in many months, and there is a real reason behind it: hot weather. Coincidence is for patterns that have no reason, usually with few data.',
           'It is true that data alone cannot prove a cause. But here a much better explanation is on the table: hot weather. When you can name a believable third variable, name it.'],
      ev: 'The colors show the lurking variable. Look inside one color: when the weather is the same, more ice cream no longer goes with more drownings. To settle a cause you would need an experiment with random assignment, and nobody can randomly assign the weather or the ice cream sales of a whole county. Comparing months with the same temperature is the best check available.' },
    { key: 'Shoe size', xt: 'Shoe size (EU)', yt: 'Reading score (points)',
      dom: { x0: 24, x1: 38, y0: 0, y1: 100, gx: 2, gy: 20 },
      data: groupsData([{ n: 8, mx: 28, sx: 1.2, my: 35, sy: 6, rg: .1 }, { n: 8, mx: 31, sx: 1.2, my: 55, sy: 6, rg: -.1 }, { n: 8, mx: 34, sx: 1.2, my: 75, sy: 6, rg: .05 }], 52),
      gl: ['ages 6 to 7', 'ages 8 to 9', 'ages 10 to 11'],
      desc: 'Each dot is one child. Across: shoe size. Up: score on a reading test.',
      ans: 2,
      fb: ['Bigger feet do not teach anyone to read. If you bought a child bigger shoes, the reading score would not change.',
           'Reading does not stretch feet. This direction makes no sense.',
           'Yes. Older children have bigger feet, and they have also had more years of reading lessons. <b>Age</b> is the lurking variable that drives both.',
           'Not coincidence. The pattern is strong across many children, and there is a clear reason for it: growing up.',
           'Data alone cannot prove a cause, but here you can name a third variable that explains the pattern: age. That is a better answer than giving up.'],
      ev: 'The colors show age. Inside one color, children of the same age, a bigger shoe size tells you almost nothing about reading. An experiment cannot hand out shoe sizes at random, so the practical check is to compare children of the same age.' },
    { key: 'Tutoring', xt: 'Hours of tutoring per month', yt: 'Math grade (%)',
      dom: { x0: 0, x1: 8, y0: 40, y1: 100, gx: 1, gy: 20 },
      data: (() => { const xs = strat(24, 0, 8, .6, 62, .5); return { pts: lineData(xs, -.75, 72, 11, 63).map((p, i) => [xs[i], p[1]]), grp: null }; })(),
      desc: 'Each dot is one student. Across: hours of tutoring per month. Up: math grade. The dots fall as you move right.',
      ans: 1,
      fb: ['This says tutoring lowers grades. That is unlikely. Ask yourself: which students sign up for tutoring?',
           'Yes, this is the likely story. Students who are already getting low grades are the ones who get tutoring, so the grade comes first and the tutoring follows. The negative r does not mean tutoring hurts.',
           'A third variable is possible, for example a very hard class. But a simpler story fits better: students with low grades look for help. Ask which variable comes first in time.',
           'With 24 students and a clear trend, a reason is more likely than luck.',
           'It is true that data alone cannot prove a cause. But one story is much more likely than the others: low grades lead to tutoring.'],
      ev: 'To find out whether tutoring helps, you need an experiment. Randomly choose which of a group of low-grade students get tutoring, then compare their later grades. Random assignment makes the two groups alike in everything else, so a difference can be credited to the tutoring. This scatter plot cannot show that, because students chose their own tutoring.' },
    { key: 'Sleep', xt: 'Hours of sleep per night', yt: 'Test average (%)',
      dom: { x0: 4, x1: 10, y0: 40, y1: 100, gx: 1, gy: 20 },
      data: (() => { const xs = strat(24, 5, 9.5, .3, 71); return { pts: lineData(xs, .6, 70, 9, 72).map((p, i) => [xs[i], p[1]]), grp: null }; })(),
      desc: 'Each dot is one student. Across: hours of sleep on a school night. Up: average on tests. The dots rise as you move right.',
      ans: 4,
      fb: ['This could be true: sleep may help the brain work well. But look at the other stories before you decide. The scatter plot alone does not show it.',
           'This could also be true: students who do well may feel less stress and so sleep better. The scatter plot cannot rule it out.',
           'This could be true too: for example, a heavy sports or job schedule could cut both sleep and study time. We cannot confirm it from this plot.',
           'The pattern shows up in 24 students and sleep plausibly matters, so calling it coincidence is not the best choice.',
           'Yes. Each story could be at work, and this plot cannot separate them. A scatter plot shows that two things go together. It does not show why.'],
      ev: 'To find out, run an experiment. Randomly assign volunteers to sleep 6 hours or 8 hours for a few weeks, then compare their results. Random assignment makes the groups alike in stress, schedule and ability, so a difference can be credited to sleep. A survey cannot do that, because students choose their own bedtime.' },
    { key: 'Pizzerias', xt: 'Pizzerias in the town', yt: 'Libraries in the town',
      dom: { x0: 0, x1: 24, y0: 0, y1: 12, gx: 4, gy: 2 },
      data: groupsData([{ n: 8, mx: 3, sx: 1.2, my: 1.5, sy: .6, rg: .1 }, { n: 8, mx: 9, sx: 1.8, my: 4, sy: .9, rg: -.1 }, { n: 8, mx: 16, sx: 2.5, my: 8, sy: 1.3, rg: .1 }], 83, true),
      gl: ['small towns', 'medium towns', 'large towns'],
      desc: 'A made-up set. Each dot is one town. Across: number of pizzerias. Up: number of libraries.',
      ans: 2,
      fb: ['Opening a pizzeria does not create a library. Picture a town adding a pizzeria: its library count would stay the same.',
           'Libraries do not cause pizzerias to open.',
           'Yes. Big towns have more of everything: more pizzerias and more libraries. The <b>size of the town</b> is the lurking variable that drives both.',
           'Not coincidence. The pattern is strong across many towns, and there is a clear reason: town size.',
           'Data alone cannot prove a cause, but here you can name a third variable that explains the pattern: how many people live in the town.'],
      ev: 'The colors show town size. Inside one color, towns of the same size, more pizzerias no longer goes with more libraries. Comparing towns of the same size is how you test for a lurking variable.' },
    { key: 'Soccer and tomatoes', xt: 'Goals scored by a soccer team in a season', yt: 'Tomatoes picked (kg)',
      dom: { x0: 20, x1: 80, y0: 0, y1: 60, gx: 10, gy: 10 },
      data: { pts: [[38, 24], [45, 27], [52, 31], [41, 23], [60, 33], [66, 36], [47, 30], [57, 29]], grp: null },
      desc: 'Each dot is one season, 8 seasons in all. Across: goals scored by a soccer team. Up: kilograms of tomatoes picked by a gardener in a different city.',
      ans: 3,
      fb: ['Scoring goals does not make tomatoes grow in another city. There is no way for one to reach the other.',
           'Tomatoes in another city cannot change how many goals a team scores.',
           'A lurking variable needs a believable link to both. It is hard to name any third thing that changes both a soccer team and a gardener far away.',
           'Yes. With only 8 points, two unrelated things can line up by chance. There is no believable way for either to affect the other, and no believable third variable. With more seasons the pattern would probably fade.',
           'There is no believable story at all here, so we can do better than "cannot tell": coincidence is the best explanation for a pattern in only 8 seasons.'],
      ev: 'Collect more seasons. A real link keeps showing up with more data, and a coincidence usually fades. A correlation with no believable cause and few points deserves a lot of doubt.' }
  ];

  /* ---------- part 4: claims ---------- */
  const trialPts = (() => {
    const R = mulberry(97), out = [];
    [[6, 62], [8, 67]].forEach(([x, m]) => {
      const raw = zs(Array.from({ length: 20 }, () => R() + R() + R() - 1.5));
      raw.forEach(v => out.push([x + (R() - .5) * .7, m + 7 * v]));
    });
    return out;
  })();
  const CLAIMS = [
    { key: 'Breakfast', xt: 'Days per week eating breakfast', yt: 'Test score (points)',
      dom: { x0: -.5, x1: 7.5, y0: 40, y1: 100, gx: 1, gy: 20, xticks: [0, 1, 2, 3, 4, 5, 6, 7] },
      pts: (() => { const xs = [0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 7, 7, 7]; return lineData(xs, .6, 66, 9, 14).map((p, i) => [xs[i], p[1]]); })(),
      claim: 'News site: "Students who eat breakfast more days a week score higher on tests. So free school breakfast will raise test scores."',
      verdict: 'confuses',
      why: 'The data show that breakfast and scores go together. The claim jumps to "free breakfast will raise scores", which is a claim about a cause.',
      reasons: ['The data show breakfast and scores go together, not why. Something else, such as a regular sleep schedule or family income, could cause both.',
                'Since r is less than 1, the two cannot be related at all.',
                'Test scores cannot be compared between students.'],
      rans: 0,
      rfb: ['Right. A correlation can have a lurking variable behind it. Only an experiment, where students are randomly given free breakfast or not, could show what breakfast does by itself.',
            'A moderate r means a moderate association, so the two are related. The issue is not whether they go together. It is whether one causes the other.',
            'Scores can be compared. The problem is not the measuring. It is the jump from "go together" to "causes".'] },
    { key: 'Bike lanes', xt: 'Bike lanes in the city (miles)', yt: 'Bike accidents per year',
      dom: { x0: 0, x1: 40, y0: 0, y1: 600, gx: 10, gy: 100 },
      pts: (() => { const xs = strat(24, 3, 38, 2, 62); return lineData(xs, .8, 280, 100, 63, 20).map((p, i) => [xs[i], p[1]]); })(),
      claim: 'City report: "Cities with more bike lanes have more bike accidents. Bike lanes cause accidents, so we should remove them."',
      verdict: 'confuses',
      why: 'The data show bike lanes and accidents go together. The report says the lanes cause the accidents.',
      reasons: ['A positive r always means one thing causes the other.',
                'Cities with more bike lanes also have many more cyclists. More riders means more accidents, even if each rider is just as safe.',
                'Accidents cannot be counted exactly, so no conclusion is possible.'],
      rans: 1,
      rfb: ['No. A positive r only says the two rise together. It never tells you why. That is why correlation is not proof of causation.',
            'Right. The number of riders is a lurking variable. It drives both the lanes (cities build them where many people ride) and the accidents. Comparing accidents per rider would be a fairer test.',
            'Counts do not have to be exact to show a trend. The problem is the jump from "go together" to "cause".'] },
    { key: 'Sleep trial', trial: true, xt: 'Hours of sleep each night', yt: 'Memory test score (points)',
      dom: { x0: 5, x1: 9, y0: 30, y1: 90, gx: 1, gy: 10, xticks: [6, 8] },
      pts: trialPts,
      claim: 'Study: "We randomly assigned 40 students to sleep 6 hours or 8 hours a night for two weeks. The 8-hour group scored 5 points higher on a memory test, on average. So more sleep improves memory in students like these."',
      verdict: 'careful',
      why: 'This is an experiment. The students were assigned to the groups at random, so the causal claim has support.',
      reasons: ['Any claim that says "improves" confuses correlation and causation.',
                'Only 40 students were used, so no conclusion at all is possible.',
                'Random assignment makes the groups alike apart from sleep, so a difference can be credited to sleep.'],
      rans: 2,
      rfb: ['Not always. The word "improves" is fine when the study is an experiment. What matters is how the data were collected.',
            'A small group is a fair thing to worry about, and a bigger group would be more convincing. But 40 students still give some real evidence, and the key feature of this study is something else.',
            'Right. In an experiment with random assignment, the two groups are alike in everything else (stress, schedule, ability), so the only systematic difference is sleep. That is what allows a cause to be claimed.'] },
    { key: 'Video games', xt: 'Video game hours per week', yt: 'Average grade (%)',
      dom: { x0: 0, x1: 20, y0: 40, y1: 100, gx: 5, gy: 20 },
      pts: (() => { const xs = strat(24, .5, 19.5, 1, 74); return lineData(xs, -.8, 78, 8, 75).map((p, i) => [xs[i], p[1]]); })(),
      claim: 'Survey report: "In a survey of 24 students, students who play more video games per week tend to have lower grades."',
      verdict: 'careful',
      why: 'The report only says the two tend to go together. It does not say the games cause the lower grades.',
      reasons: ['It only says the two go together ("tend to"). It does not claim that the games cause lower grades.',
                'A negative r means the survey must be wrong.',
                'Every correlation hides a cause, so the report is confused.'],
      rans: 0,
      rfb: ['Right. Describing a pattern is fine. The report would confuse correlation and causation only if it said the games lower the grades.',
            'The sign of r is only a direction. A negative r means the dots fall, not that anything is wrong.',
            'Not every correlation is a cause. This report does not claim one, so it does not make the mistake.'] },
    { key: 'Hospitals', xt: 'Hospital stays in 5 years', yt: 'Days unwell last year',
      dom: { x0: -.5, x1: 6.5, y0: 0, y1: 100, gx: 1, gy: 20, xticks: [0, 1, 2, 3, 4, 5, 6] },
      pts: (() => { const xs = [0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6]; return lineData(xs, .8, 45, 15, 12).map((p, i) => [xs[i], p[1]]); })(),
      claim: 'Headline: "Hospitals make you sick! People with more hospital stays spend more days unwell."',
      verdict: 'confuses',
      why: 'The data show more stays go with more days unwell. The headline says the hospital is the cause.',
      reasons: ['A lurking variable cannot be involved when the dots follow a straight pattern.',
                'Sick people are the ones who go to the hospital, so being unwell causes the stays, not the other way round.',
                'The sample must be too small, because hospitals are big.'],
      rans: 1,
      rfb: ['A straight pattern says nothing about whether a third variable is involved. Lurking variables are found by thinking about the situation, not by the shape.',
            'Right. This is reverse causation: y causes x. People who are unwell go to the hospital. The headline has the cause backwards.',
            'The sample size is not the issue here. The problem is the headline reads a cause into a pattern.'] }
  ];

  /* ---------- the lesson ---------- */
  register({
    id: 'correlation-and-causation', level: 'school',
    title: 'Correlation and causation',
    blurb: 'Estimate the correlation coefficient r, read a line of fit in context, and tell when "goes with" does not mean "causes".',
    thumb(c, p) {
      const pal = p.pal; p.cx = 5.2; p.cy = 3.8; p.span = 4.6;
      p.path([[0, 0], [10.4, 0]], { stroke: pal['grid-strong'], width: 1.6 });
      p.path([[0, 0], [0, 7.8]], { stroke: pal['grid-strong'], width: 1.6 });
      const pts = [[1, 1.8], [1.7, 2.9], [2.4, 2.2], [3.1, 3.6], [3.8, 3.1], [4.5, 4.4], [5.2, 4.1], [5.9, 5.3], [6.6, 4.9], [7.3, 6.2], [8, 5.8], [8.8, 7.1], [9.5, 6.6]];
      p.path([[.4, 1.6], [10, 7.2]], { stroke: pal.blue, width: 2.8 });
      pts.forEach(([x, y]) => p.dot(x, y, 4.2, alpha(pal.text, .85), pal.stage, 1.2));
      p.label('r', 8.9, 2, { size: 22, italic: true, color: pal.yellow });
    },
    hook: 'Ice cream sales and drownings rise and fall together. Does ice cream cause drowning? What can a number called r tell you, and what can it never tell you?',
    steps: [
      { title: 'Estimate r from a picture',
        text: String.raw`<p>The <b>correlation coefficient</b>, \(r\), is one number from \(-1\) to \(1\). It tells how closely the dots follow a <em>straight line</em>. The sign is the direction: positive when the dots rise, negative when they fall. The size is the strength: near \(1\) or \(-1\) means the dots hug a line.</p><p>Look at the dots, <b>click the number line</b> under the picture to place your guess, then press <b>Check my guess</b>. The lesson computes the real \(r\) and draws the line of fit.</p><p>Then reshape the picture. Use the slider and the sign buttons, drag any dot, and open the <b>U shape</b> and the <b>outlier</b> pictures. Watch what \(r\) does.</p>`,
        set: { mode: 'est', pat: 'band', sgn: 1, t: .85, seed: 1 } },
      { title: 'Read the line in context',
        text: String.raw`<p>Now real units. Each dot is a student: hours studied (across) and test score (up). The line of fit is \(y = 4x + 50\), and the computed correlation is \(r = 0.89\).</p><p>Drag the yellow guide along the line. At \(5\) hours the line predicts \(4(5) + 50 = 70\) points.</p><p>Answer the three questions in the panel. For each one, pick the sentence that reads the line correctly. One choice makes a causal overclaim and one trusts the line too far away from the data.</p>`,
        set: { mode: 'line', q: 0 } },
      { title: 'Correlation is not causation',
        text: String.raw`<p>A large \(r\) says two things go together. It does not say why. There are four common reasons: \(x\) causes \(y\), \(y\) causes \(x\), a <b>lurking variable</b> causes both, or it is a coincidence.</p><p>Pick a situation, then pick the best explanation. The first is ice cream sales and drownings. After each choice you will read why it fits or does not. When you find the best explanation you will also see what evidence would be needed.</p>`,
        set: { mode: 'cause', sc: 0 } },
      { title: 'Check the argument',
        text: String.raw`<p>News stories often turn a correlation into a cause. Read each claim, then say whether it <b>confuses correlation and causation</b> or is <b>careful</b>. When you are right, pick the reason.</p><p>Not every claim is a mistake. A claim that only describes a pattern is fine, and a well-run experiment can support a cause. Look at how the data were collected and what the claim says.</p>`,
        set: { mode: 'args', cl: 0 } }
    ],
    formal: String.raw`
      <p>A scatter plot shows whether two measurements go together. The <b>correlation coefficient</b> \(r\) puts a number on how well the dots follow a straight line, and the line of fit predicts \(y\) from \(x\). Neither one says why the measurements go together.</p>
      <h3>The correlation coefficient r</h3>
      <p>For \(n\) pairs \((x,y)\), with means \(\bar x\) and \(\bar y\), Pearson's correlation coefficient is
      \[ r = \frac{\sum (x-\bar x)(y-\bar y)}{\sqrt{\sum (x-\bar x)^2 \cdot \sum (y-\bar y)^2}}. \]
      The top adds up how often the two deviations from the means have the same sign. The bottom scales the result so that
      \[ -1 \le r \le 1. \]
      The lesson's readouts use this formula. By hand, a calculator or a spreadsheet (for example the command <code>CORREL</code>) does the same sums.</p>
      <ul>
        <li><b>Sign.</b> \(r&gt;0\): the dots rise as you move right. \(r&lt;0\): they fall. \(r=0\): no straight-line trend.</li>
        <li><b>Size.</b> \(|r|\) near \(1\): the dots hug a line (strong). \(|r|\) near \(0\): they are widely scattered (weak). \(r=\pm1\) only when all dots lie exactly on a line.</li>
        <li><b>Not the slope.</b> \(r\) has no units. A steep line and a flat line can have the same \(r\). The two are linked by \(m = r\cdot\dfrac{s_y}{s_x}\), where \(s_x\) and \(s_y\) are the standard deviations of the \(x\) and \(y\) values.</li>
        <li><b>Only straight lines.</b> A clear U shape has \(r\approx 0\), because the rising half and the falling half cancel. Always look at the scatter plot, not only at \(r\).</li>
        <li><b>Outliers.</b> One dot far from the rest can change \(r\) a lot.</li>
      </ul>
      <p><b>Worked example.</b> The points \((1,2),(2,4),(3,5),(4,4),(5,5)\) have \(\bar x=3\) and \(\bar y=4\). The deviations of \(x\) are \(-2,-1,0,1,2\) and of \(y\) are \(-2,0,1,0,1\). So \(\sum(x-\bar x)(y-\bar y) = 4+0+0+0+2 = 6\), \(\sum(x-\bar x)^2 = 10\) and \(\sum(y-\bar y)^2 = 4+0+1+0+1 = 6\). Then
      \[ r = \frac{6}{\sqrt{10\cdot 6}} \approx 0.77. \]
      The line of fit has slope \(6/10 = 0.6\) and intercept \(4-0.6\cdot 3 = 2.2\), so \(\hat y = 0.6x+2.2\). The slope \(0.6\) and \(r\approx0.77\) are different numbers.</p>
      <h3>Reading the line of fit in context</h3>
      <p>In the study example, \(\hat y = 4x+50\), with \(x\) in hours and \(\hat y\) in points. The <b>slope</b> says that students who studied one hour more scored about \(4\) points more on average. The <b>intercept</b> says the line predicts \(50\) points at \(0\) hours. It is a starting value only when \(x=0\) makes sense. A prediction such as \(4(5)+50=70\) is a typical value, not a promise: real dots scatter around the line.</p>
      <p>Predicting outside the range of the data is <em>extrapolation</em>. At \(15\) hours the line gives \(110\), impossible on a test out of \(100\). Describe a fitted line with words such as "tend to" and "on average", not "causes".</p>
      <h3>Correlation is not causation</h3>
      <p>When \(x\) and \(y\) are correlated, at least four explanations are possible:</p>
      <ul>
        <li>\(x\) causes \(y\).</li>
        <li>\(y\) causes \(x\) (<em>reverse causation</em>): low grades lead to tutoring, so tutoring and low grades are correlated.</li>
        <li>A <em>lurking</em> or <em>confounding variable</em> drives both: hot weather raises ice cream sales and swimming. Age raises shoe size and reading score.</li>
        <li>Coincidence, especially with few data points.</li>
      </ul>
      <p>An <b>observational study</b> records what happens and cannot separate these stories, because the people in it chose their own behavior. An <b>experiment with random assignment</b> can: chance decides who gets the treatment, so the groups are alike in every other way, and a difference in outcomes can be credited to the treatment. That is why a causal claim needs an experiment, or very strong supporting evidence, and a correlation alone is not enough.</p>
      <h3>Spotting a confused argument</h3>
      <p>Ask three questions. How were the data collected? Does the claim say the variables go together, or that one causes the other? Is there a believable third variable or a reverse story? A description such as "students who play more games tend to have lower grades" is fine. A conclusion such as "so games lower grades" or "so ban bike lanes" needs more than a correlation.</p>`,
    check: [
      { q: 'In a group of 50 students, the correlation between hours of TV watched per week and test score is r = −0.6. Which statement is best supported by this information alone?',
        choices: ['Watching TV causes lower test scores.',
                  'Students who watch more TV tend to have lower scores, but this alone does not show that TV causes the lower scores.',
                  'Each extra hour of TV lowers a score by 0.6 points.',
                  'TV explains all of the differences in scores, because r is negative.'], answer: 1,
        why: 'A negative r says the two tend to move in opposite directions. It does not say why: a lurking variable, such as how much time is left for homework, could be involved. The slope, not r, would give points per hour, and r = −0.6 is not a slope. A moderate r does not mean one thing explains all the scores.',
        hint: 'Does r tell you the cause, or only how the two tend to move together? Is r the same thing as a slope?' },
      { q: 'A scatter plot shows 12 dots that form a clear, symmetric U shape: starting high on the left, falling to a low point in the middle, then rising to the same height on the right. The left half is the mirror image of the right half. What is r closest to?',
        choices: ['r is close to 1, because the pattern is very clear', 'r is close to −1, because the dots first fall',
                  'r is about 0.5, because half of the dots rise', 'r is close to 0, because r only measures straight-line patterns'], answer: 3,
        why: 'The falling half and the rising half cancel each other out, so there is no overall straight-line trend and r is about 0. The dots are not scattered at random. They follow a clear curve, but r only measures how well the dots follow a straight line.',
        hint: 'Does r measure any clear pattern, or only a straight-line one? What happens when half the dots fall and half rise?' }
    ],
    links: { prereq: ['scatter-plots-and-lines-of-fit'], related: ['mean-median-and-spread', 'samples-and-populations', 'forms-of-a-linear-equation'] },

    mount({ stage, controls: C }) {
      const st = {
        mode: 'est', pat: 'band', sgn: 1, t: .85, seed: 1, pts: [], guess: null, rev: false, preset: 0,
        q: 0, gx: 5, lq: [{ tried: [], solved: false }, { tried: [], solved: false }, { tried: [], solved: false }],
        sc: 0, scs: SC.map(() => ({ tried: [], solved: false })),
        cl: 0, cls: CLAIMS.map(() => ({ vTried: [], vDone: false, rTried: [], rDone: false }))
      };
      const P = new Plane(stage, { span: 5 });
      st.pts = buildEst(st.pat, st.sgn, st.t, st.seed);

      /* ---------- geometry ---------- */
      const geo = (p, d, extraB, topB) => {
        const ml = clamp(p.w * .11, 40, 54), mr = 16, mt = 62 + (topB || 0), mb = 54 + (extraB || 0), pw = p.w - ml - mr, ph = p.h - mt - mb;
        return { ml, mr, mt, mb, pw, ph,
          X: x => ml + (x - d.x0) / (d.x1 - d.x0) * pw, Y: y => mt + ph - (y - d.y0) / (d.y1 - d.y0) * ph,
          ix: px => d.x0 + (px - ml) / pw * (d.x1 - d.x0), iy: py => d.y0 + (mt + ph - py) / ph * (d.y1 - d.y0) };
      };
      const nlH = p => clamp(p.h * .2, 62, 84);
      const estGeo = p => geo(p, { x0: 0, x1: 10, y0: 0, y1: 10 }, nlH(p));
      const nlGeo = (p, g) => {
        const x0 = g.ml + 12, x1 = p.w - g.mr - 12, y = p.h - nlH(p) + 38;
        return { x0, x1, y, V: v => x0 + (v + 1) / 2 * (x1 - x0), iv: px => (px - x0) / (x1 - x0) * 2 - 1 };
      };
      const curScene = () => st.mode === 'cause' ? SC[st.sc] : CLAIMS[st.cl];
            const lineGeo = p => geo(p, LINE_DOM);

      const mkT = (c, pal, fs) => (s, x, y, o = {}) => {
        const px = o.px || fs;
        c.font = o.it ? `italic ${px + 4}px "STIX Two Text","Cambria Math","Times New Roman",serif` : `${o.bold ? 700 : 500} ${px}px "Hanken Grotesk","Helvetica Neue",Arial,sans-serif`;
        c.textAlign = o.align || 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 4; c.strokeStyle = pal.stage;
        c.strokeText(s, x, y); c.fillStyle = o.color || pal.muted; c.fillText(s, x, y);
      };
      const mkSeg = c => (x0, y0, x1, y1, col, w, dash) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.strokeStyle = col; c.lineWidth = w; c.setLineDash(dash || []); c.lineCap = 'round'; c.stroke(); c.setLineDash([]); };

      /* grid, axes, tick numbers, axis titles */
      const axes = (c, p, g, d, T, seg, pal, fs, xt, yt, noNums) => {
        c.lineWidth = 1; c.strokeStyle = pal.grid; c.beginPath();
        const xs = d.xticks || [], gxs = [];
        if (d.xticks) d.xticks.forEach(v => gxs.push(v)); else for (let x = d.x0; x <= d.x1 + 1e-9; x += d.gx) gxs.push(x);
        const gys = []; for (let y = d.y0; y <= d.y1 + 1e-9; y += d.gy) gys.push(y);
        gxs.forEach(x => { c.moveTo(g.X(x), g.mt); c.lineTo(g.X(x), g.Y(d.y0)); });
        gys.forEach(y => { c.moveTo(g.ml, g.Y(y)); c.lineTo(g.ml + g.pw, g.Y(y)); });
        c.stroke();
        seg(g.ml, g.Y(d.y0), g.ml + g.pw, g.Y(d.y0), pal['grid-strong'], 2); seg(g.ml, g.Y(d.y0), g.ml, g.mt, pal['grid-strong'], 2);
        if (!noNums || noNums === 'half') {
          gxs.forEach(x => T(num(x), g.X(x), g.Y(d.y0) + 16, { px: fs - 1 }));
          gys.forEach((y, i) => { if (i > 0 || d.y0 !== 0) T(num(y), g.ml - 8, g.Y(y), { align: 'right', px: fs - 1 }); });
        }
        T(xt, g.ml + g.pw / 2, g.Y(d.y0) + 36, { color: pal.text, px: fs });
        T(yt, g.ml + 6, 46, { align: 'left', color: pal.text, px: fs });
      };

      P.onDraw = (c, p) => {
        const pal = p.pal, fs = clamp(p.w / 33, 11.5, 14.5), T = mkT(c, pal, fs), seg = mkSeg(c);
        const dotR = clamp(p.w / 80, 4.5, 6.5), ringed = (x, y) => { c.beginPath(); c.arc(x, y, dotR + 8, 0, Math.PI * 2); c.strokeStyle = pal.yellow; c.lineWidth = 2.5; c.stroke(); };
        const dot = (x, y, col) => { c.beginPath(); c.arc(x, y, dotR, 0, Math.PI * 2); c.fillStyle = col; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 2; c.stroke(); };
        const GC = [pal.green, pal.yellow, pal.red];

        /* ---------------- part 1 ---------------- */
        if (st.mode === 'est') {
          const g = estGeo(p), d = { x0: 0, x1: 10, y0: 0, y1: 10, gx: 2, gy: 2 }, nl = nlGeo(p, g), { X, Y } = g;
          axes(c, p, g, d, T, seg, pal, fs, 'x', 'y');
          const r = corr(st.pts);
          if (st.rev) {
            const f = fit(st.pts);
            c.save(); c.beginPath(); c.rect(g.ml, g.mt - 2, g.pw + 2, g.ph + 4); c.clip();
            seg(X(0), Y(f.m * 0 + f.b), X(10), Y(f.m * 10 + f.b), pal.blue, 3.4);
            c.restore();
            T('r = ' + rf(r), p.w - 14, 28, { align: 'right', color: pal.yellow, px: fs + 6, bold: true });
          } else T('r = ?', p.w - 14, 28, { align: 'right', color: pal.muted, px: fs + 6, bold: true });
          st.pts.forEach(([x, y], i) => dot(X(x), Y(y), alpha(pal.text, .85)));
          if (st.pat === 'out') { const [ox, oy] = st.pts[23]; ringed(X(ox), Y(oy)); T('drag me', X(ox) - dotR - 14, Y(oy) + (Y(oy) < g.mt + 30 ? 20 : -2), { align: 'right', color: pal.text, px: fs - .5 }); }

          /* the number line for the guess */
          const lineY = nl.y;
          T(st.guess === null ? 'Where is r? Click the number line.' : st.rev ? 'Your guess ' + rf(st.guess) + '   Computed r = ' + rf(r) : 'Your guess ' + rf(st.guess) + '. Press Check my guess.', p.w / 2, lineY - 28, { color: pal.text, px: fs });
          seg(nl.x0, lineY, nl.x1, lineY, pal['grid-strong'], 3);
          for (let k = -10; k <= 10; k++) { const major = k % 5 === 0; seg(nl.V(k / 10), lineY - (major ? 8 : 4), nl.V(k / 10), lineY + (major ? 8 : 4), pal['grid-strong'], major ? 2 : 1.2); }
          [-1, -.5, 0, .5, 1].forEach(v => T(v === 0 ? '0' : v === 1 ? '1' : v === -1 ? '−1' : v < 0 ? '−0.5' : '0.5', nl.V(v), lineY + 20, { px: fs - 1 }));
          if (st.rev) { seg(nl.V(r), lineY - 15, nl.V(r), lineY + 15, pal.yellow, 4); }
          if (st.guess !== null) { c.beginPath(); c.arc(nl.V(st.guess), lineY, 9.5, 0, Math.PI * 2); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.brass; c.lineWidth = 3.2; c.stroke(); }
        }

        /* ---------------- part 2 ---------------- */
        if (st.mode === 'line') {
          const g = lineGeo(p), d = LINE_DOM, { X, Y } = g, f = x => LM * x + LB;
          axes(c, p, g, d, T, seg, pal, fs, 'Hours studied', 'Test score (points)');
          seg(g.ml, Y(100), g.ml + g.pw, Y(100), alpha(pal.muted, .8), 1.5, [3, 5]);
          T('highest possible score: 100', g.ml + 6, Y(100) - 11, { align: 'left', px: fs - 1 });
          /* range of the data */
          const by = Y(12);
          seg(X(LINE_XMIN), by, X(LINE_XMAX), by, alpha(pal.muted, .9), 2); seg(X(LINE_XMIN), by - 5, X(LINE_XMIN), by + 5, alpha(pal.muted, .9), 2); seg(X(LINE_XMAX), by - 5, X(LINE_XMAX), by + 5, alpha(pal.muted, .9), 2);
          T('range of the data', (X(LINE_XMIN) + X(LINE_XMAX)) / 2, by - 14, { px: fs - 1 });
          c.save(); c.beginPath(); c.rect(g.ml, g.mt - 2, g.pw + 2, g.ph + 4); c.clip();
          seg(X(0), Y(f(0)), X(16), Y(f(16)), pal.blue, 3.6);
          c.restore();
          LINE_PTS.forEach(([x, y]) => dot(X(x), Y(y), alpha(pal.text, .85)));
          T('y = ' + LM + 'x + ' + LB, g.ml + 6, 28, { align: 'left', color: pal.blue, px: fs + 2, bold: true });
          T('r = ' + rf(LINE_R), p.w - 14, 28, { align: 'right', color: pal.yellow, px: fs + 2, bold: true });
          if (st.q === 0) {
            const a = 2, b = 6, ya = f(a), yb = f(b);
            seg(X(a), Y(ya), X(b), Y(ya), pal.green, 3.4); seg(X(b), Y(ya), X(b), Y(yb), pal.red, 3.4);
            T('+4 hours', (X(a) + X(b)) / 2, Y(ya) + 15, { color: pal.green, px: fs, bold: true });
            T('+16 points', X(b) + 8, (Y(ya) + Y(yb)) / 2 + 2, { align: 'left', color: pal.red, px: fs, bold: true });
          }
          if (st.q === 1) {
            c.beginPath(); c.arc(X(0), Y(LB), 9, 0, Math.PI * 2); c.fillStyle = alpha(pal.yellow, .9); c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 2; c.stroke();
            T('0 hours: 50', X(0) + 16, Y(LB) + 18, { align: 'left', color: pal.text, px: fs, bold: true });
          }
          /* the guide */
          const gx = st.gx, gy = f(gx), px = X(gx), py = clamp(Y(gy), g.mt, Y(0));
          seg(px, Y(0), px, py, pal.yellow, 2.4, [6, 5]); seg(g.ml, py, px, py, pal.yellow, 2.4, [6, 5]);
          c.beginPath(); c.arc(px, py, 7.5, 0, Math.PI * 2); c.fillStyle = pal.yellow; c.fill(); c.strokeStyle = pal.brass; c.lineWidth = 3; c.stroke();
          const txt = num(gx) + (gx === 1 ? ' hour' : ' hours') + ' → ' + num(gy) + ' points', tw = (() => { c.font = `500 ${fs + 1}px "Hanken Grotesk",Arial,sans-serif`; return c.measureText(txt).width + 16; })();
          const ty = Y(30), bx = clamp(px - tw / 2, g.ml + 2, p.w - tw - 6);
          c.beginPath(); c.roundRect ? c.roundRect(bx, ty - 12, tw, 24, 8) : c.rect(bx, ty - 12, tw, 24); c.fillStyle = alpha(pal.stage, .94); c.fill(); c.strokeStyle = pal.yellow; c.lineWidth = 1.5; c.stroke();
          T(txt, bx + tw / 2, ty, { color: pal.text, px: fs + 1 });
        }

        /* ---------------- parts 3 and 4 ---------------- */
        if (st.mode === 'cause' || st.mode === 'args') {
          const s = curScene(), d = s.dom, g = geo(p, d, 0, st.mode === 'cause' && SC[st.sc].gl ? 18 : 0), { X, Y } = g;
          const isCause = st.mode === 'cause', data = isCause ? s.data.pts : s.pts;
          const grp = isCause ? s.data.grp : null, showG = isCause && grp && st.scs[st.sc].solved;
          axes(c, p, g, d, T, seg, pal, fs, s.xt, s.yt);
          const dots = data.map(([x, y], i) => ({ x, y, col: showG ? GC[grp[i]] : alpha(pal.text, .85) }));
          if (s.trial) {
            [6, 8].forEach(x => {
              const sub = data.filter(q => Math.abs(q[0] - x) < .5), m = mean(sub.map(q => q[1]));
              seg(X(x - .55), Y(m), X(x + .55), Y(m), pal.blue, 3.4);
              T('mean ' + pct(m), X(x), Y(m) - 14 - 0, { color: pal.blue, px: fs, bold: true });
            });
            T('randomly assigned groups', p.w - 14, 28, { align: 'right', color: pal.text, px: fs + 1, bold: true });
          } else {
            T('r = ' + rf(corr(data)), p.w - 14, 28, { align: 'right', color: pal.yellow, px: fs + 4, bold: true });
          }
          dots.forEach(q => dot(X(q.x), Y(q.y), q.col));
          T(s.key, g.ml + 6, 28, { align: 'left', color: pal.text, px: fs + 1, bold: true });
          if (showG) {
            let x = g.ml + 6; const y = 66;
            s.gl.forEach((lab, i) => {
              c.beginPath(); c.arc(x + 5, y, 5, 0, Math.PI * 2); c.fillStyle = GC[i]; c.fill();
              c.font = `500 ${fs - 1}px "Hanken Grotesk",Arial,sans-serif`; const w = c.measureText(lab).width;
              T(lab, x + 14, y, { align: 'left', color: pal.text, px: fs - 1 }); x += w + 28;
            });
          }
        }
      };

      /* ---------- panel: a block of controls per mode ---------- */
      const probe = C.readout(), host = probe.parentElement; probe.remove();
      const group = fn => {
        const before = new Set(host.children); fn();
        const w = h('div', { class: 'grp' }, [...host.children].filter(e => !before.has(e))); host.append(w); return w;
      };
      const fbHtml = (title, body) => `<span class="k">${title}</span><br>${body}`;
      const wide = els => els.forEach(e => { e.style.cssText = 'border-radius:10px;text-align:left;justify-content:flex-start;width:100%;line-height:1.35;padding:8px 14px;height:auto;'; });
      const mark = (btns, state, ans, texts) => {
        btns.forEach((b, i) => {
          b.textContent = texts[i];
          b.classList.toggle('primary', state.solved && i === ans);
          b.disabled = state.solved ? i !== ans : false;
          b.style.opacity = state.tried.includes(i) && !state.solved ? '.5' : '';
        });
      };
      const choiceRow = (n, onPick) => { const els = C.buttons(Array.from({ length: n }, (_, i) => ({ label: '', onClick: () => onPick(i) }))); wide(els); return els; };
      const pickRow = (names, onPick) => C.buttons(names.map((nm, i) => ({ label: nm, onClick: () => onPick(i) })));

      /* ===== part 1 group ===== */
      let roEst, fbEst, patBtns, signBtns, sliderT, gBand, checkBtn;
      const gEst = group(() => {
        roEst = C.readout(); fbEst = C.readout();
        C.title('Reshape the picture');
        patBtns = C.buttons([
          { label: 'Straight band', onClick: () => setPat('band') },
          { label: 'U shape', onClick: () => setPat('u') },
          { label: 'Band with an outlier', onClick: () => setPat('out') }]);
        gBand = group(() => {
          sliderT = C.slider({ label: 'How tightly the dots hug the line', min: 0, max: 1, step: .05, value: st.t, format: tightWord, onInput: v => { st.t = Math.round(v * 100) / 100; rebuild(); } });
          signBtns = C.buttons([
            { label: 'Positive', onClick: () => { st.sgn = 1; rebuild(); } },
            { label: 'Negative', onClick: () => { st.sgn = -1; rebuild(); } },
            { label: 'New picture', onClick: () => { st.preset = (st.preset + 1) % PRESETS.length; const [s, t, sd] = PRESETS[st.preset]; st.sgn = s; st.t = t; st.seed = sd; sliderT.set(t); rebuild(); } }]);
        });
        C.title('Your guess');
        const bb = C.buttons([
          { label: 'Check my guess', primary: true, onClick: () => { if (st.guess === null) { nudge = true; } else { st.rev = true; nudge = false; } draw(); } },
          { label: 'Guess again', onClick: () => { st.guess = null; st.rev = false; nudge = false; draw(); } }]);
        checkBtn = bb[0];
        C.hint('Click or drag on the number line to place your guess. You can also drag any dot in the picture.');
      });
      let nudge = false;
      const setPat = pat => { st.pat = pat; rebuild(); };
      function rebuild() { st.pts = buildEst(st.pat, st.sgn, st.t, st.seed); st.guess = null; st.rev = false; nudge = false; draw(); }

      const updEst = () => {
        patBtns.forEach((b, i) => b.classList.toggle('primary', ['band', 'u', 'out'][i] === st.pat));
        signBtns[0].classList.toggle('primary', st.sgn === 1); signBtns[1].classList.toggle('primary', st.sgn === -1);
        gBand.style.display = st.pat === 'band' ? '' : 'none';
        const r = corr(st.pts), n = st.pts.length;
        if (!st.rev) {
          roEst.innerHTML = `<span class="k">Dots</span> ${n}<br><span class="k">Your guess</span> ${st.guess === null ? 'not placed yet' : rf(st.guess)}<br><span class="k">r</span> hidden until you check`;
          fbEst.innerHTML = nudge ? fbHtml('First guess', 'Click the number line under the picture to place a guess, then check it.')
            : fbHtml('Try it', 'Is r positive or negative? Do the dots hug a line (near 1 or −1) or are they spread out (near 0)? Place your guess, then press <b>Check my guess</b>.');
          return;
        }
        const f = fit(st.pts), a = Math.abs(r), d = Math.abs(st.guess - r);
        roEst.innerHTML = `<span class="k">Your guess</span> ${rf(st.guess)}<br><span class="k">Computed r</span> <b>${rf(r)}</b> (Pearson formula)<br><span class="k">Off by</span> ${rf(d)}<br><span class="k">Line of fit</span> ${linEq(+f.m.toFixed(2), +f.b.toFixed(1))}`;
        let gtxt;
        if (st.pat === 'u') gtxt = a < .15 && Math.abs(st.guess) <= .15 ? 'Right. You saw that a curve is not a straight-line pattern.' : 'Not close. The dots do make a clear pattern, but it is a curve, not a straight line. Read on to see why that matters.';
        else if (d <= .1) gtxt = 'Very close. You read both the direction and the strength well.';
        else if (Math.sign(st.guess) !== Math.sign(r) && a >= .2 && Math.abs(st.guess) >= .1) gtxt = `The sign is the other way. The dots ${r > 0 ? 'rise' : 'fall'} from left to right, so r is ${r > 0 ? 'positive' : 'negative'}.`;
        else if (Math.abs(st.guess) > a) gtxt = 'You guessed a stronger relationship than the computed one. The dots are more spread out around the line than they look at first.';
        else gtxt = 'You guessed a weaker relationship than the computed one. The dots hug the line more closely than they look at first.';
        let ex;
        if (st.pat === 'u') {
          ex = `<b>r is ${rf(r)}, yet the dots follow a clear curve.</b> The left half falls and the right half rises, and the two cancel. r measures only <em>straight-line</em> association, so it can miss a strong pattern that is not a line.` + (Math.abs(st.guess) > .3 ? ' A clear pattern tempts people to guess a big r, but this pattern is a curve.' : '');
        } else if (st.pat === 'out') {
          const r23 = corr(st.pts.slice(0, 23));
          ex = `With the ringed dot, r = ${rf(r)}. Without it, the other 23 dots have r = ${rf(r23)}. Drag the ringed dot to the bottom right corner and watch r fall: <b>one dot far from the pattern can move r a lot.</b> Then bring it back to the band.`;
        } else {
          ex = `<b>Sign:</b> ${r > .005 ? 'positive, the dots rise as you move right' : r < -.005 ? 'negative, the dots fall as you move right' : 'zero, no straight-line trend'}. <b>Size:</b> ${sizeWord(a)} (${rf(a)} out of 1). The closer the dots are to the line, the closer |r| is to 1. <b>Not the slope:</b> the line's slope is ${num(f.m)}, a different number. r says how tightly the dots hug a line, not how steep it is.`;
        }
        fbEst.innerHTML = fbHtml('Your guess', gtxt) + '<br><br>' + fbHtml('What r says', ex);
      };

      /* ===== part 2 group ===== */
      let roLine, lqBtns, lqPrompt, lqChoices, fbLine;
      const gLine = group(() => {
        roLine = C.readout();
        C.title('Which sentence is correct?');
        lqBtns = pickRow(LQ.map(q => q.name), i => { st.q = i; draw(); });
        lqPrompt = C.readout(); lqPrompt.style.cssText = 'border-top:0;padding-top:0;font-weight:600;';
        lqChoices = choiceRow(4, i => {
          const state = st.lq[st.q], q = LQ[st.q];
          if (state.solved) return;
          if (i === q.ans) state.solved = true; else if (!state.tried.includes(i)) state.tried.push(i);
          state.last = i; draw();
        });
        fbLine = C.readout();
        C.hint('Drag the yellow guide along the line. Wrong picks stay faded, so you can try again.');
      });
      const updLine = () => {
        const s = sums(LINE_PTS), g = st.gx, y = LM * g + LB, notes = [];
        if (g < LINE_XMIN - 1e-9 || g > LINE_XMAX + 1e-9) notes.push(`This is outside the data (${f1(LINE_XMIN)} to ${f1(LINE_XMAX)} hours), so it is extrapolation. Treat it with care.`);
        if (y > 100 + 1e-9) notes.push('The highest possible score is 100, so the line fails here.');
        roLine.innerHTML = `<span class="k">Line of fit</span> y = ${LM}x + ${LB}<br>` +
          `<span class="k">Sums</span> Σ(x−x̄)(y−ȳ) = ${s.sxy.toFixed(1)}, Σ(x−x̄)² = ${s.sxx.toFixed(1)}, Σ(y−ȳ)² = ${s.syy.toFixed(1)}<br>` +
          `<span class="k">r</span> = ${s.sxy.toFixed(1)} ÷ √(${s.sxx.toFixed(1)} × ${s.syy.toFixed(1)}) = <b>${rf(LINE_R)}</b><br>` +
          `<span class="k">Guide</span> ${num(g)} ${g === 1 ? 'hour' : 'hours'}: ${LM} × ${num(g)} + ${LB} = ${num(y)} points` + (notes.length ? '<br>' + notes.join(' ') : '');
        lqBtns.forEach((b, i) => b.classList.toggle('primary', st.q === i));
        const q = LQ[st.q], state = st.lq[st.q];
        lqPrompt.textContent = q.q;
        mark(lqChoices, state, q.ans, q.ch);
        if (state.last === undefined) fbLine.innerHTML = fbHtml('Your turn', 'Pick the sentence you think reads the line correctly.');
        else fbLine.innerHTML = fbHtml(state.last === q.ans ? 'Right' : 'Not quite', q.fb[state.last]) + (state.solved && st.lq.every(z => z.solved) ? '<br><br>' + fbHtml('All three done', 'A line of fit gives a rate (slope), a starting value (intercept) and predictions that are only trustworthy inside the data. Use words like "tend to" and "on average".') : '');
      };

      /* ===== part 3 group ===== */
      let roCause, scBtns, causeChoices, fbCause;
      const gCause = group(() => {
        roCause = C.readout();
        C.title('Pick a situation');
        scBtns = pickRow(SC.map(s => s.key), i => { st.sc = i; draw(); });
        C.title('What is the best explanation?');
        causeChoices = choiceRow(5, i => {
          const state = st.scs[st.sc], s = SC[st.sc];
          if (state.solved) return;
          if (i === s.ans) state.solved = true; else if (!state.tried.includes(i)) state.tried.push(i);
          state.last = i; draw();
        });
        fbCause = C.readout();
        C.hint('A dot is one month, child, student or town. Colors appear when you find a lurking variable.');
      });
      const withinR = s => { const out = []; for (let gi = 0; gi < s.gl.length; gi++) out.push(corr(s.data.pts.filter((_, i) => s.data.grp[i] === gi))); return out; };
      const updCause = () => {
        scBtns.forEach((b, i) => { b.classList.toggle('primary', st.sc === i); });
        const s = SC[st.sc], state = st.scs[st.sc], n = s.data.pts.length;
        roCause.innerHTML = `<span class="k">Situation</span> ${s.desc}<br><span class="k">Dots</span> ${n}<br><span class="k">r</span> ${rf(corr(s.data.pts))}`;
        mark(causeChoices, state, s.ans, OPTS);
        if (state.last === undefined) fbCause.innerHTML = fbHtml('Your turn', 'The dots show that x and y go together. Why? Pick the best explanation.');
        else {
          let t = fbHtml(state.last === s.ans ? 'Yes' : 'Not the best choice', s.fb[state.last]);
          if (state.solved) {
            if (s.data.grp) t += `<br><br>` + fbHtml('Inside each color', `r = ${withinR(s).map(rf).join(', ')} for ${s.gl.join(', ')}. The overall trend comes from the groups, not from x acting on y.`);
            t += '<br><br>' + fbHtml('What evidence would settle it', s.ev);
          }
          fbCause.innerHTML = t;
        }
      };

      /* ===== part 4 group ===== */
      let roArg, clBtns, vBtns, rBtns, fbArg, rTitle;
      const gArg = group(() => {
        roArg = C.readout();
        C.title('Pick a claim');
        clBtns = pickRow(CLAIMS.map((_, i) => String(i + 1)), i => { st.cl = i; draw(); });
        C.title('Does the claim confuse correlation and causation?');
        vBtns = C.buttons([
          { label: 'It confuses them', onClick: () => verdict('confuses') },
          { label: 'It is careful', onClick: () => verdict('careful') }]);
        rTitle = h('p', { class: 'ctl-title' }, 'Why?'); host.append(rTitle);
        rBtns = choiceRow(3, i => reason(i));
        fbArg = C.readout();
        C.hint('The dots are the data behind each claim. First decide, then say why.');
      });
      const verdict = v => {
        const s = st.cls[st.cl], c = CLAIMS[st.cl];
        if (s.vDone) return;
        s.last = 'v';
        if (v === c.verdict) { s.vDone = true; s.lastV = v; } else { s.vWrong = v; if (!s.vTried.includes(v)) s.vTried.push(v); }
        draw();
      };
      const reason = i => {
        const s = st.cls[st.cl], c = CLAIMS[st.cl];
        if (s.rDone || !s.vDone) return;
        s.last = 'r'; s.lastR = i;
        if (i === c.rans) s.rDone = true; else if (!s.rTried.includes(i)) s.rTried.push(i);
        draw();
      };
      const updArg = () => {
        clBtns.forEach((b, i) => { b.classList.toggle('primary', st.cl === i); });
        const c = CLAIMS[st.cl], s = st.cls[st.cl];
        roArg.innerHTML = `<span class="k">Claim ${st.cl + 1}</span><br>${c.claim}` + (c.trial ? '' : `<br><span class="k">Data behind it</span> ${c.pts.length} dots, r = ${rf(corr(c.pts))}`);
        vBtns.forEach((b, i) => {
          const val = ['confuses', 'careful'][i];
          b.classList.toggle('primary', s.vDone && c.verdict === val);
          b.disabled = s.vDone ? c.verdict !== val : false;
          b.style.opacity = s.vTried.includes(val) && !s.vDone ? '.5' : '';
        });
        rTitle.style.display = s.vDone ? '' : 'none';
        rBtns.forEach((b, i) => { b.style.display = s.vDone ? '' : 'none'; });
        if (s.vDone) mark(rBtns, { solved: s.rDone, tried: s.rTried }, c.rans, c.reasons);
        if (!s.vDone) {
          if (s.vWrong) fbArg.innerHTML = fbHtml('Look again', s.vWrong === 'confuses'
            ? 'This claim does not make the mistake. ' + (c.trial ? 'Look at how the students were put into the two groups.' : 'Read exactly what it says: does it claim a cause, or only describe a pattern?')
            : 'This claim does go too far. Ask: what does the claim conclude, and what do the data actually show?');
          else fbArg.innerHTML = fbHtml('Your call', 'Does the claim treat "goes together" as "causes"? Or does it stay with what the data show?');
        } else if (!s.rDone) {
          fbArg.innerHTML = fbHtml('Right', c.why + ' Now pick the reason.') + (s.lastR !== undefined && s.last === 'r' ? '<br><br>' + fbHtml('Not quite', c.rfb[s.lastR]) : '');
        } else {
          const all = st.cls.every(z => z.rDone);
          fbArg.innerHTML = fbHtml('Good reasoning', c.rfb[c.rans]) + (all ? '<br><br>' + fbHtml('All five done', 'Before you trust a causal claim, ask how the data were collected, whether a third variable could explain it, and whether the cause could run the other way. Only an experiment with random assignment settles a cause well.') : '');
        }
      };

      const showGroups = () => {
        gEst.style.display = st.mode === 'est' ? '' : 'none';
        gLine.style.display = st.mode === 'line' ? '' : 'none';
        gCause.style.display = st.mode === 'cause' ? '' : 'none';
        gArg.style.display = st.mode === 'args' ? '' : 'none';
      };
      const upd = () => { showGroups(); if (st.mode === 'est') updEst(); if (st.mode === 'line') updLine(); if (st.mode === 'cause') updCause(); if (st.mode === 'args') updArg(); };
      function draw() { P.draw(); upd(); }

      /* ---------- dragging ---------- */
      draggable(P, {
        hit: (px, py) => {
          if (st.mode === 'est') {
            const g = estGeo(P), nl = nlGeo(P, g);
            if (py > nl.y - 22 && px >= nl.x0 - 14 && px <= nl.x1 + 14) return 'g';
            let best = null, bd = 18;
            st.pts.forEach(([x, y], i) => { const dd = Math.hypot(px - g.X(x), py - g.Y(y)); if (dd <= bd) { bd = dd; best = 'p' + i; } });
            return best;
          }
          if (st.mode === 'line') {
            const g = lineGeo(P), gy = clamp(g.Y(LM * st.gx + LB), g.mt, g.Y(0));
            return Math.abs(px - g.X(st.gx)) < 18 && py > gy - 18 && py < g.Y(0) + 4 ? 'x' : null;
          }
          return null;
        },
        move: (hd, mx, my) => {
          const px = P.X(mx), py = P.Y(my);
          if (st.mode === 'est') {
            const g = estGeo(P), nl = nlGeo(P, g);
            if (hd === 'g') { st.guess = clamp(Math.round(nl.iv(px) * 10) / 10, -1, 1); nudge = false; }
            else { const i = +hd.slice(1); st.pts[i] = [clamp(snap(g.ix(px), .1), 0, 10), clamp(snap(g.iy(py), .1), 0, 10)]; }
          }
          if (st.mode === 'line') { const g = lineGeo(P); st.gx = clamp(snap(g.ix(px), .5), 0, 16); }
          draw();
        }
      });
      if (P.coordEl) P.coordEl.style.display = 'none';

      /* ---------- steps ---------- */
      const apply = (patch, immediate) => {
        if (patch.mode) st.mode = patch.mode;
        if (patch.mode === 'est') {
          st.pat = patch.pat; st.sgn = patch.sgn; st.t = patch.t; st.seed = patch.seed; sliderT.set(st.t);
          st.pts = buildEst(st.pat, st.sgn, st.t, st.seed); st.guess = null; st.rev = false; nudge = false;
        }
        if (patch.mode === 'line') { st.q = patch.q; st.gx = 5; }
        if (patch.mode === 'cause') st.sc = patch.sc;
        if (patch.mode === 'args') st.cl = patch.cl;
        draw();
      };
      draw();
      return { destroy: () => P.destroy(), apply };
    }
  });
}
