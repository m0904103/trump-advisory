import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function RiskIndicator() {
  return (
    <div className="glass-panel" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }}>
      <h2 className="text-xl">今晚下殺機率 (Crash Probability)</h2>
      
      <div style={{ position: 'relative', marginTop: '20px' }}>
        <div className="risk-number" style={{
          fontSize: '96px',
          fontWeight: '900',
          fontFamily: 'Outfit, sans-serif',
          color: 'var(--accent-green)',
          animation: 'pulse-green 2s infinite',
          lineHeight: '1'
        }}>
          85<span style={{ fontSize: '48px' }}>%</span>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '24px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        background: 'rgba(0, 255, 136, 0.1)',
        padding: '12px 20px',
        borderRadius: '8px',
        border: '1px solid rgba(0, 255, 136, 0.2)'
      }}>
        <AlertTriangle color="var(--accent-green)" size={24} />
        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>極度危險：地緣政治系統性風險</span>
      </div>
    </div>
  );
}
