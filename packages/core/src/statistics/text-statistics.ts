import type { TextStatistics } from '@ai-detector/shared';
import type { SegmentationResult } from '../segmentation/segment-text.js';
import { calculateReadability } from '../features/readability.js';

export function calculateTextStatistics(
  text: string,
  segments: SegmentationResult,
): TextStatistics {
  const chars = text.length;
  if (chars === 0) {
    return {
      characters: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      averageSentenceLength: 0,
      sentenceLengthVariance: 0,
      sentenceLengthStdDev: 0,
      averageWordLength: 0,
      typeTokenRatio: 0,
      hapaxRatio: null,
      punctuationRate: 0,
      repetitionRate: 0,
      readability: { available: false, score: null, method: null },
    };
  }

  const wordsArray = text.split(/\s+/).filter((w) => w.length > 0);
  const totalWords = wordsArray.length;

  const sentLengths = segments.sentences.map(
    (s) => s.text.split(/\s+/).filter((w) => w.length > 0).length,
  );
  const avgSentLen = sentLengths.length ? totalWords / sentLengths.length : 0;

  let variance = 0;
  if (sentLengths.length > 0) {
    variance =
      sentLengths.reduce((sum, len) => sum + Math.pow(len - avgSentLen, 2), 0) / sentLengths.length;
  }
  const stdDev = Math.sqrt(variance);

  const totalWordChars = wordsArray.reduce((sum, w) => sum + w.length, 0);
  const avgWordLen = totalWords > 0 ? totalWordChars / totalWords : 0;

  const lowerWords = wordsArray.map((w) => w.toLowerCase());
  const uniqueWords = new Set(lowerWords).size;
  const typeTokenRatio = totalWords > 0 ? uniqueWords / totalWords : 0;

  const wordCounts = new Map<string, number>();
  lowerWords.forEach((w) => wordCounts.set(w, (wordCounts.get(w) || 0) + 1));

  let repeatedWordsCount = 0;
  wordCounts.forEach((count) => {
    if (count > 1) repeatedWordsCount += count;
  });
  const repetitionRate = totalWords > 0 ? repeatedWordsCount / totalWords : 0;

  let hapaxCount = 0;
  wordCounts.forEach((count) => {
    if (count === 1) hapaxCount++;
  });
  const hapaxRatio = totalWords > 0 ? hapaxCount / totalWords : 0;

  const punctuationChars = (
    text.match(/[.,;:!?\-()[\]{}"'`/\\@#$%^&*~\u060C\u061B\u061F\u06D4]/g) || []
  ).length;
  const punctuationRate = chars > 0 ? punctuationChars / chars : 0;

  // Readability metrics
  const sentenceCount = segments.sentences.length;
  const readabilityScores =
    totalWords >= 30 && sentenceCount >= 2
      ? calculateReadability(text, totalWords, sentenceCount)
      : null;

  return {
    characters: chars,
    words: totalWords,
    sentences: sentenceCount,
    paragraphs: segments.paragraphs.length,
    averageSentenceLength: avgSentLen,
    sentenceLengthVariance: variance,
    sentenceLengthStdDev: stdDev,
    averageWordLength: avgWordLen,
    typeTokenRatio,
    hapaxRatio,
    punctuationRate,
    repetitionRate,
    readability: readabilityScores
      ? {
          available: true,
          score: readabilityScores.fleschKincaidGrade,
          method: 'flesch-kincaid',
        }
      : { available: false, score: null, method: null },
  };
}
