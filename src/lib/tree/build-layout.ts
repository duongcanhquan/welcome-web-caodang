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
  const assigned = new Set<number>();

  for (const sub of visible) {
    const idx = sub.slot_index ?? leaves.filter((l) => !l.fallen).length;
    if (idx < canopySlots.length) {
      assigned.add(idx);
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
        leafUrl: sub.leaf_url,
        photoUrl: sub.photo_url,
        name: sub.name,
        major: sub.major,
        wish: sub.wish,
        token: sub.token,
      });
    }
  }

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

  const usedInCanopy = leaves.filter((l) => !l.fallen).length;
  if (usedInCanopy < canopySlots.length) {
    for (let i = 0; i < canopySlots.length; i++) {
      if (assigned.has(i)) continue;
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
