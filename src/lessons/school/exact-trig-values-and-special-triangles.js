/* =====================================================================
   SCHOOL / GEOMETRY — Exact trig values and special triangles
   ===================================================================== */
{
  const R2 = Math.SQRT2, R3 = Math.sqrt(3), D2R = Math.PI / 180, PI = Math.PI;
  const rt = (c, r) => r === 1 ? num(c) : (c === 1 ? '' : num(c)) + '√' + r;      /* c√r, leaving out a plain 1 */
  const dec = (c, r) => (c * Math.sqrt(r)).toFixed(2);
  const val = (c, r, u) => (r === 1 ? num(c) : rt(c, r) + ' ≈ ' + dec(c, r)) + (u ? ' ' + u : '');
  const d3 = v => String(+v.toFixed(3));
  const strip = t => t.replace(/^Yes\. /, '');

  const ANG = [30, 45, 60], FNS = ['sin', 'cos', 'tan'];
  const MODES = [['tbl', 'Fill the exact-value table'], ['exact', 'Exact or decimal? A ladder'], ['cut', 'Cut figures into special triangles'],
    ['why', 'Give the reasons'], ['circ', 'Bridge: the unit circle'], ['prac', 'Practice problems']];
  const HINTS = {
    tbl: 'Pick a cell in the grid or with the menus. Read the triangle, then choose.',
    exact: 'Choose the equation, then the answer. Move the sliders to try other numbers.',
    cut: 'Choose a figure, then answer each question. The picture changes as you go.',
    why: 'Choose the reason for each step. A wrong choice is explained.',
    circ: 'Drag the point on the arc, or use the slider and the buttons.',
    prac: 'Answer in the Practice panel below. The picture shows the problem.'
  };
  /* sides of the two special triangles, for each angle theta at corner A */
  const TRI = {
    30: { o: 1, a: R3, h: 2, ot: '1', at: '√3', ht: '2', name: '30-60-90' },
    45: { o: 1, a: 1, h: R2, ot: '1', at: '1', ht: '√2', name: '45-45-90' },
    60: { o: R3, a: 1, h: 2, ot: '√3', at: '1', ht: '2', name: '30-60-90' }
  };
  const TV = {
    sin: { 30: ['1/2', .5], 45: ['√2/2', R2 / 2], 60: ['√3/2', R3 / 2] },
    cos: { 30: ['√3/2', R3 / 2], 45: ['√2/2', R2 / 2], 60: ['1/2', .5] },
    tan: { 30: ['√3/3', R3 / 3], 45: ['1', 1], 60: ['√3', R3] }
  };
  const PAT = { sin: { 30: '√1 / 2', 45: '√2 / 2', 60: '√3 / 2' }, cos: { 30: '√3 / 2', 45: '√2 / 2', 60: '√1 / 2' } };
  const DEF = { sin: 'opposite ÷ hypotenuse', cos: 'adjacent ÷ hypotenuse', tan: 'opposite ÷ adjacent' };
  const NEEDRAT = { tan30: 1, sin45: 1, cos45: 1 };

  /* ---------- the nine cell questions: [text, why, ok] ---------- */
  const CQ = {
    sin30: [['√3/2', 'That is adjacent ÷ hypotenuse, which is cos 30°. The side across from the 30° angle is the short leg, 1.'],
      ['1/2', 'The side across from 30° is the short leg, 1, and the hypotenuse is 2. So sin 30° = opposite ÷ hypotenuse = 1 ÷ 2 = 0.5.', 1],
      ['2', 'You flipped the ratio. The hypotenuse goes on the bottom. Also, a sine is never more than 1, because the hypotenuse is the longest side.'],
      ['√3/3', 'That is opposite ÷ adjacent = 1 ÷ √3, the tangent. Sine uses the hypotenuse, not the other leg.']],
    cos30: [['1/2', 'That is opposite ÷ hypotenuse, the sine of 30°. Cosine uses the side that touches the 30° angle, the long leg √3.'],
      ['2/√3', 'You flipped the ratio. Cosine is adjacent ÷ hypotenuse, so the hypotenuse 2 goes on the bottom.'],
      ['√3/2', 'The side touching the 30° angle is the long leg, √3. So cos 30° = adjacent ÷ hypotenuse = √3 ÷ 2 ≈ 0.866.', 1],
      ['√3', 'That is the adjacent side alone, not a ratio. Divide it by the hypotenuse, 2.']],
    tan30: [['1/√3', 'This has the right value (1 ÷ √3 ≈ 0.577), but a root is still on the bottom. Multiply top and bottom by √3: (1 × √3) ÷ (√3 × √3) = √3/3.'],
      ['√3', 'That is adjacent ÷ opposite, the flipped ratio. It is the tangent of 60°. For 30° the short leg (1) is on top: tan 30° = 1 ÷ √3.'],
      ['√3/3', 'tan 30° = opposite ÷ adjacent = 1 ÷ √3. To take the root off the bottom, multiply top and bottom by √3. The top becomes √3 and the bottom becomes √3 × √3 = 3. So tan 30° = √3/3 ≈ 0.577.', 1],
      ['1/3', 'Careful. The bottom did become 3, but the top must be multiplied by √3 too, so it becomes √3, not 1. Whatever you do to the bottom, do to the top.']],
    sin45: [['1/2', 'You dropped the root. The hypotenuse is √2, not 2. So sin 45° = 1 ÷ √2.'],
      ['1/√2', 'This has the right value (about 0.707), but a root is on the bottom. Multiply top and bottom by √2 to get √2/2.'],
      ['√2/2', 'opposite ÷ hypotenuse = 1 ÷ √2. Multiply top and bottom by √2: (1 × √2) ÷ (√2 × √2) = √2/2 ≈ 0.707.', 1],
      ['√2', 'That is the flipped ratio, hypotenuse ÷ leg. Sine puts the hypotenuse on the bottom.']],
    cos45: [['√2', 'That is the flipped ratio, hypotenuse ÷ leg. Cosine puts the hypotenuse on the bottom.'],
      ['√2/2', 'adjacent ÷ hypotenuse = 1 ÷ √2 = √2/2 ≈ 0.707. Both legs are 1, so the 45° angle has the same sine and cosine.', 1],
      ['1/2', 'You dropped the root. The hypotenuse is √2, not 2.'],
      ['1/√2', 'This has the right value, but a root is on the bottom. Multiply top and bottom by √2 to get √2/2.']],
    tan45: [['√2/2', 'That is the sine or cosine of 45°. Tangent compares the two legs only, and they are equal.'],
      ['1', 'The legs are equal, so opposite ÷ adjacent = 1 ÷ 1 = 1. The 45° line rises 1 for every 1 across.', 1],
      ['√2', 'That is hypotenuse ÷ leg. Tangent does not use the hypotenuse.'],
      ['1/2', 'Nothing in this triangle is half of another side. Both legs are 1.']],
    sin60: [['1/2', 'That is the sine of 30°. At 60° the side across is the long leg √3, not the short leg 1.'],
      ['√3', 'That is the opposite side alone. Divide it by the hypotenuse, 2, to make the ratio.'],
      ['2/√3', 'You flipped the ratio. Sine is opposite ÷ hypotenuse, so the hypotenuse 2 goes on the bottom.'],
      ['√3/2', 'The side across from 60° is the long leg, √3. So sin 60° = √3 ÷ 2 ≈ 0.866.', 1]],
    cos60: [['√3/2', 'That is the sine of 60°. Cosine uses the side that touches the 60° angle, the short leg, 1.'],
      ['1/2', 'The side touching the 60° angle is the short leg, 1. So cos 60° = 1 ÷ 2 = 0.5. Notice cos 60° = sin 30°: the same side over the same hypotenuse.', 1],
      ['2', 'You flipped the ratio. The hypotenuse goes on the bottom.'],
      ['√3/3', 'That is 1 ÷ √3, the tangent of 30°. Here the hypotenuse is 2, not √3.']],
    tan60: [['1/√3', 'That is the flipped ratio (adjacent ÷ opposite), the tangent of 30°. At 60° the long leg is on top.'],
      ['√3/2', 'That is opposite ÷ hypotenuse, the sine of 60°. Tangent uses the other leg, not the hypotenuse.'],
      ['1/2', 'That is adjacent ÷ hypotenuse, the cosine of 60°. Tangent compares the two legs.'],
      ['√3', 'opposite ÷ adjacent = √3 ÷ 1 = √3 ≈ 1.732. There is no root on the bottom, so nothing to rationalize.', 1]]
  };

  /* ---------- figures cut into special triangles ---------- */
  const mk = (q, good, bads, pos) => { const ch = bads.slice(); ch.splice(pos, 0, [good[0], good[1], 1]); return { q, ch }; };
  const typeQ = (q, key, okWhy, w, pos) => {
    const base = {
      o45: '45-45-90: the legs are equal and the hypotenuse is √2 times a leg',
      o3060: '30-60-90: short leg : long leg : hypotenuse = 1 : √3 : 2',
      oeq: 'Equilateral: three equal sides and three 60° angles',
      oplain: 'Just a right triangle, with no fixed ratio'
    };
    const bads = Object.keys(base).filter(k => k !== key).map(k => [base[k], w[k]]);
    return mk(q, [base[key], okWhy], bads, pos);
  };
  const FIGS = {
    eq: { name: 'Equilateral triangle', lab: 'Side s (cm)', vals: [2, 4, 6, 8, 10], def: 6, u: 'cm',
      stages: s => [
        mk('All three sides are ' + s + ' cm. How do you cut it into right triangles?',
          ['Straight down from the top corner to the base, at a right angle (the height)', 'The height makes a right angle with the base and splits the 60° top angle in two, so each half has angles 30°, 60° and 90°. The next scene proves it cuts the base in half.'],
          [['Parallel to the bottom side', 'That makes a small triangle and a trapezoid. Neither has a right angle, so the special ratios do not apply.'],
            ['From the top corner to a point near one end of the base', 'The pieces are right triangles only if the cut meets the base at 90°. This cut does not, and the two pieces would not match.']], 0),
        typeQ('Each half has a 90° angle and a 60° angle at the base. Which triangle is it?', 'o3060',
          `The angles are 30°, 60° and 90°. The short leg is half the base, ${s} ÷ 2 = ${s / 2}. The hypotenuse is the side of the big triangle, ${s}. The long leg is the height.`,
          { o45: 'There is no 45° angle here. The angles are 30°, 60° and 90°.', oeq: 'A right triangle cannot be equilateral. Its hypotenuse is longer than its legs, and it has a 90° angle.', oplain: 'Any right triangle with a 30° angle has the pattern 1 : √3 : 2, so you can skip the Pythagorean theorem.' }, 2),
        mk('What is the height of the big triangle (the long leg)?',
          [val(s / 2, 3, 'cm'), `The long leg is √3 times the short leg: ${s / 2} × √3 = ${rt(s / 2, 3)}. Check: ${s / 2}² + (${rt(s / 2, 3)})² = ${s * s / 4} + ${3 * s * s / 4} = ${s * s} = ${s}².`],
          [[`${s / 2} cm`, 'That is the short leg, half the base. The height is the long leg, which is longer by a factor √3.'],
            [val(s, 3, 'cm'), 'That multiplies the hypotenuse by √3. The √3 goes with the short leg, and the height must be shorter than the side.'],
            [val(s / 2, 2, 'cm'), '√2 belongs to the 45-45-90 triangle. This triangle has a 30° angle, so its long leg is √3 times its short leg.']], 1),
        mk('What is the area of the whole triangle? Area = ½ × base × height.',
          [val(s * s / 4, 3, 'cm²'), `½ × ${s} × ${rt(s / 2, 3)} = ${rt(s * s / 4, 3)}. In general the area is s²√3/4.`],
          [[val(s * s / 2, 3, 'cm²'), 'You forgot the ½ in the area of a triangle: ½ × base × height.'],
            [`${s * s / 4} cm²`, 'You dropped the √3. The height has a √3 in it, so the area does too.'],
            [val(s * s / 4, 2, 'cm²'), 'The height uses √3, not √2.']], 3)],
      cap: (s, r) => [r[1] ? 'area = ' + val(s * s / 4, 3, 'cm²') : ''] },
    hex: { name: 'Regular hexagon (a nut)', lab: 'Side s (mm)', vals: [2, 4, 6, 8, 10], def: 10, u: 'mm',
      stages: s => [
        mk('A regular hexagon has six equal sides of ' + s + ' mm. How do you cut it into triangles you know?',
          ['Draw lines from the centre to all six corners', 'That makes six triangles around the centre. Each central angle is 360° ÷ 6 = 60°.'],
          [['Draw one long diagonal from corner to corner', 'That makes two trapezoids, not triangles.'],
            ['Join two corners that skip one corner between them', 'That cuts off one triangle with a 120° angle, whose angles are 30°, 30° and 120°. It is not a special right triangle.']], 2),
        typeQ('What kind of triangle is each of the six pieces?', 'oeq',
          'Two sides of each piece are radii, and the angle between them is 60°. The other two angles are equal and add to 120°, so they are 60° too. All three sides are equal, so the radius equals the side, ' + s + ' mm. (The next scene gives this argument step by step.) Cut one piece down the middle and you get two 30-60-90 triangles.',
          { o45: 'The angle at the centre is 60°, not 90°, so a piece has no right angle at all.', o3060: 'Not yet. Each piece has three 60° angles. A 30-60-90 triangle appears when you cut one piece down the middle.', oplain: 'The pieces are not right triangles, but they do have a pattern: three equal sides.' }, 0),
        mk('The distance between two opposite flat sides is the wrench size. How big is it? (It is two heights of the small triangles.)',
          [val(s, 3, 'mm'), `One small triangle has height ${rt(s / 2, 3)} (its long leg: ${s / 2} × √3). The wrench size is two of them: 2 × ${rt(s / 2, 3)} = ${rt(s, 3)}. In general it is s√3.`],
          [[`${2 * s} mm`, 'That is the distance between opposite corners, 2 × the side. The flat sides are closer than the corners.'],
            [`${s} mm`, 'That is just one side. Opposite flats are two triangle heights apart.'],
            [val(s / 2, 3, 'mm'), 'That is one triangle height. The wrench goes across two of them.']], 1),
        mk('What is the area of the hexagon? It is 6 equilateral triangles, each with area s²√3/4.',
          [val(3 * s * s / 2, 3, 'mm²'), `One triangle: ${s}² × √3 ÷ 4 = ${rt(s * s / 4, 3)}. Six of them: 6 × ${rt(s * s / 4, 3)} = ${rt(3 * s * s / 2, 3)}. In general the area is 3√3·s²/2.`],
          [[val(3 * s * s, 3, 'mm²'), 'You used base × height without the ½ for each triangle, which doubles the area.'],
            [`${3 * s * s / 2} mm²`, 'You dropped the √3. The height of each triangle has a √3 in it.'],
            [val(s * s / 4, 3, 'mm²'), 'That is the area of just one of the six triangles.']], 3)],
      cap: (s, r) => [r[1] ? 'area = ' + val(3 * s * s / 2, 3, 'mm²') : ''] },
    rect: { name: 'Rectangle, 30° diagonal', lab: 'Short side s (cm)', vals: [1, 2, 3, 4, 5, 6, 7, 8], def: 4, u: 'cm',
      stages: s => [
        mk('The diagonal of this rectangle makes a 30° angle with the long side. The short side is ' + s + ' cm. Which cut gives two matching right triangles?',
          ['Draw the diagonal', 'The diagonal splits the rectangle into two matching right triangles. Each has the 30° angle, so each is a 30-60-90 triangle.'],
          [['Join the middles of the two long sides', 'That makes two smaller rectangles, with no triangles at all.'],
            ['Join a corner to the middle of the opposite long side', 'That makes a right triangle and a trapezoid. The angle at that corner is not 30°, so there is no special ratio.']], 1),
        typeQ('Each piece has a 90° corner and a 30° angle. Which triangle is it?', 'o3060',
          `The angles are 30°, 60° and 90°. The short side (${s}) is across from 30°, so it is half the hypotenuse. The diagonal is 2 × ${s} = ${2 * s}.`,
          { o45: 'The angles are 30° and 60°, not 45°. A rectangle whose diagonal makes 45° with a side is a square.', oeq: 'Each piece has a 90° corner, so it cannot be equilateral.', oplain: 'Every right triangle with a 30° angle has the pattern 1 : √3 : 2.' }, 3),
        mk('How long is the long side of the rectangle?',
          [val(s, 3, 'cm'), `The long side touches the 30° angle, so it is the long leg: short leg × √3 = ${rt(s, 3)}.`],
          [[`${2 * s} cm`, 'That is the diagonal, the hypotenuse. A leg is shorter than the hypotenuse.'],
            [val(s, 2, 'cm'), '√2 belongs to the 45-45-90 triangle. Here the angle is 30°, so the factor is √3.'],
            [val(2 * s, 3, 'cm'), 'That multiplies the hypotenuse by √3. The long leg is √3 times the short leg, not the hypotenuse.']], 0),
        mk('What is the area of the rectangle?',
          [val(s * s, 3, 'cm²'), `short side × long side = ${s} × ${rt(s, 3)} = ${rt(s * s, 3)}.`],
          [[`${s * s} cm²`, 'That multiplies the short side by itself. The other side is √3 times as long.'],
            [val(2 * s * s, 3, 'cm²'), 'You multiplied the short side by twice the long side. Area = short × long.'],
            [val(s * s, 2, 'cm²'), 'The long side has √3 in it, not √2.']], 2)],
      cap: (s, r) => [r[1] ? 'area = ' + val(s * s, 3, 'cm²') : ''] },
    truss: { name: 'Roof truss, 30° roof', lab: 'Span (m)', vals: [6, 12, 18], def: 12, u: 'm',
      stages: b => [
        mk('A roof truss is an isosceles triangle with a ' + b + ' m base and 30° base angles. How do you cut it into right triangles?',
          ['Straight down from the peak to the middle of the base', 'Both halves are matching right triangles with a 30° angle at the eave.'],
          [['Parallel to the base', 'That makes a small triangle and a trapezoid, and neither has a right angle.'],
            ['From the peak to a point one third of the way along the base', 'The two pieces would not match, and neither has a 30° angle at the cut.']], 0),
        typeQ('Each half has a 90° angle at the axis and 30° at the eave. Which triangle is it?', 'o3060',
          `The angles are 30°, 60° and 90°. The half-span, ${b / 2} m, touches the 30° angle, so it is the long leg. The rise is the short leg and the rafter is the hypotenuse.`,
          { o45: 'The angles are 30°, 60° and 90°, so this is not the 45-45-90 triangle.', oeq: 'A right triangle cannot be equilateral.', oplain: 'The 30° angle gives the pattern 1 : √3 : 2.' }, 1),
        mk('The half-span is the long leg. How high is the peak above the base (the rise, the short leg)?',
          [val(b / 6, 3, 'm'), `The long leg is √3 times the short leg, so the short leg is the long leg ÷ √3: ${b / 2} ÷ √3 = ${b / 2}√3 ÷ 3 = ${rt(b / 6, 3)}.`],
          [[val(b / 2, 3, 'm'), 'You multiplied the long leg by √3. Going from the long leg to the short leg you divide by √3.'],
            [`${b / 2} m`, 'That is the half-span itself, the long leg. The rise is the short leg and is shorter.'],
            [val(b / 3, 3, 'm'), 'That is twice the rise, the rafter (hypotenuse), not the rise.']], 2),
        mk('How long is one rafter (the sloping side)?',
          [val(b / 3, 3, 'm'), `The hypotenuse is twice the short leg: 2 × ${rt(b / 6, 3)} = ${rt(b / 3, 3)}. Check: ${b / 2}² + (${rt(b / 6, 3)})² = ${b * b / 4} + ${b * b / 12} = ${b * b / 3} = (${rt(b / 3, 3)})².`],
          [[val(b / 6, 3, 'm'), 'That is the rise, the short leg. The rafter is the hypotenuse, twice as long.'],
            [`${b / 2} m`, 'That is the half-span, a leg. The rafter is the hypotenuse and must be longer than either leg.'],
            [val(b / 2, 2, 'm'), '√2 belongs to the 45-45-90 triangle. This roof has a 30° angle.']], 0)],
      cap: () => [] },
    sq: { name: 'Square', lab: 'Side s (cm)', vals: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], def: 6, u: 'cm',
      stages: s => [
        mk('A square has sides of ' + s + ' cm. How do you cut it into two right triangles?',
          ['Along a diagonal, from corner to corner', 'Each corner of the square is 90°, and the diagonal splits two of them in half, so each piece has angles 45°, 45° and 90°.'],
          [['Straight down the middle, parallel to two sides', 'That makes two rectangles, not triangles.'],
            ['From a corner to the middle of the opposite side', 'That makes a right triangle and a trapezoid. Its angles are not 45°, so the ratio is not special.']], 2),
        typeQ('Each piece has a 90° corner and two equal sides. Which triangle is it?', 'o45',
          `The two sides of the square are equal legs, so the other two angles are equal: 45° each. The hypotenuse is √2 times a leg.`,
          { o3060: 'The angles are 45°, 45° and 90°, so the legs are equal. A 30-60-90 triangle has unequal legs.', oeq: 'A right triangle cannot be equilateral.', oplain: 'Two equal legs give the pattern 1 : 1 : √2.' }, 0),
        mk('How long is the diagonal?',
          [val(s, 2, 'cm'), `diagonal = leg × √2 = ${rt(s, 2)}. Check: ${s}² + ${s}² = ${2 * s * s} = (${rt(s, 2)})².`],
          [[`${2 * s} cm`, 'That is two sides added. The diagonal is a shortcut across the corner, so it is shorter than that.'],
            [`${s} cm`, 'A diagonal is a hypotenuse, so it is longer than a side.'],
            [val(s, 3, 'cm'), '√3 belongs to the 30-60-90 triangle. This triangle has two 45° angles.']], 1),
        mk('What is the area of one of the two triangles?',
          [`${num(s * s / 2)} cm²`, `The two triangles share the square equally. ${s}² = ${s * s}, and half of it is ${num(s * s / 2)}. (Or ½ × ${s} × ${s}.)`],
          [[`${s * s} cm²`, 'That is the area of the whole square.'],
            [`${num(s * s / 4)} cm²`, 'That is a quarter of the square. There are two triangles, so each has half.'],
            [val(s * s / 2, 2, 'cm²'), 'The legs are whole numbers, so there is no root in the area.']], 3)],
      cap: (s, r) => [r[1] ? 'one triangle: ' + num(s * s / 2) + ' cm²' : ''] }
  };

  /* ---------- the two arguments ---------- */
  const ARGS = [
    { name: 'The height of an equilateral triangle halves the base',
      given: 'Triangle ABC is equilateral. D is the point where the height from A meets BC, so AD ⟂ BC.',
      claim: 'BD = DC and that AD splits the 60° angle at A into two 30° angles.',
      steps: [
        { s: 'Triangles ADB and ADC both have a right angle at D.',
          ch: [['AD is the height, so it meets BC at 90°.', 'That is how D was defined. The height makes a right angle with the base.', 1],
            ['All three angles of the triangle are 60°.', 'That is true, but it says nothing about the angles at D. The right angles come from AD being a height.'],
            ['AD is a median.', 'We were not told that. We are trying to show that D is the middle.']] },
        { s: 'AB = AC, so the two hypotenuses are equal.',
          ch: [['The triangle is equilateral, so all three sides are equal.', 'Equilateral means all sides are equal, so AB = AC. In the right triangles they are the hypotenuses.', 1],
            ['The triangles look the same in the picture.', 'A picture can mislead. A proof must use a fact that was given.'],
            ['AD is shared by both triangles.', 'True, but that gives AD = AD, not AB = AC.']] },
        { s: 'AD = AD, so the triangles share a leg.',
          ch: [['Both triangles contain the side AD.', 'A side shared by two triangles is equal to itself. Mathematicians call this the reflexive property.', 1],
            ['AD is half of BC.', 'We are trying to prove the halving, so we cannot use it.'],
            ['AD is the longest side.', 'The longest side of each right triangle is its hypotenuse, AB or AC.']] },
        { s: 'Triangle ADB is congruent to triangle ADC.',
          ch: [['Hypotenuse-leg: two right triangles with equal hypotenuses and one equal leg are congruent.', 'Right angles, equal hypotenuses (step 2) and a shared leg (step 3) are exactly what hypotenuse-leg needs.', 1],
            ['AAA: the angles match, so the triangles match.', 'Equal angles give similar triangles, not necessarily congruent ones. Here we need a side.'],
            ['SSA: two sides and an angle are enough.', 'SSA fails in general. Hypotenuse-leg is a special case that works because the angle is a right angle.']] },
        { s: 'BD = DC, and angle BAD = angle CAD.',
          ch: [['Corresponding parts of congruent triangles are equal.', 'The triangles are congruent, so BD matches DC, and the angle at A in one matches the angle at A in the other.', 1],
            ['The sides are drawn the same length.', 'Drawings are not proof. We use the congruence from step 4.'],
            ['D is the middle because the triangle is equilateral.', 'That is what we wanted to show, so it cannot be a reason.']] }],
      done: 'So BD = DC = s/2, and the 60° angle at A is split into two 30° angles. Each half is a 30-60-90 triangle with hypotenuse s and short leg s/2.' },
    { name: 'The six triangles in a regular hexagon are equilateral',
      given: 'ABCDEF is a regular hexagon with centre O. All six sides are equal and all six corners are the same distance from O.',
      claim: 'triangle OAB is equilateral, so the radius equals the side.',
      steps: [
        { s: 'Angle AOB = 60°.',
          ch: [['The six angles around O are equal and add to 360°, and 360 ÷ 6 = 60.', 'The six triangles have three pairs of equal sides (the six sides of the hexagon and the radii), so they are congruent and their angles at O are equal: each is a sixth of a full turn.', 1],
            ['A hexagon has six sides, so the angle is 6°.', 'The count of sides is not the angle. Divide the full turn, 360°, by 6.'],
            ['The interior angle of a hexagon is 120°, so AOB is 120°.', '120° is the angle at a corner of the hexagon (angle FAB), not the angle at the centre.']] },
        { s: 'OA = OB.',
          ch: [['Both are radii: every corner is the same distance from O.', 'In a regular hexagon all corners lie on a circle around O, so OA and OB are both radii.', 1],
            ['They are both sides of the hexagon.', 'OA and OB go from the centre to corners. They are not sides of the hexagon.'],
            ['They look equal.', 'A picture can mislead. We use the fact that the corners are the same distance from O.']] },
        { s: 'Angle OAB = angle OBA.',
          ch: [['Base angles of an isosceles triangle are equal.', 'OA = OB, so triangle OAB is isosceles, and the angles opposite the equal sides are equal.', 1],
            ['Vertical angles are equal.', 'No two lines cross here, so there are no vertical angles.'],
            ['All angles in a hexagon are equal.', 'That is about the corners of the hexagon, not these angles inside the small triangle.']] },
        { s: 'Angle OAB = angle OBA = 60°.',
          ch: [['The angles of a triangle add to 180°, so each base angle is (180 − 60) ÷ 2 = 60°.', 'The apex angle is 60°, which leaves 120° for two equal angles: 60° each.', 1],
            ['The angles of a triangle add to 360°.', 'They add to 180°. The 360° is a full turn around a point.'],
            ['Each base angle is 120° because the hexagon corner is 120°.', 'The corner of the hexagon is split between two triangles, so the base angle is half of it: 60°.']] },
        { s: 'Triangle OAB is equilateral, so OA = OB = AB.',
          ch: [['Three equal angles mean three equal sides (equal angles lie opposite equal sides).', 'All three angles are 60°. Sides opposite equal angles are equal, so all three sides are equal.', 1],
            ['The triangle is isosceles, so all sides are equal.', 'Isosceles only guarantees two equal sides. Here we know all three angles.'],
            ['AB is a side of the hexagon, so it equals the radius.', 'That is the conclusion we want, so it cannot be the reason.']] }],
      done: 'The radius equals the side s. Each of the six triangles is equilateral with side s, so the hexagon has area 6 × (s²√3/4) and is 2 × (s√3/2) = s√3 across the flats.' }
  ];

  /* ---------- practice problems ---------- */
  const PR = [
    { v: { k: 'tri', a: 60 },
      q: 'Use the 30-60-90 triangle (sides 1, √3, 2). Which pair gives sin 60° and tan 30°, in that order, with no root left on the bottom?',
      ch: [['1/2 and √3', 'That is sin 30° and tan 60°. You swapped the angles. At 60° the side across is √3, so sin 60° = √3/2.'],
        ['√3/2 and √3/3', 'sin 60° = opposite ÷ hypotenuse = √3 ÷ 2. tan 30° = 1 ÷ √3 = √3/3 after multiplying top and bottom by √3. Check: 0.866 and 0.577.', 1],
        ['√3/2 and 1/√3', 'The values are right, but 1/√3 still has a root on the bottom. Multiply top and bottom by √3 to get √3/3.'],
        ['1/2 and √3/3', 'tan 30° = √3/3 is right, but sin 60° is not 1/2. That is sin 30° and cos 60°.']] },
    { v: { k: 'fig', fig: 'hex', s: 4, tgt: 1 },
      q: 'A regular hexagon has sides of 4 cm. It is cut into six equilateral triangles. What is its area?',
      ch: [['24 cm²', 'You dropped the √3. The height of each triangle has a √3 in it, so the area does too.'],
        ['24√3 ≈ 41.57 cm²', 'One equilateral triangle: 4² × √3 ÷ 4 = 4√3. Six of them: 6 × 4√3 = 24√3 ≈ 41.57 cm².', 1],
        ['48√3 ≈ 83.14 cm²', 'You used base × height without the ½ for each triangle, which doubles the area.'],
        ['4√3 ≈ 6.93 cm²', 'That is the area of one of the six triangles only.']] },
    { v: { k: 'fig', fig: 'hex', s: 8, tgt: 0 },
      q: 'A hexagonal nut has sides of 8 mm. What wrench size (the distance between opposite flat sides) fits it?',
      ch: [['16 mm', 'That is the distance between opposite corners. The flat sides are closer together.'],
        ['8 mm', 'That is one side. The flats are two triangle heights apart.'],
        ['4√3 ≈ 6.93 mm', 'That is the height of one triangle. The wrench goes across two of them.'],
        ['8√3 ≈ 13.86 mm', 'Each small triangle has height 4√3 (the long leg: 4 × √3). Two of them make 8√3 ≈ 13.86 mm. In general: s√3.', 1]] },
    { v: { k: 'lad', a: 60, h: 6 },
      q: 'A ladder leans on a wall at 60° to the ground and reaches 6 m up the wall. How long is the ladder? Give the exact value and the decimal.',
      ch: [['12 m', 'That uses sin 60° = 1/2. But 1/2 is sin 30°. Sin 60° = √3/2.'],
        ['4√3 ≈ 6.93 m', 'sin 60° = 6 ÷ L, so L = 6 ÷ (√3/2) = 12/√3 = 12√3/3 = 4√3 ≈ 6.93 m. Round only at the end.', 1],
        ['3√3 ≈ 5.20 m', 'You multiplied 6 by sin 60° instead of dividing. The ladder is the hypotenuse, so it must be longer than the 6 m it reaches.'],
        ['6√3 ≈ 10.39 m', 'That multiplies by tan 60°. Tangent compares the two legs, but here the ladder is the hypotenuse, so use sine.']] },
    { v: { k: 'fig', fig: 'sq', s: 5, tgt: 0 },
      q: 'A square tile has sides of 5 cm. How long is its diagonal?',
      ch: [['10 cm', 'That is two sides added. The diagonal is a shortcut, so it is shorter than 10.'],
        ['5 cm', 'The diagonal is a hypotenuse, so it is longer than a side.'],
        ['5√2 ≈ 7.07 cm', 'The pieces are 45-45-90 triangles, so the hypotenuse is leg × √2. Check: 25 + 25 = 50 = (5√2)².', 1],
        ['5√2/2 ≈ 3.54 cm', 'That divides by √2 (going from the hypotenuse to a leg). Here you start from a leg, so multiply.']] },
    { v: { k: 'fig', fig: 'eq', s: 10, tgt: 0 },
      q: 'An equilateral triangle has sides of 10 cm. How tall is it?',
      ch: [['5 cm', 'That is half the side, the short leg. The height is the long leg, longer by a factor √3.'],
        ['10√3 ≈ 17.32 cm', 'That multiplies the whole side by √3. The √3 goes with the short leg (5), and the height must be less than the side.'],
        ['5√3 ≈ 8.66 cm', 'Cut it down the middle. The short leg is 5 and the long leg is 5 × √3 ≈ 8.66. Check: 5² + (5√3)² = 25 + 75 = 100 = 10².', 1],
        ['5√2 ≈ 7.07 cm', '√2 belongs to the 45-45-90 triangle. This triangle has 30° and 60° angles.']] },
    { v: { k: 'why' },
      q: 'In equilateral triangle ABC the height AD meets BC at D. Which reason shows that BD = DC?',
      ch: [['In the picture D looks like the middle.', 'A proof cannot rest on how a picture looks.'],
        ['Triangles ADB and ADC are congruent by hypotenuse-leg, so their matching sides BD and DC are equal.', 'Both are right triangles, AB = AC because the triangle is equilateral, and AD is shared. Hypotenuse-leg gives congruence, and matching sides of congruent triangles are equal.', 1],
        ['A height always bisects the side it meets.', 'That is false in general. In a scalene triangle the height lands off-centre. It works here because the triangle is equilateral.'],
        ['AD = BD because both are heights.', 'BD is not a height, and AD and BD are different lengths.']] },
    { v: { k: 'fig', fig: 'eq', s: 8, tgt: 0 },
      q: 'A student finds the height of an equilateral triangle with side 8 cm like this: "height = 8 × sin 60° = 8 × 1/2 = 4 cm." What is wrong, and what is the right height?',
      ch: [['Nothing is wrong: the height is half the side, 4 cm.', 'Half the side is the short leg (the base of each half). The height is the long leg. Check: 4² + 4² = 32, not 64.'],
        ['sin 60° is not 1/2. It is √3/2, so the height is 8 × √3/2 = 4√3 ≈ 6.93 cm.', 'sin 30° = 1/2, but sin 60° = √3/2 ≈ 0.866. The height 4√3 fits: 4² + (4√3)² = 16 + 48 = 64 = 8².', 1],
        ['You should divide: 8 ÷ (1/2) = 16 cm.', 'The height cannot be 16 cm in a triangle with sides 8 cm. The fault is the value 1/2, not the multiplying.'],
        ['sin 60° = √3/3, so the height is 8√3/3 ≈ 4.62 cm.', '√3/3 is tan 30°. The sine of 60° is √3/2.']] }
  ];

  /* vary the position of the right answer */
  [[1, 2], [3, 0], [6, 3], [7, 0]].forEach(([i, to]) => { const ch = PR[i].ch; ch.splice(to, 0, ch.splice(ch.findIndex(x => x[2]), 1)[0]); });

  register({
    id: 'exact-trig-values-and-special-triangles', level: 'school',
    title: 'Exact trig values and special triangles',
    blurb: 'Build the exact values of sine, cosine and tangent for 30, 45 and 60 degrees, then use them to cut hexagons, nuts and roof trusses into triangles.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 1.7;
      const V = [0, 1, 2, 3, 4, 5].map(k => [Math.cos(k * PI / 3), Math.sin(k * PI / 3)]);
      p.path(V, { fill: alpha(pal.yellow, .08), stroke: pal.blue, width: 2.5, close: true });
      V.forEach(v => p.path([[0, 0], v], { stroke: alpha(pal.violet, .8), width: 1.6 }));
      p.path([[0, 0], V[1], V[2]], { fill: alpha(pal.yellow, .22), close: true });
      p.path([[0, 0], [0, R3 / 2]], { stroke: pal.red, width: 3 });
      p.path([[V[1][0], V[1][1]], [0, R3 / 2]], { stroke: pal.green, width: 3 });
      p.label('√3/2', 0, R3 / 4, { size: 15, italic: false, color: pal.red, dx: -6, align: 'right' });
    },
    hook: String.raw`A hexagonal nut has sides of \(10\) mm. Which wrench fits it, and can you find the size without measuring, using only the angles \(30^\circ\), \(45^\circ\) and \(60^\circ\)?`,
    steps: [
      { title: 'Build the exact-value table',
        text: String.raw`<p>Every cell comes from reading a triangle. First predict: in a \(60^\circ\) triangle, which is bigger, \(\sin 60^\circ\) or \(\cos 60^\circ\)? Then pick an angle and a ratio, read it off the triangle, and choose the exact value.</p><p>Fill all nine cells. Then switch on the memory pattern.</p>`,
        set: { mode: 'tbl', ang: 60, fn: 'sin', rq: 1 } },
      { title: 'Exact or decimal?',
        text: String.raw`<p>A ladder leans at \(60^\circ\) and reaches \(6\) m up a wall. Choose the equation, then choose how to answer.</p><p>Keep \(\sqrt3\) as it is: \(L = 6 \div \tfrac{\sqrt3}{2} = 4\sqrt3\) m. Round only at the end: about \(6.93\) m. Use the rounding slider to see what early rounding does.</p>`,
        set: { mode: 'exact', lang: 60, hgt: 6 } },
      { title: 'Cut it into special triangles',
        text: String.raw`<p>A hexagonal nut has sides of \(10\) mm. Predict the distance between two opposite flat sides, then cut the hexagon into six triangles. Each one is equilateral. Cut one down the middle and a 30-60-90 triangle appears.</p><p>Answer each question. Then try the other figures.</p>`,
        set: { mode: 'cut', fig: 'hex', rq: 1 } },
      { title: 'Give the reasons',
        text: String.raw`<p>In a proof every step needs a reason. Choose the reason for each step to show that the height of an equilateral triangle cuts the base in half. Then switch to the hexagon argument.</p><p>Last, open <b>Bridge: the unit circle</b>. The angles \(30^\circ\), \(45^\circ\) and \(60^\circ\) are the first points on it.</p>`,
        set: { mode: 'why', arg: 0 } }
    ],
    formal: String.raw`
      <p>The earlier lesson found the side ratios of the two special triangles. Here we use them to get exact trigonometric values, and to cut other figures into those triangles.</p>
      <h3>The exact-value table</h3>
      <p>Recall the two triangles. The 45-45-90 triangle has sides \(1, 1, \sqrt2\). The 30-60-90 triangle has sides \(1, \sqrt3, 2\), with the short leg across from \(30^\circ\) and the long leg across from \(60^\circ\). For an acute angle \(\theta\), \(\sin\theta\) is opposite over hypotenuse, \(\cos\theta\) is adjacent over hypotenuse, and \(\tan\theta\) is opposite over adjacent. Reading the triangles gives
      \[ \begin{array}{c|ccc} \theta & 30^\circ & 45^\circ & 60^\circ \\ \hline \sin\theta & \tfrac12 & \tfrac{\sqrt2}{2} & \tfrac{\sqrt3}{2} \\ \cos\theta & \tfrac{\sqrt3}{2} & \tfrac{\sqrt2}{2} & \tfrac12 \\ \tan\theta & \tfrac{\sqrt3}{3} & 1 & \sqrt3 \end{array} \]
      <b>A memory pattern.</b> Write the sines as \(\tfrac{\sqrt1}{2}, \tfrac{\sqrt2}{2}, \tfrac{\sqrt3}{2}\) (remember that \(\sqrt1 = 1\)). The cosines are the same list backwards, because the sine of an angle equals the cosine of its complement, \(\sin\theta = \cos(90^\circ-\theta)\). The tangent is the sine divided by the cosine, \(\tan\theta = \sin\theta/\cos\theta\), because both have the same hypotenuse and it cancels.</p>
      <p><b>Rationalizing.</b> The tangent of \(30^\circ\) is \(1/\sqrt3\). To remove the root from the bottom, multiply top and bottom by \(\sqrt3\); this multiplies the fraction by \(1\), so its value does not change:
      \[ \frac{1}{\sqrt3} = \frac{1\cdot\sqrt3}{\sqrt3\cdot\sqrt3} = \frac{\sqrt3}{3} \approx 0.577. \]
      The same step turns \(1/\sqrt2\) into \(\sqrt2/2\). Forgetting to multiply the top is a common slip.</p>
      <h3>Exact versus decimal</h3>
      <p>An exact value such as \(4\sqrt3\) records the number with no error. A decimal such as \(6.93\) is an approximation. Every rounding step adds a little error, and later steps can magnify it. So keep \(\sqrt2\) and \(\sqrt3\) in the working, and round once, at the end, to the precision the situation needs. For the ladder, \(\sin 60^\circ = 6/L\) gives
      \[ L = \frac{6}{\sqrt3/2} = \frac{12}{\sqrt3} = \frac{12\sqrt3}{3} = 4\sqrt3 \approx 6.93 \text{ m}. \]
      If \(\sin 60^\circ\) is rounded to \(0.87\) first, the result is \(6/0.87 \approx 6.90\) m, already off by about \(3\) cm.</p>
      <h3>Figures cut into special triangles</h3>
      <p><b>Equilateral triangle of side \(s\).</b> The height splits it into two 30-60-90 triangles with hypotenuse \(s\) and short leg \(s/2\). The height is the long leg, \(h = \tfrac{s}{2}\sqrt3 = \tfrac{s\sqrt3}{2}\). The area is
      \[ \tfrac12\cdot s\cdot\tfrac{s\sqrt3}{2} = \tfrac{\sqrt3}{4}s^2. \]</p>
      <p><b>Regular hexagon of side \(s\).</b> Lines from the centre make six equilateral triangles of side \(s\) (proved below). So the area is
      \[ 6\cdot\tfrac{\sqrt3}{4}s^2 = \tfrac{3\sqrt3}{2}s^2. \]
      Two opposite flat sides are two triangle heights apart: \(2\cdot\tfrac{s\sqrt3}{2} = s\sqrt3\). A nut with sides \(10\) mm needs a \(10\sqrt3 \approx 17.3\) mm wrench. Opposite corners are farther apart, \(2s = 20\) mm.</p>
      <p><b>Rectangle with a \(30^\circ\) diagonal.</b> If the short side is \(s\), the diagonal is \(2s\) (the hypotenuse is twice the side across from \(30^\circ\)) and the long side is \(s\sqrt3\). The area is \(s\cdot s\sqrt3 = s^2\sqrt3\).</p>
      <p><b>Roof truss.</b> An isosceles triangle with base \(b\) and base angles \(30^\circ\) is cut along its axis into two 30-60-90 triangles. The half-span \(b/2\) touches the \(30^\circ\) angle, so it is the long leg. The rise is the short leg, \(\tfrac{b}{2}\div\sqrt3 = \tfrac{b\sqrt3}{6}\), and the rafter is the hypotenuse, \(\tfrac{b\sqrt3}{3}\). For \(b = 12\) m: rise \(2\sqrt3 \approx 3.46\) m, rafter \(4\sqrt3 \approx 6.93\) m.</p>
      <p><b>Square of side \(s\).</b> A diagonal makes two 45-45-90 triangles, so the diagonal is \(s\sqrt2\).</p>
      <h3>Why the pieces are special: two short arguments</h3>
      <p><b>The height of an equilateral triangle bisects the base.</b> In triangle \(ABC\), let \(AD\) be the height, so \(\angle ADB = \angle ADC = 90^\circ\). Then \(AB = AC\) (equilateral) and \(AD = AD\) (shared). Two right triangles with equal hypotenuses and one equal leg are congruent (hypotenuse-leg). Corresponding parts of congruent triangles are equal, so \(BD = DC\) and \(\angle BAD = \angle CAD = 30^\circ\).</p>
      <p><b>The six triangles in a regular hexagon are equilateral.</b> The six angles at the centre \(O\) are equal and add to \(360^\circ\), so each is \(60^\circ\). \(OA\) and \(OB\) are radii, so \(OA = OB\) and the base angles of triangle \(OAB\) are equal. They add to \(180^\circ - 60^\circ = 120^\circ\), so each is \(60^\circ\). Three equal angles give three equal sides: \(OA = OB = AB = s\).</p>
      <h3>Where this leads: the unit circle</h3>
      <p>Take a right triangle with hypotenuse \(1\) and angle \(\theta\) at the origin. Its legs are \(\cos\theta\) (across) and \(\sin\theta\) (up), so its far corner is the point \((\cos\theta, \sin\theta)\) on the circle of radius \(1\). The special angles give
      \[ 30^\circ: \left(\tfrac{\sqrt3}{2}, \tfrac12\right), \qquad 45^\circ: \left(\tfrac{\sqrt2}{2}, \tfrac{\sqrt2}{2}\right), \qquad 60^\circ: \left(\tfrac12, \tfrac{\sqrt3}{2}\right). \]
      Each point satisfies \(x^2 + y^2 = 1\), for example \(\tfrac34 + \tfrac14 = 1\). The <a href="#/viz/the-unit-circle-and-trig-waves">unit circle lesson</a> continues around the whole circle, past \(90^\circ\).</p>`,
    check: [
      { q: String.raw`In a 30-60-90 triangle the short leg is \(1\), the long leg is \(\sqrt3\) and the hypotenuse is \(2\). Which statement about \(\sin 60^\circ\) and \(\cos 60^\circ\) is true?`,
        choices: [String.raw`They are equal, because both use the same triangle.`,
          String.raw`\(\sin 60^\circ = \tfrac12\) and \(\cos 60^\circ = \tfrac{\sqrt3}{2}\), so cosine is bigger.`,
          String.raw`\(\sin 60^\circ = \tfrac{\sqrt3}{2}\) and \(\cos 60^\circ = \tfrac12\), so sine is bigger.`,
          String.raw`\(\sin 60^\circ = \tfrac{\sqrt3}{3}\) and \(\cos 60^\circ = \tfrac12\), so sine is bigger.`], answer: 2,
        why: String.raw`The side across from \(60^\circ\) is the long leg \(\sqrt3\), so \(\sin 60^\circ = \sqrt3/2 \approx 0.866\). The side touching \(60^\circ\) is the short leg \(1\), so \(\cos 60^\circ = 1/2\). The values \(\tfrac12\) and \(\tfrac{\sqrt3}{2}\) belong to \(30^\circ\) the other way round, and \(\sqrt3/3\) is \(\tan 30^\circ\).`,
        hint: 'Which leg is across from the 60° angle, and which one touches it?' },
      { q: String.raw`A regular hexagonal nut has sides of \(6\) mm. It is made of six equilateral triangles with side \(6\) mm. Find the wrench size (the distance between two opposite flat sides) and the area of one face. Which pair is correct?`,
        choices: [String.raw`wrench \(12\) mm, area \(54\sqrt3 \approx 93.53\) mm²`,
          String.raw`wrench \(6\sqrt3 \approx 10.39\) mm, area \(54\sqrt3 \approx 93.53\) mm²`,
          String.raw`wrench \(6\sqrt3 \approx 10.39\) mm, area \(108\sqrt3 \approx 187.06\) mm²`,
          String.raw`wrench \(6\sqrt3 \approx 10.39\) mm, area \(54\) mm²`], answer: 1,
        why: String.raw`The height of one triangle is \(\tfrac{6\sqrt3}{2} = 3\sqrt3\), so the flats are \(2\times 3\sqrt3 = 6\sqrt3 \approx 10.39\) mm apart. One triangle has area \(\tfrac{\sqrt3}{4}\cdot 36 = 9\sqrt3\), and six of them give \(54\sqrt3 \approx 93.53\) mm². The wrench size \(12\) is the distance between opposite corners. The area \(108\sqrt3\) forgets the \(\tfrac12\) in each triangle, and \(54\) drops the root.`,
        hint: 'Find the height of one triangle first. Then use two heights for the wrench and six triangles for the area.' },
      { q: String.raw`A student writes: "\(\tan 30^\circ = \dfrac{1}{\sqrt3}\). To remove the root, multiply the bottom by \(\sqrt3\): \(\dfrac{1}{\sqrt3\cdot\sqrt3} = \dfrac13\). So \(\tan 30^\circ = \dfrac13\)." Which statement is correct?`,
        choices: [String.raw`The work is correct, and \(\tan 30^\circ = \tfrac13\).`,
          String.raw`You cannot remove a root from a bottom, so \(\tfrac{1}{\sqrt3}\) is the only correct form.`,
          String.raw`The root should be multiplied by \(2\), so \(\tan 30^\circ = \tfrac{\sqrt3}{2}\).`,
          String.raw`The top must also be multiplied by \(\sqrt3\), so \(\tan 30^\circ = \tfrac{\sqrt3}{3} \approx 0.577\).`], answer: 3,
        why: String.raw`Multiplying only the bottom changes the value of the fraction. Multiplying top and bottom by \(\sqrt3\) multiplies by \(1\): \(\tfrac{1\cdot\sqrt3}{\sqrt3\cdot\sqrt3} = \tfrac{\sqrt3}{3}\). Check with a decimal: \(\tan 30^\circ \approx 0.577\), but \(\tfrac13 \approx 0.333\). The form \(\tfrac{1}{\sqrt3}\) is also correct, but it is not rationalized.`,
        hint: 'Compare the decimals: is tan 30° close to 0.33 or to 0.58? Remember the triangle has short leg 1 and long leg √3.' }
    ],
    links: { prereq: ['special-right-triangles-and-trigonometry', 'area-by-decomposition'], next: ['the-unit-circle-and-trig-waves'],
      related: ['trigonometric-ratios-sine-cosine-tangent', 'angles-in-triangles-and-polygons', 'square-roots-and-irrational-numbers', 'distance-and-the-pythagorean-theorem', 'pythagorean-theorem', 'radians-the-circles-own-angle-unit'] },

    mount({ stage, controls: C }) {
      const st = { th: 60, cut: 0, rd: 5 };
      const V = { mode: 'tbl', ang: 60, fn: 'sin', pat: false, hgt: 6, lang: 60, fig: 'hex', arg: 0 };
      const cells = {}, CS = {};
      const PD = { tbl: { done: false, pick: -1 }, hex: { done: false, pick: -1 } };
      const LAD = { stg: 0, fb: '', wrong: [] };
      const SZ = {}; for (const k of Object.keys(FIGS)) SZ[k] = FIGS[k].def;
      const FS = {}; for (const k of Object.keys(FIGS)) FS[k] = { stg: 0, fb: '', wrong: [] };
      const WS = ARGS.map(() => ({ stg: 0, fb: '', wrong: [] }));
      const PS = { i: 0, solved: PR.map(() => false), first: PR.map(() => false), wrong: PR.map(() => []), fb: PR.map(() => '') };
      let cancel = () => {}, gridHit = [];
      const P = new Plane(stage, { span: 5 });

      /* ---------- drawing helpers ---------- */
      const fsz = p => clamp(Math.min(p.w, p.h) * .035, 15, 20);
      const boxIn = (p, x0, y0, x1, y1, R, pd) => {
        const l = pd.l, r = pd.r, t = pd.t, b = pd.b;
        const sc = Math.max(1e-3, Math.min((R.w - l - r) / (x1 - x0), (R.h - t - b) / (y1 - y0)));
        p.span = Math.min(p.w, p.h) / (2 * sc);
        const px = R.x + l + (R.w - l - r) / 2, py = R.y + t + (R.h - t - b) / 2;
        p.cx = (x0 + x1) / 2 - (px - p.w / 2) / sc; p.cy = (y0 + y1) / 2 + (py - p.h / 2) / sc;
      };
      const full = p => ({ x: 0, y: 0, w: p.w, h: p.h });
      const rmark = (p, vx, vy, ux, uy, wx, wy) => {
        const r = 14 / p.scale;
        p.path([[vx + ux * r, vy + uy * r], [vx + (ux + wx) * r, vy + (uy + wy) * r], [vx + wx * r, vy + wy * r]], { stroke: p.pal.text, width: 2 });
      };
      const arc = (p, vx, vy, rpx, a0, a1, col, w = 3) => {
        const c = p.ctx; c.beginPath(); c.arc(p.X(vx), p.Y(vy), rpx, -a0, -a1, true);
        c.strokeStyle = col; c.lineWidth = w; c.setLineDash([]); c.lineCap = 'round'; c.stroke();
      };
      const angLab = (p, text, vx, vy, a0, a1, rpx, col, size) => {
        const m = (a0 + a1) / 2;
        p.label(text, vx, vy, { dx: Math.cos(m) * rpx, dy: -Math.sin(m) * rpx, color: col, size, italic: false });
      };
      const lab = (p, text, x, y, col, o = {}) => p.label(text, x, y, { size: o.size || fsz(p), italic: false, color: col, dx: o.dx || 0, dy: o.dy || 0, align: o.align || 'center', alpha: o.alpha ?? 1 });
      const lab2 = (p, lines, x, y, col, o = {}) => lines.forEach((t, i) => lab(p, t, x, y, col, { ...o, dy: (o.dy || 0) + (i - (lines.length - 1) / 2) * fsz(p) * 1.05 }));
      const tick = (p, A, B, n, col) => {
        const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, L = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1;
        const ux = (B[0] - A[0]) / L, uy = (B[1] - A[1]) / L, nx = -uy, ny = ux, s = 7 / p.scale, g = 5 / p.scale;
        for (let i = 0; i < n; i++) {
          const o = (i - (n - 1) / 2) * g;
          p.path([[mx + ux * o + nx * s, my + uy * o + ny * s], [mx + ux * o - nx * s, my + uy * o - ny * s]], { stroke: col, width: 2.2 });
        }
      };
      const capt = (c, p, lines) => {
        c.font = '500 14px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle';
        lines.filter(Boolean).forEach((t, i) => { c.fillStyle = p.pal.text; c.fillText(t, 14, 22 + i * 19); });
      };
      const tx = (c, p, text, x, y, size, col, weight = 500, align = 'center') => {
        c.font = weight + ' ' + size + 'px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif'; c.textAlign = align; c.textBaseline = 'middle';
        c.fillStyle = col; c.fillText(text, x, y);
      };
      const rrect = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };

      /* ---------- the triangle for the table (and practice) ---------- */
      const drawTri = (c, p, a, fn, R, both) => {
        const pal = p.pal, T = TRI[a], ls = fsz(p), hi = k => !fn || (fn === 'sin' ? k !== 'a' : fn === 'cos' ? k !== 'o' : k !== 'h');
        const A = [0, 0], Cc = [T.a, 0], B = [T.a, T.o], cen = [T.a * .66, T.o * .33];
        boxIn(p, 0, 0, T.a, T.o, R, { l: 28, r: 96, t: 66, b: 56 });
        p.path([A, Cc, B], { fill: alpha(pal.yellow, .16), close: true });
        p.path([A, Cc], { stroke: alpha(pal.green, hi('a') ? 1 : .3), width: hi('a') ? 5 : 2.5 });
        p.path([Cc, B], { stroke: alpha(pal.red, hi('o') ? 1 : .3), width: hi('o') ? 5 : 2.5 });
        p.path([A, B], { stroke: alpha(pal.blue, hi('h') ? 1 : .3), width: hi('h') ? 5 : 2.5 });
        rmark(p, Cc[0], 0, -1, 0, 0, 1);
        const th = Math.atan2(T.o, T.a), rr = 34;
        arc(p, 0, 0, rr, 0, th, pal.text, 3); angLab(p, 'θ', 0, 0, 0, th, rr + 22, pal.text, ls + 3);
        const b0 = PI + th, b1 = 1.5 * PI;
        if (both) { arc(p, B[0], B[1], 28, b0, b1, pal.text, 2.5); angLab(p, (90 - a) + '°', B[0], B[1], b0, b1, 52, pal.text, ls); }
        const ed = (P1, P2, lines, col, off) => {
          const mx = (P1[0] + P2[0]) / 2, my = (P1[1] + P2[1]) / 2;
          let nx = -(P2[1] - P1[1]), ny = P2[0] - P1[0]; const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
          if (nx * (mx - cen[0]) + ny * (my - cen[1]) < 0) { nx = -nx; ny = -ny; }
          const hw = Math.max(...lines.map(t => t.length)) * ls * .24, o = off + Math.abs(ny) * (lines.length - 1) * ls / 2 + Math.abs(nx) * hw;
          lines.forEach((t, i) => lab(p, t, mx, my, col, { dx: nx * o, dy: -ny * o + (i - (lines.length - 1) / 2) * ls }));
        };
        ed(A, Cc, ['adjacent', T.at], pal.green, 24);
        ed(Cc, B, ['opposite', T.ot], pal.red, 14);
        ed(A, B, ['hypotenuse', T.ht], pal.blue, 14);
        lab(p, 'A', 0, 0, pal.muted, { dx: -14, dy: 14 }); lab(p, 'B', B[0], B[1], pal.muted, { dx: 14, dy: -12 }); lab(p, 'C', Cc[0], 0, pal.muted, { dx: 14, dy: 14 });
        if (fn) tx(c, p, fn + ' θ = ' + DEF[fn], R.x + 14, R.y + 16, 15, pal.text, 600, 'left');
        tx(c, p, 'θ = ' + a + '° at corner A, ' + T.name + ' triangle', R.x + 14, R.y + 36, 13.5, pal.muted, 500, 'left');
      };

      /* ---------- the grid ---------- */
      const drawGrid = (c, p, R) => {
        const pal = p.pal, W = R.w - 24, x0 = R.x + 12, y0 = R.y + 6, hdr = Math.min(34, R.h * .14), c0 = Math.min(58, W * .17);
        const cw = (W - c0) / 3, rh = (R.h - 12 - hdr) / 3;
        gridHit = [];
        c.save();
        ANG.forEach((a, j) => tx(c, p, a + '°', x0 + c0 + cw * (j + .5), y0 + hdr / 2, 16, pal.text, 700));
        FNS.forEach((f, i) => {
          tx(c, p, f, x0 + c0 / 2, y0 + hdr + rh * (i + .5), 17, pal.text, 700);
          ANG.forEach((a, j) => {
            const x = x0 + c0 + cw * j + 3, y = y0 + hdr + rh * i + 3, w = cw - 6, hh = rh - 6, k = f + a, on = V.fn === f && V.ang === a;
            gridHit.push({ x, y, w, h: hh, f, a });
            rrect(c, x, y, w, hh, 8);
            c.fillStyle = cells[k] ? alpha(pal.yellow, .2) : alpha(pal.text, .04); c.fill();
            c.strokeStyle = on ? pal.yellow : pal['grid-strong']; c.lineWidth = on ? 3.5 : 1.2; c.stroke();
            if (cells[k]) {
              const ex = TV[f][a][0], dc = d3(TV[f][a][1]);
              const fs = clamp(Math.min(w * .26, hh * .36), 15, 24);
              const showPat = V.pat && PAT[f];
              tx(c, p, ex, x + w / 2, y + hh * (showPat ? .3 : .38), fs, pal.text, 700);
              tx(c, p, '≈ ' + dc, x + w / 2, y + hh * (showPat ? .58 : .72), clamp(fs * .68, 13, 16), pal.muted, 500);
              if (showPat) tx(c, p, PAT[f][a], x + w / 2, y + hh * .84, clamp(fs * .62, 12.5, 15), pal.violet, 600);
            } else tx(c, p, '?', x + w / 2, y + hh / 2, 22, pal.muted, 600);
          });
        });
        c.restore();
      };

      /* ---------- the ladder ---------- */
      const ladNums = () => {
        const a = V.lang, h = V.hgt, s = a === 60 ? R3 / 2 : R2 / 2;
        return { a, h, s, L: h / s, ex: a === 60 ? rt(2 * h / 3, 3) : rt(h, 2), sx: a === 60 ? '√3/2' : '√2/2', s2: +s.toFixed(2) };
      };
      const drawLadder = (c, p, a, h, solved, tgt) => {
        const pal = p.pal, ls = fsz(p), B = a * D2R, hh = h, d = h / Math.tan(B), L = h / Math.sin(B);
        boxIn(p, 0, 0, d, hh * 1.1, full(p), { l: 70, r: 40, t: 40, b: 70 });
        p.path([[0, 0], [0, hh * 1.08]], { stroke: pal['grid-strong'], width: 8 });
        p.path([[-.12 * d, 0], [d * 1.25, 0]], { stroke: pal['grid-strong'], width: 2 });
        p.path([[0, 0], [d, 0]], { stroke: alpha(pal.green, .7), width: 3, dash: [7, 6] });
        p.path([[d, 0], [0, hh]], { stroke: pal.blue, width: 5 });
        p.path([[0, 0], [0, hh]], { stroke: pal.red, width: 4 });
        rmark(p, 0, 0, 1, 0, 0, 1);
        arc(p, d, 0, 38, PI - B, PI, pal.yellow, 3.5); angLab(p, a + '°', d, 0, PI - B, PI, 68, pal.text, ls);
        lab(p, 'wall', 0, hh * 1.08, pal.muted, { dx: 12, dy: -4, align: 'left' });
        lab(p, 'ground', d * .9, 0, pal.muted, { dy: 48 });
        lab2(p, ['height', h + ' m'], 0, hh / 2, pal.red, { dx: -12, align: 'right' });
        const mx = d / 2, my = hh / 2;
        lab2(p, ['ladder', solved ? val(...(a === 60 ? [2 * h / 3, 3] : [h, 2]), 'm') : (tgt === false ? '' : 'L = ?')], mx, my, pal.blue, { dx: 16, dy: -16, align: 'left' });
        lab(p, 'distance from wall', d / 2, 0, pal.green, { dy: 24, alpha: .9 });
      };

      /* ---------- the five figures ---------- */
      const drawFig = (c, p, fig, s, o) => {
        const pal = p.pal, ls = fsz(p), F = FIGS[fig], cu = o.cut, lv = o.lvl, rev = o.rev, tgt = o.tgt, R = full(p);
        const ask = (i, text, hide) => rev[i] ? text : (tgt === i && !hide ? '?' : '');
        if (fig === 'eq') {
          const H = s * R3 / 2, A = [-s / 2, 0], B = [s / 2, 0], Cp = [0, H];
          boxIn(p, -s / 2, 0, s / 2, H, R, { l: 30, r: 30, t: 52, b: 70 });
          p.path([A, B, Cp], { fill: alpha(pal.yellow, .07), stroke: pal.blue, width: 4.5, close: true });
          p.path([[0, 0], B, Cp], { fill: alpha(pal.yellow, .3 * cu), close: true });
          p.path([[0, 0], Cp], { stroke: alpha(pal.violet, cu), width: 4.5 });
          if (cu > .6) {
            rmark(p, 0, 0, 1, 0, 0, 1);
            arc(p, B[0], B[1], 30, 2 * PI / 3, PI, pal.text, 2.5); angLab(p, '60°', B[0], B[1], 2 * PI / 3, PI, 56, pal.text, ls);
            arc(p, 0, H, 34, -PI / 2, -PI / 3, pal.text, 2.5); angLab(p, '30°', 0, H, -PI / 2, -PI / 3, 62, pal.text, ls);
          }
          lab(p, 'side s = ' + s + ' cm', 0, 0, pal.muted, { dy: 54 });
          if (lv >= 2) {
            lab2(p, ['short leg', s / 2 + ' cm'], s / 4, 0, pal.green, { dy: 26 });
            lab2(p, ['hypotenuse', s + ' cm'], s * .25, H / 2, pal.blue, { dx: 18, dy: -4, align: 'left' });
            const t = ask(0, val(s / 2, 3, 'cm'), 0);
            if (t) lab2(p, ['height', t], 0, H / 2, pal.red, { dx: -10, dy: 6, align: 'right' }); else lab(p, 'long leg = height', 0, H / 2, pal.red, { dx: -10, align: 'right' });
          }
          capt(c, p, F.cap(s, rev).concat(tgt === 1 && !rev[1] ? ['area = ?'] : []));
        } else if (fig === 'hex') {
          const V6 = [0, 1, 2, 3, 4, 5].map(k => [s * Math.cos(k * PI / 3), s * Math.sin(k * PI / 3)]), H = s * R3 / 2;
          boxIn(p, -s, -H, s, H, R, { l: 40, r: 40, t: 56, b: 64 });
          p.path(V6, { fill: alpha(pal.yellow, .06), stroke: pal.blue, width: 4.5, close: true });
          if (cu > 0) {
            V6.forEach(v => p.path([[0, 0], v], { stroke: alpha(pal.violet, cu), width: 2.6 }));
            p.path([[0, 0], V6[1], V6[2]], { fill: alpha(pal.yellow, .3 * cu), close: true });
            if (cu > .6) { arc(p, 0, 0, 26, PI / 3, 2 * PI / 3, pal.text, 3); lab(p, '60°', 0, 0, pal.text, { dx: -22, dy: -50, size: ls }); }
            if (cu > .6) p.dot(0, 0, 4, pal.text);
          }
          lab(p, 'side s = ' + s + ' mm', 0, H, pal.muted, { dy: -22 });
          if (lv >= 2 && (tgt === 0 || rev[0])) {
            p.arrow(0, -H, 0, H, alpha(pal.red, .9), 3); p.arrow(0, H, 0, -H, alpha(pal.red, .9), 3);
            lab(p, 'flat to flat: ' + (rev[0] ? val(s, 3, 'mm') : '?'), 0, -H, pal.red, { dy: 26 });
          }
          if (lv >= 2) {
            lab(p, 'radius ' + s, V6[2][0] / 2, V6[2][1] / 2, pal.violet, { dx: -6, dy: 0, align: 'right', alpha: cu });
          }
          capt(c, p, F.cap(s, rev).concat(tgt === 1 && !rev[1] ? ['area = ?'] : []));
        } else if (fig === 'rect') {
          const L = s * R3;
          boxIn(p, 0, 0, L, s, R, { l: 40, r: 40, t: 56, b: 78 });
          p.path([[0, 0], [L, 0], [L, s], [0, s]], { fill: alpha(pal.yellow, .06), stroke: pal.blue, width: 4.5, close: true });
          p.path([[0, 0], [L, 0], [L, s]], { fill: alpha(pal.yellow, .3 * cu), close: true });
          p.path([[0, 0], [L, s]], { stroke: alpha(pal.violet, cu), width: 4.5 });
          if (cu > .6) {
            rmark(p, L, 0, -1, 0, 0, 1);
            arc(p, 0, 0, 52, 0, PI / 6, pal.text, 2.5); angLab(p, '30°', 0, 0, 0, PI / 6, 82, pal.text, ls);
            arc(p, L, s, 24, 7 * PI / 6, 3 * PI / 2, pal.text, 2.5); angLab(p, '60°', L, s, 7 * PI / 6, 3 * PI / 2, 50, pal.text, ls);
          }
          lab2(p, ['short side', s + ' cm'], L, s / 2, pal.red, { dx: -12, align: 'right' });
          if (lv >= 2) {
            lab(p, 'diagonal ' + 2 * s + ' cm', L / 2, s / 2, pal.blue, { dx: -8, dy: -26, align: 'right' });
            const t = ask(0, val(s, 3, 'cm'), 0);
            lab2(p, ['long side', t || '?'], L / 2, 0, pal.green, { dy: 34 });
          } else lab(p, 'long side', L / 2, 0, pal.green, { dy: 26 });
          capt(c, p, (lv < 1 ? ['the diagonal makes a 30° angle with the long side'] : []).concat(F.cap(s, rev), tgt === 1 && !rev[1] ? ['area = ?'] : []));
        } else if (fig === 'truss') {
          const b = s, hr = b * R3 / 6;
          boxIn(p, -b / 2, 0, b / 2, hr, R, { l: 30, r: 30, t: 70, b: 80 });
          p.path([[-b / 2, 0], [b / 2, 0], [0, hr]], { fill: alpha(pal.yellow, .07), stroke: pal.blue, width: 4.5, close: true });
          p.path([[0, 0], [b / 2, 0], [0, hr]], { fill: alpha(pal.yellow, .3 * cu), close: true });
          p.path([[0, 0], [0, hr]], { stroke: alpha(pal.violet, cu), width: 4.5 });
          if (cu > .6) {
            rmark(p, 0, 0, 1, 0, 0, 1);
            arc(p, b / 2, 0, 40, 5 * PI / 6, PI, pal.text, 2.5); angLab(p, '30°', b / 2, 0, 5 * PI / 6, PI, 70, pal.text, ls);
          }
          lab(p, 'span ' + b + ' m', 0, 0, pal.muted, { dy: 56 });
          if (lv >= 2) {
            lab(p, 'half-span ' + b / 2 + ' m', b / 4, 0, pal.green, { dy: 28 });
            const t = ask(0, val(b / 6, 3, 'm'), 0), r2 = ask(1, val(b / 3, 3, 'm'), 0);
            lab2(p, ['rise', t || '?'], 0, hr / 2, pal.red, { dx: -10, align: 'right' });
            lab2(p, ['rafter', r2 || (tgt === 1 ? '?' : '')], b / 4, hr / 2, pal.blue, { dx: 12, dy: -26, align: 'left' });
          }
        } else {
          boxIn(p, 0, 0, s, s, R, { l: 40, r: 56, t: 60, b: 66 });
          p.path([[0, 0], [s, 0], [s, s], [0, s]], { fill: alpha(pal.yellow, .06), stroke: pal.blue, width: 4.5, close: true });
          p.path([[0, 0], [s, 0], [s, s]], { fill: alpha(pal.yellow, .3 * cu), close: true });
          p.path([[0, 0], [s, s]], { stroke: alpha(pal.violet, cu), width: 4.5 });
          if (cu > .6) {
            rmark(p, s, 0, -1, 0, 0, 1);
            arc(p, 0, 0, 44, 0, PI / 4, pal.text, 2.5); angLab(p, '45°', 0, 0, 0, PI / 4, 72, pal.text, ls);
            arc(p, s, s, 28, 5 * PI / 4, 3 * PI / 2, pal.text, 2.5); angLab(p, '45°', s, s, 5 * PI / 4, 3 * PI / 2, 54, pal.text, ls);
          }
          lab(p, 'side s = ' + s + ' cm', s / 2, 0, pal.muted, { dy: 28 });
          lab(p, 'side', s, s / 2, pal.muted, { dx: 10, align: 'left' });
          if (lv >= 2) {
            const t = ask(0, val(s, 2, 'cm'), 0);
            lab2(p, ['diagonal', t || '?'], s / 2, s / 2, pal.blue, { dx: -10, dy: -22, align: 'right' });
          }
          capt(c, p, F.cap(s, rev).concat(tgt === 1 && !rev[1] ? ['one triangle: ?'] : []));
        }
      };

      /* ---------- the proofs ---------- */
      const drawWhy = (c, p, ai, n) => {
        const pal = p.pal, ls = fsz(p), col = pal.violet;
        if (ai === 0) {
          const A = [0, R3], B = [-1, 0], Cp = [1, 0], D = [0, 0];
          boxIn(p, -1, 0, 1, R3, full(p), { l: 50, r: 50, t: 52, b: 64 });
          p.path([A, B, Cp], { fill: alpha(pal.yellow, .07), stroke: pal.blue, width: 4.5, close: true });
          if (n >= 4) { p.path([A, B, D], { fill: alpha(pal.yellow, .26), close: true }); p.path([A, D, Cp], { fill: alpha(pal.green, .2), close: true }); }
          p.path([A, D], { stroke: col, width: 4, dash: [9, 6] });
          if (n >= 1) { rmark(p, 0, 0, -1, 0, 0, 1); rmark(p, 0, 0, 1, 0, 0, 1); }
          if (n >= 2) { tick(p, A, B, 1, pal.text); tick(p, A, Cp, 1, pal.text); }
          if (n >= 3) tick(p, A, D, 2, pal.text);
          if (n >= 5) {
            tick(p, B, D, 3, pal.text); tick(p, D, Cp, 3, pal.text);
            arc(p, A[0], A[1], 36, -PI / 2 - PI / 6, -PI / 2, pal.text, 2.5); arc(p, A[0], A[1], 36, -PI / 2, -PI / 2 + PI / 6, pal.text, 2.5);
            lab(p, '30°', A[0], A[1], pal.text, { dx: -26, dy: 56 }); lab(p, '30°', A[0], A[1], pal.text, { dx: 26, dy: 56 });
          }
          lab(p, 'A', A[0], A[1], pal.text, { dy: -18, size: ls + 2 }); lab(p, 'B', B[0], B[1], pal.text, { dx: -14, dy: 12, size: ls + 2 });
          lab(p, 'C', Cp[0], Cp[1], pal.text, { dx: 14, dy: 12, size: ls + 2 }); lab(p, 'D', 0, 0, pal.text, { dy: 20, size: ls + 2 });
          lab(p, 'AD is the height', 0, R3 / 2, col, { dx: 8, dy: 0, align: 'left', size: ls - 1, alpha: n < 5 ? 1 : 0 });
          lab(p, 'AB = AC = BC', 0, 0, pal.muted, { dy: 46, alpha: n >= 2 ? 1 : 0 });
        } else {
          const V6 = [0, 1, 2, 3, 4, 5].map(k => [Math.cos(k * PI / 3), Math.sin(k * PI / 3)]), O = [0, 0], Aa = V6[0], Bb = V6[1];
          boxIn(p, -1, -R3 / 2, 1, R3 / 2, full(p), { l: 60, r: 60, t: 56, b: 56 });
          p.path(V6, { fill: alpha(pal.yellow, .05), stroke: pal.blue, width: 4.5, close: true });
          V6.forEach(v => p.path([O, v], { stroke: alpha(col, .5), width: 2 }));
          if (n >= 5) p.path([O, Aa, Bb], { fill: alpha(pal.yellow, .3), close: true });
          p.path([O, Aa], { stroke: col, width: 3.5 }); p.path([O, Bb], { stroke: col, width: 3.5 });
          if (n >= 1) { arc(p, 0, 0, 30, 0, PI / 3, pal.text, 3); if (n < 4) angLab(p, '60°', 0, 0, 0, PI / 3, 56, pal.text, ls); }
          if (n >= 2) { tick(p, O, Aa, 1, pal.text); tick(p, O, Bb, 1, pal.text); }
          if (n >= 3) {
            arc(p, Aa[0], Aa[1], 30, 2 * PI / 3, PI, pal.text, 2.5);
            arc(p, Bb[0], Bb[1], 30, 4 * PI / 3, 5 * PI / 3, pal.text, 2.5);
          }
          if (n >= 4) { angLab(p, '60°', Aa[0], Aa[1], 2 * PI / 3, PI, 56, pal.text, ls); angLab(p, '60°', Bb[0], Bb[1], 4 * PI / 3, 5 * PI / 3, 50, pal.text, ls); }
          if (n >= 5) { tick(p, Aa, Bb, 1, pal.text); lab(p, 'OA = OB = AB = s', 0, -R3 / 2, pal.muted, { dy: 38 }); }
          lab(p, 'O', 0, 0, pal.text, { dx: -14, dy: 14, size: ls + 2 });
          lab(p, 'A', Aa[0], Aa[1], pal.text, { dx: 18, dy: 8, size: ls + 2 }); lab(p, 'B', Bb[0], Bb[1], pal.text, { dx: 14, dy: -14, size: ls + 2 });
          lab(p, 'C', V6[2][0], V6[2][1], pal.muted, { dx: -14, dy: -14 }); lab(p, 'D', V6[3][0], V6[3][1], pal.muted, { dx: -18, dy: 6 });
          lab(p, 'E', V6[4][0], V6[4][1], pal.muted, { dx: -14, dy: 16 }); lab(p, 'F', V6[5][0], V6[5][1], pal.muted, { dx: 14, dy: 16 });
        }
      };

      /* ---------- the unit circle ---------- */
      const drawCirc = (c, p) => {
        const pal = p.pal, ls = fsz(p), th = st.th * D2R, X = Math.cos(th), Y = Math.sin(th);
        boxIn(p, -.12, -.1, 1.4, 1.12, full(p), { l: 24, r: 12, t: 100, b: 40 });
        p.grid(.5, { axes: false });
        p.path([[0, 0], [1.12, 0]], { stroke: pal['grid-strong'], width: 1.8 }); p.path([[0, 0], [0, 1.12]], { stroke: pal['grid-strong'], width: 1.8 });
        const pts = []; for (let i = 0; i <= 90; i++) pts.push([Math.cos(i * D2R), Math.sin(i * D2R)]);
        p.path(pts, { stroke: pal.blue, width: 3.5 });
        p.path([[0, 0], [X, 0], [X, Y]], { fill: alpha(pal.yellow, .16), close: true });
        p.path([[0, 0], [X, 0]], { stroke: pal.green, width: 5 }); p.path([[X, 0], [X, Y]], { stroke: pal.red, width: 5 });
        p.path([[0, 0], [X, Y]], { stroke: pal.blue, width: 3 });
        if (X > .14 && Y > .1) rmark(p, X, 0, -1, 0, 0, 1);
        arc(p, 0, 0, 30, 0, th, pal.text, 2.5);
        [30, 45, 60].forEach(a => {
          const sx = Math.cos(a * D2R), sy = Math.sin(a * D2R), on = Math.abs(st.th - a) < .5;
          p.dot(sx, sy, on ? 7 : 5.5, pal.yellow, pal.text, 1.6);
          lab(p, a + '°', sx, sy, on ? pal.text : pal.muted, { dx: 14, dy: -12, align: 'left', size: ls });
        });
        lab(p, 'cos θ = ' + d3(X), X / 2, 0, pal.green, { dy: 24 });
        lab(p, 'sin θ = ' + d3(Y), X, Y / 2, pal.red, { dx: 10, align: 'left', alpha: Y > .12 ? 1 : 0 });
        lab(p, '1', 1, 0, pal.muted, { dy: 18 }); lab(p, '1', 0, 1, pal.muted, { dx: -12 });
        lab(p, 'θ = ' + Math.round(st.th) + '°', 0, 0, pal.text, { dx: 62, dy: -14, align: 'left', alpha: st.th <= 15 ? 1 : 0 });
        p.dot(X, Y, 9, pal.stage, pal.brass, 3.5);
        capt(c, p, ['hypotenuse = 1, so x = cos θ and y = sin θ', '30°: (√3/2, 1/2)', '45°: (√2/2, √2/2)', '60°: (1/2, √3/2)']);
      };

      /* ---------- practice figure ---------- */
      const drawPrac = (c, p) => {
        const v = PR[PS.i].v, solved = PS.solved[PS.i];
        if (v.k === 'tri') drawTri(c, p, v.a, null, full(p), true);
        else if (v.k === 'lad') drawLadder(c, p, v.a, v.h, solved, true);
        else if (v.k === 'why') { drawWhy(c, p, 0, 0); }
        else {
          const t = v.tgt, rev = [false, false]; if (solved) rev[t] = true;
          drawFig(c, p, v.fig, v.s, { cut: 1, lvl: 2, rev, tgt: t });
        }
      };

      P.onDraw = (c, p) => {
        const m = V.mode;
        if (m === 'tbl') {
          const R1 = p.w > p.h * 1.25 ? { x: 0, y: 0, w: p.w * .5, h: p.h } : { x: 0, y: 0, w: p.w, h: p.h * .54 };
          const R2_ = p.w > p.h * 1.25 ? { x: p.w * .5, y: 0, w: p.w * .5, h: p.h } : { x: 0, y: p.h * .54, w: p.w, h: p.h * .46 };
          drawTri(c, p, V.ang, V.fn, R1, true); drawGrid(c, p, R2_);
        } else if (m === 'exact') drawLadder(c, p, V.lang, V.hgt, LAD.stg >= 2, true);
        else if (m === 'cut') {
          const fs = FS[V.fig], T = FIGS[V.fig].stages(SZ[V.fig]).length, gated = gate() === 'hex' && !PD.hex.done;
          const rev = [fs.stg > 2, fs.stg > 3];
          drawFig(c, p, V.fig, SZ[V.fig], { cut: gated ? 0 : st.cut, lvl: gated ? 0 : fs.stg >= 2 ? 2 : fs.stg >= 1 ? 1 : 0, rev: gated ? [false, false] : rev, tgt: gated ? 0 : fs.stg >= 2 && fs.stg < T ? fs.stg - 2 : -1 });
        } else if (m === 'why') drawWhy(c, p, V.arg, WS[V.arg].stg);
        else if (m === 'circ') drawCirc(c, p);
        else drawPrac(c, p);
      };

      /* ---------- controls ---------- */
      C.title('Explore');
      const modeSel = C.select({ label: 'Choose a scene', options: MODES.map(([value, label]) => ({ value, label })), value: 'tbl', onChange: v => go(v) });
      const host = modeSel.parentNode.parentNode, last = () => host.lastElementChild;
      const items = [];
      const reg = (fn, el) => { items.push([fn, el || last()]); };
      C.hint(HINTS.tbl); const hintEl = last();

      /* table */
      const angSel = C.select({ label: 'Angle', options: ANG.map(a => ({ value: String(a), label: a + '°' })), value: '60', onChange: v => { V.ang = +v; sync(); } });
      reg(() => V.mode === 'tbl', angSel.parentNode);
      const fnSel = C.select({ label: 'Ratio', options: FNS.map(f => ({ value: f, label: f })), value: 'sin', onChange: v => { V.fn = v; sync(); } });
      reg(() => V.mode === 'tbl', fnSel.parentNode);
      const tb = C.buttons([
        { label: 'Clear the table', onClick: () => { for (const k of Object.keys(cells)) delete cells[k]; for (const k of Object.keys(CS)) delete CS[k]; sync(); } }]);
      reg(() => V.mode === 'tbl', tb[0].parentNode);
      const patT = C.toggle({ label: 'Show the memory pattern (√1, √2, √3 over 2)', value: false, onChange: v => { V.pat = v; sync(); } });
      reg(() => V.mode === 'tbl', patT.parentNode);

      /* ladder */
      const lb = C.buttons([45, 60].map(a => ({ label: 'Ladder at ' + a + '°', onClick: () => { V.lang = a; resetLad(); sync(); } })));
      reg(() => V.mode === 'exact', lb[0].parentNode);
      const hS = C.slider({ label: 'Height reached on the wall (m)', min: 3, max: 9, step: 3, value: 6, format: v => v + ' m', onInput: v => { V.hgt = v; resetLad(); sync(); } });
      reg(() => V.mode === 'exact');
      const rdS = C.slider({ label: 'Round sin to this many decimals', min: 1, max: 5, step: 1, value: 5, format: v => v === 5 ? 'no rounding' : v + (v === 1 ? ' decimal' : ' decimals'), onInput: v => { st.rd = v; sync(); } });
      reg(() => V.mode === 'exact');

      /* figures */
      const figSel = C.select({ label: 'Figure', options: Object.keys(FIGS).map(k => ({ value: k, label: FIGS[k].name })), value: 'hex', onChange: v => { cancel(); V.fig = v; st.cut = FS[v].stg >= 1 ? 1 : 0; sync(); } });
      reg(() => V.mode === 'cut', figSel.parentNode);
      const szS = {};
      for (const k of Object.keys(FIGS)) {
        const F = FIGS[k], v = F.vals;
        szS[k] = C.slider({ label: F.lab, min: v[0], max: v[v.length - 1], step: v[1] - v[0], value: F.def, format: x => num(x),
          onInput: x => { SZ[k] = x; const f = FS[k]; f.stg = Math.min(f.stg, 2); f.fb = ''; f.wrong = []; sync(); } });
        reg(() => V.mode === 'cut' && V.fig === k);
      }
      const rsB = C.buttons([{ label: 'Start this figure over', onClick: () => { cancel(); FS[V.fig] = { stg: 0, fb: '', wrong: [] }; st.cut = 0; if (V.fig === 'hex') PD.hex.done = false; sync(); } }]);
      reg(() => V.mode === 'cut', rsB[0].parentNode);

      /* proofs */
      const argSel = C.select({ label: 'Argument', options: ARGS.map((a, i) => ({ value: String(i), label: a.name })), value: '0', onChange: v => { V.arg = +v; sync(); } });
      reg(() => V.mode === 'why', argSel.parentNode);
      const rsW = C.buttons([{ label: 'Start this argument over', onClick: () => { WS[V.arg] = { stg: 0, fb: '', wrong: [] }; sync(); } }]);
      reg(() => V.mode === 'why', rsW[0].parentNode);

      /* unit circle */
      const thS = C.slider({ label: 'Angle θ', min: 0, max: 90, step: 5, value: 60, format: v => Math.round(v) + '°', onInput: v => { cancel(); st.th = v; sync(); } });
      reg(() => V.mode === 'circ');
      const thB = C.buttons(ANG.map(a => ({ label: 'θ = ' + a + '°', onClick: () => { cancel(); st.th = a; sync(); } })));
      reg(() => V.mode === 'circ', thB[0].parentNode);

      /* panels */
      const boxStyle = 'display:flex;flex-direction:column;gap:8px;border:1px solid var(--line-strong);border-radius:6px;padding:12px';
      const pqEl = h('div', { class: 'ctl', style: boxStyle }), chEl = h('div', { class: 'ctl', style: boxStyle });
      host.append(pqEl, chEl);
      reg(() => !!gate() && !PD[gate()].done, pqEl);
      reg(() => !!chDef() && !(gate() && !PD[gate()].done), chEl);
      const ro = C.readout();

      const panel = (el, d) => {
        el.innerHTML = '';
        if (!d) return;
        if (d.head) el.append(h('p', { class: 'hint', style: 'margin:0' }, d.head));
        el.append(h('p', { class: 'ctl-title', style: 'margin:0' }, d.q));
        const col = h('div', { style: 'display:flex;flex-direction:column;gap:8px' });
        d.ch.forEach((ch, k) => {
          const wrong = d.wrong.includes(k), good = d.good === k;
          col.append(h('button', { type: 'button', class: 'btn' + (good ? ' primary' : ''), ...((wrong || (d.good >= 0 && !good)) ? { disabled: '' } : {}),
            style: 'justify-content:flex-start;text-align:left;border-radius:10px;white-space:normal;padding:8px 14px', onclick: () => d.pick(k) }, (good ? '✓ ' : wrong ? '✗ ' : '') + ch[0]));
        });
        el.append(col);
        if (d.fb) el.append(h('div', { class: 'ctl readout', 'aria-live': 'polite', html: d.fb }));
        (d.extra || []).forEach(n => el.append(n));
      };
      const okOf = ch => ch.findIndex(x => x[2]);
      const verdict = (ch, k) => ch[k][2] ? '<b>Correct.</b> ' + strip(ch[k][1]) : '<b>Not this one.</b> ' + ch[k][1] + ' Try another choice.';
      const nextBtn = (label, fn, dis) => h('div', { class: 'ctl buttons' }, h('button', { type: 'button', class: 'btn primary', ...(dis ? { disabled: '' } : {}), onclick: fn }, label));

      /* ---------- gates (predict, then see) ---------- */
      const gate = () => V.mode === 'tbl' ? 'tbl' : (V.mode === 'cut' && V.fig === 'hex') ? 'hex' : null;
      const pqDef = () => {
        const g = gate(); if (!g) return null;
        if (g === 'tbl') return { q: 'Predict first. In a 60° triangle, which is bigger, sin 60° or cos 60°?', ch: [
          ['sin 60° is bigger', 'sin 60° is the long leg over the hypotenuse, and cos 60° is the short leg over the hypotenuse. The long leg is longer, so sin 60° ≈ 0.866 is bigger than cos 60° = 0.5.', 1],
          ['cos 60° is bigger', 'Look at the sides. The side across from 60° is the long leg, √3. The side touching it is the short leg, 1. The long leg gives the bigger ratio, so sin 60° is bigger.'],
          ['They are equal', 'They would be equal only at 45°, where the two legs match. At 60° the legs are different (√3 and 1).'],
          ['It depends on how big the triangle is', 'No. Sizes cancel in a ratio. Every 60° triangle gives the same sine and cosine.']] };
        const s = SZ.hex;
        return { q: `Predict first. A hexagonal nut has sides of ${s} mm. How far apart are two opposite flat sides (the wrench size)?`, ch: [
          [`${2 * s} mm, twice the side`, `That is the distance between opposite corners. The flat sides are closer together: the answer is ${s}√3 ≈ ${(s * R3).toFixed(1)} mm.`],
          [`About ${(s * R3).toFixed(1)} mm`, `The flats are two triangle heights apart: 2 × (${s}√3 ÷ 2) = ${s}√3 ≈ ${(s * R3).toFixed(1)} mm. You will build this step by step.`, 1],
          [`${s} mm, the same as a side`, `A side is one edge. The flats are two triangle heights apart, which is more than one side: ${s}√3 ≈ ${(s * R3).toFixed(1)} mm.`],
          [`${num(s * .75)} mm`, `Close to the right idea, but too small. The exact value is ${s}√3 ≈ ${(s * R3).toFixed(1)} mm.`]] };
      };
      const renderPQ = () => {
        const d = pqDef(); if (!d) { pqEl.innerHTML = ''; return; }
        const g = gate(), pd = PD[g];
        d.good = -1; d.wrong = []; d.fb = ''; d.head = '';
        d.pick = k => { pd.done = true; pd.pick = k; pd.fb = (d.ch[k][2] ? '<b>Your prediction is right.</b> ' : '<b>Not this time.</b> ') + strip(d.ch[k][1]); sync(); };
        panel(pqEl, d);
      };

      /* ---------- the choose panels ---------- */
      const cutDef = () => FIGS[V.fig].stages(SZ[V.fig]);
      const chDef = () => {
        if (V.mode === 'tbl') return tblPanel();
        if (V.mode === 'exact') return ladPanel();
        if (V.mode === 'cut') return cutPanel();
        if (V.mode === 'why') return whyPanel();
        return null;
      };
      const tblPanel = () => {
        const k = V.fn + V.ang, ch = CQ[k], cs = CS[k] || (CS[k] = { wrong: [], fb: '' });
        const rule = NEEDRAT[k] ? ' Choose the form with no root on the bottom.' : '';
        return { head: `${V.fn} θ = ${DEF[V.fn]}.${rule}`, q: `Read the triangle. What is ${V.fn} ${V.ang}°?`, ch, wrong: cs.wrong, good: cells[k] ? okOf(ch) : -1, fb: cs.fb,
          pick: i => { if (cells[k]) return; if (ch[i][2]) cells[k] = true; else cs.wrong.push(i); cs.fb = verdict(ch, i); sync(); },
          extra: [nextBtn('Next empty cell', nextCell, Object.keys(cells).length >= 9)] };
      };
      function nextCell() {
        for (const f of FNS) for (const a of ANG) if (!cells[f + a]) { V.fn = f; V.ang = a; sync(); return; }
      }
      const resetLad = () => { LAD.stg = 0; LAD.fb = ''; LAD.wrong = []; };
      const ladStage = () => {
        const n = ladNums(), a = n.a, h = n.h;
        if (LAD.stg === 0) return mk(`A ladder leans on a wall at ${a}° to the ground and touches the wall ${h} m up. Its length is L. Which equation links the angle, the height ${h} m and L?`,
          [`sin ${a}° = ${h} ÷ L`, `The height is across from the ${a}° angle (opposite) and the ladder is the hypotenuse. Opposite ÷ hypotenuse is sine.`],
          [[`tan ${a}° = ${h} ÷ L`, 'Tangent compares the two legs, the height and the distance from the wall. The ladder is the hypotenuse, so tangent does not involve it.'],
            [`cos ${a}° = ${h} ÷ L`, `Cosine is adjacent ÷ hypotenuse. The height is not next to the ${a}° angle, it is across from it.`],
            [`sin ${a}° = L ÷ ${h}`, 'The ratio is upside down. A sine is at most 1, but L ÷ height is more than 1, because the ladder is longer than the height it reaches.']], 1);
        const L2 = h / n.s2, err = Math.abs(L2 - n.L);
        return mk(`Now solve for L. You must cut a pole this long. Give the exact value and the decimal. Which answer is right?`,
          [`${n.ex} ≈ ${n.L.toFixed(2)} m`, `L = ${h} ÷ (${n.sx}) = ${2 * h} ÷ √${a === 60 ? 3 : 2}, and rationalizing gives ${n.ex}. Keep it exact, then round once at the end: ${n.L.toFixed(2)} m.`],
          [[`${h} ÷ ${n.s2} ≈ ${L2.toFixed(2)} m`, `You rounded sin ${a}° to ${n.s2} first. That error is passed on: the answer is off by about ${err.toFixed(2)} m. Keep the root and round last.`],
            [`${h} ÷ ½ = ${2 * h} m`, `½ is sin 30°, not sin ${a}°. Using the wrong value gives a ladder that is far too long.`],
            [`${h} × (${n.sx}) ≈ ${(h * n.s).toFixed(2)} m`, 'You multiplied by the sine instead of dividing. The ladder is the hypotenuse, so it must be longer than the height it reaches.']], 3);
      };
      const ladPanel = () => {
        if (LAD.stg >= 2) return { head: 'Both questions are done.', q: 'You found the ladder length.', ch: [], wrong: [], good: -1, fb: LAD.fb, pick: () => {} };
        const d = ladStage();
        return { head: LAD.stg === 0 ? 'Step 1 of 2: set up' : 'Step 2 of 2: solve', q: d.q, ch: d.ch, wrong: LAD.wrong, good: -1, fb: LAD.fb,
          pick: k => { LAD.fb = verdict(d.ch, k); if (d.ch[k][2]) { LAD.stg++; LAD.wrong = []; if (LAD.stg === 2) LAD.fb += ' <b>Slide the rounding control</b> to see how rounding early moves the answer.'; } else LAD.wrong.push(k); sync(); } };
      };
      const cutPanel = () => {
        const fs = FS[V.fig], S = cutDef();
        if (fs.stg >= S.length) return { head: 'Figure complete.', q: 'Every question is done. Try another figure or change the size.', ch: [], wrong: [], good: -1, fb: fs.fb, pick: () => {} };
        const d = S[fs.stg];
        return { head: `Question ${fs.stg + 1} of ${S.length}`, q: d.q, ch: d.ch, wrong: fs.wrong, good: -1, fb: fs.fb,
          pick: k => {
            fs.fb = verdict(d.ch, k);
            if (d.ch[k][2]) { fs.stg++; fs.wrong = []; if (fs.stg === 1) { cancel(); cancel = animateTo(st, { cut: 1 }, 700, () => P.requestDraw(), () => sync()); } }
            else fs.wrong.push(k);
            sync();
          } };
      };
      const whyPanel = () => {
        const A = ARGS[V.arg], ws = WS[V.arg], proven = A.steps.slice(0, ws.stg);
        const list = h('div', { class: 'ctl readout', html: `<span class="k">Given</span> ${A.given}<br><span class="k">Goal</span> ${A.claim}` + proven.map((s, i) => `<br><span class="k">${i + 1}</span> ${s.s} <i>because ${strip(s.ch.find(x => x[2])[0])}</i>`).join('') });
        if (ws.stg >= A.steps.length) return { head: 'Argument complete.', q: A.done, ch: [], wrong: [], good: -1, fb: '', pick: () => {}, extra: [list] };
        const s = A.steps[ws.stg];
        return { head: `Step ${ws.stg + 1} of ${A.steps.length}`, q: `${s.s} Which reason shows this?`, ch: s.ch, wrong: ws.wrong, good: -1, fb: ws.fb, extra: [list],
          pick: k => { ws.fb = verdict(s.ch, k); if (s.ch[k][2]) { ws.stg++; ws.wrong = []; } else ws.wrong.push(k); sync(); } };
      };

      /* ---------- practice ---------- */
      C.title('Practice');
      const prEl = h('div', { class: 'ctl', style: 'display:flex;flex-direction:column;gap:10px' });
      host.append(prEl);
      const renderPractice = () => {
        prEl.innerHTML = '';
        if (V.mode !== 'prac') {
          prEl.append(h('p', { class: 'hint', style: 'margin:0' }, 'Eight problems: exact values, a hexagon, a nut, a ladder, a square, an equilateral triangle, a reason and a trap. Every answer is explained. Nothing is saved or scored.'),
            h('div', { class: 'ctl buttons' }, h('button', { type: 'button', class: 'btn primary', onclick: () => go('prac') }, 'Start practice')));
          return;
        }
        const i = PS.i, pr = PR[i], N = PR.length, done = PS.solved.filter(Boolean).length, okFirst = PS.first.filter(Boolean).length;
        const d = { head: `Problem ${i + 1} of ${N}. Right on the first try: ${okFirst} of ${done} solved`, q: pr.q, ch: pr.ch, wrong: PS.wrong[i], good: PS.solved[i] ? okOf(pr.ch) : -1, fb: PS.fb[i],
          pick: k => {
            if (PS.solved[i]) return;
            if (pr.ch[k][2]) { PS.solved[i] = true; PS.first[i] = PS.wrong[i].length === 0; } else PS.wrong[i].push(k);
            PS.fb[i] = verdict(pr.ch, k); renderPractice(); P.requestDraw();
          } };
        panel(prEl, d);
        const lastP = i === N - 1;
        prEl.append(nextBtn(lastP ? 'Start over' : 'Next problem', () => {
          if (lastP) { PS.i = 0; PR.forEach((_, j) => { PS.solved[j] = false; PS.first[j] = false; PS.wrong[j] = []; PS.fb[j] = ''; }); } else PS.i++;
          renderPractice(); P.requestDraw();
        }, !PS.solved[i]));
        if (lastP && PS.solved[i]) prEl.append(h('div', { class: 'ctl readout', html: `<b>All done.</b> You got ${okFirst} of ${N} right on the first try.` }));
      };

      /* ---------- readout ---------- */
      const upd = () => {
        const m = V.mode; let html = '';
        const g = gate();
        if (g && !PD[g].done) { ro.innerHTML = '<span class="k">Make your prediction above to see the numbers.</span>'; return; }
        if (g && PD[g].done) html = `${PD[g].fb}<br>`;
        if (m === 'tbl') {
          const k = V.fn + V.ang, T = TRI[V.ang], n = Object.keys(cells).length, f = V.fn;
          const sides = V.ang === 45 ? 'legs 1 and 1, hypotenuse √2' : 'short leg 1, long leg √3, hypotenuse 2';
          html += `<span class="k">Triangle</span> ${T.name}: ${sides}<br><span class="k">${f} ${V.ang}°</span> = ${DEF[f]} = `;
          if (cells[k]) {
            const nu = f === 'cos' ? T.at : T.ot, de = f === 'tan' ? T.at : T.ht;
            html += `${nu} ÷ ${de} = ${TV[f][V.ang][0]} ≈ ${d3(TV[f][V.ang][1])}`;
            if (f === 'tan') html += `<br><span class="k">Check</span> sin ÷ cos = ${TV.sin[V.ang][0]} ÷ ${TV.cos[V.ang][0]} = ${TV.tan[V.ang][0]}`;
          } else html += '? (choose below)';
          html += `<br><span class="k">Cells filled</span> ${n} of 9`;
          if (n === 9) html += '<br><b>The table is complete.</b> Switch on the memory pattern, then open the unit circle scene.';
        } else if (m === 'exact') {
          const n = ladNums(), rd = st.rd, sr = rd === 5 ? n.s : +n.s.toFixed(rd), Lr = n.h / sr;
          html += `<span class="k">Ladder</span> ${n.a}° with the ground, reaches ${n.h} m<br><span class="k">Equation</span> sin ${n.a}° = ${n.h} ÷ L<br>`;
          if (LAD.stg >= 2) html += `<span class="k">Exact</span> L = ${n.h} ÷ (${n.sx}) = ${n.ex} m<br><span class="k">Decimal</span> ≈ ${n.L.toFixed(2)} m (rounded once, at the end)<br>`;
          else html += '<span class="k">Answer the questions below to see L.</span><br>';
          html += rd === 5 ? `<span class="k">Rounding demo</span> sin ${n.a}° is kept exact (${n.sx}), so L = ${n.h} ÷ (${n.sx}) ≈ ${n.L.toFixed(4)} m with no rounding error. Slide to round sin ${n.a}° first.`
            : `<span class="k">Rounding demo</span> sin ${n.a}° rounded to ${rd}${rd === 1 ? ' decimal' : ' decimals'} = ${sr}, so L = ${n.h} ÷ ${sr} ≈ ${Lr.toFixed(rd < 3 ? 3 : 4)} m, an error of ${Math.abs(Lr - n.L).toFixed(rd < 3 ? 3 : 4)} m`;
        } else if (m === 'cut') {
          const F = FIGS[V.fig], s = SZ[V.fig], fs = FS[V.fig];
          html += `<span class="k">${F.name}</span> ${F.lab.replace(/ \(.*\)/, '').toLowerCase()} = ${s} ${F.u}<br>`;
          const known = {
            eq: [`<span class="k">Height</span> = ${val(s / 2, 3, 'cm')}`, `<span class="k">Area</span> = ½ × ${s} × ${rt(s / 2, 3)} = ${val(s * s / 4, 3, 'cm²')}`],
            hex: [`<span class="k">Wrench size</span> = 2 × ${rt(s / 2, 3)} = ${val(s, 3, 'mm')}`, `<span class="k">Area</span> = 6 × ${rt(s * s / 4, 3)} = ${val(3 * s * s / 2, 3, 'mm²')}`],
            rect: [`<span class="k">Long side</span> = ${val(s, 3, 'cm')}`, `<span class="k">Area</span> = ${s} × ${rt(s, 3)} = ${val(s * s, 3, 'cm²')}`],
            truss: [`<span class="k">Rise</span> = ${val(s / 6, 3, 'm')}`, `<span class="k">Rafter</span> = ${val(s / 3, 3, 'm')}`],
            sq: [`<span class="k">Diagonal</span> = ${val(s, 2, 'cm')}`, `<span class="k">One triangle</span> = ${num(s * s / 2)} cm²`]
          }[V.fig];
          const shown = known.slice(0, Math.max(0, Math.min(2, fs.stg - 2)));
          html += shown.length ? shown.join('<br>') : '<span class="k">Answer the questions below. Results appear here.</span>';
        } else if (m === 'why') {
          const ws = WS[V.arg]; html += `<span class="k">Steps proven</span> ${ws.stg} of ${ARGS[V.arg].steps.length}`;
        } else if (m === 'circ') {
          const a = Math.round(st.th), X = Math.cos(a * D2R), Y = Math.sin(a * D2R), sp = ANG.includes(a);
          html += `<span class="k">Point</span> (cos ${a}°, sin ${a}°) = (${sp ? TV.cos[a][0] : d3(X)}, ${sp ? TV.sin[a][0] : d3(Y)})<br><span class="k">Decimals</span> (${d3(X)}, ${d3(Y)})<br><span class="k">Check</span> x² + y² = ${d3(X * X)} + ${d3(Y * Y)} = ${d3(X * X + Y * Y)}`;
          if (sp) html += `<br><span class="k">Special angle</span> tan ${a}° = ${TV.tan[a][0]}`;
          html += '<br>The unit circle lesson continues past 90°.';
        } else html = '<span class="k">Work through the problems in the Practice panel.</span>';
        ro.innerHTML = html;
      };

      /* ---------- sync ---------- */
      function vis() { for (const [fn, el] of items) el.style.display = fn() ? '' : 'none'; hintEl.textContent = HINTS[V.mode]; }
      function sync() {
        modeSel.value = V.mode; angSel.value = String(V.ang); fnSel.value = V.fn; figSel.value = V.fig; argSel.value = String(V.arg); patT.checked = V.pat;
        hS.set(V.hgt); rdS.set(st.rd); thS.set(st.th); for (const k of Object.keys(szS)) szS[k].set(SZ[k]);
        lb.forEach((b, i) => b.classList.toggle('primary', [45, 60][i] === V.lang));
        vis(); renderPQ(); chEl.innerHTML = ''; if (chEl.style.display !== 'none') panel(chEl, chDef()); renderPractice(); upd(); P.draw();
      }
      function go(m) { cancel(); V.mode = m; if (m === 'cut') st.cut = FS[V.fig].stg >= 1 ? 1 : 0; sync(); }

      /* ---------- pointer: choose a cell, drag the circle point ---------- */
      P.canvas.addEventListener('click', e => {
        if (V.mode !== 'tbl') return;
        const r = P.canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        const hit = gridHit.find(g => x >= g.x && x <= g.x + g.w && y >= g.y && y <= g.y + g.h);
        if (hit) { V.fn = hit.f; V.ang = hit.a; sync(); }
      });
      draggable(P, {
        hit: (px, py) => V.mode === 'circ' && near(P, Math.cos(st.th * D2R), Math.sin(st.th * D2R), px, py) ? 'T' : null,
        move: (_, x, y) => { cancel(); st.th = clamp(snap(Math.atan2(y, x) / D2R, 5), 0, 90); sync(); }
      });

      /* ---------- guided steps ---------- */
      const FLAGS = ['mode', 'ang', 'fn', 'rq', 'lang', 'hgt', 'fig', 'arg'];
      const apply = (patch, immediate) => {
        cancel();
        const nums = {}, fl = {};
        for (const [k, v] of Object.entries(patch)) (FLAGS.includes(k) ? fl : nums)[k] = v;
        if (fl.rq) { if (fl.mode === 'tbl') { PD.tbl.done = false; } if (fl.fig === 'hex') { PD.hex.done = false; FS.hex = { stg: 0, fb: '', wrong: [] }; SZ.hex = 10; } }
        delete fl.rq;
        const lad = fl.lang !== undefined || fl.hgt !== undefined;
        Object.assign(V, fl); if (lad) resetLad();
        if (V.mode === 'cut') st.cut = FS[V.fig].stg >= 1 ? 1 : 0;
        Object.assign(st, nums); sync();
      };

      sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
