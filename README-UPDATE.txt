UNVEILED BIBLE — PAGE TURN FIX V6 (10 November 2026)

Replace the following files in the ROOT of the GitHub repository:
  1. book-reader.mjs
  2. reader.js
  3. index.html

Repository: https://github.com/denisgigant-design/unveiled
Live site: https://denisgigant-design.github.io/unveiled/

Changes:
- Scripture text size minimum is now 1px, maximum remains 32px, and A−/A+ steps are 1px. The Font & page slider also allows 1px.
- Removed the artificial black spine-shadow gradient, the dark leaf overlay and the shadow on the moving page edge.
- The revealed portion of a page is now computed from the position of the curling paper strips, not a percentage of the rotation angle.
- The static old-page covering layer no longer renders a second copy of the old Scripture text. Old text stays on the turning leaf; the new page text appears underneath as it becomes exposed.
- index.html includes an import map so the unchanged app.js's older reader.js import is redirected to this updated reader.js. Cache identifiers are advanced to unveiled23.

Keep the names exactly as shown, without v6 in their filenames. Upload into the repository root (not inside a folder).
Commit the changes to main. GitHub Pages will republish automatically. In Chrome, test in a NEW incognito tab to avoid stale caches.

Note: 1px is intentionally very small and will be almost unreadable; this option is available by user request. Large font sizes still create more pages. The selected size persists in reading settings.

The files were syntax-checked with Node and the motion layers checked in Chromium simulation; actual Samsung device verification remains necessary.
