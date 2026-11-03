// Transparent estimates, not measured reader speed. Count only narrative bodies;
// exclude UI, source notes, reflection and the optional practice invitation.
export function readingMetadata(story) {
  const wordCounts = Object.fromEntries(['en','hi'].map(lang => [lang,story.scenes.reduce((sum,scene)=>sum+scene.blocks.reduce((count,block)=>count+(block.text[lang]?.trim().split(/\s+/u).filter(Boolean).length||0),0),0)]));
  const durationByLanguage = {en:Math.max(1,Math.ceil(wordCounts.en/180)),hi:Math.max(1,Math.ceil(wordCounts.hi/150))};
  return {wordCounts,durationByLanguage,duration:durationByLanguage.en};
}
