// Owner-authorized editorial redesign. The retrieved Site and its manifest remain intact.
// Adapt presentation only: existing story prose, sources, dialogs and release config survive.
const arrow = '<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg>';
function replaceRequired(html, before, after, contract) {
  if (html.split(before).length !== 2) throw new Error(`Introduction ${contract} contract changed`);
  return html.replace(before, after);
}
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
  html = html.replace('<div class="footer-links">', '<div class="footer-links"><a href="/books/">The bookshelf</a><a href="/privacy/">Privacy</a><a href="/corrections/">Suggest a correction</a>');
  // Keep the reference runtime's availability controls, but let actual reading lead.
  // home-bridge.js continues to update this single link for each story and language.
  html = replaceRequired(html,
    '<a class="text-button" data-open-book href="/books/read/rama-bow/">Read in the book ↗</a>',
    '<button class="quiet-link story-app-availability" type="button" data-story-download aria-haspopup="dialog">About the mobile app <svg class="icon" aria-hidden="true"><use href="#i-up-right"/></svg></button>',
    'story availability');
  html = replaceRequired(html,
    '<button class="button button-primary story-dialog-download" type="button" data-story-download aria-haspopup="dialog">Get Spritual <svg class="icon" aria-hidden="true"><use href="#i-up-right"/></svg></button>',
    `<a class="button button-primary story-dialog-read" data-open-book href="/books/read/rama-bow/">Continue reading ${arrow}</a>`,
    'story reading action');
  html = replaceRequired(html,
    '<button class="button button-primary dialog-return" type="button" data-return-preview>Explore the first look <svg class="icon"><use href="#i-arrow"/></svg></button>',
    `<a class="button button-primary dialog-bookshelf" href="/books/">Explore the bookshelf ${arrow}</a><button class="quiet-link dialog-return" type="button" data-return-preview>Return to the app preview</button>`,
    'availability reading action');
  html = replaceRequired(html,
    '<p id="dialog-description">The Spritual app is coming soon. <br>Download links will appear here when it launches.</p>',
    '<p id="dialog-description">The Spritual app is coming soon. <br>Until then, the illustrated collection is here to read in English or Hindi.</p>',
    'availability description');
  html = replaceRequired(html,
    '<p>Spritual is an illustrated story app in the making. Our first journey draws on the Valmiki Ramayana, with connected chapters in English and Hindi.</p>',
    '<p>Read illustrated retellings in English or Hindi. Follow each story’s sources, and keep a page to return to in this browser.</p>',
    'about reading');
  html = replaceRequired(html,
    '<p>The stories on this page pair original illustrations with short English and Hindi retellings from the Valmiki Ramayana and Bhagavata Purana. Each story carries its source. The app’s opening follows Valmiki’s question to Narada in Bala Kanda, Sarga 1.</p>',
    '<p>The collection draws on the Valmiki Ramayana and Bhagavata Purana. Each telling keeps its source close, with notes on its context. The reading preview begins with Valmiki’s question to Narada in Bala Kanda, Sarga 1.</p>',
    'about sources');
  html = html.replace('<link rel="stylesheet" href="/stories-app/styles.css">', '');
  html = html.replace('<link rel="stylesheet" href="/stories-app/collection.css">', '<link rel="stylesheet" href="/stories-app/collection.css">\n<link rel="stylesheet" href="/stories-app/premium.css">');
  html = html.replace('</head>', '<script src="/stories-app/premium.js" defer></script>\n</head>');
  // A future imported version must not silently lose the reading path or honest release UI.
  for (const required of ['class="invitation-painting"', 'class="edition-name"', 'Open the bookshelf', 'class="experience-landscape"', 'class="launch-landscape"', 'Notebook saves last for this visit.', '/stories-app/premium.css', '/stories-app/premium.js', 'id="launch-dialog"', 'data-open-book', 'data-story-download', 'data-return-preview', 'Explore the bookshelf', 'href="/privacy/"', 'href="/corrections/"']) {
    if (!html.includes(required)) throw new Error(`Premium introduction contract missing: ${required}`);
  }
  if (html.includes('class="chapter-contents') || html.includes('one edition purchase')) throw new Error('Unapproved edition terms remain in homepage');
  return html;
}
