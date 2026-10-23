// Owner-authorized editorial redesign. The retrieved Site and its manifest remain intact.
// Adapt presentation only: existing story prose, sources, dialogs and release config survive.
const arrow = '<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg>';
export function premiumIntroduction(html) {
  const start = html.indexOf('    <section id="home"');
  const end = html.indexOf('    <section id="journey"', start);
  if (start < 0 || end < 0) throw new Error('Introduction hero contract changed');
  html = html.slice(0, start) + `
    <section id="home" class="hero" aria-labelledby="hero-title">
      <div class="hero-layout section-shell">
        <div class="hero-intro">
          <p class="eyebrow hero-eyebrow"><span class="status-dot" aria-hidden="true"></span> STORIES TO RETURN TO</p>
          <h1 id="hero-title">A whole world. <br><em>In your hands.</em></h1>
          <p class="hero-description">Illustrated stories from the Ramayana and Bhagavata Purana. A little wonder, in English or Hindi.</p>
          <div class="hero-actions"><a class="button button-primary" href="#journey">Find your story ${arrow}</a><a class="quiet-link" href="#experience">Take a first look <svg class="icon" aria-hidden="true"><use href="#i-up-right"/></svg></a></div>
          <p class="availability" data-release-short>App coming soon to iPhone &amp; Android</p>
        </div>
        <div class="hero-gallery" data-scroll-scene aria-label="An illustrated invitation into the Ramayana">
          <figure class="invitation-painting"><img src="/stories-app/assets/forest-journey.webp" alt="Rama and Lakshmana accompany Vishvamitra into a richly painted forest at dusk." width="1672" height="941" fetchpriority="high"><figcaption>THE RAMAYANA <span>AN ILLUSTRATED RETELLING</span></figcaption></figure>
          <div class="invitation-page"><span class="micro-label">FROM THE FIRST JOURNEY</span><span class="page-rule" aria-hidden="true"></span><p>“The answer began<br>with a name:<br><em>Rama.</em>”</p><a class="cover-enter" href="/books/read/what-makes-a-person-admirable/">Enter the story ${arrow}</a><span class="page-folio" aria-hidden="true">01</span></div>
          <span class="painting-frame" aria-hidden="true"></span>
        </div>
      </div>
      <div class="hero-colophon section-shell"><p>Old stories. <em>New discoveries.</em></p><a href="#journey">SCROLL TO DISCOVER <span aria-hidden="true">↓</span></a><span>ENGLISH <span aria-hidden="true">/</span> <span lang="hi">हिन्दी</span></span></div>
    </section>

` + html.slice(end);
  // This is an invitation to currently available reading, not an unapproved pricing plan.
  html = html.replace(/      <div class="edition-details reveal">[\s\S]*?<\/ol>/, `      <div class="edition-details reveal"><div class="edition-name"><span class="eyebrow">YOUR NEXT CHAPTER</span><h3>A shelf full of beginnings.</h3><p>Explore the collection. Keep your place. Return when you’re ready.</p></div><a class="button button-outline" href="/books/">Open the bookshelf ${arrow}</a></div>`);
  html = html.replace('<div class="experience-glow" aria-hidden="true"></div>', '<div class="experience-landscape" aria-hidden="true"><img src="/stories-app/assets/forest-journey.webp" alt="" width="1672" height="941" loading="lazy"></div>');
  html = html.replace('<section id="experience" class="experience-section"', '<section id="experience" data-scroll-scene class="experience-section"');
  html = html.replace('<div class="launch-orbit orbit-one" aria-hidden="true"></div><div class="launch-orbit orbit-two" aria-hidden="true"></div>', '<div class="launch-landscape" aria-hidden="true"><img src="/stories-app/assets/ayodhya-dawn.webp" alt="" width="1672" height="941" loading="lazy"></div>');
  html = html.replace('<section id="get-app" class="launch-section"', '<section id="get-app" data-scroll-scene class="launch-section"');
  html = html.replace('<span class="launch-availability" data-release-short>Coming soon to iPhone &amp; Android</span>', '<span class="launch-availability" data-release-short>Coming soon to iPhone &amp; Android</span><a class="quiet-link launch-read" href="/books/">Read a story while you wait '+arrow+'</a>');
  html = html.replace('<p class="preview-caption"><span class="status-dot" aria-hidden="true"></span> Interactive first look</p>', '<p class="preview-caption"><span class="status-dot" aria-hidden="true"></span> Interactive app preview</p><p class="preview-limit">Notebook saves last for this visit.</p>');
  html = html.replace('<div class="footer-links">', '<div class="footer-links"><a href="/books/">The bookshelf</a>');
  html = html.replace('<link rel="stylesheet" href="/stories-app/styles.css">', '');
  html = html.replace('<link rel="stylesheet" href="/stories-app/collection.css">', '<link rel="stylesheet" href="/stories-app/collection.css">\n<link rel="stylesheet" href="/stories-app/premium.css">');
  html = html.replace('</head>', '<script src="/stories-app/premium.js" defer></script>\n</head>');
  // A future imported version must not silently lose the reading path or honest release UI.
  for (const required of ['class="invitation-painting"', 'class="edition-name"', 'Open the bookshelf', 'class="experience-landscape"', 'class="launch-landscape"', 'Notebook saves last for this visit.', '/stories-app/premium.css', '/stories-app/premium.js', 'id="launch-dialog"', 'data-open-book']) {
    if (!html.includes(required)) throw new Error(`Premium introduction contract missing: ${required}`);
  }
  if (html.includes('class="chapter-contents') || html.includes('one edition purchase')) throw new Error('Unapproved edition terms remain in homepage');
  return html;
}
