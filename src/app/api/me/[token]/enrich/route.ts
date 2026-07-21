import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enrichSubmissionAi, type SubmissionResult } from "@/lib/submissions/submit";
import { calculateNumerology } from "@/lib/numerology";
import { isNumerologyLongEnough } from "@/lib/ai/numerology-length";

export const maxDuration = 120;

/**
 * Gọi lại / tiếp tục viết bài thần số nếu bản hiện tại còn ngắn.
 * Client poll khi vừa nộp (?new=1).
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: submission, error } = await admin
    .from("submissions")
    .select("id, token, name, dob, major, wish, event_id")
    .eq("token", token)
    .single();

  if (error || !submission) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }

  const { data: insight } = await admin
    .from("submission_insights")
    .select("ai_numerology, ai_generated_at")
    .eq("submission_id", submission.id)
    .maybeSingle();

  if (
    insight?.ai_generated_at &&
    isNumerologyLongEnough(insight.ai_numerology)
  ) {
    return NextResponse.json({
      ok: true,
      ready: true,
      length: insight.ai_numerology?.length ?? 0,
    });
  }

  const numerology = calculateNumerology(submission.dob);
  const result: SubmissionResult = {
    token: submission.token,
    leafNumber: 0,
    submissionId: submission.id,
    eventId: submission.event_id,
    name: submission.name,
    major: submission.major,
    wish: submission.wish ?? "",
    dob: submission.dob,
    numerology,
  };

  try {
    await enrichSubmissionAi(result);
  } catch {
    return NextResponse.json({
      ok: true,
      ready: false,
      length: insight?.ai_numerology?.length ?? 0,
    });
  }

  const { data: refreshed } = await admin
    .from("submission_insights")
    .select("ai_numerology, ai_generated_at")
    .eq("submission_id", submission.id)
    .maybeSingle();

  const length = refreshed?.ai_numerology?.trim().length ?? 0;
  return NextResponse.json({
    ok: true,
    ready:
      Boolean(refreshed?.ai_generated_at) &&
      isNumerologyLongEnough(refreshed?.ai_numerology),
    length,
  });
}
