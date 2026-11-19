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
      <Link className="wf-back-link" href="/workflows">
        <ArrowLeft size={15} aria-hidden="true" />
        All workflows
      </Link>
      <header className="wf-page-heading wf-detail-heading">
        <div className="wf-detail-title">
          <WorkflowIcon steps={steps} />
          <div>
            <div className="wf-heading-with-badge">
              <h1>{workflow.name}</h1>
              <WorkflowStatus status={workflow.status} />
            </div>
            <p>
              {workflow.description ||
                "Your steps, connected in one simple workflow."}
            </p>
          </div>
        </div>
        <div className="wf-detail-actions">
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
        <p className="wf-notice">
          This workflow contains steps that aren&apos;t available yet. Workflows
          using Fetch tasks and Generate task report can run now.
        </p>
      )}
      <div className="wf-detail-grid">
        <div>
          <section className="wf-panel" aria-labelledby="workflow-flow-heading">
            <div className="wf-panel-heading">
              <div>
                <p className="wf-eyebrow">From start to finish</p>
                <h2 id="workflow-flow-heading">The workflow</h2>
              </div>
              <span className="wf-muted-tag">
                {steps.length} {steps.length === 1 ? "step" : "steps"}
              </span>
            </div>
            <ol className="wf-flow">
              <li className="wf-flow-item">
                <span className="wf-flow-marker wf-trigger-marker">
                  <Hand size={17} aria-hidden="true" />
                </span>
                <div className="wf-flow-body">
                  <span className="wf-flow-label">Start here</span>
                  <h3>
                    {workflow.trigger?.type === "manual" ||
                    !workflow.trigger?.type
                      ? "Run when you’re ready"
                      : "Start a manual run"}
                  </h3>
                  <p>Click Run workflow to start these steps.</p>
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
                  <li key={step.stepId} className="wf-flow-item">
                    <span className="wf-flow-marker">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="wf-step-node">
                      <div className="wf-step-node-header">
                        <span className="wf-step-icon">
                          <Icon size={19} aria-hidden="true" />
                        </span>
                        <span className="wf-flow-label">
                          {step.type === "ai"
                            ? "AI processing · coming later"
                            : step.type === "condition"
                              ? "Condition · coming later"
                              : "Action"}
                        </span>
                      </div>
                      <h3>{step.name || `Step ${index + 1}`}</h3>
                      <p>{stepDescription(step)}</p>
                      {step.action === "generateTaskReport" && (
                        <div className="wf-node-tags">
                          <span>Incomplete</span>
                          <span>High priority</span>
                          <span>Saved report</span>
                        </div>
                      )}
                      {step.action === "fetchTasks" && (
                        <span className="wf-step-note">
                          Includes non-archived tasks
                        </span>
                      )}
                      {step.action === "fetchTasks" && (
                        <details className="wf-step-settings">
                          <summary>Step settings</summary>
                          <p>
                            Retrieve up to {taskLimit(step.config)} tasks, most
                            recently created first.
                          </p>
                        </details>
                      )}
                    </div>
                  </li>
                );
              })}
              <li className="wf-flow-item wf-flow-end">
                <span className="wf-flow-marker">
                  <Check size={15} aria-hidden="true" />
                </span>
                <span>End of workflow</span>
              </li>
            </ol>
          </section>
          <section
            className="wf-panel wf-recent-panel"
            aria-labelledby="recent-runs-heading"
          >
            <div className="wf-panel-heading">
              <div>
                <p className="wf-eyebrow">A little peace of mind</p>
                <h2 id="recent-runs-heading">Recent runs</h2>
              </div>
              <Clock3 size={18} className="wf-muted-icon" aria-hidden="true" />
            </div>
            {workflow.recentExecutions.length ? (
              <ul className="wf-run-list">
                {workflow.recentExecutions.map((execution) => {
                  const Icon =
                    execution.status === "completed"
                      ? CheckCircle2
                      : execution.status === "failed"
                        ? XCircle
                        : Clock3;
                  return (
                    <li key={execution._id}>
                      <span
                        className="wf-execution-icon"
                        data-status={execution.status}
                      >
                        <Icon size={18} aria-hidden="true" />
                      </span>
                      <div>
                        <strong className="wf-capitalize">
                          {execution.status}
                        </strong>
                        <span>{formatWorkflowDate(execution.startedAt)}</span>
                        {execution.error && (
                          <p className="wf-execution-error">
                            {execution.error}
                          </p>
                        )}
                      </div>
                      {execution.reportId && (
                        <Link
                          href={`/reports/${encodeURIComponent(execution.reportId)}`}
                          className="wf-text-link"
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
              <div className="wf-inline-empty">
                <Clock3 size={23} aria-hidden="true" />
                <h3>Your first run starts here.</h3>
                <p>Run this workflow to see its activity here.</p>
              </div>
            )}
          </section>
        </div>
        <aside className="wf-detail-aside" aria-label="Workflow overview">
          <section className="wf-panel">
            <div className="wf-panel-heading">
              <h2>At a glance</h2>
            </div>
            <dl className="wf-overview">
              <div>
                <dt>Starts</dt>
                <dd>
                  <Hand size={14} aria-hidden="true" />
                  On demand
                </dd>
              </div>
              <div>
                <dt>Steps</dt>
                <dd>
                  {steps.length} {steps.length === 1 ? "action" : "actions"}
                </dd>
              </div>
              <div>
                <dt>Last run</dt>
                <dd>{formatWorkflowDate(workflow.lastExecutedAt)}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>
                  {workflow.createdAt
                    ? formatWorkflowDate(workflow.createdAt)
                    : "Not recorded"}
                </dd>
              </div>
            </dl>
            {workflow.trigger?.type !== "manual" && workflow.trigger?.type && (
              <div className="wf-schedule-note">
                <CalendarClock size={17} aria-hidden="true" />
                <div>
                  <strong>
                    {workflow.trigger.type === "schedule"
                      ? "Schedule saved"
                      : "Document event saved"}
                  </strong>
                  <p>
                    Automatic triggers are coming later. You can run supported
                    steps manually now.
                  </p>
                  {workflow.trigger.cron && (
                    <code>
                      {workflow.trigger.cron} ·{" "}
                      {workflow.trigger.timezone || "Asia/Kolkata"}
                    </code>
                  )}
                  {workflow.trigger.documentType && (
                    <span>Document: {workflow.trigger.documentType}</span>
                  )}
                </div>
              </div>
            )}
          </section>
          {steps.some((step) => step.action === "generateTaskReport") && (
            <section className="wf-output-note">
              <FileText size={21} aria-hidden="true" />
              <h2>A report you can come back to.</h2>
              <p>
                Every run saves a separate snapshot. Find it in Reports, even
                after your tasks change.
              </p>
              <Link href="/reports">
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
