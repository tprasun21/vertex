import { z } from "zod";

import { getSearchLessons } from "@/lib/sanity/data";
import { findLessonIds } from "@/lib/search/agent";
import type { SearchEvent, SearchResults } from "@/lib/search/types";

export const maxDuration = 60;

const SEARCH_TIMEOUT_MS = 45_000;
const MAX_LESSON_IDS = 60;
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX_ENTRIES = 100;
// Sanity document ids; published only.
const LESSON_ID = /^(?!drafts\.)[A-Za-z0-9._-]+$/;

const searchRequest = z.object({ query: z.string().trim().min(2).max(120) });

type CachedResults = Omit<SearchResults, "cached">;

// Per-instance cache of verified results, so reloads and repeat queries skip the LLM.
const resultCache = new Map<string, { storedAt: number; value: CachedResults }>();

function readCache(key: string) {
  const entry = resultCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.storedAt > CACHE_TTL_MS) {
    resultCache.delete(key);
    return null;
  }
  return entry.value;
}

function writeCache(key: string, value: CachedResults) {
  resultCache.delete(key);
  resultCache.set(key, { storedAt: Date.now(), value });
  // Maps iterate in insertion order, so the first key is the oldest.
  if (resultCache.size > CACHE_MAX_ENTRIES) resultCache.delete(resultCache.keys().next().value!);
}

// Streams NDJSON: status events while the agent works, then one results or error event.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const parsed = searchRequest.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "query must be a string of 2 to 120 characters." }, { status: 400 });
  }

  const { query } = parsed.data;
  const cacheKey = query.toLowerCase().replace(/\s+/g, " ");
  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(SEARCH_TIMEOUT_MS)]);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: SearchEvent) => {
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {
          // The client disconnected; nothing left to deliver.
        }
      };

      try {
        const cached = readCache(cacheKey);
        if (cached) {
          send({ ...cached, cached: true });
          return;
        }

        send({ type: "status", message: "Understanding your search" });
        const ids = await findLessonIds(query, {
          signal,
          onStatus: (message) => send({ type: "status", message }),
        });

        send({ type: "status", message: "Checking results" });
        const validIds = [...new Set(ids)].filter((id) => LESSON_ID.test(id)).slice(0, MAX_LESSON_IDS);
        const results = await getSearchLessons(validIds);

        const value: CachedResults = {
          type: "results",
          query,
          results,
          total: results.length,
          courseCount: new Set(results.map((result) => result.course.id)).size,
        };
        writeCache(cacheKey, value);
        send({ ...value, cached: false });
      } catch (error) {
        if (request.signal.aborted) return;
        console.error("[search] failed", error);
        const timedOut = signal.reason instanceof DOMException && signal.reason.name === "TimeoutError";
        send({
          type: "error",
          message: timedOut
            ? "Search took too long. Please try again."
            : "Search is unavailable right now. Please try again.",
        });
      } finally {
        try {
          controller.close();
        } catch {
          // Already closed by a disconnect.
        }
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
