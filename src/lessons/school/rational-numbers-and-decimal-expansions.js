/* =====================================================================
   SCHOOL — Rational numbers and decimal expansions
   ===================================================================== */
{
  const MI = '−';
  const good = t => `<b style="color:var(--green)">${t}</b>`;
  const bad = t => `<b style="color:var(--red)">${t}</b>`;
  const kk = t => `<span class="k">${t}</span>`;
  const ovl = s => `<span style="text-decoration:overline">${s}</span>`;
  const lines = a => a.filter(Boolean).join('<br>');
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; };
  const SANS = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
  const font = (sz, w = 500) => `${w} ${sz}px ${SANS}`;
  const rr = (c, x, y, w, hh, r) => {
    c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.arcTo(x + w, y, x + w, y + r, r); c.lineTo(x + w, y + hh - r);
    c.arcTo(x + w, y + hh, x + w - r, y + hh, r); c.lineTo(x + r, y + hh); c.arcTo(x, y + hh, x, y + hh - r, r); c.lineTo(x, y + r); c.arcTo(x, y, x + r, y, r); c.closePath();
  };
  const wrap = (c, text, maxW) => {
    const out = []; let cur = '';
    text.split(' ').forEach(w => { const t = cur ? cur + ' ' + w : w; if (cur && c.measureText(t).width > maxW) { out.push(cur); cur = w; } else cur = t; });
    if (cur) out.push(cur); return out;
  };

  /* ---------- long division: a / b with a at least 0 ---------- */
  const longDiv = (a, b) => {
    const ip = Math.floor(a / b); let r = a % b; const rems = [r], digs = [], seen = {}; let j = -1;
    if (r) seen[r] = 0;
    while (r) {
      const d = Math.floor(r * 10 / b); r = r * 10 % b; digs.push(d); rems.push(r);
      if (r === 0) break;
      if (seen[r] !== undefined) { j = seen[r]; break; }
      seen[r] = digs.length;
    }
    return { a, b, ip, rems, digs, n: digs.length, j, pre: j < 0 ? digs.join('') : digs.slice(0, j).join(''), per: j < 0 ? '' : digs.slice(j).join('') };
  };
  const decHtml = D => D.ip + (D.n ? '.' + D.pre + (D.per ? ovl(D.per) : '') : '');
  const decPlain = (D, extra = 3) => { let s = D.pre; if (D.per) { while (s.length < D.pre.length + D.per.length * 2 + extra) s += D.per; s = s.slice(0, D.pre.length + D.per.length * 2 + extra); } return D.ip + (s ? '.' + s : '') + (D.per ? '…' : ''); };
  const factors = n => { const f = []; for (let p = 2; n > 1; p++) while (n % p === 0) { f.push(p); n /= p; } return f; };
  const fmtF = f => (f.length ? f.join(' × ') : '1');

  /* fractions used by the division stepper (the first five are in the menu) */
  const FR = [[3, 8], [1, 3], [5, 6], [1, 7], [7, 12], [7, 20], [5, 12]];
  const DV = FR.map(f => longDiv(f[0], f[1]));

  /* ---------- repeating decimals: prefix P, repeating block R ---------- */
  const TX = [
    { P: '', R: '3' }, { P: '', R: '36' }, { P: '4', R: '3' }, { P: '', R: '9' }, { P: '', R: '7' }, { P: '', R: '45' }
  ];
  const tVal = t => {
    const nP = t.P.length, a = +(t.P + t.R), b = t.P ? +t.P : 0;
    let n = a - b, d = Math.pow(10, nP) * (Math.pow(10, t.R.length) - 1); const g = gcd(n, d); return [n / g, d / g];
  };
  const tName = t => { let q = t.P; while (q.length < t.P.length + 4) q += t.R; return '0.' + q + '…'; };
  const fracS = (n, d) => (d === 1 ? String(n) : n + '/' + d);
  const tNameHtml = t => '0.' + t.P + ovl(t.R);
  const tStr = (t, len) => { let s = t.P; while (s.length < len) s += t.R; return s.slice(0, len); };
  const SHIFTS = [1, 10, 100, 1000];
  const shiftName = m => (m === 1 ? 'x' : m + 'x');
  /* the digits of m times the number, as {ip, fr (first 10 fraction digits), pos0 (position of the first fraction digit)} */
  const shifted = (t, m) => {
    const s = Math.round(Math.log10(m)), full = tStr(t, s + 12), ip = full.slice(0, s).replace(/^0+(?=\d)/, '') || '0';
    return { ip: ip === '' ? '0' : ip, fr: full.slice(s, s + 10), s, ipLen: full.slice(0, s).replace(/^0+/, '').length };
  };
  /* subtracting m1 x minus m2 x: exact value as a long division */
  const tDiff = (t, A, B) => { const [n, d] = tVal(t), N = (A - B) * n, g = gcd(N, d); return longDiv(N / g, d / g); };

  /* ---------- digits that never repeat ---------- */
  const SEQ = [
    { name: '√2', head: '1.', ip: '1', d: '414213562373095048801688724209698078569671875376948073176679' },
    { name: 'π', head: '3.', ip: '3', d: '141592653589793238462643383279502884197169399375105820974944' },
    { name: '1/7', head: '0.', ip: '0', d: '142857142857142857142857142857142857142857142857142857142857' }
  ];
  const firstBreak = (s, L, shown) => { for (let i = 0; i + L < shown; i++) if (s[i] !== s[i + L]) return i; return -1; };

  /* ---------- cards ---------- */
  const CARDS = [
    { t: '0.75', k: 0, why: '0.75 stops after two digits. It is 75/100, which is 3/4, a fraction of two integers.' },
    { t: '0.272727… (27 repeats)', k: 1, why: 'The block 27 repeats forever. With x = 0.2727…, 100x − x = 27, so x = 27/99 = 3/11.' },
    { t: '0.1010010001… (one more 0 each time)', k: 2, why: 'The number of zeros grows each time, so no block repeats, and it never stops. It was built on purpose from that pattern. A decimal that never stops and never repeats is not a fraction of integers, so it is irrational.' },
    { t: '√2 = 1.41421356…', k: 2, why: 'No repeat shows up in its digits, and a separate proof (in the lesson Why the square root of 2 is irrational) shows there never will be. Digits alone cannot prove it, but the proof can.' }
  ];
  const CARD_CH = ['Rational: the decimal stops', 'Rational: a block repeats forever', 'Irrational: never stops, never repeats'];

  /* ---------- practice problems (a fixed list) ---------- */
  const PROBS = [
    { name: 'Convert 7/20', kind: 'choice', cv: { mode: 0, fi: 5, tool: 'div' },
      q: 'Convert 7/20 to a decimal. You can press Next digit to run the long division, or rewrite 7/20 over 100.',
      ch: [['0.7', '0.7 is 7/10. The denominator here is 20, not 10, so 7/20 is smaller. 0.7 would be 14/20.'],
           ['3.5', 'A fraction with a top smaller than the bottom is less than 1, so the decimal starts with 0. Check: 20 × 3.5 = 70, not 7.'],
           ['0.35', good('Right.') + ' 7 ÷ 20: 70 ÷ 20 = 3 remainder 10, then 100 ÷ 20 = 5 remainder 0. It stops. Another way: 20 × 5 = 100, so 7/20 = 35/100 = 0.35.'],
           ['0.27', 'That mixes up the digits of 7 and 20. Check: 20 × 0.27 = 5.4, not 7.']], ans: 2 },
    { name: 'Stops or repeats: 5/12', kind: 'choice', cv: { mode: 0, fi: 6, tool: 'div' },
      q: 'Does the decimal for 5/12 stop or repeat? Pick the answer with the right reason.',
      ch: [['Stops, because 12 is an even number', 'Even is not the test. 1/6 has an even denominator and it repeats (0.1666…). Look at the prime factors of 12.'],
           ['Repeats, because 12 = 2 × 2 × 3 has a prime factor 3', good('Right.') + ' 5/12 is already in lowest terms (5 and 12 share no factor). The 3 in the denominator means no power of 10 can be a multiple of 12, so the remainders never reach 0. The decimal is 0.41666…, or 0.41 with a bar over the 6.'],
           ['Repeats, because 5 is a prime number', 'The top number does not decide. 5/8 has a prime top and stops (0.625). Only the denominator in lowest terms matters.'],
           ['Stops, because 12 is small', 'Size does not decide. 1/3 has a small denominator and repeats. 1/16 has a bigger one and stops (0.0625).']], ans: 1 },
    { name: 'Repeating 7 to a fraction', kind: 'trick', cv: { mode: 2, ti: 4 },
      q: 'Write 0.777… (the digit 7 repeats forever) as a fraction in lowest terms. First choose which two lines to subtract so the repeating tails cancel, then press Check my subtraction.',
      fin: [['7/10', '7/10 is 0.7, which stops. The decimal 0.777… keeps going, so it is larger than 0.7.'],
            ['70/9', '10x − x = 7 gives 9x = 7, so x = 7/9. The 70 mixes up 10x with x. 70/9 is more than 7.'],
            ['7/9', good('Right.') + ' Any pair that works gives the same fraction. With 10x − x = 7 we get 9x = 7 and x = 7/9. It is in lowest terms because 7 and 9 share no factor. Check: 7 ÷ 9 = 0.777…'],
            ['1', '0.777… is less than 0.8, so it cannot equal 1. (It is 0.999… that equals 1.)']], ans: 2 },
    { name: 'Repeating 45 to a fraction', kind: 'trick', cv: { mode: 2, ti: 5 },
      q: 'Write 0.454545… (the block 45 repeats forever) as a fraction in lowest terms. Choose two lines to subtract so the tails cancel, press Check my subtraction, then pick the fraction.',
      fin: [['45/100', '45/100 is 0.45, which stops after two digits. The decimal 0.4545… keeps going.'],
            ['45/99', 'This is the right value, but it is not in lowest terms. 45 and 99 are both divisible by 9.'],
            ['9/20', '9/20 is 45/100, which is 0.45 and stops. The block is two digits long, so use 99, not 100.'],
            ['5/11', good('Right.') + ' Any pair that works gives the same fraction. With 100x − x = 45 we get 99x = 45 and x = 45/99. Divide top and bottom by 9: 5/11. Check: 5 ÷ 11 = 0.4545…']], ans: 3 },
    { name: 'Classify a list', kind: 'choice', cv: { mode: 3, view: 0, seq: 1 },
      q: 'Which list has only rational numbers?',
      ch: [['0.5, π, 1/3', 'π is not rational. Its digits never stop and never repeat. (0.5 and 1/3 are rational.)'],
           ['0.25, 2/3, 0.1010010001… (one more 0 each time)', 'The last number never stops and never repeats, because the zeros keep growing. So it is irrational. (0.25 and 2/3 are rational.)'],
           ['22/7, 3.14, π', 'π is not rational. 22/7 and 3.14 are only close to it. They are rational themselves: 22/7 is a fraction and 3.14 = 314/100.'],
           ['0.5, 0.2323… (23 repeats), 7/9', good('Right.') + ' 0.5 stops, 0.2323… repeats a block, and 7/9 is a fraction. Each can be written as a fraction of two integers.']], ans: 3 },
    { name: '22/7 or 3.14?', kind: 'choice', cv: { mode: 3, view: 1, zoom: 1 },
      q: 'Which is closer to π = 3.14159265…: 22/7 = 3.142857… or 3.14? Look at the number line.',
      ch: [['22/7', good('Right.') + ' 22/7 is about 0.0013 above π. 3.14 is about 0.0016 below π. Both are rational, and π is not, so neither is exactly π.'],
           ['3.14', '3.14 looks closer because it is shorter, but length is not distance. π − 3.14 is about 0.0016, and 22/7 − π is about 0.0013, which is smaller.'],
           ['They are equally close', 'The two errors are about 0.0016 and 0.0013. These are not equal, so one is closer.'],
           ['Neither, because π is not rational', 'Closeness still makes sense for any two numbers. A rational number can be very close to an irrational one. It just cannot be equal to it.']], ans: 0 },
    { name: 'Is 0.3 the same as 1/3?', kind: 'choice', cv: { mode: 0, fi: 1, full: true, tool: 'div' },
      q: 'A student says: "0.3 and 1/3 are the same number." Which reply is correct?',
      ch: [['Right: 1/3 is about 0.3, so they are the same.', '"About" is not "the same". 1 ÷ 3 never ends (0.333…), so 0.3 is a little too small.'],
           ['Wrong: 1/3 = 0.333… never stops, but 0.3 = 3/10 stops. They differ by 1/30.', good('Right.') + ' 1/3 = 10/30 and 3/10 = 9/30, so they differ by 1/30, about 0.033. The fraction 1/3 is the repeating decimal 0.333… with a bar over the 3.'],
           ['Wrong: 0.3 is bigger than 1/3.', '0.3 is smaller. 1/3 = 0.333… is a little more than 0.3.'],
           ['Right: both mean 3 tenths.', '3 tenths is 3/10. One third is 1/3. Check: 3 × 0.3 = 0.9, but 3 × 1/3 = 1.']], ans: 1 }
  ];

  register({
    id: 'rational-numbers-and-decimal-expansions', level: 'school',
    title: 'Rational numbers and decimal expansions',
    blurb: 'Long division shows why a fraction’s decimal stops or repeats, how to turn a repeating decimal back into a fraction, and why some decimals can never be fractions.',
    thumb(c, p) {
      const pal = p.pal, W = p.w, H = p.h;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = pal.text; c.font = font(Math.max(13, W * .13), 600); c.fillText('1/7 =', W / 2, H * .24);
      const s = '0.142857', sz = Math.max(13, W * .115); c.font = font(sz, 600);
      const tw = c.measureText(s).width, x0 = W / 2 - tw / 2 + c.measureText('0.').width;
      c.fillStyle = pal.blue; c.textAlign = 'left'; c.fillText('0.', W / 2 - tw / 2, H * .5);
      c.fillStyle = pal.violet; c.fillText('142857', x0, H * .5);
      c.strokeStyle = pal.violet; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x0, H * .5 - sz * .72); c.lineTo(x0 + c.measureText('142857').width, H * .5 - sz * .72); c.stroke();
      c.textAlign = 'center'; c.fillStyle = pal.muted; c.font = font(Math.max(11, W * .085), 500); c.fillText('π never repeats', W / 2, H * .78);
    },
    hook: String.raw`The fractions \(\tfrac12\) and \(\tfrac14\) have tidy decimals, but \(\tfrac13\) goes on forever. Why do some stop, some repeat, and could a decimal ever do neither?`,
    steps: [
      { title: 'Long division: stop or repeat',
        text: String.raw`<p>A fraction is a division: \(\tfrac38\) means \(3\div 8\). Each step brings down a zero, divides by 8, and keeps a remainder.</p><p>Predict first. Then press Next digit and watch the remainders. If a remainder comes back, the same steps run again, so the digits repeat. We write a bar over the repeating digits, like \(0.\overline{142857}\).</p>`,
        set: { mode: 0, fi: 0, k: 0 } },
      { title: 'Which fractions stop?',
        text: String.raw`<p>Test the fractions with denominators 2 to 20. Predict the rule, then choose a numerator and a denominator and read the verdict.</p><p>Always reduce first. \(\tfrac{6}{15}\) is \(\tfrac25\), and 5 is fine, so it stops. The reason: a stopping decimal is a fraction over 10, 100, 1000, and those have only the prime factors 2 and 5.</p>`,
        set: { mode: 1, gn: 1, gd: 3 } },
      { title: 'From a repeating decimal to a fraction',
        text: String.raw`<p>Let \(x=0.333\ldots\) Then \(10x=3.333\ldots\) The tails match, so \(10x-x=3\). That means \(9x=3\) and \(x=\tfrac13\).</p><p>Choose the bigger line and the line to take away so the tails cancel. A wrong choice leaves a tail. Then try \(0.4\overline{3}\) and \(0.\overline{9}\).</p>`,
        set: { mode: 2, ti: 0 } },
      { title: 'Decimals that never repeat',
        text: String.raw`<p>The digits of \(\sqrt2\) and \(\pi\) do not stop, and no repeat shows up. Pick a repeat length L and see where it breaks. We can only see so many digits, so this shows but does not prove. A proof for \(\sqrt2\) is in another lesson.</p><p>Use the View menu for \(\pi\) against \(\tfrac{22}{7}\) and 3.14, and for sorting cards.</p>`,
        set: { mode: 3, view: 0, dig: 30 } }
    ],
    formal: String.raw`
      <p>A <em>rational number</em> is a number that can be written as \(\dfrac{a}{b}\) with \(a\) and \(b\) integers and \(b\neq 0\). The set of rational numbers is written \(\mathbb{Q}\). Every integer is rational, because \(5=\tfrac51\). A fraction and its decimal are the same number written two ways. For example \(\tfrac38\) and \(0.375\) are one number.</p>
      <h3>Why a decimal stops or repeats</h3>
      <p>To turn \(\dfrac{a}{b}\) into a decimal, divide \(a\) by \(b\) with long division. After each digit the remainder is one of the numbers \(0,1,\ldots,b-1\). If the remainder is \(0\), nothing is left and the decimal <em>stops</em> (it terminates). Otherwise the remainder is one of only \(b-1\) nonzero values, so after at most \(b-1\) digits a remainder must appear for a second time. The next digit depends only on the current remainder, so from then on the same digits come again and again. The decimal <em>repeats</em>. This also shows that a repeating block has at most \(b-1\) digits. For \(\tfrac17\) the remainders go \(1,3,2,6,4,5,1\), and the block is \(142857\), which has six digits. We write \(\tfrac17=0.\overline{142857}\), with the bar over the repeating block.</p>
      <p>So every fraction of integers has a decimal that either stops or repeats.</p>
      <h3>Which fractions stop?</h3>
      <p>Write the fraction in lowest terms. The decimal stops exactly when the denominator has no prime factor except 2 and 5.</p>
      <p>Why it stops: if the denominator is \(2^m5^n\), multiply top and bottom by enough 2s and 5s to reach a power of 10. For example \(\dfrac{3}{8}=\dfrac{3\cdot 5^3}{2^3\cdot 5^3}=\dfrac{375}{1000}=0.375\). A fraction over \(10^k\) is a decimal with \(k\) places.</p>
      <p>Why it must have only 2s and 5s: a power of 10 is \(10^k=2^k5^k\), so its only prime factors are 2 and 5. If a fraction in lowest terms equals a number over \(10^k\), its denominator divides \(10^k\), so it has no other prime factor. A 3, 7, 11 and so on in the denominator rules out a stopping decimal.</p>
      <p><strong>The unreduced trap.</strong> \(\dfrac{6}{15}\) has a 3 in the denominator, but \(\dfrac{6}{15}=\dfrac25=0.4\) stops. Always reduce first. Also, \(\dfrac16\) has an even denominator but repeats, because \(6=2\cdot 3\) has a 3.</p>
      <h3>From a repeating decimal back to a fraction</h3>
      <p>Let \(x=0.\overline{36}=0.363636\ldots\) The block has 2 digits, so multiply by \(100\):
      \[ 100x=36.3636\ldots,\qquad x=0.3636\ldots \]
      Subtract. The tails are identical and cancel: \(99x=36\), so \(x=\dfrac{36}{99}=\dfrac{4}{11}\). The multiplier must shift by exactly one block so that the tails line up. If a part before the block does not repeat, as in \(0.4\overline{3}\), take \(100x-10x\): \(43.333\ldots-4.333\ldots=39\), so \(90x=39\) and \(x=\dfrac{39}{90}=\dfrac{13}{30}\). This works for every repeating decimal, so every repeating (or stopping) decimal is rational.</p>
      <h3>Why \(0.\overline{9}=1\)</h3>
      <p>This is not a trick. Let \(x=0.999\ldots\) Then \(10x=9.999\ldots\), and \(10x-x=9\), so \(x=1\). Here is another argument. The gap \(1-0.\overline{9}\) is smaller than \(0.1\), smaller than \(0.01\), smaller than \(0.001\), and smaller than every \(\dfrac{1}{10^n}\). The only number that is not negative and is smaller than all of those is \(0\). So the gap is zero. And \(\dfrac13=0.\overline{3}\), so \(3\cdot\dfrac13=1\) and also \(3\cdot 0.\overline{3}=0.\overline{9}\). The numbers \(0.\overline{9}\) and \(1\) are two names for one number.</p>
      <h3>The other side: irrational numbers</h3>
      <p>Since every fraction gives a stopping or repeating decimal, a decimal that never stops and never repeats cannot be a fraction of integers. Such a number is <em>irrational</em>. Together, the rational and irrational numbers make up the real numbers \(\mathbb{R}\). A number such as \(0.1010010001\ldots\), where each block of zeros is one longer, never repeats, so it is irrational. It was built from a pattern on purpose.</p>
      <p>Looking at digits can never prove a number is irrational, because we only see finitely many. For \(\sqrt2=1.41421356\ldots\) a separate proof shows that it is not a fraction (see <em>Why the square root of 2 is irrational</em>). The number \(\pi=3.14159265\ldots\) is also irrational, but that proof is harder and is not given here.</p>
      <h3>Approximating \(\pi\)</h3>
      <p>Since \(\pi\) is not rational, no fraction equals it, but fractions can be close. \(\dfrac{22}{7}=3.142857\ldots\), and \(\dfrac{22}{7}-\pi\approx 0.0013\). The decimal \(3.14=\dfrac{314}{100}\) is below \(\pi\), and \(\pi-3.14\approx 0.0016\). So \(\dfrac{22}{7}\) is closer. Both are rational, so both are approximations. They are not the number \(\pi\).</p>`,
    check: [
      { q: 'Which statement about decimals and fractions is true?',
        choices: ['Every fraction whose denominator is even has a decimal that stops.', 'Every fraction with a small denominator, such as 1/3, has a decimal that stops.', 'A fraction in lowest terms has a decimal that stops exactly when its denominator has no prime factors other than 2 and 5.', 'A decimal that repeats forever, such as 0.333…, cannot be written as a fraction of two integers.'], answer: 2,
        why: String.raw`A denominator of \(2^m5^n\) can be turned into a power of 10, so the decimal stops. Any other prime factor, such as the 3 in 6, cannot be removed, so the decimal repeats. \(\tfrac16\) has an even denominator and repeats. \(\tfrac13\) has a small denominator and repeats. A repeating decimal is always a fraction: \(0.\overline{3}=\tfrac13\).`,
        hint: 'Write 1/6 and 1/3 as decimals. Then think about what a power of 10 is made of.' },
      { q: 'The decimal 0.1666… has the digit 6 repeating forever and the digit 1 in front of it. Let x = 0.1666… Then 10x = 1.666… and 100x = 16.666… Which fraction in lowest terms equals x?',
        choices: ['16/99', '8/45', '1/60', '1/6'], answer: 3,
        why: String.raw`Subtract \(10x\) from \(100x\) so the tails cancel: \(16.666\ldots-1.666\ldots=15\). So \(90x=15\) and \(x=\tfrac{15}{90}=\tfrac16\). Check: \(1\div 6=0.1666\ldots\) The fraction \(\tfrac{16}{99}\) is \(0.\overline{16}\), a different number. \(\tfrac{8}{45}\) comes from using 16 instead of 15 on the right. \(\tfrac{1}{60}\) is \(0.01666\ldots\)`,
        hint: 'Subtract 10x from 100x. What is 16.666… minus 1.666…? Then divide by the number in front of x.' },
      { q: 'A student says: "3/15 has a 3 in its denominator, because 15 = 3 × 5. So its decimal must repeat." Which reply is correct?',
        choices: ['The student is right: a 3 in the denominator always makes the decimal repeat.', 'The student is wrong: 3/15 = 1/5 in lowest terms, and 5 is allowed, so it stops: 0.2.', 'The student is wrong: 3/15 stops because 15 is an odd number.', 'The student is wrong: 3/15 repeats, but only because 3 is a prime number.'], answer: 1,
        why: String.raw`The test uses the denominator in <em>lowest terms</em>. \(\tfrac{3}{15}=\tfrac15\), and 5 has no prime factor except 5, so \(\tfrac15=\tfrac{2}{10}=0.2\) stops. The 3 in 15 canceled with the top. An odd denominator does not make a decimal stop (\(\tfrac13\) has an odd denominator and repeats).`,
        hint: 'Reduce 3/15 before you look at the denominator.' }
    ],
    links: { prereq: ['percents-on-tape-and-number-lines'], next: ['square-roots-and-irrational-numbers'], related: ['negative-numbers-and-absolute-value', 'area-of-a-circle', 'scale-drawings-and-proportions', 'the-real-number-system', 'why-the-square-root-of-2-is-irrational'] },

    mount({ stage, controls: C }) {
      const st = {
        mode: 0, view: 0, practice: false,
        fi: 0, k: 0, dp: 0, dpick: -1,
        gn: 1, gd: 3, gpred: false,
        ti: 0, tA: 0, tB: 0, tchk: false,
        seq: 1, dig: 30, L: 2,
        zoom: 0, apred: false,
        ci: 0, cdone: [], cres: -1
      };
      let cancel = () => {};
      const panel = stage.nextElementSibling;
      const P = new Plane(stage, { cx: 0, cy: 0, span: 5 });
      let prOver = false, prIdx = 0, prSolved = false, prTried = false, prFirst = 0, prDone = 0, prStage = 0;

      const G = {};
      const grp = (k, fn) => { const n0 = panel.children.length; fn(); G[k] = Array.from(panel.children).slice(n0); };
      const vis = (els, on) => els && els.forEach(e => { e.style.display = on ? '' : 'none'; });
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const addTo = (...els) => panel.append(...els);
      const S = o => { const s = C.slider(o); s.inp = panel.lastElementChild.querySelector('input'); return s; };
      const cur = () => (st.practice ? PROBS[prIdx] : null);

      /* ========================= the picture ========================= */
      P.onDraw = (c, p) => {
        p.span = 5; p.cx = 0; p.cy = 0;
        c.textBaseline = 'middle';
        if (st.mode === 0) drawDiv(c, p);
        else if (st.mode === 1) drawGrid(c, p);
        else if (st.mode === 2) drawTrick(c, p);
        else if (st.view === 0) drawDigits(c, p);
        else if (st.view === 1) drawApprox(c, p);
        else drawCards(c, p);
      };

      /* ----- mode 0: the long division ----- */
      const drawDiv = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, D = DV[st.fi], b = D.b, a = D.a, k = st.k, n = D.n, done = k >= n;
        const fs = clamp(W / 24, 14, 19);
        c.textAlign = 'left'; c.fillStyle = pal.text; c.font = font(fs * 1.55, 600); c.fillText(`${a} ÷ ${b}`, 16, 30);
        /* the decimal so far */
        const cw = clamp((W - 40) / 10, 20, 36), y1 = 78, big = fs * 1.9;
        c.font = font(big, 600); c.fillStyle = pal.text; c.fillText(D.ip + '.', 16, y1);
        const x0 = 16 + c.measureText(D.ip + '.').width + 2;
        for (let i = 0; i < k; i++) {
          const inCycle = done && D.per && i >= D.j;
          c.fillStyle = inCycle ? pal.violet : pal.blue; c.textAlign = 'center'; c.fillText(String(D.digs[i]), x0 + cw * (i + .5), y1);
        }
        if (k < n) { c.fillStyle = pal.muted; c.textAlign = 'center'; c.font = font(big, 600); c.fillText('?', x0 + cw * (k + .5), y1); }
        if (done && D.per) {
          c.strokeStyle = pal.violet; c.lineWidth = 3; c.beginPath(); c.moveTo(x0 + cw * D.j + 3, y1 - big * .72); c.lineTo(x0 + cw * n - 3, y1 - big * .72); c.stroke();
          c.fillStyle = pal.violet; c.textAlign = 'left'; c.font = font(big, 600); c.fillText('…', x0 + cw * n, y1);
        }
        c.font = font(fs * .95, 500); c.textAlign = 'left';
        if (done) { c.fillStyle = D.per ? pal.violet : pal.green; c.fillText(D.per ? `repeats: the bar marks the block (${D.per.length} ${D.per.length === 1 ? 'digit' : 'digits'})` : 'stops: the remainder reached 0', 16, y1 + big * .95); }
        /* the remainder rows */
        const top = y1 + big * .95 + fs * 1.5, rh = clamp((H - top - fs * 4.4) / (n + 1), 18, 28), fz = clamp(rh * .62, 13, 17);
        const row = (i, text, dg, remVal, hot, label) => {
          const y = top + rh * (i + .5);
          c.font = font(fz, 500); c.textAlign = 'left'; c.fillStyle = pal.muted; c.fillText(label, 14, y);
          c.fillStyle = pal.text; c.fillText(text, 14 + fz * 2.4, y);
          let x = 14 + fz * 2.4 + c.measureText(text).width;
          if (dg !== null) { c.fillStyle = hot === 2 ? pal.violet : pal.blue; c.font = font(fz, 700); c.fillText(String(dg), x, y); x += c.measureText(String(dg)).width; }
          c.font = font(fz, 500); c.fillStyle = pal.muted; const pw = fz * 2.1 + 6, px = W - 14 - pw, lx = px - 8 - c.measureText('remainder').width; c.fillText('remainder', lx, y);
          rr(c, px, y - rh * .4, pw, rh * .8, 6);
          c.fillStyle = hot ? alpha(pal.violet, .22) : alpha(pal.blue, .12); c.fill(); c.strokeStyle = hot ? pal.violet : pal.blue; c.lineWidth = hot ? 2.4 : 1.2; c.stroke();
          c.fillStyle = pal.text; c.textAlign = 'center'; c.font = font(fz, 700); c.fillText(String(remVal), px + pw / 2, y);
        };
        const rep = done && D.per, rj = D.j;
        row(0, 'Start', null, D.rems[0], rep && rj === 0 ? 2 : 0, '');
        for (let i = 0; i < k; i++) {
          const hot = rep && ((i + 1 === n) || (i + 1 === rj)) ? 2 : 0;
          row(i + 1, `${D.rems[i] * 10} ÷ ${b} = `, D.digs[i], D.rems[i + 1], hot, (i + 1) + '.');
        }
        /* caption */
        c.font = font(fs * .95, 500); c.textAlign = 'left'; c.fillStyle = pal.text;
        let cap = '';
        if (k === 0) cap = 'Each step: bring down a zero, divide by ' + b + ', keep the remainder.';
        else if (done && D.per) cap = `The remainder ${D.rems[n]} came back (${rj === 0 ? 'it was the start' : 'step ' + rj}). The same steps run again, so the digits repeat.`;
        else if (done) cap = 'The remainder is 0. Nothing is left to divide, so the decimal stops.';
        else cap = `Remainders so far: ${D.rems.slice(0, k + 1).join(', ')}. Is a remainder repeating?`;
        wrap(c, cap, W - 28).forEach((t, i) => c.fillText(t, 14, H - fs * 2.1 + i * fs * 1.3));
      };

      /* ----- mode 1: which fractions stop ----- */
      const gridInfo = (n, d) => {
        const g = gcd(n, d), nn = n / g, dd = d / g, f = factors(dd), bad2 = f.filter(q => q !== 2 && q !== 5);
        return { g, nn, dd, f, stops: bad2.length === 0, other: bad2[0] };
      };
      const cellAt = (x, y, W, H) => {
        const cw = (W - 24) / 5, ch = clamp((H - 130) / 4, 40, 84), col = Math.floor((x - 12) / cw), r = Math.floor((y - 14) / ch);
        if (col < 0 || col > 4 || r < 0 || r > 3) return 0; const d = 2 + r * 5 + col; return d <= 20 ? d : 0;
      };
      const drawGrid = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, n = st.gn, cw = (W - 24) / 5, ch = clamp((H - 130) / 4, 40, 84), fs = clamp(W / 24, 13, 21);
        for (let d = 2; d <= 20; d++) {
          const r = Math.floor((d - 2) / 5), col = (d - 2) % 5, x = 12 + col * cw + 2, y = 14 + r * ch + 2, w = cw - 4, hh = ch - 4, I = gridInfo(n, d), sel = d === st.gd;
          rr(c, x, y, w, hh, 8);
          const col2 = I.stops ? pal.green : pal.violet;
          c.fillStyle = st.gpred ? alpha(col2, .18) : alpha(pal.muted, .08); c.fill();
          c.strokeStyle = sel ? pal.yellow : (st.gpred ? col2 : pal['grid-strong']); c.lineWidth = sel ? 3.4 : 1.4; c.stroke();
          c.textAlign = 'center'; c.fillStyle = pal.text; c.font = font(clamp(fs * 1.05, 14, 19), 700); c.fillText(`${n}/${d}`, x + w / 2, y + hh * .36);
          c.font = font(13, 600); c.fillStyle = st.gpred ? col2 : pal.muted; c.fillText(st.gpred ? (I.stops ? 'stops' : 'repeats') : '?', x + w / 2, y + hh * .72);
        }
        /* details of the chosen fraction */
        const d = st.gd, I = gridInfo(n, d), y0 = 14 + ch * 4 + 14;
        c.textAlign = 'left'; c.font = font(fs * 1.05, 700); c.fillStyle = pal.text;
        const same = I.g > 1 ? `${n}/${d} = ${I.nn}/${I.dd} in lowest terms` : `${n}/${d} is already in lowest terms`;
        c.fillText(same, 14, y0 + fs * .6);
        c.font = font(fs, 500); c.fillStyle = pal.text;
        c.fillText(I.dd === 1 ? 'The denominator is 1: a whole number.' : `Denominator ${I.dd} = ${fmtF(I.f)}`, 14, y0 + fs * 2.2);
        c.fillStyle = st.gpred ? (I.stops ? pal.green : pal.violet) : pal.muted;
        const v = !st.gpred ? 'Make your prediction to see the verdict.' : I.stops ? (I.dd === 1 ? 'Stops.' : 'Only 2s and 5s: it stops.') : `A ${I.other} is in the denominator: it repeats.`;
        c.fillText(v, 14, y0 + fs * 3.8);
      };

      /* ----- mode 2: from a repeating decimal to a fraction ----- */
      const trickState = () => {
        const t = TX[st.ti], A = st.tA, B = st.tB;
        if (!A || !B) return { kind: 'pick' };
        if (A <= B) return { kind: 'order' };
        const D = tDiff(t, A, B);
        return { kind: D.per ? 'tail' : (D.n === 0 ? 'int' : 'dec'), D, A, B };
      };
      const drawTrick = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, t = TX[st.ti], fs = clamp(W / 24, 13, 21), TS = trickState();
        c.textAlign = 'left'; c.fillStyle = pal.text; c.font = font(fs * 1.3, 700);
        { const pre = 'Let x = 0.' + t.P, w0 = c.measureText(pre).width, rw = c.measureText(t.R).width; c.fillText(pre, 14, 28); c.fillStyle = pal.violet; c.fillText(t.R, 14 + w0, 28);
          c.strokeStyle = pal.violet; c.lineWidth = 2.4; c.beginPath(); c.moveTo(14 + w0, 28 - fs * 1.1); c.lineTo(14 + w0 + rw, 28 - fs * 1.1); c.stroke();
          c.fillStyle = pal.text; c.fillText('  = ' + tName(t), 14 + w0 + rw, 28); }
        const lblW = clamp(W * .2, 58, 84), cols = 4 + 1 + 10, cw = clamp((W - lblW - 24) / (cols + .6), 12, 26), x0 = lblW + 8, rh = clamp(H / 13, 32, 52);
        const dot = x0 + cw * 4;
        const drawNum = (y, ip, fr, repStart, fixedLen, ending) => {
          /* ip and fr: strings. repStart: index in the combined string where repeating begins, or -1 */
          const all = ip.length + fr.length;
          c.font = font(fs * 1.15, 600); c.textAlign = 'center';
          for (let i = 0; i < ip.length; i++) { c.fillStyle = repStart >= 0 && i >= repStart ? pal.violet : pal.text; c.fillText(ip[i], dot - cw * (ip.length - i - .5), y); }
          if (fr.length) { c.fillStyle = pal.text; c.fillText('.', dot + cw * .35, y); }
          for (let i = 0; i < fr.length; i++) { const pos = ip.length + i; c.fillStyle = repStart >= 0 && pos >= repStart ? pal.violet : pal.text; c.fillText(fr[i], dot + cw * (i + 1), y); }
          if (ending) { c.fillStyle = ending === 'tail' ? pal.violet : pal.muted; c.textAlign = 'left'; c.fillText(ending === 'tail' ? '…' : '', dot + cw * (fr.length + .7), y); }
          return all;
        };
        const rowFor = (m, i, role) => {
          const y = 74 + rh * i, S2 = shifted(t, m);
          let rs = -1; for (let q2 = 0; q2 < S2.ipLen; q2++) if (S2.s - S2.ipLen + q2 >= t.P.length) { rs = q2 + (S2.ip.length - S2.ipLen); break; }
          if (rs < 0) rs = S2.ip.length + Math.max(0, t.P.length - S2.s);
          if (role) { rr(c, 6, y - rh * .46, W - 12, rh * .92, 8); c.fillStyle = alpha(role === 'A' ? pal.blue : pal.red, .1); c.fill(); c.strokeStyle = role === 'A' ? pal.blue : pal.red; c.lineWidth = 2.2; c.stroke(); }
          c.textAlign = 'left'; c.fillStyle = role ? (role === 'A' ? pal.blue : pal.red) : pal.muted; c.font = font(fs * 1.05, 700); c.fillText(shiftName(m) + ' =', 14, y);
          drawNum(y, S2.ip, S2.fr, rs, 0, 'tail');
          /* bar over the first block */
          const bs = rs;
          if (bs >= 0) {
            const lenCells = t.R.length, ipL = S2.ip.length, cellX = k2 => (k2 < ipL ? dot - cw * (ipL - k2 - .5) : dot + cw * (k2 - ipL + 1));
            const xa = cellX(bs) - cw * .45, xb = cellX(Math.min(bs + lenCells - 1, ipL + S2.fr.length - 1)) + cw * .45;
            c.strokeStyle = pal.violet; c.lineWidth = 2.2; c.beginPath(); c.moveTo(xa, y - fs * 1.0); c.lineTo(xb, y - fs * 1.0); c.stroke();
          }
        };
        SHIFTS.forEach((m, i) => rowFor(m, i, st.tA === m ? 'A' : st.tB === m ? 'B' : ''));
        const yR = 74 + rh * 4 + 6;
        c.textAlign = 'left'; c.fillStyle = pal.text; c.font = font(fs * 1.05, 700);
        if (TS.kind === 'pick') {
          c.font = font(fs, 500); c.fillStyle = pal.muted;
          wrap(c, 'Choose the bigger line (blue) and the line to take away (red). Violet digits are the repeating block.', W - 28).forEach((s, i) => c.fillText(s, 14, yR + 14 + i * fs * 1.35));
          return;
        }
        if (TS.kind === 'order') {
          c.font = font(fs, 500); c.fillStyle = pal.red;
          wrap(c, 'Take the smaller line away from the bigger one, so the bigger line must come first.', W - 28).forEach((s, i) => c.fillText(s, 14, yR + 14 + i * fs * 1.35));
          return;
        }
        c.strokeStyle = pal.text; c.lineWidth = 2; c.beginPath(); c.moveTo(10, yR - 6); c.lineTo(W - 10, yR - 6); c.stroke();
        const D = TS.D, coef = TS.A - TS.B;
        c.fillStyle = pal.text; c.font = font(fs * 1.05, 700); c.textAlign = 'left'; c.fillText(`${shiftName(TS.A)} − ${shiftName(TS.B)} =`, 14, yR + rh * .35);
        const fr = D.pre.padEnd(0, '0') + (D.per ? D.per.repeat(Math.ceil(10 / D.per.length)) : '');
        drawNum(yR + rh * .35, String(D.ip), fr.slice(0, 10), -1, 0, D.per ? 'tail' : '');
        c.font = font(fs, 600); c.textAlign = 'left';
        const msg = TS.kind === 'tail' ? 'A repeating tail is left. The tails did not line up.'
          : TS.kind === 'int' ? `The tails cancel exactly: ${coef}x = ${D.ip}.` : `The tails cancel, but ${decPlain(D)} still has a decimal: ${coef}x = ${decPlain(D)}.`;
        c.fillStyle = TS.kind === 'tail' ? pal.red : pal.green;
        wrap(c, msg, W - 28).forEach((s, i) => c.fillText(s, 14, yR + rh * 1.0 + 8 + i * fs * 1.3));
        if (TS.kind !== 'tail') {
          const [n, d] = tVal(t); c.fillStyle = pal.text; c.font = font(fs * 1.25, 700);
          c.fillText(`x = ${fracS(n, d)}`, 14, Math.min(H - 22, yR + rh * 1.0 + 8 + 2.6 * fs * 1.3 + 14));
        }
      };

      /* ----- mode 3, view 0: digits that never repeat ----- */
      const drawDigits = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, q = SEQ[st.seq], shown = Math.floor(st.dig), L = st.L, fs = clamp(W / 24, 13, 21);
        c.textAlign = 'left'; c.fillStyle = pal.text; c.font = font(fs * 1.4, 700); c.fillText(q.name + ' = ' + q.head + q.d.slice(0, 6) + '…', 14, 26);
        const perRow = 10, cw = clamp((W - 28) / perRow, 22, 40), rh = clamp(fs * 2.1, 28, 40), y0 = 64, bk = firstBreak(q.d, L, shown);
        const lastOk = bk < 0 ? shown - L - 1 : bk - 1;
        for (let i = 0; i < shown; i++) {
          const r = Math.floor(i / perRow), col = i % perRow, x = 14 + cw * (col + .5), y = y0 + rh * r;
          if (i === bk) { rr(c, x - cw * .44, y - rh * .42, cw * .88, rh * .84, 6); c.fillStyle = alpha(pal.red, .16); c.fill(); c.strokeStyle = pal.red; c.lineWidth = 2.2; c.stroke(); }
          c.textAlign = 'center'; c.font = font(fs * 1.2, 600); c.fillStyle = i <= lastOk && i + L < shown ? pal.green : pal.text; c.fillText(q.d[i], x, y);
          if (i <= lastOk && i + L < shown) { c.strokeStyle = pal.green; c.lineWidth = 2; c.beginPath(); c.moveTo(x - cw * .3, y + fs * .85); c.lineTo(x + cw * .3, y + fs * .85); c.stroke(); }
        }
        const rows = Math.max(1, Math.ceil(shown / perRow)), yB = y0 + rh * (rows - 1) + rh * .9;
        c.font = font(fs, 500); c.textAlign = 'left'; c.fillStyle = pal.muted;
        const yy = Math.min(yB + fs * 1.4, H - fs * 7.4);
        const t1 = `Digits shown: ${shown}. Green underline: digit equals the digit ${L} places later. Red box: the first place where that fails.`;
        wrap(c, t1, W - 28).forEach((s, i) => c.fillText(s, 14, Math.max(yy, 64 + rh * 6 + 8) + i * fs * 1.3));
        const ya = Math.max(yy, 64 + rh * 6 + 8) + fs * 1.3 * 3 + 6;
        c.font = font(fs, 600); c.fillStyle = bk < 0 ? pal.green : pal.red;
        const msg = shown <= L ? `Show more than ${L} digits to test a repeat of length ${L}.` : bk < 0 ? `A repeat of length ${L} still holds in all ${shown - L} comparisons.` : `A repeat of length ${L} breaks at digit ${bk + 1} (it is ${q.d[bk]}, but digit ${bk + 1 + L} is ${q.d[bk + L]}).`;
        wrap(c, msg, W - 28).forEach((s, i) => c.fillText(s, 14, ya + i * fs * 1.3));
      };

      /* ----- mode 3, view 1: approximating pi ----- */
      const PI = 3.14159265358979, Q7 = 22 / 7;
      const drawApprox = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, z = st.zoom, fs = clamp(W / 24, 13, 21);
        const lo = lerp(3.10, 3.1385, z), hi = lerp(3.20, 3.1445, z), X = v => 24 + (v - lo) / (hi - lo) * (W - 48), ay = H * .42;
        c.textAlign = 'left'; c.fillStyle = pal.text; c.font = font(fs * 1.3, 700); c.fillText('π and two fractions', 14, 26);
        c.strokeStyle = pal['grid-strong']; c.lineWidth = 2; c.beginPath(); c.moveTo(14, ay); c.lineTo(W - 14, ay); c.stroke();
        const steps = [.2, .1, .05, .02, .01, .005, .002, .001, .0005, .0002, .0001]; let stp = steps[steps.length - 1];
        for (const s of steps) if ((hi - lo) / s >= 3) { stp = s; break; }
        const dec = Math.max(2, Math.round(-Math.log10(stp)) + (stp < .01 && String(stp).includes('5') ? 1 : 0));
        c.font = font(fs * .9, 500); c.textAlign = 'center';
        for (let v = Math.ceil(lo / stp) * stp; v <= hi + 1e-9; v += stp) {
          const x = X(v); if (x < 20 || x > W - 20) continue;
          c.strokeStyle = pal.muted; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, ay - 6); c.lineTo(x, ay + 6); c.stroke();
          c.fillStyle = pal.muted; c.fillText(v.toFixed(dec), x, ay + 22);
        }
        const pts = [[3.14, '3.14', pal.blue, -1], [PI, 'π', pal.yellow, 1], [Q7, '22/7', pal.red, -1]];
        pts.forEach(([v, name, col, up]) => {
          const x = X(v); c.beginPath(); c.arc(x, ay, 7, 0, TAU); c.fillStyle = col; c.fill(); c.strokeStyle = pal.stage; c.lineWidth = 2; c.stroke();
          if (z > .6) { c.fillStyle = pal.text; c.font = font(fs * 1.15, 700); c.textAlign = 'center'; c.fillText(name, x, ay + up * 34 - (up < 0 ? 6 : 0) - (up > 0 ? -6 : 0)); }
        });
        if (z <= .6) {
          c.font = font(fs, 500); c.fillStyle = pal.muted; c.textAlign = 'left';
          wrap(c, 'At this zoom, 3.14, π and 22/7 sit on top of each other. Predict which fraction is closer to π, then zoom in.', W - 28).forEach((s, i) => c.fillText(s, 14, ay + 60 + i * fs * 1.35));
          return;
        }
        if (st.apred || (st.practice && prSolved)) {
          const e1 = PI - 3.14, e2 = Q7 - PI, yb = ay + 78;
          const br = (a, b, y, col, text) => {
            c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.moveTo(X(a), y); c.lineTo(X(b), y); c.moveTo(X(a), y - 6); c.lineTo(X(a), y + 6); c.moveTo(X(b), y - 6); c.lineTo(X(b), y + 6); c.stroke();
            c.fillStyle = col; c.font = font(fs, 700); c.textAlign = 'center'; c.fillText(text, (X(a) + X(b)) / 2, y + 20);
          };
          br(3.14, PI, yb, pal.blue, `error of 3.14: about ${e1.toFixed(4)}`);
          br(PI, Q7, yb + 56, pal.red, `error of 22/7: about ${e2.toFixed(4)}`);
          c.fillStyle = pal.text; c.font = font(fs, 500); c.textAlign = 'left';
          wrap(c, '22/7 = 3.142857… and 3.14 = 314/100 are both rational. π is not. Approximations are close, never equal.', W - 28).forEach((s, i) => c.fillText(s, 14, yb + 112 + i * fs * 1.35));
        }
      };

      /* ----- mode 3, view 2: sorting cards ----- */
      const drawCards = (c, p) => {
        const pal = p.pal, W = p.w, H = p.h, fs = clamp(W / 24, 13, 21), i = st.ci, over = i >= CARDS.length;
        c.textAlign = 'left'; c.fillStyle = pal.text; c.font = font(fs * 1.3, 700); c.fillText('Sort the numbers', 14, 26);
        c.font = font(fs, 500); c.fillStyle = pal.muted; c.fillText(over ? 'All cards sorted.' : `Card ${i + 1} of ${CARDS.length}`, 14, 52);
        if (!over) {
          const cardH = 110, y = 70; rr(c, 14, y, W - 28, cardH, 12); c.fillStyle = alpha(pal.blue, .1); c.fill(); c.strokeStyle = pal.blue; c.lineWidth = 2; c.stroke();
          c.fillStyle = pal.text; c.font = font(fs * 1.5, 700); c.textAlign = 'center';
          wrap(c, CARDS[i].t, W - 60).forEach((s, j, arr) => c.fillText(s, W / 2, y + cardH / 2 + (j - (arr.length - 1) / 2) * fs * 1.9));
        }
        const by = 70 + 110 + 24, bw = (W - 40) / 2, bh = Math.max(60, H - by - 14);
        [['Rational', 0], ['Irrational', 1]].forEach(([nm, side]) => {
          const x = 14 + side * (bw + 12); rr(c, x, by, bw, bh, 10); c.fillStyle = alpha(side ? pal.violet : pal.green, .1); c.fill(); c.strokeStyle = side ? pal.violet : pal.green; c.lineWidth = 1.6; c.stroke();
          c.textAlign = 'left'; c.fillStyle = side ? pal.violet : pal.green; c.font = font(fs, 700); c.fillText(nm, x + 10, by + 18);
          c.font = font(fs * .95, 500); c.fillStyle = pal.text;
          let yy = by + 40;
          CARDS.forEach((cd, j) => {
            if (st.cdone.indexOf(j) < 0) return;
            if ((cd.k === 2) !== !!side) return;
            const label = cd.t.split(' (')[0];
            wrap(c, label, bw - 20).forEach(s => { c.fillText(s, x + 10, yy); yy += fs * 1.2; });
            yy += 4;
          });
        });
      };

      /* ========================= controls ========================= */
      let selFr, dQ, dRow, dFb, dBtns, dRo;
      let gQ, gRow, gFb, gnS, gdS, gRo;
      let selT, tBigRow, tSmlRow, tChkBtn, tRo;
      let selView, seqBtns, digS, LS, digBtns, dgRo, apQ, apRow, apFb, apRo, cdRow, cdFb, cdNext, cdRo;
      let startBtn, ptally, pq, pch, pfb, pnext, pdivBtns, ptBig, ptSml, ptCheck;
      let tBigBtns = [], tSmlBtns = [], ptBigBtns = [], ptSmlBtns = [];

      /* --- mode 0 --- */
      grp('div', () => {
        C.title('Fraction');
        selFr = C.select({ label: 'Choose a fraction', options: DV.slice(0, 5).map((d, i) => ({ value: String(i), label: `${d.a}/${d.b}` })), value: '0', onChange: v => { cancel(); st.fi = +v; loadFr(); sync(); } });
        C.title('Predict first');
        dQ = h('p', { class: 'hint' }); dRow = h('div', { class: 'ctl buttons' }); dFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        addTo(dQ, dRow, dFb);
        C.title('Divide');
        dBtns = C.buttons([{ label: 'Next digit', primary: true, onClick: () => { if (st.k < DV[st.fi].n) st.k++; sync(); } },
          { label: 'Run to the end', onClick: () => { st.k = DV[st.fi].n; sync(); } }, { label: 'Start over', onClick: () => { st.k = 0; sync(); } }]);
        dRo = C.readout();
      });
      const loadFr = () => { st.k = 0; st.dp = 0; st.dpick = -1; renderDPred(); };
      const renderDPred = () => {
        const D = DV[st.fi], rep = D.per !== '';
        dRow.replaceChildren(); dFb.innerHTML = '';
        if (st.dp === 0) {
          dQ.textContent = `Before you divide ${D.a} ÷ ${D.b}: will the decimal stop, or repeat?`;
          ['It stops', 'It repeats'].forEach((l, i) => dRow.append(mkBtn(l, () => {
            if (st.dp) return; st.dpick = i; st.dp = 1;
            dFb.innerHTML = (i === (rep ? 1 : 0) ? good('Good guess.') : bad('We will see.')) + ' ' + (rep ? 'Watch the remainders: one of them will come back.' : 'Watch the remainders: one of them will be 0.');
            if (rep) renderStage2(); else { dRow.replaceChildren(); dQ.textContent = 'Prediction made.'; }
            sync();
          })));
        } else if (st.dp === 1 && rep) renderStage2();
        else { dQ.textContent = 'Prediction made.'; if (st.dpick >= 0) dFb.innerHTML = dFb.innerHTML; }
      };
      const renderStage2 = () => {
        const D = DV[st.fi], b = D.b; dRow.replaceChildren();
        dQ.textContent = `It repeats. Which limit on the length of the repeating block is guaranteed for every fraction with denominator ${b}? Think: what remainders are possible when you divide by ${b}?`;
        [`At most ${Math.floor(b / 2)} digit${Math.floor(b / 2) === 1 ? '' : 's'}`, `At most ${b - 1} digit${b - 1 === 1 ? '' : 's'}`, 'No limit'].forEach((l, i) => dRow.append(mkBtn(l, () => {
          if (st.dp === 2) return; st.dp = 2;
          const msgs = [bad('Not quite.') + ` Nothing forces a cap of ${Math.floor(b / 2)}. The real limit comes from the remainders: only 1 to ${b - 1} are possible (0 would stop it).`,
            good('Yes.') + ` The remainder is one of 1 to ${b - 1}. Once a remainder comes back, the digits repeat, so the block has at most ${b - 1} digits.`,
            bad('Not quite.') + ` There is a limit: only ${b - 1} nonzero remainders exist, so one must come back within ${b - 1} steps.`];
          dFb.innerHTML = msgs[i]; Array.from(dRow.children).forEach((x, j) => { x.disabled = true; if (j === i) x.classList.add('primary'); });
          sync();
        })));
      };
      const divRo = () => {
        const D = DV[st.fi], k = st.k, n = D.n, L = [];
        if (st.dp < (D.per ? 2 : 1)) return 'Make your prediction first. Then the buttons unlock.';
        if (k === 0) { L.push(`${kk('Start')} remainder = ${D.a}. Press Next digit.`); return lines(L); }
        const i = k - 1;
        L.push(`${kk('Step ' + k)} ${D.rems[i]} × 10 = ${D.rems[i] * 10}. ${D.rems[i] * 10} ÷ ${D.b} = <b>${D.digs[i]}</b> remainder ${D.rems[i + 1]}.`);
        L.push(`${kk('So far')} ${D.ip}.${D.digs.slice(0, k).join('')}`);
        if (k >= n) {
          if (D.per) {
            L.push(`${good('A remainder repeated.')} ${D.rems[n]} appeared before, so the digits repeat.`);
            L.push(`<b>${D.a}/${D.b} = ${decHtml(D)}</b> (the bar is over ${D.per}). The block has ${D.per.length} ${D.per.length === 1 ? 'digit' : 'digits'}. The most it could have is ${D.b - 1}.`);
          } else L.push(`${good('Remainder 0.')} <b>${D.a}/${D.b} = ${decHtml(D)}</b>. It stops.`);
        } else L.push('Has a remainder shown up twice yet?');
        return lines(L);
      };

      /* --- mode 1 --- */
      grp('grid', () => {
        C.title('Predict first');
        gQ = h('p', { class: 'hint' }, 'Look at the fractions 1/2, 1/3, … 1/20. Which rule tells you which ones stop?');
        gRow = h('div', { class: 'ctl buttons' }); gFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); addTo(gQ, gRow, gFb);
        [['All the fractions whose denominator is even', 'Even is not the rule. 1/6 has an even denominator and repeats. You will see it in the grid.'],
         ['The ones whose denominator has only 2s and 5s as prime factors', good('Yes.') + ' Those denominators fit into 10, 100, 1000, … which are made of 2s and 5s. Test it on the grid, and test 6/15 as well.'],
         ['The ones with a small denominator, under 10', 'Size is not the rule. 1/3 and 1/7 are small and repeat, while 1/16 is bigger and stops.']].forEach(([l, f], i) =>
          gRow.append(mkBtn(l, () => {
            if (st.gpred) return; st.gpred = true; gFb.innerHTML = (i === 1 ? '' : bad('Not quite.') + ' ') + f;
            Array.from(gRow.children).forEach((b, j) => { b.disabled = true; if (j === i) b.classList.add('primary'); }); sync();
          })));
        C.title('Test a fraction');
        gnS = S({ label: 'Numerator', min: 1, max: 20, step: 1, value: 1, format: v => String(v), onInput: v => { st.gn = v; sync(); } });
        gdS = S({ label: 'Denominator (or tap a box)', min: 2, max: 20, step: 1, value: 3, format: v => String(v), onInput: v => { st.gd = v; sync(); } });
        gRo = C.readout();
      });
      const gridRo = () => {
        if (!st.gpred) return 'Make your prediction first. Then the grid shows which fractions stop.';
        const n = st.gn, d = st.gd, I = gridInfo(n, d), D = longDiv(n, d), L = [];
        L.push(`${kk('Fraction')} ${n}/${d}` + (I.g > 1 ? ` = ${I.nn}/${I.dd} in lowest terms (divide top and bottom by ${I.g}).` : ' is in lowest terms.'));
        L.push(`${kk('Denominator')} ${I.dd} = ${fmtF(I.f)}`);
        L.push(`${kk('Decimal')} ${n}/${d} = <b>${decHtml(D)}</b> ${D.per ? '(repeats)' : '(stops)'}`);
        if (I.dd === 1) L.push(good('A whole number.') + ' It stops.');
        else if (I.stops) {
          const e2 = I.f.filter(q => q === 2).length, e5 = I.f.length - e2, m = Math.max(e2, e5), mult = Math.pow(10, m) / I.dd;
          L.push(good('Only 2s and 5s.') + ` So ${I.nn}/${I.dd} = ${I.nn * mult}/${Math.pow(10, m)}, a fraction over a power of 10, so it stops.`);
        } else L.push(bad(`A ${I.other} in the denominator.`) + ` Powers of 10 have only 2s and 5s, so ${I.dd} never fits into one. The remainders never reach 0, so it repeats.`);
        if (I.g > 1 && I.stops && factors(d).some(q => q !== 2 && q !== 5)) L.push(`The unreduced ${n}/${d} looks like it has a ${fmtF(factors(d).filter(q => q !== 2 && q !== 5).slice(0, 1))}, but it cancels.`);
        return lines(L);
      };

      /* --- mode 2 --- */
      grp('trick', () => {
        C.title('Repeating decimal');
        selT = C.select({ label: 'Choose a number', options: TX.slice(0, 4).map((t, i) => ({ value: String(i), label: tName(t) })), value: '0', onChange: v => { st.ti = +v; loadT(); sync(); } });
        C.title('Your move');
        C.hint('Which line is the bigger line? Choose it, then choose the line to take away.');
        const rowBig = h('div', { class: 'ctl buttons', 'aria-label': 'Bigger line' }), rowSml = h('div', { class: 'ctl buttons', 'aria-label': 'Line to take away' });
        addTo(h('p', { class: 'hint' }, 'Bigger line (blue):'), rowBig, h('p', { class: 'hint' }, 'Take away (red):'), rowSml);
        tBigBtns = SHIFTS.map(m => { const b = mkBtn(shiftName(m), () => { st.tA = m; st.tchk = false; sync(); }); rowBig.append(b); return b; });
        tSmlBtns = SHIFTS.map(m => { const b = mkBtn(shiftName(m), () => { st.tB = m; st.tchk = false; sync(); }); rowSml.append(b); return b; });
        tChkBtn = C.buttons([{ label: 'Check by long division', onClick: () => { st.tchk = true; sync(); } }])[0];
        tRo = C.readout();
      });
      const loadT = () => { st.tA = 0; st.tB = 0; st.tchk = false; };
      const trickRo = () => {
        const t = TX[st.ti], TS = trickState(), L = [], [n, d] = tVal(t), blk = t.R.length, np = t.P.length;
        L.push(`${kk('x')} ${tNameHtml(t)} = ${tName(t)}`);
        if (TS.kind === 'pick') { L.push(`The tail repeats a block of ${blk} ${blk === 1 ? 'digit' : 'digits'}${np ? `, after ${np} ${np === 1 ? 'digit' : 'digits'} that do not repeat` : ''}. Choose two lines whose tails match digit for digit.`); return lines(L); }
        if (TS.kind === 'order') { L.push(bad('Bigger line first.') + ' If you take the bigger line away from the smaller one, the answer is negative. Swap them.'); return lines(L); }
        const D = TS.D, coef = TS.A - TS.B;
        L.push(`${kk(shiftName(TS.A) + ' − ' + shiftName(TS.B))} = ${coef}x = <b>${decHtml(D)}</b>`);
        if (TS.kind === 'tail') {
          L.push(bad('The tails do not match.') + ` What is left, ${decHtml(D)}, still repeats, so we cannot solve for x yet. The two lines must have the same digits after the point. ` +
            `Shift by a whole block: choose a line ${shiftName(Math.pow(10, np + blk))} and a line ${shiftName(Math.pow(10, np))}.`);
          return lines(L);
        }
                if (TS.kind === 'int') {
          L.push(good('The tails cancel.') + ` ${coef}x = ${D.ip}, so x = ${D.ip}/${coef}` + (gcd(+D.ip, coef) > 1 ? ` = <b>${fracS(n, d)}</b>` + (d === 1 ? ' (divide top and bottom by ' + gcd(+D.ip, coef) + ').' : ' in lowest terms (divide top and bottom by ' + gcd(+D.ip, coef) + ').') : `, which is <b>${fracS(n, d)}</b> in lowest terms.`));
        } else {
          L.push(good('The tails cancel.') + ` What is left, ${decHtml(D)}, stops but is not a whole number. ${coef}x = ${decHtml(D)}, so x = ${decHtml(D)} ÷ ${coef} = <b>${n}/${d}</b> in lowest terms. A cleaner pair gives a whole number: ${shiftName(Math.pow(10, np + blk))} − ${shiftName(Math.pow(10, np))}.`);
        }
        if (st.tchk && d === 1) L.push(`${kk('Check')} 1 = 0.999…, see the argument below.`);
        else if (st.tchk) { const C2 = longDiv(n, d); L.push(`${kk('Check')} ${n} ÷ ${d} = ${decHtml(C2)}. ${C2.ip}.${C2.pre}${C2.per.repeat(3)}… matches ${tName(t)} ${good('(yes)')}`); }
        if (t.R === '9' && !t.P) {
          L.push(`<b>So 0.999… = 1 exactly.</b> This is an argument, not a trick. (1) 1/3 = 0.333…, and 3 × 1/3 = 1, but 3 × 0.333… = 0.999… (2) The gap 1 − 0.999… is smaller than 0.1, than 0.01, than 0.001, and so on. The only number that is not negative and smaller than all of these is 0, so the gap is 0.`);
        }
        return lines(L);
      };

      /* --- mode 3 --- */
      grp('view', () => {
        C.title('View');
        selView = C.select({ label: 'What to look at', options: [{ value: '0', label: 'Digits that never repeat' }, { value: '1', label: 'π against 22/7 and 3.14' }, { value: '2', label: 'Sort rational or irrational' }], value: '0', onChange: v => { setView(+v); } });
      });
      const setView = v => { cancel(); st.view = v; st.zoom = 0; st.apred = false; renderApred(); sync(); };
      grp('dig', () => {
        seqBtns = C.buttons(SEQ.map((q, i) => ({ label: q.name, onClick: () => { st.seq = i; sync(); } })));
        digS = S({ label: 'Digits shown', min: 1, max: 60, step: 1, value: 30, format: v => String(v), onInput: v => { cancel(); st.dig = v; sync(); } });
        digBtns = C.buttons([{ label: '10 more digits', onClick: () => { cancel(); st.dig = Math.min(60, Math.floor(st.dig) + 10); sync(); } }, { label: 'Play', onClick: () => { cancel(); st.dig = 1; sync(); cancel = animateTo(st, { dig: 60 }, 6000, sync); } }]);
        LS = S({ label: 'Try a repeat of length L', min: 1, max: 12, step: 1, value: 2, format: v => 'L = ' + v, onInput: v => { st.L = v; sync(); } });
        dgRo = C.readout();
      });
      const digRo = () => {
        const q = SEQ[st.seq], shown = Math.floor(st.dig), L = st.L, bk = firstBreak(q.d, L, shown), out = [];
        out.push(`${kk('Number')} ${q.name} = ${q.head}${q.d.slice(0, Math.min(shown, 24))}${shown > 24 ? '…' : ''}`);
        out.push(`${kk('Test')} If the digits repeat with length ${L}, each digit equals the digit ${L} places later.`);
        if (shown <= L) out.push('Show more digits.');
        else if (bk < 0) out.push(st.seq === 2 ? good(`All ${shown - L} comparisons agree.`) + ` 1/7 = 0.${ovl('142857')}, so a repeat of length 6 (or 12) holds forever. Other lengths, such as 4, break.` : `All ${shown - L} comparisons agree so far. Try a different L, or show more digits.`);
        else out.push(bad(`Breaks at digit ${bk + 1}.`) + ` It is ${q.d[bk]}, but the digit ${L} places later is ${q.d[bk + L]}. So the digits do not repeat with length ${L} from the start.`);
        out.push(st.seq === 2 ? 'For contrast, this is a fraction. A repeat of length 6 never breaks.' : `Honest note: ${shown} digits cannot show what happens forever. Only a proof can. For √2 see the lesson Why the square root of 2 is irrational.`);
        return lines(out);
      };
      grp('apx', () => {
        C.title('Predict first');
        apQ = h('p', { class: 'hint' }, 'π = 3.14159265… Two rational numbers are used for π: 3.14 and 22/7 = 3.142857… Which is closer to π?');
        apRow = h('div', { class: 'ctl buttons' }); apFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); addTo(apQ, apRow, apFb);
        apRo = C.readout();
      });
      const renderApred = () => {
        apRow.replaceChildren(); apFb.innerHTML = '';
        ['3.14', '22/7', 'They are equally close'].forEach((l, i) => apRow.append(mkBtn(l, () => {
          if (st.apred) return; st.apred = true; cancel(); cancel = animateTo(st, { zoom: 1 }, 1200, sync);
          apFb.innerHTML = (i === 1 ? good('Yes.') : bad('Not quite.')) + ' Zoom in and read the two errors.';
          Array.from(apRow.children).forEach((b, j) => { b.disabled = true; if (j === i) b.classList.add('primary'); }); sync();
        })));
      };
      const apxRo = () => {
        if (!st.apred) return 'Make your prediction first. Then the number line zooms in.';
        return lines([`${kk('π')} 3.14159265…`, `${kk('3.14')} = 314/100, below π by about 0.0016 (0.00159…)`, `${kk('22/7')} = 3.142857…, above π by about 0.0013 (0.00126…)`,
          good('22/7 is closer.') + ' Both are rational numbers, so both are approximations. π is not rational: its digits never stop and never repeat. A rational approximation can be as close as you like, but it is never equal.']);
      };
      grp('cards', () => {
        C.title('Sort the card');
        C.hint('Pick the answer that gives the number a home and the reason.');
        cdRow = h('div', { class: 'ctl buttons' }); cdFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' }); cdNext = mkBtn('Next card', () => { st.ci++; st.cres = -1; renderCard(); sync(); }, true); cdNext.disabled = true;
        addTo(cdRow, cdFb, h('div', { class: 'ctl buttons' }, cdNext));
        cdRo = C.readout();
      });
      const renderCard = () => {
        cdRow.replaceChildren(); cdFb.innerHTML = ''; cdNext.disabled = true;
        if (st.ci >= CARDS.length) { cdFb.innerHTML = 'All four are sorted. A number is rational when its decimal stops or repeats. A decimal that never stops and never repeats is irrational. Press Start over to try again.'; cdRow.append(mkBtn('Start over', () => { st.ci = 0; st.cdone = []; renderCard(); sync(); }, true)); return; }
        const cd = CARDS[st.ci];
        CARD_CH.forEach((l, i) => cdRow.append(mkBtn(l, () => {
          if (st.cres >= 0 && st.cres === cd.k) return;
          st.cres = i;
          if (i === cd.k) {
            cdFb.innerHTML = good('Right.') + ' ' + cd.why; st.cdone.push(st.ci); cdNext.disabled = false; cdNext.textContent = st.ci === CARDS.length - 1 ? 'Finish' : 'Next card';
            Array.from(cdRow.children).forEach((b, j) => { b.disabled = true; if (j === i) b.classList.add('primary'); });
          } else {
            let f;
            if (i === 2) f = 'This number stops or repeats, so it is a fraction of two integers. Irrational needs a decimal that does both: never stops AND never repeats.';
            else if (cd.k === 2) f = 'There is no stop, and no block that repeats. A pattern that keeps changing, like growing zeros, is not a repeating block.';
            else if (i === 0) f = 'It does not stop. A block of digits repeats forever, which is still rational. The right reason is the repeating block.';
            else f = 'No block repeats here. It simply stops after a few digits. The right reason is that it stops.';
            cdFb.innerHTML = bad('Not quite.') + ' ' + f; Array.from(cdRow.children)[i].disabled = true;
          }
          sync();
        })));
      };

      /* ========================= practice ========================= */
      C.title('Practice');
      C.hint('Seven short problems. Nothing here is saved or scored.');
      startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); if (st.practice) { st.practice = false; st.fi = 0; st.k = 0; selFr.value = '0'; loadFr(); sync(); } else { st.practice = true; if (!prOver) loadProb(); sync(); } } }])[0];
      grp('practice', () => {
        ptally = h('p', { class: 'ctl-title' });
        pq = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
        pch = h('div', { class: 'ctl buttons' });
        addTo(ptally, pq);
        grp('pdiv', () => { pdivBtns = C.buttons([{ label: 'Next digit', onClick: () => { if (st.k < DV[st.fi].n) st.k++; sync(); } }, { label: 'Run to the end', onClick: () => { st.k = DV[st.fi].n; sync(); } }, { label: 'Start over', onClick: () => { st.k = 0; sync(); } }]); });
        grp('ptrick', () => {
          const rb = h('div', { class: 'ctl buttons' }), rs = h('div', { class: 'ctl buttons' });
          addTo(h('p', { class: 'hint' }, 'Bigger line (blue):'), rb, h('p', { class: 'hint' }, 'Take away (red):'), rs);
          ptBigBtns = SHIFTS.map(m => { const b = mkBtn(shiftName(m), () => { st.tA = m; pfb.innerHTML = ''; sync(); }); rb.append(b); return b; });
          ptSmlBtns = SHIFTS.map(m => { const b = mkBtn(shiftName(m), () => { st.tB = m; pfb.innerHTML = ''; sync(); }); rs.append(b); return b; });
          ptCheck = C.buttons([{ label: 'Check my subtraction', primary: true, onClick: () => checkSub() }])[0];
        });
        addTo(pch);
        pfb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
        pnext = mkBtn('Next problem', () => nextProb(), true);
        addTo(pfb, h('div', { class: 'ctl buttons' }, pnext));
      });

      const tally = () => { ptally.textContent = `Problem ${Math.min(prIdx + 1, PROBS.length)} of ${PROBS.length}. Right on the first try: ${prFirst} of ${prDone} done`; };
      const loadProb = () => {
        const pr = PROBS[prIdx], cv = pr.cv; prSolved = false; prTried = false; prStage = 0;
        st.mode = cv.mode; st.view = cv.view || 0; st.fi = cv.fi || 0; st.ti = cv.ti || 0; st.tA = 0; st.tB = 0; st.tchk = false; st.k = 0; st.dp = 2; st.zoom = cv.zoom || 0; st.apred = false; st.seq = cv.seq === undefined ? 1 : cv.seq;
        if (cv.full) st.k = DV[st.fi].n;
        pq.textContent = pr.q; pfb.innerHTML = ''; pch.replaceChildren(); pnext.disabled = true; pnext.textContent = prIdx === PROBS.length - 1 ? 'Finish' : 'Next problem';
        if (pr.kind === 'choice') pr.ch.forEach((o, i) => pch.append(mkBtn(o[0], () => pickChoice(i))));
        tally();
      };
      const finish = (txt, btn) => {
        prSolved = true; if (!prTried) prFirst++; prDone++; Array.from(pch.children).forEach(b => { b.disabled = true; }); btn.classList.add('primary');
        pfb.innerHTML = good('Right.') + ' ' + txt.replace(/^<b[^>]*>Right\.<\/b>\s*/, ''); pnext.disabled = false;
      };
      const pickChoice = i => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        const right = i === pr.ans, btn = pch.children[i], txt = pr.ch[i][1];
        if (right) { finish(txt, btn); if (pr.cv.mode === 3 && pr.cv.view === 1) st.apred = true; }
        else { prTried = true; btn.disabled = true; pfb.innerHTML = bad('Not quite.') + ' ' + txt + ' Try another answer.'; }
        tally(); sync();
      };
      const checkSub = () => {
        const pr = PROBS[prIdx], TS = trickState(); if (prStage) return;
        if (TS.kind === 'pick') { pfb.innerHTML = 'Choose a bigger line and a line to take away first.'; return; }
        if (TS.kind === 'order') { prTried = true; pfb.innerHTML = bad('Not yet.') + ' The bigger line must come first, so the answer is not negative. Swap them.'; tally(); return; }
        if (TS.kind === 'tail') {
          prTried = true; pfb.innerHTML = bad('Not yet.') + ` ${shiftName(TS.A)} − ${shiftName(TS.B)} leaves ${decHtml(TS.D)}, which still repeats. The tails did not line up. Shift by a whole block of ${TX[st.ti].R.length} ${TX[st.ti].R.length === 1 ? 'digit' : 'digits'}.`; tally(); sync(); return;
        }
        prStage = 1; const coef = TS.A - TS.B;
        pfb.innerHTML = good('Good move.') + ` The tails cancel: ${coef}x = ${decHtml(TS.D)}. Now divide by ${coef} and reduce. Which fraction is it?`;
        pch.replaceChildren(); pr.fin.forEach((o, i) => pch.append(mkBtn(o[0], () => pickFin(i))));
        sync();
      };
      const pickFin = i => {
        const pr = PROBS[prIdx]; if (prSolved) return;
        const right = i === pr.ans, btn = pch.children[i], txt = pr.fin[i][1];
        if (right) finish(txt, btn); else { prTried = true; btn.disabled = true; pfb.innerHTML = bad('Not quite.') + ' ' + txt + ' Try another answer.'; }
        tally(); sync();
      };
      const nextProb = () => {
        if (prIdx < PROBS.length - 1) { prIdx++; loadProb(); sync(); return; }
        prOver = true; prStage = 2;
        pq.textContent = 'All seven problems are done.'; pch.replaceChildren(); pnext.disabled = true;
        pfb.innerHTML = `You got ${prFirst} of ${PROBS.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        pch.append(mkBtn('Start over', () => { prIdx = 0; prFirst = 0; prDone = 0; prOver = false; loadProb(); sync(); }, true));
        ptally.textContent = `Right on the first try: ${prFirst} of ${PROBS.length}`; sync();
      };

      /* ========================= sync ========================= */
      const sync = () => {
        const prac = st.practice, over = prac && prOver, m = st.mode, pr = prac && !over ? PROBS[prIdx] : null;
        vis(G.div, !prac && m === 0); vis(G.grid, !prac && m === 1); vis(G.trick, !prac && m === 2);
        vis(G.view, !prac && m === 3); vis(G.dig, !prac && m === 3 && st.view === 0); vis(G.apx, !prac && m === 3 && st.view === 1); vis(G.cards, !prac && m === 3 && st.view === 2);
        vis(G.practice, prac); vis(G.pdiv, !!pr && pr.cv.tool === 'div'); vis(G.ptrick, !!pr && pr.kind === 'trick' && prStage === 0);
        const D = DV[st.fi];
        if (!prac) {
          if (m === 0) {
            const ready = st.dp >= (D.per ? 2 : 1);
            dBtns.forEach(b => { b.disabled = !ready; });
            dBtns[0].disabled = !ready || st.k >= D.n; dBtns[1].disabled = !ready || st.k >= D.n; dBtns[2].disabled = !ready || st.k === 0;
            selFr.value = String(st.fi); dRo.innerHTML = divRo();
          }
          if (m === 1) { gnS.set(st.gn); gdS.set(st.gd); gRo.innerHTML = gridRo(); }
          if (m === 2) {
            selT.value = String(st.ti);
            tBigBtns.forEach((b, i) => b.classList.toggle('primary', st.tA === SHIFTS[i])); tSmlBtns.forEach((b, i) => b.classList.toggle('primary', st.tB === SHIFTS[i]));
            const TS = trickState(); tChkBtn.disabled = !(TS.kind === 'int' || TS.kind === 'dec'); tRo.innerHTML = trickRo();
          }
          if (m === 3) {
            selView.value = String(st.view);
            if (st.view === 0) { seqBtns.forEach((b, i) => b.classList.toggle('primary', st.seq === i)); digS.set(Math.floor(st.dig)); LS.set(st.L); dgRo.innerHTML = digRo(); }
            if (st.view === 1) apRo.innerHTML = apxRo();
            if (st.view === 2) cdRo.innerHTML = `${kk('Sorted')} ${st.cdone.length} of ${CARDS.length}`;
          }
        } else if (pr) {
          pdivBtns[0].disabled = st.k >= D.n; pdivBtns[1].disabled = st.k >= D.n; pdivBtns[2].disabled = st.k === 0;
          ptBigBtns.forEach((b, i) => b.classList.toggle('primary', st.tA === SHIFTS[i])); ptSmlBtns.forEach((b, i) => b.classList.toggle('primary', st.tB === SHIFTS[i]));
        }
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        P.draw();
      };

      const FLAGS = ['mode', 'view', 'fi', 'k', 'gn', 'gd', 'ti', 'seq'];
      const apply = (patch, immediate) => {
        cancel(); const nums = {};
        st.practice = false;
        for (const key in patch) { if (FLAGS.includes(key)) st[key] = patch[key]; else nums[key] = patch[key]; }
        if ('fi' in patch) loadFr();
        if ('ti' in patch) loadT();
        if ('gn' in patch) { st.gpred = false; gRow && Array.from(gRow.children).forEach(b => { b.disabled = false; b.classList.remove('primary'); }); gFb.innerHTML = ''; }
        if ('view' in patch) { st.zoom = 0; st.apred = false; renderApred(); }
        if ('view' in patch && patch.view === 2) { st.ci = 0; st.cdone = []; st.cres = -1; renderCard(); }
        if (immediate) { Object.assign(st, nums); sync(); } else { sync(); cancel = animateTo(st, nums, 700, sync); }
      };
      loadFr(); renderApred(); renderCard();
      const onDown = e => {
        if (st.practice || st.mode !== 1) return;
        const r = P.canvas.getBoundingClientRect(), d = cellAt(e.clientX - r.left, e.clientY - r.top, P.w, P.h);
        if (d) { st.gd = d; sync(); }
      };
      P.canvas.addEventListener('pointerdown', onDown);
      sync();
      return { destroy: () => { cancel(); P.canvas.removeEventListener('pointerdown', onDown); P.destroy(); }, apply };
    }
  });
}
