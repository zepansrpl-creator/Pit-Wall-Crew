/* Pit Wall Crew – tłumaczenie strony „na brzegu”: polskie teksty w DOM zamieniane wg słownika window.PWC_I18N[lang]. */
(function () {
  var L = 'pl';
  try {
    L = new URLSearchParams(location.search).get('lang') || localStorage.getItem('pwc_lang') || (navigator.language || 'pl').slice(0, 2);
  } catch (e) { L = (navigator.language || 'pl').slice(0, 2); }
  if (['pl', 'en', 'de', 'fr'].indexOf(L) < 0) L = 'en';
  window.PWC_LANG = L;
  document.documentElement.lang = L;
  var D = null, PATS = [], MISS = window.__I18N_MISS = {};
  var NUM = /(?<=\b[TP])\d{1,2}(?![\w}])|(?<![\w{.])(?:\d+(?:\.\d+){2,}|\d{1,2}:\d{2}(?:[.,]\d+)?|[-+−]?\d+(?:[.,]\d+)?)(?![\w}])/g;
  function mask(t) { var n = []; var k = t.replace(NUM, function (m) { n.push(m); return '{' + (n.length - 1) + '}'; }); return [k, n]; }
  function numOut(x) { if ((x.match(/\./g) || []).length >= 2) return x; x = x.replace('−', '-'); return L === 'en' ? x.replace(',', '.') : x.replace('.', ','); }
  function fill(t, n) { return t.replace(/\{(\d+)\}/g, function (_, i) { return n[+i] != null ? numOut(n[+i]) : _; }); }
  function init() {
    D = L === 'pl' ? null : ((window.PWC_I18N || {})[L] || {});
    PATS = [];
    if (!D) return;
    Object.keys(D).forEach(function (k) {
      if (!/\{[abc]\}/.test(k)) return;
      var rx = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\{([abc])\\\}/g, '(.+?)');
      try { PATS.push([new RegExp('^' + rx + '$'), D[k], (k.match(/\{([abc])\}/g) || [])]); } catch (e) {}
    });
  }
  function tr(s) {
    if (!D || !s) return s;
    var core = s.trim().replace(/\s+/g, ' ');
    if (!core || !/[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]{2}/.test(core)) return s;
    var out = null;
    if (D.hasOwnProperty(core)) out = D[core];
    else {
      var m = mask(core);
      if (D.hasOwnProperty(m[0])) out = fill(D[m[0]], m[1]);
      else for (var i = 0; i < PATS.length; i++) {
        var r = m[0].match(PATS[i][0]);
        if (r) { var o = PATS[i][1]; PATS[i][2].forEach(function (w, j) { o = o.split(w).join(r[j + 1]); }); out = fill(o, m[1]); break; }
      }
      if (out == null) { MISS[m[0]] = (MISS[m[0]] || 0) + 1; return s; }
    }
    var lead = s.match(/^\s*/)[0], trail = s.match(/\s*$/)[0];
    return lead + out + trail;
  }
  window.PWC_T = tr;
  var ATTRS = ['placeholder', 'title', 'aria-label'];
  function walk(node) {
    if (!D) return;
    if (node.nodeType === 3) {
      var p = node.parentNode;
      if (p && (p.nodeName === 'SCRIPT' || p.nodeName === 'STYLE' || p.nodeName === 'TEXTAREA' || p.closest && p.closest('[data-notr]'))) return;
      var v = node.nodeValue, t = tr(v);
      if (t !== v) node.nodeValue = t;
      return;
    }
    if (node.nodeType !== 1) return;
    if (node.hasAttribute && node.hasAttribute('data-notr')) return;
    ATTRS.forEach(function (a) { if (node.hasAttribute(a)) { var v = node.getAttribute(a), t = tr(v); if (t !== v) node.setAttribute(a, t); } });
    if (node.nodeName === 'INPUT' && (node.type === 'button' || node.type === 'submit') && node.value) node.value = tr(node.value);
    if (node.nodeName === 'OPTION') { var tv = tr(node.textContent); if (tv !== node.textContent) node.textContent = tv; return; }
    for (var c = node.firstChild; c; c = c.nextSibling) walk(c);
  }
  window.PWC_I18N_APPLY = function () { init(); if (D) walk(document.body); };
  function start() {
    init();
    if (!D) return;
    walk(document.body);
    new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        if (m.type === 'characterData') walk(m.target);
        else m.addedNodes.forEach(walk);
        if (m.type === 'attributes') walk(m.target);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    ['alert', 'confirm', 'prompt'].forEach(function (f) {
      var o = window[f];
      window[f] = function (msg, def) { return o.call(window, tr(String(msg == null ? '' : msg)), def); };
    });
    var tt = document.title; document.title = tr(tt);
  }
  window.PWC_SET_LANG = function (l) { try { localStorage.setItem('pwc_lang', l); } catch (e) {} location.reload(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
