"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function RunWorkflowButton({
  workflowId,
}: {
  workflowId?: string;
}) {
  const router = useRouter();
  const pending = useRef(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [executionId, setExecutionId] = useState("");

  async function run() {
    if (pending.current) return;
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
    <div className="space-y-3">
      <button
        type="button"
        onClick={run}
        disabled={running}
        aria-busy={running}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400 disabled:cursor-wait disabled:opacity-60"
      >
        {running ? "Running…" : workflowId ? "Run workflow" : "Run task report"}
      </button>
      <div aria-live="polite" role="status">
        {running && (
          <p className="text-sm text-gray-300">
            {workflowId
              ? "Executing your workflow…"
              : "Finding your tasks and saving the report…"}
          </p>
        )}
        {executionId && (
          <p className="break-all text-sm text-green-400">
            Workflow completed. Execution: {executionId}
          </p>
        )}
      </div>
      {error && (
        <p role="alert" className="max-w-xl text-sm text-red-400">
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
