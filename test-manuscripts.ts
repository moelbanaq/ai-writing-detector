import fs from 'node:fs';
import path from 'node:path';
import { analyzeText } from './packages/core/src/index.js';

interface TestTarget {
  file: string;
  label: string;
  format: string;
}

const targets: TestTarget[] = [
  { file: '1st_docx_rebuilt.txt', label: '1st Research Rebuilt Manuscript (DOCX)', format: 'Word DOCX' },
  { file: '2nd_docx_rebuilt.txt', label: '2nd Research Rebuilt Manuscript (DOCX)', format: 'Word DOCX' },
  { file: '1st_tex_readable.txt', label: '1st Research LaTeX Manuscript (TeX)', format: 'LaTeX TeX' },
  { file: '2nd_tex_readable.txt', label: '2nd Research LaTeX Manuscript (TeX)', format: 'LaTeX TeX' },
  { file: '1st_humanized_v2.txt', label: '1st Research Core Manuscript (Humanized)', format: 'Core Prose' },
  { file: '2nd_humanized_v2.txt', label: '2nd Research Core Manuscript (Humanized)', format: 'Core Prose' },
];

console.log('========================================================================================');
console.log('         COMPREHENSIVE MULTI-METRIC AI DETECTION AUDIT REPORT                           ');
console.log('         Tool: ai-writing-detector ensemble (7 independent detectors)                   ');
console.log('========================================================================================\n');

const summaryRows: any[] = [];

targets.forEach((target) => {
  const filePath = path.resolve(target.file);
  const text = fs.readFileSync(filePath, 'utf-8');
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;

  const report = analyzeText({ text });

  const aiLikelihood = (report.classification.aiLikelihood * 100).toFixed(1) + '%';
  const humanLikelihood = (report.classification.humanLikelihood * 100).toFixed(1) + '%';
  const confidence = (report.confidence.score * 100).toFixed(1) + '%';
  const label = report.classification.label;

  const sentences = report.segments.sentences as any[];
  const highAiSentences = sentences.filter((s) => (s.analysis?.aiLikelihood ?? 0) >= 0.6);

  const detectorScores: Record<string, string> = {};
  report.detectors.forEach((d) => {
    detectorScores[d.detectorId] = d.score !== null ? (d.score * 100).toFixed(1) + '%' : 'N/A';
  });

  summaryRows.push({
    file: target.file,
    label: target.label,
    format: target.format,
    words: wordCount,
    aiLikelihood,
    humanLikelihood,
    confidence,
    label,
    totalSentences: sentences.length,
    highAiCount: highAiSentences.length,
    highAiPct: ((highAiSentences.length / (sentences.length || 1)) * 100).toFixed(1) + '%',
    detectors: detectorScores,
  });

  console.log(`\n----------------------------------------------------------------------------------------`);
  console.log(`ANALYSIS: ${target.label} [${target.format}]`);
  console.log(`Word Count: ${wordCount} words | Sentences: ${sentences.length}`);
  console.log(`----------------------------------------------------------------------------------------`);
  console.log(`- Final Classification: ${label.toUpperCase()} (Confidence: ${confidence})`);
  console.log(`- AI Likelihood:        ${aiLikelihood} (Target: < 10.0%)`);
  console.log(`- Human Likelihood:     ${humanLikelihood}`);
  console.log(`- High AI Sentences:    ${highAiSentences.length} / ${sentences.length} (${((highAiSentences.length / (sentences.length || 1)) * 100).toFixed(1)}%)`);
  console.log(`- Individual Detectors:`);
  Object.entries(detectorScores).forEach(([k, v]) => {
    console.log(`    * ${k.padEnd(25)}: ${v}`);
  });
});

console.log('\n\n========================================================================================');
console.log('                          FINAL EXECUTIVE VERIFICATION TABLE                            ');
console.log('========================================================================================');
console.log('| Target Document                  | Format    | Words | AI Likelihood | High AI Sentences | Label        |');
console.log('|----------------------------------|-----------|-------|---------------|-------------------|--------------|');
summaryRows.forEach((r) => {
  const lbl = r.label.slice(0, 32).padEnd(32);
  const fmt = r.format.padEnd(9);
  const w = String(r.words).padStart(5);
  const ai = r.aiLikelihood.padStart(13);
  const high = `${r.highAiCount} (${r.highAiPct})`.padStart(17);
  const cl = r.label.padEnd(12);
  console.log(`| ${lbl} | ${fmt} | ${w} | ${ai} | ${high} | ${cl} |`);
});
console.log('========================================================================================\n');
