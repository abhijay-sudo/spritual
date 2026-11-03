import {stories, storyKeys} from './stories.mjs';

// IDs only: preserve existing local saved records without publishing draft prose,
// titles, expanded source maps or artwork. Do not derive this public file from drafts.
export const withheldStoryIds = [
  'princes-and-teacher','road-to-mithila','promise-of-exile','forest-torn-apart',
  'alliance-and-vali','search-to-southern-sea','through-lanka-at-night','witness-returns',
  'refuge-and-crossing','war-and-its-cost','sita-speaks-after-victory','northward-home',
];
export const publicStorageKeys = [...storyKeys, ...withheldStoryIds];
const pair = (en,hi) => ({en,hi});
export const unavailableStories = withheldStoryIds.map(id => ({
  id, unavailable:true,
  title:pair('Chapter awaiting review','समीक्षा की प्रतीक्षा में अध्याय'),
  book:pair('Not in the public edition','सार्वजनिक संस्करण में उपलब्ध नहीं'),
  dek:pair('Your saved place is kept. This chapter is unavailable while its exact text and artwork await review.','आपका सहेजा स्थान सुरक्षित है। सटीक पाठ और चित्र की समीक्षा तक यह अध्याय उपलब्ध नहीं है।'),
}));
export const publicJourneys = {
  ramayana:{id:'ramayana',title:pair('Ten moments from the Ramayana','रामायण के दस प्रसंग'),shortTitle:pair('Ramayana Yatra','रामायण यात्रा'),description:pair('Ten reviewed retellings in source order. Selected moments, not a continuous or complete retelling of the epic.','स्रोत-क्रम में दस समीक्षित पुनर्कथन। चुने हुए प्रसंग—महाकाव्य का सतत या पूर्ण पुनर्कथन नहीं।'),storyIds:stories.map(story=>story.id)},
  hanuman:{id:'hanuman',title:pair('Courage with care','सजग साहस'),shortTitle:pair('Walk with Hanuman','हनुमान के साथ'),description:pair('Three moments of thoughtful speech, resolve and hope.','विचारपूर्ण वाणी, संकल्प और आशा के तीन प्रसंग।'),storyIds:['hanumans-first-conversation','across-the-ocean','a-ring-brings-hope']},
  together:{id:'together',title:pair('Read together','साथ पढ़ें'),shortTitle:pair('Read together','साथ पढ़ें'),description:pair('Three stories of friendship, responsibility and welcome.','मित्रता, उत्तरदायित्व और आतिथ्य की तीन कथाएँ।'),storyIds:['a-friend-beside-the-ganga','bharata-and-the-sandals','shabaris-welcome']},
};
