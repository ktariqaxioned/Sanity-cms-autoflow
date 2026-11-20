import { getSanityClient, type ReportTask } from "@autoflow/sanity-client";
import { parseActionConfig, reportOutputSchema } from "../definition";
import type { ActionContext } from "../registry";

const priorities = new Set(["low", "medium", "high", "urgent"]);

export async function saveProductivityReportAction({
  config,
  previousOutput,
  outputs,
  workflowId,
  executionId,
}: ActionContext) {
  if (!workflowId || !executionId) {
    throw new Error("Reports must be saved within a workflow execution.");
  }

  const parsed = parseActionConfig("saveProductivityReport", config);
  const report = reportOutputSchema.safeParse(previousOutput);
  if (!report.success) {
    throw new Error(
      "The previous step did not return a productivity report to save.",
    );
  }

  const fetched = findFetchedTasks(outputs);
  const tasks: ReportTask[] = [];
  for (const [index, task] of fetched.entries()) {
    if (tasks.length >= 50) break;
    if (task.priority !== "high") continue;
    tasks.push({
      _key: `task-${index}`,
      _type: "reportTask",
      taskId: task._id,
      title: task.title.slice(0, 200),
      priority: "high",
      ...(task.dueDate ? { dueDate: task.dueDate } : {}),
    });
  }

  const created = await getSanityClient().create({
    _type: "taskReport",
    title: (parsed.title ?? report.data.title).slice(0, 120),
    createdAt: new Date().toISOString(),
    summary: report.data.summary,
    body: report.data.report,
    taskCount: tasks.length,
    totalMatchingTasks: fetched.length,
    tasks,
    workflow: { _type: "reference", _ref: workflowId },
    execution: { _type: "reference", _ref: executionId },
  });

  return {
    reportId: created._id,
    title: (parsed.title ?? report.data.title).slice(0, 120),
    taskCount: tasks.length,
    totalMatchingTasks: fetched.length,
  };
}

function findFetchedTasks(outputs: Record<string, unknown> | undefined) {
  const values = Object.values(outputs ?? {});
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index];
    if (
      typeof value !== "object" ||
      value === null ||
      !("tasks" in value) ||
      !Array.isArray(value.tasks)
    ) {
      continue;
    }
    return value.tasks.flatMap(readTask);
  }
  return [];
}

function readTask(value: unknown) {
  if (typeof value !== "object" || value === null) return [];
  if (
    !("_id" in value) ||
    typeof value._id !== "string" ||
    !("title" in value) ||
    typeof value.title !== "string"
  ) {
    return [];
  }
  const priority =
    "priority" in value &&
    typeof value.priority === "string" &&
    priorities.has(value.priority)
      ? value.priority
      : undefined;
  const dueDate =
    "dueDate" in value && typeof value.dueDate === "string"
      ? value.dueDate
      : undefined;
  return [{ _id: value._id, title: value.title, priority, dueDate }];
}
