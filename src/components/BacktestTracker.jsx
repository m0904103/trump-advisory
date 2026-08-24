import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BrainCircuit } from 'lucide-react';

const backtestData = []; // Will be populated dynamically based on mode

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'rgba(20, 20, 25, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>{label}</p>
        <p style={{ color: payload[0].color, margin: '4px 0' }}>AI 預測跌幅: {payload[0].value}%</p>
        {payload[1].value !== null && <p style={{ color: payload[1].color, margin: '4px 0' }}>實際收盤跌幅: {payload[1].value}%</p>}
        {payload[1].value === null && <p style={{ color: 'var(--text-secondary)', margin: '4px 0' }}>實際收盤跌幅: 等待收盤...</p>}
      </div>
    );
  }
  return null;
};

export default function BacktestTracker({ marketMode = 'US' }) {
  const [data, setData] = React.useState([]);
  const [isTuning, setIsTuning] = React.useState(true);

  React.useEffect(() => {
    setIsTuning(true);
    
    let initialData = [];
    if (marketMode === 'US') {
      initialData = [
        { event: '2000達康泡沫', predicted: -48.5, actual: -49.1, accuracy: 98 },
        { event: '2008金融海嘯', predicted: -55.2, actual: -56.8, accuracy: 97 },
        { event: '2020新冠爆發', predicted: -32.8, actual: -33.9, accuracy: 96 },
        { event: '2022俄烏戰爭', predicted: -14.5, actual: -13.0, accuracy: 88 },
        { event: 'SVB風暴(未平倉)', predicted: -9.2, actual: null, accuracy: null },
      ];
    } else {
      initialData = [
        { event: '1996飛彈危機', predicted: -28.5, actual: -30.0, accuracy: 95 },
        { event: '2008金融海嘯', predicted: -58.0, actual: -60.0, accuracy: 96 },
        { event: '2020新冠爆發', predicted: -29.5, actual: -30.0, accuracy: 98 },
        { event: '2022圍台軍演', predicted: -7.5, actual: -6.5, accuracy: 84 },
        { event: '外資419殺盤(未平倉)', predicted: -4.5, actual: null, accuracy: null },
      ];
    }
    setData(initialData);

    // Simulate AI settling the final prediction after 12 seconds
    const timer = setTimeout(() => {
      setData(prev => {
        const newData = [...prev];
        if (marketMode === 'US') {
          newData[4] = {
            event: 'SVB風暴(已平倉)',
            predicted: -9.2,
            actual: -8.5, 
            accuracy: 92
          };
        } else {
          newData[4] = {
            event: '外資419殺盤(已平倉)',
            predicted: -4.5,
            actual: -3.8,
            accuracy: 84
          };
        }
        return newData;
      });
      setIsTuning(false);
    }, 12000);

    return () => clearTimeout(timer);
  }, [marketMode]);

  return (
    <div className="glass-panel" style={{ gridColumn: 'span 6', minHeight: '360px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 className="text-xl" style={{ marginBottom: 0 }}>AI 回測與自我修正 (Self-Tuning)</h2>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          background: isTuning ? 'rgba(0, 210, 255, 0.1)' : 'rgba(0, 255, 136, 0.1)',
          padding: '6px 12px',
          borderRadius: '20px',
          border: isTuning ? '1px solid rgba(0, 210, 255, 0.3)' : '1px solid rgba(0, 255, 136, 0.3)',
          color: isTuning ? 'var(--accent-blue)' : 'var(--accent-green)',
          fontSize: '12px',
          fontWeight: 'bold',
          transition: 'all 0.5s ease'
        }}>
          <BrainCircuit size={16} style={{ animation: isTuning ? 'pulse-blue 1.5s infinite' : 'pulse-green 1.5s infinite' }} />
          <span>{isTuning ? '未平倉：權重即時運算中' : '已平倉：誤差模型修正完成'}</span>
        </div>
      </div>
      
      <div style={{ height: '280px', width: '100%', marginTop: '10px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="event" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickFormatter={(val) => `${val}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              name="AI 預測跌幅" 
              stroke="var(--accent-blue)" 
              strokeWidth={3}
              activeDot={{ r: 8, fill: 'var(--accent-blue)', stroke: '#fff' }} 
              style={{ filter: 'drop-shadow(0 0 8px rgba(0,210,255,0.6))' }}
            />
            <Line 
              type="monotone" 
              dataKey="actual" 
              name="大盤實際跌幅" 
              stroke="var(--accent-green)" 
              strokeWidth={3}
              strokeDasharray="5 5"
              activeDot={{ r: 8, fill: 'var(--accent-green)', stroke: '#fff' }}
              style={{ filter: 'drop-shadow(0 0 8px rgba(0,255,136,0.6))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
