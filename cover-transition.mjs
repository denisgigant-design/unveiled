// Unveiled: cover -> animated first leaf -> real open reader.
// Does not replace the existing Bible navigation or stored reading position.
// Intercepts the cover button before its legacy hard-cut animation.
const NO_MOTION=()=>document.body.dataset.motion==='off'||matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const easing='cubic-bezier(.3,.7,.2,1)';
const motion=(el,frames,duration,ease=easing)=>el.animate(frames,{duration,easing:ease,fill:'forwards'}).finished.catch(()=>{});
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));

function loadImage(url){return new Promise(resolve=>{
 const image=new Image();image.onload=image.onerror=()=>resolve();image.src=url;
 if(image.complete)resolve();
});}
async function findReader(){
 for(let n=0;n<250;n++){
  const spread=document.querySelector('#reader-workspace .book-spread');
  if(spread&&spread.getBoundingClientRect().height>80)return spread;
  await wait(20);
 }
 return null;
}
function art(colour){return `assets/bible-open-${colour}.webp`;}
function createCinema(coverSrc,bookSrc){
 const container=document.createElement('div');
 container.className='unveiled-book-cinema';
 container.setAttribute('aria-hidden','true');
 container.innerHTML=`<div class="cinema-backdrop"></div>
  <div class="cinema-book"><img class="cinema-open-image" src="${bookSrc}" alt="">
   <div class="cinema-first-leaf" aria-hidden="true"></div></div>
  <div class="cinema-cover"><div class="cinema-cover-face front"><img src="${coverSrc}" alt=""></div>
   <div class="cinema-cover-face back"><div class="cinema-endpaper"><img src="assets/unveiled-simple-logo.jpg" alt=""><span>UNVEILED</span><small>THE WORD, OPENED</small></div></div>
  </div>`;
 document.body.append(container);
 return {container,backdrop:container.querySelector('.cinema-backdrop'),
   book:container.querySelector('.cinema-book'),cover:container.querySelector('.cinema-cover'),
   first:container.querySelector('.cinema-first-leaf')};
}
function place(el,box){Object.assign(el.style,{left:box.left+'px',top:box.top+'px',width:box.width+'px',height:box.height+'px'});}
function makeFirstLeaf(holder,bookSrc){
 holder.replaceChildren();
 const width=holder.clientWidth/2, height=holder.clientHeight;
 if(width<30)return () => {};
 const segments=28,stride=width/segments;
 for(let i=0;i<segments;i++){
  const strip=document.createElement('div');
  strip.className='cinema-first-strip';
  strip.style.width=(stride+.3)+'px';
  for(const side of ['front','back']){
   const face=document.createElement('div');face.className='cinema-first-face '+side;
   const crop=document.createElement('div');crop.className='cinema-first-crop';
   crop.style.width=width+'px';crop.style.left=(-i*stride)+'px';
   crop.style.backgroundImage=`url("${bookSrc}")`;
   crop.style.backgroundSize=`${width*2}px ${height}px`;
   crop.style.backgroundPosition=side==='front'?'right center':'left center';
   const logo=document.createElement('div');logo.className='cinema-leaf-logo';
   logo.innerHTML='<img src="assets/unveiled-simple-logo.jpg" alt=""><span>UNVEILED</span>';
   crop.append(logo);face.append(crop);strip.append(face);
  }
  holder.append(strip);
 }
 const strips=[...holder.children];
 return angle=>{
  const bend=55*Math.sin(Math.PI*angle/180);
  let x=0,z=0;
  strips.forEach((strip,i)=>{
   const u=(i+.5)/strips.length;
   const a=angle+bend*(2*u-1);
   const rad=a*Math.PI/180;
   strip.style.transform=`translate3d(${x.toFixed(2)}px,0,${z.toFixed(2)}px) rotateY(${-a}deg)`;
   x+=stride*Math.cos(rad);z+=stride*Math.sin(rad);
  });
 };
}
async function curlSheet(draw,ms=900){
 const start=performance.now();
 await new Promise(resolve=>{
  function frame(t){
   const p=clamp((t-start)/ms,0,1);
   const eased=(1-Math.cos(Math.PI*p))/2;
   draw(178*eased);
   if(p<1)requestAnimationFrame(frame);else resolve();
  }
  requestAnimationFrame(frame);
 });
}
async function openWithAnimation(button,original){
 if(button.dataset.unveiledOpening)return;
 button.dataset.unveiledOpening='true';
 const source=button.querySelector('.leather-volume')||button;
 const cover=button.querySelector('[data-bible-cover-image]');
 const initial=source.getBoundingClientRect();
 const colour=Object.keys({navy:1,pink:1,red:1,green:1,purple:1}).includes(document.body.dataset.bookColour)?document.body.dataset.bookColour:'navy';
 const bookSrc=art(colour),coverSrc=cover?.getAttribute('src')||`assets/bible-cover-${colour}.webp`;
 const {container,backdrop,book,cover:flight,first}=createCinema(coverSrc,bookSrc);
 place(flight,initial);
 flight.style.transform='rotate(-3deg)';
 button.style.opacity='0';
 let dispatched=false;
 try{
  const loading=loadImage(bookSrc);
  // Begin with the closed volume at its real position, so it does not jump.
  await Promise.all([loading,motion(backdrop,[{opacity:0},{opacity:.8}],340)]);
  // Let the existing controller create the reader, without its old cover flip.
  const oldMotion=document.body.dataset.motion;
  document.body.dataset.motion='off';
  try{await original.call(button);dispatched=true;}finally{
   if(oldMotion===undefined)delete document.body.dataset.motion;
   else document.body.dataset.motion=oldMotion;
  }
  const reader=await findReader();
  if(!reader)return;
  // The eventual landing rectangle is the real rendered open book, not a guess.
  reader.scrollIntoView({block:'center',behavior:'instant'});
  await new Promise(requestAnimationFrame);
  const destination=reader.getBoundingClientRect();
  const full={left:destination.left,top:destination.top,width:destination.width,height:destination.height};
  const right={left:full.left+full.width/2,top:full.top,width:full.width/2,height:full.height};
  place(book,full);makeFirstLeaf(first,bookSrc);
  // Cover glides into the right-hand position before its front swings open.
  const from={left:initial.left+'px',top:initial.top+'px',width:initial.width+'px',height:initial.height+'px',transform:'rotate(-3deg)'};
  const to={left:right.left+'px',top:right.top+'px',width:right.width+'px',height:right.height+'px',transform:'rotate(0deg)'};
  await motion(flight,[from,to],600);
  place(flight,right);flight.style.transform='rotate(0deg)';
  await motion(book.querySelector('img'),[{opacity:0},{opacity:1}],220);
  // Reveal the inner cover logo as the first hardcover leaf swings left.
  await motion(flight,[{transform:'rotateY(0deg)'},{transform:'rotateY(-84deg)',offset:.55},{transform:'rotateY(-177deg)'}],760,'cubic-bezier(.4,.4,.2,1)');
  flight.style.opacity='0';
  first.classList.add('visible');
  const renderCurl=makeFirstLeaf(first,bookSrc);
  renderCurl(0);
  await curlSheet(renderCurl,1050);
  // Blend with the already-present real pages; avoid any hard-cut jump.
  await motion(container,[{opacity:1},{opacity:0}],420,'ease-out');
 }catch(error){
  console.warn('Unveiled cover transition fallback:',error);
  if(!dispatched){try{await original.call(button);}catch{}}
 }finally{
  container.remove();
  button.style.removeProperty('opacity');
  delete button.dataset.unveiledOpening;
 }
}

document.addEventListener('click',event=>{
 const button=event.target.closest?.('button[data-open-book]');
 if(!button||event.defaultPrevented)return;
 const original=button.onclick;
 if(typeof original!=='function'||button.disabled)return;
 event.preventDefault();event.stopImmediatePropagation();
 if(NO_MOTION()){original.call(button);return;}
 openWithAnimation(button,original);
},true);
