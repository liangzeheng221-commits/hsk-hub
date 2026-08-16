/* HSK 4 上 · canonical grammar validator (2026-08-16)
   Semantic corrections now live in data/01.js … data/10.js.
   This layer validates source data and adds only neutral metadata. */
(()=>{
'use strict';
const lessons=window.HSK4_UPPER_LESSONS;
if(!Array.isArray(lessons)||lessons.length!==10)throw new Error('HSK4上 grammar canonical: lesson data missing');
const TITLES={
1:['不仅……也/还/而且……','从来','刚','即使……也……','（在）……上'],
2:['正好','差不多','尽管','却','而'],
3:['挺','本来','另外','首先……其次……','不管'],
4:['以为','原来','并','按照','甚至'],
5:['肯定','再说','实际','对……来说','尤其'],
6:['竟然','倍','值得','其中','（在）……下'],
7:['估计','来不及','离合词重叠','要是','既……又/也/还……'],
8:['使','只要','可不是','因此','往往'],
9:['难道','通过','可是','结果','上'],
10:['不过','确实','在……看来','由于','比如']};
const L=id=>lessons.find(x=>x.id===id);
const must=(ok,msg)=>{if(!ok)throw new Error(`HSK4上 canonical source mismatch: ${msg}`)};
const G=(id,title)=>L(id)?.grammar?.find(g=>g.title===title);
const has=(id,title,field,needle)=>{const g=G(id,title);must(g,`L${id}/${title} missing`);must(String(g[field]||'').includes(needle),`L${id}/${title}/${field} missing ${needle}`)};
for(const lesson of lessons){
  const titles=TITLES[lesson.id];must(titles&&lesson.grammar?.length===titles.length,`L${lesson.id} grammar count`);
  must(lesson.grammar.every((g,i)=>g.title===titles[i]),`L${lesson.id} grammar title/order`);
  lesson.grammar.forEach((g,i)=>{g.textbook_title=titles[i];g.content_type='grammar';g.source={book:'HSK标准教程4（上）',lesson:lesson.id,lesson_start_page:lesson.page}});
  if(lesson.compare)lesson.compare.content_type='compare';if(lesson.expansion)lesson.expansion.content_type='expansion';if(lesson.culture)lesson.culture.content_type='culture';
  lesson.grammarManifestVersion='2026-08-16-source';
}
/* Rules that historically needed runtime correction are now required in raw source. */
has(1,'即使……也……','structure','主语 + 即使');must(G(1,'即使……也……').rule_atoms?.some(x=>x.id==='subject-position'),'L1 即使 subject-position atom');
has(2,'差不多','structure','A 跟 B 差不多');must(G(2,'差不多').rule_atoms?.some(x=>x.id==='predicate-similarity'),'L2 差不多 predicate atom');
has(3,'首先……其次……','structure','首先 + V');has(3,'不管','structure','A不A');must(G(3,'不管').rule_atoms?.length===4,'L3 不管 rule atoms');
has(4,'并','desc','đính chính');has(4,'甚至','structure','X、Y，甚至 Z');
has(5,'尤其','structure','尤其(是)');
has(7,'要是','structure','（的话）');
has(8,'只要','desc','chỉ cần');must(!/điều kiện cần[;,.\s]/i.test(G(8,'只要').desc),'L8 只要 misleading necessary-condition label');has(8,'只要','logic_note','logic hình thức');
const c2=L(2).compare,c5=L(5).compare;must(c2?.differences?.length===3,'L2 差不多/几乎 comparison dimensions');must(c5?.differences?.length===3,'L5 尤其/特别 comparison dimensions');
window.HSK4_UPPER_GRAMMAR_CANONICAL={version:'2026-08-16-source',total:50,sourceValidated:true,correctedAtRuntime:false};
})();
