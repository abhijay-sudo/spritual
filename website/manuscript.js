// Progressive enhancement: the original text, anchors and source disclosure remain
// readable without this module. Never hide paragraphs while waiting for an observer.
export function enhanceManuscript({story, lang, beforeLayout, afterLayout, beforeLeave}) {
  const root = document.querySelector('.story-reader');
  if (!root) return;
  const hi = lang === 'hi', say = (en, hindi) => hi ? hindi : en;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const title = root.querySelector('.reader-title');
  root.classList.add('living-manuscript');
  const contents = root.querySelector('.reader-contents nav');
  const journey = root.querySelector('.reader-journey');
  const picker = root.querySelector('.reader-journey-picker');
  if (contents && journey) {
    const destinations = new Set([...journey.querySelectorAll('a')].map(link => link.getAttribute('href')));
    for (const link of contents.querySelectorAll('a')) if (destinations.has(link.getAttribute('href'))) link.remove();
    // One navigation landmark, with a grouped list inside it—not two nested
    // positioned nav panels or two copies of the Reflection destination.
    const group = document.createElement('div'); group.className = journey.className;
    group.append(...journey.childNodes); journey.replaceWith(group); contents.prepend(group);
    if (picker) {
      const choices = document.createElement('div'); choices.className = picker.className;
      choices.setAttribute('role','group'); choices.setAttribute('aria-label', picker.getAttribute('aria-label'));
      choices.append(...picker.childNodes); picker.replaceWith(choices); contents.prepend(choices);
    }
  }
  // The opening painting is server-rendered in a stable frame, never hidden in a disclosure.
  const wrap = document.createElement('section'); wrap.className = 'manuscript-context';
  wrap.setAttribute('aria-label', say('Story context', 'कथा का प्रसंग'));
  const buttons = document.createElement('div'); buttons.className = 'editorial-pills';
  const panels = document.createElement('div'); panels.className = 'editorial-panels';
  let active = null, animation = null;
  const definitions = [
    ['retelling', say('Retelling', 'पुनर्कथन')],
    ['source', say('Source Locator', 'स्रोत का स्थान')],
    ['reflection', say('Reflection', 'मनन')],
  ];
  function closePanel(restoreFocus = false) {
    if (!active) return;
    animation?.cancel(); beforeLayout();
    const {button, panel} = active; panel.hidden = true; button.setAttribute('aria-expanded', 'false'); active = null;
    if (restoreFocus) button.focus({preventScroll: true});
    afterLayout();
  }
  for (const [id, label] of definitions) {
    const button = document.createElement('button'); button.type = 'button'; button.id = `editorial-${id}-toggle`;
    button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-controls', `editorial-${id}`);
    button.innerHTML = `<span></span><svg aria-hidden="true" viewBox="0 0 16 16"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>`;
    button.querySelector('span').textContent = label;
    if (id === 'source') button.title = story.source.locator;
    const panel = document.createElement('div'); panel.id = `editorial-${id}`; panel.className = 'editorial-drawer'; panel.hidden = true;
    panel.setAttribute('role', 'region'); panel.setAttribute('aria-labelledby', button.id);
    const paragraph = document.createElement('p');
    if (id === 'source') {
      const context = document.createElement('p'); context.className = 'source-locator-line'; context.textContent = story.source.locator;
      const source = document.querySelector('#story-source > div')?.cloneNode(true);
      if (source) { source.querySelectorAll('[id]').forEach(node => node.removeAttribute('id')); source.querySelectorAll('.source-map-list').forEach(node => node.className = 'editorial-source-map'); panel.append(source); }
      else panel.append(context);
    } else {
      paragraph.textContent = id === 'retelling' ? (story.editorial.note[lang] || story.editorial.note.en) : (story.reflection[lang] || story.reflection.en);
      const note = document.createElement('small'); note.textContent = id === 'retelling' ? say('An original retelling, not a quotation or translation.', 'मौलिक पुनर्कथन—उद्धरण या अनुवाद नहीं।') : say('An editorial reflection, not source text.', 'संपादकीय मनन, स्रोत-पाठ नहीं।');
      panel.append(note, paragraph);
    }
    const close = document.createElement('button'); close.type = 'button'; close.className = 'text-button'; close.textContent = say('Close context', 'प्रसंग बंद करें'); close.addEventListener('click', () => closePanel(true)); panel.append(close);
    button.addEventListener('click', () => {
      if (active?.button === button) { closePanel(); return; }
      closePanel(); beforeLayout(); panel.hidden = false; button.setAttribute('aria-expanded', 'true'); active = {button, panel};
      if (!motion.matches) animation = panel.animate([{opacity: .35, transform: 'translateY(-6px)'}, {opacity: 1, transform: 'none'}], {duration: 240, easing: 'ease-out'});
      afterLayout();
    });
    panel.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); closePanel(true); } });
    button.addEventListener('keydown', event => { if (event.key === 'Escape') closePanel(true); });
    buttons.append(button); panels.append(panel);
  }
  wrap.append(buttons, panels); title.after(wrap);
  const utilities = document.createElement('div'); utilities.className = 'manuscript-utilities';
  const focus = document.createElement('button'); focus.type = 'button'; focus.id = 'manuscript-focus'; focus.setAttribute('aria-pressed', 'false'); focus.textContent = say('Focus mode', 'एकाग्र पठन');
  const exit = document.createElement('button'); exit.type = 'button'; exit.id = 'manuscript-exit-focus'; exit.hidden = true; exit.textContent = say('Exit focus', 'सामान्य पठन');
  const quiet = document.createElement('a'); quiet.id = 'reader-quiet-minute'; quiet.href = `${hi ? '/hi' : ''}/pause/`; quiet.textContent = say('Take one quiet minute', 'एक शांत मिनट लें');
  function leaveForQuiet(event) {
    const link = event.currentTarget;
    const place = beforeLeave(); const next = new URL(link.href, location.origin);
    next.searchParams.set('from', place);
    const world = new URLSearchParams(location.search).get('world'); if (world) next.searchParams.set('world', world);
    link.href = next.pathname + next.search;
  }
  quiet.addEventListener('click', leaveForQuiet);
  // Reach the sanctuary from the sticky Contents without scrolling away from
  // the paragraph whose exact offset should be restored on return.
  if (contents) {
    const contentsQuiet = quiet.cloneNode(true); contentsQuiet.id = 'contents-quiet-minute';
    contentsQuiet.addEventListener('click', leaveForQuiet); contents.append(contentsQuiet);
  }
  const chrome = root.querySelector('.reader-chrome');
  function focusMode(value) {
    finishReveals();
    beforeLayout(); root.classList.toggle('manuscript-focused', value); chrome.inert = value; exit.hidden = !value; focus.setAttribute('aria-pressed', String(value));
    (value ? exit : focus).focus({preventScroll: true}); afterLayout();
  }
  focus.addEventListener('click', () => focusMode(true)); exit.addEventListener('click', () => focusMode(false));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && root.classList.contains('manuscript-focused')) { event.preventDefault(); focusMode(false); } });
  utilities.append(focus, quiet); wrap.append(utilities); root.prepend(exit);
  // Default-corpus pages gain the same bilingual paragraph pairing as the edition.
  for (const element of root.querySelectorAll('p[data-block-id]')) {
    const block = story.scenes.flatMap(scene => scene.blocks).find(block => block.id === element.dataset.blockId);
    const row = document.createElement('div'); row.className = 'parallel-block'; row.id = element.id; row.dataset.blockId = element.dataset.blockId;
    element.replaceWith(row); element.removeAttribute('id'); element.removeAttribute('data-block-id'); element.className = 'primary-language'; element.lang = lang;
    const alternative = document.createElement('p'); alternative.className = 'parallel-language'; alternative.lang = hi ? 'en' : 'hi'; alternative.setAttribute('aria-hidden', 'true'); alternative.textContent = block.text[alternative.lang]; row.append(element, alternative);
  }
  if (!document.querySelector('#parallel-toggle')) {
    const field = document.createElement('fieldset'); field.className = 'parallel-setting';
    const legend = document.createElement('legend'); legend.textContent = say('Parallel reading', 'समानांतर पठन');
    const toggle = document.createElement('button'); toggle.type = 'button'; toggle.id = 'parallel-toggle'; toggle.className = 'button outline'; toggle.setAttribute('aria-pressed', 'false'); toggle.textContent = say('Show English + हिन्दी', 'English + हिन्दी दिखाएँ');
    field.append(legend, toggle); document.querySelector('#reader-settings .sheet-body').append(field);
  }
  const first = root.querySelector('.reader-scene [data-block-id]'); first?.classList.add('manuscript-opening');
  const reveals = new Set(), pendingReveals = new Set(root.querySelectorAll('[data-block-id],.reader-reflection'));
  let interruptedUntil = 0;
  function finishReveals() {
    interruptedUntil = performance.now() + 500;
    for (const animation of reveals) animation.cancel();
    reveals.clear();
  }
  function reveal(element, {duration = 500, delay = 0, distance = 6, opacity = .82} = {}) {
    if (motion.matches || document.hidden || performance.now() < interruptedUntil) return;
    const effect = element.animate([{opacity, transform: `translateY(${distance}px)`}, {opacity: 1, transform: 'none'}], {duration, delay, easing: 'cubic-bezier(.22,.78,.2,1)'});
    reveals.add(effect);
    effect.finished.then(() => reveals.delete(effect)).catch(() => {});
  }
  // Native navigation and semantic IDs stay authoritative. These effects neither
  // delay a link nor replace the document, and never leave content hidden.
  if (!location.hash && !new URLSearchParams(location.search).has('from')) {
    for (const element of root.querySelectorAll('.reader-opening-art,.reader-title')) reveal(element, {duration: 420, distance: 8, opacity: 1});
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      let stagger = 0;
      for (const entry of entries) if (entry.isIntersecting && !document.hidden) {
        observer.unobserve(entry.target);
        pendingReveals.delete(entry.target);
        reveal(entry.target, {delay: Math.min(stagger++, 2) * 60, distance: entry.target.matches('.reader-reflection') ? 12 : 6});
      }
    }, {threshold: .08});
    const observePending = () => pendingReveals.forEach(node => observer.observe(node));
    observePending();
    addEventListener('pagehide', () => { observer.disconnect(); finishReveals(); });
    addEventListener('pageshow', event => { if (event.persisted) observePending(); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) observePending(); });
  }
  for (const type of ['wheel', 'touchstart', 'pointerdown']) addEventListener(type, finishReveals, {passive: true});
  document.addEventListener('keydown', finishReveals);
  addEventListener('pagehide', () => { finishReveals(); animation?.cancel(); });
  motion.addEventListener('change', () => { if (motion.matches) { finishReveals(); animation?.cancel(); } });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { finishReveals(); animation?.cancel(); } });
}
