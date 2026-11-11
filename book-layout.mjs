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
      // Fill the current leaf before continuing a long verse on the next.
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

// Balance the last spread by its actual text height, including the chapter
// heading. Earlier leaves stay full; no Scripture is added, removed or reordered.
export function balanceFinalSpread(pages, measure) {
  const first=pages.length%2?pages.length-1:pages.length-2;
  if(first<0)return pages;
  const parts=[];
  for(const part of pages.slice(first).flat()){
    const previous=parts.at(-1);
    if(previous&&previous.v===part.v&&previous.end===part.start){
      previous.text+=part.text;previous.end=part.end;
    }else parts.push({...part});
  }
  const cuts=[];
  let total=0;
  for(const part of parts){
    for(const match of part.text.matchAll(/\s+/g))cuts.push(total+match.index+match[0].length);
    total+=part.text.length;cuts.push(total);
  }
  const candidates=[...new Set(cuts)].filter(cut=>cut>0&&cut<total);
  const split=cut=>{
    const left=[],right=[];
    let offset=0;
    for(const part of parts){
      const n=Math.max(0,Math.min(part.text.length,cut-offset));
      if(n)left.push({...part,text:part.text.slice(0,n),end:part.start+n});
      if(n<part.text.length)right.push({...part,text:part.text.slice(n),start:part.start+n});
      offset+=part.text.length;
    }
    return [left,right];
  };
  let lo=0,hi=candidates.length-1,best=null,error=Infinity;
  while(lo<=hi){
    const mid=(lo+hi)>>1,[left,right]=split(candidates[mid]);
    const a=measure(left,first),b=measure(right,first+1),delta=a.used-b.used;
    if(a.used<=a.capacity&&b.used<=b.capacity&&Math.abs(delta)<error){
      best=[left,right];error=Math.abs(delta);
    }
    if(a.used>a.capacity||delta>0)hi=mid-1;
    else lo=mid+1;
  }
  return best?[...pages.slice(0,first),...best]:pages;
}

export function pageForAnchor(pages, anchor, spread = 1) {
  if (!anchor) return 0;
  let page = pages.findIndex(parts => parts.some(p => p.v === anchor.verse &&
    p.start <= (anchor.offset || 0) && p.end > (anchor.offset || 0)));
  if (page < 0) page = pages.findIndex(parts => parts.some(p => p.v === anchor.verse));
  return Math.floor(Math.max(0, page) / spread) * spread;
}

