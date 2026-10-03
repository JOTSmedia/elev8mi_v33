# ELEV8MI style audit (v31, board task E8-06)

Still current in v33: v32 and v33 made no type, colour or capitalisation changes beyond the compact hero card type described in README.md (v32).

Method: every element with its own text was measured in a headless browser at 1440x900. That covered 142 text elements on v30, including the dialogs, form fields and the moon widget. The record for each was font family, size, weight, letter-spacing, text-transform and colour. All fixes are in `style-audit.css`, loaded last. Wording was not changed anywhere; only `text-transform` and other type styles changed.

## 1. Inventory (v30, before)

| Role | Elements | Font | Case | Tracking | Colour |
|---|---|---|---|---|---|
| Hero title | `.hero h1` | Cinzel Decorative 700 | UPPERCASE (CSS) | normal | gradient |
| Section titles | `.section-title` (The work, Ways to sit, From the table, Your card reading, Book a personalized reading, Find Allison) | Cinzel Decorative 700 | UPPERCASE (CSS) | .12em | parchment |
| Section kickers | `.section-sub` | Plus Jakarta Sans 400 | UPPERCASE | .22em | gold |
| Card titles | `section h3` (In person, Distance, Notice what resonates, …), form titles | Plus Jakarta Sans 700 | UPPERCASE | .14em | gold |
| Contact labels | `.contact h3` (Email, Instagram, Website, Phone, Where) | Plus Jakarta Sans 700 | UPPERCASE | .16em | gold |
| Dialog titles | `#readingGuideTitle` / `#interpretTitle` | **Cinzel 500 21px** / **Plus Jakarta 700 24px** | UPPERCASE | normal | **#eee5f8** / **#ead3ff** |
| Nav links | `header nav a` | Cinzel 600 | UPPERCASE | .12em | **#fff** |
| Sound menu | `#soundMenuLabel` / menu items | **Plus Jakarta 400** / **Cinzel 600** | UPPERCASE | .12em | #fff / gold |
| 528 Hz | `.hz` | Plus Jakarta 400 | none | .14em | #fff |
| Prose | `section p`, `.tag`, `.lede` | Cormorant Garamond 400 | none | ~.01em | #efe4ff / #f5f0fa / #c9b7e0 |
| UI copy | reading steps, booking intro, dialog text | Plus Jakarta 400 | none | normal | **#d8cfe2, #e6daf4, #eee5f8, #f7efff, #d9c9ea** |
| Field labels | `.send-reading label`, legend, `.question-label`, step titles | Plus Jakarta 400–600 | **none** | normal | **#efe4ff, #eadcf8, #e5d0fb** |
| Buttons | `.btn`, spread/draw/copy buttons, `.interpret-send`, `#bookSubmit`, `#beginReading`, `#continueReading`, `.reading-help`, `#replay`, motion toggle, close × | **Arial ×7**, Plus Jakarta 400/500/600/700 | UPPERCASE | **normal, .06em, .16em, .2em** | **gold, parchment, #fff, #ddc9f7, #ead3ff, #1f0e2e, #21112f, #140c04** |
| Footer | all items | Plus Jakarta 400 | UPPERCASE | .18em | parchment; links underlined |
| Contact values | email, @elev8mi, website (text links) | Cormorant | **UPPERCASE (global `a` rule, so the email address showed in capitals)** | .01em | #efe4ff |

Stray fonts found:
- **Arial**: the browser default on 7 buttons, the radio and checkbox inputs, and the × close buttons.
- **Dancing Script**: `--font-script`, never loaded and used by no element.
- **Cinzel**: the fallback in the `--font-sans` stack.
- **Georgia**: section ornament glyphs only, defined in a scene file and left as is (see 5).

## 2. What was inconsistent

1. Headings were all forced to UPPERCASE, although the brand rule is sentence case. The source wording is already sentence case.
2. Field labels were sentence case while all other small labels were uppercase. Their weights and colours differed too.
3. Buttons used 4 different families (Arial included), 4 weights, 4 letter-spacings and 8 text colours.
4. The two dialog titles used different families, sizes and colours.
5. The sound menu mixed Plus Jakarta (the label) with Cinzel (the items).
6. 15+ near-identical lavender text colours were used without tokens.
7. A global `a, button {text-transform: uppercase}` rule capitalised email addresses and URLs.

## 3. Conventions chosen

Font families: three intended families. Cinzel and Cinzel Decorative count as one family; Decorative is its display cut.

| Token | Family | Use |
|---|---|---|
| `--font-display` | Cinzel Decorative | hero title, section titles |
| `--font-caps` | Cinzel | nav links, dialog titles, reading-style select |
| `--font-serif` | Cormorant Garamond | long-form prose |
| `--font-sans` | Plus Jakarta Sans | all UI: kickers, labels, buttons, forms, footer, sound menu |

Colour tokens:
- `--text` (#F5F0FA): headings, nav, controls
- `--text-soft` (#efe4ff): body and form text
- `--text-muted` (#c9b7e0): notes and hints
- `--accent` (gold #FFD700): kickers, card titles, prices, icons
- `--on-accent` (#1f0e2e): text on gold buttons
- `--error`, `--success`

Capitalisation, one rule per role:

| Role | Case | Tracking | Weight |
|---|---|---|---|
| Headings: h1, section titles, card titles, form titles, dialog titles | Sentence case, as written. Cinzel's small caps keep the brand look. | display .12em, card .06em, dialog .04em | 700 (dialog 600) |
| Kickers: section subtitles, scroll invitation, stage caption, footer lines | UPPERCASE | .2em | 500 |
| Labels: form labels, legends, the reading-style question, reading-step titles, contact-card titles | UPPERCASE | .08em (contact titles .2em, as kickers) | 600–700 |
| Buttons and button links | UPPERCASE | .12em | 700 |
| Nav links and sound menu | UPPERCASE | .12em | 600 |
| Prose, option names, prices, card names | As written | normal | 400 (prices 700) |
| Units: "528 Hz" | As written (Hz is a unit) | – | – |

Wordmarks and names stay as written: ELEV8MI, Tap into your energy, card names, prices.

## 4. What changed (v31)

- Added `style-audit.css` (loaded last) with the tokens and role rules above. Every button and input now uses Plus Jakarta Sans: no Arial left. The script and sans stacks no longer reference unused fonts.
- Headings are now sentence case. Contact-card titles stay uppercase as labels.
- Field labels, legends and step titles are now uppercase labels with consistent weight and colour.
- Buttons: one family, case, weight (700) and tracking (.12em). Gold buttons use `--on-accent`; outline buttons use `--text`.
- Both dialog titles now use Cinzel 600 at 1.35rem in `--text`.
- Sound menu: the label and items are both Plus Jakarta 600 uppercase. The selected item stays gold.
- Footer: every item on its own line, centred. The links became gold SVG icons.
- Find Allison: the email, Instagram and website text links became the same icons. Each has an aria-label, a 44 px target, and hover and focus styles. Licences are in `assets/LICENSES.md`.
- Layout is unchanged apart from the footer. No draw, booking, form, sound or payment logic was touched.

## 5. Not changed here: in Space Scene files (handed over)

These are styled in `living-world.css` / generated by `solar-system.js`, which belong to the Space Scene rebuild:

| Element | Now | Target |
|---|---|---|
| `.earth-location` "Earth · you are here" | Plus Jakarta 500 9px, UPPERCASE, .08em, `#cbeaff` (off-palette) | kicker style: Plus Jakarta 500, UPPERCASE, `letter-spacing:.2em`, `color:var(--text)` (#F5F0FA). Keep size. |
| `.moon-kicker` "The Moon tonight" | Plus Jakarta 500 8px, UPPERCASE, .16em, `#cfc2e7` | kicker: `letter-spacing:.2em`, `color:var(--accent)` (gold) or `var(--text-muted)` |
| `#moonPhaseName` | Plus Jakarta 500 13px, `#f1ebff` | `color:var(--text)`, weight 600 |
| `#moonPhaseInfo` | Plus Jakarta 400 10px, `#bbaecc` | `color:var(--text-muted)` (#c9b7e0) |
| `.planet-detail` tooltip (planet name · km · days) | Plus Jakarta, mixed case | name as kicker: Plus Jakarta 600, UPPERCASE, .12em, `var(--text)`; figures `var(--text-muted)` |
| `section::before` ornaments ✦ ☽ ❋ ♧ ✵ | Georgia | can stay Georgia (symbol glyphs only), or use `var(--font-caps)` with a symbol fallback |
| `.journey-caption` "01 / Space" (text from `journey.js`) | styled in `journey.css` | already normalised here via `style-audit.css` (kicker) |
