const { chromium } = require('playwright');
const path = require('path');

// Artifact Directory
const artifactDir = 'C:/Users/y2kma/.gemini/antigravity/brain/af5c16c4-9630-4885-a15f-ea3e5d2d1203';
const email = 'visual_user@test.com'; // We can use a consistent one if we registered it, or just login if we know creds. 
// Ideally we should reuse one, but for simplicity in screenshotting:
// We'll traverse register -> dashboard again to ensure we have a session.
const password = 'Password123!';

async function capture() {
    console.log('Launching browser...');
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        // 1. Register (Quick way to get to dashboard with new session)
        const randomEmail = `visual_${Date.now()}@test.com`;
        await page.goto('http://localhost:3000/register');
        await page.fill('input[type="email"]', randomEmail);
        await page.fill('input[type="password"]', password);

        if (await page.isVisible('input[name="fullName"]')) {
            await page.fill('input[name="fullName"]', 'Stats User');
        }

        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);

        // 2. Dashboard Stats
        console.log('Capturing Dashboard Stats...');
        await page.screenshot({ path: path.join(artifactDir, 'ui_dashboard_stats.png') });
        console.log('Captured Dashboard Stats');

    } catch (error) {
        console.error('Error capturing screenshots:', error);
    } finally {
        await browser.close();
    }
}

capture();
