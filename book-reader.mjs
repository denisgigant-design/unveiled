import {paginateMeasured} from './book-layout.mjs';
import {esc} from './core.mjs';
import {syncBookArtwork} from './book-art.mjs?v=unveiled16';

export function paperHeading(book, edition, chapter) {
  return `<div class="paper-running"><span>${esc(book)}</span><span>${esc(edition)}</span></div>${chapter
    ?`<div class="chapter-heading"><span>CHAPTER</span><h2>${chapter}</h2><span class="chapter-line"></span></div>` : ''}`;
}

export function measureBook(verses, actual, options, {book, edition, chapter}) {
  const box=actual.getBoundingClientRect();
  if(box.width<60||box.height<80)return null;
  const wrapper=document.createElement('div');
  wrapper.className='book-measure';wrapper.setAttribute('aria-hidden','true');wrapper.inert=true;
  wrapper.style.width=Math.floor(box.width)+'px';wrapper.style.height=Math.floor(box.height)+'px';
  wrapper.style.setProperty('--reader-size',options.size+'px');
  wrapper.style.setProperty('--reader-font',{georgia:'Georgia,serif',palatino:'Palatino,serif',sans:'system-ui,sans-serif'}[options.font]||'Georgia,serif');
  wrapper.innerHTML=`<div class="book-page-content">${paperHeading(book,edition,chapter)}<div class="verse-text"></div><div class="page-number">1</div></div>`;
  document.body.append(wrapper);
  const heading=wrapper.querySelector('.chapter-heading'),body=wrapper.querySelector('.verse-text');
  try {
    return paginateMeasured(verses,(parts,index)=>{
      heading.style.display=index===0?'':'none';
      body.innerHTML=parts.map(p=>`<button class="verse-line"><sup>${p.v}</sup><span>${esc(p.text)}</span></button>`).join('');
      const last=body.lastElementChild;
      return !last || last.getBoundingClientRect().bottom<=body.getBoundingClientRect().bottom-2;
    });
  } finally {wrapper.remove();}
}

const bookColours={navy:'Blue',pink:'Pink',red:'Red',green:'Green',purple:'Purple'};

export function bookColour(ctx){
 const stored=ctx.read('book-colour','navy');
 return typeof stored==='string'&&Object.hasOwn(bookColours,stored)?stored:'navy';
}

export function bookViewMode(ctx){
 return matchMedia('(max-width:960px)').matches && ctx.readerPageView==='single'
  ? 'single' : 'spread';
}

export function bookViewChoices(ctx){
 const view=bookViewMode(ctx);
 return `<div class="book-view-control" role="group" aria-label="Bible page view">
  <span>Pages</span>
  <button type="button" data-book-view="spread" aria-pressed="${view==='spread'}"><span class="view-icon" aria-hidden="true">▣</span> Two pages</button>
  <button type="button" data-book-view="single" aria-pressed="${view==='single'}"><span class="view-icon" aria-hidden="true">▯</span> One page</button>
 </div>`;
}

export function bookCoverImage(ctx){
 return `assets/bible-cover-${bookColour(ctx)}.webp`;
}

export function bookColourChoices(ctx){
 installTurnStyles();
 const selected=bookColour(ctx);
 return `<div class="book-colour-choices" role="group" aria-label="Bible cover colour">
  <span>Bible colour</span>
  ${Object.entries(bookColours).map(([value,label])=>`<button type="button" data-book-colour="${value}" aria-pressed="${selected===value}"><i aria-hidden="true"></i>${label}</button>`).join('')}
 </div>`;
}

export function syncBookColour(ctx){
 const colour=bookColour(ctx);
 document.body.dataset.bookColour=colour;
 syncBookArtwork(colour);
 const cover=bookCoverImage(ctx);
 document.querySelectorAll('[data-bible-cover-image]').forEach(image=>{
  if(image.getAttribute('src')!==cover)image.src=cover;
 });
 document.querySelectorAll('button[data-book-colour]').forEach(button=>{
  button.setAttribute('aria-pressed',String(button.dataset.bookColour===colour));
 });
}

// Unveiled Bible: the paper curls, not its ornamental veil-and-palm border.
// A physically connected strip mesh samples the existing verse text and leaf art;
// its complete sheet is clipped against the ACTIVE irregular SVG paper contour.
const TURN_CSS = `
#reader-workspace .book-spread{
 position:relative;transform-style:preserve-3d;
 perspective:clamp(1120px,185vw,2400px);
 touch-action:pan-y pinch-zoom;
}
#reader-workspace .book-spread :is(.paper-page,.verse-line,.verse-text){
 touch-action:pan-y pinch-zoom;
}
#reader-workspace .book-turn-scene{
 position:absolute;inset:0;z-index:15;pointer-events:none;
 transform-style:preserve-3d;overflow:visible;
}
#reader-workspace .book-turn-underlay{
 position:absolute;inset:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));
}
#reader-workspace .book-turn-underlay>.paper-page{
 position:relative;width:100%;height:100%;min-width:0;aspect-ratio:auto;
}
#reader-workspace .book-turn-stationary{
 position:absolute;top:0;left:0;width:50%;height:100%;z-index:1;pointer-events:none;
}
#reader-workspace .book-turn-scene.backward .book-turn-stationary{left:50%}
#reader-workspace .book-turn-stationary>.paper-page{
 position:absolute;inset:0;width:100%;height:100%;aspect-ratio:auto;
}
#reader-workspace .book-turn-strip{
 position:absolute;top:0;bottom:0;width:var(--curl-strip-width);z-index:3;
 transform-style:preserve-3d;will-change:transform;
}
#reader-workspace .book-turn-scene.forward .book-turn-strip{
 left:50%;transform-origin:left center;
}
#reader-workspace .book-turn-scene.backward .book-turn-strip{
 left:calc(50% - var(--curl-strip-width));transform-origin:right center;
}
#reader-workspace .book-turn-scene.single.forward .book-turn-strip{left:0}
#reader-workspace .book-turn-scene.single.backward .book-turn-strip{
 left:calc(100% - var(--curl-strip-width));
}
#reader-workspace .book-turn-surface{
 position:absolute;inset:0;overflow:hidden;transform-style:flat;
 backface-visibility:hidden;-webkit-backface-visibility:hidden;
}
#reader-workspace .book-turn-surface.back{transform:rotateY(180deg)}
#reader-workspace .book-turn-crop{position:absolute;inset:0;overflow:hidden}
#reader-workspace .book-turn-crop>.paper-page{
 position:absolute!important;top:0!important;
 left:var(--curl-crop-x)!important;
 width:var(--curl-page-width)!important;height:100%!important;
 min-width:var(--curl-page-width)!important;max-width:none!important;
 margin:0!important;aspect-ratio:auto!important;overflow:clip;
}
#reader-workspace .book-turn-crop>.paper-page>.book-leaf-art{display:block}
/* Shade the already masked paper, NEVER its rectangular containing strip. */
#reader-workspace .book-turn-crop .book-leaf-shade{
 fill:#061227;opacity:var(--curl-shade,.04);
}
#reader-workspace .book-turn-strip.outermost .book-turn-crop>.paper-page{
 filter:drop-shadow(1px 1px 2px #07132888);
}
#reader-workspace .book-turn-spine-shadow{
 position:absolute;left:50%;top:0;bottom:0;width:24px;
 z-index:2;transform:translateX(-50%);pointer-events:none;
 background:linear-gradient(90deg,transparent,#071328c0,transparent);
 opacity:var(--curl-spine-shade,0);
}
#reader-workspace .book-turn-scene.single .book-turn-spine-shadow{
 left:0;transform:translateX(-50%);
}
#reader-workspace .book-turn-scene.single.backward .book-turn-spine-shadow{left:100%}
#reader-workspace .book-turn-scene[data-pending-destination] :is(.book-turn-underlay,.back) .book-page-content{
 visibility:hidden;
}
/* Mobile opens a true two-leaf book. Single page is a reversible preference. */
#reader-workspace .book-view-control{display:flex;align-items:center;gap:6px;justify-content:flex-start;margin:7px 0 11px;color:#b9cadf;font-size:11px}
#reader-workspace .book-view-control>span{margin-right:4px}
#reader-workspace .book-view-control button{display:inline-flex;align-items:center;gap:6px;min-height:32px;border:1px solid #38516d;border-radius:6px;background:#14283e;color:#c9d5e7;padding:5px 11px;font-size:11px;box-shadow:none}
#reader-workspace .book-view-control button[aria-pressed="true"]{border-color:#80b9fa;background:#25435f;color:#f4f8ff}
#reader-workspace .book-view-control .view-icon{display:inline-block;font-size:15px;line-height:1}
@media(min-width:961px){#reader-workspace .book-view-control{display:none}}
@media(max-width:960px){
 :root #reader-workspace{max-width:100%;}
 :root #reader-workspace .book-shell[data-book-view="spread"] .book-spread{
  grid-template-columns:repeat(2,minmax(0,1fr));aspect-ratio:3/2;
 }
 #reader-workspace .book-shell[data-book-view="spread"] .book-artwork>svg{width:100%;margin-left:0}
 #reader-workspace .book-shell[data-book-view="spread"] .book-leaf-art{width:100%;left:0}
 #reader-workspace .book-shell[data-book-view="spread"] .book-spread>.paper-page[data-leaf="right"]{display:flex}
 #reader-workspace .book-shell[data-book-view="spread"] .paper-page[data-leaf="left"]>.book-page-content{
  inset-inline:42.7% 7.7%
 }
 #reader-workspace .book-shell[data-book-view="spread"] .paper-page[data-leaf="right"]>.book-page-content{
  inset-inline:7.7% 42.7%
 }
 #reader-workspace .book-shell[data-book-view="spread"] :is(.paper-running,.chapter-heading){margin-bottom:3px;padding-bottom:2px}
 #reader-workspace .book-shell[data-book-view="spread"] .chapter-heading h2{font-size:clamp(11px,2.6vw,19px)}
 #reader-workspace .book-turn-scene.single .book-turn-underlay{grid-template-columns:minmax(0,1fr)}
 #reader-workspace .book-turn-scene.single .paper-page[data-leaf="right"]{display:none}
}
@media(max-width:480px){
 #reader-workspace .book-view-control{margin:5px 0 10px}
 #reader-workspace .book-shell[data-book-view="spread"] .paper-running{font-size:6px!important;letter-spacing:.025em!important}
 #reader-workspace .book-shell[data-book-view="spread"] .page-number{font-size:7px!important}
}
@media(prefers-reduced-motion:reduce){
 #reader-workspace .book-turn-strip{will-change:auto}
}`;

function installTurnStyles(){
 if(document.getElementById('unveiled-book-turn-css'))return;
 const style=document.createElement('style');
 style.id='unveiled-book-turn-css';
 style.textContent=TURN_CSS;
 document.head.append(style);
}

function motionAllowed(){return document.body.dataset.motion!=='off' && !matchMedia('(prefers-reduced-motion:reduce)').matches;}
const radians=angle=>angle*Math.PI/180;
let pendingTurn=null;

// All five Bible designs already declare the precise paper boundary in
// book-art.mjs. Reuse that SVG path instead of guessing at a rectangular mask.
// On phones the original left-hand paper is cropped from x=112..768.
let curlId=0;
function addPaperMasks(scene,spread,count){
 const path=document.querySelector('#reader-workspace .book-artwork #bible-paper-shape');
 if(!path)return null;
 const d=path.getAttribute('d');
 if(!d)return null;
 const id='unveiled-turn-'+(++curlId);
 const phone=count===1;
 const shell=spread.closest('.book-shell');
 const vars=shell?getComputedStyle(shell):null;
 const crop=phone?(parseFloat(vars?.getPropertyValue('--phone-crop-start'))||112):0;
 const leafWidth=phone?(parseFloat(vars?.getPropertyValue('--phone-leaf-width'))||656):768;
 const viewScale=1/leafWidth;
 const leftTx=phone?(-crop/leafWidth):0;
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('width','0');svg.setAttribute('height','0');
 svg.setAttribute('aria-hidden','true');
 svg.style.cssText='position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
 const defs=document.createElementNS(svg.namespaceURI,'defs');
 for(const side of ['left','right']){
  const clip=document.createElementNS(svg.namespaceURI,'clipPath');
  clip.setAttribute('id',id+'-'+side);
  clip.setAttribute('clipPathUnits','objectBoundingBox');
  const outline=document.createElementNS(svg.namespaceURI,'path');
  outline.setAttribute('d',d);
  // The right page mirrors the same shaped piece about the centre spine.
  outline.setAttribute('transform',side==='right'
   ?`translate(1 0) scale(${-1/768} ${1/1024})`
   :`translate(${leftTx} 0) scale(${viewScale} ${1/1024})`);
  clip.append(outline);defs.append(clip);
 }
 svg.append(defs);scene.prepend(svg);
 return {left:id+'-left',right:id+'-right'};
}
function maskLeaf(page,masks,count){
 if(!masks)return;
 const side=count===2&&page.dataset.leaf==='right'?'right':'left';
 const url=`url(#${masks[side]})`;
 page.style.clipPath=url;
 page.style.webkitClipPath=url;
}

// originalPages are the old position; destinationPages may be populated later
// after reader.js has paginated the next chapter or replaced the spread DOM.
function createScene(spread,originalPages,dir,destinationPages){
 installTurnStyles();
 const count=originalPages.length;
 if(!count)return null;
 const leaf=originalPages[dir>0?count-1:0];
 // Button-driven turns pass detached page clones. Measure the currently
 // mounted leaf instead, so arrows and finger swipes use identical geometry.
 const mounted=[...spread.querySelectorAll(':scope > .paper-page')];
 const pageWidth=mounted[dir>0?Math.min(count-1,mounted.length-1):0]?.getBoundingClientRect().width
  || leaf.getBoundingClientRect().width || spread.getBoundingClientRect().width/count;
 if(pageWidth<30)return null;
 // Enough sections to read as curved paper, capped for mobile performance.
 const segments=Math.max(26,Math.min(36,Math.round(pageWidth/13)));
 const stripWidth=pageWidth/segments;
 const scene=document.createElement('div');
 scene.className=`book-turn-scene ${dir>0?'forward':'backward'} ${count===1?'single':''}`;
 scene.setAttribute('aria-hidden','true');scene.inert=true;
 if(!destinationPages)scene.dataset.pendingDestination='true';
 scene.innerHTML='<div class="book-turn-underlay"></div><div class="book-turn-stationary"></div>'+ 
  '<div class="book-turn-spine-shadow"></div>';
 scene.style.setProperty('--curl-page-width',pageWidth+'px');
 scene.style.setProperty('--curl-strip-width',(stripWidth+0.45)+'px');
 const masks=addPaperMasks(scene,spread,count);
 const underlay=scene.querySelector('.book-turn-underlay');
 const stationary=scene.querySelector('.book-turn-stationary');
 if(count===2){
  const still=originalPages[dir>0?0:1].cloneNode(true);
  still.style.removeProperty('visibility');
  still.classList.add('flip-still');
  stationary.append(still);
 }
 const strips=[];
 for(let i=0;i<segments;i++){
  const strip=document.createElement('div');
  strip.className='book-turn-strip'+(i===segments-1?' outermost':'');
  strip.innerHTML='<div class="book-turn-surface front"><div class="book-turn-crop"></div></div>'+ 
                  '<div class="book-turn-surface back"><div class="book-turn-crop"></div></div>';
  const sourceX=dir>0?i*stripWidth:pageWidth-(i+1)*stripWidth;
  const crop=strip.querySelector('.front .book-turn-crop');
  crop.style.setProperty('--curl-crop-x',(-sourceX)+'px');
  const front=leaf.cloneNode(true);
  front.classList.add('flip-front');
  front.style.removeProperty('visibility');
  maskLeaf(front,masks,count);
  crop.append(front);
  scene.append(strip);
  strips.push(strip);
 }
 let hidden=[],angle=0,settled=false;
 function hideActual(pages){
  hidden.forEach(page=>page.style.removeProperty('visibility'));
  hidden=pages;
  hidden.forEach(page=>{page.style.visibility='hidden';});
 }
 function releaseActual(){
  hidden.forEach(page=>page.style.removeProperty('visibility'));
  hidden=[];
 }
 function setDestination(pages){
  underlay.replaceChildren(...pages.map(page=>{
   const clone=page.cloneNode(true);
   clone.style.removeProperty('visibility');
   return clone;
  }));
  const landing=underlay.children[dir>0?0:count-1];
  if(!landing)return;
  strips.forEach((strip,i)=>{
   const crop=strip.querySelector('.back .book-turn-crop');
   // At 180deg the back is reversed relative to the front: sample from
   // the opposite edge so words remain readable in their new page order.
   const targetX=dir>0?pageWidth-(i+1)*stripWidth:i*stripWidth;
   crop.style.setProperty('--curl-crop-x',(-targetX)+'px');
   const back=landing.cloneNode(true);
   back.classList.add('flip-back');
   back.style.removeProperty('visibility');
   maskLeaf(back,masks,count);
   crop.replaceChildren(back);
  });
 }
 setDestination(destinationPages||originalPages);
 hideActual([...spread.querySelectorAll(':scope > .paper-page')]);
 spread.append(scene);

 function drag(value){
  angle=Math.max(0,Math.min(180,value));
  const progress=angle/180;
  // At mid-turn the inside of the sheet leans toward the viewer while the
  // outer edge rolls ahead: an obvious curved arch, not a rotating plank.
  // An 84-degree local spread makes the arc legible even on a small phone.
  const bend=84*Math.pow(Math.sin(Math.PI*progress),.85);
  let x=0,z=0;
  strips.forEach((strip,i)=>{
   const u=(i+.5)/segments;
   const localAngle=angle+bend*(2*u-1);
   const rad=radians(localAngle);
   strip.style.transform=`translate3d(${(dir*x).toFixed(2)}px,0,${z.toFixed(2)}px) rotateY(${(-dir*localAngle).toFixed(2)}deg)`;
   // Highlights and shadows are painted INSIDE the actual ornate paper edge.
   const shade=.045+.48*Math.abs(Math.sin(rad))*(.3+.7*u);
   strip.style.setProperty('--curl-shade',shade.toFixed(3));
   // Integrate all strip endpoints as a continuous sheet in 3D.
   x+=stripWidth*Math.cos(rad);
   z+=stripWidth*Math.sin(rad);
  });
  scene.style.setProperty('--curl-spine-shade',(Math.sin(Math.PI*progress)*.74).toFixed(3));
 }
 drag(0);

 async function settle(target){
  if(settled)return;
  settled=true;
  const initial=angle;
  if(motionAllowed()&&Math.abs(initial-target)>.1){
   const distance=Math.abs(initial-target);
   // ~2.1 seconds for a complete button turn, scaled for a partly dragged page.
   // Gentle initial lift, full curling sweep, and unhurried settling.
   const duration=target===180
     ?Math.max(700,Math.min(2200,Math.round(distance*11.6)))
     :Math.max(430,Math.min(1350,Math.round(distance*7.4)));
   const start=performance.now();
   await new Promise(resolve=>{
    function tick(now){
     if(!scene.isConnected){resolve();return;}
     const t=Math.max(0,Math.min(1,(now-start)/duration));
     const eased=(1-Math.cos(Math.PI*t))/2;
     drag(initial+(target-initial)*eased);
     if(t<1)requestAnimationFrame(tick);else resolve();
    }
    requestAnimationFrame(tick);
   });
  }
  drag(target);
  scene.remove();releaseActual();
 }

 return {
  node:scene,dir,width:pageWidth,
  get angle(){return angle;},
  drag,
  detach(){releaseActual();scene.remove();},
  moveTo(nextSpread){
   const pages=[...nextSpread.querySelectorAll(':scope > .paper-page')];
   setDestination(pages);
   delete scene.dataset.pendingDestination;
   hideActual(pages);
   nextSpread.append(scene);
  },
  cancel:()=>settle(0),
  finish:()=>settle(180)
 };
}

export function bindBookSwipe(spread,canTurn,turn,previewPages){
 let gesture=null,restoring=false,ignoreClick=false;
 const now=()=>performance.now();
 function begin(x,y,id,kind,source){
  if(gesture||restoring)return;
  ignoreClick=false;
  gesture={id,kind,x,y,start:now(),scene:null,canEdgeTap:!source?.closest?.('button,a,input,textarea,select')};
 }
 function move(x,y){
  if(!gesture)return false;
  const dx=x-gesture.x,dy=y-gesture.y;
  if(!gesture.scene){
   // Leave vertical document scrolling and pinch zoom alone.
   if(Math.abs(dy)>23&&Math.abs(dy)>Math.abs(dx)*1.35){gesture=null;return false;}
   if(Math.abs(dx)<9||Math.abs(dx)<Math.abs(dy)*1.08)return false;
   const dir=dx<0?1:-1;
   if(!canTurn(dir)){gesture=null;return false;}
   gesture.dir=dir;
   let destination=null;
   try{destination=previewPages?.(dir)||null;}catch(error){console.warn('Page preview unavailable',error);}
   gesture.scene=createScene(spread,[...spread.querySelectorAll(':scope > .paper-page')],dir,destination);
   if(!gesture.scene){gesture=null;return false;}
   gesture.width=Math.max(1,gesture.scene.width);
   ignoreClick=true;
  }
  const distance=Math.max(0,-gesture.dir*dx);
  // The sheet follows the finger; small motions already show a lifted curl.
  gesture.scene.drag(Math.min(176,distance/gesture.width*190));
  return true;
 }
 function end(x,y,commit){
  if(!gesture)return;
  const {scene,dir,start,width,x:originX,y:originY,canEdgeTap}=gesture;
  gesture=null;
  if(!scene){
   // Outer-paper taps are an additional phone-friendly way to turn pages.
   // Preserve ordinary verse taps, which open word study/highlighting.
   if(commit&&canEdgeTap&&Math.abs(x-originX)<12&&Math.abs(y-originY)<12){
    const box=spread.getBoundingClientRect();
    const ratio=(x-box.left)/box.width;
    if(ratio<.14&&canTurn(-1)){ignoreClick=true;turn(-1,0);}
    else if(ratio>.86&&canTurn(1)){ignoreClick=true;turn(1,0);}
   }
   return;
  }
  const distance=Math.max(0,-dir*(x-originX));
  const enough=distance>=Math.min(48,width*.12);
  const flick=distance>=19&&now()-start<340;
  if(commit&&(enough||flick)&&canTurn(dir)){
   const progress=scene.angle;
   scene.detach();
   pendingTurn=scene;
   try{turn(dir,progress);}catch(error){pendingTurn=null;scene.cancel();throw error;}
  }else{
   restoring=true;
   scene.cancel().finally(()=>{restoring=false;});
  }
 }

 // TouchEvent input is handled explicitly: Android can cancel pointer capture
 // once the browser takes over a gesture. Do not rely on PointerEvents for touch.
 let activeTouch=null;
 spread.addEventListener('touchstart',event=>{
  if(activeTouch!==null||event.touches.length!==1)return;
  const t=event.changedTouches[0];
  activeTouch=t.identifier;
  begin(t.clientX,t.clientY,t.identifier,'touch',event.target);
 },{passive:true});
 spread.addEventListener('touchmove',event=>{
  if(activeTouch===null)return;
  if(event.touches.length!==1){
   if(gesture?.scene)end(gesture.x,gesture.y,false);
   activeTouch=null;return;
  }
  const t=Array.from(event.changedTouches).find(item=>item.identifier===activeTouch)
   ||Array.from(event.touches).find(item=>item.identifier===activeTouch);
  if(!t)return;
  if(move(t.clientX,t.clientY)&&event.cancelable)event.preventDefault();
 },{passive:false});
 function finishTouch(event,commit){
  if(activeTouch===null)return;
  const t=Array.from(event.changedTouches).find(item=>item.identifier===activeTouch);
  if(!t)return;
  activeTouch=null;
  if(gesture?.kind==='touch')end(t.clientX,t.clientY,commit);
 }
 spread.addEventListener('touchend',event=>finishTouch(event,true),{passive:true});
 spread.addEventListener('touchcancel',event=>finishTouch(event,false),{passive:true});

 // Stylus and mouse have their own pointer path and do not double-trigger touch.
 spread.addEventListener('pointerdown',event=>{
  if(event.pointerType==='touch'||!event.isPrimary||event.button!==0)return;
  begin(event.clientX,event.clientY,event.pointerId,'pointer',event.target);
 });
 spread.addEventListener('pointermove',event=>{
  if(gesture?.kind!=='pointer'||gesture.id!==event.pointerId)return;
  if(move(event.clientX,event.clientY)){
   if(event.cancelable)event.preventDefault();
   try{spread.setPointerCapture(event.pointerId);}catch{}
  }
 });
 const stopPointer=(event,commit)=>{
  if(gesture?.kind==='pointer'&&gesture.id===event.pointerId)
   end(event.clientX,event.clientY,commit);
 };
 spread.addEventListener('pointerup',event=>stopPointer(event,true));
 spread.addEventListener('pointercancel',event=>stopPointer(event,false));
 spread.addEventListener('lostpointercapture',event=>stopPointer(event,false));
 spread.addEventListener('pointerleave',event=>{
  if(gesture?.kind==='pointer'&&gesture.id===event.pointerId&&!gesture.scene)gesture=null;
 });
 spread.addEventListener('click',event=>{
  if(ignoreClick){event.preventDefault();event.stopImmediatePropagation();ignoreClick=false;}
 },true);
}

export async function animateBookTurn(spread,oldPages,count,dir,angle=0){
 const sameSheet=pendingTurn?.dir===dir?pendingTurn:null;
 pendingTurn=null;
 const nextPages=[...spread.querySelectorAll(':scope > .paper-page')];
 const scene=sameSheet||createScene(spread,oldPages,dir,nextPages);
 if(!scene)return;
 if(sameSheet)scene.moveTo(spread);
 // Arrow-initiated turns start flat; swipes continue from their exact drag angle.
 if(!sameSheet)scene.drag(0);
 try{await scene.finish();}
 finally{scene.node.remove();}
}
