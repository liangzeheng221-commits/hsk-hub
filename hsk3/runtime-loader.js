/* HSK3 runtime entrypoint. */
(()=>{
  'use strict';
  const s=document.createElement('script');
  s.src='runtime-loader-core.js?v=20260815-reviewed-practice-1';
  s.async=false;
  s.onerror=()=>console.error('[HSK3 bootstrap] không tải được runtime-loader-core.js');
  document.head.appendChild(s);
})();
