require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkLatestProduct() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role to bypass RLS if needed

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing Supabase credentials in .env");
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
        .from('products')
        .select('*, product_variations(*)')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error("Error fetching product:", error);
        return;
    }

    if (data && data.length > 0) {
        const product = data[0];
        console.log("Latest Product:");
        console.log("ID:", product.id);
        console.log("Title:", product.original_title);
        console.log("Sources URL:", product.source_url);
        console.log("Variations Count:", product.product_variations?.length);
        console.log("Variations Data:", JSON.stringify(product.product_variations, null, 2));
    } else {
        console.log("No products found.");
    }
}

checkLatestProduct();
