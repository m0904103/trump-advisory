import React, { useState, useEffect } from 'react';
import { Globe, Landmark, ShieldAlert, Eye, Layers, AlertTriangle } from 'lucide-react';

const GEN31_STATUS_URL = 'https://m0904103.github.io/q_quant_888/gen31_rsi_status.json';

const REGIME_ZH = {
  RED_GEOPOLITICAL_SHOCK: { label: '🔴 高度警戒：地緣衝突與能源震盪', color: '#ff3366' },
  ORANGE_STAGFLATION_RISK: { label: '🟠 審慎防守：停滯性通膨與川普關稅摩擦', color: '#ffb800' },
  YELLOW_TARIFF_FRICTION: { label: '🟡 震盪觀察：政策不確定與供應鏈重塑', color: '#fbbf24' },
  GREEN_EXPANSION: { label: '🟢 順勢偏多：總經平穩可挑多頭共振', color: '#00ff88' },
};

const AI_PHASE_ZH = {
  DELEVERAGING_SHAKEOUT: '殺估值去槓桿期（嚴禁追高無現金流 AI）',
  EUPHORIA_OVERHEATED: '資本狂熱過熱期（分批停利）',
  HEALTHY_DIGESTION: '健康輪動消化期',
};

function GaugeRow({ label, value, toneColor, tag }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
        <span style={{ color: '#e2e8f0', fontWeight: 700 }}>{label}</span>
        <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#fff' }}>
          {value ?? '--'}/100 <span style={{ color: toneColor, fontSize: '12px' }}>({tag})</span>
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ height: '10px', width: '100%', borderRadius: '999px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}
      >
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: '999px', background: toneColor, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}

export default function NouTrumpMacroPanel() {
  const [status, setStatus] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    try {
      const saved = localStorage.getItem('trump_nou_view_mode');
      if (saved === 'simple' || saved === 'pro') return saved;
    } catch (_) {
      // ignore
    }
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'simple' : 'pro';
  });

  const switchMode = (m) => {
    setViewMode(m);
    try {
      localStorage.setItem('trump_nou_view_mode', m);
    } catch (_) {
      // ignore
    }
  };

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`${GEN31_STATUS_URL}?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (alive && json?.macro_geopolitics) setStatus(json);
        }
      } catch (_) {
        // silent fallback
      }
    };
    load();
    const timer = setInterval(load, 60000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  if (!status) return null;

  const mg = status.macro_geopolitics || {};
  const ml = status.monetary_liquidity || {};
  const ds = status.derivatives_shield || {};
  const sm = status.statistical_modeling || {};

  const tel = mg.live_telemetry || {};
  const ppp = mg.taiwan_ppp_fx_gauge || {};
  const ai = mg.ai_bubble_cycle || {};
  const sc = mg.supply_chain_tariff_audit || {};
  const yc = ml.yield_curve_clock || {};
  const fisher = ml.fisher_real_rate || {};
  const txf = ds.taifex_foreign_txf || {};
  const kelly = sm.half_kelly_position_sizing || {};

  const reg = REGIME_ZH[mg.macro_regime] || { label: '🟡 總經地緣即時監控中', color: '#ffb800' };
  const macroColor = (mg.macro_stress_score ?? 50) >= 75 ? '#ff3366' : (mg.macro_stress_score ?? 50) >= 55 ? '#ffb800' : '#00ff88';
  const liqColor = (ml.liquidity_stress_score ?? 50) >= 70 ? '#ff3366' : (ml.liquidity_stress_score ?? 50) >= 45 ? '#ffb800' : '#00ff88';

  const cardStyle = {
    background: 'rgba(15, 20, 30, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  };

  return (
    <section
      aria-labelledby="nou-trump-macro-heading"
      className="glass-panel"
      style={{
        gridColumn: 'span 12',
        border: '1px solid rgba(255, 184, 0, 0.35)',
        background: 'linear-gradient(135deg, rgba(22, 26, 38, 0.92), rgba(12, 15, 22, 0.95))',
      }}
    >
      {/* 標題與雙模式切換列（>= 44px 行動觸控熱區） */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <h2 id="nou-trump-macro-heading" style={{ fontSize: '18px', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span>🏛️ 空大《全球經貿個案解讀》× 川普 2.0 即時戰情儀表板</span>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: 'rgba(0, 210, 255, 0.15)', color: '#7dd3fc', border: '1px solid rgba(0, 210, 255, 0.3)' }}>
              Gen 31 同步 {status.updated_at}
            </span>
          </h2>
          <p style={{ fontSize: '13px', color: reg.color, fontWeight: 700, marginTop: '4px' }}>
            {reg.label}
          </p>
        </div>

        <div role="group" aria-label="川普戰情儀表顯示模式" style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => switchMode('simple')}
            aria-pressed={viewMode === 'simple'}
            style={{
              minHeight: '44px',
              padding: '8px 14px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: viewMode === 'simple' ? '1px solid #fcd34d' : '1px solid rgba(255,255,255,0.18)',
              background: viewMode === 'simple' ? '#ffb800' : 'rgba(255,255,255,0.06)',
              color: viewMode === 'simple' ? '#090d16' : '#e2e8f0',
            }}
          >
            <Eye size={16} aria-hidden="true" />
            <span>精簡秒看</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('pro')}
            aria-pressed={viewMode === 'pro'}
            style={{
              minHeight: '44px',
              padding: '8px 14px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: viewMode === 'pro' ? '1px solid #fcd34d' : '1px solid rgba(255,255,255,0.18)',
              background: viewMode === 'pro' ? '#ffb800' : 'rgba(255,255,255,0.06)',
              color: viewMode === 'pro' ? '#090d16' : '#e2e8f0',
            }}
          >
            <Layers size={16} aria-hidden="true" />
            <span>經貿全覽</span>
          </button>
        </div>
      </div>

      {/* 第一層：一秒關鍵結論 KPI（Edward Tufte 降噪原則） */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginTop: '16px' }}>
        <div style={cardStyle}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>建議最低現金底線</span>
          <strong style={{ fontSize: '26px', fontFamily: 'monospace', color: '#00ff88' }}>≥ {mg.recommended_cash_floor_pct ?? 55}%</strong>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>半凱利單檔上限 {kelly.recommended_max_single_pos_pct ?? '--'}%</span>
        </div>
        <div style={cardStyle}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>WTI 原油（荷姆茲雷達）</span>
          <strong style={{ fontSize: '24px', fontFamily: 'monospace', color: '#fb923c' }}>${tel.wti_oil?.price ?? '--'}</strong>
          <span style={{ fontSize: '12px', color: '#cbd5e1' }}>黃金 ${tel.gold?.price ?? '--'}</span>
        </div>
        <div style={cardStyle}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>美債 10Y / 費雪實質利率</span>
          <strong style={{ fontSize: '24px', fontFamily: 'monospace', color: '#ff3366' }}>{yc.us10y_pct ?? '--'}%</strong>
          <span style={{ fontSize: '12px', color: '#cbd5e1' }}>實質 {fisher.fisher_real_rate_pct ?? '--'}% · 合理PE ≤ {fisher.implied_fair_pe_ceiling ?? '--'}x</span>
        </div>
        <div style={cardStyle}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>台幣匯率（大麥克 PPP）</span>
          <strong style={{ fontSize: '24px', fontFamily: 'monospace', color: '#00d2ff' }}>{ppp.usdtwd ?? '--'}</strong>
          <span style={{ fontSize: '12px', color: '#cbd5e1' }}>結構低估 {ppp.twd_ppp_undervaluation_pct ?? '--'}%（美國觀察線）</span>
        </div>
      </div>

      {/* 雙壓力儀表條 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginTop: '14px', padding: '14px', borderRadius: '12px', background: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <GaugeRow
          label="🌍 川普關稅與地緣總經壓力"
          value={mg.macro_stress_score}
          toneColor={macroColor}
          tag={macroColor === '#ff3366' ? '高壓紅燈' : macroColor === '#ffb800' ? '警戒橘燈' : '平穩綠燈'}
        />
        <GaugeRow
          label="🏦 聯準會貨幣流動性緊縮"
          value={ml.liquidity_stress_score}
          toneColor={liqColor}
          tag={liqColor === '#ff3366' ? '極度抽水' : liqColor === '#ffb800' ? '偏緊逆風' : '寬鬆順風'}
        />
      </div>

      {/* 白話行動指令 */}
      <div style={{ marginTop: '14px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255, 184, 0, 0.1)', border: '1px solid rgba(255, 184, 0, 0.3)', display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', lineHeight: 1.6, color: '#fef3c7' }}>
        <AlertTriangle size={18} style={{ color: '#ffb800', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
        <div>
          <strong style={{ color: '#ffb800' }}>方晨教授 × Gen 31 今日白話對策：</strong>
          {mg.action_note || '維持高現金防禦水位，遠離高關稅轉口股與高本益比無現金流標的。'}
        </div>
      </div>

      {/* 第二層：經貿全覽（僅在 pro 模式展開） */}
      {viewMode === 'pro' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '16px' }}>
          <article style={cardStyle}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#ffb800', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={16} aria-hidden="true" />
              <span>Ch.2 & Ch.5 川普關稅與冗餘供應鏈稽核</span>
            </h3>
            <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.6 }}>
              越南 35% 潛在關稅與對中晶片禁令下，優先避開高轉口依賴代工股，轉進內需與關稅豁免資產。
            </p>
            <details style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '8px 10px', fontSize: '12px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#fda4af' }}>
                ⚠️ 查看高關稅曝險名單（{sc.high_tariff_exposure_count ?? 0} 檔）
              </summary>
              <ul style={{ marginTop: '8px', paddingLeft: '16px', color: '#e2e8f0', lineHeight: 1.7 }}>
                {(sc.high_tariff_exposure_list || []).map((item) => (
                  <li key={item.symbol}>
                    <strong>{item.symbol} {item.name}</strong>：{item.tag}
                  </li>
                ))}
              </ul>
            </details>
            <details style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '8px 10px', fontSize: '12px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#6ee7b7' }}>
                🛡️ 查看關稅絕緣防禦盾（{sc.tariff_insulated_count ?? 0} 檔）
              </summary>
              <ul style={{ marginTop: '8px', paddingLeft: '16px', color: '#e2e8f0', lineHeight: 1.7 }}>
                {(sc.tariff_insulated_list || []).map((item) => (
                  <li key={item.symbol}>
                    <strong>{item.symbol} {item.name}</strong>：{item.tag}
                  </li>
                ))}
              </ul>
            </details>
          </article>

          <article style={cardStyle}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Landmark size={16} aria-hidden="true" />
              <span>Ch.9-1 AI 資本狂熱與去槓桿週期</span>
            </h3>
            <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.6 }}>
              2026 五大科技巨頭 AI Capex 達 <strong style={{ color: '#fff' }}>$7,000 億</strong>（超越全球油氣探勘 $5,700 億）。近 20 日那指落後標普 <strong style={{ color: '#ff3366' }}>{ai.ndx_vs_spx_spread_20d_pct ?? '--'}%</strong>。
            </p>
            <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(192, 132, 252, 0.12)', fontSize: '12px', color: '#e9d5ff', fontWeight: 700 }}>
              目前階段：{AI_PHASE_ZH[ai.phase] || ai.phase || '--'}
            </div>
          </article>

          <article style={cardStyle}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#ff3366', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={16} aria-hidden="true" />
              <span>外資台指期防護罩 × 籌碼實況</span>
            </h3>
            <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.6 }}>
              期交所官方最新外資台指期未平倉：
              <strong style={{ color: '#ff3366', fontSize: '15px', fontFamily: 'monospace', marginLeft: '4px' }}>
                {typeof txf.foreign_txf_net_oi === 'number' ? `${txf.foreign_txf_net_oi.toLocaleString()} 口` : '--'}
              </strong>
              （淨空 {txf.net_value_yi_twd ?? '--'} 億）。
            </p>
            <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(255, 51, 102, 0.12)', fontSize: '12px', color: '#fecdd3', fontWeight: 700 }}>
              {txf.shield_status || '即時監控中'}
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
