import type { EvidenceItem } from '@ai-detector/shared';
import type { Detector, DetectorContext, DetectorOutput } from './types.js';

export class RepetitionDetector implements Detector {
  readonly id = 'repetition';
  readonly version = '2.0.0';

  analyze(context: DetectorContext): DetectorOutput {
    if (context.statistics.words < 50) {
      return {
        result: {
          detectorId: this.id,
          version: this.version,
          score: null,
          confidence: 0,
          reliability: 0,
          status: 'insufficient_data',
          evidenceIds: [],
          limitations: [],
        },
        evidence: [],
      };
    }

    const wordRep = context.features.repetition.wordRepetitionRate;
    const bigramRep = context.features.repetition.bigramRepetitionRate;
    const trigramRep = context.features.repetition.trigramRepetitionRate;
    const sentStartRep = context.features.repetition.sentenceStartRepetition;

    const wordRepVal = wordRep?.available ? wordRep.value : 0;
    const bigramRepVal = bigramRep?.available ? bigramRep.value : 0;
    const trigramRepVal = trigramRep?.available ? trigramRep.value : 0;
    const sentStartRepVal = sentStartRep?.available ? sentStartRep.value : 0;

    // Weighted composite: n-gram repetition is more diagnostic than raw word repetition
    const compositeRepetition =
      wordRepVal * 0.2 + bigramRepVal * 0.3 + trigramRepVal * 0.35 + sentStartRepVal * 0.15;
    const score = Math.min(1, compositeRepetition * 4);
    const confidence = Math.min(1, context.statistics.words / 200);
    const reliability = 0.8;

    const evidence: EvidenceItem[] = [];
    if (trigramRepVal > 0.05) {
      evidence.push({
        id: `${this.id}-trigram-repetition`,
        detectorId: this.id,
        feature: 'trigramRepetitionRate',
        observedValue: trigramRepVal,
        unit: 'ratio',
        direction: 'ai_associated',
        interpretation: `Elevated trigram repetition rate (${(trigramRepVal * 100).toFixed(1)}%) suggests formulaic phrasing.`,
        reliability: 0.85,
        regionIds: [],
        limitations: [],
      });
    }
    if (sentStartRepVal > 0.3) {
      evidence.push({
        id: `${this.id}-sentence-start-repetition`,
        detectorId: this.id,
        feature: 'sentenceStartRepetition',
        observedValue: sentStartRepVal,
        unit: 'ratio',
        direction: 'ai_associated',
        interpretation: `${(sentStartRepVal * 100).toFixed(0)}% of sentences share the same opening words, typical of AI-generated lists or parallel structures.`,
        reliability: 0.8,
        regionIds: [],
        limitations: [],
      });
    }
    if (bigramRepVal > 0.15) {
      evidence.push({
        id: `${this.id}-bigram-repetition`,
        detectorId: this.id,
        feature: 'bigramRepetitionRate',
        observedValue: bigramRepVal,
        unit: 'ratio',
        direction: 'ai_associated',
        interpretation: `High bigram repetition rate (${(bigramRepVal * 100).toFixed(1)}%) detected.`,
        reliability: 0.75,
        regionIds: [],
        limitations: [],
      });
    }

    return {
      result: {
        detectorId: this.id,
        version: this.version,
        score,
        confidence,
        reliability,
        status: 'active',
        evidenceIds: evidence.map((e) => e.id),
        limitations: [],
      },
      evidence,
    };
  }
}
