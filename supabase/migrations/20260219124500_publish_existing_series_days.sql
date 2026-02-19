-- Ensure previously created days become visible in the app.
-- Some days were created before CMS started setting is_published=true.
UPDATE public.devotional_days d
SET
  is_published = TRUE,
  updated_at = NOW()
WHERE
  d.is_published = FALSE
  AND EXISTS (
    SELECT 1
    FROM public.devotional_series s
    WHERE s.id = d.series_id
      AND s.is_published = TRUE
  );
