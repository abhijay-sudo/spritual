import {practiceForStory} from './practice-data.mjs';

const t=(lang,en,hi)=>lang==='hi'?hi:en;
const pick=(value,lang)=>value[lang]||value.en;
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const href=(lang,path)=>`${lang==='hi'?'/hi':''}${path}`;
const arrow='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="M4 12h16m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const lotus='<svg viewBox="0 0 64 64" aria-hidden="true" fill="none"><path d="M32 51C15 40 22 21 32 12c10 9 17 28 0 39ZM30 51C12 53 7 39 10 29c12 1 20 9 20 22Zm4 0c18 2 23-12 20-22-12 1-20 9-20 22Z" stroke="currentColor" stroke-width="1.2"/></svg>';
const diya='<svg class="diya-icon" viewBox="0 0 40 40" aria-hidden="true"><path class="diya-flame" d="M20 4c2 6 7 9 5 14-1 5-9 5-10 0-2-5 3-8 5-14Z"/><path d="M5 25h30c-3 12-27 12-30 0Z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
const themes=[['neutral','○','Still','शांत'],['epic','क','Epic','महाकाव्य'],['rama','रा','Rama','राम'],['krishna','कृ','Krishna','कृष्ण'],['hanuman','ह','Hanuman','हनुमान'],['shiva','शि','Shiva','शिव']];
export function themeStrip(lang,path='/'){
 return `<nav class="arrival-themes world-options" aria-label="${t(lang,'Choose your atmosphere','अपना वातावरण चुनें')}">${themes.map(([id,mark,en,hi])=>`<a href="${href(lang,path)}?world=${id}" data-world-option="${id}"><span aria-hidden="true">${mark}</span>${t(lang,en,hi)}</a>`).join('')}</nav>`;
}

export function arrivalHero(stories,lang,{picture,edition=false}){
 const first=stories[0],count=stories.length;
 return `<section class="arrival-section wrap" aria-labelledby="arrival-title" data-arrival data-edition="${edition}">
  ${themeStrip(lang)}
  <div class="arrival-grid">
   <div class="arrival-card">
    <div data-arrival-threshold>
     <p class="eyebrow">${t(lang,'PAUSE AT THE THRESHOLD','प्रवेश से पहले ठहरें')}</p>
     <h1 id="arrival-title">${t(lang,'Before the stories, take one quiet breath.','कथाओं से पहले, एक शांत साँस लें।')}</h1>
     <p class="arrival-intro">${t(lang,'You do not need to read everything today. Choose your atmosphere and enter one story.','आज सब कुछ पढ़ना ज़रूरी नहीं। अपना वातावरण चुनें और एक कथा में प्रवेश करें।')}</p>
     <div class="threshold-breath" data-threshold-breath><button class="threshold-ring" type="button" data-breath-start aria-label="${t(lang,'Take one gentle breath, eight seconds','एक सहज साँस लें, आठ सेकंड')}">${lotus}</button><div><p data-breath-cue role="status">${t(lang,'One gentle breath · 8 seconds','एक सहज साँस · 8 सेकंड')}</p><button type="button" class="text-button" data-breath-cancel hidden>${t(lang,'Stop breathing guide','श्वास-संकेत रोकें')}</button></div></div>
     <a class="button arrival-enter" data-settled-enter href="${href(lang,`/read/${first.id}/`)}?journey=ramayana">${t(lang,'Enter story 01','कथा 01 में प्रवेश करें')}${arrow}</a>
     <a class="text-link arrival-explore" href="#dharma-yatra">${t(lang,`Explore all ${count} ${edition?'chapters':'stories'}`,`सभी ${count} ${edition?'अध्याय':'कथाएँ'} देखें`)} <span aria-hidden="true">↓</span></a>
     <button class="text-button arrival-show-path" data-show-path type="button" hidden>${t(lang,'Show my next step','मेरा अगला पड़ाव दिखाएँ')}</button>
    </div>
    <div data-arrival-active hidden>
     <p class="eyebrow">${edition?t(lang,'22 CHAPTERS · A LOCAL-REVIEW PATH','22 अध्याय · स्थानीय समीक्षा का पथ'):t(lang,'TEN SELECTED STORIES · YOUR OWN PACE','दस चुनी कथाएँ · अपनी गति')}</p>
     <h2>${t(lang,'Walk the path home, one story at a time.','घर लौटने का पथ, एक-एक कथा के साथ।')}</h2>
     <div class="arrival-spotlight" data-current-spotlight><div class="arrival-thumb" data-current-art>${picture(first,lang,{decorative:true})}</div><div><p data-current-index>${t(lang,`Story 01 of ${count}`,`${count} में कथा 01`)}</p><h3 data-current-title>${esc(pick(first.title,lang))}</h3><p data-current-meta>${esc(pick(first.book,lang))} · ${t(lang,'About','लगभग')} ${first.durationByLanguage?.[lang]??first.duration} ${t(lang,'min','मिनट')}</p></div></div>
     <p class="arrival-habit"><span>${t(lang,'A small practice','एक छोटा अभ्यास')}</span><strong data-current-practice>${esc(pick(practiceForStory(first.id).title,lang))}</strong></p>
     <a class="button arrival-enter" data-current-read href="${href(lang,`/read/${first.id}/`)}?journey=ramayana">${t(lang,'Read story 01','कथा 01 पढ़ें')}${arrow}</a>
     <button class="text-button" type="button" data-settle-again>${t(lang,'Take a quiet breath','एक शांत साँस लें')}</button>
     <a class="text-link arrival-explore" href="#dharma-yatra">${t(lang,'Explore the path','पथ देखें')} <span aria-hidden="true">↓</span></a>
    </div>
   </div>
   <figure class="arrival-art"><img data-context-art data-theme-showcase src="/assets/collection-ramayana.webp" srcset="/assets/collection-ramayana-sm.webp 560w, /assets/collection-ramayana.webp 1120w" sizes="(max-width:979px) calc(100vw - 40px), (max-width:1280px) 57vw, 682px" width="1120" height="1400" fetchpriority="high" alt="${t(lang,'A painted river and forest path at dawn, with a bow beside the path.','भोर में नदी और वन-पथ का चित्र, पथ के पास रखा धनुष।')}"/><figcaption><span>${t(lang,'A LIVING MANUSCRIPT · VALMIKI RAMAYANA','एक जीवंत पाण्डुलिपि · वाल्मीकि रामायण')}</span><strong data-context-caption>${t(lang,'Stillness before the next step.','अगले कदम से पहले ठहराव।')}</strong><a class="arrival-art-entry" data-art-enter href="${href(lang,`/read/${first.id}/`)}?journey=ramayana">${t(lang,'Enter story 01 →','कथा 01 में प्रवेश करें →')}</a></figcaption><button class="art-motion-toggle" type="button" data-art-motion aria-pressed="false" aria-label="${t(lang,'Pause gentle artwork motion','चित्र की हल्की गति रोकें')}">${t(lang,'Pause motion','गति रोकें')}</button></figure>
  </div>
  <p class="arrival-note">${edition?t(lang,'22 chapters · local review only · your exact place stays on this device','22 अध्याय · केवल स्थानीय समीक्षा · आपका सही स्थान इसी डिवाइस पर रहता है'):t(lang,'Ten selected Ramayana retellings · English & हिन्दी · no account needed','रामायण के दस चुने पुनर्कथन · English और हिन्दी · खाते की ज़रूरत नहीं')}</p>
 </section>`;
}

function compactPractice(story,lang){
 const practice=practiceForStory(story.id),label=`practice-${story.id}`;
 return `<section class="chapter-practice" data-sankalpa="${story.id}" data-hold-ms="1500" aria-labelledby="${label}">
  <p class="eyebrow" id="${label}">${t(lang,'TODAY’S GOOD HABIT','आज का अच्छा अभ्यास')}</p><h4>${esc(pick(practice.title,lang))}</h4><p class="chapter-practice-action">${esc(pick(practice.action,lang))}</p>
  <div data-seal-controls hidden class="chapter-seal-controls"><button class="button outline" type="button" data-sankalpa-seal>${t(lang,'Choose this intention','यह संकल्प चुनें')}</button><button class="sankalpa-hold chapter-hold" data-sankalpa-hold type="button" aria-label="${t(lang,'Or hold for 1.5 seconds to choose; release to cancel','या चुनने के लिए डेढ़ सेकंड दबाएँ; रद्द करने के लिए छोड़ें')}"><svg class="seal-ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="45"/><circle class="seal-ring-fill" cx="50" cy="50" r="45" pathLength="1"/></svg>${lotus}</button></div>
  <div data-sankalpa-saved hidden class="chapter-practice-saved"><strong data-sankalpa-saved-label></strong><button class="button outline" type="button" data-sankalpa-try>${t(lang,'I tried it','मैंने अभ्यास किया')}</button><button class="text-button" type="button" data-sankalpa-clear>${t(lang,'Release intention','संकल्प हटाएँ')}</button></div>
  <p data-sankalpa-status role="status" class="sankalpa-status"></p><button class="text-button" type="button" data-sankalpa-undo hidden>${t(lang,'Undo','वापस लें')}</button>
 </section>`;
}

export function illustratedPath(stories,lang,{picture,edition=false}){
 const groups=[...new Set(stories.map(s=>s.book.en))].map((name,index)=>({id:name.toLowerCase().replaceAll(' ','-'),name,index,stories:stories.filter(s=>s.book.en===name)}));
 const count=stories.length;
 return `<section id="dharma-yatra" class="wrap dharma-yatra illustrated-path" aria-labelledby="dharma-yatra-title">
  <header class="yatra-heading"><div><p class="eyebrow">${t(lang,'A PATH THROUGH THE RAMAYANA','रामायण का एक पथ')}</p><h2 id="dharma-yatra-title">${t(lang,'Dharma Yatra','धर्म यात्रा')}</h2></div><p>${edition?t(lang,'Twenty-two chapters. One abridged path.','बाईस अध्याय। एक संक्षिप्त पथ।'):t(lang,'Ten selected stories. Your own pace.','दस चुनी कथाएँ। अपनी गति।')}</p></header>
  <p class="yatra-scope">${edition?t(lang,'Local-review edition, through Rama’s return; not every sarga or the Uttara Kanda.','स्थानीय समीक्षा का संस्करण, राम की वापसी तक; हर सर्ग या उत्तरकाण्ड नहीं।'):t(lang,'Source-ordered moments, not a continuous or complete retelling of the epic. Read ahead whenever you wish.','स्रोत-क्रम में चुने प्रसंग—महाकाव्य का सतत या पूर्ण पुनर्कथन नहीं। चाहें तो आगे पढ़ें।')}</p>
  <nav class="diya-ribbon" aria-label="${t(lang,'Your practice along the path','पथ पर आपका अभ्यास')}">${stories.map((s,i)=>`<a href="#yatra-${s.id}" data-diya-id="${s.id}" aria-label="${esc(t(lang,`Story ${i+1}: ${pick(s.title,lang)}`,`कथा ${i+1}: ${pick(s.title,lang)}`))}">${diya}<span>${String(i+1).padStart(2,'0')}</span><span class="sr-only" data-diya-state>${t(lang,'Not yet chosen','अभी नहीं चुना')}</span></a>`).join('')}</nav>
  <p class="diya-legend">${t(lang,'An outlined flame is a chosen intention. A lit flame means you explicitly chose “I tried it”. No streaks or missed days.','रेखांकित लौ चुने संकल्प का संकेत है। प्रकाशित लौ का अर्थ है कि आपने “मैंने अभ्यास किया” चुना। कोई स्ट्रीक या छूटे दिन नहीं।')}</p>
  <div class="kanda-filters" role="group" aria-label="${t(lang,'Filter by Kanda','काण्ड से चुनें')}"><button type="button" data-kanda="all" aria-pressed="true">${t(lang,`All ${count} ${edition?'chapters':'stories'}`,`सभी ${count} ${edition?'अध्याय':'कथाएँ'}`)}</button>${groups.map(g=>`<button type="button" data-kanda="${g.id}" aria-pressed="false">${esc(pick(g.stories[0].book,lang))}</button>`).join('')}</div><p class="sr-only" id="kanda-status" role="status"></p>
  <p class="yatra-storage" data-yatra-storage hidden role="status"></p>
  <div class="yatra-path" data-yatra-path><svg class="yatra-thread" viewBox="0 0 8 100" preserveAspectRatio="none" aria-hidden="true"><path d="M4 0V100" pathLength="1"/><path class="yatra-thread-fill" d="M4 0V100" pathLength="1"/></svg>
   ${groups.map(g=>`<section class="kanda-group" data-kanda-group="${g.id}" aria-labelledby="kanda-${g.id}"><h3 id="kanda-${g.id}" class="kanda-heading"><span>${['I','II','III','IV','V','VI'][g.index]}</span>${esc(pick(g.stories[0].book,lang))}</h3><ol class="chapter-grid">${g.stories.map(story=>{
    const index=stories.indexOf(story),n=String(index+1).padStart(2,'0');
    return `<li id="yatra-${story.id}" class="yatra-milestone chapter-card" data-yatra-id="${story.id}" data-state="${index===0?'current':'upcoming'}">
     <a class="yatra-card" href="${href(lang,`/story/${story.id}/`)}" ${index===0?'aria-current="step"':''}><div class="chapter-art yatra-art">${picture(story,lang,{decorative:true})}<span class="chapter-number">${t(lang,edition?'CHAPTER':'STORY',edition?'अध्याय':'कथा')} ${n} / ${count}</span><span class="chapter-tried" data-yatra-lit hidden>${diya}${t(lang,'Practised','अभ्यास किया')}</span></div>
      <div class="chapter-copy"><span class="yatra-state" data-yatra-state>${index===0?t(lang,'Your next step','अगला पड़ाव'):t(lang,'Read ahead','आगे पढ़ें')}</span><p class="yatra-meta">${esc(pick(story.book,lang))} · ${t(lang,'Sarga','सर्ग')} ${story.sarga}<br/>${t(lang,'About','लगभग')} ${story.durationByLanguage?.[lang]??story.duration} ${t(lang,'min read','मिनट का पाठ')}</p><h4>${esc(pick(story.title,lang))}</h4><p class="yatra-dek">${esc(pick(story.dek,lang))}</p><span class="yatra-practice-badge" data-yatra-badge hidden></span></div>
     </a>${compactPractice(story,lang)}<a class="chapter-read text-link" href="${href(lang,`/read/${story.id}/`)}?journey=ramayana">${t(lang,'Read & reflect','पढ़ें और मनन करें')}${arrow}</a>
    </li>`;
   }).join('')}</ol></section>`).join('')}
  </div>
  <div class="yatra-finished" data-yatra-finished hidden><h3>${t(lang,'There is always room to return.','लौटने की जगह हमेशा है।')}</h3><p>${t(lang,'You have acknowledged each practice. Revisit a story or take a quiet pause; your intentions stay.','आपने हर अभ्यास दर्ज किया है। कोई कथा फिर पढ़ें या शांत विराम लें; आपके संकल्प बने रहेंगे।')}</p></div>
 </section>`;
}

export function readerBanner(story,lang,picture,{edition=false}={}){
 return `<figure class="reader-opening-art"><div class="reader-art-frame">${picture(story,lang,{priority:true,sizes:'(max-width:720px) calc(100vw - 54px), 638px'})}</div><figcaption><span>${esc(pick(story.book,lang))} · ${t(lang,'Sarga','सर्ग')} ${story.sarga}</span><span>${edition?t(lang,'Narrative painting · local review only','कथात्मक चित्र · केवल स्थानीय समीक्षा'):t(lang,'Atmospheric collection artwork','संग्रह का वातावरण-चित्र')}</span></figcaption></figure>`;
}
