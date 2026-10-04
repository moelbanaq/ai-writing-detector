# Probability Calibration & Reliability Engineering

## 1. The Core Scientific Principle

In computational forensic science, a fundamental distinction exists between:
1. **Forensic Evidence Signal**: A deterministic score indicating the degree to which measurable linguistic features resemble patterns associated with AI writing.
2. **Calibrated Probability**: A statistically validated posterior probability $P(\text{AI} \mid \mathbf{x})$ empirically verified against ground-truth validation data.

> **CRITICAL SCIENTIFIC RULE**: Never present a heuristic or forensic signal as a calibrated probability unless formal calibration training and external validation have been completed.

When operating without an external calibration profile, the system sets:
```json
{
  "basis": "forensic_ensemble",
  "forensicSignal": 0.78,
  "calibratedProbability": null,
  "calibrationStatus": "not_calibrated"
}
```

---

## 2. Platt / Logistic Scaling Calibration

When labeled training samples are provided, calibration is fitted using multivariate logistic regression with $L_2$ regularization:

$$z = \beta_0 + \sum_{k=1}^{K} w_k (x_k - 0.5)$$

$$P(\text{AI} \mid \mathbf{x}) = \sigma\left(\frac{z}{T}\right) = \frac{1}{1 + e^{-z / T}}$$

Where:
- $\beta_0$ is the intercept fitted to match class balance.
- $w_k$ are the feature weights learned via gradient descent.
- $T$ is temperature scaling (default $1.0$).
- $L_2$ penalty prevents overfitting to small datasets:

$$\mathcal{L}(w, b) = -\frac{1}{M}\sum_{i=1}^M \left[ y_i \log(\hat{p}_i) + (1 - y_i) \log(1 - \hat{p}_i) \right] + \frac{\lambda}{2} \|w\|_2^2$$

---

## 3. Reliability Metrics & Verification

To verify that predictions reflect true empirical probabilities, the validation suite evaluates:

### A. Brier Score
The mean squared difference between predicted probabilities $\hat{p}_i$ and actual outcomes $y_i \in \{0, 1\}$:

$$\text{Brier} = \frac{1}{M} \sum_{i=1}^{M} (\hat{p}_i - y_i)^2$$

A lower Brier score indicates superior calibration and sharpness (0.0 represents perfect prediction).

### B. Expected Calibration Error (ECE)
Samples are partitioned into $B$ equal-interval probability bins (e.g. $B = 10$). For each bin $b$:

$$\text{ECE} = \sum_{b=1}^{B} \frac{|B_b|}{M} \left| \text{acc}(B_b) - \text{conf}(B_b) \right|$$

Where:
- $\text{acc}(B_b)$ is the true fraction of AI samples in bin $b$.
- $\text{conf}(B_b)$ is the average predicted probability in bin $b$.

An ECE $< 0.10$ signifies strong calibration reliability.

---

## 4. Execution Commands

- Run uncalibrated validation baseline:
  ```bash
  npm run test:accuracy
  ```
- Train and evaluate logistic calibration:
  ```bash
  npm run test:accuracy:validation
  ```
- Evaluate frozen 20% test split:
  ```bash
  npm run test:accuracy:final
  ```
