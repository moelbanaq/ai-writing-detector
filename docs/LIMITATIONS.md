# System Limitations & Epistemic Boundaries

## 1. Ethical & Epistemic Statement

The AI Writing Forensic Analyzer 4.0 is designed as an **editorial diagnostic tool** to assist human peer reviewers, journal editors, and academic integrity officers. It is **NOT** an automated disciplinary authority.

> [!WARNING]
> No computational tool can guarantee 100% certainty regarding the generative origin of a piece of text. Academic disciplinary actions must never be based solely on automated classifier scores.

---

## 2. Recognized Vulnerabilities & Confounding Factors

### A. Non-Native English (ESL) Authorship
Writers using English as a Second Language frequently employ:
- Standardized grammatical templates learned from academic textbooks.
- Limited colloquial idioms or reduced hapax legomena ratios.
- Repetitive transitional phrases (e.g. "Moreover", "Furthermore", "In conclusion").

**Mitigation**: The system penalizes isolated rhetorical marker counts unless corroborated by structural regularity and predictable n-gram entropy across orthogonal detector families. The AI Reasoning layer explicitly checks for ESL writing patterns as an alternative hypothesis.

### B. Highly Constrained Scientific Genres
Certain sections of academic papers (e.g., Materials & Methods, chemical synthesis procedures, legal contracts, patent claims) inherently possess:
- Standardized passive sentence structures.
- Narrow domain-specific vocabulary.
- Extremely low lexical variance across replicate trials.

**Mitigation**: The system inspects document sections and warns reviewers when technical jargon density artificially compresses stylometric variance.

### C. Heavily Edited or Human-Polished Text
When an AI-generated draft is substantively restructured by a human author, or conversely when a human draft is polished using an LLM grammar checker:
- Global stylometric signals become mixed.
- Punctuation burstiness may resemble human writing while sentence continuity resembles AI.

**Mitigation**: The system introduces the `ai_edited_likely` and `mixed` classifications, supported by the `StyleDiscontinuityDetector`, rather than forcing a binary AI vs. Human determination.

### D. Short Texts (< 120 Words)
Statistical power diminishes rapidly as document length decreases. Paragraphs under 60 words cannot reliably support entropy or Zipf curve fitting.

**Mitigation**: Mandatory abstention (`inconclusive`) is enforced for texts under 60 words, and an epistemic uncertainty penalty is applied for texts under 250 words.

---

## 3. Mandatory Abstention Policy

The system abstains from issuing a definitive classification under the following conditions:
1. **Corpus Length Deficit**: Text contains fewer than 60 words.
2. **High Detector Contradiction**: Active detectors disagree strongly (dispersion $> 0.45$).
3. **High Epistemic Uncertainty**: Uncertainty model score $\ge 0.70$.
4. **Unsupported Language**: Document language identification confidence is insufficient.
