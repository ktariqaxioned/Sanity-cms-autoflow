"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div
      className={
        compact
          ? "flex items-center gap-2"
          : "grid justify-items-start gap-2.5 [&_[role=status]:empty]:hidden"
      }
    >
      <Button
        type="button"
        size={compact ? "sm" : "default"}
        onClick={run}
        disabled={running || disabled}
        aria-busy={running}
        aria-label={compact && workflowName ? `Run ${workflowName}` : undefined}
        title={
          disabled
            ? "This workflow has no supported action steps to run yet."
            : undefined
        }
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
      </Button>
      <div aria-live="polite" role="status">
        {running && !compact && (
          <p className="max-w-[380px] text-xs leading-relaxed text-[#adb9c7]">
            {workflowId
              ? "Executing your workflow…"
              : "Finding your tasks and saving the report…"}
          </p>
        )}
        {executionId && (
          <p
            className={
              compact
                ? "inline-flex items-center gap-1 text-[11px] text-[#a4ddbf]"
                : "max-w-[380px] text-xs leading-relaxed text-[#a4ddbf]"
            }
            title={executionId}
          >
            {compact ? (
              <>
                <Check size={13} aria-hidden="true" />
                Run complete
              </>
            ) : (
              <>
                Workflow completed.{" "}
                <Link
                  className="underline underline-offset-[3px]"
                  href={`/executions/${encodeURIComponent(executionId)}`}
                >
                  View this run
                </Link>
              </>
            )}
          </p>
        )}
      </div>
      {error && (
        <p
          role="alert"
          className={
            compact
              ? "text-[11px] leading-relaxed text-[#edbcb2]"
              : "max-w-[420px] rounded-md border border-[#6b4842] bg-[#322522] px-3 py-2.5 text-xs leading-loose text-[#edbcb2]"
          }
        >
          {error}{" "}
          <Link className="underline underline-offset-[3px]" href="/reports">
            Check saved reports
          </Link>{" "}
          before retrying.
        </p>
      )}
    </div>
  );
}
