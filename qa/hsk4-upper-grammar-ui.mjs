import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {JSDOM,VirtualConsole} from 'jsdom';
const read=p=>fs.readFileSync(p,'utf8');
function make(id){
  const vc=new VirtualConsole();const errors=[];vc.on('jsdomError',e=>errors.push(e));
  const dom=new JSDOM(read('hsk4up/lesson.html'),{url:`https://example.test/hsk4up/lesson.html?id=${id}&sec=grammar`,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
  const w=dom.window,ctx=dom.getInternalVMContext();w.scrollTo=()=>{};w.speechSynthesis={cancel(){},speak(){},getVoices(){return[]}};w.SpeechSynthesisUtterance=function(t){this.text=t};w.pinyinPro={pinyin:t=>String(t)};
  for(let i=1;i<=10;i++)vm.runInContext(read(`hsk4up/data/${String(i).padStart(2,'0')}.js`),ctx,{filename:`hsk4up/data/${i}.js`});
  vm.runInContext(read('hsk4up/grammar-canonical.js'),ctx,{filename:'hsk4up/grammar-canonical.js'});
  vm.runInContext(`
    var L=window.HSK4_UPPER_LESSONS.find(x=>x.id===${id});
    var sceneIndex=0,hanziSelected='',hanziWriter=null;
    function $(s,r=document){return r.querySelector(s)}
    function $$(s,r=document){return Array.from(r.querySelectorAll(s))}
    function esc(s){return String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))}
    function pyOf(s){return String(s??'')}
    function speak(){}
    function toast(){}
  `,ctx);
  vm.runInContext(read('hsk4up/app-content.js'),ctx,{filename:'hsk4up/app-content.js'});
  vm.runInContext(read('hsk4up/textbook-detail-ui.js'),ctx,{filename:'hsk4up/textbook-detail-ui.js'});
  vm.runInContext('renderGrammar()',ctx);
  return {dom,w,errors};
}
const checks={
  1:['主语 + 即使','“即使” có thể đứng trước chủ ngữ'],
  2:['教材辨析 · So sánh chi tiết','差一点发生但最终没发生'],
  3:['首先 + V','A还是B','A不A'],
  4:['đính chính','danh từ, động từ hoặc mệnh đề'],
  5:['尤其(是) + N/名词性成分','特别的 + N'],
  7:['要是 A（的话），就 B','“的话”'],
  8:['chỉ cần A','không biến nhãn này thành thuật ngữ logic hình thức']
};
for(const [id,needles] of Object.entries(checks)){
  const env=make(Number(id));const d=env.w.document;assert.equal(d.querySelectorAll('#grammarList .grammar-card').length,5,`L${id} grammar cards`);assert.equal(d.documentElement.dataset.hsk4UpperTextbookDetail,'20260815-2',`L${id} detail marker`);const txt=d.querySelector('#grammar')?.textContent||'';for(const n of needles)assert(txt.includes(n),`L${id} missing UI detail: ${n}`);assert.equal(env.errors.length,0,`L${id} jsdom errors: ${env.errors.map(e=>e.message).join('; ')}`);env.dom.window.close();console.log(`HSK4上 L${id} grammar detail UI PASS`);
}
console.log('HSK4 UPPER GRAMMAR DETAIL UI PASS');
