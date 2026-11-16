import { defineField, defineType } from "sanity";

export const workflowConditionType = defineType({
  name: "workflowCondition",
  title: "Workflow Condition",
  type: "object",

  fields: [
    defineField({
      name: "field",
      title: "Field",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "operator",
      title: "Operator",
      type: "string",
      options: {
        list: [
          { title: "Equals", value: "equals" },
          { title: "Not Equals", value: "notEquals" },
          { title: "Greater Than", value: "greaterThan" },
          { title: "Less Than", value: "lessThan" },
          { title: "Contains", value: "contains" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "value",
      title: "Comparison Value",
      type: "string",
    }),
  ],
});