/** Tìm lá theo tên (substring, không phân biệt hoa thường). */
import type { TreeLeaf } from "./types";

export function findLeafByName(
  leaves: TreeLeaf[],
  query: string
): TreeLeaf | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  return (
    leaves.find(
      (l) =>
        Boolean(l.submissionId) &&
        !l.filler &&
        Boolean(l.name) &&
        l.name!.toLowerCase().includes(q)
    ) ?? null
  );
}
