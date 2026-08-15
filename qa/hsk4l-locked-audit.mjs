#!/usr/bin/env node
import fs from 'node:fs';
import zlib from 'node:zlib';

const root = process.cwd();
const read = p => fs.readFileSync(`${root}/${p}`, 'utf8');
let packed = '';
for (let i=1;i<=8;i++){
  const s=read(`hsk4/locked-text/chunk${i}.js`);
  const m=s.match(/\+'([^']+)';?\s*$/);
  if(!m) throw new Error(`chunk${i}: packed payload not found`);
  packed += m[1];
}
if(packed.length!==73804) throw new Error(`packed length ${packed.length} != 73804`);
const corpus=JSON.parse(zlib.gunzipSync(Buffer.from(packed,'base64')).toString('utf8'));
const keys=Object.keys(corpus).sort((a,b)=>+a-+b);
if(keys.join(',')!=='11,12,13,14,15,16,17,18,19,20') throw new Error('lesson keys invalid');
let units=0, lines=0;
for(const k of keys){
  const arr=corpus[k];
  if(!Array.isArray(arr)||arr.length!==5) throw new Error(`${k}: unit count invalid`);
  arr.forEach((u,i)=>{
    if(u.n!==i+1) throw new Error(`${k}-${i+1}: order invalid`);
    if(!u.src?.text?.length||!u.src?.pinyin?.length) throw new Error(`${k}-${i+1}: source pages missing`);
    if('summary' in u||'points' in u) throw new Error(`${k}-${i+1}: summary/points entered canonical body`);
    if(!u.lines?.length) throw new Error(`${k}-${i+1}: empty`);
    for(const [j,x] of u.lines.entries()){
      if(!x.zh||!x.py||!x.vi) throw new Error(`${k}-${i+1}-${j+1}: zh/py/vi missing`);
      if(/[\u3400-\u9fff\uf900-\ufaff]/.test(x.py)) throw new Error(`${k}-${i+1}-${j+1}: Han in pinyin`);
      lines++;
    }
    units++;
  });
}
if(units!==50||lines!==286) throw new Error(`counts ${units}/${lines}`);
const allLines=Object.values(corpus).flatMap(units=>units.flatMap(u=>u.lines));
if(!corpus['11'][4].lines.map(x=>x.py).join(' ').match(/hào\s+dúshū/i)) throw new Error('L11 好读书 reading');
if(!allLines.some(x=>x?.zh?.includes('71%'))) throw new Error('L17 71%');
if(!allLines.some(x=>x?.zh?.includes('5500公里'))) throw new Error('L20 5500公里');

const html=read('hsk4/lesson.html');
const ordered=[
  'locked-text/chunk1.js','locked-text/chunk8.js','locked-text/load.js',
  'runtime.js','locked-text-guard.js','content-ui-final.js','locked-text-ui.js','practice.js'
];
let prev=-1;
for(const token of ordered){
  const pos=html.indexOf(token);
  if(pos<0) throw new Error(`lesson.html missing ${token}`);
  if(pos<=prev) throw new Error(`script order invalid at ${token}`);
  prev=pos;
}
if(!html.includes('BÀI KHOÁ — 教材课文')) throw new Error('full-text heading missing');
if(html.includes('BÀI KHOÁ — 课文重点')) throw new Error('old key-text heading remains');
if(!html.includes('locked-text.css')) throw new Error('locked text CSS missing');

console.log(JSON.stringify({ok:true,lessons:10,text_units:units,lines,missing_zh:0,missing_py:0,missing_vi:0,summary_points_in_body:0,source_page_missing:0,han_in_pinyin:0,script_order:'ok',high_risk:'ok'}));
