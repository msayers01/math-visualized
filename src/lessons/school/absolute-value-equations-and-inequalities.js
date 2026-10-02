/* =====================================================================
   SCHOOL — Absolute value equations and inequalities
   ===================================================================== */
{
  const MI = '−';
  const rnd = v => +(+v).toFixed(4);
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;

  /* ---------- exact fractions for the workbench ---------- */
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; };
  const Q = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g + 0, d / g]; };
  const qadd = (a, b) => Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  const qmul = (a, b) => Q(a[0] * b[0], a[1] * b[1]);
  const qdiv = (a, b) => Q(a[0] * b[1], a[1] * b[0]);
  const qval = a => a[0] / a[1];
  const q0 = a => a[0] === 0;
  const qtxt = a => (a[0] < 0 ? MI : '') + Math.abs(a[0]) + (a[1] === 1 ? '' : '/' + a[1]);
  const qpw = (a, w) => { const n = Math.abs(a[0]), one = n === 1 && a[1] === 1; return one ? w : (a[1] === 1 ? n + w : '(' + n + '/' + a[1] + ')' + w); };
  const eqQ = (p, q, r, w) => {
    const parts = [];
    if (!q0(p)) parts.push([p[0] < 0, qpw(p, w)]);
    if (!q0(q)) parts.push([q[0] < 0, Math.abs(q[0]) + (q[1] === 1 ? '' : '/' + q[1])]);
    if (!parts.length) parts.push([false, '0']);
    return parts.map(([neg, b], i) => (i ? (neg ? ' ' + MI + ' ' : ' + ') : (neg ? MI : '')) + b).join('') + ' = ' + qtxt(r);
  };

  /* ---------- statements ---------- */
  const inner = a => (a === 0 ? 'x' : a > 0 ? `x ${MI} ${num(a)}` : `x + ${num(-a)}`);
  const stmt = (a, k, rel) => `|${inner(a)}| ${rel} ${num(k)}`;
  const holds = (v, a, k, rel) => {
    const d = Math.abs(v - a), e = 1e-9;
    return rel === '=' ? Math.abs(d - k) < e : rel === '<' ? d < k - e : rel === '≤' ? d <= k + e : rel === '>' ? d > k + e : d >= k - e;
  };
  const dtxt = (x, a) => (a === 0 ? `|${num(x)}|` : `|${num(x)} ${a < 0 ? '+ ' + num(-a) : MI + ' ' + num(a)}|`);
  const solsOf = t => (t.k > 0 ? [rnd(t.a - t.k), rnd(t.a + t.k)] : t.k === 0 ? [t.a] : []);
  const lin = (c, d) => (c === 1 ? 'x' : c === -1 ? MI + 'x' : num(c) + 'x') + (d > 0 ? ' + ' + d : d < 0 ? ` ${MI} ${-d}` : '');
  const absStr = t => `|${lin(t.c, t.d)}|`;
  const wEq = t => absStr(t) + (t.e > 0 ? ` + ${t.e}` : t.e < 0 ? ` ${MI} ${-t.e}` : '') + ' = ' + num(t.f);
  const isoVal = t => t.f - t.e;
  const par = v => (v < 0 ? '(' + num(v) + ')' : num(v));

  /* ---------- the tasks ---------- */
  const SPEC = ['No solution', 'One solution', 'Two solutions', 'Every number'];
  const T_FIND = {
    type: 'find', a: 2, k: 3, rel: '=', lo: -3, hi: 7, lab: 1, step: 1, x0: 0,
    intro: 'Find every number <i>x</i> that makes |x − 2| = 3 true.',
    gate: { q: 'Before you move anything: how many numbers x make |x − 2| = 3 true? Remember, |x − 2| is the distance from x to 2.', ans: 2,
      ch: [['0 solutions', 'Zero would mean no number is 3 away from 2. But 5 is: it is 3 steps to the right of 2.'],
        ['1 solution', 'One is a start: 5 is 3 to the right of 2. But you can also walk 3 steps to the left of 2. Distance does not care about direction.'],
        ['2 solutions', 'From 2 you can go 3 to the right (5) or 3 to the left (−1). Both are a distance of 3 from 2. Now find them by moving the point.']] }
  };
  const T_GRAPH = { type: 'graph', a: 3, k: 4, rel: '<', rels: true, lo: -4, hi: 10, lab: 2, step: 1, x0: 6,
    intro: 'Which numbers <i>x</i> make the statement true? Move the test point, then build the graph.' };
  const T_WORK = { type: 'work', c: 2, d: -1, e: 3, f: 8, lo: -4, hi: 6, step: 1, intro: 'Solve it yourself, one move at a time.' };

  const CASES = [
    { name: 'Machine part', type: 'graph', a: 5, k: .02, rel: '≤', lo: 4.94, hi: 5.06, lab: .02, step: .02, x0: 5.06, title: 'Machine part: 5 cm, give or take 0.02 cm',
      intro: 'A machine part must be 5 cm long, plus or minus 0.02 cm. Let x be its length in cm. Parts within the tolerance pass inspection.',
      gate: { q: 'Which inequality says the length x is within 0.02 cm of 5 cm?', ans: 1, hide: true,
        ch: [['|x − 0.02| ≤ 5', 'This says x is within 5 of 0.02, so the numbers are in the wrong places. The target length, 5, is what you subtract: x − 5 is how far the part is from 5.'],
          ['|x − 5| ≤ 0.02', '|x − 5| is how far the length is from 5. "Within 0.02" allows an error of 0.02 or less, so the sign is ≤.'],
          ['|x − 5| ≥ 0.02', '≥ means at least 0.02 away. Those are the parts that are too far off, the rejects.'],
          ['|x + 5| ≤ 0.02', 'x + 5 is the distance from x to −5. A length is not near −5.']] } },
    { name: 'Thermostat', type: 'graph', a: 68, k: 2, rel: '>', lo: 62, hi: 74, lab: 2, step: 1, x0: 72, title: 'Thermostat: more than 2 degrees from 68',
      intro: 'A heater turns on when the room temperature is more than 2 degrees away from 68°F. Let x be the temperature. For which x does the heater run?',
      gate: { q: 'Which inequality says x is more than 2 degrees away from 68?', ans: 3, hide: true,
        ch: [['|x − 68| < 2', '< 2 means closer than 2 degrees. That is the comfortable range, the opposite of what we want.'],
          ['|x − 2| > 68', 'The numbers are in the wrong places. The target, 68, is what you subtract. The 2 is the distance.'],
          ['|x − 68| ≥ 2', '≥ would include a room at exactly 2 degrees away (66 or 70). "More than 2" leaves out exactly 2, so the sign must be strict.'],
          ['|x − 68| > 2', '|x − 68| is how far the room is from 68. "More than 2" away is > 2, a strict sign.']] } },
    { name: 'Car and home', type: 'find', a: 10, k: 3, rel: '=', lo: 4, hi: 16, lab: 2, step: 1, x0: 14, title: 'Car: exactly 3 miles from home',
      intro: 'Home is at mile 10 on a straight road. A car is exactly 3 miles from home. Let x be the mile marker where the car is. Where could it be?',
      gate: { q: 'Which equation says the car is exactly 3 miles from home?', ans: 2, hide: true,
        ch: [['|x − 3| = 10', 'The numbers are swapped. Home, 10, is what you subtract. The 3 is the distance.'],
          ['|x| = 3', 'That says the car is 3 miles from mile 0, not from home at mile 10.'],
          ['|x − 10| = 3', '|x − 10| is the distance from the car to home. Exactly 3 miles gives an equals sign.'],
          ['|x − 10| < 3', '< 3 would mean within 3 miles, a whole stretch of road. Exactly 3 miles is just two spots.']] } },
    { name: '|x| = −2', type: 'special', a: 0, k: -2, rel: '=', lo: -4, hi: 4, lab: 1, step: 1, x0: 2, verdict: 'No solution',
      intro: 'Some statements have no answer, or only one. Decide before you test.',
      gate: { q: 'How many numbers x make |x| = −2 true?', ans: 2,
        ch: [[SPEC[1], 'One solution would be a point that is −2 away from 0. A distance cannot be negative, so no point works.'],
          ['Two solutions: 2 and −2', '2 and −2 are each 2 away from 0, so |2| = 2 and |−2| = 2. The equation asks for −2, not 2.'],
          [SPEC[0], '|x| is the distance from x to 0. A distance is never negative, so it can never equal −2. No point on the line works.'],
          [SPEC[3], 'Every number would need a distance of −2. But every distance is 0 or more.']] } },
    { name: '|x − 3| < 0', type: 'special', a: 3, k: 0, rel: '<', lo: -1, hi: 7, lab: 1, step: 1, x0: 5, verdict: 'No solution',
      intro: 'Think of the smallest a distance can be.',
      gate: { q: 'How many numbers x make |x − 3| < 0 true? Think of the smallest value a distance can have.', ans: 0,
        ch: [[SPEC[0], 'The smallest distance is 0, and 0 is not less than 0. No distance is below 0, so no number works. No solution.'],
          ['One solution: x = 3', 'At x = 3 the distance is 0, but 0 &lt; 0 is false. The sign is strict. (With ≤ instead, x = 3 would work.)'],
          [SPEC[2], 'You would need a distance below 0. The smallest a distance can be is 0.'],
          [SPEC[3], 'Every number would need a distance below 0. No distance is.']] } },
    { name: '|x − 3| = 0', type: 'special', a: 3, k: 0, rel: '=', lo: -1, hi: 7, lab: 1, step: 1, x0: 5, verdict: 'One solution: x = 3', mark: 3,
      intro: 'A distance of exactly 0 is allowed.',
      gate: { q: 'How many numbers x make |x − 3| = 0 true?', ans: 1,
        ch: [[SPEC[0], 'A distance of 0 is possible: it is how far a point is from itself. x = 3 works, so there is a solution.'],
          ['One solution: x = 3', 'Only x = 3 is 0 away from 3. Going "0 to the left" and "0 to the right" lands on the same point, so the two cases give one answer.'],
          ['Two solutions: 3 and −3', 'The point −3 is 6 away from 3, not 0. Going 0 steps left or right gives the same point, 3.'],
          [SPEC[3], 'Only a number sitting exactly on 3 has distance 0 from 3.']] } }
  ];

  const PROBS = [
    { name: 'Equation', story: 'Solve |x − 4| = 6. Find every point that is 6 away from 4.',
      t: { type: 'find', a: 4, k: 6, rel: '=', lo: -4, hi: 12, lab: 2, step: 1, x0: 1 } },
    { name: 'Inside', story: 'Solve |x + 2| < 5 and graph it. Careful: x + 2 is the same as x − (−2), so the center is −2.',
      t: { type: 'graph', a: -2, k: 5, rel: '<', lo: -8, hi: 6, lab: 2, step: 1, x0: 1 } },
    { name: 'Outside', story: 'Solve |x − 1| ≥ 3 and graph it. Ask: which points are at least 3 away from 1?',
      t: { type: 'graph', a: 1, k: 3, rel: '≥', lo: -5, hi: 7, lab: 2, step: 1, x0: 0 } },
    { name: 'Isolate, then split', story: 'Solve |2x + 1| − 2 = 5.',
      t: { type: 'work', c: 2, d: 1, e: -2, f: 5, lo: -6, hi: 6, step: 1, ord: ['ok', 'opp', 'div'], sord: ['two', 'one', 'none'] } },
    { name: 'A tricky one', story: 'Solve |x − 2| + 5 = 3. Look closely at the number you get after isolating the bars.',
      t: { type: 'work', c: 1, d: -2, e: 5, f: 3, lo: -4, hi: 8, step: 1, ord: ['drop', 'ok', 'opp'], sord: ['two', 'none', 'one'] } },
    { name: 'A story', story: 'A water tank should hold 40 liters, give or take 3 liters. Let x be the amount in liters. Write the inequality for the allowed amounts, then graph it.',
      t: { type: 'graph', a: 40, k: 3, rel: '≤', lo: 34, hi: 46, lab: 2, step: 1, x0: 46,
        gate: { q: 'Which inequality says the amount x is within 3 liters of 40 liters?', ans: 2, hide: true,
          ch: [['|x − 3| ≤ 40', 'The numbers are in the wrong places. The target, 40, is what you subtract. The 3 is the distance.'],
            ['|x − 40| ≥ 3', '≥ 3 means at least 3 liters off, the tanks that are NOT in range.'],
            ['|x − 40| ≤ 3', '|x − 40| is how far the amount is from 40. "Give or take 3" allows exactly 3 off, so the sign is ≤.'],
            ['|x − 40| < 3', 'This leaves out exactly 37 and 43. "Give or take 3" allows an error of exactly 3, so the sign should be ≤.']] } } },
    { name: 'Spot the lost solution', story: 'A student solved |x − 3| = 4 by writing x − 3 = 4, so x = 7. The 7 is already marked on the line.',
      t: { type: 'find', a: 3, k: 4, rel: '=', lo: -3, hi: 9, lab: 2, step: 1, x0: 5, given: [7],
        gate: { q: 'The student wrote only x − 3 = 4 and answered x = 7. What went wrong?', ans: 2,
          ch: [['Nothing. 7 is 4 away from 3, so it is the whole answer.', '7 is a correct solution, but it is not the whole answer. On the number line, a point on the other side of 3 is also 4 away.'],
            ['The student should have written x + 3 = 4.', 'x + 3 would mean the distance from x to −3. The bars say x − 3, the distance from x to 3.'],
            ['The student kept only one case. Also x − 3 = −4, so x = −1 is a second solution.', 'The inside, x − 3, can be 4 or −4. Both are 4 away from 0. Find the missing point on the line.'],
            ['The answer should be x = −7.', 'x = −7 would be 10 away from 3. The point 7 is correct, but it has a partner.']] } } }
  ];
  PROBS.forEach(p => { p.t.name = p.name; });

  register({
    id: 'absolute-value-equations-and-inequalities', level: 'school',
    title: 'Absolute value equations and inequalities',
    blurb: 'Read |x − a| as a distance, and solve equations and inequalities with it on a number line.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 3; p.cy = 0; p.span = 6.2;
      p.path([[-5, 0], [11, 0]], { stroke: pal['grid-strong'], width: 2 });
      p.path([[-1, 0], [7, 0]], { stroke: pal.yellow, width: 9 });
      p.path([[3, 1.6], [7, 1.6]], { stroke: pal.blue, width: 3 });
      p.dot(-1, 0, 7, pal.stage, pal.yellow, 3.5); p.dot(7, 0, 7, pal.stage, pal.yellow, 3.5);
      p.dot(3, 0, 5, pal.violet);
    },
    hook: String.raw`A machine part must be 5 cm long, give or take 0.02 cm. Which lengths pass inspection, and how can one short statement with bars describe both "too long" and "too short"?`,
    steps: [
      { title: 'Absolute value is distance',
        text: String.raw`<p>\(|x-a|\) is the <b>distance</b> from \(x\) to \(a\) on a number line. The violet point is \(a=2\). The blue bar is \(|x-2|\).</p><p>Predict first: how many numbers make \(|x-2|=3\) true? Then move the point to find them and press Mark.</p>`,
        set: { task: 'find' } },
      { title: 'Within and beyond',
        text: String.raw`<p>\(|x-3|&lt;4\) means "closer than 4 to 3". Pick a sign, test points, then build the graph: the edges, between or outside, open or closed.</p><p>An <b>open circle</b> leaves its number out. A <b>closed circle</b> keeps it in.</p>`,
        set: { task: 'graph' } },
      { title: 'A line inside the bars',
        text: String.raw`<p>In \(|2x-1|+3=8\) the bars hold \(2x-1\). First get the bars alone. Then the inside is 5 away from 0, so it is \(5\) or \(-5\).</p><p>Split into two equations, solve both, and check both in the original.</p>`,
        set: { task: 'work' } },
      { title: 'Stories and no-answer cases',
        text: String.raw`<p>Words like "within", "off by" and "more than" turn into bars. Work through the three stories: translate, then graph.</p><p>Then try three special cases. A distance is never negative, so some statements have no solution. Predict first.</p>`,
        set: { task: 'cases' } }
    ],
    formal: String.raw`
      <h3>Absolute value as distance</h3>
      <p>The <em>absolute value</em> \(|u|\) is the distance from \(u\) to \(0\) on a number line, so \(|5|=5\) and \(|-5|=5\). More generally, \(|x-a|\) is the distance from \(x\) to \(a\), because the gap between two numbers is the bigger minus the smaller, and the bars make it positive whichever comes first. For example \(|-1-3|=|-4|=4\).</p>
      <p>A plus sign hides a negative center: \(x+2=x-(-2)\), so \(|x+2|\) is the distance from \(x\) to \(-2\).</p>
      <h3>Why an equation has two answers</h3>
      <p>\(|x-3|=4\) asks for every point that is exactly \(4\) away from \(3\). Start at \(3\) and walk \(4\) steps. You can walk right to \(7\) or left to \(-1\), and nowhere else. In symbols: \(x-3=4\) or \(x-3=-4\). Dropping the second case is the classic trap: it loses a solution.</p>
      <h3>Inequalities: inside or outside</h3>
      <p>Each sign answers a different distance question about the center \(a\) and the radius \(k\):</p>
      <ul>
        <li>\(|x-a|&lt;k\): closer than \(k\). The numbers <b>between</b> \(a-k\) and \(a+k\), with <b>open</b> circles. Written \(a-k&lt;x&lt;a+k\).</li>
        <li>\(|x-a|\le k\): at most \(k\) away. Same graph with <b>closed</b> circles.</li>
        <li>\(|x-a|&gt;k\): farther than \(k\). The two rays <b>outside</b>, with open circles. Written \(x&lt;a-k\) <em>or</em> \(x&gt;a+k\).</li>
        <li>\(|x-a|\ge k\): at least \(k\) away. The same rays with closed circles.</li>
      </ul>
      <p>A circle is open when the sign is strict (\(&lt;\) or \(&gt;\)): a point exactly \(k\) away gives \(k&lt;k\), which is false. It is closed when the sign has "or equal to" (\(\le\) or \(\ge\)).</p>
      <p>"Inside" uses <em>and</em> (both \(x&gt;a-k\) and \(x&lt;a+k\)). "Outside" uses <em>or</em> (either far left or far right, never both).</p>
      <h3>A linear expression inside the bars</h3>
      <p>Treat the expression inside the bars as one number \(u\). The statement \(|u|=k\) means \(u=k\) or \(u=-k\), because those are the two points \(k\) away from \(0\). So with \(u=2x-1\):</p>
      <p>\[ |2x-1|+3=8 \;\Rightarrow\; |2x-1|=5 \;\Rightarrow\; 2x-1=5 \ \text{or}\ 2x-1=-5 \;\Rightarrow\; x=3 \ \text{or}\ x=-2. \]</p>
      <p>The order matters: first isolate the bars (undo the \(+3\)), then split. Check both answers in the original: \(|2(3)-1|+3=5+3=8\) and \(|2(-2)-1|+3=|-5|+3=8\).</p>
      <p>Inequalities work the same way. For \(|2x-1|&lt;5\) the inside is between \(-5\) and \(5\): \(-5&lt;2x-1&lt;5\). Add \(1\): \(-4&lt;2x&lt;6\). Divide by \(2\): \(-2&lt;x&lt;3\). For \(|2x-1|\ge 5\), split into \(2x-1\ge5\) or \(2x-1\le-5\), so \(x\ge3\) or \(x\le-2\). If you ever multiply or divide by a negative number, flip the sign.</p>
      <h3>When there is no answer, or one</h3>
      <p>A distance is never negative, so \(|u|\) is always \(0\) or more.</p>
      <ul>
        <li>\(|x|=-2\) has <b>no solution</b>. After isolating, a bar expression equal to a negative number is impossible.</li>
        <li>\(|x-3|&lt;0\) has <b>no solution</b>: nothing is closer than \(0\).</li>
        <li>\(|x-3|=0\) has <b>one solution</b>, \(x=3\). The cases \(x-3=0\) and \(x-3=-0\) are the same.</li>
        <li>\(|x-3|\ge 0\) is true for <b>every</b> number, and \(|x-3|\le 0\) is true only at \(x=3\).</li>
      </ul>
      <h3>Tolerances and "within"</h3>
      <p>"5 cm plus or minus 0.02 cm" means the length is at most \(0.02\) away from \(5\): \(|x-5|\le0.02\), so \(4.98\le x\le5.02\). "Within" and "at most" use \(\le\). "More than \(2\) degrees from \(68\)" is \(|x-68|&gt;2\), which means \(x&lt;66\) or \(x&gt;70\). Always put the <em>target</em> inside the bars and the <em>allowed error</em> on the right.</p>
      <h3>Common traps</h3>
      <ul>
        <li>Solving \(|x-3|=4\) as only \(x-3=4\) and missing \(x=-1\).</li>
        <li>Splitting before isolating: in \(|x-2|+5=3\) the bars are not alone yet.</li>
        <li>Writing \(|x+2|\) with center \(2\) instead of \(-2\).</li>
        <li>Using open circles for \(\le\) or closed circles for \(&lt;\).</li>
      </ul>`,
    check: [
      { q: String.raw`Which statement says "x is more than 4 away from 3"?`,
        choices: ['|x − 3| < 4', '|x − 4| > 3', '|x − 3| > 4', '|x + 3| > 4'], answer: 2,
        why: String.raw`\(|x-3|\) is the distance from \(x\) to \(3\), and "more than 4" is \(&gt;4\), so \(|x-3|&gt;4\). The first choice is "closer than 4". The second puts the center and the distance in the wrong places. The fourth measures distance from \(-3\), not from \(3\).`,
        hint: String.raw`Which number do you subtract inside the bars, and which number goes on the right of the sign?` },
      { q: String.raw`Solve \(|2x+1|-3=4\). Which choice lists every solution?`,
        choices: ['x = 3 only', 'x = 3 and x = −4', 'x = 3 and x = 4', 'x = 3 and x = −3'], answer: 1,
        why: String.raw`First isolate the bars: add \(3\) to get \(|2x+1|=7\). Then \(2x+1=7\) gives \(x=3\), and \(2x+1=-7\) gives \(2x=-8\), so \(x=-4\). Check \(x=-4\): \(|2(-4)+1|-3=|-7|-3=4\). Choosing "3 only" loses the second case. The other two make an arithmetic slip in the second case.`,
        hint: String.raw`Get the bars alone first. Then the inside must equal 7 or −7.` },
      { q: String.raw`A student solves \(|x-3|&lt;4\) and writes: "\(x-3&lt;4\), so \(x&lt;7\)." What is wrong with the solution?`,
        choices: ['Nothing; x < 7 is correct.', 'The inequality should have been x − 3 > 4.', 'x − 3 < 4 should have been x + 3 < 4.', 'It dropped a case: x − 3 must also be greater than −4, so the answer is −1 < x < 7.'], answer: 3,
        why: String.raw`\(|x-3|&lt;4\) means the distance from \(x\) to \(3\) is less than \(4\), so \(x\) is between \(-1\) and \(7\). The student kept only the right edge. A test shows the problem: \(x=-10\) satisfies \(x&lt;7\), but its distance from \(3\) is \(13\), which is not less than \(4\). The correct answer is \(-4&lt;x-3&lt;4\), that is \(-1&lt;x&lt;7\).`,
        hint: String.raw`Test a number that satisfies x &lt; 7 but is far from 3, such as x = −10. Is its distance from 3 less than 4?` }
    ],
    links: { prereq: ['solving-linear-inequalities', 'negative-numbers-and-absolute-value'], next: ['piecewise-and-step-functions'], related: ['solving-equations-with-a-balance', 'distance-and-the-pythagorean-theorem', 'what-is-a-function', 'functions-as-transformations'] },

    mount({ stage, controls: C }) {
      const panel = stage.nextElementSibling;
      const P = new Plane(stage, { span: 5 });
      const cv = P.canvas;
      cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'A number line with a fixed point, a test point and the solution set');
      const st = { x: 0, fa: 1, practice: false };
      let cur = null, R = {}, cancelFa = () => {}, stepTask = 'find', caseI = 0;
      const btn = (label, onClick, primary, aria) => { const b = h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label); if (aria) b.setAttribute('aria-label', aria); b.dataset.k = aria || label; return b; };

      panel.append(h('style', {}, `
        .ave-prompt{font-size:.92rem;line-height:1.5;margin:0}
        .ave-col{display:flex;flex-direction:column;align-items:stretch;gap:8px}
        .ave-cards{display:flex;flex-direction:column;gap:8px}
        .ave-card{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 12px;padding:8px 12px;border:1.5px solid var(--line-strong);border-left:6px solid var(--blue);border-radius:4px;background:var(--surface-solid);font-family:var(--serif);font-size:1.2rem;line-height:1.6}
        .ave-log{display:flex;flex-direction:column;gap:6px;border-top:1px solid var(--line);padding-top:10px}
        .ave-note{font:.78rem var(--sans);color:var(--muted);display:block}
        .ave-req{font-family:var(--serif);font-size:1.15rem;line-height:1.5}
        .ave-coach{font-size:.9rem;line-height:1.5;border-top:1px solid var(--line);padding-top:10px}
        .ave-coach p{margin:0 0 6px}
        .ave-next{color:var(--text);font-weight:500}
        .ave-step{display:flex;align-items:center;gap:8px;font-size:.92rem;flex-wrap:wrap}
        .ave-step output{min-width:3em;text-align:center;font-variant-numeric:tabular-nums;font-weight:600}
        .ave-step .btn{min-width:40px;padding:6px 10px}
        .ave-lab{min-width:6.5em;font-weight:600}
        .ave-sec{font:600 .8rem var(--sans);color:var(--muted);margin:2px 0 0}
        .ave-tally{margin:0}
      `));

      /* ---------- panel skeleton ---------- */
      const topBox = h('div', { class: 'ave-col', style: 'gap:12px' });
      const promptEl = h('p', { class: 'ave-prompt' });
      const chooseEl = h('div', { class: 'ave-col' });
      const xid = 'ave-x';
      const xOut = h('output', { for: xid }), xInp = h('input', { type: 'range', id: xid, min: 0, max: 10, step: 1, value: 0 });
      const xBox = h('div', { class: 'ctl slider' }, h('label', { for: xid }, 'Test point x'), xOut, xInp);
      const roEl = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
      const dynEl = h('div', { class: 'ave-col', style: 'gap:10px' });
      topBox.append(promptEl, chooseEl, xBox, roEl, dynEl);
      const topTitle = h('p', { class: 'ctl-title' }, 'Try it yourself');
      panel.append(topTitle, topBox);

      const setSliderLook = () => xInp.style.setProperty('--p', ((+xInp.value - +xInp.min) / (+xInp.max - +xInp.min) * 100) + '%');
      const cfgSlider = t => { xInp.min = t.lo; xInp.max = t.hi; xInp.step = t.step; xInp.value = st.x; xOut.textContent = 'x = ' + num(st.x); setSliderLook(); };
      const setX = v => {
        const t = cur; if (!t || t.type === 'work') return;
        st.x = clamp(rnd(snap(v, t.step)), t.lo, t.hi); xInp.value = st.x; xOut.textContent = 'x = ' + num(st.x); setSliderLook();
        updReadout(); P.requestDraw();
      };
      xInp.addEventListener('input', () => setX(+xInp.value));

      /* ---------- state per task ---------- */
      const builderDefault = t => { const o = t.k + t.step; R.bL = clamp(rnd(t.a - o), t.lo, t.hi); R.bR = clamp(rnd(t.a + o), t.lo, t.hi); R.reg = null; R.cl = null; };
      const wInit = () => {
        const t = cur;
        Object.assign(R, { phase: t.e ? 'iso' : 'split', cs: null, ci: 0, rows: [], hist: [], op: 'sub', amt: 1, tested: {}, sols: [], eq: null, noSol: false, isoOk: !t.e });
      };
      const loadTask = t => {
        cancelFa(); cur = t;
        R = { phase: t.gate ? 'gate' : 'main', fb: '', marks: (t.given || []).slice(), err: 0, rel: t.rel, done: false, onDone: R.onDone };
        if (t.type === 'work') wInit();
        if (t.type === 'graph') builderDefault(t);
        st.x = t.x0 || 0; st.fa = 1;
        if (t.type !== 'work') cfgSlider(t);
        refresh();
      };
      const finish = () => {
        R.done = true; R.phase = 'done'; st.fa = 0;
        cancelFa(); cancelFa = animateTo(st, { fa: 1 }, 700, () => P.requestDraw());
        refresh();
        if (R.onDone) R.onDone();
      };

      /* ---------- the test-point readout ---------- */
      const updReadout = () => {
        const t = cur; if (!t || t.type === 'work') { roEl.innerHTML = ''; return; }
        const hideSt = R.phase === 'gate' && t.gate && t.gate.hide;
        const x = st.x, d = Math.abs(x - t.a), rel = R.rel, ok = holds(x, t.a, t.k, rel);
        roEl.innerHTML = `<span class="k">Distance</span> ${dtxt(x, t.a)} = ${num(rnd(d))}` + (hideSt ? '' :
          `<br><span class="k">Test</span> ${num(rnd(d))} ${rel} ${num(t.k)}? ${ok ? 'Yes' : 'No'}. So x = ${num(x)} ${ok ? 'is' : 'is not'} a solution.`);
      };

      /* ---------- gate (predict or translate) ---------- */
      const pickGate = i => {
        const t = cur, g = t.gate, right = i === g.ans;
        if (!right) R.err++;
        R.fb = (right ? good('Yes.') : bad('Not quite.')) + ' ' + g.ch[i][1];
        if (right) { if (t.type === 'special') { R.fb += ' ' + (t.mark != null ? 'The point is marked on the line.' : ''); finish(); } else R.phase = 'main'; }
        refresh();
      };

      /* ---------- find: mark solutions ---------- */
      const doMark = () => {
        const t = cur, x = st.x, d = Math.abs(x - t.a), sols = solsOf(t);
        if (R.marks.some(m => Math.abs(m - x) < 1e-9)) { R.fb = `You already marked ${num(x)}. Look for the other point that is ${num(t.k)} away from ${num(t.a)}.`; refresh(); return; }
        if (holds(x, t.a, t.k, '=')) {
          R.marks.push(x);
          R.fb = good('Yes.') + ` ${dtxt(x, t.a)} = ${num(rnd(d))}, which is the distance ${num(t.k)} we want. ${x < t.a ? 'This point is to the left of ' + num(t.a) + '.' : 'This point is to the right of ' + num(t.a) + '.'}`;
          if (R.marks.length >= sols.length) { R.fb += ` That is both: one on each side, ${num(t.k)} steps from ${num(t.a)}.`; refresh(); finish(); return; }
          R.fb += ` Is there another point that is ${num(t.k)} away from ${num(t.a)}?`;
        } else {
          R.err++;
          R.fb = bad('Not yet.') + ` ${dtxt(x, t.a)} = ${num(rnd(d))}, not ${num(t.k)}. ${d > t.k ? 'The point is too far from ' + num(t.a) + '. Move it closer.' : 'The point is too close to ' + num(t.a) + '. Move it farther away.'}`;
        }
        refresh();
      };

      /* ---------- graph: build the solution set ---------- */
      const gDone = (t, rel) => {
        const L = num(rnd(t.a - t.k)), Rr = num(rnd(t.a + t.k)), A = num(t.a), K = num(t.k), lt = rel === '<' || rel === '≤', closed = rel === '≤' || rel === '≥';
        const body = lt ? `Points between ${L} and ${Rr} are closer to ${A} than ${K}${closed ? ' (or exactly ' + K + ' away)' : ''}, so they work. The center, ${A}, has distance 0, so it works too.`
          : `Points outside ${L} and ${Rr} are farther from ${A} than ${K}${closed ? ' (or exactly ' + K + ' away)' : ''}, so they work: two rays. The center, ${A}, has distance 0 and fails.`;
        const edge = closed ? `The sign ${rel} includes "equal to", so ${L} and ${Rr}, exactly ${K} away, are solutions: closed circles.`
          : `The sign ${rel} is strict, so ${L} and ${Rr}, exactly ${K} away, are not solutions: open circles.`;
        return body + ' ' + edge;
      };
      const doCheck = () => {
        const t = cur, rel = R.rel, a = t.a, k = t.k, eL = rnd(a - k), eR = rnd(a + k), e = 1e-9;
        const lt = rel === '<' || rel === '≤', closed = rel === '≤' || rel === '≥', ex = lt ? 'in' : 'out';
        if (R.reg == null || R.cl == null) { R.fb = 'Choose "between" or "outside", and open or closed circles, then check.'; refresh(); return; }
        let msg = null;
        if (Math.abs(R.bL - eL) > e || Math.abs(R.bR - eR) > e) {
          msg = `The edges are the points exactly ${num(k)} from ${num(a)}. Your left edge ${num(R.bL)} is ${num(rnd(Math.abs(R.bL - a)))} away and your right edge ${num(R.bR)} is ${num(rnd(Math.abs(R.bR - a)))} away. Go ${num(k)} left and ${num(k)} right of ${num(a)}.`;
        } else if (R.reg !== ex) {
          msg = lt ? `Test the center: x = ${num(a)} has distance 0, and 0 ${rel} ${num(k)} is true. So the center is a solution: shade between the edges.`
            : `Test the center: x = ${num(a)} has distance 0, and 0 ${rel} ${num(k)} is false. The middle is not a solution: shade outside the edges.`;
        } else if (R.cl !== closed) {
          msg = closed ? `The sign ${rel} includes "equal to". A point exactly ${num(k)} away gives ${num(k)} ${rel} ${num(k)}, which is true. Use closed circles.`
            : `The sign ${rel} is strict. A point exactly ${num(k)} away gives ${num(k)} ${rel} ${num(k)}, which is false. Use open circles.`;
        }
        if (msg) { R.err++; R.fb = bad('Not yet.') + ' ' + msg; refresh(); return; }
        R.fb = good('Right.') + ' ' + gDone(t, rel) + (t.rels ? ' Try another sign.' : '');
        R.okRel = R.okRel || {}; R.okRel[rel] = true;
        refresh(); finish();
      };
      const nudge = (which, d) => {
        const t = cur;
        if (which === 'L') R.bL = clamp(rnd(R.bL + d * t.step), t.lo, rnd(R.bR - t.step)); else R.bR = clamp(rnd(R.bR + d * t.step), rnd(R.bL + t.step), t.hi);
        refresh();
      };
      const setRel = r => { R.rel = r; R.fb = ''; R.phase = 'main'; R.done = false; builderDefault(cur); updReadout(); refresh(); };

      /* ---------- workbench ---------- */
      const isoMv = t => {
        const e = t.e, a = Math.abs(e), ab = absStr(t);
        return {
          ok: { label: e > 0 ? `Subtract ${a} from both sides` : `Add ${a} to both sides`, ok: true,
            fb: `That cancels the ${e > 0 ? '+' : MI}${a} next to the bars. Both sides changed equally. Now the bars stand alone: ${ab} = ${num(isoVal(t))}.` },
          opp: { label: e > 0 ? `Add ${a} to both sides` : `Subtract ${a} from both sides`,
            fb: `That ${e > 0 ? 'adds even more' : 'takes away even more'} next to the bars. To cancel ${e > 0 ? '+' : MI}${a}, do the opposite: ${e > 0 ? 'subtract' : 'add'} ${a}.` },
          drop: { label: 'Remove the bars, then solve',
            fb: `The bars cannot just be dropped. They mean a distance, and the ${e > 0 ? '+' : MI}${a} sits outside them. First get the bars alone, then deal with the bars.` },
          div: { label: `Divide both sides by ${t.c}`,
            fb: `Dividing first is legal but messy: it also divides the ${a} outside the bars, and the bars are still not alone. Cancel the ${e > 0 ? '+' : MI}${a} first.` }
        };
      };
      const pickIso = key => {
        const t = cur, mv = isoMv(t)[key];
        if (!mv.ok) { R.err++; R.fb = bad('Not that move.') + ' ' + mv.fb; refresh(); return; }
        R.rows.push({ note: 'Get the bars alone', eq: `${absStr(t)} = ${num(isoVal(t))}` });
        R.fb = good('Good.') + ' ' + mv.fb; R.phase = 'split'; R.isoOk = true; refresh();
      };
      const splitMv = t => {
        const v = isoVal(t), l = lin(t.c, t.d), pos = v > 0, V = num(v), nV = num(-v);
        return {
          two: { label: 'Split into two equations', ok: pos,
            fb: pos ? `|u| = ${V} means the inside, ${l}, is ${V} away from 0. So ${l} is ${V} or ${nV}. That gives two equations.`
              : `Splitting assumes a distance of ${V} exists. Distances are never negative, so any x you found would fail the check in the original equation.` },
          one: { label: 'Drop the bars and solve one equation', ok: false,
            fb: pos ? `That keeps only ${l} = ${V}. But ${l} = ${nV} is also ${V} away from 0, so you would lose a solution. This is the classic trap.`
              : `That treats ${V} as if it were a distance. A distance cannot be negative, so the bars cannot equal ${V}.` },
          none: { label: 'There is no solution', ok: !pos,
            fb: pos ? `No solution happens only when the bars equal a negative number. Here they equal ${V}, and numbers ${V} away from 0 exist on both sides.`
              : `The bars equal ${V}. A distance is never negative, so nothing can make that true. There is no solution.` }
        };
      };
      const pickSplit = key => {
        const t = cur, mv = splitMv(t)[key], v = isoVal(t);
        if (!mv.ok) { R.err++; R.fb = bad('Not quite.') + ' ' + mv.fb; refresh(); return; }
        if (key === 'none') { R.noSol = true; R.rows.push({ note: 'Decide', eq: 'No solution' }); R.fb = good('Right.') + ' ' + mv.fb; refresh(); finish(); return; }
        R.cs = [{ p: Q(t.c), q: Q(t.d), r: Q(v) }, { p: Q(t.c), q: Q(t.d), r: Q(-v) }];
        R.rows.push({ note: 'Split into two cases', eq: `Case 1: ${eqQ(R.cs[0].p, R.cs[0].q, R.cs[0].r, 'x')}<br>Case 2: ${eqQ(R.cs[1].p, R.cs[1].q, R.cs[1].r, 'x')}` });
        R.ci = 0; R.eq = R.cs[0]; R.fb = good('Good.') + ' ' + mv.fb; R.phase = 'solve'; R.hist = []; refresh();
      };
      const opWord = (k, n) => (k === 'add' ? `add ${n} to both sides` : k === 'sub' ? `subtract ${n} from both sides` : k === 'mul' ? `multiply both sides by ${n}` : `divide both sides by ${n}`);
      const opGer = (k, n) => (k === 'add' ? `Adding ${n} to both sides` : k === 'sub' ? `Subtracting ${n} from both sides` : k === 'mul' ? `Multiplying both sides by ${n}` : `Dividing both sides by ${n}`);
      const doOp = () => {
        const { p, q, r } = R.eq, k = R.op, n = R.amt, N = Q(n), nn = num(n), sg = a => (a[0] > 0 ? '+' : '') + qtxt(a);
        const f = k === 'add' ? x => qadd(x, N) : k === 'sub' ? x => qadd(x, Q(-n)) : k === 'mul' ? x => qmul(x, N) : x => qdiv(x, N);
        const nq = f(q), np = (k === 'mul' || k === 'div') ? f(p) : p, nr = f(r);
        R.hist.push({ eq: { p, q, r }, rows: R.rows.length });
        let msg;
        if (k === 'add' || k === 'sub') {
          if (!q0(q) && q0(nq)) msg = good('Good.') + ` ${opGer(k, nn)} cancels the ${sg(q)} on the left: ${sg(q)} ${k === 'add' ? '+' : MI} ${nn} = 0. The right side gets the same change, so ${qtxt(r)} becomes ${qtxt(nr)}. Both sides changed equally.`;
          else if (q0(q)) msg = `Allowed: both sides changed equally. But there is no added or subtracted number left on the left. The ${qpw(p, 'x')} needs to be divided away.`;
          else msg = `Allowed: both sides changed equally. But the left side now has ${sg(nq)} next to the x term. To cancel ${sg(nq)}, ${nq[0] > 0 ? 'subtract' : 'add'} ${qtxt([Math.abs(nq[0]), nq[1]])}.`;
        } else if (k === 'div' && q0(q) && np[0] === np[1]) {
          msg = good('Good.') + ` ${qpw(p, 'x')} means ${qtxt(p)} times x. ${opGer(k, nn)} undoes the multiplying: ${qtxt(r)} ÷ ${nn} = ${qtxt(nr)}.`;
        } else if (!q0(q)) {
          msg = 'Allowed: you did the same thing to both sides. But every term had to change, so fractions can appear. It is usually easier to cancel the added or subtracted number first.';
        } else msg = `Allowed: both sides changed equally. But it did not get x alone. Think about what ${qpw(p, 'x')} is doing to x, and undo it.`;
        R.eq = R.cs[R.ci] = { p: np, q: nq, r: nr };
        R.rows.push({ note: opGer(k, nn), eq: eqQ(np, nq, nr, 'x') });
        R.fb = msg;
        if (np[0] === np[1] && q0(nq)) caseSolved(qval(nr));
        refresh();
      };
      const caseSolved = val => {
        R.sols.push(val);
        R.hist = []; R.rows.push({ note: `Case ${R.ci + 1} solved`, eq: `x = ${num(rnd(val))}` });
        R.fb += ` Case ${R.ci + 1} gives x = ${num(rnd(val))}.`;
        if (R.ci === 0) { R.ci = 1; R.eq = R.cs[1]; R.fb += ' Now solve case 2.'; }
        else { R.phase = 'check'; R.fb += ' Both cases are solved. But a solution is only trusted after you check it in the original equation.'; }
      };
      const undoOp = () => { const l = R.hist.pop(); if (!l) return; R.eq = R.cs[R.ci] = l.eq; R.rows.length = l.rows; R.fb = 'Undone. The equation is back to what it was.'; refresh(); };
      const doTest = i => {
        const t = cur, x = R.sols[i], ic = t.c * x + t.d, lhs = Math.abs(ic) + t.e, ok = lhs === t.f;
        const cs = t.c === 1 ? par(x) : t.c === -1 ? MI + par(x) : `${t.c}(${num(x)})`;
        R.tested[i] = true;
        R.rows.push({ note: `Test x = ${num(x)} in ${wEq(t)}`, eq: `|${cs} ${t.d < 0 ? MI : '+'} ${Math.abs(t.d)}| ${t.e < 0 ? MI : '+'} ${Math.abs(t.e)} = |${num(ic)}| ${t.e < 0 ? MI : '+'} ${Math.abs(t.e)} = ${num(lhs)} ${ok ? '✓' : '✗'}` });
        if (R.tested[0] && R.tested[1]) { R.fb = good('Both true.') + ` Both x = ${num(R.sols[0])} and x = ${num(R.sols[1])} make the original equation true. The yellow points on the lower line are the two solutions. On the upper line they are the two spots ${num(isoVal(t))} away from 0.`; refresh(); finish(); return; }
        R.fb = `True for x = ${num(x)}. That is one. Check the other solution too.`;
        refresh();
      };

      /* ---------- the dynamic panel ---------- */
      const nextText = () => {
        const t = cur, ph = R.phase;
        if (ph === 'gate') return t.gate.q;
        if (t.type === 'find' && ph === 'main') return `Move the point until the blue bar is ${num(t.k)} long, then press Mark. ${R.marks.length} of ${solsOf(t).length} found${R.marks.length ? ' (' + R.marks.map(num).join(', ') + ')' : ''}.`;
        if (t.type === 'graph' && ph !== 'gate') return `Build the graph of ${stmt(t.a, t.k, R.rel)}: set the edges, choose between or outside, choose open or closed, then check.`;
        if (t.type === 'work') {
          if (ph === 'iso') return 'The bars have a number added or subtracted outside them. Choose a move to get the bars alone.';
          if (ph === 'split') return `The bars equal ${num(isoVal(t))}. What does that tell you?`;
          if (ph === 'solve') return `Solve case ${R.ci + 1}. Choose a move and an amount, then apply it to both sides.`;
          if (ph === 'check') return 'Check each solution in the original equation. Test both.';
        }
        return '';
      };
      const actions = () => {
        const t = cur, ph = R.phase, out = [], row = (...els) => h('div', { class: 'ctl buttons' }, ...els), col = els => h('div', { class: 'ave-col' }, ...els);
        if (ph === 'gate') out.push(col(t.gate.ch.map((c, i) => btn(c[0], () => pickGate(i)))));
        else if (t.type === 'find' && ph !== 'done') out.push(row(btn('Mark x as a solution', doMark, true)));
        else if (t.type === 'graph') {
          const stp = (lab, which, v) => h('div', { class: 'ave-step' }, h('span', { class: 'ave-lab' }, lab), btn('−', () => nudge(which, -1), false, lab + ' down'), h('output', { 'aria-live': 'polite' }, num(v)), btn('+', () => nudge(which, 1), false, lab + ' up'));
          const tg = (items, cur0, set) => row(...items.map(([v, l]) => { const b = btn(l, () => { set(v); refresh(); }); b.classList.toggle('primary', cur0 === v); b.setAttribute('aria-pressed', String(cur0 === v)); return b; }));
          out.push(h('p', { class: 'ave-sec' }, 'Build the graph'));
          out.push(stp('Left edge', 'L', R.bL), stp('Right edge', 'R', R.bR));
          out.push(tg([['in', 'Between the edges'], ['out', 'Outside the edges']], R.reg, v => { R.reg = v; }));
          out.push(tg([[false, '○ Open circles'], [true, '● Closed circles']], R.cl, v => { R.cl = v; }));
          out.push(row(btn('Check my graph', doCheck, true)));
        } else if (t.type === 'work') {
          if (ph === 'iso') { const mv = isoMv(t), ks = t.ord || ['opp', 'ok', 'drop']; out.push(col(ks.filter(k => k !== 'div' || t.c !== 1).map(k => btn(mv[k].label, () => pickIso(k))))); if (t.c !== 1 && !ks.includes('div')) out.push(col([btn(mv.div.label, () => pickIso('div'))])); }
          else if (ph === 'split') { const mv = splitMv(t), ks = t.sord || ['one', 'two', 'none']; out.push(col(ks.map(k => btn(mv[k].label, () => pickSplit(k))))); }
          else if (ph === 'solve') {
            const kinds = [['add', 'Add'], ['sub', 'Subtract'], ['mul', 'Multiply'], ['div', 'Divide']];
            const o2 = h('output', { 'aria-live': 'polite' }), ap = btn('', doOp, true);
            const kb = kinds.map(([k, l]) => btn(l, () => { R.op = k; upd(); }));
            const upd = () => { o2.textContent = num(R.amt); ap.textContent = 'Apply: ' + opWord(R.op, num(R.amt)); kb.forEach((b, i) => { b.classList.toggle('primary', kinds[i][0] === R.op); b.setAttribute('aria-pressed', String(kinds[i][0] === R.op)); }); };
            const stepA = d => { let n = R.amt + d; if (n === 0) n += d > 0 ? 1 : -1; R.amt = clamp(n, 1, 40); upd(); };
            upd();
            out.push(h('p', { class: 'ave-sec' }, `Case ${R.ci + 1}`));
            out.push(row(...kb));
            out.push(h('div', { class: 'ave-step' }, 'Amount', btn('−5', () => stepA(-5)), btn('−1', () => stepA(-1)), o2, btn('+1', () => stepA(1)), btn('+5', () => stepA(5))));
            const un = btn('Undo', undoOp); un.disabled = !R.hist.length;
            out.push(row(ap, un));
          } else if (ph === 'check') out.push(row(...[0, 1].map(i => { const b = btn(`Test x = ${num(R.sols[i])}`, () => doTest(i), true); b.disabled = !!R.tested[i]; return b; })));
          if (ph !== 'gate' && R.rows.length && ph !== 'done') out.push(row(btn('Start over', () => { const e = R.err, od = R.onDone; loadTask(cur); R.err = e; R.onDone = od; })));
        }
        return out;
      };
      const chooser = () => {
        const t = cur, out = [];
        if (st.practice) return out;
        if (t.rels) {
          out.push(h('p', { class: 'ave-sec' }, 'Choose a sign'));
          out.push(h('div', { class: 'ctl buttons' }, ...[['<', '< less than'], ['≤', '≤ at most'], ['>', '> greater than'], ['≥', '≥ at least']].map(([r, l]) => { const b = btn(l, () => setRel(r)); b.classList.toggle('primary', R.rel === r); b.setAttribute('aria-pressed', String(R.rel === r)); if (R.okRel && R.okRel[r]) b.append(' ✓'); return b; })));
        }
        if (stepTask === 'cases') {
          out.push(h('p', { class: 'ave-sec' }, 'Pick an example'));
          out.push(h('div', { class: 'ctl buttons' }, ...CASES.map((c, i) => { const b = btn(c.name, () => { caseI = i; loadTask(CASES[i]); }); b.classList.toggle('primary', caseI === i); b.setAttribute('aria-pressed', String(caseI === i)); return b; })));
        }
        return out;
      };
      const cardsHtml = () => {
        const t = cur;
        if (t.type !== 'work') return null;
        return h('div', { class: 'ave-cards' }, h('div', { class: 'ave-card' }, h('span', { class: 'ave-note' }, 'Equation'), wEq(t)));
      };
      const refresh = () => {
        const t = cur; if (!t) return;
        const work = t.type === 'work';
        let txt = t.intro || '';
        if (st.practice) txt = PR.head + ' ' + (t.story || '');
        else {
          if (stepTask === 'cases') txt = '<b>' + t.name + '.</b> ' + txt;
          if (t.type === 'graph' && !(R.phase === 'gate' && t.gate && t.gate.hide)) txt += ` <b>${stmt(t.a, t.k, R.rel)}</b>`;
        }
        promptEl.innerHTML = txt; promptEl.style.display = txt ? '' : 'none';
        chooseEl.replaceChildren(...chooser());
        xBox.style.display = work ? 'none' : ''; roEl.style.display = work ? 'none' : '';
        const ae = document.activeElement, ak = ae && panel.contains(ae) && ae.dataset ? ae.dataset.k : null;
        const nt = nextText();
        const els = [];
        const cd = cardsHtml(); if (cd) els.push(cd);
        if (work && R.rows.length) els.push(h('div', { class: 'ave-log' }, ...R.rows.map(r => h('div', {}, h('span', { class: 'ave-note' }, r.note), h('span', { class: 'ave-req', html: r.eq })))));
        els.push(...actions());
        els.push(h('div', { class: 'ave-coach', 'aria-live': 'polite' }, ...((R.fb ? [h('p', { html: R.fb })] : []).concat(nt ? [h('p', { class: 'ave-next', html: nt })] : []))));
        dynEl.replaceChildren(...els);
        if (ak) { const n = Array.from(panel.querySelectorAll('button')).find(x => x.dataset.k === ak && !x.disabled); if (n) n.focus(); }
        updReadout(); P.draw();
      };

      /* ---------- practice ---------- */
      const PR = { idx: 0, solved: 0, first: 0, head: '' };
      let startBtn, pTally, pFb, pNext, pBox;
      C.title('Practice');
      C.hint('Seven short problems on the same number line. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancelFa(); if (st.practice) leavePractice(); else { st.practice = true; PR.idx = 0; PR.solved = 0; PR.first = 0; loadProb(); } } }])[0];
      pBox = h('div', { class: 'ave-col', style: 'display:none' });
      pTally = h('p', { class: 'ctl-title ave-tally' });
      pFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
      pNext = btn('Next problem', () => nextProb(), true); pNext.disabled = true;
      pBox.append(pTally, pFb, h('div', { class: 'ctl buttons' }, pNext));
      panel.append(pBox);
      const tally = () => { pTally.textContent = `${PR.solved} of ${PROBS.length} solved, ${PR.first} on the first try`; };
      const loadProb = () => {
        const pr = PROBS[PR.idx];
        PR.head = `<b>Problem ${PR.idx + 1} of ${PROBS.length}: ${pr.name}.</b>`;
        const od = onProbDone; R.onDone = od;
        pr.t.intro = ''; pr.t.story = pr.story;
        loadTask(pr.t); R.onDone = od;
        pBox.style.display = ''; pFb.innerHTML = ''; pNext.disabled = true; pNext.textContent = PR.idx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        tally(); sync();
      };
      const onProbDone = () => {
        PR.solved++; const first = R.err === 0; if (first) PR.first++;
        pNext.disabled = false; tally();
        pFb.innerHTML = good('Problem solved.') + (first ? ' You did it with no wrong choices.' : ' You had a wrong choice on the way, and the feedback told you why. That is how it sticks.');
      };
      const nextProb = () => {
        if (PR.idx < PROBS.length - 1) { PR.idx++; loadProb(); return; }
        pNext.disabled = true;
        pFb.innerHTML = `All seven problems are done. You got ${PR.first} of ${PROBS.length} with no wrong choices. Press Back to the lesson to return to the steps.`;
      };
      const leavePractice = () => { st.practice = false; pBox.style.display = 'none'; loadTask(stepTask === 'cases' ? CASES[caseI] : stepTask === 'work' ? T_WORK : stepTask === 'graph' ? T_GRAPH : T_FIND); sync(); };
      const sync = () => { startBtn.textContent = st.practice ? 'Back to the lesson' : 'Start practice'; topTitle.style.display = ''; };

      /* ---------- canvas ---------- */
      const FONT = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
      const text = (c, pal, s, x, y, o = {}) => {
        c.font = `${o.w || 600} ${o.fs}px ${FONT}`; c.textAlign = o.al || 'center'; c.textBaseline = 'middle';
        if (!o.al) { const tw = c.measureText(s).width / 2 + 8; x = clamp(x, tw, c.canvas.clientWidth - tw); }
        c.lineWidth = 4; c.strokeStyle = pal.stage; c.lineJoin = 'round'; c.strokeText(s, x, y);
        c.fillStyle = o.col || pal.text; c.fillText(s, x, y);
      };
      const wrapTitle = (c, pal, s, w, fs, y) => {
        c.font = `700 ${fs}px ${FONT}`;
        if (c.measureText(s).width <= w - 20) { text(c, pal, s, w / 2, y, { fs, w: 700 }); return; }
        const words = s.split(' '), lines = ['']; words.forEach(wd => { const l = lines[lines.length - 1]; if (c.measureText(l + ' ' + wd).width > w - 20 && l) lines.push(wd); else lines[lines.length - 1] = l ? l + ' ' + wd : wd; });
        lines.forEach((l, i) => text(c, pal, l, w / 2, y + i * fs * 1.25, { fs, w: 700 }));
      };
      const geo = p => { const ml = clamp(p.w * .075, 24, 44); return { ml, W: p.w - 2 * ml }; };
      const drawAxis = (c, pal, g, y, lo, hi, lab, step, fs, ys) => {
        const X = v => g.ml + (v - lo) / (hi - lo) * g.W;
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.ml - 12, y); c.lineTo(g.ml + g.W + 12, y); c.stroke();
        const n = Math.round((hi - lo) / step);
        for (let i = 0; i <= n; i++) {
          const v = lo + i * step, isL = Math.abs((v - lo) / lab - Math.round((v - lo) / lab)) < 1e-6;
          c.strokeStyle = pal['grid-strong']; c.lineWidth = 1.5; c.beginPath(); c.moveTo(X(v), y - (isL ? 7 : 4)); c.lineTo(X(v), y + (isL ? 7 : 4)); c.stroke();
          if (isL) text(c, pal, num(rnd(v)), X(v), y + (ys || 22), { fs: fs - 1, w: 500, col: pal.muted });
        }
        return X;
      };
      const ring = (c, pal, x, y, r, closed, col) => {
        c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = closed ? col : pal.stage; c.fill(); c.strokeStyle = col; c.lineWidth = 3.5; c.stroke();
      };
      P.onDraw = (c, p) => {
        const t = cur; if (!t) return;
        const pal = p.pal, w = p.w, hh = p.h, fs = clamp(w * .036, 13.5, 17), g = geo(p);
        if (t.type === 'work') return drawWork(c, p, pal, g, fs);
        const gate = R.phase === 'gate', hideSt = gate && t.gate && t.gate.hide;
        const y0 = hh * .5, X = drawAxis(c, pal, g, y0, t.lo, t.hi, t.lab, t.step, fs);
        const title = hideSt ? (t.title || '') : stmt(t.a, t.k, R.rel);
        wrapTitle(c, pal, title, w, clamp(w * .045, 16, 22), 30);
        const rel = R.rel, x = st.x, d = Math.abs(x - t.a);
        const showB = t.type === 'graph' && !gate;
        /* solution set */
        if (showB) {
          const xl = X(R.bL), xr = X(R.bR);
          if (R.reg) {
            c.strokeStyle = pal.yellow; c.lineWidth = 9; c.lineCap = 'butt'; c.beginPath();
            if (R.reg === 'in') { c.moveTo(xl, y0); c.lineTo(xr, y0); }
            else { c.moveTo(g.ml - 12, y0); c.lineTo(xl, y0); c.moveTo(xr, y0); c.lineTo(g.ml + g.W + 12, y0); }
            c.stroke();
            if (R.reg === 'out') { c.fillStyle = pal.yellow; [[g.ml - 14, -1], [g.ml + g.W + 14, 1]].forEach(([ax, dr]) => { c.beginPath(); c.moveTo(ax + dr * 9, y0); c.lineTo(ax, y0 - 8); c.lineTo(ax, y0 + 8); c.closePath(); c.fill(); }); }
          }
          const col = R.reg ? pal.yellow : pal.muted, cl = R.cl == null ? false : R.cl;
          ring(c, pal, xl, y0, 10, cl, col); ring(c, pal, xr, y0, 10, cl, col);
          text(c, pal, num(R.bL), xl, y0 - 28, { fs: fs - 1 }); text(c, pal, num(R.bR), xr, y0 - 28, { fs: fs - 1 });
          if (R.reg === 'in' && xr - xl > 150) text(c, pal, 'between', (xl + xr) / 2, y0 - 28, { fs: fs - 1, col: pal.muted, w: 500 });
          if (R.reg === 'out') { const e0 = g.ml - 12, e1 = g.ml + g.W + 12; if (xl - e0 > 130) text(c, pal, 'outside', (e0 + xl) / 2, y0 - 28, { fs: fs - 1, col: pal.muted, w: 500 }); if (e1 - xr > 130) text(c, pal, 'outside', (xr + e1) / 2, y0 - 28, { fs: fs - 1, col: pal.muted, w: 500 }); }
        }
        /* marks */
        if (t.type === 'find' || t.type === 'special') {
          const ms = t.type === 'find' ? R.marks : (R.done && t.mark != null ? [t.mark] : []);
          ms.forEach(m => { ring(c, pal, X(m), y0, 10, true, pal.yellow); text(c, pal, 'x = ' + num(m), X(m), y0 - 28, { fs: fs - 1 }); });
          if (t.type === 'find' && R.done && R.marks.length === 2) {
            const [m1, m2] = R.marks.slice().sort((a, b) => a - b), yb = y0 - hh * .27;
            c.save(); c.globalAlpha = clamp(st.fa, 0, 1);
            [m1, m2].forEach(m => {
              c.strokeStyle = pal.violet; c.lineWidth = 3; c.setLineDash([8, 6]); c.beginPath(); c.moveTo(X(t.a), yb); c.lineTo(X(m), yb); c.stroke(); c.setLineDash([]);
              c.beginPath(); c.moveTo(X(m), yb - 6); c.lineTo(X(m), yb + 6); c.stroke();
              text(c, pal, num(t.k) + ' away', (X(t.a) + X(m)) / 2, yb - 16, { fs: fs - 1, col: pal.violet });
            }); c.restore();
          }
        }
        if (t.type === 'graph' && R.done) {
          const yb = y0 - hh * .27; c.save(); c.globalAlpha = clamp(st.fa, 0, 1);
          [R.bL, R.bR].forEach(m => {
            c.strokeStyle = pal.violet; c.lineWidth = 3; c.setLineDash([8, 6]); c.beginPath(); c.moveTo(X(t.a), yb); c.lineTo(X(m), yb); c.stroke(); c.setLineDash([]);
            c.beginPath(); c.moveTo(X(m), yb - 6); c.lineTo(X(m), yb + 6); c.stroke();
            text(c, pal, num(t.k) + ' away', (X(t.a) + X(m)) / 2, yb - 16, { fs: fs - 1, col: pal.violet });
          }); c.restore();
        }
        /* distance bar */
        const ybar = y0 - hh * .17;
        {
          c.strokeStyle = pal.blue; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(X(t.a), ybar); c.lineTo(X(x), ybar); c.stroke();
          c.strokeStyle = pal.muted; c.lineWidth = 1.5; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(X(x), ybar); c.lineTo(X(x), y0); c.moveTo(X(t.a), ybar); c.lineTo(X(t.a), y0); c.stroke(); c.setLineDash([]);
          const mid = (X(x) + X(t.a)) / 2;
          text(c, pal, 'distance = ' + num(rnd(d)), clamp(mid, 70, w - 70), ybar - 15, { fs, col: pal.blue });
        }
        /* fixed point a */
        c.beginPath(); c.arc(X(t.a), y0, 8, 0, TAU); c.fillStyle = pal.violet; c.fill();
        text(c, pal, 'a = ' + num(t.a), X(t.a), y0 + 46, { fs, col: pal.violet });
        /* test point */
        const ok = holds(x, t.a, t.k, rel);
        c.beginPath(); c.arc(X(x), y0, 11, 0, TAU); c.fillStyle = pal.stage; c.fill(); c.strokeStyle = pal.brass; c.lineWidth = 3.5; c.stroke();
        c.beginPath(); c.arc(X(x), y0, 4.5, 0, TAU); c.fillStyle = pal.blue; c.fill();
        const near = Math.abs(X(x) - X(t.a)) < 70;
        text(c, pal, `x = ${num(x)}` + (hideSt ? '' : (ok ? ' (solution)' : ' (not a solution)')), clamp(X(x), 80, w - 80), y0 + (near ? 70 : 46), { fs, col: hideSt ? pal.text : ok ? pal.green : pal.red });
        /* special verdict */
        if (t.type === 'special' && R.done) text(c, pal, t.verdict, w / 2, y0 + hh * .24, { fs: fs + 3, w: 700 });
        /* legend */
        if (showB) {
          const ly = hh - 46, lx = Math.max(16, w * .08);
          ring(c, pal, lx + 6, ly, 6, false, pal.yellow); text(c, pal, 'open circle: this number is NOT a solution', lx + 20, ly, { fs: fs - 1, w: 500, al: 'left', col: pal.text });
          ring(c, pal, lx + 6, ly + 22, 6, true, pal.yellow); text(c, pal, 'closed circle: this number IS a solution', lx + 20, ly + 22, { fs: fs - 1, w: 500, al: 'left', col: pal.text });
        }
      };
      const drawWork = (c, p, pal, g, fs) => {
        const t = cur, w = p.w, hh = p.h, v = isoVal(t), ph = R.phase;
        wrapTitle(c, pal, wEq(t), w, clamp(w * .045, 16, 22), 30);
        const yU = hh * .36, yX = hh * .74, am = Math.max(Math.abs(v), 1) + 2, lab = am * 2 > 14 ? 2 : 1;
        const XU = drawAxis(c, pal, g, yU, -am, am, lab, 1, fs), XX = drawAxis(c, pal, g, yX, t.lo, t.hi, 1, 1, fs);
        text(c, pal, 'u = ' + lin(t.c, t.d) + '  (the inside of the bars)', g.ml - 12, yU - 80, { fs, al: 'left', col: pal.blue });
        text(c, pal, 'x', g.ml - 12, yX - 54, { fs: fs + 2, al: 'left', col: pal.blue });
        c.beginPath(); c.arc(XU(0), yU, 7, 0, TAU); c.fillStyle = pal.violet; c.fill();
        text(c, pal, 'u = 0', XU(0), yU + 46, { fs, col: pal.violet });
        const isoDone = R.isoOk;
        if (isoDone && v > 0) {
          [v, -v].forEach(u => {
            c.strokeStyle = pal.blue; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(XU(0), yU - 24); c.lineTo(XU(u), yU - 24); c.stroke();
            ring(c, pal, XU(u), yU, 9, true, pal.yellow); text(c, pal, 'u = ' + num(u), XU(u), yU - 40, { fs: fs - 1 });
          });
          text(c, pal, num(v) + ' away from 0 on both sides', w / 2, yU + 70, { fs: fs - 1, w: 500, col: pal.muted });
        }
        if (isoDone && v < 0) text(c, pal, `No point is ${num(v)} away from 0: a distance is never negative.`, w / 2, yU + 46 + 28, { fs: fs - 1, col: pal.red });
        if (R.sols.length) {
          R.sols.forEach((s, i) => {
            const u = t.c * s + t.d;
            c.strokeStyle = pal.muted; c.lineWidth = 1.5; c.setLineDash([4, 5]); c.beginPath(); c.moveTo(XU(u), yU + 10); c.lineTo(XX(s), yX - 12); c.stroke(); c.setLineDash([]);
            ring(c, pal, XX(s), yX, 10, true, pal.yellow); text(c, pal, 'x = ' + num(rnd(s)), XX(s), yX - 28, { fs: fs - 1 });
          });
        }
        if (R.noSol) text(c, pal, 'No solution', w / 2, yX - 50, { fs: fs + 3, w: 700 });
      };

      /* ---------- pointer ---------- */
      const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      let drag = null;
      const handleAt = (px, py) => {
        const t = cur; if (!t || t.type === 'work') return null;
        const g = geo(P), X = v => g.ml + (v - t.lo) / (t.hi - t.lo) * g.W, y0 = P.h * .5;
        if (Math.abs(py - y0) > 40) return null;
        if (t.type === 'graph' && R.phase !== 'gate') {
          const dl = Math.abs(px - X(R.bL)), dr = Math.abs(px - X(R.bR)), dx = Math.abs(px - X(st.x));
          if (Math.min(dl, dr) <= 16 || (Math.min(dl, dr) < dx && Math.min(dl, dr) < 24)) return dl <= dr ? 'L' : 'R';
        }
        return Math.abs(px - X(st.x)) < 30 ? 'x' : null;
      };
      const moveH = (id, px) => {
        const t = cur, g = geo(P), v = clamp(rnd(snap(t.lo + (px - g.ml) / g.W * (t.hi - t.lo), t.step)), t.lo, t.hi);
        if (id === 'x') { setX(v); return; }
        if (id === 'L') R.bL = Math.min(v, rnd(R.bR - t.step)); else R.bR = Math.max(v, rnd(R.bL + t.step));
        R.bL = clamp(R.bL, t.lo, t.hi); R.bR = clamp(R.bR, t.lo, t.hi);
        refreshLight();
      };
      const refreshLight = () => refresh();
      cv.addEventListener('pointerdown', e => { const [px, py] = pos(e), id = handleAt(px, py); if (!id) return; drag = id; cv.setPointerCapture(e.pointerId); e.preventDefault(); cancelFa(); moveH(id, px); });
      cv.addEventListener('pointermove', e => { const [px, py] = pos(e); if (drag) moveH(drag, px); else cv.style.cursor = handleAt(px, py) ? 'grab' : 'default'; });
      cv.addEventListener('pointerup', () => { drag = null; }); cv.addEventListener('pointercancel', () => { drag = null; });

      /* ---------- steps ---------- */
      const apply = patch => {
        cancelFa();
        const was = st.practice; st.practice = false; pBox.style.display = 'none'; R.onDone = null;
        if (patch && patch.task) stepTask = patch.task;
        loadTask(stepTask === 'cases' ? CASES[caseI] : stepTask === 'work' ? T_WORK : stepTask === 'graph' ? T_GRAPH : T_FIND);
        sync();
      };
      apply({ task: 'find' });
      return { destroy: () => { cancelFa(); P.destroy(); }, apply };
    }
  });
}
