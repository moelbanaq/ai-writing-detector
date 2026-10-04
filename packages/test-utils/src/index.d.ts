import type { AnalysisInput } from '@ai-detector/shared';
export declare function createTestInput(
  text: string,
  options?: Partial<AnalysisInput>,
): AnalysisInput;
export declare function expectFiniteNumber(value: unknown, name: string): void;
export declare function expectBounded(value: number, min: number, max: number, name: string): void;
export declare function expectValidDetectorResult(
  result: {
    score: number | null;
    confidence: number;
    reliability: number;
  },
  name: string,
): void;
//# sourceMappingURL=index.d.ts.map
