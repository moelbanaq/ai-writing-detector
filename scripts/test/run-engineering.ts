import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { analyzeText } from '../../packages/core/src/index.js';
import {
  accuracy,
  precision,
  recall,
  f1Score,
  specificity,
  falsePositiveRate,
  falseNegativeRate,
} from '../../packages/benchmark/src/index.js';

interface TestResult {
  category: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(category: string, name: string, condition: boolean, details?: string) {
  results.push({ category, name, passed: condition, details });
  if (!condition) {
    console.error(`❌ [FAIL] ${category}: ${name} - ${details ?? ''}`);
  } else {
    console.log(`✅ [PASS] ${category}: ${name}`);
  }
}

console.log('==================================================');
console.log('RUNNING ENGINEERING TRACK A ACCEPTANCE SUITE');
console.log('==================================================\n');

// 1. Text Input & Edge Cases
try {
  let threwEmpty = false;
  try {
    analyzeText({ text: '' });
  } catch {
    threwEmpty = true;
  }
  assert('Input Validation', 'Empty text rejected with ValidationError', threwEmpty);

  let threwWhitespace = false;
  try {
    analyzeText({ text: '    \n\t   ' });
  } catch {
    threwWhitespace = true;
  }
  assert('Input Validation', 'Whitespace-only text rejected with ValidationError', threwWhitespace);
} catch (e: unknown) {
  assert('Input Validation', 'Unexpected exception in validation tests', false, String(e));
}

// 2. Deterministic Text Statistics
try {
  const sample = 'Hello world. This is a controlled sentence for exact counting.';
  const r1 = analyzeText({ text: sample });
  assert('Statistics', 'Word count accurate', r1.statistics.words === 10);
  assert('Statistics', 'Sentence count accurate', r1.statistics.sentences === 2);
  assert('Statistics', 'Characters counted', r1.statistics.characters === sample.length);
  assert(
    'Statistics',
    'Average sentence length calculated',
    r1.statistics.averageSentenceLength === 5,
  );
} catch (e: unknown) {
  assert('Statistics', 'Execution failed', false, String(e));
}

// 3. Language Detection
try {
  const enRes = analyzeText({
    text: 'The quick brown fox jumps over the lazy dog in the sunny morning.',
  });
  assert('Language Detection', 'English detected', enRes.language.primary === 'en');

  const arRes = analyzeText({
    text: 'تعتبر اللغة العربية من أغنى اللغات في العالم من حيث المفردات والتراكيب.',
  });
  assert('Language Detection', 'Arabic detected', arRes.language.primary === 'ar');

  const mixedRes = analyzeText({
    text: 'أنا أتحدث عن artificial intelligence والـ future الكبير.',
  });
  assert(
    'Language Detection',
    'Mixed language detected or preserved without crash',
    mixedRes.language.primary === 'ar' || mixedRes.language.mixedLanguage,
  );
} catch (e: unknown) {
  assert('Language Detection', 'Execution failed', false, String(e));
}

// 4. Analysis Determinism (5 identical runs)
try {
  const text =
    'Sustainable urban development requires careful balancing of environmental, economic, and social factors over long periods of time.';
  const runs = Array.from({ length: 5 }, () => analyzeText({ text }));
  const firstScore = runs[0]!.classification.aiLikelihood ?? 0;
  const firstConf = runs[0]!.confidence.score;

  const scoreDiff = Math.max(
    ...runs.map((r) => Math.abs((r.classification.aiLikelihood ?? 0) - firstScore)),
  );
  const confDiff = Math.max(...runs.map((r) => Math.abs(r.confidence.score - firstConf)));

  assert(
    'Determinism',
    'Score variance across 5 runs <= 0.01',
    scoreDiff <= 0.01,
    `Observed diff: ${scoreDiff}`,
  );
  assert(
    'Determinism',
    'Confidence variance across 5 runs <= 0.02',
    confDiff <= 0.02,
    `Observed diff: ${confDiff}`,
  );
} catch (e: unknown) {
  assert('Determinism', 'Execution failed', false, String(e));
}

// 5. Short Text Confidence Reduction (< 100 words -> confidence <= 0.35)
try {
  const shortText =
    'The quick brown fox jumped gracefully over the lazy sleeping dog near the old fence.';
  const shortRes = analyzeText({ text: shortText });
  assert(
    'Confidence Guardrails',
    'Short text (<100 words) confidence <= 0.35',
    shortRes.confidence.score <= 0.35,
    `Observed: ${shortRes.confidence.score}`,
  );
  assert(
    'Confidence Guardrails',
    'Short text has SHORT_TEXT limitation',
    shortRes.limitations.some((l) => l.code === 'SHORT_TEXT'),
  );
} catch (e: unknown) {
  assert('Confidence Guardrails', 'Execution failed', false, String(e));
}

// 6. Detector Contract & Output Schema
try {
  const sample =
    'Artificial intelligence has transformed the modern workplace. It has improved efficiency across many sectors. Machine learning algorithms process large datasets with remarkable speed.';
  const res = analyzeText({ text: sample });
  assert(
    'Detector Contract',
    'At least 6 detectors executed',
    res.detectors.length >= 6,
    `Count: ${res.detectors.length}`,
  );

  let allBounded = true;
  for (const d of res.detectors) {
    if (d.score !== null && (d.score < 0 || d.score > 1 || !Number.isFinite(d.score)))
      allBounded = false;
    if (d.confidence < 0 || d.confidence > 1 || !Number.isFinite(d.confidence)) allBounded = false;
    if (d.reliability < 0 || d.reliability > 1 || !Number.isFinite(d.reliability))
      allBounded = false;
  }
  assert(
    'Detector Contract',
    'All detector scores, confidences, and reliabilities bounded in [0,1]',
    allBounded,
  );
} catch (e: unknown) {
  assert('Detector Contract', 'Execution failed', false, String(e));
}

// 7. Benchmark Metric Calculator Sanity Gate (Section 27.S)
// TP = 80, TN = 90, FP = 10, FN = 20
try {
  const cm = { tp: 80, tn: 90, fp: 10, fn: 20 };
  const acc = accuracy(cm);
  const prec = precision(cm);
  const rec = recall(cm);
  const f1 = f1Score(cm);
  const spec = specificity(cm);
  const fpr = falsePositiveRate(cm);
  const fnr = falseNegativeRate(cm);

  const eps = 0.001;
  assert(
    'Benchmark Metric Calculator',
    'Accuracy = 0.85 (±0.001)',
    Math.abs(acc - 0.85) <= eps,
    `Observed: ${acc}`,
  );
  assert(
    'Benchmark Metric Calculator',
    'Precision ≈ 0.8889 (±0.001)',
    Math.abs(prec - 0.888889) <= eps,
    `Observed: ${prec}`,
  );
  assert(
    'Benchmark Metric Calculator',
    'Recall = 0.80 (±0.001)',
    Math.abs(rec - 0.8) <= eps,
    `Observed: ${rec}`,
  );
  assert(
    'Benchmark Metric Calculator',
    'F1 ≈ 0.8421 (±0.001)',
    Math.abs(f1 - 0.842105) <= eps,
    `Observed: ${f1}`,
  );
  assert(
    'Benchmark Metric Calculator',
    'Specificity = 0.90 (±0.001)',
    Math.abs(spec - 0.9) <= eps,
    `Observed: ${spec}`,
  );
  assert(
    'Benchmark Metric Calculator',
    'FPR = 0.10 (±0.001)',
    Math.abs(fpr - 0.1) <= eps,
    `Observed: ${fpr}`,
  );
  assert(
    'Benchmark Metric Calculator',
    'FNR = 0.20 (±0.001)',
    Math.abs(fnr - 0.2) <= eps,
    `Observed: ${fnr}`,
  );
} catch (e: unknown) {
  assert('Benchmark Metric Calculator', 'Sanity test failed', false, String(e));
}

// 8. Generate Reports
const total = results.length;
const passed = results.filter((r) => r.passed).length;
const failed = total - passed;
const passRate = total > 0 ? (passed / total) * 100 : 0;

const reportJson = {
  timestamp: new Date().toISOString(),
  app_version: '0.1.0',
  model_version: 'experimental-baseline-v1',
  status: failed === 0 ? 'PASS' : 'FAIL',
  tests_total: total,
  tests_passed: passed,
  tests_failed: failed,
  pass_rate_percent: passRate,
  runtime: {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
  },
  results,
};

const reportsDir = resolve(process.cwd(), 'reports/engineering');
mkdirSync(reportsDir, { recursive: true });

writeFileSync(
  resolve(reportsDir, 'ENGINEERING_TEST_REPORT.json'),
  JSON.stringify(reportJson, null, 2),
  'utf-8',
);

const reportMd = `# Track A — Engineering Test Report

**Timestamp**: ${reportJson.timestamp}  
**Overall Engineering Status**: **${reportJson.status}**  
**Tests Total**: ${total}  
**Passed**: ${passed}  
**Failed**: ${failed}  
**Pass Rate**: ${passRate.toFixed(1)}%  

## Test Categories Breakdown

| Category | Test Name | Status | Details |
|---|---|---|---|
${results.map((r) => `| ${r.category} | ${r.name} | ${r.passed ? '✅ PASS' : '❌ FAIL'} | ${r.details ?? '-'} |`).join('\n')}

---
*Notice: This report measures software engineering correctness (Track A). It does NOT constitute AI detection accuracy validation (Track B).*
`;

writeFileSync(resolve(reportsDir, 'ENGINEERING_TEST_REPORT.md'), reportMd, 'utf-8');

console.log('\n==================================================');
console.log(`ENGINEERING TEST REPORT GENERATED: ${reportJson.status}`);
console.log(`Passed: ${passed}/${total} (${passRate.toFixed(1)}%)`);
console.log('==================================================');

if (failed > 0) {
  process.exit(1);
}
