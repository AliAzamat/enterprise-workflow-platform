# Enterprise Workflow Platform — operations runbook

## Health signals
- `GET /health` on the gateway returns 200 (liveness behind the ALB).
- `assistant_requests_total` should climb during business hours; flat = an outage.
- `failures_total{stage="worker"}` climbing = workflow runs are erroring.
- `pending_approvals` rising = a HUMAN backlog, not a machine fault.
- Watch `request_latency_seconds` p95 and `llm_cost_usd_total` for spikes.

## Common incidents
- **Runs stuck "running"**: the worker is down or the Redis queue is unreachable.
  Check the worker task and `REDIS_URL`; jobs are durable, so they resume on restart.
- **LLM cost spike**: `llm_cost_usd_total` jumps -> a caller skipped the answer
  cache or routed to the flagship model; verify caching and model routing.
- **Approvals piling up**: `pending_approvals` high -> notify managers; this is a
  workflow-design issue, not infrastructure.
- **Ungrounded answers**: a drop in the `grounded="true"` request label means the
  knowledge index is stale or empty; re-index the enterprise docs.

## Security
- Every privileged action is in `audit_log` (append-only). Pull it for incident review.
- Secrets (DATABASE_URL, OPENAI_API_KEY) come from SSM/Secrets Manager, never the image.

## Deployment
- Local/dev: `docker compose up` brings the whole stack up on one host.
- Production: each service becomes an AWS ECS Fargate task behind an ALB; Postgres
  is RDS, Redis is ElastiCache, and secrets are injected from SSM at runtime.
- The topology is identical to compose — only the managed runtime differs.
