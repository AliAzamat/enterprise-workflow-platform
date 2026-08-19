// A WORKFLOW is data, not code: an ordered list of steps the engine runs. This
// lets us add, reorder, or audit workflows without redeploying the engine.

export type StepKind = "ai" | "approval" | "action";

export interface WorkflowStep {
  id: string;
  kind: StepKind;          // "ai" = LLM step, "approval" = human gate, "action" = side effect
  name: string;
  // For approval steps: the minimum role allowed to approve.
  approverRole?: "MANAGER" | "ADMIN";
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
}

// The live state of one RUN of a workflow. The engine advances `cursor` and
// records each step's output. `status` is the run's lifecycle.
export type RunStatus = "running" | "awaiting_approval" | "completed" | "rejected";

export interface RunState {
  runId: string;
  workflowId: string;
  cursor: number;                  // index of the next step to execute
  status: RunStatus;
  outputs: Record<string, unknown>;  // stepId -> result
}
