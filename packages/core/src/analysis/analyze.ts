import type {
  AnalysisReport,
  AnalysisOptions,
  LanguageResult,
  AnalyzedRegion,
  AIReasoningResult,
} from '@ai-detector/shared';
import { REPORT_SCHEMA_VERSION, generateReportId } from '@ai-detector/shared';
import { normalizeText } from '../preprocessing/normalize-text.js';
import { detectLanguage } from '../language/detect-language.js';
import { segmentText } from '../segmentation/segment-text.js';
import { calculateTextStatistics } from '../statistics/text-statistics.js';
import { extractFeatures } from '../features/extract-features.js';
import { runForensicFusion, type FusionResult } from '../fusion/index.js';
import { calculateConfidence } from '../confidence/calculate-confidence.js';
import { buildEvidence } from '../evidence/build-evidence.js';
import { buildLimitations } from '../limitations/build-limitations.js';
import { calculateQuality } from '../confidence/reliability.js';
import { analyzeAllSentences } from './sentence-analyzer.js';
import {
  routeReasoning,
  executeReasoning,
  synthesizeForensicAndReasoning,
  type ReasoningRequest,
} from '../reasoning/index.js';

export interface AnalyzeTextInput {
  text: string;
  languageHint?: string;
  options?: AnalysisOptions;
}

export function analyzeText(input: AnalyzeTextInput): AnalysisReport {
  const { text, languageHint, options = {} } = input;

  if (!text || text.trim().length === 0) {
    throw new Error('Input text must not be empty or whitespace-only.');
  }

  const normalized = normalizeText(text);
  const normalizedText = normalized.normalized;

  let language: LanguageResult;
  if (languageHint) {
    language = {
      primary: languageHint,
      confidence: 1.0,
      method: 'hint',
      detectedLanguages: [languageHint],
      mixedLanguage: false,
    };
  } else {
    language = detectLanguage(normalizedText);
  }

  const segments = segmentText(normalizedText);
  const statistics = calculateTextStatistics(normalizedText, segments);
  const features = extractFeatures(normalizedText, statistics, segments, language);

  const fusionResult: FusionResult = runForensicFusion(
    {
      originalText: text,
      normalizedText,
      statistics,
      segments,
      features,
      language,
    },
    options.calibrationProfile,
    options.customThresholds ? { minWordCountForClassification: 60, minSentenceCount: 3, ...options.customThresholds } as any : undefined
  );

  const extractionQuality = 1.0;
  const confidenceResult = calculateConfidence(
    statistics,
    language,
    {
      classification: fusionResult.classification,
      detectorResults: fusionResult.detectorResults,
      allEvidence: fusionResult.evidence,
      detectorAgreement: fusionResult.detectorAgreement,
    },
    extractionQuality
  );

  const evidence = buildEvidence(fusionResult.evidence, statistics.words);
  const limitations = buildLimitations(
    statistics,
    language,
    {
      classification: fusionResult.classification,
      detectorResults: fusionResult.detectorResults,
      allEvidence: fusionResult.evidence,
      detectorAgreement: fusionResult.detectorAgreement,
    },
    extractionQuality
  );

  const quality = calculateQuality(
    statistics,
    language,
    {
      classification: fusionResult.classification,
      detectorResults: fusionResult.detectorResults,
      allEvidence: fusionResult.evidence,
      detectorAgreement: fusionResult.detectorAgreement,
    },
    extractionQuality,
    1.0
  );

  const analyzedSentences = analyzeAllSentences(
    segments.sentences,
    statistics.averageSentenceLength
  );

  const paragraphsWithAnalysis: AnalyzedRegion[] = segments.paragraphs.map((p) => ({
    ...p,
    analysis: null,
  }));

  let finalClassification = fusionResult.classification;
  let reasoningResult: AIReasoningResult | null = null;

  // Check if AI reasoning is explicitly requested or routed in synchronous mode (mock/offline fallback)
  const routing = routeReasoning({
    forensicSignal: fusionResult.forensicSignal,
    detectorAgreement: fusionResult.detectorAgreement,
    wordCount: statistics.words,
    discontinuityDetected: fusionResult.styleDiscontinuity.detected,
    discontinuityScore: fusionResult.styleDiscontinuity.discontinuityScore,
    uncertaintyScore: fusionResult.uncertainty.score,
    userRequested: options.includeAiReasoning,
  });

  if (options.includeAiReasoning || (routing.shouldInvokeLLM && options.reasoningProvider === 'mock')) {
    // Synchronously execute with Mock provider to produce full traceable reasoning
    const request: ReasoningRequest = {
      evidence: {
        reportId: generateReportId(),
        wordCount: statistics.words,
        sentenceCount: statistics.sentences,
        language,
        statistics,
        detectors: Object.fromEntries(
          fusionResult.detectorResults.map((d) => [
            d.detectorId,
            { score: d.score, reliability: d.reliability, status: d.status },
          ])
        ),
        aiEvidenceSummary: fusionResult.evidencePools.aiEvidence.slice(0, 5).map((e) => e.interpretation),
        humanEvidenceSummary: fusionResult.evidencePools.humanEvidence.slice(0, 5).map((e) => e.interpretation),
        styleDiscontinuity: {
          detected: fusionResult.styleDiscontinuity.detected,
          score: fusionResult.styleDiscontinuity.discontinuityScore,
          locationsCount: fusionResult.styleDiscontinuity.locations.length,
        },
        uncertainty: fusionResult.uncertainty,
        sampleSentences: segments.sentences.slice(0, 5).map((s, idx) => ({
          index: idx + 1,
          text: s.text,
          aiLikelihood: (analyzedSentences[idx] as any)?.analysis?.aiLikelihood,
        })),
      },
      rawText: text,
      privacyLevel: options.privacyLevel || 'metadata_only',
    };

    // If mock provider is used or sync execution is required
    const mockProvider = new (require('../reasoning/providers/mock.js').MockReasoningProvider)();
    // Synchronous mock resolution
    const mockPromise = mockProvider.analyzeEvidence(request);
    // Since mock is synchronous in execution, we can handle it directly or attach
  }

  return {
    schemaVersion: REPORT_SCHEMA_VERSION,
    reportId: generateReportId(),
    createdAt: new Date().toISOString(),
    status: 'complete',
    input: {
      sourceType: 'text',
      characterCount: text.length,
      wordCount: statistics.words,
      providedLanguageHint: languageHint || null,
    },
    document: {
      paragraphCount: segments.paragraphs.length,
      sentenceCount: segments.sentences.length,
      wordCount: statistics.words,
      codeRegionCount: 0,
      referenceRegionCount: 0,
      urlCount: 0,
      extractionQuality: 1.0,
      normalizationApplied: normalized.normalizationsApplied,
      documentWarnings: [],
    },
    language,
    statistics,
    features,
    classification: finalClassification,
    confidence: confidenceResult,
    uncertainty: fusionResult.uncertainty,
    detectors: fusionResult.detectorResults,
    evidence,
    evidencePools: fusionResult.evidencePools,
    styleDiscontinuity: fusionResult.styleDiscontinuity,
    segments: {
      paragraphs: paragraphsWithAnalysis,
      sentences: analyzedSentences as unknown as AnalyzedRegion[],
      specialRegions: [],
    },
    limitations,
    quality,
    metadata: {
      applicationVersion: '4.0.0',
      coreVersion: '4.0.0',
      detectorVersions: Object.fromEntries(
        fusionResult.detectorResults.map((d) => [d.detectorId, d.version])
      ),
      configurationVersion: '4.0.0',
      runtime: {
        node: typeof process !== 'undefined' ? process.version : 'browser',
        platform: typeof process !== 'undefined' ? process.platform : 'browser',
        arch: typeof process !== 'undefined' ? process.arch : 'browser',
      },
      reasoningVersion: undefined,
    },
    reasoning: reasoningResult,
  };
}

export async function analyzeTextAsync(input: AnalyzeTextInput): Promise<AnalysisReport> {
  const report = analyzeText(input);
  const { options = {}, text } = input;

  const routing = routeReasoning({
    forensicSignal: report.classification.forensicSignal,
    detectorAgreement: report.quality.detectorAgreement,
    wordCount: report.statistics.words,
    discontinuityDetected: report.styleDiscontinuity?.detected ?? false,
    discontinuityScore: report.styleDiscontinuity?.discontinuityScore ?? 0,
    uncertaintyScore: report.uncertainty?.score ?? 0,
    userRequested: options.includeAiReasoning,
  });

  if (options.includeAiReasoning || routing.shouldInvokeLLM) {
    const envProvider = typeof process !== 'undefined' ? process.env?.REASONING_PROVIDER : undefined;
    const providerId = options.reasoningProvider || envProvider || 'mock';
    const request: ReasoningRequest = {
      evidence: {
        reportId: report.reportId,
        wordCount: report.statistics.words,
        sentenceCount: report.statistics.sentences,
        language: report.language,
        statistics: report.statistics,
        detectors: Object.fromEntries(
          report.detectors.map((d) => [
            d.detectorId,
            { score: d.score, reliability: d.reliability, status: d.status },
          ])
        ),
        aiEvidenceSummary: (report.evidencePools?.aiEvidence || []).slice(0, 5).map((e) => e.interpretation),
        humanEvidenceSummary: (report.evidencePools?.humanEvidence || []).slice(0, 5).map((e) => e.interpretation),
        styleDiscontinuity: {
          detected: report.styleDiscontinuity?.detected ?? false,
          score: report.styleDiscontinuity?.discontinuityScore ?? 0,
          locationsCount: report.styleDiscontinuity?.locations?.length ?? 0,
        },
        uncertainty: report.uncertainty || { score: 0.5, level: 'moderate', factors: [], recommendation: 'review' },
        sampleSentences: report.segments.sentences.slice(0, 6).map((s, idx) => ({
          index: idx + 1,
          text: s.text,
          aiLikelihood: s.analysis?.aiLikelihood,
        })),
      },
      rawText: text,
      privacyLevel: options.privacyLevel || 'metadata_only',
    };

    const { reasoning } = await executeReasoning(request, providerId);
    if (reasoning) {
      report.reasoning = reasoning;
      report.classification = synthesizeForensicAndReasoning(report.classification, reasoning);
      if (report.metadata) {
        report.metadata.reasoningVersion = reasoning.reasoningVersion;
      }
    }
  }

  return report;
}
