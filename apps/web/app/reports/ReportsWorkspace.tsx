"use client";

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
      <header className="wf-page-heading">
        <div>
          <p className="wf-eyebrow">A snapshot of what matters</p>
          <h1>
            Reports
            {!loadFailed && (
              <span className="wf-title-count">{reports.length}</span>
            )}
          </h1>
          <p>
            A clearer picture of your priorities, saved for whenever you need
            it.
          </p>
        </div>
        <span className="af-heading-note">
          <ShieldCheck size={15} aria-hidden="true" />
          Saved in your workspace
        </span>
      </header>
      <section
        className="wf-starter af-report-generator"
        aria-labelledby="run-report-heading"
      >
        <div className="af-generator-top">
          <span className="wf-workflow-icon">
            <FileText size={25} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className="wf-muted-tag">Run on demand</span>
        </div>
        <div className="wf-starter-copy">
          <span className="wf-eyebrow">Your priorities, in perspective</span>
          <h2 id="run-report-heading">High-priority task report</h2>
          <p>
            Collect your incomplete High-priority tasks into one clear, saved
            report. Each run creates a separate snapshot.
          </p>
        </div>
        <ol className="af-generator-flow" aria-label="Report workflow">
          <li>
            <span>
              <Flag size={14} aria-hidden="true" />
            </span>
            Find matching tasks
          </li>
          <li aria-hidden="true" className="af-flow-arrow">
            <ArrowRight size={15} />
          </li>
          <li>
            <span>
              <ListChecks size={14} aria-hidden="true" />
            </span>
            Build the report
          </li>
          <li aria-hidden="true" className="af-flow-arrow">
            <ArrowRight size={15} />
          </li>
          <li>
            <span>
              <Check size={14} aria-hidden="true" />
            </span>
            Save a snapshot
          </li>
        </ol>
        <div className="af-generator-actions">
          <RunWorkflowButton />
          <Link href="/tasks" className="wf-button wf-button-ghost">
            Manage tasks
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <p className="af-generator-footnote">
          Includes Incomplete + High priority. Other priorities, completed
          tasks, and archived tasks are excluded.
        </p>
        <div className="wf-starter-decoration" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      <section aria-labelledby="report-history-heading">
        <div className="af-section-heading">
          <div>
            <p className="wf-eyebrow">Your saved snapshots</p>
            <h2 id="report-history-heading">Report history</h2>
          </div>
          <History size={18} className="wf-muted-icon" aria-hidden="true" />
        </div>
        {loadFailed ? (
          <div className="af-history-error" role="alert">
            <span className="wf-icon-tile">
              <History size={20} aria-hidden="true" />
            </span>
            <div>
              <h3>Couldn&apos;t load your saved reports.</h3>
              <p>
                There was a problem reaching your workspace. Your existing
                reports haven&apos;t been changed.
              </p>
              <a href="/reports" className="wf-text-link">
                Reload report history
                <ArrowRight size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="wf-collection-toolbar">
              <div
                className="wf-tabs"
                role="group"
                aria-label="Filter report history"
              >
                {filters.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={filter === item.value}
                    onClick={() => setFilter(item.value)}
                  >
                    {item.label}
                    <span>{counts[item.value]}</span>
                  </button>
                ))}
              </div>
              <span className="wf-collection-caption">Latest 50 reports</span>
            </div>
            <div className="wf-search-toolbar">
              <div className="wf-search">
                <Search size={17} aria-hidden="true" />
                <label className="wf-sr-only" htmlFor="report-search">
                  Search saved reports
                </label>
                <input
                  id="report-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Find a saved report…"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Clear report search"
                    onClick={() => setQuery("")}
                  >
                    <X size={15} aria-hidden="true" />
                  </button>
                )}
              </div>
              <label className="wf-sort">
                <ArrowDownWideNarrow size={15} aria-hidden="true" />
                <span className="wf-sr-only">Sort reports</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </label>
            </div>
            <span className="wf-sr-only" role="status">
              {visible.length} reports found.
            </span>
            {visible.length ? (
              <div className="af-report-grid">
                {visible.map((report) => (
                  <article key={report._id} className="af-report-card">
                    <div className="af-report-card-top">
                      <span className="wf-workflow-icon">
                        <FileText size={21} aria-hidden="true" />
                      </span>
                      <span className="af-saved-label">
                        <Check size={11} aria-hidden="true" />
                        Saved
                      </span>
                    </div>
                    <Link
                      className="wf-card-title"
                      href={`/reports/${encodeURIComponent(report._id)}`}
                    >
                      <h3>{report.title}</h3>
                      <ArrowUpRight size={17} aria-hidden="true" />
                    </Link>
                    <p>{report.summary}</p>
                    <div className="af-report-card-count">
                      <strong>{report.totalMatchingTasks}</strong>
                      <span>
                        {report.totalMatchingTasks === 1
                          ? "priority task"
                          : "priority tasks"}
                        <small>
                          {report.totalMatchingTasks === 0
                            ? "Nothing to follow up on"
                            : report.totalMatchingTasks > report.taskCount
                              ? `${report.taskCount} included in this snapshot`
                              : "Incomplete at report time"}
                        </small>
                      </span>
                    </div>
                    <footer>
                      <span>
                        <Clock3 size={12} aria-hidden="true" />
                        <time dateTime={report.createdAt}>
                          {formatDate(report.createdAt)}
                        </time>
                      </span>
                      <Link
                        href={`/reports/${encodeURIComponent(report._id)}`}
                        aria-label={`Open report from ${formatDate(report.createdAt)}`}
                      >
                        <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                    </footer>
                  </article>
                ))}
              </div>
            ) : (
              <div className="wf-empty">
                <span className="wf-empty-icon">
                  <FileText size={28} aria-hidden="true" />
                </span>
                <h2>
                  {reports.length
                    ? "No snapshots match your search."
                    : "Your first snapshot starts here."}
                </h2>
                <p>
                  {reports.length
                    ? "Try another search or report filter to find the snapshot you need."
                    : "Click Run task report above. Your report is saved even when no tasks match."}
                </p>
                {reports.length ? (
                  <button
                    type="button"
                    className="wf-button wf-button-secondary"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </button>
                ) : (
                  <Link href="/tasks" className="wf-button wf-button-secondary">
                    Start with your tasks
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </Link>
                )}
              </div>
            )}
            <div className="wf-collection-footer">
              <span>
                {visible.length} of {reports.length} recent reports
              </span>
              <span>
                <span className="wf-small-dot" />
                Latest 50 saved snapshots
              </span>
            </div>
          </>
        )}
      </section>
    </>
  );
}
