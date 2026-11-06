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
  const front=oldPages[dir>0?count-1:0];
  const back=spread.querySelectorAll(':scope > .paper-page')[dir>0?0:count-1].cloneNode(true);
  front.classList.add('flip-front');back.classList.add('flip-back');
  overlay.append(front,back);
  let still;
  if(count===2) {
    still=oldPages[dir>0?0:1];still.classList.add('flip-still',dir>0?'left':'right');
    still.setAttribute('aria-hidden','true');still.inert=true;spread.append(still);
  }
  spread.append(overlay);
  const animation=overlay.animate([
    {transform:'rotateY(0deg)',filter:'brightness(1)'},
    {transform:`rotateY(${dir>0?-85:85}deg)`,filter:'brightness(.78)',offset:.48},
    {transform:`rotateY(${dir>0?-180:180}deg)`,filter:'brightness(1)'}
  ],{duration:680,easing:'cubic-bezier(.25,.65,.25,1)',fill:'forwards'});
  const halfway=setTimeout(()=>still?.remove(),330);
  try {await animation.finished.catch(()=>{});}
  finally {clearTimeout(halfway);still?.remove();overlay.remove();}
}

