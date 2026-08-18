/* Permanent production data corrections for New HSK 1 textbook/audio alignment. */
(function(){
  'use strict';
  const VERSION='20260818-step7-v1';
  function apply(){
    const lesson=window.HSK1_LESSONS?.find?.(x=>Number(x.id)===11);
    const lines=lesson?.scenes?.[2]?.lines;
    if(!lines)return false;
    if(lines.some(x=>x.zh==='去超市。'))return true;
    if(lines.length!==5){console.error('HSK1 correction 11-5 skipped: unexpected line count',lines.length);return false}
    lines.splice(4,0,{s:'刘小雪',zh:'去超市。',py:'qù chāo shì。',vn:'Đi siêu thị.'});
    if(Number(new URL(location.href).searchParams.get('id')||0)===11&&Number(document.querySelector('#sceneSelect')?.value)===2&&typeof window.drawScene==='function'){
      try{window.drawScene()}catch(_e){}
    }
    return true;
  }
  const ok=apply();
  window.HSK1_TEXTBOOK_DATA_CORRECTIONS={version:VERSION,apply,status:ok?'PASS':'PENDING'};
})();
