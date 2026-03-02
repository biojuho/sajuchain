# Stack Upgrade Policy

## Cadence
- Patch updates: weekly
- Minor updates: monthly
- Major updates: quarterly, with migration checklist

## Gate Before Upgrade
- CI green (lint, typecheck, test, build)
- Changelog review for breaking changes
- Rollback plan documented in PR

## Version Hygiene
- Keep `next` and `eslint-config-next` on matching versions.
- Keep React and React DOM on the same exact version.
- Pin critical SDKs used in billing and auth paths.

## Required Checks
1. Run smoke tests for auth, payment, and core API.
2. Validate env compatibility in staging.
3. Verify health endpoint after deployment.
