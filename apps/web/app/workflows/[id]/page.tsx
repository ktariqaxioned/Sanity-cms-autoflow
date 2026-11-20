import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getSanityClient } from "@autoflow/sanity-client";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Hand,
  ListTodo,
  Workflow,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import RunWorkflowButton from "../RunWorkflowButton";
import WorkflowActions from "../WorkflowActions";
import {
  canRunWorkflow,
  formatWorkflowDate,
  stepDescription,
  WorkflowIcon,
  WorkflowStatus,
  type WorkflowItem,
} from "../workflow-ui";

type Execution = {
  _id: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  reportId?: string;
};
type WorkflowDetails = WorkflowItem & { recentExecutions: Execution[] };

export default async function WorkflowDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const workflow = await getSanityClient().fetch<WorkflowDetails | null>(
    `*[_type == "workflow" && _id == $id && !(_id in path("drafts.**"))][0] {
      _id, name, description, status, trigger, steps, "createdAt": coalesce(createdAt, _createdAt), lastExecutedAt,
      "recentExecutions": *[_type == "workflowExecution" && workflow._ref == ^._id]
        | order(startedAt desc)[0...5] {
          _id, status, startedAt, completedAt, error,
          "reportId": *[_type == "taskReport" && execution._ref == ^._id][0]._id
        }
    }`,
    { id },
  );
  if (!workflow) notFound();
  const steps = workflow.steps ?? [];
  const runnable = canRunWorkflow(steps);

  return (
    <>
      <Link
        href="/workflows"
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-[#a4e5d2] hover:text-primary"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        All workflows
      </Link>
      <header className="mb-8 flex items-center justify-between gap-6 max-[1020px]:flex-col max-[1020px]:items-stretch max-[440px]:items-start">
        <div className="flex items-start gap-4 max-[760px]:gap-3">
          <WorkflowIcon steps={steps} />
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-medium tracking-tight max-[760px]:text-[26px]">
                {workflow.name}
              </h1>
              <WorkflowStatus status={workflow.status} />
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-[#99a1ad]">
              {workflow.description ||
                "Your steps, connected in one simple workflow."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 max-[1020px]:self-end max-[440px]:self-start">
          <WorkflowActions
            id={workflow._id}
            name={workflow.name}
            status={workflow.status}
            redirectOnDelete
          />
          <RunWorkflowButton workflowId={workflow._id} disabled={!runnable} />
        </div>
      </header>
      {!runnable && (
        <p className="mb-6 rounded-lg border border-[#514630] bg-[#322c20] px-4 py-3 text-xs leading-relaxed text-[#d4bb89]">
          This workflow contains steps that aren&apos;t available yet. Workflows
          using Fetch tasks and Generate task report can run now.
        </p>
      )}
      <div className="grid grid-cols-[minmax(0,1fr)_260px] items-start gap-6 max-[1200px]:grid-cols-[minmax(0,1fr)_225px] max-[1200px]:gap-4 max-[1020px]:grid-cols-1">
        <div className="grid gap-6">
          <Card className="gap-0 rounded-[11px] bg-card py-0 ring-[#2b3039]">
            <CardHeader className="flex-row items-center justify-between border-b border-[#292e37] px-6 py-[22px] max-[760px]:p-5">
              <div>
                <p className="mb-1 text-[9px] font-semibold tracking-[0.18em] text-[#929ba7] uppercase">
                  From start to finish
                </p>
                <h2 id="workflow-flow-heading" className="text-sm font-medium">
                  The workflow
                </h2>
              </div>
              <Badge
                variant="outline"
                className="h-auto rounded-md border-[#363c46] bg-[#20252d] px-2 py-1 text-[10px] text-[#a2acb9]"
              >
                {steps.length} {steps.length === 1 ? "step" : "steps"}
              </Badge>
            </CardHeader>
            <CardContent className="px-6 py-7 max-[760px]:px-5 max-[760px]:py-6">
              <ol>
                <li className="relative flex items-start gap-4 pb-6 before:absolute before:top-8 before:bottom-0 before:left-4 before:w-px before:bg-[#384139] max-[760px]:gap-3">
                  <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-lg border border-[#5c5037] bg-[#352f23] text-[#e3cd9d]">
                    <Hand size={17} aria-hidden="true" />
                  </span>
                  <div>
                    <span className="text-[10px] tracking-wide text-[#8796a5] uppercase">
                      Start here
                    </span>
                    <h3 className="text-sm font-medium">
                      {workflow.trigger?.type === "manual" ||
                      !workflow.trigger?.type
                        ? "Run when you’re ready"
                        : "Start a manual run"}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Click Run workflow to start these steps.
                    </p>
                  </div>
                </li>
                {steps.map((step, index) => {
                  const Icon =
                    step.action === "generateTaskReport"
                      ? FileText
                      : step.action === "fetchTasks"
                        ? ListTodo
                        : Workflow;
                  return (
                    <li
                      key={step.stepId}
                      className="relative flex items-start gap-4 pb-6 before:absolute before:top-8 before:bottom-0 before:left-4 before:w-px before:bg-[#384139] max-[760px]:gap-3"
                    >
                      <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-lg border border-[#3d4943] bg-[#242d28] text-[10px] text-[#b0ccbc]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1 rounded-lg border border-[#2e343d] bg-[#14171c] p-4 max-[760px]:p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="grid size-8 place-items-center rounded-lg bg-[#242b2a] text-primary">
                            <Icon size={19} aria-hidden="true" />
                          </span>
                          <span className="text-[10px] tracking-wide text-[#8796a5] uppercase">
                            {step.type === "ai"
                              ? "AI processing · coming later"
                              : step.type === "condition"
                                ? "Condition · coming later"
                                : "Action"}
                          </span>
                        </div>
                        <h3 className="text-sm font-medium">
                          {step.name || `Step ${index + 1}`}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {stepDescription(step)}
                        </p>
                        {step.action === "generateTaskReport" && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {["Incomplete", "High priority", "Saved report"].map(
                              (tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="h-auto rounded-md px-2 py-0.5 text-[10px]"
                                >
                                  {tag}
                                </Badge>
                              ),
                            )}
                          </div>
                        )}
                        {step.action === "fetchTasks" && (
                          <span className="mt-3 inline-flex text-[11px] text-[#9bb3a8]">
                            Includes non-archived tasks
                          </span>
                        )}
                        {step.action === "fetchTasks" && (
                          <details className="mt-3 text-xs text-muted-foreground">
                            <summary className="cursor-pointer text-[#c5ccd6]">
                              Step settings
                            </summary>
                            <p className="mt-2 leading-relaxed">
                              Retrieve up to {taskLimit(step.config)} tasks,
                              most recently created first.
                            </p>
                          </details>
                        )}
                      </div>
                    </li>
                  );
                })}
                <li className="flex items-center gap-4 text-xs text-muted-foreground max-[760px]:gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-[#3d4943] bg-[#1c2420] text-primary">
                    <Check size={15} aria-hidden="true" />
                  </span>
                  <span>End of workflow</span>
                </li>
              </ol>
            </CardContent>
          </Card>
          <Card className="gap-0 rounded-[11px] bg-card py-0 ring-[#2b3039]">
            <CardHeader className="flex-row items-center justify-between border-b border-[#292e37] px-6 py-[22px]">
              <div>
                <p className="mb-1 text-[9px] font-semibold tracking-[0.18em] text-[#929ba7] uppercase">
                  A little peace of mind
                </p>
                <h2 id="recent-runs-heading" className="text-sm font-medium">
                  Recent runs
                </h2>
              </div>
              <Clock3 size={18} className="text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent className="p-0">
              {workflow.recentExecutions.length ? (
                <ul>
                  {workflow.recentExecutions.map((execution) => {
                    const Icon =
                      execution.status === "completed"
                        ? CheckCircle2
                        : execution.status === "failed"
                          ? XCircle
                          : Clock3;
                    return (
                      <li
                        key={execution._id}
                        className="flex items-start gap-3 border-b border-[#292e37] px-6 py-4 last:border-0"
                      >
                        <span
                          className={cn(
                            "mt-0.5 text-muted-foreground",
                            execution.status === "completed" && "text-[#9acbac]",
                            execution.status === "failed" && "text-[#e0aaa4]",
                          )}
                        >
                          <Icon size={18} aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <strong className="block text-sm font-medium capitalize">
                            {execution.status}
                          </strong>
                          <span className="text-xs text-muted-foreground">
                            {formatWorkflowDate(execution.startedAt)}
                          </span>
                          {execution.error && (
                            <p className="mt-1 text-xs leading-relaxed text-[#e0aaa4]">
                              {execution.error}
                            </p>
                          )}
                        </div>
                        {execution.reportId && (
                          <Link
                            href={`/reports/${encodeURIComponent(execution.reportId)}`}
                            className="inline-flex items-center gap-1 text-xs text-[#a4e5d2] hover:text-primary"
                          >
                            View report
                            <ArrowUpRight size={14} aria-hidden="true" />
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex flex-col items-start gap-2 px-6 py-8 text-muted-foreground">
                  <Clock3 size={23} aria-hidden="true" />
                  <h3 className="text-sm font-medium text-foreground">
                    Your first run starts here.
                  </h3>
                  <p className="text-xs leading-relaxed">
                    Run this workflow to see its activity here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <aside
          className="grid gap-4 max-[1020px]:grid-cols-2 max-[760px]:grid-cols-1"
          aria-label="Workflow overview"
        >
          <Card className="gap-0 rounded-[11px] bg-card py-0 ring-[#2b3039]">
            <CardHeader className="border-b border-[#292e37] px-6 py-[22px]">
              <h2 className="text-sm font-medium">At a glance</h2>
            </CardHeader>
            <CardContent className="px-6 py-2">
              <dl>
                <OverviewRow label="Starts">
                  <Hand size={14} aria-hidden="true" />
                  On demand
                </OverviewRow>
                <OverviewRow label="Steps">
                  {steps.length} {steps.length === 1 ? "action" : "actions"}
                </OverviewRow>
                <OverviewRow label="Last run">
                  {formatWorkflowDate(workflow.lastExecutedAt)}
                </OverviewRow>
                <OverviewRow label="Created">
                  {workflow.createdAt
                    ? formatWorkflowDate(workflow.createdAt)
                    : "Not recorded"}
                </OverviewRow>
              </dl>
              {workflow.trigger?.type !== "manual" && workflow.trigger?.type && (
                <div className="my-4 flex gap-3 rounded-lg border border-[#514630] bg-[#322c20] p-3 text-[#d4bb89]">
                  <CalendarClock size={17} aria-hidden="true" className="mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-xs">
                      {workflow.trigger.type === "schedule"
                        ? "Schedule saved"
                        : "Document event saved"}
                    </strong>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#c4b48a]">
                      Automatic triggers are coming later. You can run supported
                      steps manually now.
                    </p>
                    {workflow.trigger.cron && (
                      <code className="mt-2 block text-[11px]">
                        {workflow.trigger.cron} ·{" "}
                        {workflow.trigger.timezone || "Asia/Kolkata"}
                      </code>
                    )}
                    {workflow.trigger.documentType && (
                      <span className="mt-2 block text-[11px]">
                        Document: {workflow.trigger.documentType}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          {steps.some((step) => step.action === "generateTaskReport") && (
            <section className="rounded-[11px] border border-[#31443d] bg-[#17211e] p-5 text-[#c5ddd2]">
              <FileText size={21} aria-hidden="true" />
              <h2 className="mt-3 text-sm font-medium">
                A report you can come back to.
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-[#9bb3a8]">
                Every run saves a separate snapshot. Find it in Reports, even
                after your tasks change.
              </p>
              <Link
                href="/reports"
                className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#a4e5d2]"
              >
                Browse saved reports
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}

function OverviewRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#292e37] py-3 text-xs last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="inline-flex items-center gap-1.5 text-right">{children}</dd>
    </div>
  );
}

function taskLimit(value?: string) {
  try {
    const config: unknown = JSON.parse(value || "{}");
    if (
      typeof config === "object" &&
      config !== null &&
      "limit" in config &&
      typeof config.limit === "number" &&
      Number.isInteger(config.limit) &&
      config.limit > 0
    )
      return Math.min(config.limit, 50);
    return 50;
  } catch {
    return 50;
  }
}
