/* =====================================================================
   PAGES
   ===================================================================== */
const NUMERALS = { school: '01', ugrad: '02', grad: '03' };

function renderHome(app) {
  document.title = 'Continuum: mathematics you can move';
  const heroCanvas = h('div', { class: 'hero-canvas', 'aria-hidden': 'true' });
  const cells = [0, 1, 2, 3].map(() => h('span', { class: 'm' }));
  const detEl = h('span', { class: 'v' }), eigEl = h('span', { class: 'v' });
  app.append(h('section', { class: 'hero' }, heroCanvas,
    h('div', { class: 'wrap hero-inner' },
      h('div', { class: 'hero-copy' },
        h('h1', { class: 'display hero-title' }, h('span', { class: 'line' }, 'Mathematics'), h('span', { class: 'line' }, 'you can move.')),
        h('p', { class: 'hero-sub' }, 'Interactive visualizations from middle school through graduate study. Drag, slide, and watch each idea change shape.'),
        h('div', { class: 'hero-cta' },
          h('a', { class: 'btn primary', href: '#/viz/linear-transformations' }, 'Start with linear maps'),
          h('a', { class: 'btn', href: '#/level/school' }, 'Browse all topics'))),
      h('div', { class: 'instrument', 'aria-hidden': 'true' },
        h('div', { class: 'inst-item inst-matrix' }, h('span', { class: 'k' }, 'Matrix on screen'), h('span', { class: 'matrix' }, cells)),
        h('div', { class: 'inst-item' }, h('span', { class: 'k' }, 'Determinant'), detEl),
        h('div', { class: 'inst-item' }, h('span', { class: 'k' }, 'Eigenvalues'), eigEl)))));

  /* topic lists, one section per level */
  const thumbs = [], levels = h('div', { class: 'wrap levels' });
  for (const [key, L] of Object.entries(LEVELS)) {
    const live = VIZ.filter(v => v.level === key), todo = PLANNED[key].filter(t => !live.some(v => v.id === slug(t))), total = live.length + todo.length;
    const list = h('ul', { class: 'topics' });
    for (const v of live) {
      const th = h('div', { class: 'thumb', 'aria-hidden': 'true' });
      if (v.thumb) thumbs.push([th, v.thumb]);
      list.append(h('li', {}, h('a', { class: 'topic', href: '#/viz/' + v.id },
        th, h('div', { class: 'tt' }, h('span', { class: 't' }, v.title), h('span', { class: 'd' }, v.blurb)),
        h('span', { class: 'go' }, 'Open'))));
    }
    for (const t of todo)
      list.append(h('li', { class: 'planned' }, h('div', { class: 'topic' },
        h('div', { class: 'thumb empty', 'aria-hidden': 'true' }),
        h('div', { class: 'tt' }, h('span', { class: 't' }, t), h('span', { class: 'd' }, 'In development')),
        h('span', { class: 'go' }, 'Soon'))));
    levels.append(h('section', { class: 'level lvl-' + key, id: 'level-' + key },
      h('div', { class: 'level-head' },
        h('span', { class: 'numeral', 'aria-hidden': 'true' }, NUMERALS[key]),
        h('div', {}, h('h2', { class: 'display' }, L.name), h('p', { class: 'desc' }, L.desc),
          h('p', { class: 'count' }, `${live.length} of ${total} topics ready`))),
      list));
  }
  app.append(levels);
  const tPlanes = thumbs.map(([el, fn]) => { const P = new Plane(el, { span: 3 }); P.onDraw = fn; P.draw(); return P; });

  /* hero: a grid cycling through linear maps, with a live readout */
  const P = new Plane(heroCanvas, { span: 3.4, transparent: true });
  const Ms = [[1,0,0,1],[1,1,0,1],[0,-1,1,0],[1.6,.6,.4,1.2],[-1,.5,0,1],[.8,-.9,.9,.8]];
  const hold = 1200, move = 2400, seg = hold + move;
  const matAt = ms => {
    const i = Math.floor(ms / seg) % Ms.length, j = (i + 1) % Ms.length, q = ease(clamp((ms % seg - hold) / move, 0, 1));
    return Ms[i].map((v, k) => lerp(v, Ms[j][k], q));
  };
  const show = ([a, b, c, d]) => {
    [a, b, c, d].forEach((v, i) => { cells[i].textContent = fmt(v); });
    detEl.textContent = fmt(a * d - b * c);
    const e = eig2(a, b, c, d);
    eigEl.textContent = e.real ? [...new Set(e.list.map(x => fmt(x.l)))].join(', ') : `${fmt(e.re)} ± ${e.im.toFixed(2)}i`;
  };
  let M = reduceMotion ? Ms[1] : Ms[0], t0 = null, raf;
  P.onDraw = (ctx, p) => {
    p.cx = p.w > 900 ? -(p.w * .2) / p.scale : 0;
    const pal = p.pal, [a, b, c, d] = M, ap = (x, y) => [a * x + b * y, c * x + d * y], N = 18;
    p.grid(1);
    for (let k = -N; k <= N; k++) {
      p.path([ap(k, -N), ap(k, N)], { stroke: k ? alpha(pal.blue, .7) : pal.axis, width: k ? 1.2 : 2 });
      p.path([ap(-N, k), ap(N, k)], { stroke: k ? alpha(pal.blue, .7) : pal.axis, width: k ? 1.2 : 2 });
    }
    p.path([ap(0,0), ap(1,0), ap(1,1), ap(0,1)], { fill: alpha(pal.yellow, .3), stroke: pal.yellow, width: 2, close: true });
    p.arrow(0, 0, a, c, pal.green); p.arrow(0, 0, b, d, pal.red);
  };
  show(M); P.draw();
  if (!reduceMotion) {
    const loop = now => { if (t0 === null) t0 = now; M = matAt(now - t0); show(M); P.draw(); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
  }
  return () => { cancelAnimationFrame(raf); P.destroy(); tPlanes.forEach(t => t.destroy()); };
}

/* Lesson page. A lesson may use the full format (hook, steps, formal, check, links) or the
   legacy `explain` prose; every part is optional. mount() may return a teardown function
   (legacy) or a scene { destroy, apply(patch, immediate) } that guided steps can drive. */
function renderViz(app, v) {
  document.title = v.title + ' | Continuum';
  const sib = VIZ.filter(x => x.level === v.level), i = sib.indexOf(v), prev = sib[i - 1], next = sib[i + 1];
  const stage = h('div', { class: 'stage', 'data-coords': '', role: 'img', 'aria-label': 'Interactive visualization: ' + v.title },
    ['tl', 'tr', 'bl', 'br'].map(c => h('span', { class: 'tick ' + c })));
  const panel = h('aside', { class: 'panel', 'aria-label': 'Controls' });
  const body = v.formal != null ? h('div', { class: 'prose' }, h('h2', {}, 'The math'), h('div', { html: v.formal }))
                                : h('div', { class: 'prose', html: v.explain || '' });
  const lede = h('p', { class: v.hook ? 'lede hook' : 'lede', html: v.hook || v.blurb });
  const check = v.check && v.check.length ? QuickCheck(v.check) : null;
  const conn = v.links ? Connections(v.links, v.id) : null;
  let scene = {};
  const stepper = v.steps && v.steps.length
    ? Stepper(v.steps, (s, k, first) => { if (s.set && scene.apply) scene.apply(s.set, first); }) : null;
  if (stepper) panel.append(stepper.el);
  const pg = (x, cls, k) => h('a', { class: 'pg ' + cls, href: '#/viz/' + x.id }, h('span', { class: 'k' }, k), h('span', { class: 't' }, x.title));
  app.append(h('article', { class: 'wrap viz lvl-' + v.level },
    h('nav', { class: 'crumbs', 'aria-label': 'Breadcrumb' },
      h('a', { href: '#/' }, 'Continuum'), h('span', { 'aria-hidden': 'true' }, '/'),
      h('a', { class: 'lvl-tag', href: '#/level/' + v.level }, LEVELS[v.level].name)),
    h('header', { class: 'viz-head' }, h('h1', { class: 'display' }, v.title), lede),
    h('div', { class: 'workbench' }, stage, panel),
    body, check, conn,
    h('nav', { class: 'pager', 'aria-label': 'More topics' },
      prev ? pg(prev, 'prev', 'Previous') : null, next ? pg(next, 'next', 'Next') : null)));
  typeset(body); if (v.hook) typeset(lede);
  const ret = v.mount({ stage, controls: Controls(panel) });
  scene = typeof ret === 'function' ? { destroy: ret } : (ret || {});
  if (stepper) stepper.start();
  return () => scene.destroy && scene.destroy();
}

