const textArray = [
  '護國神山還在長高、造就千萬年薪族，台灣消費信心為何停滯不前？',
  '「AI 降本」淪票房毒藥？逾半企業裁員後股價反挫 25%，投資人早就不買單',
  '地緣政治擋不住 AI 浪潮！大摩亞洲峰會首度移師台北，600 外資「用錢投票」挺台股底氣',
  '力積電 5月營收達 57.7 億元，連續兩個月站上 50 億元大關',
  '鴻海 5 月營收 8,594 億元創同期高，第二季營運估優於預期',
  '迎 AI 斬傳產！0050、0056 成分股大換血「2 兆熱錢」鎖定 AI 大贏家',
  '央行：AI 熱潮引發 K 型經濟，3 面向影響令利率工具受限',
  '華邦電 5 月營收站上 200 億元大關創新高紀錄，前五個月營收年增 128.58%',
  'AI 熱潮賺翻，韓國勞動部長籲科技巨頭分享超額利潤',
  '聯電 5 月營收 229.4 億元年增 17.78%，創三年半來單月新高'
];

const analyzeSentimentTW = (text) => {
    const strongBearish = ['崩盤', '暴跌', '跌停', '斷頭', '外資倒貨', '提款', '利空', '衰退', '地緣政治', '紅海危機', '晶片禁令', '重挫', '砍單', '大逃殺', '風暴', '外資期貨空單', '棄息賣壓', '血洗', '跳水', '殺盤', '大跌', '股災', '崩跌', '全島變綠'];
    const bearish = ['跌', '賣超', '看壞', '綠油油', '下修', '看淡', '保守', '賣壓', '出脫', '走弱', '法說會失利', '反挫', '下挫', '裁員', '毒藥', '回檔', '修正', '探底', '疲軟'];
    const bullish = ['漲', '創高', '買超', '看好', '紅盤', '爆發', '大賺', '漲停', '噴出', '外資認錯', '法說會', '建廠', '強勁', '雙位數', '新高', '投信作帳', '超乎預期', '回補', '軋空', '殖利率保護', '反彈', '利多'];
    
    let score = 0;
    const topics = [];
    const matchedKeywords = [];
    
    const checkTopicTW = (regex, topicName) => {
      const match = text.match(regex);
      if (match) {
        topics.push(topicName);
        matchedKeywords.push({ word: match[0], type: 'neutral' });
        return true;
      }
      return false;
    };

    let hasSemi = false;
    if (checkTopicTW(/聯發科|2454/i, 'semiconductor_2454')) hasSemi = true;
    if (checkTopicTW(/台積電|2330/i, 'semiconductor_2330')) hasSemi = true;
    if (!hasSemi && checkTopicTW(/半導體|晶片/i, 'semiconductor_general')) {}

    let hasShipping = false;
    if (checkTopicTW(/長榮|2603/i, 'shipping_2603')) hasShipping = true;
    if (checkTopicTW(/陽明|2609/i, 'shipping_2609')) hasShipping = true;
    if (checkTopicTW(/萬海|2615/i, 'shipping_2615')) hasShipping = true;
    if (!hasShipping && checkTopicTW(/航運|運價/i, 'shipping_general')) {}

    let hasAi = false;
    if (checkTopicTW(/緯創|3231/i, 'ai_server_3231')) hasAi = true;
    if (checkTopicTW(/緯穎|6669/i, 'ai_server_6669')) hasAi = true;
    if (checkTopicTW(/技嘉|2376/i, 'ai_server_2376')) hasAi = true;
    if (checkTopicTW(/廣達|2382/i, 'ai_server_2382')) hasAi = true;
    if (!hasAi && checkTopicTW(/ai|伺服器|散熱/i, 'ai_server_general')) {}

    checkTopicTW(/金融|富邦|國泰|金控|降息/i, 'finance_tw');
    
    const isNegatedTW = (word) => {
      const idx = text.indexOf(word);
      if (idx === -1) return false;
      const prefix = text.substring(Math.max(0, idx - 6), idx);
      return /不|未|沒|否認|停止/.test(prefix);
    };

    const applyScoreTW = (word, points, type) => {
      if (text.includes(word)) {
        if (isNegatedTW(word)) {
           score += (points * -0.5); 
        } else {
           score += points;
           matchedKeywords.push({ word, type });
        }
      }
    };

    strongBearish.forEach(word => applyScoreTW(word, -3, 'bearish'));
    bearish.forEach(word => applyScoreTW(word, -1.5, 'bearish'));
    bullish.forEach(word => applyScoreTW(word, 1.5, 'bullish'));

    return { score, topics, matchedKeywords };
};

const renderTextWithHighlights = (feed) => {
    if (!feed.matchedKeywords || feed.matchedKeywords.length === 0) return feed.text;
    
    const uniqueKeywords = [];
    const map = new Map();
    feed.matchedKeywords.forEach(k => {
      if (!map.has(k.word.toLowerCase())) {
        map.set(k.word.toLowerCase(), k);
        uniqueKeywords.push(k);
      }
    });
    
    uniqueKeywords.sort((a, b) => b.word.length - a.word.length);
    if (uniqueKeywords.length === 0) return feed.text;

    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(${uniqueKeywords.map(k => escapeRegExp(k.word)).join('|')})`, 'gi');
    const parts = feed.text.split(pattern);
    
    return parts.length;
};

textArray.forEach(t => {
   try {
       const res = analyzeSentimentTW(t);
       console.log(res);
       renderTextWithHighlights({text: t, matchedKeywords: res.matchedKeywords});
   } catch(e) {
       console.error("CRASH ON TEXT:", t, e);
   }
});
console.log("ALL TESTS PASSED");
