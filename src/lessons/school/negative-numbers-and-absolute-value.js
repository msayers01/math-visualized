/* =====================================================================
   SCHOOL — Negative numbers and absolute value
   ===================================================================== */
{
  /* ---------- numbers and words ---------- */
  const MINUS = '−';
  const ab = Math.abs;
  const r6 = v => Math.round(v * 1e6) / 1e6;
  const nf = (v, d = 2) => { const a = +ab(v).toFixed(d); return (a !== 0 && v < 0 ? MINUS : '') + a; };
  const sg = v => (v > 0 ? '+' : '') + nf(v);
  const usd = v => (close(v, 0) ? '' : v < 0 ? MINUS : '+') + '$' + nf(ab(v));
  const close = (a, b) => ab(a - b) < 1e-9;
  const isInt = v => close(v, Math.round(v));
  const gcd = (a, b) => { a = ab(a); b = ab(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; };
  const plural = (n, w) => nf(n) + ' ' + w + (close(n, 1) ? '' : 's');
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = (a, b) => `<span class="k">${a}</span> ${b}`;
  const REL = { '<': '&lt;', '>': '&gt;', '=': '=' };
  const relOf = (a, b) => (close(a, b) ? '=' : a < b ? '<' : '>');
  const side = v => (v < 0 ? 'left' : 'right');

  /* numbers on the quarter grid in three forms: 0.75, 3/4, 1 1/2, 5/4 */
  const qparts = v => { const n = Math.round(ab(v) * 4); return { s: v < 0 && n > 0 ? MINUS : '', n, whole: Math.floor(n / 4), r: n % 4 }; };
  const formOf = (v, form) => {
    if (form !== 'frac' && form !== 'mixed') return nf(v);
    const { s, n, whole, r } = qparts(v);
    if (!n) return '0';
    if (form === 'frac') { const g = gcd(n, 4); return s + n / g + (4 / g === 1 ? '' : '/' + 4 / g); }
    const rs = r === 2 ? '1/2' : r + '/4';
    return s + (!r ? whole : !whole ? rs : whole + ' ' + rs);
  };
  const namesOf = v => {
    const out = [nf(v)];
    if (!isInt(v)) { const f = formOf(v, 'frac'), m = formOf(v, 'mixed'); if (ab(v) > 1 && m !== f) out.push(m); out.push(f); }
    return out;
  };
  const QW = { 1: 'a quarter of the way', 2: 'half way', 3: 'three quarters of the way' };
  /* where a number sits, in words */
  const whereIs = t => {
    const a = ab(t), w = Math.floor(a + 1e-9), f = Math.round((a - w) * 4), left = t < 0;
    if (!f) return `${plural(a, 'step')} to the ${side(t)} of 0`;
    return `${QW[f]} from ${nf(left ? -w : w)} to ${nf(left ? -(w + 1) : w + 1)}`;
  };
  const stepWords = (sn, form) => (close(sn, 1) ? 'one whole step' : formOf(sn, form === 'mixed' ? 'frac' : form));

  /* what a wrong placement on a plain number line means */
  const lineWrong = (v, t, nm, form) => {
    const vs = formOf(v, form), left = t < 0;
    let s = `${no('Not yet.')} The marker is at ${vs}. `;
    if (close(v, 0)) s += `That is 0, the starting point. ${nm} is to the ${side(t)} of 0.`;
    else if (close(v, -t)) s += `That is the opposite spot, on the other side of 0. ${nm} ${left ? 'has a minus sign, so it is to the left of 0' : 'is positive, so it is to the right of 0'}.`;
    else if (v < 0 !== t < 0) s += `That is on the ${v < 0 ? 'negative' : 'positive'} side. ${nm} is ${left ? 'negative' : 'positive'}, so it is to the ${side(t)} of 0.`;
    else s += `${nm} is ${whereIs(t)}. Move the marker to the ${v < t ? 'right' : 'left'}.`;
    return s;
  };

  /* ---------- four situations with opposite directions (6.3.5.1) ---------- */
  const CTXS = [
    { id: 'temp', name: 'Temperature', win: [-10, 10], major: 2, minor: 1, snap: 1, demo: -4, units: 'degrees',
      val: v => sg(v) + ' °C',
      say: v => (close(v, 0) ? 'zero degrees' : `${plural(ab(v), 'degree')} ${v < 0 ? 'below' : 'above'} zero`),
      capUp: 'above 0: warmer', capDown: 'below 0: colder',
      zeroSay: 'the freezing point of water', zeroTag: 'freezing point of water',
      q1: { v: -7, text: 'On a winter morning the temperature is 7 degrees below zero.', ask: 'Drag the marker to the temperature.' },
      r1: 'Below zero is down from 0, so the temperature is −7 °C. The minus sign shows the direction: below zero.',
      q2: { v: 7, text: 'By noon it has warmed up to 7 degrees above zero.', ask: 'Drag the marker to the new temperature.' },
      r2: 'Above zero is up from 0, so the temperature is +7 °C. It is the same 7 steps from 0, but the other way. −7 and 7 are opposites.',
      zq: { ask: 'What does 0 °C mean on this thermometer?', choices: [
        { label: 'The freezing point of water. It is the starting point between above and below.', ok: true,
          why: 'On the Celsius scale water freezes at 0 °C. Zero is where we start counting: warmer temperatures are positive and colder ones are negative.' },
        { label: 'No temperature at all, with nothing there.', why: 'Zero is not "nothing". At 0 °C it is still cold, and −7 °C is colder still. Zero is only the spot we chose to start counting from.' },
        { label: 'The coldest temperature there can be.', why: 'There are colder temperatures. The marker went to −7 °C, which is below 0 °C. Negative numbers describe the temperatures colder than zero.' }] } },
    { id: 'elev', name: 'Elevation', win: [-40, 40], major: 10, minor: 5, snap: 5, demo: -20, units: 'meters',
      val: v => sg(v) + ' m',
      say: v => (close(v, 0) ? 'at sea level' : `${plural(ab(v), 'meter')} ${v < 0 ? 'below' : 'above'} sea level`),
      capUp: 'above sea level', capDown: 'below sea level',
      zeroSay: 'sea level, the height of the ocean surface', zeroTag: 'sea level',
      q1: { v: -15, text: 'A diver swims 15 meters below sea level.', ask: 'Drag the marker to the diver\'s elevation.' },
      r1: 'Below sea level is down from 0, so the diver is at −15 m. The minus sign shows the direction: below sea level.',
      q2: { v: 15, text: 'A kite flies 15 meters above sea level.', ask: 'Drag the marker to the kite\'s elevation.' },
      r2: 'Above sea level is up from 0, so the kite is at +15 m. It is the same 15 meters from sea level, but on the other side. −15 and 15 are opposites.',
      zq: { ask: 'What does an elevation of 0 meters mean?', choices: [
        { label: 'Sea level, the height of the ocean surface. Above it is positive and below it is negative.', ok: true,
          why: 'Elevation is measured from sea level. A mountain top is above it (positive) and a diver is below it (negative). Zero is the level of the sea itself.' },
        { label: 'The ground, so every place on land is at 0 meters.', why: 'Land is not all at 0. A mountain is above sea level, so its elevation is positive. Some places on land are below sea level, such as Death Valley in California, so their elevation is negative.' },
        { label: 'The bottom of the ocean.', why: 'The ocean floor is below sea level, so its elevation is negative. The diver was above the floor but still below 0.' }] } },
    { id: 'money', name: 'Bank balance', win: [-20, 20], major: 5, minor: 1, snap: 1, demo: -12, units: 'dollars',
      val: usd,
      say: v => (close(v, 0) ? 'a balance of $0' : v < 0 ? `a debt of $${nf(ab(v))}` : `$${nf(v)} in the account`),
      capUp: 'credit: money you have', capDown: 'debit: money you owe',
      zeroSay: 'nothing owed and nothing owned', zeroTag: 'nothing owed, nothing owned',
      q1: { v: -9, text: 'Ana\'s account has $0. Then a debit of $9 takes money out, and she owes the bank $9.', ask: 'Drag the marker to her new balance.' },
      r1: 'Owing $9 is below zero, so her balance is −$9. A debit takes money out, so it moves the balance down.',
      q2: { v: 9, text: 'Ben\'s account has $0. Then a credit of $9 puts money in.', ask: 'Drag the marker to his new balance.' },
      r2: 'A credit puts money in, so it moves the balance up to +$9. Ana\'s −$9 and Ben\'s $9 are opposites: the same amount, one owed and one owned.',
      zq: { ask: 'What does a balance of $0 mean?', choices: [
        { label: 'Nothing owed and nothing owned. You are exactly between having money and owing money.', ok: true,
          why: 'Above 0 you have money. Below 0 you owe money. At $0 you are even.' },
        { label: 'You owe the bank a little money.', why: 'Owing money is below zero, so it is a negative balance. At exactly $0 you owe nothing.' },
        { label: 'The account is closed.', why: 'An open account can have a balance of $0. Zero only says how much money is in it: none, and none owed.' }] } },
    { id: 'charge', name: 'Electric charge', win: [-6, 6], major: 1, minor: 1, snap: 1, demo: -3, units: 'units',
      val: sg,
      say: v => (close(v, 0) ? 'neutral' : `${plural(ab(v), 'unit')} of ${v < 0 ? 'negative' : 'positive'} charge`),
      capUp: 'positive charge', capDown: 'negative charge',
      zeroSay: 'neutral: positive and negative charge balance', zeroTag: 'neutral',
      q1: { v: -4, text: 'A balloon is rubbed on hair and picks up 4 extra electrons. Each electron adds 1 unit of negative charge.', ask: 'Drag the marker to the balloon\'s charge.' },
      r1: 'Four units of negative charge is −4. Negative charge is below zero on the scale.',
      q2: { v: 4, text: 'The hair loses those 4 electrons. Losing negative charge leaves it with 4 units of positive charge.', ask: 'Drag the marker to the hair\'s charge.' },
      r2: 'Four units of positive charge is +4. The balloon\'s −4 and the hair\'s +4 are opposites: the same amount of charge, with opposite signs.',
      zq: { ask: 'What does a charge of 0 mean?', choices: [
        { label: 'Neutral. The positive and negative charges cancel, so there is no overall charge.', ok: true,
          why: 'A neutral object still has charged particles inside it. They are balanced, so the object has no overall charge: 0.' },
        { label: 'The object has no particles at all.', why: 'Everything is made of atoms, which contain charged particles. A charge of 0 means they balance, not that nothing is there.' },
        { label: 'The object has only negative charge.', why: 'Only negative charge would be a number below zero, like −4. At 0 the positive and negative charge are equal.' }] } }
  ];
  /* a wrong placement in a situation */
  const ctxWrong = (C, v, t) => {
    const down = t < 0;
    let s = `${no('Not yet.')} The marker is at ${C.val(v)}, which means ${C.say(v)}. `;
    if (close(v, 0)) s += `That is the starting point, 0. You need ${C.say(t)}, so move ${down ? 'down' : 'up'}.`;
    else if (close(v, -t)) s += `That is the opposite direction. You need ${C.say(t)}, so it goes ${down ? 'down, with a minus sign' : 'up, with a plus sign'}.`;
    else if (v < 0 !== t < 0) s += `That is the wrong side of 0. You need ${C.say(t)}, so go ${down ? 'below' : 'above'} 0.`;
    else s += `You need ${C.say(t)}. Move the marker ${v < t ? 'up' : 'down'}.`;
    return s;
  };
  const viewOfCtx = (C, over) => Object.assign({ orient: 'v', ctx: C.id, win: C.win, major: C.major, minor: C.minor, snap: C.snap, form: 'dec' }, over);

  /* ---------- the question banks ---------- */
  /* place a number: nm is how the number is written, form is the form the marker reads in */
  const LOC = [
    { nm: '−3', v: -3, form: 'dec', win: [-5, 5], minor: 1, snap: 1 },
    { nm: '−2.5', v: -2.5, form: 'dec', win: [-5, 5], minor: .5, snap: .5 },
    { nm: '−3/4', v: -.75, form: 'frac', win: [-2, 2], minor: .25, snap: .25 },
    { nm: '1 1/2', v: 1.5, form: 'mixed', win: [-2, 3], minor: .25, snap: .25 },
    { nm: '−7/4', v: -1.75, form: 'frac', win: [-3, 1], minor: .25, snap: .25 }
  ];
  /* compare two placed numbers (cmp), or find any number that makes a statement true (make) */
  const CMP = [
    { type: 'cmp', A: -8, B: -3, nmA: '−8', nmB: '−3', fA: 'dec', fB: 'dec', win: [-10, 10], minor: 1, major: 2, snap: 1,
      trap: 'Without the minus signs, 8 is bigger than 3. But −8 is farther along the negative side, so it is farther left, and that makes it less.' },
    { type: 'make', F: -3, rel: '<', nmF: '−3', fA: 'dec', fB: 'dec', win: [-10, 10], minor: 1, major: 2, snap: 1,
      trap: 'A number farther from 0 on the negative side, like −5, is less than −3, even though 5 is bigger than 3.' },
    { type: 'cmp', A: -.5, B: -.25, nmA: '−0.5', nmB: '−1/4', fA: 'dec', fB: 'frac', win: [-1, 1], minor: .25, major: 1, snap: .25,
      trap: 'Half is bigger than a quarter, but −0.5 is farther left than −1/4. On the negative side, bigger without the sign means less.' },
    { type: 'cmp', A: 2, B: -9, nmA: '2', nmB: '−9', fA: 'dec', fB: 'dec', win: [-10, 10], minor: 1, major: 2, snap: 1,
      trap: 'Every positive number is to the right of every negative number, even when the negative number looks bigger without its sign.' },
    { type: 'make', F: -2.5, rel: '>', nmF: '−2.5', fA: 'dec', fB: 'dec', win: [-5, 5], minor: .5, major: 1, snap: .5,
      trap: 'Watch out for −3: it has a bigger number part than −2.5, but it is to the left of −2.5, so it is less.' },
    { type: 'cmp', A: .75, B: .75, nmA: '0.75', nmB: '3/4', fA: 'dec', fB: 'frac', win: [-1, 2], minor: .25, major: 1, snap: .25,
      trap: '' },
    { type: 'make', F: -.5, rel: '<', nmF: '−1/2', fA: 'frac', fB: 'frac', win: [-2, 2], minor: .25, major: 1, snap: .25,
      trap: 'Numbers like −3/4 and −1 are to the left of −1/2. Numbers like −1/4 are to the right.' }
  ];
  const cmpLabel = it => (it.type === 'cmp' ? `Compare ${it.nmA} and ${it.nmB}` : `Make "? ${it.rel} ${it.nmF}" true`);
  /* what each symbol says about the places of two numbers */
  const cmpWhy = (it, sym) => {
    const rel = relOf(it.A, it.B), A = it.nmA, B = it.nmB, tail = it.trap ? ' ' + it.trap : '';
    if (sym === rel) {
      if (rel === '=') return `${A} and ${B} are two names for one number. They sit on the same spot, so ${A} = ${B}.`;
      return `${A} is to the ${side(it.A - it.B)} of ${B} on the number line. The number on the ${rel === '<' ? 'left is the lesser' : 'right is the greater'}, so ${A} ${REL[rel]} ${B}. It reads the same the other way: ${B} ${REL[rel === '<' ? '>' : '<']} ${A}.${tail}`;
    }
    if (sym === '=') return `They are not at the same spot, so they are not equal. ${A} is to the ${side(it.A - it.B)} of ${B}.`;
    if (rel === '=') return `${A} and ${B} are two names for one number. They sit on the same spot, so neither is to the left or the right of the other. ${A} ${REL[sym]} ${B} would need one of them to be farther ${sym === '<' ? 'left' : 'right'}, so the correct symbol is ${A} = ${B}.`;
    return `${A} ${REL[sym]} ${B} would mean ${A} is to the ${sym === '<' ? 'left' : 'right'} of ${B}. But on the number line, ${A} is to the ${side(it.A - it.B)} of ${B}. The number on the ${rel === '<' ? 'left is the lesser' : 'right is the greater'}, so it is ${A} ${REL[rel]} ${B}.${tail}`;
  };

  /* the grid points */
  const GRID = [
    { type: 'pt', x: 3, y: 2 }, { type: 'pt', x: -4, y: 1 }, { type: 'pt', x: -2, y: -3 }, { type: 'pt', x: 2.5, y: -1.5 },
    { type: 'pt', x: 0, y: -3 }, { type: 'quad', q: 'IV' }, { type: 'quad', q: 'II' }
  ];
  const quad = (x, y) => (close(x, 0) || close(y, 0) ? '' : x > 0 ? (y > 0 ? 'I' : 'IV') : y > 0 ? 'II' : 'III');
  const QSIGN = { I: [1, 1], II: [-1, 1], III: [-1, -1], IV: [1, -1] };
  const sgn = s => (s > 0 ? '+' : MINUS);
  const qWord = s => (s > 0 ? 'positive' : 'negative');
  const quadText = (x, y) => {
    const q = quad(x, y);
    if (q) return `Quadrant ${q}: x is ${qWord(QSIGN[q][0])}, y is ${qWord(QSIGN[q][1])}`;
    if (close(x, 0) && close(y, 0)) return 'The origin, where the two axes cross';
    return close(x, 0) ? 'On the y-axis, so in no quadrant' : 'On the x-axis, so in no quadrant';
  };
  const gp = (x, y) => `(${nf(x)}, ${nf(y)})`;
  const xdir = x => (close(x, 0) ? 'do not move left or right' : `${nf(ab(x))} to the ${side(x)}`);
  const ydir = y => (close(y, 0) ? 'do not move up or down' : `${nf(ab(y))} ${y < 0 ? 'down' : 'up'}`);
  const gridWrong = (vx, vy, tx, ty) => {
    let s = `${no('Not yet.')} You plotted ${gp(vx, vy)}. `;
    const sx = close(vx, tx), sy = close(vy, ty);
    if (!close(tx, ty) && close(vx, ty) && close(vy, tx)) s += 'The x and y numbers are swapped. In an ordered pair the first number is x (left or right) and the second is y (up or down). ';
    else if (!sx && !sy && close(vx, -tx) && close(vy, -ty)) s += 'Both signs are wrong, so the point is in the opposite quadrant. ';
    else if (!sx && sy && close(vx, -tx)) s += 'The y number is right, but x has the wrong sign. ';
    else if (sx && !sy && close(vy, -ty)) s += 'The x number is right, but y has the wrong sign. ';
    else s += `${sx ? 'The x number is right.' : `The x number should be ${nf(tx)}, not ${nf(vx)}.`} ${sy ? 'The y number is right.' : `The y number should be ${nf(ty)}, not ${nf(vy)}.`} `;
    return s + `For ${gp(tx, ty)}: x = ${nf(tx)} means ${xdir(tx)}, and y = ${nf(ty)} means ${ydir(ty)}.`;
  };

  /* ---------- drawing helpers (pixel space) ---------- */
  const SANS = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
  const SERIF = '"STIX Two Text", "Cambria Math", "Times New Roman", serif';
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
  const tri = (c, x, y, dx, dy, s, color) => {
    /* arrowhead at (x, y) pointing along (dx, dy) */
    c.beginPath(); c.moveTo(x + dx * s, y + dy * s); c.lineTo(x - dy * s * .6, y + dx * s * .6); c.lineTo(x + dy * s * .6, y - dx * s * .6); c.closePath(); c.fillStyle = color; c.fill();
  };
  /* a rounded label. x is its center, or its left edge with o.left; returns its left and right edges */
  const chip = (c, p, s, x, y, o = {}) => {
    const size = o.size || 14, w = mw(c, s, size, 700) + 18;
    let l = o.left ? x : x - w / 2;
    if (o.maxX) l = clamp(l, 4, o.maxX - w - 4);
    rrect(c, l, y - 12, w, 24, 12); c.fillStyle = p.pal.stage; c.fill();
    c.strokeStyle = o.border || p.pal.brass; c.lineWidth = o.lw || 1.8; c.setLineDash(o.dash || []); c.stroke(); c.setLineDash([]);
    T(c, p, s, l + w / 2, y, { size, weight: 700, halo: false, color: o.color });
    return [l, l + w];
  };

  const MODES = [
    { id: 'zero', name: 'Opposites and 0' }, { id: 'locate', name: 'Number line' }, { id: 'compare', name: 'Compare' },
    { id: 'abs', name: 'Distance from 0' }, { id: 'grid', name: 'Coordinate grid' }
  ];
  const HINTS = {
    zero: 'Drag the marker up or down, or pick another situation. Zero means something different in each one.',
    locate: 'Drag the marker along the line. It moves a quarter at a time.',
    compare: 'Drag marker A (above the line) and marker B (below it). Watch the statement change.',
    abs: 'Drag the marker. The bracket shows the distance from 0, and the dashed marker is the opposite number.',
    grid: 'Drag the point. The green line shows x and the red line shows y.'
  };
  const TITLES = { locate: 'Number line', compare: 'Comparing numbers', abs: 'Distance from 0', grid: 'Coordinate grid' };

  register({
    id: 'negative-numbers-and-absolute-value', level: 'school',
    title: 'Negative numbers and absolute value',
    blurb: 'Place negative numbers, fractions and decimals on a number line, compare them, find absolute value, and plot points in all four quadrants.',
    thumb(c, p) {
      const pal = p.pal, W = p.w, H = p.h, x0 = W * .09, x1 = W * .91, y = H * .62, fs = Math.max(9, H * .085), X = v => (x0 + x1) / 2 + v * (x1 - x0) / 7.2;
      line(c, x0, y, x1, y, pal.blue, 2.6);
      tri(c, x0, y, -1, 0, 7, pal.blue); tri(c, x1, y, 1, 0, 7, pal.blue);
      for (let v = -3; v <= 3; v++) {
        line(c, X(v), y - 5, X(v), y + 5, v === 0 ? pal.violet : pal['grid-strong'], v === 0 ? 2.6 : 1.6);
        c.font = font(fs, v === 0 ? 800 : 600); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = v === 0 ? pal.violet : pal.muted;
        c.fillText(v < 0 ? MINUS + (-v) : String(v), X(v), y + H * .13);
      }
      for (const v of [-2, 2]) {
        line(c, X(0), y - H * .14, X(v), y - H * .14, pal.yellow, 2.6);
        line(c, X(0), y - H * .14, X(0), y - H * .09, pal.yellow, 2.6); line(c, X(v), y - H * .14, X(v), y - H * .09, pal.yellow, 2.6);
        c.beginPath(); c.arc(X(v), y, 6, 0, Math.PI * 2); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.brass; c.lineWidth = 2.6; c.stroke();
        c.font = font(fs, 700); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = pal.text; c.fillText('2', (X(0) + X(v)) / 2, y - H * .25);
      }
    },
    hook: String.raw`Which is colder, −8 °C or −3 °C? The number 8 is bigger than 3, so how can −8 be the smaller number?`,
    steps: [
      { title: 'Opposites and the meaning of 0',
        text: String.raw`<p>Some numbers describe opposite directions. Above zero is positive. Below zero is negative. The marker shows 4 degrees below zero, so the temperature is −4 °C.</p><p>Its opposite is +4 °C, which is 4 degrees above zero. The dashed marker shows it: the same distance from 0, on the other side. Zero is the starting point between the two directions. On this thermometer it is the freezing point of water.</p><p>Drag the marker and try the other situations. Zero means something different in each one. Then press <b>Try a question</b>.</p>`,
        set: { mode: 'zero', ctx: 0, pos: -4 } },
      { title: 'Place numbers on the number line',
        text: String.raw`<p>Every number has a place on the number line, not only whole numbers. Positive numbers are to the right of 0. Negative numbers are to the left. The marker is at −2.5, which is also −2 1/2 and −5/2. Three names, one spot.</p><p>It is half way from −2 to −3, which is 2.5 steps to the left of 0. Drag the marker to see decimals, mixed numbers and fractions. Then place the numbers in the questions.</p>`,
        set: { mode: 'locate', pos: -2.5 } },
      { title: 'Compare numbers and find absolute value',
        text: String.raw`<p>The number farther to the left is the lesser number. Marker A is at −8 and marker B is at −3. A is left of B, so −8&nbsp;&lt;&nbsp;−3. That looks odd because 8 is bigger than 3. But −8 is farther along the negative side, so it is farther left.</p><p>Now press <b>Distance from 0</b> for a second idea. The <b>absolute value</b> of a number is how far it is from 0. A distance is never negative, so |−8| = 8. Drag the markers, then try the questions.</p>`,
        set: { mode: 'compare', pos: -8, pb: -3 } },
      { title: 'Plot points on a coordinate grid',
        text: String.raw`<p>Two number lines that cross at 0 make a coordinate grid. A point has two numbers, written (x, y). The first number, x, tells how far to go right or left. The second number, y, tells how far to go up or down.</p><p>The point (−2.5, 1.5) is 2.5 to the left and 1.5 up. That puts it in Quadrant II, where x is negative and y is positive. The four quadrants have these signs: I (+, +), II (−, +), III (−, −), IV (+, −).</p><p>Drag the point to see how the numbers change. The green line shows x and the red line shows y.</p>`,
        set: { mode: 'grid', pos: -2.5, pb: 1.5 } }
    ],
    formal: String.raw`
      <h3>Positive and negative numbers</h3>
      <p>Some quantities have two opposite directions: up and down, above and below, money you have and money you owe. We use <em>positive</em> numbers for one direction and <em>negative</em> numbers for the opposite direction. The number tells how much, and the sign tells which way. A temperature of \(-7\) °C is 7 degrees below zero. An elevation of \(-15\) m is 15 meters below sea level. A balance of \(-\$9\) means you owe $9. A charge of \(-4\) is 4 units of negative charge. The positive versions \(+7\), \(+15\), \(+\$9\) and \(+4\) go the other way.</p>
      <h3>What zero means</h3>
      <p>Zero is the starting point between the two directions. What it means depends on the situation:</p>
      <ul>
        <li>Temperature in °C: the freezing point of water.</li>
        <li>Elevation: sea level.</li>
        <li>Bank balance: nothing owed and nothing owned.</li>
        <li>Electric charge: neutral, because positive and negative charge balance.</li>
      </ul>
      <p>Zero is not "nothing". It is the place where we choose to start counting.</p>
      <h3>The number line and opposites</h3>
      <p>On a horizontal number line, positive numbers are to the right of \(0\) and negative numbers are to the left. On a vertical one, positive is up and negative is down. A number and its <em>opposite</em> are the same distance from \(0\), on opposite sides: \(3\) and \(-3\). The opposite of \(-3\) is \(3\), and \(0\) is its own opposite.</p>
      <h3>Rational numbers on the line</h3>
      <p>A <em>rational number</em> can be written as a fraction of two integers. Integers, decimals such as \(-2.5\) and fractions such as \(-\frac{3}{4}\) are all rational numbers, and each one has a place on the line. One place can have several names:
      \[ -2.5 = -2\frac{1}{2} = -\frac{5}{2}, \qquad -\frac{3}{4} = -0.75. \]
      To place \(-\frac{3}{4}\), cut the space between \(0\) and \(-1\) into 4 equal parts and count 3 parts to the left of \(0\). To place \(-2.5\), go 2 whole steps left, then half of the next step.</p>
      <h3>Comparing numbers</h3>
      <p>On the number line, numbers get greater to the right. So an inequality is a statement about places:</p>
      <ul>
        <li>\(a &lt; b\) means \(a\) is to the left of \(b\). Read it "\(a\) is less than \(b\)".</li>
        <li>\(a &gt; b\) means \(a\) is to the right of \(b\).</li>
        <li>\(a = b\) means \(a\) and \(b\) are the same spot, even if they are written differently, like \(0.75 = \frac{3}{4}\).</li>
      </ul>
      <p>One fact can be read two ways: \(-8 &lt; -3\) and \(-3 &gt; -8\). Every negative number is less than \(0\), and \(0\) is less than every positive number. Among negative numbers, the one farther from \(0\) is the lesser. So \(-8 &lt; -3\), even though \(8 &gt; 3\). That fits real life: −8 °C is colder than −3 °C. To compare numbers in different forms, put them in the same form first. For \(-0.5\) and \(-\frac{1}{4}\), write \(-\frac{1}{4} = -0.25\). Then \(-0.5 &lt; -0.25\).</p>
      <h3>Absolute value</h3>
      <p>The <em>absolute value</em> of a number is its distance from \(0\) on the number line. We write it \(|a|\). Then
      \[ |-7| = 7, \qquad |7| = 7, \qquad |0| = 0. \]
      A distance is never negative, so \(|a| \ge 0\) for every number. A number and its opposite have the same absolute value. To find every number with \(|x| = 6\), look for the spots 6 steps from \(0\): \(x = 6\) or \(x = -6\).</p>
      <h3>Magnitude in context</h3>
      <p>In a situation, the absolute value is the <em>magnitude</em>: the size of the amount without its direction. A debt of $20 is the balance \(-20\) dollars, and its magnitude is \(|-20| = 20\) dollars owed. An elevation of \(-12\) m has magnitude \(12\) m: the diver is 12 meters from sea level.</p>
      <p>Two questions that sound alike have different answers. "Which is greater?" compares places on the line. "Which has the greater absolute value?" compares distances from \(0\). For \(-12\) m and \(+8\) m, the greater elevation is \(+8\), because it is to the right. The greater absolute value belongs to \(-12\), because \(|-12| = 12\) is larger than \(|8| = 8\). For temperatures below zero, a greater absolute value means colder. For temperatures above zero, it means warmer.</p>
      <h3>The coordinate grid</h3>
      <p>Two number lines cross at right angles at \(0\). The horizontal one is the <em>x-axis</em>, the vertical one is the <em>y-axis</em>, and the crossing point is the <em>origin</em>, \((0,0)\). An <em>ordered pair</em> \((x,y)\) names a point. Start at the origin. The first number tells you how far to move right (positive) or left (negative). The second number tells you how far to move up (positive) or down (negative). The order matters: \((3,-2)\) and \((-2,3)\) are different points. Numbers can be halves or other rational numbers, so \((2.5,-1.5)\) sits half way between grid lines.</p>
      <p>The axes split the grid into four <em>quadrants</em>. The signs of x and y tell you which one:</p>
      <table style="border-collapse:collapse;margin:0 0 1em;font-variant-numeric:tabular-nums">
        <tr><th style="text-align:left;padding:4px 14px 4px 0;font-weight:500">Quadrant</th><th style="text-align:left;padding:4px 14px;font-weight:500">x</th><th style="text-align:left;padding:4px 14px;font-weight:500">y</th><th style="text-align:left;padding:4px 14px;font-weight:500">Where</th></tr>
        <tr><td style="padding:4px 14px 4px 0;border-top:1px solid var(--line-strong)">I</td><td style="padding:4px 14px;border-top:1px solid var(--line-strong)">+</td><td style="padding:4px 14px;border-top:1px solid var(--line-strong)">+</td><td style="padding:4px 14px;border-top:1px solid var(--line-strong)">upper right</td></tr>
        <tr><td style="padding:4px 14px 4px 0">II</td><td style="padding:4px 14px">−</td><td style="padding:4px 14px">+</td><td style="padding:4px 14px">upper left</td></tr>
        <tr><td style="padding:4px 14px 4px 0">III</td><td style="padding:4px 14px">−</td><td style="padding:4px 14px">−</td><td style="padding:4px 14px">lower left</td></tr>
        <tr><td style="padding:4px 14px 4px 0">IV</td><td style="padding:4px 14px">+</td><td style="padding:4px 14px">−</td><td style="padding:4px 14px">lower right</td></tr>
      </table>
      <p>A point on an axis, such as \((0,-3)\), is in no quadrant. If a point lands in the wrong quadrant, check the signs first: a wrong sign on x flips it left or right, and a wrong sign on y flips it up or down.</p>`,
    check: [
      { q: String.raw`On Monday night the temperature was −9 °C. On Tuesday night it was −4 °C. On a number line, numbers farther to the left are less. Which statement is true?`,
        choices: [
          'Monday was warmer, because 9 is bigger than 4, so −9 is greater than −4.',
          'Monday was colder, because −9 is less than −4, but −9 has the smaller absolute value.',
          'Monday was colder, because −9 is less than −4, and −9 has the greater absolute value.',
          'The two nights were equally cold, because both numbers are negative.'], answer: 2,
        why: String.raw`On the number line, −9 is farther to the left than −4, so −9 is less than −4 and Monday was colder. Absolute value is the distance from 0: |−9| = 9 and |−4| = 4, so −9 has the greater absolute value. The first answer compares 9 and 4 and forgets that the minus signs flip the order. The second answer mixes up the two ideas: −9 is farther from 0, so its absolute value is greater, not smaller. The last answer is wrong because negative numbers are not all equal.`,
        hint: String.raw`Picture the number line. Which of −9 and −4 is farther to the left? Which is farther from 0?` },
      { q: String.raw`A coordinate grid has a horizontal x-axis and a vertical y-axis that cross at (0, 0). Positive numbers are to the right on the x-axis and up on the y-axis. Point P is 3 units to the left of the y-axis and 2 units above the x-axis. What are the coordinates of P?`,
        choices: [
          '(3, −2), in the lower right part of the grid',
          '(−3, 2), in the upper left part of the grid',
          '(−2, 3), in the upper left part of the grid',
          '(3, 2), in the upper right part of the grid'], answer: 1,
        why: String.raw`Left of the y-axis means x is negative, so x = −3. Above the x-axis means y is positive, so y = 2. The ordered pair is (x, y) = (−3, 2), in the upper left part of the grid (Quadrant II). The pair (−2, 3) swaps the two numbers. The pair (3, −2) has both signs wrong. The pair (3, 2) ignores that P is to the left.`,
        hint: String.raw`The first number is x. Is P left or right of the y-axis? The second number is y. Is P above or below the x-axis?` }
    ],
    links: { prereq: [], next: [], related: ['distance-and-the-pythagorean-theorem', 'slope-and-linear-functions', 'variables-and-relationships'] },

    mount({ stage, controls: C }) {
      const P = new Plane(stage, { span: 5 });
      const cv = P.canvas;
      if (P.coordEl) P.coordEl.style.display = 'none';
      cv.tabIndex = 0;
      cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', 'A number line or a coordinate grid with a marker you can drag. Use the arrow keys to move the marker. The panel beside the picture reads out the numbers.');
      /* pos and pb are the numbers the markers show: pos is marker A (or the only marker, or x), pb is marker B (or y) */
      const base = () => ({ rA: 'off', rB: 'off', nameA: '', nameB: '', brA: false, brB: false, ghost: false, extra: [], found: [], stmt: '', shade: null, zeroKnown: false, pos: 0, pb: 0, tint: '', gOk: false });
      const st = Object.assign({ mode: 'zero', ctx: 0, phase: 'explore', ti: -1, task: null, si: 0, fb: '', picks: {}, fin: false, view: null }, base());
      let cancel = () => {};
      let ro, liveEl = null, fbEl = null, modeBtns, taskSel, selLabel;

      /* ---------- tasks: each is a short list of parts ---------- */
      const cNow = () => CTXS[st.ctx];
      const zeroTask = ci => {
        const Cx = CTXS[ci], v1 = Cx.q1.v, v2 = Cx.q2.v;
        return { head: Cx.name, view: viewOfCtx(Cx), stages: [
          { k: 'place', ask: `${Cx.q1.text} ${Cx.q1.ask}`, enter() { st.pos = 0; st.rA = 'active'; },
            check: () => (close(st.pos, v1) ? { ok: true, fb: `${ok('Yes.')} ${Cx.r1}` } : { fb: ctxWrong(Cx, st.pos, v1) }) },
          { k: 'place', ask: `${Cx.q2.text} ${Cx.q2.ask}`, enter() { st.extra = [v1]; st.pos = 0; st.rA = 'active'; },
            check: () => (close(st.pos, v2) ? { ok: true, fb: `${ok('Yes.')} ${Cx.r2}` } : { fb: ctxWrong(Cx, st.pos, v2) }) },
          { k: 'pick', ask: Cx.zq.ask, choices: Cx.zq.choices, enter() { st.extra = [v1, v2]; st.rA = 'off'; }, onRight() { st.zeroKnown = true; } }
        ] };
      };
      const locTask = it => ({ head: `Place ${it.nm} on the number line`,
        view: { orient: 'h', win: it.win, minor: it.minor, major: 1, snap: it.snap, form: it.form },
        stages: [{ k: 'place', ask: `Drag the marker to <b>${it.nm}</b>. It moves ${stepWords(it.snap, it.form)} at a time.`,
          enter() { st.pos = 0; st.rA = 'active'; },
          check: () => {
            if (!close(st.pos, it.v)) return { fb: lineWrong(st.pos, it.v, it.nm, it.form) };
            const names = namesOf(it.v);
            return { ok: true, fb: `${ok('Yes.')} ${it.nm} is ${whereIs(it.v)}.` +
              (names.length > 1 ? ` Other names for this spot: ${names.join(' = ')}.` : ` Its opposite, ${nf(-it.v)}, is the same distance from 0 on the other side.`) };
          } }] });
      const cmpTask = it => {
        const rel = relOf(it.A, it.B), hv = { orient: 'h', win: it.win, minor: it.minor, major: it.major, snap: it.snap, form: 'dec', fA: it.fA, fB: it.fB };
        const where = (v, nm) => ({ ok: true, fb: `${ok('Yes.')} ${nm} is ${whereIs(v)}.` });
        return { head: `Compare ${it.nmA} and ${it.nmB}`, view: hv, stages: [
          { k: 'place', ask: `Drag marker <b>A</b> (above the line) to <b>${it.nmA}</b>.`, enter() { st.pos = 0; st.rA = 'active'; st.nameA = 'A'; },
            check: () => (close(st.pos, it.A) ? where(it.A, it.nmA) : { fb: lineWrong(st.pos, it.A, it.nmA, it.fA) }) },
          { k: 'place', ask: `Drag marker <b>B</b> (below the line) to <b>${it.nmB}</b>.`, enter() { st.rA = 'fixed'; st.rB = 'active'; st.nameB = 'B'; st.pb = 0; },
            check: () => (close(st.pb, it.B) ? where(it.B, it.nmB) : { fb: lineWrong(st.pb, it.B, it.nmB, it.fB) }) },
          { k: 'pick', ask: `Which statement about ${it.nmA} and ${it.nmB} is true?`, enter() { st.rB = 'fixed'; st.stmt = `${it.nmA} ? ${it.nmB}`; },
            onRight() { st.stmt = `${it.nmA} ${rel} ${it.nmB}`; },
            choices: ['<', '=', '>'].map(sym => ({ label: `${it.nmA} ${REL[sym]} ${it.nmB}`, ok: sym === rel, why: cmpWhy(it, sym) })) }
        ] };
      };
      const makeTask = it => {
        const less = it.rel === '<', hv = { orient: 'h', win: it.win, minor: it.minor, major: it.major, snap: it.snap, form: 'dec', fA: it.fA, fB: it.fB };
        return { head: `Make ? ${REL[it.rel]} ${it.nmF} true`, view: hv, stages: [
          { k: 'place', ask: `Drag the marker to a number that makes <b>? ${REL[it.rel]} ${it.nmF}</b> true. The number ${it.nmF} is marked below the line.`,
            enter() { st.rB = 'fixed'; st.pb = it.F; st.rA = 'active'; st.pos = it.F; st.stmt = `? ${it.rel} ${it.nmF}`; },
            check: () => {
              const v = st.pos, r = relOf(v, it.F), vs = formOf(v, it.fA);
              if (r === it.rel) {
                st.shade = { rel: it.rel, F: it.F }; st.stmt = `${vs} ${it.rel} ${it.nmF}`;
                return { ok: true, fb: `${ok('Yes.')} The marker is at ${vs}, which is to the ${less ? 'left' : 'right'} of ${it.nmF}. So ${vs} ${REL[it.rel]} ${it.nmF} is true. Every number in the shaded part of the line makes it true.` };
              }
              if (r === '=') return { fb: `${no('Not yet.')} The marker is on ${it.nmF} itself. A number is not ${less ? 'less' : 'greater'} than itself, so ${it.nmF} ${REL[it.rel]} ${it.nmF} is false. Move the marker to the ${less ? 'left' : 'right'} of ${it.nmF}.` };
              return { fb: `${no('Not yet.')} The marker is at ${vs}, to the ${side(v - it.F)} of ${it.nmF}. So ${vs} ${REL[r]} ${it.nmF}, not ${REL[it.rel]}. ${less ? 'Less means farther left' : 'Greater means farther right'}, so move the marker to the ${less ? 'left' : 'right'} of ${it.nmF}. ${it.trap}` };
            } }] };
      };
      const h10 = { orient: 'h', win: [-10, 10], minor: 1, major: 2, snap: 1, form: 'dec' };
      const MONEY = CTXS[2], ELEV = CTXS[1], TEMP = CTXS[0];
      const absReadTask = (v, nm, view) => { const d = ab(v), dn = nf(d); return { head: `The absolute value of ${nm}`, view, stages: [
        { k: 'place', ask: `Drag the marker to <b>${nm}</b>.`, enter() { st.pos = 0; st.rA = 'active'; },
          check: () => (close(st.pos, v) ? { ok: true, fb: `${ok('Yes.')} ${nm} is ${plural(d, 'step')} to the left of 0. The yellow bracket shows its distance from 0.` } : { fb: lineWrong(st.pos, v, nm, 'dec') }) },
        { k: 'pick', ask: `What is the absolute value of ${nm}? It is written |${nm}|.`, enter() { st.rA = 'fixed'; st.brA = true; },
          choices: [
            { label: nm, why: `Absolute value is a distance, and the bracket is ${plural(d, 'step')} long. A distance is never negative, so |${nm}| = ${dn}. The minus sign tells which side of 0, not how far.` },
            { label: dn, ok: true, why: `|${nm}| = ${dn} because ${nm} is ${plural(d, 'step')} from 0. The opposite number, ${dn}, is also ${plural(d, 'step')} from 0, so |${dn}| = ${dn} too.` },
            { label: nf(2 * d), why: `${nf(2 * d)} steps would be the walk from ${nm} all the way to ${dn}. Absolute value measures only from 0 to ${nm}, which is ${plural(d, 'step')}.` },
            { label: '0', why: `|0| = 0 is only for the number 0 itself. The number ${nm} is not at 0. It is ${plural(d, 'step')} away.` }] }] }; };
      const absFindTask = () => ({ head: 'Numbers with absolute value 6', view: h10, stages: [
        { k: 'place', ask: 'Find a number whose absolute value is <b>6</b>. There are two of them. Drag the marker to one, then find the other.',
          enter() { st.pos = 0; st.rA = 'active'; st.found = []; st.extra = []; },
          check: () => {
            const v = st.pos, d = ab(v);
            if (!close(d, 6)) return { fb: `${no('Not yet.')} The marker is at ${nf(v)}, which is ${plural(d, 'step')} from 0. So |${nf(v)}| = ${nf(d)}, not 6. You need a spot exactly 6 steps from 0.` };
            if (st.found.some(f => close(f, v))) return { fb: `That is the one you already found. The other number is on the other side of 0.` };
            st.found.push(v); st.extra = st.found.slice();
            if (st.found.length < 2) return { fb: `${ok('Yes.')} |${nf(v)}| = 6, because ${nf(v)} is 6 steps from 0. There is a second number that is 6 steps from 0. It is on the other side of 0. Find it.` };
            st.rA = 'off';
            return { ok: true, fb: `${ok('Yes.')} 6 and −6 are both 6 steps from 0, so |6| = 6 and |−6| = 6. Opposites always have the same absolute value.` };
          } }] });
      const absDebtTask = () => {
        const v = viewOfCtx(MONEY, { win: [-30, 30], major: 10, minor: 5, snap: 5 });
        return { head: 'A debt and its magnitude', view: v, stages: [
          { k: 'place', ask: 'Lena owes her brother $20. Drag the marker to her balance.', enter() { st.pos = 0; st.rA = 'active'; },
            check: () => (close(st.pos, -20) ? { ok: true, fb: `${ok('Yes.')} Owing money is below zero, so her balance is −$20. The bracket shows how far the balance is from 0.` } : { fb: ctxWrong(MONEY, st.pos, -20) }) },
          { k: 'pick', ask: 'The <b>magnitude</b> of a quantity is its absolute value: its size without the direction. What is the magnitude of Lena\'s balance, and what does it tell you?', enter() { st.rA = 'fixed'; st.brA = true; },
            choices: [
              { label: '$20, the amount she owes', ok: true, why: '|−$20| = $20. The magnitude is how much money is involved. The minus sign in the balance says it is owed.' },
              { label: '−$20, because the magnitude keeps the sign', why: 'The magnitude ignores the direction, so it has no minus sign. −$20 is the balance. The magnitude is |−$20| = $20.' },
              { label: '$20, the amount she has', why: 'The magnitude is $20, but Lena does not have $20. Her balance is −$20, which means she owes it.' }] }] };
      };
      const absPairTask = () => ({ head: 'A hawk and a seal', view: viewOfCtx(ELEV, { win: [-20, 20], major: 5, minor: 1, snap: 1 }), init() {
        st.pos = 8; st.pb = -12; st.rA = 'fixed'; st.rB = 'fixed'; st.nameA = 'hawk'; st.nameB = 'seal';
      }, stages: [
        { k: 'pick', ask: 'A hawk flies 8 meters above sea level (+8 m). A seal swims 12 meters below sea level (−12 m). Which has the greater elevation?',
          choices: [
            { label: 'The hawk, at +8 m', ok: true, why: 'Elevation is a place on the line, and greater means higher up. +8 is above 0 and −12 is below 0, so +8 is greater: 8 &gt; −12.' },
            { label: 'The seal, at −12 m', why: '12 is bigger than 8, but the seal is below sea level. A negative elevation is below every positive one, so −12 is less than +8.' }] },
        { k: 'pick', ask: 'Which elevation has the greater absolute value, the greater magnitude? The yellow brackets show the distances from 0.', enter() { st.brA = true; st.brB = true; },
          choices: [
            { label: 'The hawk, at +8 m', why: '8 is the greater number, but absolute value is distance from 0. The hawk is 8 meters from sea level, and the seal is farther.' },
            { label: 'The seal, at −12 m', ok: true, why: '|−12| = 12 and |8| = 8. The seal is 12 meters from sea level and the hawk is 8 meters, so the seal has the greater magnitude. The hawk has the greater elevation, but the seal has the greater absolute value. They are different questions.' }] }] });
      const absTempTask = () => ({ head: 'Two cold nights', view: viewOfCtx(TEMP), init() {
        st.pos = -8; st.pb = -3; st.rA = 'fixed'; st.rB = 'fixed'; st.nameA = 'Mon'; st.nameB = 'Tue';
      }, stages: [
        { k: 'pick', ask: 'Monday night was −8 °C. Tuesday night was −3 °C. Which night was colder?',
          choices: [
            { label: 'Monday, at −8 °C', ok: true, why: 'Colder means lower on the thermometer, which is farther left on the number line. −8 is below −3, so −8 &lt; −3, and Monday was colder.' },
            { label: 'Tuesday, at −3 °C', why: 'Look at the thermometer: −8 is lower than −3. Tuesday\'s −3 °C is closer to 0, so it was the warmer night.' }] },
        { k: 'pick', ask: 'Which temperature has the greater absolute value? The yellow brackets show the distances from 0.', enter() { st.brA = true; st.brB = true; },
          choices: [
            { label: 'Monday, −8 °C', ok: true, why: '|−8| = 8 and |−3| = 3. Monday is farther from 0, so it has the greater absolute value. Below zero, a greater absolute value means colder. Above zero it would mean warmer, so the sign decides.' },
            { label: 'Tuesday, −3 °C', why: '|−3| = 3 is smaller than |−8| = 8. Tuesday is closer to 0, so its absolute value is smaller.' }] }] });
      const gridTask = it => {
        const view = null;
        if (it.type === 'pt') return { head: `Plot the point ${gp(it.x, it.y)}`, view, stages: [{ k: 'place',
          ask: `Drag the point to <b>${gp(it.x, it.y)}</b>. It moves half a unit at a time.`,
          enter() { st.pos = 0; st.pb = 0; st.rA = 'active'; },
          check: () => {
            const x = st.pos, y = st.pb; st.tint = quad(x, y);
            if (close(x, it.x) && close(y, it.y)) { st.gOk = true; return { ok: true, fb: `${ok('Yes.')} Start at the origin. x = ${nf(it.x)}: ${xdir(it.x)}. y = ${nf(it.y)}: ${ydir(it.y)}. ${quadText(it.x, it.y)}.` }; }
            return { fb: gridWrong(x, y, it.x, it.y) + ` Where you plotted it: ${quadText(x, y)}.` };
          } }] };
        const sg2 = QSIGN[it.q];
        return { head: `Plot any point in Quadrant ${it.q}`, view, stages: [{ k: 'place',
          ask: `Drag the point anywhere in <b>Quadrant ${it.q}</b>. It moves half a unit at a time.`,
          enter() { st.pos = 0; st.pb = 0; st.rA = 'active'; },
          check: () => {
            const x = st.pos, y = st.pb, q = quad(x, y); st.tint = q;
            if (q === it.q) { st.gOk = true; return { ok: true, fb: `${ok('Yes.')} ${gp(x, y)} has x ${qWord(sg2[0])} (${sg2[0] < 0 ? 'left of' : 'right of'} the y-axis) and y ${qWord(sg2[1])} (${sg2[1] < 0 ? 'below' : 'above'} the x-axis). That is the sign pattern of Quadrant ${it.q}: (${sgn(sg2[0])}, ${sgn(sg2[1])}).` }; }
            const need = `Quadrant ${it.q} needs x ${qWord(sg2[0])} (${sg2[0] < 0 ? 'left of' : 'right of'} the y-axis) and y ${qWord(sg2[1])} (${sg2[1] < 0 ? 'below' : 'above'} the x-axis).`;
            return { fb: `${no('Not yet.')} You plotted ${gp(x, y)}. ${q ? `That is ${quadText(x, y)}.` : 'That is on an axis, and a point on an axis is in no quadrant.'} ${need}` };
          } }] };
      };
      const TASKS = {
        zero: CTXS.map((q, i) => ({ label: q.name, build: () => zeroTask(i) })),
        locate: LOC.map(it => ({ label: `Place ${it.nm}`, build: () => locTask(it) })),
        compare: CMP.map(it => ({ label: cmpLabel(it), build: () => (it.type === 'cmp' ? cmpTask(it) : makeTask(it)) })),
        abs: [
          { label: 'The absolute value of −7', build: () => absReadTask(-7, '−7', h10) }, { label: 'Numbers with absolute value 6', build: absFindTask },
          { label: 'A debt of $20', build: absDebtTask }, { label: 'A hawk and a seal', build: absPairTask }, { label: 'Two cold nights', build: absTempTask },
          { label: 'The absolute value of −3.5', build: () => absReadTask(-3.5, '−3.5', { orient: 'h', win: [-5, 5], minor: .5, major: 1, snap: .5, form: 'dec' }) }],
        grid: GRID.map(it => ({ label: it.type === 'pt' ? `Plot ${gp(it.x, it.y)}` : `Any point in Quadrant ${it.q}`, build: () => gridTask(it) }))
      };

      /* ---------- starting an exploration or a question ---------- */
      const exploreView = () => {
        switch (st.mode) {
          case 'zero': return viewOfCtx(cNow());
          case 'locate': return { orient: 'h', win: [-3, 3], minor: .25, major: 1, snap: .25, form: 'dec' };
          case 'compare': return h10;
          case 'abs': return Object.assign({}, h10, { minor: .5, snap: .5 });
          default: return null;
        }
      };
      const startExplore = (mode, ci) => {
        Object.assign(st, base(), { mode, phase: 'explore', ti: -1, task: null, si: 0, fb: '', picks: {}, fin: false });
        if (ci !== undefined) st.ctx = ci;
        st.view = exploreView(); st.rA = 'active';
        if (mode === 'zero') { st.pos = cNow().demo; st.ghost = true; st.zeroKnown = true; }
        else if (mode === 'locate') st.pos = -2.5;
        else if (mode === 'compare') { st.pos = -8; st.pb = -3; st.rB = 'active'; st.nameA = 'A'; st.nameB = 'B'; }
        else if (mode === 'abs') { st.pos = -7; st.ghost = true; st.brA = true; }
        else if (mode === 'grid') { st.pos = -2.5; st.pb = 1.5; st.tint = quad(-2.5, 1.5); }
      };
      const startTask = (mode, ti) => {
        const Tk = TASKS[mode][ti].build();
        Object.assign(st, base(), { mode, phase: 'quiz', ti, task: Tk, si: 0, fb: '', picks: {}, fin: false });
        if (mode === 'zero') st.ctx = ti;
        st.view = Tk.view; if (Tk.init) Tk.init();
        const s0 = Tk.stages[0]; if (s0.enter) s0.enter();
        sync();
      };
      const advance = () => {
        st.si++;
        const S = st.task.stages[st.si];
        if (S) { if (S.enter) S.enter(); } else st.fin = true;
      };

      /* ---------- geometry ---------- */
      const lay = () => {
        const W = P.w || 400, H = P.h || 400, u = clamp(Math.min(H / 540, W / 640), .62, 1.3), fs = clamp(W * .034, 12.5, 17), pad = clamp(W * .05, 14, 40);
        const g = { W, H, u, fs, pad, tx: Math.max(pad, 30) };
        if (st.mode === 'grid') {
          g.R = 5; g.s = Math.min((W - 2 * pad) / (2 * g.R), (H - 78 * u) / (2 * g.R)); g.ox = W / 2; g.oy = 50 * u + (H - 50 * u) / 2;
          return g;
        }
        const [a, b] = st.view.win;
        if (st.view.orient === 'v') {
          g.vx = clamp(W * .3, 104, 260); g.y0 = 90 * u; g.y1 = H - 58 * u;
          g.Y = v => g.y1 - (v - a) / (b - a) * (g.y1 - g.y0);
        } else {
          g.yL = H * .5; g.x0 = pad + 16; g.x1 = W - pad - 16; g.up = clamp(H * .15, 56, 96); g.down = clamp(H * .18, 78, 122);
          g.X = v => g.x0 + (v - a) / (b - a) * (g.x1 - g.x0);
        }
        return g;
      };
      const marksOf = () => {
        const out = [], V = st.view;
        if (st.ghost && st.rA !== 'off' && ab(st.pos) > .05) out.push({ v: -st.pos, role: 'ghost', name: 'opposite', side: 1 });
        for (const e of st.extra) out.push({ v: e, role: 'fixed', name: '', side: 1 });
        if (st.rB !== 'off') out.push({ v: st.pb, role: st.rB, name: st.nameB, side: 1, bracket: st.brB, form: V.fB || V.form });
        if (st.rA !== 'off') out.push({ v: st.pos, role: st.rA, name: st.nameA, side: -1, bracket: st.brA, form: V.fA || V.form });
        return out;
      };
      const stmtNow = () => {
        if (st.phase === 'explore' && st.mode === 'compare') { const A = snap(st.pos, 1), B = snap(st.pb, 1); return `${nf(A)} ${relOf(A, B)} ${nf(B)}`; }
        return st.stmt;
      };

      /* ---------- drawing: a vertical line for situations ---------- */
      const drawV = (c, p, g) => {
        const pal = p.pal, V = st.view, Cx = CTXS.find(q => q.id === V.ctx), [a, b] = V.win, u = g.u, fs = g.fs, W = g.W, H = g.H;
        const X = g.vx, Y = g.Y, y0 = Y(b), y1 = Y(a), marks = marksOf();
        const tube = Cx.id === 'temp', tw = 26 * u, ax = X - (tube ? tw / 2 + 4 * u : 4 * u);
        if (Cx.id === 'elev') {
          c.fillStyle = alpha(pal.blue, .1); c.fillRect(0, Y(0), W, H - Y(0));
          c.beginPath(); for (let x = 0; x <= W; x += 4) { const y = Y(0) + Math.sin(x / 15 * 1) * 2.6; x ? c.lineTo(x, y) : c.moveTo(x, y); }
          c.strokeStyle = alpha(pal.blue, .55); c.lineWidth = 2; c.stroke();
        }
        if (tube) {
          rrect(c, X - tw / 2, y0 - 12 * u, tw, y1 - y0 + 24 * u, tw / 2); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal['grid-strong']; c.lineWidth = 2; c.stroke();
          if (st.rA !== 'off' && st.rB === 'off') {
            const top = Y(clamp(st.pos, a, b)), lw = tw - 10 * u;
            rrect(c, X - lw / 2, top, lw, y1 + 8 * u - top, lw / 2); c.fillStyle = alpha(pal.blue, .6); c.fill();
          }
        } else {
          line(c, X, y0 - 14 * u, X, y1 + 14 * u, pal.blue, 2.6);
          tri(c, X, y0 - 14 * u, 0, -1, 8, pal.blue); tri(c, X, y1 + 14 * u, 0, 1, 8, pal.blue);
        }
        line(c, ax - 24 * u, Y(0), W - g.pad, Y(0), alpha(pal.violet, .55), 1.6, [6, 4]);
        for (let i = 0; ; i++) {
          const v = r6(a + i * V.minor); if (v > b + 1e-9) break;
          const major = close(v / V.major, Math.round(v / V.major)), zero = close(v, 0), y = Y(v);
          line(c, ax - (major ? 13 : 6) * u, y, ax, y, zero ? pal.violet : pal['grid-strong'], zero ? 2.6 : major ? 1.8 : 1.2);
          if (major) T(c, p, nf(v), ax - 18 * u, y, { size: fs - 1, align: 'right', color: zero ? pal.violet : pal.muted, weight: zero ? 800 : 600 });
        }
        T(c, p, '▲ ' + Cx.capUp, X, y0 - 30 * u, { size: fs - 1, color: pal.muted, halo: false });
        T(c, p, '▼ ' + Cx.capDown, X, y1 + 32 * u, { size: fs - 1, color: pal.muted, halo: false });
        const bm = marks.filter(m => m.bracket && !close(m.v, 0)).sort((m1, m2) => ab(m1.v) - ab(m2.v)), cnt = { 1: 0, '-1': 0 };
        for (const m of bm) {
          const sgn1 = m.v > 0 ? 1 : -1, bx = X + (16 + 12 * cnt[sgn1]) * u, ya = Y(0), yb = Y(m.v); cnt[sgn1]++;
          line(c, bx, ya, bx, yb, pal.yellow, 2.8); line(c, bx - 5 * u, ya, bx + 5 * u, ya, pal.yellow, 2.8); line(c, bx - 5 * u, yb, bx + 5 * u, yb, pal.yellow, 2.8);
        }
        const cx0 = X + (30 + 12 * Math.max(cnt[1], cnt[-1], 1) - 12) * u;
        if (st.zeroKnown && !marks.some(m => ab(Y(m.v) - Y(0)) < 30 * u)) T(c, p, '0 = ' + Cx.zeroTag, W - g.pad, Y(0) - 14 * u, { size: fs - 1, align: 'right', color: pal.violet, weight: 700 });
        for (const m of marks) {
          const y = Y(m.v);
          if (m.role === 'ghost') { c.beginPath(); c.arc(X, y, 7 * u, 0, Math.PI * 2); c.setLineDash([3, 3]); c.strokeStyle = pal.muted; c.lineWidth = 2; c.stroke(); c.setLineDash([]); }
          else if (m.role === 'fixed') { c.beginPath(); c.arc(X, y, 7 * u, 0, Math.PI * 2); c.fillStyle = pal.blue; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 2; c.stroke(); }
          else { c.beginPath(); c.arc(X, y, 10.5 * u, 0, Math.PI * 2); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.brass; c.lineWidth = 3.4; c.stroke(); }
          const txt = (m.name ? m.name + '  ' : '') + Cx.val(m.v) + (m.bracket && !close(m.v, 0) ? `  ·  ${nf(ab(m.v))} from 0` : '');
          chip(c, p, txt, cx0, y, m.role === 'ghost' ? { left: true, size: fs, border: pal.muted, dash: [4, 3], color: pal.muted, maxX: W }
            : { left: true, size: fs, border: m.role === 'active' ? pal.brass : pal.blue, maxX: W });
        }
      };

      /* ---------- drawing: a horizontal line ---------- */
      const drawH = (c, p, g) => {
        const pal = p.pal, V = st.view, [a, b] = V.win, u = g.u, fs = g.fs, W = g.W, yL = g.yL, X = g.X, marks = marksOf();
        if (st.shade) {
          const { rel, F } = st.shade, xa = rel === '<' ? g.pad : X(F), xb = rel === '<' ? X(F) : W - g.pad;
          c.fillStyle = alpha(pal.yellow, .5); c.fillRect(xa, yL - 7, xb - xa, 14);
        }
        line(c, g.pad, yL, W - g.pad, yL, pal.blue, 2.6);
        tri(c, g.pad, yL, -1, 0, 8, pal.blue); tri(c, W - g.pad, yL, 1, 0, 8, pal.blue);
        /* stems under the labels */
        for (const m of marks) {
          const x = X(m.v), yc = m.side < 0 ? yL - g.up : yL + g.down;
          line(c, x, yL, x, yc, m.role === 'ghost' ? alpha(pal.muted, .8) : m.role === 'active' ? pal.brass : alpha(pal.blue, .7), m.role === 'active' ? 2.2 : 1.6, m.role === 'ghost' ? [4, 3] : null);
        }
        for (let i = 0; ; i++) {
          const v = r6(a + i * V.minor); if (v > b + 1e-9) break;
          const isI = close(v, Math.round(v)), isH = !isI && close(v * 2, Math.round(v * 2)), zero = close(v, 0), major = isI && close(v / V.major, Math.round(v / V.major));
          const len = (isI ? 13 : isH ? 9 : 6) * u, x = X(v);
          line(c, x, yL - len, x, yL + len, zero ? pal.violet : pal['grid-strong'], zero ? 2.8 : isI ? 1.8 : 1.2);
          if (major) T(c, p, nf(v), x, yL + 27 * u, { size: fs, color: zero ? pal.violet : pal.muted, weight: zero ? 800 : 600 });
        }
        /* brackets for distance from 0 */
        for (const m of marks) if (m.bracket && !close(m.v, 0)) {
          const up = m.side < 0, yb = up ? yL - 24 * u : yL + 52 * u, xa = X(0), xb = X(m.v), cap = up ? 6 * u : -6 * u;
          line(c, xa, yb, xb, yb, pal.yellow, 2.8); line(c, xa, yb, xa, yb + cap, pal.yellow, 2.8); line(c, xb, yb, xb, yb + cap, pal.yellow, 2.8);
          T(c, p, plural(ab(m.v), 'step'), (xa + xb) / 2, yb + (up ? -14 : 14) * u, { size: fs - 1 });
        }
        for (const m of marks) {
          const x = X(m.v), up = m.side < 0, yc = up ? yL - g.up : yL + g.down;
          if (m.role === 'ghost') { c.beginPath(); c.arc(x, yL, 6.5 * u, 0, Math.PI * 2); c.setLineDash([3, 3]); c.strokeStyle = pal.muted; c.lineWidth = 2; c.stroke(); c.setLineDash([]); }
          else if (m.role === 'fixed') { c.beginPath(); c.arc(x, yL, 6.5 * u, 0, Math.PI * 2); c.fillStyle = pal.blue; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 2; c.stroke(); }
          else { c.beginPath(); c.arc(x, yL, 8.5 * u, 0, Math.PI * 2); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.brass; c.lineWidth = 3.2; c.stroke(); }
          const txt = (m.name ? m.name + '  ' : '') + formOf(m.v, m.form || V.form);
          chip(c, p, txt, x, yc, m.role === 'ghost' ? { size: fs, border: pal.muted, dash: [4, 3], color: pal.muted, maxX: W }
            : { size: fs, border: m.role === 'active' ? pal.brass : pal.blue, maxX: W });
        }
        if (st.shade) { c.beginPath(); c.arc(X(st.shade.F), yL, 7 * u, 0, Math.PI * 2); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.yellow; c.lineWidth = 3; c.stroke(); }
        const sm = stmtNow();
        if (sm) T(c, p, sm, W / 2, 66 * u, { size: clamp(fs * 1.8, 20, 34), weight: 700, halo: false });
        const cap = st.mode === 'compare' ? ['◀ less', 'greater ▶'] : ['◀ negative', 'positive ▶'];
        T(c, p, cap[0], g.tx, g.H - 22 * u, { size: fs - 1, align: 'left', color: pal.muted, halo: false });
        T(c, p, cap[1], W - g.tx, g.H - 22 * u, { size: fs - 1, align: 'right', color: pal.muted, halo: false });
      };

      /* ---------- drawing: the coordinate grid ---------- */
      const drawGrid = (c, p, g) => {
        const pal = p.pal, u = g.u, fs = g.fs, s = g.s, ox = g.ox, oy = g.oy, R = g.R, GX = x => ox + x * s, GY = y => oy - y * s, x = st.pos, y = st.pb;
        if (st.tint && QSIGN[st.tint]) {
          const [sx, sy] = QSIGN[st.tint];
          c.fillStyle = alpha(pal.yellow, .13); c.fillRect(sx > 0 ? ox : ox - R * s, sy > 0 ? oy - R * s : oy, R * s, R * s);
        }
        c.lineWidth = 1; c.strokeStyle = pal.grid; c.beginPath();
        for (let i = -R; i <= R; i++) { c.moveTo(GX(i), GY(-R)); c.lineTo(GX(i), GY(R)); c.moveTo(GX(-R), GY(i)); c.lineTo(GX(R), GY(i)); }
        c.stroke();
        if (s >= 22) {
          c.fillStyle = alpha(pal.muted, .4);
          for (let i = -R; i < R; i++) for (let j = -R; j <= R; j++) { c.fillRect(GX(i + .5) - 1, GY(j) - 1, 2, 2); c.fillRect(GX(j) - 1, GY(i + .5) - 1, 2, 2); }
        }
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.6; c.strokeRect(GX(-R), GY(R), 2 * R * s, 2 * R * s);
        line(c, GX(-R), oy, GX(R), oy, pal.axis, 2); line(c, ox, GY(-R), ox, GY(R), pal.axis, 2);
        tri(c, GX(R), oy, 1, 0, 8, pal.axis); tri(c, ox, GY(R), 0, -1, 8, pal.axis);
        if (s >= 22) for (let i = -R + 1; i < R; i++) if (i) {
          T(c, p, nf(i), GX(i), oy + 13 * u, { size: fs - 2, color: pal.muted, weight: 600 });
          T(c, p, nf(i), ox - 9 * u, GY(i), { size: fs - 2, color: pal.muted, weight: 600, align: 'right' });
        }
        T(c, p, '0', ox - 9 * u, oy + 12 * u, { size: fs - 2, color: pal.muted, align: 'right' });
        c.font = `italic 600 ${fs + 3}px ${SERIF}`; c.textBaseline = 'middle'; c.fillStyle = pal.text; c.textAlign = 'right'; c.fillText('x', GX(R) - 12, oy - 14 * u);
        c.textAlign = 'left'; c.fillText('y', ox + 12, GY(R) + 14 * u);
        const ql = (q, sx, sy) => T(c, p, `${q}  (${sgn(sx)}, ${sgn(sy)})`, sx > 0 ? GX(R) - 8 : GX(-R) + 8, sy > 0 ? GY(R) + 36 * u : GY(-R) - 12 * u, { size: fs - 1, align: sx > 0 ? 'right' : 'left', color: pal.muted, halo: false, weight: 700 });
        ql('I', 1, 1); ql('II', -1, 1); ql('III', -1, -1); ql('IV', 1, -1);
        T(c, p, 'Coordinate grid', g.tx, 24 * u, { size: fs + 2, align: 'left', weight: 700, halo: false });
        if (!close(x, 0)) line(c, GX(0), oy, GX(x), oy, pal.green, 4.5);
        if (!close(y, 0)) line(c, GX(x), oy, GX(x), GY(y), pal.red, 4.5);
        const px = GX(x), py = GY(y);
        c.beginPath(); c.arc(px, py, 9.5 * u, 0, Math.PI * 2); c.fillStyle = st.gOk ? pal.yellow : pal.stage; c.fill(); c.strokeStyle = pal.brass; c.lineWidth = 3.2; c.stroke();
        const txt = gp(snap(x, .5), snap(y, .5)), w = mw(c, txt, fs, 700) + 18, onRight = px > ox + R * s * .25;
        chip(c, p, txt, onRight ? px - 16 * u - w : px + 16 * u, py < GY(R) + 46 * u ? py + 20 * u : py - 20 * u, { left: true, size: fs, maxX: g.W });
      };

      P.onDraw = (c, p) => {
        const g = lay();
        if (st.mode === 'grid') return drawGrid(c, p, g);
        const title = st.mode === 'zero' ? cNow().name : TITLES[st.mode];
        if (st.view.orient === 'v') drawV(c, p, g); else drawH(c, p, g);
        T(c, p, title, g.tx, 24 * g.u, { size: g.fs + 2, align: 'left', weight: 700, halo: false });
      };
      const draw = () => P.draw();

      /* ---------- dragging, arrow keys and nudge buttons ---------- */
      const stageNow = () => (st.phase === 'quiz' && st.task ? st.task.stages[st.si] : null);
      const canMove = () => st.phase === 'explore' || (!st.fin && stageNow() && stageNow().k === 'place');
      const gsnap = v => clamp(snap(v, .5), -5, 5);
      const clampSnap = v => clamp(snap(v, st.view.snap), st.view.win[0], st.view.win[1]);
      const ptr = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      const targetAt = (px, py) => {
        if (!canMove()) return null;
        if (st.mode === 'grid') return 'G';
        if (st.phase === 'explore' && st.mode === 'compare') return py < lay().yL ? 'A' : 'B';
        return st.rA === 'active' ? 'A' : st.rB === 'active' ? 'B' : null;
      };
      const afterMove = () => { draw(); live(); };
      const moveTo = (id, px, py) => {
        const g = lay();
        if (id === 'G') { st.pos = gsnap((px - g.ox) / g.s); st.pb = gsnap((g.oy - py) / g.s); if (st.phase === 'explore') st.tint = quad(st.pos, st.pb); else { st.tint = ''; st.gOk = false; } }
        else {
          const [a, b] = st.view.win, raw = st.view.orient === 'v' ? a + (g.Y(a) - py) / (g.Y(a) - g.Y(b)) * (b - a) : a + (px - g.X(a)) / (g.X(b) - g.X(a)) * (b - a);
          if (id === 'A') st.pos = clampSnap(raw); else st.pb = clampSnap(raw);
        }
        afterMove();
      };
      let drag = null;
      cv.addEventListener('pointerdown', e => {
        const [px, py] = ptr(e), id = targetAt(px, py);
        if (!id) return;
        drag = id; cv.setPointerCapture(e.pointerId); e.preventDefault(); cancel(); moveTo(id, px, py);
      });
      cv.addEventListener('pointermove', e => {
        const [px, py] = ptr(e);
        if (drag) moveTo(drag, px, py); else cv.style.cursor = targetAt(px, py) ? 'grab' : 'default';
      });
      cv.addEventListener('pointerup', () => { if (!drag) return; drag = null; if (st.phase === 'quiz') submit(); });
      cv.addEventListener('pointercancel', () => { drag = null; });
      const nudge = (id, dir) => {
        if (!canMove()) return;
        cancel();
        const step = st.view.snap;
        if (id === 'A') st.pos = clampSnap(st.pos + dir * step); else st.pb = clampSnap(st.pb + dir * step);
        afterMove();
      };
      const nudgeG = (dx, dy) => {
        if (!canMove()) return;
        cancel(); st.pos = gsnap(st.pos + dx * .5); st.pb = gsnap(st.pb + dy * .5);
        if (st.phase === 'explore') st.tint = quad(st.pos, st.pb); else { st.tint = ''; st.gOk = false; }
        afterMove();
      };
      cv.addEventListener('keydown', e => {
        const k = e.key;
        if (k === 'Enter' && st.phase === 'quiz') { e.preventDefault(); submit(); return; }
        const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[k];
        if (!d) return;
        e.preventDefault();
        if (st.mode === 'grid') nudgeG(d[0], d[1]);
        else if (st.view.orient === 'v') nudge(st.rA === 'active' ? 'A' : 'B', d[1]);
        else nudge(st.phase === 'explore' || st.rA === 'active' ? 'A' : 'B', d[0]);
      });

      /* ---------- the side panel ---------- */
      const probe = C.readout(), host = probe.parentElement; probe.remove();
      const group = () => { const g = h('div', { style: 'display:flex;flex-direction:column;gap:16px;flex:none' }); host.append(g); return g; };
      const mkSelect = (parent, label, onChange) => {
        const id = 'neg' + Math.random().toString(36).slice(2, 8), sel = h('select', { id }), lab = h('label', { for: id }, label);
        sel.addEventListener('change', () => onChange(sel.value));
        parent.append(h('div', { class: 'ctl select' }, lab, sel));
        return { sel, lab };
      };
      const fillSel = (sel, items, value) => { sel.replaceChildren(...items.map((t, i) => h('option', { value: String(i) }, t))); sel.value = String(value); };
      const small = b => { Object.assign(b.style, { padding: '6px 14px', minHeight: '36px', fontSize: '.88rem' }); return b; };
      const smallBtn = (label, onClick, primary) => small(h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label));
      const para = (html, style = '') => h('p', { html, style: 'margin:0 0 8px;' + style });
      const choiceList = items => h('div', { style: 'display:flex;flex-direction:column;gap:8px;margin:10px 0 4px' }, items.map(it => {
        const b = h('button', { type: 'button', class: 'choice' + (it.state ? ' ' + it.state : ''), html: it.label, onclick: it.onClick });
        Object.assign(b.style, { borderRadius: '12px', textAlign: 'left', width: '100%' }); b.disabled = !!it.state; return b;
      }));

      C.title('Choose a job');
      modeBtns = C.buttons(MODES.map(m => ({ label: m.name, onClick: () => { cancel(); startExplore(m.id); sync(); } })));
      for (const b of modeBtns) small(b);
      const gSel = group(), sl = mkSelect(gSel, 'Question', v => { cancel(); pickFromSelect(+v); });
      taskSel = sl.sel; selLabel = sl.lab;
      ro = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); host.append(ro);

      const pickFromSelect = i => {
        if (st.mode === 'zero') { if (st.phase === 'quiz') startTask('zero', i); else startExplore('zero', i); }
        else if (i === 0) startExplore(st.mode); else startTask(st.mode, i - 1);
        sync();
      };

      /* what the exploration shows */
      const exploreLines = () => {
        const V = st.view, L = [];
        if (st.mode === 'zero') {
          const Cx = cNow(), v = snap(st.pos, V.snap);
          L.push(kk('Marker', `<b>${Cx.val(v)}</b>`));
          L.push(kk('In words', Cx.say(v)));
          L.push(close(v, 0) ? 'Zero is its own opposite.' : kk('Opposite', `${Cx.val(-v)}: ${Cx.say(-v)}`));
          L.push(kk('Zero means', Cx.zeroSay));
        } else if (st.mode === 'locate') {
          const v = snap(st.pos, V.snap), names = namesOf(v);
          L.push(kk('Marker', `<b>${nf(v)}</b>`));
          if (names.length > 1) L.push(kk('Other names', names.slice(1).join(' = ')));
          L.push(kk('Place', close(v, 0) ? 'at 0, the starting point' : whereIs(v)));
          L.push(kk('Side', close(v, 0) ? '0 is neither positive nor negative' : v < 0 ? 'negative, to the left of 0' : 'positive, to the right of 0'));
        } else if (st.mode === 'compare') {
          const A = snap(st.pos, 1), B = snap(st.pb, 1), r = relOf(A, B), aA = ab(A), aB = ab(B);
          L.push(kk('A', `<b>${nf(A)}</b>`) + ' &nbsp; ' + kk('B', `<b>${nf(B)}</b>`));
          L.push(kk('Places', r === '=' ? 'A and B are at the same spot.' : `A is to the ${side(A - B)} of B.`));
          L.push(kk('Statement', `<b>${nf(A)} ${REL[r]} ${nf(B)}</b>, so A is ${r === '<' ? 'less than' : r === '>' ? 'greater than' : 'equal to'} B`));
          if (A < 0 && B < 0 && !close(aA, aB)) L.push(`Without the minus signs, ${nf(aA)} ${REL[relOf(aA, aB)]} ${nf(aB)}. With them, the order flips: ${nf(A)} ${REL[r]} ${nf(B)}.`);
          else if (A < 0 !== B < 0 && !close(A, 0) && !close(B, 0)) L.push('A negative number is always to the left of a positive number, so it is less.');
          else if (A > 0 && B > 0 && !close(A, B)) L.push('Both are positive, so the number with the bigger size is farther right.');
          else if ((close(A, 0) || close(B, 0)) && r !== '=') L.push('Every negative number is less than 0, and 0 is less than every positive number.');
        } else if (st.mode === 'abs') {
          const v = snap(st.pos, .5), d = ab(v);
          L.push(kk('Marker', `<b>${nf(v)}</b>`));
          L.push(kk('Distance from 0', plural(d, 'step')));
          L.push(kk('Absolute value', `<b>|${nf(v)}| = ${nf(d)}</b>`));
          L.push(close(v, 0) ? 'Zero is its own opposite.' : kk('Opposite', `${nf(-v)}, also ${plural(d, 'step')} from 0, so |${nf(-v)}| = ${nf(d)}`));
          L.push(close(v, 0) ? 'Zero is 0 steps from 0.' : v < 0 ? 'The minus sign says which side of 0. The absolute value ignores the side and keeps only the distance.' : 'A positive number is already its own distance from 0.');
        } else {
          const x = snap(st.pos, .5), y = snap(st.pb, .5);
          L.push(kk('Point', `<b>${gp(x, y)}</b>`));
          L.push(kk('<b style="color:var(--green)">x</b>', close(x, 0) ? '0, so on the y-axis' : `${nf(x)}: ${xdir(x)}`));
          L.push(kk('<b style="color:var(--red)">y</b>', close(y, 0) ? '0, so on the x-axis' : `${nf(y)}: ${ydir(y)}`));
          L.push(kk('Where', quadText(x, y)));
        }
        return L;
      };
      const live = () => { if (st.phase === 'explore' && liveEl) liveEl.innerHTML = exploreLines().join('<br>'); };

      /* rows of nudge buttons (they move the marker without checking) */
      const nudgeRow = (label, buttons) => h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:6px 0' }, label ? h('span', { class: 'k', style: 'min-width:1.2em' }, label) : null, buttons);
      const nudgeRows = () => {
        if (st.mode === 'grid') return nudgeRow('', [smallBtn('◀', () => nudgeG(-1, 0)), smallBtn('▶', () => nudgeG(1, 0)), smallBtn('▲', () => nudgeG(0, 1)), smallBtn('▼', () => nudgeG(0, -1))]);
        const sn = st.view.snap, v = st.view.orient === 'v', id = st.phase === 'explore' || st.rA === 'active' ? 'A' : 'B';
        const form = (id === 'B' ? st.view.fB : st.view.fA) || st.view.form, s = stepWords(sn, form === 'dec' ? 'dec' : form).replace('one whole step', '1');
        const row = who => [smallBtn((v ? '▼ ' : '◀ ') + s, () => nudge(who, -1)), smallBtn(s + (v ? ' ▲' : ' ▶'), () => nudge(who, 1))];
        if (st.phase === 'explore' && st.mode === 'compare') return h('div', {}, nudgeRow('A', row('A')), nudgeRow('B', row('B')));
        return nudgeRow('', row(id));
      };

      const renderExplore = () => {
        liveEl = h('p', { style: 'margin:0 0 10px;', html: exploreLines().join('<br>') });
        fbEl = null;
        return [liveEl, para(HINTS[st.mode], 'color:var(--muted)'), nudgeRows(), h('div', { style: 'margin-top:8px' }, smallBtn('Try a question', () => { cancel(); startTask(st.mode, st.mode === 'zero' ? st.ctx : 0); }, true))];
      };
      const renderQuiz = () => {
        const Tk = st.task, S = Tk.stages[st.si], n = Tk.stages.length, out = [];
        liveEl = null;
        out.push(para(`<b>${Tk.head}</b>`));
        if (!st.fin && S) {
          out.push(para((n > 1 ? `<span class="k">Part ${st.si + 1} of ${n}</span> ` : '') + S.ask));
          if (S.k === 'pick') out.push(choiceList(S.choices.map((ch, i) => ({ label: ch.label, state: st.picks[st.si + ':' + i], onClick: () => pickChoice(i) }))));
          else {
            const rows = nudgeRows();
            rows.append(smallBtn('Check', submit, true));
            out.push(rows);
          }
        } else out.push(para(`<span class="k">Done</span> Question ${st.ti + 1} of ${TASKS[st.mode].length}`));
        fbEl = h('p', { style: 'margin:8px 0 10px;', html: st.fb }); out.push(fbEl);
        if (st.fin) {
          out.push(h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' },
            smallBtn('Next question', () => { cancel(); startTask(st.mode, (st.ti + 1) % TASKS[st.mode].length); }, true),
            smallBtn('Do this one again', () => { cancel(); startTask(st.mode, st.ti); }),
            smallBtn('Explore freely', () => { cancel(); startExplore(st.mode); sync(); })));
        } else out.push(smallBtn('Explore freely', () => { cancel(); startExplore(st.mode); sync(); }));
        return out;
      };
      const render = () => { ro.replaceChildren(...(st.phase === 'explore' ? renderExplore() : renderQuiz())); };

      const submit = () => {
        const S = stageNow();
        if (!S || S.k === 'pick' || st.fin) return;
        const r = S.check();
        st.fb = r.fb;
        if (r.ok) advance();
        render(); draw();
      };
      const pickChoice = i => {
        const S = stageNow(), ch = S.choices[i];
        st.picks[st.si + ':' + i] = ch.ok ? 'right' : 'wrong';
        st.fb = `${ch.ok ? ok('Yes.') : no('Not quite.')} ${ch.why}`;
        if (ch.ok) { if (S.onRight) S.onRight(); advance(); }
        render(); draw();
      };

      const sync = () => {
        modeBtns.forEach((b, i) => { b.className = MODES[i].id === st.mode ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', MODES[i].id === st.mode); });
        selLabel.textContent = st.mode === 'zero' ? 'Situation' : 'Question';
        if (st.mode === 'zero') fillSel(taskSel, CTXS.map(q => q.name), st.ctx);
        else fillSel(taskSel, ['Explore freely', ...TASKS[st.mode].map(q => q.label)], st.phase === 'explore' ? 0 : st.ti + 1);
        render(); draw();
      };

      /* ---------- guided steps ---------- */
      const apply = (patch, immediate) => {
        cancel();
        const { mode, ctx, ...nums } = patch;
        if (mode !== undefined) startExplore(mode, ctx);
        const to = {};
        for (const k of ['pos', 'pb']) if (nums[k] !== undefined) to[k] = nums[k];
        if (immediate || !Object.keys(to).length) { Object.assign(st, to); sync(); return; }
        st.pos = 0; if (st.mode === 'compare' || st.mode === 'grid') st.pb = 0;
        if (st.mode === 'grid') st.tint = '';
        sync();
        cancel = animateTo(st, to, 900, () => { draw(); live(); }, () => { if (st.mode === 'grid') { st.tint = quad(st.pos, st.pb); draw(); } });
      };
      startExplore('zero', 0);
      sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
