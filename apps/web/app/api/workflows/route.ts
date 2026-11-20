import { NextRequest, NextResponse } from "next/server";
import { createWorkflow } from "@autoflow/sanity-client";
import { getSanityClient } from "@autoflow/sanity-client";
import { validateGeneratedWorkflow } from "@autoflow/workflow-engine";

export const runtime = "nodejs";

export async function GET() {
    try {
      const client = getSanityClient();
  
      const workflows = await client.fetch(`
        *[_type == "workflow"] | order(_createdAt desc) {
          _id,
          name,
          description,
          status,
          trigger,
          steps,
          createdAt,
          lastExecutedAt
        }
      `);
  
      return NextResponse.json({
        success: true,
        workflows,
      });
    } catch (error) {
      console.error("WORKFLOW FETCH ERROR:", error);
  
      return NextResponse.json(
        {
          success: false,
          message: "Unable to fetch workflows.",
        },
        { status: 500 }
      );
    }
  }

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("name" in body) ||
      typeof body.name !== "string" ||
      !("trigger" in body) ||
      !("steps" in body)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid workflow data." },
        { status: 400 }
      );
    }

    const description =
      "description" in body && typeof body.description === "string"
        ? body.description
        : undefined;
    const draft = toWorkflowDraft(body.name, description, body.trigger, body.steps);
    const validated = validateGeneratedWorkflow(draft);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, message: validated.message },
        { status: 400 },
      );
    }

    const workflow = await createWorkflow({
      name: validated.workflow.name,
      description: validated.workflow.description,
      trigger: validated.workflow.trigger,
      steps: validated.workflow.steps.map((step) => ({
        stepId: step.stepId,
        name: step.name,
        type: step.type,
        action: step.action,
        config: JSON.stringify(step.config ?? {}),
      })),
    });

    return NextResponse.json(
      { success: true, workflow },
      { status: 201 }
    );
  } catch (error) {
    console.error("WORKFLOW CREATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to create workflow.",
      },
      { status: 400 }
    );
  }
}

function toWorkflowDraft(
  name: string,
  description: string | undefined,
  trigger: unknown,
  steps: unknown,
) {
  const triggerType =
    typeof trigger === "object" &&
    trigger !== null &&
    "type" in trigger &&
    trigger.type === "manual"
      ? "manual"
      : undefined;

  return {
    name,
    ...(description?.trim() ? { description: description.trim() } : {}),
    trigger: { type: triggerType },
    steps: Array.isArray(steps)
      ? steps.map((step) => {
          if (typeof step !== "object" || step === null) return step;
          const config =
            "config" in step && typeof step.config === "string"
              ? parseConfig(step.config)
              : "config" in step
                ? step.config
                : {};
          return {
            stepId: "stepId" in step ? step.stepId : undefined,
            name: "name" in step ? step.name : undefined,
            type: "type" in step ? step.type : undefined,
            action: "action" in step ? step.action : undefined,
            config,
          };
        })
      : steps,
  };
}

function parseConfig(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}