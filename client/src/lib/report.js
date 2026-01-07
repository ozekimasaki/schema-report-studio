import { getCopy } from "./i18n.js";
import {
  buildFieldSections,
  buildMicrodataSections,
  buildRdfaSections,
} from "./formatters.js";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderSectionsHtml(sections, title, labels) {
  if (sections.length === 0) return "";
  const sectionHtml = `<div class="field-preview">
${sections
  .map(
    (section) => `<div class="field-section">
<div class="field-title">${escapeHtml(section.title)}</div>
${section.entries
  .map(
    (entry) => `<div class="field-row">
<span class="field-key">${escapeHtml(entry.key)}</span>
<span class="field-value">${escapeHtml(
      entry.value || labels.emptyValue
    )}</span>
</div>`
  )
  .join("")}
</div>`
  )
  .join("")}
</div>`;
  return `<div class="field-block">
<div class="field-block-title">${escapeHtml(title)}</div>
${sectionHtml}
</div>`;
}

function renderFieldSectionsHtml(row, labels) {
  const blocks = [
    renderSectionsHtml(buildFieldSections(row.nodes), "JSON-LD", labels),
    renderSectionsHtml(buildMicrodataSections(row.microdata, labels), "Microdata", labels),
    renderSectionsHtml(buildRdfaSections(row.rdfa, labels), "RDFa", labels),
  ].filter(Boolean);
  return blocks.join("");
}

function renderFieldSectionsHtmlLegacy(nodes, labels) {
  const sections = buildFieldSections(nodes);
  if (sections.length === 0) return "";
  return `<div class="field-preview">
${sections
  .map(
    (section) => `<div class="field-section">
<div class="field-title">${escapeHtml(section.title)}</div>
${section.entries
  .map(
    (entry) => `<div class="field-row">
<span class="field-key">${escapeHtml(entry.key)}</span>
<span class="field-value">${escapeHtml(
      entry.value || labels.emptyValue
    )}</span>
</div>`
  )
  .join("")}
</div>`
  )
  .join("")}
</div>`;
}

export function createReportHtml(results, generatedAt, theme, lang) {
  const { labels, report } = getCopy(lang);
  const themeVars = {
    editorial: {
      bg: "#fdfcf9",
      ink: "#1f2a2b",
      muted: "#586268",
      line: "#e5e1d8",
      accent: "#1f4b47",
    },
    swiss: {
      bg: "#f6f7fb",
      ink: "#101820",
      muted: "#4b5563",
      line: "#e2e8f0",
      accent: "#0f3d91",
    },
    mono: {
      bg: "#ffffff",
      ink: "#111111",
      muted: "#444444",
      line: "#e5e7eb",
      accent: "#111111",
    },
  }[theme || "editorial"];

  const rows = results
    .map((r) => {
      const types = Object.keys(r.typeCounts || {}).join(", ") || labels.empty;
      const warnings = (r.errors || []).join(" | ") || labels.ok;
      const fieldsHtml =
        renderFieldSectionsHtml(r, labels) ||
        renderFieldSectionsHtmlLegacy(r.nodes, labels);
      return `
        <tr>
          <td>${escapeHtml(r.title || labels.noTitle)}</td>
          <td><a href="${escapeHtml(r.url)}">${escapeHtml(r.url)}</a></td>
          <td>${escapeHtml(types)}</td>
          <td>${fieldsHtml || escapeHtml(labels.empty)}</td>
          <td>${escapeHtml(warnings)}</td>
        </tr>`;
    })
    .join("\n");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(report.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700&family=Noto+Serif+JP:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root { --bg:${themeVars.bg}; --ink:${themeVars.ink}; --muted:${themeVars.muted}; --line:${themeVars.line}; --accent:${themeVars.accent}; }
  body { font-family: "Noto Sans JP", "Public Sans", Arial, sans-serif; color: var(--ink); margin: 32px; background: var(--bg); }
  h1 { font-family: "Noto Serif JP", "Libre Bodoni", Georgia, serif; margin-bottom: 6px; }
  .meta { color: var(--muted); margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { padding: 10px; border-bottom: 1px solid var(--line); vertical-align: top; }
  th { text-align: left; background: #faf7f0; }
  .field-preview { display: grid; gap: 6px; }
  .field-section { border: 1px dashed var(--line); border-radius: 10px; padding: 8px; background: #fff; }
  .field-title { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
  .field-row { display: grid; grid-template-columns: 140px 1fr; gap: 8px; font-size: 12px; }
  .field-key { font-weight: 600; color: var(--ink); word-break: break-word; }
  .field-value { color: var(--muted); word-break: break-word; white-space: pre-wrap; }
  .field-preview-text { font-size: 12px; color: var(--ink); }
  .field-preview-hint { font-size: 11px; color: var(--muted); }
  .field-block { margin-bottom: 12px; }
  .field-block-title { font-size: 12px; font-weight: 600; color: var(--ink); margin-bottom: 6px; }
  a { color: var(--accent); text-decoration: none; }
  @media print { body { margin: 10mm; } }
</style>
</head>
<body>
<h1>${escapeHtml(report.title)}</h1>
<div class="meta">${escapeHtml(report.generatedAt)}: ${escapeHtml(generatedAt)}</div>
<table>
  <thead>
    <tr>
      <th>${escapeHtml(report.tableHeaders[0])}</th>
      <th>${escapeHtml(report.tableHeaders[1])}</th>
      <th>${escapeHtml(report.tableHeaders[2])}</th>
      <th>${escapeHtml(report.tableHeaders[3])}</th>
      <th>${escapeHtml(report.tableHeaders[4])}</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>
</body>
</html>`;
}
