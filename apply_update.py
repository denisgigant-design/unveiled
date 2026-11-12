#!/usr/bin/env python3
"""Patch Unveiled v49–v51 to v52 without modifying artwork or assets.

Run from an extracted GitHub repo: python apply_update.py PATH_TO_UNVEILED
Or run without args: downloads the 4 source files from the public repository
into an 'unveiled-v52-ready' folder and creates upload-ready replacements.
"""
from pathlib import Path
import sys
import re
import urllib.request
import shutil

REPO = 'https://raw.githubusercontent.com/denisgigant-design/unveiled/main/'
ROOT = Path(sys.argv[1]).expanduser().resolve() if len(sys.argv)>1 else Path.cwd()/'unveiled-v52-ready'
ROOT.mkdir(parents=True, exist_ok=True)
NAMES=('reader.js','app.js','device-accounts.mjs','index.html')

for name in NAMES:
    p=ROOT/name
    if not p.exists():
        print('Downloading', name)
        try: p.write_bytes(urllib.request.urlopen(REPO+name,timeout=30).read())
        except Exception as ex: raise SystemExit('Could not retrieve '+name+': '+str(ex))
    shutil.copy2(p, ROOT/(name+'.before-v52'))

def replace_once(s,old,new,path):
    amount=s.count(old)
    if amount!=1: raise SystemExit(f'{path}: expected exactly one occurrence, found {amount}: {old[:110]}')
    return s.replace(old,new,1)

def regex_once(s,pattern,replacement,path,flags=0):
    updated,count=re.subn(pattern,replacement,s,count=1,flags=flags)
    if count!=1: raise SystemExit(f'{path}: required patch target missing: {pattern[:110]}')
    return updated

p=ROOT/'reader.js'; s=p.read_text()
s=replace_once(s,"import {simpleBookMark} from './opening-art.mjs?v=unveiled36';", "import {simpleBookMark} from './opening-art.mjs?v=unveiled36';\nimport {createVerseLibrary} from './verse-library.mjs?v=unveiled52';",p)
s=replace_once(s,"ctx.readerPageView='spread'; // Every Bible opening defaults to two visible pages.","ctx.readerPageView=ctx.read('reader-view','spread'); // Keep each reader's chosen page mode.",p)
s=replace_once(s,"let root,bible,run=0,selected=0,busy=false,pages=[],s=readingState();", "let root,bible,run=0,selected=0,busy=false,pages=[],s=readingState();\n const library=createVerseLibrary(ctx,()=>{if(ctx.route==='bible'&&bible&&root)draw();});",p)
s=replace_once(s,"const key=v=>`${s.version}:${s.book}:${s.chapter}:${v}`;", "const key=v=>`${s.version}:${s.book}:${s.chapter}:${v}`;\n const selectedRecord=()=>({version:s.version,book:s.book,chapter:s.chapter,verse:selected,text:bible?.[s.book]?.chapters?.[s.chapter-1]?.[selected-1]||''});",p)
s=replace_once(s,"const highlights=ctx.read('highlights',{}),saved=ctx.read('bookmarks',[]);", "library.ensure();const saved=library.records();",p)
s=replace_once(s,"const bookmarked=saved.some(mark=>mark.version===s.version&&mark.book===s.book&&mark.chapter===s.chapter&&mark.verse===verse.v);\n    const colour=highlights[key(verse.v)];", "const entry=library.get({version:s.version,book:s.book,chapter:s.chapter,verse:verse.v});\n    const bookmarked=Boolean(entry);\n    const colour=entry?.highlight;",p)
s=replace_once(s,"<button class=\"small-button\" data-bookmark>${ctx.icon('bookmark')} Save verse</button>","<button class=\"small-button\" data-bookmark aria-pressed=\"${!!library.get(selectedRecord())}\">${ctx.icon('bookmark')} ${library.get(selectedRecord())?'Saved verse':'Save verse'}</button>",p)
s=replace_once(s,"ctx.readerPageView=choice;draw();", "ctx.readerPageView=choice;ctx.save('reader-view',choice);draw();",p)
s=regex_once(s,r"if\(b\.dataset\.highlight\)\{const all=ctx\.read\('highlights',\{\}\);.*?\}\n   if\(b\.hasAttribute\('data-bookmark'\)\)\{.*?\n   \}", """if(b.dataset.highlight){
    if(!selected)return;
    const verse=selectedRecord();
    if(b.dataset.highlight==='none'){if(library.get(verse))library.remove(verse);}
    else library.picker(verse,b.dataset.highlight);
    return;
   }
   if(b.hasAttribute('data-bookmark')){
    if(!selected)return;
    const verse=selectedRecord();
    if(library.get(verse))library.remove(verse);else library.picker(verse);
    return;
   }""",p,flags=re.DOTALL)
s=regex_once(s,r" function bookmarks\(\)\{.*?\n \}\n function preferences\(\)", " function bookmarks(){library.overview();}\n function preferences()",p,flags=re.DOTALL)
s=replace_once(s,"ctx.readerPageView='spread';\n   ctx.bibleOpened", "ctx.readerPageView=ctx.read('reader-view','spread');\n   ctx.bibleOpened",p)
p.write_text(s)

p=ROOT/'app.js';s=p.read_text()
s=replace_once(s,"import {createReader} from './reader.js?v=unveiled18';", "import {createReader} from './reader.js?v=unveiled52';",p)
s=replace_once(s,"import {createDeviceAccounts,showDeviceAccount} from './device-accounts.mjs?v=unveiled8';", "import {createDeviceAccounts,showDeviceAccount} from './device-accounts.mjs?v=unveiled52';",p)
s=replace_once(s,"function render(route){ctx.route=route;", "function render(route){ctx.route=route;ctx.save('last-route',route);",p)
s=replace_once(s,"else if(route==='bible'){if(ctx.pendingPassage||ctx.readerSearchRequested)ctx.bibleOpened=true;if(ctx.bibleOpened)reader.render(main);else showBibleCover(ctx,main,()=>reader.render(main),()=>reader.prepare());}", "else if(route==='bible'){ctx.bibleOpened=true;reader.render(main);}",p)
s=replace_once(s,"shell();render(NAV.some(n=>n[0]===location.hash.slice(1))?location.hash.slice(1):'home');", """// Resume local encrypted device accounts before loading profile-specific reading data.
async function startUnveiled(){
 try{await accounts.resume();}catch(error){console.warn('Account auto-resume unavailable',error);}
 reader.reset();
 shell();
 const request=location.hash.slice(1);
 const remembered=ctx.read('last-route','home');
 const route=NAV.some(n=>n[0]===request)?request:NAV.some(n=>n[0]===remembered)?remembered:'home';
 if(!location.hash)history.replaceState(null,'',location.pathname+location.search+'#'+route);
 render(route);
}
startUnveiled();""",p)
p.write_text(s)

p=ROOT/'device-accounts.mjs';s=p.read_text()
s=replace_once(s,"const profileFields=new Set(['reading','reader-settings','book-colour','highlights','bookmarks','journal','missions','links']);", "const profileFields=new Set(['reading','reader-settings','reader-view','book-colour','highlights','bookmarks','verse-folders','verse-library-v52','last-route','journal','missions','links']);",p)
needle=" const random=size=>crypto.getRandomValues(new Uint8Array(size));"
new=""" const rememberIdKey=prefix+'remember-id';
 // CryptoKey is nonextractable; IndexedDB stores it by structured clone on this browser.
 function sessionDB(){return new Promise((resolve,reject)=>{
  if(!globalThis.indexedDB){reject(Error('IndexedDB unavailable'));return;}
  const request=indexedDB.open('unveiled-session-v52',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('keys');
  request.onerror=()=>reject(request.error);
  request.onsuccess=()=>resolve(request.result);
 });}
 async function remember(current){
  try{
   const db=await sessionDB();
   await new Promise((resolve,reject)=>{
    const tx=db.transaction('keys','readwrite');tx.objectStore('keys').put(current.key,'active');
    tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
   });db.close();getStorage().setItem(rememberIdKey,current.id);
  }catch(error){onSaveError(error);}
 }
 async function forgetRemembered(){
  try{getStorage().removeItem(rememberIdKey);}catch{}
  try{
   const db=await sessionDB();
   await new Promise((resolve,reject)=>{
    const tx=db.transaction('keys','readwrite');tx.objectStore('keys').delete('active');
    tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
   });db.close();
  }catch{}
 }
 async function resume(){
  let id;try{id=getStorage().getItem(rememberIdKey);}catch{return false;}
  if(!id||session||!available)return false;
  const entry=recordFor(id);if(!entry){await forgetRemembered();return false;}
  const release=await reserve(id);if(!release)return false;
  try{
   const db=await sessionDB();
   const key=await new Promise((resolve,reject)=>{
    const tx=db.transaction('keys','readonly'),request=tx.objectStore('keys').get('active');
    request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
   });db.close();if(!key)throw Error('Missing unlock key');
   const plain=await crypto.subtle.decrypt(cipher(id,decodeBytes(entry.iv)),key,decodeBytes(entry.sealed));
   const data=JSON.parse(decoder.decode(plain));
   if(!data||Array.isArray(data)||typeof data!=='object')throw Error('Invalid profile');
   session={id,name:entry.name,salt:entry.salt,key,release,data,dirty:false,pending:null};
   return true;
  }catch{release();await forgetRemembered();return false;}
 }
 const random=size=>crypto.getRandomValues(new Uint8Array(size));"""
s=replace_once(s,needle,new,p)
s=replace_once(s,"try{await write(next);session=next;}","try{await write(next);session=next;await remember(next);}",p)
s=replace_once(s,"session={id,name:entry.name,salt:entry.salt,key,release,data,dirty:false,pending:null};\n  }catch{", "session={id,name:entry.name,salt:entry.salt,key,release,data,dirty:false,pending:null};\n   await remember(session);\n  }catch{",p)
s=replace_once(s,"session=null;\n  current.release();", "session=null;\n  await forgetRemembered();\n  current.release();",p)
s=replace_once(s,"available,list,\n  create:","available,list,resume,\n  create:",p)
p.write_text(s)

p=ROOT/'index.html';s=p.read_text()
# Remove both obsolete reader interceptors, while leaving other dashboard code and v49 journal-folder logic intact.
s=regex_once(s,r'<script type="module" id="unveiled-reading-v51-js">.*?</script>', '',p, flags=re.DOTALL)
s=replace_once(s,"function enhanceSavedVerses(){\n    if(!dialog.open||dialogHeading.textContent!=='Your saved verses')return;", "function enhanceSavedVerses(){\n    return; // v52 owns the saved-verse folder UI.\n    if(!dialog.open||dialogHeading.textContent!=='Your saved verses')return;",p)
s=replace_once(s,"if(btn&&!btn.dataset.folderBypass){", "if(false&&btn&&!btn.dataset.folderBypass){ // v52 owns verse saves",p)
style='''<style id="unveiled-verse-v52-css">
/* Compact temporary picker, matching the active book; keep Bible visible. */
#site-dialog[data-variant="unveiled-quick-save"]{width:min(360px,calc(100vw - 30px));max-height:min(75svh,570px);overflow:auto;padding:15px;border-radius:17px;background:rgba(16,23,35,.78)!important;border:1px solid var(--bible-swatch,#6199ff)!important;box-shadow:0 16px 48px #0007;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);color:#eef5ff;}
#site-dialog[data-variant="unveiled-quick-save"]::backdrop{background:rgba(0,0,0,.13)!important;}
#site-dialog[data-variant="unveiled-quick-save"] .dialog-bar{padding:0 0 9px;margin-bottom:8px;}
.verse-save-quick,.verse-folder-home,.verse-folder-detail{display:grid;gap:11px;}
.verse-picker-reference{font-weight:700;margin:0;color:var(--bible-swatch,#83b2f5);}
.verse-picker-instruction,.verse-folder-home .folder-hint{margin:0;color:#cbd7e6;font-size:13px;}
.verse-folder-choices,.verse-folder-tiles{display:grid;gap:7px;}
.verse-folder-pick,.verse-folder-tile{width:100%;display:flex;align-items:center;gap:11px;min-height:48px;text-align:left;padding:11px 13px;color:#ecf5ff;border:1px solid #ffffff2d;border-radius:12px;background:#ffffff0d;cursor:pointer;}
.verse-folder-pick span:nth-child(2),.verse-folder-title{flex:1;font-weight:600;overflow-wrap:anywhere;}
.verse-folder-pick:hover,.verse-folder-tile:hover{border-color:var(--bible-swatch,#83b2f5);background:color-mix(in srgb,var(--bible-accent,#244f91) 35%,#ffffff13);}
.verse-new-folder{display:flex;gap:7px;align-items:center;}
.verse-new-folder input{min-width:0;flex:1;border-radius:9px;border:1px solid #ffffff40;color:#fff;background:#ffffff12;padding:11px;font:inherit;font-size:13px;}
.verse-new-folder button{border:1px solid #ffffff55;border-radius:9px;background:var(--bible-accent,#244f91);color:white;padding:10px;white-space:nowrap;}
.verse-folder-count{font-size:12px;background:#ffffff21;border-radius:40px;min-width:26px;text-align:center;padding:4px 7px;}
#site-dialog[data-variant="unveiled-folders"] .verse-folder-detail>.saved-verse{display:flex;align-items:center;gap:9px;}
#site-dialog[data-variant="unveiled-folders"] .verse-folder-detail>.saved-verse>button:first-child{flex:1;display:grid;gap:5px;min-width:0;text-align:left;background:transparent;color:inherit;border:0;}
#site-dialog[data-variant="unveiled-folders"] .verse-folder-detail>.saved-verse>button:last-child{min-width:31px;min-height:31px;color:#fff;border:1px solid #ffffff33;background:#ffffff11;border-radius:9px;}
@media(max-width:520px){.verse-folder-tiles{gap:6px}.verse-folder-tile{min-height:44px}}
</style>'''
s=replace_once(s,'</head>',style+'\n</head>',p)
p.write_text(s)

shutil.copy2(Path(__file__).with_name('verse-library.mjs'),ROOT/'verse-library.mjs')
print('\nUPDATE COMPLETE. Upload these five files to the root of GitHub repo denisgigant-design/unveiled:')
for name in (*NAMES,'verse-library.mjs'):
    print(' -',ROOT/name, '(', (ROOT/name).stat().st_size, 'bytes)')
print('Existing image assets, Bible datasets, styles and artwork stay untouched.')
