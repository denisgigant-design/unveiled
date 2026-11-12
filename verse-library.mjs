import {EN_BOOKS,PL_BOOKS,VERSIONS,esc} from './core.mjs';

export function createVerseLibrary(ctx,onChange) {
  const key=v=>`${v.version}:${v.book}:${v.chapter}:${v.verse}`;
  const records=()=>ctx.read('bookmarks',[]);
  const folders=()=>ctx.read('verse-folders',[]);
  const get=v=>records().find(b=>key(b)===key(v));
  const folderName=id=>folders().find(f=>f.id===id)?.name||'General';
  const passageName=v=>`${(v.version==='bg'?PL_BOOKS:EN_BOOKS)[v.book]} ${v.chapter}:${v.verse}`;
  const colours=['gold','green','blue','pink'];

  function ensure() {
    if(ctx.read('verse-library-v52',0)===1)return;
    let existingFolders=[];
    try {
      // Legacy folder names are shared browser data; never import them into another account.
      const old=ctx.signedIn?.()?null:JSON.parse(localStorage.getItem('unveiled.v49.folder-library')||'null');
      if(Array.isArray(old?.folders))existingFolders=old.folders
        .filter(f=>f&&typeof f.name==='string'&&typeof f.id==='string')
        .slice(0,100).map(f=>({id:f.id,name:f.name.slice(0,65)}));
    }catch {}
    // One-time clean start: legacy highlights and bookmarks were unsynchronised.
    // Keep folder names and journal notes.
    ctx.save('bookmarks',[]);
    ctx.save('highlights',{});
    ctx.save('verse-folders',existingFolders);
    ctx.save('verse-library-v52',1);
  }
  function save(v,folderId='',colour='gold') {
    ensure();
    const items=records(),index=items.findIndex(b=>key(b)===key(v));
    const entry={
      version:v.version,book:Number(v.book),chapter:Number(v.chapter),verse:Number(v.verse),
      text:v.text||items[index]?.text||'',
      folderId:folders().some(f=>f.id===folderId)?folderId:'',
      highlight:colours.includes(colour)?colour:'gold'
    };
    if(index>=0)items[index]=entry;else items.unshift(entry);
    ctx.save('bookmarks',items);
    ctx.save('highlights',{});
    onChange();
    ctx.toast(`Verse saved in ${folderName(entry.folderId)}.`);
  }
  function remove(v) {
    ensure();
    ctx.save('bookmarks',records().filter(b=>key(b)!==key(v)));
    ctx.save('highlights',{});
    onChange();
    ctx.toast('Saved verse removed.');
  }
  function addFolder(raw) {
    ensure();
    const name=String(raw||'').trim().replace(/\s+/g,' ').slice(0,65);
    if(!name)return null;
    const existing=folders().find(f=>f.name.toLowerCase()===name.toLowerCase());
    if(existing)return existing.id;
    const list=folders();
    if(list.length>=100){ctx.toast('Maximum of 100 folders.');return null;}
    const id='folder-'+(globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2));
    list.push({id,name});ctx.save('verse-folders',list);
    return id;
  }
  function picker(v,highlight) {
    ensure();
    const current=get(v);
    const colour=colours.includes(highlight)?highlight:(current?.highlight||'gold');
    const tiles=[{id:'',name:'General'},...folders()];
    ctx.modal('Save verse',`
      <div class="verse-save-quick">
        <p class="verse-picker-reference">${esc(passageName(v))}</p>
        <p class="verse-picker-instruction">Save and highlight in:</p>
        <div class="verse-folder-choices">
          ${tiles.map(f=>`<button type="button" class="verse-folder-pick" data-pick-folder="${esc(f.id)}"><span aria-hidden="true">▣</span><span>${esc(f.name)}</span><span aria-hidden="true">›</span></button>`).join('')}
        </div>
        <div class="verse-new-folder"><input maxlength="65" type="text" aria-label="New folder name" placeholder="New folder name"><button type="button" data-add-folder>+ Add</button></div>
      </div>`,
      body=>{
        body.querySelectorAll('[data-pick-folder]').forEach(button=>button.onclick=()=>{
          save(v,button.dataset.pickFolder,colour);ctx.closeModal();
        });
        const input=body.querySelector('input');
        const add=()=>{
          const id=addFolder(input.value);
          if(!id){input.focus();return;}
          save(v,id,colour);ctx.closeModal();
        };
        body.querySelector('[data-add-folder]').onclick=add;
        input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();add();}};
      },'unveiled-quick-save');
  }
  function overview() {
    ensure();
    const items=records(),tiles=[{id:'',name:'General'},...folders()];
    ctx.modal('Saved verses',`
      <div class="verse-folder-home">
        <p class="folder-hint">Choose a folder to see its verses. The Bible stays on your last page behind this window.</p>
        <div class="verse-folder-tiles">
          ${tiles.map(f=>`<button class="verse-folder-tile" type="button" data-open-folder="${esc(f.id)}"><span class="verse-folder-symbol" aria-hidden="true">▣</span><span class="verse-folder-title">${esc(f.name)}</span><span class="verse-folder-count">${items.filter(b=>(b.folderId||'')===f.id).length}</span><span aria-hidden="true">›</span></button>`).join('')}
        </div>
        <div class="verse-new-folder"><input maxlength="65" type="text" aria-label="Create folder" placeholder="Create a folder"><button type="button" data-create-folder>+ New folder</button></div>
      </div>`,body=>{
        body.querySelectorAll('[data-open-folder]').forEach(b=>b.onclick=()=>openFolder(b.dataset.openFolder));
        const input=body.querySelector('input');
        const add=()=>{
          const id=addFolder(input.value);if(id)openFolder(id);else input.focus();
        };
        body.querySelector('[data-create-folder]').onclick=add;
        input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();add();}};
      },'unveiled-folders');
  }
  function openFolder(folderId) {
    const items=records().filter(b=>(b.folderId||'')===folderId);
    ctx.modal(`${folderName(folderId)} · Saved verses`,`
      <div class="verse-folder-detail">
        <button class="folder-glass-button" type="button" data-back-folders>‹ All folders</button>
        ${items.length?items.map(b=>`<article class="saved-verse">
          <button type="button" data-passage="${b.book},${b.chapter},${b.verse},${esc(b.version)}">
            <span class="small-label">${esc(VERSIONS[b.version]?.short||b.version)}</span>
            <strong>${esc(passageName(b))}</strong><span>${esc(b.text)}</span>
          </button>
          <button type="button" data-remove-verse="${esc(key(b))}" aria-label="Remove saved verse">×</button>
        </article>`).join(''):'<p class="folder-empty">No verses yet. Highlight one in the Bible to add it here.</p>'}
      </div>`,body=>{
        body.querySelector('[data-back-folders]').onclick=overview;
        body.querySelectorAll('[data-remove-verse]').forEach(b=>b.onclick=()=>{
          const entry=items.find(v=>key(v)===b.dataset.removeVerse);
          if(entry){remove(entry);openFolder(folderId);}
        });
      },'unveiled-folders');
  }
  return {ensure,get,records,folders,save,remove,picker,overview};
}
