import {TRAILS} from './data.mjs?v=unveiled8';
import {esc} from './core.mjs';

let mapData;
const zoomLevels=[1,1.45,2.1];

function projection(bounds,zoom,place){
 const [left,bottom,right,top]=bounds;
 const cosine=Math.cos((bottom+top)/2*Math.PI/180);
 const scale=Math.min(860/((right-left)*cosine),530/(top-bottom))*zoom;
 const cx=zoom===1?(left+right)/2:place.lon,cy=zoom===1?(bottom+top)/2:place.lat;
 return {
  project:([lon,lat])=>[450+(lon-cx)*cosine*scale,300-(lat-cy)*scale],
  view:[cx-450/(cosine*scale),cy-300/scale,cx+450/(cosine*scale),cy+300/scale],
  scale
 };
}

function pathLine(points,project,close=false){
 return points.map((p,i)=>`${i?'L':'M'}${project(p).map(n=>n.toFixed(1)).join(',')}`).join('')+(close?'Z':'');
}

function intersects(points,[left,bottom,right,top]){
 let west=Infinity,south=Infinity,east=-Infinity,north=-Infinity;
 for(const [x,y] of points){
  west=Math.min(west,x);south=Math.min(south,y);
  east=Math.max(east,x);north=Math.max(north,y);
 }
 return east>=left&&west<=right&&north>=bottom&&south<=top;
}

function areaPath(g,project,view){
 if(!g)return '';
 const polygons=g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];
 return polygons.filter(poly=>intersects(poly[0],view))
  .map(poly=>poly.map(ring=>pathLine(ring,project,true)).join('')).join('');
}

function riverPath(g,project,view){
 const lines=g.type==='LineString'?[g.coordinates]:g.type==='MultiLineString'?g.coordinates:[];
 return lines.filter(line=>intersects(line,view)).map(line=>pathLine(line,project)).join('');
}

function grid(project,[left,bottom,right,top],interval){
 const paths=[];
 for(let lon=Math.ceil(left/interval)*interval;lon<right;lon+=interval){
  paths.push(pathLine([[lon,bottom],[lon,top]],project));
 }
 for(let lat=Math.ceil(bottom/interval)*interval;lat<top;lat+=interval){
  paths.push(pathLine([[left,lat],[right,lat]],project));
 }
 return paths.join('');
}

function geographyLabels(trail,project){
 const labels=trail.id==='jesus'
  ?[['Mediterranean Sea',34.21,32.25,0,0],['Sea of Galilee',35.59,32.80,20,17],['Jordan River',35.55,32.30,17,0],['Dead Sea',35.46,31.52,21,0]]
  :[['Mediterranean Sea',30.27,34.41,0,0],['Aegean Sea',26.12,37.12,0,0],['Cyprus',33.15,35.06,0,26],['Lake Tuz',33.23,38.70,18,-12]];
 return labels.map(([label,lon,lat,dx,dy])=>{
  const [x,y]=project([lon,lat]);
  return `<text class="map-water-label" x="${x+dx}" y="${y+dy}">${label}</text>`;
 }).join('');
}

function mapArtwork(trail,selected,zoom){
 const place=trail.places[selected],{project,view,scale}=projection(trail.bounds,zoom,place);
 const {land,water}=mapData;
 const kilometres=trail.id==='jesus'?25:100;
 const distance=kilometres*scale/111.2;
 const route=pathLine(trail.places.map(stop=>[stop.lon,stop.lat]),project);
 const points=trail.places.map((stop,i)=>{
  const [x,y]=project([stop.lon,stop.lat]),active=i===selected;
  if(x<0||x>900||y<0||y>600)return '';
  const labelX=Math.max(15,Math.min(x+20,875-stop.name.length*12));
  return `<g class="map-point ${active?'active':''}" role="button" tabindex="0" aria-label="Explore ${esc(stop.name)}" aria-pressed="${active}" data-map-place="${i}">
   <circle class="map-hit-area" cx="${x}" cy="${y}" r="22"/>
   ${active?`<circle class="map-point-halo" cx="${x}" cy="${y}" r="22"/>`:''}
   <circle class="map-point-pin" cx="${x}" cy="${y}" r="${active?14:11}"/>
   <text class="map-point-index" x="${x}" y="${y}">${i+1}</text>
   ${active?`<text class="map-stop-label" x="${labelX}" y="${Math.max(28,y-24)}">${esc(stop.name)}</text>`:''}
   <title>${esc(stop.name)}</title>
  </g>`;
 }).join('');
 return `<svg viewBox="0 0 900 600" class="bible-map detailed-map" role="group" aria-label="Map of ${esc(trail.title)}">
  <defs><clipPath id="map-clip"><rect width="900" height="600"/></clipPath></defs>
  <rect class="map-sea" width="900" height="600"/>
  <g clip-path="url(#map-clip)">
   <g class="map-land">${land.features.map(f=>`<path d="${areaPath(f.geometry,project,view)}"/>`).join('')}</g>
   <path class="map-coordinate-grid" d="${grid(project,view,trail.id==='jesus'?.5:2)}"/>
   <g class="map-lakes">${water.lakes.map(lake=>`<path d="${areaPath(lake,project,view)}"/>`).join('')}</g>
   <g class="map-rivers">${water.rivers.map(river=>`<path d="${riverPath(river,project,view)}"/>`).join('')}</g>
   ${geographyLabels(trail,project)}
   <path class="map-route" d="${route}"/>
   ${points}
  </g>
  <g class="map-compass" transform="translate(854 52)" aria-hidden="true">
   <text x="0" y="-21" text-anchor="middle">N</text>
   <path d="M0 -12 11 17 0 12-11 17Z"/>
  </g>
  <g class="map-scale" transform="translate(30 561)" aria-hidden="true">
   <path d="M0 -5V5M0 0H${distance}M${distance} -5V5"/>
   <text y="22">${kilometres} km</text>
  </g>
 </svg>`;
}

export async function history(ctx,root){
 let trail=TRAILS[0],selected=0,zoomIndex=0;
 root.innerHTML='<div class="page-heading"><div><p class="eyebrow">THE WORD HAS A WORLD</p><h1>Step into the story.</h1></div></div><div class="loading-panel">Unfolding the map…</div>';
 try{
  if(!mapData){
   const [land,water]=await Promise.all(['data/map.json','map-details.json?v=unveiled8'].map(async url=>{
    const r=await fetch(url);
    if(!r.ok)throw Error();
    return r.json();
   }));
   mapData={land,water};
  }
 }catch{
  if(ctx.route==='history')root.querySelector('.loading-panel').innerHTML='<p>The map could not be loaded.</p><button class="button" data-route="history">Try again</button>';
  return;
 }
 if(ctx.route!=='history')return;
 function draw(focus=''){
  const p=trail.places[selected];
  root.innerHTML=`<div class="page-heading"><div><p class="eyebrow">THE WORD HAS A WORLD</p><h1>Step into the story.</h1><p>Explore the places behind the passages.</p></div><span class="pill">SCRIPTURE &amp; GEOGRAPHY</span></div>
   <div class="trail-selector">${TRAILS.map(t=>`<button class="trail-choice ${trail.id===t.id?'active':''}" data-trail="${t.id}" aria-pressed="${trail.id===t.id}"><span class="tile-icon ${t.id==='jesus'?'sage':'sand'}">${ctx.icon('map')}</span><span><small>${t.label}</small><strong>${t.title}</strong></span>${ctx.icon('arrow')}</button>`).join('')}</div>
   <div class="history-layout"><section class="map-card">
    <div class="map-title"><span>${ctx.icon('map')} ${trail.title}</span><div class="map-zoom" role="group" aria-label="Map zoom">
     <button data-map-zoom="-1" aria-label="Zoom out" ${zoomIndex===0?'disabled':''}>−</button>
     <span aria-live="polite">${Math.round(zoomLevels[zoomIndex]*100)}%</span>
     <button data-map-zoom="1" aria-label="Zoom in" ${zoomIndex===zoomLevels.length-1?'disabled':''}>+</button>
     <button data-map-reset ${zoomIndex===0?'disabled':''}>Reset</button>
    </div></div>
    ${mapArtwork(trail,selected,zoomLevels[zoomIndex])}
    <div class="map-key" aria-label="Map legend"><span><i></i> Waterways</span><span><i></i> Scripture stops</span><span><i></i> Order of stops</span></div>
    <div class="map-caption"><span>Approximate locations and distances.</span><a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth map data ↗</a></div>
   </section>
   <aside class="history-story">
    <span class="small-label">${trail.label} · PLACE ${selected+1} OF ${trail.places.length}</span><span class="history-place-number">${String(selected+1).padStart(2,'0')}</span>
    <p class="story-place">${p.name}</p><p class="map-coordinates">${p.lat.toFixed(3)}° N · ${p.lon.toFixed(3)}° E</p>
    <h2>${p.heading}</h2><p>${p.text}</p>
    <button class="button outline" data-passage="${p.book},${p.chapter},${p.v},kjv">Read ${p.ref} ${ctx.icon('arrow')}</button>
    <div class="story-controls"><button class="round-button" data-place-step="-1" ${!selected?'disabled':''} aria-label="Previous place">${ctx.icon('chevron','flipped')}</button><span>${selected+1} / ${trail.places.length}</span><button class="round-button" data-place-step="1" ${selected===trail.places.length-1?'disabled':''} aria-label="Next place">${ctx.icon('chevron')}</button></div>
   </aside></div>
   <div class="section-heading"><div><p class="eyebrow">FOLLOW THE PASSAGES</p><h2>The places along the way.</h2></div><p class="muted trail-intro">${trail.intro}</p></div>
   <div class="place-list">${trail.places.map((p,i)=>`<button class="place-stop ${i===selected?'active':''}" data-place="${i}" aria-pressed="${i===selected}"><span>${String(i+1).padStart(2,'0')}</span><strong>${p.name}</strong><small>${p.ref}</small>${ctx.icon('arrow')}</button>`).join('')}</div>
   <p class="fine-print history-footnote">The lines connect places in reading order. Ancient site identifications, including Derbe, are approximate. Acts 13–14 also describes Paul’s return journey.</p>`;
  root.querySelectorAll('[data-trail]').forEach(b=>b.onclick=()=>{
   trail=TRAILS.find(t=>t.id===b.dataset.trail);
   selected=0;zoomIndex=0;
   draw(`[data-trail="${trail.id}"]`);
  });
  root.querySelectorAll('[data-place],[data-map-place]').forEach(b=>{
   const attr=b.hasAttribute('data-map-place')?'data-map-place':'data-place';
   const pick=()=>{selected=+b.getAttribute(attr);draw(`[${attr}="${selected}"]`);};
   b.onclick=pick;
   if(attr==='data-map-place')b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick();}};
  });
  root.querySelectorAll('[data-place-step]').forEach(b=>b.onclick=()=>{
   selected=Math.max(0,Math.min(trail.places.length-1,selected+Number(b.dataset.placeStep)));
   draw(`[data-place-step="${b.dataset.placeStep}"]:not(:disabled)`);
  });
  root.querySelectorAll('[data-map-zoom]').forEach(b=>b.onclick=()=>{
   zoomIndex=Math.max(0,Math.min(zoomLevels.length-1,zoomIndex+Number(b.dataset.mapZoom)));
   draw(`[data-map-zoom="${b.dataset.mapZoom}"]:not(:disabled)`);
  });
  root.querySelector('[data-map-reset]').onclick=()=>{zoomIndex=0;draw('[data-map-zoom="1"]');};
  if(focus)root.querySelector(focus)?.focus({preventScroll:true});
 }
 draw();
}
