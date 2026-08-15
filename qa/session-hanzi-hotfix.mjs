import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const NEW_HASH='5b363ff1986142a6f34d3e259948aa38ec4773ad293a0cc03f2357877433a0c5';

// Static wiring: every level must consume the session-only gate or its updated equivalent.
{
  assert(read('index.html').includes('assets/session-auth.js?v=20260815-1'),'portal does not load session auth');
  assert(read('hsk1/auth-patch.js').includes(NEW_HASH),'HSK1 password hash is stale');
  assert(read('assets/app.js').includes(NEW_HASH),'HSK2 password hash is stale');
  assert(read('hsk3/runtime-loader-core.js').includes("loadScript('../assets/session-auth.js')"),'HSK3 does not load shared session auth');
  assert(read('hsk4up/app-practice.js').includes('../assets/session-auth.js?v=20260815-1'),'HSK4 upper does not load shared session auth');
  assert(read('hsk4/practice.js').includes('../assets/session-auth.js?v=20260815-1'),'HSK4 lower does not load shared session auth');
  assert(read('hsk1/lesson.html').includes('hanzi-visibility-fix.js?v=20260815-2'),'HSK1 lesson does not load Hanzi visibility fix');
  console.log('AUTH/HANZI WIRING PASS');
}

// Execute the shared auth gate against isolated storage mocks.
{
  class Store{
    constructor(init={}){this.m=new Map(Object.entries(init))}
    getItem(k){return this.m.has(k)?this.m.get(k):null}
    setItem(k,v){this.m.set(k,String(v))}
    removeItem(k){this.m.delete(k)}
  }
  const localStorage=new Store({hsk_site_unlocked_v1:'1'});
  const sessionStorage=new Store();
  const classes=new Set();
  const overlay={style:{display:'none'}};
  const input={disabled:false,value:'',focus(){},select(){}};
  const button={disabled:false};
  const error={classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)}};
  const note={innerHTML:''};
  const document={
    body:{style:{}},readyState:'complete',
    getElementById(id){return ({pwOverlay:overlay,pwInput:input,pwBtn:button,pwError:error})[id]||null},
    querySelector(sel){return sel==='.portal-note'?note:null},
    addEventListener(){}
  };
  const window={};
  const ctx={window,document,localStorage,sessionStorage,setTimeout:fn=>fn(),TextEncoder,crypto:globalThis.crypto,console};
  vm.runInNewContext(read('assets/session-auth.js'),ctx,{filename:'assets/session-auth.js'});
  assert.equal(localStorage.getItem('hsk_site_unlocked_v1'),null,'legacy persistent unlock was not cleared');
  assert.notEqual(overlay.style.display,'none','fresh session must remain locked');
  sessionStorage.setItem('hsk_portal_unlocked_v2','1');
  window.__HSK_SESSION_AUTH_API.syncGate();
  assert.equal(overlay.style.display,'none','current session should unlock all pages');
  assert.equal(sessionStorage.getItem('hsk4_lower_ranteacher_unlocked'),'1','compat session keys not propagated');
  console.log('SESSION AUTH PASS: persistent unlock cleared; current-tab session propagates');
}

// Execute the HSK1 visibility patch: initial hidden render must be deferred until the Hanzi section is active.
{
  let renders=0;
  const section={
    classList:{active:false,contains(c){return c==='active'&&this.active}},
    style:{}
  };
  const body={classList:{contains:c=>c==='hsk1'}};
  const document={
    body,
    getElementById(id){return id==='hanzi'?section:null},
    querySelector(){return null}
  };
  const window={
    renderHanzi(){renders++},
    showSection(sec){section.classList.active=sec==='hanzi'},
    getComputedStyle(){return {display:section.classList.active?'block':'none'}},
    requestAnimationFrame(fn){fn()},
    MutationObserver:undefined
  };
  const ctx={window,document,setTimeout:fn=>fn(),console};
  vm.runInNewContext(read('hsk1/hanzi-visibility-fix.js'),ctx,{filename:'hsk1/hanzi-visibility-fix.js'});
  window.renderHanzi();
  assert.equal(renders,0,'HanziWriter should not initialize while its section is hidden');
  window.showSection('hanzi',false);
  assert.equal(renders,1,'Hanzi should render once after the section becomes visible');
  assert.equal(window.__HSK1_HANZI_VISIBILITY_FIX?.renderedVisible,true,'visibility diagnostic did not confirm visible render');
  console.log('HSK1 HANZI VISIBILITY PASS: hidden first render deferred until visible layout');
}

console.log('SESSION + HSK1 HANZI HOTFIX QA PASS');
