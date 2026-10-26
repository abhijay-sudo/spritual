import {createHash} from 'node:crypto';
import {chapters as opening} from './chapters-01-11.mjs';
import {chapters as returnJourney} from './chapters-12-22.mjs';
import {editionStoryKeys} from '../../illustrated-chapters.mjs';
import {storyArt} from '../../illustrated-edition.mjs';

export const collectionHome = lang => `${lang === 'hi' ? '/hi' : ''}/books/ramayana/`;
export const chapterRoute = (id, lang = 'en') => `${lang === 'hi' ? '/hi' : ''}/books/read/ramayana-${id}/`;
export const notice = lang => lang === 'hi'
  ? 'स्थानीय संपादकीय पूर्वावलोकन · पाठ और चित्रों की प्रकाशन-समीक्षा शेष है'
  : 'Local editorial preview · Text and artwork await publication review';
export const chapters = [...opening, ...returnJourney];
export const revision = createHash('sha256').update(JSON.stringify(chapters)).digest('hex').slice(0, 16);
export const release = Object.freeze({status:'draft', editor:null, rightsReview:'pending', paidAccess:false, revision});

export function validateCollection(input = chapters) {
  if (input.length !== editionStoryKeys.length) throw Error('Ramayana collection must contain all 22 chapters.');
  for (const [i, chapter] of input.entries()) {
    if (chapter.id !== editionStoryKeys[i]) throw Error(`Chapter order mismatch at ${i + 1}`);
    if (!chapter.sources?.length || chapter.sources.some(s => !s.label || !/^https:\/\//.test(s.url))) throw Error(`Missing sources: ${chapter.id}`);
    if (chapter.scenes.length !== 4 || new Set(chapter.scenes.map(s => s.id)).size !== 4) throw Error(`Expected four distinct scenes: ${chapter.id}`);
    if (!storyArt[chapter.id]) throw Error(`Missing chapter art: ${chapter.id}`);
    for (const lang of ['en','hi']) {
      for (const field of ['title','dek','part','note','reflection']) if (!chapter[field]?.[lang]?.trim()) throw Error(`Missing ${lang} ${field}: ${chapter.id}`);
      for (const scene of chapter.scenes) {
        if (!/^[a-z0-9-]+$/.test(scene.id) || !scene.title[lang]?.trim() || !scene.paragraphs.length || scene.paragraphs.some(p => !p[lang]?.trim())) throw Error(`Incomplete ${lang} scene: ${chapter.id}`);
      }
    }
  }
  return input;
}
export const wordCount = chapter => chapter.scenes.reduce((n, s) => n + s.paragraphs.reduce((m,p) => m + p.en.trim().split(/\s+/).length, 0), 0);

const sceneChoices={
 'beginning-outline':'01-scene-narada-answer',
 'beginning-voices':'01-scene-story-begins',
 'restraint-question':'02-scene-withdrawal',
 'restraint-forest':'02-scene-withdrawal',
 'bow-weddings':'03-scene-after-bow',
 'ganga-crossing':'04-scene-river-crossing',
 'bharata-nandigrama':'05-scene-nandigrama-trust',
 'shabari-pampa':'06-scene-direction-ahead',
 'meeting-answer':'07-scene-toward-alliance',
 'ocean-mainaka':'08-scene-mainaka-offer',
 'ocean-surasa':'24-surasa-test',
 'ring-choice':'09-scene-offer-and-answer',
 'ring-jewel':'09-scene-token-message'
};
const additionalArt={file:'24-surasa-test',alt:{en:'A single small Hanuman approaches Surasa’s open mouth above the ocean during her test.',hi:'समुद्र के ऊपर सुरसा की परीक्षा में छोटे रूप में एक हनुमान उनके खुले मुख के निकट आते हैं।'}};
// Exact semantic IDs select plates. An unmatched scene retains its chapter plate,
// explicitly captioned as an illustration rather than claiming a literal new view.
export function sceneArt(chapter) {
  const art = chapter.id==='forest-torn-apart'?{file:'23-empty-hermitage',alt:{en:'Rama and Lakshmana stand before their empty forest hermitage.',hi:'राम और लक्ष्मण अपने खाली वन-आश्रम के सामने खड़े हैं।'},scenes:[]}:storyArt[chapter.id];
  const variants = [{file:art.file,alt:art.alt}, ...art.scenes.filter(s => s.file !== '08-scene-surasa-shadow'),additionalArt];
  return chapter.scenes.map(scene => {
    const selected = variants.find(v=>v.file===sceneChoices[scene.id])||variants[0];
    return {id:scene.id, ...selected, atmosphere: /ocean|ganga|sea|crossing/.test(chapter.id) ? 'water' : /lanka|mithila|returning|victory/.test(chapter.id) ? 'light' : 'forest'};
  });
}

export function asBook(chapter) {
  return {
    id:`ramayana-${chapter.id}`, title:chapter.title, dek:chapter.dek,
    collection:'ramayana', series:'illustrated-edition', kind:'retelling', revision,
    sources:chapter.sources, sourceLabel:chapter.sources[0].label, note:chapter.note,
    contentNote:chapter.contentNote, reflection:chapter.reflection,
    image:`/assets/illustrated/${sceneArt(chapter)[0].file}-960.jpg`, alt:sceneArt(chapter)[0].alt,
    folios:chapter.scenes
  };
}
