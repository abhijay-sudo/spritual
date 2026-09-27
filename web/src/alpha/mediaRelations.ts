import type { EditorialAssetId } from "./EditorialImage";

/** Preview associations only. Publication still requires media and content review. */
export const entityMedia: Readonly<Record<string, EditorialAssetId>> = {
  "entity:krishna": "krishnaVrindavan",
  "entity:hanuman": "hanumanCoast",
  "entity:shiva": "shivaHimalaya",
};

export const storyMedia: Readonly<Record<string, EditorialAssetId>> = {
  "story:arjuna-bow": "gitaChariot",
  "story:hanuman-crossing": "hanumanCoast",
};

export const workMedia: Readonly<Record<string, EditorialAssetId>> = {
  "work:gita": "gitaChariot",
  "work:ramayana": "hanumanCoast",
};
