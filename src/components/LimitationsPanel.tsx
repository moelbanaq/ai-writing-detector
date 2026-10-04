import React from 'react';

interface LimitationItem {
  code?: string;
  type?: string;
  severity?: 'info' | 'warning' | 'critical' | string;
  message?: string;
}

interface LimitationsPanelProps {
  limitations?: LimitationItem[];
}

export function LimitationsPanel({ limitations = [] }: LimitationsPanelProps) {
  if (!limitations || limitations.length === 0) {
    return (
      <div className="card limitations-panel">
        <h3>Analysis Diagnostic Limitations</h3>
        <p style={{ color: 'var(--text-light)', fontStyle: 'italic', margin: 0 }}>
          No diagnostic limitations identified for this text.
        </p>
      </div>
    );
  }

  return (
    <div className="card limitations-panel">
      <h3>Analysis Diagnostic Limitations</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {limitations.map((limitation, index) => {
          let bgColor = '#e3f2fd'; // info
          let icon = 'ℹ️';

          if (limitation.severity === 'warning') {
            bgColor = '#fff3e0';
            icon = '⚠️';
          } else if (limitation.severity === 'critical') {
            bgColor = '#ffebee';
            icon = '🚨';
          }

          return (
            <div
              key={limitation.code || index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                backgroundColor: bgColor,
                borderRadius: '4px',
                fontSize: '0.9rem',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{icon}</span>
              <div style={{ flex: 1 }}>
                {limitation.code && (
                  <strong
                    style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dark)' }}
                  >
                    [{limitation.code}]
                  </strong>
                )}
                <span>{limitation.message}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
