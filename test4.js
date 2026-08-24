const fetch = require('node-fetch');

async function test() {
    const rssUrl = 'https://finance.yahoo.com/news/rss';
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
    const data = await res.json();
    console.log("Yahoo RSS:", data.items.map(i => i.title).slice(0, 5));
}
test();
