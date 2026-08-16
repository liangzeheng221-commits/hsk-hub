import fs from 'node:fs';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';

const code=fs.readFileSync('assets/site-shell.js','utf8');
const wait=ms=>new Promise(r=>setTimeout(r,ms));

async function lessonCase(){
  const dom=new JSDOM(`<!doctype html><html lang="vi"><head><script src="https://example.test/assets/site-shell.js"></script></head><body class="hsk1">
  <div id="pwOverlay"><div class="pw-box"><h2>Gate</h2><p>Desc</p><input id="pwInput"><button id="pwBtn">Open</button><div id="pwError"></div></div></div>
  <header class="lesson-topbar"></header>
  <nav class="top-section-tabs"><button class="section-tab active" data-sec="vocab">Từ vựng</button><button class="section-tab" data-sec="text">Bài khoá</button></nav>
  <main><section class="content-section active" id="vocab"><span class="zh">你好</span></section><section class="content-section" id="text"></section></main>
  <h1 id="lessonTitle">你好！</h1>
  </body></html>`,{url:'https://example.test/hsk-hub/hsk1/lesson.html?id=1&sec=vocab',runScripts:'outside-only',pretendToBeVisual:true});
  dom.window.eval(code);dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));await wait(120);
  const d=dom.window.document;
  assert.equal(d.querySelector('.pw-box').getAttribute('role'),'dialog');
  assert.equal(d.querySelector('.pw-box').getAttribute('aria-modal'),'true');
  assert(d.querySelector('label[for="pwInput"]'));
  assert.equal(d.querySelector('#pwError').getAttribute('role'),'alert');
  assert.equal(d.querySelector('.top-section-tabs').getAttribute('role'),'tablist');
  assert.equal(d.querySelector('[data-sec="vocab"]').getAttribute('role'),'tab');
  assert.equal(d.querySelector('[data-sec="vocab"]').getAttribute('aria-selected'),'true');
  assert.equal(d.querySelector('#vocab').getAttribute('role'),'tabpanel');
  assert.equal(d.querySelector('.zh').getAttribute('lang'),'zh-Hans');
  const p=JSON.parse(dom.window.localStorage.getItem('hsk_module_progress_v1'));
  assert.deepEqual(p['hsk1:1'].modules,['vocab']);
  assert(d.querySelector('link[data-hsk-site-polish]'));
  dom.window.close();
}

async function portalCase(){
  const dom=new JSDOM(`<!doctype html><html><head><script src="https://example.test/assets/site-shell.js"></script></head><body><main class="level-area"><div class="level-grid"></div></main></body></html>`,{url:'https://example.test/hsk-hub/',runScripts:'outside-only'});
  dom.window.localStorage.setItem('hsk_recent_lesson_v1',JSON.stringify({code:'hsk1',id:3,sec:'grammar',title:'你叫什么名字？',url:'/hsk-hub/hsk1/lesson.html?id=3&sec=grammar'}));
  dom.window.eval(code);dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));await wait(80);
  const card=dom.window.document.querySelector('.hsk-continue-card');assert(card,'continue card missing');
  assert.match(card.textContent,/HSK 1/);assert.match(card.textContent,/Bài 3/);assert.match(card.textContent,/Ngữ pháp/);
  dom.window.close();
}

const errors=[];
for(const [name,fn] of [['lesson',lessonCase],['portal',portalCase]]){try{await fn()}catch(e){errors.push(`${name}: ${e.stack||e}`)}}
const report={passed:errors.length===0,cases:2,errors};
fs.writeFileSync('qa/site-shell-smoke.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(errors.length)process.exit(1);
