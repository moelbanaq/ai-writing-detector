import { describe, expect, it } from 'vitest';
import { analyzeText } from '../../../packages/core/src/index.js';

describe('analysis-pipeline', () => {
  it('analyzeText with human-casual', () => {
    const text = 'Just a casual human typing some stuff. Not too formal.';
    const report = analyzeText({ text });
    expect(report).toBeDefined();
    expect(report.classification).toBeDefined();
  });
  it('analyzeText with arabic-msa', () => {
    const text = 'نص عربي للتجربة والاختبار للتحليل.';
    const report = analyzeText({ text });
    expect(report.language.primary).toBe('ar');
  });
  it('analyzeText with short-20-words', () => {
    const text =
      'This is a short text that has exactly twenty words or maybe a little less to test confidence bounds properly.';
    const report = analyzeText({ text });
    expect(report.confidence.score).toBeLessThanOrEqual(0.35);
  });
  it('analyzeText with medium-500-words', () => {
    const text = 'word '.repeat(500);
    const report = analyzeText({ text });
    expect(report.evidence).toBeDefined();
  });
  it('empty text throws', () => {
    expect(() => analyzeText({ text: '' })).toThrow();
  });
  it('whitespace text throws', () => {
    expect(() => analyzeText({ text: '   \n  ' })).toThrow();
  });
  it('determinism', () => {
    const text = 'Some standard text to test determinism across multiple runs. '.repeat(10);
    const r1 = analyzeText({ text });
    for (let i = 0; i < 4; i++) {
      const r2 = analyzeText({ text });
      expect(r2.classification).toEqual(r1.classification);
    }
  });
  it('detectors valid results', () => {
    const text = 'Some standard text to test valid results and no NaN. '.repeat(10);
    const report = analyzeText({ text });
    report.detectors.forEach((r) => {
      expect(Number.isNaN(r.score)).toBe(false);
    });
  });
  it('special characters', () => {
    const text = 'Special chars: @#$%^&*()_+{}|:"<>?~`-=[]\\;\',./';
    expect(() => analyzeText({ text })).not.toThrow();
  });
  it('mixed arabic english works', () => {
    const text = 'Mixed text هنا اختبار English words mixed together in one sentence.';
    const report = analyzeText({ text });
    expect(report).toBeDefined();
  });
});
