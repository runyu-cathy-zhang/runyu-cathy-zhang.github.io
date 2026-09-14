/* Animated version of the closing figure.
 *
 * Five independently trained agents drift in and lock into one team. The
 * puzzle then stays put while a copy of agent A travels down to become the
 * middle box. Its outward tab lights up -- that is what the agent sends --
 * and the Outgoing interface appears; its inward notch lights up -- what the
 * agent receives -- and the Incoming interface appears. The boxes that arrive
 * are the real ones on the page, so what you watch is what you then click.
 *
 * Inline SVG driven by the Web Animations API: sharp at any size, no library,
 * cancellable and replayable. The static PNG stays in the DOM as the fallback
 * for reduced motion, for narrow screens, and for browsers without WAAPI.
 */
(function () {
  'use strict';

  var C = {                       // sampled from the figure itself
    blue: '#67a0f3', green: '#9cbf50', purple: '#ad7ad1',
    orange: '#fdab33', coral: '#fc8e96', ink: '#1b2a63'
  };
  var HL = { out: '#d97a12', in: '#7c5cc4' };   // match the two interface boxes
  var S = 112;                                  // puzzle piece size
  var VW = 990, VH = 452;                       // canvas
  var GX = (VW - 3 * S) / 2, GY = 10;           // grid origin, centred
  var ZK = 1.36;                                // how much larger the examined A is
  var ZW = S * ZK;
  var ZX = VW / 2 - ZW / 2, ZY = 250;           // A ends centred, above the boxes
  // crop to just below the bottom knobs, so the boxes end up tight under the
  // finished puzzle rather than across a gap
  var CROP = GY + 2 * S + 0.12 * S + 12;
  var SPEED = 1.5;              // whole timeline runs this much faster
  /* The scene only occupies x 279..711 of the 990-wide canvas. A phone crops
     the canvas to that band instead of shrinking the whole thing, which shows
     the same animation about 2.15x larger -- the difference between legible
     and decorative. */
  var MVBX = 265, MVBW = 460, MOBILE = 760;
  function vbW() { return window.innerWidth < MOBILE ? MVBW : VW; }
  function viewBox() {
    return window.innerWidth < MOBILE
      ? MVBX + ' 0 ' + MVBW + ' ' + VH : '0 0 ' + VW + ' ' + VH;
  }
  function padFor(h) { return (h / vbW() * 100).toFixed(2) + '%'; }
  var NS = 'http://www.w3.org/2000/svg';

  /* ---------- puzzle geometry ----------
     Each side runs 38% flat, a semicircular knob over the middle 24%, then 38%
     flat. tab = +1 pushes the knob outward, -1 cuts it inward, 0 is straight.
     Sweep 1 is the outward knob: measured, not reasoned about. This was
     inverted for a long time and the grid still interlocked, because flipping
     both sides of every seam keeps them complementary -- so only the labelled
     callout, where a bump has to mean 'sends', ever revealed it. */
  function side(len, dx, dy, tab) {
    if (!tab) return 'l ' + dx * len + ' ' + dy * len;
    var a = 0.38 * len, k = 0.24 * len, r = 0.12 * len;
    return 'l ' + dx * a + ' ' + dy * a + ' ' +
           'a ' + r + ' ' + r + ' 0 0 ' + (tab > 0 ? 1 : 0) + ' ' +
           dx * k + ' ' + dy * k + ' ' + 'l ' + dx * a + ' ' + dy * a;
  }
  function piecePath(s, e) {          // e = [top, right, bottom, left]
    return 'M 0 0 ' + side(s, 1, 0, e[0]) + side(s, 0, 1, e[1]) +
           side(s, -1, 0, e[2]) + side(s, 0, -1, e[3]) + ' Z';
  }
  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  /* One piece, drawn the way the reference figure draws them: soft shadow,
     flat colour, the embossed jigsaw texture, a top-light gradient, and a
     heavy navy outline with round joins. */
  function face(g, d, fill, plain) {
    el('path', { d: d, fill: fill, stroke: fill, 'stroke-width': 7,
      'stroke-linejoin': 'round', 'paint-order': 'stroke',
      filter: 'url(#canimShadow)' }, g);
    if (!plain) {
      el('path', { d: d, fill: 'url(#canimTex)', stroke: 'none' }, g);
    }
    el('path', { d: d, fill: 'url(#canimSheen)', stroke: 'none' }, g);
    el('path', { d: d, fill: 'none', stroke: C.ink, 'stroke-width': 3.1,
      'stroke-linejoin': 'round' }, g);
  }

  /* The figure's robot: white rounded head with a heavy navy outline, side
     ears, big round eyes, a smile and a mouth plate, on a ball-topped antenna. */
  function robot(g, cx, cy, sc) {
    sc = sc || 1;
    var w = 42 * sc, h = 34 * sc, ink = C.ink, lw = 2.6 * sc;
    var top = cy - h / 2;
    // antenna
    el('line', { x1: cx, y1: top - 9 * sc, x2: cx, y2: top, stroke: ink,
      'stroke-width': lw, 'stroke-linecap': 'round' }, g);
    el('circle', { cx: cx, cy: top - 12 * sc, r: 3.4 * sc, fill: '#fff',
      stroke: ink, 'stroke-width': lw }, g);
    // ears
    [-1, 1].forEach(function (sgn) {
      el('rect', { x: cx + sgn * (w / 2 + 1.4 * sc) - (sgn > 0 ? 0 : 5 * sc),
        y: cy - 5 * sc, width: 5 * sc, height: 12 * sc, rx: 2.4 * sc,
        fill: '#fff', stroke: ink, 'stroke-width': lw }, g);
    });
    // head
    el('rect', { x: cx - w / 2, y: top, width: w, height: h, rx: 9 * sc,
      fill: '#fff', stroke: ink, 'stroke-width': lw }, g);
    // eyes
    el('circle', { cx: cx - 8.5 * sc, cy: cy - 3 * sc, r: 3.3 * sc, fill: ink }, g);
    el('circle', { cx: cx + 8.5 * sc, cy: cy - 3 * sc, r: 3.3 * sc, fill: ink }, g);
    // smile
    el('path', { d: 'M ' + (cx - 7 * sc) + ' ' + (cy + 5 * sc) +
      ' q ' + (7 * sc) + ' ' + (6 * sc) + ' ' + (14 * sc) + ' 0',
      fill: 'none', stroke: ink, 'stroke-width': lw * .92,
      'stroke-linecap': 'round' }, g);
    // mouth plate
    el('rect', { x: cx - 7 * sc, y: top + h - 4.5 * sc, width: 14 * sc,
      height: 6 * sc, rx: 1.8 * sc, fill: '#fff', stroke: ink,
      'stroke-width': lw * .85 }, g);
  }

  /* three figures shoulder to shoulder: the team mark */
  function group(g, cx, cy, ink) {
    var head = function (x, y, r) {
      el('circle', { cx: x, cy: y, r: r, fill: ink }, g);
    };
    var body = function (x, y, w, h) {
      el('path', { d: 'M ' + (x - w / 2) + ' ' + (y + h) +
        ' a ' + (w / 2) + ' ' + h + ' 0 0 1 ' + w + ' 0 Z', fill: ink }, g);
    };
    head(cx - 11, cy - 2, 4.1);  body(cx - 11, cy + 3, 13, 7.5);
    head(cx + 11, cy - 2, 4.1);  body(cx + 11, cy + 3, 13, 7.5);
    head(cx, cy - 5, 5.2);       body(cx, cy + 1.5, 16, 9);
  }

  /* the six grid slots; every shared seam is one tab against one blank */
  var SLOTS = [
    { col: 0, row: 0, e: [0, 1, -1, 0],  c: C.blue,   t: 'A' },
    { col: 1, row: 0, e: [0, -1, 1, -1], c: C.green,  t: 'B' },
    { col: 2, row: 0, e: [0, 0, -1, 1],  c: C.purple, t: 'C' },
    { col: 0, row: 1, e: [1, -1, 0, 0],  c: C.orange, t: 'D' },
    { col: 2, row: 1, e: [1, 0, 0, -1],  c: C.coral,  t: 'E' }
  ];
  var TEAM = { col: 1, row: 1, e: [-1, 1, 0, 1] };
  /* The examined copy of A is drawn with a notch on the left and a tab on the
     right, as in the figure: one side receives, the other sends. */
  var A_EDGES = [0, 1, 0, -1];
  var START = [
    { x: 60,  y: 24,  r: -13 }, { x: 300, y: 6,   r: 10 },
    { x: 690, y: 18,  r: 7 },   { x: 210, y: 210, r: -8 },
    { x: 700, y: 196, r: 14 }
  ];

  function build(host) {
    var svg = el('svg', { viewBox: viewBox(), class: 'canim-svg',
      // 'slice', not 'meet': when the stage crops at the end, meet would
      // rescale the whole scene to fit the shorter box and the puzzle would
      // shrink. slice keeps the width and clips the vacated bottom.
      preserveAspectRatio: 'xMidYMin slice',
      role: 'img', 'aria-label':
        'Five independently trained agents assemble into a coordinated team. ' +
        'One agent is examined: its outward tab is what it sends, its inward ' +
        'notch is what it receives.' });

    /* soft shadow and a top-lit gradient per colour: flat fills read cheap
       next to the reference figure */
    var defs = el('defs', {}, svg);
    var sh = el('filter', { id: 'canimShadow', x: '-35%', y: '-35%',
      width: '175%', height: '185%' }, defs);
    el('feDropShadow', { dx: 1.5, dy: 4.5, stdDeviation: 3.8,
      'flood-color': '#16224a', 'flood-opacity': 0.34 }, sh);

    /* The texture is not reconstructed, it is the figure's own pixels: a
       48x48 patch with zero robot/outline contamination, lifted from the
       image, turned into a colour-neutral light/dark overlay and mirror-tiled
       so the repeat is seamless. 48px covers 0.298 of a piece there, so the
       96px tile is 0.596 of a piece here. */
    var TILE = 0.596 * S;
    var pat = el('pattern', { id: 'canimTex', width: TILE, height: TILE,
      patternUnits: 'userSpaceOnUse' }, defs);
    el('image', { href: 'figs/key_figs/piece-texture.png',
      'xlink:href': 'figs/key_figs/piece-texture.png',
      width: TILE, height: TILE, preserveAspectRatio: 'none' }, pat);

    var sheen = el('linearGradient', { id: 'canimSheen', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': .30 }, sheen);
    el('stop', { offset: .5, 'stop-color': '#fff', 'stop-opacity': .04 }, sheen);
    el('stop', { offset: 1, 'stop-color': '#000', 'stop-opacity': .10 }, sheen);

    var team = el('g', { class: 'canim-team', opacity: '0' }, svg);
    var teamT = 'translate(' + (GX + TEAM.col * S) + ',' + (GY + TEAM.row * S) + ')';
    var teamInner = el('g', { transform: teamT }, team);
    face(teamInner, piecePath(S, TEAM.e), '#ffffff', true);
    var tcx = GX + TEAM.col * S + S / 2, tcy = GY + TEAM.row * S + S / 2;
    group(team, tcx, tcy - 16, C.ink);
    el('text', { x: tcx, y: tcy + 15, 'text-anchor': 'middle',
      class: 'canim-teamtext', fill: C.ink }, team).textContent = 'Coordinated';
    el('text', { x: tcx, y: tcy + 29, 'text-anchor': 'middle',
      class: 'canim-teamtext', fill: C.ink }, team).textContent = 'Team';

    var pieces = SLOTS.map(function (s) {
      var g = el('g', { class: 'canim-piece' }, svg);
      face(g, piecePath(S, s.e), s.c);
      robot(g, S / 2, S / 2 - 5, 0.86);
      el('text', { x: S / 2, y: S / 2 + 34, 'text-anchor': 'middle',
        class: 'canim-letter', fill: C.ink }, g).textContent = s.t;
      return g;
    });

    /* the travelling copy of A, plus the trail showing where it came from */
    var callout = el('g', { class: 'canim-callout', opacity: '0' }, svg);
    var ax = GX + SLOTS[0].col * S, ay = GY + SLOTS[0].row * S;
    var link = el('path', { class: 'canim-link', fill: 'none', stroke: C.ink,
      'stroke-width': 2, 'stroke-dasharray': '7 7', opacity: '0',
      d: 'M ' + (ax + S / 2) + ' ' + (ay + S) + ' C ' + (ax + S / 2) + ' ' +
         (ay + S + 90) + ', ' + (ZX + ZW / 2) + ' ' + (ZY - 90) + ', ' +
         (ZX + ZW / 2) + ' ' + (ZY - 6) }, callout);

    var clone = el('g', { class: 'canim-clone' }, callout);
    face(clone, piecePath(S, A_EDGES), C.blue);
    robot(clone, S / 2, S / 2 - 3, 0.82);
    el('text', { x: S / 2, y: S / 2 + 34, 'text-anchor': 'middle',
      class: 'canim-letter', fill: C.ink }, clone).textContent = 'A';

    /* the two highlights, positioned on A's tab and notch once it has landed */
    var midY = ZY + ZW / 2;
    var tabX = ZX + ZW, notchX = ZX;
    function ring(cx, col) {
      return el('circle', { cx: cx, cy: midY, r: 0.12 * ZW * 1.5,
        fill: 'none', stroke: col, 'stroke-width': 3, opacity: '0',
        class: 'canim-ring' }, callout);
    }
    var tabRing = ring(tabX, HL.out), notchRing = ring(notchX, HL.in);
    var tabLabel = el('text', { x: tabX + 30, y: midY - 24, class: 'canim-hl',
      fill: HL.out, opacity: '0' }, callout);
    tabLabel.textContent = 'what it sends';
    var notchLabel = el('text', { x: notchX - 30, y: midY - 24,
      'text-anchor': 'end', class: 'canim-hl', fill: HL.in, opacity: '0' }, callout);
    notchLabel.textContent = 'what it receives';



    host.appendChild(svg);
    return { svg: svg, pieces: pieces, team: team, callout: callout,
             clone: clone, link: link, from: [ax, ay],
             tabRing: tabRing, notchRing: notchRing,
             tabLabel: tabLabel, notchLabel: notchLabel };
  }

  /* ---------- timeline ---------- */
  function run(ctx, heads, comps, done) {
    var anims = [];
    /* Every delay and duration below is written at 1x and divided here, so the
       timeline can be retimed from one constant without re-tuning each step. */
    function A(node, frames, opts) {
      var o = Object.assign(
        { fill: 'both', easing: 'cubic-bezier(.22,.61,.36,1)' }, opts);
      if (o.duration) o.duration /= SPEED;
      if (o.delay) o.delay /= SPEED;
      var a = node.animate(frames, o);
      anims.push(a);
      return a;
    }
    function reveal(head, at) {
      A(head, [{ opacity: 0, transform: 'translateY(14px)' },
               { opacity: 1, transform: 'translateY(0)' }],
        { duration: 520, delay: at });
    }
    function pulse(node, at) {
      node.style.transformBox = 'fill-box';
      node.style.transformOrigin = 'center';
      A(node, [{ transform: 'scale(.55)', opacity: 0 },
               { transform: 'scale(1)', opacity: .95, offset: .35 },
               { transform: 'scale(1.75)', opacity: 0 }],
        { duration: 900, delay: at, iterations: 2 });
    }

    var T = 0;
    // 1. five agents drift in, scattered
    ctx.pieces.forEach(function (g, i) {
      var s = START[i];
      A(g, [{ transform: 'translate(' + s.x + 'px,' + (s.y + 34) + 'px) rotate(' +
                s.r + 'deg) scale(.9)', opacity: 0 },
             { transform: 'translate(' + s.x + 'px,' + s.y + 'px) rotate(' +
                s.r + 'deg) scale(1)', opacity: 1 }],
        { duration: 600, delay: i * 105 });
    });
    T = 600 + 4 * 105 + 200;

    // 2. they lock into one team
    ctx.pieces.forEach(function (g, i) {
      var s = START[i], sl = SLOTS[i];
      A(g, [{ transform: 'translate(' + s.x + 'px,' + s.y + 'px) rotate(' + s.r + 'deg)' },
             { transform: 'translate(' + (GX + sl.col * S) + 'px,' +
                (GY + sl.row * S) + 'px) rotate(0deg)' }],
        { duration: 860, delay: T + i * 85 });
    });
    T += 860 + 4 * 85;
    A(ctx.team, [{ opacity: 0 }, { opacity: 1 }], { duration: 440, delay: T });
    // a short beat on the finished puzzle -- long enough to register that it
    // is complete, not long enough to feel like waiting
    T += 440 + 260;

    // 3. a copy of A travels down and becomes the middle box
    ctx.callout.style.opacity = 1;
    ctx.clone.style.transformBox = 'fill-box';
    ctx.clone.style.transformOrigin = '0 0';
    A(ctx.clone, [
      { transform: 'translate(' + ctx.from[0] + 'px,' + ctx.from[1] + 'px) scale(1)',
        opacity: 0 },
      { transform: 'translate(' + ZX + 'px,' + ZY + 'px) scale(' + ZK + ')',
        opacity: 1 }
    ], { duration: 950, delay: T });
    var len = ctx.link.getTotalLength ? ctx.link.getTotalLength() : 400;
    ctx.link.style.strokeDasharray = '7 7';
    A(ctx.link, [{ strokeDashoffset: len, opacity: 0 },
                 { strokeDashoffset: 0, opacity: .4 }],
      { duration: 780, delay: T + 120 });
    ctx.pieces.forEach(function (g, i) {
      A(g, [{ opacity: 1 }, { opacity: i === 0 ? 1 : .4 }],
        { duration: 560, delay: T + 240 });
    });
    A(ctx.team, [{ opacity: 1 }, { opacity: .4 }], { duration: 560, delay: T + 240 });
    T += 950 + 160;

    if (comps) comps.classList.remove('canim-pending');
    reveal(heads[1], T);                    // Train for composability
    T += 520 + 420;

    // 4. the outward tab is what the agent sends
    pulse(ctx.tabRing, T);
    ctx.tabLabel.style.transformBox = 'fill-box';
    A(ctx.tabLabel, [{ opacity: 0, transform: 'translateX(-8px)' },
                     { opacity: 1, transform: 'translateX(0)' }],
      { duration: 420, delay: T + 120 });
    T += 900;
    reveal(heads[2], T);                    // Outgoing interface
    T += 520 + 460;

    // 5. the inward notch is what it receives
    pulse(ctx.notchRing, T);
    ctx.notchLabel.style.transformBox = 'fill-box';
    A(ctx.notchLabel, [{ opacity: 0, transform: 'translateX(8px)' },
                       { opacity: 1, transform: 'translateX(0)' }],
      { duration: 420, delay: T + 120 });
    T += 900;
    reveal(heads[0], T);                    // Incoming interface
    T += 520 + 360;

    // 6. the examined agent has done its job: it fades, the stage crops to the
    //    puzzle, and the three boxes rise into the space it leaves.
    A(ctx.callout, [{ opacity: 1 }, { opacity: 0 }],
      { duration: 520, delay: T, fill: 'forwards' });
    A(ctx.stage, [{ paddingBottom: padFor(VH) }, { paddingBottom: padFor(CROP) }],
      { duration: 760, delay: T + 160, fill: 'forwards' });
    T += 760 + 200;

    // 7. the team comes back to full strength; everything stays on screen.
    //    fill 'forwards', not 'both': with 'both' this step's first keyframe
    //    (0.4) was applied backwards from t=0, so the puzzle looked dimmed
    //    from the very first frame.
    ctx.pieces.forEach(function (g, i) {
      if (i === 0) return;
      A(g, [{ opacity: .4 }, { opacity: 1 }],
        { duration: 600, delay: T, fill: 'forwards' });
    });
    A(ctx.team, [{ opacity: .4 }, { opacity: 1 }],
      { duration: 600, delay: T, fill: 'forwards' });
    T += 600;

    setTimeout(done, (T + 150) / SPEED);
    return anims;
  }

  /* ---------- wiring ---------- */
  function init() {
    var fig = document.querySelector('#future .ffig');
    if (!fig) return;
    var img = fig.querySelector('img');
    if (!img || !/composability/.test(img.getAttribute('src') || '')) return;
    if (!document.body.animate) return;
    if (window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var wrap = document.createElement('div');
    wrap.className = 'canim';
    var stage = document.createElement('div');
    stage.className = 'canim-stage';
    stage.style.paddingBottom = padFor(VH);
    wrap.appendChild(stage);
    var ctx = build(stage);
    ctx.stage = stage;

    var replay = document.createElement('button');
    replay.className = 'canim-replay';
    replay.type = 'button';
    replay.textContent = 'replay';
    replay.hidden = true;
    wrap.appendChild(replay);

    img.hidden = true;
    fig.insertBefore(wrap, fig.firstChild);

    var comps = document.querySelector('#future .comps');
    var heads = [].slice.call(document.querySelectorAll('#future .comphead'));
    if (comps && heads.length === 3) comps.classList.add('canim-pending');

    var live = [];
    function reset() {
      live.forEach(function (a) { a.cancel(); });
      live = [];
      ctx.callout.style.opacity = 0;
      ctx.stage.style.paddingBottom = padFor(VH);
      if (comps && heads.length === 3) comps.classList.add('canim-pending');
    }
    function play() {
      reset();
      replay.hidden = true;
      finished = false;
      live = run(ctx, heads, comps, function () {
        replay.hidden = false; finished = true;
      });
    }
    replay.addEventListener('click', play);

    var seen = false;
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !seen) { seen = true; play(); io.disconnect(); }
        });
      }, { threshold: 0.3 });
      io.observe(wrap);
      /* Safety net. The boxes now sit well below the figure, so a reader can
         reach them while the timeline is still in its opening seconds. Dropping
         the class is not enough: each reveal has fill 'both' and holds opacity 0
         through its delay, so the row stayed blank for about five seconds.
         Finishing those animations jumps them to their end state. */
      if (comps) {
        var io2 = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (!e.isIntersecting) return;
            // If the timeline is already running it will reveal them in
            // sequence; jumping in here skipped the animation entirely, since
            // the boxes now sit close enough to intersect at the same moment.
            if (seen) { io2.disconnect(); return; }
            comps.classList.remove('canim-pending');
            heads.forEach(function (h) {
              h.getAnimations().forEach(function (a) { a.finish(); });
            });
            io2.disconnect();
          });
        }, { threshold: 0.2 });
        io2.observe(comps);
      }
    } else {
      play();
      if (comps) comps.classList.remove('canim-pending');
    }
    var finished = false;
    addEventListener('resize', function () {
      ctx.svg.setAttribute('viewBox', viewBox());
      ctx.stage.style.paddingBottom = padFor(finished ? CROP : VH);
    });
    window.__canim = { play: play, ctx: ctx };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
