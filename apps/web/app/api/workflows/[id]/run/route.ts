import { NextResponse } from "next/server";
import {
  executeWorkflow,
  WorkflowExecutionError,
} from "@autoflow/workflow-engine";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Workflow ID is required." },
        { status: 400 },
      );
    }

    const result = await executeWorkflow({ workflowId: id });

    return NextResponse.json(result);
  } catch (error) {
    console.error("WORKFLOW EXECUTION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Workflow execution failed.",
        ...(error instanceof WorkflowExecutionError
          ? { executionId: error.executionId }
          : {}),
      },
      { status: 500 },
    );
  }
}
