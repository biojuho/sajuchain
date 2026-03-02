# Observability Runbook

## What to Monitor
- API errors by route and status code
- Build/deploy failures
- Payment verification failures
- Data freshness (`/api/health` stale flag)

## Request Tracing
- Include `requestId` in API responses for critical endpoints.
- Log structured JSON with `ts`, `level`, and `event`.

## Incident Response
1. Check latest deploy and CI logs.
2. Check health endpoint and freshness age.
3. Inspect structured server logs by `requestId`.
4. Roll back if user-facing critical path is degraded.

## Postmortem Minimum Fields
- impact window
- root cause
- remediation
- follow-up owner and due date
