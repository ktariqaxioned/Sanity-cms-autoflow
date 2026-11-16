import { getSanityClient } from "./client";

export interface CreateWorkflowInput {
  name: string;
  description?: string;
  trigger: {
    type: "manual" | "schedule" | "documentEvent";
    cron?: string;
    timezone?: string;
    documentType?: string;
  };
  steps: {
    stepId: string;
    name: string;
    type: "action" | "ai" | "condition";
    action?: string;
    config?: string;
  }[];
}

export async function createWorkflow(data: CreateWorkflowInput) {
  if (!data.name.trim()) {
    throw new Error("Workflow name is required.");
  }

  if (!data.trigger?.type) {
    throw new Error("Workflow trigger is required.");
  }

  if (!Array.isArray(data.steps) || data.steps.length === 0) {
    throw new Error("At least one workflow step is required.");
  }

  if (
    data.trigger.type === "schedule" &&
    !data.trigger.cron?.trim()
  ) {
    throw new Error("Cron expression is required for scheduled workflows.");
  }

  if (
    data.trigger.type === "documentEvent" &&
    !data.trigger.documentType?.trim()
  ) {
    throw new Error("Document type is required for document event triggers.");
  }

  const stepIds = new Set<string>();

  for (const step of data.steps) {
    if (!step.stepId.trim() || !step.name.trim()) {
      throw new Error("Every workflow step needs an ID and name.");
    }

    if (stepIds.has(step.stepId)) {
      throw new Error("Workflow step IDs must be unique.");
    }

    stepIds.add(step.stepId);

    if (step.config) {
      JSON.parse(step.config);
    }
  }

  const client = getSanityClient();

  return client.create({
    _type: "workflow",
    name: data.name.trim(),
    description: data.description?.trim() || undefined,
    status: "draft",
    trigger: {
      ...data.trigger,
      timezone:
        data.trigger.type === "schedule"
          ? data.trigger.timezone || "Asia/Kolkata"
          : undefined,
    },
    steps: data.steps,
    createdAt: new Date().toISOString(),
  });
}