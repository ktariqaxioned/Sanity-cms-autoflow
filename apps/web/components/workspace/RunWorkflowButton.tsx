"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, Play } from "lucide-react";

export default function RunWorkflowButton({
  workflowId,
  workflowName,
  compact = false,
  disabled = false,
}: {
  workflowId?: string;
  workflowName?: string;
  compact?: boolean;
  disabled?: boolean;
}) {
  const router = useRouter();
  const pending = useRef(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [executionId, setExecutionId] = useState("");

  async function run() {
    if (pending.current || disabled) return;
    pending.current = true;
    setRunning(true);
    setError("");
    setExecutionId("");

    try {
      const endpoint = workflowId
        ? `/api/workflows/${encodeURIComponent(workflowId)}/run`
        : "/api/reports/run";
      const response = await fetch(endpoint, { method: "POST" });
      const data = await response.json();
      if (!response.ok || data.success !== true) {
        throw new Error(
          data.message || "Unable to run the workflow. Please try again.",
        );
      }
      const reportId = data.reportId ?? data.output?.reportId;
      if (typeof reportId === "string") {
        router.push(`/reports/${encodeURIComponent(reportId)}`);
      } else {
        setExecutionId(data.executionId);
      }
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to run the workflow.",
      );
    } finally {
      pending.current = false;
      setRunning(false);
    }
  }

  return (
    <div className={compact ? "wf-run-control" : "af-run-block"}>
      <button
        type="button"
        onClick={run}
        disabled={running || disabled}
        aria-busy={running}
        aria-label={compact && workflowName ? `Run ${workflowName}` : undefined}
        title={
          disabled
            ? "This workflow has no supported action steps to run yet."
            : undefined
        }
        className={`wf-button wf-button-primary ${compact ? "wf-button-small" : ""}`}
      >
        {running ? (
          <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
        ) : (
          <Play size={14} fill="currentColor" aria-hidden="true" />
        )}
        {running
          ? "Running…"
          : compact
            ? "Run"
            : workflowId
              ? "Run workflow"
              : "Run task report"}
      </button>
      <div aria-live="polite" role="status">
        {running && !compact && (
          <p className="af-run-message">
            {workflowId
              ? "Executing your workflow…"
              : "Finding your tasks and saving the report…"}
          </p>
        )}
        {executionId && (
          <p
            className={
              compact
                ? "wf-run-feedback wf-run-success"
                : "af-run-message af-success-message"
            }
            title={executionId}
          >
            {compact ? (
              <>
                <Check size={13} aria-hidden="true" />
                Run complete
              </>
            ) : (
              <>Workflow completed. Execution: {executionId}</>
            )}
          </p>
        )}
      </div>
      {error && (
        <p
          role="alert"
          className={
            compact ? "wf-run-feedback wf-run-error" : "af-inline-error"
          }
        >
          {error}{" "}
          <Link className="underline" href="/reports">
            Check saved reports
          </Link>{" "}
          before retrying.
        </p>
      )}
    </div>
  );
}
