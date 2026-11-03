export type CollectionSlug = 'ramayana' | 'krishna' | 'shiva' | 'devi' | 'ganesha' | 'mahabharata';
export type StoryStatus = 'idea' | 'outline' | 'draft' | 'illustrated' | 'narrated' | 'reviewed' | 'published';
export type AgeBand = 'all-ages' | 'family-6+' | 'independent-8+' | 'older-12+';
export interface SourceRef {
  book: string;
  arc: string;
  citation: string;
  edition_note?: string;
  external_url?: string;
}
export interface StoryPage {
  page_number: number;
  scene_title: { en: string; hi: string };
  text: { en: string; hi: string };
  image: { src: string; alt: { en: string; hi: string }; aspect_ratio?: string; focal_point?: string };
  pull_quote?: { en: string; hi: string };
  shloka?: { devanagari: string; transliteration: string; meaning: { en: string; hi: string } };
}
export interface Story {
  id: string;
  slug: string;
  collection: CollectionSlug;
  book: string;
  arc: string;
  order: number;
  title: { en: string; hi: string };
  subtitle: { en: string; hi: string };
  synopsis: { en: string; hi: string };
  cover_image: { src: string; alt: { en: string; hi: string } };
  source_refs: SourceRef[];
  characters: string[];
  places: string[];
  values: string[];
  moods: string[];
  age_band: AgeBand;
  duration_min: number;
  festival_tags: string[];
  status: StoryStatus;
  pages: StoryPage[];
}
