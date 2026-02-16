const { chromium } = require('playwright');

async function reproduce() {
    console.log('Starting 401 Reproduction...');
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Capture browser console logs
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

    const baseUrl = 'http://localhost:3000';
    const email = `debug_${Date.now()}@test.com`;

    try {
        // 1. Register
        console.log(`Registering user: ${email}`);
        await page.goto(`${baseUrl}/register`);
        await page.fill('input[name="fullName"]', 'Debug User');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', 'Password123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard', { timeout: 10000 });
        console.log('Registration successful');

        // 2. Go to Products
        await page.goto(`${baseUrl}/products`);
        console.log('Navigated to Products');

        // 3. Open Import Modal
        await page.click('button:has-text("Import from URL")'); // Adjust selector if needed
        console.log('Opened Import Modal');

        // 4. Submit URL
        const testUrl = 'https://www.aliexpress.com/item/1005001234567890.html'; // Dummy valid-looking URL
        await page.fill('input[name="url"]', testUrl);
        await page.click('button:has-text("Scrape Data")');
        console.log('Submitted URL for scraping');

        // 5. Wait for result
        // We expect a failure toast or error log. Wait a bit for network request.
        await page.waitForTimeout(5000);

        console.log('Reproduction attempt finished.');

    } catch (error) {
        console.error('Reproduction script failed:', error);
    } finally {
        await browser.close();
    }
}

reproduce();
