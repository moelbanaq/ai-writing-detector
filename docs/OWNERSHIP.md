# Code and Subsystem Ownership Matrix

| Area / Subsystem            | Directory                   | Primary Owner      | Responsibility                                  |
| --------------------------- | --------------------------- | ------------------ | ----------------------------------------------- |
| Frontend Application        | `apps/web/`                 | Frontend Team      | Web UI, responsive UX, visual components        |
| API Server                  | `apps/api/`                 | Backend Team       | REST API endpoints, routing, request validation |
| Core Analysis Engine        | `packages/core/`            | NLP/ML Engineering | Text pipeline, feature extraction, detectors    |
| Shared Types & Schemas      | `packages/shared/`          | Core Architecture  | Canonical report contracts, Zod schemas, errors |
| File Processing             | `packages/file-processing/` | Backend Team       | TXT, DOCX, and PDF text extraction adapters     |
| Benchmark Engine            | `packages/benchmark/`       | ML Evaluation Lead | Classification metrics, validation harnesses    |
| Test Utilities              | `packages/test-utils/`      | QA / Engineering   | Test fixtures, builders, schema assertions      |
| Engineering Tests (Track A) | `tests/engineering/`        | QA / Engineering   | Regression tests, software correctness          |
| Accuracy Tests (Track B)    | `tests/accuracy/`           | ML Evaluation Lead | Model validation, held-out test evaluation      |
| CI / Automation             | `.github/`                  | DevOps             | Continuous integration, release validation      |
| Documentation               | `docs/`                     | Technical Writing  | Architecture, API, and compliance documentation |
