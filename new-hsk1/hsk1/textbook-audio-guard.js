/* HSK1 official-audio safety guard — architecture cleanup.
   It never loads scripts dynamically. It only blocks vocabulary/text clicks if the static official layer is unavailable. */
(function(){
  'use strict';
  const VERSION='20260818-arch-v1';
  const STYLE_ID='hsk1TextbookAudioGuardStyle';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');style.id=STYLE_ID;
    style.textContent='.textbook-audio-card:not(.audio-track-verified),.shadow-card:not(.audio-track-verified){display:none!important}';
    document.head.appendChild(style);
  }
  function toastSafe(msg){
    if(typeof window.toast==='function'){window.toast(msg);return}
    let t=document.querySelector('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}
    t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800);
  }
  function relevant(button){
    if(!button)return false;
    const card=button.closest?.('#vocabGrid .vocab-card');
    const panel=button.closest?.('#wordPanel');
    const line=button.closest?.('#scenePane .dialogue-line');
    const sceneTitle=button.closest?.('#scenePane .scene-title');
    const vocabAll=button.closest?.('#vocab .tool-row')&&/Nghe từ|Nghe giáo trình/.test(button.textContent||'');
    return !!((card&&button.matches('.listen'))||panel||line||sceneTitle||vocabAll);
  }
  function guardUnavailable(e){
    const button=e.target.closest?.('button');if(!relevant(button))return;
    if(window.HSK1_OFFICIAL_AUDIO?.ready)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    try{window.speechSynthesis?.cancel?.()}catch(_e){}
    toastSafe('教材真人原声没有成功初始化，请刷新页面后重试。');
  }
  document.addEventListener('click',guardUnavailable,true);

  const checked=new WeakSet();
  async function urlExists(url){
    try{const head=await fetch(url,{method:'HEAD',cache:'no-store'});if(head.ok)return true;if(![403,405,501].includes(head.status))return false}catch(_e){}
    try{const get=await fetch(url,{method:'GET',headers:{Range:'bytes=0-0'},cache:'no-store'});try{get.body?.cancel?.()}catch(_e){}return get.ok}catch(_e){return false}
  }
  function updateCardCopy(card){
    const sub=card.querySelector('.textbook-audio-title span');
    if(sub)sub.textContent='课文真人原声；逐句 🎧 按钮使用同一教材录音的对应片段。';
    const fb=card.querySelector('.audio-fallback');
    if(fb)fb.textContent='教材原声暂时无法加载，请检查网络后重试。';
  }
  async function verify(card){
    if(!card||checked.has(card))return;checked.add(card);updateCardCopy(card);
    const audio=card.querySelector('audio[src]');if(!audio){card.remove();return}
    if(await urlExists(audio.src)){card.classList.add('audio-track-verified');card.dataset.audioVerified='1'}else card.remove();
  }
  function scan(root=document){root.querySelectorAll?.('.textbook-audio-card,.shadow-card').forEach(card=>{updateCardCopy(card);verify(card)})}
  const observer=new MutationObserver(records=>{
    for(const record of records)for(const node of record.addedNodes){
      if(node.nodeType!==1)continue;
      if(node.matches?.('.textbook-audio-card,.shadow-card'))verify(node);
      scan(node);
    }
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});scan();
  window.__HSK1_TEXTBOOK_AUDIO_GUARD={version:VERSION,scan,verify,urlExists};
  window.__HSK1_TEXTBOOK_AUDIO_GUARD_DIAGNOSTICS={version:VERSION,staticOfficialLayer:true,ready:!!window.HSK1_OFFICIAL_AUDIO?.ready};
})();
