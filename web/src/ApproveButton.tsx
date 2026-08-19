import { useState } from "react";
import { gql } from "./graphql";

// The human-in-the-loop control. A manager clicks Approve; we call the
// approveRun mutation and reflect the new status. Loading and error are
// first-class — a privileged action must never silently fail.
export function ApproveButton({ runId, onApproved }: {
  runId: string;
  onApproved: (run: any) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function approve() {
    setBusy(true);
    setError(null);
    try {
      const d = await gql<{ approveRun: any }>(
        `mutation($id: ID!) { approveRun(runId: $id) { runId status cursor } }`,
        { id: runId },
      );
      onApproved(d.approveRun);            // reflect the resumed run
    } catch (e: any) {
      setError(e.message);                 // e.g. a FORBIDDEN for a non-manager
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="approve">
      <button onClick={approve} disabled={busy}>Approve step</button>
      {error && <pre className="error">{error}</pre>}
    </div>
  );
}
