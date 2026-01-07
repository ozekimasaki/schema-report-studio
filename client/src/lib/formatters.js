import { getCopy } from "./i18n.js";

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
  const withMicrodata = results.filter((r) => r.microdata?.length).length;
  const withRdfa = results.filter((r) => r.rdfa?.length).length;
  const errors = results.filter((r) => r.errors?.length).length;
  return { total, ok, withJsonLd, withMicrodata, withRdfa, errors };
}

function getLabels(labels) {
  if (labels) return labels;
  return getCopy("ja").labels;
}

export function formatNodeType(node) {
  const t = node?.["@type"];
  if (!t) return "Item";
  return Array.isArray(t) ? t.join(", ") : t;
}

function formatTypeLabel(value) {
  if (!value) return "";
  const raw = String(value);
  const hashIndex = raw.lastIndexOf("#");
  const slashIndex = raw.lastIndexOf("/");
  const cutIndex = Math.max(hashIndex, slashIndex);
  if (cutIndex >= 0 && cutIndex < raw.length - 1) {
    return raw.slice(cutIndex + 1);
  }
  return raw;
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

export function summarizeFieldKeys(nodes, maxKeys = 4, labels) {
  const copyLabels = getLabels(labels);
  const sections = buildFieldSections(nodes);
  if (sections.length === 0) return copyLabels.empty;
  const keys = [];
  for (const section of sections) {
    for (const entry of section.entries) {
      if (!keys.includes(entry.key)) keys.push(entry.key);
      if (keys.length >= maxKeys) break;
    }
    if (keys.length >= maxKeys) break;
  }
  if (keys.length === 0) return copyLabels.empty;
  return keys.length >= maxKeys
    ? `${keys.join(", ")} ${copyLabels.moreSuffix}`
    : keys.join(", ");
}

export function formatFieldsText(nodes, labels) {
  const copyLabels = getLabels(labels);
  const sections = buildFieldSections(nodes);
  if (sections.length === 0) return "";
  return sections
    .map((section) => {
      const lines = section.entries.map(
        (entry) => `${entry.key}: ${entry.value || copyLabels.emptyValue}`
      );
      return `${section.title}
${lines.join("
")}`;
    })
    .join("

");
}

function formatDisplayValue(value, labels) {
  const copyLabels = getLabels(labels);
  if (Array.isArray(value)) {
    return value.map((item) => formatDisplayValue(item, labels)).join(" / ");
  }
  if (value && typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  if (value === null || value === undefined || value === "") {
    return copyLabels.emptyValue;
  }
  return String(value);
}

export function buildMicrodataSections(items, labels) {
  if (!Array.isArray(items) || items.length === 0) return [];
  return items.map((item, index) => {
    const types = item.itemtype?.length
      ? item.itemtype.map(formatTypeLabel).join(", ")
      : "Microdata";
    const title = `#${index + 1} ${types}`;
    const entries = Object.entries(item.properties || {}).map(([key, value]) => ({
      key,
      value: formatDisplayValue(value, labels),
    }));
    if (item.itemid) {
      entries.unshift({ key: "itemid", value: item.itemid });
    }
    return { title, entries };
  });
}

export function buildRdfaSections(items, labels) {
  if (!Array.isArray(items) || items.length === 0) return [];
  return items.map((item, index) => {
    const types = item.typeof?.length ? item.typeof.join(", ") : "RDFa";
    const title = `#${index + 1} ${types}`;
    const entries = [];
    if (item.subject) entries.push({ key: "subject", value: item.subject });
    if (item.vocab) entries.push({ key: "vocab", value: item.vocab });
    if (item.prefix) entries.push({ key: "prefix", value: item.prefix });
    for (const [key, value] of Object.entries(item.properties || {})) {
      entries.push({ key, value: formatDisplayValue(value, labels) });
    }
    return { title, entries };
  });
}

export function summarizeMicrodataKeys(items, maxKeys = 4, labels) {
  const copyLabels = getLabels(labels);
  const sections = buildMicrodataSections(items, labels);
  if (sections.length === 0) return copyLabels.empty;
  const keys = [];
  for (const section of sections) {
    for (const entry of section.entries) {
      if (!keys.includes(entry.key)) keys.push(entry.key);
      if (keys.length >= maxKeys) break;
    }
    if (keys.length >= maxKeys) break;
  }
  if (keys.length === 0) return copyLabels.empty;
  return keys.length >= maxKeys
    ? `${keys.join(", ")} ${copyLabels.moreSuffix}`
    : keys.join(", ");
}

export function summarizeRdfaKeys(items, maxKeys = 4, labels) {
  const copyLabels = getLabels(labels);
  const sections = buildRdfaSections(items, labels);
  if (sections.length === 0) return copyLabels.empty;
  const keys = [];
  for (const section of sections) {
    for (const entry of section.entries) {
      if (!keys.includes(entry.key)) keys.push(entry.key);
      if (keys.length >= maxKeys) break;
    }
    if (keys.length >= maxKeys) break;
  }
  if (keys.length === 0) return copyLabels.empty;
  return keys.length >= maxKeys
    ? `${keys.join(", ")} ${copyLabels.moreSuffix}`
    : keys.join(", ");
}
