// Spritual epic layer (styles: epic.css). Progressive enhancement only: it reads what the page already says and adds light
// and motion around it. Three jobs: the leads' own pages (their world, a halo, their name struck in gold, their title),
// the leads wherever else they stand (a tile, a row, the cast on the home page), and arrivals for everything the cinema
// layer left still. External and dependency-free, so the site's strict CSP (script-src 'self') allows it.
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var hi = /^hi/i.test(root.lang || '') || /^\/hi(\/|$)/.test(location.pathname);
  var reduced = function () { return root.dataset.motion === 'reduce' || matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var lowData = !!(navigator.connection && navigator.connection.saveData) || matchMedia('(prefers-reduced-data: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  // The leads: [their light, a traditional name for them in English, the same in Hindi]
  var LEADS = {
    rama: ['#f6b45c', 'Maryada Purushottama', 'मर्यादा पुरुषोत्तम'],
    sita: ['#f29a7a', 'Daughter of the Earth', 'भूमिजा'],
    hanuman: ['#ff8a3c', 'Son of the Wind', 'पवनपुत्र'],
    lakshmana: ['#e9b25a', 'Son of Sumitra', 'सौमित्र'],
    ravana: ['#e0492f', 'Ten-Headed Lord of Lanka', 'दशानन · लंकेश'],
    krishna: ['#6fb6ff', 'Lifter of Govardhana', 'गिरिधर'],
    arjuna: ['#7fd0e8', 'Wielder of the Gandiva', 'गाण्डीवधारी'],
    yudhishthira: ['#f0d28a', 'Dharmaraja', 'धर्मराज'],
    draupadi: ['#ff7a4a', 'Yajnaseni', 'याज्ञसेनी'],
    karna: ['#ffc94a', 'Son of the Sun', 'सूर्यपुत्र'],
    bhishma: ['#cfd8e6', 'Devavrata', 'देवव्रत'],
    shiva: ['#8fb7ff', 'Mahadeva', 'महादेव'],
    vishnu: ['#6fa8ff', 'Narayana', 'नारायण'],
    devi: ['#ff5a52', 'Jagadamba', 'जगदम्बा'],
    ganesha: ['#ff9f4a', 'Remover of Obstacles', 'विघ्नहर्ता']
  };
  var slugOf = function (href) { var m = /(?:^|\/)characters\/([a-z-]+)\/?(?:[?#].*)?$/.exec(href || ''); return m ? m[1] : ''; };

  /* ---------- 1. A lead's own page ---------- */
  var hero = $('.cast-hero'), me = slugOf(location.pathname), lead = LEADS[me];
  if (hero && lead) {
    var main = hero.closest('main') || d.body, pic = $('.cast-hero-pic', hero), txt = $('.cast-hero-txt', hero);
    main.classList.add('ep-major'); main.style.setProperty('--ep-a', lead[0]);
    root.dataset.epic = me;

    // their world: the painting of the first story they appear in, behind them
    var first = $('.cast-stories .card-art img');
    if (first && !lowData) {
      var back = d.createElement('div'); back.className = 'ep-back'; back.setAttribute('aria-hidden', 'true');
      var bi = d.createElement('img'); bi.alt = ''; bi.decoding = 'async';
      if (first.getAttribute('srcset')) { bi.srcset = first.getAttribute('srcset'); bi.sizes = '100vw'; }
      bi.src = first.getAttribute('src');
      back.appendChild(bi); hero.insertBefore(back, hero.firstChild);
    }

    // the halo behind them, and sparks rising round them
    if (pic) {
      var halo = d.createElement('div'); halo.className = 'ep-halo'; halo.setAttribute('aria-hidden', 'true');
      halo.innerHTML = '<i class="ep-aura"></i><i class="ep-rays"></i><i class="ep-ring"></i><i class="ep-flash"></i>';
      pic.insertBefore(halo, pic.firstChild);
      if (!reduced()) {
        var motes = d.createElement('div'); motes.className = 'ep-motes'; motes.setAttribute('aria-hidden', 'true');
        var n = innerWidth < 700 ? 10 : 18, html = '';
        for (var i = 0; i < n; i++) {
          var r = function (a, b) { return a + Math.random() * (b - a); };
          html += '<i style="--x:' + r(4, 96).toFixed(1) + '%;--b:' + r(0, 46).toFixed(1) + '%;--s:' + r(2, 4.5).toFixed(1) + 'px;--t:' + r(6, 13).toFixed(1) + 's;--dl:' + (-r(0, 13)).toFixed(1) + 's;--dx:' + r(-46, 46).toFixed(0) + 'px"></i>';
        }
        motes.innerHTML = html; pic.appendChild(motes);
      }
    }

    // the name: each letter its own piece of gold (Devanagari is kept whole: its letters join)
    var name = $('.cast-name', hero);
    if (name && !name.children.length) {
      var text = name.textContent.trim(), plain = /^[\x20-\x7eÀ-ɏ]+$/.test(text);
      name.style.setProperty('--ep-nl', Math.max(4, Array.from(text).length));
      name.setAttribute('aria-label', text); name.textContent = '';
      if (plain && !hi) {
        Array.from(text).forEach(function (ch, k) {
          var s = d.createElement('span'); s.setAttribute('aria-hidden', 'true');
          if (ch === ' ') { s.textContent = ' '; } else { s.className = 'ep-l'; s.textContent = ch; s.style.setProperty('--i', k); }
          name.appendChild(s);
        });
      } else {
        var w = d.createElement('span'); w.className = 'ep-w'; w.setAttribute('aria-hidden', 'true'); w.textContent = text; name.appendChild(w);
      }
    }

    // their title, and how much of the library they walk through (counted from the story cards on this page)
    if (txt) {
      var after = $('.cast-echo', txt) || name;
      var title = d.createElement('p'); title.className = 'ep-title'; title.textContent = hi ? lead[2] : lead[1];
      if (hi) title.lang = 'hi';
      if (after && after.parentNode === txt) txt.insertBefore(title, after.nextSibling);
      var cards = $$('.cast-stories .card'), scenes = 0, mins = 0;
      cards.forEach(function (c) { scenes += +c.dataset.scenes || 0; mins += +c.dataset.minutes || 0; });
      var stats = null;
      if (cards.length) {
        var rows = [[cards.length, hi ? 'कथाएँ' : (cards.length === 1 ? 'story' : 'stories')], [scenes, hi ? 'दृश्य' : 'scenes'], [mins, hi ? 'मिनट का पाठ' : 'minutes of reading']].filter(function (x) { return x[0] > 0; });
        stats = d.createElement('ul'); stats.className = 'ep-stats';
        stats.innerHTML = rows.map(function (x) { return '<li><b data-to="' + x[0] + '">' + x[0] + '</b><span>' + x[1] + '</span></li>'; }).join('');
        var line = $('.cast-line', txt); if (line) txt.insertBefore(stats, line.nextSibling); else txt.appendChild(stats);
      }
      // everything beside the name arrives in order
      var k = 0; $$(':scope > *', txt).forEach(function (el) { if (el === name) return; el.classList.add('ep-k'); el.style.setProperty('--ep-k', k++); });
      // the numbers count up once, as they arrive
      if (stats && !reduced()) {
        $$('b', stats).forEach(function (b) {
          var to = +b.dataset.to, t0 = 0; b.textContent = '0';
          var step = function (t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1300), e = 1 - Math.pow(1 - p, 3); b.textContent = Math.round(to * e); if (p < 1) requestAnimationFrame(step); };
          setTimeout(function () { requestAnimationFrame(step); }, 1500);
        });
      }
    }

    hero.classList.add('ep-hero', 'ep-on'); hero.style.setProperty('--ep-a', lead[0]);

    // the lead, the light and their world sit at three depths and lean with the hand (mouse only); at rest when out of sight
    var seen = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; hero.classList.toggle('ep-off', !seen); }).observe(hero);
    if (!reduced() && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
      var tick = function () {
        cx += (tx - cx) * .07; cy += (ty - cy) * .07;
        hero.style.setProperty('--ep-px', cx.toFixed(3)); hero.style.setProperty('--ep-py', cy.toFixed(3));
        raf = (Math.abs(tx - cx) + Math.abs(ty - cy) > .002) ? requestAnimationFrame(tick) : 0;
      };
      hero.addEventListener('pointermove', function (e) {
        if (!seen || reduced()) return;
        var b = hero.getBoundingClientRect();
        tx = ((e.clientX - b.left) / b.width - .5) * 2; ty = ((e.clientY - b.top) / Math.max(1, Math.min(b.height, innerHeight)) - .5) * 2;
        ty = Math.max(-1, Math.min(1, ty));
        if (!raf) raf = requestAnimationFrame(tick);
      }, { passive: true });
      hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
    }
  }

  /* ---------- 1b. The leads, wherever else they stand ---------- */
  $$('.cast-tiles > li, .cast-rows > li, .cx-cast-row > li').forEach(function (li) {
    var a = $('a[href]', li), L = a && LEADS[slugOf(a.getAttribute('href'))];
    if (L) { li.classList.add('ep-star'); li.style.setProperty('--ep-a', L[0]); }
  });
  var castRow = $('.cx-cast-row');
  if (castRow) { castRow.classList.add('ep-float'); $$(':scope > li', castRow).forEach(function (li, k) { li.style.setProperty('--ep-n', k % 5); }); }
  var wm = $('.cx-credits-name'); if (wm) wm.classList.add('ep-shine');

  /* ---------- 2. Arrivals: what the cinema layer left still comes in once, when it is reached, then stays put ---------- */
  if (reduced() || !('IntersectionObserver' in window)) return;
  var SETS = [
    // plain pages, the dossier, festival rows, today's blocks, the credits, the home feature cards, empty states
    ['', '.cx-plain-in > h1, .cx-plain-text > *, .cx-plain-in > .cx-btn, .dossier-in > *, .cx-credits-line, .cx-credits-sub, .cx-credits-list > *, .cx-credits-in > .cx-credits-btns, .cx-manas-card > *, .block-head, .empty, .moment, main > .wrap > .note, .mx-src, .cx-stotra-sa, .legend, .kept, .story-intro, .mx-ep-n, .mx-ep-t, .mx-sum'],
    ['ep-rv--side', '.fest-list > li, .fest-item'],
    ['ep-rv--grow', '.cx-credits-name, .pause-card, .mx-shot, .cx-finale-card > *'],
    // reading text never slides: it only comes up to full strength as it is reached
    ['ep-rv--soft', '.scene-text, .mx-cp, .mx-doha, .mx-shloka, .mx-chhand, .mx-mean, .st-v']
  ];
  var all = [];
  SETS.forEach(function (set) {
    $$(set[1]).forEach(function (el) {
      if (all.length > 700 || el.classList.contains('th-rv') || el.classList.contains('ep-rv') || el.closest('.ep-hero')) return;
      el.classList.add('ep-rv'); if (set[0]) el.classList.add(set[0]); all.push(el);
    });
  });
  if (!all.length) return;
  var settle = function (el) { el.classList.remove('ep-rv', 'ep-in', 'ep-rv--side', 'ep-rv--grow', 'ep-rv--soft'); el.style.removeProperty('--ep-i'); };
  var io = new IntersectionObserver(function (es) {
    var now = es.filter(function (en) { return en.isIntersecting; }).map(function (en) { return en.target; });
    now.sort(function (a, b) { var p = a.getBoundingClientRect(), q = b.getBoundingClientRect(); return (p.top - q.top) || (p.left - q.left); });
    now.forEach(function (el, k) {
      io.unobserve(el); el.style.setProperty('--ep-i', Math.min(k, 7)); el.classList.add('ep-in');
      el.addEventListener('animationend', function (e) { if (e.target === el) settle(el); });
      setTimeout(function () { settle(el); }, 2800);
    });
  }, { rootMargin: '0px 0px 22% 0px', threshold: 0 });
  all.forEach(function (el) { io.observe(el); });
  // printing, or the reader switching motion off part-way: everything is simply there
  addEventListener('beforeprint', function () { all.forEach(settle); });
  new MutationObserver(function () { if (root.dataset.motion === 'reduce') { io.disconnect(); all.forEach(settle); } }).observe(root, { attributes: true, attributeFilter: ['data-motion'] });
})();
