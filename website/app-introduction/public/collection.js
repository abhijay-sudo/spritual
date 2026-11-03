(() => {
  'use strict';
  const stories = window.SPRITUAL_STORIES || [];
  const byId = new Map(stories.map(story => [story.id, story]));
  const grid = document.getElementById('story-grid');
  const dialog = document.getElementById('story-dialog');
  if (!grid || !dialog || !stories.length) return;
  const filters = [...document.querySelectorAll('[data-story-filter]')];
  const cards = [...grid.querySelectorAll('[data-story-card]')];
  const languageButtons = [...dialog.querySelectorAll('[data-story-language]')];
  const readingScroll = document.getElementById('story-dialog-scroll');
  const title = document.getElementById('story-dialog-title');
  const prose = document.getElementById('story-prose');
  const art = document.getElementById('story-dialog-image');
  const sourceList = document.getElementById('story-source-list');
  const announcement = document.getElementById('collection-announcement');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visibleIds = stories.map(story => story.id);
  let currentId = visibleIds[0];
  let language = 'en';
  let opener = null;
  let restoreFocus = true;
  let railFrame = null;

  const visibleCards = () => cards.filter(card => !card.hidden);
  function activeRailIndex() {
    const shown = visibleCards();
    const left = grid.getBoundingClientRect().left;
    let best = 0;
    let distance = Infinity;
    shown.forEach((card, index) => {
      const candidate = Math.abs(card.getBoundingClientRect().left - left);
      if (candidate < distance) { distance = candidate; best = index; }
    });
    return best;
  }
  function updateRail() {
    railFrame = null;
    const index = activeRailIndex();
    document.getElementById('collection-position').textContent = (index + 1) + ' / ' + visibleIds.length;
    document.querySelector('[data-rail="-1"]').setAttribute('aria-disabled', String(index === 0));
    document.querySelector('[data-rail="1"]').setAttribute('aria-disabled', String(index === visibleIds.length - 1));
  }
  function scheduleRail() {
    if (railFrame !== null) return;
    railFrame = window.requestAnimationFrame(updateRail);
  }
  filters.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.storyFilter;
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    cards.forEach(card => { card.hidden = filter !== 'all' && card.dataset.tradition !== filter; });
    visibleIds = visibleCards().map(card => card.dataset.storyCard);
    grid.scrollTo({left:0,behavior:'instant'});
    const label = visibleIds.length + (visibleIds.length === 1 ? ' story' : ' stories') + ' · English & हिन्दी';
    document.getElementById('collection-count').textContent = label;
    announcement.textContent = visibleIds.length + ' stories shown. ' + button.textContent.trim() + '.';
    updateRail();
  }));
  document.querySelectorAll('[data-rail]').forEach(button => button.addEventListener('click', () => {
    if (button.getAttribute('aria-disabled') === 'true') return;
    const shown = visibleCards();
    const next = Math.max(0, Math.min(shown.length - 1, activeRailIndex() + Number(button.dataset.rail)));
    const desired = grid.scrollLeft + shown[next].getBoundingClientRect().left - grid.getBoundingClientRect().left;
    grid.scrollTo({left:desired,behavior:reduce.matches ? 'instant' : 'smooth'});
  }));
  grid.addEventListener('scroll', scheduleRail, {passive:true});
  window.addEventListener('resize', scheduleRail, {passive:true});

  function renderStory(resetScroll = true) {
    const story = byId.get(currentId);
    if (!story) return;
    const text = story[language];
    title.textContent = text.title;
    title.lang = language;
    prose.lang = language;
    ['story-dialog-kicker', 'story-retelling-note', 'story-announcement'].forEach(id => { document.getElementById(id).lang = language; });
    prose.replaceChildren(...text.paragraphs.map(paragraph => {
      const p = document.createElement('p'); p.textContent = paragraph; return p;
    }));
    const imagePath = 'assets/' + story.image;
    if (art.getAttribute('src') !== imagePath) art.src = imagePath;
    art.alt = story.alt;
    art.style.setProperty('--art-position', story.position || '50% 50%');
    document.getElementById('story-dialog-name').textContent = story.name;
    document.getElementById('story-dialog-series').textContent = story.tradition === 'ramayana' ? 'From the Ramayana' : 'From the Bhagavata';
    document.getElementById('story-dialog-kicker').textContent = language === 'hi' ? 'एक लघु कथारूप' : 'A SHORT RETELLING';
    document.getElementById('story-retelling-note').textContent = language === 'hi' ? 'मूल परंपरा पर आधारित एक नया कथारूप।' : 'An original retelling, drawn from the source tradition.';
    sourceList.replaceChildren(...story.sources.map(source => {
      const link = document.createElement('a');
      link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = source.label;
      return link;
    }));
    languageButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.storyLanguage === language)));
    const index = visibleIds.indexOf(currentId);
    document.getElementById('story-dialog-position').textContent = (index + 1) + ' / ' + visibleIds.length;
    if (resetScroll) readingScroll.scrollTop = 0;
  }
  function openStory(id, button) {
    if (!byId.has(id)) return;
    currentId = id;
    opener = button;
    restoreFocus = true;
    renderStory();
    dialog.showModal();
    title.focus({preventScroll:true});
  }
  grid.addEventListener('click', event => {
    const button = event.target.closest('[data-open-story]');
    if (button && grid.contains(button)) openStory(button.dataset.openStory, button);
  });
  languageButtons.forEach(button => button.addEventListener('click', () => {
    const nextLanguage = button.dataset.storyLanguage;
    if (language === nextLanguage) return;
    const scrollRange = readingScroll.scrollHeight - readingScroll.clientHeight;
    const progress = scrollRange > 0 ? readingScroll.scrollTop / scrollRange : 0;
    language = nextLanguage;
    renderStory(false);
    readingScroll.scrollTop = progress * Math.max(0, readingScroll.scrollHeight - readingScroll.clientHeight);
    document.getElementById('story-announcement').textContent = language === 'hi' ? 'कहानी अब हिन्दी में है।' : 'Story language changed to English.';
  }));
  dialog.querySelectorAll('[data-story-step]').forEach(button => button.addEventListener('click', () => {
    const index = visibleIds.indexOf(currentId);
    currentId = visibleIds[(index + Number(button.dataset.storyStep) + visibleIds.length) % visibleIds.length];
    renderStory();
    document.getElementById('story-announcement').textContent = byId.get(currentId)[language].title;
    title.focus({preventScroll:true});
  }));
  dialog.querySelector('[data-close-story]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (restoreFocus && opener?.isConnected) opener.focus({preventScroll:true});
  });
  dialog.querySelector('[data-story-download]').addEventListener('click', () => {
    restoreFocus = false;
    dialog.close();
    document.dispatchEvent(new CustomEvent('spritual:download', {detail:{opener}}));
  });
  updateRail();
})();
