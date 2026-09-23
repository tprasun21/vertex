import "server-only";

import type { QueryParams } from "next-sanity";

import { client } from "./client";

const DEFAULT_REVALIDATE_SECONDS = 60;

// Cached, tagged read. Tags let a future webhook call revalidateTag(<_type>).
export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  tags,
}: {
  query: QueryString;
  params?: QueryParams;
  tags: string[];
}) {
  return client.fetch(query, params, {
    next: { revalidate: DEFAULT_REVALIDATE_SECONDS, tags },
  });
}
