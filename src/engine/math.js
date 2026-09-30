function eig2(a, b, c, d) {
  const tr = a + d, det = a * d - b * c, disc = tr * tr / 4 - det;
  if (disc < -1e-9) return { real: false, re: tr / 2, im: Math.sqrt(-disc) };
  const r = Math.sqrt(Math.max(0, disc)), ls = r < 1e-9 ? [tr / 2] : [tr / 2 + r, tr / 2 - r], out = [];
  for (const l of ls) {
    let v;
    if (Math.abs(b) > 1e-9) v = [b, l - a];
    else if (Math.abs(c) > 1e-9) v = [l - d, c];
    else if (r < 1e-9) { out.push({ l, v: [1, 0] }, { l, v: [0, 1] }); continue; }
    else v = Math.abs(l - a) < 1e-9 ? [1, 0] : [0, 1];
    const n = Math.hypot(v[0], v[1]); out.push({ l, v: [v[0] / n, v[1] / n] });
  }
  return { real: true, list: out };
}
