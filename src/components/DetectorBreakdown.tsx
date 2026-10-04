import React, { useState } from 'react';

interface EvidenceItem {
  id?: string;
  detectorId?: string;
  feature?: string;
  observedValue?: number;
  direction?: string;
  interpretation?: string;
  reliability?: number;
}

interface DetectorItem {
  detectorId: string;
  version?: string;
  name?: string;
  score: number | null;
  confidence: number;
  reliability: number;
  status: string;
  evidenceIds?: string[];
  limitations?: string[];
}

interface DetectorBreakdownProps {
  detectors: DetectorItem[];
  allEvidence?: EvidenceItem[];
}

function formatDetectorName(id: string): string {
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function DetectorBreakdown({ detectors = [], allEvidence = [] }: DetectorBreakdownProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!detectors || detectors.length === 0) return null;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="card detector-breakdown">
      <h3>Detector Breakdown</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {detectors.map((detector) => {
          const name = detector.name || formatDetectorName(detector.detectorId);
          const hasScore = detector.score !== null && Number.isFinite(detector.score);
          const scorePercent = hasScore ? Math.round(detector.score! * 100) : null;
          const status = detector.status || 'active';

          // Resolve evidence for this detector
          const detectorEvidence = allEvidence.filter(
            (e) =>
              e.detectorId === detector.detectorId ||
              (detector.evidenceIds && detector.evidenceIds.includes(e.id ?? '')),
          );

          return (
            <div
              key={detector.detectorId}
              style={{
                border: '1px solid var(--border)',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'var(--surface)',
                }}
                onClick={() => toggleExpand(detector.detectorId)}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '5px',
                    }}
                  >
                    <strong style={{ fontSize: '1.1rem' }}>{name}</strong>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        backgroundColor: status === 'active' ? '#e8f5e9' : '#fff3e0',
                        color: status === 'active' ? '#2e7d32' : '#e65100',
                      }}
                    >
                      {status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: '#e0e0e0',
                      borderRadius: '3px',
                      marginTop: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: `${hasScore ? scorePercent : 0}%`,
                        height: '100%',
                        backgroundColor:
                          hasScore && detector.score! > 0.65
                            ? 'var(--red)'
                            : hasScore && detector.score! < 0.35
                              ? 'var(--green)'
                              : 'var(--yellow)',
                        borderRadius: '3px',
                      }}
                    ></div>
                  </div>
                </div>
                <div style={{ marginLeft: '20px', fontWeight: 'bold' }}>
                  {hasScore ? `${scorePercent}%` : 'N/A'}
                </div>
              </div>

              {expandedId === detector.detectorId && (
                <div
                  style={{
                    padding: '15px',
                    borderTop: '1px solid var(--border)',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>Evidence:</h4>
                  {detectorEvidence.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)' }}>
                      No specific evidence recorded for this detector.
                    </p>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem' }}>
                      {detectorEvidence.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '5px' }}>
                          <strong>{item.feature}:</strong> {item.interpretation} (
                          {item.direction?.replace(/_/g, ' ')})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
