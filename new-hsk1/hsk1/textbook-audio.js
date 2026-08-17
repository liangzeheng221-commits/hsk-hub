/* 《新HSK教程1》3.0 textbook audio integration.
   Additive layer: keeps existing browser TTS and lesson rendering intact. */
(function(){
  'use strict';

  const VERSION='20260818-1';
  const AUDIO_DIR='audio/';
  const TEXT_TRACKS=[1,3,5];
  const VOCAB_TRACKS=[2,4,6];
  const SHADOW_TEXT={
    1:{zh:'妈种麻，我放马。马吃麻，妈骂马。',py:'Mā zhòng má, wǒ fàng mǎ. Mǎ chī má, mā mà mǎ.'},
    2:{zh:'七加一，再减一，加完减完等于几？加完减完还是七。',py:'Qī jiā yī, zài jiǎn yī, jiāwán jiǎnwán děngyú jǐ? Jiāwán jiǎnwán hái shì qī.'},
    3:{zh:'四是四，十是十。十四是十四，四十是四十。',py:'Sì shì sì, shí shì shí. Shísì shì shísì, sìshí shì sìshí.'}
  };
  let activeAudio=null;
  let activeLesson=0;
  let activeScene=0;
  let listenCount=0;
  let observer=null;

  function lessonId(){
    const n=Number(new URL(location.href).searchParams.get('id')||1);
    return Math.max(1,Math.min(15,Number.isFinite(n)?n:1));
  }
  function sceneIndex(){
    const selected=document.querySelector('#sceneSelect');
    if(selected && selected.value!=='') return Math.max(0,Math.min(2,Number(selected.value)||0));
    const active=document.querySelector('#sceneTabs .scene-tab.active');
    return Math.max(0,Math.min(2,Number(active?.dataset?.i)||0));
  }
  function trackName(lesson,track){return `${lesson}-${track}`}
  function trackUrl(lesson,track){return `${AUDIO_DIR}${trackName(lesson,track)}.mp3`}
  function textTrack(lesson,scene){return TEXT_TRACKS[scene]||1}
  function vocabTrack(lesson,scene){return VOCAB_TRACKS[scene]||2}
  function allTracks(){
    const out=[];
    for(let lesson=1;lesson<=15;lesson++){
      const max=lesson<=3?7:6;
      for(let track=1;track<=max;track++) out.push({lesson,track,id:trackName(lesson,track),url:trackUrl(lesson,track)});
    }
    return out;
  }
  const MANIFEST=Object.freeze(allTracks());

  function stopOther(audio){
    if(activeAudio && activeAudio!==audio){
      try{activeAudio.pause()}catch(_e){}
    }
    activeAudio=audio;
  }
  function formatTime(value){
    if(!Number.isFinite(value)||value<0)return '0:00';
    const m=Math.floor(value/60),s=Math.floor(value%60);
    return `${m}:${String(s).padStart(2,'0')}`;
  }
  function diagnostics(extra={}){
    window.__HSK1_TEXTBOOK_AUDIO_DIAGNOSTICS={
      version:VERSION,
      manifestCount:MANIFEST.length,
      lesson:activeLesson||lessonId(),
      scene:activeScene,
      listenCount,
      activeTrack:activeAudio?.dataset?.track||'',
      ...extra
    };
  }
  function installStyles(){
    if(document.getElementById('hsk1TextbookAudioStyles'))return;
    const style=document.createElement('style');
    style.id='hsk1TextbookAudioStyles';
    style.textContent=`
      .textbook-audio-card{margin:0 0 14px;padding:14px 15px;border:1px solid #d7e8df;border-left:4px solid #d7a546;border-radius:14px;background:linear-gradient(135deg,#fffdf8,#f7fbf8)}
      .textbook-audio-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px}
      .textbook-audio-title{display:flex;flex-direction:column;gap:2px}.textbook-audio-title b{color:#195b3c;font-size:14px}.textbook-audio-title span{color:#6d7d74;font-size:10px}
      .textbook-track-badge{flex:0 0 auto;padding:5px 8px;border:1px solid #efd7aa;border-radius:999px;background:#fff7e9;color:#8b5a12;font-size:10px;font-weight:800}
      .textbook-audio-row{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:10px}.textbook-audio-row audio{width:100%;min-width:0;height:38px}
      .textbook-speed{height:36px;border:1px solid #d4e5dc;border-radius:9px;background:#fff;color:#315b48;padding:0 8px;font:inherit;font-size:11px;font-weight:700}
      .textbook-audio-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}.textbook-audio-actions button{min-height:36px}
      .listening-status{display:none;margin-top:10px;padding:9px 11px;border-radius:10px;background:#eef7f1;color:#315b48;font-size:11px;line-height:1.55}.listening-status.show{display:block}
      #scenePane.textbook-listening .dialogue-card{position:relative;min-height:150px;background:linear-gradient(135deg,#f7faf8,#fffaf2)}
      #scenePane.textbook-listening .dialogue-line{display:none}
      #scenePane.textbook-listening .dialogue-card:after{content:'🎧 先听原声，不看文本\\A Nghe audio trước, chưa xem chữ Hán / pinyin / tiếng Việt.';white-space:pre-line;position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:28px;color:#527063;font-size:13px;line-height:1.7}
      #scenePane.textbook-listening.textbook-revealed .dialogue-line{display:grid}
      #scenePane.textbook-listening.textbook-revealed .dialogue-card:after{display:none}
      .shadow-card{margin-top:18px;padding:16px;border:1px solid #ead8ae;border-radius:16px;background:linear-gradient(135deg,#fffaf0,#fff)}
      .shadow-card h3{margin:0;color:#195b3c;font-family:'Noto Serif SC',serif;font-size:18px}.shadow-card .shadow-sub{margin:4px 0 11px;color:#6d7d74;font-size:11px;line-height:1.6}
      .shadow-text{margin:12px 0 0;padding:11px 12px;border-radius:11px;background:#f7faf8;color:#263f32;font-family:'Noto Serif SC',serif;font-size:17px;line-height:1.8}.shadow-text small{display:block;margin-top:5px;color:#7a887f;font-family:Inter,sans-serif;font-size:10px}
      .audio-fallback{display:none;margin-top:8px;color:#8b4638;font-size:10px;line-height:1.5}.audio-fallback.show{display:block}
      @media(max-width:650px){.textbook-audio-row{grid-template-columns:1fr}.textbook-speed{width:100%}.textbook-audio-head{align-items:center}.shadow-card{padding:13px}.textbook-audio-actions button{flex:1 1 145px}}
    `;
    document.head.appendChild(style);
  }
  function makeAudio(lesson,track,kind){
    const audio=document.createElement('audio');
    audio.controls=true;
    audio.preload='metadata';
    audio.playsInline=true;
    audio.src=trackUrl(lesson,track);
    audio.dataset.track=trackName(lesson,track);
    audio.dataset.kind=kind;
    audio.addEventListener('play',()=>{stopOther(audio);diagnostics({playing:true,error:''})});
    audio.addEventListener('pause',()=>diagnostics({playing:false}));
    audio.addEventListener('loadedmetadata',()=>diagnostics({duration:formatTime(audio.duration),error:''}));
    audio.addEventListener('error',()=>{
      const msg=audio.closest('.textbook-audio-card,.shadow-card')?.querySelector('.audio-fallback');
      msg?.classList.add('show');
      diagnostics({playing:false,error:`audio-load-failed:${audio.dataset.track}`});
    });
    return audio;
  }
  function makeSpeed(audio){
    const select=document.createElement('select');
    select.className='textbook-speed';
    select.setAttribute('aria-label','Tốc độ phát');
    [0.75,1,1.25].forEach(rate=>{
      const o=document.createElement('option');o.value=String(rate);o.textContent=`${rate}×`;if(rate===1)o.selected=true;select.appendChild(o);
    });
    select.addEventListener('change',()=>{audio.playbackRate=Number(select.value)||1});
    return select;
  }
  function listenStatusText(){
    if(listenCount<=0)return 'Lần nghe: 0/2 · 建议先完整听一遍，再听第二遍。';
    if(listenCount===1)return '✓ Đã nghe lần 1/2 · 已完成第1遍。Hãy nghe thêm một lần trước khi xem nguyên văn.';
    return '✓ Đã nghe đủ 2/2 · 已完成两遍。Bây giờ có thể mở nguyên văn để đối chiếu.';
  }
  function updateListeningUI(){
    const pane=document.getElementById('scenePane');
    if(!pane)return;
    const status=pane.querySelector('.listening-status');
    if(status)status.textContent=listenStatusText();
    diagnostics({listening:pane.classList.contains('textbook-listening'),revealed:pane.classList.contains('textbook-revealed')});
  }
  function decorateScene(){
    const pane=document.getElementById('scenePane');
    const card=pane?.querySelector('.dialogue-card');
    const title=pane?.querySelector('.scene-title');
    if(!pane||!card||!title||pane.dataset.textbookAudioReady==='1')return;

    activeLesson=lessonId();activeScene=sceneIndex();listenCount=0;
    pane.dataset.textbookAudioReady='1';
    pane.classList.remove('textbook-listening','textbook-revealed');

    const track=textTrack(activeLesson,activeScene);
    const wrap=document.createElement('section');
    wrap.className='textbook-audio-card';
    wrap.setAttribute('aria-label','教材原声');
    wrap.innerHTML=`<div class="textbook-audio-head"><div class="textbook-audio-title"><b>🎧 教材原声 · Audio giáo trình</b><span>课文 ${activeScene+1} · Nghe bản thu đi kèm giáo trình; nút 🔊 ở từng câu vẫn dùng để luyện từng câu.</span></div><span class="textbook-track-badge">${trackName(activeLesson,track)}</span></div><div class="textbook-audio-row"></div><div class="textbook-audio-actions"><button type="button" class="ghost-btn listening-toggle">🎧 Chế độ nghe · 听力模式</button><button type="button" class="ghost-btn reveal-toggle" hidden>👁 Hiện nguyên văn · 显示原文</button></div><div class="listening-status"></div><div class="audio-fallback">Không tải được audio giáo trình. Các nút 🔊 TTS hiện có vẫn dùng bình thường; hãy kiểm tra kết nối hoặc đường dẫn audio.</div>`;
    const row=wrap.querySelector('.textbook-audio-row');
    const audio=makeAudio(activeLesson,track,'text');
    row.append(audio,makeSpeed(audio));
    card.before(wrap);

    const status=wrap.querySelector('.listening-status');
    const toggle=wrap.querySelector('.listening-toggle');
    const reveal=wrap.querySelector('.reveal-toggle');
    audio.addEventListener('ended',()=>{
      if(pane.classList.contains('textbook-listening')){
        listenCount=Math.min(2,listenCount+1);updateListeningUI();
      }
    });
    toggle.addEventListener('click',()=>{
      const entering=!pane.classList.contains('textbook-listening');
      pane.classList.toggle('textbook-listening',entering);
      pane.classList.remove('textbook-revealed');
      listenCount=0;
      try{audio.pause();audio.currentTime=0}catch(_e){}
      status.classList.toggle('show',entering);
      reveal.hidden=!entering;
      toggle.textContent=entering?'↩ Thoát chế độ nghe · 退出听力模式':'🎧 Chế độ nghe · 听力模式';
      if(entering){audio.play().catch(()=>{})}
      updateListeningUI();
    });
    reveal.addEventListener('click',()=>{
      const on=!pane.classList.contains('textbook-revealed');
      pane.classList.toggle('textbook-revealed',on);
      reveal.textContent=on?'🙈 Ẩn nguyên văn · 隐藏原文':'👁 Hiện nguyên văn · 显示原文';
      updateListeningUI();
    });

    renderShadowing();
    diagnostics({ready:true,textTrack:trackName(activeLesson,track),vocabTrack:trackName(activeLesson,vocabTrack(activeLesson,activeScene))});
  }
  function renderShadowing(){
    const textSection=document.getElementById('text');
    if(!textSection)return;
    const old=textSection.querySelector('.shadow-card');if(old)old.remove();
    const lesson=lessonId();if(lesson>3)return;
    const card=document.createElement('section');card.className='shadow-card';card.setAttribute('aria-label','跟读绕口令');
    card.innerHTML=`<div class="textbook-audio-head"><div><h3>跟读绕口令 · Shadow the Tongue Twister</h3><p class="shadow-sub">Nghe nguyên thanh ${lesson}-7, dừng lại và đọc theo. Nên bắt đầu ở 0.75× rồi trở về 1×.</p></div><span class="textbook-track-badge">${lesson}-7</span></div><div class="textbook-audio-row"></div>${SHADOW_TEXT[lesson]?`<div class="shadow-text">${SHADOW_TEXT[lesson].zh}<small>${SHADOW_TEXT[lesson].py}<br>教材原文 · Nguyên văn trong giáo trình</small></div>`:''}<div class="audio-fallback">Không tải được audio ${lesson}-7. Hãy kiểm tra kết nối hoặc đường dẫn audio.</div>`;
    const row=card.querySelector('.textbook-audio-row');const audio=makeAudio(lesson,7,'shadow');row.append(audio,makeSpeed(audio));
    document.getElementById('scenePane').after(card);
  }
  function bind(){
    installStyles();
    const pane=document.getElementById('scenePane');if(!pane)return;
    observer?.disconnect();
    observer=new MutationObserver(()=>{
      if(pane.querySelector('.dialogue-card')&&pane.dataset.textbookAudioReady!=='1')decorateScene();
    });
    observer.observe(pane,{childList:true,subtree:false});
    const tabs=document.getElementById('sceneTabs');
    const select=document.getElementById('sceneSelect');
    const reset=()=>{delete pane.dataset.textbookAudioReady;setTimeout(decorateScene,0)};
    tabs?.addEventListener('click',e=>{if(e.target.closest('.scene-tab'))reset()},true);
    select?.addEventListener('change',reset,true);
    decorateScene();
  }

  window.HSK1_TEXTBOOK_AUDIO={
    version:VERSION,
    manifest:MANIFEST,
    textTrack:(lesson,scene)=>trackName(lesson,textTrack(lesson,scene)),
    vocabTrack:(lesson,scene)=>trackName(lesson,vocabTrack(lesson,scene)),
    shadowTrack:lesson=>lesson<=3?`${lesson}-7`:null,
    decorate:decorateScene
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(bind,0),{once:true});
  else setTimeout(bind,0);
})();
