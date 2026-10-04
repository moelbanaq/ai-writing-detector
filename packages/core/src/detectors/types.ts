import type {
  DetectorResult,
  EvidenceItem,
  FeatureSet,
  TextStatistics,
  LanguageResult,
} from '@ai-detector/shared';
import type { SegmentationResult } from '../segmentation/segment-text.js';

export interface DetectorContext {
  originalText: string;
  normalizedText: string;
  statistics: TextStatistics;
  segments: SegmentationResult;
  features: FeatureSet;
  language: LanguageResult;
}

export interface DetectorOutput {
  result: DetectorResult;
  evidence: EvidenceItem[];
}

export interface Detector {
  readonly id: string;
  readonly version: string;
  analyze(context: DetectorContext): DetectorOutput;
}
