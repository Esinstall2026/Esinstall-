import { jobs } from './data';
import { validateJobSet } from './v8-validation';

export interface V10ValidationResult {
  checkedJobs: number;
  validJobs: number;
  invalidJobs: number;
  duplicateJobIds: string[];
  passed: boolean;
}

/** V10 stability check for the seeded operational job set. */
export function runV10Validation(): V10ValidationResult {
  const workflow = validateJobSet(jobs);
  const ids = jobs.map((job) => job.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

  return {
    checkedJobs: workflow.checked,
    validJobs: workflow.valid,
    invalidJobs: workflow.invalid,
    duplicateJobIds: [...new Set(duplicates)],
    passed: workflow.invalid === 0 && duplicates.length === 0,
  };
}
