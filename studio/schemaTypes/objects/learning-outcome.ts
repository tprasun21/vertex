import {StarIcon} from '@sanity/icons/Star'
import {defineField, defineType} from 'sanity'

// Values are lucide-react icon names so the web app can map them directly.
export const OUTCOME_ICONS = [
  {title: 'Layers', value: 'layers'},
  {title: 'Database', value: 'database'},
  {title: 'Gauge', value: 'gauge'},
  {title: 'Cloud', value: 'cloud'},
  {title: 'Code', value: 'code'},
  {title: 'Shield', value: 'shield'},
  {title: 'Zap', value: 'zap'},
  {title: 'Rocket', value: 'rocket'},
  {title: 'Book', value: 'book-open'},
  {title: 'Terminal', value: 'terminal'},
  {title: 'Server', value: 'server'},
  {title: 'Lock', value: 'lock'},
]

export const learningOutcome = defineType({
  name: 'learningOutcome',
  title: 'Learning outcome',
  type: 'object',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'icon',
      type: 'string',
      options: {list: OUTCOME_ICONS},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'description'},
  },
})
