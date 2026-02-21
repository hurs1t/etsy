const axios = require('axios');

async function debugScraper() {
    console.log('Starting Scraper Debug with Auth...');
    const baseUrl = 'http://localhost:3001';

    try {
        // 1. Register/Login to get token
        const email = `scraper_debug_${Date.now()}@test.com`;
        console.log(`Registering user: ${email}`);

        const authResponse = await axios.post(`${baseUrl}/auth/register`, {
            email,
            password: 'Password123!',
            fullName: 'Debug User'
        });

        const token = authResponse.data.access_token;
        console.log('Got Access Token');

        // 2. Scrape
        const url = 'https://www.aliexpress.us/item/3256805003608328.html';
        console.log(`Sending authenticated request for URL: ${url}`);

        const response = await axios.post(
            `${baseUrl}/scraper/scrape`,
            { url },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Scraper Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('Debug Script Failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

debugScraper();
