/* ============================================================
   Visual editor. Loads only with ?edit=1 in the URL.

   Text   click any paragraph -> edit its raw markdown -> saves into the
          .md file and rebuilds, so the markdown stays the source of truth.
   Style  sliders and switches write design-tokens.json and apply live.
   Delete select a box and hide it.
   Bake   fold the current style choices into design-baked.css.

   No browser dialogs are used: this environment blocks prompt()/confirm().
   ============================================================ */
(function () {
  if (!new URLSearchParams(location.search).has('edit')) return;

  let tokens = { vars: {}, figures: {}, hidden: [] };
  let mode = null;              // 'text' | 'figure' | 'box' | 'add' | null

  /* Saving text, moving a figure and inserting one all rebuild the data, so the
     page has to reload. Stash enough to put the user back where they were. */
  const RESUME = 'edResume';
  function rememberBeforeReload(extra) {
    try {
      sessionStorage.setItem(RESUME, JSON.stringify({
        y: window.scrollY, mode, fig: (extra && extra.fig) || null,
        at: Date.now()
      }));
    } catch (e) { /* private mode: just lose the position */ }
  }
  function restoreAfterReload() {
    let st = null;
    try {
      const raw = sessionStorage.getItem(RESUME);
      sessionStorage.removeItem(RESUME);
      if (raw) st = JSON.parse(raw);
    } catch (e) { return; }
    if (!st || Date.now() - st.at > 20000) return;
    if (st.mode) setMode(st.mode);
    const settle = () => {
      window.scrollTo(0, st.y);
      if (st.fig) {
        const img = document.querySelector(`img[data-fig="${st.fig}"]`);
        if (img) { editFigure(img); img.classList.add('edHot'); }
      }
    };
    // the layout only settles once card bodies and images are in place
    requestAnimationFrame(() => { settle(); setTimeout(settle, 260); });
    say('back where you were');
  }
  let picked = null;            // currently selected element
  let saveT = null;

  /* ---------------- token plumbing ---------------- */
  const VARS = [
    { g: 'Figures', k: '--fig-band',      label: 'Figure height',        min: 90,  max: 340, unit: 'px' },
    { g: 'Figures', k: '--fig-band-pair', label: 'Paired figure height', min: 80,  max: 280, unit: 'px' },
    { g: 'Figures', k: '--p0-fig-col',    label: 'Plate 0 figure column', min: 160, max: 520, unit: 'px' },
    { g: 'Figures', k: '--wrap-w',        label: 'Wrapped figure width',  min: 25,  max: 65,  unit: '%'  },
    { g: 'Spacing', k: '--measure',       label: 'Page width',           min: 720, max: 1400, unit: 'px' },
    { g: 'Spacing', k: '--gap-section',   label: 'Gap between sections', min: 20,  max: 140, unit: 'px' },
    { g: 'Spacing', k: '--pad-hero',      label: 'Space above title',    min: 10,  max: 140, unit: 'px' },
    { g: 'Type',    k: '--fs-body',       label: 'Body text size',       min: 14,  max: 21,  unit: 'px' },
    { g: 'Type',    k: '--fs-h1-max',     label: 'Title size',           min: 28,  max: 68,  unit: 'px' },
    { g: 'Type',    k: '--fs-h2-max',     label: 'Heading size',         min: 20,  max: 48,  unit: 'px' },
    { g: 'Boxes',   k: '--r-sm',          label: 'Corner radius',        min: 0,   max: 14,  unit: 'px' },
  ];
  const SWITCHES = [
    { g: 'Boxes', k: '--frame-border', label: 'Plate outline',
      on: '1px solid var(--rule)', off: '0' },
    { g: 'Boxes', k: '--card-border', label: 'Card outlines',
      on: '1px solid var(--rule2)', off: '0' },
    { g: 'Boxes', k: '--panel', label: 'Plate background',
      on: '#fdfcf8', off: 'transparent' },
  ];
  const SWATCHES = [
    { k: '--t1', label: 'Theme 1' }, { k: '--t2', label: 'Theme 2' },
    { k: '--t3', label: 'Theme 3' }, { k: '--accent', label: 'Accent' },
    { k: '--paper', label: 'Paper' }, { k: '--ink', label: 'Ink' },
  ];

  const root = document.documentElement;
  const cur = k => (tokens.vars[k] || getComputedStyle(root).getPropertyValue(k).trim());
  const num = k => parseFloat(cur(k)) || 0;

  function setVar(k, v) {
    tokens.vars[k] = v;
    root.style.setProperty(k, v);
    queueSave();
  }
  function applyTokens() {
    Object.entries(tokens.vars || {}).forEach(([k, v]) => root.style.setProperty(k, v));
    let css = '';
    Object.entries(tokens.figures || {}).forEach(([fig, st]) => {
      if (st.wrap === 'left' || st.wrap === 'right') {
        css += `.mdbody figure.pfig[data-fig="${fig}"]{float:${st.wrap};`
             + `width:${st.wrapWidth || 44}%;margin:4px 0 12px;`
             + `margin-${st.wrap === 'left' ? 'right' : 'left'}:26px;}\n`
             + `.mdbody figure.pfig[data-fig="${fig}"] img{width:100% !important;`
             + `height:auto !important;max-height:none !important;}\n`;
      }
      if (st.align) {
        css += `figure.pfig[data-fig="${fig}"]{text-align:${st.align};}\n`
             + `img[data-fig="${fig}"]{margin-left:${st.align === 'left' ? '0' : 'auto'};`
             + `margin-right:${st.align === 'right' ? '0' : 'auto'};}\n`;
      }
      const d = [];
      if (st.sizeBy === 'width' && st.widthPct) {
        d.push(`width:${st.widthPct}%`); d.push('height:auto'); d.push('max-height:none');
      } else if (st.height) d.push(`height:${st.height}px`);
      if (st.ratio && st.ratio !== 'natural') { d.push(`aspect-ratio:${st.ratio}`); d.push('width:auto'); }
      if (st.fit) d.push(`object-fit:${st.fit}`);
      if (st.radius != null) d.push(`border-radius:${st.radius}px`);
      if (st.border === 'off') d.push('border:0');
      if (st.border === 'on') d.push('border:1px solid var(--rule2)');
      if (st.pad != null) d.push(`padding:${st.pad}px`);
      if (d.length) {
        // a wrapped figure is sized by width, so its height rule is dropped
        const keep = (st.wrap === 'left' || st.wrap === 'right')
          ? d.filter(x => !/^height:/.test(x) && !/^width:/.test(x)) : d;
        if (keep.length) css += `img[data-fig="${fig}"]{${keep.join(' !important;')} !important;}\n`;
      }
    });
    (tokens.hidden || []).forEach(sel => { css += `${sel}{display:none !important;}\n`; });
    let tag = document.getElementById('edLive');
    if (!tag) { tag = document.createElement('style'); tag.id = 'edLive'; document.head.appendChild(tag); }
    tag.textContent = css;
  }
  // Nothing may be written before the existing settings have been read. If the
  // read failed, `tokens` is empty, and saving it would wipe every figure.
  let loaded = false;
  function queueSave(replace) {
    if (!loaded) { say('not saved — reload once the server is up'); return; }
    clearTimeout(saveT);
    saveT = setTimeout(async () => {
      try {
        const body = replace ? Object.assign({ replace: true }, tokens) : tokens;
        const r = await fetch('/__tokens', { method: 'POST',
          headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        say(r.ok ? 'saved' : 'save failed');
      } catch (e) { say('offline — run edit-server.py'); }
    }, 300);
  }

  /* ---------------- chrome ---------------- */
  const css = `
  #edDock{position:fixed;top:0;right:0;bottom:0;width:312px;z-index:9500;overflow:auto;
    background:#15130f;color:#eee8dc;font:13px/1.45 ui-sans-serif,-apple-system,"Segoe UI",sans-serif;
    box-shadow:-2px 0 12px rgba(0,0,0,.22);}
  #edDock h3{margin:0;padding:12px 14px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;
    background:#0d0b09;color:#a49b88;position:sticky;top:0;z-index:2;}
  #edDock .grp{border-bottom:1px solid #2b2721;padding:11px 14px 14px;}
  #edDock .grp h4{margin:0 0 9px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8a8272;}
  #edDock label{display:block;margin-bottom:9px;}
  #edDock .row{display:flex;align-items:center;gap:8px;}
  #edDock .row span{flex:1;font-size:12px;}
  #edDock .row b{font:600 11px ui-monospace,Menlo,monospace;color:#d9cfae;min-width:44px;text-align:right;}
  #edDock input[type=range]{width:100%;accent-color:#c2410c;}
  #edDock input[type=color]{width:34px;height:22px;border:1px solid #4a463d;background:none;padding:0;}
  #edDock button{font:inherit;font-size:12px;padding:6px 10px;border-radius:3px;cursor:pointer;
    border:1px solid #4a463d;background:#221f19;color:#eee8dc;}
  #edDock button:hover{border-color:#a49b88;}
  #edDock button.on{background:#c2410c;border-color:#c2410c;color:#fff;font-weight:600;}
  #edDock .modes{display:flex;gap:6px;padding:11px 14px;}
  #edDock .modes button{flex:1;}
  #edDock .hint{padding:0 14px 12px;color:#8a8272;font-size:11.5px;}
  #edDock .act{display:flex;gap:6px;padding:12px 14px 20px;flex-wrap:wrap;}
  #edStatus{padding:0 14px 12px;color:#c2410c;font-size:11.5px;min-height:14px;}
  body.edOn{margin-right:312px;}
  body.edPick.edText [data-src]{outline:1px dashed rgba(194,65,12,.4);outline-offset:2px;}
  body.edPick.edFigure img[data-fig]{outline:2px dashed rgba(194,65,12,.65);outline-offset:3px;}
  body.edPick.edBox [data-box]{outline:1px dashed rgba(194,65,12,.5);outline-offset:2px;}
  body.edPick.edAdd [data-src]{outline:1px dashed rgba(30,120,60,.55);outline-offset:2px;}
  body.edFigure .cbody,body.edText .cbody,body.edAdd .cbody{height:auto !important;overflow:visible !important;}
  .edHot{outline:2px solid #c2410c !important;outline-offset:2px;}
  body.edFigure .cbody,body.edText .cbody{height:auto !important;overflow:visible !important;}
  #edPop{position:absolute;z-index:9600;width:min(620px,92vw);background:#fffdf8;color:#15130f;
    border:1px solid #15130f;box-shadow:0 8px 28px rgba(0,0,0,.25);}
  #edPop .hd{padding:8px 11px;background:#15130f;color:#d9cfae;
    font:600 11px ui-monospace,Menlo,monospace;display:flex;justify-content:space-between;}
  #edPop textarea{width:100%;min-height:170px;border:0;padding:11px;resize:vertical;
    font:13px/1.6 ui-monospace,Menlo,Consolas,monospace;outline:none;}
  #edPop .ft{padding:9px 11px;display:flex;gap:8px;align-items:center;border-top:1px solid #e2dccd;}
  #edPop .ft button{font:inherit;font-size:12px;padding:6px 12px;cursor:pointer;
    border:1px solid #cec7b6;background:#fff;border-radius:3px;}
  #edPop .ft button.pri{background:#c2410c;border-color:#c2410c;color:#fff;font-weight:600;}
  #edPop .ft .sp{margin-left:auto;color:#867f71;font-size:11px;}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const dock = document.createElement('aside');
  dock.id = 'edDock';
  document.body.appendChild(dock);
  document.body.classList.add('edOn');

  const say = t => { const e = document.getElementById('edStatus'); if (e) e.textContent = t || ''; };

  function slider(v) {
    const val = num(v.k);
    return `<label><span class="row"><span>${v.label}</span><b id="lb-${v.k}">${val}${v.unit}</b></span>
      <input type="range" data-var="${v.k}" data-unit="${v.unit}"
             min="${v.min}" max="${v.max}" value="${val}"></label>`;
  }
  function drawDock() {
    const groups = ['Figures', 'Spacing', 'Type', 'Boxes'];
    dock.innerHTML = `
      <h3>Editor</h3>
      <div class="modes">
        <button data-mode="text">Text</button>
        <button data-mode="figure">Figures</button>
        <button data-mode="box">Delete</button>
        <button data-mode="add">Add figure</button>
      </div>
      <div class="hint" id="edHint">Pick a mode, then click something on the page.</div>
      <div id="edStatus"></div>
      ${groups.map(g => `
        <div class="grp"><h4>${g}</h4>
          ${VARS.filter(v => v.g === g).map(slider).join('')}
          ${SWITCHES.filter(v => v.g === g).map(sw => `
            <div class="row" style="margin-bottom:8px">
              <span>${sw.label}</span>
              <button data-sw="${sw.k}" data-on="${sw.on}" data-off="${sw.off}"
                class="${cur(sw.k) === sw.off ? '' : 'on'}">${cur(sw.k) === sw.off ? 'off' : 'on'}</button>
            </div>`).join('')}
        </div>`).join('')}
      <div class="grp"><h4>Colour</h4>
        ${SWATCHES.map(c => `<div class="row" style="margin-bottom:7px">
           <span>${c.label}</span>
           <input type="color" data-col="${c.k}" value="${hex(cur(c.k))}"></div>`).join('')}
      </div>
      <div class="act">
        <button id="edBake" class="on">Bake into CSS</button>
        <button id="edReset">Reset all</button>
        <button id="edExit">Exit</button>
      </div>`;
    wire();
  }
  function hex(v) {
    v = (v || '').trim();
    if (/^#[0-9a-f]{6}$/i.test(v)) return v;
    const d = document.createElement('div'); d.style.color = v; document.body.appendChild(d);
    const m = getComputedStyle(d).color.match(/\d+/g); d.remove();
    return m ? '#' + m.slice(0, 3).map(n => (+n).toString(16).padStart(2, '0')).join('') : '#000000';
  }

  function wire() {
    dock.querySelectorAll('input[data-var]').forEach(i => i.oninput = () => {
      const k = i.dataset.var, v = i.value + i.dataset.unit;
      setVar(k, v);
      const lb = document.getElementById('lb-' + k); if (lb) lb.textContent = v;
    });
    dock.querySelectorAll('button[data-sw]').forEach(b => b.onclick = () => {
      const isOn = b.classList.toggle('on');
      b.textContent = isOn ? 'on' : 'off';
      setVar(b.dataset.sw, isOn ? b.dataset.on : b.dataset.off);
    });
    dock.querySelectorAll('input[data-col]').forEach(i => i.oninput = () => setVar(i.dataset.col, i.value));
    dock.querySelectorAll('button[data-mode]').forEach(b => b.onclick = () => setMode(b.dataset.mode));
    document.getElementById('edBake').onclick = async () => {
      try { const r = await fetch('/__bake', { method: 'POST' });
        const d = await r.json(); say(d.ok ? 'written to ' + d.file : 'bake failed'); }
      catch (e) { say('offline'); }
    };
    /* This is the only button that can erase every setting for every figure,
       and it sits between "Bake into CSS" and "Exit". One stray click used to
       be enough, so it now needs two, and disarms itself after a few seconds. */
    let resetArmed = false, resetTimer = null;
    document.getElementById('edReset').onclick = ev => {
      const b = ev.currentTarget;
      const disarm = () => { resetArmed = false; clearTimeout(resetTimer);
        b.textContent = 'Reset all'; b.style.color = ''; b.style.fontWeight = ''; };
      if (!resetArmed) {
        resetArmed = true;
        b.textContent = 'erase every setting?';
        b.style.color = '#b03a2e'; b.style.fontWeight = '700';
        resetTimer = setTimeout(disarm, 5000);
        return say('click again within 5s to erase all figure settings');
      }
      disarm();
      Object.keys(tokens.vars).forEach(k => root.style.removeProperty(k));
      tokens = { vars: {}, figures: {}, hidden: [] };
      applyTokens(); queueSave(true); drawDock();
      say('reset — the previous settings are in design-tokens.json.bak');
    };
    document.getElementById('edExit').onclick = () => {
      location.search = location.search.replace(/[?&]edit=1/, '') || '';
    };
  }

  function setMode(m) {
    mode = (mode === m) ? null : m;
    dock.querySelectorAll('button[data-mode]').forEach(b =>
      b.classList.toggle('on', b.dataset.mode === mode));
    document.body.classList.toggle('edPick', !!mode);
    document.body.classList.toggle('edText', mode === 'text');
    document.body.classList.toggle('edFigure', mode === 'figure');
    document.body.classList.toggle('edBox', mode === 'box');
    document.body.classList.toggle('edAdd', mode === 'add');
    document.getElementById('edHint').textContent = !mode
      ? 'Pick a mode, then click something on the page.'
      : mode === 'text' ? 'Every card is expanded — click any paragraph or heading to edit its markdown.'
      : mode === 'figure' ? 'Every figure is outlined — click one to set its size, shape, position, wrap and border.'
      : 'Click a box to hide it. Hidden boxes are listed below.';
    if (mode === 'box') listHidden();
    if (mode === 'add') showAdder(); else hideAdder();
    if (mode === 'text' || mode === 'figure' || mode === 'add') openAllCards();
    else collapseAll();
  }

  /* ---------------- text editing ---------------- */
  const pop = document.createElement('div');
  pop.id = 'edPop'; pop.style.display = 'none';
  pop.innerHTML = `<div class="hd"><span id="edPopSrc"></span><span>markdown</span></div>
    <textarea id="edPopTxt" spellcheck="false"></textarea>
    <div class="ft"><button class="pri" id="edPopSave">Save</button>
      <button id="edPopCancel">Cancel</button>
      <span class="sp">saving rewrites the .md file, then rebuilds</span></div>`;
  document.body.appendChild(pop);

  async function editText(el) {
    const src = el.dataset.src;
    if (!src) return;
    let text = '';
    try {
      const r = await fetch('/__md?src=' + encodeURIComponent(src));
      const d = await r.json();
      if (d.error) return say(d.error);
      text = d.text;
    } catch (e) { return say('offline — run edit-server.py'); }
    const r = el.getBoundingClientRect();
    pop.style.display = 'block';
    pop.style.left = Math.max(12, Math.min(r.left + scrollX, innerWidth - 640)) + 'px';
    pop.style.top = (r.bottom + scrollY + 8) + 'px';
    document.getElementById('edPopSrc').textContent = src;
    const ta = document.getElementById('edPopTxt');
    ta.value = text; ta.focus();
    document.getElementById('edPopSave').onclick = async () => {
      say('saving…');
      try {
        const res = await fetch('/__md', { method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ src, text: ta.value }) });
        const d = await res.json();
        if (!res.ok || d.error) return say(d.error || 'save failed');
        pop.style.display = 'none';
        say('saved — reloading');
        rememberBeforeReload();
        setTimeout(() => location.reload(), 250);
      } catch (e) { say('offline'); }
    };
    document.getElementById('edPopCancel').onclick = () => { pop.style.display = 'none'; };
  }

  /* ---------------- figure editing ---------------- */
  const RATIOS = [['natural','natural'],['1/1','square'],['4/3','4:3'],
                  ['16/9','16:9'],['3/1','banner']];

  function editFigure(img) {
    const id = img.dataset.fig;
    const now = tokens.figures[id] || {};
    const h = now.height || Math.round(img.getBoundingClientRect().height);
    const r = img.getBoundingClientRect();
    pop.style.display = 'block';
    pop.style.left = Math.max(12, Math.min(r.left + scrollX, innerWidth - 660)) + 'px';
    pop.style.top = (r.bottom + scrollY + 8) + 'px';
    document.getElementById('edPopSrc').textContent = id;
    pop.querySelector('.hd span:last-child').textContent = 'figure';
    pop.querySelector('textarea').style.display = 'none';
    let extra = pop.querySelector('#edFigCtl');
    if (!extra) {
      extra = document.createElement('div');
      extra.id = 'edFigCtl';
      extra.style.cssText = 'padding:12px;display:grid;gap:11px';
      pop.insertBefore(extra, pop.querySelector('.ft'));
    }
    extra.style.display = 'grid';
    const ratio = now.ratio || 'natural';
    const fit = now.fit || 'contain';
    const isWrapped = (now.wrap === 'left' || now.wrap === 'right');
    const wpc = now.wrapWidth || 44;
    extra.innerHTML = `
      <div style="font-size:12px;display:${isWrapped ? 'none' : 'grid'};gap:5px">
        <span>Size by</span>
        <div id="edFigBy" style="display:flex;gap:5px">
          <button data-by="height" class="${(now.sizeBy||'height')==='height'?'sel':''}">height</button>
          <button data-by="width"  class="${now.sizeBy==='width'?'sel':''}">width</button>
        </div>
      </div>
      <label style="display:${isWrapped || now.sizeBy==='width' ? 'none' : 'grid'};gap:4px">
        <span style="font-size:12px">Height
          <b id="edFigH" style="font:600 11px ui-monospace">${h}px</b></span>
        <input id="edFigR" type="range" min="60" max="440" value="${h}" style="width:100%">
      </label>
      <label style="display:${!isWrapped && now.sizeBy==='width' ? 'grid' : 'none'};gap:4px">
        <span style="font-size:12px">Width
          <b id="edFigWp" style="font:600 11px ui-monospace">${now.widthPct||60}%</b></span>
        <input id="edFigWpct" type="range" min="15" max="100" value="${now.widthPct||60}" style="width:100%">
      </label>
      <label style="display:grid;gap:4px;${isWrapped ? '' : 'display:none'}">
        <span style="font-size:12px">Width of wrapped figure
          <b id="edFigWpc" style="font:600 11px ui-monospace">${wpc}%</b></span>
        <input id="edFigW" type="range" min="20" max="70" value="${wpc}" style="width:100%">
      </label>
      <div style="font-size:12px;display:grid;gap:5px">
        <span>Where it sits in the text</span>
        <div style="display:flex;gap:5px;align-items:center">
          <button id="edFigUp">move up</button>
          <button id="edFigDn">move down</button>
          <span id="edFigPos" style="color:#867f71;font:11px ui-monospace"></span>
        </div>
      </div>
      <div style="font-size:12px;display:grid;gap:5px">
        <span>Shape</span>
        <div id="edFigShape" style="display:flex;gap:5px;flex-wrap:wrap">
          ${RATIOS.map(([v, l]) => `<button data-ratio="${v}"
            class="${ratio === v ? 'sel' : ''}">${l}</button>`).join('')}
        </div>
      </div>
      <div style="font-size:12px;display:grid;gap:5px">
        <span>Fill</span>
        <div id="edFigFit" style="display:flex;gap:5px">
          <button data-fit="contain" class="${fit === 'contain' ? 'sel' : ''}">fit inside</button>
          <button data-fit="cover" class="${fit === 'cover' ? 'sel' : ''}">crop to fill</button>
        </div>
      </div>
      <div style="font-size:12px;display:grid;gap:5px">
        <span>Position</span>
        <div id="edFigAlign" style="display:flex;gap:5px">
          ${[['left','left'],['center','centre'],['right','right']].map(([v,l]) =>
            `<button data-align="${v}" class="${(now.align||'center')===v?'sel':''}">${l}</button>`).join('')}
        </div>
      </div>
      <div style="font-size:12px;display:grid;gap:5px">
        <span>Text wrap</span>
        <div id="edFigWrap" style="display:flex;gap:5px">
          ${[['none','none'],['left','text on right'],['right','text on left']].map(([v,l]) =>
            `<button data-wrap="${v}" class="${(now.wrap||'none')===v?'sel':''}">${l}</button>`).join('')}
        </div>
      </div>
      <div style="display:flex;gap:14px;align-items:center;font-size:12px;flex-wrap:wrap">
        <span>Border <button id="edFigB">${now.border === 'off' ? 'off' : 'on'}</button></span>
        <span>Corners <input id="edFigRad" type="number" min="0" max="40"
              value="${now.radius != null ? now.radius : 0}" style="width:52px"></span>
        <span>Padding <input id="edFigP" type="number" min="0" max="28"
              value="${now.pad != null ? now.pad : 8}" style="width:52px"></span>
      </div>`;
    extra.querySelectorAll('button').forEach(b => {
      b.style.cssText = 'padding:4px 9px;cursor:pointer;border:1px solid #cec7b6;'
        + 'background:' + (b.classList.contains('sel') ? '#15130f' : '#fff') + ';'
        + 'color:' + (b.classList.contains('sel') ? '#fff' : '#15130f') + ';border-radius:3px';
    });
    let touchedHeight = now.height != null;
    const commit = () => {
      tokens.figures[id] = {
        height: touchedHeight ? +extra.querySelector('#edFigR').value : undefined,
        ratio: extra.querySelector('#edFigShape .sel')?.dataset.ratio || 'natural',
        fit: extra.querySelector('#edFigFit .sel')?.dataset.fit || 'contain',
        radius: +extra.querySelector('#edFigRad').value,
        align: extra.querySelector('#edFigAlign .sel')?.dataset.align || 'center',
        wrap: extra.querySelector('#edFigWrap .sel')?.dataset.wrap || 'none',
        wrapWidth: +extra.querySelector('#edFigW').value,
        sizeBy: extra.querySelector('#edFigBy .sel')?.dataset.by || 'height',
        widthPct: +extra.querySelector('#edFigWpct').value,
        border: extra.querySelector('#edFigB').textContent.trim(),
        pad: +extra.querySelector('#edFigP').value
      };
      Object.keys(tokens.figures[id]).forEach(k => {
        if (tokens.figures[id][k] === undefined) delete tokens.figures[id][k];
      });
      applyTokens(); queueSave();
    };
    const pickIn = (wrap, el) => {
      wrap.querySelectorAll('button').forEach(b => {
        const on = b === el;
        b.classList.toggle('sel', on);
        b.style.background = on ? '#15130f' : '#fff';
        b.style.color = on ? '#fff' : '#15130f';
      });
    };
    extra.querySelector('#edFigR').oninput = e => {
      touchedHeight = true;
      extra.querySelector('#edFigH').textContent = e.target.value + 'px'; commit();
    };
    extra.querySelectorAll('#edFigShape button').forEach(b => b.onclick = () => {
      pickIn(extra.querySelector('#edFigShape'), b); commit();
    });
    extra.querySelectorAll('#edFigFit button').forEach(b => b.onclick = () => {
      pickIn(extra.querySelector('#edFigFit'), b); commit();
    });
    extra.querySelectorAll('#edFigAlign button').forEach(b => b.onclick = () => {
      pickIn(extra.querySelector('#edFigAlign'), b); commit();
    });
    extra.querySelectorAll('#edFigWrap button').forEach(b => b.onclick = () => {
      pickIn(extra.querySelector('#edFigWrap'), b); commit();
      editFigure(img);            // redraw so height/width swap correctly
    });
    extra.querySelector('#edFigB').onclick = e => {
      e.target.textContent = e.target.textContent.trim() === 'on' ? 'off' : 'on'; commit();
    };
    extra.querySelectorAll('#edFigBy button').forEach(b => b.onclick = () => {
      pickIn(extra.querySelector('#edFigBy'), b); commit(); editFigure(img);
    });
    extra.querySelector('#edFigWpct').oninput = e => {
      extra.querySelector('#edFigWp').textContent = e.target.value + '%'; commit();
    };
    extra.querySelector('#edFigW').oninput = e => {
      extra.querySelector('#edFigWpc').textContent = e.target.value + '%'; commit();
    };
    // moving a figure rewrites its markdown line, so it needs the source span
    const figSrc = img.closest('[data-src]')?.dataset.src
                || img.closest('figure')?.dataset.src;
    const posLabel = extra.querySelector('#edFigPos');
    posLabel.textContent = figSrc || 'not a markdown figure';
    ['Up', 'Dn'].forEach(which => {
      const btn = extra.querySelector('#edFig' + which);
      if (!figSrc) { btn.disabled = true; btn.style.opacity = .4; return; }
      btn.onclick = async () => {
        say('moving…');
        try {
          const r = await fetch('/__move', { method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ src: figSrc, dir: which === 'Up' ? 'up' : 'down' }) });
          const dd = await r.json();
          if (!r.ok || dd.error) return say(dd.error || 'move failed');
          say('moved — reloading');
          rememberBeforeReload({ fig: id });
          setTimeout(() => location.reload(), 250);
        } catch (e) { say('offline'); }
      };
    });
    extra.querySelector('#edFigRad').oninput = commit;
    extra.querySelector('#edFigP').oninput = commit;
    document.getElementById('edPopSave').onclick = () => { pop.style.display = 'none'; };
    document.getElementById('edPopCancel').onclick = () => {
      delete tokens.figures[id]; applyTokens(); queueSave(); pop.style.display = 'none';
    };
    pop.querySelector('.ft .sp').textContent = 'Cancel clears this figure\u2019s overrides';
  }

  /* ---------------- hide boxes ---------------- */
  function selectorFor(el) {
    if (el.dataset.box) {
      const sec = el.closest('section');
      return (sec && sec.id ? '#' + sec.id + ' ' : '') + '[data-box="' + el.dataset.box + '"]';
    }
    if (el.id) return '#' + el.id;
    const cls = [...el.classList].filter(c => !/^(on|edHot)$/.test(c));
    return cls.length ? el.tagName.toLowerCase() + '.' + cls.join('.') : null;
  }
  /* Refuse to hide anything that would take most of the page with it. */
  const TOO_BIG = ['BODY', 'HTML', 'MAIN'];
  function unsafeToHide(el) {
    if (TOO_BIG.includes(el.tagName)) return 'that would hide the whole page';
    if (el.id === 'app' || el.classList.contains('sheet')) return 'that is a page container';
    if (el.contains(document.getElementById('edDock'))) return 'that contains the editor';
    const area = el.getBoundingClientRect().height * el.getBoundingClientRect().width;
    const page = document.documentElement.scrollHeight * innerWidth;
    if (page && area / page > 0.5) return 'that covers more than half the page';
    return null;
  }
  function hideBox(el) {
    const bad = unsafeToHide(el);
    if (bad) return say('not hidden — ' + bad);
    const sel = selectorFor(el);
    if (!sel) return say('cannot target that element');
    if (!tokens.hidden.includes(sel)) tokens.hidden.push(sel);
    applyTokens(); queueSave(); listHidden(); say('hidden: ' + sel);
  }
  function listHidden() {
    let box = document.getElementById('edHidden');
    if (!box) {
      box = document.createElement('div');
      box.className = 'grp'; box.id = 'edHidden';
      dock.insertBefore(box, dock.querySelector('.grp'));
    }
    box.innerHTML = '<h4>Hidden</h4>' + (tokens.hidden.length
      ? tokens.hidden.map((s, i) => `<div class="row" style="margin-bottom:6px">
          <span style="font:11px ui-monospace;overflow:hidden;text-overflow:ellipsis">${s}</span>
          <button data-unhide="${i}">restore</button></div>`).join('')
      : '<div style="color:#8a8272;font-size:11.5px">nothing hidden</div>');
    box.querySelectorAll('[data-unhide]').forEach(b => b.onclick = () => {
      tokens.hidden.splice(+b.dataset.unhide, 1);
      applyTokens(); queueSave(); listHidden();
    });
  }

  function openAllCards() {
    /* Cards render their body only when opened, and only one may be open at a
       time, so figures inside the others are absent from the DOM. For figure
       mode we populate every body ourselves and let CSS hold them open. This
       touches presentation only; nothing is saved. */
    if (typeof bodyHTML !== 'function' || typeof THEMES === 'undefined') {
      return say('cannot reach the renderer — open a card by hand');
    }
    let n = 0;
    document.querySelectorAll('.card').forEach(c => {
      const inner = c.querySelector('.cbody-in');
      if (inner && !inner.innerHTML.trim()) {
        inner.innerHTML = bodyHTML(+c.dataset.t, +c.dataset.s);
        n++;
      }
    });
    const c = revealComponents();
    if (n || c) {
      say('revealed ' + (n ? n + ' card(s)' : '')
          + (n && c ? ' and ' : '') + (c ? 'the closing section' : '')
          + ' — exit this mode to collapse');
    }
  }
  /* The closing section keeps one shared detail panel, so only the component
     last clicked is in the DOM. While a mode is active, stack all three so
     every paragraph and question is reachable. Presentation only. */
  function revealComponents() {
    const panel = document.querySelector('.comppanel');
    const inner = panel && panel.querySelector('.comppanel-in');
    if (!inner || typeof FUTURE === 'undefined' || !FUTURE.components) return 0;
    if (inner.dataset.edAll) return 0;
    const t = v => (v && typeof v === 'object' && 't' in v) ? v.t : (v || '');
    const d = v => {
      const src = (v && typeof v === 'object') ? v.s : v;
      return (typeof src === 'string' && src.includes(':'))
        ? ' data-src="' + src + '"' : '';
    };
    inner.dataset.edAll = '1';
    inner.innerHTML = FUTURE.components.map(c =>
      '<div class="compcols edcomp">'
      + '<span class="lab edcomplab">' + c.name + '</span>'
      + '<div class="comptext">'
      + c.paras.map(x => '<p' + d(x) + '>' + t(x) + '</p>').join('')
      + '</div>'
      + (c.questions.length
          ? '<div class="compqs"><span class="lab">Open questions</span><ul>'
            + c.questions.map(q => '<li' + d(q) + '>' + t(q) + '</li>').join('')
            + '</ul></div>'
          : '')
      + '</div>').join('');
    panel.classList.add('on');
    panel.style.height = 'auto';
    return 1;
  }
  function hideComponents() {
    const panel = document.querySelector('.comppanel');
    const inner = panel && panel.querySelector('.comppanel-in');
    if (!inner || !inner.dataset.edAll) return;
    delete inner.dataset.edAll;
    inner.innerHTML = '';
    panel.classList.remove('on');
    panel.style.height = '0px';
    document.querySelectorAll('.comphead').forEach(h => {
      h.classList.remove('on');
      h.setAttribute('aria-expanded', 'false');
    });
  }
  function collapseAll() {
    hideComponents();
    document.querySelectorAll('.card').forEach(c => {
      if (!c.classList.contains('on')) {
        const inner = c.querySelector('.cbody-in');
        if (inner) inner.innerHTML = '';
      }
    });
  }

  /* ---------------- add a figure ---------------- */
  let pending = null;                    // {name, path} waiting to be placed
  function showAdder() {
    let box = document.getElementById('edAdd');
    if (!box) {
      box = document.createElement('div');
      box.className = 'grp'; box.id = 'edAdd';
      dock.insertBefore(box, dock.querySelector('.grp'));
    }
    box.style.display = 'block';
    box.innerHTML = `<h4>Add a figure</h4>
      <input id="edFile" type="file" accept="image/*"
             style="width:100%;font-size:11.5px;color:#eee8dc">
      <div id="edPending" style="margin-top:8px;font-size:11.5px;color:#a49b88"></div>`;
    box.querySelector('#edFile').onchange = async e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      say('uploading ' + f.name + '…');
      const data = await new Promise(res => {
        const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(f);
      });
      try {
        const r = await fetch('/__upload', { method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: f.name, data }) });
        const d = await r.json();
        if (!r.ok || d.error) return say(d.error || 'upload failed');
        pending = { name: d.name, path: d.path };
        document.getElementById('edPending').textContent =
          'ready: ' + d.name + ' — now click the paragraph it should follow';
        say('uploaded — click where it goes');
      } catch (err) { say('offline — run edit-server.py'); }
    };
  }
  function hideAdder() {
    const box = document.getElementById('edAdd');
    if (box) box.style.display = 'none';
  }
  async function placeFigure(el) {
    if (!pending) return say('choose a file first');
    const src = el.dataset.src;
    if (!src) return say('pick a paragraph, not that');
    say('inserting…');
    try {
      const r = await fetch('/__insert', { method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ after: src, text: '![](' + pending.path + ')' }) });
      const d = await r.json();
      if (!r.ok || d.error) return say(d.error || 'insert failed');
      const added = pending.name;
      pending = null;
      say('added — reloading');
      rememberBeforeReload({ fig: added });
      setTimeout(() => location.reload(), 250);
    } catch (e) { say('offline'); }
  }

  /* ---------------- picking ---------------- */
  document.addEventListener('mouseover', e => {
    if (!mode) return;
    if (e.target.closest('#edDock,#edPop')) return;
    if (picked) picked.classList.remove('edHot');
    const t = (mode === 'text' || mode === 'add') ? e.target.closest('[data-src]')
            : mode === 'figure' ? e.target.closest('img[data-fig]')
            : e.target.closest('[data-box]') || e.target.closest('section > div, .plate-frame');
    picked = t || null;
    if (picked) picked.classList.add('edHot');
  });
  document.addEventListener('click', e => {
    if (!mode) return;
    if (e.target.closest('#edDock,#edPop')) return;
    const t = (mode === 'text' || mode === 'add') ? e.target.closest('[data-src]')
            : mode === 'figure' ? e.target.closest('img[data-fig]')
            : e.target.closest('[data-box]') || e.target.closest('section > div, .plate-frame');
    // swallow clicks so page buttons and links cannot fire while editing,
    // but leave card headers alone so cards can still be opened by hand
    const onHead = e.target.closest('.chead');
    if (!t) { if (!onHead) { e.preventDefault(); e.stopPropagation(); } return; }
    e.preventDefault(); e.stopPropagation();
    // reset the popover between kinds
    pop.querySelector('textarea').style.display = mode === 'text' ? 'block' : 'none';
    const fx = pop.querySelector('#edFigCtl'); if (fx) fx.style.display = 'none';
    pop.querySelector('.ft .sp').textContent = 'saving rewrites the .md file, then rebuilds';
    if (mode === 'text') editText(t);
    else if (mode === 'add') placeFigure(t);
    else if (mode === 'figure') editFigure(t);
    else hideBox(t);
  }, true);
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { pop.style.display = 'none'; setMode(null); }
  });

  /* ---------------- boot ---------------- */
  (async () => {
    try {
      const r = await fetch('/__tokens', { cache: 'no-store' });
      const d = await r.json();
      tokens = { vars: d.vars || {}, figures: d.figures || {}, hidden: d.hidden || [] };
      loaded = true;
    } catch (e) { say('could not read settings — edits will not be saved; reload'); }
    applyTokens(); drawDock(); restoreAfterReload();
  })();
})();
