/* HSK 1 speech-synthesis reliability patch for lesson audio buttons. */
(function(){
  'use strict';
  const synth=window.speechSynthesis;
  if(!synth||typeof window.SpeechSynthesisUtterance!=='function')return;

  let ticket=0;
  let activeUtterance=null;
  let cachedVoice=null;
  let lastError='';

  function pickChineseVoice(){
    const voices=typeof synth.getVoices==='function'?synth.getVoices():[];
    cachedVoice=
      voices.find(v=>/^(zh-CN|zh-Hans-CN)$/i.test(v.lang||''))||
      voices.find(v=>/^zh(-|$)/i.test(v.lang||''))||
      voices.find(v=>/Mandarin|Chinese|中文|普通话/i.test((v.name||'')+' '+(v.lang||'')))||
      null;
    return cachedVoice;
  }

  function resumeIfNeeded(){
    try{if(synth.paused)synth.resume()}catch(_e){}
  }

  function play(text,myTicket,useExplicitVoice){
    if(myTicket!==ticket)return;
    resumeIfNeeded();
    const u=new SpeechSynthesisUtterance(text);
    activeUtterance=u; // Keep a strong reference until playback finishes (important on Safari/iOS).
    u.lang='zh-CN';
    u.rate=.82;
    u.pitch=1;
    u.volume=1;
    if(useExplicitVoice){
      const voice=pickChineseVoice();
      if(voice)u.voice=voice;
    }

    u.onstart=()=>{
      if(myTicket!==ticket)return;
      lastError='';
      window.__HSK1_AUDIO_DIAGNOSTICS={ok:true,playing:true,text,voice:u.voice?.name||'system zh-CN'};
    };
    u.onend=()=>{
      if(myTicket!==ticket)return;
      activeUtterance=null;
      window.__HSK1_AUDIO_DIAGNOSTICS={ok:true,playing:false,text,voice:u.voice?.name||'system zh-CN'};
    };
    u.onerror=ev=>{
      if(myTicket!==ticket)return;
      const code=String(ev?.error||'speech-error');
      lastError=code;
      activeUtterance=null;
      // A user clicking another audio button intentionally causes canceled/interrupted; do not warn/retry those.
      if(/canceled|interrupted/i.test(code))return;
      // Some browsers expose a Chinese voice before it is actually usable. Retry once with lang only.
      if(useExplicitVoice){
        setTimeout(()=>play(text,myTicket,false),70);
        return;
      }
      window.__HSK1_AUDIO_DIAGNOSTICS={ok:false,playing:false,text,error:code};
      if(typeof window.toast==='function')window.toast('Không phát được âm thanh. Hãy kiểm tra âm lượng hoặc giọng tiếng Trung của trình duyệt.');
      console.warn('[HSK1 audio]',code);
    };

    try{
      synth.speak(u);
      // Chrome/Safari can leave the engine paused after cancel(); resume again shortly after queueing.
      setTimeout(()=>{if(myTicket===ticket)resumeIfNeeded()},60);
    }catch(err){
      activeUtterance=null;
      lastError=String(err?.message||err);
      if(useExplicitVoice)setTimeout(()=>play(text,myTicket,false),70);
      else console.warn('[HSK1 audio]',err);
    }
  }

  function robustSpeak(value){
    const text=String(value??'').replace(/\s+/g,' ').trim();
    if(!text)return;
    const myTicket=++ticket;
    const busy=!!(synth.speaking||synth.pending||synth.paused);
    if(busy){
      try{synth.cancel()}catch(_e){}
      // A small gap prevents cancel()+speak() in the same tick from being swallowed on Safari/Chrome.
      setTimeout(()=>play(text,myTicket,true),45);
    }else{
      play(text,myTicket,true);
    }
  }

  pickChineseVoice();
  if(typeof synth.addEventListener==='function')synth.addEventListener('voiceschanged',pickChineseVoice);
  else if('onvoiceschanged' in synth)synth.onvoiceschanged=pickChineseVoice;

  window.speak=robustSpeak;
  window.__HSK1_AUDIO_FIX={version:'20260815-1',speak:robustSpeak,getVoice:()=>cachedVoice?.name||'',getLastError:()=>lastError};
})();
