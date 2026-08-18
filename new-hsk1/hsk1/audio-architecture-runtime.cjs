const fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
const root=__dirname;
const read=n=>fs.readFileSync(path.join(root,n),'utf8');

class FakeAudio{
  static log=[];
  constructor(src=''){this.src=src;this.preload='';this.playsInline=false;this.dataset={};this.readyState=1;this._currentTime=0;this.playbackRate=1;this.seeking=false;this.listeners={};this.paused=true}
  addEventListener(t,f,o){(this.listeners[t]||(this.listeners[t]=[])).push({f,once:!!o?.once})}
  removeEventListener(t,f){this.listeners[t]=(this.listeners[t]||[]).filter(x=>x.f!==f)}
  emit(t){const a=[...(this.listeners[t]||[])];for(const x of a){x.f({target:this});if(x.once)this.removeEventListener(t,x.f)}}
  load(){this.readyState=1;this.emit('loadedmetadata')}
  pause(){this.paused=true}
  play(){this.paused=false;FakeAudio.log.push({src:this.src,time:this.currentTime,track:this.dataset.officialTrack||''});return Promise.resolve()}
  get currentTime(){return this._currentTime}
  set currentTime(v){this._currentTime=Number(v)||0;this.seeking=false;queueMicrotask(()=>this.emit('seeked'))}
}
function html(){
  return `<!doctype html><html><head></head><body>
  <div id="pwOverlay"></div><input id="pwInput"><button id="pwBtn"></button><div id="pwError"></div>
  <div class="toast"></div><div id="lessonHero"></div><span id="lessonTag"></span><h1 id="lessonTitle"></h1><div id="lessonVn"></div>
  <b id="vocabCount"></b><b id="grammarCount"></b><span></span><span id="vocabChip"></span><span id="grammarChip"></span><span id="hanziChip"></span>
  <select id="lessonSelect"></select><div id="lessonSwitch"></div><aside id="xiaoyuTips"></aside>
  <section id="vocab" class="content-section"><div class="tool-row"><input id="vSearch"><button onclick="flipAll()">flip</button><button onclick="speakAllVocab()">🔊 Nghe từ</button></div><div id="vocabGrid"></div><div id="wordPanel"></div></section>
  <section id="text" class="content-section"><select id="sceneSelect"></select><div id="sceneTabs"></div><div id="scenePane"></div></section>
  <section id="grammar" class="content-section"><div class="section-head"><h2></h2></div><div id="grammarList"></div></section>
  <section id="hanzi" class="content-section"><div id="hanziWordMap"></div><div id="hanziMaster"></div></section>
  <section id="practice" class="content-section"><div id="basicPractice"></div><div id="advancedPractice"></div></section>
  <button id="prevModuleBtn"></button><button id="nextModuleBtn"></button><b id="moduleStepTitle"></b><button id="completeBtn"></button>
  <div class="section-tab" data-sec="vocab"></div><div class="section-tab" data-sec="text"></div><div class="section-tab" data-sec="grammar"></div>
  </body></html>`;
}
async function make(id){
  FakeAudio.log=[];
  const dom=new JSDOM(html(),{url:`https://example.test/new-hsk1/hsk1/lesson.html?id=${id}&sec=vocab`,runScripts:'dangerously',pretendToBeVisual:true});
  const w=dom.window;
  w.Audio=FakeAudio;w.HTMLMediaElement=FakeAudio;
  let speechCount=0;
  w.speechSynthesis={speaking:false,pending:false,paused:false,getVoices:()=>[{name:'fake zh',lang:'zh-CN',localService:true}],cancel(){},resume(){},speak(){speechCount++},addEventListener(){}};
  w.SpeechSynthesisUtterance=function(t){this.text=t};
  w.scrollTo=()=>{};w.confirm=()=>false;
  for(const n of ['new-data.js','new-enrichment.js','textbook-data-corrections.js','textbook-audio-segments.js','textbook-segment-audio.js','app-core.js','tts-only.js'])w.eval(read(n));
  w.initLesson();
  await new Promise(r=>setTimeout(r,0));
  return {dom,w,get speechCount(){return speechCount}};
}
(async()=>{
  const a=await make(1);
  if(!a.w.HSK1_OFFICIAL_AUDIO?.ready)throw new Error('official player not ready synchronously');
  const vocab=a.w.document.querySelector('.vocab-card[data-zh="不客气"] .listen');
  if(!vocab)throw new Error('lesson1 不客气 button missing');
  vocab.click();await new Promise(r=>setTimeout(r,0));
  if(a.speechCount!==0)throw new Error(`vocab clicked TTS ${a.speechCount} times`);
  if(!FakeAudio.log.at(-1)?.track)throw new Error('vocab did not route to Audio');
  const scene=a.w.document.querySelector('#scenePane .speak-line');
  if(!scene)throw new Error('text line button missing');
  scene.click();await new Promise(r=>setTimeout(r,0));
  if(a.speechCount!==0)throw new Error(`text clicked TTS ${a.speechCount} times`);
  if(!FakeAudio.log.at(-1)?.track?.endsWith('-1'))throw new Error('text line did not route to text track');
  a.w.speak('老师');await new Promise(r=>setTimeout(r,0));
  if(a.speechCount!==1)throw new Error('grammar/Hanzi TTS path no longer works');
  if(vocab.textContent.trim()!=='🎧 教材')throw new Error(`vocab button copy wrong: ${vocab.textContent}`);
  if(scene.textContent.trim()!=='🎧')throw new Error(`text button copy wrong: ${scene.textContent}`);

  const b=await make(4);
  await new Promise(r=>setTimeout(r,0));
  const unsupported=b.w.document.querySelector('.vocab-card[data-zh="一"] .listen');
  if(!unsupported||!unsupported.disabled||!unsupported.textContent.includes('无独立教材音'))throw new Error('unsupported lesson4 number card not disabled');
  unsupported.click();await new Promise(r=>setTimeout(r,0));
  if(b.speechCount!==0)throw new Error('unsupported vocab fell back to TTS');

  const c=await make(11);
  const tabs=c.w.document.querySelectorAll('#sceneTabs .scene-tab');tabs[2].click();await new Promise(r=>setTimeout(r,0));
  const rows=c.w.document.querySelectorAll('#scenePane .dialogue-line');
  if(rows.length!==6)throw new Error(`lesson11 scene3 expected 6 rows, got ${rows.length}`);
  if(![...rows].some(r=>r.querySelector('.line-zh')?.textContent==='去超市。'))throw new Error('lesson11 去超市 missing');
  console.log(JSON.stringify({status:'PASS',lesson1VocabOfficial:true,lesson1TextOfficial:true,ttsOnlyGrammarHanzi:true,lesson4UnsupportedBlocked:true,lesson11Rows:6,speechCountOfficialClicks:0}));
})().catch(e=>{console.error(e);process.exit(1)});
