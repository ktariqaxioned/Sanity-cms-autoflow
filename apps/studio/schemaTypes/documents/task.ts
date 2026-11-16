import { defineField, defineType } from "sanity";

export const taskType = defineType({
  name: "task",
  title: "Tasks",
  type: "document",

  fields: [
    defineField({
      name: "title",
      title: "Task Title",
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
          { title: "Incomplete", value: "incomplete" },
          { title: "In Progress", value: "inProgress" },
          { title: "Completed", value: "completed" },
        ],
      },
      initialValue: "incomplete",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "priority",
      title: "Priority",
      type: "string",
      options: {
        list: [
          { title: "Low", value: "low" },
          { title: "Medium", value: "medium" },
          { title: "High", value: "high" },
          { title: "Urgent", value: "urgent" },
        ],
      },
      initialValue: "medium",
    }),

    defineField({
      name: "dueDate",
      title: "Due Date",
      type: "datetime",
    }),

    defineField({
      name: "isArchived",
      title: "Archived",
      type: "boolean",
      initialValue: false,
    }),

    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "status",
    },
  },
});