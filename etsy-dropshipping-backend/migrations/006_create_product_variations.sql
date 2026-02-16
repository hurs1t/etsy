CREATE TABLE IF NOT EXISTS product_variations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    property_id TEXT, -- e.g. "14" (Color ID from AliExpress)
    property_name TEXT, -- e.g. "Color"
    value_id TEXT, -- e.g. "29" (Red ID)
    value_name TEXT, -- e.g. "Red"
    price NUMERIC, -- Override price
    quantity INTEGER DEFAULT 0,
    image_url TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_product_variations_product_id ON product_variations(product_id);
