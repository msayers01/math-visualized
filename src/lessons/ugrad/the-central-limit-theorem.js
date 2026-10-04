/* =====================================================================
   UNDERGRADUATE (Fourier and probability) — The central limit theorem
   ===================================================================== */
{
  const SEED = 20240611, NB = 10, NBIN = 50, BW = .2, CAP = 20000, W = 100, H = 42, BARK = .45, CURVEK = .6;
  /* small seeded generator (mulberry32) so every run of the lesson is repeatable */
  const mulberry = a => () => {
    a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const f2 = v => (Math.abs(v) < .005 ? 0 : v).toFixed(2), f1 = v => (Math.abs(v) < .05 ? 0 : v).toFixed(1);
  const pdfN = (x, m, s) => Math.exp(-.5 * ((x - m) / s) * ((x - m) / s)) / (s * Math.sqrt(2 * Math.PI));
  /* a population is NB bins on [0, 10], each bin one unit wide with weight w[i]; a value is a bin chosen by weight, then uniform inside it */
  const pstat = w => {
    const tot = w.reduce((a, b) => a + b, 0), cum = []; let s = 0; w.forEach(x => { s += x; cum.push(s); });
    const mu = w.reduce((a, x, i) => a + x * (i + .5), 0) / tot;
    const v = w.reduce((a, x, i) => a + x * ((i + .5 - mu) * (i + .5 - mu) + 1 / 12), 0) / tot;
    const m3 = w.reduce((a, x, i) => a + x * (Math.pow(i + .5 - mu, 3) + (i + .5 - mu) / 4), 0) / tot;
    return { tot, cum, mu, sd: Math.sqrt(v), skew: m3 / Math.pow(v, 1.5) };
  };
  const PRE = {
    skew: { label: 'Skewed to the right', w: [18, 14, 10, 7, 5, 3, 2, 1, 1, 1] },
    uniform: { label: 'Uniform', w: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10] },
    two: { label: 'Two humps', w: [1, 6, 14, 6, 1, 1, 6, 14, 6, 1] },
    rare: { label: 'Rare big values', w: [18, 0, 0, 0, 0, 0, 0, 0, 0, 2] }
  };
  const PS = pstat(PRE.skew.w), PR = pstat(PRE.rare.w);
  const PN = [1, 4, 30];

  /* predict, then see: skewed population, n = 1, 4, 30 */
  const PREDS = [
    { q: 'n = 1. A sample is a single value, so its mean is that value. What will the histogram of 2000 sample means look like?',
      opts: ['Bell-shaped, much narrower than the population', 'The same lopsided shape and the same spread as the population', 'Bell-shaped, with the same spread as the population'], ans: 1,
      why: ['Averaging has nothing to do yet. With n = 1 there is only one value in each sample, so nothing can cancel.',
        'With one value per sample, the sample means ARE the population values. The shape and the spread σ must match the population.',
        'The spread is right, but the shape is not. With one value per sample the means copy the population, lopsided shape included.'] },
    { q: 'n = 4. Each sample has 4 values and you plot the mean of each. Compared with the population, what will the histogram of 2000 means look like?',
      opts: ['Lopsided like the population, with the same width', 'Bell-shaped and a quarter as wide (σ/4)', 'Less lopsided, and half as wide (σ/√4 = σ/2)'], ans: 2,
      why: ['Averaging 4 values pulls extreme values toward the middle, so the means cannot be as spread out as single values.',
        'The width shrinks by √n, not by n. With n = 4 that is a factor of 2, so the width is σ/2 and not σ/4.',
        'The standard error is σ/√n. With n = 4, that is σ/2. Four values is still few, so some lopsidedness remains.'] },
    { q: `n = 30. Choose the best description of the histogram of 2000 sample means (σ = ${f2(PS.sd)} for this population).`,
      opts: [`Bell-shaped, centered at μ, with spread σ/√30 = ${f2(PS.sd / Math.sqrt(30))}`, `Bell-shaped, with spread σ/30 = ${f2(PS.sd / 30)}`, `Still clearly lopsided, with spread σ/2 = ${f2(PS.sd / 2)}`], ans: 0,
      why: [`Thirty values per sample is enough for the lopsidedness to wash out. The width is σ/√30, about ${f2(PS.sd / Math.sqrt(30))}.`,
        'The width shrinks by √n, not by n. Dividing by 30 would shrink it too much.',
        'The shape is not the problem. With 30 values the means are close to a bell, and the spread keeps shrinking: σ/√30, not σ/2.'] }
  ];

  /* practice: fixed problems. lo, hi, tk frame the picture; disc draws a yes/no population; band shades mean ± 2 SE after the answer */
  const PROBS = [
    { q: 'A population has mean μ = 50 and standard deviation σ = 12. You take samples of n = 36 values. What is the standard error, the standard deviation of the sample means?',
      mu: 50, sd: 12, n: 36, lo: 14, hi: 86, tk: 12, opts: ['12', '6', '2', '1/3'], ans: 2,
      why: ['12 is σ itself. That would be the spread of single values (n = 1). Averaging 36 values makes the means less spread out.',
        '6 would come from dividing by 2. The standard error divides σ by √n, and √36 = 6, not 2.',
        'σ/√n = 12/√36 = 12/6 = 2. The means are 6 times less spread out than single values.',
        '1/3 is σ divided by n (12/36). The correct divisor is √n, not n.'],
      end: 'The blue curve is 6 times narrower than the grey one: its spread is the standard error 12/6 = 2.' },
    { q: 'With n = 36 and σ = 12 the standard error is 2. You want a standard error of 1. What sample size n do you need?',
      mu: 50, sd: 12, n: 144, n0: 36, lo: 14, hi: 86, tk: 12, opts: ['72', '144', '108', '37'], ans: 1,
      why: ['Doubling n gives SE = 12/√72, about 1.41. To halve the SE you must multiply n by 4.',
        'SE = 12/√n = 1 means √n = 12, so n = 144. To halve the standard error, multiply n by 4: 36 × 4 = 144.',
        'Tripling n gives SE = 12/√108, about 1.15. Halving the SE takes four times the data.',
        'One more value changes the SE only slightly: 12/√37 is about 1.97.'],
      end: 'The dashed grey curve is the old one for n = 36 (SE = 2). The blue curve for n = 144 is half as wide (SE = 12/12 = 1).' },
    { q: 'Weights of one kind of bag have mean 100 g and standard deviation 15 g, and are not normal. You average n = 25 bags at a time. About 95% of those averages fall between which two values?',
      mu: 100, sd: 15, n: 25, band: true, nocurve: true, lo: 55, hi: 145, tk: 15, opts: ['94 g to 106 g', '70 g to 130 g', '97 g to 103 g', '85 g to 115 g'], ans: 0,
      why: ['SE = 15/√25 = 3. About 95% of the means lie within 2 SE of 100: 100 ± 6, so 94 to 106.',
        '70 to 130 is 100 ± 2σ. That is the range for single bags. Averages are much less spread out.',
        '97 to 103 is only 100 ± 1 SE, which holds about 68% of the averages, not 95%.',
        '85 to 115 is 100 ± σ. That describes single bags, not the averages.'],
      end: 'The yellow band is μ ± 2 SE = 100 ± 6, from 94 to 106.' },
    { q: 'A sample of n = 100 people has mean x̄ = 52 minutes of daily screen time. Assume σ = 20 minutes. Using x̄ ± 2 SE, which interval is x̄ plus or minus the margin of error?',
      mu: 52, sd: 20, n: 100, band: true, nocurve: true, lo: 0, hi: 104, tk: 20, opts: ['12 to 92', '50 to 54', '51.6 to 52.4', '48 to 56'], ans: 3,
      why: ['12 to 92 is 52 ± 2σ (σ = 20), the range for single people. The margin of error uses the standard error.',
        '50 to 54 is 52 ± 1 SE, since SE = 20/√100 = 2. The margin of error uses 2 SE, not 1.',
        '51.6 to 52.4 divides σ by n instead of √n and gets 0.2. The standard error is 20/√100 = 2.',
        'SE = 20/√100 = 2, so 2 SE = 4 and the interval is 52 ± 4: 48 to 56.'],
      end: 'The band is 52 ± 2 SE = 52 ± 4. A sample mean is likely to land this close to the true mean, so this is the margin of error.' },
    { q: 'A poll asks n = 400 people a yes or no question. About half say yes. Score each answer 1 for yes and 0 for no, so σ = 0.5. What is the margin of error (2 SE) for the share who say yes?',
      mu: .5, sd: .5, n: 400, band: true, disc: true, lo: 0, hi: 1, tk: .25, opts: ['±2.5 points', '±5 points', '±10 points', '±50 points'], ans: 1,
      why: ['2.5 points is 1 SE (0.5/20 = 0.025). The margin of error doubles it.',
        'SE = 0.5/√400 = 0.5/20 = 0.025, which is 2.5 points. Twice that is 0.05, so ±5 points.',
        '±10 points is what you get from n = 100. With n = 400 the SE is half as big.',
        '±50 points is 0.5 itself, the σ of one answer. It is not divided by √n.'],
      end: 'The yes/no answers are only 0 and 1, yet the means of 400 answers form a narrow bell: 0.5 ± 0.05.' },
    { q: 'A population is strongly lopsided with mean 8. Which statement is true for every sample size n = 1, 2, 3, and so on?',
      mu: 8, sd: 0, n: 1, nopic: true, opts: ['The sample means are all within 1 of 8', 'The histogram of sample means is bell-shaped once n is 2 or more', 'The histogram of sample means is lopsided in the same way for every n', 'The long-run average of the sample means is 8'], ans: 3,
      why: ['Individual sample means can land far from 8, especially when n is small. Only their average is pinned to 8.',
        'Two values is far too few. The bell shape appears gradually as n grows, and a lopsided population needs a fairly large n.',
        'The lopsidedness fades as n grows (by a factor of 1/√n). It is not the same for every n.',
        'The average of the sample means equals μ for every n, because the expected value of an average is the average of the expected values, and each is μ. Only the spread and the shape change with n.'],
      end: 'The center never moves. The spread shrinks like 1/√n and the shape approaches a bell.' }
  ];

  /* label that keeps its box inside the plot area (x in plot units) */
  const lab = (p, text, x, y, o = {}) => {
    const fs = o.size || 15, hw = text.length * fs * .85 * .56 / 2 / p.scale;
    const al = o.align || 'center', xx = al === 'left' ? clamp(x, 0, W - 2 * hw) : al === 'right' ? clamp(x, 2 * hw, W) : clamp(x, hw, W - hw);
    p.label(text, xx, y, Object.assign({ italic: false }, o));
  };

  /* on a phone the title and the mu label need more room apart */
  const ty = p => p.w < 500 ? H + 6.4 : H + 4.5, muY = p => p.w < 500 ? H - .8 : H;

  /* label for a bracket: to its right when it fits, otherwise under it */
  const brLab = (p, a, b, y, text, col, fs) => {
    const w = text.length * fs * .85 * .56 / p.scale;
    if (b + 1.5 + w <= W) lab(p, text, b + 1.5, y, { size: fs, color: col, align: 'left' });
    else lab(p, text, (a + b) / 2 + 1.5, y - 5, { size: fs, color: col, align: 'left' });
  };

  register({
    id: 'the-central-limit-theorem', level: 'ugrad',
    title: 'The central limit theorem',
    blurb: 'Average samples from a lopsided population and watch the sample means form a bell centered at the mean with spread σ over √n.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 50; p.cy = 24; p.span = 50;
      const g = x => 36 * Math.exp(-.5 * ((x - 62) / 11) * ((x - 62) / 11));
      const cs = [2, 6, 13, 24, 34, 25, 12, 6, 2];
      cs.forEach((n, i) => { const x = 34 + i * 7; p.path([[x, 0], [x + 6, 0], [x + 6, n * 1.05], [x, n * 1.05]], { fill: alpha(pal.muted, .35), close: true }); });
      const band = [[48, 0]]; for (let x = 48; x <= 76; x += 2) band.push([x, g(x)]); band.push([76, 0]);
      p.path(band, { fill: alpha(pal.yellow, .3), close: true });
      const pts = []; for (let x = 30; x <= 98; x += 2) pts.push([x, g(x)]);
      p.path(pts, { stroke: pal.blue, width: 3 });
      p.path([[28, 0], [98, 0]], { stroke: pal['grid-strong'], width: 1.6 });
      [20, 14, 10, 6, 4, 2, 1].forEach((n, i) => { const x = 4 + i * 3.6; p.path([[x, 30], [x + 3.2, 30], [x + 3.2, 30 + n * 1.1], [x, 30 + n * 1.1]], { fill: alpha(pal.violet, .55), close: true }); });
      p.path([[20, 38], [26, 38]], { stroke: pal.muted, width: 2 });
      p.path([[26, 38], [23, 41], [23, 35]], { stroke: pal.muted, width: 2, fill: pal.muted, close: true });
    },
    hook: String.raw`Single values from a population can be lopsided, lumpy or two-humped. Yet the averages of many samples almost always pile up in the same smooth bell. Why, and how narrow is the bell?`,
    steps: [
      { title: 'One sample, one mean',
        text: String.raw`<p>The top picture is a <b>population</b>: the bar heights say how common each value is. Its mean is \(\mu=${f2(PS.mu)}\) and its standard deviation is \(\sigma=${f2(PS.sd)}\).</p><p>Press <b>Take 1 sample</b>. The blue dots are \(n=4\) values drawn at random and the yellow marker is their <b>sample mean</b> \(\bar x\). Press again a few times. Each sample gives a different \(\bar x\). The theorem is about how those means behave.</p>`,
        set: { mode: 'explore', pop: 'skew', n: 4, drop: 1 } },
      { title: 'Predict, then see',
        text: String.raw`<p>The population is still lopsided. For \(n=1\), then \(n=4\), then \(n=30\), you will predict the shape and the width of the histogram of 2000 sample means. Commit to a choice first. Then the canvas shows the answer.</p><p>The width has a name: the <b>standard error</b>, \(\sigma/\sqrt{n}\). For this population it is \(${f2(PS.sd)}\), \(${f2(PS.sd / 2)}\) and \(${f2(PS.sd / Math.sqrt(30))}\) for the three sizes.</p>`,
        set: { mode: 'predict', pop: 'skew', n: 1, pi: 0 } },
      { title: 'What it does not say',
        text: String.raw`<p>The population on the top is never changed: the theorem is about the means, not about single values. It also needs enough data. This population has rare big values (\(\mu=${f2(PR.mu)}\), \(\sigma=${f2(PR.sd)}\), skewness \(${f2(PR.skew)}\)). At \(n=4\) the means are still lumpy and lopsided.</p><p>Slide \(n\) up to \(30\) and then \(100\) and watch the lopsidedness (skewness) of the means fall toward \(0\), the value for a bell. The more lopsided the population, the larger the \(n\) you need.</p>`,
        set: { mode: 'limits', pop: 'rare', n: 4, drop: 2000 } },
      { title: 'A use: the margin of error',
        text: String.raw`<p>Because the means form a bell with spread \(\sigma/\sqrt{n}\), about \(95\%\) of them land within \(2\) standard errors of \(\mu\). That distance, \(2\sigma/\sqrt{n}\), is the <b>margin of error</b>.</p><p>Here \(n=25\), so \(2\,\mathrm{SE}=${f2(2 * PS.sd / 5)}\). The yellow band shows it and the readout gives the percentage of means inside. Press <b>Quadruple n</b> to make \(n=100\). The band becomes half as wide.</p>`,
        set: { mode: 'moe', pop: 'skew', n: 25, drop: 2000 } }
    ],
    formal: String.raw`
      <h3>Statement</h3>
      <p>Let \(X_1,X_2,\dots,X_n\) be <b>independent</b> random variables with the <b>same distribution</b>, mean \(\mu\) and <b>finite variance</b> \(\sigma^2\) (\(0&lt;\sigma^2&lt;\infty\)). Their sample mean is \(\bar X_n=\dfrac{X_1+\cdots+X_n}{n}\). Then the standardized mean
      \[ Z_n=\frac{\bar X_n-\mu}{\sigma/\sqrt{n}} \]
      converges in distribution to the standard normal: \(P(Z_n\le z)\to\Phi(z)\) for every \(z\) as \(n\to\infty\), where \(\Phi\) is the standard normal cumulative distribution function. In practice this says that for large \(n\), \(\bar X_n\) is approximately normal with mean \(\mu\) and standard deviation \(\sigma/\sqrt{n}\), the <b>standard error</b>.</p>
      <h3>What is exactly true for every n</h3>
      <p>Two facts need no limit. By linearity, \(E[\bar X_n]=\frac1n\sum E[X_i]=\mu\), so the center never moves. Because the \(X_i\) are independent, variances add:
      \[ \operatorname{Var}(\bar X_n)=\frac{1}{n^2}\sum_{i=1}^{n}\sigma^2=\frac{\sigma^2}{n}, \qquad \text{so the standard error is } \frac{\sigma}{\sqrt{n}}. \]
      The width shrinks like \(1/\sqrt{n}\): to halve it you need four times as much data. The theorem adds only the shape.</p>
      <h3>Why a bell? A sketch</h3>
      <p>Let \(Y_i=(X_i-\mu)/\sigma\), so \(E[Y]=0\) and \(E[Y^2]=1\). Then \(Z_n=\frac{1}{\sqrt{n}}\sum Y_i\). The characteristic function \(\varphi(t)=E[e^{itY}]\) has the expansion \(\varphi(s)=1-\tfrac{s^2}{2}+o(s^2)\) near \(0\), because the first moment vanishes and the second is \(1\). Independence turns the sum into a product:
      \[ E\big[e^{itZ_n}\big]=\varphi\!\Big(\frac{t}{\sqrt{n}}\Big)^{n}=\Big(1-\frac{t^2}{2n}+o\big(\tfrac1n\big)\Big)^{n}\;\longrightarrow\; e^{-t^2/2}, \]
      the characteristic function of the standard normal. Lévy's continuity theorem turns convergence of characteristic functions into convergence in distribution. Only the mean and variance of the \(X_i\) survive. Everything else about the shape of the population is forgotten, which is why a lopsided, uniform or two-humped population all give the same bell.</p>
      <h3>Worked example: a margin of error</h3>
      <p>A poll asks \(n=400\) people a yes or no question and about half say yes. Score yes as \(1\) and no as \(0\): then \(\mu=p=0.5\) and \(\sigma=\sqrt{p(1-p)}=0.5\). The standard error of the share is \(0.5/\sqrt{400}=0.025\). About \(95\%\) of the time the sample share lies within \(1.96\) standard errors of the true share, so the margin of error is \(1.96\times0.025\approx0.049\), about \(\pm5\) points. (The lesson rounds \(1.96\) to \(2\).) To halve it, poll \(1600\) people.</p>
      <p>For a mean, the same reasoning gives the interval \(\bar x\pm 1.96\,\sigma/\sqrt{n}\). With \(n=100\), \(\sigma=20\) and \(\bar x=52\) it is \(52\pm3.9\). (Practice rounds \(1.96\) to \(2\): \(52\pm4\).) In real data \(\sigma\) is unknown and is replaced by the sample standard deviation \(s\). For small \(n\) the Student \(t\) distribution corrects the multiplier \(1.96\) to a larger value.</p>
      <h3>What the theorem does not say</h3>
      <p><b>It does not make the population normal.</b> The \(X_i\) keep their own distribution. Only the distribution of \(\bar X_n\) approaches a bell. A histogram of the raw data stays lopsided however much data you collect.</p>
      <p><b>It is a statement about a limit, so small \(n\) can fail.</b> The Berry–Esseen theorem bounds the error by \(C\,\rho/(\sigma^3\sqrt{n})\), where \(C\) is an absolute constant and \(\rho=E|X-\mu|^3\). A lopsided population or rare large values make \(\rho/\sigma^3\) large, so you need a larger \(n\). The rule of thumb \(n\ge30\) is only a rule of thumb. The skewness of \(\bar X_n\) is the skewness of \(X\) divided by \(\sqrt{n}\): for the population with rare big values it is \(${f2(PR.skew)}\) at \(n=1\) and \(${f2(PR.skew / 2)}\) at \(n=4\).</p>
      <p><b>The assumptions matter.</b> If the variance is infinite (a heavy tail, such as the Cauchy distribution, which has no mean either, so the hypotheses fail twice), the theorem fails. The mean of \(n\) Cauchy values has exactly the same Cauchy distribution as one value, so averaging never narrows it. If the \(X_i\) are strongly dependent, \(\operatorname{Var}(\bar X_n)\) is not \(\sigma^2/n\). The lesson draws only populations on \([0,10]\), whose variance is always finite, so it cannot show the Cauchy failure. It is stated here as a theorem about the assumptions.</p>
      <p><b>Related facts.</b> The Galton board is the special case where each \(X_i\) is \(0\) or \(1\): the sum is binomial, and the de Moivre–Laplace theorem is the CLT for that case.</p>`,
    check: [
      { q: String.raw`A population of incomes is moderately skewed to the right (skewness about \(1\)), with mean \(\mu\) and standard deviation \(\sigma\). You take many samples of size \(n=40\) and plot the histogram of the sample means. Which description is most accurate?`,
        choices: ['It is skewed to the right, just like the population', String.raw`It is close to a bell, centered at \(\mu\), and much narrower than the population`, String.raw`It is close to a bell, centered at \(\mu\), with the same spread \(\sigma\) as the population`, 'It is close to a bell, centered at the median of the population'], answer: 1,
        why: String.raw`The means are centered at \(\mu\) (always) and their spread is \(\sigma/\sqrt{40}\), about \(0.16\sigma\), much narrower than \(\sigma\). With \(40\) values the lopsidedness has mostly averaged out (the skewness is divided by \(\sqrt{40}\), about \(6\)), so the histogram is close to a bell. The first choice forgets that averaging removes skew. The third forgets that the spread shrinks. The median is not what the means are centered on, since the average of the sample means equals the mean.`,
        hint: 'Two things change when you average: the shape and the width. What stays fixed is the center.' },
      { q: String.raw`Heights in a large population have mean \(170\) cm and standard deviation \(12\) cm, and the distribution is not normal. You take samples of \(n=36\) people and compute each sample mean. About \(95\%\) of the sample means will fall between which two values?`,
        choices: [String.raw`\(158\) cm and \(182\) cm`, String.raw`\(164\) cm and \(176\) cm`, String.raw`\(168\) cm and \(172\) cm`, String.raw`\(166\) cm and \(174\) cm`], answer: 3,
        why: String.raw`The standard error is \(12/\sqrt{36}=12/6=2\) cm. About \(95\%\) of the sample means lie within \(2\) standard errors of \(170\): \(170\pm4\), so \(166\) to \(174\). The interval \(158\) to \(182\) is \(170\pm1\sigma\), which describes single people. \(164\) to \(176\) is \(\pm3\) standard errors (about \(99.7\%\)). \(168\) to \(172\) is \(\pm1\) standard error (about \(68\%\)).`,
        hint: String.raw`First find the standard error \(\sigma/\sqrt{n}\). Then go out two standard errors on each side of the mean.` },
      { q: String.raw`A student writes: "I collected 500 test scores from a very skewed distribution. The central limit theorem says that with \(n=500\) the histogram of my 500 scores will be a bell curve." What is wrong with this statement?`,
        choices: ['Nothing is wrong, since 500 is larger than 30', String.raw`The theorem needs \(n\) to be at least \(1000\)`, String.raw`The theorem is about the histogram of sample means, not about the histogram of the raw scores, which stays skewed`, String.raw`The theorem only applies when the population is already normal`], answer: 2,
        why: String.raw`The theorem describes the distribution of the sample mean \(\bar X\), computed over many repeated samples. The \(500\) raw scores are \(500\) draws from the original, skewed population, and their histogram looks like that population. Only the average of the scores behaves like a bell around \(\mu\), with spread \(\sigma/\sqrt{500}\). The size \(1000\) is invented. The theorem does not need a normal population, which is exactly why it is useful.`,
        hint: 'Which quantity does the theorem say becomes bell-shaped: the data values or the average of a sample?' }
    ],
    links: { related: ['the-normal-distribution', 'pascals-triangle-and-the-galton-board', 'probability-with-repeated-trials', 'mean-median-and-spread'] },

    mount({ stage, controls: C }) {
      const st = { w: PRE.skew.w.slice(), key: 'skew', n: 4, sel: 2 };
      let mode = 'explore', modeBefore = 'explore', band = false, ov = true, S = pstat(st.w);
      let rng = mulberry(SEED), counts = new Array(NBIN).fill(0), means = [], N = 0, sumM = 0, last = [], lastMean = null;
      let pi = 0, pPhase = 0, pMsg = '', pDone = false;
      let xi = 0, xSolved = false, xTried = false, xFirst = 0, xDone = 0, xOver = false, xMsg = '', xReveal = false;
      stage.classList.add('split');
      const top = h('div', { class: 'pane', style: 'flex: 1 1 0' }), bot = h('div', { class: 'pane', style: 'flex: 1 1 0' });
      stage.append(top, bot);
      const P1 = new Plane(top, { span: 6 }), P2 = new Plane(bot, { span: 6 });

      const se = () => S.sd / Math.sqrt(st.n);
      const resetSamples = () => { rng = mulberry(SEED); counts = new Array(NBIN).fill(0); means = []; N = 0; sumM = 0; last = []; lastMean = null; };
      const draw1 = () => { const u = rng() * S.tot; let i = 0; while (i < NB - 1 && u >= S.cum[i]) i++; return i + rng(); };
      const take = k => {
        for (let j = 0; j < k && N < CAP; j++) {
          let s = 0; const keep = j === k - 1 ? [] : null;
          for (let i = 0; i < st.n; i++) { const v = draw1(); s += v; if (keep) keep.push(v); }
          const m = s / st.n; means.push(m); counts[Math.min(NBIN - 1, Math.floor(m / BW))]++; N++; sumM += m;
          if (keep) { last = keep; lastMean = m; }
        }
      };
      const obs = () => {
        if (!N) return null;
        const mean = sumM / N; let v = 0, m3 = 0;
        for (const m of means) { const d = m - mean; v += d * d; m3 += d * d * d; }
        v /= N; m3 /= N;
        return { mean, sd: Math.sqrt(v), skew: v > 0 ? m3 / Math.pow(v, 1.5) : 0 };
      };
      const inBand = () => { const a = S.mu - 2 * se(), b = S.mu + 2 * se(); let k = 0; for (const x of means) if (x >= a && x <= b) k++; return k; };
      const rerun = () => { const k = Math.min(N, 2000); resetSamples(); if (k) take(k); };
      const setPop = (w, key) => { st.w = w.slice(); st.key = key; S = pstat(st.w); popSel.value = key; };

      /* ---------- drawing ---------- */
      const fsOf = p => clamp(p.scale * 3.6, 15, 19);
      const axis = (p, fs, lo, hi, tk, fmtf) => {
        const pal = p.pal, c = p.ctx, ux = x => (x - lo) / (hi - lo) * W;
        p.path([[0, 0], [W, 0]], { stroke: pal['grid-strong'], width: 2 });
        for (let x = lo; x <= hi + 1e-9; x += tk) {
          const u = ux(x); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.beginPath(); c.moveTo(p.X(u), p.Y(0)); c.lineTo(p.X(u), p.Y(0) + 5); c.stroke();
          p.label(fmtf(x), u, 0, { size: fs, italic: false, color: pal.muted, dy: 17 });
        }
      };
      const vline = (p, u, y1, col, dash) => p.path([[u, 0], [u, y1]], { stroke: col, width: 2.5, dash: dash || [7, 6] });
      const bracket = (p, a, b, y, col) => {
        p.path([[a, y - 1.2], [a, y + 1.2]], { stroke: col, width: 2.5 }); p.path([[b, y - 1.2], [b, y + 1.2]], { stroke: col, width: 2.5 });
        p.path([[a, y], [b, y]], { stroke: col, width: 2.5 });
      };
      const curveUnder = (p, f, a, b, fill, stroke, lw) => {
        const pts = [[a, 0]]; for (let i = 0; i <= 160; i++) { const u = a + (b - a) * i / 160; pts.push([u, f(u)]); } pts.push([b, 0]);
        if (fill) p.path(pts, { fill, close: true });
        if (stroke) p.path(pts.slice(1, -1), { stroke, width: lw || 3 });
      };

      const practiceTop = (c, p, pr) => {
        const pal = p.pal, fs = fsOf(p), ux = x => (x - pr.lo) / (pr.hi - pr.lo) * W;
        lab(p, pr.nocurve ? 'One value (shape not given)' : 'One value (a single draw)', 0, ty(p), { size: fs, color: pal.text, align: 'left', dx: p.w < 500 ? 30 : 14 });
        axis(p, fs, pr.lo, pr.hi, pr.tk, v => String(+v.toFixed(2)));
        if (pr.disc) {
          [0, 1].forEach(v => { const x = ux(v); p.path([[x - 3, 0], [x + 3, 0], [x + 3, H * .5], [x - 3, H * .5]], { fill: alpha(pal.muted, .35), stroke: pal.muted, width: 1.5, close: true }); lab(p, v ? 'yes = 1' : 'no = 0', x, H * .5 + 4, { size: fs, color: pal.text }); });
        } else if (!pr.nocurve) {
          curveUnder(p, u => pdfN(pr.lo + u / W * (pr.hi - pr.lo), pr.mu, pr.sd) * pr.sd * Math.sqrt(2 * Math.PI) * H * CURVEK, 0, W, alpha(pal.muted, .3), pal.muted, 2.5);
        }
        vline(p, ux(pr.mu), H - 1.5, pal.yellow);
        lab(p, 'μ = ' + String(+pr.mu.toFixed(2)), ux(pr.mu), muY(p), { size: fs, color: pal.yellow });
        const a = ux(pr.mu - pr.sd), b = ux(pr.mu + pr.sd);
        bracket(p, a, b, H - 5.5, pal.green); brLab(p, a, b, H - 5.5, 'σ = ' + String(+pr.sd.toFixed(2)), pal.green, fs);
      };
      const practiceBot = (c, p, pr) => {
        const pal = p.pal, fs = fsOf(p), ux = x => (x - pr.lo) / (pr.hi - pr.lo) * W, sem = pr.sd / Math.sqrt(pr.n);
        lab(p, xReveal ? `Sample means, n = ${pr.n}` : 'Sample means', 0, ty(p), { size: fs, color: pal.text, align: 'left', dx: p.w < 500 ? 30 : 14 });
        axis(p, fs, pr.lo, pr.hi, pr.tk, v => String(+v.toFixed(2)));
        if (!xReveal) { lab(p, 'Answer to see the sample means', W / 2, H * .45, { size: fs, color: pal.muted }); return; }
        const peak = 1 / (sem * Math.sqrt(2 * Math.PI)), kk = H * CURVEK / peak, dens = x => pdfN(x, pr.mu, sem) * kk;
        const toX = u => pr.lo + u / W * (pr.hi - pr.lo);
        if (pr.band) curveUnder(p, u => dens(toX(u)), Math.max(0, ux(pr.mu - 2 * sem)), Math.min(W, ux(pr.mu + 2 * sem)), alpha(pal.yellow, .4));
        if (pr.n0) { const s0 = pr.sd / Math.sqrt(pr.n0), k0 = kk; p.path(Array.from({ length: 161 }, (_, i) => [W * i / 160, pdfN(toX(W * i / 160), pr.mu, s0) * k0]), { stroke: pal.muted, width: 2, dash: [6, 5] }); }
        curveUnder(p, u => dens(toX(u)), 0, W, alpha(pal.blue, .12), pal.blue, 3.5);
        vline(p, ux(pr.mu), H - 1.5, pal.yellow);
        const a = ux(pr.mu - sem), b = ux(pr.mu + sem);
        bracket(p, a, b, H - 5.5, pal.green); brLab(p, a, b, H - 5.5, 'SE = ' + String(+sem.toFixed(3)), pal.green, fs);
        if (pr.band) lab(p, '±2 SE band', ux(pr.mu + 2 * sem) + 1.5, H * .2, { size: fs, color: pal.text, align: 'left' });
      };

      const hbar = w => w / 20 * H * BARK;
      P1.onDraw = (c, p) => {
        p.fit(W, H, { l: 8, r: 8, t: 9, b: 10 });
        const pal = p.pal, fs = fsOf(p);
        if (mode === 'practice') { const pr = PROBS[xi]; if (pr.nopic) { lab(p, 'No picture for this one.', W / 2, H * .6, { size: fs + 1, color: pal.muted }); lab(p, 'Use what you know about the mean.', W / 2, H * .45, { size: fs + 1, color: pal.muted }); } else practiceTop(c, p, pr); return; }
        const editable = mode !== 'predict';
        lab(p, 'Population: one value x' + (editable ? ' (drag the rings)' : ''), 0, ty(p), { size: fs, color: pal.text, align: 'left', dx: p.w < 500 ? 30 : 14 });
        axis(p, fs, 0, 10, 2, v => String(v));
        st.w.forEach((w, i) => {
          const x0 = i * 10, x1 = x0 + 10, hb = hbar(w);
          if (w > 0) p.path([[x0, 0], [x1, 0], [x1, hb], [x0, hb]], { fill: alpha(pal.muted, .32), stroke: alpha(pal.muted, .9), width: 1.2, close: true });
        });
        const ux = S.mu * 10;
        vline(p, ux, H - 1.5, pal.yellow);
        lab(p, 'μ = ' + f2(S.mu), ux, muY(p), { size: fs, color: pal.yellow });
        const a = (S.mu - S.sd) * 10, b = (S.mu + S.sd) * 10;
        bracket(p, a, b, H - 5.5, pal.green); brLab(p, a, b, H - 5.5, 'σ = ' + f2(S.sd), pal.green, fs);
        /* the last sample: stacked blue dots and a yellow marker for its mean */
        if (last.length && mode !== 'predict') {
          const rr = clamp(p.scale * .75, 3, 5), stack = {};
          last.slice(0, 80).forEach(v => { const k = Math.round(v * 5), r = stack[k] = (stack[k] || 0) + 1; p.dot(v * 10, 1.4 + rr / p.scale + (r - 1) * 2 * rr / p.scale * 1.05, rr, pal.blue, pal.stage, 1.2); });
          const mx = lastMean * 10;
          p.path([[mx, 0], [mx, 29.5]], { stroke: alpha(pal.yellow, .9), width: 2 });
          p.path([[mx, 29.5], [mx - 1.8, 33.3], [mx + 1.8, 33.3]], { fill: pal.yellow, stroke: pal.stage, width: 1.5, close: true });
          lab(p, 'x̄ = ' + f2(lastMean), mx + 2.6, 31.5, { size: fs, color: pal.text, align: 'left' });
        }
        if (editable) st.w.forEach((w, i) => {
          const q = [i * 10 + 5, hbar(w)], sel = i === st.sel;
          p.dot(q[0], q[1], sel ? 9.5 : 8, sel ? pal.yellow : pal.stage, pal.brass, 3);
          p.label(String(w), q[0], q[1], { size: fs - 1, italic: false, color: pal.text, dy: -21 });
        });
      };

      P2.onDraw = (c, p) => {
        p.fit(W, H, { l: 8, r: 8, t: 9, b: 10 });
        const pal = p.pal, fs = fsOf(p);
        if (mode === 'practice') { const pr = PROBS[xi]; if (pr.nopic) { lab(p, 'Reason about the center, spread and shape.', W / 2, H * .5, { size: fs, color: pal.muted }); } else practiceBot(c, p, pr); return; }
        const sem = se(), peak = 1 / (sem * Math.sqrt(2 * Math.PI)), hide = mode === 'predict' && pPhase === 0;
        lab(p, 'Sample means x̄, n = ' + st.n, 0, ty(p), { size: fs, color: pal.text, align: 'left', dx: p.w < 500 ? 30 : 14 });
        axis(p, fs, 0, 10, 2, v => String(v));
        if (hide) { lab(p, 'Choose a prediction first.', W / 2, H * .5, { size: fs + 1, color: pal.muted }); return; }
        let maxD = peak; if (N) counts.forEach(k => { maxD = Math.max(maxD, k / (N * BW)); });
        const kk = H * CURVEK / maxD, dens = x => pdfN(x, S.mu, sem) * kk;
        if (band) { const a = Math.max(0, (S.mu - 2 * sem) * 10), b = Math.min(W, (S.mu + 2 * sem) * 10); curveUnder(p, u => dens(u / 10), a, b, alpha(pal.yellow, .42)); }
        if (N) counts.forEach((k, j) => {
          if (!k) return; const x0 = j * BW * 10, x1 = x0 + BW * 10, hb = k / (N * BW) * kk;
          p.path([[x0, 0], [x1, 0], [x1, hb], [x0, hb]], { fill: alpha(pal.muted, .4), stroke: alpha(pal.muted, .95), width: 1, close: true });
        });
        if (ov) curveUnder(p, u => dens(u / 10), 0, W, null, pal.blue, 3.5);
        vline(p, S.mu * 10, H - 1.5, pal.yellow);
        lab(p, 'μ = ' + f2(S.mu), S.mu * 10, muY(p), { size: fs, color: pal.yellow });
        const a = (S.mu - sem) * 10, b = (S.mu + sem) * 10;
        bracket(p, a, b, H - 5.5, pal.green); brLab(p, a, b, H - 5.5, 'SE = σ/√n = ' + f2(sem), pal.green, fs);
        if (band) lab(p, '±2 SE band', (S.mu + 2 * sem) * 10 + 1.5, H * .2, { size: fs, color: pal.text, align: 'left' });
        if (lastMean !== null) { const mx = lastMean * 10; p.path([[mx, 0], [mx - 1.8, 4], [mx + 1.8, 4]], { fill: pal.yellow, stroke: pal.stage, width: 1.5, close: true }); lab(p, 'x̄', mx, 7.5, { size: fs, color: pal.text }); }
        if (!N) lab(p, 'Press a Take button to build the histogram', W / 2, H * .4, { size: fs, color: pal.muted });
        else if (ov) { const lx = Math.min(S.mu * 10 + 14 * sem, 82); lab(p, 'normal curve', lx, dens(lx / 10) + 5, { size: fs, color: pal.blue }); }
      };

      /* ---------- readout ---------- */
      const K = s => `<span class="k">${s}</span>`;
      const exploreRo = () => {
        const o = obs(), L = [];
        L.push(`${K('Population')} ${popName()}<br>μ = ${f2(S.mu)}, σ = ${f2(S.sd)}`);
        L.push(`${K('Sample size')} n = ${st.n}<br>${K('Standard error')} σ/√n = ${f2(S.sd)} ÷ √${st.n} = ${f2(se())}`);
        if (last.length) L.push(`${K('Last sample')} ${last.slice(0, 6).map(f1).join(', ')}${last.length > 6 ? ', …' : ''}<br>mean x̄ = ${f2(lastMean)}`);
        if (o) {
          let t = `${K('Means so far')} ${N} sample${N === 1 ? '' : 's'}<br>average of x̄ = ${f2(o.mean)} (μ = ${f2(S.mu)})${N > 1 ? `<br>spread of x̄ = ${f2(o.sd)} (σ/√n = ${f2(se())})` : ''}`;
          if (mode === 'limits') t += `<br>${K('Lopsidedness')} skewness of x̄ = ${f2(o.skew)} (about ${f2(S.skew / Math.sqrt(st.n))} expected, 0 for a bell)`;
          if (band) t += `<br>${K('Band')} μ ± 2 SE = ${f2(S.mu - 2 * se())} to ${f2(S.mu + 2 * se())}<br>${(inBand() / N * 100).toFixed(1)}% of the means are inside`;
          L.push(t);
        } else if (mode === 'limits') L.push(`${K('Lopsidedness')} population skewness ${f2(S.skew)}; the means should have about ${f2(S.skew / Math.sqrt(st.n))}`);
        return L.join('<br><br>');
      };
      const popName = () => st.key === 'custom' ? 'Your own histogram' : PRE[st.key].label;

      /* ---------- controls ---------- */
      const host = C.readout().parentNode; host.lastElementChild.remove();
      const grp = { pop: [], samp: [], moe: [], pred: [] };
      const track = (g, fn) => { const n0 = host.children.length, r = fn(); for (let i = n0; i < host.children.length; i++) grp[g].push(host.children[i]); return r; };
      const show = (els, on) => els.forEach(e => { e.style.display = on ? '' : 'none'; });
      let popSel, binS, nS, bandT, ovT, takeBtns, pBtns, pNext, prq, pro, xBtns, xNext, xTally, startBtn, ro;
      const vis = () => {
        const prac = mode === 'practice', pred = mode === 'predict';
        show(grp.pop, !prac && !pred); show(grp.samp, !prac && (!pred || pDone)); show(grp.moe, mode === 'moe'); show(grp.pred, pred);
        show(pracEls, prac); ro.style.display = prac || (pred && !pDone) ? 'none' : '';
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
      };
      const sync = () => {
        nS.set(st.n); binS.set(st.sel + 1); bandT.checked = band; ovT.checked = ov;
        if (mode !== 'practice') ro.innerHTML = exploreRo();
        if (mode === 'predict') predUi();
        vis(); P1.draw(); P2.draw();
      };

      track('pop', () => C.title('Population'));
      popSel = track('pop', () => C.select({ label: 'Shape of the population', options: [...Object.keys(PRE).map(k => ({ value: k, label: PRE[k].label })), { value: 'custom', label: 'My own histogram' }], value: 'skew',
        onChange: v => { if (v === 'custom') { st.key = 'custom'; } else { setPop(PRE[v].w, v); } rerun(); sync(); } }));
      binS = track('pop', () => C.slider({ label: 'Bin to edit (values from ... to ...)', min: 1, max: NB, step: 1, value: st.sel + 1, format: v => `${v - 1} to ${v}`, onInput: v => { st.sel = v - 1; sync(); } }));
      track('pop', () => C.buttons([{ label: 'Shorter bar', onClick: () => editBin(st.sel, st.w[st.sel] - 1) }, { label: 'Taller bar', onClick: () => editBin(st.sel, st.w[st.sel] + 1) }]));
      track('pop', () => C.hint('Drag a ring on the top picture, or choose a bin with the slider and use the two buttons. Bar heights are whole numbers from 0 to 20.'));

      track('samp', () => C.title('Samples'));
      nS = track('samp', () => C.slider({ label: 'Sample size n', min: 1, max: 100, step: 1, value: st.n, format: v => String(Math.round(v)), onInput: v => { st.n = Math.round(v); rerun(); sync(); } }));
      takeBtns = track('samp', () => C.buttons([
        { label: 'Take 1 sample', onClick: () => { take(1); sync(); } },
        { label: 'Take 10', onClick: () => { take(10); sync(); } },
        { label: 'Take 1000', primary: true, onClick: () => { take(1000); sync(); } },
        { label: 'Clear', onClick: () => { resetSamples(); sync(); } }]));
      ovT = track('samp', () => C.toggle({ label: 'Show the matching normal curve', value: ov, onChange: v => { ov = v; sync(); } }));
      bandT = track('samp', () => C.toggle({ label: 'Show the ± 2 SE band', value: band, onChange: v => { band = v; sync(); } }));
      track('samp', () => C.hint('Changing n or the population repeats the run with the same random numbers. The height scale of the lower picture adjusts to fit.'));
      track('moe', () => C.buttons([{ label: 'Quadruple n', primary: true, onClick: () => { st.n = Math.min(100, st.n * 4); rerun(); sync(); } }, { label: 'Back to n = 25', onClick: () => { st.n = 25; rerun(); sync(); } }]));

      /* predict panel */
      track('pred', () => C.title('Predict, then see'));
      prq = track('pred', () => C.readout());
      pBtns = track('pred', () => C.buttons([0, 1, 2].map(i => ({ label: '', onClick: () => pAnswer(i) }))));
      pNext = track('pred', () => C.buttons([{ label: 'Next', primary: true, onClick: () => pAdvance() }]))[0];
      ro = C.readout();

      /* practice panel */
      C.title('Practice');
      C.hint('Six short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => togglePractice() }])[0];
      const pracEls = [];
      const pn0 = host.children.length;
      xTally = h('p', { class: 'ctl-title' }); host.append(xTally);
      pro = C.readout();
      xBtns = C.buttons([0, 1, 2, 3].map(i => ({ label: '', onClick: () => xAnswer(i) })));
      xNext = C.buttons([{ label: 'Next problem', primary: true, onClick: () => xAdvance() }])[0];
      for (let i = pn0; i < host.children.length; i++) pracEls.push(host.children[i]);

      /* ---------- editing ---------- */
      const editBin = (i, v) => {
        v = clamp(v, 0, 20); if (v === st.w[i]) return;
        const w = st.w.slice(); w[i] = v; if (w.reduce((a, b) => a + b, 0) === 0) return;
        st.w = w; st.key = 'custom'; S = pstat(st.w); popSel.value = 'custom'; st.sel = i; rerun(); sync();
      };

      /* ---------- predict flow ---------- */
      const predLoad = () => {
        st.n = PN[pi]; pPhase = 0; pMsg = ''; resetSamples(); setPop(PRE.skew.w, 'skew'); band = false;
        pBtns.forEach((b, k) => { b.textContent = PREDS[pi].opts[k]; });
        pNext.textContent = pi < 2 ? 'Next prediction' : 'Finish';
      };
      const predUi = () => {
        const pr = PREDS[pi];
        prq.innerHTML = `<b>Prediction ${pi + 1} of 3.</b> ${pr.q}` + (pMsg ? `<br><br>${pMsg}` : pPhase === 0 ? '<br><br>Choose the description you expect. The canvas draws the 2000 means after you choose correctly.' : '');
        pBtns.forEach(b => { b.style.display = pPhase === 0 ? '' : 'none'; });
        pNext.style.display = pPhase === 1 ? '' : 'none';
      };
      const pAnswer = i => {
        if (pPhase) return; const pr = PREDS[pi];
        if (i === pr.ans) {
          pPhase = 1; take(2000); const o = obs();
          pMsg = `<b>Right.</b> ${pr.why[i]}<br><br>Observed: the means have spread ${f2(o.sd)} and the formula σ/√${st.n} gives ${f2(se())}. Their skewness is ${f2(o.skew)} (population: ${f2(S.skew)}).`;
        } else pMsg = `${pr.why[i]} Try another choice.`;
        sync();
      };
      const pAdvance = () => {
        if (pi < 2) { pi++; predLoad(); }
        else { pDone = true; pMsg = `<b>All three done.</b> The center stayed at μ = ${f2(S.mu)}, the width followed σ/√n, and the shape became a bell. The n slider below is now free. The sample size is n = ${st.n}.`; pPhase = 1; pNext.style.display = 'none'; }
        sync();
      };

      /* ---------- practice flow ---------- */
      const xTallyUpdate = () => { xTally.textContent = xOver ? `Right on the first try: ${xFirst} of ${PROBS.length}` : `Problem ${xi + 1} of ${PROBS.length}. Right on the first try: ${xFirst} of ${xDone} done`; };
      const xLoad = () => {
        const pr = PROBS[xi]; xSolved = false; xTried = false; xReveal = false; xMsg = '';
        xBtns.forEach((b, k) => { b.textContent = pr.opts[k]; b.style.display = ''; });
        xNext.disabled = true; xNext.textContent = xi === PROBS.length - 1 ? 'Finish' : 'Next problem'; xNext.style.display = '';
        xTallyUpdate(); xRo();
      };
      const xRo = () => { const pr = PROBS[xi]; pro.innerHTML = xOver ? `<b>All ${PROBS.length} problems are done.</b> You got ${xFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.` : `<b>Problem ${xi + 1}.</b> ${pr.q}` + (xMsg ? `<br><br>${xMsg}` : ''); };
      const xAnswer = i => {
        if (xSolved || xOver) return; const pr = PROBS[xi];
        if (i === pr.ans) { xSolved = true; xReveal = true; if (!xTried) xFirst++; xDone++; xNext.disabled = false; xMsg = `<b>Right.</b> ${pr.why[i]}<br><br>${pr.end}`; xTallyUpdate(); }
        else { xTried = true; xMsg = `${pr.why[i]} Try another choice.`; }
        xRo(); sync();
      };
      const xAdvance = () => {
        if (xi < PROBS.length - 1) { xi++; xLoad(); sync(); return; }
        xOver = true; xBtns.forEach(b => { b.style.display = 'none'; }); xNext.textContent = 'Start over'; xNext.disabled = false;
        xNext.onclick = () => { xi = 0; xFirst = 0; xDone = 0; xOver = false; xNext.onclick = () => xAdvance(); xLoad(); sync(); };
        xTallyUpdate(); xRo(); sync();
      };
      const togglePractice = () => {
        if (mode === 'practice') { mode = modeBefore; if (mode === 'predict') predLoad(); }
        else { modeBefore = mode; mode = 'practice'; if (!xDone && !xOver) xLoad(); else { xTallyUpdate(); xRo(); } }
        sync();
      };

      /* ---------- dragging the bar rings ---------- */
      draggable(P1, {
        hit: (px, py) => {
          if (mode === 'practice' || mode === 'predict') return null;
          let best = null, bd = 22;
          st.w.forEach((w, i) => { const d = Math.hypot(P1.X(i * 10 + 5) - px, P1.Y(hbar(w)) - py); if (d <= bd) { bd = d; best = i; } });
          return best;
        },
        move: (i, x, y) => editBin(i, Math.round(y / (H * BARK) * 20))
      });

      const apply = (patch, immediate) => {
        const { mode: m, pop, drop, pi: ppi, ...nums } = patch;
        if (m !== undefined) mode = m;
        if (mode === 'practice') { mode = 'explore'; }
        if (pop !== undefined) setPop(PRE[pop].w, pop);
        if (nums.n !== undefined) st.n = nums.n;
        band = mode === 'moe'; ov = true;
        resetSamples();
        if (mode === 'predict') { pi = ppi || 0; pDone = false; predLoad(); }
        else if (drop) take(drop);
        sync();
      };
      resetSamples(); take(1); sync();
      return { destroy: () => { P1.destroy(); P2.destroy(); }, apply };
    }
  });
}
