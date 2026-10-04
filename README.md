# AI Writing Forensic Analyzer 4.0

A production-grade, publication-ready hybrid forensic text analysis system designed for academic integrity screening, peer-review verification, and editorial auditing.

> [!IMPORTANT]
> **Probabilistic & Forensic Disclaimer**: AI writing detection is probabilistic. Scores represent quantifiable linguistic characteristics and statistical predictability rather than incontrovertible proof of authorship. Academic disciplinary actions must never rely solely on automated detectors without human editorial review.

---

## 1. Key Architectural Features (v4.0)

- **Hybrid Deterministic + AI Reasoning Architecture**: Combines reproducible, explainable deterministic statistical feature extraction with a controlled LLM Evidence Reasoning layer (Gemini, OpenAI, Claude, Local LLMs, or deterministic Mock).
- **11 Modular Forensic Detectors**:
  1. `StylometricDetector`: Sentence length variance, rhythm, and burstiness.
  2. `LexicalDiversityDetector`: TTR, Root TTR, and Hapax Legomena ratio.
  3. `StructuralRegularityDetector`: Syntactic regularity and clausal parallelism.
  4. `RepetitionDetector`: Lexical and phrase repetition density.
  5. `PredictabilityProxyDetector`: N-gram entropy and Zipf conformity.
  6. `AIPatternDetector`: High-severity LLM rhetorical signatures and discourse markers.
  7. `HumanIrregularityDetector`: Idiosyncratic spelling, colloquialisms, and natural human disfluencies.
  8. `ReadabilityConsistencyDetector`: Variance across Flesch-Kincaid, Gunning-Fog, and ARI.
  9. `DistributionalConformityDetector`: Power-law rank-frequency conformity.
  10. `SemanticDetector`: Cosine similarity and semantic cohesion across adjacent sentences.
  11. `StyleDiscontinuityDetector`: Sliding-window boundary shift analysis for mixed-authorship detection.
- **Scientific Evidence Fusion**:
  - Collinearity & redundancy penalties discounting correlated detector groups.
  - Epistemic uncertainty quantification across 5 distinct factors.
  - Dual evidence pools separating AI-associated and Human-associated signals.
  - Mandatory abstention policy (`inconclusive`) for short texts or conflicting evidence.
- **Formal Probability Calibration**:
  - Platt / Logistic regression scaling fitting calibration profiles to labeled validation data.
  - Clear epistemic distinction: `forensicSignal` (uncalibrated) vs `calibratedProbability`.
  - Reliability verification calculating Brier Score and Expected Calibration Error (ECE).
- **Comprehensive Document Support**:
  - Full native file extraction for `.docx`, `.pdf`, and `.txt` documents.
  - In-browser color-coded Academic PDF Examination Certificate generation.
  - Built-in persistent usage and analytics dashboard.

---

## 2. Monorepo Organization

```text
├── apps/
│   ├── api/                 # Express REST API (analyze, file upload, analytics)
│   └── web/                 # React + Vite frontend with Expert Diagnostic Mode
├── packages/
│   ├── shared/              # Canonical v4.0.0 Zod schemas and TypeScript types
│   ├── core/                # Deterministic detectors, fusion engine, AI reasoning layer
│   ├── file-processing/     # DOCX, PDF, and TXT document extraction pipelines
│   └── benchmark/           # Accuracy, Precision, Recall, Specificity, F1, ROC-AUC, Brier, ECE
├── data/
│   └── benchmark/           # Labeled multi-genre benchmark datasets
├── docs/                    # Architecture, Methodology, Calibration, and Limitations docs
└── scripts/                 # Acceptance test suites, validation, and benchmarking scripts
```

---

## 3. Quick Start

### Prerequisites
- Node.js >= 22.0.0
- npm >= 10.0.0

Verify your runtime:
```bash
npm run check:runtime
```

### Installation
```bash
npm install
```

### Development
Launch both the API and Web UI concurrently:
```bash
npm run dev
```
- Web Application: `http://localhost:3000`
- REST API Server: `http://localhost:3001`

---

## 4. Verification & Benchmarking Suite

Run unit and integration tests:
```bash
npm test
```

Run Track A engineering acceptance suite:
```bash
npm run test:engineering
```

Run benchmark dataset validation:
```bash
npm run dataset:validate
```

Run full multi-category benchmark:
```bash
npm run benchmark
```

Run calibration training and validation:
```bash
npm run test:accuracy
npm run test:accuracy:validation
npm run test:accuracy:final
```

Run complete CI verification pipeline:
```bash
npm run ci
```

---

## 5. Documentation Links

- [Architecture Specification](docs/ARCHITECTURE.md)
- [Mathematical Methodology](docs/METHODOLOGY.md)
- [Calibration & Reliability](docs/CALIBRATION.md)
- [Benchmarking Protocol](docs/BENCHMARKING.md)
- [Limitations & Epistemic Boundaries](docs/LIMITATIONS.md)
- [Architecture Audit & Migration Log](docs/ARCHITECTURE_AUDIT.md)
