import { createClient } from "redis";

// One Redis client for the process. Redis is our DURABLE queue: a job survives
// even if the API or worker restarts, because it lives in Redis, not memory.
export const redis = createClient({ url: process.env.REDIS_URL });

const QUEUE = "workflow:runs";

export interface RunJob {
  runId: string;
  workflowId: string;
}

// ENQUEUE: push a job onto the list. The API returns immediately after this —
// the slow work (LLM calls, multi-step runs) happens later, off the request.
export async function enqueue(job: RunJob): Promise<void> {
  await redis.lPush(QUEUE, JSON.stringify(job));
}

// DEQUEUE: block until a job is available, then pop it. BRPOP waits instead of
// busy-polling, so an idle worker costs nothing.
export async function dequeue(timeoutSec = 5): Promise<RunJob | null> {
  const res = await redis.brPop(QUEUE, timeoutSec);
  return res ? (JSON.parse(res.element) as RunJob) : null;
}
