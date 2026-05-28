import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: '看空 (Bearish)', value: 78, color: '#00ff88' },
  { name: '中立 (Neutral)', value: 15, color: '#ffb800' },
  { name: '看多 (Bullish)', value: 7, color: '#ff3366' },
];

export default function SentimentMeter() {
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
                <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0 0 8px ${entry.color}80)` }} />
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
        {data.map(item => (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color, boxShadow: `0 0 10px ${item.color}` }}></div>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
