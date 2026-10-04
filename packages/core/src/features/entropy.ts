/**
 * Interface representing the calculated entropy metrics.
 */
export interface EntropyMetrics {
  charEntropy: number;
  wordEntropy: number;
  charBigramEntropy: number;
  entropyRate: number;
  entropyVarianceAcrossChunks: number;
}

/**
 * Calculates the Shannon entropy for a given array of string items.
 *
 * @param items - The items to calculate entropy over.
 * @returns The calculated Shannon entropy.
 */
function calculateShannonEntropy(items: string[]): number {
  if (items.length === 0) return 0;
  
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }

  let entropy = 0;
  const total = items.length;
  for (const count of counts.values()) {
    const p = count / total;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

/**
 * Calculates the population variance of an array of numbers.
 *
 * @param values - The numbers to calculate variance for.
 * @returns The population variance.
 */
function calculateVariance(values: number[]): number {
  if (values.length < 2) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Computes information-theoretic metrics for AI text detection.
 *
 * @param text - The full input text.
 * @param words - An array of words extracted from the text.
 * @returns An object containing the calculated entropy metrics.
 */
export function calculateEntropy(text: string, words: string[]): EntropyMetrics {
  // Edge case: Empty input
  if (text.length === 0 || words.length === 0) {
    return {
      charEntropy: 0,
      wordEntropy: 0,
      charBigramEntropy: 0,
      entropyRate: 0,
      entropyVarianceAcrossChunks: 0,
    };
  }

  // Preprocessing for characters (lowercase, ignore whitespace)
  const chars = text.toLowerCase().replace(/\s/g, '').split('');
  
  // a) charEntropy
  const charEntropy = calculateShannonEntropy(chars);

  // b) wordEntropy
  const wordEntropy = calculateShannonEntropy(words);

  // c) charBigramEntropy
  const charBigrams: string[] = [];
  for (let i = 0; i < chars.length - 1; i++) {
    charBigrams.push((chars[i] ?? '') + (chars[i + 1] ?? ''));
  }
  const charBigramEntropy = calculateShannonEntropy(charBigrams);

  // d) entropyRate (Conditional entropy H(X|Y) = H(X,Y) - H(Y))
  // H(bigrams) - H(unigrams)
  let entropyRate = 0;
  if (chars.length > 1) {
    entropyRate = charBigramEntropy - charEntropy;
    // Handle floating point inaccuracies potentially making it slightly negative
    if (entropyRate < 0) entropyRate = 0;
  }

  // e) entropyVarianceAcrossChunks
  const chunkSize = 100;
  const chunkEntropies: number[] = [];
  
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize);
    if (chunk.length > 0) {
      chunkEntropies.push(calculateShannonEntropy(chunk));
    }
  }
  
  const entropyVarianceAcrossChunks = calculateVariance(chunkEntropies);

  return {
    charEntropy,
    wordEntropy,
    charBigramEntropy,
    entropyRate,
    entropyVarianceAcrossChunks,
  };
}
