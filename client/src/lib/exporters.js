import { LABELS } from "./constants.js";
import {
  buildMicrodataSections,
  buildRdfaSections,
  formatFieldsText,
} from "./formatters.js";

function formatSectionsText(sections) {
  if (!sections.length) return "";
  return sections
    .map((section) => {
      const lines = section.entries.map(
        (entry) => `${entry.key}: ${entry.value || LABELS.emptyValue}`
      );
      return `${section.title}\n${lines.join("\n")}`;
    })
    .join("\n\n");
}

export function createCsv(results) {
  const headers = [
    "タイトル",
    "URL",
    "タイプ",
    "項目一覧",
    "Microdata",
    "RDFa",
    "警告",
    "ステータス",
    "処理時間(ms)",
  ];
  const lines = [headers];
  for (const row of results) {
    const types = Object.keys(row.typeCounts || {}).join(", ");
    const warnings = row.errors?.length ? row.errors.join(" | ") : LABELS.ok;
    lines.push([
      row.title || "",
      row.url || "",
      types,
      formatFieldsText(row.nodes),
      formatSectionsText(buildMicrodataSections(row.microdata)),
      formatSectionsText(buildRdfaSections(row.rdfa)),
      warnings,
      row.ok ? "OK" : LABELS.statusError,
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
