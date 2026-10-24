(() => {
  'use strict';

  const panel = document.getElementById('feature-panel');
  const tabs = [...document.querySelectorAll('[data-mode]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const state = { mode: 'read', language: 'en', fontSize: 18, scene: 0, saved: false, savedLanguage: 'en' };
  const scrollPositions = { read: 0, people: 0, notebook: 0 };
  const announcement = document.getElementById('preview-announcement');
  const announce = (message) => { announcement.textContent = message; };
  const icon = (name) => '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  const story = {
    en: {
      title: 'A question worth a lifetime',
      label: 'CHAPTER 01',
      paragraphs: [
        'Valmiki had a question. Among all the people in the world, was there someone whose courage was matched by kindness?',
        'He asked Narada, the travelling sage. The answer began with a name: Rama.'
      ],
      source: 'An original retelling · Valmiki Ramayana<br>Bala Kanda, Sarga 1'
    },
    hi: {
      title: 'एक प्रश्न, एक नई शुरुआत',
      label: 'अध्याय ०१',
      paragraphs: [
        'वाल्मीकि के मन में एक प्रश्न था। क्या इस संसार में कोई ऐसा व्यक्ति है, जिसके साहस के साथ करुणा भी उतनी ही गहरी हो?',
        'उन्होंने यह प्रश्न नारद से पूछा। उत्तर एक नाम से शुरू हुआ—राम।'
      ],
      source: 'एक नया कथारूप · वाल्मीकि रामायण<br>बालकाण्ड, सर्ग १'
    }
  };
  const scenes = [
    {
      image: 'valmiki-manuscript.webp',
      alt: 'An imagined Valmiki at a palm-leaf manuscript beneath a tree.',
      title: 'The poet who asked.',
      copy: 'A quiet question becomes the doorway to an extraordinary life.',
      position: '50% 53%'
    },
    {
      image: 'narada-river-path.webp',
      alt: 'Narada walks along a flowering river path with his veena.',
      title: 'The sage who tells.',
      copy: 'Narada brings a name, and the outline of a journey: Rama.',
      position: '50% 58%'
    }
  ];

  function topbar(label, button) {
    return '<div class="phone-topbar"><span>' + label + '</span>' + (button || icon('book')) + '</div>';
  }

  function reader() {
    const text = story[state.language];
    return topbar('RAMAYANA · THE FIRST JOURNEY',
      '<button class="icon-button" type="button" data-open-mode="scenes" aria-label="Open illustrated Scenes">' + icon('scene') + '</button>') +
      '<div class="phone-scroll" tabindex="0" aria-label="Scroll the chapter excerpt">' +
        '<div class="reader-cover"><img src="assets/forest-sages.webp" alt="Valmiki and Narada beneath a banyan tree." width="1024" height="1536"></div>' +
        '<article class="reader-body" lang="' + state.language + '">' +
          '<span class="reader-kicker">' + text.label + '</span>' +
          '<h3>' + text.title + '</h3>' +
          '<div class="reader-text" lang="' + state.language + '" style="font-size:' + state.fontSize + 'px">' +
            text.paragraphs.map((paragraph) => '<p>' + paragraph + '</p>').join('') +
          '</div><p class="reader-source">' + text.source + '</p>' +
        '</article>' +
      '</div>' +
      '<div class="reader-toolbar" aria-label="Reading preferences">' +
        '<div class="language-switch" role="group" aria-label="Reading language">' +
          '<button type="button" data-language="en" aria-label="Read in English" aria-pressed="' + (state.language === 'en') + '">EN</button>' +
          '<button type="button" data-language="hi" lang="hi" aria-label="Read in Hindi" aria-pressed="' + (state.language === 'hi') + '">हिन्दी</button>' +
        '</div>' +
        '<div class="type-controls" role="group" aria-label="Text size">' +
          '<button type="button" data-type="-1" aria-label="Decrease text size"' + (state.fontSize <= 16 ? ' disabled' : '') + '>A−</button>' +
          '<button type="button" data-type="1" aria-label="Increase text size"' + (state.fontSize >= 21 ? ' disabled' : '') + '>A+</button>' +
        '</div>' +
        '<button class="toolbar-save" type="button" data-save aria-label="' + (state.saved ? 'Remove saved passage' : 'Save this passage') + '" aria-pressed="' + state.saved + '">' + icon(state.saved ? 'check' : 'bookmark') + '</button>' +
      '</div><p class="reader-status">' + (state.saved ? 'Passage saved to your sample notebook' : 'Try a language, text size, or bookmark') + '</p>';
  }

  function sceneView() {
    const scene = scenes[state.scene];
    return '<div class="scene-preview">' +
      topbar('ILLUSTRATED SCENES',
        '<button class="icon-button" type="button" data-open-mode="read" aria-label="Return to reading">' + icon('book') + '</button>') +
      '<div class="scene-art"><img src="assets/' + scene.image + '" alt="' + scene.alt + '" style="object-position:' + scene.position + '" width="1024" height="1536">' +
        '<span class="scene-number">CHAPTER 01 · SCENE 0' + (state.scene + 1) + '</span></div>' +
      '<div class="scene-caption"><h3>' + scene.title + '</h3><p>' + scene.copy + '</p></div>' +
      '<div class="scene-pagination">' +
        '<button class="icon-button" type="button" data-scene="-1" aria-label="Previous scene">' + icon('back') + '</button>' +
        '<div class="scene-dots" aria-label="Scene ' + (state.scene + 1) + ' of ' + scenes.length + '">' +
          scenes.map((_, index) => '<span class="scene-dot' + (index === state.scene ? ' is-active' : '') + '"></span>').join('') +
        '</div><button class="icon-button" type="button" data-scene="1" aria-label="Next scene">' + icon('chevron') + '</button>' +
      '</div></div>';
  }

  function people() {
    const entries = [
      ['Valmiki', 'The poet who asks', 'A poet and sage. His question to Narada opens the Ramayana: who brings its most admired qualities together in one life?'],
      ['Narada', 'The sage who tells', 'A travelling sage and storyteller. In answer to Valmiki, he introduces Rama and the outline of his journey.'],
      ['Ayodhya', 'The city of beginnings', 'The city of King Dasharatha, on the banks of the Sarayu. It is the home from which Rama’s story unfolds.']
    ];
    return topbar('THE WORLD OF THE STORY', icon('people')) +
      '<div class="phone-scroll" tabindex="0" aria-label="Explore people and places">' +
        '<div class="people-heading"><h3>People &amp; Places</h3><p>A little company for your first chapter.</p></div>' +
        '<div class="people-illustration"><img src="assets/sarayu-riverfront.webp" alt="An imagined Sarayu riverfront with stone steps, a quiet boat and water lilies." width="1672" height="941"></div>' +
        '<div class="people-list">' +
          entries.map((entry, index) => '<details class="person-item"' + (index === 0 ? ' open' : '') + '><summary><span class="person-name">' + entry[0] + '<span class="person-role">' + entry[1] + '</span></span></summary><p>' + entry[2] + '</p></details>').join('') +
        '</div>' +
      '</div>';
  }

  function notebook() {
    const language = state.saved ? state.savedLanguage : 'en';
    const quote = language === 'hi' ? '“उत्तर एक नाम से शुरू हुआ—राम।”' : '“The answer began with a name: Rama.”';
    return topbar('YOUR PASSAGE NOTEBOOK', icon('bookmark')) +
      '<div class="phone-scroll" tabindex="0" aria-label="Explore the sample notebook">' +
        '<div class="notebook-content"><h3>What stays<br>with you.</h3><p class="notebook-intro">A small collection of meaningful words.</p>' +
          '<div class="notebook-page"><span class="micro-label">RAMAYANA · ' + (state.saved ? 'SAVED PASSAGE' : 'SAMPLE PASSAGE') + '</span>' +
            '<p class="notebook-quote" lang="' + language + '">' + quote + '</p>' +
            '<div class="notebook-line"></div><p class="notebook-reflection">A question. A name.<br>A whole world opening.</p>' +
          '</div><p class="notebook-foot"><span lang="' + language + '">' + story[language].label + ' · ' + story[language].title + '</span><br>' + (state.saved ? 'Saved during your first look.' : 'Keep a passage to return to.') + '</p>' +
          '<button class="notebook-action" type="button" ' + (state.saved ? 'data-open-mode="read"' : 'data-save') + '>' +
            icon(state.saved ? 'arrow' : 'bookmark') + (state.saved ? 'Return to the chapter' : 'Save this passage') +
          '</button>' +
        '</div>' +
      '</div>';
  }

  const renderers = { read: reader, scenes: sceneView, people, notebook };

  function render(animate = false) {
    panel.innerHTML = renderers[state.mode]();
    panel.setAttribute('aria-labelledby', 'tab-' + state.mode);
    if (animate && !reducedMotion.matches) {
      panel.classList.remove('is-changing');
      void panel.offsetWidth;
      panel.classList.add('is-changing');
    }
  }

  function setMode(mode, focus = false) {
    if (!Object.hasOwn(renderers, mode)) return;
    const previousScroll = panel.querySelector('.phone-scroll');
    if (previousScroll) scrollPositions[state.mode] = previousScroll.scrollTop;
    state.mode = mode;
    tabs.forEach((tab) => {
      const selected = tab.dataset.mode === mode;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      tab.classList.toggle('is-active', selected);
    });
    render(true);
    const nextScroll = panel.querySelector('.phone-scroll');
    if (nextScroll) nextScroll.scrollTop = scrollPositions[mode] || 0;
    document.dispatchEvent(new CustomEvent('spritual:feature', { detail: { mode } }));
    if (focus) panel.focus({ preventScroll: true });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setMode(tab.dataset.mode));
    tab.addEventListener('keydown', (event) => {
      const movement = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      let next;
      if (Object.hasOwn(movement, event.key)) next = (index + movement[event.key] + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      tabs[next].focus();
      setMode(tabs[next].dataset.mode);
    });
  });

  panel.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button || !panel.contains(button)) return;
    if (button.dataset.openMode) {
      setMode(button.dataset.openMode, true);
      return;
    }
    const scroll = panel.querySelector('.phone-scroll');
    const scrollTop = scroll ? scroll.scrollTop : 0;
    let focusSelector;
    if (button.dataset.language) {
      state.language = button.dataset.language;
      focusSelector = '[data-language="' + state.language + '"]';
      announce(state.language === 'hi' ? 'Reading language changed to Hindi.' : 'Reading language changed to English.');
    } else if (button.dataset.type) {
      state.fontSize = Math.max(16, Math.min(21, state.fontSize + Number(button.dataset.type)));
      focusSelector = '[data-type="' + button.dataset.type + '"]';
      announce('Reading text size: ' + state.fontSize + ' pixels.');
    } else if (button.hasAttribute('data-save')) {
      if (!state.saved) state.savedLanguage = state.mode === 'read' ? state.language : 'en';
      state.saved = !state.saved;
      focusSelector = state.mode === 'notebook' && state.saved ? '[data-open-mode="read"]' : '[data-save]';
      announce(state.saved ? 'Passage saved to your sample notebook.' : 'Passage removed from your sample notebook.');
    } else if (button.dataset.scene) {
      state.scene = (state.scene + Number(button.dataset.scene) + scenes.length) % scenes.length;
      focusSelector = '[data-scene="' + button.dataset.scene + '"]';
      announce('Scene ' + (state.scene + 1) + ' of ' + scenes.length + '. ' + scenes[state.scene].title);
    } else return;
    render(Boolean(button.dataset.scene));
    const newScroll = panel.querySelector('.phone-scroll');
    if (newScroll) newScroll.scrollTop = scrollTop;
    const focused = panel.querySelector(focusSelector);
    if (focused && !focused.disabled) focused.focus({ preventScroll: true });
    else panel.focus({ preventScroll: true });
  });

  function explore(mode = 'read') {
    setMode(mode);
    document.getElementById('experience').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    document.getElementById('tab-' + mode).focus({ preventScroll: true });
  }

  document.querySelectorAll('[data-preview]').forEach((button) => {
    button.addEventListener('click', () => explore(button.dataset.preview));
  });

  const launchDialog = document.getElementById('launch-dialog');
  const aboutDialog = document.getElementById('about-dialog');
  const openers = new WeakMap();
  function openDialog(dialog, opener) {
    openers.set(dialog, opener);
    dialog.showModal();
  }
  [launchDialog, aboutDialog].forEach((dialog) => {
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      const opener = openers.get(dialog);
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    });
  });
  document.querySelectorAll('[data-launch]').forEach((button) => button.addEventListener('click', () => openDialog(launchDialog, button)));
  document.addEventListener('spritual:download', (event) => openDialog(launchDialog, event.detail?.opener || document.querySelector('.header-cta')));
  document.querySelector('[data-about]').addEventListener('click', (event) => openDialog(aboutDialog, event.currentTarget));
  document.querySelector('[data-return-preview]').addEventListener('click', () => {
    openers.delete(launchDialog);
    launchDialog.close();
    explore();
  });

  // A store button appears only after a real, approved store URL is configured.
  function verifiedStoreUrl(value, host) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && url.hostname === host && !url.username && !url.password ? url.href : null;
    } catch { return null; }
  }
  const release = window.SPRITUAL_RELEASE || {};
  const platforms = [
    { name: 'App Store', url: verifiedStoreUrl(release.iosUrl, 'apps.apple.com') },
    { name: 'Google Play', url: verifiedStoreUrl(release.androidUrl, 'play.google.com') }
  ];
  if (platforms.some((platform) => platform.url)) {
    const container = document.getElementById('platforms');
    container.replaceChildren();
    platforms.forEach((platform) => {
      const item = document.createElement(platform.url ? 'a' : 'div');
      item.className = 'platform';
      if (platform.url) {
        item.href = platform.url;
        item.target = '_blank';
        item.rel = 'noopener noreferrer';
      }
      item.innerHTML = icon('phone') + '<div><strong>' + platform.name + '</strong><span>' + (platform.url ? 'Download the app' : 'Coming soon') + '</span></div>';
      container.append(item);
    });
    document.getElementById('dialog-status').textContent = 'THE SPRITUAL APP';
    document.getElementById('dialog-title').innerHTML = 'Your next chapter<br><em>begins here.</em>';
    document.getElementById('dialog-description').textContent = 'Choose your device and bring the first journey to your phone.';
    document.querySelector('[data-release-closing]').textContent = 'STORIES FOR YOUR PHONE';
    document.querySelectorAll('[data-release-label]').forEach((label) => { label.textContent = 'An illustrated story app'; });
    document.querySelectorAll('[data-release-short]').forEach((label) => {
      label.textContent = platforms.every((platform) => platform.url) ? 'For iPhone and Android' : platforms.find((platform) => platform.url).name === 'App Store' ? 'Available for iPhone' : 'Available for Android';
    });
  }

  const header = document.querySelector('.site-header');
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    document.querySelectorAll('.reveal').forEach((element) => {
      if (element.getBoundingClientRect().top > window.innerHeight) {
        element.classList.add('will-reveal');
        observer.observe(element);
      }
    });
    reducedMotion.addEventListener('change', (event) => {
      if (event.matches) {
        document.querySelectorAll('.will-reveal').forEach((element) => element.classList.add('is-visible'));
        observer.disconnect();
      }
    });
  }
  render();
})();
