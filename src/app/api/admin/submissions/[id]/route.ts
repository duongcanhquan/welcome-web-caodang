import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteSubmissionImages } from "@/lib/storage/upload";

async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") return null;
  return user;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await req.json()) as { hidden?: boolean };

  const admin = createAdminClient();
  const { error } = await admin
    .from("submissions")
    .update({ hidden: body.hidden })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/** Xoá vĩnh viễn bài nộp (+ insight cascade, điểm game, ảnh R2) */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const admin = createAdminClient();

  const { data: row, error: fetchErr } = await admin
    .from("submissions")
    .select("id, token, name")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ error: "Không tìm thấy bài nộp" }, { status: 404 });
  }

  // Điểm mini-game gắn token (không FK cascade)
  await admin.from("game_scores").delete().eq("token", row.token);

  const { error: delErr } = await admin.from("submissions").delete().eq("id", id);
  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }

  void deleteSubmissionImages(id).catch(() => {});

  return NextResponse.json({ ok: true, deleted: { id: row.id, name: row.name } });
}
