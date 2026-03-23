
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProduct() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error fetching product:', error);
        return;
    }

    if (!data || data.length === 0) {
        console.log('No products found');
        return;
    }

    const product = data[0];
    console.log('--- PRODUCT INFO ---');
    console.log('ID:', product.id);
    console.log('Title:', product.generated_title || product.original_title);
    console.log('Translations Type:', typeof product.translations);
    console.log('Translations Content:', JSON.stringify(product.translations, null, 2));

    if (typeof product.translations === 'string') {
        try {
            const parsed = JSON.parse(product.translations);
            console.log('Parsed Translations:', JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.log('Failed to parse translations string');
        }
    }
}

checkProduct();
