/* Final student-facing polish shared by HSK 1–4.
   - keeps vocabulary POS strictly bilingual and separate from audit/supplement labels
   - adds Vietnamese explanations to HSK1/HSK2 phonetics points
   - removes internal-sounding textbook labels while preserving learning content
   - is idempotent and mutation-safe */
(()=>{
'use strict';
if(window.__HSK_STUDENT_POLISH_LOADED)return;
window.__HSK_STUDENT_POLISH_LOADED=true;

const POS={
  'n.':'名词 · Danh từ','v.':'动词 · Động từ','adj.':'形容词 · Tính từ','adv.':'副词 · Phó từ',
  'prep.':'介词 · Giới từ','conj.':'连词 · Liên từ','part.':'助词 · Trợ từ','m.':'量词 · Lượng từ',
  'num.':'数词 · Số từ','pron.':'代词 · Đại từ','loc.':'方位词 · Từ chỉ phương vị',
  'time':'时间词 · Từ chỉ thời gian','modal':'能愿动词 · Động từ năng nguyện','proper':'专有名词 · Danh từ riêng',
  'phrase':'短语 · Cụm từ','idiom':'成语 · Thành ngữ','num-m.':'数量词 · Cụm số lượng'
};
const RAW_POS={
  'danh từ':'n.','dt.':'n.','dt':'n.','động từ':'v.','đgt.':'v.','đgt':'v.','tính từ':'adj.','tt.':'adj.','tt':'adj.',
  'phó từ':'adv.','phó.':'adv.','giới từ':'prep.','liên từ':'conj.','trợ từ':'part.','lượng từ':'m.','số từ':'num.',
  'đại từ':'pron.','danh từ chỉ thời gian':'time','từ chỉ phương vị':'loc.','trợ đgt.':'modal','trợ động từ':'modal',
  'danh từ riêng':'proper','tên riêng':'proper','数量词':'num-m.','短语':'phrase','成语':'idiom',
  '名词':'n.','动词':'v.','形容词':'adj.','副词':'adv.','介词':'prep.','连词':'conj.','助词':'part.','量词':'m.',
  '数词':'num.','代词':'pron.','方位词':'loc.','时间词':'time','能愿动词':'modal','专名':'proper','专有名词':'proper'
};
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function level(){
  if(document.body?.classList.contains('hsk1'))return 1;
  if(document.body?.classList.contains('hsk3'))return 3;
  if(document.body?.classList.contains('hsk4-upper'))return 41;
  if(document.body?.classList.contains('hsk4-lower'))return 42;
  if(Array.isArray(window.HSK2_LESSONS))return 2;
  return 0;
}
function lesson(){
  try{if(typeof L!=='undefined'&&L)return L}catch(e){}
  const id=Number(new URL(location.href).searchParams.get('id')||1);
  const keys=['HSK1_LESSONS','HSK2_LESSONS','HSK3_LESSONS','HSK4_UPPER_LESSONS','HSK4_LOWER_LESSONS'];
  for(const k of keys){const a=window[k];if(Array.isArray(a)){const x=a.find(v=>Number(v.id)===id);if(x)return x}}
  return null;
}
function normalizePos(raw){
  let s=String(raw||'').trim();if(!s)return '';
  if(/[·]/.test(s)&&/名词|动词|形容词|副词|代词|数词|量词|介词|连词|助词|时间词|方位词|专有名词/.test(s))return s;
  s=s.replace(/^★\s*(?:教材)?补充词\s*[·:]?\s*/,'').replace(/^核心词\s*[·:]?\s*/,'').trim();
  const low=s.toLowerCase().replace(/\s+/g,' ').trim();
  const combo={
    'danh từ / động từ':'名词/动词 · Danh từ/Động từ','danh từ/động từ':'名词/动词 · Danh từ/Động từ','dt./đgt.':'名词/动词 · Danh từ/Động từ',
    'động từ / danh từ':'动词/名词 · Động từ/Danh từ','tính từ / động từ':'形容词/动词 · Tính từ/Động từ','tính từ/động từ':'形容词/动词 · Tính từ/Động từ',
    'tính từ / phó từ':'形容词/副词 · Tính từ/Phó từ','tính từ/phó từ':'形容词/副词 · Tính từ/Phó từ','phó từ / liên từ':'副词/连词 · Phó từ/Liên từ'
  };
  if(combo[low])return combo[low];
  const code=RAW_POS[low]||RAW_POS[s]||s;
  if(POS[code])return POS[code];
  return s;
}
function cardWord(card,Ls){
  const zh=(card.querySelector('.vzh,.vocab-zh')?.textContent||card.dataset.zh||'').trim();
  return (Ls?.vocab||[]).find(w=>w.zh===zh)||null;
}
function fixPosBadges(){
  const Ls=lesson();if(!Ls)return;
  document.querySelectorAll('#vocabGrid .vcard,#vocabGrid .vocab-card').forEach(card=>{
    const w=cardWord(card,Ls);if(!w)return;
    const raw=w.posLabel||w.base_pos||w.pos||'';
    const label=normalizePos(raw);
    if(!label)return;
    card.querySelectorAll('.pos-badge.unified-pos').forEach(b=>{if(b.textContent!==label)b.textContent=label});
  });
}

const H1={
3:[
  'Phân biệt cách phát âm các thanh mẫu j, q, x với z, c, s.',
  'Phân biệt cách phát âm các vận mẫu i, u, ü.',
  'Biến điệu của “不”: trước âm tiết thanh 4 thường đọc bú; khi ghi pinyin vẫn giữ thanh gốc bù theo quy tắc của bài.',
  'Khi ü và các vận mẫu bắt đầu bằng ü ghép với j, q, x, lúc viết pinyin bỏ hai chấm trên ü.'
],
4:[
  'Phân biệt cách phát âm các thanh mẫu zh, ch, sh, r.',
  'Phân biệt vận mẫu mũi trước và vận mẫu mũi sau.',
  'Biến điệu của “一”: cách đọc thay đổi theo thanh điệu của âm tiết đứng sau.',
  'Quy tắc pinyin (3): cách sử dụng y và w.'
],
5:[
  'Luyện cách phát âm 儿化 (âm cuốn lưỡi hóa).',
  'Phân biệt cách phát âm các vận mẫu bắt đầu bằng i, u, ü.',
  'Phân biệt âm bật hơi và âm không bật hơi.',
  'Quy tắc pinyin (4): cách dùng dấu cách âm (’).'
],
6:['Phối thanh của từ hai âm tiết: âm tiết đầu thanh 1 + âm tiết sau thanh 1/2/3/4.'],
7:['Phối thanh của từ hai âm tiết: âm tiết đầu thanh 2 + âm tiết sau thanh 1/2/3/4.'],
8:['Phối thanh của từ hai âm tiết: âm tiết đầu thanh 3 + âm tiết sau thanh 1/2/3/4.'],
9:['Phối thanh của từ hai âm tiết: âm tiết đầu thanh 4 + âm tiết sau thanh 1/2/3/4.'],
10:[
  'Luyện cách đọc âm tiết mang thanh nhẹ.',
  'Luyện cách đọc từ láy.',
  'Luyện cách đọc từ có hậu tố, ví dụ “-们”, “-子”, “-头”.'
],
11:['Ngoài việc làm âm tiết ngắn và nhẹ, thanh nhẹ còn giúp hình thành cách đọc từ vựng cố định và nhịp điệu lời nói ở một số từ.'],
12:['Phối thanh của từ ba âm tiết bắt đầu bằng âm tiết thanh 1.'],
13:['Phối thanh của từ ba âm tiết bắt đầu bằng âm tiết thanh 2.'],
14:['Phối thanh của từ ba âm tiết bắt đầu bằng âm tiết thanh 3.'],
15:['Phối thanh của từ ba âm tiết bắt đầu bằng âm tiết thanh 4.']
};
const H2={
1:[
  'Mô hình trung–trọng: âm tiết đầu được đọc tương đối nhẹ, âm tiết sau được nhấn mạnh.',
  'Mô hình trọng–nhẹ: âm tiết đầu được nhấn mạnh, âm tiết sau đọc thanh nhẹ.'
],
2:['Mô hình trung–nhẹ–trọng.','Mô hình trung–trọng–nhẹ.','Mô hình trọng–nhẹ–nhẹ.'],
3:['Từ bốn âm tiết không chứa âm tiết thanh nhẹ.','Từ bốn âm tiết có chứa âm tiết thanh nhẹ.'],
4:['Vị ngữ được nhấn trọng âm.','Bổ ngữ được nhấn trọng âm.'],
5:['Định ngữ được nhấn trọng âm.','Trạng ngữ được nhấn trọng âm.'],
6:['Điều chỉnh trọng âm theo thông tin người nói muốn nhấn mạnh, đối chiếu hoặc đính chính; trong cùng một câu, vị trí trọng âm khác nhau sẽ làm thay đổi trọng tâm thông tin.'],
7:['Kết hợp ngữ nghĩa, sắc thái và hướng ngữ điệu ở cuối câu để nhận biết ngữ điệu cơ bản của tiếng Trung; đây là nền tảng cho việc luyện ngữ điệu các kiểu câu tiếp theo.'],
8:['Câu trần thuật thường truyền đạt thông tin bằng ngữ điệu tương đối ổn định và hoàn chỉnh; cuối câu thường hạ và khép lại tự nhiên.'],
9:['Với câu hỏi đúng/sai tạo bằng “吗” và các hình thức tương tự, cần kết hợp sắc thái nghi vấn để luyện ngữ điệu ở cuối câu.'],
10:['Câu hỏi đặc chỉ có các từ nghi vấn như “谁、什么、哪儿、怎么”; trọng tâm nghi vấn thường rơi vào từ nghi vấn và thành phần liên quan.'],
11:['Luyện ngữ điệu tổng thể của câu hỏi khẳng định–phủ định như “是不是、去不去、有没有”.'],
12:['Ngữ điệu giữa các phương án và ở cuối câu cùng thể hiện quan hệ lựa chọn “chọn một trong hai hoặc một trong nhiều phương án”.'],
13:['Mức độ mạnh/yếu của yêu cầu, khuyên bảo và mệnh lệnh khác nhau; vì vậy trọng âm và ngữ điệu của câu cầu khiến cũng thay đổi theo.'],
14:['Câu cảm thán dùng trọng âm, cao độ và ngữ điệu cuối câu để biểu đạt các cảm xúc như ngạc nhiên, tán thưởng.'],
15:['So sánh sắc thái của câu hỏi dùng “吧” và “吗”; kết hợp ngữ điệu cuối câu để hiểu chức năng xác nhận, hỏi ý kiến và câu hỏi thông thường.']
};
const NOTE_VI={
  '本课目标义：货币单位“块”，口语中相当于“元”。':'Trong bài này, “块” được dùng với nghĩa đơn vị tiền tệ; trong khẩu ngữ tương đương với “元”.',
  '“不”的本调是 bù；在“不客气”中受后面第四声影响，实际常读 bú kèqi。':'Thanh gốc của “不” là bù; trong “不客气”, vì đứng trước âm tiết thanh 4 “kè”, cách đọc thực tế thường là bú kèqi.'
};
function fixPhonetics(){
  const lv=level();if(lv!==1&&lv!==2)return;
  const Ls=lesson();if(!Ls)return;
  const map=lv===1?H1:H2,vi=map[Number(Ls.id)]||[];
  const box=document.querySelector('#grammarList .phonetics-block');if(!box)return;
  const head=box.querySelector('.audit-block-head span');if(head&&head.textContent!=='重点 · Trọng điểm')head.textContent='重点 · Trọng điểm';
  [...box.querySelectorAll('ol>li')].forEach((li,i)=>{
    const v=vi[i];if(!v)return;
    let zh=li.querySelector('.audit-point-zh')?.textContent?.trim()||'';
    if(!zh){zh=li.textContent.trim();li.innerHTML=`<div class="audit-point-zh">${esc(zh)}</div><div class="audit-point-vn">${esc(v)}</div>`}
    else{let vn=li.querySelector('.audit-point-vn');if(!vn){vn=document.createElement('div');vn.className='audit-point-vn';li.appendChild(vn)}if(vn.textContent!==v)vn.textContent=v}
  });
}
function fixAuditNotes(){
  document.querySelectorAll('.audit-note').forEach(box=>{
    const zh=box.querySelector('.audit-note-zh')?.textContent?.trim()||box.textContent.trim();
    const vi=NOTE_VI[zh];if(!vi)return;
    if(!box.querySelector('.audit-note-vn'))box.innerHTML=`<div class="audit-note-zh">${esc(zh)}</div><div class="audit-note-vn">${esc(vi)}</div>`;
  });
  document.querySelectorAll('.textbook-hanzi-head b').forEach(b=>{
    if(/教材汉字重点/.test(b.textContent||''))b.textContent='汉字重点 · Trọng điểm chữ Hán';
  });
  document.querySelectorAll('.audit-badge.extra').forEach(b=>{if(/教材补充/.test(b.textContent||''))b.textContent='补充词 · Từ bổ sung'});
}
function injectStyle(){
  if(document.getElementById('studentPolishStyle'))return;
  const s=document.createElement('style');s.id='studentPolishStyle';s.textContent=`
  .phonetics-block ol{display:grid;gap:9px;margin-top:10px}
  .phonetics-block ol>li{padding-left:2px}
  .audit-point-zh{font-size:13px;line-height:1.65;color:var(--ink,#24382e)}
  .audit-point-vn{margin-top:3px;font-size:12px;line-height:1.6;color:var(--sub,#6d7c73)}
  .audit-note-zh{color:var(--ink,#34483d)}
  .audit-note-vn{margin-top:4px;color:var(--sub,#6d7c73)}
  `;document.head.appendChild(s);
}
function run(){injectStyle();fixPosBadges();fixPhonetics();fixAuditNotes()}
let queued=false;
function schedule(){if(queued)return;queued=true;setTimeout(()=>{queued=false;run()},0)}
function relevant(m){const e=m.target?.nodeType===1?m.target:m.target?.parentElement;return !!e?.closest?.('#vocabGrid,#grammarList,#wordPanel,#hanziWordMap')}
function install(){
  run();
  if(document.body&&!document.body.dataset.studentPolishObserver){
    document.body.dataset.studentPolishObserver='1';
    new MutationObserver(ms=>{if(ms.some(relevant))schedule()}).observe(document.body,{childList:true,subtree:true});
  }
  [80,250,700,1500,3000].forEach(ms=>setTimeout(run,ms));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
