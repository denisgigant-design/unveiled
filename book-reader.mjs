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

export async function animateBookTurn(spread,oldPages,count,dir) {
  if(matchMedia('(prefers-reduced-motion:reduce)').matches||document.body.dataset.motion==='off')return;
  const overlay=document.createElement('div');
  overlay.className=`book-flip ${dir>0?'forward':'backward'} ${count===1?'single':''}`;
  overlay.setAttribute('aria-hidden','true');overlay.inert=true;
  const nextPages=spread.querySelectorAll(':scope > .paper-page');
  const turningIndex=dir>0?count-1:0;
  const landingIndex=dir>0?0:count-1;
  const front=count===1&&dir<0?nextPages[0].cloneNode(true):oldPages[turningIndex];
  front.classList.add('flip-front');
  overlay.append(front);

  // On a spread the underside becomes the page on the opposite side of the spine.
  // On one-page layouts the leaf lifts away and reveals the page underneath it.
  let still;
  if(count===2){
    const back=nextPages[landingIndex].cloneNode(true);
    back.classList.add('flip-back');
    overlay.append(back);
    still=oldPages[landingIndex];
    still.classList.add('flip-still',dir>0?'left':'right');
  }else if(dir<0){
    still=oldPages[0];
    still.classList.add('flip-still','single');
  }
  if(still){
    still.setAttribute('aria-hidden','true');
    still.inert=true;
    spread.append(still);
  }
  spread.append(overlay);
  const direction=dir>0?-1:1;
  const keyframes=count===2?[
    {transform:'rotateY(0deg)'},
    {transform:`rotateY(${direction*24}deg) rotateZ(${direction*1.1}deg)`,offset:.19},
    {transform:`rotateY(${direction*94}deg) rotateZ(${direction*1.4}deg)`,offset:.53},
    {transform:`rotateY(${direction*180}deg)`}
  ]:[
    {transform:'rotateY(0deg)'},
    {transform:`rotateY(${direction*27}deg) rotateZ(${direction}deg)`,offset:.28},
    {transform:`rotateY(${direction*108}deg)`}
  ];
  const animation=overlay.animate(keyframes,{
    duration:count===2?760:560,
    direction:count===1&&dir<0?'reverse':'normal',
    easing:'cubic-bezier(.3,.68,.25,1)',
    fill:'both'
  });
  try {await animation.finished.catch(()=>{});}
  finally {still?.remove();overlay.remove();}
}
