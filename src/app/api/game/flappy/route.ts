import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Lưu điểm Flappy Bird */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      token: string;
      eventId: string;
      score: number;
      playerName?: string;
    };

    if (!body.token || !body.eventId || body.score == null) {
      return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { error } = await admin.from("game_scores").insert({
      event_id: body.eventId,
      token: body.token,
      score: Math.max(0, Math.floor(body.score)),
      game_type: "flappy",
      player_name: body.playerName ?? null,
    });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi lưu điểm";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/** Bảng xếp hạng Flappy Bird */
export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("eventId");
  if (!eventId) {
    return NextResponse.json({ error: "Thiếu eventId" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("game_scores")
    .select("token, score, player_name, created_at")
    .eq("event_id", eventId)
    .eq("game_type", "flappy")
    .order("score", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Gom điểm cao nhất mỗi token
  const best = new Map<string, (typeof data)[0]>();
  for (const row of data ?? []) {
    const existing = best.get(row.token);
    if (!existing || row.score > existing.score) {
      best.set(row.token, row);
    }
  }

  const leaderboard = [...best.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((r, i) => ({
      rank: i + 1,
      name: r.player_name ?? `Lá #${r.token.slice(0, 4)}`,
      score: r.score,
    }));

  return NextResponse.json({ leaderboard });
}
