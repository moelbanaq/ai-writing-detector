import type { LimitationItem } from '@ai-detector/shared';
import type { TextStatistics, LanguageResult } from '@ai-detector/shared';
import type { EnsembleResult } from '../ensemble/run-ensemble.js';

export function buildLimitations(
  statistics: TextStatistics,
  language: LanguageResult,
  ensembleResult: EnsembleResult,
  extractionQuality: number,
): LimitationItem[] {
  const limitations: LimitationItem[] = [];

  if (statistics.words < 100) {
    limitations.push({
      code: 'SHORT_TEXT',
      message: 'Text is too short for reliable analysis.',
      severity: 'critical',
      affectedRegions: [],
    });
  }

  const activeDetectors = ensembleResult.detectorResults.filter((r) => r.status === 'active');
  if (activeDetectors.length < 3) {
    limitations.push({
      code: 'INSUFFICIENT_EVIDENCE',
      message: 'Fewer than 3 active detectors.',
      severity: 'critical',
      affectedRegions: [],
    });
  }

  if (language.primary === 'unknown') {
    limitations.push({
      code: 'UNSUPPORTED_LANGUAGE',
      message: 'Language is unknown or unsupported.',
      severity: 'critical',
      affectedRegions: [],
    });
  }

  if (ensembleResult.detectorAgreement < 0.5) {
    limitations.push({
      code: 'DETECTOR_DISAGREEMENT',
      message: 'Detectors show high disagreement.',
      severity: 'warning',
      affectedRegions: [],
    });
  }

  if (extractionQuality < 0.9) {
    limitations.push({
      code: 'LOW_EXTRACTION_QUALITY',
      message: 'Extraction quality is low.',
      severity: 'warning',
      affectedRegions: [],
    });
  }

  return limitations;
}
