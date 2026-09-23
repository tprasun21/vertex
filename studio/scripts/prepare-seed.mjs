// Turns the provided seed into schema-valid documents for `sanity dataset import`.
// The source file is never modified. Output: .seed/seed.ndjson (git-ignored).
// Usage: npm run seed:prepare && npm run seed:import

import {mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = resolve(root, 'schemaTypes/scripts/seed/seed.ndjson')
const OUTPUT = resolve(root, '.seed/seed.ndjson')

// Mirrors the option lists in schemaTypes/objects/learning-outcome.ts and resource.ts.
const OUTCOME_ICONS = new Set([
  'layers', 'database', 'gauge', 'cloud', 'code', 'shield', 'zap', 'rocket',
  'book-open', 'terminal', 'server', 'lock', 'workflow', 'sparkles', 'puzzle',
])
const RESOURCE_TYPES = new Set(['documentation', 'guide', 'repository', 'article', 'download'])
const GUIDE_HOSTS = new Set(['aws.amazon.com', 'owasp.org'])

const blockText = (block) => (block?.children ?? []).map((child) => child.text ?? '').join('')

function transform(doc) {
  switch (doc._type) {
    case 'instructor':
      return {
        ...doc,
        bio: Array.isArray(doc.bio) ? doc.bio.map(blockText).join('\n\n') : doc.bio,
      }
    case 'lesson': {
      const {duration, ...rest} = doc
      const intro = rest.notes?.find((block) => block._type === 'block' && block.style === 'normal')
      return {
        ...rest,
        summary: rest.summary ?? (blockText(intro) || undefined),
        durationMinutes: rest.durationMinutes ?? Math.max(1, Math.round(duration / 60)),
        resources: rest.resources?.map((resource) => ({
          ...resource,
          type: RESOURCE_TYPES.has(resource.type)
            ? resource.type
            : GUIDE_HOSTS.has(new URL(resource.url).hostname)
              ? 'guide'
              : 'documentation',
        })),
      }
    }
    default:
      return doc
  }
}

function validate(docs) {
  const errors = []
  const fail = (id, message) => errors.push(`${id}: ${message}`)
  const byId = new Map()

  for (const doc of docs) {
    if (byId.has(doc._id)) fail(doc._id, 'duplicate _id')
    byId.set(doc._id, doc)
  }

  const uniqueKeys = (id, path, items) => {
    const keys = (items ?? []).map((item) => item._key)
    if (keys.some((key) => !key)) fail(id, `${path} item without _key`)
    if (new Set(keys).size !== keys.length) fail(id, `${path} has duplicate _key`)
  }
  const refType = (id, ref, type) => {
    if (byId.get(ref?._ref)?._type !== type) fail(id, `reference ${ref?._ref} does not resolve to a ${type}`)
  }

  const lessonRefs = new Map()

  for (const doc of docs) {
    const id = doc._id
    if (!doc.slug?.current) fail(id, 'missing slug')

    if (doc._type === 'course') {
      if (!doc.title) fail(id, 'missing title')
      if (!doc.summary || doc.summary.length > 300) fail(id, 'summary missing or over 300 chars')
      if (!doc.coverImage) fail(id, 'missing coverImage')
      if (!['beginner', 'intermediate', 'advanced'].includes(doc.level)) fail(id, `invalid level ${doc.level}`)
      refType(id, doc.instructor, 'instructor')
      refType(id, doc.category, 'category')
      if ((doc.learningOutcomes ?? []).length > 6) fail(id, 'more than 6 learning outcomes')
      for (const outcome of doc.learningOutcomes ?? []) {
        if (!OUTCOME_ICONS.has(outcome.icon)) fail(id, `outcome icon ${outcome.icon} is not in the schema list`)
      }
      uniqueKeys(id, 'learningOutcomes', doc.learningOutcomes)
      if (!doc.modules?.length) fail(id, 'no modules')
      uniqueKeys(id, 'modules', doc.modules)
      for (const module of doc.modules ?? []) {
        if (!module.title) fail(id, `module ${module._key} missing title`)
        if (!module.lessons?.length) fail(id, `module ${module._key} has no lessons`)
        uniqueKeys(id, `modules[${module._key}].lessons`, module.lessons)
        for (const ref of module.lessons ?? []) {
          refType(id, ref, 'lesson')
          lessonRefs.set(ref._ref, (lessonRefs.get(ref._ref) ?? 0) + 1)
        }
      }
    }

    if (doc._type === 'lesson') {
      if (!doc.title) fail(id, 'missing title')
      if (!doc.videoUrl) fail(id, 'missing videoUrl')
      if (!Number.isInteger(doc.durationMinutes) || doc.durationMinutes < 1) fail(id, 'invalid durationMinutes')
      if ('duration' in doc) fail(id, 'stray duration field')
      if (doc.summary && doc.summary.length > 400) fail(id, 'summary over 400 chars')
      if ((doc.keyPoints ?? []).length > 6) fail(id, 'more than 6 key points')
      uniqueKeys(id, 'notes', doc.notes)
      uniqueKeys(id, 'resources', doc.resources)
      for (const resource of doc.resources ?? []) {
        if (!RESOURCE_TYPES.has(resource.type)) fail(id, `resource type ${resource.type} is not in the schema list`)
      }
    }

    if (doc._type === 'instructor' && typeof doc.bio !== 'string') fail(id, 'bio is not plain text')
  }

  // A lesson's course is derived by reverse reference, so it must belong to exactly one module.
  for (const doc of docs) {
    if (doc._type !== 'lesson') continue
    const count = lessonRefs.get(doc._id) ?? 0
    if (count !== 1) fail(doc._id, `referenced by ${count} modules, expected exactly 1`)
  }

  return errors
}

const source = readFileSync(SOURCE, 'utf8')
  .split('\n')
  .filter((line) => line.trim())
  .map((line) => JSON.parse(line))

const docs = source.map(transform)
const errors = validate(docs)

if (errors.length) {
  console.error(`Seed validation failed with ${errors.length} error(s):`)
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}

mkdirSync(dirname(OUTPUT), {recursive: true})
writeFileSync(OUTPUT, docs.map((doc) => JSON.stringify(doc)).join('\n') + '\n')

const counts = Object.groupBy(docs, (doc) => doc._type)
console.log(`Wrote ${docs.length} documents to ${OUTPUT}`)
for (const [type, items] of Object.entries(counts)) console.log(`  ${type}: ${items.length}`)
