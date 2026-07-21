-- Nhãn đợt / lớp để phân biệt nhiều cây (không lẫn giữa các đợt)
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS batch_label TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS class_label TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN public.events.batch_label IS 'Đợt orientation / đợt thu thập (vd. Orientation 21/07/2026)';
COMMENT ON COLUMN public.events.class_label IS 'Lớp hoặc buổi (vd. Marketing sáng, CNTT chiều)';

-- Backfill nhẹ từ name hiện có nếu còn trống
UPDATE public.events
SET batch_label = name
WHERE COALESCE(TRIM(batch_label), '') = '' AND COALESCE(TRIM(name), '') <> '';
