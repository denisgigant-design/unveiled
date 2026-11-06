import {QUESTIONS, VERSES, KINDS, createRound, submitAnswer, advanceRound, roundSummary} from './game-core.mjs';

const $ = id => document.getElementById(id);
const labels = {body:'Body',soul:'Soul',spirit:'Spirit'};
const icons = {
  bread:'<path d="M5 10C1 8 3 3 7 4c1-3 6-3 7 0 4-1 7 3 4 6v10H5V10Z"/><path d="M8 12h7M8 16h7"/>',
  ear:'<path d="M8 9a5 5 0 0 1 10 0c0 4-4 4-4 7 0 5-7 5-7 0M11 9a2 2 0 0 1 4 0c0 2-3 2-3 4"/>',
  moon:'<path d="M19 14a8 8 0 0 1-9-11A9 9 0 1 0 19 14Z"/><path d="M17 3v4m-2-2h4"/>',
  hands:'<path d="m2 12 5-4 5 1 5-1 5 4-4 7-4 1-4-2-4 1-4-7ZM7 8l5 5 3-3M7 15l6 5M11 13l7 6"/>',
  heart:'<path d="M12 21S3 16 3 9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 7-9 12-9 12Z"/>',
  thought:'<path d="M8 18H6a5 5 0 0 1-2-9 6 6 0 0 1 11-4 5 5 0 1 1 3 10h-4l-6 5v-2Z"/><path d="M7 10h10M7 7h7"/>',
  path:'<path d="M12 22V12M12 12 5 5M12 12l7-7M2 5h6V2M16 2v6h6"/>',
  book:'<path d="M12 6C9 3 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-1-10 2v15Z"/><path d="M5 8h4M5 12h4M15 8h4M15 12h4"/>',
  sprout:'<path d="M12 22V11C6 12 3 8 3 3c6 0 9 3 9 8 0-5 3-8 9-8 0 5-3 9-9 8M12 18l4-3M8 22h8"/>',
  spark:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  link:'<path d="m10 7 3-3a5 5 0 0 1 7 7l-3 3M14 17l-3 3a5 5 0 0 1-7-7l3-3M8 16l8-8"/>'
};
let round = null;
let practice = false;
let missed = [];
const storageKey = 'unveiled-made-whole-best-v1';

function verseUrl(ref){return 'https://www.biblegateway.com/passage/?search='+encodeURIComponent(ref)+'&version=KJV';}
function openVerse(key){
  const verse = VERSES[key]; if(!verse)return;
  $('verse-title').textContent=verse.ref;
  $('verse-text').textContent='“'+verse.text+'”';
  $('verse-external').href=verseUrl(verse.ref);
  if(!$('verse-dialog').open)$('verse-dialog').showModal();
}
function showScreen(id){for(const screen of ['welcome-screen','play-screen','results-screen'])$(screen).hidden=screen!==id;}
function setProgress(value,total){
  $('progress-fill').style.width=(100*value/total)+'%';
  const progress=document.querySelector('[role="progressbar"]');
  progress.setAttribute('aria-valuenow',String(value));progress.setAttribute('aria-valuemax',String(total));
  progress.setAttribute('aria-valuetext',`${value} of ${total} moments completed`);
}
function startRound(items=QUESTIONS,isPractice=false){
  practice=isPractice;round=createRound(items);
  $('mode-label').textContent=isPractice?'A LITTLE MORE PRACTICE':'DISCOVERY ROUND';
  showScreen('play-screen');renderQuestion();
}
function renderQuestion(){
  const q=round.questions[round.index];
  $('question-counter').textContent=`Moment ${round.index+1} of ${round.questions.length}`;
  $('moment-label').textContent='A MOMENT FROM LIFE';
  $('question-title').textContent=q.title;
  $('question-prompt').textContent=q.prompt;
  $('question-symbol').innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[q.icon]}</svg>`;
  $('score').textContent=String(roundSummary(round).correct);
  $('feedback').hidden=true;$('next-button').hidden=true;$('hint-button').hidden=false;
  $('hint-text').hidden=true;$('hint-text').textContent=q.hint;$('hint-button').setAttribute('aria-expanded','false');
  for(const button of document.querySelectorAll('[data-answer]')){
    button.disabled=false;button.classList.remove('is-correct','is-wrong','is-dimmed');
    button.querySelector('.answer-check').textContent='';
  }
  setProgress(round.index,round.questions.length);
  $('question-title').focus({preventScroll:true});
}
function answer(kind){
  if(!round)return;
  const result=submitAnswer(round,kind);if(!result)return;
  const q=round.questions[round.index];
  for(const button of document.querySelectorAll('[data-answer]')){
    button.disabled=true;
    const buttonKind=button.dataset.answer;
    if(buttonKind===q.kind){button.classList.add('is-correct');button.querySelector('.answer-check').textContent='✓';}
    else if(buttonKind===kind){button.classList.add('is-wrong');button.querySelector('.answer-check').textContent='×';}
    else button.classList.add('is-dimmed');
  }
  $('score').textContent=String(roundSummary(round).correct);
  $('feedback').classList.toggle('review',!result.correct);
  $('feedback-icon').textContent=result.correct?'✓':'↗';
  $('feedback-title').textContent=result.correct?`That’s it — ${labels[q.kind]}.`:`Let’s take a closer look — ${labels[q.kind]}.`;
  $('feedback-text').textContent=q.explanation;
  $('feedback-verse').textContent=VERSES[q.verse].ref+' · KJV ↗';
  $('feedback-verse').dataset.verse=q.verse;
  $('feedback').hidden=false;$('next-button').hidden=false;$('hint-button').hidden=true;$('hint-text').hidden=true;
  $('next-button').innerHTML=(round.index===round.questions.length-1?'See how you did':'Next moment')+' <span aria-hidden="true">→</span>';
  setProgress(round.index+1,round.questions.length);
  $('next-button').focus({preventScroll:true});
}
function readBest(){try{const value=Number(localStorage.getItem(storageKey));return Number.isInteger(value)&&value>=0&&value<=QUESTIONS.length?value:0;}catch{return null;}}
function finishRound(){
  const summary=roundSummary(round);missed=summary.missed;
  showScreen('results-screen');
  $('question-counter').textContent=practice?'Practice complete':'All 12 moments explored';
  $('results-heading').textContent=summary.correct===summary.total?'Beautifully understood.':'A little more understanding.';
  $('results-message').textContent=summary.correct===summary.total?'You recognised every moment. Take that understanding into everyday life.':'Every moment is a chance to learn. Keep exploring — you’re growing.';
  $('final-score').textContent=String(summary.correct);$('final-total').textContent='/ '+summary.total;
  $('category-results').replaceChildren();
  for(const category of summary.categories){
    if(!category.total)continue;
    const item=document.createElement('div');item.className='category-result '+category.kind+'-result';
    const name=document.createElement('span');name.textContent=labels[category.kind];
    const score=document.createElement('strong');score.textContent=`${category.correct} / ${category.total}`;
    item.append(name,score);$('category-results').append(item);
  }
  $('practice-button').hidden=!missed.length;
  let best=readBest();
  if(!practice&&best!==null){best=Math.max(best,summary.correct);try{localStorage.setItem(storageKey,String(best));}catch{best=null;}}
  $('best-score').textContent=best===null?'':`Your best discovery round: ${best} / ${QUESTIONS.length} · saved on this device`;
  $('results-heading').focus({preventScroll:true});
}

const topics={
  whole:{title:'One person, wholly loved.',text:'Paul prays for the whole person: spirit, soul and body. This game uses those three words as a way to explore physical life, inner experience and spiritual life. The circles are a learning picture, not a diagram of where these aspects are physically located.',points:['Body: your physical life, senses and actions.','Soul: your thoughts, emotions and will.','Spirit: your spiritual life and relationship with God.'],verses:['whole']},
  body:{title:'Body · your physical life.',text:'Your body connects you with the physical world through your senses and actions. It needs food, water and rest. Physical life is not automatically sinful: your body can express love, serve others and glorify God.',points:['You hear, see, touch, taste and smell.','You walk, work, speak and help.','You can express inward faith through outward action.'],verses:['body','love']},
  soul:{title:'Soul · your inner experience.',text:'In this teaching model, the soul highlights the mind, emotions and will. You think, remember, feel and choose. Scripture speaks of a troubled soul hoping in God, and of the mind being renewed.',points:['Mind: thoughts, memories and understanding.','Emotions: joy, sadness, affection and other feelings.','Will: decisions, intentions and choices.'],verses:['soul','renew']},
  spirit:{title:'Spirit · your life toward God.',text:'Jesus speaks of being born of the Spirit. Paul speaks of God’s Spirit bearing witness with our spirit. This is more than outward behaviour or a passing feeling: it highlights spiritual life and relationship with God.',points:['New birth: “that which is born of the Spirit is spirit.”','Witness: God’s Spirit bears witness with our spirit.','Worship: Jesus speaks of worship in spirit and in truth.'],verses:['born','witness','worship','joined']}
};
function setStudyTopic(key){
  const topic=topics[key];if(!topic)return;
  for(const button of document.querySelectorAll('[data-topic]')){const active=button.dataset.topic===key;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;}
  const panel=$('study-panel');panel.replaceChildren();panel.setAttribute('aria-labelledby','tab-'+key);
  const title=document.createElement('h3');title.className='study-panel-heading';title.textContent=topic.title;
  const description=document.createElement('p');description.textContent=topic.text;
  const list=document.createElement('ul');for(const point of topic.points){const li=document.createElement('li');li.textContent=point;list.append(li);}
  panel.append(title,description,list);
  for(const verseKey of topic.verses){
    const v=VERSES[verseKey];const block=document.createElement('figure');block.className='study-verse';
    const quote=document.createElement('blockquote');quote.textContent='“'+v.text+'”';
    const caption=document.createElement('figcaption');const link=document.createElement('a');link.className='verse-link';link.href=verseUrl(v.ref);link.target='_blank';link.rel='noopener noreferrer';link.textContent=v.ref+' · KJV ↗';caption.append(link);block.append(quote,caption);panel.append(block);
  }
}

$('start-button').addEventListener('click',()=>startRound());
$('replay-button').addEventListener('click',()=>startRound());
$('practice-button').addEventListener('click',()=>startRound(missed,true));
$('next-button').addEventListener('click',()=>{if(!round||!advanceRound(round))return;if(round.complete)finishRound();else renderQuestion();});
$('hint-button').addEventListener('click',()=>{const show=$('hint-text').hidden;$('hint-text').hidden=!show;$('hint-button').setAttribute('aria-expanded',String(show));});
for(const button of document.querySelectorAll('[data-answer]'))button.addEventListener('click',()=>answer(button.dataset.answer));
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-open],[data-close],[data-verse],[data-guide],[data-topic]');if(!button)return;
  if(button.hasAttribute('data-close'))button.closest('dialog').close();
  else if(button.dataset.verse)openVerse(button.dataset.verse);
  else if(button.dataset.guide){setStudyTopic(button.dataset.guide);$('study-dialog').showModal();}
  else if(button.dataset.topic)setStudyTopic(button.dataset.topic);
  else if(button.dataset.open){if(button.dataset.open==='study-dialog')setStudyTopic('whole');$(button.dataset.open).showModal();}
});
document.addEventListener('keydown',event=>{
  if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||event.repeat)return;
  if(document.querySelector('dialog[open]')||$('play-screen').hidden)return;
  const index=['1','2','3'].indexOf(event.key);if(index>=0){event.preventDefault();answer(KINDS[index]);}
});
document.querySelector('.study-tabs').addEventListener('keydown',event=>{
  const tabs=[...document.querySelectorAll('[data-topic]')];const current=tabs.indexOf(document.activeElement);if(current<0)return;
  let next;if(event.key==='ArrowRight')next=(current+1)%tabs.length;else if(event.key==='ArrowLeft')next=(current+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;
  event.preventDefault();setStudyTopic(tabs[next].dataset.topic);tabs[next].focus();
});
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});
setStudyTopic('whole');

