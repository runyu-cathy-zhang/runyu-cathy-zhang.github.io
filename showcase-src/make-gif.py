#!/usr/bin/env python3
"""
Render the closing animation to a GIF for slides.

    python3 showcase-src/make-gif.py [-o OUT.gif] [--fps N] [--width PX]
                                     [--bg paper|white|none]

Each frame is a real browser render of gif-frame.html?t=<ms>, which reuses the
page's own scene through window.__canimParts -- so the pieces, the texture and
the geometry are the ones the site animates, not a copy that would drift from
them. Headless Chrome can only screenshot once per launch, so frames are
captured a few processes at a time.

The three interface boxes arrive on the same beats as on the page. The one
difference is for slides: the examined agent stays on screen at the end, where
the page fades it and crops the stage to let the boxes take its place.
"""
import argparse, os, shutil, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
SHOT_W = 1240                     # capture wider than we ship, then downscale
SHOT_H = 810                      # stage (990x452 viewBox) plus the three boxes
DURATION_MS = 6287                # the timeline at its 1.5x playback speed
HOLD_MS = 1300                    # beat on the finished frame before looping


def chrome_args(bg):
    """Transparency has to be asked for: headless Chrome paints an opaque white
    page behind everything unless the default background colour is cleared."""
    extra = ['--default-background-color=00000000'] if bg == 'none' else []
    return extra


def shoot(args):
    """One frame, retried once.

    A headless Chrome occasionally hangs instead of exiting -- one frame in a
    hundred or so -- and without a timeout the whole run waits on it forever.
    Kill it, try again, and only then give up.
    """
    t, path, bg = args
    if os.path.exists(path):
        return path                       # already rendered; resume rather than redo
    for attempt in (1, 2):
        try:
            subprocess.run(
                [CHROME, '--headless', '--disable-gpu', '--hide-scrollbars',
                 '--force-color-profile=srgb', '--allow-file-access-from-files',
                 '--screenshot=' + path, '--window-size=%d,%d' % (SHOT_W, SHOT_H),
                 '--virtual-time-budget=2500'] + chrome_args(bg) + [
                 'file://%s/gif-frame.html?t=%d&bg=%s' % (HERE, t, bg)],
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                check=False, timeout=60)
        except subprocess.TimeoutExpired:
            pass
        if os.path.exists(path):
            return path
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('-o', '--out', default=os.path.join(HERE, 'composability.gif'))
    ap.add_argument('--fps', type=int, default=20)
    ap.add_argument('--width', type=int, default=1000, help='width of the GIF itself')
    ap.add_argument('--colors', type=int, default=160)
    ap.add_argument('--bg', choices=('paper', 'white', 'none'), default='paper',
                    help="page background: the site's paper, white, or transparent")
    ap.add_argument('--fresh', action='store_true',
                    help='re-render every frame instead of reusing the cache')
    ap.add_argument('--keep', action='store_true',
                    help='keep the frame cache, so a re-encode needs no re-render')
    a = ap.parse_args()

    try:
        from PIL import Image
    except ImportError:
        sys.exit('Pillow is required: pip3 install Pillow')
    if not os.path.exists(CHROME):
        sys.exit('Chrome not found at %s' % CHROME)

    tmp = os.path.join(HERE, '.gif-frames-' + a.bg)
    if a.fresh:
        shutil.rmtree(tmp, ignore_errors=True)
    os.makedirs(tmp, exist_ok=True)

    step = 1000.0 / a.fps
    times = [round(i * step) for i in range(int(DURATION_MS / step) + 1)]
    jobs = [(t, os.path.join(tmp, 'f%05d.png' % i), a.bg)
            for i, t in enumerate(times)]

    print('rendering %d frames at %dx%d ...' % (len(jobs), SHOT_W, SHOT_H))
    with ThreadPoolExecutor(max_workers=6) as ex:
        done = [p for p in ex.map(shoot, jobs)]
    missing = [j[1] for j, p in zip(jobs, done) if p is None]
    if missing:
        sys.exit('%d frame(s) failed to render' % len(missing))

    probe = Image.open(jobs[0][1])
    h = round(a.width * probe.height / probe.width)
    mode = 'RGBA' if a.bg == 'none' else 'RGB'
    frames = []
    for j in jobs:
        im = Image.open(j[1]).convert(mode)
        if im.width != a.width:
            im = im.resize((a.width, h), Image.LANCZOS)
        frames.append(im)

    # One palette for the whole clip. Per-frame palettes make the texture
    # shimmer, because each frame picks slightly different greys for it.
    flat = [f.convert('RGB') if f.mode == 'RGBA' else f for f in frames]
    sample = Image.new('RGB', (a.width, h * 3))
    for k, idx in enumerate((0, len(flat) // 2, len(flat) - 1)):
        sample.paste(flat[idx], (0, k * h))
    # one palette slot is reserved for "see through" when the background is none
    pal = sample.quantize(colors=a.colors - (1 if a.bg == 'none' else 0),
                          method=Image.MEDIANCUT)
    out = [f.quantize(palette=pal, dither=Image.FLOYDSTEINBERG) for f in flat]

    if a.bg == 'none':
        # GIF alpha is one bit: a pixel is either fully there or fully gone.
        # Anything under half-opaque becomes the transparent index, which is why
        # soft shadows come out with a harder edge than on the page.
        tindex = a.colors - 1
        for img, src in zip(out, frames):
            # paste through a mask rather than walking pixels: 75 million
            # per-pixel Python calls would take longer than the rendering did
            clear = src.split()[3].point(lambda v: 255 if v < 128 else 0)
            img.paste(tindex, (0, 0), clear)
            img.info['transparency'] = tindex
    frames = out

    per = round(1000 / a.fps)
    durations = [per] * len(frames)
    durations[-1] = per + HOLD_MS

    save_kw = dict(save_all=True, append_images=frames[1:], duration=durations,
                   loop=0, optimize=True, disposal=2)
    if a.bg == 'none':
        save_kw['transparency'] = a.colors - 1
        save_kw['disposal'] = 2          # clear to background between frames
    frames[0].save(a.out, **save_kw)
    if not a.keep:
        shutil.rmtree(tmp, ignore_errors=True)
    mb = os.path.getsize(a.out) / 1e6
    print('wrote %s' % a.out)
    print('  %d frames, %d fps, %dx%d, %d colours, %s background, %.1f MB'
          % (len(frames), a.fps, a.width, h, a.colors, a.bg, mb))
    print('  runs %.1fs then holds %.1fs, loops forever'
          % (DURATION_MS / 1000, HOLD_MS / 1000))


if __name__ == '__main__':
    main()
