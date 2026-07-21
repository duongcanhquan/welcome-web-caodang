export { buildTreeLayout, layoutToMosaicLeaves } from "./build-layout";
export { generatePhotoSlotsOnTree, FOLIAGE_CLUSTERS } from "./branch-slots";
export { computeTargetSlots, placeLeavesNatural } from "./placement";
export { hashEventId } from "./hash-event-id";
export type {
  TreeLayout,
  TreeLeaf,
  LayoutSettings,
  SubmissionForLayout,
} from "./types";

/** SVG path clip hình trái tim — dùng cho lá */
export const HEART_CLIP_PATH =
  "M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z";

/** viewBox cho clip path */
export const HEART_VIEWBOX = "0 0 24 22";
