import {
  CalendarClock,
  FileText,
  Hand,
  ListTodo,
  Sparkles,
  Webhook,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
    type: "action",
  },
  {
    value: "fetchTasks",
    label: "Fetch tasks",
    description: "Retrieve tasks for the next step. You can limit this to incomplete tasks.",
    icon: ListTodo,
    type: "action",
  },
  {
    value: "runAi",
    label: "AI processing",
    description:
      "Send the previous step’s data to Gemini and return structured priorities or a report.",
    icon: Sparkles,
    type: "ai",
  },
  {
    value: "saveProductivityReport",
    label: "Save productivity report",
    description: "Save the AI-written report in your workspace.",
    icon: FileText,
    type: "action",
  },
] as const;

const statusClass = {
  active: "border-[#2f4b40] bg-[#1e3129] text-[#9bd9b7]",
  draft: "border-[#514630] bg-[#322c20] text-[#d4bb89]",
  paused: "border-[#414354] bg-[#2a2a37] text-[#b4afd3]",
} as const;

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
    <Badge
      variant="outline"
      className={cn(
        "h-auto gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-medium",
        statusClass[status as keyof typeof statusClass] ??
          "border-[#373b46] bg-[#252831] text-[#b1b7c3]",
      )}
    >
      <span className="size-1 rounded-full bg-current" />
      {label}
    </Badge>
  );
}

export function WorkflowIcon({ steps }: { steps?: WorkflowStep[] }) {
  const Icon = steps?.some((step) => step.action === "generateTaskReport")
    ? FileText
    : Workflow;
  return (
    <span className="inline-flex size-[43px] shrink-0 items-center justify-center rounded-[11px] border border-[#3c4347] bg-[#252e2d] text-[#bdd4ca]">
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
    <span className="inline-flex items-center gap-1.5">
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
    (step.type === "condition"
      ? "A decision step. Execution support is coming later."
      : "A configured workflow action.")
  );
}

export function canRunWorkflow(steps?: WorkflowStep[]) {
  return Boolean(
    steps?.length &&
      steps.every((step) => {
        const option = actionOptions.find((action) => action.value === step.action);
        return option?.type === step.type;
      }),
  );
}
