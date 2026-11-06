export const VERSES = {
  whole: {ref:'1 Thessalonians 5:23',text:'And the very God of peace sanctify you wholly; and I pray God your whole spirit and soul and body be preserved blameless unto the coming of our Lord Jesus Christ.'},
  body: {ref:'1 Corinthians 6:20',text:'For ye are bought with a price: therefore glorify God in your body, and in your spirit, which are God’s.'},
  renew: {ref:'Romans 12:2',text:'And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.'},
  soul: {ref:'Psalm 42:11',text:'Why art thou cast down, O my soul? and why art thou disquieted within me? hope thou in God: for I shall yet praise him, who is the health of my countenance, and my God.'},
  born: {ref:'John 3:6',text:'That which is born of the flesh is flesh; and that which is born of the Spirit is spirit.'},
  witness: {ref:'Romans 8:16',text:'The Spirit itself beareth witness with our spirit, that we are the children of God:'},
  worship: {ref:'John 4:24',text:'God is a Spirit: and they that worship him must worship him in spirit and in truth.'},
  joined: {ref:'1 Corinthians 6:17',text:'But he that is joined unto the Lord is one spirit.'},
  love: {ref:'1 John 3:18',text:'My little children, let us not love in word, neither in tongue; but in deed and in truth.'},
  will: {ref:'Psalm 103:1',text:'Bless the LORD, O my soul: and all that is within me, bless his holy name.'}
};

export const QUESTIONS = [
  {id:'hunger',kind:'body',icon:'bread',title:'Your stomach starts to rumble.',prompt:'You haven’t eaten since breakfast. Which aspect of you is experiencing physical hunger?',hint:'Think of the part of you that needs food, water and rest.',explanation:'Hunger is a physical need, so the body is highlighted. Caring for your body is part of caring for the whole person God made.',verse:'body'},
  {id:'hearing',kind:'body',icon:'ear',title:'You hear birds outside.',prompt:'Sound reaches your ears as you open the window. Which aspect of you is using the sense of hearing?',hint:'Hearing is one of your physical senses.',explanation:'Your ears and nervous system are part of your body. Hearing highlights physical life. The sound may also stir thoughts or feelings in your soul.',verse:'whole'},
  {id:'rest',kind:'body',icon:'moon',title:'It’s time for a good night’s sleep.',prompt:'After a long day, your muscles feel tired. Which aspect of you needs physical rest?',hint:'Focus on tired muscles and physical energy.',explanation:'Physical tiredness highlights the body. Needing rest is part of human life, not a measure of how strong your faith is.',verse:'whole'},
  {id:'service',kind:'body',icon:'hands',title:'You carry a neighbour’s groceries.',prompt:'Focus on the lifting and walking. Which aspect of you puts the act of kindness into physical motion?',hint:'The question focuses on the action your hands and feet carry out.',explanation:'Your body makes love visible through physical action. Your soul can choose to help, and your spirit can be responsive to God. This moment can involve all three.',verse:'love'},
  {id:'feelings',kind:'soul',icon:'heart',title:'An unkind comment leaves you hurt.',prompt:'Focus on the sadness you feel inside. Which aspect of your inner experience is being highlighted?',hint:'Think about emotions, rather than physical pain.',explanation:'Feelings such as sadness and joy highlight the soul in this study model. Scripture gives room to bring a troubled soul honestly before God.',verse:'soul'},
  {id:'memory',kind:'soul',icon:'thought',title:'A kind memory comes to mind.',prompt:'You remember a friend who encouraged you. Which aspect of you is thinking and remembering?',hint:'Think of your thoughts, memories and understanding.',explanation:'Thinking and remembering highlight the mind, an aspect of the soul in this teaching model. Your thoughts can influence both your emotions and your actions.',verse:'renew'},
  {id:'choice',kind:'soul',icon:'path',title:'You choose forgiveness.',prompt:'Instead of planning revenge, you decide to forgive. Focus on the act of choosing: which aspect is highlighted?',hint:'A decision highlights your will: your capacity to choose.',explanation:'The choice highlights your will, included here with the soul. God can guide and strengthen you, and your body can express the decision through your actions.',verse:'will'},
  {id:'thinking',kind:'soul',icon:'book',title:'You let Scripture reshape a thought.',prompt:'You examine a fearful belief in the light of God’s Word. Which aspect is having its thinking renewed?',hint:'Romans 12:2 speaks specifically about the renewing of your mind.',explanation:'Renewing your thinking highlights the mind, included here with the soul. Romans 12:2 describes transformation through the renewing of your mind.',verse:'renew'},
  {id:'birth',kind:'spirit',icon:'sprout',title:'Jesus speaks about being born again.',prompt:'“That which is born of the Spirit is spirit.” Which aspect is highlighted in this new birth?',hint:'Jesus names this aspect directly in John 3:6.',explanation:'Jesus distinguishes physical birth from birth of the Spirit. This points to spiritual life from God, beyond simply changing habits or learning new information.',verse:'born'},
  {id:'witness',kind:'spirit',icon:'spark',title:'God’s Spirit bears witness.',prompt:'Romans 8:16 says God’s Spirit bears witness with something in us. Which aspect does Paul name?',hint:'Paul says, “The Spirit itself beareth witness with our spirit…”',explanation:'Paul specifically names our spirit. This is about the witness of God’s Spirit that believers are God’s children, rather than a passing mood or a physical sensation.',verse:'witness'},
  {id:'worship',kind:'spirit',icon:'sun',title:'You worship in spirit and in truth.',prompt:'Focus on the inward spiritual worship Jesus describes in John 4:24. Which aspect is highlighted?',hint:'Worship can involve thoughts and actions too, but notice the word Jesus uses.',explanation:'Jesus speaks of worship in spirit and in truth. Your soul and body can join in, but the question highlights the spiritual relationship with God.',verse:'worship'},
  {id:'joined',kind:'spirit',icon:'link',title:'You are joined to the Lord.',prompt:'“He that is joined unto the Lord is one spirit.” Which aspect does this verse highlight?',hint:'Look at the final two words of the verse.',explanation:'Paul describes being joined to the Lord as “one spirit.” This highlights spiritual union with Him, not simply being in a good mood or standing in a particular place.',verse:'joined'}
];

export const KINDS = ['body','soul','spirit'];
export function shuffled(items, random = Math.random) {
  const result = [...items];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export function createRound(items = QUESTIONS, random = Math.random) {
  if(!items.length) throw new Error('A round needs at least one question.');
  return {questions:shuffled(items,random),index:0,answers:[],complete:false};
}
export function submitAnswer(round, kind) {
  if(round.complete || round.answers.length>round.index || !KINDS.includes(kind)) return null;
  const question = round.questions[round.index];
  const result = {id:question.id,kind:question.kind,selected:kind,correct:kind===question.kind};
  round.answers.push(result);
  return result;
}
export function advanceRound(round) {
  if(round.complete || round.answers.length<=round.index) return false;
  if(round.index===round.questions.length-1){round.complete=true;return true;}
  round.index++;
  return true;
}
export function roundSummary(round) {
  return {correct:round.answers.filter(a=>a.correct).length,total:round.questions.length,missed:round.questions.filter(q=>round.answers.some(a=>a.id===q.id&&!a.correct)),categories:KINDS.map(kind=>({kind,correct:round.answers.filter(a=>a.kind===kind&&a.correct).length,total:round.questions.filter(q=>q.kind===kind).length}))};
}

