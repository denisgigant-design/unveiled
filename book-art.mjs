// Unveiled Bible — five user-supplied open-book layouts, dark-parchment editions.
// The SVG has the same 1536×1024 logical coordinate space as the existing
// turning-sheet mesh, but is rendered at the artwork's natural 4:3 ratio.
// Only paper moves during a turn; the clasps, binding and silver frame remain fixed.

const paperShape = `M149 45 C284 32 551 29 677 36 C733 36 762 51 768 81
 L768 838 C760 851 744 854 714 849 C638 846 569 837 500 842
 L162 850 Q135 850 134 827 L135 76 Q136 51 149 45 Z`;

export function openBookImage(colour) {
  const valid = ['navy','pink','red','green','purple'];
  return `assets/bible-open-${valid.includes(colour) ? colour : 'navy'}.webp`;
}

export function bookArtwork(colour) {
  const file=openBookImage(colour);
  return `<div class="book-artwork" data-book-art="${colour}" aria-hidden="true">
    <svg viewBox="0 0 1536 1024" preserveAspectRatio="none" focusable="false">
      <defs>
        <path id="bible-paper-shape" d="${paperShape}"/>
        <clipPath id="bible-paper-left"><use href="#bible-paper-shape"/></clipPath>
        <clipPath id="bible-paper-right"><use href="#bible-paper-shape" transform="translate(1536 0) scale(-1 1)"/></clipPath>
      </defs>
      <g id="bible-painted-art">
        <image data-book-art-image href="${file}" x="0" y="0" width="1536" height="1024" preserveAspectRatio="none"/>
      </g>
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
