-- Add Etsy storage columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS etsy_access_token TEXT,
ADD COLUMN IF NOT EXISTS etsy_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS etsy_token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS shop_id VARCHAR;
