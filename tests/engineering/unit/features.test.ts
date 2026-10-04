import { describe, expect, it } from 'vitest';
import { analyzeText } from '../../../packages/core/src/index.js';

describe('features', () => {
  it('Features are returned as FeatureSet', () => {
    const features = analyzeText({ text: 'Sample text for feature extraction.' }).features;
    expect(features).toBeDefined();
  });
  it('All numeric values are finite', () => {
    const features = analyzeText({ text: 'Sample text for feature extraction.' }).features as any;
    for (const cat in features) {
      for (const key in features[cat]) {
        if (typeof features[cat][key]?.value === 'number') {
          expect(Number.isFinite(features[cat][key].value)).toBe(true);
        }
      }
    }
  });
  it('No NaN values', () => {
    const features = analyzeText({ text: 'Sample text for feature extraction.' }).features as any;
    for (const cat in features) {
      for (const key in features[cat]) {
        if (typeof features[cat][key]?.value === 'number') {
          expect(Number.isNaN(features[cat][key].value)).toBe(false);
        }
      }
    }
  });
  it('Feature values change when input changes', () => {
    const f1 = analyzeText({ text: 'Short text.' }).features;
    const f2 = analyzeText({
      text: 'A much longer text that should produce entirely different feature values than the short text.',
    }).features;
    expect(f1).not.toEqual(f2);
  });
});
