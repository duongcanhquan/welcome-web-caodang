import { NextRequest, NextResponse } from "next/server";
import { lockTree } from "@/lib/tree/lock-tree";
import { createClient } from "@/lib/supabase/server";

/** Chốt cây có thể chạy kèm tạo sự kiện mới — tránh timeout Vercel */
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { eventId, forceRebuild } = (await req.json()) as {
      eventId: string;
      forceRebuild?: boolean;
    };
    if (!eventId) {
      return NextResponse.json({ error: "Thiếu eventId" }, { status: 400 });
    }

    const result = await lockTree(eventId, {
      forceRebuild: Boolean(forceRebuild),
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi chốt cây";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
