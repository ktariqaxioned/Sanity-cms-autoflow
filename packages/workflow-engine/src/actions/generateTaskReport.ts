import {
  getSanityClient,
  MAX_REPORT_TASKS,
  REPORT_TASKS_QUERY,
  type ReportTask,
} from "@autoflow/sanity-client";
import type { ActionContext } from "../registry";

type MatchingTask = {
  _id: string;
  title: string;
  priority: "high";
  dueDate?: string;
};

export async function generateTaskReportAction({
  workflowId,
  executionId,
  stepId,
}: ActionContext) {
  if (!workflowId || !executionId || !stepId) {
    throw new Error(
      "Task reports must be generated within a workflow execution.",
    );
  }

  const client = getSanityClient();
  const result = await client.fetch<{ total: number; tasks: MatchingTask[] }>(
    REPORT_TASKS_QUERY,
    { limit: MAX_REPORT_TASKS },
  );

  if (
    !Number.isInteger(result?.total) ||
    result.total < 0 ||
    !Array.isArray(result.tasks)
  ) {
    throw new Error("Unable to read the tasks for this report.");
  }

  const tasks: ReportTask[] = result.tasks.map((task, index) => {
    if (
      typeof task._id !== "string" ||
      typeof task.title !== "string" ||
      task.priority !== "high"
    ) {
      throw new Error("A matching task has invalid report data.");
    }
    return {
      _key: `task-${index}`,
      _type: "reportTask",
      taskId: task._id,
      title: task.title.slice(0, 200),
      priority: "high",
      ...(task.dueDate ? { dueDate: task.dueDate } : {}),
    };
  });
  const createdAt = new Date().toISOString();
  const summary =
    result.total === 0
      ? "You have no incomplete high-priority tasks."
      : `You have ${result.total} incomplete high-priority ${result.total === 1 ? "task" : "tasks"}.${result.total > tasks.length ? ` This report includes the ${tasks.length} most recently created tasks.` : ""}`;

  // Snapshot task text so later edits/deletions do not rewrite a saved report.
  const report = await client.create({
    _type: "taskReport",
    title: "High-priority task report",
    createdAt,
    summary,
    taskCount: tasks.length,
    totalMatchingTasks: result.total,
    tasks,
    workflow: { _type: "reference", _ref: workflowId },
    execution: { _type: "reference", _ref: executionId },
  });

  return {
    reportId: report._id,
    taskCount: tasks.length,
    totalMatchingTasks: result.total,
  };
}
