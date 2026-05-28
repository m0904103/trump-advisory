import React, { useEffect, useState } from 'react';
import { Terminal, Activity } from 'lucide-react';

const mockFeeds = [
  { time: '15:20:02', text: '[系統] 偵測到關鍵字: Oman, blow up, behave', type: 'system' },
  { time: '15:20:05', text: '[推文] "Oman will behave just like everybody else, or we\'ll have to blow them up"', type: 'quote' },
  { time: '15:20:08', text: '[FinBERT] NLP 情緒判定: 極度負面 (Bearish: 92%)', type: 'analysis-down' },
  { time: '15:20:12', text: '[市場] WTI 原油期貨瞬間跳漲 2.4%', type: 'market-up' },
  { time: '15:20:15', text: '[推文] "Are we going to war over the Strait of Hormuz??"', type: 'quote' },
  { time: '15:20:18', text: '[FinBERT] 散戶恐慌指數飆升', type: 'analysis-down' },
  { time: '15:20:25', text: '[市場] LMT (洛克希德馬丁) 盤前大漲 4.1%', type: 'market-up' },
];

export default function LiveFeed() {
  const [feeds, setFeeds] = useState([]);
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < mockFeeds.length) {
        setFeeds(prev => [...prev, mockFeeds[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getColor = (type) => {
    switch(type) {
      case 'system': return '#94a3b8';
      case 'quote': return '#ffffff';
      case 'analysis-down': return '#00ff88'; // green for down
      case 'market-up': return '#ff3366'; // red for up
      default: return '#fff';
    }
  };

  return (
    <div className="glass-panel" style={{ gridColumn: 'span 4', minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Terminal color="var(--accent-blue)" size={24} />
        <h2 className="text-xl" style={{ marginBottom: 0 }}>即時 NLP 終端機 (Live Feed)</h2>
      </div>
      
      <div style={{ 
        flex: 1, 
        background: 'rgba(0,0,0,0.5)', 
        borderRadius: '8px', 
        padding: '16px',
        overflowY: 'auto',
        fontFamily: 'monospace',
        border: '1px solid rgba(0, 210, 255, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {feeds.map((feed, idx) => feed && feed.type ? (
          <div key={idx} style={{ display: 'flex', gap: '12px', animation: 'fade-in-up 0.5s ease forwards' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{feed.time}</span>
            <span style={{ color: getColor(feed.type), textShadow: feed.type.includes('down') ? 'var(--glow-green)' : feed.type.includes('up') ? 'var(--glow-red)' : 'none' }}>
              {feed.text}
            </span>
          </div>
        ) : null)}
        {feeds.length < mockFeeds.length && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', opacity: 0.7 }}>
            <Activity size={16} style={{ animation: 'pulse-green 1s infinite' }}/>
            <span>等待新數據...</span>
          </div>
        )}
      </div>
    </div>
  );
}
