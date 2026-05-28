import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: '原油 (WTI)', impact: 85, color: '#ff3366' },
  { name: '軍工 (LMT)', impact: 65, color: '#ff3366' },
  { name: '黃金 (GLD)', impact: 40, color: '#ff3366' },
  { name: '美債 (TLT)', impact: 20, color: '#ff3366' },
  { name: '標普 (SPY)', impact: -45, color: '#00ff88' },
  { name: '科技 (QQQ)', impact: -60, color: '#00ff88' },
  { name: '航空 (JETS)', impact: -80, color: '#00ff88' },
];

export default function SectorImpact() {
  return (
    <div className="glass-panel" style={{ gridColumn: 'span 12', minHeight: '360px' }}>
      <h2 className="text-xl">板塊資金流向預測 (Sector Impact Matrix)</h2>
      <div style={{ height: '280px', width: '100%', marginTop: '20px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickFormatter={(val) => `${val}%`} />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ background: 'rgba(20, 20, 25, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value) => [`${value > 0 ? '+' : ''}${value}%`, '預估動能']}
            />
            <Bar dataKey="impact" radius={[4, 4, 4, 4]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0 0 5px ${entry.color}80)` }} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
