/* HSK3 runtime shim for verified reviewed-practice chunks. */
(()=>{
  'use strict';
  const realFetch=window.fetch.bind(window);
  const part06=['01','02','03a','03b','03c','03d','04','05','06','07','08','09'].map(x=>`../practice/reviewed/hsk3-v1.1.part06-${x}.b64`);
  window.fetch=async function(input,init){
    const url=typeof input==='string'?input:String(input?.url||'');
    if(/practice\/reviewed\/hsk3-v1\.1\.part06\.b64(?:[?#].*)?$/.test(url)){
      const responses=await Promise.all(part06.map(path=>realFetch(path,{cache:'no-store'})));
      const bad=responses.find(r=>!r.ok);
      if(bad)throw new Error('Không tải được dữ liệu luyện tập: '+bad.status);
      const text=(await Promise.all(responses.map(r=>r.text()))).join('');
      return new Response(text,{status:200,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }
    return realFetch(input,init);
  };
  const s=document.createElement('script');
  s.src='runtime-loader-core.js?v=20260815-hsk3-practice-v11-4';
  s.async=false;
  s.onerror=()=>console.error('[HSK3 bootstrap] không tải được runtime-loader-core.js');
  document.head.appendChild(s);
})();