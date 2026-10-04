import { Request, Response, NextFunction } from 'express';
import { AnalysisInputSchema } from '@ai-detector/shared';

export const validateAnalysisInput = (req: Request, res: Response, next: NextFunction): void => {
  const parseResult = AnalysisInputSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: parseResult.error.issues.map((e) => e.message).join(', '),
      },
    });
    return;
  }

  const { text } = parseResult.data;
  if (!text || text.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Text cannot be empty or whitespace-only.',
      },
    });
    return;
  }

  req.body = parseResult.data;
  next();
};
