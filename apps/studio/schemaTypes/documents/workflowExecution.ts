import { defineField, defineType } from "sanity";

export const workflowExecutionType = defineType({
  name: "workflowExecution",
  title: "Workflow Executions",
  type: "document",

  fields: [
    defineField({
      name: "workflow",
      title: "Workflow",
      type: "reference",
      to: [{ type: "workflow" }],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "status",
      title: "Execution Status",
      type: "string",
      options: {
        list: [
          { title: "Queued", value: "queued" },
          { title: "Running", value: "running" },
          { title: "Completed", value: "completed" },
          { title: "Failed", value: "failed" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "queued",
    }),

    defineField({
      name: "startedAt",
      title: "Started At",
      type: "datetime",
    }),

    defineField({
      name: "completedAt",
      title: "Completed At",
      type: "datetime",
    }),

    defineField({
      name: "error",
      title: "Error",
      type: "text",
    }),

    defineField({
      name: "result",
      title: "Result",
      type: "text",
      description: "Bounded JSON result recorded by the workflow engine",
      readOnly: true,
    }),

    defineField({
      name: "attempt",
      title: "Attempt Number",
      type: "number",
      initialValue: 1,
    }),

    defineField({
      name: "idempotencyKey",
      title: "Idempotency Key",
      type: "string",
    }),
  ],
});