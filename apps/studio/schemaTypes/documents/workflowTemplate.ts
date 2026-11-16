import { defineArrayMember, defineField, defineType } from "sanity";

export const workflowTemplateType = defineType({
  name: "workflowTemplate",
  title: "Workflow Templates",
  type: "document",

  fields: [
    defineField({
      name: "name",
      title: "Template Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),

    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          "Productivity",
          "AI",
          "Organization",
          "Learning",
          "Reminders",
        ],
      },
    }),

    defineField({
      name: "trigger",
      title: "Default Trigger",
      type: "trigger",
    }),

    defineField({
      name: "steps",
      title: "Default Steps",
      type: "array",
      of: [defineArrayMember({ type: "workflowStep" })],
    }),

    defineField({
      name: "isFeatured",
      title: "Featured Template",
      type: "boolean",
      initialValue: false,
    }),
  ],
});