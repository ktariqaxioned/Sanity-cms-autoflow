import Link from "next/link";
import { connection } from "next/server";
import {
  fetchTaskReports,
  type TaskReportSummary,
} from "@autoflow/sanity-client";
import RunWorkflowButton from "../workflows/RunWorkflowButton";
import ReportNavigation from "./ReportNavigation";

export default async function ReportsPage() {
  await connection();
  let reports: TaskReportSummary[] = [];
  let loadFailed = false;
  try {
    reports = await fetchTaskReports();
  } catch (error) {
    console.error("REPORT HISTORY ERROR:", error);
    loadFailed = true;
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-8">
      <div className="mx-auto max-w-4xl">
        <ReportNavigation />
        <h1 className="text-3xl font-semibold tracking-tight">
          Your task reports
        </h1>
        <p className="mt-3 max-w-2xl text-gray-400">
          Turn your incomplete high-priority tasks into a saved report, whenever
          you need it.
        </p>

        <section
          aria-labelledby="run-report-heading"
          className="mt-8 space-y-5 rounded-xl border border-gray-800 bg-gray-900 p-5 sm:p-7"
        >
          <div>
            <h2 id="run-report-heading" className="text-xl font-semibold">
              High-priority task report
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-300">
              Find tasks marked Incomplete and High priority, then save a
              snapshot you can return to. Completed, archived, and other
              priorities are excluded.
            </p>
          </div>
          <ol
            className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400"
            aria-label="Report workflow"
          >
            <li>1. Find matching tasks</li>
            <li>2. Generate the report</li>
            <li>3. Save and display it</li>
          </ol>
          <RunWorkflowButton />
          <p className="text-sm text-gray-400">
            Need something to report?{" "}
            <Link
              href="/tasks"
              className="text-blue-400 underline underline-offset-4"
            >
              Add a high-priority task
            </Link>
            .
          </p>
        </section>

        <section aria-labelledby="saved-reports-heading" className="mt-10">
          <h2 id="saved-reports-heading" className="text-xl font-semibold">
            Saved reports
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Your latest 50 reports. Each run creates a separate saved snapshot.
          </p>
          {loadFailed ? (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-900 bg-red-950/30 p-5 text-sm text-red-300"
            >
              Couldn&apos;t load saved reports. Check your Sanity configuration
              and connection, then{" "}
              <a href="/reports" className="underline">
                reload the page
              </a>
              .
            </div>
          ) : reports.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed border-gray-700 p-6 text-gray-400">
              No reports yet. Click Run task report to generate your first one.
              A report is saved even when no tasks match.
            </p>
          ) : (
            <ul className="mt-5 space-y-3">
              {reports.map((report) => (
                <li key={report._id}>
                  <Link
                    href={`/reports/${encodeURIComponent(report._id)}`}
                    className="block rounded-xl border border-gray-800 bg-gray-900 p-5 hover:border-blue-500 focus-visible:outline-2 focus-visible:outline-blue-400"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-medium">{report.title}</h3>
                      <span className="rounded-full bg-gray-800 px-3 py-1 text-xs">
                        {report.totalMatchingTasks}{" "}
                        {report.totalMatchingTasks === 1 ? "task" : "tasks"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-400">
                      {report.summary}
                    </p>
                    <time
                      dateTime={report.createdAt}
                      className="mt-3 block text-xs text-gray-500"
                    >
                      {new Date(report.createdAt).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}{" "}
                      IST
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
