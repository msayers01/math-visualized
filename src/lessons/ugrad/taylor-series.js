/* =====================================================================
   UNDERGRAD — Taylor polynomials: approximating a function from its derivatives
   ===================================================================== */
{
  const MAXN = 12;
  const FACT = [1]; for (let k = 1; k <= 14; k++) FACT[k] = FACT[k - 1] * k;
  const SUB = '₀₁₂₃₄₅₆₇₈₉', SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const dig = (n, t) => String(n).split('').map(d => t[+d]).join('');
  /* four-decimal display with a real minus sign */
  const f4 = v => {
    if (!isFinite(v)) return 'undefined';
    const a = Math.abs(v), s = a < 5e-5 ? '0.0000' : a >= 1e9 ? a.toExponential(2) : a >= 1000 ? Math.round(a).toLocaleString('en') : a.toFixed(4);
    return (v < 0 && s !== '0.0000' ? '−' : '') + s;
  };

  /* The functions. f is the function, c(a,k) the k-th Taylor coefficient f^(k)(a)/k! at center a,
     ex(k) the exact coefficient [numerator, denominator] at a = 0 (null when it is 0).
     win = [xmin, xmax, ymin, ymax] of the drawing, ar = range of the center, xr = range of the probe x,
     sing = x where the function blows up or stops (null if none). */
  const FN = {
    sin: { name: 'sin x', short: 'sin x', f: Math.sin, c: (a, k) => Math.sin(a + k * Math.PI / 2) / FACT[k],
      ex: k => k % 2 ? [k % 4 === 1 ? 1 : -1, FACT[k]] : null,
      win: [-7, 7, -4, 4], ar: [-3, 3], xr: [-6, 6], x0: 1, sing: null },
    cos: { name: 'cos x', short: 'cos x', f: Math.cos, c: (a, k) => Math.cos(a + k * Math.PI / 2) / FACT[k],
      ex: k => k % 2 ? null : [k % 4 === 0 ? 1 : -1, FACT[k]],
      win: [-7, 7, -4, 4], ar: [-3, 3], xr: [-6, 6], x0: 1, sing: null },
    exp: { name: 'eˣ', short: 'eˣ', f: Math.exp, c: (a, k) => Math.exp(a) / FACT[k],
      ex: k => [1, FACT[k]],
      win: [-4.5, 4.5, -2, 8], ar: [-3, 3], xr: [-3, 3], x0: 1, sing: null },
    ln: { name: 'ln(1 + x)', short: 'ln(1 + x)', f: x => Math.log(1 + x), c: (a, k) => k === 0 ? Math.log(1 + a) : (k % 2 ? 1 : -1) / (k * Math.pow(1 + a, k)),
      ex: k => k ? [k % 2 ? 1 : -1, k] : null,
      win: [-1.6, 4.4, -3.2, 2.8], ar: [-0.5, 2], xr: [-0.9, 4], x0: .5, sing: -1, R: a => 1 + a },
    geo: { name: '1/(1 − x)', short: '1/(1 − x)', f: x => 1 / (1 - x), c: (a, k) => 1 / Math.pow(1 - a, k + 1),
      ex: () => [1, 1],
      win: [-3, 3, -3, 5], ar: [-2, 0.5], xr: [-2.5, 2.5], x0: .5, sing: 1, R: a => Math.abs(1 - a) }
  };
  const KEYS = ['sin', 'cos', 'exp', 'ln', 'geo'];
  /* the polynomial of degree n about center a, evaluated at x */
  const tay = (fn, a, x, n) => { let s = 0, pw = 1; for (let k = 0; k <= n; k++) { s += FN[fn].c(a, k) * pw; pw *= x - a; } return s; };
  const gapOf = (fn, a, x, n) => Math.abs(FN[fn].f(x) - tay(fn, a, x, n));

  /* Predict, then see: fixed list. */
  const PRED = [
    { setup: { fn: 'sin', n: 1, a: 0, x0: 3 }, after: { n: 5 }, ans: 0,
      q: 'The center is 0 and the red line is T₁(x) = x. You are about to add terms up to degree 5. At x = 3, will the gap between sin x and the polynomial get smaller, stay about the same, or get larger?',
      why: 'Each new term matches one more derivative at the center, and the polynomial then follows the curve for longer. Here that pays off: x = 3 is not far from the center, so the extra terms pull the red curve toward sin x.' },
    { setup: { fn: 'ln', n: 3, a: 0, x0: 2 }, after: { n: 7 }, ans: 2,
      q: 'Now take ln(1 + x) with center 0, and look at x = 2. You are about to go from degree 3 to degree 7. Will the gap at x = 2 get smaller, stay about the same, or get larger?',
      why: 'The surprise: more terms made it worse. The point x = 2 is outside the violet band (radius R = 1). There the added terms xᵏ/k keep getting bigger, so each one pushes the polynomial farther from the curve.' },
    { setup: { fn: 'sin', n: 3, a: 0, x0: 2 }, after: { a: 2 }, ans: 0,
      q: 'The degree is 3 and we look at x = 2. You are about to move the center from 0 to 2, keeping the degree. Will the gap at x = 2 get smaller, stay about the same, or get larger?',
      why: 'The constant term of the polynomial is f(a), so at the center the polynomial equals the function exactly and the gap is 0. Placing the center near the point you care about is the cheapest improvement.' }
  ];
  const PCH = ['Smaller', 'About the same', 'Larger'];

  /* Practice: a fixed list. Each choice is [label, feedback]. */
  const PRAC = [
    { name: 'a coefficient', setup: { fn: 'exp', n: 3, a: 0, x0: 1 }, ans: 1,
      q: 'The Taylor polynomial of eˣ with center a = 0 has terms cₖxᵏ. What is c₃, the coefficient of x³?',
      ch: [['1/3', 'That divides by 3. The rule divides by 3! = 3·2·1 = 6.'],
           ['1/6', 'Every derivative of eˣ at 0 equals 1, so c₃ = f‴(0)/3! = 1/6.'],
           ['1', '1 is the third derivative f‴(0). The coefficient is that value divided by 3! = 6.'],
           ['3', '3 is only the exponent. The coefficient is f‴(0)/3! = 1/6.']] },
    { name: 'a sign', setup: { fn: 'sin', n: 3, a: 0, x0: 1 }, ans: 0,
      q: 'For sin x at center 0, the derivatives f, f′, f″, f‴ at 0 are 0, 1, 0, −1. What is c₃, the coefficient of x³?',
      ch: [['−1/6', 'f‴(0) = −cos 0 = −1, so c₃ = −1/3! = −1/6. The picture shows the same: the x³ term pulls the line down.'],
           ['1/6', 'The size is right but not the sign. The third derivative of sin x is −cos x, which is −1 at 0.'],
           ['0', '0 belongs to the second derivative (c₂ = 0). The x³ term uses f‴(0) = −1.'],
           ['−1/3', 'Divide by 3! = 6, not by 3.']] },
    { name: 'a new center', setup: { fn: 'exp', n: 3, a: 1, x0: 2 }, ans: 2,
      q: 'Now the center is a = 1 for eˣ, so the polynomial is c₀ + c₁(x − 1) + c₂(x − 1)² + … What is c₂? (Use e ≈ 2.718.)',
      ch: [['1/2', 'That would be right at center 0. At center 1 every derivative of eˣ equals e¹ = e, not 1.'],
           ['e', 'e is f″(1). The coefficient divides by 2! = 2.'],
           ['e/2', 'f″(1) = e, so c₂ = e/2! = e/2, about 1.359.'],
           ['2e', 'The rule divides by 2!, it does not multiply.']] },
    { name: 'a value', setup: { fn: 'ln', n: 3, a: 0, x0: .5 }, ans: 1,
      q: 'The degree 3 polynomial of ln(1 + x) at center 0 is T₃(x) = x − x²/2 + x³/3. What is T₃(0.5)?',
      ch: [['0.375', 'That stops after the x² term (degree 2): 0.5 − 0.125. Degree 3 also adds x³/3 = 0.0417.'],
           ['0.4167', '0.5 − 0.125 + 0.0417 = 0.4167. The true ln 1.5 is about 0.4055, so the gap is about 0.0112.'],
           ['0.6667', 'The signs alternate. The x² term is subtracted, not added.'],
           ['0.4010', 'That is degree 4, which also subtracts x⁴/4 = 0.0156. T₃ stops at x³.']] },
    { name: 'the radius', setup: { fn: 'ln', n: 4, a: 0, x0: 2 }, ans: 2,
      q: 'Take ln(1 + x) with center 0 and look at x = 2, which is outside |x| < 1. You raise the degree from 4 to 8. What happens to the gap at x = 2?',
      ch: [['It shrinks, because more terms always fit better', 'Not here. Outside the radius the added terms get bigger, so more terms do not mean a better fit.'],
           ['It stays about the same', 'It changes a lot: about 2.43 at degree 4 and about 20.4 at degree 8.'],
           ['It grows', 'Yes. The terms xᵏ/k at x = 2 grow (the degree 8 term is 2⁸/8 = 32), so the gap grows from about 2.43 to about 20.4.'],
           ['It becomes exactly 0', 'The polynomial is exact only at the center. Elsewhere there is a gap, and here it grows.']] },
    { name: 'estimating e', setup: { fn: 'exp', n: 4, a: 0, x0: 1 }, ans: 2,
      q: 'To estimate e use T_n(1) = 1 + 1 + 1/2 + 1/6 + … up to the term 1/n!. Take e = 2.71828. What is the smallest degree n whose estimate is within 0.01 of e?',
      ch: [['2', 'T₂(1) = 2.5, which is 0.218 away from e.'],
           ['3', 'T₃(1) = 2.6667, which is 0.0516 away. Not yet within 0.01.'],
           ['4', 'T₄(1) = 2.70833, which is 0.0099 from e. That is the first one within 0.01.'],
           ['5', 'T₅(1) = 2.71667 is within 0.01 too (about 0.0016), but T₄ already was.']] },
    { name: 'sin 0.5', setup: { fn: 'sin', n: 3, a: 0, x0: .5 }, ans: 3,
      q: 'Estimate sin 0.5 (0.5 radians) with the degree 3 polynomial x − x³/6. Which value does it give?',
      ch: [['0.5', 'That is only the degree 1 line. The cubic term lowers it by 0.0208.'],
           ['0.4583', 'That divides x³ = 0.125 by 3. The rule divides by 3! = 6.'],
           ['0.4844', 'That divides 0.125 by 8, which is 2³. The rule divides by 3! = 6.'],
           ['0.4792', '0.125 ÷ 6 = 0.0208, and 0.5 − 0.0208 = 0.4792. The true sin 0.5 is about 0.4794, so the error is about 0.0003.']] }
  ];

  register({
    id: 'taylor-series', level: 'ugrad',
    title: 'Taylor polynomials',
    blurb: 'Add terms one at a time, built from derivatives at a point, and watch a polynomial hug a curve until it cannot.',
    thumb(c, p) {
      const pal = p.pal; p.cx = 0; p.cy = 0; p.span = 3.6;
      p.grid(1, { axes: false });
      p.path([[-4.5, 0], [4.5, 0]], { stroke: pal['grid-strong'], width: 1.5 }); p.path([[0, -3], [0, 3]], { stroke: pal['grid-strong'], width: 1.5 });
      const f = [], t = []; for (let i = 0; i <= 90; i++) { const x = -4.5 + i / 10; f.push([x, 1.6 * Math.sin(x)]); const y = 1.6 * (x - x * x * x / 6 + Math.pow(x, 5) / 120); if (Math.abs(y) < 3.6) t.push([x, y]); }
      p.path(t, { stroke: pal.red, width: 2.6 }); p.path(f, { stroke: pal.blue, width: 3 });
      p.dot(0, 0, 5, pal.yellow, pal.stage, 2);
    },
    hook: String.raw`Your calculator knows \(\sin 0.5\) and \(e\), yet all it can really do is add, multiply and divide. How does a machine that only does arithmetic find the height of a curve? Real calculators use cleverer relatives of this idea.`,
    steps: [
      { title: 'Start with a line',
        text: String.raw`<p>The blue curve is \(\sin x\). The red line is \(T_1(x)=x\). At the center \(a=0\) it has the same height (\(0\)) and the same slope (\(1\)) as the curve, so it hugs the curve there.</p><p>Step away and they part. At \(x=1\) the gap is \(0.1585\). How can we do better?</p>`,
        set: { fn: 'sin', n: 1, a: 0, x0: 1 } },
      { title: 'Add terms',
        text: String.raw`<p>Each new term lets the polynomial match one more derivative at the center. At \(x=2\) the gap is \(1.0907\) with degree 1, \(0.2426\) with degree 3 and \(0.0240\) with degree 5. Use the <b>degree</b> stepper to see it.</p><p>Now drag the probe out to \(x=4\): the same degree 5 polynomial misses by \(2.6235\). The gap grows as you leave the center.</p>`,
        set: { fn: 'sin', n: 5, a: 0, x0: 2 } },
      { title: 'Where the numbers come from',
        text: String.raw`<p>We want a polynomial whose derivatives at \(a\) equal those of \(f\). For \(e^x\) every derivative at \(0\) is \(1\). The \(k\)-th derivative of \(c_kx^k\) at \(0\) is \(k!\,c_k\), so \(c_k=1/k!\): the coefficients are \(1,1,\tfrac12,\tfrac16,\tfrac1{24}\).</p><p>At \(x=1\), degree 4 gives \(2.7083\) against \(e=2.7183\): gap \(0.0099\).</p>`,
        set: { fn: 'exp', n: 4, a: 0, x0: 1 } },
      { title: 'Where it stops working',
        text: String.raw`<p>For \(\ln(1+x)\) the function blows up at \(x=-1\), a distance \(R=1\) from the center. Inside the violet band the polynomials hug the curve. At \(x=1.5\), outside it, degree 6 gives \(-0.1453\) while \(\ln 2.5=0.9163\).</p><p>Raise the degree: the gap at \(x=1.5\) gets bigger, not smaller. Whether a polynomial settles on the curve is a separate question from having the derivatives.</p>`,
        set: { fn: 'ln', n: 6, a: 0, x0: 1.5 } }
    ],
    formal: String.raw`
      <p>Suppose \(f\) has derivatives of every order near a point \(a\). The <em>Taylor polynomial</em> of degree \(n\) at the center \(a\) is the polynomial
      \[ T_n(x)=\sum_{k=0}^{n} \frac{f^{(k)}(a)}{k!}\,(x-a)^k = f(a)+f'(a)(x-a)+\frac{f''(a)}{2!}(x-a)^2+\cdots+\frac{f^{(n)}(a)}{n!}(x-a)^n. \]
      Here \(f^{(k)}\) is the \(k\)-th derivative and \(k!=k(k-1)\cdots 1\) (with the conventions \(0!=1\) and \(f^{(0)}=f\)). It is the one polynomial of degree at most \(n\) whose value and first \(n\) derivatives at \(a\) equal those of \(f\).</p>
      <h3>Why the coefficients are \(f^{(k)}(a)/k!\)</h3>
      <p>Write \(T(x)=c_0+c_1(x-a)+c_2(x-a)^2+\cdots+c_n(x-a)^n\) and ask that \(T^{(k)}(a)=f^{(k)}(a)\) for \(k=0,\dots,n\). Differentiate \(T\) \(k\) times. Every term of degree below \(k\) disappears. Every term of degree above \(k\) still contains a factor \((x-a)\), which is \(0\) at \(x=a\). Only \(c_k(x-a)^k\) is left, and its \(k\)-th derivative is \(k(k-1)\cdots1\cdot c_k=k!\,c_k\). So \(T^{(k)}(a)=k!\,c_k\), and matching gives
      \[ c_k=\frac{f^{(k)}(a)}{k!}. \]
      The \(k!\) is not decoration: it cancels the factors that differentiating \((x-a)^k\) produces.</p>
      <h3>The standard examples at \(a=0\)</h3>
      <p>For \(e^x\) all derivatives at \(0\) equal \(1\), so \(T_n(x)=1+x+\tfrac{x^2}{2!}+\cdots+\tfrac{x^n}{n!}\). For \(\sin x\) the derivatives at \(0\) cycle through \(0,1,0,-1\), giving \(x-\tfrac{x^3}{3!}+\tfrac{x^5}{5!}-\cdots\). For \(\cos x\) they cycle through \(1,0,-1,0\), giving \(1-\tfrac{x^2}{2!}+\tfrac{x^4}{4!}-\cdots\). For \(\ln(1+x)\) the first derivative is \(\frac{1}{1+x}=1-x+x^2-\cdots\), and integrating term by term gives \(x-\tfrac{x^2}{2}+\tfrac{x^3}{3}-\cdots\), so \(c_k=(-1)^{k-1}/k\). For \(\frac{1}{1-x}\) every coefficient is \(1\).</p>
      <h3>The error</h3>
      <p>The gap \(f(x)-T_n(x)\) is the <em>error</em> (or remainder). A theorem proved in a calculus course (Taylor's theorem with the Lagrange remainder) says that for some number \(\xi\) between \(a\) and \(x\),
      \[ f(x)-T_n(x)=\frac{f^{(n+1)}(\xi)}{(n+1)!}\,(x-a)^{n+1}. \]
      This explains what the lesson shows: the error carries the factor \((x-a)^{n+1}\), so it is small near the center and grows with the distance \(|x-a|\), while the \((n+1)!\) in the denominator works to shrink it as the degree rises.</p>
      <h3>Worked example: estimating \(\sin 0.5\) and \(e\)</h3>
      <p>For \(\sin x\) every derivative is \(\pm\sin\) or \(\pm\cos\), so \(\lvert f^{(n+1)}(\xi)\rvert\le 1\). The polynomials \(T_3\) and \(T_4\) are the same (the \(x^4\) coefficient is \(0\)), so use \(n=4\): the error at \(x=0.5\) is at most \(0.5^5/5!\approx0.00026\), so at most \(0.00027\). And \(T_3(0.5)=0.5-\tfrac{0.125}{6}=0.47917\), so \(\sin 0.5\) is within \(0.00027\) of \(0.47917\).</p>
      <p>For \(e=e^1\), \(T_n(1)=\sum_{k=0}^{n}\frac1{k!}\). Here \(f^{(n+1)}(\xi)=e^{\xi}&lt;3\) for \(\xi\) between \(0\) and \(1\), so the error is below \(3/(n+1)!\). Taking \(n=5\) gives error below \(3/720&lt;0.005\), and \(T_5(1)=2.71667\). So \(e\) lies between \(2.711\) and \(2.722\). (The actual gap at degree 4 is \(0.0099\), which the lesson reads off the picture, but the formula lets you guarantee accuracy without knowing \(e\).)</p>
      <h3>The radius: where polynomials stop working</h3>
      <p>Multiply out to check the identity \((1-x)(1+x+\cdots+x^n)=1-x^{n+1}\). Dividing by \(1-x\),
      \[ \frac{1}{1-x}-\bigl(1+x+\cdots+x^n\bigr)=\frac{x^{n+1}}{1-x}. \]
      This error is exact. If \(\lvert x\rvert&lt;1\), then \(x^{n+1}\to0\) and the error shrinks to \(0\) as \(n\) grows. If \(\lvert x\rvert&gt;1\), then \(\lvert x\rvert^{n+1}\) grows without bound, so the gap grows with the degree, the same flying-away you see for \(\ln(1+x)\) at \(x=1.5\) and \(x=2\). The function \(\frac1{1-x}\) blows up at \(x=1\), a distance \(1\) from the center \(0\). With center \(a\) the size of this safe zone becomes \(R=\lvert 1-a\rvert\).</p>
      <p>For \(\ln(1+x)\) the term \(\pm x^k/k\) does not even tend to \(0\) when \(\lvert x\rvert&gt;1\), so the polynomials cannot settle there. The function stops at \(x=-1\), so \(R=1+a\). This number \(R\) is the <em>radius of convergence</em> of these two examples: the polynomials settle on the function for \(\lvert x-a\rvert&lt;R\) and fly away for \(\lvert x-a\rvert&gt;R\). The edge \(\lvert x-a\rvert=R\) needs a separate look.</p>
      <h3>Caveats</h3>
      <p>Having every derivative at \(a\) does not by itself make the polynomials settle on \(f\). Convergence is a separate question, and it can depend on \(x\). For \(\sin x\), \(\cos x\) and \(e^x\) the pictures show polynomials that keep hugging farther out as the degree rises; the remainder bound above gives this at every \(x\) for these three functions, since \(|x-a|^{n+1}/(n+1)!\) tends to \(0\), though the limit itself is not proved here. There are even smooth functions, such as \(e^{-1/x^2}\) (with value \(0\) at \(0\)), whose Taylor polynomials at \(0\) are all the zero polynomial although the function is not zero. In practice: more terms help near the center, the center should sit near the point you need, and the error formula tells you when you can stop.</p>`,
    check: [
      { q: String.raw`The Taylor polynomial of \(f\) at center \(a\) is built so that its value and first \(n\) derivatives at \(a\) match those of \(f\). Why is the coefficient of \((x-a)^k\) equal to \(f^{(k)}(a)/k!\) rather than just \(f^{(k)}(a)\)?`,
        choices: ['So that the polynomial stays small enough to converge.',
                  'Because slopes must be divided by the number of terms in the polynomial.',
                  String.raw`Because the \(k\)-th derivative of \((x-a)^k\) is \(k!\), so dividing by \(k!\) makes the \(k\)-th derivative of the polynomial at \(a\) equal \(f^{(k)}(a)\).`,
                  'Because it only works for functions whose derivatives all equal 1.'], answer: 2,
        why: String.raw`Differentiating \(c_k(x-a)^k\) a total of \(k\) times gives \(k!\,c_k\). To make this equal \(f^{(k)}(a)\) we need \(c_k=f^{(k)}(a)/k!\). The division has nothing to do with keeping the polynomial small, and it works for any function with enough derivatives, not just \(e^x\).`,
        hint: String.raw`Differentiate \((x-a)^3\) three times and see what number comes out.` },
      { q: String.raw`Let \(f(x)=e^{2x}\) with center \(a=0\). Its derivatives are \(f'=2e^{2x}\), \(f''=4e^{2x}\), \(f'''=8e^{2x}\). What is the degree 3 Taylor polynomial evaluated at \(x=0.5\), that is \(T_3(0.5)\)?`,
        choices: ['4', String.raw`\(\tfrac{8}{3}\)`, String.raw`\(\tfrac{5}{2}\)`, String.raw`\(e\approx 2.718\)`], answer: 1,
        why: String.raw`At \(0\) the derivatives are \(1,2,4,8\), so the coefficients are \(1,\ 2,\ \tfrac{4}{2!}=2,\ \tfrac{8}{3!}=\tfrac43\). Then \(T_3(0.5)=1+1+2(0.25)+\tfrac43(0.125)=1+1+0.5+0.1667=\tfrac83\). The answer 4 forgets to divide by \(k!\). The answer \(\tfrac52\) stops at degree 2. The number \(e\) is the true value \(f(0.5)\), not the polynomial.`,
        hint: String.raw`Coefficient \(c_k\) is \(f^{(k)}(0)/k!\). Then add \(c_k(0.5)^k\) for \(k=0,1,2,3\).` },
      { q: String.raw`A student writes: "The Taylor polynomial of \(\ln(1+x)\) at center 0 is \(T_n(x)=x-\tfrac{x^2}{2}+\tfrac{x^3}{3}-\cdots\pm\tfrac{x^n}{n}\). Every added term is a correction, so more terms always improve the estimate. So \(T_{20}(3)\) will be very close to \(\ln 4\)." Which statement is correct?`,
        choices: ['The claim is correct, because every added term is a correction.',
                  String.raw`The claim is correct, because \(\ln(1+x)\) has derivatives of every order at 0.`,
                  String.raw`The claim is wrong, because \(\ln(1+x)\) is not defined at \(x=3\).`,
                  String.raw`The claim is wrong: at \(x=3\) the terms \(3^k/k\) keep growing, so more terms push the polynomial away from \(\ln 4\). The point \(x=3\) is outside the radius \(\lvert x\rvert&lt;1\).`], answer: 3,
        why: String.raw`Having all derivatives at 0 does not make the polynomials settle everywhere. At \(x=3\) the terms \(3^k/k\) grow without bound, so the gap gets larger with the degree. The function is defined there (\(\ln 4\)), so the third choice gives a false reason. Whether polynomials converge is a separate question from whether derivatives exist.`,
        hint: String.raw`Compute the size of the terms \(3^k/k\) for \(k=1,2,3,4\). Do they shrink?` }
    ],
    links: { related: ['derivatives-as-tangent-slopes', 'limits-and-epsilon-delta', 'the-fundamental-theorem-of-calculus', 'exponential-growth', 'the-unit-circle-and-trig-waves'] },

    mount({ stage, controls: C }) {
      const panel = stage.nextElementSibling;
      const P = new Plane(stage, { span: 6 });
      const st = { fn: 'sin', n: 1, a: 0, x0: 1, practice: false };
      let cancel = () => {}, showR = true, tol = .01;
      const F = () => FN[st.fn];
      const coefs = () => { const f = F(), r = []; for (let k = 0; k <= MAXN; k++) r.push(f.c(st.a, k)); return r; };
      const tAt = (x, n, cf) => { let s = 0, pw = 1; for (let k = 0; k <= n; k++) { s += cf[k] * pw; pw *= x - st.a; } return s; };
      const Tn = n => 'T' + dig(n, SUB);
      /* keep dots on the canvas when f leaves the y-window (e^x for large x, 1/(1-x) near 1) */
      const yc = y => { const b = P.bounds(), m = 16 / P.scale; return clamp(y, b.y0 + m, b.y1 - m); };
      let lastHd = null;

      /* ---- the polynomial as text ---- */
      const polyText = n => {
        const a = st.a, f = F(), parts = [], exact = Math.abs(a) < 1e-6;
        for (let k = 0; k <= n; k++) {
          let sign, body;
          if (exact) {
            const e = f.ex(k); if (!e) continue;
            sign = e[0] < 0 ? -1 : 1;
            body = k === 0 ? '1' : 'x' + (k > 1 ? dig(k, SUP) : '') + (e[1] > 1 ? '/' + e[1] : '');
          } else {
            const c = f.c(a, k); if (Math.abs(c) < 1e-12) continue;
            sign = c < 0 ? -1 : 1;
            const m = +Math.abs(c).toPrecision(3), u = '(x ' + (a < 0 ? '+ ' + num(-a) : '− ' + num(a)) + ')' + (k > 1 ? dig(k, SUP) : '');
            body = k === 0 ? String(m) : (m === 1 ? '' : String(m)) + u;
          }
          parts.push([sign, body]);
        }
        if (!parts.length) return '0';
        const cut = parts.length > 7;
        return parts.slice(0, 7).map(([s, b], i) => (i ? (s < 0 ? ' − ' : ' + ') : (s < 0 ? '−' : '')) + b).join('') + (cut ? ' + …' : '');
      };

      /* ---- drawing ---- */
      P.onDraw = (c, p) => {
        const pal = p.pal, f = F(), W = f.win, a = st.a, n = st.n, cf = coefs();
        const sc = Math.min(p.w / (W[1] - W[0]), p.h / (W[3] - W[2]));
        p.span = Math.min(p.w, p.h) / (2 * sc); p.cx = (W[0] + W[1]) / 2; p.cy = (W[2] + W[3]) / 2;
        const b = p.bounds(), fs = clamp(p.w / 26, 14.5, 19), tg = (px, py) => p.toMath(px, py);
        const lab = (t, px, py, o) => { const [x, y] = tg(px, py); p.label(t, x, y, { size: fs, italic: false, ...o }); };
        p.grid(1); p.ticks(1, { size: 15 });

        /* sample f and T on a common grid, in runs that stop at the blow-up or the edge of the domain */
        const N = 360, Lm = (b.y1 - b.y0) * 2, cl = y => clamp(y, b.y0 - Lm, b.y1 + Lm);
        const runs = []; let cur = null, px0 = null;
        for (let i = 0; i <= N; i++) {
          const x = b.x0 + (b.x1 - b.x0) * i / N, fy = f.f(x), ty = tAt(x, n, cf);
          const bad = !isFinite(fy) || !isFinite(ty) || (f.sing === 1 && px0 !== null && (px0 < 1) !== (x < 1));
          if (bad) { cur = null; px0 = x; if (!isFinite(fy) || !isFinite(ty)) continue; }
          if (!cur) { cur = []; runs.push(cur); }
          cur.push([x, cl(fy), cl(ty)]); px0 = x;
        }
        runs.forEach(r => { if (r.length > 1) p.path(r.map(q => [q[0], q[1]]).concat(r.map(q => [q[0], q[2]]).reverse()), { fill: alpha(pal.yellow, .2), close: true }); });

        /* radius band for the two functions that blow up */
        if (f.R && showR) {
          const R = f.R(a), s = f.sing, lo = Math.max(a - R, b.x0), hi = Math.min(a + R, b.x1);
          /* the dashed line leaves a gap under the axis so it does not strike through the tick label, and the dot sitting on that label is dropped */
          const g0 = 4 / p.scale, g1 = 26 / p.scale;
          p.path([[s, b.y1], [s, g0]], { stroke: pal.violet, width: 2, dash: [7, 6] });
          p.path([[s, -g1], [s, b.y0]], { stroke: pal.violet, width: 2, dash: [7, 6] });
          p.path([[lo, 0], [hi, 0]], { stroke: alpha(pal.violet, .85), width: 9 });
          if (a - R >= b.x0 && Math.abs(a - R - s) > 1e-9) p.dot(a - R, 0, 7, pal.stage, pal.violet, 3);
          if (a + R <= b.x1 && Math.abs(a + R - s) > 1e-9) p.dot(a + R, 0, 7, pal.stage, pal.violet, 3);
          lab((p.h < 400 ? 'R = ' : 'radius R = ') + num(R), p.X((lo + hi) / 2), p.Y(0) - 24, { color: pal.violet, align: 'center' });
          lab(st.fn === 'ln' ? 'not defined at x = −1' : 'not defined at x = 1', p.X(s) + (p.X(s) > p.w / 2 ? -8 : 8), p.h - 40, { color: pal.violet, align: p.X(s) > p.w / 2 ? 'right' : 'left' });
        }

        runs.forEach(r => { if (r.length > 1) p.path(r.map(q => [q[0], q[1]]), { stroke: pal.blue, width: 3.6 }); });
        runs.forEach(r => { if (r.length > 1) p.path(r.map(q => [q[0], q[2]]), { stroke: pal.red, width: 3, dash: [] }); });

        /* probe: vertical line, the two heights and the gap */
        const x0 = st.x0, fy = f.f(x0), ty = tAt(x0, n, cf), okp = isFinite(fy);
        p.path([[x0, b.y0], [x0, b.y1]], { stroke: pal['grid-strong'], width: 1.5, dash: [5, 6] });
        const sl = p.X(x0) > p.w - 70 ? 'right' : p.X(x0) < 70 ? 'left' : 'center';
        lab('x = ' + num(x0), p.X(x0) + (sl === 'right' ? 4 : sl === 'left' ? -4 : 0), p.h - 14, { color: pal.muted, align: sl });
        if (okp) {
          const ya = yc(fy), yb = clamp(ty, b.y0 + .1, b.y1 - .1);
          p.path([[x0, ya], [x0, yb]], { stroke: pal.yellow, width: 6 });
          if (Math.abs(ty) < Math.max(b.y1, -b.y0)) p.dot(x0, ty, 6, pal.red, pal.stage, 2);
          p.dot(x0, ya, 7, pal.blue, pal.stage, 2); p.dot(x0, ya, 11, null, pal.brass, 3);
          const my = clamp((ya + yb) / 2, b.y0 + 12 / p.scale, b.y1 - 12 / p.scale), right = p.X(x0) < p.w * .6;
          p.label('gap ' + f4(Math.abs(fy - ty)), x0, my, { size: fs, italic: false, color: pal.text, align: right ? 'left' : 'right', dx: right ? 12 : -12 });
        }
        /* the center */
        const fa = yc(f.f(a));
        p.dot(a, fa, 8, pal.yellow, pal.stage, 2); p.dot(a, fa, 12, null, pal.brass, 3);
        lab('center a = ' + num(a), p.X(a), p.Y(fa) + (fa > (b.y0 + b.y1) / 2 ? 26 : -26), { color: pal.text });

        /* legend */
        const sm = p.h < 400, rows = sm ? [[pal.blue, 'f(x) = ' + f.name], [pal.red, Tn(n) + ', degree ' + n], [pal.yellow, 'gap (shaded)']]
          : [[pal.blue, 'f(x) = ' + f.name], [pal.red, Tn(n) + '(x), degree ' + n], [pal.yellow, 'gap |f − ' + Tn(n) + '| (shaded)']];
        if (f.R && showR && !sm) rows.push([pal.violet, 'radius R (violet)']);
        c.font = `500 ${fs * .85}px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif`;
        const rh = fs + 7, bw = Math.max(...rows.map(r => c.measureText(r[1]).width)) + 44;
        c.fillStyle = alpha(pal.stage, .86); c.fillRect(6, 6, bw, rows.length * rh + 6);
        rows.forEach((r, i) => {
          const y = 6 + 3 + rh * (i + .5);
          c.strokeStyle = r[0]; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(14, y); c.lineTo(34, y); c.stroke();
          c.fillStyle = pal.text; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(r[1], 42, y);
        });
      };

      /* ---- panel ---- */
      const ctlStart = panel.children.length;
      const setRange = (s, lo, hi, v) => {
        s.inp.min = lo; s.inp.max = hi; s.inp.value = v; s.out.textContent = num(v);
        s.inp.style.setProperty('--p', ((v - lo) / (hi - lo) * 100) + '%');
      };
      const mkSlider = o => { const s = C.slider(o), el = panel.lastElementChild; s.inp = el.querySelector('input'); s.out = el.querySelector('output'); s.inp.addEventListener('input', () => s.inp.style.setProperty('--p', ((+s.inp.value - s.inp.min) / (s.inp.max - s.inp.min) * 100) + '%')); return s; };
      const mkBtn = (label, onClick, primary) => h('button', { type: 'button', class: primary ? 'btn primary' : 'btn', onclick: onClick }, label);
      const good = t => `<b style="color:var(--green)">${t}</b>`;
      const bad = t => `<b style="color:var(--red)">${t}</b>`;

      C.title('Function and degree');
      const fnSel = C.select({ label: 'Function', value: st.fn, options: KEYS.map(k => ({ value: k, label: FN[k].name })),
        onChange: v => { cancel(); st.fn = v; st.a = 0; st.x0 = FN[v].x0; sync(); } });
      const nS = mkSlider({ label: 'Degree n (number of terms minus one)', min: 0, max: MAXN, step: 1, value: st.n, format: v => String(Math.round(v)), onInput: v => { cancel(); st.n = Math.round(v); sync(); } });
      const [bMinus, bPlus] = C.buttons([
        { label: 'Remove a term', onClick: () => { cancel(); st.n = Math.max(0, st.n - 1); sync(); } },
        { label: 'Add a term', primary: true, onClick: () => { cancel(); st.n = Math.min(MAXN, st.n + 1); sync(); } }]);
      C.title('Center and probe');
      const aS = mkSlider({ label: 'Center a', min: -3, max: 3, step: .5, value: st.a, onInput: v => { cancel(); st.a = Math.round(v * 10) / 10; sync(); } });
      const xS = mkSlider({ label: 'Probe x', min: -6, max: 6, step: .1, value: st.x0, onInput: v => { cancel(); st.x0 = Math.round(v * 10) / 10; sync(); } });
      const radT = C.toggle({ label: 'Show the radius R', value: true, onChange: v => { showR = v; P.draw(); } });
      const radRow = panel.lastElementChild;
      const tolSel = C.select({ label: 'Target gap', value: '0.01', options: [['0.1', '0.1'], ['0.01', '0.01'], ['0.001', '0.001'], ['0.0001', '0.0001']].map(o => ({ value: o[0], label: o[1] })),
        onChange: v => { tol = +v; sync(); } });
      const ro = C.readout();
      C.hint('Drag the blue probe dot along the curve, or the yellow center dot. The sliders and buttons do the same.');

      /* ---- predict, then see ---- */
      const prBox = h('div', { style: 'display:flex;flex-direction:column;gap:10px;min-width:0' });
      const prTitle = h('p', { class: 'ctl-title' }, 'Predict, then see');
      const prQ = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
      const prBtns = h('div', { class: 'ctl buttons' }); const prFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
      const prGo = mkBtn('Set up prediction 1', () => setupPred(), true), prNext = mkBtn('Next prediction', () => { pi = (pi + 1) % PRED.length; phase = 0; sync(); }, true);
      const prRow = h('div', { class: 'ctl buttons' }, prGo, prNext);
      prBox.append(prTitle, prQ, prBtns, prFb, prRow); panel.append(prBox);
      let pi = 0, phase = 0, exploreEls = [];
      const setupPred = () => { cancel(); Object.assign(st, PRED[pi].setup); phase = 1; sync(); };
      const answerPred = i => {
        const pr = PRED[pi], s = PRED[pi].setup, aft = { ...s, ...pr.after };
        const g0 = gapOf(s.fn, s.a, s.x0, s.n), g1 = gapOf(aft.fn, aft.a, aft.x0, aft.n);
        phase = 2; prFb.innerHTML = (i === pr.ans ? good('Right. ') : bad('Not quite. ')) + `At x = ${num(s.x0)} the gap was ${f4(g0)} before and is ${f4(g1)} after. ` + pr.why;
        cancel(); Object.assign(st, aft); lastHd = null; sync();
      };
      const drawPred = () => {
        const pr = PRED[pi];
        prGo.textContent = 'Set up prediction ' + (pi + 1) + ' of ' + PRED.length;
        prQ.style.display = phase >= 1 ? '' : 'none'; prQ.textContent = pr.q;
        prGo.style.display = phase === 0 ? '' : 'none'; prNext.style.display = phase === 2 ? '' : 'none';
        prBtns.style.display = phase === 1 ? '' : 'none'; prFb.style.display = phase === 2 ? '' : 'none';
        if (phase === 1 && !prBtns.children.length) PCH.forEach((t, i) => prBtns.append(mkBtn(t, () => answerPred(i))));
        if (phase !== 1) prBtns.replaceChildren();
      };
      exploreEls = [...panel.children].slice(ctlStart);

      /* ---- practice ---- */
      C.title('Practice');
      const practiceHead = panel.lastElementChild;
      C.hint('Seven short problems. Nothing here is saved or scored.');
      const pHint = panel.lastElementChild;
      const startBtn = C.buttons([{ label: 'Start practice', primary: true, onClick: () => { cancel(); if (st.practice) st.practice = false; else { st.practice = true; if (pOver || !pLoaded) { pIdx = 0; pFirst = 0; pDone = 0; pLoaded = true; loadProb(); } else Object.assign(st, PRAC[pIdx].setup); } sync(); } }])[0];
      let pIdx = 0, pFirst = 0, pDone = 0, pSolved = false, pTried = false, pOver = false, pLoaded = false, curBtns = [];
      const pBox = h('div', { style: 'display:flex;flex-direction:column;gap:12px;min-width:0' });
      const pTitle = h('p', { class: 'ctl-title' }); const pPrompt = h('p', { style: 'margin:0;font-size:.95rem;line-height:1.5' });
      const pBtns = h('div', { class: 'ctl buttons' }); const pFb = h('div', { class: 'ctl readout', 'aria-live': 'polite' });
      const pNext = mkBtn('Next problem', () => nextProb(), true), pNextBox = h('div', { class: 'ctl buttons' }, pNext);
      pBox.append(pTitle, pPrompt, pBtns, pFb, pNextBox); panel.append(pBox);

      const tally = () => { pTitle.textContent = `Problem ${pIdx + 1} of ${PRAC.length}: ${PRAC[pIdx].name}. Right on the first try: ${pFirst} of ${pDone} done`; };
      const loadProb = () => {
        pSolved = false; pTried = false; pOver = false; pNext.disabled = true; pNext.textContent = pIdx === PRAC.length - 1 ? 'Finish' : 'Next problem';
        const pr = PRAC[pIdx]; pPrompt.textContent = pr.q; pFb.innerHTML = ''; pBtns.replaceChildren(); pNextBox.style.display = '';
        curBtns = pr.ch.map((o, i) => { const bt = mkBtn(o[0], () => choose(i)); bt._dead = false; pBtns.append(bt); return bt; });
        Object.assign(st, pr.setup); tally();
      };
      const choose = i => {
        const pr = PRAC[pIdx]; if (pSolved || curBtns[i]._dead) return;
        if (i === pr.ans) { pSolved = true; curBtns.forEach(bt => { bt.disabled = true; }); curBtns[i].classList.add('primary'); pFb.innerHTML = good('Right. ') + pr.ch[i][1]; if (!pTried) pFirst++; pDone++; pNext.disabled = false; tally(); }
        else { pTried = true; curBtns[i]._dead = true; curBtns[i].disabled = true; pFb.innerHTML = bad('Not quite. ') + pr.ch[i][1] + ' Try another answer.'; }
      };
      const nextProb = () => {
        if (pIdx < PRAC.length - 1) { pIdx++; loadProb(); sync(); return; }
        pOver = true; pBtns.replaceChildren(); pFb.innerHTML = ''; pNextBox.style.display = 'none';
        pPrompt.textContent = `You got ${pFirst} of ${PRAC.length} right on the first try. Press Start over to try again, or go back to the lesson.`;
        pTitle.textContent = `Right on the first try: ${pFirst} of ${PRAC.length}`;
        pBtns.append(mkBtn('Start over', () => { pIdx = 0; pFirst = 0; pDone = 0; loadProb(); sync(); }, true));
        sync();
      };

      /* ---- readout and sync ---- */
      const roText = () => {
        const f = F(), n = st.n, cf = coefs(), x = st.x0, fy = f.f(x), ty = tAt(x, n, cf), gap = Math.abs(fy - ty);
        let first = null;
        for (let m = MAXN; m >= 0 && Math.abs(f.f(x) - tAt(x, m, cf)) < tol; m--) first = m;
        const ok = isFinite(fy);
        return `<span class="k">Polynomial</span> ${Tn(n)}(x) ${Math.abs(st.a) < 1e-6 ? '=' : '≈'} ${polyText(n)}<br>` +
          (ok ? `<span class="k">At x =</span> ${num(x)} (distance ${num(Math.abs(x - st.a))} from the center)<br>
          <span class="k">f(x)</span> ${f4(fy)}<br><span class="k">${Tn(n)}(x)</span> ${f4(ty)}<br><span class="k">Gap</span> ${f4(gap)}<br>
          <span class="k">Smallest degree from which the gap stays below ${tol}</span> ${first === null ? 'none up to ' + MAXN : first}`
            : `<span class="k">At x =</span> ${num(x)}: f(x) is not defined here (it blows up), so there is no gap to measure.`);
      };
      const sync = () => {
        const f = F(), prac = st.practice;
        st.a = clamp(st.a, f.ar[0], f.ar[1]); st.x0 = clamp(st.x0, f.xr[0], f.xr[1]);
        fnSel.value = st.fn; nS.set(st.n); setRange(aS, f.ar[0], f.ar[1], st.a); setRange(xS, f.xr[0], f.xr[1], st.x0);
        bMinus.disabled = st.n <= 0; bPlus.disabled = st.n >= MAXN;
        exploreEls.forEach(el => { el.style.display = prac ? 'none' : ''; });
        practiceHead.style.display = pHint.style.display = prac ? 'none' : '';
        pBox.style.display = prac ? '' : 'none';
        if (!prac) { radRow.style.display = f.R ? '' : 'none'; drawPred(); ro.innerHTML = roText(); }
        startBtn.textContent = prac ? 'Back to the lesson' : 'Start practice';
        P.draw();
      };

      /* ---- dragging ---- */
      draggable(P, {
        hit: (px, py) => {
          if (st.practice) return null;
          const f = F();
          const onP = isFinite(f.f(st.x0)) && near(P, st.x0, yc(f.f(st.x0)), px, py), onC = near(P, st.a, yc(f.f(st.a)), px, py);
          if (onP && onC) {
            const dP = Math.hypot(P.X(st.x0) - px, P.Y(yc(f.f(st.x0))) - py), dC = Math.hypot(P.X(st.a) - px, P.Y(yc(f.f(st.a))) - py);
            return Math.abs(dP - dC) > 1 ? (dP < dC ? 'probe' : 'center') : lastHd === 'probe' ? 'probe' : 'center';
          }
          return onP ? 'probe' : onC ? 'center' : null;
        },
        move: (hd, x) => {
          cancel(); const f = F(); lastHd = hd;
          if (hd === 'probe') st.x0 = clamp(snap(x, .1), f.xr[0], f.xr[1]);
          else st.a = clamp(snap(x, .5), f.ar[0], f.ar[1]);
          sync();
        }
      });

      const apply = (patch, immediate) => {
        cancel(); st.practice = false; phase = Math.min(phase, 0) || 0;
        const { fn, n, ...nums } = patch;
        if (n !== undefined) st.n = n;
        if (fn !== undefined && fn !== st.fn) { st.fn = fn; Object.assign(st, nums); immediate = true; }
        if (immediate) { Object.assign(st, nums); sync(); } else cancel = animateTo(st, nums, 900, sync);
        if (immediate) sync();
      };
      sync();
      return { destroy: () => { cancel(); P.destroy(); }, apply };
    }
  });
}
