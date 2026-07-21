/** Ngưỡng độ dài bài thần số — an toàn import client + server */

/** Tối thiểu ~1000 ký tự (user yêu cầu ≥1000 chữ) */
export const MIN_NUMEROLOGY_CHARS = 1000;

export function isNumerologyLongEnough(text: string | undefined | null): boolean {
  return (text?.trim().length ?? 0) >= MIN_NUMEROLOGY_CHARS;
}
