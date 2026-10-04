import crypto from 'crypto';

export function generateReportId(): string {
  return crypto.randomUUID();
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

export function isFiniteNumber(val: unknown): val is number {
  return typeof val === 'number' && Number.isFinite(val);
}

export function simpleHash(str: string): string {
  return crypto.createHash('sha256').update(str).digest('hex').substring(0, 16);
}
