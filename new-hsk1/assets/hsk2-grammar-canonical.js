/* HSK 2 · 44项教材正式语言点规范层（2026-08-15） */
(()=>{
  'use strict';
  const lessons=window.HSK2_LESSONS||[];
  if(!Array.isArray(lessons)||lessons.length!==15)throw new Error('HSK2 grammar canonical: lesson data missing');
  const TITLES={
    1:['助动词“要”','程度副词“最”','概数的表达：几、多'],
    2:['用“是不是”的问句','代词“每”','疑问代词“多”'],
    3:['“的”字短语','一下','语气副词“真”'],
    4:['“是……的”句：强调施事','表示时间：……的时候','时间副词“已经”'],
    5:['副词“就”','语气副词“还”（1）','程度副词“有点儿”'],
    6:['疑问代词“怎么”','量词的重叠','关联词“因为……，所以……”'],
    7:['语气副词“还”（2）','时间副词“就”','离','语气助词“呢”'],
    8:['疑问句“……，好吗？”','副词“再”','兼语句','动词的重叠'],
    9:['结果补语','介词“从”','“第”表示顺序'],
    10:['祈使句：不要……了；别……了','介词“对”'],
    11:['动词结构做定语','“比”字句（1）','助动词“可能”'],
    12:['状态程度补语','“比”字句（2）'],
    13:['动态助词“着”','反问句“不是……吗？”','介词“往”'],
    14:['动态助词“过”','关联词“虽然……，但是……”','动量补语“次”'],
    15:['动作的状态：要……了','“都……了”']
  };
  let total=0;
  for(const L of lessons){
    const titles=TITLES[Number(L.id)];
    if(!titles||!Array.isArray(L.grammar)||L.grammar.length!==titles.length)throw new Error(`HSK2 L${L.id}: grammar count mismatch`);
    L.grammar.forEach((g,i)=>{g.title=titles[i];g.textbook_title=titles[i];g.content_type='grammar';g.canonicalized='2026-08-15'});
    L.grammarManifestVersion='2026-08-15';total+=titles.length;
  }
  if(total!==44)throw new Error(`HSK2 grammar total mismatch: ${total}`);
  window.HSK2_GRAMMAR_CANONICAL={version:'2026-08-15',total:44,corrected:true};
  if(typeof document!=='undefined'&&typeof renderGrammar==='function'&&typeof L!=='undefined'&&L)renderGrammar();
})();
