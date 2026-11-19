import {
  CalendarClock,
  FileText,
  Hand,
  ListTodo,
  Webhook,
  Workflow,
} from "lucide-react";

export type WorkflowStep = {
  stepId: string;
  name: string;
  type: string;
  action?: string;
  config?: string;
};
export type WorkflowItem = {
  _id: string;
  name: string;
  description?: string;
  status: "draft" | "active" | "paused";
  trigger?: {
    type: string;
    cron?: string;
    timezone?: string;
    documentType?: string;
  };
  steps?: WorkflowStep[];
  createdAt?: string;
  lastExecutedAt?: string;
};

export const actionOptions = [
  {
    value: "generateTaskReport",
    label: "Generate task report",
    description:
      "Find incomplete High-priority tasks and save a report you can return to.",
    icon: FileText,
  },
  {
    value: "fetchTasks",
    label: "Fetch tasks",
    description: "Retrieve your non-archived tasks for this workflow.",
    icon: ListTodo,
  },
] as const;

export function WorkflowStatus({ status }: { status: string }) {
  const label =
    status === "active"
      ? "Active"
      : status === "paused"
        ? "Paused"
        : status === "draft"
          ? "Draft"
          : status;
  return (
    <span className="wf-status" data-status={status}>
      <span />
      {label}
    </span>
  );
}

export function WorkflowIcon({ steps }: { steps?: WorkflowStep[] }) {
  const Icon = steps?.some((step) => step.action === "generateTaskReport")
    ? FileText
    : Workflow;
  return (
    <span className="wf-workflow-icon">
      <Icon size={23} strokeWidth={1.6} aria-hidden="true" />
    </span>
  );
}

export function TriggerLabel({ type }: { type?: string }) {
  const Icon =
    type === "schedule"
      ? CalendarClock
      : type === "documentEvent"
        ? Webhook
        : Hand;
  return (
    <span className="wf-trigger-label">
      <Icon size={13} aria-hidden="true" />
      {type === "schedule"
        ? "Scheduled · setup only"
        : type === "documentEvent"
          ? "Document event · setup only"
          : "On demand"}
    </span>
  );
}

export function formatWorkflowDate(value?: string) {
  if (!value || Number.isNaN(Date.parse(value))) return "Never run";
  return (
    new Date(value).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }) + " IST"
  );
}

export function stepDescription(step: WorkflowStep) {
  return (
    actionOptions.find((action) => action.value === step.action)?.description ??
    (step.type === "ai"
      ? "An AI processing step. Execution support is coming later."
      : step.type === "condition"
        ? "A decision step. Execution support is coming later."
        : "A configured workflow action.")
  );
}

export function canRunWorkflow(steps?: WorkflowStep[]) {
  return Boolean(
    steps?.length &&
    steps.every(
      (step) =>
        step.type === "action" &&
        actionOptions.some((action) => action.value === step.action),
    ),
  );
}
