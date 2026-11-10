import {imageButton} from './visuals.js?v=unveiled9';
import {veilPanels} from './veil-art.mjs?v=unveiled8';

function gardenArt(kind,viewBox,label=''){
 return `<svg class="garden-art garden-${kind}" viewBox="${viewBox}" ${label?`role="img" aria-label="${label}"`:'aria-hidden="true"'} focusable="false">
  <image href="assets/fellowship-garden.png" width="1774" height="887"/>
 </svg>`;
}

export function fellowship(ctx,root){
 root.innerHTML=`<section class="fellowship-sanctuary" aria-labelledby="fellowship-heading">
  <div class="garden-drapes" aria-hidden="true">${veilPanels('fellowship','garden')}</div>
  <div class="garden-mist" aria-hidden="true"></div>
  <header class="fellowship-header">
   <img class="fellowship-emblem" src="assets/unveiled-badge-fellowship.webp" width="124" height="124" alt="Unveiled Women’s Fellowship emblem">
   <p class="eyebrow">UNVEILED / THE GARDEN</p>
   <h1 id="fellowship-heading">Women’s Fellowship.</h1>
   <p>Rooted in the Word. Growing together.</p>
   <button class="plain-link" data-replay-veil>${ctx.icon('veil')} Replay opening</button>
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
 </section>
 <section class="fellowship-studio" aria-labelledby="fellowship-studio-title">
  <div><p class="eyebrow">WOMEN’S FELLOWSHIP / THE STUDIO</p><h2 id="fellowship-studio-title">In the studio.</h2><p>A space for reading Scripture and sharing reflections.</p></div>
  ${imageButton('fellowshipStudio')}
 </section>`;
}
