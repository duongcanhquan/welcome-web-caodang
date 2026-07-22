# Tree search + spacing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or implement directly in-session). Steps use TDD where noted.

**Goal:** Name search on Live (highlight + info card) and non-overlapping photo slots that fill down the trunk.

**Architecture:** Slot math stays in `branch-slots.ts` (photo zones ≠ SVG foliage). Density sizing in `TreeCanvas`. Search UI on `LiveTreeView` mirroring Viewer.

**Tech stack:** TypeScript, Vitest, React client components.

---

### Task 1: Non-overlapping + trunk zones

**Files:**
- Modify: `src/lib/tree/branch-slots.ts`
- Modify: `src/lib/tree/branch-slots.test.ts` (create if missing)
- Modify: `src/lib/tree/build-layout.test.ts` (optional assertion on y span)

**Steps:**
1. Write failing tests: N=150 and N=400 slots have min pairwise distance ≥ floor; some slots with `y > 0.48`.
2. Implement PHOTO_CLUSTERS (canopy + trunk), spatial-hash minDist placer, remove N>100 fast path that skips distance.
3. Run vitest for branch-slots / build-layout — pass.

### Task 2: Density leaf size + hit pad

**Files:**
- Modify: `src/components/tree/TreeCanvas.tsx`
- Optional small pure helper + test: `src/lib/tree/leaf-size.ts`

**Steps:**
1. Add `computeBaseLeafSize(n, mode, presentation)` with clamp 28–58.
2. Use in TreeCanvas; bump hit multiplier to ~1.6.
3. Smoke build.

### Task 3: Live name search

**Files:**
- Modify: `src/components/tree/LiveTreeView.tsx`
- Optionally: `src/lib/tree/find-leaf.ts` shared with Viewer

**Steps:**
1. Add search state + input when `!fullscreen`.
2. On find: set highlightedId, open LeafDetailCard (same as Viewer A).
3. Pass `highlightedId` into TreeCanvas.

### Task 4: Verify + ship

1. `npx vitest run src/lib/tree`
2. `npm run build`
3. Commit + push
