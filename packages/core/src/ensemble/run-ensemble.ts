import type { DetectorResult, EvidenceItem, ClassificationResult } from '@ai-detector/shared';
import type { DetectorContext } from '../detectors/types.js';
import type { Detector } from '../detectors/types.js';

import { StylometricDetector } from '../detectors/stylometric.js';
import { LexicalDiversityDetector } from '../detectors/lexical-diversity.js';
import { StructuralRegularityDetector } from '../detectors/structural-regularity.js';
import { RepetitionDetector } from '../detectors/repetition.js';
import { PredictabilityProxyDetector } from '../detectors/predictability-proxy.js';
import { AIPatternDetector } from '../detectors/ai-pattern.js';
import { HumanIrregularityDetector } from '../detectors/human-irregularity.js';
import { ReadabilityConsistencyDetector } from '../detectors/readability-consistency.js';
import { DistributionalConformityDetector } from '../detectors/distributional-conformity.js';

export interface EnsembleResult {
  classification: ClassificationResult;
  detectorResults: DetectorResult[];
  allEvidence: EvidenceItem[];
  detectorAgreement: number;
}

/**
 * Clamp a log-odds-derived probability to avoid extreme values.
 */
function clampProb(p: number): number {
  return Math.max(0.01, Math.min(0.99, p));
}

/**
 * Convert a probability to log-odds.
 */
function toLogOdds(p: number): number {
  const cp = clampProb(p);
  return Math.log(cp / (1 - cp));
}

/**
 * Convert log-odds back to probability.
 */
function fromLogOdds(lo: number): number {
  return 1 / (1 + Math.exp(-lo));
}

/**
 * Compute context-adaptive weight multiplier based on text characteristics.
 */
function getContextWeight(
  detectorId: string,
  wordCount: number,
  _sentenceCount: number,
): number {
  // Short texts: down-weight distributional/structural, up-weight pattern/transition
  if (wordCount < 250) {
    if (detectorId === 'distributional-conformity') return 0.4;
    if (detectorId === 'readability-consistency') return 0.5;
    if (detectorId === 'predictability-proxy') return 0.8;
    if (detectorId === 'ai-pattern') return 1.3;
  }
  // Long texts: up-weight statistical detectors
  if (wordCount > 1000) {
    if (detectorId === 'distributional-conformity') return 1.3;
    if (detectorId === 'readability-consistency') return 1.2;
    if (detectorId === 'predictability-proxy') return 1.1;
    if (detectorId === 'ai-pattern') return 0.9;
  }
  return 1.0;
}

export function runEnsemble(context: DetectorContext): EnsembleResult {
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
  ];

  const detectorResults: DetectorResult[] = [];
  const allEvidence: EvidenceItem[] = [];

  const scores: number[] = [];
  const wordCount = context.statistics.words;
  const sentenceCount = context.statistics.sentences;

  // Bayesian log-odds fusion: neutral prior (50%) allows evidence to naturally move probability
  let logOddsAccum = toLogOdds(0.50);

  for (const detector of detectors) {
    const { result, evidence } = detector.analyze(context);
    detectorResults.push(result);
    allEvidence.push(...evidence);

    if (result.status === 'active' && result.score !== null) {
      let adjScore = result.score;
      if (detector.id === 'human-irregularity') {
        adjScore = 1 - adjScore;
      }
      scores.push(adjScore);

      // Context-adaptive weight: base reliability × context multiplier
      const contextMultiplier = getContextWeight(detector.id, wordCount, sentenceCount);
      const effectiveWeight = result.reliability * contextMultiplier;

      // Accumulate scaled log-odds evidence (weight 0.35 gives responsive calibration)
      const detectorLogOdds = toLogOdds(adjScore);
      logOddsAccum += detectorLogOdds * effectiveWeight * 0.35;
    }
  }

  let aiLikelihood = 0;
  let detectorAgreement = 1;

  if (scores.length > 0) {
    // Convert accumulated log-odds to probability
    aiLikelihood = fromLogOdds(logOddsAccum);

    // Detector agreement via standard deviation
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    const stddev = Math.sqrt(variance);
    detectorAgreement = Math.max(0, 1 - 2 * stddev);

    // Moderate cap only if detectors are in extreme conflict
    if (detectorAgreement < 0.3) {
      aiLikelihood = Math.min(aiLikelihood, 0.70);
    }
  }

  // Multi-tier classification with calibrated thresholds
  let label: ClassificationResult['label'] = 'inconclusive';
  let editedAILikelihood = 0;
  if (scores.length > 0) {
    if (aiLikelihood >= 0.65) {
      label = 'ai_likely';
    } else if (aiLikelihood >= 0.45) {
      label = 'ai_edited_likely';
      editedAILikelihood = aiLikelihood;
    } else if (aiLikelihood <= 0.30) {
      label = 'human_likely';
    } else {
      label = 'inconclusive';
    }
  }

  return {
    classification: {
      label,
      aiLikelihood,
      humanLikelihood: 1 - aiLikelihood,
      editedAILikelihood,
      basis: 'ensemble',
      forensicSignal: aiLikelihood,
      calibratedProbability: null,
      calibrationStatus: 'not_calibrated',
      mixedAuthorship: {
        isMixed: false,
        aiFraction: 0,
        confidence: 0,
        discontinuityScore: 0,
        suspectedSegments: [],
      },
    },
    detectorResults,
    allEvidence,
    detectorAgreement,
  };
}
