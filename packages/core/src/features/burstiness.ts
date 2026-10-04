import type { TextRegion } from '@ai-detector/shared';

export interface BurstinessMetrics {
  sentenceLengthBurstiness: number;
  vocabularyBurstiness: number;
  topicDrift: number;
}

/**
 * Calculates document-level burstiness metrics for AI text detection.
 *
 * @param sentences - The sentences in the document.
 * @param paragraphs - The paragraphs in the document.
 * @param words - The words in the document.
 * @returns The burstiness metrics.
 */
export function calculateBurstiness(
  sentences: TextRegion[],
  paragraphs: TextRegion[],
  words: string[],
): BurstinessMetrics {
  const sentenceLengthBurstiness = calculateSentenceLengthBurstiness(sentences);
  const vocabularyBurstiness = calculateVocabularyBurstiness(words);
  const topicDrift = calculateTopicDrift(paragraphs);

  return {
    sentenceLengthBurstiness,
    vocabularyBurstiness,
    topicDrift,
  };
}

/**
 * Computes Fano factor of sentence word-counts.
 * Fano factor = variance / mean
 */
function calculateSentenceLengthBurstiness(sentences: TextRegion[]): number {
  if (sentences.length <= 1) {
    return 1.0;
  }

  const wordCounts = sentences.map(s => {
    const text = s.text.trim();
    if (!text) return 0;
    return text.split(/\s+/).length;
  });

  const sum = wordCounts.reduce((acc, count) => acc + count, 0);
  const mean = sum / wordCounts.length;

  if (mean === 0) {
    return 1.0;
  }

  const squaredDifferences = wordCounts.map(count => (count - mean) ** 2);
  const sumSquaredDifferences = squaredDifferences.reduce((acc, sqDiff) => acc + sqDiff, 0);
  const variance = sumSquaredDifferences / wordCounts.length;

  return variance / mean;
}

/**
 * Measures how unevenly words are distributed across the text.
 * Calculates Jaccard similarity between consecutive chunks of words.
 */
function calculateVocabularyBurstiness(words: string[]): number {
  const chunkCount = 4;
  if (words.length === 0) return 0.5;
  
  const chunkSize = Math.max(1, Math.floor(words.length / chunkCount));
  const chunks: string[][] = [];
  
  for (let i = 0; i < chunkCount; i++) {
    const start = i * chunkSize;
    const end = (i === chunkCount - 1) ? words.length : (i + 1) * chunkSize;
    if (start < words.length) {
      chunks.push(words.slice(start, end));
    }
  }

  if (chunks.length < 2) {
    return 0.5;
  }

  let totalJaccard = 0;
  for (let i = 0; i < chunks.length - 1; i++) {
    const set1 = new Set(chunks[i]);
    const set2 = new Set(chunks[i + 1]);
    
    let intersection = 0;
    for (const item of set1) {
      if (set2.has(item)) {
        intersection++;
      }
    }
    
    const union = set1.size + set2.size - intersection;
    const jaccard = union === 0 ? 0 : intersection / union;
    totalJaccard += jaccard;
  }

  const avgJaccard = totalJaccard / (chunks.length - 1);
  return 1 - avgJaccard;
}

/**
 * Calculates topic drift as the population variance of cosine similarities
 * between consecutive paragraph TF vectors.
 */
function calculateTopicDrift(paragraphs: TextRegion[]): number {
  if (paragraphs.length < 2) {
    return 0;
  }

  const tfVectors = paragraphs.map(p => {
    const tf = new Map<string, number>();
    const text = p.text.trim();
    if (!text) return tf;
    
    const words = text.split(/\s+/);
    for (let word of words) {
      word = word.toLowerCase();
      tf.set(word, (tf.get(word) || 0) + 1);
    }
    return tf;
  });

  const similarities: number[] = [];
  for (let i = 0; i < tfVectors.length - 1; i++) {
    similarities.push(cosineSimilarity(tfVectors[i]!, tfVectors[i + 1]!));
  }

  if (similarities.length === 0) {
    return 0;
  }

  const sum = similarities.reduce((acc, val) => acc + val, 0);
  const mean = sum / similarities.length;

  const sumSquaredDiff = similarities.reduce((acc, val) => acc + (val - mean) ** 2, 0);
  const variance = sumSquaredDiff / similarities.length;

  return variance;
}

/**
 * Computes cosine similarity between two term-frequency vectors.
 */
function cosineSimilarity(vec1: Map<string, number>, vec2: Map<string, number>): number {
  if (vec1.size === 0 || vec2.size === 0) {
    return 0;
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (const [term, freq] of vec1.entries()) {
    dotProduct += freq * (vec2.get(term) || 0);
    norm1 += freq ** 2;
  }

  for (const freq of vec2.values()) {
    norm2 += freq ** 2;
  }

  if (norm1 === 0 || norm2 === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}
