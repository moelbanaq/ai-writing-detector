import type { QualityInfo, TextStatistics, LanguageResult } from '@ai-detector/shared';
import type { EnsembleResult } from '../ensemble/run-ensemble.js';
import { clamp } from '@ai-detector/shared';

export function calculateQuality(
  statistics: TextStatistics,
  language: LanguageResult,
  ensembleResult: EnsembleResult,
  extractionQuality: number,
  featureCoverage: number,
): QualityInfo {
  let score = extractionQuality * featureCoverage * language.confidence;
  score = clamp(score, 0, 1);

  return {
    overallReliability: score,
    textLengthReliability: statistics.words > 500 ? 1 : statistics.words / 500,
    languageReliability: language.confidence,
    extractionReliability: extractionQuality,
    featureCoverage,
    detectorAgreement: ensembleResult.detectorAgreement,
    warnings: [],
  };
}
