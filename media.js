import {esc,uid,safeLink,youtubeID} from './core.mjs';
import {RESOURCES} from './data.mjs?v=unveiled8';
import {imageButton,musicRoomIntro,playerMarkup} from './visuals.js?v=unveiled8';

const featuredVideo = {
 id:'featured-drCnVS5m_rU',
 title:'Unveiled Music · Featured video',
 url:'https://youtu.be/drCnVS5m_rU'
};

export function media(ctx,root){
 let selectedId=featuredVideo.id;
 function showPlayer(){
  root.querySelector('[data-player-title]').focus({preventScroll:true});
  root.querySelector('#room-player').scrollIntoView({
   behavior:document.body.dataset.motion==='off'?'instant':'smooth',block:'center'
  });
 }
 function draw(){
  const savedLinks=ctx.read('links',[]);
  const links=[featuredVideo,...savedLinks.filter(link=>youtubeID(link.url)!==youtubeID(featuredVideo.url))];
  const selected=links.find(link=>link.id===selectedId&&youtubeID(link.url))||featuredVideo;
  selectedId=selected.id;
  root.innerHTML=`<div class="page-heading"><div><p class="eyebrow">UNVEILED MUSIC / COME ON IN</p><h1>The Music Room.</h1><p>A little space to listen. A message to carry.</p></div><button class="button outline" data-add-media>${ctx.icon('plus')} Add a media link</button></div>${musicRoomIntro(ctx)}<section class="room-listening-deck" aria-labelledby="room-player-heading"><div class="section-heading"><div><p class="eyebrow">SETTLE IN &amp; LISTEN</p><h2 id="room-player-heading">The Unveiled player.</h2></div><span class="muted">UNVEILED MUSIC</span></div><div id="room-player">${playerMarkup(ctx,selected,youtubeID(selected.url))}</div><p class="room-selection" tabindex="-1" data-player-title><strong>${esc(selected.title)}</strong></p></section><section class="listening-shelf"><div class="section-heading"><div><p class="eyebrow">YOUR LISTENING SHELF</p><h2>Keep the music close.</h2></div><button class="plain-link" data-add-media>${ctx.icon('plus')} Add a link</button></div><p class="media-shelf-note">Keep videos and channel links together. Your selections are saved on this browser.</p><div class="media-links-grid">${links.map(link=>`<article class="media-link-card ${link.id===selectedId?'selected-media':''}"><span class="media-link-icon">${ctx.icon(youtubeID(link.url)?'play':'external')}</span><span class="small-label">${link===featuredVideo?'FEATURED':esc(new URL(link.url).hostname.replace(/^www\./,''))}</span><h3>${esc(link.title)}</h3><div><button class="plain-link" data-view-media="${esc(link.id)}" ${youtubeID(link.url)?`aria-pressed="${link.id===selectedId}"`:''}>${youtubeID(link.url)?(link.id===selectedId?'In the player':'Play video'):'Open link'} ${ctx.icon('arrow')}</button>${link!==featuredVideo?`<button class="icon-button" data-remove-media="${esc(link.id)}" aria-label="Remove ${esc(link.title)}">×</button>`:''}</div></article>`).join('')}</div></section>`;
  root.insertAdjacentHTML('beforeend',`<section class="music-tree-feature" aria-labelledby="music-tree-title">
   <div><p class="eyebrow">UNVEILED MUSIC / IN THE ROOM</p><h2 id="music-tree-title">The Tree of Life.</h2>
   <p>The knights gather around the Tree of Life, lit in blue.</p></div>
   ${imageButton('musicTree')}
  </section>`);
  root.querySelectorAll('[data-add-media]').forEach(button=>button.onclick=add);
  root.querySelector('[data-show-player]').onclick=showPlayer;
  root.querySelectorAll('[data-view-media]').forEach(button=>button.onclick=()=>{
   const link=links.find(link=>link.id===button.dataset.viewMedia);
   if(!link)return;
   if(youtubeID(link.url)){
    if(selectedId!==link.id){selectedId=link.id;draw();}
    showPlayer();
   }else window.open(link.url,'_blank','noopener,noreferrer');
  });
  root.querySelectorAll('[data-remove-media]').forEach(button=>button.onclick=()=>{
   const removed=savedLinks.find(link=>link.id===button.dataset.removeMedia);
   ctx.save('links',savedLinks.filter(link=>link.id!==button.dataset.removeMedia));draw();
   ctx.toast('Link removed.',()=>{ctx.save('links',[removed,...ctx.read('links',[])]);if(ctx.route==='media')draw();});
  });
 }
 function add(){
  ctx.modal('Bring a link into the room',`<form class="entry-form"><label>A name for this link<input name="title" required maxlength="120" placeholder="A song, a message, a channel…"></label><label>Video or social URL<input name="url" type="url" required maxlength="2000" placeholder="https://…"></label><p class="fine-print">YouTube videos play in the Unveiled player. Other links open on their own website.</p><div class="form-footer"><span>${ctx.icon('lock')} Saved on this browser</span><button class="button">Add to my shelf ${ctx.icon('plus')}</button></div></form>`,body=>body.querySelector('form').onsubmit=event=>{
   event.preventDefault();const data=new FormData(event.target),url=safeLink(data.get('url')),title=data.get('title').trim();
   if(!url||!title){ctx.toast('Use a title and a secure https:// link.');return;}
   if(youtubeID(url)===youtubeID(featuredVideo.url)){
    selectedId=featuredVideo.id;
    ctx.closeModal();draw();showPlayer();
    return;
   }
   const link={id:uid(),title,url};if(youtubeID(url))selectedId=link.id;
   ctx.save('links',[link,...ctx.read('links',[])]);ctx.closeModal();draw();ctx.toast('Added to your media shelf.');
  });
 }
 draw();
}
export function shop(ctx,root){root.innerHTML=`<div class="page-heading"><div><p class="eyebrow">THE UNVEILED RESOURCE SHELF</p><h1>A little help for the journey.</h1><p>Free resources for your daily walk.</p></div><span class="pill">${ctx.icon('heart')} FREELY RECEIVED. FREELY GIVEN.</span></div><section class="shop-intro"><span class="small-label">MADE TO BE USED</span><h2>Keep something<br><em>good</em> close.</h2><p>Explore the study pages, prayer journal and Scripture cards.</p><span class="shop-intro-art">${ctx.icon('feather')}</span></section><div class="section-heading"><h2>Free printables.</h2><span class="muted">3 free, printable resources</span></div><div class="resource-grid">${RESOURCES.map(r=>`<article class="resource-card"><div class="resource-cover-bg ${r.tone}"><div class="resource-cover"><span class="resource-cover-logo">U N V E I L E D</span><span class="resource-cover-icon">${ctx.icon(r.icon)}</span><h2>${r.title}</h2><span>${r.subtitle}</span><small>READ. REFLECT. LIVE.</small></div></div><div class="resource-info"><span class="small-label">${r.type}</span><h3>${r.subtitle}</h3><p>${r.description}</p><div><strong>Free</strong><a class="button outline" href="resources/${r.file}" download>${ctx.icon('download')} Download</a></div><a class="plain-link resource-preview" href="resources/${r.file}" target="_blank" rel="noopener noreferrer">Preview & print ${ctx.icon('external')}</a></div></article>`).join('')}</div><div class="resource-note">${ctx.icon('file')}<div><strong>Print them your way.</strong><p>Downloads open as printable HTML pages. Use your browser’s Print option for paper or Save as PDF.</p></div></div>`;}
