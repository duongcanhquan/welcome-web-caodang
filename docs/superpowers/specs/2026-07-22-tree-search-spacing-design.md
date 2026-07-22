# Tree search + non-overlapping photos

**Date:** 2026-07-22  
**Status:** Approved (user OK)

## Problem

- Many photos overlap on the tree (especially N > 100: fast path drops min-distance).
- Hard to find someone by eye; Live has no name search (`/v` already does).
- Canopy placement stops around `y ≈ 0.48`, so trunk stays empty while the crown stacks.

## Goals

1. **Search (option A):** On Live (and keep on View): type name → highlight leaf + open info card. Tapping a photo still opens the card.
2. **No heavy overlap:** Every photo slot respects a minimum distance; when dense, shrink photo size so taps still work.
3. **Fill the tree downward:** Placement zones extend onto mid/lower trunk (~`y` up to ~0.65–0.68), not only the crown.

## Non-goals

- Multi-match “next result” cycling (deferred).
- Search UI in presentation / `?present=1`.
- Changing fallen-leaf ground logic beyond what overflow still needs.
- Redesigning SVG foliage art to match every trunk photo (photos may sit on bare trunk).

## Design

### Search

- Add compact name search to `LiveTreeView` (hidden when `fullscreen` / present).
- Behavior match Viewer: first substring match on `name` (case-insensitive) → `highlightedId` + open `LeafDetailCard` after short delay; optional firefly pulse.
- Keep existing Viewer search; extract a tiny shared helper if duplication is noisy.
- Click-to-open info unchanged on both surfaces.

### Placement

- Keep `FOLIAGE_CLUSTERS` for SVG canopy paint only.
- Add `TRUNK` / lower-branch photo zones; combine into `PHOTO_CLUSTERS` for slot generation.
- Raise vertical clamp so slots may land down the trunk (≈ `0.06 … 0.68`).
- **Always** enforce `minDist` (no “N > 100 skip”). Use a spatial hash / grid so large N stays fast.
- Adaptive `minDist` shrinks slightly as N grows (floor ~0.022 norm).
- `TreeCanvas` `baseLeafSize` scales with photo count ≈ `52 * sqrt(80 / max(N, 80))`, clamped ~28–58; hit radius multiplier ≈ 1.6 so small photos stay tappable.

### Layout refresh

- Existing `/api/tree` + `buildTreeLayout` path picks up new slots automatically after deploy; no DB migration.

## Success criteria

- At N=200 and N=600, pairwise slot distance mostly ≥ adaptive minDist (unit tests).
- Real photos appear below former canopy band (`y > 0.48`) when N is moderate+.
- Live search finds a student and opens their card; photo tap still works.
- Desktop/mobile tree framing unchanged (contain camera).
