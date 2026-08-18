/* Safety gate for the additive New HSK 1 textbook-audio layer.
   Cards are shown only after the referenced MP3 is confirmed to exist.
   Step 6 also loads the official segment-data/player layer on the development branch. */
(function(){
  'use strict';
  const STYLE_ID='hsk1TextbookAudioGuardStyle';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent='.textbook-audio-card:not(.audio-track-verified),.shadow-card:not(.audio-track-verified){display:none!important}';
    document.head.appendChild(style);
  }

  const checked=new WeakSet();
  async function verify(card){
    if(!card||checked.has(card))return;
    checked.add(card);
    const audio=card.querySelector('audio[src]');
    if(!audio){card.remove();return}
    try{
      const response=await fetch(audio.src,{method:'HEAD',cache:'no-store'});
      if(response.ok){
        card.classList.add('audio-track-verified');
        card.dataset.audioVerified='1';
      }else{
        card.remove();
      }
    }catch(_e){
      card.remove();
    }
  }

  function scan(root=document){
    root.querySelectorAll?.('.textbook-audio-card,.shadow-card').forEach(verify);
  }

  const observer=new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes){
        if(node.nodeType!==1)continue;
        if(node.matches?.('.textbook-audio-card,.shadow-card'))verify(node);
        scan(node);
      }
    }
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  scan();

  function loadStep6(){
    if(document.querySelector('script[data-hsk1-segment-layer]'))return;
    const player=document.createElement('script');
    player.src='textbook-segment-audio.js?v=20260818-1';
    player.async=false;
    player.dataset.hsk1SegmentLayer='player';
    player.addEventListener('error',()=>console.error('HSK1 segment player failed to load'));
    document.head.appendChild(player);
  }
  loadStep6();

  window.__HSK1_TEXTBOOK_AUDIO_GUARD={version:'20260818-step6',scan,verify,loadStep6};
})();
