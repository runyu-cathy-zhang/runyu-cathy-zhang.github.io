#!/usr/bin/env python3
"""
Build the research showcase into the site around it.

    python3 showcase-src/build.py

Everything here is one repository: you edit the markdown in this folder, this
script regenerates what the page actually loads, and the result is committed
alongside it. There is no second copy anywhere to fall out of step.

What it writes, all inside the site:

    assets/showcase/*.css      the stylesheets, every selector scoped under
                               #showcase-root so they cannot touch the rest of
                               the site and the theme cannot reach inside them
    assets/showcase/*.js       the page's own code, verbatim
    _includes/showcase.html    the markup the Jekyll page includes

Figures are NOT touched. They already live at research/statement/figs/, which
is where the page's relative paths resolve to, and ./figs is a link to them so
the editor preview sees the same files. To add one, drop it in there.

Then:

    git add -A && git commit -m "..." && git push

"""

import hashlib, os, re, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)          # the Jekyll site is the parent directory
ROOT = '#showcase-root'

# Where the showcase page is mounted on the site. The figure paths inside
# research-data-v5.js are relative ("figs/key_figs/x.png"), so the browser
# resolves them against the page's own URL -- which is why the images live in a
# directory of that name rather than under assets/. Change this and the
# permalink in _pages/research-showcase.md together.
MOUNT = 'research/statement'

# Classes showcase.js puts on <body>, not on the container. Their rules have
# to keep reaching body or the theme they select stops applying.
BODY_CLASS_PREFIXES = ('.future-',)


def prefix_one(sel):
    """Rewrite a single (comma-free) selector to live under ROOT."""
    sel = sel.strip()
    if not sel:
        return []
    if sel == '*':
        # box-sizing: the container itself needs it too, not just descendants
        return [ROOT, ROOT + ' *']
    if sel in ('html', ':root'):
        # :root only ever carries custom properties; move them onto the
        # container so they cascade to the showcase and nothing else.
        return [ROOT] if sel == ':root' else ['html']
    if sel == 'body' or sel.startswith('body '):
        return [ROOT + sel[4:]]
    for pre in BODY_CLASS_PREFIXES:
        if sel.startswith(pre):
            head, _, tail = sel.partition(' ')
            return ['body%s %s %s' % (head, ROOT, tail)] if tail else ['body' + head + ' ' + ROOT]
    return ['%s %s' % (ROOT, sel)]


def prefix_selector(sel):
    out = []
    for part in sel.split(','):
        out.extend(prefix_one(part))
    return ','.join(out)


REM_PX = 16.0   # the root size the showcase was designed against


def derem(css):
    """Turn rem into px at a 16px root.

    minimal-mistakes scales the root font: 16px, then 18px from its $medium
    breakpoint up. Every rem in the showcase would therefore render 12.5%
    larger inside the site than on the standalone page -- and rem resolves
    against <html>, so it cannot be corrected from the container. Baking the
    intended size in keeps the two identical. The showcase is px-anchored
    already (--fs-body is 17px), so nothing responsive is lost.
    """
    def px(m):
        v = float(m.group(1)) * REM_PX
        return ('%g' % round(v, 4)) + 'px'
    return re.sub(r'(?<![\w.-])(\d*\.?\d+)rem\b', px, css)


def strip_comments(text):
    """Pull /* ... */ out of a selector, returning (comments, clean selector).

    Comments live between rules, so they arrive glued to the front of the
    next selector. Left in place they would be comma-split along with it and
    end up prefixed as if they were selectors.
    """
    found, out, i = [], [], 0
    while i < len(text):
        start = text.find('/*', i)
        if start == -1:
            out.append(text[i:]); break
        out.append(text[i:start])
        end = text.find('*/', start + 2)
        end = len(text) if end == -1 else end + 2
        found.append(text[start:end]); i = end
    return ''.join(found), ''.join(out)


def scope(css):
    """Walk the stylesheet by brace depth and prefix every rule selector."""
    out, i, n = [], 0, len(css)
    while i < n:
        brace = css.find('{', i)
        if brace == -1:
            out.append(css[i:]); break
        head = css[i:brace]
        # Comments come first: they sit between rules, so they arrive glued to
        # the next selector, and they routinely contain both ';' and ',' --
        # which would otherwise be read as at-rule and selector punctuation.
        comments, head = strip_comments(head)
        if comments:
            out.append(comments)
        # a stray ';' before '{' means a statement at-rule (@import, @charset)
        semi = head.rfind(';')
        if semi != -1:
            out.append(head[:semi + 1]); head = head[semi + 1:]
        body_start = brace + 1
        depth, j = 1, body_start
        while j < n and depth:
            if css.startswith('/*', j):
                e = css.find('*/', j + 2); j = n if e == -1 else e + 2; continue
            if css[j] == '{': depth += 1
            elif css[j] == '}': depth -= 1
            j += 1
        body = css[body_start:j - 1] if depth == 0 else css[body_start:]
        stripped = head.strip()
        if stripped.startswith('@'):
            name = stripped[1:].split()[0].lower() if stripped[1:].split() else ''
            if name in ('media', 'supports', 'layer', 'container'):
                out.append(head + '{' + scope(body) + '}')       # recurse
            else:
                out.append(head + '{' + body + '}')              # keyframes etc.
        else:
            out.append(prefix_selector(stripped) + '{' + body + '}')
        i = j
    return ''.join(out)




def main():
    if not os.path.isdir(os.path.join(SITE, '_includes')):
        sys.exit('expected the Jekyll site one level up; not found at %s' % SITE)

    # the markdown is the source: compile it first, always
    rc = subprocess.call([sys.executable, 'build-copy.py'], cwd=HERE)
    if rc != 0:
        sys.exit('build-copy.py failed -- the page was not rebuilt')

    dest = os.path.join(SITE, 'assets', 'showcase')
    os.makedirs(dest, exist_ok=True)

    html = open(os.path.join(HERE, 'v6a-editorial.html'), encoding='utf-8').read()

    # ---- 1. the inline token block becomes a scoped stylesheet -------------
    tokens = re.search(r'<style>(.*?)</style>', html, re.S)
    if not tokens:
        sys.exit('no inline <style> found in v6a-editorial.html')
    open(os.path.join(dest, 'showcase-tokens.css'), 'w', encoding='utf-8').write(
        '/* generated by showcase-src/build.py -- do not edit */\n' + derem(scope(tokens.group(1))))

    # ---- 2. the two stylesheets ------------------------------------------
    for name in ('showcase-base.css', 'design-baked.css'):
        css = open(os.path.join(HERE, name), encoding='utf-8').read()
        open(os.path.join(dest, name), 'w', encoding='utf-8').write(
            '/* generated by showcase-src/build.py -- do not edit */\n' + derem(scope(css)))

    # ---- 3. the page's own scripts, verbatim ------------------------------
    for name in ('research-data-v5.js', 'showcase.js', 'composable-anim.js'):
        shutil.copy2(os.path.join(HERE, name), os.path.join(dest, name))

    # ---- 4. the markup ----------------------------------------------------
    body = re.search(r'<body>(.*)</body>', html, re.S).group(1)
    body = re.sub(r'<script src="edit\.js"></script>\s*', '', body)
    # bare asset names become site-absolute URLs Jekyll can serve, and carry a
    # content hash so a stale browser copy cannot outlive an edit
    def asset(m):
        name = m.group(1)
        f = os.path.join(dest, name.split('?')[0])
        v = ''
        if os.path.isfile(f):
            v = '?v=' + hashlib.sha256(open(f, 'rb').read()).hexdigest()[:8]
        return 'src="{{ base_path }}/assets/showcase/%s%s"' % (name.split('?')[0], v)
    body = re.sub(r'src="(?!https?:|/|\{\{)([^"]+)"', asset, body)
    open(os.path.join(SITE, '_includes', 'showcase.html'), 'w', encoding='utf-8').write(
        '{% comment %}\n'
        '  Generated by showcase-src/build.py -- do not edit here.\n'
        '  Edit the markdown in showcase-src/ and re-run that script.\n'
        '{% endcomment %}\n'
        '{% include base_path %}\n'
        '<div id="showcase-root">\n' + body.strip() + '\n</div>\n')

    figs = os.path.join(SITE, MOUNT, 'figs', 'key_figs')
    n = len(os.listdir(figs)) if os.path.isdir(figs) else 0
    print('built into %s' % os.path.relpath(dest, SITE))
    print('  3 stylesheets scoped under %s' % ROOT)
    print('  3 scripts; markup -> _includes/showcase.html')
    print('  %d figures left in place at %s/figs/key_figs/' % (n, MOUNT))
    print('\nnow: git add -A && git commit -m "..." && git push')


if __name__ == '__main__':
    main()
