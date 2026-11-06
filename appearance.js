const moon='<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14.2A8.8 8.8 0 0 1 9.8 3.5 8.8 8.8 0 1 0 20.5 14.2Z"/></svg>';

export function initAppearance(ctx) {
  const system=matchMedia('(prefers-color-scheme: dark)');
  const valid=value=>value==='light'||value==='dark';
  let preference=ctx.read('appearance',null);
  if(!valid(preference))preference=null;
  const current=()=>preference||(system.matches?'dark':'light');
  function sync() {
    const dark=current()==='dark';
    document.documentElement.dataset.appearance=dark?'dark':'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#07111f':'#f7f8fc');
    const button=document.querySelector('button[data-theme-toggle]');
    if(button){
      button.innerHTML=`${dark?ctx.icon('sun'):moon}<span>${dark?'Light mode':'Dark mode'}</span>`;
      button.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');
      button.setAttribute('aria-pressed',String(dark));
      button.title=dark?'Switch to light mode':'Switch to dark mode';
    }
  }
  document.addEventListener('click',event=>{
    if(!event.target.closest('button[data-theme-toggle]'))return;
    preference=current()==='dark'?'light':'dark';
    ctx.save('appearance',preference);sync();
  });
  system.addEventListener('change',()=>{if(!preference)sync();});
  window.addEventListener('storage',event=>{
    if(event.key!=='unveiled.v1.appearance'&&event.key!==null)return;
    try{const value=event.newValue===null?null:JSON.parse(event.newValue);preference=valid(value)?value:null;}catch{preference=null;}
    sync();
  });
  sync();return {sync};
}
