-- Allow anonymous inserts for product_images (for dev extension support)
CREATE POLICY "Enable insert for anon" ON public.product_images
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable select for anon" ON public.product_images
    FOR SELECT USING (true);

-- Also ensure products table allows anon if not already
CREATE POLICY "Enable insert for anon" ON public.products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable select for anon" ON public.products
    FOR SELECT USING (true);
