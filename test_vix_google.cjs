const https = require('https');

https.get('https://www.google.com/finance/quote/VIX:INDEXCBOE', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    // try to find the price in the HTML.
    // Google finance uses <div class="YMlKec fxKbKc">15.50</div> for the main price
    const match = data.match(/class="YMlKec fxKbKc">([^<]+)<\/div>/);
    if (match) {
        console.log("SUCCESS VIX:", match[1]);
    } else {
        console.log("Not found in Google Finance HTML.");
    }
  });
}).on('error', (e) => {
  console.log('ERROR:', e.message);
});
