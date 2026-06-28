import { scaleMaskToTarget, getMaskPoints } from "./mask";
import {
  computeTargetSlots,
  placeLeavesNatural,
  placeFallenLeaves,
} from "./placement";
import type {
  LayoutSettings,
  SubmissionForLayout,
  TreeLayout,
  TreeLeaf,
} from "./types";

const CANVAS_W = 900;
const CANVAS_H = 1100;

/** Vùng tán trên canvas (normalized) */
const CANOPY = { x: 0.08, y: 0.04, w: 0.84, h: 0.52 };
const TRUNK = { x: 0.42, y: 0.52, w: 0.16, h: 0.28 };

function getMajorColor(
  major: string,
  colors: Record<string, string>
): string {
  return colors[major] ?? colors["Khác"] ?? "#3DBE8B";
}

/** Chuyển slot normalized (trong mask 0..1) sang tọa độ canvas 0..1 */
function slotToCanvas(sx: number, sy: number): { x: number; y: number } {
  return {
    x: CANOPY.x + sx * CANOPY.w,
    y: CANOPY.y + sy * CANOPY.h,
  };
}

/**
 * Xây layout cây từ danh sách submission + settings.
 * Thuật toán co giãn: thiếu → filler; dư → lá rụng.
 */
export function buildTreeLayout(
  submissions: SubmissionForLayout[],
  settings: LayoutSettings,
  eventIdSeed = 42
): TreeLayout {
  const visible = submissions
    .filter((s) => !s.hidden)
    .sort((a, b) => (a.slot_index ?? 0) - (b.slot_index ?? 0));

  const n = visible.length;
  const targetSlots = computeTargetSlots(
    n,
    settings.fillRatio,
    settings.leavesMin,
    settings.leavesMax
  );

  const mask = scaleMaskToTarget(targetSlots);
  const maskPoints = getMaskPoints(mask);
  const rawSlots = placeLeavesNatural(maskPoints, eventIdSeed);

  // Giới hạn đúng số slot mục tiêu
  const canopySlots = rawSlots.slice(0, targetSlots);

  const leaves: TreeLeaf[] = [];
  const brandColor =
    settings.trunkConfig.brandColor ?? "#3DBE8B";

  // Gán submission vào slot theo slot_index
  const assigned = new Set<number>();

  for (const sub of visible) {
    const idx = sub.slot_index ?? leaves.filter((l) => !l.fallen).length;
    if (idx < canopySlots.length) {
      assigned.add(idx);
      const slot = canopySlots[idx];
      const pos = slotToCanvas(slot.x, slot.y);
      leaves.push({
        id: sub.id,
        submissionId: sub.id,
        slotIndex: idx,
        x: pos.x,
        y: pos.y,
        rotation: slot.rotation,
        scale: slot.scale,
        majorColor: getMajorColor(sub.major, settings.majorColors),
        leafUrl: sub.leaf_url,
        photoUrl: sub.photo_url,
        name: sub.name,
        major: sub.major,
        wish: sub.wish,
        token: sub.token,
      });
    }
  }

  // Overflow — DƯ người
  const overflow = visible.filter(
    (s) => (s.slot_index ?? 0) >= canopySlots.length
  );
  if (overflow.length > 0) {
    const fallenSlots = placeFallenLeaves(overflow.length, eventIdSeed + 1);
    overflow.forEach((sub, i) => {
      const slot = fallenSlots[i];
      if (!slot) return;
      leaves.push({
        id: sub.id,
        submissionId: sub.id,
        slotIndex: sub.slot_index ?? canopySlots.length + i,
        x: slot.x,
        y: slot.y,
        rotation: slot.rotation,
        scale: slot.scale,
        majorColor: getMajorColor(sub.major, settings.majorColors),
        leafUrl: sub.leaf_url,
        photoUrl: sub.photo_url,
        name: sub.name,
        major: sub.major,
        wish: sub.wish,
        token: sub.token,
        fallen: true,
      });
    });
  }

  // Filler — THIẾU người
  const usedInCanopy = leaves.filter((l) => !l.fallen).length;
  if (usedInCanopy < canopySlots.length) {
    for (let i = 0; i < canopySlots.length; i++) {
      if (assigned.has(i)) continue;
      const slot = canopySlots[i];
      const pos = slotToCanvas(slot.x, slot.y);
      leaves.push({
        id: `filler-${i}`,
        filler: true,
        slotIndex: i,
        x: pos.x,
        y: pos.y,
        rotation: slot.rotation,
        scale: slot.scale * 0.9,
        majorColor: brandColor,
        leafUrl: settings.fillerAssets[0] ?? null,
      });
    }
  }

  // Cột mốc nở hoa
  const blossomMilestone =
    n > 0 && n % settings.blossomEvery === 0 ? n : null;
  if (blossomMilestone) {
    // Đánh dấu vài lá blossom ngẫu nhiên
    const realLeaves = leaves.filter((l) => !l.filler && !l.fallen);
    const pick = realLeaves[blossomMilestone % realLeaves.length];
    if (pick) pick.blossom = true;
  }

  return {
    shape: settings.shape,
    resolution: targetSlots,
    dimensions: { width: CANVAS_W, height: CANVAS_H },
    canopy: CANOPY,
    trunk: {
      x: TRUNK.x,
      y: TRUNK.y,
      w: TRUNK.w,
      h: TRUNK.h,
      color: brandColor,
    },
    roots: {
      text: settings.rootsText,
      y: 0.88,
    },
    leaves,
    totalSubmissions: n,
    blossomMilestone,
  };
}

/** Chuyển layout sang dạng lưu mosaics */
export function layoutToMosaicLeaves(layout: TreeLayout) {
  return layout.leaves.map((l) => ({
    submission_id: l.submissionId,
    filler: l.filler ?? false,
    x: l.x,
    y: l.y,
    rotation: l.rotation,
    scale: l.scale,
    major_color: l.majorColor,
    fallen: l.fallen ?? false,
    blossom: l.blossom ?? false,
  }));
}
