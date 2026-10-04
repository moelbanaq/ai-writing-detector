import type {
  DetectorResult,
  EvidenceItem,
  ClassificationResult,
  EvidencePools,
  StyleDiscontinuityResult,
  UncertaintyModel,
  ClassificationLabel,
  ClassificationBasis,
} from '@ai-detector/shared';
import type { DetectorContext, Detector } from '../detectors/types.js';

import { StylometricDetector } from '../detectors/stylometric.js';
import { LexicalDiversityDetector } from '../detectors/lexical-diversity.js';
import { StructuralRegularityDetector } from '../detectors/structural-regularity.js';
import { RepetitionDetector } from '../detectors/repetition.js';
import { PredictabilityProxyDetector } from '../detectors/predictability-proxy.js';
import { AIPatternDetector } from '../detectors/ai-pattern.js';
import { HumanIrregularityDetector } from '../detectors/human-irregularity.js';
import { ReadabilityConsistencyDetector } from '../detectors/readability-consistency.js';
import { DistributionalConformityDetector } from '../detectors/distributional-conformity.js';
import { SemanticDetector } from '../detectors/semantic.js';
import { StyleDiscontinuityDetector } from '../detectors/discontinuity.js';

import { calculateUncertainty } from './uncertainty.js';
import { applyCalibration, type CalibrationProfile } from './calibration.js';
import { DEFAULT_THRESHOLDS } from './thresholds.js';

export interface FusionResult {
  classification: ClassificationResult;
  detectorResults: DetectorResult[];
  evidence: EvidenceItem[];
  evidencePools: EvidencePools;
  styleDiscontinuity: StyleDiscontinuityResult;
  uncertainty: UncertaintyModel;
  forensicSignal: number;
  detectorAgreement: number;
  detectorDispersion: number;
  featureCoverage: number;
}

const clamp = (x: number, a = 0, b = 1): number => Math.max(a, Math.min(b, x));

export function runForensicFusion(
  context: DetectorContext,
  calibrationProfile?: CalibrationProfile | null,
  customThresholds = DEFAULT_THRESHOLDS
): FusionResult {
  const detectors: Detector[] = [
    new StylometricDetector(),
    new LexicalDiversityDetector(),
    new StructuralRegularityDetector(),
    new RepetitionDetector(),
    new PredictabilityProxyDetector(),
    new AIPatternDetector(),
    new HumanIrregularityDetector(),
    new ReadabilityConsistencyDetector(),
    new DistributionalConformityDetector(),
    new SemanticDetector(),
    new StyleDiscontinuityDetector(),
  ];

  const detectorResults: DetectorResult[] = [];
  const allEvidence: EvidenceItem[] = [];
  const rawScores: Record<string, number> = {};
  const activeScores: { id: string; score: number; reliability: number; weight: number }[] = [];

  for (const detector of detectors) {
    const { result, evidence } = detector.analyze(context);
    detectorResults.push(result);
    allEvidence.push(...evidence);

    if (result.status === 'active' && result.score !== null) {
      let adjScore = result.score;
      if (detector.id === 'human-irregularity') {
        adjScore = 1 - adjScore;
      }
      rawScores[detector.id] = adjScore;

      // Discontinuity is evaluated separately for mixed authorship, not as a linear indicator of AI
      if (detector.id !== 'discontinuity') {
        activeScores.push({
          id: detector.id,
          score: adjScore,
          reliability: result.reliability,
          weight: result.reliability * Math.max(0.2, result.confidence),
        });
      }
    }
  }

  // Separate evidence pools
  const aiEvidence = allEvidence.filter((e) => e.direction === 'ai_associated');
  const humanEvidence = allEvidence.filter((e) => e.direction === 'human_associated');
  const neutralEvidence = allEvidence.filter((e) => e.direction === 'neutral');

  const evidencePools: EvidencePools = {
    aiEvidence,
    humanEvidence,
    neutralEvidence,
  };

  // 1. Calculate Feature Coverage
  const totalDetectors = detectors.length - 1; // excluding discontinuity
  const activeCount = activeScores.length;
  const featureCoverage = clamp(activeCount / Math.max(1, totalDetectors));

  // 2. Correlation & Redundancy Control
  // Group correlated detectors to avoid multiple countings
  const rhetoricalTriggered = ['ai-pattern', 'predictability-proxy'].filter((id) => rawScores[id] !== undefined && rawScores[id]! > 0.5).length;
  const syntaxRegularityTriggered = ['structural-regularity', 'stylometric', 'readability-consistency'].filter((id) => rawScores[id] !== undefined && rawScores[id]! > 0.5).length;

  let collinearityPenalty = 1.0;
  if (rhetoricalTriggered > 1 && syntaxRegularityTriggered === 0) {
    // Rhetorical patterns triggered alone without structural corroboration -> apply 15% redundancy discount
    collinearityPenalty = 0.85;
  } else if (syntaxRegularityTriggered >= 2 && rhetoricalTriggered === 0) {
    // Structural regularity alone without rhetorical markers -> apply 10% discount
    collinearityPenalty = 0.90;
  }

  // 3. Weighted Evidence Fusion
  let forensicSignal = 0.5;
  let detectorAgreement = 1.0;
  let detectorDispersion = 0.0;

  if (activeScores.length > 0) {
    const totalWeight = activeScores.reduce((acc, item) => acc + item.weight, 0);
    const weightedSum = activeScores.reduce((acc, item) => acc + item.score * item.weight, 0);
    const rawWeighted = totalWeight > 0 ? weightedSum / totalWeight : 0.5;

    // Dispersion & Agreement
    const values = activeScores.map((s) => s.score);
    const meanVal = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - meanVal, 2), 0) / values.length;
    detectorDispersion = Number(Math.sqrt(variance).toFixed(3));
    detectorAgreement = Number(clamp(1 - detectorDispersion * 2.2).toFixed(3));

    // Modulate evidence deviation from neutral (0.5) by agreement and collinearity
    forensicSignal = clamp(0.5 + (rawWeighted - 0.5) * detectorAgreement * collinearityPenalty);
    forensicSignal = Number(forensicSignal.toFixed(4));
  }

  // 4. Style Discontinuity & Mixed Authorship Detection
  const discontinuityResult = detectorResults.find((d) => d.detectorId === 'discontinuity');
  const discontinuityScore = discontinuityResult?.score ?? 0;
  const discontinuityDetected = discontinuityScore >= 0.45;

  const discontinuityLocations: { segmentIndex: number; offset: number; magnitude: number; featureShifts: string[] }[] = [];
  const discontinuityEvidence = allEvidence.filter((e) => e.detectorId === 'discontinuity');

  const styleDiscontinuity: StyleDiscontinuityResult = {
    discontinuityScore,
    detected: discontinuityDetected,
    locations: discontinuityLocations,
    evidence: discontinuityEvidence,
  };

  // 5. Formal Calibration Application
  const isCalibratedProfile = Boolean(calibrationProfile && calibrationProfile.status !== 'not_calibrated');
  const { calibratedProbability, status: calibStatus } = applyCalibration(rawScores, calibrationProfile);

  // 6. Epistemic Uncertainty Model
  const uncertainty = calculateUncertainty({
    detectorAgreement,
    wordCount: context.statistics.words,
    sentenceCount: context.statistics.sentences,
    languageConfidence: context.language.confidence,
    featureCoverage,
    isCalibrated: isCalibratedProfile,
  });

  // 7. Decision Engine with Mandatory Abstention
  let label: ClassificationLabel = 'inconclusive';
  let basis: ClassificationBasis = 'forensic_ensemble';

  const wordCount = context.statistics.words;

  if (wordCount < customThresholds.minWordCountForClassification || uncertainty.recommendation === 'abstain') {
    label = 'inconclusive';
    basis = 'insufficient_evidence';
  } else if (discontinuityDetected && forensicSignal >= 0.35 && forensicSignal <= 0.75) {
    // Significant style boundary found with intermediate scores -> classify as mixed authorship
    label = 'mixed';
    basis = 'discontinuity_mixed';
  } else if (calibratedProbability !== null) {
    basis = 'calibrated_logistic';
    if (calibratedProbability >= customThresholds.aiLikely) {
      label = 'ai_likely';
    } else if (calibratedProbability <= customThresholds.humanLikely) {
      label = 'human_likely';
    } else if (calibratedProbability >= customThresholds.aiEditedLikely) {
      label = 'ai_edited_likely';
    } else {
      label = 'inconclusive';
    }
  } else {
    // Uncalibrated forensic evidence signal mode
    basis = 'forensic_ensemble';
    if (forensicSignal >= 0.75 && detectorAgreement >= 0.40) {
      label = 'ai_likely';
    } else if (forensicSignal <= 0.25 && detectorAgreement >= 0.40) {
      label = 'human_likely';
    } else if (forensicSignal >= 0.48 && forensicSignal < 0.75) {
      label = 'ai_edited_likely';
    } else {
      label = 'inconclusive';
    }
  }

  // Format final classification result
  const finalProb = calibratedProbability !== null ? calibratedProbability : forensicSignal;
  const classification: ClassificationResult = {
    label,
    aiLikelihood: finalProb,
    humanLikelihood: Number((1 - finalProb).toFixed(4)),
    editedAILikelihood: label === 'ai_edited_likely' ? finalProb : null,
    basis,
    forensicSignal,
    calibratedProbability,
    calibrationStatus: calibStatus,
    mixedAuthorship: {
      isMixed: label === 'mixed' || discontinuityDetected,
      aiFraction: Number(forensicSignal.toFixed(3)),
      confidence: Number((detectorAgreement * (1 - uncertainty.score)).toFixed(3)),
      discontinuityScore,
      suspectedSegments: discontinuityDetected ? [1, 2] : [],
    },
  };

  return {
    classification,
    detectorResults,
    evidence: allEvidence,
    evidencePools,
    styleDiscontinuity,
    uncertainty,
    forensicSignal,
    detectorAgreement,
    detectorDispersion,
    featureCoverage,
  };
}
