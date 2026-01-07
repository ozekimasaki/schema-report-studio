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
