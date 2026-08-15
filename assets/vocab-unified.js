/* Student-facing vocabulary card unifier for HSK 1–4: Hanzi → pinyin → bilingual POS. */
(()=>{
'use strict';
const POS_LABELS={
  'n.':'名词 · Danh từ','v.':'动词 · Động từ','adj.':'形容词 · Tính từ','adv.':'副词 · Phó từ',
  'prep.':'介词 · Giới từ','conj.':'连词 · Liên từ','part.':'助词 · Trợ từ','m.':'量词 · Lượng từ',
  'num.':'数词 · Số từ','pron.':'代词 · Đại từ','loc.':'方位词 · Từ chỉ phương vị',
  'time':'时间词 · Từ chỉ thời gian','modal':'能愿动词 · Động từ năng nguyện','phrase':'短语 · Cụm từ',
  'idiom':'成语 · Thành ngữ','num-m.':'数量词 · Cụm số lượng','n./v.':'名词/动词 · Danh từ/Động từ',
  'adj./adv.':'形容词/副词 · Tính từ/Phó từ','adj./v.':'形容词/动词 · Tính từ/Động từ',
  'adv./conj.':'副词/连词 · Phó từ/Liên từ','prep./conj.':'介词/连词 · Giới từ/Liên từ',
  'n./adj.':'名词/形容词 · Danh từ/Tính từ','n./conj.':'名词/连词 · Danh từ/Liên từ',
  'v./n.':'动词/名词 · Động từ/Danh từ','v./adv.':'动词/副词 · Động từ/Phó từ',
  'conj./prep.':'连词/介词 · Liên từ/Giới từ','v./adj.':'动词/形容词 · Động từ/Tính từ',
  'adv./v.':'副词/动词 · Phó từ/Động từ','prep./v.':'介词/动词 · Giới từ/Động từ',
  'conj./adv.':'连词/副词 · Liên từ/Phó từ','proper':'专有名词 · Danh từ riêng'
};

// HSK 4 上 textbook vocabulary POS, keyed by word. Multi-function words use a combined label where needed.
const H4U={
'法律':'n.','俩':'num-m.','印象':'n.','深':'adj.','熟悉':'v.','不仅':'conj.','性格':'n.','开玩笑':'v.','从来':'adv.','最好':'adv.','共同':'adj.','适合':'v.','幸福':'adj.','生活':'n./v.','刚':'adv.','浪漫':'adj.','够':'v.','缺点':'n.','接受':'v.','羡慕':'v.','爱情':'n.','星星':'n.','即使':'conj.','加班':'v.','亮':'adj.','感动':'v.','自然':'adj./adv.','原因':'n.','互相':'adv.','吸引':'v.','幽默':'adj.','脾气':'n.',
'适应':'v.','交':'v.','平时':'time','逛':'v.','短信':'n.','正好':'adj./adv.','聚会':'v./n.','联系':'v./n.','差不多':'adj./adv.','专门':'adv.','毕业':'v.','麻烦':'adj./v.','好像':'adv.','重新':'adv.','尽管':'conj.','真正':'adj.','友谊':'n.','丰富':'adj.','无聊':'adj.','讨厌':'v.','却':'adv.','周围':'loc.','交流':'v.','理解':'v.','镜子':'n.','而':'conj.','当':'prep.','困难':'n./adj.','及时':'adj.','陪':'v.',
'挺':'adv.','紧张':'adj.','信心':'n.','能力':'n.','招聘':'v.','提供':'v.','负责':'v.','本来':'adv.','应聘':'v.','材料':'n.','符合':'v.','通知':'v./n.','律师':'n.','专业':'n./adj.','另外':'adv.','收入':'n.','咱们':'pron.','安排':'v./n.','首先':'adv.','正式':'adj.','留':'v.','其次':'adv.','诚实':'adj.','改变':'v.','感觉':'n./v.','判断':'v./n.','顾客':'n.','准时':'adj./adv.','不管':'conj.','与':'prep./conj.','约会':'v./n.',
'提':'v.','以为':'v.','份':'m.','完全':'adv.','赚':'v.','调查':'v./n.','原来':'adv.','计划':'n./v.','提前':'v./adv.','保证':'v.','提醒':'v.','乱':'adj.','生意':'n.','谈':'v.','并':'adv./conj.','积累':'v.','经验':'n.','一切':'pron.','按照':'prep.','成功':'v./adj.','顺利':'adj.','感谢':'v.','消息':'n.','按时':'adv.','奖金':'n.','工资':'n.','方法':'n.','知识':'n.','不得不':'adv.','甚至':'adv.','责任':'n.',
'家具':'n.','沙发':'n.','打折':'v.','价格':'n.','质量':'n.','肯定':'adv./v.','流行':'v./adj.','顺便':'adv.','台':'m.','光':'adv.','实在':'adv.','制冷':'v.','效果':'n.','现金':'n.','邀请':'v.','葡萄':'n.','艺术':'n./adj.','广告':'n.','味道':'n.','优点':'n.','实际':'n./adj.','考虑':'v.','标准':'n.','样子':'n.','年龄':'n.','浪费':'v.','购物':'v.','尤其':'adv.','受到':'v.','任何':'pron.','寄':'v.',
'果汁':'n.','售货员':'n.','袜子':'n.','打扰':'v.','竟然':'adv.','西红柿':'n.','百分之':'num.','倍':'m.','皮肤':'n.','好处':'n.','尝':'v.','轻':'adj.','方面':'n.','值得':'v.','活动':'n.','内':'loc.','免费':'adj.','修理':'v.','支持':'v.','举行':'v.','满':'v./adj.','其中':'pron.','小说':'n.','会员卡':'n.','所有':'pron.','获得':'v.','情况':'n.','例如':'v.','举办':'v.','各':'pron.','降低':'v.',
'流血':'v.','擦':'v.','气候':'n.','估计':'v.','咳嗽':'v.','严重':'adj.','窗户':'n.','空气':'n.','抽烟':'v.','动作':'n.','帅':'adj.','出现':'v.','后悔':'v.','来不及':'v.','反对':'v.','大夫':'n.','植物':'n.','研究':'v./n.','超过':'v.','散步':'v.','指':'v.','精神':'n.','教授':'n.','数字':'n.','说明':'v.','要是':'conj.','既':'conj.','减肥':'v.','辛苦':'adj.','肚子':'n.','感情':'n.','烦恼':'n.','掉':'v.',
'巧克力':'n.','亲戚':'n.','伤心':'adj.','使':'v.','心情':'n.','愉快':'adj.','景色':'n.','放松':'v.','压力':'n.','回忆':'v./n.','发生':'v.','成为':'v.','只要':'conj.','师傅':'n.','大使馆':'n.','堵车':'v.','距离':'n.','耐心':'n.','生命':'n.','缺少':'v.','到处':'pron.','态度':'n.','因此':'conj.','科学':'n.','证明':'v./n.','往往':'adv.','阳光':'adj.','积极':'adj.','特点':'n.',
'饼干':'n.','难道':'adv.','得':'modal','坚持':'v.','放弃':'v.','主意':'n.','网球':'n.','国际':'adj.','轻松':'adj.','赢':'v.','随便':'adj./adv.','汗':'n.','通过':'prep./v.','篇':'m.','作家':'n.','当时':'time','可是':'conj.','正确':'adj.','理想':'n./adj.','勇敢':'adj.','结果':'n./conj.','失败':'v./n.','过程':'n.','至少':'adv.','总结':'v./n.','取':'v.','经历':'v./n.','许多':'num.','区别':'n./v.','暂时':'adv.','面对':'v.',
'礼拜天':'time','空儿':'n.','母亲':'n.','不过':'conj./adv.','永远':'adv.','方向':'n.','优秀':'adj.','硕士':'n.','翻译':'n./v.','确实':'adv.','兴奋':'adj.','拉':'v.','建议':'n./v.','职业':'n.','关键':'n./adj.','将来':'time','发展':'v./n.','躺':'v.','困':'adj.','经济':'n./adj.','条件':'n.','富':'adj.','穷':'adj.','等':'part.','由于':'conj./prep.','比如':'v.','橡皮':'n.','糖':'n.','低':'adj.','答案':'n.'
};

function normRaw(raw){
  let s=String(raw||'').trim(); if(!s)return '';
  if(/[·]/.test(s)&&/名词|动词|形容词|副词|代词|数词|量词|介词|连词|助词|时间词|方位词|专/.test(s))return s;
  const low=s.toLowerCase().replace(/\s+/g,' ').trim();
  const exact={
    'danh từ':'n.','dt.':'n.','dt':'n.','động từ':'v.','đgt.':'v.','đgt':'v.','tính từ':'adj.','tt.':'adj.','tt':'adj.',
    'phó từ':'adv.','phó.':'adv.','giới từ':'prep.','liên từ':'conj.','trợ từ':'part.','lượng từ':'m.','số từ':'num.',
    'đại từ':'pron.','đại từ nghi vấn':'疑问代词 · Đại từ nghi vấn','danh từ chỉ thời gian':'time','từ chỉ phương vị':'loc.',
    'trợ đgt.':'modal','trợ động từ':'modal','danh từ riêng':'proper','cụm động từ':'动词短语 · Cụm động từ',
    'danh từ / động từ':'n./v.','danh từ/động từ':'n./v.','dt./đgt.':'n./v.','động từ / danh từ':'v./n.',
    'tính từ / động từ':'adj./v.','tính từ/động từ':'adj./v.','tính từ / phó từ':'adj./adv.','phó từ / liên từ':'adv./conj.'
  };
  if(exact[low])s=exact[low];
  if(POS_LABELS[s])return POS_LABELS[s];
  if(/名词/.test(s)&&/动词/.test(s))return POS_LABELS['n./v.'];
  if(/形容词/.test(s)&&/副词/.test(s))return POS_LABELS['adj./adv.'];
  if(/形容词/.test(s)&&/动词/.test(s))return POS_LABELS['adj./v.'];
  if(/名词/.test(s))return POS_LABELS['n.']; if(/动词/.test(s))return POS_LABELS['v.'];
  if(/形容词/.test(s))return POS_LABELS['adj.']; if(/副词/.test(s))return POS_LABELS['adv.'];
  if(/介词/.test(s))return POS_LABELS['prep.']; if(/连词/.test(s))return POS_LABELS['conj.'];
  if(/助词/.test(s))return POS_LABELS['part.']; if(/量词/.test(s))return POS_LABELS['m.'];
  if(/数词/.test(s))return POS_LABELS['num.']; if(/代词/.test(s))return POS_LABELS['pron.'];
  if(/方位/.test(s))return POS_LABELS['loc.']; if(/时间/.test(s))return POS_LABELS['time'];
  return s;
}
function currentLesson(){
  try{if(typeof L!=='undefined'&&L)return L}catch(e){}
  const n=Number(new URL(location.href).searchParams.get('id')||1);
  for(const key of ['HSK1_LESSONS','HSK2_LESSONS','HSK3_LESSONS','HSK4_UPPER_LESSONS','HSK4_LOWER_LESSONS']){
    const arr=window[key];if(Array.isArray(arr)){const x=arr.find(v=>Number(v.id)===n);if(x)return x}
  }
  return null;
}
function pinyinFor(w,zh){
  const direct=w?.py||w?.pinyin;if(direct)return String(direct);
  try{if(typeof pyOf==='function'){const x=pyOf(zh);if(x)return x}}catch(e){}
  try{if(window.pinyinPro?.pinyin)return window.pinyinPro.pinyin(zh,{toneType:'symbol',type:'string',separator:' ',toneSandhi:true})}catch(e){}
  return '';
}
function wordFor(card,lesson){
  const zh=(card.querySelector('.vzh,.vocab-zh')?.textContent||card.dataset.zh||'').trim();
  return (lesson?.vocab||[]).find(w=>w.zh===zh)||null;
}
function existingPos(card){
  const el=card.querySelector('.vpos,.audit-pos,.audit-badge:not(.extra):not(.proper),.word-pos,.pos-badge');
  return el?.textContent?.trim()||'';
}
function posFor(w,card){
  if(!w)return normRaw(existingPos(card));
  if(H4U[w.zh])return POS_LABELS[H4U[w.zh]]||H4U[w.zh];
  return normRaw(w.posLabel||w.pos||w.base_pos||existingPos(card));
}
function decorateCard(card,lesson){
  if(card.dataset.unifiedVocab==='1')return;
  const front=card.querySelector('.vfront,.vocab-front,.vface:not(.vback):not(.vocab-back)')||card;
  const back=card.querySelector('.vback,.vocab-back');
  const zhEl=front.querySelector('.vzh,.vocab-zh'); if(!zhEl)return;
  const w=wordFor(card,lesson),zh=zhEl.textContent.trim();
  const py=pinyinFor(w,zh);
  let pyEl=front.querySelector('.vpy,.vocab-py');
  if(!pyEl&&py){pyEl=document.createElement('div');pyEl.className=card.classList.contains('vcard')?'vpy':'vocab-py';zhEl.insertAdjacentElement('afterend',pyEl)}
  if(pyEl&&py)pyEl.textContent=py;
  const pos=posFor(w,card);
  card.querySelectorAll('.vpos,.audit-pos,.audit-badges').forEach(x=>x.classList.add('unified-old-pos'));
  if(pos){
    let badge=front.querySelector(':scope > .pos-badge.unified-pos');
    if(!badge){badge=document.createElement('div');badge.className='pos-badge unified-pos';front.appendChild(badge)}
    badge.textContent=pos;
    if(back){let b=back.querySelector(':scope > .pos-badge.unified-pos');if(!b){b=document.createElement('div');b.className='pos-badge unified-pos';back.appendChild(b)}b.textContent=pos}
  }
  card.dataset.unifiedVocab='1';
}
function decorateAll(){const lesson=currentLesson();document.querySelectorAll('#vocabGrid .vcard,#vocabGrid .vocab-card').forEach(c=>decorateCard(c,lesson))}

function cleanStudentMeta(){
  document.querySelectorAll('#hsk4EraNote,.source-boundary,.textbook-page-meta').forEach(x=>x.remove());
  document.querySelectorAll('.audit-textbook-card').forEach(x=>{
    const t=x.textContent||'';
    if(/课文起始页|Trang bắt đầu|第\s*\d+\s*页|printed page|pdf page/i.test(t)){
      if(/文化/.test(t)&&!/课文起始页|Trang bắt đầu/.test(t)){
        const strong=x.querySelector('strong');if(strong)strong.textContent=strong.textContent.replace(/（?第\s*\d+\s*页）?/g,'').trim();
      }else x.remove();
    }
  });
  const sourceBox=document.querySelector('#auditTextbookSource');
  if(sourceBox){const grid=sourceBox.querySelector('.audit-textbook-grid');if(grid&&grid.children.length){const b=sourceBox.querySelector(':scope>b');if(b)b.remove()}else sourceBox.remove()}
  const tag=document.querySelector('#lessonTag');
  if(tag){tag.textContent=tag.textContent.replace(/\s*[·・]\s*(教材|书内)?第\s*\d+\s*页(?:起)?/g,'').replace(/\s*[·・]\s*第\s*\d+\s*页(?:起)?/g,'').trim()}
  const chip=document.querySelector('.lesson-hero .open-access-chip');
  if(chip&&/教材第|书内第/.test(chip.textContent||'')){
    const isLower=document.body.classList.contains('hsk4-lower'),isUpper=document.body.classList.contains('hsk4-upper');
    if(isLower)chip.textContent='✓ Chuyển tự do giữa Bài 11–20 và mọi nội dung';
    if(isUpper)chip.textContent='✓ Chuyển tự do giữa Bài 1–10 và mọi nội dung';
  }
  document.querySelectorAll('.text-no').forEach(x=>{if(/教材第|第\s*\d+\s*页/.test(x.textContent||'')){const m=(x.textContent||'').match(/课文\s*\d+/);if(m)x.textContent=m[0]}});
  document.querySelectorAll('[class*="source"],[id*="Source"],[id*="source"]').forEach(x=>{
    const t=(x.textContent||'').trim();
    if(/教材版本|来源[:：]|来源页|PDF\s*页|课文页|拼音页|printed page|source page/i.test(t)&&x.children.length<6)x.remove();
  });
}
function run(){decorateAll();cleanStudentMeta()}
function install(){run();const root=document.querySelector('#vocabGrid');if(root&&!root.dataset.unifiedObserver){root.dataset.unifiedObserver='1';new MutationObserver(()=>queueMicrotask(decorateAll)).observe(root,{childList:true,subtree:true})}new MutationObserver(()=>queueMicrotask(cleanStudentMeta)).observe(document.body,{childList:true,subtree:true});setTimeout(run,80);setTimeout(run,400)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
