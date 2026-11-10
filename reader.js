import {EN_BOOKS,PL_BOOKS,VERSIONS,esc,adjacentChapter,parseReference} from './core.mjs';
import {pageForAnchor} from './book-layout.mjs';
import {measureBook,animateBookTurn,bindBookSwipe,bookColour,bookColourChoices,bookViewMode,bookViewChoices,paperHeading} from './book-reader.mjs?v=unveiled23';
import {bookArtwork,bookLeafArtwork,openBookImage} from './book-art.mjs?v=unveiled16';
import {openWordStudy} from './word-study.mjs?v=unveiled18';
const cache=new Map();
const textSize={min:1,max:32,step:1,initial:18};
const clampSize=value=>Math.max(textSize.min,Math.min(textSize.max,Number(value)||textSize.initial));
export async function loadBible(version){
 if(!cache.has(version))cache.set(version,fetch(`data/${version}.json`).then(r=>{if(!r.ok)throw Error();return r.json();}).catch(e=>{cache.delete(version);throw e;}));
 return cache.get(version);
}
export function createReader(ctx){
 ctx.readerPageView='spread'; // Every Bible opening defaults to two visible pages.
 const readingState=()=>({book:42,chapter:1,page:0,version:'kjv',...ctx.read('reading',{})});
 let root,bible,run=0,selected=0,busy=false,pages=[],s=readingState();
 const names=()=>s.version==='bg'?PL_BOOKS:EN_BOOKS;
 const step=()=>bookViewMode(ctx)==='single'?1:2;
 const settings=()=>{
  const saved=ctx.read('reader-settings',{});
  // An unsaved mobile two-page spread starts at legible small type, with
  // Scripture reflow measured against the actual narrow paper panels.
  const defaultSize=matchMedia('(max-width:600px)').matches&&step()===2?10:textSize.initial;
  return {font:'georgia',theme:'paper',brightness:100,...saved,size:clampSize(saved?.size??defaultSize)};
 };
 const key=v=>`${s.version}:${s.book}:${s.chapter}:${v}`;
 let pendingAnchor=null,pendingEnd=false;
 function currentAnchor(){const first=pages[s.page]?.[0];return first?{verse:first.v,offset:first.start||0}:s.anchor||{verse:1,offset:0};}
 function paginateCurrent(verse){pendingAnchor=verse?{verse,offset:0}:s.anchor||currentAnchor();}
 const selectionTip='<p class="reader-tip">Swipe sideways or use the arrows to turn a page. Tap a verse to study its words, highlight it or save it.</p>';
 function pageStatus(){
  const label=step()===2&&s.page+1<pages.length?`Pages ${s.page+1}–${s.page+2}`:`Page ${s.page+1}`;
  return label+` of ${pages.length}`;
 }
 function pageAvailable(dir){
  const inChapter=dir<0?s.page>0:s.page+step()<pages.length;
  return inChapter||Boolean(adjacentChapter(bible,s.book,s.chapter,dir));
 }
 function paperMarkup(){
  const highlights=ctx.read('highlights',{}),saved=ctx.read('bookmarks',[]);
  return Array.from({length:step()},(_,side)=>{
   const index=s.page+side,page=pages[index],leaf=side?'right':'left';
   const leafArt=bookLeafArtwork(leaf);
   if(!page)return `<article class="paper-page quiet-page" data-leaf="${leaf}">${leafArt}
    <div class="book-page-content"><span class="small-label">TAKE A MOMENT</span><p>Read. Reflect.<br>Let the Word take root.</p><span>✧</span></div>
   </article>`;
   const verses=page.map(verse=>{
    const bookmarked=saved.some(mark=>mark.version===s.version&&mark.book===s.book&&mark.chapter===s.chapter&&mark.verse===verse.v);
    const colour=highlights[key(verse.v)];
    return `<button class="verse-line ${selected===verse.v?'verse-selected':''} ${bookmarked?'is-bookmarked':''}"
     data-verse="${verse.v}" data-offset="${verse.start||0}" aria-label="Verse ${verse.v}${verse.start?' continued':''}: ${esc(verse.text)}">
     <sup>${verse.v}</sup><span class="${colour?'highlight highlight-'+esc(colour):''}">${esc(verse.text)}</span></button>`;
   }).join('');
   return `<article class="paper-page" data-leaf="${leaf}">${leafArt}
    <div class="book-page-content">
     ${paperHeading(names()[s.book],VERSIONS[s.version].short,index===0?s.chapter:null)}
     <div class="verse-text">${verses}</div><div class="page-number">${index+1}</div>
    </div>
   </article>`;
  }).join('');
 }
 function previewTurn(dir){
  // Render the *actual destination* before the reader replaces its DOM. This
  // makes the backside and the pages underneath visible while dragging.
  const previous={book:s.book,chapter:s.chapter,page:s.page};
  const previousPages=pages;
  const count=step();
  try{
   if(dir>0&&s.page+count<pages.length){s.page+=count;}
   else if(dir<0&&s.page>0){s.page=Math.max(0,s.page-count);}
   else{
    const next=adjacentChapter(bible,s.book,s.chapter,dir);
    if(!next)return null;
    const page=root?.querySelector('.book-spread > .paper-page .book-page-content');
    if(!page)return null;
    const newPages=measureBook(bible[next.book].chapters[next.chapter-1],page,settings(),{
     book:(s.version==='bg'?PL_BOOKS:EN_BOOKS)[next.book],
     edition:VERSIONS[s.version].short,chapter:next.chapter
    });
    if(!newPages)return null;
    s.book=next.book;s.chapter=next.chapter;pages=newPages;
    s.page=dir>0?0:Math.floor((pages.length-1)/count)*count;
   }
   const holder=document.createElement('template');
   holder.innerHTML=paperMarkup();
   return [...holder.content.children];
  } finally{
   s.book=previous.book;s.chapter=previous.chapter;s.page=previous.page;pages=previousPages;
  }
 }
 function draw({pagesOnly=false}={}){
  if(ctx.route!=='bible'||!bible||!ctx.bibleOpened)return;
  const place=pendingAnchor||s.anchor||currentAnchor(),ending=pendingEnd;
  if(pagesOnly){
   root.querySelector('.book-spread').innerHTML=paperMarkup();
   root.querySelector('#page-status').textContent=pageStatus();
   root.querySelector('#selected-tools').innerHTML=selectionTip;
   root.querySelectorAll('[data-turn]').forEach(button=>{button.disabled=!pageAvailable(+button.dataset.turn);});
  }else{
   let paper=root.querySelector('.book-spread > .paper-page .book-page-content');
   if(!paper){paint();paper=root.querySelector('.book-spread > .paper-page .book-page-content');}
   const measured=measureBook(bible[s.book].chapters[s.chapter-1],paper,settings(),{
    book:names()[s.book],edition:VERSIONS[s.version].short,chapter:s.chapter
   });
   if(measured){
    pages=measured;
    s.page=ending?Math.floor((pages.length-1)/step())*step():pageForAnchor(pages,place,step());
   }
   paint();
  }
  pendingAnchor=null;pendingEnd=false;
  s.anchor=ending?currentAnchor():place;
  ctx.save('reading',s);
 }
 function changeSize(value){
  const o={...settings(),size:clampSize(value)};
  pendingAnchor=s.anchor||currentAnchor();ctx.save('reader-settings',o);draw();
 }
 function paint(){
  if(ctx.route!=='bible'||!bible||!ctx.bibleOpened)return;
  const opts=settings();
  const font={georgia:'Georgia,serif',palatino:'Palatino,serif',sans:'system-ui,sans-serif'}[opts.font]||'Georgia,serif';
  root.innerHTML=`<div class="page-heading reader-heading"><div><p class="eyebrow">THE WORD, ONE PAGE AT A TIME</p><h1>Open the book.</h1><p>A little space. A deeper understanding.</p></div><span class="pill">66 books · English & Polish</span></div>
<section id="reader-workspace">
 <div class="reader-toolbar">
  <div class="passage-select"><label>Book<select id="reader-book" aria-label="Bible book">${names().map((n,i)=>`<option value="${i}" ${i===s.book?'selected':''}>${n}</option>`).join('')}</select></label>
   <label>Chapter<select id="reader-chapter" aria-label="Chapter">${Array.from({length:bible[s.book].chapters.length},(_,i)=>`<option ${i+1===s.chapter?'selected':''}>${i+1}</option>`).join('')}</select></label>
  </div>
  <div class="reader-actions"><label class="sr-only" for="reader-version">Translation</label><select id="reader-version">${Object.entries(VERSIONS).map(([id,v])=>`<option value="${id}" ${id===s.version?'selected':''}>${v.short} · ${v.lang==='pl'?'Polski':v.name}</option>`).join('')}</select>
   <button class="icon-button" data-search aria-label="Search the Bible">${ctx.icon('search')}</button>
   <button class="icon-button" data-saved aria-label="Saved verses">${ctx.icon('bookmark')}</button>
   <button class="icon-button" data-settings aria-label="Reading settings">${ctx.icon('settings')}</button>
  </div>
 </div>
 <div class="reader-size-bar"><span>Make yourself comfortable</span><div class="reader-size-controls">
  <button class="type-step" data-font-step="-1" ${opts.size<=textSize.min?'disabled':''} aria-label="Decrease Bible text size">A−</button>
  <output id="reader-size-value">${opts.size}px</output>
  <button class="type-step" data-font-step="1" ${opts.size>=textSize.max?'disabled':''} aria-label="Increase Bible text size">A+</button>
  <button class="plain-link" data-settings>Font &amp; page</button>
  <button class="small-button reader-word-study" data-word-study>${ctx.icon('book')} Word study</button>
  <button class="plain-link return-to-cover" data-reader-cover aria-label="Close the Bible to its cover">${ctx.icon('book')} Cover</button>
 </div></div>
 ${bookColourChoices(ctx)}${bookViewChoices(ctx)}
 <div class="book-heading"><span id="reader-location" class="small-label">${names()[s.book]} ${s.chapter}</span><span class="small-label">THE HOLY BIBLE</span></div>
 <div class="book-luminosity" style="--page-brightness:${opts.brightness/100}"><div class="book-shell" data-paper-tone="${opts.theme}" data-book-view="${bookViewMode(ctx)}">
  ${bookArtwork(bookColour(ctx))}
  <div class="book-spread" data-theme="${opts.theme}" style="--reader-size:${opts.size}px;--reader-font:${font}">${paperMarkup()}</div>
 </div></div>
 <div class="page-controls"><button class="round-button" data-turn="-1" aria-label="Previous page" ${pageAvailable(-1)?'':'disabled'}>${ctx.icon('chevron','flipped')}</button>
  <span id="page-status" aria-live="polite">${pageStatus()}</span>
  <button class="round-button" data-turn="1" aria-label="Next page" ${pageAvailable(1)?'':'disabled'}>${ctx.icon('chevron')}</button>
 </div>
 <div id="selected-tools">${selected?`<div class="verse-selection"><span>${names()[s.book]} ${s.chapter}:${selected}</span><div class="highlight-colours">${['gold','green','blue','pink'].map(c=>`<button class="colour-dot ${c}" data-highlight="${c}" aria-label="Highlight ${c}"></button>`).join('')}<button class="colour-dot clear" data-highlight="none" aria-label="Remove highlight">×</button></div><button class="small-button reader-word-study" data-word-study>${ctx.icon('book')} Study words</button><button class="small-button" data-bookmark>${ctx.icon('bookmark')} Save verse</button><button class="icon-button" data-copy aria-label="Copy selected verse">${ctx.icon('copy')}</button><button class="icon-button" data-deselect aria-label="Clear verse selection">×</button></div>`:selectionTip}</div>
 <p class="fine-print reader-source">Larger text makes more pages. Your place is remembered.<br>KJV · ASV 1901 · Biblia Gdańska 1881. Verse numbering follows the selected edition. <button class="plain-link" data-about>Text sources</button></p>
</section>`;
  const host=root.querySelector('#reader-workspace');
  host.addEventListener('change',event=>{
   if(event.target.id==='reader-version'){
    s.anchor=currentAnchor();s.version=event.target.value;s.page=0;selected=0;ctx.save('reading',s);render(root);
   }else if(event.target.id==='reader-book'||event.target.id==='reader-chapter'){
    if(event.target.id==='reader-book'){s.book=+event.target.value;s.chapter=1;}
    else s.chapter=+event.target.value;
    s.page=0;selected=0;paginateCurrent(1);draw();
   }
  });
  host.addEventListener('click',async event=>{
   const b=event.target.closest('button');if(!b)return;
   if(b.dataset.bookView){
    const choice=b.dataset.bookView==='single'?'single':'spread';
    if(choice!==bookViewMode(ctx)){
     if(choice==='spread'&&matchMedia('(max-width:600px)').matches&&settings().size>12){
      ctx.save('reader-settings',{...settings(),size:12});
     }
     paginateCurrent();ctx.readerPageView=choice;draw();
    }
    return;
   }
   if(b.dataset.turn)turn(+b.dataset.turn);
   if(b.dataset.fontStep)changeSize(settings().size+textSize.step*(+b.dataset.fontStep));
   if(b.dataset.verse){selected=+b.dataset.verse;pendingAnchor={verse:selected,offset:+b.dataset.offset||0};draw();}
   if(b.hasAttribute('data-deselect')){selected=0;draw();}
   if(b.dataset.highlight){const all=ctx.read('highlights',{});if(b.dataset.highlight==='none')delete all[key(selected)];else all[key(selected)]=b.dataset.highlight;ctx.save('highlights',all);draw();ctx.toast('Highlight saved.');}
   if(b.hasAttribute('data-bookmark')){
    const all=ctx.read('bookmarks',[]);
    if(!all.some(mark=>mark.version===s.version&&mark.book===s.book&&mark.chapter===s.chapter&&mark.verse===selected)){
     all.unshift({version:s.version,book:s.book,chapter:s.chapter,verse:selected,text:bible[s.book].chapters[s.chapter-1][selected-1]});
     ctx.save('bookmarks',all);ctx.toast('Verse saved.');draw();
    }else ctx.toast('This verse is already saved.');
   }
   if(b.hasAttribute('data-copy')){
    const text=`${bible[s.book].chapters[s.chapter-1][selected-1]} — ${names()[s.book]} ${s.chapter}:${selected} (${VERSIONS[s.version].short})`;
    try{await navigator.clipboard.writeText(text);ctx.toast('Verse copied.');}
    catch{ctx.modal('Copy this verse',`<textarea readonly class="copy-verse">${esc(text)}</textarea>`);}
   }
   if(b.hasAttribute('data-word-study'))study();
   if(b.hasAttribute('data-search'))search();
   if(b.hasAttribute('data-saved'))bookmarks();
   if(b.hasAttribute('data-settings'))preferences();
  });
  bindBookSwipe(host.querySelector('.book-spread'),canTurn,turn,previewTurn);
 }
 function study(){
  openWordStudy(ctx,{
   book:s.book,bookName:names()[s.book],chapter:s.chapter,verse:selected||currentAnchor().verse,
   version:s.version,verseTexts:bible[s.book].chapters[s.chapter-1]
  });
 }
 function canTurn(dir){
  if(busy||ctx.route!=='bible'||!bible||!root?.querySelector('.book-spread'))return false;
  return pageAvailable(dir);
 }
 async function turn(dir,angle=0){
  if(!canTurn(dir))return;
  busy=true;
  const count=step();
  const oldPages=[...root.querySelectorAll('.book-spread > .paper-page')].map(p=>p.cloneNode(true));
  try{
   selected=0;
   if(dir>0&&s.page+count<pages.length){
    s.page+=count;pendingAnchor=currentAnchor();draw({pagesOnly:true});
   }else if(dir<0&&s.page>0){
    s.page=Math.max(0,s.page-count);pendingAnchor=currentAnchor();draw({pagesOnly:true});
   }else{
    const next=adjacentChapter(bible,s.book,s.chapter,dir);
    if(!next)return;
    const focusDirection=document.activeElement?.dataset.turn;
    s.book=next.book;s.chapter=next.chapter;s.page=0;
    pendingAnchor={verse:1,offset:0};pendingEnd=dir<0;
    draw();
    if(focusDirection)root.querySelector(`[data-turn="${focusDirection}"]`)?.focus({preventScroll:true});
   }
   await animateBookTurn(root.querySelector('.book-spread'),oldPages,count,dir,angle);
  }finally{busy=false;}
 }
 function bookmarks(){
  const all=ctx.read('bookmarks',[]);
  ctx.modal('Your saved verses',all.length?
   `<div class="saved-verses">${all.map((b,i)=>`<div class="saved-verse"><button data-passage="${b.book},${b.chapter},${b.verse},${b.version}"><span class="small-label">${VERSIONS[b.version].short}</span><strong>${(b.version==='bg'?PL_BOOKS:EN_BOOKS)[b.book]} ${b.chapter}:${b.verse}</strong><span>${esc(b.text)}</span></button><button class="icon-button" data-remove-bookmark="${i}" aria-label="Remove saved verse">×</button></div>`).join('')}</div>`:
   '<div class="empty-state"><h3>Keep a verse close.</h3><p>Select a verse in the reader and choose Save verse.</p></div>',
   body=>body.addEventListener('click',event=>{
    const b=event.target.closest('[data-remove-bookmark]');
    if(b){ctx.save('bookmarks',all.filter((_,i)=>i!==+b.dataset.removeBookmark));bookmarks();draw();}
   })
  );
 }
 function preferences(){
  const o=settings();
  ctx.modal('Make this space yours',
   `<p class="muted">The book keeps its shape. Larger text flows into more pages.</p><form class="settings-form"><label>Typeface<select name="font"><option value="georgia">Classic serif · Georgia</option><option value="palatino">Book serif · Palatino</option><option value="sans">Clean sans serif</option></select></label><label>Text size <output id="size-out">${o.size}px</output><input type="range" name="size" min="${textSize.min}" max="${textSize.max}" value="${o.size}"></label><label>Page tone<select name="theme"><option value="paper">Coloured parchment</option><option value="sepia">Warm dark</option><option value="night">Quiet night</option></select></label><label>Brightness <output id="bright-out">${o.brightness}%</output><input type="range" name="brightness" min="55" max="110" value="${o.brightness}"></label></form><p class="fine-print">Your choices are remembered in this browser.</p>`,
   body=>{
    const form=body.querySelector('form');
    form.elements.font.value=o.font;form.elements.theme.value=o.theme;
    form.oninput=()=>{
     const data=new FormData(form);
     const next={font:data.get('font'),size:+data.get('size'),theme:data.get('theme'),brightness:+data.get('brightness')};
     ctx.save('reader-settings',next);
     body.querySelector('#size-out').textContent=next.size+'px';
     body.querySelector('#bright-out').textContent=next.brightness+'%';
     paginateCurrent();draw();
    };
   }
  );
 }
 function search(){
  ctx.modal('Find it in the Word',
   `<form class="search-form"><div class="search-input">${ctx.icon('search')}<label class="sr-only" for="bible-query">Passage or words</label><input id="bible-query" type="search" placeholder="John 3:16, Psalm 23, or a word…" autocomplete="off"><button class="button small">Find</button></div><p class="fine-print">Searching ${VERSIONS[s.version].name}. Use at least 3 letters for a word search.</p></form><div id="search-results" class="search-results"></div>`,
   body=>{
    body.querySelector('form').onsubmit=event=>{
     event.preventDefault();
     const q=body.querySelector('input').value.trim(),ref=parseReference(q,bible),result=[];
     if(ref)result.push({...ref,text:bible[ref.book].chapters[ref.chapter-1][ref.verse-1]});
     else if(q.length>=3){
      outer:for(let b=0;b<bible.length;b++)for(let c=0;c<bible[b].chapters.length;c++)for(let v=0;v<bible[b].chapters[c].length;v++){
       const text=bible[b].chapters[c][v];
       if(text.toLocaleLowerCase().includes(q.toLocaleLowerCase())){
        result.push({book:b,chapter:c+1,verse:v+1,text});if(result.length===40)break outer;
       }
      }
     }
     body.querySelector('#search-results').innerHTML=result.length?
      `${result.length===40?'<p class="fine-print">First 40 matches. Add more words to narrow your search.</p>':''}${result.map(r=>`<button class="search-result" data-passage="${r.book},${r.chapter},${r.verse},${s.version}"><strong>${names()[r.book]} ${r.chapter}:${r.verse}</strong><span>${esc(r.text)}</span>${ctx.icon('arrow')}</button>`).join('')}`:
      '<div class="empty-state"><h3>No matches yet.</h3><p>Try a book and chapter, or a different word of at least three letters.</p></div>';
    };
    body.querySelector('input').focus();
   }
  );
 }
 async function render(target){
  root=target;
  const generation=++run,pending=ctx.pendingPassage;
  ctx.pendingPassage=null;
  if(pending){
   s={book:pending.book,chapter:pending.chapter,page:0,version:pending.version||'kjv'};
   selected=pending.verse||0;
  }
  if(!VERSIONS[s.version])s.version='kjv';
  root.innerHTML='<div class="page-heading"><div><p class="eyebrow">OPEN THE WORD</p><h1>A book to live by.</h1></div></div><div class="loading-panel">Opening your Bible…</div>';
  let loaded;
  try{loaded=await loadBible(s.version);}
  catch{
   if(generation===run&&ctx.route==='bible')root.querySelector('.loading-panel').innerHTML='<p>The Bible text could not be loaded.</p><button class="button" data-route="bible">Try again</button>';
   return;
  }
  if(generation!==run||ctx.route!=='bible'||!ctx.bibleOpened)return;
  bible=loaded;s.book=Math.min(65,Math.max(0,+s.book||0));
  s.chapter=Math.min(bible[s.book].chapters.length,Math.max(1,+s.chapter||1));
  pendingAnchor=pending?{verse:pending.verse||1,offset:0}:s.anchor||{verse:1,offset:0};
  draw();
  if(ctx.readerSearchRequested){ctx.readerSearchRequested=false;search();}
 }
 document.addEventListener('keydown',event=>{
  if(ctx.route!=='bible'||!ctx.bibleOpened||document.querySelector('#site-dialog').open||['INPUT','SELECT','TEXTAREA'].includes(event.target.tagName))return;
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
   event.preventDefault();turn(event.key==='ArrowRight'?1:-1);
  }
 });
 let resizeFrame,lastWidth=window.innerWidth;
 window.addEventListener('resize',()=>{
  if(lastWidth===window.innerWidth)return;
  lastWidth=window.innerWidth;
  cancelAnimationFrame(resizeFrame);
  resizeFrame=requestAnimationFrame(()=>{
   if(ctx.route==='bible'&&ctx.bibleOpened&&bible&&root?.querySelector('.book-spread')){
    paginateCurrent();draw();
   }
  });
 });
 return {
  render,
  prepare(){
   const artwork=new Image();
   artwork.src=openBookImage(bookColour(ctx));
   return loadBible(VERSIONS[s.version]?s.version:'kjv').catch(()=>{});
  },
  reset(){
   run++;s=readingState();bible=null;pages=[];selected=0;pendingAnchor=null;pendingEnd=false;ctx.readerPageView='spread';
   ctx.bibleOpened=false;ctx.pendingPassage=null;ctx.readerSearchRequested=false;
  }
 };
}
