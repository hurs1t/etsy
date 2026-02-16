-- Add google_id and avatar_url to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR UNIQUE,
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR;

-- Make password_hash nullable (since Google users won't have one initially)
ALTER TABLE public.users 
ALTER COLUMN password_hash DROP NOT NULL;
