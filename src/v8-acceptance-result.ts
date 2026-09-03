import { jobs } from './data';
import { runV8AcceptanceCheck } from './v8-acceptance';

export const V8_ACCEPTANCE = {
  expectedJobs: jobs.length,
  result: runV8AcceptanceCheck(),
};

export default V8_ACCEPTANCE;
