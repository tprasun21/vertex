import type {StructureResolver} from 'sanity/structure'

const CONTENT_TYPES = ['course', 'lesson', 'instructor', 'category'] as const

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      ...CONTENT_TYPES.map((type) => S.documentTypeListItem(type)),
      ...S.documentTypeListItems().filter(
        (item) => !CONTENT_TYPES.includes(item.getId() as (typeof CONTENT_TYPES)[number]),
      ),
    ])
