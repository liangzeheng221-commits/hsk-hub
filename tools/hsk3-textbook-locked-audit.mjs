import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

const read=p=>fs.readFileSync(p,'utf8');
const fail=m=>{throw new Error(m)};
const ok=(v,m)=>{if(!v)fail(m)};
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');

const files=['hsk3/textbook-locked-data.js','hsk3/textbook-locked-data-2.js','hsk3/textbook-locked-data-3.js','hsk3/textbook-locked-data-4.js'];
const expectedHashes=['5690af82d76427f61e6a674119803e66b74f4391adf9841468525d6d0e2e7dbc','fa2dfef945df5b8cb89268012be3c6c3e1dc231d160b6a6738c3018a82339319','0a1ae62ffef014c3ff28b56ea50a891de2326ebb3e0f60efb1bbc1be4b9c0292','ee7955f4731aff0ec42df1530ceb9c4e877127629181ee1133f5ddff5326288b'];
const parts=files.map((file,i)=>{
  const code=read(file);
  const m=code.match(new RegExp(`__HSK3_LOCKED_B64_${i+1}\\s*=\\s*['\"]([A-Za-z0-9+/=]+)['\"]`));
  ok(m,`HSK3 packed locked corpus chunk ${i+1} missing`);
  const actual=sha(m[1]);
  ok(actual===expectedHashes[i],`HSK3 locked chunk ${i+1} SHA mismatch: expected ${expectedHashes[i]}, got ${actual}`);
  return m[1];
});
const packed=parts.join('');
ok(packed.length===63532,`HSK3 packed gzip base64 length mismatch: ${packed.length}`);
ok(sha(packed)==='0f1838163135fdf3906ed6fbec3f6d04243e820f74e0d0e38761c894b302d5d7','HSK3 packed gzip aggregate SHA mismatch');
const corpus=JSON.parse(zlib.gunzipSync(Buffer.from(packed,'base64')).toString('utf8'));

ok(corpus.corpus_id==='HSK3-CANONICAL-LOCKED-v1','HSK3 corpus id mismatch');
ok(String(corpus.source_pdf?.file_name||'').normalize('NFC')==='HSK 3 Sách giáo khoa.pdf','HSK3 source filename mismatch');
ok(corpus.source_pdf?.sha256==='f415d2233eeb18ef843514335ca5f09aae861d9c9a068f4908637e2f7fa43975','HSK3 Tier-0 SHA-256 mismatch');
ok(corpus.source_pdf?.physical_pages===207,'HSK3 source page count mismatch');
ok(corpus.unit_count===80&&corpus.units?.length===80,'HSK3 expected 80 text units');
const lines=corpus.units.flatMap(u=>u.lines||[]);
ok(corpus.line_count===443&&lines.length===443,'HSK3 expected 443 locked lines');
ok(corpus.direct_uploaded_pdf_units===76&&corpus.direct_uploaded_pdf_lines===424,'HSK3 direct-PDF source counts mismatch');
ok(corpus.external_exception_units===4&&corpus.external_exception_lines===19,'HSK3 exception source counts mismatch');
ok(corpus.source_exception?.lesson===18,'HSK3 source exception must be Lesson 18');
ok(JSON.stringify(corpus.source_exception?.missing_printed_pages)==='[168,169]','HSK3 Lesson 18 missing-page record mismatch');
ok(JSON.stringify(corpus.source_exception?.affected_units)==='["hsk3-l18-t1","hsk3-l18-t2","hsk3-l18-t3","hsk3-l18-t4"]','HSK3 Lesson 18 affected-unit list mismatch');

for(let lesson=1;lesson<=20;lesson++){
  const units=corpus.units.filter(u=>u.lesson===lesson).sort((a,b)=>a.text_no-b.text_no);
  ok(units.length===4,`HSK3 L${lesson}: expected four textbook units`);
  ok(units.every((u,i)=>u.text_no===i+1),`HSK3 L${lesson}: text order mismatch`);
  for(const u of units){
    ok(u.verification?.zh==='locked'&&u.verification?.py==='locked'&&u.verification?.vi==='locked',`${u.id}: verification not fully locked`);
    ok(Array.isArray(u.lines)&&u.lines.length>0,`${u.id}: empty text unit`);
    for(const x of u.lines){
      ok(String(x.zh||'').trim(),`${u.id}:${x.line_no} Chinese missing`);
      ok(String(x.py||'').trim(),`${u.id}:${x.line_no} textbook pinyin missing`);
      ok(String(x.vi||'').trim(),`${u.id}:${x.line_no} Vietnamese missing`);
      ok(Number.isInteger(x.source_printed_page),`${u.id}:${x.line_no} printed-page coordinate missing`);
      if(lesson===18)ok(x.source_pdf_page==null,`${u.id}:${x.line_no} Lesson 18 must not invent a PDF page`);
      else ok(Number.isInteger(x.source_pdf_page),`${u.id}:${x.line_no} PDF-page coordinate missing`);
    }
  }
}
const l18=corpus.units.filter(u=>u.lesson===18);
ok(l18.every(u=>u.verification?.source==='locked_external_HSK3_source_text_crosscheck'),'HSK3 L18 exception source lock mismatch');
ok(corpus.units.filter(u=>u.lesson!==18).every(u=>u.verification?.source==='locked_uploaded_pdf_visual'),'HSK3 non-L18 units must be direct-PDF visual locks');

const l16=corpus.units.find(u=>u.lesson===16&&u.text_no===4)?.lines?.find(x=>x.line_no===2)?.zh||'';
ok(l16==='其实，我们应该多对别人笑笑，说话时如果能多用一些“您好”“谢谢”这样的词语，和别人的关系就会变得更好。','HSK3 L16 reviewed Chinese correction lost');
const l18t2=corpus.units.find(u=>u.lesson===18&&u.text_no===2)?.lines?.[0];
ok(l18t2?.speaker==='小明','HSK3 L18 T2 speaker cross-check lost');

const runtime=read('hsk3/runtime-loader-core.js');
for(const asset of ['textbook-locked-data.js','textbook-locked-data-2.js','textbook-locked-data-3.js','textbook-locked-data-4.js','textbook-locked.js','textbook-locked-ui.js'])ok(runtime.includes(asset),`HSK3 runtime missing ${asset}`);
ok(runtime.includes('await window.HSK3_TEXTBOOK_LOCKED_READY'),'HSK3 runtime does not await locked corpus');
ok(runtime.indexOf("loadScript('textbook-audit-ui.js')")<runtime.indexOf("loadScript('textbook-locked-ui.js')"),'HSK3 locked UI must load after legacy audit UI');

const layer=read('hsk3/textbook-locked.js');
ok(layer.includes('__HSK3_LOCKED_B64_1')&&layer.includes('__HSK3_LOCKED_B64_4'),'HSK3 canonical layer does not concatenate all gzip chunks');
ok(layer.includes("DecompressionStream('gzip')")&&layer.includes('pako.ungzip'),'HSK3 canonical layer lacks gzip browser/fallback decoding');
const ui=read('hsk3/textbook-locked-ui.js');
ok(ui.includes("x.py||''"),'HSK3 textbook renderer does not use canonical pinyin');
ok(!ui.includes('pyOf(x.zh)'),'HSK3 textbook renderer still generates runtime pinyin');
ok(ui.includes("document.getElementById(id)?.remove()"),'HSK3 student UI does not remove audit metadata boxes');
ok(!ui.includes('source_printed_page')&&!ui.includes('source_pdf_page'),'HSK3 student UI exposes source coordinate metadata');

console.log(JSON.stringify({ok:true,corpus_id:corpus.corpus_id,source_pdf_sha256:corpus.source_pdf.sha256,lessons:20,text_units:80,lines:443,direct_uploaded_pdf_units:76,direct_uploaded_pdf_lines:424,external_exception_units:4,external_exception_lines:19,lesson18_missing_printed_pages:[168,169],gzip_base64_length:packed.length,gzip_base64_sha256:sha(packed),chunk_sha256:expectedHashes,runtime_pinyin_for_text:false,student_source_metadata:false},null,2));
