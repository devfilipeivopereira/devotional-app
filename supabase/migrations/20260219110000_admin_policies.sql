-- Admin authorization for CMS write operations

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own admin membership" ON public.admin_users;
CREATE POLICY "Users can read own admin membership"
  ON public.admin_users
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users admins
    WHERE admins.user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DROP POLICY IF EXISTS "Admins can insert series" ON public.devotional_series;
DROP POLICY IF EXISTS "Admins can update series" ON public.devotional_series;
DROP POLICY IF EXISTS "Admins can delete series" ON public.devotional_series;
CREATE POLICY "Admins can insert series"
  ON public.devotional_series FOR INSERT
  WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update series"
  ON public.devotional_series FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete series"
  ON public.devotional_series FOR DELETE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert days" ON public.devotional_days;
DROP POLICY IF EXISTS "Admins can update days" ON public.devotional_days;
DROP POLICY IF EXISTS "Admins can delete days" ON public.devotional_days;
CREATE POLICY "Admins can insert days"
  ON public.devotional_days FOR INSERT
  WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update days"
  ON public.devotional_days FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete days"
  ON public.devotional_days FOR DELETE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert blocks" ON public.devotional_blocks;
DROP POLICY IF EXISTS "Admins can update blocks" ON public.devotional_blocks;
DROP POLICY IF EXISTS "Admins can delete blocks" ON public.devotional_blocks;
CREATE POLICY "Admins can insert blocks"
  ON public.devotional_blocks FOR INSERT
  WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update blocks"
  ON public.devotional_blocks FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete blocks"
  ON public.devotional_blocks FOR DELETE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert media" ON public.devotional_media;
DROP POLICY IF EXISTS "Admins can update media" ON public.devotional_media;
DROP POLICY IF EXISTS "Admins can delete media" ON public.devotional_media;
CREATE POLICY "Admins can insert media"
  ON public.devotional_media FOR INSERT
  WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update media"
  ON public.devotional_media FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete media"
  ON public.devotional_media FOR DELETE
  USING (public.is_admin());
