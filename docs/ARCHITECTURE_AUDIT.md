# Architecture Audit: AI Writing Forensic Analyzer (Pre-4.0 Baseline)

## Executive Summary
This document provides an exhaustive architectural inspection and technical audit of the AI Writing Forensic Analyzer codebase prior to implementing the **4.0 Hybrid Forensic & AI Reasoning Architecture**. 

The existing system provides a solid foundation of deterministic stylometric and information-theoretic extractors (Shannon entropy, Zipf's Law, sentence burstiness, readability grades) alongside a weighted rhetorical clichés matcher and an Express/React web platform. However, the audit revealed significant architectural challenges: heuristic log-odds fusion masquerading as scientific probability without external calibration, severe collinearity among syntactic detectors, the absence of an AI reasoning interpretation layer, lack of style discontinuity detection for mixed-authorship texts, and missing benchmark suites.

---

## 1. System Inventory & Metadata

| Attribute | Observed Implementation | Target v4.0 Specification |
| :--- | :--- | :--- |
| **Package Manager** | `npm` (npm workspaces: `apps/*`, `packages/*`) | `npm` workspaces (preserved) |
| **Node.js Runtime** | Current active: v24.21.0 (engines: `>=22.0.0`) | Node.js `>=20.0.0` compatible |
| **TypeScript Version** | `typescript: ^6.0.3` with project references (`tsc -b`) | Strict TypeScript 5.x / 6.x |
| **Frontend Framework** | React 18/19 SPA with Vite, custom CSS (`App.css`) | React SPA + Expert Mode + Evidence Panels |
| **Backend Architecture**| Express 5 (`unified-server.ts`) with modular routes | Express REST API + Provider Abstraction |
| **Current Schema Version** | Inconsistent: `2.0.0` in shared, `3.0.0` in metadata | Unified `4.0.0` with semantic versioning |
| **Current Test Suite** | 10 vitest test files, 71 unit tests passing | Unit + Integration + Adversarial + Benchmark |

---

## 2. Component-by-Component Findings

### 2.1 Preprocessing & Segmentation
- **Normalization** (`packages/core/src/preprocessing/normalize-text.ts`): Handles CRLF line endings, NFC Unicode normalization, and repeated whitespace collapse.
- **Language Detection** (`packages/core/src/language/detect-language.ts`): Uses stopword density for English, French, Spanish, German, and Arabic.
- **Segmentation** (`packages/core/src/segmentation/segment-text.ts`): Splits paragraphs by `\n\s*\n` and sentences by regex delimiters (`[.!?。！？]`).
  - *Weakness*: Does not extract structural windows (e.g. 3-sentence sliding windows) or detect section headers/footnotes accurately.
  - *Weakness*: No style discontinuity detector across segment boundaries.

### 2.2 Feature Extraction
- **Features Extracted** (`packages/core/src/features/`):
  - `burstiness.ts`: Sentence length Fano factor ($\sigma^2 / \mu$).
  - `entropy.ts`: Shannon token entropy, character entropy, 50-word chunk entropy variance.
  - `readability.ts`: Flesch Reading Ease, Flesch-Kincaid Grade Level, Gunning Fog, ARI.
  - `zipf.ts`: Linear regression on $\log(\text{rank})$ vs $\log(\text{frequency})$ ($R^2$ and slope $\alpha$).
  - `extract-features.ts`: TTR, hapax ratio, n-gram repetitions.
  - *Strength*: Deterministic, zero external ML dependencies, reproducible.
  - *Weakness*: Lacks syntactic parse depth (e.g. passive voice ratio, POS distribution, clausal subordination index).

### 2.3 Detector Modules (9 Active Detectors)
1. `StylometricDetector`: Sentence length CV, token entropy, sentence cosine similarity.
2. `LexicalDiversityDetector`: TTR, hapax legomena, content word ratio.
3. `StructuralRegularityDetector`: Sentence length CV, paragraph length CV.
4. `RepetitionDetector`: Bigram, trigram, and sentence-start repetition.
5. `PredictabilityProxyDetector`: Entropy variance, Zipf $R^2$, transition density, AI phrase density.
6. `AIPatternDetector`: List density and weighted AI rhetorical clichés from `detection-rules.ts`.
7. `HumanIrregularityDetector`: Contractions, fillers, personal pronouns, burstiness ($1 - \text{score}$).
8. `ReadabilityConsistencyDetector`: Syllables/word variance across sentences, sentence length CV.
9. `DistributionalConformityDetector`: Zipf $R^2$ conformity and slope $\alpha$.

---

## 3. Critical Weaknesses & Scientific Flaws Identified

### 3.1 Conflation of Heuristic Signals with Calibrated Probabilities
- In `run-ensemble.ts` and `analyze.ts`, the output of the Bayesian log-odds accumulator (`aiLikelihood = fromLogOdds(logOddsAccum)`) is directly assigned to `report.classification.aiLikelihood` and reported as a percentage probability.
- **Scientific Violation**: This score is an uncalibrated heuristic evidence signal. Calling it a "probability" violates forensic standards unless a formal calibration profile (e.g. Platt scaling / logistic regression) has been fitted on labeled external validation data.

### 3.2 Detector Collinearity and Duplicate Evidence Weighting
- `sentenceLengthCV` is computed and used as primary evidence simultaneously in `stylometric.ts`, `structural-regularity.ts`, and `readability-consistency.ts`.
- `Zipf R²` is evaluated simultaneously in `predictability-proxy.ts` and `distributional-conformity.ts`.
- `AI rhetorical phrases` are evaluated simultaneously in `ai-pattern.ts`, `predictability-proxy.ts`, and `sentence-analyzer.ts`.
- In `run-ensemble.ts`, each of these detectors independently adds log-odds into the accumulator, effectively triple-counting the same underlying textual variance.

### 3.3 Sentence-Level Blending Hack
- In `packages/core/src/analysis/analyze.ts` (lines 88–110), when `highAiRatio >= 0.35`, the engine overrides the ensemble score with an ad-hoc formula:
  $$\text{score} = \text{ensemble} \times (1 - w) + \text{avgSentence} \times w$$
  where $w = \min(0.85, 0.45 + \text{ratio} \times 0.4)$.
- While effective as a quick heuristic, this hard-coded override bypasses the statistical fusion layer and lacks formal validation.

### 3.4 Complete Absence of AI Reasoning Layer
- There is currently no second-opinion AI Reasoning Engine to interpret contradictory evidence, identify genre constraints (e.g. formal scientific or legal prose), or evaluate alternative human explanations (e.g. non-native English, journal templates).

### 3.5 Missing Segment Discontinuity and Mixed-Authorship Detection
- The current engine produces an overall binary/tertiary verdict for the document as a whole. It cannot classify a document as `mixed` when the first half is human and the second half is AI-generated.

### 3.6 Benchmark Scripts Missing in Repository
- `package.json` specifies `"test:accuracy": "tsx scripts/benchmark/run-validation.ts"`, `"benchmark": "tsx scripts/benchmark/run-benchmark.ts"`, but the underlying scripts in `scripts/benchmark/` were not yet implemented.

---

## 4. Proposed Migration Plan to v4.0

```text
               ┌────────────────────────────────────────────────────────┐
               │              AI WRITING FORENSIC ANALYZER 4.0          │
               └──────────────────────────┬─────────────────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     ┌────────────────────────┐                     ┌───────────────────────────┐
     │ 1. DETERMINISTIC CORE  │                     │ 2. AI REASONING LAYER     │
     │ - 10 Independent       │                     │ - Provider Abstraction   │
     │   Detectors            │                     │   (Gemini, OpenAI, Mock)  │
     │ - Style Discontinuity  │                     │ - Structured Evidence     │
     │ - Anti-Collinearity    │                     │   Analyst Prompt          │
     │ - Segment Analysis     │                     │ - Adversarial Challenge   │
     │ - Explicit Pools:      │                     │ - JSON Schema Validation  │
     │   AI vs Human Evidence │                     │ - Prompt Injection Defense│
     └────────────┬───────────┘                     └─────────────┬─────────────┘
                  │                                               │
                  └───────────────────────┬───────────────────────┘
                                          ▼
                             ┌─────────────────────────┐
                             │ 3. EVIDENCE FUSION      │
                             │ - Forensic Signal       │
                             │ - Calibrated Probability│
                             │   (only if profile valid│
                             │ - Uncertainty Model     │
                             │ - Abstention Engine     │
                             │ - Controlled Synthesis  │
                             └────────────┬────────────┘
                                          ▼
                             ┌─────────────────────────┐
                             │ 4. FINAL VERDICT & UI   │
                             │ - Human / AI / Mixed /  │
                             │   Inconclusive          │
                             │ - Traceable Audit Trail │
                             │ - Expert Inspection Mode│
                             │ - Full Color PDF Export │
                             └─────────────────────────┘
```

### Phase 1: Shared Schemas & Core Data Models (`packages/shared`)
- Update schema version to `4.0.0`.
- Define explicit `ReasoningRequest`, `ReasoningResponse`, `EvidencePools` (`aiEvidence`, `humanEvidence`), `StyleDiscontinuityResult`, and `UncertaintyModel`.
- Separate `forensicSignal` (uncalibrated score) from `calibratedProbability`.
- Support `mixed` classification label alongside `human_likely`, `ai_likely`, `ai_edited_likely`, and `inconclusive`.

### Phase 2: Enhanced Forensic Detectors & Discontinuity Engine (`packages/core`)
- Add `StyleDiscontinuityDetector` (`discontinuity.ts`) measuring vocabulary, sentence length, and syntax shifts across sliding windows.
- Refactor `runEnsemble` with anti-collinearity group penalties (grouping stylometric/structural CVs and rhetorical phrases).
- Implement explicit quality gating with abstention recommendations.
- Segment-level analysis returning AI/human likelihood and consistency metrics per segment.

### Phase 3: AI Reasoning Engine & Provider Abstraction (`packages/core` / `packages/reasoning`)
- Create `ReasoningProvider` interface and implement:
  - `MockReasoningProvider` (deterministic, testable without network/keys)
  - `GeminiReasoningProvider` (official Google DeepMind / Google GenAI SDK)
  - `OpenAIReasoningProvider`
  - `AnthropicReasoningProvider`
  - `LocalReasoningProvider`
- Implement `ReasoningRouter`: routes ambiguous cases, style discontinuities, or high disagreement to the LLM, but bypasses LLM for clear human or clear AI texts to preserve performance and privacy.
- Implement strict JSON schema validation, automated repair, and prompt injection isolation.

### Phase 4: Calibration, Stacking & Uncertainty
- Formalize calibration: Platt scaling, logistic calibration, and isotonic regression.
- Compute uncertainty from detector variance, text quality, calibration state, and LLM disagreement.

### Phase 5: Benchmark Suite & CI
- Build executable benchmark suite in `scripts/benchmark/` covering human, AI (multiple models), mixed, and adversarial datasets.
- Calculate Accuracy, Precision, Recall, Specificity, F1, ROC-AUC, Brier score, and ECE.

### Phase 6: Web UI & Production Deployment
- Add Expert Mode toggle in `apps/web` displaying detector correlations, uncertainty, raw feature vectors, and AI reasoning traces.
- Expose mixed-authorship visualizer on sentence/paragraph maps.
- Rebuild production package in `Internet Publish/`.

---

## 5. Compatibility & Risk Management
- **Backwards Compatibility**: Existing REST endpoint `/api/analyze` will preserve its request signature (`{ text, languageHint, options }`). New v4.0 metadata, AI reasoning, and uncertainty fields will augment the response without breaking existing consumers.
- **Graceful Degradation**: If an AI reasoning provider is disabled, times out, or fails schema validation, the engine seamlessly falls back to forensic-only analysis without crashing.
- **Privacy Assurance**: Text transmission to external LLMs will be gated by `AI_REASONING_ENABLED` (`OFF`, `LOCAL_ONLY`, `EXTERNAL_PROVIDER`), with user consent and redaction options.
