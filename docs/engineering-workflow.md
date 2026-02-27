# Engineering Workflow

## Branch Strategy
- `main`: production-ready only.
- `feature/<scope>-<short-name>`: regular feature work.
- `hotfix/<scope>-<short-name>`: urgent production fixes.

## PR Rules
- Every change goes through PR, no direct push to `main`.
- CI must pass: lint, typecheck, test, build.
- At least one reviewer approval before merge.
- Use squash merge and reference issue/ticket id.

## Commit Convention
- `feat:` new feature
- `fix:` bug fix
- `refactor:` structure-only change
- `test:` tests only
- `chore:` tooling/docs/ops

## Release Checklist
1. Verify env variables and secrets.
2. Run DB migration and confirm backward compatibility.
3. Validate health endpoint after deploy.
4. Monitor error logs for 30 minutes.
