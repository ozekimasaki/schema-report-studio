import { Hono } from "hono";
import {
  LIMITS,
  buildEmptyResult,
  extractFromUrl,
  mapWithConcurrency,
  prepareUrls,
} from "./extractor.js";

const app = new Hono();

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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return app.fetch(request, env, ctx);
    }
    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) {
      return assetResponse;
    }
    const fallbackUrl = new URL(request.url);
    fallbackUrl.pathname = "/index.html";
    return env.ASSETS.fetch(fallbackUrl);
  },
};
