/* Step 6: replace HSK1 vocabulary/text TTS buttons with textbook recordings.
   Development-layer only. Loads the verified timing maps from _audio-work. */
(function(){
  'use strict';
  const VERSION='20260818-step6-v1';
  const AUDIO_DIR='audio/';
  const WORK_DIR='_audio-work/';
  const cache=new Map();
  let textTracks={};
  let vocabByLesson={};
  let ready=false;
  let activeAudio=null;
  let stopTimer=0;
  let runToken=0;
  let mutationObserver=null;
  const pendingSequence=[];
  const UNSUPPORTED={4:new Set(['一','二','三','四','五','六','七','九','十','千','两','零'])};

  function lessonId(){
    const n=Number(new URL(location.href).searchParams.get('id')||1);
    return Math.max(1,Math.min(15,Number.isFinite(n)?n:1));
  }
  function sceneIndex(){
    const s=document.querySelector('#sceneSelect');
    if(s&&s.value!=='')return Math.max(0,Math.min(2,Number(s.value)||0));
    const active=document.querySelector('#sceneTabs .scene-tab.active');
    return Math.max(0,Math.min(2,Number(active?.dataset?.i)||0));
  }
  function srcFor(track){return `${AUDIO_DIR}${track}.mp3`}
  function toastSafe(msg){
    if(typeof window.toast==='function'){window.toast(msg);return}
    let t=document.querySelector('.toast');
    if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}
    t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800);
  }
  function diagnostics(extra={}){
    window.__HSK1_OFFICIAL_AUDIO_DIAGNOSTICS={
      version:VERSION,ready,lesson:lessonId(),scene:sceneIndex(),
      cachedTracks:cache.size,activeTrack:activeAudio?.dataset?.officialTrack||'',
      pendingSequence:pendingSequence.length,...extra
    };
  }
  function cancelSpeech(){try{window.speechSynthesis?.cancel?.()}catch(_e){}}
  function stopVisibleAudio(except){
    document.querySelectorAll('audio').forEach(a=>{if(a!==except){try{a.pause()}catch(_e){}}});
  }
  function stop(){
    runToken++;
    if(stopTimer){clearTimeout(stopTimer);stopTimer=0}
    if(activeAudio){try{activeAudio.pause()}catch(_e){}}
    activeAudio=null;pendingSequence.length=0;diagnostics({playing:false,label:''});
  }
  function getAudio(track){
    let a=cache.get(track);if(a)return a;
    a=new Audio(srcFor(track));a.preload='metadata';a.playsInline=true;a.dataset.officialTrack=track;
    a.addEventListener('error',()=>diagnostics({error:`load-failed:${track}`,playing:false}));
    cache.set(track,a);return a;
  }
  function warmLesson(lesson){
    if(!ready)return;
    const ids=new Set();
    [1,3,5].forEach(t=>{if(textTracks[`${lesson}-${t}`])ids.add(`${lesson}-${t}`)});
    Object.values(vocabByLesson[String(lesson)]||{}).forEach(x=>ids.add(x.track));
    ids.forEach(track=>{const a=getAudio(track);try{a.load()}catch(_e){}});
  }
  function scheduleStop(audio,end,token){
    const ms=Math.max(80,((end-audio.currentTime)/(audio.playbackRate||1))*1000+100);
    stopTimer=setTimeout(()=>{
      if(token!==runToken||audio!==activeAudio)return;
      try{audio.pause();audio.currentTime=end}catch(_e){}
      activeAudio=null;stopTimer=0;diagnostics({playing:false,endedByRange:true});
    },ms);
  }
  function startRange(track,start,end,label=''){
    if(!track||!Number.isFinite(start)||!Number.isFinite(end)||end<=start){
      toastSafe('教材原声时间轴不可用。');return false;
    }
    cancelSpeech();if(stopTimer){clearTimeout(stopTimer);stopTimer=0}
    const token=++runToken,audio=getAudio(track);activeAudio=audio;stopVisibleAudio();
    try{audio.pause()}catch(_e){}
    const begin=()=>{
      if(token!==runToken)return;
      try{audio.currentTime=start}catch(_e){}
      Promise.resolve(audio.play()).then(()=>{
        if(token!==runToken)return;
        scheduleStop(audio,end,token);diagnostics({playing:true,label,range:[start,end],error:''});
      }).catch(()=>{diagnostics({playing:false,error:`play-blocked:${track}`,label});toastSafe('Không phát được audio giáo trình. Hãy chạm lại nút nghe.');});
    };
    if(audio.readyState>=1)begin();
    else{audio.addEventListener('loadedmetadata',begin,{once:true});try{audio.load()}catch(_e){}}
    return true;
  }
  function playFull(track,label=''){
    if(!track)return false;
    cancelSpeech();if(stopTimer){clearTimeout(stopTimer);stopTimer=0}
    const token=++runToken,audio=getAudio(track);activeAudio=audio;stopVisibleAudio();
    try{audio.pause();audio.currentTime=0}catch(_e){}
    const begin=()=>{
      if(token!==runToken)return;
      Promise.resolve(audio.play()).then(()=>diagnostics({playing:true,label,fullTrack:true,error:''}))
        .catch(()=>toastSafe('Không phát được audio giáo trình. Hãy chạm lại nút nghe.'));
    };
    if(audio.readyState>=1)begin();
    else{audio.addEventListener('loadedmetadata',begin,{once:true});try{audio.load()}catch(_e){}}
    return true;
  }
  function textTrack(lesson,scene){return `${lesson}-${[1,3,5][scene]||1}`}
  function textSegment(lesson,scene,line){
    const track=textTrack(lesson,scene),r=textTracks[track]?.[line];
    return r?{track,start:r[0],end:r[1]}:null;
  }
  function vocabSegment(lesson,word){return vocabByLesson[String(lesson)]?.[word]||null}
  function playVocab(word,lesson=lessonId()){
    if(!ready){toastSafe('Đang tải bản đồ audio giáo trình…');return false}
    const seg=vocabSegment(lesson,word);
    if(!seg){toastSafe('教材没有这个词的独立真人录音。');diagnostics({missingVocab:word});return false}
    return startRange(seg.track,seg.start,seg.end,`vocab:${lesson}:${word}`);
  }
  function playTextLine(scene,line,lesson=lessonId()){
    if(!ready){toastSafe('Đang tải bản đồ audio giáo trình…');return false}
    const seg=textSegment(lesson,scene,line);
    if(!seg){toastSafe('没有找到这一句的教材原声。');return false}
    return startRange(seg.track,seg.start,seg.end,`text:${lesson}:${scene+1}:${line+1}`);
  }
  function playTextScene(scene=sceneIndex(),lesson=lessonId()){
    const track=textTrack(lesson,scene);
    if(!ready||!textTracks[track]){toastSafe('没有找到这段课文原声。');return false}
    return playFull(track,`text-full:${lesson}:${scene+1}`);
  }
  function lessonVocabTracks(lesson){
    const tracks=[];
    Object.values(vocabByLesson[String(lesson)]||{}).forEach(x=>{
      if(x.track.startsWith(`${lesson}-`)&&!tracks.includes(x.track))tracks.push(x.track);
    });
    return tracks.sort((a,b)=>Number(a.split('-')[1])-Number(b.split('-')[1]));
  }
  function playNextSequence(token){
    if(token!==runToken)return;
    const next=pendingSequence.shift();
    if(!next){activeAudio=null;diagnostics({playing:false,sequenceDone:true});return}
    const audio=getAudio(next);activeAudio=audio;stopVisibleAudio();
    try{audio.pause();audio.currentTime=0}catch(_e){}
    const begin=()=>{
      if(token!==runToken)return;
      const onEnd=()=>{audio.removeEventListener('ended',onEnd);if(token===runToken)playNextSequence(token)};
      audio.addEventListener('ended',onEnd,{once:true});
      Promise.resolve(audio.play()).then(()=>diagnostics({playing:true,label:`vocab-full:${next}`,sequence:true,error:''}))
        .catch(()=>{audio.removeEventListener('ended',onEnd);toastSafe('Không phát được audio giáo trình.');});
    };
    if(audio.readyState>=1)begin();
    else{audio.addEventListener('loadedmetadata',begin,{once:true});try{audio.load()}catch(_e){}}
  }
  function playVocabLesson(lesson=lessonId()){
    if(!ready){toastSafe('Đang tải bản đồ audio giáo trình…');return false}
    cancelSpeech();if(stopTimer){clearTimeout(stopTimer);stopTimer=0}
    const tracks=lessonVocabTracks(lesson);if(!tracks.length)return false;
    const token=++runToken;pendingSequence.splice(0,pendingSequence.length,...tracks);playNextSequence(token);return true;
  }
  function patchLesson11(){
    const lesson=window.HSK1_LESSONS?.find?.(x=>Number(x.id)===11),lines=lesson?.scenes?.[2]?.lines;
    if(!lines)return false;if(lines.some(x=>x.zh==='去超市。'))return true;
    if(lines.length===5){
      lines.splice(4,0,{s:'刘小雪',zh:'去超市。',py:'qù chāo shì。',vn:'Đi siêu thị.'});
      diagnostics({patch11_5:true});
      if(lessonId()===11&&Number(document.querySelector('#sceneSelect')?.value)===2&&typeof window.drawScene==='function'){try{window.drawScene()}catch(_e){}}
      return true;
    }
    diagnostics({patch11_5:false,patchError:`unexpected-line-count:${lines.length}`});return false;
  }
  function setText(el,text){if(el&&el.textContent!==text)el.textContent=text}
  function bindButton(button,handler,available=true){
    if(!button||button.dataset.officialAudioBound==='1')return;
    button.dataset.officialAudioBound='1';button.removeAttribute('onclick');
    if(!available){
      button.disabled=true;setText(button,'🔇 无独立教材音');button.title='教材 New Words 录音中没有该词的独立读音';button.setAttribute('aria-label','教材无独立真人录音');return;
    }
    button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();handler()});
  }
  function decorateVocab(){
    if(!ready)return;
    const lesson=lessonId();
    document.querySelectorAll('#vocabGrid .vocab-card').forEach(card=>{
      const word=card.dataset.zh||card.querySelector('.vocab-zh')?.textContent?.trim()||'',available=!!vocabSegment(lesson,word);
      card.querySelectorAll('button.listen').forEach(b=>{if(available)setText(b,'🎧 教材');bindButton(b,()=>playVocab(word,lesson),available)});
    });
    const panel=document.querySelector('#wordPanel .word-detail');
    if(panel){
      const word=panel.querySelector('.word-main')?.textContent?.trim()||'',b=panel.querySelector('.vocab-actions button'),available=!!vocabSegment(lesson,word);
      if(b&&available)setText(b,'🎧 教材发音');bindButton(b,()=>playVocab(word,lesson),available);
    }
    const all=[...document.querySelectorAll('#vocab .tool-row button')].find(b=>/Nghe từ|Nghe giáo trình/.test(b.textContent||''));
    if(all){setText(all,'🎧 Nghe giáo trình');bindButton(all,()=>playVocabLesson(lesson),true)}
  }
  function decorateText(){
    if(!ready)return;
    const lesson=lessonId(),scene=sceneIndex(),track=textTrack(lesson,scene);
    const titleBtn=document.querySelector('#scenePane .scene-title button');
    if(titleBtn&&textTracks[track]){setText(titleBtn,'🎧 教材整段');bindButton(titleBtn,()=>playTextScene(scene,lesson),true)}
    [...document.querySelectorAll('#scenePane .dialogue-card .dialogue-line')].forEach((row,i)=>{
      const b=row.querySelector('.speak-line');if(!b)return;
      setText(b,'🎧');b.title='播放这一句教材真人原声';b.setAttribute('aria-label','教材真人原声');
      bindButton(b,()=>playTextLine(scene,i,lesson),!!textSegment(lesson,scene,i));
    });
  }
  function scan(){
    patchLesson11();decorateVocab();decorateText();warmLesson(lessonId());diagnostics({ready});
  }
  function buildMaps(textData,vocabData){
    textTracks=textData.tracks||{};
    vocabByLesson={};
    Object.entries(vocabData.tracks||{}).forEach(([track,items])=>{
      const lesson=track.split('-')[0],map=vocabByLesson[lesson]||(vocabByLesson[lesson]={});
      items.forEach(([word,start,end])=>{if(!map[word])map[word]={track,start,end}});
    });
    const xian=(vocabData.tracks?.['15-4']||[]).find(x=>x[0]==='西安');
    if(xian){const map=vocabByLesson['6']||(vocabByLesson['6']={});map['西安']={track:'15-4',start:xian[1],end:xian[2],reusedFromLesson:15}}
    ready=Object.keys(textTracks).length===45;
  }
  async function loadMaps(){
    try{
      const [tr,vr]=await Promise.all([
        fetch(`${WORK_DIR}all-text-1-15-compact.json`,{cache:'no-store'}),
        fetch(`${WORK_DIR}all-vocab-1-15-compact.json`,{cache:'no-store'})
      ]);
      if(!tr.ok||!vr.ok)throw new Error(`map-http:${tr.status}/${vr.status}`);
      buildMaps(await tr.json(),await vr.json());scan();
      diagnostics({ready,textTrackCount:Object.keys(textTracks).length,vocabLessons:Object.keys(vocabByLesson).length,error:''});
    }catch(e){ready=false;diagnostics({ready:false,error:String(e?.message||e)});console.error('HSK1 official segment maps failed to load',e)}
  }
  function install(){
    patchLesson11();
    mutationObserver?.disconnect();mutationObserver=new MutationObserver(()=>queueMicrotask(scan));mutationObserver.observe(document.body,{childList:true,subtree:true});
    document.addEventListener('play',e=>{
      const target=e.target;
      if(target instanceof HTMLMediaElement&&target!==activeAudio){
        if(activeAudio){try{activeAudio.pause()}catch(_e){}}
        if(stopTimer){clearTimeout(stopTimer);stopTimer=0}
        activeAudio=null;
      }
    },true);
    loadMaps();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();

  window.HSK1_OFFICIAL_AUDIO={
    version:VERSION,get ready(){return ready},playVocab,playVocabLesson,playTextLine,playTextScene,stop,scan,patchLesson11,vocabSegment,textSegment,lessonVocabTracks,
    diagnostics:()=>window.__HSK1_OFFICIAL_AUDIO_DIAGNOSTICS
  };
})();
