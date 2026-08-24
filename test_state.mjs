import puppeteer from 'puppeteer';
import { exec } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const server = http.createServer((req, res) => {
    let filePath = path.join(process.cwd(), 'dist', req.url === '/' ? 'index.html' : req.url);
    if (!fs.existsSync(filePath)) { res.writeHead(404); res.end(); return; }
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    if (ext === '.js') contentType = 'text/javascript';
    if (ext === '.css') contentType = 'text/css';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fs.readFileSync(filePath));
});

server.listen(5010, async () => {
    console.log('Server running on 5010');
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        
        await page.goto('http://localhost:5010', { waitUntil: 'networkidle0' });
        
        // Find input box
        const inputSelector = 'input[type="number"]';
        await page.waitForSelector(inputSelector);
        
        // Clear input and type 19.53
        await page.click(inputSelector, { clickCount: 3 });
        await page.type(inputSelector, '19.53');
        
        let val = await page.$eval(inputSelector, el => el.value);
        console.log("Value after typing:", val);
        
        // Wait for 10 seconds to see if auto-refresh resets it
        console.log("Waiting 10 seconds...");
        await new Promise(r => setTimeout(r, 10000));
        
        let valAfter = await page.$eval(inputSelector, el => el.value);
        console.log("Value after 10s:", valAfter);
        
        // Switch to TW and back
        console.log("Switching modes...");
        await page.evaluate(() => {
           document.querySelector('button').click(); // Switch to TW
        });
        await new Promise(r => setTimeout(r, 1000));
        await page.evaluate(() => {
           document.querySelector('button').click(); // Switch to US
        });
        await new Promise(r => setTimeout(r, 1000));
        
        let valAfterSwitch = await page.$eval(inputSelector, el => el.value);
        console.log("Value after switch:", valAfterSwitch);
        
        await browser.close();
    } catch(e) {
        console.error(e);
    }
    server.close();
    process.exit(0);
});
