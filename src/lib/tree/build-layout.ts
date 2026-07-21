import { generatePhotoSlotsOnTree } from "./branch-slots";
import {
  computeTargetSlots,
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

const TRUNK = { x: 0.44, y: 0.48, w: 0.12, h: 0.32 };
const GROUND = { y: 0.74, h: 0.26 };
const CANOPY = { x: 0.02, y: 0.06, w: 0.96, h: 0.42 };

function getMajorColor(
  major: string,
  colors: Record<string, string>
): string {
  return colors[major] ?? colors["Khác"] ?? "#3DBE8B";
}

/**
 * Xây layout: ảnh gắn trên tán cây lớn (không phải ảnh = tán).
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

  const canopySlots = generatePhotoSlotsOnTree(targetSlots, eventIdSeed);

  const leaves: TreeLeaf[] = [];
  const brandColor = settings.trunkConfig.brandColor ?? "#5c3d28";

  // Xếp theo thứ tự (đã sort slot_index) — không dùng slot_index thô làm toạ độ
  // (tránh lỗ hổng / số slot lớn → toàn bộ ảnh bị đánh dấu fallen và biến mất trên Live)
  const onCanopy = visible.slice(0, canopySlots.length);
  const overflow = visible.slice(canopySlots.length);

  onCanopy.forEach((sub, idx) => {
    const slot = canopySlots[idx];
    leaves.push({
      id: sub.id,
      submissionId: sub.id,
      slotIndex: idx,
      x: slot.x,
      y: slot.y,
      rotation: slot.rotation,
      scale: slot.scale,
      majorColor: getMajorColor(sub.major, settings.majorColors),
      leafUrl: sub.leaf_url || sub.photo_url,
      photoUrl: sub.photo_url || sub.leaf_url,
      name: sub.name,
      major: sub.major,
      wish: sub.wish,
      token: sub.token,
    });
  });

  if (overflow.length > 0) {
    const fallenSlots = placeFallenLeaves(overflow.length, eventIdSeed + 1);
    overflow.forEach((sub, i) => {
      const slot = fallenSlots[i];
      if (!slot) return;
      leaves.push({
        id: sub.id,
        submissionId: sub.id,
        slotIndex: canopySlots.length + i,
        x: slot.x,
        y: slot.y,
        rotation: slot.rotation,
        scale: slot.scale,
        majorColor: getMajorColor(sub.major, settings.majorColors),
        leafUrl: sub.leaf_url || sub.photo_url,
        photoUrl: sub.photo_url || sub.leaf_url,
        name: sub.name,
        major: sub.major,
        wish: sub.wish,
        token: sub.token,
        fallen: true,
      });
    });
  }

  const usedInCanopy = onCanopy.length;
  if (usedInCanopy < canopySlots.length) {
    for (let i = usedInCanopy; i < canopySlots.length; i++) {
      const slot = canopySlots[i];
      leaves.push({
        id: `filler-${i}`,
        filler: true,
        slotIndex: i,
        x: slot.x,
        y: slot.y,
        rotation: slot.rotation,
        scale: slot.scale * 0.85,
        majorColor: brandColor,
        leafUrl: settings.fillerAssets[0] ?? null,
      });
    }
  }

  const blossomMilestone =
    n > 0 && n % settings.blossomEvery === 0 ? n : null;
  if (blossomMilestone) {
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
      y: GROUND.y + GROUND.h * 0.72,
    },
    ground: GROUND,
    leaves,
    totalSubmissions: n,
    blossomMilestone,
  };
}

/** Chỉ lưu lá thật — filler tái tạo khi đọc (mosaic nhỏ, chốt nhanh) */
export function layoutToMosaicLeaves(layout: TreeLayout) {
  return layout.leaves
    .filter((l) => !l.filler && l.submissionId)
    .map((l) => ({
      submission_id: l.submissionId,
      filler: false,
      x: l.x,
      y: l.y,
      rotation: l.rotation,
      scale: l.scale,
      major_color: l.majorColor,
      fallen: l.fallen ?? false,
      blossom: l.blossom ?? false,
    }));
}
