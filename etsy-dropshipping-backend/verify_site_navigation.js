const { chromium } = require('playwright');
const path = require('path');

// Colors for console output
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    blue: "\x1b[34m",
    yellow: "\x1b[33m"
};

async function log(step, message, status = 'INFO') {
    const color = status === 'PASS' ? colors.green : status === 'FAIL' ? colors.red : colors.blue;
    console.log(`${color}[${step}] ${message}${colors.reset}`);
}

async function verifySite() {
    console.log(`${colors.yellow}Starting Full Site Verification (User Walkthrough)...${colors.reset}`);
    const browser = await chromium.launch(); // Headless by default
    const context = await browser.newContext();
    const page = await context.newPage();
    const baseUrl = 'http://localhost:3000';

    try {
        // 1. REGISTER
        const email = `walkthrough_${Date.now()}@test.com`;
        await log('1. Register', `Navigating to ${baseUrl}/register...`);
        await page.goto(`${baseUrl}/register`);

        await page.fill('input[name="fullName"]', 'Walkthrough User');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', 'Password123!');
        await page.click('button[type="submit"]');

        // Wait for redirect to dashboard
        await page.waitForURL('**/dashboard', { timeout: 10000 });
        await log('1. Register', 'Registration successful. Redirected to Dashboard.', 'PASS');

        // 2. DASHBOARD CHECK
        await log('2. Dashboard', 'Checking dashboard elements...');
        try {
            await page.waitForSelector('text=Total Products', { timeout: 10000 });
            await log('2. Dashboard', 'Stats cards visible.', 'PASS');
        } catch (e) {
            throw new Error('Dashboard stats load timeout');
        }

        // 3. NAVIGATION: PRODUCTS
        await log('3. Nav - Products', 'Clicking "Products" link...');
        await page.click('a[href="/products"]');
        try {
            await page.waitForURL('**/products');
            await page.waitForSelector('h2:has-text("Products")', { timeout: 10000 });
            await log('3. Nav - Products', 'Navigated to Products page correctly.', 'PASS');
        } catch (e) {
            throw new Error('Products page load failed');
        }

        // 4. NAVIGATION: SETTINGS
        await log('4. Nav - Settings', 'Clicking "Settings" link...');
        await page.click('a[href="/settings"]');
        try {
            await page.waitForURL('**/settings');
            await page.waitForSelector('h2:has-text("Settings")', { timeout: 10000 });
            await log('4. Nav - Settings', 'Navigated to Settings page correctly.', 'PASS');
        } catch (e) {
            throw new Error('Settings page load failed');
        }

        // 5. NAVIGATION: BACK TO DASHBOARD
        await log('5. Nav - Dashboard', 'Clicking "Dashboard" link...');
        await page.click('a[href="/dashboard"]');
        await page.waitForURL('**/dashboard');

        // 6. MODAL CHECK (Import from URL)
        await log('6. Feature - Modal', 'Opening "Import from URL" modal...');
        await page.click('button:has-text("Import from URL")');
        const modalVisible = await page.isVisible('text=Import Product');
        if (modalVisible) {
            await log('6. Feature - Modal', 'Modal opened successfully.', 'PASS');
            // Close modal
            await page.keyboard.press('Escape');
        } else {
            throw new Error('Import modal did not appear');
        }

        // 7. LOGOUT
        await log('7. Logout', 'Clicking Logout button...');
        await page.click('button:has-text("Logout")');
        await page.waitForURL('**/login');
        const loginHeader = await page.isVisible('text=Login');
        if (loginHeader) {
            await log('7. Logout', 'Logged out successfully. Redirected to Login.', 'PASS');
        } else {
            throw new Error('Logout redirect failed');
        }

        console.log(`\n${colors.green}ALL CHECKS PASSED! The site is fully functional.${colors.reset}`);

    } catch (error) {
        console.error(`\n${colors.red}VERIFICATION FAILED:${colors.reset}`, error);
        await page.screenshot({ path: 'verification_failure.png' });
    } finally {
        await browser.close();
    }
}

verifySite();
