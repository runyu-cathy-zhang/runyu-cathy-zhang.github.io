#!/usr/bin/env python3
"""
Serves the showcase and backs the visual editor.

    python3 edit-server.py            # then open ...?edit=1

Endpoints
    GET  /__md?src=file.md:12-14   -> the raw markdown for that block
    POST /__md                     -> rewrite those lines, then rebuild
    POST /__upload                 -> save a figure into figs/key_figs
    POST /__insert                 -> add a markdown line after a given line
    GET  /__tokens                 -> design-tokens.json
    POST /__tokens                 -> save design-tokens.json
    POST /__bake                   -> fold the tokens into design-baked.css
    GET/POST /__review             -> review comments (kept from before)

Everything is written inside this folder. Nothing leaves the machine.
"""
import base64, json, os, re, shutil, socket, subprocess, sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
TOKENS = os.path.join(ROOT, 'design-tokens.json')
HISTORY = os.path.join(ROOT, '.token-history')
REVIEW = os.path.join(ROOT, 'review-comments.json')
BAKED = os.path.join(ROOT, 'design-baked.css')
# every plate deck in this folder, so adding plate6.md needs no code change
EDITABLE = ({'motivation_and_plate0.md'}
            | {f for f in os.listdir(ROOT) if re.fullmatch(r'plate\d+\.md', f)})
SPAN = re.compile(r'^([A-Za-z0-9_.\-]+\.md):(\d+)-(\d+)$')


def parse_span(s):
    m = SPAN.match((s or '').strip())
    if not m:
        raise ValueError('bad span %r' % s)
    name, a, b = m.group(1), int(m.group(2)), int(m.group(3))
    if name not in EDITABLE:
        raise ValueError('not an editable file: %s' % name)
    path = os.path.join(ROOT, name)
    if not os.path.isfile(path):
        raise ValueError('missing file: %s' % name)
    return path, a, b


def read_json(path, default):
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return default


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        super().end_headers()

    def _json(self, code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _body(self):
        n = int(self.headers.get('Content-Length', 0))
        return json.loads(self.rfile.read(n) or b'{}')

    # ---------------------------------------------------------------- GET
    def do_GET(self):
        route = self.path.split('?')[0]
        if route == '/__md':
            q = dict(p.split('=', 1) for p in self.path.split('?', 1)[-1].split('&') if '=' in p)
            from urllib.parse import unquote
            try:
                path, a, b = parse_span(unquote(q.get('src', '')))
            except ValueError as e:
                return self._json(400, {'error': str(e)})
            lines = open(path, encoding='utf-8').read().split('\n')
            return self._json(200, {'src': unquote(q.get('src', '')),
                                    'text': '\n'.join(lines[a - 1:b])})
        if route == '/__tokens':
            return self._json(200, read_json(TOKENS, {'vars': {}, 'figures': {}, 'hidden': []}))
        if route == '/__review':
            return self._json(200, read_json(REVIEW, {'comments': []}))
        return super().do_GET()

    # --------------------------------------------------------------- POST
    def do_POST(self):
        route = self.path.split('?')[0]
        try:
            if route == '/__md':
                return self.save_md(self._body())
            if route == '/__tokens':
                return self.save_tokens(self._body())
            if route == '/__upload':
                return self.upload(self._body())
            if route == '/__insert':
                return self.insert(self._body())
            if route == '/__move':
                return self.move(self._body())
            if route == '/__bake':
                return self.bake()
            if route == '/__review':
                d = self._body()
                with open(REVIEW, 'w', encoding='utf-8') as f:
                    json.dump(d, f, ensure_ascii=False, indent=1)
                return self._json(200, {'ok': True})
        except Exception as e:                                     # noqa: BLE001
            return self._json(500, {'error': '%s: %s' % (type(e).__name__, e)})
        return self._json(404, {'error': 'unknown endpoint'})

    def save_md(self, d):
        try:
            path, a, b = parse_span(d.get('src'))
        except ValueError as e:
            return self._json(400, {'error': str(e)})
        new = (d.get('text') or '').replace('\r\n', '\n').rstrip('\n')
        original = open(path, encoding='utf-8').read()
        lines = original.split('\n')
        if not (1 <= a <= b <= len(lines)):
            return self._json(400, {'error': 'span outside file'})
        # keep a single .bak per file so an edit is always recoverable
        bak = path + '.bak'
        if not os.path.exists(bak):
            with open(bak, 'w', encoding='utf-8') as f:
                f.write(original)
        lines[a - 1:b] = new.split('\n')
        with open(path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        rebuilt = subprocess.run([sys.executable, 'build-copy.py'], cwd=ROOT,
                                 capture_output=True, text=True)
        print('  edited %s:%d-%d  (rebuild rc=%d)' % (os.path.basename(path), a, b,
                                                      rebuilt.returncode))
        return self._json(200, {'ok': rebuilt.returncode == 0,
                                'log': (rebuilt.stdout + rebuilt.stderr)[-1200:]})

    # allow a leading underscore; still no path separators, no leading dot
    SAFE_NAME = re.compile(r'^[A-Za-z0-9_][A-Za-z0-9._\-]{0,80}$')
    ALLOWED = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'}

    def upload(self, d):
        """Save a figure sent as a base64 data URL into figs/key_figs."""
        name = os.path.basename((d.get('name') or '').strip())
        if not self.SAFE_NAME.match(name):
            return self._json(400, {'error': 'unusable filename: %r' % name})
        if os.path.splitext(name)[1].lower() not in self.ALLOWED:
            return self._json(400, {'error': 'not an image type: %s' % name})
        blob = d.get('data') or ''
        if ',' in blob:
            blob = blob.split(',', 1)[1]
        try:
            raw = base64.b64decode(blob, validate=True)
        except Exception:
            return self._json(400, {'error': 'could not decode the file'})
        if not raw:
            return self._json(400, {'error': 'file was empty'})
        dest_dir = os.path.join(ROOT, 'figs', 'key_figs')
        os.makedirs(dest_dir, exist_ok=True)
        dest = os.path.join(dest_dir, name)
        if os.path.exists(dest) and not d.get('overwrite'):
            stem, ext = os.path.splitext(name)
            i = 2
            while os.path.exists(os.path.join(dest_dir, '%s-%d%s' % (stem, i, ext))):
                i += 1
            name = '%s-%d%s' % (stem, i, ext)
            dest = os.path.join(dest_dir, name)
        with open(dest, 'wb') as f:
            f.write(raw)
        print('  uploaded figs/key_figs/%s  (%.0f KB)' % (name, len(raw) / 1000))
        return self._json(200, {'ok': True, 'name': name,
                                'path': 'figs/key_figs/' + name})

    def insert(self, d):
        """Insert a line into a markdown file just after the given span."""
        try:
            path, a, b = parse_span(d.get('after'))
        except ValueError as e:
            return self._json(400, {'error': str(e)})
        text = (d.get('text') or '').rstrip('\n')
        if not text:
            return self._json(400, {'error': 'nothing to insert'})
        original = open(path, encoding='utf-8').read()
        bak = path + '.bak'
        if not os.path.exists(bak):
            with open(bak, 'w', encoding='utf-8') as f:
                f.write(original)
        lines = original.split('\n')
        if not (1 <= b <= len(lines)):
            return self._json(400, {'error': 'span outside file'})
        # a blank line either side keeps it a standalone markdown block
        lines[b:b] = ['', text, '']
        with open(path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        rebuilt = subprocess.run([sys.executable, 'build-copy.py'], cwd=ROOT,
                                 capture_output=True, text=True)
        print('  inserted into %s after line %d (rebuild rc=%d)'
              % (os.path.basename(path), b, rebuilt.returncode))
        return self._json(200, {'ok': rebuilt.returncode == 0,
                                'log': (rebuilt.stdout + rebuilt.stderr)[-800:]})

    def move(self, d):
        """Swap a one-line markdown block with the block above or below it.

        Blocks are maximal runs of non-blank lines. Only the moved line and the
        blank lines immediately around it are touched, so the rest of the file
        keeps its formatting.
        """
        try:
            path, a, b = parse_span(d.get('src'))
        except ValueError as e:
            return self._json(400, {'error': str(e)})
        if a != b:
            return self._json(400, {'error': 'can only move a single line'})
        direction = d.get('dir')
        if direction not in ('up', 'down'):
            return self._json(400, {'error': 'dir must be up or down'})

        original = open(path, encoding='utf-8').read()
        lines = original.split('\n')
        i = a - 1
        if not (0 <= i < len(lines)):
            return self._json(400, {'error': 'line outside file'})
        moving = lines[i]

        rest = lines[:i] + lines[i + 1:]
        # walk to the neighbouring block and find its far edge
        if direction == 'up':
            j = i - 1
            while j >= 0 and rest[j].strip() == '':
                j -= 1
            if j < 0:
                return self._json(400, {'error': 'nothing above it'})
            while j > 0 and rest[j - 1].strip() != '':
                j -= 1
            insert_at = j
        else:
            j = i
            while j < len(rest) and rest[j].strip() == '':
                j += 1
            if j >= len(rest):
                return self._json(400, {'error': 'nothing below it'})
            while j + 1 < len(rest) and rest[j + 1].strip() != '':
                j += 1
            insert_at = j + 1

        rest[insert_at:insert_at] = [moving]
        # exactly one blank line either side of the moved line
        k = insert_at
        while k + 1 < len(rest) and rest[k + 1].strip() == '' and \
                k + 2 < len(rest) and rest[k + 2].strip() == '':
            rest.pop(k + 1)
        if k + 1 >= len(rest) or rest[k + 1].strip() != '':
            rest.insert(k + 1, '')
        while k - 1 >= 0 and rest[k - 1].strip() == '' and \
                k - 2 >= 0 and rest[k - 2].strip() == '':
            rest.pop(k - 1); k -= 1
        if k - 1 < 0 or rest[k - 1].strip() != '':
            rest.insert(k, ''); k += 1

        bak = path + '.bak'
        if not os.path.exists(bak):
            with open(bak, 'w', encoding='utf-8') as f:
                f.write(original)
        with open(path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(rest))
        rebuilt = subprocess.run([sys.executable, 'build-copy.py'], cwd=ROOT,
                                 capture_output=True, text=True)
        newline = rest.index(moving) + 1
        print('  moved %s line %d -> %d (%s)'
              % (os.path.basename(path), a, newline, direction))
        return self._json(200, {'ok': rebuilt.returncode == 0, 'line': newline})

    def save_tokens(self, d):
        """Merge into the file rather than overwrite it.

        The editor sends its whole in-memory state. If its start-up read of
        this file failed — the server restarting under an open page is enough
        — that state is empty, and a plain overwrite would erase every setting
        for every figure. Merging per figure means a client that knows about
        three figures can only ever change those three. "Reset all" sends
        replace:true when it genuinely means to drop everything.
        """
        cur = read_json(TOKENS, {'vars': {}, 'figures': {}, 'hidden': []})
        if d.pop('replace', False):
            new = d
        else:
            new = {'vars': dict(cur.get('vars') or {}, **(d.get('vars') or {})),
                   'figures': dict(cur.get('figures') or {}),
                   'hidden': d.get('hidden', cur.get('hidden') or [])}
            for fig, st in (d.get('figures') or {}).items():
                new['figures'][fig] = dict(new['figures'].get(fig) or {}, **st)
        if os.path.isfile(TOKENS):
            shutil.copy2(TOKENS, TOKENS + '.bak')
            # A single rolling .bak is not enough: one destructive write followed
            # by any ordinary one loses the good state for good. Keep a numbered
            # snapshot whenever a write would drop figures, so recovery does not
            # depend on noticing immediately.
            if len(new.get('figures') or {}) < len(cur.get('figures') or {}):
                os.makedirs(HISTORY, exist_ok=True)
                n = len(os.listdir(HISTORY))
                snap = os.path.join(HISTORY, 'tokens-%03d-%dfigs.json'
                                    % (n, len(cur.get('figures') or {})))
                shutil.copy2(TOKENS, snap)
                print('  !! snapshot kept: %s' % os.path.relpath(snap, ROOT))
        with open(TOKENS, 'w', encoding='utf-8') as f:
            json.dump(new, f, ensure_ascii=False, indent=1)
        before, after = len(cur.get('figures') or {}), len(new['figures'])
        if after < before:
            print('  !! tokens: %d figures -> %d (previous kept in %s.bak)'
                  % (before, after, os.path.basename(TOKENS)))
        return self._json(200, {'ok': True, 'figures': after})

    def bake(self):
        t = read_json(TOKENS, {'vars': {}, 'figures': {}, 'hidden': []})
        out = ['/* Generated by edit-server.py from design-tokens.json.',
               '   Loaded after showcase-base.css, so it wins. Safe to delete. */']
        if t.get('vars'):
            out.append(':root{')
            for k, v in t['vars'].items():
                out.append('  %s:%s;' % (k, v))
            out.append('}')
        wrapped = []
        for fig, st in (t.get('figures') or {}).items():
            wrap = st.get('wrap')
            if wrap in ('left', 'right'):
                wrapped.append(fig)
                out.append('.mdbody figure.pfig[data-fig="%s"]{float:%s;width:%s%%;'
                           'margin:4px 0 12px;margin-%s:26px;}'
                           % (fig, wrap, st.get('wrapWidth', 44),
                              'right' if wrap == 'left' else 'left'))
                out.append('.mdbody figure.pfig[data-fig="%s"] img'
                           '{width:100%% !important;height:auto !important;'
                           'max-height:none !important;}' % fig)
            if st.get('align') in ('left', 'right', 'center'):
                a = st['align']
                out.append('figure.pfig[data-fig="%s"]{text-align:%s;}' % (fig, a))
                out.append('img[data-fig="%s"]{margin-left:%s;margin-right:%s;}'
                           % (fig, '0' if a == 'left' else 'auto',
                              '0' if a == 'right' else 'auto'))
            sel = 'img[data-fig="%s"]' % fig
            decls = []
            if st.get('sizeBy') == 'width' and st.get('widthPct'):
                decls += ['width:%s%%' % st['widthPct'], 'height:auto', 'max-height:none']
            elif st.get('height'):
                decls.append('height:%spx' % st['height'])
            if st.get('ratio') and st['ratio'] != 'natural':
                decls.append('aspect-ratio:%s' % st['ratio'])
                decls.append('width:auto')
            if st.get('fit'):    decls.append('object-fit:%s' % st['fit'])
            if st.get('radius') is not None: decls.append('border-radius:%spx' % st['radius'])
            if st.get('border') == 'off': decls.append('border:0')
            if st.get('border') == 'on':  decls.append('border:1px solid var(--rule2)')
            if st.get('pad') is not None: decls.append('padding:%spx' % st['pad'])
            if decls: out.append('%s{%s !important;}' % (sel, ' !important;'.join(decls)))
        for sel in (t.get('hidden') or []):
            out.append('%s{display:none !important;}' % sel)
        if wrapped:
            out.append('/* phones: too narrow to wrap text beside a figure */')
            out.append('@media (max-width:640px){')
            for fig in wrapped:
                out.append('  .mdbody figure.pfig[data-fig="%s"]'
                           '{float:none !important;width:100%% !important;'
                           'margin:14px 0 !important;}' % fig)
            out.append('}')
        with open(BAKED, 'w', encoding='utf-8') as f:
            f.write('\n'.join(out) + '\n')
        print('  baked %d vars, %d figure rules, %d hidden'
              % (len(t.get('vars') or {}), len(t.get('figures') or {}), len(t.get('hidden') or [])))
        return self._json(200, {'ok': True, 'file': os.path.basename(BAKED)})

    def log_message(self, fmt, *args):
        msg = fmt % args
        if '/__' in msg or ' 40' in msg or ' 50' in msg:
            sys.stderr.write('  %s\n' % msg)


class Server(ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True


def who_holds(port):
    """Best-effort description of whatever already owns the port."""
    try:
        out = subprocess.run(['lsof', '-nP', '-iTCP:%d' % port, '-sTCP:LISTEN'],
                             capture_output=True, text=True, timeout=4).stdout.strip().split('\n')
        return out[1] if len(out) > 1 else ''
    except Exception:
        return ''


def free_port(start, tries=12):
    """The requested port if it is free, else the next one that is."""
    for p in range(start, start + tries):
        with socket.socket() as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                s.bind(('127.0.0.1', p))
                return p
            except OSError:
                continue
    return None


if __name__ == '__main__':
    # unbuffered, so progress shows immediately even when piped to a file
    try:
        sys.stdout.reconfigure(line_buffering=True)
        sys.stderr.reconfigure(line_buffering=True)
    except AttributeError:
        pass
    # an explicit argument wins; otherwise honour PORT, which is how the
    # preview harness hands over the port it has already reserved
    want = int(sys.argv[1]) if len(sys.argv) > 1 \
        else int(os.environ.get('PORT') or 8765)
    port = free_port(want)
    if port is None:
        sys.exit('no free port in %d-%d' % (want, want + 11))
    if port != want:
        holder = who_holds(want)
        print('note: port %d is already in use, so this is on %d instead.' % (want, port))
        if holder:
            print('      held by: %s' % holder)
        print('      (that is usually this project\'s preview server, or an earlier')
        print("       copy of this script — either is fine, just use the URL below.)")
        print()
    print('serving %s' % ROOT)
    print('  page       http://localhost:%d/v6a-editorial.html' % port)
    print('  EDIT MODE  http://localhost:%d/v6a-editorial.html?edit=1' % port)
    print()
    print('Ctrl-C to stop.')
    try:
        Server(('127.0.0.1', port), Handler).serve_forever()
    except KeyboardInterrupt:
        print('\nstopped.')
