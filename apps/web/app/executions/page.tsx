import Link from "next/link";
import { connection } from "next/server";
import { fetchWorkflowExecutions } from "@autoflow/sanity-client";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatWorkflowDate } from "../workflows/workflow-ui";
import { executionDuration, ExecutionStatus } from "./execution-ui";

export default async function ExecutionsPage() {
  await connection();
  const executions = await fetchWorkflowExecutions(undefined, 50);

  return (
    <>
      <header className="mb-8">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-[#929ba7] uppercase">
          What already ran
        </p>
        <h1 className="mt-2.5 text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-medium tracking-tight">
          Execution history
        </h1>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-[#99a1ad]">
          Every manual run is saved with its status, timing, and logs.
        </p>
      </header>
      <Card className="gap-0 rounded-[11px] bg-card py-0 ring-[#2b3039]">
        <CardHeader className="border-b border-[#292e37] px-6 py-[22px]">
          <h2 className="text-sm font-medium">Recent runs</h2>
        </CardHeader>
        {executions.length ? (
          <ul>
            {executions.map((execution) => (
              <li
                key={execution._id}
                className="grid gap-3 border-b border-[#292e37] px-6 py-4 last:border-0 sm:grid-cols-[minmax(0,1.4fr)_120px_160px_90px_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <Link
                    href={`/executions/${encodeURIComponent(execution._id)}`}
                    className="block truncate text-sm font-medium hover:text-[#c4f2e2]"
                  >
                    {execution.workflow?.name || "Untitled workflow"}
                  </Link>
                  {execution.error && (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#e0aaa4]">
                      {execution.error}
                    </p>
                  )}
                </div>
                <ExecutionStatus status={execution.status} />
                <span className="text-xs text-muted-foreground">
                  {formatWorkflowDate(execution.startedAt)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {executionDuration(execution.startedAt, execution.completedAt)}
                </span>
                <Link
                  href={`/executions/${encodeURIComponent(execution._id)}`}
                  className="inline-flex items-center gap-1 text-xs text-[#a4e5d2]"
                >
                  Details
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <CardContent className="flex flex-col items-start gap-2 py-10 text-muted-foreground">
            <Clock3 size={24} aria-hidden="true" />
            <h2 className="text-sm font-medium text-foreground">No runs yet</h2>
            <p className="max-w-md text-xs leading-relaxed">
              Run a workflow and its result will be listed here.
            </p>
          </CardContent>
        )}
      </Card>
    </>
  );
}
