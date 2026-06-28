import type { NumerologyNumber } from "./reduce";

export interface LifePathContent {
  number: NumerologyNumber;
  keywords: string;
  description: string;
  careers: string[];
  freshmanAdvice: string;
}

/** Nội dung tiếng Việt cho từng Life Path — giọng vui, khích lệ */
export const LIFE_PATH_CONTENT: Record<NumerologyNumber, LifePathContent> = {
  1: {
    number: 1,
    keywords: "Thủ lĩnh, độc lập, tiên phong",
    description:
      "Bạn mang năng lượng của người mở đường — tự tin, quyết đoán và không ngại thử thách mới. Ở trường, bạn thường là người gợi ý ý tưởng đầu tiên!",
    careers: ["Khởi nghiệp", "Quản lý", "Kinh doanh", "Lãnh đạo dự án"],
    freshmanAdvice:
      "Năm đầu đại học, hãy tham gia ít nhất một CLB hoặc dự án nhóm — đó là sân chơi hoàn hảo để rèn khả năng dẫn dắt của bạn.",
  },
  2: {
    number: 2,
    keywords: "Hợp tác, tinh tế, ngoại giao",
    description:
      "Bạn có khả năng lắng nghe và kết nối mọi người — như keo dán của team. Sự nhạy cảm giúp bạn hiểu bạn bè và thầy cô rất nhanh.",
    careers: ["Nhân sự", "Tư vấn", "Sư phạm", "CSKH", "Hòa giải"],
    freshmanAdvice:
      "Đừng ngại mở lòng với bạn cùng lớp — sức mạnh của bạn nằm ở mối quan hệ tốt đẹp bạn xây dựng được.",
  },
  3: {
    number: 3,
    keywords: "Sáng tạo, biểu đạt, vui vẻ",
    description:
      "Bạn mang năng lượng tích cực và óc sáng tạo — luôn biết cách làm không khí vui hơn. Thích hợp với mọi thứ liên quan đến giao tiếp và nghệ thuật.",
    careers: [
      "Thiết kế",
      "Truyền thông",
      "Marketing",
      "Nghệ thuật",
      "MC / Host",
    ],
    freshmanAdvice:
      "Hãy thử nhiều hoạt động ngoại khóa — bạn sẽ bất ngờ vì tài năng biểu đạt của mình!",
  },
  4: {
    number: 4,
    keywords: "Kỷ luật, thực tế, đáng tin",
    description:
      "Bạn là người bạn đồng hành đáng tin cậy — có kỷ luật, làm việc bài bản và hoàn thành tốt những gì đã cam kết.",
    careers: ["IT", "Kỹ thuật", "Kế toán", "Vận hành", "Quản lý dự án"],
    freshmanAdvice:
      "Lập thói quen học đều mỗi ngày — nền tảng vững chắc sẽ giúp bạn vượt xa bạn bè về lâu dài.",
  },
  5: {
    number: 5,
    keywords: "Tự do, linh hoạt, ham khám phá",
    description:
      "Bạn yêu sự mới mẻ và không thích bị gò bó — thích khám phá, du lịch và trải nghiệm. Linh hoạt là siêu năng lực của bạn!",
    careers: ["Du lịch", "Bán hàng", "Ngoại ngữ", "Truyền thông", "Event"],
    freshmanAdvice:
      "Tận dụng cơ hội thực tập và trao đổi sinh viên — mỗi trải nghiệm mới đều là bài học quý.",
  },
  6: {
    number: 6,
    keywords: "Trách nhiệm, ấm áp, thẩm mỹ",
    description:
      "Bạn có trái tim ấm và gu thẩm mỹ tốt — luôn quan tâm đến người xung quanh và tạo không gian đẹp, thoải mái.",
    careers: ["Y tế", "Giáo dục", "Dịch vụ", "Ẩm thực", "Nội thất"],
    freshmanAdvice:
      "Hãy cân bằng giữa việc giúp đỡ người khác và chăm sóc bản thân — bạn xứng đáng được yêu thương!",
  },
  7: {
    number: 7,
    keywords: "Phân tích, sâu sắc, nghiên cứu",
    description:
      "Bạn thích suy ngẫm và đi sâu vào vấn đề — óc phân tích nhạy bén, phù hợp với nghiên cứu và công nghệ chuyên sâu.",
    careers: ["Dữ liệu", "Khoa học", "IT chuyên sâu", "Học thuật", "Phân tích"],
    freshmanAdvice:
      "Đừng ngại ở một mình để học — thời gian suy ngẫm sâu là nơi bạn tỏa sáng nhất.",
  },
  8: {
    number: 8,
    keywords: "Tham vọng, tổ chức, tài chính",
    description:
      "Bạn có tầm nhìn lớn và khả năng tổ chức tốt — hướng đến thành công vật chất và vị thế trong xã hội.",
    careers: [
      "Quản trị kinh doanh",
      "Tài chính",
      "Ngân hàng",
      "Điều hành",
      "Luật",
    ],
    freshmanAdvice:
      "Đặt mục tiêu rõ ràng cho 4 năm đại học — bạn có tiềm năng đạt những điều lớn lao!",
  },
  9: {
    number: 9,
    keywords: "Nhân ái, lý tưởng, truyền cảm hứng",
    description:
      "Bạn mang tinh thần nhân văn — muốn đóng góp cho cộng đồng và truyền cảm hứng cho người khác.",
    careers: ["Giáo dục", "Cộng đồng", "Nghệ thuật", "Từ thiện", "Truyền thông xã hội"],
    freshmanAdvice:
      "Tham gia hoạt động tình nguyện — đó là nơi bạn tìm thấy ý nghĩa thật sự của đại học.",
  },
  11: {
    number: 11,
    keywords: "Trực giác, truyền cảm hứng (nâng cao của 2)",
    description:
      "Bạn mang năng lượng truyền cảm hứng đặc biệt — trực giác mạnh, có khả năng thấu hiểu và dẫn dắt người khác theo cách riêng.",
    careers: ["Diễn giả", "Sáng tạo", "Tâm lý", "Dẫn dắt", "Huấn luyện"],
    freshmanAdvice:
      "Tin vào trực giác của mình khi chọn ngành và bạn bè — bạn biết điều gì phù hợp với mình!",
  },
  22: {
    number: 22,
    keywords: "Kiến tạo lớn (nâng cao của 4)",
    description:
      "Bạn có khả năng biến ý tưởng lớn thành hiện thực — kết hợp tầm nhìn và kỷ luật để xây dựng điều có ý nghĩa.",
    careers: [
      "Kiến trúc",
      "Kỹ sư hệ thống",
      "Sáng lập quy mô lớn",
      "Quy hoạch",
      "Công trình",
    ],
    freshmanAdvice:
      "Bắt đầu từ dự án nhỏ nhưng nghĩ xa — mỗi bước đi đều góp phần vào thành tựu lớn sau này.",
  },
  33: {
    number: 33,
    keywords: "Người thầy / chữa lành (nâng cao của 6)",
    description:
      "Bạn mang sứ mệnh chăm sóc và giáo dục — có khả năng chữa lành và nâng đỡ người khác bằng sự ấm áp chân thành.",
    careers: ["Giáo dục", "Y tế", "Công tác cộng đồng", "Tư vấn", "Yoga / wellness"],
    freshmanAdvice:
      "Hãy là người bạn đồng hành tích cực cho bạn cùng lớp — sự ấm áp của bạn thay đổi cuộc sống người khác.",
  },
};

/** So khớp Life Path với ngành sinh viên chọn */
export function getMajorMatchMessage(
  lifePath: NumerologyNumber,
  major: string
): string {
  const content = LIFE_PATH_CONTENT[lifePath];
  const majorLower = major.toLowerCase();

  const matched = content.careers.some(
    (c) =>
      majorLower.includes(c.toLowerCase()) ||
      c.toLowerCase().includes(majorLower.split(" ")[0] ?? "")
  );

  if (matched) {
    return `Số Đường Đời ${lifePath} của bạn rất hợp với ngành ${major} — ${content.keywords.toLowerCase()} chính là thế mạnh cần cho ngành này! 🌟`;
  }

  return `Số Đường Đời ${lifePath} (${content.keywords}) mang đến góc nhìn độc đáo cho ngành ${major} — hãy kết hợp đam mê ngành học với thế mạnh cá nhân nhé! 🌿`;
}
