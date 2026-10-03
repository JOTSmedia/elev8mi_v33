# ELEV8MI v33

## Preview and upload
- Preview the full site (including the WebGL scene) by serving this folder
  locally: `python3 -m http.server 8000` inside website/, then open
  http://localhost:8000/. Opening index.html straight from disk also works,
  but the scene then uses its 2D fallback (night sky only). There is no
  separate single-file offline preview; the old ELEV8MI-preview-v27.html was
  retired.
- Upload: copy the CONTENTS of github_upload/ (identical to website/) into
  UPLOAD/ELEV8MI and upload them to the root of the existing GitHub
  repository, replacing matching files. Include assets/, vendor/, favicon.ico
  and all CSS/JS. No installation or build step is required. Cache tag ?v=35.

## Version history v30 to v33
- v33 (7f59892 and later): the hero logo glow follows the day/night sky, docs refresh, real stars and constellations with the Milky Way, drifting day clouds, planets dim by day, phase-only Moon, planet spin, Pause motion button removed (details below).
- v32 (ecb976e): planets pass behind Earth, no planet avoidance, 528 Hz sound
  menu fix for file:// previews, day sky, Moon rotation, small bottom-right
  Moon-phase pill, hero card above the fold. Cache tag ?v=33.
- v31 (0117a26, 054fd46, 5d83fff): footer one item per line, gold social
  icons, style audit (STYLE-AUDIT.md), equalizer bars on mobile, photoreal
  WebGL space scene, ESO Milky Way credit in the footer, Saturn equator seam
  fix. Cache tag ?v=31.
- v30 (b22656c): "Book a personalized reading" section, Web3Forms and payment
  link placeholders, new link-preview image and favicons, Tone moved to the
  end of the sound menu. Cache tag ?v=32. Earlier v30-round work (mobile nav,
  bigger Sun and Moon) is described further down.

## v33 changes (E8-10 hero logo glow)
- The glow behind the hero logo follows the sky. At night it is the same purple loader-style glow as before. As the day sky fades in, the dark ring around the logo fades out and a soft white-violet halo fades in, so the logo stays legible on the blue sky. It uses the same day/night value as the sky, so the two stay in sync. Without WebGL the sky stays night, and so does the glow.
- Night sky (E8-12): many more stars, real ones. Stars brighter than magnitude 5 (4 on phones) are placed from the Hipparcos catalogue, with subtle constellation lines: Polaris and the Little Dipper, the Big Dipper, Orion, Taurus with the Pleiades, Gemini, Auriga, Perseus, Cassiopeia, Canis Major and others. The view is a fixed one of the winter sky (Polaris upper left, the Big Dipper lower left, Orion on the right). The ESO Milky Way panorama is drawn through the same projection, so the band runs where it really is (between Orion and Gemini, up through Auriga toward Cassiopeia), and it is brighter than before. Stars, lines and the band fade out by day. Data and licences: `assets/sky/night-sky.json`, `assets/LICENSES.md`.
- Day sky (E8-12): soft procedural clouds (no image) drift slowly across the day sky, denser toward Earth's limb, with thin wisps higher up and a gentle haze shimmer above the limb. They fade in with daylight, stay thin around the hero logo, and stop when motion is reduced. Phones use cheaper clouds and fewer stars.
- Planets wash out in daylight (still faintly visible) and return to full brightness at night. Earth, the Sun and the Moon are unchanged.
- The Moon shows only its sunlit part for today's real phase (the same phase as the Moon pill). The dark side is transparent, with only a very faint earthshine at night. Every planet and the Moon turn on their axes, one turn every 40 to 120 seconds (see Extras below; Venus and Uranus turn backwards).
- The Pause motion button is gone. The Moon-phase pill sits in its place in the bottom-right corner. Motion still stops automatically when the device asks for reduced motion.
- Extras (by ELEV8MI Space Scene): `sidereal.js` turns the whole night sky (stars, lines, Milky Way) about Polaris at the true sidereal rate, starting from the designed view (New York longitude, so it is barely visible during a visit), through `window.Elev8Sky.rotation`. `spin-config.js` sets each planet's spin period from its real rotation period (40 to 120 s, Venus and Uranus backwards) through `window.Elev8SpinTable`; the foreground Earth keeps its 6-minute turn. `fallback-sky.css` gives the no-WebGL and reduced-motion sky more stars, a Milky Way band and slow day clouds (static with reduced motion). With reduced motion the static 2D scene is used.
- Cache tag is ?v=35.

## v32 changes (E8-07 planet depth, E8-08 sound menu)
- Planets pass behind Earth: Earth hides the parts of the orbit tracks behind it, planets are drawn solid (no see-through depth fade; depth now dims them slightly instead), and the Moon always sits in front of the planets.
- No planet avoidance: planets follow their exact orbits and may overlap, with the nearer one in front. No nudges or jumps.
- 528 Hz sound menu: in a local preview (index.html opened from disk), choosing an instrument used to fall back to Tone and drop that instrument from the menu, because the browser blocks file loading there. Instruments now play through a looping audio element in that case. On the web (GitHub Pages) nothing changes.
- Day sky (E8-09): while the scene's Sun is up the sky above Earth turns daytime blue and the stars and Milky Way fade; it returns to night at sunset. The Sun follows the scene's built-in day cycle (about 86 seconds per day, opening at midnight).
- The Moon turns slowly on its axis (one turn every 120 seconds of scene time).
- The Moon-phase pill is smaller and fixed in the bottom-right corner, next to Pause motion. It fades aside if it would cover a button, link or form field.
- The "Cards for the in-between" hero card sits right under Earth and the orbits and fits in the first screen (1440x900, 1280x800, 390x844). Same text, more compact type. Styles are in v32-scene.css.
- Cache tag is ?v=33 because ?v=32 was already used by v30.

## v31 changes (E8-06: footer, social icons, style audit)

- Footer: every item on its own line, centred.
- Social and contact links (email, Instagram @elev8mi, website) are now gold SVG icons with 44 px targets, in the footer and in "Find Allison". Licences are in `assets/LICENSES.md`.
- Style audit: one capitalisation, font, colour and tracking convention per role, in `style-audit.css`. See `STYLE-AUDIT.md`. No wording changed.
- Phone nav: the 528 Hz equalizer bars show again on mobile (compact width), with the same animation as desktop.
- Photoreal WebGL space scene (E8-05, by ELEV8MI Space Scene): `space-realism.js` with vendored three.js r169 (`vendor/three.module.min.js`) and the maps in `assets/space/` (`-m` files are the phone tier). Real Milky Way sky, Earth relief, ocean glint and city lights. The 2D scene stays as the fallback when WebGL is off, with reduced motion, or when opened from file://. Planet fill light raised so backlit planets stay bright.
- Credit line in the footer: "Milky Way panorama: ESO/S. Brunier (CC BY 4.0)", required by the image licence. Keep it on the site. Sources are in `assets/LICENSES.md`.
- Saturn (5d83fff): the thin seam line just north of Saturn's equator is softened in `assets/space/saturn.webp` and `saturn-m.webp` (see `assets/LICENSES.md`).
- Cache tag is ?v=31 (the tag now matches the folder number). This folder succeeds v30, which used ?v=32.

## v30 changes (booking and payment, b22656c)

- Sound menu order: Guitar, Cello, Violin, Piano, Harp, Singing Bowl, Tone. Tone is still the default.
- New "Book a personalized reading" section under the card draw (`booking.js`, `booking.css`): name, email, question and a choice of One Card Pull ($11.11) or 5 Card Story ($22.22, up to 5 cards; the story includes an expansion of card 1 based on your question). The email to Allison names the reading and its price.
- After the booking is sent (or the email draft opens), the visitor goes to the payment link for their reading. Until the links are pasted in, it says the payment link is coming soon and Allison will email them.
- Link preview image and favicons replaced (see below).
- Cache param is now ?v=32.

### Activating bookings and payments

1. Web3Forms key: paste it into `form-config.js` (replace `PASTE-WEB3FORMS-ACCESS-KEY-HERE`). The same key powers both the reading form and the booking form. Until then both forms open an email draft instead.
2. Payment links: in Stripe, create two Payment Links ($11.11 and $22.22) and paste their `https://buy.stripe.com/...` URLs into `payment-config.js`, replacing `PASTE-STRIPE-LINK-1111` and `PASTE-STRIPE-LINK-2222`. PayPal payment links also work.
3. Re-upload `form-config.js` and `payment-config.js`.

### Link preview and icons

- Link preview image: `og-image.jpg` (1200x630, the hero scene at sunrise). The `og:image`, `og:url` and `twitter:image` tags use absolute URLs on https://www.elev8mi.com/. If the site goes live on a different address first (for example a github.io path), update those absolute URLs in `index.html` (and the canonical link) to that address, or previews will not show the image.
- Icons, made from the star-and-crescent mark of the ELEV8MI logo: `favicon.ico` (16, 32, 48), `favicon-16x16.png`, `favicon-32x32.png` and `apple-touch-icon.png` (180x180). The site has no web manifest, so none was added.

## Earlier v30-round changes (Sun and Moon, Mac cb92418)

- Earth's Moon is larger and closer to Earth: disc 42 -> 58 px (50 px on phones), orbit width 36% -> 27% of the scene, orbit height 90 -> 70 px (60 -> 48 in short landscape).
- The rising/setting Sun is larger: 24-42 px -> 34-62 px, with a stronger glow.
- The sunrise/sunset horizon glow is wider, warmer and a little brighter to match the bigger Sun. Other planets and moons are unchanged. Cache param is now ?v=31.

## Earlier v30-round changes (mobile nav, Mac dc0304e)

- Mobile top nav no longer overlaps: logo, 528 Hz pill, sound dropdown, play and menu buttons stay clear at 320–430 px portrait and in phone landscape (568x320 to 932x430).
- Compacting on small screens: the wave icon is hidden at 480 px and below, the "528 Hz" text is hidden at 400 px and below, the logo shrinks a little, and gaps are tighter. The sound label shortens with an ellipsis if needed.
- Sound dropdown: tap targets are 40 px or more, and the menu always opens fully on-screen. In short landscape screens it uses two columns.
- Desktop layout (wider than 960 px) and the gold nav lines are unchanged. Cache param is now ?v=30.

## v29 changes
- Nav indicator lines are brand gold (`--gold` tokens). On desktop both lines
  park exactly over and under the active link's text (re-measured on resize,
  font load, layout changes and scroll-spy updates); with no active section
  they keep looping. In the mobile menu the active link gets gold lines over
  and under its text.
- The 528 Hz pill has a sound dropdown (Tone + instruments), keyboard and
  screen-reader accessible (menu button, Arrow/Home/End/Enter/Escape).
- "Send your reading to Allison" form in the interpretation dialog
  (Web3Forms). The mailto draft stays as the fallback.

## Sound menu: adding an instrument (one line)
Add `{id:'<slug>',label:'<Name>'}` to `instruments` in `sound-config.js` and
upload `elev8mi-528hz-<slug>.ogg` and `.mp3` next to index.html. Files are
normalised to about -18 LUFS and share `sharedGain`; the Tone drone is set to
the same loudness. Listed instruments whose files are missing are hidden.

## Direct send form (Web3Forms): one-time activation
1. Open https://web3forms.com, enter elev8miangel@gmail.com, and create an
   access key. Web3Forms emails the key to that inbox.
2. In `form-config.js`, replace `PASTE-WEB3FORMS-ACCESS-KEY-HERE` with the key
   and re-upload `form-config.js`.
Until then, Send opens the visitor's email app with the same filled-in draft.
The form sends the name, email, optional question, reading style, and each
card's position, name, Upright/Reversed and image link. It has a honeypot
(`botcheck`) field.

## v28 changes
- Brighter, more vivid Earth (shader + CPU fallback), starfield and planets.
- Major moons orbit their planets: Phobos/Deimos, Io/Europa/Ganymede/Callisto,
  Rhea/Titan, Titania/Oberon, Triton (retrograde). Shaded toward the Sun;
  display orbits and time are compressed (period^0.5); they freeze with
  Pause motion and prefers-reduced-motion. Code: planet-moons.js.
- Nav item and hero CTA read "Tap into your energy". One- and three-card
  spreads both open the "Let Allison interpret your cards" email prompt.
- Inquiries go to elev8miangel@gmail.com via a mailto draft listing each
  card's position, name, Upright/Reversed and a link to its deck image. No
  form service (mailto cannot attach files); the dialog also offers
  "Download my cards" (a PNG of the drawn cards) the visitor may attach.
- Instagram @elev8mi and www.elev8mi.com
  are linked in the contact section and footer; canonical/og URLs use
  https://www.elev8mi.com/.
- Sound: the tuner pill has a Tone/Guitar choice. Guitar plays the seamless
  528 Hz loop (elev8mi-528hz-guitar.ogg/.mp3, CC0, see AUDIO-LICENSE.md).

## Swappable deck (custom 78-card art)
The custom ELEV8MI deck (600x1050 WebP, JPG fallbacks, one shared back.webp;
see assets/deck/deck.json and LICENSES.md) is installed in `assets/deck/`.
Card images load per card from `assets/deck/`, configured in `deck-config.js`
(`basePath`, `extension`, `version`). File names are listed in
`assets/deck/FILENAMES.txt`: `major-00-the-fool` … `major-21-the-world`
(slug of the site's card name, e.g. `major-12-the-hanged-one`),
`<suit>-01-ace` … `<suit>-10-ten`, `-11-page`, `-12-knight`, `-13-queen`,
`-14-king` for cups/wands/swords/pentacles, plus `back.webp`. Any file that is
missing falls back to the built-in atlas (tarot-atlas.webp), so cards can be
added gradually. Bump `version` when replacing files. With
`emailImageLinks:'auto'` the email draft lists a link per card to its image in
assets/deck/, built from the page's current address (works on a GitHub Pages
subpath and on www.elev8mi.com), for cards whose file actually loaded.

## Earlier changes (v27)
- Navigation uses translucent purple, blue and white glass with soft reflections.
  The rounded mobile dropdown matches the header.
- Two light trails loop continuously around the actual rounded pill perimeter,
  half a lap apart: top moves right and curves around to travel left below.
  They keep looping after link clicks and preserve their lap on screen resize.
  Pause motion and reduced motion freeze them in place.
- The nine face-down Draw cards are visible immediately, dimmed and disabled.
  Choosing a reading style shuffles and lights them up. Style, spread and shuffle
  remain editable until the first card is picked, then lock until completion.
  Reading options use uppercase Cinzel lettering. Instructions match this flow.
- Mobile orbits use a shallower oblique camera and a wider plane with real
  perspective, instead of tall loops. Foreground Earth remains an enlargement;
  the miniature mobile orbital plane is framed independently of that landmark.
- Moon and planet halos are brighter, with a softer outer bloom. Live Moon
  phase, Sun/Moon light directions, body spin and the shared pulse clock remain.
- Logo-based ICO/PNG favicons, an Apple touch icon and a 1200x630 share image
  are included. Open Graph and social-card metadata reference the GitHub Pages
  homepage and the versioned logo thumbnail. Upload these assets before sharing.

The existing Earth surface/weather animation, night opening, loader, subtle
complete orbit paths, curved Earth occlusion and interpretation dialog remain.
Earth surface rotation is six minutes; the Moon/daylight display cycle is
85.714 seconds. The interpretation email stays a reviewable mailto draft to
elev8miangel@gmail.com, with subject INTERPRET MY CARDS and selected cards.

Radial distances, sizes, camera framing and time are cinematic display scales.
Earth maps are historical satellite composites. Other globes use illustrative
photographs. Moon phase uses the device date. Credits/licenses are in assets/
and vendor/. This package is for manual upload; it does not deploy or send email.
