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

export function bookCoverImage(ctx){
 return `assets/bible-cover-${bookColour(ctx)}.webp`;
}

export function bookColourChoices(ctx){
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

// A single page-turn scene is used for finger tracking and for the rest of the flip.
// This stylesheet is deliberately scoped to the Bible reader; the five book artworks
// and the existing responsive text layout are retained unchanged.
const TURN_CSS = `
#reader-workspace .book-spread{position:relative;transform-style:preserve-3d}
#reader-workspace .book-turn-scene{
 position:absolute;inset:0;z-index:15;pointer-events:none;
 transform-style:preserve-3d
}
#reader-workspace .book-turn-underlay{
 position:absolute;inset:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr))
}
#reader-workspace .book-turn-underlay>.paper-page{
 position:relative;width:100%;height:100%;min-width:0;aspect-ratio:auto
}
#reader-workspace .book-turn-stationary{
 position:absolute;top:0;left:0;width:50%;height:100%;z-index:1;pointer-events:none
}
#reader-workspace .book-turn-scene.backward .book-turn-stationary{left:50%}
#reader-workspace .book-turn-stationary>.paper-page{
 position:absolute;inset:0;width:100%;height:100%;aspect-ratio:auto
}
#reader-workspace .book-turn-sheet{
 position:absolute;top:0;bottom:0;left:50%;width:50%;z-index:3;
 transform-origin:left center;transform-style:preserve-3d;will-change:transform
}
#reader-workspace .book-turn-scene.backward .book-turn-sheet{left:0;transform-origin:right center}
#reader-workspace .book-turn-face{
 position:absolute;inset:0;transform-style:preserve-3d;
 backface-visibility:hidden;-webkit-backface-visibility:hidden
}
#reader-workspace .book-turn-face.turn-back{transform:rotateY(180deg)}
#reader-workspace .book-turn-face>.paper-page{
 position:absolute;inset:0;width:100%;height:100%;aspect-ratio:auto;overflow:clip
}
#reader-workspace .book-turn-scene :is(.flip-front,.flip-back,.flip-still)>.book-leaf-art{display:block}
#reader-workspace .book-turn-face>.paper-page::before{
 content:'';position:absolute;inset:0;z-index:4;pointer-events:none;
 background:linear-gradient(90deg,#05122666,transparent 30%,#ffffff19 70%,#07122144);
 opacity:.5
}
#reader-workspace .book-turn-face.turn-back>.paper-page::before{
 background:linear-gradient(270deg,#07122160,transparent 44%,#ffffff19)
}
#reader-workspace .book-turn-scene.single .book-turn-sheet{left:0;width:100%}
#reader-workspace .book-turn-scene.single .book-turn-stationary{display:none}
@media(max-width:960px){
 #reader-workspace .book-turn-underlay{grid-template-columns:minmax(0,1fr)}
 #reader-workspace .book-turn-scene .paper-page[data-leaf="right"]{display:none}
 #reader-workspace .book-turn-scene.single .book-turn-sheet{left:0;width:100%}
}
@media(prefers-reduced-motion:reduce){
 #reader-workspace .book-turn-sheet{will-change:auto}
}`;

function installTurnStyles(){
 if(document.getElementById('unveiled-book-turn-css'))return;
 const style=document.createElement('style');
 style.id='unveiled-book-turn-css';
 style.textContent=TURN_CSS;
 document.head.append(style);
}

function motionAllowed(){return !matchMedia('(prefers-reduced-motion:reduce)').matches;}
function pose(angle,dir){
 const lift=Math.sin(angle*Math.PI/180);
 return `translateZ(${(lift*9).toFixed(2)}px) rotateY(${(-dir*angle).toFixed(2)}deg) rotateZ(${(-dir*lift*.85).toFixed(2)}deg)`;
}
let pendingTurn=null;

// originalPages represent the old reading position. The actual pages in spread
// are either those same pages during a drag, or the new destination for arrows.
function createScene(spread,originalPages,dir,destinationPages){
 installTurnStyles();
 const count=originalPages.length;
 if(!count)return null;
 const scene=document.createElement('div');
 scene.className=`book-turn-scene ${dir>0?'forward':'backward'} ${count===1?'single':''}`;
 scene.setAttribute('aria-hidden','true');scene.inert=true;
 scene.innerHTML='<div class="book-turn-underlay"></div><div class="book-turn-stationary"></div>'+
  '<div class="book-turn-sheet"><div class="book-turn-face turn-front"></div>'+
  '<div class="book-turn-face turn-back"></div></div>';
 const underlay=scene.querySelector('.book-turn-underlay');
 const stationary=scene.querySelector('.book-turn-stationary');
 const sheet=scene.querySelector('.book-turn-sheet');
 const turningIndex=dir>0?count-1:0,landingIndex=dir>0?0:count-1;
 const front=originalPages[turningIndex].cloneNode(true);
 front.style.removeProperty('visibility');
 front.classList.add('flip-front');
 scene.querySelector('.turn-front').append(front);
 if(count===2){
  const still=originalPages[1-turningIndex].cloneNode(true);
  still.style.removeProperty('visibility');
  still.classList.add('flip-still');
  stationary.append(still);
 }
 let hidden=[],angle=0,settled=false;
 function hideActual(pages){
  hidden.forEach(page=>page.style.removeProperty('visibility'));
  hidden=pages;
  hidden.forEach(page=>{page.style.visibility='hidden';});
 }
 function setDestination(pages){
  underlay.replaceChildren(...pages.map(p=>{
   const clone=p.cloneNode(true);clone.style.removeProperty('visibility');return clone;
  }));
  const target=underlay.children[landingIndex];
  if(target){
   const back=target.cloneNode(true);back.classList.add('flip-back');
   scene.querySelector('.turn-back').replaceChildren(back);
  }
 }
 setDestination(destinationPages||originalPages);
 const actualPages=[...spread.querySelectorAll(':scope > .paper-page')];
 hideActual(actualPages);
 spread.append(scene);
 function drag(value){
  angle=Math.max(0,Math.min(180,value));
  sheet.style.transform=pose(angle,dir);
  scene.style.setProperty('--page-fold',String(Math.sin(angle*Math.PI/180)));
 }
 drag(0);
 function releaseActual(){
  hidden.forEach(page=>page.style.removeProperty('visibility'));
  hidden=[];
 }
 async function settle(target){
  if(settled)return;
  settled=true;
  const start=angle;
  if(motionAllowed()&&Math.abs(start-target)>.1){
   const distance=Math.abs(start-target);
   const anim=sheet.animate([
    {transform:pose(start,dir)},
    {transform:pose(start+(target-start)*.52,dir),offset:.52},
    {transform:pose(target,dir)}
   ],{
    duration:Math.max(175,Math.round(distance*(target===180?3.4:2.4))),
    easing:target===180?'cubic-bezier(.3,.68,.22,1)':'cubic-bezier(.2,.7,.25,1)',
    fill:'forwards'
   });
   try{await anim.finished;}catch{}
   anim.cancel();
  }
  drag(target);scene.remove();releaseActual();
 }
 return {
  node:scene,dir,
  get angle(){return angle;},
  drag,
  detach(){releaseActual();scene.remove();},
  moveTo(nextSpread){
   const nextPages=[...nextSpread.querySelectorAll(':scope > .paper-page')];
   setDestination(nextPages);
   hideActual(nextPages);
   nextSpread.append(scene);
  },
  cancel:()=>settle(0),
  finish:()=>settle(180)
 };
}

export function bindBookSwipe(spread,canTurn,turn){
 let gesture=null,restoring=false,ignoreClick=false;
 spread.addEventListener('pointerdown',event=>{
  if(!event.isPrimary||event.button!==0||gesture||restoring)return;
  ignoreClick=false;
  gesture={id:event.pointerId,x:event.clientX,y:event.clientY,start:performance.now()};
 });
 spread.addEventListener('pointermove',event=>{
  if(gesture?.id!==event.pointerId)return;
  const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
  if(!gesture.scene){
   // A vertical gesture is always a scroll, not a page turn.
   if(Math.abs(dy)>11&&Math.abs(dy)>Math.abs(dx)){gesture=null;return;}
   if(Math.abs(dx)<9||Math.abs(dx)<Math.abs(dy)*1.25)return;
   const dir=dx<0?1:-1;
   if(!canTurn(dir)){gesture=null;return;}
   gesture.dir=dir;
   gesture.scene=createScene(spread,[...spread.querySelectorAll(':scope > .paper-page')],dir);
   if(!gesture.scene){gesture=null;return;}
   gesture.width=Math.max(1,gesture.scene.node.querySelector('.book-turn-sheet').offsetWidth);
   ignoreClick=true;
   try{spread.setPointerCapture(event.pointerId);}catch{}
  }
  if(event.cancelable)event.preventDefault();
  const distance=Math.max(0,-gesture.dir*dx);
  gesture.scene.drag(Math.min(171,distance/gesture.width*165));
 });
 function end(event,commit){
  if(gesture?.id!==event.pointerId)return;
  const {scene,dir,x,width,start}=gesture;
  gesture=null;
  if(!scene)return;
  const distance=Math.max(0,-dir*(event.clientX-x));
  const enough=distance>=Math.min(65,width*.16);
  const flick=distance>=24&&performance.now()-start<280;
  if(commit&&(enough||flick)&&canTurn(dir)){
   // Retain the SAME sheet object; the reader may now replace its page DOM.
   const progress=scene.angle;
   scene.detach();
   pendingTurn=scene;
   try{turn(dir,progress);}catch(error){pendingTurn=null;scene.cancel();throw error;}
  }else{
   restoring=true;
   scene.cancel().finally(()=>{restoring=false;});
  }
 }
 spread.addEventListener('pointerup',event=>end(event,true));
 spread.addEventListener('pointercancel',event=>end(event,false));
 spread.addEventListener('lostpointercapture',event=>end(event,false));
 spread.addEventListener('pointerleave',event=>{
  if(gesture?.id===event.pointerId&&!gesture.scene)gesture=null;
 });
 spread.addEventListener('click',event=>{
  if(ignoreClick&&event.detail){event.preventDefault();event.stopImmediatePropagation();ignoreClick=false;}
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
