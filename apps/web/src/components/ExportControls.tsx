import React from 'react';

interface ExportControlsProps {
  report: any;
  onOpenPdfReport?: () => void;
}

export function ExportControls({ report, onOpenPdfReport }: ExportControlsProps) {
  const handleExportJSON = () => {
    const jsonString = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis_report_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '-10px' }}>
      {onOpenPdfReport && (
        <button
          className="btn"
          onClick={onOpenPdfReport}
          style={{
            fontSize: '0.85rem',
            padding: '0.4rem 0.8rem',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          📄 Export PDF Report
        </button>
      )}

      <button
        className="btn btn-secondary"
        onClick={handleExportJSON}
        style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
      >
        Export JSON Report
      </button>
    </div>
  );
}
