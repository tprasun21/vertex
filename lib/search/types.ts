// Wire contract for POST /api/search. Types only, so it is safe to import on the client.
// The response is newline-delimited JSON: zero or more `status` events, then exactly one
// `results` or `error` event.

export type SearchCourse = {
  id: string;
  title: string;
  slug: string;
  iconUrl: string;
  iconAlt: string;
};

// Every field is read from Sanity after the agent picks the lesson ids. `label` ("3.1")
// and `moduleNumber` are derived from array order, the same way the lesson page does it.
export type LessonResult = {
  kind: "lesson";
  id: string;
  href: string;
  title: string;
  description: string | null;
  keyPoints: string[];
  durationMinutes: number;
  label: string;
  moduleNumber: number;
  moduleTitle: string;
  course: SearchCourse;
};

// Video moments join this union once transcript and chapter ingestion lands.
export type SearchResult = LessonResult;

export type SearchResults = {
  type: "results";
  query: string;
  results: SearchResult[];
  total: number;
  courseCount: number;
  cached: boolean;
};

export type SearchEvent =
  | { type: "status"; message: string }
  | SearchResults
  | { type: "error"; message: string };
