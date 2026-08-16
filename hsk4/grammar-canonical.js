/* HSK4 下 · canonical grammar validator (2026-08-16)
   Semantic corrections now live in data/11.js … data/20.js.
   This layer validates source data and only attaches neutral metadata. */
(()=>{
'use strict';
const lessons=window.HSK4_LOWER_LESSONS;
if(!Array.isArray(lessons)||lessons.length!==10)throw new Error('HSK4下 grammar canonical: lesson data missing');
const TITLES={
11:['连','否则','无论','然而','同时'],12:['并且','再……也……','对于','名量词重叠','相反'],13:['大概','偶尔','由','进行','随着'],14:['够','以','既然','于是','什么的'],15:['想起来','弄','千万','来','左右'],16:['可','恐怕','到底','拿……来说','敢'],17:['倒','干','趟','为了……而……','仍然'],18:['是否','受不了','接着','除此以外','把……叫作……'],19:['疑问代词活用表示任指','上','出来','总的来说','在于'],20:['动词+着+动词+着','一……就……','究竟','起来','动词+起']};
const L=id=>lessons.find(x=>x.id===id);
const must=(ok,msg)=>{if(!ok)throw new Error(`HSK4下 canonical source mismatch: ${msg}`)};
const has=(id,title,field,needle)=>{const g=L(id)?.grammar?.find(x=>x.title===title);must(g,`L${id}/${title} missing`);must(String(g[field]||'').includes(needle),`L${id}/${title}/${field} missing ${needle}`)};
for(const lesson of lessons){
  const titles=TITLES[lesson.id];must(titles&&lesson.grammar?.length===5,`L${lesson.id} grammar count`);
  must(lesson.grammar.every((g,i)=>g.title===titles[i]),`L${lesson.id} grammar title/order`);
  lesson.grammar.forEach((g,i)=>{g.textbook_title=titles[i];g.content_type='grammar'});
  lesson.grammarManifestVersion='2026-08-16-source';
}
/* Hard checks for every rule family that previously depended on runtime correction. */
has(11,'连','vn_title','Giới từ');has(11,'无论','structure','是A还是B');has(11,'同时','structure','在……（的）同时');
has(12,'对于','structure','Chủ ngữ + 对于');has(12,'名量词重叠','desc','không dùng làm tân ngữ');has(12,'相反','structure','相反的 + N');
has(13,'大概','structure','大概的 + danh từ');
has(14,'够','structure','够 + Adj');has(14,'以','structure','以A为B');
has(15,'来','desc','Nếu bỏ “来”');has(15,'左右','desc','Chỉ dùng sau cụm số lượng');
has(16,'恐怕','structure','Chủ ngữ');has(16,'到底','desc','không đi với câu hỏi có 吗');
has(17,'倒','structure','倒(dào)');has(17,'干','vn_title','gàn');
has(18,'接着','desc','ngay sau A');
has(19,'上','structure','V + 得上');
has(20,'动词+着+动词+着','structure','V着V着');has(20,'一……就……','desc','hễ… thì…');has(20,'究竟','desc','từ nghi vấn làm chủ ngữ');has(20,'动词+起','structure','说/谈/讲/问/提/聊/回忆');
const compareChecks=[[11,'无论 — 不管','不管热不热'],[12,'对于 — 关于','tên sách/bài viết'],[13,'大概 — 也许','kế hoạch tương lai'],[14,'于是 — 因此','nhân quả logic'],[15,'千万 — 一定','不一定'],[16,'恐怕 — 怕','phỏng đoán thuần túy'],[17,'趟 — 次','lượt xe/tàu'],[18,'接着 — 然后','chủ ngữ hai việc'],[19,'出来 — 起来','想出来'],[20,'究竟 — 到底','看到底']];
for(const [id,title,needle] of compareChecks){const c=L(id)?.compare;must(c?.title===title,`L${id} compare title`);must(String(c.vn||'').includes(needle),`L${id} compare detail ${needle}`);c.content_type='compare'}
window.HSK4_LOWER_GRAMMAR_CANONICAL={version:'2026-08-16-source',total:50,sourceValidated:true,correctedAtRuntime:false};
})();
