/* =====================================================================
   SCHOOL — Samples and populations
   ===================================================================== */
{
  /* ---------- the population: 200 students in four groups, 90 of them walk ---------- */
  const ZONES = [
    { name: 'Front door', a: 15, b: 23, cx: 1.4, ly: 16.9, y0: 16.0 },
    { name: 'Library', a: 12, b: 14, cx: 11.4, ly: 16.9, y0: 16.0 },
    { name: 'Gym', a: 6, b: 10, cx: 1.4, ly: 11.7, y0: 10.8 },
    { name: 'Bus lot', a: 4, b: 6, cx: 11.4, ly: 11.7, y0: 10.8 }
  ];
  const TRUTH = 45, N_POP = 200, SP = .8;
  const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const shuffle = (arr, r) => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
  const POP = (() => {
    const r = mulberry(2024), out = [];
    ZONES.forEach((z, zi) => {
      const A = shuffle(Array.from({ length: 20 }, (_, i) => i < z.a ? 1 : 0), r), B = shuffle(Array.from({ length: 30 }, (_, i) => i < z.b ? 1 : 0), r);
      [...A, ...B].forEach((w, i) => out.push({ zone: zi, walk: w, x: z.cx + (i % 10) * SP, y: z.y0 - Math.floor(i / 10) * SP }));
    });
    return out;
  })();
  const pctOf = (k, n) => Math.round(k / n * 1000) / 10;
  const sx = v => 1 + v * .18;                       /* percent -> x on the strip */
  const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);
  const rule = n => Math.round(100 / Math.sqrt(n));  /* rule-of-thumb "give or take" in points */

  /* ---------- compare step: four surveys about a new gym (school of 600, 54% really say yes) ---------- */
  const SURVEYS = [
    { name: 'Basketball game', short: 'Basketball game', n: 40, yes: 34, fair: false,
      how: 'You asked 40 students at the basketball game. 34 said yes.',
      why: 'Students at a game like sports, so they are more likely to want a new gym. This sample leans toward one kind of student. It is biased, and 85% is probably too high.' },
    { name: 'Online vote', short: 'Online vote', n: 60, yes: 51, fair: false,
      how: 'The school website let anyone vote. 60 students voted and 51 said yes.',
      why: 'Students chose to vote themselves, and people who care a lot are the ones who vote. This is a volunteer group, not a random one. 60 votes sounds like a lot, but a big biased sample is still biased.' },
    { name: 'Random, 40 students', short: 'Random, 40', n: 40, yes: 22, fair: true,
      how: 'You picked 40 names at random from the whole school list. 22 said yes.',
      why: 'Every student had the same chance to be picked, so no group is favored. The sample is likely to be representative. Its 55% is a believable estimate.' },
    { name: 'Random, 10 students', short: 'Random, 10', n: 10, yes: 7, fair: true,
      how: 'You picked 10 names at random from the whole school list. 7 said yes.',
      why: 'The method is fair because every student had the same chance. But 10 students is a small sample, so the estimate can miss by a lot. It is a valid method that is not very precise.' }
  ];
  const CMP_TRUTH = 54;

  register({
    id: 'samples-and-populations', level: 'school',
    title: 'Samples and populations',
    blurb: 'Ask a few to learn about many: see why a random sample can be trusted and a convenient one cannot.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 5; p.cy = 4.6; p.span = 5.2;
      const gx = [0.6, 5.4], gy = [8.4, 5.6];
      for (let z = 0; z < 4; z++) {
        const x0 = gx[z % 2], y0 = gy[Math.floor(z / 2)];
        for (let i = 0; i < 20; i++) {
          const x = x0 + (i % 5) * .75, y = y0 - Math.floor(i / 5) * .62, walk = ((i * 7 + z * 3) % 10) < [8, 5, 3, 2][z];
          p.dot(x, y, 9, walk ? alpha(pal.blue, .55) : alpha(pal.muted, .3));
        }
      }
      p.path([[.5, 1.8], [9.5, 1.8]], { stroke: pal['grid-strong'], width: 2 });
      p.path([[4.5, 1.8], [4.5, 3.6]], { stroke: pal.text, width: 1.5, dash: [4, 4] });
      [[3.2, 1], [3.8, 1], [3.8, 2], [4.4, 1], [4.4, 2], [4.4, 3], [5, 1], [5, 2], [5, 3], [5.6, 1], [5.6, 2], [6.2, 1], [2.6, 1], [6.8, 1]].forEach(([x, k]) =>
        p.dot(x, 1.8 + k * .5, 9, pal.blue, pal.stage, 1.5));
    },
    hook: 'You cannot ask all 200 students a question. Which 20 should you ask so that their answers tell you about everyone?',
    steps: [
      { title: 'A sample can mislead',
        text: String.raw`<p>The 200 students wait before the bell in four groups. We want the <b>percent who walk to school</b>. Asking everyone takes too long, so we ask a <b>sample</b> of 20.</p><p>The first 20 students at the front door: 15 walk, which is 75%. The whole school is 45%. The sample is 30 points too high.</p><p>Now try the gym group and the random sample. Switch on "Show every student" to see why.</p>`,
        set: { mode: 'pick', method: 'front' } },
      { title: 'Many random samples',
        text: String.raw`<p>The <b>population</b> is all 200 students. Each dot below the crowd is the result of one random sample of 10: its percent who walk. The dashed line is the true 45%.</p><p>40 samples of size 10 gave answers from 20% to 80%. Only 18 of the 40 landed within 10 points of 45%.</p><p>Now drag the size slider up to 80 and draw samples again. The dots squeeze toward the dashed line.</p>`,
        set: { mode: 'many', n: 10, reset: true, draws: 40 } },
      { title: 'Estimate the whole school',
        text: String.raw`<p>A random sample of 40 students from a school of 600: 14 walk. That is \(14\div 40=0.35\), so about 35% of the sample walks.</p><p>Choose the best estimate for all 600 students. Then set how far off you think you could be. A different random sample would give a different answer, so one number is not enough.</p>`,
        set: { mode: 'infer', ss: 40, reset: true } },
      { title: 'Which survey can you trust?',
        text: String.raw`<p>The school wants to know if students want a new gym. Four surveys gave these answers: 85%, 85%, 55% and 70%.</p><p>Only two used random sampling. Pick each survey and decide if its sample is representative or biased.</p>`,
        set: { mode: 'compare', reset: true } }
    ],
    formal: String.raw`
      <h3>Population and sample</h3>
      <p>The <em>population</em> is the whole group you want to know about, such as all 600 students in a school. A <em>sample</em> is a smaller part of it that you actually measure. Statistics lets you use the sample to learn about the population, because measuring everyone is often too slow or too costly.</p>
      <p>A number that describes the whole population, like "45% of students walk", is a <em>population value</em>. The same number found in a sample is a <em>sample value</em>. We use the sample value to estimate the population value.</p>
      <h3>Representative samples and bias</h3>
      <p>A sample is <em>representative</em> if it looks like the population: the same mix of groups in about the same amounts. A generalization about a population is valid only when the sample is representative. A sample that favors one group is <em>biased</em>. Common causes are a <em>convenience sample</em> (whoever is easy to reach, like the front-door crowd) and a <em>volunteer sample</em> (people who choose to answer, like an online vote).</p>
      <p>Making a biased sample bigger does not fix it. Asking 1,000 fans at a game still leaves out everyone who is not at the game.</p>
      <h3>Random sampling</h3>
      <p>In a <em>random sample</em> every member of the population has the same chance of being picked, like drawing names from a hat. Nobody chooses who is in, so no group is favored. Random sampling <em>tends to</em> give representative samples. It does not promise a perfect one. A single random sample can still land above or below the true value, as the dot plot of many samples showed.</p>
      <h3>Sample size and the believable range</h3>
      <p>Bigger random samples give estimates that bunch more tightly around the true value. A rough rule for a percent: about 95 of 100 random samples of size \(n\) land within
      \[ \frac{1}{\sqrt{n}} \]
      of the true value, written as a fraction of 1. For \(n=40\) that is about \(0.16\), or 16 points. For \(n=160\) it is about \(0.08\), or 8 points. To cut the range in half you need four times as many students.</p>
      <h3>Making an inference</h3>
      <p>Say a random sample of \(n=40\) students from a school of 600 has 14 walkers.</p>
      <p>Sample percent: \(\dfrac{14}{40}=0.35=35\%\).</p>
      <p>Estimate for the school: \(0.35\times 600=210\) students.</p>
      <p>Believable range: \(35\% \pm 16\) points is 19% to 51%, which is about 114 to 306 students.</p>
      <p>Write the answer as "about 210, probably between about 114 and 306". It is an estimate, not an exact count. Also remember that this works only for a random sample. For a biased sample the range can miss the true value completely.</p>`,
    check: [
      { q: 'A school has 800 students. Maya wants to know what percent come to school by bike. She asks the first 25 students she sees at the school bike rack. Why might her sample be a poor one?',
        choices: [
          'Twenty-five students is too few for any sample to work',
          'She should have asked the same number of boys and girls',
          'Students at the bike rack are more likely to bike, so the sample does not represent all 800 students',
          'A sample can never tell you anything about a school'],
        answer: 2,
        why: 'Students at the bike rack are the ones most likely to bike. Her sample leans toward one group, so it is biased. A random sample, where every student has the same chance, would be a better plan.',
        hint: 'Think about who is standing at the bike rack.' },
      { q: 'A school has 900 students. A random sample of 50 students is chosen, and 20 of them play a sport. What is the best estimate of how many of the 900 students play a sport?',
        choices: ['About 360 students', 'About 20 students', 'About 450 students', 'Exactly 360 students'],
        answer: 0,
        why: String.raw`In the sample, \(20\div 50=0.40=40\%\) play a sport. Then \(0.40\times 900=360\). Because a random sample can be a little off, the honest answer is "about 360", not exactly 360.`,
        hint: 'Find the percent in the sample first, then use that percent of 900.' }
    ],
    links: { prereq: ['statistical-questions-and-data-displays'], related: ['mean-median-and-spread', 'probability-with-repeated-trials', 'percents-on-tape-and-number-lines'] },

    mount({ stage, controls: C }) {
      const st = {
        mode: 'pick', method: null, sample: [], showAll: false,
        n: 10, many: [], latest: null,
        ss: 40, est: null, margin: 10,
        sel: null, ans: [null, null, null, null], wrongTry: false
      };
      let rng = mulberry(3);
      const P = new Plane(stage, { span: 8 });

      const draw1 = k => {
        const idx = Array.from({ length: N_POP }, (_, i) => i);
        for (let i = 0; i < k; i++) { const j = i + Math.floor(rng() * (N_POP - i)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
        return idx.slice(0, k);
      };
      const walkers = ids => ids.reduce((t, i) => t + POP[i].walk, 0);
      const zoneCounts = ids => { const z = [0, 0, 0, 0]; ids.forEach(i => z[POP[i].zone]++); return z; };

      /* ---------- drawing ---------- */
      const legend = (p, a, b) => {
        const fs = clamp(p.scale * .42, 11, 15), r = clamp(p.scale * .22, 4, 8);
        p.dot(1.4, 17.9, r, p.pal.blue, p.pal.blue, 2); p.label(a, 1.75, 17.9, { size: fs, italic: false, color: p.pal.muted, align: 'left', dx: 4 });
        p.dot(9.4, 17.9, r, p.pal.stage, p.pal.blue, 2); p.label(b, 9.75, 17.9, { size: fs, italic: false, color: p.pal.muted, align: 'left', dx: 4 });
      };
      const strip = (p, title) => {
        const pal = p.pal, fs = clamp(p.scale * .42, 11, 15);
        for (let v = 0; v <= 100; v += 10) p.path([[sx(v), 2.2], [sx(v), 2.0]], { stroke: pal['grid-strong'], width: 1.5 });
        p.path([[sx(0), 2.2], [sx(100), 2.2]], { stroke: pal['grid-strong'], width: 2 });
        for (let v = 0; v <= 100; v += 20) p.label(v + '%', sx(v), 1.5, { size: fs + 1, italic: false, color: pal.muted, halo: false });
        p.label(title, 10, .6, { size: fs, italic: false, color: pal.muted, halo: false });
      };
      const truthLine = (p, label, col, tv = TRUTH) => {
        const fs = clamp(p.scale * .42, 11, 15);
        p.path([[sx(tv), 2.2], [sx(tv), 5.5]], { stroke: col || p.pal.text, width: 2, dash: [7, 5] });
        p.label(label, sx(tv), 5.9, { size: fs + 1, italic: false, color: p.pal.text });
      };
      const popDots = (p, sampled, reveal) => {
        const pal = p.pal, r = clamp(p.scale * .3, 4, 13), set = new Set(sampled);
        ZONES.forEach(z => p.label(z.name, z.cx - .3, z.ly, { size: clamp(p.scale * .5, 12, 17), italic: false, color: pal.text, align: 'left', halo: false }));
        POP.forEach((d, i) => {
          const on = set.has(i), show = on || reveal;
          if (!show) { p.dot(d.x, d.y, r * .7, alpha(pal['grid-strong'], .55)); return; }
          const a = on ? 1 : .35;
          if (d.walk) p.dot(d.x, d.y, r, alpha(pal.blue, a), alpha(pal.blue, a), 2);
          else p.dot(d.x, d.y, r, pal.stage, alpha(pal.blue, a), 2);
          if (on) p.dot(d.x, d.y, r + 3.5, null, alpha(pal.yellow, .9), 2);
        });
      };
      const gridDots = (p, ids, x0, y0, cols, s, r, yes) => {
        ids.forEach((v, i) => {
          const x = x0 + (i % cols) * s, y = y0 - Math.floor(i / cols) * s;
          if (v) p.dot(x, y, r, p.pal.blue, p.pal.blue, 2); else p.dot(x, y, r, p.pal.stage, p.pal.blue, 2);
        });
      };
      const flags = (k, n, seed) => shuffle(Array.from({ length: n }, (_, i) => i < k ? 1 : 0), mulberry(seed));

      P.onDraw = (c, p) => {
        p.fit(20, 18.6, { l: .2, r: .2, t: .2, b: .2 });
        const pal = p.pal, fs = clamp(p.scale * .42, 11, 15);

        if (st.mode === 'pick') {
          legend(p, 'walks to school', 'does not walk');
          popDots(p, st.sample, st.showAll);
          strip(p, 'percent who walk to school');
          if (st.sample.length) {
            truthLine(p, 'whole school: ' + TRUTH + '%', pal.text);
            const k = walkers(st.sample), pc = pctOf(k, st.sample.length), right = pc > 60;
            p.path([[sx(pc), 2.2], [sx(pc) - .45, 3.3], [sx(pc) + .45, 3.3]], { fill: pal.yellow, stroke: pal.yellow, width: 1, close: true });
            p.label('this sample: ' + pc + '%', sx(pc), 4.1, { size: fs + 1, italic: false, color: pal.text, align: right ? 'right' : pc < 30 ? 'left' : 'center', dx: right ? 10 : pc < 30 ? -10 : 0 });
          }
        }

        if (st.mode === 'many') {
          legend(p, 'walks to school', 'does not walk');
          popDots(p, st.latest || [], false);
          strip(p, 'percent who walk in each random sample');
          c.fillStyle = alpha(pal.green, .15); c.fillRect(p.X(sx(TRUTH - 10)), p.Y(5.5), p.X(sx(TRUTH + 10)) - p.X(sx(TRUTH - 10)), p.Y(2.2) - p.Y(5.5));
          truthLine(p, 'whole school: ' + TRUTH + '%', pal.text);
          const bins = {}; let mx = 1;
          st.many.forEach(m => { const b = Math.round(m.pct / 5); bins[b] = (bins[b] || 0) + 1; mx = Math.max(mx, bins[b]); });
          const dd = Math.min(.8, 3.0 / mx), rr = Math.max(1.5, dd * p.scale * .45), used = {};
          st.many.forEach((m, i) => {
            const b = Math.round(m.pct / 5), j = used[b] = (used[b] || 0) + 1, last = i === st.many.length - 1;
            p.dot(sx(b * 5), 2.2 + dd * (j - .5) + .05, rr, last ? pal.yellow : alpha(pal.blue, .9), last ? pal.text : pal.stage, last ? 1.5 : 1);
          });
        }

        if (st.mode === 'infer') {
          const n = st.ss, k = Math.round(n * .35), rows = n === 160 ? 5 : 2, cols = n / rows, s = Math.min(.8, 17 / cols), r = clamp(s * p.scale * .38, 3, 12);
          const fl = flags(k, n, 11 + n);
          p.label('Random sample: ' + plural(n, 'student', 'students') + ', ' + k + ' walk (' + pctOf(k, n) + '%)', 1.4, 16.9, { size: clamp(p.scale * .5, 12, 17), italic: false, align: 'left', halo: false });
          gridDots(p, fl, 1.6, 16.0, cols, s, r);
          legend(p, 'walks to school', 'does not walk');
          const bx0 = 1.5, bx1 = 18.5, by0 = 8.6, by1 = 9.8, X = v => bx0 + v / 100 * (bx1 - bx0);
          p.label('The whole school: 600 students', 1.4, 11.9, { size: clamp(p.scale * .5, 12, 17), italic: false, align: 'left', halo: false });
          c.strokeStyle = pal['grid-strong']; c.lineWidth = 2; c.strokeRect(p.X(bx0), p.Y(by1), p.X(bx1) - p.X(bx0), p.Y(by0) - p.Y(by1));
          if (st.est !== null) {
            const e = st.est, lo = Math.max(0, e - st.margin), hi = Math.min(100, e + st.margin);
            c.fillStyle = alpha(pal.blue, .22); c.fillRect(p.X(X(lo)), p.Y(by1), p.X(X(hi)) - p.X(X(lo)), p.Y(by0) - p.Y(by1));
            c.fillStyle = alpha(pal.blue, .7); c.fillRect(p.X(bx0), p.Y(by1), p.X(X(e)) - p.X(bx0), p.Y(by0) - p.Y(by1));
            p.path([[X(e), by0 - .2], [X(e), by1 + .2]], { stroke: pal.text, width: 2 });
            p.label('walkers: about ' + Math.round(600 * e / 100), X(e / 2), 7.7, { size: fs + 1, italic: false, color: pal.text, halo: false });
          } else p.label('choose an estimate below', 10, 9.2, { size: fs + 1, italic: false, color: pal.muted, halo: false });
          strip(p, 'percent of all students who walk');
          p.path([[sx(35), 2.2], [sx(35), 3.4]], { stroke: pal.yellow, width: 3 });
          p.path([[sx(35), 3.6], [sx(35) - .4, 4.4], [sx(35) + .4, 4.4]], { fill: pal.yellow, stroke: pal.yellow, width: 1, close: true });
          p.label('sample: 35%', sx(35), 5.1, { size: fs + 1, italic: false, color: pal.text, align: 'right', dx: 12 });
          if (st.est !== null) {
            const e = st.est, lo = Math.max(0, e - st.margin), hi = Math.min(100, e + st.margin), y = 3.4;
            p.path([[sx(lo), y], [sx(hi), y]], { stroke: pal.blue, width: 5 });
            p.path([[sx(lo), y - .35], [sx(lo), y + .35]], { stroke: pal.blue, width: 3 }); p.path([[sx(hi), y - .35], [sx(hi), y + .35]], { stroke: pal.blue, width: 3 });
            p.label(Math.round(lo) + '% to ' + Math.round(hi) + '%', sx(hi), 4.3, { size: fs + 1, italic: false, color: pal.blue, align: hi > 80 ? 'right' : 'left', dx: hi > 80 ? 4 : 12 });
          }
        }

        if (st.mode === 'compare') {
          p.label('solid dot: says yes   hollow dot: says no', 1.4, 17.9, { size: fs, italic: false, color: pal.muted, align: 'left', halo: false });
          SURVEYS.forEach((sv, i) => {
            const x0 = [1.4, 11.4][i % 2], ytop = [17.0, 10.9][Math.floor(i / 2)], s = .7, r = clamp(s * p.scale * .38, 3, 11);
            const sel = st.sel === i, a = st.ans[i];
            if (sel) { c.strokeStyle = pal.yellow; c.lineWidth = 3; c.strokeRect(p.X(x0 - .5), p.Y(ytop + .55), p.X(x0 + 8.2) - p.X(x0 - .5), p.Y(ytop - 5.4) - p.Y(ytop + .55)); }
            p.label((i + 1) + '  ' + sv.short, x0 - .3, ytop, { size: clamp(p.scale * .46, 11, 16), italic: false, align: 'left', halo: false });
            p.label(sv.yes + ' of ' + sv.n + ' = ' + pctOf(sv.yes, sv.n) + '%', x0 - .3, ytop - .75, { size: clamp(p.scale * .46, 11, 16), italic: false, color: pal.muted, align: 'left', halo: false });
            gridDots(p, flags(sv.yes, sv.n, 40 + i), x0, ytop - 1.6, 10, s, r);
            if (a !== null) {
              const ok = (a === 'fair') === sv.fair;
              p.label(sv.fair ? 'representative' : 'biased', x0 + 7.7, ytop, { size: clamp(p.scale * .42, 10, 14), italic: false, color: ok ? pal.green : pal.red, align: 'right', halo: false });
            }
          });
          strip(p, 'percent who say yes to a new gym');
          if (st.ans.every(a => a !== null)) truthLine(p, 'whole school: ' + CMP_TRUTH + '%', pal.text, CMP_TRUTH);
          SURVEYS.forEach((sv, i) => {
            const pc = pctOf(sv.yes, sv.n), y = 3.1 + (pc === 85 ? (i === 1 ? .9 : 0) : 0);
            p.dot(sx(pc), y, clamp(p.scale * .3, 7, 11), pal.blue, pal.stage, 2);
            p.label(String(i + 1), sx(pc), y, { size: clamp(p.scale * .38, 10, 13), italic: false, color: pal.stage, halo: false });
          });
        }
      };

      /* ---------- control groups ---------- */
      const probe = C.readout(), host = probe.parentElement; probe.remove();
      const group = fn => {
        const before = new Set(host.children); fn();
        const w = h('div', { class: 'grp' }, [...host.children].filter(e => !before.has(e))); host.append(w); return w;
      };
      let roA, fb, drawn;
      const fbHtml = (title, body) => `<span class="k">${title}</span><br>${body}`;

      /* pick */
      const takeSample = m => {
        st.method = m;
        if (m === 'front') st.sample = Array.from({ length: 20 }, (_, i) => i);
        else if (m === 'gym') st.sample = Array.from({ length: 20 }, (_, i) => 100 + i);
        else st.sample = draw1(20);
        draw();
      };
      let fbPick, roPick;
      const gPick = group(() => {
        roPick = C.readout(); fbPick = C.readout();
        C.title('Choose how to sample 20 students');
        C.buttons([
          { label: 'First 20 at the front door', onClick: () => takeSample('front') },
          { label: '20 at the gym doors', onClick: () => takeSample('gym') },
          { label: '20 chosen at random', primary: true, onClick: () => takeSample('random') }
        ]);
        C.toggle({ label: 'Show every student', value: false, onChange: v => { st.showAll = v; draw(); } });
        C.hint('Each press of "chosen at random" draws a new random sample. Dots with a yellow ring are in your sample.');
      });
      const updPick = () => {
        if (!st.sample.length) { roPick.innerHTML = '<span class="k">Pick a method to take a sample.</span>'; fbPick.innerHTML = ''; return; }
        const n = 20, k = walkers(st.sample), pc = pctOf(k, n), d = Math.round((pc - TRUTH) * 10) / 10, z = zoneCounts(st.sample);
        roPick.innerHTML = `<span class="k">Sample</span> ${k} of ${n} walk = ${pc}%<br><span class="k">Whole school</span> 90 of 200 walk = ${TRUTH}%<br><span class="k">Miss</span> ${d > 0 ? '+' : d < 0 ? '−' : ''}${Math.abs(d)} points<br><span class="k">Picked from</span> front ${z[0]}, library ${z[1]}, gym ${z[2]}, bus ${z[3]}`;
        const side = d > 0 ? 'above' : 'below';
        if (st.method === 'front') fbPick.innerHTML = fbHtml('Why it missed', `All 20 stand at the front door. Many of them live close to school, so many walk. One group is overrepresented, so the sample is <b>biased</b>: it is ${Math.abs(d)} points ${side} the whole school. It was easy to get, but it is not representative.`);
        else if (st.method === 'gym') fbPick.innerHTML = fbHtml('Why it missed', `All 20 stand at the gym doors, where fewer students walk. The sample leaves out the other three groups, so it is <b>biased</b>: it is ${Math.abs(d)} points ${side} the whole school. Two biased samples can miss in opposite directions.`);
        else fbPick.innerHTML = fbHtml('Why it is better', `Every student had the same chance to be picked, so the sample is spread over all four groups. This one is ${d === 0 ? 'right on the whole school value' : Math.abs(d) + ' points ' + side + ' it'}. A random sample is not perfect, but it is not tilted toward any group. Press again: the miss changes, and it can be high or low.`);
      };

      /* many */
      const addSamples = q => {
        for (let i = 0; i < q; i++) {
          const ids = draw1(st.n), k = walkers(ids);
          st.many.push({ k, n: st.n, pct: pctOf(k, st.n) }); st.latest = ids;
        }
        draw();
      };
      let sizeS, roMany, fbMany;
      const gMany = group(() => {
        roMany = C.readout(); fbMany = C.readout();
        C.title('Draw random samples');
        sizeS = C.slider({ label: 'Sample size', min: 5, max: 100, step: 5, value: st.n, format: v => String(Math.round(v)) + ' students',
          onInput: v => { st.n = Math.round(v); st.many = []; st.latest = null; draw(); } });
        C.buttons([
          { label: 'Draw 1 sample', primary: true, onClick: () => addSamples(1) },
          { label: 'Draw 20 samples', onClick: () => addSamples(20) },
          { label: 'Clear', onClick: () => { st.many = []; st.latest = null; draw(); } }
        ]);
        C.hint('Moving the size slider clears the dots, so you can compare one size at a time. The green band is within 10 points of the truth.');
      });
      const updMany = () => {
        const m = st.many, cnt = m.length;
        if (!cnt) { roMany.innerHTML = `<span class="k">Sample size</span> ${st.n}<br><span class="k">Samples drawn</span> 0`; fbMany.innerHTML = fbHtml('Try it', 'Press "Draw 20 samples". Each sample is a random group of ' + st.n + ' students out of the 200.'); return; }
        const lo = Math.min(...m.map(x => x.pct)), hi = Math.max(...m.map(x => x.pct)), within = m.filter(x => Math.abs(x.pct - TRUTH) <= 10).length, l = m[cnt - 1];
        roMany.innerHTML = `<span class="k">Sample size</span> ${st.n}<br><span class="k">Samples drawn</span> ${cnt}<br><span class="k">Lowest to highest</span> ${lo}% to ${hi}%<br><span class="k">Within 10 points of 45%</span> ${within} of ${cnt}`;
        const d = Math.round((l.pct - TRUTH) * 10) / 10;
        let msg = `Latest sample: ${l.k} of ${l.n} walk = ${l.pct}%, which is ${d === 0 ? 'exactly right' : Math.abs(d) + ' points ' + (d > 0 ? 'above' : 'below') + ' 45%'}. `;
        if (cnt < 10) msg += 'Keep drawing to see where the answers pile up.';
        else if (st.n <= 20) msg += 'With few students per sample the answers are spread out. Any one small sample can be far off.';
        else if (st.n >= 60) msg += 'With many students per sample the answers bunch close to 45%. A bigger random sample is more likely to be close, but one can still miss a little.';
        else msg += 'The answers pile up around 45%. Bigger samples bunch closer, and any single sample can still be off.';
        fbMany.innerHTML = fbHtml('What you see', msg);
      };

      /* infer */
      const CHOICES = [
        { label: 'About 14 students', ok: false, why: 'That is the number of walkers in the sample, not in the school. The school is 15 times bigger than the sample of 40, so the count must grow.' },
        { label: 'About 35 students', ok: false, why: 'The 35 is a percent, not a count. 35% of 600 students is much more than 35 students.' },
        { label: 'About 210 students', ok: true, why: '35% of 600 is 0.35 times 600, which is 210. We say "about" because a random sample estimates the school, it does not measure it.' },
        { label: 'Exactly 210 students', ok: false, why: '210 is the right center, but "exactly" claims too much. Another random sample of 40 would give another answer, so the true number can be a bit higher or lower.' },
        { label: 'About 390 students', ok: false, why: '390 is the number who do not walk (65% of 600). The question asks about those who walk.' }
      ];
      const VARIANTS = [[7, 20], [14, 40], [56, 160]];
      let roInfer, fbEst, fbRange, estBtns, varBtns, marS;
      const gInfer = group(() => {
        roInfer = C.readout(); fbEst = C.readout(); fbRange = C.readout();
        C.title('Best estimate for all 600 students');
        estBtns = C.buttons(CHOICES.map((o, i) => ({ label: o.label, onClick: () => { st.est = o.ok ? 35 : null; st.estPick = i; draw(); } })));
        C.title('How far off could it be?');
        marS = C.slider({ label: 'Give or take', min: 0, max: 40, step: 1, value: st.margin, format: v => '± ' + Math.round(v) + ' points', onInput: v => { st.margin = Math.round(v); draw(); } });
        C.title('Same 35%, different sample size');
        varBtns = C.buttons(VARIANTS.map(([k, n]) => ({ label: k + ' of ' + n, onClick: () => { st.ss = n; draw(); } })));
        C.hint('The range is only about samples that are random. Pick an estimate first, then move the slider.');
      });
      const updInfer = () => {
        const n = st.ss, R = rule(n), m = st.margin, e = st.est;
        estBtns.forEach((b, i) => b.classList.toggle('primary', st.estPick === i));
        varBtns.forEach((b, i) => b.classList.toggle('primary', VARIANTS[i][1] === n));
        if (e === null) {
          roInfer.innerHTML = `<span class="k">Sample</span> ${Math.round(n * .35)} of ${n} walk = 35%<br><span class="k">Range you set</span> ± ${m} points`;
          fbEst.innerHTML = st.estPick === undefined || st.estPick === null ? fbHtml('Estimate', 'Pick the best estimate of how many of the 600 students walk.') : fbHtml('Not quite', CHOICES[st.estPick].why + ' Try again.');
        } else {
          const lo = Math.max(0, e - m), hi = Math.min(100, e + m);
          roInfer.innerHTML = `<span class="k">Sample</span> ${Math.round(n * .35)} of ${n} walk = 35%<br><span class="k">Estimate</span> 35% of 600 = 210 students<br><span class="k">Your range</span> ${lo}% to ${hi}%, about ${Math.round(6 * lo)} to ${Math.round(6 * hi)} students`;
          fbEst.innerHTML = fbHtml('Good estimate', CHOICES[2].why);
        }
        let r;
        if (m === 0) r = 'A range of zero claims the school is exactly 35%. A random sample of ' + n + ' is very unlikely to be that exact. That is overclaiming.';
        else if (m < R * .75) r = `Too narrow for ${n} students. Another random sample of ${n} could easily land outside this range. A believable range is about ± ${R} points. Narrow ranges need bigger samples.`;
        else if (m > R * 1.5) r = `Safe, but too wide. A range this big (${Math.max(0, 35 - m)}% to ${Math.min(100, 35 + m)}%) tells you very little. With ${n} students you can say about ± ${R} points.`;
        else r = `A believable range. With ${n} random students, estimates usually land within about ${R} points of the truth. ${n === 160 ? 'The bigger sample lets you give a tighter range.' : n === 20 ? 'The small sample forces a wider range.' : 'A bigger sample would let you give a tighter range.'}`;
        fbRange.innerHTML = fbHtml('Your range', r);
      };

      /* compare */
      let roCmp, fbCmp, selBtns, ansBtns;
      const pickSurvey = i => { st.sel = i; draw(); };
      const answer = a => {
        const i = st.sel; if (i === null) return;
        const sv = SURVEYS[i], ok = (a === 'fair') === sv.fair;
        st.lastAns = { i, ok };
        st.ans[i] = ok ? a : null;
        if (!ok) st.wrongTry = i;
        else if (st.wrongTry === i) st.wrongTry = null;
        draw();
      };
      const gCmp = group(() => {
        roCmp = C.readout(); fbCmp = C.readout();
        C.title('Pick a survey');
        selBtns = C.buttons(SURVEYS.map((s, i) => ({ label: String(i + 1) + ' ' + s.short, onClick: () => pickSurvey(i) })));
        C.title('Is its sample representative?');
        ansBtns = C.buttons([
          { label: 'Representative (fair)', onClick: () => answer('fair') },
          { label: 'Biased', onClick: () => answer('biased') }
        ]);
        C.hint('The first number under each survey is its answer. The numbered dots on the line show the four answers.');
      });
      const updCmp = () => {
        const done = st.ans.filter(a => a !== null).length;
        selBtns.forEach((b, i) => { b.classList.toggle('primary', st.sel === i); });
        roCmp.innerHTML = `<span class="k">Decided</span> ${done} of 4 surveys` + (st.sel !== null ? `<br><span class="k">Selected</span> ${SURVEYS[st.sel].name}` : '');
        if (st.sel === null) { fbCmp.innerHTML = fbHtml('Start', 'Choose survey 1, 2, 3 or 4, then say if its sample is representative or biased.'); return; }
        const sv = SURVEYS[st.sel], a = st.ans[st.sel];
        if (a !== null) fbCmp.innerHTML = fbHtml('Right', sv.how + ' ' + sv.why) + (done === 4 ? '<br><br>' + fbHtml('All four decided', 'Only surveys 3 and 4 used random sampling. Survey 3 supports a valid generalization: about 55%. The whole school value is 54%, which is 324 of 600. Survey 4 is a fair method but a small sample, so its 70% is 16 points off. Surveys 1 and 2 say 85%, far from 54%, and asking more students the same way would not fix that.') : '');
        else if (st.wrongTry === st.sel) fbCmp.innerHTML = fbHtml('Look again', sv.how + ' ' + (sv.fair ? 'Think about how the 10 or 40 students were chosen: did every student have the same chance? Then read the other button.' : 'Ask who is in this sample, and who is left out. Then read the other button.'));
        else fbCmp.innerHTML = fbHtml('Your call', sv.how + ' Is this sample representative of all 600 students, or biased?');
      };

      const showGroup = () => {
        gPick.style.display = st.mode === 'pick' ? '' : 'none';
        gMany.style.display = st.mode === 'many' ? '' : 'none';
        gInfer.style.display = st.mode === 'infer' ? '' : 'none';
        gCmp.style.display = st.mode === 'compare' ? '' : 'none';
      };
      const upd = () => { showGroup(); if (st.mode === 'pick') updPick(); if (st.mode === 'many') updMany(); if (st.mode === 'infer') updInfer(); if (st.mode === 'compare') updCmp(); };
      function draw() { P.draw(); upd(); }

      const apply = (patch, immediate) => {
        if (patch.mode) st.mode = patch.mode;
        if (patch.mode === 'pick') { rng = mulberry(3); st.showAll = false; st.method = null; st.sample = []; gPick.querySelector('input[type=checkbox]').checked = false; if (patch.method) takeSample(patch.method); }
        if (patch.mode === 'many') {
          rng = mulberry(7); st.many = []; st.latest = null; st.n = patch.n; sizeS.set(patch.n);
          for (let i = 0; i < (patch.draws || 0); i++) { const ids = draw1(st.n), k = walkers(ids); st.many.push({ k, n: st.n, pct: pctOf(k, st.n) }); st.latest = ids; }
        }
        if (patch.mode === 'infer') { st.ss = patch.ss; st.est = null; st.estPick = null; st.margin = 10; marS.set(10); }
        if (patch.mode === 'compare') { st.sel = null; st.ans = [null, null, null, null]; st.wrongTry = null; }
        draw();
      };
      draw();
      return { destroy: () => P.destroy(), apply };
    }
  });
}
