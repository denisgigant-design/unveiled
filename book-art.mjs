// Unveiled Bible — five user-supplied open-book layouts, dark-parchment editions.
// The SVG has the same 1536×1024 logical coordinate space as the existing
// turning-sheet mesh, but is rendered at the artwork's natural 4:3 ratio.
// Only paper moves during a turn; the clasps, binding and silver frame remain fixed.

// Keep the sheet inside the hardware, including the inward-pointing clasp tips.
const claspClearance = 194;
const tintInset = 'translate(55 29) scale(.87 .93)';
const paperShape = `M210 52 C284 39 551 36 677 41 C733 36 762 51 768 81
 L768 838 C760 851 744 854 714 849 C638 846 569 837 500 842
 L211 850 Q${claspClearance} 850 ${claspClearance} 827 L${claspClearance} 83 Q${claspClearance} 59 210 52 Z`;

export function openBookImage(colour) {
  const valid = ['navy','pink','red','green','purple'];
  return `assets/bible-open-${valid.includes(colour) ? colour : 'navy'}.webp`;
}

export function bookArtwork(colour) {
  const file=openBookImage(colour);
  return `<div class="book-artwork" data-book-art="${colour}" aria-hidden="true">
    <svg viewBox="0 0 1536 1024" preserveAspectRatio="none" focusable="false">
      <defs>
        <radialGradient id="bible-paper-darkness">
          <stop offset="0" stop-color="#07111f" stop-opacity=".16"/>
          <stop offset=".68" stop-color="#07111f" stop-opacity=".1"/>
          <stop offset="1" stop-color="#07111f" stop-opacity="0"/>
        </radialGradient>
        <clipPath id="bible-clasp-clearance">
          <rect width="${claspClearance}" height="1024"/>
          <rect x="${1536-claspClearance}" width="${claspClearance}" height="1024"/>
        </clipPath>
        <path id="bible-paper-shape" d="${paperShape}"/>
        <clipPath id="bible-paper-left"><use href="#bible-paper-shape"/></clipPath>
        <clipPath id="bible-paper-right"><use href="#bible-paper-shape" transform="translate(1536 0) scale(-1 1)"/></clipPath>
      </defs>
      <g id="bible-painted-art">
        <image id="bible-raw-art" data-book-art-image href="${file}" x="0" y="0" width="1536" height="1024" preserveAspectRatio="none"/>
        <g fill="url(#bible-paper-darkness)">
          <use href="#bible-paper-shape" transform="${tintInset}"/>
          <use href="#bible-paper-shape" transform="translate(1536 0) scale(-1 1) ${tintInset}"/>
        </g>
      </g>
    </svg>
  </div>
  <div class="book-clasp-guard" aria-hidden="true">
    <svg viewBox="0 0 1536 1024" preserveAspectRatio="none" focusable="false">
      <use href="#bible-raw-art" clip-path="url(#bible-clasp-clearance)"/>
    </svg>
  </div>`;
}

export function bookLeafArtwork(side) {
  const left=side==='right'?768:0;
  return `<svg class="book-leaf-art" viewBox="${left} 0 768 1024" preserveAspectRatio="none" aria-hidden="true" focusable="false">
     <use href="#bible-painted-art" clip-path="url(#bible-paper-${side})"/>
  </svg>`;
}

export function syncBookArtwork(colour) {
  const artwork=document.querySelector('[data-book-art]');
  if(!artwork||artwork.dataset.bookArt===colour)return;
  artwork.querySelector('[data-book-art-image]')?.setAttribute('href',openBookImage(colour));
  artwork.dataset.bookArt=colour;
}
