import {PlayIcon} from '@sanity/icons/Play'
import {defineArrayMember, defineField, defineType} from 'sanity'

// Providers with both ingestion and embed playback (AGENTS.md section 9).
const VIDEO_HOSTS = [
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'vimeo.com',
  'player.vimeo.com',
  'iframe.mediadelivery.net',
  'player.mediadelivery.net',
]

export const lesson = defineType({
  name: 'lesson',
  title: 'Lesson',
  type: 'document',
  icon: PlayIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'video', title: 'Video'},
    {name: 'extras', title: 'Extras'},
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
      description: 'One or two sentences shown under the lesson title and as the overview.',
      type: 'text',
      rows: 3,
      group: 'content',
      validation: (rule) => rule.max(400),
    }),
    defineField({
      name: 'notes',
      type: 'blockContent',
      group: 'content',
    }),
    defineField({
      name: 'keyPoints',
      title: 'In this lesson you will',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      group: 'content',
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: 'videoUrl',
      description: 'YouTube, Vimeo, or Bunny Stream URL.',
      type: 'url',
      group: 'video',
      validation: (rule) =>
        rule
          .required()
          .uri({scheme: ['https']})
          .custom((value) => {
            if (!value) return true
            try {
              const host = new URL(value).hostname
              return VIDEO_HOSTS.includes(host) || 'Use a YouTube, Vimeo, or Bunny Stream URL'
            } catch {
              return 'Invalid URL'
            }
          }),
    }),
    defineField({
      name: 'thumbnail',
      type: 'image',
      group: 'video',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})],
    }),
    defineField({
      name: 'durationMinutes',
      title: 'Duration (minutes)',
      type: 'number',
      group: 'video',
      validation: (rule) => rule.required().integer().min(1),
    }),
    defineField({
      name: 'freePreview',
      description: 'Shows a "Free preview" label. Does not control access.',
      type: 'boolean',
      group: 'extras',
      initialValue: false,
    }),
    defineField({
      name: 'studentCount',
      type: 'number',
      group: 'extras',
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: 'proTip',
      type: 'text',
      rows: 2,
      group: 'extras',
    }),
    defineField({
      name: 'resources',
      type: 'array',
      of: [defineArrayMember({type: 'resource'})],
      group: 'extras',
    }),
  ],
  preview: {
    select: {title: 'title', minutes: 'durationMinutes', media: 'thumbnail'},
    prepare({title, minutes, media}) {
      return {title, subtitle: minutes ? `${minutes} min` : undefined, media}
    },
  },
})
