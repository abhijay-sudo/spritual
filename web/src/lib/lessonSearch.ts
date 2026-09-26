import type { Lesson } from "../data/lessons";

function normalize(value: string): string {
  return (
    value
      .normalize("NFD")
      // Fold Latin accents (including IAST) without removing Hindi vowel marks.
      .replace(/[\u0300-\u036f]/g, "")
      .normalize("NFC")
      .toLowerCase()
      .replace(/[०-९]/g, (digit) => String(digit.charCodeAt(0) - 0x0966))
      .trim()
      .replace(/\s+/g, " ")
  );
}

export function searchLessons(
  lessons: Lesson[],
  query: string,
  topic: string,
): Lesson[] {
  const selectedTopic = normalize(topic);
  const filterTopic = ["purpose", "balance", "attention"].includes(
    selectedTopic,
  );
  const normalizedQuery = normalize(query);
  // Recognize a complete chapter/verse pair, not numeric substrings: 2.4
  // must never match 2.47. Ordinary title/topic searches remain unchanged.
  const verseQuery = normalizedQuery.match(
    /^(?:(?:bg|bhagavad gita|भगवद्गीता|भगवद् गीता|भगवद गीता|गीता)\s+)?(\d+)\s*[.:\s]\s*(\d+)$/,
  );
  const terms = normalizedQuery.split(" ").filter(Boolean);

  return lessons.filter((lesson) => {
    if (filterTopic && lesson.themeKey !== selectedTopic) return false;

    const reference = normalize(lesson.reference);
    if (verseQuery) {
      const verseReference = reference.match(/bhagavad gita\s+(\d+)\.(\d+)$/);
      return Boolean(
        verseReference &&
          Number(verseReference[1]) === Number(verseQuery[1]) &&
          Number(verseReference[2]) === Number(verseQuery[2]),
      );
    }
    const aliases = reference.includes("bhagavad gita")
      ? "भगवद्गीता भगवद् गीता भगवद गीता गीता Bhagavad Gita"
      : "";
    const searchableText = normalize(
      [
        lesson.reference,
        lesson.title.en,
        lesson.title.hi,
        lesson.subtitle.en,
        lesson.subtitle.hi,
        lesson.theme.en,
        lesson.theme.hi,
        aliases,
      ].join(" "),
    );

    return terms.every((term) => searchableText.includes(term));
  });
}
