/* =====================================================================
   SCHOOL — Expected value
   ===================================================================== */
{
  /* ---------- numbers and words ---------- */
  const MINUS = '−';
  const r2 = v => Math.round(v * 100) / 100;
  const grp = s => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const neg = v => v < -0.004;
  /* $3, $2.50, −$0.50 (whole dollars lose the cents) */
  const m = v => { const a = Math.abs(r2(v)); return (neg(v) ? MINUS : '') + '$' + (Number.isInteger(a) ? a : a.toFixed(2)); };
  /* always two decimals: $2.50, −$0.50, $18.00 */
  const m2 = v => { const a = Math.abs(r2(v)); return (neg(v) ? MINUS : '') + '$' + grp(a.toFixed(2)); };
  const sg = v => (r2(v) > 0 ? '+' : '') + m(v);
  const sg2 = v => (r2(v) > 0 ? '+' : '') + m2(v);
  const pc1 = v => (v * 100).toFixed(1) + '%';
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = (a, b) => `<span class="k">${a}</span> ${b}`;
  const I = (label, right, why) => ({ label, right, why });
  const seat = (items, seed) => {
    const i = items.findIndex(x => x.right), rest = items.filter((_, j) => j !== i);
    rest.splice(seed % items.length, 0, items[i]);
    return rest;
  };
  const kind = v => r2(v) > 0 ? 'favorable' : r2(v) < 0 ? 'unfavorable' : 'fair';

  /* ---------- the activities ---------- */
  const ACTS = [
    { id: 'build', label: '1. Build the expected value (spinner)' },
    { id: 'dec1', label: '2a. Decide: two dice games' },
    { id: 'dec2', label: '2b. Decide: a warranty' },
    { id: 'dec3', label: '2c. Decide: two spinners' },
    { id: 'exp', label: '3. Use data: free throws' },
    { id: 'fair', label: '4a. Set the prize (fair game)' },
    { id: 'profit', label: '4b. Set the price (best profit)' },
    { id: 'chance', label: '4c. Choose tickets (best chance)' }
  ];

  /* ----- activity 1: the spinner ----- */
  const SECT = [0, 2, 0, 6, 0, 10, 2, 0];                 /* 8 equal sectors, prizes in dollars */
  const FEE = 3;
  const ROWS = [{ prize: 0, n: 4, f: '1/2' }, { prize: 2, n: 2, f: '1/4' }, { prize: 6, n: 1, f: '1/8' }, { prize: 10, n: 1, f: '1/8' }];
  const contrib = r => r.n / 8 * r.prize;                 /* 0, 0.5, 0.75, 1.25 */
  const EVPAY = ROWS.reduce((s, r) => s + contrib(r), 0); /* 2.5 */
  const EVNET = EVPAY - FEE;                              /* -0.5 */

  const buildQs = () => {
    const rowQ = (i, bad) => {
      const r = ROWS[i], c = contrib(r), cnt = r.n;
      const ask = `The spinner has 8 equal sectors. ${cnt === 1 ? 'One sector pays' : cnt + ' of them pay'} ${m(r.prize)}. What is the probability of landing on ${m(r.prize)}?`;
      const items = [I(r.f, true, `${ok('Right.')} ${cnt} of the 8 equal sectors pay ${m(r.prize)}, so the probability is ${cnt}/8 = ${r.f}. ` +
        (r.prize === 0 ? `A $0 prize adds nothing to the average: ${r.f} × $0 = $0.00.`
          : `This row adds ${r.f} × ${m(r.prize)} = ${m2(c)} to the expected payout. The bar shows it.`) +
        (i === 3 ? ' Check: 1/2 + 1/4 + 1/8 + 1/8 = 1, so the four rows cover every spin.' : ''))];
      bad.forEach(([lab, why]) => items.push(I(lab, false, `${no('Not quite.')} ${why}`)));
      return { ask, items: seat(items, i + 1) };
    };
    return [
      rowQ(0, [['1/4', 'That counts the four different prizes as equally likely (1 of 4). But the sectors are equal, not the prizes. $0 covers 4 of the 8 sectors, so it is 4/8.'],
        ['4', 'That is the number of sectors. A probability is a fraction of all 8 sectors, so it is 4/8.'], ['1/8', 'That is the chance of ONE sector. Four sectors say $0, so the chance is 4/8.']]),
      rowQ(1, [['1/8', 'That is the chance of one sector. Two sectors pay $2, so it is 2/8.'], ['1/2', 'That is the $0 row, which has 4 sectors. The $2 prize has 2 sectors, so it is 2/8.'], ['2', 'That is the number of sectors. A probability is a fraction of all 8, so it is 2/8.']]),
      rowQ(2, [['1/4', 'That counts the four different prizes as equally likely (1 of 4). The sectors are equal, so one sector is 1 of 8.'], ['1/6', 'That uses the prize amount. A bigger prize does not change the chance. Count sectors: 1 of 8.'], ['1/2', 'That is the $0 row. The $6 prize has just one sector, so it is 1/8.']]),
      rowQ(3, [['1/4', 'That counts the four different prizes as equally likely (1 of 4). One sector pays $10, so it is 1 of 8.'], ['1/10', 'That uses the prize amount. The chance depends on how many sectors pay $10, and that is one of the 8.'], ['1/2', 'That is the $0 row. The $10 prize has one sector, so it is 1/8.']]),
      { ask: 'Expected value is the sum of all the bars (each probability times its prize). What is the expected payout of one spin?',
        items: seat([
          I(m2(EVPAY), true, `${ok('Right.')} 0 + 0.50 + 0.75 + 1.25 = ${m2(EVPAY)}. This is a weighted average: each prize counts as much as its probability. Over many spins you get back about ${m2(EVPAY)} per spin.`),
          I('$4.50', false, `${no('Not quite.')} (0 + 2 + 6 + 10) ÷ 4 = $4.50 is the plain average of the four prizes. It gives the $10 prize the same weight as $0, but $0 comes up 4 times in 8 spins and $10 only once.`),
          I('$18.00', false, `${no('Not quite.')} 0 + 2 + 6 + 10 = 18 just adds the prizes and ignores how likely each one is. No spin pays more than $10, so an average of $18 cannot be right.`),
          I('$1.25', false, `${no('Not quite.')} $1.25 is only the last bar. The expected value adds ALL four bars.`)
        ], 2) },
      { ask: `One spin costs ${m(FEE)}. What is the expected net gain per spin? (Net = what you get back minus what you paid.)`,
        items: seat([
          I(m2(EVNET), true, `${ok('Right.')} ${m2(EVPAY)} − ${m(FEE)} = ${m2(EVNET)}. On average a player loses 50 cents per spin. The bars show it: the blue bar (payout) is shorter than the red bar (fee). A game with an expected net below $0 is <b>unfavorable</b> to the player.`),
          I('+$0.50', false, `${no('Not quite.')} You subtracted the wrong way round. The player pays $3 and gets back $2.50 on average, so the player ends up behind, not ahead.`),
          I('−$3.00', false, `${no('Not quite.')} $3 is only the fee. The player also gets prizes back, $2.50 on average per spin.`),
          I('+$2.50', false, `${no('Not quite.')} $2.50 is the payout alone. It ignores the $3 the player paid for the spin.`)
        ], 1) },
      { ask: 'Press Play 1 a few times. Can ONE spin end with a net of exactly −$0.50, the expected net?',
        items: seat([
          I('No. One spin ends at −$3, −$1, +$3 or +$7. The expected value is a long-run average.', true, `${ok('Right.')} Each spin pays $0, $2, $6 or $10, so the net is −$3, −$1, +$3 or +$7. −$0.50 is never one of them. The expected value describes the average of MANY spins. Press Play 1,000 and watch the running average settle near −$0.50 while single spins stay far from it.`),
          I('Yes. It is the most likely result of a spin.', false, `${no('Not quite.')} The most likely single result is −$3, the $0 prize (probability 1/2). The expected value is not the most likely result.`),
          I('Yes. Every spin ends exactly at the expected net.', false, `${no('Not quite.')} Look at the plays: the nets jump around between −$3 and +$7. Expected value is not a promise about one play.`)
        ], 0) }
    ];
  };

  /* ----- activity 2: decisions ----- */
  const DEC = {
    dec1: { title: 'Which game is better for you?', lo: -2, hi: 2, step: 1,
      opts: [
        { name: 'Game X: costs $3', short: 'X', outs: [{ p: [1, 6], net: 9, t: 'roll a 6: win $12' }, { p: [2, 6], net: 0, t: 'roll a 4 or 5: win $3' }, { p: [3, 6], net: -3, t: 'roll 1, 2 or 3: win $0' }] },
        { name: 'Game Y: costs $3', short: 'Y', outs: [{ p: [1, 2], net: 2, t: 'roll an even number: win $5' }, { p: [1, 2], net: -3, t: 'roll an odd number: win $0' }] }
      ] },
    dec2: { title: 'Should you buy the warranty?', lo: -20, hi: 5, step: 5,
      opts: [
        { name: 'Buy the $15 warranty (repairs free)', short: 'Buy', outs: [{ p: [1, 1], net: -15, t: 'you pay $15 and repairs are free' }] },
        { name: 'Skip it (a repair would cost $120)', short: 'Skip', outs: [{ p: [1, 10], net: -120, t: 'it breaks: you pay $120' }, { p: [9, 10], net: 0, t: 'it does not break: you pay $0' }] }
      ] },
    dec3: { title: 'Which spinner is better for you?', lo: -2, hi: 2, step: 1,
      opts: [
        { name: 'Spinner P: costs $2, 3 equal sectors', short: 'P', outs: [{ p: [1, 3], net: 7, t: 'the $9 sector: win $9' }, { p: [2, 3], net: -2, t: 'the two $0 sectors: win $0' }] },
        { name: 'Spinner Q: costs $2, 5 equal sectors', short: 'Q', outs: [{ p: [1, 5], net: 8, t: 'the $10 sector: win $10' }, { p: [4, 5], net: -2, t: 'the four $0 sectors: win $0' }] }
      ] }
  };
  const evOf = o => o.outs.reduce((s, x) => s + x.p[0] / x.p[1] * x.net, 0);
  const pf = x => x.p[0] + '/' + x.p[1];

  const decQs = {
    dec1: () => [
      { ask: 'Game X costs $3. Roll a die: a 6 wins $12, a 4 or 5 wins $3, a 1, 2 or 3 wins nothing. What is the expected net for Game X (prize minus the $3 fee)?',
        items: seat([
          I(m2(0), true, `${ok('Right.')} The nets are +$9 (1/6), $0 (2/6) and −$3 (3/6). 9 × 1/6 + 0 × 2/6 + (−3) × 3/6 = 1.50 + 0 − 1.50 = $0.00. The game is <b>fair</b>: no average gain or loss.`),
          I('+$2.00', false, `${no('Not quite.')} (9 + 0 − 3) ÷ 3 = 2 is the plain average of the three nets. But losing $3 is much more likely (3/6) than winning $9 (1/6), so the nets need weights.`),
          I('+$3.00', false, `${no('Not quite.')} The expected payout is 12 × 1/6 + 3 × 2/6 = $3.00. You still have to subtract the $3 you paid, which leaves $0.00.`),
          I('+$9.00', false, `${no('Not quite.')} +$9 is the best case, and it happens only 1 time in 6.`)
        ], 1) },
      { ask: 'Game Y costs $3. Roll a die: an even number wins $5, an odd number wins nothing. What is the expected net for Game Y?',
        items: seat([
          I(m2(-0.5), true, `${ok('Right.')} The nets are +$2 (1/2) and −$3 (1/2). 2 × 1/2 + (−3) × 1/2 = 1.00 − 1.50 = −$0.50. This game is <b>unfavorable</b>: you lose 50 cents per play on average.`),
          I('+$2.50', false, `${no('Not quite.')} The expected payout is 5 × 1/2 = $2.50. You still have to subtract the $3 fee.`),
          I('+$2.00', false, `${no('Not quite.')} +$2 is what you gain when you win (win $5, minus $3). You lose $3 half the time, and that has to be included.`),
          I('−$3.00', false, `${no('Not quite.')} −$3 is what you lose when you lose. Half the time you win and come out +$2 instead.`)
        ], 3) },
      { ask: 'Game X has an expected net of $0.00 and Game Y has −$0.50. You can play one of them many times. What should you choose, and why?',
        items: seat([
          I('Game X. It is fair, while Y loses about 50 cents per play on average.', true, `${ok('Right.')} Compare the expected nets: $0.00 is greater than −$0.50. A <b>fair</b> game has expected net $0, a <b>favorable</b> game is above $0 and an <b>unfavorable</b> game is below $0. Over many plays, X breaks even and Y loses money.`),
          I('Game Y. You win half of the time, X only 1 time in 6 for the big prize.', false, `${no('Not quite.')} Winning more often is not the same as winning more. Y wins small amounts: its prize is only $5 for a $3 fee, so a win nets just +$2 while a loss costs $3.`),
          I('Game X. On your next play you will break even.', false, `${no('Not quite.')} Game X is better on average, but one play ends at +$9, $0 or −$3. Expected value is a long-run average, not a promise about the next play.`),
          I('Either one. Both cost $3, so they are the same.', false, `${no('Not quite.')} The price is the same, but the prizes and the chances are not. The expected nets, $0.00 and −$0.50, are different.`)
        ], 0) }
    ],
    dec2: () => [
      { ask: 'A tablet costs $120. A warranty costs $15 and covers any repair for free. What is the expected net for BUYING the warranty?',
        items: seat([
          I(m2(-15), true, `${ok('Right.')} You pay $15 no matter what happens, so the net is −$15 with probability 1. The expected value is −$15.00.`),
          I('$0.00', false, `${no('Not quite.')} The warranty covers the repair, but you paid $15 to get that cover. The $15 is spent whether or not the tablet breaks.`),
          I('−$135.00', false, `${no('Not quite.')} If you buy the warranty, a repair is free. You do not pay the $120 as well as the $15.`),
          I('−$1.50', false, `${no('Not quite.')} 1/10 of $15 mixes up the two numbers. You pay the full $15 for sure.`)
        ], 2) },
      { ask: 'Without the warranty, the tablet breaks this year with probability 1/10 and a repair costs $120. What is the expected net for SKIPPING the warranty?',
        items: seat([
          I(m2(-12), true, `${ok('Right.')} The nets are −$120 (1/10) and $0 (9/10). −120 × 1/10 + 0 × 9/10 = −$12.00. On average, skipping costs $12 a year.`),
          I('−$120.00', false, `${no('Not quite.')} −$120 is the worst case, and it happens only 1 time in 10.`),
          I('−$60.00', false, `${no('Not quite.')} −$60 is the plain average of −$120 and $0. But breaking is rare, so $0 should count 9 times as much as −$120.`),
          I('−$108.00', false, `${no('Not quite.')} 9/10 of $120 is $108, but 9/10 is the chance of NOT breaking, when you pay $0. The −$120 goes with 1/10.`)
        ], 1) },
      { ask: 'Buying has an expected net of −$15.00 and skipping has −$12.00. What does expected value tell you, and does it settle the choice?',
        items: seat([
          I('Skipping is $3 better on average. But a break costs $120 at once, so some people pay for certainty.', true, `${ok('Right.')} −$12 is greater than −$15, so on average skipping costs $3 less. That is how insurance works: the company expects to take in more than it pays out. Expected value is a long-run average, so it does not tell you whether you can afford one bad year. Many people pay a little extra to avoid a $120 surprise.`),
          I('Buy it. 15 is more than 12, so the warranty is worth more.', false, `${no('Not quite.')} Both numbers are costs, so smaller is better. −$12 is higher than −$15 on the number line.`),
          I('Skip it. It is certain that you will pay nothing.', false, `${no('Not quite.')} The tablet breaks 1 time in 10, and then you pay $120. Expected value is not a promise.`),
          I('It does not matter. The warranty and the repair are equal.', false, `${no('Not quite.')} −$15.00 and −$12.00 are different. They are close, but they are not equal.`)
        ], 3) }
    ],
    dec3: () => [
      { ask: 'Spinner P costs $2 and has 3 equal sectors. One sector pays $9 and two pay $0. What is the expected net for P?',
        items: seat([
          I(m2(1), true, `${ok('Right.')} The nets are +$7 (1/3) and −$2 (2/3). 7 × 1/3 + (−2) × 2/3 = 7/3 − 4/3 = $1.00. This game is <b>favorable</b> to the player.`),
          I('+$2.50', false, `${no('Not quite.')} (7 + (−2)) ÷ 2 = 2.50 is the plain average of the two nets. But losing is twice as likely as winning, so use the weights 1/3 and 2/3.`),
          I('+$3.00', false, `${no('Not quite.')} The expected payout is 9 × 1/3 = $3.00. You still have to subtract the $2 fee.`),
          I('+$7.00', false, `${no('Not quite.')} +$7 is the best case, and it happens only 1 time in 3.`)
        ], 0) },
      { ask: 'Spinner Q costs $2 and has 5 equal sectors. One sector pays $10 and four pay $0. What is the expected net for Q?',
        items: seat([
          I(m2(0), true, `${ok('Right.')} The nets are +$8 (1/5) and −$2 (4/5). 8 × 1/5 + (−2) × 4/5 = 8/5 − 8/5 = $0.00. This game is <b>fair</b>.`),
          I('+$3.00', false, `${no('Not quite.')} (8 + (−2)) ÷ 2 = 3 is the plain average of the two nets. A loss is four times as likely as a win, so use the weights 1/5 and 4/5.`),
          I('+$2.00', false, `${no('Not quite.')} The expected payout is 10 × 1/5 = $2.00. You still have to subtract the $2 fee.`),
          I('+$8.00', false, `${no('Not quite.')} +$8 is the best case, and it happens only 1 time in 5.`)
        ], 3) },
      { ask: 'P has an expected net of +$1.00 and Q has $0.00. Which should you pick for many plays, and what does it tell you?',
        items: seat([
          I('P. It is favorable (+$1.00 per play on average). Q is only fair.', true, `${ok('Right.')} +$1.00 is greater than $0.00. P is <b>favorable</b>: over many plays you expect to gain about $1 per play. Q is <b>fair</b>: you expect to break even. (A favorable game for the player is rare. Real games are made so the player's expected net is below $0.)`),
          I('Q. Its prize is bigger ($10 against $9).', false, `${no('Not quite.')} A bigger prize is not enough. It is a bigger prize that is much less likely (1/5 against 1/3). Only the expected net compares the games fairly.`),
          I('P. On the next spin you will win $1.', false, `${no('Not quite.')} One spin of P ends at +$7 or −$2, never +$1. Expected value is a long-run average.`),
          I('Neither. They both cost $2, so they are equal.', false, `${no('Not quite.')} The fee is the same, but the expected nets, +$1.00 and $0.00, are not.`)
        ], 2) }
    ]
  };

  /* ----- activity 3: experimental probabilities ----- */
  const SH = [
    { name: '2-point shot', pts: 2, a: [22, 40], b: [100, 200] },
    { name: '3-point shot', pts: 3, a: [18, 50], b: [100, 250] }
  ];
  const expQs = () => [
    { ask: 'In practice a player took 40 two-point shots and made 22. Use these results to estimate the probability of making a two-point shot.',
      items: seat([
        I('22/40 = 0.55', true, `${ok('Right.')} The estimate is made ÷ tries = 22 ÷ 40 = 0.55. This is an <b>experimental probability</b>: it comes from what happened, not from counting equal outcomes.`),
        I('18/40 = 0.45', false, `${no('Not quite.')} 18 is the number of MISSES (40 − 22). The probability of a make uses the makes: 22 ÷ 40.`),
        I('22/90 ≈ 0.24', false, `${no('Not quite.')} 90 adds the 50 three-point tries. The two-point probability only uses the two-point row: 22 out of 40.`)
      ], 1) },
    { ask: 'The same player took 50 three-point shots and made 18. Estimate the probability of making a three-point shot.',
      items: seat([
        I('18/50 = 0.36', true, `${ok('Right.')} 18 ÷ 50 = 0.36. A three-point shot goes in less often, about 36 times in 100.`),
        I('18/40 = 0.45', false, `${no('Not quite.')} 40 is the number of two-point tries. For the three-point shot you divide by its own 50 tries.`),
        I('32/50 = 0.64', false, `${no('Not quite.')} 32 is the number of misses. The probability of a make uses the 18 makes.`)
      ], 0) },
    { ask: 'A two-point make is worth 2 points. Using the estimate 0.55, how many points does a two-point shot earn per attempt, on average?',
      items: seat([
        I('2 × 0.55 = 1.10', true, `${ok('Right.')} The shot is worth 2 points with probability 0.55 and 0 points with probability 0.45. Expected points = 2 × 0.55 + 0 × 0.45 = 1.10 points per attempt.`),
        I('0.55', false, `${no('Not quite.')} 0.55 is the probability of a make. A make is worth 2 points, so multiply: 2 × 0.55.`),
        I('2.00', false, `${no('Not quite.')} 2 points is what a make is worth. But the shot only goes in 55 times out of 100, so the average per attempt is smaller.`),
        I('0.90', false, `${no('Not quite.')} 2 × 0.45 uses the probability of a MISS. Points come from makes: 2 × 0.55.`)
      ], 2) },
    { ask: 'A three-point make is worth 3 points. Using the estimate 0.36, how many points does a three-point shot earn per attempt?',
      items: seat([
        I('3 × 0.36 = 1.08', true, `${ok('Right.')} Expected points = 3 × 0.36 + 0 × 0.64 = 1.08 points per attempt.`),
        I('0.36', false, `${no('Not quite.')} 0.36 is the probability of a make. Multiply by the 3 points a make is worth.`),
        I('3.00', false, `${no('Not quite.')} 3 points is the value of a make. The shot goes in only 36 times out of 100.`),
        I('1.35', false, `${no('Not quite.')} 3 × 0.45 uses the two-point shot's probability. The three-point estimate is 0.36.`)
      ], 3) },
    { ask: 'Compare 1.10 points per attempt (two-point) with 1.08 (three-point). Which shot is worth more per attempt, using these results?',
      items: seat([
        I('The two-point shot, but only by 0.02 points. That is a very small gap.', true, `${ok('Right.')} 1.10 is greater than 1.08, so by these numbers the two-point shot earns more per attempt. Over 50 attempts the gap is about 1 point. With only 40 and 50 attempts the estimates could easily be off, so be careful with a decision this close. The next question gives more data.`),
        I('The three-point shot, because each make is worth 3 points.', false, `${no('Not quite.')} A make is worth more, but the shot goes in less often. You need both: 3 × 0.36 = 1.08, which is less than 1.10.`),
        I('The two-point shot, because it goes in more often (0.55 against 0.36).', false, `${no('Not quite.')} How often it goes in is only half of the story. The decision uses points per attempt, which also counts what a make is worth. (Here it happens to agree, but 0.55 against 0.36 is the wrong comparison.)`),
        I('They are exactly equal.', false, `${no('Not quite.')} 1.10 and 1.08 are close, but not equal.`)
      ], 0) },
    { ask: 'Now the season is over. The same player took 200 two-point shots and made 100, and took 250 three-point shots and made 100. What is the three-point shot worth per attempt now?',
      items: seat([
        I('3 × 100/250 = 3 × 0.40 = 1.20', true, `${ok('Right.')} The new estimate is 100 ÷ 250 = 0.40, so 3 × 0.40 = 1.20 points per attempt. The two-point shot is now 100 ÷ 200 = 0.50, so 2 × 0.50 = 1.00.`),
        I('3 × 0.36 = 1.08', false, `${no('Not quite.')} 0.36 came from the first 50 attempts. Use all 250: 100 ÷ 250 = 0.40.`),
        I('0.40', false, `${no('Not quite.')} 0.40 is the probability. Multiply by the 3 points a make is worth.`),
        I('3 × 100/200 = 1.50', false, `${no('Not quite.')} 200 is the two-point tries. The three-point row has 250 tries.`)
      ], 1) },
    { ask: 'With the full season, 3-point is 1.20 and 2-point is 1.00 points per attempt. Which shot is better now, and why did the answer change?',
      items: seat([
        I('The three-point shot. The early results were only 40 and 50 attempts, a small sample.', true, `${ok('Right.')} 1.20 is greater than 1.00. More attempts give a better estimate of the true probability, just like the running average settling down in the repeated-trials lesson. An experimental probability is an estimate, and the decision should rest on as much data as you have.`),
        I('The two-point shot. It was better before and the probabilities do not change.', false, `${no('Not quite.')} The probabilities are estimates and the estimates changed (0.55 became 0.50 and 0.36 became 0.40) once there was more data.`),
        I('The two-point shot, because it goes in more often (0.50 against 0.40).', false, `${no('Not quite.')} It does go in more often, but a three-point make is worth more. Compare points per attempt: 1.20 against 1.00.`),
        I('Neither. Experimental probabilities are useless.', false, `${no('Not quite.')} They are the best information you have when the probabilities are not known in advance. They just get better with more trials.`)
      ], 3) }
  ];

  /* ----- activity 4: optimize ----- */
  const FSEC = 5, FFEE = 2;                               /* fair game: 5 equal sectors, one pays the prize, fee $2 */
  const fairEV = prize => prize / FSEC - FFEE;
  const plays = pr => 300 - 60 * pr;
  const perPlay = pr => pr - 1.25;
  const total = pr => r2(plays(pr) * perPlay(pr));
  const pA = n => 1 - Math.pow(.9, n), pB = n => 1 - Math.pow(.5, n);

  const fairQs = () => [
    { ask: `A spinner has 5 equal sectors. A spin costs $2. One sector pays the prize you set with the slider and the other four pay $0. Set the prize so the game is <b>fair</b>, then press the button.`,
      check: st => {
        const pr = Math.round(st.prize), e = fairEV(pr);
        if (Math.abs(e) < 1e-9) return { right: true, text: `${ok('Right.')} Expected payout = prize × 1/5 = $10 × 1/5 = $2.00. That equals the $2 fee, so the expected net is $0.00. To make a game fair, the expected payout has to equal the fee. Set the prize to $10, press Play 1,000 and watch the average net settle near $0.` };
        return { right: false, text: `${no('Not quite.')} At ${m(pr)} the expected payout is ${m(pr)} × 1/5 = ${m2(pr / FSEC)}, and the fee is $2.00, so the expected net is ${m2(e)} (${kind(e)}). ` + (e < 0 ? 'The prize is too small: the player gets back less than the fee on average. Raise it.' : 'The prize is too big: the player gets back more than the fee on average. Lower it.') };
      } },
    { ask: 'The host wants to keep 40 cents per spin on average, so the player\'s expected net should be −$0.40. Set the prize to match, then press the button.',
      check: st => {
        const pr = Math.round(st.prize), e = fairEV(pr);
        if (Math.abs(e + 0.4) < 1e-9) return { right: true, text: `${ok('Right.')} The expected payout must be $2.00 − $0.40 = $1.60. Then prize × 1/5 = $1.60, so the prize is 5 × $1.60 = $8. Check: $8 × 1/5 = $1.60, and $1.60 − $2.00 = −$0.40.` };
        return { right: false, text: `${no('Not quite.')} At ${m(pr)} the expected net for the player is ${m(pr)} × 1/5 − $2 = ${m2(e)}, not −$0.40. ` + (e > -0.4 ? 'The player does too well. Lower the prize.' : 'The player does too badly. Raise the prize.') +
          ' Work backwards: the expected payout should be $2.00 − $0.40.' };
      } },
    { ask: 'Set the prize to $10, so the game is fair, and press Play 10 a few times. A player spins 10 times. Which statement is correct?',
      items: seat([
        I('The net could be well above or well below $0. Zero is only the long-run average per spin.', true, `${ok('Right.')} In 10 spins the player wins 0, 1, 2 or more times, so the net can be far from $0 (for example −$10 after one win, +$10 after three wins, or −$18 after none). Expected value tells you the average result per spin over a very large number of spins, not what 10 spins will do.`),
        I('The net is exactly $0.', false, `${no('Not quite.')} Fair means the AVERAGE per spin is $0 in the long run. A few spins can end far from $0.`),
        I('The player will lose, because the host always wins.', false, `${no('Not quite.')} In a fair game the host has no advantage on average. Over a few spins either side can come out ahead.`)
      ], 0) }
  ];
  const profitQs = () => [
    { ask: 'A host runs a spinner game at a fair. A player wins $5 with probability 1/4, otherwise $0. The expected payout is $1.25 per play. The number of plays falls as the price rises: plays = 300 − 60 × price. Set the price (in 50-cent steps) that gives the largest total expected profit, then press the button.',
      check: st => {
        const pr = st.price, t = total(pr), best = total(3);
        if (Math.abs(pr - 3) < 1e-9) return { right: true, text: `${ok('Right.')} At $3.00 there are 300 − 180 = 120 plays and the expected profit per play is $3.00 − $1.25 = $1.75, so the total is 120 × $1.75 = ${m2(best)}. One step lower ($2.50) gives 150 × $1.25 = ${m2(total(2.5))} and one step higher ($3.50) gives 90 × $2.25 = ${m2(total(3.5))}. Both are smaller.` };
        const up = total(pr + .5) > t || pr >= 5;
        return { right: false, text: `${no('Not quite.')} At ${m2(pr)} the total expected profit is ${plays(pr)} plays × ${m2(perPlay(pr))} = ${m2(t)}. ` + (pr + .5 <= 5 && total(pr + .5) > t ? `One step higher the total is ${m2(total(pr + .5))}, which is more. Try a higher price.` : `One step lower the total is ${m2(total(pr - .5))}, which is more. Try a lower price.`) };
      } },
    { ask: 'Moving the price from $3.00 to $4.00 raises the expected profit PER PLAY from $1.75 to $2.75. But the total expected profit falls from $210 to $165. Why?',
      items: seat([
        I('Plays drop from 120 to 60. That loses more than the extra $1.00 per play gains.', true, `${ok('Right.')} Total expected profit = plays × expected profit per play. At $3: 120 × $1.75 = $210. At $4: 60 × $2.75 = $165. Plays halved, but the profit per play grew by less than double (it went up by a factor of about 1.57). Maximizing the expected profit means balancing the two.`),
        I('The expected profit per play at $4 must be wrong.', false, `${no('Not quite.')} $4.00 − $1.25 = $2.75 is correct. The total drops for a different reason: fewer people play.`),
        I('More plays always means more profit, so the lowest price is best.', false, `${no('Not quite.')} At $1.00 there are 240 plays, but the host loses $0.25 on each: 240 × (−$0.25) = −$60. Plays only help when each play earns something.`),
        I('At $4 the game becomes fair, so no profit is expected.', false, `${no('Not quite.')} The game would be fair for the host at $1.25, where price equals the expected payout. At $4 the host still expects $2.75 per play.`)
      ], 1) }
  ];
  const chanceQs = () => [
    { ask: 'Game A (blue): each free ticket has a 1 in 10 chance to win $30. Game B (violet): each free ticket has a 1 in 2 chance to win $4. You have 3 tickets for one game. Which game has the higher expected winnings?',
      items: seat([
        I('Game A: $9.00 against $6.00', true, `${ok('Right.')} A: each ticket is worth $30 × 1/10 = $3.00, so 3 tickets are worth $9.00. B: each ticket is worth $4 × 1/2 = $2.00, so 3 tickets are worth $6.00. Expected value adds up: n tickets are worth n times one ticket.`),
        I('Game B: it wins half of the time', false, `${no('Not quite.')} Winning more often does not mean winning more money. B wins often but small: $4 × 1/2 = $2.00 per ticket, less than A's $3.00.`),
        I('They are equal', false, `${no('Not quite.')} $3.00 and $2.00 per ticket are different.`)
      ], 2) },
    { ask: 'You must win at least once to earn a ride home. With 3 tickets, which game gives the highest probability of at least one win?',
      items: seat([
        I('Game B: 87.5% against 27.1%', true, `${ok('Right.')} The only way to get no win is to lose every ticket. B: (1/2)³ = 0.125, so at least one win is 1 − 0.125 = 87.5%. A: (9/10)³ = 0.729, so at least one win is 1 − 0.729 = 27.1%. Game A has the higher expected winnings, but B has the higher chance of winning at all. The best choice depends on the goal.`),
        I('Game A, because its expected winnings are higher', false, `${no('Not quite.')} The highest expected value and the highest chance of at least one win can point to different games. A wins big but only 1 time in 10 per ticket, so 3 tickets give only 27.1%.`),
        I('Game A, because the prize is bigger', false, `${no('Not quite.')} The size of the prize does not change the chance of winning. For at least one win, only the chances count.`),
        I('They are the same, because 3 tickets each', false, `${no('Not quite.')} Same number of tickets, but different chances per ticket (1/10 against 1/2).`)
      ], 0) },
    { ask: 'You must pick Game A. Use the slider for the number of tickets. What is the smallest number of tickets that gives at least a 50% chance of at least one win, then press the button.',
      check: st => {
        const n = Math.round(st.n);
        if (n === 7) return { right: true, text: `${ok('Right.')} With 7 tickets the chance of at least one win is 1 − 0.9⁷ = ${pc1(pA(7))}. With 6 tickets it is 1 − 0.9⁶ = ${pc1(pA(6))}, which is just under 50%. So 7 is the smallest number that works.` };
        return { right: false, text: n < 7
          ? `${no('Not quite.')} With ${n} ticket${n === 1 ? '' : 's'} the chance is 1 − 0.9^${n} = ${pc1(pA(n))}, which is below 50%. Use more tickets.`
          : `${no('Not quite.')} With ${n} tickets the chance is ${pc1(pA(n))}. That is over 50%, but it is not the smallest number. Check one fewer ticket.` };
      } }
  ];
  const QS = {
    build: buildQs(), dec1: decQs.dec1(), dec2: decQs.dec2(), dec3: decQs.dec3(), exp: expQs(),
    fair: fairQs(), profit: profitQs(), chance: chanceQs()
  };

  /* ---------- drawing helpers ---------- */
  const FONT = '"Hanken Grotesk","Helvetica Neue",Arial,sans-serif';
  const T = (c, p, s, x, y, o = {}) => {
    c.font = `${o.weight || 600} ${o.size || 13}px ${FONT}`; c.textAlign = o.align || 'left'; c.textBaseline = 'middle';
    if (o.halo) { c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(s, x, y); }
    c.fillStyle = o.color || p.pal.text; c.fillText(s, x, y);
  };
  const mw = (c, s, size, wt = 600) => { c.font = `${wt} ${size}px ${FONT}`; return c.measureText(s).width; };
  const ln = (c, x0, y0, x1, y1, col, w = 1.5, dash) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.strokeStyle = col; c.lineWidth = w; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]); };
  const box = (c, x, y, w, hh, fill, stroke, lw = 1.6, dash) => {
    if (fill) { c.fillStyle = fill; c.fillRect(x, y, w, hh); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.setLineDash(dash || []); c.strokeRect(x, y, w, hh); c.setLineDash([]); }
  };
  const prizeCol = (pal, v) => v === 0 ? pal.muted : v === 2 ? pal.blue : v === 6 ? pal.yellow : pal.violet;
  const fracText = (a, b) => a + '/' + b;

  /* a wheel of equal sectors: prizes is a list of dollars, one per sector, colored by colFn */
  const wheel = (c, p, cx, cy, R, prizes, colFn, hi, fs) => {
    const pal = p.pal, N = prizes.length, da = Math.PI * 2 / N;
    prizes.forEach((v, i) => {
      const a0 = -Math.PI / 2 + i * da - da / 2, a1 = a0 + da;
      c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R, a0, a1); c.closePath();
      c.fillStyle = alpha(colFn(pal, v), v === 0 ? .25 : .55); c.fill();
      c.strokeStyle = pal.stage; c.lineWidth = 2; c.stroke();
    });
    if (hi != null && hi >= 0) {
      const a0 = -Math.PI / 2 + hi * da - da / 2;
      c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R, a0, a0 + da); c.closePath(); c.strokeStyle = pal.text; c.lineWidth = 3; c.stroke();
    }
    prizes.forEach((v, i) => {
      const a = -Math.PI / 2 + i * da;
      T(c, p, '$' + v, cx + Math.cos(a) * R * .66, cy + Math.sin(a) * R * .66, { size: clamp(R * .24, 9, 13), align: 'center', weight: 700 });
    });
    c.beginPath(); c.arc(cx, cy, 3.5, 0, Math.PI * 2); c.fillStyle = pal.text; c.fill();
    c.beginPath(); c.moveTo(cx, cy - R - 1); c.lineTo(cx - 6, cy - R - 11); c.lineTo(cx + 6, cy - R - 11); c.closePath(); c.fillStyle = pal.brass; c.fill();
  };

  /* ---------- the simulator (many plays of one game) ---------- */
  const mkSim = () => ({ n: 0, sum: 0, avg: [], last: null, idx: -1, lo: null, hi: null });
  const simRun = (S, outs, k) => {
    for (let i = 0; i < k; i++) {
      let u = Math.random(), j = 0;
      for (; j < outs.length - 1; j++) { u -= outs[j].p; if (u < 0) break; }
      const net = outs[j].net;
      S.n++; S.sum += net; S.avg.push(S.sum / S.n); S.last = net; S.idx = j;
      S.lo = S.lo === null ? net : Math.min(S.lo, net); S.hi = S.hi === null ? net : Math.max(S.hi, net);
    }
  };
  const drawSim = (c, p, g, S, o) => {
    const pal = p.pal, fs = g.fs, x0 = g.x0 + 36, x1 = g.x1 - 8, top = o.top, bot = o.bot;
    const Y = v => bot - (clamp(v, o.ylo, o.yhi) - o.ylo) / (o.yhi - o.ylo) * (bot - top);
    const nmax = S.n <= 10 ? 10 : S.n <= 100 ? 100 : S.n <= 1000 ? 1000 : S.n <= 10000 ? 10000 : 100000, L = Math.log10(nmax);
    const X = n => x0 + Math.log10(Math.max(n, 1)) / L * (x1 - x0);
    T(c, p, o.title, g.x0, top - 14, { size: fs - 1, color: pal.muted, weight: 700 });
    for (let v = o.ylo; v <= o.yhi + 1e-9; v += o.ystep) {
      ln(c, x0, Y(v), x1, Y(v), Math.abs(v) < 1e-9 ? pal['grid-strong'] : pal.grid, Math.abs(v) < 1e-9 ? 2 : 1.2);
      T(c, p, (v < 0 ? MINUS : '') + '$' + Math.abs(v), x0 - 6, Y(v), { size: fs - 2, align: 'right', color: pal.muted });
    }
    for (let e = 0; e <= L + .001; e++) {
      ln(c, X(Math.pow(10, e)), top, X(Math.pow(10, e)), bot, pal.grid, 1.2);
      T(c, p, grp(String(Math.pow(10, e))), clamp(X(Math.pow(10, e)), x0 + 4, x1 - 8), bot + 12, { size: fs - 2, align: 'center', color: pal.muted });
    }
    T(c, p, 'number of plays (log scale)', x1, bot + 27, { size: fs - 2, align: 'right', color: pal.muted });
    c.save(); c.beginPath(); c.rect(x0 - 1, top - 3, x1 - x0 + 10, bot - top + 6); c.clip();
    if (o.ev != null) {
      ln(c, x0, Y(o.ev), x1, Y(o.ev), pal.text, 2, [7, 5]);
    }
    if (S.n) {
      const stride = Math.max(1, Math.floor(S.n / 600)), pts = [];
      for (let i = 1; i <= S.n; i += stride) pts.push([X(i), Y(S.avg[i - 1])]);
      pts.push([X(S.n), Y(S.avg[S.n - 1])]);
      c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.strokeStyle = pal.blue; c.lineWidth = 3; c.lineJoin = 'round'; c.stroke();
      c.beginPath(); c.arc(X(S.n), Y(S.avg[S.n - 1]), 5.5, 0, Math.PI * 2); c.fillStyle = pal.blue; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 2; c.stroke();
    }
    c.restore();
    if (o.ev != null) T(c, p, 'expected ' + m2(o.ev), x1 - 2, Y(o.ev) + (o.evBelow ? 11 : -10), { size: fs - 1, align: 'right', weight: 700, halo: true });
    if (!S.n) T(c, p, 'Press Play to start', (x0 + x1) / 2, top + (bot - top) * .22, { size: fs, align: 'center', color: pal.muted });
  };

  /* ---------- the lesson ---------- */
  register({
    id: 'expected-value', level: 'school',
    title: 'Expected value',
    blurb: 'Find the long-run average of a game of chance, then use it to decide which option is better.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 5; p.cy = 2.6; p.span = 4;
      p.grid(1, { axes: false });
      p.path([[0, 0], [10, 0]], { stroke: pal['grid-strong'], width: 1.5 });
      const bars = [[1, .0, pal.muted], [3, 1.0, pal.blue], [5, 1.5, pal.yellow], [7, 2.5, pal.violet]];
      bars.forEach(([x, hgt, col]) => p.path([[x - .8, 0], [x + .8, 0], [x + .8, Math.max(hgt, .06)], [x - .8, Math.max(hgt, .06)]], { fill: alpha(col, .6), stroke: col, width: 2, close: true }));
      p.path([[0, 2.2], [10, 2.2]], { stroke: pal.text, width: 2, dash: [6, 5] });
      p.dot(9.1, 2.2, 5, pal.stage, pal.text, 2);
    },
    hook: 'A spinner game costs $3 to play, and most spins win nothing. How can you tell, before you play, whether it is a good deal?',
    steps: [
      { title: 'Build the expected value',
        text: String.raw`<p>This spinner game costs $3 a spin. The spinner has 8 equal sectors that pay $0, $2, $6 or $10.</p><p>Answer each question in the side panel. Each answer fills in one bar: the probability times the prize. Add the bars to get the <b>expected value</b>, then subtract the fee. Use the Play buttons to run the game many times.</p>`,
        set: { act: 'build' } },
      { title: 'Decide between two options',
        text: String.raw`<p>Compare Game X and Game Y: find each expected net, then place them on the number line. A game with expected net $0 is <b>fair</b>, above $0 is <b>favorable</b> and below $0 is <b>unfavorable</b>.</p><p>The menu has two more decisions: a warranty and two spinners.</p>`,
        set: { act: 'dec1' } },
      { title: 'Use results from data',
        text: String.raw`<p>Sometimes nobody knows the probabilities, but you have records. Estimate each probability as <i>made</i> divided by <i>tries</i>, then find the points per attempt.</p><p>Two shots, two sets of results: which shot earns more? Watch what happens when more data arrives.</p>`,
        set: { act: 'exp' } },
      { title: 'Choose the number you need',
        text: String.raw`<p>You can also pick a quantity to reach a goal. Here the prize is $6, so the expected payout is $6 × 1/5 = $1.20. With a $2 fee the expected net is −$0.80 per spin.</p><p>Move the prize to make the game fair. The menu also has a price to maximize profit and a number of tickets to maximize your chance of winning.</p>`,
        set: { act: 'fair', prize: 6 } }
    ],
    formal: String.raw`
      <p>A chance event has several possible results with numbers attached to them (prizes, profits, points). The <em>expected value</em> is the average of those numbers when each result is weighted by its probability. If the results are \(x_1, x_2, \dots, x_n\) with probabilities \(p_1, p_2, \dots, p_n\) (which add to 1), then
      \[ E = x_1p_1 + x_2p_2 + \cdots + x_np_n. \]
      It is a <b>weighted average</b>. The spinner in the lesson pays $0 with probability \(\tfrac12\), $2 with \(\tfrac14\), $6 with \(\tfrac18\) and $10 with \(\tfrac18\):
      \[ E = 0\cdot\tfrac12 + 2\cdot\tfrac14 + 6\cdot\tfrac18 + 10\cdot\tfrac18 = 0 + 0.50 + 0.75 + 1.25 = \$2.50. \]</p>
      <h3>What it means (and what it does not)</h3>
      <p>If you play many times, the average result per play settles near the expected value. That is the law of large numbers from the repeated-trials lesson. It does <em>not</em> say what one play will do. The spinner never pays $2.50 on a single spin: each spin pays $0, $2, $6 or $10. Expected value is a long-run average, not a promise.</p>
      <h3>Net gain and fair games</h3>
      <p>If playing costs a fee \(c\), the <em>net</em> gain is the payout minus \(c\), and its expected value is \(E_{\text{net}} = E_{\text{payout}} - c\). For the spinner, \(\$2.50 - \$3 = -\$0.50\). A game is
      </p>
      <ul>
        <li><b>fair</b> if \(E_{\text{net}} = 0\),</li>
        <li><b>favorable</b> to the player if \(E_{\text{net}}\) is greater than 0,</li>
        <li><b>unfavorable</b> to the player if \(E_{\text{net}}\) is less than 0.</li>
      </ul>
      <p>Games sold to the public (raffles, lotteries, arcades) are unfavorable to the player, which is how the seller makes money. Insurance and warranties are also unfavorable on average. People buy them because one very bad result costs far more than the small fee. So expected value helps you decide, but it is not the only thing to weigh.</p>
      <h3>Deciding with expected values</h3>
      <p>To compare two options, find the expected value of each (with the same meaning, such as net gain in dollars) and compare the numbers. With a warranty, \(-\$15\) for sure compares with \(-120\cdot\tfrac1{10} + 0\cdot\tfrac9{10} = -\$12\). The larger number is the better one on average, and \(-12\) is larger than \(-15\).</p>
      <h3>Experimental probability</h3>
      <p>When probabilities are not known in advance, use records. The experimental probability is
      \[ P(\text{make}) \approx \frac{\text{number of makes}}{\text{number of tries}}. \]
      In the lesson, 18 makes in 50 three-point tries gives \(0.36\), so \(3\cdot 0.36 = 1.08\) points per attempt. Experimental probabilities are estimates. With 250 tries and 100 makes the estimate is \(0.40\) and the value is \(1.20\). More data gives a better estimate, so decisions that rest on small samples can change.</p>
      <h3>Getting a desired outcome</h3>
      <p><b>Choosing a value.</b> To make a spinner with a win probability \(\tfrac15\) and a fee of $2 fair, set the expected payout equal to the fee: \(\tfrac15\cdot\text{prize} = 2\), so the prize is $10. To make the player's expected net \(-\$0.40\), the expected payout must be $1.60, so the prize is $8.</p>
      <p><b>Maximizing a value.</b> A host's total expected profit is (number of plays) \(\times\) (expected profit per play). If raising the price \(x\) lowers the plays to \(300-60x\) and a play pays out $1.25 on average, then
      \[ \text{total} = (300-60x)(x-1.25). \]
      A higher price raises the profit per play but loses players. The total is largest where the two effects balance (exactly at \(x = 3.125\), and $3.00 is the closest 50-cent price).</p>
      <p><b>Maximizing a probability.</b> A different goal can give a different answer. The chance of at least one success in \(n\) tries with success probability \(p\) is
      \[ 1-(1-p)^n. \]
      Game A (\(p=\tfrac1{10}\), prize $30) has expected value $3 per ticket, and Game B (\(p=\tfrac12\), prize $4) has $2 per ticket. So A is better for the expected winnings. But if you only need one win, B is better: with 3 tickets, \(1-(0.5)^3 = 87.5\%\) against \(1-(0.9)^3 \approx 27.1\%\). The option with the maximum expected value is not always the option with the maximum probability of success.</p>`,
    check: [
      { q: 'A game costs $2 to play. You roll a fair die. If you roll a 6, you win $9. If you roll anything else, you win nothing. What is the expected net gain per play (the average of what you win minus the $2 you pay)?',
        choices: ['+$1.50', '+$7.00', '−$0.50', '−$2.00'], answer: 2,
        why: String.raw`The expected payout is \(9\cdot\tfrac16 + 0\cdot\tfrac56 = \$1.50\). Subtract the \$2 fee: \(1.50-2 = -\$0.50\). Another way: the net is \(+7\) with probability \(\tfrac16\) and \(-2\) with probability \(\tfrac56\), and \(\tfrac76-\tfrac{10}6=-\tfrac12\). The answer \(+\$1.50\) forgets the fee, and \(+\$7\) is only the best case, not the average.`,
        hint: 'First find the expected payout (each prize times its probability), then subtract the fee.' },
      { q: 'In practice, a player made 22 of 40 two-point shots and 12 of 30 three-point shots. Use these results as probabilities. Which shot earns more points per attempt?',
        choices: ['The two-point shot, because it goes in more often (0.55 against 0.40)', 'The three-point shot: 3 × 0.40 = 1.20 points per attempt, against 2 × 0.55 = 1.10', 'The two-point shot: 2 × 0.55 = 1.20 points per attempt, against 3 × 0.40 = 1.10', 'They earn the same number of points per attempt'], answer: 1,
        why: String.raw`The probabilities are \(22/40=0.55\) and \(12/30=0.40\). Points per attempt: \(2\cdot0.55=1.10\) for the two-point shot and \(3\cdot0.40=1.20\) for the three-point shot. A shot that goes in less often can still earn more if each make is worth more. Swapping the two results (1.20 for the two-point shot) comes from mixing up which shot has which probability.`,
        hint: 'Estimate each probability as made divided by tries, then multiply by the points for a make.' }
    ],
    links: { prereq: ['probability-with-repeated-trials'], related: ['compound-events-and-tree-diagrams', 'sample-spaces-and-probability', 'percent-change-and-money', 'mean-median-and-spread'] },

    mount({ stage, controls: C }) {
      const P = new Plane(stage, { span: 5 });
      const prevMin = stage.style.minHeight;
      stage.style.minHeight = '600px';
      if (P.coordEl) P.coordEl.style.display = 'none';
      P.canvas.setAttribute('role', 'img');
      P.canvas.setAttribute('aria-label', 'A picture that changes with the activity: a spinner with bars of probability times prize, option strips on a number line, results from free throws, or bar charts for the prize, the price and the number of tickets.');
      const st = { act: 'build', prize: 6, price: 2, n: 3 };
      const PG = {}; ACTS.forEach(a => { PG[a.id] = { i: 0, tried: [], solved: false, fb: '' }; });
      const kOf = id => PG[id].i + (PG[id].solved ? 1 : 0);
      const simB = mkSim(), simF = mkSim();
      const visited = new Set([2]);
      let cancel = () => {}, lastPrize = st.prize;

      const spinOuts = () => SECT.map(v => ({ p: 1 / 8, net: v - FEE }));
      const fairOuts = () => Array.from({ length: FSEC }, (_, i) => ({ p: 1 / FSEC, net: (i === 0 ? st.prize : 0) - FFEE }));
      const FPRIZES = () => Array.from({ length: FSEC }, (_, i) => (i === 0 ? Math.round(st.prize) : 0));

      /* ---------- drawing: each activity ---------- */
      const drawBuild = (c, p, g) => {
        const pal = p.pal, fs = g.fs, k = kOf('build'), W = g.W, H = g.H;
        const R = clamp(Math.min(W * .12, H * .085), 30, 52), cxw = g.x0 + R + 4, cyw = 18 + R;
        wheel(c, p, cxw, cyw, R, SECT, prizeCol, simB.idx, fs);
        const tx = cxw + R + 20;
        T(c, p, 'Each spin costs ' + m(FEE), tx, cyw - 18, { size: fs + 1, weight: 700 });
        T(c, p, '8 equal sectors, one spin.', tx, cyw, { size: fs - 1, color: pal.muted });
        T(c, p, 'You win the prize you land on.', tx, cyw + 18, { size: fs - 1, color: pal.muted });
        const ty = cyw + R + 14, colA = clamp(W * .17, 52, 84), colB = clamp(W * .15, 48, 70), barX = g.x0 + colA + colB, barW = g.x1 - barX - 6;
        const rowH = clamp(H * .045, 21, 27), unit = barW / 3.3;
        T(c, p, 'Prize', g.x0, ty, { size: fs - 2, color: pal.muted });
        T(c, p, 'Chance', g.x0 + colA, ty, { size: fs - 2, color: pal.muted });
        T(c, p, 'Chance × prize', barX, ty, { size: fs - 2, color: pal.muted });
        ROWS.forEach((r, i) => {
          const y = ty + 14 + i * rowH + rowH / 2, done = k > i, col = prizeCol(pal, r.prize);
          box(c, g.x0, y - 6, 12, 12, alpha(col, r.prize === 0 ? .25 : .55), col, 1.4);
          T(c, p, m(r.prize), g.x0 + 18, y, { size: fs, weight: 700 });
          T(c, p, done ? r.f : '?', g.x0 + colA, y, { size: fs, weight: 700, color: done ? pal.text : pal.muted });
          if (done) {
            const w = contrib(r) * unit;
            box(c, barX, y - rowH * .32, Math.max(w, 2), rowH * .64, alpha(pal.yellow, .45), pal.yellow, 1.8);
            T(c, p, m2(contrib(r)), barX + Math.max(w, 2) + 6, y, { size: fs - 1, weight: 700 });
          } else {
            ln(c, barX, y, barX + 40, y, pal.muted, 1.4, [3, 4]);
          }
        });
        let y = ty + 14 + ROWS.length * rowH + 6;
        ln(c, g.x0, y, g.x1, y, pal['grid-strong'], 1.4);
        y += rowH * .7;
        T(c, p, k >= 5 ? 'Expected payout: sum of the bars' : 'Expected payout: ?', g.x0, y, { size: fs - 1, weight: 700, color: k >= 5 ? pal.text : pal.muted });
        y += rowH * .75;
        if (k >= 5) {
          box(c, g.x0, y - rowH * .32, EVPAY * unit + (barX - g.x0), rowH * .64, alpha(pal.blue, .35), pal.blue, 1.8);
          T(c, p, m2(EVPAY), g.x0 + EVPAY * unit + (barX - g.x0) + 6, y, { size: fs - 1, weight: 700, color: pal.blue });
        } else ln(c, g.x0, y, g.x0 + 40, y, pal.muted, 1.4, [3, 4]);
        y += rowH;
        T(c, p, 'Fee ' + m(FEE), g.x0, y, { size: fs - 1, weight: 700 });
        box(c, g.x0 + 0, y + rowH * .5 - 2, 0, 0);
        const fw = FEE * unit + (barX - g.x0);
        box(c, g.x0 + mw(c, 'Fee ' + m(FEE), fs - 1, 700) + 10, y - rowH * .28, Math.max(0, fw - mw(c, 'Fee ' + m(FEE), fs - 1, 700) - 10), rowH * .56, alpha(pal.red, .08), pal.red, 1.8, [5, 3]);
        y += rowH * .8;
        if (k >= 6) T(c, p, 'Expected net: ' + m2(EVPAY) + ' − ' + m(FEE) + ' = ' + m2(EVNET) + ' (unfavorable)', g.x0, y, { size: fs, weight: 700, color: pal.red });
        else T(c, p, 'Expected net: ?', g.x0, y, { size: fs, weight: 700, color: pal.muted });
        const top = y + 46, bot = H - 40;
        if (bot - top > 60) drawSim(c, p, g, simB, { top, bot, ylo: -4, yhi: 8, ystep: 4, ev: k >= 6 ? EVNET : null, title: 'Average net per spin so far (blue)', fs });
      };

      const drawDec = (c, p, g, id) => {
        const pal = p.pal, fs = g.fs, k = kOf(id), sc = DEC[id], W = g.W, H = g.H, sw = g.x1 - g.x0;
        let y = 10;
        T(c, p, sc.title, g.x0, y + 8, { size: fs + 2, weight: 700 }); y += 28;
        sc.opts.forEach((o, oi) => {
          T(c, p, o.name, g.x0, y + 7, { size: fs, weight: 700, color: oi ? pal.violet : pal.blue }); y += 20;
          let sx = g.x0;
          o.outs.forEach(x => {
            const w = x.p[0] / x.p[1] * sw, col = x.net > 0 ? pal.green : x.net < 0 ? pal.red : pal.muted;
            box(c, sx, y, w, 16, alpha(col, .5), pal.stage, 1.5); sx += w;
          });
          y += 16 + 10;
          o.outs.forEach(x => {
            const col = x.net > 0 ? pal.green : x.net < 0 ? pal.red : pal.muted;
            box(c, g.x0, y - 5, 10, 10, alpha(col, .5), col, 1.2);
            T(c, p, `${x.p[0] === x.p[1] ? 'Certain' : pf(x) + ' chance'}: ${x.t} (net ${sg(x.net)})`, g.x0 + 16, y, { size: fs - 1, color: pal.text });
            y += 17;
          });
          if (k > oi) {
            const e = evOf(o);
            T(c, p, `Expected net: ${m2(e)} (${kind(e)})`, g.x0, y + 4, { size: fs, weight: 700, color: e > 0 ? pal.green : e < 0 ? pal.red : pal.text });
          } else T(c, p, 'Expected net: ?', g.x0, y + 4, { size: fs, weight: 700, color: pal.muted });
          y += 30;
        });
        /* number line */
        const nl = Math.max(y + 44, Math.min(H - 70, y + 70)), X = v => g.x0 + 16 + (v - sc.lo) / (sc.hi - sc.lo) * (sw - 32);
        T(c, p, 'Expected net on a number line', g.x0, nl - 36, { size: fs - 1, color: pal.muted, weight: 700 });
        ln(c, X(sc.lo), nl, X(sc.hi), nl, pal['grid-strong'], 2.2);
        for (let v = sc.lo; v <= sc.hi + 1e-9; v += sc.step) {
          ln(c, X(v), nl - (v === 0 ? 8 : 5), X(v), nl + (v === 0 ? 8 : 5), v === 0 ? pal.text : pal.muted, v === 0 ? 2.4 : 1.4);
          T(c, p, (v < 0 ? MINUS : '') + '$' + Math.abs(v), X(v), nl + 20, { size: fs - 2, align: 'center', color: pal.muted });
        }
        T(c, p, 'fair', X(0), nl + 36, { size: fs - 1, align: 'center', weight: 700 });
        T(c, p, '← unfavorable', g.x0, nl + 54, { size: fs - 2, color: pal.red });
        T(c, p, 'favorable →', g.x1, nl + 54, { size: fs - 2, align: 'right', color: pal.green });
        sc.opts.forEach((o, oi) => {
          if (k <= oi) return;
          const e = evOf(o), col = oi ? pal.violet : pal.blue, win = k >= 3 && evOf(o) >= Math.max(...sc.opts.map(evOf)) - 1e-9;
          c.beginPath(); c.arc(X(e), nl, 9, 0, Math.PI * 2); c.fillStyle = col; c.fill(); c.strokeStyle = win ? pal.brass : pal.stage; c.lineWidth = win ? 3.5 : 2; c.stroke();
          T(c, p, o.short, X(e), nl + (oi ? -22 : -22) + (oi ? 0 : 0), { size: fs, align: 'center', weight: 700, color: col, halo: true });
        });
        if (k >= 3) T(c, p, 'Ring: the better option on average', (g.x0 + g.x1) / 2, nl + 78, { size: fs - 2, align: 'center', color: pal.brass, weight: 700 });
      };

      const drawExp = (c, p, g) => {
        const pal = p.pal, fs = g.fs, k = kOf('exp'), season = PG.exp.i >= 5, sw = g.x1 - g.x0, H = g.H;
        const flags = season ? { pa: k >= 6, pb: k >= 6, ea: k >= 6, eb: k >= 6, win: k >= 7 } : { pa: k >= 1, pb: k >= 2, ea: k >= 3, eb: k >= 4, win: k >= 5 };
        let y = 12;
        T(c, p, season ? 'Results for the whole season' : 'Results from practice', g.x0, y + 8, { size: fs + 2, weight: 700 }); y += 32;
        const probs = SH.map(s => { const [mk, tr] = season ? s.b : s.a; return mk / tr; });
        const evs = SH.map((s, i) => s.pts * probs[i]);
        SH.forEach((s, i) => {
          const [mk, tr] = season ? s.b : s.a, col = i ? pal.violet : pal.blue;
          T(c, p, `${s.name} (${s.pts} points per make)`, g.x0, y + 7, { size: fs, weight: 700, color: col });
          T(c, p, `made ${mk} of ${tr}`, g.x1, y + 7, { size: fs, align: 'right', weight: 700 });
          y += 20;
          const wm = mk / tr * sw;
          box(c, g.x0, y, wm, 20, alpha(pal.green, .5), pal.stage, 1.5);
          box(c, wm + g.x0, y, sw - wm, 20, alpha(pal.muted, .3), pal.stage, 1.5);
          if (wm > 50) T(c, p, 'makes', g.x0 + wm / 2, y + 10, { size: fs - 2, align: 'center' });
          if (sw - wm > 50) T(c, p, 'misses', g.x0 + wm + (sw - wm) / 2, y + 10, { size: fs - 2, align: 'center', color: pal.muted });
          y += 20 + 14;
          const fl = i ? flags.pb : flags.pa;
          T(c, p, fl ? `Estimated probability: ${mk}/${tr} = ${probs[i].toFixed(2)}` : 'Estimated probability: ?', g.x0, y, { size: fs, weight: 700, color: fl ? pal.text : pal.muted });
          y += 30;
        });
        T(c, p, 'Expected points per attempt', g.x0, y + 4, { size: fs - 1, color: pal.muted, weight: 700 }); y += 24;
        const unit = (sw - 120) / 1.6;
        SH.forEach((s, i) => {
          const fl = i ? flags.eb : flags.ea, col = i ? pal.violet : pal.blue, [mk, tr] = season ? s.b : s.a;
          const win = flags.win && evs[i] >= Math.max(...evs) - 1e-9;
          T(c, p, s.pts + '-point', g.x0, y + 11, { size: fs, weight: 700, color: col });
          if (fl) {
            const w = evs[i] * unit;
            box(c, g.x0 + 64, y + 1, w, 20, alpha(col, .4), win ? pal.brass : col, win ? 3 : 1.8);
            T(c, p, `${s.pts} × ${probs[i].toFixed(2)} = ${evs[i].toFixed(2)}`, g.x0 + 64 + w + 8, y + 11, { size: fs - 1, weight: 700 });
          } else ln(c, g.x0 + 64, y + 11, g.x0 + 104, y + 11, pal.muted, 1.4, [3, 4]);
          y += 30;
        });
        if (flags.win) T(c, p, 'Ring: more points per attempt', g.x0, y + 6, { size: fs - 2, color: pal.brass, weight: 700 });
        if (!season && flags.win) T(c, p, 'Only 40 and 50 attempts: a small sample', g.x0, y + 26, { size: fs - 2, color: pal.muted });
        if (season) T(c, p, '200 and 250 attempts: a much bigger sample', g.x0, y + 26, { size: fs - 2, color: pal.muted });
      };

      const drawFair = (c, p, g) => {
        const pal = p.pal, fs = g.fs, k = kOf('fair'), W = g.W, H = g.H, pr = st.prize, ev = pr / FSEC;
        const R = clamp(Math.min(W * .12, H * .085), 30, 52), cxw = g.x0 + R + 4, cyw = 18 + R;
        wheel(c, p, cxw, cyw, R, FPRIZES(), prizeCol, simF.idx, fs);
        const tx = cxw + R + 20;
        T(c, p, 'Each spin costs $2', tx, cyw - 18, { size: fs + 1, weight: 700 });
        T(c, p, '5 equal sectors, one spin.', tx, cyw, { size: fs - 1, color: pal.muted });
        T(c, p, 'One sector pays the prize.', tx, cyw + 18, { size: fs - 1, color: pal.muted });
        let y = cyw + R + 26;
        const unit = (g.x1 - g.x0 - 74) / 4.4, bx = g.x0;
        T(c, p, 'Expected payout = prize × 1/5 = ' + m2(ev), g.x0, y, { size: fs, weight: 700, color: pal.blue }); y += 22;
        box(c, bx, y - 9, Math.max(ev * unit, 1), 18, alpha(pal.blue, .4), pal.blue, 1.8);
        const fx = bx + FFEE * unit;
        ln(c, fx, y - 17, fx, y + 17, pal.red, 2.4, [5, 3]);
        T(c, p, 'fee $2.00', fx + 5, y + 17, { size: fs - 2, color: pal.red, weight: 700 });
        y += 38;
        const e = fairEV(pr), cl = e > 1e-9 ? pal.green : e < -1e-9 ? pal.red : pal.text;
        T(c, p, `Expected net for the player: ${m2(e)} (${kind(e)})`, g.x0, y, { size: fs, weight: 700, color: cl });
        const top = y + 50, bot = H - 40;
        if (bot - top > 60) drawSim(c, p, g, simF, { top, bot, ylo: -6, yhi: 6, ystep: 3, ev: e, evBelow: e < 0, title: 'Average net per spin so far (blue)', fs });
      };

      const drawProfit = (c, p, g) => {
        const pal = p.pal, fs = g.fs, H = g.H, sw = g.x1 - g.x0, pr = st.price;
        let y = 12;
        T(c, p, 'Total expected profit for the host', g.x0, y + 8, { size: fs + 2, weight: 700 }); y += 28;
        T(c, p, 'Try prices with the slider. Each one adds a bar.', g.x0, y + 4, { size: fs - 1, color: pal.muted }); y += 26;
        const top = y + 8, bot = H - 52, x0 = g.x0 + 40, x1 = g.x1, lo = -80, hi = 240;
        const Y = v => bot - (v - lo) / (hi - lo) * (bot - top);
        for (let v = 0; v <= hi; v += 80) { ln(c, x0, Y(v), x1, Y(v), v === 0 ? pal['grid-strong'] : pal.grid, v === 0 ? 2 : 1.2); T(c, p, '$' + v, x0 - 6, Y(v), { size: fs - 2, align: 'right', color: pal.muted }); }
        T(c, p, MINUS + '$80', x0 - 6, Y(-80), { size: fs - 2, align: 'right', color: pal.muted });
        ln(c, x0, Y(-80), x1, Y(-80), pal.grid, 1.2);
        const pitch = (x1 - x0) / 9, bw = pitch * .62;
        for (let i = 0; i < 9; i++) {
          const pz = 1 + i * .5, cx = x0 + pitch * (i + .5), cur = Math.abs(pz - pr) < 1e-6;
          T(c, p, '$' + (Number.isInteger(pz) ? pz : pz.toFixed(1)), cx, bot + 14, { size: fs - 2, align: 'center', color: cur ? pal.text : pal.muted, weight: cur ? 700 : 600 });
          if (!visited.has(pz)) continue;
          const v = total(pz), y0 = Y(0), y1 = Y(v);
          box(c, cx - bw / 2, Math.min(y0, y1), bw, Math.abs(y1 - y0), alpha(cur ? pal.yellow : pal.blue, cur ? .6 : .38), cur ? pal.yellow : pal.blue, 1.8);
          if (cur) T(c, p, m2(v), cx, v >= 0 ? y1 - 12 : y1 + 12, { size: fs - 1, align: 'center', weight: 700, halo: true });
        }
        T(c, p, 'ticket price', x1, bot + 32, { size: fs - 2, align: 'right', color: pal.muted });
      };

      const drawChance = (c, p, g) => {
        const pal = p.pal, fs = g.fs, H = g.H, sw = g.x1 - g.x0, n = Math.round(st.n);
        let y = 12;
        T(c, p, `With ${n} ticket${n === 1 ? '' : 's'}: expected winnings`, g.x0, y + 8, { size: fs + 2, weight: 700 }); y += 30;
        const unit = (sw - 170) / 30, ev = [3 * n, 2 * n];
        [['Game A', pal.blue], ['Game B', pal.violet]].forEach(([nm, col], i) => {
          T(c, p, nm, g.x0, y + 10, { size: fs, weight: 700, color: col });
          box(c, g.x0 + 70, y, ev[i] * unit, 20, alpha(col, .4), col, 1.8);
          T(c, p, m2(ev[i]), g.x0 + 70 + ev[i] * unit + 8, y + 10, { size: fs - 1, weight: 700 });
          y += 28;
        });
        y += 14;
        T(c, p, 'Chance of at least one win', g.x0, y + 4, { size: fs + 2, weight: 700 });
        const top = y + 26, bot = H - 52, x0 = g.x0 + 40, x1 = g.x1 - 8;
        const X = k => x0 + (k - 1) / 9 * (x1 - x0), Y = v => bot - v * (bot - top);
        for (const v of [0, .25, .5, .75, 1]) {
          ln(c, x0, Y(v), x1, Y(v), v === .5 ? pal.muted : pal.grid, v === .5 ? 1.6 : 1.2, v === .5 ? [6, 4] : null);
          T(c, p, Math.round(v * 100) + '%', x0 - 6, Y(v), { size: fs - 2, align: 'right', color: pal.muted });
        }
        for (let k = 1; k <= 10; k++) T(c, p, String(k), X(k), bot + 13, { size: fs - 2, align: 'center', color: k === n ? pal.text : pal.muted, weight: k === n ? 700 : 600 });
        T(c, p, 'tickets', x1, bot + 30, { size: fs - 2, align: 'right', color: pal.muted });
        [[pA, pal.blue], [pB, pal.violet]].forEach(([f, col], i) => {
          const pts = []; for (let k = 1; k <= 10; k++) pts.push([X(k), Y(f(k))]);
          c.beginPath(); pts.forEach(([x, yy], j) => j ? c.lineTo(x, yy) : c.moveTo(x, yy)); c.strokeStyle = col; c.lineWidth = 2.6; c.stroke();
          pts.forEach(([x, yy]) => { c.beginPath(); c.arc(x, yy, 3, 0, Math.PI * 2); c.fillStyle = col; c.fill(); });
          const cy = Y(f(n));
          c.beginPath(); c.arc(X(n), cy, 7, 0, Math.PI * 2); c.fillStyle = col; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 2.5; c.stroke();
          T(c, p, pc1(f(n)), X(n), cy + (i ? (f(n) > .8 ? 17 : -16) : 17), { size: fs - 1, align: 'center', weight: 700, color: col, halo: true });
        });
      };

      P.onDraw = (c, p) => {
        const W = P.w, H = P.h, fs = clamp(W * .034, 11.5, 15), x0 = clamp(W * .045, 20, 36);
        const g = { W, H, fs, x0, x1: W - x0 };
        const a = st.act;
        if (a === 'build') drawBuild(c, p, g);
        else if (a === 'exp') drawExp(c, p, g);
        else if (a === 'fair') drawFair(c, p, g);
        else if (a === 'profit') drawProfit(c, p, g);
        else if (a === 'chance') drawChance(c, p, g);
        else drawDec(c, p, g, a);
      };

      /* ---------- the side panel ---------- */
      const para = html => h('p', { style: 'margin:0 0 8px', html });
      const small = (label, fn, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: fn }, label);
      let qbox, ro, sel, host;
      const sections = {};     /* activity id -> the control elements shown only for it */

      const renderQ = () => {
        const a = st.act, pg = PG[a], qs = QS[a], kids = [];
        if (pg.i >= qs.length) {
          const idx = ACTS.findIndex(x => x.id === a), nx = ACTS[idx + 1];
          kids.push(para(`${ok('Activity done.')} ${a === 'chance' ? 'You have finished the lesson. Try the other activities again, or take the quick check below.' : 'Pick the next activity, or run this one again.'}`));
          const row = h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' });
          if (nx) row.append(small('Next activity', () => setAct(nx.id), true));
          row.append(small('Do this one again', () => { PG[a] = { i: 0, tried: [], solved: false, fb: '' }; if (a === 'build') Object.assign(simB, mkSim()); if (a === 'fair') Object.assign(simF, mkSim()); renderQ(); sync(); }));
          kids.push(row);
        } else {
          const q = qs[pg.i];
          kids.push(para(`<span class="k">Question ${pg.i + 1} of ${qs.length}</span><br>${q.ask}`));
          if (q.items) {
            const col = h('div', { style: 'display:flex;flex-direction:column;gap:6px;margin:6px 0' });
            q.items.forEach((it, j) => {
              const tried = pg.tried.includes(it.label), isRight = pg.solved && it.right;
              const b = h('button', { type: 'button', class: 'btn' + (isRight ? ' primary' : ''), style: 'justify-content:flex-start;text-align:left;border-radius:12px;width:100%;line-height:1.35;white-space:normal' + (tried ? ';opacity:.45;text-decoration:line-through' : ''), onclick: () => {
                if (pg.solved || tried) return;
                if (it.right) { pg.solved = true; } else pg.tried.push(it.label);
                pg.fb = it.why; renderQ(); sync();
              } }, it.label);
              if (pg.solved || tried) b.disabled = true;
              col.append(b);
            });
            kids.push(col);
          }
          if (q.check && !pg.solved) kids.push(h('div', { style: 'margin:0 0 8px' }, small('Check my setting', () => {
            const r = q.check(st); pg.fb = r.text; if (r.right) pg.solved = true; renderQ(); sync();
          }, true)));
          if (pg.fb) kids.push(h('p', { style: 'margin:6px 0 10px;padding-left:10px;border-left:3px solid var(--line-strong);', html: pg.fb }));
          if (pg.solved) kids.push(h('div', { style: 'display:flex;gap:8px' }, small(pg.i + 1 < qs.length ? 'Next question' : 'Finish', () => { pg.i++; pg.solved = false; pg.tried = []; pg.fb = ''; renderQ(); sync(); }, true)));
        }
        qbox.replaceChildren(...kids);
      };

      const upd = () => {
        const a = st.act, k = kOf(a);
        let t = '';
        if (a === 'build') {
          t = kk('Plays', grp(String(simB.n))) + ' &nbsp; ' + kk('Last spin net', simB.last === null ? '—' : sg(simB.last)) + '<br>' +
            kk('Average net so far', simB.n ? m2(simB.sum / simB.n) : '—') + (k >= 6 ? ' ' + kk('(expected ' + m2(EVNET) + ')', '') : '') + '<br>' +
            kk('Range of single spins', simB.n ? sg(simB.lo) + ' to ' + sg(simB.hi) : '—');
        } else if (a === 'fair') {
          const pr = Math.round(st.prize), e = fairEV(pr);
          t = kk('Prize', m(pr)) + ' &nbsp; ' + kk('Fee', '$2') + '<br>' + kk('Expected payout', `${m(pr)} × 1/5 = ${m2(pr / FSEC)}`) + '<br>' +
            kk('Expected net', m2(e) + ' (' + kind(e) + ')') + '<br>' + kk('Plays', grp(String(simF.n))) + ' &nbsp; ' + kk('Average net', simF.n ? m2(simF.sum / simF.n) : '—');
        } else if (a === 'profit') {
          const pr = st.price;
          t = kk('Price', m2(pr)) + '<br>' + kk('Plays', `300 − 60 × ${pr.toFixed(2)} = ${plays(pr)}`) + '<br>' +
            kk('Expected profit per play', `${m2(pr)} − $1.25 = ${m2(perPlay(pr))}`) + '<br>' + kk('Total expected profit', `${plays(pr)} × ${neg(perPlay(pr)) ? '(' + m2(perPlay(pr)) + ')' : m2(perPlay(pr))} = ${m2(total(pr))}`);
        } else if (a === 'chance') {
          const n = Math.round(st.n);
          t = kk('Tickets', n) + '<br>' + kk('A (blue)', `expected ${m2(3 * n)}, at least one win ${pc1(pA(n))}`) + '<br>' + kk('B (violet)', `expected ${m2(2 * n)}, at least one win ${pc1(pB(n))}`);
        } else if (a === 'exp') {
          t = kk('Estimate', 'probability = made ÷ tries') + '<br>' + kk('Points per attempt', 'points for a make × probability');
        } else {
          t = kk('Expected net', 'sum of (probability × net)') + '<br>' + kk('Above $0', 'favorable') + ' &nbsp; ' + kk('$0', 'fair') + ' &nbsp; ' + kk('Below $0', 'unfavorable');
        }
        ro.innerHTML = t;
      };
      const sync = () => {
        if (st.prize !== lastPrize) { lastPrize = st.prize; Object.assign(simF, mkSim()); }
        if (Math.abs(st.price * 2 - Math.round(st.price * 2)) < 1e-9) visited.add(Math.round(st.price * 2) / 2);
        prizeS.set(st.prize); priceS.set(st.price); nS.set(st.n);
        P.draw(); upd();
      };

      const showAct = () => {
        for (const id in sections) sections[id].forEach(e => { e.style.display = id === st.act ? '' : 'none'; });
      };
      const setAct = id => { cancel(); st.act = id; sel.value = id; showAct(); renderQ(); sync(); };

      C.title('Activity');
      sel = C.select({ label: 'Choose an activity', options: ACTS.map(a => ({ value: a.id, label: a.label })), value: st.act, onChange: v => setAct(v) });
      host = sel.closest('.ctl').parentNode;
      C.title('Your turn');
      qbox = C.readout(); qbox.style.borderTop = '0'; qbox.style.paddingTop = '0'; qbox.style.fontSize = '.92rem'; qbox.style.lineHeight = '1.5';

      const collect = (id, fn) => { const n0 = host.children.length; fn(); sections[id] = (sections[id] || []).concat([...host.children].slice(n0)); };
      const playBtns = (id, S, outsFn) => collect(id, () => {
        C.buttons([
          { label: 'Play 1', primary: true, onClick: () => { simRun(S, outsFn(), 1); sync(); } },
          { label: 'Play 10', onClick: () => { simRun(S, outsFn(), 10); sync(); } },
          { label: 'Play 100', onClick: () => { simRun(S, outsFn(), 100); sync(); } },
          { label: 'Play 1,000', onClick: () => { simRun(S, outsFn(), 1000); sync(); } },
          { label: 'Reset', onClick: () => { Object.assign(S, mkSim()); sync(); } }
        ]);
      });
      let prizeS, priceS, nS;
      playBtns('build', simB, spinOuts);
      collect('fair', () => { prizeS = C.slider({ label: 'Prize on the winning sector', min: 0, max: 20, step: 1, value: st.prize, format: v => m(v), onInput: v => { cancel(); st.prize = v; sync(); } }); });
      playBtns('fair', simF, fairOuts);
      collect('profit', () => { priceS = C.slider({ label: 'Price per play', min: 1, max: 5, step: .5, value: st.price, format: v => m2(v), onInput: v => { cancel(); st.price = v; sync(); } }); });
      collect('chance', () => { nS = C.slider({ label: 'Number of tickets', min: 1, max: 10, step: 1, value: st.n, format: v => String(Math.round(v)), onInput: v => { cancel(); st.n = v; sync(); } }); });
      ro = C.readout();
      C.hint('Answer the questions, press the Play buttons or move the slider. The picture changes as you go.');

      showAct(); renderQ(); sync();

      const apply = (patch, immediate) => {
        cancel();
        const { act, ...nums } = patch;
        if (act && act !== st.act) { st.act = act; sel.value = act; showAct(); renderQ(); }
        if (nums.n !== undefined) { st.n = nums.n; delete nums.n; }
        const keys = Object.keys(nums);
        if (!keys.length || immediate) { Object.assign(st, nums); sync(); }
        else cancel = animateTo(st, nums, 700, sync);
      };
      return { destroy: () => { cancel(); stage.style.minHeight = prevMin; P.destroy(); }, apply };
    }
  });
}
