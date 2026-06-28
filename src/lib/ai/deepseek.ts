import { createAdminClient } from "@/lib/supabase/admin";
import type { NumerologyResult } from "@/lib/numerology";
import { LIFE_PATH_CONTENT, getMajorMatchMessage } from "@/lib/numerology";

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface PersonalizationInput {
  name: string;
  major: string;
  wish: string;
  numerology: NumerologyResult;
}

export interface PersonalizationOutput {
  numerologyText: string;
  wishComment: string;
  funFact: string;
}

const DEFAULT_NUMEROLOGY_PROMPT = `Bạn là cố vấn vui vẻ cho sinh viên mới vào Cao đẳng Việt Mỹ.
Viết bằng tiếng Việt, giọng thân thiện, khích lệ, KHÔNG phán xét hay mê tín cực đoan.
Luôn nhắc "cho vui & tham khảo".
Trả lời JSON với keys: numerologyText (2-3 câu), wishComment (1 câu về ước mơ), funFact (1 câu thú vị).`;

/** Gọi DeepSeek Chat API */
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
      temperature: 0.8,
      max_tokens: 600,
      response_format: { type: "json_object" },
    }),
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
  input: PersonalizationInput
): Promise<PersonalizationOutput> {
  const staticFallback = buildStaticPersonalization(input);

  try {
    const secrets = await getEventSecrets(eventId);
    if (!secrets?.ai_enabled || !secrets.deepseek_api_key) {
      return staticFallback;
    }

    const lp = LIFE_PATH_CONTENT[input.numerology.lifePath];
    const systemPrompt =
      secrets.numerology_prompt ||
      secrets.personalization_prompt ||
      DEFAULT_NUMEROLOGY_PROMPT;

    const userContent = JSON.stringify({
      name: input.name,
      major: input.major,
      wish: input.wish,
      lifePath: input.numerology.lifePath,
      lifePathKeywords: lp.keywords,
      birthDay: input.numerology.birthDay,
      personalYear2026: input.numerology.personalYear,
      majorMatch: getMajorMatchMessage(input.numerology.lifePath, input.major),
    });

    const raw = await callDeepSeek(
      secrets.deepseek_api_key,
      secrets.deepseek_model ?? "deepseek-chat",
      [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Cá nhân hoá cho sinh viên:\n${userContent}`,
        },
      ]
    );

    const parsed = JSON.parse(raw) as Partial<PersonalizationOutput>;
    return {
      numerologyText: parsed.numerologyText ?? staticFallback.numerologyText,
      wishComment: parsed.wishComment ?? staticFallback.wishComment,
      funFact: parsed.funFact ?? staticFallback.funFact,
    };
  } catch {
    return staticFallback;
  }
}

function buildStaticPersonalization(
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
