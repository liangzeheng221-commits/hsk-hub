(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var enhanceTimer = null;
  var activeWriter = null;
  var activeWriterChar = '';

  function textOf(el) {
    return (el && el.textContent ? el.textContent : '').replace(/\s+/g, ' ').trim();
  }

  function isHsk4() {
    var badge = document.querySelector('.level-badge');
    var badgeText = textOf(badge);
    return /HSK\s*4/i.test(badgeText) || /HSK\s*4/i.test(document.title);
  }

  function isHanChar(value) {
    return /^[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]$/.test(value || '');
  }

  function firstHanChar(value) {
    var m = String(value || '').match(/[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/);
    return m ? m[0] : '';
  }

  function visible(el) {
    if (!el || !el.getBoundingClientRect) return false;
    var r = el.getBoundingClientRect();
    var s = window.getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden';
  }

  function pickCurrentChar(master) {
    var attrNames = ['data-char', 'data-hanzi', 'data-character'];
    for (var a = 0; a < attrNames.length; a += 1) {
      var attrEl = master.querySelector('[' + attrNames[a] + ']');
      if (attrEl) {
        var attrValue = attrEl.getAttribute(attrNames[a]);
        var attrChar = firstHanChar(attrValue);
        if (attrChar) return attrChar;
      }
    }

    var candidates = [];
    var nodes = master.querySelectorAll('*');
    for (var i = 0; i < nodes.length; i += 1) {
      var el = nodes[i];
      if (el.closest('.hs4-stroke-enhancement')) continue;
      if (el.children.length) continue;
      var t = textOf(el);
      if (!isHanChar(t) || !visible(el)) continue;
      var style = window.getComputedStyle(el);
      var size = parseFloat(style.fontSize) || 0;
      var rect = el.getBoundingClientRect();
      candidates.push({ char: t, score: size * 10 + Math.min(rect.width * rect.height, 100000) / 1000, el: el, size: size });
    }

    candidates.sort(function (x, y) { return y.score - x.score; });
    if (candidates.length) return candidates[0].char;
    return firstHanChar(textOf(master));
  }

  function findLargeGlyph(master, char) {
    var best = null;
    var nodes = master.querySelectorAll('*');
    for (var i = 0; i < nodes.length; i += 1) {
      var el = nodes[i];
      if (el.closest('.hs4-stroke-enhancement')) continue;
      if (el.children.length) continue;
      if (textOf(el) !== char || !visible(el)) continue;
      var size = parseFloat(window.getComputedStyle(el).fontSize) || 0;
      if (size < 72) continue;
      var rect = el.getBoundingClientRect();
      var score = size * 10 + Math.min(rect.width * rect.height, 120000) / 1000;
      if (!best || score > best.score) best = { el: el, score: score };
    }
    return best && best.el;
  }

  function accentColor(master) {
    var btns = master.querySelectorAll('button, .primary-btn');
    for (var i = 0; i < btns.length; i += 1) {
      var bg = window.getComputedStyle(btns[i]).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
    }
    var globalBtn = document.querySelector('.primary-btn');
    if (globalBtn) {
      var globalBg = window.getComputedStyle(globalBtn).backgroundColor;
      if (globalBg && globalBg !== 'rgba(0, 0, 0, 0)' && globalBg !== 'transparent') return globalBg;
    }
    return '#1e5c3a';
  }

  function ensureStyles() {
    if (document.getElementById('hs4StrokeFixStyles')) return;
    var style = document.createElement('style');
    style.id = 'hs4StrokeFixStyles';
    style.textContent = [
      '.hs4-stroke-enhancement{margin-top:16px;text-align:left;--hs4-accent:#1e5c3a}',
      '.hs4-stroke-meta{font-size:14px;color:#65736d;margin:2px 0 12px}',
      '.hs4-writer-host{width:min(310px,100%);height:min(310px,78vw);min-height:240px;margin:0 auto 12px;border:1.5px solid color-mix(in srgb,var(--hs4-accent) 24%,#dce8e1);border-radius:14px;overflow:hidden;background-color:#fff;background-image:linear-gradient(to right,transparent calc(50% - .5px),#e8ecea 50%,transparent calc(50% + .5px)),linear-gradient(to bottom,transparent calc(50% - .5px),#e8ecea 50%,transparent calc(50% + .5px)),linear-gradient(45deg,transparent calc(50% - .5px),#f0f2f1 50%,transparent calc(50% + .5px)),linear-gradient(-45deg,transparent calc(50% - .5px),#f0f2f1 50%,transparent calc(50% + .5px));display:flex;align-items:center;justify-content:center}',
      '.hs4-writer-host svg{display:block;max-width:100%;height:auto}',
      '.hs4-stroke-note{margin:12px 0 10px;padding:10px 12px;border-radius:10px;background:color-mix(in srgb,var(--hs4-accent) 7%,white);color:#52625b;font-size:14px}',
      '.hs4-stroke-heading{margin:18px 0 10px;font-size:16px;font-weight:800;color:var(--hs4-accent)}',
      '.hs4-stroke-scroll{display:flex;gap:12px;overflow-x:auto;padding:2px 2px 10px;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch}',
      '.hs4-stroke-scroll::-webkit-scrollbar{height:6px}',
      '.hs4-stroke-card{flex:0 0 112px;scroll-snap-align:start;border:1.5px solid color-mix(in srgb,var(--hs4-accent) 22%,#dfe8e3);border-radius:12px;background:#fff;overflow:hidden}',
      '.hs4-stroke-svg-wrap{width:112px;height:112px;background-image:linear-gradient(to right,transparent calc(50% - .5px),#e8ecea 50%,transparent calc(50% + .5px)),linear-gradient(to bottom,transparent calc(50% - .5px),#e8ecea 50%,transparent calc(50% + .5px)),linear-gradient(45deg,transparent calc(50% - .5px),#f0f2f1 50%,transparent calc(50% + .5px)),linear-gradient(-45deg,transparent calc(50% - .5px),#f0f2f1 50%,transparent calc(50% + .5px));display:flex;align-items:center;justify-content:center}',
      '.hs4-stroke-svg-wrap svg{width:100%;height:100%;display:block}',
      '.hs4-stroke-label{text-align:center;padding:8px 4px 9px;font-size:13px;color:#66726d;border-top:1px solid #eef1ef}',
      '.hs4-stroke-error{padding:12px;border:1px dashed #d8dedb;border-radius:10px;color:#6b7771;font-size:14px}',
      '@media (max-width:520px){.hs4-stroke-card{flex-basis:104px}.hs4-stroke-svg-wrap{width:104px;height:104px}.hs4-writer-host{width:min(300px,88vw);height:min(300px,88vw)}}'
    ].join('');
    document.head.appendChild(style);
  }

  function svgEl(name) {
    return document.createElementNS(SVG_NS, name);
  }

  function buildStrokeCard(strokes, index, accent) {
    var card = document.createElement('div');
    card.className = 'hs4-stroke-card';
    var wrap = document.createElement('div');
    wrap.className = 'hs4-stroke-svg-wrap';
    var svg = svgEl('svg');
    svg.setAttribute('viewBox', '0 0 112 112');
    svg.setAttribute('aria-label', '第 ' + (index + 1) + ' 笔');
    var group = svgEl('g');
    var tf = HanziWriter.getScalingTransform(112, 112, 10);
    group.setAttribute('transform', tf.transform);
    for (var s = 0; s <= index; s += 1) {
      var path = svgEl('path');
      path.setAttribute('d', strokes[s]);
      path.setAttribute('fill', s === index ? accent : '#cfd6d2');
      group.appendChild(path);
    }
    svg.appendChild(group);
    wrap.appendChild(svg);
    var label = document.createElement('div');
    label.className = 'hs4-stroke-label';
    label.textContent = '第 ' + (index + 1) + ' 笔';
    card.appendChild(wrap);
    card.appendChild(label);
    return card;
  }

  function wireButtons(master, writer) {
    var buttons = master.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i += 1) {
      var btn = buttons[i];
      if (btn.dataset.hs4WriterBound === '1') continue;
      var t = textOf(btn).toLowerCase();
      if (/xem bút thuận|演示笔顺|笔顺/.test(t) && !/mục|汉字/.test(t)) {
        btn.dataset.hs4WriterBound = '1';
        btn.addEventListener('click', function (ev) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          writer.cancelQuiz();
          writer.animateCharacter();
        }, true);
      } else if (/luyện viết|练习书写|练习写|写字/.test(t)) {
        btn.dataset.hs4WriterBound = '1';
        btn.addEventListener('click', function (ev) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          writer.cancelQuiz();
          writer.quiz({ showHintAfterMisses: 2, highlightOnComplete: true });
        }, true);
      }
    }
  }

  function renderEnhanced(master, char, data) {
    if (!master.isConnected || !isHsk4()) return;
    var now = pickCurrentChar(master);
    if (now && now !== char) {
      scheduleEnhance();
      return;
    }

    var old = master.querySelector('.hs4-stroke-enhancement');
    if (old) old.remove();

    var accent = accentColor(master);
    var panel = document.createElement('div');
    panel.className = 'hs4-stroke-enhancement';
    panel.dataset.char = char;
    panel.style.setProperty('--hs4-accent', accent);

    var meta = document.createElement('div');
    meta.className = 'hs4-stroke-meta';
    meta.textContent = data.strokes.length + ' 画 · ' + data.strokes.length + ' nét';

    var note = document.createElement('div');
    note.className = 'hs4-stroke-note';
    note.textContent = '笔顺按每个汉字数据逐笔显示。';

    var heading = document.createElement('div');
    heading.className = 'hs4-stroke-heading';
    heading.textContent = '逐笔写法 · Từng bước viết';

    var scroll = document.createElement('div');
    scroll.className = 'hs4-stroke-scroll';
    for (var i = 0; i < data.strokes.length; i += 1) {
      scroll.appendChild(buildStrokeCard(data.strokes, i, accent));
    }

    panel.appendChild(meta);
    panel.appendChild(note);
    panel.appendChild(heading);
    panel.appendChild(scroll);
    master.appendChild(panel);

    var glyph = findLargeGlyph(master, char);
    if (glyph && typeof HanziWriter !== 'undefined') {
      glyph.textContent = '';
      glyph.classList.add('hs4-writer-host');
      glyph.style.setProperty('--hs4-accent', accent);
      var width = Math.max(240, Math.min(310, glyph.clientWidth || 300));
      var height = width;
      activeWriter = HanziWriter.create(glyph, char, {
        width: width,
        height: height,
        padding: 18,
        showOutline: true,
        showCharacter: true,
        strokeColor: accent,
        outlineColor: '#d7ddda',
        highlightColor: accent,
        drawingColor: accent,
        drawingWidth: 5,
        charDataLoader: function () { return data; }
      });
      activeWriterChar = char;
      wireButtons(master, activeWriter);
    }
  }

  function enhance() {
    if (!isHsk4()) return;
    if (typeof HanziWriter === 'undefined' || typeof HanziWriter.loadCharacterData !== 'function') return;
    var master = document.getElementById('hanziMaster');
    if (!master || !master.isConnected || !master.children.length) return;
    var char = pickCurrentChar(master);
    if (!char) return;

    var existing = master.querySelector('.hs4-stroke-enhancement[data-char="' + char + '"]');
    if (existing) {
      if (activeWriter && activeWriterChar === char) wireButtons(master, activeWriter);
      return;
    }

    var stale = master.querySelector('.hs4-stroke-enhancement');
    if (stale) stale.remove();

    HanziWriter.loadCharacterData(char).then(function (data) {
      if (!data || !Array.isArray(data.strokes) || !data.strokes.length) throw new Error('No stroke data');
      renderEnhanced(master, char, data);
    }).catch(function () {
      if (!master.isConnected) return;
      var panel = document.createElement('div');
      panel.className = 'hs4-stroke-enhancement';
      panel.dataset.char = char;
      panel.innerHTML = '<div class="hs4-stroke-error">Không tải được dữ liệu nét cho chữ ' + char + '. Hãy kiểm tra mạng rồi thử lại.</div>';
      master.appendChild(panel);
    });
  }

  function scheduleEnhance() {
    window.clearTimeout(enhanceTimer);
    enhanceTimer = window.setTimeout(enhance, 90);
  }

  function start() {
    ensureStyles();
    scheduleEnhance();

    var root = document.getElementById('hanzi') || document.body;
    if (window.MutationObserver && root) {
      var observer = new MutationObserver(function (mutations) {
        var relevant = false;
        for (var i = 0; i < mutations.length; i += 1) {
          var target = mutations[i].target;
          if (target && target.nodeType === 1 && target.closest && target.closest('.hs4-stroke-enhancement')) continue;
          relevant = true;
          break;
        }
        if (relevant) scheduleEnhance();
      });
      observer.observe(root, { childList: true, subtree: true, characterData: true });
    }

    document.addEventListener('click', function (ev) {
      var target = ev.target && ev.target.closest ? ev.target.closest('#hanziWordMap button, #hanziWordMap [role="button"], #hanziMaster button') : null;
      if (target) window.setTimeout(scheduleEnhance, 30);
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
}());
