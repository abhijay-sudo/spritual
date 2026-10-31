import {
  CONTENT_REVISION,
  RELEASE_REVIEW,
  glossary,
  valueLabels,
  pick,
} from './stories.mjs';
import {editionStories as stories,editionStoryKeys as storyKeys,editionStoryById as storyById,editionCharacters as characters} from './illustrated-chapters.mjs';
import {
  ILLUSTRATED_EDITION_REVISION,
  illustratedRelease,
  journeys,
  sourceMaps,
  storyArt,
  imageSources,
  journeyForStory,
  searchText,
} from './illustrated-edition.mjs';

import {sankalpaCard,lotusNav} from './practice-views.mjs'; import {readerBanner} from './recovery-views.mjs';

const t = (lang, en, hi) => (lang === 'hi' ? hi : en);
const esc = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');
const href = (lang, path) => `${lang === 'hi' ? '/hi' : ''}${path}`;
const arrow = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const book = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16ZM20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
const bookmark = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M7 4.5A1.5 1.5 0 0 1 8.5 3h7A1.5 1.5 0 0 1 17 4.5V21l-5-3-5 3V4.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
const settings = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M4 7h10M18 7h2M4 17h2m4 0h10M14 4v6M6 14v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
const sourceIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M7 3h8l4 4v14H7V3Z" stroke="currentColor" stroke-width="1.5"/><path d="M15 3v5h4M10 12h6m-6 4h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
const editionRibbon=lang=>illustratedRelease?'':`<p class="edition-review-ribbon">${t(lang,'Illustrated edition preview · local review only','चित्रित संस्करण पूर्वावलोकन · केवल स्थानीय समीक्षा')}</p>`;
const publicationScopeNote=lang=>t(lang,'Exact-version review of the expanded text, source maps and artwork is pending. This is a local-review abridgement, not scripture text or a translation.','विस्तृत पाठ, स्रोत-मानचित्र और चित्रों की सटीक-संस्करण समीक्षा बाकी है। यह स्थानीय समीक्षा का संक्षेप है—शास्त्र-पाठ या अनुवाद नहीं।');

const summary = story => ({
  id: story.id,
  title: story.title,
  dek: story.dek,
  book: story.book,
  duration: story.duration,
  age: story.age,
  values: story.values,
  world: story.world,
  characters: story.characters,
  revision: CONTENT_REVISION,
  search: searchText(story, characters, valueLabels),
  scenes: story.scenes.map(scene => ({
    id: scene.id,
    title: scene.title,
    blocks: scene.blocks.map(block => ({id: block.id, text: block.text})),
  })),
});

const clientData = (page, lang, extra = {}) => `<script type="application/json" id="reading-data">${JSON.stringify({
  page,
  lang,
  revision: CONTENT_REVISION,
  editionRevision: ILLUSTRATED_EDITION_REVISION,
  illustratedPreview: true,
  releaseReview: RELEASE_REVIEW,
  storyKeys,
  stories: stories.map(summary),
  values: valueLabels,
  characters,
  glossary,
  journeys,
  ...extra,
}).replaceAll('<', '\\u003c')}</script><script type="module" src="/reading.js"></script>`;

function picture(story, lang, {priority = false, className = '', decorative = false} = {}) {
  const record = storyArt[story.id];
  const sources = imageSources(record.file);
  return `<picture class="${className}">
    <source media="(max-width:700px)" srcset="/assets/illustrated/${record.file}-640.jpg"/>
    <img src="${sources.src}" srcset="${sources.srcset}" sizes="(max-width:700px) 100vw, (max-width:1100px) 70vw, 900px" width="960" height="640" ${priority ? 'fetchpriority="high"' : 'loading="lazy"'} alt="${decorative ? '' : esc(pick(record.alt, lang))}"/>
  </picture>`;
}

function plate(file, alt, lang) {
  const sources = imageSources(file);
  return `<figure class="illustration-plate">
    <button type="button" class="plate-open" data-plate-open aria-label="${t(lang, 'Open illustration', 'चित्र खोलें')}">
      <img src="${sources.src}" srcset="${sources.srcset}" sizes="(max-width:700px) 100vw, 760px" width="960" height="640" loading="lazy" alt="${esc(pick(alt, lang))}"/>
    </button>
    <figcaption><span>${illustratedRelease?t(lang,'ORIGINAL ILLUSTRATION','मौलिक चित्र'):t(lang, 'ILLUSTRATION · LOCAL REVIEW', 'चित्र · स्थानीय समीक्षा')}</span>${esc(pick(alt, lang))}</figcaption>
  </figure>`;
}

function sourceMap(story, lang) {
  return `<aside class="source-disclosure illustrated-source-map">
    <div>${sourceIcon}<div><span class="eyebrow">${t(lang, 'SOURCE MAP', 'स्रोत मानचित्र')}</span><h2>${t(lang, 'The checked chapter trail', 'जाँचा अध्याय-पथ')}</h2></div></div>
    <p><strong>${t(lang, 'Tradition:', 'परंपरा:')}</strong> ${t(lang, 'Valmiki Ramayana. Linked modern renderings are provenance witnesses, not republished text.', 'वाल्मीकि रामायण। जुड़े आधुनिक पाठ स्रोत-साक्ष्य हैं, पुनर्प्रकाशित पाठ नहीं।')}</p>
    <ol class="source-map-list">${sourceMaps[story.id].map(entry => `<li><div><strong>${esc(entry.label)}</strong><p>${esc(pick(entry.note, lang))}</p></div><a href="${esc(entry.url)}" target="_blank" rel="noopener noreferrer">${t(lang, 'Open locator', 'संदर्भ खोलें')}${arrow}</a></li>`).join('')}</ol>
    <p class="source-review-note">${illustratedRelease?publicationScopeNote(lang):t(lang, 'This expanded source map and every new painting are local-review-only. They do not inherit the review recorded for the existing public retelling.', 'यह विस्तृत स्रोत मानचित्र और हर नया चित्र केवल स्थानीय समीक्षा के लिए है। इन्हें मौजूदा सार्वजनिक पुनर्कथन की दर्ज समीक्षा प्राप्त नहीं मानी जाती।')}</p>
  </aside>`;
}

const journeyLink = (storyId, lang, journeyId) => `${href(lang, `/read/${storyId}/`)}?journey=${journeyId}`;

export function journeyPage(journey, lang) {
  const first = storyById[journey.storyIds[0]];
  const contents = journey.storyIds.map((id, index) => {
    const story = storyById[id];
    const previous = index ? storyById[journey.storyIds[index - 1]] : null;
    const bridge = previous ? `<li class="journey-bridge"><span>${t(lang, 'The story continues', 'कथा आगे बढ़ती है')}</span><p>${t(lang, `${previous.title.en} leads into ${story.title.en}. The next chapter carries forward the consequence, question or search left open here.`, `${previous.title.hi} से ${story.title.hi} की कड़ी बनती है। अगला अध्याय यहीं खुले परिणाम, प्रश्न या खोज को आगे ले जाता है।`)}</p></li>` : '';
    return `${bridge}<li class="journey-chapter ${story.editionOnly&&!illustratedRelease?'journey-chapter-draft':''}"><a href="${journeyLink(story.id, lang, journey.id)}">${picture(story, lang, {decorative: true})}<span>${String(index + 1).padStart(2, '0')}</span><div><small>${esc(pick(story.book, lang))} · ${t(lang, 'Sarga', 'सर्ग')} ${story.sarga}${story.editionOnly&&!illustratedRelease?` · ${t(lang,'NEW DRAFT','नया प्रारूप')}`:''}</small><h3>${esc(pick(story.title, lang))}</h3><p>${esc(pick(story.dek, lang))}</p></div>${arrow}</a></li>`;
  }).join('');
  return `<main id="main" class="journey-page">
    ${editionRibbon(lang)}
    <header class="journey-cover wrap"><a class="text-link detail-back" href="${href(lang, '/library/')}">← ${t(lang, 'Story index', 'कथा-सूची')}</a><div class="journey-cover-grid"><div><p class="eyebrow">${t(lang, 'GUIDED READING JOURNEY', 'मार्गदर्शित पठन-पथ')}</p><h1>${esc(pick(journey.title, lang))}</h1><p class="lead">${esc(pick(journey.description, lang))}</p><div class="detail-actions"><a class="button" href="${journeyLink(first.id, lang, journey.id)}">${t(lang, 'Begin the journey', 'यात्रा आरंभ करें')}${book}</a><span>${journey.storyIds.length} ${t(lang, 'stories · explicit ending', 'कथाएँ · स्पष्ट अंत')}</span></div></div>${picture(first, lang, {priority: true})}</div></header>
    <section class="wrap journey-contents" aria-labelledby="journey-contents-title"><div class="section-heading split"><div><p class="eyebrow">${t(lang, 'CONTENTS', 'विषय-सूची')}</p><h2 id="journey-contents-title">${t(lang, 'One continuous abridged storyline', 'एक सतत संक्षिप्त कथा')}</h2></div><p>${t(lang, 'Every chapter explains what caused the next. This edition reaches the return in Yuddha Kanda; it does not claim every sarga or Uttara Kanda.', 'हर अध्याय बताता है कि अगला क्यों आता है। यह संस्करण युद्धकाण्ड की वापसी तक है; हर सर्ग या उत्तरकाण्ड का दावा नहीं करता।')}</p></div><ol>${contents}</ol><aside class="journey-end-preview"><span>✦</span><div><p class="eyebrow">${t(lang, 'AT THE END', 'अंत में')}</p><h2>${t(lang, 'The journey stops. It does not loop.', 'यात्रा रुकती है। फिर आरंभ पर नहीं लौटती।')}</h2><p>${t(lang, 'Choose another journey, revisit a saved place, or close the edition.', 'दूसरा पथ चुनें, सहेजे स्थान पर लौटें या संस्करण बंद करें।')}</p></div></aside></section>
  </main>${clientData('journey', lang, {journeyId: journey.id})}`;
}

export function illustratedDetail(story, lang) {
  const inJourneys = Object.values(journeys).filter(journey => journey.storyIds.includes(story.id));
  const journeyOptions = inJourneys.map(journey => `<a href="${journeyLink(story.id, lang, journey.id)}"><strong>${esc(pick(journey.shortTitle, lang))}</strong><span>${journey.storyIds.indexOf(story.id) + 1} / ${journey.storyIds.length}</span>${arrow}</a>`).join('');
  return `<main id="main" class="story-detail illustrated-detail">
    ${editionRibbon(lang)}
    <section class="detail-hero"><div class="wrap illustrated-detail-grid">
      <div><a class="text-link detail-back" href="${href(lang, '/library/')}">← ${t(lang, 'All twenty-two chapters', 'सभी बाईस अध्याय')}</a><p class="eyebrow">${esc(pick(story.book, lang))} · ${t(lang, 'Sarga', 'सर्ग')} ${story.sarga}</p><h1>${esc(pick(story.title, lang))}</h1><p class="detail-dek">${esc(pick(story.dek, lang))}</p><div class="detail-meta"><span>${t(lang,'About','लगभग')} ${story.durationByLanguage?.[lang]??story.duration} ${t(lang, 'minute read', 'मिनट का पाठ')}</span><span>${story.scenes.length} ${t(lang, 'scenes', 'दृश्य')}</span><span>${t(lang, 'English & हिन्दी', 'English और हिन्दी')}</span></div><div class="detail-actions"><a class="button" href="${journeyLink(story.id, lang, 'ramayana')}">${t(lang, 'Read in source order', 'स्रोत-क्रम में पढ़ें')}${book}</a><button class="button outline" type="button" data-save-story="${story.id}">${bookmark}<span>${t(lang, 'Save for later', 'बाद के लिए सहेजें')}</span></button></div><p class="local-note">${illustratedRelease?publicationScopeNote(lang):(story.editionOnly?t(lang,'New bilingual chapter and painting · local editorial review only.','नया द्विभाषी अध्याय और चित्र · केवल स्थानीय संपादकीय समीक्षा।'):t(lang, 'Existing reviewed public retelling; new art and edition framing await exact-version review.', 'मौजूदा समीक्षित सार्वजनिक पुनर्कथन; नया चित्र और संस्करण-रूप सटीक-संस्करण समीक्षा की प्रतीक्षा में।'))}</p></div>
      <figure class="detail-art">${picture(story, lang, {priority: true})}<figcaption><span>${String(story.order).padStart(2, '0')} / ${stories.length}</span><strong>${esc(pick(storyArt[story.id].alt, lang))}</strong></figcaption></figure>
    </div></section>
    <section class="wrap detail-body"><div class="detail-main">
      <section><p class="eyebrow">${t(lang, 'BEFORE YOU READ', 'पढ़ने से पहले')}</p><h2>${t(lang, 'What this retelling does', 'यह पुनर्कथन क्या करता है')}</h2><p>${esc(pick(story.description, lang))}</p><p>${esc(pick(story.editorial.note, lang))}</p></section>
      <section><p class="eyebrow">${t(lang, 'STORY MAP', 'कथा मानचित्र')}</p><h2>${t(lang, 'Choose a turning point', 'एक मोड़ चुनें')}</h2><ol class="scene-map">${story.scenes.map((scene, index) => `<li><a href="${journeyLink(story.id, lang, 'ramayana')}#scene-${scene.id}"><span>${String(index + 1).padStart(2, '0')}</span><strong>${esc(pick(scene.title, lang))}</strong>${arrow}</a></li>`).join('')}</ol></section>
      <section><p class="eyebrow">${t(lang, 'READ IT IN A JOURNEY', 'पठन-पथ में पढ़ें')}</p><div class="story-journey-options">${journeyOptions}</div></section>
      <aside class="reflection-preview"><span>${t(lang, 'REFLECTION · NOT SOURCE TEXT', 'मनन · स्रोत-पाठ नहीं')}</span><p>${esc(pick(story.reflection, lang))}</p></aside>
      ${sankalpaCard(story,lang)}
    </div><div class="detail-side">${sourceMap(story, lang)}<section class="people-list"><h2>${t(lang, 'People in this story', 'इस कथा के पात्र')}</h2>${story.characters.map(id => `<a href="${href(lang, `/characters/${id}/`)}"><strong>${esc(pick(characters[id].name, lang))}</strong><span>${pick(characters[id].aliases, lang).map(esc).join(' · ')}</span>${arrow}</a>`).join('')}</section></div></section>
  </main>${clientData('detail', lang, {story})}`;
}

function readerDialogs(lang) {
  return `<dialog id="reader-settings" class="reading-sheet"><form method="dialog" class="sheet-head"><div><span class="eyebrow">${t(lang, 'READING SETTINGS', 'पठन सेटिंग')}</span><h2>${t(lang, 'Make the page comfortable.', 'पृष्ठ को सहज बनाएँ।')}</h2></div><button class="sheet-close" aria-label="${t(lang, 'Close settings', 'सेटिंग बंद करें')}">×</button></form><div class="sheet-body">
    <fieldset><legend>${t(lang, 'Text size', 'अक्षर आकार')}</legend><div class="segmented size-options">${[18, 20, 22, 24, 28].map(size => `<button type="button" data-reader-size="${size}" aria-pressed="${size === 20}">${size}</button>`).join('')}</div></fieldset>
    <fieldset><legend>${t(lang, 'Reading appearance', 'पठन रूप')}</legend><div class="theme-options"><button type="button" data-reader-theme="light" aria-pressed="true"><span></span>${t(lang, 'Light', 'हल्का')}</button><button type="button" data-reader-theme="sepia" aria-pressed="false"><span></span>${t(lang, 'Sepia', 'सेपिया')}</button><button type="button" data-reader-theme="dark" aria-pressed="false"><span></span>${t(lang, 'Dark', 'गहरा')}</button></div></fieldset>
    <fieldset class="parallel-setting"><legend>${t(lang, 'Parallel reading', 'समानांतर पठन')}</legend><button type="button" class="button outline" id="parallel-toggle" aria-pressed="false">${t(lang, 'Show English + हिन्दी', 'English + हिन्दी दिखाएँ')}</button><p>${t(lang, 'Available on comfortable wide screens; phones remain one language.', 'सहज चौड़ी स्क्रीन पर उपलब्ध; फ़ोन पर एक ही भाषा रहती है।')}</p></fieldset>
    <p id="reader-settings-status" class="settings-status" role="status" aria-live="polite"></p>
  </div></dialog>
  <dialog id="context-sheet" class="reading-sheet context-sheet"><form method="dialog" class="sheet-head"><div><span class="eyebrow" id="context-kind"></span><h2 id="context-title"></h2></div><button class="sheet-close" aria-label="${t(lang, 'Close information', 'जानकारी बंद करें')}">×</button></form><div class="sheet-body"><p id="context-copy"></p><p id="context-source" class="fine"></p><a id="context-link" class="text-link" hidden>${t(lang, 'Open full page', 'पूरा पृष्ठ खोलें')}${arrow}</a></div></dialog>
  <dialog id="plate-viewer" class="plate-viewer"><button type="button" class="sheet-close" data-plate-close aria-label="${t(lang, 'Close illustration', 'चित्र बंद करें')}">×</button><img alt=""/><p></p></dialog>`;
}

function pairedBlock(block, lang) {
  const alternate = lang === 'hi' ? 'en' : 'hi';
  return `<div class="parallel-block" id="block-${block.id}" data-block-id="${block.id}">
    <p class="primary-language" lang="${lang}">${esc(pick(block.text, lang))}</p>
    <p class="parallel-language" lang="${alternate}" aria-hidden="true">${esc(pick(block.text, alternate))}</p>
  </div>`;
}

function readerJourneyRail(story, lang) {
  const options = Object.values(journeys).filter(journey => journey.storyIds.includes(story.id));
  return `<aside class="reader-volume illustrated-volume" aria-label="${t(lang, 'Reading journey', 'पठन यात्रा')}">

    <div class="reader-volume-copy"><p class="eyebrow">${t(lang, 'ILLUSTRATED READING ROOM', 'चित्रित पठन कक्ष')}</p><p>${t(lang, 'The journey context controls what follows this story. It never changes the source order.', 'पठन-पथ यह तय करता है कि इस कथा के बाद क्या आएगा। यह स्रोत-क्रम नहीं बदलता।')}</p>
      <nav class="reader-journey-picker" aria-label="${t(lang, 'Choose journey', 'पठन-पथ चुनें')}">${options.map(journey => `<a data-journey-choice="${journey.id}" href="${journeyLink(story.id, lang, journey.id)}"><strong>${esc(pick(journey.shortTitle, lang))}</strong><span>${journey.storyIds.indexOf(story.id) + 1}/${journey.storyIds.length}</span></a>`).join('')}</nav>
      <nav class="reader-journey" aria-label="${t(lang, 'Story turning points', 'कथा के मोड़')}">${story.scenes.map((scene, index) => `<a href="#scene-${scene.id}" data-reader-scene="${scene.id}" ${index === 0 ? 'aria-current="step"' : ''}><span>${String(index + 1).padStart(2, '0')}</span><strong>${esc(pick(scene.title, lang))}</strong></a>`).join('')}<a href="#story-reflection"><span>✦</span><strong>${t(lang, 'Reflection', 'मनन')}</strong></a><a href="#story-source"><span>§</span><strong>${t(lang, 'Source map', 'स्रोत मानचित्र')}</strong></a></nav>
    </div>
  </aside>`;
}

function continuation(story, lang) {
  const defaultPosition = journeyForStory(story.id, 'ramayana');
  const next = defaultPosition.next ? storyById[defaultPosition.next] : null;
  return `<nav class="reader-next-story" data-journey-continuation aria-label="${t(lang, 'Journey continuation', 'पठन-पथ की अगली कड़ी')}">
    <div data-journey-progress><span>${t(lang, 'SOURCE-ORDER JOURNEY', 'स्रोत-क्रम पठन-पथ')}</span><small>${story.order} / ${journeys.ramayana.storyIds.length}</small></div>
    ${next ? `<a data-journey-next href="${journeyLink(next.id, lang, 'ramayana')}"><span>${t(lang, 'Continue when you are ready', 'जब तैयार हों, आगे बढ़ें')}</span><strong>${esc(pick(next.title, lang))}</strong>${arrow}</a>` : `<div class="journey-finished" data-journey-end><span>✦</span><strong>${t(lang, 'This journey is complete.', 'यह पठन-पथ पूरा हुआ।')}</strong><p>${t(lang, 'Choose another journey, return to Saved, or close the edition. The story does not loop to the beginning.', 'दूसरा पथ चुनें, सहेजे स्थान पर लौटें या संस्करण बंद करें। कथा आरंभ पर नहीं लौटती।')}</p><a class="button outline" href="${href(lang, '/library/')}">${t(lang, 'Choose another journey', 'दूसरा पथ चुनें')}${arrow}</a></div>`}
  </nav>`;
}

export function illustratedReader(story, lang) {
  const art = storyArt[story.id];
  const language = `<nav class="reader-language" aria-label="${t(lang, 'Story language', 'कथा की भाषा')}">${lang === 'hi' ? `<a class="language" href="/read/${story.id}/" lang="en">EN</a><span aria-current="true" lang="hi">हिन्दी</span>` : `<span aria-current="true" lang="en">EN</span><a class="language" href="/hi/read/${story.id}/" lang="hi">हिन्दी</a>`}</nav>`;
  const contents = `<details class="reader-contents"><summary>${t(lang, 'Contents', 'विषय-सूची')}</summary><nav aria-label="${t(lang, 'Story contents', 'कथा विषय-सूची')}">${story.scenes.map((scene, index) => `<a href="#scene-${scene.id}"><span>${String(index + 1).padStart(2, '0')}</span>${esc(pick(scene.title, lang))}</a>`).join('')}<a href="#story-reflection">${t(lang, 'Reflection', 'मनन')}</a><a href="#story-sankalpa">${t(lang, 'Today’s Sankalpa', 'आज का संकल्प')}</a><a href="#story-source">${t(lang, 'Source map', 'स्रोत मानचित्र')}</a></nav></details>`;
  const scenes = story.scenes.map((scene, index) => {
    const plates = art.scenes.filter(item => item.after === index).map(item => plate(item.file, item.alt, lang)).join('');
    return `<section class="reader-scene" id="scene-${scene.id}" data-scene-id="${scene.id}"><div class="scene-heading"><span>${String(index + 1).padStart(2, '0')}</span><h2>${esc(pick(scene.title, lang))}</h2></div>${scene.blocks.map(block => pairedBlock(block, lang)).join('')}${plates}<aside class="scene-context" aria-label="${t(lang, 'People and words in this scene', 'इस दृश्य के पात्र और शब्द')}"><div>${scene.people.map(id => `<button type="button" data-character="${id}">${esc(pick(characters[id].name, lang))}</button>`).join('')}</div><div>${scene.terms.map(id => `<button type="button" data-glossary="${id}">${esc(pick(glossary[id].term, lang))}</button>`).join('')}</div></aside></section>`;
  }).join('');
  return `<main id="main" class="story-reader illustrated-reader" data-story-id="${story.id}" data-content-revision="${CONTENT_REVISION}" data-reader-theme="light" style="--reader-size:20px">
    ${editionRibbon(lang)}<div class="reader-progress" aria-hidden="true"><span id="reader-progress-bar"></span></div>
    <header class="reader-chrome"><a class="reader-back" href="${href(lang, `/story/${story.id}/`)}" aria-label="${t(lang, 'Back to story overview', 'कथा परिचय पर लौटें')}">← <span>${t(lang, 'Back', 'वापस')}</span></a><div class="reader-location"><span>${esc(pick(story.book, lang))}</span><strong>${esc(pick(story.title, lang))}</strong></div>${language}${contents}${lotusNav(lang)}<button id="bookmark-place" type="button" aria-pressed="false">${bookmark}<span>${t(lang, 'Save place', 'स्थान सहेजें')}</span></button><button id="reader-settings-open" type="button">${settings}<span>${t(lang, 'Reading settings', 'पठन सेटिंग')}</span></button></header>
    <div class="reader-stage">${readerJourneyRail(story, lang)}<article class="reader-column">
      ${readerBanner(story,lang,picture,{edition:true})}<header class="reader-title illustrated-reader-title"><div><span class="draft-badge">${illustratedRelease?(story.editionOnly?t(lang,'Original abridged chapter · source-mapped','मौलिक संक्षिप्त अध्याय · स्रोत-मानचित्रित'):t(lang,'Original retelling · source-mapped','मौलिक पुनर्कथन · स्रोत-मानचित्रित')):(story.editionOnly?t(lang,'New chapter · local review only','नया अध्याय · केवल स्थानीय समीक्षा'):t(lang,'Existing retelling · new art local review only','मौजूदा पुनर्कथन · नया चित्र केवल स्थानीय समीक्षा'))}</span><p class="eyebrow">${esc(pick(story.book, lang))} · ${t(lang, 'Sarga', 'सर्ग')} ${story.sarga}</p><h1>${esc(pick(story.title, lang))}</h1><p>${esc(pick(story.dek, lang))}</p><div><span>${t(lang,'About','लगभग')} ${story.durationByLanguage?.[lang]??story.duration} ${t(lang, 'min', 'मिनट')}</span><span>${story.scenes.length} ${t(lang, 'scenes', 'दृश्य')}</span></div></div></header>
      ${scenes}
      <aside class="reader-reflection" id="story-reflection"><span>${t(lang, 'REFLECTION · NOT SOURCE TEXT', 'मनन · स्रोत-पाठ नहीं')}</span><p>${esc(pick(story.reflection, lang))}</p></aside>
      ${sankalpaCard(story,lang)}
      <details class="reader-source" id="story-source" open><summary>${sourceIcon}<span><strong>${t(lang, 'Source & editorial context', 'स्रोत और संपादकीय संदर्भ')}</strong><small>${esc(story.source.locator)}</small></span></summary><div>${sourceMap(story, lang)}<p><strong>${t(lang, 'Retelling note:', 'पुनर्कथन संकेत:')}</strong> ${esc(pick(story.editorial.note, lang))}</p></div></details>
      ${continuation(story, lang)}
    </article></div>
  </main>${readerDialogs(lang)}${clientData('reader', lang, {story})}`;
}
