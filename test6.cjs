const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
    if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end();
        return;
    }
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    if (ext === '.js') contentType = 'text/javascript';
    if (ext === '.css') contentType = 'text/css';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fs.readFileSync(filePath));
});

server.listen(5007, async () => {
    console.log('Server running on 5007');
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        page.on('pageerror', err => console.log('BROWSER CRASH:', err.message));
        
        console.log("Navigating to page...");
        await page.goto('http://localhost:5007', { waitUntil: 'networkidle0' });
        
        console.log("Waiting 3 seconds...");
        await new Promise(r => setTimeout(r, 3000));
        
        const html = await page.content();
        if (html.includes('id="root"></div>')) {
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
