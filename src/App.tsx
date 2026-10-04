import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { InputPanel } from './components/InputPanel';
import { OverallResult } from './components/OverallResult';
import { TextStatistics } from './components/TextStatistics';
import { DetectorBreakdown } from './components/DetectorBreakdown';
import { EvidencePanel } from './components/EvidencePanel';
import { SentenceAnalysis } from './components/SentenceAnalysis';
import { LimitationsPanel } from './components/LimitationsPanel';
import { ExportControls } from './components/ExportControls';
import { ErrorState } from './components/ErrorState';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { PdfReportModal } from './components/PdfReportModal';
import { ExpertModePanel } from './components/ExpertModePanel';
import { analyzeText, analyzeFile, recordVisit } from './services/api';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message || 'Render error' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('UI Render Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '20px',
            border: '1px solid #f44336',
            borderRadius: '8px',
            background: '#ffebee',
            color: '#c62828',
            margin: '20px 0',
          }}
        >
          <h3>Display Error</h3>
          <p>{this.state.errorMessage}</p>
          <button
            onClick={() => this.setState({ hasError: false, errorMessage: '' })}
            style={{
              padding: '8px 16px',
              background: '#c62828',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Retry Display
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'analytics'>('analyzer');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractedFileText, setExtractedFileText] = useState('');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [expertMode, setExpertMode] = useState(true);

  // Record visitor session once on mount
  useEffect(() => {
    try {
      let visitorId = localStorage.getItem('ai_detector_vid');
      if (!visitorId) {
        visitorId = 'vid_' + Math.random().toString(36).substring(2, 11);
        localStorage.setItem('ai_detector_vid', visitorId);
      }
      recordVisit(visitorId);
    } catch {
      // Fallback silently if storage blocked
    }
  }, []);

  const handleAnalyzeText = async (text: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeText(text);
      if (result.success && result.report) {
        setReport(result.report);
      } else {
        setError(result.error?.message || 'Analysis failed.');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeFile = async (content: string, filename: string, mimeType: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeFile(content, filename, mimeType);
      if (result.success && result.report) {
        setReport(result.report);
        if ((result as any).extractedText) {
          setExtractedFileText((result as any).extractedText);
        }
      } else {
        setError(result.error?.message || 'Analysis failed.');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setReport(null);
    setError(null);
    setExtractedFileText('');
    setIsPdfModalOpen(false);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0 }}>AI Writing Forensic Analyzer</h1>
            <p className="subtitle" style={{ margin: '4px 0 0 0' }}>
              Scientific Journal-Grade Forensic Detection v4.0.0
            </p>
          </div>

          {/* Navigation Mode Switcher & Expert Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setExpertMode(!expertMode)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                border: expertMode ? '1px solid #38bdf8' : '1px solid #475569',
                backgroundColor: expertMode ? '#0284c7' : '#1e293b',
                color: '#ffffff',
                transition: 'all 0.2s ease',
              }}
            >
              {expertMode ? '🔬 Expert Mode: ON' : '🔬 Expert Mode: OFF'}
            </button>

            <div
              style={{
                display: 'flex',
                backgroundColor: '#0f172a',
                padding: '4px',
                borderRadius: '8px',
                border: '1px solid #334155',
              }}
            >
              <button
                onClick={() => setActiveTab('analyzer')}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  backgroundColor: activeTab === 'analyzer' ? '#2563eb' : 'transparent',
                  color: activeTab === 'analyzer' ? '#ffffff' : '#94a3b8',
                  transition: 'all 0.2s ease',
                }}
              >
                🔍 Text Analyzer
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  backgroundColor: activeTab === 'analytics' ? '#2563eb' : 'transparent',
                  color: activeTab === 'analytics' ? '#ffffff' : '#94a3b8',
                  transition: 'all 0.2s ease',
                }}
              >
                📊 Usage Analytics
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="app-content">
        {activeTab === 'analytics' ? (
          <AnalyticsDashboard />
        ) : (
          <>
            <div className="disclaimer">
              <strong>Disclaimer:</strong> AI detection is probabilistic and evaluates statistical predictability,
              information entropy, and rhetorical formulaic patterns. Results are forensic indicators for editorial review.
            </div>

            <InputPanel
              onAnalyzeText={handleAnalyzeText}
              onAnalyzeFile={handleAnalyzeFile}
              onClear={handleClear}
              isLoading={loading}
              initialText={extractedFileText}
            />

            {error && <ErrorState message={error} onRetry={() => setError(null)} />}

            {report && !loading && (
              <ErrorBoundary>
                <div className="results-container">
                  <ExportControls
                    report={report}
                    onOpenPdfReport={() => setIsPdfModalOpen(true)}
                  />
                  {expertMode && <ExpertModePanel report={report} />}
                  <OverallResult
                    score={report.classification?.aiLikelihood ?? null}
                    confidence={report.confidence?.score ?? 0}
                    classification={report.classification?.label ?? 'inconclusive'}
                  />

                  <div className="grid-2-col">
                    <TextStatistics stats={report.statistics} language={report.language} />
                    <LimitationsPanel limitations={report.limitations} />
                  </div>

                  <DetectorBreakdown
                    detectors={report.detectors ?? []}
                    allEvidence={report.evidence ?? []}
                  />
                  <SentenceAnalysis
                    sentences={report.segments?.sentences ?? []}
                    overallAiLikelihood={report.classification?.aiLikelihood}
                    overallConfidence={report.confidence?.score}
                  />
                  <EvidencePanel evidence={report.evidence ?? []} />
                </div>

                {/* Color-Coded Academic PDF Forensic Report Modal */}
                <PdfReportModal
                  report={report}
                  isOpen={isPdfModalOpen}
                  onClose={() => setIsPdfModalOpen(false)}
                />
              </ErrorBoundary>
            )}
          </>
        )}
      </main>
    </div>
  );
}
