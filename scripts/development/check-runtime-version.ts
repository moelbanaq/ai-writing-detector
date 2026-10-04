const requiredNodeMajor = 22;
const actualVersion = process.version;
const parts = actualVersion.slice(1).split('.');
const majorVersion = parseInt(parts[0], 10);

console.log(`Node.js version: ${actualVersion}`);
console.log(`Required: >= ${requiredNodeMajor}.x`);

if (majorVersion < requiredNodeMajor) {
  console.error(`\nERROR: Node.js ${requiredNodeMajor}.x or higher is required.`);
  console.error(`Detected: ${actualVersion}`);
  process.exit(1);
}

console.log('\n✓ Runtime version check passed.');
