// Deploy as a Worker and bind YOUTUBE_DATA_API_KEY as a secret.
const siteOrigin='https://denisgigant-design.github.io';

export default {
 async fetch(request,env){
  if(request.headers.get('Origin')!==siteOrigin)return new Response(null,{status:403});
  const headers={
   'Access-Control-Allow-Origin':siteOrigin,
   'Cache-Control':'no-store',
   Vary:'Origin'
  };
  const url=new URL(request.url);
  if(url.pathname!=='/search')return new Response(null,{status:404,headers});
  if(request.method!=='GET')return new Response(null,{status:405,headers:{...headers,Allow:'GET'}});
  const query=url.searchParams.get('q')?.trim();
  if(!query||query.length>160)return new Response(null,{status:400,headers});
  if(!env.YOUTUBE_DATA_API_KEY)return new Response(null,{status:503,headers});

  const youtube=new URL('https://www.googleapis.com/youtube/v3/search');
  youtube.search=new URLSearchParams({
   part:'snippet',type:'video',videoEmbeddable:'true',maxResults:'10',q:query,
   fields:'items(id/videoId,snippet(title,channelTitle))'
  });
  try{
   const result=await fetch(youtube,{headers:{'X-Goog-Api-Key':env.YOUTUBE_DATA_API_KEY},signal:request.signal});
   if(!result.ok)return new Response(null,{status:503,headers});
   const {items}=await result.json();
   return Response.json({items},{headers:{...headers,'Cache-Control':'private, max-age=300'}});
  }catch{
   return new Response(null,{status:502,headers});
  }
 }
};
