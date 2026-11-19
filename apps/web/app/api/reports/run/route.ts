import { NextResponse } from "next/server";
import {
  runTaskReport,
  WorkflowExecutionError,
} from "@autoflow/workflow-engine";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json(
      { success: false, message: "Run reports from AutoFlow." },
      { status: 403 },
    );
  }

  try {
    return NextResponse.json(await runTaskReport());
  } catch (error) {
    console.error("TASK REPORT ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to generate the report. Please try again.",
        ...(error instanceof WorkflowExecutionError
          ? { executionId: error.executionId }
          : {}),
      },
      { status: 500 },
    );
  }
}
