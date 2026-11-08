import {youtubeID} from './core.mjs';

export const featuredVideo={
 id:'featured-drCnVS5m_rU',
 title:'The Complete Gospel Explained',
 url:'https://youtu.be/drCnVS5m_rU',
 room:'media',
 keywords:'new to Christianity start here Denis Alex Unveiled Ministry faith truth purpose Bible Gospel'
};

let apiPromise;
function youtubeAPI(){
 if(window.YT?.Player)return Promise.resolve(window.YT);
 if(apiPromise)return apiPromise;
 apiPromise=new Promise((resolve,reject)=>{
  const previous=window.onYouTubeIframeAPIReady;
  const script=document.createElement('script');
  const timeout=setTimeout(()=>reject(Error('YouTube player API timed out')),16000);
  window.onYouTubeIframeAPIReady=()=>{
   clearTimeout(timeout);
   resolve(window.YT);
   previous?.();
  };
  script.src='https://www.youtube.com/iframe_api';
  script.async=true;
  script.onerror=()=>{clearTimeout(timeout);reject(Error('YouTube player API unavailable'));};
  document.head.append(script);
 });
 return apiPromise;
}

export function createPlayback(ctx){
 const host=document.querySelector('#persistent-player'),screen=host.querySelector('.persistent-screen');
 const title=host.querySelector('[data-dock-title]'),status=host.querySelector('[data-dock-status]');
 let remembered={media:featuredVideo};
 let current=featuredVideo,slots={},roomUpdate,frame,player,ready=false,failed=false,loadedId,engaged=false,playRequested=false,playing=false,dismissed=false,seenInline=false,raf;
 let notice='';
 const topbar=document.querySelector('#topbar');
 const resize=new ResizeObserver(scheduleLayout);
 resize.observe(document.querySelector('#main'));

 function showMode(mode){
  if(host.dataset.mode===mode)return;
  host.dataset.mode=mode;
  document.body.classList.toggle('has-floating-player',mode==='dock');
 }
 function layout(){
  raf=null;
  const slot=slots[current.room],box=slot?.isConnected?slot.getBoundingClientRect():null;
  const headerBottom=topbar.getBoundingClientRect().bottom;
  const visible=box&&box.bottom>headerBottom+Math.min(80,box.height/2)&&box.top<window.innerHeight-Math.min(80,box.height/2);
  if(visible){seenInline=true;dismissed=false;}
  const keepVisible=!dismissed&&(engaged||playRequested||Boolean(frame&&!ready&&seenInline));
  if(box&&(visible||!keepVisible)){
   showMode('inline');
   host.style.setProperty('--player-x',box.left+window.scrollX+'px');
   host.style.setProperty('--player-y',box.top+window.scrollY+'px');
   host.style.setProperty('--player-width',box.width+'px');
   host.style.setProperty('--player-height',box.height+'px');
  }else showMode(keepVisible?'dock':'parked');
 }
 function scheduleLayout(){if(raf==null)raf=requestAnimationFrame(layout);}
 function sync(){
  const pausable=playing||playRequested;
  document.querySelectorAll('[data-global-playback]').forEach(button=>{
   const action=failed?'Open player':pausable?'Pause':'Play';
   button.innerHTML=ctx.icon(pausable&&!failed?'pause':'play')+`<span>${action}</span>`;
   button.setAttribute('aria-label',action+' '+current.title);
   button.setAttribute('aria-pressed',String(pausable));
   button.title=action+' '+current.title;
  });
  title.textContent=current.title;
  status.textContent=notice;
  scheduleLayout();
  roomUpdate?.();
 }
 function frameURL(id){
  const params=new URLSearchParams({enablejsapi:'1',origin:location.origin,playsinline:'1',rel:'0'});
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
 }
 function setSelectedVideo(){
  const id=youtubeID(current.url);
  if(ready){
   if(id!==loadedId){
    loadedId=id;
    if(playRequested&&!document.hidden)player.loadVideoById(id);
    else player.cueVideoById(id);
   }else if(playRequested&&!document.hidden)player.playVideo();
  }else if(failed&&id!==loadedId){
   loadedId=id;
   frame.src=frameURL(id);
  }
 }
 function ensure(){
  if(frame)return;
  loadedId=youtubeID(current.url);
  frame=document.createElement('iframe');
  frame.className='video-frame';
  frame.title=current.title;
  frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.allowFullscreen=true;
  frame.referrerPolicy='strict-origin-when-cross-origin';
  frame.src=frameURL(loadedId);
  screen.append(frame);
  function unavailable(){
   failed=true;playRequested=false;
   notice='Use the playback controls inside the video.';
   setSelectedVideo();
   sync();
  }
  youtubeAPI().then(api=>{
   const readyTimeout=setTimeout(unavailable,16000);
   player=new api.Player(frame,{
    events:{
     onReady(event){
      clearTimeout(readyTimeout);
      player=event.target;ready=true;
      failed=false;notice='';
      playing=player.getPlayerState()===1;
      if(playing)engaged=true;
      if((document.hidden||dismissed)&&playing)pause();
      else setSelectedVideo();
      sync();
     },
     onStateChange({data}){
      playing=data===1||data===3;
      if(data===1){
       playRequested=false;
       engaged=true;
       notice='';
       if(document.hidden||dismissed){pause();return;}
      }
      if(data===0||data===2)playRequested=false;
      sync();
     },
     onAutoplayBlocked(){
      playRequested=false;playing=false;
      notice='Tap Play inside the video.';
      sync();
     },
     onError(){
      playRequested=false;playing=false;
      notice='Use the YouTube link if this video is unavailable in the player.';
      sync();
     }
    }
   });
  }).catch(unavailable);
 }
 function pause(){
  playRequested=false;
  playing=false;
  if(ready)player.pauseVideo();
  else if(frame)frame.src=frameURL(loadedId);
  sync();
 }
 function select(video,play=false){
  if(!youtubeID(video.url))return;
  const changed=youtubeID(current.url)!==youtubeID(video.url);
  current=video;
  remembered[video.room]=video;
  dismissed=false;
  if(changed)playing=false;
  notice='';
  playRequested=play&&!failed&&!document.hidden;
  if(play)engaged=true;
  ensure();
  frame.title=current.title;
  setSelectedVideo();
  sync();
 }
 function toggle(){
  if(failed){engaged=true;dismissed=false;sync();return;}
  if(playing||playRequested)pause();
  else select(current,true);
 }
 function reset(){
  remembered={media:featuredVideo};
  current=featuredVideo;
  engaged=false;dismissed=true;notice='';
  pause();
  if(frame){frame.title=current.title;setSelectedVideo();}
 }
 function attach(next={},update){
  for(const slot of Object.values(slots))resize.unobserve(slot);
  slots=next;roomUpdate=update;
  for(const slot of Object.values(slots))resize.observe(slot);
  if(slots[current.room])ensure();
  sync();
 }
 host.querySelector('[data-close-player]').onclick=()=>{
  dismissed=true;engaged=false;
  pause();
 };
 window.addEventListener('scroll',scheduleLayout,{passive:true});
 window.addEventListener('resize',scheduleLayout);
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&(playing||playRequested||(frame&&!ready&&seenInline)))pause();
  scheduleLayout();
 });

 return {
  attach,select,toggle,reset,
  current:()=>current,
  forRoom:room=>remembered[room]
 };
}
