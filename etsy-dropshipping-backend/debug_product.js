const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkProduct() {
    const productId = '72af72d1-9e6a-42fb-85f8-7e3c41434a9a';
    console.log('Checking product:', productId);

    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

    if (error) {
        console.error('Error fetching product:', error);
    } else {
        console.log('Product Found:', product ? 'YES' : 'NO');
        if (product) {
            console.log('Product Owner ID:', product.user_id);
            console.log('Product Title:', product.original_title);

            // Check who this user is
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', product.user_id)
                .single();

            if (user) {
                console.log('Owner Email:', user.email);
            } else {
                console.log('Owner User NOT Found in Users table (Auth/Public mismatch?)');
            }
        }
    }

    // Also check total users
    const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
    console.log('Total Users in DB:', count);
}

checkProduct();
