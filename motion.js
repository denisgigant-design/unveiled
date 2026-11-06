export function initMotion(ctx) {
  const reduce=matchMedia('(prefers-reduced-motion:reduce)');
  let enabled=ctx.read('motion',!reduce.matches),observer,routeVersion=0;
  const ambient=document.querySelector('#ambient-scene');
  if(ambient)ambient.innerHTML=`<i class="ambient-beam beam-blue"></i><i class="ambient-beam beam-purple"></i><i class="ambient-orbit"></i>${Array.from({length:16},(_,i)=>`<span class="ambient-dust" style="--dust-x:${(i*37+11)%100}%;--dust-y:${(i*53+17)%100}%;--dust-delay:${-i*1.7}s;--dust-duration:${19+i%5*3}s"></span>`).join('')}`;
  function sync() {
    document.body.dataset.motion=enabled&&!reduce.matches?'on':'off';
    const b=document.querySelector('button[data-motion]');
    if(b){b.setAttribute('aria-pressed',String(enabled&&!reduce.matches));b.setAttribute('aria-label',enabled&&!reduce.matches?'Pause background motion':'Enable background motion');b.title=enabled&&!reduce.matches?'Pause motion':'Enable motion';}
  }
  function reveal(root=document.querySelector('#main')) {
    sync();if(document.body.dataset.motion==='off')return;
    observer?.disconnect();
    observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-revealed');observer.unobserve(entry.target);}
    }),{threshold:.07});
    root.querySelectorAll('.rhythm-card,.gallery-card,.game-feature,.team-value,.mission-card,.resource-card,.home-bottom-grid,.team-intro').forEach((el,i)=>{
      el.classList.add('reveal-item');el.style.setProperty('--reveal-delay',Math.min(i%3*75,150)+'ms');observer.observe(el);
    });
  }
  document.addEventListener('click',e=>{
    const toggle=e.target.closest('button[data-motion]');
    if(toggle){enabled=!(enabled&&!reduce.matches);ctx.save('motion',enabled);sync();if(!enabled)document.getAnimations().forEach(a=>{if(a.effect?.target?.closest?.('#ambient-scene,.brand-hero,.team-badge-scene'))a.cancel();});return;}
    if(document.body.dataset.motion==='off')return;
    const control=e.target.closest('button,a');
    if(!control||control.disabled)return;
    const box=control.getBoundingClientRect();
    if(box.width<3||box.height<3)return;
    const spark=document.createElement('span');spark.className='click-spark';
    spark.style.left=(e.clientX||box.left+box.width/2)+'px';spark.style.top=(e.clientY||box.top+box.height/2)+'px';
    spark.style.setProperty('--spark-colour',control.closest('.sidebar,.brand-hero')?'#61d9b0':'#3179c6');
    document.body.append(spark);setTimeout(()=>spark.remove(),650);
    if(control.matches('.icon-button,.round-button,.type-step'))
      control.animate([{transform:'scale(.84) rotate(-8deg)'},{transform:'scale(1) rotate(0deg)'}],{duration:290,easing:'cubic-bezier(.2,.8,.2,1)'});
    else if(control.matches('.rhythm-card,.gallery-card,.team-value,.game-feature button'))
      control.animate([{transform:'translateY(0) scale(.97)'},{transform:'translateY(-3px) scale(1.01)'},{transform:'translateY(0) scale(1)'}],{duration:340});
    else if(control.matches('.chip,.small-button,.colour-dot'))
      control.animate([{transform:'scale(.85)'},{transform:'scale(1.09)'},{transform:'scale(1)'}],{duration:250});
  },true);
  document.addEventListener('change',e=>{
    if(document.body.dataset.motion!=='off'&&e.target.matches('select'))
      e.target.animate([{boxShadow:'0 0 0 0 #38a78555'},{boxShadow:'0 0 0 8px #38a78500'}],{duration:420});
  });
  reduce.addEventListener('change',sync);
  document.addEventListener('visibilitychange',()=>document.body.classList.toggle('motion-paused',document.hidden));
  function enter() {
    reveal();const main=document.querySelector('#main');
    if(document.body.dataset.motion!=='off'&&ctx.route!=='bible'){
      const index=++routeVersion;
      main.animate([{opacity:0,transform:index%2?'translateY(14px)':'translateX(10px)'},{opacity:1,transform:'translate(0)'}],{duration:400,easing:'cubic-bezier(.2,.7,.2,1)'});
    }
  }
  sync();return {sync,reveal,enter};
}

