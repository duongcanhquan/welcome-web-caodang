import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const admin = createAdminClient();
    const { data: event } = await admin
      .from("events")
      .select("id, slug, name, status")
      .eq("slug", slug)
      .single();

    if (!event) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: settings } = await admin
      .from("event_settings")
      .select("*")
      .eq("event_id", event.id)
      .single();

    return NextResponse.json({ event, settings });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
