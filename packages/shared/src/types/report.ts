export const REPORT_SCHEMA_VERSION = '4.0.0';

export type SourceType = 'text' | 'txt' | 'docx' | 'pdf';
export type ClassificationLabel =
  | 'human_likely'
  | 'ai_likely'
  | 'ai_edited_likely'
  | 'mixed'
  | 'inconclusive';

export type ClassificationBasis =
  | 'ensemble'
  | 'calibrated_logistic'
  | 'forensic_ensemble'
  | 'discontinuity_mixed'
  | 'ai_reasoning_synthesis'
  | 'insufficient_evidence'
  | 'unsupported_language'
  | 'low_extraction_quality'
  | 'detector_disagreement'
  | 'feature_unavailable';

export type CalibrationStatus =
  | 'not_calibrated'
  | 'unvalidated'
  | 'calibrated'
  | 'externally_validated';

export type DetectorStatus = 'active' | 'insufficient_data' | 'unsupported' | 'error';
export type EvidenceDirection = 'ai_associated' | 'human_associated' | 'neutral';
export type LimitationSeverity = 'info' | 'warning' | 'critical';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type ReportStatus = 'complete' | 'partial' | 'inconclusive' | 'failed';
export type ReliabilityLevel = 'very_low' | 'low' | 'moderate' | 'good' | 'high';
export type ActionRecommendation = 'accept' | 'review' | 'abstain';

export interface AnalysisInput {
  text: string;
  languageHint?: string | undefined;
  options?: AnalysisOptions | undefined;
}

export interface AnalysisOptions {
  includeSegmentAnalysis?: boolean | undefined;
  maxSegments?: number | undefined;
  includeAiReasoning?: boolean | undefined;
  reasoningProvider?: 'gemini' | 'openai' | 'anthropic' | 'local' | 'mock' | undefined;
  privacyLevel?: 'strict_local' | 'metadata_only' | 'full_text' | undefined;
  calibrationProfile?: any | undefined;
  customThresholds?: {
    aiLikely?: number;
    aiEditedLikely?: number;
    humanLikely?: number;
  } | undefined;
}

export interface InputInfo {
  sourceType: SourceType;
  characterCount: number;
  wordCount: number;
  providedLanguageHint: string | null;
}

export interface DocumentInfo {
  paragraphCount: number;
  sentenceCount: number;
  wordCount: number;
  codeRegionCount: number;
  referenceRegionCount: number;
  urlCount: number;
  extractionQuality: number;
  normalizationApplied: string[];
  documentWarnings: string[];
}

export interface LanguageResult {
  primary: string;
  confidence: number;
  method: string;
  detectedLanguages: string[];
  mixedLanguage: boolean;
}

export interface ReadabilityInfo {
  available: boolean;
  score: number | null;
  method: string | null;
  fleschKincaid?: number | null;
  gunningFog?: number | null;
  ari?: number | null;
}

export interface TextStatistics {
  characters: number;
  words: number;
  sentences: number;
  paragraphs: number;
  averageSentenceLength: number;
  sentenceLengthVariance: number;
  sentenceLengthStdDev: number;
  averageWordLength: number;
  typeTokenRatio: number;
  hapaxRatio: number | null;
  punctuationRate: number;
  repetitionRate: number;
  readability: ReadabilityInfo;
}

export interface FeatureValue {
  value: number;
  available: boolean;
  reliability: number;
}

export interface FeatureSet {
  lexical: Record<string, FeatureValue>;
  syntactic: Record<string, FeatureValue>;
  structural: Record<string, FeatureValue>;
  punctuation: Record<string, FeatureValue>;
  repetition: Record<string, FeatureValue>;
  stylometric: Record<string, FeatureValue>;
  informationTheoretic?: Record<string, FeatureValue>;
  distributional?: Record<string, FeatureValue>;
  burstiness?: Record<string, FeatureValue>;
  readabilityFeatures?: Record<string, FeatureValue>;
}

export interface MixedAuthorshipDetails {
  isMixed: boolean;
  aiFraction: number;
  confidence: number;
  discontinuityScore: number;
  suspectedSegments: number[];
}

export interface ClassificationResult {
  label: ClassificationLabel;
  aiLikelihood: number | null; // legacy alias for UI compatibility
  humanLikelihood: number | null;
  editedAILikelihood: number | null;
  basis: ClassificationBasis;
  forensicSignal: number; // 0..1 raw deterministic evidence score
  calibratedProbability: number | null; // null unless formal calibration is applied
  calibrationStatus: CalibrationStatus;
  mixedAuthorship: MixedAuthorshipDetails;
}

export interface ConfidenceFactor {
  id: string;
  impact: number;
  description: string;
}

export interface ConfidenceResult {
  score: number;
  level: ConfidenceLevel;
  factors: ConfidenceFactor[];
  interval: { lower: number; upper: number };
}

export interface UncertaintyFactor {
  id: string;
  weight: number;
  description: string;
}

export interface UncertaintyModel {
  score: number; // 0..1 (higher means greater epistemic uncertainty)
  level: 'low' | 'moderate' | 'high' | 'critical';
  factors: UncertaintyFactor[];
  recommendation: ActionRecommendation;
}

export interface DetectorResult {
  detectorId: string;
  version: string;
  status: DetectorStatus;
  score: number | null;
  confidence: number;
  reliability: number;
  evidenceIds: string[];
  limitations: string[];
}

export interface EvidenceItem {
  id: string;
  detectorId: string;
  feature: string;
  observedValue: number;
  unit: string;
  direction: EvidenceDirection;
  interpretation: string;
  reliability: number;
  regionIds: string[];
  limitations: string[];
}

export interface EvidencePools {
  aiEvidence: EvidenceItem[];
  humanEvidence: EvidenceItem[];
  neutralEvidence: EvidenceItem[];
}

export interface DiscontinuityLocation {
  segmentIndex: number;
  offset: number;
  magnitude: number;
  featureShifts: string[];
}

export interface StyleDiscontinuityResult {
  discontinuityScore: number; // 0..1
  detected: boolean;
  locations: DiscontinuityLocation[];
  evidence: EvidenceItem[];
}

export interface AIReasoningResult {
  reasoningVersion: string;
  assessment: 'supports_ai' | 'supports_human' | 'mixed' | 'inconclusive';
  strength: number; // 0..1
  supportingEvidence: string[];
  counterEvidence: string[];
  alternativeExplanations: string[];
  detectorConflicts: string[];
  segmentFindings: string[];
  adversarialFindings: string[];
  recommendation: ActionRecommendation;
  reasoningConfidence: number; // 0..1
  provider: string;
  model: string;
  latencyMs: number;
  error?: string | null;
}

export interface TextRegion {
  id: string;
  type: 'sentence' | 'paragraph' | 'code' | 'reference' | 'url';
  startOffset: number;
  endOffset: number;
  text: string;
  textHash: string;
}

export interface SegmentAnalysis {
  aiLikelihood: number | null;
  confidence: number;
  evidenceIds: string[];
  tells?: any[];
  rephrasingSuggestions?: any[];
}

export interface AnalyzedRegion extends TextRegion {
  analysis: SegmentAnalysis | null;
}

export interface Segments {
  paragraphs: AnalyzedRegion[];
  sentences: AnalyzedRegion[];
  specialRegions: TextRegion[];
}

export interface LimitationItem {
  code: string;
  severity: LimitationSeverity;
  message: string;
  affectedRegions: string[];
}

export interface QualityInfo {
  overallReliability: number;
  textLengthReliability: number;
  languageReliability: number;
  extractionReliability: number;
  featureCoverage: number;
  detectorAgreement: number;
  warnings: string[];
}

export interface RuntimeInfo {
  node: string;
  platform: string;
  arch: string;
}

export interface ReportMetadata {
  applicationVersion: string;
  coreVersion: string;
  detectorVersions: Record<string, string>;
  configurationVersion: string;
  runtime: RuntimeInfo;
  reasoningVersion?: string;
  calibrationProfileVersion?: string;
}

export interface ReportError {
  code: string;
  message: string;
  retryable: boolean;
}

export interface AnalysisReport {
  schemaVersion: string;
  reportId: string;
  createdAt: string;
  status: ReportStatus;
  input: InputInfo;
  document: DocumentInfo;
  language: LanguageResult;
  statistics: TextStatistics;
  features: FeatureSet;
  classification: ClassificationResult;
  confidence: ConfidenceResult;
  uncertainty: UncertaintyModel;
  detectors: DetectorResult[];
  evidence: EvidenceItem[];
  evidencePools: EvidencePools;
  styleDiscontinuity: StyleDiscontinuityResult;
  segments: Segments;
  limitations: LimitationItem[];
  quality: QualityInfo;
  metadata: ReportMetadata;
  reasoning?: AIReasoningResult | null;
  error?: ReportError | undefined;
}
