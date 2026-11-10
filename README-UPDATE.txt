UNVEILED BIBLE — V7 swipe text visibility fix

Problem fixed
  Starting a finger swipe hid the Scripture on the still-covered part
  of the page. The effect looked like a blank block or narrow, chopped
  column of text on both mobile and desktop.

Change
  - Keep the old Scripture visible on the stationary portion of the
    current leaf until the moving paper actually uncovers it.
  - Move the masking boundary exactly with the physical paper curl.
  - Do not reveal the incoming page outside the uncovered area.
  - Retain the existing decorative art, page-curl speed, 1–32px font
    settings, one-page mode, and two-page default on phones.

Upload these THREE replacement files to the ROOT of the main branch
of https://github.com/denisgigant-design/unveiled
  1. book-reader.mjs
  2. reader.js
  3. index.html

Choose Add file > Upload files (or edit/replace the corresponding files)
and commit the changes. Do NOT upload this README or test files into
root unless you want the instructions stored there.

After GitHub Pages finishes deploying, open the site in a fresh Chrome
Incognito tab and slowly drag either page a short distance. Verse text
should remain intact until the curved edge passes over it.

Note: GitHub's ChatGPT connection currently rejects writes with HTTP
403, so the files have NOT been committed by ChatGPT. You must upload.
