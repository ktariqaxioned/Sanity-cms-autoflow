import { defineField, defineType } from "sanity";

export const workflowStepType = defineType({
  name: "workflowStep",
  title: "Workflow Step",
  type: "object",

  fields: [
    defineField({
      name: "stepId",
      title: "Step ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "name",
      title: "Step Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "type",
      title: "Step Type",
      type: "string",
      options: {
        list: [
          { title: "Action", value: "action" },
          { title: "AI Processing", value: "ai" },
          { title: "Condition", value: "condition" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "action",
      title: "Action Handler",
      type: "string",
      description: "Example: fetchTasks, summarizeContent",
    }),

    defineField({
      name: "config",
      title: "Step Configuration",
      type: "text",
      description: "JSON configuration validated by the server",
    }),
  ],
});