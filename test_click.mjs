import { chromium } from 'playwright';

(async () => {
    try {
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();

        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        page.on('pageerror', err => console.log('BROWSER UNCAUGHT EXCEPTION:', err.message));

        await page.goto('http://localhost:5173/fuel/shifts', { waitUntil: 'networkidle' });

        console.log('Page loaded. Clicking button...');
        // Look for the "Close New Shift" button
        const btn = await page.getByRole('button', { name: /Close New Shift/i }).first();
        if (btn) {
            await btn.click();
            console.log('Clicked button.');
            await page.waitForTimeout(2000); // wait for modal
            const html = await page.content();
            if (html.includes('Welcome')) {
                console.log('SUCCESS: Wizard Modal opened.');
            } else {
                console.log('FAIL: Wizard Modal not found in DOM after click.');
            }
        } else {
            console.log('Button not found.');
        }

        await browser.close();
    } catch (e) {
        console.error('SCRIPT ERROR:', e);
    }
})();
