-- Bible highlights and personal notes for Journal tab

CREATE TABLE IF NOT EXISTS public.bible_highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_abbrev TEXT NOT NULL,
  book_name TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  verse_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, book_abbrev, chapter, verse_number)
);

ALTER TABLE public.bible_highlights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own bible highlights" ON public.bible_highlights;
CREATE POLICY "Users can manage own bible highlights"
  ON public.bible_highlights FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_bible_highlights_user_created
  ON public.bible_highlights(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.user_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  note_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own notes" ON public.user_notes;
CREATE POLICY "Users can manage own notes"
  ON public.user_notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_notes_user_date
  ON public.user_notes(user_id, note_date DESC, created_at DESC);
