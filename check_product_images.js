
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../etsy-dropshipping-backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data: products, error: pError } = await supabase
        .from('products')
        .select(`
            id, 
            original_title, 
            status, 
            etsy_listing_id,
            product_images (
                image_url
            )
        `)
        .limit(5);

    if (pError) {
        console.error('Error fetching products:', pError);
        return;
    }

    console.log('--- Recent Products with Images ---');
    console.log(JSON.stringify(products, null, 2));
}

checkData();
