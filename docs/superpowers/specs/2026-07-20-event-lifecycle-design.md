# Event lifecycle — lưu cũ, tạo mới, tải về

## Goal

Admin có thể giữ cây lớp cũ (xem công khai `/v/<slug>`), tạo cây mới cho lớp khác, và tải CSV + ZIP ảnh + PNG tổng hợp.

## Decisions

- Approach: vòng đời event trong Admin (một event `is_active` cho join/home).
- Cây cũ: công khai qua `/v/<slug>` (option B).
- Tải về: CSV + ZIP ảnh + PNG collage (option D).

## Data

- Thêm `events.is_active BOOLEAN NOT NULL DEFAULT false`.
- Unique partial index: tối đa một row `is_active = true`.
- Seed `k2026` → `is_active = true`.
- Không xoá event cũ khi tạo mới (cascade sẽ mất dữ liệu).

## Admin

- Tab **Cây**: danh sách event (tên, slug, status, số nộp, active).
- **Tạo cây mới**: name + slug; nếu event active đang `collecting` thì khoá trước (tuỳ chọn bắt buộc); copy `event_settings` từ event nguồn; set active mới.
- Chọn event để quản lý (`?event=<slug>`).
- Mỗi event: link xem/live, tải CSV / ZIP / PNG.

## Defaults

- `/join`, `/`, admin mặc định dùng event `is_active`.
- Fallback slug `k2026` nếu chưa có active.

## Exports (admin auth)

- CSV: submissions (name, dob, major, wish, urls, hidden, created_at).
- ZIP: `photo_url` (+ `leaf_url` nếu có), tên file theo token/name.
- PNG: collage từ ảnh theo vị trí mosaic (hoặc lưới nếu chưa khoá).

## Out of scope

- Xoá event, unlock, nhiều cây collecting song song, sửa majors trong UI.
