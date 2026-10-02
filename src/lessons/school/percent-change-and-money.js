/* =====================================================================
   SCHOOL — Percent change and money
   ===================================================================== */
{
  /* ---------- numbers and words ---------- */
  const MINUS = '−';
  const r2 = v => Math.round(v * 100) / 100;
  const r3 = v => Math.round(v * 1000) / 1000;
  const grp = s => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const nfmt = (v, d = 2) => { const t = (+Math.abs(v).toFixed(d)).toString().split('.'); return (v < 0 ? MINUS : '') + grp(t[0]) + (t[1] ? '.' + t[1] : ''); };
  const money = v => { const t = Math.abs(r2(v)).toFixed(2).split('.'); return (v < 0 ? MINUS + '$' : '$') + grp(t[0]) + (t[1] === '00' ? '' : '.' + t[1]); };
  const moneyR = v => (v < 0 ? MINUS : '') + '$' + grp(Math.abs(r2(v)).toFixed(2));
  const pc = v => nfmt(v, 1) + '%';
  const mx = m => (Math.round(m * 1000) / 1000).toFixed(3).replace(/0$/, '');
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = (a, b) => `<span class="k">${a}</span> ${b}`;
  const NOUN = { markup: 'markup', markdown: 'markdown', discount: 'discount', tax: 'sales tax' };

  /* a choice: label, is it right, the explanation, and where a wrong pick would land (a "ghost" bar) */
  const I = (label, right, why, ghost) => ({ label, right, why, ghost });
  const mkItems = arr => arr.map((x, i) => ({ ...x, key: i }));
  /* put the right answer somewhere other than always first */
  const seat = (items, seed) => {
    const i = items.findIndex(x => x.right), rest = items.filter((_, j) => j !== i);
    rest.splice(seed % items.length, 0, items[i]);
    return rest;
  };

  /* ---------- rows for the tape diagram ---------- */
  /* a row that goes from `from` to `to`: blue for what stays, yellow for what is added, a dashed red piece for what is taken off */
  const moveSegs = (from, to) => to > from ? [{ a: 0, b: from, k: 'base' }, { a: from, b: to, k: 'add' }]
    : to < from ? [{ a: 0, b: to, k: 'base' }, { a: to, b: from, k: 'cut' }] : [{ a: 0, b: from, k: 'base' }];
  const moveBr = (from, to, t) => ({ a: Math.min(from, to), b: Math.max(from, to), k: to >= from ? 'add' : 'cut', t });
  const yearSegs = (P, i1, grow) => {
    const out = [];
    for (let y = 0; y < Math.ceil(grow - 1e-9); y++) {
      const f = clamp(grow - y, 0, 1);
      out.push({ a: P + y * i1, b: P + (y + f) * i1, k: 'add', alt: y % 2, t: `yr ${y + 1}`, t2: String(y + 1) });
    }
    return out;
  };

  /* =====================================================================
     JOB 1: mark up, mark down (a chain of percent changes)
     ===================================================================== */
  const CH = [
    { label: 'Markup, then markdown: a bike', title: 'Bike shop', start: 200, startName: 'Shop pays',
      q: 'A bike shop buys a bike for $200. It marks the price up by 20%. Later the bike goes on sale for 20% off the price on the tag. What does a customer pay?',
      steps: [{ c: 20, kind: 'markup', name: 'Markup', row: 'After the markup', ask: 'The shop marks the price up by 20%.' },
        { c: -20, kind: 'markdown', name: 'Sale', row: 'After the sale', ask: 'The bike goes on sale for 20% off the price on the tag.' }] },
    { label: 'Coupon, then sales tax: a jacket', title: 'Jacket', start: 50, startName: 'Tag price',
      q: 'A jacket has a $50 price tag. You have a coupon for 20% off. Then the register adds 8% sales tax to the price after the coupon. What do you pay?',
      steps: [{ c: -20, kind: 'discount', name: 'Coupon', row: 'After the coupon', ask: 'The coupon takes 20% off the tag price.' },
        { c: 8, kind: 'tax', name: 'Sales tax', row: 'After the tax', ask: 'The register adds 8% sales tax to the price after the coupon.' }] },
    { label: 'A markup you can undo: a console', title: 'Game console', start: 200, startName: 'Store pays',
      q: 'A store buys a game console for $200 and marks the price up by 25%. Later it takes 20% off the price on the tag. What does a customer pay?',
      steps: [{ c: 25, kind: 'markup', name: 'Markup', row: 'After the markup', ask: 'The store marks the price up by 25%.' },
        { c: -20, kind: 'markdown', name: 'Sale', row: 'After the sale', ask: 'The console goes on sale for 20% off the price on the tag.' }] }
  ];
  const chainOf = (d, swap) => {
    const s = swap ? d.steps.slice().reverse() : d.steps, pr = [d.start];
    for (const x of s) pr.push(r2(pr[pr.length - 1] * (100 + x.c) / 100));
    return { s, pr, M: r3(s.reduce((a, x) => a * (100 + x.c) / 100, 1)) };
  };
  const chainProb = d => {
    const base = chainOf(d, false), P0 = d.start, F = base.pr[2], M = base.M, s0 = base.s, pr0 = base.pr;
    const mult = x => r3(1 + x.c / 100);
    const stage = i => {
      if (i === 3) {
        const w = chainOf(d, true), mid = w.pr[1], m1 = mult(s0[0]), m2 = mult(s0[1]), first = w.s[0].name.toLowerCase();
        const walk = `With the ${first} first: ${money(P0)} → ${money(mid)} → ${money(w.pr[2])}.`;
        const ex = s0.some(x => x.kind === 'tax') ? ' Stores usually take the coupon first, because sales tax is figured on the price you really pay.' : '';
        return { ask: `What if the two steps happened in the OTHER order, with the ${first} first? How would the final price change?`, items: mkItems([
          { ...I('The final price is the same', true, `${ok('Right.')} ${walk} The middle price is different, but the final price is still ${money(F)}, because ${mx(m2)} × ${mx(m1)} = ${mx(m1)} × ${mx(m2)} = ${mx(M)}. Multiplying can be done in either order.${ex} The bars now show the other order.`), order: 1 },
          I('The final price is higher', false, `${no('Not quite.')} Try it. ${walk} The final price is ${money(F)} again, not higher.`),
          I('The final price is lower', false, `${no('Not quite.')} Try it. ${walk} The final price is ${money(F)} again, not lower.`)
        ]) };
      }
      if (i === 2) {
        const m1 = mult(s0[0]), m2 = mult(s0[1]), c1 = s0[0].c, c2 = s0[1].c, p2 = Math.abs(c2);
        const gh = v => ({ label: `If you picked this: ${money(P0 * v)}`, end: r2(P0 * v) });
        const addp = r3(1 + (c1 + c2) / 100), addm = r3(m1 + m2), sub = r3(Math.abs(m1 - m2));
        const tail = F < P0 ? `Each step used the price it started from, so the percents did not just add and subtract. ${mx(M)} is ${nfmt(M * 100, 1)}% of the start, so the final price is ${pc((1 - M) * 100)} LOWER than ${money(P0)}.`
          : F > P0 ? `Each step used the price it started from. ${mx(M)} is ${nfmt(M * 100, 1)}% of the start, so the final price is ${pc((M - 1) * 100)} HIGHER than ${money(P0)}.`
          : `This time the multipliers really do cancel. The ${NOUN[s0[0].kind]} added ${money(pr0[1] - P0)}. The ${NOUN[s0[1].kind]} takes off ${p2}% of ${money(pr0[1])}, which is also ${money(pr0[1] - F)}. So the price is back at ${money(P0)}.`;
        return { ask: `Skip the middle price. Which ONE multiplier takes ${money(P0)} straight to the final price?`, items: mkItems([
          I(`× ${mx(M)}`, true, `${ok('Right.')} ${mx(m1)} × ${mx(m2)} = ${mx(M)}. One multiplier does both steps: ${mx(M)} × ${money(P0)} = ${money(F)}, the same price you got in two steps. ${tail}`),
          I(`× ${mx(addp)}`, false, `${no('Not quite.')} ${mx(addp)} comes from adding and subtracting the percents: 1 ${c1 > 0 ? '+' : MINUS} ${mx(Math.abs(c1) / 100)} ${c2 > 0 ? '+' : MINUS} ${mx(p2 / 100)}. That treats both percents as parts of the same price. But step 2 takes its percent of the NEW price. Check: ${mx(addp)} × ${money(P0)} = ${money(P0 * addp)}, and that does not match the ${money(F)} you found in two steps.`, gh(addp)),
          I(`× ${mx(addm)}`, false, `${no('Not quite.')} ${mx(m1)} + ${mx(m2)} = ${mx(addm)}. Two steps are combined by multiplying, not adding. Check: ${mx(addm)} × ${money(P0)} = ${money(P0 * addm)}, far from the ${money(F)} you found.`, gh(addm)),
          I(`× ${mx(sub)}`, false, `${no('Not quite.')} ${mx(Math.max(m1, m2))} − ${mx(Math.min(m1, m2))} = ${mx(sub)}. Subtracting multipliers does not combine two steps. Check: ${mx(sub)} × ${money(P0)} = ${money(P0 * sub)}, far from the ${money(F)} you found.`, gh(sub))
        ]) };
      }
      const x = s0[i], a = pr0[i], b = pr0[i + 1], p = Math.abs(x.c), up = x.c > 0, m = mult(x), noun = NOUN[x.kind], d1 = r2(a * p / 100), m2 = r3(2 - m);
      const gh = v => ({ label: `If you picked this: ${money(v)}`, end: r2(v) });
      const items = [
        I(`× ${mx(m)}`, true, `${ok('Right.')} ` + (up
          ? `The ${noun} is added on top of the price. The new price is 100% + ${p}% = ${100 + p}% of ${money(a)}. As a multiplier, ${100 + p}% = ${mx(m)}, and ${mx(m)} × ${money(a)} = ${money(b)}. The ${noun} itself is ${p}% of ${money(a)} = ${money(d1)}.`
          : `The ${noun} is taken off the price, so you pay what is left: 100% − ${p}% = ${100 - p}% of ${money(a)}. As a multiplier, ${100 - p}% = ${mx(m)}, and ${mx(m)} × ${money(a)} = ${money(b)}. The ${noun} itself is ${p}% of ${money(a)} = ${money(d1)}.`)
          + (i > 0 ? ` Notice that the ${p}% is figured on ${money(a)}, the price you have NOW, not on the first price, ${money(P0)}.` : '')),
        I(`× ${mx(p / 100)}`, false, `${no('Not quite.')} ${mx(p / 100)} × ${money(a)} = ${money(d1)}. That is only the ${noun}, the piece that ${up ? 'gets added' : 'comes off'}. ` + (up
          ? `The new price is the old price PLUS the ${noun}: ${money(a)} + ${money(d1)} = ${money(b)}.`
          : `You pay what is left: ${money(a)} − ${money(d1)} = ${money(b)}.`), gh(d1)),
        I(`× ${mx(m2)}`, false, `${no('Not quite.')} ${mx(m2)} × ${money(a)} = ${money(a * m2)}. That is ${p}% ${up ? 'LESS' : 'MORE'} than ${money(a)}, but a ${noun} makes the price go ${up ? 'up' : 'down'}.`, gh(a * m2))
      ];
      if (i === 0) {
        const sl = up ? (p >= 10 ? 1 + p / 1000 : 1 + p / 10) : 1 - p / 1000;
        items.push(I(`× ${mx(sl)}`, false, `${no('Not quite.')} ${mx(sl)} × ${money(a)} = ${money(a * sl)}. That is a change of ${pc(Math.abs(sl - 1) * 100)}, not ${p}%. Check the decimal point: ${p}% = ${p}/100 = ${mx(p / 100)}, so the multiplier is 1 ${up ? '+' : MINUS} ${mx(p / 100)} = ${mx(m)}.`, gh(a * sl)));
      } else {
        const d0 = r2(P0 * p / 100), v = up ? a + d0 : a - d0;
        items.push(I(`${up ? 'Add' : 'Take off'} ${money(d0)} (${p}% of the first price, ${money(P0)})`, false, `${no('Not quite.')} ${money(d0)} is ${p}% of the FIRST price, ${money(P0)}. But the ${noun} is figured on the price you have now, ${money(a)}. ${p}% of ${money(a)} is ${money(d1)}. ${up ? 'Adding' : 'Taking off'} only ${money(d0)} gives ${money(v)}, not ${money(b)}.`, gh(v)));
      }
      return { ask: `${x.ask} ` + (i === 0 ? 'Which multiplier gives the new price? (A multiplier is the number you multiply the old price by.)' : 'Which move gives the new price?'), items: mkItems(items) };
    };
    const scene = S => {
      const { s, pr } = chainOf(d, S.order), k = S.stage;
      const rows = [{ name: d.startName, val: money(P0), segs: [{ a: 0, b: P0, k: 'base' }], br: [] }];
      for (let i = 0; i < Math.min(k, 2); i++) {
        const x = s[i], a = pr[i], b = pr[i + 1], sg = x.c > 0 ? '+' : MINUS;
        rows.push({ name: x.row, val: money(b), segs: moveSegs(a, b), br: [moveBr(a, b, `${sg}${Math.abs(x.c)}% of ${money(a)} = ${sg}${money(Math.abs(b - a))}`)] });
      }
      if (k >= 3) {
        const ch = (F / P0 - 1) * 100, sg = ch >= 0 ? '+' : MINUS;
        rows.push({ name: `Both steps at once (× ${mx(M)})`, val: money(F), segs: moveSegs(P0, F),
          br: F === P0 ? [{ a: 0, b: P0, k: 'base', t: 'back to the start' }] : [moveBr(P0, F, `${sg}${pc(Math.abs(ch))} of ${money(P0)} = ${sg}${money(Math.abs(F - P0))}`)] });
      }
      const tag = [[d.startName, moneyR(P0)]];
      for (let i = 0; i < Math.min(k, 2); i++) tag.push([`${s[i].name} ${s[i].c > 0 ? '+' : MINUS}${Math.abs(s[i].c)}% (× ${mx(mult(s[i]))})`, moneyR(pr[i + 1])]);
      if (k >= 3) tag.push([`Both at once (× ${mx(M)})`, moneyR(F), true]);
      return { title: d.title, legend: [['base', 'Price'], ['add', 'Added'], ['cut', 'Taken off'], ['ref', 'Start']], rows, nRows: 4, nb: 1, ref: P0,
        max: Math.max(...pr0, ...chainOf(d, true).pr) * 1.06, pend: k < 3, ghost: S.ghost, tagTitle: 'Price tag', tag, tagN: 4 };
    };
    return { mode: 'chain', label: d.label, q: d.q, n: 4, stage, scene,
      demo: () => {
        const L = [kk('Start', `${money(P0)} = 100%`)];
        s0.forEach((x, i) => L.push(kk(x.name, `× ${mx(mult(x))} gives ${money(pr0[i + 1])} (${Math.abs(x.c)}% of ${money(pr0[i])} is ${money(Math.abs(pr0[i + 1] - pr0[i]))})`)));
        L.push(kk('One step', `${mx(mult(s0[0]))} × ${mx(mult(s0[1]))} = ${mx(M)}, and ${mx(M)} × ${money(P0)} = ${money(F)}`));
        return L;
      },
      swapText: () => {
        const w = chainOf(d, true), x = w.s[0];
        return `${ok('Swapped.')} ${x.name} comes first now: ${money(P0)} → ${money(w.pr[1])} → ${money(w.pr[2])}. The final price is still ${money(w.pr[2])}, because ${mx(mult(w.s[0]))} × ${mx(mult(w.s[1]))} = ${mx(mult(s0[0]))} × ${mx(mult(s0[1]))} = ${mx(M)}. Only the middle price changed.`;
      } };
  };

  /* =====================================================================
     JOB 2: percent change (find the percent, or find the old amount)
     ===================================================================== */
  const CG = [
    { kind: 'pct', label: 'Find the percent: $40 to $50', title: 'Video game', old: 40, nw: 50, step: 5,
      q: 'A video game costs $40 in March. In April the same game costs $50. What is the percent change in the price?' },
    { kind: 'pct', label: 'Find the percent: $50 to $40', title: 'Hoodie', old: 50, nw: 40, step: 5,
      q: 'A hoodie cost $50 last month. This month the same hoodie costs $40. What is the percent change in the price?' },
    { kind: 'old', label: 'Find the old price: after a 20% cut', title: 'Shoes', old: 60, nw: 48, c: -20,
      q: 'After a 20% price cut, a pair of shoes costs $48. What did the shoes cost before the cut?' },
    { kind: 'old', label: 'Find the old price: after a 20% raise', title: 'Concert ticket', old: 50, nw: 60, c: 20,
      q: 'After a 20% price increase, a concert ticket costs $60. What did the ticket cost before the increase?' }
  ];
  const chgPct = d => {
    const { old, nw } = d, up = nw > old, dlt = r2(Math.abs(nw - old)), pct = dlt / old * 100, wb = dlt / nw * 100;
    const big = Math.max(old, nw), small = Math.min(old, nw), sg = up ? '+' : MINUS, word = up ? 'increase' : 'decrease';
    const imp = g => r2(up ? old + old * g / 100 : old - old * g / 100);
    const gOf = (g, lead) => ({ label: `${lead}${pc(g)} of ${money(old)} = ${money(old * g / 100)}, so ${money(imp(g))}`, end: imp(g) });
    const stage = i => {
      if (i === 0) return { ask: `The price moved from ${money(old)} to ${money(nw)}. What is the amount of the change?`, items: mkItems([
        I(`Subtract: ${money(big)} − ${money(small)} = ${money(dlt)}`, true, `${ok('Right.')} The change is the gap between the two prices: ${money(dlt)}. It is the ${up ? 'yellow' : 'dashed red'} piece on the new bar.`),
        I(`Add: ${money(old)} + ${money(nw)} = ${money(old + nw)}`, false, `${no('Not quite.')} ${money(old + nw)} is bigger than both prices. The change is how far the price moved, so subtract.`),
        I(`The change is the new price, ${money(nw)}`, false, `${no('Not quite.')} ${money(nw)} is the whole new price. The price did not move by that much. It moved only ${money(dlt)}.`),
        I(`Divide: ${money(nw)} ÷ ${money(old)} = ${nfmt(nw / old)}`, false, `${no('Not quite.')} ${nfmt(nw / old)} says the new price is ${pc(nw / old * 100)} of the old price. That is useful later, but it is not the change in dollars. The change is the gap: ${money(dlt)}.`)
      ]) };
      if (i === 1) return { ask: `The change is ${money(dlt)}. A percent compares the change with one amount, the 100%. Which amount?`, items: mkItems([
        I(`The OLD price, ${money(old)} (where it started)`, true, `${ok('Right.')} The old price is the 100% bar. A percent change always starts from where the amount started.`),
        I(`The NEW price, ${money(nw)}`, false, `${no('Not quite.')} ${money(dlt)} out of ${money(nw)} is ${pc(wb)}. That is the wrong base. Check: ${pc(wb)} of the old price ${money(old)} is ${money(old * wb / 100)}, and ${money(old)} ${up ? '+' : MINUS} ${money(old * wb / 100)} = ${money(imp(wb))}, not ${money(nw)}.`, gOf(wb, 'Using the new price: ')),
        I(`The change itself, ${money(dlt)}`, false, `${no('Not quite.')} ${money(dlt)} out of ${money(dlt)} is 100%. That compares the change with itself, so it tells you nothing about the price.`)
      ]) };
      return { ask: `Drag the marker to the percent ${word}. It moves ${d.step}% at a time.`, place: { lo: 0, hi: 50, min: 0, max: 50, step: d.step, tick: 10, fmt: pc, start: 0, label: `Percent ${word}` } };
    };
    const placeCheck = (i, g) => {
      if (Math.abs(g - pct) < 1e-9) return { right: true, text: `${ok('Yes.')} ${pc(pct)} of ${money(old)} is ${money(dlt)}, and ${money(old)} ${up ? '+' : MINUS} ${money(dlt)} = ${money(nw)}. As a calculation: ${money(dlt)} ÷ ${money(old)} = ${nfmt(dlt / old)} = ${pc(pct)}.` };
      let t = `${no('Not quite.')} ${pc(g)} of ${money(old)} is ${money(old * g / 100)}, so the price would ${up ? 'rise' : 'fall'} from ${money(old)} to ${money(imp(g))}. The new price is ${money(nw)}, so move the marker to the ${(up ? imp(g) < nw : imp(g) > nw) ? 'right' : 'left'}.`;
      if (Math.abs(g - wb) < 1e-9) t += ` ${pc(g)} is what you get by dividing the change by the NEW price. A percent change divides by the OLD price.`;
      return { right: false, text: t };
    };
    const scene = S => {
      const k = S.stage, live = k === 2 ? gOf(S.pos, 'Your marker: ') : null, ch = `${sg}${money(dlt)}`;
      const rows = [{ name: 'Old price', val: money(old), segs: [{ a: 0, b: old, k: 'base' }], br: [] },
        { name: 'New price', val: money(nw), segs: moveSegs(old, nw),
          br: k >= 1 ? [moveBr(old, nw, k >= 3 ? `${sg}${pc(pct)} of ${money(old)} = ${ch}` : k >= 2 ? `? % of ${money(old)} = ${ch}` : ch)] : [] }];
      const tag = [['Old price', moneyR(old)], ['New price', moneyR(nw)]];
      if (k >= 1) tag.push(['Change', `${sg}${moneyR(dlt)}`]);
      if (k >= 3) tag.push([`Percent ${word}`, pc(pct), true]);
      return { title: d.title, legend: [['base', 'Price'], up ? ['add', 'Added'] : ['cut', 'Taken off'], ['guess', 'Guess'], ['ref', 'New price']], rows, nRows: 3, nb: 1, max: big * 1.06, ref: nw,
        pend: k === 2 || !!S.ghost, ghost: live || S.ghost, tagTitle: 'Price tag', tag, tagN: 4, hasPlace: true,
        place: k === 2 ? stage(2).place : null };
    };
    return { mode: 'chg', label: d.label, q: d.q, n: 3, stage, scene, placeCheck,
      demoGhost: gOf(wb, 'Using the new price: '),
      demo: () => [kk('Change', `${money(nw)} − ${money(old)} = ${money(dlt)}`),
        kk('Percent', `divide by the OLD price: ${money(dlt)} ÷ ${money(old)} = ${nfmt(dlt / old)} = ${pc(pct)}`),
        kk('Wrong base', `${money(dlt)} ÷ ${money(nw)} = ${pc(wb)}. Check: ${pc(wb)} of ${money(old)} is ${money(old * wb / 100)}, which gives ${money(imp(wb))}, not ${money(nw)}`)] };
  };
  const chgOld = d => {
    const { old, nw, c } = d, up = c > 0, p = Math.abs(c), kf = 100 + c, m = r3(kf / 100), dlt = r2(Math.abs(nw - old)), sg = up ? '+' : MINUS, word = up ? 'increase' : 'cut';
    const gh = x => ({ label: `If the old price were ${money(x)}: ${money(x * m)} after the ${word}`, end: r2(x * m) });
    const stage = i => {
      if (i === 0) return { ask: `The new price is ${money(nw)}. The old price is the 100%, and the price went ${up ? 'up' : 'down'} ${p}%. The new price is what percent of the old price?`, items: mkItems([
        I(`${kf}%`, true, `${ok('Right.')} The old price is 100%. ${up ? `The increase adds ${p}% more: 100% + ${p}% = ${kf}%.` : `The cut takes off ${p}%: 100% − ${p}% = ${kf}%.`} So ${money(nw)} is ${kf}% of the old price.`),
        I(`${p}%`, false, `${no('Not quite.')} ${p}% is only the piece that was ${up ? 'added' : 'cut off'}. The new price is the old price ${up ? 'plus' : 'minus'} that piece, so it is ${kf}% of the old price.`),
        I(`${up ? 100 - p : 100 + p}%`, false, `${no('Not quite.')} ${up ? 100 - p : 100 + p}% would mean the price went ${up ? 'down' : 'up'}. This price went ${up ? 'up' : 'down'}, so the new price is ${up ? 'more' : 'less'} than 100% of the old one.`),
        I('100%', false, `${no('Not quite.')} 100% is the old price itself. The new price is different from the old one.`)
      ]) };
      const x1 = r2(nw * (2 - m)), x2 = r2(nw * m), x3 = up ? nw - p : nw + p;
      return { ask: `Now find the old price. ${money(nw)} is ${kf}% of it. Which calculation does that?`, items: mkItems([
        I(`${money(nw)} ÷ ${mx(m)}`, true, `${ok('Right.')} ${kf}% of the old price is ${money(nw)}, so the old price is ${money(nw)} ÷ ${mx(m)} = ${money(old)}. Check: ${mx(m)} × ${money(old)} = ${money(nw)}.`),
        I(`${money(nw)} × ${mx(2 - m)}`, false, `${no('Not quite.')} ${money(nw)} × ${mx(2 - m)} = ${money(x1)}. That ${up ? 'takes' : 'adds'} ${p}% of the NEW price, but the ${p}% was ${up ? 'added to' : 'taken from'} the OLD price. Check: a ${p}% ${word} on ${money(x1)} gives ${money(x1 * m)}, not ${money(nw)}.`, gh(x1)),
        I(`${money(nw)} × ${mx(m)}`, false, `${no('Not quite.')} ${money(nw)} × ${mx(m)} = ${money(x2)}. That ${up ? 'raises' : 'lowers'} the new price by another ${p}%, which goes the wrong way. The old price was ${up ? 'less' : 'more'} than ${money(nw)}. To undo × ${mx(m)}, divide by ${mx(m)}.`, gh(x2)),
        I(`${money(nw)} ${up ? MINUS : '+'} ${p}`, false, `${no('Not quite.')} ${p} is a percent, not dollars. Check: a ${p}% ${word} on ${money(x3)} gives ${money(x3 * m)}, not ${money(nw)}.`, gh(x3))
      ]) };
    };
    const scene = S => {
      const k = S.stage, solved = k >= 2;
      const r0 = { name: 'Old price', val: solved ? money(old) : '?', segs: [{ a: 0, b: old, k: solved ? 'base' : 'unk' }], br: [{ a: 0, b: old, k: 'base', t: solved ? `100% = ${money(old)}` : '100% = ?' }] };
      const r1 = { name: 'New price', val: money(nw), segs: solved ? moveSegs(old, nw) : [{ a: 0, b: nw, k: 'base' }], br: [] };
      if (k >= 1) r1.br.push({ a: 0, b: nw, k: 'base', t: `${kf}% of the old price` });
      if (solved) r1.br.push(moveBr(old, nw, `${sg}${p}% of ${money(old)} = ${sg}${money(dlt)}`));
      const tag = [['New price', moneyR(nw)], ['Price change', `${sg}${p}%`]];
      if (k >= 1) tag.push(['New price is', `${kf}% of old`]);
      if (solved) tag.push(['Old price', moneyR(old), true]);
      return { title: d.title, legend: [['base', 'Price'], up ? ['add', 'Added'] : ['cut', 'Taken off'], solved ? ['guess', 'Guess'] : ['unk', 'Not known'], ['ref', 'New price']], rows: [r0, r1], nRows: 3, nb: 2, max: Math.max(old, nw) * 1.06, ref: nw,
        pend: !!S.ghost, ghost: S.ghost, tagTitle: 'Price tag', tag, tagN: 4 };
    };
    return { mode: 'chg', label: d.label, q: d.q, n: 2, stage, scene,
      demo: () => [kk('Percent', `${money(nw)} is ${kf}% of the old price`), kk('Old price', `${money(nw)} ÷ ${mx(m)} = ${money(old)}`)] };
  };

  /* =====================================================================
     JOB 3: simple interest (and a flat fee)
     ===================================================================== */
  const intProb = d => {
    const { P, r, t, kind } = d, i1 = r2(P * r / 100), I = r2(i1 * t), bal = P + I, n = kind === 'int' ? 3 : 2;
    const stage = i => {
      if (kind === 'int') {
        if (i === 0) return { ask: 'How much interest does the account earn in ONE year?', items: mkItems([
          I_(`${money(P)} × ${mx(r / 100)} = ${money(i1)}`, true, `${ok('Right.')} ${r}% = ${mx(r / 100)}, and ${mx(r / 100)} × ${money(P)} = ${money(i1)}. Each year the bank pays ${r}% of the money you started with.`),
          I_(`${money(P)} × ${r} = ${money(P * r)}`, false, `${no('Not quite.')} ${money(P * r)} is ${r} times the whole ${money(P)}. One year of interest should be a small part of ${money(P)}. ${r}% means ${r} out of 100, so use ${mx(r / 100)}.`),
          I_(`${money(P)} × ${mx(r / 10)} = ${money(P * r / 10)}`, false, `${no('Not quite.')} ${mx(r / 10)} is ${r * 10}%, not ${r}%. ${money(P * r / 10)} is ${pc(r * 10)} of ${money(P)}. ${r}% is ${r} hundredths, ${mx(r / 100)}.`),
          I_(`${money(P)} ÷ ${r} = ${money(P / r)}`, false, `${no('Not quite.')} ${money(P)} ÷ ${r} = ${money(P / r)}, which is ${pc(100 / r)} of ${money(P)}. Dividing by ${r} is not the same as ${r} out of every 100.`)
        ]) };
        if (i === 1) return { ask: `Now find the interest for all ${t} years.`, items: mkItems([
          I_(`${money(i1)} × ${t} = ${money(I)}`, true, `${ok('Right.')} Simple interest is figured on the starting amount only, so every year pays the same ${money(i1)}. After ${t} years: ${t} × ${money(i1)} = ${money(I)}. The equal bars show it.`),
          I_(`Year 2 pays more, because ${r}% of ${money(P + i1)} is ${money(r2((P + i1) * r / 100))}`, false, `${no('Not quite.')} That is compound interest, where the interest earns interest. Simple interest uses only the starting ${money(P)}. So year 2 pays ${money(i1)} again, and every bar is the same size.`),
          I_(`${money(i1)} + ${t} = ${money(i1 + t)}`, false, `${no('Not quite.')} That adds years to dollars. ${t} years means ${t} bars of ${money(i1)}, so multiply: ${t} × ${money(i1)} = ${money(I)}.`),
          I_(`${money(P)} × ${t} = ${money(P * t)}`, false, `${no('Not quite.')} That leaves out the rate. ${money(P * t)} is ${t} times the whole principal. The interest is only ${r}% of ${money(P)} each year.`)
        ]) };
        return { ask: `How much money is in the account after ${t} years?`, items: mkItems([
          I_(`${money(P)} + ${money(I)} = ${money(bal)}`, true, `${ok('Right.')} The balance is the principal plus the interest: ${money(P)} + ${money(I)} = ${money(bal)}. In one formula, interest = principal × rate × years = ${money(P)} × ${mx(r / 100)} × ${t} = ${money(I)}.`),
          I_(`${money(I)}`, false, `${no('Not quite.')} ${money(I)} is only the interest. The account still holds the ${money(P)} that you put in.`),
          I_(`${money(P)} − ${money(I)} = ${money(P - I)}`, false, `${no('Not quite.')} Interest is paid TO you, so it is added. The balance is more than ${money(P)}, not less.`),
          I_(`${money(P)} + ${money(i1)} = ${money(P + i1)}`, false, `${no('Not quite.')} That adds only one year of interest. There are ${t} equal bars, so add all ${t}: ${money(I)}.`)
        ]) };
      }
      if (kind === 'rate') {
        if (i === 0) return { ask: 'How much interest is that for ONE year?', items: mkItems([
          I_(`${money(I)} ÷ ${t} = ${money(i1)}`, true, `${ok('Right.')} Simple interest repeats the same amount every year, so the ${t} equal bars make ${money(I)}. One bar is ${money(I)} ÷ ${t} = ${money(i1)}.`),
          I_(`${money(I)} × ${t} = ${money(I * t)}`, false, `${no('Not quite.')} ${money(I * t)} is more interest than Ben paid in all. The ${t} years share the ${money(I)}, so divide.`),
          I_(`${money(I)} + ${t} = ${money(I + t)}`, false, `${no('Not quite.')} That adds years to dollars. The ${money(I)} is split into ${t} equal yearly amounts, so divide by ${t}.`)
        ]) };
        return { ask: 'What percent of the principal is one year of interest? That is the yearly rate.', items: mkItems([
          I_(`${money(i1)} ÷ ${money(P)} = ${mx(r / 100)} = ${r}%`, true, `${ok('Right.')} The principal is the whole (100%). One year of interest, ${money(i1)}, is the part. ${money(i1)} ÷ ${money(P)} = ${mx(r / 100)} = ${r}%. Check: ${money(P)} × ${mx(r / 100)} × ${t} = ${money(I)}.`),
          I_(`${money(I)} ÷ ${money(P)} = ${mx(I / P)} = ${pc(I / P * 100)}`, false, `${no('Not quite.')} That compares the interest for ALL ${t} years with the principal. It is ${pc(I / P * 100)} for the whole loan. A yearly rate is for one year: ${pc(I / P * 100)} ÷ ${t} = ${r}%.`),
          I_(`${money(i1)} ÷ ${money(I)} = ${pc(i1 / I * 100)}`, false, `${no('Not quite.')} That compares one year of interest with the total interest. A rate compares the interest with the PRINCIPAL, ${money(P)}.`),
          I_(`${money(P)} ÷ ${money(i1)} = about ${nfmt(P / i1, 1)}`, false, `${no('Not quite.')} That divides the whole by the part, upside down. A rate is the part ÷ the whole: ${money(i1)} ÷ ${money(P)}.`)
        ]) };
      }
      if (i === 0) return { ask: 'How much interest is that for ONE year?', items: mkItems([
        I_(`${money(I)} ÷ ${t} = ${money(i1)}`, true, `${ok('Right.')} Simple interest repeats the same amount every year, so ${t} equal bars make ${money(I)}. One bar is ${money(I)} ÷ ${t} = ${money(i1)}.`),
        I_(`${money(I)} × ${t} = ${money(I * t)}`, false, `${no('Not quite.')} ${money(I * t)} is more than the account earned in all. The ${t} years share the ${money(I)}, so divide.`),
        I_(`${money(I)} ÷ ${r} = ${money(I / r)}`, false, `${no('Not quite.')} Dividing by ${r} uses the rate. But the money was earned over ${t} years, so divide by the number of years, ${t}.`),
        I_(`${money(I)} × ${mx(r / 100)} = ${money(I * r / 100)}`, false, `${no('Not quite.')} That is ${r}% OF THE INTEREST. The rate is ${r}% of the PRINCIPAL, which we do not know yet.`)
      ]) };
      return { ask: `One year's interest, ${money(i1)}, is ${r}% of the principal. Which calculation finds the principal?`, items: mkItems([
        I_(`${money(i1)} ÷ ${mx(r / 100)} = ${money(P)}`, true, `${ok('Right.')} ${r}% of the principal is ${money(i1)}, so the principal is ${money(i1)} ÷ ${mx(r / 100)} = ${money(P)}. Check: ${money(P)} × ${mx(r / 100)} × ${t} = ${money(I)}. On the bar, ${r}% is 1 of 25 equal pieces, so 25 × ${money(i1)} = ${money(P)}.`),
        I_(`${money(i1)} × ${mx(r / 100)} = ${money(r2(i1 * r / 100))}`, false, `${no('Not quite.')} That finds ${r}% OF ${money(i1)}. But ${money(i1)} is ${r}% of the principal, so the principal is much bigger than ${money(i1)}.`),
        I_(`${money(i1)} × ${r} = ${money(i1 * r)}`, false, `${no('Not quite.')} Check: ${r}% of ${money(i1 * r)} is ${money(i1 * r * r / 100)}, not ${money(i1)}. Multiplying by the percent number does not undo a percent.`),
        I_(`${money(I)} ÷ ${mx(r / 100)} = ${money(I / (r / 100))}`, false, `${no('Not quite.')} This leaves out the ${t} years. ${money(I / (r / 100))} at ${r}% would earn ${money(I)} in ONE year, not in ${t} years.`)
      ]) };
    };
    const growAt = i => kind === 'int' ? [0, 1, t, t][i] : [0, t, t][i];
    const scene = S => {
      const k = S.stage, g = S.grow;
      let segs, val, br = [], name = 'Account', tag, unkP = kind === 'prin' && k < 2;
      if (kind !== 'int' && k === 0) segs = [{ a: P, b: P + I, k: 'add', t: `${money(I)} in all` }];
      else segs = yearSegs(P, i1, g);
      const base = { a: 0, b: P, k: unkP ? 'unk' : 'base' };
      const shown = Math.floor(g + 1e-6);
      val = unkP ? '?' : money(P + (kind !== 'int' && k === 0 ? I : i1 * shown));
      br.push({ a: 0, b: P, k: 'base', t: unkP ? '100% = the principal (?)' : `100% = ${money(P)} principal` });
      if (kind === 'int') {
        if (k >= 1) br.push({ a: P, b: P + i1 * clamp(g, 0, t), k: 'add', t: k >= 2 ? `${money(i1)} × ${t} years = ${money(I)} interest` : `${r}% of ${money(P)} = ${money(i1)} a year` });
        tag = [['Principal', moneyR(P)], ['Rate', `${r}% a year`], ['Time', `${t} years`]];
        if (k >= 1) tag.push(['Interest each year', moneyR(i1)]);
        if (k >= 2) tag.push(['Interest, all years', moneyR(I)]);
        if (k >= 3) tag.push(['Balance', moneyR(bal), true]);
      } else if (kind === 'rate') {
        if (k >= 1) br.push({ a: P, b: P + I, k: 'add', t: k >= 2 ? `${r}% of ${money(P)} = ${money(i1)} a year` : `${money(I)} ÷ ${t} years = ${money(i1)} a year` });
        tag = [['Principal', moneyR(P)], ['Time', `${t} years`], ['Interest, all years', moneyR(I)]];
        if (k >= 1) tag.push(['Interest each year', moneyR(i1)]);
        if (k >= 2) tag.push(['Yearly rate', `${r}%`, true]);
      } else {
        if (k >= 1) br.push({ a: P, b: P + I, k: 'add', t: k >= 2 ? `${r}% of ${money(P)} = ${money(i1)} a year` : `${money(I)} ÷ ${t} years = ${money(i1)} a year` });
        tag = [['Rate', `${r}% a year`], ['Time', `${t} years`], ['Interest, all years', moneyR(I)]];
        if (k >= 1) tag.push(['Interest each year', moneyR(i1)]);
        if (k >= 2) tag.push(['Principal', moneyR(P), true]);
      }
      return { title: d.title, legend: [['base', 'Principal'], ['add', 'Interest, one bar a year'], ['unk', 'Not known yet']], rows: [{ name, val, segs: [base, ...segs], br }],
        nRows: 1, nb: 2, max: (P + I) * 1.04, pend: false, ghost: null, tagTitle: 'Account', tag, tagN: kind === 'int' ? 6 : 5 };
    };
    return { mode: 'int', label: d.label, q: d.q, n, stage, scene, growAt,
      demo: () => kind === 'int'
        ? [kk('Principal', `${money(P)}, rate ${r}% a year, ${t} years`), kk('One year', `${money(P)} × ${mx(r / 100)} = ${money(i1)}`), kk(`${t} years`, `${money(i1)} × ${t} = ${money(I)}`), kk('Balance', `${money(P)} + ${money(I)} = ${money(bal)}`)]
        : kind === 'rate' ? [kk('One year', `${money(I)} ÷ ${t} = ${money(i1)}`), kk('Rate', `${money(i1)} ÷ ${money(P)} = ${r}%`)]
        : [kk('One year', `${money(I)} ÷ ${t} = ${money(i1)}`), kk('Principal', `${money(i1)} ÷ ${mx(r / 100)} = ${money(P)}`)] };
  };
  const I_ = I;   /* inside intProb the name I is the total interest */

  /* the sliders: a fee against interest, and free play */
  const slProb = (id, d) => {
    const fixed = d.fixed || {};
    const q = S => ({ ...S.sl, ...fixed });
    const calc = o => { const i1 = r2(o.P * o.r / 100), I = r2(i1 * o.t); return { ...o, i1, I, bal: o.P + I }; };
    const scene = S => {
      const o = calc(q(S)), rows = [{ name: 'Account', val: money(o.bal), segs: [{ a: 0, b: o.P, k: 'base' }, ...yearSegs(o.P, o.i1, o.t)],
        br: [{ a: 0, b: o.P, k: 'base', t: `100% = ${money(o.P)} principal` }, { a: o.P, b: o.P + o.I, k: 'add', t: `${o.r}% of ${money(o.P)} = ${money(o.i1)} a year` }] }];
      const tag = [['Principal', moneyR(o.P)], ['Rate', `${o.r}% a year`], ['Time', `${o.t} years`], ['Interest each year', moneyR(o.i1)]];
      let max = (o.P + o.I) * 1.04;
      if (d.fee) {
        const feeSegs = []; for (let y = 0; y < o.t; y++) feeSegs.push({ a: y * d.fee, b: (y + 1) * d.fee, k: 'cut', alt: y % 2, t: `yr ${y + 1}`, t2: String(y + 1) });
        rows.push({ name: 'Fees', val: money(d.fee * o.t), segs: feeSegs, br: [{ a: 0, b: d.fee * o.t, k: 'cut', t: `${money(d.fee)} a year, whatever the principal is` }] });
        tag.push(['Fee each year', moneyR(d.fee)]);
        const gain = r2(o.i1 - d.fee);
        tag.push([gain >= 0 ? 'You gain each year' : 'You lose each year', `${gain >= 0 ? '+' : MINUS}${moneyR(Math.abs(gain))}`, true]);
        max = Math.max(max, d.fee * o.t * 1.04);
      } else { tag.push(['Interest, all years', moneyR(o.I)]); tag.push(['Balance', moneyR(o.bal), true]); }
      return { title: d.title, legend: d.fee ? [['base', 'Principal'], ['add', 'Interest, one bar a year'], ['cut', 'Fee, one bar a year']] : [['base', 'Principal'], ['add', 'Interest, one bar a year']],
        rows, nRows: d.fee ? 2 : 1, nb: 2, max, pend: false, ghost: null, tagTitle: 'Account', tag, tagN: 6 };
    };
    return { mode: 'int', label: d.label, q: d.q, n: 0, stage: () => ({}), scene, growAt: () => undefined, sl: { show: d.show, init: d.init, live: d.live ? d.live(calc, q) : null, check: d.check ? d.check(calc, q) : null, fixed }, demo: () => [] };
  };

  /* =====================================================================
     JOB 4: percent error
     ===================================================================== */
  const ER = [
    { label: 'Find the percent error: a rope', title: 'Rope', T: 50, M: 40, u: 'cm', step: 5, pmax: 50,
      q: 'A rope is really 50 cm long. You measure it and get 40 cm. What is the percent error of your measurement?' },
    { label: 'Find the percent error: a test weight', title: 'Test weight', T: 40, M: 42, u: 'kg', step: 1, pmax: 20,
      q: 'A test weight is exactly 40 kg. Your scale says it weighs 42 kg. What is the percent error of the scale?' }
  ];
  const errProb = d => {
    const { T: Tv, M: Mv, u } = d, err = r2(Math.abs(Tv - Mv)), pe = err / Tv * 100, over = Mv > Tv, wb = err / Mv * 100;
    const big = Math.max(Tv, Mv), small = Math.min(Tv, Mv), exact = g => Math.abs(g * 10 - Math.round(g * 10)) < 1e-9, ab = g => exact(g) ? '' : 'about ';
    const imp = g => over ? Tv * (1 + g / 100) : Tv * (1 - g / 100);
    const U = v => `${nfmt(v)} ${u}`;
    const gOf = (g, lead) => ({ label: exact(g) ? `${lead}${pc(g)} of ${nfmt(Tv)} = ${nfmt(Tv * g / 100)}, so ${U(imp(g))}` : `${lead}about ${pc(g)} of ${nfmt(Tv)} is about ${nfmt(Tv * g / 100, 1)}, so about ${nfmt(imp(g), 1)} ${u}`, end: r2(imp(g)) });
    const stage = i => {
      if (i === 0) return { ask: 'How far off is the measurement? That is the error.', items: mkItems([
        I(`Subtract: ${nfmt(big)} − ${nfmt(small)} = ${U(err)}`, true, `${ok('Right.')} The error is the size of the gap between the measurement and the true value: ${U(err)}. It is the ${over ? 'yellow' : 'dashed red'} piece. The error is a size, so it never has a minus sign, and it does not matter which number is bigger.`),
        I(`Add: ${nfmt(Mv)} + ${nfmt(Tv)} = ${U(Mv + Tv)}`, false, `${no('Not quite.')} ${U(Mv + Tv)} is bigger than both numbers. The error is how far apart they are, so subtract.`),
        I(`Divide: ${nfmt(Mv)} ÷ ${nfmt(Tv)} = ${nfmt(Mv / Tv)}`, false, `${no('Not quite.')} ${nfmt(Mv / Tv)} says the measurement is ${pc(Mv / Tv * 100)} of the true value. That is not the size of the error in ${u}. The error is the gap: ${U(err)}.`),
        I(`The error is the measurement, ${U(Mv)}`, false, `${no('Not quite.')} ${U(Mv)} is the whole measurement, and most of it is right. The error is only the part that is off: the gap between ${nfmt(Mv)} and ${nfmt(Tv)}.`)
      ]) };
      if (i === 1) return { ask: `The error is ${U(err)}. Percent error compares the error with one amount, the 100%. Which amount?`, items: mkItems([
        I(`The TRUE value, ${U(Tv)}`, true, `${ok('Right.')} The true value is the standard the measurement is judged against, so it is the 100% bar. The error is ${nfmt(err)} out of ${nfmt(Tv)}.`),
        I(`The MEASURED value, ${U(Mv)}`, false, `${no('Not quite.')} ${nfmt(err)} ÷ ${nfmt(Mv)} is ${ab(wb)}${pc(wb)}. But percent error says how big the error is compared with the TRUE value. Check: ${ab(wb)}${pc(wb)} of the true value ${nfmt(Tv)} is ${ab(wb)}${nfmt(Tv * wb / 100, 1)} ${u}, not ${U(err)}.`, gOf(wb, 'Using the measurement: ')),
        I(`The error itself, ${U(err)}`, false, `${no('Not quite.')} ${nfmt(err)} out of ${nfmt(err)} is 100%. That compares the error with itself, so it says nothing about how big the error is for this ${d.title.toLowerCase()}.`)
      ]) };
      return { ask: `Drag the marker to the percent error. It moves ${d.step}% at a time.`, place: { lo: 0, hi: d.pmax, min: 0, max: d.pmax, step: d.step, tick: d.pmax > 30 ? 10 : 5, fmt: pc, start: 0, label: 'Percent error' } };
    };
    const placeCheck = (i, g) => {
      if (Math.abs(g - pe) < 1e-9) return { right: true, text: `${ok('Yes.')} ${nfmt(err)} ÷ ${nfmt(Tv)} = ${nfmt(err / Tv)} = ${pc(pe)}. The measurement is off by ${pc(pe)} of the true value.` };
      let t = `${no('Not quite.')} ${pc(g)} of the true value ${nfmt(Tv)} is ${nfmt(Tv * g / 100)} ${u}, so a ${pc(g)} error would give a measurement of ${U(imp(g))}. Yours is ${U(Mv)}. Move the marker to the ${Math.abs(imp(g) - Tv) < err ? 'right' : 'left'}.`;
      if (Math.abs(g - wb) < 1e-9) t += ` ${pc(g)} is what you get by dividing the error by the MEASURED value. Percent error divides by the TRUE value.`;
      return { right: false, text: t };
    };
    const scene = S => {
      const k = S.stage, live = k === 2 ? gOf(S.pos, 'Your marker: ') : null, ch = `error ${U(err)}`;
      const rows = [{ name: 'True value', val: U(Tv), segs: [{ a: 0, b: Tv, k: 'base' }], br: [] },
        { name: 'Your measurement', val: U(Mv), segs: moveSegs(Tv, Mv),
          br: k >= 1 ? [moveBr(Tv, Mv, k >= 3 ? `${pc(pe)} of ${U(Tv)} = ${U(err)}` : k >= 2 ? `? % of ${U(Tv)} = ${U(err)}` : ch)] : [] }];
      const tag = [['True value', U(Tv)], ['Measured value', U(Mv)]];
      if (k >= 1) tag.push(['Error (the gap)', U(err)]);
      if (k >= 3) tag.push(['Percent error', pc(pe), true]);
      return { title: d.title, legend: [['base', 'Amount'], over ? ['add', 'Too high'] : ['cut', 'Too low'], ['guess', 'Guess'], ['ref', 'Measured']], rows, nRows: 3, nb: 1, max: big * 1.1, ref: Mv,
        pend: k === 2 || !!S.ghost, ghost: live || S.ghost, tagTitle: 'Lab notebook', tag, tagN: 4, hasPlace: true, place: k === 2 ? stage(2).place : null };
    };
    return { mode: 'err', label: d.label, q: d.q, n: 3, stage, scene, placeCheck,
      demoGhost: gOf(wb, 'Using the measurement: '),
      demo: () => [kk('Error', `${nfmt(big)} − ${nfmt(small)} = ${U(err)}`), kk('Percent error', `divide by the TRUE value: ${nfmt(err)} ÷ ${nfmt(Tv)} = ${nfmt(err / Tv)} = ${pc(pe)}`),
        kk('Wrong base', `${nfmt(err)} ÷ ${nfmt(Mv)} is ${ab(wb)}${pc(wb)}. Check: ${ab(wb)}${pc(wb)} of ${nfmt(Tv)} is ${ab(wb)}${nfmt(Tv * wb / 100, 1)} ${u}, not ${U(err)}`)] };
  };
  /* drag a measurement to a 10% error: two answers */
  const measProb = () => {
    const Tv = 50, u = 'cm', pr = 10, e0 = Tv * pr / 100, lo = Tv - e0, hi = Tv + e0;
    const U = v => `${nfmt(v)} ${u}`, place = { lo: 0, hi: 70, min: 35, max: 65, step: 1, tick: 5, fmt: v => `${v} ${u}`, tf: v => String(v), start: 50, label: 'Measured length', mark: Tv };
    const stage = i => ({ ask: i === 0 ? `Drag the marker to a measurement that has a ${pr}% error.` : `There is a second measurement with a ${pr}% error. Drag the marker to it.`, place });
    const placeCheck = (i, g, S) => {
      const e = Math.abs(g - Tv), pe = e / Tv * 100;
      if (Math.abs(pe - pr) < 1e-9) {
        if (i === 0) return { right: true, mem: g, text: `${ok('Yes.')} ${pr}% of ${U(Tv)} is ${U(e0)}. At ${U(g)} the error is ${U(e)}, and ${nfmt(e)} ÷ ${nfmt(Tv)} = ${nfmt(e / Tv)} = ${pr}%. A measurement can miss on either side of the true value. Where is the other one?` };
        if (g === S.mem) return { right: false, text: `${no('Not quite.')} ${U(g)} is the measurement you found already. The other one is on the other side of the true value, ${U(Tv)}.` };
        return { right: true, text: `${ok('Yes.')} ${U(lo)} is ${U(e0)} too low and ${U(hi)} is ${U(e0)} too high. Both have a ${pr}% error, because percent error ignores which way the measurement missed.` };
      }
      return { right: false, text: `${no('Not quite.')} At ${U(g)} the error is ${U(e)}, and ${nfmt(e)} ÷ ${nfmt(Tv)} = ${nfmt(e / Tv)} = ${pc(pe)}. You need ${pr}%: move the marker ${pe < pr ? 'farther from' : 'closer to'} the true value, ${U(Tv)}.` };
    };
    const scene = S => {
      const g = S.pos, e = Math.abs(g - Tv), pe = e / Tv * 100, k = S.stage;
      const rows = [{ name: 'True length', val: U(Tv), segs: [{ a: 0, b: Tv, k: 'base' }], br: [] },
        { name: 'Measured length', val: U(g), segs: moveSegs(Tv, g), br: e > 0 ? [moveBr(Tv, g, `error ${U(e)}`)] : [] }];
      const tag = [['True length', U(Tv)], ['Measured length', U(g)], ['Error (the gap)', U(e)], ['Percent error', pc(pe), true]];
      return { title: 'Board', legend: [['base', 'Length'], ['add', 'Too long'], ['cut', 'Too short']], rows, nRows: 2, nb: 1, max: 70,
        pend: false, ghost: null, tagTitle: 'Lab notebook', tag, tagN: 4, hasPlace: true, place: k < 2 ? place : null };
    };
    return { mode: 'err', label: 'Find a measurement with a 10% error', q: `A board is really ${Tv} cm long. Find the measurements that have a ${pr}% error.`, n: 2, stage, scene, placeCheck, meas: true,
      demo: () => [] };
  };

  /* =====================================================================
     JOB 5: tax, tips and pay (a receipt and a paycheck)
     ===================================================================== */
  /* a whole, a part (a percent of it) and a total: sales tax, a tip, or income tax withheld */
  const partTotal = d => {
    const { W, p, up } = d, part = r2(W * p / 100), total = r2(up ? W + part : W - part), m = up ? r3(1 + p / 100) : r3(1 - p / 100), sg = up ? '+' : MINUS;
    const stage = i => {
      if (i === 0) return { ask: d.ask0, items: mkItems([
        I(`${money(W)} × ${mx(p / 100)} = ${money(part)}`, true, `${ok('Right.')} ${p}% = ${mx(p / 100)}, and ${mx(p / 100)} × ${money(W)} = ${money(part)}. ${d.right0}`),
        I(`${money(W)} × ${p} = ${money(W * p)}`, false, `${no('Not quite.')} ${money(W * p)} is ${p} times the whole ${d.wholeName}. The ${d.partName} is only a small part of it. ${p}% means ${p} out of 100, so multiply by ${mx(p / 100)}.`),
        I(`${money(W)} × ${mx(m)} = ${money(total)}`, false, `${no('Not quite.')} ${money(total)} is the ${d.totalName}: ${up ? `the ${d.wholeName} with the ${d.partName} added on` : `what is left after the ${d.partName} is taken out`}. The question asks for the ${d.partName} alone: ${mx(p / 100)} × ${money(W)} = ${money(part)}.`),
        I(`${money(W)} ÷ ${p} = about ${money(W / p)}`, false, `${no('Not quite.')} ${money(W)} ÷ ${p} is about ${money(W / p)}, which is about ${pc(100 / p)} of ${money(W)}, not ${p}%. Dividing by ${p} is not the same as ${p} out of every 100.`)
      ]) };
      return { ask: d.ask1, items: mkItems([
        I(`${money(W)} ${up ? '+' : MINUS} ${money(part)} = ${money(total)}`, true, `${ok('Right.')} ${d.right1} As one multiplier: ${mx(m)} × ${money(W)} = ${money(total)}, which is ${100 + (up ? p : -p)}% of the ${d.wholeName}.`),
        I(`${money(part)}`, false, `${no('Not quite.')} ${money(part)} is only the ${d.partName}. The ${d.totalName} is more than that: ${up ? `it also includes the ${d.wholeName}` : `it is what is left of the ${d.wholeName}`}.`),
        I(`${money(W)} ${up ? MINUS : '+'} ${money(part)} = ${money(up ? W - part : W + part)}`, false, `${no('Not quite.')} ${up ? `That takes the ${d.partName} away. The ${d.partName} is added on, so the total is more than ${money(W)}.` : `That adds the ${d.partName}. It is taken out, so the total is less than ${money(W)}.`}`),
        I(`${money(W)} ${up ? '+' : MINUS} ${p} = ${money(up ? W + p : W - p)}`, false, `${no('Not quite.')} ${p} is a percent, not dollars. The ${d.partName} is ${money(part)}, so use that.`)
      ]) };
    };
    const scene = S => {
      const k = S.stage;
      const rows = [{ name: d.wholeLabel, val: money(W), segs: [{ a: 0, b: W, k: 'base' }], br: [] },
        { name: d.totalLabel, val: money(total), segs: moveSegs(W, total), br: k >= 1 ? [moveBr(W, total, `${sg}${p}% of ${money(W)} = ${sg}${money(part)}`)] : [] }];
      const tag = [[d.tagWhole, moneyR(W)]];
      if (k >= 1) tag.push([`${d.tagPart} (${p}%)`, `${sg}${moneyR(part)}`]);
      if (k >= 2) tag.push([d.tagTotal, moneyR(total), true]);
      return { title: d.title, legend: [['base', d.wholeName.charAt(0).toUpperCase() + d.wholeName.slice(1)], [up ? 'add' : 'cut', up ? 'Added on' : 'Taken out']], rows, nRows: 2, nb: 1, max: Math.max(W, total) * 1.06,
        pend: false, ghost: null, tagTitle: d.tagTitleText, tag, tagN: 3 };
    };
    return { mode: 'rcp', label: d.label, q: d.q, n: 2, stage, scene,
      demo: () => [kk(cap(d.partName), `${money(W)} × ${mx(p / 100)} = ${money(part)}`), kk(cap(d.totalName), `${money(W)} ${up ? '+' : MINUS} ${money(part)} = ${money(total)}`)] };
  };
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  /* sales tax or income tax? */
  const taxSort = () => {
    const Q = [
      { s: 'A $2 tax is added to the $25 price of a notebook at the register.', a: 0, hl: 0,
        ok: 'Sales tax is a percent of the price of something you buy, and the register adds it on top: $25 + $2 = $27.',
        bad: 'Income tax is taken out of wages that a worker earns. This $2 is added to a purchase price, so it is sales tax.' },
      { s: 'A worker earns $400. The employer takes $60 out of the paycheck before the worker gets it.', a: 1, hl: 1,
        ok: 'Income tax is a percent of earned wages. It is taken out (withheld) before the paycheck is paid: $400 − $60 = $340 take-home pay.',
        bad: 'Sales tax is added to a price at the register, so it only happens when you buy something. This $60 is taken out of pay, so it is income tax.' },
      { s: 'You pay this tax only on days when you buy something.', a: 0, hl: 0,
        ok: 'Sales tax comes with a purchase. No purchase, no sales tax.',
        bad: 'Income tax does not depend on shopping. It is taken out of the money a person earns, whether or not they buy anything.' },
      { s: 'A worker has gross pay of $400 but takes home only $340. The $60 difference is this tax.', a: 1, hl: 1,
        ok: 'Gross pay is the pay before tax, and take-home pay is what is left after it. The $60 is income tax withheld from earned wages: $400 − $60 = $340.',
        bad: 'Sales tax is added to what you pay at the register. Here money is taken OUT of pay, so it is income tax.' }
    ];
    const stage = i => {
      const x = Q[i];
      return { ask: `"${x.s}" Which kind of tax is this?`, items: mkItems([
        I('Sales tax', x.a === 0, x.a === 0 ? `${ok('Right.')} ${x.ok}` : `${no('Not quite.')} ${x.bad}`),
        I('Income tax', x.a === 1, x.a === 1 ? `${ok('Right.')} ${x.ok}` : `${no('Not quite.')} ${x.bad}`)
      ]) };
    };
    const scene = S => {
      const k = S.stage, hl = k < 4 ? Q[k].hl : -1;
      const rows = [{ name: 'Receipt: price + sales tax', val: '$27', max: 30, segs: moveSegs(25, 27), br: [moveBr(25, 27, 'sales tax $2 added')] },
        { name: 'Paycheck: pay − income tax', val: '$340', max: 440, segs: moveSegs(400, 340), br: [moveBr(400, 340, 'income tax $60 taken out')] }];
      return { title: 'Two kinds of tax', legend: [['base', 'Money you keep or pay for'], ['add', 'Added'], ['cut', 'Taken out']], rows, nRows: 2, nb: 1, max: 30, hl, pend: false, ghost: null, tagTitle: 'Receipt and pay stub', tagN: 4,
        tag: [['Receipt: notebook', '$25.00'], ['Receipt: sales tax added', '+$2.00'], ['Pay stub: gross pay', '$400.00'], ['Pay stub: income tax taken out', `${MINUS}$60.00`]] };
    };
    return { mode: 'rcp', label: 'Which kind of tax is it?', q: 'A receipt and a pay stub both show a tax. Decide whether each statement is about sales tax or income tax.', n: 4, stage, scene,
      demo: () => [kk('Sales tax', 'added to a price at the register: price + tax = total'), kk('Income tax', 'taken out of earned wages: gross pay − tax = take-home pay')] };
  };

  /* a commission: find the whole */
  const commProb = () => {
    const rate = 8, com = 24, S1 = com / rate, sales = S1 * 100;
    const stage = i => i === 0
      ? { ask: `${rate}% of her sales is ${money(com)}. Which move finds 1% of her sales?`, items: mkItems([
          I(`${money(com)} ÷ ${rate} = ${money(S1)}`, true, `${ok('Right.')} ${rate}% is ${rate} pieces of 1%, and together they are ${money(com)}. So one piece of 1% is ${money(com)} ÷ ${rate} = ${money(S1)}.`),
          I(`${money(com)} × ${rate} = ${money(com * rate)}`, false, `${no('Not quite.')} ${money(com * rate)} is far bigger than the ${money(com)} that ${rate}% gives. 1% is much smaller than ${rate}%, so divide.`),
          I(`${money(com)} ÷ 100 = ${money(com / 100)}`, false, `${no('Not quite.')} ${money(com / 100)} is 1% of the ${money(com)} commission. But the ${money(com)} is ${rate}% of her SALES, so we need 1% of her sales.`),
          I(`${money(com)} × ${mx(rate / 100)} = ${money(com * rate / 100)}`, false, `${no('Not quite.')} That is ${rate}% OF the commission. We want 1% of her sales, and the commission is already ${rate}% of her sales.`)
        ]) }
      : { ask: 'Now find all of her sales, which is 100%.', items: mkItems([
          I(`100 × ${money(S1)} = ${money(sales)}`, true, `${ok('Right.')} 100% is 100 pieces of 1%, so her sales were 100 × ${money(S1)} = ${money(sales)}. Check: ${rate}% of ${money(sales)} is ${money(com)}. The same as ${money(com)} ÷ ${mx(rate / 100)}.`),
          I(`${rate} × ${money(S1)} = ${money(com)}`, false, `${no('Not quite.')} That is the commission again, ${rate} pieces of 1%. All her sales are 100 pieces.`),
          I(`10 × ${money(S1)} = ${money(S1 * 10)}`, false, `${no('Not quite.')} 10 pieces of 1% is only 10% of her sales. The whole is 100 pieces.`),
          I(`100 × ${money(com)} = ${money(com * 100)}`, false, `${no('Not quite.')} That would make ${money(com)} equal to 1% of her sales. But ${money(com)} is ${rate}%, not 1%.`)
        ]) };
    const scene = S => {
      const k = S.stage, solved = k >= 2;
      const rows = [{ name: 'Her sales', val: solved ? money(sales) : '?', segs: [{ a: 0, b: sales, k: solved ? 'base' : 'unk' }], br: [{ a: 0, b: sales, k: 'base', t: solved ? `100% = ${money(sales)}` : '100% = ?' }] },
        { name: `Her ${rate}% commission`, val: money(com), segs: [{ a: 0, b: com, k: 'add' }], br: [{ a: 0, b: com, k: 'add', t: k >= 1 ? `${rate}% = ${money(com)}, 1% = ${money(S1)}` : `${rate}% = ${money(com)}` }] }];
      const tag = [['Commission rate', `${rate}% of sales`], ['Commission earned', moneyR(com)]];
      if (k >= 1) tag.push(['1% of her sales', moneyR(S1)]);
      if (k >= 2) tag.push(['Her sales (100%)', moneyR(sales), true]);
      return { title: 'Commission', legend: [['base', 'Sales'], ['add', 'Commission'], ['unk', 'Not known yet']], rows, nRows: 2, nb: 1, max: sales * 1.04, pend: false, ghost: null, tagTitle: 'Sales record', tag, tagN: 4 };
    };
    return { mode: 'rcp', label: 'Find the sales from a commission', q: `Lena earns an ${rate}% commission, which means she gets ${rate}% of everything she sells. This week her commission was ${money(com)}. How much did she sell?`, n: 2, stage, scene,
      demo: () => [kk('1%', `${money(com)} ÷ ${rate} = ${money(S1)}`), kk('Sales', `100 × ${money(S1)} = ${money(sales)}`)] };
  };

  /* a flat fee is not a percent */
  const feeProb = () => {
    const fee = 4, p1 = 20, p2 = 50;
    const stage = i => i === 0
      ? { ask: `What percent of the ${money(p1)} ticket price is the ${money(fee)} fee?`, items: mkItems([
          I(`${money(fee)} ÷ ${money(p1)} = ${mx(fee / p1)} = ${pc(fee / p1 * 100)}`, true, `${ok('Right.')} The ticket price is the whole (100%), and the fee is a part of it: ${money(fee)} ÷ ${money(p1)} = ${mx(fee / p1)} = ${pc(fee / p1 * 100)}.`),
          I(`${money(fee)} ÷ ${money(p1 + fee)} = about ${pc(fee / (p1 + fee) * 100)}`, false, `${no('Not quite.')} ${money(p1 + fee)} is the total with the fee. The question asks what percent of the TICKET PRICE, ${money(p1)}, the fee is.`),
          I(`${fee}%`, false, `${no('Not quite.')} ${fee} is a number of dollars, not a percent. ${fee}% of ${money(p1)} would be only ${money(p1 * fee / 100)}.`),
          I(`${100 - fee / p1 * 100}%`, false, `${no('Not quite.')} ${100 - fee / p1 * 100}% of ${money(p1)} is ${money(p1 * (1 - fee / p1))}. That is the ticket price minus the fee, not the fee.`)
        ]) }
      : { ask: `The same ${money(fee)} fee is added to a ${money(p2)} ticket. What percent of the price is the fee now?`, items: mkItems([
          I(`${money(fee)} ÷ ${money(p2)} = ${mx(fee / p2)} = ${pc(fee / p2 * 100)}`, true, `${ok('Right.')} A flat fee is the same number of dollars for every ticket, so its percent changes with the price: ${money(fee)} ÷ ${money(p2)} = ${pc(fee / p2 * 100)}. A percent fee, such as 20% of the price, would grow with the price.`),
          I(`${pc(fee / p1 * 100)}, the same as before`, false, `${no('Not quite.')} ${pc(fee / p1 * 100)} of ${money(p2)} would be ${money(p2 * fee / p1)}, but the fee is a flat ${money(fee)}. The percent is smaller because the price is bigger.`),
          I(`${money(fee)} ÷ ${money(p2 + fee)} = about ${pc(fee / (p2 + fee) * 100)}`, false, `${no('Not quite.')} ${money(p2 + fee)} is the total with the fee. Compare the fee with the ticket price, ${money(p2)}.`)
        ]) };
    const scene = S => {
      const k = S.stage, price = k >= 1 ? p2 : p1, pct = fee / price * 100;
      const rows = [{ name: 'Ticket price', val: money(price), segs: [{ a: 0, b: price, k: 'base' }], br: [] },
        { name: 'Total with the fee', val: money(price + fee), segs: moveSegs(price, price + fee), br: [moveBr(price, price + fee, k === 0 || k === 1 ? `+? % of ${money(price)} = +${money(fee)}` : `+${pc(pct)} of ${money(price)} = +${money(fee)}`)] }];
      if (k === 1 || k === 0) rows[1].br = [moveBr(price, price + fee, `+? % of ${money(price)} = +${money(fee)}`)];
      const tag = [['Ticket price', moneyR(price)], ['Service fee (flat)', `+${moneyR(fee)}`]];
      if (k === 1 || k === 2) tag.push([`Fee as a percent of ${money(k === 2 ? p2 : p1)}`, k === 1 ? pc(fee / p1 * 100) : pc(fee / p2 * 100)]);
      tag.push(['Total', moneyR(price + fee), true]);
      return { title: 'Service fee', legend: [['base', 'Ticket price'], ['add', 'Fee']], rows, nRows: 2, nb: 1, max: (p2 + fee) * 1.04, pend: false, ghost: null, tagTitle: 'Ticket order', tag, tagN: 4 };
    };
    return { mode: 'rcp', label: 'A flat fee is not a percent', q: `A ticket website adds a flat ${money(fee)} service fee to every order. Flat means the same number of dollars each time. Ticket prices are ${money(p1)} and ${money(p2)}.`, n: 2, stage, scene,
      demo: () => [kk(`${money(p1)} ticket`, `${money(fee)} ÷ ${money(p1)} = ${pc(fee / p1 * 100)}`), kk(`${money(p2)} ticket`, `${money(fee)} ÷ ${money(p2)} = ${pc(fee / p2 * 100)}`)] };
  };

  /* ---------- all the problems, by job ---------- */
  const MODES = [{ id: 'chain', name: 'Mark up, mark down' }, { id: 'chg', name: 'Percent change' }, { id: 'int', name: 'Simple interest' },
    { id: 'err', name: 'Percent error' }, { id: 'rcp', name: 'Tax, tips and pay' }];
  const PROBS = {
    chain: CH.map(chainProb),
    chg: CG.map(d => d.kind === 'pct' ? chgPct(d) : chgOld(d)),
    int: [
      intProb({ kind: 'int', label: 'Find the interest: $200 at 5%', title: 'Savings account', P: 200, r: 5, t: 3,
        q: 'Maya puts $200 in a savings account. The money she puts in is called the principal. The account pays 5% simple interest each year. How much is in the account after 3 years?' }),
      intProb({ kind: 'rate', label: 'Find the rate: a $400 loan', title: 'Loan', P: 400, r: 6, t: 2,
        q: 'Ben borrows $400. The amount borrowed is called the principal. He pays it back after 2 years, and the simple interest on the loan was $48. What is the yearly interest rate?' }),
      intProb({ kind: 'prin', label: 'Find the principal: $60 earned', title: 'Savings account', P: 500, r: 4, t: 3,
        q: 'Dani puts money in a savings account that pays 4% simple interest each year. After 3 years it has earned $60 in interest. How much money did Dani put in? That amount is called the principal.' }),
      slProb('fee', { label: 'Interest or a fee?', title: 'Account with a fee', fee: 10, fixed: { r: 5 }, show: ['P', 't'], init: { P: 100, r: 5, t: 3 },
        q: 'An account pays 5% simple interest each year, but it charges a flat $10 fee each year. Find the smallest principal, in steps of $100, that earns MORE in interest each year than it pays in fees. Set the principal, then press Check my answer.',
        live: (calc, q) => S => { const o = calc(q(S)); return `${kk('Interest each year', `${o.r}% of ${money(o.P)} = ${money(o.i1)}`)}<br>${kk('Fee each year', money(10))}<br>` + (o.i1 > 10 ? `${ok('Interest wins.')} You gain ${money(o.i1 - 10)} a year.` : o.i1 === 10 ? `${ok('Even.')} The interest and the fee are the same.` : `${no('The fee wins.')} You lose ${money(10 - o.i1)} a year.`); },
        check: (calc, q) => S => {
          const o = calc(q(S)), p = o.P;
          if (p === 300) return { right: true, text: `${ok('Yes.')} At ${money(300)} the interest is 5% of ${money(300)} = ${money(15)} a year, which beats the ${money(10)} fee. The fee is flat, but the interest grows with the principal. The principal must be more than ${money(10)} ÷ 0.05 = ${money(200)}, and ${money(300)} is the first step above that.` };
          if (o.i1 > 10) return { right: false, text: `${no('That works, but it is not the smallest.')} At ${money(p)} the interest is ${money(o.i1)} a year, more than the fee. Try a smaller principal.` };
          if (o.i1 === 10) return { right: false, text: `${no('Close.')} At ${money(p)} the interest is exactly ${money(10)} a year, the same as the fee. The question asks for MORE than the fee, so go one step higher.` };
          return { right: false, text: `${no('Not yet.')} At ${money(p)} the interest is only ${money(o.i1)} a year, and the fee is ${money(10)}. You need a bigger principal.` };
        } }),
      slProb('free', { label: 'Try your own numbers', title: 'Savings account', show: ['P', 'r', 't'], init: { P: 300, r: 4, t: 3 },
        q: 'Set the principal, the yearly rate and the number of years. Watch the interest add up as one equal bar for each year.',
        live: (calc, q) => S => { const o = calc(q(S)); return `${kk('One year', `${money(o.P)} × ${mx(o.r / 100)} = ${money(o.i1)}`)}<br>${kk(`${o.t} year${o.t === 1 ? '' : 's'}`, `${money(o.i1)} × ${o.t} = ${money(o.I)}`)}<br>${kk('Balance', `${money(o.P)} + ${money(o.I)} = ${money(o.bal)}`)}`; } })
    ],
    err: [errProb(ER[0]), errProb(ER[1]), measProb()],
    rcp: [
      partTotal({ label: 'Sales tax at the register', title: 'Receipt', W: 25, p: 8, up: true, wholeName: 'price', partName: 'sales tax', totalName: 'total',
        wholeLabel: 'Price of the notebook', totalLabel: 'Total at the register', tagWhole: 'Notebook', tagPart: 'Sales tax', tagTotal: 'Total', tagTitleText: 'Receipt',
        q: 'A notebook costs $25. The sales tax rate is 8%. You pay the price plus the sales tax at the register. How much do you pay in all?',
        ask0: 'The register adds sales tax. What is the sales tax on the $25 notebook?', right0: 'The register adds this sales tax to the price.',
        ask1: 'What do you pay in all?', right1: 'Sales tax is added on top of the price at the register.' }),
      partTotal({ label: 'Income tax on a paycheck', title: 'Paycheck', W: 400, p: 15, up: false, wholeName: 'gross pay', partName: 'income tax', totalName: 'take-home pay',
        wholeLabel: 'Gross pay (before tax)', totalLabel: 'Take-home pay', tagWhole: 'Gross pay', tagPart: 'Income tax withheld', tagTotal: 'Take-home pay', tagTitleText: 'Pay stub',
        q: 'Sam earns $400 in a week. This is called gross pay. The employer withholds (takes out) 15% of it for income tax. How much is Sam\'s take-home pay?',
        ask0: 'Income tax is a percent of the gross pay. How much income tax is withheld?', right0: 'The employer takes this income tax out of the paycheck.',
        ask1: 'What is the take-home pay?', right1: 'Income tax is taken out of the wages before the worker gets them.' }),
      taxSort(),
      partTotal({ label: 'A tip on a dinner bill', title: 'Dinner', W: 48, p: 15, up: true, wholeName: 'bill', partName: 'tip', totalName: 'amount you pay',
        wholeLabel: 'Dinner bill', totalLabel: 'Bill plus tip', tagWhole: 'Dinner bill', tagPart: 'Tip', tagTotal: 'You pay', tagTitleText: 'Dinner',
        q: 'A dinner bill is $48. You leave a tip of 15% of the bill. How much do you pay in all?',
        ask0: 'A tip is a percent of the bill. What is the tip on a $48 bill?', right0: 'A tip is a percent of the bill.',
        ask1: 'What do you pay in all, the bill and the tip together?', right1: 'The tip is added on top of the bill.' }),
      commProb(),
      feeProb()
    ]
  };

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
    id: 'percent-change-and-money', level: 'school',
    title: 'Percent change and money',
    blurb: 'Mark prices up and down, add tax and tips, earn simple interest, and find percent change and percent error on tape diagrams.',
    thumb(c, p) {
      const pal = p.pal, W = p.w, H = p.h, x0 = W * .08, x1 = W * .92, tw = x1 - x0, X = v => x0 + v / 300 * tw, bh = H * .15, fs = Math.max(9, H * .082);
      const rows = [[H * .2, 200, 200], [H * .45, 200, 240], [H * .7, 192, 240]];
      rows.forEach(([y, a, b], i) => {
        c.fillStyle = alpha(pal.blue, .28); c.fillRect(X(0), y, X(a) - X(0), bh);
        if (i === 1) { c.fillStyle = alpha(pal.yellow, .6); c.fillRect(X(200), y, X(240) - X(200), bh); c.strokeStyle = pal.yellow; c.lineWidth = 1.6; c.strokeRect(X(200), y, X(240) - X(200), bh); }
        if (i === 2) { c.setLineDash([4, 3]); c.strokeStyle = pal.red; c.lineWidth = 1.8; c.strokeRect(X(192), y, X(240) - X(192), bh); c.setLineDash([]); }
        c.strokeStyle = pal.blue; c.lineWidth = 1.8; c.strokeRect(X(0), y, X(a) - X(0), bh);
        c.font = font(fs, 700); c.textBaseline = 'middle'; c.textAlign = 'left'; c.fillStyle = pal.text;
        c.fillText(['$200', '$240', '$192'][i], X(0) + 6, y + bh / 2);
        if (i > 0) { c.textAlign = 'left'; c.fillStyle = pal.text; c.fillText(i === 1 ? '+20%' : '−20%', X(240) + 4, y + bh / 2); }
      });
      line(c, X(200), H * .12, X(200), H * .92, pal.muted, 1.6, [4, 3]);
    },
    hook: String.raw`A bike costs $200. The shop adds 20%, then takes 20% off. Is the bike back to $200?`,
    steps: [
      { title: 'Plus 20%, minus 20%',
        text: String.raw`<p>A bike shop buys a bike for $200 and marks the price up by 20%. The markup is 20% of $200 = $40, so the tag says $240. Then the bike goes on sale for 20% off the tag price, $240. That is 20% of $240 = $48, so a customer pays $192. It is not back at $200, because the second 20% is a part of a bigger amount.</p><p>A multiplier does each step in one move. Markup: × 1.20. Sale: × 0.80. Both together: 1.20 × 0.80 = 0.96, and 0.96 × $200 = $192. Press <b>Try it yourself</b> to pick the multipliers.</p>`,
        set: { mode: 'chain', pi: 0, show: true } },
      { title: 'Percent change: use the old amount',
        text: String.raw`<p>A video game costs $40 in March and $50 in April. The price changed by $50 − $40 = $10.</p><p>A percent change compares the change with the old price, where the price started. $10 ÷ $40 = 0.25, so the price went up 25%. The label on the new bar says +25% of $40 = +$10.</p><p>The dashed red bar shows a common mistake. If you divide by the new price, you get $10 ÷ $50 = 20%. But 20% of $40 is only $8, which would make the new price $48, not $50.</p>`,
        set: { mode: 'chg', pi: 0, show: true } },
      { title: 'Simple interest: equal bars',
        text: String.raw`<p>Maya puts $200 in an account that pays 5% simple interest each year. Each year the bank pays 5% of $200 = $10.</p><p>Simple interest always uses the starting amount, so every year adds an equal bar of $10. After 3 years the interest is 3 × $10 = $30, and the account holds $200 + $30 = $230.</p><p>In one formula: interest = principal × rate × years = $200 × 0.05 × 3 = $30. Later, the Simple interest job lets you set your own principal, rate and years.</p>`,
        set: { mode: 'int', pi: 0, show: true, grow: 3 } },
      { title: 'Percent error: use the true value',
        text: String.raw`<p>A rope is really 50 cm long. You measure it and get 40 cm. The error is the gap: 50 − 40 = 10 cm.</p><p>Percent error compares the error with the true value: 10 ÷ 50 = 0.20 = 20%. The true value is the standard, so it is the 100% bar. Percent error ignores which way the measurement missed.</p><p>The dashed red bar shows dividing by the measurement instead. 10 ÷ 40 = 25%, but 25% of 50 cm is 12.5 cm, which would put the measurement at 37.5 cm, not 40 cm. Then try the <b>Tax, tips and pay</b> job: a receipt adds sales tax, and a paycheck has income tax taken out.</p>`,
        set: { mode: 'err', pi: 0, show: true } }
    ],
    formal: String.raw`
      <h3>Percent of what? The base</h3>
      <p>A percent is always a percent <em>of</em> some amount. That amount is the <em>base</em>, and it is the \(100\%\). The same percent gives different dollars when the base changes: \(20\%\) of \(\$200\) is \(\$40\), but \(20\%\) of \(\$240\) is \(\$48\). Before you use a percent, ask what the \(100\%\) is.</p>
      <h3>Multipliers for increase and decrease</h3>
      <p>Raising an amount by \(p\%\) leaves \((100+p)\%\) of it, so multiply by \(1+\dfrac{p}{100}\). Lowering it by \(p\%\) leaves \((100-p)\%\), so multiply by \(1-\dfrac{p}{100}\).</p>
      <ul>
        <li>Markup \(20\%\): multiply by \(1.20\). Sales tax \(8\%\): multiply by \(1.08\). Tip \(15\%\): multiply by \(1.15\).</li>
        <li>Markdown or discount \(20\%\): multiply by \(0.80\).</li>
      </ul>
      <p>A markup is a percent of the cost. A markdown or discount is a percent of the price on the tag at that moment. Sales tax and a tip are percents added on top.</p>
      <h3>Several changes in a row</h3>
      <p>Each change uses the amount it starts from, so you multiply the multipliers:
      \[ \$200 \times 1.20 \times 0.80 = \$200 \times 0.96 = \$192. \]
      A \(20\%\) markup followed by a \(20\%\) markdown does <em>not</em> return to \(\$200\), because the markdown is \(20\%\) of the larger price. Adding the percents (\(+20\% - 20\% = 0\%\)) is the mistake. A \(25\%\) markup is undone by a \(20\%\) markdown, because \(1.25 \times 0.80 = 1.00\).</p>
      <p>A \(\$50\) jacket with a \(20\%\) coupon and then \(8\%\) sales tax costs \(\$50 \times 0.80 \times 1.08 = \$43.20\). Adding the percents would give \(\$50 \times 0.88 = \$44\), which is wrong. Because \(0.80 \times 1.08 = 1.08 \times 0.80\), the final price is the same in either order. Only the price in the middle changes.</p>
      <h3>Percent increase and percent decrease</h3>
      \[ \text{percent change} = \frac{\text{new} - \text{old}}{\text{old}} \times 100\%. \]
      <p>A positive answer is a percent increase and a negative answer is a percent decrease. From \(\$40\) to \(\$50\): \(\dfrac{10}{40} = 0.25\), a \(25\%\) increase. From \(\$50\) to \(\$40\): \(\dfrac{-10}{50} = -0.20\), a \(20\%\) decrease. The change is \(\$10\) both times, but the old price is different, so the percent is different. Dividing by the new price is the wrong base.</p>
      <p>To find the old amount, undo the multiplier: old \(=\) new \(\div\) multiplier. After a \(20\%\) cut the new price is \(\$48\): \(48 \div 0.80 = 60\). Check: \(0.80 \times 60 = 48\). Multiplying \(48 \times 1.20\) is wrong, because that adds \(20\%\) of the new price.</p>
      <h3>Simple interest</h3>
      <p>The amount you start with is the <em>principal</em> \(P\). With a yearly rate \(r\) (as a decimal) for \(t\) years, the simple interest is
      \[ I = P \times r \times t. \]
      Simple interest uses only the starting principal, so each year adds the same amount, \(P \times r\). That is why the bars are equal. The balance is \(P + I\). For \(\$200\) at \(5\%\) for \(3\) years: \(200 \times 0.05 \times 3 = \$30\), and the balance is \(\$230\). To find the rate, \(r = \dfrac{I}{P \times t}\). To find the principal, \(P = \dfrac{I}{r \times t}\). (Compound interest, where the interest earns interest, is different and is not covered here.)</p>
      <h3>Fees, commissions and tips</h3>
      <p>A <em>fee</em> is a flat amount of money, such as \(\$4\) per ticket. As a percent of the price it changes: \(\dfrac{4}{20} = 20\%\) for a \(\$20\) ticket and \(\dfrac{4}{50} = 8\%\) for a \(\$50\) ticket. A <em>commission</em> is a percent of sales: commission \(=\) rate \(\times\) sales. A tip is a percent of the bill. If you know the commission, the sales are commission \(\div\) rate: \(24 \div 0.08 = \$300\).</p>
      <h3>Percent error</h3>
      <p>\[ \text{percent error} = \frac{|\text{measured} - \text{true}|}{\text{true}} \times 100\%. \]
      The vertical bars in the top of the fraction mean "the size of", so the error is never negative. Divide by the <em>true</em> value, the standard. A rope that is truly \(50\) cm and measures \(40\) cm has an error of \(10\) cm and a percent error of \(\dfrac{10}{50} = 20\%\). It has the same shape as percent change, with the true value as the base and the direction ignored.</p>
      <h3>Sales tax and income tax</h3>
      <p><em>Sales tax</em> is a percent of the price of something you buy. The register adds it: total \(=\) price \(\times\) \((1 + \text{rate})\). A \(\$25\) notebook with \(8\%\) sales tax costs \(\$27\). <em>Income tax</em> is a percent of the wages a person earns. The employer withholds it from each paycheck, so take-home pay \(=\) gross pay \(-\) tax withheld. With gross pay of \(\$400\) and \(15\%\) withheld, the tax is \(\$60\) and the take-home pay is \(\$340\), which is \(85\%\) of the gross pay.</p>
      <h3>The whole, the part and the percent</h3>
      <p>Every situation here has three quantities, and you can find any one from the other two.</p>
      <ul>
        <li>Part \(=\) percent \(\times\) whole. A tip, a tax, a commission, one year of interest and the amount of a change are parts.</li>
        <li>Percent \(=\) part \(\div\) whole. The rate of interest, the tax rate and a percent change are percents.</li>
        <li>Whole \(=\) part \(\div\) percent. The old price, the principal, the sales and the gross pay are wholes.</li>
      </ul>
      <h3>Does the answer make sense?</h3>
      <p>An increase makes the amount bigger and a decrease makes it smaller. A multiplier above \(1\) grows an amount and a multiplier below \(1\) shrinks it. Check by going forward: if \(\$60\) is the old price and the price was cut \(20\%\), then \(0.80 \times 60\) should give the new price.</p>`,
    check: [
      { q: String.raw`A shirt costs $80. It is 25% off. Then the register adds 6% sales tax to the sale price. How much do you pay?`,
        choices: ['$60.00', '$63.60', '$64.80', '$84.80'], answer: 1,
        why: String.raw`25% off leaves 75% of $80: 0.75 × $80 = $60. The tax is 6% of the $60 sale price, so you pay 1.06 × $60 = $63.60. One multiplier does both steps: 0.75 × 1.06 = 0.795, and 0.795 × $80 = $63.60. The answer $60.00 forgets the tax. The answer $64.80 takes the tax from the $80 starting price (6% of $80 is $4.80) and adds it to $60. The tax is figured on the sale price. The answer $84.80 adds the tax to $80 and forgets the discount.`,
        hint: String.raw`Find the sale price first. Then take 6% of the sale price, not of $80.` },
      { q: String.raw`The price of a skateboard dropped from $80 to $60. What is the percent decrease?`,
        choices: ['20%', '33⅓%', '75%', '25%'], answer: 3,
        why: String.raw`The price dropped by $80 − $60 = $20. A percent change compares the change with the OLD price: $20 ÷ $80 = 0.25 = 25%. The answer 33⅓% divides by the new price ($20 ÷ $60), which is the wrong base. The answer 75% is the new price as a percent of the old price ($60 ÷ $80), not the change. The answer 20% uses the dollar change as if it were a percent.`,
        hint: String.raw`First find the change in dollars. Then divide it by the price the skateboard started at.` }
    ],
    links: { prereq: ['percents-on-tape-and-number-lines'], related: ['proportional-relationships', 'exponential-growth', 'unit-rates-and-best-buys'] },

    mount({ stage, controls: C }) {
      const P = new Plane(stage, { span: 5 });
      const cvEl = P.canvas, prevMin = stage.style.minHeight;
      stage.style.minHeight = '480px';   /* a tape diagram, a price tag and a slider strip need room on small screens */
      if (P.coordEl) P.coordEl.style.display = 'none';
      cvEl.tabIndex = 0;
      cvEl.setAttribute('role', 'img');
      cvEl.setAttribute('aria-label', 'Tape diagrams of prices and amounts, with a price tag or receipt below. When a marker is shown, use the left and right arrow keys to move it.');
      const st = { mode: 'chain', pi: 0, stage: 0, picks: {}, fb: '', ghost: null, order: 0, pos: 0, grow: 0, show: false, mem: null, sl: { P: 100, r: 5, t: 3 } };
      let cancel = () => {};
      let probSel, modeBtns, gSl, ro;
      const slid = {};

      const prob = () => PROBS[st.mode][st.pi];
      const modeIdx = () => MODES.findIndex(m => m.id === st.mode);
      const sceneNow = () => prob().scene(st);
      const stageNow = () => (st.stage < prob().n ? prob().stage(st.stage) : null);
      const placeNow = () => { const S = stageNow(); return !st.show && S && S.place ? S.place : null; };

      /* ---------- layout (pixel space) ---------- */
      const lay = sc => {
        const W = P.w || 400, H = P.h || 400, fs = clamp(W * .034, 11.5, 15), padX = clamp(W * .05, 14, 40);
        const g = { W, H, fs, x0: padX, x1: W - padX, max: sc.max, nameH: fs + 8, brH: fs + 10 };
        g.legY = 22 + fs + 10; g.rowsTop = g.legY + 20;
        const tagH = sc.tagN ? 32 + sc.tagN * (fs + 6) : 0, plH = sc.hasPlace ? 92 : 0;
        const rowFix = g.nameH + sc.nb * g.brH + 8;
        g.rowH = clamp((H - g.rowsTop - tagH - plH - 34) / sc.nRows, rowFix + 14, rowFix + (sc.nRows <= 2 ? 60 : 72));
        g.bh = g.rowH - rowFix;
        g.rowsBot = g.rowsTop + sc.nRows * g.rowH;
        g.plTop = g.rowsBot + 4; g.plH = plH; g.tagTop = g.plTop + plH + 6; g.tagH = tagH;
        g.sh = Math.max(0, Math.min(40, (H - 12 - (g.tagTop + tagH)) * .35));
        return g;
      };

      /* ---------- drawing ---------- */
      const drawRow = (c, p, g, sc, row, top, hl) => {
        const pal = p.pal, fs = g.fs, tw = g.x1 - g.x0, mxv = row.max || g.max, X = v => g.x0 + clamp(v / mxv, 0, 1.03) * tw;
        const barTop = top + g.nameH, barBot = barTop + g.bh;
        if (hl) { rrect(c, g.x0 - 8, top - 2, tw + 16, g.rowH - 2, 8); c.fillStyle = alpha(pal.yellow, .14); c.fill(); c.strokeStyle = pal.yellow; c.lineWidth = 1.4; c.stroke(); }
        T(c, p, row.name, g.x0, top + g.nameH / 2, { size: fs, align: 'left', weight: 700, halo: false });
        if (row.val) {
          const nx = g.x0 + mw(c, row.name, fs, 700) + 8, w = mw(c, row.val, fs, 700) + 14, unk = row.val === '?';
          rrect(c, nx, top + 1, w, g.nameH - 3, 9); c.fillStyle = p.pal.stage; c.fill();
          c.strokeStyle = pal.brass; c.lineWidth = 1.5; c.setLineDash(unk ? [3, 3] : []); c.stroke(); c.setLineDash([]);
          T(c, p, row.val, nx + w / 2, top + g.nameH / 2 - .5, { size: fs - 1, weight: 700, halo: false });
        }
        for (const s of row.segs) {
          const xa = X(s.a), xb = X(s.b), w = xb - xa;
          if (w < .5) continue;
          c.lineJoin = 'miter';
          if (s.k === 'base') { c.fillStyle = alpha(pal.blue, .3); c.fillRect(xa, barTop, w, g.bh); c.strokeStyle = pal.blue; c.lineWidth = 2; c.strokeRect(xa, barTop, w, g.bh); }
          else if (s.k === 'add') { c.fillStyle = alpha(pal.yellow, s.alt ? .4 : .62); c.fillRect(xa, barTop, w, g.bh); c.strokeStyle = pal.yellow; c.lineWidth = 2; c.strokeRect(xa, barTop, w, g.bh); }
          else if (s.k === 'cut') { c.fillStyle = alpha(pal.red, s.alt ? .08 : .16); c.fillRect(xa, barTop, w, g.bh); c.setLineDash([5, 3]); c.strokeStyle = pal.red; c.lineWidth = 2; c.strokeRect(xa, barTop, w, g.bh); c.setLineDash([]); }
          else if (s.k === 'unk') { c.fillStyle = alpha(pal.blue, .06); c.fillRect(xa, barTop, w, g.bh); c.setLineDash([5, 3]); c.strokeStyle = pal.blue; c.lineWidth = 2; c.strokeRect(xa, barTop, w, g.bh); c.setLineDash([]); T(c, p, '?', xa + w / 2, barTop + g.bh / 2, { size: fs + 3, halo: false, color: pal.muted }); }
          const tt = [s.t, s.t2].filter(Boolean).find(x => mw(c, x, fs - 1, 700) + 8 < w);
          if (tt) T(c, p, tt, xa + w / 2, barTop + g.bh / 2, { size: fs - 1, halo: false });
        }
        row.br.forEach((b, j) => {
          const y = barBot + 6 + j * g.brH, xa = X(b.a), xb = X(b.b), col = b.k === 'add' ? pal.yellow : b.k === 'cut' ? pal.red : pal.muted;
          line(c, xa, y, xb, y, col, 1.8); line(c, xa, y - 3, xa, y + 3, col, 1.8); line(c, xb, y - 3, xb, y + 3, col, 1.8);
          const wt = mw(c, b.t, fs - 1, 700), cx = clamp((xa + xb) / 2, g.x0 + wt / 2, g.x1 - wt / 2);
          T(c, p, b.t, cx, y + fs * .85 + 2, { size: fs - 1, weight: 700, halo: false });
        });
      };
      /* the slot after the last row: a dashed "?" slot, or the ghost of a wrong pick */
      const drawSlot = (c, p, g, sc, top) => {
        const pal = p.pal, fs = g.fs, tw = g.x1 - g.x0, X = v => g.x0 + clamp(v / g.max, 0, 1.03) * tw, barTop = top + g.nameH, gh = sc.ghost;
        if (!gh) {
          c.setLineDash([4, 4]); c.strokeStyle = alpha(pal.muted, .6); c.lineWidth = 1.4; c.strokeRect(g.x0, barTop, tw, g.bh); c.setLineDash([]);
          T(c, p, '?', g.x0 + 12, barTop + g.bh / 2, { size: fs + 2, halo: false, color: pal.muted });
          return;
        }
        const off = gh.end > g.max * 1.03, xe = X(gh.end);
        const gl = gh.label + (off ? ' (off the scale)' : '');
        let gs = fs - 1; while (gs > 9 && mw(c, gl, gs, 700) > g.x1 - g.x0) gs -= .5;
        T(c, p, gl, g.x0, top + g.nameH / 2, { size: gs, align: 'left', weight: 700, color: pal.red, halo: false });
        c.fillStyle = alpha(pal.red, .08); c.fillRect(g.x0, barTop, xe - g.x0, g.bh);
        c.setLineDash([5, 3]); c.strokeStyle = pal.red; c.lineWidth = 2; c.strokeRect(g.x0, barTop, xe - g.x0, g.bh); c.setLineDash([]);
        if (off) { c.beginPath(); c.moveTo(g.x1 - 2, barTop + g.bh / 2 - 8); c.lineTo(g.x1 + 6, barTop + g.bh / 2); c.lineTo(g.x1 - 2, barTop + g.bh / 2 + 8); c.closePath(); c.fillStyle = pal.red; c.fill(); }
      };
      const drawLegend = (c, p, g, sc) => {
        const pal = p.pal, fs = g.fs - 2, y = g.legY;
        let lx = g.x0;
        for (const [k, s] of sc.legend) {
          const w = mw(c, s, fs, 600) + 28;
          if (lx + w > g.x1 + 6) break;
          if (k === 'ref') line(c, lx + 7, y - 7, lx + 7, y + 7, pal.muted, 1.6, [3, 2]);
          else if (k === 'cut' || k === 'guess') { c.setLineDash([3, 2]); c.strokeStyle = pal.red; c.lineWidth = 1.6; c.strokeRect(lx, y - 6, 14, 12); c.setLineDash([]); c.fillStyle = alpha(pal.red, .14); c.fillRect(lx, y - 6, 14, 12); }
          else if (k === 'unk') { c.setLineDash([3, 2]); c.strokeStyle = pal.blue; c.lineWidth = 1.6; c.strokeRect(lx, y - 6, 14, 12); c.setLineDash([]); }
          else { const col = k === 'add' ? pal.yellow : pal.blue; c.fillStyle = alpha(col, k === 'add' ? .62 : .3); c.fillRect(lx, y - 6, 14, 12); c.strokeStyle = col; c.lineWidth = 1.6; c.strokeRect(lx, y - 6, 14, 12); }
          T(c, p, s, lx + 19, y, { size: fs, align: 'left', color: pal.muted, halo: false });
          lx += w + 4;
        }
      };
      const drawPlace = (c, p, g, sc, y) => {
        const pal = p.pal, fs = g.fs, pl = sc.place, X = v => g.x0 + (v - pl.lo) / (pl.hi - pl.lo) * (g.x1 - g.x0), ly = y + 52;
        T(c, p, pl.label + ': drag the marker', g.x0, y + 8, { size: fs - 1, align: 'left', color: pal.muted, halo: false, weight: 700 });
        line(c, X(pl.lo), ly, X(pl.hi), ly, pal['grid-strong'], 2);
        line(c, X(pl.min), ly, X(pl.max), ly, pal.muted, 3.5);
        const skip = X(pl.min + pl.tick) - X(pl.min) < 30 ? 2 : 1;
        let ti = 0;
        for (let v = pl.min; v <= pl.max + 1e-9; v += pl.tick, ti++) {
          line(c, X(v), ly - 5, X(v), ly + 5, pal.muted, 1.5);
          if (ti % skip === 0) T(c, p, (pl.tf || pl.fmt)(v), clamp(X(v), g.x0 + 12, g.x1 - 12), ly + 17, { size: fs - 2, color: pal.muted, halo: false });
        }
        if (pl.mark !== undefined) { line(c, X(pl.mark), ly - 10, X(pl.mark), ly + 8, pal.blue, 2.4); T(c, p, 'true value', X(pl.mark), ly + 32, { size: fs - 2, color: pal.blue, halo: false }); }
        const mx_ = X(st.pos), s = pl.fmt(st.pos), w = mw(c, s, fs, 700) + 16;
        line(c, mx_, ly - 12, mx_, ly + 12, pal.brass, 2.6);
        rrect(c, clamp(mx_, g.x0 + w / 2, g.x1 - w / 2) - w / 2, ly - 36, w, 22, 11); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.brass; c.lineWidth = 1.6; c.stroke();
        T(c, p, s, clamp(mx_, g.x0 + w / 2, g.x1 - w / 2), ly - 25, { size: fs, weight: 700, halo: false });
        c.beginPath(); c.arc(mx_, ly, 11, 0, Math.PI * 2); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.brass; c.lineWidth = 3.4; c.stroke();
      };
      const drawTag = (c, p, g, sc, y) => {
        const L = sc.tag; if (!L.length) return;
        const pal = p.pal, fs = g.fs, lh = fs + 6, w = Math.min(g.x1 - g.x0, 420), x = g.x0, hh = 32 + L.length * lh;
        rrect(c, x, y, w, hh, 8); c.fillStyle = alpha(pal.blue, .06); c.fill();
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.2; c.setLineDash([4, 3]); c.stroke(); c.setLineDash([]);
        T(c, p, sc.tagTitle.toUpperCase(), x + 12, y + 14, { size: fs - 3, align: 'left', color: pal.muted, halo: false, weight: 700 });
        L.forEach(([a, b, bold], i) => {
          const yy = y + 32 + i * lh + lh / 2 - 2;
          if (bold) line(c, x + 10, yy - lh / 2 + 1, x + w - 10, yy - lh / 2 + 1, pal.muted, 1.2);
          T(c, p, a, x + 12, yy, { size: fs - 1, align: 'left', halo: false, weight: bold ? 700 : 600, color: bold ? pal.text : pal.muted });
          T(c, p, b, x + w - 12, yy, { size: fs - 1, align: 'right', halo: false, weight: 700 });
        });
      };
      P.onDraw = (c, p) => {
        const sc = sceneNow(), g = lay(sc);
        c.save(); c.translate(0, g.sh);
        T(c, p, sc.title, g.x0, 22, { size: g.fs + 3, align: 'left', weight: 700, halo: false });
        drawLegend(c, p, g, sc);
        if (sc.ref !== undefined) { const x = g.x0 + sc.ref / g.max * (g.x1 - g.x0); line(c, x, g.rowsTop + 4, x, g.rowsTop + sc.nRows * g.rowH - 8, p.pal.muted, 1.4, [4, 3]); }
        sc.rows.forEach((row, i) => drawRow(c, p, g, sc, row, g.rowsTop + i * g.rowH, sc.hl === i));
        if (sc.pend && sc.rows.length < sc.nRows) drawSlot(c, p, g, sc, g.rowsTop + sc.rows.length * g.rowH);
        if (sc.place) drawPlace(c, p, g, sc, g.plTop);
        drawTag(c, p, g, sc, g.tagTop);
        c.restore();
      };
      const draw = () => P.draw();

      /* ---------- the marker on the strip: dragging, arrow buttons and keys ---------- */
      let drag = false;
      const ptr = e => { const r = cvEl.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      const inStrip = (px, py) => { const pl = placeNow(); if (!pl) return false; const g = lay(sceneNow()), y = py - g.sh; return y > g.plTop - 4 && y < g.plTop + g.plH + 8; };
      const fromPx = px => { const pl = placeNow(), g = lay(sceneNow()); return pl.lo + (px - g.x0) / (g.x1 - g.x0) * (pl.hi - pl.lo); };
      const setPos = v => { const pl = placeNow(); if (!pl) return; st.pos = clamp(snap(v, pl.step), pl.min, pl.max); draw(); };
      const placeDone = () => {
        const pl = placeNow(); if (!pl) return;
        const Pb = prob(), r = Pb.placeCheck(st.stage, st.pos, st);
        st.fb = r.text;
        if (r.right) { if (r.mem !== undefined) st.mem = r.mem; st.stage++; st.ghost = null; enterStage(); }
        render(); draw();
      };
      cvEl.addEventListener('pointerdown', e => {
        const [px, py] = ptr(e);
        if (!inStrip(px, py)) return;
        drag = true; cvEl.setPointerCapture(e.pointerId); e.preventDefault(); cancel(); setPos(fromPx(px));
      });
      cvEl.addEventListener('pointermove', e => {
        const [px, py] = ptr(e);
        if (drag) setPos(fromPx(px)); else cvEl.style.cursor = inStrip(px, py) ? 'grab' : 'default';
      });
      cvEl.addEventListener('pointerup', () => { if (!drag) return; drag = false; placeDone(); });
      cvEl.addEventListener('pointercancel', () => { drag = false; });
      const nudge = dir => { const pl = placeNow(); if (!pl) return; cancel(); setPos(st.pos + dir * pl.step); placeDone(); };
      cvEl.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); nudge(-1); }
        else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); nudge(1); }
      });

      /* ---------- the side panel ---------- */
      const probe = C.readout(), host = probe.parentElement; probe.remove();
      const group = () => { const g = h('div', { style: 'display:flex;flex-direction:column;gap:16px;flex:none' }); host.append(g); return g; };
      const mkSlider = (parent, { label, min, max, step, value, onInput }) => {
        const id = 'pcm' + Math.random().toString(36).slice(2, 8), out = h('output', { for: id }), inp = h('input', { type: 'range', id, min, max, step, value });
        const upd = text => { out.textContent = text; inp.style.setProperty('--p', ((+inp.value - +inp.min) / (+inp.max - +inp.min) * 100) + '%'); };
        inp.addEventListener('input', () => onInput(+inp.value));
        parent.append(h('div', { class: 'ctl slider' }, h('label', { for: id }, label), out, inp));
        return { wrap: parent.lastElementChild, set(v, text) { inp.value = v; upd(text); } };
      };
      const mkSelect = (parent, label, onChange) => {
        const id = 'pcl' + Math.random().toString(36).slice(2, 8), sel = h('select', { id });
        sel.addEventListener('change', () => onChange(sel.value));
        parent.append(h('div', { class: 'ctl select' }, h('label', { for: id }, label), sel));
        return sel;
      };
      const fillSel = (sel, items, value) => { sel.replaceChildren(...items.map((t, i) => h('option', { value: String(i) }, t))); sel.value = String(value); };
      const choiceList = items => h('div', { style: 'display:flex;flex-direction:column;gap:8px;margin:10px 0 4px' }, items.map(it => {
        const b = h('button', { type: 'button', class: 'choice' + (it.state ? ' ' + it.state : ''), html: it.label, onclick: it.onClick });
        Object.assign(b.style, { borderRadius: '12px', textAlign: 'left', width: '100%' }); b.disabled = !!it.state; return b;
      }));
      const smallBtn = (label, onClick, primary) => {
        const b = h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
        Object.assign(b.style, { padding: '6px 14px', minHeight: '36px', fontSize: '.88rem' }); return b;
      };
      const para = (html, style = '') => h('p', { html, style: 'margin:0 0 8px;' + style });

      C.title('Choose a job');
      modeBtns = C.buttons(MODES.map(m => ({ label: m.name, onClick: () => { cancel(); startProblem(m.id, 0, false); } })));
      for (const b of modeBtns) Object.assign(b.style, { padding: '6px 14px', minHeight: '36px', fontSize: '.88rem' });
      probSel = mkSelect(group(), 'Problem', v => { cancel(); startProblem(st.mode, +v, false); });
      gSl = group();
      const SLD = { P: { label: 'Principal (money you start with)', min: 100, max: 1000, step: 100, f: v => money(v) },
        r: { label: 'Yearly rate', min: 1, max: 10, step: 1, f: v => v + '%' }, t: { label: 'Years', min: 1, max: 10, step: 1, f: v => v + (v === 1 ? ' year' : ' years') } };
      for (const k of ['P', 'r', 't']) slid[k] = mkSlider(gSl, { label: SLD[k].label, min: SLD[k].min, max: SLD[k].max, step: SLD[k].step, value: st.sl[k], onInput: v => { cancel(); st.sl[k] = v; st.fb = ''; slid[k].set(v, SLD[k].f(v)); render(); draw(); } });
      ro = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); host.append(ro);

      /* ---------- problems: starting, stages, answers ---------- */
      const enterStage = () => {
        const Pb = prob();
        if (st.stage < Pb.n) { const S = Pb.stage(st.stage); if (S.place) st.pos = S.place.start; }
        const gt = Pb.growAt && Pb.growAt(Math.min(st.stage, Pb.n));
        if (gt !== undefined && Math.abs(gt - st.grow) > 1e-9) { cancel(); cancel = animateTo(st, { grow: gt }, 700, draw); }
      };
      const startProblem = (mode, pi, show) => {
        cancel();
        Object.assign(st, { mode, pi, stage: 0, picks: {}, fb: '', ghost: null, order: 0, show: !!show, mem: null });
        const Pb = prob();
        if (Pb.sl) Object.assign(st.sl, Pb.sl.init);
        st.grow = Pb.growAt ? (Pb.growAt(show ? Pb.n : 0) || 0) : 0;
        if (show) { st.stage = Pb.n; st.ghost = Pb.demoGhost || null; } else enterStage();
        sync();
      };
      const seedOf = () => modeIdx() * 7 + st.pi * 3 + st.stage * 5 + 1;
      const pickItem = key => {
        const S = stageNow(), it = S.items.find(x => x.key === key), id = `${st.stage}:${key}`;
        if (!it.right) { st.picks[id] = 'wrong'; st.fb = it.why; st.ghost = it.ghost || null; render(); draw(); return; }
        st.picks[id] = 'right'; st.fb = it.why; st.ghost = null; if (it.order !== undefined) st.order = it.order; st.stage++; enterStage(); render(); draw();
      };

      const render = () => {
        const Pb = prob(), out = [];
        out.push(para(`<b>${Pb.q}</b>`));
        if (st.show) {
          out.push(para('<span class="k">Worked example</span>'));
          out.push(para(Pb.demo().join('<br>')));
          out.push(smallBtn('Try it yourself', () => { cancel(); startProblem(st.mode, st.pi, false); }, true));
          ro.replaceChildren(...out); return;
        }
        const next = () => { cancel(); startProblem(st.mode, (st.pi + 1) % PROBS[st.mode].length, false); };
        if (Pb.sl) {
          out.push(para('<span class="k">Move the sliders.</span> The bars and the tag change as you move them.'));
          out.push(para(Pb.sl.live(st)));
          if (Pb.sl.check) out.push(h('div', { style: 'margin:0 0 8px' }, smallBtn('Check my answer', () => { const r = Pb.sl.check(st); st.fb = r.text; render(); }, true)));
          if (st.fb) out.push(h('p', { style: 'margin:6px 0 10px;padding-left:10px;border-left:3px solid var(--line-strong);', html: st.fb }));
          out.push(smallBtn('Next problem', next, true));
          ro.replaceChildren(...out); return;
        }
        const S = stageNow(), total = Pb.n;
        if (S) {
          out.push(para(`<span class="k">Step ${st.stage + 1} of ${total}</span> ${S.ask}`));
          if (S.place) {
            const lbl = S.place.fmt(S.place.step);
            out.push(h('div', { style: 'display:flex;gap:8px;margin:6px 0' }, smallBtn('◀ ' + lbl, () => nudge(-1)), smallBtn(lbl + ' ▶', () => nudge(1))));
          } else out.push(choiceList(seat(S.items, seedOf()).map(it => ({ label: it.label, state: st.picks[`${st.stage}:${it.key}`], onClick: () => pickItem(it.key) }))));
        } else out.push(para(`<span class="k">Done</span> Problem ${st.pi + 1} of ${PROBS[st.mode].length}`));
        if (st.fb) out.push(h('p', { style: 'margin:6px 0 10px;padding-left:10px;border-left:3px solid var(--line-strong);', html: st.fb }));
        if (!S) {
          const row = h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' }, smallBtn('Next problem', next, true), smallBtn('Do this one again', () => { cancel(); startProblem(st.mode, st.pi, false); }));
          if (Pb.swapText) row.append(smallBtn(st.order ? 'Back to the first order' : 'Swap the order of the steps', () => { st.order = st.order ? 0 : 1; st.fb = st.order ? Pb.swapText() : ''; render(); draw(); }));
          out.push(row);
        } else if (st.stage > 0 || Object.keys(st.picks).length) out.push(smallBtn('Start this problem over', () => { cancel(); startProblem(st.mode, st.pi, false); }));
        ro.replaceChildren(...out);
      };
      const sync = () => {
        modeBtns.forEach((b, i) => { b.className = MODES[i].id === st.mode ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', MODES[i].id === st.mode); });
        fillSel(probSel, PROBS[st.mode].map(q => q.label), st.pi);
        const Pb = prob(); gSl.style.display = Pb.sl ? 'flex' : 'none';
        if (Pb.sl) for (const k of ['P', 'r', 't']) {
          const vis = Pb.sl.show.includes(k); slid[k].wrap.style.display = vis ? '' : 'none';
          if (vis) slid[k].set(st.sl[k], SLD[k].f(st.sl[k]));
        }
        render(); draw();
      };

      /* ---------- guided steps ---------- */
      const apply = (patch, immediate) => {
        cancel();
        const { mode, pi, show, ...nums } = patch;
        if (mode !== undefined) startProblem(mode, pi || 0, !!show);
        const to = {};
        for (const k of ['grow', 'pos']) if (nums[k] !== undefined) to[k] = nums[k];
        if (Object.keys(to).length) {
          if (immediate) { Object.assign(st, to); draw(); }
          else { if (to.grow !== undefined) st.grow = 0; draw(); cancel = animateTo(st, to, 900, draw); }
        }
      };
      sync();
      return { destroy: () => { cancel(); stage.style.minHeight = prevMin; P.destroy(); }, apply };
    }
  });
}
