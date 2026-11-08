import {membersSection,teachingSection} from './visuals.js?v=unveiled9';
export {palm,wordmark} from './brand-assets.mjs?v=unveiled6';
export function team(ctx,root){
 root.innerHTML=`<div class="page-heading"><div><p class="eyebrow">UNVEILED / LEARNING TOGETHER</p><h1>Rooted in the Word.</h1><p>A space to learn, share and grow together.</p></div><span class="pill">2 CORINTHIANS 3:16</span></div>${membersSection()}<section class="team-verse"><span>“</span><p>Nevertheless when it shall turn to the Lord,<br>the vail shall be taken away.</p><button class="plain-link" data-passage="46,3,16,kjv">2 Corinthians 3:16 · KJV ${ctx.icon('arrow')}</button></section>`;
}

export function teaching(ctx,root){root.innerHTML=teachingSection();}
