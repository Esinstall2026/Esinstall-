import type { Job } from './types';
import type { V8WorkflowItem } from './v8-foundation';
import { jobToWorkflowItem, validateWorkflowItem } from './v8-integration';

export function validateJobWorkflow(job: Job): { item: V8WorkflowItem; errors: string[] } {
  const item = jobToWorkflowItem(job);
  return { item, errors: validateWorkflowItem(item) };
}

export function validateJobSet(jobs: Job[]): { checked: number; valid: number; invalid: number } {
  const results = jobs.map(validateJobWorkflow);
  const invalid = results.filter((result) => result.errors.length > 0).length;
  return { checked: jobs.length, valid: jobs.length - invalid, invalid };
}
