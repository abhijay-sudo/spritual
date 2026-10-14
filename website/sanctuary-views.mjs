import {stories} from './stories.mjs';
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function quietMinutePage(c, lang) {
  const hi = lang === 'hi', t = (en, hindi) => hi ? hindi : en, base = hi ? '/hi/' : '/';
  const reflection = stories.find(story => story.id === 'knowing-how-to-stop');
  const petals = Array.from({length:12}, (_, i) => `<path d="M160 160C122 133 118 83 160 32C202 83 198 133 160 160Z" transform="rotate(${i*30} 160 160)"/>`).join('');
  return `<main id="main" class="sanctuary pause-main">
    <canvas class="sanctuary-dust" aria-hidden="true"></canvas>
    <div class="sanctuary-inner"><section id="timer-view" aria-labelledby="sanctuary-title">
      <h1 id="sanctuary-title">${t('One quiet minute','एक शांत मिनट')}</h1>
      <p id="pause-reflection" class="sanctuary-intro">${c.moments[0][1]}</p>
      <div class="prana-orb timer-dial" id="timer-dial">
        <svg class="orb-countdown" viewBox="0 0 340 340" aria-hidden="true"><circle cx="170" cy="170" r="165"/><circle id="timer-progress" cx="170" cy="170" r="165" pathLength="60"/></svg>
        <div class="orb-petals" aria-hidden="true"><svg viewBox="0 0 320 320"><g class="lotus-outer">${petals}</g><g class="lotus-inner" transform="translate(160 160) scale(.66) rotate(15) translate(-160 -160)">${petals}</g></svg></div>
        <div class="orb-center"><span id="time" role="timer" aria-label="${c.remaining}">1:00</span></div>
      </div>
      <div class="breath-cue" aria-live="polite" aria-atomic="true"><h2 id="breath-phase">${t('At your own pace','अपनी गति से')}</h2><p id="breath-invitation">${t('Follow only what feels comfortable.','जितना सहज लगे, उतना ही करें।')}</p></div>
      <fieldset class="breath-options"><legend class="sr-only">${t('Breathing rhythm','श्वास की गति')}</legend>
        <label><input type="radio" name="breath-mode" value="guided" checked/><span>4 · 4 · 6</span></label>
        <label><input type="radio" name="breath-mode" value="skip"/><span>${t('Skip hold','बिना रोकें')}</span></label>
        <label><input type="radio" name="breath-mode" value="natural"/><span>${t('Natural breathing','स्वाभाविक श्वास')}</span></label>
      </fieldset>
      <div class="timer-controls"><button id="timer-toggle" class="button">${c.start}</button><button id="finish" class="text-button finish-button" hidden>${c.finish}</button><button id="timer-reset" class="text-button" hidden>${c.reset}</button></div>
      <p class="timer-status" id="timer-status" role="status">${c.ready}</p>
      <p class="sanctuary-help">${t('The last four seconds are unpaced. Your minute pauses when you leave this tab.','अंतिम चार सेकंड स्वाभाविक श्वास के लिए हैं। टैब छोड़ने पर मिनट रुक जाता है।')}</p>
      <section id="sanctuary-arrival" hidden aria-labelledby="arrival-label"><p id="arrival-label" class="eyebrow">${t('An editorial reflection','एक संपादकीय मनन')}</p><p class="arrival-wisdom">${esc(reflection.reflection[lang])}</p><a class="wisdom-source" href="${base}story/${reflection.id}/">${t('From “Knowing how to stop” · Bala Kanda 28','“रोकना भी जानना” से · बालकाण्ड 28')}</a><div class="arrival-actions"><a class="button" href="${base}daily/">${t('Enter Today’s Story','आज की कथा पढ़ें')}</a><a class="text-link" data-quiet-return href="${base}">${t('Return Quietly','शांति से लौटें')}</a></div></section>
    </section>
    <section id="finish-view" hidden><h1 tabindex="-1" id="finish-heading">${c.finishTitle}</h1><p>${c.finishText}</p><fieldset><legend>${c.stepLabel}</legend>${c.steps.map((s,i)=>`<label class="step-option"><input type="radio" name="intention" value="${i}"/><span>${s}</span></label>`).join('')}</fieldset><button class="button" id="save-step">${c.save}</button><p class="fine">${c.savingNote}</p><p id="save-status" role="status"></p><a id="return-reading" class="text-link" hidden>${t('Return to your guide','अपनी मार्गदर्शिका पर लौटें')}</a><div class="arrival-actions"><a class="button outline" href="${base}daily/">${t('Enter Today’s Story','आज की कथा पढ़ें')}</a><a class="text-link" data-quiet-return href="${base}">${t('Return Quietly','शांति से लौटें')}</a></div></section>
    <section id="saved-panel" class="saved-panel" hidden><p class="eyebrow">${c.savedHeading}</p><p id="saved-text"></p><button class="text-button" id="remove-step">${c.remove}</button><p id="remove-status" role="status"></p></section>
    <div class="sanctuary-secondary"><button id="sanctuary-sound" type="button" aria-pressed="false">${t('Sound off','ध्वनि बंद')}</button><span id="sound-status" class="sr-only" role="status"></span><button class="text-button" id="share-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 16V3m-4 4 4-4 4 4M5 12v8h14v-8"/></svg>${c.share}</button><p id="share-status" role="status"></p><label id="copy-fallback" hidden>${c.copyError}<input id="copy-url" readonly type="url"/></label></div>
    <noscript><p class="notice">${c.noJS}</p></noscript></div>
  </main>`;
}
