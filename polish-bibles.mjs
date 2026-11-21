import {EN_BOOKS} from './core.mjs';
export const POLISH={ubg:{module:'pol_ubg',name:'Uwspółcześniona Biblia Gdańska',source:'https://ebible.org/find/details.php?id=polubg',notice:'© 2018 Fundacja Wrota Nadziei · CC BY-ND 4.0'},nbg:{module:'pol_nbg',name:'Nowa Biblia Gdańska',source:'https://biblest.com.pl/NowaBibliaGdanska.html',notice:'© Śląskie Towarzystwo Biblijne · NBG 2012'}};
export const downloadPage = id => `https://sourceforge.net/projects/biblesuper/files/All%20Bibles%20-%20JSON/PL-Polish/${POLISH[id].module}.json/download`;
const expected=[50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42, 150, 31, 12, 8, 66, 52, 5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4, 28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1, 22];
// Preserve book/chapter/verse numbers, including intentional gaps and differences in versification.
export function normalizeBible(input){
 const source=Array.isArray(input)?input:input?.books;
 let out;
 if(Array.isArray(source)&&source.length===66&&source.every(b=>Array.isArray(b.chapters)&&b.chapters.every(Array.isArray))){out=source.map((b,i)=>({name:EN_BOOKS[i],chapters:b.chapters}));}
 else{
  out=EN_BOOKS.map(name=>({name,chapters:[]}));
  let count=0;
  function add(b,c,v,t){b=Number(b);c=Number(c);v=Number(v);if(!Number.isInteger(b)||b<1||b>66||!Number.isInteger(c)||c<1||c>150||!Number.isInteger(v)||v<1||v>200||typeof t!=='string')return;const chapters=out[b-1].chapters;while(chapters.length<c)chapters.push([]);const verses=chapters[c-1];while(verses.length<v)verses.push('');if(!verses[v-1]){verses[v-1]=t;count++;}}
  function walk(node,depth=0){if(!node||typeof node!=='object'||depth>9)return;if(Array.isArray(node)){for(const item of node)walk(item,depth+1);return;}if('text'in node && ('verse'in node||'verse_nr'in node||'verse_number'in node)){add(node.book??node.book_id??node.book_nr??node.book_number,node.chapter??node.chapter_nr??node.chapter_number,node.verse??node.verse_nr??node.verse_number,node.text);return;}for(const child of Object.values(node))walk(child,depth+1);}
  walk(input); if(count<30000)throw Error('This is not a complete Bible export.');
 }
 let count=0;for(let i=0;i<66;i++){const c=out[i].chapters;const min=expected[i]-(i===28||i===38?1:0);if(c.length<min||c.some(ch=>!Array.isArray(ch)||!ch.some(v=>typeof v==='string'&&v.length)||ch.some(v=>typeof v!=='string')))throw Error('Incomplete or invalid Bible: '+EN_BOOKS[i]);for(const ch of c)count+=ch.filter(Boolean).length;}if(count<30000)throw Error('Incomplete Bible');return out;
}
function db(){return new Promise((resolve,reject)=>{const r=indexedDB.open('unveiled-scripture-cache-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('editions');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function get(id){let d;try{d=await db();return await new Promise((ok,no)=>{const r=d.transaction('editions').objectStore('editions').get(id);r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);});}catch{return null;}finally{d?.close();}}
async function put(id,value){let d;try{d=await db();await new Promise((ok,no)=>{const tx=d.transaction('editions','readwrite');tx.objectStore('editions').put(value,id);tx.oncomplete=ok;tx.onerror=()=>no(tx.error);tx.onabort=()=>no(tx.error);});}catch{}finally{d?.close();}}
export async function importPolish(id,file){if(!POLISH[id])throw Error('Unknown edition');if(file.size>30*1024*1024)throw Error('File too large');const result=normalizeBible(JSON.parse((await file.text()).replace(/^\uFEFF/,'')));await put(id,result);return result;}
async function fetchJSON(url){const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),25000);try{const response=await fetch(url,{signal:ctrl.signal});if(!response.ok)throw Error('Download unavailable');return normalizeBible(await response.json());}finally{clearTimeout(timer);}}
export async function loadPolish(id){const cached=await get(id);if(cached)return normalizeBible(cached);const module=POLISH[id].module;const urls=[`./${id}.json`,`https://api.biblesupersearch.com/api/download?bible=${module}&format=json`];if(id==='ubg')urls.push('https://raw.githubusercontent.com/thiagobodruk/bible/master/json/pl_ubg.json');for(const url of urls){try{const result=await fetchJSON(url);await put(id,result);return result;}catch{}}throw Error('Polish Bible download unavailable. Import the complete JSON edition.');}
