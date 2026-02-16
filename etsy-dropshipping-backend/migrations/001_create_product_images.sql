-- Create product_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (for now, similar to products)
-- Ideally, should be limited to the owner of the product, but this is a starting point.
CREATE POLICY "Enable all for authenticated users" ON public.product_images
    FOR ALL USING (auth.role() = 'authenticated');
