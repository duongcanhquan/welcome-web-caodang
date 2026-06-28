import { ViewerTreeView } from "@/components/tree/ViewerTreeView";
import {
  buildDemoTreeLayout,
  DEMO_HIGHLIGHT_ID,
} from "@/lib/demo/mock-tree-layout";

export const metadata = {
  title: "Demo — Cây Khóa hoàn chỉnh (xem trước)",
  description: "Xem trước cây Khóa 2026 với ~95 lá sinh viên mẫu",
};

export default async function DemoTreePage({
  searchParams,
}: {
  searchParams: Promise<{ present?: string; highlight?: string }>;
}) {
  const { present, highlight } = await searchParams;
  const layout = buildDemoTreeLayout(95);

  const dobMap = Object.fromEntries(
    layout.leaves
      .filter((l) => l.submissionId)
      .map((l, i) => [
        l.submissionId!,
        `200${(i % 8) + 1}-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, "0")}`,
      ])
  );

  return (
    <ViewerTreeView
      eventSlug="k2026"
      layout={layout}
      presentation={present === "1"}
      highlightId={highlight ?? DEMO_HIGHLIGHT_ID}
      dobMap={dobMap}
      demoBanner
    />
  );
}
