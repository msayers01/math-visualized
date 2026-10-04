/* =====================================================================
   PRACTICE (engine): skills, the difficulty ladder, points, repeat avoidance, and the attempt record.
   v1 ladder: 3 correct in a row (no hints) -> up a level; 2 wrong in a row -> down. A correct answer with hints keeps the
   streak where it is. "Show solution" scores nothing and queues a similar problem at the same level.
   State is plain JSON, one record per skill, so v2 (ratings, placement, mixed review) can add fields without a migration:
   `rating` and `placed` are reserved for it.
   An attempt is { s skill, g generator, v version, lvl, seed, a answer typed, ok, h hints, mc misconception, t ms, p points, gu gave up, at }.
   With the instance record { g, v, lvl, seed } any attempt can be regenerated and re-graded (Practice.regrade). This build is a static
   site with no server, so that check runs in the browser; the record is what a server would re-check.
   ===================================================================== */
{
  const { rat } = Practice;
  const byId = Practice.generators;

  /* Course -> unit -> skill. `course` is an id from COURSES (curriculum.js). */
  Practice.SKILLS = [
    { id: 'multiply-multi-digit', course: 'grade4', unit: 'Whole-number operations', title: 'Multiply multi-digit numbers', gen: ['g4-multiply'],
      blurb: 'Use an area model to multiply: two digits by one digit, up to three digits by two.', lessons: ['multiplying-with-area-models'], standards: ['4.3.5.7'] },
    { id: 'divide-multi-digit', course: 'grade4', unit: 'Whole-number operations', title: 'Divide by a one-digit number', gen: ['g4-divide'],
      blurb: 'Break the dividend into pieces the divisor goes into, up to four-digit dividends.', lessons: ['multiplying-with-area-models'], standards: ['4.3.5.8'] },
    { id: 'perimeter-area-rectangles', course: 'grade4', unit: 'Measurement', title: 'Perimeter and area of rectangles', gen: ['g4-rectangle'],
      blurb: 'Find the area or perimeter, or a missing side.', lessons: ['area-by-decomposition'], standards: ['4.2.3.4', '4.2.3.6'] },
    { id: 'add-subtract-unlike-fractions', course: 'grade5', unit: 'Fractions and decimals', title: 'Add and subtract fractions with unlike denominators', gen: ['g5-fraction-sum'],
      blurb: 'Rename with a common denominator, then add or subtract.', lessons: ['adding-fractions-with-unlike-denominators', 'equivalent-fractions-on-a-number-line'], standards: ['5.3.5.11'] },
    { id: 'add-subtract-decimals', course: 'grade5', unit: 'Fractions and decimals', title: 'Add and subtract decimals', gen: ['g5-decimals'],
      blurb: 'Line up the places, from tenths to thousandths.', lessons: ['decimals-and-place-value'], standards: ['5.3.5.13'] },
    { id: 'order-of-operations', course: 'grade5', unit: 'Expressions', title: 'Order of operations', gen: ['g5-order-of-operations'],
      blurb: 'Brackets, then multiply and divide, then add and subtract.', lessons: [], standards: ['5.3.6.2'] },
    { id: 'percent-of-a-number', course: 'grade6', unit: 'Number sense', title: 'Percent of a number', gen: ['g6-percent'],
      blurb: 'Find a percent of a number, find the percent, or find the whole.', lessons: ['percents-on-tape-and-number-lines'], standards: ['6.3.5.11'] },
    { id: 'mean-of-a-data-set', course: 'grade6', unit: 'Data', title: 'The mean of a data set', gen: ['g6-mean'],
      blurb: 'Add and share equally, or find a missing value from the mean.', lessons: ['mean-median-and-spread'], standards: ['6.1.1.3'] },
    { id: 'add-subtract-integers', course: 'grade7', unit: 'Number sense', title: 'Add and subtract integers', gen: ['g7-integers'],
      blurb: 'Use the number line, including subtracting a negative.', lessons: ['negative-numbers-and-absolute-value'], standards: ['7.3.5.4', '7.3.5.6'] },
    { id: 'solve-linear-equations', course: 'grade8', unit: 'Equations', title: 'Solve linear equations', gen: ['g8-linear-equation'],
      blurb: 'From one step up to brackets and variables on both sides.', lessons: ['solving-equations-with-a-balance'], standards: ['8.3.6.3'] },
    { id: 'pythagorean-side-lengths', course: 'grade8', unit: 'Right triangles', title: 'Find a side of a right triangle', gen: ['g8-pythagorean-side'],
      blurb: 'Use the Pythagorean theorem to find a hypotenuse or a leg.', lessons: ['pythagorean-theorem', 'distance-and-the-pythagorean-theorem'], standards: ['8.2.3.1'] },
    { id: 'solve-linear-systems', course: 'algebra1', unit: 'Systems', title: 'Solve a system of two linear equations', gen: ['a1-system-solve'],
      blurb: 'Substitution and elimination, up to negative coefficients.', lessons: ['solving-systems-by-substitution', 'solving-systems-by-elimination', 'systems-of-equations'], standards: ['8.3.6.9'] }
  ];
  Practice.skill = id => Practice.SKILLS.find(s => s.id === id);
  Practice.generatorsOf = skill => skill.gen.map(id => byId[id]);
  Practice.levelCount = skill => Math.min(...Practice.generatorsOf(skill).map(g => g.levels.length));

  /* ---- the ladder ---- */
  const LADDER = Practice.LADDER = { up: 3, down: 2, masteryWindow: 6, masteryNeeded: 5 };
  Practice.newState = () => ({ level: 1, streak: 0, miss: 0, totalPoints: 0, mastered: false, lastPracticed: 0, attempts: 0, forceLevel: 0,
    topRecent: [], recentOk: [], recentSeeds: [], recentHashes: [], rating: null, placed: false });

  /* Points: scale with level; streak bonus; level-up bonus; fewer with hints; none for giving up, a wrong answer or a guess;
     a quarter once the skill is mastered. */
  Practice.POINTS = { perLevel: 10, streakStep: 2, streakCap: 5, levelUp: 25, hintFactor: [1, .75, .5, .25], masteredFactor: .25 };
  /* outcome: { correct, hints, gaveUp, fast, level }; returns { state, points, change: -1|0|1, newlyMastered, ignored } and never mutates `state` */
  Practice.applyAttempt = (state, skill, o) => {
    const s = JSON.parse(JSON.stringify(state)), top = Practice.levelCount(skill), P = Practice.POINTS;
    s.attempts++; s.lastPracticed = Date.now(); s.forceLevel = 0;
    const res = { points: 0, change: 0, newlyMastered: false, ignored: false };
    if (o.fast && o.correct && !o.gaveUp) { res.ignored = true; res.state = s; return res; }   /* a guess: no points, no ladder move */
    const clean = o.correct && !o.hints && !o.gaveUp;
    s.recentOk = (s.recentOk || []).concat(o.correct && !o.gaveUp ? 1 : 0).slice(-8);
    if (o.level === top) {
      s.topRecent.push(clean ? 1 : 0);
      if (s.topRecent.length > LADDER.masteryWindow) s.topRecent.shift();
    }
    if (o.correct && !o.gaveUp) {
      s.miss = 0;
      if (!o.hints) s.streak++;
    } else { s.streak = 0; s.miss++; }
    if (o.gaveUp) s.forceLevel = o.level;                /* a similar problem at the same level next */
    const streakNow = s.streak;
    let bonus = 0;
    if (s.streak >= LADDER.up && s.level < top) { s.level++; s.streak = 0; s.miss = 0; res.change = 1; bonus = P.levelUp; }
    else if (s.streak >= LADDER.up) s.streak = LADDER.up;   /* at the top: the streak keeps counting for the bonus */
    else if (s.miss >= LADDER.down && s.level > 1) { s.level--; s.streak = 0; s.miss = 0; res.change = -1; }
    else if (s.miss >= LADDER.down) s.miss = LADDER.down;
    if (o.correct && !o.gaveUp) {
      const base = P.perLevel * o.level, streakBonus = o.hints ? 0 : Math.min(streakNow, P.streakCap) * P.streakStep;
      let pts = Math.round((base + streakBonus) * P.hintFactor[Math.min(o.hints, P.hintFactor.length - 1)]) + bonus;
      if (state.mastered) pts = Math.max(1, Math.round(pts * P.masteredFactor));
      res.points = pts; s.totalPoints += pts;
    }
    if (!s.mastered && s.topRecent.length >= LADDER.masteryWindow && s.topRecent.reduce((t, v) => t + v, 0) >= LADDER.masteryNeeded) { s.mastered = true; res.newlyMastered = true; }
    res.state = s;
    return res;
  };

  /* ---- choosing the next problem ---- */
  const RECENT_SEEDS = 40, RECENT_HASHES = 60;
  /* rand: a function returning [0,1); tests pass a seeded one */
  Practice.nextInstance = (state, skill, rand = Math.random) => {
    const level = Math.min(state.forceLevel || state.level, Practice.levelCount(skill)), gens = Practice.generatorsOf(skill);
    let inst = null;
    for (let tries = 0; tries < 60; tries++) {
      const gen = gens[Math.floor(rand() * gens.length)], seed = Math.floor(rand() * 4294967296) >>> 0;
      inst = Practice.verified(gen, seed, level);
      if (!inst) continue;
      if (!state.recentSeeds.includes(seed) && !state.recentHashes.includes(inst.canonical)) break;
    }
    if (!inst) throw new Error('could not build a verified problem for ' + skill.id);
    return inst;
  };
  /* remember what was shown (a finite skill may then repeat, spaced out, once the window has moved on) */
  Practice.markSeen = (state, inst) => {
    state.recentSeeds.push(inst.seed); if (state.recentSeeds.length > RECENT_SEEDS) state.recentSeeds.shift();
    state.recentHashes.push(inst.canonical); if (state.recentHashes.length > RECENT_HASHES) state.recentHashes.shift();
  };

  /* ---- independent verification: re-derive the answer from the finished problem and compare ---- */
  Practice.verify = inst => {
    try {
      const got = Practice.cas.answerOf(inst);
      if (!Practice.sameValue(inst.answer.type, got, inst.answer.value)) return 'the CAS disagrees with the constructed answer';
      /* the printed numbers must be the model's numbers (digits only; exponents are not data) */
      const nums = s => new Set(s.replace(/\^\d/g, '').match(/\d+/g) || []);
      const shown = nums(inst.prompt.html.replace(/\\\w+/g, ' ')), model = nums(inst.model), implicit = inst.implicit || [];
      const extra = [...shown].filter(x => !model.has(x)), hidden = [...model].filter(x => !shown.has(x) && !implicit.includes(x));
      if (extra.length || hidden.length) return `the text and the model disagree on numbers (text only: ${extra}; model only: ${hidden})`;
      return null;
    } catch (e) { return 'the CAS could not read the problem: ' + e.message; }
  };
  /* generate + verify; a disagreement is logged and the problem is discarded (the caller resamples). Never returns an unverified problem. */
  Practice.verifyLog = [];
  Practice.verified = (gen, seed, level) => {
    const inst = gen.generate(seed, level), why = Practice.verify(inst);
    if (why) { Practice.verifyLog.push({ g: gen.id, v: gen.version, level, seed, why }); if (Practice.verifyLog.length > 50) Practice.verifyLog.shift(); return null; }
    return inst;
  };

  /* ---- records ---- */
  Practice.record = (skill, inst, o) => ({ s: skill.id, g: inst.generatorId, v: inst.version, lvl: inst.level, seed: inst.seed,
    a: String(o.answer || '').slice(0, 60), ok: o.correct ? 1 : 0, h: o.hints | 0, mc: o.misconception || null, t: Math.round(o.timeMs || 0), p: o.points | 0, gu: o.gaveUp ? 1 : 0, at: o.at || Date.now() });
  /* regenerate an attempt's problem and grade it again: { stale } if the generator changed, else { ok } */
  Practice.regrade = rec => {
    const gen = byId[rec.g];
    if (!gen) return { stale: true };
    if (gen.version !== rec.v) return { stale: true };
    const inst = gen.generate(rec.seed, rec.lvl);
    if (rec.gu) return { ok: false, inst };
    return { ok: Practice.check(inst.answer, rec.a).status === 'correct', inst };
  };
  Practice.instanceRecord = inst => ({ g: inst.generatorId, v: inst.version, lvl: inst.level, seed: inst.seed });
  Practice.regenerate = rec => { const gen = byId[rec.g]; if (!gen || gen.version !== rec.v) return null; return gen.generate(rec.seed, rec.lvl); };
}

/* ---- mixed review (v2): skills of one unit or course take turns ---- */
{
  const slug = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  /* the mixes on offer: one per course with two or more skills, and one per unit with two or more skills (when the unit is not the whole course).
     nameOf maps a course id to its display name. */
  Practice.mixes = (nameOf = id => id) => {
    const out = [], courses = [...new Set(Practice.SKILLS.map(s => s.course))];
    for (const c of courses) {
      const inC = Practice.SKILLS.filter(s => s.course === c);
      if (inC.length < 2) continue;
      out.push({ id: 'mix-course-' + c, course: c, title: 'Mixed review: ' + nameOf(c), skills: inC });
      for (const u of [...new Set(inC.map(s => s.unit))]) {
        const inU = inC.filter(s => s.unit === u);
        if (inU.length >= 2 && inU.length < inC.length) out.push({ id: `mix-unit-${c}-${slug(u)}`, course: c, title: 'Mixed review: ' + u, skills: inU });
      }
    }
    return out;
  };
  Practice.mix = (id, nameOf) => Practice.mixes(nameOf).find(m => m.id === id);
  /* How much a skill needs a turn: never tried, weak lately, or not seen for a while count for more; a mastered skill stays in
     the rotation at half weight (review). */
  Practice.skillWeight = (state, now = Date.now()) => {
    if (!state.attempts) return 3;
    const ok = state.recentOk || [], acc = ok.length >= 3 ? ok.reduce((t, v) => t + v, 0) / ok.length : (ok.reduce((t, v) => t + v, 0) + 1.8) / (ok.length + 3);
    const days = Math.min(7, Math.max(0, (now - (state.lastPracticed || now)) / 86400000));
    let w = 1 + 4 * (1 - acc) + .4 * days;
    if (state.mastered) w = Math.max(.4, w * .5);
    return w;
  };
  /* skills: the mix's skills; states: id -> state; lastId: the skill just asked (never twice in a row with 3 or more skills; soft-avoided with 2; `repeat` forces it) */
  Practice.pickSkill = (skills, states, lastId, now, rand = Math.random, repeat = false) => {
    if (repeat && lastId && skills.some(s => s.id === lastId)) return skills.find(s => s.id === lastId);
    /* three or more skills: never the same one twice in a row. Two skills: the one just asked is down-weighted, so they still interleave
       but the weaker one can come up twice. */
    const hard = skills.length >= 3, pool = hard ? skills.filter(s => s.id !== lastId) : skills;
    const ws = pool.map(s => Practice.skillWeight(states[s.id] || Practice.newState(), now) * (!hard && skills.length > 1 && s.id === lastId ? .25 : 1)), total = ws.reduce((t, v) => t + v, 0);
    let x = rand() * total;
    for (let i = 0; i < pool.length; i++) { x -= ws[i]; if (x < 0) return pool[i]; }
    return pool[pool.length - 1];
  };
}
