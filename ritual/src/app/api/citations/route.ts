import { NextResponse } from "next/server";
import { scholarlyCitations } from "@/lib/data/citations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const citation = scholarlyCitations[id];
    if (!citation) {
      return NextResponse.json({ error: "Citation not found" }, { status: 404 });
    }
    return NextResponse.json(citation);
  }

  return NextResponse.json({ citations: Object.values(scholarlyCitations) });
}
