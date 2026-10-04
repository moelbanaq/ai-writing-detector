export { analyzeText, analyzeTextAsync, type AnalyzeTextInput } from './analysis/analyze.js';
export { extractFeatures } from './features/extract-features.js';
export { detectLanguage } from './language/detect-language.js';
export { segmentText } from './segmentation/segment-text.js';
export { calculateTextStatistics } from './statistics/text-statistics.js';
export type { DetectorContext, Detector, DetectorOutput } from './detectors/types.js';

// Detectors
export { SemanticDetector } from './detectors/semantic.js';
export { StyleDiscontinuityDetector, detectStyleDiscontinuity } from './detectors/discontinuity.js';

// Fusion Engine & Calibration
export {
  runForensicFusion,
  type FusionResult,
  calculateUncertainty,
  type UncertaintyInputs,
  applyCalibration,
  fitLogisticCalibration,
  calculateECE,
  type CalibrationProfile as FusionCalibrationProfile,
  type CalibrationEvaluation,
  UNCALIBRATED_DEFAULT_PROFILE,
  DEFAULT_THRESHOLDS as FUSION_DEFAULT_THRESHOLDS,
  type ClassificationThresholds,
} from './fusion/index.js';

// AI Reasoning Layer
export {
  getReasoningProvider,
  executeReasoning,
  routeReasoning,
  synthesizeForensicAndReasoning,
  SYSTEM_REASONING_PROMPT,
  buildReasoningUserPrompt,
  REASONING_PROMPT_VERSION,
  MockReasoningProvider,
  GeminiReasoningProvider,
  OpenAIReasoningProvider,
  AnthropicReasoningProvider,
  LocalReasoningProvider,
  type ReasoningProvider,
  type ReasoningRequest,
  type ReasoningResponse,
  type ReasoningAssessment,
  type RoutingDecision,
  type RoutingContext,
  type SynthesisOptions,
} from './reasoning/index.js';

// Configuration and customizable rules
export {
  AI_PHRASES,
  HUMAN_MARKERS,
  DEFAULT_THRESHOLDS,
  DEFAULT_CALIBRATION,
  type CalibrationProfile,
} from './config/detection-rules.js';

// Calibration training utilities
export {
  fitCalibration,
  evaluateCalibration,
  trainingVector,
  type LabeledSample,
  type CalibrationOptions,
  type EvaluationResult,
} from './calibration/calibration-tools.js';
