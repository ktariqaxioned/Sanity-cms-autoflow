"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowRight,
  ArrowUpRight,
  Clock3,
  FileText,
  GitBranch,
  Plus,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      <header className="mb-8 flex items-center justify-between gap-6 max-[440px]:flex-col max-[440px]:items-start">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] text-[#929ba7] uppercase max-[760px]:text-[9px] max-[760px]:tracking-[0.13em]">
            Your automation workspace
          </p>
          <h1 className="mt-2.5 mb-2 flex flex-wrap items-center gap-3 text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-medium tracking-tight max-[760px]:text-[30px]">
            Workflows
            <span className="grid h-6 min-w-7 place-items-center rounded-md border border-[#343943] px-1.5 text-xs font-medium tracking-normal text-[#b0b7c1]">
              {workflows.length}
            </span>
          </h1>
          <p className="text-[13px] leading-relaxed text-[#99a1ad] max-[760px]:text-xs">
            Less repetition. More room for what matters.
          </p>
        </div>
        <Button asChild className="max-[440px]:self-start">
          <Link href="/workflows/new">
            <Plus size={17} aria-hidden="true" />
            New workflow
          </Link>
        </Button>
      </header>

      <section
        className="relative mb-8 flex items-center gap-5 overflow-hidden rounded-xl border border-[#31443d] bg-[#17211e] bg-[radial-gradient(ellipse_at_90%_30%,#243e323b,transparent_65%)] px-7 py-6 max-[1200px]:gap-4 max-[1200px]:p-5 max-[760px]:mb-6 max-[760px]:flex-wrap max-[760px]:gap-4 max-[760px]:p-5"
        aria-labelledby="workflow-starter-title"
      >
        <div className="grid h-[62px] w-[58px] shrink-0 -rotate-6 place-items-center rounded-xl border border-[#3d5b4c] bg-[#243c30] text-[#b1e4ca] shadow-md max-[1200px]:hidden">
          <FileText size={27} strokeWidth={1.5} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 max-[760px]:basis-full">
          <span className="text-[10px] font-semibold tracking-[0.18em] text-[#929ba7] uppercase">
            A useful place to start
          </span>
          <h2
            id="workflow-starter-title"
            className="mt-1 text-lg font-medium tracking-tight"
          >
            Your priorities. One clear report.
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-[#9aa6a0]">
            Find incomplete high-priority tasks and save a snapshot of what
            needs your attention.
          </p>
        </div>
        <div className="relative z-10 ml-auto grid min-w-60 shrink-0 place-items-center self-stretch max-[760px]:ml-0 max-[760px]:min-w-0 max-[760px]:self-auto">
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 size-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#7ea48a]/18 max-[760px]:size-[280px]"
            aria-hidden="true"
          >
            <span className="absolute inset-[34px] rounded-full border border-[#7ea48a]/16" />
            <span className="absolute inset-[68px] rounded-full border border-[#7ea48a]/16" />
            <span className="absolute inset-[102px] rounded-full border border-[#7ea48a]/16" />
            <span className="absolute inset-[136px] rounded-full border border-[#7ea48a]/16" />
          </div>
          <Button
            asChild
            variant="secondary"
            className="relative z-10 max-[760px]:h-9 max-[760px]:text-[11px]"
          >
            <Link href="/reports">
              Open task reports
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <section aria-label="Workflow collection">
        <div className="flex items-center justify-between gap-4 border-b border-[#2a2e36]">
          <div
            className="flex items-center gap-6 max-[760px]:gap-5 max-[440px]:w-full max-[440px]:justify-between max-[440px]:gap-4"
            role="group"
            aria-label="Filter workflows by status"
          >
            {filters.map((filter) => {
              const pressed = status === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => setStatus(filter.value)}
                  className={`-mb-px flex min-h-[43px] cursor-pointer items-center gap-1.5 border-b-2 pb-4 text-xs whitespace-nowrap hover:text-[#e4e9f0] max-[760px]:gap-1 max-[760px]:text-[11px] max-[440px]:gap-1 max-[440px]:text-[10px] ${pressed ? "border-primary text-[#c0f1e2]" : "border-transparent text-[#929aa6]"}`}
                >
                  {filter.label}
                  <span
                    className={`rounded px-1 text-[10px] max-[440px]:px-1 max-[440px]:text-[9px] ${pressed ? "border border-[#385048] bg-[#23372f] text-[#b7e7d8]" : "border border-[#30353e] bg-[#1a1e25] text-[#a7b1bc]"}`}
                  >
                    {counts[filter.value]}
                  </span>
                </button>
              );
            })}
          </div>
          <span className="pb-3 text-[11px] text-[#747e8b] max-[1020px]:hidden">
            Built around your day
          </span>
        </div>
        <div className="my-6 flex items-center justify-between gap-3.5 max-[440px]:gap-2">
          <div className="flex h-[38px] w-80 min-w-0 items-center gap-2.5 rounded-md border border-[#2e333d] bg-[#15181e] px-3 text-[#7a8493] focus-within:border-[#6d9f90] max-[440px]:flex-1 max-[440px]:gap-2 max-[440px]:px-2">
            <Search size={17} aria-hidden="true" />
            <label htmlFor="workflow-search" className="sr-only">
              Search workflows
            </label>
            <Input
              id="workflow-search"
              type="search"
              placeholder="Search your workflows…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-auto border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0 max-[440px]:text-[11px]"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                className="cursor-pointer text-[#99a3b1]"
                onClick={() => setQuery("")}
              >
                <X size={15} aria-hidden="true" />
              </button>
            )}
          </div>
          <label className="flex h-[38px] items-center gap-2 rounded-md border border-[#2e333d] bg-[#15181e] px-3 text-[#99a3b1] max-[440px]:gap-1 max-[440px]:px-2">
            <ArrowDownWideNarrow
              size={16}
              aria-hidden="true"
              className="max-[440px]:hidden"
            />
            <span className="sr-only">Sort workflows</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="cursor-pointer bg-transparent text-xs text-foreground outline-none max-[440px]:max-w-[105px] max-[440px]:text-[11px]"
            >
              <option value="newest">Newest first</option>
              <option value="recent">Recently run</option>
              <option value="name">Name A–Z</option>
            </select>
          </label>
        </div>
        <p className="sr-only" role="status">
          {visible.length} {visible.length === 1 ? "workflow" : "workflows"}{" "}
          found
        </p>
        {visible.length ? (
          <div className="grid grid-cols-2 gap-5 max-[1020px]:grid-cols-1 max-[440px]:gap-4">
            {visible.map((workflow) => (
              <article
                className="flex min-w-0 flex-col rounded-[11px] border border-[#2b3039] bg-[#181b21] px-[22px] pt-[22px] transition-shadow hover:border-[#46544f] hover:shadow-[0_5px_20px_#0002] max-[1200px]:px-[18px] max-[1200px]:pt-5"
                key={workflow._id}
              >
                <div className="mb-5 flex items-center justify-between">
                  <WorkflowIcon steps={workflow.steps} />
                  <WorkflowStatus status={workflow.status} />
                </div>
                <Link
                  href={`/workflows/${encodeURIComponent(workflow._id)}`}
                  className="group flex items-start justify-between gap-3.5"
                >
                  <h2 className="text-base leading-snug font-medium tracking-tight wrap-anywhere group-hover:text-[#c4f2e2]">
                    {workflow.name}
                  </h2>
                  <ArrowRight
                    size={17}
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-[#6c7685] transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                </Link>
                <p className="mt-2 line-clamp-2 min-h-[38px] text-xs leading-loose text-[#939dab]">
                  {workflow.description ||
                    "A little help with your everyday work."}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3.5 text-[10px] text-[#9ba4af] max-[440px]:gap-3">
                  <TriggerLabel type={workflow.trigger?.type} />
                  <span className="inline-flex items-center gap-1.5 border-l border-[#3b4049] pl-3.5">
                    <GitBranch size={13} aria-hidden="true" />
                    {workflow.steps?.length ?? 0}{" "}
                    {(workflow.steps?.length ?? 0) === 1 ? "step" : "steps"}
                  </span>
                </div>
                <div
                  className="mb-2 flex min-h-[51px] items-center gap-1.5 text-[10px] text-[#818b99]"
                  aria-label="Workflow steps"
                >
                  {workflow.steps?.slice(0, 2).map((step, index) => (
                    <span key={step.stepId} className="inline-flex min-w-0 items-center gap-1.5">
                      {index > 0 && <ArrowRight size={11} aria-hidden="true" />}
                      <span className="block max-w-[180px] truncate rounded border border-[#303641] bg-[#20242c] px-1.5 py-0.5 text-[#b5bdc8] max-[1200px]:max-w-[130px] max-[440px]:max-w-[120px]">
                        {step.name || `Step ${index + 1}`}
                      </span>
                    </span>
                  ))}
                  {(workflow.steps?.length ?? 0) > 2 && (
                    <span className="shrink-0 text-[10px] text-[#a9b2be]">
                      +{(workflow.steps?.length ?? 0) - 2}
                    </span>
                  )}
                  {!workflow.steps?.length && <span>No steps configured</span>}
                </div>
                <div className="mt-auto -mx-[22px] flex items-center justify-between gap-2.5 rounded-b-[11px] border-t border-[#2a3038] bg-[#15181e] px-[17px] py-3.5 max-[1200px]:-mx-[18px] max-[1200px]:px-3">
                  <span className="flex min-w-0 items-center gap-1.5 text-[10px] text-[#838e9d] max-[1200px]:text-[9px]">
                    <Clock3 size={13} aria-hidden="true" className="shrink-0" />
                    <span className="truncate">
                      {!canRunWorkflow(workflow.steps)
                        ? "Needs supported steps"
                        : workflow.lastExecutedAt
                          ? `Last run ${formatWorkflowDate(workflow.lastExecutedAt)}`
                          : "Ready for a first run"}
                    </span>
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
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
          <div className="flex flex-col items-start gap-3 rounded-[11px] border border-dashed border-border bg-card/60 px-6 py-10">
            <span className="grid size-12 place-items-center rounded-xl border border-border bg-[#1c2128] text-[#b7c0cc]">
              <GitBranch size={29} aria-hidden="true" />
            </span>
            <h2 className="text-lg font-medium">
              {workflows.length
                ? "No workflows found"
                : "Give your busywork a workflow."}
            </h2>
            <p className="max-w-md text-[13px] leading-relaxed text-muted-foreground">
              {workflows.length
                ? "Try a different search or status to find what you’re looking for."
                : "Start with a task report, or build a simple workflow of your own."}
            </p>
            {workflows.length ? (
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button asChild>
                <Link href="/workflows/new">
                  <Plus size={16} aria-hidden="true" />
                  Create your first workflow
                </Link>
              </Button>
            )}
          </div>
        )}
        <div className="mt-5 flex items-center justify-between gap-3 text-[11px] text-[#747e8b] max-[760px]:text-[9px]">
          <span>
            {visible.length} of {workflows.length} workflows
          </span>
          <span className="inline-flex max-w-[155px] items-center gap-2 text-right max-[760px]:gap-1">
            <span className="size-1.5 shrink-0 rounded-full bg-primary" />
            Every small workflow adds up.
          </span>
        </div>
      </section>
    </>
  );
}
