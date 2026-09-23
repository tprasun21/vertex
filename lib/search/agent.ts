import "server-only";

import { createMCPClient, type MCPClient } from "@ai-sdk/mcp";
import { openai } from "@ai-sdk/openai";
import { generateText, isStepCount, Output } from "ai";
import { z } from "zod";

import { buildSearchPrompt } from "./prompt";

const DEFAULT_MODEL = "gpt-5.4-mini";
// Tool calls plus the final structured-output step.
const MAX_STEPS = 8;
const INITIAL_CONTEXT_TTL_MS = 5 * 60 * 1000;

const TOOL_STATUS: Record<string, string> = {
  groq_query: "Searching lessons",
  schema_explorer: "Reading the course catalog",
  array_field_reader: "Reading lesson notes",
};

const agentOutput = z.object({
  lessonIds: z.array(z.string()).describe("Lesson _id values returned by your queries, best match first."),
});

function getConfig() {
  const mcpUrl = process.env.SANITY_CONTEXT_MCP_URL;
  const token = process.env.SANITY_API_READ_TOKEN;
  if (!mcpUrl) throw new Error("Missing environment variable: SANITY_CONTEXT_MCP_URL");
  if (!token) throw new Error("Missing environment variable: SANITY_API_READ_TOKEN");
  if (!process.env.OPENAI_API_KEY) throw new Error("Missing environment variable: OPENAI_API_KEY");
  return { mcpUrl, token, model: process.env.OPENAI_MODEL || DEFAULT_MODEL };
}

let initialContext: string | null = null;
let initialContextFetchedAt = 0;
let initialContextRefresh: Promise<void> | null = null;

// The schema plus the Context document's instructions, fetched over HTTP so the model
// skips an initial_context tool call. Refreshed in the background once stale, so edits
// to the Context document reach the agent within the TTL.
async function getInitialContext(mcpUrl: string, token: string) {
  const stale = Date.now() - initialContextFetchedAt > INITIAL_CONTEXT_TTL_MS;
  if (stale && !initialContextRefresh) {
    const url = new URL(mcpUrl);
    url.pathname = `${url.pathname.replace(/\/$/, "")}/initial-context`;

    initialContextRefresh = fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`initial-context responded ${response.status}`);
        initialContext = await response.text();
        initialContextFetchedAt = Date.now();
      })
      .catch((error) => console.error("[search] initial context fetch failed", error))
      .finally(() => {
        initialContextRefresh = null;
      });
  }

  if (!initialContext && initialContextRefresh) await initialContextRefresh;
  return initialContext;
}

// Lets the model write GROQ through the Sanity Context MCP and returns the lesson ids it
// picked, ranked. The ids are not trusted: callers hydrate them from Sanity.
export async function findLessonIds(
  query: string,
  { signal, onStatus }: { signal: AbortSignal; onStatus: (message: string) => void },
) {
  const { mcpUrl, token, model } = getConfig();
  let mcpClient: MCPClient | null = null;

  try {
    const [client, context] = await Promise.all([
      createMCPClient({ transport: { type: "http", url: mcpUrl, headers: { Authorization: `Bearer ${token}` } } }),
      getInitialContext(mcpUrl, token),
    ]);
    mcpClient = client;

    const tools = { ...(await client.tools()) };
    // The schema is already in the prompt; keep the tool only if that fetch failed.
    if (context) delete tools.initial_context;

    const { output } = await generateText({
      model: openai(model),
      reasoning: "low",
      system: buildSearchPrompt(context),
      prompt: `Search query: ${JSON.stringify(query)}`,
      tools,
      output: Output.object({ schema: agentOutput }),
      stopWhen: isStepCount(MAX_STEPS),
      abortSignal: signal,
      onToolExecutionStart: ({ toolCall }) => onStatus(TOOL_STATUS[toolCall.toolName] ?? "Searching lessons"),
    });

    return output.lessonIds;
  } finally {
    await mcpClient?.close().catch(() => {});
  }
}
