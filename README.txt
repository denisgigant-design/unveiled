UNVEILED BIBLE — PAGE-TURN REPAIR V5

Replace ONE file in your GitHub repository:
  book-reader.mjs  (repository root, on main)

Use the included book-reader.mjs to replace the existing file. This version
works with the existing Version 4 reader.js, book-art.mjs and index.html.
No other files need replacing.

CHANGES
- The destination page now reveals gradually in the real uncovered part of
  the old leaf (including during touch drags). It no longer flashes through
  the entire leaf as soon as a swipe starts.
- The currently turning page remains over the still-uncovered area until
  the curl lifts it away.
- The cropped single-page mobile view hinges at the right-hand spine and
  accepts ONLY left-to-right finger swipes for NEXT; the reverse swipe is
  deliberately ignored. Both arrow buttons remain available for navigation.
- A small extension of the actual irregular paper mask includes photographed
  veil/palm ornaments near the outer edge instead of using a square clip.
- Existing five book colours, two-page mobile default, one-page switch,
  Scripture pagination and slow curl duration are retained.

After GitHub Pages deploys: open the site in a fresh Chrome Incognito tab,
then test Genesis 4 with the two-page and one-page views. To see the
mask/reveal behavior, hold a drag halfway across before releasing.

Tested in Chromium at 425/430px mobile and 1100/1200px desktop widths:
forward and reverse spread turns, single-page forward swipe, disabled reverse
single-page swipe; next-page reveal remains clipped until uncovered.
The final appearance on your own Samsung phone still needs checking.
