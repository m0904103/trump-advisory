const https = require('https');

https.get('https://query1.finance.yahoo.com/v8/finance/chart/^VIX', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const vix = json.chart.result[0].meta.regularMarketPrice;
      console.log('SUCCESS VIX:', vix);
    } catch(e) {
      console.log('ERROR:', e.message);
      console.log('DATA:', data);
    }
  });
}).on('error', (e) => {
  console.log('ERROR:', e.message);
});
