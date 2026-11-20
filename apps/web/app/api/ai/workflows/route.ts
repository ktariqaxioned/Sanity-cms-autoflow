import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  generateWorkflowFromDescription,
  morningProductivityWorkflow,
} from "@autoflow/workflow-engine";

export const runtime = "nodejs";

const requestSchema = z.object({
  description: z.string().trim().min(12).max(2000),
});

export async function GET() {
  return NextResponse.json({
    success: true,
    workflow: morningProductivityWorkflow,
  });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Describe the workflow you want to create." },
      { status: 400 },
    );
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Describe the automation in at least a short sentence.",
      },
      { status: 400 },
    );
  }

  try {
    const workflow = await generateWorkflowFromDescription(
      parsed.data.description,
    );
    return NextResponse.json({ success: true, workflow });
  } catch (error) {
    console.error("WORKFLOW GENERATION ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to generate a workflow.",
      },
      { status: 422 },
    );
  }
}
