/** Kiểu dữ liệu engine cây */

export interface TreeDimensions {
  width: number;
  height: number;
}

export interface TrunkConfig {
  brandColor?: string;
  images?: string[];
  widthRatio?: number;
  heightRatio?: number;
}

export interface LeafSlot {
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export interface TreeLeaf {
  id: string;
  submissionId?: string;
  filler?: boolean;
  slotIndex: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  majorColor: string;
  leafUrl?: string | null;
  photoUrl?: string | null;
  name?: string;
  major?: string;
  wish?: string;
  token?: string;
  hidden?: boolean;
  /** Lá rụng / overflow — hiển thị vùng dưới gốc */
  fallen?: boolean;
  /** Hoa trang trí cột mốc */
  blossom?: boolean;
}

export interface TreeLayout {
  shape: string;
  resolution: number;
  dimensions: TreeDimensions;
  /** vùng tán (normalized 0-1) */
  canopy: { x: number; y: number; w: number; h: number };
  trunk: {
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
  };
  roots: {
    text: string;
    y: number;
  };
  /** Vùng đất (normalized) */
  ground?: { y: number; h: number };
  leaves: TreeLeaf[];
  totalSubmissions: number;
  blossomMilestone: number | null;
}

export interface LayoutSettings {
  shape: string;
  fillRatio: number;
  leavesMin: number;
  leavesMax: number;
  blossomEvery: number;
  fillerAssets: string[];
  trunkConfig: TrunkConfig;
  rootsText: string;
  majorColors: Record<string, string>;
}

export interface SubmissionForLayout {
  id: string;
  token: string;
  name: string;
  major: string;
  wish: string;
  leaf_url: string | null;
  photo_url: string | null;
  slot_index: number | null;
  hidden: boolean;
}
