const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function insertUser() {
    const email = 'ali@mail.com';
    const password = 'password123'; // Temporary password
    const fullName = 'Ali User';

    console.log(`Creating user: ${email} with password: ${password}`);

    // Hash password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const { data, error } = await supabase
        .from('users')
        .insert({
            email,
            password_hash: passwordHash,
            full_name: fullName,
            created_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating user:', error);
    } else {
        console.log('User created successfully:', data);
    }
}

insertUser();
