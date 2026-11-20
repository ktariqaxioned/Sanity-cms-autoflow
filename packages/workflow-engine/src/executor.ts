import { getSanityClient } from "@autoflow/sanity-client";
import { readActionConfig, workflowActions } from "./definition";
import { getAction, type ActionContext } from "./registry";
import { registerBuiltInActions } from "./registerBuiltInActions";

type WorkflowStep = {
  stepId: string;
  name: string;
  type: "action" | "ai" | "condition";
  action?: string;
  config?: string;
};

type ExecuteWorkflowInput = {
  workflowId: string;
};

export class WorkflowExecutionError extends Error {
  constructor(
    message: string,
    public readonly executionId: string,
  ) {
    super(message);
    this.name = "WorkflowExecutionError";
  }
}

export async function executeWorkflow({ workflowId }: ExecuteWorkflowInput) {
  const client = getSanityClient();

  const workflow = await client.fetch(
    `*[_type == "workflow" && _id == $id][0]`,
    { id: workflowId },
  );

  if (!workflow) {
    throw new Error("Workflow not found.");
  }

  if (!Array.isArray(workflow.steps) || workflow.steps.length === 0) {
    throw new Error("Workflow has no steps.");
  }

  const execution = await client.create({
    _type: "workflowExecution",
    workflow: {
      _type: "reference",
      _ref: workflowId,
    },
    status: "running",
    startedAt: new Date().toISOString(),
    attempt: 1,
  });

  try {
    registerBuiltInActions();

    let previousOutput: unknown = undefined;
    const outputs: Record<string, unknown> = {};

    for (const step of workflow.steps as WorkflowStep[]) {
      await client.create({
        _type: "workflowLog",
        execution: {
          _type: "reference",
          _ref: execution._id,
        },
        stepId: step.stepId,
        level: "info",
        message: `Starting step: ${step.name}`,
        createdAt: new Date().toISOString(),
      });

      if (step.type === "condition") {
        throw new Error(
          `Step "${step.name}" is a condition. Condition steps are not executable yet.`,
        );
      }
      if (
        (step.type !== "action" && step.type !== "ai") ||
        !step.action ||
        !workflowActions.includes(
          step.action as (typeof workflowActions)[number],
        )
      ) {
        throw new Error(`Step "${step.name}" is not a supported action yet.`);
      }
      if (step.type === "ai" && step.action !== "runAi") {
        throw new Error(`Step "${step.name}" is not a supported AI action.`);
      }
      if (step.type === "action" && step.action === "runAi") {
        throw new Error(`Step "${step.name}" must use the AI step type.`);
      }

      const config = readActionConfig(step.action, step.config);
      const handler = getAction(step.action);
      const context: ActionContext = {
        config,
        previousOutput,
        outputs,
        workflowId,
        executionId: execution._id,
        stepId: step.stepId,
      };

      previousOutput = await handler(context);
      outputs[step.stepId] = previousOutput;

      await client.create({
        _type: "workflowLog",
        execution: {
          _type: "reference",
          _ref: execution._id,
        },
        stepId: step.stepId,
        level: "info",
        message: `Completed step: ${step.name}. ${summarizeOutput(previousOutput)}`,
        createdAt: new Date().toISOString(),
      });
    }

    await client
      .transaction()
      .patch(execution._id, {
        set: {
          status: "completed",
          completedAt: new Date().toISOString(),
          result: JSON.stringify(previousOutput).slice(0, 12_000),
        },
      })
      .patch(workflowId, { set: { lastExecutedAt: new Date().toISOString() } })
      .commit();

    return {
      success: true,
      executionId: execution._id,
      output: previousOutput,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Workflow execution failed.";

    const persistence = await Promise.allSettled([
      client.create({
        _type: "workflowLog",
        execution: {
          _type: "reference",
          _ref: execution._id,
        },
        level: "error",
        message,
        createdAt: new Date().toISOString(),
      }),

      client
        .patch(execution._id)
        .set({
          status: "failed",
          completedAt: new Date().toISOString(),
          error: message,
        })
        .commit(),
    ]);

    for (const result of persistence) {
      if (result.status === "rejected") {
        console.error("Unable to persist workflow failure:", result.reason);
      }
    }

    throw new WorkflowExecutionError(message, execution._id);
  }
}

function summarizeOutput(output: unknown) {
  if (typeof output !== "object" || output === null) return "Finished.";
  if ("count" in output && typeof output.count === "number") {
    return `Fetched ${output.count} ${output.count === 1 ? "task" : "tasks"}.`;
  }
  if ("reportId" in output && typeof output.reportId === "string") {
    return "Saved the report.";
  }
  if ("priorities" in output && Array.isArray(output.priorities)) {
    return `Ranked ${output.priorities.length} ${output.priorities.length === 1 ? "task" : "tasks"}.`;
  }
  if ("report" in output && typeof output.report === "string") {
    return "Wrote the productivity report.";
  }
  return "Finished.";
}
