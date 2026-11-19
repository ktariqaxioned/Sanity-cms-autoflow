import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { fetchTaskReportById } from "@autoflow/sanity-client";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Hand,
  LockKeyhole,
} from "lucide-react";
import RunWorkflowButton from "@/components/workspace/RunWorkflowButton";
import { TaskPriority } from "@/components/workspace/TaskBadges";
import { formatDate } from "@/components/workspace/format";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const report = await fetchTaskReportById(id);
  if (!report) notFound();

  return (
    <>
      <Link href="/reports" className="wf-back-link">
        <ArrowLeft size={15} aria-hidden="true" />
        All reports
      </Link>
      <header className="wf-page-heading wf-detail-heading">
        <div className="wf-detail-title">
          <span className="wf-workflow-icon">
            <FileText size={23} aria-hidden="true" />
          </span>
          <div>
            <div className="wf-heading-with-badge">
              <h1>{report.title}</h1>
              <span className="af-saved-label">
                <Check size={12} aria-hidden="true" />
                Saved
              </span>
            </div>
            <p>
              <time dateTime={report.createdAt}>
                Generated {formatDate(report.createdAt)}
              </time>
            </p>
          </div>
        </div>
        <div className="wf-detail-actions">
          <RunWorkflowButton />
        </div>
      </header>
      <div className="wf-detail-grid">
        <div>
          <section
            className="af-report-summary"
            aria-labelledby="report-summary-heading"
          >
            <span className="wf-eyebrow">Your priorities at a glance</span>
            <div className="af-summary-count">
              <strong>{report.totalMatchingTasks}</strong>
              <span>
                incomplete High-priority{" "}
                {report.totalMatchingTasks === 1 ? "task" : "tasks"}
              </span>
            </div>
            <h2 id="report-summary-heading" className="wf-sr-only">
              Report summary
            </h2>
            <p>{report.summary}</p>
            <div className="af-snapshot-caption">
              <LockKeyhole size={13} aria-hidden="true" />
              <span>Captured when this workflow ran.</span>
            </div>
          </section>
          <section
            className="wf-panel af-snapshot-panel"
            aria-labelledby="snapshot-tasks-heading"
          >
            <div className="wf-panel-heading">
              <div>
                <p className="wf-eyebrow">What needs your attention</p>
                <h2 id="snapshot-tasks-heading">Tasks in this report</h2>
              </div>
              <span className="wf-muted-tag">{report.taskCount} included</span>
            </div>
            {report.tasks.length ? (
              <ol className="af-snapshot-list">
                {report.tasks.map((task, index) => (
                  <li key={task._key}>
                    <span className="wf-step-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3>{task.title}</h3>
                      <span>Incomplete at report time</span>
                      {task.dueDate && (
                        <p>
                          <CalendarDays size={12} aria-hidden="true" />
                          Due {formatDate(task.dueDate, false)}
                        </p>
                      )}
                    </div>
                    <TaskPriority priority={task.priority} />
                  </li>
                ))}
              </ol>
            ) : (
              <div className="wf-inline-empty">
                <CheckCircle2
                  size={28}
                  className="af-all-clear-icon"
                  aria-hidden="true"
                />
                <h3>A little breathing room.</h3>
                <p>
                  No incomplete High-priority tasks were found when this report
                  ran.
                </p>
              </div>
            )}
          </section>
          <div className="af-snapshot-note">
            <LockKeyhole size={17} aria-hidden="true" />
            <p>
              This is a saved snapshot. Editing or completing a task later
              won&apos;t change this report. Run a new report for an updated
              picture.
            </p>
          </div>
        </div>
        <aside className="wf-detail-aside" aria-label="Report overview">
          <section className="wf-panel">
            <div className="wf-panel-heading">
              <h2>Report details</h2>
              <FileText
                size={17}
                className="wf-muted-icon"
                aria-hidden="true"
              />
            </div>
            <dl className="wf-overview">
              <div>
                <dt>Generated</dt>
                <dd>{formatDate(report.createdAt)}</dd>
              </div>
              <div>
                <dt>Started</dt>
                <dd>
                  <Hand size={13} aria-hidden="true" />
                  On demand
                </dd>
              </div>
              <div>
                <dt>Matching tasks</dt>
                <dd>{report.totalMatchingTasks}</dd>
              </div>
              <div>
                <dt>Tasks included</dt>
                <dd>{report.taskCount}</dd>
              </div>
            </dl>
            <div className="af-report-source">
              <Link
                href={`/workflows/${encodeURIComponent(report.workflow._ref)}`}
                className="wf-text-link"
              >
                View source workflow
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </section>
          <section className="wf-output-note">
            <Clock3 size={21} aria-hidden="true" />
            <h2>Ready for a fresh perspective?</h2>
            <p>
              Use Run task report to create an updated snapshot. This one will
              stay right where it is.
            </p>
            <Link href="/reports">
              Browse report history
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </section>
        </aside>
      </div>
    </>
  );
}
