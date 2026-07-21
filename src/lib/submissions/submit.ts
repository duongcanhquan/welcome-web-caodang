import { createHash } from "crypto";
import { nanoid } from "nanoid";
import { generatePersonalization } from "@/lib/ai/deepseek";
import { DEFAULT_EVENT_SLUG, EVENT_MAJORS } from "@/lib/constants";
import { parseDobDdMmYyyy } from "@/lib/date/parse-dob";
import { getActiveEvent } from "@/lib/events/active";
import { calculateNumerology, LIFE_PATH_CONTENT } from "@/lib/numerology";
import { fileToOwnedBuffer } from "@/lib/buffer/owned";
import { uploadSubmissionImages } from "@/lib/storage/upload";
import { createAdminClient } from "@/lib/supabase/admin";
import type { NumerologyResult } from "@/lib/numerology";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

function isAllowedImageType(type: string): boolean {
  const t = (type || "").toLowerCase().trim();
  // iOS / một số máy trả type rỗng hoặc octet-stream — Sharp sẽ xác thực sau
  if (!t || t === "application/octet-stream") return true;
  return ALLOWED_MIME.has(t);
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip + (process.env.IP_HASH_SALT ?? "")).digest("hex");
}

export interface SubmitPayload {
  name: string;
  dob: string;
  major: string;
  wish: string;
  eventSlug?: string;
}

export interface SubmissionResult {
  token: string;
  leafNumber: number;
  submissionId: string;
  eventId: string;
  name: string;
  major: string;
  wish: string;
  dob: string;
  numerology: NumerologyResult;
}

async function assignNextSlot(
  admin: ReturnType<typeof createAdminClient>,
  eventId: string
): Promise<number> {
  const { data, error } = await admin.rpc("claim_next_submission_slot", {
    p_event_id: eventId,
  });

  if (!error && typeof data === "number") {
    return data;
  }

  // Fallback nếu chưa chạy migration claim_next_submission_slot
  const { data: rows } = await admin
    .from("submissions")
    .select("slot_index")
    .eq("event_id", eventId)
    .order("slot_index", { ascending: false })
    .limit(1);

  return (rows?.[0]?.slot_index ?? -1) + 1;
}

async function checkRateLimit(
  admin: ReturnType<typeof createAdminClient>,
  eventId: string,
  ipHash: string,
  limit: number
): Promise<boolean> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count } = await admin
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("ip_hash", ipHash)
    .gte("created_at", since);

  return (count ?? 0) < limit;
}

/**
 * Upload + lưu submission + insight tĩnh.
 * AI DeepSeek chạy sau (after) — không chặn phản hồi sinh viên.
 */
export async function handleSubmission(
  formData: FormData,
  ip: string
): Promise<SubmissionResult> {
  const name = (formData.get("name") as string)?.trim();
  const dobRaw = formData.get("dob") as string;
  const major = formData.get("major") as string;
  const wish = ((formData.get("wish") as string) ?? "").trim();
  const rawSlug = ((formData.get("eventSlug") as string) ?? "").trim();
  const active = rawSlug ? null : await getActiveEvent();
  const eventSlug = rawSlug || active?.slug || DEFAULT_EVENT_SLUG;
  const file = formData.get("photo") as File | null;

  if (!name || !dobRaw || !major) {
    throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc.");
  }

  let dob: string;
  try {
    if (dobRaw.includes("/")) {
      dob = parseDobDdMmYyyy(dobRaw);
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(dobRaw)) {
      dob = dobRaw;
    } else {
      throw new Error("Ngày sinh phải theo dạng dd/mm/yyyy");
    }
  } catch (err) {
    throw err instanceof Error ? err : new Error("Ngày sinh không hợp lệ");
  }

  const allowedMajors = new Set<string>(EVENT_MAJORS);
  if (!allowedMajors.has(major)) {
    throw new Error("Ngành học không hợp lệ.");
  }

  if (!file || file.size === 0) {
    throw new Error("Vui lòng chọn ảnh.");
  }

  if (!isAllowedImageType(file.type)) {
    throw new Error("Chỉ chấp nhận file ảnh (JPEG, PNG, WebP).");
  }

  const admin = createAdminClient();
  const ipHash = hashIp(ip);

  const { data: event } = await admin
    .from("events")
    .select("id, status")
    .eq("slug", eventSlug)
    .single();

  if (!event) throw new Error("Sự kiện không tồn tại.");
  if (event.status !== "collecting") {
    throw new Error("Sự kiện đã khoá, không nhận thêm lá mới.");
  }

  const { data: settings } = await admin
    .from("event_settings")
    .select("max_file_mb, rate_limit_per_ip")
    .eq("event_id", event.id)
    .single();

  const maxBytes = (Number(settings?.max_file_mb) || 5) * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`Ảnh quá lớn. Tối đa ${settings?.max_file_mb ?? 5}MB.`);
  }

  const rateLimit = settings?.rate_limit_per_ip ?? 3;
  const allowed = await checkRateLimit(admin, event.id, ipHash, rateLimit);
  if (!allowed) {
    throw new Error("Bạn đã gửi quá số lần cho phép. Thử lại sau 24 giờ nhé.");
  }

  // Slot + đọc ảnh song song sau khi đã qua rate limit
  const [slotIndex, buffer] = await Promise.all([
    assignNextSlot(admin, event.id),
    fileToOwnedBuffer(file),
  ]);

  const token = nanoid(32);
  const submissionId = crypto.randomUUID();

  let leafUrl: string;
  let photoUrl: string;
  try {
    ({ leafUrl, photoUrl } = await uploadSubmissionImages(submissionId, buffer));
  } catch (err) {
    const raw = err instanceof Error ? err.message : "";
    if (/ArrayBuffer|SharedArrayBuffer|Unsupported input|Input buffer/i.test(raw)) {
      throw new Error(
        "Không xử lý được ảnh. Thử chụp lại hoặc chọn ảnh JPEG/PNG khác nhé."
      );
    }
    if (/R2|credentials|Access Denied|Forbidden|networking|fetch failed/i.test(raw)) {
      throw new Error("Không tải được ảnh lên máy chủ. Thử lại sau vài giây nhé.");
    }
    throw err instanceof Error
      ? err
      : new Error("Không tải được ảnh lên. Thử lại nhé.");
  }

  const { error: insertError } = await admin.from("submissions").insert({
    id: submissionId,
    event_id: event.id,
    token,
    name,
    dob,
    major,
    wish,
    leaf_url: leafUrl,
    photo_url: photoUrl,
    slot_index: slotIndex,
    ip_hash: ipHash,
  });

  if (insertError) throw insertError;

  const numerology = calculateNumerology(dob);
  const lpContent = LIFE_PATH_CONTENT[numerology.lifePath];

  const personalization = await generatePersonalization(
    event.id,
    { name, major, wish, dob, numerology },
    { skipAi: true }
  );

  await admin.from("submission_insights").insert({
    submission_id: submissionId,
    numerology: {
      ...numerology,
      content: lpContent,
    },
    ai_numerology: personalization.numerologyText,
    ai_personalization: {
      wishComment: personalization.wishComment,
      funFact: personalization.funFact,
    },
  });

  return {
    token,
    leafNumber: slotIndex + 1,
    submissionId,
    eventId: event.id,
    name,
    major,
    wish,
    dob,
    numerology,
  };
}

/** Enrich AI sau khi đã trả token cho client */
export async function enrichSubmissionAi(result: SubmissionResult): Promise<void> {
  const personalization = await generatePersonalization(result.eventId, {
    name: result.name,
    major: result.major,
    wish: result.wish,
    dob: result.dob,
    numerology: result.numerology,
  });

  const admin = createAdminClient();
  await admin
    .from("submission_insights")
    .update({
      ai_numerology: personalization.numerologyText,
      ai_personalization: {
        wishComment: personalization.wishComment,
        funFact: personalization.funFact,
      },
      ai_generated_at: new Date().toISOString(),
    })
    .eq("submission_id", result.submissionId);
}
