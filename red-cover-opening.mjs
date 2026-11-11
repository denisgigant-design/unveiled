import {simpleBookMark} from './opening-art.mjs?v=unveiled35';
const tick=()=>new Promise(requestAnimationFrame);
const ease=t=>(1-Math.cos(Math.PI*t))/2;
const run=(el,frames,duration)=>el.animate(frames,{duration,easing:'cubic-bezier(.25,.7,.25,1)',fill:'forwards'}).finished.catch(()=>{});
const load=src=>new Promise(resolve=>{const i=new Image();i.onload=i.onerror=resolve;i.src=src;if(i.complete)resolve();});
const portrait=(open=false)=>`<svg viewBox="0 0 ${open?780:882} ${open?1058:1098}" preserveAspectRatio="none" overflow="visible"><image href="assets/bible-red-front-${open?'open':'closed'}.png" width="${open?968:882}" height="${open?1228:1273}"/></svg>`;
export async function openRedCover(button,original){
 if(button.dataset.unveiledOpening)return;button.dataset.unveiledOpening='true';
 const overlay=document.createElement('div');overlay.className='red-opening-cinema';overlay.setAttribute('aria-hidden','true');
 overlay.innerHTML=`<div class="red-opening-shade"></div><div class="red-opening-stage"><div class="red-opening-paper" id="reader-workspace"></div><div class="red-opening-cover"><div class="red-cover-face red-cover-front"><div class="red-cover-closed">${portrait()}</div><div class="red-cover-open">${portrait(true)}</div></div><div class="red-cover-face red-cover-inside"><div class="red-inside-paper">${simpleBookMark}</div></div></div></div>`;
 document.body.append(overlay);button.style.opacity='0';
 let called=false;
 try{
  await Promise.all([load('assets/bible-red-front-closed.png'),load('assets/bible-red-front-open.png'),load('assets/bible-open-red.webp')]);
  const old=document.body.dataset.motion;document.body.dataset.motion='off';
  try{called=true;await original.call(button);}finally{if(old===undefined)delete document.body.dataset.motion;else document.body.dataset.motion=old;}
  let spread;
  for(let n=0;n<360;n++){spread=document.querySelector('#reader-workspace .book-spread');if(spread?.querySelector('.verse-line'))break;await tick();}
  if(!spread?.querySelector('.verse-line'))throw Error('Genesis spread did not load');
  spread.scrollIntoView({block:'center',behavior:'instant'});await tick();
  const box=spread.getBoundingClientRect(),stage=overlay.querySelector('.red-opening-stage'),paper=overlay.querySelector('.red-opening-paper'),cover=overlay.querySelector('.red-opening-cover');
  Object.assign(stage.style,{left:box.left+'px',top:box.top+'px',width:box.width+'px',height:box.height+'px'});
  const clone=spread.closest('.book-shell').cloneNode(true);clone.style.margin='0';paper.append(clone);
  // The opening is framed around its centre; there is no separate slide right.
  const leaf=box.width/2;
  cover.style.width=leaf+'px';cover.style.left=box.width/4+'px';
  await run(stage,[{opacity:0,transform:'translateY(12px) scale(.94)'},{opacity:1,transform:'translateY(0) scale(1)'}],380);
  // Both supplied clasp states share the same registered hardcover rectangle.
  await Promise.all([run(overlay.querySelector('.red-cover-closed'),[{opacity:1},{opacity:0}],180),run(overlay.querySelector('.red-cover-open'),[{opacity:0,transform:'scaleX(.985)'},{opacity:1,transform:'scaleX(1)'}],220)]);
  const began=performance.now();
  await new Promise(resolve=>{
   function step(now){
    const p=Math.min(1,(now-began)/1150),a=ease(p)*Math.PI;
    // Reframe the expanding silhouette, keeping the whole book centred.
    const hinge=box.width/2-leaf/2*(1+Math.min(0,Math.cos(a)));
    cover.style.left=hinge+'px';cover.style.transform=`rotateY(${-a*180/Math.PI}deg)`;
    paper.style.transform=`translateX(${hinge-leaf}px)`;
    paper.style.clipPath=`inset(0 0 0 ${50*(1-ease(p))}%)`;
    paper.style.opacity=String(Math.min(1,p*5));
    if(p<1)requestAnimationFrame(step);else resolve();
   }requestAnimationFrame(step);
  });
  await run(cover,[{opacity:1},{opacity:0}],160);
  await run(overlay,[{opacity:1},{opacity:0}],220);
 }catch(e){console.warn('Red cover opening:',e);if(!called)await original.call(button);}
 finally{overlay.remove();button.style.removeProperty('opacity');delete button.dataset.unveiledOpening;}
}
