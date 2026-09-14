#!/usr/bin/env python3
"""
Build research-data-v5.js from the markdown copy decks.

The markdown file is the single source of truth for wording. This script never
rewrites it; it only reads it. Re-run after editing the markdown:

    python3 build-copy.py
"""
import json, re, sys, os

SRC = next((f for f in ('motivation_and_plate0.md', 'COPY-motivation.md') if os.path.exists(f)), None)
BASE = 'research-data-v4.js'      # supplies THEMES, PROFILE, figures, diagrams
OUT = 'research-data-v5.js'

# ---------------------------------------------------------------- markdown
def inline(s):
    s = s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    s = s.replace('&lt;br&gt;', '<br>')
    s = re.sub(r'\[\*(.+?)\*\]\((.+?)\)',
               r'<a href="\2" target="_blank"><em>\1</em></a>', s)
    s = re.sub(r'\[(.+?)\]\((.+?)\)', r'<a href="\2" target="_blank">\1</a>', s)
    s = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)
    s = re.sub(r'(?<!\*)\*([^*]+?)\*(?!\*)', r'<em>\1</em>', s)
    return s

def numbered(lines, offset=0):
    """[(1-indexed line number, text), ...] so every block can be traced back
    to the exact lines it came from in the markdown."""
    return [(offset + i + 1, l) for i, l in enumerate(lines)]


def md_blocks(lines, src=None, offset=0):
    """Split into renderable blocks. Each block records its plain text (so a
    figure can be anchored to the paragraph that discusses it) and its source
    line span (so the editor can round-trip it back into the markdown)."""
    html, para, bullets = [], [], []
    sp = {'para': [None, None], 'bul': [None, None]}
    def mark(kind, n):
        if sp[kind][0] is None: sp[kind][0] = n
        sp[kind][1] = n
    def attr(kind):
        a, b = sp[kind]
        if not src or a is None: return ''
        return ' data-src="%s:%d-%d"' % (src, a, b)
    def flush_para():
        if para:
            html.append({'html': '<p%s>' % attr('para') + inline('<br>'.join(para)) + '</p>',
                         'text': ' '.join(para),
                         'src': (src, sp['para'][0], sp['para'][1]) if src else None})
            para.clear()
        sp['para'] = [None, None]
    def flush_bullets():
        if bullets:
            html.append({'html': '<ul%s>' % attr('bul')
                                 + ''.join('<li>' + inline(b) + '</li>' for b in bullets) + '</ul>',
                         'text': ' '.join(bullets),
                         'src': (src, sp['bul'][0], sp['bul'][1]) if src else None})
            bullets.clear()
        sp['bul'] = [None, None]
    for n, raw in numbered(lines, offset):
        line = raw.rstrip()
        stripped = line.strip()
        if stripped in ('', '---'):
            flush_para(); flush_bullets(); continue
        if stripped == '↓':
            continue
        mimg = re.fullmatch(r'!\[([^\]]*)\]\(([^)]+)\)', stripped)
        if mimg:
            flush_para(); flush_bullets()
            path, alt = mimg.group(2).strip(), mimg.group(1).strip()
            fid = os.path.basename(path)
            fig = ('<figure class="pfig" data-fig="%s"%s>'
                   '<img src="%s" alt="%s" data-cap="" data-fig="%s"></figure>'
                   % (fid, (' data-src="%s:%d-%d"' % (src, n, n)) if src else '',
                      path, alt, fid))
            prev = html[-1] if html else None
            if prev is not None and prev.get('kind') == 'fig' and prev.get('adjacent') == n - 1:
                # an image on the very next line joins the one before it
                prev['html'] = ('<div class="pfigpair">'
                                + prev['html'].replace('<div class="pfigpair">', '')
                                              .replace('</div>', '')
                                + fig + '</div>')
                prev['adjacent'] = n
                continue
            html.append({'html': fig, 'text': alt, 'kind': 'fig', 'adjacent': n,
                         'src': (src, n, n) if src else None})
            continue
        if stripped.startswith('- ') or stripped.startswith('* '):
            flush_para(); mark('bul', n); bullets.append(stripped[2:].strip()); continue
        flush_bullets()
        mark('para', n)
        # two trailing spaces = hard break inside the paragraph
        para.append(stripped)
    flush_para(); flush_bullets()
    return html

def md_to_html(lines, src=None, offset=0):
    return ''.join(b['html'] for b in md_blocks(lines, src, offset))


def paras_src(lines, src, offset=0):
    """Paragraphs as {'t': html, 's': 'file:start-end'} so each is editable."""
    out, cur, a, b = [], [], None, None
    for n, l in numbered(lines, offset):
        if l.strip() in ('', '---'):
            if cur: out.append({'t': inline(' '.join(cur)), 's': '%s:%d-%d' % (src, a, b)})
            cur, a, b = [], None, None
        else:
            if a is None: a = n
            b = n
            cur.append(l.strip())
    if cur: out.append({'t': inline(' '.join(cur)), 's': '%s:%d-%d' % (src, a, b)})
    return out

def paras(lines):
    out, cur = [], []
    for l in lines:
        if l.strip() in ('', '---'):
            if cur: out.append(' '.join(cur)); cur = []
        else:
            cur.append(l.strip())
    if cur: out.append(' '.join(cur))
    return [p for p in out if p]

def h3_split(lines):
    """[(heading, [body lines]), ...]"""
    items, name, buf = [], None, []
    for l in lines:
        if l.strip().startswith('### '):
            if name is not None: items.append((name, buf)); buf = []
            name = l.strip()[4:].strip()
        else:
            buf.append(l)
    if name is not None: items.append((name, buf))
    return items

# ---------------------------------------------------------------- parse
lines = open(SRC, encoding='utf-8').read().split('\n')

def find(pred, default=None):
    for i, l in enumerate(lines):
        if pred(l): return i
    return default

i_move0 = find(lambda l: l.strip().startswith('--- This part moves to Plate 0'))
i_move1 = find(lambda l: l.strip().startswith('--- Now move on to Plate I'), len(lines))
if i_move0 is None:
    sys.exit('marker "--- This part moves to Plate 0" not found')

def sec(name, block, want_span=False):
    """lines under a '## name' heading, up to the next '## ' or end of block.
    With want_span, also return the 0-based offset of the first returned line."""
    for i, l in enumerate(block):
        if l.strip() == '## ' + name:
            end = len(block)
            for j in range(i + 1, len(block)):
                if block[j].strip().startswith('## '): end = j; break
            return (block[i + 1:end], i + 1) if want_span else block[i + 1:end]
    return ([], 0) if want_span else []

motiv_block = lines[:i_move0]
over_block  = lines[i_move0:i_move1]
theme_block = lines[i_move1:]

SRCB = os.path.basename(SRC)
TITLE_S = paras_src(sec('TITLE', motiv_block, want_span=True)[0], SRCB, sec('TITLE', motiv_block, want_span=True)[1])[0]
TITLE   = TITLE_S['t']
_q, _qo = sec('KEY QUESTION', motiv_block, want_span=True)
QUESTION_S = paras_src(_q, SRCB, _qo)
QUESTION = QUESTION_S[0]['t'] if QUESTION_S else ''
QUESTION_SRC = QUESTION_S[0]['s'] if QUESTION_S else None
_o, _oo = sec('OPENING', motiv_block, want_span=True)
OPENING = paras_src(_o, SRCB, _oo)
_m, _mo = sec('METHOD', motiv_block, want_span=True)
METHOD_S = paras_src(_m, SRCB, _mo)
METHOD  = ' '.join(x['t'] for x in METHOD_S)
METHOD_SRC = METHOD_S[0]['s'] if METHOD_S else None

ex_all, ex_off = sec('EXAMPLES', motiv_block, want_span=True)
# EXAMPLES section holds: ### example blocks, then '---', then the shared-structure
# paragraph, then the ### challenge blocks.
cut = None
seen = False
for i, l in enumerate(ex_all):
    if l.strip().startswith('### '): seen = True
    elif l.strip() == '---' and seen: cut = i; break
ex_part, rest = ex_all[:cut], ex_all[cut + 1:]
rest_off = ex_off + cut + 1

def h3_split_src(lines, offset):
    items, name, buf, start, nameline = [], None, [], None, None
    for i, l in enumerate(lines):
        if l.strip().startswith('### '):
            if name is not None: items.append((name, buf, start, nameline))
            name, buf, start, nameline = l.strip()[4:].strip(), [], offset + i + 1, offset + i
        else:
            buf.append(l)
    if name is not None: items.append((name, buf, start, nameline))
    return items

def example_source(body, offset):
    """An optional '**Source:** [label](url)' line under an example, shown as a
    small credit under the caption. Kept out of the caption text itself."""
    for i, l in enumerate(body):
        m = re.match(r'\*\*Source:\*\*\s*(.+)', l.strip())
        if m:
            n = offset + i + 1          # 0-based index -> 1-based line
            return inline(m.group(1).strip()), '%s:%d-%d' % (SRCB, n, n)
    return None, None

def example_body(body):
    return [('' if re.match(r'\*\*Source:\*\*', l.strip()) else l) for l in body]

EXAMPLES = []
for n, b, st, nl in h3_split_src(ex_part, ex_off):
    src_html, src_span = example_source(b, st)
    body = example_body(b)          # same length, so spans stay aligned
    ps = paras_src(body, SRCB, st)
    EXAMPLES.append({'name': n, 'text': ' '.join(x['t'] for x in ps),
                     'src': (ps[0]['s'] if ps else None),
                     'nameSrc': '%s:%d-%d' % (SRCB, nl + 1, nl + 1),
                     'source': src_html, 'sourceSrc': src_span})
k = next(i for i, l in enumerate(rest) if l.strip().startswith('### '))
_u = paras_src(rest[:k], SRCB, rest_off)
UNITES = ' '.join(x['t'] for x in _u)
UNITES_SRC = _u[0]['s'] if _u else None
CHALLENGES = [{'name': n, 'text': ' '.join(x['t'] for x in paras_src(b, SRCB, st)),
               'src': (paras_src(b, SRCB, st)[0]['s'] if paras_src(b, SRCB, st) else None),
               'nameSrc': '%s:%d-%d' % (SRCB, nl + 1, nl + 1)}
              for n, b, st, nl in h3_split_src(rest[k:], rest_off + k)]

# ---- Overview & Roadmap ----
ov_head = find(lambda l: l.strip().startswith('## Overview'))
OV_HEADING = lines[ov_head].strip()[3:].strip()
OV_HEADING_SRC = '%s:%d-%d' % (os.path.basename(SRC), ov_head + 1, ov_head + 1)
ov = lines[ov_head + 1:i_move1]
intro_lines = []
for l in ov:
    if l.strip().startswith('**') or l.strip().startswith('### '): break
    intro_lines.append(l)
_oi = paras_src(intro_lines, SRCB, ov_head + 1)
OV_INTRO = ' '.join(x['t'] for x in _oi)
OV_INTRO_SRC = _oi[0]['s'] if _oi else None

OV_MAP, pending, pending_line = [], None, None
for off, l in enumerate(ov):
    t = l.strip()
    m1 = re.fullmatch(r'\*\*(.+?)\*\*', t)
    m2 = re.fullmatch(r'→\s*\*\*(.+?)\*\*', t)
    ln = ov_head + 1 + off + 1          # 1-indexed line in the file
    if m2 and pending:
        OV_MAP.append({'challenge': pending, 'direction': m2.group(1),
                       'challengeSrc': '%s:%d-%d' % (SRCB, pending_line, pending_line),
                       'directionSrc': '%s:%d-%d' % (SRCB, ln, ln)})
        pending, pending_line = None, None
    elif m1:
        pending, pending_line = m1.group(1), ln

ov_h3 = next((i for i, l in enumerate(ov) if l.strip().startswith('### ')), None)
OV_BOXES = ([{'name': n, 'text': ' '.join(x['t'] for x in paras_src(b, SRCB, st)),
               'src': (paras_src(b, SRCB, st)[0]['s'] if paras_src(b, SRCB, st) else None)}
              for n, b, st, nl in h3_split_src(ov[ov_h3:], ov_head + 1 + ov_h3)]
             if ov_h3 is not None else [])

# ---- rewritten themes: plate1.md / plate2.md / plate3.md ----
def parse_plate(path):
    fname = os.path.basename(path)
    tl = open(path, encoding='utf-8').read().split('\n')
    h = next(i for i, l in enumerate(tl) if l.strip().startswith('## '))
    name = tl[h].strip()[3:].strip()
    body = tl[h + 1:]
    boff = h + 1
    q_at = next((i for i, l in enumerate(body) if l.strip().startswith('### ')), len(body))
    problem_html = md_to_html(body[:q_at], fname, boff)
    steps = []
    for qname, qbody, qstart, qnameline in h3_split_src(body[q_at:], boff + q_at):
        is_app = qname.startswith('Application')
        qtext = re.sub(r'^(Question|Application):\s*', '', qname).strip()
        remains, remains_line, keep = None, None, []
        summary, summary_line = None, None
        for off, l in enumerate(qbody):
            m = re.match(r'\*\*What remains:\*\*\s*(.+)', l.strip())
            ms = re.match(r'\*\*Summary:\*\*\s*(.+)', l.strip())
            if m:
                remains = m.group(1).strip()
                remains_line = qstart + off + 1      # 0-based -> 1-based
                keep.append('')
            elif ms:
                # The closed card's one-line summary, written out rather than
                # derived, so what the page shows is exactly what the editor
                # opens. Not rendered in the body -- it would just repeat.
                summary = ms.group(1).strip()
                summary_line = qstart + off + 1
                keep.append('')
            else:
                keep.append(l)
        # keep MUST stay the same length as qbody: the renderer derives every
        # source line number from a line's index in this list, so dropping a
        # line silently shifts every span after it and the editor then opens
        # the wrong -- usually blank -- line. Blank them instead of removing.
        # one-line summary for the closed card, taken verbatim from the author's own
        # emphasis; section labels ("X -> Y:") and rhetorical questions are skipped.
        brief, brief_line = summary, summary_line
        for off, l in enumerate(qbody):
            if brief: break
            for span in re.findall(r'\*\*(.+?)\*\*', l):
                span = ' '.join(span.split())
                if (len(span) > 40 and span.endswith('.')
                        and '\u2192' not in span and not span.endswith(':')):
                    brief, brief_line = span, qstart + off + 1   # 0-based -> 1-based
        if not brief:
            for off, l in enumerate(qbody):
                m = re.match(r'\*\*(?:Finding|Approach):\*\*\s*(.+)', l.strip())
                if m:
                    raw = m.group(1)
                    # "In [*Paper Title*](url), we show that X" -> "X". The card has
                    # one line to say what was found; spending most of it restating a
                    # title that already appears in the publication list wastes it.
                    raw = re.sub(r'^In\s+\[\*?.+?\*?\]\([^)]*\)\s*,\s*', '', raw)
                    txt = re.sub(r'\[\*(.+?)\*\]\(.+?\)', r'\1', raw)
                    txt = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', txt)
                    brief = re.split(r'(?<=[.!?])\s', txt)[0]
                    brief_line = qstart + off + 1    # 0-based -> 1-based
                    break
        if brief and not summary:
            brief = brief[0].upper() + brief[1:]
        idx = len(steps)
        groups = FIG_PLACEMENT.get((name, idx), [])
        is_app = is_app or (name, idx) in APP_STEPS
        steps.append({'q': qtext, 'kind': 'application' if is_app else None,
                      'qSrc': '%s:%d-%d' % (fname, qnameline + 1, qnameline + 1),
                      'brief': inline(brief) if brief else '',
                      'briefSrc': ('%s:%d-%d' % (fname, brief_line, brief_line)) if brief_line else None,
                      'remainsSrc': ('%s:%d-%d' % (fname, remains_line, remains_line)) if remains_line else None,
                      'html': render_with_figs(keep, groups, fname, qstart),
                      'remains': inline(remains) if remains else None,
                      'figs': []})
    return {'name': name, 'problemHtml': problem_html, 'steps': steps}

KEYDIR = 'figs/key_figs/'

def fig_group_html(files):
    """One figure, or two side by side. Sizing is normalised in CSS by height so
    that a 3.8:1 banner and a 1:1 square carry the same visual weight."""
    items = []
    for f in files:
        path = KEYDIR + f
        if not os.path.exists(path):
            print('  !! missing key figure:', path); continue
        items.append('<figure class="pfig" data-fig="%s"><img src="%s" alt="" data-cap="" '
                     'data-fig="%s"></figure>' % (f, path, f))
    if not items: return ''
    if len(items) > 1:
        return '<div class="pfigpair">' + ''.join(items) + '</div>'
    return items[0]

def render_with_figs(lines, groups, src=None, offset=0):
    blocks = md_blocks(lines, src, offset)
    placed, out = set(), []
    for b in blocks:
        out.append(b['html'])
        for gi, g in enumerate(groups):
            if gi in placed: continue
            if g['after'].lower() in b['text'].lower():
                out.append(fig_group_html(g['files'])); placed.add(gi)
    for gi, g in enumerate(groups):
        if gi not in placed:
            print('  !! anchor not found, figure appended at end:', repr(g['after'][:44]))
            out.append(fig_group_html(g['files']))
    return ''.join(out)

# Where each figure sits inside the prose: it follows the paragraph that
# discusses it, matched on a phrase so small edits do not dislodge it.
FIG_PLACEMENT = {}   # figures now live as ![](path) lines in the markdown

# Sections that survey applications rather than pose a question.
APP_STEPS = {('Control and Learning for Networked Systems', 2)}

# Figures supplied in figs/key_figs, attached to the question they illustrate.
# Keyed by (theme name, question index) so re-ordering prose does not silently
# move a figure onto the wrong question.
KEY_FIGS = {
    ('Control and Learning for Networked Systems', 0): ['sed_lqr_spatial_decay.png'],
    ('Control and Learning for Networked Systems', 2): ['graph-bandit.gif', 'coverage-control.gif'],
    ('Multi-Agent Learning through a Game-Theoretic Lens', 1): ['poa_figure.png'],
    ('Multi-Agent Learning through a Game-Theoretic Lens', 4): ['coinv_framework.png', 'amod_framework.png'],
    ('Robust and Feasible Decision-Making under Uncertainty', 1): ['FOFL.png', 'ZOFL.png'],
}

PLATES = [f for f in ('plate1.md', 'plate2.md', 'plate3.md') if os.path.exists(f)]
THEMES_MD = [parse_plate(f) for f in PLATES]


def parse_future(path):
    """plate5.md -> the closing plate. Same section grammar as the motivation
    deck: '## NAME' blocks, with '### ' sub-blocks inside BETS and GROUNDING."""
    blk = open(path, encoding='utf-8').read().split('\n')
    src = os.path.basename(path)

    def one(name):
        body, off = sec(name, blk, want_span=True)
        return paras_src(body, src, off)

    def h3(name):
        body, off = sec(name, blk, want_span=True)
        return [{'name': n, 'nameSrc': '%s:%d-%d' % (src, nl + 1, nl + 1),
                 'text': ' '.join(x['t'] for x in paras_src(b, src, st)),
                 'src': (paras_src(b, src, st) or [{'s': None}])[0]['s']}
                for n, b, st, nl in h3_split_src(body, off)]

    def components():
        """COMPONENTS -> the three juxtaposed boxes. Each '### ' block carries a
        one-line **Summary:** shown when collapsed, then prose and the research
        questions, both revealed on expand."""
        body, off = sec('COMPONENTS', blk, want_span=True)
        out = []
        for n, b, st, nl in h3_split_src(body, off):
            summary, summary_src, rest, quests = '', None, [], []
            for k, line in enumerate(b):
                t = line.strip()
                ln = '%s:%d-%d' % (src, st + k + 1, st + k + 1)
                m = re.match(r'\*\*Summary:\*\*\s*(.+)', t)
                if m:
                    summary, summary_src = inline(m.group(1).strip()), ln
                    rest.append('')          # keep rest the same length as b, or
                elif t.startswith('* '):     # every span after this shifts by one
                    quests.append({'t': inline(t[2:].strip()), 's': ln})
                    rest.append('')
                else:
                    rest.append(line)
            paras = paras_src(rest, src, st)
            out.append({'name': n,
                        'nameSrc': '%s:%d-%d' % (src, nl + 1, nl + 1),
                        'summary': summary, 'summarySrc': summary_src,
                        'paras': paras,
                        'questions': quests})
        return out

    head, lead, close = one('HEADLINE'), one('LEAD'), one('CLOSING')
    ground_intro = [x for x in one('GROUNDING')]
    # FIGURE holds an image line and, beneath it, the caption. Keeping it in the
    # markdown means the closing figure is swappable and captionable like any
    # other, instead of being a diagram frozen into the renderer.
    fig_body, fig_off = sec('FIGURE', blk, want_span=True)
    fig_img, fig_cap, fig_cap_src = None, '', None
    for k, line in enumerate(fig_body):
        m = re.fullmatch(r'!\[\]\(([^)]+)\)', line.strip())
        if m:
            fig_img = m.group(1)
        elif line.strip() and line.strip() != '---' and not fig_cap:
            # sec() runs to the next '## ', so the block ends with the '---'
            # separator; without this it becomes the caption
            fig_cap = inline(line.strip())
            fig_cap_src = '%s:%d-%d' % (src, fig_off + k + 1, fig_off + k + 1)
    return {
        'fig': fig_img, 'figCap': fig_cap, 'figCapSrc': fig_cap_src,
        'headline': head[0]['t'] if head else '', 'headlineSrc': head[0]['s'] if head else None,
        'lead': lead[0]['t'] if lead else '', 'leadSrc': lead[0]['s'] if lead else None,
        'paras': one('OPENING'),
        'bets': h3('BETS'),
        'components': components(),
        'groundLead': ground_intro[0]['t'] if ground_intro else '',
        'groundLeadSrc': ground_intro[0]['s'] if ground_intro else None,
        'apps': h3('GROUNDING'),
        'closing': close[0]['t'] if close else '',
        'closingSrc': close[0]['s'] if close else None,
    }


FUTURE_MD = parse_future('plate5.md') if os.path.exists('plate5.md') else None

data = {'title': TITLE, 'opening': OPENING, 'examples': EXAMPLES, 'unites': UNITES,
        'challenges': CHALLENGES, 'method': METHOD,
        'overview': {'heading': OV_HEADING, 'intro': OV_INTRO,
                     'map': OV_MAP, 'boxes': OV_BOXES},
        'themes': THEMES_MD}

# ---------------------------------------------------------------- emit
def js(v): return json.dumps(v, ensure_ascii=False)

base = open(BASE, encoding='utf-8').read()
out = [base, '''

/* ============================================================
   BELOW THIS LINE IS GENERATED FROM COPY-motivation.md
   by build-copy.py — do not hand-edit; edit the markdown.
   ============================================================ */
''']
out.append('''
/* Figures were removed from the question cards at the author's request. */
THEMES.forEach(t => t.steps.forEach(s => { s.figs = []; }));
''')
KEY = 'figs/key_figs/'
EXAMPLE_IMG = {
    'warehouse robotics':   KEY + 'warehouse-robot.gif',
    'mobility and transit': KEY + 'mobility-system.png',
    'power grids':          KEY + 'power-grid.png',
    'multi-agent ai':       KEY + 'multi-LLM-agent.png',
}
for e in data['examples']:
    img = EXAMPLE_IMG.get(e['name'].strip().lower())
    if img and os.path.exists(img):
        e['img'] = img
    else:
        print('  note: no image matched for example', repr(e['name']))

# text is already inlined and carries its source span, so it is emitted as-is
out.append('const MOTIVATION = ' + js({
    'title': data['title'], 'titleSrc': TITLE_S['s'],
    'question': QUESTION, 'questionSrc': QUESTION_SRC,
    'opening': data['opening'],
    'examples': [{'name': e['name'], 'text': e['text'], 'src': e.get('src'),
                  'nameSrc': e.get('nameSrc'), 'img': e.get('img'),
                  'source': e.get('source'), 'sourceSrc': e.get('sourceSrc')}
                 for e in data['examples']],
    'unites': data['unites'], 'unitesSrc': UNITES_SRC,
    'challenges': [{'name': c['name'], 'text': c['text'], 'src': c.get('src'),
                    'nameSrc': c.get('nameSrc')} for c in data['challenges']],
}) + ';\n')
out.append('const METHOD_TEXT = ' + js(data['method']) + ';\n')
out.append('const METHOD_SRC = ' + js(METHOD_SRC) + ';\n')
o = data['overview']
out.append('const OVERVIEW = ' + js({
    'heading': o['heading'], 'headingSrc': OV_HEADING_SRC,
    'intro': o['intro'], 'introSrc': OV_INTRO_SRC,
    'map': o['map'],
    'boxes': [{'name': b['name'], 'text': b['text'], 'src': b.get('src')}
              for b in o['boxes']],
}) + ';\n')

# theme rename + reorder, driven by the roadmap order in the markdown
dir_names = [m['direction'] for m in o['map']]
out.append('''
/* Names, order and box copy come from the markdown's roadmap. Existing figures
   and publication lists are preserved. */
(function () {
  const DIRS = ''' + js(dir_names) + ''';
  const DIRSRC = ''' + js([m.get('directionSrc') for m in o['map']]) + ''';
  const BOXES = ''' + js([{'name': b['name'], 'text': b['text'], 'src': b.get('src')} for b in o['boxes']]) + ''';
  const byName = {
    "Control and Learning for Networked Systems": "t2",
    "Multi-Agent Learning through a Game-Theoretic Lens": "t1",
    "Robust and Feasible Decision-Making under Uncertainty": "t3"
  };
  const byId = Object.fromEntries(THEMES.map(t => [t.id, t]));
  const NUM = ["1", "2", "3"];
  const ordered = [];
  DIRS.forEach((name, i) => {
    const th = byId[byName[name]];
    if (!th) return;
    th.property = name;
    th.propertySrc = (DIRSRC[i] || null);
    th.title = "";                       // the full name replaces the old subtitle
    th.num = NUM[i];
    th.label = "Theme " + NUM[i];
    const box = BOXES.find(b => b.name === name);
    if (box) { th.intuitionCap = box.text; th.intuitionCapSrc = box.src; }
    th.intuitionImg = "figs/key_figs/theme" + NUM[i] + "-illustration.png";
    ordered.push(th);
  });
  THEMES.length = 0;
  ordered.forEach(t => THEMES.push(t));
})();
''')

if data['themes']:
    out.append("""
/* Themes rewritten in plate*.md. Question text, body copy and "what remains"
   come from the markdown; publications are retained for the reference list
   (they are hidden inside a card whose prose already links them). */
(function () {
  const SRCS = """ + js(data['themes']) + """;
  SRCS.forEach(SRC => {
    const th = THEMES.find(x => x.property === SRC.name);
    if (!th) { console.warn('no theme matches', SRC.name); return; }
    th.problemHtml = SRC.problemHtml;
    SRC.steps.forEach((s, i) => {
      const step = th.steps[i] || (th.steps[i] = {});
      step.q = s.q;
      step.qSrc = s.qSrc;
      step.briefSrc = s.briefSrc;
      step.gapSrc = s.remainsSrc;
      step.kind = s.kind || undefined;
      step.findingBrief = s.brief;
      step.bodyHtml = s.html;
      step.gap = s.remains || null;
      step.remains = null;            // shown once, in the connector between cards
      step.figs = s.figs || [];
      step.tension = step.tension || [];
      step.finding = step.finding || [];
      step.pubs = step.pubs || [];
    });
    // v4 attached publications by step index. The markdown reordered and rewrote
    // the cards, so a card can inherit a paper it never actually discusses. Drop
    // any paper this theme already links in its own prose from the card's own
    // list; the reference list still sees it, so nothing disappears from there.
    const linked = new Set();
    const grab = h => (String(h || '').match(/href="([^"]+)"/g) || [])
      .forEach(m => linked.add(m.slice(6, -1)));
    grab(th.problemHtml);
    th.steps.forEach(s => { grab(s.bodyHtml); grab(s.gap); });
    // pubs still feeds the reference list; pubsShow is what a card prints
    th.steps.forEach(s => { s.pubsShow = (s.pubs || []).filter(p => !linked.has(p.u)); });
    // steps the markdown no longer covers are dropped, but their publications
    // are kept so the reference list stays complete
    if (th.steps.length > SRC.steps.length) {
      const dropped = th.steps.splice(SRC.steps.length);
      const last = th.steps[th.steps.length - 1];
      dropped.forEach(d => (d.pubs || []).forEach(p => last.pubs.push(p)));
    }
  });
})();
""")

if FUTURE_MD:
    out.append('\n/* Plate V rewritten in plate5.md. */\n'
               'Object.assign(FUTURE, ' + js(FUTURE_MD) + ');\n')

# ---------------------------------------------------------------- self-check
# Every span the editor can open is a file:line-line pair. If any of them lands
# on a blank line the editor opens an empty box, which looks like the text is
# simply uneditable. That has happened twice from off-by-one arithmetic, so the
# build now refuses to finish quietly when it does.
def audit_spans(payload):
    seen, broken = 0, []
    cache = {}
    def check(src):
        nonlocal seen
        if not isinstance(src, str) or ':' not in src:
            return
        f, _, rng = src.partition(':')
        try:
            a = int(rng.split('-')[0])
        except ValueError:
            return
        if not os.path.exists(f):
            broken.append((src, 'no such file')); return
        if f not in cache:
            cache[f] = open(f, encoding='utf-8').read().split('\n')
        seen += 1
        if not (1 <= a <= len(cache[f])):
            broken.append((src, 'outside file'))
        elif not cache[f][a - 1].strip():
            broken.append((src, 'blank line'))
    def walk(v):
        if isinstance(v, dict):
            for k, x in v.items():
                if isinstance(x, str) and (k.endswith('Src') or k == 'src' or k == 's'):
                    check(x)
                else:
                    walk(x)
        elif isinstance(v, list):
            for x in v:
                walk(x)
        elif isinstance(v, str) and re.match(r'^[\w.\-]+\.md:\d+-\d+$', v):
            check(v)
    walk(payload)
    # spans embedded in rendered html carry the same guarantee
    for m in re.finditer(r'data-src="([^"]+)"', json.dumps(payload)):
        check(m.group(1))
    return seen, broken

_seen, _broken = audit_spans(data)
if _broken:
    print('\n  !! %d editable span(s) point at nothing:' % len(_broken))
    for src, why in _broken[:20]:
        print('       %-24s %s' % (src, why))
    sys.exit('build aborted: fix the span arithmetic before publishing')

open(OUT, 'w', encoding='utf-8').write(''.join(out))
json.dump(data, open('_parsed.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('wrote', OUT, os.path.getsize(OUT), 'bytes')
print(' title      :', data['title'][:70])
print(' question   :', (QUESTION or '(none)')[:70])
if FUTURE_MD:
    print(' plate V    :', FUTURE_MD['headline'], '| %d paras, %d bets, %d domains'
          % (len(FUTURE_MD['paras']), len(FUTURE_MD['bets']), len(FUTURE_MD['apps'])))
print(' opening    :', len(data['opening']), 'paras')
print(' examples   :', [e['name'] for e in data['examples']])
print(' challenges :', [c['name'] for c in data['challenges']])
print(' roadmap    :', len(o['map']), 'pairs ->', [m['direction'][:38] for m in o['map']])
print(' boxes      :', [b['name'][:38] for b in o['boxes']])
for t in data['themes']:
    print(' theme      :', t['name'], '(%d steps)' % len(t['steps']))
    for st in t['steps']:
        print('   %s%s' % ('APP ' if st['kind'] else 'Q ', st['q'][:60]))
        print('      brief  :', (st['brief'] or '(none)')[:58])
        print('      remains:', (st['remains'] or '(none)')[:46])
