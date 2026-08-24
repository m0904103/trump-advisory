import puppeteer from 'puppeteer';
import { exec } from 'child_process';

const preview = exec('npm run preview');

setTimeout(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER CRASH:', err.message));
    
    // Vite preview usually runs on 4173
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle2' });
    
    console.log('Page loaded. Clicking TW mode...');
    const btns = await page.$x("//button[contains(., '🇹🇼')]");
    if(btns.length > 0) {
      await btns[0].click();
      console.log('Clicked! Waiting 3s...');
      await new Promise(r => setTimeout(r, 3000));
    } else {
      console.log('Button not found');
    }
    
    await browser.close();
  } catch (e) {
    console.error('Puppeteer error:', e);
  }
  
  preview.kill();
  process.exit(0);
}, 3000);
