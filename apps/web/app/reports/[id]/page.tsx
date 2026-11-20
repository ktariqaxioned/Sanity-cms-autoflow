import type { ReactNode } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
      <Link
        href="/reports"
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-[#a4e5d2] hover:text-primary"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        All reports
      </Link>
      <header className="mb-8 flex items-center justify-between gap-6 max-[1020px]:flex-col max-[1020px]:items-stretch max-[440px]:items-start">
        <div className="flex items-start gap-4">
          <span className="inline-flex size-[43px] shrink-0 items-center justify-center rounded-[11px] border border-[#3c4347] bg-[#252e2d] text-[#bdd4ca]">
            <FileText size={23} aria-hidden="true" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-medium tracking-tight max-[760px]:text-[26px]">
                {report.title}
              </h1>
              <Badge
                variant="outline"
                className="h-auto gap-1 rounded-md border-[#3a5246] bg-[#24362c] px-2 py-0.5 text-[10px] text-[#aad6bb]"
              >
                <Check size={12} aria-hidden="true" />
                Saved
              </Badge>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-[#99a1ad]">
              <time dateTime={report.createdAt}>
                Generated {formatDate(report.createdAt)}
              </time>
            </p>
          </div>
        </div>
        <div className="max-[1020px]:self-end max-[440px]:self-start">
          <RunWorkflowButton />
        </div>
      </header>
      <div className="grid grid-cols-[minmax(0,1fr)_260px] items-start gap-6 max-[1020px]:grid-cols-1">
        <div className="grid gap-4">
          <section
            className="rounded-[11px] border border-[#31443d] bg-[#17211e] p-6 max-[760px]:p-6"
            aria-labelledby="report-summary-heading"
          >
            <span className="text-[10px] font-semibold tracking-[0.18em] text-[#929ba7] uppercase">
              Your priorities at a glance
            </span>
            <div className="mt-3 flex items-end gap-4 max-[560px]:gap-3">
              <strong className="text-6xl leading-none font-medium tracking-tight max-[560px]:text-5xl">
                {report.totalMatchingTasks}
              </strong>
              <span className="pb-1 text-sm text-[#c5ddd2]">
                {report.body ? "incomplete" : "incomplete High-priority"}{" "}
                {report.totalMatchingTasks === 1 ? "task" : "tasks"}
              </span>
            </div>
            <h2 id="report-summary-heading" className="sr-only">
              Report summary
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#d5e6dc]">
              {report.summary}
            </p>
            {report.body && (
              <div className="mt-5 max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-[#e7f3ec]">
                {report.body}
              </div>
            )}
            <div className="mt-4 inline-flex items-center gap-2 text-[11px] text-[#9bb3a8]">
              <LockKeyhole size={13} aria-hidden="true" />
              <span>Captured when this workflow ran.</span>
            </div>
          </section>
          <Card className="gap-0 rounded-[11px] bg-card py-0 ring-[#2b3039]">
            <CardHeader className="flex-row items-center justify-between border-b border-[#292e37] px-6 py-[22px]">
              <div>
                <p className="mb-1 text-[9px] font-semibold tracking-[0.18em] text-[#929ba7] uppercase">
                  What needs your attention
                </p>
                <h2 id="snapshot-tasks-heading" className="text-sm font-medium">
                  Tasks in this report
                </h2>
              </div>
              <Badge
                variant="outline"
                className="h-auto rounded-md border-[#363c46] bg-[#20252d] px-2 py-1 text-[10px] text-[#a2acb9]"
              >
                {report.taskCount} included
              </Badge>
            </CardHeader>
            {report.tasks.length ? (
              <ol>
                {report.tasks.map((task, index) => (
                  <li
                    key={task._key}
                    className="flex items-start gap-3 border-b border-[#292e37] px-6 py-5 last:border-0 max-[560px]:gap-2.5 max-[560px]:px-4"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-[#3d4943] bg-[#242d28] text-[10px] text-[#b0ccbc]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium max-[560px]:text-xs">
                        {task.title}
                      </h3>
                      <span className="text-[11px] text-muted-foreground">
                        Incomplete at report time
                      </span>
                      {task.dueDate && (
                        <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#8a9aab]">
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
              <CardContent className="flex flex-col items-start gap-2 py-8 text-muted-foreground">
                <CheckCircle2
                  size={28}
                  className="text-[#9acbac]"
                  aria-hidden="true"
                />
                <h3 className="text-sm font-medium text-foreground">
                  A little breathing room.
                </h3>
                <p className="text-xs leading-relaxed">
                  No incomplete High-priority tasks were found when this report
                  ran.
                </p>
              </CardContent>
            )}
          </Card>
          <div className="flex gap-3 rounded-lg border border-border bg-card px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            <LockKeyhole size={17} aria-hidden="true" className="mt-0.5 shrink-0" />
            <p>
              This is a saved snapshot. Editing or completing a task later
              won&apos;t change this report. Run a new report for an updated
              picture.
            </p>
          </div>
        </div>
        <aside
          className="grid gap-4 max-[1020px]:grid-cols-2 max-[760px]:grid-cols-1"
          aria-label="Report overview"
        >
          <Card className="gap-0 rounded-[11px] bg-card py-0 ring-[#2b3039]">
            <CardHeader className="flex-row items-center justify-between border-b border-[#292e37] px-6 py-[22px]">
              <h2 className="text-sm font-medium">Report details</h2>
              <FileText size={17} className="text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent className="px-6 py-2">
              <dl>
                <OverviewRow label="Generated">
                  {formatDate(report.createdAt)}
                </OverviewRow>
                <OverviewRow label="Started">
                  <Hand size={13} aria-hidden="true" />
                  On demand
                </OverviewRow>
                <OverviewRow label="Matching tasks">
                  {report.totalMatchingTasks}
                </OverviewRow>
                <OverviewRow label="Tasks included">
                  {report.taskCount}
                </OverviewRow>
              </dl>
              <div className="border-t border-[#303b44] py-4">
                <Link
                  href={`/workflows/${encodeURIComponent(report.workflow._ref)}`}
                  className="inline-flex items-center gap-1 text-xs text-[#a4e5d2] hover:text-primary"
                >
                  View source workflow
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </CardContent>
          </Card>
          <section className="rounded-[11px] border border-[#31443d] bg-[#17211e] p-5 text-[#c5ddd2]">
            <Clock3 size={21} aria-hidden="true" />
            <h2 className="mt-3 text-sm font-medium">
              Ready for a fresh perspective?
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-[#9bb3a8]">
              Use Run task report to create an updated snapshot. This one will
              stay right where it is.
            </p>
            <Link
              href="/reports"
              className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#a4e5d2]"
            >
              Browse report history
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </section>
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
