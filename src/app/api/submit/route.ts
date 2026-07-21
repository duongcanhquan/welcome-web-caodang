import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import {
  enrichSubmissionAi,
  handleSubmission,
} from "@/lib/submissions/submit";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const result = await handleSubmission(formData, ip);

    // AI chạy đúng 1 lần sau submit — lần sau chỉ đọc Supabase
    after(() => {
      void enrichSubmissionAi(result).catch(() => {
        /* fallback tĩnh đã có trong insight */
      });
    });

    return NextResponse.json({
      ok: true,
      token: result.token,
      leafNumber: result.leafNumber,
    });
  } catch (err) {
    const raw =
      err instanceof Error ? err.message : "Gửi thất bại, thử lại nhé.";
    // Không lộ lỗi nội bộ (SharedArrayBuffer, stack AWS, …)
    const message =
      /ArrayBuffer|SharedArrayBuffer|ECONN|ETIMEDOUT|fetch failed|Unexpected/i.test(
        raw
      )
        ? "Không tải được ảnh lên. Thử lại hoặc chọn ảnh khác nhé."
        : raw;
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
