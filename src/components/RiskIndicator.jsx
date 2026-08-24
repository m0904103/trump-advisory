import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

export default function RiskIndicator({ stats }) {
  // Fallback for initial render
  const defaultStats = { riskScore: 20, bullishPercent: 33, bearishPercent: 33 };
  const currentStats = stats || defaultStats;
  const { riskScore, bullishPercent, bearishPercent, cnnIndex, marketMode, twVix, usVix } = currentStats;

  // 1. 計算純粹的 NLP 新聞觀望指數
  const nlpIndex = Math.round(50 + (bullishPercent * 0.5) - (bearishPercent * 0.5));
  
  // 2. 判斷 CNN 籌碼數據是否可用
  const isCnnActive = cnnIndex !== undefined && cnnIndex !== null;

  // 3. 混合權重引擎 (Hybrid Weighted Engine)
  let indexScore = nlpIndex;
  let title = '市場多空指數 (Market Sentiment Index)';
  let activeEngineLabel = null;

  if (marketMode === 'US') {
    title = '綜合多空預測模型 (Hybrid Sentiment Model)';
    
    // Convert US VIX to 0-100 score
    let parsedUsVix = parseFloat(usVix);
    let vixScore = !isNaN(parsedUsVix) ? 100 - ((parsedUsVix - 10) / 30 * 100) : 50;
    vixScore = Math.max(0, Math.min(100, Math.round(vixScore)));

    if (isCnnActive) {
      indexScore = Math.round((nlpIndex * 0.5) + (cnnIndex * 0.25) + (vixScore * 0.25));
      activeEngineLabel = (
          <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span>NLP 輿論: <strong style={{color: '#fff'}}>{nlpIndex}</strong></span>
            <span style={{color: 'var(--accent-blue)', textShadow: '0 0 5px var(--accent-blue)'}}>⚡</span>
            <span>CNN 籌碼: <strong style={{color: '#fff'}}>{cnnIndex}</strong></span>
            <span style={{color: 'var(--accent-blue)', textShadow: '0 0 5px var(--accent-blue)'}}>⚡</span>
            <span>US VIX: <strong style={{color: '#fff'}}>{usVix}</strong> (轉換: <strong style={{color: '#fff'}}>{vixScore}</strong>)</span>
          </div>
      );
    } else {
      indexScore = Math.round((nlpIndex * 0.7) + (vixScore * 0.3));
      activeEngineLabel = (
          <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span>NLP 輿論: <strong style={{color: '#fff'}}>{nlpIndex}</strong></span>
            <span style={{color: 'var(--accent-blue)', textShadow: '0 0 5px var(--accent-blue)'}}>⚡</span>
            <span>CBOE VIX: <strong style={{color: '#fff'}}>{usVix}</strong> (轉換: <strong style={{color: '#fff'}}>{vixScore}</strong>)</span>
          </div>
      );
    }
  } else if (marketMode === 'TW' && twVix !== undefined && twVix !== '') {
    // Convert TW VIX to 0-100 score
    // Formula: 100 - ((VIX - 10) / 30 * 100)
    let parsedTwVix = parseFloat(twVix);
    let vixScore = !isNaN(parsedTwVix) ? 100 - ((parsedTwVix - 10) / 30 * 100) : 50;
    vixScore = Math.max(0, Math.min(100, Math.round(vixScore)));
    
    title = '綜合多空預測模型 (Hybrid Sentiment Model)';
    indexScore = Math.round((nlpIndex * 0.7) + (vixScore * 0.3));
    
    activeEngineLabel = (
        <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span>NLP 輿論: <strong style={{color: '#fff'}}>{nlpIndex}</strong></span>
          <span style={{color: 'var(--accent-red)', textShadow: '0 0 5px var(--accent-red)'}}>⚡</span>
          <span>TW VIX: <strong style={{color: '#fff'}}>{twVix}</strong> (轉換: <strong style={{color: '#fff'}}>{vixScore}</strong>)</span>
        </div>
    );
  }

  let displayNumber = indexScore;
  let statusColor = 'var(--text-secondary)';
  let statusLabel = '盤整區間 (Neutral)';
  let pulseAnimation = 'none';
  let Icon = AlertTriangle;

  if (indexScore >= 60) {
    statusColor = 'var(--accent-red)';
    statusLabel = '強烈看多 (Strong Bullish)';
    pulseAnimation = 'pulse-red';
    Icon = TrendingUp;
  } else if (indexScore > 50) {
    statusColor = 'var(--accent-red)';
    statusLabel = '偏多操作 (Bullish)';
    pulseAnimation = 'pulse-red';
    Icon = TrendingUp;
  } else if (indexScore <= 40) {
    statusColor = 'var(--accent-green)';
    statusLabel = '強烈看空 (Strong Bearish)';
    pulseAnimation = 'pulse-green';
    Icon = TrendingDown;
  } else if (indexScore < 50) {
    statusColor = 'var(--accent-green)';
    statusLabel = '偏空操作 (Bearish)';
    pulseAnimation = 'pulse-green';
    Icon = TrendingDown;
  }

  return (
    <div className="glass-panel" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }}>
      <h2 className="text-xl" style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>{title}</h2>
      
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px 0' }}>
        <div style={{ position: 'absolute', inset: -20, borderRadius: '50%', background: `radial-gradient(circle, ${statusColor}30 0%, transparent 70%)`, animation: `${pulseAnimation} 2s infinite` }}></div>
        <Icon color={statusColor} size={48} style={{ marginRight: '16px', zIndex: 1 }} />
        <span className="risk-number" style={{ fontSize: '72px', fontWeight: 'bold', color: statusColor, textShadow: `0 0 20px ${statusColor}`, zIndex: 1 }}>{displayNumber}%</span>
      </div>
      
      <div style={{ 
        marginTop: '24px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        background: `${statusColor}15`,
        padding: '12px 20px',
        borderRadius: '8px',
        border: `1px solid ${statusColor}40`
      }}>
        <Icon color={statusColor} size={24} />
        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{statusLabel}</span>
      </div>
      
      {activeEngineLabel}
    </div>
  );
}
