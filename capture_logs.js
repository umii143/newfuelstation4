import { chromium } from 'playwright';

(async () => {
    try {
        const browser = await chromium.launch();
        const page = await browser.newPage();

        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        page.on('pageerror', err => console.log('BROWSER UNCAUGHT EXCEPTION:', err.message));

        await page.goto('http://localhost:5173/');
        await page.waitForTimeout(3000); // give it time to load or crash

        const html = await page.content();
        console.log('HTML CONTENT:', html.substring(0, 500));

        await browser.close();
    } catch (e) {
        console.error('SCRIPT ERROR:', e);
    }
})();
