import {esc,uid,safeLink,youtubeID} from './core.mjs';
import {RESOURCES} from './data.mjs?v=unveiled9';
import {imageButton,musicRoomIntro} from './visuals.js?v=unveiled9';
import {featuredVideo} from './playback.js?v=unveiled9';

const rooms={
 music:{name:'Unveiled Music',playlist:'Music',file:'unveiled-music-frame.jpg',cut:[373,327,1163,737]},
 media:{name:'Unveiled Media',playlist:'Media',file:'unveiled-media-frame.jpg',cut:[392,338,1145,720]}
};
const roomOf=video=>video.room==='music'?'music':'media';
const videoKey=video=>youtubeID(video.url)||video.url;
const words=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/gi,'l').toLowerCase().trim();

/* Wide screens use the artwork’s opening. Narrow screens use unscaled drapery and handrails. */
function frameMarkup(kind){
 const {file,cut:[left,top,right,bottom]}=rooms[kind];
 const xs=[0,left,right,1536],ys=[0,top,bottom,864];
 const wide=span=>+(span/1536*100).toFixed(5);
 const style=`--art-left:${wide(left)}%;--art-right:${wide(1536-right)}%;--art-top:${wide(top)};--art-window:${wide(bottom-top)};--art-bottom:${wide(864-bottom)}`;
 const art=(className,x,y,width,height)=>`<svg class="${className}" viewBox="${x} ${y} ${width} ${height}" aria-hidden="true" focusable="false"><image href="assets/${file}" width="1536" height="864"/></svg>`;
 const slices=ys.slice(0,-1).flatMap((y,row)=>xs.slice(0,-1).map((x,col)=>{
  if(row===1&&col===1)return `<div class="watch-slot" data-player-slot="${kind}"></div>`;
  return art('watch-art-slice',x,y,xs[col+1]-x,ys[row+1]-y);
 })).join('');
 return `<div class="watch-frame" style="${style}"><div class="watch-grid">
  ${art('watch-mobile-art watch-mobile-crown',0,0,1536,top)}
  ${slices}
  ${art('watch-mobile-art watch-mobile-rail',0,bottom,1536,864-bottom)}
 </div></div>`;
}

function watchSection(ctx,kind){
 const {name,playlist}=rooms[kind];
 return `<section class="watch-section" data-watch-section="${kind}" aria-labelledby="watch-${kind}-title">
  <header class="section-heading">
   <div><p class="eyebrow">${kind==='music'?'MUSIC &amp; STUDIO':'TEACHING &amp; CONVERSATIONS'}</p><h2 id="watch-${kind}-title" tabindex="-1">${name}</h2></div>
   <button class="plain-link" data-add-video="${kind}">${ctx.icon('plus')} Add a link</button>
  </header>
  ${frameMarkup(kind)}
  <div class="watch-actions" data-watch-actions="${kind}"></div>
  <div class="watch-playlist">
   <div class="section-heading"><h3>${playlist} playlist</h3><span class="muted" data-playlist-scope></span></div>
   <div data-playlist="${kind}"></div>
  </div>
  ${kind==='music'?`${musicRoomIntro(ctx)}<section class="music-tree-feature" aria-labelledby="music-tree-title"><div><p class="eyebrow">UNVEILED MUSIC</p><h2 id="music-tree-title">The Tree of Life.</h2><p>The knights gather around the Tree of Life, lit in blue.</p></div>${imageButton('musicTree')}</section>`:''}
 </section>`;
}

export function media(ctx,root){
 root.innerHTML=`<div class="media-room">
  <div class="page-heading"><div><p class="eyebrow">UNVEILED / WATCH &amp; LISTEN</p><h1>Music &amp; Media Room.</h1><p>Find a video, play it here and keep it in your playlist.</p></div></div>
  <div class="watch-jumps">
   <button class="button outline" data-watch-jump="music">Unveiled Music</button>
   <button class="button outline" data-watch-jump="media">Unveiled Media</button>
   <button class="plain-link" data-replay-veil>${ctx.icon('veil')} Replay opening</button>
  </div>
  <section class="video-finder" aria-labelledby="video-finder-title">
   <h2 id="video-finder-title">Search videos</h2>
   <form role="search" class="video-search">
    <label class="sr-only" for="watch-query">Search videos by title or YouTube link</label>
    <div class="video-search-field">${ctx.icon('search')}<input id="watch-query" type="search" autocomplete="off" maxlength="2000" placeholder="Search by title or paste a YouTube link"></div>
    <label class="sr-only" for="watch-filter">Video section</label>
    <select id="watch-filter"><option value="all">Both sections</option><option value="music">Music</option><option value="media">Media</option></select>
   </form>
   <p class="video-search-hint">Search Unveiled’s featured and saved videos, or paste a YouTube video link.</p>
   <div class="video-results" data-video-results aria-live="polite"></div>
  </section>
  ${watchSection(ctx,'music')}
  ${watchSection(ctx,'media')}
 </div>`;
 const room=root.querySelector('.media-room');
 const input=room.querySelector('#watch-query'),filter=room.querySelector('#watch-filter');
 const results=room.querySelector('[data-video-results]');
 const slots=Object.fromEntries(Object.keys(rooms).map(kind=>[kind,room.querySelector(`[data-player-slot="${kind}"]`)]));
 const scopedLinks=()=>ctx.read('links',[]);
 let matches=[],lastWatchKey='';

 function jump(kind){
  const section=room.querySelector(`[data-watch-section="${kind}"]`);
  section.querySelector('h2').focus({preventScroll:true});
  section.scrollIntoView({block:'start',behavior:document.body.dataset.motion==='off'?'instant':'smooth'});
 }
 function searchIn(kind){
  filter.value=kind;
  input.focus();
  drawSearch();
 }
 function play(video){
  const kind=roomOf(video);
  ctx.playback.select({...video,room:kind},true);
  jump(kind);
 }
 function saved(video,kind){
  return scopedLinks().some(link=>videoKey(link)===videoKey(video)&&roomOf(link)===kind);
 }
 function drawSearch(){
  const term=input.value.trim(),kind=filter.value;
  const videos=[featuredVideo,...scopedLinks().filter(link=>youtubeID(link.url))];
  const exact=youtubeID(safeLink(term)||'');
  if(exact){
   const known=videos.find(video=>youtubeID(video.url)===exact);
   matches=[{...(known||{title:'YouTube video',url:'https://youtu.be/'+exact,needsTitle:true}),room:kind==='all'?roomOf(known||{}):kind}];
  }else{
   const query=words(term).split(/\s+/).filter(Boolean);
   const seen=new Set();
   matches=videos.filter(video=>{
    const section=roomOf(video),key=section+':'+videoKey(video);
    if((kind!=='all'&&section!==kind)||seen.has(key))return false;
    const haystack=words(video.title+' '+(video.keywords||'')+' '+rooms[section].name);
    if(!query.every(word=>haystack.includes(word)))return false;
    seen.add(key);
    return true;
   });
  }
  results.innerHTML=matches.length?matches.map((video,i)=>`
   <button class="video-result" data-play-result="${i}">
    <span class="video-result-icon">${ctx.icon('play')}</span>
    <span><small>${rooms[roomOf(video)].name}${video===featuredVideo?' · FEATURED':''}</small><strong>${esc(video.title)}</strong></span>
    ${ctx.icon('arrow')}
   </button>`).join(''):'<p class="video-search-empty">Try another title or paste a YouTube video link.</p>';
 }
 function drawWatch(force=false){
  const active=ctx.playback.current();
  const key=roomOf(active)+':'+videoKey(active)+':'+active.title;
  if(!force&&key===lastWatchKey)return;
  lastWatchKey=key;
  for(const [kind,slot] of Object.entries(slots)){
   const video=ctx.playback.forRoom(kind),isActive=roomOf(active)===kind;
   slot.dataset.active=String(isActive);
   slot.innerHTML=isActive?'':video
    ?`<button class="watch-cue" data-play-room="${kind}"><span>${ctx.icon('play')}</span>Play ${esc(video.title)}</button>`
    :`<button class="watch-cue" data-search-section="${kind}"><span>${ctx.icon('search')}</span>Find a music video</button>`;
   const actions=room.querySelector(`[data-watch-actions="${kind}"]`);
   actions.innerHTML=video?`<div class="watch-video-title"><span class="small-label">${video.id===featuredVideo.id?'FEATURED VIDEO':'SELECTED VIDEO'}</span><strong>${esc(video.title)}</strong></div>
    <button class="button outline" data-save-video="${kind}" ${saved(video,kind)?'disabled':''}>${ctx.icon(saved(video,kind)?'check':'bookmark')} ${saved(video,kind)?'Saved to playlist':'Save to '+rooms[kind].playlist+' playlist'}</button>
    <a class="plain-link" href="${esc(video.url)}" target="_blank" rel="noopener noreferrer">Open on YouTube ${ctx.icon('external')}</a>`
    :'<p class="muted">Choose a music video from search or add its link.</p>';
  }
 }
 function drawPlaylists(){
  const links=scopedLinks();
  room.querySelectorAll('[data-playlist-scope]').forEach(label=>{label.textContent=ctx.signedIn()?'YOUR DEVICE ACCOUNT':'THIS BROWSER';});
  for(const kind of Object.keys(rooms)){
   const list=room.querySelector(`[data-playlist="${kind}"]`);
   const rows=links.filter(link=>roomOf(link)===kind);
   list.innerHTML=rows.length?`<ul class="watch-playlist-list">${rows.map(link=>`<li>
    <button class="watch-playlist-item" data-open-saved="${esc(link.id)}">${ctx.icon(youtubeID(link.url)?'play':'external')} <span>${esc(link.title)}</span></button>
    <button class="icon-button" data-remove-video="${esc(link.id)}" aria-label="Remove ${esc(link.title)}">×</button>
   </li>`).join('')}</ul>`:'<p class="muted">Saved videos will appear here.</p>';
  }
 }
 function refreshLibrary(){drawPlaylists();drawSearch();drawWatch(true);}
 function saveVideo(video,kind,title=video.title){
  if(saved(video,kind)){ctx.toast('Already in your playlist.');return;}
  const link={id:uid(),title,url:video.url,room:kind};
  const persisted=ctx.save('links',[link,...scopedLinks()]);
  if(!room.isConnected)return;
  refreshLibrary();
  if(persisted)ctx.toast('Saved to your '+rooms[kind].playlist+' playlist.');
 }
 function saveSelection(kind){
  const video=ctx.playback.forRoom(kind);
  if(!video)return;
  if(!video.needsTitle){saveVideo(video,kind);return;}
  ctx.modal('Name your saved video',`<form class="entry-form">
   <label>Video title<input name="title" required maxlength="120" placeholder="Enter a title you’ll recognise"></label>
   <button class="button">Save to ${rooms[kind].playlist} playlist</button></form>`,body=>{
   body.querySelector('form').onsubmit=event=>{
    event.preventDefault();
    const title=new FormData(event.target).get('title').trim();
    if(!title)return;
    ctx.closeModal();
    saveVideo(video,kind,title);
   };
  });
 }
 function add(kind){
  ctx.modal('Add a video or link',`<form class="entry-form">
   <label>Title<input name="title" required maxlength="120" placeholder="A song, a teaching, a channel…"></label>
   <label>YouTube or other link<input name="url" type="url" required maxlength="2000" placeholder="https://…"></label>
   <label>Playlist<select name="room"><option value="music" ${kind==='music'?'selected':''}>Music</option><option value="media" ${kind==='media'?'selected':''}>Media</option></select></label>
   <p class="fine-print">YouTube videos play here. Other links open on their own website.</p>
   <button class="button">${ctx.icon('bookmark')} Save link</button>
  </form>`,body=>{
   body.querySelector('form').onsubmit=event=>{
    event.preventDefault();
    const values=new FormData(event.target),url=safeLink(values.get('url')),title=values.get('title').trim();
    if(!url||!title){ctx.toast('Enter a title and an https link.');return;}
    ctx.closeModal();
    saveVideo({title,url},values.get('room'));
   };
  });
 }
 room.querySelector('.video-search').onsubmit=event=>{event.preventDefault();drawSearch();};
 input.oninput=drawSearch;
 filter.onchange=drawSearch;
 room.addEventListener('click',event=>{
  const b=event.target.closest('button');
  if(!b)return;
  if(b.dataset.watchJump)jump(b.dataset.watchJump);
  if(b.dataset.searchSection)searchIn(b.dataset.searchSection);
  if(b.dataset.addVideo)add(b.dataset.addVideo);
  if(b.dataset.playResult!=null&&matches[b.dataset.playResult])play(matches[b.dataset.playResult]);
  if(b.dataset.playRoom){
   const video=ctx.playback.forRoom(b.dataset.playRoom);
   if(video)play(video);
  }
  if(b.dataset.saveVideo)saveSelection(b.dataset.saveVideo);
  if(b.dataset.openSaved){
   const video=scopedLinks().find(link=>link.id===b.dataset.openSaved);
   if(video&&youtubeID(video.url))play(video);
   else if(video)window.open(video.url,'_blank','noopener,noreferrer');
  }
  if(b.dataset.removeVideo){
   const links=scopedLinks(),removed=links.find(link=>link.id===b.dataset.removeVideo);
   if(!removed)return;
   ctx.save('links',links.filter(link=>link.id!==removed.id));
   refreshLibrary();
   ctx.toast('Removed from your playlist.',()=>{
    ctx.save('links',[removed,...scopedLinks().filter(link=>link.id!==removed.id)]);
    if(room.isConnected)refreshLibrary();
   });
  }
 });
 refreshLibrary();
 ctx.playback.attach(slots,drawWatch);
}
export function shop(ctx,root){root.innerHTML=`<div class="page-heading"><div><p class="eyebrow">THE UNVEILED RESOURCE SHELF</p><h1>A little help for the journey.</h1><p>Free resources for your daily walk.</p></div><span class="pill">${ctx.icon('heart')} FREELY RECEIVED. FREELY GIVEN.</span></div><section class="shop-intro"><span class="small-label">MADE TO BE USED</span><h2>Keep something<br><em>good</em> close.</h2><p>Explore the study pages, prayer journal and Scripture cards.</p><span class="shop-intro-art">${ctx.icon('feather')}</span></section><div class="section-heading"><h2>Free printables.</h2><span class="muted">3 free, printable resources</span></div><div class="resource-grid">${RESOURCES.map(r=>`<article class="resource-card"><div class="resource-cover-bg ${r.tone}"><div class="resource-cover"><span class="resource-cover-logo">U N V E I L E D</span><span class="resource-cover-icon">${ctx.icon(r.icon)}</span><h2>${r.title}</h2><span>${r.subtitle}</span><small>READ. REFLECT. LIVE.</small></div></div><div class="resource-info"><span class="small-label">${r.type}</span><h3>${r.subtitle}</h3><p>${r.description}</p><div><strong>Free</strong><a class="button outline" href="resources/${r.file}" download>${ctx.icon('download')} Download</a></div><a class="plain-link resource-preview" href="resources/${r.file}" target="_blank" rel="noopener noreferrer">Preview & print ${ctx.icon('external')}</a></div></article>`).join('')}</div><div class="resource-note">${ctx.icon('file')}<div><strong>Print them your way.</strong><p>Downloads open as printable HTML pages. Use your browser’s Print option for paper or Save as PDF.</p></div></div>`;}
