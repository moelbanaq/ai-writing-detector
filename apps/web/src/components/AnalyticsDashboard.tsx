import React, { useState, useEffect } from 'react';
import { getAnalyticsStats, resetAnalyticsStats } from '../services/api';

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pinRequired, setPinRequired] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [activePin, setActivePin] = useState<string>(() => {
    return localStorage.getItem('ai_detector_admin_pin') || '';
  });

  const fetchStats = async (pin?: string) => {
    setLoading(true);
    setError(null);
    try {
      const pinToUse = pin !== undefined ? pin : activePin;
      const res = await getAnalyticsStats(pinToUse);

      if (res.success && res.stats) {
        setStats(res.stats);
        setPinRequired(false);
        if (pinToUse) {
          localStorage.setItem('ai_detector_admin_pin', pinToUse);
        }
      } else if (res.isPinProtected || res.error === 'PIN_REQUIRED') {
        setPinRequired(true);
        setError('Analytics dashboard is PIN protected. Please enter the Admin PIN.');
      } else {
        setError(res.error || 'Failed to load analytics statistics.');
      }
    } catch (err: any) {
      setError(err?.message || 'Server connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActivePin(pinInput);
    fetchStats(pinInput);
  };

  const handleExportJSON = () => {
    if (!stats) return;
    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalScans = stats?.totalAnalyses || 0;
  const classifications = stats?.classifications || {
    human_likely: 0,
    ai_likely: 0,
    ai_edited_likely: 0,
    inconclusive: 0,
  };

  const aiCount = (classifications.ai_likely || 0) + (classifications.ai_edited_likely || 0);
  const aiRate = totalScans > 0 ? Math.round((aiCount / totalScans) * 100) : 0;
  const humanRate = totalScans > 0 ? Math.round(((classifications.human_likely || 0) / totalScans) * 100) : 0;
  const inconvRate = totalScans > 0 ? Math.round(((classifications.inconclusive || 0) / totalScans) * 100) : 0;

  return (
    <div className="analytics-dashboard" style={{ marginTop: '20px' }}>
      {/* Header and Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #334155',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#f8fafc' }}>
            📊 Usage Analytics & Forensic Metrics
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            Real-time analytics on document scans, user volume, and forensic AI detection ratios
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => fetchStats()}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1e293b',
              color: '#38bdf8',
              border: '1px solid #38bdf8',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            🔄 {loading ? 'Refreshing...' : 'Refresh Now'}
          </button>

          {stats && (
            <button
              onClick={handleExportJSON}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0284c7',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              📥 Export JSON Report
            </button>
          )}
        </div>
      </div>

      {/* PIN Authentication Required Screen */}
      {pinRequired && (
        <div
          style={{
            maxWidth: '440px',
            margin: '40px auto',
            padding: '28px',
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid #475569',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔒</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#f8fafc' }}>Analytics Dashboard Protected</h3>
          <p style={{ margin: '0 0 20px 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            Admin PIN protection is active. Please enter the secret PIN to access analytics:
          </p>
          <form onSubmit={handlePinSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="password"
              placeholder="Enter Admin PIN..."
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                backgroundColor: '#0f172a',
                border: '1px solid #475569',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '1rem',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '10px 18px',
                backgroundColor: '#38bdf8',
                color: '#0f172a',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Unlock
            </button>
          </form>
          {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '12px' }}>{error}</p>}
        </div>
      )}

      {/* Main Stats Display */}
      {stats && !pinRequired && (
        <>
          {/* Top 4 KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            {/* Card 1: Unique Visitors */}
            <div
              style={{
                backgroundColor: '#1e293b',
                padding: '20px',
                borderRadius: '10px',
                border: '1px solid #334155',
                borderTop: '4px solid #38bdf8',
              }}
            >
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
                👥 Unique Visitors
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#f8fafc', margin: '8px 0' }}>
                {stats.uniqueVisitorsCount?.toLocaleString() || 1}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Total Visits: {stats.totalVisitors?.toLocaleString() || 1}
              </div>
            </div>

            {/* Card 2: Total Analyses */}
            <div
              style={{
                backgroundColor: '#1e293b',
                padding: '20px',
                borderRadius: '10px',
                border: '1px solid #334155',
                borderTop: '4px solid #10b981',
              }}
            >
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
                📝 Total Analyses Run
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#f8fafc', margin: '8px 0' }}>
                {totalScans.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#10b981' }}>
                Manuscripts & documents scanned
              </div>
            </div>

            {/* Card 3: Total Words */}
            <div
              style={{
                backgroundColor: '#1e293b',
                padding: '20px',
                borderRadius: '10px',
                border: '1px solid #334155',
                borderTop: '4px solid #8b5cf6',
              }}
            >
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
                📚 Total Words Analyzed
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#f8fafc', margin: '8px 0' }}>
                {stats.totalWords?.toLocaleString() || 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Average: {totalScans > 0 ? Math.round(stats.totalWords / totalScans) : 0} words/scan
              </div>
            </div>

            {/* Card 4: AI Detection Rate */}
            <div
              style={{
                backgroundColor: '#1e293b',
                padding: '20px',
                borderRadius: '10px',
                border: '1px solid #334155',
                borderTop: '4px solid #f59e0b',
              }}
            >
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
                🤖 AI Detection Rate
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#f8fafc', margin: '8px 0' }}>
                {aiRate}%
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {aiCount} of {totalScans} documents flagged
              </div>
            </div>
          </div>

          {/* Row 2: Distribution & Languages */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
              marginBottom: '24px',
            }}
          >
            {/* Classification Breakdown */}
            <div
              style={{
                backgroundColor: '#1e293b',
                padding: '22px',
                borderRadius: '10px',
                border: '1px solid #334155',
              }}
            >
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#f8fafc' }}>
                ⚖️ Classification Distribution
              </h3>

              {totalScans === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No analyses recorded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Human Likely */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.88rem' }}>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>👤 Human Likely</span>
                      <span style={{ color: '#f8fafc' }}>{classifications.human_likely} ({humanRate}%)</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${humanRate}%`, height: '100%', backgroundColor: '#10b981' }} />
                    </div>
                  </div>

                  {/* AI Likely */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.88rem' }}>
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>🤖 AI Likely</span>
                      <span style={{ color: '#f8fafc' }}>
                        {classifications.ai_likely} ({totalScans > 0 ? Math.round((classifications.ai_likely / totalScans) * 100) : 0}%)
                      </span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${totalScans > 0 ? (classifications.ai_likely / totalScans) * 100 : 0}%`,
                          height: '100%',
                          backgroundColor: '#ef4444',
                        }}
                      />
                    </div>
                  </div>

                  {/* AI Edited */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.88rem' }}>
                      <span style={{ color: '#f59e0b', fontWeight: 600 }}>✍️ AI-Edited Likely</span>
                      <span style={{ color: '#f8fafc' }}>
                        {classifications.ai_edited_likely} ({totalScans > 0 ? Math.round((classifications.ai_edited_likely / totalScans) * 100) : 0}%)
                      </span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${totalScans > 0 ? (classifications.ai_edited_likely / totalScans) * 100 : 0}%`,
                          height: '100%',
                          backgroundColor: '#f59e0b',
                        }}
                      />
                    </div>
                  </div>

                  {/* Inconclusive */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.88rem' }}>
                      <span style={{ color: '#94a3b8', fontWeight: 600 }}>❓ Inconclusive</span>
                      <span style={{ color: '#f8fafc' }}>{classifications.inconclusive} ({inconvRate}%)</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${inconvRate}%`, height: '100%', backgroundColor: '#64748b' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Languages & System Health */}
            <div
              style={{
                backgroundColor: '#1e293b',
                padding: '22px',
                borderRadius: '10px',
                border: '1px solid #334155',
              }}
            >
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#f8fafc' }}>
                🌐 Language Distribution & Activity
              </h3>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div style={{ flex: 1, backgroundColor: '#0f172a', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ color: '#38bdf8', fontSize: '1.4rem', fontWeight: 700 }}>
                    {stats.languages?.en || 0}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>🇺🇸 English</div>
                </div>

                <div style={{ flex: 1, backgroundColor: '#0f172a', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ color: '#10b981', fontSize: '1.4rem', fontWeight: 700 }}>
                    {stats.languages?.ar || 0}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>🇸🇦 Arabic</div>
                </div>

                <div style={{ flex: 1, backgroundColor: '#0f172a', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ color: '#a855f7', fontSize: '1.4rem', fontWeight: 700 }}>
                    {Object.entries(stats.languages || {})
                      .filter(([k]) => k !== 'en' && k !== 'ar')
                      .reduce((acc, [, v]) => acc + (v as number), 0)}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>🌍 Other</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #334155', paddingTop: '12px', fontSize: '0.82rem', color: '#64748b' }}>
                <div>⏱️ Tracking Started: {new Date(stats.startedAt).toLocaleDateString()}</div>
                <div>⚡ Last Active Scan: {new Date(stats.lastActiveAt).toLocaleTimeString()}</div>
              </div>
            </div>
          </div>

          {/* Top Tells */}
          {stats.topTells && Object.keys(stats.topTells).length > 0 && (
            <div
              style={{
                backgroundColor: '#1e293b',
                padding: '22px',
                borderRadius: '10px',
                border: '1px solid #334155',
                marginBottom: '24px',
              }}
            >
              <h3 style={{ margin: '0 0 14px 0', fontSize: '1.1rem', color: '#f8fafc' }}>
                🔍 Top Detected AI Tells & Formulaic Patterns
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.entries(stats.topTells)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 10)
                  .map(([rule, count]) => (
                    <div
                      key={rule}
                      style={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        color: '#cbd5e1',
                      }}
                    >
                      <span style={{ color: '#f59e0b', fontWeight: 600 }}>{count as number}×</span> {rule}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Recent Activity Feed Table */}
          <div
            style={{
              backgroundColor: '#1e293b',
              padding: '22px',
              borderRadius: '10px',
              border: '1px solid #334155',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#f8fafc' }}>
              📜 Recent Forensic Activity Log
            </h3>

            {(!stats.recentActivity || stats.recentActivity.length === 0) ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No scan activity recorded yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                      <th style={{ padding: '10px' }}>Timestamp</th>
                      <th style={{ padding: '10px' }}>Language</th>
                      <th style={{ padding: '10px' }}>Word Count</th>
                      <th style={{ padding: '10px' }}>Verdict</th>
                      <th style={{ padding: '10px' }}>AI Likelihood</th>
                      <th style={{ padding: '10px' }}>Confidence</th>
                      <th style={{ padding: '10px' }}>Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentActivity.slice(0, 15).map((item: any) => {
                      const badgeBg =
                        item.label === 'human_likely'
                          ? '#064e3b'
                          : item.label === 'ai_likely'
                          ? '#7f1d1d'
                          : item.label === 'ai_edited_likely'
                          ? '#78350f'
                          : '#1e293b';
                      const badgeColor =
                        item.label === 'human_likely'
                          ? '#34d399'
                          : item.label === 'ai_likely'
                          ? '#f87171'
                          : item.label === 'ai_edited_likely'
                          ? '#fbbf24'
                          : '#94a3b8';

                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid #1f293d', color: '#e2e8f0' }}>
                          <td style={{ padding: '10px', color: '#94a3b8' }}>
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '10px', textTransform: 'uppercase' }}>{item.language}</td>
                          <td style={{ padding: '10px' }}>{item.wordCount} words</td>
                          <td style={{ padding: '10px' }}>
                            <span
                              style={{
                                backgroundColor: badgeBg,
                                color: badgeColor,
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                              }}
                            >
                              {item.label}
                            </span>
                          </td>
                          <td style={{ padding: '10px', fontWeight: 600 }}>{item.aiLikelihood}%</td>
                          <td style={{ padding: '10px', color: '#94a3b8' }}>{item.confidence}%</td>
                          <td style={{ padding: '10px', color: '#64748b' }}>{item.processingTimeMs}ms</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
