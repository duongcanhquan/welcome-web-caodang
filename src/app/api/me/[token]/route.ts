import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Lấy thông tin submission theo token (màn chờ) */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: submission, error } = await admin
    .from("submissions")
    .select(
      `
      id, token, name, dob, major, wish, leaf_url, photo_url,
      slot_index, created_at, hidden,
      events ( id, slug, name, status )
    `
    )
    .eq("token", token)
    .single();

  if (error || !submission) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }

  const event = submission.events as unknown as {
    id: string;
    slug: string;
    name: string;
    status: string;
  };

  const { data: insight } = await admin
    .from("submission_insights")
    .select("*")
    .eq("submission_id", submission.id)
    .maybeSingle();

  const { count } = await admin
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("event_id", event.id)
    .eq("hidden", false);

  return NextResponse.json({
    submission,
    insight,
    totalLeaves: count ?? 0,
  });
}
