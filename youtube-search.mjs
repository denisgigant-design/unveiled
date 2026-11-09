const keySlot='unveiled.youtube-search-key';
let activeKey='';

export function youtubeSearchKey(){
 try{return sessionStorage.getItem(keySlot)||activeKey;}catch{return activeKey;}
}

export function setYoutubeSearchKey(key){
 activeKey=key.trim();
 try{
  if(activeKey)sessionStorage.setItem(keySlot,activeKey);
  else sessionStorage.removeItem(keySlot);
 }catch{}
}

export function youtubeResultsURL(query){
 const url=new URL('https://www.youtube.com/results');
 url.searchParams.set('search_query',query);
 return url.href;
}

export async function findYoutubeVideos(query,key,signal){
 const url=new URL('https://www.googleapis.com/youtube/v3/search');
 url.search=new URLSearchParams({
  part:'snippet',type:'video',videoEmbeddable:'true',maxResults:'10',q:query,
  fields:'items(id/videoId,snippet(title,channelTitle))'
 });
 const response=await fetch(url,{headers:{'X-Goog-Api-Key':key},credentials:'omit',signal});
 if(response.status===403||response.status===429){
  throw Error('YouTube rejected the key or its search quota is exhausted. Check the key settings or open YouTube search.');
 }
 if(!response.ok)throw Error('YouTube search is unavailable. You can still search on YouTube or paste a video link.');
 const data=await response.json();
 const entityDecoder=document.createElement('textarea');
 const decode=value=>{
  entityDecoder.innerHTML=String(value||'').replaceAll('<','&lt;');
  return entityDecoder.value;
 };
 return (data.items||[]).filter(item=>/^[\w-]{11}$/.test(item?.id?.videoId||'')).map(({id,snippet})=>({
  id:'youtube-'+id.videoId,
  title:decode(snippet?.title)||'YouTube video · '+id.videoId,
  channel:decode(snippet?.channelTitle),
  url:'https://youtu.be/'+id.videoId
 }));
}
