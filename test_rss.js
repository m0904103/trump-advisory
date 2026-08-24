const urls = [
  'https://technews.tw/category/finance/feed/',
  'https://www.moneydj.com/KMDJ/News/NewsRSSViewer.aspx?a=10a03048-e15d-4f74-b524-792c56f41e5e',
  'https://tw.stock.yahoo.com/rss'
];

async function test() {
  for (let url of urls) {
    console.log("Testing:", url);
    try {
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
      const data = await res.json();
      console.log("Status:", data.status);
      if (data.items) {
        console.log("First item:", data.items[0].title);
      }
    } catch (e) {
      console.log("Error:", e.message);
    }
  }
}
test();
