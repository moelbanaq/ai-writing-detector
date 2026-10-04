import { describe, expect, it } from 'vitest';
import { calculateTextStatistics } from './text-statistics.js';
import { segmentText } from '../segmentation/segment-text.js';

describe('calculateTextStatistics', () => {
  it('handles exact word match', () => {
    const text = 'Hello world this is a test.';
    const segments = segmentText(text);
    const stats = calculateTextStatistics(text, segments);
    expect(stats.words).toBe(6);
  });
  it('sentence count', () => {
    const text = 'Hello world. This is a test.';
    const segments = segmentText(text);
    const stats = calculateTextStatistics(text, segments);
    expect(stats.sentences).toBe(2);
  });
  it('paragraph count', () => {
    const text = 'Hello world.\n\nThis is a test.';
    const segments = segmentText(text);
    const stats = calculateTextStatistics(text, segments);
    expect(stats.paragraphs).toBe(2);
  });
  it('average sentence length', () => {
    const text = 'One two. Three four five.';
    const segments = segmentText(text);
    const stats = calculateTextStatistics(text, segments);
    expect(stats.averageSentenceLength).toBe(2.5);
  });
  it('type-token ratio is between 0 and 1', () => {
    const text = 'This is a test this is only a test';
    const segments = segmentText(text);
    const stats = calculateTextStatistics(text, segments);
    expect(stats.typeTokenRatio).toBeGreaterThanOrEqual(0);
    expect(stats.typeTokenRatio).toBeLessThanOrEqual(1);
  });
  it('empty text handling', () => {
    const text = '';
    const segments = segmentText(text);
    const stats = calculateTextStatistics(text, segments);
    expect(stats.words).toBe(0);
    expect(stats.sentences).toBe(0);
  });
  it('Arabic text valid stats', () => {
    const text = 'مرحبا بالعالم. هذا اختبار.';
    const segments = segmentText(text);
    const stats = calculateTextStatistics(text, segments);
    expect(stats.words).toBeGreaterThan(0);
    expect(stats.sentences).toBe(2);
  });
  it('determinism', () => {
    const input = 'Deterministic test input.';
    const stats1 = calculateTextStatistics(input, segmentText(input));
    const stats2 = calculateTextStatistics(input, segmentText(input));
    expect(stats1).toEqual(stats2);
  });
});
