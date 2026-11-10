# Unveiled

**[Open the live Unveiled website](https://denisgigant-design.github.io/unveiled/)**

A responsive website for Scripture, music, Bible games, prayer, history and outreach.

## Hosting and control

This repository belongs to **denisgigant-design**. The public website is served by GitHub Pages from the `main` branch, root folder. Changes committed to this branch update the website automatically after GitHub finishes deploying. No domain purchase or build step is needed.

## Refinement update

The supplied Unveiled badge is used unchanged, with a palm-and-cross wordmark, veil-inspired colours and a members area. Bible sheets keep a compact, near-square shape; text is measured against the available space and flows into additional pages as font size increases. Reading anchors survive text-size changes. Long verses continue across sheets without losing text. Page turns use a layered 3D animation. Background motion and control effects can be paused with the star button; reduced-motion preferences are respected.

## Music player and appearance

YouTube embeds open in a navy Unveiled player with the original badge, palm-and-cross wordmark, gold trim and a subtle animated veil-colour border. The frame surrounds the embed and leaves YouTube controls intact. The topbar moon/sun button switches the entire site between light and dark appearances, including the default Bible paper, dialogs, forms, maps and cards. It follows device appearance until a visitor chooses a mode, then saves that choice on this browser. The existing motion switch also pauses the player border animation.

## Unveiled visual update

The Music Room uses the supplied gold knight artwork and animated light, waveform and dial details around the branded YouTube player. The player is visible in the room from the start. Add a YouTube video to play it inline; choose saved videos from the listening shelf. No album covers or unconnected social feed are shown. The homepage combines a book feature, journal and game rows, an editorial Scripture image and outreach photography. The original teaching pictures appear together under “Dennis & Alex — Discipled in the Word”, without assigning names to individual portraits. The outreach section uses all three supplied crowd images. Original images are copied unchanged and can be opened at full size.

The simple cross-and-veil logo guides a code-native SVG mark and custom section icons. A short, skippable opening veil runs once per tab on the homepage, with a replay control. Bible navigation begins with a leather-style opening cover; saved passages and search open the reader directly. The cover can be reopened without clearing reading progress. Motion settings and reduced-motion preferences apply to the new details.

## Included

- Complete 66-book Bible reader: KJV, ASV 1901 and Polish Biblia Gdańska 1881.
- Animated page turns, reference and full-text search, bookmarks, coloured highlights, font and brightness controls.
- Unveiled Music artwork and a personal media shelf.
- Made Whole body, soul and spirit quiz and Scripture matching game.
- Prayer journal, reflections, intercessions and browser-local backup/restore.
- Biblical history maps, outreach plans and three free printable resources.

## Personal data

Journal entries, highlights, bookmarks, media links and outreach plans stay in the visitor's browser local storage under `unveiled.v1.`. They are not stored in this repository, sent to a server or shared with other visitors. They do not sync between devices or hosting addresses. Use **Your personal space → Export my backup** to move saved data between devices or website addresses.

Live social feeds and paid checkout are not connected. The resource shop currently offers free HTML printables.

## Development

The site uses plain HTML, CSS and JavaScript modules. Serve this folder over HTTP to preview it. Run `node checks.mjs` and `node book-checks.mjs` to validate Bible pagination, passage references, backup validation, game data, maps and resources. No dependencies are required.

Bible text and map sources are linked in the site's About dialog and `data/sources.json`. Scripture is presented separately from teaching commentary. Map locations are approximate; lines show the sequence of places rather than exact travel paths.

### Bible word study

Open the reader and choose **Word study**, or select a verse and choose **Study words**. The study panel gives an English gloss in context, transliteration, and a short lexicon entry when available. It uses Hebrew and Aramaic for the Old Testament and Greek Textus Receptus readings for the New Testament. The original text is shown by passage, with reference adjustments for known differences across the reader editions. The Hebrew spelling lookup checks vowel-pointed and unpointed forms recorded in the Hebrew corpus, and suggests forms one edit away.

Word data comes from TAHOT, TAGNT, TBESH, and TBESG at [STEPBible.org and Tyndale House Cambridge](https://STEPBible.github.io/STEPBible-Data/), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The generated files use [source revision `5de0a47`](https://github.com/STEPBible/STEPBible-Data/tree/5de0a47f35f0fc13dfe1430d104e5db8a4285f9c). The converter selects the primary Hebrew readings and TR Greek readings, regularizes Unicode and punctuation, removes Hebrew cantillation, extracts brief glosses, and indexes original spellings and references. The reader loads compressed data on demand.

Run `python3 build-word-study.py /path/to/STEPBible-Data` from this checkout to regenerate the study data. Run `node word-study-checks.mjs` to verify coverage and spelling behavior.
