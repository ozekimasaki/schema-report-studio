import { parseHTML } from "linkedom";

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
    microdata: [],
    rdfa: [],
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

async function fetchHtml(url, timeoutMs, fetcher = fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetcher(url, {
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

export async function extractFromUrl(url, options = {}) {
  const { timeoutMs = LIMITS.timeoutMs, fetcher } = options;
  const startedAt = Date.now();
  const result = {
    url,
    ok: true,
    title: "",
    nodes: [],
    microdata: [],
    rdfa: [],
    typeCounts: {},
    sampleField: "",
    errors: [],
    timeMs: 0,
  };

  const { ok, html, error } = await fetchHtml(url, timeoutMs, fetcher);
  if (!ok) {
    result.ok = false;
    result.errors.push(error || "取得に失敗しました。");
    result.timeMs = Date.now() - startedAt;
    return result;
  }

  result.title = extractTitle(html);
  const scripts = extractJsonLd(html);

  for (const raw of scripts) {
    const cleaned = cleanJson(raw);
    try {
      const parsed = JSON.parse(cleaned);
      result.nodes.push(...toNodes(parsed));
    } catch {
      result.errors.push("JSON-LDのJSON解析に失敗しました。");
    }
  }

  try {
    result.microdata = extractMicrodata(html);
  } catch {
    result.errors.push("Microdataの解析に失敗しました。");
  }

  try {
    result.rdfa = extractRdfa(html);
  } catch {
    result.errors.push("RDFaの解析に失敗しました。");
  }

  if (
    result.nodes.length === 0 &&
    result.microdata.length === 0 &&
    result.rdfa.length === 0
  ) {
    result.errors.push("構造化データが見つかりませんでした。");
  }

  result.typeCounts = summarize(result.nodes);
  result.sampleField = buildSampleField(result.nodes[0]);
  result.timeMs = Date.now() - startedAt;
  return result;
}

function extractMicrodata(html) {
  const { document } = parseHTML(html);
  const itemElements = Array.from(document.querySelectorAll("[itemscope]"))
    .filter((el) => !el.parentElement?.closest("[itemscope]"));
  return itemElements.map((el) => parseMicrodataItem(el, document));
}

function parseMicrodataItem(itemEl, document) {
  const itemtype = splitAttr(itemEl.getAttribute("itemtype"));
  const itemid = itemEl.getAttribute("itemid") || "";
  const properties = {};

  const containers = [itemEl];
  const itemref = splitAttr(itemEl.getAttribute("itemref"));
  for (const ref of itemref) {
    const refEl = document.getElementById(ref);
    if (refEl) containers.push(refEl);
  }

  for (const container of containers) {
    collectMicrodataProperties(container, itemEl, properties, document);
  }

  return { itemtype, itemid, properties };
}

function collectMicrodataProperties(container, rootItem, properties, document) {
  const stack = [container];
  while (stack.length) {
    const el = stack.pop();
    if (!el || el === rootItem) {
      stack.push(...Array.from(el?.children || []));
      continue;
    }

    const isItemScope = el.hasAttribute("itemscope");
    const hasItemProp = el.hasAttribute("itemprop");

    if (isItemScope && !hasItemProp) {
      continue;
    }

    if (hasItemProp) {
      const propNames = splitAttr(el.getAttribute("itemprop"));
      const value = isItemScope
        ? parseMicrodataItem(el, document)
        : extractMicrodataValue(el);
      for (const name of propNames) {
        if (!properties[name]) properties[name] = [];
        properties[name].push(value);
      }
      if (isItemScope) {
        continue;
      }
    }

    stack.push(...Array.from(el.children));
  }
}

function extractMicrodataValue(el) {
  const tag = el.tagName?.toLowerCase?.() || "";
  if (tag === "meta") return el.getAttribute("content") || "";
  if (["audio", "video", "track", "source", "img", "iframe", "embed"].includes(tag)) {
    return el.getAttribute("src") || "";
  }
  if (["a", "area", "link"].includes(tag)) {
    return el.getAttribute("href") || "";
  }
  if (tag === "object") {
    return el.getAttribute("data") || "";
  }
  if (tag === "time") {
    return el.getAttribute("datetime") || el.textContent?.trim() || "";
  }
  return el.textContent?.trim() || "";
}

function extractRdfa(html) {
  const { document } = parseHTML(html);
  const nodes = Array.from(document.querySelectorAll("[property], [typeof]"));
  const entries = [];
  for (const el of nodes) {
    const properties = {};
    const propNames = splitAttr(el.getAttribute("property"));
    const typeofList = splitAttr(el.getAttribute("typeof"));
    const subject =
      el.getAttribute("about") ||
      el.getAttribute("resource") ||
      el.getAttribute("href") ||
      el.getAttribute("src") ||
      (el.getAttribute("id") ? `#${el.getAttribute("id")}` : "");
    const vocab = el.getAttribute("vocab") || "";
    const prefix = el.getAttribute("prefix") || "";

    if (propNames.length > 0) {
      const value = extractRdfaValue(el);
      for (const name of propNames) {
        if (!properties[name]) properties[name] = [];
        properties[name].push(value);
      }
    }

    if (typeofList.length === 0 && propNames.length === 0) continue;

    entries.push({
      subject,
      typeof: typeofList,
      vocab,
      prefix,
      properties,
    });
  }
  return entries;
}

function extractRdfaValue(el) {
  return (
    el.getAttribute("content") ||
    el.getAttribute("resource") ||
    el.getAttribute("href") ||
    el.getAttribute("src") ||
    el.textContent?.trim() ||
    ""
  );
}

function splitAttr(value) {
  return String(value || "")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
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
