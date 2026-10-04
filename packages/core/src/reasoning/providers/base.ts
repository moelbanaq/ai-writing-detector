import type { ReasoningRequest, ReasoningResponse } from '../types.js';

export interface ReasoningProvider {
  readonly id: string;
  readonly name: string;
  analyzeEvidence(request: ReasoningRequest): Promise<ReasoningResponse>;
}
