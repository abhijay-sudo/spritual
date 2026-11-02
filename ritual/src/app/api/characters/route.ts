import { NextResponse } from "next/server";
import { charactersData } from "@/lib/data/characters";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const char = charactersData[slug];
    if (!char) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }
    return NextResponse.json(char);
  }

  return NextResponse.json({ characters: Object.values(charactersData) });
}
