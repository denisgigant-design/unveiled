import {esc,EN_BOOKS,PL_BOOKS,VERSIONS} from './core.mjs';
import {palm,wordmark,veilMark} from './brand-assets.mjs?v=unveiled6';
import {bookColourChoices,bookCoverImage,syncBookColour} from './book-reader.mjs?v=unveiled16';
import {veilSource,veilPanels} from './veil-art.mjs?v=unveiled8';

const pictures={
 night:{file:'knights-night.png',title:'The Unveiled world',alt:'Two silver knights and the gold Unveiled Music knight against a black background'},
 day:{file:'knights-day.png',title:'One message. Many expressions.',alt:'The three Unveiled knights in silver, blue and gold'},
 city:{file:'knights-city.png',title:'Be still, and know',alt:'The two silver Unveiled knights in a city, with Psalm 46:10'},
 cathedral:{file:'knights-cathedral.png',title:'The Word, held close',alt:'Two silver Unveiled knights in blue cloaks inside a bright hall'},
 teaching1:{file:'members-preaching-01.png',title:'Denis & Alex — Discipled in the Word',alt:'An Unveiled teaching scene with a Bible and a body, soul and spirit presentation'},
 teaching2:{file:'members-preaching-02.png',title:'Denis & Alex — Discipled in the Word',alt:'An Unveiled teaching scene with a body, soul and spirit presentation behind the lectern'},
 mark:{file:'unveiled-simple-logo.jpg',title:'The Unveiled mark',alt:'The supplied white cross and opening veil mark on blue'},
 king:{file:'outreach-christ-is-king.png',title:'Christ is King',alt:'Unveiled Christ is King outreach image with a crowd in the city'},
 march:{file:'outreach-march.png',title:'The message, out in the open',alt:'Unveiled outreach image showing people taking part in a March for Jesus'},
 knightPair:{file:'tree-of-life-green.jpg',title:'Alex and Denis at the Tree of Life',alt:'Alex, the crescent-helmet knight on the left, and Denis, the square-helmet knight on the right, beside the green Tree of Life'},
 denis:{file:'denis-knight-closeup.jpg',title:'Denis · The square helmet',alt:'Close-up of Denis’s engraved square helmet with gold cross and blue cloak'},
 musicLogo:{file:'unveiled-music-logo.jpg',title:'Unveiled Music',alt:'Unveiled Music emblem with gold lettering, a green palm, draped curtains and a knight with a lyre'},
 musicTree:{file:'tree-of-life-blue.jpg',title:'The Tree of Life · Unveiled Music',alt:'Three Unveiled knights gathered around the silver Tree of Life lit by blue flames'},
 alex:{file:'alex-knight-closeup.jpg',title:'Alex · The crescent helmet',alt:'Alex in a silver crescent-crested helmet, beside Psalm 27:1'},
 worship:{file:'teaching-worship.jpg',title:'Worship in action',alt:'Two knights contrast religious practice with serving a neighbour, with Mark 7:7 and Colossians 3:23'},
 preach:{file:'teaching-preach.jpg',title:'Preach the Word',alt:'One knight speaks about himself while the other opens the Bible and preaches the Word'},
 revelation:{file:'teaching-revelation.jpg',title:'Spiritual revelation',alt:'Two knights compare receiving the Word by the Spirit with approaching it through the carnal mind'},
 musicStudio:{file:'music-studio-knight.jpg',title:'Inside the Unveiled Music studio',alt:'The gold chrome knight at a mixing desk with a vocalist in the recording booth'},
 fellowshipStudio:{file:'fellowship-studio.jpg',title:'Inside the Women’s Fellowship studio',alt:'A woman reads Scripture in the Unveiled Women’s Fellowship recording studio'},
 membersOutreach:{file:'members-outreach.jpg',title:'Unveiled in the community',alt:'Members at an outdoor gathering beneath the Unveiled flag'},
 together:{file:'outreach-together.png',title:'Faith, together',alt:'Unveiled outreach image with people carrying signs about Jesus'}
};
export const imageButton=(key,className='',caption='')=>{const p=pictures[key];return `<button class="brand-photo ${className}" data-brand-image="${key}" aria-label="View ${esc(p.title)}"><img src="assets/${p.file}" alt="${esc(p.alt)}" loading="lazy"><span class="photo-enlarge" aria-hidden="true">↗</span>${caption?`<span class="photo-caption">${caption}</span>`:''}</button>`;};
const bars=(className='')=>`<span class="room-wave ${className}" aria-hidden="true">${Array.from({length:13},(_,i)=>`<i style="--bar-height:${12+(i*17)%31}px;--bar-delay:${-i*.19}s"></i>`).join('')}</span>`;

function leatherCover(ctx,mini=false){
 const cover=`<img class="leather-cover-art" data-bible-cover-image src="${bookCoverImage(ctx)}" width="1050" height="960" alt="">`;
 return `<span class="leather-volume ${mini?'mini-volume':''}" aria-hidden="true">
  ${mini?cover:`<span class="leather-endpaper">${veilMark()}<span>THE HOLY BIBLE</span></span>
   <span class="leather-front">${cover}<span class="leather-inside">${veilMark()}</span></span>`}
 </span>`;
}

export function enhanceHome(ctx,root){
 const reading=ctx.read('reading',null),names=reading?.version==='bg'?PL_BOOKS:EN_BOOKS;
 const location=reading?`${names[reading.book]||'John'} ${reading.chapter||1} · ${VERSIONS[reading.version]?.short||'KJV'}`:'66 books. A little room to begin.';
 root.querySelector('.personal-strip')?.insertAdjacentHTML('beforebegin',`<a class="fellowship-feature" href="#fellowship" data-route="fellowship">
  <img src="assets/womens-fellowship-logo.jpg" width="84" height="84" loading="lazy" alt="">
  <span><span class="eyebrow">UNVEILED / THE GARDEN</span><strong>Women’s Fellowship.</strong><span>Rooted in the Word. Growing together.</span></span>
  ${ctx.icon('arrow')}
 </a>`);
 root.querySelector('.home-welcome')?.insertAdjacentHTML('beforeend',`<button class="plain-link replay-opening" data-replay-veil>${ctx.icon('veil')} Replay opening</button>`);
 const grid=root.querySelector('.rhythm-grid');
 if(grid)grid.outerHTML=`<div class="home-pathways"><button class="word-feature" data-route="bible"><span class="word-feature-copy"><span class="eyebrow">01 / READ &amp; REFLECT</span><h3>${reading?'Pick up the Word.':'Open something eternal.'}</h3><p>${esc(location)}</p><span class="plain-link">Open your Bible ${ctx.icon('arrow')}</span></span><span class="mini-book-scene">${leatherCover(ctx,true)}</span></button><div class="home-quiet-paths"><button class="quiet-path" data-route="prayer"><span class="path-number">02</span><span class="path-symbol">${ctx.icon('heart')}</span><span><span class="small-label">PRAY &amp; REMEMBER</span><h3>Room for what’s on your heart.</h3><p>Your private prayer and reflection journal.</p></span>${ctx.icon('arrow')}</button><button class="quiet-path" data-route="games"><span class="path-number">03</span><span class="path-symbol">${ctx.icon('games')}</span><span><span class="small-label">PLAY &amp; DISCOVER</span><h3>A little play. A deeper truth.</h3><p>Discover body, soul and spirit.</p></span>${ctx.icon('arrow')}</button></div></div>`;
 const bottom=root.querySelector('.home-bottom-grid');
 if(bottom)bottom.outerHTML=`<section class="home-music-feature"><div class="room-feature-copy"><p class="eyebrow">UNVEILED MUSIC</p><h2>Step into<br>the Music &amp; Media Room.</h2><p>A space for the message to be heard.</p><button class="button" data-route="media">Enter the Music &amp; Media Room ${ctx.icon('arrow')}</button></div><div class="home-room-instrument" aria-hidden="true"><span class="room-orbit orbit-a"></span><span class="room-orbit orbit-b"></span><span class="vinyl-record"><span>${veilMark()}</span></span>${bars()}</div><div class="gold-knight-portrait home-gold-knight" aria-hidden="true"><img src="assets/knights-night.png" alt=""></div></section><section class="home-reflection"><div class="reflection-picture">${imageButton('city')}</div><div class="reflection-copy"><p class="eyebrow">A MOMENT TO BE STILL</p><h2>Slow down.<br>Let the Word settle.</h2><p>Make a little space to read, pray and remember who God is.</p><button class="plain-link" data-passage="18,46,10,kjv">Read Psalm 46:10 ${ctx.icon('arrow')}</button><div class="reflection-brand">${veilMark()}<span>THE VEIL IS OPEN.<br>THE INVITATION IS YOURS.</span></div></div></section><section class="home-outreach-feature"><div><p class="eyebrow">BEYOND THESE PAGES</p><h2>Faith steps<br>into the world.</h2><p>Share the message. Serve the people.<br>Start with the person near you.</p><button class="button outline" data-route="outreach">Explore outreach ${ctx.icon('arrow')}</button></div>${imageButton('together','home-outreach-photo')}</section><section class="identity-spread"><div class="identity-copy"><button class="identity-mark" data-brand-image="mark" aria-label="View the Unveiled mark">${veilMark()}</button><p class="eyebrow">THE WORLD OF UNVEILED</p><h2>One message.<br>Many expressions.</h2><p>Scripture. Music. Prayer.<br>A faith that finds expression in life.</p></div><div class="identity-pictures">${imageButton('day','identity-day')}${imageButton('night','identity-night')}</div></section>`;
}

export function membersSection(){
 return `<section class="members-knights" aria-labelledby="knights-heading">
  <header class="section-heading">
   <div><p class="eyebrow">THE WORLD OF UNVEILED</p><h2 id="knights-heading">The two knights.</h2></div>
   <span class="muted">THE TREE OF LIFE</span>
  </header>
  <div class="knights-gallery">
   <figure class="knights-pair">
    ${imageButton('knightPair')}
    <figcaption>
     <span><strong>Alex</strong><small>Crescent helmet · Left</small></span>
     <span><strong>Denis</strong><small>Square helmet · Right</small></span>
    </figcaption>
   </figure>
   <div class="knights-solos">
    <figure class="knight-detail">
     ${imageButton('denis')}
     <figcaption><strong>Denis</strong><small>Square helmet</small></figcaption>
    </figure>
    <figure class="knight-detail">
     ${imageButton('alex')}
     <figcaption><strong>Alex</strong><small>Crescent helmet</small></figcaption>
    </figure>
   </div>
  </div>
 </section>
 <section class="members-spread" aria-labelledby="members-heading">
  <div class="members-intro">
   <p class="eyebrow">MEMBERS / LEARNING TOGETHER</p>
   <h2 id="members-heading">Denis &amp; Alex.</h2>
   <p class="members-subtitle">Discipled in the Word.</p>
   <span class="members-line"></span>
   <p>Open the Word. Learn together.<br>Let faith take shape in everyday life.</p>
  </div>
  <div class="members-pictures">${imageButton('teaching1','member-photo')}${imageButton('teaching2','member-photo')}</div>
  <p class="members-shared-caption">DENIS &amp; ALEX <span>·</span> DISCIPLED IN THE WORD</p>
 </section>
 <p class="members-teaching-link"><button class="button outline" data-route="teaching">Explore Teaching Moments</button></p>
 <section class="members-community">
  ${imageButton('membersOutreach')}
  <div><p class="eyebrow">UNVEILED IN THE COMMUNITY</p><h2>Faith out in the open.</h2><p>Members and families gathered under the Unveiled flag.</p></div>
 </section>`;
}

export function teachingSection(){
 return `<section class="teaching-moments" aria-labelledby="teaching-heading">
  <header class="section-heading"><div><p class="eyebrow">SCRIPTURE IN EVERYDAY LIFE</p><h2 id="teaching-heading">Teaching Moments.</h2></div></header>
  <div class="teaching-grid">
   ${[['worship','Worship in action','Mark 7:7 · Colossians 3:23'],['preach','Preach the Word','A message worth sharing'],['revelation','Spiritual revelation','1 Corinthians 2:14 · Ephesians 1:17']].map(([art,title,subtitle])=>`
    <article class="teaching-card">${imageButton(art)}<h3>${title}</h3><p>${subtitle}</p></article>`).join('')}
  </div>
 </section>`;
}

export function outreachVisual(ctx){return `<section class="outreach-story"><div class="outreach-story-copy">${veilMark()}<p class="eyebrow">UNVEILED / OUT IN THE OPEN</p><h2>Christ is King.<br><em>Let love be seen.</em></h2><p>The message belongs in everyday life — in the streets, in our conversations and in the way we serve.</p><button class="button" data-scroll-missions>Find a way to serve ${ctx.icon('arrow')}</button></div>${imageButton('king','outreach-lead-photo')}</section><section class="outreach-photo-pair" aria-label="Unveiled outreach pictures">${imageButton('march')}${imageButton('together')}</section>`;}

export function musicRoomIntro(ctx){
 return `<section class="music-room-stage">
  <div class="room-light room-light-one" aria-hidden="true"></div>
  <div class="room-light room-light-two" aria-hidden="true"></div>
  <div class="music-room-copy">
   <span class="room-door-sign">${veilMark()} UNVEILED MUSIC</span>
   <h2>Let the message<br><em>find its sound.</em></h2>
   <p>Inside the Unveiled Music studio.</p>
   <button class="button outline" data-watch-jump="music">${ctx.icon('play')} Back to Music</button>
   <div class="room-ambience">${bars()}<span>BEYOND THE VEIL.<br>INTO THE LIGHT.</span></div>
  </div>
  <div class="room-character">
   <div class="room-character-halo" aria-hidden="true"></div>
   <div class="music-room-art">
    ${imageButton('musicLogo','music-room-emblem')}
    ${imageButton('musicStudio','music-room-portrait')}
   </div>

  </div>
  <span class="room-stage-rule" aria-hidden="true"></span>
 </section>`;
}

export function showBibleCover(ctx,root,openReader,prepareReader){
 const reading=ctx.read('reading',null),names=reading?.version==='bg'?PL_BOOKS:EN_BOOKS;
 root.innerHTML=`<section class="bible-cover-entry"><div class="cover-introduction"><p class="eyebrow">THE WORD, HELD CLOSE</p><h1>A book to<br>live by.</h1><p>Open the cover.<br>Make a little room for the Word.</p><div class="cover-reading-note">${ctx.icon('bookmark')}<span>${reading?'Your place is waiting.':'Begin wherever you are.'}<strong>${reading?esc((names[reading.book]||'John')+' '+(reading.chapter||1)):'66 books · English & Polish'}</strong></span></div><p class="cover-edition-note">KJV · ASV 1901 · Biblia Gdańska 1881</p></div><div class="closed-book-stage">${bookColourChoices(ctx)}<span class="book-pool-light" aria-hidden="true"></span><button class="open-cover-button" data-open-book aria-label="Open the Bible">${leatherCover(ctx)}</button><span class="cover-touch-note">TAP THE COVER TO READ</span></div></section><section class="cover-afterword"><div>${veilMark()}<p class="eyebrow">BEYOND THE VEIL</p><h2>The invitation<br>is to come closer.</h2><p>Read at your own pace. Change the type size, save a verse, and return to the place you left.</p></div></section>`;
 const coverButton=root.querySelector('[data-open-book]');
 coverButton.onclick=async()=>{
  coverButton.disabled=true;
  ctx.pendingPassage={book:0,chapter:1,verse:1,version:reading?.version||'kjv'};
  ctx.readerPageView='spread';
  prepareReader();
  const stage=root.querySelector('.closed-book-stage');
  const front=stage.querySelector('.leather-front'),volume=stage.querySelector('.leather-volume');
  if(document.body.dataset.motion!=='off'&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
   const rest=getComputedStyle(volume).transform;
   stage.classList.add('book-opening');
   const wide=matchMedia('(min-width:701px)').matches;
   const timing={duration:840,easing:'cubic-bezier(.32,.74,.24,1)',fill:'forwards'};
   const hinge=front.animate([
    {transform:'rotateY(0deg)'},
    {transform:'rotateY(-18deg)',offset:.2},
    {transform:'rotateY(-103deg)',offset:.63},
    {transform:`rotateY(${wide?-155:-112}deg)`}
   ],timing);
   volume.animate([
    {transform:rest},
    {transform:`translateX(${wide?'8%':'12%'}) rotateX(8deg) rotateY(0) rotateZ(0)`}
   ],timing);
   await hinge.finished.catch(()=>{});
  }
  if(ctx.route!=='bible'||!root.contains(front))return;
  ctx.bibleOpened=true;openReader();
 };
}

export function initVisuals(ctx){
 let activeOpening=null,openingTimer,lastRoute;
 const entrances={home:'home',team:'home',fellowship:'fellowship',media:'media'};
 const reduce=matchMedia('(prefers-reduced-motion:reduce)');
 function syncReplay(){
  document.querySelectorAll('[data-replay-veil]').forEach(button=>{
   button.disabled=reduce.matches;
   button.title=button.disabled?'Reduced motion is enabled on this device':'Replay the opening veil';
  });
 }
 function clearOpening(){
  clearTimeout(openingTimer);
  activeOpening?.remove();
  activeOpening=null;
 }
 function opening(route){
  clearOpening();
  const theme=entrances[route];
  if(reduce.matches||!theme)return;
  const identity=route==='fellowship'
   ?'<img src="assets/womens-fellowship-logo.jpg" width="96" height="96" alt=""><span>WOMEN’S FELLOWSHIP</span>'
   :route==='media'
    ?'<img src="assets/unveiled-music-logo.jpg" width="96" height="96" alt=""><span>MUSIC &amp; MEDIA ROOM</span>'
    :`${veilMark()}${wordmark()}<span>${route==='team'?'MEMBERS · DISCIPLED IN THE WORD':'BEYOND THE VEIL. INTO THE LIGHT.'}</span>`;
  const el=document.createElement('div');
  el.className='opening-veil';
  el.dataset.veilTheme=theme;
  el.dataset.veilRoute=route;
  el.dataset.waiting='';
  el.innerHTML=`<div class="opening-art" aria-hidden="true">${veilPanels(theme,'opening')}</div>
   <div class="opening-identity" aria-hidden="true">${identity}</div>
   <button class="skip-opening" aria-label="Skip opening animation">Skip animation ${ctx.icon('arrow')}</button>`;
  document.body.append(el);
  activeOpening=el;
  el.querySelector('button').onclick=clearOpening;
  el.querySelector('.opening-identity').onanimationend=()=>{if(activeOpening===el)clearOpening();};
  function reveal(){
   if(activeOpening!==el||!el.hasAttribute('data-waiting'))return;
   clearTimeout(openingTimer);
   el.removeAttribute('data-waiting');
   openingTimer=setTimeout(clearOpening,2500);
  }
  openingTimer=setTimeout(reveal,480);
  const art=new Image();
  art.src=veilSource(theme);
  art.decode().then(reveal,reveal);
 }
 document.addEventListener('click',event=>{
  const picture=event.target.closest('[data-brand-image]');
  if(picture){
   const p=pictures[picture.dataset.brandImage];
   if(!p)return;
   ctx.modal(p.title,`<figure class="art-lightbox supplied-picture"><img src="assets/${p.file}" alt="${esc(p.alt)}"><figcaption>${esc(p.title)}</figcaption></figure><a class="button outline full" href="assets/${p.file}" download>${ctx.icon('download')} Save image</a>`);
  }
  if(event.target.closest('[data-replay-veil]'))opening(ctx.route);
  if(event.target.closest('[data-reader-cover]')){ctx.bibleOpened=false;ctx.refresh();}
  const colour=event.target.closest('button[data-book-colour]');
  if(colour){ctx.save('book-colour',colour.dataset.bookColour);syncBookColour(ctx);}
  if(event.target.closest('[data-scroll-missions]'))document.querySelector('.mission-grid')?.scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'start'});
 });
 reduce.addEventListener('change',()=>{syncReplay();if(reduce.matches)clearOpening();});
 return {enter(){
  syncReplay();
  syncBookColour(ctx);
  if(ctx.route===lastRoute)return;
  lastRoute=ctx.route;
  opening(ctx.route);
 }};
}

