# Research showcase — sources

This folder builds the page at **/research/statement/**. It lives in the same
repository as the site, so there is no second copy anywhere and nothing to keep
in step.

## Editing the words

The markdown is the source of truth. The page is generated from it, never the
other way round.

| File | What it holds |
|---|---|
| `motivation_and_plate0.md` | title, key question, opening, the four examples, the three challenges, Overview & Roadmap |
| `plate1.md` `plate2.md` `plate3.md` | the three themes |
| `plate5.md` | the closing plate: what's next |

Edit, then:

```bash
python3 showcase-src/build.py
git add -A && git commit -m "what changed" && git push
```

`build.py` compiles the markdown, scopes the stylesheets under `#showcase-root`
so they cannot collide with the site theme, and writes `assets/showcase/` and
`_includes/showcase.html`. Those are generated — editing them is a dead end,
the next build overwrites them.

## Editing visually instead

```bash
python3 showcase-src/edit-server.py
```

Open the `?edit=1` link it prints. Pick a mode, click something on the page:

| Mode | What clicking does |
|---|---|
| **Text** | opens that block's raw markdown; edit, Save |
| **Figures** | size, shape, fill, position, text wrap, border, padding, and move it through the text |
| **Delete** | hides a box; hidden boxes are listed so you can bring them back |
| **Add figure** | upload an image and choose where it goes |

Text edits are written straight back into the markdown file and line they came
from. Figure settings go to `design-tokens.json`; press **Bake into CSS** to
fold them into `design-baked.css`. Then run `build.py` and commit as above —
the editor changes these sources, not the published page.

## Figures

They live at `../research/statement/figs/key_figs/`, because the paths inside
the data file are relative and the browser resolves them against the page's own
URL. `./figs` is a link to that folder so the editor preview sees the same
files. To add one, drop it in there.

## Two things to know

**`design-tokens.json` is the only record of your figure settings.** Ordinary
saves merge per figure and cannot drop anything, but **"Reset all" replaces the
whole file** and once wiped 22 figures on a single click. It now needs two
clicks, and the server writes a numbered snapshot to `.token-history/` before
any write that would lose figures.

**Absolute URLs are baked into `research-data-v4.js`** (lines ~505 and ~507:
the site link and the CV link). They were missed when the site moved domains,
and a rebuild would have quietly reverted the hand-fix. If the address or the
CV version marker ever changes, change it there.
