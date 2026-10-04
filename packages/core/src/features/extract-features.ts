import type { FeatureSet, TextStatistics, LanguageResult, TextRegion } from '@ai-detector/shared';
import type { SegmentationResult } from '../segmentation/segment-text.js';
import { calculateEntropy } from './entropy.js';
import { calculateZipfConformity } from './zipf.js';
import { calculateBurstiness } from './burstiness.js';
import { calculateReadability, calculateReadabilityVariance } from './readability.js';

// ─── N-gram Helpers ──────────────────────────────────────────────────────────

function computeBigramRepetition(words: string[]): number {
  if (words.length < 2) return 0;
  const bigrams = new Map<string, number>();
  for (let i = 0; i < words.length - 1; i++) {
    const bg = `${words[i]} ${words[i + 1]}`;
    bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
  }
  let repeated = 0;
  bigrams.forEach((c) => {
    if (c > 1) repeated += c;
  });
  return repeated / (words.length - 1);
}

function computeTrigramRepetition(words: string[]): number {
  if (words.length < 3) return 0;
  const trigrams = new Map<string, number>();
  for (let i = 0; i < words.length - 2; i++) {
    const tg = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    trigrams.set(tg, (trigrams.get(tg) || 0) + 1);
  }
  let repeated = 0;
  trigrams.forEach((c) => {
    if (c > 1) repeated += c;
  });
  return repeated / (words.length - 2);
}

function computeSentenceStartRepetition(sentences: TextRegion[]): number {
  if (sentences.length < 2) return 0;
  const starters = sentences.map((s) => {
    const firstWords = s.text.trim().split(/\s+/).slice(0, 2).join(' ').toLowerCase();
    return firstWords;
  });
  const counts = new Map<string, number>();
  starters.forEach((s) => counts.set(s, (counts.get(s) || 0) + 1));
  let repeated = 0;
  counts.forEach((c) => {
    if (c > 1) repeated += c;
  });
  return repeated / sentences.length;
}

// ─── Main Feature Extraction ─────────────────────────────────────────────────

export function extractFeatures(
  text: string,
  statistics: TextStatistics,
  segments: SegmentationResult,
  _language: LanguageResult,
): FeatureSet {
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const totalWords = words.length;

  // hapax
  const wordCounts = new Map<string, number>();
  words.forEach((w) => wordCounts.set(w, (wordCounts.get(w) || 0) + 1));
  let hapaxCount = 0;
  wordCounts.forEach((c) => {
    if (c === 1) hapaxCount++;
  });
  const hapaxRatio = totalWords > 0 ? hapaxCount / totalWords : 0;

  // function words
  const funcWords = new Set([
    'the',
    'is',
    'are',
    'was',
    'were',
    'have',
    'has',
    'had',
    'been',
    'being',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'this',
    'that',
    'these',
    'those',
    'with',
    'from',
    'for',
    'and',
    'but',
    'or',
    'not',
    'no',
    'yes',
    'all',
    'each',
    'every',
    'both',
    'few',
    'more',
    'most',
    'other',
    'some',
    'such',
    'than',
    'too',
    'very',
    'can',
    'just',
    'don',
    'now',
    'le',
    'la',
    'les',
    'un',
    'une',
    'des',
    'de',
    'du',
    'et',
    'est',
    'sont',
    'dans',
    'pour',
    'avec',
    'sur',
    'par',
    'que',
    'qui',
    'pas',
    'plus',
    'tout',
    'cette',
    'ces',
  ]);
  let funcCount = 0;
  words.forEach((w) => {
    if (funcWords.has(w)) funcCount++;
  });
  const functionWordRatio = totalWords > 0 ? funcCount / totalWords : 0;

  // CVs
  const sentenceLengthCV =
    statistics.averageSentenceLength > 0
      ? statistics.sentenceLengthStdDev / statistics.averageSentenceLength
      : 0;
  const sentenceLengthUniformity = Math.max(0, Math.min(1, 1 - sentenceLengthCV));

  const paraLengths = segments.paragraphs.map(
    (p) => p.text.split(/\s+/).filter((w) => w.length > 0).length,
  );
  const avgParaLen = paraLengths.length ? totalWords / paraLengths.length : 0;
  let paraVar = 0;
  if (paraLengths.length > 0) {
    paraVar = paraLengths.reduce((s, l) => s + Math.pow(l - avgParaLen, 2), 0) / paraLengths.length;
  }
  const paraStdDev = Math.sqrt(paraVar);
  const paragraphLengthCV = avgParaLen > 0 ? paraStdDev / avgParaLen : 0;
  const paragraphLengthUniformity = Math.max(0, Math.min(1, 1 - paragraphLengthCV));

  const commas = (text.match(/,/g) || []).length;
  const semicolons = (text.match(/;/g) || []).length;
  const questions = (text.match(/\?/g) || []).length;
  const exclamations = (text.match(/!/g) || []).length;
  const conjunctions = (text.match(/\b(and|but|or|because|although|however)\b/gi) || []).length;

  const punctRegex = /[.,;:!?\-()[\]{}"'`/\\@#$%^&*~\u060C\u061B\u061F\u06D4]/g;
  const punctTypes = new Set(text.match(punctRegex) || []);
  const totalPunct = (text.match(punctRegex) || []).length;
  const punctuationDiversity = totalPunct > 0 ? punctTypes.size / totalPunct : 0;

  // N-gram repetition features
  const bigramRepRate = computeBigramRepetition(words);
  const trigramRepRate = computeTrigramRepetition(words);
  const sentStartRepRate = computeSentenceStartRepetition(segments.sentences);

  // New feature modules
  const entropyMetrics = calculateEntropy(text, words);
  const zipfMetrics = calculateZipfConformity(words);
  const burstinessMetrics = calculateBurstiness(segments.sentences, segments.paragraphs, words);

  const readabilityScores = calculateReadability(text, totalWords, statistics.sentences);
  const paragraphTexts = segments.paragraphs.map((p) => p.text);
  const readabilityVar = calculateReadabilityVariance(paragraphTexts);

  const baseReliability = Math.min(1, totalWords / 100);
  const advancedReliability = Math.min(1, totalWords / 200);

  const features: FeatureSet = {
    lexical: {
      typeTokenRatio: {
        value: Math.min(1, Math.max(0, statistics.typeTokenRatio)),
        available: true,
        reliability: baseReliability,
      },
      hapaxLegomenaRatio: {
        value: Math.min(1, Math.max(0, hapaxRatio)),
        available: true,
        reliability: baseReliability,
      },
      averageWordLength: {
        value: statistics.averageWordLength,
        available: true,
        reliability: baseReliability,
      },
      functionWordRatio: {
        value: Math.min(1, Math.max(0, functionWordRatio)),
        available: true,
        reliability: baseReliability,
      },
    },
    syntactic: {
      averageSentenceDepth: {
        value:
          segments.sentences.length > 0 ? (commas + conjunctions) / segments.sentences.length : 0,
        available: true,
        reliability: baseReliability,
      },
      conjunctionRate: {
        value: Math.min(1, Math.max(0, totalWords > 0 ? conjunctions / totalWords : 0)),
        available: true,
        reliability: baseReliability,
      },
      subordinationRatio: { value: 0, available: false, reliability: 0 },
    },
    structural: {
      sentenceLengthCV: { value: sentenceLengthCV, available: true, reliability: baseReliability },
      paragraphLengthCV: {
        value: paragraphLengthCV,
        available: true,
        reliability: baseReliability,
      },
      sentenceLengthUniformity: {
        value: sentenceLengthUniformity,
        available: true,
        reliability: baseReliability,
      },
      paragraphLengthUniformity: {
        value: paragraphLengthUniformity,
        available: true,
        reliability: baseReliability,
      },
    },
    punctuation: {
      commaRate: {
        value: Math.min(1, Math.max(0, totalWords > 0 ? commas / totalWords : 0)),
        available: true,
        reliability: baseReliability,
      },
      semicolonRate: {
        value: Math.min(1, Math.max(0, totalWords > 0 ? semicolons / totalWords : 0)),
        available: true,
        reliability: baseReliability,
      },
      questionMarkRate: {
        value: Math.min(1, Math.max(0, totalWords > 0 ? questions / totalWords : 0)),
        available: true,
        reliability: baseReliability,
      },
      exclamationRate: {
        value: Math.min(1, Math.max(0, totalWords > 0 ? exclamations / totalWords : 0)),
        available: true,
        reliability: baseReliability,
      },
    },
    repetition: {
      wordRepetitionRate: {
        value: Math.min(1, Math.max(0, statistics.repetitionRate)),
        available: true,
        reliability: baseReliability,
      },
      bigramRepetitionRate: {
        value: Math.min(1, Math.max(0, bigramRepRate)),
        available: true,
        reliability: baseReliability,
      },
      trigramRepetitionRate: {
        value: Math.min(1, Math.max(0, trigramRepRate)),
        available: true,
        reliability: baseReliability,
      },
      sentenceStartRepetition: {
        value: Math.min(1, Math.max(0, sentStartRepRate)),
        available: true,
        reliability: baseReliability,
      },
    },
    stylometric: {
      sentenceLengthCV: { value: sentenceLengthCV, available: true, reliability: baseReliability },
      sentenceLengthCv: { value: sentenceLengthCV, available: true, reliability: baseReliability },
      vocabularyRichness: {
        value: Math.min(1, Math.max(0, statistics.typeTokenRatio)),
        available: true,
        reliability: baseReliability,
      },
      punctuationDiversity: {
        value: Math.min(1, Math.max(0, punctuationDiversity)),
        available: true,
        reliability: baseReliability,
      },
      averageParagraphLength: { value: avgParaLen, available: true, reliability: baseReliability },
    },

    // ─── New Feature Groups (Phase 2) ──────────────────────────────────────

    informationTheoretic: {
      charEntropy: {
        value: entropyMetrics.charEntropy,
        available: true,
        reliability: baseReliability,
      },
      wordEntropy: {
        value: entropyMetrics.wordEntropy,
        available: true,
        reliability: baseReliability,
      },
      charBigramEntropy: {
        value: entropyMetrics.charBigramEntropy,
        available: true,
        reliability: advancedReliability,
      },
      entropyRate: {
        value: entropyMetrics.entropyRate,
        available: true,
        reliability: advancedReliability,
      },
      entropyVariance: {
        value: entropyMetrics.entropyVarianceAcrossChunks,
        available: totalWords >= 100,
        reliability: totalWords >= 200 ? advancedReliability : advancedReliability * 0.5,
      },
    },
    distributional: {
      zipfAlpha: {
        value: zipfMetrics.zipfAlpha,
        available: totalWords >= 50,
        reliability: advancedReliability,
      },
      zipfR2: {
        value: zipfMetrics.zipfR2,
        available: totalWords >= 50,
        reliability: advancedReliability,
      },
      zipfDeviation: {
        value: zipfMetrics.zipfDeviation,
        available: totalWords >= 50,
        reliability: advancedReliability,
      },
    },
    burstiness: {
      sentenceLengthFanoFactor: {
        value: burstinessMetrics.sentenceLengthBurstiness,
        available: segments.sentences.length >= 3,
        reliability: baseReliability,
      },
      vocabularyBurstiness: {
        value: burstinessMetrics.vocabularyBurstiness,
        available: totalWords >= 50,
        reliability: advancedReliability,
      },
      topicDrift: {
        value: burstinessMetrics.topicDrift,
        available: segments.paragraphs.length >= 2,
        reliability: advancedReliability,
      },
    },
    readabilityFeatures: {
      fleschKincaidGrade: {
        value: readabilityScores.fleschKincaidGrade,
        available: totalWords >= 30 && statistics.sentences >= 2,
        reliability: baseReliability,
      },
      gunningFogIndex: {
        value: readabilityScores.gunningFogIndex,
        available: totalWords >= 30 && statistics.sentences >= 2,
        reliability: baseReliability,
      },
      automatedReadabilityIndex: {
        value: readabilityScores.automatedReadabilityIndex,
        available: totalWords >= 30 && statistics.sentences >= 2,
        reliability: baseReliability,
      },
      readabilityVariance: {
        value: readabilityVar,
        available: segments.paragraphs.length >= 2,
        reliability: advancedReliability,
      },
    },
  };

  return features;
}
