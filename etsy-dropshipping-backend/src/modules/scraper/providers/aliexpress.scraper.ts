import { Injectable, Logger } from '@nestjs/common';
import { chromium, Browser, Page } from 'playwright';

@Injectable()
export class AliexpressScraper {
    private readonly logger = new Logger(AliexpressScraper.name);

    async scrape(url: string) {
        let browser: Browser | null = null;
        try {
            browser = await chromium.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled',
                    '--window-size=1920,1080',
                ]
            });
            const context = await browser.newContext({
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                viewport: { width: 1920, height: 1080 },
                locale: 'en-US',
                timezoneId: 'America/New_York',
            });

            // Inject stealth scripts to hide automation
            await context.addInitScript(() => {
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined,
                });
                // @ts-ignore
                window.navigator.chrome = {
                    runtime: {},
                };
                // @ts-ignore
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5],
                });
                // @ts-ignore
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['en-US', 'en'],
                });
            });

            const page = await context.newPage();

            this.logger.log(`Navigating to ${url}`);

            // Add extra headers to mimic real browser
            await page.setExtraHTTPHeaders({
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1',
            });

            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); // Reverted to domcontentloaded for speed, relying on specific waits if needed

            const pageTitle = await page.title();
            this.logger.log(`Page Title: ${pageTitle}`);

            // Check for bot detection
            const content = await page.content();
            if (content.toLowerCase().includes('files.alicdn.com/tps/captcha') ||
                content.includes('login-activation-wrapper') ||
                pageTitle.includes('Login') ||
                pageTitle === '') {
                // Try to grab h1 to see if we are on homepage
                const h1 = await page.$eval('h1', el => el.textContent).catch(() => '');
                if (h1 && h1.includes('Aliexpress')) {
                    throw new Error('AliExpress blocked the request (Redirected to Homepage/Login). Please use a proxy or try again later.');
                }
                if (content.toLowerCase().includes('slider')) {
                    throw new Error('AliExpress blocked the request (Captcha Slider). Please use a proxy.');
                }
            }

            // Try multiple selectors for critical fields

            // Try multiple selectors for critical fields
            const title = await this.getTextBySelectors(page, [
                'h1[data-pl="product-title"]',
                '.product-title-text',
                'h1',
            ]);

            const priceText = await this.getTextBySelectors(page, [
                '.product-price-current',
                '.product-price-value',
                '.uniform-banner-box-price',
                '.main-price',
                '[class*="price-current"]'
            ]);

            // Clean price string (remove currency symbol, etc.)
            let price = 0;
            if (priceText) {
                const cleanPrice = priceText.replace(/[^0-9.]/g, '');
                price = parseFloat(cleanPrice) || 0;
            }

            const description = await this.getTextBySelectors(page, [
                '#product-description',
                '.product-description',
                '.detail-desc-decorate-richtext'
            ]);

            // Get images - trying multiple patterns
            let images: string[] = [];

            // Pattern 1: Regex extraction from script tag (Most reliable for AliExpress)
            const scriptContent = await page.content();
            const imageMatch = scriptContent.match(/\"imagePathList\":\s*(\[[^\]]+\])/);
            if (imageMatch && imageMatch[1]) {
                try {
                    images = JSON.parse(imageMatch[1]);
                } catch (e) {
                    this.logger.warn('Failed to parse image JSON');
                }
            }

            // Pattern 2: Standard gallery (Fallback)
            if (images.length === 0) {
                const galleryImages = await page.$$eval('.images-view-item img, .magnifier-image, .pdp-info-left img, .sku-property-image img', (imgs) =>
                    imgs.map(img => img.getAttribute('src')).filter(Boolean)
                );
                images = galleryImages as string[];
            }

            // Limit to max 20 images to avoid overload, but ensure we get enough
            images = images.slice(0, 20);

            // Clean up image URLs
            images = images.map(img => {
                if (!img) return '';
                // Remove size suffixes like _50x50.jpg, _640x640.jpg, etc.
                return img.replace(/_.+\.jpg$/, '').replace(/_.+\.png$/, '').replace(/_.+\.webp$/, '');
            }).filter(url => url && url.length > 0);

            // Deduplicate images
            images = [...new Set(images)];

            // Extract Variations (SKU)
            let variations: any[] = [];
            try {
                // Try to get runParams from script
                const match = scriptContent.match(/window\.runParams\s*=\s*(\{.+?\});/);
                if (match && match[1]) {
                    const runParams = JSON.parse(match[1]);
                    const skuModule = runParams.data?.skuModule || {};
                    const priceModule = runParams.data?.priceModule || {};

                    if (skuModule.productSKUPropertyList) {
                        const props = skuModule.productSKUPropertyList; // Array of properties (Color, Size)
                        const skus = skuModule.skuPriceList || []; // Array of Sku Items with price/stock

                        // We need to flatten this. Etsy expects "Property: Value" pairs or specific variation structure.
                        // Our DB expects: property_id, property_name, value_id, value_name, price, quantity, etc.

                        // For each SKU combination (e.g. Red + Large)
                        skus.forEach((sku: any) => {
                            // sku.skuPropIds is a comma separated string like "29,14" matching property IDs
                            const propIds = sku.skuAttr ? sku.skuAttr.split(/[;,]/) : (sku.skuPropIds ? sku.skuPropIds.split(',') : []);

                            // Find the property definitions for these IDs
                            propIds.forEach((id: string) => {
                                // Find which property this ID belongs to
                                let foundProp: any = null;
                                let foundValue: any = null;

                                for (const p of props) {
                                    const val = p.skuPropertyValues.find((v: any) => String(v.propertyValueId) === String(id.split(':')[1] || id));
                                    if (val) {
                                        foundProp = p;
                                        foundValue = val;
                                        break;
                                    }
                                }

                                if (foundProp && foundValue) {
                                    variations.push({
                                        property_id: String(foundProp.skuPropertyId),
                                        property_name: foundProp.skuPropertyName,
                                        value_id: String(foundValue.propertyValueId),
                                        value_name: foundValue.propertyValueDisplayName || foundValue.propertyValueName,
                                        image_url: foundValue.skuPropertyImagePath, // Optional: Image for this specific value (e.g. Red Shirt)
                                        price: parseFloat(sku.skuVal?.skuActivityAmount?.value || sku.skuVal?.skuAmount?.value || price),
                                        quantity: sku.skuVal?.availQuantity || 0
                                    });
                                }
                            });
                        });

                        // Deduplicate: Because we loop through SKUs (Combinations), we might get multiple "Color: Red" entries if there are sizes.
                        // But wait, our DB table `product_variations` seems to store individual options? 
                        // "property_id, property_name, value_id, value_name"
                        // If we store "Red", we might store it multiple times?
                        // If the table is "Variation Options" then we should deduplicate.
                        // But if the table is "SKU Combinations", we need a better structure.
                        // Looking at migration 006:
                        // product_id, property_id, property_name, value_id, value_name, price, quantity.
                        // This looks like it stores ONE property-value pair per row.
                        // BUT `price` and `quantity` usually apply to the COMBINATION (e.g. Red + Large).
                        // If we have just "Red" with a price, that implies all Red items have that price?
                        // Etsy's model handles "Variations" (Color, Size) and then "Combinations" (Offerings).

                        // SIMPLIFICATION FOR MVP:
                        // We will store unique Property-Value pairs (e.g. Color: Red, Size: L).
                        // We will take the max/min price or just the first price found for that value.
                        // Or better: Let's store just the unique options for now so the user can select them in Etsy later?
                        // Actually, the user wants "Automated Etsy". Etsy API requires creating variations (Property scales) and then setting offerings.

                        // Let's deduce unique values.
                        const uniqueVariations = new Map();
                        variations.forEach(v => {
                            const key = `${v.property_id}-${v.value_id}`;
                            if (!uniqueVariations.has(key)) {
                                uniqueVariations.set(key, v);
                            }
                        });
                        variations = Array.from(uniqueVariations.values());
                    }
                }
            } catch (e) {
                this.logger.warn(`Failed to extract variations: ${e.message}`);
            }

            return {
                originalTitle: title || pageTitle || 'Unknown Product', // Fallback to page title
                originalDescription: description || '',
                price,
                images: images,
                variations: variations, // Return extracted variations
                sourcePlatform: 'AliExpress',
                sourceUrl: url
            };

        } catch (error) {
            this.logger.error(`Scraping failed: ${error.message}`);
            throw error;
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    private async getTextBySelectors(page: Page, selectors: string[]): Promise<string> {
        for (const selector of selectors) {
            try {
                if (await page.isVisible(selector)) {
                    const text = await page.textContent(selector);
                    if (text && text.trim().length > 0) {
                        return text.trim();
                    }
                }
            } catch (e) {
                // Ignore error and try next selector
            }
        }
        return '';
    }
}
