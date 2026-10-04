import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const datasetPath = resolve(process.cwd(), 'data/benchmark/dataset.json');

console.log('Validating dataset schema at:', datasetPath);

if (!existsSync(datasetPath)) {
  console.error('❌ Dataset file does not exist at:', datasetPath);
  process.exit(1);
}

const raw = readFileSync(datasetPath, 'utf-8');
let data: any[];

try {
  data = JSON.parse(raw);
} catch (e) {
  console.error('❌ Failed to parse JSON:', e);
  process.exit(1);
}

if (!Array.isArray(data)) {
  console.error('❌ Dataset root must be an array of samples');
  process.exit(1);
}

const seenIds = new Set<string>();
const categories = new Set<string>();
let aiCount = 0;
let humanCount = 0;

for (let i = 0; i < data.length; i++) {
  const item = data[i];
  if (!item.id || typeof item.id !== 'string') {
    throw new Error(`Sample at index ${i} missing valid string id`);
  }
  if (seenIds.has(item.id)) {
    throw new Error(`Duplicate sample id detected: ${item.id}`);
  }
  seenIds.add(item.id);

  if (item.label !== 0 && item.label !== 1) {
    throw new Error(`Sample ${item.id} has invalid label: ${item.label} (must be 0 or 1)`);
  }

  if (typeof item.text !== 'string' || item.text.trim().length < 30) {
    throw new Error(`Sample ${item.id} text too short or invalid`);
  }

  if (!item.category || typeof item.category !== 'string') {
    throw new Error(`Sample ${item.id} missing category`);
  }

  categories.add(item.category);
  if (item.label === 1) aiCount++;
  else humanCount++;
}

console.log('✅ Dataset validation passed:');
console.log(`- Total Samples:  ${data.length}`);
console.log(`- AI Samples (1): ${aiCount}`);
console.log(`- Human (0):      ${humanCount}`);
console.log(`- Categories:     ${[...categories].join(', ')}`);
console.log('All samples conform strictly to the benchmark schema.\n');
