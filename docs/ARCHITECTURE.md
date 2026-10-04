# Architecture Specification: AI Writing Forensic Analyzer 4.0

## 1. System Overview

AI Writing Forensic Analyzer 4.0 is a **production-grade hybrid system** engineered for editorial, scientific, and academic integrity screening. It rejects simplistic black-box heuristics in favor of a dual-engine architecture:
1. **Deterministic & Statistical Forensic Engine**: Extracts reproducible, explainable linguistic measurements across 11 specialized detector families.
2. **AI Forensic Evidence Reasoning Layer**: An optional, bounded evidence analyst (using LLMs such as Google Gemini, OpenAI, Claude, or local Ollama/LM Studio) that evaluates structured metrics, detects contradictions, explores alternative human explanations (ESL, templates), and checks for adversarial tampering.

```text
                                  INPUT TEXT / DOCUMENT
                                            │
                                            ▼
                              ┌───────────────────────────┐
                              │ PREPROCESSING & EXTRACTION│
                              │ Language (CLDR/N-gram)    │
                              │ Normalization & Cleaning  │
                              │ Sentence/Paragraph Slicing│
                              └─────────────┬─────────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
       ┌───────────────────────────┐                 ┌───────────────────────────┐
       │ DETERMINISTIC FORENSICS   │                 │ AI REASONING LAYER        │
       │                           │                 │                           │
       │ • Stylometry (Variance)   │                 │ • 8-Step Forensic Review  │
       │ • Lexical Diversity (TTR) │                 │ • Alternative Human Causes│
       │ • Syntax Regularity       │                 │ • Adversarial Review      │
       │ • Repetition & Burstiness │                 │ • Detector Conflicts      │
       │ • Predictability Proxy    │                 │ • Segment Consistency     │
       │ • Information Entropy     │                 │                           │
       │ • Zipf Conformity         │                 │ (Strict Schema Enforced;  │
       │ • Semantic Cohesion       │                 │  Bounded Influence ≤ 20%) │
       │ • Style Discontinuity     │                 │                           │
       └─────────────┬─────────────┘                 └─────────────┬─────────────┘
                     │                                             │
                     └──────────────────────┬──────────────────────┘
                                            ▼
                              ┌───────────────────────────┐
                              │      EVIDENCE FUSION      │
                              │                           │
                              │ • Collinearity Penalties  │
                              │ • Epistemic Uncertainty   │
                              │ • Dual Evidence Pools     │
                              │ • Logistic Calibration    │
                              │ • Mandatory Abstention    │
                              └─────────────┬─────────────┘
                                            ▼
                              ┌───────────────────────────┐
                              │     FINAL ASSESSMENT      │
                              │                           │
                              │ • AI Likely (Signal ≥ 0.8)│
                              │ • Human Likely (≤ 0.25)   │
                              │ • AI-Edited / Mixed       │
                              │ • Inconclusive (Abstained)│
                              └───────────────────────────┘
```

---

## 2. Core Modules & Packages

The workspace is organized into a modular TypeScript monorepo (`npm` workspaces):

### `packages/shared`
- Defines the canonical **Schema v4.0.0** (`REPORT_SCHEMA_VERSION = '4.0.0'`).
- Provides strict Zod runtime validation schemas for reports, uncertainty models, evidence pools, discontinuity results, and reasoning outputs.
- Houses shared TypeScript interfaces ensuring end-to-end type safety between backend, workers, and frontend.

### `packages/core`
The computational heart of the system:
- **`analysis/`**: Orchestrates preprocessing, feature extraction, detector execution, fusion, and optional reasoning.
- **`detectors/`**: 11 detector classes implementing the standard `Detector` contract:
  - `StylometricDetector`: Sentence length variance and structural rhythm.
  - `LexicalDiversityDetector`: TTR, Root TTR, Hapax Legomena ratio.
  - `StructuralRegularityDetector`: Parse tree proxy and clausal balance.
  - `RepetitionDetector`: Word and phrase burstiness.
  - `PredictabilityProxyDetector`: N-gram entropy and Zipf conformity.
  - `AIPatternDetector`: High-severity LLM rhetorical and discourse markers.
  - `HumanIrregularityDetector`: Idiosyncratic spelling, colloquialisms, and natural human disfluencies.
  - `ReadabilityConsistencyDetector`: Variance across Flesch-Kincaid, Gunning-Fog, ARI.
  - `DistributionalConformityDetector`: Uniformity of word frequency distributions.
  - `SemanticDetector`: Cosine similarity and lexical overlap of adjacent sentences.
  - `StyleDiscontinuityDetector`: Sliding-window variance detecting heterogeneous human-AI composition boundaries.
- **`fusion/`**:
  - `runForensicFusion`: Aggregates active detectors, applies collinearity discounts between correlated families (e.g. rhetorical vs structural), computes detector agreement/dispersion, and builds separate `aiEvidence` and `humanEvidence` pools.
  - `calculateUncertainty`: Multi-factor epistemic uncertainty quantification (disagreement, sample length, language confidence, feature coverage, calibration state).
  - `applyCalibration`: Platt/logistic scaling translating raw evidence into formal probabilities.
- **`reasoning/`**:
  - Provider adapters: `GeminiReasoningProvider`, `OpenAIReasoningProvider`, `AnthropicReasoningProvider`, `LocalReasoningProvider` (Ollama/LM Studio), `MockReasoningProvider`.
  - `routeReasoning`: Intelligent cost-saving router bypassing unambiguous texts.
  - `synthesizeForensicAndReasoning`: Bounded synthesis guaranteeing LLM output cannot override empirical reality.

### `packages/file-processing`
- Document extraction pipeline for `.pdf`, `.docx`, `.doc`, and `.txt` files with quality scoring and layout preservation.

### `packages/benchmark`
- Scientific benchmarking library: Accuracy, Precision, Recall, Specificity, F1, ROC-AUC, Brier score, Expected Calibration Error (ECE), and Confusion Matrix.

### `apps/api`
- Express REST API (`POST /api/analyze`, `POST /api/analyze/file`, `GET /api/analytics`) supporting asynchronous streaming, rate limiting, and visitor telemetry.

### `apps/web`
- React/Vite responsive interface featuring:
  - Text and file upload processing (.docx, .pdf, .txt).
  - Overall verdict card with calibration badges.
  - **Expert Diagnostic Mode** displaying uncertainty metrics, raw forensic signals, dual evidence pools, and reasoning traces.
  - Interactive sentence-level tell highlighting.
  - In-browser color-coded Academic PDF Examination Certificate generation.
  - Persistent usage and analytics dashboard.

---

## 3. Strict Boundary Rules

1. **Forensic Signal ≠ Calibrated Probability**: A score is marked as `not_calibrated` unless empirically trained on labeled external datasets.
2. **Mandatory Abstention**: Texts shorter than 60 words, texts with high epistemic uncertainty (score ≥ 0.70), or high detector contradiction default to `inconclusive`.
3. **Prompt Injection Defense**: All input text passed to AI reasoning providers is wrapped in boundary delimiters and treated as passive untrusted data.
