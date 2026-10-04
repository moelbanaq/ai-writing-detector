export function createTestInput(text, options) {
  return { text, ...options };
}
export function expectFiniteNumber(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Expected ${name} to be a finite number, got: ${value}`);
  }
}
export function expectBounded(value, min, max, name) {
  if (value < min || value > max) {
    throw new Error(`Expected ${name} to be in [${min}, ${max}], got: ${value}`);
  }
}
export function expectValidDetectorResult(result, name) {
  if (result.score !== null) {
    expectFiniteNumber(result.score, `${name}.score`);
    expectBounded(result.score, 0, 1, `${name}.score`);
  }
  expectFiniteNumber(result.confidence, `${name}.confidence`);
  expectBounded(result.confidence, 0, 1, `${name}.confidence`);
  expectFiniteNumber(result.reliability, `${name}.reliability`);
  expectBounded(result.reliability, 0, 1, `${name}.reliability`);
}
//# sourceMappingURL=index.js.map
