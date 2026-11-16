
import { getSanityClient } from "@autoflow/sanity-client";
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

export async function executeWorkflow({
  workflowId,
}: ExecuteWorkflowInput) {
  const client = getSanityClient();

  const workflow = await client.fetch(
    `*[_type == "workflow" && _id == $id][0]`,
    { id: workflowId }
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
      });

      if (step.type !== "action" || !step.action) {
        throw new Error(
          `Step "${step.name}" is not a supported action yet.`
        );
      }

      const config: unknown = JSON.parse(step.config || "{}");

      if (
        typeof config !== "object" ||
        config === null ||
        Array.isArray(config)
      ) {
        throw new Error(`Invalid configuration in step "${step.name}".`);
      }

      const handler = getAction(step.action);

      const context: ActionContext = {
        config: config as Record<string, unknown>,
        previousOutput,
      };

      previousOutput = await handler(context);

      await client.create({
        _type: "workflowLog",
        execution: {
          _type: "reference",
          _ref: execution._id,
        },
        stepId: step.stepId,
        level: "info",
        message: `Completed step: ${step.name}`,
      });
    }

    await client
      .patch(execution._id)
      .set({
        status: "completed",
        completedAt: new Date().toISOString(),
      })
      .commit();

    return {
      success: true,
      executionId: execution._id,
      output: previousOutput,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Workflow execution failed.";

    await client.create({
      _type: "workflowLog",
      execution: {
        _type: "reference",
        _ref: execution._id,
      },
      level: "error",
      message,
    });

    await client
      .patch(execution._id)
      .set({
        status: "failed",
        completedAt: new Date().toISOString(),
        error: message,
      })
      .commit();

    throw error;
  }
}
