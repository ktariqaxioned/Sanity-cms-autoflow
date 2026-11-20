import {
  parseActionConfig,
  prioritizeOutputSchema,
  reportOutputSchema,
} from "../definition";
import { requestStructuredJson } from "../gemini";
import type { ActionContext } from "../registry";

const INPUT_LIMIT = 12_000;

export async function runAiAction({ config, previousOutput }: ActionContext) {
  const parsed = parseActionConfig("runAi", config);
  const input = JSON.stringify(previousOutput ?? { tasks: [] }).slice(
    0,
    INPUT_LIMIT,
  );

  if (parsed.purpose === "prioritize") {
    const output = await requestStructuredJson({
      system: [
        "You prioritize personal tasks for AutoFlow.",
        "Return JSON only: {\"priorities\":[{\"taskId\":\"string\",\"title\":\"string\",\"rank\":1,\"reason\":\"string\"}]}",
        "Use only tasks present in the input. Do not invent tasks or actions.",
        parsed.prompt,
      ].join("\n"),
      user: input,
    });
    const result = prioritizeOutputSchema.safeParse(output);
    if (!result.success) {
      throw new Error("The AI priority response did not match the expected format.");
    }
    return result.data;
  }

  const output = await requestStructuredJson({
    system: [
      "You write a personal productivity report for AutoFlow.",
      "Return JSON only: {\"title\":\"string\",\"summary\":\"string\",\"report\":\"string\"}",
      "Base the report only on the supplied tasks and priorities. Do not invent tasks.",
      parsed.prompt,
    ].join("\n"),
    user: input,
    maxTokens: 1600,
  });
  const result = reportOutputSchema.safeParse(output);
  if (!result.success) {
    throw new Error("The AI report response did not match the expected format.");
  }
  return result.data;
}
