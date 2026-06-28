import { NextRequest, NextResponse } from "next/server";
import { handleSubmission } from "@/lib/submissions/submit";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const result = await handleSubmission(formData, ip);

    return NextResponse.json({
      ok: true,
      token: result.token,
      leafNumber: result.leafNumber,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gửi thất bại, thử lại nhé.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
