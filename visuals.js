import {esc,EN_BOOKS,PL_BOOKS,VERSIONS} from './core.mjs';
import {palm,wordmark,veilMark} from './brand-assets.mjs?v=unveiled6';

const pictures={
 night:{file:'knights-night.png',title:'The Unveiled world',alt:'Two silver knights and the gold Unveiled Music knight against a black background'},
 day:{file:'knights-day.png',title:'One message. Many expressions.',alt:'The three Unveiled knights in silver, blue and gold'},
 city:{file:'knights-city.png',title:'Be still, and know',alt:'The two silver Unveiled knights in a city, with Psalm 46:10'},
 cathedral:{file:'knights-cathedral.png',title:'The Word, held close',alt:'Two silver Unveiled knights in blue cloaks inside a bright hall'},
 teaching1:{file:'members-preaching-01.png',title:'Dennis & Alex — Discipled in the Word',alt:'An Unveiled teaching scene with a Bible and a body, soul and spirit presentation'},
 teaching2:{file:'members-preaching-02.png',title:'Dennis & Alex — Discipled in the Word',alt:'An Unveiled teaching scene with a body, soul and spirit presentation behind the lectern'},
 mark:{file:'unveiled-simple-logo.jpg',title:'The Unveiled mark',alt:'The supplied white cross and opening veil mark on blue'},
 king:{file:'outreach-christ-is-king.png',title:'Christ is King',alt:'Unveiled Christ is King outreach image with a crowd in the city'},
 march:{file:'outreach-march.png',title:'The message, out in the open',alt:'Unveiled outreach image showing people taking part in a March for Jesus'},
 together:{file:'outreach-together.png',title:'Faith, together',alt:'Unveiled outreach image with people carrying signs about Jesus'}
};
const imageButton=(key,className='',caption='')=>{const p=pictures[key];return `<button class="brand-photo ${className}" data-brand-image="${key}" aria-label="View ${esc(p.title)}"><img src="assets/${p.file}" alt="${esc(p.alt)}" loading="lazy"><span class="photo-enlarge" aria-hidden="true">↗</span>${caption?`<span class="photo-caption">${caption}</span>`:''}</button>`;};
const bars=(className='')=>`<span class="room-wave ${className}" aria-hidden="true">${Array.from({length:13},(_,i)=>`<i style="--bar-height:${12+(i*17)%31}px;--bar-delay:${-i*.19}s"></i>`).join('')}</span>`;

export function leatherCover(mini=false){return `<span class="leather-volume ${mini?'mini-volume':''}" aria-hidden="true"><span class="leather-leaves"></span><span class="leather-spine"></span><span class="leather-front"><span class="cover-tooling"></span><span class="cover-edition">THE WORD OF GOD</span>${veilMark()}<span class="leather-title">THE<br>HOLY BIBLE</span><span class="leather-rule"></span><span class="leather-imprint">UNVEILED</span><span class="leather-verse">2 CORINTHIANS 3:16</span><span class="cover-corner corner-tl"></span><span class="cover-corner corner-tr"></span><span class="cover-corner corner-bl"></span><span class="cover-corner corner-br"></span></span><span class="leather-ribbon"></span></span>`;}

export function enhanceHome(ctx,root){
 const reading=ctx.read('reading',null),names=reading?.version==='bg'?PL_BOOKS:EN_BOOKS;
 const location=reading?`${names[reading.book]||'John'} ${reading.chapter||1} · ${VERSIONS[reading.version]?.short||'KJV'}`:'66 books. A little room to begin.';
 root.querySelector('.home-welcome')?.insertAdjacentHTML('beforeend',`<button class="plain-link replay-opening" data-replay-veil>${ctx.icon('veil')} Replay opening</button>`);
 const grid=root.querySelector('.rhythm-grid');
 if(grid)grid.outerHTML=`<div class="home-pathways"><button class="word-feature" data-route="bible"><span class="word-feature-copy"><span class="eyebrow">01 / READ &amp; REFLECT</span><h3>${reading?'Pick up the Word.':'Open something eternal.'}</h3><p>${esc(location)}</p><span class="plain-link">Open your Bible ${ctx.icon('arrow')}</span></span><span class="mini-book-scene">${leatherCover(true)}</span></button><div class="home-quiet-paths"><button class="quiet-path" data-route="prayer"><span class="path-number">02</span><span class="path-symbol">${ctx.icon('heart')}</span><span><span class="small-label">PRAY &amp; REMEMBER</span><h3>Room for what’s on your heart.</h3><p>Your private prayer and reflection journal.</p></span>${ctx.icon('arrow')}</button><button class="quiet-path" data-route="games"><span class="path-number">03</span><span class="path-symbol">${ctx.icon('games')}</span><span><span class="small-label">PLAY &amp; DISCOVER</span><h3>A little play. A deeper truth.</h3><p>Discover body, soul and spirit.</p></span>${ctx.icon('arrow')}</button></div></div>`;
 const bottom=root.querySelector('.home-bottom-grid');
 if(bottom)bottom.outerHTML=`<section class="home-music-feature"><div class="room-feature-copy"><p class="eyebrow">UNVEILED MUSIC</p><h2>Step into<br>the Music Room.</h2><p>A space for the message to be heard.</p><button class="button" data-route="media">Enter the Music Room ${ctx.icon('arrow')}</button></div><div class="home-room-instrument" aria-hidden="true"><span class="room-orbit orbit-a"></span><span class="room-orbit orbit-b"></span><span class="vinyl-record"><span>${veilMark()}</span></span>${bars()}</div><div class="gold-knight-portrait home-gold-knight" aria-hidden="true"><img src="assets/knights-night.png" alt=""></div></section><section class="home-reflection"><div class="reflection-picture">${imageButton('city')}</div><div class="reflection-copy"><p class="eyebrow">A MOMENT TO BE STILL</p><h2>Slow down.<br>Let the Word settle.</h2><p>Make a little space to read, pray and remember who God is.</p><button class="plain-link" data-passage="18,46,10,kjv">Read Psalm 46:10 ${ctx.icon('arrow')}</button><div class="reflection-brand">${veilMark()}<span>THE VEIL IS OPEN.<br>THE INVITATION IS YOURS.</span></div></div></section><section class="home-outreach-feature"><div><p class="eyebrow">BEYOND THESE PAGES</p><h2>Faith steps<br>into the world.</h2><p>Share the message. Serve the people.<br>Start with the person near you.</p><button class="button outline" data-route="outreach">Explore outreach ${ctx.icon('arrow')}</button></div>${imageButton('together','home-outreach-photo')}</section><section class="identity-spread"><div class="identity-copy"><button class="identity-mark" data-brand-image="mark" aria-label="View the Unveiled mark">${veilMark()}</button><p class="eyebrow">THE WORLD OF UNVEILED</p><h2>One message.<br>Many expressions.</h2><p>Scripture. Music. Prayer.<br>A faith that finds expression in life.</p></div><div class="identity-pictures">${imageButton('day','identity-day')}${imageButton('night','identity-night')}</div></section>`;
}

export function membersSection(){return `<section class="members-spread" aria-labelledby="members-heading"><div class="members-intro"><p class="eyebrow">MEMBERS / LEARNING TOGETHER</p><h2 id="members-heading">Dennis &amp; Alex.</h2><p class="members-subtitle">Discipled in the Word.</p><span class="members-line"></span><p>Open the Word. Learn together.<br>Let faith take shape in everyday life.</p></div><div class="members-pictures">${imageButton('teaching1','member-photo')}${imageButton('teaching2','member-photo')}</div><p class="members-shared-caption">DENNIS &amp; ALEX <span>·</span> DISCIPLED IN THE WORD</p></section>`;}

export function outreachVisual(ctx){return `<section class="outreach-story"><div class="outreach-story-copy">${veilMark()}<p class="eyebrow">UNVEILED / OUT IN THE OPEN</p><h2>Christ is King.<br><em>Let love be seen.</em></h2><p>The message belongs in everyday life — in the streets, in our conversations and in the way we serve.</p><button class="button" data-scroll-missions>Find a way to serve ${ctx.icon('arrow')}</button></div>${imageButton('king','outreach-lead-photo')}</section><section class="outreach-photo-pair" aria-label="Unveiled outreach pictures">${imageButton('march')}${imageButton('together')}</section>`;}

export function musicRoomIntro(ctx){return `<section class="music-room-stage"><div class="room-light room-light-one" aria-hidden="true"></div><div class="room-light room-light-two" aria-hidden="true"></div><div class="music-room-copy"><span class="room-door-sign">${veilMark()} UNVEILED MUSIC</span><h2>Let the message<br><em>find its sound.</em></h2><p>Your space to listen, discover and keep the music close.</p><button class="button" data-add-media>${ctx.icon('plus')} Bring a video into the room</button><div class="room-ambience">${bars()}<span>BEYOND THE VEIL.<br>INTO THE LIGHT.</span></div></div><div class="room-character"><div class="room-character-halo" aria-hidden="true"></div><button class="gold-knight-portrait" data-brand-image="night" aria-label="View the Unveiled Music knight"><img src="assets/knights-night.png" alt="The gold knight representing Unveiled Music"></button><span class="room-character-caption">THE SOUND OF UNVEILED</span></div><span class="room-stage-rule" aria-hidden="true"></span></section>`;}

export function playerMarkup(ctx,link=null,id=null){
 const screen=id?`<iframe class="video-frame" title="${esc(link.title)}" src="https://www.youtube-nocookie.com/embed/${id}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`:`<div class="room-player-empty">${veilMark()}<span class="small-label">THE MUSIC ROOM</span><h3>A little room for sound.</h3><p>Bring a song or a message into the room.</p><button class="button" data-add-media>${ctx.icon('plus')} Add a YouTube link</button></div>`;
 return `<section class="unveiled-player music-room-player" aria-label="Unveiled Music Room player"><div class="player-brandbar"><img src="assets/unveiled-logo.jpg" width="52" height="52" alt="Unveiled logo"><div>${wordmark()}<span class="player-category">THE MUSIC ROOM</span></div><span class="player-palm" aria-hidden="true">${palm()}</span></div><div class="player-room-trim" aria-hidden="true"><span class="trim-light"></span><span class="trim-label">UNVEILED MUSIC</span><span class="trim-dot"></span></div><div class="player-surround"><div class="player-screen">${screen}</div></div><div class="player-room-console" aria-hidden="true"><span class="console-dial"></span>${bars('console-wave')}<span class="console-veil">${veilMark()}</span><span class="console-dial dial-two"></span></div><div class="player-footer"><span>BEYOND THE VEIL. INTO THE LIGHT.</span>${id?`<a class="plain-link" href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">Open on YouTube ${ctx.icon('external')}</a>`:'<span>MAKE YOURSELF AT HOME.</span>'}</div></section>`;
}

export function showBibleCover(ctx,root,openReader){
 const reading=ctx.read('reading',null),names=reading?.version==='bg'?PL_BOOKS:EN_BOOKS;
 root.innerHTML=`<section class="bible-cover-entry"><div class="cover-introduction"><p class="eyebrow">THE WORD, HELD CLOSE</p><h1>A book to<br>live by.</h1><p>Open the cover.<br>Make a little room for the Word.</p><div class="cover-reading-note">${ctx.icon('bookmark')}<span>${reading?'Your place is waiting.':'Begin wherever you are.'}<strong>${reading?esc((names[reading.book]||'John')+' '+(reading.chapter||1)):'66 books · English & Polish'}</strong></span></div><button class="button" data-open-book>Open your Bible ${ctx.icon('arrow')}</button><p class="cover-edition-note">KJV · ASV 1901 · Biblia Gdańska 1881</p></div><div class="closed-book-stage"><span class="book-pool-light" aria-hidden="true"></span><button class="open-cover-button" data-open-book aria-label="Open the Unveiled Bible cover">${leatherCover()}</button><span class="cover-touch-note">OPEN THE WORD. LET THE LIGHT IN.</span></div></section><section class="cover-afterword">${imageButton('cathedral','cover-knights-picture')}<div>${veilMark()}<p class="eyebrow">BEYOND THE VEIL</p><h2>The invitation<br>is to come closer.</h2><p>Read at your own pace. Change the type size, save a verse, and return to the place you left.</p><button class="plain-link" data-open-book>Begin reading ${ctx.icon('arrow')}</button></div></section>`;
 let opening=false;
 root.querySelectorAll('[data-open-book]').forEach(button=>button.onclick=async()=>{
  if(opening)return;opening=true;
  root.querySelectorAll('[data-open-book]').forEach(b=>b.disabled=true);
  const front=root.querySelector('.open-cover-button .leather-front'),volume=root.querySelector('.open-cover-button .leather-volume');
  if(document.body.dataset.motion!=='off'&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
   const animation=front.animate([{transform:'rotateY(0deg)'},{transform:'rotateY(-135deg)'}],{duration:700,easing:'cubic-bezier(.25,.65,.2,1)',fill:'forwards'});
   volume.animate([{transform:'rotateY(-17deg) rotateZ(-6deg)'},{transform:'rotateY(0deg) rotateZ(0deg) scale(1.06)'}],{duration:700,fill:'forwards'});
   await animation.finished.catch(()=>{});
  }
  if(ctx.route!=='bible'||!root.contains(front))return;
  ctx.bibleOpened=true;openReader();
 });
}

export function initVisuals(ctx){
 let activeOpening=null,openingTimer;
 const reduce=matchMedia('(prefers-reduced-motion:reduce)');
 function syncReplay(){const button=document.querySelector('[data-replay-veil]');if(button){button.disabled=document.body.dataset.motion==='off'||reduce.matches;button.title=button.disabled?'Enable motion to replay the opening':'Replay the opening veil';}}
 function clearOpening(){clearTimeout(openingTimer);activeOpening?.remove();activeOpening=null;}
 function opening(replay=false){
  clearOpening();if(document.body.dataset.motion==='off'||reduce.matches)return;
  if(!replay){try{if(sessionStorage.getItem('unveiled.veil-intro.v1'))return;sessionStorage.setItem('unveiled.veil-intro.v1','seen');}catch{if(ctx.veilSeen)return;}ctx.veilSeen=true;}
  const el=document.createElement('div');el.className='opening-veil';
  el.innerHTML=`<div class="opening-panel opening-left" aria-hidden="true"></div><div class="opening-panel opening-right" aria-hidden="true"></div><div class="opening-light" aria-hidden="true"></div><div class="opening-identity" aria-hidden="true">${veilMark()}${wordmark()}<span>BEYOND THE VEIL. INTO THE LIGHT.</span></div><button class="skip-opening" aria-label="Skip opening animation">Skip animation ${ctx.icon('arrow')}</button>`;
  document.body.append(el);activeOpening=el;el.querySelector('button').onclick=clearOpening;
  openingTimer=setTimeout(clearOpening,1750);
 }
 document.addEventListener('click',event=>{
  const picture=event.target.closest('[data-brand-image]');
  if(picture){const p=pictures[picture.dataset.brandImage];if(!p)return;ctx.modal(p.title,`<figure class="art-lightbox supplied-picture"><img src="assets/${p.file}" alt="${esc(p.alt)}"><figcaption>${esc(p.title)}</figcaption></figure><a class="button outline full" href="assets/${p.file}" download>${ctx.icon('download')} Save image</a>`);}
  if(event.target.closest('[data-replay-veil]'))opening(true);
  if(event.target.closest('[data-reader-cover]')){ctx.bibleOpened=false;ctx.refresh();}
  if(event.target.closest('[data-scroll-missions]'))document.querySelector('.mission-grid')?.scrollIntoView({behavior:document.body.dataset.motion==='off'?'instant':'smooth',block:'start'});
  if(event.target.closest('button[data-motion]')){syncReplay();if(document.body.dataset.motion==='off')clearOpening();}
 });
 reduce.addEventListener('change',()=>{syncReplay();if(reduce.matches)clearOpening();});
 return {enter(){syncReplay();if(ctx.route==='home')opening();else clearOpening();}};
}
