// e2e-test.js
const BASE_URL = 'http://localhost:3001';
// Use a random email to avoid conflicts
const EMAIL = `e2e_${Date.now()}@example.com`;
const PASSWORD = 'Password123!';
const PRODUCT_URL = process.argv[2];

async function main() {
    if (!PRODUCT_URL) {
        console.error('Please provide a Product URL');
        process.exit(1);
    }

    console.log(`Starting E2E Test for ${EMAIL}`);
    console.log(`Target Product: ${PRODUCT_URL}`);

    try {
        // 1. Register
        console.log('\n--- 1. Registering ---');
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD, fullName: 'E2E Test User' })
        });

        if (!regRes.ok) {
            const err = await regRes.text();
            throw new Error(`Register failed: ${err}`);
        }
        const regData = await regRes.json();
        console.log('User created:', regData);

        // 2. Login
        console.log('\n--- 2. Logging in ---');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD })
        });

        if (!loginRes.ok) {
            const err = await loginRes.text();
            throw new Error(`Login failed: ${err}`);
        }
        const loginData = await loginRes.json();
        const token = loginData.access_token;
        console.log('Logged in. Token received.');

        // 3. Scrape
        console.log(`\n--- 3. Scraping Product ---`);
        const scrapeRes = await fetch(`${BASE_URL}/scraper/scrape`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ url: PRODUCT_URL })
        });

        if (!scrapeRes.ok) {
            const err = await scrapeRes.text();
            throw new Error(`Scrape failed: ${err}`);
        }
        const scrapeData = await scrapeRes.json();
        console.log('Scraped Data:', {
            title: scrapeData.originalTitle?.substring(0, 50) + '...',
            price: scrapeData.price
        });

        // 4. AI Enhance
        console.log('\n--- 4. Enhancing with AI ---');
        const aiRes = await fetch(`${BASE_URL}/ai-content/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                productTitle: scrapeData.originalTitle,
                productDescription: scrapeData.originalDescription || 'No description',
                keywords: ['gaming', 'wireless']
            })
        });

        if (!aiRes.ok) {
            const err = await aiRes.text();
            throw new Error(`AI failed: ${err}`);
        }
        const aiData = await aiRes.json();
        console.log('Enhanced Data:', {
            title: aiData.title,
            tags: aiData.tags
        });

        // 5. Save Product
        console.log('\n--- 5. Saving to Supabase ---');
        const saveRes = await fetch(`${BASE_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                userId: regData.id, // Ensure userId is passed if DTO requires it, mostly extracted from Token in Controller usually? 
                // Wait, CreateProductDto has userId. ProductsService uses it.
                // But normally Controller extracts user from Request and overrides it.
                // Let's check ProductsController later. For now send it.
                userId: regData.id,
                sourceUrl: PRODUCT_URL,
                sourcePlatform: 'AliExpress',
                originalTitle: aiData.title, // Saving the enhanced title as "original" for the listing
                originalDescription: aiData.description,
                price: typeof scrapeData.price === 'string' ? parseFloat(scrapeData.price.replace(/[^0-9.]/g, '')) : scrapeData.price,
                generatedTitle: aiData.title,
                generatedDescription: aiData.description,
            })
        });

        if (!saveRes.ok) {
            const err = await saveRes.text();
            throw new Error(`Save failed: ${err}`);
        }
        const product = await saveRes.json();
        console.log('Product Saved:', product);

        console.log('\n✅ E2E TEST PASSED!');

    } catch (error) {
        console.error('\n❌ E2E TEST FAILED:', error.message);
        process.exit(1);
    }
}

main();
