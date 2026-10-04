import type { ReasoningProvider } from './base.js';
import type { ReasoningRequest, ReasoningResponse } from '../types.js';
import { SYSTEM_REASONING_PROMPT, buildReasoningUserPrompt } from '../prompts.js';
import { sanitizeAndParseJson, validateAndFormatReasoningResult } from '../schema.js';

export interface AnthropicConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export class AnthropicReasoningProvider implements ReasoningProvider {
  readonly id = 'anthropic';
  readonly name = 'Anthropic Claude Evidence Analyst';
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(config: AnthropicConfig = {}) {
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY || '';
    this.baseUrl = config.baseUrl || 'https://api.anthropic.com/v1';
    this.model = config.model || process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest';
  }

  async analyzeEvidence(request: ReasoningRequest): Promise<ReasoningResponse> {
    if (!this.apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured.');
    }

    const startTime = Date.now();
    const userPrompt = buildReasoningUserPrompt(request);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), request.timeoutMs || 12000);

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1500,
          system: SYSTEM_REASONING_PROMPT,
          messages: [{ role: 'user', content: userPrompt }],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Anthropic API HTTP ${response.status}: ${errText.slice(0, 200)}`);
      }

      const data = (await response.json()) as any;
      const content = data?.content?.[0]?.text;

      if (!content) {
        throw new Error('Empty response payload from Anthropic model.');
      }

      const latencyMs = Date.now() - startTime;
      const parsedJson = sanitizeAndParseJson(content);
      const validation = validateAndFormatReasoningResult(parsedJson, this.id, this.model, latencyMs);

      if (!validation.success) {
        throw new Error(validation.error);
      }

      return {
        result: validation.result,
        rawResponse: content,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
