
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log('Starting migration: Adding translations column to products table...');

    try {
        const { data, error } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE public.products ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT \'{}\'::jsonb;'
        });

        if (error) {
            console.error('Migration failed (Standard RPC not found or permission denied):', error);
            console.log('---');
            console.log('Please run the following SQL in your Supabase SQL Editor:');
            console.log('ALTER TABLE public.products ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT \'{}\'::jsonb;');
        } else {
            console.log('Migration successful!');
        }
    } catch (e) {
        console.error('Unexpected error during migration:', e.message);
        console.log('Please run the following SQL in your Supabase SQL Editor:');
        console.log('ALTER TABLE public.products ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT \'{}\'::jsonb;');
    }
}

migrate();
