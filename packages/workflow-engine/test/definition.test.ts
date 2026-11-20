import { describe, expect, test } from "bun:test";
import {
  extractJsonObject,
  morningProductivityWorkflow,
  prioritizeOutputSchema,
  readActionConfig,
  reportOutputSchema,
  validateGeneratedWorkflow,
} from "../src/definition";
import { interpretModelWorkflow } from "../src/generateWorkflow";

describe("workflow generation validation", () => {
  test("accepts the morning productivity workflow", () => {
    const result = validateGeneratedWorkflow(morningProductivityWorkflow);
    expect(result.success).toBe(true);
  });

  test("rejects unknown actions and executable code", () => {
    const result = validateGeneratedWorkflow({
      name: "Unsafe",
      trigger: { type: "manual" },
      steps: [
        {
          stepId: "run",
          name: "Run code",
          type: "action",
          action: "eval",
          config: { code: "process.exit(1)" },
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  test("rejects a scheduled trigger", () => {
    const result = validateGeneratedWorkflow({
      ...morningProductivityWorkflow,
      trigger: { type: "schedule", cron: "0 9 * * *" },
    });
    expect(result.success).toBe(false);
  });

  test("reads an unsupported model response as an error", () => {
    expect(() =>
      interpretModelWorkflow({ unsupported: "Calendar access is not available." }),
    ).toThrow("Calendar access is not available.");
  });

  test("extracts fenced JSON", () => {
    expect(extractJsonObject('```json\n{"ok":true}\n```')).toEqual({ ok: true });
  });
});

describe("action configuration", () => {
  test("accepts an incomplete task fetch", () => {
    expect(
      readActionConfig(
        "fetchTasks",
        JSON.stringify({ status: "incomplete", limit: 20 }),
      ),
    ).toEqual({ status: "incomplete", limit: 20 });
  });

  test("rejects an oversized fetch limit", () => {
    expect(() =>
      readActionConfig("fetchTasks", JSON.stringify({ limit: 500 })),
    ).toThrow("not supported");
  });

  test("validates AI output shapes", () => {
    expect(
      prioritizeOutputSchema.parse({
        priorities: [
          { taskId: "task-1", title: "Write notes", rank: 1, reason: "Due today" },
        ],
      }).priorities,
    ).toHaveLength(1);
    expect(
      reportOutputSchema.parse({
        title: "Morning report",
        summary: "Start with the note.",
        report: "Write the note first.",
      }).title,
    ).toBe("Morning report");
  });
});
