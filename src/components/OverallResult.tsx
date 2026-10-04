import React from 'react';

interface OverallResultProps {
  score: number | null;
  confidence: number;
  classification: string;
}

export function OverallResult({ score, confidence, classification }: OverallResultProps) {
  const percentage = score !== null && Number.isFinite(score) ? Math.round(score * 100) : null;
  const confidencePercent = Math.round((confidence ?? 0) * 100);

  let colorClass = 'bg-yellow';
  let textColorClass = 'color-yellow';
  if (score !== null) {
    if (score > 0.65) {
      colorClass = 'bg-red';
      textColorClass = 'color-red';
    } else if (score < 0.35) {
      colorClass = 'bg-green';
      textColorClass = 'color-green';
    }
  }

  let confidenceLevel = 'Low';
  if (confidence > 0.7) confidenceLevel = 'High';
  else if (confidence > 0.4) confidenceLevel = 'Medium';

  const displayLabel = classification
    ? classification.replace(/_/g, ' ').toUpperCase()
    : 'INCONCLUSIVE';

  return (
    <div className="card overall-result" style={{ textAlign: 'center' }}>
      <h2 style={{ marginBottom: '5px' }}>Analysis Result</h2>
      <div
        className={`classification ${textColorClass}`}
        style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}
      >
        {displayLabel}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>AI Likelihood</span>
          <span>{percentage !== null ? `${percentage}%` : 'N/A (Inconclusive)'}</span>
        </div>
        <div
          style={{
            width: '100%',
            height: '12px',
            backgroundColor: '#e0e0e0',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          <div
            className={colorClass}
            style={{
              width: `${percentage ?? 0}%`,
              height: '100%',
              transition: 'width 0.5s ease-in-out',
            }}
          ></div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Confidence ({confidenceLevel})</span>
          <span>{confidencePercent}%</span>
        </div>
        <div
          style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${confidencePercent}%`,
              height: '100%',
              backgroundColor: 'var(--primary)',
              transition: 'width 0.5s ease-in-out',
            }}
          ></div>
        </div>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontStyle: 'italic', margin: 0 }}>
        This is an AI-associated likelihood score, not a probability of authorship.
      </p>
    </div>
  );
}
