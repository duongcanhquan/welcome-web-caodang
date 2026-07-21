import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Admin: lưu cấu hình DeepSeek API */
export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    eventId: string;
    deepseekApiKey?: string;
    deepseekModel?: string;
    aiEnabled?: boolean;
    numerologyPrompt?: string;
    personalizationPrompt?: string;
  };

  if (!body.eventId) {
    return NextResponse.json({ error: "Thiếu eventId" }, { status: 400 });
  }

  const admin = createAdminClient();

  const payload: Record<string, unknown> = {
    event_id: body.eventId,
    updated_at: new Date().toISOString(),
  };

  if (body.deepseekApiKey !== undefined) {
    payload.deepseek_api_key = body.deepseekApiKey || null;
  }
  if (body.deepseekModel !== undefined) {
    payload.deepseek_model = body.deepseekModel;
  }
  if (body.aiEnabled !== undefined) {
    payload.ai_enabled = body.aiEnabled;
  }
  if (body.numerologyPrompt !== undefined) {
    const trimmed = body.numerologyPrompt.trim();
    payload.numerology_prompt = trimmed || null;
  }
  if (body.personalizationPrompt !== undefined) {
    payload.personalization_prompt = body.personalizationPrompt;
  }

  const { error } = await admin.from("event_secrets").upsert(payload);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/** Admin: đọc cấu hình (ẩn API key — chỉ hiện masked) */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const eventId = req.nextUrl.searchParams.get("eventId");
  if (!eventId) {
    return NextResponse.json({ error: "Thiếu eventId" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("event_secrets")
    .select(
      "event_id, deepseek_model, ai_enabled, numerology_prompt, personalization_prompt, updated_at"
    )
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Kiểm tra có key hay chưa (không trả key thật)
  const { data: keyCheck } = await admin
    .from("event_secrets")
    .select("deepseek_api_key")
    .eq("event_id", eventId)
    .maybeSingle();

  return NextResponse.json({
    ...data,
    hasApiKey: Boolean(keyCheck?.deepseek_api_key),
  });
}
