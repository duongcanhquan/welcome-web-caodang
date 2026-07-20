-- Event lifecycle: một event đang chạy (is_active), các event cũ giữ để xem lại

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT false;

-- Chọn đúng 1 event active: ưu tiên k2026, rồi collecting, rồi mới nhất
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      ORDER BY
        (slug = 'k2026') DESC,
        (status = 'collecting') DESC,
        created_at DESC
    ) AS rn
  FROM public.events
)
UPDATE public.events e
SET is_active = (r.rn = 1)
FROM ranked r
WHERE e.id = r.id;

CREATE UNIQUE INDEX IF NOT EXISTS events_one_active
  ON public.events (is_active)
  WHERE is_active = true;
