ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS is_selected BOOLEAN DEFAULT true;
