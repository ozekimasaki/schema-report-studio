import { LABELS } from "./constants.js";

export function parseUrls(input) {
  return input
    .split(/\r?\n|\s+/)
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export function summarizeResults(results) {
  const total = results.length;
  const ok = results.filter((r) => r.ok).length;
  const withJsonLd = results.filter((r) => r.nodes?.length).length;
  const errors = results.filter((r) => r.errors?.length).length;
  return { total, ok, withJsonLd, errors };
}

export function formatNodeType(node) {
  const t = node?.["@type"];
  if (!t) return "Item";
  return Array.isArray(t) ? t.join(", ") : t;
}

export function formatFieldValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value, null, 2);
}

export function buildFieldSections(nodes) {
  if (!Array.isArray(nodes) || nodes.length === 0) return [];
  const hiddenKeys = new Set(["@context"]);
  return nodes.map((node, index) => {
    const entries = Object.entries(node || {})
      .filter(([key]) => !hiddenKeys.has(key))
      .map(([key, value]) => ({
        key,
        value: formatFieldValue(value),
      }));
    return {
      title: `#${index + 1} ${formatNodeType(node)}`,
      entries,
    };
  });
}

export function summarizeFieldKeys(nodes, maxKeys = 4) {
  const sections = buildFieldSections(nodes);
  if (sections.length === 0) return LABELS.empty;
  const keys = [];
  for (const section of sections) {
    for (const entry of section.entries) {
      if (!keys.includes(entry.key)) keys.push(entry.key);
      if (keys.length >= maxKeys) break;
    }
    if (keys.length >= maxKeys) break;
  }
  if (keys.length === 0) return LABELS.empty;
  return keys.length >= maxKeys ? `${keys.join(", ")} ほか` : keys.join(", ");
}

export function formatFieldsText(nodes) {
  const sections = buildFieldSections(nodes);
  if (sections.length === 0) return "";
  return sections
    .map((section) => {
      const lines = section.entries.map(
        (entry) => `${entry.key}: ${entry.value || LABELS.emptyValue}`
      );
      return `${section.title}\n${lines.join("\n")}`;
    })
    .join("\n\n");
}

function formatDisplayValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => formatDisplayValue(item)).join(" / ");
  }
  if (value && typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  if (value === null || value === undefined || value === "") {
    return LABELS.emptyValue;
  }
  return String(value);
}

export function buildMicrodataSections(items) {
  if (!Array.isArray(items) || items.length === 0) return [];
  return items.map((item, index) => {
    const types = item.itemtype?.length ? item.itemtype.join(", ") : "Microdata";
    const title = `#${index + 1} ${types}`;
    const entries = Object.entries(item.properties || {}).map(([key, value]) => ({
      key,
      value: formatDisplayValue(value),
    }));
    if (item.itemid) {
      entries.unshift({ key: "itemid", value: item.itemid });
    }
    return { title, entries };
  });
}

export function buildRdfaSections(items) {
  if (!Array.isArray(items) || items.length === 0) return [];
  return items.map((item, index) => {
    const types = item.typeof?.length ? item.typeof.join(", ") : "RDFa";
    const title = `#${index + 1} ${types}`;
    const entries = [];
    if (item.subject) entries.push({ key: "subject", value: item.subject });
    if (item.vocab) entries.push({ key: "vocab", value: item.vocab });
    if (item.prefix) entries.push({ key: "prefix", value: item.prefix });
    for (const [key, value] of Object.entries(item.properties || {})) {
      entries.push({ key, value: formatDisplayValue(value) });
    }
    return { title, entries };
  });
}

export function summarizeMicrodataKeys(items, maxKeys = 4) {
  const sections = buildMicrodataSections(items);
  if (sections.length === 0) return LABELS.empty;
  const keys = [];
  for (const section of sections) {
    for (const entry of section.entries) {
      if (!keys.includes(entry.key)) keys.push(entry.key);
      if (keys.length >= maxKeys) break;
    }
    if (keys.length >= maxKeys) break;
  }
  if (keys.length === 0) return LABELS.empty;
  return keys.length >= maxKeys ? `${keys.join(", ")} ほか` : keys.join(", ");
}

export function summarizeRdfaKeys(items, maxKeys = 4) {
  const sections = buildRdfaSections(items);
  if (sections.length === 0) return LABELS.empty;
  const keys = [];
  for (const section of sections) {
    for (const entry of section.entries) {
      if (!keys.includes(entry.key)) keys.push(entry.key);
      if (keys.length >= maxKeys) break;
    }
    if (keys.length >= maxKeys) break;
  }
  if (keys.length === 0) return LABELS.empty;
  return keys.length >= maxKeys ? `${keys.join(", ")} ほか` : keys.join(", ");
}
