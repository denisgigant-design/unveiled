// Set to the deployed server’s /search URL when the site’s YouTube key is configured.
export const youtubeSearchEndpoint='';

export function youtubeResultsURL(query){
 const url=new URL('https://www.youtube.com/results');
 url.searchParams.set('search_query',query);
 return url.href;
}

export async function findYoutubeVideos(query,signal){
 const url=new URL(youtubeSearchEndpoint,location.href);
 url.searchParams.set('q',query);
 const response=await fetch(url,{credentials:'omit',signal});
 if(!response.ok)throw Error('YouTube search is temporarily unavailable. Open YouTube search or paste a link.');
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
