import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import {
  LIMITS,
  buildEmptyResult,
  extractFromUrl,
  mapWithConcurrency,
  prepareUrls,
} from "./extractor.js";

const app = new Hono();
const port = Number(process.env.PORT || 8787);

app.use("/api/*", cors());

app.get("/api/health", (c) => c.json({ ok: true }));

app.post("/api/extract", async (c) => {
  let body = null;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "JSONが不正です。" }, 400);
  }

  const urls = Array.isArray(body?.urls) ? body.urls : [];
  const entries = prepareUrls(urls);

  if (entries.length === 0) {
    return c.json({ error: "URLが指定されていません。" }, 400);
  }

  const results = await mapWithConcurrency(
    entries,
    LIMITS.concurrency,
    async (entry) => {
      if (!entry.url) {
        return buildEmptyResult(entry.input, "無効なURLです。");
      }
      return extractFromUrl(entry.url, LIMITS.timeoutMs);
    }
  );

  return c.json({
    generatedAt: new Date().toISOString(),
    count: results.length,
    results,
  });
});

serve({ fetch: app.fetch, port });
console.log(`Hono server running on http://localhost:${port}`);
