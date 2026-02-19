-- Add tags/categories for devotional series, managed via CMS
ALTER TABLE public.devotional_series
ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_devotional_series_tags
ON public.devotional_series
USING GIN (tags);
