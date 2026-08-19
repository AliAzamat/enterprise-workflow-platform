import time
from prometheus_client import Counter, Histogram, Gauge

# USAGE: how much the platform is actually used, by feature and assistant.
assistant_requests = Counter(
    "assistant_requests_total", "Assistant questions answered", ["assistant", "grounded"]
)
workflow_runs = Counter("workflow_runs_total", "Workflow runs started", ["workflow"])

# RELIABILITY: failures and latency are the heartbeat of the platform.
request_latency = Histogram(
    "request_latency_seconds", "End-to-end request latency",
    buckets=[0.1, 0.25, 0.5, 1, 2, 4, 8],
)
failures = Counter("failures_total", "Failed operations", ["stage"])

# COST: LLM calls bill per token, so spend is an operational signal like latency.
llm_cost_usd = Counter("llm_cost_usd_total", "Cumulative OpenAI spend", ["model"])
cache_hits = Counter("assistant_cache_hits_total", "Answers served from cache")

# A pending-approvals gauge: a backlog here means humans, not machines, are the
# bottleneck — a different problem than a slow LLM or a crashed worker.
pending_approvals = Gauge("pending_approvals", "Runs awaiting human approval")


def observe_latency(seconds: float) -> None:
    request_latency.observe(seconds)
