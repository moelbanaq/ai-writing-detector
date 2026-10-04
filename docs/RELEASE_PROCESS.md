# Release Validation Process

Every candidate release must satisfy the following gates:

1. **Pre-flight & Runtime**:
   ```bash
   npm run check:runtime
   ```
2. **Quality Gates**:
   ```bash
   npm run format:check
   npm run lint
   npm run typecheck
   npm test
   ```
3. **Track A Acceptance**:
   ```bash
   npm run test:engineering
   ```
   Requires 100% pass on all Track A engineering criteria.
4. **Build Verification**:
   ```bash
   npm run build
   ```
5. **Accuracy Evaluation (Track B)**:
   Executed against locked test manifests without parameter modification.
