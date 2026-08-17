/* HSK2 教材全文 locked canonical runtime layer. */
(()=>{
if(!window.pako)throw new Error('[HSK2 locked] pako missing');
const b64=window.__HSK2_LOCK_B64;if(!b64)throw new Error('[HSK2 locked] corpus chunks missing');
const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));const CORPUS=JSON.parse(window.pako.ungzip(bytes,{to:'string'}));delete window.__HSK2_LOCK_B64;
const lessons=window.HSK2_LESSONS;if(!Array.isArray(lessons)||lessons.length!==CORPUS.expected_lessons)throw new Error('[HSK2 locked] base lessons missing');
let units=0,lines=0;for(const C of CORPUS.lessons){const L=lessons.find(x=>Number(x.id)===Number(C.lesson));if(!L)throw new Error(`[HSK2 locked] missing lesson ${C.lesson}`);L.title=C.title_zh||L.title;if(C.title_vi)L.vn_title=C.title_vi;L.scenes=C.texts.map(T=>{units++;const lockedLines=T.lines.map((x,i)=>{if(!x.zh||!x.py||!x.vi)throw new Error(`[HSK2 locked] incomplete L${C.lesson} T${T.text_no} line ${i+1}`);lines++;return {spk:x.speaker,zh:x.zh,py:x.py,vn:x.vi,locked:true};});return {title:T.scene_zh||`课文 ${T.text_no}`,vn:T.scene_vi||`Bài khoá ${T.text_no}`,audio_id:T.audio_id,source:T.source,locked:true,lines:lockedLines};});}
const ok=units===CORPUS.expected_text_units&&lines===CORPUS.expected_lines&&lessons.every(L=>Array.isArray(L.scenes)&&L.scenes.length===4&&L.scenes.every(s=>s.locked&&s.lines.every(x=>x.locked&&x.zh&&x.py&&x.vn)));
window.__HSK2_TEXTBOOK_LOCKED={ok,corpus_id:CORPUS.corpus_id,source_pdf_sha256:CORPUS.source_pdf_sha256,lessons:lessons.length,text_units:units,lines};if(typeof document!=='undefined')document.documentElement.dataset.hsk2TextbookLocked=ok?'ok':'error';if(!ok)throw new Error('[HSK2 locked] integrity check failed');
})();
