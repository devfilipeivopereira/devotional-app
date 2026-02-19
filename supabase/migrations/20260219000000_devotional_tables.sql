-- ╔═══════════════════════════════════════════════════════════╗
-- ║  Devotional App — Schema Migration                      ║
-- ║  Creates all tables for the devotional domain            ║
-- ╚═══════════════════════════════════════════════════════════╝

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Devotional Series ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.devotional_series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Devotional Days ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.devotional_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID NOT NULL REFERENCES public.devotional_series(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(series_id, day_number)
);

-- ─── Devotional Blocks ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.devotional_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_id UUID NOT NULL REFERENCES public.devotional_days(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL,
  content JSONB NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Devotional Media ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.devotional_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  block_id UUID REFERENCES public.devotional_blocks(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── User Progress ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.devotional_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_id UUID NOT NULL REFERENCES public.devotional_days(id) ON DELETE CASCADE,
  last_block_id UUID REFERENCES public.devotional_blocks(id),
  completed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, day_id)
);

-- ─── User Journal ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.devotional_journal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_id UUID NOT NULL REFERENCES public.devotional_days(id) ON DELETE CASCADE,
  block_id UUID REFERENCES public.devotional_blocks(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- RLS Policies
-- ═══════════════════════════════════════════════════════════

-- Content tables: public read, admin write
ALTER TABLE public.devotional_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotional_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotional_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotional_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for series" ON public.devotional_series;
CREATE POLICY "Public read access for series"
  ON public.devotional_series FOR SELECT
  USING (is_published = TRUE);

DROP POLICY IF EXISTS "Public read access for days" ON public.devotional_days;
CREATE POLICY "Public read access for days"
  ON public.devotional_days FOR SELECT
  USING (is_published = TRUE);

DROP POLICY IF EXISTS "Public read access for blocks" ON public.devotional_blocks;
CREATE POLICY "Public read access for blocks"
  ON public.devotional_blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.devotional_days d
      WHERE d.id = devotional_blocks.day_id AND d.is_published = TRUE
    )
  );

DROP POLICY IF EXISTS "Public read access for media" ON public.devotional_media;
CREATE POLICY "Public read access for media"
  ON public.devotional_media FOR SELECT
  USING (TRUE);

-- User tables: own data only
ALTER TABLE public.devotional_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotional_journal ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own progress" ON public.devotional_progress;
CREATE POLICY "Users can manage own progress"
  ON public.devotional_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own journal" ON public.devotional_journal;
CREATE POLICY "Users can manage own journal"
  ON public.devotional_journal FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_devotional_days_series ON public.devotional_days(series_id);
CREATE INDEX IF NOT EXISTS idx_devotional_blocks_day ON public.devotional_blocks(day_id);
CREATE INDEX IF NOT EXISTS idx_devotional_blocks_order ON public.devotional_blocks(day_id, "order");
CREATE INDEX IF NOT EXISTS idx_devotional_progress_user ON public.devotional_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_devotional_journal_user ON public.devotional_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_devotional_journal_day ON public.devotional_journal(day_id);
