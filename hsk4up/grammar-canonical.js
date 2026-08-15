/* HSK 4 上 · 50项教材语言点唯一运行时规范层（2026-08-15） */
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
for(const lesson of lessons){
  const titles=TITLES[lesson.id];if(!titles||lesson.grammar?.length!==titles.length)throw new Error(`HSK4上 L${lesson.id}: grammar count mismatch`);
  lesson.grammar.forEach((g,i)=>{g.title=titles[i];g.textbook_title=titles[i];g.content_type='grammar';g.source={book:'HSK标准教程4（上）',lesson:lesson.id,lesson_start_page:lesson.page};});
  if(lesson.compare)lesson.compare.content_type='compare';if(lesson.expansion)lesson.expansion.content_type='expansion';if(lesson.culture)lesson.culture.content_type='culture';
  lesson.grammarManifestVersion='2026-08-15';
}
const patch=(id,title,p)=>{const x=L(id).grammar.find(g=>g.title===title);if(!x)throw new Error(`HSK4上 canonical missing ${id}/${title}`);Object.assign(x,p,{canonicalized:'2026-08-15'})};
const cmp=(id,p)=>Object.assign(L(id).compare,p,{canonicalized:'2026-08-15'});

patch(1,'即使……也……',{
  structure:'即使 + 主语 + …，……也…… / 主语 + 即使 + …，……也……',
  structures:['即使 + 主语 + …，……也……','主语 + 即使 + …，……也……'],
  desc:'Nêu giả thiết nhượng bộ; kết quả ở vế sau không thay đổi. “即使” có thể đứng trước hoặc sau chủ ngữ của mệnh đề thứ nhất; vế sau thường dùng “也” để hô ứng.',
  rule_atoms:[
    {id:'subject-position',type:'position',text:'“即使” có thể đứng trước chủ ngữ của mệnh đề thứ nhất, cũng có thể đứng sau chủ ngữ.'},
    {id:'second-clause-ye',type:'collocation',text:'Mệnh đề sau thường dùng “也” để cho biết kết quả vẫn không thay đổi.'}
  ]
});
patch(2,'差不多',{
  structure:'差不多 + 数量 / A 跟 B 差不多',structures:['差不多 + 数量','A 跟 B 差不多'],
  desc:'Biểu thị số lượng/mức độ xấp xỉ; cũng có thể trực tiếp làm vị ngữ để nói hai sự vật gần giống nhau.',
  rule_atoms:[{id:'before-number',type:'usage',text:'“差不多” có thể đứng trước cụm số lượng để biểu thị con số xấp xỉ.'},{id:'predicate-similarity',type:'usage',text:'“差不多” có thể làm vị ngữ, ví dụ A 跟 B 差不多, để nói hai đối tượng gần giống nhau.'}]
});
cmp(2,{similarities:['Cả hai đều có thể biểu thị mức độ rất gần một chuẩn hoặc kết quả.'],differences:[
  {dimension:'数量前',left:'Có thể: 差不多 + 数量, biểu thị số lượng xấp xỉ.',right:'Thông thường không dùng 几乎 + 数量 để biểu thị số lượng xấp xỉ.'},
  {dimension:'作谓语表示两者接近',left:'Có thể: A 跟 B 差不多.',right:'Không dùng theo cách này.'},
  {dimension:'差一点发生但最终没发生',left:'Thông thường không biểu thị nghĩa “suýt xảy ra nhưng cuối cùng không xảy ra”.',right:'Có thể: 几乎 + V, biểu thị việc suýt xảy ra nhưng cuối cùng không xảy ra.'}
]});
patch(3,'首先……其次……',{
  structure:'首先 A，其次 B / 首先 + V',structures:['首先 A，其次 B','首先 + V'],
  desc:'“首先……其次……” dùng để liệt kê theo thứ tự. Ngoài ra “首先” có thể dùng riêng như phó từ, nghĩa là “trước tiên/sớm nhất”.',
  rule_atoms:[{id:'paired-order',type:'usage',text:'“首先……其次……” thường dùng trong văn viết để liệt kê sự việc theo trình tự.'},{id:'shouxian-alone',type:'usage',text:'“首先” còn có thể dùng riêng như phó từ, biểu thị “trước tiên, sớm nhất”.'}]
});
patch(3,'不管',{
  structure:'不管 + 疑问代词 / A还是B / A不A，(都/也) + …',
  structures:['不管 + 疑问代词，……都/也……','不管 + A还是B，……都/也……','不管 + A不A，……都/也……'],
  desc:'Biểu thị dù điều kiện/lựa chọn nào xảy ra thì kết quả ở mệnh đề sau vẫn không thay đổi. Phần sau 不管 thường là đại từ nghi vấn, cấu trúc lựa chọn với “还是”, hoặc dạng khẳng định–phủ định; mệnh đề sau thường có “都/也”.',
  rule_atoms:[{id:'interrogative-form',type:'collocation',text:'Có thể kết hợp với 什么、怎么、谁、哪儿、多（么）…'},{id:'choice-form',type:'collocation',text:'Có thể dùng dạng A还是B.'},{id:'a-not-a-form',type:'collocation',text:'Có thể dùng dạng khẳng định–phủ định A不A.'},{id:'main-clause-dou-ye',type:'collocation',text:'Mệnh đề sau thường dùng 都 hoặc 也.'}]
});
patch(4,'并',{
  desc:'Trong bài này “并” thường đứng trước 不/没(有) để nhấn mạnh phủ định. Nó đặc biệt hay xuất hiện khi lời nói chuyển ý hoặc sửa lại một phán đoán/ấn tượng trước đó rồi nêu tình hình thực tế.',
  rule_atoms:[{id:'negative-collocation',type:'collocation',text:'Cấu trúc trọng tâm: 并 + 不/没(有) + V/Adj.'},{id:'corrective-context',type:'discourse',text:'Thường dùng trong ngữ cảnh chuyển ý hoặc đính chính một nhận định trước đó.'}]
});
patch(4,'甚至',{
  structure:'A，甚至 B / X、Y，甚至 Z',structures:['A，甚至 B','并列项 X、Y，甚至 Z'],
  desc:'Dùng để đưa ra trường hợp nổi bật/cực đoan hơn. Trong chuỗi các thành phần song song, “甚至” có thể đặt trước mục cuối cùng nổi bật nhất; các thành phần song song có thể là danh từ, động từ hoặc mệnh đề.',
  rule_atoms:[{id:'parallel-position',type:'position',text:'Trong chuỗi song song, “甚至” đứng trước mục cuối cùng, nổi bật nhất.'},{id:'parallel-types',type:'usage',text:'Các mục song song có thể là danh từ, động từ hoặc mệnh đề.'}]
});
patch(5,'尤其',{
  structure:'尤其(是) + N/成分 / 尤其 + V/Adj',structures:['尤其(是) + N/名词性成分','尤其 + V/Adj'],
  desc:'Dùng để làm nổi bật một đối tượng hoặc phương diện trong phạm vi đã nói; “尤其是” thường đứng trước danh từ hoặc thành phần danh từ.',
  rule_atoms:[{id:'scope-highlight',type:'usage',text:'Thường nhấn mạnh một thành viên/phương diện nổi bật trong một phạm vi đã nêu.'},{id:'youshi',type:'collocation',text:'“尤其是 + danh từ/thành phần danh từ” là cấu trúc rất thường gặp.'}]
});
cmp(5,{differences:[
  {dimension:'在范围中突出一项',left:'尤其 thường làm nổi bật một đối tượng/phương diện trong phạm vi đã nói.',right:'特别 cũng có thể nhấn mạnh, nhưng không bắt buộc phải dựa trên một phạm vi đã nêu trước.'},
  {dimension:'尤其是 / 特别 + 程度',left:'Có cấu trúc thường gặp 尤其是 + danh từ/thành phần danh từ.',right:'特别 thường trực tiếp bổ nghĩa cho động từ/tính từ với nghĩa “đặc biệt/rất”.'},
  {dimension:'形容词用法',left:'Không dùng như tính từ định ngữ theo kiểu “尤其的 + N”.',right:'Có thể làm tính từ: 特别的 + N, ví dụ 特别的礼物.'}
]});
patch(7,'要是',{
  structure:'要是 A（的话），就 B',structures:['要是 A（的话），就 B'],
  desc:'Nêu giả thiết/điều kiện. “的话” có thể xuất hiện sau mệnh đề điều kiện và có thể lược bỏ; mệnh đề sau thường dùng “就”.',
  rule_atoms:[{id:'dehua-optional',type:'collocation',text:'Có thể dùng “要是……（的话），就……”; “的话” là thành phần có thể lược bỏ.'},{id:'jiu',type:'collocation',text:'Mệnh đề kết quả thường dùng “就”.'}]
});
patch(8,'只要',{
  structure:'只要 A，就 B',
  desc:'Nêu một điều kiện: chỉ cần điều kiện ở vế đầu được đáp ứng thì kết quả ở vế sau sẽ hoặc có thể xảy ra.',
  rule_atoms:[{id:'condition-result',type:'usage',text:'Ghi nhớ theo chức năng câu: chỉ cần A được đáp ứng thì B xảy ra/được thực hiện.'},{id:'jiu',type:'collocation',text:'Mệnh đề sau thường dùng “就”.'}],
  logic_note:'Giáo trình dùng cách diễn đạt “điều kiện cần thiết”; khi học mẫu câu, nên ghi nhớ trực tiếp quan hệ sử dụng “chỉ cần A thì B”, không biến nhãn này thành thuật ngữ logic hình thức.'
});
window.HSK4_UPPER_GRAMMAR_CANONICAL={version:'2026-08-15',total:50,corrected:true};
})();
