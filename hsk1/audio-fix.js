/* HSK 1 speech-synthesis reliability patch for lesson audio buttons.
   v2: keep the first speak() call inside the user's click task (important on iOS/WebKit),
   prefer a local Mandarin voice, and convert pinyin-only phonetics examples to speakable Hanzi. */
(function(){
  'use strict';

  const synth=window.speechSynthesis;
  const Utterance=window.SpeechSynthesisUtterance;
  let ticket=0;
  let activeUtterance=null;
  let cachedVoice=null;
  let lastError='';
  let lastText='';

  const PINYIN_SPECIALS=new Map([
    ['mā/má/mǎ/mà','妈，麻，马，骂'],
    ['nǐ+hǎo→níhǎo','你好'],
    ['kě+yǐ→kéyǐ','可以'],
    ['zhōng','中'],
    ['rén','人'],
    ['xuéxiào','学校'],
    ['zàijiàn','再见'],
    ['māma','妈妈'],
    ['yéye','爷爷'],
    ['xièxie','谢谢'],
    ['liù','六'],
    ['guì','贵'],
    ['lùn','论']
  ]);

  function compact(value){return String(value??'').replace(/\s+/g,'').replace(/[，,；;]/g,',').trim()}

  function pinyinIndex(){
    const out=new Map();
    const lessons=Array.isArray(window.HSK1_LESSONS)?window.HSK1_LESSONS:[];
    lessons.forEach(L=>(L.vocab||[]).forEach(w=>{
      const key=compact(w.py||'').toLowerCase();
      if(key&&!out.has(key))out.set(key,w.zh);
    }));
    return out;
  }

  function normalizeSpeechText(value){
    let text=String(value??'').replace(/\s+/g,' ').trim();
    if(!text)return '';

    // Mixed pinyin + Hanzi examples should speak the Chinese characters, not the Latin annotations.
    const han=text.match(/\p{Script=Han}+/gu);
    if(han?.length&&/[A-Za-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/i.test(text))return han.join('，');

    const key=compact(text).toLowerCase();
    if(PINYIN_SPECIALS.has(key))return PINYIN_SPECIALS.get(key);

    // Handle simple lists of isolated pinyin items using vocabulary already present in HSK1.
    if(!han?.length){
      const idx=pinyinIndex();
      const parts=text.split(/\s*[\/,，]\s*/).filter(Boolean);
      if(parts.length>1){
        const mapped=parts.map(x=>idx.get(compact(x).toLowerCase())||PINYIN_SPECIALS.get(compact(x).toLowerCase())||'');
        if(mapped.every(Boolean))return mapped.join('，');
      }
      const one=idx.get(key);
      if(one)return one;
    }
    return text;
  }

  function pickChineseVoice(){
    if(!synth||typeof synth.getVoices!=='function')return null;
    const voices=synth.getVoices()||[];
    const isZh=v=>/^zh(?:-|$)/i.test(v.lang||'')||/Mandarin|Chinese|中文|普通话/i.test((v.name||'')+' '+(v.lang||''));
    cachedVoice=
      voices.find(v=>v.localService!==false&&/^(zh-CN|zh-Hans-CN)$/i.test(v.lang||''))||
      voices.find(v=>v.localService!==false&&isZh(v))||
      voices.find(v=>/^(zh-CN|zh-Hans-CN)$/i.test(v.lang||''))||
      voices.find(isZh)||
      null;
    return cachedVoice;
  }

  function resumeIfNeeded(){
    if(!synth)return;
    try{if(synth.paused)synth.resume()}catch(_e){}
  }

  function installDiagnostics(data){
    window.__HSK1_AUDIO_DIAGNOSTICS={version:'20260815-2',...data};
  }

  function makeUtterance(text,useVoice,myTicket,retryNo){
    const u=new Utterance(text);
    activeUtterance=u; // Strong reference: prevents premature GC on Safari/iOS.
    u.lang='zh-CN';
    u.rate=.82;
    u.pitch=1;
    u.volume=1;
    if(useVoice){const voice=pickChineseVoice();if(voice)u.voice=voice}

    let started=false;
    u.onstart=()=>{
      if(myTicket!==ticket)return;
      started=true;lastError='';
      installDiagnostics({ok:true,playing:true,text,voice:u.voice?.name||'system zh-CN',retry:retryNo});
    };
    u.onend=()=>{
      if(myTicket!==ticket)return;
      activeUtterance=null;
      installDiagnostics({ok:true,playing:false,text,voice:u.voice?.name||'system zh-CN',retry:retryNo});
    };
    u.onerror=ev=>{
      if(myTicket!==ticket)return;
      const code=String(ev?.error||'speech-error');
      if(/canceled|interrupted/i.test(code))return;
      lastError=code;activeUtterance=null;
      // Desktop engines sometimes expose an unusable explicit voice. Retry once with lang only.
      if(useVoice&&retryNo===0){
        setTimeout(()=>{if(myTicket===ticket)queueUtterance(text,myTicket,false,1,false)},0);
        return;
      }
      installDiagnostics({ok:false,playing:false,text,error:code,retry:retryNo});
      if(typeof window.toast==='function')window.toast('Không phát được âm thanh. Hãy kiểm tra âm lượng và giọng tiếng Trung của thiết bị.');
      console.warn('[HSK1 audio]',code);
    };

    // If a browser silently drops the utterance, try once without forcing a voice.
    setTimeout(()=>{
      if(myTicket!==ticket||started||retryNo>0)return;
      let alive=false;
      try{alive=!!(synth.speaking||synth.pending)}catch(_e){}
      if(!alive)queueUtterance(text,myTicket,false,1,false);
    },700);

    return u;
  }

  function queueUtterance(text,myTicket,useVoice,retryNo,cancelBusy){
    if(myTicket!==ticket||!synth||!Utterance)return;
    resumeIfNeeded();
    if(cancelBusy){
      let busy=false;
      try{busy=!!(synth.speaking||synth.pending||synth.paused)}catch(_e){}
      if(busy){try{synth.cancel()}catch(_e){};resumeIfNeeded()}
    }
    const u=makeUtterance(text,useVoice,myTicket,retryNo);
    try{
      // Deliberately synchronous. Do NOT defer the first speak() with setTimeout:
      // iOS/WebKit can require speech playback to remain inside a user gesture.
      synth.speak(u);
      resumeIfNeeded();
    }catch(err){
      activeUtterance=null;lastError=String(err?.message||err);
      if(useVoice&&retryNo===0)setTimeout(()=>{if(myTicket===ticket)queueUtterance(text,myTicket,false,1,false)},0);
      else{
        installDiagnostics({ok:false,playing:false,text,error:lastError,retry:retryNo});
        if(typeof window.toast==='function')window.toast('Không phát được âm thanh trên trình duyệt này.');
        console.warn('[HSK1 audio]',err);
      }
    }
  }

  function robustSpeak(value){
    const text=normalizeSpeechText(value);
    if(!text)return;
    lastText=text;
    const myTicket=++ticket;
    if(!synth||!Utterance){
      lastError='unsupported';
      installDiagnostics({ok:false,playing:false,text,error:'unsupported'});
      if(typeof window.toast==='function')window.toast('Trình duyệt này chưa hỗ trợ phát âm.');
      return;
    }
    queueUtterance(text,myTicket,true,0,true);
  }

  function resolveAudioButton(btn){
    if(!btn)return '';

    const line=btn.closest('.dialogue-line');
    if(btn.matches('.speak-line')&&line)return line.querySelector('.line-zh')?.textContent||'';

    const grammar=btn.closest('.grammar-example');
    if(grammar)return normalizeSpeechText(grammar.querySelector('span')?.textContent||'');

    const sceneTitle=btn.closest('.scene-title');
    if(sceneTitle&&/Đọc đoạn/i.test(btn.textContent||'')){
      return [...document.querySelectorAll('#scenePane .dialogue-line .line-zh')].map(x=>x.textContent.trim()).filter(Boolean).join('，');
    }

    const card=btn.closest('.vocab-card');
    if(card&&btn.classList.contains('listen'))return card.dataset.zh||card.querySelector('.vocab-zh')?.textContent||'';

    const detail=btn.closest('.word-detail');
    if(detail&&/Nghe/i.test(btn.textContent||''))return detail.querySelector('.word-main')?.textContent||'';

    const hanzi=btn.closest('.hanzi-info');
    if(hanzi&&/Nghe/i.test(btn.textContent||''))return hanzi.querySelector('h3')?.textContent||'';

    const toolbar=btn.closest('.tool-row');
    if(toolbar&&/Nghe từ/i.test(btn.textContent||'')){
      return [...document.querySelectorAll('#vocabGrid .vocab-card')]
        .filter(x=>x.offsetParent!==null)
        .map(x=>x.dataset.zh||x.querySelector('.vocab-zh')?.textContent||'')
        .filter(Boolean).join('，');
    }
    return '';
  }

  // Capture all HSK1 audio buttons before their legacy inline/bubble handlers.
  // This guarantees the real synth.speak() call happens directly in the click event.
  document.addEventListener('click',ev=>{
    const btn=ev.target?.closest?.('button');
    if(!btn)return;
    const text=resolveAudioButton(btn);
    if(!text)return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    robustSpeak(text);
  },true);

  if(synth){
    pickChineseVoice();
    if(typeof synth.addEventListener==='function')synth.addEventListener('voiceschanged',pickChineseVoice);
    else if('onvoiceschanged' in synth)synth.onvoiceschanged=pickChineseVoice;
  }

  window.speak=robustSpeak;
  window.__HSK1_AUDIO_FIX={
    version:'20260815-2',
    speak:robustSpeak,
    normalizeText:normalizeSpeechText,
    resolveButtonText:resolveAudioButton,
    getVoice:()=>cachedVoice?.name||'',
    getLastError:()=>lastError,
    getLastText:()=>lastText
  };
})();
