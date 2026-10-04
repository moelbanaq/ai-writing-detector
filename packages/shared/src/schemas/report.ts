import { z } from 'zod';
import { normalizedScore } from './analysis.js';
import type { AnalysisReport } from '../types/report.js';

export const SourceTypeSchema = z.enum(['text', 'txt', 'docx', 'pdf']);
export const ClassificationLabelSchema = z.enum([
  'human_likely',
  'ai_likely',
  'ai_edited_likely',
  'mixed',
  'inconclusive',
]);

export const ClassificationBasisSchema = z.enum([
  'ensemble',
  'calibrated_logistic',
  'forensic_ensemble',
  'discontinuity_mixed',
  'ai_reasoning_synthesis',
  'insufficient_evidence',
  'unsupported_language',
  'low_extraction_quality',
  'detector_disagreement',
  'feature_unavailable',
]);

export const CalibrationStatusSchema = z.enum([
  'not_calibrated',
  'unvalidated',
  'calibrated',
  'externally_validated',
]);

export const DetectorStatusSchema = z.enum(['active', 'insufficient_data', 'unsupported', 'error']);
export const EvidenceDirectionSchema = z.enum(['ai_associated', 'human_associated', 'neutral']);
export const LimitationSeveritySchema = z.enum(['info', 'warning', 'critical']);
export const ConfidenceLevelSchema = z.enum(['low', 'medium', 'high']);
export const ReportStatusSchema = z.enum(['complete', 'partial', 'inconclusive', 'failed']);
export const ReliabilityLevelSchema = z.enum(['very_low', 'low', 'moderate', 'good', 'high']);
export const ActionRecommendationSchema = z.enum(['accept', 'review', 'abstain']);

export const InputInfoSchema = z.object({
  sourceType: SourceTypeSchema,
  characterCount: z.number().int().nonnegative(),
  wordCount: z.number().int().nonnegative(),
  providedLanguageHint: z.string().nullable(),
});

export const DocumentInfoSchema = z.object({
  paragraphCount: z.number().int().nonnegative(),
  sentenceCount: z.number().int().nonnegative(),
  wordCount: z.number().int().nonnegative(),
  codeRegionCount: z.number().int().nonnegative(),
  referenceRegionCount: z.number().int().nonnegative(),
  urlCount: z.number().int().nonnegative(),
  extractionQuality: normalizedScore,
  normalizationApplied: z.array(z.string()),
  documentWarnings: z.array(z.string()),
});

export const LanguageResultSchema = z.object({
  primary: z.string(),
  confidence: normalizedScore,
  method: z.string(),
  detectedLanguages: z.array(z.string()),
  mixedLanguage: z.boolean(),
});

export const ReadabilityInfoSchema = z.object({
  available: z.boolean(),
  score: z.number().nullable(),
  method: z.string().nullable(),
  fleschKincaid: z.number().nullable().optional(),
  gunningFog: z.number().nullable().optional(),
  ari: z.number().nullable().optional(),
});

export const TextStatisticsSchema = z.object({
  characters: z.number().int().nonnegative(),
  words: z.number().int().nonnegative(),
  sentences: z.number().int().nonnegative(),
  paragraphs: z.number().int().nonnegative(),
  averageSentenceLength: z.number().nonnegative(),
  sentenceLengthVariance: z.number().nonnegative(),
  sentenceLengthStdDev: z.number().nonnegative(),
  averageWordLength: z.number().nonnegative(),
  typeTokenRatio: normalizedScore,
  hapaxRatio: normalizedScore.nullable(),
  punctuationRate: z.number().nonnegative(),
  repetitionRate: z.number().nonnegative(),
  readability: ReadabilityInfoSchema,
});

export const FeatureValueSchema = z.object({
  value: z.number(),
  available: z.boolean(),
  reliability: normalizedScore,
});

export const FeatureSetSchema = z.object({
  lexical: z.record(z.string(), FeatureValueSchema),
  syntactic: z.record(z.string(), FeatureValueSchema),
  structural: z.record(z.string(), FeatureValueSchema),
  punctuation: z.record(z.string(), FeatureValueSchema),
  repetition: z.record(z.string(), FeatureValueSchema),
  stylometric: z.record(z.string(), FeatureValueSchema),
  informationTheoretic: z.record(z.string(), FeatureValueSchema).optional(),
  distributional: z.record(z.string(), FeatureValueSchema).optional(),
  burstiness: z.record(z.string(), FeatureValueSchema).optional(),
  readabilityFeatures: z.record(z.string(), FeatureValueSchema).optional(),
});

export const MixedAuthorshipDetailsSchema = z.object({
  isMixed: z.boolean(),
  aiFraction: normalizedScore,
  confidence: normalizedScore,
  discontinuityScore: normalizedScore,
  suspectedSegments: z.array(z.number()),
});

export const ClassificationResultSchema = z.object({
  label: ClassificationLabelSchema,
  aiLikelihood: normalizedScore.nullable(),
  humanLikelihood: normalizedScore.nullable(),
  editedAILikelihood: normalizedScore.nullable(),
  basis: ClassificationBasisSchema,
  forensicSignal: normalizedScore.default(0.5),
  calibratedProbability: normalizedScore.nullable().default(null),
  calibrationStatus: CalibrationStatusSchema.default('not_calibrated'),
  mixedAuthorship: MixedAuthorshipDetailsSchema.default({
    isMixed: false,
    aiFraction: 0,
    confidence: 0,
    discontinuityScore: 0,
    suspectedSegments: [],
  }),
});

export const ConfidenceFactorSchema = z.object({
  id: z.string(),
  impact: z.number(),
  description: z.string(),
});

export const ConfidenceResultSchema = z.object({
  score: normalizedScore,
  level: ConfidenceLevelSchema,
  factors: z.array(ConfidenceFactorSchema),
  interval: z.object({ lower: normalizedScore, upper: normalizedScore }).optional(),
});

export const UncertaintyFactorSchema = z.object({
  id: z.string(),
  weight: normalizedScore,
  description: z.string(),
});

export const UncertaintyModelSchema = z.object({
  score: normalizedScore,
  level: z.enum(['low', 'moderate', 'high', 'critical']),
  factors: z.array(UncertaintyFactorSchema),
  recommendation: ActionRecommendationSchema,
});

export const DetectorResultSchema = z.object({
  detectorId: z.string(),
  version: z.string(),
  status: DetectorStatusSchema,
  score: normalizedScore.nullable(),
  confidence: normalizedScore,
  reliability: normalizedScore,
  evidenceIds: z.array(z.string()),
  limitations: z.array(z.string()),
});

export const EvidenceItemSchema = z.object({
  id: z.string(),
  detectorId: z.string(),
  feature: z.string(),
  observedValue: z.number(),
  unit: z.string(),
  direction: EvidenceDirectionSchema,
  interpretation: z.string(),
  reliability: normalizedScore,
  regionIds: z.array(z.string()),
  limitations: z.array(z.string()),
});

export const EvidencePoolsSchema = z.object({
  aiEvidence: z.array(EvidenceItemSchema),
  humanEvidence: z.array(EvidenceItemSchema),
  neutralEvidence: z.array(EvidenceItemSchema).default([]),
});

export const DiscontinuityLocationSchema = z.object({
  segmentIndex: z.number(),
  offset: z.number(),
  magnitude: normalizedScore,
  featureShifts: z.array(z.string()),
});

export const StyleDiscontinuityResultSchema = z.object({
  discontinuityScore: normalizedScore,
  detected: z.boolean(),
  locations: z.array(DiscontinuityLocationSchema),
  evidence: z.array(EvidenceItemSchema),
});

export const AIReasoningResultSchema = z.object({
  reasoningVersion: z.string(),
  assessment: z.enum(['supports_ai', 'supports_human', 'mixed', 'inconclusive']),
  strength: normalizedScore,
  supportingEvidence: z.array(z.string()),
  counterEvidence: z.array(z.string()),
  alternativeExplanations: z.array(z.string()),
  detectorConflicts: z.array(z.string()),
  segmentFindings: z.array(z.string()),
  adversarialFindings: z.array(z.string()),
  recommendation: ActionRecommendationSchema,
  reasoningConfidence: normalizedScore,
  provider: z.string(),
  model: z.string(),
  latencyMs: z.number().nonnegative(),
  error: z.string().nullable().optional(),
});

export const TextRegionSchema = z.object({
  id: z.string(),
  type: z.enum(['sentence', 'paragraph', 'code', 'reference', 'url']),
  startOffset: z.number().int().nonnegative(),
  endOffset: z.number().int().nonnegative(),
  text: z.string(),
  textHash: z.string(),
});

export const SegmentAnalysisSchema = z.object({
  aiLikelihood: normalizedScore.nullable(),
  confidence: normalizedScore,
  evidenceIds: z.array(z.string()),
  tells: z.array(z.any()).optional(),
  rephrasingSuggestions: z.array(z.any()).optional(),
});

export const AnalyzedRegionSchema = TextRegionSchema.extend({
  analysis: SegmentAnalysisSchema.nullable(),
});

export const SegmentsSchema = z.object({
  paragraphs: z.array(AnalyzedRegionSchema),
  sentences: z.array(AnalyzedRegionSchema),
  specialRegions: z.array(TextRegionSchema),
});

export const LimitationItemSchema = z.object({
  code: z.string(),
  severity: LimitationSeveritySchema,
  message: z.string(),
  affectedRegions: z.array(z.string()),
});

export const QualityInfoSchema = z.object({
  overallReliability: normalizedScore,
  textLengthReliability: normalizedScore,
  languageReliability: normalizedScore,
  extractionReliability: normalizedScore,
  featureCoverage: normalizedScore,
  detectorAgreement: normalizedScore,
  warnings: z.array(z.string()),
});

export const RuntimeInfoSchema = z.object({
  node: z.string(),
  platform: z.string(),
  arch: z.string(),
});

export const ReportMetadataSchema = z.object({
  applicationVersion: z.string(),
  coreVersion: z.string(),
  detectorVersions: z.record(z.string(), z.string()),
  configurationVersion: z.string(),
  runtime: RuntimeInfoSchema,
  reasoningVersion: z.string().optional(),
  calibrationProfileVersion: z.string().optional(),
});

export const ReportErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  retryable: z.boolean(),
});

export const AnalysisReportSchema = z.object({
  schemaVersion: z.string(),
  reportId: z.string(),
  createdAt: z.string().datetime(),
  status: ReportStatusSchema,
  input: InputInfoSchema,
  document: DocumentInfoSchema,
  language: LanguageResultSchema,
  statistics: TextStatisticsSchema,
  features: FeatureSetSchema,
  classification: ClassificationResultSchema,
  confidence: ConfidenceResultSchema,
  uncertainty: UncertaintyModelSchema.optional(),
  detectors: z.array(DetectorResultSchema),
  evidence: z.array(EvidenceItemSchema),
  evidencePools: EvidencePoolsSchema.optional(),
  styleDiscontinuity: StyleDiscontinuityResultSchema.optional(),
  segments: SegmentsSchema,
  limitations: z.array(LimitationItemSchema),
  quality: QualityInfoSchema,
  metadata: ReportMetadataSchema,
  reasoning: AIReasoningResultSchema.nullable().optional(),
  error: ReportErrorSchema.optional(),
});

export function parseAnalysisReport(data: unknown): AnalysisReport {
  return AnalysisReportSchema.parse(data) as AnalysisReport;
}

export function safeParseAnalysisReport(data: unknown) {
  return AnalysisReportSchema.safeParse(data);
}
