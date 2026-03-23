
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: 'c:/Users/y2kma/Downloads/Burhan/etsy/etsy-dropshipping-backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSourceUrls() {
    const { data, error } = await supabase
        .from('products')
        .select('id, original_title, source_url')
        .limit(10);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('--- Product Source URLs ---');
    data.forEach(p => {
        console.log(`ID: ${p.id}`);
        console.log(`Title: ${p.original_title}`);
        console.log(`Source URL: ${p.source_url || 'NULL'}`);
        console.log('---');
    });
}

checkSourceUrls();
