/**
 * Metrics measuring conformity to Zipf's law.
 */
export interface ZipfMetrics {
  zipfAlpha: number;
  zipfR2: number;
  zipfDeviation: number;
}

/**
 * Calculates how well a text conforms to Zipf's law by performing linear regression
 * on log(rank) vs log(frequency) of words.
 *
 * Natural human text typically has an alpha near 1.0 and R² around 0.95-0.98.
 * AI text tends to over-conform with very high R² (0.97-0.99).
 *
 * @param words - An array of words from the text.
 * @returns A ZipfMetrics object containing the alpha (exponent), R² goodness of fit, and deviation from 1.0.
 */
export function calculateZipfConformity(words: string[]): ZipfMetrics {
  if (!words || words.length === 0) {
    return { zipfAlpha: 0, zipfR2: 0, zipfDeviation: 1 };
  }

  // Count word frequencies (case-insensitive)
  const frequencyMap = new Map<string, number>();
  for (const word of words) {
    const w = word.toLowerCase();
    frequencyMap.set(w, (frequencyMap.get(w) || 0) + 1);
  }

  if (frequencyMap.size < 5) {
    return { zipfAlpha: 0, zipfR2: 0, zipfDeviation: 1 };
  }

  // Sort descending by frequency
  const frequencies = Array.from(frequencyMap.values()).sort((a, b) => b - a);
  const n = frequencies.length;

  // Compute log(rank) and log(frequency)
  const x: number[] = new Array(n);
  const y: number[] = new Array(n);

  let sumX = 0;
  let sumY = 0;

  for (let i = 0; i < n; i++) {
    // Rank is i + 1
    const logRank = Math.log(i + 1);
    const logFreq = Math.log(frequencies[i]!);
    
    x[i] = logRank;
    y[i] = logFreq;
    
    sumX += logRank;
    sumY += logFreq;
  }

  // Calculate means
  const meanX = sumX / n;
  const meanY = sumY / n;

  // Calculate terms for slope (alpha) and R²
  let sumXY = 0;
  let sumX2 = 0;
  let ssTot = 0;

  for (let i = 0; i < n; i++) {
    sumXY += x[i]! * y[i]!;
    sumX2 += x[i]! * x[i]!;
    
    const diffY = y[i]! - meanY;
    ssTot += diffY * diffY;
  }
  
  const denominator = (n * sumX2) - (sumX * sumX);
  
  let slope = 0;
  let intercept = 0;
  let r2 = 0;

  if (denominator !== 0) {
    slope = (n * sumXY - sumX * sumY) / denominator;
    intercept = (sumY - slope * sumX) / n;

    let ssRes = 0;
    for (let i = 0; i < n; i++) {
      const yPred = slope * x[i]! + intercept;
      const diffYPred = y[i]! - yPred;
      ssRes += diffYPred * diffYPred;
    }

    if (ssTot !== 0) {
      r2 = 1 - (ssRes / ssTot);
    }
  }

  const zipfAlpha = Math.abs(slope);
  const zipfR2 = r2;
  const zipfDeviation = Math.abs(zipfAlpha - 1.0);

  return {
    zipfAlpha,
    zipfR2,
    zipfDeviation
  };
}
