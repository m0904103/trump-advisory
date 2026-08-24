import React, { useEffect, useState, useRef } from 'react';
import { Terminal, Activity } from 'lucide-react';

export default function LiveFeed({ incomingNews, apiStatus, marketMode = 'US' }) {
  const [feeds, setFeeds] = useState([]);
  const bottomRef = useRef(null);
  const feedQueue = useRef([]);
  const displayedTitles = useRef(new Set()); // prevent duplicate streaming

  // Scroll to bottom automatically
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [feeds]);

  // Handle incoming news updates from App
  useEffect(() => {
    if (incomingNews && incomingNews.length > 0) {
      const newItems = incomingNews.filter(item => !displayedTitles.current.has(item.title));
      newItems.forEach(item => displayedTitles.current.add(item.title));
      
      feedQueue.current = [...feedQueue.current, ...newItems];
    }
  }, [incomingNews]);

  // Clear queue when market mode switches
  useEffect(() => {
    setFeeds([]);
    feedQueue.current = [];
    displayedTitles.current.clear();
    setFeeds([
      { 
        time: new Date().toLocaleTimeString('en-US', { hour12: false }), 
        text: marketMode === 'TW' ? '[系統] 繁體中文 NLP 分析引擎啟動...' : '[系統] NLP 輕量分析引擎啟動...', 
        type: 'system' 
      }
    ]);
  }, [marketMode]);

  // Display Queue (Streaming Simulation)
  useEffect(() => {
    const getTime = () => {
      const d = new Date();
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
    };

    const streamInterval = setInterval(() => {
      if (feedQueue.current.length > 0) {
        const nextItem = feedQueue.current.shift();
        
        setFeeds(prev => {
          const nextFeeds = [
            ...prev, 
            { 
              time: getTime(), 
              text: `[頭條] ${nextItem.title}`, 
              type: 'quote',
              matchedKeywords: nextItem.matchedKeywords
            },
            {
              time: getTime(),
              text: `[NLP判定] ${nextItem.sentimentLabel}`,
              type: nextItem.type
            }
          ];
          // Keep only last 40 feeds to avoid DOM bloat
          return nextFeeds.length > 40 ? nextFeeds.slice(nextFeeds.length - 40) : nextFeeds;
        });
      }
    }, 2500); // Pop an item every 2.5 seconds to create a live streaming effect

    return () => clearInterval(streamInterval);
  }, []);

  const getColor = (type) => {
    switch(type) {
      case 'system': return '#94a3b8';
      case 'quote': return '#ffffff';
      case 'analysis-down': 
        return '#00ff88'; // 統一綠色代表跌
      case 'market-up': 
        return '#ff3366'; // 統一紅色代表漲
      default: return '#fff';
    }
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
    
    return parts.map((part, i) => {
      const match = uniqueKeywords.find(k => k.word.toLowerCase() === part.toLowerCase());
      if (match) {
        const glowClass = match.type === 'bullish' ? 'glow-red-text' : match.type === 'bearish' ? 'glow-green-text' : 'glow-blue-text';
        return <span key={i} className={`highlight-word ${glowClass}`}>{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="glass-panel" style={{ gridColumn: 'span 4', minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Terminal color="var(--accent-blue)" size={24} />
        <h2 className="text-xl" style={{ marginBottom: 0 }}>
          {marketMode === 'US' ? '即時真實 NLP 終端機 (Yahoo API)' : '即時真實中文 NLP 終端機 (TechNews)'}
        </h2>
      </div>
      
      <div style={{ 
        flex: 1, 
        background: 'rgba(0,0,0,0.5)', 
        borderRadius: '8px', 
        padding: '16px',
        overflowY: 'auto',
        overflowX: 'hidden',
        fontFamily: 'monospace',
        border: '1px solid rgba(0, 210, 255, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxHeight: '400px'
      }}>
        {feeds.map((feed, idx) => feed && feed.type ? (
          <div key={idx} style={{ display: 'flex', gap: '12px', animation: 'fade-in-up 0.5s ease forwards' }}>
            <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>{feed.time}</span>
            <span style={{ 
              color: getColor(feed.type), 
              textShadow: feed.type.includes('down') ? 'var(--glow-green)' : 
                          feed.type.includes('up') ? 'var(--glow-red)' : 'none' 
            }}>
              {renderTextWithHighlights(feed)}
            </span>
          </div>
        ) : null)}
        
        <div ref={bottomRef} style={{ height: '1px' }}></div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', opacity: 0.7, marginTop: '8px' }}>
          <Activity size={16} style={{ animation: 'pulse-green 1s infinite' }}/>
          <span>{apiStatus}</span>
        </div>
      </div>
    </div>
  );
}
