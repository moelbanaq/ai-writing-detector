import React from 'react';

interface EvidenceItem {
  id?: string;
  detectorId?: string;
  feature?: string;
  observedValue?: number;
  value?: number;
  unit?: string;
  direction?: 'ai_associated' | 'human_associated' | 'neutral' | string;
  interpretation?: string;
  reliability?: number;
}

interface EvidencePanelProps {
  evidence?: EvidenceItem[];
}

export function EvidencePanel({ evidence = [] }: EvidencePanelProps) {
  if (!evidence || evidence.length === 0) return null;

  return (
    <div className="card evidence-panel">
      <h3>Key Forensic Evidence</h3>
      <div style={{ display: 'grid', gap: '10px' }}>
        {evidence.map((item, index) => {
          let badgeColor = '#9e9e9e';
          let badgeBg = '#f5f5f5';
          if (item.direction === 'ai_associated') {
            badgeColor = '#c62828';
            badgeBg = '#ffebee';
          } else if (item.direction === 'human_associated') {
            badgeColor = '#2e7d32';
            badgeBg = '#e8f5e9';
          }

          const val = item.observedValue ?? item.value;
          const displayVal = val !== undefined && Number.isFinite(val) ? val.toFixed(2) : null;
          const unit = item.unit ? ` (${item.unit})` : '';

          return (
            <div
              key={item.id || index}
              style={{
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '15px',
                backgroundColor: '#fff',
              }}
            >
              <div
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: badgeBg,
                  color: badgeColor,
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                }}
              >
                {(item.direction ?? 'neutral').replace(/_/g, ' ').toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {item.feature}
                  {displayVal !== null && (
                    <span
                      style={{
                        fontWeight: 'normal',
                        color: 'var(--text-light)',
                        marginLeft: '6px',
                      }}
                    >
                      = {displayVal}
                      {unit}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                  {item.interpretation}
                </div>
                {item.reliability !== undefined && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '4px' }}>
                    Reliability: {Math.round(item.reliability * 100)}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
