import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createEvent } from "@/lib/events/create-event";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const admin = createAdminClient();
    const { data: events, error } = await admin
      .from("events")
      .select("id, slug, name, status, is_active, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const withCounts = await Promise.all(
      (events ?? []).map(async (ev) => {
        const { count } = await admin
          .from("submissions")
          .select("*", { count: "exact", head: true })
          .eq("event_id", ev.id);
        return { ...ev, submissionCount: count ?? 0 };
      })
    );

    return NextResponse.json({ events: withCounts });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi tải danh sách";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const body = (await req.json()) as {
      name?: string;
      slug?: string;
      lockActiveFirst?: boolean;
    };

    const created = await createEvent({
      name: body.name ?? "",
      slug: body.slug ?? "",
      lockActiveFirst: Boolean(body.lockActiveFirst),
    });

    return NextResponse.json({ ok: true, event: created });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi tạo sự kiện";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
