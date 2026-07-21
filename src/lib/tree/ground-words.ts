/**
 * Chữ rải trên mặt đất dưới gốc cây — Welcome đa ngôn ngữ,
 * ngành học (EN), và từ động lực nhiều thứ tiếng.
 */

export type GroundWordKind = "welcome" | "major" | "motivate";

export interface GroundWord {
  text: string;
  kind: GroundWordKind;
  /** 0–900 viewBox */
  x: number;
  /** ~820–1085 — vùng đất */
  y: number;
  /** độ nghiêng nhẹ */
  rotate: number;
  /** cỡ chữ */
  size: number;
  opacity: number;
}

/** Welcome / Xin chào — nhiều ngôn ngữ */
export const WELCOME_WORDS = [
  "Welcome",
  "Xin chào",
  "Bienvenue",
  "Willkommen",
  "Bienvenido",
  "Benvenuto",
  "Bem-vindo",
  "Welkom",
  "ようこそ",
  "환영합니다",
  "欢迎",
  "Selamat datang",
  "สวัสดี",
  "مرحبا",
  "Добро пожаловать",
  "Καλώς ήρθες",
  "Välkommen",
  "Tervetuloa",
  "Hoş geldiniz",
  "Mabuhay",
] as const;

/** Ngành học — bản tiếng Anh (Cao đẳng Việt Mỹ) */
export const MAJOR_WORDS_EN = [
  "Business Admin",
  "English",
  "Korean",
  "Chinese",
  "Japanese",
  "Software Apps",
  "Automotive",
  "Beauty Care",
  "Marketing",
  "Graphic Design",
] as const;

/** Từ động lực — EN + đa ngôn ngữ */
export const MOTIVATE_WORDS = [
  "Dream Big",
  "Keep Going",
  "Rise Up",
  "Be Bold",
  "Believe",
  "Create",
  "Grow",
  "Shine",
  "Courage",
  "Together",
  "Never Give Up",
  "You Belong",
  "Future Starts",
  "Be Kind",
  "Stay Curious",
  "Make It Happen",
  "Hãy dám mơ",
  "Tiến bước",
  "Cùng nhau",
  "Allez",
  "¡Ánimo!",
  "Forza",
  "Kämpfen",
  "がんばって",
  "화이팅",
  "加油",
  "Semangat",
  "สู้ๆ",
] as const;

/** Vị trí cố định — deterministic, không nhảy mỗi lần render */
export const GROUND_WORDS: GroundWord[] = [
  // Hàng gần gốc / cỏ
  { text: "Welcome", kind: "welcome", x: 95, y: 848, rotate: -8, size: 13, opacity: 0.55 },
  { text: "Xin chào", kind: "welcome", x: 210, y: 862, rotate: 4, size: 12, opacity: 0.5 },
  { text: "Marketing", kind: "major", x: 680, y: 852, rotate: 6, size: 11, opacity: 0.48 },
  { text: "Dream Big", kind: "motivate", x: 790, y: 868, rotate: -5, size: 12, opacity: 0.52 },
  { text: "Bienvenue", kind: "welcome", x: 130, y: 895, rotate: 7, size: 11, opacity: 0.42 },
  { text: "Software Apps", kind: "major", x: 280, y: 888, rotate: -4, size: 10, opacity: 0.4 },
  { text: "Keep Going", kind: "motivate", x: 620, y: 890, rotate: 5, size: 11, opacity: 0.45 },
  { text: "Willkommen", kind: "welcome", x: 760, y: 900, rotate: -7, size: 10, opacity: 0.4 },

  // Giữa đất
  { text: "Graphic Design", kind: "major", x: 90, y: 930, rotate: 5, size: 10, opacity: 0.38 },
  { text: "ようこそ", kind: "welcome", x: 220, y: 942, rotate: -6, size: 13, opacity: 0.44 },
  { text: "Be Bold", kind: "motivate", x: 340, y: 928, rotate: 8, size: 11, opacity: 0.42 },
  { text: "환영합니다", kind: "welcome", x: 560, y: 938, rotate: -4, size: 12, opacity: 0.42 },
  { text: "Automotive", kind: "major", x: 690, y: 948, rotate: 6, size: 10, opacity: 0.36 },
  { text: "Shine", kind: "motivate", x: 820, y: 932, rotate: -9, size: 12, opacity: 0.48 },
  { text: "English", kind: "major", x: 150, y: 968, rotate: 3, size: 11, opacity: 0.4 },
  { text: "欢迎", kind: "welcome", x: 300, y: 978, rotate: -5, size: 14, opacity: 0.4 },
  { text: "Together", kind: "motivate", x: 420, y: 962, rotate: 2, size: 11, opacity: 0.38 },
  { text: "Korean", kind: "major", x: 560, y: 975, rotate: 7, size: 11, opacity: 0.38 },
  { text: "Bienvenido", kind: "welcome", x: 700, y: 985, rotate: -6, size: 10, opacity: 0.36 },
  { text: "Hãy dám mơ", kind: "motivate", x: 820, y: 970, rotate: 4, size: 10, opacity: 0.4 },

  // Đáy
  { text: "Chinese", kind: "major", x: 70, y: 1010, rotate: -3, size: 10, opacity: 0.34 },
  { text: "Selamat datang", kind: "welcome", x: 200, y: 1022, rotate: 5, size: 9, opacity: 0.34 },
  { text: "Never Give Up", kind: "motivate", x: 380, y: 1008, rotate: -4, size: 10, opacity: 0.36 },
  { text: "Japanese", kind: "major", x: 540, y: 1020, rotate: 6, size: 10, opacity: 0.34 },
  { text: "Benvenuto", kind: "welcome", x: 680, y: 1030, rotate: -5, size: 10, opacity: 0.32 },
  { text: "화이팅", kind: "motivate", x: 810, y: 1015, rotate: 8, size: 12, opacity: 0.38 },
  { text: "Beauty Care", kind: "major", x: 110, y: 1050, rotate: 4, size: 9, opacity: 0.3 },
  { text: "สวัสดี", kind: "welcome", x: 260, y: 1058, rotate: -7, size: 11, opacity: 0.32 },
  { text: "You Belong", kind: "motivate", x: 420, y: 1045, rotate: 3, size: 10, opacity: 0.34 },
  { text: "Business Admin", kind: "major", x: 590, y: 1055, rotate: -4, size: 9, opacity: 0.3 },
  { text: "加油", kind: "motivate", x: 740, y: 1065, rotate: 6, size: 13, opacity: 0.36 },
  { text: "Bem-vindo", kind: "welcome", x: 860, y: 1048, rotate: -8, size: 9, opacity: 0.3 },
  { text: "Grow", kind: "motivate", x: 180, y: 1080, rotate: 5, size: 11, opacity: 0.28 },
  { text: "Mabuhay", kind: "welcome", x: 340, y: 1082, rotate: -3, size: 10, opacity: 0.28 },
  { text: "Create", kind: "motivate", x: 500, y: 1078, rotate: 4, size: 10, opacity: 0.28 },
  { text: "Semangat", kind: "motivate", x: 660, y: 1085, rotate: -5, size: 10, opacity: 0.28 },
  { text: "Believe", kind: "motivate", x: 800, y: 1075, rotate: 7, size: 11, opacity: 0.3 },
];

const KIND_FILL: Record<GroundWordKind, { normal: string; present: string }> = {
  welcome: { normal: "rgba(255, 236, 180, 0.95)", present: "#FFE8A8" },
  major: { normal: "rgba(190, 230, 210, 0.9)", present: "#B8E8C8" },
  motivate: { normal: "rgba(255, 220, 200, 0.9)", present: "#FFD8C8" },
};

export function groundWordFill(
  kind: GroundWordKind,
  presentation?: boolean
): string {
  return presentation ? KIND_FILL[kind].present : KIND_FILL[kind].normal;
}
