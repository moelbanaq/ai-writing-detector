# Forensic Methodology & Mathematical Foundations

## 1. Scientific Overview

AI Writing Forensic Analyzer 4.0 analyzes written text across multiple independent statistical, distributional, and stylometric dimensions. Large Language Models (LLMs) optimize for next-token probability, causing generated text to exhibit statistical properties distinct from natural human authorship:
- Unnaturally low cross-entropy variance
- Suppressed burstiness across lexical repetitions
- High clausal regularity and balanced sentence rhythms
- Adherence to predictable rhetorical templates
- Artificially uniform semantic progression between sentences

---

## 2. Mathematical Formulations

### A. Stylometric Variance & Burstiness
Human writers naturally vary their sentence lengths based on cognitive pacing, narrative emphasis, and emotional state. In contrast, LLMs maintain smooth, bounded variance.
Given sentence word lengths \( L = \{l_1, l_2, \dots, l_N\} \):

$$\mu_L = \frac{1}{N} \sum_{i=1}^{N} l_i$$

$$\sigma_L^2 = \frac{1}{N} \sum_{i=1}^{N} (l_i - \mu_L)^2$$

$$\text{Burstiness} = \frac{\sigma_L - \mu_L}{\sigma_L + \mu_L} \in [-1, 1]$$

A negative burstiness indicates periodic, hyper-regular sentence lengths typical of machine generation.

### B. Lexical Diversity & Hapax Legomena Ratio
We measure lexical richness using Type-Token Ratio (TTR) adjusted for document length:

$$\text{TTR} = \frac{V}{N_{\text{words}}}$$

$$\text{Root TTR} = \frac{V}{\sqrt{N_{\text{words}}}}$$

$$\text{Hapax Ratio} = \frac{V_1}{V}$$

Where \( V \) is the total vocabulary (unique tokens) and \( V_1 \) is the count of tokens appearing exactly once (hapax legomena). Human writing generally demonstrates higher hapax ratios due to idiosyncratic word choices and specialized topic vocabulary.

### C. Shannon Information Entropy & Zipf Regularity
For an \( n \)-gram distribution with probabilities \( p(x_i) \):

$$H(X) = -\sum_{i=1}^{K} p(x_i) \log_2 p(x_i)$$

In accordance with Zipf's Law, the frequency \( f(r) \) of an item of rank \( r \) should satisfy:

$$f(r) \propto r^{-\alpha}, \quad \alpha \approx 1.0$$

The Distributional Conformity detector measures the mean squared deviation between the empirical log-rank log-frequency curve and the ideal power-law slope.

### D. Semantic Cohesion via Adjacent Sentence Overlap
Adjacent sentences in LLM text exhibit continuous, smooth topic continuity without abrupt associative leaps:

$$\text{Sim}(S_i, S_{i+1}) = \frac{|T_i \cap T_{i+1}|}{\sqrt{|T_i| \cdot |T_{i+1}|}}$$

Where \( T_i \) is the set of content words (non-stopwords) in sentence \( i \). Unnaturally consistent cosine cohesion across consecutive sentence pairs indicates machine synthesis.

### E. Style Discontinuity & Boundary Shift Analysis
For mixed-authorship detection, a sliding window of size \( W \) evaluates shifts across consecutive blocks:

$$\Delta_{\text{shift}} = w_1 \Delta_{\text{len}} + w_2 \Delta_{\text{TTR}} + w_3 \Delta_{\text{punct}} + w_4 \Delta_{\text{function}}$$

Where \( \Delta_{\text{function}} \) measures the divergence in common function word frequency. A localized peak \( \Delta_{\text{shift}} \ge 0.45 \) indicates a stylistic boundary where human text transitions to AI text or vice-versa.

---

## 3. Evidence Fusion & Epistemic Uncertainty

### Collinearity Control
When correlated detectors trigger simultaneously (e.g., AIPatternDetector and PredictabilityProxy), raw scores risk double-counting evidence. We apply a 10%–15% collinearity discount:

$$\text{Collinearity Penalty} = \begin{cases}
0.85 & \text{if rhetorical triggers alone without structural corroboration} \\
0.90 & \text{if structural regularity triggers alone without rhetorical markers} \\
1.00 & \text{if corroborated across orthogonal families}
\end{cases}$$

### Epistemic Uncertainty Model
Uncertainty \( U \in [0, 1] \) is quantified across 5 factors:
1. **Detector Disagreement** (weight 0.30)
2. **Corpus Length Deficit** (weight 0.25; high penalty when \( N_{\text{words}} < 120 \))
3. **Language Identification Confidence** (weight 0.15)
4. **Feature Coverage Ratio** (weight 0.15)
5. **Calibration State** (weight 0.15; uncalibrated profiles incur a base penalty)

If \( U \ge 0.70 \), the system issues a mandatory abstention (`inconclusive`).
