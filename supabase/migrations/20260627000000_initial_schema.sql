-- Cây Khóa 2026 — schema + RLS + seed event mẫu
-- Chạy trên Supabase SQL Editor hoặc: supabase db push

-- ─── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── events ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'collecting'
                CHECK (status IN ('collecting', 'locked')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── event_settings (ngưỡng cấu hình — KHÔNG hard-code trong code) ──
CREATE TABLE IF NOT EXISTS public.event_settings (
  event_id        UUID PRIMARY KEY REFERENCES public.events(id) ON DELETE CASCADE,
  shape           TEXT NOT NULL DEFAULT 'tree',
  majors          JSONB NOT NULL DEFAULT '[]'::jsonb,
  fill_ratio      NUMERIC(4,3) NOT NULL DEFAULT 0.900,
  leaves_min      INTEGER NOT NULL DEFAULT 40,
  leaves_max      INTEGER NOT NULL DEFAULT 1500,
  blossom_every   INTEGER NOT NULL DEFAULT 50,
  filler_assets   JSONB NOT NULL DEFAULT '[]'::jsonb,
  trunk_config    JSONB NOT NULL DEFAULT '{}'::jsonb,
  roots_text      TEXT NOT NULL DEFAULT '',
  max_file_mb     NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  rate_limit_per_ip INTEGER NOT NULL DEFAULT 3,
  major_colors    JSONB NOT NULL DEFAULT '{}'::jsonb,
  policy_url      TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── submissions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.submissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  dob         DATE NOT NULL,
  major       TEXT NOT NULL,
  wish        TEXT NOT NULL DEFAULT '',
  leaf_url    TEXT,
  photo_url   TEXT,
  slot_index  INTEGER,
  x           NUMERIC(8,4),
  y           NUMERIC(8,4),
  rotation    NUMERIC(8,4),
  scale       NUMERIC(6,4),
  hidden      BOOLEAN NOT NULL DEFAULT false,
  ip_hash     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submissions_event_id ON public.submissions(event_id);
CREATE INDEX IF NOT EXISTS idx_submissions_token ON public.submissions(token);
CREATE INDEX IF NOT EXISTS idx_submissions_event_visible
  ON public.submissions(event_id) WHERE hidden = false;

-- ─── mosaics (layout đã chốt, versioned) ────────────────────
CREATE TABLE IF NOT EXISTS public.mosaics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  version     INTEGER NOT NULL DEFAULT 1,
  shape       TEXT NOT NULL,
  resolution  INTEGER NOT NULL,
  trunk_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  roots_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  leaves      JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, version)
);

-- ─── game_scores (mini-game màn chờ) ────────────────────────
CREATE TABLE IF NOT EXISTS public.game_scores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  token       TEXT NOT NULL,
  score       INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_game_scores_event ON public.game_scores(event_id, score DESC);

-- ─── RLS ────────────────────────────────────────────────────
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mosaics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

-- Helper: kiểm tra admin (email trong JWT app_metadata hoặc role admin)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- events: đọc công khai
CREATE POLICY "events_select_public"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "events_admin_all"
  ON public.events FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- event_settings: đọc công khai (majors, shape, …)
CREATE POLICY "event_settings_select_public"
  ON public.event_settings FOR SELECT
  USING (true);

CREATE POLICY "event_settings_admin_all"
  ON public.event_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- submissions: insert công khai (qua API server với service role hoặc anon + policy)
-- Đọc: chỉ lá không bị ẩn; admin xem tất cả
CREATE POLICY "submissions_select_visible"
  ON public.submissions FOR SELECT
  USING (hidden = false OR public.is_admin());

CREATE POLICY "submissions_insert_public"
  ON public.submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "submissions_admin_update"
  ON public.submissions FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "submissions_admin_delete"
  ON public.submissions FOR DELETE
  USING (public.is_admin());

-- mosaics: đọc công khai sau khi chốt
CREATE POLICY "mosaics_select_public"
  ON public.mosaics FOR SELECT
  USING (true);

CREATE POLICY "mosaics_admin_all"
  ON public.mosaics FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- game_scores: insert/read công khai theo event
CREATE POLICY "game_scores_select_public"
  ON public.game_scores FOR SELECT
  USING (true);

CREATE POLICY "game_scores_insert_public"
  ON public.game_scores FOR INSERT
  WITH CHECK (true);

CREATE POLICY "game_scores_admin_all"
  ON public.game_scores FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── Realtime ─────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_scores;

-- ─── Seed: event mẫu Khóa 2026 ──────────────────────────────
INSERT INTO public.events (id, slug, name, status)
VALUES (
  'a0000000-0000-4000-8000-000000000001',
  'k2026',
  'Cây Khóa 2026 — Việt Mỹ College',
  'collecting'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.event_settings (
  event_id,
  shape,
  majors,
  fill_ratio,
  leaves_min,
  leaves_max,
  blossom_every,
  filler_assets,
  trunk_config,
  roots_text,
  max_file_mb,
  rate_limit_per_ip,
  major_colors,
  policy_url
) VALUES (
  'a0000000-0000-4000-8000-000000000001',
  'tree',
  '[
    "Công nghệ thông tin",
    "Thiết kế đồ họa",
    "Marketing",
    "Du lịch",
    "Ngôn ngữ Anh",
    "Kế toán",
    "Điều dưỡng",
    "Khác"
  ]'::jsonb,
  0.900,
  40,
  1500,
  50,
  '[]'::jsonb,
  '{
    "brandColor": "#3DBE8B",
    "images": []
  }'::jsonb,
  'Khóa 2026 · Hà Nội · HCM · Cần Thơ · Phú Quốc',
  5.00,
  3,
  '{
    "Công nghệ thông tin": "#3DBE8B",
    "Thiết kế đồ họa": "#FF6FA5",
    "Marketing": "#FFAE3B",
    "Du lịch": "#FF6B5A",
    "Ngôn ngữ Anh": "#FFD15C",
    "Kế toán": "#6B8CFF",
    "Điều dưỡng": "#FF8FAB",
    "Khác": "#B8A9C9"
  }'::jsonb,
  '/privacy'
)
ON CONFLICT (event_id) DO NOTHING;
