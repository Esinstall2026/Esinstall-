# ES INSTALL — V11 FINAL

## Finalization scope

V11 is the final stabilization and handoff stage built from the validated V10 stability branch.

### Included
- Premium ES INSTALL dark/gold application interface.
- Jobs and Job Folder operational flow.
- Production tracking.
- Installation tracking.
- Warranty workflow.
- Teams, Builders and Communities modules.
- V8 workflow foundation and validation helpers.
- V9 dashboard/workflow integration helpers.
- V10 CI build validation.
- JOB-1005 acceptance test data.

## Acceptance job

`JOB-1005` is the designated acceptance case for the final workflow review.

## Build

The repository includes a GitHub Actions workflow that runs `npm install` and `npm run build` on pushes and pull requests.

## Important

This document records the finalization scope. A production release should only be declared after the CI build reports success and the browser acceptance flow for JOB-1005 has been exercised.
