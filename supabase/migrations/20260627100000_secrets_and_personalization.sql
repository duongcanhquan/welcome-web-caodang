-- DeepSeek API (admin-only) + cá nhân hoá + game flappy

-- ─── event_secrets — KHÔNG public read (chứa API key) ───────
CREATE TABLE IF NOT EXISTS public.event_secrets (
  event_id            UUID PRIMARY KEY REFERENCES public.events(id) ON DELETE CASCADE,
  deepseek_api_key    TEXT,
  deepseek_model      TEXT NOT NULL DEFAULT 'deepseek-chat',
  ai_enabled          BOOLEAN NOT NULL DEFAULT false,
  numerology_prompt   TEXT,
  personalization_prompt TEXT,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.event_secrets ENABLE ROW LEVEL SECURITY;

-- Chỉ admin đọc/ghi — sinh viên KHÔNG thấy API key
CREATE POLICY "event_secrets_admin_all"
  ON public.event_secrets FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── submission_insights — kết quả thần số + AI ─────────────
CREATE TABLE IF NOT EXISTS public.submission_insights (
  submission_id       UUID PRIMARY KEY REFERENCES public.submissions(id) ON DELETE CASCADE,
  numerology          JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_numerology       TEXT,
  ai_personalization  JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_generated_at     TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.submission_insights ENABLE ROW LEVEL SECURITY;

-- Sinh viên đọc insight của chính mình qua token (API server kiểm tra)
CREATE POLICY "submission_insights_select_public"
  ON public.submission_insights FOR SELECT
  USING (true);

CREATE POLICY "submission_insights_insert_service"
  ON public.submission_insights FOR INSERT
  WITH CHECK (true);

CREATE POLICY "submission_insights_update_service"
  ON public.submission_insights FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "submission_insights_admin_all"
  ON public.submission_insights FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── game_scores: thêm loại game ─────────────────────────────
ALTER TABLE public.game_scores
  ADD COLUMN IF NOT EXISTS game_type TEXT NOT NULL DEFAULT 'flappy';

ALTER TABLE public.game_scores
  ADD COLUMN IF NOT EXISTS player_name TEXT;

CREATE INDEX IF NOT EXISTS idx_game_scores_flappy
  ON public.game_scores(event_id, game_type, score DESC);
