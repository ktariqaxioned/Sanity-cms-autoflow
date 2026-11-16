import { defineField, defineType } from "sanity";

export const workflowLogType = defineType({
  name: "workflowLog",
  title: "Workflow Logs",
  type: "document",

  fields: [
    defineField({
      name: "execution",
      title: "Execution",
      type: "reference",
      to: [{ type: "workflowExecution" }],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "stepId",
      title: "Step ID",
      type: "string",
    }),

    defineField({
      name: "level",
      title: "Log Level",
      type: "string",
      options: {
        list: [
          { title: "Info", value: "info" },
          { title: "Warning", value: "warning" },
          { title: "Error", value: "error" },
        ],
      },
    }),

    defineField({
      name: "message",
      title: "Message",
      type: "text",
    }),

    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
});