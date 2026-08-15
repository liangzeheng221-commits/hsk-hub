import fs from 'node:fs';
import vm from 'node:vm';

const read=p=>fs.readFileSync(p,'utf8');
const write=(p,s)=>fs.writeFileSync(p,s.endsWith('\n')?s:s+'\n');
const manifest=JSON.parse(read('curriculum/grammar-manifest.json'));
const VERSION='2026-08-15';

const norm=s=>String(s??'')
  .replace(/[()]/g,ch=>ch==='('?'（':'）')
  .replace(/\s+/g,'')
  .replace(/[，,]/g,'，')
  .replace(/[：:]/g,'：')
  .trim();

function entries(book,id){return manifest.books[book]?.lessons?.[String(id)]||[]}
function applyManifestTitles(book,L){
  const es=entries(book,L.id);const by=new Map();
  for(const e of es){by.set(norm(e.site_title),e);by.set(norm(e.textbook_title),e)}
  for(const g of L.grammar||[]){
    const e=by.get(norm(g.title));
    if(e){g.title=e.textbook_title;g.textbook_title=e.textbook_title;g.content_type='grammar'}
    else if(book==='HSK1'){g.content_type='phonetics'}
    else g.content_type='grammar';
  }
  if(book==='HSK1'){
    L.phonetics=(L.grammar||[]).filter(g=>g.content_type==='phonetics').map(g=>({...g}));
    L.formalGrammarCount=(L.grammar||[]).filter(g=>g.content_type==='grammar').length;
  }
  const actual=(L.grammar||[]).filter(g=>g.content_type==='grammar').map(g=>g.title);
  const expected=es.map(e=>e.textbook_title);
  if(JSON.stringify(actual)!==JSON.stringify(expected)){
    throw new Error(`${book} L${L.id} grammar manifest mismatch\nexpected=${JSON.stringify(expected)}\nactual=${JSON.stringify(actual)}`);
  }
}
function g(L,title){const x=(L.grammar||[]).find(q=>norm(q.title)===norm(title));if(!x)throw new Error(`Missing grammar L${L.id}: ${title}`);return x}
function patchGrammar(L,title,patch){Object.assign(g(L,title),patch,{textbook_title:title,content_type:'grammar',canonicalized:VERSION})}
function patchCompare(L,patch){if(!L.compare)throw new Error(`Missing compare L${L.id}`);Object.assign(L.compare,patch,{content_type:'compare',canonicalized:VERSION})}

function loadClassic(file,seed){const ctx={window:seed,console};ctx.window.window=ctx.window;vm.runInNewContext(read(file),ctx,{filename:file,timeout:5000});return ctx.window}

// HSK1: merge title corrections and telephone-number reading into the raw course data.
for(let n=1;n<=5;n++){
  const file=`hsk1/data-${n}.js`;const w=loadClassic(file,{HSK1_LESSONS:[]});const lessons=w.HSK1_LESSONS||[];
  for(const L of lessons){
    applyManifestTitles('HSK1',L);
    if(L.id===13){
      const phone=(L.grammar||[]).find(x=>norm(x.title)===norm('电话号码的表达'));
      if(!phone)throw new Error('HSK1 L13 电话号码的表达 missing');
      phone.desc='电话号码通常逐个数字读。按本教材示例，电话号码中的数字“1”读 yāo；书写拼音时按实际读音标注。';
      phone.structure='逐个数字读；电话号码中的 1 → yāo';
      phone.canonicalized=VERSION;
      if(L.scenes?.[2]?.lines?.[0])L.scenes[2].lines[0].py='Bā èr sān líng sì yāo wǔ wǔ, zhè shì Lǐ lǎoshī de diànhuà ma?';
      if(L.scenes?.[2]?.lines?.[1])L.scenes[2].lines[1].py='Bú shì, tā de diànhuà shì bā èr sān líng sì yāo wǔ liù.';
    }
    L.grammarManifestVersion=VERSION;
  }
  write(file,`window.HSK1_LESSONS=(window.HSK1_LESSONS||[]).concat(${JSON.stringify(lessons)});`);
}

// HSK4 Upper: normalize all 50 textbook headings, then expand the audited rules that were compressed.
for(let id=1;id<=10;id++){
  const file=`hsk4up/data/${String(id).padStart(2,'0')}.js`;
  const w=loadClassic(file,{HSK4_UPPER_LESSONS:[]});const L=(w.HSK4_UPPER_LESSONS||[])[0];
  if(!L||L.id!==id)throw new Error(`HSK4上 L${id} load failed`);
  applyManifestTitles('HSK4上',L);
  for(const q of L.grammar){q.source={book:'HSK标准教程4（上）',lesson:id,lesson_start_page:L.page};q.content_type='grammar';}
  if(L.compare)L.compare.content_type='compare';if(L.expansion)L.expansion.content_type='expansion';if(L.culture)L.culture.content_type='culture';

  if(id===1){
    patchGrammar(L,'即使……也……',{
      structure:'即使 + 主语 + …，……也…… / 主语 + 即使 + …，……也……',
      structures:['即使 + 主语 + …，……也……','主语 + 即使 + …，……也……'],
      desc:'Nêu giả thiết nhượng bộ; kết quả ở vế sau không thay đổi. “即使” có thể đứng trước hoặc sau chủ ngữ của mệnh đề thứ nhất; vế sau thường dùng “也” để hô ứng.',
      rule_atoms:[
        {id:'subject-position',type:'position',text:'“即使” có thể đứng trước chủ ngữ của mệnh đề thứ nhất, cũng có thể đứng sau chủ ngữ.'},
        {id:'second-clause-ye',type:'collocation',text:'Mệnh đề sau thường dùng “也” để cho biết kết quả vẫn không thay đổi.'}
      ]
    });
  }
  if(id===2){
    patchGrammar(L,'差不多',{
      structure:'差不多 + 数量 / A 跟 B 差不多',
      structures:['差不多 + 数量','A 跟 B 差不多'],
      desc:'Biểu thị số lượng/mức độ xấp xỉ; cũng có thể trực tiếp làm vị ngữ để nói hai sự vật gần giống nhau.',
      rule_atoms:[
        {id:'before-number',type:'usage',text:'“差不多” có thể đứng trước cụm số lượng để biểu thị con số xấp xỉ.'},
        {id:'predicate-similarity',type:'usage',text:'“差不多” có thể làm vị ngữ, ví dụ A 跟 B 差不多, để nói hai đối tượng gần giống nhau.'}
      ]
    });
    patchCompare(L,{
      similarities:['Cả hai đều có thể biểu thị mức độ rất gần một chuẩn hoặc kết quả.'],
      differences:[
        {dimension:'数量前',left:'Có thể: 差不多 + 数量, biểu thị số lượng xấp xỉ.',right:'Thông thường không dùng 几乎 + 数量 để biểu thị số lượng xấp xỉ.'},
        {dimension:'作谓语表示两者接近',left:'Có thể: A 跟 B 差不多.',right:'Không dùng theo cách này.'},
        {dimension:'差一点发生但最终没发生',left:'Thông thường không biểu thị nghĩa “suýt xảy ra nhưng cuối cùng không xảy ra”.',right:'Có thể: 几乎 + V, biểu thị việc suýt xảy ra nhưng cuối cùng không xảy ra.'}
      ]
    });
  }
  if(id===3){
    patchGrammar(L,'首先……其次……',{
      structure:'首先 A，其次 B / 首先 + V',
      structures:['首先 A，其次 B','首先 + V'],
      desc:'“首先……其次……” dùng để liệt kê theo thứ tự. Ngoài ra “首先” có thể dùng riêng như phó từ, nghĩa là “trước tiên/sớm nhất”.',
      rule_atoms:[
        {id:'paired-order',type:'usage',text:'“首先……其次……” thường dùng trong văn viết để liệt kê sự việc theo trình tự.'},
        {id:'shouxian-alone',type:'usage',text:'“首先” còn có thể dùng riêng như phó từ, biểu thị “trước tiên, sớm nhất”.'}
      ]
    });
    patchGrammar(L,'不管',{
      structure:'不管 + 疑问代词 / A还是B / A不A，(都/也) + …',
      structures:['不管 + 疑问代词，……都/也……','不管 + A还是B，……都/也……','不管 + A不A，……都/也……'],
      desc:'Biểu thị dù điều kiện/lựa chọn nào xảy ra thì kết quả ở mệnh đề sau vẫn không thay đổi. Phần sau 不管 thường là đại từ nghi vấn, cấu trúc lựa chọn với “还是”, hoặc dạng khẳng định–phủ định; mệnh đề sau thường có “都/也”.',
      rule_atoms:[
        {id:'interrogative-form',type:'collocation',text:'Có thể kết hợp với 什么、怎么、谁、哪儿、多（么）…'},
        {id:'choice-form',type:'collocation',text:'Có thể dùng dạng A还是B.'},
        {id:'a-not-a-form',type:'collocation',text:'Có thể dùng dạng khẳng định–phủ định A不A.'},
        {id:'main-clause-dou-ye',type:'collocation',text:'Mệnh đề sau thường dùng 都 hoặc 也.'}
      ]
    });
  }
  if(id===4){
    patchGrammar(L,'并',{
      desc:'Trong bài này “并” thường đứng trước 不/没(有) để nhấn mạnh phủ định. Nó đặc biệt hay xuất hiện khi lời nói chuyển ý hoặc sửa lại một phán đoán/ấn tượng trước đó rồi nêu tình hình thực tế.',
      rule_atoms:[
        {id:'negative-collocation',type:'collocation',text:'Cấu trúc trọng tâm: 并 + 不/没(有) + V/Adj.'},
        {id:'corrective-context',type:'discourse',text:'Thường dùng trong ngữ cảnh chuyển ý hoặc đính chính một nhận định trước đó.'}
      ]
    });
    patchGrammar(L,'甚至',{
      structure:'A，甚至 B / X、Y，甚至 Z',
      structures:['A，甚至 B','并列项 X、Y，甚至 Z'],
      desc:'Dùng để đưa ra trường hợp nổi bật/cực đoan hơn. Trong chuỗi các thành phần song song, “甚至” có thể đặt trước mục cuối cùng nổi bật nhất; các thành phần song song có thể là danh từ, động từ hoặc mệnh đề.',
      rule_atoms:[
        {id:'parallel-position',type:'position',text:'Trong chuỗi song song, “甚至” đứng trước mục cuối cùng, nổi bật nhất.'},
        {id:'parallel-types',type:'usage',text:'Các mục song song có thể là danh từ, động từ hoặc mệnh đề.'}
      ]
    });
  }
  if(id===5){
    patchGrammar(L,'尤其',{
      structure:'尤其(是) + N/成分 / 尤其 + V/Adj',
      structures:['尤其(是) + N/名词性成分','尤其 + V/Adj'],
      desc:'Dùng để làm nổi bật một đối tượng hoặc phương diện trong phạm vi đã nói; “尤其是” thường đứng trước danh từ hoặc thành phần danh từ.',
      rule_atoms:[
        {id:'scope-highlight',type:'usage',text:'Thường nhấn mạnh một thành viên/phương diện nổi bật trong một phạm vi đã nêu.'},
        {id:'youshi',type:'collocation',text:'“尤其是 + danh từ/thành phần danh từ” là cấu trúc rất thường gặp.'}
      ]
    });
    patchCompare(L,{
      differences:[
        {dimension:'在范围中突出一项',left:'尤其 thường làm nổi bật một đối tượng/phương diện trong phạm vi đã nói.',right:'特别 cũng có thể nhấn mạnh, nhưng không bắt buộc phải dựa trên một phạm vi đã nêu trước.'},
        {dimension:'尤其是 / 特别 + 程度',left:'Có cấu trúc thường gặp 尤其是 + danh từ/thành phần danh từ.',right:'特别 thường trực tiếp bổ nghĩa cho động từ/tính từ với nghĩa “đặc biệt/rất”.'},
        {dimension:'形容词用法',left:'Không dùng như tính từ định ngữ theo kiểu “尤其的 + N”.',right:'Có thể làm tính từ: 特别的 + N, ví dụ 特别的礼物.'}
      ]
    });
  }
  if(id===7){
    patchGrammar(L,'要是',{
      structure:'要是 A（的话），就 B',
      structures:['要是 A（的话），就 B'],
      desc:'Nêu giả thiết/điều kiện. “的话” có thể xuất hiện sau mệnh đề điều kiện và có thể lược bỏ; mệnh đề sau thường dùng “就”.',
      rule_atoms:[
        {id:'dehua-optional',type:'collocation',text:'Có thể dùng “要是……（的话），就……”; “的话” là thành phần có thể lược bỏ.'},
        {id:'jiu',type:'collocation',text:'Mệnh đề kết quả thường dùng “就”.'}
      ]
    });
  }
  if(id===8){
    patchGrammar(L,'只要',{
      structure:'只要 A，就 B',
      desc:'Nêu một điều kiện: chỉ cần điều kiện ở vế đầu được đáp ứng thì kết quả ở vế sau sẽ hoặc có thể xảy ra.',
      rule_atoms:[
        {id:'condition-result',type:'usage',text:'Ghi nhớ theo chức năng câu: chỉ cần A được đáp ứng thì B xảy ra/được thực hiện.'},
        {id:'jiu',type:'collocation',text:'Mệnh đề sau thường dùng “就”.'}
      ],
      logic_note:'Giáo trình dùng cách diễn đạt “điều kiện cần thiết”; khi học mẫu câu, nên ghi nhớ trực tiếp quan hệ sử dụng “chỉ cần A thì B”, không biến nhãn này thành thuật ngữ logic hình thức.'
    });
  }
  L.grammarManifestVersion=VERSION;
  write(file,`/* HSK 4 上 · 第${id}课 · textbook grammar canonicalized ${VERSION} */\nwindow.HSK4_UPPER_LESSONS=window.HSK4_UPPER_LESSONS||[];\nwindow.HSK4_UPPER_LESSONS.push(${JSON.stringify(L)});`);
}

// HSK4 Lower: merge the already-reviewed runtime grammar corrections into raw lesson data.
const lowerGrammarPatches={
  11:{
    '连':{vn_title:'Giới từ “连”',structure:'连 + danh từ/đại từ + 都/也 + …',desc:'Giới từ dùng để đưa ra một trường hợp cực đoan nhằm nhấn mạnh; thường phối hợp với 都/也. Thành phần sau 连 có thể là chủ ngữ hoặc tân ngữ được đưa lên trước.'},
    '无论':{structure:'无论 + từ nghi vấn / 是A还是B / A还是不A，(都/也) + …',desc:'Biểu thị dù điều kiện hoặc lựa chọn nào xảy ra thì kết quả ở mệnh đề sau vẫn không thay đổi; mệnh đề sau thường có 都/也.'},
    '同时':{vn_title:'Liên từ / danh từ “同时”',structure:'A，同时(又/也/还)B / 在……（的）同时',desc:'Là liên từ khi bổ sung một sự việc hoặc phương diện xảy ra/cùng tồn tại với điều trước; thường đi với 又/也/还. Đồng thời còn là danh từ trong cấu trúc “在……（的）同时”.'}
  },
  12:{
    '对于':{structure:'对于 + đối tượng，… / Chủ ngữ + 对于 + đối tượng + …',desc:'Giới từ đưa ra đối tượng/đích mà một tình huống, thái độ hay nhận xét hướng tới. Cụm 对于 có thể đứng trước hoặc sau chủ ngữ.'},
    '名量词重叠':{vn_title:'Lặp danh từ / lượng từ',structure:'AA（如：人人、天天、件件）',desc:'Danh từ hoặc lượng từ được lặp theo dạng AA để biểu thị ý “mỗi/từng”. Sau khi lặp, chúng có thể làm chủ ngữ, định ngữ của chủ ngữ hoặc trạng ngữ; không dùng làm tân ngữ hay định ngữ của tân ngữ theo cách dùng được dạy trong bài.',examples:['人人都应该有自己的学习方法。','件件小事都应该认真做好。','他天天都坚持阅读半个小时。']},
    '相反':{vn_title:'Liên từ / tính từ “相反”',structure:'…，相反，… / A 和 B 相反 / 相反的 + N',desc:'Là liên từ khi đứng ở đầu hoặc giữa vế sau để nêu ý trái ngược hay tăng tiến theo hướng ngược lại. “相反” còn là tính từ, chỉ hai mặt đối lập nhau; khi làm định ngữ phải dùng “相反的 + danh từ”.',examples:['方法不对不但不能省力，相反会浪费更多时间。','调查结果和我们原来的想法完全相反。','两个人选择了相反的方向。']}
  },
  13:{'大概':{vn_title:'“大概” biểu thị phỏng đoán/ước lượng',structure:'大概 + mệnh đề / 大概 + số lượng / 大概的 + danh từ',desc:'Làm phó từ để phỏng đoán hoặc ước lượng số lượng/thời gian; ngoài ra có thể làm tính từ/định ngữ với nghĩa “khái quát, đại thể, không chi tiết”.'}},
  14:{
    '够':{vn_title:'Động từ / phó từ “够”',structure:'V + 够 + số lượng / 够 + Adj (+ 的)',desc:'Làm động từ khi nói số lượng đạt mức đủ; làm phó từ khi mức độ đạt một tiêu chuẩn nhất định. Trong câu khẳng định “够 + tính từ”, sau tính từ thường có 的.'},
    '以':{vn_title:'Giới từ / liên từ “以”',structure:'以 + phương thức/tiêu chuẩn + V / 以A为B / …，以 + V',desc:'Là giới từ với nghĩa “dùng/lấy/dựa vào”, thường gặp trong “以……V”; “以A为B” nghĩa là lấy/coi A làm B. “以” còn có thể là liên từ chỉ mục đích, tương đương “để/nhằm”, thường mở đầu vế sau và hai vế cùng chủ ngữ.'}
  },
  15:{
    '来':{vn_title:'Động từ “来” đứng trước động từ khác',structure:'来 + V',desc:'Trong khẩu ngữ, “来” đứng trước một động từ khác để biểu thị “sẽ/để ai đó làm việc ấy”. Nếu bỏ “来”, ý chính của câu thường không thay đổi.',examples:['这个沙发太重了，我来帮你一起抬。','这次活动让李老师来负责吧。','记者需要到处调查，来了解真实情况。']},
    '左右':{vn_title:'Danh từ “左右”',structure:'số lượng + 左右',desc:'Chỉ dùng sau cụm số lượng để biểu thị con số thực tế hơi nhiều hơn hoặc ít hơn con số được nêu, tương đương “khoảng/xấp xỉ”.',examples:['那本书三天左右就能到。','前方五百米左右有一个停车场。','七岁左右的儿童普遍比较好动。']}
  },
  16:{'恐怕':{vn_title:'Động từ / phó từ “恐怕”',structure:'恐怕 + V / (Chủ ngữ) + 恐怕 + mệnh đề',desc:'Có thể là động từ “lo rằng/e rằng”; cũng có thể là phó từ phỏng đoán, đôi khi kèm sắc thái lo lắng. Khi chỉ phỏng đoán, nghĩa gần 大概/也许.'}}
};
const lowerComparePatches={
  11:{title:'无论 — 不管',vn:'Cả hai đều có nghĩa “bất kể/dù” và mệnh đề sau thường có 都/也. “无论” thiên về văn viết, dùng được với các hình thức trang trọng như 如何、是否; “不管” khẩu ngữ hơn. Với dạng khẳng định–phủ định, “不管热不热” dùng trực tiếp được, còn “无论” thường cần 还是/跟/与 như “无论热还是不热”.'},
  12:{title:'对于 — 关于',vn:'“对于” nêu đối tượng chịu tác động/được đánh giá; “关于” nêu chủ đề hoặc phạm vi bàn luận. Cụm 对于 có thể đứng trước hoặc sau chủ ngữ, còn 关于 thường đứng trước chủ ngữ. “关于” có thể dùng trong tên sách/bài viết; “对于” không dùng theo cách đó.'},
  13:{title:'大概 — 也许',vn:'Cả hai đều có thể biểu thị phỏng đoán. “大概” thường cho cảm giác chắc chắn cao hơn, còn có thể ước lượng số lượng/thời gian và làm định ngữ với nghĩa “khái quát”; “也许” không có các cách dùng đó. Khi nói kế hoạch tương lai của chính người nói còn chưa chắc, thường dùng “也许”, không dùng “大概”.'},
  14:{title:'于是 — 因此',vn:'Cả hai đều nối nguyên nhân với kết quả. “于是” thường nhấn mạnh trình tự diễn biến: sự việc trước xảy ra rồi dẫn đến hành động/kết quả tiếp theo; “因此” nhấn mạnh quan hệ nhân quả logic và thiên về văn viết hơn.'},
  15:{title:'千万 — 一定',vn:'Cả hai có thể dùng để nhấn mạnh lời yêu cầu/dặn dò. “千万” thường đi với 别/不要/不能 và mang sắc thái tha thiết nhắc nhở; “一定” thường gặp trong yêu cầu khẳng định và mạnh hơn. “一定” còn có thể diễn đạt quyết tâm của ngôi thứ nhất, sự chắc chắn/tất yếu, hoặc trong “不一定” = chưa chắc; “千万” không có các cách dùng này.'},
  16:{title:'恐怕 — 怕',vn:'Hai từ đều có thể liên quan đến “lo/sợ” và phỏng đoán có sắc thái lo lắng. Khi là động từ, “恐怕” chủ yếu đứng trước động từ/mệnh đề, còn “怕” có thể mang tân ngữ trực tiếp. Khi phỏng đoán, “恐怕” có thể đứng trước hoặc sau chủ ngữ và còn dùng như 大概/也许; “怕” bị hạn chế hơn và không dùng để phỏng đoán thuần túy theo cách đó.'}
};
for(let id=11;id<=20;id++){
  const file=`hsk4/data/${id}.js`;const w=loadClassic(file,{HSK4_LOWER_LESSONS:[]});const L=(w.HSK4_LOWER_LESSONS||[])[0];
  if(!L||L.id!==id)throw new Error(`HSK4下 L${id} load failed`);
  applyManifestTitles('HSK4下',L);
  for(const q of L.grammar||[]){q.content_type='grammar';q.textbook_title=q.title;q.canonicalized=q.canonicalized||VERSION;}
  for(const [title,patch] of Object.entries(lowerGrammarPatches[id]||{}))patchGrammar(L,title,patch);
  if(lowerComparePatches[id])patchCompare(L,lowerComparePatches[id]);
  L.grammarManifestVersion=VERSION;
  write(file,`/* HSK4 下 · 第${id}课 · grammar canonicalized ${VERSION} */\nwindow.HSK4_LOWER_LESSONS=window.HSK4_LOWER_LESSONS||[];\nwindow.HSK4_LOWER_LESSONS.push(${JSON.stringify(L)});`);
}

function bump(file,replacements){let s=read(file);for(const [a,b] of replacements)s=s.replace(a,b);write(file,s)}
// Load the HSK4 Upper detail renderer and bust changed curriculum-data caches.
for(const file of ['hsk4up/lesson.html']){
  let s=read(file);
  if(!s.includes('textbook-detail.css'))s=s.replace('<link rel="stylesheet" href="upper.css?v=20260815">','<link rel="stylesheet" href="upper.css?v=20260815"><link rel="stylesheet" href="textbook-detail.css?v=20260815-1">');
  if(!s.includes('textbook-detail-ui.js'))s=s.replace(/(<script src="app-content\.js\?v=[^"]+"><\/script>)/,'$1<script src="textbook-detail-ui.js?v=20260815-1"></script>');
  s=s.replace(/data\/(\d\d)\.js\?v=[^"']+/g,'data/$1.js?v=20260815-grammar-canonical-1');
  write(file,s);
}
for(const file of ['hsk4up/index.html']){
  let s=read(file);s=s.replace(/data\/(\d\d)\.js\?v=[^"']+/g,'data/$1.js?v=20260815-grammar-canonical-1');write(file,s);
}
for(const file of ['hsk1/index.html','hsk1/lesson.html']){
  let s=read(file);s=s.replace(/data-(\d)\.js\?v=[^"']+/g,'data-$1.js?v=20260815-grammar-canonical-1');write(file,s);
}
for(const file of ['hsk4/index.html','hsk4/lesson.html']){
  let s=read(file);s=s.replace(/data\/(1[1-9]|20)\.js\?v=[^"']+/g,'data/$1.js?v=20260815-grammar-canonical-1');write(file,s);
}
console.log('Applied 236-point grammar audit migration: HSK1 raw titles/phone, HSK4 Upper detailed rules, HSK4 Lower raw canonical grammar.');
