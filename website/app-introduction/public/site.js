(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const icon = (name) => '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  const featureCopy = {
    read: {
      number: '01',
      title: 'A page that <br>feels like yours.',
      description: 'Move between English and Hindi. Find a comfortable text size. Settle into the story.',
      key: '<span>EN</span><span class="key-divider"></span><span lang="hi">हिन्दी</span>',
      quote: 'The answer began <br>with a name: Rama.',
      label: 'A FEW WORDS. <br>A WORLD OPENING.',
      tip: 'Try the language and reading controls inside the phone.'
    },
    scenes: {
      number: '02',
      title: 'Let the story <br>surround you.',
      description: 'Step from the words into an illustrated Scene. Look a little closer, then return to your chapter.',
      key: icon('scene') + '<span class="key-divider"></span>' + icon('book'),
      quote: 'Some worlds deserve <br>a moment of their own.',
      label: 'FROM THE PAGE. <br>INTO THE PICTURE.',
      tip: 'Use the arrows in the phone to move between the two opening Scenes.'
    },
    people: {
      number: '03',
      title: 'A little context. <br>A richer story.',
      description: 'Meet the people. Find your way through the places. Keep the story’s world close at hand.',
      key: icon('people') + '<span class="key-divider"></span>' + icon('book'),
      quote: 'Every name opens <br>another door.',
      label: 'PEOPLE & PLACES. <br>A LITTLE COMPANY.',
      tip: 'Open a name inside the phone to discover its place in the story.'
    },
    notebook: {
      number: '04',
      title: 'Keep the words <br>that find you.',
      description: 'Save a passage from your reading. Bring a few meaningful words into your own small collection.',
      key: icon('bookmark') + '<span class="key-divider"></span>' + icon('check'),
      quote: 'A passage can mean <br>more, the second time.',
      label: 'YOUR PASSAGE NOTEBOOK. <br>WORDS TO RETURN TO.',
      tip: 'Save a passage in Read, then find it here in the same language.'
    }
  };

  document.addEventListener('spritual:feature', (event) => {
    const copy = featureCopy[event.detail?.mode];
    if (!copy) return;
    document.getElementById('feature-count').textContent = copy.number;
    document.getElementById('feature-story-title').innerHTML = copy.title;
    document.getElementById('feature-story-description').textContent = copy.description;
    document.getElementById('feature-key').innerHTML = copy.key;
    document.getElementById('feature-aside-quote').innerHTML = copy.quote;
    document.getElementById('feature-aside-label').innerHTML = copy.label;
    document.getElementById('feature-tip').textContent = copy.tip;
  });

  const root = document.documentElement;
  const gallery = document.querySelector('.hero-gallery');
  let framePending = false;
  let galleryVisible = true;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      galleryVisible = entries[0].isIntersecting;
      if (galleryVisible) scheduleFrame();
    }, { rootMargin: '100px' });
    observer.observe(gallery);
  }

  function updateMotion() {
    framePending = false;
    const total = root.scrollHeight - window.innerHeight;
    const progress = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
    root.style.setProperty('--page-progress', progress.toFixed(4));
    if (!reducedMotion.matches && window.innerWidth > 900 && galleryVisible) {
      const bounds = gallery.getBoundingClientRect();
      const stage = Math.min(1, Math.max(0, (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)));
      root.style.setProperty('--fan-spread', (stage * 18).toFixed(2) + 'px');
      root.style.setProperty('--fan-lift', (-stage * 12).toFixed(2) + 'px');
    } else if (reducedMotion.matches || window.innerWidth <= 900) {
      root.style.setProperty('--fan-spread', '0px');
      root.style.setProperty('--fan-lift', '0px');
    }
  }

  function scheduleFrame() {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateMotion);
  }

  window.addEventListener('scroll', scheduleFrame, { passive: true });
  window.addEventListener('resize', scheduleFrame, { passive: true });
  window.addEventListener('load', scheduleFrame, { once: true });
  reducedMotion.addEventListener('change', scheduleFrame);
  scheduleFrame();
})();
