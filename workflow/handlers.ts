import type { StepHandler } from "./engine";
import type { WorkflowStep, RunState } from "./types";

// The AI handler: ask the assistant service to triage or draft based on the
// step name and the run's accumulated inputs. Returns structured output the
// next step (or a human) can act on.
export const aiHandler: StepHandler = async (step: WorkflowStep, state: RunState) => {
  const request = state.outputs["intake"] as { subject: string; body: string } | undefined;
  // The assistant call is delegated; here we model its structured result.
  return {
    step: step.name,
    summary: `Triaged "${request?.subject ?? "(no subject)"}"`,
    suggestedDraft: "Thanks for reaching out — here is what we found...",
  };
};

// The action handler performs a side effect — e.g. send the approved draft.
// It is IDEMPOTENT: keyed by runId + stepId, so a re-run never sends twice.
const _performed = new Set<string>();

export const actionHandler: StepHandler = async (step: WorkflowStep, state: RunState) => {
  const key = `${state.runId}:${step.id}`;
  if (_performed.has(key)) {
    return { step: step.name, status: "already_done", key };  // idempotent skip
  }
  _performed.add(key);
  // ...perform the real side effect here (send email, create ticket, etc.)...
  return { step: step.name, status: "performed", key };
};

// The handler table the engine is given. Approval steps need no handler — the
// engine pauses on them — so only "ai" and "action" map to behavior.
export const handlers: Record<string, StepHandler> = {
  ai: aiHandler,
  action: actionHandler,
};
