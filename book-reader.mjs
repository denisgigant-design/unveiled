import {paginateMeasured} from './book-layout.mjs';
import {esc} from './core.mjs';

export function measureBook(verses, actual, options, chapter) {
  const box=actual.getBoundingClientRect();
  if(box.width<80||box.height<80)return null;
  const wrapper=document.createElement('div');
  wrapper.className='book-measure';wrapper.setAttribute('aria-hidden','true');wrapper.inert=true;
  wrapper.style.width=box.width+'px';wrapper.style.height=box.height+'px';
  wrapper.style.setProperty('--reader-size',options.size+'px');
  wrapper.style.setProperty('--reader-font',{georgia:'Georgia,serif',palatino:'Palatino,serif',sans:'system-ui,sans-serif'}[options.font]||'Georgia,serif');
  wrapper.innerHTML=`<article class="paper-page"><div class="paper-running"><span>THE HOLY BIBLE</span><span>CHAPTER</span></div><div class="chapter-heading"><span>CHAPTER</span><h2>${chapter}</h2><span class="chapter-line"></span></div><div class="verse-text"></div><div class="page-number">1</div></article>`;
  document.body.append(wrapper);
  const paper=wrapper.querySelector('.paper-page'),heading=wrapper.querySelector('.chapter-heading'),body=wrapper.querySelector('.verse-text');
  paper.style.width=box.width+'px';paper.style.height=box.height+'px';
  try {
    return paginateMeasured(verses,(parts,index)=>{
      heading.style.display=index===0?'':'none';
      body.innerHTML=parts.map(p=>`<button class="verse-line"><sup>${p.v}</sup><span>${esc(p.text)}</span></button>`).join('');
      const last=body.lastElementChild;
      return !last || last.getBoundingClientRect().bottom<=body.getBoundingClientRect().bottom-2;
    });
  } finally {wrapper.remove();}
}

function bookColour(ctx){
 return ctx.read('book-colour','navy')==='pink'?'pink':'navy';
}

export function bookColourChoices(ctx){
 const selected=bookColour(ctx);
 return `<div class="book-colour-choices" role="group" aria-label="Bible cover colour">
  <span>Bible colour</span>
  ${[['navy','Navy'],['pink','Pink']].map(([value,label])=>`<button type="button" data-book-colour="${value}" aria-pressed="${selected===value}"><i aria-hidden="true"></i>${label}</button>`).join('')}
 </div>`;
}

export function syncBookColour(ctx){
 const colour=bookColour(ctx);
 document.body.dataset.bookColour=colour;
 document.querySelectorAll('button[data-book-colour]').forEach(button=>{
  button.setAttribute('aria-pressed',String(button.dataset.bookColour===colour));
 });
}

function pageMotion(){
 return !matchMedia('(prefers-reduced-motion:reduce)').matches;
}

function leafPose(angle,dir){
 const lift=Math.sin(angle*Math.PI/180);
 return `translateZ(${lift*12}px) rotateY(${-dir*angle}deg) rotateZ(${-dir*lift*1.15}deg)`;
}

export function bindBookSwipe(spread,canTurn,turn){
 let gesture,restoring,ignoreClick=false;
 spread.addEventListener('pointerdown',event=>{
  if(!event.isPrimary||event.button!==0||gesture)return;
  restoring?.cancel();
  ignoreClick=false;
  gesture={id:event.pointerId,x:event.clientX,y:event.clientY,time:performance.now()};
 });
 spread.addEventListener('pointermove',event=>{
  if(gesture?.id!==event.pointerId)return;
  const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
  if(!gesture.leaf){
   if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){gesture=null;return;}
   if(Math.abs(dx)<9||Math.abs(dx)<Math.abs(dy)*1.2)return;
   const dir=dx<0?1:-1;
   if(!canTurn(dir)){gesture=null;return;}
   const leaves=spread.querySelectorAll(':scope > .paper-page');
   gesture.leaf=dir>0?leaves[leaves.length-1]:leaves[0];
   gesture.dir=dir;
   gesture.width=gesture.leaf.offsetWidth;
   ignoreClick=true;
   spread.setPointerCapture(event.pointerId);
  }
  if(event.cancelable)event.preventDefault();
  const {leaf,dir}=gesture;
  const distance=Math.max(0,-dir*dx);
  gesture.angle=Math.min(76,distance/gesture.width*170);
  if(pageMotion()){
   leaf.classList.add('swipe-leaf',dir<0?'swipe-backward':'swipe-forward');
   leaf.style.transform=leafPose(gesture.angle,dir);
   leaf.style.setProperty('--swipe-shade',Math.min(.8,gesture.angle/92));
  }
 });
 function end(event,commit){
  if(gesture?.id!==event.pointerId)return;
  const {leaf,dir,x,width,angle=0,time}=gesture;
  gesture=null;
  if(!leaf)return;
  const distance=Math.max(0,-dir*(event.clientX-x));
  const farEnough=distance>=Math.min(60,width*.18);
  const flick=distance>=25&&performance.now()-time<260;
  const pose=leaf.style.transform;
  leaf.classList.remove('swipe-leaf','swipe-backward','swipe-forward');
  leaf.style.removeProperty('transform');
  leaf.style.removeProperty('--swipe-shade');
  if(commit&&(farEnough||flick)&&canTurn(dir)){turn(dir,angle);return;}
  if(pose&&pageMotion()){
   leaf.style.transformOrigin=dir>0?'left center':'right center';
   const animation=leaf.animate([{transform:pose},{transform:leafPose(0,dir)}],{
    duration:200,easing:'cubic-bezier(.22,.8,.32,1)'
   });
   restoring=animation;
   animation.finished.catch(()=>{}).finally(()=>{
    if(restoring===animation)restoring=null;
    leaf.style.removeProperty('transform-origin');
   });
  }
 }
 spread.addEventListener('pointerup',event=>end(event,true));
 spread.addEventListener('pointercancel',event=>end(event,false));
 spread.addEventListener('lostpointercapture',event=>end(event,false));
 spread.addEventListener('pointerleave',event=>{if(gesture?.id===event.pointerId&&!gesture.leaf)gesture=null;});
 spread.addEventListener('click',event=>{
  if(ignoreClick&&event.detail){event.preventDefault();event.stopPropagation();ignoreClick=false;}
 },true);
}

export async function animateBookTurn(spread,oldPages,count,dir,angle=0){
 if(!pageMotion())return;
 const overlay=document.createElement('div');
 overlay.className=`book-flip ${dir>0?'forward':'backward'} ${count===1?'single':''}`;
 overlay.setAttribute('aria-hidden','true');
 overlay.inert=true;
 const nextPages=spread.querySelectorAll(':scope > .paper-page');
 const turningIndex=dir>0?count-1:0,landingIndex=dir>0?0:count-1;
 const front=oldPages[turningIndex];
 front.classList.add('flip-front');
 overlay.append(front);

 // The underside lands on the opposite side of a two-page spread.
 let still;
 if(count===2){
  const back=nextPages[landingIndex].cloneNode(true);
  back.classList.add('flip-back');
  overlay.append(back);
  still=oldPages[landingIndex];
  still.classList.add('flip-still',dir>0?'left':'right');
  still.setAttribute('aria-hidden','true');
  still.inert=true;
  spread.append(still);
 }
 spread.append(overlay);
 const finish=count===2?180:99;
 const duration=(count===2?610:430)-Math.round(angle*1.8);
 overlay.style.setProperty('--leaf-duration',duration+'ms');
 const animation=overlay.animate([
  {transform:leafPose(angle,dir)},
  {transform:leafPose(angle+(finish-angle)*.63,dir),offset:.55},
  {transform:leafPose(finish,dir)}
 ],{duration,easing:'cubic-bezier(.23,.62,.25,1)',fill:'both'});
 try{await animation.finished.catch(()=>{});}
 finally{still?.remove();overlay.remove();}
}
