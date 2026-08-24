import puppeteer from 'puppeteer';
import { exec } from 'child_process';

// Use basic http server instead of vite preview
const server = exec('npx serve -s dist -l 5000');

setTimeout(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER CRASH:', err.message));
    
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
    
    console.log('Page loaded. Reading initial Sector Impact chart labels...');
    await page.waitForTimeout(1000);
    
    let labels = await page.evaluate(() => {
        const texts = Array.from(document.querySelectorAll('text'));
        return texts.map(t => t.textContent).filter(t => t.includes('('));
    });
    console.log('US Labels:', labels.join(', '));
    
    console.log('Clicking TW mode button...');
    const btns = await page.$x("//button[contains(., '🇹🇼')]");
    if(btns.length > 0) {
      await btns[0].click();
      
      // We check immediately without waiting for fetch to finish
      console.log('Clicked! Immediately checking labels...');
      await page.waitForTimeout(500); // 500ms should be enough for React render but before fetch finishes
      
      let newLabels = await page.evaluate(() => {
          const texts = Array.from(document.querySelectorAll('text'));
          return texts.map(t => t.textContent).filter(t => t.includes('('));
      });
      console.log('Immediate TW Labels:', newLabels.join(', '));
      
      await page.waitForTimeout(3000);
      let laterLabels = await page.evaluate(() => {
          const texts = Array.from(document.querySelectorAll('text'));
          return texts.map(t => t.textContent).filter(t => t.includes('('));
      });
      console.log('Later TW Labels:', laterLabels.join(', '));
      
    } else {
      console.log('Button not found');
    }
    
    await browser.close();
  } catch (e) {
    console.error('Puppeteer error:', e);
  }
  
  server.kill();
  process.exit(0);
}, 3000);
