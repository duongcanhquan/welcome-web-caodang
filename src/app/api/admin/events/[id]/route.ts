import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { setActiveEvent } from "@/lib/events/create-event";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
  }

  try {
    const body = (await req.json()) as { action?: string };
    if (body.action === "activate") {
      await setActiveEvent(id);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "action không hợp lệ" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi cập nhật";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
