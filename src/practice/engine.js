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
    { id: 'add-subtract-unlike-fractions', course: 'grade5', unit: 'Fractions', title: 'Add and subtract fractions with unlike denominators', gen: ['g5-fraction-sum'],
      blurb: 'Rename with a common denominator, then add or subtract.', lessons: ['adding-fractions-with-unlike-denominators', 'equivalent-fractions-on-a-number-line'], standards: ['5.3.5.11'] },
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
    topRecent: [], recentSeeds: [], recentHashes: [], rating: null, placed: false });

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
      const nums = s => [...new Set((s.replace(/\^\d/g, '').match(/\d+/g) || []))].sort().join(',');
      const shown = nums(inst.prompt.html.replace(/\\\w+/g, ' '));
      if (shown !== nums(inst.model)) return `the text shows numbers ${shown} but the model has ${nums(inst.model)}`;
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
