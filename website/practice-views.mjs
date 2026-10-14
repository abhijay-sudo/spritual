import {ANCHOR_IDS, practiceById, practiceForStory} from './practice-data.mjs';
const t = (lang,en,hi) => lang === 'hi' ? hi : en;
const pick = (value,lang) => value[lang] || value.en;
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const url = (lang,path) => `${lang === 'hi' ? '/hi' : ''}${path}`;
export const diya = '<svg viewBox="0 0 40 40" aria-hidden="true" class="diya-icon"><path d="M20 4c2 6 7 9 5 14-1 5-9 5-10 0-2-5 3-8 5-14Z" fill="currentColor"/><path d="M5 25h30c-3 12-27 12-30 0Z" fill="currentColor"/><path d="M5 24c8-4 22-4 30 0" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
export function lotusSvg() {
  return `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true" class="practice-flower">${ANCHOR_IDS.map((id,i) => `<path data-practice-petal="${id}" d="M32 31C20 22 23 9 32 3c9 6 12 19 0 28Z" transform="rotate(${i*36} 32 32)"/>`).join('')}<circle cx="32" cy="32" r="5"/></svg>`;
}
export function lotusNav(lang) {
  return `<a class="practice-lotus" href="${url(lang,'/#dharma-yatra')}" data-practice-lotus aria-label="${t(lang,'Lotus of Practice — open your Dharma Yatra','अभ्यास का कमल — अपनी धर्म यात्रा खोलें')}" title="${t(lang,'Lotus of Practice','अभ्यास का कमल')}">${lotusSvg()}</a>`;
}
export function sankalpaCard(story,lang) {
  const practice = practiceForStory(story.id);
  if (!practice) return '';
  return `<section class="sankalpa-card" id="story-sankalpa" data-sankalpa="${practice.id}" aria-labelledby="sankalpa-title">
    <div class="sankalpa-ripple" aria-hidden="true"></div>
    <p class="sankalpa-label">${t(lang,'TODAY’S SANKALPA · LIVE THE STORY','आज का संकल्प · कथा को जीवन में उतारें')}</p>
    <h2 id="sankalpa-title">${esc(pick(practice.title,lang))}</h2>
    <p class="sankalpa-action">${esc(pick(practice.action,lang))}</p>
    <p class="sankalpa-time">${t(lang,'A two-minute practice, whenever it fits.','दो मिनट का अभ्यास, जब आपके लिए सहज हो।')}</p>
    ${practice.id !== story.id ? `<p class="sankalpa-shared">${t(lang,'An invitation shared with the next Yatra milestone.','अगले यात्रा-पड़ाव के साथ साझा अभ्यास का निमंत्रण।')}</p>` : ''}
    <div data-seal-controls class="sankalpa-seal-controls" hidden>
      <button type="button" class="sankalpa-hold" data-sankalpa-hold aria-label="${t(lang,'Press and hold for 2 seconds to seal your Sankalpa','अपना संकल्प सहेजने के लिए दो सेकंड दबाए रखें')}" aria-describedby="sankalpa-hold-help">
        <svg class="seal-ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="45"/><circle class="seal-ring-fill" cx="50" cy="50" r="45" pathLength="1"/></svg>${lotusSvg()}
      </button>
      <p id="sankalpa-hold-help">${t(lang,'Hold for 2 seconds to seal your intention. Release to cancel.','संकल्प सहेजने के लिए दो सेकंड दबाएँ। रद्द करने के लिए छोड़ दें।')}</p>
      <button class="text-button" type="button" data-sankalpa-seal>${t(lang,'Seal with one tap','एक टैप से संकल्प सहेजें')}</button>
    </div>
    <div class="sankalpa-saved" data-sankalpa-saved hidden><span class="sankalpa-saved-icon" aria-hidden="true">${lotusSvg()}</span><strong data-sankalpa-saved-label></strong><button class="button" type="button" data-sankalpa-try>${t(lang,'I tried it','मैंने अभ्यास किया')}</button><button class="text-button" type="button" data-sankalpa-clear>${t(lang,'Release this intention','यह संकल्प हटाएँ')}</button></div>
    <p class="sankalpa-note">${t(lang,'A petal marks an intention. Choose “I tried it” after practising. Your petals stay, even when you take a break.','एक पंखुड़ी संकल्प का संकेत है। अभ्यास करने के बाद “मैंने अभ्यास किया” चुनें। विराम लेने पर भी पंखुड़ियाँ बनी रहती हैं।')}</p>
    <p class="sankalpa-storage-note">${t(lang,'Kept only in this browser.','केवल इस ब्राउज़र में सहेजा जाता है।')}</p>
    <p class="sankalpa-status" data-sankalpa-status role="status" aria-live="polite"></p><button type="button" class="text-button" data-sankalpa-undo hidden>${t(lang,'Undo','वापस लें')}</button>
    <a class="sankalpa-return text-link" href="${url(lang,'/#dharma-yatra')}">${t(lang,'Return to Dharma Yatra','धर्म यात्रा पर लौटें')} <span aria-hidden="true">→</span></a>
    <noscript><p>${t(lang,'You can practise this invitation without saving it. Enable JavaScript to keep a petal on this browser.','आप इसे सहेजे बिना भी अपना सकते हैं। इस ब्राउज़र में पंखुड़ी रखने के लिए JavaScript चालू करें।')}</p></noscript>
  </section>`;
}

export function dharmaYatra(stories,lang,{picture = () => '',edition = false} = {}) {
  const anchors = ANCHOR_IDS.map(id => stories.find(story => story.id === id)).filter(Boolean);
  return `<section id="dharma-yatra" class="wrap dharma-yatra" aria-labelledby="dharma-yatra-title">
    <header class="yatra-heading"><h2 id="dharma-yatra-title">${t(lang,'Dharma Yatra','धर्म यात्रा')}</h2><p>${t(lang,'Ten stories. One thread. Your own pace.','दस कथाएँ। एक सूत्र। अपनी गति।')}</p><p class="yatra-invitation">${t(lang,'Follow the Ramayana from its opening question to the return of light. Read ahead whenever you wish.','रामायण के आरंभिक प्रश्न से प्रकाश की वापसी तक चलें। चाहें तो किसी भी पड़ाव से पढ़ें।')}</p></header>
    <p class="yatra-storage" data-yatra-storage hidden role="status"></p>
    <div class="yatra-path" data-yatra-path><svg class="yatra-thread" viewBox="0 0 8 100" preserveAspectRatio="none" aria-hidden="true"><path d="M4 0V100" pathLength="1"/><path class="yatra-thread-fill" d="M4 0V100" pathLength="1"/></svg>
      <ol class="yatra-milestones">${anchors.map((story,index) => {
        const next = anchors[index+1];
        const bridges = next ? stories.slice(stories.indexOf(story)+1,stories.indexOf(next)) : [];
        const title = index === 9 ? t(lang,'The Return of Light','प्रकाश की वापसी') : pick(story.title,lang);
        return `<li class="yatra-milestone" data-yatra-id="${story.id}" data-state="${index === 0 ? 'current' : 'upcoming'}">
          <span class="yatra-marker" aria-hidden="true"><span class="yatra-number">${String(index+1).padStart(2,'0')}</span>${diya}</span>
          <a class="yatra-card" href="${url(lang,`/story/${story.id}/`)}" ${index === 0 ? 'aria-current="step"' : ''}>
            <div class="yatra-copy"><span class="yatra-state" data-yatra-state>${index === 0 ? t(lang,'Your next step','अगला पड़ाव') : t(lang,'Read ahead','आगे पढ़ें')}</span><h3>${esc(title)}</h3>
            <div class="yatra-meta"><span>${esc(pick(story.book,lang))}</span><span>${t(lang,'Sarga','सर्ग')} ${story.sarga}</span><span class="yatra-time">${t(lang,'About','लगभग')} ${story.durationByLanguage?.[lang]??story.duration} ${t(lang,'min read','मिनट का पाठ')}</span></div>
            <p class="yatra-dek">${esc(pick(story.dek,lang))}</p><span class="yatra-virtue">${t(lang,'Virtue','गुण')}: ${esc(pick(practiceById[story.id].virtue || {en:['Curiosity','Self-control','Courage','Friendship','Responsibility','Hospitality','Communication','Persistence','Hope','Service'][index],hi:['जिज्ञासा','संयम','साहस','मित्रता','उत्तरदायित्व','आतिथ्य','संवाद','दृढ़ता','आशा','सेवा'][index]},lang))}</span>
            <span class="yatra-practice-badge" data-yatra-badge hidden></span><span class="yatra-read">${t(lang,'Meet this story','इस कथा से मिलें')} <span aria-hidden="true">→</span></span>
            </div><div class="yatra-art">${picture(story,lang,{decorative:true})}</div>
          </a>
          ${bridges.length ? `<details class="yatra-bridges"><summary>${t(lang,'Between these milestones','इन पड़ावों के बीच')} · ${bridges.length} ${t(lang,bridges.length === 1 ? 'chapter' : 'chapters','अध्याय')}</summary><ol>${bridges.map(bridge => `<li><a href="${url(lang,`/read/${bridge.id}/`)}?journey=ramayana"><span>${esc(pick(bridge.title,lang))}</span><small>${esc(pick(bridge.book,lang))} · ${t(lang,'Sarga','सर्ग')} ${bridge.sarga}</small></a></li>`).join('')}</ol></details>` : ''}
        </li>`;
      }).join('')}</ol>
    </div>
    <div class="yatra-finished" data-yatra-finished hidden>${lotusSvg()}<h3>${t(lang,'Your lotus has room for return.','आपके कमल में लौटने की जगह है।')}</h3><p>${t(lang,'You have tried each invitation. Revisit any story or take a pause; every petal stays.','आपने हर निमंत्रण को आज़माया है। कोई भी कथा फिर पढ़ें या विराम लें; हर पंखुड़ी बनी रहेगी।')}</p></div>
    ${edition ? `<a class="text-link yatra-full-edition" href="${url(lang,'/journeys/ramayana/')}">${t(lang,'Read the full 22-chapter journey','पूरी 22-अध्याय यात्रा पढ़ें')} <span aria-hidden="true">→</span></a>` : ''}
  </section>`;
}
