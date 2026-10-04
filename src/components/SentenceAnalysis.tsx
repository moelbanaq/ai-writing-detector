import React, { useState } from 'react';
import { getRephraseSuggestions, verifyWithWeb } from '../services/api';

interface SentenceAnalysisProps {
  sentences: any[];
  overallAiLikelihood?: number | null;
  overallConfidence?: number;
}

export function SentenceAnalysis({
  sentences = [],
  overallAiLikelihood,
  overallConfidence = 0.5,
}: SentenceAnalysisProps) {
  const [selectedSentence, setSelectedSentence] = useState<any | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'red' | 'yellow' | 'green'>('all');
  const [loadingRephrase, setLoadingRephrase] = useState(false);
  const [rephraseData, setRephraseData] = useState<any | null>(null);
  const [loadingWeb, setLoadingWeb] = useState(false);
  const [webData, setWebData] = useState<any | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (!sentences || sentences.length === 0) return null;

  const getSentenceLikelihood = (s: any): number => {
    if (
      s.analysis &&
      s.analysis.aiLikelihood !== null &&
      Number.isFinite(s.analysis.aiLikelihood)
    ) {
      return s.analysis.aiLikelihood;
    }
    if (s.aiLikelihood !== undefined && s.aiLikelihood !== null) {
      return s.aiLikelihood;
    }
    if (overallAiLikelihood !== undefined && overallAiLikelihood !== null) {
      return overallAiLikelihood;
    }
    return 0.45;
  };

  const getSentenceConfidence = (s: any): number => {
    if (s.analysis && s.analysis.confidence !== undefined) {
      return s.analysis.confidence;
    }
    return overallConfidence;
  };

  const getSentenceStatus = (score: number): 'red' | 'yellow' | 'green' => {
    if (score >= 0.58) return 'red';
    if (score < 0.38) return 'green';
    return 'yellow';
  };

  const getBackgroundColor = (score: number, isSelected: boolean) => {
    const status = getSentenceStatus(score);
    if (status === 'red') return isSelected ? '#ffcdd2' : 'rgba(244, 67, 54, 0.22)';
    if (status === 'green') return isSelected ? '#c8e6c9' : 'rgba(76, 175, 80, 0.20)';
    return isSelected ? '#fff9c4' : 'rgba(255, 193, 7, 0.25)';
  };

  // Count sentences
  const redCount = sentences.filter(
    (s) => getSentenceStatus(getSentenceLikelihood(s)) === 'red',
  ).length;
  const yellowCount = sentences.filter(
    (s) => getSentenceStatus(getSentenceLikelihood(s)) === 'yellow',
  ).length;
  const greenCount = sentences.filter(
    (s) => getSentenceStatus(getSentenceLikelihood(s)) === 'green',
  ).length;

  const filteredSentences = sentences.filter((s) => {
    if (filterMode === 'all') return true;
    return getSentenceStatus(getSentenceLikelihood(s)) === filterMode;
  });

  const handleSelectSentence = (sentence: any) => {
    setSelectedSentence(sentence);
    setRephraseData(null);
    setWebData(null);
    setCopiedIdx(null);
  };

  const handleFetchRephrase = async () => {
    if (!selectedSentence) return;
    setLoadingRephrase(true);
    try {
      const tells = selectedSentence.analysis?.tells || [];
      const res = await getRephraseSuggestions(selectedSentence.text, tells);
      if (res.success) {
        setRephraseData(res);
      }
    } finally {
      setLoadingRephrase(false);
    }
  };

  const handleFetchWebVerification = async () => {
    if (!selectedSentence) return;
    setLoadingWeb(true);
    try {
      const res = await verifyWithWeb(selectedSentence.text);
      if (res.success) {
        setWebData(res);
      }
    } finally {
      setLoadingWeb(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2500);
  };

  return (
    <div className="card sentence-analysis">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '15px',
        }}
      >
        <h3 style={{ margin: 0 }}>Sentence-Level Forensic Inspection</h3>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterMode('all')}
            style={{
              padding: '5px 10px',
              borderRadius: '20px',
              border: filterMode === 'all' ? '2px solid #1a1a2e' : '1px solid #ccc',
              backgroundColor: filterMode === 'all' ? '#1a1a2e' : '#fff',
              color: filterMode === 'all' ? '#fff' : '#333',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 'bold',
            }}
          >
            All ({sentences.length})
          </button>
          <button
            onClick={() => setFilterMode('red')}
            style={{
              padding: '5px 10px',
              borderRadius: '20px',
              border: filterMode === 'red' ? '2px solid #d32f2f' : '1px solid #ffcdd2',
              backgroundColor: filterMode === 'red' ? '#d32f2f' : '#ffebee',
              color: filterMode === 'red' ? '#fff' : '#c62828',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 'bold',
            }}
          >
            🔴 Problematic AI Tells ({redCount})
          </button>
          <button
            onClick={() => setFilterMode('yellow')}
            style={{
              padding: '5px 10px',
              borderRadius: '20px',
              border: filterMode === 'yellow' ? '2px solid #f57f17' : '1px solid #fff9c4',
              backgroundColor: filterMode === 'yellow' ? '#f57f17' : '#fffde7',
              color: filterMode === 'yellow' ? '#fff' : '#f57f17',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 'bold',
            }}
          >
            🟡 Mixed / Moderate ({yellowCount})
          </button>
          <button
            onClick={() => setFilterMode('green')}
            style={{
              padding: '5px 10px',
              borderRadius: '20px',
              border: filterMode === 'green' ? '2px solid #2e7d32' : '1px solid #c8e6c9',
              backgroundColor: filterMode === 'green' ? '#2e7d32' : '#e8f5e9',
              color: filterMode === 'green' ? '#fff' : '#2e7d32',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 'bold',
            }}
          >
            🟢 Human-like ({greenCount})
          </button>
        </div>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '15px' }}>
        Click on any highlighted sentence below to view its specific AI diagnostic markers, academic
        rephrasing suggestions, and literature comparison.
      </p>

      {/* Sentence Passage Highlighting */}
      <div
        style={{
          padding: '16px',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          lineHeight: '2.0',
          backgroundColor: '#fafafa',
          maxHeight: '400px',
          overflowY: 'auto',
          marginBottom: '20px',
        }}
      >
        {filteredSentences.map((sentence, idx) => {
          const score = getSentenceLikelihood(sentence);
          const isSelected =
            selectedSentence &&
            (selectedSentence.id === sentence.id || selectedSentence === sentence);
          const status = getSentenceStatus(score);
          const borderColor =
            status === 'red' ? '#e57373' : status === 'green' ? '#81c784' : '#ffd54f';

          return (
            <span
              key={sentence.id || idx}
              style={{
                backgroundColor: getBackgroundColor(score, isSelected),
                cursor: 'pointer',
                padding: '3px 6px',
                borderRadius: '4px',
                margin: '2px 3px',
                display: 'inline-block',
                border: isSelected ? '2px solid #1a1a2e' : `1px solid ${borderColor}`,
                boxShadow: isSelected ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
                fontWeight: isSelected ? '600' : 'normal',
                transition: 'all 0.15s ease',
              }}
              onClick={() => handleSelectSentence(sentence)}
              title={`Likelihood: ${Math.round(score * 100)}% | Click to diagnose and rephrase`}
            >
              {sentence.text}
            </span>
          );
        })}
      </div>

      {/* Detailed Diagnostic & Rephrase Card */}
      {selectedSentence && (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#ffffff',
            border: '2px solid #1a1a2e',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '15px',
            }}
          >
            <div>
              <span
                style={{
                  display: 'inline-block',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  marginBottom: '6px',
                  backgroundColor:
                    getSentenceStatus(getSentenceLikelihood(selectedSentence)) === 'red'
                      ? '#ffebee'
                      : getSentenceStatus(getSentenceLikelihood(selectedSentence)) === 'green'
                        ? '#e8f5e9'
                        : '#fffde7',
                  color:
                    getSentenceStatus(getSentenceLikelihood(selectedSentence)) === 'red'
                      ? '#c62828'
                      : getSentenceStatus(getSentenceLikelihood(selectedSentence)) === 'green'
                        ? '#2e7d32'
                        : '#f57f17',
                }}
              >
                {getSentenceStatus(getSentenceLikelihood(selectedSentence)) === 'red'
                  ? '🚨 High AI Signal Detected'
                  : getSentenceStatus(getSentenceLikelihood(selectedSentence)) === 'green'
                    ? '✅ Natural Human Structure'
                    : '⚖️ Moderate / Inconclusive'}
              </span>
              <h4 style={{ margin: '5px 0 0 0', fontSize: '1.1rem' }}>
                Selected Sentence Diagnostic
              </h4>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#1a1a2e' }}>
                {Math.round(getSentenceLikelihood(selectedSentence) * 100)}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                AI Signal Likelihood
              </div>
            </div>
          </div>

          <blockquote
            style={{
              margin: '0 0 15px 0',
              padding: '12px 16px',
              backgroundColor: '#f5f5f5',
              borderLeft: '4px solid #1a1a2e',
              fontStyle: 'italic',
              fontSize: '0.95rem',
              lineHeight: '1.6',
            }}
          >
            "{selectedSentence.text}"
          </blockquote>

          {/* Tells / Reasons Flagged */}
          {selectedSentence.analysis?.tells && selectedSentence.analysis.tells.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <strong
                style={{
                  fontSize: '0.9rem',
                  color: '#c62828',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                ⚠️ Specific Diagnostic Tells Found:
              </strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedSentence.analysis.tells.map((tell: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#fff8e1',
                      borderLeft: '3px solid #ffb300',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                    }}
                  >
                    <strong>{tell.matchedText}:</strong> {tell.explanation}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons: Rephrase & Online Literature */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
            <button
              onClick={handleFetchRephrase}
              disabled={loadingRephrase}
              style={{
                padding: '8px 16px',
                backgroundColor: '#1a1a2e',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {loadingRephrase ? 'Generating Suggestions...' : '✨ Generate Humanized Rephrasing'}
            </button>

            <button
              onClick={handleFetchWebVerification}
              disabled={loadingWeb}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f0f0f0',
                color: '#333',
                border: '1px solid #ccc',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {loadingWeb ? 'Searching Literature...' : '🌐 Check Academic Web / Literature'}
            </button>
          </div>

          {/* Rephrasing Suggestions Panel */}
          {rephraseData && rephraseData.suggestions && (
            <div
              style={{
                marginTop: '15px',
                padding: '15px',
                backgroundColor: '#e8f5e9',
                borderRadius: '8px',
                border: '1px solid #a5d6a7',
              }}
            >
              <h5 style={{ margin: '0 0 10px 0', color: '#1b5e20', fontSize: '0.95rem' }}>
                💡 Humanized Academic Rephrasing Options:
              </h5>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {rephraseData.suggestions.map((sug: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#ffffff',
                      borderRadius: '6px',
                      border: '1px solid #c8e6c9',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '5px',
                      }}
                    >
                      <strong style={{ fontSize: '0.85rem', color: '#2e7d32' }}>{sug.title}</strong>
                      <button
                        onClick={() => handleCopy(sug.text, idx)}
                        style={{
                          padding: '3px 8px',
                          fontSize: '0.75rem',
                          backgroundColor: copiedIdx === idx ? '#2e7d32' : '#f1f8e9',
                          color: copiedIdx === idx ? '#fff' : '#2e7d32',
                          border: '1px solid #81c784',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        {copiedIdx === idx ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <p
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: '0.9rem',
                        color: '#1a1a2e',
                        fontWeight: '500',
                      }}
                    >
                      {sug.text}
                    </p>
                    <small style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>
                      Rationale: {sug.rationale}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Online Literature Cross-Check Panel */}
          {webData && (
            <div
              style={{
                marginTop: '15px',
                padding: '15px',
                backgroundColor: '#e3f2fd',
                borderRadius: '8px',
                border: '1px solid #90caf9',
              }}
            >
              <h5 style={{ margin: '0 0 10px 0', color: '#0d47a1', fontSize: '0.95rem' }}>
                🌐 Crossref & Academic Literature Benchmark ({webData.source}):
              </h5>
              <p style={{ fontSize: '0.8rem', color: '#555', margin: '0 0 10px 0' }}>
                Verified against published peer-reviewed journals to compare conventional
                terminology:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {webData.literatureMatches?.map((match: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#ffffff',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      border: '1px solid #bbdefb',
                    }}
                  >
                    <strong>{match.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>
                      {match.journal} ({match.year})
                      {match.doi && (
                        <a
                          href={match.doi}
                          target="_blank"
                          rel="noreferrer"
                          style={{ marginLeft: '8px', color: '#1976d2' }}
                        >
                          View DOI
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
