import React from 'react';
import RiskIndicator from './components/RiskIndicator';
import SentimentMeter from './components/SentimentMeter';
import LiveFeed from './components/LiveFeed';
import SectorImpact from './components/SectorImpact';
import { Activity } from 'lucide-react';

function App() {
  return (
    <>
      <div className="scanlines"></div>
      
      <header className="header-container">
        <h1 className="title-glow">川普投顧即時預測矩陣 (TRUMP ADVISORY TERMINAL)</h1>
        <div className="live-badge">
          <div className="live-dot"></div>
          LIVE: 阿曼地緣政治危機
        </div>
      </header>

      <main className="dashboard-grid">
        <RiskIndicator />
        <SentimentMeter />
        <LiveFeed />
        <SectorImpact />
      </main>
      
      <footer style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '12px', borderTop: '1px solid var(--panel-border)', marginTop: '24px' }}>
        <p>POWERED BY AI NLP ANALYSIS • CONFIDENTIAL FINANCIAL TERMINAL</p>
      </footer>
    </>
  );
}

export default App;
