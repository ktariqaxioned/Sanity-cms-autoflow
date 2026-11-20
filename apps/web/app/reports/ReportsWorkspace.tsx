"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  FileText,
  Flag,
  History,
  ListChecks,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import type { TaskReportSummary } from "@autoflow/sanity-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import RunWorkflowButton from "@/components/workspace/RunWorkflowButton";
import { formatDate } from "@/components/workspace/format";

export default function ReportsWorkspace({
  reports,
  loadFailed,
}: {
  reports: TaskReportSummary[];
  loadFailed: boolean;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const counts = {
    all: reports.length,
    tasks: reports.filter((report) => report.totalMatchingTasks > 0).length,
    clear: reports.filter((report) => report.totalMatchingTasks === 0).length,
  };
  const filtered = reports.filter(
    (report) =>
      (filter === "all" ||
        (filter === "tasks"
          ? report.totalMatchingTasks > 0
          : report.totalMatchingTasks === 0)) &&
      `${report.title} ${report.summary} ${formatDate(report.createdAt)}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const visible = [...filtered].sort((a, b) => {
    const date = (value: string) => Date.parse(value) || 0;
    return sort === "oldest"
      ? date(a.createdAt) - date(b.createdAt)
      : date(b.createdAt) - date(a.createdAt);
  });
  const filters = [
    { value: "all", label: "All reports" },
    { value: "tasks", label: "With tasks" },
    { value: "clear", label: "All clear" },
  ] as const;
  function clearFilters() {
    setQuery("");
    setFilter("all");
  }

  return (
    <>
      <header className="mb-8 flex items-center justify-between gap-6">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] text-[#929ba7] uppercase">
            A snapshot of what matters
          </p>
          <h1 className="mt-2.5 mb-2 flex flex-wrap items-center gap-3 text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-medium tracking-tight">
            Reports
            {!loadFailed && (
              <span className="grid h-6 min-w-7 place-items-center rounded-md border border-[#343943] px-1.5 text-xs font-medium tracking-normal text-[#b0b7c1]">
                {reports.length}
              </span>
            )}
          </h1>
          <p className="text-[13px] leading-relaxed text-[#99a1ad]">
            A clearer picture of your priorities, saved for whenever you need
            it.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 text-xs text-[#9bb3a8] max-[1020px]:hidden">
          <ShieldCheck size={15} aria-hidden="true" />
          Saved in your workspace
        </span>
      </header>
      <section
        className="relative mb-8 overflow-hidden rounded-xl border border-[#31443d] bg-[#17211e] bg-[radial-gradient(ellipse_at_90%_30%,#243e323b,transparent_65%)] p-7 max-[1200px]:p-6 max-[760px]:p-6"
        aria-labelledby="run-report-heading"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="inline-flex size-[43px] items-center justify-center rounded-[11px] border border-[#3c4347] bg-[#252e2d] text-[#bdd4ca]">
            <FileText size={25} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <Badge
            variant="outline"
            className="h-auto rounded-md border-[#363c46] bg-[#20252d] px-2 py-1 text-[10px] text-[#a2acb9]"
          >
            Run on demand
          </Badge>
        </div>
        <span className="text-[10px] font-semibold tracking-[0.18em] text-[#929ba7] uppercase">
          Your priorities, in perspective
        </span>
        <h2
          id="run-report-heading"
          className="mt-1 text-[22px] font-medium tracking-tight max-[760px]:text-[22px] max-[560px]:text-[21px]"
        >
          High-priority task report
        </h2>
        <p className="mt-2 max-w-xl text-xs leading-relaxed text-[#9aa6a0]">
          Collect your incomplete High-priority tasks into one clear, saved
          report. Each run creates a separate snapshot.
        </p>
        <ol
          className="mt-5 flex flex-wrap items-center gap-3 text-[11px] text-[#c5ddd2] max-[560px]:flex-col max-[560px]:items-start"
          aria-label="Report workflow"
        >
          <FlowStep icon={<Flag size={14} aria-hidden="true" />} label="Find matching tasks" />
          <li aria-hidden="true" className="text-[#6d9f90] max-[560px]:hidden">
            <ArrowRight size={15} />
          </li>
          <FlowStep icon={<ListChecks size={14} aria-hidden="true" />} label="Build the report" />
          <li aria-hidden="true" className="text-[#6d9f90] max-[560px]:hidden">
            <ArrowRight size={15} />
          </li>
          <FlowStep icon={<Check size={14} aria-hidden="true" />} label="Save a snapshot" />
        </ol>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <RunWorkflowButton />
          <Button asChild variant="ghost">
            <Link href="/tasks">
              Manage tasks
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-[#8ea399]">
          Includes Incomplete + High priority. Other priorities, completed
          tasks, and archived tasks are excluded.
        </p>
      </section>

      <section aria-labelledby="report-history-heading">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-[#929ba7] uppercase">
              Your saved snapshots
            </p>
            <h2 id="report-history-heading" className="mt-1 text-base font-medium">
              Report history
            </h2>
          </div>
          <History size={18} className="text-muted-foreground" aria-hidden="true" />
        </div>
        {loadFailed ? (
          <div
            className="flex gap-4 rounded-[11px] border border-[#6b4842] bg-[#322522] p-5"
            role="alert"
          >
            <span className="grid size-[34px] shrink-0 place-items-center rounded-lg bg-[#242b2a] text-primary">
              <History size={20} aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-medium text-[#edbcb2]">
                Couldn&apos;t load your saved reports.
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[#d7aaa2]">
                There was a problem reaching your workspace. Your existing
                reports haven&apos;t been changed.
              </p>
              <a
                href="/reports"
                className="mt-3 inline-flex items-center gap-1 text-xs text-[#a4e5d2]"
              >
                Reload report history
                <ArrowRight size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 border-b border-[#2a2e36]">
              <div
                className="flex items-center gap-6 max-[440px]:w-full max-[440px]:justify-between"
                role="group"
                aria-label="Filter report history"
              >
                {filters.map((item) => {
                  const pressed = filter === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      aria-pressed={pressed}
                      onClick={() => setFilter(item.value)}
                      className={`-mb-px flex min-h-[43px] cursor-pointer items-center gap-1.5 border-b-2 pb-4 text-xs whitespace-nowrap hover:text-[#e4e9f0] ${pressed ? "border-primary text-[#c0f1e2]" : "border-transparent text-[#929aa6]"}`}
                    >
                      {item.label}
                      <span
                        className={`rounded px-1 text-[10px] ${pressed ? "border border-[#385048] bg-[#23372f] text-[#b7e7d8]" : "border border-[#30353e] bg-[#1a1e25] text-[#a7b1bc]"}`}
                      >
                        {counts[item.value]}
                      </span>
                    </button>
                  );
                })}
              </div>
              <span className="pb-3 text-[11px] text-[#747e8b] max-[1020px]:hidden">
                Latest 50 reports
              </span>
            </div>
            <div className="my-6 flex items-center justify-between gap-3.5">
              <div className="flex h-[38px] w-80 min-w-0 items-center gap-2.5 rounded-md border border-[#2e333d] bg-[#15181e] px-3 text-[#7a8493] focus-within:border-[#6d9f90]">
                <Search size={17} aria-hidden="true" />
                <label className="sr-only" htmlFor="report-search">
                  Search saved reports
                </label>
                <Input
                  id="report-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Find a saved report…"
                  className="h-auto border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Clear report search"
                    className="cursor-pointer"
                    onClick={() => setQuery("")}
                  >
                    <X size={15} aria-hidden="true" />
                  </button>
                )}
              </div>
              <label className="flex h-[38px] items-center gap-2 rounded-md border border-[#2e333d] bg-[#15181e] px-3 text-[#99a3b1]">
                <ArrowDownWideNarrow size={15} aria-hidden="true" />
                <span className="sr-only">Sort reports</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="cursor-pointer bg-transparent text-xs text-foreground outline-none"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </label>
            </div>
            <span className="sr-only" role="status">
              {visible.length} reports found.
            </span>
            {visible.length ? (
              <div className="grid grid-cols-2 gap-5 max-[1020px]:grid-cols-1">
                {visible.map((report) => (
                  <Card
                    key={report._id}
                    className="gap-0 rounded-[11px] bg-[#181d23] px-6 pt-6 pb-0 ring-[#303842] transition-colors hover:ring-[#567060]"
                  >
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <span className="inline-flex size-[43px] items-center justify-center rounded-[11px] border border-[#3c4347] bg-[#252e2d] text-[#bdd4ca]">
                        <FileText size={21} aria-hidden="true" />
                      </span>
                      <Badge
                        variant="outline"
                        className="h-auto gap-1 rounded-md border-[#3a5246] bg-[#24362c] px-2 py-0.5 text-[10px] text-[#aad6bb]"
                      >
                        <Check size={11} aria-hidden="true" />
                        Saved
                      </Badge>
                    </div>
                    <Link
                      className="group flex items-start justify-between gap-3"
                      href={`/reports/${encodeURIComponent(report._id)}`}
                    >
                      <h3 className="text-[15px] leading-relaxed font-medium wrap-anywhere group-hover:text-[#c4f2e2]">
                        {report.title}
                      </h3>
                      <ArrowUpRight
                        size={17}
                        aria-hidden="true"
                        className="mt-1 shrink-0 text-[#6c7685] group-hover:text-primary"
                      />
                    </Link>
                    <p className="mt-2 text-xs leading-loose text-[#8f9eac]">
                      {report.summary}
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <strong className="text-3xl font-medium tracking-tight">
                        {report.totalMatchingTasks}
                      </strong>
                      <span className="text-xs text-[#a6b0be]">
                        {report.totalMatchingTasks === 1
                          ? "priority task"
                          : "priority tasks"}
                        <small className="mt-1 block text-[10px] text-muted-foreground">
                          {report.totalMatchingTasks === 0
                            ? "Nothing to follow up on"
                            : report.totalMatchingTasks > report.taskCount
                              ? `${report.taskCount} included in this snapshot`
                              : "Incomplete at report time"}
                        </small>
                      </span>
                    </div>
                    <footer className="-mx-6 mt-5 flex items-center justify-between border-t border-[#2a3038] bg-[#15181e] px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-[#838e9d] max-[560px]:text-[9px]">
                        <Clock3 size={12} aria-hidden="true" />
                        <time dateTime={report.createdAt}>
                          {formatDate(report.createdAt)}
                        </time>
                      </span>
                      <Link
                        href={`/reports/${encodeURIComponent(report._id)}`}
                        aria-label={`Open report from ${formatDate(report.createdAt)}`}
                        className="text-[#c5ccd6] hover:text-primary"
                      >
                        <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                    </footer>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-start gap-3 rounded-[11px] border border-dashed border-border bg-card/60 px-6 py-10">
                <span className="grid size-12 place-items-center rounded-xl border border-border bg-[#1c2128] text-[#b7c0cc]">
                  <FileText size={28} aria-hidden="true" />
                </span>
                <h2 className="text-lg font-medium">
                  {reports.length
                    ? "No snapshots match your search."
                    : "Your first snapshot starts here."}
                </h2>
                <p className="max-w-md text-[13px] leading-relaxed text-muted-foreground">
                  {reports.length
                    ? "Try another search or report filter to find the snapshot you need."
                    : "Click Run task report above. Your report is saved even when no tasks match."}
                </p>
                {reports.length ? (
                  <Button type="button" variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : (
                  <Button asChild variant="secondary">
                    <Link href="/tasks">
                      Start with your tasks
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </Link>
                  </Button>
                )}
              </div>
            )}
            <div className="mt-5 flex items-center justify-between gap-3 text-[11px] text-[#747e8b]">
              <span>
                {visible.length} of {reports.length} recent reports
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                Latest 50 saved snapshots
              </span>
            </div>
          </>
        )}
      </section>
    </>
  );
}

function FlowStep({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <li className="inline-flex items-center gap-2">
      <span className="grid size-7 place-items-center rounded-md border border-[#3a5246] bg-[#24362c] text-[#aad6bb]">
        {icon}
      </span>
      {label}
    </li>
  );
}
