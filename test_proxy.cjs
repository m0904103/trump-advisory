const https = require('https');

const url = `https://api.allorigins.win/get?url=${encodeURIComponent('https://www.google.com/finance/quote/VIX:INDEXCBOE')}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log("PROXY HTTP STATUS:", res.statusCode);
    console.log("RAW DATA:", data.substring(0, 100));
  });
}).on('error', (e) => {
  console.log('ERROR:', e.message);
});
