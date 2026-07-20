import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import {
  exportPhotosZip,
  exportSubmissionsCsv,
  exportTreePng,
} from "@/lib/events/export";

/** ZIP/PNG có thể tải nhiều ảnh */
export const maxDuration = 60;

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await ctx.params;
  const format = req.nextUrl.searchParams.get("format");

  if (!id) {
    return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
  }

  try {
    if (format === "csv") {
      const { filename, body } = await exportSubmissionsCsv(id);
      return new NextResponse(body, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    if (format === "zip") {
      const { filename, body } = await exportPhotosZip(id);
      return new NextResponse(new Uint8Array(body), {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    if (format === "png") {
      const { filename, body } = await exportTreePng(id);
      return new NextResponse(new Uint8Array(body), {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json(
      { error: "format phải là csv, zip hoặc png" },
      { status: 400 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi xuất dữ liệu";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
