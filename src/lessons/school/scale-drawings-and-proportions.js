/* =====================================================================
   SCHOOL — Scale drawings and proportions
   ===================================================================== */
{
  const SANS = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
  const ok = t => `<b style="color:var(--green)">${t}</b>`;
  const no = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;
  const clean = v => Math.round(v * 1e6) / 1e6;
  const same = (a, b) => Math.abs(a - b) < 1e-6;

  /* a number for reading: up to 3 decimals (2 digits for tiny ones), commas from 10,000, a true minus sign */
  const N = v => {
    const a = Math.abs(clean(v));
    const r = a !== 0 && a < .01 ? +a.toPrecision(2) : +a.toFixed(3);
    let s = String(r);
    if (r >= 10000) s = s.replace(/^\d+/, m => m.replace(/\B(?=(\d{3})+$)/g, ','));
    return (v < 0 && r !== 0 ? '−' : '') + s;
  };
  /* the same, with "about" when the number was rounded */
  const Ab = v => { const back = +N(v).replace(/,/g, '').replace('−', '-'); return (Math.abs(back - v) > 1e-9 ? 'about ' : '') + N(v); };
  const rdLen = v => N(+v.toFixed(1));

  /* ---------- one calculation question ----------
     The right choice and three usual mistakes, each explained with the numbers.
     n: the amount you start with, in unit a. k: the scale number.
     'mul' gives n × k in unit b. 'div' gives n ÷ k in unit b.
     rel: the scale in words. row: the line of the double number line that the answer lives on. pos: where the right choice goes. */
  const ops = ({ n, k, a, b, dir, rel, row = 'bot', pos = 1 }) => {
    const mul = dir === 'mul', r = mul ? n * k : n / k, q = mul ? n / k : n * k, w = mul ? n + k : n - k;
    const sym = mul ? '×' : '÷', alt = mul ? '÷' : '×';
    const back = v => (mul ? v / k : v * k);   /* the amount of unit a that goes with v of unit b */
    const L = [
      { t: `${N(n)} ${sym} ${N(k)} = ${N(r)} ${b}`, ok: true, land: { row, v: r, label: `${N(r)} ${b}` },
        say: mul
          ? `${rel} So ${N(n)} ${a} is ${N(n)} groups of ${N(k)} ${b}, and you multiply: ${N(n)} × ${N(k)} = ${N(r)} ${b}. On the double number line, ${N(n)} ${a} sits right above ${N(r)} ${b}. Check: ${N(r)} ÷ ${N(k)} = ${N(n)}.`
          : `${rel} How many pieces of ${N(k)} ${a} fit in ${N(n)} ${a}? ${N(n)} ÷ ${N(k)} = ${N(r)}.${n < k ? ' Less than one whole piece fits, so the answer is less than 1.' : ''} Each piece is 1 ${b}, so the answer is ${N(r)} ${b}. Check: ${N(r)} × ${N(k)} = ${N(n)}.` },
      { t: `${N(n)} ${alt} ${N(k)} = ${N(q)} ${b}`, land: { row, v: q, label: `${N(q)} ${b}` },
        say: mul
          ? `${N(n)} ÷ ${N(k)} = ${N(q)} ${b}. That is smaller than ${N(n)}, but each 1 ${a} stands for ${N(k)} ${b}, so ${N(n)} ${a} must stand for more than ${N(n)} ${b}. On the double number line, ${N(q)} ${b} sits above only ${Ab(back(q))} ${a}, not above ${N(n)} ${a}. Multiply instead.`
          : `${N(n)} × ${N(k)} = ${N(q)} ${b}. That is bigger than ${N(n)}, but it takes ${N(k)} ${a} to make just 1 ${b}, so the answer must be smaller than ${N(n)}. ${N(q)} ${b} would stand for ${N(q)} × ${N(k)} = ${Ab(back(q))} ${a}, not ${N(n)} ${a}. Divide instead.` },
      { t: `${N(n)} ${sym} ${N(k)} = ${N(r)} ${a}`, land: { row, v: r, label: `${N(r)} ${a}` },
        say: `The number ${N(r)} is right, but the unit is not. You started with ${a}, and the scale changes the unit as well as the number. The answer counts ${b}, so write ${N(r)} ${b}.` },
      { t: `${N(n)} ${mul ? '+' : '−'} ${N(k)} = ${N(w)} ${b}`, land: { row, v: w, label: `${N(w)} ${b}` },
        say: mul
          ? `${N(n)} + ${N(k)} = ${N(w)} ${b}. Adding does not use the scale. Every 1 ${a} stands for ${N(k)} ${b}, and ${N(n)} ${a} holds ${N(n)} of those groups. Finding ${N(n)} groups of ${N(k)} means multiplying: ${N(n)} × ${N(k)} = ${N(r)}, not ${N(w)}.`
          : `${N(n)} − ${N(k)} = ${N(w)} ${b}. Subtracting takes away just one piece of ${N(k)} ${a}. You need to know how many pieces fit: ${N(n)} ÷ ${N(k)} = ${N(r)}.` }
    ];
    L.splice(pos, 0, L.shift());
    return L;
  };

  /* picking a scale for a drawing: which scales fit the sheet, and which fit best */
  const scaleOps = ({ sheet, room, scales, best, a, b }) => scales.map((s, i) => {
    const w = room.w / s.k, h = room.h / s.k, fits = w <= sheet.W && h <= sheet.H;
    const prev = scales[i - 1];
    const o = { t: s.text, ok: i === best, land: null };
    if (i === best) o.say = `At ${s.text} the room fits on the sheet. ${prev ? `The bigger drawing at ${prev.text} would run off the page, ` : ''}so this is the largest drawing that fits.`;
    else if (!fits) o.say = `At ${s.text}, 1 ${b} on the plan stands for ${N(s.k)} ${a}. The room would be ${N(room.w)} ÷ ${N(s.k)} = ${N(w)} ${b} long and ${N(room.h)} ÷ ${N(s.k)} = ${N(h)} ${b} wide. The sheet is only ${N(sheet.W)} ${b} across and ${N(sheet.H)} ${b} down, so the plan would run off the page. Try a scale where 1 ${b} stands for more.`;
    else o.say = `At ${s.text}, 1 ${b} on the plan stands for ${N(s.k)} ${a}. The room would be ${N(room.w)} ÷ ${N(s.k)} = ${N(w)} ${b} long and ${N(room.h)} ÷ ${N(s.k)} = ${N(h)} ${b} wide. That fits, but the plan is only ${N(w)} ${b} across on a sheet ${N(sheet.W)} ${b} across. A bigger drawing is easier to read. Is there a scale that makes it bigger and still fits?`;
    return o;
  });

  /* ---------- the maps ---------- */
  const MAPS = {
    island: { W: 12, H: 8, u: 'cm', sq: 'One square is 1 cm on the map.',
      places: { Port: [1, 2], Lighthouse: [8, 2], Fort: [4, 6], Village: [10, 6] }, lab: { Fort: 'down', Village: 'down' } },
    court: { W: 12, H: 8, u: 'in', sq: 'One square is 1 inch on the plan.',
      places: { 'West hoop': [1.5, 4], 'East hoop': [10.5, 4], Bench: [6, 1.5], "Scorer's table": [6, 6.5] }, lab: { 'West hoop': 'down', 'East hoop': 'down', "Scorer's table": 'down' } },
    lakes: { W: 12, H: 8, u: 'cm', sq: 'One square is 1 cm on the map.',
      places: { Alder: [1, 2], Birch: [7, 2], Cedar: [4, 6] }, lab: { Cedar: 'down' } },
    town: { W: 12, H: 8, u: 'cm', sq: 'One square is 1 cm on the map.',
      places: { Station: [2, 2], School: [10, 2], Park: [6, 6] }, lab: { Park: 'down' } }
  };

  /* ---------- the tasks ----------
     scene: map (ruler), sheet (design a plan), chunks (a tape cut into units), blocks (a tape of recipe blocks).
     dnl: the double number line. Top row is the drawing (or the first unit), bottom row is the real thing. k = bottom per top.
          given: the row the student starts from. m0: where the marker starts. pins: the scale, marked with violet diamonds. snap: marker step.
     stages: what the student does, in order. table: columns of equivalent ratios.
          A cell shows ? while si <= q[row]. A column shows from stage `from`. op is the multiplier from the column before it. */
  const TASKS = {}, ORDERS = { map: [], design: [], units: [], multi: [] };
  const add = t => { TASKS[t.id] = t; ORDERS[t.mode].push(t.id); };
  const ROWS2 = (a, b) => [{ n: a, c: 'green' }, { n: b, c: 'red' }];

  /* Map: drawing to real */
  add({ id: 'map-1', mode: 'map', scene: 'map', map: 'island', menu: 'Island: Port to Lighthouse',
    scale: 'Scale: 1 cm = 5 km', sub: 'Island map. One square is 1 cm on the map.',
    q: 'On this map, 1 cm stands for 5 km. How far is it from Port to Lighthouse in real life?',
    ruler: [3, 4, 6, 4],
    dnl: { top: { name: 'Map (cm)', u: 'cm' }, bot: { name: 'Real (km)', u: 'km' }, k: 5, max: 10, step: 1, pins: [{ t: 1 }] },
    stages: [
      { k: 'ruler', a: 'Port', b: 'Lighthouse', len: 7, ask: 'Drag the two ends of the ruler onto Port and Lighthouse.' },
      { k: 'choose', ask: 'Choose the calculation for the real distance.', opts: ops({ n: 7, k: 5, a: 'cm', b: 'km', dir: 'mul', rel: '1 cm on the map stands for 5 km.', pos: 1 }) }
    ],
    table: { rows: ROWS2('Map (cm)', 'Real (km)'), cols: [{ v: [1, 5] }, { v: [7, 35], q: [0, 1], op: '× 7' }] },
    done: 'Port and Lighthouse are 35 km apart. The ruler reads 7 cm, and each cm stands for 5 km.' });

  add({ id: 'map-2', mode: 'map', scene: 'map', map: 'island', menu: 'Island: Port to Fort (slanted)',
    scale: 'Scale: 1 cm = 5 km', sub: 'Island map. One square is 1 cm on the map.',
    q: 'On the same map, 1 cm stands for 5 km. How far is it from Port to Fort? The ruler can slant.',
    ruler: [3, 4, 6, 4],
    dnl: { top: { name: 'Map (cm)', u: 'cm' }, bot: { name: 'Real (km)', u: 'km' }, k: 5, max: 10, step: 1, pins: [{ t: 1 }] },
    stages: [
      { k: 'ruler', a: 'Port', b: 'Fort', len: 5, ask: 'Drag the two ends of the ruler onto Port and Fort. Count the ticks along the ruler.' },
      { k: 'choose', ask: 'Choose the calculation for the real distance.', opts: ops({ n: 5, k: 5, a: 'cm', b: 'km', dir: 'mul', rel: '1 cm on the map stands for 5 km.', pos: 2 }) }
    ],
    table: { rows: ROWS2('Map (cm)', 'Real (km)'), cols: [{ v: [1, 5] }, { v: [5, 25], q: [0, 1], op: '× 5' }] },
    done: 'Port and Fort are 25 km apart. A slanted ruler works the same way: read its length, then use the scale.' });

  add({ id: 'map-3', mode: 'map', scene: 'map', map: 'court', menu: 'Gym plan: the court length',
    scale: 'Scale: 1 in = 8 ft', sub: 'Gym floor plan. One square is 1 inch on the plan.',
    q: 'This is a plan of a school gym. 1 inch on the plan stands for 8 feet. How long is the court, from the West hoop to the East hoop?',
    ruler: [2, 7.5, 5, 7.5],
    dnl: { top: { name: 'Plan (in)', u: 'in' }, bot: { name: 'Real (ft)', u: 'ft' }, k: 8, max: 12, step: 1, pins: [{ t: 1 }] },
    stages: [
      { k: 'ruler', a: 'West hoop', b: 'East hoop', len: 9, ask: 'Drag the two ends of the ruler onto the West hoop and the East hoop.' },
      { k: 'choose', ask: 'Choose the calculation for the real length.', opts: ops({ n: 9, k: 8, a: 'in', b: 'ft', dir: 'mul', rel: '1 in on the plan stands for 8 ft.', pos: 0 }) }
    ],
    table: { rows: ROWS2('Plan (in)', 'Real (ft)'), cols: [{ v: [1, 8] }, { v: [9, 72], q: [0, 1], op: '× 9' }] },
    done: 'The court is 72 ft long. The plan length is in inches and the real length is in feet, so the unit changes too.' });

  add({ id: 'map-4', mode: 'map', scene: 'map', map: 'court', menu: "Gym plan: Bench to Scorer's table",
    scale: 'Scale: 1 in = 8 ft', sub: 'Gym floor plan. One square is 1 inch on the plan.',
    q: "On the same plan, 1 inch stands for 8 feet. How far is it from the Bench to the Scorer's table, across the court?",
    ruler: [7, 7.5, 10, 7.5],
    dnl: { top: { name: 'Plan (in)', u: 'in' }, bot: { name: 'Real (ft)', u: 'ft' }, k: 8, max: 12, step: 1, pins: [{ t: 1 }] },
    stages: [
      { k: 'ruler', a: 'Bench', b: "Scorer's table", len: 5, ask: "Drag the two ends of the ruler onto the Bench and the Scorer's table." },
      { k: 'choose', ask: 'Choose the calculation for the real distance.', opts: ops({ n: 5, k: 8, a: 'in', b: 'ft', dir: 'mul', rel: '1 in on the plan stands for 8 ft.', pos: 3 }) }
    ],
    table: { rows: ROWS2('Plan (in)', 'Real (ft)'), cols: [{ v: [1, 8] }, { v: [5, 40], q: [0, 1], op: '× 5' }] },
    done: 'The court is 40 ft wide.' });

  /* Design: real to drawing */
  const D1S = [{ text: '1 in = 1 ft', k: 1 }, { text: '1 in = 2 ft', k: 2 }, { text: '1 in = 4 ft', k: 4 }];
  add({ id: 'design-1', mode: 'design', scene: 'sheet', menu: 'Fit a 12 ft room on a sheet',
    scale: S => S.si >= 1 ? 'Scale: 1 in = 2 ft' : S.sc >= 0 ? 'Trying: ' + D1S[S.sc].text : 'Scale: not chosen yet',
    sub: 'Sheet: 8 in by 6 in. Room: 12 ft by 9 ft.',
    q: 'A room is 12 ft long and 9 ft wide. You will draw its plan on a sheet of paper that is 8 in across and 6 in down. Choose the scale that makes the biggest drawing that still fits. Then draw it, with the 12 ft length across the sheet.',
    sheet: { W: 8, H: 6, u: 'in', snap: .5 }, scales: D1S, room: { w: 12, h: 9, u: 'ft' },
    plan: { w: 6, h: 4.5, w0: 2, h0: 2, pu: 'in', realW: '12 ft', realH: '9 ft', back: v => `${N(v)} × 2 = ${N(v * 2)} ft`, snap: .5 },
    dnl: { top: { name: 'Plan (in)', u: 'in' }, bot: { name: 'Room (ft)', u: 'ft' }, k: 2, max: 8, step: 1, given: 'bot', m0: 12, from: 1, until: 2, pins: [{ t: 1 }] },
    stages: [
      { k: 'scale', ask: 'Try each scale. Watch the dashed outline of the room on the sheet. Pick the scale that makes the biggest drawing that still fits.',
        opts: scaleOps({ sheet: { W: 8, H: 6 }, room: { w: 12, h: 9 }, scales: D1S, best: 1, a: 'ft', b: 'in' }) },
      { k: 'choose', ask: 'Work out the length of the plan. The room is 12 ft long.', opts: ops({ n: 12, k: 2, a: 'ft', b: 'in', dir: 'div', rel: '1 in on the plan stands for 2 ft.', row: 'top', pos: 0 }) },
      { k: 'plan', ask: 'Set the plan. Drag its corner (or use the sliders) to the right length and width, then press Check my plan. The room is 12 ft long (across) and 9 ft wide (down).' }
    ],
    table: { rows: ROWS2('Plan (in)', 'Room (ft)'), cols: [{ v: [1, 2], from: 1 }, { v: [6, 12], q: [1, -1], op: '× 6' }] },
    done: 'The plan is 6 in by 4.5 in. It fits the sheet, and it is the biggest plan that does.' });

  add({ id: 'design-2', mode: 'design', scene: 'sheet', menu: 'Scale 1 : 50 (change units first)',
    scale: 'Scale: 1 : 50, so 1 cm = 50 cm', sub: 'Sheet: 20 cm by 15 cm. Room: 6 m by 4 m.',
    q: 'A room is 6 m long and 4 m wide. The plan uses the scale 1 : 50, which means 1 cm on the plan stands for 50 cm of real room. The sheet is 20 cm across and 15 cm down. Draw the plan, with the 6 m length across the sheet.',
    sheet: { W: 20, H: 15, u: 'cm', snap: 1 },
    plan: { w: 12, h: 8, w0: 4, h0: 4, pu: 'cm', realW: '6 m', realH: '4 m', back: v => `${N(v)} × 50 = ${N(v * 50)} cm, which is ${N(v / 2)} m`, snap: 1 },
    dnl: { top: { name: 'Plan (cm)', u: 'cm' }, bot: { name: 'Room (m)', u: 'm' }, k: .5, max: 20, step: 1, given: 'bot', m0: 6, until: 2, pins: [{ t: 1 }] },
    stages: [
      { k: 'choose', ask: 'The scale compares cm with cm, but the room is measured in meters. First write the 6 m length in centimeters.',
        opts: [
          { t: '6 × 100 = 600 cm', ok: true, say: 'There are 100 cm in 1 m, so 6 m is 6 × 100 = 600 cm. Now the room and the scale both use cm.' },
          { t: '6 × 10 = 60 cm', say: 'There are 100 cm in 1 m, not 10. 60 cm is only 0.6 m, so this would make the room smaller than a table.' },
          { t: '6 ÷ 100 = 0.06 cm', say: 'Dividing goes the wrong way. A cm is a small unit, so the same length is a bigger number of cm. 6 m is far more than 6 cm. 0.06 cm is a tiny speck.' },
          { t: '6 × 1,000 = 6,000 cm', say: 'There are 1,000 m in 1 km, but only 100 cm in 1 m. 6,000 cm would be 60 m, a room as long as a swimming pool.' }
        ] },
      { k: 'choose', ask: 'Now scale it down. 1 cm on the plan stands for 50 cm of room. How long is the plan?', row: 'top',
        opts: [
          { t: '600 × 50 = 30,000 cm', say: '600 × 50 = 30,000 cm. A plan must be smaller than the room, but this is 50 times bigger. It takes 50 cm of room to make just 1 cm of plan, so divide.', land: { row: 'top', v: 30000, label: '30,000 cm' } },
          { t: '600 ÷ 50 = 12 cm', ok: true, say: '1 cm on the plan stands for 50 cm. How many pieces of 50 cm fit in 600 cm? 600 ÷ 50 = 12. So the plan is 12 cm wide. Check: 12 × 50 = 600 cm.', land: { row: 'top', v: 12, label: '12 cm' } },
          { t: '6 ÷ 50 = 0.12 cm', say: 'That divides 6 m by 50 cm, and the units do not match. You did the first step, 6 m = 600 cm, in your head but forgot to use it. Divide 600 cm by 50 cm. 0.12 cm is a speck.', land: { row: 'top', v: .12, label: '0.12 cm' } },
          { t: '600 − 50 = 550 cm', say: 'Subtracting takes away just one piece of 50 cm. You need to know how many pieces fit: 600 ÷ 50 = 12.', land: { row: 'top', v: 550, label: '550 cm' } }
        ] },
      { k: 'plan', ask: 'Set the plan. Drag its corner (or use the sliders) to the right length and width, then press Check my plan. The room is 6 m long (across) and 4 m wide (down).' }
    ],
    table: { rows: [{ n: 'Plan (cm)', c: 'green' }, { n: 'Room (cm)', c: 'red' }, { n: 'Room (m)', c: 'red' }],
      cols: [{ v: [1, 50, .5] }, { v: [12, 600, 6], q: [1, 0, -1], op: '× 12', opAt: 1 }] },
    done: 'The plan is 12 cm by 8 cm. A ratio scale such as 1 : 50 needs the same unit on both sides, so the room was changed from meters to centimeters first.' });

  add({ id: 'design-3', mode: 'design', scene: 'sheet', menu: 'Draw the court at 1 in = 8 ft',
    scale: 'Scale: 1 in = 8 ft', sub: 'Sheet: 12 in by 8 in. Court: 72 ft by 40 ft.',
    q: 'A school court is 72 ft long and 40 ft wide. Draw its plan with the scale 1 inch = 8 feet on a sheet that is 12 in across and 8 in down. Put the 72 ft length across the sheet.',
    sheet: { W: 12, H: 8, u: 'in', snap: .5 },
    plan: { w: 9, h: 5, w0: 3, h0: 3, pu: 'in', realW: '72 ft', realH: '40 ft', back: v => `${N(v)} × 8 = ${N(v * 8)} ft`, snap: .5 },
    dnl: { top: { name: 'Plan (in)', u: 'in' }, bot: { name: 'Court (ft)', u: 'ft' }, k: 8, max: 12, step: 1, given: 'bot', m0: 72, until: 1, pins: [{ t: 1 }] },
    stages: [
      { k: 'choose', ask: 'Work out the length of the plan. The court is 72 ft long.', opts: ops({ n: 72, k: 8, a: 'ft', b: 'in', dir: 'div', rel: '1 in on the plan stands for 8 ft.', row: 'top', pos: 2 }) },
      { k: 'choose', ask: 'Now the width of the plan. The court is 40 ft wide.', opts: ops({ n: 40, k: 8, a: 'ft', b: 'in', dir: 'div', rel: '1 in on the plan stands for 8 ft.', row: 'top', pos: 3 }) },
      { k: 'plan', ask: 'Set the plan. Drag its corner (or use the sliders) to the right length and width, then press Check my plan. The court is 72 ft long (across) and 40 ft wide (down).' }
    ],
    table: { rows: ROWS2('Plan (in)', 'Court (ft)'), cols: [{ v: [1, 8] }, { v: [9, 72], q: [0, -1], op: '× 9' }] },
    done: 'The plan is 9 in by 5 in. This is the same court as the gym map, drawn at the same scale, so it matches the map.' });

  /* Units: a conversion is a scale */
  const UN = (id, menu, o) => add({ id, mode: 'units', scene: 'chunks', menu, ...o });
  UN('units-1', 'Inches to feet: 30 in', {
    scale: 'Scale: 1 ft = 12 in', sub: 'A conversion is a scale. 12 in on one line match 1 ft on the other.',
    q: 'A ribbon is 30 inches long. There are 12 inches in 1 foot. How many feet long is the ribbon?',
    tape: { per: 12, small: 'in', big: 'ft', given: 'small', maxSmall: 36 },
    dnl: { top: { name: 'Inches', u: 'in' }, bot: { name: 'Feet', u: 'ft' }, k: 1 / 12, max: 36, step: 6, snap: 6, m0: 12, pins: [{ t: 12 }] },
    stages: [
      { k: 'place', val: 30, ask: 'Drag the marker along the top line to 30 in.' },
      { k: 'choose', ask: 'Choose the calculation that gives feet.', opts: ops({ n: 30, k: 12, a: 'in', b: 'ft', dir: 'div', rel: '1 ft is 12 in.', pos: 2 }) }
    ],
    table: { rows: ROWS2('Inches', 'Feet'), cols: [{ v: [12, 1] }, { v: [30, 2.5], q: [0, 1], op: '× 2.5' }] },
    done: 'The ribbon is 2.5 ft long: two 12 in pieces and half of another. Going to a bigger unit gives a smaller number, so you divide.' });
  UN('units-2', 'Meters to centimeters: 3.5 m', {
    scale: 'Scale: 1 m = 100 cm', sub: 'A conversion is a scale. 1 m on one line matches 100 cm on the other.',
    q: 'A board is 3.5 meters long. There are 100 centimeters in 1 meter. How many centimeters long is the board?',
    tape: { per: 100, small: 'cm', big: 'm', given: 'big', maxSmall: 500 },
    dnl: { top: { name: 'Meters', u: 'm' }, bot: { name: 'Centimeters', u: 'cm' }, k: 100, max: 5, step: .5, snap: .5, m0: 1, pins: [{ t: 1 }] },
    stages: [
      { k: 'place', val: 3.5, ask: 'Drag the marker along the top line to 3.5 m.' },
      { k: 'choose', ask: 'Choose the calculation that gives centimeters.', opts: ops({ n: 3.5, k: 100, a: 'm', b: 'cm', dir: 'mul', rel: '1 m is 100 cm.', pos: 0 }) }
    ],
    table: { rows: ROWS2('Meters', 'Centimeters'), cols: [{ v: [1, 100] }, { v: [3.5, 350], q: [0, 1], op: '× 3.5' }] },
    done: 'The board is 350 cm long. Going to a smaller unit gives a bigger number, so you multiply.' });
  UN('units-3', 'Yards to feet: 6 yd', {
    scale: 'Scale: 1 yd = 3 ft', sub: 'A conversion is a scale. 1 yd on one line matches 3 ft on the other.',
    q: 'A pool is 6 yards long. There are 3 feet in 1 yard. How many feet long is the pool?',
    tape: { per: 3, small: 'ft', big: 'yd', given: 'big', maxSmall: 24 },
    dnl: { top: { name: 'Yards', u: 'yd' }, bot: { name: 'Feet', u: 'ft' }, k: 3, max: 8, step: 1, snap: 1, m0: 1, pins: [{ t: 1 }] },
    stages: [
      { k: 'place', val: 6, ask: 'Drag the marker along the top line to 6 yd.' },
      { k: 'choose', ask: 'Choose the calculation that gives feet.', opts: ops({ n: 6, k: 3, a: 'yd', b: 'ft', dir: 'mul', rel: '1 yd is 3 ft.', pos: 3 }) }
    ],
    table: { rows: ROWS2('Yards', 'Feet'), cols: [{ v: [1, 3] }, { v: [6, 18], q: [0, 1], op: '× 6' }] },
    done: 'The pool is 18 ft long. Each yard is 3 ft, and there are 6 yards.' });
  UN('units-4', 'Minutes to hours: 45 min', {
    scale: 'Scale: 1 h = 60 min', sub: 'A conversion is a scale. 60 min on one line match 1 h on the other.',
    q: 'A show lasts 45 minutes. There are 60 minutes in 1 hour. How many hours does the show last? Use a table first, scaling down and then up.',
    tape: { per: 60, small: 'min', big: 'h', given: 'small', maxSmall: 120 },
    dnl: { top: { name: 'Minutes', u: 'min' }, bot: { name: 'Hours', u: 'h' }, k: 1 / 60, max: 120, step: 15, snap: 15, m0: 60, pins: [{ t: 60 }] },
    stages: [
      { k: 'place', val: 45, ask: 'Drag the marker along the top line to 45 min.' },
      { k: 'choose', ask: 'Scale down. Divide both numbers in 60 min : 1 h by 4. What ratio do you get?',
        opts: [
          { t: '15 min : 0.25 h', ok: true, say: '60 ÷ 4 = 15 and 1 ÷ 4 = 0.25. Dividing both numbers by 4 keeps the ratio, so 15 min and 0.25 h (a quarter of an hour) are the same time.' },
          { t: '15 min : 1 h', say: 'You divided only the minutes. Both numbers must be divided by the same number. If 15 minutes were 1 hour, then 60 minutes would be 4 hours.' },
          { t: '15 min : 4 h', say: 'You multiplied the hours by 4. To scale down, divide both numbers. 15 minutes is a quarter of an hour, not 4 hours.' },
          { t: '56 min : −3 h', say: 'You subtracted 4 from both numbers. Subtracting does not keep a ratio, and −3 hours makes no sense. Scale down by dividing.' }
        ] },
      { k: 'choose', ask: 'Scale up. Multiply both numbers in 15 min : 0.25 h by 3. What ratio do you get?',
        opts: [
          { t: '45 min : 3 h', say: '15 × 3 = 45 is right, but you multiplied 1 h by 3 instead of 0.25 h. Both numbers in the column 15 : 0.25 are multiplied by 3.' },
          { t: '45 min : 0.25 h', say: 'You changed only the minutes. The hours must be multiplied by 3 as well: 0.25 × 3 = 0.75.' },
          { t: '45 min : 0.75 h', ok: true, say: '15 × 3 = 45 and 0.25 × 3 = 0.75. So 45 minutes is 0.75 hour, three quarters of an hour.' },
          { t: '18 min : 3.25 h', say: 'You added 3 to both numbers. Adding changes the ratio. Multiply both numbers by 3 instead.' }
        ] },
      { k: 'choose', ask: 'A shortcut does the same job in one step. 1 h is 60 min. Choose the calculation.', opts: ops({ n: 45, k: 60, a: 'min', b: 'h', dir: 'div', rel: '1 h is 60 min.', pos: 1 }) }
    ],
    table: { rows: ROWS2('Minutes', 'Hours'), cols: [{ v: [60, 1] }, { v: [15, .25], from: 1, q: [1, 1], op: '÷ 4', opAt: -1 }, { v: [45, .75], from: 2, q: [-1, 2], op: '× 3', opAt: -1 }] },
    done: 'The show lasts 0.75 h. The table scaled 60 : 1 down to 15 : 0.25 and up to 45 : 0.75. The shortcut 45 ÷ 60 gives the same number.' });

  /* Multi-step */
  add({ id: 'multi-1', mode: 'multi', scene: 'map', map: 'lakes', menu: 'Find the scale, then use it',
    scale: S => `Scale: 1 cm = ${S.si >= 2 ? '2.5' : '?'} km`, sub: 'Lake district map. One square is 1 cm on the map.',
    q: 'Alder and Birch are 15 km apart in real life. This map has no scale printed on it. Find how many km 1 cm stands for. Then find how far Alder is from Cedar.',
    ruler: [3, 4, 6, 4],
    dnl: { top: { name: 'Map (cm)', u: 'cm' }, bot: { name: 'Real (km)', u: 'km' }, k: 2.5, max: 10, step: 1, pins: [{ t: 6, from: 1 }, { t: 1, from: 2 }] },
    stages: [
      { k: 'ruler', a: 'Alder', b: 'Birch', len: 6, ask: 'Drag the two ends of the ruler onto Alder and Birch. They are 15 km apart in real life.' },
      { k: 'choose', ask: 'What does 1 cm stand for? Choose the calculation.',
        opts: [
          { t: '15 × 6 = 90 km for each cm', say: '15 × 6 = 90. If 1 cm stood for 90 km, then 6 cm would stand for 6 × 90 = 540 km, not 15 km. To find the amount for 1 cm, share the 15 km into 6 equal parts: divide.' },
          { t: '15 ÷ 6 = 2.5 km for each cm', ok: true, say: '6 cm on the map is 15 km in real life. Share 15 km into 6 equal parts: 15 ÷ 6 = 2.5. So 1 cm = 2.5 km. Check: 6 × 2.5 = 15. The table scales 6 : 15 down by 6 to 1 : 2.5.' },
          { t: '6 ÷ 15 = 0.4 km for each cm', say: '6 ÷ 15 = 0.4. That is how many cm on the map stand for 1 km, the other unit rate. This question asks for km for 1 cm. Check: 6 cm × 0.4 would be 2.4 km, not 15 km.' },
          { t: '15 − 6 = 9 km for each cm', say: 'Subtracting compares the two numbers but not the two lengths. If 1 cm stood for 9 km, 6 cm would stand for 54 km, not 15 km. Equal parts mean division.' }
        ] },
      { k: 'ruler', a: 'Alder', b: 'Cedar', len: 5, ask: 'Now drag the ruler onto Alder and Cedar.' },
      { k: 'choose', ask: 'Choose the calculation for the real distance from Alder to Cedar.', opts: ops({ n: 5, k: 2.5, a: 'cm', b: 'km', dir: 'mul', rel: '1 cm on this map stands for 2.5 km.', pos: 2 }) }
    ],
    table: { rows: ROWS2('Map (cm)', 'Real (km)'),
      head0: 'given', cols: [{ v: [6, 15], q: [0, -1] }, { v: [1, 2.5], from: 1, q: [-1, 1], op: '÷ 6', opAt: -1 }, { v: [5, 12.5], from: 2, q: [2, 3], op: '× 5', opAt: -1 }] },
    done: 'Alder and Cedar are 12.5 km apart. Step 1 scaled 6 : 15 down to 1 : 2.5. Step 2 scaled 1 : 2.5 up to 5 : 12.5.' });

  add({ id: 'multi-2', mode: 'multi', scene: 'map', map: 'town', menu: 'Scale 1 : 50,000 (change units, too)',
    scale: 'Scale: 1 : 50,000', sub: 'Town map. 1 cm on the map is 50,000 cm in real life.',
    q: 'This map has the scale 1 : 50,000. That means 1 cm on the map stands for 50,000 cm in real life. How far is it from the Station to the School, in kilometers?',
    ruler: [3, 4, 6, 4],
    dnl: { top: { name: 'Map (cm)', u: 'cm' }, bot: { name: 'Real (km)', u: 'km' }, k: .5, max: 10, step: 1, pins: [{ t: 1, from: 3 }] },
    stages: [
      { k: 'ruler', a: 'Station', b: 'School', len: 8, ask: 'Drag the two ends of the ruler onto the Station and the School.' },
      { k: 'choose', ask: 'First find the real distance in centimeters, using the scale.',
        opts: [
          { t: '8 ÷ 50,000 = 0.00016 cm', say: 'Dividing makes the real distance tiny, but a real distance is much bigger than its map length. Each 1 cm on the map stands for 50,000 cm, so multiply.' },
          { t: '8 × 50,000 = 400,000 cm', ok: true, say: '1 cm on the map stands for 50,000 cm. 8 cm is 8 of those: 8 × 50,000 = 400,000 cm. The answer is still in cm, so one more step is needed to reach km.' },
          { t: '8 × 50,000 = 400,000 km', say: 'The number is right, but the unit is not. A ratio scale such as 1 : 50,000 uses the same unit on both sides, so the product is in cm, not km. 400,000 km is about the distance to the Moon.' },
          { t: '8 + 50,000 = 50,008 cm', say: 'Adding does not use the scale. 8 groups of 50,000 cm means 8 × 50,000 = 400,000 cm.' }
        ] },
      { k: 'choose', ask: 'Now change 400,000 cm into kilometers. 100 cm = 1 m and 1,000 m = 1 km.',
        opts: [
          { t: '400,000 ÷ 1,000 = 400 km', say: 'That treats 1 km as 1,000 cm. But 1,000 is the number of meters in 1 km. 1 m is 100 cm, so 1 km is 100 × 1,000 = 100,000 cm.', land: { row: 'bot', v: 400, label: '400 km' } },
          { t: '400,000 ÷ 100 = 4,000 km', say: '400,000 ÷ 100 = 4,000, and that number counts meters (100 cm = 1 m), not km. One more step: 1,000 m = 1 km, so 4,000 m is 4 km.', land: { row: 'bot', v: 4000, label: '4,000 km' } },
          { t: '400,000 ÷ 100,000 = 4 km', ok: true, say: '1 km = 1,000 m = 1,000 × 100 cm = 100,000 cm. So 400,000 cm holds 400,000 ÷ 100,000 = 4 of them. The towns are 4 km apart. Check: 4 km = 4,000 m = 400,000 cm.', land: { row: 'bot', v: 4, label: '4 km' } },
          { t: '400,000 ÷ 10,000 = 40 km', say: '1 km is 100,000 cm, not 10,000 cm. 10,000 cm is only 100 m. Count the zeros: 100 × 1,000 = 100,000.', land: { row: 'bot', v: 40, label: '40 km' } }
        ] }
    ],
    table: { rows: [{ n: 'Map (cm)', c: 'green' }, { n: 'Real (cm)', c: 'red' }, { n: 'Real (km)', c: 'red' }],
      cols: [{ v: [1, 50000, .5], q: [-1, -1, 2] }, { v: [8, 400000, 4], q: [0, 1, 2], op: '× 8', opAt: 0 }] },
    done: 'The towns are 4 km apart. The scale gave 400,000 cm, and 100,000 cm make 1 km. On the line, 8 cm of map sits above 4 km.' });

  add({ id: 'multi-3', mode: 'multi', scene: 'blocks', menu: 'Punch recipe: scale down, then up',
    scale: 'Recipe: 12 glasses use 9 cups of juice', sub: 'A table of equivalent ratios, one block per glass or cup.',
    q: 'A punch recipe makes 12 glasses and uses 9 cups of juice. You want to make only 8 glasses that taste the same. How many cups of juice do you need?',
    tape: { max: 16, note: S => 'One group is 4 glasses : 3 cups.',
      rows: S => [{ name: 'Glasses', col: 'green', n: S.m, per: 4 }, { name: 'Cups of juice', col: 'red', n: S.si >= 3 ? 6 : S.si >= 2 ? 3 : null, per: 3 }] },
    dnl: { top: { name: 'Glasses', u: 'glasses' }, bot: { name: 'Cups of juice', u: 'cups' }, k: .75, max: 16, step: 4, snap: 4, m0: 12, pins: [{ t: 12 }] },
    stages: [
      { k: 'place', val: 8, ask: 'Drag the marker along the top line to 8 glasses.' },
      { k: 'choose', ask: 'Scale down to one group. 12 glasses are 3 groups of 4 glasses, and the 9 cups are shared by the 3 groups. How many cups does one group of 4 glasses need?',
        opts: [
          { t: '9 − 4 = 5 cups', say: 'Taking 4 glasses and 4 cups away does not keep the taste. Scaling down means dividing both numbers by the same amount: 12 ÷ 3 = 4 and 9 ÷ 3 = 3. 4 glasses with 5 cups of juice would be a much stronger punch.' },
          { t: '9 ÷ 3 = 3 cups', ok: true, say: '12 glasses are 3 groups of 4, and the 9 cups are shared equally by those 3 groups: 9 ÷ 3 = 3 cups for each group. Both numbers were divided by 3: 12 : 9 became 4 : 3.' },
          { t: '9 − 3 = 6 cups', say: 'That takes 3 cups away because there are 3 groups, but the cups are shared among the groups, not taken away. 6 cups for 4 glasses is 1.5 cups a glass, twice as strong as the recipe (0.75 cup a glass).' },
          { t: '9 × 3 = 27 cups', say: 'Multiplying makes the punch bigger. 4 glasses is fewer than 12 glasses, so it needs fewer than 9 cups. 27 cups is far too much.' }
        ] },
      { k: 'choose', ask: 'Scale up. 8 glasses are 2 groups of 4 glasses, and each group needs 3 cups. How many cups do 8 glasses need?',
        opts: [
          { t: '3 + 2 = 5 cups', say: 'Adding the number of groups to the cups does not work. 2 groups need 2 times as many cups, not 2 more cups. 5 cups for 8 glasses is only 0.625 cup a glass, weaker than the recipe (0.75).' },
          { t: '3 × 8 = 24 cups', say: '3 cups is the amount for one group of 4 glasses, not for one glass. And 8 is the number of glasses, not the number of groups. 24 cups for 8 glasses is 3 cups a glass, four times too strong.' },
          { t: '3 × 2 = 6 cups', ok: true, say: '8 glasses are 2 groups of 4, and each group needs 3 cups. Both numbers are multiplied by 2: 4 : 3 became 8 : 6. So 8 glasses need 6 cups. Check with the unit rate: 9 ÷ 12 = 0.75 cup a glass, and 8 × 0.75 = 6.' },
          { t: '3 × 4 = 12 cups', say: 'That multiplies by 4, the number of glasses in a group. You need the number of groups: 8 ÷ 4 = 2. 12 cups for 8 glasses is 1.5 cups a glass, twice the recipe.' }
        ] }
    ],
    table: { rows: ROWS2('Glasses', 'Cups of juice'),
      head0: 'recipe', cols: [{ v: [12, 9] }, { v: [4, 3], from: 1, q: [-1, 1], op: '÷ 3', opAt: -1 }, { v: [8, 6], from: 2, q: [-1, 2], op: '× 2', opAt: -1 }] },
    done: '8 glasses need 6 cups of juice. The table scaled 12 : 9 down to 4 : 3 and up to 8 : 6. Both numbers always change by the same factor.' });

  add({ id: 'multi-4', mode: 'multi', scene: 'blocks', menu: 'Paint mix: scale up, then add',
    scale: 'Paint: 2 L blue to 3 L white', sub: 'A table of equivalent ratios, one block per liter.',
    q: 'A paint mix uses 2 liters of blue for every 3 liters of white. A painter uses 12 liters of blue. How many liters of paint does the painter mix in all?',
    tape: { max: 18, note: S => 'One group is 2 L of blue : 3 L of white.',
      rows: S => [{ name: 'Blue (L)', col: 'green', n: S.m, per: 2 }, { name: 'White (L)', col: 'red', n: S.si >= 3 ? 18 : null, per: 3 }] },
    dnl: { top: { name: 'Blue (L)', u: 'L' }, bot: { name: 'White (L)', u: 'L' }, k: 1.5, max: 14, step: 2, snap: 2, m0: 2, pins: [{ t: 2 }] },
    stages: [
      { k: 'place', val: 12, ask: 'Drag the marker along the top line to 12 L of blue.' },
      { k: 'choose', ask: 'How many times as much blue is 12 L as the 2 L in one group?',
        opts: [
          { t: '12 − 2 = 10 times', say: '12 − 2 = 10 is how many liters more, not how many times as much. 10 groups of 2 L would need 20 L of blue. The number of groups that fit in 12 L is found by dividing.' },
          { t: '12 × 2 = 24 times', say: '24 groups of 2 L would need 48 L of blue. To see how many groups of 2 L fit in 12 L, divide.' },
          { t: '12 ÷ 2 = 6 times', ok: true, say: 'One group uses 2 L of blue. 12 L of blue holds 12 ÷ 2 = 6 groups. So every amount in the mix is multiplied by 6.' },
          { t: '2 ÷ 12 = 0.167 times', say: '2 ÷ 12 is about 0.167. That says the recipe is a small part of 12 L, which is true, but the multiplier from the recipe up to 12 L goes the other way: 12 ÷ 2 = 6.' }
        ] },
      { k: 'choose', ask: 'How many liters of white go with 12 L of blue?',
        opts: [
          { t: '3 + 10 = 13 L', say: 'That adds the 10 extra liters of blue to the white. The white must grow by the same factor, not by the same amount. 12 : 13 has almost as much white as blue, but the mix has 1.5 times as much white as blue.' },
          { t: '3 × 12 = 36 L', say: 'That multiplies the white by 12, the liters of blue, not by 6, the number of groups. 36 L of white with 12 L of blue is 3 times as much white as blue, but the mix has 1.5 times as much.' },
          { t: '2 × 6 = 12 L', say: '2 × 6 = 12 is the blue again. The white comes from the 3 L of white in one group: 3 × 6.' },
          { t: '3 × 6 = 18 L', ok: true, say: 'One group uses 3 L of white, and there are 6 groups: 3 × 6 = 18 L. Multiply both numbers of 2 : 3 by 6 and you get 12 : 18.' }
        ] },
      { k: 'choose', ask: 'How many liters of paint are there in all?',
        opts: [
          { t: 'only the white: 18 L', say: '18 L is only the white paint. "In all" means the blue and the white together.' },
          { t: '12 + 18 = 30 L', ok: true, say: 'All the paint is the blue plus the white: 12 + 18 = 30 L. Check with one group: 2 + 3 = 5 L, and 6 groups make 6 × 5 = 30 L.' },
          { t: '12 × 18 = 216 L', say: 'Multiplying the two amounts does not give a total. Together means add. 216 L is far more paint than 12 L of blue and 18 L of white can make.' },
          { t: '18 − 12 = 6 L', say: 'Subtracting finds how much more white than blue. "In all" means add: 12 + 18.' }
        ] }
    ],
    table: { rows: [{ n: 'Blue (L)', c: 'green' }, { n: 'White (L)', c: 'red' }, { n: 'In all (L)', c: 'violet' }],
      head0: 'recipe', cols: [{ v: [2, 3, 5] }, { v: [12, 18, 30], q: [0, 2, 3], op: '× 6', opAt: 1 }] },
    done: 'The painter mixes 30 L: 12 L of blue and 18 L of white. The table scaled 2 : 3 : 5 up by 6 to 12 : 18 : 30.' });

  /* ---------- canvas helpers (pixel space) ---------- */
  const font = (size, weight = 600) => `${weight} ${size}px ${SANS}`;
  const tx = (c, p, str, x, y, { size = 13, color, align = 'center', weight = 600, halo = true } = {}) => {
    c.save(); c.font = font(size, weight); c.textAlign = align; c.textBaseline = 'middle';
    if (halo) { c.lineWidth = 4; c.strokeStyle = p.pal.stage; c.lineJoin = 'round'; c.strokeText(str, x, y); }
    c.fillStyle = color || p.pal.text; c.fillText(str, x, y); c.restore();
  };
  const wid = (c, str, size, weight = 600) => { c.save(); c.font = font(size, weight); const w = c.measureText(str).width; c.restore(); return w; };
  const fitSz = (c, str, maxW, size, weight = 600) => { let s = size; while (s > 9 && wid(c, str, s, weight) > maxW) s -= .5; return s; };
  const seg = (c, x1, y1, x2, y2, color, w = 1.5, dash) => {
    c.save(); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.strokeStyle = color; c.lineWidth = w;
    c.setLineDash(dash || []); c.lineCap = 'round'; c.stroke(); c.restore();
  };
  const rr = (c, x, y, w, hh, r) => {
    r = Math.max(0, Math.min(r, w / 2, hh / 2));
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + hh, r); c.arcTo(x + w, y + hh, x, y + hh, r);
    c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  const dia = (c, x, y, r, fill, stroke, lw = 1.5) => {
    c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r * .75, y); c.lineTo(x, y + r); c.lineTo(x - r * .75, y); c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); }
  };
  const circ = (c, x, y, r, fill, stroke, lw = 2) => {
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); }
  };
  const handle = (c, p, x, y, col, r = 10) => { circ(c, x, y, r, alpha(p.pal.stage, .92), col, 3.4); circ(c, x, y, 3.6, col); };

  /* ---------- geometry of the whole canvas ---------- */
  const geo = (p, TK) => {
    const W = p.w, H = p.h, pad = clamp(W * .035, 10, 18), fs = clamp(Math.min(W / 32, H / 34) + 2, 11, 15);
    const nr = TK.table.rows.length, headH = fs * 2.9, rowH = clamp(H * .045, 19, 30), tblH = fs * 1.7 + nr * rowH + 8;
    const dnlH = clamp(H * .235, 132, 150), gap = 8, w = W - 2 * pad;
    const sceneH = Math.max(70, H - 6 - headH - dnlH - tblH - 3 * gap - 6);
    let y = 6; const o = { W, H, pad, fs, rowH };
    o.head = { x: pad, y, w, h: headH }; y += headH + gap;
    o.scene = { x: pad, y, w, h: sceneH }; y += sceneH + gap;
    o.dnl = { x: pad, y, w, h: dnlH }; y += dnlH + gap;
    o.tbl = { x: pad, y, w, h: tblH };
    return o;
  };
  const dnlGeo = (g, TK) => { const R = g.dnl, D = TK.dnl; return { xL: R.x + 16, xR: R.x + R.w - 20, yT: R.y + 38, yB: R.y + R.h - 38 }; };
  const mapGeo = (g, TK) => {
    const M = MAPS[TK.map], R = g.scene, U = Math.min(R.w / M.W, (R.h - 4) / M.H);
    return { M, U, x0: R.x + (R.w - M.W * U) / 2, y0: R.y + (R.h - M.H * U) / 2 };
  };
  const sheetGeo = (g, TK) => {
    const Sh = TK.sheet, R = g.scene, left = 30, top = 22;
    const U = Math.max(4, Math.min((R.w - left - R.w * (TK.scales ? .24 : .1)) / Sh.W, (R.h - top - 12) / Sh.H));
    return { Sh, U, x0: R.x + left, y0: R.y + top };
  };
  const placeAt = (M, x, y) => { for (const [nm, [px, py]] of Object.entries(M.places)) if (same(px, x) && same(py, y)) return nm; return null; };

  register({
    id: 'scale-drawings-and-proportions', level: 'school',
    title: 'Scale drawings and proportions',
    blurb: 'Measure a map with a ruler, design a plan that fits a sheet, and see that a unit conversion is a scale on a double number line.',
    thumb(c, p) {
      const pal = p.pal, W = p.w, H = p.h, gx = W * .1, gy = H * .08, gw = W * .8, gh = H * .5, nx = 8, ny = 4, u = gw / nx;
      c.fillStyle = alpha(pal.green, .08); c.fillRect(gx, gy, gw, gh);
      c.strokeStyle = pal.grid; c.lineWidth = 1; c.beginPath();
      for (let i = 0; i <= nx; i++) { c.moveTo(gx + i * u, gy); c.lineTo(gx + i * u, gy + gh); }
      for (let j = 0; j <= ny; j++) { c.moveTo(gx, gy + j * gh / ny); c.lineTo(gx + gw, gy + j * gh / ny); }
      c.stroke(); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.strokeRect(gx, gy, gw, gh);
      /* a ruler from one place to another */
      const ax = gx + u, ay = gy + gh * .75, bx = gx + 6 * u, by = gy + gh * .25, ang = Math.atan2(by - ay, bx - ax), nxv = -Math.sin(ang), nyv = Math.cos(ang), hw = Math.max(4, u * .3);
      c.beginPath(); c.moveTo(ax + nxv * hw, ay + nyv * hw); c.lineTo(bx + nxv * hw, by + nyv * hw); c.lineTo(bx - nxv * hw, by - nyv * hw); c.lineTo(ax - nxv * hw, ay - nyv * hw); c.closePath();
      c.fillStyle = alpha(pal.text, .1); c.fill(); c.strokeStyle = alpha(pal.text, .5); c.lineWidth = 1.2; c.stroke();
      const len = Math.hypot(bx - ax, by - ay);
      for (let i = 1; i < 6; i++) { const t = i * u / len, qx = ax + (bx - ax) * t, qy = ay + (by - ay) * t; seg(c, qx - nxv * hw, qy - nyv * hw, qx - nxv * hw * .3, qy - nyv * hw * .3, pal.text, 1.2); }
      circ(c, ax, ay, 4.5, pal.yellow, pal.text, 1.2); circ(c, bx, by, 4.5, pal.yellow, pal.text, 1.2);
      /* a tiny double number line */
      const yA = H * .76, yB = H * .92;
      seg(c, gx, yA, gx + gw, yA, pal.green, 2.4); seg(c, gx, yB, gx + gw, yB, pal.red, 2.4);
      for (let i = 0; i <= 5; i++) { const x = gx + i * gw / 5; seg(c, x, yA - 3.5, x, yA + 3.5, pal.green, 1.6); seg(c, x, yB - 3.5, x, yB + 3.5, pal.red, 1.6); }
      seg(c, gx + gw * .2, yA, gx + gw * .2, yB, pal.muted, 1.2, [3, 3]); dia(c, gx + gw * .2, yA, 5, pal.violet); dia(c, gx + gw * .2, yB, 5, pal.violet);
      seg(c, gx + gw * .8, yA, gx + gw * .8, yB, pal.muted, 1.2, [3, 3]); circ(c, gx + gw * .8, yA, 5.5, pal.stage, pal.brass, 2.2);
    },
    hook: String.raw`On a map, 1 cm stands for 5 km, and two towns are 7 cm apart. How far apart are they in real life? And how would you use the same idea to fit a 12 ft room on a sheet of paper only 8 inches wide?`,
    steps: [
      { title: 'Read a scale',
        text: String.raw`<p>A map is a small drawing of a big place. The <b>scale</b> says how big. Here <b>1 cm on the map stands for 5 km</b> in real life.</p><p>Drag the two ends of the ruler onto <b>Port</b> and <b>Lighthouse</b>. The ends snap to the grid and the ruler shows its length. Then choose the calculation for the real distance. A wrong choice shows where its answer lands on the double number line.</p>`,
        set: { mode: 'map', task: 'map-1' } },
      { title: 'Draw it the other way',
        text: String.raw`<p>Now go from real life to a drawing. A room is <b>12 ft</b> by <b>9 ft</b>. The sheet is <b>8 in</b> by <b>6 in</b>.</p><p>First try each scale and watch the dashed outline. A good scale makes the drawing as big as possible and still fits. Then work out the plan's lengths and drag the plan's corner to set them. From real to drawing, you divide by what 1 inch stands for.</p>`,
        set: { mode: 'design', task: 'design-1' } },
      { title: 'A conversion is a scale',
        text: String.raw`<p>Inches and feet work like a map scale: <b>1 ft = 12 in</b>. Drag the marker along the top line to <b>30 in</b>, then choose the calculation that gives feet.</p><p>The tape cuts the length into pieces of 12 in. Going to a bigger unit gives a smaller number, so you divide.</p>`,
        set: { mode: 'units', task: 'units-1' } },
      { title: 'Several steps in a row',
        text: String.raw`<p>Some questions take more than one step. Alder and Birch are <b>15 km</b> apart in real life, but this map has no scale. First find what <b>1 cm</b> stands for. Then use it on a second pair of towns.</p><p>The table of equivalent ratios shows each step: divide to scale down to 1 cm, then multiply to scale up. The question menu also has a 1 : 50,000 map, a punch recipe and a paint mix.</p>`,
        set: { mode: 'multi', task: 'multi-1' } }
    ],
    formal: String.raw`
      <p><b>Goal.</b> Use ratios to go between a drawing and the real thing, and between units. Tables, double number lines, tape diagrams and equations all do the same job.</p>
      <h3>What a scale says</h3>
      <p>A <em>scale drawing</em> is a copy of something real in which every length is multiplied by the same number. The <em>scale</em> says how much real length 1 unit of the drawing stands for. It is written in different ways:</p>
      <ul>
        <li>With an equals sign: 1 cm = 5 km, or 1 inch = 8 feet.</li>
        <li>As a ratio with the <em>same unit on both sides</em>: \(1:50\) means 1 cm on the drawing stands for 50 cm in real life. The scale \(1:50{,}000\) means 1 cm stands for 50,000 cm.</li>
      </ul>
      <p>A scale is a ratio, so it is used with multiplying and dividing, never with adding or subtracting. Let \(k\) be the real length that 1 unit of the drawing stands for. Then
      \[ \text{real} = k \times \text{drawing}, \qquad \text{drawing} = \text{real} \div k. \]
      This is a proportional relationship \(y = kx\), with the drawing length as \(x\) and the real length as \(y\). The number \(k\) is its unit rate.</p>
      <h3>From the drawing to the real thing</h3>
      <p>With 1 cm = 5 km, a ruler reading of 7 cm means \(7 \times 5 = 35\) km. In a table of equivalent ratios, the column \(1 : 5\) is scaled up by 7 to the column \(7 : 35\). On a double number line, 7 cm sits directly above 35 km. To check, go back: \(35 \div 5 = 7\).</p>
      <h3>From the real thing to a drawing</h3>
      <p>With 1 in = 2 ft, a 12 ft wall is \(12 \div 2 = 6\) in long on the plan, because 6 pieces of 2 ft fit in 12 ft. To pick a scale, divide each real length by the sheet length it must fit. The sheet is 8 in by 6 in and the room is 12 ft by 9 ft, so \(k\) must be at least
      \[ \max\left(\frac{12}{8}, \frac{9}{6}\right) = 1.5 \text{ ft per inch.} \]
      Of 1, 2 and 4 ft per inch, the smallest that works is 2. A smaller \(k\) makes a bigger drawing, so that is the biggest plan that fits.</p>
      <h3>When the units are different</h3>
      <p>A ratio scale compares the same unit on both sides, so change the real length into that unit first. For \(1:50\) and a 6 m wall, write \(6 \text{ m} = 600 \text{ cm}\) and then \(600 \div 50 = 12\) cm. For \(1:50{,}000\), an 8 cm map length is \(8 \times 50{,}000 = 400{,}000\) cm. Since 100 cm = 1 m and 1,000 m = 1 km, 1 km is 100,000 cm, so \(400{,}000 \div 100{,}000 = 4\) km.</p>
      <h3>A conversion is a scale</h3>
      <p>"1 ft = 12 in" is a scale. Feet and inches are proportional: inches \(= 12 \times\) feet. So 30 in on the top line of a double number line matches \(30 \div 12 = 2.5\) ft on the bottom line. A good rule: a smaller unit gives a bigger number, so multiply (3.5 m is \(3.5 \times 100 = 350\) cm). A bigger unit gives a smaller number, so divide (45 min is \(45 \div 60 = 0.75\) h).</p>
      <h3>Finding the scale, then using it</h3>
      <p>If you know one real length and its drawing length, divide to find the scale: 6 cm on the map is 15 km, so \(k = 15 \div 6 = 2.5\) km per cm. Then use it: 5 cm is \(5 \times 2.5 = 12.5\) km. In a table, divide both numbers of \(6 : 15\) by 6 to reach \(1 : 2.5\), then multiply both by 5 to reach \(5 : 12.5\).</p>
      <h3>Scaling down and up by a table</h3>
      <p>A punch recipe uses 9 cups of juice for 12 glasses. For 8 glasses, divide both numbers by 3 to get \(4 : 3\), then multiply both by 2 to get \(8 : 6\). So 8 glasses need 6 cups. As an equation, cups \(= 0.75 \times\) glasses. Adding does not work: taking 4 glasses away does not mean taking 4 cups away, because every number in the recipe must be multiplied or divided by the same factor.</p>
      <h3>Four models, one idea</h3>
      <p>A <b>table of equivalent ratios</b> scales a ratio up or down. A <b>double number line</b> lines up matching amounts. A <b>tape diagram</b> cuts a length into equal pieces. An <b>equation</b> \(y = kx\) says it in symbols. If one model confuses you, switch to another.</p>
      <p>These scales change lengths. Areas change by the square of the scale factor, which is the topic of the lesson Similarity and scaling.</p>`,
    check: [
      { q: 'On a map, two towns are 4 cm apart. In real life they are 18 km apart. On the same map, two other towns are 10 cm apart. How far apart are those two towns in real life?',
        choices: ['24 km', '45 km', '180 km', 'About 2.2 km'], answer: 1,
        why: String.raw`First find the scale: \(18 \div 4 = 4.5\), so 1 cm stands for 4.5 km. Then \(10 \times 4.5 = 45\) km. The answer 24 km adds the 6 cm of difference to 18, but a scale multiplies. The answer 180 km is \(18 \times 10\), which forgets that 18 km goes with 4 cm, not with 1 cm. The answer about 2.2 km is \(10 \div 4.5\), which divides when it should multiply.`,
        hint: 'First find how many km 1 cm stands for. Then multiply.' },
      { q: 'A bedroom is 4 m long. Maya draws a floor plan with the scale 1 : 50. That means 1 cm on the plan stands for 50 cm in real life. How long is the bedroom on her plan?',
        choices: ['200 cm', '0.08 cm', '8 cm', '20,000 cm'], answer: 2,
        why: String.raw`Both numbers of the scale use cm, so first write 4 m as 400 cm. Then \(400 \div 50 = 8\), so the bedroom is 8 cm long on the plan. The answer 200 cm is \(4 \times 50\): it multiplies, but a plan is smaller than the room. The answer 0.08 cm is \(4 \div 50\): it divides without changing meters to centimeters first. The answer 20,000 cm is \(400 \times 50\): it also multiplies instead of dividing.`,
        hint: 'Change 4 m to cm first. Then ask how many 50 cm pieces fit in it.' }
    ],
    links: { prereq: ['proportional-relationships'], related: ['similarity-and-scaling', 'unit-rates-and-best-buys', 'ratios-and-equivalent-ratios'] },

    mount({ stage, controls: C }) {
      const MODES = [['map', 'Map'], ['design', 'Design'], ['units', 'Units'], ['multi', 'Multi-step']];
      stage.style.minHeight = '520px';
      const P = new Plane(stage, { span: 5 });
      if (P.coordEl) P.coordEl.style.display = 'none';
      const st = { mode: 'map', task: 'map-1' }, sv = {}, last = {};
      const TK = () => TASKS[st.task], S = () => sv[st.task];
      const stg = () => TK().stages[S().si] || null;
      const done = () => S().si >= TK().stages.length;
      let optBtns = [];

      /* ---------- drawing: header ---------- */
      const drawHead = (c, p, g, TKk, Sk) => {
        const R = g.head, fs = g.fs, pal = p.pal;
        const scale = typeof TKk.scale === 'function' ? TKk.scale(Sk) : TKk.scale;
        const sub = typeof TKk.sub === 'function' ? TKk.sub(Sk) : TKk.sub;
        let right = null;
        if (TKk.scene === 'map' && Sk.ruler) {
          const r = Sk.ruler, M = MAPS[TKk.map];
          right = `Ruler: ${rdLen(Math.hypot(r.bx - r.ax, r.by - r.ay))} ${M.u}`;
        } else if (TKk.scene === 'sheet' && Sk.plan && Sk.si >= TKk.stages.findIndex(s => s.k === 'plan')) {
          right = `Plan: ${N(Sk.plan.w)} by ${N(Sk.plan.h)} ${TKk.plan.pu}`;
        }
        const rw = right ? wid(c, right, fs + 1, 700) + 14 : 0;
        tx(c, p, scale, R.x, R.y + fs * .85, { size: fitSz(c, scale, R.w - rw, fs + 2.5, 700), align: 'left', weight: 700, halo: false });
        if (right) tx(c, p, right, R.x + R.w, R.y + fs * .85, { size: fs + 1, align: 'right', color: pal.green, weight: 700, halo: false });
        tx(c, p, sub, R.x, R.y + fs * 2.15, { size: fitSz(c, sub, R.w, fs - .5, 500), align: 'left', color: pal.muted, weight: 500, halo: false });
      };

      /* ---------- drawing: a map with a ruler ---------- */
      const drawMap = (c, p, g, TKk, Sk) => {
        const pal = p.pal, { M, U, x0, y0 } = mapGeo(g, TKk), X = x => x0 + x * U, Y = y => y0 + y * U, fs = g.fs;
        const pts = (list, close) => { c.beginPath(); list.forEach(([x, y], i) => i ? c.lineTo(X(x), Y(y)) : c.moveTo(X(x), Y(y))); if (close) c.closePath(); };
        /* paper */
        c.fillStyle = TKk.map === 'court' ? alpha(pal.yellow, .09) : alpha(pal.blue, .08); c.fillRect(x0, y0, M.W * U, M.H * U);
        c.save(); c.beginPath(); c.rect(x0, y0, M.W * U, M.H * U); c.clip();
        if (TKk.map === 'island') {
          pts([[.5, 1.2], [2.5, .5], [6, .8], [9.5, .6], [11.4, 1.8], [11.6, 5], [10.8, 7.2], [7.5, 7.6], [4, 7.3], [1.2, 6.6], [.3, 4]], true);
          c.fillStyle = alpha(pal.green, .13); c.fill(); c.strokeStyle = alpha(pal.blue, .6); c.lineWidth = 2; c.stroke();
        } else if (TKk.map === 'lakes') {
          c.beginPath(); c.ellipse(X(9.2), Y(5.2), 2.1 * U, 1.3 * U, -.3, 0, Math.PI * 2); c.fillStyle = alpha(pal.blue, .28); c.fill(); c.strokeStyle = alpha(pal.blue, .6); c.lineWidth = 1.5; c.stroke();
          c.beginPath(); c.ellipse(X(9.6), Y(1.7), 1.2 * U, .7 * U, .2, 0, Math.PI * 2); c.fillStyle = alpha(pal.blue, .28); c.fill(); c.stroke();
          c.fillStyle = alpha(pal.green, .1); c.fillRect(x0, y0, M.W * U, M.H * U);
        } else if (TKk.map === 'town') {
          pts([[0, 5.2], [2, 4.6], [4, 5], [6, 4.2], [8, 4.6], [10, 3.9], [12, 4.2]], false); c.strokeStyle = alpha(pal.blue, .45); c.lineWidth = Math.max(5, U * .45); c.lineJoin = 'round'; c.stroke();
          c.fillStyle = alpha(pal.green, .16); c.fillRect(X(4.8), Y(5.4), 2.4 * U, 1.7 * U);
        } else if (TKk.map === 'court') {
          c.strokeStyle = alpha(pal.text, .5); c.lineWidth = 2;
          c.strokeRect(X(1.5), Y(1.5), 9 * U, 5 * U);
          seg(c, X(6), Y(1.5), X(6), Y(6.5), alpha(pal.text, .4), 1.6);
          c.beginPath(); c.arc(X(6), Y(4), 1.2 * U, 0, Math.PI * 2); c.stroke();
          c.strokeRect(X(1.5), Y(3), 2.5 * U, 2 * U); c.strokeRect(X(8), Y(3), 2.5 * U, 2 * U);
        }
        c.restore();
        /* grid */
        c.strokeStyle = pal.grid; c.lineWidth = 1; c.beginPath();
        for (let i = 1; i < M.W; i++) { c.moveTo(X(i), y0); c.lineTo(X(i), y0 + M.H * U); }
        for (let j = 1; j < M.H; j++) { c.moveTo(x0, Y(j)); c.lineTo(x0 + M.W * U, Y(j)); }
        c.stroke(); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.6; c.strokeRect(x0, y0, M.W * U, M.H * U);
        tx(c, p, M.sq, x0 + M.W * U - 6, y0 + M.H * U - 9, { size: fs - 1.5, color: pal.muted, align: 'right', weight: 500 });
        /* places */
        const stage0 = TKk.stages[Sk.si], targets = stage0 && stage0.k === 'ruler' ? [stage0.a, stage0.b] : [];
        for (const [nm, [px, py]] of Object.entries(M.places)) {
          const isT = targets.includes(nm), down = M.lab[nm] === 'down';
          circ(c, X(px), Y(py), clamp(U * .14, 4.5, 6.5), pal.yellow, pal.text, 1.4);
          const al = X(px) < x0 + 40 ? 'left' : X(px) > x0 + M.W * U - 40 ? 'right' : 'center';
          tx(c, p, nm, X(px) + (al === 'left' ? -6 : al === 'right' ? 6 : 0), Y(py) + (down ? 1 : -1) * (clamp(U * .14, 4.5, 6.5) + fs * .85), { size: fs, align: al, weight: isT ? 800 : 600, color: pal.text });
        }
        /* the ruler */
        const r = Sk.ruler;
        if (r) {
          const ax = X(r.ax), ay = Y(r.ay), bx = X(r.bx), by = Y(r.by), len = Math.hypot(r.bx - r.ax, r.by - r.ay);
          const ang = Math.atan2(by - ay, bx - ax), nx = -Math.sin(ang), ny = Math.cos(ang), hw = clamp(U * .3, 8, 13);
          c.beginPath(); c.moveTo(ax + nx * hw, ay + ny * hw); c.lineTo(bx + nx * hw, by + ny * hw); c.lineTo(bx - nx * hw, by - ny * hw); c.lineTo(ax - nx * hw, ay - ny * hw); c.closePath();
          c.fillStyle = alpha(pal.text, .1); c.fill(); c.strokeStyle = alpha(pal.text, .55); c.lineWidth = 1.4; c.stroke();
          if (len > 0) {
            for (let i = 0; i * 1 <= len + 1e-9; i++) {
              const t = i / len, qx = ax + (bx - ax) * t, qy = ay + (by - ay) * t;
              seg(c, qx - nx * hw, qy - ny * hw, qx - nx * hw * .25, qy - ny * hw * .25, pal.text, 1.5);
            }
            const mx = (ax + bx) / 2, my = (ay + by) / 2, sgn = ny > 0 ? -1 : 1, off = hw + fs * .95;
            tx(c, p, `${rdLen(len)} ${M.u}`, mx + sgn * nx * off, my + sgn * ny * off, { size: fs + 1.5, color: pal.green, weight: 800 });
          }
          const active = stage0 && stage0.k === 'ruler';
          const onT = (x, y) => { const nm = placeAt(M, x, y); return nm && targets.includes(nm); };
          const onAny = (x, y) => !!placeAt(M, x, y);
          handle(c, p, ax, ay, active ? (onT(r.ax, r.ay) ? pal.green : pal.brass) : onAny(r.ax, r.ay) ? pal.green : pal.muted);
          handle(c, p, bx, by, active ? (onT(r.bx, r.by) ? pal.green : pal.brass) : onAny(r.bx, r.by) ? pal.green : pal.muted);
        }
      };

      /* ---------- drawing: a sheet of paper with a plan ---------- */
      const drawSheet = (c, p, g, TKk, Sk) => {
        const pal = p.pal, { Sh, U, x0, y0 } = sheetGeo(g, TKk), fs = g.fs, R = g.scene, X = x => x0 + x * U, Y = y => y0 + y * U;
        c.fillStyle = alpha(pal.text, .04); c.fillRect(x0, y0, Sh.W * U, Sh.H * U);
        c.strokeStyle = pal.grid; c.lineWidth = 1; c.beginPath();
        for (let i = 1; i < Sh.W; i++) { c.moveTo(X(i), y0); c.lineTo(X(i), y0 + Sh.H * U); }
        for (let j = 1; j < Sh.H; j++) { c.moveTo(x0, Y(j)); c.lineTo(x0 + Sh.W * U, Y(j)); }
        c.stroke();
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 2; c.strokeRect(x0, y0, Sh.W * U, Sh.H * U);
        tx(c, p, `${N(Sh.W)} ${Sh.u}`, x0 + Sh.W * U / 2, y0 - 11, { size: fs, color: pal.muted });
        c.save(); c.translate(x0 - 12, y0 + Sh.H * U / 2); c.rotate(-Math.PI / 2); tx(c, p, `${N(Sh.H)} ${Sh.u}`, 0, 0, { size: fs, color: pal.muted }); c.restore();
        const planAt = TKk.stages.findIndex(s => s.k === 'plan'), s0 = TKk.stages[Sk.si];
        /* the dashed outline of the room at the scale being tried */
        if (s0 && s0.k === 'scale' && Sk.sc >= 0) {
          const sc = TKk.scales[Sk.sc], gw = TKk.room.w / sc.k, gh = TKk.room.h / sc.k, fits = gw <= Sh.W && gh <= Sh.H;
          c.save(); c.beginPath(); c.rect(R.x, R.y, R.w, R.h); c.clip();
          c.fillStyle = alpha(pal.blue, .1); c.fillRect(x0, y0, gw * U, gh * U);
          c.fillStyle = alpha(pal.red, .22);
          if (gw > Sh.W) c.fillRect(X(Sh.W), y0, (gw - Sh.W) * U, gh * U);
          if (gh > Sh.H) c.fillRect(x0, Y(Sh.H), Math.min(gw, Sh.W) * U, (gh - Sh.H) * U);
          c.setLineDash([7, 5]); c.lineWidth = 2.4; c.strokeStyle = fits ? pal.blue : pal.red; c.strokeRect(x0, y0, gw * U, gh * U); c.setLineDash([]);
          c.restore();
          tx(c, p, fits ? 'Fits on the sheet' : 'Too big for the sheet', R.x + R.w - 4, R.y + 9, { size: fs, align: 'right', color: fits ? pal.green : pal.red, weight: 700 });
        }
        if (Sk.plan && Sk.si >= planAt) {
          const w = Sk.plan.w, hh = Sk.plan.h, fin = done(), col = fin ? pal.green : pal.blue;
          c.fillStyle = alpha(pal.yellow, .26); c.fillRect(x0, y0, w * U, hh * U);
          c.strokeStyle = col; c.lineWidth = 3.2; c.strokeRect(x0, y0, w * U, hh * U);
          tx(c, p, `${N(w)} ${TKk.plan.pu}`, x0 + w * U / 2, y0 + hh * U + fs * .9 + 3, { size: fs, color: pal.green, weight: 700 });
          tx(c, p, `${N(hh)} ${TKk.plan.pu}`, x0 + w * U + 8, y0 + hh * U / 2, { size: fs, color: pal.green, weight: 700, align: 'left' });
          handle(c, p, x0 + w * U, y0 + hh * U, fin ? pal.green : pal.brass);
        }
      };

      /* ---------- drawing: a tape cut into units ---------- */
      const drawChunks = (c, p, g, TKk, Sk) => {
        const pal = p.pal, Tp = TKk.tape, R = g.scene, fs = g.fs, fin = done(), D = TKk.dnl;
        const gs = Tp.given === 'small', total = gs ? Sk.m : Sk.m * Tp.per;
        const padX = 18, x0 = R.x + padX, px = (R.w - 2 * padX) / Tp.maxSmall, barH = clamp(R.h * .26, 28, 54), yb = R.y + R.h * .46;
        const n = Math.ceil(total / Tp.per - 1e-9), ansV = gs ? Sk.m / Tp.per : Sk.m * Tp.per;
        for (let i = 0; i < n; i++) {
          const len = Math.min(Tp.per, total - i * Tp.per), xw = len * px, x = x0 + i * Tp.per * px, full = same(len, Tp.per);
          rr(c, x + 1, yb, xw - 2, barH, 5); c.fillStyle = alpha(pal.blue, i % 2 ? .32 : .2); c.fill(); c.strokeStyle = pal.blue; c.lineWidth = 1.5; c.stroke();
          const inS = gs ? `${N(len)} ${Tp.small}` : `${N(len / Tp.per)} ${Tp.big}`;
          const lowS = gs ? (full ? `1 ${Tp.big}` : fin ? `${N(len / Tp.per)} ${Tp.big}` : '?') : (full ? `${N(Tp.per)} ${Tp.small}` : fin ? `${N(len)} ${Tp.small}` : '?');
          if (wid(c, inS, fs, 700) < xw - 6) tx(c, p, inS, x + xw / 2, yb + barH / 2, { size: fs, color: pal.green, weight: 700, halo: false });
          if (wid(c, lowS, fs, 700) < xw - 4) tx(c, p, lowS, x + xw / 2, yb + barH + fs * .95, { size: fs, color: pal.red, weight: 700 });
        }
        /* the amount you start with, over the tape */
        if (total > 0) {
          const xa = x0 + 1, xb = x0 + total * px - 1, ty = yb - 9;
          c.save(); c.strokeStyle = pal.green; c.lineWidth = 2; c.beginPath(); c.moveTo(xa, ty + 5); c.lineTo(xa, ty); c.lineTo(xb, ty); c.lineTo(xb, ty + 5); c.stroke(); c.restore();
          tx(c, p, `${N(Sk.m)} ${D.top.u}`, (xa + xb) / 2, ty - fs * .8, { size: fs + 1, color: pal.green, weight: 800 });
          /* the answer, under the tape */
          const yy = yb + barH + fs * 2.3;
          c.save(); c.strokeStyle = pal.red; c.lineWidth = 2; c.beginPath(); c.moveTo(xa, yy - 5); c.lineTo(xa, yy); c.lineTo(xb, yy); c.lineTo(xb, yy - 5); c.stroke(); c.restore();
          tx(c, p, fin ? `= ${N(ansV)} ${D.bot.u}` : `= ? ${D.bot.u}`, (xa + xb) / 2, yy + fs * .95, { size: fs + 1, color: pal.red, weight: 800 });
        }
      };

      /* ---------- drawing: a tape of blocks, one block for each glass, cup or liter ---------- */
      const drawBlocks = (c, p, g, TKk, Sk) => {
        const pal = p.pal, Tp = TKk.tape, R = g.scene, fs = g.fs, rows = Tp.rows(Sk);
        const labW = clamp(R.w * .24, 76, 120), x0 = R.x + labW + 6, avail = R.x + R.w - x0 - 44, bw = Math.min(44, avail / Tp.max);
        const bh = clamp(bw * 1.1, 20, 44), gap = clamp(R.h * .14, 16, 34), tot = rows.length * bh + (rows.length - 1) * gap, y0 = R.y + (R.h - tot) / 2 - 8;
        rows.forEach((r, ri) => {
          const y = y0 + ri * (bh + gap), col = pal[r.col];
          tx(c, p, r.name, x0 - 9, y + bh / 2, { size: fitSz(c, r.name, labW - 4, fs, 700), align: 'right', color: col, weight: 700, halo: false });
          if (r.n == null) {
            c.save(); c.setLineDash([5, 4]); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.6; rr(c, x0, y, r.per * bw - 2, bh, 4); c.stroke(); c.restore();
            tx(c, p, '?', x0 + r.per * bw / 2 - 1, y + bh / 2, { size: fs + 2, color: pal.muted, weight: 700, halo: false });
            return;
          }
          for (let i = 0; i < r.n; i++) {
            const grp = Math.floor(i / r.per);
            rr(c, x0 + i * bw, y, bw - 1.8, bh, 3); c.fillStyle = alpha(col, grp % 2 ? .5 : .85); c.fill();
          }
          for (let b = 1; b * r.per < r.n; b++) seg(c, x0 + b * r.per * bw - .9, y - 1, x0 + b * r.per * bw - .9, y + bh + 1, pal.stage, 3.4);
          tx(c, p, String(r.n), x0 + r.n * bw + 8, y + bh / 2, { size: fs + 1, color: col, align: 'left', weight: 800, halo: false });
        });
        tx(c, p, Tp.note(Sk), x0, y0 + tot + 22, { size: fs, color: pal.muted, align: 'left', weight: 500, halo: false });
      };

      /* ---------- drawing: the double number line ---------- */
      const drawDNL = (c, p, g, TKk, Sk) => {
        const pal = p.pal, D = TKk.dnl, R = g.dnl, fs = g.fs, k = D.k, si = Sk.si, nSt = TKk.stages.length, fin = si >= nSt;
        const { xL, xR, yT, yB } = dnlGeo(g, TKk), X = t => xL + clamp(t / D.max, 0, 1) * (xR - xL);
        if (D.from && si < D.from) {
          c.save(); c.setLineDash([5, 5]); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; rr(c, R.x, R.y + 6, R.w, R.h - 12, 8); c.stroke(); c.restore();
          const msg = 'Choose a scale to see the double number line';
          tx(c, p, msg, R.x + R.w / 2, R.y + R.h / 2, { size: fitSz(c, msg, R.w - 24, fs, 600), color: pal.muted, halo: false });
          return;
        }
        const gv = D.given || 'top', blindKey = gv === 'top' ? 'bot' : 'top', blind = si < (D.until != null ? D.until : nSt);
        const rows = [{ key: 'top', y: yT, col: pal.green, v: t => t, u: D.top.u, name: D.top.name }, { key: 'bot', y: yB, col: pal.red, v: t => t * k, u: D.bot.u, name: D.bot.name }];
        const pins = (D.pins || []).filter(pn => si >= (pn.from || 0));
        const nT = Math.round(D.max / D.step), sp = (xR - xL) / nT;
        let wmax = 0;
        for (const r of rows) if (!(blind && r.key === blindKey)) for (let i = 0; i <= nT; i++) wmax = Math.max(wmax, wid(c, N(r.v(i * D.step)), fs - 1, 600));
        const skip = Math.max(1, Math.ceil((wmax + 10) / sp));
        const hasM = Sk.m != null, mT = hasM ? (gv === 'top' ? Sk.m : Sk.m / k) : 0, xm = X(mT);
        const xgh = Sk.ghost ? X(Sk.ghost.row === 'bot' ? Sk.ghost.v / k : Sk.ghost.v) : null;
        for (const r of rows) {
          const hideAll = blind && r.key === blindKey;
          seg(c, xL - 8, r.y, xR + 8, r.y, alpha(r.col, .45), 3);
          if (hasM && !hideAll) seg(c, xL, r.y, xm, r.y, r.col, 5);
          for (let i = 0; i <= nT; i++) {
            if (hideAll && i > 0) continue;
            const big = i % skip === 0, tt = i * D.step, isPin = pins.some(pn => same(pn.t, tt)), nearPin = i > 0 && pins.some(pn => !same(pn.t, tt) && Math.abs(X(pn.t) - X(tt)) < wmax * .9 + 4);
            seg(c, X(tt), r.y - 6, X(tt), r.y + 6, r.col, big ? 2.2 : 1.3);
            if (big && !isPin && !nearPin && !(hasM && r.key === gv && same(tt, mT)) && !(xgh != null && Math.abs(X(tt) - xgh) < 34)) tx(c, p, N(r.v(tt)), X(tt), r.y + (r.key === 'top' ? -15 : 15), { size: fs - 1, color: pal.text, weight: 500, halo: false });
          }
          if (hideAll) seg(c, xR, r.y - 6, xR, r.y + 6, r.col, 1.3);
          tx(c, p, r.name, xL - 8, r.key === 'top' ? R.y + 8 : R.y + R.h - 8, { size: fs - .5, color: r.col, align: 'left', weight: 700, halo: false });
        }
        /* the scale, marked with violet diamonds */
        for (const pn of pins) for (const r of rows) {
          dia(c, X(pn.t), r.y, 8, pal.violet, pal.stage, 1.5);
          tx(c, p, N(r.v(pn.t)), X(pn.t), r.y + (r.key === 'top' ? -15 : 15), { size: fs - .5, color: pal.violet, weight: 800, halo: true });
        }
        /* the marker, and what sits under (or over) it */
        const stage0 = TKk.stages[si], dragging = stage0 && stage0.k === 'place';
        if (hasM) {
          const aKey = blindKey, aRow = rows.find(r => r.key === aKey), gRow = rows.find(r => r.key === gv), aV = gv === 'top' ? Sk.m * k : Sk.m / k;
          seg(c, xm, yT, xm, yB, alpha(pal.text, .5), 1.6, [4, 5]);
          circ(c, xm, aRow.y, 7.5, pal.yellow, pal.text, 1.6);
          handle(c, p, xm, gRow.y, dragging ? pal.brass : fin ? pal.green : pal.muted, 11);
          const known = !blind || pins.some(pn => same(pn.t, mT));
          const gy = gv === 'top' ? gRow.y + 16 : gRow.y - 16, ay = gv === 'top' ? aRow.y - 16 : aRow.y + 16;
          const al = xm < xL + 24 ? 'left' : xm > xR - 24 ? 'right' : 'center';
          tx(c, p, `${N(Sk.m)} ${gRow.u}`, xm, gy, { size: fs + .5, color: gRow.col, weight: 800, align: al });
          tx(c, p, known ? `${N(aV)} ${aRow.u}` : '?', xm, ay, { size: fs + .5, color: aRow.col, weight: 800, align: al });
        }
        /* where the chosen answer lands */
        if (Sk.ghost) {
          const gh = Sk.ghost, tg = gh.row === 'bot' ? gh.v / k : gh.v, out = tg > D.max + 1e-9 || tg < 0, xg = X(tg), col = pal.red;
          const rG = rows.find(r => r.key === gh.row), rO = rows.find(r => r.key !== gh.row), oV = gh.row === 'bot' ? tg : tg * k;
          seg(c, xg, yT, xg, yB, alpha(col, .85), 2, [5, 4]);
          dia(c, xg, rG.y, 9, col, pal.stage, 1.5);
          circ(c, xg, rO.y, 5, pal.stage, col, 2.2);
          tx(c, p, gh.label + (out ? '  »' : ''), clamp(xg, xL + 20, xR - 10), rG.y + (rG.key === 'top' ? -15 : 15), { size: fs, color: col, weight: 800, align: xg > xR - 50 ? 'right' : 'center' });
          tx(c, p, `${N(oV)} ${rO.u}`, clamp(xg, xL + 20, xR - 10), rO.y + (rO.key === 'top' ? -15 : 15), { size: fs - .5, color: col, weight: 700, align: xg > xR - 50 ? 'right' : 'center' });
        }
      };

      /* ---------- drawing: the table of equivalent ratios ---------- */
      const drawTable = (c, p, g, TKk, Sk) => {
        const pal = p.pal, Tb = TKk.table, R = g.tbl, fs = g.fs, rowH = g.rowH, si = Sk.si, fin = si >= TKk.stages.length;
        const nTot = Tb.cols.length, labW = clamp(R.w * .21, 72, 112), cw = clamp((R.w - labW) / Math.max(nTot, 3), 54, 128);
        const tx0 = R.x + Math.max(0, (R.w - labW - cw * nTot) / 2), hh = fs * 1.7, colX = i => tx0 + labW + (i + .5) * cw;
        const vis = Tb.cols.map(col => si >= (col.from || 0)), lastVis = vis.lastIndexOf(true);
        /* rows */
        Tb.rows.forEach((row, r) => {
          const y = R.y + hh + r * rowH;
          seg(c, tx0, y, tx0 + labW + cw * nTot, y, pal.grid, 1);
          tx(c, p, row.n, tx0 + labW - 8, y + rowH / 2, { size: fitSz(c, row.n, labW - 14, fs, 700), align: 'right', color: pal[row.c], weight: 700, halo: false });
        });
        seg(c, tx0, R.y + hh + Tb.rows.length * rowH, tx0 + labW + cw * nTot, R.y + hh + Tb.rows.length * rowH, pal.grid, 1);
        seg(c, tx0 + labW, R.y + hh - 2, tx0 + labW, R.y + hh + Tb.rows.length * rowH, pal['grid-strong'], 1.5);
        Tb.cols.forEach((col, i) => {
          if (!vis[i]) return;
          if (fin && i === lastVis) { c.fillStyle = alpha(pal.green, .13); rr(c, colX(i) - cw / 2 + 2, R.y + hh + 2, cw - 4, Tb.rows.length * rowH - 4, 6); c.fill(); }
          Tb.rows.forEach((row, r) => {
            const q = col.q ? col.q[r] : -1, unknown = q >= 0 && si <= q, cy = R.y + hh + (r + .5) * rowH;
            if (unknown) {
              if (q === si) { c.fillStyle = alpha(pal.yellow, .26); rr(c, colX(i) - cw * .36, cy - rowH * .38, cw * .72, rowH * .76, 6); c.fill(); }
              c.save(); c.setLineDash([4, 3]); c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.3; rr(c, colX(i) - cw * .36, cy - rowH * .38, cw * .72, rowH * .76, 6); c.stroke(); c.restore();
              tx(c, p, '?', colX(i), cy, { size: fs + 1, color: pal.muted, weight: 800, halo: false });
            } else tx(c, p, N(col.v[r]), colX(i), cy, { size: fs + .5, color: pal[row.c], weight: 700, halo: false });
          });
          /* the header: the scale, or the multiplier from the column before */
          if (i === 0) tx(c, p, Tb.head0 || 'scale', colX(0), R.y + hh * .5, { size: fs - 1.5, color: pal.muted, weight: 600, halo: false });
          else if (col.op) {
            const qs = (col.q || []).filter(x => x >= 0), at = col.opAt != null ? col.opAt : (qs.length ? Math.min(...qs) : -1), known = si > at;
            const xa = colX(i - 1) + cw * .22, xb = colX(i) - cw * .22, ay = R.y + hh * .86;
            seg(c, xa, ay, xb, ay, pal.green, 1.8);
            c.beginPath(); c.moveTo(xb + 1, ay); c.lineTo(xb - 6, ay - 4); c.lineTo(xb - 6, ay + 4); c.closePath(); c.fillStyle = pal.green; c.fill();
            tx(c, p, known ? col.op : '× ?', (xa + xb) / 2, R.y + hh * .38, { size: fs, color: pal.green, weight: 800, halo: false });
          }
        });
      };

      P.onDraw = (c, p) => {
        const TKk = TK(), Sk = S(), g = geo(p, TKk);
        drawHead(c, p, g, TKk, Sk);
        ({ map: drawMap, sheet: drawSheet, chunks: drawChunks, blocks: drawBlocks })[TKk.scene](c, p, g, TKk, Sk);
        drawDNL(c, p, g, TKk, Sk);
        drawTable(c, p, g, TKk, Sk);
      };

      /* ---------- the panel ---------- */
      const probe = C.readout(), host = probe.parentElement; probe.remove();
      const group = build => {
        const before = new Set(host.children); build();
        const g = h('div', { style: 'display:flex;flex-direction:column;gap:16px;flex:none' });
        [...host.children].filter(e => !before.has(e)).forEach(e => g.append(e));
        host.append(g); return g;
      };
      const small = b => Object.assign(b.style, { padding: '6px 12px', minHeight: '36px', fontSize: '.88rem' });
      let modeBtns, qSel, ro, optsTitle, optsBox, wS, hS, wIn, hIn, checkBtn, mS, mIn, nextB, againB, hintEl, gOpts, gPlan, gMark;

      C.title('Explore');
      modeBtns = C.buttons(MODES.map(([id, label]) => ({ label, onClick: () => { if (st.mode !== id) start(last[id] || ORDERS[id][0]); } })));
      modeBtns.forEach(small);
      qSel = C.select({ label: 'Question', value: '', options: [{ value: '', label: '' }], onChange: v => start(v) });
      ro = C.readout();
      gOpts = group(() => {
        optsTitle = h('p', { class: 'ctl-title' }, 'Choose'); host.append(optsTitle);
        optsBox = h('div', { class: 'ctl buttons' }); host.append(optsBox);
      });
      gPlan = group(() => {
        C.title('Set the plan');
        wS = C.slider({ label: 'Plan length (across)', min: 0, max: 1, step: 1, value: 0, format: v => '', onInput: v => setPlan(v, null) }); wIn = host.lastElementChild.querySelector('input');
        hS = C.slider({ label: 'Plan width (down)', min: 0, max: 1, step: 1, value: 0, format: v => '', onInput: v => setPlan(null, v) }); hIn = host.lastElementChild.querySelector('input');
        [checkBtn] = C.buttons([{ label: 'Check my plan', primary: true, onClick: () => checkPlan() }]);
        small(checkBtn);
        for (const inp of [wIn, hIn]) inp.addEventListener('change', () => checkPlan());
      });
      gMark = group(() => {
        mS = C.slider({ label: 'Marker', min: 0, max: 1, step: 1, value: 0, format: v => '', onInput: v => setMarker(v) }); mIn = host.lastElementChild.querySelector('input');
      });
      const gNav = group(() => {
        [nextB, againB] = C.buttons([{ label: 'Next question', onClick: () => nextQ() }, { label: 'Start over', onClick: () => start(st.task) }]);
        small(nextB); small(againB);
        hintEl = h('p', { class: 'hint' }); host.append(hintEl);
      });
      const reveal = () => { try { ro.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' }); } catch (e) {} };
      const mark = (b, good) => {
        b.style.borderColor = good ? 'var(--green)' : 'var(--red)';
        b.style.background = `color-mix(in srgb, var(--${good ? 'green' : 'red'}) ${good ? 16 : 12}%, transparent)`;
        if (!good) b.disabled = true;
      };
      const setSlider = (inp, min, max, step, v) => {
        inp.min = min; inp.max = max; inp.step = step; inp.value = v; inp.style.setProperty('--p', ((v - min) / (max - min) * 100) + '%');
      };

      /* ---------- the readout ---------- */
      const endName = (M, x, y) => placeAt(M, x, y);
      const html = () => {
        const TKk = TK(), Sk = S(), s0 = stg(), ids = ORDERS[TKk.mode], out = [];
        out.push(`${kk(`Question ${ids.indexOf(TKk.id) + 1} of ${ids.length}`)}<br><b>${TKk.q}</b>`);
        if (s0) {
          out.push(`<b>Step ${Sk.si + 1} of ${TKk.stages.length}.</b> ${s0.ask}`);
          if (s0.k === 'ruler') {
            const M = MAPS[TKk.map], r = Sk.ruler, a = endName(M, r.ax, r.ay), b = endName(M, r.bx, r.by), len = Math.hypot(r.bx - r.ax, r.by - r.ay);
            const e = (nm, i) => nm ? `End ${i} is on ${nm}.` : `End ${i} is not on a place.`;
            out.push(`${kk('Ruler')} reads ${rdLen(len)} ${M.u}. ${e(a, 1)} ${e(b, 2)}`);
            if (a && b && !((a === s0.a && b === s0.b) || (a === s0.b && b === s0.a))) out.push(`${no('Not those two places.')} The ruler goes from ${a} to ${b}. This step needs ${s0.a} and ${s0.b}.`);
          } else if (s0.k === 'place') {
            out.push(`${kk('Marker')} ${N(Sk.m)} ${TKk.dnl.top.u}. ${Sk.m === s0.val ? '' : `Move it to ${N(s0.val)} ${TKk.dnl.top.u}.`}`);
          } else if (s0.k === 'plan') {
            out.push(`${kk('Your plan')} ${N(Sk.plan.w)} ${TKk.plan.pu} across and ${N(Sk.plan.h)} ${TKk.plan.pu} down.`);
          }
        }
        if (Sk.fb) out.push(Sk.fb);
        if (done()) out.push(`<b>Done.</b> ${TKk.done} Press <b>Next question</b>.`);
        return out.join('<br>');
      };

      /* ---------- actions ---------- */
      const advance = () => { const v = S(); v.si++; v.ghost = null; sync(); reveal(); };
      const choose = i => {
        const s0 = stg(), o = s0.opts[i], v = S(), b = optBtns[i];
        if (s0.k === 'scale') v.sc = i;
        v.ghost = o.land ? { ...o.land, ok: !!o.ok } : null;
        if (o.ok) { v.fb = ok('Right. ') + o.say; advance(); }
        else { v.fb = no('Not quite. ') + o.say; mark(b, false); upd(); reveal(); }
      };
      const setMarker = val => {
        const s0 = stg(), v = S();
        if (!s0 || s0.k !== 'place') return;
        v.m = clamp(val, 0, TK().dnl.max);
        if (same(v.m, s0.val)) {
          v.fb = ok('Marker placed. ') + `The marker is at ${N(s0.val)} ${TK().dnl.top.u}. The line below has a number that matches it. You will work it out, not read it.`;
          advance();
        } else { v.fb = ''; upd(); }
      };
      const setPlan = (w, hh) => {
        const s0 = stg(), v = S();
        if (!s0 || s0.k !== 'plan') return;
        const Sh = TK().sheet, sn = Sh.snap;
        if (w != null) v.plan.w = clamp(snap(w, sn), sn, Sh.W);
        if (hh != null) v.plan.h = clamp(snap(hh, sn), sn, Sh.H);
        v.fb = ''; upd();
      };
      const checkPlan = () => {
        const s0 = stg(), v = S(), TKk = TK(), P0 = TKk.plan;
        if (!s0 || s0.k !== 'plan') return;
        const okW = same(v.plan.w, P0.w), okH = same(v.plan.h, P0.h);
        const one = (val, tgt, real, word, adj) => same(val, tgt)
          ? `${ok(`${word} is right.`)} ${P0.back(val)}, the ${word.toLowerCase()} of the room.`
          : `${no(`${word} is off.`)} ${N(val)} ${P0.pu} on the plan stands for ${P0.back(val)}, but the room is ${real} ${adj}. Make that side of the plan ${val > tgt ? 'shorter' : 'longer'}.`;
        if (okW && okH) {
          v.fb = ok('Your plan is right. ') + `${N(P0.w)} ${P0.pu} by ${N(P0.h)} ${P0.pu} stands for ${P0.realW} by ${P0.realH}, and it fits on the sheet.`;
          advance();
        } else {
          v.fb = one(v.plan.w, P0.w, P0.realW, 'Length', 'long') + '<br>' + one(v.plan.h, P0.h, P0.realH, 'Width', 'wide'); upd(); reveal();
        }
      };
      const nextQ = () => { const ids = ORDERS[st.mode], k = ids.indexOf(st.task); start(ids[(k + 1) % ids.length]); };

      /* ---------- building the panel for the current stage ---------- */
      const buildPanel = () => {
        const TKk = TK(), s0 = stg(), v = S();
        modeBtns.forEach((b, i) => { const on = MODES[i][0] === st.mode; b.className = on ? 'btn primary' : 'btn'; b.setAttribute('aria-pressed', on); });
        qSel.replaceChildren(...ORDERS[st.mode].map((id, i) => h('option', { value: id }, `${i + 1}. ${TASKS[id].menu}`)));
        qSel.value = st.task;
        const choosing = s0 && (s0.k === 'choose' || s0.k === 'scale');
        gOpts.style.display = choosing ? 'flex' : 'none';
        optsBox.replaceChildren(); optBtns = [];
        if (choosing) {
          optsTitle.textContent = s0.k === 'scale' ? 'Choose a scale' : 'Choose the calculation';
          s0.opts.forEach((o, i) => { const b = h('button', { type: 'button', class: 'btn primary', onclick: () => choose(i) }, o.t); small(b); optsBox.append(b); optBtns.push(b); });
        }
        gPlan.style.display = s0 && s0.k === 'plan' ? 'flex' : 'none';
        if (s0 && s0.k === 'plan') {
          const Sh = TKk.sheet;
          setSlider(wIn, Sh.snap, Sh.W, Sh.snap, v.plan.w); setSlider(hIn, Sh.snap, Sh.H, Sh.snap, v.plan.h);
        }
        gMark.style.display = s0 && s0.k === 'place' ? 'flex' : 'none';
        if (s0 && s0.k === 'place') setSlider(mIn, 0, TKk.dnl.max, TKk.dnl.snap, v.m);
        nextB.className = done() ? 'btn primary' : 'btn';
        hintEl.textContent = !s0 ? 'Press Next question for another one, or Start over to try this one again.'
          : s0.k === 'ruler' ? 'Drag a ring at an end of the ruler. The ends snap to the grid. The ruler can slant.'
          : s0.k === 'place' ? 'Drag the ring on the top line, or use the Marker slider. It snaps to the ticks.'
          : s0.k === 'plan' ? 'Drag the ring at the corner of the plan, or use the sliders. The plan always starts at the top left of the sheet.'
          : s0.k === 'scale' ? 'Every scale is explained. The dashed outline shows the room at the scale you pick.'
          : 'A wrong choice shows where its answer lands on the double number line.';
      };
      const upd = () => {
        const s0 = stg(), v = S(), TKk = TK();
        if (s0 && s0.k === 'place') { mIn.value = v.m; mIn.style.setProperty('--p', (v.m / TKk.dnl.max * 100) + '%'); }
        if (s0 && s0.k === 'plan') {
          wIn.value = v.plan.w; hIn.value = v.plan.h;
          wIn.style.setProperty('--p', ((v.plan.w - TKk.sheet.snap) / (TKk.sheet.W - TKk.sheet.snap) * 100) + '%');
          hIn.style.setProperty('--p', ((v.plan.h - TKk.sheet.snap) / (TKk.sheet.H - TKk.sheet.snap) * 100) + '%');
        }
        P.draw(); ro.innerHTML = html();
        /* slider read-outs */
        const lab = (el, s) => { const o = el.closest('.ctl').querySelector('output'); if (o) o.textContent = s; };
        if (s0 && s0.k === 'place') lab(mIn, `${N(v.m)} ${TKk.dnl.top.u}`);
        if (s0 && s0.k === 'plan') { lab(wIn, `${N(v.plan.w)} ${TKk.plan.pu}`); lab(hIn, `${N(v.plan.h)} ${TKk.plan.pu}`); }
      };
      const sync = () => { buildPanel(); upd(); };

      const start = id => {
        const t = TASKS[id]; st.task = id; st.mode = t.mode; last[t.mode] = id;
        sv[id] = { si: 0, fb: '', ghost: null, sc: -1, m: t.dnl.m0 != null ? t.dnl.m0 : null,
          ruler: t.ruler ? { ax: t.ruler[0], ay: t.ruler[1], bx: t.ruler[2], by: t.ruler[3] } : null,
          plan: t.plan ? { w: t.plan.w0, h: t.plan.h0 } : null };
        sync();
      };

      /* ---------- the pointer ---------- */
      draggable(P, {
        hit: (px, py) => {
          const TKk = TK(), s0 = stg(), v = S(); if (!s0) return null;
          const g = geo(P, TKk);
          if (s0.k === 'ruler') {
            const { U, x0, y0 } = mapGeo(g, TKk), r = v.ruler;
            const da = Math.hypot(x0 + r.ax * U - px, y0 + r.ay * U - py), db = Math.hypot(x0 + r.bx * U - px, y0 + r.by * U - py);
            if (Math.min(da, db) > 30) return null;
            return da <= db ? 'a' : 'b';
          }
          if (s0.k === 'plan') {
            const { U, x0, y0 } = sheetGeo(g, TKk);
            return Math.hypot(x0 + v.plan.w * U - px, y0 + v.plan.h * U - py) < 30 ? 'c' : null;
          }
          if (s0.k === 'place') {
            const { xL, xR, yT, yB } = dnlGeo(g, TKk), gy = TKk.dnl.given === 'bot' ? yB : yT;
            return Math.abs(py - gy) < 30 && px > xL - 24 && px < xR + 24 ? 'm' : null;
          }
          return null;
        },
        move: (hd, mx, my) => {
          const TKk = TK(), v = S(), px = P.X(mx), py = P.Y(my), g = geo(P, TKk);
          if (hd === 'a' || hd === 'b') {
            const { M, U, x0, y0 } = mapGeo(g, TKk);
            const ux = clamp(snap((px - x0) / U, .5), 0, M.W), uy = clamp(snap((py - y0) / U, .5), 0, M.H), r = v.ruler;
            if (hd === 'a') { r.ax = ux; r.ay = uy; } else { r.bx = ux; r.by = uy; }
            const s0 = stg(), a = placeAt(M, r.ax, r.ay), b = placeAt(M, r.bx, r.by);
            if (s0 && s0.k === 'ruler' && a && b && ((a === s0.a && b === s0.b) || (a === s0.b && b === s0.a))) {
              v.m = clean(Math.hypot(r.bx - r.ax, r.by - r.ay));
              v.fb = ok('Measured. ') + `The ruler goes from ${s0.a} to ${s0.b} and reads ${N(v.m)} ${M.u}. This length now sits on the top line of the double number line.`;
              advance();
            } else { v.fb = ''; upd(); }
          } else if (hd === 'c') {
            const { U, x0, y0 } = sheetGeo(g, TKk); v.dragged = true;
            setPlan((px - x0) / U, (py - y0) / U);
          } else if (hd === 'm') {
            const D = TKk.dnl, { xL, xR } = dnlGeo(g, TKk);
            setMarker(clamp(snap((px - xL) / (xR - xL) * D.max, D.snap), 0, D.max));
          }
        }
      });
      /* a dragged plan is checked when the pointer is let go */
      P.canvas.addEventListener('pointerup', () => { const s0 = stg(); if (s0 && s0.k === 'plan' && S().dragged) { S().dragged = false; checkPlan(); } });

      /* ---------- guided steps ---------- */
      const apply = patch => {
        if (patch.task) start(patch.task);
        else if (patch.mode) start(last[patch.mode] || ORDERS[patch.mode][0]);
      };
      start('map-1');
      return { destroy: () => { P.destroy(); }, apply };
    }
  });
}
