import { V8_ACCEPTANCE } from './v8-acceptance-result';

if (!V8_ACCEPTANCE.result.passed) {
  throw new Error(`V8 acceptance failed: ${V8_ACCEPTANCE.result.invalid} invalid workflow records`);
}

export const v8Passed = true;
