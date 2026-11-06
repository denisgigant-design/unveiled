import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {paginateMeasured,pageForAnchor} from './book-layout.mjs';

let checked=0;
for(const version of ['kjv','asv','bg']) {
  const bible=JSON.parse(readFileSync('data/'+version+'.json','utf8'));
  for(const book of bible) for(const chapter of book.chapters) {
    // Different capacities model compact pages, very large type, and a chapter heading.
    for(const capacity of [110,350,800]) {
      const fits=(parts,index)=>parts.reduce((n,p)=>n+p.text.length+8,0)<=capacity-(index===0?30:0);
      const pages=paginateMeasured(chapter,fits);
      for(const [index,page]of pages.entries())assert.ok(fits(page,index),'Page exceeds its capacity');
      chapter.forEach((text,index)=>{
        const parts=pages.flat().filter(p=>p.v===index+1);
        assert.equal(parts.map(p=>p.text).join(''),text,'A Scripture character changed or disappeared');
        let offset=0;
        for(const p of parts){assert.equal(p.start,offset);assert.equal(p.end,p.start+p.text.length);offset=p.end;}
      });
      for(let i=0;i<pages.length;i++) {
        const first=pages[i][0];
        if(first)assert.equal(pageForAnchor(pages,{verse:first.v,offset:first.start}),i);
      }
      checked++;
    }
  }
}
const long=['word '.repeat(150),'z'.repeat(230)];
const pages=paginateMeasured(long,parts=>parts.reduce((n,p)=>n+p.text.length,0)<=47);
assert.equal(pages.flat().filter(p=>p.v===1).map(p=>p.text).join(''),long[0]);
assert.equal(pages.flat().filter(p=>p.v===2).map(p=>p.text).join(''),long[1]);
assert.equal(pageForAnchor(pages,{verse:2,offset:120},2)%2,0);
console.log('Passed '+checked+' chapter layouts: every character and verse number survives splitting; pages fit and reading anchors survive reflow.');

