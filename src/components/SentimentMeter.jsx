import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function SentimentMeter({ stats }) {
  const data = [
    { name: stats?.marketMode === 'TW' ? '看空 (Bearish)' : '看跌 (Bearish)', value: stats?.bearishPercent || 78 },
    { name: '盤整 (Neutral)', value: stats?.neutralPercent || 15 },
    { name: stats?.marketMode === 'TW' ? '看多 (Bullish)' : '看漲 (Bullish)', value: stats?.bullishPercent || 7 },
  ];

  // 統一使用台灣習慣：跌(看空)為綠色，漲(看多)為紅色，以避免視覺混淆
  const COLORS = ['#00ff88', '#94a3b8', '#ff3366'];

  return (
    <div className="glass-panel" style={{ gridColumn: 'span 4', minHeight: '320px' }}>
      <h2 className="text-xl">市場情緒 (Market Sentiment)</h2>
      <div style={{ height: '240px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} style={{ filter: `drop-shadow(0 0 8px ${COLORS[index]}80)` }} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ background: 'rgba(20, 20, 25, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '-10px' }}>
        {data.map((item, index) => (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[index], boxShadow: `0 0 10px ${COLORS[index]}` }}></div>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
