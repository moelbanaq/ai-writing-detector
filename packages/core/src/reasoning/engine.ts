import type { AIReasoningResult } from '@ai-detector/shared';
import type { ReasoningProvider, ReasoningRequest } from './types.js';
import { MockReasoningProvider } from './providers/mock.js';
import { GeminiReasoningProvider } from './providers/gemini.js';
import { OpenAIReasoningProvider } from './providers/openai.js';
import { AnthropicReasoningProvider } from './providers/anthropic.js';
import { LocalReasoningProvider } from './providers/local.js';

export function getReasoningProvider(providerId?: string): ReasoningProvider {
  switch (providerId?.toLowerCase()) {
    case 'gemini':
      return new GeminiReasoningProvider();
    case 'openai':
      return new OpenAIReasoningProvider();
    case 'anthropic':
      return new AnthropicReasoningProvider();
    case 'local':
      return new LocalReasoningProvider();
    case 'mock':
    default:
      return new MockReasoningProvider();
  }
}

export async function executeReasoning(
  request: ReasoningRequest,
  providerId = 'mock'
): Promise<{ reasoning: AIReasoningResult | null; error?: string }> {
  try {
    const provider = getReasoningProvider(providerId);
    const response = await provider.analyzeEvidence(request);
    return { reasoning: response.result };
  } catch (err: any) {
    // Graceful degradation: LLM failure never crashes analysis (Section 21)
    return {
      reasoning: null,
      error: err?.message || 'Reasoning provider failure',
    };
  }
}
