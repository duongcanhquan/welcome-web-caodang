import { createAdminClient } from "@/lib/supabase/admin";
import type { NumerologyResult } from "@/lib/numerology";
import { LIFE_PATH_CONTENT, getMajorMatchMessage } from "@/lib/numerology";
import {
  DEFAULT_NUMEROLOGY_PROMPT,
  NUMEROLOGY_OUTPUT_CONTRACT,
} from "@/lib/ai/numerology-prompt";
import {
  MIN_NUMEROLOGY_CHARS,
  isNumerologyLongEnough,
} from "@/lib/ai/numerology-length";

export { DEFAULT_NUMEROLOGY_PROMPT } from "@/lib/ai/numerology-prompt";
export {
  MIN_NUMEROLOGY_CHARS,
  isNumerologyLongEnough,
} from "@/lib/ai/numerology-length";

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface PersonalizationInput {
  name: string;
  major: string;
  wish: string;
  /** ISO YYYY-MM-DD — hệ thống tự format dd/mm/yyyy khi gửi AI */
  dob: string;
  numerology: NumerologyResult;
}

export interface PersonalizationOutput {
  numerologyText: string;
  wishComment: string;
  funFact: string;
}

function formatDobDisplay(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function buildSystemPrompt(custom?: string | null): string {
  const base =
    (custom && custom.trim()) || DEFAULT_NUMEROLOGY_PROMPT;
  return `${base.trim()}\n${NUMEROLOGY_OUTPUT_CONTRACT}`;
}

/** Gọi DeepSeek Chat API — bài dài cần token + timeout lớn */
export async function callDeepSeek(
  apiKey: string,
  model: string,
  messages: DeepSeekMessage[]
): Promise<string> {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.85,
      max_tokens: 8192,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API lỗi: ${res.status} — ${err}`);
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };

  return data.choices[0]?.message?.content ?? "";
}

/** Lấy JSON object từ raw (kể cả khi AI bọc ```json) */
function extractJsonObject(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) return trimmed;
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

function parsePersonalization(
  raw: string,
  fallback: PersonalizationOutput
): PersonalizationOutput {
  try {
    const parsed = JSON.parse(extractJsonObject(raw)) as Partial<PersonalizationOutput> & {
      numerology_text?: string;
      reading?: string;
    };
    const text =
      parsed.numerologyText?.trim() ||
      parsed.numerology_text?.trim() ||
      parsed.reading?.trim() ||
      "";
    return {
      numerologyText: text || fallback.numerologyText,
      wishComment: parsed.wishComment?.trim() || fallback.wishComment,
      funFact: parsed.funFact?.trim() || fallback.funFact,
    };
  } catch {
    // AI trả plain text dài — dùng luôn nếu đủ dài
    const plain = raw.replace(/```[\s\S]*?```/g, "").trim();
    if (isNumerologyLongEnough(plain)) {
      return {
        numerologyText: plain,
        wishComment: fallback.wishComment,
        funFact: fallback.funFact,
      };
    }
    return fallback;
  }
}

/** Lấy cấu hình DeepSeek từ event_secrets (admin-only table) */
export async function getEventSecrets(eventId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("event_secrets")
    .select("*")
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Tạo cá nhân hoá — fallback nội dung tĩnh nếu không có API key */
export async function generatePersonalization(
  eventId: string,
  input: PersonalizationInput,
  options?: { skipAi?: boolean }
): Promise<PersonalizationOutput> {
  const staticFallback = buildStaticPersonalization(input);

  if (options?.skipAi) {
    return staticFallback;
  }

  try {
    const secrets = await getEventSecrets(eventId);
    if (!secrets?.ai_enabled || !secrets.deepseek_api_key) {
      return staticFallback;
    }

    const lp = LIFE_PATH_CONTENT[input.numerology.lifePath];
    const systemPrompt = buildSystemPrompt(
      secrets.numerology_prompt || secrets.personalization_prompt
    );

    const userPayload = {
      name: input.name,
      dob: input.dob,
      dobDisplay: formatDobDisplay(input.dob),
      major: input.major,
      wish: input.wish,
      lifePath: input.numerology.lifePath,
      lifePathTitle: lp.keywords,
      lifePathSummary: lp.description,
      birthDay: input.numerology.birthDay,
      personalYear2026: input.numerology.personalYear,
      majorMatchHint: getMajorMatchMessage(
        input.numerology.lifePath,
        input.major
      ),
      suggestedCareers: lp.careers,
      writingRules: {
        language: "vi",
        numerologyTextMinWords: 800,
        numerologyTextTargetWords: "800-1200",
        mustCoverSections: [
          "1_chao_check_vibe",
          "2_green_red_flag",
          "3_ban_do_nghe",
          "4_cam_nang_nam_nhat",
        ],
      },
    };

    const userContent = `Dữ liệu sinh viên (dùng đúng các field, không bịa số):\n${JSON.stringify(userPayload, null, 2)}\n\nViết numerologyText ĐỦ DÀI (~800–1200 từ). Không tóm tắt ngắn.`;

    const messages: DeepSeekMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ];

    let result = parsePersonalization(
      await callDeepSeek(
        secrets.deepseek_api_key,
        secrets.deepseek_model ?? "deepseek-chat",
        messages
      ),
      staticFallback
    );

    // Nếu quá ngắn — nhắc viết lại đủ độ dài (tối đa 2 lần)
    for (let attempt = 0; attempt < 2; attempt++) {
      if (isNumerologyLongEnough(result.numerologyText)) break;

      const retryMessages: DeepSeekMessage[] = [
        ...messages,
        {
          role: "assistant",
          content: JSON.stringify({
            numerologyText: result.numerologyText.slice(0, 400) + "…",
            wishComment: result.wishComment,
            funFact: result.funFact,
          }),
        },
        {
          role: "user",
          content: `numerologyText mới chỉ có ${result.numerologyText.length} ký tự — QUÁ NGẮN. Viết LẠI toàn bộ JSON: numerologyText tối thiểu 1000 ký tự (mục tiêu 800–1200 từ), đủ 4 mục có đánh số và \\n. wishComment ≤2 câu, funFact 1 câu.`,
        },
      ];
      try {
        const retry = parsePersonalization(
          await callDeepSeek(
            secrets.deepseek_api_key,
            secrets.deepseek_model ?? "deepseek-chat",
            retryMessages
          ),
          result
        );
        if (
          (retry.numerologyText?.length ?? 0) >
          (result.numerologyText?.length ?? 0)
        ) {
          result = retry;
        }
      } catch {
        break;
      }
    }

    return result;
  } catch {
    return staticFallback;
  }
}

export function buildStaticPersonalization(
  input: PersonalizationInput
): PersonalizationOutput {
  const lp = LIFE_PATH_CONTENT[input.numerology.lifePath];
  const match = getMajorMatchMessage(input.numerology.lifePath, input.major);

  return {
    numerologyText: `${lp.description} ${match} (Cho vui & tham khảo nhé!)`,
    wishComment: input.wish
      ? `Ước mơ "${input.wish}" — rất đáng để theo đuổi trong 4 năm tới! 🌟`
      : "Hãy nuôi dưỡng ước mơ của bạn từng ngày một nhé!",
    funFact: `Năm 2026 với bạn mang năng lượng số ${input.numerology.personalYear} — hãy tận dụng năm đầu đại học!`,
  };
}
