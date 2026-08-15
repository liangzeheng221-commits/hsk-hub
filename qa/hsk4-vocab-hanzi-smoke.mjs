import fs from 'node:fs';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';

const html='<!doctype html><html><body><div id="hsk4VocabHanziMount"></div></body></html>';
const dom=new JSDOM(html,{runScripts:'outside-only',url:'https://example.test/'});
const {window}=dom;
let animated=0,quizzed=0,reset=0;
const strokes=['M 0 0 L 100 100','M 100 0 L 0 100','M 50 0 L 50 100'];
window.HanziWriter={
  loadCharacterData:async()=>({strokes}),
  getScalingTransform:()=>({transform:'translate(6,88) scale(.08,-.08)'}),
  create(target,char){
    assert(target instanceof window.Element,'writer target must be an element');
    assert(/^[\u3400-\u9FFF\uF900-\uFAFF]$/.test(char),'writer must receive one Hanzi');
    return {
      cancelQuiz(){},
      hideCharacter({onComplete}={}){onComplete?.()},
      animateCharacter({onComplete}={}){animated++;onComplete?.()},
      showOutline(){reset++},
      showCharacter(){},
      quiz(){quizzed++}
    };
  }
};
window.eval(fs.readFileSync('assets/vocab-hanzi-panel.js','utf8'));
assert(window.HSK4VocabHanzi,'shared vocabulary Hanzi renderer missing');
window.HSK4VocabHanzi.render({zh:'结婚'});
await new Promise(r=>setTimeout(r,0));
const d=window.document;
assert.equal(d.querySelectorAll('.vocab-hanzi-tab').length,2,'multi-character word must expose both Hanzi');
assert.equal(d.querySelectorAll('.vocab-hanzi-step').length,3,'stroke fan must render every stroke');
assert.match(d.querySelector('.vocab-hanzi-count').textContent,/3 画 · 3 nét/,'stroke count missing');
d.querySelector('.vocab-hanzi-animate').click();
d.querySelector('.vocab-hanzi-quiz').click();
d.querySelector('.vocab-hanzi-reset').click();
assert.equal(animated,1,'animation control did not call Hanzi Writer');
assert.equal(quizzed,1,'writing quiz control did not call Hanzi Writer');
assert(reset>=2,'outline/reset controls were not exercised');
d.querySelectorAll('.vocab-hanzi-tab')[1].click();
await new Promise(r=>setTimeout(r,0));
assert.equal(d.querySelector('.vocab-hanzi-current').textContent,'婚','character tab did not switch the writer');

const upper=fs.readFileSync('hsk4up/app-content.js','utf8');
const lower=fs.readFileSync('hsk4/content-ui-final.js','utf8');
for(const [name,src] of [['HSK4 上',upper],['HSK4 下',lower]]){
  assert(src.includes('id="hsk4VocabHanziMount"'),`${name}: word detail mount missing`);
  assert(src.includes('HSK4VocabHanzi?.render(w)'),`${name}: word click does not render stroke panel`);
}
for(const file of ['hsk4up/lesson.html','hsk4/lesson.html']){
  const src=fs.readFileSync(file,'utf8');
  assert(src.includes('../assets/vocab-hanzi-panel.css'),`${file}: vocabulary Hanzi CSS missing`);
  assert(src.includes('../assets/vocab-hanzi-panel.js'),`${file}: vocabulary Hanzi script missing`);
}
console.log('HSK4 VOCAB HANZI PASS: upper + lower word clicks render character tabs, stroke animation, writing quiz, reset and cumulative stroke cards');
