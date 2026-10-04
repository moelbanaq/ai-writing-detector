import fs from 'node:fs';
import { analyzeText } from './packages/core/src/index.js';

['1st_research.txt', '2nd_research.txt'].forEach((file) => {
  const text = fs.readFileSync(file, 'utf-8');
  const report = analyzeText({ text });
  console.log(`\n========================================`);
  console.log(`SCANNING: ${file}`);
  console.log(`========================================`);

  const sentences = report.segments.sentences as any[];
  let tellCount = 0;
  sentences.forEach((s, idx) => {
    if (s.analysis.tells && s.analysis.tells.length > 0) {
      tellCount += s.analysis.tells.length;
      console.log(`\n[Sentence ${idx + 1}] (AI: ${(s.analysis.aiLikelihood * 100).toFixed(0)}%)`);
      console.log(`Text: "${s.text}"`);
      s.analysis.tells.forEach((t: any) => {
        console.log(`   -> [${t.severity}] ${t.explanation}`);
      });
    }
  });
  console.log(`\n>>> Total tells in ${file}: ${tellCount}`);
});
