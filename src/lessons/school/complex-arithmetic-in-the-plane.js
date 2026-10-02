/* =====================================================================
   SCHOOL — Complex arithmetic in the plane
   ===================================================================== */
{
  /* ---------- complex numbers as [re, im] ---------- */
  const clean = v => { const r = Math.round(v * 1e6) / 1e6; return r === 0 ? 0 : r; };
  const imag = v => (v === 1 ? 'i' : v === -1 ? '−i' : num(v) + 'i');
  const cs = ([a, b]) => {
    a = clean(a); b = clean(b);
    if (!b) return num(a);
    const B = Math.abs(b) === 1 ? 'i' : num(Math.abs(b)) + 'i';
    if (!a) return (b < 0 ? '−' : '') + B;
    return num(a) + (b < 0 ? ' − ' : ' + ') + B;
  };
  const cm = (z, w) => [z[0] * w[0] - z[1] * w[1], z[0] * w[1] + z[1] * w[0]];
  const cdv = (z, w) => { const n = w[0] * w[0] + w[1] * w[1]; return [(z[0] * w[0] + z[1] * w[1]) / n, (z[1] * w[0] - z[0] * w[1]) / n]; };
  const cj = z => [z[0], -z[1]];
  const m2 = z => z[0] * z[0] + z[1] * z[1];
  const ang = z => {
    let a = Math.atan2(z[1], z[0]) * 180 / Math.PI;
    if (a < 0) a += 360;
    if (a < 1e-9 || a > 360 - 1e-9) a = 0;
    return a;
  };
  const deg = a => num(Math.round(a * 10) / 10) + '°';
  const par = v => (v < 0 ? '(' + num(v) + ')' : num(v));
  const pim = v => (v < 0 ? '(' + imag(v) + ')' : imag(v));
  const pz = z => { const a = clean(z[0]), b = clean(z[1]); return a && b ? '(' + cs(z) + ')' : (a < 0 || b < 0) ? '(' + cs(z) + ')' : cs(z); };
  const modS = z => {
    const n = clean(m2(z)), r = Math.sqrt(n);
    if (Number.isInteger(n)) return Number.isInteger(r) ? num(r) : `√${n} ≈ ${num(r)}`;
    return '≈ ' + num(r);
  };
  const same = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 1e-6;
  const good = s => `<b style="color:var(--green)">${s}</b>`, bad = s => `<b style="color:var(--red)">${s}</b>`;
  const show = (el, on) => { el.style.display = on ? '' : 'none'; };
  const BTN = 'border-radius:12px;text-align:left;justify-content:flex-start;width:100%;height:auto;padding:9px 14px';
  const mix = (ok, wrongs, pos) => { const a = wrongs.slice(); ok.ok = true; a.splice(pos % (wrongs.length + 1), 0, ok); return a; };
  const CJ = 'z̄';

  /* ---------- multipliers for the move view ---------- */
  const WS = {
    i:    { v: [0, 1],  t: 'i',      opt: 'i (a quarter turn)' },
    i2:   { v: [-1, 0], t: '−1',     opt: 'i² = −1 (two quarter turns)' },
    i3:   { v: [0, -1], t: '−i',     opt: 'i³ = −i (three quarter turns)' },
    i4:   { v: [1, 0],  t: '1',      opt: 'i⁴ = 1 (four quarter turns)' },
    two:  { v: [2, 0],  t: '2',      opt: '2 (a stretch)' },
    twoi: { v: [0, 2],  t: '2i',     opt: '2i (a stretch and a quarter turn)' },
    onei: { v: [1, 1],  t: '1 + i',  opt: '1 + i' },
    mone: { v: [-1, 1], t: '−1 + i', opt: '−1 + i' }
  };

  /* ---------- FOIL examples: z = a + bi, w = c + di ---------- */
  const EX = [[2, 1, 3, 2], [1, 2, 3, -1], [3, -2, -1, 1]];

  const foilStages = ex => {
    const [a, b, c, d] = EX[ex], R = num, I = imag, ac = a * c, ad = a * d, bc = b * c, bd = b * d;
    const sh = r => (ex + r) % 4;
    const row = (name, expr, okT, okWhy, wr, line, r) => ({
      q: `<span class="k">${name}</span> ${expr} = ?`,
      opts: mix({ t: okT, why: okWhy }, wr, sh(r)), line });
    return [
      row('First:', `${par(a)} · ${par(c)}`, R(ac), `Two plain numbers multiply: ${par(a)} · ${par(c)} = ${R(ac)}.`,
        [{ t: R(a + c), why: 'You added. Multiplying the two parts means a · c, not a + c.' },
         { t: I(ac), why: 'Neither part has an i, so the product has no i.' },
         { t: R(-ac), why: 'The signs of the two numbers decide the sign. Check them again.' }],
        `First: ${par(a)} · ${par(c)} = ${R(ac)}`, 0),
      row('Outer:', `${par(a)} · ${pim(d)}`, I(ad), `One i comes along: ${par(a)} · ${pim(d)} = ${I(ad)}.`,
        [{ t: R(ad), why: 'The i must stay. One of the two factors has an i, so the product has one i.' },
         { t: I(-ad), why: 'Check the sign of the product of the two numbers in front.' },
         { t: R(-ad), why: 'There is only one i here, so there is no i² yet. i² appears only when two i’s meet.' }],
        `Outer: ${par(a)} · ${pim(d)} = ${I(ad)}`, 1),
      row('Inner:', `${pim(b)} · ${par(c)}`, I(bc), `One i comes along: ${pim(b)} · ${par(c)} = ${I(bc)}.`,
        [{ t: R(bc), why: 'The i must stay. The factor with i keeps it.' },
         { t: I(-bc), why: 'Check the sign of the product of the two numbers in front.' },
         { t: R(-bc), why: 'There is only one i here, so there is no i² yet.' }],
        `Inner: ${pim(b)} · ${par(c)} = ${I(bc)}`, 2),
      row('Last:', `${pim(b)} · ${pim(d)}`, R(-bd),
        `The two i’s meet: ${pim(b)} · ${pim(d)} = ${par(bd)}i², and i² = −1, so the product is ${R(-bd)}, a plain number. The i is gone.`,
        [{ t: I(bd), why: 'i · i is i², not i. You multiplied the numbers and kept one i. Replace i² by −1 and the i disappears.' },
         { t: R(bd), why: `You multiplied the numbers but forgot that i · i = i² = −1, which flips the sign: ${par(bd)}i² = ${R(-bd)}.` },
         { t: I(-bd), why: 'The sign flipped, which is right, but i² = −1 is a plain number, so no i is left.' }],
        `Last: ${pim(b)} · ${pim(d)} = ${par(bd)}i² = ${R(-bd)}`, 3),
      { q: `<span class="k">Real part.</span> Add the terms without i: ${R(ac)} + ${par(-bd)} = ?`,
        opts: mix({ t: R(ac - bd), why: `The real terms are First (${R(ac)}) and Last (${R(-bd)}). Their sum is ${R(ac - bd)}.` },
          [{ t: R(ac + bd), why: `That uses Last = ${R(bd)}. But Last is ${R(-bd)}, because i² = −1.` },
           { t: R(ac), why: 'You left out the Last term. It is a plain number, so it belongs in the real part.' },
           { t: R(-(ac - bd)), why: `Check the sign: ${R(ac)} + ${par(-bd)} = ${R(ac - bd)}.` }], sh(1)),
        line: `Real part: ${R(ac)} + ${par(-bd)} = ${R(ac - bd)}` },
      { q: `<span class="k">Imaginary part.</span> Add the terms with i: ${I(ad)} + ${I(bc)} = ?`,
        opts: mix({ t: I(ad + bc), why: `Like terms add, like 4x + 3x: ${I(ad)} + ${I(bc)} = ${I(ad + bc)}.` },
          [{ t: I(ad - bc), why: 'The Outer and Inner terms are added, not subtracted.' },
           { t: I(ad * bc), why: 'The i terms are added, like 4x + 3x = 7x. They are not multiplied.' },
           { t: R(ad + bc), why: 'The part with i keeps its i.' }], sh(2)),
        line: `Imaginary part: ${I(ad)} + ${I(bc)} = ${I(ad + bc)}` }
    ];
  };
  const foilFinal = ex => {
    const z = [EX[ex][0], EX[ex][1]], w = [EX[ex][2], EX[ex][3]], p = cm(z, w);
    return `${good('Done.')} (${cs(z)})(${cs(w)}) = <b>${cs(p)}</b>, the point (${num(p[0])}, ${num(p[1])}) on the plane.<br>` +
      `<span class="k">Check</span> |z|² · |w|² = ${m2(z)} × ${m2(w)} = ${m2(z) * m2(w)}, and |zw|² = ${par(p[0])}² + ${par(p[1])}² = ${m2(p)}. They match.`;
  };

  /* ---------- predict: (1 + i)(1 + i) ---------- */
  const predStage = () => ({
    q: '<span class="k">Predict.</span> z = 1 + i is multiplied by w = 1 + i. Where does zw land? Decide first, then press.',
    opts: [
      { t: '2 + 2i', pt: [2, 2], why: 'That doubles z, which is multiplying by 2, not by 1 + i. Multiplying by 1 + i stretches by only √2 ≈ 1.41, and it also turns.' },
      { t: '2i', ok: true, why: '|zw| = √2 · √2 = 2, and the angle is 45° + 45° = 90°. A point 2 from 0 straight up is 2i. Algebra check: (1 + i)(1 + i) = 1 + i + i + i² = 1 + 2i − 1 = 2i.' },
      { t: '2', pt: [2, 0], why: 'The distance 2 is right, but the angle adds: 45° + 45° = 90°, not 0°. The point is straight up, not to the right.' },
      { t: '0', pt: [0, 0], why: 'That comes from writing (1 + i)² = 1 + i² and losing the middle terms. The distance multiplies: √2 · √2 = 2, so the point cannot be at 0.' }],
    line: '', reveal: true
  });

  /* ---------- conjugate: why is z z̄ real? ---------- */
  const conjStages = () => [
    { q: '<span class="k">Why is it real?</span> Multiply (a + bi)(a − bi). First: a · a = a². Outer: a · (−bi) = −abi. Inner: bi · a = +abi. The two middle terms are...',
      opts: [
        { t: 'opposites, so they add to 0', ok: true, why: '−abi + abi = 0. The i terms cancel, so nothing with i is left.' },
        { t: 'equal, so they add to −2abi', why: 'They are not equal. One is −abi and the other is +abi. They have opposite signs.' },
        { t: 'both abi, so they add to 2abi', why: 'Only the Inner term is +abi. The Outer term is −abi, because the second number has −bi.' },
        { t: 'ab, a plain number', why: 'Each middle term still has one i. Only i · i makes a plain number.' }],
      line: 'Outer + Inner: −abi + abi = 0' },
    { q: '<span class="k">Why not negative?</span> Last: (bi)(−bi) = −b²i². Since i² = −1, this equals...',
      opts: [
        { t: '−b²', why: 'That keeps i² as +1. But i² = −1, so −b²i² = −b² · (−1).' },
        { t: '+b²', ok: true, why: '−b²i² = −b² · (−1) = +b². A square is never negative, so this is zero or positive.' },
        { t: 'b²i', why: 'i · i makes i², not i, and i² is the plain number −1.' },
        { t: '−b²i', why: 'No i is left. i² = −1 is a plain number.' }],
      line: 'Last: −b²i² = +b²' }
  ];
  const conjFinal = '<b>So z · z̄ = a² + b² = |z|².</b> It is real, because the i terms cancel. It is never negative, because a² and b² are squares. It is 0 only when z = 0. And z + z̄ = 2a is always real too.';

  /* ---------- division and solving ---------- */
  const divStages = dv => {
    if (dv === 0) return [
      { q: '<span class="k">Divide</span> (1 + 2i) / (3 − i). To make the bottom a plain number, multiply top and bottom by...',
        opts: mix({ t: '3 + i', why: 'This is the conjugate of the bottom, 3 − i. The bottom becomes (3 − i)(3 + i) = 9 − i² = 10, a plain number. Multiplying top and bottom by the same number is multiplying by 1, so the value does not change.' }, [
          { t: '3 − i', why: 'The bottom becomes (3 − i)(3 − i) = 9 − 6i + i² = 8 − 6i. It still has an i.' },
          { t: '1 − 2i', why: 'That is the conjugate of the TOP. The bottom becomes (3 − i)(1 − 2i) = 3 − 6i − i + 2i² = 1 − 7i. Still an i.' },
          { t: '−3 + i', why: 'The bottom becomes (3 − i)(−3 + i) = −9 + 3i + 3i − i² = −8 + 6i. Still an i. The conjugate flips only the sign of the i part.' }], 1),
        line: 'Multiply top and bottom by 3 + i.' },
      { q: '<span class="k">Top.</span> (1 + 2i)(3 + i) = ?',
        opts: mix({ t: '1 + 7i', why: '1 · 3 = 3, 1 · i = i, 2i · 3 = 6i, 2i · i = 2i² = −2. Real: 3 − 2 = 1. Imaginary: i + 6i = 7i.' }, [
          { t: '5 + 7i', why: 'The real part used 2i · i = +2. But i² = −1, so it is −2, and 3 − 2 = 1.' },
          { t: '3 + 2i', why: 'You multiplied only the matching parts. All four products are needed: First, Outer, Inner, Last.' },
          { t: '1 + 5i', why: 'The real part is right. Outer and Inner are i and 6i, and they add to 7i.' }], 3),
        line: 'Top: (1 + 2i)(3 + i) = 1 + 7i' },
      { q: '<span class="k">Bottom.</span> (3 − i)(3 + i) = ?',
        opts: mix({ t: '10', why: '3 · 3 = 9, 3 · i = 3i, −i · 3 = −3i, −i · i = −i² = +1. The i terms cancel, and 9 + 1 = 10. This is 3² + 1² = |3 − i|².' }, [
          { t: '8', why: 'The Last term is −i · i = −i² = +1, so it adds 1. It does not subtract 1.' },
          { t: '9', why: 'You dropped the Last term. It is +1, not 0.' },
          { t: '6', why: 'You added the two numbers. Multiply them.' }], 0),
        line: 'Bottom: (3 − i)(3 + i) = 10' },
      { q: '<span class="k">Quotient.</span> (1 + 7i) / 10 = ?',
        opts: mix({ t: '0.1 + 0.7i', why: 'Divide BOTH parts by 10: 1/10 = 0.1 and 7/10 = 0.7.' }, [
          { t: '1 + 0.7i', why: 'You divided only the i part. The bottom is 10 for the whole top.' },
          { t: '0.1 + 7i', why: 'You divided only the real part. Both parts are divided by 10.' },
          { t: '10 + 70i', why: 'That multiplies by 10. Dividing by 10 makes the parts smaller.' }], 2),
        line: 'Quotient: (1 + 7i) / 10 = 0.1 + 0.7i' },
      { q: '<span class="k">Check by multiplying back.</span> (0.1 + 0.7i)(3 − i) = ?',
        opts: mix({ t: '1 + 2i', why: '0.1 · 3 = 0.3, 0.1 · (−i) = −0.1i, 0.7i · 3 = 2.1i, 0.7i · (−i) = −0.7i² = +0.7. Real: 0.3 + 0.7 = 1. Imaginary: −0.1i + 2.1i = 2i. That is the top, so the division was right.' }, [
          { t: '−0.4 + 2i', why: 'The real part used −0.7i² = −0.7. But i² = −1, so it is +0.7, and 0.3 + 0.7 = 1.' },
          { t: '0.3 − 0.7i', why: 'You multiplied only the matching parts. All four products are needed.' },
          { t: '1 − 2i', why: 'The real part is right. Check the signs of Outer and Inner: −0.1i and +2.1i add to +2i.' }], 0),
        line: 'Check: (0.1 + 0.7i)(3 − i) = 1 + 2i, the top.' }
    ];
    if (dv === 1) return [
      { q: '<span class="k">Solve</span> z + 3 = 2 − i. Which move on both sides leaves z alone?',
        opts: mix({ t: 'Subtract 3', why: 'Subtracting 3 undoes adding 3, and doing it to both sides keeps the equation true.' }, [
          { t: 'Add 3', why: 'That makes the left side z + 6. Undo an addition with a subtraction.' },
          { t: 'Divide by 3', why: 'Dividing would also change z. The 3 is added, so subtract it.' },
          { t: 'Multiply by i', why: 'That turns everything a quarter turn. It does not isolate z.' }], 0),
        line: 'Subtract 3 from both sides.' },
      { q: '<span class="k">Compute</span> z = (2 − i) − 3.',
        opts: mix({ t: '−1 − i', why: 'Only the real part changes: 2 − 3 = −1. The −i stays.' }, [
          { t: '5 − i', why: 'That adds 3. You are subtracting it.' },
          { t: '−1 + i', why: 'Only the real part changes. The −i stays −i.' },
          { t: '−1', why: 'The −i is still there. Subtracting a real number does not touch the imaginary part.' }], 2),
        line: 'z = (2 − i) − 3 = −1 − i' },
      { q: '<span class="k">Check.</span> z + 3 = (−1 − i) + 3 = ?',
        opts: mix({ t: '2 − i', why: 'Adding the real number 3 slides the point 3 to the right. (−1, −1) goes to (2, −1), which is 2 − i. It matches.' }, [
          { t: '2 + i', why: 'Adding 3 does not change the imaginary part. It stays −i.' },
          { t: '−4 − i', why: 'That subtracts 3. You are adding 3 to check.' }], 1),
        line: 'Check: (−1 − i) + 3 = 2 − i' }
    ];
    return [
      { q: '<span class="k">Solve</span> z(1 + i) = 2i. Which move on both sides leaves z alone?',
        opts: mix({ t: 'Divide by 1 + i', why: 'z is multiplied by 1 + i, so undo it by dividing by 1 + i. Both sides must be divided.' }, [
          { t: 'Subtract 1 + i', why: 'Subtraction undoes addition. Here z is multiplied.' },
          { t: 'Multiply by 1 + i', why: 'That gives z(1 + i)², which is more tangled, not less.' },
          { t: 'Divide by i', why: 'That leaves z(1 + i)/i. The factor 1 + i is still stuck to z.' }], 2),
        line: 'Divide both sides by 1 + i: z = 2i / (1 + i).' },
      { q: '<span class="k">Make the bottom real.</span> Multiply top and bottom of 2i / (1 + i) by...',
        opts: mix({ t: '1 − i', why: 'This is the conjugate of the bottom, so (1 + i)(1 − i) = 1 − i² = 2 is a plain number.' }, [
          { t: '1 + i', why: '(1 + i)(1 + i) = 1 + 2i + i² = 2i. Still imaginary.' },
          { t: 'i', why: '(1 + i) · i = i + i² = −1 + i. Still has an i.' },
          { t: '2i', why: '(1 + i)(2i) = 2i + 2i² = −2 + 2i. Still has an i.' }], 0),
        line: 'Multiply top and bottom by 1 − i.' },
      { q: '<span class="k">Top.</span> 2i(1 − i) = ?',
        opts: mix({ t: '2 + 2i', why: '2i · 1 = 2i and 2i · (−i) = −2i² = +2. So the top is 2 + 2i.' }, [
          { t: '−2 + 2i', why: 'The second product is −2i² = −2(−1) = +2, not −2.' },
          { t: '2i', why: 'You dropped 2i · (−i). It is +2, a plain number.' },
          { t: '2 − 2i', why: 'The sign of the i part is +2i, from 2i · 1. Only the real part comes from i².' }], 1),
        line: 'Top: 2i(1 − i) = 2 + 2i' },
      { q: '<span class="k">Bottom.</span> (1 + i)(1 − i) = ?',
        opts: mix({ t: '2', why: '1 − i + i − i² = 1 − i² = 1 + 1 = 2. This is 1² + 1² = |1 + i|².' }, [
          { t: '0', why: 'That treats the result as 1 + i² = 0. But the Last term is −i² = +1, so it is 1 + 1.' },
          { t: '1', why: 'You dropped the Last term. It is +1.' },
          { t: '−2', why: 'A product of conjugates is never negative.' }], 3),
        line: 'Bottom: (1 + i)(1 − i) = 2' },
      { q: '<span class="k">Divide.</span> z = (2 + 2i) / 2 = ?',
        opts: mix({ t: '1 + i', why: 'Divide both parts by 2.' }, [
          { t: '2 + 2i', why: 'You forgot to divide by the bottom, 2.' },
          { t: '1 + 2i', why: 'Both parts are divided by 2, not only the real part.' },
          { t: '2 + i', why: 'Both parts are divided by 2, not only the i part.' }], 0),
        line: 'z = (2 + 2i) / 2 = 1 + i' },
      { q: '<span class="k">Check.</span> z(1 + i) = (1 + i)(1 + i) = ?',
        opts: mix({ t: '2i', why: '1 + i + i + i² = 1 + 2i − 1 = 2i. It matches the right side. This is also the product you predicted earlier.' }, [
          { t: '0', why: 'That comes from (1 + i)² = 1 + i². The middle terms i + i = 2i are missing.' },
          { t: '2', why: 'The real part is 1 − 1 = 0 and the imaginary part is 2, so the result is 2i.' },
          { t: '1 + 2i', why: 'The Last term i · i = i² = −1 must be added to the 1.' }], 2),
        line: 'Check: (1 + i)(1 + i) = 2i' }
    ];
  };
  const divFinal = dv => dv === 0
    ? `${good('Done.')} (1 + 2i) / (3 − i) = 0.1 + 0.7i. Geometry: dividing divides the moduli (√5 ≈ 2.24 divided by √10 ≈ 3.16 is √0.5 ≈ 0.71) and subtracts the angles. The angle of the answer is 81.9°.`
    : dv === 1 ? `${good('Done.')} z = −1 − i. Adding a plain number slides the point sideways, so subtracting 3 slides it back.`
    : `${good('Done.')} z = 1 + i. Teaser: multiplying by a + bi is also a 2 × 2 matrix, with rows (a, −b) and (b, a). The Matrices lessons show how a matrix moves the plane.`;
  const DVNAME = ['Divide (1 + 2i) / (3 − i)', 'Solve z + 3 = 2 − i', 'Solve z(1 + i) = 2i'];

  /* ---------- practice problems (a fixed list) ---------- */
  const IT = (p, t, col) => ({ p, t, col });
  const PROBS = [
    { tag: 'Multiply (FOIL)',
      q: 'Multiply (2 + 3i)(1 − 4i). Which answer is right?',
      hint: 'Four products: First 2 · 1, Outer 2 · (−4i), Inner 3i · 1, Last 3i · (−4i). The Last one has i · i.',
      view: { cx: 6, cy: 0, span: 10, gs: 2, ts: 2 },
      base: { items: [IT([2, 3], 'z = 2 + 3i', 'blue'), IT([1, -4], 'w = 1 − 4i', 'green')] },
      win: { items: [IT([14, -5], 'zw = 14 − 5i', 'red')] },
      choices: [
        { t: '−10 − 5i', pt: [-10, -5], why: 'That treats i² as +1, so Last becomes −12 instead of +12. Since i² = −1, 3i · (−4i) = −12i² = +12.' },
        { t: '14 − 5i', ok: true, why: 'First 2 · 1 = 2. Outer 2 · (−4i) = −8i. Inner 3i · 1 = 3i. Last 3i · (−4i) = −12i² = +12. Real: 2 + 12 = 14. Imaginary: −8i + 3i = −5i.' },
        { t: '2 − 12i', pt: [2, -12], why: 'You multiplied the real parts and the imaginary parts separately. Every part of the first number meets every part of the second: four products, not two.' },
        { t: '14 − 11i', pt: [14, -11], why: 'The real part is right. But Inner is 3i · 1 = +3i, not −3i, so the imaginary part is −8i + 3i = −5i.' }] },
    { tag: 'Multiply by i is a turn',
      q: 'Multiply i · (3 − 2i). Which answer is right, and which turn about 0 does it make?',
      hint: 'i · 3 = 3i. i · (−2i) = −2i². Then compare the point (3, −2) with the answer: which way did it go round?',
      view: { cx: 0.5, cy: 0.5, span: 5, gs: 1, ts: 1 },
      base: { items: [IT([3, -2], 'z = 3 − 2i', 'blue')] },
      win: { items: [IT([2, 3], 'iz = 2 + 3i', 'red')], circles: [{ r: Math.sqrt(13), col: 'blue' }], arcs: [{ a0: 360 - Math.atan2(2, 3) * 180 / Math.PI, a1: 450 - Math.atan2(2, 3) * 180 / Math.PI, r: 0, k: 1, col: 'green', t: '90°' }] },
      choices: [
        { t: '2 + 3i, a quarter turn counterclockwise (90°)', ok: true, why: 'i · 3 = 3i, and i · (−2i) = −2i² = +2. So the answer is 2 + 3i. The point (3, −2) moves to (2, 3). Multiplying by i sends (x, y) to (−y, x): a quarter turn counterclockwise. The distance from 0 stays √13.' },
        { t: '2 + 3i, a quarter turn clockwise (−90°)', why: 'The number is right, but the turn is the other way. The point goes from the lower right up to the upper right, which is against the hands of a clock. (Clockwise would be multiplying by −i.)' },
        { t: '−3 + 2i, a half turn (180°)', pt: [-3, 2], why: 'That is multiplying by −1 = i², which turns (3, −2) to (−3, 2). A single i is only a quarter turn.' },
        { t: '−2 + 3i, a quarter turn counterclockwise', pt: [-2, 3], why: 'The Last term is −2i · i = −2i² = +2, not −2. A quarter turn counterclockwise sends (3, −2) to (2, 3), not to (−2, 3).' }] },
    { tag: 'Modulus, two ways',
      q: 'Find |(3 + 4i)(5 − 12i)| two ways: multiply first and then find the distance from 0, or multiply the two distances |3 + 4i| and |5 − 12i|. What is the answer?',
      hint: 'Way 2 first: |3 + 4i| = √(9 + 16) and |5 − 12i| = √(25 + 144). Then check with way 1.',
      view: { cx: 1, cy: -1, span: 15, gs: 5, ts: 5 },
      base: { items: [IT([3, 4], 'z = 3 + 4i', 'blue'), IT([5, -12], 'w = 5 − 12i', 'green')], circles: [{ r: 5, col: 'blue' }, { r: 13, col: 'green' }] },
      win: { note: 'zw = 63 − 16i is 65 from 0, off the page' },
      choices: [
        { t: '63', why: '63 is only the real part of the product 63 − 16i. The distance uses both parts: √(63² + 16²) = √4225 = 65.' },
        { t: '18', why: 'That adds the distances 5 + 13. The rule multiplies them: 5 × 13 = 65.' },
        { t: '4225', why: '4225 = 65² is |zw|². Take the square root to get the distance, 65.' },
        { t: '65', ok: true, why: 'Way 1: (3 + 4i)(5 − 12i) = 15 − 36i + 20i − 48i² = 63 − 16i, and √(63² + 16²) = √(3969 + 256) = √4225 = 65. Way 2: |3 + 4i| = 5 and |5 − 12i| = 13, and 5 × 13 = 65. Both ways agree.' }] },
    { tag: 'The conjugate product',
      q: 'Let z = 2 − 5i. Its conjugate is z̄ = 2 + 5i. What is z · z̄?',
      hint: 'Outer and Inner cancel. The Last term is (−5i)(5i). Is the answer allowed to be negative?',
      view: { cx: 2, cy: 0, span: 7, gs: 1, ts: 1 },
      base: { items: [IT([2, -5], 'z = 2 − 5i', 'blue'), IT([2, 5], `${CJ} = 2 + 5i`, 'red')], guides: [{ a: [2, -5], b: [2, 5], col: 'muted' }] },
      win: { bar: { x: 29, t: 'z · z̄ = 29 (off the page)' } },
      choices: [
        { t: '−21', pt: [-21, 0], why: 'That treats i² as +1: 4 − 25 = −21. But (−5i)(5i) = −25i² = +25, so 4 + 25 = 29. A conjugate product is never negative.' },
        { t: '4', why: '4 is only the First term. Outer and Inner cancel, but Last = (−5i)(5i) = +25 is a plain number and must be added.' },
        { t: '29', ok: true, why: '(2 − 5i)(2 + 5i) = 4 + 10i − 10i − 25i² = 4 + 25 = 29. It equals 2² + 5² = |z|², a real number.' },
        { t: '√29', pt: [5.39, 0], why: '√29 ≈ 5.39 is |z|, the distance from 0. The product z · z̄ is |z|² = 29, with no square root.' }] },
    { tag: 'Divide',
      q: 'Compute (5 + i) / (2 − i). Which answer is right?',
      hint: 'Multiply top and bottom by the conjugate of the bottom, 2 + i. The bottom becomes 2² + 1².',
      view: { cx: 2, cy: 0.5, span: 6, gs: 1, ts: 1 },
      base: { items: [IT([5, 1], 'z = 5 + i', 'blue'), IT([2, -1], 'w = 2 − i', 'green')] },
      win: { items: [IT([1.8, 1.4], 'q = 1.8 + 1.4i', 'red')] },
      choices: [
        { t: '2.5 − i', pt: [2.5, -1], why: 'That divides real by real and imaginary by imaginary. Division by a complex number does not work part by part. Multiply top and bottom by the conjugate 2 + i first.' },
        { t: '1.8 + 1.4i', ok: true, why: 'Top: (5 + i)(2 + i) = 10 + 5i + 2i + i² = 9 + 7i. Bottom: (2 − i)(2 + i) = 4 − i² = 5. So (9 + 7i)/5 = 1.8 + 1.4i. Check: (1.8 + 1.4i)(2 − i) = 3.6 − 1.8i + 2.8i − 1.4i² = 5 + i.' },
        { t: '2.2 + 1.4i', pt: [2.2, 1.4], why: 'The imaginary part is right. But in the top, i² = −1: 10 + 5i + 2i − 1 = 9 + 7i, so the real part is 9/5 = 1.8, not 11/5.' },
        { t: '(9 + 7i) / 3', pt: [3, 2.33], why: 'The top is right. The bottom is (2 − i)(2 + i) = 4 − i² = 4 + 1 = 5, not 3. The i² term adds 1.' }] },
    { tag: 'Spot the trap',
      q: 'A student writes (1 + i)² = 1² + i² = 1 − 1 = 0. What is the mistake, and what is (1 + i)²?',
      hint: 'Squaring means (1 + i)(1 + i): four products, not two.',
      view: { cx: 0.5, cy: 1, span: 3.5, gs: 1, ts: 1 },
      base: { items: [IT([1, 1], 'z = 1 + i', 'blue')], circles: [{ r: Math.SQRT2, col: 'blue' }] },
      win: { items: [IT([0, 2], 'z² = 2i', 'red')] },
      choices: [
        { t: 'Squaring a sum is not squaring each part. (1 + i)² = (1 + i)(1 + i) = 1 + 2i + i² = 2i', ok: true, why: 'FOIL gives four products: 1 · 1 = 1, 1 · i = i, i · 1 = i, i · i = −1. Real: 1 − 1 = 0. Imaginary: i + i = 2i. The picture agrees: 1 + i is √2 from 0 at 45°, so its square is 2 from 0 at 90°, which is 2i.' },
        { t: 'There is no mistake. (1 + i)² = 0', pt: [0, 0], why: 'The middle terms are lost. (1 + i)² has an Outer and an Inner term that add to 2i. Also, 1 + i is √2 ≈ 1.41 from 0, so its square is √2 · √2 = 2 from 0, never 0.' },
        { t: 'The mistake is using i² = −1. The answer is 1 + 2i', pt: [1, 2], why: 'i² = −1 is right and needed. The mistake is losing the middle terms. With them: 1 + 2i + i² = 1 + 2i − 1 = 2i. Your 1 + 2i forgets to use i² = −1 on the Last term.' },
        { t: 'Squaring doubles both parts. (1 + i)² = 2 + 2i', pt: [2, 2], why: 'Squaring does not double the parts. FOIL gives 1 + 2i − 1 = 2i. The point 2 + 2i is √8 ≈ 2.83 from 0, but the square of a point √2 from 0 is 2 from 0.' }] },
    { tag: 'Solve an equation',
      q: 'Solve z(1 + i) = 2i for z. Which value of z is right?',
      hint: 'z is multiplied by 1 + i, so divide by 1 + i. Multiply top and bottom by the conjugate 1 − i.',
      view: { cx: 0, cy: 1, span: 3.5, gs: 1, ts: 1 },
      base: { items: [IT([0, 2], 'z(1 + i) = 2i', 'red')] },
      win: { items: [IT([1, 1], 'z = 1 + i', 'blue')] },
      choices: [
        { t: '−1 + i', pt: [-1, 1], why: 'You subtracted 1 + i. That undoes an addition, not a multiplication. Check: (−1 + i)(1 + i) = −1 − i + i + i² = −2, not 2i.' },
        { t: '−2 + 2i', pt: [-2, 2], why: 'You multiplied by 1 + i: 2i(1 + i) = 2i + 2i² = −2 + 2i. To undo a multiplication, divide.' },
        { t: 'i', pt: [0, 1], why: 'Check: i(1 + i) = i + i² = −1 + i, not 2i. Divide instead: z = 2i / (1 + i).' },
        { t: '1 + i', ok: true, why: 'z = 2i / (1 + i). Multiply top and bottom by 1 − i. Top: 2i(1 − i) = 2i − 2i² = 2 + 2i. Bottom: (1 + i)(1 − i) = 1 − i² = 2. So z = 1 + i. Check: (1 + i)(1 + i) = 2i.' }] }
  ];
  const NP = PROBS.length;

  /* ---------- the lesson ---------- */
  register({
    id: 'complex-arithmetic-in-the-plane', level: 'school',
    title: 'Complex arithmetic in the plane',
    blurb: 'Multiply, conjugate and divide complex numbers, and watch multiplication turn and stretch points on the plane.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0.5; p.cy = 0.9; p.span = 3.6;
      p.grid(1);
      const r = 26, a0 = Math.atan2(1, 2), a1 = a0 + Math.PI / 2;
      c.beginPath(); c.arc(p.X(0), p.Y(0), r, -a0, -a1, true); c.strokeStyle = pal.green; c.lineWidth = 3; c.stroke();
      p.arrow(0, 0, 2, 1, pal.blue, 3.2); p.arrow(0, 0, -1, 2, pal.red, 3.2);
      p.dot(2, 1, 5, pal.blue, pal.stage, 1.5); p.dot(-1, 2, 5, pal.red, pal.stage, 1.5);
    },
    hook: String.raw`Multiplying 3 by 2 stretches the number line. What does multiplying a point of the plane by \(i\) do to it, and how do you divide when the bottom of a fraction has an \(i\) in it?`,
    steps: [
      { title: 'Multiply with FOIL',
        text: String.raw`<p>To multiply \((a+bi)(c+di)\), multiply every part of the first by every part of the second: <b>F</b>irst, <b>O</b>uter, <b>I</b>nner, <b>L</b>ast. Then use \(i^2=-1\).</p><p><b>Your turn:</b> in the panel, choose the four products for \((2+i)(3+2i)\), then the real and imaginary parts. The answer appears as a point on the plane.</p>`,
        set: { view: 'foil' } },
      { title: 'Multiplying is a move',
        text: String.raw`<p>Multiply \(z\) by \(i\) and its point turns a quarter turn (90°) counterclockwise about 0. Multiply by 2 and it stretches. Multiply by \(1+i\) and it turns 45° and stretches by \(\sqrt2\).</p><p>Here \(z=2+i\) and \(iz=-1+2i\). Drag \(z\), pick a multiplier, and test the rule: the modulus (distance from 0) multiplies and the angle adds. Then predict \((1+i)(1+i)\).</p>`,
        set: { view: 'move', zr: 2, zi: 1, wk: 'i' } },
      { title: 'The conjugate',
        text: String.raw`<p>The <b>conjugate</b> of \(z=a+bi\) is \(\bar z=a-bi\), the mirror image of \(z\) in the real axis. For \(z=2+3i\), \(\bar z=2-3i\) and \(z\bar z=4+9=13\), a real number.</p><p>Move \(z\) to several places. Is \(z\bar z\) ever negative? Is it ever not real? Then pick the algebra that explains why.</p>`,
        set: { view: 'conj', cr: 2, ci: 3 } },
      { title: 'Division, and solving',
        text: String.raw`<p>To divide, multiply the top and the bottom by the conjugate of the bottom. The bottom becomes a real number, and the value does not change, because you multiplied by 1.</p><p>In the panel, work out \(\dfrac{1+2i}{3-i}\) and check by multiplying back. Then use the same ideas to solve \(z+3=2-i\) and \(z(1+i)=2i\).</p>`,
        set: { view: 'div' } }
    ],
    formal: String.raw`
      <h3>Where the names come from</h3>
      <p>The words "imaginary" and "complex" are old names. They do not mean these numbers are fake. Electrical engineers use complex numbers to describe alternating current, and signal processing uses them to describe waves. A complex number \(z=a+bi\) is the point \((a,b)\): \(a\) is measured along the real axis and \(b\) along the imaginary axis.</p>
      <h3>Multiplying</h3>
      <p>Multiply \(a+bi\) by \(c+di\) with the same distributive law you use for polynomials, then replace \(i^2\) by \(-1\):
      \[ (a+bi)(c+di)=ac+adi+bci+bd\,i^2=(ac-bd)+(ad+bc)\,i. \]
      <em>Worked example.</em> \((2+i)(3+2i)=6+4i+3i+2i^2=6+7i-2=4+7i\). The classic mistakes are writing \(i\cdot i=i\) (it is \(i^2\)) and writing \(i^2=1\) (it is \(-1\)). Another is \((1+i)^2=1+i^2\): squaring a sum has a middle term, \((1+i)^2=1+2i+i^2=2i\).</p>
      <h3>Multiplying turns and stretches</h3>
      <p>Multiply \(z=a+bi\) by \(i\): \(i(a+bi)=ai+bi^2=-b+ai\). So the point \((a,b)\) goes to \((-b,a)\). That is the quarter turn counterclockwise about the origin that you met in the rigid motions lesson. Multiplying by 2 sends \((a,b)\) to \((2a,2b)\), a stretch from the origin.</p>
      <p>In general describe a complex number by its <b>modulus</b> \(|z|=\sqrt{a^2+b^2}\) (its distance from 0) and its <b>angle</b> (measured counterclockwise from the positive real axis, in degrees from \(0^\circ\) up to \(360^\circ\)). The rule is
      \[ |zw|=|z|\,|w|, \qquad \text{angle of } zw = \text{angle of } z + \text{angle of } w, \]
      where you subtract a full turn of \(360^\circ\) if the sum reaches it. The lesson shows the angle rule by examples and does not prove it. The distance rule can be proved with the algebra above:
      \[ |zw|^2=(ac-bd)^2+(ad+bc)^2=a^2c^2+b^2d^2+a^2d^2+b^2c^2=(a^2+b^2)(c^2+d^2), \]
      because the cross terms \(-2abcd\) and \(+2abcd\) cancel.</p>
      <p><em>Example.</em> \(z=2+i\), \(w=1+i\). Then \(|z|=\sqrt5\), \(|w|=\sqrt2\), and \(zw=1+3i\) has \(|zw|=\sqrt{10}=\sqrt5\cdot\sqrt2\). The angles are about \(26.57^\circ+45^\circ=71.57^\circ\), the angle of \(1+3i\). For \(z=w=1+i\): the distance is \(\sqrt2\cdot\sqrt2=2\), the angle is \(45^\circ+45^\circ=90^\circ\), so \(zw=2i\). Algebra agrees: \((1+i)^2=2i\).</p>
      <h3>The conjugate</h3>
      <p>The conjugate of \(z=a+bi\) is \(\bar z=a-bi\), the mirror image of \(z\) in the real axis. Then
      \[ z\bar z=(a+bi)(a-bi)=a^2-abi+abi-b^2i^2=a^2+b^2=|z|^2, \qquad z+\bar z=2a. \]
      The middle terms cancel, and \(-b^2i^2=+b^2\). So \(z\bar z\) is real, never negative, and zero only for \(z=0\). Example: for \(z=2-5i\), \(z\bar z=4+25=29\).</p>
      <h3>Dividing</h3>
      <p>If \(w\neq0\), multiply the top and the bottom by \(\bar w\):
      \[ \frac{z}{w}=\frac{z\bar w}{w\bar w}=\frac{z\bar w}{|w|^2}. \]
      The bottom is now a real number, and the fraction has the same value because \(\bar w/\bar w=1\). <em>Worked example.</em>
      \[ \frac{1+2i}{3-i}=\frac{(1+2i)(3+i)}{(3-i)(3+i)}=\frac{3+i+6i+2i^2}{9-i^2}=\frac{1+7i}{10}=0.1+0.7i. \]
      <em>Check by multiplying back:</em> \((0.1+0.7i)(3-i)=0.3-0.1i+2.1i-0.7i^2=1+2i\). Geometrically, \((z/w)\,w=z\), so dividing divides the distances and subtracts the angles: \(|z/w|=|z|/|w|\).</p>
      <h3>Solving equations</h3>
      <p>The set of complex numbers contains the real numbers, which contain the rationals, the integers and the whole numbers. In the complex numbers every equation \(az=b\) with \(a\neq0\) has the solution \(z=b/a\), and the division above shows how to compute it. Examples: \(z+3=2-i\) gives \(z=-1-i\). And \(z(1+i)=2i\) gives \(z=\dfrac{2i}{1+i}=\dfrac{2i(1-i)}{2}=i(1-i)=1+i\). Check: \((1+i)(1+i)=2i\).</p>
      <h3>A teaser: complex numbers as matrices</h3>
      <p>Multiplying \(x+yi\) by \(a+bi\) gives \((ax-by)+(bx+ay)i\). That is the same as the matrix
      \[ \begin{pmatrix} a & -b \\ b & a \end{pmatrix}\begin{pmatrix} x \\ y \end{pmatrix}=\begin{pmatrix} ax-by \\ bx+ay \end{pmatrix}. \]
      For \(i\) (\(a=0,\ b=1\)) the matrix is the quarter turn. The Matrices lessons show how a matrix moves the plane.</p>
      <h3>Common mistakes</h3>
      <p>Writing \(i\cdot i=i\) or \(i^2=1\). Multiplying only matching parts, as if \((a+bi)(c+di)=ac+bd\,i\). Writing \((1+i)^2=1+i^2\). Dividing real by real and imaginary by imaginary. Multiplying by the conjugate of the top instead of the bottom. Adding the distances instead of multiplying them.</p>`,
    check: [
      { q: 'A point z is on the complex plane, not at 0. It is multiplied by i. What happens to the point?',
        choices: ['It moves up 1 unit.',
                  'It turns a quarter turn (90°) counterclockwise about 0 and stays the same distance from 0.',
                  'It turns a half turn (180°) about 0.',
                  'It is reflected in the real axis.'], answer: 1,
        why: 'For z = a + bi, i·z = −b + ai, so the point (a, b) goes to (−b, a). That is a quarter turn counterclockwise with the same distance from 0. Moving up 1 unit is adding i, not multiplying. A half turn is multiplying by i² = −1. A reflection in the real axis is taking the conjugate.',
        hint: 'Try z = 1 + 0i, the point (1, 0). Where is i·1?' },
      { q: 'Compute (4 + 3i) / (1 − 2i). Write the answer as a + bi.',
        choices: ['2 + 2.2i', '4 − 1.5i', '−0.4 + 2.2i', '−2 + 11i'], answer: 2,
        why: 'Multiply top and bottom by 1 + 2i, the conjugate of the bottom. Top: (4 + 3i)(1 + 2i) = 4 + 8i + 3i + 6i² = −2 + 11i. Bottom: (1 − 2i)(1 + 2i) = 1 + 4 = 5. Divide both parts by 5: −0.4 + 2.2i. Check: (−0.4 + 2.2i)(1 − 2i) = −0.4 + 0.8i + 2.2i − 4.4i² = 4 + 3i. The choice 2 + 2.2i uses i² = +1 in the top. The choice 4 − 1.5i divides part by part. The choice −2 + 11i forgets to divide by 5.',
        hint: 'Multiply top and bottom by 1 + 2i. The bottom becomes 1² + 2².' },
      { q: 'A student computes (2 + 3i)(2 − 3i) like this: 4 − 6i + 6i − 9i² = 4 − 9i² = 4 − 9 = −5. Which statement finds the error?',
        choices: ['The step 4 − 9i² = 4 − 9 is wrong. Since i² = −1, −9i² = +9, so the answer is 4 + 9 = 13, which is |z|² and cannot be negative.',
                  'The middle terms −6i and +6i should not cancel.',
                  'The answer should be 4 − 9i, because i² cannot be replaced.',
                  'There is no error. A product of conjugates can be negative.'], answer: 0,
        why: 'The first step is fine: First 4, Outer −6i, Inner +6i, Last −9i². The error is replacing i² by +1. Since i² = −1, −9i² = +9, and 4 + 9 = 13 = 2² + 3² = |z|². A conjugate product is a sum of squares, so it is never negative. The middle terms do cancel.',
        hint: 'What is i²? What is −9 times that number?' }
    ],
    links: { prereq: ['imaginary-numbers-and-the-complex-plane'], next: ['complex-roots-of-quadratics'], related: ['rigid-motions-and-congruence', 'matrices', 'determinants-and-inverse-matrices', 'polar-form-and-roots-of-unity', 'the-mandelbrot-and-julia-sets', 'pythagorean-theorem'] },

    mount({ stage, controls: C }) {
      const st = { view: 'foil', mode: 'explore', ex: 0, zr: 2, zi: 1, wk: 'i', cr: 2, ci: 3, dv: 0, anim: false,
                   pi: 0, tries: 0, done: false, right: 0, finished: 0, mark: null, pairs: [], seen: [] };
      let cancelA = () => {};
      const P = new Plane(stage, { span: 6.8 }), cv = P.canvas;
      if (P.coordEl) P.coordEl.style.display = 'none';
      cv.tabIndex = 0; cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', 'The complex plane. A complex number a + bi is the point (a, b), with the real part along the horizontal axis and the imaginary part along the vertical axis. The numbers and results are also written in the panel next to the picture.');
      const tmp = C.readout(), host = tmp.parentNode; host.removeChild(tmp);
      const grp = build => {
        const i = host.children.length; build();
        const w = h('div', { style: 'display:flex;flex-direction:column;gap:16px' });
        [...host.children].slice(i).forEach(e => w.append(e)); host.append(w); return w;
      };
      const redraw = () => P.requestDraw();

      /* ---------- a stage-by-stage multiple choice flow ---------- */
      const makeFlow = (onChange) => {
        const box = h('div', { style: 'display:flex;flex-direction:column;gap:10px' });
        const log = h('div', { class: 'ctl readout' }), qd = h('div', { class: 'ctl readout' });
        const ob = h('div', { style: 'display:flex;flex-direction:column;gap:8px' }), fb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        box.append(log, qd, ob, fb); host.append(box);
        const F = { k: 0, stages: [], lines: [], marks: [], fin: '', done: false };
        const render = refocus => {
          log.innerHTML = F.lines.join('<br>'); show(log, F.lines.length > 0);
          ob.textContent = '';
          if (F.k < F.stages.length) {
            const s = F.stages[F.k]; qd.innerHTML = s.q; show(qd, true);
            s.opts.forEach((o, i) => {
              const b = h('button', { type: 'button', class: 'btn', style: BTN }, o.t);
              b.addEventListener('click', () => pick(i, b)); ob.append(b);
            });
            if (refocus && ob.firstChild) ob.firstChild.focus({ preventScroll: true });
          } else { qd.innerHTML = F.fin; show(qd, !!F.fin); }
          show(ob, F.k < F.stages.length);
        };
        const pick = (i, b) => {
          const s = F.stages[F.k], o = s.opts[i], had = ob.contains(document.activeElement);
          if (s.onPick) s.onPick(i, o);
          if (o.ok) {
            if (s.line) F.lines.push(s.line);
            F.marks = []; fb.innerHTML = `${good('Correct.')} ${o.why}`; F.k++;
            if (F.k >= F.stages.length) F.done = true;
            render(had);
          } else if (s.reveal) {
            F.marks = o.pt ? [o.pt] : []; fb.innerHTML = `${bad('Not quite.')} ${o.why} The picture now shows where it really lands.`;
            F.k++; if (F.k >= F.stages.length) F.done = true;
            render(false);
          } else {
            b.disabled = true; F.marks = o.pt ? [o.pt] : [];
            fb.innerHTML = `${bad('Not quite.')} ${o.why} Try another answer.`;
            if (had) { const nx = [...ob.children].find(e => !e.disabled); if (nx) nx.focus({ preventScroll: true }); }
          }
          onChange();
        };
        F.load = (stages, fin) => { Object.assign(F, { k: 0, stages, lines: [], marks: [], fin: fin || '', done: false }); fb.innerHTML = ''; render(false); };
        return F;
      };

      /* ---------- panel groups ---------- */
      let exB, foilHead, FF, zrS, ziS, wSel, moveRO, MF, crS, ciS, conjRO, CF, dvSel, DF;
      const gFoil = grp(() => {
        C.title('FOIL workbench');
        C.hint('Pick an example. For each part choose the answer and read why.');
        exB = C.buttons(EX.map((e, i) => ({ label: 'Example ' + (i + 1), onClick: () => { st.ex = i; loadFoil(); } })));
        foilHead = h('div', { class: 'ctl readout' }); host.append(foilHead);
        FF = makeFlow(() => { redraw(); });
      });
      const gMove = grp(() => {
        C.title('Move the point');
        C.hint('Drag the ring on z, or use the sliders. Then choose what to multiply by.');
        zrS = C.slider({ label: 'Real part of z', min: -3, max: 3, step: 1, value: st.zr, format: v => num(v), onInput: v => { cancelA(); st.zr = v; refresh(); } });
        ziS = C.slider({ label: 'Imaginary part of z', min: -3, max: 3, step: 1, value: st.zi, format: v => num(v), onInput: v => { cancelA(); st.zi = v; refresh(); } });
        wSel = C.select({ label: 'Multiply z by', value: st.wk, options: Object.keys(WS).map(k => ({ value: k, label: WS[k].opt })), onChange: v => { cancelA(); st.wk = v; refresh(); } });
        moveRO = C.readout();
        C.title('Predict, then see');
        MF = makeFlow(() => { refresh(); });
      });
      const gConj = grp(() => {
        C.title('Conjugates');
        C.hint('Drag the ring on z, or use the sliders. Try at least five different z.');
        crS = C.slider({ label: 'Real part of z', min: -3, max: 3, step: 1, value: st.cr, format: v => num(v), onInput: v => { cancelA(); st.cr = v; refresh(); } });
        ciS = C.slider({ label: 'Imaginary part of z', min: -3, max: 3, step: 1, value: st.ci, format: v => num(v), onInput: v => { cancelA(); st.ci = v; refresh(); } });
        conjRO = C.readout();
        C.title('Why is it always real?');
        CF = makeFlow(() => { refresh(); });
      });
      const gDiv = grp(() => {
        C.title('Divide and solve');
        dvSel = C.select({ label: 'Choose a task', value: '0', options: DVNAME.map((t, i) => ({ value: String(i), label: t })), onChange: v => { st.dv = +v; loadDiv(); } });
        DF = makeFlow(() => { redraw(); });
      });

      /* ---------- practice group ---------- */
      let pStatus, pQ, pCh, pFb, hintB, nextB, startB, backB;
      const gPrac = grp(() => {
        C.title('Practice');
        C.hint('Seven short problems. Pick an answer and read why. Nothing is saved.');
        startB = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { st.right = 0; st.finished = 0; loadProb(0); } }])[0];
        pStatus = h('div', { class: 'ctl readout' }); pQ = h('div', { class: 'ctl readout' });
        pCh = h('div', { style: 'display:flex;flex-direction:column;gap:8px' }); pFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        host.append(pStatus, pQ, pCh);
        hintB = C.buttons([{ label: 'Hint', onClick: () => { pFb.innerHTML = `<span class="k">Hint</span> ${PROBS[st.pi].hint}`; } }])[0];
        host.append(pFb);
        [nextB, backB] = C.buttons([
          { label: 'Next problem', primary: true, onClick: () => { if (st.pi + 1 < NP) loadProb(st.pi + 1); else { st.right = 0; st.finished = 0; loadProb(0); } } },
          { label: 'Back to the lesson', onClick: () => leavePrac() }]);
      });
      const pracEls = [pStatus, pQ, pCh, hintB.parentNode, pFb, nextB.parentNode];

      /* ---------- scenes ---------- */
      const scene = () => {
        if (st.mode === 'practice') {
          const pb = PROBS[st.pi], S = { ...pb.view, items: [...(pb.base.items || [])], arcs: [...(pb.base.arcs || [])], circles: [...(pb.base.circles || [])],
            guides: [...(pb.base.guides || [])], bar: pb.base.bar || null, note: pb.base.note || null, marks: st.mark ? [st.mark] : [] };
          if (st.done) {
            const w = pb.win;
            S.items.push(...(w.items || [])); S.arcs.push(...(w.arcs || [])); S.circles.push(...(w.circles || []));
            S.bar = w.bar || S.bar; S.note = w.note || S.note;
          }
          return S;
        }
        const S = { cx: 0, cy: 0, span: 7.4, gs: 1, ts: 1, items: [], arcs: [], circles: [], guides: [], bar: null, note: null, marks: [] };
        if (st.view === 'foil') {
          const [a, b, c, d] = EX[st.ex], z = [a, b], w = [c, d];
          Object.assign(S, { cx: 1.5, cy: 2.5, span: 6.8 });
          S.items.push(IT(z, 'z = ' + cs(z), 'blue'), IT(w, 'w = ' + cs(w), 'green'));
          if (FF.done) S.items.push(IT(cm(z, w), 'zw = ' + cs(cm(z, w)), 'red'));
        } else if (st.view === 'move') {
          const z = [st.zr, st.zi], w = WS[st.wk].v, zw = cm(z, w);
          S.span = Math.max(4.4, 1.5 + Math.max(Math.abs(z[0]), Math.abs(z[1]), ...Object.values(WS).map(o => { const q = cm(z, o.v); return Math.max(Math.abs(q[0]), Math.abs(q[1])); })));
          S.items.push(IT(z, 'z', 'blue'), IT(w, 'w', 'green'), IT(zw, 'zw', 'red'));
          S.legend = [{ t: 'z = ' + cs(z), col: 'blue' }, { t: 'w = ' + WS[st.wk].t, col: 'green' }, { t: 'zw = ' + cs(zw), col: 'red' }];
          if (m2(z) > 1e-9) {
            const tz = ang(z), tw = ang(w), tzw = ang(zw);
            S.circles.push({ r: Math.hypot(z[0], z[1]), col: 'blue' });
            if (Math.abs(Math.hypot(zw[0], zw[1]) - Math.hypot(z[0], z[1])) > 1e-6) S.circles.push({ r: Math.hypot(zw[0], zw[1]), col: 'red' });
            S.legend[0].t += ' at ' + deg(tz); S.legend[1].t += ' at ' + deg(tw); S.legend[2].t += ' at ' + deg(tzw);
            if (tz > 1e-6) S.arcs.push({ a0: 0, a1: tz, k: 1, col: 'blue' });
            if (tw > 1e-6) S.arcs.push({ a0: tz, a1: tz + tw, k: 2, col: 'green' });
            if (tzw > 1e-6) S.arcs.push({ a0: 0, a1: tzw, k: 3, col: 'red' });
          }
          S.marks = MF.marks.map(p => p);
        } else if (st.view === 'conj') {
          const z = [st.cr, st.ci], zb = cj(z), sum = 2 * z[0], prod = m2(z);
          S.span = Math.max(4.4, 1.5 + Math.max(Math.abs(sum), Math.abs(z[1])));
          S.items.push(IT(z, 'z = ' + cs(z), 'blue'));
          if (z[1] !== 0) S.items.push(IT(zb, CJ + ' = ' + cs(zb), 'red'));
          S.guides.push({ a: z, b: zb, col: 'muted' });
          S.items.push({ p: [sum, 0], t: 'z + ' + CJ + ' = ' + num(sum), col: 'green', arrow: false, dx: 0, al: 'center', dy: -40 });
          S.bar = { x: prod, t: 'z · ' + CJ + ' = ' + num(prod) };
        } else {
          Object.assign(S, { cx: 1, cy: 0.5, span: 4.2 });
          const k = DF.k;
          if (st.dv === 0) {
            const z = [1, 2], w = [3, -1];
            S.items.push(IT(z, 'top = 1 + 2i', 'blue'), IT(w, 'bottom = 3 − i', 'green'));
            if (k >= 4) S.items.push({ p: [0.1, 0.7], t: 'q = 0.1 + 0.7i', col: 'red', dx: -12, al: 'right', dy: -6 });
          } else if (st.dv === 1) {
            S.items.push({ p: [2, -1], t: 'z + 3 = 2 − i', col: 'red' });
            if (k >= 2) { S.items.push({ p: [-1, -1], t: 'z = −1 − i', col: 'blue' }); S.guides.push({ a: [-1, -1], b: [2, -1], col: 'green', t: '+3', arrow: true }); }
          } else {
            Object.assign(S, { cx: 0.5, cy: 1, span: 3.6 });
            S.items.push(IT([1, 1], 'w = 1 + i', 'green'), IT([0, 2], 'z(1 + i) = 2i', 'red'));
            if (k >= 5) S.items.push(IT([1, 1], 'z = 1 + i', 'blue'));
          }
          S.marks = DF.marks.map(p => p);
        }
        if (st.view === 'foil') S.marks = FF.marks.map(p => p);
        if (st.view === 'conj') S.marks = [];
        return S;
      };

      /* ---------- drawing ---------- */
      const T = (c, p, s, px, py, color, size, align, bold) => {
        c.font = `${bold ? 700 : 600} ${size}px "Hanken Grotesk","Helvetica Neue",Arial,sans-serif`; c.textBaseline = 'middle';
        const w = c.measureText(s).width;
        if (align === 'left' && px + w > p.w - 4) align = 'right'; else if (align === 'right' && px - w < 4) align = 'left';
        else if (align === 'center') { px = clamp(px, w / 2 + 4, p.w - w / 2 - 4); }
        py = clamp(py, size / 2 + 3, p.h - size / 2 - 3);
        c.textAlign = align; c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(s, px, py);
        c.fillStyle = color; c.fillText(s, px, py);
      };
      P.onDraw = (c, p) => {
        const S = scene(); p.cx = S.cx; p.cy = S.cy; p.span = S.span;
        const pal = p.pal, fs = clamp(p.scale * .7, 13, 16), b = p.bounds();
        p.grid(S.gs); p.ticks(S.ts, { size: 15 });
        T(c, p, 'real axis', p.X(b.x1) - 8, p.Y(0) - 16, pal.muted, fs, 'right');
        T(c, p, 'imaginary axis', p.X(0) + 10, p.Y(b.y1) + 14, pal.muted, fs, 'left');
        const x0 = p.X(0), y0 = p.Y(0);
        S.circles.forEach(ci => { c.beginPath(); c.arc(x0, y0, ci.r * p.scale, 0, TAU); c.strokeStyle = alpha(pal[ci.col], .45); c.lineWidth = 1.8; c.setLineDash([6, 5]); c.stroke(); c.setLineDash([]); });
        S.guides.forEach(g => {
          if (g.arrow) { p.arrow(g.a[0], g.a[1], g.b[0], g.b[1], pal[g.col], 3.4); T(c, p, g.t, p.X((g.a[0] + g.b[0]) / 2), p.Y(g.a[1]) + 20, pal[g.col], fs, 'center'); }
          else p.path([g.a, g.b], { stroke: alpha(pal[g.col], .8), width: 1.8, dash: [5, 5] });
        });
        if (S.bar) {
          const lim = b.x1 - 0.4, X1 = Math.min(S.bar.x, lim), clip = S.bar.x > lim;
          p.path([[0, 0], [X1, 0]], { stroke: alpha(pal.yellow, .9), width: 9 });
          T(c, p, S.bar.t + (clip && !/off the page/.test(S.bar.t) ? ' →' : ''), p.X(X1) - (clip ? 4 : 0), p.Y(0) + 36, pal.text, fs, clip ? 'right' : 'center');
        }
        S.arcs.forEach(a => {
          const r = a.r || clamp(p.scale * .55, 18, 28) + (a.k - 1) * 10, a0 = a.a0 * Math.PI / 180, a1 = a.a1 * Math.PI / 180;
          c.beginPath(); c.arc(x0, y0, r, -a0, -a1, a1 > a0); c.strokeStyle = pal[a.col]; c.lineWidth = 3.2; c.stroke();
          if (a.t && Math.abs(a.a1 - a.a0) >= 14) {
            const m = (a0 + a1) / 2;
            T(c, p, a.t, x0 + (r + 16) * Math.cos(m), y0 - (r + 16) * Math.sin(m), pal[a.col], fs, 'center', true);
          }
        });
        const seen = [];
        S.items.forEach(it => {
          const [x, y] = it.p, col = pal[it.col];
          if (it.arrow !== false) p.arrow(0, 0, x, y, col, 3.6);
          p.dot(x, y, 6, col, pal.stage, 2);
          const n = Math.hypot(x, y) || 1, ux = x / n, uy = y / n, al = ux > .35 ? 'left' : ux < -.35 ? 'right' : 'center';
          const k = seen.filter(q => same(q, it.p)).length; seen.push(it.p);
          if (it.t) T(c, p, it.t, p.X(x) + (it.dx ?? (al === 'left' ? 11 : al === 'right' ? -11 : 0)), p.Y(y) + (it.dy ?? (uy >= 0 ? -17 : 19)) + k * 20, col, fs, it.al || (it.dx != null ? 'left' : al), true);
        });
        if (st.mode === 'explore' && ((st.view === 'move') || st.view === 'conj')) {
          const q = st.view === 'move' ? [st.zr, st.zi] : [st.cr, st.ci];
          p.dot(q[0], q[1], 13, null, pal.brass, 2.6);
        }
        S.marks.forEach(m => {
          if (m[0] < b.x0 || m[0] > b.x1 || m[1] < b.y0 || m[1] > b.y1) return;
          p.dot(m[0], m[1], 12, alpha(pal.red, .18), pal.red, 2.6);
          T(c, p, 'your pick', p.X(m[0]) + 14, p.Y(m[1]) + 22, pal.red, fs, 'left', true);
        });
        if (S.legend) S.legend.forEach((l, i) => T(c, p, l.t, 24, p.h - 24 - (S.legend.length - 1 - i) * (fs + 7), pal[l.col], fs, 'left', true));
        if (S.note) T(c, p, S.note, 24, p.h - 24, pal.text, fs, 'left', true);
      };

      /* ---------- readouts ---------- */
      const moveInfo = () => {
        const z = [st.zr, st.zi], w = WS[st.wk].v, zw = cm(z, w);
        if (m2(z) < 1e-9) return `<span class="k">z</span> 0. The point is at the origin, which has no angle, and zw = 0.`;
        const tz = ang(z), tw = ang(w), tzw = ang(zw), sum = tz + tw;
        const ln = (nm, q, t) => `<span class="k">${nm}</span> ${cs(q)} · modulus ${modS(q)} · angle ${deg(t)}`;
        const angLine = sum >= 360 - 1e-9 ? `${deg(tz)} + ${deg(tw)} = ${deg(sum)}, and 360° is a full turn, so ${deg(sum - 360)}` : `${deg(tz)} + ${deg(tw)} = ${deg(sum)}`;
        return ln('z', z, tz) + '<br>' + ln('w', w, tw) + '<br>' + ln('zw', zw, tzw) +
          `<br><span class="k">FOIL check</span> real ${par(z[0])}·${par(w[0])} − ${par(z[1])}·${par(w[1])} = ${num(zw[0])}, imaginary ${par(z[0])}·${par(w[1])} + ${par(z[1])}·${par(w[0])} = ${num(zw[1])}` +
          `<br><span class="k">Moduli multiply</span> |z|² · |w|² = ${m2(z)} × ${m2(w)} = ${m2(z) * m2(w)}, and |zw|² = ${par(zw[0])}² + ${par(zw[1])}² = ${m2(zw)}` +
          `<br><span class="k">Angles add</span> ${angLine}, which is the angle of zw (${deg(tzw)}).`;
      };
      const logPair = () => {
        if (st.view !== 'move' || st.mode !== 'explore' || st.anim) return;
        const z = [st.zr, st.zi], w = WS[st.wk].v;
        if (m2(z) < 1e-9) return;
        const key = `${st.zr},${st.zi},${st.wk}`;
        if (st.pairs.some(p => p.key === key)) return;
        const zw = cm(z, w);
        st.pairs.push({ key, t: `(${cs(z)}) times ${WS[st.wk].t}: |z||w| = ${num(Math.round(Math.sqrt(m2(z)) * Math.sqrt(m2(w)) * 100) / 100)}, |zw| = ${num(Math.round(Math.sqrt(m2(zw)) * 100) / 100)}` });
      };
      const conjInfo = () => {
        const z = [st.cr, st.ci], zb = cj(z), pr = cm(z, zb), nz = m2(z);
        return `<span class="k">z</span> ${cs(z)} · <span class="k">${CJ}</span> ${cs(zb)}` +
          `<br><span class="k">z · ${CJ}</span> (${cs(z)})(${cs(zb)}) = ${num(pr[0])} ${pr[1] === 0 ? '(real, imaginary part 0)' : ''}` +
          `<br><span class="k">|z|²</span> ${par(z[0])}² + ${par(z[1])}² = ${num(nz)}${Math.abs(pr[0] - nz) < 1e-9 ? ', the same number' : ''}` +
          `<br><span class="k">z + ${CJ}</span> ${num(2 * z[0])} = 2 · ${par(z[0])}, real`;
      };
      const noteSeen = () => {
        const k = `${st.cr},${st.ci}`;
        if (st.view === 'conj' && st.mode === 'explore' && !st.anim && !st.seen.includes(k)) st.seen.push(k);
      };
      const refresh = () => {
        logPair(); noteSeen();
        moveRO.innerHTML = moveInfo() + (st.pairs.length ? `<br><span class="k">Pairs tested (${st.pairs.length})</span><br>${st.pairs.slice(-4).map(p => p.t).join('<br>')}` +
          (st.pairs.length >= 3 ? '<br>In every pair the moduli multiplied and the angles added.' : '') : '');
        conjRO.innerHTML = conjInfo() + `<br><span class="k">z values tried</span> ${st.seen.length}` + (st.seen.length >= 5 ? '. Every product z · ' + CJ + ' was real and not negative.' : '');
        P.draw();
      };
      const syncSliders = () => { zrS.set(st.zr); ziS.set(st.zi); crS.set(st.cr); ciS.set(st.ci); wSel.value = st.wk; dvSel.value = String(st.dv); };

      /* ---------- loaders ---------- */
      const loadFoil = () => {
        const [a, b, c, d] = EX[st.ex];
        foilHead.innerHTML = `<span class="k">Example ${st.ex + 1}</span> (${cs([a, b])})(${cs([c, d])})`;
        FF.load(foilStages(st.ex), foilFinal(st.ex)); P.draw();
      };
      const loadDiv = () => { DF.load(divStages(st.dv), divFinal(st.dv)); P.draw(); };
      const layout = () => {
        const pr = st.mode === 'practice';
        show(gFoil, !pr && st.view === 'foil'); show(gMove, !pr && st.view === 'move');
        show(gConj, !pr && st.view === 'conj'); show(gDiv, !pr && st.view === 'div');
        pracEls.forEach(e => show(e, pr)); show(startB.parentNode, !pr);
      };

      /* ---------- practice ---------- */
      const tally = () => {
        const fin = st.pi + 1 === NP && st.done;
        pStatus.innerHTML = (fin ? '<span class="k">Finished.</span> ' : `<span class="k">Problem ${st.pi + 1} of ${NP}.</span> `) +
          (st.finished ? `Right on the first try: <b>${st.right} of ${st.finished}</b>.` : 'Right on the first try: none answered yet.');
      };
      const loadProb = i => {
        cancelA(); st.mode = 'practice'; st.pi = i; st.tries = 0; st.done = false; st.mark = null;
        const pb = PROBS[i];
        pQ.innerHTML = `<span class="k">${pb.tag}</span><br>${pb.q}`;
        pCh.textContent = '';
        pb.choices.forEach((ch, k) => {
          const b = h('button', { type: 'button', class: 'btn', style: BTN }, ch.t);
          b.addEventListener('click', () => pickProb(k, b)); pCh.append(b);
        });
        nextB.disabled = true; nextB.textContent = i + 1 < NP ? 'Next problem' : 'Start again';
        pFb.innerHTML = ''; layout(); tally(); P.draw();
      };
      const leavePrac = () => { st.mode = 'explore'; st.mark = null; layout(); refresh(); };
      const pickProb = (k, b) => {
        if (st.done) return;
        const pb = PROBS[st.pi], ch = pb.choices[k]; st.tries++;
        if (ch.ok) {
          st.mark = null; st.done = true; st.finished++; if (st.tries === 1) st.right++;
          [...pCh.children].forEach(e => { e.disabled = true; }); nextB.disabled = false;
          pFb.innerHTML = `${good('Correct.')} ${ch.why}` + (st.tries === 1 ? ' Right on the first try.' : '');
          tally();
        } else {
          st.mark = ch.pt || null; b.disabled = true;
          pFb.innerHTML = `${bad('Not quite.')} ${ch.why} Try another answer.`;
        }
        P.draw();
      };

      /* ---------- dragging z ---------- */
      draggable(P, {
        hit: (px, py) => (st.mode === 'explore' && st.view === 'move' && near(P, st.zr, st.zi, px, py, 22)) ? 'z'
          : (st.mode === 'explore' && st.view === 'conj' && near(P, st.cr, st.ci, px, py, 22)) ? 'c' : null,
        move: (hd, x, y) => {
          cancelA(); st.anim = false;
          const vx = clamp(snap(x, 1), -3, 3), vy = clamp(snap(y, 1), -3, 3);
          if (hd === 'z') { st.zr = vx; st.zi = vy; } else { st.cr = vx; st.ci = vy; }
          syncSliders(); refresh();
        }
      });

      /* ---------- predict flow hook ---------- */
      const ps = predStage();
      ps.onPick = () => { cancelA(); st.anim = false; st.zr = 1; st.zi = 1; st.wk = 'onei'; syncSliders(); };
      MF.load([ps], `${good('Done.')} Try other pairs above to test the same rule.`);
      CF.load(conjStages(), conjFinal);
      loadFoil(); loadDiv();

      /* ---------- steps ---------- */
      const apply = (patch, immediate) => {
        cancelA(); st.anim = false;
        if (st.mode === 'practice') { st.mode = 'explore'; st.mark = null; }
        const nums = {};
        for (const k in patch) { if (k === 'view' || k === 'wk' || k === 'dv' || k === 'ex') st[k] = patch[k]; else nums[k] = patch[k]; }
        layout();
        if (Object.keys(nums).length && !immediate) {
          st.anim = true;
          cancelA = animateTo(st, nums, 650, () => { syncSliders(); P.requestDraw(); moveRO.innerHTML = moveInfo(); conjRO.innerHTML = conjInfo(); },
            () => { st.anim = false; syncSliders(); refresh(); });
        } else { Object.assign(st, nums); }
        syncSliders(); refresh();
      };
      layout(); refresh();
      return { destroy: () => { cancelA(); P.destroy(); }, apply };
    }
  });
}
