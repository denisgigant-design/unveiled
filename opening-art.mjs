export const simpleBookMark=`<svg class="opening-simple-mark" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"><path d="M58 12h4v91h-4zM43 33h34v4H43z"/><path d="M53 44C50 65 38 78 13 88v12c25-9 39-24 40-56ZM67 44c3 21 15 34 40 44v12c-25-9-39-24-40-56Z"/></g></svg>`;
const bounds={navy:[[120,120,880,1115],[115,125,790,1060]],green:[[98,55,940,1195],[100,110,840,1130]],red:[[105,100,920,1160],[95,130,830,1115]],pink:[[100,85,945,1200],[90,125,850,1135]],purple:[[105,90,940,1190],[90,100,835,1160]]};
let n=0;
export function coverPortrait(colour,open=false){
 const [x,y,w,h]=(bounds[colour]||bounds.navy)[open?1:0],id='front-cut-'+(++n);
 const right=x+w,top=y+h*.22,bottom=y+h*.64;
 return `<svg class="opening-portrait" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="none" overflow="visible" aria-hidden="true"><defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="35"/><rect x="${right-210}" y="${top}" width="${1152-right+210}" height="${h*.15}"/><rect x="${right-210}" y="${bottom}" width="${1152-right+210}" height="${h*.16}"/><path d="M${x+w*.16} ${y+h-15}h${w*.15}v${1536-y-h+15}l${-w*.075} -40 -${w*.075} 40Z"/></clipPath></defs><image href="assets/bible-front-${colour}-${open?'unlatched':'closed'}.webp" width="1152" height="1536" clip-path="url(#${id})"/></svg>`;
}
