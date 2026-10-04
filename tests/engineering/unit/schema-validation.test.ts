import { describe, expect, it } from 'vitest';
import { AnalysisReportSchema, AnalysisInputSchema } from '../../../packages/shared/src/index.js';

describe('schema-validation', () => {
  it('Missing required fields fail', () => {
    const result = AnalysisReportSchema.safeParse({ reportId: 'test' });
    expect(result.success).toBe(false);
  });
  it('AnalysisInputSchema validates', () => {
    const result = AnalysisInputSchema.safeParse({ text: 'Valid text input' });
    expect(result.success).toBe(true);
  });
});
