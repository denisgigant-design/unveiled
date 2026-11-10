UNVEILED — CONTINUOUS BIBLE PAGE-TURN FIX

TARGET REPOSITORY: https://github.com/denisgigant-design/unveiled
TARGET BRANCH: main
TARGET FILE: book-reader.mjs (repository root)

This package contains a tested, complete REPLACEMENT for book-reader.mjs.
It preserves the book colours, measurements, verse formatting and existing
reader exports while replacing the split swipe/release mechanism with one
persistent 3D page-turn scene.

INSTALL:
  1. In GitHub, open denisgigant-design/unveiled (main).
  2. Replace the root file book-reader.mjs with the one in this package.
  3. Commit the change to main. Do not rename the file or place it in assets/.
  4. Refresh the live website and test Bible forward/backward swipes.

The connected GitHub integration returned HTTP 403 to both the file-write and
Git-data-write endpoints, so this package was not automatically deployed.

VERIFICATION DONE:
  - JavaScript syntax: node --check
  - Chromium DOM/browser test at 1180px and 420px: same sheet between drag
    and final animation, backward turns, arrow turns, abandoned swipes.
  - Reduced-motion behavior: desktop and mobile scenarios pass.

Note: Tests validate the animation engine in a representative DOM harness;
full GitHub Pages artwork and actual phone testing remain unverified until
this replacement is uploaded to the website.
