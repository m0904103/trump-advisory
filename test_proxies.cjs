const https = require('https');

const proxies = [
    `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent('https://www.google.com/finance/quote/VIX:INDEXCBOE')}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent('https://www.google.com/finance/quote/VIX:INDEXCBOE')}`
];

proxies.forEach((url, i) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const match = data.match(/class="YMlKec fxKbKc">([^<]+)<\/div>/);
        console.log(`PROXY ${i} STATUS:`, res.statusCode);
        if (match) {
            console.log(`PROXY ${i} SUCCESS VIX:`, match[1]);
        } else {
            console.log(`PROXY ${i} Not found. snippet:`, data.substring(0, 100).replace(/\n/g, ' '));
        }
      });
    }).on('error', (e) => {
      console.log(`PROXY ${i} ERROR:`, e.message);
    });
});
