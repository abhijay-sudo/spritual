import { NextResponse } from "next/server";
import { sanghaCirclesData } from "@/lib/data/circles";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const circle = sanghaCirclesData.find((c) => c.slug === slug);
    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }
    return NextResponse.json(circle);
  }

  return NextResponse.json({ circles: sanghaCirclesData });
}
