UNVEILED BIBLE — Natural shaped-paper curl (v3)
===========================================

ONE FILE TO REPLACE: book-reader.mjs

1. Open https://github.com/denisgigant-design/unveiled
2. In the main branch, replace the existing book-reader.mjs in the ROOT
   folder with the file inside this ZIP. Commit the change.
3. Open https://denisgigant-design.github.io/unveiled/ in a fresh Chrome
   Incognito tab after the GitHub Pages publish finishes.
4. Open the Bible and test: swipe LEFT to advance, swipe RIGHT to go back,
   use the arrows for a deliberately slow full flip, or tap an outer page edge.

What changed:
- A dedicated TouchEvent gesture path makes Android swipes work even if
  pointer capture is interrupted by touch scroll handling.
- Vertical scrolling remains available; ordinary verse taps still work.
- The turn clips to the EXACT active paper contour from book-art.mjs,
  including the mobile crop, rather than turning a rectangular border.
- A strongly curved strip mesh with actual accumulated 3D depth.
- Shadows follow the paper shape and travel across the bend.
- A full turn is approximately 2.1 seconds, with gentle acceleration
  and gradual settling; partially dragged pages take proportionally less.
- Five colour themes, verse pagination and layout are left unchanged.

Only book-reader.mjs is modified. No changes are required to HTML, CSS,
reader.js or the current Bible artwork.

Note: The file has been syntax-checked and tested in Chromium with
simulated phone swipes, reverse gestures, vertical scrolling, edge taps,
verse taps, and forward/backward buttons. Production phone appearance
still requires visual confirmation after deployment.
