import { defineField, defineType } from "sanity";

export const triggerType = defineType({
  name: "trigger",
  title: "Workflow Trigger",
  type: "object",

  fields: [
    defineField({
      name: "type",
      title: "Trigger Type",
      type: "string",
      options: {
        list: [
          { title: "Manual", value: "manual" },
          { title: "Schedule", value: "schedule" },
          { title: "Document Event", value: "documentEvent" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "cron",
      title: "Cron Expression",
      type: "string",
      description: "Example: 0 8 * * *",
      hidden: ({ parent }) => parent?.type !== "schedule",
    }),

    defineField({
      name: "timezone",
      title: "Timezone",
      type: "string",
      initialValue: "Asia/Kolkata",
      hidden: ({ parent }) => parent?.type !== "schedule",
    }),

    defineField({
      name: "documentType",
      title: "Sanity Document Type",
      type: "string",
      hidden: ({ parent }) => parent?.type !== "documentEvent",
    }),
  ],
});