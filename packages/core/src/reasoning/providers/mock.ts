import type { ReasoningProvider } from './base.js';
import type { ReasoningRequest, ReasoningResponse, ReasoningAssessment } from '../types.js';

export class MockReasoningProvider implements ReasoningProvider {
  readonly id = 'mock';
  readonly name = 'Mock Deterministic Reasoner';

  private forcedResponse?: Partial<ReasoningResponse>;

  constructor(forcedResponse?: Partial<ReasoningResponse>) {
    this.forcedResponse = forcedResponse;
  }

  async analyzeEvidence(request: ReasoningRequest): Promise<ReasoningResponse> {
    const startTime = Date.now();

    if (this.forcedResponse) {
      return {
        result: {
          reasoningVersion: '1.0.0',
          assessment: 'inconclusive',
          strength: 0.5,
          supportingEvidence: [],
          counterEvidence: [],
          alternativeExplanations: [],
          detectorConflicts: [],
          segmentFindings: [],
          adversarialFindings: [],
          recommendation: 'review',
          reasoningConfidence: 0.5,
          provider: this.id,
          model: 'mock-model-v1',
          latencyMs: Date.now() - startTime,
          ...this.forcedResponse.result,
        },
        rawResponse: this.forcedResponse.rawResponse || '{"mock": true}',
      };
    }

    const ev = request.evidence;
    const scores = Object.values(ev.detectors)
      .map((d) => d.score)
      .filter((s): s is number => s !== null);

    const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0.5;
    const aiIndicators = ev.aiEvidenceSummary.length;
    const humanIndicators = ev.humanEvidenceSummary.length;

    let assessment: ReasoningAssessment = 'inconclusive';
    let recommendation: 'accept' | 'review' | 'abstain' = 'review';
    let strength = 0.5;

    if (ev.styleDiscontinuity.detected) {
      assessment = 'mixed';
      recommendation = 'review';
      strength = 0.72;
    } else if (avgScore >= 0.70 && aiIndicators >= 2) {
      assessment = 'supports_ai';
      recommendation = 'accept';
      strength = avgScore;
    } else if (avgScore <= 0.30 && humanIndicators >= 1) {
      assessment = 'supports_human';
      recommendation = 'accept';
      strength = 1 - avgScore;
    } else if (ev.uncertainty.score > 0.65) {
      assessment = 'inconclusive';
      recommendation = 'abstain';
      strength = 0.4;
    }

    const latencyMs = Date.now() - startTime;

    return {
      result: {
        reasoningVersion: '1.0.0',
        assessment,
        strength: Number(strength.toFixed(3)),
        supportingEvidence: ev.aiEvidenceSummary.slice(0, 5),
        counterEvidence: ev.humanEvidenceSummary.slice(0, 5),
        alternativeExplanations: [
          'Formal scientific or academic conventions naturally exhibit lower sentence length variability.',
          'Technical terminology density may inflate predictability metrics without indicating LLM generation.',
        ],
        detectorConflicts:
          scores.length >= 2 && Math.max(...scores) - Math.min(...scores) > 0.4
            ? ['Rhetorical detectors and structural regularity detectors disagree on this text segment.']
            : [],
        segmentFindings: ev.styleDiscontinuity.detected
          ? [`Style discontinuity identified across segment boundaries (magnitude: ${ev.styleDiscontinuity.score.toFixed(2)}).`]
          : ['Linguistic profile appears relatively homogeneous across analyzed segments.'],
        adversarialFindings: [
          'Adversarial check: Highly disciplined academic writing with strict formatting can closely resemble clean AI output.',
        ],
        recommendation,
        reasoningConfidence: Number(Math.max(0.3, 1 - ev.uncertainty.score).toFixed(3)),
        provider: this.id,
        model: 'deterministic-mock-v1',
        latencyMs,
      },
      rawResponse: JSON.stringify({ assessment, strength }),
    };
  }
}
