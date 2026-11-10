UNVEILED — REALISTIC CURLING BIBLE PAGES

WHAT CHANGED
The page now bends into a continuous arc instead of rotating like a rigid sheet.
It uses 22–28 narrow, synchronized 3D sections to create a visible curl,
changing shadows and a finger-following swipe. It supports forward/back turns,
cancelled swipes, keyboard arrows and the existing one-page phone and two-page
desktop layouts. The five Bible designs, Scripture and settings are preserved.

HOW TO UPDATE YOUR LIVE WEBSITE
1. Open https://github.com/denisgigant-design/unveiled
2. In the main branch, open book-reader.mjs (in the repository root).
3. Select Edit (pencil icon), then replace the ENTIRE file with the supplied
   book-reader.mjs, or upload the new file over the old one.
4. Commit changes to the main branch.
5. Open https://denisgigant-design.github.io/unveiled/ in a new Chrome
   Incognito tab after GitHub Pages deploys.
6. In the Bible section, swipe slowly to see the bend, then try arrows both
   directions. Text should continue to sit in the selected coloured artwork.

Only book-reader.mjs needs replacing. README.txt is instructions; you do not
need to upload it to the site. No external JavaScript libraries are required.

TESTING
JavaScript syntax check: PASS.
Automated Chromium interaction checks: PASS (425px phone and 1200px desktop;
forward/backward buttons, drag movement, and cleanup after animation).
These are local UI tests, not a verification of the live GitHub Pages deployment.
