import React from 'react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      className="card"
      style={{
        backgroundColor: '#ffebee',
        border: '1px solid #ffcdd2',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
      }}
    >
      <div style={{ fontSize: '2rem' }}>⚠️</div>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 5px 0', color: '#c62828' }}>Analysis Error</h4>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#b71c1c' }}>{message}</p>
      </div>
      <button
        className="btn"
        onClick={onRetry}
        style={{ backgroundColor: 'transparent', border: '1px solid #d32f2f', color: '#d32f2f' }}
      >
        Dismiss
      </button>
    </div>
  );
}
