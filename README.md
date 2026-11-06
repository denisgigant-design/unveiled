# Unveiled

**[Open the live Unveiled website](https://denisgigant-design.github.io/unveiled/)**

A responsive website for Scripture, music, Bible games, prayer, history and outreach.

## Hosting and control

This repository belongs to **denisgigant-design**. The public website is served by GitHub Pages from the `main` branch, root folder. Changes committed to this branch update the website automatically after GitHub finishes deploying. No domain purchase or build step is needed.

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

The site uses plain HTML, CSS and JavaScript modules. Serve this folder over HTTP to preview it. Run `node checks.mjs` to validate Bible pagination, passage references, backup validation, game data, maps and resources. No dependencies are required.

Bible text and map sources are linked in the site's About dialog and `data/sources.json`. Scripture is presented separately from teaching commentary. Map locations are approximate; lines show the sequence of places rather than exact travel paths.
