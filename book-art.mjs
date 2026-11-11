// Unveiled Bible — five user-supplied open-book layouts, dark-parchment editions.
// The SVG has the same 1536×1024 logical coordinate space as the existing
// turning-sheet mesh, but is rendered at the artwork's natural 4:3 ratio.
// Only paper moves during a turn; the clasps, binding and silver frame remain fixed.

const paperShape = `M170 52 C284 39 551 36 677 41 C733 36 762 51 768 81
 L768 838 C760 851 744 854 714 849 C638 846 569 837 500 842
 L174 850 Q155 850 155 827 L155 83 Q155 59 170 52 Z`;

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
        <path id="bible-paper-shape" d="${paperShape}"/>
        <clipPath id="bible-paper-left"><use href="#bible-paper-shape"/></clipPath>
        <clipPath id="bible-paper-right"><use href="#bible-paper-shape" transform="translate(1536 0) scale(-1 1)"/></clipPath>
      </defs>
      <g id="bible-painted-art">
        <image data-book-art-image href="${file}" x="0" y="0" width="1536" height="1024" preserveAspectRatio="none"/>
        <g fill="url(#bible-paper-darkness)">
          <use href="#bible-paper-shape" transform="translate(44 26) scale(.9 .94)"/>
          <use href="#bible-paper-shape" transform="translate(1536 0) scale(-1 1) translate(44 26) scale(.9 .94)"/>
        </g>
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
