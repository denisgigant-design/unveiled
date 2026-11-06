// Keep Scripture intact while fitting real, measured book pages.
export function paginateMeasured(verses, fits) {
  const pages = [];
  let page = [];
  const finish = () => { if (page.length) { pages.push(page); page = []; } };
  verses.forEach((text, index) => {
    if (!text) return;
    let start = 0;
    while (start < text.length) {
      const part = {v: index + 1, text: text.slice(start), start, end: text.length};
      if (fits([...page, part], pages.length)) { page.push(part); break; }
      // Keep a verse together when it fits on a fresh page.
      if (page.length && fits([part], pages.length + 1)) { finish(); continue; }
      const rest = text.slice(start);
      const breaks = [...rest.matchAll(/\s+/g)].map(m => m.index + m[0].length);
      if (breaks.at(-1) !== rest.length) breaks.push(rest.length);
      let lo = 0, hi = breaks.length - 1, cut = 0;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1, n = breaks[mid];
        const fragment = {...part, text: rest.slice(0, n), end: start + n};
        if (fits([...page, fragment], pages.length)) { cut = n; lo = mid + 1; }
        else hi = mid - 1;
      }
      if (!cut && page.length) { finish(); continue; }
      // A single long word can also wrap, without losing any characters.
      if (!cut) {
        lo = 1; hi = rest.length;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          if (fits([{...part, text: rest.slice(0, mid), end: start + mid}], pages.length)) {
            cut = mid; lo = mid + 1;
          } else hi = mid - 1;
        }
      }
      if (!cut) throw new RangeError('The book page is too small to hold text.');
      page.push({...part, text: rest.slice(0, cut), end: start + cut});
      start += cut;
      finish();
    }
  });
  finish();
  return pages.length ? pages : [[]];
}

export function pageForAnchor(pages, anchor, spread = 1) {
  if (!anchor) return 0;
  let page = pages.findIndex(parts => parts.some(p => p.v === anchor.verse &&
    p.start <= (anchor.offset || 0) && p.end > (anchor.offset || 0)));
  if (page < 0) page = pages.findIndex(parts => parts.some(p => p.v === anchor.verse));
  return Math.floor(Math.max(0, page) / spread) * spread;
}
