import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
  fetchExecutionById,
  fetchWorkflowLogs,
} from "@autoflow/sanity-client";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatWorkflowDate } from "../../workflows/workflow-ui";
import { executionDuration, ExecutionStatus } from "../execution-ui";

export default async function ExecutionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const execution = await fetchExecutionById(id);
  if (!execution) notFound();
  const logs = await fetchWorkflowLogs(execution._id);
  const reportId = readReportId(execution.result);

  return (
    <>
      <Link
        href="/executions"
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-[#a4e5d2] hover:text-primary"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        All runs
      </Link>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] text-[#929ba7] uppercase">
            Workflow run
          </p>
          <h1 className="mt-2 text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-medium tracking-tight">
            {execution.workflow?.name || "Untitled workflow"}
          </h1>
        </div>
        <ExecutionStatus status={execution.status} />
      </header>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card className="gap-0 rounded-[11px] bg-card py-0 ring-[#2b3039]">
          <CardHeader className="border-b border-[#292e37] px-6 py-[22px]">
            <h2 className="text-sm font-medium">Step log</h2>
          </CardHeader>
          {logs.length ? (
            <ol>
              {logs.map((log) => (
                <li
                  key={log._id}
                  className="border-b border-[#292e37] px-6 py-4 last:border-0"
                >
                  <div className="flex flex-wrap items-center gap-2 text-[10px] tracking-wide text-[#8796a5] uppercase">
                    <span>{log.level}</span>
                    {log.stepId && <span>{log.stepId}</span>}
                    <span>{formatWorkflowDate(log.createdAt)}</span>
                  </div>
                  <p
                    className={
                      log.level === "error"
                        ? "mt-1 text-sm leading-relaxed text-[#e0aaa4]"
                        : "mt-1 text-sm leading-relaxed"
                    }
                  >
                    {log.message}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <CardContent className="py-8 text-xs text-muted-foreground">
              No logs were saved for this run.
            </CardContent>
          )}
        </Card>
        <aside className="grid gap-4">
          <Card className="gap-0 rounded-[11px] bg-card py-0 ring-[#2b3039]">
            <CardHeader className="border-b border-[#292e37] px-6 py-[22px]">
              <h2 className="text-sm font-medium">Run details</h2>
            </CardHeader>
            <CardContent className="grid gap-3 px-6 py-5 text-xs">
              <Detail label="Started" value={formatWorkflowDate(execution.startedAt)} />
              <Detail
                label="Completed"
                value={
                  execution.completedAt
                    ? formatWorkflowDate(execution.completedAt)
                    : "Not finished"
                }
              />
              <Detail
                label="Duration"
                value={executionDuration(execution.startedAt, execution.completedAt)}
              />
              {execution.workflow?._id && (
                <Link
                  href={`/workflows/${encodeURIComponent(execution.workflow._id)}`}
                  className="inline-flex items-center gap-1 text-[#a4e5d2]"
                >
                  Open workflow
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              )}
              {reportId && (
                <Link
                  href={`/reports/${encodeURIComponent(reportId)}`}
                  className="inline-flex items-center gap-1 text-[#a4e5d2]"
                >
                  Open saved report
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              )}
            </CardContent>
          </Card>
          {execution.error && (
            <section className="rounded-lg border border-[#6b4842] bg-[#322522] px-4 py-3 text-xs leading-relaxed text-[#edbcb2]">
              {execution.error}
            </section>
          )}
          {execution.result && (
            <Card className="gap-0 rounded-[11px] bg-card py-0 ring-[#2b3039]">
              <CardHeader className="border-b border-[#292e37] px-6 py-[22px]">
                <h2 className="text-sm font-medium">Final result</h2>
              </CardHeader>
              <CardContent className="px-6 py-5">
                <pre className="overflow-x-auto text-xs leading-relaxed whitespace-pre-wrap text-[#c5ccd6]">
                  {execution.result}
                </pre>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function readReportId(result?: string) {
  if (!result) return "";
  try {
    const parsed: unknown = JSON.parse(result);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "reportId" in parsed &&
      typeof parsed.reportId === "string"
    ) {
      return parsed.reportId;
    }
  } catch {
    return "";
  }
  return "";
}
