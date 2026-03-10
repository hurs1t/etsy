
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'c:/Users/y2kma/Downloads/Burhan/etsy/etsy-dropshipping-backend/.env' });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkImages() {
    const { data: products, error } = await supabase
        .from('products')
        .select('id, original_title, product_images(*)')
        .limit(3);

    if (error) {
        console.error(error);
        return;
    }

    console.log(JSON.stringify(products, null, 2));
}

checkImages();
