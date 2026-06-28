import { createHash } from "crypto";
import { nanoid } from "nanoid";
import { generatePersonalization } from "@/lib/ai/deepseek";
import { DEFAULT_EVENT_SLUG, EVENT_MAJORS } from "@/lib/constants";
import { parseDobDdMmYyyy } from "@/lib/date/parse-dob";
import { calculateNumerology, LIFE_PATH_CONTENT } from "@/lib/numerology";
import { uploadSubmissionImages } from "@/lib/storage/upload";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

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

/** Gán slot lá kế tiếp — rải đều theo thứ tự gửi */
async function assignNextSlot(
  admin: ReturnType<typeof createAdminClient>,
  eventId: string
): Promise<number> {
  const { count } = await admin
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  return count ?? 0;
}

/** Kiểm tra rate-limit theo IP (ngưỡng từ event_settings) */
async function checkRateLimit(
  admin: ReturnType<typeof createAdminClient>,
  eventId: string,
  ipHash: string
): Promise<boolean> {
  const { data: settings } = await admin
    .from("event_settings")
    .select("rate_limit_per_ip")
    .eq("event_id", eventId)
    .single();

  const limit = settings?.rate_limit_per_ip ?? 3;
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count } = await admin
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("ip_hash", ipHash)
    .gte("created_at", since);

  return (count ?? 0) < limit;
}

export async function handleSubmission(
  formData: FormData,
  ip: string
): Promise<{ token: string; leafNumber: number; submissionId: string }> {
  const name = (formData.get("name") as string)?.trim();
  const dobRaw = formData.get("dob") as string;
  const major = formData.get("major") as string;
  const wish = ((formData.get("wish") as string) ?? "").trim();
  const eventSlug =
    ((formData.get("eventSlug") as string) ?? DEFAULT_EVENT_SLUG).trim();
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

  if (!ALLOWED_MIME.has(file.type)) {
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
    .select("max_file_mb")
    .eq("event_id", event.id)
    .single();

  const maxBytes = (Number(settings?.max_file_mb) || 5) * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`Ảnh quá lớn. Tối đa ${settings?.max_file_mb ?? 5}MB.`);
  }

  const allowed = await checkRateLimit(admin, event.id, ipHash);
  if (!allowed) {
    throw new Error("Bạn đã gửi quá số lần cho phép. Thử lại sau 24 giờ nhé.");
  }

  const token = nanoid(32);
  const submissionId = crypto.randomUUID();
  const slotIndex = await assignNextSlot(admin, event.id);

  const buffer = Buffer.from(await file.arrayBuffer());
  const { leafUrl, photoUrl } = await uploadSubmissionImages(
    submissionId,
    buffer
  );

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

  // Tính thần số học + lưu insights
  const numerology = calculateNumerology(dob);
  const lpContent = LIFE_PATH_CONTENT[numerology.lifePath];

  const personalization = await generatePersonalization(event.id, {
    name,
    major,
    wish,
    numerology,
  });

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
    ai_generated_at: new Date().toISOString(),
  });

  return {
    token,
    leafNumber: slotIndex + 1,
    submissionId,
  };
}
