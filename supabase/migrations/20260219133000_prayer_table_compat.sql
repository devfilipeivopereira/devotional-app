-- Backward compatibility for old clients querying "public_prayers"
-- New canonical table is public.prayer_requests

CREATE OR REPLACE VIEW public.public_prayers AS
SELECT
  id,
  user_id,
  request_text,
  request_date,
  is_answered,
  answered_at,
  created_at,
  updated_at
FROM public.prayer_requests;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.public_prayers TO authenticated;

-- Refresh PostgREST schema cache (self-hosted setups)
NOTIFY pgrst, 'reload schema';
