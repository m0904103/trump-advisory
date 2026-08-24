const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.static('dist'));

const server = app.listen(5006, async () => {
    console.log('Server running on 5006');
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        page.on('pageerror', err => console.log('BROWSER CRASH:', err.message));
        
        console.log("Navigating to page...");
        await page.goto('http://localhost:5006', { waitUntil: 'networkidle0' });
        
        console.log("Waiting 3 seconds...");
        await new Promise(r => setTimeout(r, 3000));
        
        const html = await page.content();
        if (html.includes('id="root"></div>')) { // Meaning empty div, no react render
             console.log("ERROR: Page is blank (black screen). React failed to mount.");
        } else {
             console.log("SUCCESS: Page has content.");
        }
        
        await browser.close();
    } catch(e) {
        console.error(e);
    }
    server.close();
    process.exit(0);
});
