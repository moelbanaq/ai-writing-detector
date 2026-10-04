# Testing Strategy & Guidelines

## Two-Track Validation Model

The project strictly separates software engineering correctness from detection accuracy:

- **Track A (Engineering Correctness)**:
  - Answers: _Does the software execute correctly and deterministically without crashes, schema violations, or unhandled exceptions?_
  - Tested on every PR and CI execution.
  - Command: `npm run test:engineering`
  - Output: `reports/engineering/ENGINEERING_TEST_REPORT.json`

- **Track B (Detection Accuracy & Benchmark)**:
  - Answers: _How well do the underlying signals distinguish human-written from AI-generated text on held-out benchmarks?_
  - Tested on scheduled runs and releases; NEVER tuned against the final test set.
  - Command: `npm run test:accuracy`

## Test Execution Commands

```bash
# Run unit and integration tests (Vitest)
npm test

# Run Track A Engineering Acceptance Suite
npm run test:engineering

# Run full CI check (Format, Lint, Typecheck, Test, Track A, Build)
npm run ci
```
