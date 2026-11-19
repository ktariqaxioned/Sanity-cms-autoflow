import {
  ensureTaskReportWorkflow,
  TASK_REPORT_WORKFLOW_ID,
} from "@autoflow/sanity-client";
import { executeWorkflow } from "./executor";

export async function runTaskReport() {
  if (!process.env.SANITY_API_TOKEN) {
    throw new Error(
      "Add SANITY_API_TOKEN to apps/web/.env.local to save reports.",
    );
  }

  await ensureTaskReportWorkflow();
  const result = await executeWorkflow({ workflowId: TASK_REPORT_WORKFLOW_ID });
  const output = result.output;
  if (
    !output ||
    typeof output !== "object" ||
    !("reportId" in output) ||
    typeof output.reportId !== "string"
  ) {
    throw new Error(
      "The report workflow did not return a saved report. Check its configured steps in Studio.",
    );
  }

  return {
    success: true,
    executionId: result.executionId,
    reportId: output.reportId,
  };
}
