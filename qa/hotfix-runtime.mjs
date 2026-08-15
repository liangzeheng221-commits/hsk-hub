import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

// HSK3 regression: the home renderer creates #hsk3TextbookNote; this must never be treated as fatal.
{
  const src=read('hsk3/runtime-loader.js');
  assert(src.includes("qs('#hsk3TextbookNote')"),'HSK3 runtime must recognize #hsk3TextbookNote');
  assert(!src.includes("if(!qs('#hsk3SystemNote'))throw new Error('教材口径说明未渲染')"),'stale HSK3 fatal verifier is still present');
  console.log('HSK3 HOTFIX PASS: textbook note ID no longer causes false fatal error');
}

// HSK1 regression: the real patch must speak synchronously inside the click/user-gesture task,
// select a Mandarin voice when available, and turn phonetics-only examples into speakable Hanzi.
{
  const spoken=[];
  const listeners={};
  class Utterance{constructor(text){this.text=text;this.lang='';this.rate=1;this.pitch=1;this.volume=1;this.voice=null;}}
  const synth={
    speaking:false,pending:false,paused:false,
    getVoices(){return [
      {lang:'en-US',name:'English Test Voice',localService:true},
      {lang:'zh-CN',name:'Chinese Local Test Voice',localService:true}
    ]},
    addEventListener(name,fn){listeners[name]=fn},
    cancel(){this.speaking=false;this.pending=false},
    resume(){this.paused=false},
    speak(u){this.speaking=true;spoken.push(u);u.onstart?.();setTimeout(()=>{this.speaking=false;u.onend?.()},0)}
  };
  const document={
    addEventListener(name,fn,capture){listeners['document:'+name]={fn,capture}},
    querySelectorAll(){return []}
  };
  const window={speechSynthesis:synth,SpeechSynthesisUtterance:Utterance,HSK1_LESSONS:[],toast(){}};
  const ctx={window,document,SpeechSynthesisUtterance:Utterance,console,setTimeout,clearTimeout};
  vm.runInNewContext(read('hsk1/audio-fix.js'),ctx,{filename:'hsk1/audio-fix.js'});
  assert.equal(typeof window.speak,'function','HSK1 audio patch did not install window.speak');
  window.speak('你好');
  assert.equal(spoken.length,1,'HSK1 first speak() must be synchronous; do not defer the user gesture');
  assert.equal(spoken[0].text,'你好','HSK1 speech text mismatch');
  assert.equal(spoken[0].lang,'zh-CN','HSK1 speech language must be zh-CN');
  assert.equal(spoken[0].voice?.name,'Chinese Local Test Voice','HSK1 must prefer a local Chinese voice');
  assert.equal(window.__HSK1_AUDIO_FIX.normalizeText('mā / má / mǎ / mà'),'妈，麻，马，骂','tone demo must speak actual Mandarin syllables');
  assert.equal(window.__HSK1_AUDIO_FIX.normalizeText('māo 猫, yú 鱼, jiě 姐, èr 二'),'猫，鱼，姐，二','mixed pinyin/Hanzi example must speak Hanzi only');
  assert.equal(window.__HSK1_AUDIO_FIX.normalizeText('nǐ + hǎo → ní hǎo'),'你好','3+3 tone-sandhi demo must speak 你好');
  assert.equal(window.__HSK1_AUDIO_FIX.normalizeText('kě + yǐ → ké yǐ'),'可以','3+3 tone-sandhi demo must speak 可以');
  assert.equal(listeners['document:click']?.capture,true,'HSK1 audio must capture lesson audio buttons before legacy handlers');
  assert.equal(window.__HSK1_AUDIO_FIX.version,'20260815-2','HSK1 audio patch version mismatch');
  assert(read('hsk1/lesson.html').includes('audio-fix.js?v=20260815-2'),'HSK1 lesson does not load audio-fix v2');
  await sleep(20);
  console.log('HSK1 AUDIO PASS: synchronous gesture-safe playback + local Mandarin voice + phonetics normalization');
}

// HSK4 上 regression: execute the real progressive-stroke script against a tiny DOM/HanziWriter mock.
{
  const registry=new Map();
  class El{
    constructor(tag='div'){this.tagName=tag;this.children=[];this.dataset={};this.attributes={};this.className='';this.id='';this.parentNode=null;this._html='';}
    appendChild(child){this.children.push(child);child.parentNode=this;if(child.id)registry.set(child.id,child);return child}
    insertAdjacentElement(_where,child){child.parentNode=this.parentNode;if(child.id)registry.set(child.id,child);return child}
    setAttribute(k,v){this.attributes[k]=String(v)}
    set innerHTML(v){this._html=String(v);this.children=[]}
    get innerHTML(){return this._html}
    querySelector(sel){
      if(sel==='.h4u-stroke-card')return walk(this).find(x=>hasClass(x,'h4u-stroke-card'))||null;
      return null;
    }
    closest(){return null}
  }
  const hasClass=(el,name)=>String(el.className||'').split(/\s+/).includes(name);
  const walk=root=>[root,...root.children.flatMap(walk)];
  const head=new El('head');
  const master=new El('div');master.id='hanziMaster';registry.set(master.id,master);
  const active=new El('button');active.dataset.char='你';active.className='hanzi-char-btn active';
  const document={
    readyState:'complete',head,
    getElementById(id){return registry.get(id)||null},
    querySelector(sel){if(sel.includes('#hanziWordMap'))return active;return null},
    createElement(tag){return new El(tag)},
    createElementNS(_ns,tag){return new El(tag)},
    addEventListener(){}
  };
  const window={
    HanziWriter:{
      async loadCharacterData(ch){assert.equal(ch,'你');return {strokes:['M 0 0 L 100 100','M 100 0 L 0 100','M 50 0 L 50 100']};},
      getScalingTransform(){return {transform:'translate(9,99) scale(.08,-.08)'}}
    },
    MutationObserver:undefined
  };
  const ctx={window,document,console,setTimeout,clearTimeout};
  vm.runInNewContext(read('hsk4up/hanzi-steps.js'),ctx,{filename:'hsk4up/hanzi-steps.js'});
  await sleep(30);
  const panel=registry.get('hsk4UpperStrokeSteps');
  assert(panel,'HSK4 Upper progressive stroke panel was not rendered');
  const cards=walk(panel).filter(x=>hasClass(x,'h4u-stroke-card'));
  assert.equal(cards.length,3,'HSK4 Upper must render one progressive card per stroke');
  assert.equal(panel.dataset.char,'你','HSK4 Upper stroke panel character mismatch');
  assert(read('hsk4up/lesson.html').includes('hanzi-steps.js?v=20260815-1'),'HSK4 Upper lesson does not load hanzi-steps.js');
  console.log('HSK4 UPPER HANZI PASS: real script rendered one cumulative card per stroke');
}

console.log('HOTFIX RUNTIME TEST PASS');
