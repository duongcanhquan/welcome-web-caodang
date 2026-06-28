import { NextResponse } from "next/server";
import { getTreeLayoutForEvent } from "@/lib/tree/get-layout";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const result = await getTreeLayoutForEvent(slug);
    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      layout: result.layout,
      event: {
        id: result.event.eventId,
        slug: result.event.slug,
        name: result.event.name,
        status: result.event.status,
      },
      mosaicVersion:
        "mosaicVersion" in result ? result.mosaicVersion : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
