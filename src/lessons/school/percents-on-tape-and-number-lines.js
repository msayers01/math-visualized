/* =====================================================================
   SCHOOL — Percents on tape diagrams
   ===================================================================== */
{
  /* ---------- numbers and words ---------- */
  const MINUS = '−';
  const r2 = v => Math.round(v * 100) / 100;
  const grp = s => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const nfmt = (v, d = 2) => { const t = (+Math.abs(v).toFixed(d)).toString().split('.'); return (v < 0 ? MINUS : '') + grp(t[0]) + (t[1] ? '.' + t[1] : ''); };
  const money = v => { const t = Math.abs(v).toFixed(2).split('.'); return (v < 0 ? MINUS + '$' : '$') + grp(t[0]) + (t[1] === '00' ? '' : '.' + t[1]); };
  /* A = amount with its unit, S = short form for tick labels */
  const UNITS = {
    usd: { A: money, S: money, word: 'dollars' },
    min: { A: v => nfmt(v) + ' min', S: v => nfmt(v), word: 'minutes' },
    pts: { A: v => nfmt(v) + (r2(v) === 1 ? ' point' : ' points'), S: v => nfmt(v), word: 'points' }
  };
  const pc = v => nfmt(v, 1) + '%';
  const pcx = v => nfmt(v, 3) + '%';
  const dec = v => nfmt(v / 100, 4);
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; };
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = (a, b) => `<span class="k">${a}</span> ${b}`;
  const isInt = v => Math.abs(v - Math.round(v)) < 1e-9;
  const isHalf = v => !isInt(v) && isInt(v * 2);
  const plural = (k, w) => nfmt(k) + ' ' + w + (k === 1 ? '' : 's');
  const WORDS = { 2: 'halves', 4: 'fourths', 5: 'fifths', 10: 'tenths', 20: 'twentieths', 100: 'hundredths' };
  const COARSE = [2, 4, 5, 10, 20];
  const MODES = [{ id: 'part', name: 'Find the part' }, { id: 'pct', name: 'Find the percent' }, { id: 'whole', name: 'Find the whole' }, { id: 'conv', name: 'Fractions and decimals' }];

  /* ---------- the problems ----------
     part: whole and percent are given. pct: whole and part are given. whole: part and percent are given.
     snap = how far the marker moves in one step (percent for "part", amount for "pct"). */
  const PR = {
    part: [
      { label: 'Discount: 25% off a $60 skateboard', u: 'usd', W: 60, p: 25, snap: 5, moves: ['cut4', 'dec', 'mul', 'sub'], pname: 'discount', wname: 'price',
        q: 'A skateboard costs $60. This week it is 25% off. How much is the discount?',
        fin: { op: '-', ask: 'You buy the skateboard at the sale price. How much do you pay?', what: 'Sale price' } },
      { label: 'Tip: 15% of a $40 bill', u: 'usd', W: 40, p: 15, snap: 5, moves: ['cut20', 'cut10', 'one', 'div'], pname: 'tip', wname: 'bill',
        q: 'The dinner bill is $40. You want to leave a 15% tip. How much is the tip?',
        fin: { op: '+', ask: 'You pay the bill and the tip together. How much do you pay in all?', what: 'Total' } },
      { label: 'Commission: 12% of $200 in sales', u: 'usd', W: 200, p: 12, snap: 1, moves: ['cut10', 'one', 'mul', 'div'], pname: 'commission', wname: 'sales',
        q: 'A clerk sells $200 of shoes and earns a 12% commission. That means the clerk gets 12% of the sales. How much is the commission?', fin: null },
      { label: 'Markup: 30% on a $40 backpack', u: 'usd', W: 40, p: 30, snap: 5, moves: ['cut10', 'cut4', 'mul', 'sub'], pname: 'markup', wname: 'cost',
        q: 'A store buys a backpack for $40. It marks the price up by 30% to get the selling price. How much is the markup?',
        fin: { op: '+', ask: 'The selling price is the cost plus the markup. What is the selling price?', what: 'Selling price' } }
    ],
    pct: [
      { label: 'Discount: $10 off a $50 hoodie', u: 'usd', W: 50, part: 10, snap: 5, moves: ['cut5', 'frac', 'inv', 'sub'], pname: 'discount', wname: 'price',
        q: 'A hoodie costs $50. A coupon takes $10 off. What percent off is that?',
        fin: { op: '-', ask: 'What does the hoodie cost after the coupon?', what: 'New price' } },
      { label: 'Time: 45 of 60 minutes', u: 'min', W: 60, part: 45, snap: 5, moves: ['cut4', 'cut10', 'inv', 'same'], pname: 'time played', wname: 'level',
        q: 'A game level takes 60 minutes to finish. You have played 45 minutes. What percent of the level have you played?', fin: null },
      { label: 'Score: 34 of 40 points', u: 'pts', W: 40, part: 34, snap: 2, moves: ['cut20', 'frac', 'inv', 'sub'], pname: 'score', wname: 'quiz',
        q: 'A quiz is worth 40 points. Ravi earned 34 points. What percent of the points did he earn?', fin: null },
      { label: 'Tip: $9 on a $60 bill', u: 'usd', W: 60, part: 9, snap: 3, moves: ['cut20', 'cut10', 'same', 'sub'], pname: 'tip', wname: 'bill',
        q: 'The bill was $60. Mia left a $9 tip. What percent tip did she leave?',
        fin: { op: '+', ask: 'Mia paid the bill and the tip together. How much did she pay in all?', what: 'Total' } }
    ],
    whole: [
      { label: 'Discount: 25% off saved $12', u: 'usd', part: 12, p: 25, moves: ['cut4', 'cut10', 'mul', 'pctPart'], pname: 'discount', wname: 'price',
        q: 'A coat is 25% off. The discount is $12. What was the price before the discount?', ask: 'What was the price before the discount?', fin: null },
      { label: 'Tip: a 20% tip was $9', u: 'usd', part: 9, p: 20, moves: ['cut5', 'cut10', 'add', 'mul'], pname: 'tip', wname: 'bill',
        q: 'Jo left a 20% tip, and the tip was $9. How much was the bill?', ask: 'How much was the bill?', fin: null },
      { label: 'Commission: 8% was $24', u: 'usd', part: 24, p: 8, moves: ['one', 'cut10', 'pctPart', 'add'], pname: 'commission', wname: 'sales',
        q: 'Lena earns an 8% commission. This week her commission was $24. How much did she sell?', ask: 'How much did Lena sell?', fin: null },
      { label: 'Time: 60% of a level took 24 min', u: 'min', part: 24, p: 60, moves: ['cut5', 'cut10', 'mul', 'add'], pname: 'time played', wname: 'level',
        q: 'You have played 60% of a game level. That took 24 minutes. How long is the whole level?', ask: 'How long is the whole level?', fin: null }
    ]
  };
  for (const P of PR.part) P.part = P.W * P.p / 100;
  for (const P of PR.pct) P.p = P.part * 100 / P.W;
  for (const P of PR.whole) P.W = P.part * 100 / P.p;
  for (const P of [...PR.part, ...PR.pct]) if (P.fin) P.res = P.fin.op === '-' ? P.W - P.part : P.W + P.part;

  /* ---------- the move menu: every pick is explained with the numbers ---------- */
  const unitWord = P => UNITS[P.u].word;
  const piecesCovered = (mode, P, n) => (mode === 'pct' ? P.part * n / P.W : P.p * n / 100);
  const bigCutFits = (mode, P) => COARSE.some(c => isInt(piecesCovered(mode, P, c)));
  /* returns { label, kind: 'good' | 'ok' | 'bad', cut, text } */
  const MOVE = (mode, P, key) => {
    const A = UNITS[P.u].A, { W, p, part } = P, m = /^cut(\d+)$/.exec(key), n = m ? +m[1] : key === 'one' ? 100 : 0;
    if (n) {
      const label = n === 100 ? 'Find 1% first: cut the bar into 100 equal pieces' : `Cut the bar into ${n} equal pieces (${WORDS[n]})`;
      const k = piecesCovered(mode, P, n), pieceP = 100 / n, piece = mode === 'whole' ? part / k : W / n, kt = nfmt(k), pl = k === 1 ? 'piece' : 'pieces';
      let kind, text;
      if (mode === 'part') {
        if (n === 100) {
          kind = bigCutFits(mode, P) ? 'ok' : 'good';
          text = (kind === 'ok' ? `${ok('That works, but it is the long way.')} ` : `${ok('Good move.')} No bigger piece lands exactly on ${pc(p)}, so use the smallest. `) +
            `1% of ${A(W)} is ${A(W)} ÷ 100 = ${A(piece)}. Then ${pc(p)} is ${p} of those small pieces.` + (kind === 'ok' ? ' Bigger pieces are quicker when they fit.' : '');
        } else if (isInt(k)) { kind = 'good';
          text = `${ok('Good move.')} Cutting the bar into ${n} equal pieces makes each piece ${pc(pieceP)} of the bar. Each piece is also ${A(W)} ÷ ${n} = ${A(piece)}. So ${pc(p)} is exactly ${plural(k, 'piece')}, and the marker will land on a cut.`;
        } else if (isHalf(k)) { kind = 'ok';
          text = `${ok('That works, with one extra step.')} Each piece is ${pc(pieceP)} = ${A(piece)}. But ${pc(p)} is ${kt} pieces, so the marker lands in the middle of a piece. Half a piece is ${pc(pieceP / 2)} = ${A(piece / 2)}. A different cut makes this easier.`;
        } else { kind = 'bad';
          text = `${no('Not quite.')} Each piece would be ${pc(pieceP)} = ${A(piece)}, but ${pc(p)} is ${kt} pieces. The marker would land part of the way inside a piece, and the cuts would not give you the amount. Choose a cut that makes ${pc(p)} a whole number of pieces.`;
        }
      } else if (mode === 'pct') {
        if (n === 100) {
          kind = bigCutFits(mode, P) ? 'ok' : 'good';
          text = (kind === 'ok' ? `${ok('That works, but it is the long way.')} ` : `${ok('Good move.')} `) + `1% of ${A(W)} is ${A(W)} ÷ 100 = ${A(piece)}. The part, ${A(part)}, is ${kt} of those small pieces.` + (kind === 'ok' ? ' Bigger pieces are quicker when they fit.' : '');
        } else if (isInt(k)) { kind = 'good';
          text = `${ok('Good move.')} Cutting ${A(W)} into ${n} equal pieces gives pieces of ${A(W)} ÷ ${n} = ${A(piece)}. The part, ${A(part)}, is exactly ${plural(k, 'piece')}. Every piece is the same share of the bar. What percent is one piece?`;
        } else if (isHalf(k)) { kind = 'ok';
          text = `${ok('That works, with one extra step.')} Each piece is ${A(piece)}, and ${A(part)} is ${kt} pieces: whole pieces plus half of the next one. Half a piece is ${A(piece / 2)}. A different cut makes this easier.`;
        } else { kind = 'bad';
          text = `${no('Not quite.')} Each piece would be ${A(piece)}, but ${A(part)} is ${kt} pieces. The marker would land part of the way inside a piece. Choose a piece size that fits into ${A(part)} a whole number of times.`;
        }
      } else {
        if (n === 100 && isInt(k)) {
          kind = bigCutFits(mode, P) ? 'ok' : 'good';
          text = (kind === 'ok' ? `${ok('That works, but it is the long way.')} ` : `${ok('Good move.')} No bigger piece fits exactly, so use the smallest. `) +
            `${pc(p)} is ${p} pieces of 1%, so 1% is ${A(part)} ÷ ${p} = ${A(piece)}. The whole bar has 100 of them.` + (kind === 'ok' ? ' Bigger pieces are quicker when they fit.' : '');
        } else if (isInt(k)) { kind = 'good';
          text = k === 1
            ? `${ok('Good move.')} Each piece is ${pc(pieceP)} of the bar, and ${pc(p)} is exactly 1 piece. So one piece is ${A(part)}, and the whole bar has ${n} pieces.`
            : `${ok('Good move.')} Each piece is ${pc(pieceP)}, so ${pc(p)} is ${kt} pieces. Those ${kt} pieces are ${A(part)}, so one piece is ${A(part)} ÷ ${kt} = ${A(piece)}. The whole bar has ${n} pieces.`;
        } else { kind = 'bad';
          text = `${no('Not quite.')} Each piece is ${pc(pieceP)}, but ${pc(p)} is ${kt} pieces. The part you know ends part of the way through a piece, so you cannot tell how big one piece is. Choose a cut where ${pc(p)} is a whole number of pieces.`;
        }
      }
      return { label, kind, cut: n, text };
    }
    const uw = unitWord(P);
    switch (key) {
      case 'dec': return { label: `Write ${p}% as a decimal and multiply by ${A(W)}`, kind: 'good', cut: 0,
        text: `${ok('Good move.')} ${pc(p)} means ${p} out of every 100, so ${pc(p)} = ${p}/100 = ${dec(p)}. A part of the whole is that decimal times the whole: ${dec(p)} × ${nfmt(W)}. Place the marker to see where ${pc(p)} falls on the bar.` };
      case 'frac': return { label: `Divide the part by the whole (${nfmt(part)} ÷ ${nfmt(W)})`, kind: 'good', cut: 0,
        text: `${ok('Good move.')} A percent compares the part with the whole, so divide the part by the whole: ${nfmt(part)} ÷ ${nfmt(W)} = ${dec(p)}. That decimal is the share of the whole. A percent writes the same share out of 100. Place the marker at the part to see it on the bar.` };
      case 'mul':
        if (mode === 'part') return { label: `Multiply the whole by ${p} (${nfmt(W)} × ${p})`, kind: 'bad', cut: 0,
          text: `${no('Not quite.')} ${nfmt(W)} × ${p} = ${A(W * p)}, which is far more than the whole (${A(W)}). A part cannot be bigger than the whole. Percent means "out of 100", so you would also have to divide by 100.` };
        return { label: `Multiply the part by ${p} (${nfmt(part)} × ${p})`, kind: 'bad', cut: 0,
          text: `${no('Not quite.')} ${nfmt(part)} × ${p} = ${A(part * p)}. Check it: ${pc(p)} of ${A(part * p)} is ${A(part * p * p / 100)}, not ${A(part)}. Multiplying by the percent number gives a number that is much too big.` };
      case 'div': return { label: `Divide the whole by ${p} (${nfmt(W)} ÷ ${p})`, kind: 'bad', cut: 0,
        text: `${no('Not quite.')} ${nfmt(W)} ÷ ${p} = ${A(W / p)}, which is only ${pc(100 / p)} of ${A(W)}, not ${pc(p)}. Dividing by ${p} asks how many groups of ${p} fit in ${nfmt(W)}. It does not find ${p} out of every 100.` };
      case 'sub':
        if (mode === 'part') return { label: `Subtract the percent from the whole (${nfmt(W)} − ${p})`, kind: 'bad', cut: 0,
          text: `${no('Not quite.')} ${nfmt(W)} − ${p} = ${nfmt(W - p)}. But that takes ${p} ${uw} off the whole, and ${A(p)} is ${pc(p / W * 100)} of ${A(W)}, not ${pc(p)}. A percent is a share of the whole, not a number of ${uw}.` };
        return { label: `Subtract the part from the whole (${nfmt(W)} − ${nfmt(part)})`, kind: 'bad', cut: 0,
          text: `${no('Not quite.')} ${nfmt(W)} − ${nfmt(part)} = ${A(W - part)} is what is left over. That is ${pc((W - part) / W * 100)} of the whole: the other piece of the bar. The question asks for the share that ${A(part)} takes up.` };
      case 'inv': return { label: `Divide the whole by the part (${nfmt(W)} ÷ ${nfmt(part)})`, kind: 'bad', cut: 0,
        text: `${no('Not quite.')} ${nfmt(W)} ÷ ${nfmt(part)} = ${nfmt(W / part)} tells how many pieces of ${A(part)} fit in ${A(W)}. It is not a percent. The part is smaller than the whole, so the percent must be less than 100%.` };
      case 'same': return { label: `Say the part number is the percent (${nfmt(part)}%)`, kind: 'bad', cut: 0,
        text: `${no('Not quite.')} ${nfmt(part)} is a number of ${uw}, not a percent. ${uw.charAt(0).toUpperCase() + uw.slice(1)} and percent are the same number only when the whole is exactly 100. Here the whole is ${A(W)}.` };
      case 'pctPart': return { label: `Find ${p}% of the part (${p}% of ${nfmt(part)})`, kind: 'bad', cut: 0,
        text: `${no('Not quite.')} ${pc(p)} of ${A(part)} is ${A(part * p / 100)}, which is smaller than ${A(part)}. But ${A(part)} is only ${pc(p)} of the whole, so the whole must be bigger than ${A(part)}.` };
      case 'add': return { label: `Add the percent to the part (${nfmt(part)} + ${p})`, kind: 'bad', cut: 0,
        text: `${no('Not quite.')} ${nfmt(part)} + ${p} = ${A(part + p)}. Check it: ${pc(p)} of ${A(part + p)} is ${A(r2((part + p) * p / 100))}, not ${A(part)}. Adding the percent number mixes ${uw} with percent.` };
    }
  };

  /* ---------- the answers to Steps 3 and 4 (the right one plus three common slips) ---------- */
  const ANSWERS = (mode, P) => {
    const A = UNITS[P.u].A, { W, p, part } = P, uw = unitWord(P), out = [];
    const add = (key, label, right, why) => out.push({ key, label, right, why });
    if (mode === 'part') {
      add('r', A(part), true, `${ok('Right.')} ${pc(p)} of ${A(W)} is ${A(part)}. As a calculation: ${dec(p)} × ${nfmt(W)} = ${nfmt(part)}.`);
      add('a', A(p), false, `${no('Not quite.')} ${A(p)} is ${pc(p / W * 100)} of ${A(W)}, not ${pc(p)}. The percent number is not the amount. It would match only if the whole were 100.`);
      add('b', A(W * p / 10), false, `${no('Not quite.')} ${A(W * p / 10)} is ${pc(p * 10)} of ${A(W)}: bigger than the whole. That divides by 10 instead of 100. ${pc(p)} is ${p} hundredths, not ${p} tenths.`);
      add('c', A(W - part), false, `${no('Not quite.')} ${A(W - part)} is the rest of the bar (${pc(100 - p)}), not the ${pc(p)} piece. Look at the marker again.`);
    } else if (mode === 'pct') {
      add('r', pc(p), true, `${ok('Right.')} ${A(part)} is ${pc(p)} of ${A(W)}. As a calculation: ${nfmt(part)} ÷ ${nfmt(W)} = ${dec(p)} = ${pc(p)}.`);
      add('a', pc(part), false, `${no('Not quite.')} ${pc(part)} of ${A(W)} is ${A(W * part / 100)}, not ${A(part)}. The number of ${uw} is the percent only when the whole is 100.`);
      add('b', pc(100 - p), false, `${no('Not quite.')} ${pc(100 - p)} of ${A(W)} is ${A(W * (100 - p) / 100)}. That is the rest of the bar. The ${A(part)} piece is the other part.`);
      add('c', pcx(p / 100), false, `${no('Not quite.')} ${nfmt(part)} ÷ ${nfmt(W)} = ${dec(p)} is a decimal. A percent is out of 100, so multiply by 100: ${dec(p)} × 100.`);
    } else {
      add('r', A(W), true, `${ok('Right.')} The whole is ${A(W)}. Check: ${pc(p)} of ${A(W)} is ${A(part)}. As a calculation: ${nfmt(part)} ÷ ${dec(p)} = ${nfmt(W)}.`);
      add('a', A(part * p), false, `${no('Not quite.')} ${A(part * p)} is too big: ${pc(p)} of ${A(part * p)} is ${A(part * p * p / 100)}, not ${A(part)}.`);
      add('b', A(part * p / 100), false, `${no('Not quite.')} ${A(part * p / 100)} is smaller than the part (${A(part)}). The whole must be bigger than the part, because ${A(part)} is only ${pc(p)} of it.`);
      add('c', A(part + p), false, `${no('Not quite.')} ${A(part + p)} is too small: ${pc(p)} of ${A(part + p)} is ${A(r2((part + p) * p / 100))}, not ${A(part)}. Adding the percent number mixes ${uw} with percent.`);
    }
    return out;
  };
  const FINALS = P => {
    const A = UNITS[P.u].A, { W, p, part, res } = P, f = P.fin, minus = f.op === '-', out = [];
    const add = (key, label, right, why) => out.push({ key, label, right, why });
    add('r', A(res), true, minus
      ? `${ok('Right.')} You keep the rest of the bar: 100% − ${pc(p)} = ${pc(100 - p)}. As a calculation: ${A(W)} − ${A(part)} = ${A(res)}.`
      : `${ok('Right.')} The ${P.pname} is added on top of the ${P.wname}: ${A(W)} + ${A(part)} = ${A(res)}, which is ${pc(100 + p)} of the ${P.wname}.`);
    add('a', A(part), false, `${no('Not quite.')} ${A(part)} is only the ${P.pname}. ${minus ? 'You pay the rest of the bar, not just the piece that comes off.' : 'The question asks for everything together, so the ' + P.wname + ' counts too.'}`);
    add('b', A(minus ? W + part : W - part), false, minus
      ? `${no('Not quite.')} ${A(W + part)} adds the discount. A discount takes money off, so the price goes down.`
      : `${no('Not quite.')} ${A(W - part)} takes the ${P.pname} away. A ${P.pname} is added on, so the total goes up.`);
    add('c', A(minus ? W - p : W + p), false, `${no('Not quite.')} ${nfmt(p)} is a percent, not ${unitWord(P)}. Use the ${A(part)} you found, not the percent number.`);
    return out;
  };
  /* where the right answer sits (it should not always be first) */
  const ORDERS = [[2, 0, 3, 1], [1, 3, 0, 2], [3, 1, 2, 0], [0, 2, 1, 3]];
  const shuffled = (items, seed) => { const o = ORDERS[seed % 4], res = []; items.forEach((it, i) => { res[o[i]] = it; }); return res; };

  /* ---------- fractions, decimals and percents: practice tasks ---------- */
  const TASKS = [
    { label: 'Write 3/8 as a percent', given: { kind: 'frac', n: 3, d: 8 }, q: 'Write 3/8 as a percent.', right: 1,
      choices: [['3.75%', 3.75, 'Moving the decimal point one place gives 3.75, which is too small. 3/8 means 3 ÷ 8 = 0.375, and a percent is out of 100, so 0.375 × 100 = 37.5. Also, 3/8 is a bit less than 1/2, so its percent is a bit less than 50%.'],
        ['37.5%', 37.5, '3 ÷ 8 = 0.375, and 0.375 × 100 = 37.5. So 3/8 = 0.375 = 37.5%. It is a bit less than 1/2 = 50%, and on the hundred grid it is 37 full squares and half of the next one.'],
        ['0.375%', .375, '0.375 is the decimal for 3/8. A percent is out of 100, so multiply by 100: 37.5%. A percent of 0.375 is less than half of one grid square.'],
        ['266.7%', 266.667, 'That divides 8 ÷ 3. The fraction bar means top ÷ bottom, so 3/8 is 3 ÷ 8. Also 3/8 is less than one whole, so its percent must be less than 100%.']] },
    { label: 'Write 0.6 as a percent', given: { kind: 'dec', v: 60 }, q: 'Write 0.6 as a percent.', right: 2,
      choices: [['0.6%', .6, '0.6 is 6 tenths, which is 60 hundredths. A percent counts hundredths, so multiply by 100: 0.6 × 100 = 60. A percent of 0.6 is about half of one grid square.'],
        ['6%', 6, '0.6 is 6 tenths, not 6 hundredths. 6 tenths = 60 hundredths = 60%.'],
        ['60%', 60, '0.6 = 6 tenths = 60 hundredths = 60%. 60 of the 100 grid squares are shaded.'],
        ['600%', 600, '0.6 is less than 1 whole, so its percent is less than 100%. To change a decimal to a percent, multiply by 100: 0.6 × 100 = 60.']] },
    { label: 'Write 7/4 as a percent', given: { kind: 'frac', n: 7, d: 4 }, q: 'Write 7/4 as a percent.', right: 2,
      choices: [['74%', 74, '7/4 is not "7 and 4 side by side". The fraction bar means 7 ÷ 4 = 1.75. That is more than 1 whole, so the percent must be more than 100%.'],
        ['17.5%', 17.5, '7 ÷ 4 = 1.75. To get a percent, multiply by 100: 1.75 × 100 = 175. Moving the point only one place gives 17.5, which is too small. 7/4 is more than 1 whole.'],
        ['175%', 175, '7 ÷ 4 = 1.75, and 1.75 × 100 = 175. So 7/4 = 1.75 = 175%. It is more than one whole (4/4 = 100%), so it fills the first grid and 75 squares of a second one.'],
        ['1.75%', 1.75, '1.75 is the decimal for 7/4. To write it as a percent, multiply by 100: 175%.']] },
    { label: 'Write 45% as a fraction', given: { kind: 'pct', v: 45 }, q: 'Write 45% as a fraction in lowest terms.', right: 1,
      choices: [['45/10', 450, 'Percent means out of 100, not out of 10. 45% = 45/100. And 45/10 = 4.5 wholes, which is 450%.'],
        ['9/20', 45, '45% = 45/100. Divide the top and the bottom by 5: 45 ÷ 5 = 9 and 100 ÷ 5 = 20. So 45% = 45/100 = 9/20. In lowest terms, no number except 1 divides both 9 and 20.'],
        ['4/5', 80, '4/5 = 0.8 = 80%. 45% = 45/100. Divide the top and the bottom by 5 to get 9/20.'],
        ['1/45', 2.222, '1/45 is only about 2.2%. 45% means 45 out of every 100, so it is 45/100, which simplifies to 9/20.']] },
    { label: 'Write 125% as a decimal', given: { kind: 'pct', v: 125 }, q: 'Write 125% as a decimal.', right: 2,
      choices: [['0.125', 12.5, '125% = 125/100 = 1.25. A decimal of 0.125 would be 12.5%. 125% is more than 1 whole, so its decimal is more than 1.'],
        ['12.5', 1250, 'To change a percent to a decimal, divide by 100 (move the point two places left), not by 10: 125 ÷ 100 = 1.25.'],
        ['1.25', 125, '125% = 125 ÷ 100 = 1.25. It is more than 1 because 125% is more than the whole bar.'],
        ['125', 12500, '125 is the percent number. As a decimal, 125% means 125 ÷ 100 = 1.25.']] },
    { label: 'Write 0.07 as a percent', given: { kind: 'dec', v: 7 }, q: 'Write 0.07 as a percent.', right: 2,
      choices: [['0.07%', .07, '0.07 is 7 hundredths. A percent is out of 100, so multiply by 100: 0.07 × 100 = 7. A percent of 0.07 would be a tiny sliver of one square.'],
        ['0.7%', .7, '0.7% is less than one grid square. 0.07 is 7 hundredths, so multiply by 100: 0.07 × 100 = 7.'],
        ['7%', 7, '0.07 = 7/100 = 7%. One grid square is 1%, and 7 squares are shaded.'],
        ['70%', 70, '0.7 is 70%, but 0.07 has one more zero. 0.07 is 7 hundredths, which is 7%.']] }
  ];
  const DENS = [2, 3, 4, 5, 8, 10, 20, 25];

  /* ---------- drawing helpers (pixel space) ---------- */
  const SANS = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
  const font = (size, weight = 600) => `${weight} ${size}px ${SANS}`;
  const mw = (c, s, size, weight = 600) => { c.font = font(size, weight); return c.measureText(s).width; };
  const T = (c, p, s, x, y, { size = 13, color, align = 'center', weight = 600, halo = true } = {}) => {
    c.font = font(size, weight); c.textAlign = align; c.textBaseline = 'middle';
    if (halo) { c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(s, x, y); }
    c.fillStyle = color || p.pal.text; c.fillText(s, x, y);
  };
  const rrect = (c, x, y, w, hh, r) => {
    r = Math.min(r, w / 2, hh / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + hh, r); c.arcTo(x + w, y + hh, x, y + hh, r); c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  const line = (c, x0, y0, x1, y1, color, width = 1.5, dash) => {
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.strokeStyle = color; c.lineWidth = width; c.setLineDash(dash || []); c.lineCap = 'round'; c.stroke(); c.setLineDash([]);
  };

  register({
    id: 'percents-on-tape-and-number-lines', level: 'school',
    title: 'Percents on tape diagrams',
    blurb: 'Cut a tape diagram into equal pieces to find a part, a percent or a whole, and turn fractions and decimals into percents on a hundred grid.',
    thumb(c, p) {
      const pal = p.pal, W = p.w, H = p.h, x0 = W * .1, x1 = W * .9, tw = x1 - x0, y0 = H * .4, y1 = H * .66, X = v => x0 + v / 100 * tw, fs = Math.max(9, H * .085);
      c.fillStyle = alpha(pal.blue, .14); c.fillRect(x0, y0, tw, y1 - y0);
      c.fillStyle = alpha(pal.yellow, .6); c.fillRect(x0, y0, X(40) - x0, y1 - y0);
      for (let i = 1; i < 10; i++) line(c, X(i * 10), y0, X(i * 10), y1, alpha(pal.blue, .75), 1.3);
      c.strokeStyle = pal.blue; c.lineWidth = 2; c.strokeRect(x0, y0, tw, y1 - y0);
      line(c, X(40), y0 - 8, X(40), y1 + 8, pal.brass, 2.5);
      c.beginPath(); c.arc(X(40), (y0 + y1) / 2, 6, 0, Math.PI * 2); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.brass; c.lineWidth = 2.5; c.stroke();
      const t = (s, x, y, al) => { c.font = font(fs, 700); c.textAlign = al; c.textBaseline = 'middle'; c.fillStyle = pal.muted; c.fillText(s, x, y); };
      t('0%', x0, y0 - H * .1, 'left'); t('100%', x1, y0 - H * .1, 'right'); t('$0', x0, y1 + H * .1, 'left'); t('$50', x1, y1 + H * .1, 'right');
      c.font = font(fs, 700); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = pal.text;
      c.fillText('40%', X(40), y0 - H * .1); c.fillText('$20', X(40), y1 + H * .1);
    },
    hook: String.raw`A shirt costs $40 and the sign says "25% off". How can a drawing of a bar show you how many dollars you save?`,
    steps: [
      { title: 'One bar, two number lines',
        text: String.raw`<p>A skateboard costs $60 and it is 25% off. The bar is the price: the whole $60 is 100%. The top line counts percent. The bottom line counts dollars. The marker has a number on each line: here 25% and $15.</p><p>Cut the bar into 4 equal pieces. Each piece is 100% ÷ 4 = 25%, and $60 ÷ 4 = $15. So the discount is $15, and you pay the other 75%, which is $45.</p><p>Drag the marker to see matching numbers. Then press <b>Try it yourself</b> to solve this one with your own moves.</p>`,
        set: { mode: 'part', pi: 0, cut: 4, show: true, pos: 25, ext: 0 } },
      { title: 'Find the percent',
        text: String.raw`<p>A hoodie costs $50 and a coupon takes $10 off. Now you know the part and the whole, and the percent is missing.</p><p>Cut the bar into 5 equal pieces. Each piece is $50 ÷ 5 = $10, so the $10 coupon is exactly 1 piece. One piece is 100% ÷ 5 = 20% of the bar. The coupon is 20% off.</p><p>Check by dividing: 10 ÷ 50 = 0.2, and 0.2 = 20%.</p>`,
        set: { mode: 'pct', pi: 0, cut: 5, show: true, pos: 20, ext: 0 } },
      { title: 'Find the whole',
        text: String.raw`<p>Jo left a 20% tip, and the tip was $9. What was the bill? Now the percent and the part are known, and the whole is missing.</p><p>Cut the bar into 5 equal pieces, 20% each. The tip is 1 piece, so 1 piece is $9. The whole bar is 5 pieces: 5 × $9 = $45.</p><p>Check: 20% of $45 is $9.</p>`,
        set: { mode: 'whole', pi: 1, cut: 5, show: true, pos: 100, ext: 0 } },
      { title: 'Fractions, decimals and percents',
        text: String.raw`<p>A fraction, a decimal and a percent can name the same spot on the bar. Here the fraction is 3/8: 3 of 8 equal pieces.</p><p>3 ÷ 8 = 0.375, and 0.375 × 100 = 37.5. So 3/8 = 0.375 = 37.5%. On the hundred grid that is 37 squares and half of another one.</p><p>Set a fraction, a decimal or a percent, or drag the marker past 100%. Percents can be bigger than 100%.</p>`,
        set: { mode: 'conv', task: -1, src: 'frac', n: 3, d: 8, pos: 37.5 } }
    ],
    formal: String.raw`
      <h3>Percent means "per 100"</h3>
      <p>The word <em>percent</em> means "for each hundred". So \(35\%\) is \(35\) out of every \(100\):
      \[ 35\% = \frac{35}{100} = 0.35. \]
      A percent is a fraction with denominator \(100\). It is also a decimal with two places.</p>
      <h3>Three quantities</h3>
      <p>Every percent problem has a <em>whole</em> (the amount that is \(100\%\)), a <em>part</em> (some of the whole) and a <em>percent</em> (how big the part is compared with the whole). If you know two of them, you can find the third. A discount, a markup, a tip and a commission are all parts: the whole is the original price, the cost, the bill or the sales.</p>
      <h3>The tape diagram and the double number line</h3>
      <p>Draw the whole as a bar. Put percents along the top line, from \(0\%\) to \(100\%\). Put real amounts (dollars, minutes, points) along the bottom line, from \(0\) to the whole. Each spot on the bar has one number on each line, and \(100\%\) always goes with the whole amount.</p>
      <p>Cut the bar into \(n\) equal pieces. Each piece is \(100\% \div n\) of the bar, and it is the whole \(\div\, n\) in amount. Doing the same thing to both lines keeps them matched. A <em>table of equivalent ratios</em> writes the same matches in rows:</p>
      <table style="border-collapse:collapse;margin:0 0 1em;font-variant-numeric:tabular-nums">
        <tr><th style="text-align:left;padding:4px 14px 4px 0;font-weight:500">percent</th><td style="padding:4px 14px;border-bottom:1px solid var(--line-strong)">100</td><td style="padding:4px 14px;border-bottom:1px solid var(--line-strong)">50</td><td style="padding:4px 14px;border-bottom:1px solid var(--line-strong)">25</td><td style="padding:4px 14px;border-bottom:1px solid var(--line-strong)">5</td><td style="padding:4px 14px;border-bottom:1px solid var(--line-strong)">1</td></tr>
        <tr><th style="text-align:left;padding:4px 14px 4px 0;font-weight:500">dollars</th><td style="padding:4px 14px">60</td><td style="padding:4px 14px">30</td><td style="padding:4px 14px">15</td><td style="padding:4px 14px">3</td><td style="padding:4px 14px">0.60</td></tr>
      </table>
      <p>Every column is the same ratio: divide both numbers in a column by the same number (here \(2\), then \(2\), then \(5\), then \(5\)) to get the next one. The third column says that \(25\%\) of \(\$60\) is \(\$15\).</p>
      <h3>Finding the part</h3>
      <p>Part \(=\) percent (as a decimal) \(\times\) whole. For \(25\%\) of \(\$60\): cut into \(4\) pieces to get \(60 \div 4 = 15\), or compute \(0.25 \times 60 = 15\).</p>
      <p>When the percent is not a whole number of big pieces, build it. For \(35\%\) of \(\$80\): \(10\%\) is \(80 \div 10 = 8\), so \(30\%\) is \(3 \times 8 = 24\). Half of \(10\%\) is \(5\%\), which is \(4\). Then \(35\% = 24 + 4 = \$28\). For \(12\%\) of \(\$200\), find \(1\%\) first: \(200 \div 100 = 2\), so \(12\% = 12 \times 2 = \$24\).</p>
      <h3>Finding the percent</h3>
      <p>Percent \(= \dfrac{\text{part}}{\text{whole}} \times 100\%\). For \(\$10\) out of \(\$50\): \(10 \div 50 = 0.2\), and \(0.2 \times 100 = 20\), so it is \(20\%\). On the tape, \(50 \div 5 = 10\) shows that \(\$10\) is one of \(5\) equal pieces, and \(100\% \div 5 = 20\%\). The part number is not the percent: the two match only when the whole is \(100\).</p>
      <h3>Finding the whole</h3>
      <p>Whole \(=\) part \(\div\) percent (as a decimal). If \(20\%\) of the bill is \(\$9\): \(9 \div 0.2 = 45\). On the tape, \(20\%\) is \(1\) of \(5\) equal pieces, so the whole is \(5 \times 9 = \$45\). Check by going forward: \(20\%\) of \(45\) is \(9\). Multiplying \(9 \times 20\) gives \(180\), which is too big, because \(20\%\) of \(180\) is \(36\), not \(9\).</p>
      <h3>Discounts, markups, tips and commission</h3>
      <p>A discount takes a part off the price, so you pay \((100 - p)\%\) of it. For \(35\%\) off \(\$80\), the discount is \(\$28\) and you pay \(65\%\) of \(80\), which is \(\$52\). A markup and a tip are added on, so the total is \((100 + p)\%\) of the whole. A \(15\%\) tip on \(\$40\) is \(\$6\), and the total is \(115\%\) of \(40\), which is \(\$46\). A commission is a percent of the sales: \(8\%\) of \(\$300\) is \(\$24\). A percent over \(100\%\) means more than the whole.</p>
      <h3>Fractions, decimals and percents</h3>
      <p>They are three names for one number.</p>
      <ul>
        <li>Percent to decimal: divide by \(100\), which moves the point two places left. \(125\% = 1.25\) and \(7\% = 0.07\).</li>
        <li>Decimal to percent: multiply by \(100\). \(0.6 = 60\%\).</li>
        <li>Fraction to decimal: divide the top by the bottom. \(\dfrac{3}{8} = 3 \div 8 = 0.375\), so \(\dfrac{3}{8} = 37.5\%\).</li>
        <li>Percent to fraction: write it over \(100\) and simplify. \(45\% = \dfrac{45}{100} = \dfrac{9}{20}\).</li>
        <li>More than a whole: \(\dfrac{7}{4} = 1.75 = 175\%\). A fraction such as \(\dfrac{1}{3}\) gives a decimal that never ends, \(0.333\ldots\), so its percent is about \(33.3\%\).</li>
      </ul>
      <h3>Does the answer make sense?</h3>
      <p>Use benchmarks. \(50\%\) is half, \(25\%\) is a quarter, \(10\%\) is a tenth and \(1\%\) is a hundredth. If the percent is less than \(100\%\), the part must be less than the whole. For \(35\%\) of \(\$80\), the percent is between \(25\%\) and \(50\%\), so the answer should be between \(\$20\) and \(\$40\). The answer \(\$28\) fits.</p>`,
    check: [
      { q: String.raw`A jacket costs $80. It is on sale for 35% off. What is the sale price of the jacket?`,
        choices: ['$28', '$45', '$52', '$108'], answer: 2,
        why: String.raw`Cut a bar for $80 into tenths: 10% is $8, so 30% is $24. Half of $8 is $4, which is 5%. So 35% is $24 + $4 = $28, and that is the discount. The sale price is what is left: $80 − $28 = $52. The answer $28 is only the discount. The answer $45 subtracts the percent number (80 − 35). The answer $108 adds the discount instead of taking it off.`,
        hint: String.raw`First find 35% of $80. Then decide whether to subtract it from the price or add it.` },
      { q: String.raw`Which pair gives the decimal and the percent that are both equal to \(\frac{7}{4}\)?`,
        choices: ['0.74 and 74%', '1.75 and 175%', '1.75 and 17.5%', '0.175 and 17.5%'], answer: 1,
        why: String.raw`The fraction bar means divide: \(7 \div 4 = 1.75\). To get a percent, multiply by 100: \(1.75 \times 100 = 175\). So \(\frac{7}{4} = 1.75 = 175\%\), more than one whole. The pair 0.74 and 74% reads the fraction as the digits 7 and 4 side by side. The pair 1.75 and 17.5% moves the decimal point one place instead of two. The pair 0.175 and 17.5% puts the decimal point one place too far left both times.`,
        hint: String.raw`Divide the top by the bottom to get the decimal. Then multiply the decimal by 100 for the percent.` }
    ],
    links: { prereq: ['ratios-and-equivalent-ratios'], related: ['unit-rates-and-best-buys', 'proportional-relationships'] },

    mount({ stage, controls: C }) {
      const P = new Plane(stage, { span: 5 });
      const cvEl = P.canvas;
      if (P.coordEl) P.coordEl.style.display = 'none';
      cvEl.tabIndex = 0;
      cvEl.setAttribute('role', 'img');
      cvEl.setAttribute('aria-label', 'A tape diagram over a double number line. Percent runs along the top and real amounts along the bottom. Use the left and right arrow keys to move the marker.');
      const st = { mode: 'part', pi: 0, stage: 0, cut: 0, pos: 0, ext: 0, ans: false, show: false, fb: '', picks: {}, src: 'frac', n: 3, d: 8, task: -1, ghost: null, cvDone: false };
      let cancel = () => {};
      let ro, liveEl = null, freeCtl = [], gTape, gConv, probSel, modeBtns, numSl, denSel, decSl, pctSl, taskSel;

      const prob = () => PR[st.mode][st.pi];
      const tgt = () => (st.mode === 'part' ? prob().p : st.mode === 'pct' ? prob().part * 100 / prob().W : 100);
      const task = () => (st.task >= 0 ? TASKS[st.task] : null);

      /* ---------- the converter's numbers ---------- */
      const cinfo = () => {
        const tk = task(), src = tk ? tk.given.kind : st.src;
        let num, den;
        if (src === 'frac') { num = tk ? tk.given.n : st.n; den = tk ? tk.given.d : st.d; } else { num = Math.round(st.pos); den = 100; }
        const g = gcd(num, den), rn = num / g, rd = den / g;
        let t = rd; while (t % 2 === 0) t /= 2; while (t % 5 === 0) t /= 5;
        const v = num / den, term = t === 1;
        const whole = Math.floor(rn / rd), rem = rn % rd;
        const frac = rd === 1 ? String(rn) : `${rn}/${rd}`, mixed = rn > rd && rd !== 1 ? `${whole} ${rem}/${rd}` : '';
        return { src, num, den, rn, rd, v, term, frac, mixed,
          decT: term ? nfmt(v, 6) : nfmt(v, 3) + '…', pctT: term ? nfmt(v * 100, 4) + '%' : nfmt(v * 100, 1) + '…%' };
      };

      /* ---------- layout (pixel space) ---------- */
      const lay = () => {
        const W = P.w || 400, H = P.h || 400, u = clamp(H / 500, .64, 1.5), padX = clamp(W * .055, 16, 44), fs = clamp(W * .036, 11.5, 17);
        const conv = st.mode === 'conv', g = { W, H, u, padX, fs, x0: padX, x1: W - padX, conv };
        const tapeH = conv ? clamp(H * .085, 30, 56) : clamp(H * .16, 42, 120);
        let y = 20 * u;
        g.title = y; y += fs + 9; g.given = y; y += 26 * u;
        g.cap = y; y += (conv ? 32 : 22) * u; g.labTop = y; y += 20 * u;
        g.tapeTop = y; g.tapeBot = y + tapeH; y = g.tapeBot + 22 * u; g.labBot = y;
        if (conv) { g.gridTop = y + 30 * u; g.end = H; g.sh = 0; return g; }
        y += 24 * u; g.capBot = y; y += 28 * u; g.brk = y; y += 20 * u; g.brkLab = y; y += 34 * u; g.tbl = y; g.end = y + 62 * u;
        g.sh = Math.max(0, (H - g.end) * .45 - 4);
        return g;
      };

      /* ---------- drawing: tape modes ---------- */
      const drawTape = (c, p, g) => {
        const pal = p.pal, Pr = prob(), mode = st.mode, W = Pr.W, U = UNITS[Pr.u], n = st.cut, pos = st.pos, stg = st.stage, full = st.ans || st.show;
        const tw = g.x1 - g.x0, smax = 100 + st.ext, X = v => g.x0 + v / smax * tw, fs = g.fs, top = g.tapeTop, bot = g.tapeBot, mid = (top + bot) / 2;
        /* the three quantities */
        const chips = [['Whole', mode === 'whole' && !full ? '?' : U.A(W)],
          ['Percent', mode === 'pct' && !full ? '?' : pc(Pr.p)], ['Part', mode === 'part' && !full ? '?' : U.A(Pr.part)]];
        const order = mode === 'part' ? [0, 1, 2] : mode === 'pct' ? [0, 2, 1] : [1, 2, 0];
        let cx = g.x0;
        T(c, p, Pr.label.split(':')[0], g.x0, g.title, { size: fs + 2, align: 'left', weight: 700, halo: false });
        for (const i of order) {
          const s = chips[i][0] + ' ' + chips[i][1], w = mw(c, s, fs) + 14, unk = chips[i][1] === '?';
          rrect(c, cx, g.given - 11, w, 22, 11);
          c.fillStyle = unk ? alpha(pal.yellow, .2) : alpha(pal.blue, .1); c.fill();
          c.strokeStyle = unk ? pal.yellow : alpha(pal.blue, .6); c.lineWidth = unk ? 1.8 : 1.2; c.setLineDash(unk ? [4, 3] : []); c.stroke(); c.setLineDash([]);
          T(c, p, s, cx + w / 2, g.given, { size: fs, halo: false, color: unk ? pal.text : pal.muted });
          cx += w + 7;
        }
        /* the bar */
        const bx0 = X(0), bx1 = X(100), barW = bx1 - bx0;
        c.save(); rrect(c, bx0, top, barW, bot - top, 6); c.clip();
        c.fillStyle = alpha(pal.blue, .12); c.fillRect(bx0, top, barW, bot - top);
        const shadeTo = mode === 'whole' ? Pr.p : pos;
        if (shadeTo > 0) { c.fillStyle = alpha(pal.yellow, .55); c.fillRect(bx0, top, X(shadeTo) - bx0, bot - top); }
        const finShown = Pr.fin && (stg >= 3 || st.show);
        if (finShown && Pr.fin.op === '-') { c.fillStyle = alpha(pal.blue, .34); c.fillRect(X(Pr.p), top, bx1 - X(Pr.p), bot - top); }
        if (n === 100) {
          for (let i = 1; i < 100; i++) line(c, X(i), top, X(i), bot, alpha(pal.blue, i % 10 ? .22 : .8), i % 10 ? 1 : 1.6);
        } else if (n > 1) for (let i = 1; i < n; i++) line(c, X(i * 100 / n), top, X(i * 100 / n), bot, alpha(pal.blue, .8), 1.8);
        c.restore();
        if (st.ext > .05) {
          c.fillStyle = alpha(pal.yellow, .55); c.fillRect(bx1, top, X(100 + st.ext) - bx1, bot - top);
          c.strokeStyle = pal.yellow; c.lineWidth = 2; c.setLineDash([5, 3]); c.strokeRect(bx1, top, X(100 + st.ext) - bx1, bot - top); c.setLineDash([]);
        }
        rrect(c, bx0, top, barW, bot - top, 6); c.strokeStyle = pal.blue; c.lineWidth = 2.2; c.stroke();
        /* words inside the bar once the total is in play */
        if (finShown) {
          const seg = (a, b, s, pad = 8) => { const w = X(b) - X(a); if (w > mw(c, s, fs - 1) + pad) T(c, p, s, (X(a) + X(b)) / 2, mid, { size: fs - 1 }); };
          seg(0, Pr.p, `${Pr.pname} ${U.S(Pr.part)}`, 44);
          if (Pr.fin.op === '-') seg(Pr.p, 100, `${Pr.fin.what.toLowerCase()} ${U.S(Pr.res)}`);
          else seg(100, 100 + st.ext, `+${U.S(Pr.part)}`);
        }

        /* tick marks and labels (the side you are looking for stays hidden until you have found it) */
        const aKnown = t => t === 0 || (mode !== 'whole' && t === 100) || (mode === 'whole' && Math.abs(t - Pr.p) < 1e-9) || mode === 'pct' || full || (stg >= 1 && t < pos - 1e-9);
        const tKnown = t => t === 0 || t === 100 || mode !== 'pct' || full;
        const occ = { top: [], bot: [] }, yTop = g.labTop, yBot = g.labBot;
        const free = (row, x, w) => { const a = x - w / 2 - 3, b = x + w / 2 + 3; return !row.some(([l, r]) => a < r && b > l); };
        const take = (row, x, w) => { row.push([x - w / 2 - 3, x + w / 2 + 3]); };
        const pill = (s, x, y, o = {}) => {
          const w = mw(c, s, fs, 700) + 16, px = clamp(x, w / 2 + 3, g.W - w / 2 - 3), unk = s === '?';
          rrect(c, px - w / 2, y - 11, w, 22, 11); c.fillStyle = o.soft ? alpha(pal.yellow, .16) : pal.stage; c.fill();
          c.strokeStyle = o.soft ? pal.yellow : pal.brass; c.lineWidth = unk ? 1.8 : 1.6; c.setLineDash(unk ? [4, 3] : []); c.stroke(); c.setLineDash([]);
          T(c, p, s, px, y, { size: fs, weight: 700, halo: false, color: pal.text });
          return w;
        };
        const topTxt = mode === 'pct' && !full && pos !== 0 && pos !== 100 ? '?' : pc(pos);
        const aMark = mode === 'pct' || full || pos === 0 || (mode !== 'whole' && pos === 100) || (mode === 'whole' && Math.abs(pos - Pr.p) < 1e-9);
        const botTxt = aMark ? U.A(pos * W / 100) : '?';
        const wT = mw(c, topTxt, fs, 700) + 16, wB = mw(c, botTxt, fs, 700) + 16, mx = X(pos);
        take(occ.top, clamp(mx, wT / 2 + 3, g.W - wT / 2 - 3), wT); take(occ.bot, clamp(mx, wB / 2 + 3, g.W - wB / 2 - 3), wB);
        const showKnown = mode === 'whole' && Math.abs(pos - Pr.p) > 1e-6;
        let wKT = 0, wKB = 0;
        if (showKnown) {
          const sT = pc(Pr.p), sB = U.A(Pr.part); wKT = mw(c, sT, fs, 700) + 16; wKB = mw(c, sB, fs, 700) + 16;
          take(occ.top, X(Pr.p), wKT); take(occ.bot, X(Pr.p), wKB);
        }
        let endT = '', endB = '';
        if (st.ext > .05) { endT = pc(100 + st.ext); take(occ.top, X(100 + st.ext), mw(c, endT, fs, 700) + 16); if (stg >= 4 || st.show) { endB = U.A(Pr.res); take(occ.bot, X(100 + st.ext), mw(c, endB, fs, 700) + 16); } }
        const ticks = n === 0 ? [0, 100] : n === 100 ? [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] : Array.from({ length: n + 1 }, (_, i) => i * 100 / n);
        const prio = ticks.slice().sort((a, b) => (b === 0 || b === 100 ? 1 : 0) - (a === 0 || a === 100 ? 1 : 0));
        for (const t of ticks) { line(c, X(t), top, X(t), top - 7, pal['grid-strong'], 1.5); line(c, X(t), bot, X(t), bot + 7, pal['grid-strong'], 1.5); }
        c.font = font(fs - 1, 600);
        for (const t of prio) {
          const x = X(t);
          if (tKnown(t)) { const s = pc(t), w = mw(c, s, fs - 1); if (free(occ.top, x, w)) { take(occ.top, x, w); T(c, p, s, x, yTop, { size: fs - 1, color: pal.muted, halo: false }); } }
          if (aKnown(t)) { const s = U.S(t * W / 100), w = mw(c, s, fs - 1); if (free(occ.bot, x, w)) { take(occ.bot, x, w); T(c, p, s, x, yBot, { size: fs - 1, color: pal.muted, halo: false }); } }
        }
        if (endT) T(c, p, endT, X(100 + st.ext), yTop, { size: fs - 1, color: pal.text, halo: false });
        if (endB) T(c, p, endB, X(100 + st.ext), yBot, { size: fs - 1, color: pal.text, halo: false });
        if (showKnown) {
          line(c, X(Pr.p), top - 5, X(Pr.p), bot + 5, alpha(pal.yellow, .9), 2, [4, 3]);
          pill(pc(Pr.p), X(Pr.p), yTop, { soft: true }); pill(U.A(Pr.part), X(Pr.p), yBot, { soft: true });
        }
        /* axis names */
        T(c, p, 'percent', g.x0, g.cap, { size: fs - 2, align: 'left', color: pal.muted, halo: false, weight: 700 });
        T(c, p, U.word, g.x0, g.capBot, { size: fs - 2, align: 'left', color: pal.muted, halo: false, weight: 700 });

        /* the marker */
        c.globalAlpha = st.stage === 0 ? .55 : 1;
        line(c, mx, top - 12, mx, bot + 12, pal.brass, 2.6);
        pill(topTxt, mx, yTop); pill(botTxt, mx, yBot);
        c.beginPath(); c.arc(mx, mid, 11, 0, Math.PI * 2); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.brass; c.lineWidth = 3.4; c.stroke();
        c.globalAlpha = 1;

        /* one piece, under the bar */
        if (n > 0) {
          const k = piecesCovered(mode, Pr, n), x1p = X(100 / n), by = g.brk;
          line(c, g.x0, by, x1p, by, pal.muted, 1.8); line(c, g.x0, by - 6, g.x0, by, pal.muted, 1.8); line(c, x1p, by - 6, x1p, by, pal.muted, 1.8);
          const piece = mode === 'whole' ? Pr.part / k : W / n;
          let s;
          if (mode === 'part') s = `1 piece = ${pc(100 / n)} = ${U.A(piece)}`;
          else if (mode === 'pct') s = `1 piece = ${U.A(piece)}` + (full ? ` = ${pc(100 / n)}` : ' = ?%');
          else s = `1 piece = ${pc(100 / n)}` + (stg >= 2 || full ? ` = ${U.A(piece)}` : ' = ?');
          T(c, p, s, g.x0, g.brkLab, { size: fs, align: 'left', halo: false });
        }

        /* table of equivalent ratios */
        const cols = [];
        const push = col => { const d = cols.find(q => Math.abs(q.pct - col.pct) < 1e-9); if (d) { d.pk = d.pk || col.pk; d.ak = d.ak || col.ak; } else cols.push(col); };
        if (mode === 'part') { push({ pct: 100, amt: W, pk: true, ak: true }); if (n) push({ pct: 100 / n, amt: W / n, pk: true, ak: true }); push({ pct: Pr.p, amt: Pr.part, pk: true, ak: full }); }
        else if (mode === 'pct') { push({ pct: 100, amt: W, pk: true, ak: true }); if (n) push({ pct: 100 / n, amt: W / n, pk: full, ak: true }); push({ pct: Pr.p, amt: Pr.part, pk: full, ak: true }); }
        else { push({ pct: Pr.p, amt: Pr.part, pk: true, ak: true }); if (n) push({ pct: 100 / n, amt: W / n, pk: true, ak: stg >= 2 || full }); push({ pct: 100, amt: W, pk: true, ak: full }); }
        cols.sort((a, b) => a.pct - b.pct);
        const hw = Math.max(mw(c, 'percent', fs - 1, 600), mw(c, U.word, fs - 1, 600)) + 14, cw = Math.min(84, (tw - hw) / Math.max(cols.length, 3)), ty = g.tbl, rh = 28 * g.u;
        T(c, p, 'Table of equivalent ratios', g.x0, ty - 10 * g.u, { size: fs - 2, align: 'left', color: pal.muted, halo: false, weight: 700 });
        T(c, p, 'percent', g.x0, ty + rh * .5 + 2, { size: fs - 1, align: 'left', halo: false, weight: 600, color: pal.muted });
        T(c, p, U.word, g.x0, ty + rh * 1.5 + 2, { size: fs - 1, align: 'left', halo: false, weight: 600, color: pal.muted });
        line(c, g.x0 + hw - 6, ty + 2, g.x0 + hw - 6, ty + rh * 2 + 2, pal['grid-strong'], 1.2);
        line(c, g.x0, ty + rh + 2, g.x0 + hw + cw * cols.length, ty + rh + 2, pal['grid-strong'], 1.2);
        cols.forEach((q, i) => {
          const x = g.x0 + hw + cw * (i + .5), cells = [[q.pk, pc(q.pct)], [q.ak, U.S(q.amt)]];
          cells.forEach(([k, s], r) => {
            const y = ty + rh * (r + .5) + 2;
            if (k) T(c, p, s, x, y, { size: fs, halo: false }); else {
              rrect(c, x - 14, y - 10, 28, 20, 6); c.setLineDash([3, 3]); c.strokeStyle = pal.yellow; c.lineWidth = 1.6; c.stroke(); c.setLineDash([]);
              T(c, p, '?', x, y, { size: fs, halo: false });
            }
          });
        });
      };

      /* ---------- drawing: fractions, decimals and percents ---------- */
      const drawConv = (c, p, g) => {
        const pal = p.pal, tw = g.x1 - g.x0, X = v => g.x0 + clamp(v, 0, 200) / 200 * tw, fs = g.fs, top = g.tapeTop, bot = g.tapeBot, mid = (top + bot) / 2;
        const tk = task(), info = cinfo(), pos = st.pos, solved = !tk || st.cvDone, d = tk ? (tk.given.kind === 'frac' ? tk.given.d : 0) : (st.src === 'frac' ? st.d : 0);
        T(c, p, tk ? 'Practice' : 'Fractions, decimals, percents', g.x0, g.title, { size: fs + 2, align: 'left', weight: 700, halo: false });
        T(c, p, tk ? tk.q : 'One number, three names. The whole is 100%.', g.x0, g.given, { size: fs, align: 'left', color: pal.muted, halo: false });
        /* bar from 0% to 200%, with the whole marked */
        c.save(); rrect(c, g.x0, top, tw, bot - top, 6); c.clip();
        c.fillStyle = alpha(pal.blue, .14); c.fillRect(g.x0, top, X(100) - g.x0, bot - top);
        c.fillStyle = alpha(pal.blue, .05); c.fillRect(X(100), top, X(200) - X(100), bot - top);
        if (pos > 0) { c.fillStyle = alpha(pal.yellow, .55); c.fillRect(g.x0, top, X(pos) - g.x0, bot - top); }
        if (d) for (let i = 1; i < 2 * d; i++) line(c, X(i * 100 / d), top, X(i * 100 / d), bot, alpha(pal.blue, .75), 1.6);
        else for (let i = 1; i < 20; i++) line(c, X(i * 10), top, X(i * 10), bot, alpha(pal.blue, .22), 1);
        c.restore();
        line(c, X(100), top - 8, X(100), bot + 8, pal.blue, 2.4);
        rrect(c, g.x0, top, tw, bot - top, 6); c.strokeStyle = pal.blue; c.lineWidth = 2.2; c.stroke();
        const occ = { top: [], bot: [] }, free = (row, x, w) => { const a = x - w / 2 - 3, b = x + w / 2 + 3; return !row.some(([l, r]) => a < r && b > l); }, take = (row, x, w) => { row.push([x - w / 2 - 3, x + w / 2 + 3]); };
        const pill = (s, x, y, soft) => {
          const w = mw(c, s, fs, 700) + 16, px = clamp(x, w / 2 + 3, g.W - w / 2 - 3), unk = s === '?';
          rrect(c, px - w / 2, y - 11, w, 22, 11); c.fillStyle = pal.stage; c.fill();
          c.strokeStyle = soft ? pal.muted : pal.brass; c.lineWidth = 1.6; c.setLineDash(unk ? [4, 3] : []); c.stroke(); c.setLineDash([]);
          T(c, p, s, px, y, { size: fs, weight: 700, halo: false });
          return [px - w / 2, px + w / 2];
        };
        const known = k => solved || (tk && tk.given.kind === k);
        const pT = known('pct') ? info.pctT : '?', dT = known('dec') ? info.decT : '?', fT = known('frac') ? (info.src === 'frac' && !task() ? `${info.num}/${info.den}` : info.frac) : '?';
        const mx = X(pos), wP = mw(c, pT, fs, 700) + 16, wD = mw(c, dT, fs, 700) + 16;
        take(occ.top, clamp(mx, wP / 2 + 3, g.W - wP / 2 - 3), wP); take(occ.bot, clamp(mx, wD / 2 + 3, g.W - wD / 2 - 3), wD);
        for (let t = 0; t <= 200; t += 20) {
          const x = X(t), a = pc(t), b = nfmt(t / 100, 1);
          line(c, x, top, x, top - 6, pal['grid-strong'], 1.4); line(c, x, bot, x, bot + 6, pal['grid-strong'], 1.4);
          const wa = mw(c, a, fs - 1), wb = mw(c, b, fs - 1);
          if (free(occ.top, x, wa)) { take(occ.top, x, wa); T(c, p, a, x, g.labTop, { size: fs - 1, color: pal.muted, halo: false }); }
          if (free(occ.bot, x, wb)) { take(occ.bot, x, wb); T(c, p, b, x, g.labBot, { size: fs - 1, color: pal.muted, halo: false }); }
        }
        if (st.ghost) {
          const gv = st.ghost.v, off = gv > 200, gx = X(gv), col = st.ghost.ok ? pal.green : pal.red;
          if (off) { c.beginPath(); c.moveTo(g.x1 - 2, mid - 9); c.lineTo(g.x1 + 6, mid); c.lineTo(g.x1 - 2, mid + 9); c.closePath(); c.fillStyle = col; c.fill(); }
          else { line(c, gx, top - 10, gx, bot + 10, col, 2.4, [5, 3]); c.beginPath(); c.arc(gx, mid, 9, 0, Math.PI * 2); c.strokeStyle = col; c.lineWidth = 2.6; c.setLineDash([4, 3]); c.stroke(); c.setLineDash([]); }
          const s = off ? st.ghost.s + ' (off the bar)' : st.ghost.s, w = mw(c, s, fs, 700) + 14;
          rrect(c, clamp(gx, w / 2 + 8, g.W - w / 2 - 8) - w / 2, g.cap - 11, w, 22, 11); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = col; c.lineWidth = 1.6; c.stroke();
          T(c, p, s, clamp(gx, w / 2 + 8, g.W - w / 2 - 8), g.cap, { size: fs, weight: 700, halo: false, color: col });
        }
        line(c, mx, top - 12, mx, bot + 12, pal.brass, 2.6);
        pill(pT, mx, g.labTop); pill(dT, mx, g.labBot);
        if (!st.ghost) pill(fT, mx, g.cap, false);
        c.beginPath(); c.arc(mx, mid, 11, 0, Math.PI * 2); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.brass; c.lineWidth = 3.4; c.stroke();
        c.globalAlpha = 1;
        /* hundred grid(s) */
        const two = pos > 100, availH = g.H - g.gridTop - 30, gap = 18;
        const size = two ? Math.min((tw - gap) / 2, availH) : Math.min(tw, availH, 330);
        if (size > 40) {
          const totalW = two ? size * 2 + gap : size, gx0 = (g.W - totalW) / 2, gy0 = g.gridTop + 2, cs = size / 10;
          const grid = (ox, v) => {
            for (let i = 0; i < 100; i++) {
              const x = ox + (i % 10) * cs, y = gy0 + Math.floor(i / 10) * cs, f = clamp(v - i, 0, 1);
              c.fillStyle = alpha(pal.blue, .08); c.fillRect(x + .5, y + .5, cs - 1, cs - 1);
              if (f > 0) { c.fillStyle = alpha(pal.yellow, .7); c.fillRect(x + .5, y + .5, (cs - 1) * f, cs - 1); }
            }
            c.strokeStyle = alpha(pal.blue, .55); c.lineWidth = 1;
            c.beginPath(); for (let i = 0; i <= 10; i++) { c.moveTo(ox + i * cs, gy0); c.lineTo(ox + i * cs, gy0 + size); c.moveTo(ox, gy0 + i * cs); c.lineTo(ox + size, gy0 + i * cs); } c.stroke();
            c.strokeStyle = pal.blue; c.lineWidth = 2; c.strokeRect(ox, gy0, size, size);
          };
          grid(gx0, Math.min(pos, 100));
          if (two) grid(gx0 + size + gap, pos - 100);
          const cap = two ? `${nfmt(pos, 2)} squares in all: 100 + ${nfmt(pos - 100, 2)}` : `${nfmt(pos, 2)} of the 100 squares`;
          T(c, p, cap, g.W / 2, gy0 + size + 16, { size: fs, color: pal.muted, halo: false });
        }
      };

      P.onDraw = (c, p) => {
        const g = lay();
        c.save(); c.translate(0, g.sh);
        if (g.conv) drawConv(c, p, g); else drawTape(c, p, g);
        c.restore();
      };
      const draw = () => P.draw();

      /* ---------- the marker: dragging, arrow buttons and keys ---------- */
      const canDrag = () => st.mode === 'conv' ? st.task < 0 : st.stage === 1 || st.stage === 5;
      const stepOf = () => {
        if (st.mode === 'conv') return 1;
        if (st.stage === 5) return st.cut ? 100 / st.cut : 5;
        const Pr = prob();
        if (st.mode === 'part') return Pr.snap;
        if (st.mode === 'pct') return Pr.snap * 100 / Pr.W;
        return st.cut === 100 ? 10 : st.cut ? 100 / st.cut : 5;
      };
      const snapPos = v => {
        if (st.mode === 'conv') return clamp(snap(v, 1), 0, 200);
        if (st.mode === 'pct' && st.stage !== 5) { const Pr = prob(); return clamp(Math.round(v * Pr.W / 100 / Pr.snap) * Pr.snap * 100 / Pr.W, 0, 100); }
        return clamp(snap(v, stepOf()), 0, 100);
      };
      const setPos = v => {
        const nv = snapPos(v);
        if (st.mode === 'conv') { st.src = 'pct'; st.pos = nv; cvSync(); updateRo(); draw(); return; }
        st.pos = nv; draw(); updateLive();
      };
      const fromPx = px => { const g = lay(); return (px - g.x0) / (g.x1 - g.x0) * (st.mode === 'conv' ? 200 : 100 + st.ext); };
      const place = () => {
        if (st.stage !== 1) return;
        const t = tgt(), Pr = prob(), A = UNITS[Pr.u].A;
        if (Math.abs(st.pos - t) < 1e-6) {
          const n = st.cut, k = n ? piecesCovered(st.mode, Pr, n) : 0, pl = k === 1 ? 'piece' : 'pieces';
          let s;
          if (st.mode === 'part') {
            s = `${ok('Yes.')} The marker is at ${pc(Pr.p)} on the top line.` + (n && n < 100 ? (isInt(k) ? ` That is ${nfmt(k)} ${pl} from the left end, right on a cut.` : ` That is ${nfmt(k)} pieces from the left end, in the middle of a piece.`) : n === 100 ? ` That is ${Pr.p} of the 1% pieces.` : '');
          } else if (st.mode === 'pct') {
            s = `${ok('Yes.')} The marker is at ${A(Pr.part)} on the bottom line.` + (n && n < 100 ? (isInt(k) ? ` That is ${nfmt(k)} ${pl} of ${A(Pr.W / n)}.` : ` That is ${nfmt(k)} pieces of ${A(Pr.W / n)}.`) : '');
          } else {
            s = `${ok('Yes.')} The marker is at 100%, the end of the bar.` + (n ? ` The bar has ${n} equal pieces, and one piece is ${A(Pr.part / k)}.` : '');
          }
          st.stage = 2; st.fb = s;
          render(); draw();
        } else {
          const dir = st.pos < t ? 'right' : 'left';
          let s = st.mode === 'part' ? `The marker is at ${pc(st.pos)}. You need ${pc(Pr.p)}, so move it to the ${dir}.`
            : st.mode === 'pct' ? `The marker is at ${A(st.pos * Pr.W / 100)}, but the part is ${A(Pr.part)}. Move it to the ${dir}.`
            : `The marker is at ${pc(st.pos)}. The whole bar ends at 100%, so keep going to the ${dir}.`;
          if (st.mode === 'part' && st.cut > 0 && st.cut < 100) s += ` Each piece is ${pc(100 / st.cut)}, so ${pc(Pr.p)} is ${nfmt(piecesCovered('part', Pr, st.cut))} pieces from the left end.`;
          st.fb = s; fbEl && (fbEl.innerHTML = s);
        }
      };
      let drag = false;
      const ptr = e => { const r = cvEl.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      const inBand = (px, py) => { const g = lay(), y = py - g.sh; return y > g.tapeTop - 56 && y < g.tapeBot + 56; };
      cvEl.addEventListener('pointerdown', e => {
        const [px, py] = ptr(e);
        if (!canDrag() || !inBand(px, py)) return;
        drag = true; cvEl.setPointerCapture(e.pointerId); e.preventDefault(); cancel(); setPos(fromPx(px));
      });
      cvEl.addEventListener('pointermove', e => {
        const [px, py] = ptr(e);
        if (drag) setPos(fromPx(px)); else cvEl.style.cursor = canDrag() && inBand(px, py) ? 'grab' : 'default';
      });
      const endDrag = () => { if (!drag) return; drag = false; place(); };
      cvEl.addEventListener('pointerup', endDrag);
      cvEl.addEventListener('pointercancel', () => { drag = false; });
      const nudge = dir => { if (!canDrag()) return; cancel(); setPos(st.pos + dir * stepOf()); place(); };
      cvEl.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); nudge(-1); }
        else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); nudge(1); }
      });

      /* ---------- the side panel ---------- */
      const probe = C.readout(), host = probe.parentElement; probe.remove();
      let fbEl = null;
      const group = () => { const g = h('div', { style: 'display:flex;flex-direction:column;gap:16px;flex:none' }); host.append(g); return g; };
      const mkSlider = (parent, { label, min, max, step, value, onInput }) => {
        const id = 'pcs' + Math.random().toString(36).slice(2, 8), out = h('output', { for: id }), inp = h('input', { type: 'range', id, min, max, step, value });
        const upd = text => { out.textContent = text; inp.style.setProperty('--p', ((+inp.value - +inp.min) / (+inp.max - +inp.min) * 100) + '%'); };
        inp.addEventListener('input', () => { onInput(+inp.value); });
        parent.append(h('div', { class: 'ctl slider' }, h('label', { for: id }, label), out, inp));
        return { wrap: parent.lastElementChild, set(v, text) { inp.value = v; upd(text); }, setMax(m) { inp.max = m; }, get: () => +inp.value };
      };
      const mkSelect = (parent, label, onChange) => {
        const id = 'pcl' + Math.random().toString(36).slice(2, 8), sel = h('select', { id });
        sel.addEventListener('change', () => onChange(sel.value));
        parent.append(h('div', { class: 'ctl select' }, h('label', { for: id }, label), sel));
        return sel;
      };
      const fillSel = (sel, items, value) => { sel.replaceChildren(...items.map((t, i) => h('option', { value: String(i) }, t))); sel.value = String(value); };

      C.title('Choose a job');
      modeBtns = C.buttons(MODES.map(m => ({ label: m.name, onClick: () => setMode(m.id) })));
      for (const b of modeBtns) Object.assign(b.style, { padding: '6px 14px', minHeight: '36px', fontSize: '.88rem' });
      gTape = group();
      probSel = mkSelect(gTape, 'Problem', v => { cancel(); startProblem(st.mode, +v); });
      gConv = group();
      taskSel = mkSelect(gConv, 'Practice', v => { cancel(); startConvTask(+v - 1); });
      numSl = mkSlider(gConv, { label: 'Top number (numerator)', min: 0, max: 16, step: 1, value: 3, onInput: v => { cancel(); st.src = 'frac'; st.n = Math.min(v, 2 * st.d); st.pos = 100 * st.n / st.d; cvSync(); updateRo(); draw(); } });
      denSel = mkSelect(gConv, 'Bottom number (denominator)', v => { cancel(); st.src = 'frac'; st.d = DENS[+v]; st.n = Math.min(st.n, 2 * st.d); st.pos = 100 * st.n / st.d; cvSync(); updateRo(); draw(); });
      fillSel(denSel, DENS.map(String), DENS.indexOf(8));
      decSl = mkSlider(gConv, { label: 'Decimal', min: 0, max: 2, step: .01, value: .375, onInput: v => { cancel(); st.src = 'dec'; st.pos = Math.round(v * 100); cvSync(); updateRo(); draw(); } });
      pctSl = mkSlider(gConv, { label: 'Percent', min: 0, max: 200, step: 1, value: 37.5, onInput: v => { cancel(); st.src = 'pct'; st.pos = v; cvSync(); updateRo(); draw(); } });
      freeCtl = [numSl.wrap, denSel.parentElement, decSl.wrap, pctSl.wrap];
      ro = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); host.append(ro);

      const cvSync = () => {
        const tk = task();
        if (tk) return;
        const info = cinfo();
        if (st.src !== 'frac' && DENS.includes(info.rd) && info.rn <= 2 * info.rd) { st.n = info.rn; st.d = info.rd; }
        numSl.setMax(2 * st.d); numSl.set(st.n, String(st.n)); denSel.value = String(DENS.indexOf(st.d));
        decSl.set(st.pos / 100, nfmt(st.pos / 100, 3)); pctSl.set(st.pos, nfmt(st.pos, 1));
      };

      /* ---------- problems: starting, moves, answers ---------- */
      const startProblem = (mode, pi) => {
        Object.assign(st, { mode, pi, stage: 0, cut: 0, ext: 0, ans: false, show: false, fb: '', picks: {}, task: -1, ghost: null, cvDone: false });
        st.pos = mode === 'whole' ? prob().p : 0;
        sync();
      };
      const startConv = () => {
        Object.assign(st, { mode: 'conv', pi: 0, stage: 0, cut: 0, ext: 0, ans: false, show: false, fb: '', picks: {}, task: -1, ghost: null, cvDone: false, src: 'frac', n: 3, d: 8, pos: 37.5 });
        sync();
      };
      const startConvTask = i => {
        if (i < 0) return startConv();
        const tk = TASKS[i], g = tk.given;
        Object.assign(st, { mode: 'conv', task: i, ghost: null, cvDone: false, fb: '', picks: {} });
        if (g.kind === 'frac') { st.src = 'frac'; st.n = g.n; st.d = g.d; st.pos = 100 * g.n / g.d; } else { st.src = g.kind; st.pos = g.v; }
        sync();
      };
      const setMode = m => { cancel(); if (m === 'conv') startConv(); else startProblem(m, 0); };

      const pickMove = key => {
        const Pr = prob(), mv = MOVE(st.mode, Pr, key);
        if (mv.kind === 'bad') { st.picks['m' + key] = 'wrong'; st.fb = mv.text; }
        else { st.picks['m' + key] = 'right'; st.cut = mv.cut; st.stage = 1; st.fb = mv.text; if (st.mode === 'whole') st.pos = Pr.p; }
        render(); draw();
      };
      const pickAnswer = (stg, key) => {
        const Pr = prob(), items = (stg === 2 ? ansItems() : finItems()), it = items.find(x => x.key === key);
        if (!it.right) { st.picks[`a${stg}${key}`] = 'wrong'; st.fb = it.why; render(); return; }
        st.picks[`a${stg}${key}`] = 'right'; st.fb = it.why;
        if (stg === 2) {
          st.ans = true;
          if (Pr.fin) { st.stage = 3; if (Pr.fin.op === '+') { cancel(); cancel = animateTo(st, { ext: Pr.p }, 700, draw); } } else st.stage = 4;
        } else st.stage = 4;
        render(); draw();
      };
      const ansItems = () => shuffled(ANSWERS(st.mode, prob()), MODES.findIndex(m => m.id === st.mode) * 2 + st.pi);
      const finItems = () => shuffled(FINALS(prob()), MODES.findIndex(m => m.id === st.mode) + st.pi * 2 + 1);

      const choiceList = items => h('div', { style: 'display:flex;flex-direction:column;gap:8px;margin:10px 0 4px' }, items.map(it => {
        const b = h('button', { type: 'button', class: 'choice' + (it.state ? ' ' + it.state : ''), html: it.label, onclick: it.onClick });
        Object.assign(b.style, { borderRadius: '12px', textAlign: 'left', width: '100%' }); b.disabled = !!it.state; return b;
      }));
      const smallBtn = (label, onClick, primary) => {
        const b = h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
        Object.assign(b.style, { padding: '6px 14px', minHeight: '36px', fontSize: '.88rem' }); return b;
      };
      const para = (html, style = '') => h('p', { html, style: 'margin:0 0 8px;' + style });

      /* the worked example shown by the guided steps */
      const demoLines = () => {
        const Pr = prob(), mode = st.mode, U = UNITS[Pr.u], A = U.A, n = st.cut, { W, p, part } = Pr, L = [];
        const k = n ? piecesCovered(mode, Pr, n) : 0, piece = mode === 'whole' ? (k ? part / k : 0) : W / (n || 1);
        if (mode === 'part') {
          L.push(kk('Whole', `${A(W)} = 100%`));
          L.push(kk('Cut', `${n} equal pieces. Each piece: 100% ÷ ${n} = ${pc(100 / n)} and ${A(W)} ÷ ${n} = ${A(piece)}`));
          L.push(kk('Part', `${pc(p)} of ${A(W)} = ${A(part)}`));
        } else if (mode === 'pct') {
          L.push(kk('Whole', `${A(W)} = 100%`));
          L.push(kk('Cut', `${n} equal pieces. Each piece: ${A(W)} ÷ ${n} = ${A(piece)} and 100% ÷ ${n} = ${pc(100 / n)}`));
          L.push(kk('Part', `${A(part)} is ${plural(k, 'piece')}, so it is ${pc(p)} of ${A(W)}`));
        } else {
          L.push(kk('Known', `${pc(p)} of the whole is ${A(part)}`));
          L.push(kk('Cut', `${n} equal pieces. Each piece: 100% ÷ ${n} = ${pc(100 / n)}. ${pc(p)} is ${plural(k, 'piece')}, so 1 piece = ${A(piece)}`));
          L.push(kk('Whole', `${n} × ${A(piece)} = ${A(W)}`));
        }
        if (Pr.fin) L.push(kk(Pr.fin.what, `${A(W)} ${Pr.fin.op === '-' ? MINUS : '+'} ${A(part)} = ${A(Pr.res)}`));
        return L;
      };
      const updateLive = () => { if (liveEl) liveEl.innerHTML = kk('Marker', `${pc(st.pos)} ↔ ${UNITS[prob().u].A(st.pos * prob().W / 100)}`); };

      const renderTape = () => {
        const Pr = prob(), mode = st.mode, A = UNITS[Pr.u].A, total = Pr.fin ? 4 : 3, out = [];
        liveEl = null; fbEl = null;
        out.push(para(`<b>${Pr.q}</b>`));
        if (st.stage === 5) {
          out.push(para('<span class="k">Worked example</span>'));
          out.push(para(demoLines().join('<br>')));
          liveEl = h('p', { style: 'margin:0 0 10px;' }); out.push(liveEl); updateLive();
          out.push(smallBtn('Try it yourself', () => { cancel(); startProblem(mode, st.pi); }, true));
          return out;
        }
        const stepNo = Math.min(st.stage, 3) + 1;
        if (st.stage === 0) {
          out.push(para(`<span class="k">Step 1 of ${total}</span> Pick a move. ` + (mode === 'part' ? `Which move helps you find ${pc(Pr.p)} of ${A(Pr.W)}?` : mode === 'pct' ? `Which move helps you find what percent ${A(Pr.part)} is of ${A(Pr.W)}?` : `${pc(Pr.p)} of the bar is ${A(Pr.part)}, and the whole bar is 100%. Which move helps you find the whole?`)));
          out.push(choiceList(Pr.moves.map(key => { const mv = MOVE(mode, Pr, key); return { label: mv.label, state: st.picks['m' + key], onClick: () => pickMove(key) }; })));
        } else if (st.stage === 1) {
          const step = stepOf(), lbl = mode === 'part' ? pc(step) : mode === 'pct' ? A(step * Pr.W / 100) : st.cut === 100 ? '10 pieces' : '1 piece';
          out.push(para(`<span class="k">Step 2 of ${total}</span> Place the marker. ` + (mode === 'part' ? `Drag the marker on the bar to ${pc(Pr.p)}. It moves ${pc(step)} at a time.`
            : mode === 'pct' ? `Drag the marker on the bar to ${A(Pr.part)}. Read the bottom line. It moves ${A(step * Pr.W / 100)} at a time.`
            : `Drag the marker along the bar to 100%, the end. ` + (st.cut === 100 ? 'It moves 10 pieces (10%) at a time.' : 'It moves one piece at a time.'))));
          const row = h('div', { style: 'display:flex;gap:8px;margin:6px 0' }, smallBtn('◀ ' + lbl, () => nudge(-1)), smallBtn(lbl + ' ▶', () => nudge(1)));
          out.push(row);
        } else if (st.stage === 2 || st.stage === 3) {
          const fin = st.stage === 3, items = fin ? finItems() : ansItems();
          out.push(para(`<span class="k">Step ${stepNo} of ${total}</span> ` + (fin ? Pr.fin.ask : mode === 'part' ? `How much is ${pc(Pr.p)} of ${A(Pr.W)}?` : mode === 'pct' ? `What percent of ${A(Pr.W)} is ${A(Pr.part)}?` : Pr.ask)));
          out.push(choiceList(items.map(it => ({ label: it.label, state: st.picks[`a${st.stage}${it.key}`], onClick: () => pickAnswer(st.stage, it.key) }))));
        } else {
          out.push(para(`<span class="k">Done</span> Problem ${st.pi + 1} of ${PR[mode].length}`));
        }
        fbEl = h('p', { style: 'margin:6px 0 10px;', html: st.fb }); out.push(fbEl);
        if (st.stage === 4) out.push(h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' }, smallBtn('Next problem', () => { cancel(); startProblem(mode, (st.pi + 1) % PR[mode].length); }, true), smallBtn('Do this one again', () => { cancel(); startProblem(mode, st.pi); })));
        else if (st.stage > 0 || Object.keys(st.picks).length) out.push(smallBtn('Start this problem over', () => { cancel(); startProblem(mode, st.pi); }));
        return out;
      };

      const renderConv = () => {
        const tk = task(), info = cinfo(), out = [];
        liveEl = null; fbEl = null;
        if (!tk) {
          const pos = st.pos, same = info.src === 'frac';
          const L = [];
          if (info.src === 'frac') {
            L.push(kk('Fraction', `${info.num}/${info.den}${info.rd !== info.den ? ` = ${info.frac}` : ''}`));
            L.push(kk('Divide', `${info.num} ÷ ${info.den} = ${info.decT}${info.term ? '' : ' (the digits never stop)'}`));
            L.push(kk('Decimal', info.decT));
            L.push(kk('Percent', `${info.decT} × 100 = ${info.pctT}`));
          } else if (info.src === 'dec') {
            L.push(kk('Decimal', nfmt(pos / 100, 3)));
            L.push(kk('Percent', `${nfmt(pos / 100, 3)} × 100 = ${pcx(pos)}`));
            L.push(kk('Fraction', `${nfmt(pos / 100, 3)} = ${pos}/100${info.rd !== 100 ? ` = ${info.frac}` : ''}`));
          } else {
            L.push(kk('Percent', pcx(pos)));
            L.push(kk('Decimal', `${pos} ÷ 100 = ${nfmt(pos / 100, 3)}`));
            L.push(kk('Fraction', `${pos}/100${info.rd !== 100 ? ` = ${info.frac}` : ''}`));
          }
          if (pos > 100) L.push(`More than 1 whole.${info.rd !== 1 ? ` As a mixed number: ${info.mixed || info.frac}.` : ''}`);
          else if (same && !info.term) L.push(`Rounded, that is about ${nfmt(info.v, 3)} and ${nfmt(info.v * 100, 1)}%.`);
          out.push(h('p', { style: 'margin:0 0 8px;', html: L.join('<br>') }));
          out.push(h('p', { style: 'margin:0;color:var(--muted)', html: 'Set a fraction, a decimal or a percent, or drag the marker. Try the practice questions for a challenge.' }));
          return out;
        }
        out.push(h('p', { style: 'margin:0 0 8px;font-weight:600', html: tk.q }));
        out.push(h('p', { style: 'margin:0', html: `<span class="k">Pick the answer.</span> Each pick shows where it lands on the bar.` }));
        out.push(choiceList(tk.choices.map((ch, i) => ({ label: ch[0], state: st.picks['t' + i], onClick: () => pickTask(i) }))));
        fbEl = h('p', { style: 'margin:6px 0 10px;', html: st.fb }); out.push(fbEl);
        if (st.cvDone) out.push(smallBtn('Next question', () => { cancel(); const nx = (st.task + 1) % TASKS.length; taskSel.value = String(nx + 1); startConvTask(nx); }, true));
        return out;
      };
      const pickTask = i => {
        const tk = task(), ch = tk.choices[i], right = i === tk.right;
        st.picks['t' + i] = right ? 'right' : 'wrong';
        st.ghost = right ? null : { v: ch[1], s: ch[0], ok: false };
        st.fb = (right ? ok('Right.') : no('Not quite.')) + ' ' + ch[2];
        if (right) st.cvDone = true;
        render(); draw();
      };

      const updateRo = () => { if (st.mode === 'conv') render(); };
      const render = () => { ro.replaceChildren(...(st.mode === 'conv' ? renderConv() : renderTape())); };
      const sync = () => {
        modeBtns.forEach((b, i) => { b.className = MODES[i].id === st.mode ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', MODES[i].id === st.mode); });
        const conv = st.mode === 'conv';
        gTape.style.display = conv ? 'none' : 'flex'; gConv.style.display = conv ? 'flex' : 'none';
        if (conv) {
          fillSel(taskSel, ['Free play', ...TASKS.map(t => t.label)], st.task + 1);
          const free = st.task < 0;
          for (const el of freeCtl) el.style.display = free ? '' : 'none';
          if (free) cvSync();
        } else fillSel(probSel, PR[st.mode].map(q => q.label), st.pi);
        render(); draw();
      };

      /* ---------- guided steps ---------- */
      const apply = (patch, immediate) => {
        cancel();
        const { mode, pi, cut, show, src, n, d, task: tk, ...nums } = patch;
        if (mode === 'conv') {
          Object.assign(st, { mode: 'conv', pi: 0, stage: 0, cut: 0, ext: 0, ans: false, show: false, fb: '', picks: {}, task: tk === undefined ? -1 : tk, ghost: null, cvDone: false });
          if (src !== undefined) st.src = src;
          if (n !== undefined) st.n = n;
          if (d !== undefined) st.d = d;
        } else if (mode !== undefined) {
          Object.assign(st, { mode, pi: pi || 0, stage: show ? 5 : 0, cut: cut || 0, ans: !!show, show: !!show, fb: '', picks: {}, task: -1, ghost: null, cvDone: false });
        }
        const to = {};
        for (const k of ['pos', 'ext']) if (nums[k] !== undefined) to[k] = nums[k];
        if (immediate || !Object.keys(to).length) { Object.assign(st, to); sync(); }
        else { sync(); cancel = animateTo(st, to, 900, () => { if (st.mode === 'conv') cvSync(); draw(); if (st.stage === 5) updateLive(); }); }
      };
      sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
