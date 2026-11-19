import {defineArrayMember, defineField, defineType} from 'sanity'

export const taskReportType = defineType({
  name: 'taskReport',
  title: 'Task Reports',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'createdAt',
      title: 'Generated at',
      type: 'datetime',
      validation: (r) => r.required(),
    }),
    defineField({name: 'summary', title: 'Summary', type: 'text', validation: (r) => r.required()}),
    defineField({
      name: 'taskCount',
      title: 'Tasks included',
      type: 'number',
      validation: (r) => r.required().integer().min(0).max(500),
    }),
    defineField({
      name: 'totalMatchingTasks',
      title: 'Total matching tasks',
      type: 'number',
      validation: (r) => r.required().integer().min(0),
    }),
    defineField({
      name: 'tasks',
      title: 'Saved task snapshots',
      type: 'array',
      of: [defineArrayMember({type: 'reportTask'})],
      validation: (r) => r.max(500),
    }),
    defineField({
      name: 'workflow',
      title: 'Workflow',
      type: 'reference',
      to: [{type: 'workflow'}],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'execution',
      title: 'Execution',
      type: 'reference',
      to: [{type: 'workflowExecution'}],
      validation: (r) => r.required(),
    }),
  ],
  orderings: [
    {title: 'Newest first', name: 'newest', by: [{field: 'createdAt', direction: 'desc'}]},
  ],
  preview: {select: {title: 'title', subtitle: 'createdAt'}},
})
