import React from 'react';

interface ExpertModePanelProps {
  report: any;
}

export function ExpertModePanel({ report }: ExpertModePanelProps) {
  if (!report) return null;

  const classification = report.classification || {};
  const uncertainty = report.uncertainty || {};
  const evidencePools = report.evidencePools || { aiEvidence: [], humanEvidence: [], neutralEvidence: [] };
  const discontinuity = report.styleDiscontinuity || {};
  const reasoning = report.reasoning || null;

  const isCalibrated = classification.calibrationStatus === 'calibrated' || classification.calibrationStatus === 'externally_validated';

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '24px',
        marginTop: '24px',
        color: '#f8fafc',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '14px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#38bdf8' }}>
            SCIENTIFIC AUDIT & FORENSIC METRICS
          </span>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '1.4rem', fontWeight: 700 }}>
            🔬 Expert Diagnostic View (v4.0)
          </h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              backgroundColor: isCalibrated ? '#065f46' : '#78350f',
              color: isCalibrated ? '#34d399' : '#fcd34d',
              border: isCalibrated ? '1px solid #059669' : '1px solid #b45309',
            }}
          >
            {isCalibrated ? '✓ CALIBRATED PROBABILITY' : '⚠ UNCALIBRATED FORENSIC SIGNAL'}
          </span>
        </div>
      </div>

      {/* Top Level Metric Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Forensic Evidence Signal</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: '#f8fafc' }}>
            {(classification.forensicSignal * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Raw deterministic measurement</div>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #a855f7' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Epistemic Uncertainty</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: uncertainty.level === 'high' || uncertainty.level === 'critical' ? '#f87171' : '#34d399' }}>
            {(uncertainty.score * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
            Level: {uncertainty.level?.toUpperCase()} | Rec: {uncertainty.recommendation?.toUpperCase()}
          </div>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Style Discontinuity</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: discontinuity.detected ? '#fbbf24' : '#94a3b8' }}>
            {(discontinuity.discontinuityScore * 100).toFixed(0)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
            {discontinuity.detected ? '⚠ Boundary Shifts Detected' : '✓ Homogeneous Styling'}
          </div>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Classification Basis</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '8px', color: '#f8fafc' }}>
            {classification.basis ? classification.basis.replace(/_/g, ' ').toUpperCase() : 'ENSEMBLE'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
            Calib: {classification.calibrationStatus || 'none'}
          </div>
        </div>
      </div>

      {/* Uncertainty Factors */}
      {Array.isArray(uncertainty.factors) && uncertainty.factors.length > 0 && (
        <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠ Epistemic Uncertainty & Limiting Constraints</span>
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
            {uncertainty.factors.map((f: any, i: number) => (
              <li key={i}>
                <strong>{f.id}:</strong> {f.description} (weight penalty: {(f.weight * 100).toFixed(0)}%)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dual Evidence Pools Side-by-Side */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* AI Evidence Pool */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '16px', border: '1px solid #dc2626' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fca5a5' }}>
              🤖 AI-Associated Evidence Pool ({evidencePools.aiEvidence.length})
            </h4>
          </div>
          {evidencePools.aiEvidence.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>No AI signals observed.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {evidencePools.aiEvidence.map((e: any, idx: number) => (
                <div key={idx} style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '6px', fontSize: '0.82rem', borderLeft: '3px solid #ef4444' }}>
                  <div style={{ fontWeight: 600, color: '#fca5a5' }}>{e.feature} (rel: {(e.reliability * 100).toFixed(0)}%)</div>
                  <div style={{ color: '#cbd5e1', marginTop: '3px' }}>{e.interpretation}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Human Evidence Pool */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '16px', border: '1px solid #16a34a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#86efac' }}>
              ✍️ Human-Associated Evidence Pool ({evidencePools.humanEvidence.length})
            </h4>
          </div>
          {evidencePools.humanEvidence.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>No human irregularity markers recorded.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {evidencePools.humanEvidence.map((e: any, idx: number) => (
                <div key={idx} style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '6px', fontSize: '0.82rem', borderLeft: '3px solid #22c55e' }}>
                  <div style={{ fontWeight: 600, color: '#86efac' }}>{e.feature} (rel: {(e.reliability * 100).toFixed(0)}%)</div>
                  <div style={{ color: '#cbd5e1', marginTop: '3px' }}>{e.interpretation}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Forensic Evidence Reasoning Trace */}
      {reasoning && (
        <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '20px', border: '1px solid #38bdf8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '1px' }}>AI REASONING LAYER</span>
              <h4 style={{ margin: '2px 0 0 0', fontSize: '1.1rem', color: '#f8fafc' }}>
                🧠 Forensic Evidence Analyst Assessment
              </h4>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ backgroundColor: '#0f172a', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                Verdict: <strong>{reasoning.assessment?.toUpperCase()}</strong>
              </span>
              <span style={{ backgroundColor: '#0f172a', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                Confidence: <strong>{((reasoning.reasoningConfidence ?? 0) * 100).toFixed(0)}%</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', fontSize: '0.85rem' }}>
            {reasoning.alternativeExplanations?.length > 0 && (
              <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontWeight: 700, color: '#fcd34d', marginBottom: '6px' }}>Alternative Human Explanations</div>
                <ul style={{ margin: 0, paddingLeft: '18px', color: '#e2e8f0', lineHeight: '1.5' }}>
                  {reasoning.alternativeExplanations.map((alt: string, i: number) => <li key={i}>{alt}</li>)}
                </ul>
              </div>
            )}

            {reasoning.adversarialFindings?.length > 0 && (
              <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontWeight: 700, color: '#f87171', marginBottom: '6px' }}>Adversarial & Genre Sanity Check</div>
                <ul style={{ margin: 0, paddingLeft: '18px', color: '#e2e8f0', lineHeight: '1.5' }}>
                  {reasoning.adversarialFindings.map((adv: string, i: number) => <li key={i}>{adv}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
