const frontispiece = 'assets/bible-frontispiece.png';
const assetVersion = 'unveiled36';

export const simpleBookMark = `<img class="opening-simple-mark" src="${frontispiece}?v=${assetVersion}" alt="Unveiled" width="1254" height="1254">`;

export function coverImages(colour) {
  return {
    closed: `assets/bible-front-${colour}-closed-v36.webp?v=${assetVersion}`,
    open: `assets/bible-front-${colour}-unlatched-v36.webp?v=${assetVersion}`,
    mark: `${frontispiece}?v=${assetVersion}`,
  };
}

// All ten uploads have the same 1200×1600 canvas and hardcover rectangle.
// Its left edge is the hinge, and the bookmark and clasp tips extend past it.
export function coverPortrait(source, clip) {
  const artwork = `<image href="${source}" width="1200" height="1600"${clip ? ` clip-path="url(#${clip.id})"` : ''}/>`;
  return `<svg class="opening-portrait" viewBox="195 190 810 1080" preserveAspectRatio="none" aria-hidden="true">
    ${clip ? `<defs><clipPath id="${clip.id}">${clip.shape}</clipPath></defs>` : ''}
    ${artwork}
  </svg>`;
}

export function claspMarkup({closed, open}) {
  return [0, 426].map((offset, index) => {
    // Isolate each moving arm. The hinge barrels remain on the book.
    const closedArm = '<path d="M1000 477 H917 C898 459 867 458 843 470 Q828 478 814 492 Q789 499 770 516 Q791 538 815 546 Q837 573 866 570 Q893 572 915 557 H1000 Z"/>';
    const openArm = '<rect x="1007" y="449" width="183" height="140"/>';
    const clip = (state, shape) => ({id: `opening-clasp-${index}-${state}`, shape: `<g transform="translate(0 ${offset})">${shape}</g>`});
    return `<div class="opening-clasp closed-arm">${coverPortrait(closed, clip('closed', closedArm))}</div>
      <div class="opening-clasp open-arm">${coverPortrait(open, clip('open', openArm))}</div>`;
  }).join('');
}

export function claspBase(open) {
  return coverPortrait(open, {
    id: 'opening-clasp-base',
    shape: '<rect width="1007" height="1600"/>',
  });
}
