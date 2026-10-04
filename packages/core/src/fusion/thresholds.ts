export interface ClassificationThresholds {
  aiLikely: number;
  aiEditedLikely: number;
  humanLikely: number;
  minWordCountForClassification: number;
  minSentenceCount: number;
}

export const DEFAULT_THRESHOLDS: ClassificationThresholds = {
  aiLikely: 0.80, // High standard for AI Likely (prevents false accusations)
  aiEditedLikely: 0.50, // Moderate AI footprint or human-edited AI
  humanLikely: 0.25, // Clear human signals
  minWordCountForClassification: 60,
  minSentenceCount: 3,
};
