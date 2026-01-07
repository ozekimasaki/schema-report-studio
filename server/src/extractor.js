export const LIMITS = {
  maxUrls: 200,
  concurrency: 5,
  timeoutMs: 12000,
};

export function normalizeUrl(value) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function buildEmptyResult(url, message) {
  return {
    url,
    ok: false,
    title: "",
    nodes: [],
    typeCounts: {},
    sampleField: "",
    errors: [message],
    timeMs: 0,
  };
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].replace(/\s+/g, " ").trim() : "";
}

function extractJsonLd(html) {
  const scripts = [];
  const re = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match = null;
  while ((match = re.exec(html))) {
    scripts.push(match[1]);
  }
  return scripts;
}

function cleanJson(s) {
  return String(s || "")
    .replace(/^\s*<!--/, "")
    .replace(/-->\s*$/, "")
    .trim();
}

function toNodes(parsed) {
  if (!parsed) return [];
  if (Array.isArray(parsed)) return parsed.flatMap(toNodes);
  if (parsed["@graph"]) return toNodes(parsed["@graph"]);
  return [parsed];
}

function typeList(node) {
  const t = node?.["@type"];
  if (!t) return [];
  return Array.isArray(t) ? t : [t];
}

function summarize(nodes) {
  const typeCounts = {};
  for (const node of nodes) {
    for (const t of typeList(node)) {
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    }
  }
  return typeCounts;
}

async function fetchHtml(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "StructuredDataReportBot/1.0",
        accept: "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }

    const html = await res.text();
    return { ok: true, html };
  } catch (err) {
    return { ok: false, error: err?.message || "取得に失敗しました。" };
  } finally {
    clearTimeout(timer);
  }
}

function buildSampleField(node) {
  return (
    node?.name ||
    node?.headline ||
    node?.description ||
    node?.url ||
    ""
  );
}

export async function extractFromUrl(url, timeoutMs) {
  const startedAt = Date.now();
  const result = {
    url,
    ok: true,
    title: "",
    nodes: [],
    typeCounts: {},
    sampleField: "",
    errors: [],
    timeMs: 0,
  };

  const { ok, html, error } = await fetchHtml(url, timeoutMs);
  if (!ok) {
    result.ok = false;
    result.errors.push(error || "取得に失敗しました。");
    result.timeMs = Date.now() - startedAt;
    return result;
  }

  result.title = extractTitle(html);
  const scripts = extractJsonLd(html);
  if (scripts.length === 0) {
    result.errors.push("JSON-LDが見つかりませんでした。");
  }

  for (const raw of scripts) {
    const cleaned = cleanJson(raw);
    try {
      const parsed = JSON.parse(cleaned);
      result.nodes.push(...toNodes(parsed));
    } catch {
      result.errors.push("JSON-LDのJSON解析に失敗しました。");
    }
  }

  result.typeCounts = summarize(result.nodes);
  result.sampleField = buildSampleField(result.nodes[0]);
  result.timeMs = Date.now() - startedAt;
  return result;
}

export async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await mapper(items[current], current);
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

export function prepareUrls(rawUrls) {
  return rawUrls
    .map((url) => String(url || "").trim())
    .filter((url) => url.length > 0)
    .slice(0, LIMITS.maxUrls)
    .map((input) => ({
      input,
      url: normalizeUrl(input),
    }));
}
