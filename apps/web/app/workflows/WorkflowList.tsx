"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowRight,
  Clock3,
  FileText,
  GitBranch,
  Plus,
  Search,
  X,
} from "lucide-react";
import WorkflowActions from "./WorkflowActions";
import RunWorkflowButton from "./RunWorkflowButton";
import {
  canRunWorkflow,
  formatWorkflowDate,
  TriggerLabel,
  WorkflowIcon,
  WorkflowStatus,
  type WorkflowItem,
} from "./workflow-ui";

const filters = [
  { value: "all", label: "All workflows" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Drafts" },
  { value: "paused", label: "Paused" },
] as const;

export default function WorkflowList({
  workflows,
}: {
  workflows: WorkflowItem[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [sort, setSort] = useState("newest");
  const counts = {
    all: workflows.length,
    active: workflows.filter((w) => w.status === "active").length,
    draft: workflows.filter((w) => w.status === "draft").length,
    paused: workflows.filter((w) => w.status === "paused").length,
  };
  const filtered = workflows.filter(
    (workflow) =>
      (status === "all" || workflow.status === status) &&
      `${workflow.name} ${workflow.description ?? ""}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const visible = [...filtered].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    const date = (value?: string) =>
      value && !Number.isNaN(Date.parse(value)) ? Date.parse(value) : 0;
    return sort === "recent"
      ? date(b.lastExecutedAt) - date(a.lastExecutedAt)
      : date(b.createdAt) - date(a.createdAt);
  });

  return (
    <>
      <header className="wf-page-heading">
        <div>
          <p className="wf-eyebrow">Your automation workspace</p>
          <h1>
            Workflows<span className="wf-title-count">{workflows.length}</span>
          </h1>
          <p>Less repetition. More room for what matters.</p>
        </div>
        <Link href="/workflows/new" className="wf-button wf-button-primary">
          <Plus size={17} aria-hidden="true" />
          New workflow
        </Link>
      </header>

      <section className="wf-starter" aria-labelledby="workflow-starter-title">
        <div className="wf-starter-symbol">
          <FileText size={27} strokeWidth={1.5} aria-hidden="true" />
        </div>
        <div className="wf-starter-copy">
          <span className="wf-eyebrow">A useful place to start</span>
          <h2 id="workflow-starter-title">
            Your priorities. One clear report.
          </h2>
          <p>
            Find incomplete high-priority tasks and save a snapshot of what
            needs your attention.
          </p>
        </div>
        <Link href="/reports" className="wf-button wf-button-secondary">
          Open task reports
          <ArrowUpRightIcon />
        </Link>
        <div className="wf-starter-decoration" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      <section aria-label="Workflow collection">
        <div className="wf-collection-toolbar">
          <div
            className="wf-tabs"
            role="group"
            aria-label="Filter workflows by status"
          >
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={status === filter.value}
                onClick={() => setStatus(filter.value)}
              >
                {filter.label}
                <span>{counts[filter.value]}</span>
              </button>
            ))}
          </div>
          <span className="wf-collection-caption">Built around your day</span>
        </div>
        <div className="wf-search-toolbar">
          <div className="wf-search">
            <Search size={17} aria-hidden="true" />
            <label htmlFor="workflow-search" className="wf-sr-only">
              Search workflows
            </label>
            <input
              id="workflow-search"
              type="search"
              placeholder="Search your workflows…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
              >
                <X size={15} aria-hidden="true" />
              </button>
            )}
          </div>
          <label className="wf-sort">
            <ArrowDownWideNarrow size={16} aria-hidden="true" />
            <span className="wf-sr-only">Sort workflows</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="recent">Recently run</option>
              <option value="name">Name A–Z</option>
            </select>
          </label>
        </div>
        <p className="wf-sr-only" role="status">
          {visible.length} {visible.length === 1 ? "workflow" : "workflows"}{" "}
          found
        </p>
        {visible.length ? (
          <div className="wf-card-grid">
            {visible.map((workflow) => (
              <article className="wf-card" key={workflow._id}>
                <div className="wf-card-top">
                  <WorkflowIcon steps={workflow.steps} />
                  <WorkflowStatus status={workflow.status} />
                </div>
                <Link
                  href={`/workflows/${encodeURIComponent(workflow._id)}`}
                  className="wf-card-title"
                >
                  <h2>{workflow.name}</h2>
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <p className="wf-card-description">
                  {workflow.description ||
                    "A little help with your everyday work."}
                </p>
                <div className="wf-card-meta">
                  <TriggerLabel type={workflow.trigger?.type} />
                  <span>
                    <GitBranch size={13} aria-hidden="true" />
                    {workflow.steps?.length ?? 0}{" "}
                    {(workflow.steps?.length ?? 0) === 1 ? "step" : "steps"}
                  </span>
                </div>
                <div className="wf-step-preview" aria-label="Workflow steps">
                  {workflow.steps?.slice(0, 2).map((step, index) => (
                    <span key={step.stepId}>
                      {index > 0 && <ArrowRight size={11} aria-hidden="true" />}
                      <span className="wf-step-chip">
                        {step.name || `Step ${index + 1}`}
                      </span>
                    </span>
                  ))}
                  {(workflow.steps?.length ?? 0) > 2 && (
                    <span className="wf-more-steps">
                      +{(workflow.steps?.length ?? 0) - 2}
                    </span>
                  )}
                  {!workflow.steps?.length && <span>No steps configured</span>}
                </div>
                <div className="wf-card-footer">
                  <span className="wf-last-run">
                    <Clock3 size={13} aria-hidden="true" />
                    <span>
                      {!canRunWorkflow(workflow.steps)
                        ? "Needs supported steps"
                        : workflow.lastExecutedAt
                          ? `Last run ${formatWorkflowDate(workflow.lastExecutedAt)}`
                          : "Ready for a first run"}
                    </span>
                  </span>
                  <div className="wf-card-controls">
                    <WorkflowActions
                      id={workflow._id}
                      status={workflow.status}
                      name={workflow.name}
                    />
                    <RunWorkflowButton
                      workflowId={workflow._id}
                      workflowName={workflow.name}
                      compact
                      disabled={!canRunWorkflow(workflow.steps)}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="wf-empty">
            <span className="wf-empty-icon">
              <GitBranch size={29} aria-hidden="true" />
            </span>
            <h2>
              {workflows.length
                ? "No workflows found"
                : "Give your busywork a workflow."}
            </h2>
            <p>
              {workflows.length
                ? "Try a different search or status to find what you’re looking for."
                : "Start with a task report, or build a simple workflow of your own."}
            </p>
            {workflows.length ? (
              <button
                className="wf-button wf-button-secondary"
                type="button"
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                }}
              >
                Clear filters
              </button>
            ) : (
              <Link
                href="/workflows/new"
                className="wf-button wf-button-primary"
              >
                <Plus size={16} aria-hidden="true" />
                Create your first workflow
              </Link>
            )}
          </div>
        )}
        <div className="wf-collection-footer">
          <span>
            {visible.length} of {workflows.length} workflows
          </span>
          <span>
            <span className="wf-small-dot" />
            Every small workflow adds up.
          </span>
        </div>
      </section>
    </>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}
