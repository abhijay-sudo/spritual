// The not-found page: Vercel serves one 404.html for every missing address. When the address is under /hi/,
// boot.js marks the page and this swaps in the Hindi page (kept inert in a <template>) before site.js and the rest run.
(function () {
  var d = document.documentElement;
  try {
    if (d.dataset.lostLang !== 'hi') return;
    var t = document.getElementById('lost-hi');
    if (!t) return;
    var body = document.body;
    body.className = 'is-cx';
    body.replaceChildren(t.content.cloneNode(true));
    if (t.dataset.title) document.title = t.dataset.title;
  } finally {
    d.dataset.lostLang = d.dataset.lostLang === 'hi' ? 'hi-ready' : 'en';
  }
})();
