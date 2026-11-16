import { defineArrayMember, defineField, defineType } from "sanity";

export const workflowType = defineType({
  name: "workflow",
  title: "Workflows",
  type: "document",

  fields: [
    defineField({
      name: "name",
      title: "Workflow Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),

    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Active", value: "active" },
          { title: "Paused", value: "paused" },
        ],
      },
      initialValue: "draft",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "trigger",
      title: "Trigger",
      type: "trigger",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "steps",
      title: "Workflow Steps",
      type: "array",
      of: [defineArrayMember({ type: "workflowStep" })],
      validation: (Rule) => Rule.min(1),
    }),

    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),

    defineField({
      name: "lastExecutedAt",
      title: "Last Executed At",
      type: "datetime",
      readOnly: true,
    }),
  ],

  preview: {
    select: {
      title: "name",
      subtitle: "status",
    },
  },
});