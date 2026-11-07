import {esc,uid,safeLink,youtubeID} from './core.mjs';
import {RESOURCES} from './data.mjs?v=unveiled7';
import {imageButton,musicRoomIntro,playerMarkup} from './visuals.js?v=unveiled7';

export function media(ctx,root){
 let selectedId=null;
 function draw(){
  const links=ctx.read('links',[]),videos=links.filter(link=>youtubeID(link.url));
  const selected=videos.find(link=>link.id===selectedId)||videos[0];
  selectedId=selected?.id||null;
  root.innerHTML=`<div class="page-heading"><div><p class="eyebrow">UNVEILED MUSIC / COME ON IN</p><h1>The Music Room.</h1><p>A little space to listen. A message to carry.</p></div><button class="button outline" data-add-media>${ctx.icon('plus')} Add a media link</button></div>${musicRoomIntro(ctx)}<section class="room-listening-deck" aria-labelledby="room-player-heading"><div class="section-heading"><div><p class="eyebrow">SETTLE IN &amp; LISTEN</p><h2 id="room-player-heading">The Unveiled player.</h2></div><span class="muted">YOUR ROOM. YOUR SELECTION.</span></div><div id="room-player">${playerMarkup(ctx,selected,selected?youtubeID(selected.url):null)}</div><p class="room-selection" tabindex="-1" data-player-title>${selected?`Selected: <strong>${esc(selected.title)}</strong>`:'Add a YouTube link to begin listening.'}</p></section><section class="listening-shelf"><div class="section-heading"><div><p class="eyebrow">YOUR LISTENING SHELF</p><h2>Keep the music close.</h2></div><button class="plain-link" data-add-media>${ctx.icon('plus')} Add a link</button></div><p class="media-shelf-note">Keep videos and channel links together. Your selections are saved on this browser.</p><div class="media-links-grid">${links.length?links.map(link=>`<article class="media-link-card ${link.id===selectedId?'selected-media':''}"><span class="media-link-icon">${ctx.icon(youtubeID(link.url)?'play':'external')}</span><span class="small-label">${esc(new URL(link.url).hostname.replace(/^www\./,''))}</span><h3>${esc(link.title)}</h3><div><button class="plain-link" data-view-media="${esc(link.id)}" ${youtubeID(link.url)?`aria-pressed="${link.id===selectedId}"`:''}>${youtubeID(link.url)?(link.id===selectedId?'In the player':'Play video'):'Open link'} ${ctx.icon('arrow')}</button><button class="icon-button" data-remove-media="${esc(link.id)}" aria-label="Remove ${esc(link.title)}">×</button></div></article>`).join(''):`<button class="add-media-empty" data-add-media>${ctx.icon('plus')}<strong>Bring something into the room.</strong><span>Add a YouTube video, music link or channel.</span></button>`}</div></section>`;
  root.insertAdjacentHTML('beforeend',`<section class="music-tree-feature" aria-labelledby="music-tree-title">
   <div><p class="eyebrow">UNVEILED MUSIC / IN THE ROOM</p><h2 id="music-tree-title">The Tree of Life.</h2>
   <p>The knights gather around the Tree of Life, lit in blue.</p></div>
   ${imageButton('musicTree')}
  </section>`);
  root.querySelectorAll('[data-add-media]').forEach(button=>button.onclick=add);
  root.querySelectorAll('[data-view-media]').forEach(button=>button.onclick=()=>{
   const link=links.find(link=>link.id===button.dataset.viewMedia);
   if(!link)return;
   if(youtubeID(link.url)){
    if(selectedId!==link.id){selectedId=link.id;draw();}
    root.querySelector('[data-player-title]').focus({preventScroll:true});
    root.querySelector('#room-player').scrollIntoView({behavior:document.body.dataset.motion==='off'?'instant':'smooth',block:'center'});
   }else window.open(link.url,'_blank','noopener,noreferrer');
  });
  root.querySelectorAll('[data-remove-media]').forEach(button=>button.onclick=()=>{
   const removed=links.find(link=>link.id===button.dataset.removeMedia);
   ctx.save('links',links.filter(link=>link.id!==button.dataset.removeMedia));draw();
   ctx.toast('Link removed.',()=>{ctx.save('links',[removed,...ctx.read('links',[])]);if(ctx.route==='media')draw();});
  });
 }
 function add(){
  ctx.modal('Bring a link into the room',`<form class="entry-form"><label>A name for this link<input name="title" required maxlength="120" placeholder="A song, a message, a channel…"></label><label>Video or social URL<input name="url" type="url" required maxlength="2000" placeholder="https://…"></label><p class="fine-print">YouTube videos play in the Unveiled player. Other links open on their own website.</p><div class="form-footer"><span>${ctx.icon('lock')} Saved on this browser</span><button class="button">Add to my shelf ${ctx.icon('plus')}</button></div></form>`,body=>body.querySelector('form').onsubmit=event=>{
   event.preventDefault();const data=new FormData(event.target),url=safeLink(data.get('url')),title=data.get('title').trim();
   if(!url||!title){ctx.toast('Use a title and a secure https:// link.');return;}
   const link={id:uid(),title,url};if(youtubeID(url))selectedId=link.id;
   ctx.save('links',[link,...ctx.read('links',[])]);ctx.closeModal();draw();ctx.toast('Added to your media shelf.');
  });
 }
 draw();
}
function apparel(){
 const colours=[['Black','shirtBlack'],['White','shirtWhite']];
 return `<section class="shop-apparel" aria-labelledby="apparel-title">
  <div class="section-heading"><div><p class="eyebrow">UNVEILED APPAREL / EXODUS 3</p><h2 id="apparel-title">The Burning Bush.</h2></div></div>
  <div class="apparel-grid">${colours.map(([colour,picture])=>`
   <article class="apparel-item">
    ${imageButton(picture)}
    <div class="apparel-copy"><span class="small-label">${colour}</span><h3>Burning Bush T-shirt</h3><strong class="apparel-price">€35</strong></div>
   </article>`).join('')}</div>
  <p class="apparel-note">Apparel preview. Select a shirt to see the full artwork.</p>
 </section>`;
}

export function shop(ctx,root){root.innerHTML=`<div class="page-heading"><div><p class="eyebrow">THE UNVEILED RESOURCE SHELF</p><h1>A little help for the journey.</h1><p>Burning Bush apparel and free resources for your daily walk.</p></div><span class="pill">${ctx.icon('heart')} FREELY RECEIVED. FREELY GIVEN.</span></div><section class="shop-intro"><span class="small-label">MADE TO BE USED</span><h2>Keep something<br><em>good</em> close.</h2><p>Explore the Burning Bush shirts, study pages, prayer journal and Scripture cards.</p><span class="shop-intro-art">${ctx.icon('feather')}</span></section>${apparel()}<div class="section-heading"><h2>Free printables.</h2><span class="muted">3 free, printable resources</span></div><div class="resource-grid">${RESOURCES.map(r=>`<article class="resource-card"><div class="resource-cover-bg ${r.tone}"><div class="resource-cover"><span class="resource-cover-logo">U N V E I L E D</span><span class="resource-cover-icon">${ctx.icon(r.icon)}</span><h2>${r.title}</h2><span>${r.subtitle}</span><small>READ. REFLECT. LIVE.</small></div></div><div class="resource-info"><span class="small-label">${r.type}</span><h3>${r.subtitle}</h3><p>${r.description}</p><div><strong>Free</strong><a class="button outline" href="resources/${r.file}" download>${ctx.icon('download')} Download</a></div><a class="plain-link resource-preview" href="resources/${r.file}" target="_blank" rel="noopener noreferrer">Preview & print ${ctx.icon('external')}</a></div></article>`).join('')}</div><div class="resource-note">${ctx.icon('file')}<div><strong>Print them your way.</strong><p>Downloads open as printable HTML pages. Use your browser’s Print option for paper or Save as PDF.</p></div></div>`;}
