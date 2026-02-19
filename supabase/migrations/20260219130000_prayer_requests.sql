-- Prayer requests for app "Oracoes" tab
CREATE TABLE IF NOT EXISTS public.prayer_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_text TEXT NOT NULL,
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_answered BOOLEAN NOT NULL DEFAULT FALSE,
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own prayer requests" ON public.prayer_requests;
CREATE POLICY "Users can manage own prayer requests"
  ON public.prayer_requests FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_prayer_requests_user_date
  ON public.prayer_requests(user_id, request_date DESC, created_at DESC);
