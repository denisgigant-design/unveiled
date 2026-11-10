// Paper contours calibrated against the 1536 × 1024 supplied artwork.
// Each design has a centred spine and a matching right-hand leaf.
const paperShapes = {
  navy: `M363 106 C404 96 451 77 500 78 C558 75 610 64 654 82
    C704 98 731 119 749 168 Q768 204 768 228 L768 689
    C756 708 747 728 739 750 C716 751 705 766 696 788
    C651 792 623 801 581 798 C538 799 503 787 464 785
    C416 781 369 774 332 758 C294 743 266 716 239 683
    C222 666 215 634 214 588 L216 505
    C235 469 243 436 233 392 C227 359 222 326 235 306
    C288 284 319 242 339 191 Q356 150 363 106 Z`,
  pink: `M321 108 C375 106 420 87 480 90 C538 85 614 74 659 90
    C713 104 748 150 768 214 L768 689
    C756 709 750 736 739 753 C718 758 708 776 693 795
    C643 810 600 808 558 807 C517 804 484 809 444 799
    C401 786 362 762 324 757 C290 753 269 726 246 698
    C228 677 221 655 225 630 C206 605 209 573 209 539
    C210 491 242 467 241 408 C240 367 235 335 244 307
    C276 280 294 249 301 210 Q315 161 321 108 Z`,
  red: `M370 99 C424 93 471 75 529 78 C585 65 638 71 670 87
    C724 103 751 157 768 220 L768 698
    C752 720 744 746 734 763 C713 761 706 788 686 800
    C639 811 606 825 561 820 C505 827 458 817 416 812
    C365 803 328 778 293 763 C260 744 243 720 220 690
    C209 674 209 645 204 612 L202 526
    C212 488 235 456 224 416 C216 383 217 350 217 312
    C264 282 298 242 320 203 C345 157 358 130 370 99 Z`,
  green: `M356 108 C409 94 453 80 505 83 C562 78 620 76 664 94
    C722 111 749 160 768 234 L768 727
    C755 746 744 768 734 790 C711 790 698 813 683 822
    C646 836 612 838 574 845 C527 849 487 844 438 845
    C393 841 354 821 320 803 C283 785 262 762 245 732
    C228 704 225 676 222 646 C214 622 213 585 216 546
    C218 497 240 463 231 418 C226 381 221 343 231 311
    C274 287 303 251 325 210 Q346 163 356 108 Z`,
  purple: `M416 105 C458 93 502 83 550 78 C595 71 644 80 678 95
    C724 112 751 156 768 213 L768 688
    C753 710 743 740 730 757 C707 761 695 778 679 791
    C637 804 594 807 552 806 C506 809 472 805 430 800
    C382 800 338 787 301 772 C270 756 247 731 236 697
    C227 672 234 645 220 620 C217 590 217 552 220 513
    L222 414 C229 378 242 351 258 321 C280 292 305 261 324 229
    C360 202 391 164 416 105 Z`
};

export function openBookImage(colour) {
  return `assets/bible-open-${colour}.webp`;
}

export function bookArtwork(colour) {
  const mirror = 'translate(1536 0) scale(-1 1)';
  return `<div class="book-artwork" data-book-art="${colour}" aria-hidden="true">
    <svg viewBox="0 0 1536 1024" preserveAspectRatio="none" focusable="false">
      <defs>
        <path id="bible-paper-shape" d="${paperShapes[colour]}"/>
        <clipPath id="bible-paper-left"><use href="#bible-paper-shape"/></clipPath>
        <clipPath id="bible-paper-right"><use href="#bible-paper-shape" transform="${mirror}"/></clipPath>
        <filter id="bible-paper-feather" x="-8%" y="-8%" width="116%" height="116%">
          <feGaussianBlur stdDeviation="11"/>
        </filter>
      </defs>
      <g id="bible-painted-art">
        <use class="book-paper-fallback" href="#bible-paper-shape"/>
        <use class="book-paper-fallback" href="#bible-paper-shape" transform="${mirror}"/>
        <image data-book-art-image href="${openBookImage(colour)}" width="1536" height="1024"/>
        <use class="book-paper-dye" href="#bible-paper-shape" filter="url(#bible-paper-feather)"/>
        <use class="book-paper-dye" href="#bible-paper-shape" transform="${mirror}" filter="url(#bible-paper-feather)"/>
      </g>
    </svg>
  </div>`;
}

export function bookLeafArtwork(side) {
  const left = side === 'right' ? 768 : 0;
  return `<svg class="book-leaf-art" viewBox="${left} 0 768 1024" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <use href="#bible-painted-art" clip-path="url(#bible-paper-${side})"/>
    <rect class="book-leaf-shade" width="1536" height="1024" clip-path="url(#bible-paper-${side})"/>
  </svg>`;
}

export function syncBookArtwork(colour) {
  const artwork = document.querySelector('[data-book-art]');
  if (!artwork || artwork.dataset.bookArt === colour) return;
  artwork.querySelector('[data-book-art-image]').setAttribute('href', openBookImage(colour));
  artwork.querySelector('#bible-paper-shape').setAttribute('d', paperShapes[colour]);
  artwork.dataset.bookArt = colour;
}
