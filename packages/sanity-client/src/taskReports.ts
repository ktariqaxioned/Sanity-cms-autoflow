import { getSanityClient } from "./client";

export const TASK_REPORT_WORKFLOW_ID = "autoflow-high-priority-task-report";
export const MAX_REPORT_TASKS = 500;

export interface ReportTask {
  _key: string;
  _type: "reportTask";
  taskId: string;
  title: string;
  priority: "high";
  dueDate?: string;
}

export interface TaskReportSummary {
  _id: string;
  title: string;
  createdAt: string;
  taskCount: number;
  totalMatchingTasks: number;
  summary: string;
}

export interface TaskReport extends TaskReportSummary {
  body?: string;
  tasks: ReportTask[];
  workflow: { _ref: string };
  execution: { _ref: string };
}

// Filter before limiting: unrelated or completed tasks must never hide matches.
export const REPORT_TASKS_QUERY = `{
  "total": count(*[_type == "task" && !(_id in path("drafts.**")) &&
    status == "incomplete" && priority == "high" && isArchived != true]),
  "tasks": *[_type == "task" && !(_id in path("drafts.**")) &&
    status == "incomplete" && priority == "high" && isArchived != true]
    | order(_createdAt desc, _id asc)[0...$limit] {
      _id, title, priority, dueDate
    }
}`;

export function ensureTaskReportWorkflow() {
  return getSanityClient().createIfNotExists({
    _id: TASK_REPORT_WORKFLOW_ID,
    _type: "workflow",
    name: "High-priority task report",
    description:
      "Find incomplete high-priority tasks and save a report of them.",
    status: "active",
    trigger: { _type: "trigger", type: "manual" },
    steps: [
      {
        _key: "generate-task-report",
        _type: "workflowStep",
        stepId: "generate-task-report",
        name: "Generate and save task report",
        type: "action",
        action: "generateTaskReport",
        config: "{}",
      },
    ],
    createdAt: new Date().toISOString(),
  });
}

export function fetchTaskReports() {
  return getSanityClient().fetch<TaskReportSummary[]>(
    `*[_type == "taskReport" && !(_id in path("drafts.**"))]
      | order(createdAt desc, _id asc)[0...50] {
        _id, title, createdAt, taskCount, totalMatchingTasks, summary
      }`,
  );
}

export function fetchTaskReportById(id: string) {
  return getSanityClient().fetch<TaskReport | null>(
    `*[_type == "taskReport" && _id == $id][0] {
      _id, title, createdAt, taskCount, totalMatchingTasks, summary, body,
      tasks, workflow, execution
    }`,
    { id },
  );
}
