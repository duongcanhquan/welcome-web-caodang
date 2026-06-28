import { buildTreeLayout } from "@/lib/tree/build-layout";
import { EVENT_MAJORS } from "@/lib/constants";
import type { SubmissionForLayout, TreeLayout } from "@/lib/tree/types";

const DEMO_NAMES = [
  "Nguyễn Minh Anh", "Trần Quốc Bảo", "Lê Thị Cúc", "Phạm Đức Dũng", "Hoàng Mai",
  "Vũ Thanh Hà", "Đặng Kim Ngân", "Bùi Văn Phúc", "Đỗ Thu Quỳnh", "Ngô Hữu Sơn",
  "Dương Thị Lan", "Lý Quang Minh", "Mai Thu Hương", "Trịnh Bảo Châu", "Cao Đình Khang",
  "Phan Ngọc Linh", "Hồ Việt Long", "Tạ Minh Nhật", "Võ Thảo My", "Chu Gia Bảo",
  "Lương Thùy Dương", "Hà Nhật Minh", "Tôn Bích Ngọc", "Quách Đức Anh", "La Thị Oanh",
  "Uông Minh Phát", "Triệu Hồng Quân", "Tăng Thị Sen", "Ông Văn Tài", "Thái Ngọc Uyên",
  "Kiều Minh Vũ", "Lâm Thị Xuân", "Mạc Quốc Yến", "Ninh Đức An", "Phùng Thị Bích",
  "Quản Thị Chi", "Sơn Minh Đức", "Từ Văn Em", "Ưng Thị Phương", "Vương Quốc Huy",
  "Xa Thị Giang", "Yên Minh Hùng", "An Thị Kiều", "Bạch Văn Lâm", "Chiêm Thị Mai",
  "Diệp Quốc Nam", "Giang Thị Oanh", "Hạnh Văn Phong", "Khương Thị Quyên", "Long Minh Sơn",
  "Mộc Thị Trang", "Nhâm Văn Uy", "Phúc Thị Vân", "Sầm Quốc Vinh", "Thiên Thị Yến",
  "Uyên Văn An", "Viên Thị Bảo", "Xuân Minh Cường", "Yến Thị Diệu", "Ánh Văn Đạt",
  "Bình Thị Hạnh", "Cường Minh Hải", "Dung Văn Khôi", "Em Thị Linh", "Phúc Anh Tuấn",
  "Gia Hân", "Huy Hoàng", "Khánh Ly", "Minh Châu", "Ngọc Ánh", "Phương Thảo",
  "Quốc Thịnh", "Thanh Tùng", "Uyên Nhi", "Văn Hưng", "Xuân Mai", "Yến Nhi",
  "Anh Khoa", "Bảo Ngọc", "Cẩm Ly", "Đức Thắng", "Hà My", "Kiên Cường",
  "Lan Anh", "Mỹ Duyên", "Nam Phương", "Oanh Thơ", "Phúc Hưng", "Quỳnh Anh",
  "Sỹ Hoàng", "Thùy Linh", "Uyên Vy", "Vĩnh Thịnh", "Xuân Đan", "Yên Chi",
  "An Bình", "Bích Đào", "Cát Tường", "Diễm Quỳnh", "Hải Đăng", "Kim Oanh",
];

const DEMO_MAJOR_COLORS: Record<string, string> = {
  "Quản trị doanh nghiệp": "#6B8CFF",
  "Tiếng Anh": "#FF6FA5",
  "Tiếng Hàn": "#FFAE3B",
  "Tiếng Trung": "#FF6B5A",
  "Tiếng Nhật": "#B8A9C9",
  "Ứng Dụng Phần mềm": "#3DBE8B",
  "Công nghệ ô tô": "#4A90D9",
  "Chăm sóc sắc đẹp": "#FF8FAB",
  "Marketing": "#FFD15C",
  "Thiết kế đồ họa": "#E879F9",
};

function createMockSubmissions(count: number): SubmissionForLayout[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `demo-sub-${i}`,
    token: `demo-token-${i}`,
    name: DEMO_NAMES[i % DEMO_NAMES.length] ?? `Sinh viên ${i + 1}`,
    major: EVENT_MAJORS[i % EVENT_MAJORS.length],
    wish: "",
    leaf_url: `https://i.pravatar.cc/128?img=${(i % 70) + 1}`,
    photo_url: null,
    slot_index: i,
    hidden: false,
  }));
}

/** Cây demo ~95 lá — xem trước layout hoàn chỉnh */
export function buildDemoTreeLayout(studentCount = 95): TreeLayout {
  const submissions = createMockSubmissions(studentCount);
  return buildTreeLayout(
    submissions,
    {
      shape: "tree",
      fillRatio: 0.9,
      leavesMin: 40,
      leavesMax: 1500,
      blossomEvery: 50,
      fillerAssets: [],
      trunkConfig: { brandColor: "#3DBE8B", images: [] },
      rootsText: "Khóa 2026 · Việt Mỹ College · Hà Nội",
      majorColors: DEMO_MAJOR_COLORS,
    },
    2026
  );
}

export const DEMO_HIGHLIGHT_ID = "demo-sub-12";
