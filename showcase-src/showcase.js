/* ============================================================
   Shared renderer for all style variants.
   Reads research-data-v4.js and builds the page into #app.
   Styling is entirely the responsibility of the host stylesheet:
   this file emits semantic classes and never sets colours,
   except passing each theme's accent down as `color` so the
   diagrams (which use currentColor) tint themselves.
   ============================================================ */

const LT = 'abcdefghij';
const app = document.getElementById('app');

/* Editable text arrives as either a plain string or {t, s} where s is
   "file:startLine-endLine". T() unwraps the html, D() emits the data-src
   attribute the editor uses to round-trip an edit back into the markdown. */
const T = v => (v && typeof v === 'object' && 't' in v) ? v.t : (v || '');
const D = v => {
  const src = (v && typeof v === 'object') ? v.s : v;
  return (typeof src === 'string' && src.includes(':')) ? ` data-src="${src}"` : '';
};

/* ---------- figures ---------- */
function figHTML(f, n) {
  const media = f.svg ? `<div class="isvg">${f.svg}</div>`
    : `<img src="${f.src}" alt="" data-cap="${(f.cap || '').replace(/"/g, '&quot;')}">`;
  const tag = f.ongoing ? '<span class="tag">ongoing &#183; schematic</span>'
    : (f.drawn ? '<span class="tag">drawn for this page</span>' : '');
  const lbl = (f.drawn || f.ongoing) ? 'Diagram' : 'Fig ' + n;
  const caption = f.cap
    ? `<figcaption><span class="fl">${lbl}</span>${f.cap}</figcaption>` : '';
  return `<figure>${tag}${media}${caption}</figure>`;
}
function figsHTML(figs) {
  if (!figs || !figs.length) return '';
  let out = '', i = 0, n = 1;
  while (i < figs.length) {
    if (figs[i].pair && figs[i + 1] && figs[i + 1].pair) {
      out += `<div class="figpair">${figHTML(figs[i], n++)}${figHTML(figs[i + 1], n++)}</div>`;
      i += 2;
    } else { out += figHTML(figs[i], n++); i++; }
  }
  return out;
}

/* The middle component is agent A's own: it carries the same robot mark the
   closing animation hands over, so the piece and the box read as one thing. */
const ROBOT_MARK = '<span class="compbot" aria-hidden="true">' +
  '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" ' +
  'stroke="currentColor" stroke-width="1.9" stroke-linecap="round">' +
  '<path d="M12 3v2.4"/><circle cx="12" cy="2.2" r="1.2" fill="currentColor" ' +
  'stroke="none"/><rect x="4.2" y="5.6" width="15.6" height="12.4" rx="3.4"/>' +
  '<circle cx="9.2" cy="11.2" r="1.25" fill="currentColor" stroke="none"/>' +
  '<circle cx="14.8" cy="11.2" r="1.25" fill="currentColor" stroke="none"/>' +
  '<path d="M9.4 14.4q2.6 2 5.2 0"/></svg></span>';

/* ---------- page skeleton ---------- */
app.innerHTML = `
<section id="thesis" class="sec-thesis"><div class="sheet">
  <div class="eyebrow">${PROFILE.name} &#183; ${PROFILE.role}</div>
  <h1 class="big"${D(MOTIVATION.titleSrc)}>${MOTIVATION.title}</h1>
  ${MOTIVATION.question ? `<div class="qbox hero-q">
    <span class="lab">The question underneath</span>
    <p${D(MOTIVATION.questionSrc)}>${MOTIVATION.question}</p></div>` : ''}
  <div class="mbody">${MOTIVATION.opening.map(p => `<p${D(p)}>${T(p)}</p>`).join('')}</div>
  <div class="exgrid" data-box="examples">
    ${MOTIVATION.examples.map(e => `
      <div class="excell">
        ${e.img ? `<span class="exfig"><img src="${e.img}" alt="${e.name}"
             data-cap="${e.name}" data-fig="${e.img.split('/').pop()}"></span>` : ''}
        <span class="exn"${D(e.nameSrc)}>${e.name}</span><p${D(e.src)}>${e.text}</p>
        ${e.source ? `<p class="exsrc"${D(e.sourceSrc)}>${e.source}</p>` : ''}
      </div>`).join('')}
  </div>
  <div class="mbody unites"><p${D(MOTIVATION.unitesSrc)}>${MOTIVATION.unites}</p></div>
  <ul class="chlist" data-box="challenges">
    ${MOTIVATION.challenges.map((c, i) => `
      <li class="chitem">
        <span class="chmark" style="background:var(--t${i+1})"></span>
        <div>
          <span class="cht"${D(c.nameSrc)}>${c.name}</span>
          <p${D(c.src)}>${c.text}</p>
        </div>
      </li>`).join('')}
  </ul>
  <div class="methodnote" data-box="method">
    <p${D(METHOD_SRC)}>${METHOD_TEXT}</p>
  </div>
</div></section>

<section id="programme" class="plate sec-programme"><div class="sheet">
  <h2 class="plate-prop"${D(OVERVIEW.headingSrc)}>${OVERVIEW.heading}</h2>
  <p class="plate-sub"${D(OVERVIEW.introSrc)}>${OVERVIEW.intro}</p>
  <div class="roadmap" data-box="roadmap">
    ${OVERVIEW.map.map((m, i) => `
      <div class="rmrow">
        <span class="rmc"${D(m.challengeSrc)}>${m.challenge}</span>
        <span class="rma">&#8594;</span>
        <span class="rmd" style="color:var(--t${i+1})"${D(m.directionSrc)}>${m.direction}</span>
      </div>`).join('')}
  </div>
  <div class="plate-frame" data-box="frame">
    <div class="irows">
      ${THEMES.map((th, ti) => `
        <button class="irow" data-t="${ti}">
          <span class="ifig" style="color:var(--t${ti+1})">${th.intuitionImg
            ? `<img src="${th.intuitionImg}" alt="${th.property}"
                 data-cap="${th.property}" data-fig="${th.intuitionImg.split('/').pop()}">`
            : th.intuition}</span>
          <span class="itxt">
            <span class="inum" style="color:var(--t${ti+1})">${th.label || th.num}</span>
            <span class="iname"${D(th.propertySrc)}>${th.property}</span>
            ${th.title ? `<span class="isub">${th.title}</span>` : ''}
            <span class="icap"${D(th.intuitionCapSrc)}>${th.intuitionCap}</span>
            <span class="igo">read ${th.label || ('Theme ' + th.num)} &#8594;</span>
          </span>
        </button>`).join('')}
    </div>
  </div>
</div></section>

${THEMES.map((th, ti) => `
<section class="plate sec-theme" id="plate-${ti}"><div class="sheet">
  <div class="plate-head"><span class="plate-no" style="color:var(--t${ti+1})">${th.label || ("Theme " + th.num)}</span></div>
  <h2 class="plate-prop"${D(th.propertySrc)}>${th.property}</h2>
  ${th.title ? `<p class="plate-title">${th.title}</p>` : ''}
  <div class="plate-sub">${th.problemHtml || `<p>${th.problem}</p>`}</div>
  <div class="plate-frame" data-box="frame">
    <div class="chain">
      ${th.steps.map((s, si) => `
        <article class="card" id="card-${ti}-${si}" data-t="${ti}" data-s="${si}">
          <button class="chead" aria-expanded="false">
            <span class="cletter" style="color:var(--t${ti+1})">(${LT[si]})</span>
            <span class="cmid">
              <span class="cq"${D(s.qSrc)}>${s.q}${s.kind === 'application'
                ? '<span class="capp">application</span>' : ''}</span>
              ${s.findingBrief ? `<span class="cf"><span class="fl">finding</span><span${D(s.briefSrc)}>${s.findingBrief}</span></span>` : ''}
            </span>
            <span class="cgo">open</span>
          </button>
          <div class="cbody"><div class="cbody-in"></div></div>
        </article>
        ${s.gap ? `<div class="conn"><span class="cl">what remains</span>
          <p${D(s.gapSrc)}>${s.gap}</p><span class="dn">&#8595;</span></div>` : ''}
      `).join('')}
    </div>
    ${th.applications ? `<p class="applics"><span class="lab">Applications</span>${th.applications}</p>` : ''}
  </div>
</div></section>`).join('')}

<section id="future" class="band-future"><div class="sheet">
  <div class="plate-head"><span class="plate-no">What&#8217;s next</span></div>
  <h2 class="fh"${D(FUTURE.headlineSrc)}>${FUTURE.headline}</h2>
  <p class="flead"${D(FUTURE.leadSrc)}>${FUTURE.lead}</p>
  <figure class="ffig">
    ${FUTURE.fig
      ? `<img src="${FUTURE.fig}" alt="" data-cap="Composable coordination"
             data-fig="${FUTURE.fig.split('/').pop()}">`
      : `<div class="isvg">${SVG_FUTURE}</div>`}
    ${FUTURE.figCap ? `<figcaption${D(FUTURE.figCapSrc)}>${FUTURE.figCap}</figcaption>` : ''}
  </figure>
  ${(FUTURE.components && FUTURE.components.length) ? `
  <div class="comps">
    ${FUTURE.components.map((c, i) => `
      <button class="comphead" data-comp="${i}" aria-expanded="false">
        ${i ? '<span class="seam"><i></i></span>' : ''}
        ${i === 1 ? `<span class="compagent">${ROBOT_MARK}Agent A</span>` : ''}
        <span class="compt"${D(c.nameSrc)}>${c.name}</span>
        <span class="compsum"${D(c.summarySrc)}>${c.summary}</span>
        <span class="compgo">more &#8595;</span>
      </button>`).join('')}
  </div>
  <div class="comppanel"><div class="comppanel-in"></div></div>` : ''}
  <div class="fbody">${FUTURE.paras.map(p => `<p${D(p)}>${T(p)}</p>`).join('')}</div>
  <p class="pull"${D(FUTURE.closingSrc)}>${FUTURE.closing}</p>
</div></section>

<section id="refs" class="plate sec-refs"><div class="sheet">
  <div class="plate-head"><span class="plate-no">References</span></div>
  <h2 class="plate-prop">Selected publications</h2>
  <p class="plate-title">most recent first; the numeral marks the theme</p>
  <ol id="reflist"></ol>
</div></section>

<footer><div class="sheet"><div class="fin">
  <span class="fname">${PROFILE.name}</span>
  <a href="${PROFILE.site}" target="_blank">Website</a>
  <a href="${PROFILE.scholar}" target="_blank">Google Scholar</a>
  <a href="${PROFILE.cv}" target="_blank">CV</a>
  <a href="mailto:${PROFILE.email}">${PROFILE.email}</a>
</div></div></footer>

<div id="lb"><figure><img id="lbi" alt=""><figcaption id="lbc"></figcaption></figure></div>
`;

/* ---------- keep anchor landings clear of the sticky nav ---------- */
const navBar = document.getElementById('nav');
function syncScrollOffset() {
  const h = navBar ? navBar.getBoundingClientRect().height : 0;
  document.documentElement.style.setProperty('--scroll-offset', Math.round(h + 14) + 'px');
}
function scrollOffset() {
  return parseFloat(getComputedStyle(document.documentElement)
    .getPropertyValue('--scroll-offset')) || 58;
}
syncScrollOffset();
addEventListener('resize', syncScrollOffset);

/* The closing section's ground is a choice, not a constant: the supplied
   figure has a light background and clashed with the dark band. ?future=
   light|tint|dark switches it so the options can be compared in place. */
document.body.classList.add(
  'future-' + (new URLSearchParams(location.search).get('future') || 'light'));

/* The page is built into #app after load, so by the time a URL like
   ...#future is processed the section does not exist yet and the browser
   gives up. Land it once the content is there. */
if (location.hash.length > 1) {
  const target = document.getElementById(location.hash.slice(1));
  if (target) requestAnimationFrame(() => goToSection(target));
}

/* Section edges are not where the title is: the hero and the closing band
   carry their own top padding, so jumping to the edge left their headline
   90-110px lower than a plate's, and the landing felt different per link.
   Aim at whatever each section leads with instead. */
function sectionTitle(sec) {
  return sec.querySelector('.plate-head,.plate-no,h1.big,.fh,.plate-prop,h2');
}
function goToSection(sec) {
  const anchor = sectionTitle(sec) || sec;
  // the opening section starts the document, and aiming at its heading would
  // push the name-and-role line up behind the nav; it wants the page top
  if (sec === document.querySelector('section')) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const y = anchor.getBoundingClientRect().top + window.scrollY - scrollOffset();
  window.scrollTo({ top: Math.max(0, Math.round(y)), behavior: 'smooth' });
}
document.querySelectorAll('#nav a[href^="#"]').forEach(a => {
  a.addEventListener('click', ev => {
    const sec = document.getElementById(a.getAttribute('href').slice(1));
    if (!sec) return;
    ev.preventDefault();
    history.replaceState(null, '', a.getAttribute('href'));
    goToSection(sec);
  });
});

/* ---------- Plate 0 rows jump to their plate ---------- */
document.querySelectorAll('.irow').forEach(b => b.addEventListener('click', () =>
  goToSection(document.getElementById('plate-' + b.dataset.t))));

/* ---------- card expansion ---------- */
let openKey = null;

function bodyHTML(ti, si) {
  const th = THEMES[ti], s = th.steps[si];
  // A step rewritten in the markdown carries bodyHtml; older steps still use the
  // tension / finding pair. Publications are hidden when the prose already links them.
  const prose = s.bodyHtml
    ? `<div class="sec mdbody">${s.bodyHtml}</div>`
    : `<div class="sec tension"><span class="lab">Why this question</span>
         ${(s.tension || []).map(p => `<p>${p}</p>`).join('')}</div>
       <div class="sec"><span class="lab">${s.kind === 'application'
         ? 'What we do there' : 'What we found, and what it means'}</span>
         ${(s.finding || []).map(p => `<p>${p}</p>`).join('')}</div>`;
  const linkedInProse = !!(s.bodyHtml && s.bodyHtml.includes('<a href'));
  // pubsShow drops papers this theme already links elsewhere in its prose
  const pubs = s.pubsShow || s.pubs || [];
  // Prose runs full width and the figures sit beneath it: the supplied figures are
  // wide banners, which a side-by-side split would shrink while cramping the text.
  return `<div class="xgrid xgrid-solo">
    <div class="xtext">
      ${prose}
      ${s.remains ? `<div class="xremains"><span class="lab">What it left open</span>${s.remains}</div>` : ''}
      ${(!linkedInProse && pubs.length) ? `<div class="xpubs">
        <span class="lab">Selected publications</span><ol>
        ${pubs.map(p => `<li><a href="${p.u}" target="_blank">${p.t}</a>
          <span class="pv"> &#8212; ${p.v}</span></li>`).join('')}
      </ol></div>` : ''}
    </div>
    <div class="xnav">
      <button data-nav="prev">&#8592; previous</button>
      <button data-nav="next">next &#8594;</button>
      <button data-nav="close">close</button>
    </div>
  </div>`;
}
function setH(card, h) {
  const b = card.querySelector('.cbody');
  if (h) { b.style.height = h + 'px'; return; }
  if (b.style.height === 'auto') b.style.height = b.scrollHeight + 'px';
  void b.offsetHeight;
  b.style.height = '0px';
}
function measure(card) { setH(card, card.querySelector('.cbody-in').offsetHeight + 2); }
function revealHead(card) {
  const head = card.querySelector('.chead');
  const top = head.getBoundingClientRect().top;
  if (top < scrollOffset() || top > innerHeight * 0.6) {
    head.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
function closeCard(card, instant) {
  if (!card) return;
  const body = card.querySelector('.cbody');
  if (instant) {
    // The collapse is a 320ms height transition. Anything that measures a
    // scroll target while it is still running is off by exactly the height
    // being removed, which is how prev/next used to land a whole card body
    // above the viewport. Take the height away in one go instead.
    const keep = body.style.transition;
    body.style.transition = 'none';
    setH(card, 0);
    void body.offsetHeight;
    body.style.transition = keep;
  } else {
    setH(card, 0);
  }
  card.classList.remove('on');
  card.style.borderLeftColor = '';
  card.querySelector('.chead').setAttribute('aria-expanded', 'false');
  card.querySelector('.cgo').textContent = 'open';
}
function openCard(ti, si, scroll) {
  const key = ti + '-' + si;
  // collapse instantly when we are about to scroll, so the layout is final
  if (openKey && openKey !== key)
    closeCard(document.getElementById('card-' + openKey), !!scroll);
  const card = document.getElementById('card-' + key);
  card.querySelector('.cbody-in').innerHTML = bodyHTML(ti, si);
  card.classList.add('on');
  card.style.borderLeftColor = 'var(--t' + (ti + 1) + ')';
  card.querySelector('.chead').setAttribute('aria-expanded', 'true');
  card.querySelector('.cgo').textContent = 'close';
  openKey = key;
  measure(card);
  // a stale frame must not re-inflate a card that has since been closed
  requestAnimationFrame(() => { if (openKey === key) measure(card); });

  const th = THEMES[ti];
  card.querySelectorAll('[data-nav]').forEach(btn => {
    const k = btn.dataset.nav;
    if (k === 'prev') btn.disabled = si === 0;
    if (k === 'next') btn.disabled = si === th.steps.length - 1;
    btn.onclick = e => {
      e.stopPropagation();
      if (k === 'close') { closeCard(card); openKey = null; revealHead(card); return; }
      openCard(ti, k === 'prev' ? si - 1 : si + 1, true);
    };
  });
  if (scroll) {
    const head = card.querySelector('.chead');
    // one frame so the opening height is in the layout before we aim at it
    requestAnimationFrame(() => head.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
}
document.querySelectorAll('.chead').forEach(h => h.addEventListener('click', () => {
  const card = h.closest('.card'), ti = +card.dataset.t, si = +card.dataset.s;
  if (openKey === ti + '-' + si) { closeCard(card); openKey = null; revealHead(card); }
  else openCard(ti, si, false);
}));
/* settle on height:auto once open, so a card can never clip its own content */
document.querySelectorAll('.cbody').forEach(b => {
  b.addEventListener('transitionend', ev => {
    if (ev.propertyName !== 'height') return;
    if (b.style.height !== '0px' && b.closest('.card').classList.contains('on')) {
      b.style.height = 'auto';
    }
  });
});
document.addEventListener('load', e => {
  if (e.target.tagName === 'IMG' && openKey) {
    const c = document.getElementById('card-' + openKey);
    if (c && c.querySelector('.cbody').style.height !== 'auto') measure(c);
  }
}, true);

/* ---------- closing-section component boxes ----------
   The three heads interlock in a row; the detail opens in one shared panel
   underneath them. Expanding inside a one-third column gave a ~30-character
   measure, which is not readable prose. */
const compPanel = document.querySelector('.comppanel');
const compPanelIn = compPanel && compPanel.querySelector('.comppanel-in');
let compOpen = null;
function renderComp(i) {
  const c = FUTURE.components[i];
  compPanelIn.innerHTML =
    `<div class="compcols">
       <div class="comptext">${c.paras.map(p => `<p${D(p)}>${T(p)}</p>`).join('')}</div>
       ${c.questions.length ? `<div class="compqs">
         <span class="lab">Open questions</span>
         <ul>${c.questions.map(q => `<li${D(q)}>${T(q)}</li>`).join('')}</ul></div>` : ''}
     </div>`;
}
/* Stacked on a phone, the three boxes are one column but the panel still sat
   after all of them -- so opening the first box unfolded its detail underneath
   the third. Put the panel directly after whichever box was clicked; side by
   side it belongs below the whole row, as before. */
const compsRow = document.querySelector('#future .comps');
function stacked() {
  return compsRow &&
    getComputedStyle(compsRow).gridTemplateColumns.split(' ').length < 2;
}
function placePanel(head) {
  if (!compPanel || !compsRow) return;
  const want = stacked() ? head : compsRow;
  if (want.nextElementSibling !== compPanel) want.after(compPanel);
}
function setCompHeight(open) {
  compPanel.style.height = open ? compPanelIn.offsetHeight + 'px' : '0px';
}
document.querySelectorAll('.comphead').forEach(h => {
  h.addEventListener('click', () => {
    const i = +h.dataset.comp;
    const heads = [...document.querySelectorAll('.comphead')];
    if (compOpen === i) {                       // clicking the open one closes it
      compOpen = null;
      heads.forEach(x => { x.classList.remove('on'); x.setAttribute('aria-expanded', 'false');
        x.querySelector('.compgo').innerHTML = 'more &#8595;'; });
      compPanel.classList.remove('on');
      delete compPanel.dataset.comp;
      setCompHeight(false);
      return;
    }
    compOpen = i;
    heads.forEach((x, k) => {
      x.classList.toggle('on', k === i);
      x.setAttribute('aria-expanded', k === i ? 'true' : 'false');
      x.querySelector('.compgo').innerHTML = k === i ? 'less &#8593;' : 'more &#8595;';
    });
    renderComp(i);
    placePanel(h);
    compPanel.classList.add('on');
    compPanel.dataset.comp = i;          // so the panel can take the box's colour
    compPanel.style.height = 'auto';            // measure, then animate from it
    const target = compPanelIn.offsetHeight;
    compPanel.style.height = target + 'px';
  });
});
addEventListener('resize', () => {
  if (compOpen != null) placePanel(document.querySelectorAll('#future .comphead')[compOpen]);
});
if (compPanel) {
  compPanel.addEventListener('transitionend', ev => {
    if (ev.propertyName === 'height' && compPanel.classList.contains('on')) {
      compPanel.style.height = 'auto';
    }
  });
}

/* ---------- references ---------- */
const seen = new Map();
THEMES.forEach(th => th.steps.forEach(s => (s.pubs || []).forEach(p => {
  if (!seen.has(p.u)) seen.set(p.u, { ...p, nums: new Set([th.num]) });
  else seen.get(p.u).nums.add(th.num);
})));
const yr = v => { const m = String(v).match(/(19|20|26)\d{2}/); return m ? +m[0] : 0; };
document.getElementById('reflist').innerHTML = [...seen.values()]
  .sort((a, b) => yr(b.v) - yr(a.v) || a.t.localeCompare(b.t))
  .map(p => `<li><a href="${p.u}" target="_blank">${p.t}</a>
    <span class="pv"> &#8212; ${p.v}</span>
    <span class="tg">${[...p.nums].join(', ')}</span></li>`).join('');

/* ---------- lightbox ---------- */
const lb = document.getElementById('lb'),
      lbi = document.getElementById('lbi'),
      lbc = document.getElementById('lbc');
document.addEventListener('click', e => {
  const img = e.target.closest('img[data-cap]');
  if (img) { lbi.src = img.src; lbc.textContent = img.dataset.cap || ''; lb.classList.add('on'); }
});
lb.addEventListener('click', () => lb.classList.remove('on'));

/* ---------- nav highlight + keyboard ---------- */
const navLinks = [...document.querySelectorAll('#nav a')];
const navTargets = navLinks.map(a => document.querySelector(a.getAttribute('href')));
function syncNav() {
  const probe = innerHeight * 0.28;
  let best = -1;
  navTargets.forEach((el, i) => { if (el && el.getBoundingClientRect().top <= probe) best = i; });
  navLinks.forEach((a, i) => a.classList.toggle('on', i === best));
}
let lastY = null;
function frame() { if (scrollY !== lastY) { lastY = scrollY; syncNav(); } }
(function tick() { frame(); requestAnimationFrame(tick); })();
addEventListener('scroll', frame, { passive: true });
addEventListener('resize', () => {
  if (openKey) {
    const c = document.getElementById('card-' + openKey);
    if (c && c.querySelector('.cbody').style.height !== 'auto') measure(c);
  }
  syncNav();
});
addEventListener('keydown', e => {
  if (e.key === 'Escape') { lb.classList.remove('on'); return; }
  if (!openKey) return;
  const [ti, si] = openKey.split('-').map(Number), n = THEMES[ti].steps.length;
  if (e.key === 'ArrowRight' && si < n - 1) openCard(ti, si + 1, true);
  if (e.key === 'ArrowLeft' && si > 0) openCard(ti, si - 1, true);
});
syncNav();
