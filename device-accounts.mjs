import {esc} from './core.mjs';

const prefix='unveiled.v1.device-account.';
const profileFields=new Set(['reading','reader-settings','book-colour','highlights','bookmarks','journal','missions','links']);
const encoder=new TextEncoder(),decoder=new TextDecoder();

function encodeBytes(bytes){
 let binary='';
 for(const byte of bytes)binary+=String.fromCharCode(byte);
 return btoa(binary);
}
const decodeBytes=value=>Uint8Array.from(atob(value),char=>char.charCodeAt(0));

export function createDeviceAccounts({
 getStorage=()=>globalThis.localStorage,
 crypto=globalThis.crypto,
 locks=globalThis.navigator?.locks,
 onSaveError=()=>{}
}={}){
 let session,changing=false;
 const random=size=>crypto.getRandomValues(new Uint8Array(size));
 const available=Boolean(crypto?.subtle&&locks?.request);
 function recordFor(id){
  try{
   const entry=JSON.parse(getStorage().getItem(prefix+id));
   return entry?.version===1&&entry.id===id&&typeof entry.name==='string'&&entry.name.length<=60
    ?entry:null;
  }catch{return null;}
 }
 function list(){
  const entries=[];
  try{
   const storage=getStorage();
   for(let i=0;i<storage.length;i++){
    const key=storage.key(i);
    if(!key?.startsWith(prefix))continue;
    const entry=recordFor(key.slice(prefix.length));
    if(entry)entries.push({id:entry.id,name:entry.name});
   }
  }catch{}
  return entries.sort((a,b)=>a.name.localeCompare(b.name));
 }
 function reserve(id){
  return new Promise((resolve,reject)=>{
   locks.request(prefix+id,{ifAvailable:true},lock=>{
    if(!lock){resolve(null);return;}
    return new Promise(release=>resolve(release));
   }).catch(reject);
  });
 }
 async function unlockKey(passphrase,salt){
  const password=await crypto.subtle.importKey('raw',encoder.encode(passphrase),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey(
   {name:'PBKDF2',hash:'SHA-256',salt,iterations:600000},password,{name:'AES-GCM',length:256},false,['encrypt','decrypt']
  );
 }
 function cipher(id,iv){
  return {name:'AES-GCM',iv,additionalData:encoder.encode(prefix+id)};
 }
 async function write(current){
  const iv=random(12);
  const sealed=await crypto.subtle.encrypt(cipher(current.id,iv),current.key,encoder.encode(JSON.stringify(current.data)));
  getStorage().setItem(prefix+current.id,JSON.stringify({
   version:1,id:current.id,name:current.name,salt:current.salt,iv:encodeBytes(iv),sealed:encodeBytes(new Uint8Array(sealed))
  }));
 }
 function flush(current){
  if(!current.pending){
   current.pending=(async()=>{
    while(current.dirty){
     current.dirty=false;
     try{await write(current);}catch(error){current.dirty=true;throw error;}
    }
   })().finally(()=>{current.pending=null;});
  }
  return current.pending;
 }
 async function transition(action){
  if(changing)throw Error('Wait for the current account action to finish.');
  changing=true;
  try{return await action();}
  finally{changing=false;}
 }
 async function create(name,passphrase){
  name=name.trim();
  if(!name||name.length>60||passphrase.length<12)throw Error('Enter a name and a passphrase of at least 12 characters.');
  return locks.request(prefix+'register',async()=>{
   if(session)throw Error('Sign out to create another device account.');
   if(list().some(entry=>entry.name.toLowerCase()===name.toLowerCase()))throw Error('Choose a different account name on this browser.');
   const id=crypto.randomUUID(),salt=random(16),key=await unlockKey(passphrase,salt);
   const release=await reserve(id);
   if(!release)throw Error('Choose Create account again.');
   const next={id,name,salt:encodeBytes(salt),key,release,data:{},dirty:false,pending:null};
   try{await write(next);session=next;}
   catch{release();throw Error('This browser could not save the account. Check its storage settings.');}
  });
 }
 async function signIn(id,passphrase){
  if(session)throw Error('Sign out to switch device accounts.');
  const release=await reserve(id);
  if(!release)throw Error('This account is open in another tab. Sign out there, then try again.');
  const entry=recordFor(id);
  try{
   if(!entry)throw Error();
   const key=await unlockKey(passphrase,decodeBytes(entry.salt));
   const clear=await crypto.subtle.decrypt(cipher(id,decodeBytes(entry.iv)),key,decodeBytes(entry.sealed));
   const data=JSON.parse(decoder.decode(clear));
   if(!data||Array.isArray(data)||typeof data!=='object')throw Error();
   session={id,name:entry.name,salt:entry.salt,key,release,data,dirty:false,pending:null};
  }catch{
   release();
   throw Error('The account could not be opened. Check your passphrase.');
  }
 }
 async function signOut(){
  const current=session;
  if(!current)return;
  try{await flush(current);}
  catch{throw Error('This browser could not save your changes. Export a backup from Your personal space.');}
  session=null;
  current.release();
 }
 return {
  available,list,
  create:(name,passphrase)=>transition(()=>create(name,passphrase)),
  signIn:(id,passphrase)=>transition(()=>signIn(id,passphrase)),
  signOut:()=>transition(signOut),
  get name(){return session?.name??null;},
  hasField(key){return Boolean(session&&profileFields.has(key));},
  read(key,fallback){return Object.hasOwn(session.data,key)?structuredClone(session.data[key]):fallback;},
  save(key,value){
   const current=session;
   current.data[key]=structuredClone(value);
   current.dirty=true;
   flush(current).catch(onSaveError);
   return true;
  }
 };
}

export function showDeviceAccount(ctx,accounts,onChange){
 function open(mode){
  if(accounts.name){
   ctx.modal('Your device account',`<div class="account-intro">
    <p>Signed in as <strong>${esc(accounts.name)}</strong>.</p>
    <p>Your account and saved reading data are stored on this browser.</p>
   </div><div class="account-actions">
    <button class="button outline" data-personal>Your personal space</button>
    <button class="button" data-sign-out>Sign out</button>
   </div><p class="account-status" role="status"></p>`,body=>{
    body.querySelector('[data-sign-out]').onclick=async event=>{
     const button=event.currentTarget;
     button.disabled=true;
     try{await accounts.signOut();onChange('Signed out of your device account.');}
     catch(error){button.disabled=false;body.querySelector('.account-status').textContent=error.message;}
    };
   });
   return;
  }
  if(!accounts.available){
   ctx.modal('Device accounts',`<p class="account-intro">Open Unveiled over HTTPS in a browser with secure device storage to create or sign in to an account.</p><button class="button outline" data-personal>Your personal space</button>`);
   return;
  }
  const profiles=accounts.list(),creating=mode==='create'||profiles.length===0;
  ctx.modal(creating?'Create a device account':'Sign in to your device account',`
   <p class="account-intro">This account keeps your journal, saved verses and reading settings on this browser. Your passphrase unlocks the account.</p>
   <form class="entry-form account-form" method="post">
    ${creating?'<label>Account name<input name="name" required maxlength="60" autocomplete="username"></label>'
     :`<label>Account<select name="id">${profiles.map(entry=>`<option value="${esc(entry.id)}">${esc(entry.name)}</option>`).join('')}</select></label>`}
    <label>Passphrase<input name="passphrase" type="password" required ${creating?'minlength="12"':''} maxlength="256" autocomplete="${creating?'new-password':'current-password'}"></label>
    ${creating?'<p class="fine-print">Use at least 12 characters. Keep a backup of anything you want to move to another device.</p>':''}
    <div class="account-actions">
     <button class="button" type="submit">${creating?'Create account':'Sign in'}</button>
     ${profiles.length?`<button class="plain-link" type="button" data-account-mode>${creating?'Sign in':'Create an account'}</button>`:''}
    </div><p class="account-status" role="status"></p>
   </form>`,body=>{
    const form=body.querySelector('form'),submit=form.querySelector('[type="submit"]'),modeButton=form.querySelector('[data-account-mode]');
    if(modeButton)modeButton.onclick=()=>open(creating?'sign-in':'create');
    form.onsubmit=async event=>{
     event.preventDefault();
     if(submit.disabled)return;
     const values=new FormData(form),passphrase=values.get('passphrase');
     submit.disabled=true;
     if(modeButton)modeButton.disabled=true;
     form.querySelector('.account-status').textContent='Opening your account…';
     try{
      if(creating)await accounts.create(values.get('name'),passphrase);
      else await accounts.signIn(values.get('id'),passphrase);
      onChange(creating?'Your device account is ready.':'Signed in to your device account.');
     }catch(error){
      form.querySelector('.account-status').textContent=error.message;
      submit.disabled=false;
      if(modeButton)modeButton.disabled=false;
     }
    };
   });
 }
 open('sign-in');
}
