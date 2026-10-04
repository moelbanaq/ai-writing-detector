import { z } from 'zod';

export const AnalysisInputSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  languageHint: z.string().optional(),
  options: z
    .object({
      includeSegmentAnalysis: z.boolean().optional(),
      maxSegments: z.number().int().positive().optional(),
    })
    .optional(),
});

export type ValidatedAnalysisInput = z.infer<typeof AnalysisInputSchema>;

export const normalizedScore = z
  .number()
  .min(0)
  .max(1)
  .refine((v) => Number.isFinite(v), 'Score must be finite');
