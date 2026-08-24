import puppeteer from 'puppeteer';
import { createServer } from 'http';
import handler from 'serve-handler';

const server = createServer((request, response) => {
  return handler(request, response, { public: 'dist' });
});

server.listen(3000, async () => {
  console.log('Running at http://localhost:3000');
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    page.on('console', msg => console.log('LOG:', msg.text()));
    page.on('pageerror', err => console.log('CRASH:', err.message));
    
    await page.goto('http://localhost:3000');
    await new Promise(r => setTimeout(r, 2000));
    
    const btns = await page.$x("//button[contains(., '🇹🇼')]");
    if(btns.length > 0) {
      await btns[0].click();
      await new Promise(r => setTimeout(r, 2000));
      console.log('Clicked and waited');
    } else {
        console.log('No button');
    }
    
    await browser.close();
  } catch(e) {
    console.error(e);
  }
  server.close();
  process.exit(0);
});
