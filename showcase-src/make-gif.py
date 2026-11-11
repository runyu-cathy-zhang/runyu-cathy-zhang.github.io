#!/usr/bin/env python3
"""
Render the closing animation to a GIF for slides.

    python3 showcase-src/make-gif.py [-o OUT.gif] [--fps N] [--width PX]

Each frame is a real browser render of gif-frame.html?t=<ms>, which reuses the
page's own scene through window.__canimParts -- so the pieces, the texture and
the geometry are the ones the site animates, not a copy that would drift from
them. Headless Chrome can only screenshot once per launch, so frames are
captured a few processes at a time.

Two deliberate differences from the page, both for slides:
  * the interface boxes never appear -- a GIF has nothing to hand off to
  * the examined agent stays on screen at the end; the page fades it and crops
"""
import argparse, os, shutil, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
SHOT_W = 1240                     # capture wider than we ship, then downscale
SHOT_H = round(SHOT_W * 452 / 990)
DURATION_MS = 6287                # the timeline at its 1.5x playback speed
HOLD_MS = 1300                    # beat on the finished frame before looping


def shoot(args):
    t, path = args
    subprocess.run(
        [CHROME, '--headless', '--disable-gpu', '--hide-scrollbars',
         '--force-color-profile=srgb', '--allow-file-access-from-files',
         '--screenshot=' + path, '--window-size=%d,%d' % (SHOT_W, SHOT_H),
         '--virtual-time-budget=2500',
         'file://%s/gif-frame.html?t=%d' % (HERE, t)],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)
    return path if os.path.exists(path) else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('-o', '--out', default=os.path.join(HERE, 'composability.gif'))
    ap.add_argument('--fps', type=int, default=20)
    ap.add_argument('--width', type=int, default=1000, help='width of the GIF itself')
    ap.add_argument('--colors', type=int, default=160)
    a = ap.parse_args()

    try:
        from PIL import Image
    except ImportError:
        sys.exit('Pillow is required: pip3 install Pillow')
    if not os.path.exists(CHROME):
        sys.exit('Chrome not found at %s' % CHROME)

    tmp = os.path.join(HERE, '.gif-frames')
    shutil.rmtree(tmp, ignore_errors=True)
    os.makedirs(tmp)

    step = 1000.0 / a.fps
    times = [round(i * step) for i in range(int(DURATION_MS / step) + 1)]
    jobs = [(t, os.path.join(tmp, 'f%05d.png' % i)) for i, t in enumerate(times)]

    print('rendering %d frames at %dx%d ...' % (len(jobs), SHOT_W, SHOT_H))
    with ThreadPoolExecutor(max_workers=6) as ex:
        done = [p for p in ex.map(shoot, jobs)]
    missing = [j[1] for j, p in zip(jobs, done) if p is None]
    if missing:
        sys.exit('%d frame(s) failed to render' % len(missing))

    h = round(a.width * 452 / 990)
    frames = []
    for _, p in jobs:
        im = Image.open(p).convert('RGB')
        if im.width != a.width:
            im = im.resize((a.width, h), Image.LANCZOS)
        frames.append(im)

    # One palette for the whole clip. Per-frame palettes make the texture
    # shimmer, because each frame picks slightly different greys for it.
    sample = Image.new('RGB', (a.width, h * 3))
    for k, idx in enumerate((0, len(frames) // 2, len(frames) - 1)):
        sample.paste(frames[idx], (0, k * h))
    pal = sample.quantize(colors=a.colors, method=Image.MEDIANCUT)
    frames = [f.quantize(palette=pal, dither=Image.FLOYDSTEINBERG) for f in frames]

    per = round(1000 / a.fps)
    durations = [per] * len(frames)
    durations[-1] = per + HOLD_MS

    frames[0].save(a.out, save_all=True, append_images=frames[1:],
                   duration=durations, loop=0, optimize=True, disposal=2)
    shutil.rmtree(tmp, ignore_errors=True)
    mb = os.path.getsize(a.out) / 1e6
    print('wrote %s' % a.out)
    print('  %d frames, %d fps, %dx%d, %d colours, %.1f MB'
          % (len(frames), a.fps, a.width, h, a.colors, mb))
    print('  runs %.1fs then holds %.1fs, loops forever'
          % (DURATION_MS / 1000, HOLD_MS / 1000))


if __name__ == '__main__':
    main()
