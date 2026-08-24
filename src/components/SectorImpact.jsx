import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Custom shape for the bars
const CustomBar = (props) => {
  const { x, y, width, height, fill } = props;
  const radius = 4;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={radius} ry={radius} style={{ filter: `drop-shadow(0 0 8px ${fill}80)` }}/>
    </g>
  );
};

export default function SectorImpact({ stats = { riskScore: 20, hotSector: 'general', marketMode: 'US' } }) {
  const { riskScore, hotSector, marketMode } = stats;

  const getDynamicData = (score, sector) => {
    let base = [];
    
    if (marketMode === 'TW') {
      if (score >= 60) {
        base = [
          { name: '營建 (2542)', value: 85, color: '#ff3366' },
          { name: '重電 (1519)', value: 65, color: '#ff3366' },
          { name: '航運 (2603)', value: 40, color: '#ff3366' },
          { name: '金融 (2881)', value: -20, color: '#00ff88' },
          { name: 'AI伺服器(2382)', value: -45, color: '#00ff88' },
          { name: '半導體 (2330)', value: -60, color: '#00ff88' },
          { name: '台指期 (TX)', value: -80, color: '#00ff88' },
        ];
      } else if (score >= 35) {
        base = [
          { name: '營建 (2542)', value: 15, color: '#ff3366' },
          { name: '重電 (1519)', value: 10, color: '#ff3366' },
          { name: '航運 (2603)', value: 5, color: '#ff3366' },
          { name: '金融 (2881)', value: -5, color: '#00ff88' },
          { name: 'AI伺服器(2382)', value: -10, color: '#00ff88' },
          { name: '半導體 (2330)', value: -15, color: '#00ff88' },
          { name: '台指期 (TX)', value: -20, color: '#00ff88' },
        ];
      } else {
        base = [
          { name: '半導體 (2330)', value: 65, color: '#ff3366' },
          { name: '台指期 (TX)', value: 45, color: '#ff3366' },
          { name: 'AI伺服器(2382)', value: 30, color: '#ff3366' },
          { name: '金融 (2881)', value: 15, color: '#ff3366' },
          { name: '航運 (2603)', value: -10, color: '#00ff88' },
          { name: '重電 (1519)', value: -25, color: '#00ff88' },
          { name: '營建 (2542)', value: -35, color: '#00ff88' },
        ];
      }
      
      // Apply hot sector overrides for TW
      return base.map(item => {
        let newItem = { ...item };
        if (sector.startsWith('semiconductor') && item.name.includes('半導體')) {
          newItem.value = score < 50 ? 95 : -85;
          newItem.color = score < 50 ? '#ff3366' : '#00ff88';
          if (sector === 'semiconductor_2454') newItem.name = '聯發科 (2454)';
          if (sector === 'semiconductor_2330') newItem.name = '台積電 (2330)';
        }
        if (sector.startsWith('shipping') && item.name.includes('航運')) {
          newItem.value = score < 50 ? 80 : -70;
          if (sector === 'shipping_2603') newItem.name = '長榮 (2603)';
          if (sector === 'shipping_2609') newItem.name = '陽明 (2609)';
          if (sector === 'shipping_2615') newItem.name = '萬海 (2615)';
        }
        if (sector.startsWith('ai_server') && item.name.includes('AI')) {
          newItem.value = score < 50 ? 90 : -80;
          if (sector === 'ai_server_3231') newItem.name = '緯創 (3231)';
          if (sector === 'ai_server_6669') newItem.name = '緯穎 (6669)';
          if (sector === 'ai_server_2376') newItem.name = '技嘉 (2376)';
          if (sector === 'ai_server_2382') newItem.name = '廣達 (2382)';
        }
        if (sector === 'finance_tw' && item.name.includes('金融')) {
          newItem.value = score < 50 ? 70 : -60;
        }
        
        if (newItem.value > 0) newItem.color = '#ff3366';
        if (newItem.value < 0) newItem.color = '#00ff88';
        
        return newItem;
      }).sort((a, b) => b.value - a.value);
    }
    
    // US Mode Base templates
    if (score >= 60) {
      base = [
        { name: '原油 (WTI)', value: 85, color: '#ff3366' },
        { name: '軍工 (LMT)', value: 65, color: '#ff3366' },
        { name: '黃金 (GLD)', value: 40, color: '#ff3366' },
        { name: '公債 (TLT)', value: 20, color: '#ff3366' },
        { name: '標普 (SPY)', value: -45, color: '#00ff88' },
        { name: '科技 (QQQ)', value: -60, color: '#00ff88' },
        { name: '航空 (JETS)', value: -80, color: '#00ff88' },
      ];
    } else if (score >= 35) {
      base = [
        { name: '原油 (WTI)', value: 15, color: '#ff3366' },
        { name: '軍工 (LMT)', value: 10, color: '#ff3366' },
        { name: '黃金 (GLD)', value: 25, color: '#ff3366' },
        { name: '公債 (TLT)', value: 5, color: '#ff3366' },
        { name: '標普 (SPY)', value: -10, color: '#00ff88' },
        { name: '科技 (QQQ)', value: -15, color: '#00ff88' },
        { name: '航空 (JETS)', value: -20, color: '#00ff88' },
      ];
    } else {
      base = [
        { name: '科技 (QQQ)', value: 65, color: '#ff3366' },
        { name: '標普 (SPY)', value: 45, color: '#ff3366' },
        { name: '航空 (JETS)', value: 30, color: '#ff3366' },
        { name: '公債 (TLT)', value: -5, color: '#00ff88' },
        { name: '軍工 (LMT)', value: -10, color: '#00ff88' },
        { name: '黃金 (GLD)', value: -25, color: '#00ff88' },
        { name: '原油 (WTI)', value: -35, color: '#00ff88' },
      ];
    }

    // Apply hot sector overrides for US
    return base.map(item => {
      let newItem = { ...item };
      if (sector === 'tech' && item.name.includes('科技')) {
        newItem.value = score < 50 ? 95 : -85; // extreme move
        newItem.color = score < 50 ? '#ff3366' : '#00ff88';
      }
      if (sector === 'oil' && item.name.includes('原油')) {
        newItem.value = 90; 
        newItem.color = '#ff3366';
      }
      if (sector === 'crypto') {
        // crypto might boost tech slightly and drop gold
        if (item.name.includes('科技')) newItem.value += 20;
        if (item.name.includes('黃金')) newItem.value -= 15;
      }
      if (sector === 'defense' && item.name.includes('軍工')) {
        newItem.value = 95;
        newItem.color = '#ff3366';
      }
      if (sector === 'finance' && item.name.includes('公債')) {
        newItem.value = score < 50 ? -40 : 80;
      }
      
      // Fix colors if value flipped
      if (newItem.value > 0) newItem.color = '#ff3366';
      if (newItem.value < 0) newItem.color = '#00ff88';
      
      return newItem;
    }).sort((a, b) => b.value - a.value); // sort by impact
  };

  const data = getDynamicData(riskScore, hotSector);

  return (
    <div className="glass-panel" style={{ gridColumn: 'span 6', minHeight: '360px', display: 'flex', flexDirection: 'column' }}>
      <h2 className="text-xl">板塊資金流向預測 (Sector Impact)</h2>
      <div style={{ height: '280px', width: '100%', marginTop: '20px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
              interval={0} 
              angle={-45} 
              textAnchor="end" 
              height={60} 
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} 
            />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickFormatter={(val) => `${val}%`} />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ background: 'rgba(20, 20, 25, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value) => [`${value > 0 ? '+' : ''}${value}%`, '預估動能']}
            />
            <Bar dataKey="value" radius={[4, 4, 4, 4]}>
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
