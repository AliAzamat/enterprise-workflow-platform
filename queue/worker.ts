import { redis, dequeue } from "./jobs";
import { advance } from "../workflow/engine";
import { handlers } from "../workflow/handlers";
import { loadWorkflow, loadRun, saveRun } from "../workflow/store";

// The WORKER LOOP: pull a job, drive its run forward until it pauses or ends,
// persist the new state. This process is separate from the API, so heavy work
// never blocks a user request — the core decoupling of an async platform.
export async function workerLoop(): Promise<void> {
  await redis.connect();
  while (true) {
    const job = await dequeue();
    if (!job) continue;                       // timed out waiting; loop again
    try {
      const wf = await loadWorkflow(job.workflowId);
      let state = await loadRun(job.runId);
      // Advance until the run pauses for approval or finishes.
      while (state.status === "running") {
        state = await advance(wf, state, handlers);
      }
      await saveRun(state);                    // persist progress durably
    } catch (err) {
      // Leave the job effects idempotent so a retry is safe; log and move on.
      console.error(`run ${job.runId} failed:`, err);
    }
  }
}
