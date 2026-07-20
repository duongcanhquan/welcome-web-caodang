# Event Lifecycle Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax.

**Goal:** Admin quản lý nhiều cây (lưu cũ, tạo mới, tải CSV/ZIP/PNG), public vẫn xem `/v/<slug>`.

**Architecture:** Cột `is_active` trên `events`; helper `getActiveEvent`; API admin events + export; tab Admin "Cây"; home/join/admin đọc active event.

**Tech Stack:** Next.js App Router, Supabase, sharp, jszip.

## Global Constraints

- Không xoá event cũ khi tạo mới.
- Chỉ admin gọi create/activate/export.
- Giữ pattern admin auth hiện có (`app_metadata.role === 'admin'`).

---

### Task 1: Migration + types + getActiveEvent

**Files:**
- Create: `supabase/migrations/20260720000000_events_is_active.sql`
- Create: `src/lib/events/active.ts`
- Modify: `src/lib/types/database.ts`, `src/lib/constants.ts`

- [ ] Add `is_active`, backfill k2026, unique partial index
- [ ] Update `Event` type
- [ ] `getActiveEvent()` / `getEventBySlug()`

### Task 2: Admin events API

**Files:**
- Create: `src/app/api/admin/events/route.ts`
- Create: `src/app/api/admin/events/[id]/route.ts`
- Create: `src/lib/events/create-event.ts`
- Create: `src/lib/admin/require-admin.ts`

- [ ] GET list (+ counts)
- [ ] POST create (lock previous optional, copy settings, set active)
- [ ] PATCH activate / switch

### Task 3: Export API

**Files:**
- Create: `src/app/api/admin/events/[id]/export/route.ts`
- Create: `src/lib/events/export.ts`
- Add dep: `jszip`

- [ ] `?format=csv|zip|png`

### Task 4: Admin UI + wire defaults

**Files:**
- Create: `src/components/admin/AdminEventsPanel.tsx`
- Modify: `AdminDashboard.tsx`, `admin/submissions/page.tsx`, `page.tsx`, `HomePageClient.tsx`, `join/page.tsx`

- [ ] Tab Cây + downloads
- [ ] `?event=` for current management target
- [ ] Home/join use active slug
