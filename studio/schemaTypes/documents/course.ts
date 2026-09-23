import {BookIcon} from '@sanity/icons/Book'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const course = defineType({
  name: 'course',
  title: 'Course',
  type: 'document',
  icon: BookIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'curriculum', title: 'Curriculum'},
    {name: 'marketing', title: 'Marketing'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'content',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      description: 'Short description of the course, shown on cards and the course header.',
      type: 'text',
      rows: 3,
      group: 'content',
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: 'coverImage',
      description: 'Course logo or cover, shown on cards and the course header.',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'level',
      description: 'The difficulty level of the course.',
      type: 'string',
      group: 'content',
      options: {
        list: [
          {title: 'Beginner', value: 'beginner'},
          {title: 'Intermediate', value: 'intermediate'},
          {title: 'Advanced', value: 'advanced'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'instructor',
      type: 'reference',
      to: [{type: 'instructor'}],
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      description: 'Category of the course, used for filtering and searching.',
      type: 'reference',
      to: [{type: 'category'}],
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'learningOutcomes',
      title: "What you'll learn",
      type: 'array',
      of: [defineArrayMember({type: 'learningOutcome'})],
      group: 'content',
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: 'modules',
      type: 'array',
      of: [defineArrayMember({type: 'module'})],
      group: 'curriculum',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'price',
      description: 'In USD. Use 0 for a free course.',
      type: 'number',
      group: 'marketing',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'popular',
      type: 'boolean',
      group: 'marketing',
      initialValue: false,
    }),
    defineField({
      name: 'studentCount',
      type: 'number',
      group: 'marketing',
      validation: (rule) => rule.integer().min(0),
    }),
  ],
  preview: {
    select: {title: 'title', level: 'level', media: 'coverImage'},
    prepare({title, level, media}) {
      return {title, subtitle: level, media}
    },
  },
})
