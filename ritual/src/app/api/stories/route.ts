import { NextResponse } from "next/server";
import { storiesData } from "@/lib/data/stories";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const story = storiesData[slug];
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }
    return NextResponse.json(story);
  }

  const list = Object.values(storiesData).map((s) => ({
    collection: s.collection,
    book: s.book,
    arc: s.arc,
    slug: s.slug,
    title: s.title,
    titleHindi: s.titleHindi,
    subtitle: s.subtitle,
    scenesCount: s.scenes.length,
    estimatedMinutes: s.estimatedMinutes,
  }));

  return NextResponse.json({ stories: list });
}
