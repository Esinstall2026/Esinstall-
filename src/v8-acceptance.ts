import { jobs } from './data';
import { validateJobSet } from './v8-validation';

/** V8 acceptance check: every seeded job must produce a complete workflow record. */
export function runV8AcceptanceCheck() {
  const result = validateJobSet(jobs);
  return {
    ...result,
    passed: result.invalid === 0,
  };
}
