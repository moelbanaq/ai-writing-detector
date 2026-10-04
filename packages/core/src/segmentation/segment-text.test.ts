import { describe, expect, it } from 'vitest';
import { segmentText } from './segment-text.js';

describe('segmentText', () => {
  it('basic sentence segmentation', () => {
    const segments = segmentText('First. Second. Third.');
    expect(segments.sentences.length).toBeGreaterThanOrEqual(3);
  });
  it('paragraph segmentation', () => {
    const segments = segmentText('Para one.\n\nPara two.');
    expect(segments.paragraphs.length).toBeGreaterThanOrEqual(2);
  });
  it('Arabic text segmentation', () => {
    const segments = segmentText('مرحبا. كيف حالك؟');
    expect(segments.sentences.length).toBeGreaterThanOrEqual(2);
  });
  it('single sentence text', () => {
    const segments = segmentText('Just one sentence.');
    expect(segments.sentences.length).toBe(1);
  });
  it('text with no final period', () => {
    const segments = segmentText('This has no period');
    expect(segments.sentences.length).toBe(1);
  });
  it('abbreviations', () => {
    const segments = segmentText('Mr. Smith went to Washington. Mrs. Doe went to NY.');
    expect(segments.sentences.length).toBeGreaterThanOrEqual(2);
  });
  it('URL detection', () => {
    const segments = segmentText('Check out https://google.com for more.');
    expect(segments.urlRegions.length).toBeGreaterThanOrEqual(1);
  });
  it('code region detection', () => {
    const segments = segmentText('Here is code:\n```\nconst x = 1;\n```\nDone.');
    expect(segments.codeRegions.length).toBeGreaterThanOrEqual(1);
  });
});
