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

// A bendable leaf is rendered as connected narrow 3D strips. Each strip
// samples the existing live Bible page. This keeps the ornate artwork,
// coloured paper, verse layout and the text exactly where the reader put them.
// Unlike a rigid rotateY(), adjacent strips have different angles, so the
// paper forms an actual arc with moving light and shadow as it turns.
const TURN_CSS = `
#reader-workspace .book-spread{position:relative;transform-style:preserve-3d}
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
#reader-workspace .book-turn-surface::after{
 content:'';position:absolute;inset:0;z-index:5;pointer-events:none;
 background:rgba(5,18,39,.78);
 opacity:var(--curl-shade,.09);
}
#reader-workspace .book-turn-surface.back::after{
 background:rgba(5,18,39,.68);
}
#reader-workspace .book-turn-strip.outermost .book-turn-surface{
 box-shadow:2px 0 5px #05102130;
}
#reader-workspace .book-turn-spine-shadow{
 position:absolute;left:50%;top:0;bottom:0;width:15px;
 z-index:2;transform:translateX(-50%);pointer-events:none;
 background:linear-gradient(90deg,transparent,#071328a8,transparent);
 opacity:var(--curl-spine-shade,0);
}
#reader-workspace .book-turn-scene.single .book-turn-spine-shadow{
 left:0;transform:translateX(-50%);
}
#reader-workspace .book-turn-scene.single.backward .book-turn-spine-shadow{
 left:100%;
}
#reader-workspace .book-turn-scene[data-pending-destination] :is(.book-turn-underlay,.back) .book-page-content{
 visibility:hidden;
}
@media(max-width:960px){
 #reader-workspace .book-turn-underlay{grid-template-columns:minmax(0,1fr)}
 #reader-workspace .book-turn-scene .paper-page[data-leaf="right"]{display:none}
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
 // 12-20 segments: smooth curvature without dozens of full-page copies
 // on a mobile browser. The final segment has no unpainted edge.
 const segments=Math.max(22,Math.min(28,Math.round(pageWidth/18)));
 const stripWidth=pageWidth/segments;
 const scene=document.createElement('div');
 scene.className=`book-turn-scene ${dir>0?'forward':'backward'} ${count===1?'single':''}`;
 scene.setAttribute('aria-hidden','true');scene.inert=true;
 if(!destinationPages)scene.dataset.pendingDestination='true';
 scene.innerHTML='<div class="book-turn-underlay"></div><div class="book-turn-stationary"></div>'+ 
  '<div class="book-turn-spine-shadow"></div>';
 scene.style.setProperty('--curl-page-width',pageWidth+'px');
 scene.style.setProperty('--curl-strip-width',(stripWidth+0.6)+'px');
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
   crop.replaceChildren(back);
  });
 }
 setDestination(destinationPages||originalPages);
 hideActual([...spread.querySelectorAll(':scope > .paper-page')]);
 spread.append(scene);

 function drag(value){
  angle=Math.max(0,Math.min(180,value));
  const p=angle/180;
  // A cylindrical bend that starts at the free edge and travels toward
  // the spine. At the two resting positions every slice is flat.
  const bend=52*Math.sin(Math.PI*p);
  let x=0,z=0;
  strips.forEach((strip,i)=>{
   const u=(i+.5)/segments;
   const a=angle+bend*(2*u-1);
   const rad=radians(a);
   const tilt=Math.sin(rad);
   strip.style.transform=`translate3d(${(dir*x).toFixed(2)}px,0,${z.toFixed(2)}px) rotateY(${(-dir*a).toFixed(2)}deg)`;
   // The highlight crawls over the curved surface instead of remaining
   // painted on a single stiff sheet.
   strip.style.setProperty('--curl-shade',(0.07+0.26*Math.abs(tilt)*(0.35+0.65*u)).toFixed(3));
   x+=stripWidth*Math.cos(rad);
   z+=stripWidth*Math.sin(rad)*.18;
  });
  scene.style.setProperty('--curl-spine-shade',(Math.sin(Math.PI*p)*0.58).toFixed(3));
 }
 drag(0);

 async function settle(target){
  if(settled)return;
  settled=true;
  const initial=angle;
  if(motionAllowed()&&Math.abs(initial-target)>.1){
   const distance=Math.abs(initial-target);
   const duration=Math.max(185,Math.round(distance*(target===180?3.8:2.5)));
   const start=performance.now();
   await new Promise(resolve=>{
    function tick(now){
     if(!scene.isConnected){resolve();return;}
     const t=Math.min(1,(now-start)/duration);
     // smooth acceleration, then deceleration, keeping continuous speed
     // from the finger position through the rest of the motion.
     const ease=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
     drag(initial+(target-initial)*ease);
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
   gesture.width=Math.max(1,gesture.scene.width);
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
