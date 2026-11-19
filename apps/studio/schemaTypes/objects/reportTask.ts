import {defineField, defineType} from 'sanity'

export const reportTaskType = defineType({
  name: 'reportTask',
  title: 'Task snapshot',
  type: 'object',
  fields: [
    defineField({
      name: 'taskId',
      title: 'Original task ID',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title at report time',
      type: 'string',
      validation: (r) => r.required().max(200),
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'string',
      options: {list: [{title: 'High', value: 'high'}]},
      validation: (r) =>
        r.required().custom((value) => value === 'high' || 'Report tasks must have High priority.'),
    }),
    defineField({name: 'dueDate', title: 'Due date at report time', type: 'datetime'}),
  ],
  preview: {select: {title: 'title', subtitle: 'priority'}},
})
