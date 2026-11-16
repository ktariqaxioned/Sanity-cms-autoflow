import { NextRequest, NextResponse } from "next/server";
import { createWorkflow, CreateWorkflowInput } from "@autoflow/sanity-client";
import { getSanityClient } from "@autoflow/sanity-client";

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

    const workflow = await createWorkflow({
      name: body.name,
      description:
        "description" in body &&
        typeof body.description === "string"
          ? body.description
          : undefined,
      trigger: body.trigger as CreateWorkflowInput["trigger"],
      steps: body.steps as CreateWorkflowInput["steps"],
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