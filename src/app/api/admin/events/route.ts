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
      .select(
        "id, slug, name, status, is_active, created_at, submissions(count)"
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const withCounts = (events ?? []).map((ev) => {
      const countRel = (
        ev as { submissions?: { count: number }[] | null }
      ).submissions;
      const submissionCount = countRel?.[0]?.count ?? 0;
      return {
        id: ev.id,
        slug: ev.slug,
        name: ev.name,
        status: ev.status,
        is_active: ev.is_active,
        created_at: ev.created_at,
        submissionCount,
      };
    });

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
