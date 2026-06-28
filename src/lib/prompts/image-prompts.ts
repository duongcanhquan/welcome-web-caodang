import { EVENT_MAJORS } from "@/lib/constants";

export type PromptStyleId = "modern" | "pencil" | "playful";

export interface ImagePromptStyle {
  id: PromptStyleId;
  label: string;
  emoji: string;
  description: string;
  buildPrompt: (major: string) => string;
}

const CAREER_SCENE: Record<string, string> = {
  "Quản trị doanh nghiệp":
    "quản lý doanh nghiệp trong văn phòng hiện đại, họp chiến lược",
  "Tiếng Anh":
    "giảng viên / biên dịch viên tiếng Anh trong lớp học quốc tế",
  "Tiếng Hàn":
    "chuyên viên ngôn ngữ Hàn Quốc, văn phòng đa văn hóa",
  "Tiếng Trung":
    "phiên dịch viên / giáo viên tiếng Trung trong môi trường giao thương",
  "Tiếng Nhật":
    "chuyên viên tiếng Nhật trong công ty công nghệ hoặc dịch vụ",
  "Ứng Dụng Phần mềm":
    "lập trình viên phần mềm với màn hình code và laptop",
  "Công nghệ ô tô":
    "kỹ thuật viên ô tô trong xưởng hiện đại, xe điện công nghệ cao",
  "Chăm sóc sắc đẹp":
    "chuyên viên làm đẹp / spa chuyên nghiệp, studio sáng",
  Marketing:
    "chuyên viên marketing sáng tạo, chiến dịch truyền thông số",
  "Thiết kế đồ họa":
    "nhà thiết kế đồ họa với bảng vẽ kỹ thuật số, studio sáng tạo",
};

const FACE_RULE =
  "QUAN TRỌNG: Giữ nguyên 100% khuôn mặt, đặc điểm nhận dạng, biểu cảm và tỷ lệ mặt từ ảnh gốc — KHÔNG thay đổi, làm đẹp quá mức, hoán đổi hoặc vẽ lại mặt.";

function careerFor(major: string): string {
  return (
    CAREER_SCENE[major] ??
    "sinh viên tốt nghiệp tự tin trong môi trường nghề nghiệp tương lai"
  );
}

export const IMAGE_PROMPT_STYLES: ImagePromptStyle[] = [
  {
    id: "modern",
    label: "Hiện đại",
    emoji: "✨",
    description: "Ảnh profile chuyên nghiệp, ánh sáng studio",
    buildPrompt: (major) =>
      `Tôi đính kèm ảnh chân dung của mình. Hãy chỉnh sửa ảnh này theo hướng sau:

${FACE_RULE}

Ngành nghề tương lai: ${major}
Bối cảnh nghề nghiệp: ${careerFor(major)}

Phong cách: HIỆN ĐẠI — ảnh profile chuyên nghiệp, ánh sáng studio mềm, màu sắc tươi sáng tự nhiên, trang phục công sở phù hợp ngành, nền bokeh nhẹ (văn phòng / studio). Chất lượng 4K, sắc nét, tông màu ấm.

Xuất ảnh hoàn chỉnh để tải về, tỷ lệ 3:4 hoặc 1:1.`,
  },
  {
    id: "pencil",
    label: "Vẽ chì",
    emoji: "✏️",
    description: "Minh họa sketch chì đen trắng có chiều sâu",
    buildPrompt: (major) =>
      `Tôi đính kèm ảnh chân dung của mình. Hãy chỉnh sửa ảnh này theo hướng sau:

${FACE_RULE}

Ngành nghề tương lai: ${major}
Bối cảnh nghề nghiệp: ${careerFor(major)}

Phong cách: VẼ CHÌ (pencil sketch) — minh họa tay bằng bút chì graphite, đen trắng với đổ bóng chéo (cross-hatching), nét vẽ nghệ thuật nhưng vẫn nhận diện được khuôn mặt thật. Thêm chi tiết ngành nghề xung quanh (phụ kiện, không gian làm việc) bằng nét phác thảo.

Xuất ảnh hoàn chỉnh để tải về, giấy trắng kem, viền sạch.`,
  },
  {
    id: "playful",
    label: "Nghịch ngợm",
    emoji: "🎨",
    description: "Cartoon vui nhộn, màu tươi, phụ kiện ngành nghề",
    buildPrompt: (major) =>
      `Tôi đính kèm ảnh chân dung của mình. Hãy chỉnh sửa ảnh này theo hướng sau:

${FACE_RULE}

Ngành nghề tương lai: ${major}
Bối cảnh nghề nghiệp: ${careerFor(major)}

Phong cách: NGHỊCH NGỢM — illustration cartoon vui tươi, màu pastel rực rỡ, đường nét mềm, có thể thêm phụ kiện hài hước liên quan ngành nghề (mũ, đạo cụ, sticker). Năng lượng trẻ trung, thân thiện như mascot trường học, không quá biến dạng mặt.

Xuất ảnh hoàn chỉnh để tải về, nền gradient vui nhộn.`,
  },
];

export const PROMPT_MAJORS = [...EVENT_MAJORS];
