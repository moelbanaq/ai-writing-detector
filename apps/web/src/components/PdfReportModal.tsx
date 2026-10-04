import React from 'react';

interface PdfReportModalProps {
  report: any;
  isOpen: boolean;
  onClose: () => void;
}

export function PdfReportModal({ report, isOpen, onClose }: PdfReportModalProps) {
  if (!isOpen || !report) return null;

  const handlePrint = () => {
    window.print();
  };

  const aiLikelihood = report.classification?.aiLikelihood;
  const humanLikelihood = report.classification?.humanLikelihood;
  const label = report.classification?.label || 'inconclusive';
  const confidence = report.confidence?.score ?? 0;
  const confidenceLevel = report.confidence?.level || 'medium';
  const interval = report.confidence?.interval || { lower: 0, upper: 1 };

  const sentences = report.segments?.sentences || [];
  const detectors = report.detectors || [];
  const stats = report.statistics || {};
  const readability = stats.readability || {};

  const isAiLikely = label === 'ai_likely';
  const isHumanLikely = label === 'human_likely';
  const isAiEdited = label === 'ai_edited_likely';

  const verdictBadgeColor = isAiLikely
    ? '#ef4444'
    : isAiEdited
    ? '#f59e0b'
    : isHumanLikely
    ? '#10b981'
    : '#64748b';

  const verdictBadgeBg = isAiLikely
    ? '#fee2e2'
    : isAiEdited
    ? '#fef3c7'
    : isHumanLikely
    ? '#dcfce7'
    : '#f1f5f9';

  const verdictText = isAiLikely
    ? 'AI-GENERATED PROSE DETECTED'
    : isAiEdited
    ? 'AI-ASSISTED / HEAVILY EDITED PROSE'
    : isHumanLikely
    ? 'AUTHENTIC HUMAN-AUTHORED MANUSCRIPT'
    : 'INCONCLUSIVE EVIDENCE';

  // Extract all flagged sentences with tells
  const flaggedSentences = sentences
    .map((s: any, idx: number) => ({ ...s, originalIndex: idx + 1 }))
    .filter((s: any) => s.analysis?.tells && s.analysis.tells.length > 0);

  return (
    <div
      className="pdf-report-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflowY: 'auto',
        padding: '24px 16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="pdf-report-content"
        style={{
          backgroundColor: '#ffffff',
          color: '#0f172a',
          width: '100%',
          maxWidth: '900px',
          borderRadius: '12px',
          padding: '36px 44px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          position: 'relative',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          lineHeight: '1.6',
        }}
      >
        {/* Screen Action Bar (Hidden during printing) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '28px',
          }}
        >
          <div>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>📄 Academic Forensic Report Preview</span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '12px' }}>
              (Tip: Ensure "Background graphics" is enabled in browser print dialog)
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.9rem',
              }}
            >
              🖨️ Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#475569',
                color: '#ffffff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Report Official Academic Header */}
        <div
          style={{
            borderBottom: '3px solid #0f172a',
            paddingBottom: '16px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
              SCIENTIFIC INTEGRITY & FORENSIC AUDIT
            </div>
            <h1 style={{ margin: '4px 0 0 0', fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              AI Writing Forensic Examination Certificate
            </h1>
            <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '4px' }}>
              Algorithmic verification across information entropy, burstiness, Zipf regularity, and rhetorical styling
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.82rem', color: '#64748b' }}>
            <div><strong>Report ID:</strong> {report.reportId || 'AUDIT-' + Date.now().toString(36).toUpperCase()}</div>
            <div><strong>Date:</strong> {new Date(report.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            <div><strong>Engine Version:</strong> v3.0.0 (Journal Publication Profile)</div>
          </div>
        </div>

        {/* Verdict Banner Card */}
        <div
          style={{
            backgroundColor: verdictBadgeBg,
            border: `2px solid ${verdictBadgeColor}`,
            borderRadius: '10px',
            padding: '20px 24px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <span
              style={{
                backgroundColor: verdictBadgeColor,
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '8px',
              }}
            >
              Forensic Verdict
            </span>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: verdictBadgeColor, fontWeight: 800 }}>
              {verdictText}
            </h2>
            <div style={{ fontSize: '0.88rem', color: '#334155', marginTop: '6px' }}>
              Classification Basis: <strong>{report.classification?.basis || 'multi-detector Bayesian consensus'}</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                AI Likelihood
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: verdictBadgeColor, lineHeight: 1 }}>
                {aiLikelihood !== null && aiLikelihood !== undefined ? `${(aiLikelihood * 100).toFixed(1)}%` : 'N/A'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                Confidence
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                {(confidence * 100).toFixed(0)}%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                CI: [{(interval.lower * 100).toFixed(0)}% - {(interval.upper * 100).toFixed(0)}%]
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Statistical & Information-Theoretic Metrics */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
            1. Document Corpus & Statistical Metrics
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
            }}
          >
            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Words</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>{stats.words ?? 'N/A'}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{stats.characters ?? 0} characters</div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Sentences / Paras</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>{stats.sentences ?? 0} / {stats.paragraphs ?? 0}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Avg {stats.averageSentenceLength?.toFixed(1) ?? 0} words/sent</div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Readability Index</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                {readability.fleschKincaid ? `FK ${readability.fleschKincaid}` : 'N/A'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {readability.gunningFog ? `Fog ${readability.gunningFog}` : 'College Level'}
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Type-Token Ratio</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                {stats.typeTokenRatio ? `${(stats.typeTokenRatio * 100).toFixed(1)}%` : 'N/A'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Lexical Richness</div>
            </div>
          </div>
        </div>

        {/* Section 2: Applied Detectors & Exact Criteria Table */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
            2. Applied Forensic Detectors & Criteria Evaluation
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '8px 12px' }}>Detector Family</th>
                <th style={{ padding: '8px 12px' }}>AI Likelihood %</th>
                <th style={{ padding: '8px 12px' }}>Reliability Weight</th>
                <th style={{ padding: '8px 12px' }}>Operational Status</th>
                <th style={{ padding: '8px 12px' }}>Forensic Finding</th>
              </tr>
            </thead>
            <tbody>
              {detectors.map((d: any) => {
                const score = d.score !== null ? (d.score * 100).toFixed(1) + '%' : 'Insufficient Data';
                const scoreNum = d.score !== null ? d.score * 100 : null;
                const scoreColor =
                  scoreNum === null
                    ? '#64748b'
                    : scoreNum >= 65
                    ? '#dc2626'
                    : scoreNum >= 45
                    ? '#d97706'
                    : '#059669';

                // Find primary evidence matching this detector
                const ev = report.evidence?.find((e: any) => e.detectorId === d.detectorId);

                return (
                  <tr key={d.detectorId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b' }}>
                      {d.detectorId}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: scoreColor }}>
                      {score}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#475569' }}>
                      {((d.reliability || 0.8) * 100).toFixed(0)}%
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          backgroundColor: d.status === 'active' ? '#dcfce7' : '#f1f5f9',
                          color: d.status === 'active' ? '#166534' : '#64748b',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {d.status || 'active'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '0.8rem' }}>
                      {ev ? ev.interpretation : 'Nominal metrics within baseline.'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Section 3: Full Document Text with Color-Coded Sentence Highlighting */}
        <div style={{ marginBottom: '28px', pageBreakBefore: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>
              3. Color-Coded Annotated Text
            </h3>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '2px' }} />
                High AI (≥65%)
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '2px' }} />
                Moderate AI (45-64%)
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '2px' }} />
                Natural Human (&lt;45%)
              </span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '20px',
              fontSize: '0.95rem',
              lineHeight: '1.8',
              maxHeight: '400px',
              overflowY: 'auto',
            }}
          >
            {sentences.map((sent: any, idx: number) => {
              const score = sent.analysis?.aiLikelihood ?? 0.3;
              const hasTells = sent.analysis?.tells && sent.analysis.tells.length > 0;

              let bg = '#ecfdf5';
              let border = '#a7f3d0';
              let textCol = '#065f46';

              if (score >= 0.65 || hasTells) {
                bg = '#fee2e2';
                border = '#fca5a5';
                textCol = '#991b1b';
              } else if (score >= 0.45) {
                bg = '#fef3c7';
                border = '#fcd34d';
                textCol = '#92400e';
              }

              return (
                <span
                  key={idx}
                  style={{
                    backgroundColor: bg,
                    borderBottom: `2px solid ${border}`,
                    color: textCol,
                    padding: '2px 4px',
                    margin: '0 2px',
                    borderRadius: '3px',
                    display: 'inline',
                  }}
                  title={`Sentence ${idx + 1}: AI Likelihood ${(score * 100).toFixed(0)}%`}
                >
                  <sup style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, marginRight: '2px' }}>
                    [{idx + 1}]
                  </sup>
                  {sent.text}{' '}
                </span>
              );
            })}
          </div>
        </div>

        {/* Section 4: Flagged Sentences Breakdown & Rephrasing Advice */}
        {flaggedSentences.length > 0 && (
          <div style={{ marginBottom: '28px', pageBreakBefore: 'auto' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
              4. Flagged Sentences & Journal De-Robotizing Recommendations ({flaggedSentences.length} Found)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {flaggedSentences.map((sent: any) => {
                const tell = sent.analysis.tells[0];
                const suggestion = sent.analysis.rephrasingSuggestions?.[0];

                return (
                  <div
                    key={sent.id || sent.originalIndex}
                    style={{
                      borderLeft: '4px solid #ef4444',
                      backgroundColor: '#fef2f2',
                      padding: '12px 16px',
                      borderRadius: '0 6px 6px 0',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#991b1b' }}>
                        Sentence [{sent.originalIndex}] — AI Score: {((sent.analysis.aiLikelihood || 0.7) * 100).toFixed(0)}%
                      </span>
                      {tell && (
                        <span
                          style={{
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            fontSize: '0.75rem',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 600,
                          }}
                        >
                          {tell.explanation?.split(':')[0] || 'AI Cliché'}
                        </span>
                      )}
                    </div>

                    <div style={{ fontStyle: 'italic', fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px' }}>
                      "{sent.text}"
                    </div>

                    {tell && (
                      <div style={{ fontSize: '0.82rem', color: '#7f1d1d', marginBottom: '4px' }}>
                        ⚠️ <strong>Issue Detected:</strong> {tell.explanation}
                      </div>
                    )}

                    {suggestion && (
                      <div style={{ fontSize: '0.82rem', color: '#047857', backgroundColor: '#ecfdf5', padding: '6px 10px', borderRadius: '4px', marginTop: '6px' }}>
                        💡 <strong>Journal Recommendation:</strong> {suggestion.suggestion}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Certificate Academic Footer */}
        <div
          style={{
            borderTop: '2px solid #e2e8f0',
            paddingTop: '16px',
            marginTop: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            color: '#64748b',
          }}
        >
          <div>
            <strong>AI Writing Forensic Analyzer v3.0.0</strong> | Verified for Peer-Reviewed Scientific Manuscripts
          </div>
          <div>
            Generated on {new Date().toISOString().slice(0, 10)} | Page 1 of 1
          </div>
        </div>
      </div>
    </div>
  );
}
