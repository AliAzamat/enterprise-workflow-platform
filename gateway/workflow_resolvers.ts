import type { GatewayContext } from "./context";
import { requireAuth, requireRole } from "./permissions";
import { enqueue } from "../queue/jobs";
import { createRun, loadRun, markApproved } from "../workflow/store";

export const workflowResolvers = {
  Mutation: {
    // Any authenticated employee can START a run. We create the run state,
    // enqueue it for the worker, and return immediately — never block here.
    async startRun(_p: unknown, args: { workflowId: string }, ctx: GatewayContext) {
      const principal = requireAuth(ctx);
      const run = await createRun(args.workflowId, principal.id);
      await enqueue({ runId: run.runId, workflowId: run.workflowId });
      return run;
    },

    // APPROVING a paused step is a privileged write: only MANAGER or ADMIN.
    // We flip the run to running, then re-enqueue so the worker resumes it.
    async approveRun(_p: unknown, args: { runId: string }, ctx: GatewayContext) {
      requireRole(ctx, "MANAGER");                 // authorization on the write
      const run = await markApproved(args.runId);
      await enqueue({ runId: run.runId, workflowId: run.workflowId });
      return run;
    },
  },
  Query: {
    async run(_p: unknown, args: { runId: string }, ctx: GatewayContext) {
      requireAuth(ctx);
      return loadRun(args.runId);
    },
  },
};
