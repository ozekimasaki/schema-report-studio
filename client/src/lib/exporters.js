import { getCopy } from "./i18n.js";
import {
  buildMicrodataSections,
  buildRdfaSections,
  formatFieldsText,
} from "./formatters.js";

function formatSectionsText(sections, labels) {
  if (!sections.length) return "";
  return sections
    .map((section) => {
      const lines = section.entries.map(
        (entry) => `${entry.key}: ${entry.value || labels.emptyValue}`
      );
      return `${section.title}\n${lines.join("\n")}`;
    })
    .join("\n\n");
}

export function createCsv(results, lang) {
  const { labels, csv } = getCopy(lang);
  const headers = csv.headers;
  const lines = [headers];
  for (const row of results) {
    const types = Object.keys(row.typeCounts || {}).join(", ");
    const warnings = row.errors?.length ? row.errors.join(" | ") : labels.ok;
    lines.push([
      row.title || "",
      row.url || "",
      types,
      formatFieldsText(row.nodes, labels),
      formatSectionsText(buildMicrodataSections(row.microdata, labels), labels),
      formatSectionsText(buildRdfaSections(row.rdfa, labels), labels),
      warnings,
      row.ok ? csv.statusOk : labels.statusError,
      String(row.timeMs || 0),
    ]);
  }
  return lines
    .map((line) =>
      line
        .map((value) => `"${String(value || "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\r\n");
}

export function downloadBlob(filename, data, type) {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
