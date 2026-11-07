function drapes(){
 return `<svg class="garden-drapes" viewBox="0 0 1000 670" preserveAspectRatio="none" aria-hidden="true">
  <defs>
   <linearGradient id="fellowship-velvet" x1="0" x2="1" y1="0" y2=".18">
    <stop offset="0" stop-color="#210e26"/><stop offset=".21" stop-color="#662343"/>
    <stop offset=".43" stop-color="#b1547a"/><stop offset=".56" stop-color="#4c183b"/>
    <stop offset=".79" stop-color="#9f3d66"/><stop offset="1" stop-color="#3c122c"/>
   </linearGradient>
   <linearGradient id="fellowship-braid" x1="0" x2="1" y1="0" y2="1">
    <stop offset="0" stop-color="#a65d61"/><stop offset=".44" stop-color="#ffd1a6"/><stop offset="1" stop-color="#6a323d"/>
   </linearGradient>
   <g id="fellowship-drape">
    <path d="M0 0H492C382 74 236 82 165 194C106 289 138 495 58 670H0Z" fill="url(#fellowship-velvet)"/>
    <path d="M436 0C346 48 209 83 147 179C81 284 106 516 33 670M321 0C214 50 143 74 97 172C50 271 62 483 14 641" fill="none" stroke="#e284a0" stroke-opacity=".37" stroke-width="6"/>
    <path d="M490 0C385 72 234 83 165 194C103 292 137 498 58 670" fill="none" stroke="url(#fellowship-braid)" stroke-width="5"/>
    <path d="M4 215Q53 236 147 209M5 220Q66 246 146 214M97 229v42" fill="none" stroke="url(#fellowship-braid)" stroke-width="4"/>
    <path d="m97 264 10 24-10 10-10-10Z" fill="url(#fellowship-braid)"/>
   </g>
  </defs>
  <use href="#fellowship-drape"/>
  <use href="#fellowship-drape" transform="translate(1000) scale(-1 1)"/>
 </svg>`;
}

function gardenArt(kind,viewBox,label=''){
 return `<svg class="garden-art garden-${kind}" viewBox="${viewBox}" ${label?`role="img" aria-label="${label}"`:'aria-hidden="true"'} focusable="false">
  <image href="assets/fellowship-garden.png" width="1774" height="887"/>
 </svg>`;
}

export function fellowship(ctx,root){
 root.innerHTML=`<section class="fellowship-sanctuary" aria-labelledby="fellowship-heading">
  ${drapes()}
  <div class="garden-mist" aria-hidden="true"></div>
  <header class="fellowship-header">
   <img class="fellowship-emblem" src="assets/womens-fellowship-logo.jpg" width="124" height="124" alt="Unveiled Women’s Fellowship emblem">
   <p class="eyebrow">UNVEILED / THE GARDEN</p>
   <h1 id="fellowship-heading">Women’s Fellowship.</h1>
   <p>Rooted in the Word. Growing together.</p>
  </header>
  <div class="fellowship-garden">
   <div class="garden-companion">
    ${gardenArt('left','0 0 490 887')}
   </div>
   <div class="garden-centre">
    <figure class="garden-tree">
     ${gardenArt('tree-crown','450 0 878 887','The Tree of Life with glowing fruit, leaves and roots')}
     <figcaption>THE TREE OF LIFE</figcaption>
    </figure>
    <section class="fellowship-reflection" aria-labelledby="fellowship-reflection-title">
     <p class="eyebrow">A WORD TO SHARE</p>
     <h2 id="fellowship-reflection-title">Abide in Christ.</h2>
     <blockquote>“I am the vine, ye are the branches.”</blockquote>
     <button class="plain-link" data-passage="42,15,5,kjv">Read John 15:5 ${ctx.icon('arrow')}</button>
    </section>
    <section class="fellowship-reflection" aria-labelledby="fellowship-prayer-title">
     <p class="eyebrow">A MOMENT FOR PRAYER</p>
     <h2 id="fellowship-prayer-title">Carry one another.</h2>
     <p>Take a moment to pray for someone. Write down a verse or a word of encouragement to share with her.</p>
     <button class="button outline" data-route="prayer">Open your journal ${ctx.icon('arrow')}</button>
    </section>
   </div>
   <div class="garden-companion">
    ${gardenArt('right','1249 0 525 887')}
   </div>
  </div>
 </section>`;
}
