import {
  extractJsonObject,
  validateGeneratedWorkflow,
  type WorkflowDraft,
} from "./definition";
import { requestStructuredJson } from "./gemini";

const SYSTEM_PROMPT = `You convert a personal automation request into one AutoFlow workflow.
Return a JSON object with this shape and no other text:
{
  "name": "short name",
  "description": "what the workflow does",
  "trigger": { "type": "manual" },
  "steps": [
    {
      "stepId": "unique-kebab-id",
      "name": "step name",
      "type": "action",
      "action": "fetchTasks",
      "config": { "status": "incomplete", "limit": 50 }
    }
  ]
}
Allowed actions only:
- fetchTasks, type action. config: { "status": "all" | "incomplete", "limit": 1-50 }
- runAi, type ai. config: { "purpose": "prioritize" | "report", "prompt": "instructions for the model" }
- saveProductivityReport, type action. config: { "title": "optional report title" }. Place it after a runAi step whose purpose is report.
- generateTaskReport, type action. config: {}. This finds incomplete high-priority tasks and saves a snapshot. Use it only when the user wants that specific report and no custom AI writing.
Rules:
- The trigger type is always "manual". Mention any requested schedule in the description, because scheduled execution is not available.
- Use between 1 and 8 steps.
- Do not return JavaScript, Python, shell commands, URLs to execute, or actions outside this list.
- For a morning productivity report, use fetchTasks with status incomplete, runAi purpose prioritize, runAi purpose report, then saveProductivityReport.
- If the request cannot be done with these actions, return {"unsupported":"a short reason"}.`;

export async function generateWorkflowFromDescription(
  description: string,
): Promise<WorkflowDraft> {
  const output = await requestStructuredJson({
    system: SYSTEM_PROMPT,
    user: description,
    maxTokens: 1400,
  });
  return interpretModelWorkflow(output);
}

export function interpretModelWorkflow(output: unknown): WorkflowDraft {
  if (
    typeof output === "object" &&
    output !== null &&
    "unsupported" in output &&
    typeof output.unsupported === "string" &&
    output.unsupported.trim()
  ) {
    throw new Error(output.unsupported.trim().slice(0, 300));
  }
  const validated = validateGeneratedWorkflow(output);
  if (!validated.success) {
    throw new Error(validated.message);
  }
  return validated.workflow;
}

export function interpretModelWorkflowText(text: string): WorkflowDraft {
  let output: unknown;
  try {
    output = extractJsonObject(text);
  } catch {
    throw new Error("The model did not return JSON.");
  }
  return interpretModelWorkflow(output);
}
