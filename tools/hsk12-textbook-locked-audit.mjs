import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';

const read = p => fs.readFileSync(p,'utf8');
const fail = m => { throw new Error(m); };
function runLayer(file, key, lessons){
  const document={documentElement:{dataset:{}},getElementById:()=>null};
  const window={document,pako:{ungzip:(bytes,opt)=>{const b=zlib.gunzipSync(Buffer.from(bytes));return opt?.to==='string'?b.toString('utf8'):new Uint8Array(b)}}}; window[key]=lessons;
  const ctx=vm.createContext({window,document,console,Error,Number,Array,String,Math,Uint8Array,Buffer,atob:s=>Buffer.from(s,'base64').toString('binary')});
  vm.runInContext(read(file),ctx,{filename:file});
  return window;
}

const h1base=Array.from({length:15},(_,i)=>({id:i+1,title:'',vn_title:'',scenes:[]}));
const w1=runLayer('hsk1/textbook-locked.js','HSK1_LESSONS',h1base);
const c1=w1.__HSK1_TEXTBOOK_LOCKED;
if(!c1?.ok||c1.lessons!==15||c1.text_units!==45||c1.lines!==156) fail('HSK1 locked contract mismatch');
if(h1base.some(L=>L.scenes.length!==3)) fail('HSK1 scene count mismatch');
const h1lines=h1base.flatMap(L=>L.scenes.flatMap(s=>s.lines));
if(h1lines.some(x=>!x.locked||!x.zh||!x.py||!x.vn)) fail('HSK1 incomplete locked line');
const h1l11=h1base[10].scenes.flatMap(s=>s.lines).find(x=>x.zh==='我星期一去北京。');
if(h1l11?.vn!=='Tôi sẽ đi Bắc Kinh vào thứ Hai.') fail('HSK1 reviewed Vietnamese correction lost');
const h1phone=h1base[12].scenes[2].lines[0];
if(!/yāo/i.test(h1phone.py)) fail('HSK1 telephone yāo reading lost');

const h2base=Array.from({length:15},(_,i)=>({id:i+1,title:'',vn_title:'',scenes:[]}));
const h2chunks=['assets/hsk2-textbook-locked-1.js','assets/hsk2-textbook-locked-2.js','assets/hsk2-textbook-locked-3.js','assets/hsk2-textbook-locked-4.js'];
{
  const document={documentElement:{dataset:{}},getElementById:()=>null};
  const window={document,HSK2_LESSONS:h2base,pako:{ungzip:(bytes,opt)=>{const b=zlib.gunzipSync(Buffer.from(bytes));return opt?.to==='string'?b.toString('utf8'):new Uint8Array(b)}}};
  const ctx=vm.createContext({window,document,console,Error,Number,Array,String,Math,Uint8Array,Buffer,atob:s=>Buffer.from(s,'base64').toString('binary')});
  for(const f of h2chunks)vm.runInContext(read(f),ctx,{filename:f});
  vm.runInContext(read('assets/hsk2-textbook-locked.js'),ctx,{filename:'assets/hsk2-textbook-locked.js'});
  globalThis.__w2=window;
}
const w2=globalThis.__w2;delete globalThis.__w2;
const c2=w2.__HSK2_TEXTBOOK_LOCKED;
if(!c2?.ok||c2.lessons!==15||c2.text_units!==60||c2.lines!==245) fail('HSK2 locked contract mismatch');
if(h2base.some(L=>L.scenes.length!==4)) fail('HSK2 scene count mismatch');
const h2lines=h2base.flatMap(L=>L.scenes.flatMap(s=>s.lines));
if(h2lines.some(x=>!x.locked||!x.zh||!x.py||!x.vn)) fail('HSK2 incomplete locked line');
const h2l11=h2base[10].scenes.flatMap(s=>s.lines).find(x=>x.zh==='什么朋友？是不是男朋友？');
if(h2l11?.vn!=='Bạn gì vậy? Có phải là bạn trai không?') fail('HSK2 reviewed Vietnamese correction lost');
const h2l13=h2base[12].scenes.flatMap(s=>s.lines).find(x=>x.zh.includes('就是我们班那个长着两个大眼睛'));
if(!h2l13?.vn?.includes('trong lớp bọn mình')) fail('HSK2 L13 reviewed translation lost');

const h1Index=read('hsk1/index.html'), h1Lesson=read('hsk1/lesson.html');
for(const [name,html] of [['HSK1 index',h1Index],['HSK1 lesson',h1Lesson]]){
  if(!html.includes('textbook-locked.js')) fail(`${name} does not load locked layer`);
  if(html.indexOf('content-audit.js')>html.indexOf('textbook-locked.js')) fail(`${name} locked layer must load after content-audit`);
}
const h2Home=read('hsk2.html'), h2Lesson=read('lesson.html');
for(const [name,html] of [['HSK2 home',h2Home],['HSK2 lesson',h2Lesson]]){
  for(let i=1;i<=4;i++)if(!html.includes(`hsk2-textbook-locked-${i}.js`)) fail(`${name} does not load locked corpus chunk ${i}`);
  if(!html.includes('hsk2-textbook-locked.js')) fail(`${name} does not load locked layer`);
  if(html.indexOf('hsk2-textbook-locked.js')>html.indexOf("assets/app.js")) fail(`${name} locked layer must load before app`);
}
if(!h2Lesson.includes('hsk2-textbook-locked-ui.js')) fail('HSK2 lesson does not load locked renderer');
const ui=read('assets/hsk2-textbook-locked-ui.js');
if(!ui.includes("x.py||''")||ui.includes('pinyinText(x.zh)')) fail('HSK2 locked UI is not using canonical pinyin');

console.log(JSON.stringify({ok:true,hsk1:c1,hsk2:c2,total_text_units:c1.text_units+c2.text_units,total_lines:c1.lines+c2.lines},null,2));
