import {coverPortrait,simpleBookMark} from './opening-art.mjs?v=unveiled34';
const reduced=()=>document.body.dataset.motion==='off'||matchMedia('(prefers-reduced-motion:reduce)').matches;
const frame=()=>new Promise(requestAnimationFrame);
const animate=(el,keys,duration)=>el.animate(keys,{duration,easing:'cubic-bezier(.35,.05,.2,1)',fill:'forwards'}).finished.catch(()=>{});
const imageReady=src=>new Promise(resolve=>{const i=new Image();i.onload=i.onerror=resolve;i.src=src;if(i.complete)resolve();});
function position(el,r){Object.assign(el.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});}
async function readerReady(){
 for(let i=0;i<300;i++){const s=document.querySelector('#reader-workspace .book-spread');if(s?.querySelector('.verse-line')&&s.getBoundingClientRect().height>80)return s;await frame();}
 throw Error('Reader did not finish loading');
}
async function openBook(button,original){
 if(button.dataset.unveiledOpening)return;
 button.dataset.unveiledOpening='true';
 const source=button.querySelector('.leather-volume')||button;
 const start=source.getBoundingClientRect();
 const colour=['navy','green','red','pink','purple'].includes(document.body.dataset.bookColour)?document.body.dataset.bookColour:'navy';
 const art=`assets/bible-open-${colour}.webp`;
 const gallery=button.querySelector('[data-bible-cover-image]')?.src||`assets/bible-cover-${colour}.webp`;
 const cinema=document.createElement('div');cinema.className='unveiled-book-cinema';cinema.setAttribute('aria-hidden','true');
 cinema.innerHTML=`<div class="cinema-backdrop"></div><div class="cinema-gallery"><img class="gallery-front" src="${gallery}" alt=""><img class="gallery-rear" src="${gallery}" alt=""></div><div class="cinema-landing" id="reader-workspace"></div><div class="cinema-cover"><div class="cinema-cover-face front"><div class="portrait-closed">${coverPortrait(colour)}</div><div class="portrait-unlatched">${coverPortrait(colour,true)}</div></div><div class="cinema-cover-face back"><div class="cinema-inside" style="background-image:url('${art}')">${simpleBookMark}</div></div></div>`;
 document.body.append(cinema);
 const flight=cinema.querySelector('.cinema-cover'),old=cinema.querySelector('.cinema-gallery'),landing=cinema.querySelector('.cinema-landing');
 position(old,start);position(flight,start);
 button.style.opacity='0';
 let dispatched=false;
 try{
  await Promise.all([imageReady(art),imageReady(`assets/bible-front-${colour}-closed.webp`),imageReady(`assets/bible-front-${colour}-unlatched.webp`)]);
  await Promise.all([
   animate(cinema.querySelector('.cinema-backdrop'),[{opacity:0},{opacity:1}],320),
   animate(old.querySelector('.gallery-rear'),[{transform:'translateY(0)',opacity:1},{transform:'translateY(95px) rotate(9deg)',opacity:0}],420),
   animate(old.querySelector('.gallery-front'),[{transform:'rotateY(-14deg)',opacity:1},{transform:'rotateY(0deg)',opacity:0}],520),
   animate(flight,[{opacity:0,transform:'rotateY(-14deg)'},{opacity:1,transform:'rotateY(0deg)'}],520)
  ]);
  old.remove();
  const savedMotion=document.body.dataset.motion;
  document.body.dataset.motion='off';
  try{dispatched=true;await original.call(button);}finally{if(savedMotion===undefined)delete document.body.dataset.motion;else document.body.dataset.motion=savedMotion;}
  const spread=await readerReady();
  spread.scrollIntoView({block:'center',behavior:'instant'});await frame();
  const box=spread.getBoundingClientRect();
  const right={left:box.left+box.width/2,top:box.top,width:box.width/2,height:box.height};
  position(landing,box);
  const clone=spread.closest('.book-shell').cloneNode(true);
  clone.style.margin='0';landing.append(clone);
  // The target is the real Genesis spread: its printed page is never a placeholder.
  await animate(flight,[{left:start.left+'px',top:start.top+'px',width:start.width+'px',height:start.height+'px'},{left:right.left+'px',top:right.top+'px',width:right.width+'px',height:right.height+'px'}],650);
  position(flight,right);
  await Promise.all([
   animate(cinema.querySelector('.portrait-closed'),[{opacity:1},{opacity:0}],450),
   animate(cinema.querySelector('.portrait-unlatched'),[{opacity:0,transform:'scaleX(.98)'},{opacity:1,transform:'scaleX(1)'}],450)
  ]);
  landing.style.opacity='1';
  await Promise.all([
   animate(flight,[{transform:'rotateY(0deg)'},{transform:'rotateY(-80deg)',offset:.48},{transform:'rotateY(-180deg)'}],1250),
   animate(landing,[{clipPath:'inset(0 0 0 50%)'},{clipPath:'inset(0 0 0 0)'}],1250)
  ]);
  // The inside cover and the real first leaf share the same colour and white mark.
  await animate(flight,[{opacity:1},{opacity:0}],180);
  await animate(cinema,[{opacity:1},{opacity:0}],260);
 }catch(error){console.warn('Bible opening:',error);if(!dispatched)await original.call(button);}
 finally{cinema.remove();button.style.removeProperty('opacity');delete button.dataset.unveiledOpening;}
}
document.addEventListener('click',event=>{
 const button=event.target.closest?.('button[data-open-book]');
 if(!button||button.disabled||event.defaultPrevented||typeof button.onclick!=='function')return;
 event.preventDefault();event.stopImmediatePropagation();
 if(reduced()){button.onclick.call(button);return;}
 openBook(button,button.onclick);
},true);
