import fs from 'node:fs';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';

const unified = fs.readFileSync('assets/vocab-unified.css','utf8');
const fix = fs.readFileSync('assets/vocab-front-no-pinyin.css','utf8');

const cases = [
  ['HSK1','hsk1','vcard'],
  ['HSK2','hsk2','vcard'],
  ['HSK3','hsk3','vcard'],
  ['HSK4 Upper','hsk4-upper','vfront'],
  ['HSK4 Lower','hsk4-lower','vfront'],
];

function markup(kind, bodyClass){
  if(kind === 'vfront') return `<!doctype html><html><head></head><body class="${bodyClass}">
    <div id="vocabGrid"><article class="vcard"><div class="vinner">
      <div class="vface vfront"><div class="vzh">你好</div><div class="vpy" id="frontPy">nǐ hǎo</div></div>
      <div class="vface vback"><div class="vpy" id="backPy">nǐ hǎo</div><div class="vvn">xin chào</div></div>
    </div></article></div><div class="word-py" id="detailPy">nǐ hǎo</div>
  </body></html>`;
  return `<!doctype html><html><head></head><body class="${bodyClass}">
    <div id="vocabGrid"><article class="vcard"><div class="vinner">
      <div class="vface"><div class="vzh">你好</div><div class="vpy" id="frontPy">nǐ hǎo</div></div>
      <div class="vface vback"><div class="vpy" id="backPy">nǐ hǎo</div><div class="vvn">xin chào</div></div>
    </div></article></div><div class="word-py" id="detailPy">nǐ hǎo</div>
  </body></html>`;
}

for(const [label, bodyClass, kind] of cases){
  const dom = new JSDOM(markup(kind, bodyClass), {pretendToBeVisual:true});
  const {document} = dom.window;

  // Worst-case cascade: the intended hide rule is loaded first, then the old shared
  // vocabulary stylesheet that explicitly forces front pinyin to display:block!important.
  const hideStyle = document.createElement('style');
  hideStyle.textContent = fix;
  document.head.appendChild(hideStyle);
  const unifiedStyle = document.createElement('style');
  unifiedStyle.textContent = unified;
  document.head.appendChild(unifiedStyle);

  const front = document.getElementById('frontPy');
  const back = document.getElementById('backPy');
  const detail = document.getElementById('detailPy');
  assert.equal(dom.window.getComputedStyle(front).display, 'none', `${label}: front pinyin must be hidden`);
  assert.notEqual(dom.window.getComputedStyle(back).display, 'none', `${label}: flipped/back pinyin must remain visible`);
  assert.notEqual(dom.window.getComputedStyle(detail).display, 'none', `${label}: detail-panel pinyin must remain visible`);
  dom.window.close();
}

const pages = ['hsk1/lesson.html','lesson.html','hsk3/lesson.html','hsk4up/lesson.html','hsk4/lesson.html'];
for(const page of pages){
  const html = fs.readFileSync(page,'utf8');
  assert.match(html, /vocab-front-no-pinyin\.css\?v=20260816-2/, `${page}: cache-busted front-pinyin stylesheet is required`);
}

console.log('PASS: vocabulary front pinyin is hidden in all five books; back/detail pinyin remains visible.');
