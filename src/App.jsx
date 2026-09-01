import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import RiskIndicator from './components/RiskIndicator';
import SentimentMeter from './components/SentimentMeter';
import LiveFeed from './components/LiveFeed';
import SectorImpact from './components/SectorImpact';
import BacktestTracker from './components/BacktestTracker';
import { Activity } from 'lucide-react';

// Upgraded NLP Dictionary with Weights
const nlpDictionary = {
  bullish: {
    words: ['surge', 'jump', 'rise', 'growth', 'profit', 'up', 'beat', 'higher', 'soar', 'gain', 'buy', 'bull', 'positive', 'record', 'dividend', 'deal', 'agreement', 'peace', 'ceasefire', 'optimism'],
    weight: 1
  },
  strongBullish: {
    words: ['skyrocket', 'breakthrough', 'historic', 'boom'],
    weight: 2
  },
  bearish: {
    words: ['fall', 'drop', 'decline', 'loss', 'down', 'miss', 'lower', 'fear', 'sell', 'bear', 'negative', 'cut', 'threat', 'warning', 'concern', 'tension'],
    weight: 1.5 // Slightly biased towards fear
  },
  strongBearish: {
    words: ['crash', 'risk', 'bankrupt', 'war', 'missile', 'strike', 'sanction', 'crisis', 'plunge', 'panic'],
    weight: 3
  }
};

function App() {
  // Global States
  const [globalStats, setGlobalStats] = useState({
    riskScore: 20, // Base risk
    bullishPercent: 33,
    bearishPercent: 33,
    neutralPercent: 34,
    hotSector: 'general',
    marketMode: 'US'
  });
  
  const [marketMode, setMarketMode] = useState('US');
  const activeModeRef = useRef('US');
  const [newsFeeds, setNewsFeeds] = useState([]);
  const [apiStatus, setApiStatus] = useState('等待連線...');
  
  // Use localStorage to persist user's custom VIX settings across page reloads
  // Force update version: 'vAuto_20260901_0246'
  const [twVix, setTwVix] = useState(() => {
    if (localStorage.getItem('vixVersion') !== 'vAuto_20260901_0246') return '25.45';
    return localStorage.getItem('twVix') || '30.50';
  });
  const [usVix, setUsVix] = useState(() => {
    if (localStorage.getItem('vixVersion') !== 'vAuto_20260901_0246') return '14.92';
    return localStorage.getItem('usVix') || '15.87';
  });

  useEffect(() => { 
    localStorage.setItem('twVix', twVix); 
    localStorage.setItem('usVix', usVix);
    localStorage.setItem('vixVersion', 'vAuto_20260901_0246');
  }, [twVix, usVix]);


  
  const analyzeSentiment = (text) => {
    const lowerText = text.toLowerCase();
    
    // 強烈看空字眼 (系統性風險與川普關稅)
    const strongBearish = ['war', 'crash', 'crisis', 'panic', 'collapse', 'missile', 'attack', 'sanction', 'escalat', 'emergency', 'tariff', 'trade war', 'recession', 'bankrupt', 'default'];
    // 一般看空字眼 (包含升息與禁令)
    const bearish = ['down', 'drop', 'fall', 'decline', 'fear', 'risk', 'bear', 'sell', 'selloff', 'loss', 'tension', 'threat', 'rate hike', 'ban', 'miss', 'plunge', 'dive', 'weak', 'downgrade', 'red', 'lawsuit', 'probe'];
    // 看多字眼 (包含加密貨幣與降息)
    const bullish = ['up', 'rise', 'gain', 'grow', 'bull', 'buy', 'profit', 'surge', 'rally', 'record', 'high', 'optimism', 'peace', 'deal', 'cut', 'cool', 'rate cut', 'bitcoin', 'crypto', 'deregulation', 'beat', 'soar', 'jump', 'climb', 'positive', 'strong', 'outperform', 'dividend', 'upgrade', 'boom', 'ath', 'breakout', 'win', 'green'];

    let score = 0;
    const topics = [];
    const matchedKeywords = [];

    const checkTopic = (regex, category) => {
      const match = lowerText.match(regex);
      if (match) {
        topics.push(category);
        matchedKeywords.push({ word: match[0], type: 'neutral' });
      }
    };
    
    checkTopic(/\b(tech|apple|nvidia|chip|ai|software|microsoft)\b/i, 'tech');
    checkTopic(/\b(oil|energy|gas|crude|saudi|opec)\b/i, 'oil');
    checkTopic(/\b(crypto|bitcoin|eth|blockchain)\b/i, 'crypto');
    checkTopic(/\b(bank|finance|fed|rate|yield)\b/i, 'finance');
    checkTopic(/\b(war|defense|military|missile|arms)\b/i, 'defense');

    // Negation detection using word boundaries
    const isNegated = (word) => {
      const match = lowerText.match(new RegExp(`\\b${word}\\b`, 'i'));
      if (!match) return false;
      const idx = match.index;
      const prefix = lowerText.substring(Math.max(0, idx - 18), idx);
      return /\b(not|no|never|dont|don't|doesn't|won't)\b/i.test(prefix);
    };

    const applyScore = (word, points, type) => {
      const match = lowerText.match(new RegExp(`\\b${word}\\b`, 'i'));
      if (match) {
        if (isNegated(word)) {
           score += (points * -0.5); // Reverse the sentiment slightly if negated
        } else {
           score += points;
           matchedKeywords.push({ word: match[0], type });
        }
      }
    };
    
    // 總經與財報例外處理 (Macro & Earnings Exceptions)
    const isMacroInflation = /\b(pce|cpi|inflation)\b/i.test(lowerText);
    const isYieldOrUnemployment = /\b(yield|yields|unemployment|layoffs)\b/i.test(lowerText);
    const isEarnings = /\b(earnings|guidance|revenue|payrolls)\b/i.test(lowerText);
    
    const isSpecialMacro = isMacroInflation || isYieldOrUnemployment || isEarnings;

    // 1. 通膨、殖利率、失業率 (上升 = 利空，下降 = 利多)
    if (isMacroInflation || isYieldOrUnemployment) {
      if (/\b(grow|rise|high|up|hot|surge|jump|climb|spike)\b/i.test(lowerText)) {
        score -= 2.5; 
      }
      if (/\b(cool|drop|down|fall|cut|decline|dive|plunge)\b/i.test(lowerText)) {
        score += 2.5; 
      }
    }

    // 2. 財報、財測、非農就業 (上升/擊敗預期 = 利多，下降/低於預期 = 利空)
    if (isEarnings) {
      if (/\b(beat|grow|rise|high|up|strong|raise|surge|jump)\b/i.test(lowerText)) {
        score += 2.5;
      }
      if (/\b(miss|drop|down|fall|cut|weak|lower|plunge|disappoint)\b/i.test(lowerText)) {
        score -= 2.5;
      }
    }

    // 加入川普 2.0 特殊關鍵字 (不屬於特殊巨集，直接計分)
    if (/\b(musk|deregulation|subsidies)\b/i.test(lowerText)) {
      if (isNegated('musk') || isNegated('deregulation') || isNegated('subsidies')) score -= 1.5;
      else score += 1.5; // 市場通常視為親商利多
    }

    strongBearish.forEach(word => applyScore(word, -3, 'bearish'));
    bearish.forEach(word => { 
      if (!isSpecialMacro) applyScore(word, -1.5, 'bearish');
    });
    bullish.forEach(word => { 
      if (!isSpecialMacro) applyScore(word, 1.5, 'bullish');
    });

    let result = { type: 'quote', label: '中立 (Neutral)', score: score, topics: topics, matchedKeywords };
    if (score < -2) result = { type: 'analysis-down', label: '看空 (Bearish)', score, topics, matchedKeywords };
    if (score > 1) result = { type: 'market-up', label: '看多 (Bullish)', score, topics, matchedKeywords };
    return result;
  };

  const analyzeSentimentTW = (text) => {
    const strongBearish = ['崩盤', '暴跌', '跌停', '斷頭', '外資倒貨', '提款', '利空', '衰退', '地緣政治', '紅海危機', '晶片禁令', '重挫', '砍單', '大逃殺', '風暴', '外資期貨空單', '棄息賣壓', '血洗', '跳水', '殺盤', '大跌', '股災', '崩跌', '全島變綠', '泡沫破滅', '黑天鵝'];
    const bearish = ['跌', '賣超', '看壞', '綠油油', '下修', '看淡', '保守', '賣壓', '出脫', '走弱', '法說會失利', '反挫', '下挫', '裁員', '毒藥', '回檔', '修正', '探底', '疲軟', '落袋為安', '熊市', '泡沫', '殺機', '去槓桿', '震盪', '減碼', '懲罰', '拋售', '大逃亡'];
    const bullish = ['漲', '創高', '買超', '看好', '紅盤', '爆發', '大賺', '漲停', '噴出', '外資認錯', '法說會', '建廠', '強勁', '雙位數', '新高', '投信作帳', '超乎預期', '回補', '軋空', '殖利率保護', '反彈', '利多', '破兆', '低接', '狂買', '停戰', '喊多', '搶攻', '開募', '優質股', '黃金', '加密貨幣', '牛市', '受惠', '買盤'];
    
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

    let result = { type: 'quote', label: '中立 (Neutral)', score: score, topics: topics, matchedKeywords };
    if (score <= -1.5) result = { type: 'analysis-down', label: '看空 (Bearish)', score, topics, matchedKeywords };
    if (score >= 1.5) result = { type: 'market-up', label: '看多 (Bullish)', score, topics, matchedKeywords };
    return result;
  };

  const fetchGlobalData = async (mode) => {
    try {
      setApiStatus(mode === 'TW' ? '連線至台灣財經 RSS...' : '連線至 Yahoo Finance API...');
      let data = { status: 'error', items: [] };
      if (mode === 'TW') {
        const rssUrl = 'https://technews.tw/category/finance/feed/';
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
        data = await response.json();
      } else {
        // Fetch both Yahoo Finance and CNN Top Stories for US Mode
        const yahooUrl = 'https://finance.yahoo.com/news/rss';
        const cnnUrl = 'http://rss.cnn.com/rss/cnn_topstories.rss';
        
        const [yahooRes, cnnRes] = await Promise.all([
          fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(yahooUrl)}`),
          fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(cnnUrl)}`)
        ]);
        
        const yahooData = await yahooRes.json();
        const cnnData = await cnnRes.json();
        
        if (yahooData.status === 'ok' || cnnData.status === 'ok') {
            data.status = 'ok';
            // Merge and shuffle items to get a diverse feed
            const mergedItems = [...(cnnData.items || []), ...(yahooData.items || [])];
            data.items = mergedItems.sort(() => 0.5 - Math.random());
        }
      }

      let cnnIndex = null;
      try {
        // Fetch CNN Fear & Greed via CORS proxy globally
        const cnnUrl = 'https://production.dataviz.cnn.io/index/fearandgreed/graphdata';
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(cnnUrl)}`;
        const cnnRes = await fetch(proxyUrl);
        const cnnDataStr = await cnnRes.json();
        const cnnData = JSON.parse(cnnDataStr.contents);
        if (cnnData && cnnData.fear_and_greed && cnnData.fear_and_greed.score !== undefined) {
          cnnIndex = Math.round(cnnData.fear_and_greed.score);
        }
      } catch (e) {
        console.warn('Failed to fetch CNN index:', e);
      }
      
      if (data.status === 'ok' && data.items) {
        // Prevent stale fetch from overwriting state if user switched modes
        if (activeModeRef.current !== mode) return;

        setApiStatus('NLP 權重重構與大數據分析中...');
        
        let totalBullish = 0;
        let totalBearish = 0;
        let totalNeutral = 0;
        let allTopics = [];

        const processedNews = data.items.map(item => {
          const sentiment = mode === 'TW' ? analyzeSentimentTW(item.title) : analyzeSentiment(item.title);
          
          if (sentiment.type === 'market-up') totalBullish++;
          else if (sentiment.type === 'analysis-down') totalBearish++;
          else totalNeutral++;
          
          allTopics = allTopics.concat(sentiment.topics);

          return {
            title: item.title,
            type: sentiment.type,
            sentimentLabel: sentiment.label,
            score: sentiment.score,
            matchedKeywords: sentiment.matchedKeywords
          };
        });

        // Update Global Stats
        const total = data.items.length;
        if (total > 0) {
          const bPct = Math.round((totalBullish / total) * 100);
          const bearPct = Math.round((totalBearish / total) * 100);
          const nPct = 100 - bPct - bearPct;
          
          let hotSector = 'general';
          if (allTopics.length > 0) {
             const counts = {};
             allTopics.forEach(t => counts[t] = (counts[t] || 0) + 1);
             hotSector = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
          }
          
          // Calculate Risk Score: Base 20 + Bearish% * 0.8 + Penalty for extreme fear
          let newRisk = 20 + (bearPct * 0.8);
          if (bearPct > 50) newRisk += 10; // Panic penalty
          newRisk = Math.min(Math.max(Math.round(newRisk), 5), 99); // Clamp between 5 and 99

          setGlobalStats({
            riskScore: newRisk,
            bullishPercent: bPct,
            bearishPercent: bearPct,
            neutralPercent: nPct,
            hotSector: hotSector,
            marketMode: mode,
            cnnIndex: cnnIndex
          });
        }

        setNewsFeeds(processedNews);
        setApiStatus('全系統數據同步完成，即時監控中');
      } else {
        setApiStatus('API 連線失敗');
      }
    } catch (error) {
      setApiStatus('網路錯誤');
    }
  };

  useEffect(() => {
    activeModeRef.current = marketMode;
    fetchGlobalData(marketMode);
    const interval = setInterval(() => {
      fetchGlobalData(marketMode);
    }, 60000);
    return () => clearInterval(interval);
  }, [marketMode]);

  return (
    <div className="dashboard-container">
      <header className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="title-glow">{marketMode === 'US' ? '川普投顧：全球政經風險預測終端機' : '護國神山：台股政經風險預測終端機'}</h1>
          <p className="text-muted" style={{ marginTop: '4px' }}>{marketMode === 'US' ? 'Global Macro & Geo-Risk Terminal • Dual NLP Active (Yahoo + CNN)' : 'TAIEX Macro & Geo-Risk Terminal • Chinese NLP Active'}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <button 
            onClick={() => setMarketMode(prev => prev === 'US' ? 'TW' : 'US')}
            style={{
              background: marketMode === 'US' ? 'rgba(0, 210, 255, 0.1)' : 'rgba(0, 255, 136, 0.1)',
              border: marketMode === 'US' ? '1px solid rgba(0, 210, 255, 0.3)' : '1px solid rgba(0, 255, 136, 0.3)',
              color: marketMode === 'US' ? 'var(--accent-blue)' : 'var(--accent-green)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {marketMode === 'US' ? '🇺🇸 切換台股' : '🇹🇼 切換美股'}
          </button>
          
          {marketMode === 'TW' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 60, 60, 0.15)', border: '1px solid var(--accent-red)', padding: '6px 12px', borderRadius: '8px', boxShadow: '0 0 10px rgba(255, 60, 60, 0.2)' }}>
              <span style={{ fontSize: '12px', color: 'var(--accent-red)', fontWeight: 'bold' }}>TAIEX VIX:</span>
              <input 
                type="number" 
                value={twVix} 
                onChange={(e) => setTwVix(e.target.value)}
                style={{ width: '60px', background: 'transparent', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 'bold', outline: 'none', textAlign: 'right' }}
                step="0.01"
              />
            </div>
          )}
          {marketMode === 'US' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 210, 255, 0.15)', border: '1px solid var(--accent-blue)', padding: '6px 12px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 210, 255, 0.2)' }}>
              <span style={{ fontSize: '12px', color: 'var(--accent-blue)', fontWeight: 'bold' }}>CBOE VIX:</span>
              <input 
                type="number" 
                value={usVix} 
                onChange={(e) => setUsVix(e.target.value)}
                style={{ width: '60px', background: 'transparent', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 'bold', outline: 'none', textAlign: 'right' }}
                step="0.01"
              />
            </div>
          )}

          <div className="status-badge pulse-green">
            <Activity size={16} />
            <span>連線正常 | {apiStatus}</span>
          </div>
        </div>
      </header>
      
      <main className="dashboard-grid">
        <RiskIndicator stats={{ ...globalStats, twVix, usVix, marketMode }} />
        <SentimentMeter stats={{ ...globalStats, marketMode }} />
        <LiveFeed incomingNews={newsFeeds} apiStatus={apiStatus} marketMode={marketMode} />
        <SectorImpact stats={{ ...globalStats, marketMode }} />
        <BacktestTracker marketMode={marketMode} />
      </main>
      
      <footer style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '12px', borderTop: '1px solid var(--panel-border)', marginTop: '24px' }}>
        ⚠️ 免責聲明：本系統所有分析結果皆為開源財經新聞之大數據 NLP 綜合判定，僅供學術研究與概念展示，不構成任何真實投資建議。<br/>
        Data Source: Yahoo Finance Public RSS
      </footer>
    </div>
  );
}

export default App;
