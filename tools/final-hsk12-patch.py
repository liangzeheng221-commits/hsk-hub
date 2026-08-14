from pathlib import Path


def must_replace(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f"patch anchor missing: {label}")
    return text.replace(old, new)


# HSK1: source-verified proper nouns, POS corrections, and separate proper-name UI.
p = Path("hsk1/content-audit.js")
s = p.read_text(encoding="utf-8")
s = must_replace(
    s,
    "const PROPER={10:['王方','谢朋'],13:['大卫'],14:['张']};",
    "const PROPER={3:['李月','中国','美国'],10:['王方','谢朋'],13:['大卫'],14:['张']};",
    "HSK1 proper map",
)
anchor = "const PROPER={3:['李月','中国','美国'],10:['王方','谢朋'],13:['大卫'],14:['张']};\n"
insert = """
  const ensureVocab=(id,item)=>{const L=get(id);if(L&&!L.vocab.some(v=>v.zh===item.zh))L.vocab.push(item)};
  ensureVocab(3,{zh:'李月',py:'Lǐ Yuè',vn:'Lý Nguyệt (tên người)'});
  ensureVocab(3,{zh:'中国',py:'Zhōngguó',vn:'Trung Quốc'});
  ensureVocab(3,{zh:'美国',py:'Měiguó',vn:'Mỹ, Hoa Kỳ'});
"""
if "ensureVocab(3" not in s:
    s = must_replace(s, anchor, anchor + insert, "HSK1 proper insertion")

repls = [
    (
        "'代词':new Set(['你','您','你们','我','我们','他','她','谁','什么','哪','哪儿','几','多少','怎么','怎么样','这','那','这些']),",
        "'代词':new Set(['你','您','你们','我','我们','他','她','谁','什么','哪','哪儿','那儿','这儿','几','多少','怎么','怎么样','这','那','这些']),",
        "HSK1 pronouns",
    ),
    (
        "'量词':new Set(['个','本','口','岁','块']),",
        "'量词':new Set(['个','本','口','岁','块','些']),\n    '数量词':new Set(['一点儿']),",
        "HSK1 measure words",
    ),
    (
        "'方位词':new Set(['上','下','里','前面','后面','前','后']),",
        "'方位词':new Set(['上','下','里','前面','后面','下面','前','后']),",
        "HSK1 localizers",
    ),
    (
        "'副词':new Set(['不','没','很','太','也','都','再','一起','少','多']),",
        "'副词':new Set(['不','没','很','太','也','都','再','一起','多']),",
        "HSK1 adverbs",
    ),
    ("'介词':new Set(['在','给']),", "'介词':new Set(['给']),", "HSK1 prepositions"),
    (
        "'形容词':new Set(['好','大','小','高兴','冷','热','漂亮','好吃']),",
        "'形容词':new Set(['好','大','小','高兴','冷','热','漂亮','好吃','少']),",
        "HSK1 adjectives",
    ),
    (
        "'动词':new Set(['爱','吃','喝','打电话'",
        "'动词':new Set(['是','在','吃饭','爱','吃','喝','打电话'",
        "HSK1 verbs",
    ),
    (
        "'代词':'代词 · Đại từ','数词':'数词 · Số từ','量词':'量词 · Lượng từ','方位词'",
        "'代词':'代词 · Đại từ','数词':'数词 · Số từ','量词':'量词 · Lượng từ','数量词':'数量词 · Cụm số lượng','方位词'",
        "HSK1 quantity label",
    ),
]
for old, new, label in repls:
    s = must_replace(s, old, new, label)

old_ui = """  function badgeHTML(v){return `<span class=\"audit-badge ${v.kind}\">${typeof esc==='function'?esc(v.kind_label):v.kind_label}</span><span class=\"audit-pos\">${typeof esc==='function'?esc(v.pos):v.pos}</span>`}
  function decorateCards(){
    document.querySelectorAll('.vocab-card[data-zh]').forEach(card=>{
      const v=(typeof L!=='undefined'&&L?.vocab||[]).find(x=>x.zh===card.dataset.zh);if(!v)return;
      card.classList.toggle('audit-extra',v.kind!=='core');
      card.querySelectorAll('.vocab-face').forEach(face=>{if(face.querySelector('.audit-meta'))return;const box=document.createElement('div');box.className='audit-meta';box.innerHTML=badgeHTML(v);face.appendChild(box)});
    });
  }

  if(typeof renderVocab==='function'){
    const base=renderVocab;
    renderVocab=function(){base();decorateCards();const q=document.getElementById('vSearch');if(q&&!q.dataset.auditBound){q.dataset.auditBound='1';q.addEventListener('input',()=>setTimeout(decorateCards,0))}};
  }
"""
new_ui = """  function badgeHTML(v){return `<span class=\"audit-badge ${v.kind}\">${typeof esc==='function'?esc(v.kind_label):v.kind_label}</span><span class=\"audit-pos\">${typeof esc==='function'?esc(v.pos):v.pos}</span>`}
  function renderProperPanel(){
    if(typeof L==='undefined'||!L)return;document.getElementById('hsk1ProperPanel')?.remove();
    const term=String(document.getElementById('vSearch')?.value||'').trim().toLowerCase();
    const proper=(L.vocab||[]).filter(v=>v.kind==='proper').filter(v=>!term||[v.zh,v.py,v.vn].some(x=>String(x||'').toLowerCase().includes(term)));
    if(!proper.length)return;const panel=document.createElement('section');panel.id='hsk1ProperPanel';panel.className='proper-name-panel';
    panel.innerHTML=`<div class=\"proper-name-head\"><b>专有名词 · Danh từ riêng</b><span>${proper.length}</span></div><div class=\"proper-name-list\">${proper.map(v=>`<button type=\"button\" data-zh=\"${esc(v.zh)}\"><b>${esc(v.zh)}</b><span>${esc(v.py)}</span><small>${esc(v.vn)}</small></button>`).join('')}</div>`;
    document.getElementById('vocabGrid')?.after(panel);panel.querySelectorAll('button').forEach(b=>b.onclick=()=>{const v=L.vocab.find(x=>x.zh===b.dataset.zh);if(v)showWordDetail(v)});
  }
  function decorateCards(){
    document.querySelectorAll('.vocab-card[data-zh]').forEach(card=>{
      const v=(typeof L!=='undefined'&&L?.vocab||[]).find(x=>x.zh===card.dataset.zh);if(!v)return;
      card.style.display=v.kind==='proper'?'none':'';card.classList.toggle('audit-extra',v.kind==='supplement');
      card.querySelectorAll('.vocab-face').forEach(face=>{if(face.querySelector('.audit-meta'))return;const box=document.createElement('div');box.className='audit-meta';box.innerHTML=badgeHTML(v);face.appendChild(box)});
    });
  }

  if(typeof renderVocab==='function'){
    const base=renderVocab;
    renderVocab=function(){base();decorateCards();renderProperPanel();const q=document.getElementById('vSearch');if(q&&!q.dataset.auditBound){q.dataset.auditBound='1';q.addEventListener('input',()=>setTimeout(()=>{decorateCards();renderProperPanel()},0))}};
  }
"""
s = must_replace(s, old_ui, new_ui, "HSK1 proper-name UI")
marker = "if(typeof allVocab==='function')allVocab=function(){return HSK1_LESSONS.flatMap(x=>(x.vocab||[]).filter(v=>v.kind==='core'))};"
if "speakAllVocab=function(){speak((L.vocab" not in s:
    s = must_replace(
        s,
        marker,
        marker + "\n  if(typeof speakAllVocab==='function')speakAllVocab=function(){speak((L.vocab||[]).filter(v=>v.kind!=='proper').map(v=>v.zh).join('，'))};",
        "HSK1 proper-name speech exclusion",
    )
p.write_text(s, encoding="utf-8")


# HSK2: source-verified radical, clean proper-name POS, separate proper-name UI.
p = Path("assets/hsk2-content-audit.js")
s = p.read_text(encoding="utf-8")
s = must_replace(s, "11:{radicals:'户、冫'}", "11:{radicals:'户、氵'}", "HSK2 L11 radical")
s = must_replace(
    s,
    "v.pos=v.kind==='proper'?`专名 · Tên riêng${v.base_pos?' · '+v.base_pos:''}`:v.kind==='supplement'?",
    "v.pos=v.kind==='proper'?'专名 · Tên riêng':v.kind==='supplement'?",
    "HSK2 proper POS",
)
marker = "const esc2=s=>typeof esc==='function'?esc(s):String(s??'');"
ui = """
  function renderProperPanel(){
    if(typeof L==='undefined'||!L)return;document.getElementById('hsk2ProperPanel')?.remove();
    const term=String(document.getElementById('vSearch')?.value||'').trim().toLowerCase();
    const proper=(L.vocab||[]).filter(v=>v.kind==='proper').filter(v=>!term||[v.zh,v.py,v.vn].some(x=>String(x||'').toLowerCase().includes(term)));
    if(!proper.length)return;const panel=document.createElement('section');panel.id='hsk2ProperPanel';panel.className='proper-name-panel';
    panel.innerHTML=`<div class=\"proper-name-head\"><b>专有名词 · Danh từ riêng</b><span>${proper.length}</span></div><div class=\"proper-name-list\">${proper.map(v=>{const i=L.vocab.indexOf(v);return `<button type=\"button\" data-i=\"${i}\"><b>${esc2(v.zh)}</b><span>${esc2(v.py)}</span><small>${esc2(v.vn)}</small></button>`}).join('')}</div>`;
    document.getElementById('vocabGrid')?.after(panel);panel.querySelectorAll('button').forEach(b=>b.onclick=()=>showWord(+b.dataset.i));
  }
  function decorateVocabCards(){document.querySelectorAll('#vocabGrid .vcard').forEach(card=>{const zh=card.querySelector('.vzh')?.textContent.trim(),v=(L.vocab||[]).find(x=>x.zh===zh);if(v)card.style.display=v.kind==='proper'?'none':''})}
  if(typeof renderVocab==='function'){const base=renderVocab;renderVocab=function(...args){const r=base(...args);decorateVocabCards();renderProperPanel();return r}}
  if(typeof renderVocabQuick==='function'){const base=renderVocabQuick;renderVocabQuick=function(){const r=base();document.querySelectorAll('.vocab-pill[data-i]').forEach(b=>{const v=L.vocab[+b.dataset.i];if(v?.kind==='proper')b.style.display='none'});return r}}
  if(typeof speakAllVocab==='function')speakAllVocab=function(){if(!('speechSynthesis' in window)){toast('Trình duyệt này chưa hỗ trợ phát âm.');return}speakSequence((L.vocab||[]).filter(v=>v.kind!=='proper').map(v=>v.zh),.75)};
"""
if "hsk2ProperPanel" not in s:
    s = must_replace(s, marker, marker + ui, "HSK2 proper-name UI")
p.write_text(s, encoding="utf-8")


# HSK1 Lesson 8 textbook radical: 钅 + 口.
p = Path("assets/hanzi-curriculum.js")
s = p.read_text(encoding="utf-8")
s = must_replace(
    s,
    "8:{chars:'少、个',structure:'汉字结构（3）：上下结构与上中下结构',radicals:'夂、口'}",
    "8:{chars:'少、个',structure:'汉字结构（3）：上下结构与上中下结构',radicals:'钅、口'}",
    "HSK1 L8 radical",
)
p.write_text(s, encoding="utf-8")


# Shared styling for separate proper-name sections.
p = Path("assets/hsk12-audit.css")
s = p.read_text(encoding="utf-8")
extra = """
.proper-name-panel{margin:16px 0;padding:14px;border:1px solid #d7e2ee;border-radius:14px;background:#f8fbff}.proper-name-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;color:#365b7e;font-size:12px}.proper-name-head span{display:inline-flex;min-width:24px;height:24px;align-items:center;justify-content:center;border-radius:999px;background:#e9f1fa;font-weight:800}.proper-name-list{display:flex;gap:8px;flex-wrap:wrap}.proper-name-list button{display:flex;flex-direction:column;align-items:flex-start;gap:2px;border:1px solid #cdddec;background:#fff;border-radius:11px;padding:8px 10px;cursor:pointer;color:inherit}.proper-name-list button b{font-family:'Noto Serif SC',serif;font-size:16px;color:#264f70}.proper-name-list button span{font-size:11px;color:#536e82}.proper-name-list button small{font-size:10px;color:#728391}
"""
if ".proper-name-panel{" not in s:
    s += extra
p.write_text(s, encoding="utf-8")


# Stronger regression checks for the source-verified corrections.
p = Path("tools/hsk12-content-audit.mjs")
s = p.read_text(encoding="utf-8")
s = must_replace(
    s,
    "for(const [id,zh] of [[10,'王方'],[10,'谢朋'],[13,'大卫'],[14,'张']])",
    "for(const [id,zh] of [[3,'李月'],[3,'中国'],[3,'美国'],[10,'王方'],[10,'谢朋'],[13,'大卫'],[14,'张']])",
    "HSK1 proper QA",
)
marker = "const l11=h1.find(x=>x.id===11),line11=l11?.scenes?.flatMap(s=>s.lines||[]).find(x=>x.zh==='我星期一去北京。');"
checks = """const pos=(data,id,zh)=>data.find(x=>x.id===id)?.vocab?.find(v=>v.zh===zh)?.pos||'';
ok(pos(h1,3,'是').startsWith('动词'), 'HSK1 L3 是: POS should be verb');
ok(pos(h1,9,'在').startsWith('动词'), 'HSK1 L9 在: lesson POS should be verb');
ok(pos(h1,9,'那儿').startsWith('代词'), 'HSK1 L9 那儿: POS should be pronoun');
ok(pos(h1,9,'下面').startsWith('方位词'), 'HSK1 L9 下面: POS should be localizer');
ok(pos(h1,10,'这儿').startsWith('代词'), 'HSK1 L10 这儿: POS should be pronoun');
ok(pos(h1,11,'吃饭').startsWith('动词'), 'HSK1 L11 吃饭: POS should be verb');
ok(pos(h1,12,'些').startsWith('量词'), 'HSK1 L12 些: POS should be measure word');
ok(pos(h1,14,'一点儿').startsWith('数量词'), 'HSK1 L14 一点儿: POS should be quantity expression');
ok(pos(h1,14,'少').startsWith('形容词'), 'HSK1 L14 少: POS should be adjective');
ok(h2.find(x=>x.id===11)?.textbookHanzi?.radicals==='户、氵','HSK2 L11: radicals should be 户、氵');
"""
if "HSK1 L3 是: POS should be verb" not in s:
    s = must_replace(s, marker, checks + marker, "POS QA insertion")
old = "for(const token of ['笔画','独体字','笔顺规则','结构','偏旁'])ok(hc.includes(token),`HSK1 Hanzi curriculum dimension missing: ${token}`);"
new = old + "\nok(hc.includes(\"8:{chars:'少、个',structure:'汉字结构（3）：上下结构与上中下结构',radicals:'钅、口'}\"),'HSK1 L8: radicals should be 钅、口');"
s = must_replace(s, old, new, "HSK1 radical QA")
p.write_text(s, encoding="utf-8")

print("Applied final HSK1/HSK2 source-verified patch.")
