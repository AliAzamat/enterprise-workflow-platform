import { useEffect, useState } from "react";
import { gql } from "./graphql";
import { ApproveButton } from "./ApproveButton";

interface Run {
  runId: string;
  workflowId: string;
  status: string;
  cursor: number;
}

// The workflow dashboard: list runs and their status. Models loading AND error,
// not just the happy path — a trustworthy internal tool never flashes blank.
export function Dashboard() {
  const [run, setRun] = useState<Run | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    gql<{ run: Run }>(`query($id: ID!) { run(runId: $id) { runId workflowId status cursor } }`, {
      id: "demo-run",
    })
      .then((d) => setRun(d.run))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="error">Could not load run: {error}</div>;
  if (!run) return <div className="loading">Loading workflow run…</div>;

  return (
    <section className="run">
      <h2>Run {run.runId}</h2>
      <p>Status: <strong>{run.status}</strong> (step {run.cursor})</p>
      {run.status === "awaiting_approval" && (
        <ApproveButton runId={run.runId} onApproved={setRun} />
      )}
    </section>
  );
}
