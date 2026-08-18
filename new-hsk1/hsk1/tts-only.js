/* HSK1 TTS-only layer.
   Browser speech synthesis is intentionally limited to grammar/phonetics and Hanzi.
   Vocabulary and textbook dialogue never route through this file. */
(function(){
  'use strict';
  const VERSION='20260818-tts-only-v1';
  const synth=window.speechSynthesis;
  const Utterance=window.SpeechSynthesisUtterance;
  let activeUtterance=null;
  let ticket=0;
  let cachedVoice=null;

  function pickChineseVoice(){
    if(!synth||typeof synth.getVoices!=='function')return null;
    const voices=synth.getVoices()||[];
    const isZh=v=>/^zh(?:-|$)/i.test(v.lang||'')||/Mandarin|Chinese|中文|普通话/i.test((v.name||'')+' '+(v.lang||''));
    cachedVoice=
      voices.find(v=>v.localService!==false&&/^(zh-CN|zh-Hans-CN)$/i.test(v.lang||''))||
      voices.find(v=>v.localService!==false&&isZh(v))||
      voices.find(v=>/^(zh-CN|zh-Hans-CN)$/i.test(v.lang||''))||
      voices.find(isZh)||null;
    return cachedVoice;
  }
  function normalize(value){
    const text=String(value??'').replace(/\s+/g,' ').trim();
    if(!text)return '';
    const han=text.match(/\p{Script=Han}+/gu);
    if(han?.length&&/[A-Za-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/i.test(text))return han.join('，');
    return text;
  }
  function toastSafe(msg){
    if(typeof window.toast==='function'){window.toast(msg);return}
    console.warn(msg);
  }
  function robustSpeak(value){
    const text=normalize(value);if(!text)return;
    if(!synth||!Utterance){toastSafe('Trình duyệt này chưa hỗ trợ phát âm.');return}
    const myTicket=++ticket;
    try{if(synth.paused)synth.resume()}catch(_e){}
    try{if(synth.speaking||synth.pending)synth.cancel()}catch(_e){}
    const u=new Utterance(text);activeUtterance=u;
    u.lang='zh-CN';u.rate=.82;u.pitch=1;u.volume=1;
    const voice=pickChineseVoice();if(voice)u.voice=voice;
    u.onend=()=>{if(myTicket===ticket)activeUtterance=null};
    u.onerror=ev=>{
      if(myTicket!==ticket)return;
      activeUtterance=null;
      if(!/canceled|interrupted/i.test(String(ev?.error||'')))toastSafe('Không phát được âm thanh TTS trên thiết bị này.');
    };
    try{synth.speak(u);if(synth.paused)synth.resume()}catch(_e){activeUtterance=null;toastSafe('Không phát được âm thanh TTS trên trình duyệt này.')}
  }
  if(synth){
    pickChineseVoice();
    if(typeof synth.addEventListener==='function')synth.addEventListener('voiceschanged',pickChineseVoice);
  }
  window.speak=robustSpeak;
  window.__HSK1_TTS_ONLY={version:VERSION,speak:robustSpeak,getVoice:()=>cachedVoice?.name||''};
})();
