
import { AliexpressScraper } from './src/modules/scraper/providers/aliexpress.scraper';
import { Test, TestingModule } from '@nestjs/testing';

async function run() {
    const url = process.argv[2];
    if (!url) {
        console.error('Please provide a URL');
        process.exit(1);
    }

    const module: TestingModule = await Test.createTestingModule({
        providers: [AliexpressScraper],
    }).compile();

    const scraper = module.get<AliexpressScraper>(AliexpressScraper);
    console.log(`Scraping ${url}...`);
    try {
        const result = await scraper.scrape(url);
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

run();
