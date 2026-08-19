import type { Workflow, RunState, WorkflowStep } from "./types";

// A handler runs one step and returns its output. The engine doesn't know what
// an "ai" or "action" step actually does — handlers are injected, so the engine
// stays a tiny, testable state machine.
export type StepHandler = (step: WorkflowStep, state: RunState) => Promise<unknown>;

export async function advance(
  wf: Workflow,
  state: RunState,
  handlers: Record<string, StepHandler>,
): Promise<RunState> {
  if (state.status !== "running") return state;       // only a running run advances
  const step = wf.steps[state.cursor];
  if (!step) return { ...state, status: "completed" }; // ran off the end = done

  // An approval step PAUSES the run for a human instead of executing.
  if (step.kind === "approval") {
    return { ...state, status: "awaiting_approval" };
  }

  // Otherwise run the step's handler and record its output, then advance.
  const output = await handlers[step.kind](step, state);
  return {
    ...state,
    cursor: state.cursor + 1,
    outputs: { ...state.outputs, [step.id]: output },
  };
}
