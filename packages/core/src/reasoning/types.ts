import type {
  AIReasoningResult,
  ActionRecommendation,
  DetectorResult,
  EvidenceItem,
  TextStatistics,
  LanguageResult,
  UncertaintyModel,
  StyleDiscontinuityResult,
} from '@ai-detector/shared';

export type ReasoningAssessment = 'supports_ai' | 'supports_human' | 'mixed' | 'inconclusive';

export interface ReasoningEvidencePayload {
  reportId?: string;
  wordCount: number;
  sentenceCount: number;
  language: LanguageResult;
  statistics: TextStatistics;
  detectors: Record<string, { score: number | null; reliability: number; status: string }>;
  aiEvidenceSummary: string[];
  humanEvidenceSummary: string[];
  styleDiscontinuity: { detected: boolean; score: number; locationsCount: number };
  uncertainty: UncertaintyModel;
  sampleSentences: { index: number; text: string; aiLikelihood?: number | null }[];
}

export interface ReasoningRequest {
  evidence: ReasoningEvidencePayload;
  rawText?: string | undefined; // Omitted if privacyLevel is 'metadata_only'
  privacyLevel: 'strict_local' | 'metadata_only' | 'full_text';
  timeoutMs?: number;
}

export interface ReasoningResponse {
  result: AIReasoningResult;
  rawResponse?: string;
  usage?: { promptTokens?: number; completionTokens?: number };
}

export interface ReasoningProvider {
  readonly id: string;
  readonly name: string;
  analyzeEvidence(request: ReasoningRequest): Promise<ReasoningResponse>;
}
