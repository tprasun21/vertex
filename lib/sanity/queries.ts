import { defineQuery } from "next-sanity";

// Durations are summed from lesson.durationMinutes. Module and lesson numbers
// are derived from array order in data.ts, never stored.

export const COURSES_QUERY = defineQuery(`
  *[_type == "course" && defined(slug.current)] | order(popular desc, title asc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    coverImage,
    level,
    popular,
    "moduleCount": count(modules),
    "lessonCount": count(modules[].lessons[]),
    "durationMinutes": math::sum(modules[].lessons[]->durationMinutes)
  }
`);

export const COURSE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "course" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    summary,
    coverImage,
    level,
    price,
    popular,
    studentCount,
    learningOutcomes[] { _key, icon, title, description },
    instructor-> { _id, name, "slug": slug.current, photo, expertise },
    category-> { _id, title, "slug": slug.current },
    "moduleCount": count(modules),
    "lessonCount": count(modules[].lessons[]),
    "durationMinutes": math::sum(modules[].lessons[]->durationMinutes),
    modules[] {
      _key,
      title,
      summary,
      "durationMinutes": math::sum(lessons[]->durationMinutes),
      "lessons": lessons[]-> { _id, title, "slug": slug.current, durationMinutes, freePreview }
    }
  }
`);

// A lesson never stores its course; the course is found by reverse reference.
export const LESSON_BY_SLUG_QUERY = defineQuery(`
  *[_type == "lesson" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    summary,
    notes,
    keyPoints,
    proTip,
    resources[] { _key, type, title, description, url },
    videoUrl,
    thumbnail,
    durationMinutes,
    freePreview,
    studentCount,
    "course": *[_type == "course" && references(^._id)] | order(_createdAt asc) [0] {
      _id,
      title,
      "slug": slug.current,
      coverImage,
      level,
      instructor-> { _id, name, "slug": slug.current, photo },
      modules[] {
        _key,
        title,
        "durationMinutes": math::sum(lessons[]->durationMinutes),
        "lessons": lessons[]-> { _id, title, "slug": slug.current, durationMinutes }
      }
    }
  }
`);

export const INSTRUCTOR_BY_SLUG_QUERY = defineQuery(`
  *[_type == "instructor" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    photo,
    expertise,
    bio,
    "courses": *[_type == "course" && references(^._id) && defined(slug.current)] | order(title asc) {
      _id,
      title,
      "slug": slug.current,
      summary,
      coverImage,
      level,
      popular,
      "moduleCount": count(modules),
      "lessonCount": count(modules[].lessons[]),
      "durationMinutes": math::sum(modules[].lessons[]->durationMinutes)
    }
  }
`);

export const CATEGORIES_QUERY = defineQuery(`
  *[_type == "category" && defined(slug.current)] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    "courseCount": count(*[_type == "course" && references(^._id)])
  }
`);

export const COURSE_SLUGS_QUERY = defineQuery(`
  *[_type == "course" && defined(slug.current)] { "slug": slug.current }
`);

export const LESSON_SLUGS_QUERY = defineQuery(`
  *[_type == "lesson" && defined(slug.current)] { "slug": slug.current }
`);

export const INSTRUCTOR_SLUGS_QUERY = defineQuery(`
  *[_type == "instructor" && defined(slug.current)] { "slug": slug.current }
`);
