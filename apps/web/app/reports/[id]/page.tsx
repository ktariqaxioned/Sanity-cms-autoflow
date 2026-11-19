import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { fetchTaskReportById } from "@autoflow/sanity-client";
import ReportNavigation from "../ReportNavigation";
import RunWorkflowButton from "../../workflows/RunWorkflowButton";

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
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-8">
      <div className="mx-auto max-w-4xl">
        <ReportNavigation />
        <Link href="/reports" className="text-sm text-blue-400 hover:underline">
          ← All saved reports
        </Link>
        <header className="mt-6">
          <p className="text-sm font-medium text-green-400">Saved report</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {report.title}
          </h1>
          <time
            dateTime={report.createdAt}
            className="mt-3 block text-sm text-gray-400"
          >
            Generated{" "}
            {new Date(report.createdAt).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              dateStyle: "long",
              timeStyle: "short",
            })}{" "}
            IST
          </time>
        </header>
        <section
          aria-label="Report summary"
          className="mt-7 rounded-xl border border-gray-800 bg-gray-900 p-6"
        >
          <p className="text-lg leading-7">{report.summary}</p>
          <p className="mt-3 text-sm text-gray-400">
            This is a snapshot from when the workflow ran. Editing or completing
            a task later won&apos;t change this report.
          </p>
        </section>
        <section aria-labelledby="report-tasks-heading" className="mt-8">
          <h2 id="report-tasks-heading" className="text-xl font-semibold">
            Tasks in this report ({report.taskCount})
          </h2>
          {report.tasks.length === 0 ? (
            <p className="mt-4 rounded-xl border border-gray-800 p-6 text-gray-300">
              No incomplete high-priority tasks were found. There&apos;s nothing
              to follow up on in this report.
            </p>
          ) : (
            <ol className="mt-4 space-y-3">
              {report.tasks.map((task, index) => (
                <li
                  key={task._key}
                  className="flex gap-4 rounded-xl border border-gray-800 bg-gray-900 p-5"
                >
                  <span className="text-gray-500">{index + 1}.</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words font-medium">{task.title}</h3>
                    <p className="mt-2 text-sm text-amber-300">
                      High priority · Incomplete at report time
                    </p>
                    {task.dueDate && (
                      <p className="mt-2 text-sm text-gray-400">
                        Due{" "}
                        {new Date(task.dueDate).toLocaleDateString("en-IN", {
                          timeZone: "Asia/Kolkata",
                        })}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
        <section
          aria-label="Report actions"
          className="mt-8 space-y-4 border-t border-gray-800 pt-6"
        >
          <p className="text-sm text-gray-400">
            Want an updated snapshot? Generate a new report.
          </p>
          <RunWorkflowButton />
          <Link
            href={`/workflows/${encodeURIComponent(report.workflow._ref)}`}
            className="inline-block text-sm text-blue-400 hover:underline"
          >
            View the workflow
          </Link>
          <p className="break-all text-xs text-gray-500">
            Execution: {report.execution._ref}
          </p>
        </section>
      </div>
    </main>
  );
}
