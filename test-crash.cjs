const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

  console.log('Navigating to local build...');
  await page.goto('file://' + __dirname + '/dist/index.html');
  
  console.log('Waiting for load...');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Clicking switch to TW button...');
  // Find button with text containing 🇹🇼
  const button = await page.$x("//button[contains(., '🇹🇼')]");
  if (button.length > 0) {
    await button[0].click();
    console.log('Clicked. Waiting...');
    await new Promise(r => setTimeout(r, 2000));
  } else {
    console.log('Button not found!');
  }
  
  await browser.close();
})();
