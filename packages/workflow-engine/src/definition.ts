import { z } from "zod";

export const workflowActions = [
  "fetchTasks",
  "generateTaskReport",
  "runAi",
  "saveProductivityReport",
] as const;

export type WorkflowActionName = (typeof workflowActions)[number];

const fetchTasksConfigSchema = z
  .object({
    limit: z.number().int().min(1).max(50).optional(),
    status: z.enum(["all", "incomplete"]).optional(),
  })
  .strict();

const generateTaskReportConfigSchema = z.object({}).strict();

const runAiConfigSchema = z
  .object({
    purpose: z.enum(["prioritize", "report"]),
    prompt: z.string().trim().min(1).max(4000),
  })
  .strict();

const saveProductivityReportConfigSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
  })
  .strict();

const configSchemas = {
  fetchTasks: fetchTasksConfigSchema,
  generateTaskReport: generateTaskReportConfigSchema,
  runAi: runAiConfigSchema,
  saveProductivityReport: saveProductivityReportConfigSchema,
} as const;

export const priorityItemSchema = z
  .object({
    taskId: z.string().trim().min(1).max(120),
    title: z.string().trim().min(1).max(200),
    rank: z.number().int().min(1).max(50),
    reason: z.string().trim().min(1).max(400),
  })
  .strict();

export const prioritizeOutputSchema = z
  .object({
    priorities: z.array(priorityItemSchema).max(50),
  })
  .strict();

export const reportOutputSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    summary: z.string().trim().min(1).max(1000),
    report: z.string().trim().min(1).max(8000),
  })
  .strict();

export type PrioritizeOutput = z.infer<typeof prioritizeOutputSchema>;
export type ReportOutput = z.infer<typeof reportOutputSchema>;

export const workflowDraftSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().max(500).optional(),
    trigger: z
      .object({
        type: z.literal("manual"),
      })
      .strict(),
    steps: z
      .array(
        z
          .object({
            stepId: z.string().trim().min(1).max(80),
            name: z.string().trim().min(1).max(120),
            type: z.enum(["action", "ai"]),
            action: z.enum(workflowActions),
            config: z.record(z.string(), z.unknown()).optional(),
          })
          .strict(),
      )
      .min(1)
      .max(8),
  })
  .strict()
  .superRefine((workflow, context) => {
    const ids = new Set<string>();
    workflow.steps.forEach((step, index) => {
      if (ids.has(step.stepId)) {
        context.addIssue({
          code: "custom",
          message: "Workflow step IDs must be unique.",
          path: ["steps", index, "stepId"],
        });
      }
      ids.add(step.stepId);
      if (step.action === "runAi" && step.type !== "ai") {
        context.addIssue({
          code: "custom",
          message: "AI steps must use the AI step type.",
          path: ["steps", index, "type"],
        });
      }
      if (step.action !== "runAi" && step.type !== "action") {
        context.addIssue({
          code: "custom",
          message: "Only the AI action can use the AI step type.",
          path: ["steps", index, "type"],
        });
      }
      const parsed = configSchemas[step.action].safeParse(step.config ?? {});
      if (!parsed.success) {
        context.addIssue({
          code: "custom",
          message: `Invalid configuration for ${step.action}.`,
          path: ["steps", index, "config"],
        });
      }
    });
  });

export type WorkflowDraft = z.infer<typeof workflowDraftSchema>;

export function parseActionConfig(
  action: "fetchTasks",
  config: Record<string, unknown>,
): z.infer<typeof fetchTasksConfigSchema>;
export function parseActionConfig(
  action: "generateTaskReport",
  config: Record<string, unknown>,
): z.infer<typeof generateTaskReportConfigSchema>;
export function parseActionConfig(
  action: "runAi",
  config: Record<string, unknown>,
): z.infer<typeof runAiConfigSchema>;
export function parseActionConfig(
  action: "saveProductivityReport",
  config: Record<string, unknown>,
): z.infer<typeof saveProductivityReportConfigSchema>;
export function parseActionConfig(
  action: WorkflowActionName,
  config: Record<string, unknown>,
) {
  return configSchemas[action].parse(config);
}

export function readActionConfig(
  action: string,
  rawConfig: string | undefined,
): Record<string, unknown> {
  if (!workflowActions.includes(action as WorkflowActionName)) {
    throw new Error(`Action "${action}" is not available.`);
  }
  let parsed: unknown = {};
  if (rawConfig && rawConfig.trim()) {
    try {
      parsed = JSON.parse(rawConfig);
    } catch {
      throw new Error(`Configuration for "${action}" is not valid JSON.`);
    }
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(`Configuration for "${action}" must be a JSON object.`);
  }
  const result = configSchemas[action as WorkflowActionName].safeParse(parsed);
  if (!result.success) {
    throw new Error(`Configuration for "${action}" is not supported.`);
  }
  return result.data;
}

export function validateGeneratedWorkflow(input: unknown) {
  const result = workflowDraftSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false as const,
      message:
        "The generated workflow did not match a supported AutoFlow workflow.",
    };
  }
  return { success: true as const, workflow: result.data };
}

export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return JSON.parse(fenced?.[1] ?? trimmed);
}

export const morningProductivityWorkflow: WorkflowDraft = {
  name: "Morning Productivity Report",
  description:
    "Find incomplete tasks, prioritize them, write a productivity report, and save it.",
  trigger: { type: "manual" },
  steps: [
    {
      stepId: "fetch-incomplete-tasks",
      name: "Fetch incomplete tasks",
      type: "action",
      action: "fetchTasks",
      config: { status: "incomplete", limit: 50 },
    },
    {
      stepId: "prioritize-tasks",
      name: "Prioritize tasks",
      type: "ai",
      action: "runAi",
      config: {
        purpose: "prioritize",
        prompt:
          "Rank these incomplete tasks by what needs attention first. Use only the tasks provided. Do not invent tasks.",
      },
    },
    {
      stepId: "write-report",
      name: "Write productivity report",
      type: "ai",
      action: "runAi",
      config: {
        purpose: "report",
        prompt:
          "Write a readable morning productivity report from the prioritized tasks. Explain what to do first and what can wait.",
      },
    },
    {
      stepId: "save-report",
      name: "Save productivity report",
      type: "action",
      action: "saveProductivityReport",
      config: { title: "Morning productivity report" },
    },
  ],
};
