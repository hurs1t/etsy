const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkUser() {
    const email = 'kursad.basel@gmail.com';
    console.log('Checking user:', email);

    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (error) {
        console.log('Error/Not Found:', error.message);
    } else {
        console.log('User Found:', user.id, user.email);
    }
}

checkUser();
