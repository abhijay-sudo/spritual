#!/usr/bin/env node
/**
 * Static guard for the content bundled into the local alpha. A source URL is
 * provenance, not permission to redistribute; this audit is not a rights or
 * theological review and cannot authorize publication by itself.
 */
import { pathToFileURL } from 'node:url';
import { listDemoCorpus, canPublishContent } from '../packages/content/src/index.ts';
import { arjunaBowStory } from '../packages/content/src/story.ts';
import { graphSources, graphStories, validateKnowledgeGraph } from '../packages/content/src/knowledgeGraph.ts';
import { lessons } from '../web/src/data/lessons.ts';

function sourceReference(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return null;
    const chapter = parsed.searchParams.get('field_chapter_value');
    const verse = parsed.searchParams.get('field_nsutra_value');
    return /^\d+$/.test(chapter ?? '') && /^\d+$/.test(verse ?? '')
      ? `${Number(chapter)}.${Number(verse)}`
      : null;
  } catch {
    return null;
  }
}

function isCurrentDemoSource(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname === 'www.gitasupersite.iitk.ac.in';
  } catch {
    return false;
  }
}

/**
 * Check complete local fixture alignment and return separate public-release
 * blockers. `errors` fail ordinary builds; `releaseBlockers` fail only an
 * explicitly requested public-content preflight.
 */
export function auditBundledContent({ passages, stories, readerLessons, mode = 'demo' }) {
  if (!['demo', 'release'].includes(mode)) throw new Error(`Unknown content audit mode: ${mode}`);
  const localDemo = mode === 'demo';
  const errors = [];
  const releaseBlockers = [];
  const seenPassages = new Set();
  const seenLessons = new Set();

  for (const passage of passages) {
    const id = String(passage?.id || '<missing id>');
    if (seenPassages.has(id)) errors.push(`${id}: duplicate passage ID`);
    seenPassages.add(id);
    if (localDemo && passage?.publicationState !== 'demo_only') errors.push(`${id}: bundled content must stay demo_only`);
    if (localDemo && passage?.aiUseAllowed !== false) errors.push(`${id}: bundled content must not be sent to an AI provider`);
    if (localDemo && (passage?.source?.rightsState !== 'unknown' || passage?.source?.licenseName != null)) {
      errors.push(`${id}: local demo has an unverified rights or license claim`);
    }
    if (sourceReference(passage?.source?.sourceUrl) !== passage?.source?.canonicalReference) {
      errors.push(`${id}: HTTPS source URL does not match the canonical chapter and verse`);
    }
    if (localDemo && !isCurrentDemoSource(passage?.source?.sourceUrl)) {
      errors.push(`${id}: current Gita demo source is not the recorded IIT Kanpur site`);
    }

    const reader = readerLessons.find((lesson) => lesson.id === passage?.lessonId);
    if (!reader) {
      errors.push(`${id}: no corresponding reader lesson`);
    } else {
      seenLessons.add(reader.id);
      const expectedReference = `${passage?.source?.workTitle} ${passage?.source?.canonicalReference}`;
      if (reader.reference !== expectedReference || reader.sourceUrl !== passage?.source?.sourceUrl) {
        errors.push(`${id}: reader reference or source URL differs from provenance record`);
      }
      const verse = reader.steps.find((step) => step.kind === 'verse');
      const explanation = reader.steps.find((step) => step.kind === 'understand');
      const fields = [
        ['CANONICAL_TEXT', 'sa', verse?.script],
        ['TRANSLITERATION', 'sa', verse?.transliteration],
        ['EDITORIAL_EXPLANATION', 'en', explanation?.body.en],
        ['EDITORIAL_EXPLANATION', 'hi', explanation?.body.hi],
      ];
      for (const [kind, language, displayed] of fields) {
        const matches = (passage?.renderings ?? []).filter((item) => item.kind === kind && item.language === language);
        if (matches.length !== 1 || !displayed?.trim() || matches[0].text !== displayed) {
          errors.push(`${id}: ${kind}/${language} differs from the reader or is missing`);
        }
      }
    }
    if (!Array.isArray(passage?.renderings) || passage.renderings.length === 0) {
      errors.push(`${id}: no renderings`);
      releaseBlockers.push(`${id}: no reviewed content exists`);
      continue;
    }
    if (localDemo && passage.renderings.some((item) => item.kind === 'TRANSLATION' || item.reviewState !== 'unreviewed')) {
      errors.push(`${id}: local alpha cannot bundle a translation or claim approved review`);
    }

    const eligible = passage.publicationState === 'published' && passage.renderings.every((item) =>
      canPublishContent({
        rightsState: passage?.source?.rightsState,
        rightsEvidenceRef: passage?.source?.rightsEvidenceRef ?? null,
        licenseName: passage?.source?.licenseName,
        provenanceVerified: passage?.source?.provenanceVerified === true,
        reviewState: item.reviewState,
        reviewerName: item.reviewerName,
      }));
    if (!eligible) releaseBlockers.push(`${id}: not publishable; exact-version rights evidence, verified provenance and named editorial approval are required`);
    if (passage.aiUseAllowed && (!passage?.source?.aiUseRightsEvidenceRef || passage?.source?.aiUsePermissionVerified !== true)) {
      releaseBlockers.push(`${id}: AI use requires independent, verified permission evidence`);
    }
  }

  for (const lesson of readerLessons) {
    if (!seenLessons.has(lesson.id)) errors.push(`${lesson.id}: reader lesson has no provenance record`);
  }

  const seenStories = new Set();
  for (const story of stories) {
    const id = String(story?.id || '<missing story id>');
    if (seenStories.has(id)) errors.push(`${id}: duplicate story ID`);
    seenStories.add(id);
    if (localDemo && (story?.publicationState !== 'demo_only' || story?.reviewState !== 'unreviewed' ||
        story?.rightsState !== 'unknown' || story?.aiUseAllowed !== false)) {
      errors.push(`${id}: story must remain an unreviewed, rights-unknown, AI-disabled demo`);
    }
    if (!Array.isArray(story?.scenes) || story.scenes.length === 0) {
      errors.push(`${id}: story has no sourced scenes`);
    }
    for (const scene of story?.scenes ?? []) {
      if (!scene.sourceVerses?.length) errors.push(`${id}/${scene.id}: missing exact verse links`);
      for (const source of scene.sourceVerses ?? []) {
        if (sourceReference(source.url) !== `1.${source.verse}` || !scene.reference.includes(String(source.verse))) {
          errors.push(`${id}/${scene.id}: source URL and stated Gita 1 verse disagree`);
        }
        if (localDemo && !isCurrentDemoSource(source.url)) {
          errors.push(`${id}/${scene.id}: current story source is not the recorded IIT Kanpur site`);
        }
      }
      for (const language of ['en', 'hi']) {
        if (!scene.title?.[language]?.trim() || !scene.narrative?.[language]?.trim()) {
          errors.push(`${id}/${scene.id}: ${language} story copy is missing`);
        }
      }
    }
    const eligible = story?.publicationState === 'published' && canPublishContent({
      rightsState: story?.rightsState,
      rightsEvidenceRef: story?.rightsEvidenceRef ?? null,
      licenseName: story?.licenseName ?? null,
      provenanceVerified: story?.provenanceVerified === true,
      reviewState: story?.reviewState,
      reviewerName: story?.reviewerName ?? null,
    });
    if (!eligible) releaseBlockers.push(`${id}: not publishable; story source rights and named editorial approval are required`);
    if (story?.aiUseAllowed && (!story?.aiUseRightsEvidenceRef || story?.aiUsePermissionVerified !== true)) {
      releaseBlockers.push(`${id}: AI use requires independent, verified permission evidence`);
    }
  }

  return { errors, releaseBlockers };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const release = process.argv.includes('--release');
  const { errors, releaseBlockers } = auditBundledContent({
    passages: listDemoCorpus(), stories: [arjunaBowStory], readerLessons: lessons,
    mode: release ? 'release' : 'demo',
  });
  errors.push(...validateKnowledgeGraph());
  if ([...graphSources.values()].some(source => source.rights !== 'unknown' || source.review !== 'unreviewed') || graphStories.some(story => story.state !== 'unreviewed_demo')) {
    errors.push('The bundled graph may not claim rights clearance or editorial approval.');
  }
  if (release) releaseBlockers.push('Knowledge graph entries and retellings require exact source/version rights and named human review.');
  if (errors.length) console.error(`Bundled-content audit failed:\n- ${errors.join('\n- ')}`);
  if (release && releaseBlockers.length) {
    console.error(`Public-content preflight blocked:\n- ${releaseBlockers.join('\n- ')}`);
  }
  if (errors.length || (release && releaseBlockers.length)) process.exitCode = 1;
  else console.log(`Checked ${listDemoCorpus().length} source-linked demo readings and ${graphStories.length} graph retellings, including the existing Arjuna story. ${release ? 'Metadata preflight only; server-side authorization and human review still required.' : 'All remain local demo content; no publication or AI-use approval is implied.'}`);
}
